import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 1: Hello .NET                                               */
/* ------------------------------------------------------------------ */

const l11: Lesson = {
  id: 'cs-1-1',
  title: 'A class with a Main',
  objective: 'Write, build and run a C# console program that prints lines.',
  minutes: 18,
  lexicon: [
    { id: 'cs.1.using', term: 'using System;', kind: 'pattern', meaning: 'Lets you write the short names of the System namespace (Console, Math, Convert) instead of System.Console. It pastes nothing in; it only changes which names the compiler accepts.', example: 'using System;\n\nclass Program { ... }', analogy: 'Like C\'s #include in where it sits and what it unlocks. Breaks: #include copies a header file into yours; using copies nothing, the library is always there.' },
    { id: 'cs.1.class-program', term: 'class Program { ... }', kind: 'pattern', meaning: 'Every method in C# lives inside a class. Program is the conventional name for the class that holds Main. Module 3 uses classes for real; until then it is the box Main sits in.', example: 'class Program\n{\n    static void Main(string[] args)\n    {\n    }\n}' },
    { id: 'cs.1.main', term: 'static void Main(string[] args)', kind: 'pattern', meaning: 'The entry point. static: belongs to the class, no object needed. void: returns nothing. args: the command-line words as an array of strings. The capital M is required.', example: 'static void Main(string[] args)\n{\n    Console.WriteLine("hi");\n}' },
    { id: 'cs.1.writeline', term: 'Console.WriteLine("...")', kind: 'builtin', meaning: 'Print text and end the line. Console.Write prints without ending the line.', example: 'Console.WriteLine("Balance: 0");', analogy: 'Python\'s print with the newline built in. Breaks: WriteLine takes one thing, not a comma-separated list; join values with interpolation (lesson 2).' },
    { id: 'cs.1.il-jit', term: 'IL, then JIT', kind: 'concept', meaning: 'dotnet build compiles your C# into intermediate language (IL) in a .dll; when the program runs, the .NET runtime compiles that IL into machine code just in time. Type errors are still caught at build time, like C.', example: 'dotnet new console\ndotnet run' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Build to IL, run on the runtime',
      body: `C# has C-family grammar: semicolons end statements, braces enclose blocks, and a **compiler** checks the whole file before anything runs. Two things differ from C. First, code lives inside a **class**; the entry point is a method called \`Main\` inside a class conventionally called \`Program\`. Second, the compiler does not produce machine code. \`dotnet build\` turns your file into **intermediate language** (IL) inside a \`.dll\`; when you run it, the .NET runtime compiles that IL into machine code just in time (the JIT). You never see this step, but it is why one build runs on Windows, Linux and macOS.

On your own machine: \`dotnet new console\` makes a project with a \`Program.cs\`; \`dotnet run\` builds and runs it. In this app the runner does both for you.

\`Console.WriteLine\` prints a line and ends it. \`Console.Write\` prints without ending it. Below is LedgerSharp v0.0, the start of this track's project.`,
      example: {
        language: 'csharp',
        source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("LedgerSharp");\n        Console.WriteLine("Balance: 0");\n    }\n}',
        labels: [
          { lines: [1, 1], label: 'Allow the short name Console instead of System.Console.' },
          { lines: [3, 4], label: 'The class that holds the program. Its brace opens on its own line (the .NET style).' },
          { lines: [5, 6], label: 'Entry point: static (no object), void (returns nothing), args (command-line words).' },
          { lines: [7, 8], label: 'Print two lines. Each statement ends with ; and WriteLine ends the line for you.' },
          { lines: [9, 10], label: 'Close Main, then close the class.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python runs a file top to bottom; C# runs only Main, and nothing may sit outside a class. print ends the line like WriteLine does. Indentation is for humans here; the braces are the grammar.' },
        { from: 'c', note: '`#include <stdio.h>` becomes `using System;`. `int main(void)` becomes `static void Main(string[] args)` inside a class, and there is no `return 0;` because Main is void. WriteLine ends the line itself, so there is no `\\n`. The output is IL run by a runtime, not a native executable.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: { language: 'csharp', source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.Write("Hello");\n        Console.WriteLine("World");\n        Console.WriteLine("!");\n    }\n}' },
      choices: ['HelloWorld\n!', 'Hello\nWorld\n!', 'HelloWorld!', 'Hello World !'],
      answer: 'HelloWorld\n!',
      explanation: 'Console.Write leaves the line open, so World joins Hello. WriteLine ends the line after World, so ! starts a new one.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a complete program that prints `LedgerSharp` and then `Ready`. Set the indentation yourself: 4 spaces per level, braces on their own lines.',
      language: 'csharp',
      indentation: true,
      solution: ['using System;', 'class Program', '{', '    static void Main(string[] args)', '    {', '        Console.WriteLine("LedgerSharp");', '        Console.WriteLine("Ready");', '    }', '}'],
      distractors: ['    static void main(string[] args)', '        Console.WriteLine("Ready")'],
      explanation: 'C# is case-sensitive and the entry point must be spelled Main. Every statement still ends with a semicolon, as in C.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it builds and prints `Balance: 0`.',
      language: 'csharp',
      template: 'using {{ns}};\n\nclass Program\n{\n    static {{ret}} Main(string[] args)\n    {\n        Console.{{method}}("Balance: 0");\n    }\n}',
      blanks: [
        { id: 'ns', answers: ['System'], hint: 'the namespace that holds Console' },
        { id: 'ret', answers: ['void'], hint: 'Main returns nothing' },
        { id: 'method', answers: ['WriteLine'], hint: 'print and end the line' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Make the program print three lines: `LedgerSharp`, `Owner: Sam`, `Balance: 0`.',
      language: 'csharp',
      starter: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Balance: 0");\n    }\n}\n',
      tests: [{ description: 'Three lines', expectedStdout: 'LedgerSharp\nOwner: Sam\nBalance: 0' }],
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("LedgerSharp");\n        Console.WriteLine("Owner: Sam");\n        Console.WriteLine("Balance: 0");\n    }\n}\n',
    },
    {
      kind: 'create',
      prompt: 'From a blank file, write a complete C# program that prints `LedgerSharp ready` and then `Balance: 0`.',
      language: 'csharp',
      tests: [{ description: 'Two lines', expectedStdout: 'LedgerSharp ready\nBalance: 0' }],
      hint: 'You need using System, a class, a static void Main, and two WriteLine statements.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("LedgerSharp ready");\n        Console.WriteLine("Balance: 0");\n    }\n}\n',
      projectNote: 'LedgerSharp v0.0: builds to IL and announces itself.',
    },
  ],
};

