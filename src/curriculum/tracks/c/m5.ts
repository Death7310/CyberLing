import type { Lesson, Module } from '../../schema';

const l51: Lesson = {
  id: 'c-5-1',
  title: 'One box with named compartments',
  objective: 'Declare a struct, initialise it, reach its members with a dot and copy it whole.',
  minutes: 20,
  lexicon: [
    { id: 'c.5.struct', term: 'struct Record { ... };', kind: 'keyword', meaning: 'Declare a new type: one box made of named members of possibly different types, laid out one after another. The closing brace needs a semicolon. Declaring the type reserves no memory; declaring a variable of it does.', example: 'struct Record {\n    char name[32];\n    int amount;\n};', analogy: 'A form with labelled fields: "name", "amount". The type is the blank form; each variable is one filled-in copy. The analogy breaks because a C struct has a fixed size and its fields can never be added to or left out.' },
    { id: 'c.5.struct-var', term: 'struct Record r = {"rent", -800};', kind: 'pattern', meaning: 'Declare a variable of the struct type and fill its members in declaration order. Members you leave out become 0. The keyword struct is part of the type name until a typedef says otherwise.', example: 'struct Record rent = {"rent", -800};\nstruct Record empty = {0};' },
    { id: 'c.5.dot', term: 'r.amount', kind: 'operator', meaning: 'Reach one member of a struct variable. It can be read or assigned like any variable of that member\'s type: r.amount is an int, r.name is a char array.', example: 'r.amount = r.amount + 100;\nprintf("%s\\n", r.name);' },
    { id: 'c.5.designated', term: '{ .name = "rent", .amount = -800 }', kind: 'pattern', meaning: 'A designated initialiser names each member, so the order does not matter and the reader sees what each value is. Members not named become 0.', example: 'struct Record r = { .amount = -800, .name = "rent" };' },
    { id: 'c.5.struct-copy', term: 'b = a; (struct)', kind: 'concept', meaning: 'Assigning one struct to another copies EVERY member, char arrays included, into the other box. Afterwards the two are independent: changing b leaves a untouched. This works for whole structs even though plain arrays cannot be assigned.', example: 'struct Record backup = r;\nr.amount = 0;   /* backup.amount is unchanged */' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Keep the fields of one record together',
      body: `Parallel arrays work, but nothing in the code says that \`names[3]\` and \`amounts[3]\` belong together. A **struct** makes that explicit: it declares a new type whose box has named **members**, laid out one after another in memory.

\`struct Record { char name[32]; int amount; };\` declares the type. Note the semicolon after the closing brace. It reserves no memory; \`struct Record r = {"rent", -800};\` does, filling the members in order. A **designated initialiser** names them instead: \`{ .name = "rent", .amount = -800 }\`.

You reach a member with a dot: \`r.amount\` is an ordinary int, \`r.name\` an ordinary char array, so everything you know about them still applies.

Assignment between structs copies **all** the members at once, including the char array, and the two boxes are then independent. That is the opposite of a Python object, where \`b = a\` makes two names for one thing.`,
      example: {
        language: 'c',
        source: `#include <stdio.h>

struct Record {
    char name[32];
    int amount;
};

int main(void) {
    struct Record rent = {"rent", -800};
    struct Record pay = { .name = "salary", .amount = 2500 };
    struct Record copy = rent;
    copy.amount = 0;
    printf("%s: %d\\n", rent.name, rent.amount);
    printf("%s: %d\\n", pay.name, pay.amount);
    printf("%s: %d\\n", copy.name, copy.amount);
    return 0;
}`,
        labels: [
          { lines: [3, 6], label: 'Declare the type: a name box and an amount box, glued together. Semicolon after the brace.' },
          { lines: [9, 9], label: 'One record, members filled in declaration order.' },
          { lines: [10, 10], label: 'Another, with the members named.' },
          { lines: [11, 12], label: 'Copy every member into a third box, then change only the copy.' },
          { lines: [13, 15], label: 'rent still says -800; the copy says 0.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Ledger v0.4 kept a record as a tuple ("rent", -800) reached by position, or a dict reached by key. A struct is reached by a fixed member name with a dot, like attribute access, but it is a plain box: b = a copies the whole record rather than aliasing it, and a struct can never gain a new field at run time.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: { language: 'c', source: '#include <stdio.h>\nstruct Record {\n    char name[32];\n    int amount;\n};\nint main(void) {\n    struct Record a = {"rent", -800};\n    struct Record b = a;\n    b.amount = 0;\n    b.name[0] = \'R\';\n    printf("%s %d %s %d\\n", a.name, a.amount, b.name, b.amount);\n    return 0;\n}' },
      choices: ['rent -800 Rent 0', 'Rent 0 Rent 0', 'rent -800 rent 0', 'Rent -800 Rent 0'],
      answer: 'rent -800 Rent 0',
      explanation: 'b = a copied both members into b\'s own box, char array included. Changing b.amount and b.name[0] touches only b. In Python, b = a would have made b another name for the same object, and a would have changed too.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that declares `struct Record`, creates one with a designated initialiser (name `rent`, amount -800) and prints `rent: -800`.',
      language: 'c',
      indentation: true,
      solution: ['#include <stdio.h>', 'struct Record {', '    char name[32];', '    int amount;', '};', 'int main(void) {', '    struct Record r = { .name = "rent", .amount = -800 };', '    printf("%s: %d\\n", r.name, r.amount);', '    return 0;', '}'],
      distractors: ['    Record r = { .name = "rent", .amount = -800 };', '    struct Record r = {-800, "rent"};', '    printf("%s: %d\\n", r->name, r->amount);'],
      explanation: 'Without a typedef the type is called struct Record, not Record. A positional initialiser must follow declaration order: name first, then amount. The arrow -> is for pointers to structs (next lessons); a struct variable uses the dot.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the type declaration and the designated initialiser so the program prints `salary: 2500`.',
      language: 'c',
      template: '#include <stdio.h>\nstruct Record {\n    char name[32];\n    int amount;\n}{{semi}}\nint main(void) {\n    struct Record r = { {{d1}} = "salary", {{d2}} = 2500 };\n    printf("%s: %d\\n", r{{dot}}name, r.amount);\n    return 0;\n}',
      blanks: [
        { id: 'semi', answers: [';'], hint: 'the struct declaration is a statement too' },
        { id: 'd1', answers: ['.name'], hint: 'a designator: dot, member name' },
        { id: 'd2', answers: ['.amount'] },
        { id: 'dot', answers: ['.'] },
      ],
      explanation: 'Forgetting the semicolon after the struct\'s closing brace is the classic error; the compiler then complains about main. Designators are the member name with a leading dot.',
    },
    {
      kind: 'modify',
      prompt: 'The program reads an amount into a record, adds 100 to it and prints the result. Before changing the amount, copy the whole record into a second variable `before`, and after the `Now:` line print `Before: <name>: <original amount>` from that copy.',
      language: 'c',
      starter: `#include <stdio.h>

struct Record {
    char name[32];
    int amount;
};

int main(void) {
    struct Record r = { .name = "rent", .amount = 0 };
    printf("Amount?\\n");
    if (scanf("%d", &r.amount) != 1) {
        return 1;
    }
    r.amount = r.amount + 100;
    printf("Now: %s: %d\\n", r.name, r.amount);
    return 0;
}
`,
      tests: [
        { description: 'Negative amount', stdin: '-800', expectedStdout: 'Amount?\nNow: rent: -700\nBefore: rent: -800' },
        { description: 'Zero', stdin: '0', expectedStdout: 'Amount?\nNow: rent: 100\nBefore: rent: 0' },
      ],
      hint: '`struct Record before = r;` right after reading. Struct assignment copies the name too, so before.name prints `rent`.',
      solution: `#include <stdio.h>

struct Record {
    char name[32];
    int amount;
};

int main(void) {
    struct Record r = { .name = "rent", .amount = 0 };
    printf("Amount?\\n");
    if (scanf("%d", &r.amount) != 1) {
        return 1;
    }
    struct Record before = r;
    r.amount = r.amount + 100;
    printf("Now: %s: %d\\n", r.name, r.amount);
    printf("Before: %s: %d\\n", before.name, before.amount);
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Declare `struct Record` with `char name[32]` and `int amount`. Print `Name?` and read a word straight into `r.name` (width 31); print `Amount?` and read an int into `r.amount`. Then print `<name>: <amount>`.',
      language: 'c',
      tests: [
        { description: 'A record', stdin: 'rent\n-800', expectedStdout: 'Name?\nAmount?\nrent: -800' },
        { description: 'Another record', stdin: 'salary\n2500', expectedStdout: 'Name?\nAmount?\nsalary: 2500' },
      ],
      hint: 'r.name is a char array, so no & for scanf; r.amount is an int, so &r.amount.',
      solution: `#include <stdio.h>

struct Record {
    char name[32];
    int amount;
};

int main(void) {
    struct Record r = {0};
    printf("Name?\\n");
    if (scanf("%31s", r.name) != 1) {
        return 1;
    }
    printf("Amount?\\n");
    if (scanf("%d", &r.amount) != 1) {
        return 1;
    }
    printf("%s: %d\\n", r.name, r.amount);
    return 0;
}
`,
      projectNote: 'Toward Vault v0.5: one record is now one box, read directly into its members.',
    },
  ],
};

const l52: Lesson = {
  id: 'c-5-2',
  title: 'A row of records',
  objective: 'Name a struct type with typedef and loop over an array of records.',
  minutes: 20,
  lexicon: [
    { id: 'c.5.typedef', term: 'typedef struct { ... } Record;', kind: 'keyword', meaning: 'Give a type a new name. With an anonymous struct the only name is the alias, so you write Record instead of struct Record everywhere. Note that there is then no "struct Record" at all.', example: 'typedef struct {\n    char name[32];\n    int amount;\n} Record;\n\nRecord r = {"rent", -800};', analogy: 'A nickname for a long name. It breaks in one way: unlike a nickname, after an anonymous typedef the long name does not exist.' },
    { id: 'c.5.struct-array', term: 'Record vault[100];', kind: 'pattern', meaning: 'An array whose elements are whole structs, one after another. Everything from Module 4 applies: fixed size, index from 0, a separate count of rows in use, no bounds checking.', example: 'Record vault[100];\nint count = 0;' },
    { id: 'c.5.index-dot', term: 'vault[i].amount', kind: 'operator', meaning: 'Index first to pick the record, then dot to pick the member. vault[i] is a struct, so struct assignment works on it too: vault[0] = vault[1] copies a whole record.', example: 'total += vault[i].amount;\nprintf("%s\\n", vault[i].name);' },
    { id: 'c.5.nested-init', term: '{ {"rent", -800}, {"salary", 2500} }', kind: 'pattern', meaning: 'Initialise an array of structs with one inner brace pair per record. Records you do not list are zeroed.', example: 'Record vault[3] = {\n    {"rent", -800},\n    {"salary", 2500},\n};' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'typedef, then an array of them',
      body: `Writing \`struct Record\` everywhere gets old. \`typedef\` gives the type a one-word name: \`typedef struct { ... } Record;\` and from then on \`Record r;\` declares a record. With this anonymous form there is no \`struct Record\` at all; the alias is the only name.

An **array of structs** replaces the parallel arrays: \`Record vault[100];\` holds 100 records, each with its name and amount side by side, and one \`count\` says how many rows are in use. \`vault[i]\` is a whole struct, so \`vault[i].amount\` is the amount of record i, and \`vault[0] = vault[1]\` copies a whole record.

Initialise an array of structs with nested braces, one pair per record. The loops of Module 4 are unchanged; only the element expression gained a dot. Sorting is not needed anywhere in this track.`,
      example: {
        language: 'c',
        source: `#include <stdio.h>

typedef struct {
    char name[32];
    int amount;
} Record;

int main(void) {
    Record vault[3] = {
        {"rent", -800},
        {"salary", 2500},
        {"food", -300},
    };
    int count = 3;
    int total = 0;
    for (int i = 0; i < count; i++) {
        printf("%s: %d\\n", vault[i].name, vault[i].amount);
        total += vault[i].amount;
    }
    printf("Records: %d\\n", count);
    printf("Total: %d\\n", total);
    return 0;
}`,
        labels: [
          { lines: [3, 6], label: 'An anonymous struct given the name Record.' },
          { lines: [9, 13], label: 'Three records in one array; inner braces per record.' },
          { lines: [14, 15], label: 'Rows in use, and the accumulator.' },
          { lines: [16, 19], label: 'The sum pattern from Module 4; the element is vault[i], its amount is vault[i].amount.' },
          { lines: [20, 21], label: 'Report, exactly as the list command will.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python kept records as a list of tuples: records[i][1] was the amount. Here it is vault[i].amount, reached by name. The list grew on demand; the array has a fixed capacity and a separate count, as in Module 4.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: { language: 'c', source: '#include <stdio.h>\ntypedef struct {\n    char name[32];\n    int amount;\n} Record;\nint main(void) {\n    Record v[2] = { {"rent", -800}, {"salary", 2500} };\n    v[0] = v[1];\n    v[1].amount = 9;\n    printf("%s %d %d\\n", v[0].name, v[0].amount, v[1].amount);\n    return 0;\n}' },
      choices: ['salary 2500 9', 'salary 9 9', 'rent -800 9', 'rent 2500 9'],
      answer: 'salary 2500 9',
      explanation: 'v[0] = v[1] copies both members of record 1 into record 0, so v[0] becomes salary/2500. Changing v[1].amount afterwards touches only record 1, because the copy was a copy.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that typedefs `Record`, declares two records in an array and prints `Total: 1700`.',
      language: 'c',
      indentation: true,
      solution: ['#include <stdio.h>', 'typedef struct {', '    char name[32];', '    int amount;', '} Record;', 'int main(void) {', '    Record vault[2] = { {"rent", -800}, {"salary", 2500} };', '    int total = 0;', '    for (int i = 0; i < 2; i++) {', '        total += vault[i].amount;', '    }', '    printf("Total: %d\\n", total);', '    return 0;', '}'],
      distractors: ['    struct Record vault[2] = { {"rent", -800}, {"salary", 2500} };', '        total += vault.amount[i];', '        total += vault[i]->amount;'],
      explanation: 'The typedef of an anonymous struct leaves no struct Record to name. The index picks the record and then the dot picks the member, not the other way round. vault[i] is a struct, not a pointer, so -> does not apply.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program prints `Negative: 2`.',
      language: 'c',
      template: '#include <stdio.h>\n{{kw}} struct {\n    char name[32];\n    int amount;\n} {{alias}};\nint main(void) {\n    Record vault[3] = { {"rent", -800}, {"salary", 2500}, {"food", -300} };\n    int negative = 0;\n    for (int i = 0; i < 3; i++) {\n        if (vault[i]{{member}} < 0) {\n            negative++;\n        }\n    }\n    printf("Negative: %d\\n", negative);\n    return 0;\n}',
      blanks: [
        { id: 'kw', answers: ['typedef'] },
        { id: 'alias', answers: ['Record'], hint: 'the name used in main' },
        { id: 'member', answers: ['.amount'], hint: 'dot, then the member' },
      ],
      explanation: 'typedef names the anonymous struct Record; the loop is the count pattern with vault[i].amount as the tested value.',
    },
    {
      kind: 'modify',
      prompt: 'The program reads three records and prints their total. Make it also print one line `<name>: <amount>` per record before the total, and after the total print `Largest: <name of the record with the biggest amount>`. Keep the whole record of the current best in a `Record best` variable.',
      language: 'c',
      starter: `#include <stdio.h>

typedef struct {
    char name[32];
    int amount;
} Record;

int main(void) {
    Record vault[3];
    for (int i = 0; i < 3; i++) {
        printf("Name?\\n");
        if (scanf("%31s", vault[i].name) != 1) {
            return 1;
        }
        printf("Amount?\\n");
        if (scanf("%d", &vault[i].amount) != 1) {
            return 1;
        }
    }
    int total = 0;
    for (int i = 0; i < 3; i++) {
        total += vault[i].amount;
    }
    printf("Total: %d\\n", total);
    return 0;
}
`,
      tests: [
        { description: 'Largest is in the middle', stdin: 'rent\n-800\nsalary\n2500\nfood\n-300', expectedStdout: 'Name?\nAmount?\nName?\nAmount?\nName?\nAmount?\nrent: -800\nsalary: 2500\nfood: -300\nTotal: 1400\nLargest: salary' },
        { description: 'All negative, largest first', stdin: 'rent\n-5\ntax\n-9\nfood\n-7', expectedStdout: 'Name?\nAmount?\nName?\nAmount?\nName?\nAmount?\nrent: -5\ntax: -9\nfood: -7\nTotal: -21\nLargest: rent' },
      ],
      hint: '`Record best = vault[0];` then `if (vault[i].amount > best.amount) best = vault[i];` inside the loop. Struct assignment copies the name along.',
      solution: `#include <stdio.h>

typedef struct {
    char name[32];
    int amount;
} Record;

int main(void) {
    Record vault[3];
    for (int i = 0; i < 3; i++) {
        printf("Name?\\n");
        if (scanf("%31s", vault[i].name) != 1) {
            return 1;
        }
        printf("Amount?\\n");
        if (scanf("%d", &vault[i].amount) != 1) {
            return 1;
        }
    }
    int total = 0;
    Record best = vault[0];
    for (int i = 0; i < 3; i++) {
        printf("%s: %d\\n", vault[i].name, vault[i].amount);
        total += vault[i].amount;
        if (vault[i].amount > best.amount) {
            best = vault[i];
        }
    }
    printf("Total: %d\\n", total);
    printf("Largest: %s\\n", best.name);
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Typedef `Record` (name[32], amount). Print `Count?` and read an int from 1 to 5. For each record print `Name?` and `Amount?` and read into `vault[i]`, a `Record vault[5]`. Then print `Records: <n>`, `Total: <sum>` and `Negative: <how many amounts are below 0>`.',
      language: 'c',
      tests: [
        { description: 'Three records', stdin: '3\nrent\n-800\nsalary\n2500\nfood\n-300', expectedStdout: 'Count?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nRecords: 3\nTotal: 1400\nNegative: 2' },
        { description: 'One record', stdin: '1\nsalary\n2500', expectedStdout: 'Count?\nName?\nAmount?\nRecords: 1\nTotal: 2500\nNegative: 0' },
        { description: 'Five records fill the array', stdin: '5\na\n-1\nb\n-2\nc\n-3\nd\n-4\ne\n-5', expectedStdout: 'Count?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nName?\nAmount?\nRecords: 5\nTotal: -15\nNegative: 5' },
      ],
      hint: 'Reject a count outside 1..5 with return 1 so the array is never overrun. Sum and count in the same loop.',
      solution: `#include <stdio.h>

typedef struct {
    char name[32];
    int amount;
} Record;

int main(void) {
    Record vault[5];
    int count = 0;
    printf("Count?\\n");
    if (scanf("%d", &count) != 1 || count < 1 || count > 5) {
        return 1;
    }
    for (int i = 0; i < count; i++) {
        printf("Name?\\n");
        if (scanf("%31s", vault[i].name) != 1) {
            return 1;
        }
        printf("Amount?\\n");
        if (scanf("%d", &vault[i].amount) != 1) {
            return 1;
        }
    }
    int total = 0;
    int negative = 0;
    for (int i = 0; i < count; i++) {
        total += vault[i].amount;
        if (vault[i].amount < 0) {
            negative++;
        }
    }
    printf("Records: %d\\n", count);
    printf("Total: %d\\n", total);
    printf("Negative: %d\\n", negative);
    return 0;
}
`,
      projectNote: 'Toward Vault v0.5: the vault is one array of Record with a count, filled straight from input.',
    },
  ],
};

const l53: Lesson = {
  id: 'c-5-3',
  title: 'Handing a record to a function',
  objective: 'Pass structs by value or by const pointer, use ->, return a struct, and write add_record with out-parameters.',
  minutes: 22,
  lexicon: [
    { id: 'c.5.by-value', term: 'void f(Record r)', kind: 'concept', meaning: 'A struct parameter is a COPY of the caller\'s struct, all members included. Changes inside the function stay in the copy, and large structs are copied in full on every call.', example: 'void bump(Record r) {\n    r.amount += 1;   /* caller never sees this */\n}' },
    { id: 'c.5.const-pointer', term: 'const Record *r', kind: 'pattern', meaning: 'Pass the address of a struct instead of a copy, and promise not to change it. The compiler rejects any assignment through r. Use it for functions that only read, like print_record.', example: 'void print_record(const Record *r);\n...\nprint_record(&vault[i]);' },
    { id: 'c.5.arrow', term: 'r->amount', kind: 'operator', meaning: 'Reach a member through a pointer to a struct. r->amount is exactly (*r).amount: follow the address, then pick the member. Use the dot on a struct, the arrow on a pointer to one.', example: 'printf("%s: %d\\n", r->name, r->amount);', analogy: 'The dot says "its amount"; the arrow says "the amount of the record over there". The analogy breaks when r is NULL: there is no record over there and the program crashes.' },
    { id: 'c.5.return-struct', term: 'Record make_record(...)', kind: 'pattern', meaning: 'A function can return a whole struct by value. The caller receives a copy, usually to store with assignment. Fill a local Record and return it.', example: 'Record make_record(const char *name, int amount) {\n    Record r;\n    strncpy(r.name, name, 31);\n    r.name[31] = \'\\0\';\n    r.amount = amount;\n    return r;\n}' },
    { id: 'c.5.add-record', term: 'add_record(Record *vault, int *count, ...)', kind: 'pattern', meaning: 'The shape of a function that changes the caller\'s collection: the array arrives as a pointer to its first record, and the count arrives as a pointer so it can be incremented where the caller sees it.', example: 'void add_record(Record *vault, int *count, const char *name, int amount) {\n    vault[*count] = make_record(name, amount);\n    (*count)++;\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Copy, or address?',
      body: `A struct passed to a function is **copied**, like an int: the function gets its own box and the caller never sees changes to it. That is safe but costly for a big struct, and useless when the function must change the record.

So most functions take a **pointer to the struct**. \`const Record *r\` says: here is the address of a record, and I promise only to read it. Through a pointer, members are reached with the **arrow**: \`r->amount\` means \`(*r).amount\`. Dot on a struct, arrow on a pointer to one. Without \`const\`, the function may write: \`r->amount = 0\` changes the caller's record.

A function can also **return** a struct by value; \`make_record\` builds one from a name and an amount and hands back a copy. Combine the two ideas and you get \`add_record(Record *vault, int *count, ...)\`: the array arrives as the address of its first record (as arrays always do), and \`count\` arrives as a pointer so the function can increment the caller's count, exactly as in Module 3.`,
      example: {
        language: 'c',
        source: `#include <stdio.h>
#include <string.h>

#define MAX 100

typedef struct {
    char name[32];
    int amount;
} Record;

Record make_record(const char *name, int amount) {
    Record r;
    strncpy(r.name, name, 31);
    r.name[31] = '\\0';
    r.amount = amount;
    return r;
}

void print_record(const Record *r) {
    printf("%s: %d\\n", r->name, r->amount);
}

void add_record(Record *vault, int *count, const char *name, int amount) {
    if (*count >= MAX) {
        return;
    }
    vault[*count] = make_record(name, amount);
    (*count)++;
}

int main(void) {
    Record vault[MAX];
    int count = 0;
    add_record(vault, &count, "rent", -800);
    add_record(vault, &count, "salary", 2500);
    for (int i = 0; i < count; i++) {
        print_record(&vault[i]);
    }
    printf("Records: %d\\n", count);
    return 0;
}`,
        labels: [
          { lines: [11, 17], label: 'Build a record in a local box and return a copy. Bounded copy of the name, terminator added by hand.' },
          { lines: [19, 21], label: 'Read-only access through a pointer: arrow, not dot. const makes writes a compile error.' },
          { lines: [23, 29], label: 'Change the caller\'s collection: guard the capacity, store at *count, then increment through the pointer.' },
          { lines: [34, 35], label: 'The array decays to Record *; count needs an explicit &.' },
          { lines: [36, 38], label: 'Pass the address of each record; nothing is copied.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'In Python every function argument is a reference, so a function that mutates a record changes the caller\'s record automatically. In C you choose: pass the struct and get a private copy, or pass &record and work through the arrow. const Record * has no Python equivalent; it is the compiler enforcing "read only".' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: { language: 'c', source: '#include <stdio.h>\ntypedef struct {\n    char name[32];\n    int amount;\n} Record;\nvoid bump(Record r) {\n    r.amount += 100;\n}\nint main(void) {\n    Record x = {"rent", -800};\n    bump(x);\n    printf("%d\\n", x.amount);\n    return 0;\n}' },
      choices: ['-800', '-700', '100', 'an error'],
      answer: '-800',
      explanation: 'bump receives a copy of x; r.amount += 100 changes the copy, which is destroyed when bump returns. To change the caller\'s record, bump would take Record *r and write r->amount += 100, called as bump(&x).',
    },
    {
      kind: 'predict',
      prompt: 'This program is compiled with gcc -Wall -Wextra -Werror. What happens?',
      code: { language: 'c', source: '#include <stdio.h>\ntypedef struct {\n    char name[32];\n    int amount;\n} Record;\nvoid reset(const Record *r) {\n    r->amount = 0;\n}\nint main(void) {\n    Record x = {"rent", -800};\n    reset(&x);\n    printf("%d\\n", x.amount);\n    return 0;\n}' },
      choices: ['It does not compile: r points to a const Record, so r->amount cannot be assigned.', 'It prints 0.', 'It prints -800, because the change stays inside reset.', 'It compiles with a warning and prints 0.'],
      answer: 'It does not compile: r points to a const Record, so r->amount cannot be assigned.',
      explanation: 'const Record * is a promise checked by the compiler: "assignment of member in read-only object" is an error, not a warning. Drop the const when a function is meant to change the record.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program with `print_record(const Record *r)` and a main that creates `rent`/-800 and prints it through the function.',
      language: 'c',
      indentation: true,
      solution: ['#include <stdio.h>', 'typedef struct {', '    char name[32];', '    int amount;', '} Record;', 'void print_record(const Record *r) {', '    printf("%s: %d\\n", r->name, r->amount);', '}', 'int main(void) {', '    Record r = {"rent", -800};', '    print_record(&r);', '    return 0;', '}'],
      distractors: ['    printf("%s: %d\\n", r.name, r.amount);', '    print_record(r);', '    print_record(*r);'],
      explanation: 'Inside the function r is a pointer, so members need the arrow. The caller must pass an address with &; passing the struct itself does not match a pointer parameter, and *r on a struct variable is meaningless.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the read-only printing function and its call.',
      language: 'c',
      template: '#include <stdio.h>\ntypedef struct {\n    char name[32];\n    int amount;\n} Record;\nvoid print_record({{cq}} Record *r) {\n    printf("%s: %d\\n", r{{arrow}}name, r->amount);\n}\nint main(void) {\n    Record r = {"salary", 2500};\n    print_record({{amp}}r);\n    return 0;\n}',
      blanks: [
        { id: 'cq', answers: ['const'], hint: 'the promise not to write' },
        { id: 'arrow', answers: ['->'] },
        { id: 'amp', answers: ['&'], hint: 'the function wants an address' },
      ],
      explanation: 'const marks the pointer target read-only, the arrow reaches a member through a pointer, and & supplies the address of the caller\'s record.',
    },
    {
      kind: 'modify',
      prompt: 'The program should list two records and `Records: 2`, but it prints only `Records: 0`: `add_record` receives `count` as a copy, so the caller\'s count never grows and the second record overwrites the first. Make `count` travel as a pointer and increment it inside `add_record`.',
      language: 'c',
      starter: `#include <stdio.h>
#include <string.h>

typedef struct {
    char name[32];
    int amount;
} Record;

Record make_record(const char *name, int amount) {
    Record r;
    strncpy(r.name, name, 31);
    r.name[31] = '\\0';
    r.amount = amount;
    return r;
}

void print_record(const Record *r) {
    printf("%s: %d\\n", r->name, r->amount);
}

void add_record(Record *vault, int count, const char *name, int amount) {
    vault[count] = make_record(name, amount);
}

int main(void) {
    Record vault[10];
    int count = 0;
    add_record(vault, count, "rent", -800);
    add_record(vault, count, "salary", 2500);
    for (int i = 0; i < count; i++) {
        print_record(&vault[i]);
    }
    printf("Records: %d\\n", count);
    return 0;
}
`,
      tests: [{ description: 'Two records listed', expectedStdout: 'rent: -800\nsalary: 2500\nRecords: 2' }],
      hint: 'Parameter `int *count`, store at `vault[*count]`, then `(*count)++`. The calls become add_record(vault, &count, ...).',
      solution: `#include <stdio.h>
#include <string.h>

typedef struct {
    char name[32];
    int amount;
} Record;

Record make_record(const char *name, int amount) {
    Record r;
    strncpy(r.name, name, 31);
    r.name[31] = '\\0';
    r.amount = amount;
    return r;
}

void print_record(const Record *r) {
    printf("%s: %d\\n", r->name, r->amount);
}

void add_record(Record *vault, int *count, const char *name, int amount) {
    vault[*count] = make_record(name, amount);
    (*count)++;
}

int main(void) {
    Record vault[10];
    int count = 0;
    add_record(vault, &count, "rent", -800);
    add_record(vault, &count, "salary", 2500);
    for (int i = 0; i < count; i++) {
        print_record(&vault[i]);
    }
    printf("Records: %d\\n", count);
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Typedef `Record`. Write `Record make_record(const char *name, int amount)`, `void print_record(const Record *r)` and `void apply_fee(Record *r, int fee)` that subtracts fee from the amount. In main: `Name?` read a word, `Amount?` read an int, `Fee?` read an int. Build the record, print it, apply the fee, print it again.',
      language: 'c',
      tests: [
        { description: 'Fee on a negative amount', stdin: 'rent\n-800\n50', expectedStdout: 'Name?\nAmount?\nFee?\nrent: -800\nrent: -850' },
        { description: 'Zero fee', stdin: 'salary\n2500\n0', expectedStdout: 'Name?\nAmount?\nFee?\nsalary: 2500\nsalary: 2500' },
        { description: 'Fee larger than the amount', stdin: 'food\n10\n25', expectedStdout: 'Name?\nAmount?\nFee?\nfood: 10\nfood: -15' },
      ],
      hint: 'Read the name into a plain char buf[32] first, then make_record(buf, amount). apply_fee writes through the pointer: r->amount -= fee. print_record is called with &r both times.',
      solution: `#include <stdio.h>
#include <string.h>

typedef struct {
    char name[32];
    int amount;
} Record;

Record make_record(const char *name, int amount) {
    Record r;
    strncpy(r.name, name, 31);
    r.name[31] = '\\0';
    r.amount = amount;
    return r;
}

void print_record(const Record *r) {
    printf("%s: %d\\n", r->name, r->amount);
}

void apply_fee(Record *r, int fee) {
    r->amount -= fee;
}

int main(void) {
    char buf[32];
    int amount = 0;
    int fee = 0;
    printf("Name?\\n");
    if (scanf("%31s", buf) != 1) {
        return 1;
    }
    printf("Amount?\\n");
    if (scanf("%d", &amount) != 1) {
        return 1;
    }
    printf("Fee?\\n");
    if (scanf("%d", &fee) != 1) {
        return 1;
    }
    Record r = make_record(buf, amount);
    print_record(&r);
    apply_fee(&r, fee);
    print_record(&r);
    return 0;
}
`,
      projectNote: 'Toward Vault v0.5: records are built, printed and changed through functions that take Record * or const Record *.',
    },
  ],
};

const fullStdin = Array.from({ length: 101 }, (_, i) => (i < 100 ? `1\nn${i}\n${i}` : '1')).join('\n') + '\n2\n3';
const fullExpected = Array.from({ length: 101 }, (_, i) => (i < 100 ? 'Command?\nName?\nAmount?\nAdded' : 'Command?\nVault full')).join('\n')
  + '\nCommand?\n' + Array.from({ length: 100 }, (_, i) => `n${i}: ${i}`).join('\n') + '\nRecords: 100\nTotal: 4950\nCommand?\nBye';

const l54: Lesson = {
  id: 'c-5-4',
  title: 'Project: Vault v0.5',
  objective: 'Rebuild the vault around struct Record, with functions that take Record * or const Record *.',
  minutes: 22,
  lexicon: [
    { id: 'c.5.tag-and-alias', term: 'typedef struct Record { ... } Record;', kind: 'pattern', meaning: 'Give the struct both a tag and an alias. struct Record and Record then name the same type, so code written either way (the spine says struct Record, this module says Record) compiles.', example: 'typedef struct Record {\n    char name[32];\n    int amount;\n} Record;\n\nstruct Record a;\nRecord b = a;' },
    { id: 'c.5.array-plus-count', term: 'Record vault[MAX]; int count;', kind: 'concept', meaning: 'The fixed-capacity collection pattern: an array of structs plus the number of rows in use. Functions that only read take (const Record *vault, int count); the one that adds takes (Record *vault, int *count).', example: 'void list(const Record *vault, int count);\nvoid add(Record *vault, int *count);' },
    { id: 'c.5.read-only-view', term: 'const Record *vault', kind: 'pattern', meaning: 'A pointer to the first of several read-only records. vault[i] is record i (a struct, so dot), and &vault[i] is its address for functions like print_record. Writing through it is a compile error, which documents that list and find never change the vault.', example: 'for (int i = 0; i < count; i++) {\n    print_record(&vault[i]);\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The same vault, one box per record',
      body: `Vault v0.5 has exactly the I/O of v0.4. What changes is the storage: \`Record vault[MAX]\` replaces the two parallel arrays, so a record's name and amount can never drift apart, and \`add\` fills one local \`Record\` and stores it with a single assignment.

Function signatures carry the intent:

- \`add(Record *vault, int *count)\`: writes a record and grows the count.
- \`list(const Record *vault, int count)\` and \`find(const Record *vault, int count)\`: read only.
- \`find_by_name(const Record *vault, int count, const char *target)\`: the Module 4 search with \`vault[i].name\`.
- \`print_record(const Record *r)\`: one line \`<name>: <amount>\`, reused by list and find.

The type is declared with both a tag and an alias, \`typedef struct Record { ... } Record;\`, so \`struct Record\` and \`Record\` both work. Below are add and list; the command loop is the one from v0.4.`,
      example: {
        language: 'c',
        source: `typedef struct Record {
    char name[32];
    int amount;
} Record;

void print_record(const Record *r) {
    printf("%s: %d\\n", r->name, r->amount);
}

void add(Record *vault, int *count) {
    if (*count >= MAX) {
        printf("Vault full\\n");
        return;
    }
    Record r;
    read_word("Name?", r.name);
    r.amount = read_int("Amount?");
    vault[*count] = r;
    (*count)++;
    printf("Added\\n");
}

void list(const Record *vault, int count) {
    int total = 0;
    for (int i = 0; i < count; i++) {
        print_record(&vault[i]);
        total += vault[i].amount;
    }
    printf("Records: %d\\n", count);
    printf("Total: %d\\n", total);
}`,
        labels: [
          { lines: [1, 4], label: 'Tag and alias: struct Record and Record are the same type.' },
          { lines: [6, 8], label: 'One line per record, through a read-only pointer.' },
          { lines: [11, 14], label: 'Same guard as v0.4, before any prompt.' },
          { lines: [15, 17], label: 'Fill a local record: its name is a char array (no &), its amount an int.' },
          { lines: [18, 20], label: 'One struct assignment stores both members; then the caller\'s count grows.' },
          { lines: [23, 31], label: 'Read-only walk: address of record i for printing, dot for the amount.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'This is the step where the C vault catches up with Ledger v0.4\'s list of tuples: one record is one value again. The difference remains that the array is fixed at 100 and the functions declare, in their types, whether they may change it.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Inside `list(const Record *vault, int count)`, which expression is the name of record i?',
      code: { language: 'c', source: 'void list(const Record *vault, int count) {\n    for (int i = 0; i < count; i++) {\n        /* print the name of record i */\n    }\n}' },
      choices: ['vault[i].name', 'vault->name[i]', 'vault[i]->name', 'vault.name[i]'],
      answer: 'vault[i].name',
      explanation: 'vault points at the first record; indexing it gives record i, a struct, so the dot follows. vault->name is the name of record 0 only, and name[i] would be its i-th letter. vault[i] is not a pointer, so -> does not apply, and vault itself is a pointer, so the plain dot does not either.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the `add` function for Vault v0.5: guard the capacity, read a record, store it and grow the count.',
      language: 'c',
      indentation: true,
      solution: ['void add(Record *vault, int *count) {', '    if (*count >= MAX) {', '        printf("Vault full\\n");', '        return;', '    }', '    Record r;', '    read_word("Name?", r.name);', '    r.amount = read_int("Amount?");', '    vault[*count] = r;', '    (*count)++;', '    printf("Added\\n");', '}'],
      distractors: ['    read_word("Name?", &r.name);', '    vault[count] = r;', '    count++;'],
      explanation: 'r.name is already an address. count is a pointer here, so the index and the increment both need *count; count++ would move the pointer, not grow the caller\'s number.',
    },
    {
      kind: 'create',
      prompt: 'Build Vault v0.5: identical I/O to v0.4 (commands 1 add with `Vault full`, 2 list, 4 find, 3 quit, else `Unknown command`), but with `typedef struct Record { char name[32]; int amount; } Record;`, a `Record vault[100]`, `print_record(const Record *)`, `find_by_name(const Record *, int, const char *)`, `add(Record *, int *)`, `list(const Record *, int)` and `find(const Record *, int)`.',
      language: 'c',
      tests: [
        { description: 'Add two, list, quit', stdin: '1\nrent\n-800\n1\nsalary\n2500\n2\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nrent: -800\nsalary: 2500\nRecords: 2\nTotal: 1700\nCommand?\nBye' },
        { description: 'Find hit', stdin: '1\nrent\n-800\n1\nsalary\n2500\n4\nsalary\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nName?\nsalary: 2500\nCommand?\nBye' },
        { description: 'Find miss', stdin: '1\nrent\n-800\n4\ncar\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nNot found\nCommand?\nBye' },
        { description: 'Empty list and unknown command', stdin: '2\n9\n3', expectedStdout: 'Command?\nRecords: 0\nTotal: 0\nCommand?\nUnknown command\nCommand?\nBye' },
        { description: 'Vault full after 100 records', stdin: fullStdin, expectedStdout: fullExpected },
      ],
      hint: 'Start from your v0.4 and replace the two arrays with one. Every names[i] becomes vault[i].name and every amounts[i] becomes vault[i].amount; the helpers read_int, read_word and read_command do not change.',
      solution: `#include <stdio.h>
#include <string.h>

#define MAX 100

typedef struct Record {
    char name[32];
    int amount;
} Record;

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

void print_record(const Record *r) {
    printf("%s: %d\\n", r->name, r->amount);
}

int find_by_name(const Record *vault, int count, const char *target) {
    for (int i = 0; i < count; i++) {
        if (strcmp(vault[i].name, target) == 0) {
            return i;
        }
    }
    return -1;
}

void add(Record *vault, int *count) {
    if (*count >= MAX) {
        printf("Vault full\\n");
        return;
    }
    Record r;
    read_word("Name?", r.name);
    r.amount = read_int("Amount?");
    vault[*count] = r;
    (*count)++;
    printf("Added\\n");
}

void list(const Record *vault, int count) {
    int total = 0;
    for (int i = 0; i < count; i++) {
        print_record(&vault[i]);
        total += vault[i].amount;
    }
    printf("Records: %d\\n", count);
    printf("Total: %d\\n", total);
}

void find(const Record *vault, int count) {
    char target[32];
    read_word("Name?", target);
    int i = find_by_name(vault, count, target);
    if (i < 0) {
        printf("Not found\\n");
    } else {
        print_record(&vault[i]);
    }
}

int main(void) {
    Record vault[MAX];
    int count = 0;
    int command = read_command();
    while (command != 3) {
        switch (command) {
            case 1:
                add(vault, &count);
                break;
            case 2:
                list(vault, count);
                break;
            case 4:
                find(vault, count);
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
      projectNote: 'Vault v0.5: one struct per record in a fixed array of 100. Module 6 moves the array to the heap so it can grow, and adds remove.',
    },
  ],
};

export const m5: Module = {
  id: 'c-m5',
  title: 'Structs',
  goal: 'struct, typedef, arrays of structs, passing structs to functions.',
  projectMilestone: 'Vault v0.5: a Record struct and an array of them.',
  status: 'available',
  lessons: [l51, l52, l53, l54],
};
