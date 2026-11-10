import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 6: Async and tests                                          */
/* v0.6: LedgerSharp proves itself with a self-test, reads its file   */
/* asynchronously, and learns what an interface buys it.              */
/* ------------------------------------------------------------------ */

const entryClass = `class Entry
{
    public int Amount { get; set; }
    public string Category { get; set; }

    public Entry() { }

    public Entry(int amount, string category)
    {
        Amount = amount;
        Category = category;
    }
}`;

/** The v0.5 Ledger, unchanged: the pure class every test in this module is about. */
const ledgerClass = `class Ledger
{
    private readonly List<Entry> _entries = new List<Entry>();
    public int Starting { get; }

    public Ledger(int starting)
    {
        Starting = starting;
    }

    public void Add(Entry entry)
    {
        _entries.Add(entry);
    }

    public int Count
    {
        get { return _entries.Count; }
    }

    public List<Entry> Entries
    {
        get { return new List<Entry>(_entries); }
    }

    public int Balance
    {
        get { return Starting + _entries.Sum(e => e.Amount); }
    }

    public Dictionary<string, int> ByCategory()
    {
        return _entries
            .GroupBy(e => e.Category)
            .ToDictionary(g => g.Key, g => g.Sum(e => e.Amount));
    }

    public string TopCategory()
    {
        var expenses = ByCategory().Where(p => p.Value < 0).OrderBy(p => p.Value).ToList();
        if (expenses.Count == 0)
        {
            return null;
        }
        return expenses[0].Key;
    }
}`;

const checkHelper = `    static int _passed = 0;

    static void Check(bool ok, string name)
    {
        if (ok)
        {
            _passed = _passed + 1;
        }
        else
        {
            Console.WriteLine("FAIL: " + name);
        }
    }`;

/* ---------------------------- 6-1 --------------------------------- */

const selfTestExample = `using System;
using System.Collections.Generic;
using System.Linq;

${entryClass}

class Ledger
{
    private readonly List<Entry> _entries = new List<Entry>();
    public int Starting { get; }

    public Ledger(int starting)
    {
        Starting = starting;
    }

    public void Add(Entry entry)
    {
        _entries.Add(entry);
    }

    public int Count
    {
        get { return _entries.Count; }
    }

    public int Balance
    {
        get { return Starting + _entries.Sum(e => e.Amount); }
    }

    public Dictionary<string, int> ByCategory()
    {
        return _entries
            .GroupBy(e => e.Category)
            .ToDictionary(g => g.Key, g => g.Sum(e => e.Amount));
    }
}

class Program
{
${checkHelper}

    static int SelfTest()
    {
        _passed = 0;
        var empty = new Ledger(100);
        Check(empty.Count == 0, "new ledger has no entries");
        Check(empty.Balance == 100, "empty balance is the starting amount");

        var ledger = new Ledger(100);
        ledger.Add(new Entry(-30, "food"));
        ledger.Add(new Entry(50, "salary"));
        ledger.Add(new Entry(-10, "food"));
        Check(ledger.Balance == 110, "balance adds every amount to starting");
        Check(ledger.ByCategory()["food"] == -40, "food total accumulates");
        Check(ledger.ByCategory().Count == 2, "one total per category");
        return _passed;
    }

    static void Main(string[] args)
    {
        Console.WriteLine($"{SelfTest()} tests passed");
    }
}`;

const selfTestSolution = selfTestExample + '\n';

const selfTestStarter = selfTestSolution
  .replace('        get { return Starting + _entries.Sum(e => e.Amount); }', '        get { return _entries.Sum(e => e.Amount); }')
  .replace('        Check(ledger.ByCategory()["food"] == -40, "food total accumulates");\n        Check(ledger.ByCategory().Count == 2, "one total per category");\n', '        Check(ledger.ByCategory()["food"] == -40, "food total accumulates");\n');

const selfTestStarterExpectedSolution = selfTestSolution
  .replace('        Check(ledger.ByCategory()["food"] == -40, "food total accumulates");\n        Check(ledger.ByCategory().Count == 2, "one total per category");\n', '        Check(ledger.ByCategory()["food"] == -40, "food total accumulates");\n');

const selfTestCreateStarter = `using System;
using System.Collections.Generic;
using System.Linq;

${entryClass}

${ledgerClass}

class Program
{
${checkHelper}

    static int SelfTest()
    {
        _passed = 0;
        // TODO: at least five checks: Count, Balance (empty and filled), ByCategory, TopCategory (none and one)
        return _passed;
    }

    static void Main(string[] args)
    {
        Console.WriteLine($"{SelfTest()} tests passed");
    }
}
`;

const selfTestCreateSolution = `using System;
using System.Collections.Generic;
using System.Linq;

${entryClass}

${ledgerClass}

class Program
{
${checkHelper}

    static int SelfTest()
    {
        _passed = 0;
        var empty = new Ledger(100);
        Check(empty.Count == 0, "new ledger has no entries");
        Check(empty.Balance == 100, "empty balance is the starting amount");
        Check(empty.TopCategory() == null, "no expenses means no top category");

        var ledger = new Ledger(100);
        ledger.Add(new Entry(-30, "food"));
        ledger.Add(new Entry(50, "salary"));
        ledger.Add(new Entry(-10, "food"));
        Check(ledger.Count == 3, "count is the number of entries added");
        Check(ledger.Balance == 110, "balance adds every amount to starting");
        Check(ledger.ByCategory()["food"] == -40, "food total accumulates");
        Check(ledger.ByCategory()["salary"] == 50, "salary total is kept apart");
        Check(ledger.TopCategory() == "food", "top is the most negative category");
        return _passed;
    }

    static void Main(string[] args)
    {
        Console.WriteLine($"{SelfTest()} tests passed");
    }
}
`;

/** Matches a whole output that is exactly one line `<n> tests passed` with n >= min, and no FAIL lines. */
const onlyPassedLine = (min: number) => `(?<![\\s\\S])([${min}-9]|[1-9][0-9]+) tests passed\\s*(?![\\s\\S])`;

