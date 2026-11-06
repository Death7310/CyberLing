# Pedagogy: why CyberLing is built this way

This document is the design rationale. It states the premise, what the evidence supports, where the evidence is weak, and how each finding became a feature. The aim is a method most likely to produce competence, not one that feels fastest.

## 1. The premise, and its limits

**Premise:** learning a programming language is more like learning a language than like learning mathematics, so language-teaching methods should carry over.

**What supports it.** Prat, Madhyastha, Mottarella and Kuo (2020) measured adults learning Python and found that natural-language aptitude predicted learning rate and accuracy better than numeracy did, and that neural markers of language processing predicted outcomes. Portnoff (2018) argues from classroom practice that the introductory programming course "is first and foremost a language course". Hermans (2021) synthesises cognitive-science findings on reading code, chunking and memory into practice, and her classroom work with explicit vocabulary and reading instruction supports the transfer.

**Where it breaks.** Natural languages are acquired largely implicitly from massive comprehensible input (Krashen's hypothesis), and immersion works for them. For programming, the evidence favours **explicit, guided instruction** for novices: Kirschner, Sweller and Clark (2006) show minimally guided discovery underperforms guided instruction for learners without prior schemas, and cognitive load theory explains why (Sweller, 1988; Sweller, van Merriënboer & Paas, 2019). A program must also *execute*, so a learner needs an accurate model of the machine, which natural language has no analogue for.

**Consequence for the design.** CyberLing uses language-course *structure* (vocabulary, graded input, comprehension before production, contrastive teaching of the second language, spaced review) with programming-education *content* (worked examples, tracing, Parsons problems, a notional machine, tested projects). Pure project-based learning from day one is deliberately **not** the method; the project is the spine, but each step toward it is scaffolded, and the scaffolding fades.

## 2. Findings and the features they produced

| Finding | Evidence | Feature |
|---|---|---|
| Worked examples beat problem solving for novices; the advantage reverses with expertise (expertise reversal). | Sweller & Cooper (1985); Kalyuga, Ayres, Chandler & Sweller (2003); Renkl (2014) | Every lesson opens with a worked example (`concept` step). Later modules contain fewer scaffolded steps and more `create` steps. |
| Labelling the *purpose* of each chunk of an example (subgoal labels) improves transfer and retention. | Margulieux, Guzdial & Catrambone (2012); Morrison, Margulieux & Guzdial (2015) | `CodeSample.labels`; the learner is told to write labels as comments before coding in `create` steps. |
| Novices who cannot read and trace code cannot write it; reading precedes writing. | Lister et al. (2004); Lopez, Whalley, Robbins & Lister (2008); Xie et al. (2019) | The `predict` step always comes before any writing. |
| PRIMM (Predict, Run, Investigate, Modify, Make) improves outcomes in school programming. | Sentance, Waite & Kallia (2019) | The step sequence is a PRIMM variant: predict → assemble/fill (investigate) → modify → create. |
| Parsons problems teach as effectively as writing code in less time with less frustration; distractors target misconceptions; adaptive/2D variants are effective. | Parsons & Haden (2006); Ericson, Margulieux & Rick (2017); Ericson, Foley & Rick (2018); Du, Luxton-Reilly & Denny (2020) | `parsons` step with decoys and, for Python, indentation as part of the task. |
| Completion problems / faded worked examples bridge from examples to independent problem solving. | van Merriënboer & Krammer (1987); Renkl & Atkinson (2003) | `cloze` step; the blanks are exactly the lesson's new material. |
| Use–Modify–Create is an effective progression toward producing programs. | Lee et al. (2011) | `modify` then `create` in every lesson. |
| Retrieval practice and spacing produce durable memory; cramming produces fast forgetting. | Roediger & Karpicke (2006); Cepeda, Pashler, Vul, Wixted & Rohrer (2006); Dunlosky et al. (2013) | Each lesson's `lexicon` becomes flashcards in an SM-2-style scheduler (Wozniak, 1990) with a learning ladder; the home screen shows due counts. |
| Interleaving practice across topics improves discrimination and long-term performance. | Rohrer & Taylor (2007); Rohrer (2012) | The review queue round-robins across tracks. |
| Learners need an explicit *notional machine*; misconceptions arise from missing or wrong machine models. | du Boulay (1986); Sorva (2013); Guzdial (2015) | Each track states its notional machine up front; concept steps refer back to it (names vs boxes, compile step, stack frames). |
| Immediate, specific feedback matters; error messages are a major novice barrier. | Becker et al. (2019); Shute (2008) | Checkers give line-specific, non-judgemental feedback; Python tracebacks are trimmed to the learner's code. |
| Transfer between programming languages is real but uneven; teaching the second language contrastively against the first helps, and false friends must be called out. | Tshukudu & Cutts (2020); Shrestha, Botta, Barik & Parnin (2020) | `contrast` notes render only for tracks the learner has completed lessons in; C is taught against Python, C++ against C, Azure against AWS. |
| Self-explanation and prediction deepen learning from examples. | Chi, Bassok, Lewis, Reimann & Glaser (1989) | Review cards ask the learner to say the meaning and produce an example *before* revealing. |
| Guidance should fade; too much support for competent learners hurts. | Kalyuga et al. (2003) | Later modules are designed with fewer `parsons`/`cloze` steps and larger `create` steps (see ROADMAP). |

## 3. The project spine

Project-based learning is motivating and authentic, but unguided project work is poor for novices (Kirschner et al., 2006). CyberLing resolves this by making every lesson's `create` step a small, tested increment of **one** growing program per track (Ledger, Vault, Vault++, LedgerSharp, "Ship the Ledger"). The learner always has a working artefact that is theirs, and the next concept is introduced exactly when the project needs it (a loop when entries must repeat, a file when the ledger must persist). This mirrors "just-in-time" instruction in task-centred designs (van Merriënboer & Kirschner, 4C/ID).

## 4. Syntax as vocabulary, honestly

The lexicon treats keywords, operators, punctuation and *sentence patterns* (`for x in xs:`, `int main(void) { }`) as vocabulary with a meaning, an example and an optional analogy. Analogies are a double-edged tool: they speed initial encoding but create misconceptions when pushed (e.g. "a variable is a box" is right for C and wrong for Python). Every analogy in the content is required to say where it breaks, and the two tracks deliberately use different analogies for variables.

## 5. What this method does not claim

- It does not make anyone competent in weeks. The authored curriculum is sized for months of spaced practice per track.
- It does not replace reading and writing real code outside the app. Later modules point outward (standard library, other people's code).
- Evidence for spaced repetition is strongest for discrete facts; its benefit for syntax recall is plausible and supported in practice (Hermans, 2021) but less directly studied. The deck is a supplement to the exercises, not the core.
- Most of the cited studies were run in classrooms with instructors. An app has no instructor, which is one reason the content leans on immediate feedback and explicit models.

## References

- Becker, B. A., et al. (2019). Compiler error messages considered unhelpful: The landscape of text-based programming error message research. *ITiCSE-WGR*.
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380.
- Chi, M. T. H., Bassok, M., Lewis, M. W., Reimann, P., & Glaser, R. (1989). Self-explanations: How students study and use examples in learning to solve problems. *Cognitive Science, 13*(2), 145–182.
- du Boulay, B. (1986). Some difficulties of learning to program. *Journal of Educational Computing Research, 2*(1), 57–73.
- Du, Y., Luxton-Reilly, A., & Denny, P. (2020). A review of research on Parsons problems. *ACE '20*.
- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest, 14*(1), 4–58.
- Ericson, B. J., Margulieux, L. E., & Rick, J. (2017). Solving Parsons problems versus fixing and writing code. *Koli Calling '17*.
- Ericson, B. J., Foley, J. D., & Rick, J. (2018). Evaluating the efficiency and effectiveness of adaptive Parsons problems. *ICER '18*.
- Guzdial, M. (2015). *Learner-Centered Design of Computing Education*. Morgan & Claypool.
- Hermans, F. (2021). *The Programmer's Brain*. Manning.
- Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist, 38*(1), 23–31.
- Kirschner, P. A., Sweller, J., & Clark, R. E. (2006). Why minimal guidance during instruction does not work. *Educational Psychologist, 41*(2), 75–86.
- Lee, I., et al. (2011). Computational thinking for youth in practice. *ACM Inroads, 2*(1), 32–37.
- Lister, R., et al. (2004). A multi-national study of reading and tracing skills in novice programmers. *ITiCSE-WGR '04*.
- Lopez, M., Whalley, J., Robbins, P., & Lister, R. (2008). Relationships between reading, tracing and writing skills in introductory programming. *ICER '08*.
- Margulieux, L. E., Guzdial, M., & Catrambone, R. (2012). Subgoal-labeled instructional material improves performance and transfer in learning to develop mobile applications. *ICER '12*.
- Morrison, B. B., Margulieux, L. E., & Guzdial, M. (2015). Subgoals, context, and worked examples in learning computing problem solving. *ICER '15*.
- Parsons, D., & Haden, P. (2006). Parson's programming puzzles: A fun and effective learning tool for first programming courses. *ACE '06*.
- Portnoff, S. R. (2018). The introductory computer programming course is first and foremost a language course. *ACM Inroads, 9*(2), 34–52.
- Prat, C. S., Madhyastha, T. M., Mottarella, M. J., & Kuo, C.-H. (2020). Relating natural language aptitude to individual differences in learning programming languages. *Scientific Reports, 10*, 3817.
- Renkl, A. (2014). Toward an instructionally oriented theory of example-based learning. *Cognitive Science, 38*(1), 1–37.
- Renkl, A., & Atkinson, R. K. (2003). Structuring the transition from example study to problem solving in cognitive skill acquisition. *Educational Psychologist, 38*(1), 15–22.
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249–255.
- Rohrer, D. (2012). Interleaving helps students distinguish among similar concepts. *Educational Psychology Review, 24*, 355–367.
- Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science, 35*, 481–498.
- Sentance, S., Waite, J., & Kallia, M. (2019). Teaching computer programming with PRIMM: a sociocultural perspective. *Computer Science Education, 29*(2–3), 136–176.
- Shrestha, N., Botta, C., Barik, T., & Parnin, C. (2020). Here we go again: Why is it difficult for developers to learn another programming language? *ICSE '20*.
- Shute, V. J. (2008). Focus on formative feedback. *Review of Educational Research, 78*(1), 153–189.
- Sorva, J. (2013). Notional machines and introductory programming education. *ACM Transactions on Computing Education, 13*(2), 8.
- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257–285.
- Sweller, J., & Cooper, G. A. (1985). The use of worked examples as a substitute for problem solving in learning algebra. *Cognition and Instruction, 2*(1), 59–89.
- Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review, 31*, 261–292.
- Tshukudu, E., & Cutts, Q. (2020). Understanding conceptual transfer for students learning new programming languages. *ICER '20*.
- van Merriënboer, J. J. G., & Krammer, H. P. M. (1987). Instructional strategies and tactics for the design of introductory computer programming courses in high school. *Instructional Science, 16*, 251–285.
- Wozniak, P. A. (1990). *Optimization of learning*. Master's thesis, University of Technology in Poznan (the SM-2 algorithm).
- Xie, B., et al. (2019). A theory of instruction for introductory programming skills. *Computer Science Education, 29*(2–3), 205–253.
