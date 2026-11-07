import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 8: Testing and shipping                                     */
/* ------------------------------------------------------------------ */

/* ---------------------------- 8-1 --------------------------------- */

const l81: Lesson = {
  id: 'py-8-1',
  title: 'Proving it works',
  objective: 'Write test functions with assert and a runner that reports how many passed.',
  minutes: 22,
  lexicon: [
    { id: 'py.8.assert', term: 'assert condition, "message"', kind: 'keyword', meaning: 'Check that the condition is True. If it is not, raise AssertionError (carrying the message, if given) and stop. Use it to state what must be true at this point.', example: 'assert apply(100, -30) == 70', analogy: 'A claim in an argument: "this must hold". Unlike a spoken claim, a false one stops the whole program on the spot.' },
    { id: 'py.8.assertionerror', term: 'AssertionError', kind: 'builtin', meaning: 'The error a failing assert raises. A test runner catches it to count one failure instead of crashing.', example: 'try:\n    assert 1 == 2\nexcept AssertionError:\n    print("failed")' },
    { id: 'py.8.test-function', term: 'def test_...():', kind: 'pattern', meaning: 'A function with no parameters that calls the code under test with a known input and asserts the expected result. The test_ prefix is how runners find it.', example: 'def test_empty():\n    assert summarize([]) == {}' },
    { id: 'py.8.run-tests', term: 'run_tests()', kind: 'pattern', meaning: 'A function that calls every test in turn and prints how many passed. The simplest possible test runner.', example: 'def run_tests():\n    tests = [test_empty]\n    for test in tests:\n        test()\n    print(f"{len(tests)} tests passed")' },
    { id: 'py.8.pure-function', term: 'pure function', kind: 'concept', meaning: 'A function whose result depends only on its arguments and that neither prints nor reads anything. Pure functions are the easy ones to test: call, compare, done.', example: 'def apply(balance, amount):\n    return balance + amount', analogy: 'A formula: same input, same answer, every time. The analogy breaks for functions that touch files or input(); their answer depends on the outside world, so a test must first set that world up.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A test is a claim the program checks for you',
      body: `You have been running the ledger by hand and reading the output. That does not scale: every change means re-typing every scenario. A **test** is a scenario written as code, so the computer re-checks it in a millisecond.

The tool is \`assert\`: a statement that says "this must be True". If it is, nothing happens. If it is not, Python raises \`AssertionError\` and stops at that line, which tells you exactly which claim broke.

A **test function** is a function named \`test_something\` that calls your code with a known input and asserts the answer. A **runner** calls each test and, if none raised, prints how many passed.

Two habits make this work. First, test **pure functions** (data in, data out, no \`print\` or \`input\`); \`summarize\` is pure, so it is testable without a keyboard. Second, when you find a bug, write the failing test **first**, watch it fail, then fix the code. The test proves the fix and stays behind as a guard.`,
      example: {
        language: 'python',
        source: `def summarize(entries):
    totals = {}
    for amount, category in entries:
        totals[category] = totals.get(category, 0) + amount
    return totals

def test_summarize_groups_by_category():
    result = summarize([(-30, "food"), (50, "salary"), (-10, "food")])
    assert result == {"food": -40, "salary": 50}

def test_summarize_empty():
    assert summarize([]) == {}

def run_tests():
    tests = [test_summarize_groups_by_category, test_summarize_empty]
    for test in tests:
        test()
    print(f"{len(tests)} tests passed")

run_tests()`,
        labels: [
          { lines: [1, 5], label: 'The function under test. Data in, data out, no input() or print(): that is what makes it testable.' },
          { lines: [7, 9], label: 'One test: a known input and the exact answer you expect. assert raises AssertionError if they differ.' },
          { lines: [11, 12], label: 'A boundary case gets its own test, so a failure names the case.' },
          { lines: [14, 18], label: 'The runner: call each test; if none raised, report the count.' },
          { lines: [20, 20], label: 'Run the tests. Output: 2 tests passed.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What happens when this program runs?',
      code: {
        language: 'python',
        source: `def apply(balance, amount):
    return balance + amount

def test_income():
    assert apply(100, 50) == 150

def test_expense():
    assert apply(100, -30) == 60

def run_tests():
    tests = [test_income, test_expense]
    for test in tests:
        test()
    print(f"{len(tests)} tests passed")

run_tests()`,
      },
      choices: ['2 tests passed', '1 tests passed', 'AssertionError in test_expense; nothing is printed', 'AssertionError in test_income; nothing is printed'],
      answer: 'AssertionError in test_expense; nothing is printed',
      explanation: '`apply(100, -30)` is 70, not 60, so the second assert raises and `run_tests` stops before its print. A failing test means the code and the test disagree; here the **test** is wrong. Read both before fixing either.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the test and the runner so the program prints `1 tests passed`.',
      language: 'python',
      template: `def apply(balance, amount):
    return balance + amount

def {{prefix}}_zero_amount():
    {{kw}} apply(100, 0) == 100, "adding zero must not change the balance"

def run_tests():
    tests = [{{prefix}}_zero_amount]
    for test in tests:
        {{call}}
    print(f"{len(tests)} tests passed")

run_tests()`,
      blanks: [
        { id: 'prefix', answers: ['test'], hint: 'the prefix every runner looks for' },
        { id: 'kw', answers: ['assert'], hint: 'the keyword that makes a claim' },
        { id: 'call', answers: ['test()'], hint: 'each item in the list is a function; call it' },
      ],
      explanation: 'The optional message after the comma is shown with the AssertionError, so a failure explains itself.',
    },
    {
      kind: 'modify',
      prompt: 'Running this program ends with a traceback: `AssertionError` inside `test_two_entries_same_category`. The test is right and `summarize` is wrong. Fix `summarize` (not the test), then add a third test `test_two_categories` that checks `summarize([(-30, "food"), (50, "salary")])` and register it in the runner. Expected output: `3 tests passed`.',
      language: 'python',
      starter: `def summarize(entries):
    totals = {}
    for amount, category in entries:
        totals[category] = amount
    return totals

def test_single_entry():
    assert summarize([(-30, "food")]) == {"food": -30}

def test_two_entries_same_category():
    assert summarize([(-30, "food"), (-10, "food")]) == {"food": -40}

def run_tests():
    tests = [test_single_entry, test_two_entries_same_category]
    for test in tests:
        test()
    print(f"{len(tests)} tests passed")

run_tests()
`,
      tests: [{ description: 'all three tests pass', expectedStdout: '3 tests passed' }],
      hint: 'The failing test says two entries in one category should add up. The assignment inside the loop overwrites instead of adding; `.get(category, 0)` gives you the running total.',
      solution: `def summarize(entries):
    totals = {}
    for amount, category in entries:
        totals[category] = totals.get(category, 0) + amount
    return totals

def test_single_entry():
    assert summarize([(-30, "food")]) == {"food": -30}

def test_two_entries_same_category():
    assert summarize([(-30, "food"), (-10, "food")]) == {"food": -40}

def test_two_categories():
    assert summarize([(-30, "food"), (50, "salary")]) == {"food": -30, "salary": 50}

def run_tests():
    tests = [test_single_entry, test_two_entries_same_category, test_two_categories]
    for test in tests:
        test()
    print(f"{len(tests)} tests passed")

run_tests()
`,
    },
    {
      kind: 'create',
      prompt: `Write a program that tests itself before it does anything else.

- \`apply(balance, amount)\` returns the new balance; \`classify(amount)\` returns \`expense\`, \`nothing\` or \`income\`.
- Five tests: \`test_apply_income\`, \`test_apply_expense\`, \`test_classify_expense\`, \`test_classify_zero\`, \`test_classify_income\`, and a \`run_tests()\` that prints \`5 tests passed\`.
- Then print \`Amount?\`, read a whole number, print its classification, and print \`Balance: <apply(100, amount)>\`.`,
      language: 'python',
      tests: [
        { description: '-5 is an expense', stdin: '-5', expectedStdout: '5 tests passed\nAmount?\nexpense\nBalance: 95' },
        { description: '0 is nothing', stdin: '0', expectedStdout: '5 tests passed\nAmount?\nnothing\nBalance: 100' },
        { description: '7 is income', stdin: '7', expectedStdout: '5 tests passed\nAmount?\nincome\nBalance: 107' },
      ],
      hint: 'Write the two functions, then one test per behaviour, then the runner, then the four lines of interaction. Run after every piece.',
      solution: `def apply(balance, amount):
    return balance + amount

def classify(amount):
    if amount < 0:
        return "expense"
    elif amount == 0:
        return "nothing"
    else:
        return "income"

def test_apply_income():
    assert apply(100, 50) == 150

def test_apply_expense():
    assert apply(100, -30) == 70

def test_classify_expense():
    assert classify(-5) == "expense"

def test_classify_zero():
    assert classify(0) == "nothing"

def test_classify_income():
    assert classify(7) == "income"

def run_tests():
    tests = [test_apply_income, test_apply_expense, test_classify_expense, test_classify_zero, test_classify_income]
    for test in tests:
        test()
    print(f"{len(tests)} tests passed")

run_tests()
print("Amount?")
amount = int(input())
print(classify(amount))
print(f"Balance: {apply(100, amount)}")
`,
      projectNote: 'The ledger\'s core functions now carry their own proof. Ledger v1.0 will expose this as a selftest command.',
    },
  ],
};

/* ---------------------------- 8-2 --------------------------------- */

const l82: Lesson = {
  id: 'py-8-2',
  title: 'A real test framework',
  objective: 'Read unittest test classes and reports, and make a runner that keeps going after a failure.',
  minutes: 20,
  lexicon: [
    { id: 'py.8.unittest', term: 'import unittest', kind: 'builtin', meaning: 'The standard library test framework: tests grouped in classes, many assert methods, and a runner that reports every failure instead of stopping at the first.', example: 'import unittest' },
    { id: 'py.8.testcase', term: 'class TestX(unittest.TestCase):', kind: 'pattern', meaning: 'A group of related tests. Every method whose name starts with test is one test; unittest finds them by name, so there is no list to maintain.', example: 'class TestApply(unittest.TestCase):\n    def test_income(self):\n        self.assertEqual(apply(100, 50), 150)' },
    { id: 'py.8.assertequal', term: 'self.assertEqual(actual, expected)', kind: 'pattern', meaning: 'Fail the test unless the two values are equal, and show both in the report. Put the computed value first so the message reads "got != wanted".', example: 'self.assertEqual(summarize([]), {})' },
    { id: 'py.8.unittest-main', term: 'unittest.main()', kind: 'pattern', meaning: 'Find every TestCase in the file, run all of their tests, and print a report to stderr: one dot per pass, F per failure, E per error, then "Ran N tests" and OK or FAILED.', example: 'unittest.main()' },
    { id: 'py.8.pytest', term: 'pytest', kind: 'concept', meaning: 'The most widely used Python test runner: plain test_ functions with bare assert, run by the pytest command, with rich failure messages. Not in the standard library; it must be installed with pip, which is why this app uses run_tests().', example: '# in a terminal, after: pip install pytest\n# pytest test_ledger.py' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'unittest: the same idea with a report',
      body: `Your \`run_tests()\` has two weaknesses: you must list every test by hand, and the first failure hides all the others. Python's standard library ships \`unittest\`, which fixes both.

Tests live as methods in a class that inherits from \`unittest.TestCase\`. Instead of \`assert a == b\` you write \`self.assertEqual(a, b)\`, which on failure shows **both** values. \`unittest.main()\` finds every method whose name starts with \`test\`, runs them all, and prints a report on **stderr**:

- \`..\` one character per test: \`.\` passed, \`F\` an assertion failed, \`E\` some other exception
- a dashed line, then \`Ran 2 tests in 0.001s\`
- \`OK\`, or \`FAILED (failures=1)\` with each failure listed above it, including \`AssertionError: 70 != 60\`

Because the report goes to stderr and includes timings, this app cannot compare it line by line, so the runnable steps keep the \`run_tests()\` style. Outside the app you will also meet **pytest**: the industry default, plain \`test_\` functions with bare \`assert\`, far better messages, run with the \`pytest\` command. It is not in the standard library, so it needs \`pip install pytest\` first.`,
      example: {
        language: 'python',
        source: `import unittest

def apply(balance, amount):
    return balance + amount

class TestApply(unittest.TestCase):
    def test_income(self):
        self.assertEqual(apply(100, 50), 150)

    def test_expense(self):
        self.assertEqual(apply(100, -30), 70)

unittest.main()`,
        labels: [
          { lines: [1, 1], label: 'The test framework from the standard library.' },
          { lines: [6, 6], label: 'A group of tests is a class that inherits from TestCase.' },
          { lines: [7, 8], label: 'Each test is a method whose name starts with test. assertEqual(actual, expected) replaces assert ==.' },
          { lines: [10, 11], label: 'unittest finds this one by its name too; no list to maintain.' },
          { lines: [13, 13], label: 'Run everything found and print the report to stderr: two dots, Ran 2 tests, OK.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The report ends with `Ran N tests` and then a verdict. What are N and the verdict?',
      code: {
        language: 'python',
        source: `import unittest

def classify(amount):
    if amount < 0:
        return "expense"
    return "income"

class TestClassify(unittest.TestCase):
    def check_zero(self):
        self.assertEqual(classify(0), "nothing")

    def test_expense(self):
        self.assertEqual(classify(-5), "expense")

    def test_income(self):
        self.assertEqual(classify(5), "income")

unittest.main()`,
      },
      choices: ['Ran 2 tests, OK', 'Ran 3 tests, FAILED (failures=1)', 'Ran 3 tests, OK', 'Ran 2 tests, FAILED (failures=1)'],
      answer: 'Ran 2 tests, OK',
      explanation: '`check_zero` does not start with `test`, so unittest never runs it, and the bug in `classify(0)` stays hidden behind a green OK. Rename it `test_zero` and the report becomes `Ran 3 tests`, `FAILED (failures=1)`. Discovery by name is convenient and silent: a misspelled prefix is a test that never runs.',
    },
    {
      kind: 'predict',
      prompt: 'This test fails. Which line appears in the report?',
      code: {
        language: 'python',
        source: `import unittest

def summarize(entries):
    totals = {}
    for amount, category in entries:
        totals[category] = totals.get(category, 0) + amount
    return totals

class TestSummarize(unittest.TestCase):
    def test_two_entries(self):
        self.assertEqual(summarize([(-30, "food"), (-10, "food")]), {"food": -30})

unittest.main()`,
      },
      choices: ["AssertionError: {'food': -40} != {'food': -30}", "AssertionError: {'food': -30} != {'food': -40}", 'AssertionError', "KeyError: 'food'"],
      answer: "AssertionError: {'food': -40} != {'food': -30}",
      explanation: '`assertEqual(first, second)` reports `first != second`. The computed value is first (-40, which is correct) and the expectation second (-30, which is the mistake in the test). A bare `assert` would have said only `AssertionError`; showing both values is the main reason to use the method.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a unittest file with one test that checks `summarize([])` is `{}`. Assume `summarize` is defined above these lines. Set indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['import unittest', 'class TestSummarize(unittest.TestCase):', '    def test_empty(self):', '        self.assertEqual(summarize([]), {})', 'unittest.main()'],
      distractors: ['class TestSummarize(unittest):', '    def test_empty():', '        assertEqual(summarize([]), {})'],
      explanation: 'The class inherits from `unittest.TestCase`, not the module. A test is a method, so it takes `self`, and the assert methods are reached through `self.`.',
    },
    {
      kind: 'modify',
      prompt: 'This runner stops at the first failing test, so nobody learns whether `test_classify_expense` passes. Make `run_tests` behave like unittest: run **every** test, print `FAIL: <test name>` for each one that raises `AssertionError`, and finish with `<passed> passed, <failed> failed`. Do not fix `classify` yet; the point is to see the full report.',
      language: 'python',
      starter: `def apply(balance, amount):
    return balance + amount

def classify(amount):
    if amount < 0:
        return "expense"
    return "income"

def test_apply_income():
    assert apply(100, 50) == 150

def test_classify_zero():
    assert classify(0) == "nothing"

def test_classify_expense():
    assert classify(-5) == "expense"

def run_tests():
    tests = [test_apply_income, test_classify_zero, test_classify_expense]
    for test in tests:
        test()
    print(f"{len(tests)} tests passed")

run_tests()
`,
      tests: [{ description: 'one failure reported, the rest still run', expectedStdout: 'FAIL: test_classify_zero\n2 passed, 1 failed' }],
      hint: 'Wrap the call in `try` / `except AssertionError:` and count in two variables. A function\'s name is available as `test.__name__`.',
      solution: `def apply(balance, amount):
    return balance + amount

def classify(amount):
    if amount < 0:
        return "expense"
    return "income"

def test_apply_income():
    assert apply(100, 50) == 150

def test_classify_zero():
    assert classify(0) == "nothing"

def test_classify_expense():
    assert classify(-5) == "expense"

def run_tests():
    tests = [test_apply_income, test_classify_zero, test_classify_expense]
    passed = 0
    failed = 0
    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError:
            print(f"FAIL: {test.__name__}")
            failed += 1
    print(f"{passed} passed, {failed} failed")

run_tests()
`,
    },
    {
      kind: 'create',
      prompt: `Build a runner that discovers tests the way unittest does. \`globals()\` returns a dict of every name defined in the file, so a function is "found" when its name starts with \`test_\`.

- Write \`apply(balance, amount)\` and \`summarize(entries)\` (category totals as a dict).
- Write three tests named exactly \`test_apply_income\`, \`test_apply_expense\` and \`test_summarize_two_categories\`.
- \`run_tests()\` takes no list. It goes through the names in \`globals()\` in **sorted** order, and for each name starting with \`test_\` prints \`ok <name>\` and calls the function. Finally it prints \`<n> tests passed\`.`,
      language: 'python',
      tests: [{ description: 'three tests discovered in sorted order', expectedStdout: 'ok test_apply_expense\nok test_apply_income\nok test_summarize_two_categories\n3 tests passed' }],
      hint: '`names = [name for name in sorted(globals()) if name.startswith("test_")]`, then `globals()[name]()` calls the function behind a name. Sorting first means the order never depends on where you wrote the tests.',
      solution: `def apply(balance, amount):
    return balance + amount

def summarize(entries):
    totals = {}
    for amount, category in entries:
        totals[category] = totals.get(category, 0) + amount
    return totals

def test_apply_income():
    assert apply(100, 50) == 150

def test_apply_expense():
    assert apply(100, -30) == 70

def test_summarize_two_categories():
    assert summarize([(-30, "food"), (50, "salary")]) == {"food": -30, "salary": 50}

def run_tests():
    names = [name for name in sorted(globals()) if name.startswith("test_")]
    for name in names:
        print(f"ok {name}")
        globals()[name]()
    print(f"{len(names)} tests passed")

run_tests()
`,
      projectNote: 'You now know what unittest and pytest do behind the curtain: find functions by name, run them, count. The ledger keeps the explicit list for clarity.',
    },
  ],
};

/* ---------------------------- 8-3 --------------------------------- */

const l83: Lesson = {
  id: 'py-8-3',
  title: 'Verbs on the command line',
  objective: 'Turn a program into a command-line tool with argparse subcommands and a main guard.',
  minutes: 25,
  lexicon: [
    { id: 'py.8.sys-argv', term: 'sys.argv', kind: 'builtin', meaning: 'The list of words typed on the command line, every one of them a string. sys.argv[0] is the script path; the real arguments start at index 1.', example: 'import sys\nprint(sys.argv[1:])' },
    { id: 'py.8.argumentparser', term: 'argparse.ArgumentParser(...)', kind: 'pattern', meaning: 'An object that knows which arguments a program accepts. It converts them, prints a usage error (to stderr, exit code 2) for bad input, and answers --help for free.', example: 'parser = argparse.ArgumentParser(description="Ledger")\nargs = parser.parse_args()' },
    { id: 'py.8.add-argument', term: 'add_argument("name", type=int, help="...")', kind: 'pattern', meaning: 'Declare one argument. A bare name is positional and required; a name starting with -- is an optional flag with a default. type converts the text; help is shown by --help. The value lands on args.<name>.', example: 'parser.add_argument("amount", type=int)\nparser.add_argument("--note", default="")' },
    { id: 'py.8.subparsers', term: 'add_subparsers(dest="command")', kind: 'pattern', meaning: 'Give a program verbs (add, balance, report). Each verb gets its own small parser with its own arguments; the chosen verb is stored under dest.', example: 'sub = parser.add_subparsers(dest="command", required=True)\nadd = sub.add_parser("add")\nadd.add_argument("amount", type=int)', analogy: 'git commit, git push: one program, several verbs, each with its own options. The analogy breaks for flags written before the verb (git -C dir push): argparse needs those declared on the top-level parser separately.' },
    { id: 'py.8.main-guard', term: 'if __name__ == "__main__":', kind: 'pattern', meaning: 'True only when this file is the one being run. Code under it does not run when another file imports this one, so a test file can import your functions without starting the program.', example: 'if __name__ == "__main__":\n    main()' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Arguments instead of questions',
      body: `Real tools do not ask questions; they are told what to do in one line: \`python main.py add 50 food\`. Everything after \`python\` arrives in \`sys.argv\` as a list of **strings**: \`["main.py", "add", "50", "food"]\`. You could pick that list apart by hand, but checking counts, converting numbers and writing help text is the same chore in every program, so the standard library does it: \`argparse\`.

You build an \`ArgumentParser\`, declare each argument with \`add_argument\`, and call \`parse_args()\`. It reads \`sys.argv[1:]\`, converts \`"50"\` to \`50\` because you said \`type=int\`, and hands back an object with one attribute per argument. Bad input gets a usage message on stderr and exit code 2; \`--help\` prints your help text. A bare name is positional and required; a name like \`--note\` is an optional flag with a \`default\`.

Programs with several jobs use **subparsers**: one verb per job, each with its own arguments. The chosen verb is stored under \`dest\`.

Last, the **main guard**. Python sets \`__name__\` to \`"__main__"\` in the file being run, and to the module's name in a file being imported. Putting the call to \`main()\` under the guard means a test file can import your functions without the program starting.`,
      example: {
        language: 'python',
        source: `import argparse

def main():
    parser = argparse.ArgumentParser(description="Ledger from the command line")
    sub = parser.add_subparsers(dest="command", required=True)
    add = sub.add_parser("add", help="record an entry")
    add.add_argument("amount", type=int, help="whole number; negative is an expense")
    add.add_argument("category", help="for example food or salary")
    sub.add_parser("balance", help="print the current balance")
    args = parser.parse_args()
    if args.command == "add":
        print(f"Added {args.amount} to {args.category}")
    elif args.command == "balance":
        print("Balance: 0")

if __name__ == "__main__":
    main()`,
        labels: [
          { lines: [4, 4], label: 'Create the parser. The description is the first line of --help.' },
          { lines: [5, 5], label: 'Subcommands are verbs. The chosen one is stored as args.command; required means a missing verb is an error.' },
          { lines: [6, 8], label: 'The add verb takes two positional arguments. type=int converts the text and rejects anything that is not a whole number.' },
          { lines: [9, 9], label: 'A verb with no arguments of its own.' },
          { lines: [10, 10], label: 'Read sys.argv[1:], check it, convert it, and return an object with one attribute per argument.' },
          { lines: [11, 14], label: 'Dispatch on the verb.' },
          { lines: [16, 17], label: 'Run main() only when this file is the program, not when it is imported.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The program is run as `python main.py add 50 food`. What is printed?',
      code: { language: 'python', source: 'import sys\nprint(sys.argv[1:])' },
      choices: ["['add', '50', 'food']", "['add', 50, 'food']", "['main.py', 'add', '50', 'food']", 'add 50 food'],
      answer: "['add', '50', 'food']",
      explanation: 'The slice drops `sys.argv[0]`, the script path. Everything else arrives as text: `"50"` is a string until something converts it, which is exactly what `type=int` is for.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a parser with one verb, `add <amount> <category>`, that prints `Added 50 to food` for `add 50 food`.',
      language: 'python',
      indentation: false,
      solution: [
        'import argparse',
        'parser = argparse.ArgumentParser()',
        'sub = parser.add_subparsers(dest="command", required=True)',
        'add = sub.add_parser("add")',
        'add.add_argument("amount", type=int)',
        'add.add_argument("category")',
        'args = parser.parse_args()',
        'print(f"Added {args.amount} to {args.category}")',
      ],
      distractors: ['add = parser.add_parser("add")', 'add.add_argument("amount", type="int")', 'args = parser.parse_args(sys.argv)'],
      explanation: 'Verbs are added to the subparsers object, not the parser. `type` takes the function `int`, not the text `"int"`. `parse_args()` already reads `sys.argv[1:]`; passing the whole list would make it treat the script path as the verb.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so `python main.py 25` prints `Balance: 125`, and so that importing the file does not run it.',
      language: 'python',
      template: `import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("amount", {{typ}})
    args = parser.parse_args()
    print(f"Balance: {100 + args.amount}")

if {{name}} == {{val}}:
    main()`,
      blanks: [
        { id: 'typ', answers: ['type=int'], hint: 'without it, 100 + "25" is a TypeError' },
        { id: 'name', answers: ['__name__'], hint: 'the double-underscore name Python sets per file' },
        { id: 'val', answers: ['"__main__"', "'__main__'"], hint: 'the value it has in the file being run' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Run with `apply 100 50` this prints `Balance: 10050`: the two numbers are still text. Fix the conversion, add a second verb `classify <amount>` that prints `expense`, `nothing` or `income`, and put the call to `main()` under a main guard.',
      language: 'python',
      starter: `import argparse

def main():
    parser = argparse.ArgumentParser(description="Ledger helpers")
    sub = parser.add_subparsers(dest="command", required=True)
    apply_cmd = sub.add_parser("apply", help="apply an amount to a balance")
    apply_cmd.add_argument("balance")
    apply_cmd.add_argument("amount")
    args = parser.parse_args()
    if args.command == "apply":
        print(f"Balance: {args.balance + args.amount}")

main()
`,
      tests: [
        { description: 'apply 100 50', argv: ['apply', '100', '50'], expectedStdout: 'Balance: 150' },
        { description: 'apply 100 -30', argv: ['apply', '100', '-30'], expectedStdout: 'Balance: 70' },
        { description: 'classify -5', argv: ['classify', '-5'], expectedStdout: 'expense' },
        { description: 'classify 0', argv: ['classify', '0'], expectedStdout: 'nothing' },
        { description: 'classify 12', argv: ['classify', '12'], expectedStdout: 'income' },
      ],
      hint: '`type=int` on all three number arguments. The new verb needs its own `add_parser` and `add_argument`, and a new branch after `parse_args()`.',
      solution: `import argparse

def main():
    parser = argparse.ArgumentParser(description="Ledger helpers")
    sub = parser.add_subparsers(dest="command", required=True)
    apply_cmd = sub.add_parser("apply", help="apply an amount to a balance")
    apply_cmd.add_argument("balance", type=int)
    apply_cmd.add_argument("amount", type=int)
    classify_cmd = sub.add_parser("classify", help="expense, nothing or income")
    classify_cmd.add_argument("amount", type=int)
    args = parser.parse_args()
    if args.command == "apply":
        print(f"Balance: {args.balance + args.amount}")
    elif args.command == "classify":
        if args.amount < 0:
            print("expense")
        elif args.amount == 0:
            print("nothing")
        else:
            print("income")

if __name__ == "__main__":
    main()
`,
    },
    {
      kind: 'create',
      prompt: `Write a command-line tool with two verbs and a main guard.

- \`add <amount> <category> [--note TEXT]\` prints \`Added <amount> to <category>\`; when a note is given, print \`Added <amount> to <category> (<note>)\` instead.
- \`budget <limit> <spent>\` prints \`Remaining: <limit - spent>\`, and on the next line \`warning: over budget\` when that is negative.
- Give every argument a \`help\` text: \`add --help\` must start with \`usage: main.py add\`.`,
      language: 'python',
      tests: [
        { description: 'add 50 food', argv: ['add', '50', 'food'], expectedStdout: 'Added 50 to food' },
        { description: 'add with a note', argv: ['add', '-20', 'food', '--note', 'lunch'], expectedStdout: 'Added -20 to food (lunch)' },
        { description: 'budget within limit', argv: ['budget', '100', '30'], expectedStdout: 'Remaining: 70' },
        { description: 'budget over limit', argv: ['budget', '100', '130'], expectedStdout: 'Remaining: -30\nwarning: over budget' },
        { description: 'help for add', argv: ['add', '--help'], expectedStdout: 'usage: main.py add', match: 'contains' },
      ],
      hint: '`add.add_argument("--note", default="")` makes the flag optional; an empty string is False in an `if`. argparse accepts `-20` as a number because no flag looks like one.',
      solution: `import argparse

def main():
    parser = argparse.ArgumentParser(description="Ledger helpers")
    sub = parser.add_subparsers(dest="command", required=True)
    add = sub.add_parser("add", help="record an entry")
    add.add_argument("amount", type=int, help="whole number; negative is an expense")
    add.add_argument("category", help="for example food or salary")
    add.add_argument("--note", default="", help="optional remark")
    budget = sub.add_parser("budget", help="compare spending with a limit")
    budget.add_argument("limit", type=int, help="the most you planned to spend")
    budget.add_argument("spent", type=int, help="what you actually spent")
    args = parser.parse_args()
    if args.command == "add":
        if args.note:
            print(f"Added {args.amount} to {args.category} ({args.note})")
        else:
            print(f"Added {args.amount} to {args.category}")
    elif args.command == "budget":
        remaining = args.limit - args.spent
        print(f"Remaining: {remaining}")
        if remaining < 0:
            print("warning: over budget")

if __name__ == "__main__":
    main()
`,
      projectNote: 'The ledger\'s interface is about to change from questions to verbs: add, balance, report, selftest.',
    },
  ],
};

/* ---------------------------- 8-4 --------------------------------- */

const statementStarter = `"""Statement importer: turns a bank export into a category report."""
from collections import defaultdict

def parse_line(line):
    amount, category = line.split()
    return int(amount), category

def read_statement(path):
    with open(path) as f:
        return [parse_line(line) for line in f if line.strip()]

def totals_by_category(entries):
    totals = defaultdict(int)
    for amount, category in entries:
        totals[category] += amount
    return dict(totals)

def largest_expense(totals):
    expenses = {c: t for c, t in totals.items() if t < 0}
    if not expenses:
        return None
    return min(expenses, key=lambda c: expenses[c])

def print_report(totals):
    for category in sorted(totals):
        print(f"{category}: {totals[category]}")
    biggest = largest_expense(totals)
    if biggest is not None:
        print(f"Largest expense: {biggest}")

def test_parse_line():
    assert parse_line("-30 food") == (-30, "food")

def test_parse_line_extra_spaces():
    assert parse_line("-30   food") == (-30, "food")

def test_totals_by_category():
    entries = [(-30, "food"), (-10, "food"), (50, "salary")]
    assert totals_by_category(entries) == {"food": -40, "salary": 50}

def test_largest_expense():
    assert largest_expense({"food": -40, "rent": -500, "salary": 50}) == "rent"

def run_tests():
    tests = [test_parse_line, test_parse_line_extra_spaces, test_totals_by_category, test_largest_expense]
    for test in tests:
        test()
    print(f"{len(tests)} tests passed")

if __name__ == "__main__":
    run_tests()
    entries = read_statement("statement.txt")
    print_report(totals_by_category(entries))
`;

const l84: Lesson = {
  id: 'py-8-4',
  title: "Reading other people's code",
  objective: 'Find your way around an unfamiliar program, fix a bug in it, and extend it without breaking its tests.',
  minutes: 28,
  lexicon: [
    { id: 'py.8.reading-order', term: 'reading order', kind: 'concept', meaning: 'How to read code you did not write: the entry point first, then the function names as a table of contents, then the tests as examples of use, and only then the bodies you actually need to change.', example: '# 1. if __name__ == "__main__":\n# 2. the def lines\n# 3. the test_ functions\n# 4. one body at a time', analogy: 'Reading a textbook by its contents page and worked examples before the chapters. It breaks when a program has no tests and no entry point; then you start from the function that produces the output you care about.' },
    { id: 'py.8.defaultdict', term: 'defaultdict(int)', kind: 'builtin', meaning: 'A dict that creates a missing key with a default value (int() is 0) instead of raising KeyError. Lives in the collections module.', example: 'from collections import defaultdict\ntotals = defaultdict(int)\ntotals["food"] += -30' },
    { id: 'py.8.lambda', term: 'lambda x: expr', kind: 'keyword', meaning: 'A one-line function without a name, usually handed to min, max or sorted as key= to say what to compare.', example: 'min(totals, key=lambda c: totals[c])' },
    { id: 'py.8.comprehension', term: '[f(x) for x in xs if cond]', kind: 'pattern', meaning: 'Build a list (or, with braces and a colon, a dict) in one expression: for each x that satisfies cond, keep f(x). Read it from the for outward.', example: 'expenses = {c: t for c, t in totals.items() if t < 0}' },
    { id: 'py.8.python-m', term: 'python -m module', kind: 'concept', meaning: 'Run a module by name instead of by file path. It is also how standard tools are started: python -m unittest, python -m pip install -r requirements.txt.', example: '# python -m unittest test_ledger.py' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Start at the bottom, then read the names',
      body: `Most programming is reading code someone else wrote, and you will not recognise every piece of it. The skill is to find the plan without reading every line.

Read in this order. **First**, the entry point: the block under \`if __name__ == "__main__":\` tells you what the program does in a few calls. **Second**, the \`def\` lines: function names are the table of contents. **Third**, the tests: each one is a worked example of what a function promises. **Only then** the bodies, and only the ones you need.

The program below was written by someone else for a bank export, one entry per line like \`-30 food\`. It uses four things you may not know: a list comprehension, a dict comprehension, \`defaultdict\` and \`lambda\`. The labels explain each, but notice that you could already say what the program does before understanding any of them.`,
      example: {
        language: 'python',
        source: `"""Statement importer: turns a bank export into a category report."""
from collections import defaultdict

def parse_line(line):
    amount, category = line.split()
    return int(amount), category

def read_statement(path):
    with open(path) as f:
        return [parse_line(line) for line in f if line.strip()]

def totals_by_category(entries):
    totals = defaultdict(int)
    for amount, category in entries:
        totals[category] += amount
    return dict(totals)

def largest_expense(totals):
    expenses = {c: t for c, t in totals.items() if t < 0}
    if not expenses:
        return None
    return min(expenses, key=lambda c: expenses[c])

def print_report(totals):
    for category in sorted(totals):
        print(f"{category}: {totals[category]}")
    biggest = largest_expense(totals)
    if biggest is not None:
        print(f"Largest expense: {biggest}")

def test_parse_line():
    assert parse_line("-30 food") == (-30, "food")

def test_totals_by_category():
    entries = [(-30, "food"), (-10, "food"), (50, "salary")]
    assert totals_by_category(entries) == {"food": -40, "salary": 50}

def test_largest_expense():
    assert largest_expense({"food": -40, "rent": -500, "salary": 50}) == "rent"

def run_tests():
    tests = [test_parse_line, test_totals_by_category, test_largest_expense]
    for test in tests:
        test()
    print(f"{len(tests)} tests passed")

if __name__ == "__main__":
    run_tests()
    entries = read_statement("statement.txt")
    print_report(totals_by_category(entries))`,
        labels: [
          { lines: [1, 2], label: 'The docstring states the purpose. The import names a tool you may not know: a dict with a default for missing keys.' },
          { lines: [4, 6], label: 'Text in, tuple out. split() with no argument splits on any run of spaces or tabs.' },
          { lines: [8, 10], label: 'A list comprehension: "parse_line(line) for each line, if the line is not blank". Same as a for loop that appends.' },
          { lines: [12, 16], label: 'defaultdict(int) starts a missing key at 0, so no .get(category, 0). dict() turns it back into a plain dict for printing and comparing.' },
          { lines: [18, 22], label: 'A dict comprehension keeps only negative totals. min with key= returns the category whose total is smallest, that is, most negative.' },
          { lines: [24, 29], label: 'The only function that prints. Everything above it is pure, which is why it is the only one without a test.' },
          { lines: [31, 39], label: 'The tests are the examples: read them to learn what each function promises.' },
          { lines: [41, 45], label: 'The runner you know.' },
          { lines: [47, 50], label: 'Read this first: the whole program in three calls. Test, read, report.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What does this call print?',
      code: {
        language: 'python',
        source: `def largest_expense(totals):
    expenses = {c: t for c, t in totals.items() if t < 0}
    if not expenses:
        return None
    return min(expenses, key=lambda c: expenses[c])

def print_report(totals):
    for category in sorted(totals):
        print(f"{category}: {totals[category]}")
    biggest = largest_expense(totals)
    if biggest is not None:
        print(f"Largest expense: {biggest}")

print_report({"salary": 50, "food": -40, "rent": -500})`,
      },
      choices: [
        'food: -40\nrent: -500\nsalary: 50\nLargest expense: rent',
        'salary: 50\nfood: -40\nrent: -500\nLargest expense: rent',
        'food: -40\nrent: -500\nsalary: 50\nLargest expense: salary',
        'food: -40\nrent: -500\nsalary: 50\nLargest expense: -500',
      ],
      answer: 'food: -40\nrent: -500\nsalary: 50\nLargest expense: rent',
      explanation: '`sorted(totals)` orders the keys alphabetically, whatever order the dict was built in. The comprehension keeps `food` and `rent`; `min` with `key=` compares their totals (-40 and -500) but returns the **key**, so the line names the category, not the number.',
    },
    {
      kind: 'modify',
      prompt: `A teammate added a test and reports two failures in this version of the importer:

- \`test_parse_line_extra_spaces\`: \`parse_line("-30   food")\` raises \`ValueError: too many values to unpack\`
- \`test_largest_expense\`: expected \`rent\`, got \`food\`

Fix the two functions without changing the tests or anything else. With the fixture \`statement.txt\` the program must then print the four totals and \`Largest expense: rent\`.`,
      language: 'python',
      starter: statementStarter.replace('amount, category = line.split()', 'amount, category = line.split(" ")').replace('return min(expenses, key=lambda c: expenses[c])', 'return max(expenses, key=lambda c: expenses[c])'),
      tests: [
        {
          description: 'tests pass and the report is right',
          files: { 'statement.txt': '-30 food\n120 salary\n-500 rent\n\n-10  food\n' },
          expectedStdout: '4 tests passed\nfood: -40\nrent: -500\nsalary: 120\nLargest expense: rent',
        },
      ],
      hint: '`split(" ")` keeps empty strings between repeated spaces; `split()` does not. The largest expense is the most negative total, so it is a `min`, not a `max`.',
      solution: statementStarter,
    },
    {
      kind: 'create',
      prompt: `Add a feature to the importer without breaking what it already does.

- Add \`largest_income(totals)\`: the category with the largest positive total, or \`None\` when there is none.
- Add a test \`test_largest_income\` and register it, so the runner prints \`5 tests passed\`.
- After the \`Largest expense\` line, print \`Largest income: <category>\`, only when there is one. The existing lines must stay exactly as they are.`,
      language: 'python',
      starter: statementStarter,
      tests: [
        {
          description: 'expenses and incomes',
          files: { 'statement.txt': '-30 food\n120 salary\n-500 rent\n30 gift\n-10 food\n' },
          expectedStdout: '5 tests passed\nfood: -40\ngift: 30\nrent: -500\nsalary: 120\nLargest expense: rent\nLargest income: salary',
        },
        {
          description: 'only expenses: no income line',
          files: { 'statement.txt': '-30 food\n-10 food\n' },
          expectedStdout: '5 tests passed\nfood: -40\nLargest expense: food',
        },
        {
          description: 'only incomes: no expense line',
          files: { 'statement.txt': '120 salary\n30 gift\n' },
          expectedStdout: '5 tests passed\ngift: 30\nsalary: 120\nLargest income: salary',
        },
      ],
      hint: 'Mirror `largest_expense`: keep totals greater than 0 and use `max`. Then mirror the last three lines of `print_report`.',
      solution: `"""Statement importer: turns a bank export into a category report."""
from collections import defaultdict

def parse_line(line):
    amount, category = line.split()
    return int(amount), category

def read_statement(path):
    with open(path) as f:
        return [parse_line(line) for line in f if line.strip()]

def totals_by_category(entries):
    totals = defaultdict(int)
    for amount, category in entries:
        totals[category] += amount
    return dict(totals)

def largest_expense(totals):
    expenses = {c: t for c, t in totals.items() if t < 0}
    if not expenses:
        return None
    return min(expenses, key=lambda c: expenses[c])

def largest_income(totals):
    incomes = {c: t for c, t in totals.items() if t > 0}
    if not incomes:
        return None
    return max(incomes, key=lambda c: incomes[c])

def print_report(totals):
    for category in sorted(totals):
        print(f"{category}: {totals[category]}")
    biggest = largest_expense(totals)
    if biggest is not None:
        print(f"Largest expense: {biggest}")
    best = largest_income(totals)
    if best is not None:
        print(f"Largest income: {best}")

def test_parse_line():
    assert parse_line("-30 food") == (-30, "food")

def test_parse_line_extra_spaces():
    assert parse_line("-30   food") == (-30, "food")

def test_totals_by_category():
    entries = [(-30, "food"), (-10, "food"), (50, "salary")]
    assert totals_by_category(entries) == {"food": -40, "salary": 50}

def test_largest_expense():
    assert largest_expense({"food": -40, "rent": -500, "salary": 50}) == "rent"

def test_largest_income():
    assert largest_income({"food": -40, "gift": 30, "salary": 120}) == "salary"

def run_tests():
    tests = [test_parse_line, test_parse_line_extra_spaces, test_totals_by_category, test_largest_expense, test_largest_income]
    for test in tests:
        test()
    print(f"{len(tests)} tests passed")

if __name__ == "__main__":
    run_tests()
    entries = read_statement("statement.txt")
    print_report(totals_by_category(entries))
`,
      projectNote: 'Tests are what make other people\'s code safe to change: you can tell the difference between "I extended it" and "I broke it".',
    },
    {
      kind: 'concept',
      title: 'Shipping it',
      body: `When a program leaves your machine, three small files travel with it.

- A \`README.md\`: what the program does, one example command per verb, and how to run the tests. Write it as if for a stranger; next month that stranger is you.
- A \`requirements.txt\`: one line per third-party package, such as \`pytest==8.3.3\`. The standard library is never listed. The receiver runs \`python -m pip install -r requirements.txt\` and gets the same versions you had.
- The code split into modules, as in Module 7: \`entry.py\`, \`ledger.py\`, \`main.py\` and a \`test_ledger.py\` that imports from them. Because \`main()\` sits under the main guard, importing \`ledger.py\` from the tests never starts the program.

\`python -m\` runs a module by name: \`python -m unittest\` discovers and runs \`test_*.py\` files, and \`python -m pip\` is the reliable way to call pip for the same Python you are using. A project that installs with one command and proves itself with one more is a project someone else can take over.`,
    },
  ],
};

/* ---------------------------- 8-5 --------------------------------- */

const ledgerV07 = `import json
from dataclasses import dataclass, asdict

LEDGER_PATH = "ledger.json"


@dataclass
class Entry:
    amount: int
    category: str


class Ledger:
    def __init__(self, starting=0):
        self.starting = starting
        self.entries = []

    def add(self, entry):
        self.entries.append(entry)

    @property
    def balance(self):
        return self.starting + sum(e.amount for e in self.entries)

    def by_category(self):
        totals = {}
        for e in self.entries:
            totals[e.category] = totals.get(e.category, 0) + e.amount
        return totals

    def save(self, path):
        with open(path, "w") as f:
            json.dump([asdict(e) for e in self.entries], f)

    @classmethod
    def load(cls, path, starting=0):
        ledger = cls(starting)
        try:
            with open(path) as f:
                items = json.load(f)
        except FileNotFoundError:
            return ledger
        for item in items:
            ledger.add(Entry(item["amount"], item["category"]))
        return ledger
`;

const ledgerV10 = `import argparse
import json
from dataclasses import dataclass, asdict

LEDGER_PATH = "ledger.json"


@dataclass
class Entry:
    amount: int
    category: str


class Ledger:
    def __init__(self, starting=0):
        self.starting = starting
        self.entries = []

    def add(self, entry):
        self.entries.append(entry)

    @property
    def balance(self):
        return self.starting + sum(e.amount for e in self.entries)

    def by_category(self):
        totals = {}
        for e in self.entries:
            totals[e.category] = totals.get(e.category, 0) + e.amount
        return totals

    def save(self, path):
        with open(path, "w") as f:
            json.dump([asdict(e) for e in self.entries], f)

    @classmethod
    def load(cls, path, starting=0):
        ledger = cls(starting)
        try:
            with open(path) as f:
                items = json.load(f)
        except FileNotFoundError:
            return ledger
        for item in items:
            ledger.add(Entry(item["amount"], item["category"]))
        return ledger


def test_balance_sums_amounts():
    ledger = Ledger()
    ledger.add(Entry(-30, "food"))
    ledger.add(Entry(50, "salary"))
    assert ledger.balance == 20

def test_by_category_groups():
    ledger = Ledger()
    ledger.add(Entry(-30, "food"))
    ledger.add(Entry(-10, "food"))
    assert ledger.by_category() == {"food": -40}

def test_empty_ledger():
    assert Ledger().balance == 0
    assert Ledger().by_category() == {}

def run_tests():
    tests = [test_balance_sums_amounts, test_by_category_groups, test_empty_ledger]
    for test in tests:
        test()
    print(f"{len(tests)} tests passed")


def build_parser():
    parser = argparse.ArgumentParser(description="Ledger v1.0")
    sub = parser.add_subparsers(dest="command", required=True)
    add = sub.add_parser("add", help="record an entry")
    add.add_argument("amount", type=int, help="whole number; negative is an expense")
    add.add_argument("category", help="for example food or salary")
    sub.add_parser("balance", help="print the balance")
    sub.add_parser("report", help="totals per category")
    sub.add_parser("selftest", help="run the built-in tests")
    return parser


def main():
    args = build_parser().parse_args()
    if args.command == "selftest":
        run_tests()
        return
    ledger = Ledger.load(LEDGER_PATH)
    if args.command == "add":
        ledger.add(Entry(args.amount, args.category))
        ledger.save(LEDGER_PATH)
        print(f"Added {args.amount} to {args.category}")
    elif args.command == "balance":
        print(f"Balance: {ledger.balance}")
    elif args.command == "report":
        totals = ledger.by_category()
        for category in sorted(totals):
            print(f"{category}: {totals[category]}")
        print(f"Entries: {len(ledger.entries)}")


if __name__ == "__main__":
    main()
`;

const l85: Lesson = {
  id: 'py-8-5',
  title: 'Project: Ledger v1.0',
  objective: 'Ship the ledger as a tested command-line tool with add, balance, report and selftest verbs.',
  minutes: 30,
  lexicon: [
    { id: 'py.8.contract', term: 'I/O contract', kind: 'concept', meaning: 'The exact commands a program accepts and the exact lines it prints for each. Tests check the contract, so it is written down before the code and changed only on purpose.', example: '# main.py balance  -> Balance: <sum of all amounts>\n# main.py report   -> <category>: <total> per line, then Entries: <k>' },
    { id: 'py.8.fixture', term: 'fixture', kind: 'concept', meaning: 'A known starting state (a file, a list of entries) prepared before a test runs, so the result is predictable and the test can state it exactly.', example: 'ledger = Ledger()\nledger.add(Entry(-20, "food"))   # the fixture\nassert ledger.balance == -20', analogy: 'The set of a play: built before the curtain rises, identical every night. It breaks for state the test cannot control, such as the real clock or the network; keep those out of the functions you test.' },
    { id: 'py.8.selftest', term: 'selftest subcommand', kind: 'pattern', meaning: 'A verb that runs the program\'s own tests and prints <n> tests passed. Wherever the program is copied, it can prove it still works.', example: 'if args.command == "selftest":\n    run_tests()' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The whole program, function by function',
      body: `Ledger v1.0 is v0.7 with a command line in front and tests inside. Nothing about \`Entry\` or \`Ledger\` changes; that is the payoff of separating data from interaction in Module 7.

The **contract** is the spec you will be tested against:

- \`main.py add <amount> <category>\` appends to \`ledger.json\` and prints \`Added <amount> to <category>\`
- \`main.py balance\` prints \`Balance: <sum of all amounts>\`
- \`main.py report\` prints \`<category>: <total>\` per category, sorted, then \`Entries: <k>\`
- \`main.py selftest\` prints \`<n> tests passed\`

With no \`ledger.json\` present, \`balance\` prints \`Balance: 0\` and \`report\` prints only \`Entries: 0\`. Each command is one fresh run of the program, so every verb except \`selftest\` starts by loading the file.

Read the example bottom-up: the guard, then \`main\`, then the parser, then the tests, and the classes last, because you already know them.`,
      example: {
        language: 'python',
        source: ledgerV10.trimEnd(),
        labels: [
          { lines: [1, 5], label: 'Standard library only. The file name lives in one place.' },
          { lines: [8, 11], label: 'Unchanged from v0.7: an entry is an amount and a category.' },
          { lines: [14, 46], label: 'Unchanged from v0.7: the ledger owns the entries, computes the balance and totals, and saves and loads JSON. A missing file means an empty ledger.' },
          { lines: [49, 63], label: 'Three pure tests on the class: a fixture of entries, then a claim. No files, no argv.' },
          { lines: [65, 69], label: 'The runner from lesson 8-1.' },
          { lines: [72, 81], label: 'The command line: four verbs, only add has arguments. Building the parser in its own function keeps main readable.' },
          { lines: [84, 100], label: 'Dispatch. selftest needs no file; every other verb loads first. add is the only one that saves.' },
          { lines: [103, 104], label: 'The guard: tests can import this file without running main().' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The working directory holds `ledger.json` containing `[{"amount": -20, "category": "food"}, {"amount": 100, "category": "salary"}, {"amount": -15, "category": "food"}]`. What does `python main.py report` print?',
      code: {
        language: 'python',
        source: `    def by_category(self):
        totals = {}
        for e in self.entries:
            totals[e.category] = totals.get(e.category, 0) + e.amount
        return totals

# ... inside main(), after ledger = Ledger.load(LEDGER_PATH):
    elif args.command == "report":
        totals = ledger.by_category()
        for category in sorted(totals):
            print(f"{category}: {totals[category]}")
        print(f"Entries: {len(ledger.entries)}")`,
      },
      choices: ['food: -35\nsalary: 100\nEntries: 3', 'food: -20\nsalary: 100\nfood: -15\nEntries: 3', 'salary: 100\nfood: -35\nEntries: 3', 'food: -35\nsalary: 100\nEntries: 2'],
      answer: 'food: -35\nsalary: 100\nEntries: 3',
      explanation: 'Two food entries merge into one total (-20 + -15 = -35). `sorted` puts food before salary. `Entries` counts entries, not categories, so it is 3.',
    },
    {
      kind: 'create',
      prompt: `Write Ledger v1.0. The starter is your v0.7 \`Entry\` and \`Ledger\`; keep them and add the rest.

- At least three \`test_\` functions on \`Ledger\` and a \`run_tests()\` that prints \`<n> tests passed\`.
- An argparse parser with subcommands \`add <amount> <category>\` (\`type=int\`), \`balance\`, \`report\`, \`selftest\`.
- \`add\` loads \`ledger.json\` if present, appends the entry, saves, and prints \`Added <amount> to <category>\`.
- \`balance\` prints \`Balance: <sum>\`; \`report\` prints \`<category>: <total>\` per category in sorted order, then \`Entries: <k>\`. Without a file: \`Balance: 0\` and just \`Entries: 0\`.
- \`main()\` under \`if __name__ == "__main__":\`.`,
      language: 'python',
      starter: ledgerV07,
      tests: [
        { description: 'add prints its line', argv: ['add', '50', 'food'], expectedStdout: 'Added 50 to food' },
        { description: 'add an expense to an existing file', argv: ['add', '-30', 'food'], files: { 'ledger.json': '[{"amount": 100, "category": "salary"}]' }, expectedStdout: 'Added -30 to food' },
        { description: 'balance without a file', argv: ['balance'], expectedStdout: 'Balance: 0' },
        { description: 'balance with two entries', argv: ['balance'], files: { 'ledger.json': '[{"amount": -20, "category": "food"}, {"amount": 100, "category": "salary"}]' }, expectedStdout: 'Balance: 80' },
        { description: 'report without a file', argv: ['report'], expectedStdout: 'Entries: 0' },
        { description: 'report with three entries in two categories', argv: ['report'], files: { 'ledger.json': '[{"amount": -20, "category": "food"}, {"amount": 100, "category": "salary"}, {"amount": -15, "category": "food"}]' }, expectedStdout: 'food: -35\nsalary: 100\nEntries: 3' },
        { description: 'selftest reports a count', argv: ['selftest'], expectedStdout: '^[1-9][0-9]* tests passed$', match: 'regex' },
        { description: 'help lists the verbs', argv: ['--help'], expectedStdout: '{add,balance,report,selftest}', match: 'contains' },
      ],
      hint: 'Order of work: tests and run_tests (run them by calling run_tests() at the bottom for now), then the parser, then main with one verb at a time, then the guard. Keep `selftest` free of file access.',
      solution: ledgerV10,
      projectNote: 'Ledger v1.0 complete: a command-line tool that stores entries, reports them, and proves itself with one command. It is ready to hand to someone else.',
    },
  ],
};

export const m8: Module = {
  id: 'py-m8',
  title: 'Testing and shipping',
  goal: "assert and unittest, argparse command lines, packaging, reading other people's code.",
  projectMilestone: 'Ledger v1.0: a tested command-line tool you can hand to someone else.',
  status: 'available',
  lessons: [l81, l82, l83, l84, l85],
};
