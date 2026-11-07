/**
 * CyberLing content schema.
 *
 * The schema encodes the teaching method, not just data:
 *  - A Track is a language (or cloud platform) taught through ONE growing project (the "project spine").
 *  - A Lesson is a short cycle that moves the learner from reading to writing:
 *      concept (worked example with subgoal labels)
 *      -> predict (read/trace before you write)
 *      -> parsons (assemble correct lines; syntax without typing load)
 *      -> cloze   (faded worked example; fill the blanks)
 *      -> modify  (change working code; Use-Modify-Create)
 *      -> create  (write the next piece of the project)
 *  - Every lesson contributes "lexicon" entries (syntax as vocabulary) to a spaced-repetition deck.
 * See docs/PEDAGOGY.md for the evidence behind each step kind.
 */

export type TrackId = 'python' | 'c' | 'cpp' | 'csharp' | 'aws' | 'azure';

/** Languages a code runner can execute. Cloud tracks use `shell` for CLI snippets (never executed in-app). */
export type RunnableLanguage = 'python' | 'c' | 'cpp' | 'csharp' | 'shell' | 'text';

export type LexiconKind =
  | 'keyword' // `if`, `def`, `while`
  | 'operator' // `==`, `%`, `->`
  | 'punctuation' // `:` as block introducer, `;` as statement terminator
  | 'pattern' // sentence patterns: `for x in xs:` , `int main(void) { ... }`
  | 'builtin' // `print`, `len`, `printf`
  | 'concept' // "binding", "notional machine", "compile step"
  | 'service'; // AWS/Azure services (S3, Lambda, Functions)

export interface LexiconEntry {
  id: string;
  term: string;
  kind: LexiconKind;
  /** Plain-language meaning, written like a dictionary gloss. */
  meaning: string;
  /** Minimal, correct usage example. */
  example: string;
  /** Optional natural-language analogy (the "linguistics" bridge). Keep it honest: say where the analogy breaks. */
  analogy?: string;
}

export interface SubgoalLabel {
  /** 1-based inclusive line range of the example that this label describes. */
  lines: [number, number];
  label: string;
}

export interface CodeSample {
  language: RunnableLanguage;
  source: string;
  /** Subgoal labels (Margulieux et al.): name the *purpose* of each chunk, so learners build a plan, not a transcript. */
  labels?: SubgoalLabel[];
}

export interface ContrastNote {
  /** Track the learner may already know. Rendered only if they have progress in it. */
  from: TrackId;
  note: string;
}

export interface Test {
  description: string;
  stdin?: string;
  /** Files created in the program's working directory before it runs (name -> contents). For file-handling lessons. */
  files?: Record<string, string>;
  /** Command-line arguments (sys.argv[1:]) for argparse lessons. */
  argv?: string[];
  expectedStdout: string;
  /** 'exact' compares trimmed output; 'contains' checks a substring; 'regex' tests a pattern against the full output. */
  match?: 'exact' | 'contains' | 'regex';
}

export interface ConceptStep {
  kind: 'concept';
  title: string;
  /** Lightweight markdown: paragraphs, `code`, **bold**, bullet lines starting with "- ". */
  body: string;
  example?: CodeSample;
  contrast?: ContrastNote[];
}

export interface PredictStep {
  kind: 'predict';
  prompt: string;
  code: CodeSample;
  /** If provided, rendered as multiple choice; otherwise a free-text answer compared to `answer` (whitespace-insensitive). */
  choices?: string[];
  answer: string;
  explanation: string;
}

export interface ParsonsStep {
  kind: 'parsons';
  prompt: string;
  language: RunnableLanguage;
  /** Correct program, one line per entry, with leading spaces for indentation. */
  solution: string[];
  /** Wrong lines mixed in (common misconceptions). */
  distractors?: string[];
  /** When true, learners must also set indentation (Python). When false, indentation is given. */
  indentation: boolean;
  explanation?: string;
}

export interface ClozeBlank {
  id: string;
  /** Accepted answers (first is canonical). Compared after trimming. */
  answers: string[];
  hint?: string;
}

export interface ClozeStep {
  kind: 'cloze';
  prompt: string;
  language: RunnableLanguage;
  /** Use {{blankId}} markers inside the template. */
  template: string;
  blanks: ClozeBlank[];
  explanation?: string;
}

export interface ModifyStep {
  kind: 'modify';
  prompt: string;
  language: RunnableLanguage;
  starter: string;
  tests: Test[];
  hint?: string;
  /** Reference solution, shown after success or when a compiler is unavailable (offline fallback). */
  solution: string;
}

export interface CreateStep {
  kind: 'create';
  prompt: string;
  language: RunnableLanguage;
  starter?: string;
  tests: Test[];
  hint?: string;
  solution: string;
  /** How this piece advances the project spine. */
  projectNote: string;
}

/** Hands-on step for cloud tracks: a checklist the learner performs in their own account, with a verification question. */
export interface FieldworkStep {
  kind: 'fieldwork';
  prompt: string;
  checklist: string[];
  /** Verification: a question whose answer proves the task was done (e.g. an HTTP status code, a CLI output shape). */
  verify: { question: string; answers: string[] };
  warning?: string;
}

export type Step = ConceptStep | PredictStep | ParsonsStep | ClozeStep | ModifyStep | CreateStep | FieldworkStep;

export interface Lesson {
  id: string;
  title: string;
  /** One sentence, learner-facing, starting with a verb: "Print a line of text…" */
  objective: string;
  lexicon: LexiconEntry[];
  steps: Step[];
  /** Estimated minutes for an attentive novice. */
  minutes: number;
}

export interface Module {
  id: string;
  title: string;
  goal: string;
  /** What the project looks like when this module is done. */
  projectMilestone: string;
  lessons: Lesson[];
  /** 'available' has authored lessons; 'planned' is a designed outline awaiting content. */
  status: 'available' | 'planned';
}

export interface Track {
  id: TrackId;
  title: string;
  tagline: string;
  /** The explicit mental model of how this language executes (du Boulay's "notional machine"). */
  notionalMachine: string[];
  projectSpine: { title: string; description: string };
  /** Tracks whose knowledge this track builds on contrastively. */
  prerequisites: TrackId[];
  runnable: boolean;
  modules: Module[];
}
