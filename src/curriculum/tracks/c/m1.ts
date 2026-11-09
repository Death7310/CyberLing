import type { Lesson, Module } from '../../schema';

const l11: Lesson = {
  id: 'c-1-1',
  title: 'A file that becomes a machine',
  objective: 'Write, compile and run a C program that prints lines.',
  minutes: 18,
  lexicon: [
    { id: 'c.include', term: '#include <stdio.h>', kind: 'pattern', meaning: 'Before compiling, paste in the declarations of the standard input/output functions, so printf is known.', example: '#include <stdio.h>', analogy: 'Importing a dictionary before you can use its words.' },
    { id: 'c.main', term: 'int main(void) { ... }', kind: 'pattern', meaning: 'The function where every C program starts. Returns an int to the operating system; 0 means success.', example: 'int main(void) {\n    return 0;\n}' },
    { id: 'c.printf', term: 'printf("...\\n")', kind: 'builtin', meaning: 'Print formatted text. Unlike Python\'s print, it does NOT end the line; you write \\n yourself.', example: 'printf("Balance: 0\\n");', analogy: 'A verb that says exactly what you wrote, including the pause (\\n) only if you wrote it.' },
    { id: 'c.semicolon', term: ';', kind: 'punctuation', meaning: 'Ends a statement. Line breaks mean nothing to C; the semicolon is the full stop.', example: 'printf("hi\\n");', analogy: 'The full stop of a sentence. Forget it and the compiler reads two sentences as one.' },
    { id: 'c.braces', term: '{ }', kind: 'punctuation', meaning: 'Enclose a block. Indentation is for humans only; braces are the grammar.', example: 'int main(void) {\n    /* block */\n}' },
    { id: 'c.compile', term: 'compile step', kind: 'concept', meaning: 'A compiler (gcc, clang) translates the whole file into machine code before anything runs. Mistakes in grammar are reported then, with line numbers.', example: 'gcc main.c -o main && ./main' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Compile, then run',
      body: `Python reads your file line by line as it runs. C is different: a **compiler** translates the whole file into machine code first. If anything is grammatically wrong, nothing runs; the compiler reports the line.

Every C program starts in a function called \`main\`. Its body is enclosed in braces. Statements end with semicolons. \`printf\` prints text, and it prints **only** what you wrote: a new line happens only where you write \`\\n\`.

Below is Vault v0.0, the project for this track, which will become a record-keeping tool that manages its own memory.`,
      example: {
        language: 'c',
        source: '#include <stdio.h>\n\nint main(void) {\n    printf("CyberLing Vault\\n");\n    printf("Records: 0\\n");\n    return 0;\n}',
        labels: [
          { lines: [1, 1], label: 'Make printf known to the compiler.' },
          { lines: [3, 3], label: 'Program entry point. The brace opens its body.' },
          { lines: [4, 5], label: 'Print two lines. Each statement ends with ; and each line ends with \\n.' },
          { lines: [6, 6], label: 'Report success (0) to the operating system.' },
          { lines: [7, 7], label: 'Close the body.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python\'s print ends the line for you; printf does not. Python uses indentation as grammar; C uses braces and ignores indentation. Python has no compile step; C will refuse to run a file with a single missing semicolon.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: { language: 'c', source: '#include <stdio.h>\nint main(void) {\n    printf("Hello");\n    printf("World\\n");\n    return 0;\n}' },
      choices: ['HelloWorld', 'Hello\nWorld', 'Hello World', 'an error'],
      answer: 'HelloWorld',
      explanation: 'The first printf has no \\n, so the second continues on the same line.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that prints `Vault` and then `Ready`.',
      language: 'c',
      indentation: false,
      solution: ['#include <stdio.h>', 'int main(void) {', '    printf("Vault\\n");', '    printf("Ready\\n");', '    return 0;', '}'],
      distractors: ['    printf("Vault\\n")', 'int main(void):'],
      explanation: 'Every statement needs its semicolon, and the body is opened by a brace, not a colon.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it compiles and prints `Balance: 0` on its own line.',
      language: 'c',
      template: '#include <stdio.h>\nint main(void) {{open}}\n    printf("Balance: 0{{nl}}"){{semi}}\n    return 0;\n}',
      blanks: [
        { id: 'open', answers: ['{'] },
        { id: 'nl', answers: ['\\n'], hint: 'backslash n' },
        { id: 'semi', answers: [';'], hint: 'the full stop of C' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Make the program print three lines: `CyberLing Vault`, `Owner: Sam`, `Records: 0`.',
      language: 'c',
      starter: '#include <stdio.h>\n\nint main(void) {\n    printf("Records: 0\\n");\n    return 0;\n}\n',
      tests: [{ description: 'Three lines', expectedStdout: 'CyberLing Vault\nOwner: Sam\nRecords: 0' }],
      solution: '#include <stdio.h>\n\nint main(void) {\n    printf("CyberLing Vault\\n");\n    printf("Owner: Sam\\n");\n    printf("Records: 0\\n");\n    return 0;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'From a blank file, write a complete C program that prints `Vault ready` and then `Records: 0`.',
      language: 'c',
      tests: [{ description: 'Two lines', expectedStdout: 'Vault ready\nRecords: 0' }],
      hint: 'You need the include, main, two printf statements with \\n, and return 0.',
      solution: '#include <stdio.h>\n\nint main(void) {\n    printf("Vault ready\\n");\n    printf("Records: 0\\n");\n    return 0;\n}\n',
      projectNote: 'Vault v0.0: compiles and announces itself.',
    },
  ],
};

const l12: Lesson = {
  id: 'c-1-2',
  title: 'Boxes with a size',
  objective: 'Declare typed variables and print them with format specifiers.',
  minutes: 20,
  lexicon: [
    { id: 'c.decl', term: 'int x = 5;', kind: 'pattern', meaning: 'Declare a variable: reserve a box of a fixed size and type, give it a name, and optionally fill it. The type comes first and never changes.', example: 'int records = 0;\ndouble balance = 42.5;\nchar grade = \'A\';', analogy: 'Unlike a Python sticky note, a C variable IS the box. It has a fixed size, and it can only ever hold that one kind of thing.' },
    { id: 'c.types', term: 'int / double / char', kind: 'concept', meaning: 'Whole number (usually 4 bytes), decimal number (8 bytes), single character (1 byte).', example: 'int n = 3; double d = 1.5; char c = \'x\';' },
    { id: 'c.format', term: '%d %f %c', kind: 'pattern', meaning: 'Placeholders in a printf string: %d for int, %f for double, %c for char. The values follow, in order, after the string.', example: 'printf("%d records, %.2f total\\n", n, total);', analogy: 'Fill-in-the-blank, like a Python f-string, but the blanks are typed and the values come after.' },
    { id: 'c.assign', term: 'x = x + 1;', kind: 'pattern', meaning: 'Store a new value in an existing box. The box must already be declared.', example: 'records = records + 1;' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A variable is a box with a fixed size',
      body: `In C a variable is a real box in memory with a fixed size and a fixed type. You **declare** it by writing the type first: \`int records = 0;\`. From then on \`records\` can only hold whole numbers.

To print a value, \`printf\` uses **format specifiers**: \`%d\` for an int, \`%f\` for a double (\`%.2f\` for two decimals), \`%c\` for a char. The values come after the string, in the same order as the specifiers.`,
      example: {
        language: 'c',
        source: '#include <stdio.h>\n\nint main(void) {\n    int records = 0;\n    double balance = 42.5;\n    char grade = \'A\';\n    records = records + 1;\n    printf("Records: %d\\n", records);\n    printf("Balance: %.2f Grade: %c\\n", balance, grade);\n    return 0;\n}',
        labels: [
          { lines: [4, 6], label: 'Three boxes: an int, a double, a char. Single quotes for one character.' },
          { lines: [7, 7], label: 'Store a new value into the existing box.' },
          { lines: [8, 8], label: '%d is replaced by records (1).' },
          { lines: [9, 9], label: 'Two placeholders, two values, same order.' },
        ],
      },
      contrast: [{ from: 'python', note: 'In Python a name can be re-attached to any value of any type. In C the type is fixed at declaration, and assigning a decimal to an int silently drops the fraction. The f-string `{balance}` becomes `%f` with `balance` listed afterwards.' }],
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'c', source: '#include <stdio.h>\nint main(void) {\n    int x = 7 / 2;\n    printf("%d\\n", x);\n    return 0;\n}' },
      choices: ['3', '3.5', '4', 'an error'],
      answer: '3',
      explanation: 'Both 7 and 2 are ints, so `/` is integer division and the fraction is dropped. Python 3 would give 3.5 (and `//` for 3).',
    },
    {
      kind: 'parsons',
      prompt: 'Declare a count of 2 and a total of 9.5, then print `2 items, 9.50 total`.',
      language: 'c',
      indentation: false,
      solution: ['#include <stdio.h>', 'int main(void) {', '    int count = 2;', '    double total = 9.5;', '    printf("%d items, %.2f total\\n", count, total);', '    return 0;', '}'],
      distractors: ['    count = 2;', '    printf("%d items, %.2f total\\n");'],
      explanation: 'A box must be declared with its type before it is used, and every % placeholder needs a value after the string.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program prints `Owner: S has 3`.',
      language: 'c',
      template: '#include <stdio.h>\nint main(void) {\n    {{t1}} initial = \'S\';\n    {{t2}} n = 3;\n    printf("Owner: %{{f1}} has %{{f2}}\\n", initial, n);\n    return 0;\n}',
      blanks: [
        { id: 't1', answers: ['char'], hint: 'one character' },
        { id: 't2', answers: ['int'] },
        { id: 'f1', answers: ['c'] },
        { id: 'f2', answers: ['d'] },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Add a `double balance` of 100.25 and print it as `Balance: 100.25` on a second line.',
      language: 'c',
      starter: '#include <stdio.h>\n\nint main(void) {\n    int records = 3;\n    printf("Records: %d\\n", records);\n    return 0;\n}\n',
      tests: [{ description: 'Two lines', expectedStdout: 'Records: 3\nBalance: 100.25' }],
      hint: 'Use %.2f for two decimals.',
      solution: '#include <stdio.h>\n\nint main(void) {\n    int records = 3;\n    double balance = 100.25;\n    printf("Records: %d\\n", records);\n    printf("Balance: %.2f\\n", balance);\n    return 0;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Declare `int records = 0;`, add 2 to it using itself, then print `Records: 2` and `Grade: B` using a char variable.',
      language: 'c',
      tests: [{ description: 'Two lines', expectedStdout: 'Records: 2\nGrade: B' }],
      solution: '#include <stdio.h>\n\nint main(void) {\n    int records = 0;\n    char grade = \'B\';\n    records = records + 2;\n    printf("Records: %d\\n", records);\n    printf("Grade: %c\\n", grade);\n    return 0;\n}\n',
      projectNote: 'Vault v0.0: the program has typed state.',
    },
  ],
};

const l13: Lesson = {
  id: 'c-1-3',
  title: 'Reading input',
  objective: 'Read numbers from the user with scanf and report them.',
  minutes: 20,
  lexicon: [
    { id: 'c.scanf', term: 'scanf("%d", &x);', kind: 'builtin', meaning: 'Read a value from input into the box x. The & gives scanf the box\'s address so it can write into it.', example: 'int amount;\nscanf("%d", &amount);', analogy: 'Telling someone where to deliver a parcel: you give the address of the box, not the box.' },
    { id: 'c.address', term: '&x', kind: 'operator', meaning: 'The address of the box named x. Your first pointer. Module 6 goes deep on this.', example: 'scanf("%lf", &balance);' },
    { id: 'c.lf', term: '%lf', kind: 'pattern', meaning: 'The scanf specifier for a double (printf uses %f).', example: 'scanf("%lf", &price);' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Give scanf the address of the box',
      body: `\`scanf\` reads input using the same placeholders as \`printf\`. One difference matters: it needs to **write into your box**, so you pass the box's **address** with \`&\`. Forgetting the \`&\` is the classic first C bug.

For doubles, scanf wants \`%lf\`. The prompt is printed separately with printf; in this app's tests the prompt ends with \\n so output stays predictable.`,
      example: {
        language: 'c',
        source: '#include <stdio.h>\n\nint main(void) {\n    int balance;\n    printf("Balance?\\n");\n    scanf("%d", &balance);\n    balance = balance + 10;\n    printf("Balance: %d\\n", balance);\n    return 0;\n}',
        labels: [
          { lines: [4, 4], label: 'An empty int box.' },
          { lines: [5, 6], label: 'Ask, then read into the box via its address.' },
          { lines: [7, 8], label: 'Use it.' },
        ],
      },
      contrast: [{ from: 'python', note: 'Python\'s `int(input())` converts text to a number. scanf does the reading and converting at once, straight into a typed box. There is no string in between.' }],
    },
    {
      kind: 'predict',
      prompt: 'The user types `5`. What is printed?',
      code: { language: 'c', source: '#include <stdio.h>\nint main(void) {\n    int n;\n    scanf("%d", &n);\n    printf("%d\\n", n * 2);\n    return 0;\n}' },
      choices: ['10', '5', '55', 'nothing'],
      answer: '10',
      explanation: 'scanf stored 5 into n via its address; n * 2 is 10.',
    },
    {
      kind: 'parsons',
      prompt: 'Read an int and print it doubled.',
      language: 'c',
      indentation: false,
      solution: ['#include <stdio.h>', 'int main(void) {', '    int n;', '    scanf("%d", &n);', '    printf("%d\\n", n * 2);', '    return 0;', '}'],
      distractors: ['    scanf("%d", n);'],
      explanation: 'Without & scanf receives the value of n (garbage) instead of where to put the input.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program reads a double and prints it with two decimals.',
      language: 'c',
      template: '#include <stdio.h>\nint main(void) {\n    double price;\n    scanf("%{{spec}}", {{amp}}price);\n    printf("%.2f\\n", price);\n    return 0;\n}',
      blanks: [
        { id: 'spec', answers: ['lf'], hint: 'scanf wants l before f for a double' },
        { id: 'amp', answers: ['&'] },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Read two ints and print their sum as `Total: <sum>`.',
      language: 'c',
      starter: '#include <stdio.h>\n\nint main(void) {\n    int a;\n    scanf("%d", &a);\n    printf("Total: %d\\n", a);\n    return 0;\n}\n',
      tests: [
        { description: '10 and 5', stdin: '10\n5', expectedStdout: 'Total: 15' },
        { description: '3 and 4', stdin: '3\n4', expectedStdout: 'Total: 7' },
      ],
      solution: '#include <stdio.h>\n\nint main(void) {\n    int a;\n    int b;\n    scanf("%d", &a);\n    scanf("%d", &b);\n    printf("Total: %d\\n", a + b);\n    return 0;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Vault v0.1: print `Records?`, read an int; print `Balance?`, read a double. Then print `Records: <n>` and `Balance: <x.xx>`.',
      language: 'c',
      tests: [
        { description: '3 and 100.5', stdin: '3\n100.5', expectedStdout: 'Records?\nBalance?\nRecords: 3\nBalance: 100.50' },
        { description: '0 and 0', stdin: '0\n0', expectedStdout: 'Records?\nBalance?\nRecords: 0\nBalance: 0.00' },
      ],
      solution: '#include <stdio.h>\n\nint main(void) {\n    int records;\n    double balance;\n    printf("Records?\\n");\n    scanf("%d", &records);\n    printf("Balance?\\n");\n    scanf("%lf", &balance);\n    printf("Records: %d\\n", records);\n    printf("Balance: %.2f\\n", balance);\n    return 0;\n}\n',
      projectNote: 'Vault v0.1: the program reads typed input.',
    },
  ],
};

export const m1: Module = { id: 'c-m1', title: 'Compile, then run', goal: 'The compile step, main, printf/scanf, typed variables.', projectMilestone: 'Vault v0.1: reads two typed values and reports them.', status: 'available', lessons: [l11, l12, l13] };
