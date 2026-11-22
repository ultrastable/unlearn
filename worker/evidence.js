// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// The evidence loop behind the encyclopedia, in the shape of Practical Solutions' source checks and candidate search:
//   1. resolve every cited source to a DOI through Crossref, accepted only when the title and year match (a wrong match is worse than none);
//   2. watch Europe PMC for new systematic reviews and meta-analyses on each entry's query since the entry was last checked;
//   3. flag an entry for review when new reviews pile up, so the evidence under it is never frozen.
// Pure functions take an injected fetch, so tests run with no network. The beat (index.js) calls checkEntries with a small batch each hour.
import { ENTRIES } from "./entries.js";

export const EVIDENCE = {
  batch: 3,                 // entries checked per beat: 30 entries are each re-checked about every 10 hours
  recheck_days: 7,          // freshness: every entry must have been checked within this many days (GET /api/freshness)
  retry_unresolved_days: 14,
  review_after_leads: 3,    // an entry with this many unreviewed new reviews is flagged for re-grading
  ua: "unlearn-evidence-loop/1 (+https://unlearn.ultrastable.org/how)"
};

const words = s => String(s || "").toLowerCase().replace(/<[^>]+>/g, " ").split(/[^a-z0-9]+/).filter(w => w.length > 2);
// Share of the cited title's words found in the candidate title: 1 when every word matches.
export function titleMatch(cited, found) {
  const a = words(cited), b = new Set(words(found));
  if (!a.length) return 0;
  return a.filter(w => b.has(w)).length / a.length;
}

export function sourceKey(entryId, i) { return entryId + "#" + i; }

// Crossref bibliographic search. Returns { doi, title, year } when the best hit matches, else null with the reason.
export async function resolveSource(src, fetchFn) {
  const q = [src.title, src.authors, src.venue, src.year].join(" ");
  const url = "https://api.crossref.org/works?rows=3&select=DOI,title,issued,container-title&query.bibliographic=" + encodeURIComponent(q.slice(0, 300));
  const r = await fetchFn(url, { headers: { "user-agent": EVIDENCE.ua, accept: "application/json" } });
  if (!r.ok) throw new Error("crossref " + r.status);
  const j = await r.json();
  const items = (j && j.message && j.message.items) || [];
  for (const it of items) {
    const title = Array.isArray(it.title) ? it.title[0] : it.title;
    const yr = it.issued && it.issued["date-parts"] && it.issued["date-parts"][0] && it.issued["date-parts"][0][0];
    if (titleMatch(src.title, title) >= 0.8 && (!yr || Math.abs(Number(yr) - src.year) <= 1)) return { doi: String(it.DOI).toLowerCase(), title, year: yr || null };
  }
  return null;
}

// Europe PMC: reviews and meta-analyses on the entry's query first published on or after `since` (YYYY-MM-DD).
export async function findLeads(entry, since, fetchFn) {
  const q = `(${entry.query}) AND (PUB_TYPE:"systematic-review" OR PUB_TYPE:"meta-analysis" OR TITLE:"meta-analysis" OR TITLE:"systematic review") AND FIRST_PDATE:[${since} TO 3000-01-01]`;
  const url = "https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=5&sort=FIRST_PDATE_D%20desc&query=" + encodeURIComponent(q);
  const r = await fetchFn(url, { headers: { "user-agent": EVIDENCE.ua, accept: "application/json" } });
  if (!r.ok) throw new Error("europepmc " + r.status);
  const j = await r.json();
  const list = (j && j.resultList && j.resultList.result) || [];
  return list.map(x => ({ ref: x.doi ? "doi:" + String(x.doi).toLowerCase() : x.pmid ? "pmid:" + x.pmid : "epmc:" + x.id, title: String(x.title || "").slice(0, 400),
    venue: String(x.journalTitle || (x.journalInfo && x.journalInfo.journal && x.journalInfo.journal.title) || "").slice(0, 200), year: Number(x.pubYear) || null,
    abstract: x.abstractText ? String(x.abstractText).replace(/<[^>]+>/g, " ").slice(0, 4000) : null,
    url: x.doi ? "https://doi.org/" + x.doi : x.pmid ? "https://europepmc.org/article/MED/" + x.pmid : "https://europepmc.org/search?query=" + encodeURIComponent(x.title || "") }))
    // a lead that is already one of the entry's own sources is not new evidence
    .filter(l => !entry.sources.some(s => titleMatch(s.title, l.title) >= 0.8));
}

