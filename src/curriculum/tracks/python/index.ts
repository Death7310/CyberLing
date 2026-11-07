import type { Track } from '../../schema';
import { m1 } from './m1';
import { m2 } from './m2';
import { m3 } from './m3';
import { m4 } from './m4';
import { m5 } from './m5';
import { m6 } from './m6';
import { m7 } from './m7';
import { m8 } from './m8';

export const python: Track = {
  id: 'python',
  title: 'Python',
  tagline: 'The first language. Readable, forgiving, and used everywhere from scripts to data to the cloud.',
  prerequisites: [],
  runnable: true,
  notionalMachine: [
    'Python reads your file **top to bottom** and performs one statement at a time.',
    'A **name** is a label attached to a value. `=` attaches; using the name gives the value back. Names can be re-attached.',
    'Every value has a **type** (int, float, str, bool, list, ...) and the type decides what an operation means.',
    'Indentation defines **blocks**. A block runs only when the line introducing it (`if`, `while`, `for`, `def`) says so.',
    'Calling a function **jumps** into its body with the arguments bound to parameter names, and `return` jumps back with a value.',
    'Errors stop the program at the line where the problem occurred and print a traceback; read it bottom-up.',
  ],
  projectSpine: {
    title: 'Ledger',
    description: 'A personal money tracker that starts as two printed lines and grows, module by module, into a command-driven program that stores entries, saves them to a file, reports totals by category, and has tests.',
  },
  modules: [m1, m2, m3, m4, m5, m6, m7, m8],
};
