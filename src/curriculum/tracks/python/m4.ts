import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 4: Collections                                              */
/* ------------------------------------------------------------------ */

const l41: Lesson = {
  id: 'py-4-1',
  title: 'Many values, one name',
  objective: 'Store several values in a list, grow it, count it and pick items by position.',
  minutes: 16,
  lexicon: [
    { id: 'py.4.list', term: '[a, b, c]', kind: 'punctuation', meaning: 'Square brackets make a list: an ordered collection of values that can grow and shrink. The list is one object; a name only points at it.', example: 'amounts = [100, -30, 50]', analogy: 'A shopping list on one sheet of paper. The analogy breaks at sharing: two people holding the same sheet see each other\'s additions, which paper copies would not.' },
    { id: 'py.4.append', term: 'xs.append(x)', kind: 'builtin', meaning: 'Add one item at the end of the list, changing the list itself. It gives back nothing (None), so never write xs = xs.append(x).', example: 'amounts.append(-10)' },
    { id: 'py.4.len', term: 'len(xs)', kind: 'builtin', meaning: 'The number of items in a collection. For a list of three items it is 3, while the last valid position is 2.', example: 'print(len(amounts))' },
    { id: 'py.4.index', term: 'xs[0]  xs[-1]', kind: 'punctuation', meaning: 'Pick one item by position. Positions start at 0; negative positions count from the end, so -1 is the last item. A position that does not exist raises IndexError.', example: 'first = amounts[0]\nlast = amounts[-1]', analogy: 'Floors in a European building: the ground floor is 0, so the "third" item is on floor 2. The analogy breaks for negatives: there is no basement -1 that means "the top floor".' },
    { id: 'py.4.alias', term: 'aliasing (b = a)', kind: 'concept', meaning: 'Assigning a list to a second name does not copy it. Both names point at the same object, so a change made through one is seen through the other.', example: 'a = [1, 2]\nb = a\nb.append(3)\nprint(a)   # [1, 2, 3]', analogy: 'Two nicknames for one person: whatever happens to the person is true under both names. It breaks for numbers and strings, which Python never changes in place, so there the difference cannot be observed.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A list is one object with many items',
      body: `So far a name held one value. A **list** holds many, in order: \`amounts = [100, -30, 50]\`. The list is one object; the name only points at it.

\`.append(x)\` adds \`x\` at the end. \`len(xs)\` counts the items. \`xs[0]\` is the first item: positions start at 0, so the last of three is \`xs[2]\`. Negative positions count from the end, so \`xs[-1]\` is always the last item. Asking for a position that does not exist stops the program with an \`IndexError\`.

Two names can point at the same list. A change made through one name is then visible through the other, because there is only one list. That is the notional machine for this whole module: names are labels, collections are objects.`,
      example: {
        language: 'python',
        source: 'amounts = [100, -30, 50]\namounts.append(-10)\nprint(amounts)\nprint(len(amounts))\nprint(amounts[0])\nprint(amounts[-1])\namounts[1] = -35\nprint(amounts)',
        labels: [
          { lines: [1, 1], label: 'Make a list of three amounts and name it.' },
          { lines: [2, 3], label: 'Grow it at the end, then show the whole list: [100, -30, 50, -10].' },
          { lines: [4, 4], label: 'Count the items: 4.' },
          { lines: [5, 6], label: 'Pick the first (position 0) and the last (position -1): 100 and -10.' },
          { lines: [7, 8], label: 'Replace the item at position 1 in place; the list is changed, not copied.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What happens when this program runs?',
      code: { language: 'python', source: 'amounts = [10, 20, 30]\nprint(amounts[3])' },
      choices: ['30', '10', 'an error (IndexError)', 'nothing is printed'],
      answer: 'an error (IndexError)',
      explanation: 'Three items live at positions 0, 1 and 2. There is no position 3, so Python stops with `IndexError: list index out of range`. The last item is `amounts[2]` or `amounts[-1]`.',
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'a = [1, 2]\nb = a\nb.append(3)\nprint(len(a))' },
      choices: ['2', '3', 'an error', '[1, 2]'],
      answer: '3',
      explanation: '`b = a` does not copy the list; it gives the same list a second name. `b.append(3)` changes that one list, so `a` has three items too. To get an independent copy you would write `b = list(a)`.',
    },
    {
      kind: 'parsons',
      prompt: 'Start with an empty list, add two amounts, then print how many there are and the last one.',
      language: 'python',
      indentation: false,
      solution: ['amounts = []', 'amounts.append(100)', 'amounts.append(-30)', 'print(len(amounts))', 'print(amounts[-1])'],
      distractors: ['amounts = amounts.append(100)', 'print(amounts[2])'],
      explanation: '`append` changes the list and returns None, so assigning its result throws the list away. With two items the valid positions are 0 and 1; position 2 does not exist.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it prints `3` and then `50`.',
      language: 'python',
      template: 'amounts = {{open}}100, -30{{close}}\namounts.{{add}}(50)\nprint({{count}}(amounts))\nprint(amounts[{{last}}])',
      blanks: [
        { id: 'open', answers: ['['], hint: 'the bracket that opens a list' },
        { id: 'close', answers: [']'] },
        { id: 'add', answers: ['append'], hint: 'the verb that adds at the end' },
        { id: 'count', answers: ['len'], hint: 'the built-in that counts items' },
        { id: 'last', answers: ['-1', '2'], hint: 'the position of the last item; counting from the end is shortest' },
      ],
      explanation: 'Both `-1` and `2` reach the last of three items, but `-1` keeps working when the list grows.',
    },
    {
      kind: 'modify',
      prompt: 'The program counts entries with a counter. Replace the counter with a list: append every amount, then print `Entries: <len>`. When there was at least one entry, also print `Last: <last amount>`.',
      language: 'python',
      starter: 'count = 0\nprint("Amount (or quit)?")\nline = input()\nwhile line != "quit":\n    amount = int(line)\n    count = count + 1\n    print("Amount (or quit)?")\n    line = input()\nprint(f"Entries: {count}")\n',
      tests: [
        { description: 'three amounts then quit', stdin: '100\n-30\n50\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nEntries: 3\nLast: 50' },
        { description: 'quit immediately', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nEntries: 0' },
        { description: 'one amount', stdin: '-7\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nEntries: 1\nLast: -7' },
      ],
      hint: 'Create `amounts = []` before the loop and `amounts.append(amount)` inside it. `len(amounts)` replaces the counter. Guard the `Last:` line with `if len(amounts) > 0:` so an empty list is never indexed.',
      solution: 'amounts = []\nprint("Amount (or quit)?")\nline = input()\nwhile line != "quit":\n    amount = int(line)\n    amounts.append(amount)\n    print("Amount (or quit)?")\n    line = input()\nprint(f"Entries: {len(amounts)}")\nif len(amounts) > 0:\n    print(f"Last: {amounts[-1]}")\n',
    },
    {
      kind: 'create',
      prompt: 'Read amounts until the user types `quit`, with the prompt `Amount (or quit)?` printed before every read. Store the amounts in a list. After quit print `Entries: <count>` and then `Stored: <the list>` (print the list itself, for example `Stored: [100, -30]`).',
      language: 'python',
      tests: [
        { description: 'two amounts', stdin: '100\n-30\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nEntries: 2\nStored: [100, -30]' },
        { description: 'quit immediately', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nEntries: 0\nStored: []' },
        { description: 'one amount', stdin: '5\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nEntries: 1\nStored: [5]' },
      ],
      hint: 'Same sentinel loop as Ledger v0.3; the only new lines are the empty list before the loop and one `append` inside it.',
      solution: 'amounts = []\nprint("Amount (or quit)?")\nline = input()\nwhile line != "quit":\n    amount = int(line)\n    amounts.append(amount)\n    print("Amount (or quit)?")\n    line = input()\nprint(f"Entries: {len(amounts)}")\nprint(f"Stored: {amounts}")\n',
      projectNote: 'The ledger now remembers every amount instead of only a running total. Remembered entries are what the per-category summary will be built from.',
    },
  ],
};

const l42: Lesson = {
  id: 'py-4-2',
  title: 'Walking through a list',
  objective: 'Visit every item of a list, test membership, take slices and use sum, min, max and sorting.',
  minutes: 18,
  lexicon: [
    { id: 'py.4.for-in', term: 'for x in xs:', kind: 'pattern', meaning: 'Run the block once per item of the collection, with x naming the current item, first to last. No counter and no indexing needed.', example: 'for a in amounts:\n    print(a)', analogy: '"For each item on the list, do this." It breaks if you change the list while walking it: the walk can skip or repeat items.' },
    { id: 'py.4.in', term: 'x in xs', kind: 'operator', meaning: 'Asks whether x is one of the items: True or False. The same word as in a for header, but here it is a question.', example: 'print(-30 in amounts)' },
    { id: 'py.4.slice', term: 'xs[start:end]', kind: 'punctuation', meaning: 'A new list of the items from position start up to but not including end. Leaving out start means from the beginning; leaving out end means to the end.', example: 'amounts[1:3]   # positions 1 and 2', analogy: 'A page range "pages 1 to 3" in a book means three pages; a slice 1:3 means two items because the end is excluded. That is exactly where the analogy breaks.' },
    { id: 'py.4.sum-min-max', term: 'sum / min / max', kind: 'builtin', meaning: 'Built-ins that read a whole collection: its total, its smallest item, its largest item. min and max fail on an empty list; sum of an empty list is 0.', example: 'print(sum(amounts), min(amounts), max(amounts))' },
    { id: 'py.4.sorted', term: 'sorted(xs) vs xs.sort()', kind: 'builtin', meaning: 'sorted(xs) gives a new sorted list and leaves xs unchanged. xs.sort() sorts xs in place and returns None, so xs = xs.sort() destroys the list.', example: 'ranked = sorted(amounts)\namounts.sort()' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Visiting, asking, cutting, summarising',
      body: `A loop can visit every item of a list: \`for a in amounts:\` gives \`a\` each item in turn, first to last. No counter, no \`range\`, no indexing.

\`x in xs\` asks whether \`x\` is one of the items. The answer is \`True\` or \`False\`.

A **slice** \`xs[1:3]\` is a new list made of positions 1 and 2. The start is included and the end is excluded, so the slice holds \`3 - 1\` items.

Three built-ins read a whole list at once: \`sum\`, \`min\` and \`max\`.

Sorting comes in two flavours. \`sorted(xs)\` gives a **new** sorted list and leaves \`xs\` alone. \`xs.sort()\` sorts the list **in place** and gives back nothing, so \`xs = xs.sort()\` throws the list away and leaves you with \`None\`.`,
      example: {
        language: 'python',
        source: 'amounts = [100, -30, 50, -10]\nfor a in amounts:\n    print(a)\nprint(-30 in amounts)\nprint(amounts[1:3])\nprint(sum(amounts), min(amounts), max(amounts))\nprint(sorted(amounts))\nprint(amounts)\namounts.sort()\nprint(amounts)',
        labels: [
          { lines: [1, 1], label: 'The data for the whole example.' },
          { lines: [2, 3], label: 'Visit each item in order and show it, one per line.' },
          { lines: [4, 4], label: 'Ask whether -30 is in the list: True.' },
          { lines: [5, 5], label: 'Cut out positions 1 and 2 (3 is excluded): [-30, 50].' },
          { lines: [6, 6], label: 'Summarise the whole list at once: 110 -30 100.' },
          { lines: [7, 8], label: 'sorted gives a new list; the original is still in its old order.' },
          { lines: [9, 10], label: 'sort changes the list itself; now the original is in order.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'xs = [10, 20, 30, 40]\nprint(xs[1:3])' },
      choices: ['[20, 30]', '[20, 30, 40]', '[10, 20, 30]', '[20]'],
      answer: '[20, 30]',
      explanation: 'A slice starts at the first position and stops **before** the second. Positions 1 and 2 are 20 and 30; position 3 (40) is excluded.',
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'xs = [3, 1, 2]\nxs = xs.sort()\nprint(xs)' },
      choices: ['[1, 2, 3]', 'None', '[3, 1, 2]', 'an error'],
      answer: 'None',
      explanation: '`xs.sort()` sorts the list in place and returns None. Assigning that None to `xs` replaces the name\'s target, so the sorted list is lost. Either call `xs.sort()` on its own line or write `xs = sorted(xs)`.',
    },
    {
      kind: 'parsons',
      prompt: 'Add up only the expenses (negative amounts) and print the total. Set indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['amounts = [100, -30, 50, -10]', 'expenses = 0', 'for a in amounts:', '    if a < 0:', '        expenses = expenses + a', 'print(expenses)'],
      distractors: ['for a in range(amounts):', 'for amounts in a:'],
      explanation: '`for a in amounts` visits the items directly; `range` wants a number, not a list. The name after `for` is the new name for each item, and the collection comes after `in`.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it prints `110`, then `-30`, then `[100, -30]`, then `True`.',
      language: 'python',
      template: 'amounts = [100, -30, 50, -10]\nprint({{total}}(amounts))\nprint({{smallest}}(amounts))\nprint(amounts[{{s}}:{{e}}])\nprint(-30 {{member}} amounts)',
      blanks: [
        { id: 'total', answers: ['sum'] },
        { id: 'smallest', answers: ['min'], hint: 'the most negative amount is the smallest' },
        { id: 's', answers: ['0'], hint: 'the first position' },
        { id: 'e', answers: ['2'], hint: 'the end is excluded, so one past the last item you want' },
        { id: 'member', answers: ['in'], hint: 'the membership question' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program prints every amount. Change it so it prints only the expenses (negative amounts), then `Total: <sum of all amounts>`, then `Biggest expense: <the smallest amount>`.',
      language: 'python',
      starter: 'amounts = [100, -30, 50, -10, 25]\nfor a in amounts:\n    print(a)\nprint(f"Total: {sum(amounts)}")\n',
      tests: [{ description: 'expenses, total and the biggest expense', expectedStdout: '-30\n-10\nTotal: 135\nBiggest expense: -30' }],
      hint: 'Put an `if a < 0:` around the print inside the loop. The biggest expense is the most negative number, which `min` finds.',
      solution: 'amounts = [100, -30, 50, -10, 25]\nfor a in amounts:\n    if a < 0:\n        print(a)\nprint(f"Total: {sum(amounts)}")\nprint(f"Biggest expense: {min(amounts)}")\n',
    },
    {
      kind: 'create',
      prompt: 'Read amounts until `quit` (prompt `Amount (or quit)?` before every read) into a list. After quit print `Entries: <count>` and `Total: <sum>`. If there was at least one entry, also print `Smallest: <min>` and `Largest: <max>`.',
      language: 'python',
      tests: [
        { description: 'three amounts', stdin: '100\n-30\n50\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nEntries: 3\nTotal: 120\nSmallest: -30\nLargest: 100' },
        { description: 'quit immediately', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nEntries: 0\nTotal: 0' },
        { description: 'one amount', stdin: '-5\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nEntries: 1\nTotal: -5\nSmallest: -5\nLargest: -5' },
      ],
      hint: '`sum` of an empty list is 0, but `min` and `max` of an empty list crash, so guard those two lines with `if len(amounts) > 0:`.',
      solution: 'amounts = []\nprint("Amount (or quit)?")\nline = input()\nwhile line != "quit":\n    amount = int(line)\n    amounts.append(amount)\n    print("Amount (or quit)?")\n    line = input()\nprint(f"Entries: {len(amounts)}")\nprint(f"Total: {sum(amounts)}")\nif len(amounts) > 0:\n    print(f"Smallest: {min(amounts)}")\n    print(f"Largest: {max(amounts)}")\n',
      projectNote: 'The ledger can report over everything it remembered, not only the last balance. The summary in v0.4 is the same idea, per category.',
    },
  ],
};

const l43: Lesson = {
  id: 'py-4-3',
  title: 'Two facts that travel together',
  objective: 'Keep an amount and its category together in a tuple, unpack tuples, and number items with enumerate.',
  minutes: 18,
  lexicon: [
    { id: 'py.4.tuple', term: '(amount, category)', kind: 'punctuation', meaning: 'Parentheses with commas make a tuple: a fixed group of values that cannot be changed after it is made. Index it like a list; you cannot append to it or replace an item.', example: 'entry = (-30, "food")\nprint(entry[1])', analogy: 'A line in a form with fixed fields: amount, category. The analogy breaks at naming: the fields have positions, not names, so you must remember which comes first.' },
    { id: 'py.4.unpack', term: 'a, b = pair', kind: 'pattern', meaning: 'Take a tuple apart into one name per item, by position, in a single assignment. The number of names must match the number of items.', example: 'amount, category = entry' },
    { id: 'py.4.for-unpack', term: 'for a, b in pairs:', kind: 'pattern', meaning: 'Unpack each tuple as the loop visits it, so the body can use the parts by name.', example: 'for amount, category in entries:\n    print(category, amount)' },
    { id: 'py.4.enumerate', term: 'enumerate(xs, start)', kind: 'builtin', meaning: 'Pairs every item with a counter as (counter, item). The counter starts at 0 unless you pass a start value.', example: 'for i, entry in enumerate(entries, 1):\n    print(i, entry)' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Tuples are records',
      body: `A ledger entry is two facts that belong together: an amount and a category. A **tuple** keeps them together: \`(-30, "food")\`. It is indexed like a list, but it cannot be changed after it is made: no \`append\`, no \`entry[0] = ...\`. That is the point. A tuple is a **record** with a fixed shape; a list is a growing collection of such records.

**Unpacking** takes a tuple apart into names in one step: \`amount, category = entry\`. The same works in a \`for\` header, so each record is split as the loop visits it.

\`enumerate(xs)\` pairs every item with a counter, starting at 0 unless you pass a start value. Unpack the pair as \`for i, item in enumerate(xs):\`.`,
      example: {
        language: 'python',
        source: 'entry = (-30, "food")\nprint(entry[0])\namount, category = entry\nprint(f"{category}: {amount}")\nentries = [(100, "salary"), (-30, "food")]\nentries.append((50, "salary"))\nfor amount, category in entries:\n    print(f"{category}: {amount}")\nfor i, entry in enumerate(entries, 1):\n    print(f"{i}. {entry[1]}")',
        labels: [
          { lines: [1, 2], label: 'One record: two values travelling together. Position 0 is the amount.' },
          { lines: [3, 4], label: 'Unpack the record into two names in one step, then use them.' },
          { lines: [5, 6], label: 'A list of records. Note the double parentheses: append takes one item, and that item is a tuple.' },
          { lines: [7, 8], label: 'Unpack each record as the loop visits it.' },
          { lines: [9, 10], label: 'enumerate hands out a counter with each record, starting at 1 here.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What happens when this program runs?',
      code: { language: 'python', source: 'entry = (-30, "food")\nentry[0] = -40\nprint(entry)' },
      choices: ["(-40, 'food')", "(-30, 'food')", 'an error (TypeError)', '-40'],
      answer: 'an error (TypeError)',
      explanation: 'A tuple cannot be changed after it is made, so assigning to `entry[0]` raises `TypeError`. To "change" a record you make a new tuple: `entry = (-40, entry[1])`. This is why tuples suit records: nothing can quietly alter them.',
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'categories = ["food", "rent"]\nfor i, c in enumerate(categories):\n    print(i, c)' },
      choices: ['0 food\n1 rent', '1 food\n2 rent', 'food\nrent', 'an error'],
      answer: '0 food\n1 rent',
      explanation: '`enumerate` counts from 0 unless you pass a start, so the first pair is `(0, "food")`. For a human-friendly numbering write `enumerate(categories, 1)`.',
    },
    {
      kind: 'parsons',
      prompt: 'For each entry print `<category>: expense` or `<category>: income`. Set indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['entries = [(100, "salary"), (-30, "food")]', 'for amount, category in entries:', '    if amount < 0:', '        print(f"{category}: expense")', '    else:', '        print(f"{category}: income")'],
      distractors: ['entries = [100, "salary", -30, "food"]', 'for category, amount in entries:'],
      explanation: 'Records need their own parentheses inside the list; a flat list loses which amount belongs to which category. Unpacking is by position, so the names must come in the same order as the values in each tuple.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it adds a third record and prints `salary: 100`, `food: -30`, `salary: 50`, then `1 100`, `2 -30`, `3 50`.',
      language: 'python',
      template: 'entries = [(100, "salary"), (-30, "food")]\nentries.append({{open}}50, "salary"{{close}})\nfor {{a}}, {{c}} in entries:\n    print(f"{category}: {amount}")\nfor i, entry in {{en}}(entries, 1):\n    print(i, entry[0])',
      blanks: [
        { id: 'open', answers: ['('], hint: 'append takes one item, and that item is a tuple' },
        { id: 'close', answers: [')'] },
        { id: 'a', answers: ['amount'], hint: 'the names must match the ones used in the body, in tuple order' },
        { id: 'c', answers: ['category'] },
        { id: 'en', answers: ['enumerate'], hint: 'the built-in that pairs each item with a counter' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program stores bare amounts. Change it so that after every amount it prints `Category?` and reads a category, stores the pair `(amount, category)`, and after quit prints one line `<category>: <amount>` per entry, in the order entered.',
      language: 'python',
      starter: 'entries = []\nprint("Amount (or quit)?")\nline = input()\nwhile line != "quit":\n    amount = int(line)\n    entries.append(amount)\n    print("Amount (or quit)?")\n    line = input()\nfor amount in entries:\n    print(amount)\n',
      tests: [
        { description: 'two entries', stdin: '-30\nfood\n50\nsalary\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nfood: -30\nsalary: 50' },
        { description: 'quit immediately', stdin: 'quit', expectedStdout: 'Amount (or quit)?' },
      ],
      hint: 'Read the category right after converting the amount, before asking for the next amount. Append `(amount, category)` with double parentheses, and unpack both names in the final loop.',
      solution: 'entries = []\nprint("Amount (or quit)?")\nline = input()\nwhile line != "quit":\n    amount = int(line)\n    print("Category?")\n    category = input()\n    entries.append((amount, category))\n    print("Amount (or quit)?")\n    line = input()\nfor amount, category in entries:\n    print(f"{category}: {amount}")\n',
    },
    {
      kind: 'create',
      prompt: 'Read entries until `quit`: prompt `Amount (or quit)?`, then (not after quit) prompt `Category?` and read the category. Store each entry as a tuple. After quit print a numbered list starting at 1, one line per entry in the form `1. food: -30`, then `Entries: <count>`.',
      language: 'python',
      tests: [
        { description: 'three entries', stdin: '-30\nfood\n50\nsalary\n-10\nfood\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\n1. food: -30\n2. salary: 50\n3. food: -10\nEntries: 3' },
        { description: 'quit immediately', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nEntries: 0' },
        { description: 'one entry', stdin: '20\nrent\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\n1. rent: 20\nEntries: 1' },
      ],
      hint: 'Use `enumerate(entries, 1)` for the numbering. The loop variable for each record is a tuple, so index it or unpack it inside the loop.',
      solution: 'entries = []\nprint("Amount (or quit)?")\nline = input()\nwhile line != "quit":\n    amount = int(line)\n    print("Category?")\n    category = input()\n    entries.append((amount, category))\n    print("Amount (or quit)?")\n    line = input()\nfor i, entry in enumerate(entries, 1):\n    amount, category = entry\n    print(f"{i}. {category}: {amount}")\nprint(f"Entries: {len(entries)}")\n',
      projectNote: 'Each ledger entry is now a record with a category. The `Category?` prompt and the list of `(amount, category)` tuples are exactly what v0.4 keeps.',
    },
  ],
};

const l44: Lesson = {
  id: 'py-4-4',
  title: 'Looking things up by name',
  objective: 'Map keys to values in a dictionary, look up safely, and accumulate totals per key.',
  minutes: 20,
  lexicon: [
    { id: 'py.4.dict', term: '{key: value}', kind: 'punctuation', meaning: 'Curly braces with key: value pairs make a dictionary. Each key appears once and maps to one value. {} is an empty dictionary.', example: 'totals = {"food": -30, "salary": 100}', analogy: 'A printed dictionary: look up a word, read its entry. It breaks at order: a Python dict is not alphabetical; it keeps the order in which keys were added.' },
    { id: 'py.4.dict-key', term: 'd[key]', kind: 'punctuation', meaning: 'Look up the value stored under key. Reading a key that is not there raises KeyError; assigning to a key adds it or replaces its value.', example: 'print(totals["food"])\ntotals["rent"] = -500' },
    { id: 'py.4.get', term: 'd.get(key, default)', kind: 'builtin', meaning: 'Look up key, but give back default instead of raising an error when the key is missing. The dict is not changed.', example: 'totals.get("rent", 0)' },
    { id: 'py.4.accumulate-dict', term: 'd[k] = d.get(k, 0) + x', kind: 'pattern', meaning: 'Add x to the total stored under k, starting from 0 the first time k appears. The standard way to total or count per key.', example: 'totals[category] = totals.get(category, 0) + amount' },
    { id: 'py.4.items', term: 'd.items()  sorted(d)', kind: 'builtin', meaning: 'd.items() hands out (key, value) pairs for a loop. sorted(d) is a list of the keys in sorted order, for output that is the same every run.', example: 'for category in sorted(totals):\n    print(category, totals[category])' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Keys and values',
      body: `A **dictionary** maps keys to values: \`{"food": -30, "salary": 100}\`. Look up by key with \`totals["food"]\`. A missing key raises \`KeyError\`, so either ask first with \`key in totals\`, or look up with a fallback: \`totals.get(key, 0)\` gives the value, or 0 when the key is absent.

That fallback powers the most useful pattern of this module, accumulating into a dict: \`totals[cat] = totals.get(cat, 0) + amount\`. The first time a category appears the total starts from 0; afterwards it adds to what is there.

\`totals.items()\` hands out \`(key, value)\` pairs for a loop. A dict remembers insertion order, but a report is easier to read and to test when the keys are sorted: \`sorted(totals)\` is a sorted list of the keys.`,
      example: {
        language: 'python',
        source: 'totals = {"food": -30, "salary": 100}\nprint(totals["food"])\nprint("rent" in totals)\nprint(totals.get("rent", 0))\ntotals["food"] = totals.get("food", 0) + -10\ntotals["rent"] = totals.get("rent", 0) + -500\nfor category, total in totals.items():\n    print(f"{category}: {total}")\nfor category in sorted(totals):\n    print(f"{category}: {totals[category]}")',
        labels: [
          { lines: [1, 2], label: 'A dict with two keys; look one up: -30.' },
          { lines: [3, 4], label: 'Ask before looking (False), or look up with a fallback (0). Neither crashes.' },
          { lines: [5, 6], label: 'The accumulate pattern: works the same for a key that exists and one that is new.' },
          { lines: [7, 8], label: 'Visit the pairs in insertion order: food, salary, rent.' },
          { lines: [9, 10], label: 'Visit the keys in sorted order: food, rent, salary. Deterministic output.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What happens when this program runs?',
      code: { language: 'python', source: 'totals = {"food": -30}\nprint(totals["rent"])' },
      choices: ['0', 'None', 'an error (KeyError)', 'rent'],
      answer: 'an error (KeyError)',
      explanation: 'Square-bracket lookup insists the key exists; `"rent"` is not there, so Python raises `KeyError: \'rent\'`. `totals.get("rent", 0)` would give 0 instead.',
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'totals = {}\nfor category, amount in [("food", -30), ("rent", -500), ("food", -10)]:\n    totals[category] = totals.get(category, 0) + amount\nprint(totals["food"], len(totals))' },
      choices: ['-40 2', '-40 3', '-10 2', 'an error (KeyError)'],
      answer: '-40 2',
      explanation: 'The first `food` starts from 0 and becomes -30; the second adds -10 to the stored -30, giving -40. Only two distinct keys were ever stored, so `len` is 2. `get` with a default is what prevents the KeyError on each first appearance.',
    },
    {
      kind: 'parsons',
      prompt: 'Total the entries per category and print one `<category>: <total>` line per category, sorted by name. Set indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['entries = [(100, "salary"), (-30, "food"), (-10, "food")]', 'totals = {}', 'for amount, category in entries:', '    totals[category] = totals.get(category, 0) + amount', 'for category in sorted(totals):', '    print(f"{category}: {totals[category]}")'],
      distractors: ['    totals[category] = totals[category] + amount', 'for category in totals.sort():'],
      explanation: 'Plain `totals[category]` raises KeyError the first time a category appears; `get(category, 0)` supplies the starting 0. Dicts have no `sort` method, and even on a list `sort()` returns None; `sorted(totals)` is the sorted list of keys.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it prints `food: -40` and then `salary: 100`.',
      language: 'python',
      template: 'entries = [(100, "salary"), (-30, "food"), (-10, "food")]\ntotals = {{open}}{{close}}\nfor amount, category in entries:\n    totals[category] = totals.{{g}}(category, {{d}}) + amount\nfor category in {{srt}}(totals):\n    print(f"{category}: {totals[category]}")',
      blanks: [
        { id: 'open', answers: ['{'], hint: 'the brace that opens an empty dictionary' },
        { id: 'close', answers: ['}'] },
        { id: 'g', answers: ['get'], hint: 'the lookup that takes a fallback' },
        { id: 'd', answers: ['0'], hint: 'what a total starts from' },
        { id: 'srt', answers: ['sorted'], hint: 'gives the keys in a fixed order' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program counts how many entries each category has. Change it so it reports the **total amount** per category instead, and after the per-category lines print `Categories: <number of categories>`.',
      language: 'python',
      starter: 'entries = [(100, "salary"), (-30, "food"), (-10, "food")]\ncounts = {}\nfor amount, category in entries:\n    counts[category] = counts.get(category, 0) + 1\nfor category in sorted(counts):\n    print(f"{category}: {counts[category]}")\n',
      tests: [{ description: 'totals per category and the category count', expectedStdout: 'food: -40\nsalary: 100\nCategories: 2' }],
      hint: 'Add `amount` instead of `1`. The number of categories is the number of keys in the dict.',
      solution: 'entries = [(100, "salary"), (-30, "food"), (-10, "food")]\ntotals = {}\nfor amount, category in entries:\n    totals[category] = totals.get(category, 0) + amount\nfor category in sorted(totals):\n    print(f"{category}: {totals[category]}")\nprint(f"Categories: {len(totals)}")\n',
    },
    {
      kind: 'create',
      prompt: 'Read entries until `quit` (prompt `Amount (or quit)?`, then `Category?` after each amount) and store them. After quit print one line `<category>: <total>` per category, sorted by category name. Print nothing else after quit.',
      language: 'python',
      tests: [
        { description: 'two categories, one repeated', stdin: '-30\nfood\n50\nsalary\n-10\nfood\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nfood: -40\nsalary: 50' },
        { description: 'quit immediately', stdin: 'quit', expectedStdout: 'Amount (or quit)?' },
        { description: 'categories entered out of order', stdin: '10\nzoo\n-5\napple\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\napple: -5\nzoo: 10' },
      ],
      hint: 'Collect `(amount, category)` tuples during the loop, then build the totals dict with the accumulate pattern and print over `sorted(totals)`.',
      solution: 'entries = []\nprint("Amount (or quit)?")\nline = input()\nwhile line != "quit":\n    amount = int(line)\n    print("Category?")\n    category = input()\n    entries.append((amount, category))\n    print("Amount (or quit)?")\n    line = input()\ntotals = {}\nfor amount, category in entries:\n    totals[category] = totals.get(category, 0) + amount\nfor category in sorted(totals):\n    print(f"{category}: {totals[category]}")\n',
      projectNote: 'This is the per-category summary of Ledger v0.4. The project lesson wraps it together with the running balance and the footer.',
    },
  ],
};

const l45: Lesson = {
  id: 'py-4-5',
  title: 'Project: Ledger v0.4',
  objective: 'Store every entry with its category and print a per-category summary after the running balance.',
  minutes: 20,
  lexicon: [
    { id: 'py.4.collect-report', term: 'collect, then report', kind: 'pattern', meaning: 'Gather items into a collection while the input loop runs; compute totals and print the report only after the loop has ended. Keeps reading and reporting apart.', example: 'while line != "quit":\n    entries.append((amount, category))\n    ...\nfor amount, category in entries:\n    ...' },
    { id: 'py.4.len-count', term: 'len(entries) as the count', kind: 'pattern', meaning: 'Once items are stored, their number is len(collection); a separate counter would only repeat information the list already has.', example: 'print(f"Entries: {len(entries)}")' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The whole plan',
      body: `Everything in this module meets in Ledger v0.4. The loop no longer only updates a balance: it **collects** each entry as an \`(amount, category)\` tuple in a list. The report then runs over that list: a dict accumulates a total per category and is printed with sorted keys, and \`Entries:\` comes from \`len(entries)\` instead of a counter.

The transcript is a contract: prompts on their own lines, \`Balance: <running>\` after every entry, the summary header, one line per category sorted by name, then the two footer lines.

Read the labels as the plan. Collect during the loop; compute and report after it.`,
      example: {
        language: 'python',
        source: 'print("Balance?")\nbalance = int(input())\nentries = []\nprint("Amount (or quit)?")\nline = input()\nwhile line != "quit":\n    amount = int(line)\n    print("Category?")\n    category = input()\n    entries.append((amount, category))\n    balance = balance + amount\n    print(f"Balance: {balance}")\n    print("Amount (or quit)?")\n    line = input()\ntotals = {}\nfor amount, category in entries:\n    totals[category] = totals.get(category, 0) + amount\nprint("--- summary ---")\nfor category in sorted(totals):\n    print(f"{category}: {totals[category]}")\nprint(f"Entries: {len(entries)}")\nprint(f"Final balance: {balance}")',
        labels: [
          { lines: [1, 3], label: 'Ask and read the starting balance; prepare the empty list of entries.' },
          { lines: [4, 5], label: 'Ask for the first amount before the loop so the sentinel can be checked.' },
          { lines: [6, 10], label: 'For each amount: ask the category, store the record.' },
          { lines: [11, 12], label: 'Keep the running balance and report it, as in v0.3.' },
          { lines: [13, 14], label: 'Ask again; `quit` ends the loop without asking a category.' },
          { lines: [15, 17], label: 'After the loop: total per category with the accumulate pattern.' },
          { lines: [18, 20], label: 'Summary header and one line per category, sorted by name.' },
          { lines: [21, 22], label: 'Footer: the count comes from the list, the balance from the loop.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The user types `50`, `-20`, `rent`, `quit`. Which lines are printed after the last `Amount (or quit)?`?',
      code: { language: 'python', source: 'print("Balance?")\nbalance = int(input())\nentries = []\nprint("Amount (or quit)?")\nline = input()\nwhile line != "quit":\n    amount = int(line)\n    print("Category?")\n    category = input()\n    entries.append((amount, category))\n    balance = balance + amount\n    print(f"Balance: {balance}")\n    print("Amount (or quit)?")\n    line = input()\ntotals = {}\nfor amount, category in entries:\n    totals[category] = totals.get(category, 0) + amount\nprint("--- summary ---")\nfor category in sorted(totals):\n    print(f"{category}: {totals[category]}")\nprint(f"Entries: {len(entries)}")\nprint(f"Final balance: {balance}")' },
      choices: ['--- summary ---\nrent: -20\nEntries: 1\nFinal balance: 30', '--- summary ---\nrent: -20\nEntries: 2\nFinal balance: 30', 'Category?\n--- summary ---\nrent: -20\nEntries: 1\nFinal balance: 30', '--- summary ---\nrent: 30\nEntries: 1\nFinal balance: 30'],
      answer: '--- summary ---\nrent: -20\nEntries: 1\nFinal balance: 30',
      explanation: 'One entry was stored: (-20, "rent"). `quit` ends the loop before any `Category?` is asked and is not an entry, so `len(entries)` is 1. The summary shows the total per category (-20), not the balance; the balance 50 - 20 = 30 appears only in the footer.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the report that runs after the loop, assuming `entries` already holds the records. Set indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['totals = {}', 'for amount, category in entries:', '    totals[category] = totals.get(category, 0) + amount', 'print("--- summary ---")', 'for category in sorted(totals):', '    print(f"{category}: {totals[category]}")', 'print(f"Entries: {len(entries)}")'],
      distractors: ['for category in totals:', 'print(f"Entries: {len(totals)}")'],
      explanation: 'Looping over the dict directly gives insertion order, not sorted order; the contract wants categories sorted by name. `len(totals)` counts categories, but `Entries:` counts the records, which live in `entries`.',
    },
    {
      kind: 'create',
      prompt: 'Write Ledger v0.4 exactly as planned. Prompts: `Balance?` once, then `Amount (or quit)?` before every amount and `Category?` after each amount (not after quit). After each entry print `Balance: <running>`. After quit print `--- summary ---`, one line `<category>: <total>` per category sorted by name, then `Entries: <count>` and `Final balance: <n>`.',
      language: 'python',
      tests: [
        { description: 'quit immediately', stdin: '100\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\n--- summary ---\nEntries: 0\nFinal balance: 100' },
        { description: 'documented example', stdin: '100\n-30\nfood\n50\nsalary\n-10\nfood\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: 70\nAmount (or quit)?\nCategory?\nBalance: 120\nAmount (or quit)?\nCategory?\nBalance: 110\nAmount (or quit)?\n--- summary ---\nfood: -40\nsalary: 50\nEntries: 3\nFinal balance: 110' },
        { description: 'one category only', stdin: '20\n-5\nfood\n-15\nfood\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: 15\nAmount (or quit)?\nCategory?\nBalance: 0\nAmount (or quit)?\n--- summary ---\nfood: -20\nEntries: 2\nFinal balance: 0' },
        { description: 'categories entered out of alphabetical order', stdin: '0\n10\nzoo\n-5\napple\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: 10\nAmount (or quit)?\nCategory?\nBalance: 5\nAmount (or quit)?\n--- summary ---\napple: -5\nzoo: 10\nEntries: 2\nFinal balance: 5' },
      ],
      hint: 'Start from the labels in the concept step: the v0.3 loop plus `Category?` and an `append`, then the summary from the previous lesson, then the two footer lines. Run the tests after each chunk.',
      solution: 'print("Balance?")\nbalance = int(input())\nentries = []\nprint("Amount (or quit)?")\nline = input()\nwhile line != "quit":\n    amount = int(line)\n    print("Category?")\n    category = input()\n    entries.append((amount, category))\n    balance = balance + amount\n    print(f"Balance: {balance}")\n    print("Amount (or quit)?")\n    line = input()\ntotals = {}\nfor amount, category in entries:\n    totals[category] = totals.get(category, 0) + amount\nprint("--- summary ---")\nfor category in sorted(totals):\n    print(f"{category}: {totals[category]}")\nprint(f"Entries: {len(entries)}")\nprint(f"Final balance: {balance}")\n',
      projectNote: 'Ledger v0.4 complete: every entry is stored with its category and the report totals per category. Module 5 will cut this program into functions without changing a line of its transcript.',
    },
  ],
};

export const m4: Module = {
  id: 'py-m4',
  title: 'Collections',
  goal: 'Lists, tuples, dictionaries, indexing, slicing, membership, iteration over collections.',
  projectMilestone: 'Ledger v0.4: stores every entry with a category and prints a summary per category.',
  status: 'available',
  lessons: [l41, l42, l43, l44, l45],
};
