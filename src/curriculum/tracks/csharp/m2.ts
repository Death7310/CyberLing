import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 2: Control flow and methods                                 */
/* ------------------------------------------------------------------ */

const l21: Lesson = {
  id: 'cs-2-1',
  title: 'Branches with braces',
  objective: 'Choose between outcomes with if/else if/else and switch.',
  minutes: 20,
  lexicon: [
    { id: 'cs.2.if-else', term: 'if (cond) { ... } else { ... }', kind: 'keyword', meaning: 'Run the first block when the condition is true, otherwise the second. The condition sits in parentheses and must be a bool: an int is not accepted.', example: 'if (amount < 0)\n{\n    Console.WriteLine("expense");\n}\nelse\n{\n    Console.WriteLine("income");\n}' },
    { id: 'cs.2.else-if', term: 'else if (cond)', kind: 'keyword', meaning: 'Another question asked only when every question above it was false. Two words in C#, not elif.', example: 'else if (amount == 0)\n{\n    Console.WriteLine("nothing");\n}' },
    { id: 'cs.2.andor', term: '&& || !', kind: 'operator', meaning: 'And, or, not. Both sides of && and || must be complete bool expressions; the right side is skipped when the left side already decides.', example: 'amount < 0 && amount > -1000', analogy: 'Python\'s and / or / not with symbols. Breaks: `x < 0 && > -1000` is not a sentence in either language, but C# also refuses `if (n)` for an int n.' },
    { id: 'cs.2.switch', term: 'switch (x) { case ...: break; default: break; }', kind: 'keyword', meaning: 'Compare one value against several constant cases. Each non-empty case must end with break (or return): the compiler forbids falling into the next case.', example: 'switch (command)\n{\n    case "quit":\n        Console.WriteLine("bye");\n        break;\n    default:\n        Console.WriteLine("unknown");\n        break;\n}' },
    { id: 'cs.2.switch-expr', term: 'x switch { ... => ... }', kind: 'pattern', meaning: 'The compact expression form of switch (C# 8 and newer): each arm maps a pattern to a value, and _ catches the rest. Handy once you know it; the project uses the statement form so it builds on every runtime.', example: 'string sign = kind switch\n{\n    "expense" => "-",\n    "income" => "+",\n    _ => "0"\n};' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Parentheses, braces, and a stricter switch',
      body: `An \`if\` in C# looks like C: the condition in **parentheses**, the body in **braces**. The condition must be a \`bool\`; \`if (amount)\` with an int does not compile. Comparisons use \`==\`, \`!=\`, \`<\`, \`>=\`; combine them with \`&&\`, \`||\` and \`!\`. \`else if\` chains more questions and \`else\` catches the rest. In this track the braces always go on their own lines, and we write them even around a one-line body.

\`switch\` compares one value against constant **cases**. It works on ints and on strings. Each case that has statements must end with \`break\` (or \`return\`): C# refuses to let one case fall into the next, so the classic C bug of a forgotten break is a compile error here. \`default\` handles everything else.

There is also a compact **switch expression** (\`x switch { ... }\`, C# 8+) that produces a value instead of running statements; the lexicon shows one. The in-app runner may be on an older compiler, so the project sticks to the statement form.`,
      example: {
        language: 'csharp',
        source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Amount?");\n        int amount = int.Parse(Console.ReadLine());\n        if (amount < 0)\n        {\n            Console.WriteLine("expense");\n        }\n        else if (amount == 0)\n        {\n            Console.WriteLine("nothing");\n        }\n        else\n        {\n            Console.WriteLine("income");\n        }\n        switch (amount)\n        {\n            case 0:\n                Console.WriteLine("zero entry");\n                break;\n            default:\n                Console.WriteLine("recorded");\n                break;\n        }\n    }\n}',
        labels: [
          { lines: [7, 8], label: 'Ask and read the amount.' },
          { lines: [9, 12], label: 'First question, with its braced block.' },
          { lines: [13, 16], label: 'Asked only if the first was false. Two words: else if.' },
          { lines: [17, 20], label: 'Everything left.' },
          { lines: [21, 29], label: 'Switch on the same value: case 0 or default, each ending in break.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'The colon-and-indent block becomes parentheses-and-braces, `elif` becomes `else if`, and `and`/`or`/`not` become `&&`/`||`/`!`. `True`/`False` are `true`/`false` here. Python 3.10\'s `match` is roughly `switch`, but C#\'s cases are constants and need `break`.' },
        { from: 'c', note: 'Nearly identical grammar with two safety rails: the condition must be a bool (no `if (n)` on an int), and a case cannot fall through into the next one, so a missing `break` is a compile error rather than a silent bug. `switch` also accepts strings.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What happens when this is built and run?',
      code: { language: 'csharp', source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int code = 1;\n        switch (code)\n        {\n            case 1:\n                Console.WriteLine("one");\n            case 2:\n                Console.WriteLine("two");\n                break;\n        }\n    }\n}' },
      choices: ['a compile error', 'one\ntwo', 'one', 'two'],
      answer: 'a compile error',
      explanation: 'case 1 has a statement but no break, so control would fall through into case 2. C would happily print one and two. C# reports "Control cannot fall through from one case label to another" at build time and nothing runs.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the three-way classification of `amount`: `expense` below zero, `nothing` at zero, `income` otherwise. Set the indentation yourself; braces on their own lines.',
      language: 'csharp',
      indentation: true,
      solution: ['if (amount < 0)', '{', '    Console.WriteLine("expense");', '}', 'else if (amount == 0)', '{', '    Console.WriteLine("nothing");', '}', 'else', '{', '    Console.WriteLine("income");', '}'],
      distractors: ['elif (amount == 0)', 'if (amount < 0):'],
      explanation: 'C# spells it else if, as two words, and a condition is followed by a brace, never a colon. Each block is indented one level inside its braces, which sit at the level of the if.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the switch on a command word, and the compound condition.',
      language: 'csharp',
      template: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        string command = Console.ReadLine();\n        int amount = -40;\n        switch (command)\n        {\n            {{kw}} "quit":\n                Console.WriteLine("bye");\n                {{brk}};\n            {{def}}:\n                Console.WriteLine("unknown");\n                break;\n        }\n        if (amount < 0 {{and}} amount > -1000)\n        {\n            Console.WriteLine("small expense");\n        }\n    }\n}',
      blanks: [
        { id: 'kw', answers: ['case'] },
        { id: 'brk', answers: ['break'], hint: 'every non-empty case must leave the switch' },
        { id: 'def', answers: ['default'], hint: 'the catch-all case' },
        { id: 'and', answers: ['&&'], hint: 'both conditions must hold' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Add a branch that prints `nothing` for a zero amount, and after the classification print `large` on its own line when the amount is below -1000 or above 1000.',
      language: 'csharp',
      starter: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Amount?");\n        int amount = int.Parse(Console.ReadLine());\n        if (amount < 0)\n        {\n            Console.WriteLine("expense");\n        }\n        else\n        {\n            Console.WriteLine("income");\n        }\n    }\n}\n',
      tests: [
        { description: 'small expense', stdin: '-5', expectedStdout: 'Amount?\nexpense' },
        { description: 'zero', stdin: '0', expectedStdout: 'Amount?\nnothing' },
        { description: 'large income', stdin: '2000', expectedStdout: 'Amount?\nincome\nlarge' },
        { description: 'large expense', stdin: '-1001', expectedStdout: 'Amount?\nexpense\nlarge' },
      ],
      hint: 'Insert an else if (amount == 0) between the two existing blocks, then a separate if with || after the chain.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Amount?");\n        int amount = int.Parse(Console.ReadLine());\n        if (amount < 0)\n        {\n            Console.WriteLine("expense");\n        }\n        else if (amount == 0)\n        {\n            Console.WriteLine("nothing");\n        }\n        else\n        {\n            Console.WriteLine("income");\n        }\n        if (amount < -1000 || amount > 1000)\n        {\n            Console.WriteLine("large");\n        }\n    }\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Print `Command?` and read a word. Using a switch: `add` prints `Adding`, `quit` prints `Bye`, `help` prints `Commands: add quit help`, and anything else prints `Unknown: <word>`.',
      language: 'csharp',
      tests: [
        { description: 'add', stdin: 'add', expectedStdout: 'Command?\nAdding' },
        { description: 'quit', stdin: 'quit', expectedStdout: 'Command?\nBye' },
        { description: 'help', stdin: 'help', expectedStdout: 'Command?\nCommands: add quit help' },
        { description: 'unknown word', stdin: 'dance', expectedStdout: 'Command?\nUnknown: dance' },
      ],
      hint: 'switch on the string; three cases plus default, each ending with break.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Command?");\n        string command = Console.ReadLine();\n        switch (command)\n        {\n            case "add":\n                Console.WriteLine("Adding");\n                break;\n            case "quit":\n                Console.WriteLine("Bye");\n                break;\n            case "help":\n                Console.WriteLine("Commands: add quit help");\n                break;\n            default:\n                Console.WriteLine($"Unknown: {command}");\n                break;\n        }\n    }\n}\n',
      projectNote: 'LedgerSharp will recognise the word quit; later versions add more command words.',
    },
  ],
};

const l22: Lesson = {
  id: 'cs-2-2',
  title: 'Loops, four ways',
  objective: 'Repeat with while, do/while, for and foreach, and read input until a sentinel.',
  minutes: 22,
  lexicon: [
    { id: 'cs.2.while', term: 'while (cond) { ... }', kind: 'keyword', meaning: 'Test, run the block, test again; stop the first time the test is false. The test may be false from the start, in which case the body never runs.', example: 'while (line != "quit")\n{\n    line = Console.ReadLine();\n}' },
    { id: 'cs.2.do-while', term: 'do { ... } while (cond);', kind: 'keyword', meaning: 'Run the block first, then test. The body always runs at least once. Note the semicolon after the closing parenthesis.', example: 'do\n{\n    n = n + 1;\n} while (n < 3);' },
    { id: 'cs.2.for', term: 'for (int i = 0; i < n; i++)', kind: 'keyword', meaning: 'Setup; test; step, all on one line. i++ adds one. The loop variable exists only inside the loop.', example: 'for (int i = 1; i <= 3; i++)\n{\n    Console.WriteLine(i);\n}', analogy: 'Python\'s `for i in range(1, 4)` written out as its three parts. Breaks: range stops before its end; `i <= 3` includes 3.' },
    { id: 'cs.2.foreach', term: 'foreach (char c in text)', kind: 'keyword', meaning: 'Run the block once per item of a collection, with c holding the current item. Works on strings (giving chars), arrays, and the lists of Module 4.', example: 'foreach (char c in "abc")\n{\n    Console.Write(c);\n}' },
    { id: 'cs.2.break-continue', term: 'break / continue', kind: 'keyword', meaning: 'break leaves the innermost loop at once; continue skips the rest of this pass and goes back to the test (or the next item).', example: 'if (amount == 0)\n{\n    continue;\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The same four shapes, one of them new',
      body: `\`while\`, \`do/while\` and \`for\` are C's loops with C's grammar: parentheses round the test, braces round the body, \`i++\` for the step. \`do/while\` runs its body **before** testing, so it runs at least once; its closing \`while (...)\` ends in a semicolon.

\`foreach\` is new: it walks a collection item by item with no counter. A string is a collection of \`char\`, so \`foreach (char c in text)\` visits every character.

\`break\` and \`continue\` mean what they meant in Python and C.

The **sentinel** pattern you know from the Python Ledger looks like this in C#: read the first line *before* the loop, test \`line != "quit"\`, and read the next line at the *end* of the body. \`!=\` on strings compares content, so this works. (\`while (true)\` with a \`break\` is the other way to write it; both appear in this track.)`,
      example: {
        language: 'csharp',
        source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int total = 0;\n        Console.WriteLine("Amount (or quit)?");\n        string line = Console.ReadLine();\n        while (line != "quit")\n        {\n            total = total + int.Parse(line);\n            Console.WriteLine("Amount (or quit)?");\n            line = Console.ReadLine();\n        }\n        for (int i = 1; i <= 3; i++)\n        {\n            Console.WriteLine($"Line {i}");\n        }\n        foreach (char c in "abc")\n        {\n            Console.Write(c);\n        }\n        Console.WriteLine();\n        Console.WriteLine($"Total: {total}");\n    }\n}',
        labels: [
          { lines: [7, 9], label: 'Setup: the accumulator, then the first prompt and read, before the loop.' },
          { lines: [10, 10], label: 'The test, re-asked before every pass: content comparison on the string.' },
          { lines: [11, 12], label: 'Body: absorb the amount.' },
          { lines: [13, 14], label: 'Step: prompt and read the next line, so the test sees fresh input.' },
          { lines: [16, 19], label: 'for: setup, test and step on one line; prints Line 1, Line 2, Line 3.' },
          { lines: [20, 24], label: 'foreach over the chars of a string: prints abc, then an empty WriteLine ends the line.' },
          { lines: [25, 25], label: 'After the loops: the accumulator holds its final value.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`for i in range(1, 4)` becomes `for (int i = 1; i <= 3; i++)`; `for c in text` becomes `foreach (char c in text)`; `while True:` becomes `while (true)`. Python has no do/while. break and continue are unchanged.' },
        { from: 'c', note: 'while, do/while, for, break and continue are identical. foreach is new: C had no way to say "each item" without an index. And `line != "quit"` compares content; in C that would have compared pointers and you would have needed strcmp.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'csharp', source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int n = 5;\n        do\n        {\n            Console.WriteLine(n);\n            n = n + 1;\n        } while (n < 3);\n        Console.WriteLine("end");\n    }\n}' },
      choices: ['5\nend', 'end', '5\n6\nend', 'runs forever'],
      answer: '5\nend',
      explanation: 'do/while runs the body once before it ever looks at the test. It prints 5 and makes n 6; then 6 < 3 is false, so the loop ends. A plain while loop would have printed only end.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the body of Main: read amounts until `quit`, summing them, then print `Total: <sum>`. Set the indentation yourself.',
      language: 'csharp',
      indentation: true,
      solution: ['int total = 0;', 'Console.WriteLine("Amount (or quit)?");', 'string line = Console.ReadLine();', 'while (line != "quit")', '{', '    total = total + int.Parse(line);', '    Console.WriteLine("Amount (or quit)?");', '    line = Console.ReadLine();', '}', 'Console.WriteLine($"Total: {total}");'],
      distractors: ['while (line != quit)', '} while (line != "quit");'],
      explanation: 'quit without quotes would be a variable name, not the word. The trailing `} while (...);` belongs to do/while, which would try to parse "quit" before testing. The first read happens before the loop and the next read is the last line of the body.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the counted loop so it prints 1, 2, 3, and the character loop so it prints each letter of `ok` on its own line.',
      language: 'csharp',
      template: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        for (int i = 1; i {{cmp}} 3; {{step}})\n        {\n            Console.WriteLine(i);\n        }\n        {{fe}} (char c in "ok")\n        {\n            Console.WriteLine(c);\n        }\n    }\n}',
      blanks: [
        { id: 'cmp', answers: ['<='], hint: '3 must still pass the test' },
        { id: 'step', answers: ['i++', 'i = i + 1', 'i += 1', '++i'], hint: 'move the counter by one' },
        { id: 'fe', answers: ['foreach'], hint: 'the loop with no counter' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program reads a count and then that many amounts. Change it to the sentinel shape: no count; print `Amount (or quit)?` before each read and stop at `quit`. Then print `Total: <sum>` and `Count: <k>` (quit is not counted).',
      language: 'csharp',
      starter: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int total = 0;\n        Console.WriteLine("How many?");\n        int n = int.Parse(Console.ReadLine());\n        for (int i = 0; i < n; i++)\n        {\n            Console.WriteLine("Amount?");\n            total = total + int.Parse(Console.ReadLine());\n        }\n        Console.WriteLine($"Total: {total}");\n    }\n}\n',
      tests: [
        { description: 'two amounts', stdin: '5\n-2\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nTotal: 3\nCount: 2' },
        { description: 'quit immediately', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nTotal: 0\nCount: 0' },
      ],
      hint: 'Read the first line before the while, test line != "quit", and read the next line as the last statement of the body. A counter moves once per pass.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int total = 0;\n        int count = 0;\n        Console.WriteLine("Amount (or quit)?");\n        string line = Console.ReadLine();\n        while (line != "quit")\n        {\n            total = total + int.Parse(line);\n            count = count + 1;\n            Console.WriteLine("Amount (or quit)?");\n            line = Console.ReadLine();\n        }\n        Console.WriteLine($"Total: {total}");\n        Console.WriteLine($"Count: {count}");\n    }\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Print `Word?` and read a word. Print `Letters: <length>`, then use foreach to count the lowercase vowels (a, e, i, o, u) and print `Vowels: <k>`.',
      language: 'csharp',
      tests: [
        { description: 'ledger', stdin: 'ledger', expectedStdout: 'Word?\nLetters: 6\nVowels: 2' },
        { description: 'no vowels', stdin: 'sky', expectedStdout: 'Word?\nLetters: 3\nVowels: 0' },
        { description: 'all five', stdin: 'aeiou', expectedStdout: 'Word?\nLetters: 5\nVowels: 5' },
      ],
      hint: 'foreach (char c in word) with an if that joins five == comparisons with ||. Character literals use single quotes: \'a\'.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Word?");\n        string word = Console.ReadLine();\n        int vowels = 0;\n        foreach (char c in word)\n        {\n            if (c == \'a\' || c == \'e\' || c == \'i\' || c == \'o\' || c == \'u\')\n            {\n                vowels = vowels + 1;\n            }\n        }\n        Console.WriteLine($"Letters: {word.Length}");\n        Console.WriteLine($"Vowels: {vowels}");\n    }\n}\n',
      projectNote: 'The sentinel loop from the modify step is the heart of LedgerSharp v0.2.',
    },
  ],
};

const l23: Lesson = {
  id: 'cs-2-3',
  title: 'Methods: named, typed pieces',
  objective: 'Define static methods with typed parameters and return types, and call them from Main.',
  minutes: 22,
  lexicon: [
    { id: 'cs.2.method', term: 'static int ReadInt(string prompt) { ... }', kind: 'pattern', meaning: 'A method declaration: static (belongs to the class), the return type, the name, then each parameter with its type. The body is a braced block. Methods sit inside the class beside Main, in any order.', example: 'static int ReadInt(string prompt)\n{\n    Console.WriteLine(prompt);\n    return int.Parse(Console.ReadLine());\n}', analogy: 'Python\'s def with the types written out and no self. Breaks: in Python the def must run before the call; in C# the order inside the class does not matter.' },
    { id: 'cs.2.return', term: 'return value;', kind: 'keyword', meaning: 'Leave the method and hand this value to the caller. Every path through a non-void method must return, or the build fails.', example: 'return balance + amount;' },
    { id: 'cs.2.void', term: 'void', kind: 'keyword', meaning: 'The return type of a method that hands nothing back. A bare return; may end it early.', example: 'static void Report(int balance)\n{\n    Console.WriteLine($"Balance: {balance}");\n}' },
    { id: 'cs.2.overload', term: 'overloading', kind: 'concept', meaning: 'Two methods may share a name if their parameter lists differ; the compiler picks by the arguments you pass. Console.WriteLine itself is overloaded for int, string, bool and more.', example: 'static int Sum(int a, int b) { return a + b; }\nstatic int Sum(int a, int b, int c) { return a + b + c; }' },
    { id: 'cs.2.expr-bodied', term: '=> expression', kind: 'pattern', meaning: 'Expression-bodied method: when the body is a single return, write => and the expression instead of braces. Same meaning, less ceremony.', example: 'static int Apply(int balance, int amount) => balance + amount;' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Main becomes a table of contents',
      body: `A **method** is a named block with typed inputs and a typed output. The header says it all: \`static int ReadInt(string prompt)\` takes one string and returns an int. \`static\` means the method belongs to the class itself, so Main can call it without creating an object; Module 3 introduces the other kind. A method that returns nothing is \`void\`.

Inside, \`return\` hands a value back and ends the method. The compiler checks that every path through a non-void method returns something.

Methods live inside the class next to Main, in **any order**: you may call a method defined further down the file. Two methods may share a name if their parameters differ (**overloading**). When a body is a single \`return\`, the **expression-bodied** form \`=> expression\` says the same thing in one line.

Parameters are **copies** of the arguments. Changing a parameter inside the method does not change the caller's variable; lesson 4 shows what to do when you want it to.`,
      example: {
        language: 'csharp',
        source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int balance = ReadInt("Balance?");\n        int amount = ReadInt("Amount?");\n        Report(balance + amount);\n        Console.WriteLine(IsExpense(amount));\n    }\n\n    static int ReadInt(string prompt)\n    {\n        Console.WriteLine(prompt);\n        return int.Parse(Console.ReadLine());\n    }\n\n    static void Report(int balance)\n    {\n        Console.WriteLine($"Balance: {balance}");\n    }\n\n    static bool IsExpense(int amount) => amount < 0;\n}',
        labels: [
          { lines: [5, 11], label: 'Main reads like a plan: two reads, a report, a check. The details are elsewhere.' },
          { lines: [13, 17], label: 'Takes a string, returns an int. The prompt-then-read pattern, named once and reused.' },
          { lines: [19, 22], label: 'void: prints and returns nothing.' },
          { lines: [24, 24], label: 'Expression-bodied: a one-line method that returns a bool.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`def read_int(prompt):` becomes `static int ReadInt(string prompt)`: the parameter and return types are written down and checked. There is no `None` return; a method that returns nothing is `void`. Names are PascalCase by convention.' },
        { from: 'c', note: 'A C# method is a C function inside a class. No prototypes: the compiler sees the whole class, so order does not matter. `static` here means "no object needed", not "private to this file". Overloading (two functions, one name) is legal; C forbade it.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'csharp', source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int x = 5;\n        AddTen(x);\n        Console.WriteLine(x);\n        Console.WriteLine(Twice(x));\n    }\n\n    static void AddTen(int n)\n    {\n        n = n + 10;\n    }\n\n    static int Twice(int n) => n * 2;\n}' },
      choices: ['5\n10', '15\n30', '15\n10', 'an error: AddTen is used before it is defined'],
      answer: '5\n10',
      explanation: 'n inside AddTen is a copy of x; adding 10 to the copy leaves x at 5. Twice returns 10 without touching x either. Order inside the class does not matter, so there is no error.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the method `ReadInt`: print the prompt, read a line, return it as an int. Set the indentation yourself.',
      language: 'csharp',
      indentation: true,
      solution: ['static int ReadInt(string prompt)', '{', '    Console.WriteLine(prompt);', '    string text = Console.ReadLine();', '    return int.Parse(text);', '}'],
      distractors: ['static void ReadInt(string prompt)', 'static int ReadInt(prompt)'],
      explanation: 'A method that returns an int cannot be declared void, and every parameter needs a type: `prompt` alone is not a declaration.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the three helper methods.',
      language: 'csharp',
      template: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Report(Apply(100, -30));\n        Console.WriteLine(IsExpense(-30));\n    }\n\n    static {{ret}} Apply(int balance, int amount)\n    {\n        {{kw}} balance + amount;\n    }\n\n    static {{v}} Report(int balance)\n    {\n        Console.WriteLine($"Balance: {balance}");\n    }\n\n    static bool IsExpense(int amount) {{arrow}} amount < 0;\n}',
      blanks: [
        { id: 'ret', answers: ['int'], hint: 'the type of balance + amount' },
        { id: 'kw', answers: ['return'] },
        { id: 'v', answers: ['void'], hint: 'Report hands nothing back' },
        { id: 'arrow', answers: ['=>'], hint: 'the expression-bodied arrow' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Everything is in Main. Move the two prompt-and-read pairs into `static int ReadInt(string prompt)`, add `static string Classify(int amount)` returning `expense`, `nothing` or `income`, and print the classification before the balance line.',
      language: 'csharp',
      starter: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Balance?");\n        int balance = int.Parse(Console.ReadLine());\n        Console.WriteLine("Amount?");\n        int amount = int.Parse(Console.ReadLine());\n        Console.WriteLine($"Balance: {balance + amount}");\n    }\n}\n',
      tests: [
        { description: 'expense', stdin: '100\n-30', expectedStdout: 'Balance?\nAmount?\nexpense\nBalance: 70' },
        { description: 'nothing', stdin: '100\n0', expectedStdout: 'Balance?\nAmount?\nnothing\nBalance: 100' },
        { description: 'income', stdin: '5\n5', expectedStdout: 'Balance?\nAmount?\nincome\nBalance: 10' },
      ],
      hint: 'Classify can be three ifs that each return; the last return needs no condition. Main becomes four lines.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int balance = ReadInt("Balance?");\n        int amount = ReadInt("Amount?");\n        Console.WriteLine(Classify(amount));\n        Console.WriteLine($"Balance: {balance + amount}");\n    }\n\n    static int ReadInt(string prompt)\n    {\n        Console.WriteLine(prompt);\n        return int.Parse(Console.ReadLine());\n    }\n\n    static string Classify(int amount)\n    {\n        if (amount < 0)\n        {\n            return "expense";\n        }\n        if (amount == 0)\n        {\n            return "nothing";\n        }\n        return "income";\n    }\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Write `static int ReadInt(string prompt)`, `static int Sum(int a, int b)`, an overload `static int Sum(int a, int b, int c)`, and an expression-bodied `static int Square(int n)`. In Main read three numbers with the prompt `Number?`, then print `Sum: <a+b+c>` and `Squares: <a²+b²+c²>`.',
      language: 'csharp',
      tests: [
        { description: '1 2 3', stdin: '1\n2\n3', expectedStdout: 'Number?\nNumber?\nNumber?\nSum: 6\nSquares: 14' },
        { description: 'with a negative', stdin: '-4\n0\n4', expectedStdout: 'Number?\nNumber?\nNumber?\nSum: 0\nSquares: 32' },
      ],
      hint: 'The three-argument Sum can call the two-argument one: Sum(Sum(a, b), c). Squares is Sum(Square(a), Square(b), Square(c)).',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int a = ReadInt("Number?");\n        int b = ReadInt("Number?");\n        int c = ReadInt("Number?");\n        Console.WriteLine($"Sum: {Sum(a, b, c)}");\n        Console.WriteLine($"Squares: {Sum(Square(a), Square(b), Square(c))}");\n    }\n\n    static int ReadInt(string prompt)\n    {\n        Console.WriteLine(prompt);\n        return int.Parse(Console.ReadLine());\n    }\n\n    static int Sum(int a, int b)\n    {\n        return a + b;\n    }\n\n    static int Sum(int a, int b, int c)\n    {\n        return Sum(a, b) + c;\n    }\n\n    static int Square(int n) => n * n;\n}\n',
      projectNote: 'LedgerSharp v0.2 is assembled from exactly these pieces: ReadInt, Classify and Apply as static methods.',
    },
  ],
};

