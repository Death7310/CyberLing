import type { Module, Track } from '../schema';
const planned = (id: string, title: string, goal: string, projectMilestone: string): Module => ({ id, title, goal, projectMilestone, lessons: [], status: 'planned' });

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
  modules: [
    planned('cpp-m1', 'From C to C++', 'iostream, std::string, references, namespaces, the same compile step.', 'Vault++ v0.1: the C program translated line by line.'),
    planned('cpp-m2', 'Vectors and algorithms', 'std::vector, range-for, iterators, sort/find, lambdas.', 'Vault++ v0.2: records in a vector, sorted and searched.'),
    planned('cpp-m3', 'Classes', 'Constructors, member functions, const, encapsulation, operator overloading basics.', 'Vault++ v0.3: a Record class and a Vault class.'),
    planned('cpp-m4', 'Ownership', 'RAII, destructors, copy vs move, unique_ptr and shared_ptr, why new/delete are rare.', 'Vault++ v0.4: no raw owning pointers anywhere.'),
    planned('cpp-m5', 'Templates and generic code', 'Function and class templates, concepts, where the compiler errors come from.', 'Vault++ v0.5: a generic Table<T>.'),
    planned('cpp-m6', 'Errors and files', 'Exceptions, std::optional/expected, fstream, structured error handling.', 'Vault++ v0.6: persistence with real error handling.'),
    planned('cpp-m7', 'Building and testing', 'CMake, separate compilation, a unit-test framework, sanitizers.', 'Vault++ v1.0: a CMake project with tests.'),
  ],
};
