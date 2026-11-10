import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 4: Ownership                                                */
/* Learners have finished the C track and C++ Modules 1-3. Vault++    */
/* v0.3 (Record and Vault classes) becomes v0.4: undo through a       */
/* history, and the Vault held by a std::unique_ptr in main.           */
/* ------------------------------------------------------------------ */

/** C++ source written verbatim: backslashes stay (so `"\n"` inside C++ strings survives), leading newline dropped. */
const cpp = (s: TemplateStringsArray, ..._splices: unknown[]) => s.raw.join('').replace(/^\n/, '');

/** The Record class exactly as v0.3 left it; reused unchanged through this module. */
const RECORD = cpp`
class Record {
public:
    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}
    const std::string &name() const { return name_; }
    int amount() const { return amount_; }
private:
    std::string name_;
    int amount_;
};
`;

/** A class that announces its own copies and moves; used in 4-2 only to make the invisible visible. */
const TAG = cpp`
class Tag {
public:
    explicit Tag(const std::string &name) : name_(name) {}
    Tag(const Tag &other) : name_(other.name_) {
        std::cout << "copy " << name_ << "\n";
    }
    Tag(Tag &&other) : name_(std::move(other.name_)) {
        std::cout << "move " << name_ << "\n";
    }
    const std::string &name() const { return name_; }
private:
    std::string name_;
};
`;

/** Vault++ v0.4, exactly as tested in cpp-4-5 and shown labelled in its concept step. */
const VAULT_V04 = cpp`
#include <algorithm>
#include <iostream>
#include <memory>
#include <optional>
#include <string>
#include <utility>
#include <vector>

${''}` + RECORD + cpp`

class Vault {
public:
    void add(Record record) { records_.push_back(std::move(record)); }
    bool undo() {
        if (records_.empty()) {
            return false;
        }
        records_.pop_back();
        return true;
    }
    int total() const {
        int sum = 0;
        for (const Record &r : records_) {
            sum += r.amount();
        }
        return sum;
    }
    std::optional<Record> find(const std::string &name) const {
        for (const Record &r : records_) {
            if (r.name() == name) {
                return r;
            }
        }
        return std::nullopt;
    }
    void list() const {
        std::vector<Record> sorted = records_;
        std::sort(sorted.begin(), sorted.end(), [](const Record &a, const Record &b) { return a.name() < b.name(); });
        for (const Record &r : sorted) {
            std::cout << r.name() << ": " << r.amount() << "\n";
        }
        std::cout << "Records: " << sorted.size() << "\n";
        std::cout << "Total: " << total() << "\n";
    }
private:
    std::vector<Record> records_;
};

int main() {
    std::unique_ptr<Vault> vault = std::make_unique<Vault>();
    while (true) {
        std::cout << "Command?\n";
        int command;
        std::cin >> command;
        if (command == 1) {
            std::cout << "Name?\n";
            std::string name;
            std::cin >> name;
            std::cout << "Amount?\n";
            int amount;
            std::cin >> amount;
            vault->add(Record(name, amount));
            std::cout << "Added\n";
        } else if (command == 2) {
            vault->list();
        } else if (command == 4) {
            std::cout << "Name?\n";
            std::string name;
            std::cin >> name;
            std::optional<Record> found = vault->find(name);
            if (found) {
                std::cout << found->name() << ": " << found->amount() << "\n";
            } else {
                std::cout << "Not found\n";
            }
        } else if (command == 5) {
            if (vault->undo()) {
                std::cout << "Undone\n";
            } else {
                std::cout << "Nothing to undo\n";
            }
        } else if (command == 3) {
            std::cout << "Bye\n";
            break;
        } else {
            std::cout << "Unknown command\n";
        }
    }
    return 0;
}
`;

/* ------------------------------------------------------------------ */
/* 4-1 RAII                                                           */
/* ------------------------------------------------------------------ */

