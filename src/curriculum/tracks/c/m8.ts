import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 8: Building real programs                                   */
/* C sources are String.raw so that \n inside C strings stays literal. */
/* ------------------------------------------------------------------ */

/* ---------------------------- 8-1 --------------------------------- */

const verbsExample = String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[]) {
    if (argc < 3) {
        fprintf(stderr, "Usage: %s greet <name> | double <n>\n", argv[0]);
        return 1;
    }
    if (strcmp(argv[1], "greet") == 0) {
        printf("Hello, %s\n", argv[2]);
        return 0;
    }
    if (strcmp(argv[1], "double") == 0) {
        char *end;
        long n = strtol(argv[2], &end, 10);
        if (*end != '\0') {
            fprintf(stderr, "Not a number: %s\n", argv[2]);
            return 1;
        }
        printf("%ld\n", n * 2);
        return 0;
    }
    fprintf(stderr, "Unknown verb: %s\n", argv[1]);
    return 1;
}`;

const greetStarter = String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s greet <name> | sum <a> <b>\n", argv[0]);
        return 1;
    }
    if (strcmp(argv[1], "greet") == 0 && argc == 3) {
        printf("Hello, %s\n", argv[2]);
        return 0;
    }
    fprintf(stderr, "Unknown verb: %s\n", argv[1]);
    return 1;
}
`;

const greetSolution = String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s greet <name> | sum <a> <b>\n", argv[0]);
        return 1;
    }
    if (strcmp(argv[1], "greet") == 0 && argc == 3) {
        printf("Hello, %s\n", argv[2]);
        return 0;
    }
    if (strcmp(argv[1], "sum") == 0 && argc == 4) {
        char *end_a;
        char *end_b;
        long a = strtol(argv[2], &end_a, 10);
        long b = strtol(argv[3], &end_b, 10);
        if (*end_a != '\0' || *end_b != '\0') {
            fprintf(stderr, "Not a number\n");
            return 1;
        }
        printf("Sum: %ld\n", a + b);
        return 0;
    }
    fprintf(stderr, "Unknown verb: %s\n", argv[1]);
    return 1;
}
`;

const argvToolSolution = String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s total <n>... | count <word>... | last <word>...\n", argv[0]);
        return 1;
    }
    if (strcmp(argv[1], "total") == 0) {
        long total = 0;
        for (int i = 2; i < argc; i++) {
            char *end;
            long n = strtol(argv[i], &end, 10);
            if (*end != '\0') {
                fprintf(stderr, "Not a number: %s\n", argv[i]);
                return 1;
            }
            total += n;
        }
        printf("Total: %ld\n", total);
        return 0;
    }
    if (strcmp(argv[1], "count") == 0) {
        printf("Count: %d\n", argc - 2);
        return 0;
    }
    if (strcmp(argv[1], "last") == 0 && argc >= 3) {
        printf("Last: %s\n", argv[argc - 1]);
        return 0;
    }
    fprintf(stderr, "Usage: %s total <n>... | count <word>... | last <word>...\n", argv[0]);
    return 1;
}
`;

