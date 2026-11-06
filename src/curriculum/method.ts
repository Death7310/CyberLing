export const METHOD = `
**How CyberLing teaches**

Programming languages are languages: research on how adults learn them finds that language aptitude predicts success at learning Python better than numeracy does (Prat et al., 2020). So each track is built like a language course, with one honest difference: a program must also *run*. That is why every lesson ends by building a piece of a real project.

**Every lesson follows the same cycle**

- **Concept**: a short, worked example with each chunk labelled by its purpose (subgoal labels). You read working code before you write any.
- **Predict**: you say what the code will do before it runs. Reading and tracing skill comes before writing skill.
- **Assemble**: a Parsons problem. The correct lines are given, shuffled, with decoys. You practise structure without the typing load.
- **Fill**: a faded worked example. Most of the code is given; you supply the parts the lesson is about.
- **Modify**: you change a working program so that it passes new tests.
- **Build**: you write the next piece of the track's project yourself, checked by tests.

**Why it is built this way**

- Guided instruction beats unguided discovery for novices (Kirschner, Sweller & Clark, 2006). The guidance fades as you progress, because once you are competent, worked examples become less useful than practice (the expertise reversal effect).
- Novices who can't read and trace code can't write it either (Lister et al., 2004). Predict-then-run is the PRIMM approach (Sentance, Waite & Kallia, 2019).
- Parsons problems teach the same skills as writing code in less time, with less frustration (Ericson, Margulieux & Rick, 2017).
- Use-Modify-Create is the scaffold for moving from consuming code to producing it (Lee et al., 2011).
- Syntax is vocabulary. You forget vocabulary on a schedule, and spaced retrieval is the best-replicated fix for that (Cepeda et al., 2006; Roediger & Karpicke, 2006). Your Review deck does this; a few minutes a day matters more than a long session.
- A second language is taught against the first. Once you finish the Python track, the C track shows you each concept as a contrast ("in Python this was a name bound to an object; in C it is a box with an address"), which is how transfer between programming languages actually works (Tshukudu & Cutts, 2020).
- Every language comes with an explicit model of what the machine does when it runs your code: its notional machine (du Boulay, 1986; Sorva, 2013). Misconceptions come from a missing or wrong model, not from missing syntax.

**What to expect**

Competence takes time and spaced effort; there is no 30-day shortcut. The project spine is there so that at every stage you have a program that works and is yours. Sources and the full reasoning are in docs/PEDAGOGY.md in the repository.
`.trim();
