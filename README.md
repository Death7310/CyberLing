# CyberLing

Learn programming languages the way you learn a language: from zero, through one real project per language, with syntax treated as vocabulary and rehearsed on a spaced schedule.

One codebase ships as:

- a **laptop app**: installable Progressive Web App (works offline after first load) or any browser;
- an **Android APK** via Capacitor.

Tracks: **Python → C → C++ → C# → AWS → Azure**. Python and C have authored lessons you can take today; the other tracks are fully designed (modules, milestones, notional machine) and awaiting content. See `docs/ROADMAP.md` for what is authored and what is not.

## Quick start (laptop)

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests + every reference solution executed with python3/gcc
npm run build      # production build in dist/ (PWA, offline-capable)
npm run preview    # serve dist/
```

Python runs **on the device** (Pyodide, CPython compiled to WebAssembly, bundled at build time, ~14 MB). C, C++ and C# are compiled by a Piston-compatible execution service over the network; the default is a public, rate-limited instance and you can point Settings at your own (see `docs/ARCHITECTURE.md`).

## Android APK

Requires Android Studio or the Android SDK command-line tools, JDK 17+.

```bash
npm run android:sync   # builds dist/ and copies it into android/
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

Or open `android/` in Android Studio and press Run. A release build needs a signing key: `./gradlew assembleRelease` after configuring `android/app/build.gradle` signing config.

## How it teaches

Every lesson follows the same evidence-based cycle: **Concept** (worked example with subgoal labels) → **Predict** (trace before running) → **Assemble** (Parsons problem) → **Fill** (faded example) → **Modify** → **Build** (the next piece of the track's project). Each lesson adds syntax "vocabulary" to a spaced-repetition deck. The reasoning and sources are in `docs/PEDAGOGY.md`, and a short version is in the app under "How this works".

## Repository layout

```
src/curriculum/      schema, validator, tracks/*.ts (all content lives here, typed)
src/learning/        spaced repetition, answer checkers, prose renderer
src/runners/         Pyodide worker runner, remote (Piston) runner
src/exercises/       one React view per step kind
src/ui/              pages, editor, worked-example view
tests/               content validity, solution execution, scheduler, checkers
docs/                PEDAGOGY, ARCHITECTURE, CONTENT_AUTHORING, ROADMAP
android/             Capacitor Android project (web assets are copied in by `cap sync`)
```

## Contributing content

Read `docs/CONTENT_AUTHORING.md`. Content is TypeScript, validated by `npm test`: a lesson that breaks the method (no concept step first, a modify step whose starter already passes, a cloze with an unused blank) fails the build.