const l24: Lesson = {
  id: 'cs-2-4',
  title: 'out, ref and tuples',
  objective: 'Return more than one result from a method with out, ref and tuples, and parse input safely with int.TryParse.',
  minutes: 20,
  lexicon: [
    { id: 'cs.2.tryparse', term: 'int.TryParse(text, out int n)', kind: 'builtin', meaning: 'Try to convert text to an int. Returns true and sets n on success; returns false and sets n to 0 on failure, instead of throwing.', example: 'if (int.TryParse(text, out int amount))\n{\n    balance = balance + amount;\n}', analogy: 'Asking "can you make this a number?" and getting both the yes/no and the number back. Breaks: the number is 0 on a no, which is a real value, so always check the bool and never the 0.' },
    { id: 'cs.2.out', term: 'out', kind: 'keyword', meaning: 'Marks a parameter the method must fill in before returning; the caller gets the value in its own variable. Written at both the declaration and the call. `out int n` declares the variable right there.', example: 'static void Split(int cents, out int euros, out int rest)\n{\n    euros = cents / 100;\n    rest = cents % 100;\n}' },
    { id: 'cs.2.ref', term: 'ref', kind: 'keyword', meaning: 'Pass the caller\'s variable itself rather than a copy, so assignments inside the method change it. Written at both ends. The variable must already have a value.', example: 'static void Apply(ref int balance, int amount)\n{\n    balance = balance + amount;\n}\n// call: Apply(ref balance, -30);', analogy: 'C\'s `&x` plus the pointer dereference, with the compiler doing both. Breaks: there is no arithmetic on a ref, and you cannot store it for later.' },
    { id: 'cs.2.tuple', term: '(int, string)', kind: 'pattern', meaning: 'A small bundle of typed values that a method can return. Unpack it with (int count, string label) = ..., or read .Item1 and .Item2. Prefer a tuple over ref/out when the method simply computes several results.', example: 'static (int, string) Summarize(int n)\n{\n    return (n, "entries");\n}\n(int count, string label) = Summarize(3);' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Three ways to get more than one thing back',
      body: `Parameters are copies, and \`return\` gives one value. C# has three tools when that is not enough.

**out**: the method promises to fill a variable the caller owns. \`int.TryParse(text, out int n)\` is the everyday example: the return value says whether the text was a number, and \`n\` receives it (0 if not). Unlike \`int.Parse\`, nothing is thrown on bad input, so this is how the ledger will survive typos in Module 5.

**ref**: the caller passes a variable it already filled, and the method works on that very variable. Assignments inside change the caller's box. You write \`ref\` at both the declaration and the call so nobody is surprised.

**Tuples**: when the method simply computes several results, return them together as \`(int, string)\` and unpack with \`(int count, string label) = ...\`. This is usually the clearest of the three, and it needs no special keyword at the call.`,
      example: {
        language: 'csharp',
        source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Amount?");\n        string text = Console.ReadLine();\n        if (int.TryParse(text, out int amount))\n        {\n            Console.WriteLine($"Parsed: {amount}");\n        }\n        else\n        {\n            Console.WriteLine("Not a number");\n        }\n        int balance = 100;\n        Deposit(ref balance, 50);\n        Console.WriteLine($"Balance: {balance}");\n        (int count, string label) = Summarize(3);\n        Console.WriteLine($"{count} {label}");\n    }\n\n    static void Deposit(ref int balance, int amount)\n    {\n        balance = balance + amount;\n    }\n\n    static (int, string) Summarize(int n)\n    {\n        string label = "entries";\n        if (n == 1)\n        {\n            label = "entry";\n        }\n        return (n, label);\n    }\n}',
        labels: [
          { lines: [7, 16], label: 'TryParse: the bool decides the branch; amount is declared right in the call.' },
          { lines: [17, 19], label: 'ref at the call: Deposit changes this balance, so 150 is printed.' },
          { lines: [20, 21], label: 'Unpack a tuple into two new variables: 3 entries.' },
          { lines: [24, 27], label: 'ref at the declaration: balance is the caller\'s box, not a copy.' },
          { lines: [29, 37], label: 'A method returning two values at once.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python returns several values as a tuple without declaring types; C# needs `(int, string)` in the header. Python\'s `int(text)` raises ValueError on bad text and you catch it; TryParse answers false instead. Python has no ref: a function cannot rebind the caller\'s name.' },
        { from: 'c', note: '`ref` is what you did with `&x` and `*p`, but the compiler writes the address-taking and the dereference, and will not let you pass an uninitialised variable. `out` is the same mechanism for a result slot, like scanf filling `&n`, with the extra promise that the method must assign it. No pointers, no NULL checks.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'csharp', source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        bool ok = int.TryParse("12a", out int n);\n        Console.WriteLine(ok);\n        Console.WriteLine(n);\n    }\n}' },
      choices: ['False\n0', 'False\n12', 'True\n12', 'an error'],
      answer: 'False\n0',
      explanation: '"12a" is not a whole number, so TryParse returns false and, as its contract promises, sets the out variable to 0. It does not keep the "12" part and it does not throw.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the body of Main: ask `Amount?`, read a line, and print `Amount: <n>` if it parses or `Not a number` if it does not. Set the indentation yourself.',
      language: 'csharp',
      indentation: true,
      solution: ['Console.WriteLine("Amount?");', 'string text = Console.ReadLine();', 'if (int.TryParse(text, out int amount))', '{', '    Console.WriteLine($"Amount: {amount}");', '}', 'else', '{', '    Console.WriteLine("Not a number");', '}'],
      distractors: ['if (int.TryParse(text, int amount))', 'int amount = int.TryParse(text);'],
      explanation: 'The out keyword is required at the call; without it the compiler sees a declaration where an argument should be. TryParse returns a bool, not the number, so it cannot be stored in an int.',
    },
    {
      kind: 'modify',
      prompt: 'Two fixes. Make `Deposit` change the caller\'s balance with `ref`. Then read the amount with `int.TryParse`: if the text is not a number, print `Not a number` and leave the balance alone. The balance line is printed either way.',
      language: 'csharp',
      starter: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int balance = 100;\n        Console.WriteLine("Amount?");\n        int amount = int.Parse(Console.ReadLine());\n        Deposit(balance, amount);\n        Console.WriteLine($"Balance: {balance}");\n    }\n\n    static void Deposit(int balance, int amount)\n    {\n        balance = balance + amount;\n    }\n}\n',
      tests: [
        { description: 'a valid deposit changes the balance', stdin: '50', expectedStdout: 'Amount?\nBalance: 150' },
        { description: 'text leaves it alone', stdin: 'abc', expectedStdout: 'Amount?\nNot a number\nBalance: 100' },
        { description: 'a negative amount', stdin: '-100', expectedStdout: 'Amount?\nBalance: 0' },
      ],
      hint: 'ref goes in both the header and the call. Put the Deposit call inside the if that TryParse controls.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int balance = 100;\n        Console.WriteLine("Amount?");\n        string text = Console.ReadLine();\n        if (int.TryParse(text, out int amount))\n        {\n            Deposit(ref balance, amount);\n        }\n        else\n        {\n            Console.WriteLine("Not a number");\n        }\n        Console.WriteLine($"Balance: {balance}");\n    }\n\n    static void Deposit(ref int balance, int amount)\n    {\n        balance = balance + amount;\n    }\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Write `static (string, int) Describe(int amount)` that returns `("expense", <amount made positive>)` for a negative amount, `("nothing", 0)` for zero and `("income", <amount>)` otherwise. In Main print `Amount?`, read a line with TryParse; on failure print `Not a number`, otherwise unpack the tuple and print `<kind> of <size>`.',
      language: 'csharp',
      tests: [
        { description: 'an expense', stdin: '-40', expectedStdout: 'Amount?\nexpense of 40' },
        { description: 'an income', stdin: '25', expectedStdout: 'Amount?\nincome of 25' },
        { description: 'zero', stdin: '0', expectedStdout: 'Amount?\nnothing of 0' },
        { description: 'not a number', stdin: 'ten', expectedStdout: 'Amount?\nNot a number' },
      ],
      hint: 'Math.Abs(amount) or -amount makes the size positive. Unpack with (string kind, int size) = Describe(amount);',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Amount?");\n        string text = Console.ReadLine();\n        if (int.TryParse(text, out int amount))\n        {\n            (string kind, int size) = Describe(amount);\n            Console.WriteLine($"{kind} of {size}");\n        }\n        else\n        {\n            Console.WriteLine("Not a number");\n        }\n    }\n\n    static (string, int) Describe(int amount)\n    {\n        if (amount < 0)\n        {\n            return ("expense", -amount);\n        }\n        if (amount == 0)\n        {\n            return ("nothing", 0);\n        }\n        return ("income", amount);\n    }\n}\n',
      projectNote: 'LedgerSharp v0.5 will use TryParse to reject bad amounts; v0.2 keeps int.Parse and trusts its owner.',
    },
  ],
};

