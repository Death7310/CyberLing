# Python track: the Ledger project spine

One program grows across all eight modules. Every module's final lesson is a `create` step that produces the version below, tested exactly. Authors of a module must start from the previous version's contract and end at their own. Keep the I/O conventions so tests stay deterministic.

## Conventions (all versions)

- Prompts are printed on their own line with `print(...)`, then `input()` reads the answer. Never `input("prompt")`.
- Money is whole numbers (`int`). Negative = expense, positive = income.
- Output lines are exact; tests compare trimmed stdout.
- Programs run as a single file (`main.py`) with no third-party packages. The standard library is available (json, argparse, unittest, dataclasses, collections, statistics...). Nothing network- or time-dependent.
- Runs are killed after 8 seconds.

## v0.2 (end of Module 2: Deciding) — done

```
Balance?            <- read int
Amount?             <- read int
expense | nothing | income
warning: overdrawn  <- only for an expense that makes the balance negative
Balance: <new>
```

## v0.3 (end of Module 3: Repeating)

```
Balance?                    <- read int
Amount (or quit)?           <- repeated until the user types quit
  after each amount: Balance: <running>
Entries: <count>            <- number of amounts entered (quit not counted)
Final balance: <n>
```
Example, stdin `100\n-30\n50\nquit`:
```
Balance?
Amount (or quit)?
Balance: 70
Amount (or quit)?
Balance: 120
Amount (or quit)?
Entries: 2
Final balance: 120
```

## v0.4 (end of Module 4: Collections)

Each entry has a category. Entries are stored in a list; totals per category in a dict.
```
Balance?
Amount (or quit)?
Category?                   <- asked after each amount (not after quit)
  after each entry: Balance: <running>
--- summary ---
<category>: <total>         <- one line per category, sorted by category name
Entries: <count>
Final balance: <n>
```
Example, stdin `100\n-30\nfood\n50\nsalary\n-10\nfood\nquit`:
```
Balance?
Amount (or quit)?
Category?
Balance: 70
Amount (or quit)?
Category?
Balance: 120
Amount (or quit)?
Category?
Balance: 110
Amount (or quit)?
--- summary ---
food: -40
salary: 50
Entries: 3
Final balance: 110
```

## v0.5 (end of Module 5: Functions)

Identical behaviour to v0.4, restructured into functions:
`read_int(prompt)`, `read_entries()` (returns list of `(amount, category)` tuples), `apply(balance, amount)`, `summarize(entries)` (returns dict category→total), `print_report(entries, balance)`. The `create` tests check the program's I/O (same transcript as v0.4) and may also test individual functions by appending calls that print results.

## v0.6 (end of Module 6: Files and errors)

- On start, if `ledger.json` exists, load it: a JSON list of objects `{"amount": int, "category": str}`. Print `Loaded <k> entries` (print `Loaded 0 entries` when the file is absent).
- Balance is computed from loaded entries (sum of amounts) plus the `Balance?` answer as the starting balance.
- An amount that is not a whole number and not `quit` prints `Not a number, try again` and re-prompts `Amount (or quit)?` without asking a category.
- On quit, save all entries (loaded + new) to `ledger.json` and print `Saved <total> entries` before the summary. Summary and footer as v0.4.

Tests use the `files` fixture (`files: { 'ledger.json': '[{"amount": -20, "category": "food"}]' }`) and absence of it.

## v0.7 (end of Module 7: Structure)

Same behaviour as v0.6, now built from:
```python
from dataclasses import dataclass, asdict

@dataclass
class Entry:
    amount: int
    category: str

class Ledger:
    def __init__(self, starting=0): ...
    def add(self, entry): ...
    @property
    def balance(self): ...
    def by_category(self): ...     # dict, sorted keys when printed
    def save(self, path): ...
    @classmethod
    def load(cls, path, starting=0): ...
```
Everything stays in one file (the in-app runner executes a single file). Teach that in a real project these would be `entry.py` / `ledger.py` / `main.py`, and show the import lines, but tests run the single-file version.

## v1.0 (end of Module 8: Testing and shipping)

A command-line tool driven by `sys.argv` through `argparse` (tests use the `argv` fixture plus `files`):
```
main.py add <amount> <category>   -> appends to ledger.json, prints: Added <amount> to <category>
main.py balance                   -> prints: Balance: <sum of all amounts>
main.py report                    -> prints one line per category sorted, then Entries: <k>
main.py selftest                  -> runs the built-in tests, prints: <n> tests passed
```
`report` output per category: `food: -40`. With no `ledger.json`, `balance` prints `Balance: 0` and `report` prints `Entries: 0` only.
Built-in tests are plain functions using `assert` run by a `run_tests()` function (unittest is taught as a concept/predict step; its stderr output is not compared).
Also include `if __name__ == "__main__": main()`.

---

# Beyond the Ledger: Modules 9 and 10

The Ledger is finished at v1.0. Modules 9–10 keep its data model (`Entry(amount, category)` stored as `ledger.json` or CSV) and build **analysis tools** around it. They assume everything in Modules 1–8. No new project versions; each lesson's `create` step is a standalone tool over Ledger data, with `files` fixtures.

## Module 9: Data
- Comprehensions and generator expressions; `sorted(key=...)`, `itertools`, `collections.Counter/defaultdict`.
- `csv` reading and writing (`DictReader`), converting between CSV and JSON ledgers.
- `sqlite3` (in the standard library and available in-app): create a table from entries, `SELECT category, SUM(amount) ... GROUP BY`, parameters, why SQL for aggregation.
- `statistics` (mean, median) and `datetime` parsing of fixed date strings in fixtures (never the current time).
- Capstone tool `ledger_report.py`: reads `entries.csv` (`date,amount,category`), prints per-month totals sorted by month (`2026-01: -120`), the biggest expense category, and the median entry.

## Module 10: Algorithms and growth
- Recursion (sum a nested list of categories, binary search on sorted amounts), base cases, call-depth intuition.
- Searching and sorting by hand (linear vs binary, selection sort) with operation counting; big-O as "how the count grows"; list vs dict vs set lookup; `heapq` for top-k; `functools.lru_cache`.
- Reading tracebacks from deep recursion; iterative rewrites.
- Capstone tool `insights.py`: given `entries.csv`, prints top-3 expense categories (`heapq.nlargest` on absolute totals), the running balance's minimum point (`Lowest balance: <n> on <date>`), and whether a budget (an `argv` integer) was ever exceeded (`Budget exceeded on <date>` or `Within budget`).
