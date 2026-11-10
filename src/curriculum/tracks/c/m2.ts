import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 2: Deciding and repeating                                   */
/* ------------------------------------------------------------------ */

const l21: Lesson = {
  id: 'c-2-1',
  title: 'Deciding with braces',
  objective: 'Run a block only when a parenthesised condition is true, and combine conditions.',
  minutes: 18,
  lexicon: [
    { id: 'c.2.if', term: 'if (cond) { } else { }', kind: 'pattern', meaning: 'Run the first block when cond is non-zero, otherwise the else block. The parentheses around the condition are mandatory; the braces mark each block.', example: 'if (amount < 0) {\n    printf("expense\\n");\n} else {\n    printf("income\\n");\n}', analogy: 'A conditional sentence, "if it rains, we stay in". The analogy breaks at the punctuation: C wants the condition in parentheses and the consequence in braces, never a colon.' },
    { id: 'c.2.else-if', term: 'else if (cond) { }', kind: 'pattern', meaning: 'C has no elif. A second question is written as else followed by a new if; only the first true branch runs.', example: 'if (n < 0) {\n    ...\n} else if (n == 0) {\n    ...\n} else {\n    ...\n}' },
    { id: 'c.2.eqeq', term: '== versus =', kind: 'operator', meaning: '== asks "equal?" and gives 1 or 0. A single = assigns, and in C an assignment is an expression with a value, so `if (x = 0)` compiles: it stores 0 and then tests 0, which is false.', example: 'if (command == 3) {\n    running = 0;\n}', analogy: 'A question versus a command. In Python the compiler refuses the mix-up; in C it only warns, and this app treats warnings as errors so you still get caught.' },
    { id: 'c.2.truthy', term: '0 is false, anything else is true', kind: 'concept', meaning: 'C has no separate True/False values here: a comparison produces the int 1 or 0, and any non-zero int counts as true in a condition.', example: 'int running = 1;\nif (running) {\n    printf("still going\\n");\n}' },
    { id: 'c.2.logical', term: '&&  ||  !', kind: 'operator', meaning: 'And, or, not. Both sides of && and || must be complete comparisons; ! flips 0 and non-zero.', example: 'if (n < -1000 || n > 1000) {\n    printf("large\\n");\n}', analogy: 'Python\'s and / or / not, spelled with symbols. The one place the analogy holds too well: like Python, "n > 0 && < 10" is not a sentence.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Parentheses ask, braces answer',
      body: `In Python a decision is \`if amount < 0:\` and an indented block. In C the condition goes in **parentheses** and the block in **braces**. Indentation is for your eyes; the braces are the grammar.

C spells \`elif\` as \`else if\`. Comparisons do not produce True or False but the ints 1 and 0, and any **non-zero** value counts as true in a condition. Combine conditions with \`&&\` (and), \`||\` (or) and \`!\` (not).

One rule of this track from now on: write \`(void)\` in front of \`scanf\`. It tells the compiler you are deliberately ignoring the count scanf returns, and our tests treat every warning as an error.`,
      example: {
        language: 'c',
        source: '#include <stdio.h>\n\nint main(void) {\n    int amount = 0;\n    printf("Amount?\\n");\n    (void)scanf("%d", &amount);\n    if (amount < 0) {\n        printf("expense\\n");\n    } else if (amount == 0) {\n        printf("nothing\\n");\n    } else {\n        printf("income\\n");\n    }\n    if (amount < -1000 || amount > 1000) {\n        printf("large\\n");\n    }\n    return 0;\n}',
        labels: [
          { lines: [4, 6], label: 'Ask and read the amount; (void) says the count scanf returns is ignored on purpose.' },
          { lines: [7, 8], label: 'The question in parentheses, the block in braces.' },
          { lines: [9, 12], label: 'Second question with else if; the final else catches the rest. Exactly one block runs.' },
          { lines: [14, 16], label: 'Two complete comparisons joined by ||. No else: when false, nothing happens.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`if amount < 0:` becomes `if (amount < 0) {`. `elif` becomes `else if`. `and / or / not` become `&& / || / !`. `True` and `False` are just 1 and 0. The dangerous difference: Python rejects `if x = 0` as a SyntaxError; C accepts it as an assignment.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'This compiles (with a warning). What does it print?',
      code: { language: 'c', source: '#include <stdio.h>\nint main(void) {\n    int x = 5;\n    if (x = 0) {\n        printf("zero\\n");\n    } else {\n        printf("not zero\\n");\n    }\n    printf("%d\\n", x);\n    return 0;\n}' },
      choices: ['not zero\n0', 'zero\n0', 'not zero\n5', 'zero\n5'],
      answer: 'not zero\n0',
      explanation: 'A single = assigns: x becomes 0, and the value of the whole expression is that 0, which is false, so the else branch runs. Then x prints as 0. gcc -Wall warns "suggest parentheses around assignment used as truth value", and with -Werror the program will not even build, which is the friendliest outcome.',
    },
    {
      kind: 'parsons',
      prompt: 'Print `negative` when n is below zero and `non-negative` otherwise. Set the indentation yourself.',
      language: 'c',
      indentation: true,
      solution: ['int n = -3;', 'if (n < 0) {', '    printf("negative\\n");', '} else {', '    printf("non-negative\\n");', '}'],
      distractors: ['if n < 0 {', 'else {'],
      explanation: 'The condition needs its parentheses, and the if block must be closed with } before else begins.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the condition: the first branch runs only when the balance equals 0 **and** the vault is not locked. With these values it prints `in use or locked`.',
      language: 'c',
      template: '#include <stdio.h>\nint main(void) {\n    int balance = 0;\n    int locked = 1;\n    if (balance {{eq}} 0 {{and}} !locked) {\n        printf("empty and open\\n");\n    } {{els}} {\n        printf("in use or locked\\n");\n    }\n    return 0;\n}',
      blanks: [
        { id: 'eq', answers: ['=='], hint: 'the question form of equals' },
        { id: 'and', answers: ['&&'], hint: 'both sides must hold' },
        { id: 'els', answers: ['else'] },
      ],
      explanation: 'locked is 1, so !locked is 0 and the && fails; the else block runs.',
    },
    {
      kind: 'modify',
      prompt: 'The program says `income` for every amount. Make it print `expense` when the amount is negative and `income` otherwise. The balance line stays.',
      language: 'c',
      starter: '#include <stdio.h>\n\nint main(void) {\n    int balance = 100;\n    int amount = 0;\n    printf("Amount?\\n");\n    (void)scanf("%d", &amount);\n    printf("income\\n");\n    balance = balance + amount;\n    printf("Balance: %d\\n", balance);\n    return 0;\n}\n',
      tests: [
        { description: '-40 is an expense', stdin: '-40', expectedStdout: 'Amount?\nexpense\nBalance: 60' },
        { description: '25 is income', stdin: '25', expectedStdout: 'Amount?\nincome\nBalance: 125' },
        { description: '0 counts as income', stdin: '0', expectedStdout: 'Amount?\nincome\nBalance: 100' },
      ],
      hint: 'Wrap the printf in an if/else with the condition in parentheses. Only the print changes; the update line runs for every amount.',
      solution: '#include <stdio.h>\n\nint main(void) {\n    int balance = 100;\n    int amount = 0;\n    printf("Amount?\\n");\n    (void)scanf("%d", &amount);\n    if (amount < 0) {\n        printf("expense\\n");\n    } else {\n        printf("income\\n");\n    }\n    balance = balance + amount;\n    printf("Balance: %d\\n", balance);\n    return 0;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Print `Balance?` and read an int. Print `overdrawn` if it is below zero, `empty` if it is exactly zero, otherwise `ok`. Then, if the balance is below -500 **or** above 500, print `large`. Finally always print `Balance: <value>`.',
      language: 'c',
      tests: [
        { description: '-600: overdrawn and large', stdin: '-600', expectedStdout: 'Balance?\noverdrawn\nlarge\nBalance: -600' },
        { description: '-5: overdrawn only', stdin: '-5', expectedStdout: 'Balance?\noverdrawn\nBalance: -5' },
        { description: '0: empty', stdin: '0', expectedStdout: 'Balance?\nempty\nBalance: 0' },
        { description: '500: ok, not large (boundary)', stdin: '500', expectedStdout: 'Balance?\nok\nBalance: 500' },
        { description: '900: ok and large', stdin: '900', expectedStdout: 'Balance?\nok\nlarge\nBalance: 900' },
      ],
      hint: 'One if / else if / else chain for the three words, then a separate if with || for `large`, then the final printf.',
      solution: '#include <stdio.h>\n\nint main(void) {\n    int balance = 0;\n    printf("Balance?\\n");\n    (void)scanf("%d", &balance);\n    if (balance < 0) {\n        printf("overdrawn\\n");\n    } else if (balance == 0) {\n        printf("empty\\n");\n    } else {\n        printf("ok\\n");\n    }\n    if (balance < -500 || balance > 500) {\n        printf("large\\n");\n    }\n    printf("Balance: %d\\n", balance);\n    return 0;\n}\n',
      projectNote: 'The Vault can now judge a value. v0.2 will use the same shape to tell commands apart.',
    },
  ],
};

const l22: Lesson = {
  id: 'c-2-2',
  title: 'Repeating while something holds',
  objective: 'Repeat a block with while, read until a sentinel, and use do/while to ask at least once.',
  minutes: 20,
  lexicon: [
    { id: 'c.2.while', term: 'while (cond) { }', kind: 'keyword', meaning: 'Check cond; if non-zero run the block, then check again. Something inside the block must eventually make cond false.', example: 'while (amount != 0) {\n    total = total + amount;\n    (void)scanf("%d", &amount);\n}', analogy: 'Python\'s while, with parentheses and braces instead of a colon and indentation. Same trap in both: forget to change what the condition looks at and it never ends.' },
    { id: 'c.2.do-while', term: 'do { } while (cond);', kind: 'keyword', meaning: 'Run the block first, then check cond and repeat while it holds. The block always runs at least once. Note the semicolon after the closing parenthesis.', example: 'do {\n    printf("Continue?\\n");\n    (void)scanf("%d", &again);\n} while (again == 1);', analogy: '"Ask, and keep asking while the answer is yes." Python has no equivalent; it uses while True with break.' },
    { id: 'c.2.counter', term: 'count = count + 1;', kind: 'pattern', meaning: 'A counter: an int started at 0 and raised by one each time something happens. Read it after the loop.', example: 'int count = 0;\nwhile (amount != 0) {\n    count = count + 1;\n    (void)scanf("%d", &amount);\n}' },
    { id: 'c.2.sentinel', term: 'sentinel value', kind: 'concept', meaning: 'A special input (often 0 or -1) that means "stop". Read once before the loop, test it in the condition, read again at the end of the body.', example: 'int amount = 0;\n(void)scanf("%d", &amount);\nwhile (amount != 0) {\n    /* use amount */\n    (void)scanf("%d", &amount);\n}', analogy: 'The full stop at the end of dictation. It breaks when the stop word could also be real data: 0 cannot be both "stop" and "an amount of zero".' },
    { id: 'c.2.infinite', term: 'infinite loop', kind: 'concept', meaning: 'A loop whose condition never becomes false, usually because the body never changes what the condition tests, or because a stray ; gave the loop an empty body. This app stops a program that runs for about 8 seconds and tells you.', example: 'while (n > 0);   /* empty body: n never changes */' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Check, run, check again',
      body: `\`while (cond) { ... }\` checks the condition, runs the block if it holds, and checks again. The block must change something the condition looks at, or the loop never ends. The app kills a program after about 8 seconds and tells you, but it is better to spot the missing update yourself.

The **sentinel** pattern reads one value before the loop, tests it, and reads the next value as the last thing in the body. The value that means "stop" is never counted.

\`do { ... } while (cond);\` checks **after** the body, so the body runs at least once. Use it when you must ask before you can know whether to ask again. Do not forget the semicolon after the parenthesis.`,
      example: {
        language: 'c',
        source: '#include <stdio.h>\n\nint main(void) {\n    int total = 0;\n    int count = 0;\n    int amount = 0;\n    printf("Amount?\\n");\n    (void)scanf("%d", &amount);\n    while (amount != 0) {\n        total = total + amount;\n        count = count + 1;\n        printf("Amount?\\n");\n        (void)scanf("%d", &amount);\n    }\n    printf("Records: %d\\n", count);\n    printf("Total: %d\\n", total);\n    return 0;\n}',
        labels: [
          { lines: [4, 6], label: 'State: a running total, a counter, and the box the input lands in. All start at 0.' },
          { lines: [7, 8], label: 'Priming read: get the first value so the condition has something to test.' },
          { lines: [9, 9], label: 'The question, asked before every pass. 0 is the sentinel.' },
          { lines: [10, 11], label: 'Use the value: add it, count it.' },
          { lines: [12, 13], label: 'Read the next value as the last step, so the condition can change.' },
          { lines: [15, 16], label: 'After the loop: report. The sentinel was never added or counted.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`while amount != 0:` becomes `while (amount != 0) {`. Python usually reads with `while True:` and `break`; C has `while (1)` and `break` too, but the priming-read shape above is the idiom here. `do { } while` has no Python counterpart at all.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this print?',
      code: { language: 'c', source: '#include <stdio.h>\nint main(void) {\n    int n = 0;\n    do {\n        printf("tick\\n");\n        n = n - 1;\n    } while (n > 0);\n    printf("%d\\n", n);\n    return 0;\n}' },
      choices: ['tick\n-1', '-1', 'tick\n0', 'nothing: the loop never runs'],
      answer: 'tick\n-1',
      explanation: 'do/while runs the body before it looks at the condition, so `tick` prints once and n becomes -1. Then `n > 0` is false and the loop ends. A plain while with the same condition would have printed only `0`.',
    },
    {
      kind: 'parsons',
      prompt: 'Count down from 3 to 1, one number per line, then print `Liftoff`. Set the indentation yourself.',
      language: 'c',
      indentation: true,
      solution: ['int n = 3;', 'while (n > 0) {', '    printf("%d\\n", n);', '    n = n - 1;', '}', 'printf("Liftoff\\n");'],
      distractors: ['while (n > 0);', 'while n > 0 {'],
      explanation: 'A semicolon straight after `while (...)` is an empty body: n never changes and the loop never ends. And the condition always needs its parentheses.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the loop so the question is asked at least once and repeated while the answer is exactly 1.',
      language: 'c',
      template: '#include <stdio.h>\nint main(void) {\n    int answer = 0;\n    {{kw}} {\n        printf("Again? (1 = yes)\\n");\n        (void)scanf("%d", &answer);\n    } while (answer {{op}} 1){{semi}}\n    printf("Stopped\\n");\n    return 0;\n}',
      blanks: [
        { id: 'kw', answers: ['do'] },
        { id: 'op', answers: ['=='], hint: 'the question form of equals' },
        { id: 'semi', answers: [';'], hint: 'do/while ends with the full stop of C' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program accepts a negative amount. Use a `do { } while` so it asks `Amount?` again until the user types a non-negative amount, then prints `Amount: <n>` once.',
      language: 'c',
      starter: '#include <stdio.h>\n\nint main(void) {\n    int amount = 0;\n    printf("Amount?\\n");\n    (void)scanf("%d", &amount);\n    printf("Amount: %d\\n", amount);\n    return 0;\n}\n',
      tests: [
        { description: '5 is accepted first time', stdin: '5', expectedStdout: 'Amount?\nAmount: 5' },
        { description: 'two refusals then 7', stdin: '-3\n-1\n7', expectedStdout: 'Amount?\nAmount?\nAmount?\nAmount: 7' },
        { description: '0 is accepted (boundary)', stdin: '0', expectedStdout: 'Amount?\nAmount: 0' },
      ],
      hint: 'Put the prompt and the read inside do { ... } and make the condition `amount < 0`.',
      solution: '#include <stdio.h>\n\nint main(void) {\n    int amount = 0;\n    do {\n        printf("Amount?\\n");\n        (void)scanf("%d", &amount);\n    } while (amount < 0);\n    printf("Amount: %d\\n", amount);\n    return 0;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Read amounts until the user types 0 (the sentinel), printing `Amount?` before every read. Count them, sum them, and count how many were negative. Then print `Records: <count>`, `Total: <total>` and `Expenses: <negatives>`.',
      language: 'c',
      tests: [
        { description: '50, -20, -5, 0', stdin: '50\n-20\n-5\n0', expectedStdout: 'Amount?\nAmount?\nAmount?\nAmount?\nRecords: 3\nTotal: 25\nExpenses: 2' },
        { description: 'stop immediately', stdin: '0', expectedStdout: 'Amount?\nRecords: 0\nTotal: 0\nExpenses: 0' },
        { description: 'only income', stdin: '10\n10\n0', expectedStdout: 'Amount?\nAmount?\nAmount?\nRecords: 2\nTotal: 20\nExpenses: 0' },
      ],
      hint: 'Start from the concept example. Inside the loop, an if (amount < 0) raises the third counter.',
      solution: '#include <stdio.h>\n\nint main(void) {\n    int total = 0;\n    int count = 0;\n    int expenses = 0;\n    int amount = 0;\n    printf("Amount?\\n");\n    (void)scanf("%d", &amount);\n    while (amount != 0) {\n        total = total + amount;\n        count = count + 1;\n        if (amount < 0) {\n            expenses = expenses + 1;\n        }\n        printf("Amount?\\n");\n        (void)scanf("%d", &amount);\n    }\n    printf("Records: %d\\n", count);\n    printf("Total: %d\\n", total);\n    printf("Expenses: %d\\n", expenses);\n    return 0;\n}\n',
      projectNote: 'The Vault can keep going until told to stop. v0.2 replaces the sentinel with a quit command.',
    },
  ],
};

const l23: Lesson = {
  id: 'c-2-3',
  title: 'Counting with for',
  objective: 'Repeat a known number of times with a for loop, and nest loops to build a table.',
  minutes: 20,
  lexicon: [
    { id: 'c.2.for', term: 'for (int i = 0; i < n; i++) { }', kind: 'pattern', meaning: 'Three clauses separated by semicolons: start (runs once), test (checked before each pass), step (runs after each pass). i exists only inside the loop.', example: 'for (int i = 0; i < 3; i++) {\n    printf("%d\\n", i);\n}', analogy: 'Python\'s `for i in range(n):` with the three parts of range written out. It breaks for collections: C has no for-each; Module 4 shows how arrays are walked with an index.' },
    { id: 'c.2.increment', term: 'i++  /  i--', kind: 'operator', meaning: 'Add one to i, or subtract one. Same effect as i = i + 1 when used as a statement on its own.', example: 'count++;' },
    { id: 'c.2.nested-for', term: 'a loop inside a loop', kind: 'pattern', meaning: 'The inner loop runs completely for every single pass of the outer loop. Rows outside, columns inside.', example: 'for (int i = 1; i <= 3; i++) {\n    for (int j = 1; j <= 4; j++) {\n        printf(" %d", i * j);\n    }\n    printf("\\n");\n}' },
    { id: 'c.2.off-by-one', term: 'off-by-one', kind: 'concept', meaning: 'Running one pass too many or too few. `i < n` from 0 gives n passes; `i <= n` gives n + 1. Count the passes on paper for the smallest case.', example: 'for (int i = 0; i < 3; i++)   /* 0 1 2 */\nfor (int i = 0; i <= 3; i++)  /* 0 1 2 3 */' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Start, test, step',
      body: `When you know how many passes you want, \`for\` puts the whole plan on one line: \`for (int i = 0; i < n; i++)\`. The **start** runs once, the **test** is checked before every pass, the **step** runs after every pass. \`i++\` means "add one to i".

\`i < n\` starting from 0 gives exactly n passes, the same as Python's \`range(n)\`. Writing \`<=\` by accident gives one pass too many: the classic off-by-one.

A loop inside a loop builds a table: the outer loop makes the rows, and for each row the inner loop runs completely to print the columns.`,
      example: {
        language: 'c',
        source: '#include <stdio.h>\n\nint main(void) {\n    int rows = 3;\n    for (int i = 1; i <= rows; i++) {\n        printf("Row %d:", i);\n        for (int j = 1; j <= 4; j++) {\n            printf(" %d", i * j);\n        }\n        printf("\\n");\n    }\n    return 0;\n}',
        labels: [
          { lines: [5, 5], label: 'Outer loop: i runs 1, 2, 3. Start once, test before each pass, step after.' },
          { lines: [6, 6], label: 'Begin the row. No \\n yet: the columns go on the same line.' },
          { lines: [7, 9], label: 'Inner loop: for this one i, j runs 1 to 4 completely.' },
          { lines: [10, 10], label: 'End the row, then the outer step runs and i grows.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`for i in range(n):` is `for (int i = 0; i < n; i++) {`: start 0, stop before n, step 1. `range(1, rows + 1)` becomes `i = 1; i <= rows`. There is no `for x in collection` in C. `i += 1` exists in C too, but `i++` is the idiom.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this print?',
      code: { language: 'c', source: '#include <stdio.h>\nint main(void) {\n    for (int i = 0; i <= 3; i++) {\n        printf("%d ", i);\n    }\n    printf("\\n");\n    return 0;\n}' },
      choices: ['0 1 2 3', '0 1 2', '1 2 3', '1 2 3 4'],
      answer: '0 1 2 3',
      explanation: 'The test is `i <= 3`, so 3 still passes and there are four passes, not three. `range(3)` in Python stops before 3; the C equivalent is `i < 3`.',
    },
    {
      kind: 'parsons',
      prompt: 'Print the squares of 1 to 5, one per line. Set the indentation yourself.',
      language: 'c',
      indentation: true,
      solution: ['#include <stdio.h>', 'int main(void) {', '    int n = 5;', '    for (int i = 1; i <= n; i++) {', '        printf("%d\\n", i * i);', '    }', '    return 0;', '}'],
      distractors: ['    for (int i = 1, i <= n, i++) {', '    for (int i = 1; i <= n; i++);'],
      explanation: 'The three clauses are separated by semicolons, not commas, and a semicolon after the closing parenthesis gives the loop an empty body.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the countdown: print 10 down to 1, then `Liftoff`.',
      language: 'c',
      template: '#include <stdio.h>\nint main(void) {\n    for (int i = 10; i {{cond}} 1; {{step}}) {\n        printf("%d\\n", i);\n    }\n    printf("Liftoff\\n");\n    return 0;\n}',
      blanks: [
        { id: 'cond', answers: ['>='], hint: '1 must still be printed' },
        { id: 'step', answers: ['i--', 'i = i - 1', 'i -= 1', '--i'], hint: 'the opposite of i++' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program prints a single row of the multiplication table. Wrap it in an outer loop over rows `i` from 1 to size, so each row starts with `Row <i>:` followed by `i * j` for every column.',
      language: 'c',
      starter: '#include <stdio.h>\n\nint main(void) {\n    int size = 0;\n    printf("Size?\\n");\n    (void)scanf("%d", &size);\n    printf("Row 1:");\n    for (int j = 1; j <= size; j++) {\n        printf(" %d", 1 * j);\n    }\n    printf("\\n");\n    return 0;\n}\n',
      tests: [
        { description: 'size 3', stdin: '3', expectedStdout: 'Size?\nRow 1: 1 2 3\nRow 2: 2 4 6\nRow 3: 3 6 9' },
        { description: 'size 1', stdin: '1', expectedStdout: 'Size?\nRow 1: 1' },
      ],
      hint: 'Everything from `printf("Row ...")` to the final `printf("\\n")` becomes the body of the new outer loop, and the two 1s become i.',
      solution: '#include <stdio.h>\n\nint main(void) {\n    int size = 0;\n    printf("Size?\\n");\n    (void)scanf("%d", &size);\n    for (int i = 1; i <= size; i++) {\n        printf("Row %d:", i);\n        for (int j = 1; j <= size; j++) {\n            printf(" %d", i * j);\n        }\n        printf("\\n");\n    }\n    return 0;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Print `Rows?` and read n. Then print a triangle: line i (from 1 to n) consists of exactly i stars `*`. Use nested loops; for 0 rows print nothing after the prompt.',
      language: 'c',
      tests: [
        { description: '3 rows', stdin: '3', expectedStdout: 'Rows?\n*\n**\n***' },
        { description: '1 row', stdin: '1', expectedStdout: 'Rows?\n*' },
        { description: '0 rows (boundary)', stdin: '0', expectedStdout: 'Rows?' },
      ],
      hint: 'Outer loop i from 1 to n; inner loop j from 1 to i prints one star without \\n; after the inner loop print the \\n.',
      solution: '#include <stdio.h>\n\nint main(void) {\n    int n = 0;\n    printf("Rows?\\n");\n    (void)scanf("%d", &n);\n    for (int i = 1; i <= n; i++) {\n        for (int j = 1; j <= i; j++) {\n            printf("*");\n        }\n        printf("\\n");\n    }\n    return 0;\n}\n',
      projectNote: 'Counting loops will walk the Vault\'s records once there is an array of them (Module 4).',
    },
  ],
};

const l24: Lesson = {
  id: 'c-2-4',
  title: 'Operators, switch and const',
  objective: 'Use integer arithmetic correctly, choose among commands with switch, and lock a value with const.',
  minutes: 22,
  lexicon: [
    { id: 'c.2.intdiv', term: '/ and % on ints', kind: 'operator', meaning: 'Integer division drops the fraction, truncating toward zero: 7 / 2 is 3 and -7 / 2 is -3. % gives the remainder with the sign of the left operand: -7 % 2 is -1.', example: 'int euros = cents / 100;\nint rest = cents % 100;', analogy: 'Python\'s // and % look the same but round toward negative infinity: -7 // 2 is -4 and -7 % 2 is 1. The two languages agree only for non-negative numbers.' },
    { id: 'c.2.compound', term: '+=  -=  *=', kind: 'operator', meaning: 'Update a box in place: total += amount means total = total + amount.', example: 'total += amount;\ncount -= 1;' },
    { id: 'c.2.precedence', term: 'precedence', kind: 'concept', meaning: '* / % bind tighter than + -, which bind tighter than comparisons, which bind tighter than && and then ||. When a line mixes levels, add parentheses: they cost nothing and the reader stops guessing.', example: 'int average = (a + b) / 2;   /* not a + b / 2 */' },
    { id: 'c.2.switch', term: 'switch (x) { case 1: ... break; default: ... }', kind: 'keyword', meaning: 'Jump to the case whose constant equals x, or to default. Execution then continues downward through the following cases until a break: forgetting break is the fall-through bug.', example: 'switch (command) {\n    case 1:\n        printf("Added\\n");\n        break;\n    default:\n        printf("Unknown command\\n");\n        break;\n}', analogy: 'A row of labelled doors: you enter at the matching label and keep walking past the other labels until a break stops you. The analogy breaks against Python\'s match, which runs exactly one arm and needs no break.' },
    { id: 'c.2.const', term: 'const int MAX = 100;', kind: 'keyword', meaning: 'A box the compiler refuses to let you change after it is filled. Use it for numbers that have a meaning, so the name appears instead of a bare 100.', example: 'const int CENTS_PER_EURO = 100;', analogy: 'Python\'s UPPER_CASE names are a promise between people; const is a promise the compiler enforces.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Whole numbers, labelled doors, locked boxes',
      body: `Dividing two ints gives an int: the fraction is **dropped**, toward zero. \`%\` gives the remainder. \`total += amount\` is short for \`total = total + amount\`. When an expression mixes \`*\` \`/\` with \`+\` \`-\`, the multiplicative ones win; add parentheses whenever a reader might wonder.

\`switch\` chooses among several integer constants. Execution jumps to the matching \`case\` and then **keeps going** into the next case until it meets \`break\`. Every case ends with \`break\` unless you really mean to fall through. \`default\` catches everything else.

\`const\` marks a box that cannot be changed after it is filled. Name your magic numbers.`,
      example: {
        language: 'c',
        source: '#include <stdio.h>\n\nint main(void) {\n    const int CENTS_PER_EURO = 100;\n    int cents = 0;\n    int command = 0;\n    printf("Cents?\\n");\n    (void)scanf("%d", &cents);\n    printf("%d euros and %d cents\\n", cents / CENTS_PER_EURO, cents % CENTS_PER_EURO);\n    printf("Command?\\n");\n    (void)scanf("%d", &command);\n    switch (command) {\n        case 1:\n            cents += 50;\n            printf("Added, now %d\\n", cents);\n            break;\n        case 2:\n            printf("Half: %d\\n", cents / 2);\n            break;\n        default:\n            printf("Unknown command\\n");\n            break;\n    }\n    return 0;\n}',
        labels: [
          { lines: [4, 4], label: 'A named, locked constant instead of a bare 100.' },
          { lines: [9, 9], label: '/ drops the fraction, % keeps the remainder: 250 gives 2 euros and 50 cents.' },
          { lines: [12, 12], label: 'Jump to the case equal to command.' },
          { lines: [13, 16], label: 'Case 1: update in place with +=, report, then break out of the switch.' },
          { lines: [17, 19], label: 'Case 2: integer division again. Without the break above, 1 would also run this.' },
          { lines: [20, 22], label: 'default is the else of switch. The last break is optional but habit-forming.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python\'s `//` and `%` floor toward negative infinity (-7 // 2 is -4); C truncates toward zero (-7 / 2 is -3). Python\'s `match` runs one arm and stops; C\'s switch falls through until a break, and only matches integer constants. Python has no const; the compiler enforces C\'s.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'command is 1. What does this switch print?',
      code: { language: 'c', source: '#include <stdio.h>\nint main(void) {\n    int command = 1;\n    switch (command) {\n        case 1:\n            printf("Added\\n");\n        case 2:\n            printf("Shown\\n");\n            break;\n        default:\n            printf("Unknown\\n");\n    }\n    return 0;\n}' },
      choices: ['Added\nShown', 'Added', 'Added\nShown\nUnknown', 'Shown'],
      answer: 'Added\nShown',
      explanation: 'case 1 has no break, so after `Added` execution falls through into case 2 and prints `Shown`; the break there stops it before default. gcc -Wextra flags this as "this statement may fall through", so under -Werror the app would refuse to build it.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a switch that prints `Added` for 1, `Shown` for 2 and `Unknown command` otherwise. Set the indentation yourself.',
      language: 'c',
      indentation: true,
      solution: ['#include <stdio.h>', 'int main(void) {', '    int command = 2;', '    switch (command) {', '        case 1:', '            printf("Added\\n");', '            break;', '        case 2:', '            printf("Shown\\n");', '            break;', '        default:', '            printf("Unknown command\\n");', '            break;', '    }', '    return 0;', '}'],
      distractors: ['        case 2 {', '        else:'],
      explanation: 'A case label ends with a colon, not a brace, and the catch-all arm of a switch is spelled default, not else.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program prints `4 rows, 2 left over`: whole rows of 4 from 14 items, one extra row for the leftovers, and a compound add.',
      language: 'c',
      template: '#include <stdio.h>\nint main(void) {\n    const int PER_ROW = 4;\n    int items = 14;\n    int rows = items {{div}} PER_ROW;\n    int left = items {{mod}} PER_ROW;\n    rows {{plus}} 1;\n    printf("%d rows, %d left over\\n", rows, left);\n    return 0;\n}',
      blanks: [
        { id: 'div', answers: ['/'], hint: 'integer division drops the fraction' },
        { id: 'mod', answers: ['%'], hint: 'the remainder' },
        { id: 'plus', answers: ['+='], hint: 'add in place' },
      ],
      explanation: '14 / 4 is 3 (the .5 is dropped), 14 % 4 is 2, and += raises rows to 4.',
    },
    {
      kind: 'modify',
      prompt: 'Two bugs. Command 1 prints the wrong average (for 10 and 20 it says 20): add parentheses so the sum is divided. And an unknown command prints nothing: add a `default` that prints `Unknown command`.',
      language: 'c',
      starter: '#include <stdio.h>\n\nint main(void) {\n    int a = 0;\n    int b = 0;\n    int command = 0;\n    printf("First?\\n");\n    (void)scanf("%d", &a);\n    printf("Second?\\n");\n    (void)scanf("%d", &b);\n    printf("Command?\\n");\n    (void)scanf("%d", &command);\n    switch (command) {\n        case 1:\n            printf("Average: %d\\n", a + b / 2);\n            break;\n        case 2:\n            printf("Difference: %d\\n", b - a);\n            break;\n    }\n    return 0;\n}\n',
      tests: [
        { description: 'average of 10 and 20', stdin: '10\n20\n1', expectedStdout: 'First?\nSecond?\nCommand?\nAverage: 15' },
        { description: 'difference', stdin: '10\n20\n2', expectedStdout: 'First?\nSecond?\nCommand?\nDifference: 10' },
        { description: 'unknown command', stdin: '10\n20\n7', expectedStdout: 'First?\nSecond?\nCommand?\nUnknown command' },
        { description: 'average truncates: 3 and 4', stdin: '3\n4\n1', expectedStdout: 'First?\nSecond?\nCommand?\nAverage: 3' },
      ],
      hint: '`a + b / 2` divides only b. Write `(a + b) / 2`. The default arm goes after case 2 and ends with break.',
      solution: '#include <stdio.h>\n\nint main(void) {\n    int a = 0;\n    int b = 0;\n    int command = 0;\n    printf("First?\\n");\n    (void)scanf("%d", &a);\n    printf("Second?\\n");\n    (void)scanf("%d", &b);\n    printf("Command?\\n");\n    (void)scanf("%d", &command);\n    switch (command) {\n        case 1:\n            printf("Average: %d\\n", (a + b) / 2);\n            break;\n        case 2:\n            printf("Difference: %d\\n", b - a);\n            break;\n        default:\n            printf("Unknown command\\n");\n            break;\n    }\n    return 0;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'A one-shot command. Declare `const int START = 101;` and `int total = START;`. Print `Command?` and read an int. 1: print `Amount?`, read an int, add it to total with `+=`, print `Total: <total>`. 2: print `Half: <total / 2>` and `Rest: <total % 2>`. 3: print `Bye`. Anything else: `Unknown command`.',
      language: 'c',
      tests: [
        { description: 'add -7', stdin: '1\n-7', expectedStdout: 'Command?\nAmount?\nTotal: 94' },
        { description: 'half and rest of 101', stdin: '2', expectedStdout: 'Command?\nHalf: 50\nRest: 1' },
        { description: 'quit', stdin: '3', expectedStdout: 'Command?\nBye' },
        { description: 'unknown', stdin: '9', expectedStdout: 'Command?\nUnknown command' },
      ],
      hint: 'Four arms in one switch, each ending with break. Only case 1 asks a second question.',
      solution: '#include <stdio.h>\n\nint main(void) {\n    const int START = 101;\n    int total = START;\n    int command = 0;\n    int amount = 0;\n    printf("Command?\\n");\n    (void)scanf("%d", &command);\n    switch (command) {\n        case 1:\n            printf("Amount?\\n");\n            (void)scanf("%d", &amount);\n            total += amount;\n            printf("Total: %d\\n", total);\n            break;\n        case 2:\n            printf("Half: %d\\n", total / 2);\n            printf("Rest: %d\\n", total % 2);\n            break;\n        case 3:\n            printf("Bye\\n");\n            break;\n        default:\n            printf("Unknown command\\n");\n            break;\n    }\n    return 0;\n}\n',
      projectNote: 'This is one pass of the Vault\'s menu. The project lesson wraps it in a loop.',
    },
  ],
};

const l25: Lesson = {
  id: 'c-2-5',
  title: 'Project: Vault v0.2',
  objective: 'Build a command loop that adds amounts, shows totals and quits on request.',
  minutes: 22,
  lexicon: [
    { id: 'c.2.command-loop', term: 'while (running) { read command; switch ... }', kind: 'pattern', meaning: 'The menu loop: read a command, dispatch on it with switch, repeat until a flag says stop. The state the commands work on is declared before the loop.', example: 'while (running) {\n    printf("Command?\\n");\n    (void)scanf("%d", &command);\n    switch (command) {\n        /* cases */\n    }\n}' },
    { id: 'c.2.flag', term: 'int running = 1;', kind: 'concept', meaning: 'An int used as a yes/no: 1 means keep going, 0 means stop. The loop tests it directly, and the quit command sets it to 0.', example: 'int running = 1;\nwhile (running) {\n    ...\n    running = 0;   /* in the quit case */\n}', analogy: 'A light switch the loop checks each time round. It breaks if two places flip it for different reasons; keep one flag for one question.' },
    { id: 'c.2.break-scope', term: 'break leaves the switch, not the loop', kind: 'concept', meaning: 'Inside a switch that sits in a loop, break ends the switch only; the loop continues. To end the loop from a case, change the flag.', example: 'case 3:\n    printf("Bye\\n");\n    running = 0;\n    break;   /* leaves the switch; the while sees running == 0 */' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The whole plan',
      body: `Vault v0.2 is a **command loop**. State (\`total\`, \`count\`) is declared before the loop. Each pass prints \`Command?\`, reads an int and dispatches with \`switch\`: 1 adds an amount, 2 shows the records, 3 says \`Bye\` and stops, anything else is \`Unknown command\`.

The loop runs while the flag \`running\` is non-zero. Inside the switch, \`break\` only leaves the switch, so the quit case sets \`running = 0\` and lets the while condition end the loop.

The loop relies on the user eventually typing 3; a run with no 3 in its input spins until the app stops it. Read the labels: they are the plan you will write from.`,
      example: {
        language: 'c',
        source: '#include <stdio.h>\n\nint main(void) {\n    int total = 0;\n    int count = 0;\n    int running = 1;\n    int command = 0;\n    int amount = 0;\n    while (running) {\n        printf("Command?\\n");\n        (void)scanf("%d", &command);\n        switch (command) {\n            case 1:\n                printf("Amount?\\n");\n                (void)scanf("%d", &amount);\n                total += amount;\n                count++;\n                printf("Added\\n");\n                break;\n            case 2:\n                printf("Records: %d\\n", count);\n                printf("Total: %d\\n", total);\n                break;\n            case 3:\n                printf("Bye\\n");\n                running = 0;\n                break;\n            default:\n                printf("Unknown command\\n");\n                break;\n        }\n    }\n    return 0;\n}',
        labels: [
          { lines: [4, 8], label: 'State: the two numbers the Vault keeps, the flag, and two input boxes. Everything initialised.' },
          { lines: [9, 11], label: 'Each pass: ask for a command and read it.' },
          { lines: [12, 12], label: 'Dispatch on the command.' },
          { lines: [13, 19], label: 'Add: ask for the amount, update total and count, confirm, leave the switch.' },
          { lines: [20, 23], label: 'Show: two lines of report.' },
          { lines: [24, 27], label: 'Quit: say Bye and flip the flag; the while sees it on the next check.' },
          { lines: [28, 30], label: 'Anything else is unknown, and the loop continues.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'In Python you would write `while True:` and `break` out of the loop from the quit branch. In C a `break` inside a switch would only leave the switch, so the idiom is a flag that the while condition tests.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The input is `5`, `1`, `7`, `3` (one per line). What is the complete output of the program in the concept step?',
      code: { language: 'c', source: 'while (running) {\n    printf("Command?\\n");\n    (void)scanf("%d", &command);\n    switch (command) {\n        case 1:\n            printf("Amount?\\n");\n            (void)scanf("%d", &amount);\n            total += amount;\n            count++;\n            printf("Added\\n");\n            break;\n        case 2:\n            printf("Records: %d\\n", count);\n            printf("Total: %d\\n", total);\n            break;\n        case 3:\n            printf("Bye\\n");\n            running = 0;\n            break;\n        default:\n            printf("Unknown command\\n");\n            break;\n    }\n}' },
      choices: [
        'Command?\nUnknown command\nCommand?\nAmount?\nAdded\nCommand?\nBye',
        'Command?\nUnknown command',
        'Command?\nUnknown command\nCommand?\nAmount?\nAdded 7\nCommand?\nBye',
        'Command?\nUnknown command\nCommand?\nAmount?\nAdded\nCommand?\nBye\nCommand?',
      ],
      answer: 'Command?\nUnknown command\nCommand?\nAmount?\nAdded\nCommand?\nBye',
      explanation: '5 hits default, but default only breaks out of the switch, so the loop asks again. 1 asks for an amount, reads 7 and prints just `Added`. 3 prints `Bye` and sets running to 0, so the while condition fails and no further `Command?` appears.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the loop with only the quit and unknown arms. Set the indentation yourself.',
      language: 'c',
      indentation: true,
      solution: ['while (running) {', '    printf("Command?\\n");', '    (void)scanf("%d", &command);', '    switch (command) {', '        case 3:', '            printf("Bye\\n");', '            running = 0;', '            break;', '        default:', '            printf("Unknown command\\n");', '            break;', '    }', '}'],
      distractors: ['while (running == 0) {', '            running = 1;'],
      explanation: 'The loop runs while the flag is 1 (non-zero), and quitting means setting it to 0. Setting it to 1 in the quit arm would loop forever.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the Vault v0.2 loop.',
      language: 'c',
      template: '#include <stdio.h>\nint main(void) {\n    int total = 0;\n    int count = 0;\n    int running = 1;\n    int command = 0;\n    int amount = 0;\n    while ({{cond}}) {\n        printf("Command?\\n");\n        (void)scanf("%d", &command);\n        switch (command) {\n            case 1:\n                printf("Amount?\\n");\n                (void)scanf("%d", &amount);\n                total {{add}} amount;\n                count{{inc}};\n                printf("Added\\n");\n                break;\n            case 2:\n                printf("Records: %d\\n", count);\n                printf("Total: %d\\n", total);\n                break;\n            case 3:\n                printf("Bye\\n");\n                running = {{stop}};\n                break;\n            {{def}}:\n                printf("Unknown command\\n");\n                break;\n        }\n    }\n    return 0;\n}',
      blanks: [
        { id: 'cond', answers: ['running', 'running == 1', 'running != 0'], hint: 'the flag itself is the condition' },
        { id: 'add', answers: ['+='], hint: 'add in place' },
        { id: 'inc', answers: ['++'], hint: 'one more record' },
        { id: 'stop', answers: ['0'], hint: 'the value that is false' },
        { id: 'def', answers: ['default'], hint: 'the else of a switch' },
      ],
    },
    {
      kind: 'create',
      prompt: 'Write Vault v0.2 exactly as planned. Repeat: print `Command?` and read an int. 1: print `Amount?`, read an int, add it to total, count it, print `Added`. 2: print `Records: <count>` then `Total: <total>`. 3: print `Bye` and stop. Anything else: print `Unknown command` and continue.',
      language: 'c',
      tests: [
        { description: 'spine example', stdin: '1\n50\n1\n-20\n2\n9\n3', expectedStdout: 'Command?\nAmount?\nAdded\nCommand?\nAmount?\nAdded\nCommand?\nRecords: 2\nTotal: 30\nCommand?\nUnknown command\nCommand?\nBye' },
        { description: 'quit immediately', stdin: '3', expectedStdout: 'Command?\nBye' },
        { description: 'unknown command then quit', stdin: '7\n3', expectedStdout: 'Command?\nUnknown command\nCommand?\nBye' },
        { description: 'show when empty', stdin: '2\n3', expectedStdout: 'Command?\nRecords: 0\nTotal: 0\nCommand?\nBye' },
        { description: 'negative total', stdin: '1\n-5\n2\n3', expectedStdout: 'Command?\nAmount?\nAdded\nCommand?\nRecords: 1\nTotal: -5\nCommand?\nBye' },
      ],
      hint: 'Write the labels from the concept step as comments first, then fill each one in: state, loop, read, switch with four arms. Run the tests after each arm.',
      solution: '#include <stdio.h>\n\nint main(void) {\n    int total = 0;\n    int count = 0;\n    int running = 1;\n    int command = 0;\n    int amount = 0;\n    while (running) {\n        printf("Command?\\n");\n        (void)scanf("%d", &command);\n        switch (command) {\n            case 1:\n                printf("Amount?\\n");\n                (void)scanf("%d", &amount);\n                total += amount;\n                count++;\n                printf("Added\\n");\n                break;\n            case 2:\n                printf("Records: %d\\n", count);\n                printf("Total: %d\\n", total);\n                break;\n            case 3:\n                printf("Bye\\n");\n                running = 0;\n                break;\n            default:\n                printf("Unknown command\\n");\n                break;\n        }\n    }\n    return 0;\n}\n',
      projectNote: 'Vault v0.2 complete: a menu loop that runs until the user chooses quit. Module 3 splits it into functions.',
    },
  ],
};

export const m2: Module = {
  id: 'c-m2',
  title: 'Deciding and repeating',
  goal: 'if/else with braces, while, for with counters, do/while, operators and precedence.',
  projectMilestone: 'Vault v0.2: a menu loop that runs until the user chooses quit.',
  status: 'available',
  lessons: [l21, l22, l23, l24, l25],
};
