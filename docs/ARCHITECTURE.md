# Architecture

## Targets from one codebase

| Target | How | Status |
|---|---|---|
| Laptop (any OS) | Browser, or install as a PWA from the address bar. Offline after first load; Pyodide is precached. | Built and verified (`npm run build`, Playwright walkthrough). |
| Android APK | Capacitor wraps `dist/` in a WebView (`android/`). `npm run android:sync` then Gradle. | Project generated and committed; APK compile requires the Android SDK (not present in the build container used to author this). |
| Desktop shell | Electron or Tauri can wrap `dist/` identically; not added yet because the PWA already covers laptops. | Not started. |

Stack: React 19, TypeScript, Vite 8, CodeMirror 6, Zustand (persisted to `localStorage`), vite-plugin-pwa (Workbox), Capacitor 8.

## Code execution

The hard constraint for a phone app that teaches C, C++ and C# is that those toolchains do not fit, or do not exist, in a WebView.

| Language | Runner | Offline? | Notes |
|---|---|---|---|
| Python | `PyodideRunner`: CPython in WebAssembly, in a **Web Worker**. | Yes | ~14 MB bundled from the `pyodide` npm package into `public/pyodide/` at build time (`scripts/copy-pyodide.mjs`). Runs are killed after 8 s by terminating the worker; stdin is fed from the test case; the namespace is reset between runs. |
| C, C++, C# | `RemoteRunner`: POSTs to a Piston-compatible `/execute` endpoint. | No | Default endpoint is the public `emkc.org` instance (rate-limited, third-party). For a class or real deployment self-host Piston (`docker run -d -p 2000:2000 ghcr.io/engineer-man/piston`) and set the endpoint in Settings. When offline, `modify`/`create` steps show the reference solution and let the learner self-mark; reading/assembling steps work fully. |
| shell / text | none | n/a | Cloud tracks never execute commands in-app; `fieldwork` steps are performed in the learner's own account with a verification question. |

Future options for offline compiled languages, in order of realism: a WASM build of clang/lld for C and C++ (Emception or the wasm-clang approach; 50–100 MB, slow cold start on phones), and .NET's own WebAssembly runtime with Roslyn for C# (also large). Both are plausible as an opt-in download later; neither is small enough to ship by default.

## Learning engine

- `curriculum/schema.ts`: the content model. Step kinds encode the method (see PEDAGOGY.md).
- `curriculum/validate.ts`: static rules (concept first, tests present, blanks used, no available module after a planned one).
- `learning/srs.ts`: SM-2 variant with a 1-min/10-min learning ladder, ease floor 1.3, lapses reset the interval. `orderQueue` interleaves tracks.
- `learning/checkers.ts`: predict/parsons/cloze/output comparisons with specific feedback.
- `store.ts`: per-lesson step completion and attempts, flashcard states, code drafts (autosaved), execution endpoint. All on-device; no accounts, no telemetry.

## Tests

`npm test` runs: schema validation of every track; uniqueness of ids; Parsons solutions pass and distractors fail; cloze canonical answers pass; **every Python and C reference solution is executed with the real interpreter/compiler against its own tests, and every `modify` starter is checked to fail them** (so there is always something to modify); scheduler behaviour; checker behaviour.

## Security notes

- Learner code runs in a Worker inside the page origin for Python; it cannot reach the DOM, and it has no network beyond what the browser allows the page. It is the learner's own code on the learner's own device.
- Remote execution sends code to whichever endpoint is configured. The default is third-party; the Settings page says so.
- The prose renderer accepts no raw HTML.
