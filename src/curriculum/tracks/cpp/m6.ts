import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 6: Errors and files                                         */
/* ------------------------------------------------------------------ */

/** C++ source written verbatim: backslashes stay (so `"\n"` inside C++ strings survives), leading newline dropped. */
const cpp = (s: TemplateStringsArray) => s.raw.join('').replace(/^\n/, '');

/* ------------------------------------------------------------------ */
/* 6-1 Exceptions                                                     */
/* ------------------------------------------------------------------ */

const l61: Lesson = {
  id: 'cpp-6-1',
  title: 'When a function cannot answer',
  objective: 'Throw and catch exceptions, and trace which destructors run while the stack unwinds.',
  minutes: 22,
  lexicon: [
    { id: 'cpp.6.throw', term: 'throw std::invalid_argument("...")', kind: 'keyword', meaning: 'Abandon the current function immediately with an error object. Control jumps to the nearest enclosing catch that matches, however many calls up that is.', example: 'if (amount < 0) throw std::invalid_argument("negative amount");' },
    { id: 'cpp.6.try-catch', term: 'try { ... } catch (const T &e) { ... }', kind: 'pattern', meaning: 'Run the try block; if something inside throws a T (or a type derived from T), skip the rest of the block and run the catch block instead.', example: 'try {\n    int n = std::stoi(text);\n} catch (const std::invalid_argument &e) {\n    std::cout << "Not a number\\n";\n}', analogy: 'A fire exit: you leave the building from wherever you are, not back the way you came. It breaks here: the building is tidied on the way out (destructors run), which no fire drill promises.' },
    { id: 'cpp.6.what', term: 'catch (const std::exception &e) { e.what(); }', kind: 'pattern', meaning: 'Catch every standard exception at once through its base class, by const reference. what() gives the message text.', example: 'catch (const std::exception &e) {\n    std::cout << "Problem: " << e.what() << "\\n";\n}' },
    { id: 'cpp.6.stoi', term: 'std::stoi(text)', kind: 'builtin', meaning: 'Convert a string to an int. Throws std::invalid_argument when no digits are found and std::out_of_range when the number does not fit. Leading spaces are skipped and trailing junk is ignored.', example: 'int amount = std::stoi("42");      // 42\nstd::stoi("abc");                  // throws std::invalid_argument' },
    { id: 'cpp.6.unwinding', term: 'stack unwinding', kind: 'concept', meaning: 'Between the throw and the catch, every local object in the frames being abandoned is destroyed, innermost first, so RAII cleanup still happens. The catch block runs after all of them.', example: 'void inner() { Door d("b"); throw std::runtime_error("boom"); }   // prints "close b" before the catch runs' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Throw out, catch somewhere above',
      body: `The C Vault reported failure with return codes that every caller had to remember to check. C++ adds **exceptions**: a function that cannot do its job **throws** an error object, and execution jumps to the nearest enclosing **catch** that matches, however many calls up that is. Code between the two is skipped.

The standard library throws for you. \`std::stoi\` throws \`std::invalid_argument\` when the text has no number, and \`std::out_of_range\` when it does not fit an int; \`vector::at(i)\` throws \`std::out_of_range\` for a bad index. Both derive from \`std::exception\`, so \`catch (const std::exception &e)\` catches either, and \`e.what()\` gives a message. Catch by **const reference** so the object is not sliced or copied.

On the way from throw to catch, every local object in the abandoned frames is destroyed, innermost first. This is **stack unwinding**, and it is why RAII from Module 4 matters: files and memory are released even when an error flies past.`,
      example: {
        language: 'cpp',
        source: cpp`
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

int checked(int amount) {
    if (amount < 0) throw std::invalid_argument("negative amount");
    return amount;
}

int main() {
    std::vector<int> amounts{10, 20};
    std::cout << "Index?\n";
    std::string text;
    std::getline(std::cin, text);
    try {
        int i = std::stoi(text);
        std::cout << "Amount: " << checked(amounts.at(i)) << "\n";
    } catch (const std::invalid_argument &e) {
        std::cout << "Bad input: " << e.what() << "\n";
    } catch (const std::out_of_range &) {
        std::cout << "No such record\n";
    }
    std::cout << "Done\n";
    return 0;
}`,
        labels: [
          { lines: [6, 9], label: 'Your own throw: refuse to continue with a bad value.' },
          { lines: [13, 15], label: 'Read the whole line as text; conversion happens separately so it can fail cleanly.' },
          { lines: [16, 18], label: 'Everything that might throw sits inside try. stoi, at and checked can each abandon line 18.' },
          { lines: [19, 20], label: 'Catches stoi on "abc" and the negative-amount throw; e.what() is the message that was thrown.' },
          { lines: [21, 23], label: 'Catches at(i) with a bad index and stoi on a huge number. The parameter is unnamed because it is not used.' },
          { lines: [24, 24], label: 'Runs whichever path was taken: after the try block or after a catch.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'C had no exceptions: atoi("abc") silently returned 0 and a bad index was undefined behaviour. In C++, stoi and at() refuse loudly, and the refusal travels up the call stack to a catch instead of being a return value to forget.' },
        { from: 'python', note: 'try/except becomes try/catch; the error type goes in parentheses with `const ... &`. There is no finally: destructors of local objects run during unwinding, which does the same job.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Each `Door` prints when it is created and destroyed. What is printed, in order?',
      code: {
        language: 'cpp',
        source: cpp`
#include <iostream>
#include <stdexcept>
#include <string>

struct Door {
    std::string name;
    explicit Door(std::string n) : name(n) { std::cout << "open " << name << "\n"; }
    ~Door() { std::cout << "close " << name << "\n"; }
};

void inner() {
    Door b("b");
    throw std::runtime_error("boom");
    std::cout << "after\n";
}

int main() {
    try {
        Door a("a");
        inner();
    } catch (const std::exception &e) {
        std::cout << "caught " << e.what() << "\n";
    }
    std::cout << "done\n";
    return 0;
}`,
      },
      choices: [
        'open a\nopen b\nclose b\nclose a\ncaught boom\ndone',
        'open a\nopen b\ncaught boom\nclose b\nclose a\ndone',
        'open a\nopen b\nclose b\ncaught boom\nclose a\ndone',
        'open a\nopen b\nafter\nclose b\nclose a\ncaught boom\ndone',
      ],
      answer: 'open a\nopen b\nclose b\nclose a\ncaught boom\ndone',
      explanation: 'The throw abandons inner() at once, so `after` never prints. Unwinding then destroys locals innermost first: b (in inner) and then a (in the try block, which is also being left). Only when every abandoned frame is clean does the catch block run, so `caught boom` comes after both closes. `done` runs normally afterwards.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that asks `Amount?`, reads a line, and prints `Amount: <n>` or `Not a number`. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        '#include <stdexcept>',
        '#include <string>',
        'int main() {',
        '    std::cout << "Amount?\\n";',
        '    std::string text;',
        '    std::getline(std::cin, text);',
        '    try {',
        '        int amount = std::stoi(text);',
        '        std::cout << "Amount: " << amount << "\\n";',
        '    } catch (const std::invalid_argument &) {',
        '        std::cout << "Not a number\\n";',
        '    }',
        '    return 0;',
        '}',
      ],
      distractors: ['    } catch (std::invalid_argument) {', '    } except (const std::invalid_argument &) {'],
      explanation: 'Catching by value copies the exception and, under -Wall, g++ warns about it (which -Werror turns into an error): catch by const reference. `except` is Python; the C++ word is `catch`.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the handler so that any standard exception thrown by `stoi` is reported with its own message.',
      language: 'cpp',
      template: 'try {\n    int amount = std::stoi(text);\n    std::cout << "Amount: " << amount << "\\n";\n} {{kw}} (const std::{{type}} &e) {\n    std::cout << "Problem: " << e.{{msg}}() << "\\n";\n}',
      blanks: [
        { id: 'kw', answers: ['catch'], hint: 'not except' },
        { id: 'type', answers: ['exception'], hint: 'the base class of invalid_argument and out_of_range' },
        { id: 'msg', answers: ['what'], hint: 'the member function that returns the message' },
      ],
      explanation: '`std::exception` is the base of every standard exception, so one catch by const reference handles both failure modes of stoi; `what()` is the text that was thrown.',
    },
    {
      kind: 'modify',
      prompt: 'This program crashes with an uncaught exception when the user types something that is not a number. Make it print `Not a number` instead, for both kinds of bad input (letters, and a number too large for an int), and keep the normal path unchanged.',
      language: 'cpp',
      starter: cpp`
#include <iostream>
#include <string>

int main() {
    std::cout << "Amount?\n";
    std::string text;
    std::getline(std::cin, text);
    int amount = std::stoi(text);
    std::cout << "Amount: " << amount << "\n";
    return 0;
}
`,
      tests: [
        { description: 'a valid amount', stdin: '42', expectedStdout: 'Amount?\nAmount: 42' },
        { description: 'letters', stdin: 'abc', expectedStdout: 'Amount?\nNot a number' },
        { description: 'too large for an int', stdin: '99999999999', expectedStdout: 'Amount?\nNot a number' },
        { description: 'empty line', stdin: '', expectedStdout: 'Amount?\nNot a number' },
      ],
      hint: 'Wrap the stoi call and the print in try. One `catch (const std::exception &)` handles both std::invalid_argument and std::out_of_range; include <stdexcept>.',
      solution: cpp`
#include <iostream>
#include <stdexcept>
#include <string>

int main() {
    std::cout << "Amount?\n";
    std::string text;
    std::getline(std::cin, text);
    try {
        int amount = std::stoi(text);
        std::cout << "Amount: " << amount << "\n";
    } catch (const std::exception &) {
        std::cout << "Not a number\n";
    }
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Read lines until the input ends. For each line, try `std::stoi`: on success add the value to a running total and print `Amount: <n>`; on any failure print `Not a number: <the line>`. After the last line print `Total: <t>`.',
      language: 'cpp',
      tests: [
        { description: 'one bad line among good ones', stdin: '10\nabc\n5', expectedStdout: 'Amount: 10\nNot a number: abc\nAmount: 5\nTotal: 15' },
        { description: 'only a bad line', stdin: 'x', expectedStdout: 'Not a number: x\nTotal: 0' },
        { description: 'a negative amount', stdin: '-7\n7', expectedStdout: 'Amount: -7\nAmount: 7\nTotal: 0' },
      ],
      hint: 'Loop with `while (std::getline(std::cin, line))`. The try/catch goes inside the loop so one bad line does not stop the rest.',
      solution: cpp`
#include <iostream>
#include <stdexcept>
#include <string>

int main() {
    int total = 0;
    std::string line;
    while (std::getline(std::cin, line)) {
        try {
            int amount = std::stoi(line);
            total += amount;
            std::cout << "Amount: " << amount << "\n";
        } catch (const std::exception &) {
            std::cout << "Not a number: " << line << "\n";
        }
    }
    std::cout << "Total: " << total << "\n";
    return 0;
}
`,
      projectNote: 'Vault++ v0.6 will reject a bad amount with `Not a number, try again` instead of crashing. The try/catch around stoi is the mechanism.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 6-2 Expected failure without exceptions                            */
/* ------------------------------------------------------------------ */

const l62: Lesson = {
  id: 'cpp-6-2',
  title: 'A value that may be missing',
  objective: 'Return std::optional for failures that are expected, and choose between optional and exceptions.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.6.optional', term: 'std::optional<int>', kind: 'builtin', meaning: 'From <optional>: a box that holds either one int or nothing. The type itself says "this may be absent", so a caller cannot forget to check.', example: 'std::optional<int> parse_int(const std::string &text);', analogy: 'An envelope that may be empty. It breaks here: you cannot use the envelope as the letter; you must open it first with *.' },
    { id: 'cpp.6.nullopt', term: 'std::nullopt', kind: 'builtin', meaning: 'The value of an empty optional. Return it to say "no answer".', example: 'if (pos != text.size()) return std::nullopt;' },
    { id: 'cpp.6.deref-optional', term: 'if (r) { *r }', kind: 'pattern', meaning: 'An optional is true when it holds a value, and * gives that value. Reading * of an empty optional is undefined behaviour, so always test first.', example: 'std::optional<int> r = parse_int(text);\nif (r) std::cout << *r << "\\n";' },
    { id: 'cpp.6.value-or', term: 'r.value_or(0)', kind: 'builtin', meaning: 'The held value, or the given fallback when the optional is empty. One expression instead of an if.', example: 'int amount = parse_int(text).value_or(0);' },
    { id: 'cpp.6.expected', term: 'std::expected<T, E>', kind: 'concept', meaning: 'C++23: like optional, but the empty case carries an error value E that explains why. Same shape of use: test it, then * for the value or .error() for the reason. Older compilers do not ship it; optional covers the pattern.', example: 'std::expected<int, std::string> parse_int(const std::string &text);   // C++23' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Expected failures are values, not exceptions',
      body: `A user typing \`abc\` for an amount is not exceptional; it happens every day. Throwing for it works, but the caller cannot see from the signature that it must catch, and a throw is slow. For failures you **expect**, return a value that can be absent: \`std::optional<int>\`.

\`parse_int\` below returns \`std::nullopt\` when the text is not a whole number, and the number otherwise. The caller tests the optional like a bool and reads it with \`*\`, or takes a fallback with \`value_or\`. Inside, it still uses \`stoi\` with try/catch, and adds a check \`stoi\` does not do: the \`pos\` argument reports how many characters were consumed, so \`12abc\` is rejected too.

The rule of thumb: an exception for what should never happen (a file the program itself wrote is corrupt); an optional for what a user can cause. C++23 adds \`std::expected<T, E>\`, an optional whose empty case carries a reason; the usage pattern is the same, so what you learn here transfers.`,
      example: {
        language: 'cpp',
        source: cpp`
#include <iostream>
#include <optional>
#include <stdexcept>
#include <string>

std::optional<int> parse_int(const std::string &text) {
    try {
        std::size_t pos = 0;
        int value = std::stoi(text, &pos);
        if (pos != text.size()) return std::nullopt;
        return value;
    } catch (const std::exception &) {
        return std::nullopt;
    }
}

int main() {
    std::cout << "Amount?\n";
    std::string text;
    std::getline(std::cin, text);
    std::optional<int> amount = parse_int(text);
    if (amount) {
        std::cout << "Amount: " << *amount << "\n";
    } else {
        std::cout << "Not a number\n";
    }
    std::cout << "Fallback: " << amount.value_or(0) << "\n";
    return 0;
}`,
        labels: [
          { lines: [6, 6], label: 'The return type announces that there may be no answer.' },
          { lines: [8, 9], label: 'stoi with a position: pos ends up at the first character it did not use.' },
          { lines: [10, 11], label: 'Trailing junk means no answer; otherwise the int converts to a full optional.' },
          { lines: [12, 14], label: 'stoi\'s own failures become the same empty answer, so callers see one shape.' },
          { lines: [21, 26], label: 'Test, then dereference with *. The else branch is the expected failure path.' },
          { lines: [27, 27], label: 'value_or picks the value or a default in one expression.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'C signalled "no result" with a sentinel like -1 or by writing through an out-parameter and returning a flag. std::optional is the sentinel made into a type: -1 stays a legal amount, and the compiler will not let you forget the box can be empty.' },
        { from: 'python', note: 'Python returns None and hopes the caller checks. std::optional<int> is None made explicit in the type, and reading an empty one with * is your fault, not a TypeError.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: {
        language: 'cpp',
        source: cpp`
#include <iostream>
#include <optional>

std::optional<int> half(int x) {
    if (x % 2 != 0) return std::nullopt;
    return x / 2;
}

int main() {
    std::cout << half(8).value_or(-1) << "\n";
    std::cout << half(7).value_or(-1) << "\n";
    std::cout << half(0).has_value() << "\n";
    return 0;
}`,
      },
      choices: ['4\n-1\n1', '4\n-1\n0', '4\n3\n1', '4\nnullopt\ntrue'],
      answer: '4\n-1\n1',
      explanation: 'half(8) holds 4. half(7) is empty, so value_or gives the fallback -1. half(0) holds the value 0: an optional holding zero is not empty, so has_value() is true, and a bool prints as 1 on std::cout.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `parse_int` returning an optional, and print the value only when there is one. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        '#include <optional>',
        '#include <stdexcept>',
        '#include <string>',
        'std::optional<int> parse_int(const std::string &text) {',
        '    try {',
        '        return std::stoi(text);',
        '    } catch (const std::exception &) {',
        '        return std::nullopt;',
        '    }',
        '}',
        'int main() {',
        '    std::optional<int> amount = parse_int("42");',
        '    if (amount) {',
        '        std::cout << *amount << "\\n";',
        '    }',
        '    return 0;',
        '}',
      ],
      distractors: ['        return -1;', '        std::cout << amount << "\\n";', 'int parse_int(const std::string &text) {'],
      explanation: 'Returning -1 is the C sentinel that makes -1 an impossible amount; nullopt keeps every int legal. An optional cannot be printed directly: unwrap it with * after the test. And the function must be declared to return std::optional<int>, or nullopt has nowhere to go.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so that a missing answer is represented by an empty optional and printed as 0.',
      language: 'cpp',
      template: '#include <iostream>\n#include <optional>\n#include <stdexcept>\n#include <string>\n\nstd::{{opt}}<int> parse_int(const std::string &text) {\n    try {\n        return std::stoi(text);\n    } catch (const std::exception &) {\n        return std::{{none}};\n    }\n}\n\nint main() {\n    std::string text;\n    std::getline(std::cin, text);\n    std::cout << parse_int(text).{{vo}}(0) << "\\n";\n    return 0;\n}',
      blanks: [
        { id: 'opt', answers: ['optional'], hint: 'the type that may hold an int' },
        { id: 'none', answers: ['nullopt'], hint: 'the value of an empty optional' },
        { id: 'vo', answers: ['value_or'], hint: 'the value, or the fallback in the parentheses' },
      ],
      explanation: 'The three pieces always travel together: the optional type in the signature, nullopt for the empty return, and a test or value_or at the call.',
    },
    {
      kind: 'modify',
      prompt: 'This program uses -1 to mean "not a number", so the perfectly valid amount `-1` is reported as `Not a number`. Change `parse_int` to return `std::optional<int>` and update `main` to test the optional, so that `-1` prints `Amount: -1` while `abc` still prints `Not a number`.',
      language: 'cpp',
      starter: cpp`
#include <iostream>
#include <stdexcept>
#include <string>

int parse_int(const std::string &text) {
    try {
        return std::stoi(text);
    } catch (const std::exception &) {
        return -1;
    }
}

int main() {
    std::cout << "Amount?\n";
    std::string text;
    std::getline(std::cin, text);
    int amount = parse_int(text);
    if (amount == -1) {
        std::cout << "Not a number\n";
    } else {
        std::cout << "Amount: " << amount << "\n";
    }
    return 0;
}
`,
      tests: [
        { description: 'minus one is a real amount', stdin: '-1', expectedStdout: 'Amount?\nAmount: -1' },
        { description: 'letters', stdin: 'abc', expectedStdout: 'Amount?\nNot a number' },
        { description: 'a positive amount', stdin: '25', expectedStdout: 'Amount?\nAmount: 25' },
      ],
      hint: 'Include <optional>. Return type `std::optional<int>`, `return std::nullopt;` in the catch, then `if (amount)` and `*amount` in main.',
      solution: cpp`
#include <iostream>
#include <optional>
#include <stdexcept>
#include <string>

std::optional<int> parse_int(const std::string &text) {
    try {
        return std::stoi(text);
    } catch (const std::exception &) {
        return std::nullopt;
    }
}

int main() {
    std::cout << "Amount?\n";
    std::string text;
    std::getline(std::cin, text);
    std::optional<int> amount = parse_int(text);
    if (amount) {
        std::cout << "Amount: " << *amount << "\n";
    } else {
        std::cout << "Not a number\n";
    }
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write `std::optional<int> parse_int(const std::string &)` that rejects text with trailing junk such as `12abc` (use the `pos` overload of `std::stoi` and require `pos == text.size()`) as well as text `stoi` itself rejects. Read lines until the input ends; add every accepted value to a total and count the rejected lines. Print `Total: <t>` and `Rejected: <k>`.',
      language: 'cpp',
      tests: [
        { description: 'trailing junk is rejected', stdin: '10\n12abc\n5', expectedStdout: 'Total: 15\nRejected: 1' },
        { description: 'only letters', stdin: 'abc', expectedStdout: 'Total: 0\nRejected: 1' },
        { description: 'negative and positive', stdin: '-3\n4', expectedStdout: 'Total: 1\nRejected: 0' },
      ],
      hint: '`std::size_t pos = 0; int v = std::stoi(text, &pos);` then compare pos with text.size(). In the loop: `if (r) total += *r; else rejected++;`.',
      solution: cpp`
#include <iostream>
#include <optional>
#include <stdexcept>
#include <string>

std::optional<int> parse_int(const std::string &text) {
    try {
        std::size_t pos = 0;
        int value = std::stoi(text, &pos);
        if (pos != text.size()) return std::nullopt;
        return value;
    } catch (const std::exception &) {
        return std::nullopt;
    }
}

int main() {
    int total = 0;
    int rejected = 0;
    std::string line;
    while (std::getline(std::cin, line)) {
        std::optional<int> r = parse_int(line);
        if (r) {
            total += *r;
        } else {
            rejected++;
        }
    }
    std::cout << "Total: " << total << "\n";
    std::cout << "Rejected: " << rejected << "\n";
    return 0;
}
`,
      projectNote: 'Vault++ v0.6 reads amounts through a function that returns std::optional<int>, so the command loop can re-prompt without a single exception leaving the helper.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 6-3 fstream                                                        */
/* ------------------------------------------------------------------ */

const l63: Lesson = {
  id: 'cpp-6-3',
  title: 'Files are streams too',
  objective: 'Read and write text files with ifstream and ofstream, checking for failure and letting RAII close them.',
  minutes: 22,
  lexicon: [
    { id: 'cpp.6.ifstream', term: 'std::ifstream in("vault.txt");', kind: 'builtin', meaning: 'From <fstream>: open a file for reading. It is an input stream like std::cin, so >> and std::getline work unchanged. Closed automatically when the variable goes out of scope.', example: 'std::ifstream in("vault.txt");\nint amount;\nin >> amount;' },
    { id: 'cpp.6.ofstream', term: 'std::ofstream out("vault.txt");', kind: 'builtin', meaning: 'Open a file for writing, creating it or replacing its contents. An output stream like std::cout: use <<. Closed, and flushed to disk, when it goes out of scope.', example: 'std::ofstream out("vault.txt");\nout << name << " " << amount << "\\n";' },
    { id: 'cpp.6.stream-check', term: 'if (!in)', kind: 'pattern', meaning: 'A stream converts to false when its last operation failed, including failing to open. Check right after opening; a missing file is not an exception, it is a false stream.', example: 'std::ifstream in("vault.txt");\nif (!in) {\n    std::cout << "No file\\n";\n}' },
    { id: 'cpp.6.extract-loop', term: 'while (in >> name >> amount)', kind: 'pattern', meaning: 'Read word-and-number pairs until a read fails, at end of file or at text that is not a number. The loop stops at the first failure and never sees what comes after it.', example: 'while (in >> name >> amount) {\n    count++;\n}', analogy: 'Reading a list until you hit a line you cannot parse. It breaks here: the stream will not skip the bad line and continue; it stops for good until you clear() it.' },
    { id: 'cpp.6.getline-file', term: 'while (std::getline(in, line))', kind: 'pattern', meaning: 'Read a file one whole line at a time, stopping when there are no more. The call is the condition, so a failed read ends the loop with no extra iteration.', example: 'std::string line;\nwhile (std::getline(in, line)) {\n    lines++;\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Open, check, read, and let scope close it',
      body: `A file in C++ is a stream, like \`std::cin\` and \`std::cout\`, that happens to be attached to disk. \`std::ifstream in("vault.txt")\` opens for reading; \`std::ofstream out("vault.txt")\` opens for writing and **replaces** the contents. Both come from \`<fstream>\`, and everything you know about \`>>\`, \`<<\` and \`std::getline\` works on them.

Opening can fail, and that is not an exception: the stream is simply **false**. Test \`if (!in)\` immediately after opening. Reading fails the same way, which is what makes \`while (in >> name >> amount)\` the right loop: it stops at end of file, or at a line whose second word is not a number, and never runs the body with half-read values. For whole lines, \`while (std::getline(in, line))\` has the same shape.

There is no close call. The stream is an RAII object: when it goes out of scope, the destructor flushes and closes it. To write a file and then read it back, put the writer in its own \`{ }\` block so it is closed before the reader opens.`,
      example: {
        language: 'cpp',
        source: cpp`
#include <fstream>
#include <iostream>
#include <string>

int main() {
    std::ifstream in("vault.txt");
    if (!in) {
        std::cout << "No file\n";
        return 0;
    }
    std::string name;
    int amount;
    int total = 0;
    int count = 0;
    while (in >> name >> amount) {
        total += amount;
        count++;
    }
    std::cout << "Records: " << count << "\n";
    std::cout << "Total: " << total << "\n";
    return 0;
}`,
        labels: [
          { lines: [6, 10], label: 'Open, then check at once: a missing file makes the stream false.' },
          { lines: [11, 14], label: 'Boxes for one record and the running totals.' },
          { lines: [15, 18], label: 'Read a pair per turn; the loop ends at end of file or at the first unreadable pair.' },
          { lines: [19, 21], label: 'Report. The file is closed when in goes out of scope at the closing brace.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'fopen returned NULL and you had to remember fclose on every path, including the error ones. An ifstream is false instead of NULL, and its destructor is the fclose: there is no path that forgets it.' },
        { from: 'python', note: '`with open(...) as f:` scoped the file to a block; here the block is any scope, because closing is the destructor. Python raised FileNotFoundError for a missing file; an ifstream is quietly false, so you must check.' },
      ],
    },
    {
      kind: 'predict',
      prompt: '`vault.txt` holds three lines: `rent 50`, `food twenty`, `bus 3`. What is printed?',
      code: {
        language: 'cpp',
        source: cpp`
#include <fstream>
#include <iostream>
#include <string>

int main() {
    std::ifstream in("vault.txt");
    std::string name;
    int amount;
    int count = 0;
    while (in >> name >> amount) {
        count++;
    }
    std::cout << "Records: " << count << "\n";
    return 0;
}`,
      },
      choices: ['Records: 1', 'Records: 2', 'Records: 3', 'an exception from the failed read'],
      answer: 'Records: 1',
      explanation: 'The first pair reads fine. On the second line, `name` becomes food but `twenty` cannot be read into an int, so the stream enters a failed state and the condition is false. The loop ends there; `bus 3` is never reached. Streams do not throw by default; they go false.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that writes one record to `notes.txt`, closes it, then reads it back and prints `rent: 50`. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <fstream>',
        '#include <iostream>',
        '#include <string>',
        'int main() {',
        '    {',
        '        std::ofstream out("notes.txt");',
        '        out << "rent 50\\n";',
        '    }',
        '    std::ifstream in("notes.txt");',
        '    std::string name;',
        '    int amount;',
        '    while (in >> name >> amount) std::cout << name << ": " << amount << "\\n";',
        '    return 0;',
        '}',
      ],
      distractors: ['    std::ifstream in("notes.txt", "r");', '    while (!in.eof()) std::cout << name << ": " << amount << "\\n";'],
      explanation: 'The inner braces end the ofstream\'s scope, so the file is flushed and closed before the ifstream opens it. There is no "r" mode string: the class name says the direction. Looping on `!in.eof()` runs the body once more after the last read fails, printing stale values; put the read in the condition instead.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it prints `No file` when `notes.txt` is missing and otherwise `Lines: <count>`.',
      language: 'cpp',
      template: '#include <fstream>\n#include <iostream>\n#include <string>\n\nint main() {\n    std::{{cls}} in("notes.txt");\n    if ({{chk}}) {\n        std::cout << "No file\\n";\n        return 0;\n    }\n    std::string line;\n    int lines = 0;\n    while (std::{{rd}}(in, line)) {\n        lines++;\n    }\n    std::cout << "Lines: " << lines << "\\n";\n    return 0;\n}',
      blanks: [
        { id: 'cls', answers: ['ifstream'], hint: 'input file stream' },
        { id: 'chk', answers: ['!in'], hint: 'the stream itself, negated' },
        { id: 'rd', answers: ['getline'], hint: 'reads a whole line; takes the stream and the string' },
      ],
      explanation: 'ifstream for reading, `!in` to detect a failed open, and getline as the loop condition so the last failed read ends the loop instead of being counted.',
    },
    {
      kind: 'modify',
      prompt: 'This line counter reports one line too many for a normal file, and `Lines: 1` for an empty file. The loop tests `eof()` before reading, so the read that hits the end still counts. Fix the loop so that `rent`, `food`, `fuel` gives `Lines: 3` and an empty file gives `Lines: 0`. Keep the `No file` check.',
      language: 'cpp',
      starter: cpp`
#include <fstream>
#include <iostream>
#include <string>

int main() {
    std::ifstream in("notes.txt");
    if (!in) {
        std::cout << "No file\n";
        return 0;
    }
    int lines = 0;
    std::string line;
    while (!in.eof()) {
        std::getline(in, line);
        lines++;
    }
    std::cout << "Lines: " << lines << "\n";
    return 0;
}
`,
      tests: [
        { description: 'three lines with a final line break', files: { 'notes.txt': 'rent\nfood\nfuel\n' }, expectedStdout: 'Lines: 3' },
        { description: 'empty file', files: { 'notes.txt': '' }, expectedStdout: 'Lines: 0' },
        { description: 'no final line break', files: { 'notes.txt': 'rent\nfood' }, expectedStdout: 'Lines: 2' },
        { description: 'missing file', expectedStdout: 'No file' },
      ],
      hint: 'Make the read the condition: `while (std::getline(in, line))`. eof() only becomes true after a read has already failed.',
      solution: cpp`
#include <fstream>
#include <iostream>
#include <string>

int main() {
    std::ifstream in("notes.txt");
    if (!in) {
        std::cout << "No file\n";
        return 0;
    }
    int lines = 0;
    std::string line;
    while (std::getline(in, line)) {
        lines++;
    }
    std::cout << "Lines: " << lines << "\n";
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Ask `How many?` and read an int `n`. For each of the `n` records ask `Name?` (a word) and `Amount?` (an int) and write the line `<name> <amount>` to `vault.txt` with an `ofstream`, replacing any previous contents. Make sure the file is closed, then open it again with an `ifstream` and print every record read back as `<name>: <amount>`, followed by `Records: <k>` where `k` counts what was read back.',
      language: 'cpp',
      tests: [
        { description: 'two records written and read back', stdin: '2\nrent\n50\nfood\n20', expectedStdout: 'How many?\nName?\nAmount?\nName?\nAmount?\nrent: 50\nfood: 20\nRecords: 2' },
        { description: 'an old file is replaced, not appended', files: { 'vault.txt': 'old 999\n' }, stdin: '1\nbus\n3', expectedStdout: 'How many?\nName?\nAmount?\nbus: 3\nRecords: 1' },
        { description: 'zero records leaves an empty file', stdin: '0', expectedStdout: 'How many?\nRecords: 0' },
      ],
      hint: 'Put the ofstream and the writing loop inside their own `{ }` block; the closing brace closes the file. Then `std::ifstream in("vault.txt");` and `while (in >> name >> amount)`.',
      solution: cpp`
#include <fstream>
#include <iostream>
#include <string>

int main() {
    std::cout << "How many?\n";
    int n;
    std::cin >> n;
    {
        std::ofstream out("vault.txt");
        for (int i = 0; i < n; i++) {
            std::string name;
            int amount;
            std::cout << "Name?\n";
            std::cin >> name;
            std::cout << "Amount?\n";
            std::cin >> amount;
            out << name << " " << amount << "\n";
        }
    }
    std::ifstream in("vault.txt");
    std::string name;
    int amount;
    int count = 0;
    while (in >> name >> amount) {
        std::cout << name << ": " << amount << "\n";
        count++;
    }
    std::cout << "Records: " << count << "\n";
    return 0;
}
`,
      projectNote: 'Save and load for Vault++ v0.6 are exactly this: an ofstream writing `<name> <amount>` lines, and an ifstream reading them back with a paired extraction loop.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 6-4 Project: Vault++ v0.6                                          */
/* ------------------------------------------------------------------ */

const l64: Lesson = {
  id: 'cpp-6-4',
  title: 'Vault++ v0.6: it remembers',
  objective: 'Load the vault from a file at start, save it on quit, and survive an amount that is not a number.',
  minutes: 26,
  lexicon: [
    { id: 'cpp.6.ws', term: 'std::getline(std::cin >> std::ws, line)', kind: 'pattern', meaning: 'Skip whitespace, including the newline left behind by a previous >> read, then read a whole line. Without std::ws, getline after >> returns an empty line.', example: 'std::cin >> name;\nstd::getline(std::cin >> std::ws, line);   // line is the next real line, not ""' },
    { id: 'cpp.6.retry-loop', term: 'while (true) { prompt; read; if ok return; report; }', kind: 'pattern', meaning: 'Re-ask until the input is acceptable. The return inside the loop is the only exit, so the function always hands back a valid value or an explicit "input ended".', example: 'while (true) {\n    std::cout << "Amount?\\n";\n    if (!std::getline(std::cin >> std::ws, line)) return std::nullopt;\n    try { return std::stoi(line); } catch (const std::exception &) { std::cout << "Not a number, try again\\n"; }\n}' },
    { id: 'cpp.6.load-save', term: 'load() at start, save() on quit', kind: 'pattern', meaning: 'Persistence as two member functions mirroring each other: load reads `<name> <amount>` pairs into the table and returns how many; save writes every record the same way and returns the count. The file format is the contract between them.', example: 'std::cout << "Loaded " << vault->load("vault.txt") << " records\\n";\n// ... on command 3:\nstd::cout << "Saved " << vault->save("vault.txt") << " records\\n";' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Three changes to v0.5',
      body: `Vault++ v0.6 keeps every command and message of v0.5 and changes three things.

**Load at start.** Before the first \`Command?\`, \`Vault::load("vault.txt")\` opens the file; if it is missing, nothing is loaded. Otherwise \`while (in >> name >> amount)\` adds each record. The program prints \`Loaded <k> records\`.

**Save on quit.** Command \`3\` calls \`Vault::save("vault.txt")\`, which writes \`<name> <amount>\` per line with an \`ofstream\` and returns the count, then prints \`Saved <n> records\` and \`Bye\`.

**A bad amount does not crash.** \`Amount?\` is read with \`std::getline\` into a string and converted with \`std::stoi\` inside try/catch. On failure print \`Not a number, try again\` and ask again. Because the name was read with \`>>\`, its newline is still waiting; \`std::cin >> std::ws\` skips it before \`getline\`. The helper returns \`std::optional<int>\`, empty only when the input itself ends.`,
      example: {
        language: 'cpp',
        source: cpp`
std::optional<int> read_amount() {
    std::string line;
    while (true) {
        std::cout << "Amount?\n";
        if (!std::getline(std::cin >> std::ws, line)) return std::nullopt;
        try {
            return std::stoi(line);
        } catch (const std::exception &) {
            std::cout << "Not a number, try again\n";
        }
    }
}

std::size_t Vault::load(const std::string &path) {
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

std::size_t Vault::save(const std::string &path) const {
    std::ofstream out(path);
    records_.for_each([&out](const Record &r) { out << r.name() << " " << r.amount() << "\n"; });
    return records_.size();
}`,
        labels: [
          { lines: [1, 3], label: 'A helper that only returns when it has a number, or when input is gone.' },
          { lines: [4, 5], label: 'Prompt each attempt; skip the leftover newline, then take the whole line.' },
          { lines: [6, 10], label: 'stoi inside try: success returns, failure reports and the loop asks again.' },
          { lines: [14, 16], label: 'A missing file is not an error for load: zero records.' },
          { lines: [20, 25], label: 'Paired extraction, one add per pair, count what arrived.' },
          { lines: [27, 31], label: 'Open for writing replaces the file; the lambda captures the stream by reference. Closed at the brace.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'The C Vault saved with fprintf and loaded with fscanf in a loop that checked the return value for 2. The loop is the same idea; the stream going false replaces the count check, and the destructor replaces fclose.' },
        { from: 'python', note: 'The Python ledger used try/except ValueError around int(input()) and json for the file. Here the amount uses try/catch around stoi, and the file is a plain word-number line per record, read with >>.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'There is no `vault.txt` in the working directory. The user enters `1`, `rent`, `fifty`, `50`, then `3`. What is printed?',
      code: {
        language: 'cpp',
        source: cpp`
std::cout << "Loaded " << vault->load("vault.txt") << " records\n";
while (true) {
    std::cout << "Command?\n";
    if (!(std::cin >> cmd)) break;
    if (cmd == 1) {
        std::string name;
        std::cout << "Name?\n";
        std::cin >> name;
        std::optional<int> amount = read_amount();
        if (!amount) break;
        vault->add(Record(name, *amount));
        std::cout << "Added\n";
    } else if (cmd == 3) {
        std::cout << "Saved " << vault->save("vault.txt") << " records\n";
        std::cout << "Bye\n";
        break;
    }
}`,
      },
      choices: [
        'Loaded 0 records\nCommand?\nName?\nAmount?\nNot a number, try again\nAmount?\nAdded\nCommand?\nSaved 1 records\nBye',
        'No file\nCommand?\nName?\nAmount?\nNot a number, try again\nAdded\nCommand?\nSaved 1 records\nBye',
        'Loaded 0 records\nCommand?\nName?\nAmount?\nNot a number, try again\nAmount?\nAdded\nCommand?\nSaved 0 records\nBye',
        'Loaded 0 records\nCommand?\nName?\nAmount?\nAmount?\nAdded\nCommand?\nSaved 1 records\nBye',
      ],
      answer: 'Loaded 0 records\nCommand?\nName?\nAmount?\nNot a number, try again\nAmount?\nAdded\nCommand?\nSaved 1 records\nBye',
      explanation: 'A missing file makes load return 0, so the first line is `Loaded 0 records`. `fifty` fails stoi: the helper reports and prompts `Amount?` again before `50` is accepted and `Added` is printed. At quit, save writes the one record and reports `Saved 1 records` before `Bye`.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `read_amount`, which re-prompts until the line is a whole number and returns an empty optional if the input ends. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        'std::optional<int> read_amount() {',
        '    std::string line;',
        '    while (true) {',
        '        std::cout << "Amount?\\n";',
        '        if (!std::getline(std::cin >> std::ws, line)) return std::nullopt;',
        '        try {',
        '            return std::stoi(line);',
        '        } catch (const std::exception &) {',
        '            std::cout << "Not a number, try again\\n";',
        '        }',
        '    }',
        '}',
      ],
      distractors: ['        if (!std::getline(std::cin, line)) return std::nullopt;', '        std::cin >> line;'],
      explanation: 'Without `>> std::ws`, getline picks up the newline left after the name was read with >>, sees an empty line, and reports `Not a number, try again` before the user typed anything. Reading with `std::cin >> line` takes one word and leaves the rest of a bad line, such as `12 abc`, to be misread as the next command.',
    },
    {
      kind: 'create',
      prompt: 'Build Vault++ v0.6 from your v0.5. At start, load `vault.txt` (`<name> <amount>` per line, possibly missing) and print `Loaded <k> records`. Keep all v0.5 commands and messages: `1` add (`Name?`, `Amount?`, `Added`), `2` list (sorted by name, then `Records: <n>`, `Total: <t>`), `4` find (`<name>: <amount>` or `Not found`), `5` undo (`Undone` or `Nothing to undo`), `6` stats (`Min: <a>  Max: <b>  Mean: <x.xx>` or `Empty`), anything else `Unknown command`. Read the amount as a line with `std::getline(std::cin >> std::ws, ...)` and `std::stoi` in try/catch; on failure print `Not a number, try again` and ask `Amount?` again. On `3`, save every record to `vault.txt`, print `Saved <n> records`, then `Bye`.',
      language: 'cpp',
      tests: [
        { description: 'missing file, quit at once', stdin: '3', expectedStdout: 'Loaded 0 records\nCommand?\nSaved 0 records\nBye' },
        { description: 'fixture file is loaded and listed', files: { 'vault.txt': 'rent 50\nfood 20\n' }, stdin: '2\n3', expectedStdout: 'Loaded 2 records\nCommand?\nfood: 20\nrent: 50\nRecords: 2\nTotal: 70\nCommand?\nSaved 2 records\nBye' },
        { description: 'bad amount is re-asked', stdin: '1\nbus\nabc\n3\n3', expectedStdout: 'Loaded 0 records\nCommand?\nName?\nAmount?\nNot a number, try again\nAmount?\nAdded\nCommand?\nSaved 1 records\nBye' },
        { description: 'loaded records count in stats and in the save', files: { 'vault.txt': 'rent 50\nfood 20\n' }, stdin: '1\nbus\n5\n6\n3', expectedStdout: 'Loaded 2 records\nCommand?\nName?\nAmount?\nAdded\nCommand?\nMin: 5  Max: 50  Mean: 25.00\nCommand?\nSaved 3 records\nBye' },
        { description: 'undo removes a loaded record before saving', files: { 'vault.txt': 'rent 50\n' }, stdin: '5\n5\n3', expectedStdout: 'Loaded 1 records\nCommand?\nUndone\nCommand?\nNothing to undo\nCommand?\nSaved 0 records\nBye' },
        { description: 'find in loaded records, unknown command', files: { 'vault.txt': 'rent 50\nfood 20\n' }, stdin: '4\nfood\n4\nbus\n9\n3', expectedStdout: 'Loaded 2 records\nCommand?\nName?\nfood: 20\nCommand?\nName?\nNot found\nCommand?\nUnknown command\nCommand?\nSaved 2 records\nBye' },
      ],
      hint: 'Add `load` and `save` members to Vault (both return std::size_t) and a free function `read_amount` returning std::optional<int>. In the command loop: `auto amount = read_amount(); if (!amount) break;`. Everything else is v0.5 unchanged.',
      solution: cpp`
#include <algorithm>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <memory>
#include <optional>
#include <stdexcept>
#include <string>
#include <vector>

template <typename T>
class Table {
public:
    void add(T item) { items_.push_back(std::move(item)); }
    bool remove_last() {
        if (items_.empty()) return false;
        items_.pop_back();
        return true;
    }
    std::size_t size() const { return items_.size(); }
    const std::vector<T> &items() const { return items_; }
    template <typename F>
    void for_each(F f) const {
        for (const T &item : items_) f(item);
    }
private:
    std::vector<T> items_;
};

template <typename T>
class Stats {
public:
    explicit Stats(const std::vector<T> &values) : values_(values) {}
    T min() const;
    T max() const;
    double mean() const;
private:
    std::vector<T> values_;
};

template <typename T>
T Stats<T>::min() const {
    T best = values_[0];
    for (const T &v : values_) {
        if (v < best) best = v;
    }
    return best;
}

template <typename T>
T Stats<T>::max() const {
    T best = values_[0];
    for (const T &v : values_) {
        if (v > best) best = v;
    }
    return best;
}

template <typename T>
double Stats<T>::mean() const {
    double total = 0;
    for (const T &v : values_) total += v;
    return total / static_cast<double>(values_.size());
}

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
    void add(Record r) { records_.add(std::move(r)); }
    bool undo() { return records_.remove_last(); }
    int total() const {
        int t = 0;
        records_.for_each([&t](const Record &r) { t += r.amount(); });
        return t;
    }
    void list() const {
        std::vector<Record> sorted = records_.items();
        std::sort(sorted.begin(), sorted.end(),
                  [](const Record &a, const Record &b) { return a.name() < b.name(); });
        for (const Record &r : sorted) {
            std::cout << r.name() << ": " << r.amount() << "\n";
        }
        std::cout << "Records: " << records_.size() << "\n";
        std::cout << "Total: " << total() << "\n";
    }
    void find(const std::string &name) const {
        for (const Record &r : records_.items()) {
            if (r.name() == name) {
                std::cout << r.name() << ": " << r.amount() << "\n";
                return;
            }
        }
        std::cout << "Not found\n";
    }
    void stats() const {
        if (records_.size() == 0) {
            std::cout << "Empty\n";
            return;
        }
        std::vector<int> amounts;
        records_.for_each([&amounts](const Record &r) { amounts.push_back(r.amount()); });
        Stats<int> s(amounts);
        std::cout << "Min: " << s.min() << "  Max: " << s.max();
        std::cout << "  Mean: " << std::fixed << std::setprecision(2) << s.mean() << "\n";
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
    std::size_t save(const std::string &path) const {
        std::ofstream out(path);
        records_.for_each([&out](const Record &r) { out << r.name() << " " << r.amount() << "\n"; });
        return records_.size();
    }
private:
    Table<Record> records_;
};

std::optional<int> read_amount() {
    std::string line;
    while (true) {
        std::cout << "Amount?\n";
        if (!std::getline(std::cin >> std::ws, line)) return std::nullopt;
        try {
            return std::stoi(line);
        } catch (const std::exception &) {
            std::cout << "Not a number, try again\n";
        }
    }
}

int main() {
    auto vault = std::make_unique<Vault>();
    std::cout << "Loaded " << vault->load("vault.txt") << " records\n";
    int cmd;
    while (true) {
        std::cout << "Command?\n";
        if (!(std::cin >> cmd)) break;
        if (cmd == 1) {
            std::string name;
            std::cout << "Name?\n";
            std::cin >> name;
            std::optional<int> amount = read_amount();
            if (!amount) break;
            vault->add(Record(name, *amount));
            std::cout << "Added\n";
        } else if (cmd == 2) {
            vault->list();
        } else if (cmd == 3) {
            std::cout << "Saved " << vault->save("vault.txt") << " records\n";
            std::cout << "Bye\n";
            break;
        } else if (cmd == 4) {
            std::string name;
            std::cout << "Name?\n";
            std::cin >> name;
            vault->find(name);
        } else if (cmd == 5) {
            std::cout << (vault->undo() ? "Undone\n" : "Nothing to undo\n");
        } else if (cmd == 6) {
            vault->stats();
        } else {
            std::cout << "Unknown command\n";
        }
    }
    return 0;
}
`,
      projectNote: 'Vault++ v0.6: records survive a restart, a missing file is a normal start, and a typo in an amount is a retry instead of a crash. Module 7 turns the program into a command-line tool with its own tests.',
    },
  ],
};

export const m6: Module = {
  id: 'cpp-m6',
  title: 'Errors and files',
  goal: 'Exceptions, std::optional/expected, fstream, structured error handling.',
  projectMilestone: 'Vault++ v0.6: persistence with real error handling.',
  status: 'available',
  lessons: [l61, l62, l63, l64],
};
