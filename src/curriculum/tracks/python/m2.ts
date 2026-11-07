import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 2: Deciding                                                 */
/* ------------------------------------------------------------------ */

const l21: Lesson = {
  id: 'py-2-1',
  title: 'True or false',
  objective: 'Compare values and combine conditions.',
  minutes: 15,
  lexicon: [
    { id: 'py.bool', term: 'True / False', kind: 'concept', meaning: 'The two boolean values. Every comparison produces one of them.', example: 'print(3 > 2)   # True' },
    { id: 'py.eqeq', term: '==', kind: 'operator', meaning: 'Asks "are these equal?" and gives True or False. Two signs, unlike the naming =.', example: 'print(balance == 0)', analogy: 'A question ("is x 5?"), where single = is a command ("let x be 5").' },
    { id: 'py.compare', term: '<  >  <=  >=  !=', kind: 'operator', meaning: 'Less, greater, less-or-equal, greater-or-equal, not-equal. Each gives True or False.', example: 'amount < 0' },
    { id: 'py.andor', term: 'and / or / not', kind: 'keyword', meaning: 'Combine conditions: `and` needs both true, `or` needs at least one, `not` flips.', example: 'amount > 0 and amount < 1000', analogy: 'Same as in English, with one trap: "x > 0 and < 10" is not a sentence; both sides must be complete comparisons.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Questions that answer True or False',
      body: `Decisions need questions. In Python a question is a **comparison**, and its answer is one of two values: \`True\` or \`False\`.

\`==\` asks "are these equal?". It has two signs, because the single \`=\` is already taken for naming.

Comparisons can be combined with \`and\`, \`or\` and \`not\`, which mean what they mean in English. The trap: each side of \`and\`/\`or\` must be a complete comparison. \`amount > 0 and amount < 100\`, not \`amount > 0 and < 100\`.`,
      example: {
        language: 'python',
        source: 'amount = -20\nprint(amount < 0)\nprint(amount == 0)\nprint(amount < 0 or amount > 1000)\nprint(not amount < 0)',
        labels: [
          { lines: [2, 2], label: 'True: -20 is less than 0.' },
          { lines: [3, 3], label: 'False: a question, not a naming.' },
          { lines: [4, 4], label: 'True: or needs only one side.' },
          { lines: [5, 5], label: 'False: not flips True.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'balance = 100\nprint(balance >= 100 and balance != 0)' },
      choices: ['True', 'False', '100', 'an error'],
      answer: 'True',
      explanation: '`balance >= 100` is True (equal counts), `balance != 0` is True, and `and` of two Trues is True.',
    },
    {
      kind: 'parsons',
      prompt: 'Print whether an amount is a valid expense: negative but not below -500.',
      language: 'python',
      indentation: false,
      solution: ['amount = -120', 'valid = amount < 0 and amount >= -500', 'print(valid)'],
      distractors: ['valid = amount < 0 and >= -500', 'valid = amount = -120'],
      explanation: 'Both sides of `and` must be full comparisons, and `=` cannot ask a question.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program prints `True` when `balance` is exactly 0.',
      language: 'python',
      template: 'balance = 0\nprint(balance {{op}} 0)',
      blanks: [{ id: 'op', answers: ['=='], hint: 'the question form of equals' }],
    },
    {
      kind: 'modify',
      prompt: 'Change the condition so that `big` is True only when the amount is **greater than 1000 or less than -1000**. Expected output: `True` then `False`.',
      language: 'python',
      starter: 'amount = -2000\nbig = amount > 1000\nprint(big)\namount = 999\nbig = amount > 1000\nprint(big)\n',
      tests: [{ description: '-2000 is big, 999 is not', expectedStdout: 'True\nFalse' }],
      hint: 'Use `or` with a second comparison. Both lines that compute `big` need the change.',
      solution: 'amount = -2000\nbig = amount > 1000 or amount < -1000\nprint(big)\namount = 999\nbig = amount > 1000 or amount < -1000\nprint(big)\n',
    },
    {
      kind: 'create',
      prompt: 'Read a whole number from input. Print `True` if it is between 1 and 100 inclusive, otherwise `False`.',
      language: 'python',
      tests: [
        { description: '50', stdin: '50', expectedStdout: 'True' },
        { description: '100', stdin: '100', expectedStdout: 'True' },
        { description: '0', stdin: '0', expectedStdout: 'False' },
        { description: '101', stdin: '101', expectedStdout: 'False' },
      ],
      solution: 'n = int(input())\nprint(n >= 1 and n <= 100)\n',
      projectNote: 'The ledger will use conditions like this to validate amounts.',
    },
  ],
};

const l22: Lesson = {
  id: 'py-2-2',
  title: 'If this, then that',
  objective: 'Run a block of code only when a condition is true.',
  minutes: 20,
  lexicon: [
    { id: 'py.if', term: 'if condition:', kind: 'keyword', meaning: 'Run the indented block below only when the condition is True.', example: 'if amount < 0:\n    print("expense")', analogy: 'A conditional sentence. The colon is the comma in "If it rains, we stay in".' },
    { id: 'py.else', term: 'else:', kind: 'keyword', meaning: 'The block that runs when the if-condition was False. Must follow an if at the same indentation.', example: 'if amount < 0:\n    print("expense")\nelse:\n    print("income")' },
    { id: 'py.colon', term: ':', kind: 'punctuation', meaning: 'Ends a line that introduces a block. The block that follows must be indented.', example: 'if ready:', analogy: 'The colon announces "here comes the body"; it is grammar, not decoration.' },
    { id: 'py.indent', term: 'indentation (4 spaces)', kind: 'concept', meaning: 'Lines indented under a block-introducing line belong to that block. Python uses the indentation itself as grammar.', example: 'if x:\n    inside\noutside', analogy: 'Paragraph structure: in English indentation is a hint; in Python it is the law.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Blocks: the grammar of if',
      body: `So far every line ran. Now some lines will run only sometimes.

\`if\` takes a condition, then a **colon**, then an **indented block**: every line indented under it belongs to it. Indentation is not style in Python; it is grammar. Four spaces is the convention.

\`else:\` catches the other case. It lines up with its \`if\`.

When the block ends (the indentation returns to the left), the program continues normally.`,
      example: {
        language: 'python',
        source: 'amount = -45\nif amount < 0:\n    print("expense")\n    balance_change = amount\nelse:\n    print("income")\n    balance_change = amount\nprint("done")',
        labels: [
          { lines: [2, 2], label: 'The question. Note the colon.' },
          { lines: [3, 4], label: 'Runs only if the answer is True. Indented 4 spaces.' },
          { lines: [5, 7], label: 'Runs only if the answer is False.' },
          { lines: [8, 8], label: 'Back at the left margin: runs always.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'balance = 10\nif balance > 50:\n    print("rich")\nprint("checked")' },
      choices: ['checked', 'rich\nchecked', 'rich', 'nothing'],
      answer: 'checked',
      explanation: 'The condition is False, so the indented line is skipped. `print("checked")` is not indented, so it is outside the if and always runs.',
    },
    {
      kind: 'parsons',
      prompt: 'Print `expense` if the amount is negative, otherwise `income`. Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['amount = -30', 'if amount < 0:', '    print("expense")', 'else:', '    print("income")'],
      distractors: ['else amount >= 0:'],
      explanation: '`else` takes no condition. Its block and the if-block are each indented one level.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the if/else so that a zero amount prints `nothing happened` and anything else prints `recorded`.',
      language: 'python',
      template: 'amount = 0\n{{kw}} amount == 0{{c1}}\n    print("nothing happened")\n{{kw2}}:\n    print("recorded")',
      blanks: [
        { id: 'kw', answers: ['if'] },
        { id: 'c1', answers: [':'], hint: 'what ends a block-introducing line?' },
        { id: 'kw2', answers: ['else'] },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program always adds the amount. Change it so that when the amount is negative it prints `expense` before updating, and when it is not it prints `income`. The balance line stays.',
      language: 'python',
      starter: 'balance = 100\namount = int(input())\nbalance = balance + amount\nprint(f"Balance: {balance}")\n',
      tests: [
        { description: '-40', stdin: '-40', expectedStdout: 'expense\nBalance: 60' },
        { description: '25', stdin: '25', expectedStdout: 'income\nBalance: 125' },
      ],
      hint: 'Put an if/else between the input and the update. Only the prints go inside the blocks.',
      solution: 'balance = 100\namount = int(input())\nif amount < 0:\n    print("expense")\nelse:\n    print("income")\nbalance = balance + amount\nprint(f"Balance: {balance}")\n',
    },
    {
      kind: 'create',
      prompt: 'Read a whole-number balance. If it is below zero print `overdrawn`, otherwise print `ok`. Then always print `Balance: <value>`.',
      language: 'python',
      tests: [
        { description: '-5', stdin: '-5', expectedStdout: 'overdrawn\nBalance: -5' },
        { description: '0', stdin: '0', expectedStdout: 'ok\nBalance: 0' },
      ],
      solution: 'balance = int(input())\nif balance < 0:\n    print("overdrawn")\nelse:\n    print("ok")\nprint(f"Balance: {balance}")\n',
      projectNote: 'The ledger can now warn its owner.',
    },
  ],
};

const l23: Lesson = {
  id: 'py-2-3',
  title: 'Several branches',
  objective: 'Choose among more than two outcomes with elif.',
  minutes: 18,
  lexicon: [
    { id: 'py.elif', term: 'elif condition:', kind: 'keyword', meaning: 'Another question, asked only if every question above it was False. Exactly one block of an if/elif/else chain runs.', example: 'if x < 0:\n    ...\nelif x == 0:\n    ...\nelse:\n    ...', analogy: '"Otherwise, if…". A chain reads top to bottom and stops at the first true branch.' },
    { id: 'py.chain-order', term: 'order of branches', kind: 'concept', meaning: 'Because the chain stops at the first True, put the most specific condition first.', example: 'if n > 1000:\n    print("huge")\nelif n > 100:\n    print("large")' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A chain of questions',
      body: `\`elif\` ("else if") adds more branches. Python asks each question in order and runs **only the first block whose condition is True**. The remaining questions are not even asked. \`else\` at the end catches everything left.

Because the chain stops early, order matters: a broad condition placed first swallows the narrower cases after it.`,
      example: {
        language: 'python',
        source: 'amount = 0\nif amount < 0:\n    kind = "expense"\nelif amount == 0:\n    kind = "nothing"\nelse:\n    kind = "income"\nprint(kind)',
        labels: [
          { lines: [2, 3], label: 'First question.' },
          { lines: [4, 5], label: 'Asked only if the first was False.' },
          { lines: [6, 7], label: 'Everything else.' },
          { lines: [8, 8], label: 'Exactly one branch set kind, so this is safe.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'n = 500\nif n > 100:\n    print("large")\nelif n > 1000:\n    print("huge")\nelse:\n    print("small")' },
      choices: ['large', 'huge', 'large\nhuge', 'small'],
      answer: 'large',
      explanation: 'The first condition is True, so its block runs and the chain stops. The order is wrong for the author\'s intent, but Python does exactly what it says.',
    },
    {
      kind: 'parsons',
      prompt: 'Classify a temperature: below 0 `freezing`, below 20 `cool`, otherwise `warm`. Set indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['t = 15', 'if t < 0:', '    print("freezing")', 'elif t < 20:', '    print("cool")', 'else:', '    print("warm")'],
      distractors: ['else if t < 20:'],
      explanation: 'Python spells it `elif`. The branches line up with the `if`.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the chain so that it prints `large` for 500.',
      language: 'python',
      template: 'n = 500\nif n > 1000:\n    print("huge")\n{{kw}} n > 100:\n    print("large")\n{{kw2}}:\n    print("small")',
      blanks: [{ id: 'kw', answers: ['elif'] }, { id: 'kw2', answers: ['else'] }],
    },
    {
      kind: 'modify',
      prompt: 'Reorder the conditions so the program prints `huge` for 5000, `large` for 500 and `small` for 5.',
      language: 'python',
      starter: 'n = int(input())\nif n > 100:\n    print("large")\nelif n > 1000:\n    print("huge")\nelse:\n    print("small")\n',
      tests: [
        { description: '5000', stdin: '5000', expectedStdout: 'huge' },
        { description: '500', stdin: '500', expectedStdout: 'large' },
        { description: '5', stdin: '5', expectedStdout: 'small' },
      ],
      hint: 'The narrowest condition (> 1000) must be asked first.',
      solution: 'n = int(input())\nif n > 1000:\n    print("huge")\nelif n > 100:\n    print("large")\nelse:\n    print("small")\n',
    },
    {
      kind: 'create',
      prompt: 'Read an amount. Print `expense` if negative, `nothing` if zero, `income` if positive.',
      language: 'python',
      tests: [
        { description: '-1', stdin: '-1', expectedStdout: 'expense' },
        { description: '0', stdin: '0', expectedStdout: 'nothing' },
        { description: '9', stdin: '9', expectedStdout: 'income' },
      ],
      solution: 'amount = int(input())\nif amount < 0:\n    print("expense")\nelif amount == 0:\n    print("nothing")\nelse:\n    print("income")\n',
      projectNote: 'The ledger can classify an entry.',
    },
  ],
};

const l24: Lesson = {
  id: 'py-2-4',
  title: 'Project: Ledger v0.2',
  objective: 'Classify an entry, update the balance, and warn when it goes negative.',
  minutes: 20,
  lexicon: [
    { id: 'py.nested-if', term: 'if inside if', kind: 'pattern', meaning: 'A block can contain another if. Each level is indented one more step.', example: 'if amount < 0:\n    if balance + amount < 0:\n        print("warning")' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Nesting and the full plan',
      body: `Blocks can contain blocks. An \`if\` inside an \`if\` is indented one level deeper (8 spaces). Read the labels: they are the plan for Ledger v0.2.`,
      example: {
        language: 'python',
        source: 'print("Balance?")\nbalance = int(input())\nprint("Amount?")\namount = int(input())\nif amount < 0:\n    print("expense")\n    if balance + amount < 0:\n        print("warning: overdrawn")\nelif amount == 0:\n    print("nothing")\nelse:\n    print("income")\nbalance = balance + amount\nprint(f"Balance: {balance}")',
        labels: [
          { lines: [1, 4], label: 'Ask and read both numbers.' },
          { lines: [5, 8], label: 'Expense branch, with a nested check that runs only for expenses.' },
          { lines: [9, 12], label: 'Other branches.' },
          { lines: [13, 14], label: 'Always: update and report.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The user types `30` then `-50`. Which lines are printed after the two questions?',
      code: { language: 'python', source: 'print("Balance?")\nbalance = int(input())\nprint("Amount?")\namount = int(input())\nif amount < 0:\n    print("expense")\n    if balance + amount < 0:\n        print("warning: overdrawn")\nelif amount == 0:\n    print("nothing")\nelse:\n    print("income")\nbalance = balance + amount\nprint(f"Balance: {balance}")' },
      choices: ['expense\nwarning: overdrawn\nBalance: -20', 'expense\nBalance: -20', 'warning: overdrawn\nBalance: -20', 'income\nBalance: 80'],
      answer: 'expense\nwarning: overdrawn\nBalance: -20',
      explanation: '-50 is negative, so the expense block runs; inside it, 30 + (-50) = -20 < 0, so the warning runs too. Then the always-run lines update and report.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the expense branch with its nested warning. Set indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['if amount < 0:', '    print("expense")', '    if balance + amount < 0:', '        print("warning: overdrawn")', 'balance = balance + amount'],
      distractors: ['    balance = balance + amount'],
      explanation: 'The update must run for every amount, so it belongs at the left margin, outside the if.',
    },
    {
      kind: 'create',
      prompt: 'Write Ledger v0.2 exactly as planned: prompts `Balance?` and `Amount?`; then `expense` / `nothing` / `income`; for an expense that makes the balance negative also print `warning: overdrawn`; finally `Balance: <new>`.',
      language: 'python',
      tests: [
        { description: '30, -50', stdin: '30\n-50', expectedStdout: 'Balance?\nAmount?\nexpense\nwarning: overdrawn\nBalance: -20' },
        { description: '100, -40', stdin: '100\n-40', expectedStdout: 'Balance?\nAmount?\nexpense\nBalance: 60' },
        { description: '100, 0', stdin: '100\n0', expectedStdout: 'Balance?\nAmount?\nnothing\nBalance: 100' },
        { description: '100, 15', stdin: '100\n15', expectedStdout: 'Balance?\nAmount?\nincome\nBalance: 115' },
      ],
      hint: 'Start from the labels in the concept step and write one chunk at a time, running the tests as you go.',
      solution: 'print("Balance?")\nbalance = int(input())\nprint("Amount?")\namount = int(input())\nif amount < 0:\n    print("expense")\n    if balance + amount < 0:\n        print("warning: overdrawn")\nelif amount == 0:\n    print("nothing")\nelse:\n    print("income")\nbalance = balance + amount\nprint(f"Balance: {balance}")\n',
      projectNote: 'Ledger v0.2 complete: it classifies, updates and warns.',
    },
  ],
};

export const m2: Module = { id: 'py-m2', title: 'Deciding', goal: 'Comparisons, booleans, if / elif / else, nesting.', projectMilestone: 'Ledger v0.2: classifies an entry and warns about overdrafts.', status: 'available', lessons: [l21, l22, l23, l24] };
