---
# Level 1: a tenant system bootstrapped on Ultrastable. Reports to its parent (tenant 0).
org_name: Unlearn
slug: unlearn
owner: Rowan
owner_contact: set-in-secret-store
owner_contact_backup: set-in-secret-store
parent: ultrastable
parent_health_url: https://ultrastable-tick.ultrastable.workers.dev/health
level: 1
---

# Idea

Unlearn is an evidence encyclopedia of popular beliefs that the evidence contradicts: broken windows policing, harsher sentences, Scared Straight, learning styles, sugar and hyperactivity, venting anger, cash and work, immigration and crime, and more, in six topics. The name comes from Rutger Bregman's Humankind, chapter Homo Ludens: the coaches at Agora "have to unlearn much of their training as teachers." Telling people they are wrong rarely changes a mind, so every entry follows the debunking research: it starts from why the belief feels true, asks the reader to guess, then shows what the evidence found, where the intuition slips, what works instead, and where the belief may still hold, with every source graded by study design and every grade shown honestly (strong, moderate, mixed, limited). It is point and click, in the encyclopedic shape of Practical Solutions. At /coach, Unlearn is a coaching companion for the adults around a curious child: it answers a curiosity with a coaching move, never a lesson, and follows up at 7 and 14 days.

# System test

- Loop: every hour the beat resolves cited sources to DOIs and searches for new systematic reviews on each entry's question, surfaces them on the entry and queues the entry for re-grading when they pile up; reader guesses and shift answers re-order what the site shows first, with no person in the middle of the loop
- Measure: share of entries whose evidence was checked within 7 days, target 1.0; second measure, share of readers who say an entry changed how they see the belief, target at least 0.3
- Upkeep: new reviews and trials arrive every week, links and DOIs rot, entries must be re-graded when the evidence moves, and new beliefs keep being added
- Run cost: 5 USD a month for the back end

# Who it is for

- Anyone holding a popular belief the evidence contradicts, especially beliefs common in American public debate
- Teachers, journalists and policy staff who want a cited, graded summary to point people to
- The adults around curious children, through the coaching tool at /coach (no child accounts or child data; its phases are in ./phases.json)

# First outcomes

- Every entry's evidence is checked within 7 days, with its sources resolved and new reviews shown on the entry
- At least 0.3 of readers who answer say an entry shifted their view, published from measured data at /api/metrics
- Every logged curiosity at /coach gets a coaching move within one minute and a follow-up at 7 and 14 days

# Constraints

- Budget per month: 5
- No accounts, cookies or trackers; reader taps are counted per entry with nothing that identifies the reader
- No child accounts or child personal data before phase 3 of the coaching tool
- No entry without named sources; mixed evidence is graded mixed, never rounded to a verdict