const l81: Lesson = {
  id: 'c-8-1',
  title: 'Verbs on the command line',
  objective: 'Read command-line arguments through argc and argv, dispatch on a verb with strcmp, and convert text to numbers safely.',
  minutes: 22,
  lexicon: [
    { id: 'c.8.argc-argv', term: 'int main(int argc, char *argv[])', kind: 'pattern', meaning: 'The form of main that receives the command line. argc is how many words were typed (the program name included); argv is an array of those words as strings. argv[0] is the program itself, so the first real argument is argv[1].', example: 'int main(int argc, char *argv[]) {\n    if (argc < 2) {\n        return 1;\n    }\n    printf("%s\\n", argv[1]);\n    return 0;\n}', analogy: 'The words of a sentence handed to you one by one, with the speaker\'s name first. The analogy breaks because the shell, not the speaker, decides where words end: quotes glue words together and spaces split them.' },
    { id: 'c.8.strcmp', term: 'strcmp(a, b) == 0', kind: 'builtin', meaning: 'Compare two strings character by character; 0 means they are identical. Writing argv[1] == "add" compares two addresses and is never what you mean.', example: 'if (strcmp(argv[1], "add") == 0) {\n    /* the add verb */\n}' },
    { id: 'c.8.strtol', term: 'strtol(text, &end, 10)', kind: 'builtin', meaning: 'Convert the leading digits of text to a long in base 10 and store, in end, the address of the first character it could not use. If *end is not the terminator, the text was not a clean number.', example: 'char *end;\nlong n = strtol(argv[2], &end, 10);\nif (*end != \'\\0\') {\n    return 1;\n}' },
    { id: 'c.8.atoi', term: 'atoi(text)', kind: 'builtin', meaning: 'Convert text to an int, returning 0 when there are no leading digits. It cannot tell "0" from "abc", so it has no way to report failure. Prefer strtol.', example: 'atoi("42")   /* 42 */\natoi("abc")  /* 0: no error, no clue */' },
    { id: 'c.8.usage-stderr', term: 'fprintf(stderr, "Usage: ..."); return 1;', kind: 'pattern', meaning: 'Report misuse on the error stream and leave main with a non-zero status. Normal output stays clean for pipes and tests; the shell learns from the status that the run failed.', example: 'if (argc < 2) {\n    fprintf(stderr, "Usage: %s add|list\\n", argv[0]);\n    return 1;\n}', analogy: 'Writing the complaint on a separate slip instead of in the ledger. The ledger (stdout) stays correct, and the slip (stderr) still reaches the person at the keyboard.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Arguments instead of questions',
      body: `Every Vault so far asked its questions with \`printf\` and \`scanf\`. Real command-line tools take their instructions from the **command line** instead: \`./main add rent -800\`. The operating system hands those words to \`main\` through two parameters: \`argc\`, how many words there are, and \`argv\`, an array of strings. \`argv[0]\` is the program's own name, so the first real argument is \`argv[1]\`.

Two habits make this safe. Strings cannot be compared with \`==\` (that compares addresses), so a verb is recognised with \`strcmp(argv[1], "add") == 0\`. And every argument arrives as text; \`strtol\` converts it to a number **and** tells you, through its end pointer, where the digits stopped, so \`"12x"\` can be rejected instead of silently becoming 12.

When the arguments make no sense, print a usage line to \`stderr\` and \`return 1\`. Normal output stays clean, and the non-zero exit status tells the shell (and any test) that the run failed.`,
      example: {
        language: 'c',
        source: verbsExample,
        labels: [
          { lines: [1, 3], label: 'stdlib for strtol, string for strcmp.' },
          { lines: [5, 5], label: 'The two-parameter main: a count and an array of strings.' },
          { lines: [6, 9], label: 'Not enough words: say how to use the tool, on stderr, and fail with status 1. argv[0] is the program name.' },
          { lines: [10, 13], label: 'Recognise the verb with strcmp, never ==. argv[2] is the name that followed it.' },
          { lines: [14, 16], label: 'Convert text to a number. end will point at the first character strtol could not use.' },
          { lines: [17, 20], label: 'A clean number ends exactly at the terminator. Anything else is rejected.' },
          { lines: [21, 23], label: 'Success: print the result on stdout and return 0.' },
          { lines: [24, 25], label: 'A verb nobody declared is also misuse.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python\'s `sys.argv` is a list of strings with the script name at index 0; C delivers the same list as `argc` and `argv`. argparse built the usage message and the exit code for you; here you write both by hand. `int("abc")` raised ValueError; `atoi("abc")` quietly returns 0, which is why C programmers reach for `strtol` and check where it stopped.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The program is run as `./main add rent -800`. What does it print?',
      code: {
        language: 'c',
        source: String.raw`#include <stdio.h>

int main(int argc, char *argv[]) {
    printf("%d\n", argc);
    printf("%s\n", argv[2]);
    printf("%c\n", argv[3][0]);
    return 0;
}`,
      },
      choices: ['4\nrent\n-', '3\nrent\n-', '4\nadd\nr', '3\n-800\n-'],
      answer: '4\nrent\n-',
      explanation: 'Four words were typed, and the program name counts, so argc is 4. argv[1] is "add", argv[2] is "rent". argv[3] is the string "-800", and its first character is the minus sign; nothing has been converted to a number yet.',
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: {
        language: 'c',
        source: String.raw`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    printf("%d\n", atoi("42"));
    printf("%d\n", atoi("abc"));
    printf("%d\n", atoi("7up"));
    return 0;
}`,
      },
      choices: ['42\n0\n7', '42\nerror\n7', '42\n0\n0', 'It crashes on "abc"'],
      answer: '42\n0\n7',
      explanation: 'atoi reads leading digits and stops at the first character that is not one. "abc" has no digits, so the answer is 0, indistinguishable from a real zero. "7up" gives 7 with no complaint. That silence is why this module uses strtol with an end pointer: it can tell you that "up" was left over.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so that `main double 21` prints `42` and anything else prints a usage line on stderr.',
      language: 'c',
      template: String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int {{count}}, char *argv[]) {
    if (argc != 3) {
        fprintf({{stream}}, "Usage: %s double <n>\n", argv[0]);
        return 1;
    }
    if (strcmp(argv[1], "double") {{eq}} 0) {
        char *end;
        long n = strtol(argv[2], {{endptr}}, 10);
        if (*end != '\0') {
            return 1;
        }
        printf("%ld\n", n * 2);
    }
    return 0;
}`,
      blanks: [
        { id: 'count', answers: ['argc'], hint: 'the name used on the very next line' },
        { id: 'stream', answers: ['stderr'], hint: 'the stream for complaints, not results' },
        { id: 'eq', answers: ['=='], hint: 'strcmp returns 0 for equal strings' },
        { id: 'endptr', answers: ['&end'], hint: 'strtol needs the address of your pointer so it can set it' },
      ],
      explanation: 'strtol writes into your `end` pointer, so it needs `&end`, the same way scanf needed `&x`. Checking `*end` afterwards is what makes the conversion safe.',
    },
    {
      kind: 'modify',
      prompt: 'This tool knows one verb. Add a `sum` verb: `main sum <a> <b>` prints `Sum: <a+b>`. Convert both arguments with `strtol`; if either is not a clean whole number, print a message on stderr and return 1. `greet` must keep working.',
      language: 'c',
      starter: greetStarter,
      tests: [
        { description: 'greet still works', argv: ['greet', 'Sam'], expectedStdout: 'Hello, Sam' },
        { description: 'sum of two positives', argv: ['sum', '2', '3'], expectedStdout: 'Sum: 5' },
        { description: 'sum with a negative', argv: ['sum', '-4', '10'], expectedStdout: 'Sum: 6' },
      ],
      hint: 'Copy the shape of the greet branch: strcmp on argv[1] and a check that argc == 4. You need two end pointers, one per conversion, or reuse one and check it after each call.',
      solution: greetSolution,
    },
    {
      kind: 'create',
      prompt: `Write a small command-line tool with three verbs that work on **all remaining arguments**:

- \`main total <n>...\` prints \`Total: <sum of the numbers>\` (\`Total: 0\` when there are none). Convert with \`strtol\`; a non-number is reported on stderr with return 1.
- \`main count <word>...\` prints \`Count: <how many words followed the verb>\`.
- \`main last <word>...\` prints \`Last: <the final argument>\`.
- No verb, or an unknown one, prints a usage line on stderr and returns 1.

Loop from \`i = 2\` to \`argc\`; the last argument is \`argv[argc - 1]\`.`,
      language: 'c',
      tests: [
        { description: 'total of three numbers', argv: ['total', '10', '20', '-5'], expectedStdout: 'Total: 25' },
        { description: 'total of nothing', argv: ['total'], expectedStdout: 'Total: 0' },
        { description: 'count three words', argv: ['count', 'a', 'b', 'c'], expectedStdout: 'Count: 3' },
        { description: 'count zero words', argv: ['count'], expectedStdout: 'Count: 0' },
        { description: 'last of three', argv: ['last', 'rent', 'food', 'salary'], expectedStdout: 'Last: salary' },
      ],
      hint: 'Start with the usage check and the three strcmp branches, each returning 0. total needs a long accumulator and a for loop that converts argv[i] with strtol; count is argc - 2 with no loop at all.',
      solution: argvToolSolution,
      projectNote: 'Vault v1.0 will take its commands this way: a verb in argv[1], its operands after it, usage on stderr when the shape is wrong.',
    },
  ],
};

/* ---------------------------- 8-2 --------------------------------- */

const threeFiles = String.raw`/* ---- vault.h : what other files may know ---- */
#ifndef VAULT_H
#define VAULT_H
struct Record {
    char name[32];
    int amount;
};
extern int verbose;
int load_vault(struct Record *out, int max);
int vault_total(const struct Record *v, int n);
#endif

/* ---- vault.c : the implementation ---- */
#include <stdio.h>
#include "vault.h"
int verbose = 0;
static int parse_line(FILE *f, struct Record *r) {
    return fscanf(f, "%31s %d", r->name, &r->amount) == 2;
}
int load_vault(struct Record *out, int max) {
    FILE *f = fopen("vault.txt", "r");
    int n = 0;
    if (f == NULL) {
        return 0;
    }
    while (n < max && parse_line(f, &out[n])) {
        n++;
    }
    fclose(f);
    if (verbose) {
        printf("Loaded %d records\n", n);
    }
    return n;
}
int vault_total(const struct Record *v, int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += v[i].amount;
    }
    return total;
}

/* ---- main.c : the entry point ---- */
#include <stdio.h>
#include "vault.h"
int main(void) {
    struct Record vault[100];
    int n;
    verbose = 1;
    n = load_vault(vault, 100);
    printf("Total: %d\n", vault_total(vault, n));
    return 0;
}`;

const staticHelpersSolution = String.raw`#include <stdio.h>
#include <stdlib.h>

/* In a real project these two helpers would live in amounts.c, declared in
   amounts.h. Here they are file-local to the single translation unit. */

static int parse_amount(const char *text, long *out) {
    char *end;
    *out = strtol(text, &end, 10);
    return *end == '\0' && text[0] != '\0';
}

static void report(int count, long total, int negative) {
    printf("Count: %d\n", count);
    printf("Total: %ld\n", total);
    printf("Negative: %d\n", negative);
}

int main(int argc, char *argv[]) {
    long total = 0;
    int negative = 0;
    for (int i = 1; i < argc; i++) {
        long amount;
        if (!parse_amount(argv[i], &amount)) {
            fprintf(stderr, "Not a number: %s\n", argv[i]);
            return 1;
        }
        total += amount;
        if (amount < 0) {
            negative++;
        }
    }
    report(argc - 1, total, negative);
    return 0;
}
`;

const l82: Lesson = {
  id: 'c-8-2',
  title: 'Many files, one program',
  objective: 'Split a program into translation units joined by a header, hide helpers with static, and build it with make.',
  minutes: 22,
  lexicon: [
    { id: 'c.8.translation-unit', term: 'translation unit', kind: 'concept', meaning: 'One .c file after its #includes have been pasted in: the unit the compiler translates into one .o object file. The linker then joins the object files into a program. A name used in one unit and defined in another is resolved at link time.', example: 'gcc -c vault.c      # vault.o\ngcc -c main.c       # main.o\ngcc main.o vault.o -o main', analogy: 'Chapters written by different authors and bound by a publisher. The binding (linking) fails if a chapter refers to a figure no chapter contains.' },
    { id: 'c.8.include-guard', term: '#ifndef X_H / #define X_H / #endif', kind: 'pattern', meaning: 'Wraps a header so its contents are pasted at most once per translation unit, even if two includes pull it in. Without it a struct would be defined twice, which is an error.', example: '#ifndef VAULT_H\n#define VAULT_H\nstruct Record { char name[32]; int amount; };\n#endif' },
    { id: 'c.8.extern', term: 'extern int verbose;', kind: 'keyword', meaning: 'Declare a global variable that is defined in some other translation unit. The declaration creates no box; exactly one .c file must contain the definition without extern.', example: '/* vault.h */ extern int verbose;\n/* vault.c */ int verbose = 0;' },
    { id: 'c.8.static', term: 'static int helper(...)', kind: 'keyword', meaning: 'At file scope, static makes a function or variable private to its translation unit: the linker never sees the name, so other files cannot call it and may reuse the name. Use it for every helper that is not part of the file\'s public interface.', example: 'static int parse_line(FILE *f, struct Record *r) {\n    return fscanf(f, "%31s %d", r->name, &r->amount) == 2;\n}', analogy: 'A word in a family\'s private dialect: perfectly clear inside the house, unknown outside. The analogy breaks for static inside a function, which means something else entirely: a local box that survives between calls.' },
    { id: 'c.8.make', term: 'target: prerequisites + TAB recipe', kind: 'concept', meaning: 'A Makefile rule: build target by running the recipe, but only when a prerequisite is newer than the target. make follows the chain of rules and rebuilds exactly what changed. The recipe line must start with a tab character.', example: 'main: main.o vault.o\n\tgcc main.o vault.o -o main\n\nvault.o: vault.c vault.h\n\tgcc -c vault.c' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A header is a promise; the linker holds you to it',
      body: `A program of five hundred lines fits in one file. Vault is heading past that, and a file nobody can navigate is a file nobody dares change. C splits a program into **translation units**: each \`.c\` file is compiled on its own into a \`.o\` object file, and the **linker** joins them. The compiler never sees the other files, so each unit needs to be *told* what the others provide. That is the job of a **header**: a \`.h\` file holding the struct types, the function prototypes and \`extern\` declarations of shared globals, which every unit that needs them includes.

Three rules keep this honest. An **include guard** stops a header being pasted twice into one unit. \`extern int verbose;\` declares the variable without creating it; exactly one \`.c\` file defines it. And a helper nobody else needs is marked \`static\`, which hides it from the linker so it cannot be called, or collide with a name, in another file.

The example is three files. Build with \`gcc -c vault.c\`, \`gcc -c main.c\`, then \`gcc main.o vault.o -o main\`. The in-app runner compiles a single \`main.c\`, so this lesson's create step stays in one file; on your own machine, split Vault exactly like this.`,
      example: {
        language: 'c',
        source: threeFiles,
        labels: [
          { lines: [1, 1], label: 'The header: everything another file is allowed to know about the vault.' },
          { lines: [2, 3], label: 'Include guard, part one: if VAULT_H is not yet defined, define it and read on. A second include skips to #endif.' },
          { lines: [4, 7], label: 'The shared type. Both .c files must agree on it, so it lives here and nowhere else.' },
          { lines: [8, 8], label: 'extern: a global exists somewhere. No box is created by this line.' },
          { lines: [9, 10], label: 'Prototypes: promises the linker will have to keep.' },
          { lines: [11, 11], label: 'Include guard, part two.' },
          { lines: [13, 16], label: 'vault.c includes its own header so the compiler checks each definition against its promise. The one real verbose box lives here.' },
          { lines: [17, 19], label: 'A static helper: usable in this file only. The linker never learns its name.' },
          { lines: [20, 41], label: 'The two promised functions, defined exactly as declared.' },
          { lines: [43, 46], label: 'main.c includes the same header and knows nothing else about vault.c.' },
          { lines: [47, 53], label: 'It uses the shared global and the two functions through their declarations. The linker connects the calls to vault.o.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'In Python `import ledger` runs ledger.py and gives you its names; there is no separate declaration. In C the header is a hand-written table of contents, and a function used but never defined is caught by the linker, not the compiler. Python\'s "private" `_helper` is a convention; C\'s `static` is enforced.' },
      ],
    },
    {
      kind: 'cloze',
      prompt: 'Complete the header so it can be included from several files without error, and declares (without creating) the shared global.',
      language: 'c',
      template: String.raw`/* vault.h */
{{guard1}} VAULT_H
{{guard2}} VAULT_H

struct Record {
    char name[32];
    int amount;
};

{{ext}} int verbose;

int load_vault(struct Record *out, int max);
int vault_total(const struct Record *v, int n);

{{guard3}}`,
      blanks: [
        { id: 'guard1', answers: ['#ifndef'], hint: '"if not defined"' },
        { id: 'guard2', answers: ['#define'], hint: 'now define it, so the next include skips' },
        { id: 'ext', answers: ['extern'], hint: 'declares a box that lives in another file' },
        { id: 'guard3', answers: ['#endif'], hint: 'close the conditional' },
      ],
      explanation: 'The guard macro is conventionally the file name in capitals with _H. The prototypes need no keyword: a function declaration is always a promise, never a box.',
    },
    {
      kind: 'predict',
      prompt: 'Both files compile cleanly on their own with `gcc -Wall -Wextra -Werror -c`. What happens at `gcc words.o main.o -o main`?',
      code: {
        language: 'c',
        source: String.raw`/* ---- words.c ---- */
#include <string.h>

static int count_spaces(const char *s) {
    int n = 0;
    for (; *s != '\0'; s++) {
        if (*s == ' ') {
            n++;
        }
    }
    return n;
}

int count_words(const char *s) {
    if (strlen(s) == 0) {
        return 0;
    }
    return count_spaces(s) + 1;
}

/* ---- main.c ---- */
#include <stdio.h>

int count_words(const char *s);
int count_spaces(const char *s);

int main(void) {
    printf("%d\n", count_words("a b c"));
    printf("%d\n", count_spaces("a b c"));
    return 0;
}`,
      },
      choices: [
        'Linker error: undefined reference to count_spaces',
        'It links and prints 3 then 2',
        'Compiler error in main.c: count_spaces is static',
        'It links, but count_spaces returns garbage',
      ],
      answer: 'Linker error: undefined reference to count_spaces',
      explanation: 'main.c declares count_spaces, so its compiler is satisfied: a prototype is a promise, and promises are checked later. words.c defines count_spaces as static, so its name is kept out of words.o. When the linker tries to connect main.o\'s call to a definition it finds none. count_words is fine: it is not static, and it may call count_spaces because they share a file.',
    },
    {
      kind: 'concept',
      title: 'make: rebuild only what changed',
      body: `Typing three gcc commands after every edit is how projects stop being fun. \`make\` reads a file called \`Makefile\` made of **rules**: a target, the files it depends on, and the recipe that produces it. Before running a recipe, make compares timestamps: if every prerequisite is older than the target, the target is up to date and nothing happens.

Dependencies chain. \`main\` depends on the object files; each object file depends on its \`.c\` file **and** the header it includes. Edit \`vault.c\` and only \`vault.o\` is recompiled before the final link. Edit \`vault.h\` and both objects are rebuilt, because both include it. Forgetting the header in a rule is the classic Makefile bug: you change a struct, one file is not recompiled, and the two halves of the program disagree about the size of a record.

Two details trip everyone: the recipe line must begin with a real **tab**, not spaces, and a target such as \`clean\` that names no file always runs when asked. Type \`make\` to build and \`make clean\` to start fresh.`,
      example: {
        language: 'shell',
        source: 'main: main.o vault.o\n\tgcc -Wall -Wextra -Werror main.o vault.o -o main\n\nmain.o: main.c vault.h\n\tgcc -Wall -Wextra -Werror -c main.c\n\nvault.o: vault.c vault.h\n\tgcc -Wall -Wextra -Werror -c vault.c\n\nclean:\n\trm -f main main.o vault.o',
        labels: [
          { lines: [1, 2], label: 'The first rule is the default. main is built from the two objects; the recipe (tab-indented) links them.' },
          { lines: [4, 5], label: 'main.o is out of date whenever main.c or vault.h is newer than it.' },
          { lines: [7, 8], label: 'Same for vault.o. Listing vault.h here is what makes a header edit rebuild both halves.' },
          { lines: [10, 11], label: 'A target that is not a file: make clean always runs its recipe.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python had no build step, so nothing like make was needed: edit, run. The nearest thing you met was `python -m pip install -r requirements.txt`, which also does nothing when everything is already in place.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The project was fully built a minute ago. You edit `vault.c` only and type `make`. Which commands run?',
      code: {
        language: 'shell',
        source: 'main: main.o vault.o\n\tgcc -Wall -Wextra -Werror main.o vault.o -o main\n\nmain.o: main.c vault.h\n\tgcc -Wall -Wextra -Werror -c main.c\n\nvault.o: vault.c vault.h\n\tgcc -Wall -Wextra -Werror -c vault.c',
      },
      choices: [
        'gcc ... -c vault.c, then the link line',
        'All three gcc lines',
        'Only the link line',
        "make: 'main' is up to date.",
      ],
      answer: 'gcc ... -c vault.c, then the link line',
      explanation: 'make starts at main and checks its prerequisites. main.o is newer than main.c and vault.h, so it is left alone. vault.o is older than vault.c, so its recipe runs. Now main is older than the fresh vault.o, so the link runs too. Two commands, not three, and not zero.',
    },
    {
      kind: 'create',
      prompt: `Write a program that treats every command-line argument as a whole-number amount and prints three lines: \`Count: <how many arguments>\`, \`Total: <their sum>\`, \`Negative: <how many were below zero>\`.

- Put the parsing in a \`static\` helper \`parse_amount(const char *text, long *out)\` that returns 1 for a clean number and 0 otherwise, and the printing in a \`static\` helper \`report(...)\`. \`main\` only loops and counts.
- A non-number is reported on stderr with return 1.
- With no arguments all three counts are 0.

The runner builds one file, so the helpers stay here; in a project they would move to \`amounts.c\` with an \`amounts.h\`, and \`static\` is what tells a reader (and the linker) that they are not meant to be called from anywhere else.`,
      language: 'c',
      tests: [
        { description: 'mixed amounts', argv: ['10', '-5', '20', '-1'], expectedStdout: 'Count: 4\nTotal: 24\nNegative: 2' },
        { description: 'no arguments', argv: [], expectedStdout: 'Count: 0\nTotal: 0\nNegative: 0' },
        { description: 'a single expense', argv: ['-300'], expectedStdout: 'Count: 1\nTotal: -300\nNegative: 1' },
      ],
      hint: 'parse_amount is the strtol-and-check-end pattern from 8-1, writing through the out pointer. report is three printf lines. main: for i from 1 to argc, parse, add, count negatives, then report(argc - 1, total, negative).',
      solution: staticHelpersSolution,
      projectNote: 'Vault v1.0 is written with static helpers for every verb, so that splitting it into vault.c and main.c later is a cut-and-paste, not a rewrite.',
    },
  ],
};

/* ---------------------------- 8-3 --------------------------------- */

const warnExample = String.raw`#include <stdio.h>

int main(void) {
    int amount;
    int count = 0;
    long total = 0;
    if (scanf("%d", &amount) == 1) {
        total += amount;
    }
    printf("Total: %d\n", total);
    return 0;
}`;

const gccOutput = `warn.c: In function 'main':
warn.c:10:21: error: format '%d' expects argument of type 'int', but argument 2 has type 'long int' [-Werror=format=]
   10 |     printf("Total: %d\\n", total);
      |                    ~^     ~~~~~
      |                     |     |
      |                     int   long int
      |                    %ld
warn.c:5:9: error: unused variable 'count' [-Werror=unused-variable]
    5 |     int count = 0;
      |         ^~~~~
cc1: all warnings being treated as errors`;

const gdbSession = `$ gcc -g -Wall -Wextra -Werror main.c -o main
$ gdb -q ./main
(gdb) break total
Breakpoint 1 at 0x13a3: file main.c, line 38.
(gdb) run
Breakpoint 1, total (items=0x55555555a490, n=3) at main.c:38
38          int sum = 0;
(gdb) next
39          for (int i = 0; i < n; i++) {
(gdb) next
40              sum += items[i].amount;
(gdb) print i
$1 = 0
(gdb) print items[i].amount
$2 = -800
(gdb) print n
$3 = 3
(gdb) bt
#0  total (items=0x55555555a490, n=3) at main.c:40
#1  0x0000555555555446 in main () at main.c:49
(gdb) continue
Records: 3
Total: 1670
[Inferior 1 (process 4257) exited normally]`;

const asanExample = String.raw`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *amounts = malloc(3 * sizeof *amounts);
    int total = 0;
    amounts[0] = 10;
    amounts[1] = 20;
    amounts[2] = 30;
    for (int i = 0; i <= 3; i++) {
        total += amounts[i];
    }
    printf("Total: %d\n", total);
    free(amounts);
    return 0;
}`;

const loadTotalStarter = String.raw`#include <stdio.h>
#include <stdlib.h>

struct Record {
    char name[8];
    int amount;
};

static int load(const char *path, struct Record **out) {
    FILE *f = fopen(path, "r");
    struct Record *items = NULL;
    struct Record r;
    int n = 0;
    int cap = 0;
    if (f == NULL) {
        *out = NULL;
        return 0;
    }
    while (fscanf(f, "%31s %d", r.name, &r.amount) == 2) {
        if (n == cap) {
            cap = cap == 0 ? 4 : cap * 2;
            items = realloc(items, (size_t)cap * sizeof *items);
            if (items == NULL) {
                fclose(f);
                *out = NULL;
                return 0;
            }
        }
        items[n] = r;
        n++;
    }
    fclose(f);
    *out = items;
    return n;
}

static int total(const struct Record *items, int n) {
    int sum = 0;
    for (int i = 0; i < n - 1; i++) {
        sum += items[i].amount;
    }
    return sum;
}

int main(void) {
    struct Record *items;
    int n = load("vault.txt", &items);
    printf("Records: %d\n", n);
    printf("Total: %d\n", total(items, n));
    free(items);
    return 0;
}
`;

const loadTotalSolution = loadTotalStarter.replace('char name[8];', 'char name[32];').replace('i < n - 1; i++', 'i < n; i++');

const lookupSolution = String.raw`#include <stdio.h>
#include <stdlib.h>

#define COUNT 4

static int lookup(const int *amounts, int count, long index, int *out) {
    if (index < 0 || index >= count) {
        return 0;
    }
    *out = amounts[index];
    return 1;
}

int main(int argc, char *argv[]) {
    int amounts[COUNT] = {10, 20, 30, 40};
    for (int i = 1; i < argc; i++) {
        char *end;
        long index = strtol(argv[i], &end, 10);
        int value;
        if (*end != '\0' || argv[i][0] == '\0') {
            printf("Not an index: %s\n", argv[i]);
        } else if (lookup(amounts, COUNT, index, &value)) {
            printf("%d\n", value);
        } else {
            printf("Index %ld out of range\n", index);
        }
    }
    return 0;
}
`;

const l83: Lesson = {
  id: 'c-8-3',
  title: 'Finding the bug',
  objective: 'Read compiler warnings as instructions, step through a program with gdb, and let AddressSanitizer catch memory errors.',
  minutes: 24,
  lexicon: [
    { id: 'c.8.werror', term: '-Wall -Wextra -Werror', kind: 'concept', meaning: 'Ask gcc for its full set of warnings and refuse to produce a program while any remain. A warning is the compiler noticing that your code is legal but probably not what you meant; treating it as an error means you fix it now instead of debugging it later.', example: 'gcc -Wall -Wextra -Werror main.c -o main', analogy: 'A proofreader who will not hand back the manuscript while a sentence is ambiguous. The analogy breaks because a clean compile proves only that the compiler found nothing; sanitizers and tests find the rest.' },
    { id: 'c.8.gdb', term: 'gdb: break, run, next, print, bt', kind: 'concept', meaning: 'The GNU debugger runs your program under supervision. break stops at a function or line, run starts, next executes one line, print shows any variable or expression, bt (backtrace) lists the chain of calls that led here. Compile with -g so it knows your names and line numbers.', example: '$ gcc -g main.c -o main\n$ gdb ./main\n(gdb) break total\n(gdb) run\n(gdb) next\n(gdb) print items[i].amount\n(gdb) bt' },
    { id: 'c.8.asan', term: '-fsanitize=address', kind: 'concept', meaning: 'AddressSanitizer: a compile flag that instruments every memory access so that reading or writing outside an array, using memory after free, or leaking it is reported with a stack trace the first time it happens, instead of silently corrupting something.', example: 'gcc -g -fsanitize=address main.c -o main && ./main\n# ERROR: AddressSanitizer: heap-buffer-overflow ... READ of size 4' },
    { id: 'c.8.off-by-one', term: 'off-by-one', kind: 'concept', meaning: 'A loop that runs once too often (i <= n reads past the end) or once too few (i < n - 1 skips the last element). The first is undefined behaviour the sanitizer catches; the second is quietly wrong output, so only a test catches it.', example: 'for (int i = 0; i < n; i++)   /* visits exactly n items */' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The compiler already told you',
      body: `Debugging in C starts before the program runs. Every test in this track compiles with \`-Wall -Wextra -Werror\`, and that is not pedantry: most of what the compiler warns about is a bug you have not met yet. A warning names the **file, line and column**, says what it saw, and often says what it wanted. Read it as an instruction.

The example compiles without those flags and prints a wrong total. With them, gcc refuses, and its output (quoted in the next step) says two things. Line 10, column 21: the \`%d\` expects an \`int\` but \`total\` is a \`long int\`; it even suggests \`%ld\`. Line 5: \`count\` is never used, which usually means you forgot to use it or forgot to delete it.

The habit: compile with the flags on, fix the first message, recompile. Later messages are often consequences of the first. A warning you do not understand is a question for the lexicon, not something to cast away: \`(int)total\` silences the compiler and keeps the bug.`,
      example: {
        language: 'c',
        source: warnExample,
        labels: [
          { lines: [4, 6], label: 'Three boxes. count is declared and never used: the compiler will say so.' },
          { lines: [7, 9], label: 'The scanf return value is checked, so no warning here.' },
          { lines: [10, 10], label: '%d with a long: the format and the argument disagree. Legal C, wrong output, and exactly what -Wformat exists for.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python reports a type problem at the moment it happens, with a traceback. C reports what it can at compile time and says nothing at run time, so the compile-time report is the one you get. The trimmed tracebacks you read in the Python track are replaced here by gcc\'s file:line:column.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'This is the full output of `gcc -Wall -Wextra -Werror warn.c` for the program above. What does it want you to do?',
      code: { language: 'text', source: gccOutput },
      choices: [
        'Print total with %ld (or make total an int), and delete or use count',
        'Add a cast: printf("Total: %d\\n", (int)total)',
        'Drop -Werror; these are only warnings',
        'Initialise amount to 0 before the scanf',
      ],
      answer: 'Print total with %ld (or make total an int), and delete or use count',
      explanation: 'The first message draws the mismatch and writes the fix under it: %ld. The second names an unused variable on line 5. The cast would compile but would still print a truncated value for large totals, which is the very bug the warning predicts. amount is only used when scanf succeeded, so gcc does not complain about it.',
    },
    {
      kind: 'concept',
      title: 'Watching it run: gdb',
      body: `When the program compiles cleanly and still prints the wrong thing, stop guessing and watch it. Compile with \`-g\` so the binary carries your variable names and line numbers, then start it under \`gdb\`.

Five commands do most of the work. \`break total\` stops when that function is entered. \`run\` starts the program. \`next\` executes one line and shows the next. \`print\` evaluates any expression in the current frame: a variable, \`items[i].amount\`, \`n - 1\`. \`bt\` prints the **backtrace**: the stack of calls that brought you here, newest first, which is the notional-machine stack from Module 3 made visible. \`continue\` runs on to the next breakpoint or the end.

The session below is real output from the program you will fix in this lesson, after the fix. Notice that gdb shows the line **about to run**, not the one just finished, and that \`print\` works on expressions, not just names.`,
      example: {
        language: 'shell',
        source: gdbSession,
        labels: [
          { lines: [1, 2], label: 'Build with -g, then start the debugger on the binary.' },
          { lines: [3, 4], label: 'A breakpoint on a function name: stop whenever total is entered.' },
          { lines: [5, 7], label: 'run starts the program; it halts at the first line of total and shows the arguments.' },
          { lines: [8, 11], label: 'next twice: into the loop body. The line shown has not executed yet.' },
          { lines: [12, 17], label: 'print on a variable and on an expression. The first record is rent, -800.' },
          { lines: [18, 20], label: 'bt: the call stack. Frame 0 is total; frame 1 is the main that called it, at line 49.' },
          { lines: [21, 24], label: 'continue finishes the run. The totals come out right.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python\'s `breakpoint()` drops you into pdb with the same ideas: n for next, p for print, w for the stack. gdb is the same tool for compiled code, and it needs -g because without it the binary has forgotten your names.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Compiled with `gcc -g -fsanitize=address` and run. What happens?',
      code: { language: 'c', source: asanExample },
      choices: [
        'AddressSanitizer: heap-buffer-overflow, READ of size 4, 0 bytes after a 12-byte region, at line 11',
        'It prints Total: 60 and exits normally',
        'AddressSanitizer: 12 bytes leaked',
        'Compiler error: index 3 is out of bounds',
      ],
      answer: 'AddressSanitizer: heap-buffer-overflow, READ of size 4, 0 bytes after a 12-byte region, at line 11',
      explanation: 'Three ints are 12 bytes; `i <= 3` reads a fourth. The compiler cannot know that at compile time, and without the sanitizer the program may well print Total: 60 and look fine, because whatever sits after the block happens to be zero. The sanitizer sees the read land 0 bytes past the end of the 12-byte region and reports the line, the size, and where the block was allocated. The memory is freed, so there is no leak.',
    },
    {
      kind: 'modify',
      prompt: `A teammate ran this program on their laptop under \`-fsanitize=address\` with a normal \`vault.txt\` and got, in part:

- \`ERROR: AddressSanitizer: stack-buffer-overflow ... WRITE of size 32\`
- \`#3 in load main.c:19\`
- \`[32, 44) 'r' (line 12) <== Memory access at offset 44 overflows this variable\`

Line 19 is the \`fscanf\`; \`r\` is the \`struct Record\` it fills. Then, with a three-record file, the test expected \`Total: 1670\` and got \`Total: 1700\`.

Fix both. Keep the \`%31s\` (it is the right width for a 32-byte name) and change nothing about the output format.`,
      language: 'c',
      starter: loadTotalStarter,
      tests: [
        { description: 'three records', files: { 'vault.txt': 'rent -800\nsalary 2500\nfood -30\n' }, expectedStdout: 'Records: 3\nTotal: 1670' },
        { description: 'one record', files: { 'vault.txt': 'gift 100\n' }, expectedStdout: 'Records: 1\nTotal: 100' },
        { description: 'no file', expectedStdout: 'Records: 0\nTotal: 0' },
      ],
      hint: 'The sanitizer says a 32-byte write does not fit in r: compare the width in %31s with the size of name. The wrong total is 30 short of the right one, and -30 is the last record: look at the loop bound in total.',
      solution: loadTotalSolution,
    },
    {
      kind: 'create',
      prompt: `C never checks an index for you, so write the check yourself. The program holds \`int amounts[4] = {10, 20, 30, 40}\` and treats each command-line argument as an index.

- A \`static\` function \`lookup(const int *amounts, int count, long index, int *out)\` returns 1 and stores the value when the index is in range, 0 otherwise. It must never read outside the array.
- For each argument: a clean number in range prints the amount; a number out of range prints \`Index <i> out of range\`; anything that is not a number prints \`Not an index: <text>\`.
- No arguments: print nothing and return 0.`,
      language: 'c',
      tests: [
        { description: 'two hits and a miss', argv: ['0', '2', '9'], expectedStdout: '10\n30\nIndex 9 out of range' },
        { description: 'last, negative, junk', argv: ['3', '-1', 'x'], expectedStdout: '40\nIndex -1 out of range\nNot an index: x' },
        { description: 'nothing asked', argv: [], expectedStdout: '' },
      ],
      hint: 'The range test is `index < 0 || index >= count`. Convert with strtol and check *end before you even call lookup; a negative index must be rejected by the range test, not by the parser.',
      solution: lookupSolution,
      projectNote: 'Every Vault loop is `i < count`, and every index that comes from outside is checked before it touches memory. Run v1.0 under -fsanitize=address on your own machine: a clean run is part of the definition of done.',
    },
  ],
};

/* ---------------------------- 8-4 --------------------------------- */

const wordfreq = String.raw`#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define MAX_WORDS 1000
#define MAX_LEN 32
struct Entry {
    char word[MAX_LEN];
    int count;
};

static void lowercase(char *s) {
    for (; *s != '\0'; s++) {
        *s = (char)tolower((unsigned char)*s);
    }
}

static struct Entry *find(struct Entry *table, int n, const char *word) {
    for (int i = 0; i < n; i++) {
        if (strcmp(table[i].word, word) == 0) {
            return &table[i];
        }
    }
    return NULL;
}

static int add_word(struct Entry *table, int n, const char *word) {
    struct Entry *e = find(table, n, word);
    if (e != NULL) {
        e->count++;
        return n;
    }
    if (n == MAX_WORDS) {
        return n;
    }
    snprintf(table[n].word, MAX_LEN, "%s", word);
    table[n].count = 1;
    return n + 1;
}

static int by_count_desc(const void *a, const void *b) {
    const struct Entry *x = a;
    const struct Entry *y = b;
    if (x->count != y->count) {
        return y->count - x->count;
    }
    return strcmp(x->word, y->word);
}

int main(void) {
    struct Entry table[MAX_WORDS];
    char word[MAX_LEN];
    int n = 0;
    FILE *f = fopen("words.txt", "r");
    if (f == NULL) {
        fprintf(stderr, "Cannot open words.txt\n");
        return 1;
    }
    while (fscanf(f, "%31s", word) == 1) {
        lowercase(word);
        n = add_word(table, n, word);
    }
    fclose(f);
    qsort(table, (size_t)n, sizeof table[0], by_count_desc);
    for (int i = 0; i < n; i++) {
        printf("%s %d\n", table[i].word, table[i].count);
    }
    printf("Distinct: %d\n", n);
    return 0;
}
`;

const wordfreqBuggy = wordfreq
  .replace('tolower((unsigned char)*s)', 'toupper((unsigned char)*s)')
  .replace('return strcmp(x->word, y->word);', 'return strcmp(y->word, x->word);');

const wordfreqWithMinimum = wordfreq
  .replace('int main(void) {', 'int main(int argc, char *argv[]) {\n    long minimum = 1;')
  .replace(
    '    FILE *f = fopen("words.txt", "r");\n    if (f == NULL) {',
    String.raw`    FILE *f = fopen("words.txt", "r");
    if (argc == 2) {
        char *end;
        minimum = strtol(argv[1], &end, 10);
        if (*end != '\0' || argv[1][0] == '\0') {
            fprintf(stderr, "Not a number: %s\n", argv[1]);
            return 1;
        }
    }
    if (f == NULL) {`,
  )
  .replace(
    String.raw`    for (int i = 0; i < n; i++) {
        printf("%s %d\n", table[i].word, table[i].count);
    }`,
    String.raw`    for (int i = 0; i < n; i++) {
        if (table[i].count >= minimum) {
            printf("%s %d\n", table[i].word, table[i].count);
        }
    }`,
  );

const l84: Lesson = {
  id: 'c-8-4',
  title: "Reading other people's code",
  objective: 'Find your way around an unfamiliar C program, fix a bug in it from a failing-test report, and extend it without breaking what works.',
  minutes: 28,
  lexicon: [
    { id: 'c.8.reading-order', term: 'reading order', kind: 'concept', meaning: 'How to read C you did not write: main first, for the plan; then the function signatures as a table of contents; then the struct, because every function is about it; then the body of the one function you need to change. #defines and includes last, only when a name is unexplained.', example: '/* 1. main()  2. the static int ...(...) lines\n   3. struct Entry  4. one body at a time */', analogy: 'A map before a street: you find the district, then the road, and only then read the house numbers. It breaks for code with a single giant main, where there is no map and you must trace it line by line.' },
    { id: 'c.8.define', term: '#define MAX_LEN 32', kind: 'keyword', meaning: 'A preprocessor constant: before compiling, every MAX_LEN in the file is replaced by 32. There is no box and no type, which is why the convention is CAPITALS. Use it for sizes that several places must agree on.', example: '#define MAX_WORDS 1000\nstruct Entry table[MAX_WORDS];' },
    { id: 'c.8.qsort', term: 'qsort(array, n, sizeof array[0], compare)', kind: 'builtin', meaning: 'Sort any array in place. You pass where it starts, how many elements, how big each is, and a comparison function; qsort knows nothing about your type, which is why the last two are needed.', example: 'qsort(table, (size_t)n, sizeof table[0], by_count_desc);' },
    { id: 'c.8.comparator', term: 'int cmp(const void *a, const void *b)', kind: 'pattern', meaning: 'The function qsort calls to order two elements. It receives pointers to anything (const void *), so the first lines convert them back to your type. Return negative to put a first, positive for b first, 0 for equal.', example: 'static int by_amount(const void *a, const void *b) {\n    const struct Record *x = a;\n    const struct Record *y = b;\n    return x->amount - y->amount;\n}', analogy: 'A referee who is handed two sealed envelopes: the referee must open them (the conversion) before judging. The analogy breaks for the subtraction trick, which overflows for very large or very negative values; compare with < and > when the numbers can be extreme.' },
    { id: 'c.8.snprintf', term: 'snprintf(buf, size, "%s", src)', kind: 'builtin', meaning: 'Format into a buffer of a known size, never writing past it and always leaving a terminator. The safe way to copy a string into a fixed array; strcpy has no size and trusts you.', example: 'snprintf(table[n].word, MAX_LEN, "%s", word);' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Start at main, then read the names',
      body: `Most C you will meet was written by someone else, and some of it uses things you have not seen. The skill is to find the plan without reading every line.

Read in this order. **First**, \`main\`: the whole program in a dozen lines, usually open, loop, process, report. **Second**, the function signatures, skipping the bodies: they are the table of contents, and \`static\` tells you they are this file's private helpers. **Third**, the \`struct\`, because every function takes a pointer to it. **Only then** a body, and only the one you need. \`#define\` lines and includes are read last, when a name is unexplained.

The program below counts how often each word appears in \`words.txt\`, most frequent first. It uses four things that may be new: \`#define\` constants, \`snprintf\` as a safe copy, \`qsort\`, and the \`const void *\` comparison function qsort demands. The labels explain each, but notice that after reading \`main\` you could already say what the program does.`,
      example: {
        language: 'c',
        source: wordfreq.trimEnd(),
        labels: [
          { lines: [1, 4], label: 'ctype.h for tolower; stdlib for qsort; string for strcmp. Read these last.' },
          { lines: [5, 6], label: '#define: a name for a size, replaced by text before compiling. No box, no type, hence the capitals.' },
          { lines: [7, 10], label: 'The record every function works on: a word and how often it was seen. Read this third.' },
          { lines: [12, 16], label: 'Normalise a word in place. The unsigned char cast is required by tolower\'s contract; the (char) cast puts the result back.' },
          { lines: [18, 25], label: 'Pointer-or-NULL as "found or not": returns the address of the matching entry so the caller can change it.' },
          { lines: [27, 39], label: 'Either bump the existing count or append a new entry (if there is room). snprintf copies at most MAX_LEN - 1 characters and terminates. Returns the new count of entries.' },
          { lines: [41, 48], label: 'The comparison qsort calls. const void * means "pointer to anything"; the first two lines say what it really is. Higher count first; ties alphabetical.' },
          { lines: [50, 58], label: 'Read this first. The table lives on the stack; open the input and fail loudly if it is missing.' },
          { lines: [59, 63], label: 'One word at a time, lowered, counted. %31s keeps every word inside its 32-byte box.' },
          { lines: [64, 69], label: 'Sort, then report in the sorted order, then the number of distinct words.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'In the Python importer you read the main guard first and the tests second; here the tests live outside the file, so the fixture and the expected output in the checks are your worked examples. `sorted(..., key=...)` becomes qsort with a comparison function, and `defaultdict(int)` becomes a hand-written find-or-append.' },
      ],
    },
    {
      kind: 'predict',
      prompt: '`words.txt` contains `the cat the dog The`. What does the program print?',
      code: {
        language: 'c',
        source: String.raw`static int by_count_desc(const void *a, const void *b) {
    const struct Entry *x = a;
    const struct Entry *y = b;
    if (x->count != y->count) {
        return y->count - x->count;
    }
    return strcmp(x->word, y->word);
}

/* in main, after the read loop: */
    qsort(table, (size_t)n, sizeof table[0], by_count_desc);
    for (int i = 0; i < n; i++) {
        printf("%s %d\n", table[i].word, table[i].count);
    }
    printf("Distinct: %d\n", n);`,
      },
      choices: [
        'the 3\ncat 1\ndog 1\nDistinct: 3',
        'the 2\ncat 1\ndog 1\nThe 1\nDistinct: 4',
        'cat 1\ndog 1\nthe 3\nDistinct: 3',
        'the 3\ndog 1\ncat 1\nDistinct: 3',
      ],
      answer: 'the 3\ncat 1\ndog 1\nDistinct: 3',
      explanation: 'lowercase runs on every word before it is counted, so The and the are one entry with count 3. The comparator returns y->count - x->count: a positive number when x has the smaller count, which puts the larger count first. cat and dog tie on count, so strcmp(x->word, y->word) orders them alphabetically.',
    },
    {
      kind: 'modify',
      prompt: `A colleague changed this file and two checks now fail:

- with \`the cat the dog The\`: expected \`the 3\` on the first line, got \`THE 3\`
- with \`Rent rent food Salary food rent\`: expected \`food 2\` before \`salary 1\`, and in a tie expected alphabetical order; words in equal-count groups come out reversed

Find the two edits and undo them. Do not change \`main\` or the output format.`,
      language: 'c',
      starter: wordfreqBuggy,
      tests: [
        { description: 'case is folded and ties are alphabetical', files: { 'words.txt': 'the cat the dog The\n' }, expectedStdout: 'the 3\ncat 1\ndog 1\nDistinct: 3' },
        { description: 'descending by count', files: { 'words.txt': 'Rent rent food Salary food rent\n' }, expectedStdout: 'rent 3\nfood 2\nsalary 1\nDistinct: 3' },
        { description: 'empty file', files: { 'words.txt': '' }, expectedStdout: 'Distinct: 0' },
      ],
      hint: 'Uppercase output points at the one function that changes letters. Reversed ties point at the one line of the comparator that handles equal counts: which argument is x and which is y?',
      solution: wordfreq,
    },
    {
      kind: 'create',
      prompt: `Add a feature without breaking the existing output.

- Accept an optional command-line argument: \`main 2\` prints only words that appear at least 2 times. Convert it with \`strtol\`; a non-number is reported on stderr with return 1.
- With no argument, the output is exactly what it was.
- \`Distinct: <n>\` still counts **all** distinct words, filtered or not.

Change \`main\` only; the helpers are already right.`,
      language: 'c',
      starter: wordfreq,
      tests: [
        { description: 'no argument: unchanged', files: { 'words.txt': 'Rent rent food Salary food rent\n' }, expectedStdout: 'rent 3\nfood 2\nsalary 1\nDistinct: 3' },
        { description: 'minimum 2', argv: ['2'], files: { 'words.txt': 'Rent rent food Salary food rent\n' }, expectedStdout: 'rent 3\nfood 2\nDistinct: 3' },
        { description: 'minimum above every count', argv: ['5'], files: { 'words.txt': 'a b\n' }, expectedStdout: 'Distinct: 2' },
      ],
      hint: 'Change main\'s signature, add `long minimum = 1;`, set it from argv[1] when argc == 2, and wrap the printf in the report loop with `if (table[i].count >= minimum)`. The Distinct line is outside that loop and stays as it is.',
      solution: wordfreqWithMinimum,
      projectNote: 'The checks are what make someone else\'s code safe to change: they tell "I extended it" from "I broke it". Vault v1.0 ships with the same kind of fixture-driven checks.',
    },
  ],
};

/* ---------------------------- 8-5 --------------------------------- */

const vaultV10 = String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define VAULT_FILE "vault.txt"

struct Record {
    char name[32];
    int amount;
};

struct Vault {
    struct Record *items;
    int count;
    int capacity;
};

static void usage(void) {
    fprintf(stderr, "Usage: main add|list|total|find\n");
}

static int push(struct Vault *v, struct Record r) {
    if (v->count == v->capacity) {
        int cap = v->capacity == 0 ? 4 : v->capacity * 2;
        struct Record *p = realloc(v->items, (size_t)cap * sizeof *p);
        if (p == NULL) {
            return 0;
        }
        v->items = p;
        v->capacity = cap;
    }
    v->items[v->count] = r;
    v->count++;
    return 1;
}

static void load(struct Vault *v) {
    FILE *f = fopen(VAULT_FILE, "r");
    struct Record r;
    if (f == NULL) {
        return;
    }
    while (fscanf(f, "%31s %d", r.name, &r.amount) == 2) {
        if (!push(v, r)) {
            break;
        }
    }
    fclose(f);
}

static int parse_amount(const char *text, int *out) {
    char *end;
    long n = strtol(text, &end, 10);
    if (text[0] == '\0' || *end != '\0') {
        return 0;
    }
    *out = (int)n;
    return 1;
}

static int cmd_add(const char *name, const char *text) {
    int amount;
    FILE *f;
    if (strlen(name) > 31 || !parse_amount(text, &amount)) {
        usage();
        return 1;
    }
    f = fopen(VAULT_FILE, "a");
    if (f == NULL) {
        fprintf(stderr, "Cannot write %s\n", VAULT_FILE);
        return 1;
    }
    fprintf(f, "%s %d\n", name, amount);
    fclose(f);
    printf("Added %s %d\n", name, amount);
    return 0;
}

static void cmd_list(const struct Vault *v) {
    for (int i = 0; i < v->count; i++) {
        printf("%s: %d\n", v->items[i].name, v->items[i].amount);
    }
    printf("Records: %d\n", v->count);
}

static void cmd_total(const struct Vault *v) {
    int total = 0;
    for (int i = 0; i < v->count; i++) {
        total += v->items[i].amount;
    }
    printf("Total: %d\n", total);
}

static void cmd_find(const struct Vault *v, const char *name) {
    for (int i = 0; i < v->count; i++) {
        if (strcmp(v->items[i].name, name) == 0) {
            printf("%s: %d\n", v->items[i].name, v->items[i].amount);
            return;
        }
    }
    printf("Not found\n");
}

int main(int argc, char *argv[]) {
    struct Vault v = {NULL, 0, 0};
    int status = 0;
    if (argc < 2) {
        usage();
        return 1;
    }
    if (strcmp(argv[1], "add") == 0 && argc == 4) {
        return cmd_add(argv[2], argv[3]);
    }
    load(&v);
    if (strcmp(argv[1], "list") == 0 && argc == 2) {
        cmd_list(&v);
    } else if (strcmp(argv[1], "total") == 0 && argc == 2) {
        cmd_total(&v);
    } else if (strcmp(argv[1], "find") == 0 && argc == 3) {
        cmd_find(&v, argv[2]);
    } else {
        usage();
        status = 1;
    }
    free(v.items);
    return status;
}
`;

const vaultV10Starter = String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define VAULT_FILE "vault.txt"

struct Record {
    char name[32];
    int amount;
};

struct Vault {
    struct Record *items;
    int count;
    int capacity;
};

/* From v0.7: grow the heap array and append one record. Returns 0 if memory ran out. */
static int push(struct Vault *v, struct Record r) {
    if (v->count == v->capacity) {
        int cap = v->capacity == 0 ? 4 : v->capacity * 2;
        struct Record *p = realloc(v->items, (size_t)cap * sizeof *p);
        if (p == NULL) {
            return 0;
        }
        v->items = p;
        v->capacity = cap;
    }
    v->items[v->count] = r;
    v->count++;
    return 1;
}

/* From v0.7: read every "<name> <amount>" line of vault.txt, if the file exists. */
static void load(struct Vault *v) {
    FILE *f = fopen(VAULT_FILE, "r");
    struct Record r;
    if (f == NULL) {
        return;
    }
    while (fscanf(f, "%31s %d", r.name, &r.amount) == 2) {
        if (!push(v, r)) {
            break;
        }
    }
    fclose(f);
}

/* TODO: usage(), parse_amount(), cmd_add(), cmd_list(), cmd_total(), cmd_find(), and a main that dispatches on argv[1]. */

int main(int argc, char *argv[]) {
    struct Vault v = {NULL, 0, 0};
    (void)argc;
    (void)argv;
    load(&v);
    free(v.items);
    return 0;
}
`;

const l85: Lesson = {
  id: 'c-8-5',
  title: 'Project: Vault v1.0',
  objective: 'Ship Vault as a command-line tool with add, list, total and find verbs over vault.txt, with usage and exit status for everything else.',
  minutes: 30,
  lexicon: [
    { id: 'c.8.contract', term: 'I/O contract', kind: 'concept', meaning: 'The exact verbs a program accepts and the exact lines it prints for each, written down before the code. Tests check the contract, so a change to it is a decision, never an accident.', example: '/* main total        -> Total: <t>\n   main find <name>  -> <name>: <amount>  or  Not found */' },
    { id: 'c.8.fixture', term: 'fixture', kind: 'concept', meaning: 'A known starting state, here a vault.txt with specific lines, created before the program runs so the expected output can be stated exactly. The same program is tested with a fixture and with no file at all.', example: '/* fixture vault.txt:\n   rent -800\n   salary 2500\n   -> main total prints Total: 1700 */', analogy: 'The set of a play, built identically before every performance. It breaks for state you cannot control, like the clock or the network; keep those out of what you test.' },
    { id: 'c.8.exit-status', term: 'exit status', kind: 'concept', meaning: 'The int main returns, visible to the shell as $?. 0 means success; anything else means failure, and scripts and test runners stop on it. Vault returns 1 for misuse and prints the reason on stderr.', example: '$ ./main frobnicate\nUsage: main add|list|total|find\n$ echo $?\n1' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The whole program, function by function',
      body: `Vault v1.0 is v0.7 with a command line in front. The record, the growable array and the loader are unchanged; that is the payoff of keeping data and interaction apart. Each run of the program does **one** thing and exits, so every verb except \`add\` starts by loading the file, and \`add\` appends one line without loading at all.

The **contract** you will be tested against:

- \`main add <name> <amount>\` appends \`<name> <amount>\` to \`vault.txt\` and prints \`Added <name> <amount>\`
- \`main list\` prints \`<name>: <amount>\` per record in file order, then \`Records: <n>\`
- \`main total\` prints \`Total: <t>\`
- \`main find <name>\` prints \`<name>: <amount>\` for the first match, or \`Not found\`
- no verb, an unknown verb, or the wrong number of operands prints \`Usage: main add|list|total|find\` on **stderr** and returns 1

With no \`vault.txt\`, \`list\` prints \`Records: 0\` and \`total\` prints \`Total: 0\`. Read the example from \`main\` upwards: dispatch first, the four verbs, the parser, and the v0.7 pieces last because you wrote them. Every helper is \`static\`; \`vault.c\` and \`main.c\` are one cut away.`,
      example: {
        language: 'c',
        source: vaultV10.trimEnd(),
        labels: [
          { lines: [1, 5], label: 'Standard library only. The file name lives in one #define.' },
          { lines: [7, 16], label: 'Unchanged from v0.7: a record, and a vault that owns a heap array with a count and a capacity.' },
          { lines: [18, 20], label: 'One place that knows the usage line. stderr, so stdout stays clean.' },
          { lines: [22, 35], label: 'Unchanged from v0.7: double the capacity when full, then append.' },
          { lines: [37, 49], label: 'Unchanged from v0.7: a missing file is an empty vault, not an error.' },
          { lines: [51, 59], label: 'Text to int, the strtol way. Returns 0 for an empty string or leftover characters.' },
          { lines: [61, 76], label: 'add: validate, then open for append ("a" creates the file if needed), write one line in the same format load reads, report.' },
          { lines: [78, 83], label: 'list: file order is array order.' },
          { lines: [85, 91], label: 'total: the same loop, summed.' },
          { lines: [93, 101], label: 'find: first match wins and returns early; falling out of the loop means Not found.' },
          { lines: [103, 109], label: 'Read this first. No verb at all is misuse.' },
          { lines: [110, 113], label: 'add never needs the loaded vault, so it is dispatched before load.' },
          { lines: [114, 123], label: 'The read-only verbs, each checked for the right argc. Anything else is misuse, remembered in status.' },
          { lines: [124, 126], label: 'One exit path for the loaded verbs: free, then return the status.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Ledger v1.0 used argparse subcommands and got usage and exit status for free; here `strcmp` on argv[1] plus an argc check per verb does the same job by hand. `with open(path, "a")` is `fopen(VAULT_FILE, "a")` with an explicit `fclose`. There is no selftest verb: the checks live outside the program, as they do for most C tools.' },
      ],
    },
    {
      kind: 'predict',
      prompt: '`vault.txt` contains three lines: `rent -800`, `salary 2500`, `rent -850`. What does `./main find rent` print?',
      code: {
        language: 'c',
        source: String.raw`static void cmd_find(const struct Vault *v, const char *name) {
    for (int i = 0; i < v->count; i++) {
        if (strcmp(v->items[i].name, name) == 0) {
            printf("%s: %d\n", v->items[i].name, v->items[i].amount);
            return;
        }
    }
    printf("Not found\n");
}

/* in main: */
    load(&v);
    if (strcmp(argv[1], "find") == 0 && argc == 3) {
        cmd_find(&v, argv[2]);
    }`,
      },
      choices: ['rent: -800', 'rent: -850', 'rent: -800\nrent: -850', 'rent: -1650'],
      answer: 'rent: -800',
      explanation: 'load appends records in file order, so items[0] is the first rent. The loop compares names from i = 0 upwards, prints the first match and returns from the function immediately; the second rent is never reached, and nothing is summed. Not found is printed only when the loop finishes without returning.',
    },
    {
      kind: 'create',
      prompt: `Write Vault v1.0. The starter is your v0.7 data layer: \`struct Record\`, \`struct Vault\`, \`push\` and \`load\`. Keep them and add the rest.

- \`static void usage(void)\` prints \`Usage: main add|list|total|find\` on stderr.
- \`static int parse_amount(const char *text, int *out)\`: strtol, reject empty text and leftovers.
- \`add <name> <amount>\`: validate (name at most 31 characters, amount a clean number), append \`<name> <amount>\\n\` to \`vault.txt\` opened with \`"a"\`, print \`Added <name> <amount>\`. Do not load first.
- \`list\`, \`total\`, \`find <name>\`: load, then print exactly as the contract says; the first match wins in \`find\`, and no match prints \`Not found\`.
- Anything else: usage on stderr, return 1. Free the vault before every normal exit.

Work in this order: usage and dispatch (every verb printing a stub line), then list, total, find, then add. Run after each.`,
      language: 'c',
      starter: vaultV10Starter,
      tests: [
        { description: 'add creates the file', argv: ['add', 'rent', '-800'], expectedStdout: 'Added rent -800' },
        { description: 'add to an existing file', argv: ['add', 'gift', '100'], files: { 'vault.txt': 'rent -800\nsalary 2500\n' }, expectedStdout: 'Added gift 100' },
        { description: 'list with three records', argv: ['list'], files: { 'vault.txt': 'rent -800\nsalary 2500\nfood -30\n' }, expectedStdout: 'rent: -800\nsalary: 2500\nfood: -30\nRecords: 3' },
        { description: 'list with no file', argv: ['list'], expectedStdout: 'Records: 0' },
        { description: 'total with three records', argv: ['total'], files: { 'vault.txt': 'rent -800\nsalary 2500\nfood -30\n' }, expectedStdout: 'Total: 1670' },
        { description: 'total with no file', argv: ['total'], expectedStdout: 'Total: 0' },
        { description: 'find hit', argv: ['find', 'salary'], files: { 'vault.txt': 'rent -800\nsalary 2500\nfood -30\n' }, expectedStdout: 'salary: 2500' },
        { description: 'find miss is case-sensitive', argv: ['find', 'Salary'], files: { 'vault.txt': 'rent -800\nsalary 2500\nfood -30\n' }, expectedStdout: 'Not found' },
      ],
      hint: 'Dispatch: `if (argc < 2) usage/return 1`; then the add branch (argc == 4) before load; then load, then an if/else-if chain on strcmp(argv[1], ...) with the right argc for each, else usage and status 1; free(v.items) and return status. For add, fopen with "a" and fprintf("%s %d\\n").',
      solution: vaultV10,
      projectNote: 'Vault v1.0 complete: a command-line tool that stores records in a file, reports on them, refuses misuse with a usage line and an exit status, frees what it allocates, and is one cut away from vault.c, main.c and a Makefile. It is ready to hand to someone else.',
    },
  ],
};

export const m8: Module = {
  id: 'c-m8',
  title: 'Building real programs',
  goal: "Command-line arguments, headers and multiple translation units, make, gdb and sanitizers, reading other people's code.",
  projectMilestone: 'Vault v1.0: a multi-file project with a Makefile.',
  status: 'available',
  lessons: [l81, l82, l83, l84, l85],
};
