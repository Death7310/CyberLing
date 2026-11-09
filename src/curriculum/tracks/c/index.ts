import type { Track } from '../../schema';
import { m1 } from './m1';
import { m2 } from './m2';
import { m3 } from './m3';
import { m4 } from './m4';
import { m5 } from './m5';
import { m6 } from './m6';
import { m7 } from './m7';
import { m8 } from './m8';

export const c: Track = {
  id: 'c',
  title: 'C',
  tagline: 'The language of the machine. Memory, addresses and the compile step, taught against what you already know.',
  prerequisites: ['python'],
  runnable: true,
  notionalMachine: [
    'A **compiler** turns the whole file into machine code before anything runs. Grammar errors stop everything.',
    'A **variable is a box** of fixed size and type at a fixed **address** in memory. Assignment copies a value into the box.',
    '`&x` is the address of x; a **pointer** is a box that holds an address; `*p` is the box at that address.',
    'Function calls push a **stack frame**; local boxes live in it and vanish on return. `malloc` reserves boxes that outlive the call, and you must `free` them.',
    'An **array** is a row of boxes; its name decays to the address of the first one. C never checks that an index is in range.',
    'A **string** is an array of chars ending with the zero byte `\\0`. Forget the terminator and functions keep reading.',
    'Undefined behaviour is real: the compiler is allowed to assume you never do it, so "it worked on my machine" proves nothing.',
  ],
  projectSpine: {
    title: 'Vault',
    description: 'A record-keeping command-line tool. It starts by printing two lines and ends as a program that stores records in dynamically allocated memory, saves them to a binary file, and never leaks or overruns a buffer.',
  },
  modules: [m1, m2, m3, m4, m5, m6, m7, m8],
};
