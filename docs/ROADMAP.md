# Roadmap

## Authored today

| Track | Modules authored | Lessons | Project state reached |
|---|---|---|---|
| Python | 1–8 (complete) | 38 | Ledger v1.0: a tested, file-backed, argparse command-line tool built from a dataclass and a class |
| C | 1 Compile, then run | 3 | Vault v0.1 (printf/scanf, typed variables) |
| AWS | 1 Accounts, identity, CLI | 1 | Safe account, CLI verified |
| Azure | 1 Subscriptions, identity, CLI | 1 | Safe subscription, CLI verified |
| C++ | 0 (7 designed) | 0 | — |
| C# | 0 (7 designed) | 0 | — |

Every designed module has a concept list and a project milestone in the app.

## Order of work

1. **C modules 2–8.** The pointer/memory modules (5–6) are where the notional machine earns its keep; author them with trace-style `predict` steps on memory diagrams.
3. **C++ and C# tracks**, contrastively against C and Python.
4. **AWS and Azure modules 2–7**, each lesson ending in teardown.

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