const l12: Lesson = {
  id: 'cs-1-2',
  title: 'Typed boxes, inferred',
  objective: 'Declare typed variables, let var infer them, and print values with string interpolation.',
  minutes: 20,
  lexicon: [
    { id: 'cs.1.types', term: 'int / double / string / bool', kind: 'concept', meaning: 'The four types you need first: whole number, decimal number, text, true/false. A variable keeps the type it was declared with for its whole life.', example: 'int balance = 100;\ndouble rate = 0.5;\nstring owner = "Sam";\nbool overdrawn = false;' },
    { id: 'cs.1.var', term: 'var x = 5;', kind: 'keyword', meaning: 'Declare a variable and let the compiler read its type from the initializer. The type is just as fixed as if you had written int; var only saves typing.', example: 'var entries = 0;        // an int\nvar owner = "Sam";      // a string', analogy: 'Leaving the "type" field blank on a form and letting the clerk fill it in from what you handed over. Breaks: a Python name can later point at anything; a var box never changes type.' },
    { id: 'cs.1.const', term: 'const int Limit = 500;', kind: 'keyword', meaning: 'A named value fixed at compile time. Assigning to it later is a compile error.', example: 'const int Limit = 500;' },
    { id: 'cs.1.interp', term: '$"Balance: {balance}"', kind: 'pattern', meaning: 'An interpolated string: the $ before the opening quote makes {name} inside it stand for the value of name, converted to text.', example: 'Console.WriteLine($"{owner} has {balance}");', analogy: 'Python\'s f-string with $ in place of f. Breaks: there is no format-spec mini-language you already know; `{balance:N0}` exists but is different, and bool prints as True/False.' },
    { id: 'cs.1.intdiv', term: '7 / 2 == 3', kind: 'operator', meaning: 'Dividing two ints gives an int: the fraction is dropped. % gives the remainder. If either side is a double, the result is a double.', example: 'Console.WriteLine(7 / 2);   // 3\nConsole.WriteLine(7 % 2);   // 1' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Every variable has one type, even with var',
      body: `A C# variable is a typed box, as in C: \`int balance = 100;\` and from then on \`balance\` holds only whole numbers. Two more types are built in that C lacks: \`string\` for text and \`bool\` for \`true\`/\`false\` (lowercase keywords).

\`var\` lets the compiler **infer** the type from the right-hand side. \`var entries = 0;\` is an int, exactly as if you had written \`int\`; the type is still fixed and \`var\` without an initializer is a compile error. \`const\` names a value that can never change.

To put values into text, use an **interpolated string**: \`$"Balance: {balance}"\`. The \`$\` turns each \`{...}\` into the value's text.

Arithmetic follows C: \`/\` on two ints is **integer division** (7 / 2 is 3) and \`%\` is the remainder. The \`Math\` class holds the usual helpers: \`Math.Max\`, \`Math.Min\`, \`Math.Abs\`. The ledger keeps money as whole numbers, so ints are all it needs.`,
      example: {
        language: 'csharp',
        source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int balance = 100;\n        var entries = 0;\n        string owner = "Sam";\n        bool overdrawn = balance < 0;\n        const int Limit = 500;\n        entries = entries + 1;\n        Console.WriteLine($"{owner}\'s ledger");\n        Console.WriteLine($"Balance: {balance} Entries: {entries}");\n        Console.WriteLine($"Overdrawn: {overdrawn} Limit: {Limit}");\n        Console.WriteLine(7 / 2);\n        Console.WriteLine(Math.Max(balance, Limit));\n    }\n}',
        labels: [
          { lines: [7, 8], label: 'Two int boxes: one declared explicitly, one inferred with var.' },
          { lines: [9, 10], label: 'A string and a bool. The comparison produces the bool.' },
          { lines: [11, 11], label: 'A compile-time constant.' },
          { lines: [12, 12], label: 'Store a new value in an existing box.' },
          { lines: [13, 15], label: 'Interpolation: each {name} becomes its value. The bool prints as False.' },
          { lines: [16, 16], label: 'Integer division: prints 3.' },
          { lines: [17, 17], label: 'A Math helper: prints 500.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'A Python name can be re-attached to anything; a C# variable, even one declared with var, keeps one type for life. `/` on two ints truncates like Python\'s `//`. The f-string `f"{x}"` becomes `$"{x}"`. True and False print with capitals, as in Python, but the keywords are lowercase: `true`, `false`.' },
        { from: 'c', note: 'Same typed boxes and the same integer division. New: `string` and `bool` are real types, not char arrays and ints. There are no format specifiers; interpolation does what `%d` and `%s` did. `var` is not "untyped": the compiler writes the type for you.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'csharp', source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        var count = 2;\n        var label = "entries";\n        Console.WriteLine($"{count} {label}");\n        count = count + 1;\n        Console.WriteLine(7 / count);\n    }\n}' },
      choices: ['2 entries\n2', '2 entries\n2.3333', '3 entries\n2', 'an error'],
      answer: '2 entries\n2',
      explanation: 'var made count an int and label a string. The first line interpolates both. Then count is 3, and 7 / 3 with two ints is integer division: 2.',
    },
    {
      kind: 'parsons',
      prompt: 'Inside Main: declare a balance of 250, an owner "Ada" using var, a constant Limit of 1000, and print `Ada: 250 of 1000`.',
      language: 'csharp',
      indentation: false,
      solution: ['int balance = 250;', 'var owner = "Ada";', 'const int Limit = 1000;', 'Console.WriteLine($"{owner}: {balance} of {Limit}");'],
      distractors: ['var balance;', 'Console.WriteLine("{owner}: {balance} of {Limit}");'],
      explanation: 'var needs an initializer to infer from. Without the $, the braces are printed literally.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program prints `Sam has 120` and then `4`.',
      language: 'csharp',
      template: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        {{t1}} balance = 120;\n        {{t2}} owner = "Sam";\n        Console.WriteLine({{dollar}}"{owner} has {balance}");\n        Console.WriteLine(9 {{op}} 2);\n    }\n}',
      blanks: [
        { id: 't1', answers: ['int', 'var'], hint: 'a whole-number box, or let the compiler infer it' },
        { id: 't2', answers: ['string', 'var'] },
        { id: 'dollar', answers: ['$'], hint: 'what turns {owner} into a value?' },
        { id: 'op', answers: ['/'], hint: 'two ints, result 4' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Add `const int Limit = 500;`, apply the amount to the balance, and print `Balance: 70` then `Room: 430` (the limit minus the balance) using interpolation.',
      language: 'csharp',
      starter: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int balance = 100;\n        int amount = -30;\n        Console.WriteLine("Balance: " + balance);\n    }\n}\n',
      tests: [{ description: 'Two lines', expectedStdout: 'Balance: 70\nRoom: 430' }],
      hint: 'balance = balance + amount; then two interpolated WriteLines.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        const int Limit = 500;\n        int balance = 100;\n        int amount = -30;\n        balance = balance + amount;\n        Console.WriteLine($"Balance: {balance}");\n        Console.WriteLine($"Room: {Limit - balance}");\n    }\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Declare `int balance = 90;` and `int price = 40;`. Print `Items: 2` (how many items the balance buys), `Change: 10` (what is left over) and `Half: 45`, computing each from the two variables.',
      language: 'csharp',
      tests: [{ description: 'Three lines', expectedStdout: 'Items: 2\nChange: 10\nHalf: 45' }],
      hint: 'Integer division for the items, % for the change, / 2 for the half.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        int balance = 90;\n        int price = 40;\n        Console.WriteLine($"Items: {balance / price}");\n        Console.WriteLine($"Change: {balance % price}");\n        Console.WriteLine($"Half: {balance / 2}");\n    }\n}\n',
      projectNote: 'LedgerSharp v0.0: the program has typed state and can do whole-number money arithmetic.',
    },
  ],
};

