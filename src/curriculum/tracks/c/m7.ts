import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 7: Files                                                    */
/* ------------------------------------------------------------------ */

/** C source written verbatim: backslashes stay (so `"\n"` inside printf survives), leading newline dropped. */
const c = (s: TemplateStringsArray) => s.raw.join('').replace(/^\n/, '');

/* ------------------------------------------------------------------ */
/* 7-1 FILE* and fopen/fclose                                         */
/* ------------------------------------------------------------------ */

const l71: Lesson = {
  id: 'c-7-1',
  title: 'Opening and closing files',
  objective: 'Open a file in the right mode, check the result, write lines to it and close it.',
  minutes: 20,
  lexicon: [
    { id: 'c.7.file-pointer', term: 'FILE *f', kind: 'pattern', meaning: 'A pointer to an open file. FILE is a struct the library owns (position, buffer, error flags); you never look inside it, you only pass the pointer to the f-functions.', example: 'FILE *f = fopen("vault.txt", "r");' },
    { id: 'c.7.fopen', term: 'fopen(path, mode)', kind: 'builtin', meaning: 'Open the file at path and return a FILE pointer, or NULL if it could not be opened (missing file in "r", no permission, a directory). Always test for NULL before using it.', example: 'FILE *f = fopen("notes.txt", "w");\nif (f == NULL) {\n    printf("Could not open notes.txt\\n");\n    return 1;\n}' },
    { id: 'c.7.modes', term: '"r" / "w" / "a"', kind: 'concept', meaning: 'read: the file must exist. write: create it, or erase it if it exists. append: create it if missing, and add at the end without erasing.', example: 'fopen("log.txt", "a")', analogy: 'A notebook: "r" reads it, "w" tears out every page before you start writing, "a" turns to the first blank page. It breaks here: "w" tears the pages out the moment you open it, even if you then write nothing.' },
    { id: 'c.7.fprintf', term: 'fprintf(f, "...", ...)', kind: 'builtin', meaning: 'printf, but into a file: the FILE pointer comes first, then the format and values exactly as for printf.', example: 'fprintf(f, "%s %d\\n", name, amount);' },
    { id: 'c.7.fclose', term: 'fclose(f)', kind: 'builtin', meaning: 'Flush what is still buffered to disk and release the file. Until fclose, the last lines you wrote may not be on disk at all. One fclose for every successful fopen; never use f afterwards.', example: 'fclose(f);' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A pointer to an open file',
      body: `Everything the Vault holds vanishes when it exits. A **file** survives on disk. In C you open one with \`fopen(path, mode)\`, which gives back a \`FILE *\`: a pointer to a struct the library owns, with the current position and a buffer inside. You never look inside it; you hand it to the f-functions.

The **mode** matters. \`"r"\` reads a file that must already exist. \`"w"\` creates the file, or **erases** it if it exists. \`"a"\` appends after whatever is there. If the file cannot be opened, fopen returns \`NULL\`, so test the result before anything else.

\`fprintf(f, ...)\` is printf with the file pointer in front. When you are done, \`fclose(f)\`: writes are buffered in memory and may not reach the disk until then. One fclose per successful fopen, like one free per malloc.

The example writes two lines, closes, then opens the same file for reading and prints its lines back with \`fgets\` so you can see what landed on disk. Proper reading is the next lesson.`,
      example: {
        language: 'c',
        source: c`
#include <stdio.h>

int main(void) {
    FILE *out = fopen("notes.txt", "w");
    if (out == NULL) {
        printf("Could not open notes.txt\n");
        return 1;
    }
    fprintf(out, "rent %d\n", -800);
    fprintf(out, "salary %d\n", 2500);
    fclose(out);

    FILE *in = fopen("notes.txt", "r");
    if (in == NULL) {
        printf("Could not open notes.txt\n");
        return 1;
    }
    char line[64];
    while (fgets(line, sizeof line, in) != NULL) {
        printf("%s", line);
    }
    fclose(in);
    return 0;
}`,
        labels: [
          { lines: [4, 8], label: 'Create (or erase) the file for writing. If that fails, say so and stop.' },
          { lines: [9, 10], label: 'Two lines into the file, formatted exactly like printf. Each ends with \\n.' },
          { lines: [11, 11], label: 'Flush and release. Now the text is really on disk.' },
          { lines: [13, 17], label: 'Reopen for reading; a missing file would give NULL here.' },
          { lines: [18, 21], label: 'Peek: fgets reads one line (with its \\n) into the buffer until there are none left; print each as is.' },
          { lines: [22, 22], label: 'Close the second handle too. Output: rent -800, salary 2500.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python\'s `with open(...) as f:` closed the file for you when the block ended. C has no with: you call fclose yourself, on every path. Python raised FileNotFoundError; fopen quietly returns NULL and the crash comes later, when you use it, so the NULL check is yours.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'No file called `missing.txt` exists. What is printed?',
      code: {
        language: 'c',
        source: c`
#include <stdio.h>
int main(void) {
    FILE *f = fopen("missing.txt", "r");
    if (f == NULL) {
        printf("No file\n");
        return 0;
    }
    printf("Opened\n");
    fclose(f);
    return 0;
}`,
      },
      choices: ['No file', 'Opened', 'A crash before anything is printed', 'Opened\nNo file'],
      answer: 'No file',
      explanation: 'Mode "r" never creates a file, so fopen returns NULL and the check prints `No file`. With "w" or "a" the file would have been created and `Opened` printed. Without the check, fclose(NULL) would have been the crash.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that writes `Balance: 10` into `out.txt` and closes it.',
      language: 'c',
      indentation: false,
      solution: ['#include <stdio.h>', 'int main(void) {', '    FILE *f = fopen("out.txt", "w");', '    if (f == NULL) return 1;', '    fprintf(f, "Balance: %d\\n", 10);', '    fclose(f);', '    return 0;', '}'],
      distractors: ['    FILE f = fopen("out.txt", "w");', '    fprintf("Balance: %d\\n", f, 10);', '    close(f);'],
      explanation: 'fopen returns a pointer, so the variable is `FILE *f`. fprintf takes the file first, then the format. The function that closes a FILE is fclose; close is a different, lower-level call.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the function so that every call adds one line to `log.txt` without erasing the earlier ones.',
      language: 'c',
      template: c`
int log_count(int count) {
    FILE *f = {{open}}("log.txt", {{mode}});
    if (f == {{null}}) {
        return -1;
    }
    {{print}}(f, "Saved %d records\n", count);
    {{close}}(f);
    return 0;
}`,
      blanks: [
        { id: 'open', answers: ['fopen'] },
        { id: 'mode', answers: ['"a"'], hint: 'the mode that adds to the end without erasing, in double quotes' },
        { id: 'null', answers: ['NULL'] },
        { id: 'print', answers: ['fprintf'], hint: 'printf, into a file' },
        { id: 'close', answers: ['fclose'] },
      ],
      explanation: 'Mode "w" would leave only the latest line in the log. Returning -1 on a failed open is the convention lesson 7-3 builds on.',
    },
    {
      kind: 'modify',
      prompt: 'This program writes two records to `vault.txt` and prints the file back, but only the second record survives: each call to `write_record` opens the file with `"w"` and erases the previous line. Fix `write_record` so records accumulate. Expected output: `rent -800` then `salary 2500`.',
      language: 'c',
      starter: c`
#include <stdio.h>

int write_record(const char *name, int amount) {
    FILE *f = fopen("vault.txt", "w");
    if (f == NULL) return 0;
    fprintf(f, "%s %d\n", name, amount);
    fclose(f);
    return 1;
}

int main(void) {
    if (!write_record("rent", -800)) return 1;
    if (!write_record("salary", 2500)) return 1;
    FILE *f = fopen("vault.txt", "r");
    if (f == NULL) return 1;
    char line[64];
    while (fgets(line, sizeof line, f) != NULL) {
        printf("%s", line);
    }
    fclose(f);
    return 0;
}
`,
      tests: [
        { description: 'no file to begin with: both lines present', expectedStdout: 'rent -800\nsalary 2500' },
        { description: 'an existing file is kept, new lines go after it', files: { 'vault.txt': 'old 1\n' }, expectedStdout: 'old 1\nrent -800\nsalary 2500' },
      ],
      hint: 'One character changes: the mode. "a" creates the file if it is missing and otherwise writes after the existing contents.',
      solution: c`
#include <stdio.h>

int write_record(const char *name, int amount) {
    FILE *f = fopen("vault.txt", "a");
    if (f == NULL) return 0;
    fprintf(f, "%s %d\n", name, amount);
    fclose(f);
    return 1;
}

int main(void) {
    if (!write_record("rent", -800)) return 1;
    if (!write_record("salary", 2500)) return 1;
    FILE *f = fopen("vault.txt", "r");
    if (f == NULL) return 1;
    char line[64];
    while (fgets(line, sizeof line, f) != NULL) {
        printf("%s", line);
    }
    fclose(f);
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Open `amounts.txt` for writing once, before any input. Then repeatedly print `Amount?` and read an int until `0`; write each non-zero amount to the file on its own line. Close the file and print `Wrote <k> lines`. Finally reopen the file for reading and print every line of it (use `fgets` as in the example).',
      language: 'c',
      tests: [
        { description: 'two amounts', stdin: '10\n-3\n0', expectedStdout: 'Amount?\nAmount?\nAmount?\nWrote 2 lines\n10\n-3' },
        { description: 'no amounts: an empty file', stdin: '0', expectedStdout: 'Amount?\nWrote 0 lines' },
        { description: 'four amounts', stdin: '1\n2\n3\n4\n0', expectedStdout: 'Amount?\nAmount?\nAmount?\nAmount?\nAmount?\nWrote 4 lines\n1\n2\n3\n4' },
      ],
      hint: 'Open with "w" before the loop so the file exists even when nothing is written. fprintf(f, "%d\\n", amount) inside the loop; count as you go. fclose before you print the count, then fopen again with "r".',
      solution: c`
#include <stdio.h>

int main(void) {
    FILE *f = fopen("amounts.txt", "w");
    if (f == NULL) {
        printf("Could not open amounts.txt\n");
        return 1;
    }
    int count = 0;
    for (;;) {
        printf("Amount?\n");
        int amount;
        if (scanf("%d", &amount) != 1 || amount == 0) break;
        fprintf(f, "%d\n", amount);
        count++;
    }
    fclose(f);
    printf("Wrote %d lines\n", count);
    f = fopen("amounts.txt", "r");
    if (f == NULL) return 1;
    char line[64];
    while (fgets(line, sizeof line, f) != NULL) {
        printf("%s", line);
    }
    fclose(f);
    return 0;
}
`,
      projectNote: 'Saving the Vault is this shape: open vault.txt with "w", one fprintf per record, fclose. Loading it back is the next lesson.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 7-2 Reading                                                        */
/* ------------------------------------------------------------------ */

const l72: Lesson = {
  id: 'c-7-2',
  title: 'Reading records back',
  objective: 'Read a text file record by record, using the return value of fscanf to stop at the end or at a bad line.',
  minutes: 22,
  lexicon: [
    { id: 'c.7.fscanf', term: 'fscanf(f, "%31s %d", name, &amt)', kind: 'builtin', meaning: 'scanf, but from a file: the FILE pointer first, then the same format and addresses. Whitespace in the file, including line breaks, is skipped between items.', example: 'char name[32];\nint amount;\nint got = fscanf(f, "%31s %d", name, &amount);' },
    { id: 'c.7.scanf-count', term: 'while (fscanf(...) == 2)', kind: 'pattern', meaning: 'fscanf returns how many items it filled in: 2 for a good line, fewer for a bad one, EOF at the end. Comparing to the number you asked for is the loop condition: the loop stops at the end of the file or at the first line that does not fit.', example: 'while (fscanf(f, "%31s %d", name, &amount) == 2) {\n    total += amount;\n}' },
    { id: 'c.7.eof', term: 'EOF', kind: 'builtin', meaning: 'The value (a negative int) that reading functions return when there is nothing left to read. Do not loop on feof(): it only turns true after a read has already failed, so the last line is processed twice.', example: 'int ch = getchar();\nif (ch == EOF) { /* input ran out */ }' },
    { id: 'c.7.fgets', term: 'fgets(line, sizeof line, f)', kind: 'builtin', meaning: 'Read one line (up to the size limit) into the buffer, keeping its \\n. Returns NULL when the file is finished. The size argument is what stops a long line overflowing the buffer.', example: 'char line[64];\nwhile (fgets(line, sizeof line, f) != NULL) {\n    ...\n}' },
    { id: 'c.7.sscanf', term: 'sscanf(line, "%31s %d", name, &amt)', kind: 'builtin', meaning: 'scanf from a string instead of input. Pair it with fgets: read the line, then parse it. A bad line then costs one line, not the rest of the file.', example: 'if (sscanf(line, "%31s %d", name, &amount) == 2) { ... }' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Count what you got, not where you are',
      body: `A line of \`vault.txt\` looks like \`rent -800\`: a word and a number. \`fscanf(f, "%31s %d", name, &amount)\` reads exactly that, skipping line breaks between items just as scanf skips them between keystrokes. The width \`31\` keeps a long word inside the 32-byte box.

The important part is the **return value**: how many items were filled in. A good line gives 2. A line like \`rent\` with the number missing gives 1. At the end of the file it gives \`EOF\`. So \`while (fscanf(...) == 2)\` reads record after record and stops at the end or at the first line that does not fit. Never loop on \`feof(f)\`: it becomes true only after a read has failed, so the last record would be counted twice.

The alternative is two steps: \`fgets\` reads one whole line into a buffer (with its \`\\n\`), then \`sscanf\` parses that string with the same format. A bad line then costs one line instead of ending the loop. Both are correct; the Vault uses fscanf because its file is its own.`,
      example: {
        language: 'c',
        source: c`
#include <stdio.h>

int main(void) {
    FILE *f = fopen("vault.txt", "r");
    if (f == NULL) {
        printf("No file\n");
        return 0;
    }
    char name[32];
    int amount;
    int count = 0;
    int total = 0;
    while (fscanf(f, "%31s %d", name, &amount) == 2) {
        printf("%s: %d\n", name, amount);
        count++;
        total += amount;
    }
    fclose(f);
    printf("Records: %d\n", count);
    printf("Total: %d\n", total);
    return 0;
}`,
        labels: [
          { lines: [4, 8], label: 'Open for reading; a missing file is a normal case here, not a crash.' },
          { lines: [9, 12], label: 'One box for the word (31 chars + \\0), one for the number, two running counters.' },
          { lines: [13, 13], label: 'Read a word and a number; keep going only while both arrived.' },
          { lines: [14, 16], label: 'Use the record before the next read overwrites name and amount.' },
          { lines: [18, 20], label: 'Close, then report. For rent -800 and salary 2500: Records: 2, Total: 1700.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'In Python you looped `for line in f:` and then `line.split()` and `int(...)`, with a ValueError for a bad line. fscanf does the split and the conversion in one call and reports trouble through its return value instead of an exception. `fgets` + `sscanf` is the closest to the Python shape.' },
      ],
    },
    {
      kind: 'predict',
      prompt: '`data.txt` holds three lines: `a 1`, `b x`, `c 3`. What is printed?',
      code: {
        language: 'c',
        source: c`
#include <stdio.h>
int main(void) {
    FILE *f = fopen("data.txt", "r");
    if (f == NULL) return 0;
    char name[32];
    int n;
    while (fscanf(f, "%31s %d", name, &n) == 2) {
        printf("%s %d\n", name, n);
    }
    fclose(f);
    return 0;
}`,
      },
      choices: ['a 1', 'a 1\nc 3', 'a 1\nb 0\nc 3', 'nothing'],
      answer: 'a 1',
      explanation: 'The first call fills both items and returns 2. The second reads `b` into name, then fails to read `x` as a number and returns 1, so the loop ends. `c 3` is never reached. With fgets + sscanf you could skip the bad line and continue to `c 3`.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the fgets + sscanf loop that sums the amounts in an already open file `f`, skipping any line that is not `<word> <int>`. Set the indentation yourself.',
      language: 'c',
      indentation: true,
      solution: [
        'char line[64];',
        'int total = 0;',
        'while (fgets(line, sizeof line, f) != NULL) {',
        '    char name[32];',
        '    int amount;',
        '    if (sscanf(line, "%31s %d", name, &amount) == 2) {',
        '        total += amount;',
        '    }',
        '}',
        'printf("Total: %d\\n", total);',
      ],
      distractors: ['while (!feof(f)) {', '    if (sscanf(f, "%31s %d", name, &amount) == 2) {', 'while (fgets(line, f) != NULL) {'],
      explanation: '`feof` only reports an end that has already been hit, so the body would run once more with a stale line. sscanf parses a string, not a FILE: the line goes in, not f. fgets needs the buffer size as its second argument; without it there is no protection against a long line.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the reading loop so it stops at the end of the file or at the first line that is not a word and a number.',
      language: 'c',
      template: c`
char name[32];
int amount;
int total = 0;
while ({{fn}}(f, "%31s %d", name, {{amp}}amount) == {{count}}) {
    total += amount;
}
{{close}}(f);`,
      blanks: [
        { id: 'fn', answers: ['fscanf'], hint: 'scanf, from a file' },
        { id: 'amp', answers: ['&'], hint: 'the number is written into the box, so pass its address; the char array already is one' },
        { id: 'count', answers: ['2'], hint: 'how many items a good line fills in' },
        { id: 'close', answers: ['fclose'] },
      ],
      explanation: '`name` is an array, so it is already the address of its first box; `amount` is a plain int and needs &.',
    },
    {
      kind: 'modify',
      prompt: 'This program sums the records in `vault.txt`, but it loops on `feof` and so counts the last record twice (and counts one record in an empty file). Change the loop so it is driven by the return value of fscanf. Expected for the two-record file: `Records: 2` and `Total: 1700`.',
      language: 'c',
      starter: c`
#include <stdio.h>

int main(void) {
    FILE *f = fopen("vault.txt", "r");
    if (f == NULL) {
        printf("No file\n");
        return 0;
    }
    char name[32] = "";
    int amount = 0;
    int count = 0;
    int total = 0;
    while (!feof(f)) {
        (void)fscanf(f, "%31s %d", name, &amount);
        count++;
        total += amount;
    }
    fclose(f);
    printf("Records: %d\n", count);
    printf("Total: %d\n", total);
    return 0;
}
`,
      tests: [
        { description: 'two records with a final line break', files: { 'vault.txt': 'rent -800\nsalary 2500\n' }, expectedStdout: 'Records: 2\nTotal: 1700' },
        { description: 'one record without a final line break', files: { 'vault.txt': 'tips 7' }, expectedStdout: 'Records: 1\nTotal: 7' },
        { description: 'an empty file', files: { 'vault.txt': '' }, expectedStdout: 'Records: 0\nTotal: 0' },
        { description: 'no file at all', expectedStdout: 'No file' },
      ],
      hint: 'Make the fscanf call the while condition: `while (fscanf(f, "%31s %d", name, &amount) == 2)`. The body then only runs for records that really arrived.',
      solution: c`
#include <stdio.h>

int main(void) {
    FILE *f = fopen("vault.txt", "r");
    if (f == NULL) {
        printf("No file\n");
        return 0;
    }
    char name[32];
    int amount;
    int count = 0;
    int total = 0;
    while (fscanf(f, "%31s %d", name, &amount) == 2) {
        count++;
        total += amount;
    }
    fclose(f);
    printf("Records: %d\n", count);
    printf("Total: %d\n", total);
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Open `vault.txt` for reading. If it cannot be opened, print `No file` and then `Records: 0`. Otherwise print each record as `<name>: <amount>`, stopping at the end or at the first line that is not `<word> <int>`, then print `Records: <n>` and `Total: <t>`. Close the file.',
      language: 'c',
      tests: [
        { description: 'the standard two-record file', files: { 'vault.txt': 'rent -800\nsalary 2500\n' }, expectedStdout: 'rent: -800\nsalary: 2500\nRecords: 2\nTotal: 1700' },
        { description: 'no file', expectedStdout: 'No file\nRecords: 0' },
        { description: 'no final line break', files: { 'vault.txt': 'tips 7' }, expectedStdout: 'tips: 7\nRecords: 1\nTotal: 7' },
        { description: 'empty file', files: { 'vault.txt': '' }, expectedStdout: 'Records: 0\nTotal: 0' },
        { description: 'stops at a malformed line', files: { 'vault.txt': 'a 1\nb 2\noops\nc 3\n' }, expectedStdout: 'a: 1\nb: 2\nRecords: 2\nTotal: 3' },
      ],
      hint: 'This is the concept example with the printing inside the loop. Remember the `Records: 0` line in the no-file branch.',
      solution: c`
#include <stdio.h>

int main(void) {
    FILE *f = fopen("vault.txt", "r");
    if (f == NULL) {
        printf("No file\n");
        printf("Records: 0\n");
        return 0;
    }
    char name[32];
    int amount;
    int count = 0;
    int total = 0;
    while (fscanf(f, "%31s %d", name, &amount) == 2) {
        printf("%s: %d\n", name, amount);
        count++;
        total += amount;
    }
    fclose(f);
    printf("Records: %d\n", count);
    printf("Total: %d\n", total);
    return 0;
}
`,
      projectNote: 'Loading the Vault is this loop with vault_push in the body instead of printf. A missing file is simply an empty vault.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 7-3 Errors and robustness                                          */
/* ------------------------------------------------------------------ */

const l73: Lesson = {
  id: 'c-7-3',
  title: 'When things go wrong',
  objective: 'Report failures with return codes and early returns, and survive bad input by checking scanf and discarding the rest of the line.',
  minutes: 22,
  lexicon: [
    { id: 'c.7.perror', term: 'perror("vault.txt")', kind: 'builtin', meaning: 'Print your text, a colon, and the system\'s reason for the last failure ("No such file or directory") to stderr, not stdout. Call it right after the call that failed.', example: 'FILE *f = fopen(path, "r");\nif (f == NULL) {\n    perror(path);\n    return -1;\n}' },
    { id: 'c.7.errno', term: 'errno', kind: 'concept', meaning: 'A global int (from <errno.h>) that library calls set when they fail, naming the reason. perror reads it for you; read it yourself only right after the failing call, because the next call may overwrite it.', example: '#include <errno.h>\nif (f == NULL && errno == ENOENT) { /* no such file */ }' },
    { id: 'c.7.status-return', term: 'return 0 for success, -1 for failure', kind: 'pattern', meaning: 'C has no exceptions. A function that can fail returns a status the caller must check: 0 (or a count) on success, -1 on failure. Results go out through pointer parameters.', example: 'int load_total(const char *path, int *total);\n...\nif (load_total("amounts.txt", &total) != 0) { total = 0; }', analogy: 'A delivery slip handed back: "delivered" or "address not found". It breaks here: nobody forces the caller to read the slip, so an unchecked return value is a silent failure.' },
    { id: 'c.7.early-return', term: 'early return', kind: 'concept', meaning: 'Handle the failure first and return at once, so the happy path below is not nested inside an else. Free or close anything you already own before returning.', example: 'if (f == NULL) return -1;\n/* the rest assumes f is valid */' },
    { id: 'c.7.discard-line', term: 'discard the rest of the line', kind: 'pattern', meaning: 'When scanf fails, the offending text is still waiting in the input and the next scanf will fail on it too. Read characters with getchar until \\n or EOF, then ask again. Stop retrying at EOF, or the loop never ends.', example: 'int ch = getchar();\nwhile (ch != \'\\n\' && ch != EOF) {\n    ch = getchar();\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'No exceptions: check, report, return',
      body: `C has no \`try\`/\`except\`. A function that can fail **returns a status**, and the caller **checks it**. The convention: 0 (or a useful count) means success, -1 means failure, and real results travel out through pointer parameters. \`perror("vault.txt")\` prints the system's reason for the last failure, taken from \`errno\`, to stderr.

Handle the failure first and **return early**, so the rest of the function reads straight down. Close or free anything you already own before leaving.

Input needs the same discipline. \`scanf("%d", &x)\` on \`abc\` returns 0 and leaves \`abc\` **unread in the input**, so asking again fails the same way forever. The fix is \`discard_line\`: read characters until the line break, then ask again. At \`EOF\` there is nothing more to come, so the retry loop must give up. The \`read_int\` below is the robust form of the helper the Vault has used since Module 3.`,
      example: {
        language: 'c',
        source: c`
#include <stdio.h>

int discard_line(void) {
    int ch = getchar();
    while (ch != '\n' && ch != EOF) {
        ch = getchar();
    }
    return ch;
}

int read_int(const char *prompt) {
    for (;;) {
        printf("%s\n", prompt);
        int x;
        int got = scanf("%d", &x);
        if (got == 1) {
            return x;
        }
        if (got == EOF) {
            return 0;
        }
        printf("Not a number, try again\n");
        if (discard_line() == EOF) {
            return 0;
        }
    }
}

int load_total(const char *path, int *total) {
    FILE *f = fopen(path, "r");
    if (f == NULL) {
        perror(path);
        return -1;
    }
    int amount;
    *total = 0;
    while (fscanf(f, "%d", &amount) == 1) {
        *total += amount;
    }
    fclose(f);
    return 0;
}

int main(void) {
    int total;
    if (load_total("amounts.txt", &total) != 0) {
        printf("Starting from 0\n");
        total = 0;
    }
    total += read_int("Amount?");
    printf("Total: %d\n", total);
    return 0;
}`,
        labels: [
          { lines: [3, 9], label: 'Swallow the rest of the current line, character by character. Returns the last char read, so the caller can see EOF.' },
          { lines: [11, 15], label: 'A loop with no condition: the only exits are the returns. On success, return the number.' },
          { lines: [18, 21], label: 'Explain, clear the bad text, ask again. If the input has ended, stop retrying.' },
          { lines: [25, 30], label: 'Open; on failure report the system reason to stderr and return -1 at once.' },
          { lines: [31, 37], label: 'Happy path, unnested: the result goes out through the pointer, the status through return.' },
          { lines: [41, 45], label: 'The caller checks the status and chooses a fallback.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'In Python the retry loop wrapped `int(text)` in try/except ValueError, and a missing file raised FileNotFoundError that you caught. In C the same information arrives as return values: scanf\'s count, fopen\'s NULL. Nothing interrupts the program for you; an unchecked return is a bug that stays quiet.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The user types `abc`. What is printed?',
      code: {
        language: 'c',
        source: c`
#include <stdio.h>
int main(void) {
    int n;
    printf("Amount?\n");
    if (scanf("%d", &n) != 1) {
        printf("Not a number\n");
        return 0;
    }
    printf("Got %d\n", n);
    return 0;
}`,
      },
      choices: ['Amount?\nNot a number', 'Amount?\nGot 0', 'Amount?\nGot abc', 'A crash at scanf'],
      answer: 'Amount?\nNot a number',
      explanation: 'scanf returns the number of items it converted: 0 here, because `a` is not a digit. The box n is left untouched (it holds garbage), which is exactly why the program must not print it: the check turns a silent bug into a clear message.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the robust `read_int` (`discard_line` already exists). Set the indentation yourself.',
      language: 'c',
      indentation: true,
      solution: [
        'int read_int(const char *prompt) {',
        '    for (;;) {',
        '        printf("%s\\n", prompt);',
        '        int x;',
        '        if (scanf("%d", &x) == 1) {',
        '            return x;',
        '        }',
        '        printf("Not a number, try again\\n");',
        '        if (discard_line() == EOF) {',
        '            return 0;',
        '        }',
        '    }',
        '}',
      ],
      distractors: ['        if (scanf("%d", x) == 1) {', '        if (scanf("%d", &x) == 0) {', "        while (getchar() != '\\n') {"],
      explanation: 'scanf needs the address of x. A return of 0 means failure, so returning x then would hand back garbage. `while (getchar() != \'\\n\')` never checks for EOF, so when the input ends it spins forever: that is why discard_line returns the last character it read.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete `save_total` and its caller using the status-return convention.',
      language: 'c',
      template: c`
int save_total(const char *path, int total) {
    FILE *f = fopen(path, "w");
    if (f == {{null}}) {
        return {{fail}};
    }
    fprintf(f, "%d\n", total);
    fclose(f);
    return {{ok}};
}

/* in main */
if (save_total("total.txt", total) {{cmp}} 0) {
    printf("Could not save\n");
}`,
      blanks: [
        { id: 'null', answers: ['NULL'] },
        { id: 'fail', answers: ['-1'], hint: 'the value this lesson uses for failure' },
        { id: 'ok', answers: ['0'], hint: 'the value for success' },
        { id: 'cmp', answers: ['!='], hint: 'anything other than success is a problem' },
      ],
      explanation: 'The failure path returns before anything is written; the success path reaches fclose and then 0. The caller compares against 0, not against -1, so any future failure code is also caught.',
    },
    {
      kind: 'modify',
      prompt: 'This program sums amounts until `0`, but a non-number ends it. Change it so that bad input prints `Not a number, try again`, discards the rest of that line with `discard_line`, and keeps asking; stop only at `0` or when the input runs out. Expected for `10`, `abc`, `5`, `0`: `Total: 15`.',
      language: 'c',
      starter: c`
#include <stdio.h>

int discard_line(void) {
    int ch = getchar();
    while (ch != '\n' && ch != EOF) {
        ch = getchar();
    }
    return ch;
}

int main(void) {
    int total = 0;
    for (;;) {
        printf("Amount?\n");
        int amount;
        if (scanf("%d", &amount) != 1) {
            printf("Not a number\n");
            break;
        }
        if (amount == 0) break;
        total += amount;
    }
    printf("Total: %d\n", total);
    return 0;
}
`,
      tests: [
        { description: 'one bad amount in the middle', stdin: '10\nabc\n5\n0', expectedStdout: 'Amount?\nAmount?\nNot a number, try again\nAmount?\nAmount?\nTotal: 15' },
        { description: 'all good', stdin: '1\n2\n0', expectedStdout: 'Amount?\nAmount?\nAmount?\nTotal: 3' },
        { description: 'two bad answers first', stdin: 'x\ny\n3\n0', expectedStdout: 'Amount?\nNot a number, try again\nAmount?\nNot a number, try again\nAmount?\nAmount?\nTotal: 3' },
        { description: 'input ends without a 0', stdin: '4\n6', expectedStdout: 'Amount?\nAmount?\nAmount?\nTotal: 10' },
      ],
      hint: 'Keep the result of scanf in a variable: `EOF` means the input ran out (stop quietly); any other non-1 result is a bad token (print the message, `discard_line()`, `continue`).',
      solution: c`
#include <stdio.h>

int discard_line(void) {
    int ch = getchar();
    while (ch != '\n' && ch != EOF) {
        ch = getchar();
    }
    return ch;
}

int main(void) {
    int total = 0;
    for (;;) {
        printf("Amount?\n");
        int amount;
        int got = scanf("%d", &amount);
        if (got == EOF) break;
        if (got != 1) {
            printf("Not a number, try again\n");
            if (discard_line() == EOF) break;
            continue;
        }
        if (amount == 0) break;
        total += amount;
    }
    printf("Total: %d\n", total);
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Using the robust `read_int` (prompt `Amount?`, bad input prints `Not a number, try again` and asks again), read amounts until `0` and sum them. Write `int save_total(const char *path, int total)` that returns 0 on success and -1 if the file cannot be opened; call it with `total.txt` and print `Saved` or `Could not save`. Finally open `total.txt`, read the number back with fscanf, and print `File says: <t>`.',
      language: 'c',
      tests: [
        { description: 'two amounts', stdin: '5\n7\n0', expectedStdout: 'Amount?\nAmount?\nAmount?\nSaved\nFile says: 12' },
        { description: 'a bad answer first', stdin: 'abc\n4\n0', expectedStdout: 'Amount?\nNot a number, try again\nAmount?\nAmount?\nSaved\nFile says: 4' },
        { description: 'nothing but the 0', stdin: '0', expectedStdout: 'Amount?\nSaved\nFile says: 0' },
        { description: 'bad answer between good ones', stdin: '2\n2.5x\n3\n0', expectedStdout: 'Amount?\nAmount?\nAmount?\nNot a number, try again\nAmount?\nAmount?\nSaved\nFile says: 7' },
      ],
      hint: 'read_int returns 0 at EOF as well, so `while ((amount = read_int("Amount?")) != 0)` ends in both cases. Check the result of the final fscanf too: print `File says: 0` if it is not 1.',
      solution: c`
#include <stdio.h>

int discard_line(void) {
    int ch = getchar();
    while (ch != '\n' && ch != EOF) {
        ch = getchar();
    }
    return ch;
}

int read_int(const char *prompt) {
    for (;;) {
        printf("%s\n", prompt);
        int x;
        int got = scanf("%d", &x);
        if (got == 1) {
            return x;
        }
        if (got == EOF) {
            return 0;
        }
        printf("Not a number, try again\n");
        if (discard_line() == EOF) {
            return 0;
        }
    }
}

int save_total(const char *path, int total) {
    FILE *f = fopen(path, "w");
    if (f == NULL) {
        return -1;
    }
    fprintf(f, "%d\n", total);
    fclose(f);
    return 0;
}

int main(void) {
    int total = 0;
    int amount;
    while ((amount = read_int("Amount?")) != 0) {
        total += amount;
    }
    if (save_total("total.txt", total) != 0) {
        printf("Could not save\n");
    } else {
        printf("Saved\n");
    }
    FILE *f = fopen("total.txt", "r");
    int saved = 0;
    if (f != NULL) {
        if (fscanf(f, "%d", &saved) != 1) {
            saved = 0;
        }
        fclose(f);
    }
    printf("File says: %d\n", saved);
    return 0;
}
`,
      projectNote: 'vault_load and vault_save in v0.7 follow exactly this shape: open, early return on failure, work, close, status back to main.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 7-4 Project: Vault v0.7                                            */
/* ------------------------------------------------------------------ */

const l74: Lesson = {
  id: 'c-7-4',
  title: 'Project: Vault v0.7',
  objective: 'Load the vault from vault.txt at start and save it back on quit, so records persist between runs.',
  minutes: 24,
  lexicon: [
    { id: 'c.7.load-save', term: 'load at start, save at quit', kind: 'concept', meaning: 'The pair that makes data outlive a run: read the file into the heap row before the first command, write the whole row back once the user quits. In between, only memory changes.', example: 'int loaded = vault_load(&v, "vault.txt");\n...\nint saved = vault_save(&v, "vault.txt");' },
    { id: 'c.7.missing-is-empty', term: 'a missing file is an empty vault', kind: 'pattern', meaning: 'On the first run there is no vault.txt. Treat fopen returning NULL in the loader as "zero records" rather than an error, so the first run and every later run share one code path.', example: 'FILE *f = fopen(path, "r");\nif (f == NULL) return 0;   /* nothing to load */' },
    { id: 'c.7.rewrite-whole', term: 'rewrite the whole file with "w"', kind: 'pattern', meaning: 'Saving opens with "w" (erasing the old contents) and writes every record from memory. Removed records disappear from disk because they are no longer in the row. Appending would keep stale records.', example: 'FILE *f = fopen(path, "w");\nfor (int i = 0; i < v->count; i++) {\n    fprintf(f, "%s %d\\n", v->items[i].name, v->items[i].amount);\n}\nfclose(f);' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The vault outlives the run',
      body: `v0.6 forgets everything at \`Bye\`. v0.7 adds two functions around the unchanged command loop.

\`vault_load(&v, "vault.txt")\` opens the file for reading. A \`NULL\` means there is no file yet, which is normal on the first run: it returns 0 and the vault stays empty. Otherwise it runs the \`fscanf(...) == 2\` loop from lesson 7-2 with \`vault_push\` in the body, closes, and returns how many records it pushed. main prints \`Loaded <k> records\`.

\`vault_save(&v, "vault.txt")\` opens with \`"w"\`, erasing the old file, writes one \`<name> <amount>\` line per record in the row, closes, and returns the count (or -1 if the file could not be opened). Because the whole row is rewritten, a removed record is gone from disk too. On command \`3\`, main prints \`Saved <n> records\` and then \`Bye\`.

The file format is the same one the loader reads, so a saved file loads unchanged next time. The heap row is still freed once, after the loop.`,
      example: {
        language: 'c',
        source: c`
int vault_load(Vault *v, const char *path) {
    FILE *f = fopen(path, "r");
    if (f == NULL) return 0;
    Record r;
    int loaded = 0;
    while (fscanf(f, "%31s %d", r.name, &r.amount) == 2) {
        if (!vault_push(v, r)) break;
        loaded++;
    }
    fclose(f);
    return loaded;
}

int vault_save(const Vault *v, const char *path) {
    FILE *f = fopen(path, "w");
    if (f == NULL) return -1;
    for (int i = 0; i < v->count; i++) {
        fprintf(f, "%s %d\n", v->items[i].name, v->items[i].amount);
    }
    fclose(f);
    return v->count;
}`,
        labels: [
          { lines: [1, 3], label: 'No file means nothing to load: return 0, not an error.' },
          { lines: [4, 9], label: 'Read straight into a Record and push it; stop at the end or at a bad line. Count what was pushed.' },
          { lines: [10, 11], label: 'Close, then hand the count back for the Loaded line.' },
          { lines: [14, 16], label: 'Open for writing erases the old file. Failure is reported as -1.' },
          { lines: [17, 19], label: 'One line per record, in the exact format the loader reads.' },
          { lines: [20, 21], label: 'Close so the lines reach the disk; report how many were written.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'The Python ledger did this with json.load and json.dump around a list. Here the format is your own text lines, the parser is fscanf, and the "list" is the heap row you free yourself. The shape, load first and save last, is identical.' },
      ],
    },
    {
      kind: 'predict',
      prompt: '`vault.txt` holds `rent -800` and `salary 2500`. The user types `5`, `rent`, `3`. After the program ends, what does `vault.txt` contain?',
      code: {
        language: 'c',
        source: c`
/* main, abbreviated */
Vault v = {NULL, 0, 0};
printf("Loaded %d records\n", vault_load(&v, "vault.txt"));
/* ... command loop: 5 removes rent, 3 saves and quits ... */
printf("Saved %d records\n", vault_save(&v, "vault.txt"));
printf("Bye\n");
vault_free(&v);`,
      },
      choices: ['salary 2500', 'rent -800\nsalary 2500', 'rent -800\nsalary 2500\nsalary 2500', 'an empty file'],
      answer: 'salary 2500',
      explanation: 'Load pushes both records; remove shifts salary down and the count drops to 1; save opens with "w", which erases the file, and writes the one record left. Opening with "a" instead would have produced the third option: the stale records plus a copy.',
    },
    {
      kind: 'create',
      prompt: `Vault v0.7. At start, load \`vault.txt\` if it exists (lines of \`<name> <amount>\`) and print \`Loaded <k> records\` (\`Loaded 0 records\` if there is no file). Then the v0.6 command loop, unchanged: \`1\` add, \`2\` list, \`4\` find, \`5\` remove, anything else \`Unknown command\`. On \`3\`: write every record to \`vault.txt\` in the same format, print \`Saved <n> records\`, then \`Bye\`. Free everything.`,
      language: 'c',
      tests: [
        { description: 'file present: list and quit', files: { 'vault.txt': 'rent -800\nsalary 2500\n' }, stdin: '2\n3', expectedStdout: 'Loaded 2 records\nCommand?\nrent: -800\nsalary: 2500\nRecords: 2\nTotal: 1700\nCommand?\nSaved 2 records\nBye' },
        { description: 'file absent: add one, list, quit', stdin: '1\nfood\n-50\n2\n3', expectedStdout: 'Loaded 0 records\nCommand?\nName?\nAmount?\nAdded\nCommand?\nfood: -50\nRecords: 1\nTotal: -50\nCommand?\nSaved 1 records\nBye' },
        { description: 'loaded and added records together', files: { 'vault.txt': 'rent -800\nsalary 2500\n' }, stdin: '1\nfood\n-50\n2\n3', expectedStdout: 'Loaded 2 records\nCommand?\nName?\nAmount?\nAdded\nCommand?\nrent: -800\nsalary: 2500\nfood: -50\nRecords: 3\nTotal: 1650\nCommand?\nSaved 3 records\nBye' },
        { description: 'remove a loaded record, then find it', files: { 'vault.txt': 'rent -800\nsalary 2500\n' }, stdin: '5\nrent\n4\nrent\n2\n3', expectedStdout: 'Loaded 2 records\nCommand?\nName?\nRemoved\nCommand?\nName?\nNot found\nCommand?\nsalary: 2500\nRecords: 1\nTotal: 2500\nCommand?\nSaved 1 records\nBye' },
        { description: 'five loaded records grow the row past 4', files: { 'vault.txt': 'a 1\nb 2\nc 3\nd 4\ne 5\n' }, stdin: '4\ne\n3', expectedStdout: 'Loaded 5 records\nCommand?\nName?\ne: 5\nCommand?\nSaved 5 records\nBye' },
        { description: 'file absent, unknown command, quit', stdin: '7\n3', expectedStdout: 'Loaded 0 records\nCommand?\nUnknown command\nCommand?\nSaved 0 records\nBye' },
      ],
      hint: 'Start from your v0.6 and add vault_load and vault_save from the example. Call vault_load right after `Vault v = {NULL, 0, 0};`. In the `3` branch, call vault_save before printing Bye. vault_free stays after the loop.',
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

int vault_load(Vault *v, const char *path) {
    FILE *f = fopen(path, "r");
    if (f == NULL) return 0;
    Record r;
    int loaded = 0;
    while (fscanf(f, "%31s %d", r.name, &r.amount) == 2) {
        if (!vault_push(v, r)) break;
        loaded++;
    }
    fclose(f);
    return loaded;
}

int vault_save(const Vault *v, const char *path) {
    FILE *f = fopen(path, "w");
    if (f == NULL) return -1;
    for (int i = 0; i < v->count; i++) {
        fprintf(f, "%s %d\n", v->items[i].name, v->items[i].amount);
    }
    fclose(f);
    return v->count;
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
    printf("Loaded %d records\n", vault_load(&v, "vault.txt"));
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
            int saved = vault_save(&v, "vault.txt");
            if (saved < 0) {
                printf("Could not save\n");
            } else {
                printf("Saved %d records\n", saved);
            }
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
      projectNote: 'Vault v0.7: records persist to disk. Loading fills the heap row from vault.txt; saving rewrites it on quit; everything is still freed. Module 8 turns the same program into a command-line tool driven by argv.',
    },
  ],
};

export const m7: Module = {
  id: 'c-m7',
  title: 'Files',
  goal: 'FILE*, fopen modes, fprintf, fscanf and its return value, fgets + sscanf, perror/errno, status returns, robust input.',
  projectMilestone: 'Vault v0.7: records persist to disk.',
  status: 'available',
  lessons: [l71, l72, l73, l74],
};
