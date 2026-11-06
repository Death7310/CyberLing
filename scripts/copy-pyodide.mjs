// Copies the Pyodide runtime from node_modules into public/pyodide so the
// Python runner works with no network (laptop PWA and Android APK alike).
import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'pyodide');
const dest = join(root, 'public', 'pyodide');
const files = ['pyodide.mjs', 'pyodide.asm.mjs', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];

if (!existsSync(src)) {
  console.error('pyodide is not installed; run `npm install` first.');
  process.exit(1);
}
mkdirSync(dest, { recursive: true });
for (const f of files) cpSync(join(src, f), join(dest, f));
const version = JSON.parse(readFileSync(join(src, 'package.json'), 'utf8')).version;
console.log(`pyodide ${version} copied to public/pyodide (${files.length} files)`);
