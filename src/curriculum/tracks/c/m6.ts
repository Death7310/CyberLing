import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 6: Pointers and memory                                      */
/* ------------------------------------------------------------------ */

/** C source written verbatim: backslashes stay (so `"\n"` inside printf survives), leading newline dropped. */
const c = (s: TemplateStringsArray) => s.raw.join('').replace(/^\n/, '');

/* ------------------------------------------------------------------ */
/* 6-1 Addresses and pointers                                         */
/* ------------------------------------------------------------------ */

const l61: Lesson = {
  id: 'c-6-1',
  title: 'Addresses and pointers',
  objective: 'Take the address of a variable, store it in a pointer, and read or write the box through it.',
  minutes: 22,
  lexicon: [
    { id: 'c.6.address-of', term: '&x', kind: 'operator', meaning: 'The address of the box named x: the number that says where in memory the box starts. You met it in scanf; here it stands alone.', example: 'int x = 5;\nprintf("%p\\n", (void *)&x);', analogy: 'A house number. It breaks here: an address in C changes from run to run, so you never write one down by hand.' },
    { id: 'c.6.pointer-decl', term: 'int *p = &x;', kind: 'pattern', meaning: 'Declare a pointer: a box whose contents are the address of an int box. The * belongs to the type: "p is a pointer to int".', example: 'int x = 5;\nint *p = &x;' },
    { id: 'c.6.deref', term: '*p', kind: 'operator', meaning: 'Follow the arrow: the box that p points at. On the right of = it reads that box; on the left it writes it.', example: '*p = 7;        /* x is now 7 */\nprintf("%d\\n", *p);', analogy: '"The house at this address": reading the sign on the door, or painting the door. It breaks here: following a wrong address does not knock politely, it reads or scribbles over whatever is there.' },
    { id: 'c.6.null', term: 'NULL', kind: 'builtin', meaning: 'The address that points at nothing. Give a pointer NULL when it has no target yet, and test for it before following the arrow.', example: 'int *p = NULL;\nif (p != NULL) {\n    printf("%d\\n", *p);\n}' },
    { id: 'c.6.percent-p', term: '%p', kind: 'pattern', meaning: 'The printf specifier for an address. Cast the pointer to (void *). Addresses differ on every run, so you print them to explore, never to compare in a test.', example: 'printf("%p\\n", (void *)p);' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A pointer is a box that holds an address',
      body: `Picture memory as a long street of numbered boxes. \`int x = 5;\` reserves a four-byte box, say at address 1000, and writes 5 into it. \`&x\` is that number, 1000.

A **pointer** is another box whose contents are an address. \`int *p = &x;\` reserves a box \`p\` (say at 1008) and writes 1000 into it. In a diagram you draw an arrow from the box \`p\` to the box \`x\`. The \`*\` in the declaration means "p is a pointer to an int".

\`*p\` means **follow the arrow**. Reading \`*p\` reads the box at address 1000, so it gives 5. Writing \`*p = 7;\` writes 7 into that same box, so \`x\` becomes 7 even though the statement never names \`x\`. The pointer itself has not changed: it still holds 1000.

A pointer with no target holds \`NULL\`. Following a NULL arrow is a crash, so you test for it first. Addresses change from run to run, which is why \`%p\` is for exploring, not for tests.`,
      example: {
        language: 'c',
        source: c`
#include <stdio.h>

int main(void) {
    int x = 5;
    int *p = &x;
    printf("x is %d\n", x);
    *p = 7;
    printf("x is %d, *p is %d\n", x, *p);
    int *q = NULL;
    if (q == NULL) {
        printf("q points at nothing\n");
    }
    return 0;
}`,
        labels: [
          { lines: [4, 4], label: 'An int box holding 5. Draw a box labelled x.' },
          { lines: [5, 5], label: 'A pointer box holding the address of x. Draw an arrow from p to x.' },
          { lines: [6, 6], label: 'Read x directly: 5.' },
          { lines: [7, 7], label: 'Follow the arrow and write 7 into the box it reaches. x changes; p does not.' },
          { lines: [8, 8], label: 'Both names now reach the same box, so both say 7.' },
          { lines: [9, 11], label: 'A pointer with no target. Test it before ever writing *q.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'In Python every name is already a reference, and you cannot see or choose an address. In C a plain variable IS the box; a pointer is a second, separate box that holds the first one\'s address, and you follow it on purpose with *. Python has None for "no object"; C has NULL for "no address", and following it is a crash, not an exception.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Draw the boxes. What is printed?',
      code: {
        language: 'c',
        source: c`
#include <stdio.h>
int main(void) {
    int a = 3;
    int b = 3;
    int *p = &a;
    *p = 5;
    printf("%d %d\n", a, b);
    return 0;
}`,
      },
      choices: ['5 3', '5 5', '3 3', '3 5'],
      answer: '5 3',
      explanation: 'p holds the address of a, so `*p = 5` writes into the box a. The box b is a different box that happens to hold the same value; nothing points at it, so it stays 3.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that declares `x` as 10, points `p` at it, adds 1 to `x` through the pointer, and prints `x`.',
      language: 'c',
      indentation: false,
      solution: ['#include <stdio.h>', 'int main(void) {', '    int x = 10;', '    int *p = &x;', '    *p = *p + 1;', '    printf("%d\\n", x);', '    return 0;', '}'],
      distractors: ['    int *p = x;', '    p = p + 1;', '    printf("%d\\n", p);'],
      explanation: '`int *p = x;` would store the value 10 as if it were an address (the compiler refuses). `p = p + 1` moves the arrow instead of changing the box it reaches. Printing `p` with %d prints an address, not x.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so that it prints `100` by changing `balance` only through the pointer.',
      language: 'c',
      template: c`
#include <stdio.h>
int main(void) {
    int balance = 50;
    int {{star}}p = {{amp}}balance;
    *p = 100;
    printf("%d\n", {{val}});
    return 0;
}`,
      blanks: [
        { id: 'star', answers: ['*'], hint: 'the mark that makes p a pointer rather than an int' },
        { id: 'amp', answers: ['&'], hint: 'the address of the box, as in scanf' },
        { id: 'val', answers: ['balance', '*p'], hint: 'either name reaches the same box' },
      ],
      explanation: 'After `*p = 100;` the box called balance holds 100, so printing `balance` or `*p` gives the same answer.',
    },
    {
      kind: 'modify',
      prompt: 'This `swap` is meant to exchange the two boxes the caller passed, but it only shuffles its own copies of the two addresses. Fix the body so the caller\'s boxes are swapped. Expected for `3` and `7`: `x=7 y=3`.',
      language: 'c',
      starter: c`
#include <stdio.h>

void swap(int *a, int *b) {
    int *tmp = a;
    a = b;
    b = tmp;
}

int main(void) {
    int x;
    int y;
    printf("X?\n");
    if (scanf("%d", &x) != 1) return 0;
    printf("Y?\n");
    if (scanf("%d", &y) != 1) return 0;
    swap(&x, &y);
    printf("x=%d y=%d\n", x, y);
    return 0;
}
`,
      tests: [
        { description: '3 and 7', stdin: '3\n7', expectedStdout: 'X?\nY?\nx=7 y=3' },
        { description: 'negative and zero', stdin: '-1\n0', expectedStdout: 'X?\nY?\nx=0 y=-1' },
      ],
      hint: 'Draw it: a and b are local boxes holding addresses. Swapping their contents changes nothing in main. You need to swap the values at the ends of the arrows: `int tmp = *a;` then write through *a and *b.',
      solution: c`
#include <stdio.h>

void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void) {
    int x;
    int y;
    printf("X?\n");
    if (scanf("%d", &x) != 1) return 0;
    printf("Y?\n");
    if (scanf("%d", &y) != 1) return 0;
    swap(&x, &y);
    printf("x=%d y=%d\n", x, y);
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Print `A?` and read an int `a`; print `B?` and read an int `b`. Declare one pointer `p`, point it at `a`, and re-point it at `b` if `b` is larger (ties keep `a`). Add 100 to whichever box `p` reaches, using only `*p`. Then print `a: <a>` and `b: <b>` on two lines.',
      language: 'c',
      tests: [
        { description: 'b is larger', stdin: '3\n8', expectedStdout: 'A?\nB?\na: 3\nb: 108' },
        { description: 'a is larger', stdin: '9\n2', expectedStdout: 'A?\nB?\na: 109\nb: 2' },
        { description: 'a tie goes to a', stdin: '4\n4', expectedStdout: 'A?\nB?\na: 104\nb: 4' },
      ],
      hint: 'Re-pointing is `p = &b;` (no star: you change the arrow). Adding through the pointer is `*p = *p + 100;` (star: you change the box at the end of the arrow).',
      solution: c`
#include <stdio.h>

int main(void) {
    int a;
    int b;
    printf("A?\n");
    if (scanf("%d", &a) != 1) return 0;
    printf("B?\n");
    if (scanf("%d", &b) != 1) return 0;
    int *p = &a;
    if (b > a) {
        p = &b;
    }
    *p = *p + 100;
    printf("a: %d\n", a);
    printf("b: %d\n", b);
    return 0;
}
`,
      projectNote: 'Vault v0.5 is unchanged in behaviour, but you now hold the model that v0.6 is built on: a pointer is a box with an address in it, and * follows the arrow.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 6-2 Pointers and arrays                                            */
/* ------------------------------------------------------------------ */

const l62: Lesson = {
  id: 'c-6-2',
  title: 'Pointers and arrays',
  objective: 'Walk an array with a pointer and pass arrays to functions as a pointer plus a length.',
  minutes: 22,
  lexicon: [
    { id: 'c.6.decay', term: 'array name as pointer', kind: 'concept', meaning: 'Used in an expression, an array name becomes the address of its first box. `a` and `&a[0]` are the same address, which is why `int *p = a;` compiles.', example: 'int a[4] = {1, 2, 3, 4};\nint *p = a;      /* points at a[0] */' },
    { id: 'c.6.subscript-identity', term: 'a[i] is *(a + i)', kind: 'concept', meaning: 'Indexing is pointer arithmetic in disguise: start at the first box, move i boxes along, follow the arrow. Both spellings read or write the same box.', example: 'a[2] = 30;\nprintf("%d\\n", *(a + 2));   /* 30 */' },
    { id: 'c.6.pointer-arith', term: 'p + i, p++', kind: 'operator', meaning: 'Move a pointer by whole boxes, not bytes: p + 1 on an int pointer is 4 bytes further on. The compiler knows the box size from the pointer type.', example: 'for (const int *p = xs; p < xs + n; p++) {\n    total += *p;\n}', analogy: 'Stepping along a row of lockers: "two lockers down" means two lockers, however wide a locker is. It breaks here: nothing stops you stepping past the last locker, and the wall behind it is someone else\'s memory.' },
    { id: 'c.6.pointer-length', term: 'f(const int *xs, int n)', kind: 'pattern', meaning: 'A function receives an array as the address of its first box, and the address does not know how many boxes follow. Pass the length alongside it, always.', example: 'int sum(const int *xs, int n);\n...\nsum(values, 5);' },
    { id: 'c.6.const-pointer', term: 'const int *p', kind: 'keyword', meaning: 'A pointer through which the boxes may be read but not written. Put const on every parameter the function only reads; the compiler then catches an accidental write.', example: 'void show(const int *xs, int n);   /* promises not to change xs[i] */' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'An array is a row of boxes; its name is the address of the first',
      body: `\`int a[4]\` reserves four int boxes side by side: if \`a[0]\` is at 1000, then \`a[1]\` is at 1004, \`a[2]\` at 1008, \`a[3]\` at 1012. In an expression, the name \`a\` becomes the address 1000, so \`int *p = a;\` draws an arrow from \`p\` to the first box.

Pointer arithmetic moves in **boxes, not bytes**: \`p + 2\` is 1008, because the compiler knows an int is four bytes wide. \`a[2]\` is just shorthand for \`*(a + 2)\`: start at the first box, step two boxes along, follow the arrow. \`p++\` moves the arrow one box to the right.

That is also why a function that receives an array gets only an address. The address does not know how long the row is, so you pass the **length as a second parameter** and loop up to it. If the function only reads the boxes, declare the parameter \`const\` so the compiler stops any accidental write.

C never checks that an index is inside the row. Stepping past the last box reads or scribbles on whatever lies beyond; the loop bound is the only guard.`,
      example: {
        language: 'c',
        source: c`
#include <stdio.h>

int sum(const int *xs, int n) {
    int total = 0;
    for (const int *p = xs; p < xs + n; p++) {
        total += *p;
    }
    return total;
}

int main(void) {
    int a[4] = {10, 20, 30, 40};
    int *p = a;
    printf("%d %d\n", a[2], *(a + 2));
    p = p + 1;
    printf("%d %d\n", *p, p[1]);
    printf("Sum: %d\n", sum(a, 4));
    return 0;
}`,
        labels: [
          { lines: [3, 3], label: 'Receive the address of the first box, read-only, plus how many boxes follow.' },
          { lines: [5, 7], label: 'Walk the row: start at the first box, stop at the address just past the last, add the box under the arrow each time.' },
          { lines: [12, 13], label: 'Four boxes in a row; p points at the first one.' },
          { lines: [14, 14], label: 'Two spellings of the third box: 30 30.' },
          { lines: [15, 16], label: 'Move the arrow one box right; now *p is 20 and p[1] is the box after it, 30.' },
          { lines: [17, 17], label: 'Pass the row as pointer + length: 100.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'A Python list knows its own length (len(a)) and raises IndexError at the edge. A C array passed to a function is just an address: no length, no check. The idiom `for x in xs:` becomes a pointer or index that you stop yourself at xs + n.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Draw the row and the arrow. What is printed?',
      code: {
        language: 'c',
        source: c`
#include <stdio.h>
int main(void) {
    int a[3] = {5, 6, 7};
    int *p = a;
    p = p + 1;
    printf("%d %d\n", *p, p[1]);
    return 0;
}`,
      },
      choices: ['6 7', '5 6', '6 6', '5 7'],
      answer: '6 7',
      explanation: 'p starts at a[0]. `p + 1` moves it one whole int to a[1], so `*p` is 6. `p[1]` means `*(p + 1)`, one box further on from where p now is: a[2], which is 7.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `sum`, which adds up `n` ints by walking them with a pointer. Set the indentation yourself (4 spaces per level).',
      language: 'c',
      indentation: true,
      solution: ['int sum(const int *xs, int n) {', '    int total = 0;', '    for (const int *p = xs; p < xs + n; p++) {', '        total += *p;', '    }', '    return total;', '}'],
      distractors: ['    for (const int *p = xs; p <= xs + n; p++) {', '        total += p;', 'int sum(const int *xs) {'],
      explanation: '`p <= xs + n` steps onto the box after the last one: out of bounds. `total += p` adds an address, not the number in the box; you need `*p`. And without `n` the function has no way to know where the row ends.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete `total` using pointer arithmetic instead of square brackets, and call it correctly for a row of four.',
      language: 'c',
      template: c`
int total(const int *xs, int n) {
    int t = 0;
    for (int i = 0; i < n; i++) {
        t += {{deref}}(xs {{plus}} i);
    }
    return t;
}

int main(void) {
    int a[4] = {1, 2, 3, 4};
    printf("%d\n", total(a, {{n}}));
    return 0;
}`,
      blanks: [
        { id: 'deref', answers: ['*'], hint: 'follow the arrow to the box' },
        { id: 'plus', answers: ['+'], hint: 'move i boxes along from the first' },
        { id: 'n', answers: ['4'], hint: 'how many boxes the row has; the function cannot find out by itself' },
      ],
      explanation: '`*(xs + i)` is exactly what `xs[i]` means. The length must come from the caller, who declared the array.',
    },
    {
      kind: 'modify',
      prompt: 'The program reads five values but `count_negative` only ever looks at the first three, because the length is hard-coded inside it. Give the function a second parameter `int n`, loop up to it, and pass `5` from main. Expected for five negative values: `Negatives: 5`.',
      language: 'c',
      starter: c`
#include <stdio.h>

int count_negative(const int *xs) {
    int k = 0;
    for (int i = 0; i < 3; i++) {
        if (xs[i] < 0) {
            k++;
        }
    }
    return k;
}

int main(void) {
    int values[5];
    for (int i = 0; i < 5; i++) {
        printf("Value?\n");
        if (scanf("%d", &values[i]) != 1) return 0;
    }
    printf("Negatives: %d\n", count_negative(values));
    return 0;
}
`,
      tests: [
        { description: 'all five negative', stdin: '-1\n-2\n-3\n-4\n-5', expectedStdout: 'Value?\nValue?\nValue?\nValue?\nValue?\nNegatives: 5' },
        { description: 'none negative', stdin: '1\n2\n3\n4\n5', expectedStdout: 'Value?\nValue?\nValue?\nValue?\nValue?\nNegatives: 0' },
        { description: 'negatives at the end', stdin: '1\n-1\n1\n-1\n-1', expectedStdout: 'Value?\nValue?\nValue?\nValue?\nValue?\nNegatives: 3' },
      ],
      hint: 'The function receives only an address; it cannot know there are five boxes. Change the signature to `(const int *xs, int n)`, use `n` in the loop, and call `count_negative(values, 5)`.',
      solution: c`
#include <stdio.h>

int count_negative(const int *xs, int n) {
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (xs[i] < 0) {
            k++;
        }
    }
    return k;
}

int main(void) {
    int values[5];
    for (int i = 0; i < 5; i++) {
        printf("Value?\n");
        if (scanf("%d", &values[i]) != 1) return 0;
    }
    printf("Negatives: %d\n", count_negative(values, 5));
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Print `Count?` and read `n` (1 to 100). Then read `n` values, printing `Value?` before each. Write `int sum(const int *xs, int n)` that walks the row with a pointer, and `int largest(const int *xs, int n)`. Print `Sum: <s>` and `Max: <m>`.',
      language: 'c',
      tests: [
        { description: 'three values', stdin: '3\n4\n-2\n9', expectedStdout: 'Count?\nValue?\nValue?\nValue?\nSum: 11\nMax: 9' },
        { description: 'a single negative value', stdin: '1\n-5', expectedStdout: 'Count?\nValue?\nSum: -5\nMax: -5' },
        { description: 'all zeros', stdin: '4\n0\n0\n0\n0', expectedStdout: 'Count?\nValue?\nValue?\nValue?\nValue?\nSum: 0\nMax: 0' },
      ],
      hint: 'Declare `int values[100];` and read into `&values[i]`. In `largest`, start `best` at `xs[0]`, not at 0: the row may be all negative.',
      solution: c`
#include <stdio.h>

int sum(const int *xs, int n) {
    int total = 0;
    for (const int *p = xs; p < xs + n; p++) {
        total += *p;
    }
    return total;
}

int largest(const int *xs, int n) {
    int best = xs[0];
    for (int i = 1; i < n; i++) {
        if (xs[i] > best) {
            best = xs[i];
        }
    }
    return best;
}

int main(void) {
    int values[100];
    int n;
    printf("Count?\n");
    if (scanf("%d", &n) != 1 || n < 1 || n > 100) return 0;
    for (int i = 0; i < n; i++) {
        printf("Value?\n");
        if (scanf("%d", &values[i]) != 1) return 0;
    }
    printf("Sum: %d\n", sum(values, n));
    printf("Max: %d\n", largest(values, n));
    return 0;
}
`,
      projectNote: 'The Vault\'s helper functions already take `struct Record *` plus a count. Now you know why: the pointer is the address of the first record, and the count is the only thing that says where the row ends.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 6-3 The heap                                                       */
/* ------------------------------------------------------------------ */

const l63: Lesson = {
  id: 'c-6-3',
  title: 'The heap',
  objective: 'Reserve memory with malloc, grow it with realloc, and give every byte back with free.',
  minutes: 24,
  lexicon: [
    { id: 'c.6.malloc', term: 'p = malloc(n * sizeof(*p))', kind: 'builtin', meaning: 'Reserve n boxes on the heap and return the address of the first, or NULL if memory ran out. The boxes hold garbage until you write them. Needs <stdlib.h>. Writing sizeof(*p) instead of sizeof(int) keeps the size right if p\'s type ever changes.', example: '#include <stdlib.h>\nint *xs = malloc(n * sizeof(*xs));\nif (xs == NULL) return 1;', analogy: 'Renting a storage unit: you get the address of a unit big enough for what you asked. It breaks here: the unit is not swept out for you, and nobody reminds you to hand the key back.' },
    { id: 'c.6.free', term: 'free(p)', kind: 'builtin', meaning: 'Give the boxes p points at back to the system. After it, p still holds the old address but the memory is no longer yours: do not read or write it, and do not free it twice. free(NULL) does nothing.', example: 'free(xs);\nxs = NULL;' },
    { id: 'c.6.realloc', term: 'realloc(p, bytes)', kind: 'builtin', meaning: 'Resize the block p points at, keeping its contents, possibly by moving it somewhere else. Returns the new address, or NULL on failure (the old block is then still valid). Always store the result in a temporary first, so a NULL does not lose the only pointer you had.', example: 'int *grown = realloc(xs, 2 * cap * sizeof(*xs));\nif (grown == NULL) { free(xs); return 1; }\nxs = grown;' },
    { id: 'c.6.ownership', term: 'ownership: who frees?', kind: 'concept', meaning: 'Every malloc has exactly one owner responsible for its free. When a function returns a malloc\'d pointer, the caller becomes the owner; when a struct holds one, the struct\'s free function frees it. Decide this when you write the code, not when it leaks.', example: '/* returns a heap string: the caller must free it */\nchar *copy_string(const char *s);' },
    { id: 'c.6.leak-uaf', term: 'leak / use-after-free', kind: 'concept', meaning: 'A leak is a block nobody frees: the program keeps growing and nothing warns you. A use-after-free is reading or writing a block after free: undefined behaviour that may seem to work. Tools such as valgrind and -fsanitize=address catch both.', example: 'gcc -g -fsanitize=address main.c && ./a.out\nvalgrind --leak-check=full ./a.out' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Boxes that outlive the function',
      body: `Local variables live in the function's **stack frame** and vanish when it returns, and an array's size must be known when you write the code. The **heap** is a second region of memory where you reserve boxes while the program runs, with \`malloc\`, and keep them until you say \`free\`.

\`int *xs = malloc(n * sizeof(*xs));\` asks for \`n\` int boxes and returns the address of the first. Draw a box \`xs\` in the frame with an arrow to a row of \`n\` boxes drawn far away, on the heap. The row has no name; the arrow is the only way to reach it. If memory runs out, malloc returns \`NULL\`, so you test the result before following it. The boxes hold garbage until you write them.

\`realloc(xs, more_bytes)\` grows the row, copying it elsewhere if the space after it is taken. The old arrow may then point at nothing, so always store what realloc returns.

Every malloc has an **owner** who must call \`free\` exactly once. A block nobody frees is a **leak**; a block used after free is undefined behaviour. The compiler does not warn about either; valgrind and sanitizers do.`,
      example: {
        language: 'c',
        source: c`
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n = 3;
    int *xs = malloc(n * sizeof(*xs));
    if (xs == NULL) {
        printf("Out of memory\n");
        return 1;
    }
    for (int i = 0; i < n; i++) {
        xs[i] = i * 10;
    }
    int *grown = realloc(xs, 2 * n * sizeof(*xs));
    if (grown == NULL) {
        free(xs);
        return 1;
    }
    xs = grown;
    xs[3] = 30;
    printf("%d %d\n", xs[0], xs[3]);
    free(xs);
    return 0;
}`,
        labels: [
          { lines: [2, 2], label: 'malloc, realloc and free live in stdlib.h.' },
          { lines: [6, 6], label: 'Reserve three int boxes on the heap; xs (a local pointer) holds the address of the first.' },
          { lines: [7, 10], label: 'malloc can fail. Never follow a NULL arrow.' },
          { lines: [11, 13], label: 'Fill the boxes: they held garbage until now.' },
          { lines: [14, 18], label: 'Ask for six boxes. The row may move; grown is its new address. On failure the old row is still ours, so free it before leaving.' },
          { lines: [19, 20], label: 'Only now replace the arrow, then use the fourth box, which exists at last.' },
          { lines: [21, 22], label: 'Print 0 30, then hand the whole row back. Exactly one free for one malloc.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python\'s list grows by itself and a garbage collector frees objects nobody references. In C you ask for the memory, you track its size, and you free it yourself. Forgetting is silent: no exception, no traceback, just a program that quietly eats memory or corrupts it.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'This compiles without a single warning. What happens at the last printf?',
      code: {
        language: 'c',
        source: c`
#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int *p = malloc(sizeof(*p));
    if (p == NULL) return 1;
    *p = 4;
    free(p);
    printf("%d\n", *p);
    return 0;
}`,
      },
      choices: [
        'Undefined behaviour: the box was given back, so it may print 4, print rubbish, or crash',
        'It prints 4: free only marks the memory as reusable, the value is still there',
        'It prints 0: free clears the memory',
        'A compile error: p was freed',
      ],
      answer: 'Undefined behaviour: the box was given back, so it may print 4, print rubbish, or crash',
      explanation: 'After `free(p)` the pointer still holds the old address, but the box belongs to the system again. Reading it is a use-after-free: undefined behaviour. It often prints 4 on a small test, which is exactly why it is dangerous. Set `p = NULL;` after free so a mistake becomes a crash you can find, and run under valgrind or -fsanitize=address.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the body of `main`: read `n`, reserve `n` ints on the heap, fill each with its index squared, print them one per line, and free the row. Set the indentation yourself.',
      language: 'c',
      indentation: true,
      solution: ['int n;', 'if (scanf("%d", &n) != 1 || n < 1) return 0;', 'int *xs = malloc(n * sizeof(*xs));', 'if (xs == NULL) return 1;', 'for (int i = 0; i < n; i++) {', '    xs[i] = i * i;', '    printf("%d\\n", xs[i]);', '}', 'free(xs);', 'return 0;'],
      distractors: ['int *xs = malloc(n);', 'if (xs = NULL) return 1;', 'free(xs[0]);'],
      explanation: '`malloc(n)` reserves n bytes, not n ints: a quarter of the boxes you need. `if (xs = NULL)` assigns NULL instead of comparing (one = too few). `free` takes the address malloc gave you, not the first value in the row.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the allocate-check-use-release pattern.',
      language: 'c',
      template: c`
int *xs = {{alloc}}(n * sizeof({{deref}}xs));
if (xs == {{null}}) {
    return 1;
}
for (int i = 0; i < n; i++) {
    xs[i] = 0;
}
{{release}}(xs);`,
      blanks: [
        { id: 'alloc', answers: ['malloc'] },
        { id: 'deref', answers: ['*'], hint: 'the size of one box that xs points at, whatever its type' },
        { id: 'null', answers: ['NULL'] },
        { id: 'release', answers: ['free'] },
      ],
      explanation: '`sizeof(*xs)` is the size of one element of whatever xs points at; if xs later becomes a `double *`, the malloc stays correct.',
    },
    {
      kind: 'modify',
      prompt: 'This program collects amounts until `0` into a heap row of four, and gives up with `Full` at the fifth. Replace the `Full` branch so the row **doubles its capacity with realloc** whenever it is full, so any number of amounts fits. Keep freeing the row at the end.',
      language: 'c',
      starter: c`
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int capacity = 4;
    int count = 0;
    int *xs = malloc(capacity * sizeof(*xs));
    if (xs == NULL) return 1;
    for (;;) {
        printf("Amount?\n");
        int amount;
        if (scanf("%d", &amount) != 1 || amount == 0) break;
        if (count == capacity) {
            printf("Full\n");
            break;
        }
        xs[count] = amount;
        count++;
    }
    int total = 0;
    for (int i = 0; i < count; i++) {
        total += xs[i];
    }
    printf("Count: %d\n", count);
    printf("Total: %d\n", total);
    free(xs);
    return 0;
}
`,
      tests: [
        { description: 'six amounts, past the first capacity', stdin: '1\n2\n3\n4\n5\n6\n0', expectedStdout: 'Amount?\nAmount?\nAmount?\nAmount?\nAmount?\nAmount?\nAmount?\nCount: 6\nTotal: 21' },
        { description: 'one amount', stdin: '5\n0', expectedStdout: 'Amount?\nAmount?\nCount: 1\nTotal: 5' },
        { description: 'nine amounts, two doublings', stdin: '1\n1\n1\n1\n1\n1\n1\n1\n1\n0', expectedStdout: 'Amount?\nAmount?\nAmount?\nAmount?\nAmount?\nAmount?\nAmount?\nAmount?\nAmount?\nAmount?\nCount: 9\nTotal: 9' },
      ],
      hint: 'Inside `if (count == capacity)`: `int *grown = realloc(xs, 2 * capacity * sizeof(*xs));`, check it for NULL (free xs and return 1 if so), then `xs = grown;` and `capacity = 2 * capacity;`. Then fall through to store the amount.',
      solution: c`
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int capacity = 4;
    int count = 0;
    int *xs = malloc(capacity * sizeof(*xs));
    if (xs == NULL) return 1;
    for (;;) {
        printf("Amount?\n");
        int amount;
        if (scanf("%d", &amount) != 1 || amount == 0) break;
        if (count == capacity) {
            int *grown = realloc(xs, 2 * capacity * sizeof(*xs));
            if (grown == NULL) {
                free(xs);
                return 1;
            }
            xs = grown;
            capacity = 2 * capacity;
        }
        xs[count] = amount;
        count++;
    }
    int total = 0;
    for (int i = 0; i < count; i++) {
        total += xs[i];
    }
    printf("Count: %d\n", count);
    printf("Total: %d\n", total);
    free(xs);
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Print `Count?` and read `n` (at least 1). Reserve exactly `n` ints on the heap. Read `n` values, printing `Value?` before each, into the row. Print `Reversed:` and then the values from last to first, one per line. Free the row before returning, on every path.',
      language: 'c',
      tests: [
        { description: 'three values', stdin: '3\n1\n2\n3', expectedStdout: 'Count?\nValue?\nValue?\nValue?\nReversed:\n3\n2\n1' },
        { description: 'one value', stdin: '1\n42', expectedStdout: 'Count?\nValue?\nReversed:\n42' },
        { description: 'five values with negatives', stdin: '5\n-1\n0\n7\n-3\n2', expectedStdout: 'Count?\nValue?\nValue?\nValue?\nValue?\nValue?\nReversed:\n2\n-3\n7\n0\n-1' },
      ],
      hint: 'There is no fixed `[100]` this time: `int *xs = malloc(n * sizeof(*xs));` after you know n. Read into `&xs[i]`. The reverse loop runs `i = n - 1` down to 0.',
      solution: c`
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n;
    printf("Count?\n");
    if (scanf("%d", &n) != 1 || n < 1) return 0;
    int *xs = malloc(n * sizeof(*xs));
    if (xs == NULL) {
        printf("Out of memory\n");
        return 1;
    }
    for (int i = 0; i < n; i++) {
        printf("Value?\n");
        if (scanf("%d", &xs[i]) != 1) {
            free(xs);
            return 0;
        }
    }
    printf("Reversed:\n");
    for (int i = n - 1; i >= 0; i--) {
        printf("%d\n", xs[i]);
    }
    free(xs);
    return 0;
}
`,
      projectNote: 'The Vault\'s fixed `[100]` is about to go. A heap row sized at run time, grown with realloc and freed once, is what replaces it.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 6-4 Growable arrays                                                */
/* ------------------------------------------------------------------ */

const l64: Lesson = {
  id: 'c-6-4',
  title: 'Growable arrays',
  objective: 'Build a struct that owns a heap array and grows it, removes from it, and frees it.',
  minutes: 24,
  lexicon: [
    { id: 'c.6.growable', term: 'struct { T *items; int count; int capacity; }', kind: 'pattern', meaning: 'The three fields of a growable array: the heap row, how many boxes are in use, how many are reserved. count never exceeds capacity.', example: 'typedef struct {\n    Record *items;\n    int count;\n    int capacity;\n} Vault;\nVault v = {NULL, 0, 0};' },
    { id: 'c.6.doubling', term: 'capacity doubling', kind: 'concept', meaning: 'When count reaches capacity, realloc to twice the capacity (4 on the very first push). Doubling means the copying cost is spread so thinly that each push is cheap on average.', example: 'int new_cap = v->capacity == 0 ? 4 : v->capacity * 2;' },
    { id: 'c.6.store-realloc', term: 'store what realloc returns', kind: 'pattern', meaning: 'realloc may move the row. Put its result in a temporary, test for NULL, and only then overwrite items and capacity. Never write items = realloc(items, ...): a NULL would lose the row you still own.', example: 'Record *grown = realloc(v->items, new_cap * sizeof(*grown));\nif (grown == NULL) return 0;\nv->items = grown;\nv->capacity = new_cap;' },
    { id: 'c.6.shift-tail', term: 'remove by shifting the tail', kind: 'pattern', meaning: 'To delete item i while keeping the order, copy each later item one box down (items[j] = items[j + 1] for j from i to count - 2), then decrement count. The capacity stays as it was.', example: 'for (int j = i; j < v->count - 1; j++) {\n    v->items[j] = v->items[j + 1];\n}\nv->count--;' },
    { id: 'c.6.heap-string', term: 'malloc(strlen(s) + 1) + strcpy', kind: 'pattern', meaning: 'A string on the heap: reserve one box per character plus one for the \\0, then copy. The caller owns it and must free it. (POSIX calls this strdup; it is not in standard C17.)', example: 'char *copy_string(const char *s) {\n    char *out = malloc(strlen(s) + 1);\n    if (out != NULL) strcpy(out, s);\n    return out;\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A struct that owns its row',
      body: `A growable array is three boxes that travel together: \`items\`, the address of a heap row; \`count\`, how many boxes are in use; and \`capacity\`, how many are reserved. Draw the \`Vault\` as a small box with three fields in main's frame, and an arrow from \`items\` out to a row of \`capacity\` boxes on the heap, the first \`count\` of them filled.

\`vault_push\` checks whether the row is full. If it is, it asks \`realloc\` for twice the capacity (4 on the first push). The row may move, so the new address is kept in a temporary, tested for NULL, and only then stored into \`items\`. Then the new record is copied into box \`count\`, and \`count\` goes up by one.

Removing while keeping the order means **shifting the tail**: every item after the hole moves one box down, then \`count\` drops. \`vault_free\` returns the row and resets the fields so the struct is safe to reuse.

The same two steps, malloc then copy, give you a **string on the heap**: \`malloc(strlen(s) + 1)\` for the characters plus the \`\\0\`, then \`strcpy\`. Whoever receives that pointer owns it and must free it.`,
      example: {
        language: 'c',
        source: c`
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct { char name[32]; int amount; } Record;
typedef struct { Record *items; int count; int capacity; } Vault;

int vault_push(Vault *v, Record r) {
    if (v->count == v->capacity) {
        int new_cap = v->capacity == 0 ? 4 : v->capacity * 2;
        Record *grown = realloc(v->items, new_cap * sizeof(*grown));
        if (grown == NULL) return 0;
        v->items = grown;
        v->capacity = new_cap;
    }
    v->items[v->count] = r;
    v->count++;
    return 1;
}

void vault_free(Vault *v) {
    free(v->items);
    v->items = NULL;
    v->count = 0;
    v->capacity = 0;
}

int main(void) {
    Vault v = {NULL, 0, 0};
    for (int i = 1; i <= 5; i++) {
        Record r = {"item", i * 10};
        if (!vault_push(&v, r)) { vault_free(&v); return 1; }
    }
    printf("%d of %d\n", v.count, v.capacity);
    printf("%s %d\n", v.items[4].name, v.items[4].amount);
    vault_free(&v);
    return 0;
}`,
        labels: [
          { lines: [5, 6], label: 'A record, and a vault: an arrow to a heap row of records plus two counters.' },
          { lines: [9, 10], label: 'Full? Decide the new capacity: 4 the first time, otherwise double.' },
          { lines: [11, 14], label: 'Grow (realloc on NULL behaves like malloc). Keep the result in grown; on failure the old row is untouched and still owned. Only then move the arrow and the counter.' },
          { lines: [16, 18], label: 'Copy the record into the first free box and count it. Report success.' },
          { lines: [21, 26], label: 'Return the row and reset the fields: the vault is empty again and safe to reuse.' },
          { lines: [29, 33], label: 'Start with no row at all. Five pushes: capacity 0 -> 4 -> 8. On failure, free before leaving.' },
          { lines: [34, 37], label: 'Prints 5 of 8, then item 50. One vault_free for all the pushes.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'This is what a Python list is underneath: a pointer to a block, a length, and a spare capacity that doubles. Python hides the three fields and frees the block for you. `del items[i]` is the shift-the-tail loop; `append` is vault_push.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Using `vault_push` from the example (capacity 0 becomes 4, then doubles), what is printed?',
      code: {
        language: 'c',
        source: c`
Vault v = {NULL, 0, 0};
for (int i = 0; i < 9; i++) {
    Record r = {"x", i};
    if (!vault_push(&v, r)) return 1;
}
printf("%d %d\n", v.count, v.capacity);
vault_free(&v);`,
      },
      choices: ['9 16', '9 9', '9 12', '9 8'],
      answer: '9 16',
      explanation: 'Push 1 grows 0 to 4. Push 5 finds count == capacity and grows to 8. Push 9 finds 8 == 8 and grows to 16. Nine records are in use; sixteen boxes are reserved. The capacity is a power of two times four, never equal to the count except by coincidence.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `vault_push`. Set the indentation yourself (4 spaces per level).',
      language: 'c',
      indentation: true,
      solution: [
        'int vault_push(Vault *v, Record r) {',
        '    if (v->count == v->capacity) {',
        '        int new_cap = v->capacity == 0 ? 4 : v->capacity * 2;',
        '        Record *grown = realloc(v->items, new_cap * sizeof(*grown));',
        '        if (grown == NULL) return 0;',
        '        v->items = grown;',
        '        v->capacity = new_cap;',
        '    }',
        '    v->items[v->count] = r;',
        '    v->count++;',
        '    return 1;',
        '}',
      ],
      distractors: ['    if (v->count > v->capacity) {', '        v->items = realloc(v->items, v->capacity * sizeof(*v->items));', '    v->items[v->count + 1] = r;'],
      explanation: '`>` lets count reach capacity and then writes one box past the end of the row. Reallocating to the same capacity grows nothing, and assigning straight into items loses the row if realloc returns NULL. The first free box is index count, not count + 1.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete `vault_remove` so that it deletes the first record with the given name, keeps the others in order, and returns 1 (or 0 when there is no such record).',
      language: 'c',
      template: c`
int vault_remove(Vault *v, const char *name) {
    for (int i = 0; i < v->count; i++) {
        if (strcmp(v->items[i].name, name) == 0) {
            for (int j = i; j < v->count {{minus}} 1; j++) {
                v->items[j] = v->items[j {{plus}} 1];
            }
            v->count{{dec}};
            return 1;
        }
    }
    return 0;
}`,
      blanks: [
        { id: 'minus', answers: ['-'], hint: 'the last box has nothing after it to copy from' },
        { id: 'plus', answers: ['+'], hint: 'each box takes the value of the box after it' },
        { id: 'dec', answers: ['--', '-= 1', ' -= 1'], hint: 'one fewer record in use' },
      ],
      explanation: 'j runs from the hole up to count - 2, so items[j + 1] is at most items[count - 1], the last box in use. Then count shrinks; the capacity stays.',
    },
    {
      kind: 'modify',
      prompt: 'This program reads records until the name `end`, removes one, and lists what is left. Its `vault_remove` fills the hole by copying the **last** record into it, which breaks the order. Rewrite it to **shift the tail down** so the remaining records keep their insertion order. Expected after adding rent, food, salary and removing rent: `food: -50` then `salary: 2500`.',
      language: 'c',
      starter: c`
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct { char name[32]; int amount; } Record;
typedef struct { Record *items; int count; int capacity; } Vault;

int vault_push(Vault *v, Record r) {
    if (v->count == v->capacity) {
        int new_cap = v->capacity == 0 ? 4 : v->capacity * 2;
        Record *grown = realloc(v->items, new_cap * sizeof(*grown));
        if (grown == NULL) return 0;
        v->items = grown;
        v->capacity = new_cap;
    }
    v->items[v->count] = r;
    v->count++;
    return 1;
}

int vault_remove(Vault *v, const char *name) {
    for (int i = 0; i < v->count; i++) {
        if (strcmp(v->items[i].name, name) == 0) {
            v->items[i] = v->items[v->count - 1];
            v->count--;
            return 1;
        }
    }
    return 0;
}

void vault_free(Vault *v) {
    free(v->items);
    v->items = NULL;
    v->count = 0;
    v->capacity = 0;
}

int main(void) {
    Vault v = {NULL, 0, 0};
    for (;;) {
        Record r;
        printf("Name?\n");
        if (scanf("%31s", r.name) != 1 || strcmp(r.name, "end") == 0) break;
        printf("Amount?\n");
        if (scanf("%d", &r.amount) != 1) break;
        if (!vault_push(&v, r)) {
            vault_free(&v);
            return 1;
        }
    }
    char target[32];
    printf("Remove?\n");
    if (scanf("%31s", target) == 1) {
        if (vault_remove(&v, target)) {
            printf("Removed\n");
        } else {
            printf("Not found\n");
        }
    }
    for (int i = 0; i < v.count; i++) {
        printf("%s: %d\n", v.items[i].name, v.items[i].amount);
    }
    printf("Records: %d\n", v.count);
    vault_free(&v);
    return 0;
}
`,
      tests: [
        { description: 'remove the first of three', stdin: 'rent\n-800\nfood\n-50\nsalary\n2500\nend\nrent', expectedStdout: 'Name?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nRemove?\nRemoved\nfood: -50\nsalary: 2500\nRecords: 2' },
        { description: 'remove a name that is not there', stdin: 'rent\n-800\nend\nfood', expectedStdout: 'Name?\nAmount?\nName?\nRemove?\nNot found\nrent: -800\nRecords: 1' },
        { description: 'remove the last of two', stdin: 'a\n1\nb\n2\nend\nb', expectedStdout: 'Name?\nAmount?\nName?\nAmount?\nName?\nRemove?\nRemoved\na: 1\nRecords: 1' },
        { description: 'remove the middle of five, past the first growth', stdin: 'a\n1\nb\n2\nc\n3\nd\n4\ne\n5\nend\nc', expectedStdout: 'Name?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nRemove?\nRemoved\na: 1\nb: 2\nd: 4\ne: 5\nRecords: 4' },
      ],
      hint: 'Replace the single copy with a loop: for j from i while j < count - 1, items[j] = items[j + 1]. Then count--.',
      solution: c`
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct { char name[32]; int amount; } Record;
typedef struct { Record *items; int count; int capacity; } Vault;

int vault_push(Vault *v, Record r) {
    if (v->count == v->capacity) {
        int new_cap = v->capacity == 0 ? 4 : v->capacity * 2;
        Record *grown = realloc(v->items, new_cap * sizeof(*grown));
        if (grown == NULL) return 0;
        v->items = grown;
        v->capacity = new_cap;
    }
    v->items[v->count] = r;
    v->count++;
    return 1;
}

int vault_remove(Vault *v, const char *name) {
    for (int i = 0; i < v->count; i++) {
        if (strcmp(v->items[i].name, name) == 0) {
            for (int j = i; j < v->count - 1; j++) {
                v->items[j] = v->items[j + 1];
            }
            v->count--;
            return 1;
        }
    }
    return 0;
}

void vault_free(Vault *v) {
    free(v->items);
    v->items = NULL;
    v->count = 0;
    v->capacity = 0;
}

int main(void) {
    Vault v = {NULL, 0, 0};
    for (;;) {
        Record r;
        printf("Name?\n");
        if (scanf("%31s", r.name) != 1 || strcmp(r.name, "end") == 0) break;
        printf("Amount?\n");
        if (scanf("%d", &r.amount) != 1) break;
        if (!vault_push(&v, r)) {
            vault_free(&v);
            return 1;
        }
    }
    char target[32];
    printf("Remove?\n");
    if (scanf("%31s", target) == 1) {
        if (vault_remove(&v, target)) {
            printf("Removed\n");
        } else {
            printf("Not found\n");
        }
    }
    for (int i = 0; i < v.count; i++) {
        printf("%s: %d\n", v.items[i].name, v.items[i].amount);
    }
    printf("Records: %d\n", v.count);
    vault_free(&v);
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Read records until the name `end`: print `Name?` and read a word; print `Amount?` and read an int. Push each into a `Vault` whose capacity starts at 0, becomes 4 on the first push, and doubles whenever it is full. Then print every record as `<name>: <amount>` in order, then `Records: <n>` and `Capacity: <c>`. Free everything.',
      language: 'c',
      tests: [
        { description: 'one record: capacity 4', stdin: 'rent\n-800\nend', expectedStdout: 'Name?\nAmount?\nName?\nrent: -800\nRecords: 1\nCapacity: 4' },
        { description: 'five records: one doubling', stdin: 'a\n1\nb\n2\nc\n3\nd\n4\ne\n5\nend', expectedStdout: 'Name?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\na: 1\nb: 2\nc: 3\nd: 4\ne: 5\nRecords: 5\nCapacity: 8' },
        { description: 'nine records: two doublings', stdin: 'a\n1\nb\n1\nc\n1\nd\n1\ne\n1\nf\n1\ng\n1\nh\n1\ni\n1\nend', expectedStdout: 'Name?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\na: 1\nb: 1\nc: 1\nd: 1\ne: 1\nf: 1\ng: 1\nh: 1\ni: 1\nRecords: 9\nCapacity: 16' },
        { description: 'no records at all', stdin: 'end', expectedStdout: 'Name?\nRecords: 0\nCapacity: 0' },
      ],
      hint: 'Reuse the Record and Vault typedefs, vault_push and vault_free from the example. `Vault v = {NULL, 0, 0};` is the empty vault; free(NULL) is harmless, so an empty vault frees cleanly too.',
      solution: c`
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct { char name[32]; int amount; } Record;
typedef struct { Record *items; int count; int capacity; } Vault;

int vault_push(Vault *v, Record r) {
    if (v->count == v->capacity) {
        int new_cap = v->capacity == 0 ? 4 : v->capacity * 2;
        Record *grown = realloc(v->items, new_cap * sizeof(*grown));
        if (grown == NULL) return 0;
        v->items = grown;
        v->capacity = new_cap;
    }
    v->items[v->count] = r;
    v->count++;
    return 1;
}

void vault_free(Vault *v) {
    free(v->items);
    v->items = NULL;
    v->count = 0;
    v->capacity = 0;
}

int main(void) {
    Vault v = {NULL, 0, 0};
    for (;;) {
        Record r;
        printf("Name?\n");
        if (scanf("%31s", r.name) != 1 || strcmp(r.name, "end") == 0) break;
        printf("Amount?\n");
        if (scanf("%d", &r.amount) != 1) break;
        if (!vault_push(&v, r)) {
            vault_free(&v);
            return 1;
        }
    }
    for (int i = 0; i < v.count; i++) {
        printf("%s: %d\n", v.items[i].name, v.items[i].amount);
    }
    printf("Records: %d\n", v.count);
    printf("Capacity: %d\n", v.capacity);
    vault_free(&v);
    return 0;
}
`,
      projectNote: 'The Vault struct, vault_push, vault_remove and vault_free are the engine of v0.6. The next lesson wires them to the command loop.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 6-5 Project: Vault v0.6                                            */
/* ------------------------------------------------------------------ */

const l65: Lesson = {
  id: 'c-6-5',
  title: 'Project: Vault v0.6',
  objective: 'Replace the fixed array with a growable heap vault and add a remove command, freeing everything on exit.',
  minutes: 26,
  lexicon: [
    { id: 'c.6.find-index', term: 'find returns an index or -1', kind: 'pattern', meaning: 'A search function returns the position of the match, or -1 for "none" since no valid index is negative. Both the show and the remove commands can then share it.', example: 'int i = vault_find(&v, name);\nif (i < 0) printf("Not found\\n");' },
    { id: 'c.6.free-on-exit', term: 'free on every exit path', kind: 'concept', meaning: 'Whatever way main ends (quit, end of input, failure), the vault\'s row must be freed exactly once. The habit: one cleanup line after the loop, and every early return before it either has nothing to free or frees first.', example: 'while (running) { ... }\nvault_free(&v);\nreturn 0;' },
    { id: 'c.6.valgrind', term: 'valgrind --leak-check=full ./main', kind: 'concept', meaning: 'Runs the program under a memory checker and reports every leaked block and every read or write of memory you do not own, with the line it happened on. On your own machine, run v0.6 under it; the goal is "All heap blocks were freed" and "0 errors".', example: 'gcc -g -Wall -Wextra main.c -o main\nvalgrind --leak-check=full ./main < input.txt' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'From a fixed row to an owned one',
      body: `Vault v0.5 keeps \`struct Record vault[100]\` in main's frame and refuses the 101st record. In v0.6 main holds a \`Vault\` whose \`items\` arrow points at a heap row that starts empty and doubles as needed, so \`Vault full\` disappears. A new command \`5\` removes a record by name, shifting the tail down so the order is kept.

Draw the diagram once more before coding: the \`Vault\` struct (three fields) in main's frame; one arrow from \`items\` to a row of \`capacity\` records on the heap; the helper functions receive \`&v\`, an arrow to the struct, and reach the row through \`v->items\`.

Every path out of main passes \`vault_free\`. The command loop ends on \`3\` or when input runs out; either way the same cleanup line runs. The example shows the skeleton with the commands as an if-chain; \`vault_find\` is shared by show and remove.`,
      example: {
        language: 'c',
        source: c`
int vault_find(const Vault *v, const char *name) {
    for (int i = 0; i < v->count; i++) {
        if (strcmp(v->items[i].name, name) == 0) return i;
    }
    return -1;
}

int main(void) {
    Vault v = {NULL, 0, 0};
    int running = 1;
    while (running) {
        int command;
        printf("Command?\n");
        if (scanf("%d", &command) != 1) break;
        if (command == 1) {
            /* Name? Amount? -> vault_push -> Added */
        } else if (command == 5) {
            char name[32];
            printf("Name?\n");
            if (scanf("%31s", name) != 1) break;
            printf("%s\n", vault_remove(&v, name) ? "Removed" : "Not found");
        } else if (command == 3) {
            printf("Bye\n");
            running = 0;
        }
    }
    vault_free(&v);
    return 0;
}`,
        labels: [
          { lines: [1, 6], label: 'Search by name: the index of the match, or -1. Read-only, so the vault is const.' },
          { lines: [9, 9], label: 'An empty vault: no row yet, nothing to free yet.' },
          { lines: [10, 14], label: 'The loop ends on quit or when input runs out; both fall through to the cleanup below.' },
          { lines: [15, 16], label: 'Add is as in v0.5, but vault_push grows the row instead of checking a cap.' },
          { lines: [17, 21], label: 'The new command: read a name, remove, report with the ternary picking the message.' },
          { lines: [22, 25], label: 'Quit sets the flag; the while condition ends the loop.' },
          { lines: [27, 28], label: 'One cleanup for every path. After this line, no arrow points at the heap.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'In the Python ledger `entries.remove(x)` and the garbage collector did this for you. Here the remove is your shift loop and the cleanup is your vault_free; nothing happens that you did not write.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The vault holds `a`, `b`, `c` (in that order) and the user removes `a` and then lists. In which order are the records printed, and what is the capacity afterwards?',
      code: {
        language: 'c',
        source: c`
/* vault_push and vault_remove as in lesson 6-4 */
Vault v = {NULL, 0, 0};
Record a = {"a", 1}, b = {"b", 2}, c = {"c", 3};
vault_push(&v, a);
vault_push(&v, b);
vault_push(&v, c);
vault_remove(&v, "a");
for (int i = 0; i < v.count; i++) printf("%s ", v.items[i].name);
printf("cap %d\n", v.capacity);
vault_free(&v);`,
      },
      choices: ['b c cap 4', 'c b cap 4', 'b c cap 2', 'a b c cap 4'],
      answer: 'b c cap 4',
      explanation: 'Removing shifts b and c one box down, so the order survives. The capacity is reserved space, not used space: it stays at 4 after a remove. Only count went from 3 to 2.',
    },
    {
      kind: 'create',
      prompt: `Vault v0.6. Same commands as v0.5, plus remove. Repeatedly print \`Command?\` and read an int:
- \`1\`: print \`Name?\`, read a word; print \`Amount?\`, read an int; push the record; print \`Added\`. There is no cap: the vault grows.
- \`2\`: print each record as \`<name>: <amount>\` in insertion order, then \`Records: <n>\` and \`Total: <t>\`.
- \`4\`: print \`Name?\`, read a word; print \`<name>: <amount>\` or \`Not found\`.
- \`5\`: print \`Name?\`, read a word; remove the first record with that name, keeping the order; print \`Removed\` or \`Not found\`.
- \`3\`: print \`Bye\` and stop. Anything else: \`Unknown command\`.
Use \`Record\`, a \`Vault { Record *items; int count; int capacity; }\` with capacity doubling from 4, and free everything before exit.`,
      language: 'c',
      tests: [
        { description: 'add two, list, quit (v0.5 behaviour)', stdin: '1\nrent\n-800\n1\nsalary\n2500\n2\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nrent: -800\nsalary: 2500\nRecords: 2\nTotal: 1700\nCommand?\nBye' },
        { description: 'six records: the row grows past 4', stdin: '1\na\n1\n1\nb\n2\n1\nc\n3\n1\nd\n4\n1\ne\n5\n1\nf\n6\n2\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\na: 1\nb: 2\nc: 3\nd: 4\ne: 5\nf: 6\nRecords: 6\nTotal: 21\nCommand?\nBye' },
        { description: 'remove the middle record keeps the order', stdin: '1\na\n1\n1\nb\n2\n1\nc\n3\n5\nb\n2\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nName?\nRemoved\nCommand?\na: 1\nc: 3\nRecords: 2\nTotal: 4\nCommand?\nBye' },
        { description: 'remove a missing name', stdin: '1\nrent\n-800\n5\nfood\n2\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nNot found\nCommand?\nrent: -800\nRecords: 1\nTotal: -800\nCommand?\nBye' },
        { description: 'remove then find, unknown command, empty list', stdin: '1\nrent\n-800\n5\nrent\n4\nrent\n9\n2\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nRemoved\nCommand?\nName?\nNot found\nCommand?\nUnknown command\nCommand?\nRecords: 0\nTotal: 0\nCommand?\nBye' },
        { description: 'find a present record, then quit at once', stdin: '1\ntips\n40\n4\ntips\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\ntips: 40\nCommand?\nBye' },
        { description: 'quit immediately: nothing to free but still clean', stdin: '3', expectedStdout: 'Command?\nBye' },
      ],
      hint: 'Write the helpers first: vault_push, vault_find, vault_remove (shift the tail), vault_free, and a `list` that also sums. In main, start `Vault v = {NULL, 0, 0};`, loop on a `running` flag, and put `vault_free(&v);` after the loop. If scanf fails, break so the cleanup still runs.',
      solution: c`
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct { char name[32]; int amount; } Record;
typedef struct { Record *items; int count; int capacity; } Vault;

int vault_push(Vault *v, Record r) {
    if (v->count == v->capacity) {
        int new_cap = v->capacity == 0 ? 4 : v->capacity * 2;
        Record *grown = realloc(v->items, new_cap * sizeof(*grown));
        if (grown == NULL) return 0;
        v->items = grown;
        v->capacity = new_cap;
    }
    v->items[v->count] = r;
    v->count++;
    return 1;
}

int vault_find(const Vault *v, const char *name) {
    for (int i = 0; i < v->count; i++) {
        if (strcmp(v->items[i].name, name) == 0) return i;
    }
    return -1;
}

int vault_remove(Vault *v, const char *name) {
    int i = vault_find(v, name);
    if (i < 0) return 0;
    for (int j = i; j < v->count - 1; j++) {
        v->items[j] = v->items[j + 1];
    }
    v->count--;
    return 1;
}

void vault_free(Vault *v) {
    free(v->items);
    v->items = NULL;
    v->count = 0;
    v->capacity = 0;
}

void list(const Vault *v) {
    int total = 0;
    for (int i = 0; i < v->count; i++) {
        printf("%s: %d\n", v->items[i].name, v->items[i].amount);
        total += v->items[i].amount;
    }
    printf("Records: %d\n", v->count);
    printf("Total: %d\n", total);
}

int read_word(const char *prompt, char *out) {
    printf("%s\n", prompt);
    return scanf("%31s", out) == 1;
}

int read_int(const char *prompt, int *out) {
    printf("%s\n", prompt);
    return scanf("%d", out) == 1;
}

int main(void) {
    Vault v = {NULL, 0, 0};
    int running = 1;
    while (running) {
        int command;
        if (!read_int("Command?", &command)) break;
        if (command == 1) {
            Record r;
            if (!read_word("Name?", r.name) || !read_int("Amount?", &r.amount)) break;
            if (!vault_push(&v, r)) {
                printf("Out of memory\n");
                break;
            }
            printf("Added\n");
        } else if (command == 2) {
            list(&v);
        } else if (command == 3) {
            printf("Bye\n");
            running = 0;
        } else if (command == 4) {
            char name[32];
            if (!read_word("Name?", name)) break;
            int i = vault_find(&v, name);
            if (i < 0) {
                printf("Not found\n");
            } else {
                printf("%s: %d\n", v.items[i].name, v.items[i].amount);
            }
        } else if (command == 5) {
            char name[32];
            if (!read_word("Name?", name)) break;
            printf("%s\n", vault_remove(&v, name) ? "Removed" : "Not found");
        } else {
            printf("Unknown command\n");
        }
    }
    vault_free(&v);
    return 0;
}
`,
      projectNote: 'Vault v0.6: records live in a heap row that doubles as it grows, a record can be removed by name, and every byte is freed before exit. On your own machine, run it under valgrind: "All heap blocks were freed" is the goal.',
    },
  ],
};

export const m6: Module = {
  id: 'c-m6',
  title: 'Pointers and memory',
  goal: '&, *, pointer arithmetic, malloc/free, realloc, ownership, leaks and use-after-free as concepts, valgrind.',
  projectMilestone: 'Vault v0.6: records live in a growable heap array.',
  status: 'available',
  lessons: [l61, l62, l63, l64, l65],
};
