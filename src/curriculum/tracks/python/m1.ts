import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 1: Saying things                                            */
/* ------------------------------------------------------------------ */

const l11: Lesson = {
  id: 'py-1-1',
  title: 'Your first sentence',
  objective: 'Print lines of text with print.',
  minutes: 12,
  lexicon: [
    { id: 'py.print', term: 'print(...)', kind: 'builtin', meaning: 'Show whatever is inside the parentheses, then end the line.', example: 'print("Balance: 0")', analogy: 'A verb that takes one object: "say X". Unlike speech, it always ends the line afterwards.' },
    { id: 'py.string', term: '"..."', kind: 'punctuation', meaning: 'Quotation marks make a piece of text (a string). Python shows text literally and does not try to understand it.', example: 'print("Owner: Sam")', analogy: 'Quoting someone: you repeat the words exactly, without interpreting them.' },
    { id: 'py.statement', term: 'statement', kind: 'concept', meaning: 'One instruction on one line. Python performs statements from top to bottom, one at a time.', example: 'print("one")\nprint("two")', analogy: 'A sentence. A program is a paragraph read strictly in order.' },
    { id: 'py.comment', term: '# ...', kind: 'punctuation', meaning: 'Everything after # on a line is a note for humans. Python skips it.', example: '# starting balance\nprint("Balance: 0")' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Python reads top to bottom',
      body: `A Python program is a list of **statements**, one per line. Python performs the first, then the second, and so on. Nothing happens out of order unless you say so (that comes later).

The first verb you need is \`print\`. Whatever you put inside its parentheses gets shown, and then the line ends.

Text must be wrapped in quotation marks. That tells Python: "this is a string, show it exactly, do not try to understand it".

Below is the first version of the project you will build in this track: a personal ledger. Today it only announces itself.`,
      example: {
        language: 'python',
        source: '# Ledger, day one\nprint("CyberLing Ledger")\nprint("Balance: 0")',
        labels: [
          { lines: [1, 1], label: 'A comment: a note for humans. Python skips it.' },
          { lines: [2, 2], label: 'Show a title line.' },
          { lines: [3, 3], label: 'Show the starting balance.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What does this program show? Decide **before** running anything.',
      code: { language: 'python', source: 'print("Hello")\nprint("World")' },
      choices: ['Hello World', 'Hello\nWorld', 'HelloWorld', '"Hello"\n"World"'],
      answer: 'Hello\nWorld',
      explanation: 'Each `print` ends its line, so the two words land on two lines. The quotation marks are not shown: they are instructions to Python, not part of the text.',
    },
    {
      kind: 'parsons',
      prompt: 'Build a program that prints a title, a line of dashes, and the balance, in that order.',
      language: 'python',
      indentation: false,
      solution: ['print("CyberLing Ledger")', 'print("-------")', 'print("Balance: 0")'],
      distractors: ['print "Balance: 0"', 'Print("Balance: 0")'],
      explanation: 'Python is case-sensitive (`Print` is not `print`) and the parentheses are required.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so that it shows `Welcome` and then `Balance: 0`.',
      language: 'python',
      template: '{{fn}}({{q1}}Welcome{{q2}})\nprint("Balance: 0")',
      blanks: [
        { id: 'fn', answers: ['print'], hint: 'the verb that shows things' },
        { id: 'q1', answers: ['"', "'"], hint: 'text needs to be wrapped' },
        { id: 'q2', answers: ['"', "'"], hint: 'close what you opened, with the same kind of quote' },
      ],
      explanation: 'Either kind of quote works, as long as the opening and closing quotes match.',
    },
    {
      kind: 'modify',
      prompt: 'The program prints only the balance. Change it so it prints three lines: `CyberLing Ledger`, then `Owner: Sam`, then `Balance: 0`.',
      language: 'python',
      starter: 'print("Balance: 0")\n',
      tests: [{ description: 'Prints the three lines in order', expectedStdout: 'CyberLing Ledger\nOwner: Sam\nBalance: 0' }],
      hint: 'Add two more `print` statements above the existing one.',
      solution: 'print("CyberLing Ledger")\nprint("Owner: Sam")\nprint("Balance: 0")\n',
    },
    {
      kind: 'create',
      prompt: 'From a blank file, write a program that prints exactly `Ledger ready` and then `Entries: 0`.',
      language: 'python',
      tests: [{ description: 'Two lines, exact text', expectedStdout: 'Ledger ready\nEntries: 0' }],
      solution: 'print("Ledger ready")\nprint("Entries: 0")\n',
      projectNote: 'Ledger v0.0: the program exists and announces itself.',
    },
  ],
};

const l12: Lesson = {
  id: 'py-1-2',
  title: 'Names and values',
  objective: 'Store a value under a name and use the name later.',
  minutes: 15,
  lexicon: [
    { id: 'py.assign', term: 'name = value', kind: 'operator', meaning: 'Bind the name on the left to the value on the right. It is not a question of equality; it is an act of naming.', example: 'balance = 100', analogy: '"Let balance be 100." The single = means "is now called", not "equals".' },
    { id: 'py.name', term: 'name (variable)', kind: 'concept', meaning: 'A label attached to a value. Using the name gives you the value. You can move the label to a new value later.', example: 'owner = "Sam"\nprint(owner)', analogy: 'A sticky note on a box. The note can be peeled off and stuck on a different box; the box itself does not change.' },
    { id: 'py.rebind', term: 'x = x + 1', kind: 'pattern', meaning: 'Compute the right side first using the old value, then re-attach the name to the result.', example: 'balance = 0\nbalance = balance + 25', analogy: 'A sentence that reads oddly in math but naturally as an instruction: "the new x is the old x plus one".' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A name is a label on a value',
      body: `Programs need to remember things. In Python you remember a value by giving it a **name**:

\`\`\`
balance = 100
\`\`\`

Read the single \`=\` as **"is now called"**, never as "equals". Python computes the right side first, then attaches the name on the left to the result.

Once a value has a name, the name stands in for it. \`print(balance)\` shows \`100\`. Notice there are no quotes: with quotes, Python would show the *word* balance.

You can reattach a name to a new value at any time; the old value is simply forgotten.`,
      example: {
        language: 'python',
        source: 'owner = "Sam"\nbalance = 0\nprint(owner)\nprint(balance)\nbalance = balance + 50\nprint(balance)',
        labels: [
          { lines: [1, 2], label: 'Give two values names.' },
          { lines: [3, 4], label: 'Use the names. No quotes, so the values show, not the words.' },
          { lines: [5, 5], label: 'Compute old balance + 50, then re-attach the name balance to the result.' },
          { lines: [6, 6], label: 'Now shows 50.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'x = 5\nx = x + 2\nprint(x)' },
      choices: ['7', '5', 'x + 2', '52'],
      answer: '7',
      explanation: 'The right side `x + 2` is computed first with the old value (5), giving 7. Then the name `x` is re-attached to 7.',
    },
    {
      kind: 'parsons',
      prompt: 'Name a title and a balance, then print both (title first).',
      language: 'python',
      indentation: false,
      solution: ['title = "Ledger"', 'balance = 100', 'print(title)', 'print(balance)'],
      distractors: ['"Ledger" = title', 'print("balance")'],
      explanation: 'The name goes on the left of `=`. And `print("balance")` would show the word, not the value.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so that it prints `Sam`.',
      language: 'python',
      template: 'owner {{eq}} "Sam"\nprint({{who}})',
      blanks: [
        { id: 'eq', answers: ['='], hint: 'the naming operator, a single character' },
        { id: 'who', answers: ['owner'], hint: 'use the name, without quotes' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Change the program so that the balance starts at 20, then grows by 5 **using the name itself**, and prints `25`.',
      language: 'python',
      starter: 'balance = 0\nprint("Balance:")\nprint(balance)\n',
      tests: [{ description: 'Prints the label and then 25', expectedStdout: 'Balance:\n25' }],
      hint: 'Add a line like `balance = balance + 5` before the print.',
      solution: 'balance = 20\nbalance = balance + 5\nprint("Balance:")\nprint(balance)\n',
    },
    {
      kind: 'create',
      prompt: 'Create a name `owner` holding `Sam` and a name `balance` holding `100`. Print the owner, then the balance.',
      language: 'python',
      tests: [{ description: 'Owner then balance', expectedStdout: 'Sam\n100' }],
      solution: 'owner = "Sam"\nbalance = 100\nprint(owner)\nprint(balance)\n',
      projectNote: 'Ledger v0.0: the program now remembers an owner and a balance.',
    },
  ],
};

const l13: Lesson = {
  id: 'py-1-3',
  title: 'Numbers, text, and mixing them',
  objective: 'Tell numbers from text and build output with f-strings.',
  minutes: 18,
  lexicon: [
    { id: 'py.int', term: 'int', kind: 'concept', meaning: 'A whole number such as 0, 42 or -7. Arithmetic on ints is exact.', example: 'count = 3' },
    { id: 'py.float', term: 'float', kind: 'concept', meaning: 'A number with a decimal point such as 42.5. Fast, but not always exact in the last digits.', example: 'price = 42.5' },
    { id: 'py.str', term: 'str', kind: 'concept', meaning: 'Text. Even "100" in quotes is text, not a number.', example: 'label = "100"' },
    { id: 'py.fstring', term: 'f"... {name} ..."', kind: 'pattern', meaning: 'A string with an f in front. Anything inside curly braces is computed and inserted into the text.', example: 'print(f"Balance: {balance}")', analogy: 'A fill-in-the-blank sentence; the braces are the blanks.' },
    { id: 'py.plus', term: '+', kind: 'operator', meaning: 'Adds numbers. Joins text to text. Mixing text and a number is an error.', example: '1 + 2      # 3\n"1" + "2"  # "12"' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Kinds of values',
      body: `Every value has a **type**, and the type decides what operations mean.

- \`100\` is an **int**, a whole number.
- \`42.5\` is a **float**, a number with a decimal point.
- \`"100"\` is a **str**, text. The quotes make it text even though it looks like a number.

\`+\` adds two numbers, but joins two strings: \`"1" + "2"\` is \`"12"\`. Adding a string to a number is an error, because Python refuses to guess which you meant.

To put values inside text, use an **f-string**: a string with \`f\` before the opening quote. Anything in curly braces is computed and inserted.`,
      example: {
        language: 'python',
        source: 'owner = "Sam"\nbalance = 100\nspent = 42.5\nprint(f"{owner} has {balance - spent} left")',
        labels: [
          { lines: [1, 3], label: 'A str, an int, and a float.' },
          { lines: [4, 4], label: 'An f-string: the braces are computed (100 - 42.5 = 57.5) and inserted.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What are the two lines of output?',
      code: { language: 'python', source: 'print("1" + "2")\nprint(1 + 2)' },
      choices: ['12 and 3', '3 and 3', '12 and 12', 'an error'],
      answer: '12 and 3',
      explanation: 'With strings, `+` joins: "1" + "2" is "12". With ints, `+` adds: 3. Same symbol, different meaning, chosen by the type.',
    },
    {
      kind: 'parsons',
      prompt: 'Print `Sam: 100` using an f-string.',
      language: 'python',
      indentation: false,
      solution: ['owner = "Sam"', 'balance = 100', 'print(f"{owner}: {balance}")'],
      distractors: ['print("{owner}: {balance}")', 'print(owner + ": " + balance)'],
      explanation: 'Without the `f`, the braces are shown literally. And `": " + balance` mixes text with an int, which is an error.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the f-string so the program prints `Owner: Sam`.',
      language: 'python',
      template: 'owner = "Sam"\nprint({{f}}"Owner: {{open}}owner{{close}}")',
      blanks: [
        { id: 'f', answers: ['f'], hint: 'one letter before the quote' },
        { id: 'open', answers: ['{'], hint: 'curly brace' },
        { id: 'close', answers: ['}'] },
      ],
    },
    {
      kind: 'modify',
      prompt: 'This program crashes because it adds text to a number. Fix it using an f-string so it prints `Balance: 100`.',
      language: 'python',
      starter: 'balance = 100\nprint("Balance: " + balance)\n',
      tests: [{ description: 'Prints Balance: 100', expectedStdout: 'Balance: 100' }],
      hint: 'Replace the whole print with `print(f"Balance: {balance}")`.',
      solution: 'balance = 100\nprint(f"Balance: {balance}")\n',
    },
    {
      kind: 'create',
      prompt: 'With `owner = "Sam"`, `balance = 100` and `spent = 42.5`, print `Sam: 100` on the first line and `Remaining: 57.5` on the second.',
      language: 'python',
      starter: 'owner = "Sam"\nbalance = 100\nspent = 42.5\n',
      tests: [{ description: 'Two formatted lines', expectedStdout: 'Sam: 100\nRemaining: 57.5' }],
      solution: 'owner = "Sam"\nbalance = 100\nspent = 42.5\nprint(f"{owner}: {balance}")\nprint(f"Remaining: {balance - spent}")\n',
      projectNote: 'Ledger v0.0: output is now formatted from values instead of typed by hand.',
    },
  ],
};

const l14: Lesson = {
  id: 'py-1-4',
  title: 'Asking the user',
  objective: 'Read input, convert it to a number, and use it.',
  minutes: 18,
  lexicon: [
    { id: 'py.input', term: 'input()', kind: 'builtin', meaning: 'Wait for the user to type a line and press Enter. Gives you that line as text (str), always.', example: 'name = input()' },
    { id: 'py.intconv', term: 'int(text)', kind: 'builtin', meaning: 'Turn text that looks like a whole number into an int. Fails loudly if the text is not a number.', example: 'amount = int(input())' },
    { id: 'py.floatconv', term: 'float(text)', kind: 'builtin', meaning: 'Turn text into a float.', example: 'price = float("42.5")' },
    { id: 'py.prompt-then-read', term: 'print(question) / input()', kind: 'pattern', meaning: 'Ask, then read. input("...") can also show the question itself, on the same line as the answer.', example: 'print("Amount?")\namount = int(input())' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Input is always text',
      body: `\`input()\` pauses the program, waits for the user to type a line, and gives you that line.

The most common early mistake: **input gives you text**, even if the user typed digits. \`"7" + 1\` is an error. Convert first: \`int("7")\` is the number 7.

Pattern: ask with \`print\`, read with \`input\`, convert with \`int\` or \`float\`, then use.

(You may also write \`input("Amount? ")\`, which shows the question on the same line as the answer. In this app's tests we keep the question on its own line so output stays predictable.)`,
      example: {
        language: 'python',
        source: 'print("How much did you receive?")\nreceived = input()\nbalance = int(received)\nprint(f"Balance: {balance}")',
        labels: [
          { lines: [1, 1], label: 'Ask.' },
          { lines: [2, 2], label: 'Read one line of text.' },
          { lines: [3, 3], label: 'Convert the text to an int.' },
          { lines: [4, 4], label: 'Use it.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The user types `7` and presses Enter. What happens?',
      code: { language: 'python', source: 'age = input()\nprint(age + 1)' },
      choices: ['8', '71', 'An error: cannot add text and a number', '7 1'],
      answer: 'An error: cannot add text and a number',
      explanation: '`input()` returned the text "7". Text plus an int is a TypeError. `int(age) + 1` would give 8; `age + "1"` would give "71".',
    },
    {
      kind: 'parsons',
      prompt: 'Ask for an amount, read it, convert it, and print the balance.',
      language: 'python',
      indentation: false,
      solution: ['print("Amount?")', 'text = input()', 'amount = int(text)', 'print(f"Balance: {amount}")'],
      distractors: ['amount = input(int())', 'text = input'],
      explanation: '`input` must be *called* with parentheses, and the conversion wraps the text, not the other way round.',
    },
    {
      kind: 'cloze',
      prompt: 'The user types `40`. Complete so the program prints `Balance: 140`.',
      language: 'python',
      template: 'balance = 100\nprint("Amount?")\namount = {{conv}}(input())\nprint(f"Balance: {balance {{op}} amount}")',
      blanks: [
        { id: 'conv', answers: ['int'], hint: 'convert text to a whole number' },
        { id: 'op', answers: ['+'] },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program reads one number. Change it to read **two** numbers (one per line) and print their total as `Total: 15` when the user types 10 then 5.',
      language: 'python',
      starter: 'print("Number?")\na = int(input())\nprint(f"Total: {a}")\n',
      tests: [
        { description: '10 and 5', stdin: '10\n5', expectedStdout: 'Number?\nTotal: 15' },
        { description: '3 and 4', stdin: '3\n4', expectedStdout: 'Number?\nTotal: 7' },
      ],
      hint: 'Read a second value into a second name, then print `a + b`.',
      solution: 'print("Number?")\na = int(input())\nb = int(input())\nprint(f"Total: {a + b}")\n',
    },
    {
      kind: 'create',
      prompt: 'Ledger v0.1: print `Name?`, read the owner; print `Starting balance?`, read a whole number. Then print `<name>\'s ledger` and `Balance: <number>`.',
      language: 'python',
      tests: [
        { description: 'Sam with 100', stdin: 'Sam\n100', expectedStdout: "Name?\nStarting balance?\nSam's ledger\nBalance: 100" },
        { description: 'Ada with 0', stdin: 'Ada\n0', expectedStdout: "Name?\nStarting balance?\nAda's ledger\nBalance: 0" },
      ],
      hint: "Inside double quotes an apostrophe is fine: f\"{owner}'s ledger\".",
      solution: 'print("Name?")\nowner = input()\nprint("Starting balance?")\nbalance = int(input())\nprint(f"{owner}\'s ledger")\nprint(f"Balance: {balance}")\n',
      projectNote: 'Ledger v0.1: the program talks to its user.',
    },
  ],
};

const l15: Lesson = {
  id: 'py-1-5',
  title: 'Project: Ledger v0.1',
  objective: 'Assemble everything from this module into one working program.',
  minutes: 15,
  lexicon: [
    { id: 'py.plan', term: 'plan before code', kind: 'concept', meaning: 'Write the steps of a program in plain language first (ask, read, convert, compute, show). Then translate each step into one or two lines.', example: '# 1 ask  2 read  3 convert  4 compute  5 show', analogy: 'Outlining a paragraph before writing it. The outline is the subgoal labels you have been reading.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The whole program, labelled',
      body: `You have met everything this program needs. Read it as a plan: each label is a **subgoal**. When you write programs yourself, write the labels first, as comments, then fill in the code under each.`,
      example: {
        language: 'python',
        source: '# Ledger v0.1\nprint("Name?")\nowner = input()\nprint("Starting balance?")\nbalance = int(input())\nprint("First amount received?")\nreceived = int(input())\nbalance = balance + received\nprint(f"{owner}\'s ledger")\nprint(f"Balance: {balance}")',
        labels: [
          { lines: [2, 3], label: 'Ask and read the owner (text).' },
          { lines: [4, 5], label: 'Ask and read the balance, converted to int.' },
          { lines: [6, 7], label: 'Ask and read an amount, converted to int.' },
          { lines: [8, 8], label: 'Update the balance using its old value.' },
          { lines: [9, 10], label: 'Show the result with f-strings.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The user types `Kim`, `50`, then `25`. What is the **last** line printed?',
      code: { language: 'python', source: 'print("Name?")\nowner = input()\nprint("Starting balance?")\nbalance = int(input())\nprint("First amount received?")\nreceived = int(input())\nbalance = balance + received\nprint(f"{owner}\'s ledger")\nprint(f"Balance: {balance}")' },
      choices: ['Balance: 75', 'Balance: 5025', 'Balance: 50', "Kim's ledger"],
      answer: 'Balance: 75',
      explanation: 'Both inputs were converted with `int`, so `+` adds: 50 + 25 = 75. Without the conversions it would have joined the text into "5025".',
    },
    {
      kind: 'parsons',
      prompt: 'Arrange the full program. Order matters: you cannot use a name before it exists.',
      language: 'python',
      indentation: false,
      solution: ['print("Name?")', 'owner = input()', 'print("Starting balance?")', 'balance = int(input())', 'print(f"{owner}\'s ledger")', 'print(f"Balance: {balance}")'],
      distractors: ['balance = input(int())'],
      explanation: 'Names must be created (by `=`) before they are used in a later line.',
    },
    {
      kind: 'create',
      prompt: 'Write Ledger v0.1 from scratch. Prompts, in order: `Name?`, `Starting balance?`, `First amount received?`. Then print `<name>\'s ledger` and `Balance: <starting + received>`.',
      language: 'python',
      tests: [
        { description: 'Kim, 50, 25', stdin: 'Kim\n50\n25', expectedStdout: "Name?\nStarting balance?\nFirst amount received?\nKim's ledger\nBalance: 75" },
        { description: 'Sam, 0, 300', stdin: 'Sam\n0\n300', expectedStdout: "Name?\nStarting balance?\nFirst amount received?\nSam's ledger\nBalance: 300" },
      ],
      hint: 'Write the five subgoal labels as comments first, then one or two lines under each.',
      solution: 'print("Name?")\nowner = input()\nprint("Starting balance?")\nbalance = int(input())\nprint("First amount received?")\nreceived = int(input())\nbalance = balance + received\nprint(f"{owner}\'s ledger")\nprint(f"Balance: {balance}")\n',
      projectNote: 'Ledger v0.1 complete: it asks, remembers, computes and reports.',
    },
  ],
};

export const m1: Module = { id: 'py-m1', title: 'Saying things', goal: 'Print, name values, format output, and read input.', projectMilestone: 'Ledger v0.1: asks for a name and a balance and reports them.', status: 'available', lessons: [l11, l12, l13, l14, l15] };
