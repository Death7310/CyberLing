import type { ClozeStep, ParsonsStep, PredictStep, Test } from '../curriculum/schema';

export interface CheckResult {
  ok: boolean;
  /** Learner-facing feedback. Specific, non-judgemental, and actionable. */
  feedback: string;
}

const norm = (s: string) => s.replace(/\r\n/g, '\n').trim().replace(/[ \t]+$/gm, '');
const squash = (s: string) => s.replace(/\s+/g, ' ').trim();

export function checkPredict(step: PredictStep, answer: string): CheckResult {
  const ok = step.choices ? answer === step.answer : squash(answer) === squash(step.answer);
  return { ok, feedback: ok ? 'Correct. ' + step.explanation : step.explanation };
}

export interface ParsonsAttempt {
  /** Lines in learner order, each with the indentation the learner set (in spaces). */
  lines: { text: string; indent: number }[];
}

export function checkParsons(step: ParsonsStep, attempt: ParsonsAttempt): CheckResult {
  const expected = step.solution.map((l) => ({ text: l.trimStart(), indent: l.length - l.trimStart().length }));
  if (attempt.lines.length !== expected.length) {
    const diff = attempt.lines.length - expected.length;
    return { ok: false, feedback: diff > 0 ? `You have ${diff} line(s) too many. One of them belongs to the distractors.` : `You are missing ${-diff} line(s).` };
  }
  for (let i = 0; i < expected.length; i++) {
    const got = attempt.lines[i];
    const want = expected[i];
    if (got.text.trim() !== want.text.trim()) {
      return { ok: false, feedback: `Line ${i + 1} is not what belongs there yet. Reread the lines above it: what must happen next?` };
    }
    if (step.indentation && got.indent !== want.indent) {
      return { ok: false, feedback: `Line ${i + 1} is in the right place but indented wrong. Which block does it belong to?` };
    }
  }
  return { ok: true, feedback: step.explanation ?? 'Correct order.' };
}

export function checkCloze(step: ClozeStep, answers: Record<string, string>): CheckResult {
  for (const blank of step.blanks) {
    const got = (answers[blank.id] ?? '').trim();
    if (!blank.answers.some((a) => a.trim() === got)) {
      return { ok: false, feedback: blank.hint ? `Not yet. Hint: ${blank.hint}` : 'Not yet. Look at the worked example again.' };
    }
  }
  return { ok: true, feedback: step.explanation ?? 'All blanks correct.' };
}

export function checkOutput(test: Test, stdout: string): boolean {
  const mode = test.match ?? 'exact';
  if (mode === 'exact') return norm(stdout) === norm(test.expectedStdout);
  if (mode === 'contains') return norm(stdout).includes(norm(test.expectedStdout));
  return new RegExp(test.expectedStdout, 'm').test(stdout);
}

export function renderCloze(step: ClozeStep, answers: Record<string, string>): string {
  return step.template.replace(/\{\{(\w+)\}\}/g, (_, id) => answers[id] ?? '____');
}
