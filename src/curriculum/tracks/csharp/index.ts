import type { Track } from '../../schema';
import { m1 } from './m1';
import { m2 } from './m2';
import { m3 } from './m3';
import { m4 } from './m4';
import { m5 } from './m5';
import { m6 } from './m6';
import { m7 } from './m7';

export const csharp: Track = {
  id: 'csharp',
  title: 'C#',
  tagline: 'A managed language with C-family grammar. Objects, a garbage collector, and the .NET ecosystem that the Azure track builds on.',
  prerequisites: ['python', 'c'],
  runnable: true,
  notionalMachine: [
    'C# compiles to **intermediate language** that the .NET runtime compiles again when the program runs; you still get compile-time type errors.',
    'Variables are typed boxes like C, but **objects live on a managed heap** and a **garbage collector** frees them: no free(), no delete.',
    'A **class** is a blueprint; `new` makes an instance; a variable of class type holds a reference (like a safe pointer) to it. **Structs** are copied by value.',
    '**Exceptions** carry errors up the call stack until a `try/catch` handles them.',
    '`async`/`await` lets a method pause while waiting (for a file, a network call) without blocking the thread.',
  ],
  projectSpine: {
    title: 'LedgerSharp',
    description: 'The Python Ledger reborn as a .NET application: a console app first, then a class library with LINQ queries and JSON persistence, and finally a small web API that the Azure track deploys.',
  },
  modules: [m1, m2, m3, m4, m5, m6, m7],
};
