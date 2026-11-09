# C# track: the LedgerSharp project spine

The Python Ledger reborn in .NET. Learners know Python and C; teach by contrast (managed heap vs malloc, static types vs Python names).

## Compiler constraints (important)

The in-app phone/web runner uses a Piston service whose C# runtime may be .NET 5 or Mono; the desktop app and the test harness use .NET 8. Reference solutions must therefore compile on **both**:
- Classic entry point: `class Program { static void Main(string[] args) { ... } }`. No top-level statements, no file-scoped namespaces, no `record`, no `required`, no `init`, no `global using`.
- Explicit `using System;`, `using System.Collections.Generic;`, `using System.Linq;`, `using System.IO;`, `using System.Text.Json;` as needed. Implicit usings are off in the harness.
- Nullable reference types are disabled; do not write `string?`.
- Allowed and encouraged: `var`, string interpolation, properties, LINQ, tuples, `out` parameters, `switch` statements, `is` patterns, classes with constructors, `List<T>`, `Dictionary<K,V>`, `System.Text.Json` (Module 5+), `async`/`await` with `Task` (Module 6).
- Tests compare trimmed stdout exactly. Prompts are `Console.WriteLine("...")` on their own line, then `Console.ReadLine()`. Whole-number money (`int`).
- Culture: format numbers with `ToString()` on ints only; never print doubles unless a version says so (then `ToString("0.00", CultureInfo.InvariantCulture)`).

## v0.1 (end of Module 1: Hello .NET)
```
Name?
Starting balance?
<name>'s ledger
Balance: <n>
```

## v0.2 (end of Module 2: Control flow and methods)
Mirrors Python v0.3, with static methods `ReadInt`, `Classify`, `Apply`:
```
Balance?
Amount (or quit)?        <- repeated until quit
  prints: expense | nothing | income      then  Balance: <running>
Entries: <k>
Final balance: <n>
```

## v0.3 (end of Module 3: Classes and objects)
`class Entry { int Amount; string Category }` (properties, constructor) and `class Ledger { Add, Balance (property), ByCategory() }`. I/O mirrors Python v0.4:
```
Balance?
Amount (or quit)?
Category?
Balance: <running>
...
--- summary ---
<category>: <total>      <- sorted by category name
Entries: <k>
Final balance: <n>
```

## v0.4 (end of Module 4: Collections and LINQ)
Same I/O as v0.3, with the report built by LINQ (`GroupBy`, `Sum`, `OrderBy`), plus the word `top` accepted at the amount prompt: prints `Top: <category> <total>` for the category with the largest **expense** (most negative total), or `Top: none`, then re-prompts.

## v0.5 (end of Module 5: Errors, files and JSON)
Same I/O as v0.4 plus, mirroring Python v0.6: at start load `ledger.json` (a JSON array of `{"Amount": int, "Category": str}`) → `Loaded <k> entries`; invalid amount → `Not a number, try again` (`int.TryParse`); on quit save → `Saved <n> entries` before the summary. Tests use `files` fixtures.

## v0.6 (end of Module 6: Async and tests)
Same I/O as v0.5, with the file read through `await File.ReadAllTextAsync` in an `async Task<int> Main`, and the word `selftest` accepted at the amount prompt: runs built-in assert-style checks on `Ledger` and prints `<n> tests passed`, then re-prompts. xUnit is taught in concept/predict steps.

## v1.0 (end of Module 7: A web API)
Two parts:
1. Runnable capstone: command-line verbs via `args` (tests pass `argv` and `files`):
```
Program add <amount> <category>  -> Added <amount> to <category>   (appends to ledger.json)
Program balance                  -> Balance: <sum>
Program report                   -> <category>: <total> sorted, then Entries: <k>
Program selftest                 -> <n> tests passed
otherwise                        -> Usage: add|balance|report|selftest   (exit code 1)
```
2. The web API (ASP.NET Core minimal API: `MapGet("/balance")`, `MapPost("/entries")`) is taught with concept, predict, parsons and cloze steps plus a **fieldwork** step done on the learner's own machine with `dotnet new web`, verified by the HTTP status code of a successful POST (`201`). It cannot run inside the app.
