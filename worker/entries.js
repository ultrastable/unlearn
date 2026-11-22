// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// The Unlearn encyclopedia: popular beliefs where the evidence points another way, each with graded evidence and named sources.
// Every entry walks the reader through the same guided order (see FORMAT below): why the belief feels true, a guess, what the evidence
// shows, where the intuition slips, what works instead, where the belief may still hold, and the sources. Nothing here is a verdict
// without a source; a mixed body of evidence is graded mixed and shown as mixed. The hourly beat (evidence.js) resolves each source to a
// DOI through Crossref and watches Europe PMC for new reviews on each entry's query, so the evidence under an entry is never frozen.

// How strong the body of evidence is, independent of which way it points.
export const STRENGTH = {
  strong: { rank: 4, name: "Strong", note: "Several systematic reviews, randomised trials or large preregistered replications agree." },
  moderate: { rank: 3, name: "Moderate", note: "Consistent findings, but mostly observational or from fewer trials; confounding remains possible." },
  mixed: { rank: 2, name: "Mixed", note: "Good studies disagree. Shown because a disagreement is part of the evidence." },
  limited: { rank: 1, name: "Limited", note: "Few studies or narrow settings. A reason to doubt the belief, not yet a settled answer." }
};

// Which way the evidence points relative to the popular belief.
export const DIRECTION = {
  contradicts: { name: "Evidence contradicts it", note: "The best evidence points the other way." },
  "mostly-contradicts": { name: "Evidence mostly contradicts it", note: "Most evidence points the other way, with real exceptions." },
  unsupported: { name: "No evidence supports it", note: "Studies have not shown the claimed effect, and the strongest reviews say so." },
  complicates: { name: "Evidence complicates it", note: "Part of the belief holds; the popular version goes further than the evidence." },
  mixed: { name: "Evidence is split", note: "Credible studies point both ways; the honest answer is that it depends." }
};

// Study designs, ranked like the Practical Solutions catalogue.
export const DESIGN = {
  review: { rank: 5, name: "Systematic review or meta-analysis" },
  consensus: { rank: 4, name: "Expert panel report" },
  replication: { rank: 4, name: "Multi-lab preregistered replication" },
  trial: { rank: 3, name: "Randomised trial or experiment" },
  observational: { rank: 2, name: "Observational study" },
  narrative: { rank: 2, name: "Narrative review" },
  survey: { rank: 1, name: "Survey" }
};

export const CATEGORIES = [
  { id: "crime", name: "Crime and justice", blurb: "Policing, punishment and what actually lowers crime.", hue: 12 },
  { id: "children", name: "Children and learning", blurb: "How children learn, and what adults get wrong about teaching them.", hue: 150 },
  { id: "mind", name: "How minds mislead", blurb: "Memory, willpower, anger and the biases that feel like common sense.", hue: 265 },
  { id: "health", name: "Health and safety", blurb: "Beliefs about protection and prevention that the data does not back.", hue: 200 },
  { id: "money", name: "Money, work and welfare", blurb: "Cash, wages, hours and happiness.", hue: 40 },
  { id: "society", name: "Society and policy", blurb: "Migration, housing and drugs: where policy beliefs meet data.", hue: 320 },
  { id: "retold", name: "Famous findings, retold", blurb: "Landmark studies and famous stories that later evidence overturned or recast.", hue: 95 }
];

// The guided order every entry follows. It applies the debunking research cited on /how: lead with why the belief is reasonable,
// let the reader predict before showing the data, replace the belief with an explanation rather than leave a gap, and be explicit
// about where the belief still holds.
export const FORMAT = ["feels", "guess", "says", "slip", "instead", "holds", "sources"];

const S = (authors, year, title, venue, design, finding) => ({ authors, year, title, venue, design, finding });

