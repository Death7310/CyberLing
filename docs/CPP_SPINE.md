# C++ track: the Vault++ project spine

The C Vault rebuilt the C++ way, one module at a time. Learners have completed the C track; teach by contrast ("in C this was X").

## Conventions (all versions)

- `#include <iostream>` etc., `std::` prefixes (no `using namespace std;` in reference solutions). Prompts with `std::cout << "...\n"`; read with `std::cin >>` for numbers/words and `std::getline` where a version says.
- Tests compile with `g++ -std=c++20 -Wall -Wextra -Werror`: **any warning fails**.
- Whole-number money (`int`); doubles printed with `std::fixed << std::setprecision(2)` where stated.
- No raw `new`/`delete` in reference solutions after Module 4 teaches ownership; `std::vector`, `std::string`, `std::unique_ptr`.
- Single file `main.cpp`. The in-app runner passes `argv` and fixture `files`.

## v0.1 (end of Module 1: From C to C++)
```
Name?        <- a full line (std::getline)
Records?     <- int
Vault++ for <name>
Records: <n>
```

## v0.2 (end of Module 2: Vectors and algorithms)
`std::vector<int> amounts`; command loop:
```
Command?  1 = add, 2 = list, 3 = quit, 4 = total, 5 = max, else Unknown command
  1 -> Amount? <int> -> Added
  2 -> amounts sorted ascending, one per line; then Records: <n>
  4 -> Total: <t>
  5 -> Max: <m>   (or  Empty  when there are no records)
  3 -> Bye
```

## v0.3 (end of Module 3: Classes)
`class Record { std::string name; int amount; }` with a constructor and accessors; `class Vault` with `add`, `list`, `total`, `find`. I/O:
```
Command?  1 = add, 2 = list, 3 = quit, 4 = find, else Unknown command
  1 -> Name? <word>  Amount? <int> -> Added
  2 -> records sorted by name: <name>: <amount>; then Records: <n>  /  Total: <t>
  4 -> Name? <word> -> <name>: <amount>  or  Not found
  3 -> Bye
```

## v0.4 (end of Module 4: Ownership)
Same I/O as v0.3 plus command `5` = undo: removes the most recently added record → `Undone` or `Nothing to undo`. Implemented with a `std::vector<Record>` history and move semantics; the `Vault` is held through `std::unique_ptr<Vault>` in `main` to teach ownership (observable behaviour unchanged).

## v0.5 (end of Module 5: Templates and generic code)
Same I/O as v0.4 plus command `6` = stats: `Min: <a>  Max: <b>  Mean: <x.xx>` on one line (or `Empty`). Built with a `template <typename T> class Stats` and a generic `Table<T>` used by `Vault`.

## v0.6 (end of Module 6: Errors and files)
Same I/O as v0.5 with: load `vault.txt` (`<name> <amount>` per line) at start → `Loaded <k> records`; save on quit → `Saved <n> records` before `Bye`; an amount that is not a number → `Not a number, try again` and re-prompt (use `std::getline` + `std::stoi` inside try/catch). Tests use `files` fixtures.

## v1.0 (end of Module 7: Building and testing)
Command-line verbs via `argv` (tests pass `argv` and `files`):
```
main add <name> <amount>  -> Added <name> <amount>   (appends to vault.txt)
main list                 -> <name>: <amount> sorted by name, then Records: <n>
main total                -> Total: <t>
main find <name>          -> <name>: <amount>  or  Not found
main selftest             -> <n> tests passed    (plain assert-style checks on Vault, no file access)
otherwise                 -> Usage: main add|list|total|find|selftest   (exit code 1)
```
Concept/predict steps cover CMake, separate compilation and sanitizers; the in-app build stays single-file.
