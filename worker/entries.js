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
  survey: { rank: 1, name: "Survey" }
};

export const CATEGORIES = [
  { id: "crime", name: "Crime and justice", blurb: "Policing, punishment and what actually lowers crime.", hue: 12 },
  { id: "children", name: "Children and learning", blurb: "How children learn, and what adults get wrong about teaching them.", hue: 150 },
  { id: "mind", name: "How minds mislead", blurb: "Memory, willpower, anger and the biases that feel like common sense.", hue: 265 },
  { id: "health", name: "Health and safety", blurb: "Beliefs about protection and prevention that the data does not back.", hue: 200 },
  { id: "money", name: "Money, work and welfare", blurb: "Cash, wages, hours and happiness.", hue: 40 },
  { id: "society", name: "Society and policy", blurb: "Migration, housing and drugs: where policy beliefs meet data.", hue: 320 }
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
