// SPDX-License-Identifier: LicenseRef-Ultrastable-USL-1.0
// Copyright (c) Ultrastable
// The change layer (UNLEARN-CHANGE-1): practices where the evidence says the common way of trying to change is not the one that works.
// Each practice is a full encyclopedia entry (same guided order, same grading, same evidence loop and wording trials, see entries.js), and
// also carries a change kit: a tiny first step, if-then plans to pick from (implementation intentions), and how many days to try it.
// The kit runs entirely in the reader's browser (site.js PLAN_JS, /plan): plans, daily check-ins and reflections stay in localStorage;
// the server counts only anonymous events per practice (started, kept, stopped, which suggested plan) so the loop can learn which
// suggested plans people keep (change.js rankPlans). Effects that failed to replicate are listed in OVERSOLD and never get a kit.

const S = (authors, year, title, venue, design, finding) => ({ authors, year, title, venue, design, finding });

export const PRACTICE_CATEGORIES = [
  { id: "habits", kind: "change", name: "Habits and self-control", blurb: "Willpower is overrated. Plans, places and tracking do more of the work.", hue: 175 },
  { id: "feelings", kind: "change", name: "Feelings and stress", blurb: "Being hard on yourself, bottling it up, fearing your nerves: what helps instead.", hue: 230 },
  { id: "learning", kind: "change", name: "Learning and skill", blurb: "The study habits that feel productive are rarely the ones that make it stick.", hue: 60 },
  { id: "people", kind: "change", name: "Connection and kindness", blurb: "We misjudge how much small acts toward other people matter, to them and to us.", hue: 350 },
  { id: "body", kind: "change", name: "Movement and rest", blurb: "Every bit of movement counts, breaks are not slacking, and where you walk matters.", hue: 120 }
];