const l25: Lesson = {
  id: 'cs-2-5',
  title: 'Project: LedgerSharp v0.2',
  objective: 'Build the command loop from static methods: read, classify, apply, report.',
  minutes: 18,
  lexicon: [
    { id: 'cs.2.main-as-plan', term: 'Main as the plan', kind: 'pattern', meaning: 'Main holds the shape of the program (setup, loop, footer) and delegates each detail to a named static method. Reading Main alone should tell you what the program does.', example: 'int balance = ReadInt("Balance?");\n// loop: Classify, Apply, report\nConsole.WriteLine($"Final balance: {balance}");' },
    { id: 'cs.2.sentinel-loop', term: 'read, test, body, read again', kind: 'pattern', meaning: 'The C# sentinel loop: prompt and read once before the while, test the line against the sentinel word, and prompt and read again as the last statement of the body. The quit line is never parsed and never counted.', example: 'Console.WriteLine("Amount (or quit)?");\nstring line = Console.ReadLine();\nwhile (line != "quit")\n{\n    // use line\n    Console.WriteLine("Amount (or quit)?");\n    line = Console.ReadLine();\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The whole program, labelled',
      body: `LedgerSharp v0.2 mirrors the Python Ledger v0.3, with one addition: each amount is classified before the running balance is printed. Main is the plan; three static methods do the work. \`ReadInt\` is the prompt-then-read pair from lesson 3, \`Classify\` is the if chain from lesson 1 written with returns, and \`Apply\` is a one-line expression-bodied method.

Read the labels, then write them as comments in the last step and fill them in one at a time, running the tests as you go.`,
      example: {
        language: 'csharp',
        source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int balance = ReadInt("Balance?");\n        int entries = 0;\n        Console.WriteLine("Amount (or quit)?");\n        string line = Console.ReadLine();\n        while (line != "quit")\n        {\n            int amount = int.Parse(line);\n            Console.WriteLine(Classify(amount));\n            balance = Apply(balance, amount);\n            entries = entries + 1;\n            Console.WriteLine($"Balance: {balance}");\n            Console.WriteLine("Amount (or quit)?");\n            line = Console.ReadLine();\n        }\n        Console.WriteLine($"Entries: {entries}");\n        Console.WriteLine($"Final balance: {balance}");\n    }\n\n    static int ReadInt(string prompt)\n    {\n        Console.WriteLine(prompt);\n        return int.Parse(Console.ReadLine());\n    }\n\n    static string Classify(int amount)\n    {\n        if (amount < 0)\n        {\n            return "expense";\n        }\n        if (amount == 0)\n        {\n            return "nothing";\n        }\n        return "income";\n    }\n\n    static int Apply(int balance, int amount) => balance + amount;\n}',
        labels: [
          { lines: [7, 10], label: 'Setup: the starting balance through ReadInt, the counter, and the first prompt and read.' },
          { lines: [11, 11], label: 'The sentinel test.' },
          { lines: [13, 17], label: 'Body: parse, classify, apply, count, report the running balance.' },
          { lines: [18, 19], label: 'Step: prompt and read the next line.' },
          { lines: [21, 22], label: 'Footer, after the loop: the count and the final balance.' },
          { lines: [25, 29], label: 'ReadInt: the prompt-then-read pair, named.' },
          { lines: [31, 42], label: 'Classify: each branch returns, so no else is needed.' },
          { lines: [44, 44], label: 'Apply: one expression, so one line.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The user types `10`, then `-30`, then `quit`. What is printed after the first `Amount (or quit)?` line?',
      code: { language: 'csharp', source: 'int balance = ReadInt("Balance?");\nint entries = 0;\nConsole.WriteLine("Amount (or quit)?");\nstring line = Console.ReadLine();\nwhile (line != "quit")\n{\n    int amount = int.Parse(line);\n    Console.WriteLine(Classify(amount));\n    balance = Apply(balance, amount);\n    entries = entries + 1;\n    Console.WriteLine($"Balance: {balance}");\n    Console.WriteLine("Amount (or quit)?");\n    line = Console.ReadLine();\n}\nConsole.WriteLine($"Entries: {entries}");\nConsole.WriteLine($"Final balance: {balance}");' },
      choices: ['expense\nBalance: -20\nAmount (or quit)?\nEntries: 1\nFinal balance: -20', 'expense\nBalance: -20\nAmount (or quit)?\nEntries: 2\nFinal balance: -20', 'Balance: -20\nexpense\nAmount (or quit)?\nEntries: 1\nFinal balance: -20', 'expense\nBalance: -20\nEntries: 1\nFinal balance: -20'],
      answer: 'expense\nBalance: -20\nAmount (or quit)?\nEntries: 1\nFinal balance: -20',
      explanation: 'One pass: -30 is classified first, then applied (10 - 30 = -20) and reported. The body ends by prompting again; the answer is quit, so the test fails and the footer runs. quit was never parsed or counted, so Entries is 1.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the body of Main for v0.2, using the methods ReadInt, Classify and Apply as given. Set the indentation yourself.',
      language: 'csharp',
      indentation: true,
      solution: ['int balance = ReadInt("Balance?");', 'int entries = 0;', 'Console.WriteLine("Amount (or quit)?");', 'string line = Console.ReadLine();', 'while (line != "quit")', '{', '    int amount = int.Parse(line);', '    Console.WriteLine(Classify(amount));', '    balance = Apply(balance, amount);', '    entries = entries + 1;', '    Console.WriteLine($"Balance: {balance}");', '    Console.WriteLine("Amount (or quit)?");', '    line = Console.ReadLine();', '}', 'Console.WriteLine($"Entries: {entries}");', 'Console.WriteLine($"Final balance: {balance}");'],
      distractors: ['    Apply(balance, amount);', '    int amount = int.Parse(Console.ReadLine());'],
      explanation: 'Apply returns the new balance; calling it without storing the result changes nothing, because parameters are copies. Parsing a fresh ReadLine inside the body would skip the line the test just looked at.',
    },
    {
      kind: 'create',
      prompt: 'Write LedgerSharp v0.2 exactly as planned. Print `Balance?` and read an int (through `static int ReadInt(string prompt)`). Then repeat: print `Amount (or quit)?` and read a line; if it is `quit`, stop; otherwise print `expense`, `nothing` or `income` (from `static string Classify(int amount)`), update the balance (through `static int Apply(int balance, int amount)`) and print `Balance: <running>`. After the loop print `Entries: <k>` (quit is not counted) and `Final balance: <n>`.',
      language: 'csharp',
      tests: [
        { description: 'quit immediately', stdin: '100\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nEntries: 0\nFinal balance: 100' },
        { description: 'an expense then an income (the spec example)', stdin: '100\n-30\n50\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nexpense\nBalance: 70\nAmount (or quit)?\nincome\nBalance: 120\nAmount (or quit)?\nEntries: 2\nFinal balance: 120' },
        { description: 'goes negative and stays there', stdin: '20\n-50\n-10\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nexpense\nBalance: -30\nAmount (or quit)?\nexpense\nBalance: -40\nAmount (or quit)?\nEntries: 2\nFinal balance: -40' },
        { description: 'a zero entry counts as nothing', stdin: '0\n5\n0\n-5\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nincome\nBalance: 5\nAmount (or quit)?\nnothing\nBalance: 5\nAmount (or quit)?\nexpense\nBalance: 0\nAmount (or quit)?\nEntries: 3\nFinal balance: 0' },
      ],
      hint: 'Write the methods first (ReadInt, Classify, Apply), then Main as: setup, first prompt and read, while loop, footer. Run the quit-immediately test before the others.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int balance = ReadInt("Balance?");\n        int entries = 0;\n        Console.WriteLine("Amount (or quit)?");\n        string line = Console.ReadLine();\n        while (line != "quit")\n        {\n            int amount = int.Parse(line);\n            Console.WriteLine(Classify(amount));\n            balance = Apply(balance, amount);\n            entries = entries + 1;\n            Console.WriteLine($"Balance: {balance}");\n            Console.WriteLine("Amount (or quit)?");\n            line = Console.ReadLine();\n        }\n        Console.WriteLine($"Entries: {entries}");\n        Console.WriteLine($"Final balance: {balance}");\n    }\n\n    static int ReadInt(string prompt)\n    {\n        Console.WriteLine(prompt);\n        return int.Parse(Console.ReadLine());\n    }\n\n    static string Classify(int amount)\n    {\n        if (amount < 0)\n        {\n            return "expense";\n        }\n        if (amount == 0)\n        {\n            return "nothing";\n        }\n        return "income";\n    }\n\n    static int Apply(int balance, int amount) => balance + amount;\n}\n',
      projectNote: 'LedgerSharp v0.2 complete: a command loop built from static methods, with a running balance and an entry count.',
    },
  ],
};

export const m2: Module = {
  id: 'cs-m2',
  title: 'Control flow and methods',
  goal: 'if/switch, loops, methods, parameters, expression-bodied members.',
  projectMilestone: 'LedgerSharp v0.2: a command loop built from methods.',
  status: 'available',
  lessons: [l21, l22, l23, l24, l25],
};
