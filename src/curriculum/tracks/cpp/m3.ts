import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 3: Classes                                                  */
/* ------------------------------------------------------------------ */

/** Vault++ v0.3, exactly as tested in cpp-3-5 and shown labelled in its concept step. */
const VAULT_V03 = `#include <algorithm>
#include <iostream>
#include <optional>
#include <string>
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
    void add(const Record &record) { records_.push_back(record); }
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
            std::cout << r.name() << ": " << r.amount() << "\\n";
        }
        std::cout << "Records: " << sorted.size() << "\\n";
        std::cout << "Total: " << total() << "\\n";
    }
private:
    std::vector<Record> records_;
};

int main() {
    Vault vault;
    while (true) {
        std::cout << "Command?\\n";
        int command;
        std::cin >> command;
        if (command == 1) {
            std::cout << "Name?\\n";
            std::string name;
            std::cin >> name;
            std::cout << "Amount?\\n";
            int amount;
            std::cin >> amount;
            vault.add(Record(name, amount));
            std::cout << "Added\\n";
        } else if (command == 2) {
            vault.list();
        } else if (command == 4) {
            std::cout << "Name?\\n";
            std::string name;
            std::cin >> name;
            std::optional<Record> found = vault.find(name);
            if (found) {
                std::cout << found->name() << ": " << found->amount() << "\\n";
            } else {
                std::cout << "Not found\\n";
            }
        } else if (command == 3) {
            std::cout << "Bye\\n";
            break;
        } else {
            std::cout << "Unknown command\\n";
        }
    }
    return 0;
}
`;

/* ------------------------------------------------------------------ */