const l61: Lesson = {
  id: 'cs-6-1',
  title: 'Proving it works',
  objective: 'Write a self-test that makes claims about a pure class with a Check helper, counts the passes, and names each failure.',
  minutes: 22,
  lexicon: [
    { id: 'cs.6.check', term: 'static void Check(bool ok, string name)', kind: 'pattern', meaning: 'The smallest test helper: count a true claim, print `FAIL: <name>` for a false one, and keep going. The name is for the human reading the output; the bool is the claim.', example: 'static void Check(bool ok, string name)\n{\n    if (ok) _passed = _passed + 1;\n    else Console.WriteLine("FAIL: " + name);\n}', analogy: 'A claim in an argument: "this must hold". It breaks because a spoken claim can be vague; a Check must be a bool the program can evaluate.' },
    { id: 'cs.6.selftest', term: 'static int SelfTest()', kind: 'pattern', meaning: 'A method that builds a known fixture in memory, makes claims about it with Check, and returns how many held. It touches no files and reads no input, so it gives the same answer on every machine.', example: 'static int SelfTest()\n{\n    _passed = 0;\n    var ledger = new Ledger(100);\n    ledger.Add(new Entry(-30, "food"));\n    Check(ledger.Balance == 70, "balance after one expense");\n    return _passed;\n}' },
    { id: 'cs.6.pure-method', term: 'pure (testable) method', kind: 'concept', meaning: 'A method whose result depends only on its inputs and the object\'s state, with no Console, no File, no clock. Ledger.Balance is pure; Main is not. Tests target the pure parts, which is a reason to keep logic out of Main.', example: 'Check(new Ledger(5).Balance == 5, "starting balance");   // pure: no input, no files' },
    { id: 'cs.6.failing-first', term: 'failing test first', kind: 'concept', meaning: 'Write the claim before the code that satisfies it, watch it print FAIL, then change the code until it passes. A test you have never seen fail may be testing nothing.', example: 'Check(ledger.TopCategory() == "food", "top category");   // FAIL until TopCategory exists' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A test is a claim the program checks for you',
      body: `You have been checking LedgerSharp by typing amounts and reading the transcript. A **self-test** does that checking for you, every time, in a fraction of a second.

The tool is tiny. \`Check(bool ok, string name)\` counts a true claim and prints \`FAIL: <name>\` for a false one, then keeps going so one failure does not hide the rest. \`SelfTest()\` builds a **fixture** in memory, a ledger with known entries, makes claims about it, and returns the count. \`Main\` prints \`<n> tests passed\`.

Two habits make this work. Test the **pure** parts: \`Ledger\` has no Console and no File, so a claim about it is the same on every machine; \`Main\` is checked by the transcript tests you already know. And write the claim **first**: a check that prints FAIL, then passes once you fix the code, has proven it can tell the difference.`,
      example: {
        language: 'csharp',
        source: selfTestExample,
        labels: [
          { lines: [5, 17], label: 'The serializable Entry from Module 5.' },
          { lines: [19, 50], label: 'The class under test. Nothing in it prints or reads: it is pure.' },
          { lines: [54, 66], label: 'The helper: count or complain, never stop.' },
          { lines: [68, 73], label: 'Reset the count, then the first fixture: an empty ledger and two claims about it.' },
          { lines: [75, 82], label: 'A second fixture with three entries, three claims, and the count handed back.' },
          { lines: [85, 88], label: 'Prints `5 tests passed`. A FAIL line, if any, would appear above it.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python v1.0 used `assert` inside `test_` functions and a run_tests() runner. C# has no assert statement in ordinary builds, so Check is the assert: a bool and a message. Unlike assert, it does not stop at the first failure; that is a choice, not a limitation.' },
        { from: 'c', note: 'C has assert.h, which aborts the process on a false claim. Check is the same idea without the abort, so you see every failure in one run. Both are only as good as the claims you write.' },
      ],
    },
    {
      kind: 'predict',
      prompt: '`Balance` has a bug: its getter returns `_entries.Sum(e => e.Amount)` without `Starting`. With the `SelfTest` from the example, what does `Main` print?',
      code: { language: 'csharp', source: 'public int Balance\n{\n    get { return _entries.Sum(e => e.Amount); }\n}' },
      choices: [
        'FAIL: empty balance is the starting amount\nFAIL: balance adds every amount to starting\n3 tests passed',
        'FAIL: empty balance is the starting amount\n4 tests passed',
        'The program ends with an exception at the first failed check',
        '5 tests passed',
      ],
      answer: 'FAIL: empty balance is the starting amount\nFAIL: balance adds every amount to starting\n3 tests passed',
      explanation: 'The empty ledger now reports 0, not 100, and the filled one reports 10, not 110: both balance claims are false and each prints its FAIL line. Check never throws, so the three remaining claims still run and are counted. The count is of passes only, so the last line says 3.',
    },
    {
      kind: 'predict',
      prompt: '`Ledger` is correct, but one claim was typed wrong. What is printed?',
      code: { language: 'csharp', source: 'var ledger = new Ledger(0);\nledger.Add(new Entry(-30, "food"));\nledger.Add(new Entry(-10, "food"));\nCheck(ledger.ByCategory()["food"] == -30, "food total");\nCheck(ledger.Balance == -40, "balance");\nreturn _passed;' },
      choices: ['FAIL: food total\n1 tests passed', '2 tests passed', 'FAIL: balance\n1 tests passed', 'The program ends with a KeyNotFoundException'],
      answer: 'FAIL: food total\n1 tests passed',
      explanation: 'Two food entries total -40, so the claim `== -30` is false and prints its name; the balance claim is true. A failing check means the code and the claim disagree, and here the **claim** is wrong. Read both before changing either.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the `Check` helper (first line indented 4 spaces, inside `Program`). It counts a true claim and names a false one, and never stops the run.',
      language: 'csharp',
      indentation: true,
      solution: [
        '    static void Check(bool ok, string name)',
        '    {',
        '        if (ok)',
        '        {',
        '            _passed = _passed + 1;',
        '        }',
        '        else',
        '        {',
        '            Console.WriteLine("FAIL: " + name);',
        '        }',
        '    }',
      ],
      distractors: ['    static void Check(bool ok)', '            throw new Exception("FAIL: " + name);', '        assert ok;'],
      explanation: 'Without the name parameter a failure prints nothing useful. Throwing ends the run at the first failure and the count is never printed; this helper reports and continues. `assert` is not a C# statement.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the self-test: its return type, the reset, the claim and the result.',
      language: 'csharp',
      template: `static {{ret}} SelfTest()
{
    _passed = {{reset}};
    var ledger = new Ledger(100);
    ledger.Add(new Entry(-30, "food"));
    {{claim}}(ledger.Balance == 70, "balance after one expense");
    return {{result}};
}

static void Main(string[] args)
{
    Console.WriteLine($"{SelfTest()} tests passed");
}`,
      blanks: [
        { id: 'ret', answers: ['int'], hint: 'Main prints what SelfTest returns as a number' },
        { id: 'reset', answers: ['0'], hint: 'start counting from nothing each run' },
        { id: 'claim', answers: ['Check'], hint: 'the helper that counts or complains' },
        { id: 'result', answers: ['_passed'], hint: 'the counter the helper increments' },
      ],
      explanation: 'SelfTest returns an int, resets the counter, makes claims through Check and returns the count.',
    },
    {
      kind: 'modify',
      prompt: 'The self-test was written first, and it fails: running the program prints two FAIL lines and `2 tests passed`. Read the failing claims, find the bug in `Ledger`, and fix the **class**, not the tests, until the output is `4 tests passed`.',
      language: 'csharp',
      starter: selfTestStarter,
      tests: [
        { description: 'all four claims hold', expectedStdout: '4 tests passed' },
      ],
      hint: 'Both failing claims mention the starting amount. Compare the Balance getter with the Module 5 version: what should the sum be added to?',
      solution: selfTestStarterExpectedSolution,
    },
    {
      kind: 'create',
      prompt: 'Write `SelfTest` for the v0.5 `Ledger` given in the starter. Make at least five claims with `Check`, covering `Count`, `Balance` on an empty and on a filled ledger, a `ByCategory` total, and `TopCategory` both when there is no expense (null) and when there is one. Build the fixtures in memory; touch no files. `Main` prints `<n> tests passed` and nothing else.',
      language: 'csharp',
      starter: selfTestCreateStarter,
      tests: [
        { description: 'at least five claims, all passing', expectedStdout: onlyPassedLine(5), match: 'regex' },
      ],
      hint: 'Two fixtures are enough: `new Ledger(100)` with nothing added, and one with -30 food, 50 salary, -10 food. For TopCategory compare with `== null` and `== "food"`.',
      solution: selfTestCreateSolution,
      projectNote: 'This SelfTest is the one LedgerSharp v0.6 runs when the user types `selftest`. The claims are about Ledger alone, which is why Ledger stayed free of Console and File since Module 3.',
    },
  ],
};

/* ---------------------------- 6-2 --------------------------------- */

const xunitClass = `using Xunit;

public class LedgerTests
{
    [Fact]
    public void EmptyLedgerBalanceIsStarting()
    {
        var ledger = new Ledger(100);
        Assert.Equal(100, ledger.Balance);
    }

    [Fact]
    public void BalanceAddsEveryAmount()
    {
        var ledger = new Ledger(100);
        ledger.Add(new Entry(-30, "food"));
        ledger.Add(new Entry(50, "salary"));
        Assert.Equal(120, ledger.Balance);
    }

    [Fact]
    public void FoodTotalAccumulates()
    {
        var ledger = new Ledger(0);
        ledger.Add(new Entry(-30, "food"));
        ledger.Add(new Entry(-10, "food"));
        Assert.True(ledger.ByCategory().ContainsKey("food"));
        Assert.Equal(-40, ledger.ByCategory()["food"]);
    }
}`;

const assertEqualHelper = `    static int _passed = 0;

    static void AssertEqual(int expected, int actual, string name)
    {
        if (expected == actual)
        {
            _passed = _passed + 1;
        }
        else
        {
            Console.WriteLine($"FAIL: {name}: expected {expected}, got {actual}");
        }
    }`;

const translateSolution = `using System;
using System.Collections.Generic;
using System.Linq;

${entryClass}

${ledgerClass}

class Program
{
${assertEqualHelper}

    // The xUnit class this mirrors:
    //
    // [Fact] public void EmptyLedgerBalanceIsStarting()
    //     => Assert.Equal(100, new Ledger(100).Balance);
    // [Fact] public void BalanceAddsEveryAmount()
    //     => ledger(100) + (-30 food) + (50 salary); Assert.Equal(120, ledger.Balance);
    // [Fact] public void FoodTotalAccumulates()
    //     => ledger(0) + (-30 food) + (-10 food); Assert.Equal(-40, ledger.ByCategory()["food"]);

    static int SelfTest()
    {
        _passed = 0;
        AssertEqual(100, new Ledger(100).Balance, "EmptyLedgerBalanceIsStarting");

        var ledger = new Ledger(100);
        ledger.Add(new Entry(-30, "food"));
        ledger.Add(new Entry(50, "salary"));
        AssertEqual(120, ledger.Balance, "BalanceAddsEveryAmount");

        var food = new Ledger(0);
        food.Add(new Entry(-30, "food"));
        food.Add(new Entry(-10, "food"));
        AssertEqual(-40, food.ByCategory()["food"], "FoodTotalAccumulates");
        return _passed;
    }

    static void Main(string[] args)
    {
        Console.WriteLine($"{SelfTest()} tests passed");
    }
}
`;

const translateStarter = translateSolution.replace(
  `        AssertEqual(100, new Ledger(100).Balance, "EmptyLedgerBalanceIsStarting");

        var ledger = new Ledger(100);
        ledger.Add(new Entry(-30, "food"));
        ledger.Add(new Entry(50, "salary"));
        AssertEqual(120, ledger.Balance, "BalanceAddsEveryAmount");

        var food = new Ledger(0);
        food.Add(new Entry(-30, "food"));
        food.Add(new Entry(-10, "food"));
        AssertEqual(-40, food.ByCategory()["food"], "FoodTotalAccumulates");
        return _passed;`,
  `        AssertEqual(100, new Ledger(100).Balance, "EmptyLedgerBalanceIsStarting");
        // TODO: BalanceAddsEveryAmount
        // TODO: FoodTotalAccumulates
        return _passed;`,
);

const l62: Lesson = {
  id: 'cs-6-2',
  title: 'xUnit: the same claims, run by a tool',
  objective: 'Read an xUnit test class, predict what dotnet test reports, and set up a test project that references the code under test.',
  minutes: 20,
  lexicon: [
    { id: 'cs.6.fact', term: '[Fact]', kind: 'pattern', meaning: 'An attribute that marks a public void method as one xUnit test. The runner finds every [Fact] by reflection; a method without it is never run, however test-like its name.', example: '[Fact]\npublic void EmptyLedgerBalanceIsStarting()\n{\n    Assert.Equal(100, new Ledger(100).Balance);\n}' },
    { id: 'cs.6.assert-equal', term: 'Assert.Equal(expected, actual)', kind: 'builtin', meaning: 'Fail the test unless the two values are equal, and show both in the report. The expected value goes first; swap them and every failure message reads backwards.', example: 'Assert.Equal(-40, ledger.ByCategory()["food"]);\nAssert.True(ledger.Count > 0);' },
    { id: 'cs.6.dotnet-new-xunit', term: 'dotnet new xunit -o LedgerSharp.Tests', kind: 'pattern', meaning: 'Create a test project: a .csproj that references xUnit and the test runner, plus one sample test. Tests live in their own project next to the code they test, never inside it.', example: 'dotnet new classlib -o LedgerSharp\ndotnet new xunit -o LedgerSharp.Tests' },
    { id: 'cs.6.project-reference', term: 'dotnet add reference ../LedgerSharp/LedgerSharp.csproj', kind: 'pattern', meaning: 'Let one project use the public types of another. The test project references the library; the library never references the tests.', example: 'cd LedgerSharp.Tests\ndotnet add reference ../LedgerSharp/LedgerSharp.csproj' },
    { id: 'cs.6.dotnet-test', term: 'dotnet test', kind: 'pattern', meaning: 'Build the test project and its references, run every [Fact], and print one line per failure with the expected and actual values, then a summary: Failed, Passed, Skipped, Total. The exit code is non-zero when anything failed, which is what a build pipeline reads.', example: 'dotnet test\n# Passed!  - Failed: 0, Passed: 3, Skipped: 0, Total: 3' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Attributes instead of a list',
      body: `Your \`SelfTest\` has two weaknesses: you call each claim by hand, and the report is a single number. **xUnit**, the test framework .NET projects use by default, fixes both. Each test is a public void method marked with the **attribute** \`[Fact]\`; the runner finds every one by reflection, so there is no list to maintain. Inside, \`Assert.Equal(expected, actual)\` replaces \`Check(a == b, name)\` and, on failure, prints **both** values. The method name is the test's name.

Tests live in a separate **test project** that references the code under test. \`dotnet test\` builds both, runs every Fact, prints one block per failure and a summary line, and exits non-zero when anything failed.

The in-app runner compiles a single file with no packages, so this app cannot run xUnit; read it here, and run it on your own machine. The runnable steps keep the SelfTest style, which is what LedgerSharp ships with.`,
      example: {
        language: 'csharp',
        source: xunitClass,
        labels: [
          { lines: [1, 1], label: 'The framework namespace. It comes from the xunit package the test project references.' },
          { lines: [3, 3], label: 'A public class of tests. The runner looks inside every public class.' },
          { lines: [5, 10], label: 'One test: the attribute, a public void method, a fixture and one claim. Expected first.' },
          { lines: [12, 19], label: 'A second test with its own fixture. Tests never share a ledger, so order does not matter.' },
          { lines: [21, 29], label: 'Several asserts in one test are fine; the first failing one ends that test and the others still run.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`[Fact]` is what the `test_` prefix did for unittest and pytest: discovery by marking rather than by listing. `Assert.Equal(expected, actual)` is `self.assertEqual(actual, expected)` with the arguments the other way round, a trap when switching.' },
      ],
    },
    {
      kind: 'concept',
      title: 'Two projects and one command',
      body: `A test project is an ordinary project whose \`.csproj\` references xUnit and a test runner. \`dotnet new xunit\` creates it; \`dotnet add reference\` points it at the library so the tests can see \`Ledger\` and \`Entry\`. The library never references the tests, so shipping it ships no test code.

\`dotnet test\` is the whole workflow: restore, build both projects, run, report. The summary line is what you read first; the failure blocks above it say which claim broke and show expected and actual. Exact spacing and timings vary between versions, which is another reason the in-app runner compares your own SelfTest output instead.`,
      example: {
        language: 'shell',
        source: `dotnet new classlib -o LedgerSharp
dotnet new xunit -o LedgerSharp.Tests
cd LedgerSharp.Tests
dotnet add reference ../LedgerSharp/LedgerSharp.csproj
dotnet test
#   Failed BalanceAddsEveryAmount
#   Assert.Equal() Failure
#   Expected: 120
#   Actual:   20
# Failed!  - Failed: 1, Passed: 2, Skipped: 0, Total: 3`,
        labels: [
          { lines: [1, 2], label: 'Two projects side by side: the code, and the tests for it.' },
          { lines: [3, 4], label: 'From inside the test project, reference the library it tests.' },
          { lines: [5, 5], label: 'Build everything, run every Fact, report.' },
          { lines: [6, 9], label: 'One failure block: the test name, the kind of claim, both values.' },
          { lines: [10, 10], label: 'The summary. Non-zero exit code when Failed is not 0.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: '`Balance` has the bug from the previous lesson (it ignores `Starting`, so this ledger reports 20). The test was written with the arguments in this order. What does the failure block say?',
      code: { language: 'csharp', source: '[Fact]\npublic void BalanceAddsEveryAmount()\n{\n    var ledger = new Ledger(100);\n    ledger.Add(new Entry(-30, "food"));\n    ledger.Add(new Entry(50, "salary"));\n    Assert.Equal(ledger.Balance, 120);\n}' },
      choices: ['Expected: 20\nActual:   120', 'Expected: 120\nActual:   20', 'The test passes', 'A compile error: the arguments are in the wrong order'],
      answer: 'Expected: 20\nActual:   120',
      explanation: 'Assert.Equal cannot know which argument is your intention; it labels the first one Expected. With the computed value first, the report claims you expected the wrong number 20 and got the right one, 120. The test still fails correctly; the message lies. Keep the literal first.',
    },
    {
      kind: 'predict',
      prompt: '`Classify(0)` wrongly returns `expense`. What does `dotnet test` report for this class?',
      code: { language: 'csharp', source: 'public class ClassifyTests\n{\n    [Fact]\n    public void Negative() { Assert.Equal("expense", Program.Classify(-5)); }\n\n    public void Zero() { Assert.Equal("nothing", Program.Classify(0)); }\n\n    [Fact]\n    public void Positive() { Assert.Equal("income", Program.Classify(7)); }\n}' },
      choices: ['Passed!  - Failed: 0, Passed: 2, Skipped: 0, Total: 2', 'Failed!  - Failed: 1, Passed: 2, Skipped: 0, Total: 3', 'Failed!  - Failed: 1, Passed: 1, Skipped: 1, Total: 3', 'A compile error: Zero has no attribute'],
      answer: 'Passed!  - Failed: 0, Passed: 2, Skipped: 0, Total: 2',
      explanation: '`Zero` has no `[Fact]`, so the runner never sees it: it is an ordinary method that compiles fine and is never called. The bug stays hidden behind a green summary of two tests. Discovery by attribute is convenient and silent; a forgotten attribute is a test that does not exist.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble one xUnit test (first line indented 4 spaces, inside the test class): a ledger starting at 100 with one -30 expense has a balance of 70.',
      language: 'csharp',
      indentation: true,
      solution: [
        '    [Fact]',
        '    public void BalanceAfterOneExpense()',
        '    {',
        '        var ledger = new Ledger(100);',
        '        ledger.Add(new Entry(-30, "food"));',
        '        Assert.Equal(70, ledger.Balance);',
        '    }',
      ],
      distractors: ['    [Test]', '    public int BalanceAfterOneExpense()', '        Assert.Equal(ledger.Balance, 70);'],
      explanation: '`[Test]` is NUnit\'s attribute; xUnit ignores it, so the method would never run. A test returns void. Expected first: with the arguments swapped the test still fails on a bug, but its message reads backwards.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the test and the commands that run it.',
      language: 'csharp',
      template: `[{{attr}}]
public void FoodTotalAccumulates()
{
    var ledger = new Ledger(0);
    ledger.Add(new Entry(-30, "food"));
    ledger.Add(new Entry(-10, "food"));
    Assert.{{method}}({{expected}}, ledger.ByCategory()["food"]);
}

// in the terminal, inside LedgerSharp.Tests:
//   dotnet add {{ref}} ../LedgerSharp/LedgerSharp.csproj
//   dotnet {{run}}`,
      blanks: [
        { id: 'attr', answers: ['Fact'], hint: 'the attribute the runner looks for' },
        { id: 'method', answers: ['Equal'], hint: 'the two-value claim' },
        { id: 'expected', answers: ['-40'], hint: 'the literal goes first: what two food entries of -30 and -10 total' },
        { id: 'ref', answers: ['reference'], hint: 'the command that lets the tests see the library' },
        { id: 'run', answers: ['test'], hint: 'build, run every Fact, report' },
      ],
      explanation: '[Fact] marks the test, Assert.Equal(-40, actual) makes the claim, `dotnet add reference` links the projects and `dotnet test` runs them.',
    },
    {
      kind: 'modify',
      prompt: 'The comment shows three xUnit tests. Only the first has been translated into the SelfTest style. Translate the other two using the `AssertEqual(expected, actual, name)` helper, with the xUnit method name as the name, so the program prints `3 tests passed`.',
      language: 'csharp',
      starter: translateStarter,
      tests: [
        { description: 'three translated claims', expectedStdout: '3 tests passed' },
      ],
      hint: 'Each [Fact] becomes a fixture (a ledger plus its Add calls) and one AssertEqual with the literal first, exactly as in Assert.Equal.',
      solution: translateSolution,
    },
  ],
};

/* ---------------------------- 6-3 --------------------------------- */

const asyncExample = `using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

class Program
{
    static async Task<int> CountLines(string path)
    {
        Console.WriteLine("reading " + path);
        string text = await File.ReadAllTextAsync(path);
        Console.WriteLine("read " + path);
        return text.Split('\\n').Count(l => l.Trim().Length > 0);
    }

    static async Task<string> Slow(string name, int ms)
    {
        Console.WriteLine("start " + name);
        await Task.Delay(ms);
        Console.WriteLine("done " + name);
        return name;
    }

    static async Task<int> Main(string[] args)
    {
        File.WriteAllText("a.txt", "one\\ntwo\\nthree\\n");
        int lines = await CountLines("a.txt");
        Console.WriteLine($"Lines: {lines}");
        Task<string> first = Slow("first", 200);
        Task<string> second = Slow("second", 100);
        Console.WriteLine("both started");
        string[] names = await Task.WhenAll(first, second);
        Console.WriteLine($"finished {names[0]} {names[1]}");
        return 0;
    }
}`;

const missingAwaitStarter = `using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

class Program
{
    static async Task<int> CountLines(string path)
    {
        Console.WriteLine("reading " + path);
        string text = await File.ReadAllTextAsync(path);
        Console.WriteLine("read " + path);
        return text.Split('\\n').Count(l => l.Trim().Length > 0);
    }

    static void Main(string[] args)
    {
        Console.WriteLine("Lines: " + CountLines("notes.txt"));
    }
}
`;

const missingAwaitSolution = `using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

class Program
{
    static async Task<int> CountLines(string path)
    {
        Console.WriteLine("reading " + path);
        string text = await File.ReadAllTextAsync(path);
        Console.WriteLine("read " + path);
        return text.Split('\\n').Count(l => l.Trim().Length > 0);
    }

    static async Task<int> Main(string[] args)
    {
        int lines = await CountLines("notes.txt");
        Console.WriteLine("Lines: " + lines);
        return 0;
    }
}
`;

const asyncTotalSolution = `using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

class Program
{
    static async Task<int> Main(string[] args)
    {
        if (!File.Exists("amounts.txt"))
        {
            Console.WriteLine("No amounts.txt");
            Console.WriteLine("Total: 0");
            return 0;
        }
        string text = await File.ReadAllTextAsync("amounts.txt");
        var amounts = text.Split('\\n')
            .Where(l => l.Trim().Length > 0)
            .Select(l => int.Parse(l.Trim()))
            .ToList();
        Console.WriteLine($"Read {amounts.Count} amounts");
        await File.WriteAllTextAsync("total.txt", amounts.Sum().ToString());
        string back = await File.ReadAllTextAsync("total.txt");
        Console.WriteLine($"Total: {back}");
        return 0;
    }
}
`;

const l63: Lesson = {
  id: 'cs-6-3',
  title: 'Waiting without blocking',
  objective: 'Read and write async methods: mark them async, return a Task, await the slow calls, and predict the order in which lines print.',
  minutes: 24,
  lexicon: [
    { id: 'cs.6.async', term: 'async', kind: 'keyword', meaning: 'A modifier on a method that may pause with await. It changes nothing about how the method is called; it lets the compiler rewrite the body so that each await can hand control back to the caller.', example: 'static async Task<int> CountLines(string path)' },
    { id: 'cs.6.task', term: 'Task / Task<int>', kind: 'builtin', meaning: 'A promise of work that may not have finished yet: Task for no result, Task<int> for an int that will exist later. An async method returns one as soon as it first pauses; await is how you get the value out.', example: 'Task<string> pending = File.ReadAllTextAsync("a.txt");\nstring text = await pending;', analogy: 'A ticket from a dry-cleaner: not the coat, but the promise of a coat. It breaks because you can call ToString on the ticket and get a type name, and nothing warns you that you forgot to collect the coat.' },
    { id: 'cs.6.await', term: 'await', kind: 'keyword', meaning: 'If the task is already finished, continue at once with its result. If not, pause this method, return to the caller, and resume right after the await when the task completes. Only legal inside an async method.', example: 'string text = await File.ReadAllTextAsync(path);', analogy: 'A bookmark: close the book, do something else, open it at the same page. It breaks because the method really does return to its caller in the meantime; the caller sees a Task, not a frozen program.' },
    { id: 'cs.6.readalltextasync', term: 'await File.ReadAllTextAsync(path)', kind: 'builtin', meaning: 'The asynchronous twin of ReadAllText: it starts the read and gives back a Task<string>; awaiting it yields the text once the disk has answered. WriteAllTextAsync is the twin of WriteAllText.', example: 'string text = await File.ReadAllTextAsync("ledger.json");\nawait File.WriteAllTextAsync("total.txt", "12");' },
    { id: 'cs.6.delay-whenall', term: 'Task.Delay(ms) / Task.WhenAll(a, b)', kind: 'builtin', meaning: 'Delay is a timer you can await without blocking a thread. WhenAll is a task that completes when every task given to it has; awaiting it yields their results as an array, in the order the tasks were given.', example: 'await Task.Delay(100);\nstring[] both = await Task.WhenAll(first, second);' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Pause here, come back later',
      body: `Reading a file or waiting on the network takes a long time by a processor's standards. A synchronous call makes the whole thread sit still. An **async** method does not: at \`await\`, if the task is not finished, the method **pauses, returns to its caller**, and resumes right after the await when the task completes. That is the notional machine for this lesson. If the task is already finished, await simply continues.

Three pieces of syntax carry it. \`async\` on the method; a return type of \`Task\` or \`Task<int>\`, the promise of an int to come; and \`await\` on each slow call. Returning an int from an \`async Task<int>\` method is written \`return 0;\`; the wrapping is done for you. \`Main\` itself may be \`static async Task<int> Main\`: the runtime awaits it and uses the int as the exit code.

The habit that matters: a call to an async method **without** await gives you the Task, not the value. The compiler often accepts that silently.`,
      example: {
        language: 'csharp',
        source: asyncExample,
        labels: [
          { lines: [4, 4], label: 'Task and Task<T> live here.' },
          { lines: [8, 14], label: 'An async method: it prints, pauses at the read, resumes to print again, and returns a plain int, which the compiler wraps in the Task.' },
          { lines: [16, 22], label: 'A method that pauses on a timer. Nothing blocks while it waits.' },
          { lines: [24, 24], label: 'An async entry point: the runtime awaits it and uses the int as the exit code.' },
          { lines: [27, 28], label: 'await unwraps the Task<int>: prints `reading a.txt`, `read a.txt`, `Lines: 3`.' },
          { lines: [29, 31], label: 'Two tasks started, neither awaited yet: both print their start line, then `both started`.' },
          { lines: [32, 33], label: 'Wait for both. The 100 ms one finishes first: `done second`, `done first`, then `finished first second`, in the order the tasks were given.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python has the same words, `async def` and `await`, and the same rule that a coroutine called without await does nothing useful. The difference is the runtime: .NET awaits Main for you, where Python needs asyncio.run(main()).' },
        { from: 'c', note: 'In C a slow read blocks the thread, and the alternatives are threads or callbacks you manage by hand. async/await is the compiler turning your straight-line method into a state machine that a callback resumes, so the code reads top to bottom while it runs in pieces.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Using `Slow` from the example, in what order do the lines print?',
      code: { language: 'csharp', source: 'Task<string> a = Slow("a", 300);\nTask<string> b = Slow("b", 100);\nConsole.WriteLine("waiting");\nawait Task.WhenAll(a, b);\nConsole.WriteLine("done");' },
      choices: ['start a\nstart b\nwaiting\ndone b\ndone a\ndone', 'start a\ndone a\nstart b\ndone b\nwaiting\ndone', 'waiting\nstart a\nstart b\ndone b\ndone a\ndone', 'start a\nstart b\nwaiting\ndone a\ndone b\ndone'],
      answer: 'start a\nstart b\nwaiting\ndone b\ndone a\ndone',
      explanation: 'Calling an async method runs it synchronously up to its first await: each prints its start line, then returns a Task at the Delay. Main continues and prints `waiting`. The 100 ms timer fires first, so `done b` precedes `done a`. WhenAll completes once both have, and `done` follows.',
    },
    {
      kind: 'predict',
      prompt: '`CountLines` is the async method from the example and `a.txt` has three lines. The author forgot something. What is printed first?',
      code: { language: 'csharp', source: 'Console.WriteLine("Lines: " + CountLines("a.txt"));' },
      choices: ['reading a.txt, then Lines: followed by the name of a Task type instead of a number', 'reading a.txt\nread a.txt\nLines: 3', 'A compile error: cannot add a string and a Task<int>', 'Lines: 0'],
      answer: 'reading a.txt, then Lines: followed by the name of a Task type instead of a number',
      explanation: 'Without await, the call returns the Task<int> as soon as CountLines pauses at its read. String + object compiles, calling ToString on the task, which prints its type name. `read a.txt` may print later or never, since Main does not wait. The fix is `await CountLines("a.txt")` inside an async Main.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble an async `Main` that reads `notes.txt` asynchronously, prints how many lines it has, and returns the exit code 0. Set the indentation yourself.',
      language: 'csharp',
      indentation: true,
      solution: [
        'static async Task<int> Main(string[] args)',
        '{',
        '    string text = await File.ReadAllTextAsync("notes.txt");',
        '    string[] lines = text.Split(\'\\n\');',
        '    Console.WriteLine($"Lines: {lines.Length}");',
        '    return 0;',
        '}',
      ],
      distractors: ['static async void Main(string[] args)', '    string text = File.ReadAllTextAsync("notes.txt");', '    Task<string> text = await File.ReadAllTextAsync("notes.txt");'],
      explanation: 'An async entry point must return Task or Task<int>; async void is not accepted as Main. Without await the right-hand side is a Task<string>, which cannot be assigned to a string. With await it is already the string, so declaring the variable as Task<string> is the opposite mistake.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the namespace, the signature and the awaited read.',
      language: 'csharp',
      template: `using System;
using System.IO;
using System.Threading.{{ns}};

class Program
{
    static {{mod}} Task<int> Main(string[] args)
    {
        string text = {{kw}} File.{{method}}("ledger.json");
        Console.WriteLine(text.Length);
        return 0;
    }
}`,
      blanks: [
        { id: 'ns', answers: ['Tasks'], hint: 'the namespace of Task' },
        { id: 'mod', answers: ['async'], hint: 'the modifier that allows await in the body' },
        { id: 'kw', answers: ['await'], hint: 'pause until the Task<string> has its string' },
        { id: 'method', answers: ['ReadAllTextAsync'], hint: 'the asynchronous twin of ReadAllText' },
      ],
      explanation: 'System.Threading.Tasks, an async Task<int> Main, and await on ReadAllTextAsync.',
    },
    {
      kind: 'modify',
      prompt: 'The program prints `Lines:` followed by a type name instead of the count. Make `Main` asynchronous (`async Task<int>`, returning 0) and await `CountLines`, so that the output is `reading notes.txt`, `read notes.txt`, `Lines: <n>`.',
      language: 'csharp',
      starter: missingAwaitStarter,
      tests: [
        { description: 'three lines', files: { 'notes.txt': 'rent paid\nfood -30\nbus -5\n' }, expectedStdout: 'reading notes.txt\nread notes.txt\nLines: 3' },
        { description: 'one line, no trailing newline', files: { 'notes.txt': 'only one' }, expectedStdout: 'reading notes.txt\nread notes.txt\nLines: 1' },
        { description: 'blank lines are not counted', files: { 'notes.txt': '\n\nfood -30\n\n' }, expectedStdout: 'reading notes.txt\nread notes.txt\nLines: 1' },
      ],
      hint: '`static async Task<int> Main(string[] args)`, then `int lines = await CountLines("notes.txt");` and `return 0;` at the end.',
      solution: missingAwaitSolution,
    },
    {
      kind: 'create',
      prompt: `Write an \`async Task<int> Main\` over \`amounts.txt\`, one whole number per line, possibly with blank lines:

- If the file does not exist print \`No amounts.txt\` and \`Total: 0\`, and return 0.
- Otherwise read it with \`await File.ReadAllTextAsync\`, print \`Read <k> amounts\` (non-blank lines only), write their sum to \`total.txt\` with \`await File.WriteAllTextAsync\`, read \`total.txt\` back with \`await File.ReadAllTextAsync\`, and print \`Total: <that text>\`. Return 0.`,
      language: 'csharp',
      tests: [
        { description: 'three amounts', files: { 'amounts.txt': '10\n-3\n5\n' }, expectedStdout: 'Read 3 amounts\nTotal: 12' },
        { description: 'blank lines and a negative total', files: { 'amounts.txt': '\n-40\n\n15\n' }, expectedStdout: 'Read 2 amounts\nTotal: -25' },
        { description: 'no file', expectedStdout: 'No amounts.txt\nTotal: 0' },
        { description: 'a single amount', files: { 'amounts.txt': '7' }, expectedStdout: 'Read 1 amounts\nTotal: 7' },
      ],
      hint: 'Split on \'\\n\', Where on Trim().Length > 0, Select int.Parse(l.Trim()), ToList. `amounts.Sum().ToString()` is the text to write. Every File.*Async call needs its own await.',
      solution: asyncTotalSolution,
      projectNote: 'LedgerSharp v0.6 reads ledger.json exactly this way: an async Main that awaits File.ReadAllTextAsync inside Storage. For one small file nothing is faster, but the shape is the one every web handler in Module 7 and the Azure track will have.',
    },
  ],
};

/* ---------------------------- 6-4 --------------------------------- */

const storageInterface = `interface IStorage
{
    List<Entry> Load();
    void Save(List<Entry> entries);
}`;

const jsonStorageClass = `class JsonStorage : IStorage
{
    private readonly string _path;

    public JsonStorage(string path)
    {
        _path = path;
    }

    public List<Entry> Load()
    {
        if (!File.Exists(_path))
        {
            return new List<Entry>();
        }
        try
        {
            List<Entry> entries = JsonSerializer.Deserialize<List<Entry>>(File.ReadAllText(_path));
            return entries == null ? new List<Entry>() : entries;
        }
        catch (JsonException)
        {
            return new List<Entry>();
        }
    }

    public void Save(List<Entry> entries)
    {
        File.WriteAllText(_path, JsonSerializer.Serialize(entries));
    }
}`;

const fakeStorageClass = `class FakeStorage : IStorage
{
    private List<Entry> _saved = new List<Entry>();
    public int SaveCalls { get; private set; }

    public List<Entry> Load()
    {
        return new List<Entry>(_saved);
    }

    public void Save(List<Entry> entries)
    {
        _saved = new List<Entry>(entries);
        SaveCalls = SaveCalls + 1;
    }
}`;

const archiveClass = `class Archive
{
    private readonly IStorage _storage;

    public Archive(IStorage storage)
    {
        _storage = storage;
    }

    public int Record(Entry entry)
    {
        List<Entry> all = _storage.Load();
        all.Add(entry);
        _storage.Save(all);
        return all.Count;
    }
}`;

const diUsings = `using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

`;

const diExample = `${diUsings}${entryClass}

${storageInterface}

${jsonStorageClass}

${fakeStorageClass}

${archiveClass}

class Program
{
    static void Main(string[] args)
    {
        var fake = new FakeStorage();
        var testArchive = new Archive(fake);
        testArchive.Record(new Entry(-30, "food"));
        testArchive.Record(new Entry(50, "salary"));
        Console.WriteLine($"Fake holds {fake.Load().Count} after {fake.SaveCalls} saves");

        var real = new Archive(new JsonStorage("ledger.json"));
        Console.WriteLine($"On disk: {real.Record(new Entry(-5, "bus"))}");
        Console.WriteLine(File.Exists("ledger.json"));
    }
}`;

const diProgramTail = `class Program
{
${checkHelper}

    static int SelfTest()
    {
        _passed = 0;
        var archive = new Archive(new FakeStorage());
        Check(archive.Record(new Entry(-30, "food")) == 1, "first record makes one entry");
        Check(archive.Record(new Entry(50, "salary")) == 2, "second record makes two");
        return _passed;
    }

    static void Main(string[] args)
    {
        Console.WriteLine($"{SelfTest()} tests passed");
        Console.WriteLine("Amount?");
        int amount = int.Parse(Console.ReadLine());
        Console.WriteLine("Category?");
        string category = Console.ReadLine();
        var archive = new Archive(new JsonStorage("ledger.json"));
        Console.WriteLine($"Entries on disk: {archive.Record(new Entry(amount, category))}");
    }
}
`;

const diModifySolution = `${diUsings}${entryClass}

${storageInterface}

${jsonStorageClass}

${fakeStorageClass}

${archiveClass}

${diProgramTail}`;

const diModifyStarter = diModifySolution
  .replace(
    `    private readonly IStorage _storage;

    public Archive(IStorage storage)
    {
        _storage = storage;
    }`,
    `    private readonly IStorage _storage = new JsonStorage("ledger.json");`,
  )
  .replace('        var archive = new Archive(new FakeStorage());', '        var archive = new Archive();')
  .replace('        var archive = new Archive(new JsonStorage("ledger.json"));', '        var archive = new Archive();');

const diCreateStarter = `${diUsings}${entryClass}

// TODO: interface IStorage with Load() and Save(entries)

${jsonStorageClass}

// TODO: class FakeStorage : IStorage, in memory

// TODO: class Archive with an IStorage injected through its constructor and int Record(Entry entry)

class Program
{
    static void Main(string[] args)
    {
        // TODO: Storage? -> memory | file; then the Amount/Category loop recording through the archive
    }
}
`;

const diCreateSolution = `${diUsings}${entryClass}

${storageInterface}

${jsonStorageClass}

${fakeStorageClass}

${archiveClass}

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Storage?");
        string choice = Console.ReadLine();
        IStorage storage;
        if (choice == "file")
        {
            storage = new JsonStorage("ledger.json");
        }
        else
        {
            storage = new FakeStorage();
        }
        var archive = new Archive(storage);
        Console.WriteLine("Amount (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            int amount = int.Parse(line);
            Console.WriteLine("Category?");
            string category = Console.ReadLine();
            Console.WriteLine($"Recorded {archive.Record(new Entry(amount, category))}");
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }
        Console.WriteLine($"Stored: {storage.Load().Count}");
        Console.WriteLine($"File exists: {File.Exists("ledger.json")}");
    }
}
`;

const l64: Lesson = {
  id: 'cs-6-4',
  title: 'A seam for testing: interfaces and injection',
  objective: 'Declare an interface, implement it twice, and hand the implementation to a class through its constructor so tests can run against a fake.',
  minutes: 24,
  lexicon: [
    { id: 'cs.6.interface', term: 'interface IStorage { ... }', kind: 'keyword', meaning: 'A contract: method signatures with no bodies. A class that implements it promises to provide every member. Names start with I by convention. An interface cannot be instantiated; only its implementations can.', example: 'interface IStorage\n{\n    List<Entry> Load();\n    void Save(List<Entry> entries);\n}', analogy: 'A job description rather than an employee. It breaks because a job description can be vague; an interface is checked by the compiler, member by member.' },
    { id: 'cs.6.implements', term: 'class JsonStorage : IStorage', kind: 'pattern', meaning: 'Declare that a class fulfils an interface. Every member of the interface must appear in the class as public with the same signature, or the class does not compile.', example: 'class FakeStorage : IStorage\n{\n    public List<Entry> Load() { ... }\n    public void Save(List<Entry> entries) { ... }\n}' },
    { id: 'cs.6.program-to-interface', term: 'IStorage storage = new FakeStorage();', kind: 'concept', meaning: 'A variable typed as the interface can hold any implementation. A call through it runs the method of the object actually there, decided at run time. Code written against the interface never changes when a new implementation appears.', example: 'IStorage storage = new JsonStorage("ledger.json");\nstorage.Save(entries);   // JsonStorage.Save runs' },
    { id: 'cs.6.ctor-injection', term: 'constructor injection', kind: 'pattern', meaning: 'A class receives the things it depends on as constructor parameters typed as interfaces, instead of creating them with new inside. Whoever builds the object decides which implementation it gets: Main passes the real one, a test passes a fake.', example: 'class Archive\n{\n    private readonly IStorage _storage;\n    public Archive(IStorage storage) { _storage = storage; }\n}' },
    { id: 'cs.6.fake', term: 'fake (in-memory implementation)', kind: 'pattern', meaning: 'An implementation of an interface that keeps its data in a field instead of a file or a network. It makes tests fast, isolated and free of clean-up, and it can count how it was used.', example: 'class FakeStorage : IStorage\n{\n    private List<Entry> _saved = new List<Entry>();\n    public int SaveCalls { get; private set; }\n    ...\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Depend on the contract, receive the implementation',
      body: `\`Storage\` works, but any class that uses it can only be tested with a real file in the working directory. The fix is to separate **what** storage does from **how**. An \`interface\` states the what: \`Load()\` and \`Save(entries)\`, signatures only. \`JsonStorage : IStorage\` provides the how with a file; \`FakeStorage : IStorage\` provides another how with a list in memory. A variable typed \`IStorage\` can hold either, and a call through it runs whichever object is really there.

The second half is **constructor injection**: a class that needs storage asks for an \`IStorage\` in its constructor and never writes \`new JsonStorage\` itself. Whoever builds the object chooses. \`Main\` passes the JSON one; a self-test passes a fake, so it can run a hundred times without touching the disk and can even count the saves.

You met the shape once already: Module 7's report writer is the same seam. The Azure track relies on it when storage moves from a file to a cloud service.`,
      example: {
        language: 'csharp',
        source: diExample,
        labels: [
          { lines: [7, 19], label: 'The serializable Entry, unchanged.' },
          { lines: [21, 25], label: 'The contract: two signatures, no bodies, no file, no list.' },
          { lines: [27, 57], label: 'The real implementation: the Module 5 Load and Save, now instance methods with the path injected too.' },
          { lines: [59, 74], label: 'The fake: a list in a field, copies in and out, and a counter a test can read.' },
          { lines: [76, 91], label: 'A class that depends on storage. It receives an IStorage; it never says new JsonStorage.' },
          { lines: [98, 102], label: 'Wire it with the fake: no file is touched. Prints `Fake holds 2 after 2 saves`.' },
          { lines: [104, 106], label: 'Wire it with the real one: `On disk: 1`, then `True`, because this Record wrote ledger.json.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python needs no interface keyword: any object with load() and save() would do, by duck typing. C# makes the contract explicit and checks it at compile time, so a fake that forgets Save is an error before any test runs rather than an AttributeError in the middle of one.' },
        { from: 'c', note: 'The C equivalent is a struct of function pointers passed in by the caller. An interface is that table, built and checked by the compiler, with the call syntax of an ordinary method.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'In an empty folder, what does this print?',
      code: { language: 'csharp', source: 'IStorage storage = new FakeStorage();\nvar archive = new Archive(storage);\nConsole.WriteLine(archive.Record(new Entry(-30, "food")));\nConsole.WriteLine(File.Exists("ledger.json"));' },
      choices: ['1\nFalse', '1\nTrue', 'A compile error: an IStorage variable cannot hold a FakeStorage', '0\nFalse'],
      answer: '1\nFalse',
      explanation: 'The variable\'s declared type is IStorage, but the object is a FakeStorage, and calls through the interface run the object\'s own methods. Its Save writes to a list, so Record returns 1 and no file appears. Replace `new FakeStorage()` with `new JsonStorage("ledger.json")` and nothing else changes except the second line, which becomes True.',
    },
    {
      kind: 'predict',
      prompt: 'Two archives over two fakes, then two archives over the same file name. What is printed?',
      code: { language: 'csharp', source: 'var a = new Archive(new FakeStorage());\nvar b = new Archive(new FakeStorage());\na.Record(new Entry(1, "x"));\nConsole.WriteLine(b.Record(new Entry(2, "y")));\n\nvar c = new Archive(new JsonStorage("s.json"));\nvar d = new Archive(new JsonStorage("s.json"));\nc.Record(new Entry(1, "x"));\nConsole.WriteLine(d.Record(new Entry(2, "y")));' },
      choices: ['1\n2', '2\n2', '1\n1', '2\n1'],
      answer: '1\n2',
      explanation: 'Each FakeStorage owns its own list, so `b` sees nothing of what `a` recorded: 1. The two JsonStorage objects point at the same file, so `d` loads the entry `c` saved and returns 2. That isolation is why tests use fakes: no test can leak into another.',
    },
    {
      kind: 'predict',
      prompt: 'A new implementation provides only `Load`. What happens?',
      code: { language: 'csharp', source: 'class MemoryStorage : IStorage\n{\n    public List<Entry> Load()\n    {\n        return new List<Entry>();\n    }\n}' },
      choices: ['A compile error: MemoryStorage does not implement IStorage.Save', 'It compiles; calling Save throws at run time', 'It compiles; Save silently does nothing', 'A compile error: Load must be declared in the interface again'],
      answer: 'A compile error: MemoryStorage does not implement IStorage.Save',
      explanation: 'Declaring `: IStorage` is a promise the compiler holds you to: every interface member must be present, public, with the same signature. A missing one is a compile error naming the member, not a run-time surprise. This is the check duck typing does not give you.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `FakeStorage`: an in-memory implementation of `IStorage` that hands out copies. Set the indentation yourself.',
      language: 'csharp',
      indentation: true,
      solution: [
        'class FakeStorage : IStorage',
        '{',
        '    private List<Entry> _saved = new List<Entry>();',
        '    public List<Entry> Load()',
        '    {',
        '        return new List<Entry>(_saved);',
        '    }',
        '    public void Save(List<Entry> entries)',
        '    {',
        '        _saved = new List<Entry>(entries);',
        '    }',
        '}',
      ],
      distractors: ['class FakeStorage implements IStorage', '    List<Entry> Load()', '    public void Save(List<Entry> entries);'],
      explanation: '`implements` is Java; C# uses a colon for both base classes and interfaces. An interface member must be implemented as public, so the version without `public` does not satisfy the contract. A signature ending in a semicolon has no body, which only an interface may write.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the contract, the implementation header and the injection.',
      language: 'csharp',
      template: `{{kw}} IStorage
{
    List<Entry> Load();
    void Save(List<Entry> entries);
}

class JsonStorage {{sep}} IStorage
{
    // ...
}

class Archive
{
    private readonly {{type}} _storage;

    public Archive({{type}} storage)
    {
        _storage = storage;
    }
}

// in a test:
var archive = new Archive(new {{impl}}());`,
      blanks: [
        { id: 'kw', answers: ['interface'], hint: 'the keyword for a contract without bodies' },
        { id: 'sep', answers: [':'], hint: 'the punctuation that declares an implementation' },
        { id: 'type', answers: ['IStorage'], hint: 'depend on the contract, not on a class' },
        { id: 'impl', answers: ['FakeStorage'], hint: 'the implementation a test prefers' },
      ],
      explanation: '`interface` declares the contract, `:` implements it, the field and parameter are typed as the interface, and a test injects the fake.',
    },
    {
      kind: 'modify',
      prompt: `\`Archive\` creates its own \`JsonStorage\` inside, so the self-test writes to \`ledger.json\` and the user's entry is counted on top of the test's. Give \`Archive\` a constructor that takes an \`IStorage\`, pass a \`FakeStorage\` in \`SelfTest\` and a \`JsonStorage("ledger.json")\` in \`Main\`. The output must become:

- \`2 tests passed\`, the two prompts, then \`Entries on disk: 1\` in an empty folder.`,
      language: 'csharp',
      starter: diModifyStarter,
      tests: [
        { description: 'empty folder', stdin: '-5\nbus', expectedStdout: '2 tests passed\nAmount?\nCategory?\nEntries on disk: 1' },
        { description: 'an existing file with two entries', files: { 'ledger.json': '[{"Amount":-20,"Category":"food"},{"Amount":50,"Category":"salary"}]' }, stdin: '7\ntips', expectedStdout: '2 tests passed\nAmount?\nCategory?\nEntries on disk: 3' },
      ],
      hint: 'Replace the initialised field with `private readonly IStorage _storage;` plus a constructor `public Archive(IStorage storage)`. Then the two `new Archive()` calls each need an argument: the fake in SelfTest, the JSON one in Main.',
      solution: diModifySolution,
    },
    {
      kind: 'create',
      prompt: `\`Entry\` and \`JsonStorage\` are given. Write \`IStorage\`, \`FakeStorage\`, and \`Archive\` with constructor injection and \`int Record(Entry entry)\` (load, add, save, return the count). In \`Main\`:

- Print \`Storage?\` and read a word: \`file\` selects \`new JsonStorage("ledger.json")\`, anything else a \`FakeStorage\`. Hold it in a variable typed \`IStorage\`.
- Repeat \`Amount (or quit)?\` and \`Category?\`; for each entry print \`Recorded <count returned by Record>\`.
- After quit print \`Stored: <storage.Load().Count>\` and \`File exists: <File.Exists("ledger.json")>\`.`,
      language: 'csharp',
      starter: diCreateStarter,
      tests: [
        { description: 'memory leaves no file', stdin: 'memory\n-30\nfood\n50\nsalary\nquit', expectedStdout: 'Storage?\nAmount (or quit)?\nCategory?\nRecorded 1\nAmount (or quit)?\nCategory?\nRecorded 2\nAmount (or quit)?\nStored: 2\nFile exists: False' },
        { description: 'file creates ledger.json', stdin: 'file\n-30\nfood\nquit', expectedStdout: 'Storage?\nAmount (or quit)?\nCategory?\nRecorded 1\nAmount (or quit)?\nStored: 1\nFile exists: True' },
        { description: 'file continues an existing ledger', files: { 'ledger.json': '[{"Amount":-20,"Category":"food"},{"Amount":50,"Category":"salary"}]' }, stdin: 'file\n7\ntips\nquit', expectedStdout: 'Storage?\nAmount (or quit)?\nCategory?\nRecorded 3\nAmount (or quit)?\nStored: 3\nFile exists: True' },
        { description: 'memory ignores an existing file', files: { 'ledger.json': '[{"Amount":-20,"Category":"food"}]' }, stdin: 'memory\nquit', expectedStdout: 'Storage?\nAmount (or quit)?\nStored: 0\nFile exists: True' },
      ],
      hint: 'Declare `IStorage storage;` before the if, assign in each branch, then `new Archive(storage)`. Everything after the choice is the same code whichever implementation was picked: that is the point.',
      solution: diCreateSolution,
      projectNote: 'LedgerSharp v0.6 keeps the static Storage, because its self-test needs only the pure Ledger. The interface is the seam Module 7\'s reading lesson revisits and the Azure track opens when ledger.json becomes a cloud store.',
    },
  ],
};

/* ---------------------------- 6-5 --------------------------------- */

const LEDGER_V06 = `using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

${entryClass}

${ledgerClass}

class Storage
{
    public static async Task<List<Entry>> LoadAsync(string path)
    {
        if (!File.Exists(path))
        {
            return new List<Entry>();
        }
        try
        {
            string text = await File.ReadAllTextAsync(path);
            List<Entry> entries = JsonSerializer.Deserialize<List<Entry>>(text);
            if (entries == null)
            {
                return new List<Entry>();
            }
            return entries.Where(e => e != null && !string.IsNullOrEmpty(e.Category)).ToList();
        }
        catch (JsonException)
        {
            return new List<Entry>();
        }
    }

    public static void Save(string path, List<Entry> entries)
    {
        var options = new JsonSerializerOptions { WriteIndented = true };
        File.WriteAllText(path, JsonSerializer.Serialize(entries, options));
    }
}

class Program
{
    const string Path = "ledger.json";

${checkHelper}

    static int SelfTest()
    {
        _passed = 0;
        var empty = new Ledger(100);
        Check(empty.Count == 0, "new ledger has no entries");
        Check(empty.Balance == 100, "empty balance is the starting amount");
        Check(empty.TopCategory() == null, "no expenses means no top category");

        var ledger = new Ledger(100);
        ledger.Add(new Entry(-30, "food"));
        ledger.Add(new Entry(50, "salary"));
        ledger.Add(new Entry(-10, "food"));
        Check(ledger.Balance == 110, "balance adds every amount to starting");
        Check(ledger.ByCategory()["food"] == -40, "food total accumulates");
        Check(ledger.TopCategory() == "food", "top is the most negative category");
        return _passed;
    }

    static string TopLine(Ledger ledger)
    {
        string top = ledger.TopCategory();
        if (top == null)
        {
            return "Top: none";
        }
        return $"Top: {top} {ledger.ByCategory()[top]}";
    }

    static async Task<int> Main(string[] args)
    {
        List<Entry> loaded = await Storage.LoadAsync(Path);
        Console.WriteLine($"Loaded {loaded.Count} entries");
        Console.WriteLine("Balance?");
        int starting = int.Parse(Console.ReadLine());
        var ledger = new Ledger(starting);
        foreach (Entry e in loaded)
        {
            ledger.Add(e);
        }
        Console.WriteLine("Amount (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            int amount;
            if (line == "top")
            {
                Console.WriteLine(TopLine(ledger));
            }
            else if (line == "selftest")
            {
                Console.WriteLine($"{SelfTest()} tests passed");
            }
            else if (int.TryParse(line, out amount))
            {
                Console.WriteLine("Category?");
                string category = Console.ReadLine();
                ledger.Add(new Entry(amount, category));
                Console.WriteLine($"Balance: {ledger.Balance}");
            }
            else
            {
                Console.WriteLine("Not a number, try again");
            }
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }
        Storage.Save(Path, ledger.Entries);
        Console.WriteLine($"Saved {ledger.Count} entries");
        Console.WriteLine("--- summary ---");
        foreach (var pair in ledger.ByCategory().OrderBy(p => p.Key))
        {
            Console.WriteLine($"{pair.Key}: {pair.Value}");
        }
        Console.WriteLine($"Entries: {ledger.Count}");
        Console.WriteLine($"Final balance: {ledger.Balance}");
        return 0;
    }
}
`;

const v06Starter = LEDGER_V06
  .replace(
    `    public static async Task<List<Entry>> LoadAsync(string path)
    {
        if (!File.Exists(path))
        {
            return new List<Entry>();
        }
        try
        {
            string text = await File.ReadAllTextAsync(path);
            List<Entry> entries = JsonSerializer.Deserialize<List<Entry>>(text);`,
    `    // TODO: make this LoadAsync: async, Task<List<Entry>>, await File.ReadAllTextAsync
    public static List<Entry> Load(string path)
    {
        if (!File.Exists(path))
        {
            return new List<Entry>();
        }
        try
        {
            string text = File.ReadAllText(path);
            List<Entry> entries = JsonSerializer.Deserialize<List<Entry>>(text);`,
  )
  .replace(/    static int SelfTest\(\)\n    \{[\s\S]*?\n    \}\n/, `    static int SelfTest()
    {
        _passed = 0;
        // TODO: at least three claims about Ledger, built in memory
        return _passed;
    }
`)
  .replace('    static async Task<int> Main(string[] args)\n    {\n        List<Entry> loaded = await Storage.LoadAsync(Path);', '    // TODO: async Task<int> Main that awaits Storage.LoadAsync and returns 0\n    static void Main(string[] args)\n    {\n        List<Entry> loaded = Storage.Load(Path);')
  .replace(
    `            else if (line == "selftest")
            {
                Console.WriteLine($"{SelfTest()} tests passed");
            }
`,
    '            // TODO: the selftest command: print "<n> tests passed" and re-prompt\n',
  )
  .replace('        Console.WriteLine($"Final balance: {ledger.Balance}");\n        return 0;\n', '        Console.WriteLine($"Final balance: {ledger.Balance}");\n');

const v06Common = 'Loaded 0 entries\\nBalance\\?\\nAmount \\(or quit\\)\\?\\n';
const passedLine = '([3-9]|[1-9][0-9]+) tests passed\\n';

const l65: Lesson = {
  id: 'cs-6-5',
  title: 'Project: LedgerSharp v0.6',
  objective: 'Give LedgerSharp a selftest command backed by claims about Ledger, and read its file through an awaited asynchronous call in an async Main.',
  minutes: 24,
  lexicon: [
    { id: 'cs.6.selftest-command', term: 'selftest at the prompt', kind: 'pattern', meaning: 'A command word, tested before the number like top and quit, that runs the built-in claims and prints `<n> tests passed`, then re-prompts. It gives users and scripts a one-word way to ask the program whether it still trusts itself.', example: 'else if (line == "selftest")\n{\n    Console.WriteLine($"{SelfTest()} tests passed");\n}' },
    { id: 'cs.6.async-main-chain', term: 'async all the way up', kind: 'concept', meaning: 'An awaited call makes its method async, which makes that method return a Task, which makes its caller await it, up to Main. Storage.LoadAsync awaits the file; Main awaits LoadAsync; the runtime awaits Main. Save stays synchronous because nothing above it needs to continue meanwhile.', example: 'static async Task<int> Main(string[] args)\n{\n    List<Entry> loaded = await Storage.LoadAsync(Path);\n    ...\n    return 0;\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The plan for v0.6',
      body: `LedgerSharp v0.6 prints exactly what v0.5 printed, plus one command. Three changes, each a lesson of this module:

- \`Storage.LoadAsync\` reads the file with \`await File.ReadAllTextAsync\` and returns a \`Task<List<Entry>>\`; \`Main\` becomes \`static async Task<int> Main\`, awaits it, and ends with \`return 0;\` (6-3).
- \`Check\` and \`SelfTest\` from lesson 6-1 live in \`Program\`, with claims about \`Ledger\` only: empty and filled balance, a category total, \`TopCategory\` with and without an expense.
- The word \`selftest\` at the amount prompt prints \`<n> tests passed\` and re-prompts, tested before \`TryParse\` like \`top\` (5-5).

\`Entry\`, \`Ledger\`, \`Save\` and the transcript are untouched. The interface from lesson 6-4 is not needed yet, because the claims never touch storage. Read the labels: they are the plan.`,
      example: {
        language: 'csharp',
        source: LEDGER_V06.trimEnd(),
        labels: [
          { lines: [6, 6], label: 'Task lives here.' },
          { lines: [8, 20], label: 'Entry, unchanged since Module 5.' },
          { lines: [22, 68], label: 'Ledger, unchanged: pure, and therefore the subject of every claim below.' },
          { lines: [72, 92], label: 'LoadAsync: the defensive Load of Module 5 with the read awaited. The signature says async and Task<List<Entry>>.' },
          { lines: [94, 98], label: 'Save stays synchronous.' },
          { lines: [105, 116], label: 'The Check helper from lesson 6-1.' },
          { lines: [119, 134], label: 'Six claims over two fixtures built in memory; the count comes back.' },
          { lines: [147, 149], label: 'An async entry point that awaits the load. Everything after this line is the v0.5 program.' },
          { lines: [167, 170], label: 'The new command: tested as a word, before any conversion is tried, next to top.' },
          { lines: [194, 194], label: 'The exit code, wrapped in the Task for you.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python v1.0 ran its tests through a selftest sub-command of argparse. Here it is a word at the prompt, because v0.6 is still a conversation; Module 7 turns it into the same kind of verb. The claims themselves are the run_tests() ones, written as Check calls.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'No file. The user types `5`, `selftest`, `quit`. Using the program above, what is printed in full?',
      code: { language: 'csharp', source: LEDGER_V06.trimEnd() },
      choices: [
        'Loaded 0 entries\nBalance?\nAmount (or quit)?\n6 tests passed\nAmount (or quit)?\nSaved 0 entries\n--- summary ---\nEntries: 0\nFinal balance: 5',
        'Loaded 0 entries\nBalance?\nAmount (or quit)?\n6 tests passed\nSaved 0 entries\n--- summary ---\nEntries: 0\nFinal balance: 5',
        'Loaded 0 entries\nBalance?\nAmount (or quit)?\nNot a number, try again\nAmount (or quit)?\nSaved 0 entries\n--- summary ---\nEntries: 0\nFinal balance: 5',
        'Loaded 0 entries\nBalance?\nAmount (or quit)?\n6 tests passed\nAmount (or quit)?\nSaved 2 entries\n--- summary ---\nfood: -40\nsalary: 50\nEntries: 2\nFinal balance: 115',
      ],
      answer: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\n6 tests passed\nAmount (or quit)?\nSaved 0 entries\n--- summary ---\nEntries: 0\nFinal balance: 5',
      explanation: '`selftest` is matched as a word before TryParse, so it is not a typo. SelfTest builds its own ledgers in memory and makes six claims, all true, then returns; the fixtures never reach the user\'s ledger, so nothing is saved and the balance stays 5. Every branch ends with the prompt, which reads quit.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `Storage.LoadAsync` (first line indented 4 spaces): empty list for a missing file, awaited read, empty list on broken JSON.',
      language: 'csharp',
      indentation: true,
      solution: [
        '    public static async Task<List<Entry>> LoadAsync(string path)',
        '    {',
        '        if (!File.Exists(path))',
        '        {',
        '            return new List<Entry>();',
        '        }',
        '        try',
        '        {',
        '            string text = await File.ReadAllTextAsync(path);',
        '            return JsonSerializer.Deserialize<List<Entry>>(text);',
        '        }',
        '        catch (JsonException)',
        '        {',
        '            return new List<Entry>();',
        '        }',
        '    }',
      ],
      distractors: ['    public static async List<Entry> LoadAsync(string path)', '    public static Task<List<Entry>> LoadAsync(string path)', '            string text = File.ReadAllTextAsync(path);'],
      explanation: 'An async method must return Task, Task<T> or void, never a bare List. Without `async` the await inside is a compile error. Without `await` the variable would be a Task<string>, not the text.',
    },
    {
      kind: 'create',
      prompt: `Finish LedgerSharp v0.6 from the starter, which is v0.5 with the Check helper and TopLine already in place:

- Turn \`Storage.Load\` into \`LoadAsync\` (\`async Task<List<Entry>>\`, \`await File.ReadAllTextAsync\`), make \`Main\` an \`async Task<int>\` that awaits it and returns 0.
- Write \`SelfTest\` with at least three claims about \`Ledger\`, built in memory.
- Accept \`selftest\` at the amount prompt: print \`<n> tests passed\` and re-prompt.

Everything v0.5 printed must stay exactly the same: Loaded, Balance?, the loop with top and the retry, Saved, the summary.`,
      language: 'csharp',
      starter: v06Starter,
      tests: [
        { description: 'selftest at once, no file', stdin: '5\nselftest\nquit', expectedStdout: `(?<![\\s\\S])${v06Common}${passedLine}Amount \\(or quit\\)\\?\\nSaved 0 entries\\n--- summary ---\\nEntries: 0\\nFinal balance: 5\\s*(?![\\s\\S])`, match: 'regex' },
        { description: 'selftest between entries does not touch the ledger', stdin: '100\n-30\nfood\nselftest\n50\nsalary\nquit', expectedStdout: `(?<![\\s\\S])${v06Common}Category\\?\\nBalance: 70\\nAmount \\(or quit\\)\\?\\n${passedLine}Amount \\(or quit\\)\\?\\nCategory\\?\\nBalance: 120\\nAmount \\(or quit\\)\\?\\nSaved 2 entries\\n--- summary ---\\nfood: -30\\nsalary: 50\\nEntries: 2\\nFinal balance: 120\\s*(?![\\s\\S])`, match: 'regex' },
        { description: 'two saved entries plus one new', files: { 'ledger.json': '[{"Amount": -20, "Category": "food"}, {"Amount": 50, "Category": "salary"}]' }, stdin: '100\n-10\nfood\nquit', expectedStdout: 'Loaded 2 entries\nBalance?\nAmount (or quit)?\nCategory?\nBalance: 120\nAmount (or quit)?\nSaved 3 entries\n--- summary ---\nfood: -30\nsalary: 50\nEntries: 3\nFinal balance: 120' },
        { description: 'a bad amount, then a good one', stdin: '50\nabc\n25\ntips\nquit', expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nNot a number, try again\nAmount (or quit)?\nCategory?\nBalance: 75\nAmount (or quit)?\nSaved 1 entries\n--- summary ---\ntips: 25\nEntries: 1\nFinal balance: 75' },
        { description: 'top still works', files: { 'ledger.json': '[{"Amount": -20, "Category": "food"}]' }, stdin: '100\ntop\n-5\nbus\nquit', expectedStdout: 'Loaded 1 entries\nBalance?\nAmount (or quit)?\nTop: food -20\nAmount (or quit)?\nCategory?\nBalance: 75\nAmount (or quit)?\nSaved 2 entries\n--- summary ---\nbus: -5\nfood: -20\nEntries: 2\nFinal balance: 75' },
        { description: 'a broken file is treated as empty', files: { 'ledger.json': '[{"Amount": -20' }, stdin: '10\nquit', expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nSaved 0 entries\n--- summary ---\nEntries: 0\nFinal balance: 10' },
        { description: 'the v0.4 transcript, with no file', stdin: '100\n-30\nfood\n50\nsalary\n-10\nfood\nquit', expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nCategory?\nBalance: 70\nAmount (or quit)?\nCategory?\nBalance: 120\nAmount (or quit)?\nCategory?\nBalance: 110\nAmount (or quit)?\nSaved 3 entries\n--- summary ---\nfood: -40\nsalary: 50\nEntries: 3\nFinal balance: 110' },
      ],
      hint: 'Do the three changes in order and run the tests after each: LoadAsync plus the async Main first (the v0.5 tests must still pass), then the SelfTest claims from lesson 6-1, then the selftest branch placed next to the top branch.',
      solution: LEDGER_V06,
      projectNote: 'LedgerSharp v0.6 complete: the ledger reads its file asynchronously and can prove its own arithmetic on request. Module 7 turns the conversation into command-line verbs, selftest among them, and puts the same Ledger behind a web API.',
    },
  ],
};

export const m6: Module = {
  id: 'cs-m6',
  title: 'Async and tests',
  goal: 'Self-tests with a Check helper, xUnit and dotnet test, async/await with Task and asynchronous file I/O, interfaces and constructor injection with an in-memory fake.',
  projectMilestone: 'LedgerSharp v0.6: a tested class library.',
  status: 'available',
  lessons: [l61, l62, l63, l64, l65],
};
