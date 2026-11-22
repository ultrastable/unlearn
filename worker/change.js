// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// Change mechanics (UNLEARN-CHANGE-1). Everything personal runs in the reader's browser (site.js PLAN_JS): the plan, daily check-ins,
// reflections. The server only counts anonymous events per practice, and learns from them which suggested if-then plan readers keep.
// The mechanics follow the practices themselves: if-then plans (Gollwitzer and Sheeran 2006), tracking the action (Harkin et al. 2016),
// a habit horizon of about two months with no penalty for a missed day (Lally et al. 2010), check-ins spaced further apart over time,
// naming the obstacle and planning for it, and an optional commitment to one other person (Giné, Karlan and Zinman 2010).

export const CHANGE = {
  review_days: [3, 7, 14, 30, 66],  // spaced reflections, counted from the day a plan starts
  habit_days: 66,                    // "keep going" extends a trial to the median habit time in Lally et al. (2010)
  min_shown: 10                      // reader counts are shown only once at least this many plans started
};

// What got in the way, and the evidence-backed adjustment for each. Shown at each spaced reflection.
export const REASONS = [
  { id: "working", label: "It is working", tip: "Keep the same cue. Repetition after the same cue is what turns an action into a habit; a missed day does not undo it." },
  { id: "forgot", label: "I keep forgetting", tip: "Tie the action to a cue that already happens every day, like a meal or brushing your teeth, and add a calendar reminder for the first weeks." },
  { id: "time", label: "No time", tip: "Shrink it until it takes two minutes. A tiny action you do beats a big one you skip, and you can grow it once it is automatic." },
  { id: "mood", label: "I don't feel like it", tip: "Plan for the feeling with a second if-then: \"If I don't feel like it, I will do just the first step.\" Pairing it with something you enjoy can help too." },
  { id: "cue", label: "The moment never came", tip: "Your cue was not reliable. Pick a moment that happens every day whatever else happens." }
];

export const EVENTS = ["start", "done", "partly", "miss", "keep", "change", "stop", ...REASONS.map(r => "r:" + r.id)];
// Validate an anonymous event from the page. Returns the counter key, or null.
export function eventKey(entry, event, plan) {
  if (!entry || !entry.change || !EVENTS.includes(event)) return null;
  if (["start", "keep", "stop"].includes(event)) {
    const i = plan === "own" ? "own" : Number.isInteger(plan) && plan >= 0 && plan < entry.change.plans.length ? String(plan) : null;
    return i === null ? "plan:" + event : "plan:" + event + ":" + i;
  }
  return "plan:" + event;
}

// Order suggested plans by how often readers who picked them chose to keep going, with a prior so a new plan is not buried
// (keep + 1) / (start + 2). Original indices are kept so events still name the plan as written.
export function rankPlans(kit, counts = {}) {
  return kit.plans.map((p, i) => ({ i, when: p[0], then: p[1], started: counts["plan:start:" + i] || 0, kept: counts["plan:keep:" + i] || 0 }))
    .map(x => ({ ...x, score: (x.kept + 1) / (x.started + 2) }))
    .sort((a, b) => b.score - a.score || a.i - b.i);
}

// Per-practice totals from reader_counts rows, for /change and the metrics.
export function practiceStats(rows, entries) {
  const out = {};
  for (const r of rows) {
    if (!r.key.startsWith("plan:")) continue;
    const e = entries[r.entry]; if (!e || !e.change) continue;
    const s = out[r.entry] = out[r.entry] || { started: 0, kept: 0, stopped: 0, done: 0, missed: 0 };
    const k = r.key.split(":")[1];
    if (k === "start") s.started += r.n; else if (k === "keep") s.kept += r.n; else if (k === "stop") s.stopped += r.n;
    else if (k === "done" || k === "partly") s.done += r.n; else if (k === "miss") s.missed += r.n;
  }
  return out;
}

// A calendar file for a daily reminder, built in the browser from the reader's own plan. Exported for tests; PLAN_JS carries a copy.
export function ics(title, when, then, startDate, days) {
  const d = String(startDate).replace(/-/g, "");
  const clean = s => String(s).replace(/[\\;,]/g, m => "\\" + m).replace(/\n/g, " ");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Unlearn//Plan//EN", "BEGIN:VEVENT", "UID:" + d + "-" + clean(title).replace(/\W+/g, "-").toLowerCase() + "@unlearn.ultrastable.org",
    "DTSTAMP:" + d + "T000000Z", "DTSTART;VALUE=DATE:" + d, "RRULE:FREQ=DAILY;COUNT=" + days, "SUMMARY:" + clean(title),
    "DESCRIPTION:" + clean("When " + when + ", " + then + ". Check in at https://unlearn.ultrastable.org/plan"), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}
