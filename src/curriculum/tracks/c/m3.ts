import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 3: Functions and the stack                                  */
/* ------------------------------------------------------------------ */

const l31: Lesson = {
  id: 'c-3-1',
  title: 'Functions and frames',
  objective: 'Declare, define and call functions, and trace calls as frames on a stack.',
  minutes: 20,
  lexicon: [
    { id: 'c.3.func-def', term: 'int square(int n) { ... }', kind: 'pattern', meaning: 'A function definition: return type, name, typed parameters in parentheses, body in braces. The body must return a value of the stated type.', example: 'int square(int n) {\n    return n * n;\n}', analogy: 'Python\'s def with the types spelled out. It breaks at the return type: C declares up front what kind of thing comes back, and void means nothing comes back.' },
    { id: 'c.3.prototype', term: 'int square(int n);', kind: 'pattern', meaning: 'A declaration without a body, ending in a semicolon. It tells the compiler the name, parameters and return type so calls above the definition can be checked.', example: 'int square(int n);\n\nint main(void) {\n    return square(3) - 9;\n}\n\nint square(int n) {\n    return n * n;\n}', analogy: 'A table of contents: the chapter is promised here and written later. The compiler reads top to bottom and refuses a call to a name it has not met yet.' },
    { id: 'c.3.void', term: 'void', kind: 'keyword', meaning: 'As a return type: the function hands nothing back, so it cannot be used inside an expression. As the parameter list (void): the function takes no arguments.', example: 'void greet(void) {\n    printf("Vault\\n");\n}' },
    { id: 'c.3.return', term: 'return expr;', kind: 'keyword', meaning: 'Leave the function at once and deliver expr to the place the call was written. In a void function, plain return; leaves early.', example: 'return a + b;' },
    { id: 'c.3.frame', term: 'stack frame', kind: 'concept', meaning: 'Each call gets a fresh frame holding its parameters and local boxes, pushed on top of the caller\'s frame. return pops it; the caller\'s frame is untouched underneath.', example: 'main frame: s = ?\n  square frame: n = 4   -> returns 16, frame gone\nmain frame: s = 16', analogy: 'A stack of trays: the newest call is the top tray and is removed first. It breaks for malloc (Module 6), which lives off the stack and survives the return.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Declare, define, call',
      body: `A C function states its **return type**, its name, and **typed parameters**. \`void\` means "returns nothing" or, inside the parentheses, "takes nothing".

The compiler reads top to bottom and must know a function before it sees a call. Either define it above \`main\`, or put a **prototype** (the header line ending in \`;\`) near the top and the definition anywhere below.

The notional machine: every call pushes a **frame** holding that call's parameters and locals. Trace \`s = square(4)\`:

- main's frame holds \`s\`.
- A frame for \`square\` is pushed with \`n = 4\`.
- \`return n * n\` computes 16, the frame is popped.
- 16 lands where the call was written, so \`s\` becomes 16.`,
      example: {
        language: 'c',
        source: '#include <stdio.h>\n\nint square(int n);\nvoid greet(void);\n\nint main(void) {\n    greet();\n    int s = square(4);\n    printf("%d\\n", s);\n    printf("%d\\n", square(5));\n    return 0;\n}\n\nint square(int n) {\n    return n * n;\n}\n\nvoid greet(void) {\n    printf("Vault\\n");\n}',
        labels: [
          { lines: [3, 4], label: 'Prototypes: promises to the compiler. Note the semicolons.' },
          { lines: [7, 7], label: 'Call a void function: nothing comes back, so it stands alone as a statement.' },
          { lines: [8, 8], label: 'Call square: a frame with n = 4 is pushed, 16 comes back, the frame is gone.' },
          { lines: [10, 10], label: 'A call can sit anywhere a value can: here as an argument to printf.' },
          { lines: [14, 16], label: 'Definition of square. The return type says an int comes back, and it does.' },
          { lines: [18, 20], label: 'Definition of greet. No return needed in a void function.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`def square(n):` becomes `int square(int n) {`. Python only needs the def to have run before the call happens; C needs the compiler to have seen a declaration above the call in the file. A Python function with no return gives None; a C void function gives nothing and cannot appear in an expression.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this print?',
      code: { language: 'c', source: '#include <stdio.h>\n\nint twice(int x);\n\nint main(void) {\n    printf("%d\\n", twice(3) + twice(1));\n    return 0;\n}\n\nint twice(int x) {\n    return 2 * x;\n}' },
      choices: ['8', '6', 'an error: twice is used before it is defined', '2'],
      answer: '8',
      explanation: 'The prototype on line 3 makes the calls legal even though the definition is below main. Two calls, two frames in turn: twice(3) returns 6 and its frame is gone before twice(1) returns 2. 6 + 2 is 8.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program with a prototype for `add`, a main that prints `add(2, 3)`, and the definition below. Set the indentation yourself.',
      language: 'c',
      indentation: true,
      solution: ['#include <stdio.h>', 'int add(int a, int b);', 'int main(void) {', '    printf("%d\\n", add(2, 3));', '    return 0;', '}', 'int add(int a, int b) {', '    return a + b;', '}'],
      distractors: ['int add(a, b) {', '    return a + b'],
      explanation: 'Every parameter carries its type, and return is a statement that ends with a semicolon.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the prototype, the return type of banner, and the keyword that hands the value back.',
      language: 'c',
      template: '#include <stdio.h>\n{{proto}}\n{{v}} banner(void);\nint main(void) {\n    banner();\n    printf("%d\\n", cube(3));\n    return 0;\n}\nint cube(int n) {\n    {{ret}} n * n * n;\n}\nvoid banner(void) {\n    printf("Vault\\n");\n}',
      blanks: [
        { id: 'proto', answers: ['int cube(int n);', 'int cube(int);'], hint: 'the first line of the definition, with a semicolon instead of a body' },
        { id: 'v', answers: ['void'], hint: 'banner returns nothing' },
        { id: 'ret', answers: ['return'] },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Add a second function `int triple(int x)`, with its prototype next to the existing one, and print `Triple: <3x>` on a line after `Double:`.',
      language: 'c',
      starter: '#include <stdio.h>\n\nint twice(int x);\n\nint main(void) {\n    int n = 0;\n    printf("Number?\\n");\n    (void)scanf("%d", &n);\n    printf("Double: %d\\n", twice(n));\n    return 0;\n}\n\nint twice(int x) {\n    return 2 * x;\n}\n',
      tests: [
        { description: '4', stdin: '4', expectedStdout: 'Number?\nDouble: 8\nTriple: 12' },
        { description: '0', stdin: '0', expectedStdout: 'Number?\nDouble: 0\nTriple: 0' },
        { description: 'negative', stdin: '-2', expectedStdout: 'Number?\nDouble: -4\nTriple: -6' },
      ],
      hint: 'Three additions: a prototype line, a printf in main, and a definition below twice.',
      solution: '#include <stdio.h>\n\nint twice(int x);\nint triple(int x);\n\nint main(void) {\n    int n = 0;\n    printf("Number?\\n");\n    (void)scanf("%d", &n);\n    printf("Double: %d\\n", twice(n));\n    printf("Triple: %d\\n", triple(n));\n    return 0;\n}\n\nint twice(int x) {\n    return 2 * x;\n}\n\nint triple(int x) {\n    return 3 * x;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Write `void line(void)` that prints `----`, and `int area(int w, int h)` that returns the product. Declare both with prototypes above main and define them below. main prints `Width?`, reads an int, prints `Height?`, reads an int, then calls line(), prints `Area: <w*h>`, and calls line() again.',
      language: 'c',
      tests: [
        { description: '3 by 4', stdin: '3\n4', expectedStdout: 'Width?\nHeight?\n----\nArea: 12\n----' },
        { description: 'zero width', stdin: '0\n5', expectedStdout: 'Width?\nHeight?\n----\nArea: 0\n----' },
      ],
      hint: 'Prototypes end in ; and sit above main. line is called as a statement; area is called inside printf.',
      solution: '#include <stdio.h>\n\nvoid line(void);\nint area(int w, int h);\n\nint main(void) {\n    int w = 0;\n    int h = 0;\n    printf("Width?\\n");\n    (void)scanf("%d", &w);\n    printf("Height?\\n");\n    (void)scanf("%d", &h);\n    line();\n    printf("Area: %d\\n", area(w, h));\n    line();\n    return 0;\n}\n\nvoid line(void) {\n    printf("----\\n");\n}\n\nint area(int w, int h) {\n    return w * h;\n}\n',
      projectNote: 'The Vault\'s actions will each become a function with a name that says its job.',
    },
  ],
};

const l32: Lesson = {
  id: 'c-3-2',
  title: 'Parameters are copies',
  objective: 'Explain why a function cannot change its caller\'s variable, and get results out with return or a pointer parameter.',
  minutes: 20,
  lexicon: [
    { id: 'c.3.by-value', term: 'pass by value', kind: 'concept', meaning: 'The argument\'s value is copied into the parameter\'s box inside the new frame. Assigning to the parameter changes that copy only; the caller\'s box is untouched.', example: 'void reset(int n) {\n    n = 0;   /* changes the copy */\n}', analogy: 'Handing someone a photocopy: they can scribble on it all they like. It breaks for arrays (Module 4), whose name hands over an address instead.' },
    { id: 'c.3.return-result', term: 'x = f(x);', kind: 'pattern', meaning: 'The honest way to change one value: the function returns the new value and the caller stores it.', example: 'total = add(total, amount);' },
    { id: 'c.3.ptr-param', term: 'void f(int *out)', kind: 'pattern', meaning: 'A parameter that holds the address of the caller\'s box, so the function can change the caller\'s box. The caller passes &x, exactly as it does for scanf. The full pointer story is Module 6.', example: 'void add_to(int *total, int amount) {\n    *total = *total + amount;\n}\n\nadd_to(&total, 5);' },
    { id: 'c.3.deref-write', term: '*out = value;', kind: 'operator', meaning: 'Inside the function: "the box at the address out". Reading *out gets the caller\'s value; assigning to *out changes it.', example: '*minutes = seconds / 60;' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The frame gets a copy',
      body: `When you call \`f(total)\`, the **value** of \`total\` is copied into the parameter's box in the new frame. Whatever the function does to its parameter happens to the copy; when the frame is popped, the copy is gone and the caller's \`total\` is exactly as it was.

To change one value, **return** it and let the caller store it: \`total = add(total, 5);\`.

To change the caller's box directly, or to hand back more than one result, pass the box's **address** with \`&\`, just as you do for \`scanf\`. The parameter is then written \`int *total\`, and inside the function \`*total\` means "the box at that address". That is all you need to know about pointers until Module 6.`,
      example: {
        language: 'c',
        source: '#include <stdio.h>\n\nvoid add_copy(int total, int amount) {\n    total = total + amount;\n    printf("inside: %d\\n", total);\n}\n\nint add_returning(int total, int amount) {\n    return total + amount;\n}\n\nvoid add_to(int *total, int amount) {\n    *total = *total + amount;\n}\n\nint main(void) {\n    int total = 10;\n    add_copy(total, 5);\n    printf("after add_copy: %d\\n", total);\n    total = add_returning(total, 5);\n    printf("after add_returning: %d\\n", total);\n    add_to(&total, 5);\n    printf("after add_to: %d\\n", total);\n    return 0;\n}',
        labels: [
          { lines: [3, 6], label: 'Changes its own copy: prints 15 inside, and the caller never sees it.' },
          { lines: [8, 10], label: 'Returns the new value; the caller must store it.' },
          { lines: [12, 14], label: 'Receives an address; *total is the caller\'s box, read and written.' },
          { lines: [17, 18], label: 'Still 10: the copy was changed and thrown away.' },
          { lines: [19, 20], label: '15: the returned value was stored.' },
          { lines: [21, 22], label: '20: & hands over the address, so the function changed main\'s box.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'For numbers Python behaves the same: rebinding a parameter does not touch the caller. But Python lets a function mutate a list or dict argument in place; C has no such special case. Everything is copied unless you pass an address explicitly with &.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this print?',
      code: { language: 'c', source: '#include <stdio.h>\n\nvoid reset(int n) {\n    n = 0;\n    printf("inside: %d\\n", n);\n}\n\nint main(void) {\n    int count = 7;\n    reset(count);\n    printf("%d\\n", count);\n    return 0;\n}' },
      choices: ['inside: 0\n7', 'inside: 0\n0', 'inside: 7\n7', 'inside: 7\n0'],
      answer: 'inside: 0\n7',
      explanation: 'reset receives a copy of 7 in its own frame, sets that copy to 0 and prints it. When reset returns, its frame disappears and main\'s count is still 7. To really reset it, reset would need int *n and the call reset(&count).',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program where `add_one` really raises the caller\'s count, so it prints `5`. Set the indentation yourself.',
      language: 'c',
      indentation: true,
      solution: ['#include <stdio.h>', 'void add_one(int *n) {', '    *n = *n + 1;', '}', 'int main(void) {', '    int count = 4;', '    add_one(&count);', '    printf("%d\\n", count);', '    return 0;', '}'],
      distractors: ['    add_one(count);', '    n = n + 1;'],
      explanation: 'The caller must pass the address with &, and the function must write through the address with *n. Writing n = n + 1 would move the address, not change the box.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so `halve` changes the caller\'s box and the program prints `45`.',
      language: 'c',
      template: '#include <stdio.h>\nvoid halve(int {{star}}value) {\n    {{deref}}value = *value / 2;\n}\nint main(void) {\n    int total = 90;\n    halve({{amp}}total);\n    printf("%d\\n", total);\n    return 0;\n}',
      blanks: [
        { id: 'star', answers: ['*'], hint: 'the parameter holds an address' },
        { id: 'deref', answers: ['*'], hint: 'the box at that address' },
        { id: 'amp', answers: ['&'], hint: 'the same symbol you give scanf' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The deposit never reaches the caller: the program prints `Total: 0`. Change `deposit` to take `int *total` and write through it, and change the call to pass the address. The `Deposited` line stays.',
      language: 'c',
      starter: '#include <stdio.h>\n\nvoid deposit(int total, int amount) {\n    total += amount;\n    printf("Deposited %d\\n", amount);\n}\n\nint main(void) {\n    int total = 0;\n    int amount = 0;\n    printf("Amount?\\n");\n    (void)scanf("%d", &amount);\n    deposit(total, amount);\n    printf("Total: %d\\n", total);\n    return 0;\n}\n',
      tests: [
        { description: '50', stdin: '50', expectedStdout: 'Amount?\nDeposited 50\nTotal: 50' },
        { description: '-20', stdin: '-20', expectedStdout: 'Amount?\nDeposited -20\nTotal: -20' },
      ],
      hint: 'Three edits: `int *total` in the parameter list, `*total += amount;` in the body, and `deposit(&total, amount);` in main.',
      solution: '#include <stdio.h>\n\nvoid deposit(int *total, int amount) {\n    *total += amount;\n    printf("Deposited %d\\n", amount);\n}\n\nint main(void) {\n    int total = 0;\n    int amount = 0;\n    printf("Amount?\\n");\n    (void)scanf("%d", &amount);\n    deposit(&total, amount);\n    printf("Total: %d\\n", total);\n    return 0;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Write `void split(int seconds, int *minutes, int *rest)` that stores seconds / 60 and seconds % 60 into the two boxes. main prints `Seconds?`, reads an int, calls split with the addresses of two int variables, then prints `Minutes: <m>` and `Seconds: <r>`.',
      language: 'c',
      tests: [
        { description: '125', stdin: '125', expectedStdout: 'Seconds?\nMinutes: 2\nSeconds: 5' },
        { description: '59 (under a minute)', stdin: '59', expectedStdout: 'Seconds?\nMinutes: 0\nSeconds: 59' },
        { description: '120 (exact)', stdin: '120', expectedStdout: 'Seconds?\nMinutes: 2\nSeconds: 0' },
      ],
      hint: 'Two results cannot both be returned, so both come back through addresses. Initialise the two boxes in main before passing &.',
      solution: '#include <stdio.h>\n\nvoid split(int seconds, int *minutes, int *rest);\n\nint main(void) {\n    int seconds = 0;\n    int minutes = 0;\n    int rest = 0;\n    printf("Seconds?\\n");\n    (void)scanf("%d", &seconds);\n    split(seconds, &minutes, &rest);\n    printf("Minutes: %d\\n", minutes);\n    printf("Seconds: %d\\n", rest);\n    return 0;\n}\n\nvoid split(int seconds, int *minutes, int *rest) {\n    *minutes = seconds / 60;\n    *rest = seconds % 60;\n}\n',
      projectNote: 'Vault v0.3\'s handle function will update count and total through exactly this kind of parameter.',
    },
  ],
};

const l33: Lesson = {
  id: 'c-3-3',
  title: 'Scope and lifetime',
  objective: 'Say where a variable is visible and how long it lives: block, frame, program.',
  minutes: 18,
  lexicon: [
    { id: 'c.3.block-scope', term: 'block scope', kind: 'concept', meaning: 'A variable is visible from its declaration to the closing brace of the block it was declared in, including the int i of a for header. After the brace, the name does not exist.', example: 'for (int i = 0; i < 3; i++) {\n    int twice = i * 2;\n}\n/* neither i nor twice exists here */', analogy: 'A name badge that works only inside one room. Python has no such rooms below function level: a loop variable is still there after the loop.' },
    { id: 'c.3.lifetime', term: 'locals die on return', kind: 'concept', meaning: 'Local variables live in the call\'s frame. Each call creates them afresh (uninitialised unless you say otherwise) and return destroys them. Never hand out the address of a local.', example: 'int bump(void) {\n    int n = 0;   /* new box every call */\n    n = n + 1;\n    return n;    /* always 1 */\n}' },
    { id: 'c.3.global', term: 'global variable', kind: 'pattern', meaning: 'Declared outside every function; visible everywhere below and alive for the whole program. Any function can change it, which is why bugs involving one are hard to find. Prefer parameters and return values.', example: 'int calls = 0;   /* global */\n\nvoid f(void) {\n    calls++;\n}' },
    { id: 'c.3.static', term: 'static int x = 0;', kind: 'keyword', meaning: 'Inside a function: a local that is initialised once and keeps its value between calls, while staying invisible to other functions.', example: 'int next_id(void) {\n    static int last = 0;\n    last++;\n    return last;\n}', analogy: 'A notebook kept in the function\'s drawer rather than on the shared desk. It breaks if several parts of the program need the same number: then it has to be passed around.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Where a name lives, and for how long',
      body: `**Scope** is where a name is visible; **lifetime** is how long its box exists.

A variable declared inside braces is visible until the matching closing brace, and no further. The \`int i\` of a for header belongs to the loop. Locals live in the frame: created on each call, gone on return, so a function cannot remember anything through a plain local.

A **global** is declared outside every function: visible everywhere below and alive for the whole run. Convenient, and dangerous, because any function can change it without saying so. Reach for parameters and return values first.

\`static\` on a local gives it the program's lifetime but keeps the function's scope: it remembers between calls without being exposed.`,
      example: {
        language: 'c',
        source: '#include <stdio.h>\n\nint calls_total = 0;\n\nint next_id(void) {\n    static int last = 0;\n    last++;\n    calls_total++;\n    return last;\n}\n\nint main(void) {\n    for (int i = 0; i < 3; i++) {\n        int id = next_id();\n        printf("id %d\\n", id);\n    }\n    printf("calls: %d\\n", calls_total);\n    return 0;\n}',
        labels: [
          { lines: [3, 3], label: 'A global: every function below can read and change it.' },
          { lines: [6, 6], label: 'A static local: initialised once, survives between calls, invisible outside next_id.' },
          { lines: [7, 9], label: 'Both counters grow; only last is returned.' },
          { lines: [13, 15], label: 'i and id exist only inside the loop body. id is a fresh box each pass.' },
          { lines: [17, 17], label: 'After the brace neither i nor id exists; calls_total does, because it is global.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python scope is per function: a variable assigned inside a loop is still there after the loop. In C it is gone at the closing brace. Python needs `global x` before assigning to a module variable inside a function; C functions can write a global without any marker, which is exactly why they are hard to trace. Python has no static; people use default arguments or closures instead.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this print?',
      code: { language: 'c', source: '#include <stdio.h>\n\nint bump(void) {\n    int n = 0;\n    n = n + 1;\n    return n;\n}\n\nint main(void) {\n    printf("%d\\n", bump());\n    printf("%d\\n", bump());\n    return 0;\n}' },
      choices: ['1\n1', '1\n2', '0\n1', 'an error'],
      answer: '1\n1',
      explanation: 'n lives in bump\'s frame. Each call pushes a new frame and runs `int n = 0` again, so both calls return 1. The frame, and n with it, is destroyed on return; nothing carries over. `static int n = 0;` would make it print 1 then 2.',
    },
    {
      kind: 'predict',
      prompt: 'What happens when this is compiled and run?',
      code: { language: 'c', source: '#include <stdio.h>\n\nint main(void) {\n    int total = 0;\n    for (int i = 1; i <= 3; i++) {\n        total += i;\n    }\n    printf("%d %d\\n", total, i);\n    return 0;\n}' },
      choices: ['a compile error: i is not declared at the printf', '6 3', '6 4', '6 0'],
      answer: 'a compile error: i is not declared at the printf',
      explanation: 'i was declared in the for header, so its scope ends with the loop\'s closing brace. At the printf the name i does not exist and the compiler stops. total was declared outside the loop, so it is fine. In Python the same code would print 6 3.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a `ticket` function that returns 101 on the first call and 102 on the second, without a global. Set the indentation yourself.',
      language: 'c',
      indentation: true,
      solution: ['#include <stdio.h>', 'int ticket(void) {', '    static int next = 100;', '    next++;', '    return next;', '}', 'int main(void) {', '    printf("%d\\n", ticket());', '    printf("%d\\n", ticket());', '    return 0;', '}'],
      distractors: ['    int next = 100;', 'int next = 100;'],
      explanation: 'A plain local restarts at 100 on every call and both lines would print 101. A global at the left margin would work but exposes next to every function; static keeps the memory and the privacy.',
    },
    {
      kind: 'modify',
      prompt: 'The program prints `Call 1` every time. Make `record_call` remember its count between calls with `static`, so it prints `Call 1`, `Call 2`, ... and main reports the last count.',
      language: 'c',
      starter: '#include <stdio.h>\n\nint record_call(void) {\n    int calls = 0;\n    calls++;\n    printf("Call %d\\n", calls);\n    return calls;\n}\n\nint main(void) {\n    int n = 0;\n    int last = 0;\n    printf("How many?\\n");\n    (void)scanf("%d", &n);\n    for (int i = 0; i < n; i++) {\n        last = record_call();\n    }\n    printf("Calls: %d\\n", last);\n    return 0;\n}\n',
      tests: [
        { description: 'three calls', stdin: '3', expectedStdout: 'How many?\nCall 1\nCall 2\nCall 3\nCalls: 3' },
        { description: 'no calls', stdin: '0', expectedStdout: 'How many?\nCalls: 0' },
      ],
      hint: 'One keyword in front of one declaration.',
      solution: '#include <stdio.h>\n\nint record_call(void) {\n    static int calls = 0;\n    calls++;\n    printf("Call %d\\n", calls);\n    return calls;\n}\n\nint main(void) {\n    int n = 0;\n    int last = 0;\n    printf("How many?\\n");\n    (void)scanf("%d", &n);\n    for (int i = 0; i < n; i++) {\n        last = record_call();\n    }\n    printf("Calls: %d\\n", last);\n    return 0;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Write `int deposit(int amount)` that keeps a running total in a `static` local, adds the amount and returns the new total. No global variables. main repeats: print `Amount?`, read an int; stop when it is 0 (do not deposit it); otherwise print `Total: <deposit(amount)>`. After the loop print `Done`.',
      language: 'c',
      tests: [
        { description: '10, 20, 0', stdin: '10\n20\n0', expectedStdout: 'Amount?\nTotal: 10\nAmount?\nTotal: 30\nAmount?\nDone' },
        { description: 'stop at once', stdin: '0', expectedStdout: 'Amount?\nDone' },
        { description: 'negative amounts', stdin: '5\n-8\n0', expectedStdout: 'Amount?\nTotal: 5\nAmount?\nTotal: -3\nAmount?\nDone' },
      ],
      hint: 'The sentinel loop from Module 2, with the running total living inside deposit instead of main.',
      solution: '#include <stdio.h>\n\nint deposit(int amount);\n\nint main(void) {\n    int amount = 0;\n    printf("Amount?\\n");\n    (void)scanf("%d", &amount);\n    while (amount != 0) {\n        printf("Total: %d\\n", deposit(amount));\n        printf("Amount?\\n");\n        (void)scanf("%d", &amount);\n    }\n    printf("Done\\n");\n    return 0;\n}\n\nint deposit(int amount) {\n    static int total = 0;\n    total += amount;\n    return total;\n}\n',
      projectNote: 'Vault v0.3 keeps its state in main and passes it down, rather than hiding it in a static or a global; now you know all three options and their costs.',
    },
  ],
};

const l34: Lesson = {
  id: 'c-3-4',
  title: 'One job per function',
  objective: 'Order a file header-style and split a flat program into functions that each do one job.',
  minutes: 22,
  lexicon: [
    { id: 'c.3.file-order', term: 'includes, prototypes, main, definitions', kind: 'pattern', meaning: 'The conventional order of a C file: #include lines, then every prototype, then main as the outline of the program, then the definitions. A reader sees the plan before the details.', example: '#include <stdio.h>\n\nint read_int(const char *prompt);\nvoid show(int count, int total);\n\nint main(void) { ... }\n\nint read_int(const char *prompt) { ... }\nvoid show(int count, int total) { ... }' },
    { id: 'c.3.read-int', term: 'int read_int(const char *prompt)', kind: 'pattern', meaning: 'Print the prompt on its own line, read an int, and return it; return 0 if nothing could be read. Every question in the program goes through it.', example: 'int read_int(const char *prompt) {\n    int value = 0;\n    printf("%s\\n", prompt);\n    if (scanf("%d", &value) != 1) {\n        return 0;\n    }\n    return value;\n}' },
    { id: 'c.3.const-char-ptr', term: 'const char *prompt', kind: 'pattern', meaning: 'How a function receives a piece of text it will only read. Pass a string in quotes; print it with %s. Strings themselves are Module 4.', example: 'void say(const char *text) {\n    printf("%s\\n", text);\n}\n\nsay("Vault");' },
    { id: 'c.3.scanf-count', term: 'scanf(...) != 1', kind: 'pattern', meaning: 'scanf returns how many values it stored. Comparing with the number you asked for tells you whether the read worked; this replaces the (void) cast.', example: 'if (scanf("%d", &value) != 1) {\n    return 0;\n}' },
    { id: 'c.3.one-job', term: 'one job per function', kind: 'concept', meaning: 'A function does one thing and is named for it: read_int reads, show shows. If the name needs "and", split it. main then reads as a list of jobs.', example: 'int amount = read_int("Amount?");\nshow(count, total);' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'main is the outline',
      body: `A grown-up C file has an order: includes, then all **prototypes**, then \`main\`, then the definitions. Someone opening the file reads the plan in main before any detail.

Each function does **one job** and is named for it. Two jobs appear in every Vault from now on: asking a question and showing the state.

\`read_int\` takes the prompt as \`const char *prompt\`, which is how C passes text you will only read; print it with \`%s\`. It checks what \`scanf\` returns (the number of values stored) instead of casting it away, and returns 0 when nothing could be read so the caller never sees garbage.`,
      example: {
        language: 'c',
        source: '#include <stdio.h>\n\nint read_int(const char *prompt);\nvoid show(int count, int total);\n\nint main(void) {\n    int count = 0;\n    int total = 0;\n    int amount = read_int("Amount?");\n    total += amount;\n    count++;\n    show(count, total);\n    return 0;\n}\n\nint read_int(const char *prompt) {\n    int value = 0;\n    printf("%s\\n", prompt);\n    if (scanf("%d", &value) != 1) {\n        return 0;\n    }\n    return value;\n}\n\nvoid show(int count, int total) {\n    printf("Records: %d\\n", count);\n    printf("Total: %d\\n", total);\n}',
        labels: [
          { lines: [3, 4], label: 'Prototypes for every function below main.' },
          { lines: [6, 14], label: 'main reads as the plan: ask, update, show.' },
          { lines: [16, 18], label: 'read_int: the prompt text arrives as const char *; %s prints it on its own line.' },
          { lines: [19, 21], label: 'Check scanf\'s count. 0 values stored means give back 0.' },
          { lines: [22, 23], label: 'Hand the value to whoever asked.' },
          { lines: [25, 28], label: 'show: one job, no return value, two lines.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`def read_int(prompt): print(prompt); return int(input())` becomes the function above. Python raises ValueError on bad input; scanf reports how many values it stored and leaves you to check. Python files have no required order; C needs the prototypes above main because the compiler reads once, top to bottom.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Functions calling functions. What is printed, in order?',
      code: { language: 'c', source: '#include <stdio.h>\n\nvoid inner(void) {\n    printf("inner\\n");\n}\n\nvoid outer(void) {\n    printf("outer start\\n");\n    inner();\n    printf("outer end\\n");\n}\n\nint main(void) {\n    outer();\n    printf("main\\n");\n    return 0;\n}' },
      choices: ['outer start\ninner\nouter end\nmain', 'outer start\nouter end\ninner\nmain', 'inner\nouter start\nouter end\nmain', 'main\nouter start\ninner\nouter end'],
      answer: 'outer start\ninner\nouter end\nmain',
      explanation: 'Frames stack: main calls outer (frame 2), outer calls inner (frame 3). inner returns to the line after its call inside outer, outer finishes and returns to main. Each return goes back to exactly where the call was written.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `read_int`. Set the indentation yourself.',
      language: 'c',
      indentation: true,
      solution: ['int read_int(const char *prompt) {', '    int value = 0;', '    printf("%s\\n", prompt);', '    if (scanf("%d", &value) != 1) {', '        return 0;', '    }', '    return value;', '}'],
      distractors: ['    printf("%d\\n", prompt);', '    return &value;'],
      explanation: 'The prompt is text, so it needs %s. And returning &value would hand out the address of a local that dies with the frame; return the value itself.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the prototype\'s parameter type, the argument passed to read_int, and the specifier that prints text.',
      language: 'c',
      template: '#include <stdio.h>\nint read_int({{param}} prompt);\nvoid show(int count, int total);\nint main(void) {\n    int n = read_int({{arg}});\n    show(1, n);\n    return 0;\n}\nint read_int(const char *prompt) {\n    int value = 0;\n    printf("%{{spec}}\\n", prompt);\n    if (scanf("%d", &value) != 1) {\n        return 0;\n    }\n    return value;\n}\nvoid show(int count, int total) {\n    printf("Records: %d\\n", count);\n    printf("Total: %d\\n", total);\n}',
      blanks: [
        { id: 'param', answers: ['const char *', 'const char*'], hint: 'read-only text' },
        { id: 'arg', answers: ['"Amount?"'], hint: 'the question, in double quotes' },
        { id: 'spec', answers: ['s'], hint: 'the specifier for a string' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'This flat Vault has every job inside main, and command 2 is incomplete: it prints only `Records:`. Refactor it: write `int read_int(const char *prompt)` and use it for both reads, write `void show(int count, int total)` that prints `Records:` and `Total:`, and call show for command 2. Prototypes above main, definitions below.',
      language: 'c',
      starter: '#include <stdio.h>\n\nint main(void) {\n    int total = 0;\n    int count = 0;\n    int running = 1;\n    int command = 0;\n    int amount = 0;\n    while (running) {\n        printf("Command?\\n");\n        (void)scanf("%d", &command);\n        switch (command) {\n            case 1:\n                printf("Amount?\\n");\n                (void)scanf("%d", &amount);\n                total += amount;\n                count++;\n                printf("Added\\n");\n                break;\n            case 2:\n                printf("Records: %d\\n", count);\n                break;\n            case 3:\n                printf("Bye\\n");\n                running = 0;\n                break;\n            default:\n                printf("Unknown command\\n");\n                break;\n        }\n    }\n    return 0;\n}\n',
      tests: [
        { description: 'spine example', stdin: '1\n50\n1\n-20\n2\n9\n3', expectedStdout: 'Command?\nAmount?\nAdded\nCommand?\nAmount?\nAdded\nCommand?\nRecords: 2\nTotal: 30\nCommand?\nUnknown command\nCommand?\nBye' },
        { description: 'show when empty', stdin: '2\n3', expectedStdout: 'Command?\nRecords: 0\nTotal: 0\nCommand?\nBye' },
        { description: 'quit immediately', stdin: '3', expectedStdout: 'Command?\nBye' },
      ],
      hint: 'Each printf + scanf pair becomes `x = read_int("...")`. The command and amount boxes can go away. case 2 becomes a single call.',
      solution: '#include <stdio.h>\n\nint read_int(const char *prompt);\nvoid show(int count, int total);\n\nint main(void) {\n    int total = 0;\n    int count = 0;\n    int running = 1;\n    while (running) {\n        int command = read_int("Command?");\n        switch (command) {\n            case 1:\n                total += read_int("Amount?");\n                count++;\n                printf("Added\\n");\n                break;\n            case 2:\n                show(count, total);\n                break;\n            case 3:\n                printf("Bye\\n");\n                running = 0;\n                break;\n            default:\n                printf("Unknown command\\n");\n                break;\n        }\n    }\n    return 0;\n}\n\nint read_int(const char *prompt) {\n    int value = 0;\n    printf("%s\\n", prompt);\n    if (scanf("%d", &value) != 1) {\n        return 0;\n    }\n    return value;\n}\n\nvoid show(int count, int total) {\n    printf("Records: %d\\n", count);\n    printf("Total: %d\\n", total);\n}\n',
    },
    {
      kind: 'create',
      prompt: 'A small statistics tool in three functions. `read_int` as in this lesson. `void report(int count, int total)` prints `Records: <count>`, `Total: <total>` and `Average: <total / count>`, or `Average: 0` when count is 0. main reads `Count?`, then reads `Amount?` that many times adding them up, then calls report.',
      language: 'c',
      tests: [
        { description: 'two amounts', stdin: '2\n10\n20', expectedStdout: 'Count?\nAmount?\nAmount?\nRecords: 2\nTotal: 30\nAverage: 15' },
        { description: 'no amounts (no division)', stdin: '0', expectedStdout: 'Count?\nRecords: 0\nTotal: 0\nAverage: 0' },
        { description: 'average truncates', stdin: '3\n1\n2\n2', expectedStdout: 'Count?\nAmount?\nAmount?\nAmount?\nRecords: 3\nTotal: 5\nAverage: 1' },
      ],
      hint: 'A for loop from 0 to count calls read_int each pass. Inside report, an if guards the division: dividing by zero is undefined behaviour.',
      solution: '#include <stdio.h>\n\nint read_int(const char *prompt);\nvoid report(int count, int total);\n\nint main(void) {\n    int total = 0;\n    int count = read_int("Count?");\n    for (int i = 0; i < count; i++) {\n        total += read_int("Amount?");\n    }\n    report(count, total);\n    return 0;\n}\n\nint read_int(const char *prompt) {\n    int value = 0;\n    printf("%s\\n", prompt);\n    if (scanf("%d", &value) != 1) {\n        return 0;\n    }\n    return value;\n}\n\nvoid report(int count, int total) {\n    printf("Records: %d\\n", count);\n    printf("Total: %d\\n", total);\n    if (count == 0) {\n        printf("Average: 0\\n");\n    } else {\n        printf("Average: %d\\n", total / count);\n    }\n}\n',
      projectNote: 'read_int and show are now in your hands; v0.3 adds handle and the Vault is three functions and an outline.',
    },
  ],
};

const l35: Lesson = {
  id: 'c-3-5',
  title: 'Project: Vault v0.3',
  objective: 'Rebuild Vault v0.2 as read_int, show and handle, with the state updated through pointer parameters.',
  minutes: 22,
  lexicon: [
    { id: 'c.3.handle', term: 'int handle(int command, int *count, int *total)', kind: 'pattern', meaning: 'Run one command against the state. The state arrives as addresses so the function can change main\'s boxes; the return value says whether the loop should continue (1) or stop (0).', example: 'running = handle(command, &count, &total);' },
    { id: 'c.3.continue-flag', term: 'return 1 to continue, 0 to stop', kind: 'concept', meaning: 'A function can answer "should we keep going?" with its return value. The caller stores it in the loop flag, so the decision is made where the command is understood and acted on where the loop lives.', example: 'case 3:\n    printf("Bye\\n");\n    return 0;\ndefault:\n    printf("Unknown command\\n");\n    return 1;' },
    { id: 'c.3.main-outline', term: 'main as outline', kind: 'concept', meaning: 'When every job is a function, main is a few lines that read like the plan: set up state, loop, read a command, handle it. Details live in the functions.', example: 'while (running) {\n    int command = read_int("Command?");\n    running = handle(command, &count, &total);\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Same Vault, three functions',
      body: `Vault v0.3 prints exactly what v0.2 printed. What changes is the shape. \`main\` keeps the state and the loop; \`read_int\` asks every question; \`show\` prints the report; \`handle\` runs one command.

\`handle\` must change \`count\` and \`total\`, which live in main's frame, so main passes their **addresses** and handle writes through \`*count\` and \`*total\`. Its return value answers "keep going?": 1 for every command except 3, which returns 0 after saying \`Bye\`. main stores that answer in \`running\`.

Inside handle there is no \`break\`: each case ends with \`return\`, which leaves the whole function. The labels are the plan.`,
      example: {
        language: 'c',
        source: '#include <stdio.h>\n\nint read_int(const char *prompt);\nvoid show(int count, int total);\nint handle(int command, int *count, int *total);\n\nint main(void) {\n    int count = 0;\n    int total = 0;\n    int running = 1;\n    while (running) {\n        int command = read_int("Command?");\n        running = handle(command, &count, &total);\n    }\n    return 0;\n}\n\nint read_int(const char *prompt) {\n    int value = 0;\n    printf("%s\\n", prompt);\n    if (scanf("%d", &value) != 1) {\n        return 0;\n    }\n    return value;\n}\n\nvoid show(int count, int total) {\n    printf("Records: %d\\n", count);\n    printf("Total: %d\\n", total);\n}\n\nint handle(int command, int *count, int *total) {\n    int amount = 0;\n    switch (command) {\n        case 1:\n            amount = read_int("Amount?");\n            *total = *total + amount;\n            *count = *count + 1;\n            printf("Added\\n");\n            return 1;\n        case 2:\n            show(*count, *total);\n            return 1;\n        case 3:\n            printf("Bye\\n");\n            return 0;\n        default:\n            printf("Unknown command\\n");\n            return 1;\n    }\n}',
        labels: [
          { lines: [3, 5], label: 'Three prototypes: the whole design in three lines.' },
          { lines: [7, 16], label: 'main: state, loop, read a command, hand it over with the addresses of the state, store the answer.' },
          { lines: [18, 25], label: 'read_int, unchanged from the last lesson.' },
          { lines: [27, 30], label: 'show takes plain ints: it only reads them, so copies are fine.' },
          { lines: [32, 39], label: 'handle, add: ask through read_int, then write through both addresses.' },
          { lines: [40, 42], label: 'show wants values, so pass what the addresses point at.' },
          { lines: [43, 45], label: 'Quit: the only arm that returns 0.' },
          { lines: [46, 48], label: 'Unknown: report and keep going. No break anywhere: return leaves the function.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'In Python you might return a tuple `(running, count, total)` or keep the state in a class. C has neither here: results that must change the caller\'s variables travel back through addresses, and the single return value is kept for the yes/no.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The input is `1`, `40`, `2`, `3`. What does the v0.3 program print?',
      code: { language: 'c', source: 'int main(void) {\n    int count = 0;\n    int total = 0;\n    int running = 1;\n    while (running) {\n        int command = read_int("Command?");\n        running = handle(command, &count, &total);\n    }\n    return 0;\n}\n\nint handle(int command, int *count, int *total) {\n    int amount = 0;\n    switch (command) {\n        case 1:\n            amount = read_int("Amount?");\n            *total = *total + amount;\n            *count = *count + 1;\n            printf("Added\\n");\n            return 1;\n        case 2:\n            show(*count, *total);\n            return 1;\n        case 3:\n            printf("Bye\\n");\n            return 0;\n        default:\n            printf("Unknown command\\n");\n            return 1;\n    }\n}' },
      choices: [
        'Command?\nAmount?\nAdded\nCommand?\nRecords: 1\nTotal: 40\nCommand?\nBye',
        'Command?\nAmount?\nAdded\nCommand?\nRecords: 0\nTotal: 0\nCommand?\nBye',
        'Command?\nAmount?\nAdded\nCommand?\nRecords: 1\nTotal: 40\nCommand?\nBye\nCommand?',
        'Command?\nAmount?\nAdded\nRecords: 1\nTotal: 40\nBye',
      ],
      answer: 'Command?\nAmount?\nAdded\nCommand?\nRecords: 1\nTotal: 40\nCommand?\nBye',
      explanation: 'Because handle received &count and &total, writing through *count and *total changed main\'s boxes, so show reports 1 and 40. Command 3 returns 0, main stores it in running, and the loop ends without another `Command?`. Every question, including `Amount?`, is printed by read_int.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `handle` with the add, quit and unknown arms. Set the indentation yourself.',
      language: 'c',
      indentation: true,
      solution: ['int handle(int command, int *count, int *total) {', '    int amount = 0;', '    switch (command) {', '        case 1:', '            amount = read_int("Amount?");', '            *total = *total + amount;', '            *count = *count + 1;', '            printf("Added\\n");', '            return 1;', '        case 3:', '            printf("Bye\\n");', '            return 0;', '        default:', '            printf("Unknown command\\n");', '            return 1;', '    }', '}'],
      distractors: ['            total = total + amount;', '            count++;', '            break;'],
      explanation: 'count and total hold addresses: total = total + amount or count++ would move the address instead of changing main\'s boxes. And break would only leave the switch, reaching the end of handle without a return value; each arm returns 1 or 0.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete main and the prototype of handle.',
      language: 'c',
      template: 'int read_int(const char *prompt);\nvoid show(int count, int total);\nint handle(int command, int {{star}}count, int *total);\n\nint main(void) {\n    int count = 0;\n    int total = 0;\n    int running = 1;\n    while (running) {\n        int command = read_int({{prompt}});\n        running = handle(command, {{c}}, {{t}});\n    }\n    return 0;\n}',
      blanks: [
        { id: 'star', answers: ['*'], hint: 'handle must change the caller\'s box' },
        { id: 'prompt', answers: ['"Command?"'], hint: 'the question, in double quotes' },
        { id: 'c', answers: ['&count'], hint: 'the address of count' },
        { id: 't', answers: ['&total'], hint: 'the address of total' },
      ],
    },
    {
      kind: 'create',
      prompt: 'Write Vault v0.3. Identical output to v0.2 (1 add, 2 show, 3 quit with `Bye`, else `Unknown command`), built from `int read_int(const char *prompt)`, `void show(int count, int total)` and `int handle(int command, int *count, int *total)` that returns 0 when the loop should stop. Prototypes above main, definitions below. Every question goes through read_int.',
      language: 'c',
      starter: '#include <stdio.h>\n\nint read_int(const char *prompt);\nvoid show(int count, int total);\nint handle(int command, int *count, int *total);\n\nint main(void) {\n    /* state, loop: read a command, handle it */\n    return 0;\n}\n\n/* definitions below */\n',
      tests: [
        { description: 'spine example', stdin: '1\n50\n1\n-20\n2\n9\n3', expectedStdout: 'Command?\nAmount?\nAdded\nCommand?\nAmount?\nAdded\nCommand?\nRecords: 2\nTotal: 30\nCommand?\nUnknown command\nCommand?\nBye' },
        { description: 'quit immediately', stdin: '3', expectedStdout: 'Command?\nBye' },
        { description: 'unknown command then quit', stdin: '7\n3', expectedStdout: 'Command?\nUnknown command\nCommand?\nBye' },
        { description: 'show when empty', stdin: '2\n3', expectedStdout: 'Command?\nRecords: 0\nTotal: 0\nCommand?\nBye' },
        { description: 'several adds then show', stdin: '1\n5\n1\n5\n1\n-3\n2\n3', expectedStdout: 'Command?\nAmount?\nAdded\nCommand?\nAmount?\nAdded\nCommand?\nAmount?\nAdded\nCommand?\nRecords: 3\nTotal: 7\nCommand?\nBye' },
      ],
      hint: 'Write the labels from the concept step as comments, then fill in main first and run: the compiler will tell you which definitions are still missing.',
      solution: '#include <stdio.h>\n\nint read_int(const char *prompt);\nvoid show(int count, int total);\nint handle(int command, int *count, int *total);\n\nint main(void) {\n    int count = 0;\n    int total = 0;\n    int running = 1;\n    while (running) {\n        int command = read_int("Command?");\n        running = handle(command, &count, &total);\n    }\n    return 0;\n}\n\nint read_int(const char *prompt) {\n    int value = 0;\n    printf("%s\\n", prompt);\n    if (scanf("%d", &value) != 1) {\n        return 0;\n    }\n    return value;\n}\n\nvoid show(int count, int total) {\n    printf("Records: %d\\n", count);\n    printf("Total: %d\\n", total);\n}\n\nint handle(int command, int *count, int *total) {\n    int amount = 0;\n    switch (command) {\n        case 1:\n            amount = read_int("Amount?");\n            *total = *total + amount;\n            *count = *count + 1;\n            printf("Added\\n");\n            return 1;\n        case 2:\n            show(*count, *total);\n            return 1;\n        case 3:\n            printf("Bye\\n");\n            return 0;\n        default:\n            printf("Unknown command\\n");\n            return 1;\n    }\n}\n',
      projectNote: 'Vault v0.3 complete: the menu actions are functions and the state travels by address. Module 4 gives the records names and an array to live in.',
    },
  ],
};

export const m3: Module = {
  id: 'c-m3',
  title: 'Functions and the stack',
  goal: 'Prototypes, parameters by value, return, scope, the call stack as a model.',
  projectMilestone: 'Vault v0.3: the menu actions become functions.',
  status: 'available',
  lessons: [l31, l32, l33, l34, l35],
};