const l41: Lesson = {
  id: 'cpp-4-1',
  title: 'The closing brace cleans up',
  objective: 'Write a destructor and predict when it runs, so acquiring in a constructor and releasing in a destructor can replace cleanup by hand.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.4.dtor', term: '~Name() { ... }', kind: 'pattern', meaning: 'The destructor: a member function named with a tilde and the class name, no parameters, no return type. The compiler calls it exactly once, when the object\'s lifetime ends. You never call it yourself.', example: 'class Tracer {\npublic:\n    ~Tracer() { std::cout << "release\\n"; }\n};', analogy: 'The constructor is the opening bracket of the object\'s life and the destructor the closing one. It breaks in that you write the opening call (`Tracer t("a")`) but never the closing one: the compiler inserts it at the right brace.' },
    { id: 'cpp.4.raii', term: 'RAII', kind: 'concept', meaning: '"Resource Acquisition Is Initialisation": a resource (memory, file, lock) is acquired in a constructor and released in the destructor, so the object\'s scope is the resource\'s lifetime. Leaving the scope by any route, return or break included, releases it.', example: 'void save() {\n    std::ofstream out("vault.txt");  // opened here\n    out << "rent 800\\n";\n}                                   // closed here, even on early return' },
    { id: 'cpp.4.lifetime', term: 'automatic lifetime', kind: 'concept', meaning: 'A local object lives from its declaration to the closing brace of the block it was declared in. Objects of one block are destroyed in the reverse of the order they were created.', example: '{\n    Tracer a("a");   // created first\n    Tracer b("b");   // created second\n}                    // b released, then a' },
    { id: 'cpp.4.bare-block', term: '{ ... } as a scope', kind: 'pattern', meaning: 'A pair of braces with no if or loop attached. Everything declared inside is destroyed at the closing brace, which is how you end a lifetime early on purpose.', example: '{\n    Tracer temp("temp");\n}   // temp is gone here\nstd::cout << "after\\n";' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Acquire in the constructor, release in the destructor',
      body: `In C every \`malloc\` needed its \`free\`, every \`fopen\` its \`fclose\`, and an early \`return\` between them was a leak. C++ attaches the release to the object itself. A **destructor** is a member function named \`~Tracer()\`, with no parameters and no return type. You never call it. The compiler calls it at the exact moment the object's lifetime ends: the closing brace of the block it was declared in.

That gives the rule this whole module rests on, called **RAII**: *acquire* a resource in the constructor and *release* it in the destructor. Then the scope of the object is the lifetime of the resource, and no route out of the block, not \`return\`, not \`break\`, can forget to release.

Destruction order is fixed: objects of one block go in the **reverse** of the order they were created. A bare pair of braces makes a scope of its own, which is how you end a lifetime early. The program below prints every acquire and release, so you can watch the compiler do the bookkeeping.`,
      example: {
        language: 'cpp',
        source: cpp`
#include <iostream>
#include <string>

class Tracer {
public:
    explicit Tracer(const std::string &name) : name_(name) {
        std::cout << "acquire " << name_ << "\n";
    }
    ~Tracer() {
        std::cout << "release " << name_ << "\n";
    }
private:
    std::string name_;
};

int main() {
    Tracer a("a");
    {
        Tracer b("b");
        std::cout << "inner work\n";
    }
    Tracer c("c");
    std::cout << "outer work\n";
    return 0;
}`,
        labels: [
          { lines: [6, 8], label: 'Constructor: the acquiring step, announced.' },
          { lines: [9, 11], label: 'Destructor: tilde, class name, nothing else. The releasing step.' },
          { lines: [17, 17], label: 'a lives until the end of main.' },
          { lines: [18, 21], label: 'A bare block: b is created, used, and released at the inner brace, before c exists.' },
          { lines: [22, 24], label: 'c is created after b is gone. At the final brace, c is released, then a: reverse order.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'In C the Vault had `vault_free(&v)` and you had to remember to call it on every path out of `main`. A C++ destructor is that function, called by the compiler, on every path. `std::vector` and `std::string` already work this way: the "no free anywhere" in v0.3 was their destructors running.' },
        { from: 'python', note: 'Python\'s `with open(...) as f:` releases at the end of the block; a C++ destructor does the same without a special statement, for every object. Unlike `__del__`, which runs whenever the garbage collector gets round to it, a destructor runs at a known line: the closing brace.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Tracer prints `acquire <name>` in its constructor and `release <name>` in its destructor. What does this program print?',
      code: {
        language: 'cpp',
        source: cpp`
void work() {
    Tracer t("t");
    std::cout << "working\n";
}

int main() {
    Tracer a("a");
    work();
    Tracer b("b");
    std::cout << "done\n";
    return 0;
}`,
      },
      choices: [
        'acquire a\nacquire t\nworking\nrelease t\nacquire b\ndone\nrelease b\nrelease a',
        'acquire a\nacquire t\nworking\nacquire b\ndone\nrelease t\nrelease b\nrelease a',
        'acquire a\nacquire t\nworking\nrelease t\nacquire b\ndone\nrelease a\nrelease b',
        'acquire a\nacquire t\nworking\nacquire b\ndone',
      ],
      answer: 'acquire a\nacquire t\nworking\nrelease t\nacquire b\ndone\nrelease b\nrelease a',
      explanation: 't is local to work(), so it is released at work\'s closing brace, before main goes on to create b. At the end of main the two survivors go in reverse order of creation: b was created last, so it is released first, and a last. Nothing is ever left unreleased: the fourth option is what a C program with forgotten frees would do.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a `Tracer` whose constructor prints `acquire <name>` and whose destructor prints `release <name>`, with a `main` that prints `acquire a`, `acquire b`, `release b`, `release a`.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        '#include <string>',
        'class Tracer {',
        'public:',
        '    explicit Tracer(const std::string &name) : name_(name) { std::cout << "acquire " << name_ << "\\n"; }',
        '    ~Tracer() { std::cout << "release " << name_ << "\\n"; }',
        'private:',
        '    std::string name_;',
        '};',
        'int main() {',
        '    Tracer a("a");',
        '    Tracer b("b");',
        '    return 0;',
        '}',
      ],
      distractors: [
        '    void ~Tracer() { std::cout << "release " << name_ << "\\n"; }',
        '    ~Tracer(const std::string &name) { std::cout << "release " << name << "\\n"; }',
        '    b.~Tracer();',
      ],
      explanation: 'A destructor has no return type, not even void, and takes no parameters: there is exactly one way to destroy an object, so there is nothing to pass. And you never call it yourself: `b.~Tracer()` would release b once by hand and then again at the brace. The reverse order (b before a) needs no code at all.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the class so the program prints `open log`, `writing`, `close log`, `after`.',
      language: 'cpp',
      template: cpp`
#include <iostream>
#include <string>
class Log {
public:
    explicit Log(const std::string &name) : name_(name) { std::cout << "open " << name_ << "\n"; }
    {{dtor}}() { std::cout << "close " << name_ << "\n"; }
private:
    std::string name_;
};
int main() {
    {{open}}
        Log log("log");
        std::cout << "writing\n";
    {{close}}
    std::cout << "after\n";
    return 0;
}`,
      blanks: [
        { id: 'dtor', answers: ['~Log'], hint: 'tilde, then the class name; no return type' },
        { id: 'open', answers: ['{'], hint: 'start a scope of its own so log ends before "after"' },
        { id: 'close', answers: ['}'], hint: 'the brace that ends log\'s lifetime' },
      ],
      explanation: 'The destructor is `~Log()`. Wrapping the two lines in a bare block ends log\'s lifetime at the closing brace, so `close log` prints before `after`. Without the block, `after` would print first and `close log` at the end of main.',
    },
    {
      kind: 'modify',
      prompt: 'A `Session` prints `login <user>` when created but never logs out. Add a destructor that prints `logout <user>`. The program should then log the guest out before `admin working`, and the admin at the very end.',
      language: 'cpp',
      starter: cpp`
#include <iostream>
#include <string>

class Session {
public:
    explicit Session(const std::string &user) : user_(user) {
        std::cout << "login " << user_ << "\n";
    }
private:
    std::string user_;
};

int main() {
    Session admin("admin");
    {
        Session guest("guest");
        std::cout << "guest browsing\n";
    }
    std::cout << "admin working\n";
    return 0;
}
`,
      tests: [{ description: 'Guest logs out at its brace, admin at the end', expectedStdout: 'login admin\nlogin guest\nguest browsing\nlogout guest\nadmin working\nlogout admin' }],
      hint: 'Add `~Session() { ... }` under public:. Do not touch main: the braces already decide when each logout happens.',
      solution: cpp`
#include <iostream>
#include <string>

class Session {
public:
    explicit Session(const std::string &user) : user_(user) {
        std::cout << "login " << user_ << "\n";
    }
    ~Session() {
        std::cout << "logout " << user_ << "\n";
    }
private:
    std::string user_;
};

int main() {
    Session admin("admin");
    {
        Session guest("guest");
        std::cout << "guest browsing\n";
    }
    std::cout << "admin working\n";
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write a class `Door` whose constructor prints `open <name>` and whose destructor prints `close <name>`. In `main`: print `Outer?` and read a word; print `Inner?` and read a word. Create a Door with the outer name, then inside a bare block create a Door with the inner name and print `inside`. After the block print `outside`. Let the destructors do the rest.',
      language: 'cpp',
      tests: [
        { description: 'Inner door closes before outside', stdin: 'hall\nkitchen', expectedStdout: 'Outer?\nInner?\nopen hall\nopen kitchen\ninside\nclose kitchen\noutside\nclose hall' },
        { description: 'One-letter names', stdin: 'a\nb', expectedStdout: 'Outer?\nInner?\nopen a\nopen b\ninside\nclose b\noutside\nclose a' },
      ],
      hint: 'Read both names before creating any Door, or the prompts and the open lines interleave. The last line, `close <outer>`, is printed by nothing you write in main.',
      solution: cpp`
#include <iostream>
#include <string>

class Door {
public:
    explicit Door(const std::string &name) : name_(name) {
        std::cout << "open " << name_ << "\n";
    }
    ~Door() {
        std::cout << "close " << name_ << "\n";
    }
private:
    std::string name_;
};

int main() {
    std::cout << "Outer?\n";
    std::string outer;
    std::cin >> outer;
    std::cout << "Inner?\n";
    std::string inner;
    std::cin >> inner;
    Door first(outer);
    {
        Door second(inner);
        std::cout << "inside\n";
    }
    std::cout << "outside\n";
    return 0;
}
`,
      projectNote: 'Vault++ v0.4 will hold its Vault through an owning pointer that releases it at the end of main. This lesson makes that invisible release visible before it is relied on.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 4-2 Copy vs move                                                   */
/* ------------------------------------------------------------------ */

const l42: Lesson = {
  id: 'cpp-4-2',
  title: 'Copy it, or hand it over',
  objective: 'Tell a copy from a move, use std::move to hand a value over, and know when to write neither constructor.',
  minutes: 22,
  lexicon: [
    { id: 'cpp.4.copy-ctor', term: 'Name(const Name &other)', kind: 'pattern', meaning: 'The copy constructor: builds a new object as a duplicate of other, which stays intact. It runs for `Name b = a;`, for passing a Name by value, and for push_back(a). The compiler writes one for you that copies each member.', example: 'Tag(const Tag &other) : name_(other.name_) {}' },
    { id: 'cpp.4.move-ctor', term: 'Name(Name &&other)', kind: 'pattern', meaning: 'The move constructor: builds a new object by taking over other\'s contents instead of duplicating them. && marks a parameter that binds to a temporary or to something wrapped in std::move. The compiler writes one for you that moves each member.', example: 'Tag(Tag &&other) : name_(std::move(other.name_)) {}' },
    { id: 'cpp.4.std-move', term: 'std::move(x)', kind: 'builtin', meaning: 'From <utility>. Moves nothing itself: it marks x as "may be taken from", so the move constructor is chosen instead of the copy constructor. After the call, treat x as emptied.', example: 'std::vector<int> b = std::move(a);   // b takes a\'s buffer; a is now moved-from', analogy: 'Handing over the keys rather than photocopying the house. It breaks because std::move is only the offer: if nothing accepts (no move constructor, or a const source), a copy happens anyway.' },
    { id: 'cpp.4.moved-from', term: 'moved-from object', kind: 'concept', meaning: 'An object whose contents were taken by a move. It is still a valid object: it can be destroyed, assigned a new value, or cleared. Its value is unspecified, so do not read it until you have given it a new one.', example: 'std::string s = "food";\nstd::string t = std::move(s);\ns = "bus";          // fine: assign before reading\nstd::cout << s;     // prints bus' },
    { id: 'cpp.4.rule-of-zero', term: 'rule of zero', kind: 'concept', meaning: 'If a class holds its resources in members that already manage themselves (std::string, std::vector, std::unique_ptr), write no copy constructor, move constructor, destructor or assignment operator at all. The compiler-generated ones are correct.', example: 'class Record {       // copies, moves and destroys correctly with nothing written\n    std::string name_;\n    int amount_;\n};' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Two ways to build one object from another',
      body: `\`Tag copy = rent;\` runs the **copy constructor**, \`Tag(const Tag &other)\`: a new object that duplicates \`other\`, leaving it untouched. For a \`std::string\` or a \`std::vector\` that means allocating a second buffer and copying every byte.

\`Tag moved = std::move(rent);\` runs the **move constructor**, \`Tag(Tag &&other)\`: the new object takes over \`other\`'s buffer, and \`other\` is left holding nothing. \`std::move\` itself moves nothing. It is a cast that says "this one may be taken from", which makes the compiler pick the \`&&\` overload. After it, \`rent\` is **moved-from**: still a valid object that you may assign to or let die, but whose contents you should not read.

\`Tag\` below writes both constructors only to print when each runs. \`Record\` writes neither, and should not: its members are a \`std::string\` and an \`int\`, which already know how to copy and move themselves. That is the **rule of zero**: hold resources in self-managing members and the compiler-generated copy, move and destructor are right.`,
      example: {
        language: 'cpp',
        source: cpp`
#include <iostream>
#include <string>
#include <utility>
#include <vector>

${''}` + TAG + cpp`

int main() {
    Tag rent("rent");
    Tag copy = rent;
    Tag moved = std::move(rent);
    std::cout << copy.name() << " " << moved.name() << "\n";

    std::vector<std::string> names;
    std::string food = "food";
    names.push_back(food);
    names.push_back(std::move(food));
    food = "bus";
    std::cout << names.size() << " " << names[1] << " " << food << "\n";
    return 0;
}`,
        labels: [
          { lines: [3, 3], label: 'std::move lives in <utility>.' },
          { lines: [9, 11], label: 'Copy constructor: duplicate the member from a const reference; the source is not touched.' },
          { lines: [12, 14], label: 'Move constructor: && binds to a source that may be emptied; std::move passes that permission down to the string member.' },
          { lines: [21, 24], label: 'A copy (rent still intact), then a move (rent now moved-from and not read again). Prints copy rent, move rent, then rent rent.' },
          { lines: [26, 29], label: 'push_back copies food, then moves it: the vector has two "food" strings and food is moved-from.' },
          { lines: [30, 31], label: 'Give the moved-from string a new value before reading it. Prints 2 food bus.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'C has only `memcpy`-style copying of structs; a struct holding a `char *` copied the pointer and left two owners of one buffer. A C++ copy constructor copies the buffer; a move constructor is the honest version of "steal the pointer and null out the source" that you wrote by hand in `vault_take`.' },
        { from: 'python', note: 'Python assignment never copies: `b = a` makes a second name for one list. C++ `Tag b = a;` makes a second object with its own contents, and `std::move` is how you ask for the cheaper hand-over. There is no Python equivalent of "moved-from": a Python name always refers to a complete object.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Tag prints `copy <name>` in its copy constructor and `move <name>` in its move constructor. What does this program print?',
      code: {
        language: 'cpp',
        source: cpp`
int main() {
    Tag a("a");
    Tag b = a;
    Tag c = std::move(a);
    Tag d = std::move(b);
    std::cout << c.name() << d.name() << "\n";
    return 0;
}`,
      },
      choices: ['copy a\nmove a\nmove a\naa', 'copy a\nmove a\ncopy a\naa', 'copy a\nmove a\nmove a\na', 'copy a\ncopy a\ncopy a\naa'],
      answer: 'copy a\nmove a\nmove a\naa',
      explanation: 'b is a copy of a, so b has its own "a". Moving a into c and moving b into d each run the move constructor and print `move a`. c and d both hold "a", so the last line is `aa`. The two moved-from objects, a and b, are never read again: that is what makes the program well-behaved.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a `Tag` with a copy constructor and a move constructor, and a `main` that prints `copy rent` then `move rent`.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        '#include <string>',
        '#include <utility>',
        'class Tag {',
        'public:',
        '    explicit Tag(const std::string &name) : name_(name) {}',
        '    Tag(const Tag &other) : name_(other.name_) { std::cout << "copy " << name_ << "\\n"; }',
        '    Tag(Tag &&other) : name_(std::move(other.name_)) { std::cout << "move " << name_ << "\\n"; }',
        'private:',
        '    std::string name_;',
        '};',
        'int main() {',
        '    Tag rent("rent");',
        '    Tag copy = rent;',
        '    Tag moved = std::move(rent);',
        '    return 0;',
        '}',
      ],
      distractors: [
        '    Tag(Tag other) : name_(other.name_) { std::cout << "copy " << name_ << "\\n"; }',
        '    Tag(Tag &&other) : name_(other.name_) { std::cout << "move " << name_ << "\\n"; }',
        '    Tag moved = rent.move();',
      ],
      explanation: 'A copy constructor must take its source by const reference: taking it by value would need a copy to make the parameter, which needs the copy constructor, forever. Inside the move constructor, `other` has a name, so `other.name_` would be copied; it needs its own `std::move` to be moved. And moving is not a member function you call: it is `std::move(rent)` around the source.',
    },
    {
      kind: 'modify',
      prompt: '`keep` takes its `Tag` by value, and `main` passes `rent` and `food` to it, so each call copies. Neither Tag is used again, so hand them over instead: the program should print `move rent`, `kept rent`, `move food`, `kept food`.',
      language: 'cpp',
      starter: cpp`
#include <iostream>
#include <string>

${''}` + TAG + cpp`

void keep(Tag tag) {
    std::cout << "kept " << tag.name() << "\n";
}

int main() {
    Tag rent("rent");
    Tag food("food");
    keep(rent);
    keep(food);
    return 0;
}
`,
      tests: [{ description: 'Both tags moved into keep', expectedStdout: 'move rent\nkept rent\nmove food\nkept food' }],
      hint: 'Include <utility> and wrap each argument in std::move(...). keep itself does not change: a by-value parameter accepts a copy or a move, whichever the caller offers.',
      solution: cpp`
#include <iostream>
#include <string>
#include <utility>

${''}` + TAG + cpp`

void keep(Tag tag) {
    std::cout << "kept " << tag.name() << "\n";
}

int main() {
    Tag rent("rent");
    Tag food("food");
    keep(std::move(rent));
    keep(std::move(food));
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write `Record` by the rule of zero (constructor and const accessors only) and a `Vault` whose `explicit` constructor takes a `std::vector<Record>` by value and moves it into the private `records_`, plus `size()` and `total()`. Write `std::vector<Record> readRecords(int count)` that asks `Name?` (word) and `Amount?` (int) count times and returns the vector. In `main`: print `Count?`, read it, call `readRecords`, move the result into a Vault, and print `Records: <n>` then `Total: <t>`.',
      language: 'cpp',
      tests: [
        { description: 'Two records', stdin: '2\nrent\n800\nfood\n120', expectedStdout: 'Count?\nName?\nAmount?\nName?\nAmount?\nRecords: 2\nTotal: 920' },
        { description: 'No records', stdin: '0', expectedStdout: 'Count?\nRecords: 0\nTotal: 0' },
      ],
      hint: 'The constructor is `explicit Vault(std::vector<Record> records) : records_(std::move(records)) {}`. In main, `Vault vault(std::move(records));` hands the vector over instead of copying every Record.',
      solution: cpp`
#include <iostream>
#include <string>
#include <utility>
#include <vector>

${''}` + RECORD + cpp`

class Vault {
public:
    explicit Vault(std::vector<Record> records) : records_(std::move(records)) {}
    int size() const { return static_cast<int>(records_.size()); }
    int total() const {
        int sum = 0;
        for (const Record &r : records_) {
            sum += r.amount();
        }
        return sum;
    }
private:
    std::vector<Record> records_;
};

std::vector<Record> readRecords(int count) {
    std::vector<Record> records;
    for (int i = 0; i < count; i++) {
        std::cout << "Name?\n";
        std::string name;
        std::cin >> name;
        std::cout << "Amount?\n";
        int amount;
        std::cin >> amount;
        records.push_back(Record(name, amount));
    }
    return records;
}

int main() {
    std::cout << "Count?\n";
    int count;
    std::cin >> count;
    std::vector<Record> records = readRecords(count);
    Vault vault(std::move(records));
    std::cout << "Records: " << vault.size() << "\n";
    std::cout << "Total: " << vault.total() << "\n";
    return 0;
}
`,
      projectNote: 'Vault++ v0.4: Record stays a rule-of-zero class, and Vault takes ownership of what it is given with std::move instead of copying it.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 4-3 Smart pointers                                                 */
/* ------------------------------------------------------------------ */

const l43: Lesson = {
  id: 'cpp-4-3',
  title: 'Pointers that know who owns',
  objective: 'Own an object through std::unique_ptr, transfer it with std::move, share with std::shared_ptr, and keep raw pointers for looking only.',
  minutes: 24,
  lexicon: [
    { id: 'cpp.4.unique-ptr', term: 'std::unique_ptr<T>', kind: 'builtin', meaning: 'From <memory>. An owning pointer: exactly one unique_ptr owns the T, and its destructor deletes the T. It cannot be copied; it can be moved, which transfers ownership and leaves the source null. Use -> and * as with a raw pointer.', example: 'std::unique_ptr<Vault> vault = std::make_unique<Vault>();\nvault->add(Record("rent", 800));', analogy: 'The single key to a locker. You can hand the key over, but there is never a second one, so nobody can throw the contents away twice. It breaks slightly because you can still ask for a raw pointer to look inside without the key.' },
    { id: 'cpp.4.make-unique', term: 'std::make_unique<T>(args)', kind: 'builtin', meaning: 'Creates a T from args and returns a unique_ptr that owns it. The replacement for `new T(args)`: no raw pointer is ever exposed, so nothing can leak between creation and ownership.', example: 'std::unique_ptr<Record> rent = std::make_unique<Record>("rent", 800);' },
    { id: 'cpp.4.shared-ptr', term: 'std::shared_ptr<T>', kind: 'builtin', meaning: 'From <memory>. An owning pointer that can be copied: every copy is a co-owner, and the T is deleted when the last co-owner is destroyed. Create with std::make_shared<T>(args). Reach for it only when ownership genuinely must be shared.', example: 'std::shared_ptr<Record> food = std::make_shared<Record>("food", 120);\nstd::shared_ptr<Record> alias = food;   // two owners' },
    { id: 'cpp.4.use-count', term: 'p.use_count()', kind: 'builtin', meaning: 'How many shared_ptr objects currently co-own the same T. Goes up with each copy and down as each copy is destroyed or reset. The T is deleted when the count reaches zero.', example: 'std::cout << food.use_count() << "\\n";   // 1, then 2 after a copy' },
    { id: 'cpp.4.observer-ptr', term: 'T * as a non-owning pointer', kind: 'pattern', meaning: 'A raw pointer that only looks at an object someone else owns. Obtained from a smart pointer with .get() or from an object with &. Never delete it, and never use it after the owner is gone.', example: 'void show(const Record *r) {\n    std::cout << r->name() << "\\n";\n}\nshow(rent.get());   // rent still owns' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Ownership written into the type',
      body: `In C a pointer said nothing about who must \`free\` it; the comment above the function did. C++ puts the answer in the type. \`std::unique_ptr<Record>\` **owns** one Record: its destructor deletes it, so RAII from lesson 1 covers heap objects too. Create one with \`std::make_unique<Record>(args)\`; you never write \`new\` or \`delete\`. Use \`->\` as before.

A unique_ptr **cannot be copied**: two owners would mean two deletes. It can be **moved**: \`std::move\` transfers ownership and leaves the source **null**, which is guaranteed, not merely unspecified.

When ownership genuinely has to be shared, \`std::shared_ptr\` counts its co-owners; \`use_count()\` tells you how many, and the object dies with the last one. Most code needs unique_ptr, or no pointer at all.

A raw pointer is still fine for **looking**: \`rent.get()\` hands \`show\` a \`const Record *\` that owns nothing and must simply not outlive its owner.`,
      example: {
        language: 'cpp',
        source: cpp`
#include <iostream>
#include <memory>
#include <string>
#include <utility>

${''}` + RECORD + cpp`

void show(const Record *r) {
    std::cout << r->name() << ": " << r->amount() << "\n";
}

int main() {
    std::unique_ptr<Record> rent = std::make_unique<Record>("rent", 800);
    show(rent.get());
    std::unique_ptr<Record> keeper = std::move(rent);
    std::cout << "rent is empty: " << (rent == nullptr) << "\n";
    show(keeper.get());

    std::shared_ptr<Record> food = std::make_shared<Record>("food", 120);
    std::cout << "owners: " << food.use_count() << "\n";
    {
        std::shared_ptr<Record> alias = food;
        std::cout << "owners: " << food.use_count() << "\n";
    }
    std::cout << "owners: " << food.use_count() << "\n";
    return 0;
}`,
        labels: [
          { lines: [2, 2], label: 'unique_ptr, shared_ptr and the make_ functions live in <memory>.' },
          { lines: [16, 18], label: 'A non-owning view: a raw pointer that only reads. It never deletes.' },
          { lines: [21, 22], label: 'Create and own in one step; lend a raw pointer with .get().' },
          { lines: [23, 25], label: 'Transfer ownership. rent is now null (prints 1); keeper will delete the Record at the end of main.' },
          { lines: [27, 28], label: 'A shared owner: one co-owner so far.' },
          { lines: [29, 33], label: 'A copy is a second co-owner (2) until it leaves its block (back to 1). The Record dies with the last one.' },
        ],
      },
      contrast: [
        { from: 'c', note: '`struct Record *r = malloc(sizeof *r)` and a `free(r)` somewhere later, with the ownership rule living in a comment. `std::make_unique` is the malloc, the unique_ptr destructor is the free, and the compiler refuses the copy that would have caused a double free. A raw `const Record *` keeps its C meaning: look, do not free.' },
        { from: 'python', note: 'Every Python name is in effect a shared_ptr: reference counting keeps the object alive while any name refers to it. C++ makes you choose: unique_ptr when one owner is enough (almost always), shared_ptr when it is not, and a plain reference or raw pointer for borrowing.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What happens when this program is compiled and run?',
      code: {
        language: 'cpp',
        source: cpp`
int main() {
    std::unique_ptr<Record> a = std::make_unique<Record>("rent", 800);
    std::unique_ptr<Record> b = a;
    std::cout << a->amount() << " " << b->amount() << "\n";
    return 0;
}`,
      },
      choices: ['a compiler error: a unique_ptr cannot be copied', '800 800', 'it prints 800 800 and then crashes with a double free', 'a is empty afterwards, so it prints 0 800'],
      answer: 'a compiler error: a unique_ptr cannot be copied',
      explanation: '`b = a` asks for a copy, and unique_ptr has deleted its copy constructor precisely so that two owners of one Record can never exist. The compiler refuses the line; the double free it would have caused never gets a chance to run. Write `std::move(a)` to transfer ownership, after which a is null and must not be dereferenced.',
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: {
        language: 'cpp',
        source: cpp`
#include <iostream>
#include <memory>
#include <string>
int main() {
    std::shared_ptr<std::string> a = std::make_shared<std::string>("rent");
    std::shared_ptr<std::string> b = a;
    {
        std::shared_ptr<std::string> c = b;
        std::cout << a.use_count() << "\n";
    }
    b = nullptr;
    std::cout << a.use_count() << " " << *a << "\n";
    return 0;
}`,
      },
      choices: ['3\n1 rent', '3\n2 rent', '1\n1 rent', '3\n1 and then a crash: the string was deleted'],
      answer: '3\n1 rent',
      explanation: 'a, b and c all co-own the one string, so use_count is 3 inside the block. c dies at the brace (2) and `b = nullptr` gives up b\'s share (1). a still owns it, so the string is alive and prints `rent`. It will be deleted only when a is destroyed at the end of main.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that creates a `std::string` through `std::make_unique`, hands ownership to `adopt`, and prints `adopted rent` then `word is empty: 1`.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        '#include <memory>',
        '#include <string>',
        '#include <utility>',
        'void adopt(std::unique_ptr<std::string> word) {',
        '    std::cout << "adopted " << *word << "\\n";',
        '}',
        'int main() {',
        '    std::unique_ptr<std::string> word = std::make_unique<std::string>("rent");',
        '    adopt(std::move(word));',
        '    std::cout << "word is empty: " << (word == nullptr) << "\\n";',
        '    return 0;',
        '}',
      ],
      distractors: [
        '    std::unique_ptr<std::string> word = new std::string("rent");',
        '    adopt(word);',
        '    delete word;',
      ],
      explanation: 'A unique_ptr is built with make_unique, not assigned from a raw `new`. Passing it to a by-value parameter is a transfer, so the call needs std::move; a plain `adopt(word)` is the copy the compiler refuses. And nothing is ever deleted by hand: adopt\'s parameter deletes the string when adopt returns, which is why word is empty afterwards and no leak remains.',
    },
    {
      kind: 'modify',
      prompt: 'This program does not compile: `adopt(record)` tries to copy a `std::unique_ptr`. Transfer ownership instead, and after the call print `record is empty: 1` to show that `record` no longer owns anything.',
      language: 'cpp',
      starter: cpp`
#include <iostream>
#include <memory>
#include <string>
#include <utility>

${''}` + RECORD + cpp`

void adopt(std::unique_ptr<Record> record) {
    std::cout << "adopted " << record->name() << "\n";
}

int main() {
    std::cout << "Name?\n";
    std::string name;
    std::cin >> name;
    std::cout << "Amount?\n";
    int amount;
    std::cin >> amount;
    std::unique_ptr<Record> record = std::make_unique<Record>(name, amount);
    std::cout << record->name() << ": " << record->amount() << "\n";
    adopt(record);
    return 0;
}
`,
      tests: [
        { description: 'Adopt rent', stdin: 'rent\n800', expectedStdout: 'Name?\nAmount?\nrent: 800\nadopted rent\nrecord is empty: 1' },
        { description: 'Adopt a zero amount', stdin: 'bus\n0', expectedStdout: 'Name?\nAmount?\nbus: 0\nadopted bus\nrecord is empty: 1' },
      ],
      hint: '`adopt(std::move(record));` then `std::cout << "record is empty: " << (record == nullptr) << "\\n";`. A moved-from unique_ptr is guaranteed null, so the comparison is safe.',
      solution: cpp`
#include <iostream>
#include <memory>
#include <string>
#include <utility>

${''}` + RECORD + cpp`

void adopt(std::unique_ptr<Record> record) {
    std::cout << "adopted " << record->name() << "\n";
}

int main() {
    std::cout << "Name?\n";
    std::string name;
    std::cin >> name;
    std::cout << "Amount?\n";
    int amount;
    std::cin >> amount;
    std::unique_ptr<Record> record = std::make_unique<Record>(name, amount);
    std::cout << record->name() << ": " << record->amount() << "\n";
    adopt(std::move(record));
    std::cout << "record is empty: " << (record == nullptr) << "\n";
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write `Record` and a `Vault` with `add`, `size()` and `total()`. In `main`, own the Vault through a `std::unique_ptr<Vault>` made with `std::make_unique<Vault>()`. Print `Count?` and read it; then `count` times print `Name?` (word) and `Amount?` (int) and add the record through the pointer with `->`. Finally print `Records: <n>` and `Total: <t>`.',
      language: 'cpp',
      tests: [
        { description: 'Two records through the pointer', stdin: '2\nrent\n800\nfood\n120', expectedStdout: 'Count?\nName?\nAmount?\nName?\nAmount?\nRecords: 2\nTotal: 920' },
        { description: 'No records', stdin: '0', expectedStdout: 'Count?\nRecords: 0\nTotal: 0' },
      ],
      hint: 'Every call goes through the arrow: `vault->add(Record(name, amount))`, `vault->size()`. There is no delete anywhere: the unique_ptr releases the Vault at the end of main.',
      solution: cpp`
#include <iostream>
#include <memory>
#include <string>
#include <vector>

${''}` + RECORD + cpp`

class Vault {
public:
    void add(const Record &record) { records_.push_back(record); }
    int size() const { return static_cast<int>(records_.size()); }
    int total() const {
        int sum = 0;
        for (const Record &r : records_) {
            sum += r.amount();
        }
        return sum;
    }
private:
    std::vector<Record> records_;
};

int main() {
    std::unique_ptr<Vault> vault = std::make_unique<Vault>();
    std::cout << "Count?\n";
    int count;
    std::cin >> count;
    for (int i = 0; i < count; i++) {
        std::cout << "Name?\n";
        std::string name;
        std::cin >> name;
        std::cout << "Amount?\n";
        int amount;
        std::cin >> amount;
        vault->add(Record(name, amount));
    }
    std::cout << "Records: " << vault->size() << "\n";
    std::cout << "Total: " << vault->total() << "\n";
    return 0;
}
`,
      projectNote: 'Vault++ v0.4: main owns the Vault through a std::unique_ptr and reaches it with ->. The behaviour is the same as v0.3; the ownership is now spelled out.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 4-4 Undo with a history                                            */
/* ------------------------------------------------------------------ */

const l44: Lesson = {
  id: 'cpp-4-4',
  title: 'The last one in is the first one out',
  objective: 'Treat a std::vector as a stack with back() and pop_back(), and write an undo that reports whether it did anything.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.4.back', term: 'v.back()', kind: 'builtin', meaning: 'A reference to the last element of a vector: the most recently pushed one. Calling it on an empty vector is undefined behaviour, so check empty() first.', example: 'if (!history.empty()) {\n    std::cout << history.back() << "\\n";\n}' },
    { id: 'cpp.4.pop-back', term: 'v.pop_back()', kind: 'builtin', meaning: 'Remove the last element of a vector. Returns nothing: read back() first if you need the value. Undefined on an empty vector.', example: 'history.pop_back();   // the newest element is gone', analogy: 'Python\'s `list.pop()` with no argument, except that C++ hands nothing back: pop is only the removal. The analogy also breaks on the empty case, where Python raises and C++ does whatever the memory happens to hold.' },
    { id: 'cpp.4.stack', term: 'stack (LIFO)', kind: 'concept', meaning: 'A collection you add to and remove from at one end only, so the last item in is the first out. A std::vector used through push_back, back and pop_back is a stack, and a stack of past states is a history: undo pops it.', example: 'records_.push_back(r);   // do\nrecords_.pop_back();     // undo' },
    { id: 'cpp.4.sink-param', term: 'void add(Record record) { store(std::move(record)); }', kind: 'pattern', meaning: 'A "sink" parameter: take the object by value, then move it into its final home. A caller who passes a temporary pays one move; a caller who passes a named object they still need gets a copy. One signature serves both.', example: 'void add(Record record) {\n    records_.push_back(std::move(record));\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Undo is a pop',
      body: `Undo needs a history, and the simplest history is the records themselves in the order they were added. A \`std::vector\` already keeps that order. Used through three members it becomes a **stack**: \`push_back\` adds at the end, \`back()\` looks at the newest element, \`pop_back()\` removes it. Last in, first out. Undoing the most recent add is one \`pop_back()\`.

Both \`back()\` and \`pop_back()\` are **undefined** on an empty vector, so \`undo\` checks \`empty()\` first and returns a \`bool\`: \`true\` if something was removed, \`false\` if there was nothing to remove. The caller turns that into \`Undone\` or \`Nothing to undo\`; the Vault itself prints nothing about it.

\`add\` also changes shape. It takes its \`Record\` **by value** and moves it into the vector: \`records_.push_back(std::move(record))\`. A caller passing a temporary like \`Record(name, amount)\` pays one move and no copy. This is the sink pattern from lesson 2 applied to a member function.`,
      example: {
        language: 'cpp',
        source: cpp`
#include <iostream>
#include <string>
#include <utility>
#include <vector>

${''}` + RECORD + cpp`

class Vault {
public:
    void add(Record record) { records_.push_back(std::move(record)); }
    bool undo() {
        if (records_.empty()) {
            return false;
        }
        records_.pop_back();
        return true;
    }
    void list() const {
        for (const Record &r : records_) {
            std::cout << r.name() << ": " << r.amount() << "\n";
        }
        std::cout << "Records: " << records_.size() << "\n";
    }
private:
    std::vector<Record> records_;
};

int main() {
    Vault vault;
    vault.add(Record("rent", 800));
    vault.add(Record("food", 120));
    std::cout << vault.undo() << "\n";
    vault.list();
    std::cout << vault.undo() << "\n";
    std::cout << vault.undo() << "\n";
    vault.list();
    return 0;
}`,
        labels: [
          { lines: [18, 18], label: 'Sink parameter: take the Record by value, move it into the vector. The temporary from the caller is moved, not copied.' },
          { lines: [19, 25], label: 'undo: refuse on empty, otherwise drop the newest record and report success. The Vault decides; the caller speaks.' },
          { lines: [38, 41], label: 'Two adds, one undo (prints 1): food is gone, rent remains, so list shows rent: 800 and Records: 1.' },
          { lines: [42, 44], label: 'The second undo removes rent (1); the third finds nothing (0) and leaves the vector alone. Records: 0.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'The C Vault\'s `count--` was undo; nothing stopped it going below zero and reading garbage on the next add. `pop_back` has the same danger on an empty vector, which is why `undo` guards with `empty()` and says so with a bool instead of silently doing nothing.' },
        { from: 'python', note: '`history.pop()` returns the removed item and raises IndexError when empty. `pop_back()` returns nothing and does not check: you look with `back()` first if you need the value, and you check `empty()` yourself.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: {
        language: 'cpp',
        source: cpp`
#include <iostream>
#include <vector>
int main() {
    std::vector<int> history;
    history.push_back(10);
    history.push_back(20);
    history.push_back(30);
    history.pop_back();
    std::cout << history.back() << "\n";
    history.pop_back();
    history.pop_back();
    std::cout << history.empty() << "\n";
    return 0;
}`,
      },
      choices: ['20\n1', '30\n1', '20\n0', '10\n1'],
      answer: '20\n1',
      explanation: 'The first pop_back removes 30, the newest element, so back() is 20. Two more pops remove 20 and then 10, leaving the vector empty, and empty() prints as 1. A fourth pop_back here would be undefined behaviour: that is the case undo() must refuse.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `Vault::undo()`: return false when there is nothing to undo, otherwise remove the newest record and return true.',
      language: 'cpp',
      indentation: true,
      solution: [
        'bool undo() {',
        '    if (records_.empty()) {',
        '        return false;',
        '    }',
        '    records_.pop_back();',
        '    return true;',
        '}',
      ],
      distractors: [
        '    return records_.pop_back();',
        '    records_.pop_front();',
        'bool undo() const {',
      ],
      explanation: 'pop_back returns void, so it cannot be returned as the bool: remove, then `return true` on the next line. The newest record is at the back, and a vector has no pop_front anyway. And undo changes the vault, so it cannot be const.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete `Vault` so the program prints `food: 120`, then `Undone`, then `Records: 1`.',
      language: 'cpp',
      template: cpp`
#include <iostream>
#include <string>
#include <utility>
#include <vector>
class Record {
public:
    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}
    const std::string &name() const { return name_; }
    int amount() const { return amount_; }
private:
    std::string name_;
    int amount_;
};
class Vault {
public:
    void add(Record record) { records_.push_back({{mv}}(record)); }
    const Record &newest() const { return records_.{{peek}}(); }
    bool undo() {
        if (records_.{{guard}}()) {
            return false;
        }
        records_.{{drop}}();
        return true;
    }
    int size() const { return static_cast<int>(records_.size()); }
private:
    std::vector<Record> records_;
};
int main() {
    Vault vault;
    vault.add(Record("rent", 800));
    vault.add(Record("food", 120));
    std::cout << vault.newest().name() << ": " << vault.newest().amount() << "\n";
    if (vault.undo()) {
        std::cout << "Undone\n";
    }
    std::cout << "Records: " << vault.size() << "\n";
    return 0;
}`,
      blanks: [
        { id: 'mv', answers: ['std::move'], hint: 'hand the by-value parameter over instead of copying it' },
        { id: 'peek', answers: ['back'], hint: 'the newest element, without removing it' },
        { id: 'guard', answers: ['empty'], hint: 'the check that makes pop_back safe' },
        { id: 'drop', answers: ['pop_back'], hint: 'remove the newest element' },
      ],
      explanation: 'add moves its parameter in; newest() peeks with back(); undo guards with empty() and removes with pop_back(). newest() is only safe because main calls it when two records exist: a real program would guard it the way undo does.',
    },
    {
      kind: 'modify',
      prompt: '`undo()` is a stub that always returns false. Implement it: when the vault is empty return false; otherwise remove the most recently added record and return true. The program should then print `Undone` twice, `Nothing to undo` once, and `Records: 0`.',
      language: 'cpp',
      starter: cpp`
#include <iostream>
#include <string>
#include <utility>
#include <vector>

${''}` + RECORD + cpp`

class Vault {
public:
    void add(Record record) { records_.push_back(std::move(record)); }
    bool undo() {
        // TODO: remove the most recently added record and report whether one was removed
        return false;
    }
    int size() const { return static_cast<int>(records_.size()); }
private:
    std::vector<Record> records_;
};

void report(bool undone) {
    if (undone) {
        std::cout << "Undone\n";
    } else {
        std::cout << "Nothing to undo\n";
    }
}

int main() {
    Vault vault;
    vault.add(Record("rent", 800));
    vault.add(Record("food", 120));
    report(vault.undo());
    report(vault.undo());
    report(vault.undo());
    std::cout << "Records: " << vault.size() << "\n";
    return 0;
}
`,
      tests: [{ description: 'Two undos succeed, the third finds nothing', expectedStdout: 'Undone\nUndone\nNothing to undo\nRecords: 0' }],
      hint: 'Check `records_.empty()` first. Then `records_.pop_back();` and `return true;` on separate lines: pop_back returns nothing.',
      solution: cpp`
#include <iostream>
#include <string>
#include <utility>
#include <vector>

${''}` + RECORD + cpp`

class Vault {
public:
    void add(Record record) { records_.push_back(std::move(record)); }
    bool undo() {
        if (records_.empty()) {
            return false;
        }
        records_.pop_back();
        return true;
    }
    int size() const { return static_cast<int>(records_.size()); }
private:
    std::vector<Record> records_;
};

void report(bool undone) {
    if (undone) {
        std::cout << "Undone\n";
    } else {
        std::cout << "Nothing to undo\n";
    }
}

int main() {
    Vault vault;
    vault.add(Record("rent", 800));
    vault.add(Record("food", 120));
    report(vault.undo());
    report(vault.undo());
    report(vault.undo());
    std::cout << "Records: " << vault.size() << "\n";
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write `Record` and a `Vault` with `add(Record record)` (moved into the vector), `std::optional<Record> last() const` (the newest record, or `std::nullopt` when empty), `bool undo()`, and `size()`. In `main`: print `Count?` and read it; read that many records (`Name?` word, `Amount?` int). Print `Last: <name>: <amount>` or `Last: none`. Call `undo()` once and print `Undone` or `Nothing to undo`. Print `Records: <n>`.',
      language: 'cpp',
      tests: [
        { description: 'Two records: last is the newest, undo removes it', stdin: '2\nrent\n800\nfood\n120', expectedStdout: 'Count?\nName?\nAmount?\nName?\nAmount?\nLast: food: 120\nUndone\nRecords: 1' },
        { description: 'No records: nothing to show or undo', stdin: '0', expectedStdout: 'Count?\nLast: none\nNothing to undo\nRecords: 0' },
        { description: 'One record: undo empties the vault', stdin: '1\nbus\n40', expectedStdout: 'Count?\nName?\nAmount?\nLast: bus: 40\nUndone\nRecords: 0' },
      ],
      hint: 'last() and undo() start with the same guard: `if (records_.empty())`. last() returns `records_.back()` (copied into the optional); undo() calls pop_back.',
      solution: cpp`
#include <iostream>
#include <optional>
#include <string>
#include <utility>
#include <vector>

${''}` + RECORD + cpp`

class Vault {
public:
    void add(Record record) { records_.push_back(std::move(record)); }
    std::optional<Record> last() const {
        if (records_.empty()) {
            return std::nullopt;
        }
        return records_.back();
    }
    bool undo() {
        if (records_.empty()) {
            return false;
        }
        records_.pop_back();
        return true;
    }
    int size() const { return static_cast<int>(records_.size()); }
private:
    std::vector<Record> records_;
};

int main() {
    Vault vault;
    std::cout << "Count?\n";
    int count;
    std::cin >> count;
    for (int i = 0; i < count; i++) {
        std::cout << "Name?\n";
        std::string name;
        std::cin >> name;
        std::cout << "Amount?\n";
        int amount;
        std::cin >> amount;
        vault.add(Record(name, amount));
    }
    std::optional<Record> last = vault.last();
    if (last) {
        std::cout << "Last: " << last->name() << ": " << last->amount() << "\n";
    } else {
        std::cout << "Last: none\n";
    }
    if (vault.undo()) {
        std::cout << "Undone\n";
    } else {
        std::cout << "Nothing to undo\n";
    }
    std::cout << "Records: " << vault.size() << "\n";
    return 0;
}
`,
      projectNote: 'Vault++ v0.4: the Vault can undo its most recent add and says whether it did. Only the command loop is missing.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 4-5 Project: Vault++ v0.4                                          */
/* ------------------------------------------------------------------ */

const l45: Lesson = {
  id: 'cpp-4-5',
  title: 'Project: Vault++ v0.4',
  objective: 'Add undo to Vault++ and hold the Vault through a std::unique_ptr, with no owning raw pointer anywhere.',
  minutes: 24,
  lexicon: [
    { id: 'cpp.4.owner-in-main', term: 'std::unique_ptr<T> x = std::make_unique<T>(); x->f();', kind: 'pattern', meaning: 'Own the program\'s central object through one unique_ptr in main and reach it with ->. The object is created once, released at the end of main on every path out, and can later be handed to another owner with std::move.', example: 'std::unique_ptr<Vault> vault = std::make_unique<Vault>();\nvault->add(Record("rent", 800));\nvault->list();' },
    { id: 'cpp.4.history', term: 'history', kind: 'concept', meaning: 'The sequence of past actions, kept so they can be reversed. When each action is one push onto a vector, undo is one pop, and the vector\'s own order is the history. More general undo stores what each action changed.', example: 'records_.push_back(std::move(record));   // the action\nrecords_.pop_back();                      // its undo' },
    { id: 'cpp.4.bool-mutator', term: 'bool mutator, caller reports', kind: 'pattern', meaning: 'A member function that may or may not be able to act returns bool and prints nothing. The caller chooses the words. The class stays reusable in a program with different messages, or none.', example: 'if (vault->undo()) {\n    std::cout << "Undone\\n";\n} else {\n    std::cout << "Nothing to undo\\n";\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Vault++ v0.4, whole',
      body: `v0.4 behaves like v0.3 with one new command, and changes who owns what. \`Record\` is untouched: a rule-of-zero class. \`Vault\` gains \`undo()\` from lesson 4, and its \`add\` takes the Record by value and moves it in. The records vector doubles as the history: the newest record is at the back, so undo is a guarded \`pop_back\`.

In \`main\`, the Vault is no longer a local object but is **owned** through \`std::unique_ptr<Vault>\`, created with \`std::make_unique\`. Every call becomes \`vault->\`, and the Vault is released at the end of main by the unique_ptr's destructor, on every path out, with no \`delete\`. Nothing visible changes; the ownership is now written down.

Command \`5\` calls \`undo()\` and prints \`Undone\` or \`Nothing to undo\`. The Vault returns the bool; main chooses the words. Read the whole program with its labels before building it.`,
      example: {
        language: 'cpp',
        source: VAULT_V04.trimEnd(),
        labels: [
          { lines: [1, 7], label: 'memory for unique_ptr, utility for std::move, the rest as in v0.3.' },
          { lines: [9, 17], label: 'Record, unchanged: constructor, two const accessors, private data. Rule of zero.' },
          { lines: [21, 21], label: 'add takes a Record by value and moves it to the back: the newest record is always last.' },
          { lines: [22, 28], label: 'undo: nothing to pop means false; otherwise drop the newest record and say true.' },
          { lines: [29, 52], label: 'total, find and list exactly as in v0.3.' },
          { lines: [58, 58], label: 'main owns the Vault through a unique_ptr; it is released at the closing brace of main.' },
          { lines: [63, 73], label: 'Commands 1 and 2 as before, now through ->.' },
          { lines: [74, 83], label: 'Command 4: find, then the optional decides.' },
          { lines: [84, 89], label: 'Command 5: the Vault reports with a bool, main prints the words.' },
          { lines: [90, 95], label: 'Command 3 leaves the loop; everything else is unknown.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'The C Vault ended with `vault_free(&v)` and still leaked if a `return` came early. Here the unique_ptr releases the Vault, the vector releases the Records, and each string releases its characters, all at closing braces you never wrote cleanup for. Search the program: there is no `new`, no `delete`, no `free`.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The user types the commands `1 rent 800`, `1 food 120`, `5`, `5`, `5`, `2`, `3`. Ignoring the prompt lines, what does the program print?',
      code: {
        language: 'cpp',
        source: cpp`
// Vault++ v0.4 as shown in the concept step; input:
// 1
// rent
// 800
// 1
// food
// 120
// 5
// 5
// 5
// 2
// 3`,
      },
      choices: [
        'Added\nAdded\nUndone\nUndone\nNothing to undo\nRecords: 0\nTotal: 0\nBye',
        'Added\nAdded\nUndone\nUndone\nUndone\nRecords: 0\nTotal: 0\nBye',
        'Added\nAdded\nUndone\nNothing to undo\nNothing to undo\nrent: 800\nRecords: 1\nTotal: 800\nBye',
        'Added\nAdded\nUndone\nUndone\nNothing to undo\nfood: 120\nrent: 800\nRecords: 2\nTotal: 920\nBye',
      ],
      answer: 'Added\nAdded\nUndone\nUndone\nNothing to undo\nRecords: 0\nTotal: 0\nBye',
      explanation: 'The first undo removes food (the newest), the second removes rent, and the third finds an empty vault and prints Nothing to undo. Listing an empty vault prints no records, then Records: 0 and Total: 0. Undo removes records for good: the fourth option would need a redo, which v0.4 does not have.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the start of `main` and the command 5 branch: own the Vault through a `std::unique_ptr`, and print `Undone` or `Nothing to undo` depending on what `undo()` returns.',
      language: 'cpp',
      indentation: true,
      solution: [
        'int main() {',
        '    std::unique_ptr<Vault> vault = std::make_unique<Vault>();',
        '    while (true) {',
        '        std::cout << "Command?\\n";',
        '        int command;',
        '        std::cin >> command;',
        '        if (command == 5) {',
        '            if (vault->undo()) {',
        '                std::cout << "Undone\\n";',
        '            } else {',
        '                std::cout << "Nothing to undo\\n";',
        '            }',
        '        } else if (command == 3) {',
        '            std::cout << "Bye\\n";',
        '            break;',
        '        }',
        '    }',
        '    return 0;',
        '}',
      ],
      distractors: [
        '    Vault *vault = new Vault();',
        '            if (vault.undo()) {',
        '    delete vault;',
      ],
      explanation: 'make_unique creates and owns in one step; a raw `new` would need a matching `delete` on every path out of main, and there is none because the unique_ptr\'s destructor does it. Through a pointer, smart or raw, members are reached with ->, not the dot.',
    },
    {
      kind: 'modify',
      prompt: 'This is Vault++ v0.4 without undo: `main` already owns the Vault through a `std::unique_ptr`, but command 5 falls through to `Unknown command`. Add `bool undo()` to `Vault` (false when empty, otherwise remove the newest record) and a command 5 branch that prints `Undone` or `Nothing to undo`.',
      language: 'cpp',
      starter: VAULT_V04
        .replace('    bool undo() {\n        if (records_.empty()) {\n            return false;\n        }\n        records_.pop_back();\n        return true;\n    }\n', '')
        .replace('        } else if (command == 5) {\n            if (vault->undo()) {\n                std::cout << "Undone\\n";\n            } else {\n                std::cout << "Nothing to undo\\n";\n            }\n', ''),
      tests: [
        { description: 'Undo removes the newest record', stdin: '1\nrent\n800\n1\nfood\n120\n5\n2\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nUndone\nCommand?\nrent: 800\nRecords: 1\nTotal: 800\nCommand?\nBye' },
        { description: 'Undo on an empty vault', stdin: '5\n3', expectedStdout: 'Command?\nNothing to undo\nCommand?\nBye' },
      ],
      hint: 'undo() is the function from lesson 4, word for word. The command 5 branch goes before the `command == 3` branch and calls it through the arrow: `vault->undo()`.',
      solution: VAULT_V04,
    },
    {
      kind: 'create',
      prompt: 'Write Vault++ v0.4 from scratch: `class Record` (constructor, const accessors); `class Vault` (private `std::vector<Record>`; `add(Record)` moving into the vector, `undo()` returning bool, `total`, `find` returning `std::optional<Record>`, `list`). In `main`, own the Vault through `std::unique_ptr<Vault>`. Command loop: `Command?` then 1 = `Name?` word, `Amount?` int, `Added`; 2 = records sorted by name as `<name>: <amount>`, then `Records: <n>`, then `Total: <t>`; 4 = `Name?` word then `<name>: <amount>` or `Not found`; 5 = `Undone` or `Nothing to undo`; 3 = `Bye` and stop; anything else `Unknown command`.',
      language: 'cpp',
      tests: [
        { description: 'Add two, undo one, list', stdin: '1\nrent\n800\n1\nfood\n120\n5\n2\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nUndone\nCommand?\nrent: 800\nRecords: 1\nTotal: 800\nCommand?\nBye' },
        { description: 'Undo on an empty vault', stdin: '5\n3', expectedStdout: 'Command?\nNothing to undo\nCommand?\nBye' },
        { description: 'Undo past empty, then find the removed record', stdin: '1\nbus\n40\n5\n5\n4\nbus\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nUndone\nCommand?\nNothing to undo\nCommand?\nName?\nNot found\nCommand?\nBye' },
        { description: 'Unknown command between adds and undo, list sorted', stdin: '1\ncar\n300\n1\nbus\n40\n9\n5\n1\nbus\n40\n2\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nUnknown command\nCommand?\nUndone\nCommand?\nName?\nAmount?\nAdded\nCommand?\nbus: 40\ncar: 300\nRecords: 2\nTotal: 340\nCommand?\nBye' },
      ],
      hint: 'Start from v0.3. Change add to take a Record by value and std::move it in; add undo(); replace `Vault vault;` with the make_unique line and every `vault.` with `vault->`; then add the command 5 branch.',
      solution: VAULT_V04,
      projectNote: 'Vault++ v0.4: undo through the records history, the Vault owned by a std::unique_ptr in main, and no raw owning pointer anywhere in the program.',
    },
  ],
};

export const m4: Module = {
  id: 'cpp-m4',
  title: 'Ownership',
  goal: 'RAII, destructors, copy vs move, unique_ptr and shared_ptr, why new/delete are rare.',
  projectMilestone: 'Vault++ v0.4: no raw owning pointers anywhere.',
  status: 'available',
  lessons: [l41, l42, l43, l44, l45],
};