export const ENTRIES = [
  {
    id: "broken-windows", cat: "crime",
    belief: "Cracking down on minor offences like fare dodging and loitering prevents serious crime.",
    feels: "New York pushed arrest-heavy order maintenance in the 1990s and its crime fell sharply. Visible disorder feels threatening, so it is natural to see it as the seed of worse things.",
    guess: { q: "When studies pooled arrest-led crackdowns on minor disorder, what happened to serious crime?", options: ["It fell clearly", "No clear effect", "It rose"], answer: 1 },
    says: "Arrest-led crackdowns on disorderly people show no clear effect on serious crime in pooled studies. What did reduce crime was working with residents on local problems and fixing up places. Crime also fell across the United States in the 1990s, including in cities that never adopted the New York approach.",
    slip: "One city, one decade, one visible policy: the policy got the credit for a drop that was happening nationwide.",
    instead: "Problem-oriented policing with residents, and repairing places rather than arresting people. In a Philadelphia trial, restoring vacant lots cut gun violence, most in the poorest neighbourhoods.",
    holds: "Physical disorder does matter: cleaning and greening places shows real effects. The evidence is against arrest-led crackdowns on people, not against tidy streets.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Braga, Welsh and Schnell", 2015, "Can policing disorder reduce crime? A systematic review and meta-analysis", "Journal of Research in Crime and Delinquency", "review", "Disorder policing was linked to modest crime reductions, driven by community and problem-solving approaches; aggressive order maintenance aimed at individual disorderly behaviour did not produce significant reductions."),
      S("Harcourt and Ludwig", 2006, "Broken windows: New evidence from New York City and a five-city social experiment", "University of Chicago Law Review", "observational", "Found no support for the claim that order-maintenance policing drove New York's crime drop."),
      S("Branas et al.", 2018, "Citywide cluster randomized trial to restore blighted vacant land and its effects on violence, crime, and fear", "PNAS", "trial", "Restoring vacant lots reduced gun violence, with the largest drop (about 29%) in neighbourhoods below the poverty line."),
      S("O'Brien, Farrell and Welsh", 2019, "Broken (windows) theory: A meta-analysis of the evidence for the pathways from neighborhood disorder to resident health outcomes and behaviors", "Social Science and Medicine", "review", "Neighbourhood disorder was not consistently linked to residents' aggressive behaviour, the pathway the theory depends on.")
    ],
    query: "broken windows policing disorder crime", related: ["harsher-sentences", "prison-reoffending"]
  },
  {
    id: "harsher-sentences", cat: "crime",
    belief: "Longer prison sentences deter crime.",
    feels: "A punishment that hurts more should make anyone think twice. It is how we reason about our own choices.",
    guess: { q: "Which deters crime more: a longer sentence, or a higher chance of being caught?", options: ["A longer sentence", "About the same", "A higher chance of being caught"], answer: 2 },
    says: "The chance of being caught deters far more than the length of the sentence. Expert reviews find that making already long sentences longer adds little or no deterrence.",
    slip: "Deterrence assumes people weigh sentence lengths in advance. Most offences happen on impulse or on the belief that one will not be caught, and few people know sentence lengths.",
    instead: "Raise the certainty and speed of being caught: focused, visible policing at the small number of places where crime concentrates reduces crime without simply moving it.",
    holds: "Prison does prevent crime by the people inside while they are inside. The question is deterrence of others, and the value of each added year.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Nagin", 2013, "Deterrence in the twenty-first century", "Crime and Justice", "review", "Certainty of apprehension is a much more effective deterrent than severity; evidence that lengthening already long sentences deters is weak."),
      S("National Research Council", 2014, "The Growth of Incarceration in the United States: Exploring Causes and Consequences", "National Academies Press", "consensus", "The incremental deterrent effect of increases in lengthy prison sentences is modest at best."),
      S("Braga, Turchan, Papachristos and Hureau", 2019, "Hot spots policing of small geographic areas effects on crime", "Campbell Systematic Reviews", "review", "Focusing police on small high-crime places reduced crime, and nearby areas tended to benefit rather than absorb displaced crime.")
    ],
    query: "sentence severity deterrence crime", related: ["death-penalty", "prison-reoffending", "broken-windows"]
  },
  {
    id: "prison-reoffending", cat: "crime",
    belief: "Prison, rather than a community sentence, makes offenders less likely to offend again.",
    feels: "Prison is the harshest response we have, so it seems it must teach the hardest lesson.",
    guess: { q: "Comparing similar people, how does prison change reoffending compared with a community sentence?", options: ["Prison lowers it", "Little or no difference, or prison raises it", "Prison lowers it a lot"], answer: 1 },
    says: "When similar people are compared, prison does not lower reoffending compared with community sentences, and some studies find it raises it a little. Studies that exploit random assignment of cases to stricter or more lenient judges mostly find no effect.",
    slip: "People who go to prison differ from those who do not, so raw comparisons mislead. Once like is compared with like, the expected lesson of prison does not show up.",
    instead: "Programmes that work on how people think and act, such as cognitive behavioural programmes, reduce reoffending in trials.",
    holds: "For a small group of very high-risk people, removing them from the community prevents harm while they are inside.",
    strength: "moderate", direction: "mostly-contradicts",
    sources: [
      S("Nagin, Cullen and Jonson", 2009, "Imprisonment and reoffending", "Crime and Justice", "review", "Most studies found custodial sanctions had a null or mildly criminogenic effect on reoffending compared with non-custodial sanctions."),
      S("Loeffler and Nagin", 2022, "The impact of incarceration on recidivism", "Annual Review of Criminology", "review", "Studies using random assignment of judges mostly find null effects of incarceration on later reoffending."),
      S("Lipsey, Landenberger and Wilson", 2007, "Effects of cognitive-behavioral programs for criminal offenders", "Campbell Systematic Reviews", "review", "Cognitive behavioural programmes reduced reoffending, with the best-run programmes doing best.")
    ],
    query: "incarceration recidivism custodial non-custodial", related: ["harsher-sentences", "scared-straight", "boot-camps"]
  },
  {
    id: "scared-straight", cat: "crime",
    belief: "Showing teenagers the reality of prison scares them straight.",
    feels: "A vivid, frightening encounter feels like it must leave a mark, and the programmes are dramatic to watch.",
    guess: { q: "In randomised trials of prison-visit programmes for young people, what happened to later offending?", options: ["It fell", "No change", "It rose"], answer: 2 },
    says: "Randomised trials find the opposite of the intended effect: young people sent on these programmes offended more afterwards than similar young people who were not.",
    slip: "The programmes were judged by how powerful they felt in the room, not by what the follow-up records showed.",
    instead: "Programmes with trial evidence of lowering youth offending, such as cognitive behavioural and family-based approaches, rather than shock.",
    holds: "Nothing in the trials supports the programme. This is one of the clearest cases in criminology.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Petrosino, Turpin-Petrosino, Hollis-Peel and Lavenberg", 2013, "Scared Straight and other juvenile awareness programs for preventing juvenile delinquency", "Campbell Systematic Reviews", "review", "Across randomised trials, participants were more likely to offend than controls who received no intervention.")
    ],
    query: "scared straight juvenile awareness delinquency", related: ["boot-camps", "dare", "prison-reoffending"]
  },
  {
    id: "boot-camps", cat: "crime",
    belief: "Military-style boot camps turn young offenders around.",
    feels: "Discipline, structure and hard physical work look like exactly what an unruly young person lacks.",
    guess: { q: "Across controlled studies, how did boot camps change reoffending?", options: ["Large drop", "No overall effect", "Large rise"], answer: 1 },
    says: "Pooled across studies, boot camps had no overall effect on reoffending. The few that did better were the ones that added treatment, not more drill.",
    slip: "Discipline is visible and satisfying; whether people reoffend months later is invisible from the parade ground.",
    instead: "Put the money into the therapeutic parts (education, treatment, support after release), which is what the better-performing camps had.",
    holds: "Participants often report positive attitudes at the end of a camp; the effect does not show up in reoffending.",
    strength: "strong", direction: "unsupported",
    sources: [
      S("Wilson, MacKenzie and Mitchell", 2005, "Effects of correctional boot camps on offending", "Campbell Systematic Reviews", "review", "Overall, boot camps had no effect on reoffending; camps with a stronger treatment component showed better results.")
    ],
    query: "correctional boot camp recidivism", related: ["scared-straight", "prison-reoffending"]
  },
  {
    id: "death-penalty", cat: "crime",
    belief: "The death penalty deters murder.",
    feels: "If anything should make a person stop, it is the threat of death.",
    guess: { q: "What did the US National Research Council conclude about research on the death penalty and homicide?", options: ["It deters", "It does not show an effect either way", "It increases homicide"], answer: 1 },
    says: "The National Research Council concluded that research to date does not show whether the death penalty lowers, raises or has no effect on homicide rates, and should not be used to inform policy. Claimed deterrent effects have proven fragile when re-analysed.",
    slip: "The threat is rare, slow and uncertain in practice, and murders are seldom planned with sentencing in mind.",
    instead: "The certainty of being caught matters more than severity (see longer sentences); solving more homicides is the lever with evidence.",
    holds: "This is an absence of evidence of deterrence rather than proof of zero effect; the studies cannot settle it either way.",
    strength: "moderate", direction: "unsupported",
    sources: [
      S("National Research Council", 2012, "Deterrence and the Death Penalty", "National Academies Press", "consensus", "Research to date is not informative about whether capital punishment decreases, increases or has no effect on homicide rates."),
      S("Donohue and Wolfers", 2005, "Uses and abuses of empirical evidence in the death penalty debate", "Stanford Law Review", "observational", "Claimed deterrent effects were fragile and disappeared under small, reasonable changes to the analysis.")
    ],
    query: "death penalty capital punishment deterrence homicide", related: ["harsher-sentences"]
  },
  {
    id: "dare", cat: "children",
    belief: "Having police officers teach children to say no to drugs (D.A.R.E.) prevents drug use.",
    feels: "Trusted adults delivering a clear message early seems like common-sense prevention, and the programme was everywhere.",
    guess: { q: "What did pooled evaluations of the original D.A.R.E. curriculum find on later drug use?", options: ["A clear drop", "A small, non-significant effect", "A clear rise"], answer: 1 },
    says: "Meta-analyses found the original D.A.R.E. curriculum had a small effect on drug use that was not statistically significant, smaller than interactive programmes.",
    slip: "Knowing the message and changing behaviour are different things; a lecture builds the first, not the second.",
    instead: "Interactive programmes where students practise social skills did better than lecture-style instruction in the same reviews.",
    holds: "Later revisions of the curriculum differ from the original that was studied most.",
    strength: "strong", direction: "unsupported",
    sources: [
      S("Ennett, Tobler, Ringwalt and Flewelling", 1994, "How effective is drug abuse resistance education? A meta-analysis of Project DARE outcome evaluations", "American Journal of Public Health", "review", "Effects on drug use were small, smaller than those of interactive prevention programmes."),
      S("West and O'Neal", 2004, "Project D.A.R.E. outcome effectiveness revisited", "American Journal of Public Health", "review", "The pooled effect of D.A.R.E. on drug use was small and not statistically significant.")
    ],
    query: "drug abuse resistance education DARE school prevention", related: ["scared-straight", "abstinence-only"]
  },
  {
    id: "memory-video", cat: "mind",
    belief: "Memory works like a video recording: if you remember it clearly, it happened that way.",
    feels: "Memories feel vivid and complete, and we rarely get the chance to check them against a recording.",
    guess: { q: "In a representative US survey, roughly how many people agreed memory works like a video camera?", options: ["About 1 in 10", "About a third", "More than half"], answer: 2 },
    says: "Most people surveyed in the US agreed memory works like a video camera; memory researchers overwhelmingly disagree. Experiments show memories are rebuilt each time they are recalled, and the wording of a single question can change what people remember.",
    slip: "Confidence and vividness feel like accuracy, but they grow with retelling even when details drift.",
    instead: "Treat memory as evidence that can be contaminated: record first accounts early, ask neutral questions, and use fair lineup procedures.",
    holds: "A witness's first, high-confidence identification from a fairly run lineup is fairly reliable. It is later, repeated or leading recall that goes wrong.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Simons and Chabris", 2011, "What people believe about how memory works: A representative survey of the U.S. population", "PLoS ONE", "survey", "63% of respondents agreed that memory works like a video camera; experts overwhelmingly disagreed."),
      S("Loftus and Palmer", 1974, "Reconstruction of automobile destruction: An example of the interaction between language and memory", "Journal of Verbal Learning and Verbal Behavior", "trial", "Asking how fast cars 'smashed' rather than 'hit' raised speed estimates and made people more likely to falsely remember broken glass."),
      S("Wixted and Wells", 2017, "The relationship between eyewitness confidence and identification accuracy: A new synthesis", "Psychological Science in the Public Interest", "review", "Initial confidence under fair procedures is informative; confidence expressed later, after contamination, is not.")
    ],
    query: "false memory misinformation eyewitness", related: ["better-than-average", "catharsis"]
  },
  {
    id: "learning-styles", cat: "children",
    belief: "Children learn best when teaching matches their learning style: visual, auditory or kinaesthetic.",
    feels: "People do have preferences, and tailoring sounds kind and modern. Most teachers have been trained in it.",
    guess: { q: "When researchers tested matching teaching to a student's preferred style, what did they find?", options: ["Matching helps a lot", "No good evidence that matching helps", "Matching hurts a lot"], answer: 1 },
    says: "A major review found almost no studies with the design needed to test the idea, and the ones that did contradicted it. Students' preferred style did not predict how well they learned when teaching matched it.",
    slip: "A preference is not a need: liking pictures does not mean you learn better from pictures. What helps depends far more on the content than on the learner.",
    instead: "Methods that help nearly everyone: practice testing, spacing practice over time, and matching the format to the material (maps for geography, sound for music).",
    holds: "Preferences are real and can affect motivation; they just do not change how well matched teaching works.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Pashler, McDaniel, Rohrer and Bjork", 2008, "Learning styles: Concepts and evidence", "Psychological Science in the Public Interest", "review", "Found virtually no adequately designed studies supporting style-matched teaching, and several that contradicted it."),
      S("Husmann and O'Loughlin", 2019, "Another nail in the coffin for learning styles?", "Anatomical Sciences Education", "observational", "Students mostly did not study in line with their measured style, and those who did got no better grades.")
    ],
    query: "learning styles meshing hypothesis", related: ["study-rereading", "teach-vs-play"]
  },
  {
    id: "rewards-motivation", cat: "children",
    belief: "Rewarding children for doing something they enjoy makes them like it more.",
    feels: "Rewards work for chores, so adding them to things children already like should only add more.",
    guess: { q: "In experiments, what happened to children's free-time interest in an enjoyable task after they were promised a reward for it?", options: ["Interest rose", "Interest fell", "No change"], answer: 1 },
    says: "Promised, tangible rewards for an activity people already find interesting tend to reduce their interest in doing it freely later. Unexpected rewards and sincere praise did not show this harm.",
    slip: "A reward changes the story the child tells about why they do it: from 'I like this' to 'I do this for the sticker'.",
    instead: "Leave enjoyable activities unrewarded, notice effort with specific words, and keep rewards for tasks that have no interest of their own.",
    holds: "For dull tasks, rewards can raise effort. Some researchers argue the overall harm is small, so this is graded moderate.",
    strength: "moderate", direction: "mostly-contradicts",
    sources: [
      S("Lepper, Greene and Nisbett", 1973, "Undermining children's intrinsic interest with extrinsic reward: A test of the overjustification hypothesis", "Journal of Personality and Social Psychology", "trial", "Preschoolers who expected a certificate for drawing later chose to draw less in free time than those who got none or an unexpected one."),
      S("Deci, Koestner and Ryan", 1999, "A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation", "Psychological Bulletin", "review", "Expected tangible rewards undermined free-choice interest in interesting tasks; verbal praise did not."),
      S("Cameron and Pierce", 1994, "Reinforcement, reward, and intrinsic motivation: A meta-analysis", "Review of Educational Research", "review", "Argued that overall negative effects of reward are small and limited to specific conditions.")
    ],
    query: "extrinsic reward intrinsic motivation children", related: ["teach-vs-play", "growth-mindset"]
  },
  {
    id: "teach-vs-play", cat: "children",
    belief: "Children learn most when an adult explains things to them.",
    feels: "Explaining is fast and feels efficient, and school taught most of us that learning means being told.",
    guess: { q: "Children were shown one function of a new toy by an adult. Compared with children left to explore, what did they do?", options: ["Found more of its functions", "Explored less and found fewer", "No difference"], answer: 1 },
    says: "Instruction narrows exploration: children taught one function of a toy explored less and discovered fewer of its other functions. Reviews find guided play, where an adult sets up and nudges but the child leads, does at least as well as direct instruction on several outcomes. Leaving children entirely alone does worse than both.",
    slip: "Being told the answer ends the question. The child learns what the adult said, and learns that the adult is where answers come from.",
    instead: "Coach rather than teach: ask a question back, set up something to try, point to a person or place, or wait. Unlearn's coaching tool (/coach) is built on this.",
    holds: "Explicit instruction beats unguided discovery for many school skills; the evidence favours guided play over both extremes.",
    strength: "moderate", direction: "complicates",
    sources: [
      S("Bonawitz et al.", 2011, "The double-edged sword of pedagogy: Instruction limits spontaneous exploration and discovery", "Cognition", "trial", "Children shown one function of a toy explored it less and found fewer of its other functions than uninstructed children."),
      S("Alfieri, Brooks, Aldrich and Tenenbaum", 2011, "Does discovery-based instruction enhance learning?", "Journal of Educational Psychology", "review", "Unassisted discovery did worse than explicit instruction, but guided discovery did better than other forms of instruction."),
      S("Skene et al.", 2022, "Can guidance during play enhance children's learning and development in educational contexts? A meta-analysis", "Child Development", "review", "Guided play had a greater positive effect than direct instruction on some outcomes, including early mathematics.")
    ],
    query: "guided play direct instruction children learning", related: ["rewards-motivation", "learning-styles", "study-rereading"]
  },
  {
    id: "study-rereading", cat: "children",
    belief: "Rereading and highlighting are good ways to study.",
    feels: "Rereading makes material feel familiar and fluent, and that feeling is easy to mistake for knowing it.",
    guess: { q: "A week later, who remembered a passage better: students who reread it, or students who practised recalling it?", options: ["Rereaders", "Recallers", "No difference"], answer: 1 },
    says: "Students who practised recalling remembered more a week later, even though rereaders felt more confident. A large review rated rereading and highlighting low in usefulness and practice testing and spaced practice high.",
    slip: "Familiarity feels like learning. Effortful recall feels harder and less pleasant, which is why people avoid the method that works better.",
    instead: "Close the book and recall, quiz yourself, and spread practice over days rather than cramming.",
    holds: "Rereading is not harmful; it is a low-yield use of time compared with recall.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Roediger and Karpicke", 2006, "Test-enhanced learning: Taking memory tests improves long-term retention", "Psychological Science", "trial", "Practising recall produced better retention after a week than restudying, though restudiers predicted they would do better."),
      S("Dunlosky, Rawson, Marsh, Nathan and Willingham", 2013, "Improving students' learning with effective learning techniques", "Psychological Science in the Public Interest", "review", "Rated rereading and highlighting low utility; practice testing and distributed practice high utility.")
    ],
    query: "retrieval practice rereading testing effect", related: ["learning-styles", "teach-vs-play"]
  },
  {
    id: "growth-mindset", cat: "children",
    belief: "Teaching children that intelligence can grow will transform their grades.",
    feels: "The idea is hopeful, simple to teach and backed by famous studies, so it spread fast through schools.",
    guess: { q: "Across many studies, how large was the average effect of mindset interventions on grades?", options: ["Large", "Small", "Negative"], answer: 1 },
    says: "Average effects on academic achievement are small. A large national US experiment found a modest rise in grades, concentrated among lower-achieving students.",
    slip: "A small, real effect in some students got told as a large effect for everyone.",
    instead: "Use it as one small, cheap nudge, alongside things with bigger effects like good teaching and practice.",
    holds: "It is not a myth that mindset matters; it is the size of the effect that was oversold.",
    strength: "moderate", direction: "complicates",
    sources: [
      S("Sisk, Burgoyne, Sun, Butler and Macnamara", 2018, "To what extent and under which circumstances are growth mind-sets important to academic achievement? Two meta-analyses", "Psychological Science", "review", "Mindset interventions had weak average effects on achievement, with some benefit for at-risk students."),
      S("Yeager et al.", 2019, "A national experiment reveals where a growth mindset improves achievement", "Nature", "trial", "A short online intervention modestly raised grades among lower-achieving US ninth-graders.")
    ],
    query: "growth mindset intervention academic achievement", related: ["rewards-motivation", "power-posing"]
  },
  {
    id: "sugar-hyperactive", cat: "children",
    belief: "Sugar makes children hyperactive.",
    feels: "Parties are full of sugar and full of wild children, so the link seems obvious.",
    guess: { q: "In blinded trials where neither parents nor children knew who got sugar, what did sugar do to behaviour?", options: ["Made children hyperactive", "No measurable effect", "Calmed them"], answer: 1 },
    says: "A meta-analysis of blinded trials found sugar did not affect children's behaviour or thinking. In one experiment, mothers told their son had sugar rated him more hyperactive, though he had been given a placebo.",
    slip: "The setting (parties, excitement) and the expectation explain what we see; sugar gets the blame because it is present.",
    instead: "Look at the setting: excitement, crowds, tiredness and the adult's own expectation.",
    holds: "Sugar has other well-established costs, for teeth and diet; this is about behaviour only.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Wolraich, Wilson and White", 1995, "The effect of sugar on behavior or cognition in children: A meta-analysis", "JAMA", "review", "Sugar does not affect the behaviour or cognitive performance of children."),
      S("Hoover and Milich", 1994, "Effects of sugar ingestion expectancies on mother-child interactions", "Journal of Abnormal Child Psychology", "trial", "Mothers who believed their son had taken sugar rated him as more hyperactive, though all children received a placebo.")
    ],
    query: "sugar behavior children hyperactivity", related: ["memory-video"]
  },
  {
    id: "spanking", cat: "children",
    belief: "A smack teaches children discipline.",
    feels: "It often stops the behaviour in the moment, and many adults were smacked and feel they turned out fine.",
    guess: { q: "Across decades of studies, which long-term outcomes did spanking improve?", options: ["Behaviour and obedience", "None; it was linked to worse outcomes", "Mental health"], answer: 1 },
    says: "A meta-analysis covering decades of studies found spanking linked to more aggression, more antisocial behaviour and more mental-health problems, and to no better long-term behaviour.",
    slip: "The behaviour stops now, which is visible; the costs arrive later and are not traced back.",
    instead: "Non-physical discipline: calm, consistent consequences. The same reviews find no outcome on which spanking does better.",
    holds: "Most of the evidence is observational, so causation is argued from consistency across many designs rather than from trials.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Gershoff and Grogan-Kaylor", 2016, "Spanking and child outcomes: Old controversies and new meta-analyses", "Journal of Family Psychology", "review", "Spanking was associated with detrimental outcomes such as aggression, antisocial behaviour and mental-health problems, and with no beneficial outcome.")
    ],
    query: "spanking physical punishment child outcomes", related: ["rewards-motivation", "catharsis"]
  },
  {
    id: "catharsis", cat: "mind",
    belief: "Venting anger, like hitting a pillow, gets it out of your system.",
    feels: "Anger feels like pressure building up, so releasing it seems like letting off steam.",
    guess: { q: "People who hit a punching bag while thinking about someone who angered them were, afterwards...", options: ["Calmer", "Angrier and more aggressive", "Unchanged"], answer: 1 },
    says: "In experiments, venting by hitting a punching bag while thinking about the provoker left people angrier and more aggressive than doing nothing. Reviews find activities that lower arousal reduce anger; arousing ones do not.",
    slip: "The 'steam' picture is a metaphor. Rehearsing anger practises it.",
    instead: "Lower arousal: slow breathing, pausing, distraction, or a calm walk.",
    holds: "Talking a problem through to solve it is different from venting to discharge anger.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Bushman", 2002, "Does venting anger feed or extinguish the flame? Catharsis, rumination, distraction, anger, and aggressive responding", "Personality and Social Psychology Bulletin", "trial", "Venting while ruminating increased anger and aggression compared with distraction or doing nothing."),
      S("Kjaervik and Bushman", 2024, "A meta-analytic review of anger management activities that increase or decrease arousal: What fuels or douses rage?", "Clinical Psychology Review", "review", "Arousal-decreasing activities reduced anger; arousal-increasing activities did not.")
    ],
    query: "venting anger catharsis aggression", related: ["ego-depletion", "spanking"]
  },
  {
    id: "ego-depletion", cat: "mind",
    belief: "Willpower is a tank that runs empty the more you use it.",
    feels: "Resisting temptation feels tiring, and the idea was backed by many published studies.",
    guess: { q: "When 23 labs repeated the classic willpower-depletion experiment with a shared preregistered plan, how big was the effect?", options: ["Large", "Close to zero", "Reversed"], answer: 1 },
    says: "Large preregistered replications across many labs found the depletion effect close to zero. The idea that self-control draws on a limited fuel that runs out has not held up.",
    slip: "Many small studies with flexible analysis can produce a literature that looks solid; preregistered replications test it cleanly.",
    instead: "Design the setting so less willpower is needed: remove temptations, make good options the default, and plan in advance.",
    holds: "Fatigue and motivation are real. The specific 'limited fuel' model is what failed.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Hagger et al.", 2016, "A multilab preregistered replication of the ego-depletion effect", "Perspectives on Psychological Science", "replication", "Across 23 laboratories the ego-depletion effect was close to zero."),
      S("Vohs et al.", 2021, "A multisite preregistered paradigmatic test of the ego-depletion effect", "Psychological Science", "replication", "The effect was small and close to zero.")
    ],
    query: "ego depletion self-control replication", related: ["power-posing", "growth-mindset"]
  },
  {
    id: "better-than-average", cat: "mind",
    belief: "Your sense of your own skill is a fair guide to how good you are.",
    feels: "We know our own intentions and effort from the inside, and we rarely see a fair comparison.",
    guess: { q: "In a classic study, what share of US drivers rated themselves more skilful than the median driver?", options: ["About a third", "About half", "A large majority"], answer: 2 },
    says: "A large majority rated themselves above the median, which cannot be true of a majority. Overrating ourselves relative to others shows up across many skills and traits.",
    slip: "We judge ourselves by our intentions and others by their actions, and we remember our successes better than our mistakes.",
    instead: "Compare against records rather than feelings: outcomes, times, error rates, or a second opinion.",
    holds: "For hard or unfamiliar tasks, people can underrate themselves. The bias depends on the task.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Svenson", 1981, "Are we all less risky and more skillful than our fellow drivers?", "Acta Psychologica", "survey", "A large majority of US respondents rated themselves as more skilful and safer than the median driver.")
    ],
    query: "better-than-average effect self-assessment overconfidence", related: ["memory-video", "power-posing"]
  },
  {
    id: "power-posing", cat: "mind",
    belief: "Standing in a 'power pose' for two minutes changes your hormones and makes you bolder.",
    feels: "Posture and mood are clearly linked, and the original study was one of the most watched talks ever.",
    guess: { q: "When a larger study repeated the experiment, what changed after power posing?", options: ["Hormones and risk-taking", "Only how powerful people said they felt", "Nothing at all"], answer: 1 },
    says: "A larger replication found no effect on hormones or risk-taking; only people's reported feeling of power rose. One of the original authors later said she no longer believes the effects are real.",
    slip: "A striking result from a small sample travelled further than its evidence.",
    instead: "If a pose makes you feel more confident, that feeling may be real; do not expect it to change your body chemistry or your behaviour.",
    holds: "Effects on self-reported feelings have some support.",
    strength: "moderate", direction: "mostly-contradicts",
    sources: [
      S("Ranehill et al.", 2015, "Assessing the robustness of power posing: No effect on hormones and risk tolerance in a large sample of men and women", "Psychological Science", "replication", "No effect on testosterone, cortisol or risk taking; a small effect on self-reported feelings of power."),
      S("Cuddy, Schultz and Fosse", 2018, "P-curving a more comprehensive body of research on postural feedback reveals clear evidential value for power-posing effects", "Psychological Science", "review", "Argued the evidence supports effects on feelings of power, not on hormones.")
    ],
    query: "power posing replication hormones", related: ["ego-depletion", "growth-mindset"]
  },
  {
    id: "guns-safety", cat: "health",
    belief: "Keeping a gun at home makes your household safer.",
    feels: "A gun feels like protection you control, and stories of defensive use are vivid.",
    guess: { q: "In pooled studies, how did access to a firearm at home relate to suicide risk for household members?", options: ["Lower risk", "No difference", "Higher risk"], answer: 2 },
    says: "A meta-analysis found access to a firearm linked to about three times the odds of suicide and about twice the odds of being a homicide victim. A study of millions of Californians found handgun owners had far higher suicide rates than non-owners.",
    slip: "We picture a stranger breaking in; the more common harms come from inside the household, especially suicide in a moment of crisis.",
    instead: "If a gun is kept, safe storage (locked, unloaded, ammunition separate) lowers risk; removing access during a crisis matters most.",
    holds: "The evidence is observational, and how often guns prevent crime is disputed; the suicide link is the most consistent finding.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Anglemyer, Horvath and Rutherford", 2014, "The accessibility of firearms and risk for suicide and homicide victimization among household members: A systematic review and meta-analysis", "Annals of Internal Medicine", "review", "Firearm access was associated with about three times the odds of suicide and twice the odds of homicide victimisation."),
      S("Studdert et al.", 2020, "Handgun ownership and suicide in California", "New England Journal of Medicine", "observational", "Handgun owners had substantially higher rates of suicide than non-owners, driven by firearm suicide.")
    ],
    query: "household firearm access suicide homicide risk", related: ["harsher-sentences"]
  },
  {
    id: "abstinence-only", cat: "health",
    belief: "Teaching teenagers abstinence only keeps them from having sex.",
    feels: "If young people are only told 'wait', it seems they will be more likely to wait.",
    guess: { q: "In a large randomised US evaluation, what did abstinence-only programmes do to whether teens had sex?", options: ["Delayed it", "No effect", "Brought it forward"], answer: 1 },
    says: "A randomised federal evaluation found no effect on whether or when teens had sex, and a systematic review found such programmes did not change sexual behaviour. US states that emphasised abstinence had higher teen pregnancy rates.",
    slip: "Instruction about what to do is not the same as the skills and knowledge to do it, and young people stop listening to a message they find unrealistic.",
    instead: "Comprehensive sex education that covers both delay and contraception.",
    holds: "The state comparison is observational; the trial evidence is the stronger part.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Trenholm et al.", 2007, "Impacts of four Title V, Section 510 abstinence education programs", "Mathematica Policy Research", "trial", "Programme youth were no more likely than controls to abstain from sex, and had similar ages at first sex."),
      S("Underhill, Montgomery and Operario", 2007, "Sexual abstinence only programmes to prevent HIV infection in high income countries: systematic review", "BMJ", "review", "Abstinence-only programmes did not affect sexual behaviour."),
      S("Stanger-Hall and Hall", 2011, "Abstinence-only education and teen pregnancy rates: Why we need comprehensive sex education in the U.S.", "PLoS ONE", "observational", "The more strongly states emphasised abstinence, the higher their teen pregnancy and birth rates.")
    ],
    query: "abstinence-only education sexual behavior adolescents", related: ["dare"]
  },
  {
    id: "vaccines-autism", cat: "health",
    belief: "Childhood vaccines can cause autism.",
    feels: "Signs of autism often become noticeable around the age when children get several vaccines, so the timing looks like cause and effect. A 1998 paper claimed a link.",
    guess: { q: "In a study following more than 650,000 Danish children, how did MMR vaccination relate to autism?", options: ["Raised the risk", "No increased risk", "Removed the risk"], answer: 1 },
    says: "Large studies covering millions of children find no link. A Danish cohort of more than 650,000 children found MMR vaccination did not raise autism risk, including in children with autistic siblings. The 1998 paper was retracted.",
    slip: "Two things that happen at the same age will often appear together by chance; timing alone cannot show cause.",
    instead: "Vaccinate on schedule; for questions about autism, look to the genetic and developmental research where the evidence points.",
    holds: "Vaccines do have rare, documented side effects; autism is not one of them.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Taylor, Swerdfeger and Eslick", 2014, "Vaccines are not associated with autism: An evidence-based meta-analysis of case-control and cohort studies", "Vaccine", "review", "Across cohort and case-control studies, vaccination was not associated with autism."),
      S("Hviid, Hansen, Frisch and Melbye", 2019, "Measles, mumps, rubella vaccination and autism: A nationwide cohort study", "Annals of Internal Medicine", "observational", "MMR vaccination did not increase autism risk among more than 650,000 Danish children, including those with autistic siblings.")
    ],
    query: "vaccination autism risk", related: ["antibiotics-colds", "sugar-hyperactive"]
  },
  {
    id: "antibiotics-colds", cat: "health",
    belief: "Antibiotics help you get over a cold faster.",
    feels: "Antibiotics are powerful medicine, and people often feel better a few days after taking them, which is when colds clear up anyway.",
    guess: { q: "In trials of antibiotics for the common cold, what did they do compared with placebo?", options: ["Shortened the cold", "No benefit, and more side effects", "Prevented complications in most people"], answer: 1 },
    says: "Colds are caused by viruses, which antibiotics do not act on. A Cochrane review found no benefit for the common cold and more side effects in people given antibiotics.",
    slip: "Colds get better on their own in days; whatever was taken just before the recovery gets the credit.",
    instead: "Rest, fluids and symptom relief; see a clinician if symptoms are severe or last well beyond the usual week or so.",
    holds: "Some bacterial complications do need antibiotics; that is a clinician's call, not a reason to take them for a cold.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Kenealy and Arroll", 2013, "Antibiotics for the common cold and acute purulent rhinitis", "Cochrane Database of Systematic Reviews", "review", "Antibiotics gave no benefit for the common cold and increased adverse effects compared with placebo.")
    ],
    query: "antibiotics common cold", related: ["vaccines-autism"]
  },
  {
    id: "money-happiness", cat: "money",
    belief: "Above a modest income, more money doesn't make people happier.",
    feels: "A famous 2010 study found day-to-day happiness levelled off around 75,000 dollars a year, and it fits a widely held moral intuition.",
    guess: { q: "When the original researchers and their critic re-ran the question together, what did they find above 75,000 dollars?", options: ["Happiness flat for everyone", "Happiness kept rising for most people", "Happiness fell"], answer: 1 },
    says: "Later studies with moment-by-moment data found happiness kept rising with income above 75,000 dollars for most people. A joint study by the original author and his critic found a plateau only for the least happy group.",
    slip: "A single famous number became a slogan. The popular version is a case of unlearning a correction.",
    instead: "Money raises well-being, with smaller gains per extra dollar as income rises; for the unhappiest, more money is not the fix.",
    holds: "The gains are proportional to the percentage change in income, so each extra dollar does matter less at higher incomes.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Kahneman and Deaton", 2010, "High income improves evaluation of life but not emotional well-being", "PNAS", "observational", "Emotional well-being rose with income but did not progress beyond about 75,000 dollars a year."),
      S("Killingsworth", 2021, "Experienced well-being rises with income, even above $75,000 per year", "PNAS", "observational", "With real-time sampling, well-being rose with income with no plateau."),
      S("Killingsworth, Kahneman and Mellers", 2023, "Income and emotional well-being: A conflict resolved", "PNAS", "observational", "Happiness rose with income for most people; a plateau appeared only among the least happy.")
    ],
    query: "income emotional well-being happiness", related: ["cash-transfers", "long-hours"]
  },
  {
    id: "cash-transfers", cat: "money",
    belief: "Give poor people cash and they will spend it on alcohol and cigarettes.",
    feels: "We worry about money we cannot control, and stories of misuse are memorable.",
    guess: { q: "Across studies of cash transfers, what happened to spending on alcohol and tobacco?", options: ["It rose sharply", "It did not rise, and often fell", "It doubled"], answer: 1 },
    says: "A review of studies across many countries found cash transfers did not raise spending on alcohol and tobacco, and most found it fell. In a randomised trial in Kenya, recipients spent more on food and assets with no rise in alcohol or tobacco.",
    slip: "We imagine the rare misuse; we do not see the common, ordinary spending on food, school fees and tools.",
    instead: "Cash is among the most evaluated anti-poverty tools; it is now the benchmark other programmes are tested against.",
    holds: "Most of this evidence is from low- and middle-income countries.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Evans and Popova", 2017, "Cash transfers and temptation goods", "Economic Development and Cultural Change", "review", "Cash transfers did not increase spending on alcohol and tobacco; most studies found decreases."),
      S("Haushofer and Shapiro", 2016, "The short-term impact of unconditional cash transfers to the poor: Experimental evidence from Kenya", "Quarterly Journal of Economics", "trial", "Recipients increased consumption and assets, with no increase in alcohol or tobacco spending.")
    ],
    query: "cash transfers alcohol tobacco temptation goods", related: ["welfare-work", "money-happiness"]
  },
  {
    id: "welfare-work", cat: "money",
    belief: "Giving people cash makes them stop working.",
    feels: "If you do not need to work, why would you? It is how many of us imagine we would behave.",
    guess: { q: "Across randomised evaluations of cash programmes in developing countries, what happened to work?", options: ["Work collapsed", "No systematic drop in work", "Work doubled"], answer: 1 },
    says: "Randomised evaluations of government cash programmes across several countries found no systematic reduction in work. A large US guaranteed-income trial found a small reduction, of about an hour a week.",
    slip: "We picture a dramatic exit from work; in the data, small changes dominate, and cash often funds the costs of working (transport, tools, childcare).",
    instead: "Judge cash programmes on measured work and outcomes, not on the stereotype.",
    holds: "In the US trial the drop was small but real, so 'no effect at all' would also be wrong.",
    strength: "moderate", direction: "mostly-contradicts",
    sources: [
      S("Banerjee, Hanna, Kreindler and Olken", 2017, "Debunking the stereotype of the lazy welfare recipient: Evidence from cash transfer programs", "World Bank Research Observer", "review", "Randomised evaluations of cash transfer programmes found no systematic evidence that they discourage work."),
      S("Vivalt, Rhodes, Bartik, Broockman and Miller", 2024, "The employment effects of a guaranteed income: Experimental evidence from two U.S. states", "NBER Working Paper", "trial", "1,000 dollars a month led to a small reduction in work, of about 1.3 hours a week.")
    ],
    query: "cash transfer labor supply employment", related: ["cash-transfers", "minimum-wage"]
  },
  {
    id: "minimum-wage", cat: "money",
    belief: "Raising the minimum wage destroys jobs.",
    feels: "Basic supply and demand: when something costs more, people buy less of it, including labour.",
    guess: { q: "Do economists agree on whether moderate minimum-wage increases cost jobs?", options: ["Yes, they clearly do", "No, the evidence is split", "Yes, they clearly do not"], answer: 1 },
    says: "The evidence is split. A large US study found the number of low-wage jobs essentially unchanged in the five years after state increases. Other economists reviewing the US literature conclude most studies point to some job loss, especially for teens and the least skilled.",
    slip: "Textbook supply and demand assumes competitive labour markets; where employers have more power over wages, a higher floor can cost few jobs. Which case holds is an empirical question.",
    instead: "Treat it as an open question with evidence on both sides, and watch the size of the increase relative to local wages.",
    holds: "Very large increases relative to local wages are less studied and riskier.",
    strength: "mixed", direction: "mixed",
    sources: [
      S("Cengiz, Dube, Lindner and Zipperer", 2019, "The effect of minimum wages on low-wage jobs", "Quarterly Journal of Economics", "observational", "The number of low-wage jobs remained essentially unchanged over five years after increases."),
      S("Neumark and Shirley", 2022, "Myth or measurement: What does the new minimum wage research say about minimum wages and job loss in the United States?", "Industrial Relations", "review", "Concluded the bulk of US studies point to negative employment effects, strongest for teens and the less skilled.")
    ],
    query: "minimum wage employment effects", related: ["welfare-work", "long-hours"]
  },
  {
    id: "long-hours", cat: "money",
    belief: "Working longer hours means getting more done.",
    feels: "Time in equals output out, and long hours signal commitment.",
    guess: { q: "In a study of wartime factory workers, what happened to output beyond about 55 hours a week?", options: ["It kept rising in step", "It barely rose", "It doubled"], answer: 1 },
    says: "In records of British munitions workers, output rose with hours up to around 50 a week, then flattened; hours beyond about 55 added little or nothing. A WHO and ILO study linked working 55 hours or more a week to higher deaths from stroke and heart disease.",
    slip: "Effort is visible and hours are easy to count; fatigue and errors are not.",
    instead: "Protect a sustainable working week and measure output, not hours.",
    holds: "The factory data are from one setting; knowledge work may differ, though fatigue effects are widely documented.",
    strength: "moderate", direction: "mostly-contradicts",
    sources: [
      S("Pencavel", 2015, "The productivity of working hours", "Economic Journal", "observational", "Output was roughly proportional to hours at moderate levels and rose little beyond about 50 to 55 hours a week."),
      S("Pega et al.", 2021, "Global, regional, and national burdens of ischemic heart disease and stroke attributable to exposure to long working hours", "Environment International", "review", "Working 55 or more hours a week was associated with higher risk of stroke and ischaemic heart disease deaths.")
    ],
    query: "long working hours productivity health", related: ["open-plan", "ego-depletion"]
  },
  {
    id: "open-plan", cat: "money",
    belief: "Open-plan offices make people collaborate more.",
    feels: "No walls, more chance encounters: it looks like collaboration by design.",
    guess: { q: "When two companies moved to open-plan offices, what happened to face-to-face interaction?", options: ["It rose sharply", "It fell sharply", "No change"], answer: 1 },
    says: "Measured with wearable sensors, face-to-face interaction fell by about 70% after the move, and email and messaging rose.",
    slip: "People respond to being on display by withdrawing: headphones on, conversations moved online.",
    instead: "Mix spaces: quiet areas for focus, rooms for talking, and judge them by measured interaction.",
    holds: "Two companies is a narrow base, so this is graded limited.",
    strength: "limited", direction: "contradicts",
    sources: [
      S("Bernstein and Turban", 2018, "The impact of the 'open' workspace on human collaboration", "Philosophical Transactions of the Royal Society B", "observational", "Face-to-face interaction fell by about 70% after moving to open-plan offices, while electronic interaction rose.")
    ],
    query: "open-plan office collaboration interaction", related: ["long-hours"]
  },
  {
    id: "immigration-crime", cat: "society",
    belief: "Immigrants raise crime rates.",
    feels: "Crime stories that involve immigrants get extra attention, and change in a neighbourhood can feel unsafe.",
    guess: { q: "Across US studies, how does more immigration relate to crime rates on average?", options: ["Strongly raises crime", "Weak association, slightly negative on average", "Doubles crime"], answer: 1 },
    says: "A review of US studies found the average association between immigration and crime is weak and slightly negative. Increases in undocumented immigration across US states were not linked to more violent crime.",
    slip: "Vivid cases stand in for rates. A single case says nothing about whether a group offends more or less than others.",
    instead: "Judge by measured rates, not by cases in the news.",
    holds: "Most of this evidence is from the United States; findings elsewhere vary with who migrates, their age and their circumstances.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Ousey and Kubrin", 2018, "Immigration and crime: Assessing a contentious issue", "Annual Review of Criminology", "review", "The overall association between immigration and crime across studies was weak and slightly negative."),
      S("Light and Miller", 2018, "Does undocumented immigration increase violent crime?", "Criminology", "observational", "Undocumented immigration was not associated with increases in violent crime.")
    ],
    query: "immigration crime rates", related: ["harsher-sentences", "broken-windows"]
  },
  {
    id: "housing-first", cat: "society",
    belief: "People who are homeless need to get sober and stable before they can keep a home.",
    feels: "Stability seems like something earned in steps, and giving a home first feels like skipping them.",
    guess: { q: "In randomised trials, how did giving housing first (with support) affect staying housed?", options: ["Worse than treatment first", "Much better", "No difference"], answer: 1 },
    says: "Randomised trials found Housing First greatly improved housing stability compared with usual services. Effects on substance use and mental health were mixed.",
    slip: "Treatment is much harder without a stable place to live; requiring it first blocks the step that makes the rest possible.",
    instead: "Offer housing with support, without preconditions, and add treatment alongside.",
    holds: "Housing alone does not fix addiction or mental illness; the evidence for those outcomes is mixed.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Aubry et al.", 2016, "A multiple-city RCT of Housing First with Assertive Community Treatment for homeless Canadians with serious mental illness", "Psychiatric Services", "trial", "Housing First participants spent much more time stably housed than those receiving usual services."),
      S("Baxter, Tweed, Katikireddi and Thomson", 2019, "Effects of Housing First approaches on health and well-being of adults who are homeless or at risk of homelessness: Systematic review and meta-analysis of randomised controlled trials", "Journal of Epidemiology and Community Health", "review", "Housing First substantially improved housing stability; effects on health and substance use were mixed.")
    ],
    query: "housing first homelessness randomized", related: ["drug-decriminalisation", "cash-transfers"]
  },
  {
    id: "drug-decriminalisation", cat: "society",
    belief: "Decriminalising drug possession leads to a surge in drug use.",
    feels: "Removing a penalty seems like giving permission.",
    guess: { q: "After Portugal decriminalised personal possession in 2001, what happened to drug use?", options: ["It surged", "No major increase, and drug harms fell", "It disappeared"], answer: 1 },
    says: "Portugal saw no major increase in drug use after 2001, and saw falls in problematic use, drug-related harms and prison crowding. A study of Oregon's 2021 decriminalisation found no link to overdose deaths once the arrival of fentanyl was accounted for.",
    slip: "The penalty is rarely what keeps most people from drugs, and criminal records make treatment and work harder.",
    instead: "Pair decriminalisation with treatment capacity, as Portugal did.",
    holds: "Portugal expanded treatment at the same time, so its result is the package, not decriminalisation alone. Oregon reversed its law in 2024 amid concerns about public drug use.",
    strength: "moderate", direction: "mostly-contradicts",
    sources: [
      S("Hughes and Stevens", 2010, "What can we learn from the Portuguese decriminalization of illicit drugs?", "British Journal of Criminology", "observational", "No major increase in drug use; reductions in problematic use, drug-related harms and prison overcrowding."),
      S("Joshi et al.", 2023, "Association between fatal drug overdose and Oregon's decriminalization of possession", "JAMA Psychiatry", "observational", "No association with fatal overdose rates after accounting for the spread of fentanyl.")
    ],
    query: "drug decriminalization use overdose", related: ["housing-first", "harsher-sentences"]
  },
  {
    id: "disaster-panic", cat: "society",
    belief: "In a disaster, people panic and turn on each other.",
    feels: "Films and news coverage show stampedes and looting, and we fear that the thin veneer of civilisation cracks under pressure.",
    guess: { q: "When researchers interviewed survivors of real emergencies, what was the most common behaviour?", options: ["Selfish panic", "Helping strangers", "Freezing alone"], answer: 1 },
    says: "Studies of real emergencies find that mass panic is rare and that people commonly help each other, including strangers. Survivors describe a shared identity forming in the crowd, which makes helping more likely.",
    slip: "Panic and looting make vivid stories; ordinary cooperation does not make the news, so we remember the exceptions.",
    instead: "Plan for disasters by trusting and informing the public, rather than withholding information for fear of panic.",
    holds: "Crushes do happen in dense crowds, usually from physical pressure and poor exits, not from people turning on each other.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Drury, Cocking and Reicher", 2009, "Everyone for themselves? A comparative study of crowd solidarity among emergency survivors", "British Journal of Social Psychology", "observational", "Survivors of emergencies reported more helping than selfish behaviour; a sense of shared identity predicted helping.")
    ],
    query: "crowd behaviour emergency panic mass evacuation", related: ["bystander-effect", "stanford-prison"]
  },
  {
    id: "bystander-effect", cat: "society",
    belief: "In public, bystanders usually stand by and nobody helps.",
    feels: "The bystander effect is one of the best-known findings in psychology, and the story of people ignoring a crime is often retold.",
    guess: { q: "In camera footage of real public fights in three countries, how often did at least one bystander intervene?", options: ["About 1 in 10 cases", "About half", "About 9 in 10 cases"], answer: 2 },
    says: "Analysing camera footage of real public conflicts in three countries, researchers found at least one bystander intervened in about nine in ten cases, and larger groups made intervention more likely, not less.",
    slip: "Laboratory studies show each person feels less responsible in a group, but in a real crowd that only takes one helper, and more people means more chances of one.",
    instead: "Expect help and ask for it directly: pointing at one person and asking makes a clear responsibility.",
    holds: "Each individual in a crowd may be a little less likely to act; it is the group as a whole that usually helps.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Philpot, Liebst, Levine, Bernasco and Lindegaard", 2020, "Would I be helped? Cross-national CCTV footage shows that intervention is the norm in public conflicts", "American Psychologist", "observational", "At least one bystander intervened in about 91% of recorded public conflicts, and more bystanders raised the chance of intervention.")
    ],
    query: "bystander intervention public conflict", related: ["disaster-panic", "stanford-prison"]
  },
  {
    id: "stanford-prison", cat: "retold",
    classic: { then: "1971: Zimbardo's prison experiment becomes the textbook proof that power corrupts", now: "2019: the archives show the guards were coached to be tough" },
    belief: "The Stanford prison experiment shows ordinary people turn cruel when given power.",
    feels: "The story is told in nearly every introductory psychology course, and it matches what we fear about human nature.",
    guess: { q: "What did later examination of the experiment's archives show about the guards' behaviour?", options: ["It arose spontaneously", "Guards were coached toward toughness", "Nothing could be learned"], answer: 1 },
    says: "Archival recordings and interviews show the guards were encouraged by the experimenters to be tough, and some were acting a role. A later prison study run by other researchers did not find guards spontaneously becoming cruel.",
    slip: "A dramatic study became a parable before its methods were scrutinised.",
    instead: "Cruelty in institutions is better explained by leadership, identity and instruction than by power alone.",
    holds: "Situations do shape behaviour; the claim that power alone turns ordinary people cruel is what the evidence does not show.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Le Texier", 2019, "Debunking the Stanford Prison Experiment", "American Psychologist", "narrative", "Archival material shows guards were given instructions and expectations about how to behave, undermining the claim of spontaneous cruelty."),
      S("Reicher and Haslam", 2006, "Rethinking the psychology of tyranny: The BBC prison study", "British Journal of Social Psychology", "trial", "Guards did not spontaneously embrace their role; group identity and leadership shaped what happened.")
    ],
    query: "Stanford prison experiment tyranny social identity", related: ["milgram-obedience", "lord-of-the-flies", "kitty-genovese"]
  },
  {
    id: "contact-conflict", cat: "society",
    belief: "Mixing groups that distrust each other only breeds conflict.",
    feels: "Tension is most visible where groups meet, so keeping them apart seems the way to keep the peace.",
    guess: { q: "Across more than 500 studies, how did contact between groups relate to prejudice?", options: ["Raised prejudice", "Lowered prejudice", "No relation"], answer: 1 },
    says: "A meta-analysis of more than 500 studies found that contact between groups typically reduces prejudice, including when ideal conditions are not all met.",
    slip: "We notice clashes where groups meet and do not see the quiet reduction in suspicion that contact usually brings.",
    instead: "Create regular, equal-status contact around shared goals: mixed teams, classrooms and neighbourhoods.",
    holds: "Hostile or forced contact can backfire; the benefit is strongest under cooperation and support from authorities.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Pettigrew and Tropp", 2006, "A meta-analytic test of intergroup contact theory", "Journal of Personality and Social Psychology", "review", "Across 515 studies, intergroup contact typically reduced intergroup prejudice.")
    ],
    query: "intergroup contact prejudice reduction", related: ["immigration-crime", "disaster-panic"]
  },
  {
    id: "more-police", cat: "crime",
    belief: "Hiring more police officers does not reduce crime.",
    feels: "Crime has deep causes such as poverty, so more officers can look like treating the symptom.",
    guess: { q: "In US cities, what did studies find when police numbers rose?", options: ["Crime unchanged", "Crime fell, especially homicide", "Crime rose"], answer: 1 },
    says: "Studies of US cities find that more police officers reduce crime, especially homicide. The same research finds more arrests for low-level offences, so the gains come with costs that fall unevenly.",
    slip: "Deep causes and police presence are not either-or: the chance of being caught deters, whatever the underlying causes.",
    instead: "Weigh both sides: more officers lower serious violence, and how they police decides how many low-level arrests come with it.",
    holds: "This is about the number of officers, not about any particular tactic such as arrest-led crackdowns (see broken windows).",
    strength: "moderate", direction: "complicates",
    sources: [
      S("Chalfin and McCrary", 2018, "Are U.S. cities underpoliced? Theory and evidence", "Review of Economics and Statistics", "observational", "Additional police reduced crime, with the largest effects on violent crime."),
      S("Chalfin, Hansen, Weisburst and Williams", 2022, "Police force size and civilian race", "American Economic Review: Insights", "observational", "Each additional officer prevented homicides, with larger reductions for Black victims, and increased arrests for low-level offences.")
    ],
    query: "police force size crime", related: ["harsher-sentences", "broken-windows"]
  },
  {
    id: "three-strikes", cat: "crime",
    belief: "Three-strikes laws are a cost-effective way to cut crime.",
    feels: "Locking up repeat offenders for long terms sounds like it must stop the people who commit most crime.",
    guess: { q: "What did studies of California's three-strikes law find?", options: ["Large, cheap crime drop", "Some deterrence at a very high cost per crime avoided", "Crime doubled"], answer: 1 },
    says: "One study found the law deterred some offending among people with two strikes, but at a very high cost per crime avoided. A book-length analysis found little decline in crime that could be credited to it.",
    slip: "The people a long sentence keeps inside are often past the age when most offending happens, so each extra year buys less.",
    instead: "Spend on raising the chance of being caught and on programmes that lower reoffending.",
    holds: "Some deterrence among eligible offenders appears real; the dispute is about its size and cost.",
    strength: "mixed", direction: "mixed",
    sources: [
      S("Helland and Tabarrok", 2007, "Does three strikes deter? A nonparametric estimation", "Journal of Human Resources", "observational", "Found a deterrent effect on felony arrests among two-strike offenders, at a high cost per crime avoided."),
      S("Zimring, Hawkins and Kamin", 2001, "Punishment and Democracy: Three Strikes and You're Out in California", "Oxford University Press", "observational", "Found little of California's crime decline attributable to the three-strikes law.")
    ],
    query: "three strikes law deterrence crime", related: ["harsher-sentences", "prison-reoffending"]
  },
  {
    id: "mozart-effect", cat: "children",
    belief: "Listening to Mozart makes children smarter.",
    feels: "A famous 1993 study reported a boost in spatial reasoning, and music and intelligence both feel like refinement.",
    guess: { q: "Pooling dozens of studies, how large was the 'Mozart effect' on spatial ability?", options: ["Large and lasting", "Small and short-lived at most", "Negative"], answer: 1 },
    says: "Meta-analyses find little or no effect of listening to Mozart on spatial ability, and what effect exists is small, brief and seen with other music too. It was never about babies or general intelligence.",
    slip: "A small, short-lived effect in adults became a product for babies.",
    instead: "Playing music, singing and making things together with a child are worthwhile for their own sake.",
    holds: "Learning to play an instrument is a different question from listening to recordings.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Chabris", 1999, "Prelude or requiem for the 'Mozart effect'?", "Nature", "review", "Pooled studies showed a small effect that could be explained by enjoyment and arousal."),
      S("Pietschnig, Voracek and Formann", 2010, "Mozart effect-Shmozart effect: A meta-analysis", "Intelligence", "review", "Found little evidence for a specific enhancement of spatial task performance from listening to Mozart.")
    ],
    query: "Mozart effect spatial reasoning music listening", related: ["learning-styles", "teach-vs-play"]
  },
  {
    id: "screens-teens", cat: "children",
    belief: "Smartphones and social media are the main cause of teenage unhappiness.",
    feels: "Teen distress rose in the same years phones spread, and we can see how absorbed teenagers are.",
    guess: { q: "In large datasets, how much of the variation in teenage well-being did technology use explain?", options: ["Most of it", "A very small share", "None at all"], answer: 1 },
    says: "Large analyses find the association between digital technology use and adolescent well-being is negative but very small, explaining well under one percent of the variation. Other researchers argue that heavy social media use, especially for girls, does real harm. The evidence is split on how much.",
    slip: "Two trends that rise together are easy to link; most of the data is correlational and cannot show which way the effect runs.",
    instead: "Look at what is displaced (sleep, exercise, time with friends) and at heavy use, rather than total screen time.",
    holds: "Some studies, particularly on heavy social media use among girls, find larger harms; this entry is graded mixed for that reason.",
    strength: "mixed", direction: "mixed",
    sources: [
      S("Orben and Przybylski", 2019, "The association between adolescent well-being and digital technology use", "Nature Human Behaviour", "observational", "Technology use explained at most 0.4% of the variation in adolescent well-being."),
      S("Twenge, Joiner, Rogers and Martin", 2018, "Increases in depressive symptoms, suicide-related outcomes, and suicide rates among U.S. adolescents after 2010 and links to increased new media screen time", "Clinical Psychological Science", "observational", "Argued that rising screen time is linked to rising depressive symptoms in US adolescents.")
    ],
    query: "adolescent wellbeing digital technology social media use", related: ["growth-mindset", "learning-styles"]
  },
  {
    id: "grade-retention", cat: "children",
    belief: "Holding struggling children back a year helps them catch up.",
    feels: "Another year at the same level sounds like a chance to master what was missed.",
    guess: { q: "Across older studies of grade retention, how did retained children do later?", options: ["Clearly better", "No better, often worse", "Far better"], answer: 1 },
    says: "A review of decades of studies found retained children did no better, and often worse, than similar promoted children. Some newer studies of early-grade retention with extra support find short-term gains that tend to fade.",
    slip: "Repeating the same teaching addresses time, not the reason the child struggled.",
    instead: "Targeted support while moving forward, such as tutoring and teaching at the right level.",
    holds: "Retention paired with intensive extra support in the earliest grades shows some short-term benefit.",
    strength: "moderate", direction: "mostly-contradicts",
    sources: [
      S("Jimerson", 2001, "Meta-analysis of grade retention research: Implications for practice in the 21st century", "School Psychology Review", "review", "Retention was not associated with better achievement or adjustment compared with matched promoted peers."),
      S("Schwerdt, West and Winters", 2017, "The effects of test-based retention on student outcomes over time: Regression discontinuity evidence from Florida", "Journal of Public Economics", "observational", "Third-grade retention with support raised short-term achievement, with gains fading over time.")
    ],
    query: "grade retention student outcomes", related: ["learning-styles", "study-rereading"]
  },
  {
    id: "peanut-avoidance", cat: "health",
    belief: "Keeping peanuts away from babies prevents peanut allergy.",
    feels: "If something can cause a dangerous allergy, keeping a baby away from it seems like the safe choice, and this was once official advice.",
    guess: { q: "In a randomised trial of high-risk infants, what did eating peanut early do to peanut allergy by age five?", options: ["Raised it", "Lowered it sharply", "No difference"], answer: 1 },
    says: "In a randomised trial, high-risk infants who ate peanut regularly from early in life were far less likely to have peanut allergy at age five than those who avoided it. Guidelines changed as a result.",
    slip: "Avoidance seemed protective, but the immune system can learn tolerance from early eating.",
    instead: "Follow current paediatric guidance on introducing peanut early, especially for babies at high risk, with medical advice where eczema or egg allergy is present.",
    holds: "For a baby who already has a peanut allergy, avoidance is still right; this is about prevention.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Du Toit et al.", 2015, "Randomized trial of peanut consumption in infants at risk for peanut allergy", "New England Journal of Medicine", "trial", "Early introduction of peanut sharply reduced peanut allergy at five years among high-risk infants."),
      S("Togias et al.", 2017, "Addendum guidelines for the prevention of peanut allergy in the United States", "Journal of Allergy and Clinical Immunology", "consensus", "An expert panel convened by the US National Institute of Allergy and Infectious Diseases recommended introducing peanut-containing foods in infancy rather than delaying them.")
    ],
    query: "early peanut introduction infant allergy prevention", related: ["vaccines-autism", "antibiotics-colds"]
  },
  {
    id: "left-right-brain", cat: "mind",
    belief: "People are left-brained (logical) or right-brained (creative).",
    feels: "The two hemispheres do some different things, and the labels are an easy way to describe personality.",
    guess: { q: "When researchers scanned more than 1,000 brains, did they find people who were left- or right-brain dominant?", options: ["Yes, clearly", "No", "Only in artists"], answer: 1 },
    says: "Some functions lean to one hemisphere, such as language to the left in most people, but a large brain-imaging study found no evidence that individuals are left- or right-brain dominant overall.",
    slip: "Real findings about specific functions were stretched into a personality type.",
    instead: "Treat logic and creativity as skills anyone can build; both use networks across the whole brain.",
    holds: "Lateralisation of specific functions is real and well established.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Nielsen, Zielinski, Ferguson, Lainhart and Anderson", 2013, "An evaluation of the left-brain vs. right-brain hypothesis with resting state functional connectivity magnetic resonance imaging", "PLoS ONE", "observational", "Found no evidence that individuals have stronger left- or right-hemisphere networks overall.")
    ],
    query: "hemispheric lateralization personality left brain right brain", related: ["learning-styles", "memory-video"]
  },
  {
    id: "multitasking", cat: "mind",
    belief: "Multitasking lets you get more done.",
    feels: "Switching between tasks feels busy and productive, and heavy multitaskers often feel skilled at it.",
    guess: { q: "In tests of task switching, how did heavy media multitaskers do compared with light ones?", options: ["Better", "Worse", "The same"], answer: 1 },
    says: "In experiments, heavy media multitaskers did worse at switching tasks and filtering out distraction. Reviews of later work find the pattern is less consistent, but none find multitaskers do better.",
    slip: "Feeling busy is not the same as getting more done; each switch costs time and attention.",
    instead: "Batch similar work and protect blocks of time for one task.",
    holds: "Doing something automatic, like walking, while thinking is a different case.",
    strength: "moderate", direction: "mostly-contradicts",
    sources: [
      S("Ophir, Nass and Wagner", 2009, "Cognitive control in media multitaskers", "PNAS", "trial", "Heavy media multitaskers performed worse on a test of task switching and were more susceptible to distraction."),
      S("Uncapher and Wagner", 2018, "Minds and brains of media multitaskers: Current findings and future directions", "PNAS", "review", "Findings are mixed, with a tendency for heavy media multitaskers to perform worse on memory and attention tasks.")
    ],
    query: "media multitasking cognitive control", related: ["long-hours", "ego-depletion"]
  },
  {
    id: "opposites-attract", cat: "mind",
    belief: "Opposites attract.",
    feels: "Partners often bring different strengths, and couples tell stories about how different they are.",
    guess: { q: "Across many studies, what predicted attraction better?", options: ["Being different", "Being similar", "Neither"], answer: 1 },
    says: "A meta-analysis found that actual similarity predicts attraction, especially in early encounters. People also tend to pair with partners similar in age, education and values.",
    slip: "Differences stand out and make good stories; the many similarities between partners go unnoticed.",
    instead: "Look for shared values and interests; differences in skills can complement but are not what draws people together.",
    holds: "In longer relationships, how similar people believe they are matters more than measured similarity.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Montoya, Horton and Kirchner", 2008, "Is actual similarity necessary for attraction? A meta-analysis of actual and perceived similarity", "Journal of Social and Personal Relationships", "review", "Actual similarity predicted attraction in no-interaction and short-interaction studies; perceived similarity mattered in existing relationships.")
    ],
    query: "similarity attraction meta-analysis", related: ["better-than-average"]
  },
  {
    id: "hot-hand", cat: "mind",
    belief: "The 'hot hand' in basketball is a myth: streaks are pure chance.",
    feels: "A famous 1985 study found no hot hand, and it became the textbook example of seeing patterns in randomness.",
    guess: { q: "When economists re-analysed the original data with a correction for a subtle statistical bias, what did they find?", options: ["Still no hot hand", "Evidence of a modest hot hand", "A huge hot hand"], answer: 1 },
    says: "A statistical bias in how streaks were measured hid a real effect. Corrected, the original data show evidence of a modest hot hand. This is a case of unlearning a debunking.",
    slip: "The original method expected the wrong baseline for a random sequence, so randomness looked like it fit.",
    instead: "Expect modest streakiness in skilled performance, while still being careful about seeing patterns in noise.",
    holds: "People still overestimate streaks in many settings; the hot hand is real but smaller than fans believe.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Gilovich, Vallone and Tversky", 1985, "The hot hand in basketball: On the misperception of random sequences", "Cognitive Psychology", "observational", "Found no evidence that hitting a shot raised the chance of hitting the next."),
      S("Miller and Sanjurjo", 2018, "Surprised by the hot hand fallacy? A truth in the law of small numbers", "Econometrica", "observational", "Showed a selection bias in streak analysis; correcting it reverses the original conclusion and reveals a hot hand.")
    ],
    query: "hot hand fallacy streak shooting", related: ["better-than-average", "money-happiness"]
  },
  {
    id: "knuckle-cracking", cat: "health",
    belief: "Cracking your knuckles causes arthritis.",
    feels: "The popping sound seems like damage, and parents and teachers have warned against it for generations.",
    guess: { q: "In a study comparing habitual knuckle crackers with non-crackers, how did arthritis rates in the hand compare?", options: ["Much higher in crackers", "No clear difference", "Lower in crackers"], answer: 1 },
    says: "A study comparing people who habitually crack their knuckles with those who do not found no difference in hand osteoarthritis.",
    slip: "The sound is gas bubbles in the joint fluid, not bone grinding.",
    instead: "If it is painful or a joint swells, see a clinician; otherwise there is no arthritis reason to stop.",
    holds: "The evidence base is small, so this is graded limited.",
    strength: "limited", direction: "contradicts",
    sources: [
      S("deWeber, Olszewski and Ortolano", 2011, "Knuckle cracking and hand osteoarthritis", "Journal of the American Board of Family Medicine", "observational", "Habitual knuckle cracking was not associated with hand osteoarthritis.")
    ],
    query: "knuckle cracking osteoarthritis", related: ["water-8-glasses"]
  },
  {
    id: "water-8-glasses", cat: "health",
    belief: "Everyone needs to drink eight glasses of water a day.",
    feels: "Water is healthy, the rule is easy to remember, and it is repeated everywhere.",
    guess: { q: "What did a physiologist find when searching for the scientific basis of the eight-glasses rule?", options: ["Strong trial evidence", "No scientific evidence for it", "Evidence for twelve glasses"], answer: 1 },
    says: "A review of the literature found no scientific evidence for the rule. Healthy people get much of their water from food and other drinks, and thirst regulates intake well.",
    slip: "A recommendation for total water, much of it from food, was remembered as a rule for drinking water alone.",
    instead: "Drink when thirsty, more in heat or exercise, and follow medical advice for specific conditions.",
    holds: "Some people, such as older adults, athletes in heat and people with kidney stones, need to pay closer attention.",
    strength: "moderate", direction: "unsupported",
    sources: [
      S("Valtin", 2002, "\"Drink at least eight glasses of water a day.\" Really? Is there scientific evidence for \"8 x 8\"?", "American Journal of Physiology: Regulatory, Integrative and Comparative Physiology", "narrative", "Found no scientific studies supporting the recommendation for healthy adults in a temperate climate.")
    ],
    query: "daily water intake recommendation hydration", related: ["knuckle-cracking", "low-fat-diet"]
  },
  {
    id: "low-fat-diet", cat: "health",
    belief: "A low-fat diet is the best way to lose weight.",
    feels: "Fat has the most calories per gram, and low-fat was official advice for decades.",
    guess: { q: "In a year-long randomised trial of healthy low-fat versus healthy low-carb diets, which lost more weight?", options: ["Low-fat", "No significant difference", "Low-carb, by far"], answer: 1 },
    says: "A large randomised trial found no significant difference in weight loss after 12 months between healthy low-fat and healthy low-carbohydrate diets.",
    slip: "One macronutrient got the blame; what mattered more was eating whole foods and eating less overall.",
    instead: "Pick a healthy eating pattern you can keep up; the label matters less than sticking with it.",
    holds: "Individuals differ; the trial compares averages.",
    strength: "strong", direction: "unsupported",
    sources: [
      S("Gardner et al.", 2018, "Effect of low-fat vs low-carbohydrate diet on 12-month weight loss in overweight adults and the association with genotype pattern or insulin secretion: The DIETFITS randomized clinical trial", "JAMA", "trial", "No significant difference in 12-month weight loss between healthy low-fat and healthy low-carbohydrate diets."),
      S("Johnston et al.", 2014, "Comparison of weight loss among named diet programs in overweight and obese adults: a meta-analysis", "JAMA", "review", "Low-carbohydrate and low-fat diets both produced weight loss at 12 months; differences between named diets were small.")
    ],
    query: "low-fat low-carbohydrate diet weight loss trial", related: ["water-8-glasses", "stretching-injury"]
  },
  {
    id: "stretching-injury", cat: "health",
    belief: "Stretching before exercise prevents injuries.",
    feels: "Warming up feels right, and stretching was taught in every sports class.",
    guess: { q: "In a large trial of army recruits, how did stretching before exercise change injury risk?", options: ["Cut it sharply", "No meaningful reduction", "Raised it"], answer: 1 },
    says: "A large trial in army recruits found pre-exercise stretching did not meaningfully reduce injuries. A meta-analysis found stretching showed no clear benefit, while strength training substantially reduced sports injuries.",
    slip: "Feeling looser is not the same as being protected.",
    instead: "Strength training and a gradual warm-up into the activity itself.",
    holds: "Stretching can improve flexibility, which some sports need for performance.",
    strength: "strong", direction: "unsupported",
    sources: [
      S("Pope, Herbert, Kirwan and Graham", 2000, "A randomized trial of preexercise stretching for prevention of lower-limb injury", "Medicine and Science in Sports and Exercise", "trial", "Pre-exercise stretching did not produce a useful reduction in injury risk."),
      S("Lauersen, Bertelsen and Andersen", 2014, "The effectiveness of exercise interventions to prevent sports injuries: A systematic review and meta-analysis of randomised controlled trials", "British Journal of Sports Medicine", "review", "Stretching showed no beneficial effect; strength training reduced sports injuries.")
    ],
    query: "stretching injury prevention exercise", related: ["low-fat-diet"]
  },
  {
    id: "lottery-misery", cat: "money",
    belief: "Winning the lottery makes people miserable.",
    feels: "Stories of winners who went broke or fell apart are memorable, and they fit the idea that money cannot buy happiness.",
    guess: { q: "Years after a large win, how satisfied with life were Swedish lottery winners compared with similar non-winners?", options: ["Less satisfied", "More satisfied", "The same"], answer: 1 },
    says: "Studies of Swedish lottery players found large winners reported higher life satisfaction for years afterwards, compared with similar players who won less.",
    slip: "The rare disaster stories are told; the many winners who are simply better off are not news.",
    instead: "Money improves life satisfaction; see also the entry on money and happiness.",
    holds: "Effects on day-to-day mood were smaller than on overall life satisfaction.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Lindqvist, Östling and Cesarini", 2020, "Long-run effects of lottery wealth on psychological well-being", "Review of Economic Studies", "observational", "Large prizes led to sustained increases in overall life satisfaction among Swedish lottery players.")
    ],
    query: "lottery wealth wellbeing life satisfaction", related: ["money-happiness", "cash-transfers"]
  },
  {
    id: "big-bonuses", cat: "money",
    belief: "The bigger the bonus, the better people perform.",
    feels: "Incentives work, so larger incentives should work better.",
    guess: { q: "In experiments where rewards equalled months of pay, what happened on tasks needing skill and concentration?", options: ["Performance rose", "Performance fell", "No change"], answer: 1 },
    says: "In experiments in India, very large rewards lowered performance on several tasks needing concentration and skill compared with smaller rewards.",
    slip: "Pressure helps simple effort tasks but can choke performance that needs focus.",
    instead: "Match incentives to the task: moderate rewards for skilled work, and attention to purpose and conditions.",
    holds: "For simple, mechanical tasks, higher pay did improve performance in the same study.",
    strength: "limited", direction: "complicates",
    sources: [
      S("Ariely, Gneezy, Loewenstein and Mazar", 2009, "Large stakes and big mistakes", "Review of Economic Studies", "trial", "Very high rewards led to worse performance on several cognitive tasks than moderate rewards.")
    ],
    query: "incentive size performance choking", related: ["rewards-motivation", "long-hours"]
  },
  {
    id: "milgram-obedience", cat: "retold",
    classic: { then: "1963: Milgram's shock experiments seem to show most people will hurt a stranger on command", now: "2010s: archives and re-analyses show obedience varied widely and direct orders were often refused" },
    belief: "Milgram proved that most people will blindly hurt a stranger if an authority tells them to.",
    feels: "The footage is unforgettable, the headline number (most participants went to the highest switch) is quoted everywhere, and it seemed to explain how ordinary people took part in atrocities.",
    guess: { q: "In a re-run of Milgram's procedure, when did people keep going: when given a direct order, or when told the work mattered for science?", options: ["When given a direct order", "When told it mattered for science", "Nobody kept going in either case"], answer: 1 },
    says: "Obedience swung widely across Milgram's own variations, from most people to very few. Archival work found many participants doubted the shocks were real. In a later analogue, people went on when told the research needed it, and tended to refuse when simply ordered. A partial replication that stopped at a lower level found willingness to continue similar to Milgram's.",
    slip: "One condition of many became the whole story, and \"obeying orders\" was read into behaviour that looks more like believing in the cause.",
    instead: "Ask what people believe they are contributing to. Harm is easier to prevent by challenging the cause than by assuming people are sheep.",
    holds: "People do defer to authority to a worrying degree, and the partial replication shows it is not just a product of the 1960s. What the evidence undercuts is \"blind\" obedience to orders.",
    strength: "moderate", direction: "complicates",
    sources: [
      S("Burger", 2009, "Replicating Milgram: Would people still obey today?", "American Psychologist", "replication", "A partial replication stopping at 150 volts found rates of continuing similar to Milgram's comparable condition."),
      S("Haslam, Reicher and Birney", 2014, "Nothing by mere authority: Evidence that in an experimental analogue of the Milgram paradigm participants are motivated not by orders but by appeals to science", "Journal of Social Issues", "trial", "Participants continued in response to appeals to the scientific goal, and the prod that was a direct order tended to produce refusal."),
      S("Haslam and Reicher", 2012, "Contesting the nature of conformity: What Milgram and Zimbardo's studies really show", "PLoS Biology", "narrative", "Argues both classics show engaged followership with a cause, not passive conformity to orders.")
    ],
    query: "Milgram obedience authority replication", related: ["stanford-prison", "kitty-genovese", "lord-of-the-flies"]
  },
  {
    id: "kitty-genovese", cat: "retold",
    classic: { then: "1964: a newspaper reports that 38 neighbours watched Kitty Genovese's murder and did nothing", now: "2007: later research finds few saw the attack, and some did call the police" },
    belief: "Thirty-eight neighbours watched Kitty Genovese being murdered and did nothing.",
    feels: "The story ran on the front page, launched decades of research on bystanders, and became shorthand for city people's indifference.",
    guess: { q: "What did later investigation find about the \"38 witnesses\"?", options: ["The number was accurate", "Few people saw the attack, and some called the police", "Nobody heard anything at all"], answer: 1 },
    says: "Later research found no good evidence for 38 eyewitnesses: few people saw any part of the attack, and at least one person called the police. The story became a parable about apathy, and that parable shaped how psychology studied helping for decades.",
    slip: "A shocking number gave a moral to a tragedy, and the moral outlived the facts.",
    instead: "Expect people to help: video studies of real street conflicts find intervention is the norm, so the task is to make helping easier.",
    holds: "People can hold back when responsibility is unclear; the evidence argues against the claim that crowds simply watch.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Manning, Levine and Collins", 2007, "The Kitty Genovese murder and the social psychology of helping: The parable of the 38 witnesses", "American Psychologist", "narrative", "The evidence does not support the claim of 38 eyewitnesses who did nothing; the story functioned as a parable that shaped research."),
      S("Philpot, Liebst, Levine, Bernasco and Lindegaard", 2020, "Would I be helped? Cross-national CCTV footage shows that intervention is the norm in public conflicts", "American Psychologist", "observational", "In public conflicts filmed in three countries, at least one bystander intervened in the large majority of cases.")
    ],
    query: "bystander intervention Kitty Genovese helping", related: ["bystander-effect", "milgram-obedience", "disaster-panic"]
  },
  {
    id: "lord-of-the-flies", cat: "retold",
    classic: { then: "1954: Golding's novel tells of stranded boys turning savage, and is taught as a lesson about human nature", now: "1965: six real boys stranded on an island cooperated for more than a year" },
    belief: "Left alone, children turn on each other, just as in Lord of the Flies.",
    feels: "The novel is read in schools around the world and feels like an honest look at what lies under civilisation.",
    guess: { q: "In 1965, six Tongan boys were stranded on an uninhabited island for more than a year. What happened?", options: ["They split into gangs and fought", "They cooperated, kept a fire going and nursed an injured boy", "They did not survive"], answer: 1 },
    says: "When six boys were really shipwrecked on 'Ata, they shared work in shifts, kept a fire burning, settled quarrels by separating for a while, and looked after a boy who broke his leg until they were rescued.",
    slip: "A novel is a thought experiment, not evidence, but a vivid story is remembered like a fact.",
    instead: "Treat fiction about human nature as a question to test. Where groups do turn cruel, look for the conditions that made it so.",
    holds: "One real case is an anecdote, not a study, and children can and do bully each other. What fails is the use of a novel as proof of what people are like.",
    strength: "limited", direction: "contradicts",
    sources: [
      S("Bregman", 2020, "Humankind: A Hopeful History", "Bloomsbury", "narrative", "Recounts the 1965 'Ata castaways, drawn from interviews with the survivors and their rescuer, as a real counterpart to the novel.")
    ],
    query: "children cooperation group conflict human nature", related: ["stanford-prison", "disaster-panic", "contact-conflict"]
  },
  {
    id: "easter-island", cat: "retold",
    classic: { then: "2005: Easter Island becomes the famous example of a society that destroyed itself by cutting down its trees", now: "2020 to 2024: dating, farming surveys and ancient DNA find no collapse before Europeans arrived" },
    belief: "Easter Islanders cut down all their trees and destroyed their own society.",
    feels: "Giant statues on a bare island make a haunting picture, and the story works as a warning about our own planet.",
    guess: { q: "What do recent studies say about Rapa Nui's population before Europeans arrived?", options: ["It crashed from self-inflicted collapse", "It stayed small and stable, with no sign of a crash", "It grew tenfold"], answer: 1 },
    says: "Models built on radiocarbon dates find no sign of a population crash before European contact. A survey of the island's rock gardens suggests the farmland could feed only a few thousand people, so there was never a huge population to collapse, and ancient genomes show no sign of a population crash in that period. The catastrophe came after contact, with disease and slave raids.",
    slip: "The island lost its forest, and a tidy moral was drawn from that before the people's own history was checked.",
    instead: "Look for how people adapted to a hard place: the islanders kept farming with rock gardens for centuries.",
    holds: "The forest really was lost, and human activity and introduced rats played a part. The dispute is about whether this caused a social collapse.",
    strength: "moderate", direction: "mostly-contradicts",
    sources: [
      S("DiNapoli, Rieth, Lipo and Hunt", 2020, "A model-based approach to the tempo of collapse: The case of Rapa Nui (Easter Island)", "Nature Communications", "observational", "Radiocarbon-based modelling shows no population decline before European contact."),
      S("Davis et al.", 2024, "Island-wide characterization of agricultural production challenges the demographic collapse hypothesis for Rapa Nui (Easter Island)", "Science Advances", "observational", "Rock garden farmland mapped by satellite could support a population of a few thousand, far below earlier estimates."),
      S("Moreno-Mayar et al.", 2024, "Ancient Rapanui genomes reveal resilience and pre-European contact with the Americas", "Nature", "observational", "Genomes of past islanders show no genetic bottleneck that a population collapse would leave.")
    ],
    query: "Rapa Nui Easter Island population collapse", related: ["disaster-panic", "lord-of-the-flies", "stanford-prison"]
  },
  {
    id: "marshmallow-test", cat: "retold",
    classic: { then: "1990: children who waited for a second marshmallow seem to do better as teenagers", now: "2018: a larger, more varied study finds the link much weaker once family background is counted" },
    belief: "A child's ability to wait for a second marshmallow predicts how well they will do in life.",
    feels: "It is a charming test with a big promise: a few minutes at age four tell you about someone's future.",
    guess: { q: "In a larger study with more varied families, how much did waiting at age four predict achievement at fifteen once family background was taken into account?", options: ["As strongly as the original", "Much less", "It was never measured"], answer: 1 },
    says: "In a conceptual replication with children from more varied backgrounds, the link between waiting and later achievement was about half the original size, and became much smaller once family background and early abilities were taken into account. Other work shows children wait longer when the adults around them have kept their promises.",
    slip: "The original children were mostly from one university community, so a test of circumstances looked like a test of character.",
    instead: "Build children's trust that waiting pays off, by keeping promises, rather than drilling willpower.",
    holds: "Self-control does matter; the test measures it mixed with a child's circumstances, which is why the link shrinks.",
    strength: "moderate", direction: "complicates",
    sources: [
      S("Watts, Duncan and Quan", 2018, "Revisiting the marshmallow test: A conceptual replication investigating links between early delay of gratification and later outcomes", "Psychological Science", "replication", "The association with age-15 achievement was about half the original estimate and much smaller after controls for background and early ability."),
      S("Kidd, Palmeri and Aslin", 2013, "Rational snacking: Young children's decision-making on the marshmallow task is moderated by beliefs about environmental reliability", "Cognition", "trial", "Children who had just seen an adult break a promise waited much less than children who had seen the adult keep it.")
    ],
    query: "delay of gratification marshmallow later outcomes", related: ["growth-mindset", "rewards-motivation", "pygmalion-effect"]
  },
  {
    id: "hawthorne-effect", cat: "retold",
    classic: { then: "1920s: factory lighting studies seem to show workers do better whenever anything changes, because they are watched", now: "2011: the original data, found and re-analysed, show no clear sign of that effect" },
    belief: "Workers do better simply because they are being watched (the Hawthorne effect).",
    feels: "It is in every management textbook, and everyone has tried harder when the boss walked by.",
    guess: { q: "When economists found and re-analysed the original Hawthorne lighting data, what did they find?", options: ["Output rose with every change in lighting", "No clear evidence of the famous effect", "The data showed output fell"], answer: 1 },
    says: "The illumination data, long thought lost, were recovered and re-analysed: they do not show the famous pattern of output rising with any change in lighting. A systematic review of being observed in research found such effects in some settings, but small and inconsistent.",
    slip: "A story that fit a new idea about management spread faster than anyone checked the numbers.",
    instead: "When a change seems to work, test it against a comparison group before giving credit to the change or to the watching.",
    holds: "Being observed can change behaviour in some situations; the review finds evidence for that, just not a reliable universal effect.",
    strength: "moderate", direction: "unsupported",
    sources: [
      S("Levitt and List", 2011, "Was there really a Hawthorne effect at the Hawthorne plant? An analysis of the original illumination experiments", "American Economic Journal: Applied Economics", "observational", "The recovered data show no clear evidence of the effect as usually described."),
      S("McCambridge, Witton and Elbourne", 2014, "Systematic review of the Hawthorne effect: New concepts are needed to study research participation effects", "Journal of Clinical Epidemiology", "review", "Effects of being studied exist in some settings but are small, varied and poorly understood.")
    ],
    query: "Hawthorne effect observation research participation", related: ["long-hours", "big-bonuses", "elderly-priming"]
  },
  {
    id: "pen-in-mouth", cat: "retold",
    classic: { then: "1988: holding a pen in your teeth to force a smile seems to make cartoons funnier", now: "2016: seventeen labs repeat the study and find no effect" },
    belief: "Forcing a smile, for example by holding a pen in your teeth, makes you feel happier.",
    feels: "It is an appealing trick, and it fits a tidy idea: the body tells the mind how it feels.",
    guess: { q: "When 17 labs repeated the pen-in-the-teeth study with a shared plan, what did they find?", options: ["The same effect", "No effect", "Cartoons seemed less funny"], answer: 1 },
    says: "A registered replication across 17 labs found no effect of the pen method on how funny cartoons seemed. A later large multi-lab study found that copying a smile could slightly raise reported happiness, but the pen method showed little.",
    slip: "A clever single study was cited for decades before anyone ran it again at scale.",
    instead: "Smiling will not hurt, but for mood, things with stronger evidence (sleep, movement, time with people) are better bets.",
    holds: "There may be a small effect of posed expressions on mood; the dramatic version from one pen study did not hold.",
    strength: "moderate", direction: "mostly-contradicts",
    sources: [
      S("Wagenmakers et al.", 2016, "Registered Replication Report: Strack, Martin, and Stepper (1988)", "Perspectives on Psychological Science", "replication", "Across 17 labs, the pen procedure had no detectable effect on how funny cartoons were rated."),
      S("Coles et al.", 2022, "A multi-lab test of the facial feedback hypothesis by the Many Smiles Collaboration", "Nature Human Behaviour", "replication", "Mimicking a smile slightly raised reported happiness; the pen-in-mouth method produced little or no effect.")
    ],
    query: "facial feedback hypothesis replication smile", related: ["power-posing", "ego-depletion", "elderly-priming"]
  },
  {
    id: "elderly-priming", cat: "retold",
    classic: { then: "1996: reading words about old age seems to make people walk more slowly down a corridor", now: "2012: with automatic timing, the slowing appears only when the experimenters expect it" },
    belief: "Reading words about old age makes people walk more slowly.",
    feels: "It became a famous example of how invisible cues steer us, and it is a fun story to tell.",
    guess: { q: "When the study was repeated with infrared timing, when did people walk more slowly?", options: ["Whenever they read the words", "Only when the experimenters expected them to", "Never, under any condition"], answer: 1 },
    says: "A replication that timed walking with infrared sensors found no slowing from the words. Slowing appeared only when the experimenters believed people would walk slowly and timed them by hand.",
    slip: "The experimenter's own expectations were part of the measurement, so the effect was in the observers as much as the walkers.",
    instead: "Be wary of findings where the person measuring knows what to expect. Blind measurement is the test.",
    holds: "Context can influence behaviour; this particular dramatic effect is what did not replicate.",
    strength: "moderate", direction: "unsupported",
    sources: [
      S("Bargh, Chen and Burrows", 1996, "Automaticity of social behavior: Direct effects of trait construct and stereotype activation on action", "Journal of Personality and Social Psychology", "trial", "The original study: participants primed with words about old age walked more slowly."),
      S("Doyen, Klein, Pichon and Cleeremans", 2012, "Behavioral priming: It's all in the mind, but whose mind?", "PLoS ONE", "replication", "With automated timing there was no slowing; slowing appeared only with experimenters who expected it.")
    ],
    query: "behavioral priming replication walking speed", related: ["pen-in-mouth", "power-posing", "hawthorne-effect"]
  },
  {
    id: "ten-thousand-hours", cat: "retold",
    classic: { then: "2008: a bestseller turns research on violinists into a rule: 10,000 hours of practice makes an expert", now: "2014: a meta-analysis finds practice explains only part of the differences between people" },
    belief: "Ten thousand hours of practice will make anyone an expert.",
    feels: "It is a fair and hopeful rule: talent does not matter, effort does, and the number is easy to remember.",
    guess: { q: "Across many fields, how much of the difference in skill between people did deliberate practice explain?", options: ["Almost all of it", "About an eighth of it", "None of it"], answer: 1 },
    says: "A meta-analysis found deliberate practice explained about 12% of the differences in performance overall: more in games, music and sports, much less in education and almost none in professions.",
    slip: "An average from one group of elite violinists became a threshold for everyone.",
    instead: "Practise well and for a long time, and also look at starting age, feedback, fit and other factors that matter as much.",
    holds: "Practice clearly matters, and nobody gets to the top without a lot of it. The magic number and the claim that it is all that matters are what fail.",
    strength: "moderate", direction: "mostly-contradicts",
    sources: [
      S("Macnamara, Hambrick and Oswald", 2014, "Deliberate practice and performance in music, games, sports, education, and professions: A meta-analysis", "Psychological Science", "review", "Deliberate practice explained about 12% of the variance in performance, with large differences between domains."),
      S("Ericsson and Pool", 2016, "Peak: Secrets from the New Science of Expertise", "Houghton Mifflin Harcourt", "narrative", "The researcher behind the violin study says the number was an average, not a threshold, and that the kind of practice matters more than the hours.")
    ],
    query: "deliberate practice expertise meta-analysis", related: ["learning-styles", "growth-mindset", "marshmallow-test"]
  },
  {
    id: "pygmalion-effect", cat: "retold",
    classic: { then: "1968: telling teachers some pupils are about to bloom seems to raise those pupils' IQ", now: "2005: reviews find expectation effects are real but usually small, and often fade" },
    belief: "If teachers expect a child to bloom, the child's IQ will rise (the Pygmalion effect).",
    feels: "It is a moving idea, that belief alone can lift a child, and it shows how much teachers matter.",
    guess: { q: "What do reviews of teacher-expectation studies find?", options: ["Large, lasting IQ gains", "Real but usually small effects that often fade", "No effect at all"], answer: 1 },
    says: "Reviews find teachers' expectations do affect pupils, but the effects are usually small, are larger for some groups of pupils, and often fade. In a synthesis of 18 experiments, IQ effects appeared mainly when teachers had not yet got to know their pupils.",
    slip: "One striking study was retold without the many attempts that found smaller effects.",
    instead: "Hold high expectations and back them with good teaching and feedback; belief alone is not the lever.",
    holds: "Low expectations can harm some pupils, especially those already disadvantaged; that part of the story deserves attention.",
    strength: "moderate", direction: "complicates",
    sources: [
      S("Raudenbush", 1984, "Magnitude of teacher expectancy effects on pupil IQ as a function of the credibility of expectancy induction: A synthesis of findings from 18 experiments", "Journal of Educational Psychology", "review", "Effects on IQ appeared mainly when teachers had little prior contact with their pupils."),
      S("Jussim and Harber", 2005, "Teacher expectations and self-fulfilling prophecies: Knowns and unknowns, resolved and unresolved controversies", "Personality and Social Psychology Review", "review", "Expectancy effects are real but typically small, may be larger for some groups, and often dissipate.")
    ],
    query: "teacher expectations self-fulfilling prophecy", related: ["marshmallow-test", "grade-retention", "learning-styles"]
  }
];

