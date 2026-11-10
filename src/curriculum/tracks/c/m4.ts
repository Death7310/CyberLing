import type { Lesson, Module } from '../../schema';

const l41: Lesson = {
  id: 'c-4-1',
  title: 'A row of boxes',
  objective: 'Declare a fixed-size array, index it from 0, compute its length and pass it to a function with its length.',
  minutes: 22,
  lexicon: [
    { id: 'c.4.array-decl', term: 'int a[5];', kind: 'pattern', meaning: 'Reserve a row of 5 int boxes, side by side in memory, under one name. The size is fixed when the program is compiled and can never change.', example: 'int amounts[5];\nchar initials[3];', analogy: 'A row of 5 numbered lockers bolted to the wall. Unlike a Python list, you cannot add a sixth locker later, and nothing stops you from walking past the end of the row.' },
    { id: 'c.4.index', term: 'a[i]', kind: 'operator', meaning: 'The box at position i, counting from 0. For int a[5] the valid positions are 0 to 4. C does not check i: a[5] silently reads or writes memory that is not yours (undefined behaviour).', example: 'amounts[0] = 100;\nprintf("%d\\n", amounts[4]);' },
    { id: 'c.4.array-init', term: 'int a[5] = {0};', kind: 'pattern', meaning: 'Fill the row at declaration. Listed values go in order; every box you did not list becomes 0. So {0} zeroes the whole array, and {3, 1} gives 3, 1, 0, 0, 0. Without an initialiser the boxes hold garbage.', example: 'int zeros[5] = {0};\nint a[4] = {3, 1, 4, 1};' },
    { id: 'c.4.sizeof-len', term: 'sizeof(a) / sizeof(a[0])', kind: 'pattern', meaning: 'The number of elements: the bytes of the whole array divided by the bytes of one element. Works only where a is the real array, not inside a function that received it.', example: 'int n = sizeof(a) / sizeof(a[0]);' },
    { id: 'c.4.array-param', term: 'void f(int a[], int n)', kind: 'pattern', meaning: 'An array passed to a function arrives as the address of its first box ("decays to a pointer"). The length is lost, so you pass it as a second parameter.', example: 'int total(const int a[], int n);\n...\ntotal(amounts, 5);', analogy: 'Handing someone the address of the first locker. They can walk along the row, but you must also tell them how many lockers there are.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Fixed size, no safety net',
      body: `In Python a list grows as you append. In C an **array** is a row of boxes whose size is fixed when you write it: \`int amounts[5];\` reserves exactly five ints, side by side. You reach a box with \`amounts[i]\`, counting from 0, so the last box of a five-box row is \`amounts[4]\`.

An initialiser fills the boxes in order and zeroes the rest: \`{0}\` gives an all-zero array. Without one, the boxes hold whatever was there before.

C checks **nothing** about the index. \`amounts[5]\` compiles and runs; it just touches memory that is not yours. That is undefined behaviour, and the compiler is allowed to assume you never do it.

The length does not travel with the array. At the place it was declared, \`sizeof(amounts) / sizeof(amounts[0])\` computes it. But when you pass an array to a function, the function receives only the address of the first box, so the length must be a separate parameter.`,
      example: {
        language: 'c',
        source: `#include <stdio.h>

int total(const int a[], int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum = sum + a[i];
    }
    return sum;
}

int main(void) {
    int amounts[5] = {100, -30, 50};
    int n = sizeof(amounts) / sizeof(amounts[0]);
    amounts[3] = 20;
    printf("Count: %d\\n", n);
    printf("First: %d Last: %d\\n", amounts[0], amounts[4]);
    printf("Total: %d\\n", total(amounts, n));
    return 0;
}`,
        labels: [
          { lines: [3, 3], label: 'Receive the first box\'s address plus the length, which does not travel on its own.' },
          { lines: [4, 8], label: 'Visit positions 0 to n-1 and accumulate.' },
          { lines: [12, 12], label: 'Five boxes; the two unlisted ones become 0.' },
          { lines: [13, 13], label: 'Compute the length where the real array lives.' },
          { lines: [14, 14], label: 'Write into one box by position.' },
          { lines: [16, 16], label: 'Position 4 is the last valid one in a row of 5.' },
          { lines: [17, 17], label: 'Pass the array and its length together.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'A Python list is one object that grows with append and knows its own len(). A C array is a fixed row of boxes that knows nothing about itself: no append, no len, and no IndexError. Where Python raises, C silently reads the neighbour\'s memory.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: { language: 'c', source: '#include <stdio.h>\nint main(void) {\n    int a[4] = {7, 2};\n    a[2] = a[0] + a[1];\n    int n = sizeof(a) / sizeof(a[0]);\n    printf("%d %d %d\\n", n, a[2], a[3]);\n    return 0;\n}' },
      choices: ['4 9 0', '16 9 0', '4 9 2', '3 9 0'],
      answer: '4 9 0',
      explanation: 'sizeof(a) is 16 bytes and sizeof(a[0]) is 4, so n is 4 elements. a[2] becomes 7 + 2. The initialiser listed two values, so the unlisted a[3] is 0, not garbage.',
    },
    {
      kind: 'predict',
      prompt: 'This program is compiled and run. Which statement is true?',
      code: { language: 'c', source: '#include <stdio.h>\nint main(void) {\n    int a[3] = {1, 2, 3};\n    printf("%d\\n", a[3]);\n    return 0;\n}' },
      choices: [
        'C does not check the index: it compiles, and the program reads whatever memory lies after the array (undefined behaviour).',
        'The compiler refuses to build it because 3 is out of range.',
        'It stops at run time with an IndexError-style message.',
        'It prints 3, because a[3] means the third element.',
      ],
      answer: 'C does not check the index: it compiles, and the program reads whatever memory lies after the array (undefined behaviour).',
      explanation: 'Valid positions of a 3-element array are 0, 1 and 2. C performs no bounds check at compile time or run time; a[3] reads the bytes after the array. It may print a random number, print 3 by luck, or crash. "It worked on my machine" proves nothing. Never write code like this; the runnable steps in this track always stay in bounds.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that declares `int a[4] = {3, 1, 4, 1};`, computes its length into `n`, and prints each element on its own line.',
      language: 'c',
      indentation: true,
      solution: ['#include <stdio.h>', 'int main(void) {', '    int a[4] = {3, 1, 4, 1};', '    int n = sizeof(a) / sizeof(a[0]);', '    for (int i = 0; i < n; i++) {', '        printf("%d\\n", a[i]);', '    }', '    return 0;', '}'],
      distractors: ['    int a[4] = [3, 1, 4, 1];', '    int n = sizeof(a);', '    for (int i = 0; i <= n; i++) {'],
      explanation: 'Initialisers use braces, not Python\'s square brackets. sizeof(a) alone is 16 bytes, not 4 elements. And i <= n would visit a[4], one past the end: the loop runs while i < n.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program prints `5 10 0`: five zeroed boxes, the first set to 10, and the last still 0.',
      language: 'c',
      template: '#include <stdio.h>\nint main(void) {\n    int a[5] = {{init}};\n    a[0] = 10;\n    int n = sizeof(a) / sizeof({{elem}});\n    printf("%d %d %d\\n", n, a[0], a{{last}});\n    return 0;\n}',
      blanks: [
        { id: 'init', answers: ['{0}', '{ 0 }'], hint: 'an initialiser that zeroes every box' },
        { id: 'elem', answers: ['a[0]'], hint: 'the size of one element' },
        { id: 'last', answers: ['[4]'], hint: 'five boxes: positions 0 to 4' },
      ],
      explanation: '{0} sets a[0] to 0 and the rest follow. Dividing by the size of one element turns bytes into a count. The last valid position is one less than the size.',
    },
    {
      kind: 'modify',
      prompt: 'This program does not even compile: `print_all` tries to compute the length with sizeof, but inside the function `a` is only an address. Make the length travel as a second parameter `int n`, compute it in `main`, and pass it in.',
      language: 'c',
      starter: `#include <stdio.h>

void print_all(const int a[]) {
    int n = sizeof(a) / sizeof(a[0]);
    for (int i = 0; i < n; i++) {
        printf("%d\\n", a[i]);
    }
    printf("Count: %d\\n", n);
}

int main(void) {
    int a[4] = {3, 1, 4, 1};
    print_all(a);
    return 0;
}
`,
      tests: [{ description: 'All four elements then the count', expectedStdout: '3\n1\n4\n1\nCount: 4' }],
      hint: 'Read the compiler message: it says sizeof on an array parameter gives the size of a pointer. Change the prototype to `void print_all(const int a[], int n)` and compute n in main, where the real array is.',
      solution: `#include <stdio.h>

void print_all(const int a[], int n) {
    for (int i = 0; i < n; i++) {
        printf("%d\\n", a[i]);
    }
    printf("Count: %d\\n", n);
}

int main(void) {
    int a[4] = {3, 1, 4, 1};
    int n = sizeof(a) / sizeof(a[0]);
    print_all(a, n);
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'From a blank file: declare `int amounts[6] = {100, -30, 50, -20, 0, 75};`. Write `int total(const int a[], int n)` that returns the sum. In `main`, compute the length with sizeof and print `Records: 6` and `Total: 175`.',
      language: 'c',
      tests: [{ description: 'Count and total', expectedStdout: 'Records: 6\nTotal: 175' }],
      hint: 'Prototype first, then main, as in Module 3. The length is computed in main and passed to total.',
      solution: `#include <stdio.h>

int total(const int a[], int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum = sum + a[i];
    }
    return sum;
}

int main(void) {
    int amounts[6] = {100, -30, 50, -20, 0, 75};
    int n = sizeof(amounts) / sizeof(amounts[0]);
    printf("Records: %d\\n", n);
    printf("Total: %d\\n", total(amounts, n));
    return 0;
}
`,
      projectNote: 'Toward Vault v0.4: amounts now live in an array instead of a single running total.',
    },
  ],
};

const l42: Lesson = {
  id: 'c-4-2',
  title: 'Walking the row',
  objective: 'Use the sum, max, count and find patterns over arrays, and keep two parallel arrays in step.',
  minutes: 20,
  lexicon: [
    { id: 'c.4.sum-pattern', term: 'sum += a[i]', kind: 'pattern', meaning: 'The accumulator pattern: start a total at 0, then add each element inside a for loop over 0..n-1. The same shape, with a different starting value and update, gives counts and products.', example: 'int sum = 0;\nfor (int i = 0; i < n; i++) {\n    sum += a[i];\n}' },
    { id: 'c.4.max-pattern', term: 'max = a[0]; ... if (a[i] > max)', kind: 'pattern', meaning: 'Find the largest element: start max as the FIRST element, then loop from 1 and replace max whenever a bigger element appears. Starting from 0 is a bug when every element is negative.', example: 'int max = a[0];\nfor (int i = 1; i < n; i++) {\n    if (a[i] > max) {\n        max = a[i];\n    }\n}' },
    { id: 'c.4.find-index', term: 'return i; ... return -1;', kind: 'pattern', meaning: 'A search function returns the position of the first match and -1 when the loop finishes without one. -1 is safe as "not found" because no valid position is negative.', example: 'int find(const int a[], int n, int target) {\n    for (int i = 0; i < n; i++) {\n        if (a[i] == target) {\n            return i;\n        }\n    }\n    return -1;\n}' },
    { id: 'c.4.parallel-arrays', term: 'parallel arrays', kind: 'concept', meaning: 'Two or more arrays where position i in each describes the same record: ids[2] and amounts[2] belong together. One count governs all of them; a found index in one array is used in the others.', example: 'int ids[3] = {7, 8, 9};\nint amounts[3] = {100, -30, 50};\nprintf("%d: %d\\n", ids[1], amounts[1]);', analogy: 'Two columns of a table written on separate sheets. The analogy breaks when you remove a row: C will not move the other sheet\'s rows for you.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Four loops you will write a hundred times',
      body: `Python gave you \`sum\`, \`max\`, \`count\` and \`in\` for free. In C you write the loop yourself, and four shapes cover almost everything:

- **sum**: start at 0, add each element.
- **count**: start at 0, add 1 when a condition holds.
- **max**: start with the **first** element, loop from position 1, replace when bigger.
- **find**: loop until a match, \`return i\`; after the loop, \`return -1\`.

A record often has several fields of different types. Until the next module, we keep them in **parallel arrays**: \`ids[i]\` and \`amounts[i]\` describe the same record, and one \`count\` says how many positions are in use. \`find\` returns an index into one array that is valid for all of them.`,
      example: {
        language: 'c',
        source: `#include <stdio.h>

int find(const int a[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (a[i] == target) {
            return i;
        }
    }
    return -1;
}

int main(void) {
    int ids[4] = {7, 8, 9, 10};
    int amounts[4] = {100, -30, 50, -5};
    int n = 4;
    int sum = 0;
    int max = amounts[0];
    for (int i = 0; i < n; i++) {
        sum += amounts[i];
        if (amounts[i] > max) {
            max = amounts[i];
        }
    }
    printf("Total: %d Max: %d\\n", sum, max);
    int where = find(ids, n, 9);
    if (where >= 0) {
        printf("%d: %d\\n", ids[where], amounts[where]);
    } else {
        printf("Not found\\n");
    }
    return 0;
}`,
        labels: [
          { lines: [3, 10], label: 'Search: return the first matching position, or -1 once the loop has run out.' },
          { lines: [13, 15], label: 'Parallel arrays: position i in ids and amounts is one record; n counts both.' },
          { lines: [16, 17], label: 'Start sum at 0 and max at the first element, not at 0.' },
          { lines: [18, 23], label: 'One pass does both: accumulate and replace the max when bigger.' },
          { lines: [25, 25], label: 'Find the record by id; where is an index or -1.' },
          { lines: [26, 30], label: 'Use the same index in the other array.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'sum(xs), max(xs), xs.count(x) and xs.index(x) are all explicit loops in C. Python\'s index() raises ValueError when the item is missing; the C convention is to return -1 and let the caller test for it. Python tuples let you keep name and amount together; C needs parallel arrays until structs arrive in Module 5.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: { language: 'c', source: '#include <stdio.h>\nint main(void) {\n    int a[4] = {-5, -2, -9, -1};\n    int max = 0;\n    for (int i = 0; i < 4; i++) {\n        if (a[i] > max) {\n            max = a[i];\n        }\n    }\n    printf("%d\\n", max);\n    return 0;\n}' },
      choices: ['0', '-1', '-9', '-5'],
      answer: '0',
      explanation: 'No element is greater than 0, so max is never replaced and the program reports a value that is not even in the array. The max pattern must start with a[0] and loop from 1.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program with `int find(const int a[], int n, int target)` that returns the index of the first match or -1, and a main that prints the result of searching for 9 in `{7, 8, 9}`.',
      language: 'c',
      indentation: true,
      solution: ['#include <stdio.h>', 'int find(const int a[], int n, int target) {', '    for (int i = 0; i < n; i++) {', '        if (a[i] == target) {', '            return i;', '        }', '    }', '    return -1;', '}', 'int main(void) {', '    int ids[3] = {7, 8, 9};', '    printf("%d\\n", find(ids, 3, 9));', '    return 0;', '}'],
      distractors: ['        if (a[i] = target) {', '            return a[i];', '    for (int i = 1; i < n; i++) {'],
      explanation: 'A single = assigns instead of comparing. A find returns the position i, not the value a[i], so the caller can use it in the parallel arrays. The search must start at position 0.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the count pattern so the program prints `Negative: 2`.',
      language: 'c',
      template: '#include <stdio.h>\nint main(void) {\n    int amounts[5] = {100, -30, 50, -20, 0};\n    int count = {{init}};\n    for (int i = 0; i < 5; i++) {\n        if ({{cond}}) {\n            {{inc}};\n        }\n    }\n    printf("Negative: %d\\n", count);\n    return 0;\n}',
      blanks: [
        { id: 'init', answers: ['0'] },
        { id: 'cond', answers: ['amounts[i] < 0', 'amounts[i]<0', '0 > amounts[i]'], hint: 'the current element is below zero' },
        { id: 'inc', answers: ['count++', 'count += 1', 'count = count + 1', '++count'] },
      ],
      explanation: 'Count is sum with a condition: start at 0 and add 1 only for the elements that qualify.',
    },
    {
      kind: 'modify',
      prompt: 'The program reads five amounts and prints their total. Add the max pattern so it also prints `Max: <largest>` on the next line. One test has only negative amounts, so start max from the first element.',
      language: 'c',
      starter: `#include <stdio.h>

int main(void) {
    int amounts[5];
    printf("Amounts?\\n");
    for (int i = 0; i < 5; i++) {
        if (scanf("%d", &amounts[i]) != 1) {
            return 1;
        }
    }
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum += amounts[i];
    }
    printf("Total: %d\\n", sum);
    return 0;
}
`,
      tests: [
        { description: 'Mixed amounts', stdin: '100\n-30\n50\n-20\n0', expectedStdout: 'Amounts?\nTotal: 100\nMax: 100' },
        { description: 'All negative', stdin: '-5\n-2\n-9\n-1\n-7', expectedStdout: 'Amounts?\nTotal: -24\nMax: -1' },
      ],
      hint: '`int max = amounts[0];` before the loop, then compare inside it. Starting from 0 passes the first test and fails the second.',
      solution: `#include <stdio.h>

int main(void) {
    int amounts[5];
    printf("Amounts?\\n");
    for (int i = 0; i < 5; i++) {
        if (scanf("%d", &amounts[i]) != 1) {
            return 1;
        }
    }
    int sum = 0;
    int max = amounts[0];
    for (int i = 0; i < 5; i++) {
        sum += amounts[i];
        if (amounts[i] > max) {
            max = amounts[i];
        }
    }
    printf("Total: %d\\n", sum);
    printf("Max: %d\\n", max);
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Two parallel arrays describe four records: `int ids[4] = {7, 8, 9, 10};` and `int amounts[4] = {100, -30, 50, -5};`. Print `Id?`, read an int, and use a `find` function (index or -1) to print `<id>: <amount>` or `Not found`.',
      language: 'c',
      tests: [
        { description: 'Middle record', stdin: '9', expectedStdout: 'Id?\n9: 50' },
        { description: 'First record', stdin: '7', expectedStdout: 'Id?\n7: 100' },
        { description: 'Last record', stdin: '10', expectedStdout: 'Id?\n10: -5' },
        { description: 'Missing id', stdin: '42', expectedStdout: 'Id?\nNot found' },
      ],
      hint: 'find searches ids; the index it returns is the right position in amounts too. Test `where >= 0` before indexing.',
      solution: `#include <stdio.h>

int find(const int a[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (a[i] == target) {
            return i;
        }
    }
    return -1;
}

int main(void) {
    int ids[4] = {7, 8, 9, 10};
    int amounts[4] = {100, -30, 50, -5};
    int wanted = 0;
    printf("Id?\\n");
    if (scanf("%d", &wanted) != 1) {
        return 1;
    }
    int where = find(ids, 4, wanted);
    if (where >= 0) {
        printf("%d: %d\\n", ids[where], amounts[where]);
    } else {
        printf("Not found\\n");
    }
    return 0;
}
`,
      projectNote: 'Toward Vault v0.4: the find command, built on an index shared by parallel arrays.',
    },
  ],
};

const l43: Lesson = {
  id: 'c-4-3',
  title: 'Letters in a row, ending in zero',
  objective: 'Store a word in a char array, read it safely with a width, and tell the terminator from the box size.',
  minutes: 22,
  lexicon: [
    { id: 'c.4.char-array', term: 'char s[32] = "rent";', kind: 'pattern', meaning: 'A string in C is an array of chars. This reserves 32 boxes and fills the first five: r, e, n, t and the terminator. The box must have room for the text plus one.', example: 'char name[32] = "rent";\nname[0] = \'R\';', analogy: 'A strip of 32 squares on which you write a word, one letter per square, and then a stop mark. The analogy breaks because the word can be rewritten in place, which a Python str never allows.' },
    { id: 'c.4.nul', term: '\'\\0\'', kind: 'concept', meaning: 'The null terminator: the char with value 0 that marks where a string ends. Every string function reads forward until it finds one. A char array without a terminator is not a string, and %s or strlen will run past its end.', example: 'char s[4] = "abc";   /* s[3] is \'\\0\' */\ns[1] = \'\\0\';         /* now s is "a" */' },
    { id: 'c.4.scanf-word', term: 'scanf("%31s", s)', kind: 'builtin', meaning: 'Read one word (no spaces) into the char array s, at most 31 characters, then add the terminator. The width must be one less than the array size. No & is needed: an array name already is the address of its first box.', example: 'char name[32];\nscanf("%31s", name);' },
    { id: 'c.4.percent-s', term: 'printf("%s", s)', kind: 'pattern', meaning: 'Print the chars of s up to, but not including, the terminator.', example: 'printf("Name: %s\\n", name);' },
    { id: 'c.4.strlen', term: 'strlen(s)', kind: 'builtin', meaning: 'From <string.h>: the number of chars before the terminator. It is NOT the array size; sizeof(s) is. strlen returns a size_t, cast to (int) to print it with %d.', example: '#include <string.h>\nprintf("%d\\n", (int)strlen(name));' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A string is a char array with a stop mark',
      body: `C has no string type. A string is a **char array** whose text ends with the **null terminator** \`'\\0'\`, a char whose value is 0. \`char name[32] = "rent";\` reserves 32 boxes and fills five: the four letters and the terminator. The other 27 boxes are spare room.

Two sizes matter and they are different: \`sizeof(name)\` is the box, 32; \`strlen(name)\` (from \`<string.h>\`) counts chars up to the terminator, 4.

To read a word, write \`scanf("%31s", name)\`. No \`&\`: the array name is already the address of its first box. The **width 31** is the array size minus one, so the longest input that fits still leaves room for the terminator. Without the width, a 40-letter word would be written past the end of the box.

Text in quotes inside your code, like \`"rent"\`, is a **string literal**. It is read-only: you may copy from it into an array but never write into it.`,
      example: {
        language: 'c',
        source: `#include <stdio.h>
#include <string.h>

int main(void) {
    char name[32];
    printf("Name?\\n");
    if (scanf("%31s", name) != 1) {
        return 1;
    }
    printf("Hello, %s\\n", name);
    printf("Letters: %d\\n", (int)strlen(name));
    printf("Box: %d\\n", (int)sizeof(name));
    name[1] = '\\0';
    printf("Cut: %s\\n", name);
    return 0;
}`,
        labels: [
          { lines: [2, 2], label: 'Make strlen known.' },
          { lines: [5, 5], label: 'Room for 31 letters plus the terminator.' },
          { lines: [6, 9], label: 'Ask, then read one word: width 31, no &. Stop if nothing could be read.' },
          { lines: [10, 10], label: '%s prints up to the terminator.' },
          { lines: [11, 12], label: 'Two different numbers: letters typed versus boxes reserved.' },
          { lines: [13, 14], label: 'Moving the terminator shortens the string in place.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'A Python str is immutable and knows its own length; C text is a mutable char array that knows nothing, so the terminator is the only way to find the end. input() reads a whole line; scanf("%31s") reads one word and stops at a space. len(s) becomes strlen(s), and there is no separate "size of the box" in Python at all.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: { language: 'c', source: '#include <stdio.h>\n#include <string.h>\nint main(void) {\n    char s[8] = "rent";\n    printf("%d %d\\n", (int)strlen(s), (int)sizeof(s));\n    return 0;\n}' },
      choices: ['4 8', '4 4', '5 8', '8 8'],
      answer: '4 8',
      explanation: 'strlen counts chars before the terminator: 4. sizeof is the size of the box regardless of what is in it: 8. The terminator itself is in the box but is not counted by strlen.',
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: { language: 'c', source: '#include <stdio.h>\nint main(void) {\n    char s[8] = "salary";\n    s[3] = \'\\0\';\n    printf("%s\\n", s);\n    return 0;\n}' },
      choices: ['sal', 'salary', 'sal ry', 'an error'],
      answer: 'sal',
      explanation: 'printf("%s") prints chars until it meets a terminator. Putting one at position 3 ends the string there; the letters after it are still in the box but no longer part of the string.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that prints `Word?`, reads one word into a 32-char array, and prints `Hello, <word>`.',
      language: 'c',
      indentation: true,
      solution: ['#include <stdio.h>', 'int main(void) {', '    char word[32];', '    printf("Word?\\n");', '    if (scanf("%31s", word) != 1) {', '        return 1;', '    }', '    printf("Hello, %s\\n", word);', '    return 0;', '}'],
      distractors: ['    if (scanf("%31s", &word) != 1) {', '    if (scanf("%s", word) != 1) {', '    printf("Hello, %d\\n", word);'],
      explanation: 'An array name is already an address, so & is wrong here (the compiler warns about the type). Without the width, a long word overflows the box. %s prints a string; %d would print an address as a number.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program reads a word of at most 15 letters into a 16-char array, prints it, then prints only its first two letters.',
      language: 'c',
      template: '#include <stdio.h>\nint main(void) {\n    char word[16];\n    printf("Word?\\n");\n    if (scanf("%{{width}}s", word) != 1) {\n        return 1;\n    }\n    printf("%{{spec}}\\n", word);\n    word[2] = {{nul}};\n    printf("%s\\n", word);\n    return 0;\n}',
      blanks: [
        { id: 'width', answers: ['15'], hint: 'array size minus one for the terminator' },
        { id: 'spec', answers: ['s'] },
        { id: 'nul', answers: ['\'\\0\'', '0'], hint: 'the terminator char' },
      ],
      explanation: 'Width 15 leaves the 16th box for the terminator. Writing a terminator at position 2 makes the string two letters long, whatever was typed.',
    },
    {
      kind: 'modify',
      prompt: 'The program greets the user. Make it also print `Initial: <first letter>` and `Length: <letters>` on the following lines. One test types a 35-letter word: the width must keep it at 31.',
      language: 'c',
      starter: `#include <stdio.h>
#include <string.h>

int main(void) {
    char name[32];
    printf("Name?\\n");
    if (scanf("%31s", name) != 1) {
        return 1;
    }
    printf("Hello, %s\\n", name);
    return 0;
}
`,
      tests: [
        { description: 'Short word', stdin: 'rent', expectedStdout: 'Name?\nHello, rent\nInitial: r\nLength: 4' },
        { description: 'Word longer than the box is cut at 31', stdin: 'abcdefghijklmnopqrstuvwxyzabcdefghi', expectedStdout: 'Name?\nHello, abcdefghijklmnopqrstuvwxyzabcde\nInitial: a\nLength: 31' },
      ],
      hint: 'name[0] is a char: print it with %c. strlen gives a size_t; cast with (int) for %d.',
      solution: `#include <stdio.h>
#include <string.h>

int main(void) {
    char name[32];
    printf("Name?\\n");
    if (scanf("%31s", name) != 1) {
        return 1;
    }
    printf("Hello, %s\\n", name);
    printf("Initial: %c\\n", name[0]);
    printf("Length: %d\\n", (int)strlen(name));
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Print `First?` and read a word; print `Last?` and read another. Both arrays are 32 chars, read with width 31. Then print `Name: <first> <last>` and `Letters: <total letters of both>`.',
      language: 'c',
      tests: [
        { description: 'Two words', stdin: 'Sam\nVault', expectedStdout: 'First?\nLast?\nName: Sam Vault\nLetters: 8' },
        { description: 'Single letters', stdin: 'A\nB', expectedStdout: 'First?\nLast?\nName: A B\nLetters: 2' },
        { description: 'Long last name is cut at 31', stdin: 'Jo\nabcdefghijklmnopqrstuvwxyzabcdefghij', expectedStdout: 'First?\nLast?\nName: Jo abcdefghijklmnopqrstuvwxyzabcde\nLetters: 33' },
      ],
      hint: 'Two char arrays, two prompts, two scanf("%31s"). Add the two strlen results, cast to int.',
      solution: `#include <stdio.h>
#include <string.h>

int main(void) {
    char first[32];
    char last[32];
    printf("First?\\n");
    if (scanf("%31s", first) != 1) {
        return 1;
    }
    printf("Last?\\n");
    if (scanf("%31s", last) != 1) {
        return 1;
    }
    printf("Name: %s %s\\n", first, last);
    printf("Letters: %d\\n", (int)(strlen(first) + strlen(last)));
    return 0;
}
`,
      projectNote: 'Toward Vault v0.4: names are read as words into 32-char boxes, the exact shape the vault will store.',
    },
  ],
};

const l44: Lesson = {
  id: 'c-4-4',
  title: 'Comparing and copying words',
  objective: 'Compare strings with strcmp, copy them safely, and search an array of names.',
  minutes: 22,
  lexicon: [
    { id: 'c.4.strcmp', term: 'strcmp(a, b) == 0', kind: 'builtin', meaning: 'Compare two strings letter by letter. Returns 0 when they are equal, negative when a sorts before b, positive otherwise. a == b does not compare the text: it compares two addresses.', example: 'if (strcmp(name, "rent") == 0) {\n    printf("match\\n");\n}', analogy: 'Asking "are these two words spelled the same?" rather than "are these the same piece of paper?". The 0-means-equal convention is the part nobody guesses.' },
    { id: 'c.4.strcpy', term: 'strcpy(dest, src)', kind: 'builtin', meaning: 'Copy the chars of src, terminator included, into the array dest. Destination first, like assignment. It never checks that dest is big enough, so use it only when you know src fits.', example: 'char name[32];\nstrcpy(name, "rent");' },
    { id: 'c.4.strncpy', term: 'strncpy(dest, src, n)', kind: 'builtin', meaning: 'Copy at most n chars. Trap: if src has n or more chars, NO terminator is written, so always set dest[n] = \'\\0\' yourself with n one less than the array size.', example: 'strncpy(name, input, 31);\nname[31] = \'\\0\';' },
    { id: 'c.4.string-literal', term: '"rent" is read-only', kind: 'concept', meaning: 'A string literal lives in a read-only part of the program. Use it as a source for strcpy or strcmp; writing into it (strcpy("rent", x), or through a char * that points at it) is undefined behaviour. Declare pointers to literals as const char *.', example: 'const char *label = "rent";   /* fine: reading only */\nchar name[32] = "rent";       /* fine: a copy you own */' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Text is compared and copied by functions, not operators',
      body: `Because a string is an array, the operators you know do the wrong thing. \`a == b\` compares the **addresses** of two arrays, which are never equal for two different boxes. \`a = b\` does not compile at all. \`<string.h>\` supplies the functions instead:

- \`strcmp(a, b)\` returns **0 when the text is equal** (negative or positive otherwise, by alphabetical order). Always compare its result with 0.
- \`strcpy(dest, src)\` copies the text, terminator included, destination first. It trusts you that dest is big enough.
- \`strncpy(dest, src, n)\` copies at most n chars but **does not add the terminator** when src is n or longer. Set \`dest[n] = '\\0'\` yourself.

A row of names is a two-dimensional array: \`char names[100][32]\` is 100 rows of 32 chars, and \`names[i]\` is one string. A function receives it as \`char names[][32]\`; the row size stays in the type so the compiler can find row i.`,
      example: {
        language: 'c',
        source: `#include <stdio.h>
#include <string.h>

int find_by_name(char names[][32], int n, const char *target) {
    for (int i = 0; i < n; i++) {
        if (strcmp(names[i], target) == 0) {
            return i;
        }
    }
    return -1;
}

int main(void) {
    char names[3][32];
    strcpy(names[0], "rent");
    strcpy(names[1], "salary");
    strncpy(names[2], "food", 31);
    names[2][31] = '\\0';
    printf("%d\\n", find_by_name(names, 3, "salary"));
    printf("%d\\n", find_by_name(names, 3, "car"));
    return 0;
}`,
        labels: [
          { lines: [4, 4], label: 'Rows of 32 chars; the target is a read-only string we only compare against.' },
          { lines: [5, 10], label: 'The find pattern, with strcmp == 0 as the match test.' },
          { lines: [14, 14], label: 'Three empty rows of 32 boxes each.' },
          { lines: [15, 16], label: 'Copy literals that are known to fit.' },
          { lines: [17, 18], label: 'Bounded copy, then put the terminator yourself.' },
          { lines: [19, 20], label: 'Found at 1; not found gives -1.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python\'s == compares text and = rebinds a name; neither exists for C strings. strcmp(a, b) == 0 replaces a == b (note the reversed feel: 0 means equal), and strcpy replaces assignment. Python strings can never overflow; strcpy into a box that is too small is the most famous bug in C.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: { language: 'c', source: '#include <stdio.h>\nint same(const char *x, const char *y) {\n    return x == y;\n}\nint main(void) {\n    char a[8] = "rent";\n    char b[8] = "rent";\n    if (same(a, b)) {\n        printf("same\\n");\n    } else {\n        printf("different\\n");\n    }\n    return 0;\n}' },
      choices: ['different', 'same', 'rentrent', 'an error'],
      answer: 'different',
      explanation: 'x and y hold the addresses of two separate arrays, and == compares those addresses, not the letters inside. Two boxes are never at the same address, so the text is never looked at. Use strcmp(x, y) == 0.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program with `find_by_name` that returns the row whose text equals `target` (or -1), filling two rows with strcpy and searching for `salary`.',
      language: 'c',
      indentation: true,
      solution: ['#include <stdio.h>', '#include <string.h>', 'int find_by_name(char names[][32], int n, const char *target) {', '    for (int i = 0; i < n; i++) {', '        if (strcmp(names[i], target) == 0) {', '            return i;', '        }', '    }', '    return -1;', '}', 'int main(void) {', '    char names[2][32];', '    strcpy(names[0], "rent");', '    strcpy(names[1], "salary");', '    printf("%d\\n", find_by_name(names, 2, "salary"));', '    return 0;', '}'],
      distractors: ['        if (names[i] == target) {', '        if (strcmp(names[i], target)) {', '    strcpy("rent", names[0]);'],
      explanation: '== compares addresses. A bare strcmp(...) is true when the strings DIFFER, because 0 means equal. strcpy takes the destination first, and a literal can never be a destination.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program copies `rent` into `dest` and prints `match`.',
      language: 'c',
      template: '#include <stdio.h>\n#include <string.h>\nint main(void) {\n    char dest[32];\n    {{copy}}(dest, "rent");\n    if ({{cmp}}(dest, "rent") {{zero}}) {\n        printf("match\\n");\n    }\n    return 0;\n}',
      blanks: [
        { id: 'copy', answers: ['strcpy'], hint: 'copy text into an array, destination first' },
        { id: 'cmp', answers: ['strcmp'] },
        { id: 'zero', answers: ['== 0', '==0'], hint: 'what strcmp returns for equal strings' },
      ],
      explanation: 'strcpy fills dest with the literal\'s text and terminator; strcmp then finds no difference and returns 0.',
    },
    {
      kind: 'modify',
      prompt: 'The program reads a name and reports where it is in the list, but it always says `Not found`, even for `salary`. Find the comparison that compares addresses instead of text and fix it.',
      language: 'c',
      starter: `#include <stdio.h>
#include <string.h>

int find_by_name(char names[][32], int n, const char *target) {
    for (int i = 0; i < n; i++) {
        if (names[i] == target) {
            return i;
        }
    }
    return -1;
}

int main(void) {
    char names[3][32];
    strcpy(names[0], "rent");
    strcpy(names[1], "salary");
    strcpy(names[2], "food");
    char wanted[32];
    printf("Name?\\n");
    if (scanf("%31s", wanted) != 1) {
        return 1;
    }
    int where = find_by_name(names, 3, wanted);
    if (where >= 0) {
        printf("Found at %d\\n", where);
    } else {
        printf("Not found\\n");
    }
    return 0;
}
`,
      tests: [
        { description: 'Hit in the middle', stdin: 'salary', expectedStdout: 'Name?\nFound at 1' },
        { description: 'Hit on the last row', stdin: 'food', expectedStdout: 'Name?\nFound at 2' },
        { description: 'Miss', stdin: 'car', expectedStdout: 'Name?\nNot found' },
      ],
      hint: 'names[i] == target compiles because both sides are addresses, and they are never the same box. Compare the text with strcmp(...) == 0.',
      solution: `#include <stdio.h>
#include <string.h>

int find_by_name(char names[][32], int n, const char *target) {
    for (int i = 0; i < n; i++) {
        if (strcmp(names[i], target) == 0) {
            return i;
        }
    }
    return -1;
}

int main(void) {
    char names[3][32];
    strcpy(names[0], "rent");
    strcpy(names[1], "salary");
    strcpy(names[2], "food");
    char wanted[32];
    printf("Name?\\n");
    if (scanf("%31s", wanted) != 1) {
        return 1;
    }
    int where = find_by_name(names, 3, wanted);
    if (where >= 0) {
        printf("Found at %d\\n", where);
    } else {
        printf("Not found\\n");
    }
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Print `Count?` and read an int from 1 to 10. Then, for each record, print `Name?` and read a word into a row of `char names[10][32]`. Finally print `Find?`, read a word, and print `Found at <index>` or `Not found` using a `find_by_name` function built on strcmp.',
      language: 'c',
      tests: [
        { description: 'Three names, hit', stdin: '3\nrent\nsalary\nfood\nfood', expectedStdout: 'Count?\nName?\nName?\nName?\nFind?\nFound at 2' },
        { description: 'Three names, miss', stdin: '3\nrent\nsalary\nfood\ncar', expectedStdout: 'Count?\nName?\nName?\nName?\nFind?\nNot found' },
        { description: 'One name, hit on the first row', stdin: '1\nrent\nrent', expectedStdout: 'Count?\nName?\nFind?\nFound at 0' },
        { description: 'Prefix is not a match', stdin: '2\nrent\nrental\nren', expectedStdout: 'Count?\nName?\nName?\nFind?\nNot found' },
      ],
      hint: 'The names are read with scanf("%31s", names[i]) straight into row i, so no copying is needed. The search target needs its own 32-char array.',
      solution: `#include <stdio.h>
#include <string.h>

int find_by_name(char names[][32], int n, const char *target) {
    for (int i = 0; i < n; i++) {
        if (strcmp(names[i], target) == 0) {
            return i;
        }
    }
    return -1;
}

int main(void) {
    char names[10][32];
    int count = 0;
    printf("Count?\\n");
    if (scanf("%d", &count) != 1 || count < 1 || count > 10) {
        return 1;
    }
    for (int i = 0; i < count; i++) {
        printf("Name?\\n");
        if (scanf("%31s", names[i]) != 1) {
            return 1;
        }
    }
    char wanted[32];
    printf("Find?\\n");
    if (scanf("%31s", wanted) != 1) {
        return 1;
    }
    int where = find_by_name(names, count, wanted);
    if (where >= 0) {
        printf("Found at %d\\n", where);
    } else {
        printf("Not found\\n");
    }
    return 0;
}
`,
      projectNote: 'Toward Vault v0.4: find_by_name over a names table is the heart of the find command.',
    },
  ],
};

const fullStdin = Array.from({ length: 101 }, (_, i) => (i < 100 ? `1\nn${i}\n${i}` : '1')).join('\n') + '\n2\n3';
const fullExpected = Array.from({ length: 101 }, (_, i) => (i < 100 ? 'Command?\nName?\nAmount?\nAdded' : 'Command?\nVault full')).join('\n')
  + '\nCommand?\n' + Array.from({ length: 100 }, (_, i) => `n${i}: ${i}`).join('\n') + '\nRecords: 100\nTotal: 4950\nCommand?\nBye';

const l45: Lesson = {
  id: 'c-4-5',
  title: 'Project: Vault v0.4',
  objective: 'Build the vault as parallel arrays of names and amounts with add, list, find and a capacity check.',
  minutes: 24,
  lexicon: [
    { id: 'c.4.define', term: '#define MAX 100', kind: 'pattern', meaning: 'A named constant replaced by the preprocessor before compiling. Use it for an array size and every check against that size, so changing the capacity is a one-line edit.', example: '#define MAX 100\nint amounts[MAX];\nif (count >= MAX) { ... }', analogy: 'A find-and-replace that runs before the compiler reads your file. The analogy is exact, which is also its danger: #define knows nothing about types or scope.' },
    { id: 'c.4.names-table', term: 'char names[100][32]', kind: 'pattern', meaning: 'A table of 100 strings, each in a 32-char row. names[i] is the i-th string and can be passed anywhere a char array is expected, including scanf("%31s", names[i]).', example: 'char names[MAX][32];\nscanf("%31s", names[count]);' },
    { id: 'c.4.capacity', term: 'if (count >= MAX)', kind: 'pattern', meaning: 'The guard before storing into a fixed array: when count already equals the capacity, position count is past the end, so refuse instead of writing. Check BEFORE asking for the data.', example: 'if (count >= MAX) {\n    printf("Vault full\\n");\n    return;\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The whole plan',
      body: `Vault v0.4 stores records with a name. Two parallel arrays hold them, \`char names[MAX][32]\` and \`int amounts[MAX]\`, with one \`count\` saying how many rows are in use. \`#define MAX 100\` names the capacity once.

The command loop keeps the v0.3 shape: \`Command?\` is printed, an int is read, and a \`switch\` dispatches. The commands:

- **1 add**: if \`count >= MAX\`, print \`Vault full\` and do nothing else. Otherwise \`Name?\`, read a word into \`names[count]\`; \`Amount?\`, read an int into \`amounts[count]\`; increment count; print \`Added\`.
- **2 list**: one line \`<name>: <amount>\` per record in insertion order, then \`Records: <n>\` and \`Total: <t>\`.
- **4 find**: \`Name?\`, read a word, \`find_by_name\`; print \`<name>: <amount>\` or \`Not found\`.
- **3 quit**: print \`Bye\` and stop. Anything else: \`Unknown command\`.

Below is the add command and the reader it uses. Note that arrays need no \`&\` and no pointer parameter: a row of \`names\` already arrives as an address, so the function can write into the caller's table. \`count\` is a plain int, so it still travels as \`int *\`.`,
      example: {
        language: 'c',
        source: `#define MAX 100

void read_word(const char *prompt, char *buf) {
    printf("%s\\n", prompt);
    if (scanf("%31s", buf) != 1) {
        buf[0] = '\\0';
    }
}

void add(char names[][32], int amounts[], int *count) {
    if (*count >= MAX) {
        printf("Vault full\\n");
        return;
    }
    read_word("Name?", names[*count]);
    amounts[*count] = read_int("Amount?");
    (*count)++;
    printf("Added\\n");
}`,
        labels: [
          { lines: [1, 1], label: 'The capacity, named once.' },
          { lines: [3, 8], label: 'Prompt on its own line, then read one word of at most 31 chars into the caller\'s row; an empty string if input ended.' },
          { lines: [11, 14], label: 'Guard first: a full vault refuses before asking anything.' },
          { lines: [15, 16], label: 'Row *count of both parallel arrays receives the new record.' },
          { lines: [17, 18], label: 'Only then does the count grow; parentheses because ++ binds tighter than *.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Ledger v0.4 used a list of tuples that grew with append and a dict for lookup. Here the storage is two fixed arrays and a count, the lookup is a loop with strcmp, and "full" is a real state you must handle: there is no append past 100.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'MAX is 3 and three records have already been added, so `count` is 3. The user now enters command 1. What is printed?',
      code: { language: 'c', source: 'void add(char names[][32], int amounts[], int *count) {\n    if (*count >= MAX) {\n        printf("Vault full\\n");\n        return;\n    }\n    read_word("Name?", names[*count]);\n    amounts[*count] = read_int("Amount?");\n    (*count)++;\n    printf("Added\\n");\n}' },
      choices: ['Vault full', 'Name?\nAmount?\nAdded', 'Name?\nAmount?\nVault full', 'nothing, the program crashes'],
      answer: 'Vault full',
      explanation: 'With count equal to MAX, names[3] would be past the end of a 3-row table. The guard runs before any prompt and returns at once, so the user is never asked for a name.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the `find` command: read a name, search with `find_by_name`, and print `<name>: <amount>` or `Not found`.',
      language: 'c',
      indentation: true,
      solution: ['void find(char names[][32], const int amounts[], int count) {', '    char target[32];', '    read_word("Name?", target);', '    int i = find_by_name(names, count, target);', '    if (i < 0) {', '        printf("Not found\\n");', '    } else {', '        printf("%s: %d\\n", names[i], amounts[i]);', '    }', '}'],
      distractors: ['    read_word("Name?", &target);', '    int i = find_by_name(names, MAX, target);', '    if (i == 0) {'],
      explanation: 'target is an array, so it is already an address. The search must stop at count, not MAX: rows past count hold garbage. And 0 is a valid position (the first record); only -1 means not found.',
    },
    {
      kind: 'create',
      prompt: 'Build Vault v0.4 as described in the plan: `#define MAX 100`, parallel arrays `char names[MAX][32]` and `int amounts[MAX]`, a `read_int` helper that prints its prompt and reads an int, a `read_word` helper, `find_by_name`, and the commands 1 add (with `Vault full`), 2 list, 4 find, 3 quit, else `Unknown command`.',
      language: 'c',
      tests: [
        { description: 'Add two, list, quit', stdin: '1\nrent\n-800\n1\nsalary\n2500\n2\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nrent: -800\nsalary: 2500\nRecords: 2\nTotal: 1700\nCommand?\nBye' },
        { description: 'Find hit', stdin: '1\nrent\n-800\n1\nsalary\n2500\n4\nsalary\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nName?\nsalary: 2500\nCommand?\nBye' },
        { description: 'Find miss', stdin: '1\nrent\n-800\n4\ncar\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nNot found\nCommand?\nBye' },
        { description: 'Empty list and unknown command', stdin: '2\n9\n3', expectedStdout: 'Command?\nRecords: 0\nTotal: 0\nCommand?\nUnknown command\nCommand?\nBye' },
        { description: 'Vault full after 100 records', stdin: fullStdin, expectedStdout: fullExpected },
      ],
      hint: 'Start from v0.3: a switch inside the command loop. Write add, list and find as functions taking the arrays and the count. list and find take count by value; only add changes it.',
      solution: `#include <stdio.h>
#include <string.h>

#define MAX 100

int read_int(const char *prompt) {
    int value = 0;
    printf("%s\\n", prompt);
    if (scanf("%d", &value) != 1) {
        return 0;
    }
    return value;
}

void read_word(const char *prompt, char *buf) {
    printf("%s\\n", prompt);
    if (scanf("%31s", buf) != 1) {
        buf[0] = '\\0';
    }
}

int read_command(void) {
    int command = 0;
    printf("Command?\\n");
    if (scanf("%d", &command) != 1) {
        return 3;
    }
    return command;
}

int find_by_name(char names[][32], int count, const char *target) {
    for (int i = 0; i < count; i++) {
        if (strcmp(names[i], target) == 0) {
            return i;
        }
    }
    return -1;
}

void add(char names[][32], int amounts[], int *count) {
    if (*count >= MAX) {
        printf("Vault full\\n");
        return;
    }
    read_word("Name?", names[*count]);
    amounts[*count] = read_int("Amount?");
    (*count)++;
    printf("Added\\n");
}

void list(char names[][32], const int amounts[], int count) {
    int total = 0;
    for (int i = 0; i < count; i++) {
        printf("%s: %d\\n", names[i], amounts[i]);
        total += amounts[i];
    }
    printf("Records: %d\\n", count);
    printf("Total: %d\\n", total);
}

void find(char names[][32], const int amounts[], int count) {
    char target[32];
    read_word("Name?", target);
    int i = find_by_name(names, count, target);
    if (i < 0) {
        printf("Not found\\n");
    } else {
        printf("%s: %d\\n", names[i], amounts[i]);
    }
}

int main(void) {
    char names[MAX][32];
    int amounts[MAX];
    int count = 0;
    int command = read_command();
    while (command != 3) {
        switch (command) {
            case 1:
                add(names, amounts, &count);
                break;
            case 2:
                list(names, amounts, count);
                break;
            case 4:
                find(names, amounts, count);
                break;
            default:
                printf("Unknown command\\n");
                break;
        }
        command = read_command();
    }
    printf("Bye\\n");
    return 0;
}
`,
      projectNote: 'Vault v0.4: records have names, stored in parallel arrays capped at 100, with a find command. Module 5 replaces the parallel arrays with one struct per record.',
    },
  ],
};

export const m4: Module = {
  id: 'c-m4',
  title: 'Arrays and strings',
  goal: 'Fixed arrays, bounds, char arrays, the null terminator, the string.h functions and their traps.',
  projectMilestone: 'Vault v0.4: records with names stored in arrays.',
  status: 'available',
  lessons: [l41, l42, l43, l44, l45],
};
