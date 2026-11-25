#!/usr/bin/env python3
# SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
# Copyright (c) Ultrastable
"""BRANCH-CLEANUP-1 (Rowan, 2026-11-25): no branch outlives its pull request in any Ultrastable repository.

For every repository in the org:
  1. enforce the repo setting delete_branch_on_merge=true (reset it when it drifts);
  2. delete every branch whose pull requests are all merged or closed (recoverable from refs/pull/<n>/head);
  3. delete every branch with no pull request once its tip is older than --window-hours, after moving the tip to
     refs/archive/<name> so no unmerged commit is lost.
main, the default branch, *-evidence ledger branches and any branch with an open pull request are never touched.
--check exits 1 when a repo has the setting off or holds a stale branch (the probe). --apply does the work.
"""
import argparse, datetime as dt, json, os, subprocess, sys, urllib.parse

ORG = os.environ.get("BRANCH_CLEANUP_ORG", "ultrastable")


def gh(*args, method="GET", fields=None, paginate=False):
    cmd = ["gh", "api", "-X", method]
    if paginate:
        cmd += ["--paginate", "--slurp"]
    for k, v in (fields or {}).items():
        cmd += ["-F" if isinstance(v, bool) else "-f", f"{k}={str(v).lower() if isinstance(v, bool) else v}"]
    p = subprocess.run(cmd + list(args), capture_output=True, text=True)
    if p.returncode:
        raise RuntimeError(f"{' '.join(args)}: {p.stderr.strip() or p.stdout.strip()}")
    out = p.stdout.strip()
    data = json.loads(out) if out else None
    return [x for page in data for x in page] if paginate and data else data


def repos():
    if os.environ.get("BRANCH_CLEANUP_REPOS"):
        return os.environ["BRANCH_CLEANUP_REPOS"].split()
    return [r["name"] for r in gh(f"orgs/{ORG}/repos?per_page=100&type=all", paginate=True) if not r.get("archived")]


def run(apply, window_h):
    now = dt.datetime.now(dt.timezone.utc)
    stale, errors, done = 0, 0, []
    for name in repos():
        full = f"{ORG}/{name}"
        try:
            meta = gh(f"repos/{full}")
        except RuntimeError as e:  # a repo this token cannot read is unmeasured, never clean; the run goes on to the next repo
            errors += 1
            print(f"::warning::{full}: unreadable with this token: {e}")
            continue
        default = meta["default_branch"]
        if not meta.get("delete_branch_on_merge"):
            stale += 1
            if apply:
                try:
                    gh(f"repos/{full}", method="PATCH", fields={"delete_branch_on_merge": True})
                    done.append(f"{full}: delete_branch_on_merge on")
                except RuntimeError as e:
                    errors += 1
                    print(f"::warning::{full}: setting refused: {e}")
            else:
                print(f"{full}: delete_branch_on_merge is off")
        for b in gh(f"repos/{full}/branches?per_page=100", paginate=True):
            br = b["name"]
            if br in ("main", default) or br.endswith("-evidence"):  # loop-evidence, ciwatch-evidence ...: ledgers loops append to
                continue
            prs = gh(f"repos/{full}/pulls?state=all&per_page=100&head={ORG}:{urllib.parse.quote(br)}")
            if any(p["state"] == "open" for p in prs):
                continue
            sha = b["commit"]["sha"]
            if not prs:
                c = gh(f"repos/{full}/commits/{sha}")
                age = now - dt.datetime.fromisoformat(c["commit"]["committer"]["date"].replace("Z", "+00:00"))
                if age.total_seconds() < window_h * 3600:
                    continue
            stale += 1
            why = "pr " + ",".join(f"#{p['number']}:{'merged' if p.get('merged_at') else 'closed'}" for p in prs) if prs else "no pr"
            if not apply:
                print(f"{full}: stale {br} ({why})")
                continue
            try:
                if not prs:  # unmerged work with no PR keeps its commits under refs/archive/
                    try:
                        gh(f"repos/{full}/git/refs", method="POST", fields={"ref": f"refs/archive/{br}", "sha": sha})
                    except RuntimeError as e:
                        if "already exists" not in str(e):
                            raise
                        gh(f"repos/{full}/git/refs/archive/{br}", method="PATCH", fields={"sha": sha, "force": True})
                gh(f"repos/{full}/git/refs/heads/{urllib.parse.quote(br)}", method="DELETE")
                done.append(f"{full}: deleted {br} ({why})")
            except RuntimeError as e:
                errors += 1
                print(f"::warning::{full}: {br}: {e}")
    for d in done:
        print(d)
    print(json.dumps({"stale_before": stale, "fixed": len(done), "errors": errors}))
    return 1 if (stale and not apply) or errors else 0


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("--apply", action="store_true")
    a.add_argument("--check", action="store_true")
    a.add_argument("--window-hours", type=float, default=float(os.environ.get("BRANCH_WINDOW_HOURS", 6)))
    o = a.parse_args()
    sys.exit(run(o.apply, o.window_hours))