// The research the presentation is built on (shown on /how). Each item names how the entry format applies it.
export const METHOD = [
  { cite: "Lewandowsky et al. (2020), The Debunking Handbook 2020", applies: "Each entry gives the replacement explanation (where the intuition slips, what works instead), because a correction that leaves a gap is easily forgotten." },
  { cite: "Ecker et al. (2022), The psychological drivers of misinformation belief and its resistance to correction, Nature Reviews Psychology", applies: "Entries explain why the belief is reasonable before correcting it, and name the source of the error rather than only the error." },
  { cite: "Wood and Porter (2019), The elusive backfire effect, Political Behavior", applies: "Corrections rarely backfire, so entries state the evidence plainly; tone stays respectful because nobody is told they are foolish." },
  { cite: "Nyhan (2021), Why the backfire effect does not explain the durability of political misperceptions, PNAS", applies: "Beliefs persist through identity and repetition, so each entry states the belief once and spends its words on the evidence." },
  { cite: "Roediger and Karpicke (2006), Test-enhanced learning, Psychological Science", applies: "Readers make a guess before seeing the evidence. Predicting first makes the answer stick and shows the reader where their intuition stood." }
];

// The change layer (practices.js): evidence-graded practices are full entries in their own categories, and some myth entries carry a kit.
import { PRACTICE_CATEGORIES, PRACTICES, KITS } from "./practices.js";
CATEGORIES.push(...PRACTICE_CATEGORIES);
ENTRIES.push(...PRACTICES);
for (const e of ENTRIES) if (KITS[e.id]) e.change = KITS[e.id];
