import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 3: Repeating                                                */
/* ------------------------------------------------------------------ */

const l31: Lesson = {
  id: 'py-3-1',
  title: 'Again, while it holds',
  objective: 'Repeat a block while a condition stays true.',
  minutes: 18,
  lexicon: [
    { id: 'py.3.while', term: 'while condition:', kind: 'keyword', meaning: 'Ask the condition; if True run the indented block, then jump back and ask again. Stops the first time the answer is False.', example: 'n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1', analogy: '"While the kettle is cold, keep heating": the test is re-checked every round, not once. Breaks: English "while" can also mean "at the same time"; Python\'s never does.' },
    { id: 'py.3.loop-test', term: 'the re-asked test', kind: 'concept', meaning: 'The condition of a loop is evaluated before every pass, with the current values of the names. Changing those names inside the body is how the loop ends.', example: 'while count < 3:   # asked 4 times for 3 passes' },
    { id: 'py.3.counter', term: 'counter', kind: 'pattern', meaning: 'A name that starts at a known value and moves one step each pass; the loop test compares it to a limit.', example: 'count = 0\nwhile count < 5:\n    count = count + 1', analogy: 'Tally marks on a wall. Breaks: a tally only goes up by one; a counter can count down or step by 10.' },
    { id: 'py.3.infinite', term: 'infinite loop', kind: 'concept', meaning: 'A loop whose test never becomes False, usually because the body forgot to change what the test looks at. The program never reaches the lines after it.', example: 'n = 1\nwhile n > 0:\n    print(n)   # n never changes' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A question asked again and again',
      body: `\`if\` asks a question once. \`while\` asks it **again after every pass** through its block.

The machine does this: evaluate the condition; if True, run the indented block, then **jump back** to the \`while\` line and evaluate it again; if False, skip past the block and carry on. Nothing inside the block is special: it is ordinary code that happens to run several times.

Because the test is re-asked with the *current* values, the block must change something the test looks at. The usual tool is a **counter**: start it, test it, move it one step every pass.

Forget the step and the test never turns False: an **infinite loop**. The program never reaches the lines after it. In this app the runner stops any program after 8 seconds, so an infinite loop shows up as a timeout, not as a crash.`,
      example: {
        language: 'python',
        source: 'count = 1\nwhile count <= 3:\n    print(f"Entry {count}")\n    count = count + 1\nprint("done")',
        labels: [
          { lines: [1, 1], label: 'Start the counter.' },
          { lines: [2, 2], label: 'The test, asked before every pass: 1, 2 and 3 pass; 4 fails.' },
          { lines: [3, 3], label: 'The body: runs once per pass.' },
          { lines: [4, 4], label: 'Move toward the exit. Without this line the loop never ends.' },
          { lines: [5, 5], label: 'Back at the margin: runs once, after the test fails.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed? Trace the test before every pass.',
      code: { language: 'python', source: 'n = 10\nwhile n > 0:\n    print(n)\n    n = n - 4\nprint("end")' },
      choices: ['10\n6\n2\nend', '10\n6\n2\n-2\nend', '10\n6\nend', 'runs forever'],
      answer: '10\n6\n2\nend',
      explanation: 'The test passes for 10, 6 and 2, so each is printed. After printing 2, n becomes -2; the test `-2 > 0` is False, so the body is skipped and `end` runs. -2 is never printed because the print sits *inside* the block, after a test it failed.',
    },
    {
      kind: 'parsons',
      prompt: 'Print the numbers 1 to 5, one per line, with a while loop. Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['n = 1', 'while n <= 5:', '    print(n)', '    n = n + 1'],
      distractors: ['while n <= 5', 'n + 1'],
      explanation: 'The while line needs its colon, like if. `n + 1` computes a value and throws it away; only `n = n + 1` moves the counter.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the loop so that `tick` is printed exactly 3 times.',
      language: 'python',
      template: 'count = 0\n{{kw}} count {{op}} 3:\n    print("tick")\n    count = count + {{step}}',
      blanks: [
        { id: 'kw', answers: ['while'] },
        { id: 'op', answers: ['<', '!='], hint: 'count takes the values 0, 1, 2 inside the loop and 3 should stop it' },
        { id: 'step', answers: ['1'], hint: 'one step per pass' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program reads two amounts and prints the balance once at the end. Change it so it reads **three** amounts and prints `Balance: <n>` after **each** one (inside the loop) instead of at the end.',
      language: 'python',
      starter: 'balance = 100\ncount = 0\nwhile count < 2:\n    print("Amount?")\n    amount = int(input())\n    balance = balance + amount\n    count = count + 1\nprint(f"Balance: {balance}")\n',
      tests: [
        { description: '10, 20, 30', stdin: '10\n20\n30', expectedStdout: 'Amount?\nBalance: 110\nAmount?\nBalance: 130\nAmount?\nBalance: 160' },
        { description: 'into the negative', stdin: '-50\n-60\n5', expectedStdout: 'Amount?\nBalance: 50\nAmount?\nBalance: -10\nAmount?\nBalance: -5' },
      ],
      hint: 'Two changes: the limit in the test, and the indentation of the last print so it belongs to the block.',
      solution: 'balance = 100\ncount = 0\nwhile count < 3:\n    print("Amount?")\n    amount = int(input())\n    balance = balance + amount\n    count = count + 1\n    print(f"Balance: {balance}")\n',
    },
    {
      kind: 'create',
      prompt: 'Print `Balance?` and read a whole number. Print `How many?` and read a whole number n. Then, n times: print `Amount?`, read a whole number and add it to the balance. Finally print `Balance: <total>`. Use a while loop with a counter.',
      language: 'python',
      tests: [
        { description: 'three amounts', stdin: '100\n3\n10\n-30\n5', expectedStdout: 'Balance?\nHow many?\nAmount?\nAmount?\nAmount?\nBalance: 85' },
        { description: 'zero amounts', stdin: '50\n0', expectedStdout: 'Balance?\nHow many?\nBalance: 50' },
        { description: 'one amount, overdrawn', stdin: '10\n1\n-25', expectedStdout: 'Balance?\nHow many?\nAmount?\nBalance: -15' },
      ],
      hint: 'Setup: a counter at 0. Test: counter < n. Body: ask, read, add. Step: counter + 1. The final print is outside the loop.',
      solution: 'print("Balance?")\nbalance = int(input())\nprint("How many?")\nn = int(input())\ncount = 0\nwhile count < n:\n    print("Amount?")\n    amount = int(input())\n    balance = balance + amount\n    count = count + 1\nprint(f"Balance: {balance}")\n',
      projectNote: 'The ledger takes several entries in one run. It still has to be told how many in advance; the next lessons remove that limit.',
    },
  ],
};

const l32: Lesson = {
  id: 'py-3-2',
  title: 'Counting with for',
  objective: 'Repeat a block a known number of times with for and range.',
  minutes: 18,
  lexicon: [
    { id: 'py.3.for', term: 'for name in ...:', kind: 'keyword', meaning: 'Run the block once for each item of the sequence after `in`, with `name` attached to the current item.', example: 'for k in range(3):\n    print(k)', analogy: '"For each guest, pour a drink." Breaks: English does not promise an order; Python always goes first to last.' },
    { id: 'py.3.range', term: 'range(n)', kind: 'builtin', meaning: 'The whole numbers from 0 up to but not including n: n numbers in total, the last one n - 1.', example: 'for k in range(3):\n    print(k)   # 0 1 2' },
    { id: 'py.3.range-ab', term: 'range(a, b, step)', kind: 'pattern', meaning: 'Start at a, stop before b, move by step. The step defaults to 1 and may be negative to count down.', example: 'range(1, 4)        # 1 2 3\nrange(10, 0, -5)   # 10 5' },
    { id: 'py.3.loop-var', term: 'loop variable', kind: 'concept', meaning: 'The name after `for`. At the start of each pass the loop re-attaches it to the next item; you read it, you do not move it yourself.', example: 'for n in range(1, 4):\n    print(f"Entry {n}")' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'When you know how many',
      body: `When you know **how many** passes you want before the loop starts, \`for\` with \`range\` says so directly and takes the counter off your hands.

\`range(n)\` produces the numbers 0, 1, ..., n - 1: that is n numbers, starting from zero, and n itself is **not** included. \`range(a, b)\` starts at a and stops before b. \`range(a, b, step)\` moves by step, which may be negative.

The name after \`for\` is the **loop variable**. At the start of each pass Python attaches it to the next number; you only read it. There is no test to write and no counter to move, so a \`for\` loop cannot forget its step.

Use \`for\` when the number of passes is known up front. Use \`while\` when you stop on something you discover along the way, such as the user typing a word.`,
      example: {
        language: 'python',
        source: 'for k in range(3):\n    print(f"Entry {k}")\nfor n in range(1, 4):\n    print(n)\nfor n in range(10, 0, -5):\n    print(n)\nprint("done")',
        labels: [
          { lines: [1, 2], label: 'Three passes, k = 0, 1, 2. Note it starts at zero.' },
          { lines: [3, 4], label: 'Prints 1, 2, 3: the stop value 4 is not included.' },
          { lines: [5, 6], label: 'Counts down: 10, 5. Stops before 0.' },
          { lines: [7, 7], label: 'Runs once, after the last loop finishes.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'total = 0\nfor k in range(2, 11, 4):\n    print(k)\n    total = total + k\nprint(total)' },
      choices: ['2\n6\n10\n18', '2\n6\n18', '2\n6\n10\n14\n32', '2\n4\n6\n8\n10\n30'],
      answer: '2\n6\n10\n18',
      explanation: 'The range starts at 2 and moves by 4: 2, 6, 10. The next value, 14, is not below 11, so it is never produced. The total of 2 + 6 + 10 is 18, printed once after the loop.',
    },
    {
      kind: 'parsons',
      prompt: 'Print `Entry 1`, `Entry 2`, `Entry 3`, then `end`. Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['for n in range(1, 4):', '    print(f"Entry {n}")', 'print("end")'],
      distractors: ['for n in range(1, 3):', 'for n in range(3):'],
      explanation: 'range stops *before* its second number, so 1 to 3 needs range(1, 4). range(3) would start at 0. `end` is printed once, so it sits outside the block.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the loop so it prints `10`, `20`, `30`, one per line.',
      language: 'python',
      template: '{{kw}} n in {{fn}}(10, {{stop}}, 10):\n    print(n)',
      blanks: [
        { id: 'kw', answers: ['for'] },
        { id: 'fn', answers: ['range'], hint: 'the builtin that produces a run of numbers' },
        { id: 'stop', answers: ['40', '31', '32', '33', '34', '35', '36', '37', '38', '39'], hint: 'the stop value is not included: anything from 31 to 40 works' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program numbers its prompts from 0 and reads only three amounts. Change it so it reads **four** amounts with the prompts `Amount 1?` to `Amount 4?`, numbered from 1.',
      language: 'python',
      starter: 'print("Balance?")\nbalance = int(input())\nfor k in range(3):\n    print(f"Amount {k}?")\n    amount = int(input())\n    balance = balance + amount\nprint(f"Balance: {balance}")\n',
      tests: [
        { description: 'four incomes', stdin: '100\n10\n20\n30\n40', expectedStdout: 'Balance?\nAmount 1?\nAmount 2?\nAmount 3?\nAmount 4?\nBalance: 200' },
        { description: 'four expenses from zero', stdin: '0\n-5\n-5\n-5\n-5', expectedStdout: 'Balance?\nAmount 1?\nAmount 2?\nAmount 3?\nAmount 4?\nBalance: -20' },
      ],
      hint: 'Change the range so the loop variable itself takes the values 1 to 4; then nothing else needs to change.',
      solution: 'print("Balance?")\nbalance = int(input())\nfor k in range(1, 5):\n    print(f"Amount {k}?")\n    amount = int(input())\n    balance = balance + amount\nprint(f"Balance: {balance}")\n',
    },
    {
      kind: 'create',
      prompt: 'Print `Balance?` and read a whole number. Print `How many?` and read n. Then for each entry k from 1 to n: print `Amount?`, read a whole number, add it to the balance, and print `Entry <k>: <balance>`. Finally print `Entries: <n>`.',
      language: 'python',
      tests: [
        { description: 'two entries', stdin: '100\n2\n-30\n50', expectedStdout: 'Balance?\nHow many?\nAmount?\nEntry 1: 70\nAmount?\nEntry 2: 120\nEntries: 2' },
        { description: 'no entries', stdin: '100\n0', expectedStdout: 'Balance?\nHow many?\nEntries: 0' },
        { description: 'three expenses, overdrawn', stdin: '20\n3\n-10\n-10\n-10', expectedStdout: 'Balance?\nHow many?\nAmount?\nEntry 1: 10\nAmount?\nEntry 2: 0\nAmount?\nEntry 3: -10\nEntries: 3' },
      ],
      hint: 'range(1, n + 1) gives exactly the numbers 1 to n.',
      solution: 'print("Balance?")\nbalance = int(input())\nprint("How many?")\nn = int(input())\nfor k in range(1, n + 1):\n    print("Amount?")\n    amount = int(input())\n    balance = balance + amount\n    print(f"Entry {k}: {balance}")\nprint(f"Entries: {n}")\n',
      projectNote: 'The ledger shows a running balance and numbers its entries. The count still comes from the user; v0.3 will count for itself.',
    },
  ],
};

const l33: Lesson = {
  id: 'py-3-3',
  title: 'Adding up until quit',
  objective: 'Accumulate a total and stop a loop on a sentinel word.',
  minutes: 20,
  lexicon: [
    { id: 'py.3.accumulator', term: 'total = total + x', kind: 'pattern', meaning: 'A name that starts at a neutral value (0 for sums) before the loop and absorbs one item per pass. After the loop it holds the sum of everything seen.', example: 'total = 0\nfor n in range(1, 4):\n    total = total + n\nprint(total)   # 6', analogy: 'A jar you drop coins into: start empty, add each coin, count at the end. Breaks: a jar is always there; forgetting `total = 0` before the loop is an error in Python.' },
    { id: 'py.3.sentinel', term: 'sentinel', kind: 'concept', meaning: 'A special input value, such as the word quit, that means "stop" rather than "here is more data". Check for it before converting the text to a number.', example: 'text = input()\nif text == "quit":\n    break\namount = int(text)' },
    { id: 'py.3.while-true', term: 'while True:', kind: 'pattern', meaning: 'A loop whose test is always True, so it ends only through `break`. Used when the exit is discovered in the middle of the body.', example: 'while True:\n    text = input()\n    if text == "quit":\n        break' },
    { id: 'py.3.break', term: 'break', kind: 'keyword', meaning: 'Leave the innermost loop at once. Execution continues at the first line after the loop.', example: 'if text == "quit":\n    break' },
    { id: 'py.3.continue', term: 'continue', kind: 'keyword', meaning: 'Skip the rest of this pass and jump straight back to the loop test (or to the next item of a for).', example: 'if amount == 0:\n    continue' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Accumulators and the word that stops',
      body: `Two patterns do most of the work in loops.

An **accumulator** is a name that starts at a neutral value before the loop and absorbs one item each pass: \`total = total + amount\`. Forget the line before the loop and the first pass has nothing to add to.

A **sentinel** is an input that means "stop", here the word \`quit\`. Since \`int("quit")\` is an error, read the line as text, compare it to the sentinel first, and convert only afterwards. The loop is written \`while True:\` and leaves through **\`break\`**, which jumps straight to the first line after the loop. **\`continue\`** jumps back to the test instead, skipping the rest of this pass.

A \`running = True\` flag with \`while running:\` also works. Prefer it when the test belongs at the top; prefer \`break\` when the exit sits mid-body, as here, where a flag would push the rest of the body into an \`else\`.`,
      example: {
        language: 'python',
        source: 'total = 0\ncount = 0\nwhile True:\n    print("Number (or quit)?")\n    text = input()\n    if text == "quit":\n        break\n    total = total + int(text)\n    count = count + 1\nprint(f"Total: {total}")\nprint(f"Count: {count}")',
        labels: [
          { lines: [1, 2], label: 'Two accumulators start at their neutral value.' },
          { lines: [3, 3], label: 'No real test here: the exit is inside the body.' },
          { lines: [4, 5], label: 'Ask, and read as text, not int: quit is not a number.' },
          { lines: [6, 7], label: 'The sentinel check. break jumps to line 10.' },
          { lines: [8, 9], label: 'Only real numbers reach here: convert and absorb.' },
          { lines: [10, 11], label: 'After the loop: the accumulators hold everything seen.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'total = 0\nfor n in range(1, 6):\n    if n == 3:\n        continue\n    if n == 5:\n        break\n    total = total + n\nprint(total)' },
      choices: ['7', '10', '12', '15'],
      answer: '7',
      explanation: 'n = 1 and 2 are added (total 3). n = 3 hits continue, so the add is skipped. n = 4 is added (total 7). n = 5 hits break, which ends the loop before the add. 15 would be the sum with neither; 12 skips only the 3; 10 would need the 3 but not the 5.',
    },
    {
      kind: 'parsons',
      prompt: 'Count how many words the user types before `quit`, then print the count. Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['count = 0', 'while True:', '    word = input()', '    if word == "quit":', '        break', '    count = count + 1', 'print(count)'],
      distractors: ['    if word == quit:', '    word = int(input())'],
      explanation: 'Without quotes, quit is a name that does not exist. Converting the input to int before the check would crash on the word quit. The count moves after the check, so quit is not counted.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the sentinel loop. It must stop on the word quit and otherwise add the number to the total.',
      language: 'python',
      template: 'total = 0\nwhile True:\n    print("Amount (or quit)?")\n    text = input()\n    if text == {{sentinel}}:\n        {{exit}}\n    total = total + {{conv}}(text)\nprint(f"Total: {total}")',
      blanks: [
        { id: 'sentinel', answers: ['"quit"', "'quit'"], hint: 'the word, as a string' },
        { id: 'exit', answers: ['break'], hint: 'the keyword that leaves the loop' },
        { id: 'conv', answers: ['int'], hint: 'text was checked; now make it a number' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Zero is not a real entry. Change the loop so that an amount of 0 prints `skipped` and is neither added nor counted. Use `continue`.',
      language: 'python',
      starter: 'total = 0\ncount = 0\nwhile True:\n    print("Amount (or quit)?")\n    text = input()\n    if text == "quit":\n        break\n    amount = int(text)\n    total = total + amount\n    count = count + 1\nprint(f"Entries: {count}")\nprint(f"Total: {total}")\n',
      tests: [
        { description: '10, 0, 5, quit', stdin: '10\n0\n5\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nskipped\nAmount (or quit)?\nAmount (or quit)?\nEntries: 2\nTotal: 15' },
        { description: 'quit at once', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nEntries: 0\nTotal: 0' },
        { description: 'only zeros', stdin: '0\n0\nquit', expectedStdout: 'Amount (or quit)?\nskipped\nAmount (or quit)?\nskipped\nAmount (or quit)?\nEntries: 0\nTotal: 0' },
      ],
      hint: 'Right after converting: `if amount == 0:` print skipped and continue. The lines below then run only for non-zero amounts.',
      solution: 'total = 0\ncount = 0\nwhile True:\n    print("Amount (or quit)?")\n    text = input()\n    if text == "quit":\n        break\n    amount = int(text)\n    if amount == 0:\n        print("skipped")\n        continue\n    total = total + amount\n    count = count + 1\nprint(f"Entries: {count}")\nprint(f"Total: {total}")\n',
    },
    {
      kind: 'create',
      prompt: 'Print `Balance?` and read a whole number. Then repeat: print `Amount (or quit)?` and read a line; if it is `quit`, stop; otherwise add the number to the balance. After the loop print `Balance: <n>`.',
      language: 'python',
      tests: [
        { description: 'quit at once', stdin: '100\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nBalance: 100' },
        { description: 'three amounts', stdin: '100\n-30\n50\n-20\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nBalance: 100' },
        { description: 'overdrawn', stdin: '10\n-25\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nAmount (or quit)?\nBalance: -15' },
      ],
      hint: 'Read as text, check for quit, then convert and add. The balance is the accumulator; it starts from the first input, not from 0.',
      solution: 'print("Balance?")\nbalance = int(input())\nwhile True:\n    print("Amount (or quit)?")\n    text = input()\n    if text == "quit":\n        break\n    balance = balance + int(text)\nprint(f"Balance: {balance}")\n',
      projectNote: 'The ledger no longer needs to be told how many entries are coming: the user ends the session with quit.',
    },
  ],
};

const l34: Lesson = {
  id: 'py-3-4',
  title: 'Loop patterns',
  objective: 'Count matches, track a best-so-far value, and nest one loop in another.',
  minutes: 20,
  lexicon: [
    { id: 'py.3.count-if', term: 'count the matches', kind: 'pattern', meaning: 'A counter that moves only inside an `if`: it counts the passes where the condition held.', example: 'expenses = 0\nfor k in range(n):\n    amount = int(input())\n    if amount < 0:\n        expenses = expenses + 1' },
    { id: 'py.3.best-so-far', term: 'best so far', kind: 'pattern', meaning: 'Keep the largest (or smallest) value seen and replace it when a better one arrives. Start it from a real value, usually the first item, not from 0.', example: 'if amount > largest:\n    largest = amount', analogy: 'Holding the record in a contest: the leader changes only when someone beats them. Breaks: a contest can start with no leader; a program must give the name a first value before the loop.' },
    { id: 'py.3.nested-loop', term: 'loop inside a loop', kind: 'pattern', meaning: 'The inner loop runs completely for every single pass of the outer loop. Its block is indented one more level.', example: 'for a in range(1, 3):\n    for b in range(1, 3):\n        print(a, b)' },
    { id: 'py.3.off-by-one', term: 'off-by-one', kind: 'concept', meaning: 'A loop that runs one time too many or too few, or a counter that ends one step past the last pass. Check the first value, the last value, and what the counter holds after the loop.', example: 'range(1, 10)   # 1 to 9, not 10' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Three shapes you will keep meeting',
      body: `**Counting matches**: a counter that moves only inside an \`if\`, so it counts the passes where the condition held.

**Best so far**: keep the largest value seen and replace it when a larger one arrives. The trap is the starting value. In the example \`largest\` starts at 0 because it means "largest income", so 0 honestly says "none". For a true maximum of any numbers, start from the first item instead; starting at 0 would report 0 for a run of all-negative amounts.

**Nested loops**: a loop inside a loop. The inner loop runs to completion for every single pass of the outer one, so 3 rows of 3 columns means 9 prints:

\`\`\`
for row in range(1, 4):
    for col in range(1, 4):
        print(f"{row} x {col} = {row * col}")
\`\`\`

And watch for **off-by-one** errors: check the first value, the last value, and what a counter holds *after* the loop.`,
      example: {
        language: 'python',
        source: 'print("How many?")\nn = int(input())\nexpenses = 0\nlargest = 0\nfor k in range(n):\n    print("Amount?")\n    amount = int(input())\n    if amount < 0:\n        expenses = expenses + 1\n    if amount > largest:\n        largest = amount\nprint(f"Expenses: {expenses}")\nprint(f"Largest income: {largest}")',
        labels: [
          { lines: [1, 2], label: 'How many amounts to read.' },
          { lines: [3, 4], label: 'Two results start at their neutral values.' },
          { lines: [5, 7], label: 'Read each amount.' },
          { lines: [8, 9], label: 'Count the matches: moves only for expenses.' },
          { lines: [10, 11], label: 'Best so far: replace when beaten.' },
          { lines: [12, 13], label: 'Report after the loop.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What are the two lines printed? Pay attention to the value of `n` when the loop ends.',
      code: { language: 'python', source: 'total = 0\nn = 1\nwhile n < 5:\n    total = total + n\n    n = n + 1\nprint(n)\nprint(total)' },
      choices: ['5\n10', '4\n10', '5\n15', '4\n6'],
      answer: '5\n10',
      explanation: 'The body runs for n = 1, 2, 3, 4 (four passes), so total is 1 + 2 + 3 + 4 = 10. But the step `n = n + 1` runs at the end of the fourth pass too, making n 5; only then does the test fail. After a loop, a counter is one step past the last value used inside it. That is the classic off-by-one.',
    },
    {
      kind: 'parsons',
      prompt: 'Print a 3 by 3 multiplication table, with a line of `---` after each row. Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['for a in range(1, 4):', '    for b in range(1, 4):', '        print(f"{a} x {b} = {a * b}")', '    print("---")'],
      distractors: ['for b in range(1, 3):', 'print(f"{a} x {b} = {a x b}")'],
      explanation: 'range(1, 3) stops at 2. Inside the braces, multiplication is `*`; `x` would be an unknown name. The `---` line sits at the outer level, so it prints once per row, not once per cell.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it counts how many of the n amounts are expenses (negative).',
      language: 'python',
      template: 'print("How many?")\nn = int(input())\nexpenses = {{init}}\nfor k in range({{limit}}):\n    print("Amount?")\n    amount = int(input())\n    if amount {{cmp}} 0:\n        expenses = expenses + 1\nprint(f"Expenses: {expenses}")',
      blanks: [
        { id: 'init', answers: ['0'], hint: 'nothing counted yet' },
        { id: 'limit', answers: ['n'], hint: 'one pass per amount' },
        { id: 'cmp', answers: ['<'], hint: 'an expense is below zero' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program finds the largest of n amounts. Extend it to also track the smallest and print `Smallest: <n>` after the `Largest` line.',
      language: 'python',
      starter: 'print("How many?")\nn = int(input())\nprint("Amount?")\nlargest = int(input())\nfor k in range(n - 1):\n    print("Amount?")\n    amount = int(input())\n    if amount > largest:\n        largest = amount\nprint(f"Largest: {largest}")\n',
      tests: [
        { description: '40, -70, 25', stdin: '3\n40\n-70\n25', expectedStdout: 'How many?\nAmount?\nAmount?\nAmount?\nLargest: 40\nSmallest: -70' },
        { description: 'a single amount is both', stdin: '1\n-5', expectedStdout: 'How many?\nAmount?\nLargest: -5\nSmallest: -5' },
        { description: 'all expenses', stdin: '2\n-10\n-3', expectedStdout: 'How many?\nAmount?\nAmount?\nLargest: -3\nSmallest: -10' },
      ],
      hint: 'Start `smallest` from the same first amount as `largest`, and add a second if with `<` inside the loop.',
      solution: 'print("How many?")\nn = int(input())\nprint("Amount?")\nlargest = int(input())\nsmallest = largest\nfor k in range(n - 1):\n    print("Amount?")\n    amount = int(input())\n    if amount > largest:\n        largest = amount\n    if amount < smallest:\n        smallest = amount\nprint(f"Largest: {largest}")\nprint(f"Smallest: {smallest}")\n',
    },
    {
      kind: 'create',
      prompt: 'Print `Balance?` and read a whole number. Print `How many?` and read n. Then n times: print `Amount?`, read a whole number and add it to the balance. Count how many amounts were negative (expenses) and how many positive (incomes); zero is neither. Finally print `Expenses: <e>`, `Incomes: <i>` and `Balance: <b>`, in that order.',
      language: 'python',
      tests: [
        { description: 'mixed, with a zero', stdin: '100\n4\n-30\n0\n50\n-5', expectedStdout: 'Balance?\nHow many?\nAmount?\nAmount?\nAmount?\nAmount?\nExpenses: 2\nIncomes: 1\nBalance: 115' },
        { description: 'no amounts', stdin: '100\n0', expectedStdout: 'Balance?\nHow many?\nExpenses: 0\nIncomes: 0\nBalance: 100' },
        { description: 'all expenses, overdrawn', stdin: '10\n2\n-10\n-10', expectedStdout: 'Balance?\nHow many?\nAmount?\nAmount?\nExpenses: 2\nIncomes: 0\nBalance: -10' },
      ],
      hint: 'Two match-counters and one accumulator, all set up before the loop. Use if / elif so zero touches neither counter.',
      solution: 'print("Balance?")\nbalance = int(input())\nprint("How many?")\nn = int(input())\nexpenses = 0\nincomes = 0\nfor k in range(n):\n    print("Amount?")\n    amount = int(input())\n    balance = balance + amount\n    if amount < 0:\n        expenses = expenses + 1\n    elif amount > 0:\n        incomes = incomes + 1\nprint(f"Expenses: {expenses}")\nprint(f"Incomes: {incomes}")\nprint(f"Balance: {balance}")\n',
      projectNote: 'The ledger can summarise a run: how many expenses, how many incomes, and where the balance ended.',
    },
  ],
};

const l35: Lesson = {
  id: 'py-3-5',
  title: 'Project: Ledger v0.3',
  objective: 'Accept entries until quit, show a running balance, and report the count.',
  minutes: 15,
  lexicon: [
    { id: 'py.3.loop-anatomy', term: 'setup / test / body / step', kind: 'concept', meaning: 'Every loop has four parts: names set up before it, the test that decides whether to go on, the body that does the work, and the step that moves toward the exit. When a loop misbehaves, find which part is wrong.', example: 'count = 0              # setup\nwhile count < 3:       # test\n    print(count)       # body\n    count = count + 1  # step' },
    { id: 'py.3.after-loop', term: 'after the loop', kind: 'concept', meaning: 'The lines below the loop, back at its indentation level, run once when the loop has ended. Accumulators and counters hold their final values there.', example: 'while True:\n    ...\nprint(f"Entries: {entries}")' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The whole program, labelled',
      body: `Everything in this program is something you have already used. Read it as a plan: the labels are the subgoals.

Note the order inside the body: ask, read as text, check the sentinel, and only then convert, update, count and report. The counter moves once per real amount, so \`quit\` is never counted. The two footer lines sit at the left margin, so they run once, after \`break\` has left the loop.

When you write it yourself, write the labels first as comments, then fill in the lines under each one, running the tests as you go.`,
      example: {
        language: 'python',
        source: 'print("Balance?")\nbalance = int(input())\nentries = 0\nwhile True:\n    print("Amount (or quit)?")\n    text = input()\n    if text == "quit":\n        break\n    balance = balance + int(text)\n    entries = entries + 1\n    print(f"Balance: {balance}")\nprint(f"Entries: {entries}")\nprint(f"Final balance: {balance}")',
        labels: [
          { lines: [1, 2], label: 'Ask and read the starting balance.' },
          { lines: [3, 3], label: 'Setup: the entry counter starts at 0.' },
          { lines: [4, 6], label: 'Each pass: ask, and read as text.' },
          { lines: [7, 8], label: 'The sentinel check: quit leaves the loop.' },
          { lines: [9, 11], label: 'A real amount: update the balance, count it, report the running balance.' },
          { lines: [12, 13], label: 'After the loop: the footer, once.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The user types `50`, `-80`, `10`, then `quit`. Which lines are printed, ignoring the prompts?',
      code: { language: 'python', source: 'print("Balance?")\nbalance = int(input())\nentries = 0\nwhile True:\n    print("Amount (or quit)?")\n    text = input()\n    if text == "quit":\n        break\n    balance = balance + int(text)\n    entries = entries + 1\n    print(f"Balance: {balance}")\nprint(f"Entries: {entries}")\nprint(f"Final balance: {balance}")' },
      choices: ['Balance: -30\nBalance: -20\nEntries: 2\nFinal balance: -20', 'Balance: -30\nBalance: -20\nEntries: 3\nFinal balance: -20', 'Balance: 50\nBalance: -30\nBalance: -20\nEntries: 2\nFinal balance: -20', 'Balance: -30\nBalance: -20\nEntries: 2\nFinal balance: -30'],
      answer: 'Balance: -30\nBalance: -20\nEntries: 2\nFinal balance: -20',
      explanation: '50 is the starting balance, not an entry, so nothing is printed for it. -80 makes the balance -30, then 10 makes it -20; each is counted and reported. quit hits break before the count moves, so Entries is 2, and the final balance is the last running value, -20.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the loop of Ledger v0.3 (the setup lines before it and the footer after it are already written). Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['while True:', '    print("Amount (or quit)?")', '    text = input()', '    if text == "quit":', '        break', '    balance = balance + int(text)', '    entries = entries + 1', '    print(f"Balance: {balance}")'],
      distractors: ['    amount = int(input())', '    print(f"Balance: {balance + int(text)}")'],
      explanation: 'Converting with int before checking for quit crashes on the word quit. Printing `balance + int(text)` shows the right number but never stores it, so the next pass would start from the old balance.',
    },
    {
      kind: 'create',
      prompt: 'Write Ledger v0.3. Print `Balance?` and read a whole number. Then repeat: print `Amount (or quit)?` and read a line; if it is `quit`, stop; otherwise add the number to the balance and print `Balance: <running>`. After the loop print `Entries: <count>` (quit is not counted) and `Final balance: <n>`.',
      language: 'python',
      tests: [
        { description: 'quit immediately', stdin: '100\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nEntries: 0\nFinal balance: 100' },
        { description: 'two amounts (the spec example)', stdin: '100\n-30\n50\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nBalance: 70\nAmount (or quit)?\nBalance: 120\nAmount (or quit)?\nEntries: 2\nFinal balance: 120' },
        { description: 'goes negative and stays there', stdin: '20\n-50\n-10\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nBalance: -30\nAmount (or quit)?\nBalance: -40\nAmount (or quit)?\nEntries: 2\nFinal balance: -40' },
        { description: 'four amounts including zero, from an empty start', stdin: '0\n5\n0\n-5\n7\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nBalance: 5\nAmount (or quit)?\nBalance: 5\nAmount (or quit)?\nBalance: 0\nAmount (or quit)?\nBalance: 7\nAmount (or quit)?\nEntries: 4\nFinal balance: 7' },
      ],
      hint: 'Start from the labels in the concept step: setup (balance, entries = 0), the while True loop with the sentinel check first, then the two footer lines outside the loop.',
      solution: 'print("Balance?")\nbalance = int(input())\nentries = 0\nwhile True:\n    print("Amount (or quit)?")\n    text = input()\n    if text == "quit":\n        break\n    balance = balance + int(text)\n    entries = entries + 1\n    print(f"Balance: {balance}")\nprint(f"Entries: {entries}")\nprint(f"Final balance: {balance}")\n',
      projectNote: 'Ledger v0.3 complete: it accepts entries until quit, keeps a running balance, and counts what it recorded.',
    },
  ],
};

export const m3: Module = {
  id: 'py-m3',
  title: 'Repeating',
  goal: 'while, for, range, break/continue, accumulating in a loop.',
  projectMilestone: 'Ledger v0.3: accepts entries until the user types "quit" and keeps a running total.',
  status: 'available',
  lessons: [l31, l32, l33, l34, l35],
};
