# Roadmap

## Authored today

| Track | Modules | Lessons | Steps | Lexicon | Lesson time | Project reached |
|---|---|---|---|---|---|---|
| Python | 10 | 49 | 266 | 197 | 16.8 h | Ledger v1.0 (tested argparse CLI) + data and algorithms tools |
| C | 8 | 36 | 202 | 157 | 13.1 h | Vault v1.0 (heap-backed records, files, argv verbs) |
| C++ | 7 | 33 | 180 | 142 | 11.8 h | Vault++ v1.0 (classes, RAII, templates, selftest) |
| C# | 7 | 35 | 212 | 153 | 12.8 h | LedgerSharp v1.0 (LINQ, JSON, async, CLI) + minimal API run locally |
| AWS | 7 | 25 | 126 | 117 | 12.4 h | Ledger API: S3, Lambda, API Gateway, DynamoDB, IAM, SAM; torn down |
| Azure | 7 | 25 | 130 | 102 | 12.6 h | LedgerSharp API: Storage, Functions, App Service, Table Storage, identity, Bicep; torn down |
| **Total** | **46** | **203** | **1,116** | **868** | **79.5 h** | |

Verification: `npm test` validates every module against the method rules and executes every reference solution (and checks every "modify" starter fails) with real toolchains. Project contracts per track are in `docs/*_SPINE.md`.

## Order of work

1. **Learner feedback loop.** Instrument nothing by default (no telemetry), but add an in-app "report a problem with this step" that drafts a GitHub issue, so wrong answers and unclear prompts surface.
2. **Second pass on content.** Each track was written module by module by different authors against a shared spine; a read-through per track for voice and cross-references is the next quality step.
3. **Offline compiled languages** on phone/web (WASM clang for C/C++) and **signing** for desktop installers.

## Platform work

- Android: debug APK builds in CI; add release signing and attach to GitHub Releases.
- Desktop: unsigned installers build in CI for macOS, Windows and Linux; add code signing / notarization when certificates exist; auto-update.
- Offline compiled languages: evaluate a WASM clang bundle as an opt-in download for C/C++.
- Desktop shell (Tauri) if the PWA proves insufficient on managed laptops.
- Progress export/import (JSON) so a learner can move between phone and laptop without accounts; optional sync later.
- Accessibility pass: keyboard-only Parsons, screen-reader labels on the editor, reduced-motion.

## Method work

- Fading schedule: module-level targets for the ratio of scaffolded steps to `create` steps.
- Error-message glossary per language, surfaced when a run fails with a known error.
- Diagnostic "predict" items drawn from the misconception literature, used to adapt which Parsons distractors appear.
