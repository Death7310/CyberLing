# C track: the Vault project spine

One program grows across eight modules. Each module's last lesson is a `create` step producing the version below, tested exactly.

## Conventions (all versions)

- Prompts are printed with `printf("...\n")` on their own line, then read with `scanf`. Tests compare trimmed stdout exactly.
- Whole-number money (`int`); doubles only where stated, printed with `%.2f`.
- Tests compile with `gcc -Wall -Wextra -Werror`: **any warning fails the test**. Check `scanf` return values or cast to `(void)`, initialise variables, no unused parameters.
- C17, standard library only. Single file `main.c`. Names read with `scanf("%31s", buf)` are single words (no spaces).
- The in-app runner passes `argv` and fixture `files` to the program; use them only where a version says so.
- Programs must free everything they `malloc` and must not read out of bounds (later modules are run under sanitizers by learners on desktop).

## v0.1 (end of Module 1) — done
```
Records?           <- int
Balance?           <- double
Records: <n>
Balance: <x.xx>
```

## v0.2 (end of Module 2: Deciding and repeating)
A command loop over an `int total` and `int count`.
```
Command?                      <- repeated; 1 = add, 2 = show, 3 = quit, anything else = Unknown command
  1 -> Amount?  <int>   (total += amount, count++)   then prints: Added
  2 -> Records: <count>  /  Total: <total>
  3 -> Bye   (loop ends)
```
Example, stdin `1\n50\n1\n-20\n2\n9\n3`:
```
Command?
Amount?
Added
Command?
Amount?
Added
Command?
Records: 2
Total: 30
Command?
Unknown command
Command?
Bye
```

## v0.3 (end of Module 3: Functions and the stack)
Identical I/O to v0.2, built from `int read_int(const char *prompt)`, `void show(int count, int total)`, and `int handle(int command, int *count, int *total)` (returns 0 when the loop should stop). Pointers to `count`/`total` are introduced here *only* as "so the function can change the caller's box"; the full pointer model is Module 6.

## v0.4 (end of Module 4: Arrays and strings)
Records have a name. Parallel arrays `char names[100][32]` and `int amounts[100]`, capped at 100.
```
Command?   1 = add, 2 = list, 3 = quit, 4 = find, else Unknown command
  1 -> Name? <word>  Amount? <int>  -> Added
  2 -> one line per record in insertion order: <name>: <amount>   then  Records: <n>  /  Total: <t>
  4 -> Name? <word> -> <name>: <amount>  or  Not found
  3 -> Bye
```
When the vault is full (100 records), `1` prints `Vault full` instead of asking.

## v0.5 (end of Module 5: Structs)
Same I/O as v0.4 with `struct Record { char name[32]; int amount; }` and `struct Record vault[100]`; functions take `struct Record *` or `const struct Record *`.

## v0.6 (end of Module 6: Pointers and memory)
Same I/O as v0.5 but the vault is a heap array that grows (`malloc` + `realloc`, capacity doubling from 4), so no `Vault full`. New command `5` = remove: `Name? <word>` → `Removed` or `Not found` (shift the tail down). Everything freed before exit.

## v0.7 (end of Module 7: Files)
On start: if `vault.txt` exists, load lines of `<name> <amount>`; print `Loaded <k> records` (0 if absent). On `3`: write all records to `vault.txt` in the same format and print `Saved <n> records` before `Bye`. Tests use `files: { 'vault.txt': 'rent -800\nsalary 2500\n' }`.

## v1.0 (end of Module 8: Building real programs)
Command-line verbs via `argv` (tests pass `argv` and `files`):
```
main add <name> <amount>   -> appends to vault.txt, prints: Added <name> <amount>
main list                  -> <name>: <amount> per line (file order), then Records: <n>
main total                 -> Total: <t>
main find <name>           -> <name>: <amount>  or  Not found
(no args / unknown verb)   -> Usage: main add|list|total|find    (exit code 1)
```
With no `vault.txt`, `list` prints `Records: 0` and `total` prints `Total: 0`. The module also teaches headers, multiple translation units, `make`, and `gdb` in concept/predict steps (the in-app build is single-file).
