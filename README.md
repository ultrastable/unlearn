# Instance: Unlearn

**Ultrastable is the foundation for any autonomous system.** Unlearn, an evidence encyclopedia of beliefs to unlearn, is a tenant system on it (level 1, parent `ultrastable`). Idea and system test: `IDEA.md`; manifest: `instance.json`.

A system is autonomous if it has self-referential loops and the ability to close them (`python3 -m foundation loops --verify`).

Ultrastable runs on itself (`python3 -m foundation selfhost`).

> "Most of what kids want to learn, you can't teach them." (Rob, a coach at Agora, in Rutger Bregman, *Humankind*, chapter "Homo Ludens".) The coaches there "nurture and challenge, encourage and guide", and "have to unlearn much of their training as teachers."

## The encyclopedia (unlearn.ultrastable.org)

Unlearn is an evidence encyclopedia of popular beliefs the evidence contradicts, in six topics: crime and justice, children and learning, how minds mislead, health and safety, money and work, society and policy. It is point and click in the shape of Practical Solutions: topic tiles, entry cards with an evidence meter, a play mode (`/play`), search, and a method page (`/how`).

Telling people they are wrong rarely changes a mind, so every entry follows the same guided order, taken from the debunking research (Lewandowsky et al. 2020, Ecker et al. 2022, Wood and Porter 2019): why the belief feels true, the reader's guess, what the evidence shows, where the intuition slips, what works instead, where the belief may still hold, and the sources. Evidence is graded twice: strength (strong, moderate, mixed, limited) and direction (contradicts, mostly contradicts, unsupported, complicates, split).

| Piece | Code |
|---|---|
| Entries, grades, topics, method | `worker/entries.js` |
| Pages (server-rendered, readable without script) | `worker/site.js` |
| Evidence loop: Crossref DOI resolution (title and year must match), Europe PMC watch for new reviews, freshness, review queue | `worker/evidence.js`, step 5 of the hourly beat in `worker/index.js` |
| Improvement loops (step 6 of the beat): a model labels each new review's abstract against the belief, kept only with a quote that is in the abstract; entries are re-graded automatically (reinforced: one step up; challenged: flagged on the page and queued); daily discovery drafts candidate beliefs from new myth and misconception reviews for `/lab`, where readers vote; wording trials test a re-worded "where the intuition slips" against the original on the shift answers (two-proportion test) and keep the winner | `worker/lab.js`, `labBeat` in `worker/index.js`, `/lab`, `/api/candidates.json`, `/api/grades.json`, `POST /api/candidate-vote` |
| Reader measures: anonymous guess and "did this change your view" counts per entry; surprise and shift shares | `POST /api/guess`, `POST /api/shift`, `/api/metrics` |
| Data and probes | `/api/entries.json`, `/api/freshness` (503 when an entry is unchecked for 7 days), `/api/leads`, `/api/review-queue.json`, `/sitemap.xml` |
| Tests | `node --test instances/unlearn/worker/*.test.mjs` |

## The coaching tool (/coach)

### Concept

Play and exploration are learning. Unlearn is not a lesson app. It serves the adult beside a curious child (coach, parent, mentor), because that adult is the one who has to unlearn the reflex to teach.

1. **Log a curiosity.** One line, spoken or typed: "She wants to know why the bread rose." No child account, no child data.
2. **Get a coaching move, never a lesson.** One of four kinds: a question to ask back, something to try or build, a person or place to go to, a reason to wait and watch. Never an explanation of the answer.
3. **Follow up.** At 7 and 14 days Unlearn asks one yes/no: is the child still at it on their own?
4. **Re-weight.** Moves that keep children going rise; moves that end explorations fall and are retired. Coach notes are read for telling versus asking.

What it refuses: curricula, grades, streaks, leaderboards, mastery levels. Anything that turns play back into instruction is a defect.

### The coaching loop and its measures

| | |
|---|---|
| Loop | curiosity → move → follow-up at 7 and 14 days → move weights updated |
| Primary measure | `continuation_14d`: share of explorations still self-directed after 14 days, target ≥ 0.5 |
| Guard measure | `telling_share`: share of coach notes that tell rather than ask, target ≤ 0.3 |
| Upkeep | new curiosities weekly, link rot in resources, retiring moves that stop working |
| Run cost | 5 USD a month (Workers, D1, Workers AI inside the free allocation) |

`seed/bootstrap/bootstrap.py --dry-run` on this `IDEA.md` passes stage `qualify` and seeds 3 objectives and 12 metrics (8 liveness, 4 declared awaiting probes).

### Coaching phases: all three audiences, in order

The research behind this ([Homo Ludens, self-directed learning, and AI-facilitated play](https://claude.ai/artifact/9tSXs9RsEVf4xi3Hr4v9kW)) points one way: guided play beats both lecturing and leaving children alone, and unrestricted AI help can hurt. In Bastani et al. 2024 (about 1,000 students), plain GPT-4 raised practice scores 48% and cut unaided exam scores 17%; a hint-only tutor removed the harm. So Unlearn coaches before it builds, and it measures learning that holds without the AI. Data: `phases.json` (11 principles, 3 phases, exit gates), checked by `tests/foundation/test_unlearn.py`.

| Phase | Who | Child data | Opens when |
|---|---|---|---|
| 1 | Coaches and parents | None | now |
| 2 | Agora-style schools and learning centres | Pseudonymous ids held by the school (controller) | phase 1: continuation_14d >= 0.5 on 100+ explorations, telling_share <= 0.3, 20 active adults over 8 weeks |
| 3 | Kids directly, invited by a school or parent | Adult-created account, parental consent (under 16 NL, under 13 US) | phase 2: 3 schools active 8 weeks, DPIA done; plus the controller-entity gate |

**Privacy floor.** The UK Children's Code has 15 standards (best interests, DPIA, data minimisation, default settings, profiling, nudge techniques, parental controls among them). The amended COPPA Rule had a compliance date of 22 April 2026: a published retention policy, a written security program, named third parties, and voice recordings counted as personal information. The Dutch age of digital consent is 16. Phase 3 does not open until each is met, and the controller entity is the one owner-only step (default in effect: phase 3 closed, phases 1 and 2 run).

### Coaching phase 1: built

`worker/` is the app: one Worker (`ultrastable-unlearn` in `doctrine/topology.json`), one D1 database, one hourly cron, no secrets and no npm dependencies. Tests: `node --test instances/unlearn/worker/*.test.mjs`.

- **Ask bar** with a mic and age chips; the adult's curiosities stay in their own browser as tokens.
- **Coaching moves**: 23 library moves in four kinds (ask, try, connect, wait), picked by Beta sampling over 14-day outcomes. A Workers AI model may re-word one inside a daily cap, behind the answer guard; any failure keeps the library text.
- **Follow-ups** at 7 and 14 days, one tap. **Coach notes** are classed as telling or asking.
- **The hourly beat** re-learns weights, measures (`/api/metrics`), opens phase 2 when its gates hold (the school-group UI lights by itself), and applies retention. A visit runs the beat if the cron has been silent for 2 hours.
- **Year safeguards**: `runway.json` lists 12 ways it could stop and the safeguard and probe for each (`tests/foundation/test_unlearn.py` checks every probe). Clock `unlearn-beat` in `doctrine/clocks.json`; loop `unlearn-beat` in the loop registry.