const l13: Lesson = {
  id: 'cs-1-3',
  title: 'Reading a line, parsing a number',
  objective: 'Read text from the console and convert it to a number.',
  minutes: 18,
  lexicon: [
    { id: 'cs.1.readline', term: 'Console.ReadLine()', kind: 'builtin', meaning: 'Read one line of input and return it as a string, without the line break. Even when the user types digits, you get text.', example: 'string name = Console.ReadLine();', analogy: 'Python\'s input() with no prompt argument. Breaks: at the end of input it returns null rather than raising an error.' },
    { id: 'cs.1.parse', term: 'int.Parse(text)', kind: 'builtin', meaning: 'Convert a string of digits to an int. Leading and trailing spaces are allowed; anything else throws an exception (Module 5 shows the safe version, int.TryParse).', example: 'int amount = int.Parse(Console.ReadLine());' },
    { id: 'cs.1.convert', term: 'Convert.ToInt32(text)', kind: 'builtin', meaning: 'Another spelling of the same conversion, from the Convert class. Prefer int.Parse for strings; the two differ only on edge cases (Convert turns null into 0).', example: 'int n = Convert.ToInt32("42");' },
    { id: 'cs.1.trim', term: 'text.Trim()', kind: 'builtin', meaning: 'Return a copy of the string without leading and trailing whitespace. The original is unchanged.', example: 'string name = Console.ReadLine().Trim();' },
    { id: 'cs.1.prompt-read', term: 'prompt, then read', kind: 'pattern', meaning: 'Print the question with WriteLine on its own line, then call ReadLine on the next. Keeping them separate makes the output predictable and testable.', example: 'Console.WriteLine("Balance?");\nint balance = int.Parse(Console.ReadLine());' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Input is text until you convert it',
      body: `\`Console.ReadLine()\` reads one line and **returns a string**. That is the whole story: no address, no format specifier. If you want a number you convert the text in a second step with \`int.Parse\`, which throws if the text is not a whole number. \`Convert.ToInt32\` does the same job with a different name.

Because the two steps are separate, you can clean the text first: \`Trim()\` removes spaces around what the user typed, which matters for names (\`int.Parse\` already ignores surrounding spaces).

The convention in this track: print the prompt with \`WriteLine\` on its own line, then read. The result is a method call wrapped in another, read from the inside out: \`int.Parse(Console.ReadLine())\`.`,
      example: {
        language: 'csharp',
        source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Name?");\n        string name = Console.ReadLine().Trim();\n        Console.WriteLine("Amount?");\n        int amount = int.Parse(Console.ReadLine());\n        int balance = 100 + amount;\n        Console.WriteLine($"{name}: {balance}");\n    }\n}',
        labels: [
          { lines: [7, 8], label: 'Ask, then read the name as text and strip the spaces around it.' },
          { lines: [9, 10], label: 'Ask, then read a line and convert it to an int in one expression.' },
          { lines: [11, 12], label: 'Use the typed values.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`input()` becomes `Console.ReadLine()` and `int(...)` becomes `int.Parse(...)`; both languages hand you a string first. Python\'s `strip()` is `Trim()`.' },
        { from: 'c', note: 'scanf wrote straight into a box through its address (&n) and needed a %d. ReadLine returns a value you store, and the conversion is a separate, visible step. No & anywhere, and a bad input raises an exception instead of leaving garbage in the box.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The user types `5`. What is printed?',
      code: { language: 'csharp', source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        string text = Console.ReadLine();\n        Console.WriteLine(text + 1);\n        int n = int.Parse(text);\n        Console.WriteLine(n + 1);\n    }\n}' },
      choices: ['51\n6', '6\n6', '51\n51', 'an error'],
      answer: '51\n6',
      explanation: 'ReadLine returns the string "5". String + anything is concatenation, so the first line is "51". After int.Parse, n is the number 5 and 5 + 1 is 6.',
    },
    {
      kind: 'parsons',
      prompt: 'Inside Main: ask `Balance?` and read an int, ask `Amount?` and read an int, then print `Balance: <sum>`.',
      language: 'csharp',
      indentation: false,
      solution: ['Console.WriteLine("Balance?");', 'int balance = int.Parse(Console.ReadLine());', 'Console.WriteLine("Amount?");', 'int amount = int.Parse(Console.ReadLine());', 'Console.WriteLine($"Balance: {balance + amount}");'],
      distractors: ['int balance = Console.ReadLine();', 'Console.WriteLine($"Balance: {balance} + {amount}");'],
      explanation: 'ReadLine gives a string, which cannot be stored in an int box without int.Parse. Inside an interpolated string the whole expression goes in one pair of braces; `{balance} + {amount}` prints the two numbers with a plus sign between them.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it reads a trimmed name and a whole-number balance.',
      language: 'csharp',
      template: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Name?");\n        string name = Console.{{read}}().{{trim}}();\n        Console.WriteLine("Starting balance?");\n        int balance = int.{{parse}}(Console.ReadLine());\n        Console.WriteLine($"{name}: {balance}");\n    }\n}',
      blanks: [
        { id: 'read', answers: ['ReadLine'] },
        { id: 'trim', answers: ['Trim'], hint: 'remove the spaces around the text' },
        { id: 'parse', answers: ['Parse'], hint: 'text to int' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Make the program ask `First?` and `Second?`, read an int after each, and print `Total: <sum>`.',
      language: 'csharp',
      starter: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("First?");\n        int a = int.Parse(Console.ReadLine());\n        Console.WriteLine($"Total: {a}");\n    }\n}\n',
      tests: [
        { description: '10 and 5', stdin: '10\n5', expectedStdout: 'First?\nSecond?\nTotal: 15' },
        { description: '3 and -4', stdin: '3\n-4', expectedStdout: 'First?\nSecond?\nTotal: -1' },
      ],
      hint: 'Copy the prompt-then-read pair for the second number, then add the two in the interpolation.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("First?");\n        int a = int.Parse(Console.ReadLine());\n        Console.WriteLine("Second?");\n        int b = int.Parse(Console.ReadLine());\n        Console.WriteLine($"Total: {a + b}");\n    }\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Print `Owner?` and read a name, trimming the spaces around it. Print `Deposit?` and read an int. Then print `<name> deposited <n>` and `Balance: <n>`.',
      language: 'csharp',
      tests: [
        { description: 'Sam deposits 50', stdin: 'Sam\n50', expectedStdout: 'Owner?\nDeposit?\nSam deposited 50\nBalance: 50' },
        { description: 'spaces around the name are trimmed', stdin: '  Ada  \n0', expectedStdout: 'Owner?\nDeposit?\nAda deposited 0\nBalance: 0' },
      ],
      hint: 'Console.ReadLine().Trim() for the name; int.Parse(Console.ReadLine()) for the number.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Owner?");\n        string name = Console.ReadLine().Trim();\n        Console.WriteLine("Deposit?");\n        int deposit = int.Parse(Console.ReadLine());\n        Console.WriteLine($"{name} deposited {deposit}");\n        Console.WriteLine($"Balance: {deposit}");\n    }\n}\n',
      projectNote: 'LedgerSharp can now ask its owner for typed input.',
    },
  ],
};

const l14: Lesson = {
  id: 'cs-1-4',
  title: 'Strings have methods',
  objective: 'Inspect, transform, split and compare strings with their built-in members.',
  minutes: 20,
  lexicon: [
    { id: 'cs.1.length', term: 'text.Length', kind: 'builtin', meaning: 'The number of characters in the string. A property, so no parentheses.', example: 'Console.WriteLine("Ada".Length);   // 3', analogy: 'Python\'s len(text), turned inside out: the string answers about itself. Breaks: Length is not a method call; `Length()` is a compile error.' },
    { id: 'cs.1.string-methods', term: 'ToUpper() / Contains() / Substring()', kind: 'builtin', meaning: 'Methods called on a string with a dot. ToUpper returns an uppercase copy, Contains answers true/false, Substring(start, length) cuts out a piece. None of them changes the original string.', example: 'string s = "ledger";\ns.ToUpper()          // "LEDGER"\ns.Contains("edge")   // true\ns.Substring(0, 3)    // "led"' },
    { id: 'cs.1.split-join', term: 'Split(\' \') and string.Join(", ", parts)', kind: 'builtin', meaning: 'Split cuts a string into an array of strings at a separator character. string.Join does the reverse: glue an array together with a separator.', example: 'string[] parts = "coffee 4".Split(\' \');\nstring back = string.Join("-", parts);   // "coffee-4"', analogy: 'Python\'s `text.split(" ")` and `"-".join(parts)`, except Join belongs to the string class, not to the separator. Breaks: Split takes a char in single quotes, not a string.' },
    { id: 'cs.1.immutable', term: 'strings are immutable', kind: 'concept', meaning: 'No method changes a string in place; each returns a new string. To keep a result you must store it: text = text.ToUpper().', example: 'string s = "sam";\ns.ToUpper();          // s is still "sam"\ns = s.ToUpper();      // now "SAM"' },
    { id: 'cs.1.str-eq', term: '== on strings', kind: 'operator', meaning: 'Compares the characters, not the addresses. "quit" == text is true when text holds those four letters.', example: 'if (text == "quit")', analogy: 'Python\'s == on strings. Breaks: in C, == on two char pointers compared addresses and you needed strcmp; C# does the right thing.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A string is an object that knows things about itself',
      body: `In C#, a string is an **object** with members you reach with a dot. \`Length\` is a property: no parentheses. \`ToUpper()\`, \`Contains("...")\`, \`Substring(start, length)\`, \`Trim()\` and \`Split(' ')\` are methods: parentheses, even when empty.

Strings are **immutable**: no method edits the string you called it on. Each returns a **new** string, and if you do not store the result it is simply lost.

\`Split\` gives a \`string[]\`, an array indexed from 0 as in C. \`string.Join(sep, parts)\` glues an array back together. Finally, \`==\` on two strings compares their **content**.`,
      example: {
        language: 'csharp',
        source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        string name = "Ada Lovelace";\n        string[] parts = name.Split(\' \');\n        Console.WriteLine(name.Length);\n        Console.WriteLine(name.ToUpper());\n        Console.WriteLine(name.Contains("Love"));\n        Console.WriteLine(name.Substring(0, 3));\n        Console.WriteLine(parts[1]);\n        Console.WriteLine(string.Join("-", parts));\n        Console.WriteLine(parts[0] == "Ada");\n    }\n}',
        labels: [
          { lines: [7, 8], label: 'A string, and the array of two pieces you get by splitting it at the space.' },
          { lines: [9, 9], label: 'A property: 12 (the space counts).' },
          { lines: [10, 12], label: 'Three methods that return new values: ADA LOVELACE, True, Ada. name itself is untouched.' },
          { lines: [13, 14], label: 'Index the array (Lovelace), then glue it back with a dash (Ada-Lovelace).' },
          { lines: [15, 15], label: 'Content comparison: True.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`len(s)` becomes `s.Length`; `s.upper()` becomes `s.ToUpper()`; `"x" in s` becomes `s.Contains("x")`; the slice `s[0:3]` becomes `s.Substring(0, 3)` (start and length, not start and end); `" ".join(parts)` becomes `string.Join(" ", parts)`. Immutability is the same as Python.' },
        { from: 'c', note: 'No char arrays, no strlen, no strcmp, no risk of writing past the end. `==` compares content. A C string literal was immutable by accident of being in read-only memory; a C# string is immutable by design, and the garbage collector reclaims the copies you drop.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'csharp', source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        string name = "sam";\n        name.ToUpper();\n        Console.WriteLine(name);\n        string loud = name.ToUpper();\n        Console.WriteLine(loud);\n    }\n}' },
      choices: ['sam\nSAM', 'SAM\nSAM', 'sam\nsam', 'an error'],
      answer: 'sam\nSAM',
      explanation: 'Strings are immutable. The first ToUpper() built "SAM" and threw it away because nothing stored it, so name is still "sam". The second call stores its result in loud.',
    },
    {
      kind: 'parsons',
      prompt: 'Inside Main: split the line `coffee 4` at the space, uppercase the first part, parse the second as an int, and print `COFFEE: 4`.',
      language: 'csharp',
      indentation: false,
      solution: ['string line = "coffee 4";', 'string[] parts = line.Split(\' \');', 'string item = parts[0].ToUpper();', 'int price = int.Parse(parts[1]);', 'Console.WriteLine($"{item}: {price}");'],
      distractors: ['string item = parts[0].ToUpper;', 'int price = parts[1];'],
      explanation: 'A method call needs its parentheses even with no arguments; ToUpper without them names the method instead of calling it. parts[1] is still a string and must be parsed before it can live in an int.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program prints `12`, `True`, `Lovelace` and `Ada_Lovelace`.',
      language: 'csharp',
      template: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        string name = "Ada Lovelace";\n        Console.WriteLine(name.{{len}});\n        Console.WriteLine(name.{{has}}("Ada"));\n        Console.WriteLine(name.{{sub}}(4, 8));\n        string[] parts = name.{{split}}(\' \');\n        Console.WriteLine(string.{{join}}("_", parts));\n    }\n}',
      blanks: [
        { id: 'len', answers: ['Length'], hint: 'a property: no parentheses' },
        { id: 'has', answers: ['Contains'] },
        { id: 'sub', answers: ['Substring'], hint: 'start 4, length 8' },
        { id: 'split', answers: ['Split'] },
        { id: 'join', answers: ['Join'] },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Trim the name, then print `<NAME>\'s ledger` in uppercase and `Initial: <first letter, uppercase>` on a second line.',
      language: 'csharp',
      starter: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Name?");\n        string name = Console.ReadLine();\n        Console.WriteLine($"{name}\'s ledger");\n    }\n}\n',
      tests: [
        { description: 'sam', stdin: 'sam', expectedStdout: 'Name?\nSAM\'s ledger\nInitial: S' },
        { description: 'spaces around ada', stdin: '  ada  ', expectedStdout: 'Name?\nADA\'s ledger\nInitial: A' },
      ],
      hint: 'Store the trimmed, uppercased result back into name; Substring(0, 1) gives the first letter.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Name?");\n        string name = Console.ReadLine().Trim().ToUpper();\n        Console.WriteLine($"{name}\'s ledger");\n        Console.WriteLine($"Initial: {name.Substring(0, 1)}");\n    }\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Print `Entry?` and read a line of the form `<item> <price>` such as `coffee 4`. Split it at the space, then print `Item: <ITEM>` (uppercase) and `Doubled: <price * 2>`.',
      language: 'csharp',
      tests: [
        { description: 'coffee 4', stdin: 'coffee 4', expectedStdout: 'Entry?\nItem: COFFEE\nDoubled: 8' },
        { description: 'tea 10', stdin: 'tea 10', expectedStdout: 'Entry?\nItem: TEA\nDoubled: 20' },
      ],
      hint: 'Split gives a string[]; parts[0] is the item and parts[1] must be parsed before you can double it.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Entry?");\n        string line = Console.ReadLine();\n        string[] parts = line.Split(\' \');\n        string item = parts[0].ToUpper();\n        int price = int.Parse(parts[1]);\n        Console.WriteLine($"Item: {item}");\n        Console.WriteLine($"Doubled: {price * 2}");\n    }\n}\n',
      projectNote: 'LedgerSharp can turn a typed line into typed values, which later versions will do for every entry.',
    },
  ],
};

const l15: Lesson = {
  id: 'cs-1-5',
  title: 'Project: LedgerSharp v0.1',
  objective: 'Ask for a name and a starting balance, then print the ledger header.',
  minutes: 15,
  lexicon: [
    { id: 'cs.1.four-parts', term: 'ask / read / compute / report', kind: 'pattern', meaning: 'The shape of every console program in this track: prompt, read and convert, work on the typed values, print the result. Label the four parts as comments before you type the code.', example: 'Console.WriteLine("Balance?");                 // ask\nint balance = int.Parse(Console.ReadLine());   // read\nbalance = balance + 10;                        // compute\nConsole.WriteLine($"Balance: {balance}");      // report' },
    { id: 'cs.1.quote-in-string', term: '"\'s ledger"', kind: 'punctuation', meaning: 'A single quote inside a double-quoted string needs no escape. A double quote inside one is written \\" and a backslash is \\\\.', example: 'Console.WriteLine($"{name}\'s ledger");\nConsole.WriteLine("She said \\"hi\\"");' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The whole program, labelled',
      body: `LedgerSharp v0.1 asks two questions and prints a two-line header. Everything in it comes from this module: the Program/Main skeleton, prompt-then-read, \`Trim\`, \`int.Parse\` and interpolation. Read the labels first: they are the plan. When you write your own version in the last step, write those labels as comments, then fill each one in.

One detail: the apostrophe in \`'s ledger\` sits inside a double-quoted string and needs no escaping.`,
      example: {
        language: 'csharp',
        source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Name?");\n        string name = Console.ReadLine().Trim();\n        Console.WriteLine("Starting balance?");\n        int balance = int.Parse(Console.ReadLine());\n        Console.WriteLine($"{name}\'s ledger");\n        Console.WriteLine($"Balance: {balance}");\n    }\n}',
        labels: [
          { lines: [1, 6], label: 'The skeleton every program in this track shares.' },
          { lines: [7, 8], label: 'Ask for and read the name as trimmed text.' },
          { lines: [9, 10], label: 'Ask for and read the starting balance as an int.' },
          { lines: [11, 12], label: 'Report: the header line, then the balance line.' },
          { lines: [13, 14], label: 'Close Main and the class.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The user types `Ada` then `250`. What are the last two lines printed?',
      code: { language: 'csharp', source: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Name?");\n        string name = Console.ReadLine().Trim();\n        Console.WriteLine("Starting balance?");\n        int balance = int.Parse(Console.ReadLine());\n        Console.WriteLine("{name}\'s ledger");\n        Console.WriteLine($"Balance: {balance}");\n    }\n}' },
      choices: ['{name}\'s ledger\nBalance: 250', 'Ada\'s ledger\nBalance: 250', 'Ada\'s ledger\nBalance: {balance}', 'an error'],
      answer: '{name}\'s ledger\nBalance: 250',
      explanation: 'The header line has no $ before its opening quote, so it is an ordinary string and the braces are printed literally. The balance line does have the $, so {balance} becomes 250. The program builds fine; this is a logic slip, not a compile error.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble LedgerSharp v0.1 as a complete program. Set the indentation yourself.',
      language: 'csharp',
      indentation: true,
      solution: ['using System;', 'class Program', '{', '    static void Main(string[] args)', '    {', '        Console.WriteLine("Name?");', '        string name = Console.ReadLine().Trim();', '        Console.WriteLine("Starting balance?");', '        int balance = int.Parse(Console.ReadLine());', '        Console.WriteLine($"{name}\'s ledger");', '        Console.WriteLine($"Balance: {balance}");', '    }', '}'],
      distractors: ['        int balance = Console.ReadLine();', '        Console.WriteLine("{name}\'s ledger");'],
      explanation: 'The balance needs int.Parse because ReadLine returns a string, and the header needs the $ or the braces print literally. Each prompt comes right before its read.',
    },
    {
      kind: 'create',
      prompt: 'Write LedgerSharp v0.1 exactly as planned. Print `Name?` and read a name (trim it). Print `Starting balance?` and read a whole number. Then print `<name>\'s ledger` and `Balance: <n>`.',
      language: 'csharp',
      tests: [
        { description: 'Sam with 100', stdin: 'Sam\n100', expectedStdout: 'Name?\nStarting balance?\nSam\'s ledger\nBalance: 100' },
        { description: 'a negative start', stdin: 'Ada\n-20', expectedStdout: 'Name?\nStarting balance?\nAda\'s ledger\nBalance: -20' },
        { description: 'spaces around the name, zero balance', stdin: '  Lee \n0', expectedStdout: 'Name?\nStarting balance?\nLee\'s ledger\nBalance: 0' },
      ],
      hint: 'Write the four labels from the concept step as comments inside Main, then fill each one in and run the tests.',
      solution: 'using System;\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Console.WriteLine("Name?");\n        string name = Console.ReadLine().Trim();\n        Console.WriteLine("Starting balance?");\n        int balance = int.Parse(Console.ReadLine());\n        Console.WriteLine($"{name}\'s ledger");\n        Console.WriteLine($"Balance: {balance}");\n    }\n}\n',
      projectNote: 'LedgerSharp v0.1 complete: a console ledger that knows its owner and its starting balance.',
    },
  ],
};

export const m1: Module = {
  id: 'cs-m1',
  title: 'Hello .NET',
  goal: 'Program.cs, Console.WriteLine/ReadLine, var and explicit types, string interpolation, the dotnet CLI.',
  projectMilestone: 'LedgerSharp v0.1: the console ledger.',
  status: 'available',
  lessons: [l11, l12, l13, l14, l15],
};
