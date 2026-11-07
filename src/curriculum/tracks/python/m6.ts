import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 6: Files and errors                                         */
/* ------------------------------------------------------------------ */

/** Python source written verbatim: backslashes stay (so `"\n"` inside Python strings survives), leading newline dropped. */
const py = (s: TemplateStringsArray) => s.raw.join('').replace(/^\n/, '');

/* ------------------------------------------------------------------ */
/* 6-1 Writing files                                                  */
/* ------------------------------------------------------------------ */

const l61: Lesson = {
  id: 'py-6-1',
  title: 'Writing files',
  objective: 'Create a text file, write lines to it, and append to it safely with with.',
  minutes: 18,
  lexicon: [
    { id: 'py.6.open-w', term: 'open(path, "w")', kind: 'builtin', meaning: 'Open a file for writing and give back a file object. Creates the file if it is missing and erases its contents if it is not.', example: 'f = open("notes.txt", "w")', analogy: 'Opening a notebook at a fresh page after tearing the old pages out. It breaks here: mode "w" tears the pages out the moment you open, even if you then write nothing.' },
    { id: 'py.6.with', term: 'with open(...) as f:', kind: 'pattern', meaning: 'Run the indented block with the file open under the name f, then close the file automatically, even if an error stopped the block early.', example: 'with open("notes.txt", "w") as f:\n    f.write("rent paid\\n")', analogy: 'A library loan that returns itself when you leave the building, whatever happened inside. It breaks here: a borrower can forget to return a book; with cannot forget to close.' },
    { id: 'py.6.write', term: 'f.write(text)', kind: 'builtin', meaning: 'Put a string into the open file exactly as given. Unlike print it adds no newline, and it accepts only strings, so numbers must be formatted first.', example: 'f.write(f"{balance}\\n")' },
    { id: 'py.6.open-a', term: 'open(path, "a")', kind: 'builtin', meaning: 'Open for appending: new text goes after whatever the file already holds. Creates the file if it is missing, never erases.', example: 'with open("log.txt", "a") as f:\n    f.write("one more\\n")' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Text that outlives the program',
      body: `Everything your programs have made so far vanished the moment they ended. A **file** survives: text on disk that the next run, or another program, can read.

\`open(path, "w")\` opens a file for **writing** and gives back a file object. Mode \`"w"\` creates the file if needed and **erases** whatever it held. \`f.write(text)\` puts text into it; unlike \`print\` it adds no newline, so you write the \`"\\n"\` yourself. Mode \`"a"\` **appends** instead of erasing.

Always open with \`with ... as f:\`. When the indented block ends, Python closes the file, even if an error happened inside the block. A file that is never closed may be incomplete on disk.

To check what landed there, peek with \`open(path)\` (no mode means reading) and \`f.read()\`, which gives the whole text as one string. Reading properly is the next lesson.`,
      example: {
        language: 'python',
        source: py`
with open("notes.txt", "w") as f:
    f.write("rent paid\n")
    f.write("coffee\n")
with open("notes.txt", "a") as f:
    f.write("bus ticket\n")
with open("notes.txt") as f:
    print(f.read())`,
        labels: [
          { lines: [1, 3], label: 'Create (or erase) the file and write two lines. Each line needs its own "\\n".' },
          { lines: [4, 5], label: 'Reopen in append mode: the earlier lines stay, the new one goes after them.' },
          { lines: [6, 7], label: 'Peek: open for reading and show the whole text. Three lines come out.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'No file exists before this runs. What is printed?',
      code: {
        language: 'python',
        source: py`
with open("log.txt", "w") as f:
    f.write("a")
    f.write("b\n")
with open("log.txt", "w") as f:
    f.write("c\n")
with open("log.txt") as f:
    print(f.read())`,
      },
      choices: ['c', 'ab\nc', 'abc', 'a\nb\nc'],
      answer: 'c',
      explanation: 'The first block writes `ab` on one line (no newline between the two writes). The second `open(..., "w")` erases the file before writing `c`. Only `"a"` mode would have kept `ab`.',
    },
    {
      kind: 'parsons',
      prompt: 'Write every item of the list to `shopping.txt`, one per line. Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['items = ["milk", "bread"]', 'with open("shopping.txt", "w") as f:', '    for item in items:', '        f.write(item + "\\n")'],
      distractors: ['        f.write(item)', '        f.write(item, "\\n")', 'open("shopping.txt", "w") as f:'],
      explanation: '`write` adds no newline, so it must be part of the string; `write` takes exactly one string, not a list of pieces like `print`; and `as f` belongs to a `with`.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so that `report.txt` ends up holding the line `Balance: 120` followed by a line break.',
      language: 'python',
      template: 'balance = 120\nwith open("report.txt", {{mode}}) as {{name}}:\n    f.write(f"Balance: {balance}{{nl}}")',
      blanks: [
        { id: 'mode', answers: ['"w"', "'w'"], hint: 'the mode that creates or replaces the file' },
        { id: 'name', answers: ['f'], hint: 'the name the next line uses for the file' },
        { id: 'nl', answers: ['\\n'], hint: 'the two characters that end a line inside a string' },
      ],
      explanation: 'The name after `as` is yours to choose, but the body must use the same name. `write` does not end the line for you.',
    },
    {
      kind: 'modify',
      prompt: 'This program means to write all three categories to `categories.txt`, but when it reads the file back only the last one is there. Fix it so the file holds all three lines, in order. Expected output: `rent`, `food`, `fuel` on three lines.',
      language: 'python',
      starter: py`
items = ["rent", "food", "fuel"]
for item in items:
    with open("categories.txt", "w") as f:
        f.write(item + "\n")
with open("categories.txt") as f:
    print(f.read())
`,
      tests: [{ description: 'all three lines survive', expectedStdout: 'rent\nfood\nfuel' }],
      hint: 'Every `open(..., "w")` erases the file. Either open once, outside the loop, or append with `"a"`.',
      solution: py`
items = ["rent", "food", "fuel"]
with open("categories.txt", "w") as f:
    for item in items:
        f.write(item + "\n")
with open("categories.txt") as f:
    print(f.read())
`,
    },
    {
      kind: 'create',
      prompt: 'Read lines from input until the line `done`. First create `notes.txt` empty (mode `"w"`, write nothing) so it exists even if no line is typed. Then **append** each line to the file as it arrives, with its own line break. After `done`, print `Lines: <k>` and then the file\'s contents.',
      language: 'python',
      tests: [
        { description: 'two lines', stdin: 'rent paid\ncoffee\ndone', expectedStdout: 'Lines: 2\nrent paid\ncoffee' },
        { description: 'one line', stdin: 'bus\ndone', expectedStdout: 'Lines: 1\nbus' },
        { description: 'no lines at all', stdin: 'done', expectedStdout: 'Lines: 0' },
      ],
      hint: 'Open with "w" once before the loop, then with "a" inside it. Read the input, compare with "done", and keep a count.',
      solution: py`
with open("notes.txt", "w") as f:
    pass
count = 0
line = input()
while line != "done":
    with open("notes.txt", "a") as f:
        f.write(line + "\n")
    count = count + 1
    line = input()
print(f"Lines: {count}")
with open("notes.txt") as f:
    print(f.read())
`,
      projectNote: 'The ledger will soon write its entries to disk. For now you can create a file, keep it growing, and prove what is in it.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 6-2 Reading files                                                  */
/* ------------------------------------------------------------------ */

const l62: Lesson = {
  id: 'py-6-2',
  title: 'Reading files',
  objective: 'Read a text file line by line and turn its lines back into numbers.',
  minutes: 16,
  lexicon: [
    { id: 'py.6.open-r', term: 'open(path)', kind: 'builtin', meaning: 'Open an existing file for reading (mode "r" is the default). Reading never creates a file: if there is none, Python raises FileNotFoundError.', example: 'with open("amounts.txt") as f:\n    text = f.read()' },
    { id: 'py.6.for-line', term: 'for line in f:', kind: 'pattern', meaning: 'Loop over an open file one line at a time. Each line still ends with its "\\n".', example: 'for line in f:\n    print(line.strip())', analogy: 'Reading a letter line by line. It breaks here: the file hands you the line break as part of each line, which a human reader never notices.' },
    { id: 'py.6.read', term: 'f.read()', kind: 'builtin', meaning: 'The whole file as one string, line breaks included.', example: 'text = f.read()' },
    { id: 'py.6.splitlines', term: 'text.splitlines()', kind: 'builtin', meaning: 'Split a string into a list of its lines, with the line breaks removed.', example: 'lines = f.read().splitlines()' },
    { id: 'py.6.strip', term: 's.strip()', kind: 'builtin', meaning: 'A copy of the string without spaces, tabs and line breaks at either end. Use it before int() on a line read from a file.', example: 'amount = int(line.strip())' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Lines come with their line breaks',
      body: `\`open(path)\` with no mode opens an existing file for **reading**. It never creates one: if the file is missing, Python stops with \`FileNotFoundError\`.

A file object can be looped over directly: \`for line in f:\` gives one line per turn. The trap is that each line still ends with its \`"\\n"\`. \`print(line)\` then adds a second line break, and \`int(line)\` happens to tolerate the whitespace, but \`line == "food"\` is False because the line is really \`"food\\n"\`. \`line.strip()\` removes the break (and any stray spaces).

Two other ways to read: \`f.read()\` gives the whole file as one string, and \`f.read().splitlines()\` gives a list of lines already stripped of their breaks. Pick the loop for big files and \`splitlines()\` when you want a list.

Below, \`amounts.txt\` holds \`10\`, \`-3\` and \`5\` on three lines.`,
      example: {
        language: 'python',
        source: py`
total = 0
count = 0
with open("amounts.txt") as f:
    for line in f:
        amount = int(line.strip())
        total = total + amount
        count = count + 1
print(f"{count} amounts, total {total}")`,
        labels: [
          { lines: [1, 2], label: 'Accumulators, as in any counting loop.' },
          { lines: [3, 3], label: 'Open for reading; no mode needed.' },
          { lines: [4, 5], label: 'One line per turn; strip the line break, then convert.' },
          { lines: [6, 7], label: 'Update the totals.' },
          { lines: [8, 8], label: 'Back at the margin the file is closed; report.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The working directory is empty: there is no `missing.txt`. What happens?',
      code: {
        language: 'python',
        source: py`
print("start")
with open("missing.txt") as f:
    text = f.read()
print("end")`,
      },
      choices: ['start\nthen a FileNotFoundError traceback', 'start\nend', 'start\n\nend', 'end'],
      answer: 'start\nthen a FileNotFoundError traceback',
      explanation: 'Reading never creates a file. `open` itself raises `FileNotFoundError`, so the block is never entered and `end` is never printed. `start` was already printed, so it stays. Lesson 6-4 shows how to catch this.',
    },
    {
      kind: 'parsons',
      prompt: 'Count the lines in `notes.txt` and print `Lines: <count>`. Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['count = 0', 'with open("notes.txt") as f:', '    for line in f:', '        count = count + 1', 'print(f"Lines: {count}")'],
      distractors: ['with open("notes.txt", "w") as f:', '    for line in f.read():'],
      explanation: 'Mode `"w"` would erase the file you are trying to count. Looping over `f.read()` visits one *character* per turn, not one line; loop over `f` itself.',
    },
    {
      kind: 'modify',
      prompt: 'The program prints a blank line after every category. Change it so each category appears once, on its own line, prefixed with `- `. For the file `food`, `rent`, `fuel` the output is `- food`, `- rent`, `- fuel`.',
      language: 'python',
      starter: py`
with open("categories.txt") as f:
    for line in f:
        print(line)
`,
      tests: [
        { description: 'three categories', files: { 'categories.txt': 'food\nrent\nfuel\n' }, expectedStdout: '- food\n- rent\n- fuel' },
        { description: 'one category, no final line break', files: { 'categories.txt': 'tips' }, expectedStdout: '- tips' },
      ],
      hint: 'Each `line` still ends with its line break; `print` adds another. Strip it, then build the string with `- `.',
      solution: py`
with open("categories.txt") as f:
    for line in f:
        print("- " + line.strip())
`,
    },
    {
      kind: 'create',
      prompt: 'The file `amounts.txt` holds one whole number per line (it may be empty). Print `Total: <sum>`, `Count: <how many lines>` and `Expenses: <how many are negative>`.',
      language: 'python',
      tests: [
        { description: 'mixed amounts', files: { 'amounts.txt': '10\n-3\n5\n-20\n' }, expectedStdout: 'Total: -8\nCount: 4\nExpenses: 2' },
        { description: 'no final line break', files: { 'amounts.txt': '7\n-7' }, expectedStdout: 'Total: 0\nCount: 2\nExpenses: 1' },
        { description: 'empty file', files: { 'amounts.txt': '' }, expectedStdout: 'Total: 0\nCount: 0\nExpenses: 0' },
      ],
      hint: 'Loop over the file, strip and convert each line, and keep three counters.',
      solution: py`
total = 0
count = 0
expenses = 0
with open("amounts.txt") as f:
    for line in f:
        amount = int(line.strip())
        total = total + amount
        count = count + 1
        if amount < 0:
            expenses = expenses + 1
print(f"Total: {total}")
print(f"Count: {count}")
print(f"Expenses: {expenses}")
`,
      projectNote: 'The ledger can now read numbers back from disk. Next: a format that also keeps the categories.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 6-3 JSON                                                           */
/* ------------------------------------------------------------------ */

const l63: Lesson = {
  id: 'py-6-3',
  title: 'Saving structure with JSON',
  objective: 'Store a list of records in a file and get the same list back.',
  minutes: 20,
  lexicon: [
    { id: 'py.6.import', term: 'import json', kind: 'keyword', meaning: 'Make a module from the standard library available, so its functions can be called as json.something. Goes at the top of the file. Module 7 covers imports in full.', example: 'import json\nprint(json.dumps([1, 2]))' },
    { id: 'py.6.dumps', term: 'json.dumps(value)', kind: 'builtin', meaning: 'Turn a list, dict, str, int, float, bool or None into a JSON string. Dicts need string keys.', example: 'json.dumps({"amount": 5})   # \'{"amount": 5}\'' },
    { id: 'py.6.loads', term: 'json.loads(text)', kind: 'builtin', meaning: 'Parse a JSON string back into Python values. The s in dumps/loads means string.', example: 'json.loads(\'[1, 2]\')   # [1, 2]', analogy: 'Translating into a shared language and back. It breaks here: the round trip is not perfect; a tuple goes out as a list and comes back as a list.' },
    { id: 'py.6.dump-load', term: 'json.dump(value, f) / json.load(f)', kind: 'builtin', meaning: 'The same conversions, but straight into or out of an open file. Value first, then the file.', example: 'with open("ledger.json", "w") as f:\n    json.dump(entries, f)' },
    { id: 'py.6.record', term: 'record (one dict per item)', kind: 'concept', meaning: 'A dict with named fields for each item, kept in a list. It survives JSON unchanged and reads better than a tuple of positions.', example: '{"amount": -20, "category": "food"}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A text format for lists and dicts',
      body: `A file holds text, and a list of dicts is not text. **JSON** is a text format that looks almost like Python's own notation for lists, dicts, strings, numbers, \`true\`/\`false\` and \`null\`, and every language can read it.

Python ships the tools in the \`json\` **module**. One line at the top, \`import json\`, makes them available with a \`json.\` prefix. (Modules get their own lesson in Module 7; for now, this line is all you need.)

\`json.dumps(value)\` gives the JSON **string**; \`json.loads(text)\` reads one back. \`json.dump(value, f)\` and \`json.load(f)\` do the same straight to and from an open file. A round trip returns an equal value, with one catch: JSON has no tuples, so they come back as lists. That is why each ledger entry becomes a **record**: a dict with named fields.`,
      example: {
        language: 'python',
        source: py`
import json

entries = [{"amount": -20, "category": "food"}, {"amount": 50, "category": "salary"}]
with open("ledger.json", "w") as f:
    json.dump(entries, f)
with open("ledger.json") as f:
    loaded = json.load(f)
print(loaded[1]["category"])
print(loaded == entries)`,
        labels: [
          { lines: [1, 1], label: 'Bring in the json module, once, at the top.' },
          { lines: [3, 3], label: 'Records: one dict per entry, in a list.' },
          { lines: [4, 5], label: 'Save: open for writing, dump the value into the file.' },
          { lines: [6, 7], label: 'Load: open for reading, get the value back.' },
          { lines: [8, 9], label: 'The round trip gives real dicts again: salary, then True.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: {
        language: 'python',
        source: py`
import json

pair = (10, "food")
text = json.dumps(pair)
print(text)
back = json.loads(text)
print(back == pair)`,
      },
      choices: ['[10, "food"]\nFalse', '(10, "food")\nTrue', '[10, "food"]\nTrue', '(10, \'food\')\nTrue'],
      answer: '[10, "food"]\nFalse',
      explanation: 'JSON has no tuples and always uses double quotes, so the tuple is written as `[10, "food"]`. `loads` gives back a list, and a list is never equal to a tuple. Store records as dicts and the round trip is exact.',
    },
    {
      kind: 'parsons',
      prompt: 'Save the records to `ledger.json`. Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['import json', 'records = [{"amount": 5, "category": "tips"}]', 'with open("ledger.json", "w") as f:', '    json.dump(records, f)'],
      distractors: ['    f.write(records)', '    json.dumps(records, f)', '    json.dump(f, records)'],
      explanation: '`write` accepts only strings; `dumps` makes a string and knows nothing about files; `dump` takes the value first, then the file.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it prints how many records `ledger.json` holds.',
      language: 'python',
      template: '{{imp}} json\n\nwith open("ledger.json") as f:\n    entries = json.{{ld}}(f)\nprint(f"Entries: {len(entries)}")',
      blanks: [
        { id: 'imp', answers: ['import'], hint: 'the line that makes json available' },
        { id: 'ld', answers: ['load'], hint: 'from an open file, not from a string' },
      ],
      explanation: '`load` reads from a file object; `loads` would need the text itself.',
    },
    {
      kind: 'modify',
      prompt: 'This program saves the entries as plain text with `str(...)` and reads them back with `read()`, so what comes back is one long string and the loop crashes. Switch the save and the load to JSON so the round trip gives real records. Expected output: `Total: 30`.',
      language: 'python',
      starter: py`
entries = [{"amount": -20, "category": "food"}, {"amount": 50, "category": "salary"}]
with open("ledger.json", "w") as f:
    f.write(str(entries))
with open("ledger.json") as f:
    loaded = f.read()
total = 0
for entry in loaded:
    total = total + entry["amount"]
print(f"Total: {total}")
`,
      tests: [{ description: 'round trip gives dicts', expectedStdout: 'Total: 30' }],
      hint: 'Add `import json` at the top, then `json.dump(entries, f)` to save and `json.load(f)` to load.',
      solution: py`
import json

entries = [{"amount": -20, "category": "food"}, {"amount": 50, "category": "salary"}]
with open("ledger.json", "w") as f:
    json.dump(entries, f)
with open("ledger.json") as f:
    loaded = json.load(f)
total = 0
for entry in loaded:
    total = total + entry["amount"]
print(f"Total: {total}")
`,
    },
    {
      kind: 'create',
      prompt: 'The file `ledger.json` holds a JSON list of records like `{"amount": -20, "category": "food"}` (possibly an empty list). Ask `Amount?` and `Category?`, load the list, add the new record, and save the list back to `ledger.json`. Then load the file **again** and, from that second load, print `Entries: <k>` and `Total: <sum of amounts>`.',
      language: 'python',
      tests: [
        { description: 'two saved records plus one new', files: { 'ledger.json': '[{"amount": -20, "category": "food"}, {"amount": 50, "category": "salary"}]' }, stdin: '-10\nfood', expectedStdout: 'Amount?\nCategory?\nEntries: 3\nTotal: 20' },
        { description: 'empty list plus one new', files: { 'ledger.json': '[]' }, stdin: '15\ntips', expectedStdout: 'Amount?\nCategory?\nEntries: 1\nTotal: 15' },
        { description: 'one saved record plus a zero', files: { 'ledger.json': '[{"amount": 7, "category": "tips"}]' }, stdin: '0\nfood', expectedStdout: 'Amount?\nCategory?\nEntries: 2\nTotal: 7' },
      ],
      hint: 'Load, append a dict, dump; then open and load once more before counting and summing. The second load is what proves the save worked.',
      solution: py`
import json

print("Amount?")
amount = int(input())
print("Category?")
category = input()
with open("ledger.json") as f:
    entries = json.load(f)
entries.append({"amount": amount, "category": category})
with open("ledger.json", "w") as f:
    json.dump(entries, f)
with open("ledger.json") as f:
    saved = json.load(f)
total = 0
for entry in saved:
    total = total + entry["amount"]
print(f"Entries: {len(saved)}")
print(f"Total: {total}")
`,
      projectNote: 'This is the heart of Ledger v0.6: load the records, add to them, save them back. What is still missing is a plan for the file not being there, and for bad input.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 6-4 Errors                                                         */
/* ------------------------------------------------------------------ */

const l64: Lesson = {
  id: 'py-6-4',
  title: 'When things go wrong',
  objective: 'Read a traceback, catch the specific exception you expect, and retry bad input.',
  minutes: 22,
  lexicon: [
    { id: 'py.6.traceback', term: 'traceback', kind: 'concept', meaning: 'The report Python prints when an error stops the program. Read it bottom-up: the last line names the exception and says why; the lines above say where in your code.', example: 'Traceback (most recent call last):\n  File "main.py", line 2, in <module>\nValueError: invalid literal for int() with base 10: \'abc\'' },
    { id: 'py.6.try', term: 'try: / except ValueError:', kind: 'keyword', meaning: 'Attempt the try block. If the named exception is raised inside it, skip the rest of that block and run the except block instead; then carry on after both.', example: 'try:\n    amount = int(text)\nexcept ValueError:\n    print("Not a number, try again")', analogy: '"Try the door; if it is locked, use the window." It breaks here: Python only takes the window for the kind of trouble you named; any other error still stops the program.' },
    { id: 'py.6.specific-except', term: 'name the exception', kind: 'concept', meaning: 'Catch the exception you expect (ValueError, FileNotFoundError), never a bare except:. A bare except also swallows your own typos and Ctrl-C, hiding bugs.', example: 'except FileNotFoundError:\n    return []' },
    { id: 'py.6.retry', term: 'retry loop', kind: 'pattern', meaning: 'while True: ask, try to convert, return on success. The except branch prints a message and the loop asks again. The return is the only way out.', example: 'while True:\n    print(prompt)\n    try:\n        return int(input())\n    except ValueError:\n        print("Not a number, try again")' },
    { id: 'py.6.raise', term: 'raise ValueError("...")', kind: 'keyword', meaning: 'Signal an error yourself. The program stops with that message unless a try/except further up catches it.', example: 'if amount == 0:\n    raise ValueError("amount must not be zero")' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Tracebacks, try and except',
      body: `When something goes wrong, Python stops and prints a **traceback**. Read it from the bottom: the last line names the exception and says why (\`ValueError: invalid literal for int()...\`), and the line above points at the line of your code that failed.

Some failures are expected. A person types \`abc\` where a number should go; a save file is missing on the first run. For those you write \`try:\` over the risky lines and \`except ValueError:\` (or \`except FileNotFoundError:\`) with what to do instead. If the named exception happens inside the try block, the rest of that block is skipped and the except block runs; then the program carries on. **Name the exception.** A bare \`except:\` catches everything, including your own typos, and hides bugs.

The retry pattern below is the shape the ledger needs. You can also signal problems yourself with \`raise ValueError("message")\`; that is for later modules.`,
      example: {
        language: 'python',
        source: py`
def read_int(prompt):
    while True:
        print(prompt)
        text = input()
        try:
            return int(text)
        except ValueError:
            print("Not a number, try again")


balance = read_int("Balance?")
print(f"Balance: {balance}")`,
        labels: [
          { lines: [1, 2], label: 'A loop with no exit condition: only return leaves it.' },
          { lines: [3, 4], label: 'Prompt on its own line, then read.' },
          { lines: [5, 6], label: 'The risky line. If int succeeds, return ends the loop and the function.' },
          { lines: [7, 8], label: 'Only for a ValueError: explain, and the loop asks again.' },
          { lines: [11, 12], label: 'The caller never sees bad input.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: {
        language: 'python',
        source: py`
try:
    amount = int("12x")
    print("converted")
except ValueError:
    print("not a number")
print("done")`,
      },
      choices: ['not a number\ndone', 'converted\ndone', 'not a number', 'a ValueError traceback'],
      answer: 'not a number\ndone',
      explanation: '`int("12x")` raises `ValueError` inside the try block, so `print("converted")` is skipped and the except block runs. The error is handled, so execution continues with `done`.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `read_int`: ask with the prompt, and keep asking until the answer is a whole number. Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['def read_int(prompt):', '    while True:', '        print(prompt)', '        text = input()', '        try:', '            return int(text)', '        except ValueError:', '            print("Not a number, try again")'],
      distractors: ['        except:', '        try int(text):'],
      explanation: 'A bare `except:` would also hide a typo in your own code; name `ValueError`. `try` takes no expression: the risky line goes inside its block.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete `load_lines` so it returns the lines of the file, or an empty list when the file does not exist.',
      language: 'python',
      template: 'def load_lines(path):\n    {{t}}:\n        with open(path) as f:\n            return f.read().splitlines()\n    {{e}} {{name}}:\n        return []',
      blanks: [
        { id: 't', answers: ['try'] },
        { id: 'e', answers: ['except'] },
        { id: 'name', answers: ['FileNotFoundError'], hint: 'the exception a missing file raises; spell it exactly' },
      ],
      explanation: 'The `with` goes inside the try, because `open` is the line that can fail.',
    },
    {
      kind: 'modify',
      prompt: 'This program adds up amounts until `quit`, but a non-number crashes it. Change it so a bad answer prints `Not a number, try again` and the program simply asks again. Good amounts are still added.',
      language: 'python',
      starter: py`
total = 0
print("Amount (or quit)?")
text = input()
while text != "quit":
    total = total + int(text)
    print("Amount (or quit)?")
    text = input()
print(f"Total: {total}")
`,
      tests: [
        { description: 'one bad amount in the middle', stdin: '10\nabc\n5\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nNot a number, try again\nAmount (or quit)?\nAmount (or quit)?\nTotal: 15' },
        { description: 'only bad amounts', stdin: '1.5\nquit', expectedStdout: 'Amount (or quit)?\nNot a number, try again\nAmount (or quit)?\nTotal: 0' },
        { description: 'all good', stdin: '3\n4\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nTotal: 7' },
      ],
      hint: 'Wrap only the line with `int(text)` in try/except ValueError. The prompt and the next input stay after it, so the loop continues either way.',
      solution: py`
total = 0
print("Amount (or quit)?")
text = input()
while text != "quit":
    try:
        total = total + int(text)
    except ValueError:
        print("Not a number, try again")
    print("Amount (or quit)?")
    text = input()
print(f"Total: {total}")
`,
    },
    {
      kind: 'create',
      prompt: 'If a file `start.txt` exists, it holds the starting balance as one whole number: load it and print `Starting at <n>`. If it does not exist, start at 0 and print `No saved balance`. Then ask `Amount (or quit)?` repeatedly until `quit`, adding each amount; an answer that is not a whole number prints `Not a number, try again` and is asked again. Finally print `Balance: <n>`.',
      language: 'python',
      tests: [
        { description: 'saved balance, one expense', files: { 'start.txt': '100\n' }, stdin: '-30\nquit', expectedStdout: 'Starting at 100\nAmount (or quit)?\nAmount (or quit)?\nBalance: 70' },
        { description: 'no file, a bad amount then a good one', stdin: 'abc\n5\nquit', expectedStdout: 'No saved balance\nAmount (or quit)?\nNot a number, try again\nAmount (or quit)?\nAmount (or quit)?\nBalance: 5' },
        { description: 'no file, quit at once', stdin: 'quit', expectedStdout: 'No saved balance\nAmount (or quit)?\nBalance: 0' },
        { description: 'saved balance without final line break, two amounts', files: { 'start.txt': '-5' }, stdin: '10\n-2\nquit', expectedStdout: 'Starting at -5\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nBalance: 3' },
      ],
      hint: 'Two separate try/except blocks: `except FileNotFoundError` around the open, `except ValueError` around the int. Remember to strip the line you read from the file.',
      solution: py`
try:
    with open("start.txt") as f:
        balance = int(f.read().strip())
    print(f"Starting at {balance}")
except FileNotFoundError:
    balance = 0
    print("No saved balance")
print("Amount (or quit)?")
text = input()
while text != "quit":
    try:
        balance = balance + int(text)
    except ValueError:
        print("Not a number, try again")
    print("Amount (or quit)?")
    text = input()
print(f"Balance: {balance}")
`,
      projectNote: 'Both of the ledger\'s expected failures are now handled: a missing save file and a mistyped amount. Ledger v0.6 puts these into the functions from v0.5.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 6-5 Project: Ledger v0.6                                           */
/* ------------------------------------------------------------------ */

const ledgerV06 = py`
import json

LEDGER = "ledger.json"


def read_int(prompt):
    while True:
        print(prompt)
        text = input()
        try:
            return int(text)
        except ValueError:
            print("Not a number, try again")


def read_amount():
    while True:
        print("Amount (or quit)?")
        text = input()
        if text == "quit":
            return "quit"
        try:
            return int(text)
        except ValueError:
            print("Not a number, try again")


def load_entries(path):
    try:
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def save_entries(path, entries):
    with open(path, "w") as f:
        json.dump(entries, f)


def apply(balance, amount):
    return balance + amount


def read_entries(entries, balance):
    amount = read_amount()
    while amount != "quit":
        print("Category?")
        category = input()
        entries.append({"amount": amount, "category": category})
        balance = apply(balance, amount)
        print(f"Balance: {balance}")
        amount = read_amount()
    return balance


def summarize(entries):
    totals = {}
    for entry in entries:
        category = entry["category"]
        totals[category] = totals.get(category, 0) + entry["amount"]
    return totals


def print_report(entries, balance):
    print("--- summary ---")
    totals = summarize(entries)
    for category in sorted(totals):
        print(f"{category}: {totals[category]}")
    print(f"Entries: {len(entries)}")
    print(f"Final balance: {balance}")


entries = load_entries(LEDGER)
print(f"Loaded {len(entries)} entries")
balance = read_int("Balance?")
for entry in entries:
    balance = apply(balance, entry["amount"])
balance = read_entries(entries, balance)
save_entries(LEDGER, entries)
print(f"Saved {len(entries)} entries")
print_report(entries, balance)
`;

const l65: Lesson = {
  id: 'py-6-5',
  title: 'Project: Ledger v0.6',
  objective: 'Make the ledger remember its entries between runs and survive bad input.',
  minutes: 22,
  lexicon: [
    { id: 'py.6.load-or-default', term: 'load or start empty', kind: 'pattern', meaning: 'Try to open and load the save file; on FileNotFoundError return the empty starting value instead. The first run and every later run then share one code path.', example: 'def load_entries(path):\n    try:\n        with open(path) as f:\n            return json.load(f)\n    except FileNotFoundError:\n        return []' },
    { id: 'py.6.persist', term: 'load at start, save at quit', kind: 'concept', meaning: 'The pair that makes data outlive a run: read the file before anything else happens, write everything back once the user is done. In between, work only with the list in memory.', example: 'entries = load_entries(LEDGER)\n...\nsave_entries(LEDGER, entries)' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The plan for v0.6',
      body: `Ledger v0.5 forgot everything at exit and crashed on a typo. Version 0.6 keeps the same functions and adds four things, each one a lesson from this module:

- \`load_entries\` reads \`ledger.json\` if it exists, else starts with \`[]\` (6-3, 6-4). The program prints \`Loaded <k> entries\`.
- Entries are now **records**, dicts with \`amount\` and \`category\`, because tuples do not survive JSON (6-3). \`summarize\` reads \`entry["category"]\` instead of unpacking a tuple.
- \`read_int\` and \`read_amount\` are retry loops: a bad answer prints \`Not a number, try again\` and asks again, without asking for a category (6-4).
- On quit, \`save_entries\` writes everything back (6-1, 6-3) and the program prints \`Saved <n> entries\` before the summary.

The starting balance is the \`Balance?\` answer plus the sum of the loaded amounts. Read the labels: they are the plan.`,
      example: {
        language: 'python',
        source: ledgerV06,
        labels: [
          { lines: [1, 3], label: 'Import json once; name the save file in one place.' },
          { lines: [6, 13], label: 'read_int: a retry loop; return is the only exit.' },
          { lines: [16, 25], label: 'read_amount: the same loop, but quit is a valid answer and is returned as the word itself.' },
          { lines: [28, 33], label: 'Load or start empty: the file is missing on the very first run.' },
          { lines: [36, 38], label: 'Save: overwrite the whole file with the full list.' },
          { lines: [41, 42], label: 'apply, unchanged from v0.5.' },
          { lines: [45, 54], label: 'read_entries: append a record per entry and keep the running balance; stop at quit.' },
          { lines: [57, 62], label: 'summarize: totals per category, reading the record fields.' },
          { lines: [65, 71], label: 'print_report, unchanged: sorted categories, count, final balance.' },
          { lines: [74, 78], label: 'Start: load, announce, ask the starting balance, add the loaded amounts.' },
          { lines: [79, 82], label: 'Run: read entries, save them all, announce the save, report.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: '`ledger.json` already holds `[{"amount": -20, "category": "food"}]`. The user types `100`, then `quit`. What does the program above print, in full?',
      code: { language: 'python', source: ledgerV06 },
      choices: [
        'Loaded 1 entries\nBalance?\nAmount (or quit)?\nSaved 1 entries\n--- summary ---\nfood: -20\nEntries: 1\nFinal balance: 80',
        'Loaded 1 entries\nBalance?\nAmount (or quit)?\nSaved 1 entries\n--- summary ---\nfood: -20\nEntries: 1\nFinal balance: 100',
        'Loaded 1 entries\nBalance?\nAmount (or quit)?\nSaved 0 entries\n--- summary ---\nEntries: 0\nFinal balance: 80',
        'Loaded 0 entries\nBalance?\nAmount (or quit)?\nSaved 0 entries\n--- summary ---\nEntries: 0\nFinal balance: 100',
      ],
      answer: 'Loaded 1 entries\nBalance?\nAmount (or quit)?\nSaved 1 entries\n--- summary ---\nfood: -20\nEntries: 1\nFinal balance: 80',
      explanation: 'One record is loaded and announced. The starting balance is 100 plus the loaded -20, so 80 before any new entry. `quit` at once adds nothing, but the loaded entry is still in the list: it is saved again (`Saved 1 entries`), summarized and counted.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `load_entries`: return the list from the file, or an empty list if the file does not exist. Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['def load_entries(path):', '    try:', '        with open(path) as f:', '            return json.load(f)', '    except FileNotFoundError:', '        return []'],
      distractors: ['    except ValueError:', '            return json.loads(f)', '    except:'],
      explanation: 'A missing file raises `FileNotFoundError`, not `ValueError`. `load` reads a file object; `loads` wants a string. A bare `except:` would also hide a broken JSON file or a typo as an empty ledger.',
    },
    {
      kind: 'create',
      prompt: `Write Ledger v0.6. Keep the v0.5 functions (\`read_int\`, \`read_entries\`, \`apply\`, \`summarize\`, \`print_report\`) and add \`load_entries\` and \`save_entries\`. Exact behaviour:

- On start, if \`ledger.json\` exists, load it (a JSON list of \`{"amount": int, "category": str}\` records) and print \`Loaded <k> entries\`; without the file print \`Loaded 0 entries\`.
- Ask \`Balance?\`. The balance is that answer plus the sum of the loaded amounts.
- Ask \`Amount (or quit)?\` repeatedly. An answer that is not a whole number and not \`quit\` prints \`Not a number, try again\` and the amount is asked again, with no \`Category?\` in between. After a good amount ask \`Category?\`, then print \`Balance: <running>\`.
- On \`quit\`, save all entries (loaded plus new) to \`ledger.json\`, print \`Saved <total> entries\`, then \`--- summary ---\`, one \`<category>: <total>\` line per category sorted by name, \`Entries: <total>\`, \`Final balance: <n>\`.`,
      language: 'python',
      tests: [
        { description: 'no file, quit immediately', stdin: '100\nquit', expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nSaved 0 entries\n--- summary ---\nEntries: 0\nFinal balance: 100' },
        {
          description: 'two saved entries plus one new',
          files: { 'ledger.json': '[{"amount": -20, "category": "food"}, {"amount": 50, "category": "salary"}]' },
          stdin: '100\n-10\nfood\nquit',
          expectedStdout: 'Loaded 2 entries\nBalance?\nAmount (or quit)?\nCategory?\nBalance: 120\nAmount (or quit)?\nSaved 3 entries\n--- summary ---\nfood: -30\nsalary: 50\nEntries: 3\nFinal balance: 120',
        },
        {
          description: 'a bad amount, then a good one',
          stdin: '50\nabc\n25\ntips\nquit',
          expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nNot a number, try again\nAmount (or quit)?\nCategory?\nBalance: 75\nAmount (or quit)?\nSaved 1 entries\n--- summary ---\ntips: 25\nEntries: 1\nFinal balance: 75',
        },
        {
          description: 'saved entry counts toward the balance even with no new entry',
          files: { 'ledger.json': '[{"amount": -20, "category": "food"}]' },
          stdin: '100\nquit',
          expectedStdout: 'Loaded 1 entries\nBalance?\nAmount (or quit)?\nSaved 1 entries\n--- summary ---\nfood: -20\nEntries: 1\nFinal balance: 80',
        },
        {
          description: 'the v0.4 transcript, with no file',
          stdin: '100\n-30\nfood\n50\nsalary\n-10\nfood\nquit',
          expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nCategory?\nBalance: 70\nAmount (or quit)?\nCategory?\nBalance: 120\nAmount (or quit)?\nCategory?\nBalance: 110\nAmount (or quit)?\nSaved 3 entries\n--- summary ---\nfood: -40\nsalary: 50\nEntries: 3\nFinal balance: 110',
        },
      ],
      hint: 'Start from the labels in the concept step: write each function as a chunk and run the tests after each one. The `Loaded` line comes before `Balance?`; the `Saved` line comes before the summary.',
      solution: ledgerV06,
      projectNote: 'Ledger v0.6 complete: entries survive between runs in ledger.json, and a mistyped amount is asked again instead of crashing the program. Module 7 turns the records and the functions into classes.',
    },
  ],
};

export const m6: Module = {
  id: 'py-m6',
  title: 'Files and errors',
  goal: 'open/with, reading and writing text and JSON, try/except, validating input.',
  projectMilestone: 'Ledger v0.6: entries survive between runs and bad input no longer crashes the program.',
  status: 'available',
  lessons: [l61, l62, l63, l64, l65],
};
