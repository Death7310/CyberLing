# Authoring content

All content is TypeScript in `src/curriculum/tracks/*.ts`, typed by `src/curriculum/schema.ts` and checked by `npm test`.

## A lesson

```ts
const lesson: Lesson = {
  id: 'py-3-1',                       // track-module-lesson, globally unique
  title: 'Doing it again',
  objective: 'Repeat a block while a condition holds.',   // one sentence, starts with a verb
  minutes: 18,
  lexicon: [ /* 2–5 entries: the syntax this lesson introduces */ ],
  steps: [ concept, predict, parsons, cloze, modify, create ],
};
```

Rules enforced by the validator:

1. The first step is a `concept` with a worked example. Input before output.
2. `predict` must have an `explanation` (feedback is the point, not the score).
3. `parsons` distractors must not duplicate solution lines; use them for *specific* misconceptions (`else if`, missing `&`, Python 2 `print`).
4. `cloze` blanks must all appear in the template. Blank only the new material.
5. `modify`/`create` need `tests` and a `solution`. The test suite executes the solution for real (Python, C, C++) and requires the `modify` starter to **fail** at least one test.
6. Module order: all `available` modules before any `planned` one.

## Writing the concept step

- 80–160 words of prose, then the example. Say the rule, then show it.
- Label every chunk with its **purpose**, not a paraphrase of the code ("Ask and read the balance", not "calls input").
- Use `contrast` notes for anything that differs from a track the learner already knows. They render only when the learner has completed lessons in that track.
- Analogies must say where they break.

## Tests for runnable steps

- Output is compared after trimming trailing whitespace on each line (`exact`), or with `contains`/`regex`.
- Keep prompts on their own line (`print("Amount?")` then `input()`), so stdout is deterministic.
- Give at least two tests for anything with input, covering a boundary.

## Lexicon entries

`term` is what the learner sees on the card. `meaning` is a dictionary gloss. `example` is minimal and correct. `analogy` is optional; if present it must be honest. `kind` drives the badge: keyword, operator, punctuation, pattern, builtin, concept, service.

## Planned modules

Use `planned(id, title, goal, projectMilestone)`. The goal names the concepts; the milestone describes the project at the end of the module. When you author it, flip `status` to `available` and add lessons.
