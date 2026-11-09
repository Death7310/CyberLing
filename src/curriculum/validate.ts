import type { Lesson, Module, Step, Track } from './schema';

/** Static checks that catch authoring mistakes before learners do. Returns a list of problems (empty = valid). */
export function validateTrack(track: Track): string[] {
  const problems: string[] = [];
  const seenLesson = new Set<string>();
  const seenLex = new Set<string>();
  if (!track.notionalMachine.length) problems.push(`${track.id}: notionalMachine is empty`);
  if (!track.modules.length) problems.push(`${track.id}: no modules`);
  track.modules.forEach((m, mi) => validateModule(track, m, mi, problems, seenLesson, seenLex));
  return problems;
}

function validateModule(track: Track, m: Module, mi: number, problems: string[], seenLesson: Set<string>, seenLex: Set<string>) {
  const where = `${track.id}/${m.id}`;
  if (m.status === 'available' && m.lessons.length === 0) problems.push(`${where}: available module has no lessons`);
  if (m.status === 'planned' && m.lessons.length > 0) problems.push(`${where}: planned module should not carry lessons`);
  if (mi > 0 && m.status === 'available' && track.modules[mi - 1].status === 'planned') problems.push(`${where}: available module after a planned one`);
  for (const lesson of m.lessons) validateLesson(where, lesson, problems, seenLesson, seenLex);
}

function validateLesson(where: string, l: Lesson, problems: string[], seenLesson: Set<string>, seenLex: Set<string>) {
  const here = `${where}/${l.id}`;
  if (seenLesson.has(l.id)) problems.push(`${here}: duplicate lesson id`);
  seenLesson.add(l.id);
  if (l.steps.length < 3) problems.push(`${here}: fewer than 3 steps`);
  if (l.minutes <= 0) problems.push(`${here}: minutes must be positive`);
  const kinds = new Set(l.steps.map((s) => s.kind));
  if (!kinds.has('concept')) problems.push(`${here}: no concept step (every lesson needs comprehensible input first)`);
  if (l.steps[0].kind !== 'concept') problems.push(`${here}: first step should be a concept (input before output)`);
  for (const entry of l.lexicon) {
    if (seenLex.has(entry.id)) problems.push(`${here}: duplicate lexicon id ${entry.id}`);
    seenLex.add(entry.id);
    if (!entry.meaning || !entry.example) problems.push(`${here}: lexicon ${entry.id} missing meaning/example`);
  }
  l.steps.forEach((s, i) => validateStep(`${here}#${i + 1}`, s, problems));
}

function validateStep(here: string, s: Step, problems: string[]) {
  switch (s.kind) {
    case 'concept':
      if (!s.body.trim()) problems.push(`${here}: empty body`);
      if (s.example?.labels) {
        const n = s.example.source.split('\n').length;
        for (const lab of s.example.labels) {
          if (lab.lines[0] < 1 || lab.lines[1] > n || lab.lines[0] > lab.lines[1]) problems.push(`${here}: label "${lab.label}" out of range`);
        }
      }
      break;
    case 'predict':
      if (s.choices && !s.choices.includes(s.answer)) problems.push(`${here}: answer not among choices`);
      if (!s.explanation) problems.push(`${here}: predict needs an explanation (feedback is the point)`);
      break;
    case 'parsons':
      if (s.solution.length < 2) problems.push(`${here}: parsons needs at least 2 lines`);
      if (s.distractors) for (const d of s.distractors) if (s.solution.includes(d)) problems.push(`${here}: distractor duplicates a solution line: ${d}`);
      break;
    case 'cloze': {
      const ids = new Set(s.blanks.map((b) => b.id));
      const used = new Set([...s.template.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]));
      for (const id of ids) if (!used.has(id)) problems.push(`${here}: blank ${id} not used in template`);
      for (const id of used) if (!ids.has(id)) problems.push(`${here}: template uses unknown blank ${id}`);
      for (const b of s.blanks) if (!b.answers.length) problems.push(`${here}: blank ${b.id} has no answers`);
      break;
    }
    case 'modify':
    case 'create':
      if (!['python', 'c', 'cpp', 'csharp'].includes(s.language)) problems.push(`${here}: ${s.kind} step uses non-runnable language ${s.language} (cloud tracks use fieldwork)`);
      if (!s.tests.length) problems.push(`${here}: ${s.kind} step has no tests`);
      if (!s.solution.trim()) problems.push(`${here}: ${s.kind} step has no reference solution`);
      break;
    case 'fieldwork':
      if (!s.checklist.length) problems.push(`${here}: fieldwork has an empty checklist`);
      if (!s.verify.answers.length) problems.push(`${here}: fieldwork has no verification answers`);
      break;
  }
}
