import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 2: Vectors and algorithms                                   */
/* std::vector replaces malloc/realloc/free; algorithms replace the   */
/* hand-written loops of the C track; lambdas replace qsort callbacks.*/
/* ------------------------------------------------------------------ */

const r = String.raw;

const l21: Lesson = {
  id: 'cpp-2-1',
  title: 'A box that grows',
  objective: 'Store a growing list of values in a std::vector and visit them with a range-for loop.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.2.vector', term: 'std::vector<int> v;', kind: 'builtin', meaning: 'A growable array of one element type. It owns its memory, grows as you append, and frees itself when it goes out of scope. Needs #include <vector>.', example: '#include <vector>\nstd::vector<int> amounts;\nstd::vector<std::string> names;', analogy: 'A Python list that may hold only one type. The analogy breaks at indexing: v[i] does no bounds check at all, and there is no negative indexing.' },
    { id: 'cpp.2.push-back', term: 'v.push_back(x)', kind: 'builtin', meaning: 'Append x at the end, growing the storage if needed. The only way to make a vector longer that this module uses.', example: 'amounts.push_back(40);' },
    { id: 'cpp.2.at', term: 'v[i] vs v.at(i)', kind: 'builtin', meaning: 'Both read element i. v[i] is as fast and as unchecked as a C array: a bad index is undefined behaviour. v.at(i) checks and throws std::out_of_range. v.size() is the count, as an unsigned std::size_t.', example: 'int first = amounts[0];\nint safe = amounts.at(0);' },
    { id: 'cpp.2.range-for', term: 'for (int x : v) { ... }', kind: 'pattern', meaning: 'Visit each element in order, copying it into x. No index, no size, no off-by-one. The body may not push_back into the vector it is walking.', example: 'for (int x : amounts) {\n    total += x;\n}', analogy: 'Python\'s `for x in xs:` with a colon instead of `in`. It breaks in that x is a fresh copy each time: assigning to x changes nothing in the vector.' },
    { id: 'cpp.2.const-auto-ref', term: 'for (const auto &x : v)', kind: 'pattern', meaning: 'Visit each element by reference without copying it (matters for strings and other big elements). Drop const to modify the elements in place.', example: 'for (const auto &name : names) {\n    std::cout << name << \'\\n\';\n}\nfor (auto &a : amounts) {\n    a = a * 2;\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'malloc, realloc and free in one word',
      body: `In the C Vault a list of amounts was \`int *amounts = malloc(cap * sizeof(int))\`, a separate \`count\`, a \`realloc\` when it filled up, and a \`free\` you must not forget. \`std::vector<int>\` is all of that in one object: \`push_back\` appends and grows, \`size()\` is the count, and the memory is released when the vector goes out of scope.

\`v[i]\` indexes exactly like a C array, with the same lack of checking. \`v.at(i)\` checks the index and throws \`std::out_of_range\` if it is bad.

\`size()\` returns an **unsigned** \`std::size_t\`. Comparing it with an \`int\` index is a warning under \`-Wall\`, and this track treats warnings as errors, so index loops use \`std::size_t i\`. Most of the time you do not need an index at all: the **range-for** \`for (int x : v)\` visits every element. Write \`const auto &x\` to avoid copying big elements, and \`auto &x\` to change them in place.`,
      example: {
        language: 'cpp',
        source: r`#include <iostream>
#include <vector>

int main() {
    std::vector<int> amounts;
    amounts.push_back(40);
    amounts.push_back(-15);
    amounts.push_back(25);
    int total = 0;
    for (int x : amounts) {
        total = total + x;
    }
    for (std::size_t i = 0; i < amounts.size(); ++i) {
        std::cout << "#" << i + 1 << ": " << amounts[i] << '\n';
    }
    std::cout << "Records: " << amounts.size() << '\n';
    std::cout << "Total: " << total << '\n';
    return 0;
}`,
        labels: [
          { lines: [5, 5], label: 'An empty vector. No capacity to choose.' },
          { lines: [6, 8], label: 'Append three values; the vector grows by itself.' },
          { lines: [9, 12], label: 'Range-for: each element in turn, copied into x.' },
          { lines: [13, 15], label: 'When you need the index: std::size_t, to match size().' },
          { lines: [16, 17], label: 'size() is the count. No separate variable to keep in sync.' },
        ],
      },
      contrast: [
        { from: 'c', note: '`int *a = malloc(cap * sizeof(int)); ... realloc ...; free(a);` plus a `count` becomes `std::vector<int> a;` plus `push_back`. `a[i]` is unchanged and equally unchecked. A C array decays to a pointer and forgets its length; a vector always knows its size(). The vector is freed for you, so there is no leak and no double free.' },
        { from: 'python', note: '`xs.append(x)` is `v.push_back(x)`; `len(xs)` is `v.size()`; `for x in xs:` is `for (int x : v)`. Unlike a list, a vector holds one type, and `v[99]` on a short vector does not raise IndexError: it is undefined behaviour. Use `.at()` for the checked version.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What happens when this runs?',
      code: {
        language: 'cpp',
        source: r`#include <iostream>
#include <vector>
int main() {
    std::vector<int> v;
    v.push_back(5);
    v.push_back(8);
    std::cout << v.at(1) << '\n';
    std::cout << v.at(2) << '\n';
    std::cout << "done\n";
    return 0;
}`,
      },
      choices: ['8 is printed, then the program terminates with an out_of_range error', '8\n0\ndone', '8\ngarbage\ndone', 'a compile error: index 2 does not exist'],
      answer: '8 is printed, then the program terminates with an out_of_range error',
      explanation: 'The vector has two elements, at indices 0 and 1. `v.at(2)` checks the index, finds it out of range and throws std::out_of_range; nothing catches it, so the program terminates and `done` never prints. With `v[2]` there would be no check: undefined behaviour, probably garbage. The compiler cannot know the size at compile time, so there is no compile error. Module 6 shows how to catch exceptions.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that reads a count `n`, then n amounts into a vector, and prints them one per line. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        '#include <vector>',
        'int main() {',
        '    std::vector<int> amounts;',
        '    int n = 0;',
        '    std::cin >> n;',
        '    for (int i = 0; i < n; ++i) {',
        '        int a = 0;',
        '        std::cin >> a;',
        '        amounts.push_back(a);',
        '    }',
        '    for (int x : amounts) {',
        '        std::cout << x << \'\\n\';',
        '    }',
        '    return 0;',
        '}',
      ],
      distractors: ['    int amounts[n];', '        amounts[i] = a;', '    for (int x in amounts) {'],
      explanation: 'A variable-length C array is the old habit (and not standard C++); `amounts[i]` on an empty vector writes past its size, which is undefined behaviour, because indexing never grows a vector; and the range-for uses a colon, not Python\'s `in`.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program stores two names, prints each without copying it, then prints the count.',
      language: 'cpp',
      template: '#include <iostream>\n#include <string>\n#include <vector>\nint main() {\n    {{decl}} names;\n    names.{{pb}}("Ada");\n    names.push_back("Sam");\n    for ({{ref}} name : names) {\n        std::cout << name << \'\\n\';\n    }\n    std::cout << names.{{sz}} << \'\\n\';\n    return 0;\n}',
      blanks: [
        { id: 'decl', answers: ['std::vector<std::string>'], hint: 'a vector whose element type is the string type' },
        { id: 'pb', answers: ['push_back'], hint: 'append at the end' },
        { id: 'ref', answers: ['const auto &', 'const auto&', 'const std::string &', 'const std::string&'], hint: 'read each element by reference, no copy' },
        { id: 'sz', answers: ['size()'], hint: 'the count, as a member call' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program can only hold exactly three amounts. Change it to read a count `n` first, then n amounts into a std::vector, and print `Records: <n>` before `Total: <t>`.',
      language: 'cpp',
      starter: r`#include <iostream>

int main() {
    int amounts[3];
    for (int i = 0; i < 3; ++i) {
        std::cin >> amounts[i];
    }
    int total = 0;
    for (int i = 0; i < 3; ++i) {
        total = total + amounts[i];
    }
    std::cout << "Total: " << total << '\n';
    return 0;
}
`,
      tests: [
        { description: 'three amounts', stdin: '3\n10 20 30', expectedStdout: 'Records: 3\nTotal: 60' },
        { description: 'no amounts', stdin: '0', expectedStdout: 'Records: 0\nTotal: 0' },
        { description: 'five amounts', stdin: '5\n1 2 3 4 5', expectedStdout: 'Records: 5\nTotal: 15' },
      ],
      hint: 'Read n, then push_back n values in a loop. Use a range-for for the total and `.size()` for the count.',
      solution: r`#include <iostream>
#include <vector>

int main() {
    std::vector<int> amounts;
    int n = 0;
    std::cin >> n;
    for (int i = 0; i < n; ++i) {
        int a = 0;
        std::cin >> a;
        amounts.push_back(a);
    }
    int total = 0;
    for (int x : amounts) {
        total = total + x;
    }
    std::cout << "Records: " << amounts.size() << '\n';
    std::cout << "Total: " << total << '\n';
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Ask `Records?` and read n. Then n times: ask `Amount?` and read an int, storing it in a std::vector. Afterwards print each amount as `#<i>: <amount>` (numbered from 1, using an index loop with std::size_t), then `Records: <n>`.',
      language: 'cpp',
      tests: [
        { description: 'two amounts', stdin: '2\n40\n-15', expectedStdout: 'Records?\nAmount?\nAmount?\n#1: 40\n#2: -15\nRecords: 2' },
        { description: 'no amounts', stdin: '0', expectedStdout: 'Records?\nRecords: 0' },
        { description: 'three amounts', stdin: '3\n5\n5\n7', expectedStdout: 'Records?\nAmount?\nAmount?\nAmount?\n#1: 5\n#2: 5\n#3: 7\nRecords: 3' },
      ],
      hint: 'The index loop is `for (std::size_t i = 0; i < amounts.size(); ++i)`; the number shown is `i + 1`.',
      solution: r`#include <iostream>
#include <vector>

int main() {
    std::vector<int> amounts;
    int n = 0;
    std::cout << "Records?\n";
    std::cin >> n;
    for (int i = 0; i < n; ++i) {
        int a = 0;
        std::cout << "Amount?\n";
        std::cin >> a;
        amounts.push_back(a);
    }
    for (std::size_t i = 0; i < amounts.size(); ++i) {
        std::cout << "#" << i + 1 << ": " << amounts[i] << '\n';
    }
    std::cout << "Records: " << amounts.size() << '\n';
    return 0;
}
`,
      projectNote: 'Vault++ keeps its amounts in a std::vector<int>: no malloc, no capacity, no free.',
    },
  ],
};

const l22: Lesson = {
  id: 'cpp-2-2',
  title: 'Algorithms over positions',
  objective: 'Sort, sum, search and find the maximum of a vector with standard algorithms and iterators.',
  minutes: 22,
  lexicon: [
    { id: 'cpp.2.iterator', term: 'v.begin() / v.end() / *it', kind: 'concept', meaning: 'An iterator is a position in a container. begin() is the first element\'s position, end() is one past the last (not an element: never read it). *it reads the element at a position, like *p on a pointer. A pointer into a C array is an iterator.', example: 'auto it = v.begin();\nstd::cout << *it;   // first element', analogy: 'A bookmark between pages, not the page itself. It breaks at end(): that bookmark sits after the last page, where there is nothing to read.' },
    { id: 'cpp.2.sort', term: 'std::sort(v.begin(), v.end())', kind: 'builtin', meaning: 'Sort the range in place, ascending, using <. From <algorithm>. Replaces qsort and its comparator function.', example: '#include <algorithm>\nstd::sort(amounts.begin(), amounts.end());' },
    { id: 'cpp.2.max-element', term: 'std::max_element(b, e)', kind: 'builtin', meaning: 'The position of the largest element in the range (the first one if tied). Dereference with * to get the value. On an empty range it returns e, so check for empty first. std::min_element is its twin.', example: 'auto it = std::max_element(v.begin(), v.end());\nif (it != v.end()) {\n    std::cout << *it;\n}' },
    { id: 'cpp.2.find', term: 'std::find(b, e, x)', kind: 'builtin', meaning: 'The position of the first element equal to x, or e if there is none. Always compare with end() before dereferencing.', example: 'auto hit = std::find(v.begin(), v.end(), 25);\nif (hit != v.end()) {\n    std::cout << "Found\\n";\n}' },
    { id: 'cpp.2.accumulate', term: 'std::accumulate(b, e, 0)', kind: 'builtin', meaning: 'Add up the range, starting from the third argument. That argument\'s type is the type of the sum: 0 gives an int, 0.0 a double. From <numeric>, not <algorithm>.', example: '#include <numeric>\nint total = std::accumulate(v.begin(), v.end(), 0);' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Hand the loop to the library',
      body: `The C Vault sorted with \`qsort\`, a comparator function and \`sizeof\`, and wrote its own loops for sum, maximum and search. C++ ships those loops as **algorithms** that work on a pair of **positions**.

An **iterator** is a position in a container. \`v.begin()\` is the position of the first element, \`v.end()\` is **one past the last**: it marks where the range stops, like \`\\0\` marks the end of a C string, and there is nothing to read there. \`*it\` reads the element at a position, exactly as \`*p\` reads through a pointer.

Every algorithm takes \`begin, end\`. \`std::sort\` orders in place. \`std::max_element\` and \`std::find\` **return a position**: dereference it with \`*\` to get the value, and compare it with \`end()\` first, because that is how they say "nothing found". \`std::accumulate\` (from \`<numeric>\`) sums from a starting value whose type becomes the type of the sum.`,
      example: {
        language: 'cpp',
        source: r`#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> amounts{40, -15, 25};
    std::sort(amounts.begin(), amounts.end());
    for (int x : amounts) {
        std::cout << x << '\n';
    }
    auto biggest = std::max_element(amounts.begin(), amounts.end());
    std::cout << "Max: " << *biggest << '\n';
    int total = std::accumulate(amounts.begin(), amounts.end(), 0);
    std::cout << "Total: " << total << '\n';
    auto hit = std::find(amounts.begin(), amounts.end(), 25);
    if (hit != amounts.end()) {
        std::cout << "Found 25\n";
    }
    return 0;
}`,
        labels: [
          { lines: [1, 4], label: 'Algorithms live in <algorithm>; accumulate in <numeric>.' },
          { lines: [7, 7], label: 'Brace initialisation fills the vector with three values.' },
          { lines: [8, 11], label: 'Sort ascending in place, then print: -15, 25, 40.' },
          { lines: [12, 13], label: 'A position, not a value: * reads the 40. Safe here because the vector is not empty.' },
          { lines: [14, 15], label: 'Sum from 0 (an int, so the sum is an int).' },
          { lines: [16, 19], label: 'A position or end(). Check before using it.' },
        ],
      },
      contrast: [
        { from: 'c', note: '`qsort(a, n, sizeof(int), compare)` with a `compare(const void *, const void *)` function becomes `std::sort(a.begin(), a.end())`: the element type is known, so no sizeof and no void* casts. `strchr` returning NULL is the same idea as `std::find` returning end(). Your hand-written max loop had the "start from 0" bug on all-negative data; max_element does not.' },
        { from: 'python', note: '`xs.sort()`, `max(xs)`, `sum(xs)` and `x in xs` map to sort, max_element, accumulate and find. The difference: the C++ versions return positions, so you add `*` to read the value and compare with end() to test "not found".' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: {
        language: 'cpp',
        source: r`#include <algorithm>
#include <iostream>
#include <vector>
int main() {
    std::vector<int> v{3, 9, 4};
    auto it = std::find(v.begin(), v.end(), 9);
    auto miss = std::find(v.begin(), v.end(), 7);
    std::cout << *it << ' ' << (miss == v.end()) << '\n';
    return 0;
}`,
      },
      choices: ['9 1', '9 0', '1 1', '9 then a crash'],
      answer: '9 1',
      explanation: '`it` is the position of the 9, and `*it` reads it. 7 is not in the vector, so `miss` equals `v.end()`; the comparison is true and a bool streams as 1. The program never dereferences `miss`, which is why there is no crash: `*miss` would have been undefined behaviour.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that sorts `{5, 1, 4}` ascending, prints the values one per line, then prints `Max: 5`. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <algorithm>',
        '#include <iostream>',
        '#include <vector>',
        'int main() {',
        '    std::vector<int> v{5, 1, 4};',
        '    std::sort(v.begin(), v.end());',
        '    for (int x : v) {',
        '        std::cout << x << \'\\n\';',
        '    }',
        '    auto it = std::max_element(v.begin(), v.end());',
        '    std::cout << "Max: " << *it << \'\\n\';',
        '    return 0;',
        '}',
      ],
      distractors: ['    std::sort(v);', '    std::cout << "Max: " << it << \'\\n\';', '    qsort(v, 3, sizeof(int), compare);'],
      explanation: '`std::sort` wants a pair of positions, not the container; `it` is a position and must be dereferenced with `*` to print the value; and qsort is the C habit the algorithm replaces.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program sorts, sums and searches, printing `9` then `18`.',
      language: 'cpp',
      template: '#include <algorithm>\n#include <iostream>\n#include <numeric>\n#include <vector>\nint main() {\n    std::vector<int> v{7, 2, 9};\n    std::sort(v.{{b}}, v.{{e}});\n    int total = std::{{acc}}(v.begin(), v.end(), 0);\n    auto it = std::find(v.begin(), v.end(), 9);\n    if (it {{ne}} v.end()) {\n        std::cout << {{deref}}it << \'\\n\';\n    }\n    std::cout << total << \'\\n\';\n    return 0;\n}',
      blanks: [
        { id: 'b', answers: ['begin()'], hint: 'the first position' },
        { id: 'e', answers: ['end()'], hint: 'one past the last' },
        { id: 'acc', answers: ['accumulate'], hint: 'the <numeric> algorithm that sums' },
        { id: 'ne', answers: ['!='], hint: '"found" means the position is not the end' },
        { id: 'deref', answers: ['*'], hint: 'read the element at a position' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The hand-written maximum starts from 0, so it is wrong for all-negative data, and the list is printed unsorted. Replace the loops with std::sort, std::max_element and std::accumulate, print the amounts sorted ascending, and print `Empty` instead of a maximum when there are no amounts.',
      language: 'cpp',
      starter: r`#include <iostream>
#include <vector>

int main() {
    std::vector<int> amounts;
    int n = 0;
    std::cin >> n;
    for (int i = 0; i < n; ++i) {
        int a = 0;
        std::cin >> a;
        amounts.push_back(a);
    }
    for (int x : amounts) {
        std::cout << x << '\n';
    }
    int biggest = 0;
    int total = 0;
    for (int x : amounts) {
        if (x > biggest) {
            biggest = x;
        }
        total = total + x;
    }
    std::cout << "Max: " << biggest << '\n';
    std::cout << "Total: " << total << '\n';
    return 0;
}
`,
      tests: [
        { description: 'mixed amounts', stdin: '3\n40 -15 25', expectedStdout: '-15\n25\n40\nMax: 40\nTotal: 50' },
        { description: 'all negative', stdin: '2\n-5 -9', expectedStdout: '-9\n-5\nMax: -5\nTotal: -14' },
        { description: 'empty', stdin: '0', expectedStdout: 'Empty\nTotal: 0' },
      ],
      hint: 'Sort before printing. `amounts.empty()` tells you whether max_element may be dereferenced. accumulate needs <numeric>.',
      solution: r`#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> amounts;
    int n = 0;
    std::cin >> n;
    for (int i = 0; i < n; ++i) {
        int a = 0;
        std::cin >> a;
        amounts.push_back(a);
    }
    std::sort(amounts.begin(), amounts.end());
    for (int x : amounts) {
        std::cout << x << '\n';
    }
    if (amounts.empty()) {
        std::cout << "Empty\n";
    } else {
        auto biggest = std::max_element(amounts.begin(), amounts.end());
        std::cout << "Max: " << *biggest << '\n';
    }
    int total = std::accumulate(amounts.begin(), amounts.end(), 0);
    std::cout << "Total: " << total << '\n';
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Ask `Records?` and read n, then n times ask `Amount?` and read an int into a vector. Print the amounts sorted ascending, one per line; then `Total: <t>`; then `Max: <m>` or `Empty` if there are none. Finally ask `Target?`, read an int, and print `Found` or `Not found`.',
      language: 'cpp',
      tests: [
        { description: 'target present', stdin: '3\n40\n-15\n25\n25', expectedStdout: 'Records?\nAmount?\nAmount?\nAmount?\n-15\n25\n40\nTotal: 50\nMax: 40\nTarget?\nFound' },
        { description: 'target absent', stdin: '2\n7\n3\n5', expectedStdout: 'Records?\nAmount?\nAmount?\n3\n7\nTotal: 10\nMax: 7\nTarget?\nNot found' },
        { description: 'no records', stdin: '0\n1', expectedStdout: 'Records?\nTotal: 0\nEmpty\nTarget?\nNot found' },
      ],
      hint: 'Four algorithms, one each: sort, accumulate, max_element (guarded by empty()), find (compared with end()).',
      solution: r`#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> amounts;
    int n = 0;
    std::cout << "Records?\n";
    std::cin >> n;
    for (int i = 0; i < n; ++i) {
        int a = 0;
        std::cout << "Amount?\n";
        std::cin >> a;
        amounts.push_back(a);
    }
    std::sort(amounts.begin(), amounts.end());
    for (int x : amounts) {
        std::cout << x << '\n';
    }
    std::cout << "Total: " << std::accumulate(amounts.begin(), amounts.end(), 0) << '\n';
    if (amounts.empty()) {
        std::cout << "Empty\n";
    } else {
        std::cout << "Max: " << *std::max_element(amounts.begin(), amounts.end()) << '\n';
    }
    int target = 0;
    std::cout << "Target?\n";
    std::cin >> target;
    auto hit = std::find(amounts.begin(), amounts.end(), target);
    std::cout << (hit != amounts.end() ? "Found" : "Not found") << '\n';
    return 0;
}
`,
      projectNote: 'Vault++ lists sorted, totals and finds its maximum with algorithms instead of hand-written loops.',
    },
  ],
};

const l23: Lesson = {
  id: 'cpp-2-3',
  title: 'Functions without names',
  objective: 'Write lambdas to customise sort and count_if, and choose between capturing by value and by reference.',
  minutes: 20,
  lexicon: [
    { id: 'cpp.2.lambda', term: '[](int a, int b) { return a > b; }', kind: 'pattern', meaning: 'A lambda: a function written where it is used. [] is the capture list, then parameters, then a body; the return type is deduced. Pass it to an algorithm or store it in an auto variable and call it.', example: 'std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });   // descending\nauto is_neg = [](int x) { return x < 0; };', analogy: 'A clause instead of a named definition: "sort them, bigger first" rather than "define bigger_first, then sort with it". It breaks in that a lambda is a real object with a type of its own, not just a phrase.' },
    { id: 'cpp.2.capture-val', term: '[=] / [limit]', kind: 'pattern', meaning: 'Capture by value: the lambda stores a COPY of the outer variables it uses, taken when the lambda is created. Later changes to the originals are not seen; the copies cannot be modified.', example: 'int limit = 10;\nauto is_big = [limit](int x) { return x > limit; };' },
    { id: 'cpp.2.capture-ref', term: '[&]', kind: 'pattern', meaning: 'Capture by reference: the lambda uses the outer variables themselves, sees their current values and may modify them. Only safe while those variables are still alive.', example: 'int total = 0;\nauto add = [&](int x) { total += x; };\nadd(5);   // total is 5' },
    { id: 'cpp.2.count-if', term: 'std::count_if(b, e, pred)', kind: 'builtin', meaning: 'Count the elements for which pred returns true. pred is usually a lambda. The result is a signed count (std::ptrdiff_t); store it with auto.', example: 'auto negatives = std::count_if(v.begin(), v.end(), [](int x) { return x < 0; });' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Write the function where you need it',
      body: `To sort descending in C you wrote a separate \`compare\` function, cast two \`void *\`, and handed its name to \`qsort\`. If the comparison needed a local value (a limit, a threshold) you had no way to pass it in.

A **lambda** is a function written in place: \`[](int a, int b) { return a > b; }\`. The square brackets are the **capture list**, then come parameters and a body; the return type is deduced. You pass it straight to an algorithm (\`std::sort\` takes it as a third argument; \`std::count_if\` counts the elements for which it is true) or store it in an \`auto\` variable and call it like a function.

The capture list is what qsort could never do. \`[]\` sees nothing from the enclosing scope. \`[=]\` (or \`[limit]\`) **copies** the outer variables it uses, at the moment the lambda is created. \`[&]\` uses the outer variables **themselves**: it sees later changes and can modify them.`,
      example: {
        language: 'cpp',
        source: r`#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> amounts{40, -15, 25, -3};
    int limit = 20;
    auto is_big = [limit](int x) { return x > limit; };
    std::sort(amounts.begin(), amounts.end(), [](int a, int b) { return a > b; });
    for (int x : amounts) {
        std::cout << x << ' ';
    }
    std::cout << '\n';
    auto big = std::count_if(amounts.begin(), amounts.end(), is_big);
    std::cout << "Big: " << big << '\n';
    int total = 0;
    auto add = [&](int x) { total = total + x; };
    add(40);
    add(-15);
    std::cout << "Total: " << total << '\n';
    return 0;
}`,
        labels: [
          { lines: [7, 8], label: 'A lambda stored in a variable; it copies limit (20) now.' },
          { lines: [9, 9], label: 'Sort descending: the third argument says what "comes first" means.' },
          { lines: [10, 13], label: 'Prints 40 25 -3 -15.' },
          { lines: [14, 15], label: 'Count the elements the predicate accepts: 2.' },
          { lines: [16, 19], label: '[&] lets the lambda change the real total. Called like any function.' },
          { lines: [20, 20], label: 'Total: 25.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'C: `int desc(const void *a, const void *b) { return *(const int *)b - *(const int *)a; }` plus `qsort(v, n, sizeof(int), desc)`. C++: `std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; })`. The comparator must mean strictly "a comes before b": `a > b`, never `a >= b`, which breaks sort. Function pointers still exist in C++, but a lambda can also capture local variables, which a plain function cannot.' },
        { from: 'python', note: '`lambda a, b: a > b` and `sorted(xs, reverse=True)` are the Python shapes. Python closures always see the current value of outer variables (like `[&]`); C++ makes you choose between a snapshot `[=]` and a live reference `[&]`.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: {
        language: 'cpp',
        source: r`#include <iostream>
int main() {
    int limit = 10;
    auto by_value = [=](int x) { return x > limit; };
    auto by_ref = [&](int x) { return x > limit; };
    limit = 100;
    std::cout << by_value(50) << ' ' << by_ref(50) << '\n';
    return 0;
}`,
      },
      choices: ['1 0', '0 1', '1 1', '0 0'],
      answer: '1 0',
      explanation: '`by_value` copied limit when it was created, so it still compares with 10: 50 > 10 is true (1). `by_ref` refers to the real limit, which is now 100: 50 > 100 is false (0). Capture by value is a snapshot; capture by reference is live.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that sorts `{3, -1, 8, -6}` descending, prints the values one per line, then prints `Negatives: 2`. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <algorithm>',
        '#include <iostream>',
        '#include <vector>',
        'int main() {',
        '    std::vector<int> v{3, -1, 8, -6};',
        '    std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });',
        '    for (int x : v) {',
        '        std::cout << x << \'\\n\';',
        '    }',
        '    auto negatives = std::count_if(v.begin(), v.end(), [](int x) { return x < 0; });',
        '    std::cout << "Negatives: " << negatives << \'\\n\';',
        '    return 0;',
        '}',
      ],
      distractors: [
        '    std::sort(v.begin(), v.end(), [](int a, int b) { return a >= b; });',
        '    std::sort(v.begin(), v.end(), int compare(int a, int b));',
        '    auto negatives = std::count_if(v.begin(), v.end(), x < 0);',
      ],
      explanation: '`a >= b` is not a strict ordering and makes std::sort misbehave; a function declaration is not a value you can pass; and `x < 0` on its own is an expression evaluated once, not a function: wrap it in a lambda.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program counts the values above `limit`, sorts descending and prints `2 9`.',
      language: 'cpp',
      template: '#include <algorithm>\n#include <iostream>\n#include <vector>\nint main() {\n    std::vector<int> v{4, 9, 1};\n    int limit = 3;\n    auto is_above = {{cap}}(int x) { return x > limit; };\n    auto n = std::count_if(v.begin(), v.end(), {{pass}});\n    std::sort(v.begin(), v.end(), [](int a, int b) { return a {{op}} b; });\n    std::cout << n << \' \' << v[0] << \'\\n\';\n    return 0;\n}',
      blanks: [
        { id: 'cap', answers: ['[limit]', '[=]', '[&]'], hint: 'the lambda must be allowed to see limit' },
        { id: 'pass', answers: ['is_above'], hint: 'the stored lambda, passed like a value' },
        { id: 'op', answers: ['>'], hint: 'descending means a comes first when it is bigger' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program sorts ascending and counts with a hard-coded threshold of 10. Change it to read the limit from input, sort descending, and count the amounts strictly above the limit the user typed.',
      language: 'cpp',
      starter: r`#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> amounts;
    int limit = 0;
    int n = 0;
    std::cout << "Limit?\n";
    std::cin >> limit;
    std::cout << "Records?\n";
    std::cin >> n;
    for (int i = 0; i < n; ++i) {
        int a = 0;
        std::cin >> a;
        amounts.push_back(a);
    }
    std::sort(amounts.begin(), amounts.end());
    for (int x : amounts) {
        std::cout << x << '\n';
    }
    auto above = std::count_if(amounts.begin(), amounts.end(), [](int x) { return x > 10; });
    std::cout << "Above: " << above << '\n';
    return 0;
}
`,
      tests: [
        { description: 'limit 20', stdin: '20\n4\n40 -15 25 -3', expectedStdout: 'Limit?\nRecords?\n40\n25\n-3\n-15\nAbove: 2' },
        { description: 'limit 0', stdin: '0\n3\n5 -5 0', expectedStdout: 'Limit?\nRecords?\n5\n0\n-5\nAbove: 1' },
        { description: 'no records', stdin: '7\n0', expectedStdout: 'Limit?\nRecords?\nAbove: 0' },
      ],
      hint: 'The counting lambda cannot see `limit` with an empty capture list: write `[limit]` or `[&]`. Give std::sort a comparator with `>`.',
      solution: r`#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> amounts;
    int limit = 0;
    int n = 0;
    std::cout << "Limit?\n";
    std::cin >> limit;
    std::cout << "Records?\n";
    std::cin >> n;
    for (int i = 0; i < n; ++i) {
        int a = 0;
        std::cin >> a;
        amounts.push_back(a);
    }
    std::sort(amounts.begin(), amounts.end(), [](int a, int b) { return a > b; });
    for (int x : amounts) {
        std::cout << x << '\n';
    }
    auto above = std::count_if(amounts.begin(), amounts.end(), [limit](int x) { return x > limit; });
    std::cout << "Above: " << above << '\n';
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Read n, then n amounts (on one line). Print `Expenses: <count of negative amounts>` and `Income: <count of positive amounts>`. Then print the amounts sorted by absolute value, smallest first, one per line (use `std::abs` from <cstdlib> inside the comparator).',
      language: 'cpp',
      tests: [
        { description: 'mixed', stdin: '4\n40 -15 25 -3', expectedStdout: 'Expenses: 2\nIncome: 2\n-3\n-15\n25\n40' },
        { description: 'none', stdin: '0', expectedStdout: 'Expenses: 0\nIncome: 0' },
        { description: 'with a zero', stdin: '4\n-7 2 0 -1', expectedStdout: 'Expenses: 2\nIncome: 1\n0\n-1\n2\n-7' },
      ],
      hint: 'Two count_if calls with one-line lambdas, then a sort whose comparator returns `std::abs(a) < std::abs(b)`.',
      solution: r`#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> amounts;
    int n = 0;
    std::cin >> n;
    for (int i = 0; i < n; ++i) {
        int a = 0;
        std::cin >> a;
        amounts.push_back(a);
    }
    auto expenses = std::count_if(amounts.begin(), amounts.end(), [](int x) { return x < 0; });
    auto income = std::count_if(amounts.begin(), amounts.end(), [](int x) { return x > 0; });
    std::cout << "Expenses: " << expenses << '\n';
    std::cout << "Income: " << income << '\n';
    std::sort(amounts.begin(), amounts.end(), [](int a, int b) { return std::abs(a) < std::abs(b); });
    for (int x : amounts) {
        std::cout << x << '\n';
    }
    return 0;
}
`,
      projectNote: 'Vault++ can classify and order its amounts with one-line lambdas instead of named comparator functions.',
    },
  ],
};

const l24: Lesson = {
  id: 'cpp-2-4',
  title: 'Text to numbers and back',
  objective: 'Convert between strings and numbers, build strings with a stream, and split a line into words.',
  minutes: 22,
  lexicon: [
    { id: 'cpp.2.stoi', term: 'std::stoi(s)', kind: 'builtin', meaning: 'Convert a string to an int. Leading whitespace is skipped and parsing stops at the first non-digit; if there are no digits at all it throws std::invalid_argument (std::out_of_range if too big). Unlike atoi it never silently returns 0.', example: 'int n = std::stoi("42");   // 42' },
    { id: 'cpp.2.to-string', term: 'std::to_string(n)', kind: 'builtin', meaning: 'Convert a number to its decimal text as a std::string, ready to join with +.', example: 'std::string label = "Total: " + std::to_string(total);' },
    { id: 'cpp.2.ostringstream', term: 'std::ostringstream out;', kind: 'builtin', meaning: 'A std::cout that writes into a string instead of the screen. Use << as usual, then out.str() to get the text. From <sstream>. Replaces sprintf and its buffer.', example: '#include <sstream>\nstd::ostringstream out;\nout << "Records: " << n;\nstd::string line = out.str();' },
    { id: 'cpp.2.istringstream', term: 'std::istringstream in(line);', kind: 'builtin', meaning: 'A std::cin that reads from a string. `while (in >> word)` reads one whitespace-separated word per iteration and stops at the end of the string: the C++ way to split a line.', example: 'std::istringstream in(line);\nstd::string word;\nwhile (in >> word) {\n    words.push_back(word);\n}' },
    { id: 'cpp.2.vector-string', term: 'std::vector<std::string>', kind: 'pattern', meaning: 'A growable list of strings. Each element owns its characters, so there is no char** and no per-string malloc.', example: 'std::vector<std::string> words;\nwords.push_back("add");' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Streams work on strings too',
      body: `The C Vault converted text with \`atoi\` (which returns 0 for garbage), built text with \`sprintf\` into a buffer you had to size, and split lines with \`strtok\`, which overwrites the string it walks.

\`std::stoi("42")\` gives 42, and **throws** \`std::invalid_argument\` if the text holds no number, so a typo cannot pass as zero (Module 6 catches it). \`std::to_string(42)\` goes the other way.

Streams are not only for the screen. \`std::ostringstream\` is a \`cout\` that fills a string: push values in with \`<<\`, take the result with \`.str()\`. \`std::istringstream in(line)\` is a \`cin\` that reads from a string: \`while (in >> word)\` yields one word per loop and stops cleanly at the end. Together with a \`std::vector<std::string>\` that is how you split a line into words without touching a single \`char *\`.`,
      example: {
        language: 'cpp',
        source: r`#include <iostream>
#include <sstream>
#include <string>
#include <vector>

int main() {
    std::string line = "40 -15 25";
    std::istringstream in(line);
    std::vector<std::string> words;
    std::string word;
    while (in >> word) {
        words.push_back(word);
    }
    int total = 0;
    for (const auto &w : words) {
        total = total + std::stoi(w);
    }
    std::ostringstream out;
    out << "Records: " << words.size() << ", total " << total;
    std::string report = out.str();
    std::cout << report << '\n';
    std::cout << "Label: " + std::to_string(total) + " units\n";
    return 0;
}`,
        labels: [
          { lines: [7, 8], label: 'A string, and a stream that reads from it.' },
          { lines: [9, 13], label: 'Split: each >> yields one word; the loop ends when the string is used up.' },
          { lines: [14, 17], label: 'Convert each word to an int and sum: 50.' },
          { lines: [18, 21], label: 'Build a line in memory with <<, then take the string out.' },
          { lines: [22, 22], label: 'Number to text, joined with + like any string.' },
        ],
      },
      contrast: [
        { from: 'c', note: '`atoi(s)` becomes `std::stoi(s)` and now complains about garbage instead of returning 0. `sprintf(buf, "Records: %d", n)` becomes an ostringstream, with no buffer size to get wrong. `strtok(line, " ")` becomes `std::istringstream` plus `>>`: the line is left intact and each word is its own std::string.' },
        { from: 'python', note: '`int(s)` and `str(n)` are stoi and to_string, and both raise/throw on bad input. `line.split()` is the istringstream loop; `",".join(words)` has no one-liner, so you build it with an ostringstream.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What happens when this runs?',
      code: {
        language: 'cpp',
        source: r`#include <iostream>
#include <string>
int main() {
    std::cout << std::stoi("42") + 1 << '\n';
    std::cout << std::to_string(42) + "1" << '\n';
    std::cout << std::stoi("abc") << '\n';
    std::cout << "done\n";
    return 0;
}`,
      },
      choices: ['43 and 421 are printed, then the program terminates with std::invalid_argument', '43\n43\n0\ndone', '43\n421\n0\ndone', 'a compile error: cannot add a string and an int'],
      answer: '43 and 421 are printed, then the program terminates with std::invalid_argument',
      explanation: '`std::stoi("42") + 1` is int arithmetic: 43. `std::to_string(42) + "1"` is string concatenation: "421". `std::stoi("abc")` finds no digits and throws std::invalid_argument; nothing catches it, so the program terminates before `done`. C\'s atoi would have printed 0 and carried on, hiding the bad input.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program that reads one line, splits it into words with a string stream, and prints `Words: <count>`. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        '#include <iostream>',
        '#include <sstream>',
        '#include <string>',
        '#include <vector>',
        'int main() {',
        '    std::string line;',
        '    std::getline(std::cin, line);',
        '    std::istringstream in(line);',
        '    std::vector<std::string> words;',
        '    std::string word;',
        '    while (in >> word) {',
        '        words.push_back(word);',
        '    }',
        '    std::cout << "Words: " << words.size() << \'\\n\';',
        '    return 0;',
        '}',
      ],
      distractors: ['    char *word = strtok(line, " ");', '    while (std::cin >> word) {', '    std::string words[10];'],
      explanation: 'strtok is the C habit and does not work on a std::string; reading from std::cin instead of the string stream would ignore the line you read and wait for more input; and a fixed array of 10 strings cannot grow with the line.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete so the program prints `Answer: 42` and `Length: 2`.',
      language: 'cpp',
      template: '#include <iostream>\n#include <sstream>\n#include <string>\nint main() {\n    std::string text = "7";\n    int n = std::{{stoi}}(text) * 6;\n    std::{{oss}} out;\n    out << "Answer: " << n;\n    std::string s = out.{{str}};\n    std::cout << s << \'\\n\';\n    std::cout << "Length: " << std::{{ts}}(n).size() << \'\\n\';\n    return 0;\n}',
      blanks: [
        { id: 'stoi', answers: ['stoi'], hint: 'string to int' },
        { id: 'oss', answers: ['ostringstream'], hint: 'an output stream that fills a string' },
        { id: 'str', answers: ['str()'], hint: 'take the text out of the stream' },
        { id: 'ts', answers: ['to_string'], hint: 'int to string' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program insists on a count first. Change it to read ONE whole line with std::getline, split it with a std::istringstream, convert each word with std::stoi, and print `Total: <t>` then `Records: <number of words>`.',
      language: 'cpp',
      starter: r`#include <iostream>
#include <vector>

int main() {
    std::vector<int> amounts;
    int n = 0;
    std::cin >> n;
    for (int i = 0; i < n; ++i) {
        int a = 0;
        std::cin >> a;
        amounts.push_back(a);
    }
    int total = 0;
    for (int x : amounts) {
        total = total + x;
    }
    std::cout << "Total: " << total << '\n';
    std::cout << "Records: " << amounts.size() << '\n';
    return 0;
}
`,
      tests: [
        { description: 'three numbers on one line', stdin: '10 20 30', expectedStdout: 'Total: 60\nRecords: 3' },
        { description: 'empty line', stdin: '\n', expectedStdout: 'Total: 0\nRecords: 0' },
        { description: 'one number', stdin: '5', expectedStdout: 'Total: 5\nRecords: 1' },
      ],
      hint: 'getline into `line`, then `std::istringstream in(line); std::string word; while (in >> word) amounts.push_back(std::stoi(word));`.',
      solution: r`#include <iostream>
#include <sstream>
#include <string>
#include <vector>

int main() {
    std::vector<int> amounts;
    std::string line;
    std::getline(std::cin, line);
    std::istringstream in(line);
    std::string word;
    while (in >> word) {
        amounts.push_back(std::stoi(word));
    }
    int total = 0;
    for (int x : amounts) {
        total = total + x;
    }
    std::cout << "Total: " << total << '\n';
    std::cout << "Records: " << amounts.size() << '\n';
    return 0;
}
`,
    },
    {
      kind: 'create',
      prompt: 'Read one line and split it into words. Print `Words: <k>`. If there are no words print `Empty` and stop. Otherwise print `Longest: <word>` (the first longest, using std::max_element with a lambda comparing sizes) and `Joined: <w1>,<w2>,...` built with a std::ostringstream.',
      language: 'cpp',
      tests: [
        { description: 'four words', stdin: 'add 40 to vault', expectedStdout: 'Words: 4\nLongest: vault\nJoined: add,40,to,vault' },
        { description: 'one word', stdin: 'hello', expectedStdout: 'Words: 1\nLongest: hello\nJoined: hello' },
        { description: 'tie goes to the first', stdin: 'one two six', expectedStdout: 'Words: 3\nLongest: one\nJoined: one,two,six' },
        { description: 'empty line', stdin: '\n', expectedStdout: 'Words: 0\nEmpty' },
      ],
      hint: 'The comparator is `[](const std::string &a, const std::string &b) { return a.size() < b.size(); }`. For the join, write a comma before every word except the first (check the index).',
      solution: r`#include <algorithm>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

int main() {
    std::string line;
    std::getline(std::cin, line);
    std::istringstream in(line);
    std::vector<std::string> words;
    std::string word;
    while (in >> word) {
        words.push_back(word);
    }
    std::cout << "Words: " << words.size() << '\n';
    if (words.empty()) {
        std::cout << "Empty\n";
        return 0;
    }
    auto longest = std::max_element(words.begin(), words.end(),
        [](const std::string &a, const std::string &b) { return a.size() < b.size(); });
    std::cout << "Longest: " << *longest << '\n';
    std::ostringstream out;
    for (std::size_t i = 0; i < words.size(); ++i) {
        if (i > 0) {
            out << ',';
        }
        out << words[i];
    }
    std::cout << "Joined: " << out.str() << '\n';
    return 0;
}
`,
      projectNote: 'Vault++ can now parse a typed line into words and numbers, the groundwork for safe input in Module 6.',
    },
  ],
};

const l25: Lesson = {
  id: 'cpp-2-5',
  title: 'Project: Vault++ v0.2',
  objective: 'Run a command loop over a vector of amounts with add, sorted list, total, max and quit.',
  minutes: 18,
  lexicon: [
    { id: 'cpp.2.read-loop', term: 'while (std::cin >> cmd) { ... }', kind: 'pattern', meaning: 'Read and test in one step: the expression is true while a value was read, and false at end of input or on a failed conversion. Protects a command loop from spinning forever when the input runs out.', example: 'int cmd = 0;\nwhile (std::cin >> cmd) {\n    if (cmd == 3) {\n        break;\n    }\n}' },
    { id: 'cpp.2.empty', term: 'v.empty()', kind: 'builtin', meaning: 'True when the vector has no elements. Clearer than size() == 0, and the guard you need before dereferencing max_element.', example: 'if (amounts.empty()) {\n    std::cout << "Empty\\n";\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The plan for v0.2',
      body: `Vault++ v0.2 is a **command loop** over a \`std::vector<int>\`. Each turn prints \`Command?\`, reads an int and dispatches: \`1\` add, \`2\` list sorted, \`3\` quit, \`4\` total, \`5\` max, anything else \`Unknown command\`.

The loop condition is \`while (std::cin >> cmd)\`: it reads and tests at once, so the program also stops cleanly if the input simply ends. \`3\` prints \`Bye\` and breaks. The example below has three of the five commands; the labels are the plan, and you add \`4\` and \`5\` in the create step. Note where the \`Command?\` prompt is printed: once before the loop, then at the end of every turn.`,
      example: {
        language: 'cpp',
        source: r`#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> amounts;
    int cmd = 0;
    std::cout << "Command?\n";
    while (std::cin >> cmd) {
        if (cmd == 1) {
            int amount = 0;
            std::cout << "Amount?\n";
            std::cin >> amount;
            amounts.push_back(amount);
            std::cout << "Added\n";
        } else if (cmd == 2) {
            std::sort(amounts.begin(), amounts.end());
            for (int x : amounts) {
                std::cout << x << '\n';
            }
            std::cout << "Records: " << amounts.size() << '\n';
        } else if (cmd == 3) {
            std::cout << "Bye\n";
            break;
        } else {
            std::cout << "Unknown command\n";
        }
        std::cout << "Command?\n";
    }
    return 0;
}`,
        labels: [
          { lines: [6, 8], label: 'The records, the command box, the first prompt.' },
          { lines: [9, 9], label: 'Read a command; leave the loop if input ends.' },
          { lines: [10, 15], label: '1: ask for an amount, append it, confirm.' },
          { lines: [16, 21], label: '2: sort ascending, print one per line, then the count.' },
          { lines: [22, 24], label: '3: say goodbye and leave the loop.' },
          { lines: [25, 27], label: 'Anything else.' },
          { lines: [28, 28], label: 'Prompt for the next turn.' },
        ],
      },
      contrast: [
        { from: 'c', note: 'The C Vault\'s loop was `while (scanf("%d", &cmd) == 1)`, with a malloc\'d array, a count, a capacity and a qsort call. Here the vector carries its own size and std::sort needs no comparator for ascending order.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'This is the `5` branch of the finished program. The user types `5`, then `1` and `7`, then `5`, then `3`. What is the complete output?',
      code: {
        language: 'cpp',
        source: r`} else if (cmd == 5) {
    if (amounts.empty()) {
        std::cout << "Empty\n";
    } else {
        std::cout << "Max: " << *std::max_element(amounts.begin(), amounts.end()) << '\n';
    }
}`,
      },
      choices: [
        'Command?\nEmpty\nCommand?\nAmount?\nAdded\nCommand?\nMax: 7\nCommand?\nBye',
        'Command?\nMax: 0\nCommand?\nAmount?\nAdded\nCommand?\nMax: 7\nCommand?\nBye',
        'Command?\nEmpty\nCommand?\nAmount?\nAdded\nCommand?\nMax: 7\nBye',
        'Command?\nEmpty\nAmount?\nAdded\nMax: 7\nBye',
      ],
      answer: 'Command?\nEmpty\nCommand?\nAmount?\nAdded\nCommand?\nMax: 7\nCommand?\nBye',
      explanation: 'The first `5` finds no records: the empty() guard prints `Empty` rather than dereferencing end(). Then `1` asks `Amount?`, reads 7 and prints `Added`. The second `5` prints `Max: 7`. Every turn ends by printing `Command?` again, including the one before `3`, which prints `Bye` and leaves without another prompt.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the `4` (total) and `5` (max) branches as they continue the if/else chain. Set the indentation yourself.',
      language: 'cpp',
      indentation: true,
      solution: [
        '} else if (cmd == 4) {',
        '    std::cout << "Total: " << std::accumulate(amounts.begin(), amounts.end(), 0) << \'\\n\';',
        '} else if (cmd == 5) {',
        '    if (amounts.empty()) {',
        '        std::cout << "Empty\\n";',
        '    } else {',
        '        std::cout << "Max: " << *std::max_element(amounts.begin(), amounts.end()) << \'\\n\';',
        '    }',
        '}',
      ],
      distractors: [
        '    if (amounts == 0) {',
        '        std::cout << "Max: " << std::max_element(amounts.begin(), amounts.end()) << \'\\n\';',
        '    std::cout << "Total: " << std::accumulate(amounts.begin(), amounts.end()) << \'\\n\';',
      ],
      explanation: 'A vector is not a number, so `amounts == 0` does not compile: ask `empty()`. max_element returns a position; print `*` of it. accumulate needs its starting value, which also fixes the type of the sum.',
    },
    {
      kind: 'create',
      prompt: 'Write Vault++ v0.2 from a blank file. Print `Command?`, read an int, and repeat until `3`: `1` asks `Amount?`, reads an int, appends it and prints `Added`; `2` prints the amounts sorted ascending one per line, then `Records: <n>`; `4` prints `Total: <t>`; `5` prints `Max: <m>` or `Empty` when there are no records; `3` prints `Bye` and stops; anything else prints `Unknown command`.',
      language: 'cpp',
      tests: [
        { description: 'add two, list, quit', stdin: '1\n40\n1\n15\n2\n3', expectedStdout: 'Command?\nAmount?\nAdded\nCommand?\nAmount?\nAdded\nCommand?\n15\n40\nRecords: 2\nCommand?\nBye' },
        { description: 'max on empty', stdin: '5\n3', expectedStdout: 'Command?\nEmpty\nCommand?\nBye' },
        { description: 'total and max', stdin: '1\n10\n1\n-4\n4\n5\n3', expectedStdout: 'Command?\nAmount?\nAdded\nCommand?\nAmount?\nAdded\nCommand?\nTotal: 6\nCommand?\nMax: 10\nCommand?\nBye' },
        { description: 'unknown command', stdin: '9\n3', expectedStdout: 'Command?\nUnknown command\nCommand?\nBye' },
        { description: 'list and total on empty', stdin: '2\n4\n3', expectedStdout: 'Command?\nRecords: 0\nCommand?\nTotal: 0\nCommand?\nBye' },
      ],
      hint: 'Start from the concept example and add the two branches you assembled. Includes: <algorithm>, <iostream>, <numeric>, <vector>. Write the seven labels as comments before you fill them in.',
      solution: r`#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>

int main() {
    std::vector<int> amounts;
    int cmd = 0;
    std::cout << "Command?\n";
    while (std::cin >> cmd) {
        if (cmd == 1) {
            int amount = 0;
            std::cout << "Amount?\n";
            std::cin >> amount;
            amounts.push_back(amount);
            std::cout << "Added\n";
        } else if (cmd == 2) {
            std::sort(amounts.begin(), amounts.end());
            for (int x : amounts) {
                std::cout << x << '\n';
            }
            std::cout << "Records: " << amounts.size() << '\n';
        } else if (cmd == 3) {
            std::cout << "Bye\n";
            break;
        } else if (cmd == 4) {
            std::cout << "Total: " << std::accumulate(amounts.begin(), amounts.end(), 0) << '\n';
        } else if (cmd == 5) {
            if (amounts.empty()) {
                std::cout << "Empty\n";
            } else {
                std::cout << "Max: " << *std::max_element(amounts.begin(), amounts.end()) << '\n';
            }
        } else {
            std::cout << "Unknown command\n";
        }
        std::cout << "Command?\n";
    }
    return 0;
}
`,
      projectNote: 'Vault++ v0.2 complete: amounts live in a vector and are sorted, totalled and searched with algorithms.',
    },
  ],
};

export const m2: Module = {
  id: 'cpp-m2',
  title: 'Vectors and algorithms',
  goal: 'std::vector, range-for, iterators, sort/find, lambdas.',
  projectMilestone: 'Vault++ v0.2: records in a vector, sorted and searched.',
  status: 'available',
  lessons: [l21, l22, l23, l24, l25],
};
