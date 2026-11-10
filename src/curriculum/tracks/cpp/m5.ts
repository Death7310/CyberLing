import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 5: Templates and generic code                               */
/* ------------------------------------------------------------------ */

/** C++ source written verbatim: backslashes stay (so `"\n"` inside C++ strings survives), leading newline dropped. */
const cpp = (s: TemplateStringsArray) => s.raw.join('').replace(/^\n/, '');

/* ------------------------------------------------------------------ */
/* 5-1 Function templates                                             */
/* ------------------------------------------------------------------ */

const l51: Lesson = {
  id: 'cpp-5-1',
  title: 'One function, stamped per type',
  objective: 'Write a function template and let the compiler deduce the type from the call.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.5.template', term: 'template <typename T>', kind: 'pattern', meaning: 'Introduces a template. T is a placeholder type; the compiler makes a real function for each T you call it with.', example: 'template <typename T>\nT biggest(const std::vector<T> &xs);', analogy: 'A form letter with a blank for the name. The compiler fills in the blank once per recipient. It breaks here: each filled copy is checked separately, so a mistake can appear only for one type.' },
    { id: 'cpp.5.typename', term: 'typename / class', kind: 'keyword', meaning: 'Inside template <...>, either word declares a type parameter. They mean the same thing there; this track writes typename.', example: 'template <class T> T twice(T x) { return x + x; }' },
    { id: 'cpp.5.deduction', term: 'template argument deduction', kind: 'concept', meaning: 'The compiler works out T from the arguments at the call site. Every argument that mentions T must agree, or the call is an error.', example: 'biggest(prices);   // prices is std::vector<double>, so T = double' },
    { id: 'cpp.5.instantiation', term: 'instantiation', kind: 'concept', meaning: 'The compiler stamping out a concrete copy of a template for one set of types, at compile time. No template code exists at run time, only the copies.', example: 'biggest(amounts);  // instantiates biggest<int>\nbiggest(prices);   // instantiates biggest<double>' },
    { id: 'cpp.5.explicit-arg', term: 'biggest<double>(xs)', kind: 'pattern', meaning: 'Name the type argument yourself instead of letting the compiler deduce it. Needed when deduction has nothing to go on or the arguments disagree.', example: 'bigger<double>(2.5, 1);   // 1 is converted to double' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The compiler writes the copies for you',
      body: `In C, a function that finds the biggest element of an array works for exactly one type. For doubles you copy it and change \`int\` to \`double\`. In C++ you write the function once as a **template**: \`template <typename T>\` says "T stands for some type", and the body uses \`T\` wherever the type would go.

Nothing happens at run time. When you call \`biggest(amounts)\` with a \`std::vector<int>\`, the compiler **deduces** T = int and **instantiates** a real \`biggest<int>\`. Call it with a \`std::vector<std::string>\` and a second copy, \`biggest<std::string>\`, is stamped out. Each copy is checked as if you had typed it by hand, so the strings version needs \`>\` to exist for strings, which it does.

The notional machine gains one rule: a template is not a function, it is a recipe for functions, used at compile time.`,
      example: {
        language: 'cpp',
        source: cpp`
#include <iostream>
#include <string>
#include <vector>

template <typename T>
T biggest(const std::vector<T> &xs) {
    T best = xs[0];
    for (const T &x : xs) {
        if (x > best) best = x;
    }
    return best;
}

int main() {
    std::vector<int> amounts{4, 9, 2};
    std::vector<std::string> names{"fig", "pear", "apple"};
    std::cout << biggest(amounts) << "\n";
    std::cout << biggest(names) << "\n";
    return 0;
}`,
        labels: [
          { lines: [5, 5], label: 'Open the recipe: T is a type to be filled in later.' },
          { lines: [6, 6], label: 'T appears as the return type and inside the parameter type.' },
          { lines: [7, 11], label: 'The body is ordinary code written in terms of T.' },
          { lines: [15, 16], label: 'Two vectors of different element types.' },
          { lines: [17, 18], label: 'Two calls, two instantiations: biggest<int> prints 9, biggest<std::string> prints pear (alphabetical).' },
        ],
      },
      contrast: [
        { from: 'c', note: 'In C the only generic tools were void* and macros, and both gave up type checking. A template keeps full type checking: each instantiation is compiled as real, typed code, and an operator the type lacks is a compile error, not a crash.' },
        { from: 'python', note: 'A Python function is generic for free because types are checked when the line runs. A C++ template is generic at compile time: the compiler produces a separate, fully typed function per type, with no run-time cost.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What happens when this program is compiled and run?',
      code: {
        language: 'cpp',
        source: cpp`
#include <iostream>

template <typename T>
T bigger(T a, T b) {
    return a > b ? a : b;
}

int main() {
    std::cout << bigger(3, 7) << "\n";
    std::cout << bigger(2.5, 1) << "\n";
    return 0;
}`,
      },
      choices: ['7\n2.5', '7\n2', 'a compile error on the second call', '7\n1'],
      answer: 'a compile error on the second call',
      explanation: 'Deduction must agree across all arguments. In `bigger(2.5, 1)` the first argument says T = double and the second says T = int, and the compiler refuses to guess. Either write `bigger(2.5, 1.0)` or name the type yourself: `bigger<double>(2.5, 1)`.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a template `total` that adds up a vector of any numeric type, and use it on a vector of doubles. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        '#include <vector>',
        'template <typename T>',
        'T total(const std::vector<T> &xs) {',
        '    T sum{};',
        '    for (const T &x : xs) {',
        '        sum += x;',
        '    }',
        '    return sum;',
        '}',
        'int main() {',
        '    std::vector<double> prices{1.5, 2.25};',
        '    std::cout << total(prices) << "\\n";',
        '    return 0;',
        '}',
      ],
      distractors: ['T total(const std::vector<int> &xs) {', '    int sum = 0;', 'template <T>'],
      explanation: '`template <T>` is missing the word `typename`. Writing `std::vector<int>` in the parameter would pin the template to int, and `int sum` would truncate every double on the way through. `T sum{}` makes a default T: 0 for numbers.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the template so `smallest` works for any vector whose elements can be compared with `<`.',
      language: 'cpp',
      template: 'template <{{kw}} T>\nT smallest(const std::vector<{{elem}}> &xs) {\n    {{best}} best = xs[0];\n    for (const T &x : xs) {\n        if (x < best) best = x;\n    }\n    return best;\n}',
      blanks: [
        { id: 'kw', answers: ['typename', 'class'], hint: 'the word that declares a type parameter' },
        { id: 'elem', answers: ['T'], hint: 'the element type is the placeholder' },
        { id: 'best', answers: ['T'], hint: 'the local box must hold one element' },
      ],
      explanation: 'Every place where the element type would be written becomes T. The compiler fills them all in at once per instantiation.',
    },
    {
      kind: 'modify',
      prompt: 'This program has two hand-written copies of the same function, one per type, and now a third is wanted for words. Replace both copies with one template `biggest`, then add the line `Max word: <biggest of fig, pear, apple>` to the output.',
      language: 'cpp',
      starter: cpp`
#include <iostream>
#include <string>
#include <vector>

int biggest_int(const std::vector<int> &xs) {
    int best = xs[0];
    for (int x : xs) {
        if (x > best) best = x;
    }
    return best;
}

double biggest_double(const std::vector<double> &xs) {
    double best = xs[0];
    for (double x : xs) {
        if (x > best) best = x;
    }
    return best;
}

int main() {
    std::vector<int> amounts{4, 9, 2};
    std::vector<double> prices{1.25, 2.5, 0.75};
    std::cout << "Max int: " << biggest_int(amounts) << "\n";
    std::cout << "Max double: " << biggest_double(prices) << "\n";
    return 0;
}
`,
      tests: [{ description: 'three types through one template', expectedStdout: 'Max int: 9\nMax double: 2.5\nMax word: pear' }],
      hint: 'Write `template <typename T>` above one copy, replace every `int` in it with `T`, delete the other copy, and call `biggest` three times. Strings compare alphabetically with `>`.',
      solution: cpp`
#include <iostream>
#include <string>
#include <vector>

template <typename T>
T biggest(const std::vector<T> &xs) {
    T best = xs[0];
    for (const T &x : xs) {
        if (x > best) best = x;
    }
    return best;
}

int main() {
    std::vector<int> amounts{4, 9, 2};
    std::vector<double> prices{1.25, 2.5, 0.75};
    std::vector<std::string> words{"fig", "pear", "apple"};
    std::cout << "Max int: " << biggest(amounts) << "\n";
    std::cout << "Max double: " << biggest(prices) << "\n";
    std::cout << "Max word: " << biggest(words) << "\n";
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write two function templates, `sum` and `biggest`, each taking a `const std::vector<T> &`. Read whole numbers until the input ends (`while (std::cin >> x)`). If nothing was read print `Empty`; otherwise print `Sum: <s>` and `Biggest: <b>`. Then prove the templates are generic: print `Double sum: 3.75` by calling `sum` on `std::vector<double>{1.5, 2.25}`.',
      language: 'cpp',
      tests: [
        { description: 'three amounts', stdin: '4 9 2', expectedStdout: 'Sum: 15\nBiggest: 9\nDouble sum: 3.75' },
        { description: 'no input at all', stdin: '', expectedStdout: 'Empty\nDouble sum: 3.75' },
        { description: 'a single negative amount', stdin: '-5', expectedStdout: 'Sum: -5\nBiggest: -5\nDouble sum: 3.75' },
      ],
      hint: 'Start the sum with `T total{};` so it is 0 for int and 0.0 for double. Push each read value into a `std::vector<int>` and check `empty()` before calling the templates.',
      solution: cpp`
#include <iostream>
#include <vector>

template <typename T>
T sum(const std::vector<T> &xs) {
    T total{};
    for (const T &x : xs) {
        total += x;
    }
    return total;
}

template <typename T>
T biggest(const std::vector<T> &xs) {
    T best = xs[0];
    for (const T &x : xs) {
        if (x > best) best = x;
    }
    return best;
}

int main() {
    std::vector<int> amounts;
    int x;
    while (std::cin >> x) {
        amounts.push_back(x);
    }
    if (amounts.empty()) {
        std::cout << "Empty\n";
    } else {
        std::cout << "Sum: " << sum(amounts) << "\n";
        std::cout << "Biggest: " << biggest(amounts) << "\n";
    }
    std::vector<double> prices{1.5, 2.25};
    std::cout << "Double sum: " << sum(prices) << "\n";
    return 0;
}
`,
      projectNote: 'Vault++ v0.5 will compute statistics over amounts. The helpers that do it are now written once, for any numeric type.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 5-2 Class templates                                                */
/* ------------------------------------------------------------------ */

const l52: Lesson = {
  id: 'cpp-5-2',
  title: 'A class with a blank for the type',
  objective: 'Write a class template with members defined outside the class, and format a double to two decimals.',
  minutes: 24,
  lexicon: [
    { id: 'cpp.5.class-template', term: 'template <typename T> class Stats { ... };', kind: 'pattern', meaning: 'A class whose members use a placeholder type. Stats<int> and Stats<double> are two different, unrelated classes stamped from one recipe.', example: 'template <typename T>\nclass Stats {\npublic:\n    explicit Stats(const std::vector<T> &values);\n    T min() const;\n};' },
    { id: 'cpp.5.member-outside', term: 'template <typename T> T Stats<T>::min() const { ... }', kind: 'pattern', meaning: 'Defining a member of a class template outside the class: repeat the template line, then qualify the name with Stats<T>::.', example: 'template <typename T>\nT Stats<T>::min() const {\n    return *std::min_element(values_.begin(), values_.end());\n}', analogy: 'A footnote that must restate which chapter it belongs to. It breaks here: forgetting the <T> after the class name is an error, not a style issue.' },
    { id: 'cpp.5.setprecision', term: 'std::fixed << std::setprecision(2)', kind: 'builtin', meaning: 'From <iomanip>: print every following double with exactly two digits after the point. The setting stays on the stream until changed.', example: 'std::cout << std::fixed << std::setprecision(2) << 3.5 << "\\n";   // 3.50' },
    { id: 'cpp.5.static-cast', term: 'static_cast<double>(n)', kind: 'operator', meaning: 'Convert a value to another type explicitly, where the compiler can check it. Needed to turn an integer division into a real division.', example: 'double mean = static_cast<double>(total) / count;' },
    { id: 'cpp.5.callback-template', term: 'template <typename F> void for_each(F f) const', kind: 'pattern', meaning: 'A member template whose parameter is a callable of unknown type, so a lambda can be passed straight in. The lambda\'s type is deduced like any other T.', example: 'names.for_each([](const std::string &n) { std::cout << n << "\\n"; });' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Stats<int> and Stats<double> are two classes',
      body: `A class can take a type parameter too. \`template <typename T> class Stats\` holds a \`std::vector<T>\` and answers \`min()\`, \`max()\` and \`mean()\`. Writing \`Stats<int>\` stamps out a complete class for ints; \`Stats<double>\` stamps another. They share no code at run time and are not related by inheritance.

Members may be defined outside the class, as in Module 3, with one extra line: repeat \`template <typename T>\` and qualify the name as \`Stats<T>::min\`. The \`<T>\` after the class name is mandatory.

\`mean()\` returns \`double\` whatever T is, so an int vector gets a fractional mean. That needs a real division: \`static_cast<double>\` on one side. To print two decimals, send \`std::fixed << std::setprecision(2)\` (from \`<iomanip>\`) into the stream first; the setting stays on for later doubles.`,
      example: {
        language: 'cpp',
        source: cpp`
#include <iomanip>
#include <iostream>
#include <vector>

template <typename T>
class Stats {
public:
    explicit Stats(const std::vector<T> &values) : values_(values) {}
    T min() const;
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
double Stats<T>::mean() const {
    double total = 0;
    for (const T &v : values_) total += v;
    return total / static_cast<double>(values_.size());
}

int main() {
    Stats<int> s({3, 4, 8});
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Min: " << s.min() << " Mean: " << s.mean() << "\n";
    return 0;
}`,
        labels: [
          { lines: [5, 6], label: 'The recipe for a class; T is the element type.' },
          { lines: [8, 8], label: 'Copy the vector in; explicit stops a vector silently becoming a Stats.' },
          { lines: [9, 10], label: 'min returns a T; mean always returns a double.' },
          { lines: [15, 22], label: 'Member defined outside: template line again, then Stats<T>:: before the name.' },
          { lines: [24, 29], label: 'Accumulate in a double, divide by the count converted to double: 5.00, not 5.' },
          { lines: [32, 34], label: 'Instantiate for int; switch the stream to two fixed decimals; prints Min: 3 Mean: 5.00.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'The C Vault printed doubles with printf("%.2f"). In C++ the precision is a state of the stream: std::fixed << std::setprecision(2) once, and every later double on std::cout obeys it. Integers are not affected.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: {
        language: 'cpp',
        source: cpp`
#include <iomanip>
#include <iostream>

template <typename T>
class Pair {
public:
    Pair(T a, T b) : a_(a), b_(b) {}
    double mean() const { return (a_ + b_) / 2; }
private:
    T a_;
    T b_;
};

int main() {
    Pair<int> p(3, 4);
    Pair<double> q(3, 4);
    std::cout << std::fixed << std::setprecision(2);
    std::cout << p.mean() << " " << q.mean() << "\n";
    return 0;
}`,
      },
      choices: ['3.00 3.50', '3.50 3.50', '3 3.5', '3.00 3.00'],
      answer: '3.00 3.50',
      explanation: 'In Pair<int>, `(a_ + b_) / 2` is 7 / 2 with two ints: integer division gives 3, which is then converted to 3.0 for the double return value. In Pair<double>, 3 and 4 were converted to 3.0 and 4.0 when stored, so the division is real: 3.5. Each instantiation is compiled with its own T, and the same source line means different arithmetic.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a generic `Table<T>` with `add`, `size` and a `for_each` that takes a lambda, and use it to hold two names. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        '#include <string>',
        '#include <vector>',
        'template <typename T>',
        'class Table {',
        'public:',
        '    void add(const T &item) { items_.push_back(item); }',
        '    std::size_t size() const { return items_.size(); }',
        '    template <typename F>',
        '    void for_each(F f) const {',
        '        for (const T &item : items_) f(item);',
        '    }',
        'private:',
        '    std::vector<T> items_;',
        '};',
        'int main() {',
        '    Table<std::string> names;',
        '    names.add("rent");',
        '    names.add("food");',
        '    names.for_each([](const std::string &n) { std::cout << n << "\\n"; });',
        '    std::cout << "Size: " << names.size() << "\\n";',
        '    return 0;',
        '}',
      ],
      distractors: ['class Table<T> {', '    Table names;'],
      explanation: 'The class definition is written `class Table {` under its template line; `Table<T>` is how you *use* the recipe, not how you define it. And `Table names;` gives the compiler nothing to deduce T from: say `Table<std::string>`.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the out-of-class member definition and the output formatting so the program prints `Max: 9 Mean: 5.00`.',
      language: 'cpp',
      template: '#include <iomanip>\n#include <iostream>\n#include <vector>\n\ntemplate <typename T>\nclass Stats {\npublic:\n    explicit Stats(const std::vector<T> &values) : values_(values) {}\n    T max() const;\n    double mean() const;\nprivate:\n    std::vector<T> values_;\n};\n\n{{tmpl}}\nT {{scope}}::max() const {\n    T best = values_[0];\n    for (const T &v : values_) {\n        if (v > best) best = v;\n    }\n    return best;\n}\n\ntemplate <typename T>\ndouble Stats<T>::mean() const {\n    double total = 0;\n    for (const T &v : values_) total += v;\n    return total / {{cast}}(values_.size());\n}\n\nint main() {\n    Stats<int> s({3, 4, 8});\n    std::cout << std::fixed << std::{{prec}}(2);\n    std::cout << "Max: " << s.max() << " Mean: " << s.mean() << "\\n";\n    return 0;\n}',
      blanks: [
        { id: 'tmpl', answers: ['template <typename T>', 'template<typename T>', 'template <class T>'], hint: 'the same line that opened the class' },
        { id: 'scope', answers: ['Stats<T>'], hint: 'the class name with its type argument' },
        { id: 'cast', answers: ['static_cast<double>'], hint: 'make the division real' },
        { id: 'prec', answers: ['setprecision'], hint: 'from <iomanip>, takes the number of decimals' },
      ],
      explanation: 'A member defined outside a class template repeats the template line and uses `Stats<T>::`. `static_cast<double>` turns the count into a double so the division keeps its fraction.',
    },
    {
      kind: 'modify',
      prompt: 'This `Stats<T>` reports the mean of `3 4` as `3.00`. The bug is in `mean()`: the division happens between a T and a count, both whole numbers. Fix it so the mean of `3 4` is `3.50` and `10 20 25` gives `18.33`, without changing how the program reads or prints.',
      language: 'cpp',
      starter: cpp`
#include <iomanip>
#include <iostream>
#include <vector>

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
    T total{};
    for (const T &v : values_) total += v;
    return total / values_.size();
}

int main() {
    std::vector<int> amounts;
    int x;
    while (std::cin >> x) {
        amounts.push_back(x);
    }
    if (amounts.empty()) {
        std::cout << "Empty\n";
        return 0;
    }
    Stats<int> s(amounts);
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Min: " << s.min() << "\n";
    std::cout << "Max: " << s.max() << "\n";
    std::cout << "Mean: " << s.mean() << "\n";
    return 0;
}
`,
      tests: [
        { description: 'two amounts', stdin: '3 4', expectedStdout: 'Min: 3\nMax: 4\nMean: 3.50' },
        { description: 'three amounts', stdin: '10 20 25', expectedStdout: 'Min: 10\nMax: 25\nMean: 18.33' },
        { description: 'no amounts', stdin: '', expectedStdout: 'Empty' },
      ],
      hint: 'Accumulate into a `double total = 0;` and divide by `static_cast<double>(values_.size())`. Either change alone is enough; both together is clearest.',
      solution: cpp`
#include <iomanip>
#include <iostream>
#include <vector>

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

int main() {
    std::vector<int> amounts;
    int x;
    while (std::cin >> x) {
        amounts.push_back(x);
    }
    if (amounts.empty()) {
        std::cout << "Empty\n";
        return 0;
    }
    Stats<int> s(amounts);
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Min: " << s.min() << "\n";
    std::cout << "Max: " << s.max() << "\n";
    std::cout << "Mean: " << s.mean() << "\n";
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write `Table<T>` (a wrapper around `std::vector<T>` with `add`, `size`, `items()` returning the vector by const reference, and `for_each` taking a lambda) and `Stats<T>` with `mean()`. Read `name amount` pairs until the input ends into a `Table<std::string>` and a `Table<int>`. Print each name as `- <name>` using `for_each`, then `Size: <n>`, then `Mean: <x.xx>` of the amounts, or `Empty` instead of the mean when there are none.',
      language: 'cpp',
      tests: [
        { description: 'two records', stdin: 'rent 50\nfood 20', expectedStdout: '- rent\n- food\nSize: 2\nMean: 35.00' },
        { description: 'three records with a fractional mean', stdin: 'rent 10\nfood 15\nbus 16', expectedStdout: '- rent\n- food\n- bus\nSize: 3\nMean: 13.67' },
        { description: 'no records', stdin: '', expectedStdout: 'Size: 0\nEmpty' },
      ],
      hint: 'Two tables of different element types prove Table is generic. Build `Stats<int>` from `amounts.items()`. Guard the mean with `if (amounts.size() == 0)`.',
      solution: cpp`
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>

template <typename T>
class Table {
public:
    void add(const T &item) { items_.push_back(item); }
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
    double mean() const;
private:
    std::vector<T> values_;
};

template <typename T>
double Stats<T>::mean() const {
    double total = 0;
    for (const T &v : values_) total += v;
    return total / static_cast<double>(values_.size());
}

int main() {
    Table<std::string> names;
    Table<int> amounts;
    std::string name;
    int amount;
    while (std::cin >> name >> amount) {
        names.add(name);
        amounts.add(amount);
    }
    names.for_each([](const std::string &n) { std::cout << "- " << n << "\n"; });
    std::cout << "Size: " << names.size() << "\n";
    if (amounts.size() == 0) {
        std::cout << "Empty\n";
        return 0;
    }
    Stats<int> s(amounts.items());
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Mean: " << s.mean() << "\n";
    return 0;
}
`,
      projectNote: 'Table<T> and Stats<T> are the two generic pieces Vault++ v0.5 is built from. In the project, Table will hold Records.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 5-3 Reading template errors and concepts                           */
/* ------------------------------------------------------------------ */

const l53: Lesson = {
  id: 'cpp-5-3',
  title: 'Why the error is forty lines long',
  objective: 'Read a template error back to the call that caused it, and constrain templates so the error lands there.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.5.error-anatomy', term: 'required from here', kind: 'concept', meaning: 'The phrase g++ uses to point from a failure inside a template body back to the call that instantiated it. The first such line is where your mistake is.', example: 'main.cpp:11:12: required from here\nmain.cpp:5:14: error: no match for operator> (operand types are Box and Box)' },
    { id: 'cpp.5.requires', term: 'requires', kind: 'keyword', meaning: 'C++20: state a condition the type argument must satisfy. The compiler checks it at the call, before stamping the body, so the error names the call.', example: 'template <typename T>\n    requires std::integral<T>\nT twice(T x) { return x + x; }' },
    { id: 'cpp.5.std-concepts', term: 'std::integral / std::floating_point', kind: 'builtin', meaning: 'Ready-made concepts from <concepts>: named predicates on types. std::integral<T> is true for int, long, char, bool; std::floating_point<T> for float and double.', example: 'template <std::floating_point T>\nT half(T x) { return x / 2; }' },
    { id: 'cpp.5.static-assert', term: 'static_assert(cond, "message")', kind: 'keyword', meaning: 'A check the compiler performs; if cond is false, compilation stops and your message is printed. Works in every C++ version and inside template bodies.', example: 'static_assert(std::is_arithmetic_v<T>, "mean needs a number");', analogy: 'A sign on the door saying who may enter, read before anyone steps in. It breaks here: it still reports from inside the body, one line after "required from here".' },
    { id: 'cpp.5.type-traits', term: 'std::is_arithmetic_v<T>', kind: 'builtin', meaning: 'From <type_traits>: a compile-time bool that is true when T is an integer or floating-point type. The _v suffix gives the value directly.', example: 'static_assert(std::is_arithmetic_v<double>);   // passes' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The error is inside the copy, the cause is at the call',
      body: `Call \`biggest\` on a vector of a type with no \`>\`, and the compiler fails while stamping out the copy. It reports the failure **inside the template body**, then adds a chain of \`required from here\` lines leading back to **your call**. Long messages are that chain for every nested template the standard library used; read the first \`required from here\`, then the error line.

Two tools move the complaint to where the mistake is. \`static_assert(cond, "message")\` inside the body stops compilation with your own words. C++20 **concepts** go further: \`requires std::integral<T>\` (from \`<concepts>\`) is checked **before** the body is stamped, so the error names the call and says which constraint failed.

Below, the first \`twice\` compiles for anything with \`+\`; the second accepts only integer types, and refuses \`1.5\` on the line that passes it.`,
      example: {
        language: 'cpp',
        source: cpp`
#include <concepts>
#include <iostream>
#include <type_traits>

template <typename T>
T twice(T x) {
    static_assert(std::is_arithmetic_v<T>, "twice needs a number");
    return x + x;
}

template <typename T>
    requires std::integral<T>
T twice_int(T x) {
    return x + x;
}

int main() {
    std::cout << twice(2.5) << "\n";
    std::cout << twice_int(21) << "\n";
    // twice_int(1.5);  error here: constraints not satisfied, std::integral<double> is false
    return 0;
}`,
        labels: [
          { lines: [5, 9], label: 'Unconstrained template with a guard inside: a string argument fails on line 7 with your message.' },
          { lines: [11, 15], label: 'Constrained template: the requires clause is checked at the call, before the body exists.' },
          { lines: [18, 19], label: 'Both calls satisfy their rules: 5 and 42.' },
          { lines: [20, 20], label: 'Uncomment it and the compiler points at this line, names the concept and the type that failed it.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'C reported a type mismatch at the one line you wrote. A template error comes from code the compiler generated for you, so it has to explain the path back; "required from here" is that path.' },
        { from: 'python', note: 'Python would raise TypeError when the bad line runs, possibly in production. A concept rejects the call at compile time, before the program exists.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Both calls in `main` are mistakes. Where does the compiler point for each?',
      code: {
        language: 'cpp',
        source: cpp`
#include <concepts>

template <typename T>
T twice(T x) {
    return x + x;
}

template <typename T>
    requires std::integral<T>
T twice_int(T x) {
    return x + x;
}

struct Box {};

int main() {
    Box b;
    twice(b);
    twice_int(1.5);
    return 0;
}`,
      },
      choices: [
        'twice(b): the line `return x + x;` inside twice, with a "required from here" pointing at the call; twice_int(1.5): the call line itself, "constraints not satisfied"',
        'both errors point at the call lines in main',
        'both errors point at the `return x + x;` lines',
        'no error: templates accept any type, and the failures happen at run time',
      ],
      answer: 'twice(b): the line `return x + x;` inside twice, with a "required from here" pointing at the call; twice_int(1.5): the call line itself, "constraints not satisfied"',
      explanation: 'An unconstrained template is stamped first and fails inside: Box has no `+`, so the error is on `x + x`, with a note leading back to `twice(b)`. A constrained template is checked before stamping: `std::integral<double>` is false, so the compiler stops at `twice_int(1.5)` and says which constraint failed. Nothing about templates is checked at run time.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a template `half` that only accepts floating-point types, and call it with `5.0`. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <concepts>',
        '#include <iostream>',
        'template <typename T>',
        '    requires std::floating_point<T>',
        'T half(T x) {',
        '    return x / 2;',
        '}',
        'int main() {',
        '    std::cout << half(5.0) << "\\n";',
        '    return 0;',
        '}',
      ],
      distractors: ['    requires std::floating_point', '    std::cout << half(5) << "\\n";'],
      explanation: 'A concept is applied to a type: `std::floating_point<T>`, not bare. And `half(5)` deduces T = int, which fails the constraint at the call; `5.0` is a double and passes.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the guard so that calling `twice` with a non-numeric type stops compilation with the message `twice needs a number`.',
      language: 'cpp',
      template: '#include <type_traits>\n\ntemplate <typename T>\nT twice(T x) {\n    {{sa}}(std::{{trait}}<T>, "twice needs a number");\n    return x + x;\n}',
      blanks: [
        { id: 'sa', answers: ['static_assert'], hint: 'the compile-time check with a message' },
        { id: 'trait', answers: ['is_arithmetic_v'], hint: 'true for integers and floating point; ends in _v' },
      ],
      explanation: 'static_assert runs when the body is stamped for a type. With a non-numeric T the trait is false and your message appears right after "required from here".',
    },
    {
      kind: 'modify',
      prompt: 'This program does not compile. Read the error: it is a `static_assert` failure, "required from" the second call in `main`. Decide whether the call or the constraint is wrong: `mean` of a vector of doubles is perfectly sensible, so loosen the constraint to accept any arithmetic type (integers and floating point) while still rejecting strings. Expected output: `Mean: 2.50` then `Mean: 4.00`.',
      language: 'cpp',
      starter: cpp`
#include <iomanip>
#include <iostream>
#include <type_traits>
#include <vector>

template <typename T>
double mean(const std::vector<T> &xs) {
    static_assert(std::is_integral_v<T>, "mean needs a numeric type");
    double total = 0;
    for (const T &x : xs) total += x;
    return total / static_cast<double>(xs.size());
}

int main() {
    std::vector<int> counts{2, 3};
    std::vector<double> prices{1.5, 2.5, 8.0};
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Mean: " << mean(counts) << "\n";
    std::cout << "Mean: " << mean(prices) << "\n";
    return 0;
}
`,
      tests: [{ description: 'ints and doubles both allowed', expectedStdout: 'Mean: 2.50\nMean: 4.00' }],
      hint: '`std::is_integral_v<double>` is false. The trait that is true for both int and double is `std::is_arithmetic_v`.',
      solution: cpp`
#include <iomanip>
#include <iostream>
#include <type_traits>
#include <vector>

template <typename T>
double mean(const std::vector<T> &xs) {
    static_assert(std::is_arithmetic_v<T>, "mean needs a numeric type");
    double total = 0;
    for (const T &x : xs) total += x;
    return total / static_cast<double>(xs.size());
}

int main() {
    std::vector<int> counts{2, 3};
    std::vector<double> prices{1.5, 2.5, 8.0};
    std::cout << std::fixed << std::setprecision(2);
    std::cout << "Mean: " << mean(counts) << "\n";
    std::cout << "Mean: " << mean(prices) << "\n";
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write `template <typename T> T span(const std::vector<T> &xs)` that returns the biggest element minus the smallest, guarded by a `static_assert` that T is arithmetic (message of your choice). Read whole numbers until the input ends; print `Span: <d>`, or `Empty` if nothing was read. Then print `Span: 1.25` by calling `span` on `std::vector<double>{0.5, 1.75}`.',
      language: 'cpp',
      tests: [
        { description: 'three amounts', stdin: '4 9 2', expectedStdout: 'Span: 7\nSpan: 1.25' },
        { description: 'no input', stdin: '', expectedStdout: 'Empty\nSpan: 1.25' },
        { description: 'one amount', stdin: '5', expectedStdout: 'Span: 0\nSpan: 1.25' },
      ],
      hint: 'Track `lo` and `hi` in one loop starting from `xs[0]`. Put the static_assert as the first line of the body; it costs nothing at run time.',
      solution: cpp`
#include <iostream>
#include <type_traits>
#include <vector>

template <typename T>
T span(const std::vector<T> &xs) {
    static_assert(std::is_arithmetic_v<T>, "span needs a number");
    T lo = xs[0];
    T hi = xs[0];
    for (const T &x : xs) {
        if (x < lo) lo = x;
        if (x > hi) hi = x;
    }
    return hi - lo;
}

int main() {
    std::vector<int> amounts;
    int x;
    while (std::cin >> x) {
        amounts.push_back(x);
    }
    if (amounts.empty()) {
        std::cout << "Empty\n";
    } else {
        std::cout << "Span: " << span(amounts) << "\n";
    }
    std::vector<double> prices{0.5, 1.75};
    std::cout << "Span: " << span(prices) << "\n";
    return 0;
}
`,
      projectNote: 'The Stats<T> in Vault++ v0.5 only makes sense for numbers. You can now say so in code, and the compiler will say so to whoever misuses it.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 5-4 Project: Vault++ v0.5                                          */
/* ------------------------------------------------------------------ */

const l54: Lesson = {
  id: 'cpp-5-4',
  title: 'Vault++ v0.5: statistics',
  objective: 'Rebuild Vault on a generic Table<Record> and add a stats command built on Stats<int>.',
  minutes: 26,
  lexicon: [
    { id: 'cpp.5.table-of-records', term: 'Table<Record> records_;', kind: 'pattern', meaning: 'Instantiating your own class template with your own class. Table knows nothing about Record; it only needs Record to be copyable or movable.', example: 'class Vault {\nprivate:\n    Table<Record> records_;\n};' },
    { id: 'cpp.5.collect-lambda', term: '[&amounts](const Record &r) { amounts.push_back(r.amount()); }', kind: 'pattern', meaning: 'A lambda that captures a local vector by reference and fills it from each element. The usual way to turn a Table<Record> into the vector<int> a Stats<int> wants.', example: 'std::vector<int> amounts;\nrecords_.for_each([&amounts](const Record &r) { amounts.push_back(r.amount()); });' },
    { id: 'cpp.5.sticky-format', term: 'stream formatting is sticky', kind: 'concept', meaning: 'std::fixed and std::setprecision change the state of std::cout, not one value. Doubles printed later keep the format; ints are never affected.', example: 'std::cout << std::fixed << std::setprecision(2) << 2.5 << "\\n";   // 2.50\nstd::cout << 7 << "\\n";                                          // 7' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Two templates, one Vault',
      body: `Vault++ v0.5 keeps every command of v0.4 (add, list, quit, find, undo) and adds command \`6\`, **stats**: \`Min: <a>  Max: <b>  Mean: <x.xx>\` on one line, two spaces between fields, or \`Empty\` when there are no records.

The plan has three parts. First, \`Vault\` stops owning a bare \`std::vector<Record>\` and holds a \`Table<Record>\` instead; \`add\`, \`undo\`, \`list\` and \`total\` go through the table's \`add\`, \`remove_last\`, \`items()\` and \`for_each\`. Second, \`Stats<T>\` from the last lesson is pasted in unchanged. Third, \`stats()\` collects the amounts into a \`std::vector<int>\` with a capturing lambda, builds a \`Stats<int>\`, and prints.

Notice that \`Table\` never mentions \`Record\` and \`Stats\` never mentions \`Vault\`. That is the point of generic code: each piece is tested on its own and reused without edits. The \`std::unique_ptr<Vault>\` in \`main\` from v0.4 stays as it was.`,
      example: {
        language: 'cpp',
        source: cpp`
class Vault {
public:
    void add(Record r) { records_.add(std::move(r)); }
    bool undo() { return records_.remove_last(); }
    int total() const {
        int t = 0;
        records_.for_each([&t](const Record &r) { t += r.amount(); });
        return t;
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
private:
    Table<Record> records_;
};`,
        labels: [
          { lines: [3, 4], label: 'add and undo are one-line forwards to the generic table.' },
          { lines: [5, 9], label: 'total: a lambda capturing t by reference runs once per record.' },
          { lines: [11, 14], label: 'Guard first: Stats on an empty vector would read xs[0] that does not exist.' },
          { lines: [15, 17], label: 'Collect the amounts, then instantiate Stats<int> over them.' },
          { lines: [18, 19], label: 'One output line, two spaces between fields; fixed and setprecision apply to the double mean only.' },
          { lines: [22, 22], label: 'The Vault owns a Table of Records: your template, your class.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'The C Vault\'s statistics walked a malloc\'d array in main and printed with printf("%.2f"). Here the walk is a lambda handed to a generic container, and the formatting is a stream state.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Records with amounts 10 and 15 are in the vault and the user enters command `6`. Which line does `stats()` print?',
      code: {
        language: 'cpp',
        source: cpp`
std::vector<int> amounts{10, 15};
Stats<int> s(amounts);
std::cout << "Min: " << s.min() << "  Max: " << s.max();
std::cout << "  Mean: " << std::fixed << std::setprecision(2) << s.mean() << "\n";`,
      },
      choices: ['Min: 10  Max: 15  Mean: 12.50', 'Min: 10  Max: 15  Mean: 12', 'Min: 10.00  Max: 15.00  Mean: 12.50', 'Min: 10  Max: 15  Mean: 12.5'],
      answer: 'Min: 10  Max: 15  Mean: 12.50',
      explanation: 'min() and max() return int, and std::fixed never touches integers, so they print as 10 and 15. mean() returns a double computed with a real division (12.5), and setprecision(2) under std::fixed pads it to 12.50.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the `stats` member of `Vault`. `records_` is a `Table<Record>`. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        'void stats() const {',
        '    if (records_.size() == 0) {',
        '        std::cout << "Empty\\n";',
        '        return;',
        '    }',
        '    std::vector<int> amounts;',
        '    records_.for_each([&amounts](const Record &r) { amounts.push_back(r.amount()); });',
        '    Stats<int> s(amounts);',
        '    std::cout << "Min: " << s.min() << "  Max: " << s.max();',
        '    std::cout << "  Mean: " << std::fixed << std::setprecision(2) << s.mean() << "\\n";',
        '}',
      ],
      distractors: [
        '    records_.for_each([amounts](const Record &r) { amounts.push_back(r.amount()); });',
        '    std::cout << "  Mean: " << std::setprecision(2) << s.mean() << "\\n";',
      ],
      explanation: 'Capturing `amounts` by value gives the lambda its own copy, and a lambda may not modify a by-value capture anyway: capture by reference with `&`. Without std::fixed, setprecision(2) means two significant digits, so 35.0 would print as 35, not 35.00.',
    },
    {
      kind: 'create',
      prompt: 'Build Vault++ v0.5. Keep the v0.4 behaviour: loop printing `Command?`; `1` asks `Name?` (word) and `Amount?` (int) and prints `Added`; `2` prints the records sorted by name as `<name>: <amount>`, then `Records: <n>`, then `Total: <t>`; `4` asks `Name?` and prints `<name>: <amount>` or `Not found`; `5` prints `Undone` or `Nothing to undo`; `3` prints `Bye` and stops; anything else prints `Unknown command`. New: `6` prints `Min: <a>  Max: <b>  Mean: <x.xx>` (two spaces between fields) or `Empty`. Use `Table<T>` inside `Vault`, `Stats<T>` for the numbers, and hold the Vault through `std::unique_ptr`.',
      language: 'cpp',
      tests: [
        { description: 'stats on an empty vault', stdin: '6\n3', expectedStdout: 'Command?\nEmpty\nCommand?\nBye' },
        { description: 'two records, stats', stdin: '1\nrent\n50\n1\nfood\n20\n6\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nMin: 20  Max: 50  Mean: 35.00\nCommand?\nBye' },
        { description: 'three records, fractional mean, sorted list', stdin: '1\nrent\n10\n1\nfood\n15\n1\nbus\n16\n6\n2\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nMin: 10  Max: 16  Mean: 13.67\nCommand?\nbus: 16\nfood: 15\nrent: 10\nRecords: 3\nTotal: 41\nCommand?\nBye' },
        { description: 'undo changes the stats', stdin: '1\nrent\n50\n1\nfood\n20\n5\n6\n5\n5\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nAmount?\nAdded\nCommand?\nUndone\nCommand?\nMin: 50  Max: 50  Mean: 50.00\nCommand?\nUndone\nCommand?\nNothing to undo\nCommand?\nBye' },
        { description: 'find and unknown command still work', stdin: '1\nrent\n50\n4\nrent\n4\nbus\n9\n3', expectedStdout: 'Command?\nName?\nAmount?\nAdded\nCommand?\nName?\nrent: 50\nCommand?\nName?\nNot found\nCommand?\nUnknown command\nCommand?\nBye' },
      ],
      hint: 'Order of work: paste Table<T> (add, remove_last, size, items, for_each) and Stats<T>; write Record; write Vault around a Table<Record>; then the command loop. For `list`, copy `items()` into a local vector and std::sort it with a lambda on name().',
      solution: cpp`
#include <algorithm>
#include <iomanip>
#include <iostream>
#include <memory>
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
private:
    Table<Record> records_;
};

int main() {
    auto vault = std::make_unique<Vault>();
    int cmd;
    while (true) {
        std::cout << "Command?\n";
        if (!(std::cin >> cmd)) break;
        if (cmd == 1) {
            std::string name;
            int amount;
            std::cout << "Name?\n";
            std::cin >> name;
            std::cout << "Amount?\n";
            std::cin >> amount;
            vault->add(Record(name, amount));
            std::cout << "Added\n";
        } else if (cmd == 2) {
            vault->list();
        } else if (cmd == 3) {
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
      projectNote: 'Vault++ v0.5: the Vault is built on your own generic Table<Record>, and a generic Stats<int> answers the new stats command. Module 6 makes it survive a restart.',
    },
  ],
};

export const m5: Module = {
  id: 'cpp-m5',
  title: 'Templates and generic code',
  goal: 'Function and class templates, concepts, where the compiler errors come from.',
  projectMilestone: 'Vault++ v0.5: a generic Table<T>.',
  status: 'available',
  lessons: [l51, l52, l53, l54],
};
