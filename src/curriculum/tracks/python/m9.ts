import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 9: Data                                                     */
/* ------------------------------------------------------------------ */

/** Python source written verbatim: backslashes stay, leading newline dropped. */
const py = (s: TemplateStringsArray) => s.raw.join('').replace(/^\n/, '');

/* Shared CSV fixtures (date,amount,category). Months are deliberately out of order in B. */
const csvA = 'date,amount,category\n2026-01-03,-30,food\n2026-01-10,120,salary\n2026-01-15,-90,rent\n2026-02-02,-10,food\n2026-02-20,200,salary\n';
const csvB = 'date,amount,category\n2026-03-01,50,tips\n2026-01-15,-25,food\n2026-02-10,-25,food\n2026-01-20,300,salary\n2026-03-05,-15,fuel\n';
const csvC = 'date,amount,category\n2026-05-01,10,tips\n2026-05-02,15,tips\n';
const csvEmpty = 'date,amount,category\n';

/* ---------------------------- 9-1 --------------------------------- */

const l91: Lesson = {
  id: 'py-9-1',
  title: 'Loops in one line',
  objective: 'Replace accumulate-and-append loops with comprehensions and generator expressions, and sort with a key.',
  minutes: 24,
  lexicon: [
    { id: 'py.9.list-comp', term: '[expr for x in xs if cond]', kind: 'pattern', meaning: 'Build a new list in one expression: visit each x in xs, keep only those where cond is True, and put expr in the list for each one. The if part is optional. Replaces a loop that creates an empty list and appends.', example: 'expenses = [a for a, c in entries if a < 0]', analogy: 'Set-builder notation from maths: "the set of a for each entry where a is negative". It breaks here: a list keeps order and duplicates, a mathematical set does neither.' },
    { id: 'py.9.set-dict-comp', term: '{x for ...} / {k: v for ...}', kind: 'pattern', meaning: 'The same shape with braces builds a set (one expression) or a dict (key: value). A set comprehension is the quickest way to collect the distinct values; a dict comprehension builds a lookup table.', example: 'categories = {c for a, c in entries}\nby_name = {c: a for a, c in entries}' },
    { id: 'py.9.genexp', term: '(expr for x in xs)', kind: 'pattern', meaning: 'A generator expression: like a list comprehension but lazy. It produces items one at a time when something asks for them and never builds the list. Pass it straight to sum, max, any, all, sorted or join. It can be consumed only once.', example: 'spent = sum(a for a, c in entries if a < 0)', analogy: 'A recipe rather than a cooked meal: it makes the food when you sit down, not before. It breaks here: a recipe can be cooked twice, a generator cannot; once consumed it is empty.' },
    { id: 'py.9.sorted-key', term: 'sorted(xs, key=lambda x: ...)', kind: 'builtin', meaning: 'Return a new sorted list. key= names the value to compare for each item, so you can sort records by one field. reverse=True flips the order. The original list is untouched.', example: 'ranked = sorted(entries, key=lambda e: e[0])' },
    { id: 'py.9.any-all', term: 'any(...) / all(...)', kind: 'builtin', meaning: 'any is True if at least one item is truthy; all is True if every item is (and True for an empty sequence). Both stop as soon as the answer is known, which is why they pair so well with generator expressions.', example: 'any(a > 100 for a, c in entries)\nall(a != 0 for a, c in entries)' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Say what the list is, not how to build it',
      body: `In Module 4 you built lists with a loop: start empty, visit each item, \`append\` when a condition holds. Python has a shorter way to say exactly that. A **comprehension** puts the loop inside the brackets: \`[expr for x in xs if cond]\`. Read it from the \`for\` outward: "for each x in xs, if cond, give me expr".

The same shape with braces builds a **set** (\`{c for ...}\`) or, with a colon, a **dict** (\`{k: v for ...}\`). With round brackets it becomes a **generator expression**: the items are produced one at a time, only when something asks, and the list is never built. Hand one to \`sum\`, \`max\`, \`any\`, \`all\` or \`", ".join\`.

\`sorted(xs, key=lambda x: ...)\` sorts by whatever the lambda returns. \`zip\` walks two sequences side by side and \`enumerate\` gives you positions; you met both in Module 4 and they appear here unchanged.

A comprehension is for building a value. If the loop *does* something (prints, writes a file), keep it a loop.`,
      example: {
        language: 'python',
        source: `entries = [(-30, "food"), (120, "salary"), (-90, "rent"), (-10, "food")]

expenses = []
for amount, category in entries:
    if amount < 0:
        expenses.append(amount)

expenses = [amount for amount, category in entries if amount < 0]
categories = {category for amount, category in entries}
labels = {category: amount < 0 for amount, category in entries}
spent = sum(amount for amount, category in entries if amount < 0)
ranked = sorted(entries, key=lambda e: e[0])
print(expenses, sorted(categories), labels["rent"], spent)
print(ranked[0], ranked[-1])
print(any(amount > 100 for amount, category in entries))
print(all(amount != 0 for amount, category in entries))
for position, (amount, category) in enumerate(ranked, start=1):
    print(f"{position}. {category} {amount}")`,
        labels: [
          { lines: [1, 1], label: 'The Module 4 shape of an entry: a tuple of amount and category.' },
          { lines: [3, 6], label: 'The Module 4 way: start empty, visit, test, append. Four lines to say "the negative amounts".' },
          { lines: [8, 8], label: 'The same list as one expression. Read from the for outward: for each entry, if negative, keep the amount.' },
          { lines: [9, 10], label: 'Braces build a set (distinct categories) or, with a colon, a dict (category -> is it an expense).' },
          { lines: [11, 11], label: 'Round brackets make a generator: sum pulls the amounts one at a time; no list is ever built.' },
          { lines: [12, 12], label: 'Sort the entries by their first field. The lambda says what to compare; the tuples themselves are returned.' },
          { lines: [13, 14], label: 'Output: [-30, -90, -10] [\'food\', \'rent\', \'salary\'] True -130, then (-90, \'rent\') (120, \'salary\'). Sets are unordered, so always sort before printing one.' },
          { lines: [15, 16], label: 'any: is there at least one? all: is it true of every one? Both take a generator and stop early. Output: True then True.' },
          { lines: [17, 18], label: 'enumerate from Module 4, counting from 1. A loop that prints stays a loop.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: {
        language: 'python',
        source: `entries = [(-30, "food"), (120, "salary"), (-50, "rent")]
amounts = (amount for amount, category in entries)
print(amounts)
print(sum(amounts))
print(sum(amounts))`,
      },
      choices: [
        '<generator object <genexpr> at 0x...>\n40\n0',
        '<generator object <genexpr> at 0x...>\n40\n40',
        '[-30, 120, -50]\n40\n40',
        '[-30, 120, -50]\n40\n0',
      ],
      answer: '<generator object <genexpr> at 0x...>\n40\n0',
      explanation: 'Round brackets make a generator, not a list, so printing it shows the object, not the items. The first `sum` pulls every item out (-30 + 120 - 50 = 40). A generator cannot rewind: the second `sum` finds nothing left and returns 0. If you need the values twice, build a list with square brackets.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the comprehensions so the program prints `[-30, -90, -10]`, then `(-90, \'rent\')`, then `-130`.',
      language: 'python',
      template: `entries = [(-30, "food"), (120, "salary"), (-90, "rent"), (-10, "food")]
expenses = [amount {{kw1}} amount, category in entries {{kw2}} amount < 0]
largest = sorted(entries, {{key}}=lambda e: e[0])[0]
spent = {{agg}}(amount for amount, category in entries if amount < 0)
print(expenses)
print(largest)
print(spent)`,
      blanks: [
        { id: 'kw1', answers: ['for'], hint: 'the keyword that starts the loop inside the brackets' },
        { id: 'kw2', answers: ['if'], hint: 'the keyword that filters' },
        { id: 'key', answers: ['key'], hint: 'the sorted() argument that says what to compare' },
        { id: 'agg', answers: ['sum'], hint: 'the builtin that adds up a generator' },
      ],
      explanation: 'A comprehension is `for` then optional `if`, in that order. `key=` tells `sorted` to compare by amount, so index 0 is the most negative entry. `sum` takes the generator directly; no list is built.',
    },
    {
      kind: 'modify',
      prompt: `This Module 4 program works but is long. Rewrite each of the three loops as a comprehension or a generator expression (the first three output lines must not change), then add a fourth line \`Categories: <distinct categories, sorted, separated by ", ">\` built from a set comprehension.`,
      language: 'python',
      starter: py`
entries = [(-30, "food"), (120, "salary"), (-90, "rent"), (-10, "food"), (45, "tips")]

expenses = []
for amount, category in entries:
    if amount < 0:
        expenses.append(amount)

spent = 0
for amount in expenses:
    spent = spent + amount

big = []
for amount, category in entries:
    if amount >= 100:
        big.append(category)

print(f"Expenses: {expenses}")
print(f"Spent: {spent}")
print(f"Big: {big}")
`,
      tests: [{ description: 'three rewritten lines plus the categories line', expectedStdout: "Expenses: [-30, -90, -10]\nSpent: -130\nBig: ['salary']\nCategories: food, rent, salary, tips" }],
      hint: 'Each loop that starts with an empty list is one comprehension. The `spent` loop is `sum(...)` of a generator. For the new line: `{category for ...}` collects distinct names; `sorted` puts them in order; `", ".join` makes the string.',
      solution: py`
entries = [(-30, "food"), (120, "salary"), (-90, "rent"), (-10, "food"), (45, "tips")]

expenses = [amount for amount, category in entries if amount < 0]
spent = sum(amount for amount in expenses)
big = [category for amount, category in entries if amount >= 100]
categories = {category for amount, category in entries}

print(f"Expenses: {expenses}")
print(f"Spent: {spent}")
print(f"Big: {big}")
print(f"Categories: {', '.join(sorted(categories))}")
`,
    },
    {
      kind: 'create',
      prompt: `Write \`ledger_facts.py\`: a standalone tool that reads \`ledger.json\` (a list of records with \`amount\` and \`category\`, as saved by Ledger v1.0) and prints seven lines, using comprehensions and generator expressions rather than loops:

- \`Entries: <count>\`
- \`Expenses: <count of negative amounts>\`
- \`Spent: <sum of negative amounts>\` (0 if none)
- \`Categories: <distinct categories, sorted, separated by ", ">\`
- \`Ranked: <"amount category" for every record, from most negative to most positive, separated by ", ">\`
- \`Any income: yes\` or \`no\` (is any amount positive?)
- \`All small: yes\` or \`no\` (is every amount strictly between -100 and 100?)

With an empty list the file still produces all seven lines; \`Categories:\` and \`Ranked:\` are then empty after the colon.`,
      language: 'python',
      tests: [
        {
          description: 'four entries in three categories',
          files: { 'ledger.json': '[{"amount": -30, "category": "food"}, {"amount": 120, "category": "salary"}, {"amount": -90, "category": "rent"}, {"amount": -10, "category": "food"}]' },
          expectedStdout: 'Entries: 4\nExpenses: 3\nSpent: -130\nCategories: food, rent, salary\nRanked: -90 rent, -30 food, -10 food, 120 salary\nAny income: yes\nAll small: no',
        },
        {
          description: 'a single expense',
          files: { 'ledger.json': '[{"amount": -5, "category": "fuel"}]' },
          expectedStdout: 'Entries: 1\nExpenses: 1\nSpent: -5\nCategories: fuel\nRanked: -5 fuel\nAny income: no\nAll small: yes',
        },
        {
          description: 'empty ledger: all() of nothing is True',
          files: { 'ledger.json': '[]' },
          expectedStdout: 'Entries: 0\nExpenses: 0\nSpent: 0\nCategories:\nRanked:\nAny income: no\nAll small: yes',
        },
      ],
      hint: '`json.load` gives a list of dicts. `sorted(records, key=lambda r: r["amount"])` ranks them. For `Ranked`, join a generator of f-strings. `any` and `all` take generators; `all` of an empty sequence is True, which is the behaviour the third test checks.',
      solution: py`
import json

with open("ledger.json") as f:
    records = json.load(f)

expenses = [r["amount"] for r in records if r["amount"] < 0]
categories = sorted({r["category"] for r in records})
ranked = sorted(records, key=lambda r: r["amount"])
ranked_text = ", ".join(f"{r['amount']} {r['category']}" for r in ranked)

print(f"Entries: {len(records)}")
print(f"Expenses: {len(expenses)}")
print(f"Spent: {sum(expenses)}")
print(f"Categories: {', '.join(categories)}")
print(f"Ranked: {ranked_text}")
print(f"Any income: {'yes' if any(r['amount'] > 0 for r in records) else 'no'}")
print(f"All small: {'yes' if all(abs(r['amount']) < 100 for r in records) else 'no'}")
`,
      projectNote: 'First analysis tool over Ledger data: the v1.0 ledger.json read back and summarised in a dozen lines, no loops that append.',
    },
  ],
};

/* ---------------------------- 9-2 --------------------------------- */

const l92: Lesson = {
  id: 'py-9-2',
  title: 'Rows and columns',
  objective: 'Read and write CSV files with DictReader and DictWriter, converting every field from text yourself.',
  minutes: 24,
  lexicon: [
    { id: 'py.9.dictreader', term: 'csv.DictReader(f)', kind: 'builtin', meaning: 'Read a CSV file one row at a time, using the first line as column names, so each row is a dict like {"date": "2026-01-03", "amount": "-30", "category": "food"}. Wrap in list() to keep all rows.', example: 'with open("entries.csv", newline="") as f:\n    rows = list(csv.DictReader(f))' },
    { id: 'py.9.dictwriter', term: 'csv.DictWriter(f, fieldnames=[...])', kind: 'builtin', meaning: 'Write dicts as CSV rows. fieldnames fixes the column order; writeheader() writes the first line; writerow(d) writes one dict. Numbers are converted to text for you.', example: 'w = csv.DictWriter(f, fieldnames=["category", "total"])\nw.writeheader()\nw.writerow({"category": "food", "total": -40})' },
    { id: 'py.9.newline', term: 'open(path, newline="")', kind: 'pattern', meaning: 'Always open a CSV file with newline="" so the csv module controls line endings itself. Without it, written files can gain blank lines on some systems and quoted fields containing line breaks are read wrongly.', example: 'with open("totals.csv", "w", newline="") as f:\n    writer = csv.DictWriter(f, fieldnames=["category", "total"])' },
    { id: 'py.9.csv-strings', term: 'CSV fields are strings', kind: 'concept', meaning: 'A CSV file has no types: every field comes back as text, including numbers and dates. Convert with int(), float() or date.fromisoformat() at the point you read, or sorting and sums go wrong silently.', example: 'amount = int(row["amount"])', analogy: 'A form filled in by hand: "120" is ink on paper until someone reads it as a number. It breaks here: a person reads "120" as a number automatically; Python never does.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A table in a text file',
      body: `Spreadsheets and banks export **CSV**: one row per line, fields separated by commas, column names on the first line. Our ledger in CSV has three columns: \`date,amount,category\`.

The \`csv\` module reads and writes it. \`csv.DictReader(f)\` turns each line into a dict keyed by the column names, so a row reads as \`row["amount"]\`, not \`row[1]\`. \`csv.DictWriter(f, fieldnames=[...])\` does the reverse: \`writeheader()\` then \`writerow(dict)\` per row.

Two rules. **One**: open CSV files with \`newline=""\`, both for reading and writing; the module manages line endings itself. **Two**: every field is a **string**. \`"120"\` is text, \`"-30" < "5"\` compares letters, and \`sum\` of strings is an error. Convert with \`int()\` the moment you read, and your old JSON code sees the numbers it expects.

The example reads the CSV ledger, totals it, and writes a second CSV holding only the expenses.`,
      example: {
        language: 'python',
        source: `import csv

with open("entries.csv", newline="") as f:
    rows = list(csv.DictReader(f))

print(rows[0])
total = sum(int(row["amount"]) for row in rows)
print(f"Total: {total}")

with open("expenses.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["date", "amount", "category"])
    writer.writeheader()
    for row in rows:
        if int(row["amount"]) < 0:
            writer.writerow(row)`,
        labels: [
          { lines: [1, 1], label: 'The csv module is in the standard library.' },
          { lines: [3, 4], label: 'Open with newline="". DictReader uses the first line as keys; list() reads every row while the file is open.' },
          { lines: [6, 6], label: "Output: {'date': '2026-01-03', 'amount': '-30', 'category': 'food'}. Every value is a string, even amount." },
          { lines: [7, 8], label: 'Convert while summing: int() on each field. Without it, sum raises TypeError.' },
          { lines: [10, 12], label: 'Write mode plus newline="". fieldnames fixes the column order; writeheader writes date,amount,category.' },
          { lines: [13, 15], label: 'Each kept row is written as one line. The row is still the dict DictReader produced, so no reformatting is needed.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: '`entries.csv` holds the header and amounts `-30`, `120`, `-90`, `5` (one per row). What does this print?',
      code: {
        language: 'python',
        source: `import csv

with open("entries.csv", newline="") as f:
    rows = list(csv.DictReader(f))

amounts = [row["amount"] for row in rows]
print(sorted(amounts))
print(max(amounts))`,
      },
      choices: [
        "['-30', '-90', '120', '5']\n5",
        "['-90', '-30', '5', '120']\n120",
        '[-90, -30, 5, 120]\n120',
        "['-30', '-90', '120', '5']\n120",
      ],
      answer: "['-30', '-90', '120', '5']\n5",
      explanation: 'No `int()` was applied, so the amounts are strings and compare character by character: `-` sorts before digits, `1` before `5`, so `"120"` comes before `"5"` and `"5"` is the maximum. The quotes in the output are the giveaway. Convert at the point you read: `int(row["amount"])`.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that writes `totals.csv` with columns `category,total`, one row per category in sorted order. Set indentation yourself.',
      language: 'python',
      indentation: true,
      solution: [
        'import csv',
        'totals = {"food": -40, "rent": -90}',
        'with open("totals.csv", "w", newline="") as f:',
        '    writer = csv.DictWriter(f, fieldnames=["category", "total"])',
        '    writer.writeheader()',
        '    for category in sorted(totals):',
        '        writer.writerow({"category": category, "total": totals[category]})',
      ],
      distractors: [
        'with open("totals.csv", "w") as f:',
        '    writer = csv.DictWriter(f)',
        '        writer.writerow(category, totals[category])',
      ],
      explanation: 'CSV files are opened with `newline=""`. `DictWriter` needs `fieldnames` to know the column order. `writerow` takes one dict, not separate arguments. `writeheader` comes once, before the loop.',
    },
    {
      kind: 'modify',
      prompt: 'This converter turns `entries.csv` into `ledger.json` and reports the total, but it crashes with `TypeError: unsupported operand type(s) for +: \'int\' and \'str\'`, and the JSON it wrote has `"amount": "-30"` with quotes. Fix the conversion so amounts are stored as numbers and the total works. Do not change what is printed.',
      language: 'python',
      starter: py`
import csv
import json

with open("entries.csv", newline="") as f:
    rows = list(csv.DictReader(f))

records = [{"amount": row["amount"], "category": row["category"]} for row in rows]
with open("ledger.json", "w") as f:
    json.dump(records, f)

with open("ledger.json") as f:
    print(f.read())
print(f"Total: {sum(r['amount'] for r in records)}")
`,
      tests: [
        { description: 'two rows become two numeric records', files: { 'entries.csv': 'date,amount,category\n2026-01-03,-30,food\n2026-01-10,120,salary\n' }, expectedStdout: '[{"amount": -30, "category": "food"}, {"amount": 120, "category": "salary"}]\nTotal: 90' },
        { description: 'five rows', files: { 'entries.csv': csvA }, expectedStdout: '[{"amount": -30, "category": "food"}, {"amount": 120, "category": "salary"}, {"amount": -90, "category": "rent"}, {"amount": -10, "category": "food"}, {"amount": 200, "category": "salary"}]\nTotal: 190' },
        { description: 'headers only gives an empty ledger', files: { 'entries.csv': csvEmpty }, expectedStdout: '[]\nTotal: 0' },
      ],
      hint: 'The CSV gives `"-30"` as text and the comprehension copies it unchanged into the record. One `int()` where the record is built fixes both symptoms.',
      solution: py`
import csv
import json

with open("entries.csv", newline="") as f:
    rows = list(csv.DictReader(f))

records = [{"amount": int(row["amount"]), "category": row["category"]} for row in rows]
with open("ledger.json", "w") as f:
    json.dump(records, f)

with open("ledger.json") as f:
    print(f.read())
print(f"Total: {sum(r['amount'] for r in records)}")
`,
    },
    {
      kind: 'create',
      prompt: `Write \`totals_csv.py\`: read \`entries.csv\` (\`date,amount,category\`), total the amounts per category, and write \`totals.csv\` with columns \`category,total\`, one row per category in sorted order. Then read \`totals.csv\` back and print each of its lines (stripped of its line ending), so the output shows exactly what was written. A ledger with only a header line produces a \`totals.csv\` with only a header line.`,
      language: 'python',
      tests: [
        { description: 'three categories', files: { 'entries.csv': csvA }, expectedStdout: 'category,total\nfood,-40\nrent,-90\nsalary,320' },
        { description: 'one category, two rows', files: { 'entries.csv': csvC }, expectedStdout: 'category,total\ntips,25' },
        { description: 'headers only', files: { 'entries.csv': csvEmpty }, expectedStdout: 'category,total' },
      ],
      hint: 'Three parts: DictReader into a totals dict (`.get(category, 0) + int(amount)`), DictWriter with `fieldnames=["category", "total"]` looping over `sorted(totals)`, then `open("totals.csv", newline="")` and `print(line.rstrip())` for each line. The csv module ends lines with `\\r\\n`; `rstrip()` removes both characters.',
      solution: py`
import csv

with open("entries.csv", newline="") as f:
    rows = list(csv.DictReader(f))

totals = {}
for row in rows:
    totals[row["category"]] = totals.get(row["category"], 0) + int(row["amount"])

with open("totals.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["category", "total"])
    writer.writeheader()
    for category in sorted(totals):
        writer.writerow({"category": category, "total": totals[category]})

with open("totals.csv", newline="") as f:
    for line in f:
        print(line.rstrip())
`,
      projectNote: 'The ledger now round-trips through CSV: a spreadsheet export can feed the tools, and a report can be opened in a spreadsheet.',
    },
  ],
};

/* ---------------------------- 9-3 --------------------------------- */

const l93: Lesson = {
  id: 'py-9-3',
  title: 'Counting and grouping',
  objective: 'Count, group and accumulate ledger entries with Counter, groupby and accumulate instead of hand-written dict loops.',
  minutes: 24,
  lexicon: [
    { id: 'py.9.counter', term: 'Counter(iterable)', kind: 'builtin', meaning: 'A dict subclass from collections that counts how many times each item appears. Missing keys read as 0 instead of raising KeyError.', example: 'from collections import Counter\ncounts = Counter(c for d, a, c in entries)\ncounts["food"]   # 2' },
    { id: 'py.9.most-common', term: 'counter.most_common(n)', kind: 'builtin', meaning: 'The n (item, count) pairs with the highest counts, as a list, biggest first. Ties keep the order items were first seen, so sort yourself when ties matter for output.', example: 'Counter("aabbbc").most_common(1)   # [("b", 3)]' },
    { id: 'py.9.groupby', term: 'itertools.groupby(xs, key=...)', kind: 'builtin', meaning: 'Walk a sequence and yield (key, group) for each run of consecutive items with the same key. It only merges neighbours: sort by the same key first, or one category comes back several times.', example: 'rows.sort(key=lambda r: r[2])\nfor category, group in groupby(rows, key=lambda r: r[2]):\n    print(category, sum(a for d, a, c in group))', analogy: 'Dealing cards into piles by suit, but only ever comparing each card with the one before it. It breaks here: a person would notice that hearts came up earlier; groupby never looks back.' },
    { id: 'py.9.accumulate', term: 'itertools.accumulate(xs)', kind: 'builtin', meaning: 'Yield running totals: the first item, then first+second, and so on. For a list of amounts in date order it is the balance after each entry. Wrap in list() to keep them.', example: 'list(accumulate([100, -30, -50]))   # [100, 70, 20]' },
    { id: 'py.9.chain', term: 'itertools.chain(a, b)', kind: 'builtin', meaning: 'Walk one sequence and then another as if they were a single one, without building a combined list.', example: 'list(chain([1, 2], [3]))   # [1, 2, 3]' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The loops you keep writing are already written',
      body: `Counting things, grouping by a key and keeping a running total are the three loops every data program contains. Two standard modules supply them.

From \`collections\`: \`Counter\` counts items (\`counts["food"]\` is 2, and a missing key is 0), and \`most_common(n)\` lists the top n. \`defaultdict(int)\` from Module 8 is still the tool for *summing* by key.

From \`itertools\`: \`accumulate\` yields running totals, which for amounts in date order is the balance after each entry. \`chain\` walks several sequences as one. \`groupby\` yields \`(key, group)\` for each **run of consecutive items** with the same key. That word matters: \`groupby\` only merges neighbours, so you must **sort by the same key first**, or a category that appears in two places comes back twice. Each \`group\` is a one-shot iterator; consume it inside the loop.

The example applies all of them to CSV-shaped rows: \`(date, amount, category)\`.`,
      example: {
        language: 'python',
        source: `from collections import Counter, defaultdict
from itertools import accumulate, chain, groupby

rows = [("2026-01-03", -30, "food"), ("2026-01-10", 120, "salary"),
        ("2026-02-02", -10, "food"), ("2026-02-20", -90, "rent")]

counts = Counter(category for date, amount, category in rows)
print(counts["food"], counts["fuel"], counts.most_common(1))

totals = defaultdict(int)
for date, amount, category in rows:
    totals[category] += amount
print(dict(totals))

print(list(accumulate(amount for date, amount, category in rows)))

by_category = sorted(rows, key=lambda r: r[2])
for category, group in groupby(by_category, key=lambda r: r[2]):
    print(category, [amount for date, amount, category in group])

print(list(chain(["2025-12-31", 0, "opening"], rows[0])))`,
        labels: [
          { lines: [1, 2], label: 'Two standard modules; import only the names you use.' },
          { lines: [4, 5], label: 'Rows as a CSV reader would give them after converting amount: (date, amount, category).' },
          { lines: [7, 8], label: "Counter counts the categories. A missing key is 0, not an error. Output: 2 0 [('food', 2)]." },
          { lines: [10, 13], label: "defaultdict(int) sums per key (Module 8). Output: {'food': -40, 'salary': 120, 'rent': -90}." },
          { lines: [15, 15], label: 'Running balance after each entry. Output: [-30, 90, 80, -10].' },
          { lines: [17, 19], label: 'Sort by category first, then groupby merges each run. Output: food [-30, -10], rent [-90], salary [120]. Without the sort, food would appear twice.' },
          { lines: [21, 21], label: 'chain glues sequences end to end without copying. Output: a six-item list.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: {
        language: 'python',
        source: `from itertools import groupby

categories = ["food", "rent", "food", "food", "rent"]
for category, group in groupby(categories):
    print(category, len(list(group)))`,
      },
      choices: ['food 1\nrent 1\nfood 2\nrent 1', 'food 3\nrent 2', 'rent 2\nfood 3', 'food 1\nrent 1\nfood 1\nfood 1\nrent 1'],
      answer: 'food 1\nrent 1\nfood 2\nrent 1',
      explanation: '`groupby` starts a new group every time the key **changes**, so it reports four runs: food, rent, food food, rent. It never looks back to see that food already had a group. `sorted(categories)` first would give `food 3` then `rent 2`. The unsorted trap is silent: no error, just wrong totals.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it prints `[100, 70, 20, 40, 35]` and then `[(\'expense\', 3)]`.',
      language: 'python',
      template: `from collections import Counter
from itertools import accumulate

amounts = [100, -30, -50, 20, -5]
running = list({{acc}}(amounts))
print(running)
kinds = {{ctr}}("expense" if a < 0 else "income" for a in amounts)
print(kinds.{{mc}}(1))`,
      blanks: [
        { id: 'acc', answers: ['accumulate'], hint: 'the itertools function that yields running totals' },
        { id: 'ctr', answers: ['Counter'], hint: 'the collections class that counts items' },
        { id: 'mc', answers: ['most_common'], hint: 'the method that lists the top n counts' },
      ],
      explanation: '`accumulate` adds as it goes: 100, 70, 20, 40, 35. `Counter` takes any iterable, here a generator of labels, and `most_common(1)` returns a one-item list of (item, count).',
    },
    {
      kind: 'modify',
      prompt: 'This program should print one `<category>: <total>` line per category in alphabetical order, but with the fixture it prints `tips: 50`, `food: -50`, `salary: 300`, `fuel: -15` and, with other files, the same category more than once. Fix it without replacing `groupby`.',
      language: 'python',
      starter: py`
import csv
from itertools import groupby

with open("entries.csv", newline="") as f:
    rows = [(r["date"], int(r["amount"]), r["category"]) for r in csv.DictReader(f)]

for category, group in groupby(rows, key=lambda r: r[2]):
    print(f"{category}: {sum(amount for date, amount, category in group)}")
`,
      tests: [
        { description: 'categories out of order in the file', files: { 'entries.csv': csvB }, expectedStdout: 'food: -50\nfuel: -15\nsalary: 300\ntips: 50' },
        { description: 'a category that appears in two places', files: { 'entries.csv': csvA }, expectedStdout: 'food: -40\nrent: -90\nsalary: 320' },
        { description: 'headers only', files: { 'entries.csv': csvEmpty }, expectedStdout: '' },
      ],
      hint: '`groupby` only merges neighbours. Sort `rows` by the same key you group by, before the loop: `rows.sort(key=lambda r: r[2])`.',
      solution: py`
import csv
from itertools import groupby

with open("entries.csv", newline="") as f:
    rows = [(r["date"], int(r["amount"]), r["category"]) for r in csv.DictReader(f)]

rows.sort(key=lambda r: r[2])
for category, group in groupby(rows, key=lambda r: r[2]):
    print(f"{category}: {sum(amount for date, amount, category in group)}")
`,
    },
    {
      kind: 'create',
      prompt: `Write \`balance_history.py\`: read \`entries.csv\` and print, in file order, one line per row with \`<date> <balance after that entry>\` using \`accumulate\`. Then print \`Lowest: <smallest balance seen>\` and \`Most entries: <category> (<count>)\` for the category with the most rows, using \`Counter\`; when two categories tie, name the alphabetically first. With a header-only file print \`Lowest: none\` and \`Most entries: none\`.`,
      language: 'python',
      tests: [
        { description: 'five rows, food twice', files: { 'entries.csv': csvA }, expectedStdout: '2026-01-03 -30\n2026-01-10 90\n2026-01-15 0\n2026-02-02 -10\n2026-02-20 190\nLowest: -30\nMost entries: food (2)' },
        { description: 'lowest point is zero, not the first row', files: { 'entries.csv': csvB }, expectedStdout: '2026-03-01 50\n2026-01-15 25\n2026-02-10 0\n2026-01-20 300\n2026-03-05 285\nLowest: 0\nMost entries: food (2)' },
        { description: 'a tie broken alphabetically', files: { 'entries.csv': 'date,amount,category\n2026-04-01,-5,fuel\n2026-04-02,-6,food\n' }, expectedStdout: '2026-04-01 -5\n2026-04-02 -11\nLowest: -11\nMost entries: food (1)' },
        { description: 'headers only', files: { 'entries.csv': csvEmpty }, expectedStdout: 'Lowest: none\nMost entries: none' },
      ],
      hint: '`zip(rows, balances)` pairs each row with its running balance. For the tie rule, `min(counts, key=lambda c: (-counts[c], c))` picks the highest count and, among equals, the smallest name; `most_common` alone keeps file order.',
      solution: py`
import csv
from collections import Counter
from itertools import accumulate

with open("entries.csv", newline="") as f:
    rows = [(r["date"], int(r["amount"]), r["category"]) for r in csv.DictReader(f)]

balances = list(accumulate(amount for date, amount, category in rows))
for (date, amount, category), balance in zip(rows, balances):
    print(f"{date} {balance}")

if balances:
    print(f"Lowest: {min(balances)}")
else:
    print("Lowest: none")

counts = Counter(category for date, amount, category in rows)
if counts:
    best = min(counts, key=lambda c: (-counts[c], c))
    print(f"Most entries: {best} ({counts[best]})")
else:
    print("Most entries: none")
`,
      projectNote: 'A balance history over the CSV ledger: the running balance the Ledger class never stored, computed on demand from the rows.',
    },
  ],
};

/* ---------------------------- 9-4 --------------------------------- */

const l94: Lesson = {
  id: 'py-9-4',
  title: 'Asking the database',
  objective: 'Load ledger rows into SQLite with parameters and let SQL do the grouping and summing.',
  minutes: 28,
  lexicon: [
    { id: 'py.9.connect', term: 'sqlite3.connect(":memory:")', kind: 'builtin', meaning: 'Open a database and return a connection. ":memory:" makes a throwaway database that lives only while the program runs; a file name such as "ledger.db" makes one that persists on disk (created if missing).', example: 'conn = sqlite3.connect(":memory:")\nconn.execute("CREATE TABLE entries (date TEXT, amount INTEGER, category TEXT)")' },
    { id: 'py.9.placeholder', term: '? placeholder', kind: 'punctuation', meaning: 'A slot in a SQL string that the database fills from a tuple of values you pass alongside. The value is sent as data, never spliced into the text, so quotes or SQL inside it cannot change the query. Never build SQL with f-strings.', example: 'conn.execute("SELECT amount FROM entries WHERE category = ?", (name,))', analogy: 'A form with a labelled box: whatever is written in the box is the answer to that one question. It breaks here: on a paper form a long answer can spill into the next question; a ? placeholder never spills.' },
    { id: 'py.9.executemany', term: 'conn.executemany(sql, rows)', kind: 'builtin', meaning: 'Run one SQL statement once per tuple in rows, filling its ? placeholders from each tuple. The standard way to insert a list of records.', example: 'conn.executemany("INSERT INTO entries VALUES (?, ?, ?)", rows)' },
    { id: 'py.9.group-by', term: 'SELECT k, SUM(v) ... GROUP BY k ORDER BY k', kind: 'pattern', meaning: 'Ask the database to collapse rows that share k into one row holding k and the sum of v, and to return them in k order. The database does the loop you wrote with defaultdict.', example: 'SELECT category, SUM(amount) FROM entries GROUP BY category ORDER BY category' },
    { id: 'py.9.with-conn', term: 'with conn:', kind: 'pattern', meaning: 'Run the block as one transaction: commit the changes when it ends normally, roll them all back if an error escapes. Unlike with open(), it does not close the connection; call conn.close() when done.', example: 'with conn:\n    conn.executemany("INSERT INTO entries VALUES (?, ?, ?)", rows)' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Let the database do the grouping',
      body: `Everything so far loaded the whole ledger into Python lists. A **database** keeps the rows and answers questions about them in its own language, **SQL**. Python ships one: \`sqlite3\`, with the database in a single file or, for a throwaway, in memory.

The steps are always the same. \`connect\` gives a connection. \`CREATE TABLE\` names the columns and their types. \`executemany\` inserts a list of tuples, filling the \`?\` placeholders from each tuple. Then a \`SELECT\` with \`GROUP BY\` does the defaultdict loop for you, and \`ORDER BY\` sorts, so the output is deterministic. Iterating over the result of \`execute\` yields tuples; \`fetchone()\` gives the first.

The \`?\` is not a convenience. Values go to the database **as data**, so a category called \`kids' club\` or a malicious string cannot change the query. Never build SQL with an f-string.

\`with conn:\` commits the block as one transaction; it does not close, so \`conn.close()\` comes last.`,
      example: {
        language: 'python',
        source: `import csv
import sqlite3

with open("entries.csv", newline="") as f:
    rows = [(r["date"], int(r["amount"]), r["category"]) for r in csv.DictReader(f)]

conn = sqlite3.connect(":memory:")
with conn:
    conn.execute("CREATE TABLE entries (date TEXT, amount INTEGER, category TEXT)")
    conn.executemany("INSERT INTO entries VALUES (?, ?, ?)", rows)

query = "SELECT category, SUM(amount) FROM entries GROUP BY category ORDER BY category"
for category, total in conn.execute(query):
    print(f"{category}: {total}")

(count,) = conn.execute("SELECT COUNT(*) FROM entries WHERE amount < ?", (0,)).fetchone()
print(f"Expenses: {count}")
conn.close()`,
        labels: [
          { lines: [1, 5], label: 'Read the CSV as tuples, converting amount once. Tuples are what executemany wants.' },
          { lines: [7, 7], label: 'A database in memory: gone when the program ends. "ledger.db" instead would keep it on disk.' },
          { lines: [8, 10], label: 'One transaction: make the table, insert every row. Each ? is filled from the matching tuple position.' },
          { lines: [12, 14], label: 'SQL groups and sums; ORDER BY makes the order fixed. Each result row unpacks as a tuple. With the entries.csv from the earlier steps: food: -40, rent: -90, salary: 320.' },
          { lines: [16, 17], label: 'A single value still comes back as a one-item tuple; the (count,) pattern unpacks it. Note the one-item tuple (0,) for the parameter.' },
          { lines: [18, 18], label: 'with conn: does not close. Close explicitly when finished.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The table holds three rows: `(-30, "food")`, `(120, "salary")`, `(-90, "rent")`. What does this print?',
      code: {
        language: 'python',
        source: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE entries (amount INTEGER, category TEXT)")
conn.executemany("INSERT INTO entries VALUES (?, ?)", [(-30, "food"), (120, "salary"), (-90, "rent")])

wanted = "food' OR 'a'='a"
rows = conn.execute(f"SELECT amount FROM entries WHERE category = '{wanted}'").fetchall()
print(len(rows))
rows = conn.execute("SELECT amount FROM entries WHERE category = ?", (wanted,)).fetchall()
print(len(rows))`,
      },
      choices: ['3\n0', '1\n1', '0\n0', '3\n3'],
      answer: '3\n0',
      explanation: "The f-string splices the text into the SQL, which becomes `WHERE category = 'food' OR 'a'='a'`: true for every row, so all 3 come back. That is SQL injection, and with `DELETE` instead of `SELECT` it would be a disaster. The `?` version sends the whole string as a value to compare against; no category is literally named `food' OR 'a'='a`, so 0 rows. Parameters are the only safe way to put a value into a query.",
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it inserts the three rows and prints `food -40` then `salary 120`.',
      language: 'python',
      template: `import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE entries (date TEXT, amount INTEGER, category TEXT)")
rows = [("2026-01-03", -30, "food"), ("2026-01-10", 120, "salary"), ("2026-02-02", -10, "food")]
conn.{{many}}("INSERT INTO entries VALUES ({{ph}})", rows)
query = "SELECT category, {{agg}}(amount) FROM entries {{grp}} category ORDER BY category"
for category, total in conn.execute(query):
    print(category, total)
conn.close()`,
      blanks: [
        { id: 'many', answers: ['executemany'], hint: 'run the INSERT once per tuple' },
        { id: 'ph', answers: ['?, ?, ?', '?,?,?', '?, ?,?', '?,?, ?'], hint: 'one placeholder per column, separated by commas' },
        { id: 'agg', answers: ['SUM', 'sum'], hint: 'the SQL function that adds a column up' },
        { id: 'grp', answers: ['GROUP BY', 'group by'], hint: 'the two SQL words that collapse rows sharing a value' },
      ],
      explanation: 'Three columns, three `?`. `SUM(amount)` with `GROUP BY category` gives one row per category; `ORDER BY` fixes the order. SQL keywords are case-insensitive, but upper case is the convention that makes them stand out from names.',
    },
    {
      kind: 'modify',
      prompt: `\`python main.py <category>\` should print \`<category>: <total>\` and \`Median: <statistics.median of that category's amounts>\` (or \`Median: none\` if the category has no rows). It works for \`food\` but crashes with \`sqlite3.OperationalError: near "club": syntax error\` for the category \`kids' club\`. Fix the query so any category name works. Output must not change.`,
      language: 'python',
      starter: py`
import csv
import sqlite3
import statistics
import sys

with open("entries.csv", newline="") as f:
    rows = [(r["date"], int(r["amount"]), r["category"]) for r in csv.DictReader(f)]

conn = sqlite3.connect(":memory:")
with conn:
    conn.execute("CREATE TABLE entries (date TEXT, amount INTEGER, category TEXT)")
    conn.executemany("INSERT INTO entries VALUES (?, ?, ?)", rows)

wanted = sys.argv[1]
amounts = [amount for (amount,) in conn.execute(f"SELECT amount FROM entries WHERE category = '{wanted}'")]
conn.close()

print(f"{wanted}: {sum(amounts)}")
if amounts:
    print(f"Median: {statistics.median(amounts)}")
else:
    print("Median: none")
`,
      tests: [
        { description: 'food: three rows, odd count', argv: ['food'], files: { 'entries.csv': "date,amount,category\n2026-01-03,-30,food\n2026-01-10,120,salary\n2026-01-12,-15,kids' club\n2026-01-15,-90,rent\n2026-02-02,-10,food\n2026-02-05,-20,food\n" }, expectedStdout: 'food: -60\nMedian: -20' },
        { description: "a category with an apostrophe", argv: ["kids' club"], files: { 'entries.csv': "date,amount,category\n2026-01-03,-30,food\n2026-01-10,120,salary\n2026-01-12,-15,kids' club\n2026-01-15,-90,rent\n2026-02-02,-10,food\n2026-02-05,-20,food\n" }, expectedStdout: "kids' club: -15\nMedian: -15" },
        { description: 'a category with no rows', argv: ['fuel'], files: { 'entries.csv': csvA }, expectedStdout: 'fuel: 0\nMedian: none' },
      ],
      hint: 'The apostrophe in the name ends the SQL string early; that is the same hole the predict step showed. Replace the f-string with a `?` and pass `(wanted,)` as the second argument to `execute`.',
      solution: py`
import csv
import sqlite3
import statistics
import sys

with open("entries.csv", newline="") as f:
    rows = [(r["date"], int(r["amount"]), r["category"]) for r in csv.DictReader(f)]

conn = sqlite3.connect(":memory:")
with conn:
    conn.execute("CREATE TABLE entries (date TEXT, amount INTEGER, category TEXT)")
    conn.executemany("INSERT INTO entries VALUES (?, ?, ?)", rows)

wanted = sys.argv[1]
amounts = [amount for (amount,) in conn.execute("SELECT amount FROM entries WHERE category = ?", (wanted,))]
conn.close()

print(f"{wanted}: {sum(amounts)}")
if amounts:
    print(f"Median: {statistics.median(amounts)}")
else:
    print("Median: none")
`,
    },
    {
      kind: 'create',
      prompt: `Write \`ledger_stats.py\`, run as \`python main.py <YYYY-MM>\`. Load \`entries.csv\` into an in-memory SQLite table, then print:

- \`<category>: <total>\` per category, from \`SELECT category, SUM(amount) ... GROUP BY category ORDER BY category\`
- \`Mean: <statistics.mean of all amounts>\` and \`Median: <statistics.median>\`; print whole numbers without a decimal point (\`38\`, not \`38.0\`) and halves as Python does (\`12.5\`); with no rows print \`Mean: none\` and \`Median: none\`
- \`Entries in <YYYY-MM>: <count of rows whose date falls in that month>\`, parsing each date with \`datetime.date.fromisoformat\` and comparing \`f"{d.year}-{d.month:02d}"\` to the argument. Never use \`today()\`.`,
      language: 'python',
      tests: [
        { description: 'three categories, January', argv: ['2026-01'], files: { 'entries.csv': csvA }, expectedStdout: 'food: -40\nrent: -90\nsalary: 320\nMean: 38\nMedian: -10\nEntries in 2026-01: 3' },
        { description: 'the same file, a month with no entries', argv: ['2026-03'], files: { 'entries.csv': csvA }, expectedStdout: 'food: -40\nrent: -90\nsalary: 320\nMean: 38\nMedian: -10\nEntries in 2026-03: 0' },
        { description: 'two rows: mean and median are halves', argv: ['2026-05'], files: { 'entries.csv': csvC }, expectedStdout: 'tips: 25\nMean: 12.5\nMedian: 12.5\nEntries in 2026-05: 2' },
        { description: 'headers only', argv: ['2026-01'], files: { 'entries.csv': csvEmpty }, expectedStdout: 'Mean: none\nMedian: none\nEntries in 2026-01: 0' },
      ],
      hint: 'A helper `fmt(x)` returning `int(x) if x == int(x) else x` handles `38.0` versus `12.5`. Pull all amounts with `SELECT amount FROM entries` and unpack each one-item tuple. For the month count, loop over the CSV rows you already have; `date.fromisoformat("2026-01-03")` gives an object with `.year` and `.month`.',
      solution: py`
import csv
import sqlite3
import statistics
import sys
from datetime import date

def fmt(x):
    return int(x) if x == int(x) else x

with open("entries.csv", newline="") as f:
    rows = [(r["date"], int(r["amount"]), r["category"]) for r in csv.DictReader(f)]

conn = sqlite3.connect(":memory:")
with conn:
    conn.execute("CREATE TABLE entries (date TEXT, amount INTEGER, category TEXT)")
    conn.executemany("INSERT INTO entries VALUES (?, ?, ?)", rows)

for category, total in conn.execute("SELECT category, SUM(amount) FROM entries GROUP BY category ORDER BY category"):
    print(f"{category}: {total}")

amounts = [amount for (amount,) in conn.execute("SELECT amount FROM entries")]
conn.close()

if amounts:
    print(f"Mean: {fmt(statistics.mean(amounts))}")
    print(f"Median: {fmt(statistics.median(amounts))}")
else:
    print("Mean: none")
    print("Median: none")

month = sys.argv[1]
count = 0
for text, amount, category in rows:
    d = date.fromisoformat(text)
    if f"{d.year}-{d.month:02d}" == month:
        count += 1
print(f"Entries in {month}: {count}")
`,
      projectNote: 'The ledger has a query engine: SQL answers the grouping question, statistics answers the typical-entry question, and dates are real dates rather than text.',
    },
  ],
};

/* ---------------------------- 9-5 --------------------------------- */

const ledgerReport = py`
"""ledger_report.py: monthly totals, biggest expense category and median entry from entries.csv."""
import csv
import statistics
from collections import defaultdict
from datetime import date

CSV_PATH = "entries.csv"

def read_entries(path):
    with open(path, newline="") as f:
        return [(row["date"], int(row["amount"]), row["category"]) for row in csv.DictReader(f)]

def month_of(text):
    d = date.fromisoformat(text)
    return f"{d.year}-{d.month:02d}"

def month_totals(entries):
    totals = defaultdict(int)
    for text, amount, category in entries:
        totals[month_of(text)] += amount
    return dict(totals)

def category_totals(entries):
    totals = defaultdict(int)
    for text, amount, category in entries:
        totals[category] += amount
    return dict(totals)

def biggest_expense(totals):
    expenses = {c: t for c, t in totals.items() if t < 0}
    if not expenses:
        return None
    return min(sorted(expenses), key=lambda c: expenses[c])

def fmt(x):
    return int(x) if x == int(x) else x

def main():
    entries = read_entries(CSV_PATH)
    by_month = month_totals(entries)
    for month in sorted(by_month):
        print(f"{month}: {by_month[month]}")
    by_category = category_totals(entries)
    biggest = biggest_expense(by_category)
    if biggest is None:
        print("Biggest expense: none")
    else:
        print(f"Biggest expense: {biggest} {by_category[biggest]}")
    amounts = [amount for text, amount, category in entries]
    if amounts:
        print(f"Median entry: {fmt(statistics.median(amounts))}")
    else:
        print("Median entry: none")

if __name__ == "__main__":
    main()
`;

const l95: Lesson = {
  id: 'py-9-5',
  title: 'Project: Ledger report',
  objective: 'Build ledger_report.py: monthly totals, the biggest expense category and the median entry from a CSV ledger.',
  minutes: 30,
  lexicon: [
    { id: 'py.9.median', term: 'statistics.median(xs)', kind: 'builtin', meaning: 'The middle value of xs after sorting. With an even count it is the mean of the two middle values, so a list of ints can give a float such as 12.5 or 10.0. Raises StatisticsError on an empty list, so check first.', example: 'statistics.median([-30, -90, 200, -10])   # -20.0' },
    { id: 'py.9.mean', term: 'statistics.mean(xs)', kind: 'builtin', meaning: 'The arithmetic average: sum divided by count. Returns an int when the division is exact and a float otherwise. Also raises on an empty list.', example: 'statistics.mean([10, 15])   # 12.5' },
    { id: 'py.9.fromisoformat', term: 'date.fromisoformat("YYYY-MM-DD")', kind: 'builtin', meaning: 'Parse a fixed-format date string into a datetime.date with .year, .month and .day. Use it on dates read from files; never mix in today(), which changes the output every day and makes tests impossible.', example: 'from datetime import date\nd = date.fromisoformat("2026-01-15")\nd.month   # 1' },
    { id: 'py.9.month-key', term: 'f"{d.year}-{d.month:02d}"', kind: 'pattern', meaning: 'Turn a date into its month label with a two-digit month, so labels sort correctly as strings: 2026-01 before 2026-02 before 2026-12.', example: 'month_of = lambda d: f"{d.year}-{d.month:02d}"   # "2026-01"', analogy: 'Filing by year then month with leading zeros, as libraries do. It breaks here: a person filing "2026-2" after "2026-12" would spot the mistake; sorted() would not.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The report, function by function',
      body: `\`ledger_report.py\` reads \`entries.csv\` and answers three questions. The **contract**:

- One line per month, sorted: \`2026-01: -120\`
- \`Biggest expense: <category> <total>\` for the category with the most negative total; \`Biggest expense: none\` if no category total is negative
- \`Median entry: <statistics.median of all amounts>\`; whole numbers print without a decimal point (\`-20\`), halves as \`12.5\`; \`Median entry: none\` with no rows

A header-only file prints only the two \`none\` lines.

The design follows Module 8: pure functions that take entries and return data, one \`main\` that prints, and a guard. Month labels come from \`date.fromisoformat\` and \`f"{d.year}-{d.month:02d}"\`, so \`sorted\` on the labels is also date order. Nothing reads the clock.`,
      example: {
        language: 'python',
        source: ledgerReport.trimEnd(),
        labels: [
          { lines: [1, 7], label: 'Standard library only. The file name lives in one place.' },
          { lines: [9, 11], label: 'CSV in, tuples out, amount converted once. Everything below works on (date, amount, category).' },
          { lines: [13, 15], label: 'A date string becomes a month label with a two-digit month, so string order is date order.' },
          { lines: [17, 21], label: 'Sum per month with defaultdict(int); dict() for a plain result.' },
          { lines: [23, 27], label: 'The same shape per category.' },
          { lines: [29, 33], label: 'Keep negative totals; None if there are none; else the most negative. sorted() first makes a tie go to the alphabetically first name.' },
          { lines: [35, 36], label: 'Print -20.0 as -20 but leave 12.5 alone.' },
          { lines: [38, 53], label: 'The only function that prints: months in sorted order, then the biggest expense or none, then the median or none.' },
          { lines: [55, 56], label: 'The guard, so tests can import the functions.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: '`entries.csv` holds the header and these rows: `2026-02-01,40,tips`, `2026-01-15,10,tips`, `2026-01-20,25,gifts`, `2026-02-03,5,gifts`. What does `ledger_report.py` print?',
      code: {
        language: 'python',
        source: `def biggest_expense(totals):
    expenses = {c: t for c, t in totals.items() if t < 0}
    if not expenses:
        return None
    return min(sorted(expenses), key=lambda c: expenses[c])

def fmt(x):
    return int(x) if x == int(x) else x

# main(): months sorted, then biggest expense, then
#     print(f"Median entry: {fmt(statistics.median(amounts))}")`,
      },
      choices: [
        '2026-01: 35\n2026-02: 45\nBiggest expense: none\nMedian entry: 17.5',
        '2026-02: 45\n2026-01: 35\nBiggest expense: none\nMedian entry: 17.5',
        '2026-01: 35\n2026-02: 45\nBiggest expense: gifts 30\nMedian entry: 17.5',
        '2026-01: 35\n2026-02: 45\nBiggest expense: none\nMedian entry: 20',
      ],
      answer: '2026-01: 35\n2026-02: 45\nBiggest expense: none\nMedian entry: 17.5',
      explanation: 'Months are printed from `sorted`, not file order, so January comes first (10 + 25 = 35, then 40 + 5 = 45). Every total is positive, so the expenses dict is empty and the function returns None: `none`. The median of [5, 10, 25, 40] is the mean of 10 and 25, 17.5, which `fmt` leaves as a float because it is not whole.',
    },
    {
      kind: 'create',
      prompt: `Write \`ledger_report.py\` to the contract.

- Read \`entries.csv\` (\`date,amount,category\`) with \`csv.DictReader\`; convert amounts with \`int\`.
- Per-month totals, one line each in sorted order: \`<YYYY-MM>: <total>\`, with the month from \`date.fromisoformat\`.
- \`Biggest expense: <category> <total>\` for the most negative category total (ties: alphabetically first), or \`Biggest expense: none\`.
- \`Median entry: <statistics.median>\`, printing whole numbers as ints and halves as \`12.5\`, or \`Median entry: none\` when there are no rows.
- Pure functions plus a \`main()\` under \`if __name__ == "__main__":\`.`,
      language: 'python',
      tests: [
        { description: 'two months, rent is the biggest expense, even count gives a whole median', files: { 'entries.csv': 'date,amount,category\n2026-01-03,-30,food\n2026-01-15,-90,rent\n2026-02-02,-10,food\n2026-02-20,200,salary\n' }, expectedStdout: '2026-01: -120\n2026-02: 190\nBiggest expense: rent -90\nMedian entry: -20' },
        { description: 'months out of order in the file, food split across two months', files: { 'entries.csv': csvB }, expectedStdout: '2026-01: 275\n2026-02: -25\n2026-03: 35\nBiggest expense: food -50\nMedian entry: -15' },
        { description: 'a year boundary sorts correctly', files: { 'entries.csv': 'date,amount,category\n2025-12-28,-40,gifts\n2026-01-02,100,salary\n2025-12-30,-60,gifts\n' }, expectedStdout: '2025-12: -100\n2026-01: 100\nBiggest expense: gifts -100\nMedian entry: -40' },
        { description: 'no expenses, median is a half', files: { 'entries.csv': csvC }, expectedStdout: '2026-05: 25\nBiggest expense: none\nMedian entry: 12.5' },
        { description: 'headers only', files: { 'entries.csv': csvEmpty }, expectedStdout: 'Biggest expense: none\nMedian entry: none' },
      ],
      hint: 'Order of work: `read_entries`, then `month_totals` and print it (test 1 should pass its first two lines), then `category_totals` and `biggest_expense`, then the median with a `fmt` helper. Check the header-only fixture last: both `biggest_expense` and `median` must cope with nothing.',
      solution: ledgerReport,
      projectNote: 'Module 9 complete: a report tool that turns a CSV ledger into monthly totals, the biggest expense category and the typical entry, with every number computed from the file and nothing from the clock.',
    },
  ],
};

export const m9: Module = {
  id: 'py-m9',
  title: 'Data',
  goal: 'Comprehensions, csv, sqlite3, statistics; turning ledger data into answers.',
  projectMilestone: 'ledger_report.py: monthly totals, biggest expense category, median entry from a CSV ledger.',
  status: 'available',
  lessons: [l91, l92, l93, l94, l95],
};
