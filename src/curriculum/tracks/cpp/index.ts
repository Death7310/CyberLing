import type { Track } from '../../schema';
import { m1 } from './m1';
import { m2 } from './m2';
import { m3 } from './m3';
import { m4 } from './m4';
import { m5 } from './m5';
import { m6 } from './m6';
import { m7 } from './m7';

export const cpp: Track = {
  id: 'cpp',
  title: 'C++',
  tagline: 'C with abstractions that cost nothing at run time. Taught as a contrast with C: same machine, more vocabulary.',
  prerequisites: ['c'],
  runnable: true,
  notionalMachine: [
    'Everything from the C machine still holds: boxes, addresses, the stack, the compile step.',
    'An **object** is a box with rules attached: a constructor fills it, a destructor cleans it up, and that cleanup runs automatically when the box goes out of scope (**RAII**).',
    'A **reference** is another name for an existing box; unlike a pointer it cannot be null or re-seated.',
    '**Templates** stamp out a new copy of a function or class for each type you use it with, at compile time.',
    'The standard library (`std::string`, `std::vector`, algorithms) is how you avoid writing the memory code from the C track by hand.',
  ],
  projectSpine: {
    title: 'Vault++',
    description: 'The C Vault rebuilt the C++ way: std::string and std::vector instead of raw arrays, a Record class, RAII for files, and algorithms for searching and sorting. The final version is a small library with its own tests.',
  },
  modules: [m1, m2, m3, m4, m5, m6, m7],
};
