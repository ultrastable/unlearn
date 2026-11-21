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

"Most of what kids want to learn, you can't teach them." Play and exploration are learning. Unlearn is a coaching companion for the adults around a curious child (coaches, parents, mentors), modelled on the Agora school described in Rutger Bregman's Humankind, chapter Homo Ludens. The adult logs what a child is curious about; Unlearn answers with coaching moves, never lessons: a question to ask back, something to try or build, a person or place to go to, a reason to wait. It then follows the exploration to see whether the child kept going on their own, and re-weights its moves from what actually happened. The adult has to unlearn the reflex to teach; the system keeps them honest about it.

# System test

- Loop: curiosity logged, coaching move suggested, exploration followed up after 7 and 14 days, moves re-weighted by outcome, with no person in the middle of the loop
- Measure: share of explorations the child is still pursuing on their own after 14 days, target at least 0.5; second measure, share of coach notes that are telling rather than asking, target at most 0.3
- Upkeep: new curiosities arrive every week, resources and links rot, coaching moves that stop working must be retired and new ones tried
- Run cost: 5 USD a month for the back end

# Who it is for

- Phase 1: coaches, parents and mentors of children who learn by following their curiosity (no child accounts or child data)
- Phase 2: Agora-style schools and learning centres, which hold their children's pseudonymous ids as data controller
- Phase 3: children directly, invited by a school or parent, once consent, DPIA and the controller entity are in place (instances/unlearn/phases.json)

# First outcomes

- Every logged curiosity gets a coaching move within one minute and a follow-up at 7 and 14 days
- Self-directed continuation after 14 days reaches 0.5 and is published weekly from measured data
- The telling-versus-asking ratio of coach notes falls below 0.3 for active coaches

# Constraints

- Budget per month: 5
- No child accounts or child personal data before phase 3; phase 3 opens only on the gates in phases.json
- No curriculum, grades, streaks or leaderboards: nothing that turns play back into instruction