const l31: Lesson = {
  id: 'cpp-3-1',
  title: 'A struct with rules attached',
  objective: 'Define a class with private members and a constructor that fills them.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.3.class', term: 'class Name { ... };', kind: 'pattern', meaning: 'Define a new type: data members plus the functions allowed to touch them. Same as struct, except members are private unless you say otherwise. The closing brace needs a semicolon.', example: 'class Record {\npublic:\n    int amount() const { return amount_; }\nprivate:\n    int amount_;\n};', analogy: 'A C struct with a lock on the lid and a few labelled buttons on top. The analogy breaks because the lock is checked by the compiler, not at run time: nothing can pick it while the program runs.' },
    { id: 'cpp.3.access', term: 'public: / private:', kind: 'keyword', meaning: 'Access labels. Everything after public: can be used from anywhere; everything after private: only from inside the class\'s own member functions. A label lasts until the next label.', example: 'class Counter {\npublic:\n    void bump();\nprivate:\n    int count_;\n};' },
    { id: 'cpp.3.ctor', term: 'Name(args) : member(arg) { }', kind: 'pattern', meaning: 'A constructor: a function with the class\'s name and no return type, run once when an object is created. The part after the colon is the member-initialiser list: it builds each member directly from its argument, in the order the members are declared.', example: 'Record(const std::string &name, int amount)\n    : name_(name), amount_(amount) {}', analogy: 'Python\'s __init__ with self.x = x inside. It breaks because C++ members are initialised before the body runs, so the list is the real place to set them; assignments in the body happen second.' },
    { id: 'cpp.3.explicit', term: 'explicit', kind: 'keyword', meaning: 'Placed before a constructor that takes one argument so the compiler will not silently use it to convert that argument into an object. Default to writing it.', example: 'explicit Counter(int start) : count_(start) {}\nCounter c(5);      // fine\n// Counter d = 5;  // refused because of explicit' },
    { id: 'cpp.3.object', term: 'object', kind: 'concept', meaning: 'A struct in memory plus the member functions that may operate on it. Calling obj.f() passes the address of obj to f as a hidden parameter named this. No new machinery: the C machine with a convention enforced.', example: 'Record rent("rent", 800);\nrent.print();   // print(&rent) in C terms' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The struct and its functions move in together',
      body: `In the C track a record was a \`struct\` and the functions that worked on it lived outside, taking a pointer to it. C++ keeps exactly that machine and changes the grammar: the functions move **inside** the type and become **member functions**, and the pointer becomes a hidden parameter called \`this\`. An object is a struct plus the functions allowed to touch it. Nothing else is new in memory.

\`class\` and \`struct\` are the same thing in C++ with one difference: in a \`class\`, members are **private** by default. You open sections with \`public:\` and \`private:\`. Private members can be used only by the class's own member functions, and the compiler enforces it.

A **constructor** is a member function with the class's name and no return type. It runs once when the object is created. After the colon comes the **member-initialiser list**, which builds each member straight from its argument. Mark a one-argument constructor \`explicit\` so the compiler never uses it to convert a loose value into an object behind your back. The closing brace of a class takes a semicolon.`,
      example: {
        language: 'cpp',
        source: '#include <iostream>\n#include <string>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    void print() {\n        std::cout << name_ << ": " << amount_ << "\\n";\n    }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nint main() {\n    Record rent("rent", 800);\n    Record food("food", 120);\n    rent.print();\n    food.print();\n    return 0;\n}',
        labels: [
          { lines: [4, 5], label: 'A new type. From here, members are usable from anywhere.' },
          { lines: [6, 6], label: 'Constructor: fill both members from the arguments, in declaration order.' },
          { lines: [7, 9], label: 'A member function. It reads the members of whichever Record it was called on.' },
          { lines: [10, 12], label: 'The data, reachable only from inside the class. The trailing underscore marks a member.' },
          { lines: [13, 13], label: 'A class ends with }; (the semicolon is required).' },
          { lines: [16, 17], label: 'Two objects: the constructor runs once for each.' },
          { lines: [18, 19], label: 'Call a member function on an object: rent is passed as this.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'In C you wrote `struct Record` and a separate `void record_print(const struct Record *r)` that used `r->name`. In C++ the function lives inside the type, `r` becomes the hidden `this`, and `r->name` shrinks to `name_`. A C++ `struct` is still legal and still means the same thing, with members public by default.' },
        { from: 'python', note: 'Python\'s `class Account:` with `def __init__(self, owner): self.owner = owner` is the same idea. Differences: C++ members are declared with types up front, not created by assignment; `private:` is enforced by the compiler where Python relies on a leading underscore; and `this` is implicit where `self` is written out.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What happens when this program is compiled and run?',
      code: { language: 'cpp', source: '#include <iostream>\n#include <string>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nint main() {\n    Record rent("rent", 800);\n    std::cout << rent.amount_ << "\\n";\n    return 0;\n}' },
      choices: ['800', 'a compiler error: amount_ is private', 'rent: 800', 'it compiles but prints 0'],
      answer: 'a compiler error: amount_ is private',
      explanation: 'amount_ is declared after `private:`, so only Record\'s own member functions may name it. main is not one of them, and the compiler refuses the line. To read the value from outside, the class must offer a public member function such as `int amount()`, which is next lesson\'s subject.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a `Counter` class with an explicit constructor and a `bump` member function, then a `main` that prints `Count: 6`.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        'class Counter {',
        'public:',
        '    explicit Counter(int start) : count_(start) {}',
        '    void bump() { count_ = count_ + 1; }',
        '    void print() { std::cout << "Count: " << count_ << "\\n"; }',
        'private:',
        '    int count_;',
        '};',
        'int main() {',
        '    Counter c(5);',
        '    c.bump();',
        '    c.print();',
        '    return 0;',
        '}',
      ],
      distractors: [
        '    void Counter(int start) : count_(start) {}',
        '    explicit Counter(int start) : count_(start);',
      ],
      explanation: 'A constructor has no return type, not even void: its name alone marks it. And unlike a C prototype, the initialiser list must be followed by a body, even an empty `{}`.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the class so it compiles and prints `Balance: 150`.',
      language: 'cpp',
      template: '#include <iostream>\nclass Account {\n{{pub}}:\n    {{kw}} Account(int balance) : balance_({{init}}) {}\n    void print() { std::cout << "Balance: " << balance_ << "\\n"; }\n{{priv}}:\n    int balance_;\n{{end}}\nint main() {\n    Account a(150);\n    a.print();\n    return 0;\n}',
      blanks: [
        { id: 'pub', answers: ['public'], hint: 'the section callers may use' },
        { id: 'kw', answers: ['explicit'], hint: 'stops `Account a = 150;` from compiling' },
        { id: 'init', answers: ['balance'], hint: 'the constructor parameter, not the member' },
        { id: 'priv', answers: ['private'], hint: 'the section only member functions may use' },
        { id: 'end', answers: ['};'], hint: 'a class ends with a brace and one more character' },
      ],
      explanation: 'Members are initialised from the parameters in the list after the colon; the body stays empty. A class definition ends with `};`.',
    },
    {
      kind: 'modify',
      prompt: 'Add an `int amount_` member to `Record`, set it in the constructor\'s initialiser list from a second parameter, and make `print` show `<name>: <amount>`.',
      language: 'cpp',
      starter: '#include <iostream>\n#include <string>\n\nclass Record {\npublic:\n    explicit Record(const std::string &name) : name_(name) {}\n    void print() {\n        std::cout << name_ << "\\n";\n    }\nprivate:\n    std::string name_;\n};\n\nint main() {\n    Record rent("rent");\n    Record food("food");\n    rent.print();\n    food.print();\n    return 0;\n}\n',
      tests: [{ description: 'Two records with amounts', expectedStdout: 'rent: 800\nfood: 120' }],
      hint: 'Declare the member under private:, add a parameter to the constructor, extend the initialiser list with `amount_(amount)`, then change the two calls in main to pass 800 and 120.',
      solution: '#include <iostream>\n#include <string>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    void print() {\n        std::cout << name_ << ": " << amount_ << "\\n";\n    }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nint main() {\n    Record rent("rent", 800);\n    Record food("food", 120);\n    rent.print();\n    food.print();\n    return 0;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Write a class `Account` with a private `int balance_`, an `explicit` constructor taking the starting balance, a `deposit(int amount)` member that adds to it, and a `print()` member that prints `Balance: <n>`. In `main`: print `Start?` and read an int; print `Deposit?` and read an int; construct the account, deposit, print.',
      language: 'cpp',
      tests: [
        { description: '100 then 50', stdin: '100\n50', expectedStdout: 'Start?\nDeposit?\nBalance: 150' },
        { description: 'Zero deposit', stdin: '20\n0', expectedStdout: 'Start?\nDeposit?\nBalance: 20' },
      ],
      hint: 'Read both ints before constructing: `Account account(start);` needs the value to exist.',
      solution: '#include <iostream>\n\nclass Account {\npublic:\n    explicit Account(int balance) : balance_(balance) {}\n    void deposit(int amount) {\n        balance_ = balance_ + amount;\n    }\n    void print() {\n        std::cout << "Balance: " << balance_ << "\\n";\n    }\nprivate:\n    int balance_;\n};\n\nint main() {\n    std::cout << "Start?\\n";\n    int start;\n    std::cin >> start;\n    std::cout << "Deposit?\\n";\n    int amount;\n    std::cin >> amount;\n    Account account(start);\n    account.deposit(amount);\n    account.print();\n    return 0;\n}\n',
      projectNote: 'Vault++ v0.3 begins: the record is no longer a bare struct but a type with a constructor and private data.',
    },
  ],
};

/* ------------------------------------------------------------------ */

const l32: Lesson = {
  id: 'cpp-3-2',
  title: 'Promises in the signature: const',
  objective: 'Write const accessors and non-const mutators, and read what `this` is.',
  minutes: 18,
  lexicon: [
    { id: 'cpp.3.const-method', term: 'int amount() const { ... }', kind: 'pattern', meaning: 'A member function that promises not to change the object. The const goes after the parameter list. Only const member functions may be called on a const object or through a const reference.', example: 'const std::string &name() const { return name_; }', analogy: 'A read-only button on the box. It breaks slightly because const is a promise the compiler checks against your code, not a lock on the memory.' },
    { id: 'cpp.3.this', term: 'this', kind: 'keyword', meaning: 'Inside a member function, a pointer to the object the function was called on. Writing a bare member name such as amount_ means this->amount_.', example: 'void add(int delta) { this->amount_ += delta; }  // same as amount_ += delta' },
    { id: 'cpp.3.accessor', term: 'accessor / mutator', kind: 'concept', meaning: 'An accessor (query) returns information and is marked const. A mutator (command) changes the object and is not. Name them so a reader can tell: amount() asks, add() acts.', example: 'int amount() const;   // accessor\nvoid add(int delta);  // mutator' },
    { id: 'cpp.3.const-object', term: 'const Record &r', kind: 'pattern', meaning: 'A reference through which the object may only be read. Passing objects this way avoids a copy and documents that the function will not change them; only const member functions compile through it.', example: 'void show(const Record &r) {\n    std::cout << r.name() << "\\n";   // name() must be const\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Say which functions only look',
      body: `Member functions come in two kinds. An **accessor** answers a question and leaves the object as it was: \`amount()\`. A **mutator** changes it: \`add(50)\`. In C++ you write the difference into the signature: an accessor gets \`const\` **after** its parameter list. The compiler then refuses to let that function assign to a member, and refuses to call any non-const function on an object you only have const access to.

That second rule is why it matters. The natural way to hand an object to a function is \`const Record &r\`: no copy, no permission to change. Through such a reference only const member functions compile. Forget the \`const\` on \`name()\` and every function that takes a \`const Record &\` stops compiling.

Inside a member function, a bare member name such as \`amount_\` is short for \`this->amount_\`. \`this\` is the hidden pointer parameter from the notional machine: the address of the object the function was called on. You rarely write it, but it explains how one function body serves every object.`,
      example: {
        language: 'cpp',
        source: '#include <iostream>\n#include <string>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    const std::string &name() const { return name_; }\n    int amount() const { return amount_; }\n    void add(int delta) { this->amount_ += delta; }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nvoid show(const Record &r) {\n    std::cout << r.name() << ": " << r.amount() << "\\n";\n}\n\nint main() {\n    Record rent("rent", 800);\n    show(rent);\n    rent.add(50);\n    show(rent);\n    return 0;\n}',
        labels: [
          { lines: [7, 8], label: 'Accessors: const after the parameter list. They may be called on any Record, const or not.' },
          { lines: [9, 9], label: 'A mutator: no const, because it changes a member. this-> is written out once to show what a bare name means.' },
          { lines: [15, 17], label: 'Borrow a Record read-only. Only the const accessors compile here.' },
          { lines: [20, 23], label: 'Show, change through the mutator, show again: 800 then 850.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'You already wrote `void record_print(const struct Record *r)`: the const on the pointer is the same promise. In C++ that pointer is `this`, so the promise moves to the end of the member function\'s signature. `r->amount` becomes `amount_`.' },
        { from: 'python', note: 'Python has no const. The query/command split was a naming convention (`@property balance` versus `add`). C++ makes it grammar: a const method cannot assign to a member, and a const reference cannot call a non-const method. Both mistakes are compile errors, not surprises later.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What happens when this program is compiled and run?',
      code: { language: 'cpp', source: '#include <iostream>\n\nclass Counter {\npublic:\n    explicit Counter(int start) : count_(start) {}\n    void bump() { count_ = count_ + 1; }\n    int value() const { return count_; }\nprivate:\n    int count_;\n};\n\nint main() {\n    const Counter c(5);\n    c.bump();\n    std::cout << c.value() << "\\n";\n    return 0;\n}' },
      choices: ['6', '5', 'a compiler error: bump() is not const but c is', 'it compiles but prints 0'],
      answer: 'a compiler error: bump() is not const but c is',
      explanation: 'c is declared const, so only const member functions may be called on it. value() is const and would be fine; bump() is not, and the compiler rejects line 14. Remove the const from c, or accept that a const counter cannot be bumped: that is the promise doing its job.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a `Counter` whose `value()` can be called through a const reference. The program prints `6`.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        'class Counter {',
        'public:',
        '    explicit Counter(int start) : count_(start) {}',
        '    void bump() { count_ = count_ + 1; }',
        '    int value() const { return count_; }',
        'private:',
        '    int count_;',
        '};',
        'int main() {',
        '    Counter c(5);',
        '    c.bump();',
        '    const Counter &view = c;',
        '    std::cout << view.value() << "\\n";',
        '    return 0;',
        '}',
      ],
      distractors: [
        '    int value() { return count_; }',
        '    void bump() const { count_ = count_ + 1; }',
      ],
      explanation: 'value() must be const, or `view.value()` is refused: view is a const reference. bump() must not be const, or its own assignment to count_ is refused. The const belongs exactly on the functions that only look.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it compiles and prints `rent: 850`.',
      language: 'cpp',
      template: '#include <iostream>\n#include <string>\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    const std::string &name() {{c1}} { return name_; }\n    int amount() {{c2}} { return amount_; }\n    void add(int delta) { {{self}}->amount_ += delta; }\nprivate:\n    std::string name_;\n    int amount_;\n};\nvoid show({{ref}} Record &r) {\n    std::cout << r.name() << ": " << r.amount() << "\\n";\n}\nint main() {\n    Record rent("rent", 800);\n    rent.add(50);\n    show(rent);\n    return 0;\n}',
      blanks: [
        { id: 'c1', answers: ['const'], hint: 'name() only looks' },
        { id: 'c2', answers: ['const'], hint: 'amount() only looks' },
        { id: 'self', answers: ['this'], hint: 'the hidden pointer to the object' },
        { id: 'ref', answers: ['const'], hint: 'show() borrows the record read-only' },
      ],
      explanation: 'The two accessors are const; the mutator is not; show() takes a const reference and therefore may call only the const accessors.',
    },
    {
      kind: 'modify',
      prompt: 'This program does not compile: `show` borrows a `const Record &` but the accessors are not const. Mark `name()` and `amount()` const. Then add a mutator `withdraw(int amount)` that subtracts from the amount, and call `withdraw(300)` on rent before the second `show`.',
      language: 'cpp',
      starter: '#include <iostream>\n#include <string>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    const std::string &name() { return name_; }\n    int amount() { return amount_; }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nvoid show(const Record &r) {\n    std::cout << r.name() << ": " << r.amount() << "\\n";\n}\n\nint main() {\n    Record rent("rent", 800);\n    show(rent);\n    show(rent);\n    return 0;\n}\n',
      tests: [{ description: 'Before and after withdrawing 300', expectedStdout: 'rent: 800\nrent: 500' }],
      hint: 'const goes between the closing parenthesis and the opening brace. withdraw changes a member, so it must not be const.',
      solution: '#include <iostream>\n#include <string>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    const std::string &name() const { return name_; }\n    int amount() const { return amount_; }\n    void withdraw(int amount) { amount_ -= amount; }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nvoid show(const Record &r) {\n    std::cout << r.name() << ": " << r.amount() << "\\n";\n}\n\nint main() {\n    Record rent("rent", 800);\n    show(rent);\n    rent.withdraw(300);\n    show(rent);\n    return 0;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Write `class Record` with const accessors `name()` and `amount()` and a mutator `add(int delta)`. In `main`: print `Name?` and read a word; print `Amount?` and read an int; print `Extra?` and read an int. Build the record, add the extra, then print `<name>: <amount>` from a function `void show(const Record &r)`.',
      language: 'cpp',
      tests: [
        { description: 'rent 800 plus 50', stdin: 'rent\n800\n50', expectedStdout: 'Name?\nAmount?\nExtra?\nrent: 850' },
        { description: 'Negative extra', stdin: 'food\n120\n-20', expectedStdout: 'Name?\nAmount?\nExtra?\nfood: 100' },
      ],
      hint: 'show() takes a const reference, so both accessors must be const or it will not compile.',
      solution: '#include <iostream>\n#include <string>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    const std::string &name() const { return name_; }\n    int amount() const { return amount_; }\n    void add(int delta) { amount_ += delta; }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nvoid show(const Record &r) {\n    std::cout << r.name() << ": " << r.amount() << "\\n";\n}\n\nint main() {\n    std::cout << "Name?\\n";\n    std::string name;\n    std::cin >> name;\n    std::cout << "Amount?\\n";\n    int amount;\n    std::cin >> amount;\n    std::cout << "Extra?\\n";\n    int extra;\n    std::cin >> extra;\n    Record record(name, amount);\n    record.add(extra);\n    show(record);\n    return 0;\n}\n',
      projectNote: 'Vault++ v0.3: Record now has the const accessors that the Vault class and the printing code will rely on.',
    },
  ],
};

/* ------------------------------------------------------------------ */

const l33: Lesson = {
  id: 'cpp-3-3',
  title: 'Guarding the invariant',
  objective: 'Keep an object\'s data valid through its methods, and return "maybe a value" with std::optional.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.3.invariant', term: 'invariant', kind: 'concept', meaning: 'A fact about an object\'s data that must hold between method calls, such as "balance is never negative". Private data plus checks in every mutator is how a class keeps it true.', example: 'bool withdraw(int amount) {\n    if (amount > balance_) {\n        return false;   // refuse, invariant kept\n    }\n    balance_ -= amount;\n    return true;\n}', analogy: 'A bank clerk who refuses a withdrawal that would overdraw. It breaks because the clerk can be bribed; a private member cannot be reached at all from outside.' },
    { id: 'cpp.3.optional', term: 'std::optional<T>', kind: 'builtin', meaning: 'A value of type T that may be absent. From <optional>. Test it with has_value() or by using it as a condition; read the value with * or ->.', example: 'std::optional<Record> hit = vault.find("rent");\nif (hit) {\n    std::cout << hit->amount() << "\\n";\n}' },
    { id: 'cpp.3.nullopt', term: 'std::nullopt', kind: 'builtin', meaning: 'The "no value" an optional-returning function returns when there is nothing to give back.', example: 'return std::nullopt;' },
    { id: 'cpp.3.const-ptr', term: 'const T *', kind: 'pattern', meaning: 'The older way to say "maybe a value": a pointer to an existing object, or nullptr. It gives access without copying but is only valid while the object it points at lives.', example: 'const Record *hit = vault.findPtr("rent");\nif (hit != nullptr) {\n    std::cout << hit->amount() << "\\n";\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Private data lets a class keep promises',
      body: `Making data private is not politeness. It means every change goes through a member function, and a member function can **check** before it changes. A fact that the class keeps true between calls is an **invariant**: a balance that is never negative, a vault whose records all have a name. Validate in the mutator and report with a \`bool\` whether the change was made.

A class can own a whole container. \`Vault\` below holds a \`std::vector<Record>\`; nothing outside can push into it except through \`add\`, which is where a check would go.

A lookup may find nothing. In C you returned a pointer or \`NULL\`; that still works in C++ as \`const Record *\`, valid as long as the vault lives. The clearer modern answer is \`std::optional<Record>\`: a value that may be absent. Test it as a condition, read it with \`->\` or \`*\`, return \`std::nullopt\` for "nothing". Vault++ uses optional.`,
      example: {
        language: 'cpp',
        source: '#include <iostream>\n#include <optional>\n#include <string>\n#include <vector>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    const std::string &name() const { return name_; }\n    int amount() const { return amount_; }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nclass Vault {\npublic:\n    bool add(const Record &record) {\n        if (record.amount() <= 0) {\n            return false;\n        }\n        records_.push_back(record);\n        return true;\n    }\n    std::optional<Record> find(const std::string &name) const {\n        for (const Record &r : records_) {\n            if (r.name() == name) {\n                return r;\n            }\n        }\n        return std::nullopt;\n    }\nprivate:\n    std::vector<Record> records_;\n};\n\nint main() {\n    Vault vault;\n    vault.add(Record("rent", 800));\n    std::cout << vault.add(Record("bad", 0)) << "\\n";\n    std::optional<Record> hit = vault.find("rent");\n    if (hit) {\n        std::cout << hit->name() << ": " << hit->amount() << "\\n";\n    }\n    if (!vault.find("car")) {\n        std::cout << "Not found\\n";\n    }\n    return 0;\n}',
        labels: [
          { lines: [16, 17], label: 'Vault owns the records; the vector itself is private.' },
          { lines: [18, 24], label: 'The only way in. The invariant "every amount is positive" is checked here and reported with a bool.' },
          { lines: [25, 32], label: 'Search; return a copy of the match, or nullopt for nothing. const: searching changes nothing.' },
          { lines: [39, 40], label: 'A good add, then a refused one: prints 0 (bool prints as 1 or 0).' },
          { lines: [41, 44], label: 'An optional is true when it holds a value; -> reaches the Record inside.' },
          { lines: [45, 47], label: 'Nothing found: the optional is false.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'The C Vault was `struct Vault { struct Record *records; int count; }` with every field open: any code could set `count` wrong. Here the vector is private and `add` is the gate. `find` returning `struct Record *` or `NULL` is still available as `const Record *`; `std::optional` says "maybe" without handing out an address.' },
        { from: 'python', note: 'Returning `None` for "not found" becomes `std::nullopt`, and the caller must check before using, exactly as with None. Unlike Python, `records_` is not reachable as `vault.records_` from outside: the invariant cannot be bypassed.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The vault holds one record, `rent` for 800. What does the fragment print?',
      code: { language: 'cpp', source: 'std::optional<Record> hit = vault.find("rent");\nstd::optional<Record> miss = vault.find("car");\nstd::cout << hit.has_value() << " " << miss.has_value() << "\\n";\nif (hit) {\n    std::cout << hit->amount() << "\\n";\n}' },
      choices: ['1 0\n800', 'true false\n800', '1 0\n0', 'a compiler error: miss has no value'],
      answer: '1 0\n800',
      explanation: 'has_value() is a bool and std::cout prints bools as 1 and 0. hit holds the rent record, so the if body runs and -> reaches amount(). An empty optional is perfectly legal to hold and test; only reading its value would be a mistake.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble an `Account` whose `withdraw` refuses to overdraw. The program prints `1`, `0`, then `Balance: 50`.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        'class Account {',
        'public:',
        '    explicit Account(int balance) : balance_(balance) {}',
        '    bool withdraw(int amount) {',
        '        if (amount > balance_) {',
        '            return false;',
        '        }',
        '        balance_ -= amount;',
        '        return true;',
        '    }',
        '    int balance() const { return balance_; }',
        'private:',
        '    int balance_;',
        '};',
        'int main() {',
        '    Account a(100);',
        '    std::cout << a.withdraw(50) << "\\n";',
        '    std::cout << a.withdraw(500) << "\\n";',
        '    std::cout << "Balance: " << a.balance() << "\\n";',
        '    return 0;',
        '}',
      ],
      distractors: [
        '    bool withdraw(int amount) const {',
        '        if (amount < balance_) {',
      ],
      explanation: 'withdraw changes balance_, so it cannot be const. The check refuses amounts greater than the balance; `amount < balance_` would refuse exactly the withdrawals that fit and allow the overdraw.',
    },
    {
      kind: 'modify',
      prompt: 'Enforce the invariant "every record\'s amount is positive": make `Vault::add` return `bool`, store nothing and return false when the amount is 0 or less. The program should then report two records and fail to find `bad`.',
      language: 'cpp',
      starter: '#include <iostream>\n#include <optional>\n#include <string>\n#include <vector>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    const std::string &name() const { return name_; }\n    int amount() const { return amount_; }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nclass Vault {\npublic:\n    void add(const Record &record) {\n        records_.push_back(record);\n    }\n    std::optional<Record> find(const std::string &name) const {\n        for (const Record &r : records_) {\n            if (r.name() == name) {\n                return r;\n            }\n        }\n        return std::nullopt;\n    }\n    int size() const { return static_cast<int>(records_.size()); }\nprivate:\n    std::vector<Record> records_;\n};\n\nint main() {\n    Vault vault;\n    vault.add(Record("rent", 800));\n    vault.add(Record("bad", -5));\n    vault.add(Record("food", 120));\n    std::cout << "Records: " << vault.size() << "\\n";\n    std::optional<Record> hit = vault.find("bad");\n    if (hit) {\n        std::cout << hit->name() << ": " << hit->amount() << "\\n";\n    } else {\n        std::cout << "Not found\\n";\n    }\n    return 0;\n}\n',
      tests: [{ description: 'Negative amount refused', expectedStdout: 'Records: 2\nNot found' }],
      hint: 'Change the return type to bool, check `record.amount() <= 0` first, and return true after the push_back.',
      solution: '#include <iostream>\n#include <optional>\n#include <string>\n#include <vector>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    const std::string &name() const { return name_; }\n    int amount() const { return amount_; }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nclass Vault {\npublic:\n    bool add(const Record &record) {\n        if (record.amount() <= 0) {\n            return false;\n        }\n        records_.push_back(record);\n        return true;\n    }\n    std::optional<Record> find(const std::string &name) const {\n        for (const Record &r : records_) {\n            if (r.name() == name) {\n                return r;\n            }\n        }\n        return std::nullopt;\n    }\n    int size() const { return static_cast<int>(records_.size()); }\nprivate:\n    std::vector<Record> records_;\n};\n\nint main() {\n    Vault vault;\n    vault.add(Record("rent", 800));\n    vault.add(Record("bad", -5));\n    vault.add(Record("food", 120));\n    std::cout << "Records: " << vault.size() << "\\n";\n    std::optional<Record> hit = vault.find("bad");\n    if (hit) {\n        std::cout << hit->name() << ": " << hit->amount() << "\\n";\n    } else {\n        std::cout << "Not found\\n";\n    }\n    return 0;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Write `Record` (const accessors) and `Vault` owning a private `std::vector<Record>` with `add`, `size()` and `find` returning `std::optional<Record>`. In `main`, read two records (`Name?` word, `Amount?` int, twice), then print `Find?` and read a word. Print `<name>: <amount>` or `Not found`, then `Records: <n>`.',
      language: 'cpp',
      tests: [
        { description: 'Second record found', stdin: 'rent\n800\nfood\n120\nfood', expectedStdout: 'Name?\nAmount?\nName?\nAmount?\nFind?\nfood: 120\nRecords: 2' },
        { description: 'Missing name', stdin: 'rent\n800\nfood\n120\ncar', expectedStdout: 'Name?\nAmount?\nName?\nAmount?\nFind?\nNot found\nRecords: 2' },
      ],
      hint: 'A for loop over the two records keeps main short: read, construct, add. find() returns std::nullopt when the loop finishes without a match.',
      solution: '#include <iostream>\n#include <optional>\n#include <string>\n#include <vector>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    const std::string &name() const { return name_; }\n    int amount() const { return amount_; }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nclass Vault {\npublic:\n    void add(const Record &record) { records_.push_back(record); }\n    int size() const { return static_cast<int>(records_.size()); }\n    std::optional<Record> find(const std::string &name) const {\n        for (const Record &r : records_) {\n            if (r.name() == name) {\n                return r;\n            }\n        }\n        return std::nullopt;\n    }\nprivate:\n    std::vector<Record> records_;\n};\n\nint main() {\n    Vault vault;\n    for (int i = 0; i < 2; i++) {\n        std::cout << "Name?\\n";\n        std::string name;\n        std::cin >> name;\n        std::cout << "Amount?\\n";\n        int amount;\n        std::cin >> amount;\n        vault.add(Record(name, amount));\n    }\n    std::cout << "Find?\\n";\n    std::string wanted;\n    std::cin >> wanted;\n    std::optional<Record> hit = vault.find(wanted);\n    if (hit) {\n        std::cout << hit->name() << ": " << hit->amount() << "\\n";\n    } else {\n        std::cout << "Not found\\n";\n    }\n    std::cout << "Records: " << vault.size() << "\\n";\n    return 0;\n}\n',
      projectNote: 'Vault++ v0.3: the Vault class exists, owns its records, and can find one by name.',
    },
  ],
};

/* ------------------------------------------------------------------ */

const l34: Lesson = {
  id: 'cpp-3-4',
  title: 'Teaching the operators new nouns',
  objective: 'Overload <<, < and == for a class so printing, sorting and comparing read naturally.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.3.operator-out', term: 'std::ostream &operator<<(std::ostream &out, const T &x)', kind: 'pattern', meaning: 'Teach std::cout how to print a T. A free function that writes the parts to out and returns out, so the next << in the chain has a stream to write to.', example: 'std::ostream &operator<<(std::ostream &out, const Record &r) {\n    return out << r.name() << ": " << r.amount();\n}', analogy: 'Python\'s __str__: how print shows your object. It breaks because the C++ version is chosen at compile time by type, and you write it outside the class.' },
    { id: 'cpp.3.operator-lt', term: 'bool operator<(const T &a, const T &b)', kind: 'pattern', meaning: 'Define what "a before b" means for your type. std::sort with no comparator uses it, as do std::min and std::max.', example: 'bool operator<(const Record &a, const Record &b) {\n    return a.name() < b.name();\n}' },
    { id: 'cpp.3.operator-eq', term: 'bool operator==(const T &a, const T &b)', kind: 'pattern', meaning: 'Define equality for your type, member by member. std::find and std::count use it. A class has no == until you write one.', example: 'bool operator==(const Record &a, const Record &b) {\n    return a.name() == b.name() && a.amount() == b.amount();\n}' },
    { id: 'cpp.3.friend', term: 'friend', kind: 'keyword', meaning: 'Inside a class, declares a function that is not a member but may read the class\'s private members. Useful for an operator that needs the raw data; unnecessary when public accessors exist.', example: 'class Record {\n    friend bool operator==(const Record &a, const Record &b) {\n        return a.name_ == b.name_ && a.amount_ == b.amount_;\n    }\n    // ...\n};' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Operators are functions with punctuation for names',
      body: `\`std::cout << 5\` works because someone wrote a function named \`operator<<\` that takes a stream and an int. You can write one for your own type. The pattern is fixed: a **free function** (outside the class) that takes \`std::ostream &out\` and a \`const T &\`, writes the pieces to \`out\`, and **returns \`out\`** so the next \`<<\` has something to write to.

The same trick gives meaning to \`<\` and \`==\`. Once \`operator<\` says "compare by name", \`std::sort(v.begin(), v.end())\` sorts records with no lambda. Keep the lambda for a different order on a particular call. Once \`operator==\` exists, \`std::count\` and \`std::find\` work on your type.

Operators written outside the class see only its public face. If one needs the private members directly, declare it \`friend\` inside the class: it stays a free function but is allowed in. With accessors available, you rarely need it.`,
      example: {
        language: 'cpp',
        source: '#include <algorithm>\n#include <iostream>\n#include <string>\n#include <vector>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    const std::string &name() const { return name_; }\n    int amount() const { return amount_; }\n    friend bool operator==(const Record &a, const Record &b) {\n        return a.name_ == b.name_ && a.amount_ == b.amount_;\n    }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nstd::ostream &operator<<(std::ostream &out, const Record &r) {\n    return out << r.name() << ": " << r.amount();\n}\n\nbool operator<(const Record &a, const Record &b) {\n    return a.name() < b.name();\n}\n\nint main() {\n    std::vector<Record> records{{"rent", 800}, {"food", 120}, {"bus", 40}};\n    std::sort(records.begin(), records.end());\n    for (const Record &r : records) {\n        std::cout << r << "\\n";\n    }\n    std::cout << (records[0] == Record("bus", 40)) << "\\n";\n    std::sort(records.begin(), records.end(), [](const Record &a, const Record &b) { return a.amount() > b.amount(); });\n    std::cout << records[0] << "\\n";\n    return 0;\n}',
        labels: [
          { lines: [11, 13], label: 'friend: a free function written inside the class so it may read name_ and amount_ directly.' },
          { lines: [19, 21], label: 'Teach std::cout to print a Record. Writes the parts, returns the stream for chaining.' },
          { lines: [23, 25], label: 'What "before" means for Records: alphabetical by name.' },
          { lines: [28, 29], label: 'Three records; sort with no comparator uses operator<.' },
          { lines: [30, 32], label: 'Prints bus: 40, food: 120, rent: 800 through operator<<.' },
          { lines: [33, 33], label: 'operator== compares both members: prints 1.' },
          { lines: [34, 35], label: 'A lambda for a one-off order: largest amount first, so rent: 800.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'In C every print site repeated `printf("%s: %d", r.name, r.amount)`, and `qsort` wanted a comparator taking two `const void *` that you cast back yourself. `operator<<` centralises the printing; `operator<` is a typed comparator the compiler checks.' },
        { from: 'python', note: '`__str__`, `__lt__` and `__eq__` are the same idea with dunder names; `@dataclass` wrote `__eq__` for you. In C++ you write them as ordinary functions named `operator<<`, `operator<`, `operator==`, and a class with none of them cannot be printed or compared at all.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'With this `operator<`, what does the program print?',
      code: { language: 'cpp', source: 'bool operator<(const Record &a, const Record &b) {\n    return a.amount() < b.amount();\n}\n\nint main() {\n    std::vector<Record> records{{"rent", 800}, {"food", 120}, {"bus", 40}};\n    std::sort(records.begin(), records.end());\n    for (const Record &r : records) {\n        std::cout << r.name() << " ";\n    }\n    std::cout << "\\n";\n    return 0;\n}' },
      choices: ['bus food rent', 'rent food bus', 'bus food rent (alphabetical, by coincidence of the data)', 'a compiler error: Record has no operator<'],
      answer: 'bus food rent',
      explanation: 'std::sort with no comparator uses operator<, and this one compares amounts: 40, 120, 800. The names come out bus, food, rent because that is the order of their amounts, not because of the spelling. Change rent\'s amount to 10 and it would print first.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that defines `operator<<` for `Record` and prints `bus: 40` then `rent: 800` with a chained `<<`.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        '#include <string>',
        'class Record {',
        'public:',
        '    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}',
        '    const std::string &name() const { return name_; }',
        '    int amount() const { return amount_; }',
        'private:',
        '    std::string name_;',
        '    int amount_;',
        '};',
        'std::ostream &operator<<(std::ostream &out, const Record &r) {',
        '    return out << r.name() << ": " << r.amount();',
        '}',
        'int main() {',
        '    Record bus("bus", 40);',
        '    Record rent("rent", 800);',
        '    std::cout << bus << "\\n" << rent << "\\n";',
        '    return 0;',
        '}',
      ],
      distractors: [
        'void operator<<(std::ostream &out, const Record &r) {',
        '    return out << r.name_ << ": " << r.amount_;',
      ],
      explanation: 'operator<< must return the stream, or `std::cout << bus << "\\n"` has nothing to continue with after bus. And a free function that is not a friend cannot name name_ or amount_: it goes through the public accessors.',
    },
    {
      kind: 'modify',
      prompt: 'The program sorts by amount with a lambda and prints with accessors. Change it to: define `operator<` comparing names and sort with **no** comparator; define `operator<<` and print each record with `std::cout << r`; define `operator==` and print `Matches: <k>`, where k is how many records equal `Record("food", 120)` (use `std::count`).',
      language: 'cpp',
      starter: '#include <algorithm>\n#include <iostream>\n#include <string>\n#include <vector>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    const std::string &name() const { return name_; }\n    int amount() const { return amount_; }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nint main() {\n    std::vector<Record> records{{"rent", 800}, {"food", 120}, {"bus", 40}, {"food", 120}};\n    std::sort(records.begin(), records.end(), [](const Record &a, const Record &b) { return a.amount() < b.amount(); });\n    for (const Record &r : records) {\n        std::cout << r.name() << ": " << r.amount() << "\\n";\n    }\n    return 0;\n}\n',
      tests: [{ description: 'Sorted by name, printed via operator<<, duplicates counted', expectedStdout: 'bus: 40\nfood: 120\nfood: 120\nrent: 800\nMatches: 2' }],
      hint: 'All three operators are free functions after the class. `std::count(records.begin(), records.end(), Record("food", 120))` needs operator== to compile.',
      solution: '#include <algorithm>\n#include <iostream>\n#include <string>\n#include <vector>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    const std::string &name() const { return name_; }\n    int amount() const { return amount_; }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nstd::ostream &operator<<(std::ostream &out, const Record &r) {\n    return out << r.name() << ": " << r.amount();\n}\n\nbool operator<(const Record &a, const Record &b) {\n    return a.name() < b.name();\n}\n\nbool operator==(const Record &a, const Record &b) {\n    return a.name() == b.name() && a.amount() == b.amount();\n}\n\nint main() {\n    std::vector<Record> records{{"rent", 800}, {"food", 120}, {"bus", 40}, {"food", 120}};\n    std::sort(records.begin(), records.end());\n    for (const Record &r : records) {\n        std::cout << r << "\\n";\n    }\n    std::cout << "Matches: " << std::count(records.begin(), records.end(), Record("food", 120)) << "\\n";\n    return 0;\n}\n',
    },
    {
      kind: 'create',
      prompt: 'Write `Record` with `operator<<` (prints `<name>: <amount>`) and `operator<` (by name). In `main`, read three records (`Name?` word then `Amount?` int, three times), sort them with `std::sort` and no comparator, print each with `std::cout << r`, then print `Total: <sum>`.',
      language: 'cpp',
      tests: [
        { description: 'Three records out of order', stdin: 'rent\n800\nbus\n40\nfood\n120', expectedStdout: 'Name?\nAmount?\nName?\nAmount?\nName?\nAmount?\nbus: 40\nfood: 120\nrent: 800\nTotal: 960' },
        { description: 'Already sorted, with a zero', stdin: 'a\n0\nb\n5\nc\n5', expectedStdout: 'Name?\nAmount?\nName?\nAmount?\nName?\nAmount?\na: 0\nb: 5\nc: 5\nTotal: 10' },
      ],
      hint: 'Collect into a std::vector<Record> in a loop, then sort, then one range-for prints and sums.',
      solution: '#include <algorithm>\n#include <iostream>\n#include <string>\n#include <vector>\n\nclass Record {\npublic:\n    Record(const std::string &name, int amount) : name_(name), amount_(amount) {}\n    const std::string &name() const { return name_; }\n    int amount() const { return amount_; }\nprivate:\n    std::string name_;\n    int amount_;\n};\n\nstd::ostream &operator<<(std::ostream &out, const Record &r) {\n    return out << r.name() << ": " << r.amount();\n}\n\nbool operator<(const Record &a, const Record &b) {\n    return a.name() < b.name();\n}\n\nint main() {\n    std::vector<Record> records;\n    for (int i = 0; i < 3; i++) {\n        std::cout << "Name?\\n";\n        std::string name;\n        std::cin >> name;\n        std::cout << "Amount?\\n";\n        int amount;\n        std::cin >> amount;\n        records.push_back(Record(name, amount));\n    }\n    std::sort(records.begin(), records.end());\n    int total = 0;\n    for (const Record &r : records) {\n        std::cout << r << "\\n";\n        total += r.amount();\n    }\n    std::cout << "Total: " << total << "\\n";\n    return 0;\n}\n',
      projectNote: 'Vault++ v0.3: records print themselves and know their own order; the Vault\'s list() needs only to sort and loop.',
    },
  ],
};

/* ------------------------------------------------------------------ */

const l35: Lesson = {
  id: 'cpp-3-5',
  title: 'Project: Vault++ v0.3',
  objective: 'Assemble the Record and Vault classes into the command-driven Vault++ v0.3.',
  minutes: 24,
  lexicon: [
    { id: 'cpp.3.owned-vector', term: 'class with a std::vector member', kind: 'pattern', meaning: 'A class that holds a container privately and exposes operations on it. The container is created empty with the object and destroyed with it; no size bookkeeping by hand.', example: 'class Vault {\npublic:\n    void add(const Record &r) { records_.push_back(r); }\nprivate:\n    std::vector<Record> records_;\n};' },
    { id: 'cpp.3.sorted-copy', term: 'sort a copy inside a const method', kind: 'pattern', meaning: 'A const member function may not reorder its own members. To print in sorted order without disturbing the stored order, copy the vector into a local and sort that.', example: 'void list() const {\n    std::vector<Record> sorted = records_;\n    std::sort(sorted.begin(), sorted.end(), byName);\n}' },
    { id: 'cpp.3.size_t', term: 'size() is std::size_t', kind: 'concept', meaning: 'vector::size() returns an unsigned type, std::size_t. Printing it is fine; comparing it with an int triggers a sign-compare warning, which -Werror turns into an error. Convert with static_cast<int> when you need an int.', example: 'int count = static_cast<int>(records_.size());' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Vault++ v0.3, whole',
      body: `Everything in this module meets here. \`Record\` is the class from lessons 1 and 2: a constructor with an initialiser list, two const accessors, private data. \`Vault\` owns a private \`std::vector<Record>\` and exposes four operations: \`add\`, \`total\`, \`find\` (an \`std::optional<Record>\`), and \`list\`, which sorts a **copy** by name with a lambda because a const method may not reorder its own records.

\`main\` is the command loop from v0.2 with the commands changed: 1 adds a record (\`Name?\` then \`Amount?\`), 2 lists sorted by name followed by \`Records:\` and \`Total:\`, 4 finds by name, 3 says \`Bye\`, anything else is \`Unknown command\`. Read the whole program with the labels before you build it.`,
      example: {
        language: 'cpp',
        source: VAULT_V03.trimEnd(),
        labels: [
          { lines: [1, 5], label: 'algorithm for sort, optional for the maybe-result, the usual string and vector.' },
          { lines: [7, 15], label: 'Record: constructor, two const accessors, private data.' },
          { lines: [17, 19], label: 'Vault owns the records; add is the only way in.' },
          { lines: [20, 26], label: 'total: a const accessor that sums the amounts.' },
          { lines: [27, 34], label: 'find: copy out the match, or nullopt.' },
          { lines: [35, 43], label: 'list: sort a copy by name with a lambda, print each, then the two summary lines.' },
          { lines: [49, 54], label: 'The loop: prompt, read a command, dispatch.' },
          { lines: [55, 63], label: 'Command 1: two prompts, construct a Record, add it.' },
          { lines: [64, 65], label: 'Command 2: the Vault prints itself.' },
          { lines: [66, 75], label: 'Command 4: the optional decides between the record and Not found.' },
          { lines: [76, 81], label: 'Command 3 leaves the loop; everything else is unknown.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'The C Vault carried `records`, `count` and `capacity` as open fields and a `vault_add` that reallocated by hand. Here `std::vector` does the growing, `Vault` hides it, and there is no `free` anywhere: the vector and its strings clean up when `vault` leaves main.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The user types the commands `1 food 120`, `1 bus 40`, `4 car`, `2`, `3`. Ignoring the prompt lines, what does the program print?',
      code: { language: 'cpp', source: '// Vault++ v0.3 as shown in the concept step; input:\n// 1\n// food\n// 120\n// 1\n// bus\n// 40\n// 4\n// car\n// 2\n// 3' },
      choices: ['Added\nAdded\nNot found\nbus: 40\nfood: 120\nRecords: 2\nTotal: 160\nBye', 'Added\nAdded\nNot found\nfood: 120\nbus: 40\nRecords: 2\nTotal: 160\nBye', 'Added\nAdded\ncar: 0\nbus: 40\nfood: 120\nRecords: 2\nTotal: 160\nBye', 'Added\nAdded\nNot found\nbus: 40\nfood: 120\nTotal: 160\nRecords: 2\nBye'],
      answer: 'Added\nAdded\nNot found\nbus: 40\nfood: 120\nRecords: 2\nTotal: 160\nBye',
      explanation: 'Each add prints Added. Command 4 for car finds nothing, so Not found. Command 2 prints the records sorted by name (bus before food), then Records: 2 and Total: 160 in that order. Command 3 prints Bye and stops.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `Vault::list()`: sort a copy by name, print each record as `<name>: <amount>`, then `Records:` and `Total:`.',
      language: 'cpp',
      indentation: true,
      solution: [
        'void list() const {',
        '    std::vector<Record> sorted = records_;',
        '    std::sort(sorted.begin(), sorted.end(), [](const Record &a, const Record &b) { return a.name() < b.name(); });',
        '    for (const Record &r : sorted) {',
        '        std::cout << r.name() << ": " << r.amount() << "\\n";',
        '    }',
        '    std::cout << "Records: " << sorted.size() << "\\n";',
        '    std::cout << "Total: " << total() << "\\n";',
        '}',
      ],
      distractors: [
        '    std::sort(records_.begin(), records_.end(), [](const Record &a, const Record &b) { return a.name() < b.name(); });',
        'void list() {',
      ],
      explanation: 'list() is const because listing must not change the vault, and a const method cannot sort records_ in place. So it sorts a copy. Dropping the const would compile, but then list() could not be called on a const Vault and would no longer promise anything.',
    },
    {
      kind: 'modify',
      prompt: 'This is Vault++ v0.3 without command 4. Add `std::optional<Record> find(const std::string &name) const` to `Vault`, and make command 4 print `Name?`, read a word, and print `<name>: <amount>` or `Not found`.',
      language: 'cpp',
      starter: VAULT_V03
        .replace('#include <optional>\n', '')
        .replace('    std::optional<Record> find(const std::string &name) const {\n        for (const Record &r : records_) {\n            if (r.name() == name) {\n                return r;\n            }\n        }\n        return std::nullopt;\n    }\n', '')
        .replace('        } else if (command == 4) {\n            std::cout << "Name?\\n";\n            std::string name;\n            std::cin >> name;\n            std::optional<Record> found = vault.find(name);\n            if (found) {\n                std::cout << found->name() << ": " << found->amount() << "\\n";\n            } else {\n                std::cout << "Not found\\n";\n            }\n', ''),
      tests: [
        { description: 'Find an existing record', stdin: '1\nrent\n800\n4\nrent\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nrent: 800\nCommand?\nBye' },
        { description: 'Find a missing record', stdin: '1\nrent\n800\n4\ncar\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nNot found\nCommand?\nBye' },
      ],
      hint: 'Include <optional>. find loops over records_ and returns the matching Record, or std::nullopt after the loop. In main, `if (found)` chooses the line to print.',
      solution: VAULT_V03,
    },
    {
      kind: 'create',
      prompt: 'Write Vault++ v0.3 from scratch: `class Record` (constructor, const accessors `name()` and `amount()`), `class Vault` (private `std::vector<Record>`; `add`, `total`, `find` returning `std::optional<Record>`, `list`). Command loop: `Command?` then 1 = `Name?` word, `Amount?` int, `Added`; 2 = records sorted by name as `<name>: <amount>`, then `Records: <n>`, then `Total: <t>`; 4 = `Name?` word then `<name>: <amount>` or `Not found`; 3 = `Bye` and stop; anything else `Unknown command`.',
      language: 'cpp',
      tests: [
        { description: 'Add two, list sorted by name', stdin: '1\nrent\n800\n1\nfood\n120\n2\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nfood: 120\nrent: 800\nRecords: 2\nTotal: 920\nCommand?\nBye' },
        { description: 'Find hit and miss', stdin: '1\nbus\n40\n4\nbus\n4\ncar\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nbus: 40\nCommand?\nName?\nNot found\nCommand?\nBye' },
        { description: 'List when empty', stdin: '2\n3', expectedStdout: 'Command?\nRecords: 0\nTotal: 0\nCommand?\nBye' },
        { description: 'Unknown command then quit', stdin: '9\n3', expectedStdout: 'Command?\nUnknown command\nCommand?\nBye' },
      ],
      hint: 'Write the two classes first and compile with an empty main. Then add commands one at a time: 3, 1, 2, 4.',
      solution: VAULT_V03,
      projectNote: 'Vault++ v0.3: a Record class and a Vault class; records are added, listed sorted by name with a total, and found by name.',
    },
  ],
};

export const m3: Module = {
  id: 'cpp-m3',
  title: 'Classes',
  goal: 'Constructors, member functions, const, encapsulation, operator overloading basics.',
  projectMilestone: 'Vault++ v0.3: a Record class and a Vault class.',
  status: 'available',
  lessons: [l31, l32, l33, l34, l35],
};
