// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// Unlearn coaching move library. Works with no model at all: a move is chosen from here by learned weights, and a model (when one
// answers inside budget) may only re-word it, behind the answer guard. Four kinds, after the Agora coach: ask back, try, connect, wait.
// {topic} is the adult's own words about the curiosity, trimmed. Ages: u6, 6-9, 10-13, 14+ ("any" fits all).
export const KINDS = ["ask", "try", "connect", "wait"];
export const MOVES = [
  { id: "ask-guess", kind: "ask", ages: "any", text: "Ask: \"What do you think is going on with {topic}?\" Then listen, and ask \"What makes you think that?\"" },
  { id: "ask-notice", kind: "ask", ages: "any", text: "Ask: \"What have you noticed about {topic} so far?\" Write down what they say, without correcting it." },
  { id: "ask-test", kind: "ask", ages: "6-9,10-13,14+", text: "Ask: \"How could we find out if you're right about {topic}?\" Let them design the test, even if it won't work." },
  { id: "ask-surprise", kind: "ask", ages: "any", text: "Ask: \"What would surprise you about {topic}?\" A surprise is a good place to start looking." },
  { id: "ask-change", kind: "ask", ages: "6-9,10-13,14+", text: "Ask: \"What would happen if you changed one thing about {topic}?\" Then ask which thing they'd change first." },
  { id: "ask-teachme", kind: "ask", ages: "10-13,14+", text: "Ask them to explain {topic} to you as if you knew nothing. Your only job is to ask \"how do you know?\"" },
  { id: "ask-who-else", kind: "ask", ages: "any", text: "Ask: \"Who else might wonder about {topic}?\" Curiosity grows when it has company." },
  { id: "try-make", kind: "try", ages: "any", text: "Offer materials, not instructions: put out things they could use to make or model {topic}, then step back." },
  { id: "try-small", kind: "try", ages: "any", text: "Suggest the smallest experiment they could run today about {topic}, and let them choose how." },
  { id: "try-draw", kind: "try", ages: "u6,6-9", text: "Invite them to draw {topic} as they imagine it works inside. Ask about the drawing, not about the right answer." },
  { id: "try-log", kind: "try", ages: "6-9,10-13,14+", text: "Suggest they keep a small log about {topic} for a week: what they see, when, and what changed." },
  { id: "try-break", kind: "try", ages: "10-13,14+", text: "Find something old to do with {topic} that they may take apart. Taking apart is research." },
  { id: "try-build", kind: "try", ages: "10-13,14+", text: "Ask what they would build to show someone {topic}. Help only with the parts they ask for." },
  { id: "try-play", kind: "try", ages: "u6,6-9", text: "Turn {topic} into a game they invent. Let them make the rules, and play it by their rules." },
  { id: "connect-person", kind: "connect", ages: "any", text: "Think of one person who knows about {topic} (a neighbour, a relative, a maker). Ask if they'd let the child ask them three questions." },
  { id: "connect-place", kind: "connect", ages: "any", text: "Find one place where {topic} happens for real: a workshop, a garden, a market, a museum. Go and let them lead." },
  { id: "connect-library", kind: "connect", ages: "any", text: "Go to the library together and let them find a book about {topic} themselves. Don't pick it for them." },
  { id: "connect-peer", kind: "connect", ages: "any", text: "Is there another child curious about {topic}, or something near it? Put them together and get out of the way." },
  { id: "connect-older", kind: "connect", ages: "u6,6-9,10-13", text: "Find an older child who has tried {topic} and ask if they would show how they started." },
  { id: "wait-watch", kind: "wait", ages: "any", text: "Wait. Don't answer anything about {topic} for two days. Notice whether they come back to it on their own." },
  { id: "wait-stuck", kind: "wait", ages: "any", text: "If they get stuck on {topic}, let them stay stuck a little longer. Ask \"what have you tried?\" before you offer anything." },
  { id: "wait-space", kind: "wait", ages: "any", text: "Leave something to do with {topic} lying around where they'll find it, and say nothing about it." },
  { id: "wait-sleep", kind: "wait", ages: "6-9,10-13,14+", text: "Suggest they sleep on {topic} and tell you tomorrow what they think now. Ideas change overnight." }
];
export const AGE_BANDS = ["u6", "6-9", "10-13", "14+"];
export function fits(m, age) { return m.ages === "any" || !age || m.ages.split(",").includes(age); }