export const PRACTICES = [
  {
    id: "if-then-plans", cat: "habits",
    belief: "Reaching a goal is mostly a matter of wanting it enough.",
    feels: "When we fail, it feels like we did not care enough, and when we succeed it feels like determination did it. Motivation is the part of the process we can feel.",
    guess: { q: "Some people with a goal also wrote down exactly when and where they would act on it. Compared with people who only had the goal, did they follow through more?", options: ["About the same", "Yes, clearly more", "Less: planning used up their motivation"], answer: 1 },
    says: "Across 94 tests, people who formed a specific if-then plan (\"when this happens, I will do that\") reached their goals clearly more often than people who only intended to. Other experiments show that changing how much people want something changes what they do far less than you would expect.",
    slip: "Wanting something sets the goal but does not tell you when to act. The moment passes while you are busy. An if-then plan hands the decision to a cue that will happen anyway.",
    instead: "Pick one goal and write one sentence: \"When [a situation that reliably happens], I will [a small, specific action].\" Plan for the likely obstacle the same way: \"If I feel like putting it off, I will do the first two minutes.\"",
    holds: "Motivation still matters: if-then plans help people act on goals they already hold and do little for a goal they do not want. As with most psychology findings, newer and larger studies tend to find smaller effects than the early ones.",
    strength: "strong", direction: "complicates",
    sources: [
      S("Gollwitzer and Sheeran", 2006, "Implementation intentions and goal achievement: A meta-analysis of effects and processes", "Advances in Experimental Social Psychology", "review", "Across 94 independent tests, forming if-then plans had a medium-to-large effect on goal attainment (d = 0.65)."),
      S("Webb and Sheeran", 2006, "Does changing behavioral intentions engender behavior change? A meta-analysis of the experimental evidence", "Psychological Bulletin", "review", "A medium-to-large change in intention produced only a small-to-medium change in behaviour.")
    ],
    query: "implementation intentions goal attainment", related: ["environment-design", "habit-timeline", "ego-depletion"],
    change: { name: "If-then plans", days: 14, tiny: "Pick one goal and write one sentence: \"When ___, I will ___.\"",
      plans: [["I finish my first coffee", "I write down the one task that matters most today"], ["I sit down at my desk", "I work on that task for ten minutes before opening email"], ["I notice I am putting it off", "I do only the first two minutes"]] }
  },
  {
    id: "environment-design", cat: "habits",
    belief: "People with good self-control are the ones who resist temptation best.",
    feels: "We admire the person who turns down dessert, so self-control looks like strength in the moment of temptation. Our own failures happen in exactly those moments.",
    guess: { q: "In studies that tracked people's temptations through the day, what set people with high self-control apart?", options: ["They resisted more temptations", "They ran into fewer temptations", "No difference"], answer: 1 },
    says: "People high in self-control reported running into fewer temptations, not winning more battles with them. Their good outcomes came largely through habits and routines. Separately, people reliably eat and drink more when portions, packages and plates are bigger: the setting shapes the choice.",
    slip: "We only notice self-control when it is being tested, so we credit the test. The people who seem disciplined mostly arranged their lives so the test rarely comes up.",
    instead: "Change the setting rather than steeling yourself: put the good option within reach and the tempting one out of sight or a few steps away, and lay out what you need for a habit before you need it.",
    holds: "Resisting in the moment is sometimes unavoidable, and some people do have more of it. Small nudges to a setting tend to have modest effects once publication bias is accounted for; they help most for frequent, low-stakes choices.",
    strength: "moderate", direction: "complicates",
    sources: [
      S("Hofmann, Baumeister, Förster and Vohs", 2012, "Everyday temptations: An experience sampling study of desire, conflict, and self-control", "Journal of Personality and Social Psychology", "observational", "Tracked desires through the day; people high in trait self-control reported fewer and weaker temptations rather than more successful resistance."),
      S("Galla and Duckworth", 2015, "More than resisting temptation: Beneficial habits mediate the relationship between self-control and positive life outcomes", "Journal of Personality and Social Psychology", "observational", "Self-control was linked to better outcomes largely through beneficial habits, and to less effortful inhibition."),
      S("Hollands et al.", 2015, "Portion, package or tableware size for changing selection and consumption of food, alcohol and tobacco", "Cochrane Database of Systematic Reviews", "review", "People consistently consumed more when offered larger portions, packages or tableware.")
    ],
    query: "self-control habits environment temptation", related: ["if-then-plans", "ego-depletion", "habit-timeline"],
    change: { name: "Design your surroundings", days: 14, tiny: "Today, move one temptation out of sight, or one good option within reach.",
      plans: [["I get home", "I put my phone to charge in another room"], ["I unpack the shopping", "I put fruit on the counter and snacks out of sight"], ["I get ready for bed", "I lay out what I need for tomorrow's habit"]] }
  },
  {
    id: "habit-timeline", cat: "habits",
    belief: "It takes 21 days to form a habit, and missing a day sets you back to the start.",
    feels: "Twenty-one days is repeated everywhere and sounds precise. A streak also feels fragile: breaking it feels like breaking the habit.",
    guess: { q: "People building a new daily habit rated how automatic it felt. On average, how long until it felt close to automatic?", options: ["About 3 weeks", "About 2 months", "About a year"], answer: 1 },
    says: "In the best-known study, a new daily habit took a median of 66 days to become close to automatic, with a range of 18 to 254 days. Missing a single day did not noticeably set people back. A later review of health habits found typical times of about two to five months, varying widely between people.",
    slip: "The 21-day figure comes from a 1960 self-help book describing how long people took to get used to a change in their appearance, not from habit research. A streak feels like the habit itself, but what builds the habit is repeating an action after the same cue.",
    instead: "Tie the action to a cue that happens every day, expect it to take around two months, and treat a missed day as a missed day, not a failure: pick up again at the next cue.",
    holds: "Simple habits, like a glass of water with breakfast, became automatic faster than hard ones, like exercise. The evidence is still thin: few studies, mostly small samples.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Lally, van Jaarsveld, Potts and Wardle", 2010, "How are habits formed: Modelling habit formation in the real world", "European Journal of Social Psychology", "observational", "Reaching near-maximum automaticity took a median of 66 days (range 18 to 254), and missing one opportunity did not materially affect the process."),
      S("Singh, Murphy, Maher and Smith", 2024, "Time to form a habit: A systematic review and meta-analysis of health behaviour habit formation and its determinants", "Healthcare", "review", "Median times to form health habits ranged from about two to five months, with wide differences between people.")
    ],
    query: "habit formation automaticity time", related: ["if-then-plans", "monitor-progress"],
    change: { name: "Build a habit on a cue", days: 30, tiny: "Choose a habit and the daily moment it will follow. Expect about two months.",
      plans: [["I pour my first coffee", "I drink a glass of water"], ["I brush my teeth at night", "I floss one tooth"], ["I close my laptop for the day", "I write tomorrow's first task on paper"]] }
  },
  {
    id: "monitor-progress", cat: "habits",
    belief: "Tracking your progress is busywork; just keep your eye on the goal.",
    feels: "Logging feels like admin, and a big goal feels motivating on its own. Counting can also feel discouraging on a bad week.",
    guess: { q: "When experiments got people to check their progress toward a goal more often, what happened?", options: ["They reached it more often", "No change", "They did worse, from the pressure"], answer: 0 },
    says: "Across experiments, getting people to monitor their progress more often improved their chances of reaching the goal, more so when they wrote the progress down or reported it to someone. In weight loss, regular self-monitoring is one of the most consistent predictors of success.",
    slip: "The goal tells you where you want to be, not where you are. Without a record, memory fills the gap generously, and drift goes unnoticed until it is large.",
    instead: "Keep a tiny record: one mark a day for whether you did it, and a short look back once a week to change one thing. The check-in page on this site does exactly that, on your own device.",
    holds: "Tracking outcomes you cannot control day to day, like weight on a single morning, can mislead and discourage; tracking the action is steadier. The weight-loss evidence is mostly observational.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Harkin et al.", 2016, "Does monitoring goal progress promote goal attainment? A meta-analysis of the experimental evidence", "Psychological Bulletin", "review", "Interventions that increased progress monitoring improved goal attainment, with larger effects when progress was physically recorded or reported to others."),
      S("Burke, Wang and Sevick", 2011, "Self-monitoring in weight loss: A systematic review of the literature", "Journal of the American Dietetic Association", "review", "Self-monitoring of diet, activity and weight was consistently associated with weight loss.")
    ],
    query: "self-monitoring goal progress attainment", related: ["habit-timeline", "commitment-devices"],
    change: { name: "Track the action", days: 14, tiny: "Mark one dot a day on your check-in page: did it, partly, or not.",
      plans: [["I finish the evening meal", "I mark today's dot on my check-in page"], ["Sunday evening comes", "I look back at the week and change one thing"]] }
  },
  {
    id: "commitment-devices", cat: "habits",
    belief: "Keeping a promise to yourself is about willpower in the moment.",
    feels: "Binding yourself in advance can feel like admitting weakness. We expect our future self to share today's resolve.",
    guess: { q: "Smokers could deposit their own money in an account they would lose if they failed a nicotine test. A year later, were they more likely than others to have quit?", options: ["Yes", "No difference", "Less likely"], answer: 0 },
    says: "In a trial in the Philippines, smokers offered a voluntary commitment account were more likely to pass a surprise nicotine test at six and twelve months than smokers who were not offered one. Reviews find people often choose to limit their own future options, and that such devices can work.",
    slip: "Today's self makes the plan; tomorrow's self, tired or tempted, carries it out. A commitment made in advance changes the choice tomorrow's self faces instead of relying on its resolve.",
    instead: "Make the plan hard to quietly drop: tell one person what you will do and when, and ask them to check with you. For bigger goals, put something at stake that you set in advance.",
    holds: "Most people offered a commitment device decline it, and a harsh one can backfire when it is broken. Light versions, such as telling a friend, cost little but are less well tested.",
    strength: "moderate", direction: "complicates",
    sources: [
      S("Giné, Karlan and Zinman", 2010, "Put your money where your butt is: A commitment contract for smoking cessation", "American Economic Journal: Applied Economics", "trial", "Smokers offered a voluntary commitment savings account were more likely to pass surprise urine tests for nicotine at 6 and 12 months than controls."),
      S("Bryan, Karlan and Nelson", 2010, "Commitment devices", "Annual Review of Economics", "narrative", "People often choose arrangements that restrict their future choices; these can help, though take-up is often low.")
    ],
    query: "commitment device self-control contract", related: ["if-then-plans", "monitor-progress"],
    change: { name: "Commit in advance", days: 14, tiny: "Send your plan to one person you trust and ask them to check in a week.",
      plans: [["I make a plan", "I tell one person and ask them to check with me in a week"], ["Their check-in comes", "I tell them honestly how it went"]] }
  },
  {
    id: "self-compassion", cat: "feelings",
    belief: "Being hard on yourself is what keeps you motivated to improve.",
    feels: "Self-criticism feels responsible, and going easy on yourself feels like letting yourself off the hook. Many of us credit our harshest inner voice for what we achieved.",
    guess: { q: "After failing a test, some people were nudged to be kind to themselves about it. Did they study more or less for the retest?", options: ["Less: they let themselves off the hook", "More", "No difference"], answer: 1 },
    says: "In experiments, people prompted to treat a failure with self-compassion studied longer for a retest and were more motivated to make amends for a mistake than people given a self-esteem boost or nothing. Higher self-compassion is strongly linked to less depression, anxiety and stress, and trials of self-compassion training improve those outcomes.",
    slip: "Harshness makes failure feel more threatening, so we avoid looking at it. Kindness makes it safe to look at the mistake squarely, and looking is what lets us fix it.",
    instead: "When you fail, say to yourself what you would say to a friend in the same spot: name the mistake honestly, remember that everyone gets things wrong, and decide one thing to do differently.",
    holds: "Self-compassion is not excusing: the helpful version stays honest about the mistake. Much of the evidence comes from surveys; the trials are fewer and smaller.",
    strength: "moderate", direction: "mostly-contradicts",
    sources: [
      S("Breines and Chen", 2012, "Self-compassion increases self-improvement motivation", "Personality and Social Psychology Bulletin", "trial", "After a failure, people induced to be self-compassionate studied longer for a retest and were more motivated to avoid repeating a moral transgression than control groups."),
      S("MacBeth and Gumley", 2012, "Exploring compassion: A meta-analysis of the association between self-compassion and psychopathology", "Clinical Psychology Review", "review", "Higher self-compassion was strongly associated with lower depression, anxiety and stress."),
      S("Ferrari et al.", 2019, "Self-compassion interventions and psychosocial outcomes: A meta-analysis of RCTs", "Mindfulness", "review", "Self-compassion interventions improved outcomes including self-criticism, depression and anxiety compared with controls.")
    ],
    query: "self-compassion intervention", related: ["reappraisal", "stress-helps"],
    change: { name: "Talk to yourself like a friend", days: 14, tiny: "Write three sentences to yourself about a recent mistake, the way you would write to a friend.",
      plans: [["I catch myself thinking \"I'm so stupid\"", "I ask what I would tell a friend, and say that to myself"], ["I make a mistake at work", "I name it plainly, then write one thing I will do differently"]] }
  },
  {
    id: "reappraisal", cat: "feelings",
    belief: "The strong way to handle a painful feeling is to push it down and not show it.",
    feels: "Keeping a straight face looks like composure, and showing feelings can feel risky. Pushing a feeling away often does make it less visible to others.",
    guess: { q: "When people hide a strong feeling and keep a straight face, what happens to how they feel inside?", options: ["The feeling fades", "It mostly stays", "It disappears"], answer: 1 },
    says: "Hiding the outward signs of an emotion changes what others see but does little to how it feels. Reinterpreting the situation, called reappraisal, changes the feeling itself more. People who habitually reappraise report more positive emotion, better relationships and higher wellbeing than people who habitually suppress.",
    slip: "Suppression works on the part we can see, so it looks like control. The feeling keeps running underneath, and holding the face still takes effort and attention away from the people around us.",
    instead: "When something upsets you, look for another true reading of it: what else could explain it, what would you tell a friend, how will it look in a year? Then decide what to do.",
    holds: "Sometimes hiding a feeling is right for the moment, at a funeral or in a negotiation. Reappraisal is harder in intense moments, and the long-term studies are mostly observational.",
    strength: "moderate", direction: "mostly-contradicts",
    sources: [
      S("Gross and John", 2003, "Individual differences in two emotion regulation processes: Implications for affect, relationships, and well-being", "Journal of Personality and Social Psychology", "observational", "People who habitually used reappraisal had more positive emotion, better interpersonal functioning and well-being; habitual suppressors showed the opposite pattern."),
      S("Webb, Miles and Sheeran", 2012, "Dealing with feeling: A meta-analysis of the effectiveness of strategies derived from the process model of emotion regulation", "Psychological Bulletin", "review", "Reappraisal changed emotional outcomes; suppressing emotional expression changed outward expression but had little effect on the emotion people felt.")
    ],
    query: "cognitive reappraisal expressive suppression emotion regulation", related: ["self-compassion", "catharsis", "stress-helps"],
    change: { name: "Reread the situation", days: 14, tiny: "Next time something upsets you, write one other true way to read it.",
      plans: [["Something someone says upsets me", "I ask what else could explain it before I reply"], ["I am stewing on a setback", "I ask how I will see it in a year"]] }
  },
  {
    id: "stress-helps", cat: "feelings",
    belief: "Feeling nervous before a test or a talk always hurts your performance.",
    feels: "A racing heart and a tight stomach feel like signs that something is wrong, and we remember the times nerves went badly.",
    guess: { q: "Students about to take a maths exam were told that feeling anxious can actually help performance. How did they score compared with students told nothing?", options: ["Lower", "About the same", "Higher"], answer: 2 },
    says: "In experiments, people told that a racing heart is the body preparing to perform scored higher on a maths test and showed healthier heart and blood-vessel responses under stress than people told nothing or told to ignore it. The arousal itself was similar; what changed was how it was read.",
    slip: "The body's response to a challenge and to a threat feel alike from the inside. Reading arousal as danger makes it one; reading it as fuel puts the same energy to use.",
    instead: "Before a challenge, notice the nerves and tell yourself what they are: your body getting ready. Keep the energy and point it at the first thing you need to do.",
    holds: "Stress that goes on for months is harmful, and these studies are about short bursts before a challenge. The trials are small and few; treat the effect as promising rather than settled.",
    strength: "limited", direction: "complicates",
    sources: [
      S("Jamieson, Mendes, Blackstock and Schmader", 2010, "Turning the knots in your stomach into bows: Reappraising arousal improves performance on the GRE", "Journal of Experimental Social Psychology", "trial", "Students told that arousal can improve performance scored higher on the maths section of a practice GRE than controls."),
      S("Jamieson, Nock and Mendes", 2012, "Mind over matter: Reappraising arousal improves cardiovascular and cognitive responses to stress", "Journal of Experimental Psychology: General", "trial", "Reappraising arousal as helpful led to more adaptive cardiovascular responses and less attention to threat during a stressful task.")
    ],
    query: "reappraising arousal stress performance", related: ["reappraisal", "self-compassion"],
    change: { name: "Read nerves as fuel", days: 14, tiny: "Before your next stressful moment, say: \"This is my body getting ready.\"",
      plans: [["I feel my heart race before something hard", "I tell myself my body is getting ready, and start the first step"]] }
  },
  {
    id: "testing-learning", cat: "learning",
    belief: "Tests measure what you have learned; they do not help you learn.",
    feels: "Tests come at the end and feel like judgement. Studying is the input, testing the output.",
    guess: { q: "Students either reread a passage or took practice recall tests on it. Who remembered more a week later?", options: ["The rereaders", "About the same", "The test-takers"], answer: 2 },
    says: "Trying to recall material is itself one of the most effective ways to learn it. Students who took recall tests remembered more a week later than students who reread the passage, even though the rereaders felt more confident. Reviews of hundreds of studies find practice testing beats restudying.",
    slip: "Rereading feels fluent, and fluency feels like learning. Recall feels effortful and shows the gaps, which is exactly why it strengthens memory.",
    instead: "After reading, close the book and write or say what you remember, then check. Use flashcards or practice questions before rereading, and reread only what you missed.",
    holds: "Testing helps most with feedback on the answers, and high-stakes tests can bring stress that low-stakes practice does not.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Roediger and Karpicke", 2006, "Test-enhanced learning: Taking memory tests improves long-term retention", "Psychological Science", "trial", "Students who took recall tests remembered more after a week than students who restudied, although restudying produced more confidence."),
      S("Adesope, Trevisan and Sundararajan", 2017, "Rethinking the use of tests: A meta-analysis of practice testing", "Review of Educational Research", "review", "Practice tests improved learning more than restudying and other comparison conditions, with a moderate overall effect.")
    ],
    query: "retrieval practice testing effect learning", related: ["study-rereading", "spaced-practice", "errors-learning"],
    change: { name: "Quiz yourself", days: 14, tiny: "After your next reading, close it and write down three things you remember.",
      plans: [["I finish reading a section", "I close it and write what I remember before checking"], ["I sit down to revise", "I start with practice questions, then reread only what I missed"]] }
  },
  {
    id: "spaced-practice", cat: "learning",
    belief: "Cramming everything into one long session is an efficient way to learn.",
    feels: "A long session feels productive, and the material feels familiar by the end. Cramming has also worked for plenty of next-morning exams.",
    guess: { q: "Same total study time: one long session, or several shorter ones spread over days. Which gives better memory a month later?", options: ["One long session", "About the same", "Spread out"], answer: 2 },
    says: "Spreading study over separate sessions gives better long-term memory than massing the same time into one, in hundreds of experiments. Reviews of study techniques rate spaced practice and practice testing as the two most useful, and rereading and highlighting among the least.",
    slip: "Familiarity at the end of a long session feels like mastery, but much of it is short-term and fades within days. A gap forces you to retrieve the material again, which is what makes it last.",
    instead: "Split study into short sessions over several days, and come back to old material after a gap, ideally by quizzing yourself on it.",
    holds: "Cramming can get you through a test the next morning. What it loses is retention a week or a month later.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Cepeda, Pashler, Vul, Wixted and Rohrer", 2006, "Distributed practice in verbal recall tasks: A review and quantitative synthesis", "Psychological Bulletin", "review", "Spacing study sessions apart produced better long-term retention than massed study."),
      S("Dunlosky, Rawson, Marsh, Nathan and Willingham", 2013, "Improving students' learning with effective learning techniques: Promising directions from cognitive and educational psychology", "Psychological Science in the Public Interest", "review", "Rated practice testing and distributed practice as high utility, and rereading, highlighting and summarising as low utility.")
    ],
    query: "spacing effect distributed practice retention", related: ["testing-learning", "study-rereading"],
    change: { name: "Space it out", days: 14, tiny: "Split your next study block into three short sessions on different days.",
      plans: [["I start a study session", "I first spend five minutes on something I studied days ago"], ["I finish a session", "I schedule the next one two days later"]] }
  },
  {
    id: "errors-learning", cat: "learning",
    belief: "Mistakes while learning are bad; it is best to get it right first time.",
    feels: "Mistakes feel like failure and we worry they will stick. School grades usually reward getting it right, not trying and missing.",
    guess: { q: "Learners either tried to answer a question before being shown the answer, or simply studied the answer. Even when the attempts were wrong, who remembered better later?", options: ["Those who studied the answer", "Those who tried first", "No difference"], answer: 1 },
    says: "Trying to answer before seeing the answer, even when the attempt fails, improves later memory compared with just studying the answer. Errors followed quickly by the correct answer help learning, and confident errors that get corrected are remembered especially well.",
    slip: "We judge a learning method by how smoothly it goes. Errors feel rough, but the attempt prepares the mind for the answer and the surprise of being wrong makes the correction stick.",
    instead: "Have a go before looking things up, guess before checking, and make sure the right answer follows soon after. Treat a wrong guess as part of the method.",
    holds: "Errors help when correct feedback follows. Practising without feedback can entrench mistakes, and repeated failure without support can discourage learners.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Kornell, Hays and Bjork", 2009, "Unsuccessful retrieval attempts enhance subsequent learning", "Journal of Experimental Psychology: Learning, Memory, and Cognition", "trial", "Attempting to answer before seeing the answer, even unsuccessfully, led to better later recall than studying the answer for the same time."),
      S("Metcalfe", 2017, "Learning from errors", "Annual Review of Psychology", "narrative", "Errors followed by corrective feedback, especially high-confidence errors, enhance learning compared with error-free study.")
    ],
    query: "learning from errors corrective feedback pretesting", related: ["testing-learning", "spaced-practice"],
    change: { name: "Guess before you check", days: 14, tiny: "Next time you look something up, write your guess first.",
      plans: [["I am about to look up an answer", "I write my best guess first, then check"]] }
  },
  {
    id: "talk-to-strangers", cat: "people",
    belief: "Strangers would rather be left alone, and chatting to them would be awkward for both of you.",
    feels: "Everyone on the train seems to want quiet, and starting a conversation risks rejection. Keeping to ourselves feels polite.",
    guess: { q: "Commuters were asked to talk to a stranger on their train, or to keep to themselves. How did the talkers rate their journey?", options: ["Worse", "About the same", "Better"], answer: 2 },
    says: "Commuters asked to talk to a stranger reported a more pleasant journey than those asked to sit alone, though they had predicted the opposite. Across studies, people overestimate how awkward and unpleasant talking to strangers will be, and underestimate how much others welcome deeper conversation.",
    slip: "Everyone assumes the others want quiet, so everyone stays quiet, which confirms the assumption. We also overrate the risk of rejection and underrate how much the other person enjoys it.",
    instead: "Once in a while, ask someone near you one genuine question. When a chat is going well, go one step past small talk.",
    holds: "These were short conversations in safe public places, mostly in North America and Britain. Respect someone who signals they would rather not talk.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Epley and Schroeder", 2014, "Mistakenly seeking solitude", "Journal of Experimental Psychology: General", "trial", "Commuters instructed to talk to a stranger reported a more positive experience than those instructed to sit in solitude, contrary to their own predictions."),
      S("Sandstrom and Boothby", 2021, "Why do people avoid talking to strangers? A mini meta-analysis of predicted fears and actual experiences talking to a stranger", "Self and Identity", "review", "People overestimated how difficult and unpleasant conversations with strangers would be."),
      S("Kardas, Kumar and Epley", 2022, "Overly shallow?: Miscalibrated expectations create a barrier to deeper conversation", "Journal of Personality and Social Psychology", "trial", "People expected deep conversations with strangers to be more awkward and less enjoyable than they turned out to be.")
    ],
    query: "talking to strangers conversation wellbeing", related: ["thank-you-notes", "kindness-happiness", "contact-conflict"],
    change: { name: "Talk to a stranger", days: 14, tiny: "Ask one stranger one genuine question this week.",
      plans: [["I am waiting in a queue or at a stop", "I ask the person next to me one genuine question"], ["A chat goes past hello", "I ask one deeper question, like what has been on their mind"]] }
  },
  {
    id: "thank-you-notes", cat: "people",
    belief: "A thank-you message would be awkward to receive and does not matter much.",
    feels: "Saying thanks out of the blue feels odd, and we assume the other person knows we are grateful or would not care.",
    guess: { q: "People wrote a thank-you letter and predicted how the recipient would feel. Were they right?", options: ["They overestimated how pleased the recipient would be", "About right", "They underestimated it"], answer: 2 },
    says: "People who wrote letters of gratitude underestimated how surprised and happy their recipients would be, and overestimated how awkward the recipients would feel. Writing and delivering a gratitude letter raised writers' own happiness for about a month in an early trial.",
    slip: "We focus on how clumsy our words are; the recipient focuses on the warmth behind them. So we expect awkwardness and hold back.",
    instead: "Once a week, send one short, specific message thanking someone for something they did and what it meant to you.",
    holds: "Gratitude exercises in general have small effects on wellbeing when compared with other active activities. The case here is about how much the recipient values it.",
    strength: "moderate", direction: "contradicts",
    sources: [
      S("Kumar and Epley", 2018, "Undervaluing gratitude: Expressers misunderstand the consequences of showing appreciation", "Psychological Science", "trial", "Expressers underestimated how surprised and positive recipients would feel and overestimated how awkward recipients would feel."),
      S("Seligman, Steen, Park and Peterson", 2005, "Positive psychology progress: Empirical validation of interventions", "American Psychologist", "trial", "Writing and delivering a gratitude letter produced large increases in happiness that lasted about a month."),
      S("Davis et al.", 2016, "Thankful for the little things: A meta-analysis of gratitude interventions", "Journal of Counseling Psychology", "review", "Gratitude interventions had small effects on psychological well-being compared with active comparison conditions.")
    ],
    query: "expressing gratitude letter recipient", related: ["talk-to-strangers", "kindness-happiness"],
    change: { name: "Say thank you", days: 14, tiny: "Write three specific sentences thanking someone, and send them.",
      plans: [["Sunday evening comes", "I send one short message thanking someone for something specific"]] }
  },
  {
    id: "kindness-happiness", cat: "people",
    belief: "Spending money on yourself makes you happier than spending it on other people.",
    feels: "Buying something we want gives a clear, immediate pleasure. Giving it away feels like a loss we choose to bear.",
    guess: { q: "People were handed money to spend by the evening. Who was happier at the end of the day: those told to spend it on themselves, or on others?", options: ["On themselves", "On others", "No difference"], answer: 1 },
    says: "In experiments, people told to spend money on others ended the day happier than those told to spend it on themselves. Survey data from more than a hundred countries link giving to wellbeing in most of them, and a review of kindness experiments finds a small-to-medium boost to the giver's wellbeing.",
    slip: "We predict happiness from the object we would get. Kindness pays in a currency we leave out: connection, and seeing ourselves as someone who helps.",
    instead: "Do one small, specific kindness on purpose this week, ideally for someone you will see, and notice how it feels.",
    holds: "The effects are modest and the early experiments were small. Kindness done under pressure or out of duty seems to help the giver less.",
    strength: "moderate", direction: "complicates",
    sources: [
      S("Dunn, Aknin and Norton", 2008, "Spending money on others promotes happiness", "Science", "trial", "Participants randomly assigned to spend money on others reported greater happiness at the end of the day than those assigned to spend it on themselves."),
      S("Aknin et al.", 2013, "Prosocial spending and well-being: Cross-cultural evidence for a psychological universal", "Journal of Personality and Social Psychology", "observational", "Prosocial spending was associated with greater well-being in most of 136 countries."),
      S("Curry et al.", 2018, "Happy to help? A systematic review and meta-analysis of the effects of performing acts of kindness on the well-being of the actor", "Journal of Experimental Social Psychology", "review", "Performing acts of kindness had a small-to-medium effect on the actor's well-being.")
    ],
    query: "prosocial spending kindness well-being", related: ["money-happiness", "thank-you-notes", "talk-to-strangers"],
    change: { name: "One deliberate kindness", days: 14, tiny: "Do one small, specific kindness for someone today.",
      plans: [["I buy myself a coffee on Friday", "I buy one for someone else too"], ["I notice someone struggling", "I offer one specific bit of help"]] }
  },
  {
    id: "every-move-counts", cat: "body",
    belief: "Exercise only counts if you do at least half an hour at a time.",
    feels: "Workouts are sold in sessions, and older advice said activity only counted in blocks of at least ten minutes. A short walk feels too small to matter.",
    guess: { q: "Under the World Health Organization's 2020 guidelines, does a few minutes of brisk walking count toward your weekly activity?", options: ["No, it must be at least 10 minutes at a time", "Only if it is intense", "Yes, all of it counts"], answer: 2 },
    says: "The World Health Organization's 2020 guidelines dropped the old requirement that activity come in bouts of at least ten minutes: every bit counts toward the weekly total. In pooled studies that measured movement with devices, more total activity at any intensity was linked to lower risk of death, with the biggest gains for the least active.",
    slip: "We picture exercise as a session, so movement outside a session does not register. The body does not keep that distinction.",
    instead: "Add movement in small pieces: a five-minute walk after meals, stairs instead of the lift, standing up during calls. Build up from there.",
    holds: "More is still better up to a point: the guidelines suggest 150 to 300 minutes of moderate activity a week for adults. Most of the mortality evidence is observational.",
    strength: "strong", direction: "contradicts",
    sources: [
      S("Bull et al.", 2020, "World Health Organization 2020 guidelines on physical activity and sedentary behaviour", "British Journal of Sports Medicine", "consensus", "Recommended 150 to 300 minutes of moderate activity a week for adults and removed the minimum bout length: all activity counts."),
      S("Ekelund et al.", 2019, "Dose-response associations between accelerometry measured physical activity and sedentary time and all cause mortality: Systematic review and harmonised meta-analysis", "BMJ", "review", "Higher levels of total physical activity, at any intensity, were associated with lower risk of death, with steep reductions at lower levels of activity.")
    ],
    query: "physical activity bouts mortality accelerometer", related: ["take-breaks", "green-walks", "stretching-injury"],
    change: { name: "Move in small pieces", days: 14, tiny: "Take a five-minute walk after one meal today.",
      plans: [["I finish a meal", "I walk for five minutes"], ["My phone rings", "I stand up and walk while I talk"]] }
  },
  {
    id: "take-breaks", cat: "body",
    belief: "Taking breaks wastes time; pushing through is more productive.",
    feels: "Breaks look like time off the task, and stopping can feel like losing momentum. Working through lunch signals commitment.",
    guess: { q: "A review pooled studies of short breaks, up to ten minutes, during work. What did the breaks do to fatigue?", options: ["Reduced it", "Nothing", "Increased it by breaking focus"], answer: 0 },
    says: "Short breaks of up to ten minutes during work raised energy and reduced fatigue across studies. Their effect on performance was smaller and depended on the task, larger for routine and clerical work than for demanding thinking.",
    slip: "We count minutes on the task, not the state we are in while doing them. Fatigue builds quietly, and a short pause resets more than it costs.",
    instead: "Take a short break about once an hour, away from the screen: stand, move, look at something far away, then come back.",
    holds: "For deep, demanding work, the performance gain is less clear and an interruption can cost focus. Long hours have their own problems, covered in a separate entry.",
    strength: "moderate", direction: "complicates",
    sources: [
      S("Albulescu et al.", 2022, "\"Give me a break!\" A systematic review and meta-analysis on the efficacy of micro-breaks for increasing well-being and performance", "PLOS ONE", "review", "Micro-breaks increased vigour and reduced fatigue; their effect on performance was smaller and varied with the type of task.")
    ],
    query: "micro-breaks fatigue performance work", related: ["long-hours", "every-move-counts"],
    change: { name: "Take short breaks", days: 14, tiny: "Today, take one five-minute break away from the screen every hour.",
      plans: [["I have worked for an hour", "I stand up, stretch and look out of a window for three minutes"]] }
  },
  {
    id: "green-walks", cat: "body",
    belief: "A walk is a walk: where you go makes no difference to how you feel.",
    feels: "Exercise is exercise, and a park can seem like a nice extra rather than a real ingredient.",
    guess: { q: "People walked for 90 minutes either through nature or along a busy road. Afterwards, who was dwelling less on negative thoughts?", options: ["The urban walkers", "No difference", "The nature walkers"], answer: 2 },
    says: "A 90-minute walk in a natural setting reduced brooding on negative thoughts, and activity in a brain area linked to it, compared with the same walk along a busy road. In a large survey in England, people who spent at least two hours a week in nature were more likely to report good health and wellbeing.",
    slip: "We count the steps and leave out the setting. Green spaces seem to give the mind a break from the demands of traffic and crowds.",
    instead: "When you can, route walks through parks, rivers or tree-lined streets, and aim for about two hours of green time across the week.",
    holds: "The trials are small and the survey is observational: healthier, happier people may simply visit nature more. Treat it as a cheap, low-risk bet, not a cure.",
    strength: "limited", direction: "mostly-contradicts",
    sources: [
      S("Bratman, Hamilton, Hahn, Daily and Gross", 2015, "Nature experience reduces rumination and subgenual prefrontal cortex activation", "PNAS", "trial", "A 90-minute walk in a natural setting reduced self-reported rumination and related neural activity compared with an urban walk."),
      S("White et al.", 2019, "Spending at least 120 minutes a week in nature is associated with good health and wellbeing", "Scientific Reports", "observational", "People who spent at least 120 minutes a week in nature were more likely to report good health and high wellbeing.")
    ],
    query: "nature exposure walking rumination wellbeing", related: ["every-move-counts", "take-breaks"],
    change: { name: "Walk somewhere green", days: 14, tiny: "Take your next walk along the greenest route you can find.",
      plans: [["The weekend comes", "I spend an hour in a park or other green space"], ["I walk somewhere nearby", "I take the route with the most trees"]] }
  }
];

// Change kits for myth entries whose "what works instead" is itself a practice.
export const KITS = {
  "study-rereading": { name: "Quiz yourself", days: 14, tiny: "After your next reading, close it and write down three things you remember.",
    plans: [["I finish reading a section", "I close it and write what I remember before checking"], ["I sit down to revise", "I start with practice questions, then reread only what I missed"]] },
  catharsis: { name: "Cool down first", days: 14, tiny: "Next time you are angry, breathe slowly for one minute before you act.",
    plans: [["I notice I am getting angry", "I take five slow breaths before I say anything"], ["I want to vent about someone", "I go for a short walk first and decide what I want to happen"]] }
};

// Popular self-improvement claims whose evidence did not hold up. Shown on /change so nobody builds a plan on them; they never get a kit.
export const OVERSOLD = [
  { id: "power-posing", why: "The hormone changes did not replicate, and the remaining effect on how powerful people feel is small." },
  { id: "ego-depletion", why: "Large multi-lab replications found little or no depletion effect, so rationing willpower is not a plan." },
  { id: "growth-mindset", why: "Mindset lessons have small average effects on grades, larger only for some struggling students." }
];
