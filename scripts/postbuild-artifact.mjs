// The relocatable build is meant for static hosts that serve only a fixed set of file types.
// Pyodide's standard library ships as a .zip, which some hosts refuse, so rename it; the app
// tells Pyodide the new name via VITE_PYODIDE_STDLIB (see vite.config.ts).
import { renameSync, existsSync } from 'node:fs';
const from = new URL('../dist-artifact/pyodide/python_stdlib.zip', import.meta.url);
const to = new URL('../dist-artifact/pyodide/python_stdlib.wasm', import.meta.url);
if (existsSync(from)) { renameSync(from, to); console.log('renamed python_stdlib.zip -> python_stdlib.wasm'); }
