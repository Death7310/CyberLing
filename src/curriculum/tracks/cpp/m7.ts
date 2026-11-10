import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 7: Building and testing                                     */
/* ------------------------------------------------------------------ */

/** C++ source written verbatim: backslashes stay (so `"\n"` inside C++ strings survives), leading newline dropped. */
const cpp = (s: TemplateStringsArray) => s.raw.join('').replace(/^\n/, '');

/* ------------------------------------------------------------------ */
/* 7-1 Command lines                                                  */
/* ------------------------------------------------------------------ */

const l71: Lesson = {
  id: 'cpp-7-1',
  title: 'Told what to do, not asked',
  objective: 'Read command-line arguments into a vector of strings, dispatch on a verb, and report misuse on stderr with a non-zero exit status.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.7.argc-argv', term: 'int main(int argc, char *argv[])', kind: 'pattern', meaning: 'The form of main that receives the command line: argc is how many words were typed, argv the words themselves as C strings. argv[0] is the program name; the real arguments start at 1.', example: 'int main(int argc, char *argv[]) {\n    std::cout << argc - 1 << " arguments\\n";\n}' },
    { id: 'cpp.7.args-vector', term: 'std::vector<std::string> args(argv + 1, argv + argc);', kind: 'pattern', meaning: 'Copy every argument after the program name into a vector of std::string, using the two-iterator constructor. From here on the command line is ordinary C++ data: size(), [], == and range-for all work.', example: 'std::vector<std::string> args(argv + 1, argv + argc);\nif (args.empty()) return usage();', analogy: 'Taking a message off the answering machine and writing it on paper. It breaks here: the paper is a copy; changing args does not change argv, which nobody minds.' },
    { id: 'cpp.7.cerr', term: 'std::cerr << "Usage: ...\\n";', kind: 'builtin', meaning: 'The error stream. Text sent here is not part of the program\'s output: a pipeline or a test that captures stdout never sees it. Usage lines, "Not a number" and other complaints belong on cerr.', example: 'std::cerr << "Usage: main add <name> <amount>\\n";\nreturn 1;' },
    { id: 'cpp.7.exit-status', term: 'return 1; from main', kind: 'concept', meaning: 'The value main returns is the exit status the shell and other programs see. 0 means success; anything else means failure. Scripts, make and test runners stop on a non-zero status, so misuse must return non-zero even when it also prints a message.', example: 'int usage() {\n    std::cerr << "Usage: main add|list\\n";\n    return 1;\n}\n// in main:  if (args.empty()) return usage();' },
    { id: 'cpp.7.verb-dispatch', term: 'if (args[0] == "add" && args.size() == 3)', kind: 'pattern', meaning: 'Dispatch on the first argument, the verb, and check the argument count in the same condition, so a verb with the wrong number of operands falls through to the usage line instead of indexing past the end.', example: 'if (args[0] == "find" && args.size() == 2) {\n    vault.find(args[1]);\n    return 0;\n}\nreturn usage();' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The command line is a vector of strings',
      body: `Every Vault++ so far asked \`Command?\` and waited. A real tool is told everything in one line, \`main add rent 50\`, and exits. The words of that line arrive in \`main(int argc, char *argv[])\`: \`argc\` is the count, \`argv\` the words as C strings, with \`argv[0]\` the program name. One line turns them into something civilised: \`std::vector<std::string> args(argv + 1, argv + argc);\` copies the real arguments, skipping the program name, into strings you can compare with \`==\`.

From there a program **dispatches on the verb**: \`args[0]\` chooses what to do, and the same condition checks \`args.size()\` so a missing operand never indexes past the end. Numbers arrive as text; \`std::stoi\` converts them and throws on junk, so the conversions sit inside one try block.

Misuse is reported on \`std::cerr\`, never \`std::cout\`, and \`main\` returns \`1\`. Anything that captures the program's output, a test or a pipeline, then sees clean stdout and a failure status, which is exactly how the tests in this module read your programs.`,
      example: {
        language: 'cpp',
        source: cpp`
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

int usage() {
    std::cerr << "Usage: main add <a> <b> | neg <n>\n";
    return 1;
}

int main(int argc, char *argv[]) {
    std::vector<std::string> args(argv + 1, argv + argc);
    if (args.empty()) return usage();
    try {
        if (args[0] == "add" && args.size() == 3) {
            std::cout << std::stoi(args[1]) + std::stoi(args[2]) << "\n";
            return 0;
        }
        if (args[0] == "neg" && args.size() == 2) {
            std::cout << -std::stoi(args[1]) << "\n";
            return 0;
        }
    } catch (const std::exception &) {
        std::cerr << "Not a number\n";
        return 1;
    }
    return usage();
}`,
        labels: [
          { lines: [6, 9], label: 'One place that explains the tool and reports failure: message on cerr, status 1.' },
          { lines: [11, 12], label: 'The C signature, then the command line as a vector of strings without the program name.' },
          { lines: [13, 13], label: 'No arguments at all is misuse; return the usage function\'s status.' },
          { lines: [14, 14], label: 'Every stoi lives inside one try, so one catch covers all verbs.' },
          { lines: [15, 18], label: 'Verb and operand count checked together; a verb is done when it returns 0.' },
          { lines: [19, 22], label: 'Second verb, different count. A verb that does not match falls through.' },
          { lines: [23, 26], label: 'Junk where a number should be: complain on cerr, exit with failure.' },
          { lines: [27, 27], label: 'Nothing matched: unknown verb or wrong count. Same usage path.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'The C Vault did this with strcmp(argv[1], "greet") == 0 and strtol with an end pointer. Here argv is copied into std::string once, so the verb is compared with == and numbers are converted with stoi; the signature of main is the only line that is still C.' },
        { from: 'python', note: 'sys.argv[1:] is exactly args here, except that Python strings arrive ready-made. There is no argparse in the standard library; this module dispatches by hand, which for five verbs is shorter than describing them to a parser.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The worked example is run as `main add 5 x`. What appears on **stdout**, and what is the exit status?',
      code: {
        language: 'cpp',
        source: cpp`
int main(int argc, char *argv[]) {
    std::vector<std::string> args(argv + 1, argv + argc);
    if (args.empty()) return usage();
    try {
        if (args[0] == "add" && args.size() == 3) {
            std::cout << std::stoi(args[1]) + std::stoi(args[2]) << "\n";
            return 0;
        }
        if (args[0] == "neg" && args.size() == 2) {
            std::cout << -std::stoi(args[1]) << "\n";
            return 0;
        }
    } catch (const std::exception &) {
        std::cerr << "Not a number\n";
        return 1;
    }
    return usage();
}`,
      },
      choices: [
        'stdout is empty; exit status 1',
        'stdout: Not a number; exit status 1',
        'stdout: 5; exit status 0',
        'stdout: Usage: main add <a> <b> | neg <n>; exit status 1',
      ],
      answer: 'stdout is empty; exit status 1',
      explanation: '`args` is `{"add", "5", "x"}`, so the first verb matches. `std::stoi("5")` succeeds, `std::stoi("x")` throws before anything is written to cout, and the catch prints `Not a number` on **cerr**, which is not stdout. main returns 1. Nothing reaches stdout, and the usage path is never taken because the verb did match.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so that `main shout hi` prints `hi!`, and anything else prints a usage line where a test cannot see it and exits with failure.',
      language: 'cpp',
      template: cpp`
int main(int argc, char *argv[]) {
    std::vector<std::string> args({{first}}, argv + argc);
    if (args.{{empty}}()) {
        std::{{err}} << "Usage: main shout <word>\n";
        return {{code}};
    }
    if (args[0] {{eq}} "shout" && args.size() == 2) {
        std::cout << args[1] << "!\n";
        return 0;
    }
    std::cerr << "Usage: main shout <word>\n";
    return 1;
}`,
      blanks: [
        { id: 'first', answers: ['argv + 1', 'argv+1'], hint: 'start after the program name' },
        { id: 'empty', answers: ['empty'], hint: 'the member that asks whether there are no arguments' },
        { id: 'err', answers: ['cerr'], hint: 'the stream a test does not capture' },
        { id: 'code', answers: ['1'], hint: 'any non-zero status means failure' },
        { id: 'eq', answers: ['=='], hint: 'std::string compares with the ordinary operator, no strcmp' },
      ],
      explanation: '`argv + 1` skips the program name; `empty()` guards `args[0]`; the usage line goes to `cerr` with status `1`; and because the arguments are `std::string`, `==` compares their text.',
    },
    {
      kind: 'modify',
      prompt: `This tool should print a word \`n\` times with \`main repeat <n> <word>\` and add numbers with \`main sum 1 2 3\` (\`Sum: 6\`). A teammate reports:

- every command, even \`main repeat 3 hi\`, prints the usage line and nothing else
- once that is fixed, \`main repeat 3 hi\` prints \`hi\` only twice

Fix both. While you are there, make misuse behave: the usage line and \`Not a number\` go to \`std::cerr\` with exit status 1, and a bad number must not crash the program (put the \`stoi\` calls inside try/catch).`,
      language: 'cpp',
      starter: cpp`
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

int usage() {
    std::cout << "Usage: main repeat <n> <word> | sum <n>...\n";
    return 0;
}

int main(int argc, char *argv[]) {
    std::vector<std::string> args(argv, argv + argc);
    if (args.empty()) return usage();
    if (args[0] == "repeat" && args.size() == 3) {
        int n = std::stoi(args[1]);
        for (int i = 1; i < n; i++) std::cout << args[2] << "\n";
        return 0;
    }
    if (args[0] == "sum") {
        int total = 0;
        for (std::size_t i = 1; i < args.size(); i++) total += std::stoi(args[i]);
        std::cout << "Sum: " << total << "\n";
        return 0;
    }
    return usage();
}
`,
      tests: [
        { description: 'repeat three times', argv: ['repeat', '3', 'hi'], expectedStdout: 'hi\nhi\nhi' },
        { description: 'repeat once', argv: ['repeat', '1', 'x'], expectedStdout: 'x' },
        { description: 'sum of three numbers', argv: ['sum', '1', '2', '3'], expectedStdout: 'Sum: 6' },
        { description: 'sum of nothing is 0', argv: ['sum'], expectedStdout: 'Sum: 0' },
      ],
      hint: 'Which element of `args` is the verb when the vector starts at `argv` instead of `argv + 1`? Then count how many times a loop from 1 to n-1 runs.',
      solution: cpp`
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

int usage() {
    std::cerr << "Usage: main repeat <n> <word> | sum <n>...\n";
    return 1;
}

int main(int argc, char *argv[]) {
    std::vector<std::string> args(argv + 1, argv + argc);
    if (args.empty()) return usage();
    try {
        if (args[0] == "repeat" && args.size() == 3) {
            int n = std::stoi(args[1]);
            for (int i = 0; i < n; i++) std::cout << args[2] << "\n";
            return 0;
        }
        if (args[0] == "sum") {
            int total = 0;
            for (std::size_t i = 1; i < args.size(); i++) total += std::stoi(args[i]);
            std::cout << "Sum: " << total << "\n";
            return 0;
        }
    } catch (const std::exception &) {
        std::cerr << "Not a number\n";
        return 1;
    }
    return usage();
}
`,
    },
    {
      kind: 'create',
      prompt: `Write the command-line shell of Vault++ v1.0, with no file yet.

- \`main add <name> <amount>\` prints \`Added <name> <amount>\` (the amount converted with \`stoi\`, so \`007\` prints as \`7\`).
- \`main total <amount>...\` prints \`Total: <sum>\` of every number after the verb; with no numbers, \`Total: 0\`.
- \`main version\` prints \`Vault++ 1.0\`.
- Anything else, including a verb with the wrong number of operands, prints \`Usage: main add <name> <amount> | total <amount>... | version\` to \`std::cerr\` and returns 1. A bad number prints \`Not a number\` to \`std::cerr\` and returns 1.

Build the argument vector with \`argv + 1\` and \`argv + argc\`, and keep every \`stoi\` inside one try block.`,
      language: 'cpp',
      tests: [
        { description: 'add echoes name and amount', argv: ['add', 'rent', '50'], expectedStdout: 'Added rent 50' },
        { description: 'add converts the amount through stoi', argv: ['add', 'bus', '007'], expectedStdout: 'Added bus 7' },
        { description: 'total adds every operand', argv: ['total', '10', '20', '30'], expectedStdout: 'Total: 60' },
        { description: 'total of nothing', argv: ['total'], expectedStdout: 'Total: 0' },
        { description: 'version', argv: ['version'], expectedStdout: 'Vault++ 1.0' },
      ],
      hint: 'Follow the worked example: a `usage()` function that returns 1, `const std::string &verb = args[0];`, one `if` per verb with its size check, all inside `try`, and `return usage();` as the last line of main.',
      solution: cpp`
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

int usage() {
    std::cerr << "Usage: main add <name> <amount> | total <amount>... | version\n";
    return 1;
}

int main(int argc, char *argv[]) {
    std::vector<std::string> args(argv + 1, argv + argc);
    if (args.empty()) return usage();
    const std::string &verb = args[0];
    try {
        if (verb == "add" && args.size() == 3) {
            int amount = std::stoi(args[2]);
            std::cout << "Added " << args[1] << " " << amount << "\n";
            return 0;
        }
        if (verb == "total") {
            int total = 0;
            for (std::size_t i = 1; i < args.size(); i++) total += std::stoi(args[i]);
            std::cout << "Total: " << total << "\n";
            return 0;
        }
        if (verb == "version" && args.size() == 1) {
            std::cout << "Vault++ 1.0\n";
            return 0;
        }
    } catch (const std::exception &) {
        std::cerr << "Not a number\n";
        return 1;
    }
    return usage();
}
`,
      projectNote: 'Vault++ now has the shape of a command-line tool: verbs instead of a menu, clean stdout, complaints on stderr, a failure status for misuse. The capstone plugs the Vault class from v0.6 into this shell.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 7-2 Project layout and CMake                                       */
/* ------------------------------------------------------------------ */

const l72: Lesson = {
  id: 'cpp-7-2',
  title: 'More than one file',
  objective: 'Split a program into a header and source files, explain what the compiler and the linker each check, and describe the project with a short CMakeLists.txt.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.7.pragma-once', term: '#pragma once', kind: 'keyword', meaning: 'First line of every header: include this file at most once per translation unit, however many files include it. Replaces the #ifndef / #define / #endif guard from C and cannot be mistyped.', example: '#pragma once\n#include <string>\nnamespace vault { int total(const std::vector<Record> &); }' },
    { id: 'cpp.7.header-source', term: 'vault.hpp declares, vault.cpp defines', kind: 'concept', meaning: 'A header holds what callers need to know: struct and class definitions, function declarations, templates. The matching .cpp holds the function bodies and is compiled once. main.cpp includes the header and never sees the bodies.', example: '// vault.hpp\nint total(const std::vector<Record> &records);\n// vault.cpp\nint total(const std::vector<Record> &records) { /* body */ }', analogy: 'A restaurant menu and its kitchen: you order from the menu without entering the kitchen. It breaks for templates, which must live entirely in the header because the compiler needs the body to stamp out each instance.' },
    { id: 'cpp.7.translation-unit', term: 'compile each .cpp, then link', kind: 'concept', meaning: 'Each .cpp file is compiled separately into an object file (g++ -c). The compiler only checks that names are declared. The linker then joins the object files and checks that every used function is defined exactly once: "undefined reference" is a link error, "not declared in this scope" a compile error.', example: 'g++ -std=c++20 -Wall -Wextra -Werror -c vault.cpp -o vault.o\ng++ -std=c++20 -Wall -Wextra -Werror -c main.cpp -o main.o\ng++ vault.o main.o -o main' },
    { id: 'cpp.7.add-executable', term: 'add_executable(main main.cpp)', kind: 'pattern', meaning: 'A CMake line that declares a program and its source files. add_library(vault vault.cpp) declares a library the same way, and target_link_libraries(main PRIVATE vault) joins them. CMake works out the compile and link commands and which files need recompiling.', example: 'add_library(vault vault.cpp)\nadd_executable(main main.cpp)\ntarget_link_libraries(main PRIVATE vault)' },
    { id: 'cpp.7.cmake-build', term: 'cmake -S . -B build && cmake --build build', kind: 'pattern', meaning: 'Configure once: read CMakeLists.txt in the source dir (-S) and write build files into build/ (-B). Then build as often as you like; only files whose sources changed are recompiled. The build directory is disposable and never committed.', example: 'cmake -S . -B build\ncmake --build build\n./build/main list' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Declare in the header, define in the source',
      body: `Every program in this app is one \`main.cpp\`, and the in-app build stays that way. Outside the app a project is split so that pieces can be compiled, read and tested on their own.

A **header** (\`vault.hpp\`) holds what callers need to know: class and struct definitions and function **declarations**. It begins with \`#pragma once\` so including it twice is harmless. A **source file** (\`vault.cpp\`) includes its header and holds the **definitions**, the function bodies. \`main.cpp\` includes the header too and calls the functions without ever seeing their bodies.

Each \`.cpp\` is a **translation unit**, compiled separately into an object file. The compiler checks that every name used is declared; it does not need the body. The **linker** then joins the object files and checks that every function used is defined exactly once. The two checks produce two different errors, and reading which one you got tells you which file to fix.

The three files below are the v0.6 Vault core, laid out this way.`,
      example: {
        language: 'cpp',
        source: cpp`
// ---- vault.hpp ----
#pragma once
#include <string>
#include <vector>

namespace vault {

struct Record {
    std::string name;
    int amount;
};

int total(const std::vector<Record> &records);
std::vector<Record> sorted_by_name(std::vector<Record> records);

}  // namespace vault

// ---- vault.cpp ----
#include "vault.hpp"
#include <algorithm>

namespace vault {

int total(const std::vector<Record> &records) {
    int t = 0;
    for (const Record &r : records) t += r.amount;
    return t;
}

std::vector<Record> sorted_by_name(std::vector<Record> records) {
    std::sort(records.begin(), records.end(),
              [](const Record &a, const Record &b) { return a.name < b.name; });
    return records;
}

}  // namespace vault

// ---- main.cpp ----
#include "vault.hpp"
#include <iostream>

int main() {
    std::vector<vault::Record> records{{"rent", 50}, {"food", 20}};
    for (const vault::Record &r : vault::sorted_by_name(records)) {
        std::cout << r.name << ": " << r.amount << "\n";
    }
    std::cout << "Total: " << vault::total(records) << "\n";
    return 0;
}`,
        labels: [
          { lines: [1, 4], label: 'The header: guard against double inclusion, then only the headers its own declarations need.' },
          { lines: [6, 11], label: 'The namespace keeps our names apart from everyone else\'s. A struct definition must be visible to callers, so it lives here.' },
          { lines: [13, 14], label: 'Declarations: signature and semicolon, no body. This is the whole contract main.cpp compiles against.' },
          { lines: [16, 16], label: 'The closing brace of a namespace gets a comment because it is often far from its opening.' },
          { lines: [18, 20], label: 'The source file includes its own header first, so a mismatch between declaration and definition is a compile error here.' },
          { lines: [22, 28], label: 'Definitions reopen the same namespace. Only this file is recompiled when a body changes.' },
          { lines: [30, 36], label: 'Takes the vector by value on purpose: it sorts its own copy and hands it back.' },
          { lines: [38, 40], label: 'main.cpp sees the header, never vault.cpp. Quotes mean "my header", angle brackets mean "the library\'s".' },
          { lines: [42, 49], label: 'Names from the header carry the vault:: prefix, exactly as std:: does for the library.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'Same split as vault.h / vault.c in the C track, with #pragma once instead of the #ifndef VAULT_H guard, and a namespace instead of a vault_ prefix on every function name.' },
        { from: 'python', note: 'A header is the part of a module you would read to use it: the def lines without bodies. Python needs no such file because it reads the whole module at import time; C++ compiles each file alone and needs the contract written out.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The three files of the worked example are built with these commands. What happens?',
      code: {
        language: 'shell',
        source: cpp`
g++ -std=c++20 -Wall -Wextra -Werror -c vault.cpp -o vault.o
g++ -std=c++20 -Wall -Wextra -Werror -c main.cpp -o main.o
g++ main.o -o main`,
      },
      choices: [
        'The third command fails: undefined reference to vault::total and vault::sorted_by_name, because vault.o was left off the link line',
        'The second command fails: total was not declared in this scope, because main.cpp does not include vault.cpp',
        'All three succeed; ./main prints food: 20, rent: 50 and Total: 70',
        'The first command fails: vault.cpp has no main function',
      ],
      answer: 'The third command fails: undefined reference to vault::total and vault::sorted_by_name, because vault.o was left off the link line',
      explanation: 'Both compilations succeed: `-c` produces an object file and never asks where a function body is or whether there is a main. main.cpp compiles because the header **declares** `total` and `sorted_by_name`. The link step is where definitions must be found, and `main.o` alone does not contain them. `g++ vault.o main.o -o main` fixes it; "undefined reference" always means a link-line problem, not a header problem.',
    },
    {
      kind: 'concept',
      title: 'Let CMake write the commands',
      body: `Typing three \`g++\` lines works for three files and fails at thirty. **CMake** reads a \`CMakeLists.txt\` that names the targets and their sources, generates the build commands, and recompiles only what changed.

- \`cmake_minimum_required\` and \`project\` open every file.
- \`set(CMAKE_CXX_STANDARD 20)\` and \`add_compile_options(-Wall -Wextra -Werror)\` apply this app's flags to every target that follows.
- \`add_library(vault vault.cpp)\` compiles the core once; \`add_executable(main main.cpp)\` declares the program; \`target_link_libraries(main PRIVATE vault)\` is the link line.
- A second executable for the tests links the same library, so the code under test is the code that ships.

Two commands build it: \`cmake -S . -B build\` configures once, writing everything into a disposable \`build/\` directory; \`cmake --build build\` compiles. Edit \`vault.cpp\` and build again: CMake recompiles that one file and relinks the two programs that use it. The in-app build does not run CMake; keep this file in mind for the day your project leaves the app.`,
      example: {
        language: 'text',
        source: cpp`
cmake_minimum_required(VERSION 3.16)
project(vaultpp CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
add_compile_options(-Wall -Wextra -Werror)

add_library(vault vault.cpp)
add_executable(main main.cpp)
target_link_libraries(main PRIVATE vault)

add_executable(vault_tests tests.cpp)
target_link_libraries(vault_tests PRIVATE vault)`,
        labels: [
          { lines: [1, 2], label: 'Which CMake this file was written for, and the project name and language.' },
          { lines: [4, 6], label: 'The same flags the app uses, stated once for every target below.' },
          { lines: [8, 10], label: 'The core as a library, the program as an executable, and the link between them.' },
          { lines: [12, 13], label: 'The test program links the identical library: no second copy of the code under test.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The project has been configured and built once. You change one line inside `vault.cpp` and run `cmake --build build` again. What is recompiled?',
      code: {
        language: 'shell',
        source: cpp`
cmake -S . -B build
cmake --build build
# ... edit a function body in vault.cpp ...
cmake --build build`,
      },
      choices: [
        'Only vault.cpp; then main and vault_tests are relinked',
        'Every .cpp file, because the build directory is rebuilt from scratch each time',
        'Nothing, until cmake -S . -B build is run again to notice the change',
        'vault.cpp and main.cpp, because main.cpp includes vault.hpp',
      ],
      answer: 'Only vault.cpp; then main and vault_tests are relinked',
      explanation: 'CMake records which object file comes from which source and which headers it includes. Only `vault.cpp` is newer than its object file, so only it is recompiled; `main.cpp` includes `vault.hpp`, which did not change. Both executables depend on the library, so both are relinked. Configuring again is needed only when `CMakeLists.txt` itself changes.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the CMakeLists.txt for a program `main` built from `main.cpp` on top of a library `vault` built from `vault.cpp`, in the order the worked example used. Three lines do not belong in a CMake file at all or say the wrong thing.',
      language: 'text',
      indentation: false,
      solution: [
        'cmake_minimum_required(VERSION 3.16)',
        'project(vaultpp CXX)',
        'set(CMAKE_CXX_STANDARD 20)',
        'add_compile_options(-Wall -Wextra -Werror)',
        'add_library(vault vault.cpp)',
        'add_executable(main main.cpp)',
        'target_link_libraries(main PRIVATE vault)',
      ],
      distractors: ['#include "vault.hpp"', 'target_link_libraries(vault PRIVATE main)', 'g++ main.cpp vault.cpp -o main'],
      explanation: 'CMake describes targets; it never includes headers (the compiler does that) and never contains the g++ command (CMake generates it). The link line reads "main uses vault", so `main` comes first in `target_link_libraries`.',
    },
    {
      kind: 'create',
      prompt: `Lay out the Vault core as if it were three files, inside the single file the app can build. Mark three sections with comments: a header section with \`namespace vault { ... }\` containing \`struct Record { std::string name; int amount; }\` and the **declarations** of \`int total(const std::vector<Record> &)\` and \`std::vector<Record> sorted_by_name(std::vector<Record>)\`; a source section that reopens the namespace and **defines** both; and \`main\`.

\`main\` reads name/amount pairs from the command line: \`main rent 50 food 20\` prints each record sorted by name as \`<name>: <amount>\`, then \`Total: <t>\`. No arguments prints just \`Total: 0\`. An odd number of arguments prints a usage line to \`std::cerr\` and returns 1; a bad amount prints \`Not a number\` to \`std::cerr\` and returns 1.`,
      language: 'cpp',
      tests: [
        { description: 'two pairs, sorted', argv: ['rent', '50', 'food', '20'], expectedStdout: 'food: 20\nrent: 50\nTotal: 70' },
        { description: 'no pairs', argv: [], expectedStdout: 'Total: 0' },
        { description: 'three pairs out of order', argv: ['zoo', '1', 'bus', '5', 'food', '20'], expectedStdout: 'bus: 5\nfood: 20\nzoo: 1\nTotal: 26' },
      ],
      hint: 'Copy the declarations and definitions from the worked example. In main, loop `for (std::size_t i = 0; i < args.size(); i += 2)` and push `vault::Record{args[i], std::stoi(args[i + 1])}`.',
      solution: cpp`
#include <algorithm>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

// ---- what vault.hpp would hold: declarations only ----
namespace vault {

struct Record {
    std::string name;
    int amount;
};

int total(const std::vector<Record> &records);
std::vector<Record> sorted_by_name(std::vector<Record> records);

}  // namespace vault

// ---- what vault.cpp would hold: definitions ----
namespace vault {

int total(const std::vector<Record> &records) {
    int t = 0;
    for (const Record &r : records) t += r.amount;
    return t;
}

std::vector<Record> sorted_by_name(std::vector<Record> records) {
    std::sort(records.begin(), records.end(),
              [](const Record &a, const Record &b) { return a.name < b.name; });
    return records;
}

}  // namespace vault

// ---- what main.cpp would hold ----
int main(int argc, char *argv[]) {
    std::vector<std::string> args(argv + 1, argv + argc);
    if (args.size() % 2 != 0) {
        std::cerr << "Usage: main [<name> <amount>]...\n";
        return 1;
    }
    std::vector<vault::Record> records;
    try {
        for (std::size_t i = 0; i < args.size(); i += 2) {
            records.push_back(vault::Record{args[i], std::stoi(args[i + 1])});
        }
    } catch (const std::exception &) {
        std::cerr << "Not a number\n";
        return 1;
    }
    for (const vault::Record &r : vault::sorted_by_name(records)) {
        std::cout << r.name << ": " << r.amount << "\n";
    }
    std::cout << "Total: " << vault::total(records) << "\n";
    return 0;
}
`,
      projectNote: 'The Vault core now has a visible contract (the declarations) separate from its bodies. Cutting the file at the section comments gives you vault.hpp, vault.cpp and main.cpp for the CMake project.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 7-3 Unit tests                                                     */
/* ------------------------------------------------------------------ */

const l73: Lesson = {
  id: 'cpp-7-3',
  title: 'Proving the core works',
  objective: 'Write a tiny check-based test runner and use it to test the pure functions of Vault before touching any I/O.',
  minutes: 24,
  lexicon: [
    { id: 'cpp.7.check', term: 'void check(bool ok, const char *what)', kind: 'pattern', meaning: 'The whole test runner: count a pass, or count a failure and print FAIL: with the description. Each call is one test; the condition is the claim and the text is what you would want to read when it breaks.', example: 'check(parse_amount("50") == 50, "parses a plain number");\ncheck(!parse_amount("abc"), "rejects letters");' },
    { id: 'cpp.7.tests-passed', term: 'std::cout << passed << " tests passed\\n";', kind: 'pattern', meaning: 'The runner\'s last word, followed by the failure count only when it is non-zero, and a non-zero return from main when anything failed. Passing tests print nothing: a quiet run is a good run.', example: 'std::cout << passed << " tests passed\\n";\nif (failed > 0) std::cout << failed << " tests failed\\n";\nreturn failed == 0 ? 0 : 1;' },
    { id: 'cpp.7.pure-function', term: 'pure function', kind: 'concept', meaning: 'A function whose result depends only on its arguments and that neither prints, reads input, nor touches a file. Pure functions are the easy ones to test: call, compare, done. Design Vault so that total, find and sorted are pure and only main prints.', example: 'std::optional<int> Vault::find(const std::string &name) const;   // returns, does not print', analogy: 'A formula: same input, same answer, every time. It breaks for functions that read a file or std::cin; a test for those must first set up that outside world.' },
    { id: 'cpp.7.optional-compare', term: 'opt == 50', kind: 'operator', meaning: 'An optional compares with a plain value directly: true when it holds that value, false when it is empty or holds another. !opt is true for an empty optional. No * needed in a test, and no undefined behaviour on an empty one.', example: 'check(v.find("food") == 20, "find returns the amount");\ncheck(!v.find("gym"), "find misses an absent name");' },
    { id: 'cpp.7.catch2', term: 'Catch2 / GoogleTest', kind: 'concept', meaning: 'Real test frameworks. They find tests by a macro (TEST_CASE, TEST) so there is no list to maintain, print both sides of a failed comparison, run a subset by name, and plug into CMake\'s ctest. The check runner teaches the same shape in twelve lines.', example: '// Catch2, outside the app:\nTEST_CASE("total adds every record") {\n    Vault v; v.add(Record("rent", 50));\n    REQUIRE(v.total() == 50);\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A test is a claim the program checks for you',
      body: `You have been testing Vault++ by running it and reading the screen. A **test** writes the claim down so the computer reads it: call a function with a known input, compare with the expected result, count the outcome.

The runner is tiny. \`check(bool ok, const char *what)\` counts a pass, or counts a failure and prints \`FAIL: <what>\`. At the end main prints \`<n> tests passed\`, adds a failure line only when needed, and returns non-zero if anything failed, so a build script stops. Passing tests print nothing.

What makes a function easy to test is being **pure**: its answer depends only on its arguments and it prints nothing. \`parse_amount\` below is pure, so each test is one line. Vault's \`list\` and \`find\` print inside the class; the first thing this lesson changes is that they return values and main prints them.

Frameworks such as **Catch2** and **GoogleTest** add what you would miss at scale: tests found by a macro instead of listed by hand, both sides of a failed comparison in the report, running one test by name, and a \`ctest\` target in CMake. They are libraries you install, so the app uses the runner below; the habit is the same.`,
      example: {
        language: 'cpp',
        source: cpp`
#include <iostream>
#include <optional>
#include <stdexcept>
#include <string>

int passed = 0;
int failed = 0;

void check(bool ok, const char *what) {
    if (ok) {
        passed++;
    } else {
        failed++;
        std::cout << "FAIL: " << what << "\n";
    }
}

std::optional<int> parse_amount(const std::string &text) {
    try {
        int value = std::stoi(text);
        if (value < 0) return std::nullopt;
        return value;
    } catch (const std::exception &) {
        return std::nullopt;
    }
}

int main() {
    check(parse_amount("50") == 50, "parses a plain number");
    check(!parse_amount("abc"), "rejects letters");
    check(!parse_amount("-5"), "rejects a negative amount");
    check(parse_amount(" 7") == 7, "skips leading spaces");
    std::cout << passed << " tests passed\n";
    if (failed > 0) std::cout << failed << " tests failed\n";
    return failed == 0 ? 0 : 1;
}`,
        labels: [
          { lines: [6, 7], label: 'Two counters the runner owns. A global is acceptable here because the whole program is the test run.' },
          { lines: [9, 16], label: 'The runner: a pass is silent, a failure is named. The description is for the reader of a red run.' },
          { lines: [18, 26], label: 'The code under test. Pure: text in, optional out, nothing printed, so no I/O to fake.' },
          { lines: [28, 32], label: 'Four claims, one line each: the normal case, two refusals, and a boundary stoi handles for you.' },
          { lines: [33, 35], label: 'The verdict, and a status the shell and CMake can act on.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'C has assert(), which aborts the program at the first failure with no count. check keeps going so one run reports every broken claim, and there is no NDEBUG switch that silently removes the tests from a release build.' },
        { from: 'python', note: 'This is run_tests() from the Python track with check instead of assert: the condition is a bool, the message a C string, and the count is printed the same way. Catch2 is to this what pytest is to run_tests.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The function under test has a bug. What does the run print, in order?',
      code: {
        language: 'cpp',
        source: cpp`
int clamp_amount(int amount) {
    if (amount < 0) return 0;
    if (amount > 1000) return 100;
    return amount;
}

int main() {
    check(clamp_amount(50) == 50, "keeps a normal amount");
    check(clamp_amount(-5) == 0, "lifts a negative to zero");
    check(clamp_amount(5000) == 1000, "caps at the limit");
    std::cout << passed << " tests passed\n";
    if (failed > 0) std::cout << failed << " tests failed\n";
    return failed == 0 ? 0 : 1;
}`,
      },
      choices: [
        'FAIL: caps at the limit\n2 tests passed\n1 tests failed',
        '2 tests passed\n1 tests failed\nFAIL: caps at the limit',
        'FAIL: caps at the limit\n3 tests passed',
        '3 tests passed',
      ],
      answer: 'FAIL: caps at the limit\n2 tests passed\n1 tests failed',
      explanation: '`clamp_amount(5000)` returns 100, not 1000 (a dropped zero), so the third check fails. `check` prints the FAIL line **at the moment of the failure**, before main reaches the summary, so it comes first. Two checks passed, one failed, and the failure line is printed because `failed > 0`. The exit status is 1, which is why a test harness treats this run as broken even though two claims held.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the runner and two tests of `parse_amount` (which returns `std::optional<int>`).',
      language: 'cpp',
      template: cpp`
int passed = 0;
int failed = 0;

void check({{param}} ok, const char *what) {
    if (ok) {
        {{inc}};
    } else {
        failed++;
        std::cout << "FAIL: " << {{msg}} << "\n";
    }
}

int main() {
    check(parse_amount("50") {{cmp}} 50, "parses a plain number");
    check({{neg}}parse_amount("abc"), "rejects letters");
    std::cout << {{count}} << " tests passed\n";
    return failed == 0 ? 0 : 1;
}`,
      blanks: [
        { id: 'param', answers: ['bool'], hint: 'the type of a claim that holds or does not' },
        { id: 'inc', answers: ['passed++', '++passed', 'passed += 1'], hint: 'count the pass' },
        { id: 'msg', answers: ['what'], hint: 'the description handed in with the claim' },
        { id: 'cmp', answers: ['=='], hint: 'an optional compares directly with a value' },
        { id: 'neg', answers: ['!'], hint: 'an empty optional is false' },
        { id: 'count', answers: ['passed'], hint: 'which counter goes in the summary line' },
      ],
      explanation: 'The claim is a `bool`; a pass bumps `passed`; a failure prints `what`. `std::optional<int> == 50` is true only when the optional holds 50, and `!` is true only when it is empty, so neither test needs `*`.',
    },
    {
      kind: 'modify',
      prompt: `This file holds a Vault whose \`total\` and \`find\` are pure, plus four tests. The run prints:

\`\`\`
FAIL: total adds every record
FAIL: find reaches a record that is not first
2 tests passed
2 tests failed
\`\`\`

Fix the two member functions so that all four tests pass and the run prints \`4 tests passed\`. Do not change the tests.`,
      language: 'cpp',
      starter: cpp`
#include <iostream>
#include <optional>
#include <string>
#include <vector>

class Record {
public:
    Record(std::string name, int amount) : name_(std::move(name)), amount_(amount) {}
    const std::string &name() const { return name_; }
    int amount() const { return amount_; }
private:
    std::string name_;
    int amount_;
};

class Vault {
public:
    void add(Record r) { records_.push_back(std::move(r)); }
    std::size_t size() const { return records_.size(); }
    int total() const {
        int t = 0;
        for (std::size_t i = 0; i + 1 < records_.size(); i++) t += records_[i].amount();
        return t;
    }
    std::optional<int> find(const std::string &name) const {
        for (const Record &r : records_) {
            if (r.name() != name) return std::nullopt;
            return r.amount();
        }
        return std::nullopt;
    }
private:
    std::vector<Record> records_;
};

int passed = 0;
int failed = 0;

void check(bool ok, const char *what) {
    if (ok) {
        passed++;
    } else {
        failed++;
        std::cout << "FAIL: " << what << "\n";
    }
}

int main() {
    Vault v;
    v.add(Record("rent", 50));
    v.add(Record("food", 20));
    v.add(Record("bus", 5));
    check(v.size() == 3, "size counts every add");
    check(v.total() == 75, "total adds every record");
    check(v.find("bus") == 5, "find reaches a record that is not first");
    check(!v.find("gym"), "find misses an absent name");
    std::cout << passed << " tests passed\n";
    if (failed > 0) std::cout << failed << " tests failed\n";
    return failed == 0 ? 0 : 1;
}
`,
      tests: [{ description: 'all four tests pass', expectedStdout: '4 tests passed' }],
      hint: 'Read each failing test\'s description as the specification. In `total`, how many records does `i + 1 < size()` visit? In `find`, which record is the only one that can ever be compared?',
      solution: cpp`
#include <iostream>
#include <optional>
#include <string>
#include <vector>

class Record {
public:
    Record(std::string name, int amount) : name_(std::move(name)), amount_(amount) {}
    const std::string &name() const { return name_; }
    int amount() const { return amount_; }
private:
    std::string name_;
    int amount_;
};

class Vault {
public:
    void add(Record r) { records_.push_back(std::move(r)); }
    std::size_t size() const { return records_.size(); }
    int total() const {
        int t = 0;
        for (std::size_t i = 0; i < records_.size(); i++) t += records_[i].amount();
        return t;
    }
    std::optional<int> find(const std::string &name) const {
        for (const Record &r : records_) {
            if (r.name() == name) return r.amount();
        }
        return std::nullopt;
    }
private:
    std::vector<Record> records_;
};

int passed = 0;
int failed = 0;

void check(bool ok, const char *what) {
    if (ok) {
        passed++;
    } else {
        failed++;
        std::cout << "FAIL: " << what << "\n";
    }
}

int main() {
    Vault v;
    v.add(Record("rent", 50));
    v.add(Record("food", 20));
    v.add(Record("bus", 5));
    check(v.size() == 3, "size counts every add");
    check(v.total() == 75, "total adds every record");
    check(v.find("bus") == 5, "find reaches a record that is not first");
    check(!v.find("gym"), "find misses an absent name");
    std::cout << passed << " tests passed\n";
    if (failed > 0) std::cout << failed << " tests failed\n";
    return failed == 0 ? 0 : 1;
}
`,
    },
    {
      kind: 'create',
      prompt: `Write the tests first, then the Vault that passes them.

The pure core: \`Record(name, amount)\` with accessors, and \`Vault\` with \`add(Record)\`, \`size()\`, \`total()\`, \`find(name)\` returning \`std::optional<int>\`, and \`sorted()\` returning a copy of the records ordered by name. None of them prints.

\`main selftest\` runs **at least five** checks through the \`check\` runner: cover an empty vault (size, total, a miss) and a filled one (total, a hit, a miss, the first and last of \`sorted()\`), then prints \`<n> tests passed\` and returns 0 only when every check held.

\`main demo\` adds \`rent 50\`, \`food 20\`, \`bus 5\` and prints: the sorted records as \`<name>: <amount>\`, then \`Records: 3\`, \`Total: 75\`, the result of \`find("food")\` as \`food: 20\`, and the result of \`find("gym")\` as \`Not found\`. Anything else prints a usage line to \`std::cerr\` and returns 1.`,
      language: 'cpp',
      tests: [
        { description: 'selftest reports at least five passing checks', argv: ['selftest'], expectedStdout: '^([5-9]|[1-9][0-9]+) tests passed$', match: 'regex' },
        { description: 'demo prints through the pure core', argv: ['demo'], expectedStdout: 'bus: 5\nfood: 20\nrent: 50\nRecords: 3\nTotal: 75\nfood: 20\nNot found' },
      ],
      hint: '`sorted()` copies `records_` into a local vector, `std::sort`s it with a lambda comparing `name()`, and returns the copy. In demo, `std::optional<int> hit = v.find("food"); if (hit) ... else ...`.',
      solution: cpp`
#include <algorithm>
#include <iostream>
#include <optional>
#include <string>
#include <vector>

class Record {
public:
    Record(std::string name, int amount) : name_(std::move(name)), amount_(amount) {}
    const std::string &name() const { return name_; }
    int amount() const { return amount_; }
private:
    std::string name_;
    int amount_;
};

class Vault {
public:
    void add(Record r) { records_.push_back(std::move(r)); }
    std::size_t size() const { return records_.size(); }
    int total() const {
        int t = 0;
        for (const Record &r : records_) t += r.amount();
        return t;
    }
    std::optional<int> find(const std::string &name) const {
        for (const Record &r : records_) {
            if (r.name() == name) return r.amount();
        }
        return std::nullopt;
    }
    std::vector<Record> sorted() const {
        std::vector<Record> copy = records_;
        std::sort(copy.begin(), copy.end(),
                  [](const Record &a, const Record &b) { return a.name() < b.name(); });
        return copy;
    }
private:
    std::vector<Record> records_;
};

int passed = 0;
int failed = 0;

void check(bool ok, const char *what) {
    if (ok) {
        passed++;
    } else {
        failed++;
        std::cout << "FAIL: " << what << "\n";
    }
}

int selftest() {
    Vault empty;
    check(empty.size() == 0, "a new vault is empty");
    check(empty.total() == 0, "an empty vault totals 0");
    check(!empty.find("rent"), "find on an empty vault misses");
    check(empty.sorted().empty(), "sorting an empty vault gives nothing");

    Vault v;
    v.add(Record("rent", 50));
    v.add(Record("food", 20));
    v.add(Record("bus", 5));
    check(v.size() == 3, "size counts every add");
    check(v.total() == 75, "total adds every record");
    check(v.find("food") == 20, "find returns the amount of a known name");
    check(!v.find("gym"), "find misses an absent name");
    check(v.sorted()[0].name() == "bus", "sorted puts the alphabetically first name first");
    check(v.sorted()[2].name() == "rent", "sorted puts the alphabetically last name last");
    check(v.size() == 3, "sorted does not change the vault");

    std::cout << passed << " tests passed\n";
    if (failed > 0) std::cout << failed << " tests failed\n";
    return failed == 0 ? 0 : 1;
}

int demo() {
    Vault v;
    v.add(Record("rent", 50));
    v.add(Record("food", 20));
    v.add(Record("bus", 5));
    for (const Record &r : v.sorted()) std::cout << r.name() << ": " << r.amount() << "\n";
    std::cout << "Records: " << v.size() << "\n";
    std::cout << "Total: " << v.total() << "\n";
    std::optional<int> hit = v.find("food");
    std::cout << (hit ? "food: " + std::to_string(*hit) : "Not found") << "\n";
    std::optional<int> miss = v.find("gym");
    std::cout << (miss ? "gym: " + std::to_string(*miss) : "Not found") << "\n";
    return 0;
}

int main(int argc, char *argv[]) {
    std::vector<std::string> args(argv + 1, argv + argc);
    if (args.size() == 1 && args[0] == "selftest") return selftest();
    if (args.size() == 1 && args[0] == "demo") return demo();
    std::cerr << "Usage: main selftest | demo\n";
    return 1;
}
`,
      projectNote: 'Vault\'s core is now pure and proven: total, find and sorted return values and have tests, and only main prints. The capstone keeps this core unchanged and wires the verbs around it.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 7-4 Reading other people's code                                    */
/* ------------------------------------------------------------------ */

const colsum = cpp`
#include <fstream>
#include <iostream>
#include <map>
#include <optional>
#include <sstream>
#include <string>
#include <vector>

struct Column { int count = 0, sum = 0, min = 0, max = 0; };

std::vector<std::string> split(const std::string &line, char sep) {
    std::vector<std::string> fields;
    std::istringstream in(line);
    std::string field;
    while (std::getline(in, field, sep)) fields.push_back(field);
    return fields;
}

std::optional<int> to_int(const std::string &text) {
    try {
        std::size_t used = 0;
        int value = std::stoi(text, &used);
        if (used != text.size()) return std::nullopt;
        return value;
    } catch (const std::exception &) {
        return std::nullopt;
    }
}

void record(Column &col, int value) {
    if (col.count == 0 || value < col.min) col.min = value;
    if (col.count == 0 || value > col.max) col.max = value;
    col.sum += value;
    col.count++;
}

std::map<std::string, Column> summarise(std::istream &in) {
    std::map<std::string, Column> columns;
    std::string line;
    if (!std::getline(in, line)) return columns;
    std::vector<std::string> names = split(line, ',');
    while (std::getline(in, line)) {
        std::vector<std::string> fields = split(line, ',');
        for (std::size_t i = 0; i < fields.size() && i < names.size(); i++) {
            std::optional<int> value = to_int(fields[i]);
            if (value) record(columns[names[i]], *value);
        }
    }
    return columns;
}

int passed = 0;
void check(bool ok, const char *what) { if (ok) passed++; else std::cout << "FAIL: " << what << "\n"; }

int selftest() {
    check(split("a,b,c", ',').size() == 3, "split counts fields");
    check(split("a,,c", ',')[1].empty(), "split keeps an empty middle field");
    check(to_int("42") == 42, "to_int parses digits");
    check(!to_int("4x"), "to_int rejects trailing junk");
    std::cout << passed << " tests passed\n";
    return 0;
}

int main(int argc, char *argv[]) {
    std::vector<std::string> args(argv + 1, argv + argc);
    if (args.size() == 1 && args[0] == "selftest") return selftest();
    if (args.size() != 1) {
        std::cerr << "Usage: colsum <file.csv> | selftest\n";
        return 1;
    }
    std::ifstream in(args[0]);
    if (!in) {
        std::cerr << "Cannot open " << args[0] << "\n";
        return 1;
    }
    for (const auto &[name, col] : summarise(in)) {
        std::cout << name << ": count=" << col.count << " sum=" << col.sum
                  << " min=" << col.min << " max=" << col.max << "\n";
    }
    return 0;
}
`;

const shopCsv = 'item,price,stock\npen,3,120\nbook,12,8\nmug,7,15\nlamp,25,2\n';
const shopSummary = 'price: count=4 sum=47 min=3 max=25\nstock: count=4 sum=145 min=2 max=120';

const l74: Lesson = {
  id: 'cpp-7-4',
  title: "Reading other people's code",
  objective: 'Find your way around an unfamiliar C++ program, fix a described bug in it, and add a feature without breaking its existing behaviour.',
  minutes: 28,
  lexicon: [
    { id: 'cpp.7.reading-order', term: 'reading order', kind: 'concept', meaning: 'How to read code you did not write: main first, for the plan in a few calls; then the function signatures as a table of contents; then the tests as examples of what each function promises; and only then the bodies you need to change.', example: '// 1. main at the bottom\n// 2. the signatures: split, to_int, record, summarise\n// 3. the checks in selftest\n// 4. one body at a time', analogy: 'Reading a textbook from its contents page and worked examples before the chapters. It breaks when a program has no tests and no clear entry point; then start from the function that produces the output you care about.' },
    { id: 'cpp.7.map', term: 'std::map<std::string, Column>', kind: 'builtin', meaning: 'From <map>: keys to values, kept sorted by key. m[key] returns the value for key, creating a default one if it is absent; m.find(key) looks without creating and returns end() on a miss. Iterating visits keys in sorted order, which makes output deterministic for free.', example: 'std::map<std::string, int> totals;\ntotals["food"] += 20;              // creates food at 0, then adds\nauto it = totals.find("rent");      // end() if absent' },
    { id: 'cpp.7.structured-binding', term: 'for (const auto &[name, col] : columns)', kind: 'pattern', meaning: 'Unpack each key/value pair of a map into two named references as the loop runs. Without it you write pair.first and pair.second.', example: 'for (const auto &[name, col] : columns) {\n    std::cout << name << ": " << col.sum << "\\n";\n}' },
    { id: 'cpp.7.getline-delim', term: 'std::getline(in, field, \',\')', kind: 'pattern', meaning: 'Read up to the next separator instead of the next newline: the way to split a line into fields. Empty fields between two separators are kept; a trailing separator does not produce a final empty field.', example: 'std::istringstream in("a,,c");\nstd::string field;\nwhile (std::getline(in, field, \',\')) fields.push_back(field);   // "a", "", "c"' },
    { id: 'cpp.7.sanitizers', term: '-fsanitize=address,undefined', kind: 'concept', meaning: 'Compiler flags that instrument the program to catch, at run time, what -Wall cannot see at compile time: reads past the end of a vector, use after free, leaks, signed overflow. Used for test builds; too slow for release. clang-tidy is the static counterpart: it reads the source and flags risky patterns without running it.', example: 'g++ -std=c++20 -g -fsanitize=address,undefined main.cpp -o main\n./main selftest          # a bad index now stops with a stack trace' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Start at main, then read the names',
      body: `Most programming is reading code someone else wrote, with pieces you do not recognise. The skill is to find the plan without reading every line.

Read in this order. **First**, \`main\` at the bottom: it says what the program does in a few calls. **Second**, the signatures: \`split\`, \`to_int\`, \`record\`, \`summarise\`, \`selftest\` are the table of contents, and their parameter and return types say what flows between them. **Third**, the checks in \`selftest\`: each one is a worked example of what a function promises. **Only then** the bodies, and only the ones you need.

The program below was written by someone else. It summarises every numeric column of a CSV file: \`price: count=4 sum=47 min=3 max=25\`. It uses three things you have not met: \`std::map\`, \`std::getline\` with a separator, and a structured binding in the final loop. The labels explain each. Notice that you could say what the program does from \`main\` alone, before understanding any of them.`,
      example: {
        language: 'cpp',
        source: colsum,
        labels: [
          { lines: [1, 7], label: 'The includes are the first table of contents: files, streams, a map, optional, string streams.' },
          { lines: [9, 9], label: 'One summary per column. Default member values mean a fresh Column is all zeros.' },
          { lines: [11, 17], label: 'Text in, fields out. getline with a separator cuts at commas instead of newlines.' },
          { lines: [19, 28], label: 'Strict conversion: stoi reports how many characters it used, and anything left over means "not a number".' },
          { lines: [30, 35], label: 'Fold one value into a column. The count==0 test makes the first value both min and max.' },
          { lines: [37, 50], label: 'The plan: header line gives the names, every other line gives fields; numeric fields update the column of the same position. map[name] creates the column on first use.' },
          { lines: [44, 44], label: 'Both bounds, so a short row or a long row never indexes past either vector.' },
          { lines: [52, 53], label: 'The runner from 7-3, compressed to two lines. Same shape.' },
          { lines: [55, 62], label: 'Read these third: four promises about split and to_int, including the quirk about empty fields.' },
          { lines: [64, 81], label: 'Read this first: a selftest verb, a usage check, open the file, print each column in map order (sorted by name).' },
          { lines: [76, 79], label: 'The structured binding names the key and value of each pair; the output format lives only here.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'The C version of this would be strtok for splitting, strtol with an end pointer for the strict conversion, and a hand-written sorted array of names for the map. Every one of those is a line or two here, which is the reason to learn the library names.' },
        { from: 'python', note: 'This is the statement importer from the Python track in C++: split is line.split(","), the map is a dict that happens to stay sorted, and the structured binding is for name, col in columns.items().' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The program is run as `colsum data.csv` with this file. What does it print?\n\n```\nname,amount,qty\nrent,50,1\nfood,20,x\nbus,5\n```',
      code: {
        language: 'cpp',
        source: cpp`
std::map<std::string, Column> summarise(std::istream &in) {
    std::map<std::string, Column> columns;
    std::string line;
    if (!std::getline(in, line)) return columns;
    std::vector<std::string> names = split(line, ',');
    while (std::getline(in, line)) {
        std::vector<std::string> fields = split(line, ',');
        for (std::size_t i = 0; i < fields.size() && i < names.size(); i++) {
            std::optional<int> value = to_int(fields[i]);
            if (value) record(columns[names[i]], *value);
        }
    }
    return columns;
}`,
      },
      choices: [
        'amount: count=3 sum=75 min=5 max=50\nqty: count=1 sum=1 min=1 max=1',
        'name: count=0 sum=0 min=0 max=0\namount: count=3 sum=75 min=5 max=50\nqty: count=1 sum=1 min=1 max=1',
        'amount: count=3 sum=75 min=5 max=50\nqty: count=2 sum=1 min=0 max=1',
        'amount: count=2 sum=70 min=20 max=50\nqty: count=1 sum=1 min=1 max=1',
      ],
      answer: 'amount: count=3 sum=75 min=5 max=50\nqty: count=1 sum=1 min=1 max=1',
      explanation: 'A column is created only by `columns[names[i]]`, which runs only when `to_int` succeeded, so `name` (all text) never appears and `x` does not count towards `qty`. The short row `bus,5` has two fields; the loop bound `i < fields.size()` stops before a third, so its 5 still reaches `amount` (count 3, min 5). The map iterates in key order, so `amount` prints before `qty`.',
    },
    {
      kind: 'modify',
      prompt: `A teammate reports two problems with this copy of the summariser:

- \`colsum shop.csv\` prints \`min=0\` for every column, although no value in the file is 0
- \`colsum selftest\` prints \`FAIL: to_int rejects trailing junk\` and \`3 tests passed\`

Use the reading order: find the two functions from the descriptions, fix them, and change nothing else. With the fixture the program must print the real minimums and the selftest must report \`4 tests passed\`.`,
      language: 'cpp',
      starter: colsum.replace('    if (col.count == 0 || value < col.min) col.min = value;', '    if (value < col.min) col.min = value;').replace('        if (used != text.size()) return std::nullopt;\n', ''),
      tests: [
        { description: 'minimums are real', files: { 'shop.csv': shopCsv }, argv: ['shop.csv'], expectedStdout: shopSummary },
        { description: 'selftest passes', argv: ['selftest'], expectedStdout: '4 tests passed' },
      ],
      hint: 'A fresh Column has min = 0, so a positive value is never "less than min" unless the first value is treated specially; look at how max handles it. For to_int, the test says what "4x" should do; stoi can tell you how many characters it used.',
      solution: colsum,
    },
    {
      kind: 'create',
      prompt: `Add a feature without breaking what the program already does.

- \`colsum <file> <column>\` prints only that column's line, in the existing format.
- If there is no numeric column of that name, print \`No column <name>\` and return 0.
- \`colsum <file>\` and \`colsum selftest\` must behave exactly as before.

Use \`columns.find(name)\`, which does not create a column, rather than \`columns[name]\`, which would.`,
      language: 'cpp',
      starter: colsum,
      tests: [
        { description: 'all columns, unchanged', files: { 'shop.csv': shopCsv }, argv: ['shop.csv'], expectedStdout: shopSummary },
        { description: 'one column', files: { 'shop.csv': shopCsv }, argv: ['shop.csv', 'price'], expectedStdout: 'price: count=4 sum=47 min=3 max=25' },
        { description: 'a column that does not exist', files: { 'shop.csv': shopCsv }, argv: ['shop.csv', 'weight'], expectedStdout: 'No column weight' },
        { description: 'a text column is not a numeric column', files: { 'shop.csv': shopCsv }, argv: ['shop.csv', 'item'], expectedStdout: 'No column item' },
        { description: 'selftest unchanged', argv: ['selftest'], expectedStdout: '4 tests passed' },
      ],
      hint: 'Move the two cout lines into `void print_column(const std::string &name, const Column &col)` so both paths share the format. Allow one or two arguments; with two, `auto it = columns.find(args[1]);` and print `it->first, it->second` unless `it == columns.end()`.',
      solution: colsum
        .replace('int passed = 0;', 'void print_column(const std::string &name, const Column &col) {\n    std::cout << name << ": count=" << col.count << " sum=" << col.sum\n              << " min=" << col.min << " max=" << col.max << "\\n";\n}\n\nint passed = 0;')
        .replace('    if (args.size() != 1) {\n        std::cerr << "Usage: colsum <file.csv> | selftest\\n";', '    if (args.empty() || args.size() > 2) {\n        std::cerr << "Usage: colsum <file.csv> [<column>] | selftest\\n";')
        .replace('    for (const auto &[name, col] : summarise(in)) {\n        std::cout << name << ": count=" << col.count << " sum=" << col.sum\n                  << " min=" << col.min << " max=" << col.max << "\\n";\n    }\n    return 0;', '    std::map<std::string, Column> columns = summarise(in);\n    if (args.size() == 2) {\n        auto it = columns.find(args[1]);\n        if (it == columns.end()) {\n            std::cout << "No column " << args[1] << "\\n";\n            return 0;\n        }\n        print_column(it->first, it->second);\n        return 0;\n    }\n    for (const auto &[name, col] : columns) print_column(name, col);\n    return 0;'),
      projectNote: 'Tests are what make other people\'s code safe to change: the fixture runs and the selftest tell "I extended it" apart from "I broke it". Vault++ v1.0 gets the same safety net.',
    },
    {
      kind: 'concept',
      title: 'Two more readers for your code',
      body: `\`-Wall -Wextra -Werror\` catch what the compiler can see without running the program. Two tools catch the rest.

- **Sanitizers** instrument the program at compile time: \`g++ -std=c++20 -g -fsanitize=address,undefined main.cpp\`. The result stops with a stack trace on the first read past the end of a vector, use of freed memory, leak, or signed overflow, instead of printing garbage or passing by luck. Run your tests under it; it is a few times slower, so release builds leave it out. In CMake it is one \`add_compile_options\` and one \`add_link_options\` line.
- **clang-tidy** reads the source without running it: \`clang-tidy main.cpp -- -std=c++20\`. Its \`bugprone-\`, \`performance-\` and \`modernize-\` checks flag things such as a container copied where a reference would do, or a \`new\` that should be \`std::make_unique\`. CMake runs it on every file with \`set(CMAKE_CXX_CLANG_TIDY clang-tidy)\`.

Neither is available in the app. Both belong in the CMake project the day Vault++ leaves it: the tests prove what you meant, the sanitizers prove you did not break the machine on the way.`,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 7-5 Capstone: Vault++ v1.0                                         */
/* ------------------------------------------------------------------ */

const l75: Lesson = {
  id: 'cpp-7-5',
  title: 'Vault++ v1.0: verbs and a selftest',
  objective: 'Ship Vault++ as a command-line tool: five verbs over vault.txt, usage on stderr, and a selftest verb that proves the pure core.',
  minutes: 30,
  lexicon: [
    { id: 'cpp.7.ios-app', term: 'std::ofstream out(path, std::ios::app);', kind: 'builtin', meaning: 'Open a file for appending: writes go after whatever is already there instead of replacing it. The right mode when one command adds one record and must not rewrite the rest.', example: 'std::ofstream out("vault.txt", std::ios::app);\nout << name << " " << amount << "\\n";' },
    { id: 'cpp.7.core-shell', term: 'pure core, thin shell', kind: 'concept', meaning: 'Keep everything that computes (Vault: total, find, sorted) free of I/O, and put every cout, cerr, file and argv in main. The core gets unit tests; the shell gets one test per verb through the real command line.', example: '// core:  std::optional<int> Vault::find(const std::string &) const;\n// shell: if (amount) std::cout << name << ": " << *amount << "\\n"; else std::cout << "Not found\\n";', analogy: 'A calculator chip inside a case with buttons: you test the chip with signals and the case by pressing buttons. It breaks here: unlike hardware, you can leave the chip out of the case entirely, which is what selftest does.' },
    { id: 'cpp.7.selftest-verb', term: 'main selftest', kind: 'pattern', meaning: 'A verb that runs the unit tests of the pure core inside the shipped program and prints <n> tests passed, touching no file and reading no input. Handled before the vault is loaded, so it works in an empty directory.', example: 'if (verb == "selftest" && args.size() == 1) return selftest();\nVault vault;\nvault.load("vault.txt");' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The last rebuild',
      body: `Vault++ v1.0 replaces the \`Command?\` loop with verbs from 7-1 around the pure core from 7-3, and keeps the file format of v0.6.

- \`main add <name> <amount>\` appends \`<name> <amount>\` to \`vault.txt\` (opened with \`std::ios::app\`) and prints \`Added <name> <amount>\`.
- \`main list\` prints every record sorted by name as \`<name>: <amount>\`, then \`Records: <n>\`.
- \`main total\` prints \`Total: <t>\`; \`main find <name>\` prints \`<name>: <amount>\` or \`Not found\`.
- \`main selftest\` runs the checks on \`Vault\` with no file access and prints \`<n> tests passed\`.
- Anything else prints \`Usage: main add|list|total|find|selftest\` to \`std::cerr\` and returns 1. A bad amount prints \`Not a number: <text>\` to \`std::cerr\` and returns 1.

The order inside main matters: dispatch \`selftest\` **before** loading the file, so the tests never depend on the working directory. Every other verb loads \`vault.txt\` (a missing file is zero records, as in v0.6) and then does one thing. Nothing in \`Vault\` prints; the format strings live only in main.`,
      example: {
        language: 'cpp',
        source: cpp`
int main(int argc, char *argv[]) {
    std::vector<std::string> args(argv + 1, argv + argc);
    if (args.empty()) return usage();
    const std::string &verb = args[0];
    if (verb == "selftest" && args.size() == 1) return selftest();

    Vault vault;
    vault.load("vault.txt");
    if (verb == "add" && args.size() == 3) {
        int amount;
        try {
            amount = std::stoi(args[2]);
        } catch (const std::exception &) {
            std::cerr << "Not a number: " << args[2] << "\n";
            return 1;
        }
        Record r(args[1], amount);
        Vault::append("vault.txt", r);
        std::cout << "Added " << r.name() << " " << r.amount() << "\n";
        return 0;
    }
    if (verb == "find" && args.size() == 2) {
        std::optional<int> amount = vault.find(args[1]);
        if (amount) std::cout << args[1] << ": " << *amount << "\n";
        else std::cout << "Not found\n";
        return 0;
    }
    return usage();
}`,
        labels: [
          { lines: [2, 4], label: 'Arguments as strings, the empty case, and a name for the verb.' },
          { lines: [5, 5], label: 'selftest first: no file is touched, so it runs anywhere.' },
          { lines: [7, 8], label: 'Every remaining verb starts from whatever is on disk; a missing file is an empty vault.' },
          { lines: [9, 16], label: 'Convert the operand before doing anything; a failure is reported on cerr and nothing is written.' },
          { lines: [17, 20], label: 'Append one line to the file, then report. The vault in memory is not needed for add.' },
          { lines: [22, 27], label: 'The core answers with an optional; the shell turns it into the two messages.' },
          { lines: [28, 28], label: 'Unknown verb or wrong operand count: usage on cerr, status 1.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'The C Vault v1.0 had the same verbs with strcmp and fopen(path, "a"). Here the file mode is std::ios::app, the vault is a class whose tests run from the same binary, and nothing is freed by hand.' },
        { from: 'python', note: 'The Python ledger v1.0 reached this shape with argparse subcommands and a separate test file. Here the dispatch is five ifs and the tests travel inside the program as the selftest verb.' },
      ],
    },
    {
      kind: 'predict',
      prompt: '`vault.txt` contains `rent 50` and `food 20`. The program is run as `main find food extra`. What appears on stdout?',
      code: {
        language: 'cpp',
        source: cpp`
    Vault vault;
    vault.load("vault.txt");
    if (verb == "find" && args.size() == 2) {
        std::optional<int> amount = vault.find(args[1]);
        if (amount) std::cout << args[1] << ": " << *amount << "\n";
        else std::cout << "Not found\n";
        return 0;
    }
    return usage();`,
      },
      choices: [
        'Nothing: the usage line goes to stderr and the exit status is 1',
        'food: 20',
        'Not found',
        'Usage: main add|list|total|find|selftest',
      ],
      answer: 'Nothing: the usage line goes to stderr and the exit status is 1',
      explanation: '`args` is `{"find", "food", "extra"}`, size 3. The verb matches but the size check does not, so the whole `if` is skipped and main falls through to `usage()`, which writes to **cerr** and returns 1. The file was loaded for nothing, which is harmless. A verb with the wrong number of operands is misuse, not a lookup.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the top of main for v1.0 with the `total` verb, in the order the worked example used. Set the indentation yourself. Three lines carry misconceptions.',
      language: 'cpp',
      indentation: true,
      solution: [
        'int main(int argc, char *argv[]) {',
        '    std::vector<std::string> args(argv + 1, argv + argc);',
        '    if (args.empty()) return usage();',
        '    const std::string &verb = args[0];',
        '    if (verb == "selftest" && args.size() == 1) return selftest();',
        '    Vault vault;',
        '    vault.load("vault.txt");',
        '    if (verb == "total" && args.size() == 1) {',
        '        std::cout << "Total: " << vault.total() << "\\n";',
        '        return 0;',
        '    }',
        '    return usage();',
        '}',
      ],
      distractors: ['    std::vector<std::string> args(argv, argv + argc);', '    if (verb == "selftest") selftest();', '    if (strcmp(verb, "total") == 0) {'],
      explanation: 'Starting the vector at `argv` would make the program name the verb. Calling `selftest()` without returning would go on to load the file and then print the usage line after the test count. And `verb` is a `std::string`, so it compares with `==`; `strcmp` is the C way and would not even compile against a string.',
    },
    {
      kind: 'create',
      prompt: `Build Vault++ v1.0 from your v0.6 core and the shell of 7-1.

- \`main add <name> <amount>\`: append \`<name> <amount>\` to \`vault.txt\` and print \`Added <name> <amount>\`. A bad amount prints \`Not a number: <text>\` to \`std::cerr\` and returns 1 without writing.
- \`main list\`: load \`vault.txt\` (missing file = no records), print each record sorted by name as \`<name>: <amount>\`, then \`Records: <n>\`.
- \`main total\`: \`Total: <t>\`.
- \`main find <name>\`: \`<name>: <amount>\` or \`Not found\`.
- \`main selftest\`: at least five \`check\` claims on \`Vault\` (size, total, find hit and miss, sorted order) with no file access, then \`<n> tests passed\`; return 1 if any failed.
- Anything else: \`Usage: main add|list|total|find|selftest\` to \`std::cerr\`, return 1.

Keep \`Vault\` pure: \`total\`, \`find\` and \`sorted\` return values, \`load\` and \`append\` are the only functions that touch files, and every \`std::cout\` is in main.`,
      language: 'cpp',
      tests: [
        { description: 'add to a fresh directory', argv: ['add', 'rent', '50'], expectedStdout: 'Added rent 50' },
        { description: 'add to an existing file', files: { 'vault.txt': 'rent 50\n' }, argv: ['add', 'food', '20'], expectedStdout: 'Added food 20' },
        { description: 'list sorted with a fixture', files: { 'vault.txt': 'rent 50\nfood 20\nbus 5\n' }, argv: ['list'], expectedStdout: 'bus: 5\nfood: 20\nrent: 50\nRecords: 3' },
        { description: 'list with no file', argv: ['list'], expectedStdout: 'Records: 0' },
        { description: 'total with a fixture', files: { 'vault.txt': 'rent 50\nfood 20\nbus 5\n' }, argv: ['total'], expectedStdout: 'Total: 75' },
        { description: 'total with no file', argv: ['total'], expectedStdout: 'Total: 0' },
        { description: 'find hit', files: { 'vault.txt': 'rent 50\nfood 20\n' }, argv: ['find', 'food'], expectedStdout: 'food: 20' },
        { description: 'find miss', files: { 'vault.txt': 'rent 50\nfood 20\n' }, argv: ['find', 'gym'], expectedStdout: 'Not found' },
        { description: 'selftest passes with no file present', argv: ['selftest'], expectedStdout: '^[1-9][0-9]* tests passed$', match: 'regex' },
      ],
      hint: 'Reuse Record, Vault (add, size, total, find, sorted, load) and the check runner from 7-3 unchanged. Add `static void append(const std::string &path, const Record &r)` with `std::ofstream out(path, std::ios::app)`. In main: args, empty check, selftest first, then load, then one if per verb, then `return usage();`.',
      solution: cpp`
#include <algorithm>
#include <fstream>
#include <iostream>
#include <optional>
#include <stdexcept>
#include <string>
#include <vector>

class Record {
public:
    Record(std::string name, int amount) : name_(std::move(name)), amount_(amount) {}
    const std::string &name() const { return name_; }
    int amount() const { return amount_; }
private:
    std::string name_;
    int amount_;
};

class Vault {
public:
    void add(Record r) { records_.push_back(std::move(r)); }
    std::size_t size() const { return records_.size(); }
    int total() const {
        int t = 0;
        for (const Record &r : records_) t += r.amount();
        return t;
    }
    std::optional<int> find(const std::string &name) const {
        for (const Record &r : records_) {
            if (r.name() == name) return r.amount();
        }
        return std::nullopt;
    }
    std::vector<Record> sorted() const {
        std::vector<Record> copy = records_;
        std::sort(copy.begin(), copy.end(),
                  [](const Record &a, const Record &b) { return a.name() < b.name(); });
        return copy;
    }
    std::size_t load(const std::string &path) {
        std::ifstream in(path);
        if (!in) return 0;
        std::string name;
        int amount;
        std::size_t count = 0;
        while (in >> name >> amount) {
            add(Record(name, amount));
            count++;
        }
        return count;
    }
    static void append(const std::string &path, const Record &r) {
        std::ofstream out(path, std::ios::app);
        out << r.name() << " " << r.amount() << "\n";
    }
private:
    std::vector<Record> records_;
};

int passed = 0;
int failed = 0;

void check(bool ok, const char *what) {
    if (ok) {
        passed++;
    } else {
        failed++;
        std::cout << "FAIL: " << what << "\n";
    }
}

int selftest() {
    Vault empty;
    check(empty.size() == 0, "a new vault is empty");
    check(empty.total() == 0, "an empty vault totals 0");
    check(!empty.find("rent"), "find on an empty vault misses");

    Vault v;
    v.add(Record("rent", 50));
    v.add(Record("food", 20));
    v.add(Record("bus", 5));
    check(v.size() == 3, "size counts every add");
    check(v.total() == 75, "total adds every record");
    check(v.find("food") == 20, "find returns the amount of a known name");
    check(!v.find("gym"), "find misses an absent name");
    check(v.sorted()[0].name() == "bus", "sorted puts the first name first");
    check(v.sorted()[2].name() == "rent", "sorted puts the last name last");

    std::cout << passed << " tests passed\n";
    if (failed > 0) std::cout << failed << " tests failed\n";
    return failed == 0 ? 0 : 1;
}

int usage() {
    std::cerr << "Usage: main add|list|total|find|selftest\n";
    return 1;
}

int main(int argc, char *argv[]) {
    std::vector<std::string> args(argv + 1, argv + argc);
    if (args.empty()) return usage();
    const std::string &verb = args[0];
    if (verb == "selftest" && args.size() == 1) return selftest();

    Vault vault;
    vault.load("vault.txt");
    if (verb == "add" && args.size() == 3) {
        int amount;
        try {
            amount = std::stoi(args[2]);
        } catch (const std::exception &) {
            std::cerr << "Not a number: " << args[2] << "\n";
            return 1;
        }
        Record r(args[1], amount);
        Vault::append("vault.txt", r);
        std::cout << "Added " << r.name() << " " << r.amount() << "\n";
        return 0;
    }
    if (verb == "list" && args.size() == 1) {
        for (const Record &r : vault.sorted()) std::cout << r.name() << ": " << r.amount() << "\n";
        std::cout << "Records: " << vault.size() << "\n";
        return 0;
    }
    if (verb == "total" && args.size() == 1) {
        std::cout << "Total: " << vault.total() << "\n";
        return 0;
    }
    if (verb == "find" && args.size() == 2) {
        std::optional<int> amount = vault.find(args[1]);
        if (amount) std::cout << args[1] << ": " << *amount << "\n";
        else std::cout << "Not found\n";
        return 0;
    }
    return usage();
}
`,
      projectNote: 'Vault++ v1.0: a command-line tool with a pure, tested core and a thin shell. Split at the section comments of 7-2, add the CMakeLists.txt and the sanitizer flags, and it is a project someone else can build, test and extend.',
    },
  ],
};

export const m7: Module = {
  id: 'cpp-m7',
  title: 'Building and testing',
  goal: 'CMake, separate compilation, a unit-test framework, sanitizers.',
  projectMilestone: 'Vault++ v1.0: a CMake project with tests.',
  status: 'available',
  lessons: [l71, l72, l73, l74, l75],
};
