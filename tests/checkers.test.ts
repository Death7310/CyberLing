import { describe, expect, it } from 'vitest';
import { checkCloze, checkOutput, checkParsons, checkPredict, renderCloze } from '../src/learning/checkers';
import type { ClozeStep, ParsonsStep, PredictStep } from '../src/curriculum/schema';

describe('checkers', () => {
  it('predict is whitespace-insensitive for free text and exact for choices', () => {
    const free: PredictStep = { kind: 'predict', prompt: '', code: { language: 'python', source: '' }, answer: 'Hello\nWorld', explanation: 'x' };
    expect(checkPredict(free, ' Hello   World ').ok).toBe(true);
    const mc: PredictStep = { ...free, choices: ['7', '5'], answer: '7' };
    expect(checkPredict(mc, '7').ok).toBe(true);
    expect(checkPredict(mc, '5').ok).toBe(false);
  });

  it('parsons reports count, order and indentation problems distinctly', () => {
    const step: ParsonsStep = { kind: 'parsons', prompt: '', language: 'python', indentation: true, solution: ['if x:', '    print(1)'], distractors: ['else'] };
    expect(checkParsons(step, { lines: [{ text: 'if x:', indent: 0 }] }).feedback).toMatch(/missing 1/);
    expect(checkParsons(step, { lines: [{ text: 'print(1)', indent: 4 }, { text: 'if x:', indent: 0 }] }).feedback).toMatch(/Line 1/);
    expect(checkParsons(step, { lines: [{ text: 'if x:', indent: 0 }, { text: 'print(1)', indent: 0 }] }).feedback).toMatch(/indented wrong/);
    expect(checkParsons(step, { lines: [{ text: 'if x:', indent: 0 }, { text: 'print(1)', indent: 4 }] }).ok).toBe(true);
  });

  it('cloze accepts any listed answer and renders the template', () => {
    const step: ClozeStep = { kind: 'cloze', prompt: '', language: 'python', template: 'print({{q}}hi{{q}})', blanks: [{ id: 'q', answers: ['"', "'"] }] };
    expect(checkCloze(step, { q: "'" }).ok).toBe(true);
    expect(checkCloze(step, { q: '`' }).ok).toBe(false);
    expect(renderCloze(step, { q: '"' })).toBe('print("hi")');
  });

  it('output matching modes', () => {
    expect(checkOutput({ description: '', expectedStdout: 'a\nb' }, 'a  \nb\n')).toBe(true);
    expect(checkOutput({ description: '', expectedStdout: 'b', match: 'contains' }, 'a\nb\nc')).toBe(true);
    expect(checkOutput({ description: '', expectedStdout: '^Total: \\d+$', match: 'regex' }, 'x\nTotal: 15\n')).toBe(true);
    expect(checkOutput({ description: '', expectedStdout: 'a' }, 'b')).toBe(false);
  });
});
