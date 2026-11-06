import type { Module, Track } from '../schema';
const planned = (id: string, title: string, goal: string, projectMilestone: string): Module => ({ id, title, goal, projectMilestone, lessons: [], status: 'planned' });

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
  modules: [
    planned('cs-m1', 'Hello .NET', 'Program.cs, Console.WriteLine/ReadLine, var and explicit types, string interpolation, the dotnet CLI.', 'LedgerSharp v0.1: the console ledger.'),
    planned('cs-m2', 'Control flow and methods', 'if/switch, loops, methods, parameters, expression-bodied members.', 'LedgerSharp v0.2: a command loop built from methods.'),
    planned('cs-m3', 'Classes and records', 'Classes, properties, constructors, records, value vs reference semantics.', 'LedgerSharp v0.3: Entry record and Ledger class.'),
    planned('cs-m4', 'Collections and LINQ', 'List<T>, Dictionary<K,V>, IEnumerable, Where/Select/GroupBy/Sum.', 'LedgerSharp v0.4: reports by category with LINQ.'),
    planned('cs-m5', 'Errors, files and JSON', 'Exceptions, using/IDisposable, System.IO, System.Text.Json.', 'LedgerSharp v0.5: persistence with validation.'),
    planned('cs-m6', 'Async and tests', 'async/await, Task, xUnit tests, dependency injection basics.', 'LedgerSharp v0.6: a tested class library.'),
    planned('cs-m7', 'A web API', 'ASP.NET Core minimal API, routing, DTOs, HTTP semantics.', 'LedgerSharp v1.0: the ledger as an HTTP service, ready for Azure.'),
  ],
};
