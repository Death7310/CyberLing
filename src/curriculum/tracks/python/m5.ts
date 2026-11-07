import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 5: Functions                                                */
/* ------------------------------------------------------------------ */

const l51: Lesson = {
  id: 'py-5-1',
  title: 'Defining and calling',
  objective: 'Define a function, call it, and tell return apart from print.',
  minutes: 18,
  lexicon: [
    {
      id: 'py.5.def',
      term: 'def name(params):',
      kind: 'keyword',
      meaning: 'Define a function: give a name to an indented block that runs only when called. Nothing in the block runs at the def line.',
      example: 'def describe(amount):\n    return "expense"',
      analogy: 'A recipe card. Writing the card cooks nothing; following it does. Breaks: a recipe can be read in any order, but a def must come before its first call.',
    },
    {
      id: 'py.5.call',
      term: 'name(arguments)',
      kind: 'pattern',
      meaning: 'Call a function: jump into its body with each argument bound to the matching parameter, run it, and come back with the returned value in place of the call.',
      example: 'kind = describe(-30)',
      analogy: 'Looking something up in another chapter and coming back to where you were. Breaks: each call gets a fresh workspace; the chapter does not remember your last visit.',
    },
    {
      id: 'py.5.return',
      term: 'return value',
      kind: 'keyword',
      meaning: 'Leave the function immediately and hand the value back to the call. Lines after it in the function do not run. Only a returned value can be stored or computed with.',
      example: 'def after(balance, amount):\n    return balance + amount',
      analogy: 'An answer to a question. print is talking out loud: people hear it, but nobody can take the words and compute with them. Breaks: a function can answer only once per call.',
    },
    {
      id: 'py.5.frame',
      term: 'frame',
      kind: 'concept',
      meaning: 'The private workspace a call gets for its parameters and local names. Created at the call, discarded at return. This is the notional machine for functions.',
      example: 'describe(-30)   # frame: amount -> -30',
    },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A block with a name',
      body: `Until now every program was one long list of statements. A **function** packs a block under a name so you can run it from anywhere, as many times as you like.

\`def name(parameters):\` introduces the block. Nothing inside runs yet: Python only remembers it. The block runs when you **call** the name with parentheses.

Here is the machine picture. A call **jumps** into the body with a fresh workspace, a *frame*. The arguments you pass are bound to the parameter names inside that frame. \`return value\` jumps back to the call, and the call itself becomes that value. Without a return, nothing useful comes back.

\`print\` shows; \`return\` hands back. Only a returned value can be stored in a name or used in arithmetic.

Because Python reads top to bottom, the \`def\` must come before the first call.`,
      example: {
        language: 'python',
        source: 'def describe(amount):\n    if amount < 0:\n        return "expense"\n    return "income"\n\nkind = describe(-30)\nprint(kind)\nprint(describe(50))',
        labels: [
          { lines: [1, 1], label: 'Define: name the block and its parameter. Nothing runs yet.' },
          { lines: [2, 4], label: 'The body. return jumps back with a value; the second return is reached only when the first was skipped.' },
          { lines: [6, 6], label: 'Call: jump in with amount bound to -30, come back with "expense", store it.' },
          { lines: [7, 8], label: 'Use the returned values. A call can sit anywhere a value can.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'def show(n):\n    print(n * 2)\n\ndef give(n):\n    return n * 2\n\nshow(5)\nx = give(5)\nprint(x + 1)' },
      choices: ['10\n11', '10\n10', '11', '10\n10\n11'],
      answer: '10\n11',
      explanation: '`show(5)` prints 10 from inside the function and hands nothing back. `give(5)` prints nothing on its own; it hands back 10, which the caller stores in `x` and uses: 11. Printing happens only where a `print` is; a bare `give(5)` on its own line would show nothing at all.',
    },
    {
      kind: 'parsons',
      prompt: 'Define a function that prints a balance line, then call it for 100 and for -20. Set indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['def report(balance):', '    print(f"Balance: {balance}")', 'report(100)', 'report(-20)'],
      distractors: ['def report(balance)', 'print(report)'],
      explanation: 'A def line ends with a colon like any block introducer. A function runs only when it is called with parentheses; `print(report)` shows the function itself, not a balance. And the def must come before the first call.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program prints `70`.',
      language: 'python',
      template: '{{kw}} after(balance, amount):\n    {{ret}} balance + amount\nprint(after(100, -30))',
      blanks: [
        { id: 'kw', answers: ['def'], hint: 'the keyword that names a block' },
        { id: 'ret', answers: ['return'], hint: 'hand the value back to the call' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Two problems: `apply` is called before it is defined, and it prints the new balance instead of handing it back, so even once it is found the caller would store `None`. Move the definition to the top and make it `return` the new balance. For 100 and -30 the output is the two prompts, then `Balance: 70` only.',
      language: 'python',
      starter: 'print("Balance?")\nbalance = int(input())\nprint("Amount?")\namount = int(input())\nbalance = apply(balance, amount)\nprint(f"Balance: {balance}")\n\ndef apply(balance, amount):\n    print(balance + amount)\n',
      tests: [
        { description: '100 and -30', stdin: '100\n-30', expectedStdout: 'Balance?\nAmount?\nBalance: 70' },
        { description: '0 and -5', stdin: '0\n-5', expectedStdout: 'Balance?\nAmount?\nBalance: -5' },
      ],
      hint: 'Python reads top to bottom: at the line `apply(balance, amount)` the name must already exist. Inside, replace `print(...)` with `return ...`.',
      solution: 'def apply(balance, amount):\n    return balance + amount\n\nprint("Balance?")\nbalance = int(input())\nprint("Amount?")\namount = int(input())\nbalance = apply(balance, amount)\nprint(f"Balance: {balance}")\n',
    },
    {
      kind: 'create',
      prompt: 'Define two functions and use them. `describe(amount)` returns `expense`, `nothing` or `income`. `apply(balance, amount)` returns the balance after the amount. Then the main program: print `Balance?` and read a whole number, print `Amount?` and read one, print the description, and print `Balance: <new>`. Write both functions first, then the main program under them.',
      language: 'python',
      tests: [
        { description: '100, -30', stdin: '100\n-30', expectedStdout: 'Balance?\nAmount?\nexpense\nBalance: 70' },
        { description: '100, 0', stdin: '100\n0', expectedStdout: 'Balance?\nAmount?\nnothing\nBalance: 100' },
        { description: '100, 15', stdin: '100\n15', expectedStdout: 'Balance?\nAmount?\nincome\nBalance: 115' },
        { description: '10, -10 lands on zero', stdin: '10\n-10', expectedStdout: 'Balance?\nAmount?\nexpense\nBalance: 0' },
      ],
      hint: 'In `describe`, each branch can `return` directly: once a return runs, the rest of the function is skipped.',
      solution: 'def describe(amount):\n    if amount < 0:\n        return "expense"\n    if amount == 0:\n        return "nothing"\n    return "income"\n\ndef apply(balance, amount):\n    return balance + amount\n\nprint("Balance?")\nbalance = int(input())\nprint("Amount?")\namount = int(input())\nprint(describe(amount))\nbalance = apply(balance, amount)\nprint(f"Balance: {balance}")\n',
      projectNote: 'The v0.2 logic, now as two reusable functions: the first bricks of Ledger v0.5.',
    },
  ],
};

const l52: Lesson = {
  id: 'py-5-2',
  title: 'Parameters and arguments',
  objective: 'Pass values by position or by name, give parameters defaults, and return more than one value.',
  minutes: 18,
  lexicon: [
    {
      id: 'py.5.parameter',
      term: 'parameter / argument',
      kind: 'concept',
      meaning: 'A parameter is a name in the def line; an argument is the value given at the call. Arguments are matched to parameters left to right.',
      example: 'def apply(balance, amount):   # parameters\napply(100, -30)               # arguments',
    },
    {
      id: 'py.5.default',
      term: 'param=value in a def',
      kind: 'pattern',
      meaning: 'A default value for a parameter. The caller may leave that argument out. Parameters with defaults must come after those without.',
      example: 'def apply(balance, amount, fee=0):',
    },
    {
      id: 'py.5.keyword-arg',
      term: 'name=value at a call',
      kind: 'pattern',
      meaning: 'A keyword argument: pass a value by naming the parameter. Keyword arguments come after the positional ones and may be in any order among themselves.',
      example: 'apply(100, -30, fee=5)',
      analogy: 'Addressing someone by name instead of by seat number. Breaks: the seat-number (positional) arguments still have to come first.',
    },
    {
      id: 'py.5.tuple-return',
      term: 'return a, b',
      kind: 'pattern',
      meaning: 'Return several values at once as a tuple. The caller unpacks them into names.',
      example: 'return new_balance, fee\n# at the call:\nbalance, charged = apply(100, 40)',
    },
    {
      id: 'py.5.none',
      term: 'None',
      kind: 'keyword',
      meaning: 'The value that means "nothing here". A function with no return hands back None, and so does print.',
      example: 'result = print("hi")\nprint(result)   # None',
    },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'What goes in, what comes out',
      body: `The names in the \`def\` line are **parameters**; the values you pass at the call are **arguments**. Python matches them left to right, so order matters.

A parameter can carry a **default**: \`fee=0\`. Callers may then leave it out. Defaults must come after the parameters without defaults.

At the call you can name an argument: \`apply(100, -30, fee=5)\`. These **keyword arguments** read better, and they let you fill a later parameter without repeating the earlier defaults.

A function returns one value, but that value can be a tuple: \`return new_balance, fee\`. The caller unpacks it: \`balance, charged = apply(...)\`.

A function that reaches its end without a \`return\` hands back \`None\`, the value meaning "nothing here". Storing the result of a function that only prints gives you \`None\`, not the printed text.`,
      example: {
        language: 'python',
        source: 'def apply(balance, amount, fee=0):\n    new_balance = balance + amount - fee\n    return new_balance, fee\n\nprint(apply(100, -30))\nprint(apply(100, -30, 5))\nprint(apply(100, -30, fee=1))\nbalance, charged = apply(100, 40)\nprint(f"Balance: {balance}, fee: {charged}")',
        labels: [
          { lines: [1, 1], label: 'Three parameters; the last has a default, so callers may omit it.' },
          { lines: [2, 3], label: 'Return two values at once: a tuple.' },
          { lines: [5, 5], label: 'Two positional arguments; fee falls back to 0. Prints (70, 0).' },
          { lines: [6, 7], label: 'The third argument by position, then by keyword: (65, 5) and (69, 1).' },
          { lines: [8, 9], label: 'Unpack the returned tuple into two names.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'def log(amount):\n    print(f"logged {amount}")\n\nresult = log(25)\nprint(result)' },
      choices: ['logged 25\nNone', 'logged 25\n25', 'logged 25', 'None\nlogged 25'],
      answer: 'logged 25\nNone',
      explanation: '`log` prints while it runs, then reaches its end without a `return`, so the call hands back `None`. `result` is bound to `None` and the second print shows it. If you want 25 back, return it.',
    },
    {
      kind: 'parsons',
      prompt: 'Build a function that returns an amount paired with a category, where the category defaults to `misc`. Then call it with only the amount, unpack the pair, and print `misc: -30`. Set indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['def read_pair(amount, category="misc"):', '    return amount, category', 'amount, category = read_pair(-30)', 'print(f"{category}: {amount}")'],
      distractors: ['def read_pair(category="misc", amount):', 'amount, category = read_pair(category="food")'],
      explanation: 'Parameters with defaults go after the required ones, and every required parameter must receive an argument: `read_pair(category="food")` leaves `amount` unfilled and crashes.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program prints `65 5`: a default of 0 for the fee, a two-value return, and a keyword argument at the call.',
      language: 'python',
      template: 'def apply(balance, amount, fee{{eq}}0):\n    return balance + amount - fee{{sep}} fee\nnew, charged = apply(100, -30, {{kw}}=5)\nprint(new, charged)',
      blanks: [
        { id: 'eq', answers: ['='], hint: 'a default is written like an assignment, inside the parentheses' },
        { id: 'sep', answers: [','], hint: 'two values with this between them make a tuple' },
        { id: 'kw', answers: ['fee'], hint: 'name the parameter you are filling' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The first call leaves out the currency and crashes. Give `currency` a default of `"EUR"` so that call works, and leave the keyword call as it is. For 50 the output is `Amount?`, `50 EUR`, `50 USD`.',
      language: 'python',
      starter: 'def describe(amount, currency):\n    return f"{amount} {currency}"\n\nprint("Amount?")\namount = int(input())\nprint(describe(amount))\nprint(describe(amount, currency="USD"))\n',
      tests: [
        { description: '50', stdin: '50', expectedStdout: 'Amount?\n50 EUR\n50 USD' },
        { description: '-20', stdin: '-20', expectedStdout: 'Amount?\n-20 EUR\n-20 USD' },
      ],
      hint: 'Only the def line changes: `currency="EUR"`.',
      solution: 'def describe(amount, currency="EUR"):\n    return f"{amount} {currency}"\n\nprint("Amount?")\namount = int(input())\nprint(describe(amount))\nprint(describe(amount, currency="USD"))\n',
    },
    {
      kind: 'create',
      prompt: 'Define `balance_after(amounts, start=0)` that returns **two** values: the balance after adding every amount in the list to `start`, and the number of amounts. Main program: print `Start?` and read a whole number; then print `Amount (or quit)?` repeatedly, collecting whole numbers into a list until the user types `quit`. Call `balance_after` with `start=` as a keyword argument, unpack the pair, and print `Entries: <count>` then `Final balance: <n>`.',
      language: 'python',
      tests: [
        { description: '100 then -30, 50, quit', stdin: '100\n-30\n50\nquit', expectedStdout: 'Start?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nEntries: 2\nFinal balance: 120' },
        { description: 'quit at once', stdin: '5\nquit', expectedStdout: 'Start?\nAmount (or quit)?\nEntries: 0\nFinal balance: 5' },
        { description: 'goes negative', stdin: '0\n-70\nquit', expectedStdout: 'Start?\nAmount (or quit)?\nAmount (or quit)?\nEntries: 1\nFinal balance: -70' },
      ],
      hint: 'Inside the function: start from `start`, add each amount in a for loop, then `return balance, len(amounts)`.',
      solution: 'def balance_after(amounts, start=0):\n    balance = start\n    for amount in amounts:\n        balance = balance + amount\n    return balance, len(amounts)\n\nprint("Start?")\nstart = int(input())\namounts = []\nwhile True:\n    print("Amount (or quit)?")\n    text = input()\n    if text == "quit":\n        break\n    amounts.append(int(text))\nfinal, count = balance_after(amounts, start=start)\nprint(f"Entries: {count}")\nprint(f"Final balance: {final}")\n',
      projectNote: 'The Ledger loop now feeds a function that returns a pair. v0.5 will do the same with its entries and running balance.',
    },
  ],
};

const l53: Lesson = {
  id: 'py-5-3',
  title: 'Where names live',
  objective: 'Explain which names a function can see and why assigning inside it does not change the outside.',
  minutes: 16,
  lexicon: [
    {
      id: 'py.5.local',
      term: 'local name',
      kind: 'concept',
      meaning: 'A name assigned inside a function. It lives in that call\'s frame and disappears at return. The same spelling outside the function is a different name.',
      example: 'def fee(amount):\n    charge = amount * 10   # local\n    return charge',
      analogy: 'Scratch paper you hand in at the end of an exam. Breaks: you can return a copy of what you worked out; the paper itself still goes.',
    },
    {
      id: 'py.5.global-read',
      term: 'reading an outer name',
      kind: 'concept',
      meaning: 'A function may read a name defined at the top level of the file without any declaration. Assigning to that spelling inside creates a local name instead.',
      example: 'rate = 10\ndef fee(amount):\n    return amount * rate',
    },
    {
      id: 'py.5.alias-param',
      term: 'list parameter (aliasing)',
      kind: 'concept',
      meaning: 'Passing a list binds the parameter to the same list, not a copy. Methods like append change it for the caller too; rebinding the parameter does not.',
      example: 'def record(entries, amount):\n    entries.append(amount)',
      analogy: 'Two names on one letterbox: post through either and the same box fills. Breaks: repainting one name (rebinding) does not touch the box, and numbers and strings have no letterbox to share.',
    },
    {
      id: 'py.5.global-kw',
      term: 'global name',
      kind: 'keyword',
      meaning: 'Declares that assignments to this name inside the function hit the top-level name. Avoid it: return the new value and let the caller rebind.',
      example: 'def deposit(amount):\n    global balance        # avoid\n    balance = balance + amount',
    },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Local, outer, and shared',
      body: `Each call gets its own frame, and names assigned inside the function live in that frame. They are **local**: born when the call starts, gone when it returns. Asking for \`charge\` outside \`fee\` is a NameError.

A function can **read** a name from the enclosing file, a *global* name, without doing anything special: \`rate\` below.

But **assigning** to a name inside a function creates a new local name of that spelling. It never changes the outer one. That is why \`reset\` leaves \`spent\` alone: the function received the value 40, not the label.

Lists are different only in appearance. Passing a list binds the parameter to the *same* list, so \`entries.append(x)\` inside is visible outside, while \`entries = []\` just moves the local label.

Python has a \`global\` keyword to force writes to outer names. Avoid it: return the new value and let the caller rebind.`,
      example: {
        language: 'python',
        source: 'rate = 10\n\ndef fee(amount):\n    charge = amount * rate\n    return charge\n\ndef reset(amount):\n    amount = 0\n    return amount\n\nprint(fee(5))\nspent = 40\nprint(reset(spent))\nprint(spent)',
        labels: [
          { lines: [1, 1], label: 'A global name: every function below can read it.' },
          { lines: [3, 5], label: 'charge is local to this call. rate is only read, so the outer one is found.' },
          { lines: [7, 9], label: 'Assigning to the parameter moves the local label only.' },
          { lines: [11, 11], label: 'Prints 50.' },
          { lines: [12, 14], label: 'Prints 0, then 40: the outer spent never moved.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'def add_entry(entries, amount):\n    entries.append(amount)\n\ndef clear(entries):\n    entries = []\n\nlog = [10]\nadd_entry(log, -5)\nclear(log)\nprint(log)' },
      choices: ['[10, -5]', '[]', '[10]', 'an error'],
      answer: '[10, -5]',
      explanation: 'Inside `add_entry`, `entries` is another label on the same list as `log`, so `append` changes the list the caller sees. Inside `clear`, `entries = []` moves the local label to a brand-new empty list; `log` still points at the old one, which keeps both values.',
    },
    {
      kind: 'parsons',
      prompt: 'Update a balance through a function **without** `global`: the function returns the new value and the caller keeps it. Set indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['def apply(balance, amount):', '    return balance + amount', 'balance = 100', 'balance = apply(balance, -30)', 'print(balance)'],
      distractors: ['    global balance', '    balance = balance + amount', 'apply(balance, -30)'],
      explanation: 'Assigning inside the function would only touch a local name, and `global` is the habit we are avoiding. The returned value also has to be caught: a bare `apply(balance, -30)` computes 70 and throws it away.',
    },
    {
      kind: 'modify',
      prompt: 'This crashes: assigning to `balance` inside `deposit` makes it a local name, and the right-hand side then reads that local before it has a value. Fix it without `global`: give `deposit` the balance as a parameter, return the new balance, and rebind at the call. For 50 the output is `Amount?` then `Balance: 150`.',
      language: 'python',
      starter: 'balance = 100\n\ndef deposit(amount):\n    balance = balance + amount\n\nprint("Amount?")\namount = int(input())\ndeposit(amount)\nprint(f"Balance: {balance}")\n',
      tests: [
        { description: '50', stdin: '50', expectedStdout: 'Amount?\nBalance: 150' },
        { description: '-100 lands on zero', stdin: '-100', expectedStdout: 'Amount?\nBalance: 0' },
      ],
      hint: 'Three edits: `def deposit(balance, amount):`, `return balance + amount`, and `balance = deposit(balance, amount)`.',
      solution: 'balance = 100\n\ndef deposit(balance, amount):\n    return balance + amount\n\nprint("Amount?")\namount = int(input())\nbalance = deposit(balance, amount)\nprint(f"Balance: {balance}")\n',
    },
    {
      kind: 'create',
      prompt: 'Two functions, two kinds of effect. `record(entries, amount)` appends the amount to the list it is given; it needs no return, because the caller shares the list. `total(entries)` adds up the list with a local accumulator and returns the sum. Main program: start with an empty list; print `Amount (or quit)?` repeatedly, calling `record` for each whole number until the user types `quit`; then print `Entries: <count>` and `Total: <sum>`.',
      language: 'python',
      tests: [
        { description: '-30, 50, quit', stdin: '-30\n50\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nEntries: 2\nTotal: 20' },
        { description: 'quit at once', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nEntries: 0\nTotal: 0' },
        { description: 'all expenses', stdin: '-5\n-7\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nEntries: 2\nTotal: -12' },
      ],
      hint: 'The accumulator in `total` (`result = 0`) is local; it is created fresh on every call, which is exactly what you want.',
      solution: 'def record(entries, amount):\n    entries.append(amount)\n\ndef total(entries):\n    result = 0\n    for amount in entries:\n        result = result + amount\n    return result\n\nentries = []\nwhile True:\n    print("Amount (or quit)?")\n    text = input()\n    if text == "quit":\n        break\n    record(entries, int(text))\nprint(f"Entries: {len(entries)}")\nprint(f"Total: {total(entries)}")\n',
      projectNote: 'The entries list of v0.5 is built the same way: one function fills it, another reads it.',
    },
  ],
};

const l54: Lesson = {
  id: 'py-5-4',
  title: 'One job per function',
  objective: 'Split a flat program into functions named after its subgoals, each documented and easy to test.',
  minutes: 20,
  lexicon: [
    {
      id: 'py.5.docstring',
      term: '"""docstring"""',
      kind: 'punctuation',
      meaning: 'A string as the first line of a function body, saying what the function does. Python keeps it but does not print it.',
      example: 'def apply(balance, amount):\n    """Return the balance after the amount."""\n    return balance + amount',
    },
    {
      id: 'py.5.decompose',
      term: 'decomposition',
      kind: 'concept',
      meaning: 'Split a program into functions, one per subgoal, each with one job. The subgoal labels become the function names and the main program becomes the plan.',
      example: '# ask and read   -> read_int\n# classify       -> classify\n# update         -> apply',
    },
    {
      id: 'py.5.pure',
      term: 'pure function',
      kind: 'concept',
      meaning: 'A function whose result depends only on its arguments and that changes nothing outside: no print, no input, no list mutation. Easy to test with a single print.',
      example: 'print(classify(-5))   # must show expense',
      analogy: 'A calculator button: same keys, same display, every time. Breaks: a program needs some impure parts to talk to the user at all.',
    },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Subgoals become functions',
      body: `Since Module 1 you have read programs through **subgoal labels**: "ask and read the balance", "classify the amount", "update and report". A function is a subgoal label that runs. Turn each label into a \`def\`, and the labels become the names.

Give each function **one job**, and say that job in a **docstring**: a string on the first line of the body, in triple quotes. Readers and tools see it; Python does not act on it.

Prefer functions that only compute: no \`print\`, no \`input\`, a result that depends only on the arguments. These **pure** functions are easy to check: \`print(classify(-5))\` must show \`expense\`, every time. Keep the talking parts, like \`read_int\`, small and separate, so most of the program can be tested that way.

The main program at the bottom then reads like the plan.`,
      example: {
        language: 'python',
        source: 'def read_int(prompt):\n    """Print the prompt on its own line, then read a whole number."""\n    print(prompt)\n    return int(input())\n\ndef classify(amount):\n    """Return expense, nothing or income."""\n    if amount < 0:\n        return "expense"\n    if amount == 0:\n        return "nothing"\n    return "income"\n\ndef apply(balance, amount):\n    """Return the balance after the amount."""\n    return balance + amount\n\nbalance = read_int("Balance?")\namount = read_int("Amount?")\nprint(classify(amount))\nbalance = apply(balance, amount)\nprint(f"Balance: {balance}")',
        labels: [
          { lines: [1, 4], label: 'Subgoal "ask and read a number", with a docstring. Not pure: it talks to the user.' },
          { lines: [6, 12], label: 'Subgoal "classify". Pure: same argument, same answer. return ends the function, so plain if is enough.' },
          { lines: [14, 16], label: 'Subgoal "update". Pure, and the only place the balance rule lives.' },
          { lines: [18, 22], label: 'The main program: the plan, one call per subgoal.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'def classify(amount):\n    """Return expense, nothing or income."""\n    if amount < 0:\n        return "expense"\n    if amount == 0:\n        return "nothing"\n    return "income"\n\nprint(classify(0), classify(-1))' },
      choices: ['nothing expense', 'nothing income', 'Return expense, nothing or income.\nnothing expense', 'nothing\nexpense'],
      answer: 'nothing expense',
      explanation: 'The docstring is kept, not printed. For 0 the first test fails, the second succeeds and `return` leaves the function at once, so the final `return "income"` is never reached. For -1 the first return fires. `print` with two arguments joins them with a space on one line.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `read_int` with its docstring, then use it once. Set indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['def read_int(prompt):', '    """Print the prompt on its own line, then read a whole number."""', '    print(prompt)', '    return int(input())', 'balance = read_int("Balance?")', 'print(f"Balance: {balance}")'],
      distractors: ['    return int(input(prompt))', '    print(int(input()))'],
      explanation: '`input(prompt)` would put the answer on the same line as the question, which breaks the transcript convention. And `read_int` must hand the number back, not print it: the caller decides what to do with it.',
    },
    {
      kind: 'modify',
      prompt: 'This program classifies two amounts with the same if-chain written twice, and one copy has a copy-paste bug. Replace both copies with a single function `classify(amount)` that returns the word, and call it twice. With one copy there is nothing to keep in sync. For 5 then 0 the output ends `income`, `nothing`, `Total: 5`.',
      language: 'python',
      starter: 'print("First amount?")\nfirst = int(input())\nprint("Second amount?")\nsecond = int(input())\nif first < 0:\n    print("expense")\nelif first == 0:\n    print("nothing")\nelse:\n    print("income")\nif second < 0:\n    print("expense")\nelif first == 0:\n    print("nothing")\nelse:\n    print("income")\nprint(f"Total: {first + second}")\n',
      tests: [
        { description: '5 then 0 (the buggy copy)', stdin: '5\n0', expectedStdout: 'First amount?\nSecond amount?\nincome\nnothing\nTotal: 5' },
        { description: '-3 then 4', stdin: '-3\n4', expectedStdout: 'First amount?\nSecond amount?\nexpense\nincome\nTotal: 1' },
        { description: '0 then -2', stdin: '0\n-2', expectedStdout: 'First amount?\nSecond amount?\nnothing\nexpense\nTotal: -2' },
      ],
      hint: 'Write `classify` at the top with a docstring, returning the word in each branch. The two chains become `print(classify(first))` and `print(classify(second))`.',
      solution: 'def classify(amount):\n    """Return expense, nothing or income."""\n    if amount < 0:\n        return "expense"\n    if amount == 0:\n        return "nothing"\n    return "income"\n\nprint("First amount?")\nfirst = int(input())\nprint("Second amount?")\nsecond = int(input())\nprint(classify(first))\nprint(classify(second))\nprint(f"Total: {first + second}")\n',
    },
    {
      kind: 'create',
      prompt: 'Write a small program from three functions, each with a docstring. `read_int(prompt)` prints the prompt on its own line and returns the whole number typed. `read_amounts()` prints `Amount (or quit)?` repeatedly and returns the list of whole numbers typed before `quit`. `final_balance(start, amounts)` is pure: it returns `start` plus every amount. Main program: `balance = read_int("Balance?")`, read the amounts, then print `Entries: <count>` and `Final balance: <n>`.',
      language: 'python',
      tests: [
        { description: '100 then -30, 50, quit', stdin: '100\n-30\n50\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nEntries: 2\nFinal balance: 120' },
        { description: 'quit at once', stdin: '5\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nEntries: 0\nFinal balance: 5' },
        { description: 'overdrawn', stdin: '20\n-50\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nAmount (or quit)?\nEntries: 1\nFinal balance: -30' },
      ],
      hint: 'Write the three def lines and docstrings first, then fill each body, then the four-line main program. Test `final_balance` on its own with a temporary print if a test fails.',
      solution: 'def read_int(prompt):\n    """Print the prompt on its own line, then read a whole number."""\n    print(prompt)\n    return int(input())\n\ndef read_amounts():\n    """Ask for amounts until quit; return them as a list of ints."""\n    amounts = []\n    while True:\n        print("Amount (or quit)?")\n        text = input()\n        if text == "quit":\n            break\n        amounts.append(int(text))\n    return amounts\n\ndef final_balance(start, amounts):\n    """Return start plus every amount."""\n    balance = start\n    for amount in amounts:\n        balance = balance + amount\n    return balance\n\nbalance = read_int("Balance?")\namounts = read_amounts()\nprint(f"Entries: {len(amounts)}")\nprint(f"Final balance: {final_balance(balance, amounts)}")\n',
      projectNote: 'Ledger v0.3, rebuilt as functions. Add categories and a summary and you have v0.5.',
    },
  ],
};

const l55: Lesson = {
  id: 'py-5-5',
  title: 'Project: Ledger v0.5',
  objective: 'Rebuild Ledger v0.4 from named functions without changing a line of its output.',
  minutes: 22,
  lexicon: [
    {
      id: 'py.5.main-flow',
      term: 'main program (top level)',
      kind: 'pattern',
      meaning: 'The unindented lines at the bottom that call the functions in order. Keep it short: it is the plan, the functions are the steps.',
      example: 'balance = read_int("Balance?")\nentries, balance = read_entries(balance)\nprint_report(entries, balance)',
    },
    {
      id: 'py.5.signature',
      term: 'signature',
      kind: 'concept',
      meaning: "A function's name and parameter list: what it is called and what it needs. Agree the signatures first and the parts can be written, and tested, separately.",
      example: 'def apply(balance, amount):',
      analogy: 'A contract between the caller and the function. Breaks: a signature says nothing about what comes back; the docstring has to say that.',
    },
    {
      id: 'py.5.refactor',
      term: 'refactor',
      kind: 'concept',
      meaning: 'Change the structure of a program without changing what it does. The old tests must still pass afterwards; that is how you know.',
      example: '# v0.4 -> v0.5: same transcript, now in functions',
    },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The same program, in parts',
      body: `Ledger v0.5 behaves exactly like v0.4. Only the shape changes: each subgoal of v0.4 is now a function with one job, and the main program at the bottom is three lines. This is a **refactor**: same input, same output, better structure, and the old transcript tests prove nothing broke.

Read the **signatures** first; they are the contract between the parts. \`read_int(prompt)\` talks to the user. \`apply(balance, amount)\` and \`summarize(entries)\` are pure. \`read_entries(balance)\` runs the loop and returns the entries together with the running balance, as a pair. \`print_report(entries, balance)\` prints the summary block and the footer.

\`read_entries\` needs the starting balance only to print \`Balance: <running>\` after each entry. That line is part of the v0.4 transcript, so it stays.`,
      example: {
        language: 'python',
        source: 'def read_int(prompt):\n    """Print the prompt on its own line, then read a whole number."""\n    print(prompt)\n    return int(input())\n\ndef apply(balance, amount):\n    """Return the balance after this amount."""\n    return balance + amount\n\ndef read_entries(balance):\n    """Ask for entries until quit, printing the running balance.\n    Return the list of (amount, category) pairs and the final balance."""\n    entries = []\n    while True:\n        print("Amount (or quit)?")\n        text = input()\n        if text == "quit":\n            break\n        amount = int(text)\n        print("Category?")\n        category = input()\n        entries.append((amount, category))\n        balance = apply(balance, amount)\n        print(f"Balance: {balance}")\n    return entries, balance\n\ndef summarize(entries):\n    """Return a dict mapping each category to its total."""\n    totals = {}\n    for amount, category in entries:\n        totals[category] = totals.get(category, 0) + amount\n    return totals\n\ndef print_report(entries, balance):\n    """Print the summary block, then the footer."""\n    print("--- summary ---")\n    totals = summarize(entries)\n    for category in sorted(totals):\n        print(f"{category}: {totals[category]}")\n    print(f"Entries: {len(entries)}")\n    print(f"Final balance: {balance}")\n\nbalance = read_int("Balance?")\nentries, balance = read_entries(balance)\nprint_report(entries, balance)',
        labels: [
          { lines: [1, 4], label: 'Talk to the user: ask on one line, read a whole number.' },
          { lines: [6, 8], label: 'Pure: the balance rule in one place.' },
          { lines: [10, 25], label: 'The v0.4 loop. Collects (amount, category) pairs, prints the running balance, returns both results as a tuple.' },
          { lines: [27, 32], label: 'Pure: entries in, totals by category out. Easy to check with one print.' },
          { lines: [34, 41], label: 'The summary block, sorted by category name, then the footer.' },
          { lines: [43, 45], label: 'The main program: three calls that read like the plan.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What does the last line print?',
      code: { language: 'python', source: 'def summarize(entries):\n    """Return a dict mapping each category to its total."""\n    totals = {}\n    for amount, category in entries:\n        totals[category] = totals.get(category, 0) + amount\n    return totals\n\nprint(summarize([(-30, "food"), (50, "salary"), (-10, "food")]))' },
      choices: ["{'food': -40, 'salary': 50}", "{'food': -10, 'salary': 50}", "{'food': -30, 'salary': 50, 'food': -10}", "{'salary': 50, 'food': -40}"],
      answer: "{'food': -40, 'salary': 50}",
      explanation: '`totals.get(category, 0)` fetches the running total (0 the first time) and the amount is added to it, so food accumulates -30 then -10. A dict holds one value per key, in the order keys were first added, so food comes before salary here; `print_report` sorts the keys itself when it prints.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `summarize`: a dict of totals per category, built from a list of `(amount, category)` pairs. Set indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['def summarize(entries):', '    totals = {}', '    for amount, category in entries:', '        totals[category] = totals.get(category, 0) + amount', '    return totals'],
      distractors: ['    for category, amount in entries:', '        totals[category] = amount'],
      explanation: 'Each pair is (amount, category) in that order, so the unpacking must match. Assigning the bare amount would overwrite the previous total instead of adding to it; `.get(category, 0)` supplies the old total, or 0 for a new category.',
    },
    {
      kind: 'create',
      prompt: 'Write Ledger v0.5: the same transcript as v0.4, built from `read_int(prompt)`, `read_entries(balance)`, `apply(balance, amount)`, `summarize(entries)` and `print_report(entries, balance)`, each with a docstring. Prompts: `Balance?`, then `Amount (or quit)?` and `Category?` for each entry, with `Balance: <running>` after each entry. After `quit`: `--- summary ---`, one `<category>: <total>` line per category sorted by name, `Entries: <count>`, `Final balance: <n>`. Start from the labels in the concept step: write the five `def` lines and their docstrings first, then fill the bodies, then the three-line main program.',
      language: 'python',
      tests: [
        { description: 'v0.4 transcript: 100; -30 food; 50 salary; -10 food; quit', stdin: '100\n-30\nfood\n50\nsalary\n-10\nfood\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: 70\nAmount (or quit)?\nCategory?\nBalance: 120\nAmount (or quit)?\nCategory?\nBalance: 110\nAmount (or quit)?\n--- summary ---\nfood: -40\nsalary: 50\nEntries: 3\nFinal balance: 110' },
        { description: 'overdrawn: 20; -50 rent; quit', stdin: '20\n-50\nrent\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: -30\nAmount (or quit)?\n--- summary ---\nrent: -50\nEntries: 1\nFinal balance: -30' },
        { description: 'quit at once', stdin: '0\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\n--- summary ---\nEntries: 0\nFinal balance: 0' },
        { description: 'categories sorted by name, not by entry order', stdin: '0\n5\nzoo\n7\napple\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: 5\nAmount (or quit)?\nCategory?\nBalance: 12\nAmount (or quit)?\n--- summary ---\napple: 7\nzoo: 5\nEntries: 2\nFinal balance: 12' },
      ],
      hint: 'Run the tests after each function. `apply` and `summarize` are pure, so you can check them alone with a temporary `print(summarize([(-30, "food")]))` at the bottom; remove it before the final run.',
      solution: 'def read_int(prompt):\n    """Print the prompt on its own line, then read a whole number."""\n    print(prompt)\n    return int(input())\n\ndef apply(balance, amount):\n    """Return the balance after this amount."""\n    return balance + amount\n\ndef read_entries(balance):\n    """Ask for entries until quit, printing the running balance.\n    Return the list of (amount, category) pairs and the final balance."""\n    entries = []\n    while True:\n        print("Amount (or quit)?")\n        text = input()\n        if text == "quit":\n            break\n        amount = int(text)\n        print("Category?")\n        category = input()\n        entries.append((amount, category))\n        balance = apply(balance, amount)\n        print(f"Balance: {balance}")\n    return entries, balance\n\ndef summarize(entries):\n    """Return a dict mapping each category to its total."""\n    totals = {}\n    for amount, category in entries:\n        totals[category] = totals.get(category, 0) + amount\n    return totals\n\ndef print_report(entries, balance):\n    """Print the summary block, then the footer."""\n    print("--- summary ---")\n    totals = summarize(entries)\n    for category in sorted(totals):\n        print(f"{category}: {totals[category]}")\n    print(f"Entries: {len(entries)}")\n    print(f"Final balance: {balance}")\n\nbalance = read_int("Balance?")\nentries, balance = read_entries(balance)\nprint_report(entries, balance)\n',
      projectNote: 'Ledger v0.5 complete: the v0.4 transcript, now produced by five named functions. Module 6 adds file loading and error handling inside these functions without touching the rest.',
    },
  ],
};

export const m5: Module = {
  id: 'py-m5',
  title: 'Functions',
  goal: 'def, parameters, return, scope, docstrings, decomposition into subgoals.',
  projectMilestone: 'Ledger v0.5: the same program split into named functions (read_entry, apply, report).',
  status: 'available',
  lessons: [l51, l52, l53, l54, l55],
};