// Which entries the beat should check now: never checked first, then the oldest check.
export function pickBatch(checked, n = EVIDENCE.batch, entries = ENTRIES) {
  return [...entries].sort((a, b) => (checked[a.id] || 0) - (checked[b.id] || 0) || a.id.localeCompare(b.id)).slice(0, n);
}

// One beat of the evidence loop against D1. Each step records its own failure and the loop goes on: a failed source stays unresolved and is
// retried, a failed search leaves the entry's check time unchanged so it is picked first next time.
export async function checkEntries(db, now, fetchFn, entries = ENTRIES) {
  const rows = (await db.prepare("SELECT entry, at FROM evidence_checks").all()).results || [];
  const checked = Object.fromEntries(rows.map(r => [r.entry, r.at]));
  const out = { checked: [], resolved: 0, leads: 0, errors: [] };
  const srcRows = (await db.prepare("SELECT key, doi, tried FROM sources").all()).results || [];
  const known = Object.fromEntries(srcRows.map(r => [r.key, r]));
  for (const e of pickBatch(checked, EVIDENCE.batch, entries)) {
    let ok = true;
    for (let i = 0; i < e.sources.length; i++) {
      const k = sourceKey(e.id, i), row = known[k];
      if (row && (row.doi || now - row.tried < EVIDENCE.retry_unresolved_days * 86400000)) continue;
      try {
        const hit = await resolveSource(e.sources[i], fetchFn);
        await db.prepare("INSERT INTO sources (key, entry, doi, found_title, tried) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT(key) DO UPDATE SET doi=excluded.doi, found_title=excluded.found_title, tried=excluded.tried")
          .bind(k, e.id, hit ? hit.doi : null, hit ? String(hit.title).slice(0, 400) : null, now).run();
        if (hit) out.resolved++;
      } catch (err) { out.errors.push(e.id + " source " + i + ": " + (err && err.message)); }
    }
    const since = new Date((checked[e.id] || Date.UTC(2024, 0, 1))).toISOString().slice(0, 10);
    try {
      const leads = await findLeads(e, since, fetchFn);
      for (const l of leads) {
        const r = await db.prepare("INSERT OR IGNORE INTO leads (entry, ref, title, venue, year, url, found, abstract) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)").bind(e.id, l.ref, l.title, l.venue, l.year, l.url, now, l.abstract).run();
        out.leads += (r.meta && r.meta.changes) || 0;
      }
    } catch (err) { ok = false; out.errors.push(e.id + " leads: " + (err && err.message)); }
    if (ok) {
      await db.prepare("INSERT INTO evidence_checks (entry, at) VALUES (?1, ?2) ON CONFLICT(entry) DO UPDATE SET at=excluded.at").bind(e.id, now).run();
      out.checked.push(e.id);
    }
  }
  return out;
}

// Freshness in the Practical Solutions shape (PAGES-FRESH-1): 200 when every entry was checked inside recheck_days, 503 otherwise.
export function freshness(checked, now, entries = ENTRIES) {
  const max = EVIDENCE.recheck_days * 86400000;
  const stale = entries.filter(e => !checked[e.id] || now - checked[e.id] > max).map(e => e.id);
  const ages = entries.map(e => checked[e.id] ? (now - checked[e.id]) / 3600000 : null).filter(x => x !== null);
  return { ok: stale.length === 0, entries: entries.length, checked: entries.length - stale.length, stale, oldest_check_hours: ages.length ? Math.round(Math.max(...ages)) : null,
    max_age_hours: EVIDENCE.recheck_days * 24, checked_at: new Date(now).toISOString() };
}

// Entries whose evidence may have moved: challenged by classified new reviews (lab.js regrade), or holding enough new reviews that no model
// has classified yet.
export function reviewQueue(leadCounts, entries = ENTRIES, grades = {}) {
  return entries.filter(e => (grades[e.id] && grades[e.id].status === "challenged") || (leadCounts[e.id] || 0) >= EVIDENCE.review_after_leads)
    .map(e => ({ entry: e.id, reason: grades[e.id] && grades[e.id].status === "challenged" ? "challenged" : "unclassified reviews", new_reviews: leadCounts[e.id] || 0, strength: e.strength, direction: e.direction, grade: grades[e.id] || null }));
}
