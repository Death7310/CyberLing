import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 1: From C to C++                                            */
/* Learners have finished the C track. Every concept is taught as a   */
/* contrast with what they already do in C.                           */
/* ------------------------------------------------------------------ */

const r = String.raw;

const l11: Lesson = {
  id: 'cpp-1-1',
  title: 'Streams instead of printf',
  objective: 'Print and read values with std::cout and std::cin using the same compile step as C.',
  minutes: 18,
  lexicon: [
    { id: 'cpp.1.iostream', term: '#include <iostream>', kind: 'pattern', meaning: 'Make the standard input/output streams (std::cout, std::cin) known to the compiler. C++ standard headers have no .h.', example: '#include <iostream>', analogy: 'Like #include <stdio.h> in C: a dictionary pasted in before compiling. The analogy breaks on the name: C++ headers drop the .h, and the old <iostream.h> no longer exists.' },
    { id: 'cpp.1.cout', term: 'std::cout << x << \'\\n\'', kind: 'builtin', meaning: 'The standard output stream. << sends a value into it; the value\'s type chooses the formatting, so there are no %d placeholders. Chain as many << as you like; end the line with \'\\n\' yourself.', example: 'std::cout << "Records: " << records << \'\\n\';', analogy: 'A conveyor belt: each << drops one more item on. Unlike printf there is no template sentence with gaps; you place the words and values in order.' },
    { id: 'cpp.1.cin', term: 'std::cin >> x', kind: 'builtin', meaning: 'The standard input stream. >> reads the next whitespace-separated token and converts it to the type of x. No & is needed: >> receives x itself by reference.', example: 'int records = 0;\nstd::cin >> records;' },
    { id: 'cpp.1.std', term: 'std::', kind: 'concept', meaning: 'The namespace that holds the whole standard library. std::cout is "the cout that lives in std". The :: is the scope operator.', example: 'std::cout << std::string("hi") << \'\\n\';', analogy: 'A surname: cout is the first name, std the family. It breaks in that a C++ name can carry many such prefixes (a::b::c), and the prefix is grammar, not politeness.' },
    { id: 'cpp.1.endl', term: 'std::endl', kind: 'builtin', meaning: 'Ends the line AND flushes the output buffer to the device. Same visible output as \'\\n\' but slower in loops; prefer \'\\n\' unless you need the flush.', example: 'std::cout << "Saved" << std::endl;' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Same machine, new vocabulary',
      body: `C++ is compiled exactly like C: \`g++ main.cpp -o main\`, and a single grammar mistake means nothing runs. Everything you know about boxes, addresses and the stack still holds. What changes first is the vocabulary for input and output.

\`std::cout\` is the **output stream**. You push values into it with \`<<\`, one after another, and the **type of each value chooses its formatting**: an \`int\` prints as digits, a \`double\` as a short decimal, a string as text. There are no \`%d\` placeholders to keep in sync. A line ends only where you write \`'\\n'\`.

\`std::cin\` is the **input stream**. \`std::cin >> records\` reads the next token and stores it into \`records\`. No \`&\`: the \`>>\` operator receives the box itself (lesson 3 explains how).

\`std::\` in front of every name says "from the standard library namespace". The header is \`<iostream>\`, with no \`.h\`. And \`int main()\` with empty parentheses already means "no parameters" in C++.`,
      example: {
        language: 'cpp',
        source: r`#include <iostream>

int main() {
    int records = 0;
    std::cout << "Records?\n";
    std::cin >> records;
    std::cout << "Vault++" << '\n';
    std::cout << "Records: " << records << '\n';
    return 0;
}`,
        labels: [
          { lines: [1, 1], label: 'Make the streams known. No .h on C++ headers.' },
          { lines: [3, 3], label: 'Entry point. Empty parentheses mean no parameters.' },
          { lines: [4, 4], label: 'A box, initialised, exactly as in C.' },
          { lines: [5, 6], label: 'Ask on its own line, then read into the box. No & needed.' },
          { lines: [7, 8], label: 'Print text and a value by chaining <<. The int formats itself.' },
          { lines: [9, 9], label: 'Report success, as in C.' },
        ],
      },
      contrast: [
        { from: 'c', note: '`printf("Records: %d\\n", records)` becomes `std::cout << "Records: " << records << \'\\n\'`: no format specifier, the type decides. `scanf("%d", &records)` becomes `std::cin >> records` with no `&`. `<stdio.h>` becomes `<iostream>`. `int main(void)` is written `int main()`; both are legal C++.' },
        { from: 'python', note: '`print` ends the line for you; `std::cout` does not. `int(input())` is one step in C++ too (`std::cin >> n`), but the box is typed, so the conversion target is fixed at compile time.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: {
        language: 'cpp',
        source: r`#include <iostream>
int main() {
    int a = 7;
    double b = 2.5;
    std::cout << a << " and " << b << '\n';
    std::cout << a / 2 << '\n';
    return 0;
}`,
      },
      choices: ['7 and 2.5\n3', '7 and 2.500000\n3', '7 and 2.5\n3.5', 'a compile error: no format specifier'],
      answer: '7 and 2.5\n3',
      explanation: '`<<` formats by type: a double prints in its shortest form (2.5), where printf\'s %f would have printed 2.500000. `a / 2` is int divided by int, so it is still integer division: the machine has not changed, only the vocabulary.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that prints `Number?`, reads an int and prints `Doubled: <2n>`.',
      language: 'cpp',
      indentation: false,
      solution: [
        '#include <iostream>',
        'int main() {',
        '    int n = 0;',
        '    std::cout << "Number?\\n";',
        '    std::cin >> n;',
        '    std::cout << "Doubled: " << n * 2 << \'\\n\';',
        '    return 0;',
        '}',
      ],
      distractors: ['#include <iostream.h>', '    std::cin >> &n;', '    std::cout << "Doubled: %d\\n", n * 2;'],
      explanation: 'C++ headers have no .h; `>>` takes the box itself, so `&n` would try to read into an address value; and `<<` has no placeholders, so the value is chained with another `<<`, not listed after a comma.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program reads an int and prints `Got <n>` on its own line.',
      language: 'cpp',
      template: '#include <{{hdr}}>\nint main() {\n    int n = 0;\n    {{in}} >> n;\n    std::cout {{op}} "Got " << n << {{nl}};\n    return 0;\n}',
      blanks: [
        { id: 'hdr', answers: ['iostream'], hint: 'the C++ header for streams, no .h' },
        { id: 'in', answers: ['std::cin'], hint: 'the input stream, with its namespace' },
        { id: 'op', answers: ['<<'], hint: 'the operator that sends values into a stream' },
        { id: 'nl', answers: ["'\\n'", '"\\n"'], hint: 'end the line yourself' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Make the program print `Vault++` first, then ask `Records?` on its own line before reading, and finally print `Records: <n>` followed by `Doubled: <2n>`.',
      language: 'cpp',
      starter: r`#include <iostream>

int main() {
    int records = 0;
    std::cin >> records;
    std::cout << "Records: " << records << '\n';
    return 0;
}
`,
      tests: [
        { description: '3 records', stdin: '3', expectedStdout: 'Vault++\nRecords?\nRecords: 3\nDoubled: 6' },
        { description: '0 records', stdin: '0', expectedStdout: 'Vault++\nRecords?\nRecords: 0\nDoubled: 0' },
      ],
      hint: 'Each output line is one `std::cout << ... << \'\\n\';` statement. The arithmetic can go straight into the chain.',
      solution: r`#include <iostream>

int main() {
    int records = 0;
    std::cout << "Vault++\n";
    std::cout << "Records?\n";
    std::cin >> records;
    std::cout << "Records: " << records << '\n';
    std::cout << "Doubled: " << records * 2 << '\n';
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Vault++ v0.0: print `Vault++`, ask `Records?` and read an int, ask `Amount?` and read an int. Then print `Records: <n>` and `Sum: <n + amount>`.',
      language: 'cpp',
      tests: [
        { description: '3 and 10', stdin: '3\n10', expectedStdout: 'Vault++\nRecords?\nAmount?\nRecords: 3\nSum: 13' },
        { description: 'zeros', stdin: '0\n0', expectedStdout: 'Vault++\nRecords?\nAmount?\nRecords: 0\nSum: 0' },
        { description: 'negative amount', stdin: '5\n-5', expectedStdout: 'Vault++\nRecords?\nAmount?\nRecords: 5\nSum: 0' },
      ],
      hint: 'Two int boxes, two prompt-then-read pairs, two report lines. Write the plan as comments first.',
      solution: r`#include <iostream>

int main() {
    int records = 0;
    int amount = 0;
    std::cout << "Vault++\n";
    std::cout << "Records?\n";
    std::cin >> records;
    std::cout << "Amount?\n";
    std::cin >> amount;
    std::cout << "Records: " << records << '\n';
    std::cout << "Sum: " << records + amount << '\n';
    return 0;
}
`,
      projectNote: 'Vault++ v0.0: the C Vault\'s first lines, rewritten with streams.',
    },
  ],
};

const l12: Lesson = {
  id: 'cpp-1-2',
  title: 'Strings that know their length',
  objective: 'Store, join, compare and read text with std::string instead of char arrays.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.1.string', term: 'std::string', kind: 'builtin', meaning: 'A text value that owns its characters, grows as needed and frees itself. No \\0 to place, no buffer size to guess. Needs #include <string>.', example: '#include <string>\nstd::string owner = "Sam";', analogy: 'Like a Python str, it just holds text and you never see the bytes. It breaks in one place: a std::string is mutable, so `s += "x"` changes s in place rather than making a new one.' },
    { id: 'cpp.1.string-plus', term: 's1 + s2', kind: 'operator', meaning: 'Join two strings (or a string and a literal) into a new string. Replaces strcat and its buffer arithmetic.', example: 'std::string full = first + " " + last;' },
    { id: 'cpp.1.size', term: 's.size()', kind: 'builtin', meaning: 'The number of characters in the string. Constant time; nothing is scanned for \\0. The result type is std::size_t (unsigned).', example: 'std::cout << name.size() << \'\\n\';' },
    { id: 'cpp.1.string-eq', term: 's1 == s2', kind: 'operator', meaning: 'Compare the contents of two strings. Also <, > for alphabetical order. Replaces strcmp(a, b) == 0.', example: 'if (password == "open sesame") {\n    std::cout << "Welcome\\n";\n}' },
    { id: 'cpp.1.getline', term: 'std::getline(std::cin, s)', kind: 'builtin', meaning: 'Read a whole line (spaces included) into s, dropping the newline. After a >> read, write std::getline(std::cin >> std::ws, s) so the leftover newline is skipped first.', example: 'std::string name;\nstd::getline(std::cin >> std::ws, name);' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Text without bookkeeping',
      body: `In C a string was a \`char\` array you sized yourself, ended with \`\\0\`, and handled with \`strcpy\`, \`strcat\`, \`strlen\`, \`strcmp\`. \`std::string\` (from \`<string>\`) does the bookkeeping: it **owns** its characters, grows when you append, and frees itself when it goes out of scope.

\`+\` joins strings. \`.size()\` is the length. \`==\` compares **contents**, not addresses, so it finally means what it looks like.

Reading differs by shape. \`std::cin >> word\` reads **one token**: it stops at the first space. \`std::getline(std::cin, line)\` reads the **whole line** up to the newline and throws the newline away.

The trap: \`>>\` leaves its newline in the input. A \`getline\` right after it reads that leftover as an empty line. Skip whitespace first: \`std::getline(std::cin >> std::ws, line)\`.`,
      example: {
        language: 'cpp',
        source: r`#include <iostream>
#include <string>

int main() {
    std::string name;
    std::string town;
    std::cout << "Name?\n";
    std::getline(std::cin, name);
    std::cout << "Town?\n";
    std::cin >> town;
    std::string greeting = "Hello, " + name;
    std::cout << greeting << " from " << town << '\n';
    std::cout << "Letters: " << name.size() << '\n';
    if (town == "Paris") {
        std::cout << "Bonjour\n";
    }
    return 0;
}`,
        labels: [
          { lines: [2, 2], label: 'std::string lives in its own header.' },
          { lines: [5, 6], label: 'Two empty strings. No size to choose.' },
          { lines: [7, 8], label: 'Ask, then read a full line, spaces included.' },
          { lines: [9, 10], label: 'Ask, then read a single word.' },
          { lines: [11, 12], label: 'Join with + and print.' },
          { lines: [13, 13], label: 'Length without scanning for \\0.' },
          { lines: [14, 16], label: 'Compare contents with ==, no strcmp.' },
        ],
      },
      contrast: [
        { from: 'c', note: '`char name[64]; fgets(name, 64, stdin);` and then stripping the newline becomes one `std::getline`. `strcat(full, last)` becomes `full + last`. `strlen` becomes `.size()`. `strcmp(a, b) == 0` becomes `a == b`; in C `a == b` compared two addresses, in C++ it compares the text. The false friend: `name` is a string value here, not a pointer to a buffer.' },
        { from: 'python', note: '`input()` is `std::getline`; `len(s)` is `s.size()`; `+` and `==` work the same way. `s[0]` works too, but there is no negative indexing.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The user types `3`, presses Enter, then types `Ada Lovelace` and presses Enter. What is printed?',
      code: {
        language: 'cpp',
        source: r`#include <iostream>
#include <string>
int main() {
    int n = 0;
    std::string name;
    std::cin >> n;
    std::getline(std::cin, name);
    std::cout << "[" << name << "]" << n << '\n';
    return 0;
}`,
      },
      choices: ['[]3', '[Ada Lovelace]3', '[Ada]3', '[ Ada Lovelace]3'],
      answer: '[]3',
      explanation: '`>>` reads the 3 and stops at the Enter that follows it, leaving that newline in the input. `getline` then reads up to the first newline it finds, which is immediately: an empty string. `Ada Lovelace` is still waiting unread. Fix: `std::getline(std::cin >> std::ws, name)` skips the leftover whitespace first (or `std::cin.ignore(...)` discards the rest of the line).',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that asks `Name?`, reads a full line, then prints `Hello, <name>` and the length of that greeting.',
      language: 'cpp',
      indentation: false,
      solution: [
        '#include <iostream>',
        '#include <string>',
        'int main() {',
        '    std::string name;',
        '    std::cout << "Name?\\n";',
        '    std::getline(std::cin, name);',
        '    std::string greeting = "Hello, " + name;',
        '    std::cout << greeting << \'\\n\';',
        '    std::cout << greeting.size() << \'\\n\';',
        '    return 0;',
        '}',
      ],
      distractors: ['    char name[64];', '    std::cin >> name;', '    std::cout << strlen(greeting) << \'\\n\';'],
      explanation: 'A std::string needs no size; `>>` would stop at the first space of a two-word name; and the length of a std::string is `.size()`, not strlen (which wants a char array).',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program reads a count, then a full-line owner name, greets Sam by name and prints the name length.',
      language: 'cpp',
      template: '#include <iostream>\n#include <string>\nint main() {\n    int count = 0;\n    {{type}} owner;\n    std::cin >> count;\n    std::getline(std::cin >> {{ws}}, owner);\n    if (owner {{eq}} "Sam Lee") {\n        std::cout << "Hi Sam, " << count << \'\\n\';\n    }\n    std::cout << owner{{size}} << \'\\n\';\n    return 0;\n}',
      blanks: [
        { id: 'type', answers: ['std::string'], hint: 'the text type, with its namespace' },
        { id: 'ws', answers: ['std::ws'], hint: 'skip the newline left behind by >>' },
        { id: 'eq', answers: ['=='], hint: 'compares contents in C++' },
        { id: 'size', answers: ['.size()', '.length()'], hint: 'a member call, not a free function' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program greets only the first word of a name. Change it to read the whole line, and add a second output line `Length: <n>` with the length of the name.',
      language: 'cpp',
      starter: r`#include <iostream>
#include <string>

int main() {
    std::string name;
    std::cout << "Name?\n";
    std::cin >> name;
    std::cout << "Hello, " << name << '\n';
    return 0;
}
`,
      tests: [
        { description: 'two-word name', stdin: 'Ada Lovelace', expectedStdout: 'Name?\nHello, Ada Lovelace\nLength: 12' },
        { description: 'one-word name', stdin: 'Sam', expectedStdout: 'Name?\nHello, Sam\nLength: 3' },
      ],
      hint: 'Replace the `>>` read with std::getline. The length is `name.size()`.',
      solution: r`#include <iostream>
#include <string>

int main() {
    std::string name;
    std::cout << "Name?\n";
    std::getline(std::cin, name);
    std::cout << "Hello, " << name << '\n';
    std::cout << "Length: " << name.size() << '\n';
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Ask `Name?` and read a full line. Ask `Password?` and read a full line. If the password is exactly `open sesame`, print `Welcome, <name>`; otherwise print `Denied`. Finally print `Name length: <n>`.',
      language: 'cpp',
      tests: [
        { description: 'correct password, two-word name', stdin: 'Ada Lovelace\nopen sesame', expectedStdout: 'Name?\nPassword?\nWelcome, Ada Lovelace\nName length: 12' },
        { description: 'wrong password', stdin: 'Sam\nopen\n', expectedStdout: 'Name?\nPassword?\nDenied\nName length: 3' },
        { description: 'password with a space but wrong', stdin: 'Grace\nopen  sesame', expectedStdout: 'Name?\nPassword?\nDenied\nName length: 5' },
      ],
      hint: 'Two std::getline calls, one if/else with ==, then .size(). No strcmp anywhere.',
      solution: r`#include <iostream>
#include <string>

int main() {
    std::string name;
    std::string password;
    std::cout << "Name?\n";
    std::getline(std::cin, name);
    std::cout << "Password?\n";
    std::getline(std::cin, password);
    if (password == "open sesame") {
        std::cout << "Welcome, " << name << '\n';
    } else {
        std::cout << "Denied\n";
    }
    std::cout << "Name length: " << name.size() << '\n';
    return 0;
}
`,
      projectNote: 'Vault++ will greet its owner by a full name read with std::getline.',
    },
  ],
};

const l13: Lesson = {
  id: 'cpp-1-3',
  title: 'Another name for the same box',
  objective: 'Let a function change or read the caller\'s variable through a reference instead of a pointer.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.1.ref', term: 'int &r = x;', kind: 'pattern', meaning: 'Declare r as a reference: a second name for the existing box x. Writing to r writes to x. It must be initialised when declared.', example: 'int x = 1;\nint &r = x;\nr = 5;   // x is now 5', analogy: 'A nickname: "Sam" and "Samantha" are one person. It breaks in that a nickname can be reassigned to someone else; a reference never can.' },
    { id: 'cpp.1.ref-param', term: 'void f(int &n)', kind: 'pattern', meaning: 'A reference parameter: n IS the caller\'s variable for the duration of the call. The caller writes f(x), with no &, and sees every change f makes.', example: 'void deposit(int &balance, int amount) {\n    balance = balance + amount;\n}\n// caller: deposit(total, 25);' },
    { id: 'cpp.1.const-ref', term: 'const std::string &s', kind: 'pattern', meaning: 'Pass a large value for reading without copying it and without allowing changes. The default way to take a std::string or std::vector parameter you only read.', example: 'void greet(const std::string &name) {\n    std::cout << "Hello, " << name << \'\\n\';\n}' },
    { id: 'cpp.1.ref-rules', term: 'reference rules', kind: 'concept', meaning: 'A reference is never null and never re-seated: `r = y` copies y\'s value into the box r names; it does not make r refer to y. No `*` to read through it, no `->`.', example: 'int a = 1, b = 2;\nint &r = a;\nr = b;   // a becomes 2; r still names a' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'References: pointers you cannot misuse',
      body: `In C, for a function to change the caller's box you passed \`&x\` and wrote \`*p\` inside. The pointer could be null, could be moved, and every use needed a \`*\`.

A **reference** is a second name for a box that already exists. \`int &alias = balance;\` makes \`alias\` and \`balance\` the same box: assign to one, read the other. You use it exactly like the original: no \`*\`, no \`->\`.

Three rules make references safer than pointers: a reference **must be initialised** when declared, it **cannot be null**, and it **cannot be re-seated**: \`alias = other\` copies \`other\`'s value into the box, it never makes \`alias\` point elsewhere.

As a **parameter**, \`int &balance\` means the function works on the caller's box directly, and the caller writes plain \`deposit(balance, 25)\`. For big values you only read, \`const std::string &name\` avoids the copy and forbids changes. This is why \`std::cin >> n\` needs no \`&\`: \`>>\` takes a reference.`,
      example: {
        language: 'cpp',
        source: r`#include <iostream>
#include <string>

void deposit(int &balance, int amount) {
    balance = balance + amount;
}

void greet(const std::string &name) {
    std::cout << "Hello, " << name << '\n';
}

int main() {
    int balance = 100;
    deposit(balance, 25);
    std::cout << "Balance: " << balance << '\n';
    int &alias = balance;
    alias = 0;
    std::cout << "Balance: " << balance << '\n';
    std::string owner = "Sam";
    greet(owner);
    return 0;
}`,
        labels: [
          { lines: [4, 6], label: 'balance IS the caller\'s box. No * anywhere.' },
          { lines: [8, 10], label: 'Read a string without copying it; const forbids changes.' },
          { lines: [13, 15], label: 'Call with the variable itself, no &. The caller sees 125.' },
          { lines: [16, 18], label: 'A second name for balance. Writing 0 through alias zeroes balance.' },
          { lines: [19, 20], label: 'The string is passed by reference: no copy of the characters.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'C: `void deposit(int *balance, int amount) { *balance += amount; }` called as `deposit(&balance, 25)`. C++: drop the `*` inside and the `&` at the call; put a single `&` in the parameter type. A pointer can be NULL and can be moved with `p = &other`; a reference can do neither. Pointers still exist in C++ and are still right for "may be absent" and for arrays of raw memory.' },
        { from: 'python', note: 'Passing a list to a Python function lets the function mutate it, which looks like a reference parameter. The difference: Python always passes the object (rebinding the parameter name does nothing to the caller), while a C++ reference is the caller\'s box itself, and assigning to it changes the caller\'s value.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: {
        language: 'cpp',
        source: r`#include <iostream>
void deposit(int &balance, int amount) {
    balance = balance + amount;
}
int main() {
    int a = 10;
    int b = 20;
    deposit(a, 5);
    int &r = a;
    r = b;
    r = 100;
    std::cout << a << ' ' << b << '\n';
    return 0;
}`,
      },
      choices: ['100 20', '100 100', '15 100', '10 100'],
      answer: '100 20',
      explanation: '`deposit(a, 5)` changes the caller\'s `a` to 15 through the reference. `r = b` does NOT make r refer to b: it copies b\'s value (20) into a. `r = 100` then writes 100 into a. b was never written to, so it is still 20.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program where `add_fee` subtracts a fee from the caller\'s balance through a reference, then main prints `Balance: 30`. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        'void add_fee(int &balance, int fee) {',
        '    balance = balance - fee;',
        '}',
        'int main() {',
        '    int balance = 50;',
        '    add_fee(balance, 20);',
        '    std::cout << "Balance: " << balance << \'\\n\';',
        '    return 0;',
        '}',
      ],
      distractors: ['void add_fee(int *balance, int fee) {', '    add_fee(&balance, 20);', '    *balance = *balance - fee;'],
      explanation: 'The pointer version is the C habit: it needs `&` at the call and `*` inside. With a reference parameter the function body and the call site both read like ordinary variables.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so `append_suffix` changes the caller\'s string and `show` reads a string without copying it. Output: `Sam Lee`.',
      language: 'cpp',
      template: '#include <iostream>\n#include <string>\nvoid append_suffix(std::string {{amp}}name, const std::string &suffix) {\n    name = name + suffix;\n}\nvoid show({{cr}} std::string &label) {\n    std::cout << label << \'\\n\';\n}\nint main() {\n    std::string owner = "Sam";\n    append_suffix({{call}}, " Lee");\n    show(owner);\n    return 0;\n}',
      blanks: [
        { id: 'amp', answers: ['&'], hint: 'make the parameter another name for the caller\'s box' },
        { id: 'cr', answers: ['const'], hint: 'read-only access, no copy' },
        { id: 'call', answers: ['owner'], hint: 'the variable itself, no address operator' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The deposit never reaches main: `balance` is passed by value. Change `deposit` to take the balance by reference so the final line reports the new balance.',
      language: 'cpp',
      starter: r`#include <iostream>

void deposit(int balance, int amount) {
    balance = balance + amount;
    std::cout << "Deposited " << amount << ", now " << balance << '\n';
}

int main() {
    int balance = 100;
    int amount = 0;
    std::cout << "Amount?\n";
    std::cin >> amount;
    deposit(balance, amount);
    std::cout << "Balance: " << balance << '\n';
    return 0;
}
`,
      tests: [
        { description: 'deposit 25', stdin: '25', expectedStdout: 'Amount?\nDeposited 25, now 125\nBalance: 125' },
        { description: 'deposit 0', stdin: '0', expectedStdout: 'Amount?\nDeposited 0, now 100\nBalance: 100' },
        { description: 'negative deposit', stdin: '-100', expectedStdout: 'Amount?\nDeposited -100, now 0\nBalance: 0' },
      ],
      hint: 'One character in the parameter list. The call site does not change.',
      solution: r`#include <iostream>

void deposit(int &balance, int amount) {
    balance = balance + amount;
    std::cout << "Deposited " << amount << ", now " << balance << '\n';
}

int main() {
    int balance = 100;
    int amount = 0;
    std::cout << "Amount?\n";
    std::cin >> amount;
    deposit(balance, amount);
    std::cout << "Balance: " << balance << '\n';
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write `void apply(int &balance, int amount)` that adds the amount to the balance, and `void report(const std::string &owner, int balance)` that prints `<owner>: <balance>`. In main: ask `Owner?` and read a full line; ask `Amount?` and read an int; start the balance at 100; apply; report.',
      language: 'cpp',
      tests: [
        { description: 'two-word owner, deposit', stdin: 'Sam Lee\n25', expectedStdout: 'Owner?\nAmount?\nSam Lee: 125' },
        { description: 'withdrawal', stdin: 'Ada\n-30', expectedStdout: 'Owner?\nAmount?\nAda: 70' },
        { description: 'zero', stdin: 'Grace Hopper\n0', expectedStdout: 'Owner?\nAmount?\nGrace Hopper: 100' },
      ],
      hint: 'Read the owner with std::getline BEFORE the `>>` read, so there is no leftover newline to skip. The report takes the string by const reference.',
      solution: r`#include <iostream>
#include <string>

void apply(int &balance, int amount) {
    balance = balance + amount;
}

void report(const std::string &owner, int balance) {
    std::cout << owner << ": " << balance << '\n';
}

int main() {
    std::string owner;
    int amount = 0;
    int balance = 100;
    std::cout << "Owner?\n";
    std::getline(std::cin, owner);
    std::cout << "Amount?\n";
    std::cin >> amount;
    apply(balance, amount);
    report(owner, balance);
    return 0;
}
`,
      projectNote: 'Vault++ helper functions take references: no out-pointers, no copies of strings.',
    },
  ],
};

const l14: Lesson = {
  id: 'cpp-1-4',
  title: 'Small words that replace old habits',
  objective: 'Use namespaces, auto, constexpr, brace initialisation and static_cast in place of their C equivalents.',
  minutes: 18,
  lexicon: [
    { id: 'cpp.1.namespace', term: 'namespace vault { ... }', kind: 'keyword', meaning: 'Group names under a prefix so they cannot clash with other code: vault::is_full. `using namespace std;` removes the std:: prefix everywhere below it; never put it in a header, because every file that includes the header inherits the clash risk (size, count, data are all std names).', example: 'namespace vault {\n    bool is_full(int n) { return n >= 3; }\n}\n// vault::is_full(2)' },
    { id: 'cpp.1.auto', term: 'auto', kind: 'keyword', meaning: 'Let the compiler deduce the variable\'s type from its initialiser. The type is still fixed at compile time; auto only saves you writing it. Use it when the type is obvious from the right-hand side or long to spell.', example: 'auto total = 0;        // int\nauto ratio = 7.0 / 2;  // double', analogy: 'Like leaving the subject implicit in "Went home." The listener fills in "I" from context; the sentence is no less definite. It breaks when the context is unclear: `auto x = get();` tells the reader nothing.' },
    { id: 'cpp.1.constexpr', term: 'constexpr int kMax = 100;', kind: 'keyword', meaning: 'A named constant computed at compile time, with a real type and scope. Replaces #define for numbers.', example: 'constexpr int kMaxRecords = 100;' },
    { id: 'cpp.1.brace-init', term: 'int n{0};', kind: 'pattern', meaning: 'Brace (uniform) initialisation. Refuses narrowing: `int n{2.5};` is a compile error, where `int n = 2.5;` silently stores 2. Empty braces `int n{};` mean zero.', example: 'int count{0};\ndouble rate{1.5};' },
    { id: 'cpp.1.static-cast', term: 'static_cast<int>(x)', kind: 'keyword', meaning: 'Convert a value to another type on purpose and visibly. Does only sensible conversions (double to int, int to double) and is easy to search for; the C cast `(int)x` can do anything.', example: 'double price = 9.99;\nint cents = static_cast<int>(price * 100);' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Six small differences',
      body: `C++ keeps C's keywords and adds a few that replace old habits.

- \`bool\` is built in, with \`true\` and \`false\`. It streams as \`1\`/\`0\` unless you insert \`std::boolalpha\`.
- \`constexpr int kMaxRecords = 3;\` replaces \`#define\`: it has a type, obeys scope, and shows up in error messages by name.
- \`int count{0};\` is **brace initialisation**. It refuses to lose information: \`int n{2.5};\` does not compile, where \`int n = 2.5;\` quietly stores 2.
- \`static_cast<int>(x)\` converts on purpose. It is long to type so that conversions are visible and searchable.
- \`auto\` deduces the type from the initialiser. The type is still fixed; you just do not spell it.
- \`namespace vault { ... }\` groups your functions under a prefix, exactly as \`std\` groups the library. \`using namespace std;\` would pull every std name into scope. In a header that happens in every file that includes it, and names like \`count\`, \`size\` and \`data\` start to clash. Write \`std::\`.`,
      example: {
        language: 'cpp',
        source: r`#include <iostream>

constexpr int kMaxRecords = 3;

namespace vault {
    bool is_full(int count) {
        return count >= kMaxRecords;
    }
}

int main() {
    int count{0};
    double ratio = 7.0 / 2;
    auto whole = static_cast<int>(ratio);
    count = count + whole;
    std::cout << "Whole: " << whole << '\n';
    std::cout << "Full: " << std::boolalpha << vault::is_full(count) << '\n';
    return 0;
}`,
        labels: [
          { lines: [3, 3], label: 'A typed, scoped constant instead of a macro.' },
          { lines: [5, 9], label: 'Our own namespace; the function is vault::is_full outside it. bool is built in.' },
          { lines: [12, 12], label: 'Brace initialisation: would refuse a double here.' },
          { lines: [13, 14], label: 'Convert 3.5 to 3 visibly; auto deduces int from the cast.' },
          { lines: [16, 17], label: 'boolalpha prints true/false instead of 1/0.' },
        ],
      },
      contrast: [
        { from: 'c', note: '`#define MAX 3` becomes `constexpr int kMax = 3;`. `(int)x` becomes `static_cast<int>(x)`. `#include <stdbool.h>` is unnecessary: `bool`, `true`, `false` are keywords. `int n = 0;` still works; `int n{0};` adds a narrowing check. A C `static` helper hidden in a file is a C++ namespace member.' },
        { from: 'python', note: '`auto` looks like Python\'s untyped names but is not: the type is decided once from the initialiser and never changes. `True`/`False` are `true`/`false` and print as 1/0 by default.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: {
        language: 'cpp',
        source: r`#include <iostream>
int main() {
    bool ok = 3 > 2;
    auto n = 7 / 2;
    double d = 7 / 2;
    std::cout << ok << ' ' << n << ' ' << d << '\n';
    return 0;
}`,
      },
      choices: ['1 3 3', 'true 3 3.5', '1 3 3.5', 'true 3 3'],
      answer: '1 3 3',
      explanation: 'Without std::boolalpha a bool streams as 1. `7 / 2` is integer division, so `auto n` is an int holding 3. The same integer division happens before the result is stored into the double, so d is 3.0 and prints as 3.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program with a constant `kLimit` of 100, a function `vault::over_limit`, and a main that prints `true` for an amount of 250. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        'constexpr int kLimit = 100;',
        'namespace vault {',
        '    bool over_limit(int amount) {',
        '        return amount > kLimit;',
        '    }',
        '}',
        'int main() {',
        '    int amount{250};',
        '    std::cout << std::boolalpha << vault::over_limit(amount) << \'\\n\';',
        '    return 0;',
        '}',
      ],
      distractors: ['#define kLimit 100', '    int amount{250.0};', '    std::cout << std::boolalpha << over_limit(amount) << \'\\n\';'],
      explanation: 'A macro has no type or scope; brace initialisation refuses the narrowing from 250.0; and a function inside a namespace must be called with its prefix (or brought in with `using`).',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it prints `3 1250`: a compile-time constant, a deduced type and a visible conversion.',
      language: 'cpp',
      template: '#include <iostream>\n{{ce}} int kRate = 3;\nint main() {\n    int count{0};\n    double price = 12.5;\n    {{au}} cents = {{cast}}<int>(price * 100);\n    std::cout << count + kRate << \' \' << cents << \'\\n\';\n    return 0;\n}',
      blanks: [
        { id: 'ce', answers: ['constexpr'], hint: 'the typed replacement for #define' },
        { id: 'au', answers: ['auto', 'int'], hint: 'let the compiler deduce it' },
        { id: 'cast', answers: ['static_cast'], hint: 'the searchable conversion' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Modernise the program: replace the `#define` with `constexpr`, the C cast with `static_cast`, drop `using namespace std;`, and make the result print as `Full: true` / `Full: false` instead of 1/0.',
      language: 'cpp',
      starter: r`#include <iostream>
#define MAX_RECORDS 3
using namespace std;

bool is_full(int count) {
    return count >= MAX_RECORDS;
}

int main() {
    double typed = 0;
    cout << "Count?\n";
    cin >> typed;
    int count = (int)typed;
    cout << "Full: " << is_full(count) << '\n';
    return 0;
}
`,
      tests: [
        { description: 'over the limit', stdin: '5', expectedStdout: 'Count?\nFull: true' },
        { description: 'under the limit', stdin: '2', expectedStdout: 'Count?\nFull: false' },
        { description: 'exactly the limit', stdin: '3', expectedStdout: 'Count?\nFull: true' },
      ],
      hint: 'std::boolalpha goes into the stream before the bool. Once `using namespace std;` is gone, every cout and cin needs its std:: prefix.',
      solution: r`#include <iostream>

constexpr int kMaxRecords = 3;

bool is_full(int count) {
    return count >= kMaxRecords;
}

int main() {
    double typed = 0;
    std::cout << "Count?\n";
    std::cin >> typed;
    int count = static_cast<int>(typed);
    std::cout << "Full: " << std::boolalpha << is_full(count) << '\n';
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write a constant `kFee` of 2 and a namespace `vault` containing `bool can_pay(int balance, int amount)` that is true when the balance covers the amount plus the fee. In main ask `Balance?` and `Amount?` (ints). Print `Can pay: true`/`false` with std::boolalpha, then `Remaining: <balance - amount - kFee>`.',
      language: 'cpp',
      tests: [
        { description: 'plenty', stdin: '100\n50', expectedStdout: 'Balance?\nAmount?\nCan pay: true\nRemaining: 48' },
        { description: 'short by the fee', stdin: '10\n9', expectedStdout: 'Balance?\nAmount?\nCan pay: false\nRemaining: -1' },
        { description: 'exactly enough', stdin: '11\n9', expectedStdout: 'Balance?\nAmount?\nCan pay: true\nRemaining: 0' },
      ],
      hint: 'Use `auto remaining = balance - amount - kFee;` and call the function as `vault::can_pay(balance, amount)`.',
      solution: r`#include <iostream>

constexpr int kFee = 2;

namespace vault {
    bool can_pay(int balance, int amount) {
        return balance >= amount + kFee;
    }
}

int main() {
    int balance{0};
    int amount{0};
    std::cout << "Balance?\n";
    std::cin >> balance;
    std::cout << "Amount?\n";
    std::cin >> amount;
    auto remaining = balance - amount - kFee;
    std::cout << "Can pay: " << std::boolalpha << vault::can_pay(balance, amount) << '\n';
    std::cout << "Remaining: " << remaining << '\n';
    return 0;
}
`,
      projectNote: 'Vault++ constants and helpers now use constexpr and a namespace instead of macros and globals.',
    },
  ],
};

const l15: Lesson = {
  id: 'cpp-1-5',
  title: 'Project: Vault++ v0.1',
  objective: 'Translate the C Vault\'s opening into C++ with std::getline, std::cin and std::cout.',
  minutes: 15,
  lexicon: [
    { id: 'cpp.1.prompt-read', term: 'std::cout << "X?\\n"; std::cin >> x;', kind: 'pattern', meaning: 'The prompt-then-read pair used throughout Vault++. The prompt ends its own line so output is predictable; the read follows on the next statement. Use std::getline instead of >> when the answer may contain spaces.', example: 'std::cout << "Records?\\n";\nstd::cin >> records;' },
    { id: 'cpp.1.main-return', term: 'return 0; in main', kind: 'concept', meaning: 'In C++ main is special: if control reaches its closing brace without a return, the program returns 0. Vault++ keeps the explicit return 0; so the code reads the same as its C ancestor.', example: 'int main() {\n    std::cout << "ok\\n";\n}   // returns 0' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The plan for v0.1',
      body: `Vault++ v0.1 is the C Vault's opening, line for line, in C++. The owner's name is a **full line**, so it is read with \`std::getline\`; the record count is an int, read with \`>>\`. Because the line is read **before** the number, there is no leftover-newline trap to work around.

Read the labels: they are the plan. In the create step you will write the program from a blank file.`,
      example: {
        language: 'cpp',
        source: r`#include <iostream>
#include <string>

int main() {
    std::string name;
    int records = 0;
    std::cout << "Name?\n";
    std::getline(std::cin, name);
    std::cout << "Records?\n";
    std::cin >> records;
    std::cout << "Vault++ for " << name << '\n';
    std::cout << "Records: " << records << '\n';
    return 0;
}`,
        labels: [
          { lines: [1, 2], label: 'Streams and strings.' },
          { lines: [5, 6], label: 'An empty string and a zeroed int.' },
          { lines: [7, 8], label: 'Ask for the name, read the whole line.' },
          { lines: [9, 10], label: 'Ask for the count, read one int.' },
          { lines: [11, 12], label: 'Report. The string and the int format themselves.' },
          { lines: [13, 13], label: 'Optional in C++ main, kept for readability.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'The C version needed `char name[64]`, `fgets`, a loop or `strcspn` to strip the newline, `scanf("%d", &records)` and two printf format strings. Nothing here can overflow a buffer or mismatch a specifier.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Someone wrote `std::cin >> name;` instead of std::getline. The user types `Sam Lee` and Enter, then `3` and Enter. What is printed after the two prompts?',
      code: {
        language: 'cpp',
        source: r`#include <iostream>
#include <string>
int main() {
    std::string name;
    int records = 0;
    std::cout << "Name?\n";
    std::cin >> name;
    std::cout << "Records?\n";
    std::cin >> records;
    std::cout << "Vault++ for " << name << '\n';
    std::cout << "Records: " << records << '\n';
    return 0;
}`,
      },
      choices: ['Vault++ for Sam\nRecords: 0', 'Vault++ for Sam Lee\nRecords: 3', 'Vault++ for Sam\nRecords: 3', 'the program crashes'],
      answer: 'Vault++ for Sam\nRecords: 0',
      explanation: '`>>` reads one word, so name is `Sam` and `Lee` stays in the input. The next `>>` tries to read an int and finds `Lee`: the read fails, records is set to 0, and the stream goes into a failed state. No crash, just wrong data. A full-line name needs std::getline.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble Vault++ v0.1.',
      language: 'cpp',
      indentation: false,
      solution: [
        '#include <iostream>',
        '#include <string>',
        'int main() {',
        '    std::string name;',
        '    int records = 0;',
        '    std::cout << "Name?\\n";',
        '    std::getline(std::cin, name);',
        '    std::cout << "Records?\\n";',
        '    std::cin >> records;',
        '    std::cout << "Vault++ for " << name << \'\\n\';',
        '    std::cout << "Records: " << records << \'\\n\';',
        '    return 0;',
        '}',
      ],
      distractors: ['    std::getline(std::cin, records);', '    std::cin >> &records;', '    printf("Records: %d\\n", records);'],
      explanation: 'std::getline reads text into a std::string, not into an int; `>>` takes the box itself, never its address; and printf still exists in C++ but mixing it with std::cout is a habit this track leaves behind.',
    },
    {
      kind: 'create',
      prompt: 'Write Vault++ v0.1 from a blank file: ask `Name?` and read a full line; ask `Records?` and read an int; print `Vault++ for <name>` and `Records: <n>`.',
      language: 'cpp',
      tests: [
        { description: 'name with a space', stdin: 'Sam Lee\n3', expectedStdout: 'Name?\nRecords?\nVault++ for Sam Lee\nRecords: 3' },
        { description: 'one-word name, zero records', stdin: 'Ada\n0', expectedStdout: 'Name?\nRecords?\nVault++ for Ada\nRecords: 0' },
        { description: 'three-word name', stdin: 'Grace Brewster Hopper\n12', expectedStdout: 'Name?\nRecords?\nVault++ for Grace Brewster Hopper\nRecords: 12' },
      ],
      hint: 'Write the five labels from the concept step as comments first, then fill each one in. getline first, then >>.',
      solution: r`#include <iostream>
#include <string>

int main() {
    std::string name;
    int records = 0;
    std::cout << "Name?\n";
    std::getline(std::cin, name);
    std::cout << "Records?\n";
    std::cin >> records;
    std::cout << "Vault++ for " << name << '\n';
    std::cout << "Records: " << records << '\n';
    return 0;
}
`,
      projectNote: 'Vault++ v0.1 complete: the C Vault\'s opening, translated line by line.',
    },
  ],
};

export const m1: Module = {
  id: 'cpp-m1',
  title: 'From C to C++',
  goal: 'iostream, std::string, references, namespaces, the same compile step.',
  projectMilestone: 'Vault++ v0.1: the C program translated line by line.',
  status: 'available',
  lessons: [l11, l12, l13, l14, l15],
};
