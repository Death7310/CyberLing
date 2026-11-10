import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 4: Collections and LINQ                                     */
/* ------------------------------------------------------------------ */

/** The immutable Entry from Module 3, reused verbatim by every exercise that stores entries. */
const ENTRY_CLASS = `class Entry
{
    public int Amount { get; }
    public string Category { get; }

    public Entry(int amount, string category)
    {
        Amount = amount;
        Category = category;
    }
}`;

/** The Module 2 sentinel loop that reads amount/category pairs into `entries` (inside Main, 8 spaces). */
const READ_ENTRIES_LOOP = `        var entries = new List<Entry>();
        Console.WriteLine("Amount (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            int amount = int.Parse(line);
            Console.WriteLine("Category?");
            string category = Console.ReadLine();
            entries.Add(new Entry(amount, category));
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }`;

/** LedgerSharp v0.4, exactly as tested in cs-4-5 and shown labelled in its concept step. */
const LEDGER_V04 = `using System;
using System.Collections.Generic;
using System.Linq;

${ENTRY_CLASS}

class CategoryTotal
{
    public string Category { get; }
    public int Total { get; }

    public CategoryTotal(string category, int total)
    {
        Category = category;
        Total = total;
    }
}

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

    public List<CategoryTotal> ByCategory()
    {
        return _entries
            .GroupBy(e => e.Category)
            .Select(g => new CategoryTotal(g.Key, g.Sum(e => e.Amount)))
            .OrderBy(t => t.Category)
            .ToList();
    }

    public CategoryTotal TopExpense()
    {
        return ByCategory()
            .Where(t => t.Total < 0)
            .OrderBy(t => t.Total)
            .ThenBy(t => t.Category)
            .FirstOrDefault();
    }
}

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Balance?");
        int starting = int.Parse(Console.ReadLine());
        var ledger = new Ledger(starting);
        Console.WriteLine("Amount (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            if (line == "top")
            {
                CategoryTotal top = ledger.TopExpense();
                if (top == null)
                {
                    Console.WriteLine("Top: none");
                }
                else
                {
                    Console.WriteLine($"Top: {top.Category} {top.Total}");
                }
            }
            else
            {
                int amount = int.Parse(line);
                Console.WriteLine("Category?");
                string category = Console.ReadLine();
                ledger.Add(new Entry(amount, category));
                Console.WriteLine($"Balance: {ledger.Balance}");
            }
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }
        Console.WriteLine("--- summary ---");
        foreach (CategoryTotal t in ledger.ByCategory())
        {
            Console.WriteLine($"{t.Category}: {t.Total}");
        }
        Console.WriteLine($"Entries: {ledger.Count}");
        Console.WriteLine($"Final balance: {ledger.Balance}");
    }
}
`;

/* ------------------------------------------------------------------ */
/* 4-1 List<T> and arrays                                             */
/* ------------------------------------------------------------------ */

const l41: Lesson = {
  id: 'cs-4-1',
  title: 'A list that grows, an array that cannot',
  objective: 'Store many values in a List<T>, grow, count, index and remove from it, and tell when a fixed-length array is the right choice.',
  minutes: 18,
  lexicon: [
    { id: 'cs.4.list', term: 'List<int>', kind: 'builtin', meaning: 'A growable, ordered collection whose items all have the declared type. `new List<int>()` is empty. The type in angle brackets is fixed at compile time: a `List<int>` refuses a string.', example: 'var amounts = new List<int>();\namounts.Add(-30);', analogy: 'A Python list that has promised to hold only one kind of thing. The analogy breaks at mixing: Python lets `[1, "a"]` exist; C# does not.' },
    { id: 'cs.4.list-ops', term: 'Add, Count, xs[i]', kind: 'pattern', meaning: 'The three everyday list operations: `Add(x)` appends, `Count` is the number of items (a property, no parentheses), `xs[i]` reads or writes position i, counted from 0. The last item is `xs[xs.Count - 1]`; there are no negative positions.', example: 'amounts.Add(50);\nConsole.WriteLine(amounts.Count);\nConsole.WriteLine(amounts[0]);' },
    { id: 'cs.4.remove', term: 'xs.Remove(x)', kind: 'builtin', meaning: 'Delete the first item equal to x and shift the rest down. Returns true if something was removed, false if x was not there. `RemoveAt(i)` deletes by position instead.', example: 'bool gone = amounts.Remove(-30);' },
    { id: 'cs.4.array', term: 'int[] week = new int[3];', kind: 'pattern', meaning: 'An array: a fixed number of slots of one type, all zero (or null) at first. `week.Length` is that number and never changes; there is no Add. Index past the end and the program throws IndexOutOfRangeException at run time.', example: 'int[] week = new int[3];\nweek[0] = 100;\nConsole.WriteLine(week.Length);', analogy: 'The C array you already know, but it knows its own Length and checks every index. It breaks at growth: C code would realloc; C# code switches to a List.' },
    { id: 'cs.4.collection-init', term: 'new List<string> { "food", "salary" }', kind: 'punctuation', meaning: 'A collection initialiser: braces after the constructor call add these items one by one. Arrays take the same braces: `new int[] { 1, 2 }` or just `{ 1, 2 }` in a declaration.', example: 'var categories = new List<string> { "food", "salary" };\nint[] fixedWeek = { 100, -30, 50 };' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Two ways to hold many values',
      body: `Module 3 used \`List<Entry>\` for one job: Add, Count, foreach. Here is the rest. A **List<T>** is a growable, ordered collection whose items all have the type in the angle brackets. \`Add\` appends, \`Count\` says how many (a property, so no parentheses), and \`xs[i]\` picks by position from 0. The last item is \`xs[xs.Count - 1]\`: there are no negative positions. \`Remove(x)\` deletes the first item equal to x and tells you with a bool whether it found one.

An **array** is the older, fixed shape: \`new int[3]\` is three slots that are zero until you fill them. \`Length\` is a property that never changes, and there is no Add. Index past the end and the program throws at run time. Use an array when the count is known up front and never changes (the days of a week); use a List everywhere else, which in this project is everywhere.

Both come with a **collection initialiser**: braces after the \`new\` that list the starting items.`,
      example: {
        language: 'csharp',
        source: `using System;
using System.Collections.Generic;

class Program
{
    static void Main(string[] args)
    {
        int[] week = new int[3];
        week[0] = 100;
        week[1] = -30;
        week[2] = 50;
        Console.WriteLine(week.Length);
        var amounts = new List<int>();
        amounts.Add(100);
        amounts.Add(-30);
        amounts.Add(50);
        amounts.Add(-10);
        Console.WriteLine(amounts.Count);
        Console.WriteLine(amounts[0]);
        Console.WriteLine(amounts[amounts.Count - 1]);
        bool gone = amounts.Remove(-30);
        Console.WriteLine(gone);
        foreach (int a in amounts)
        {
            Console.WriteLine(a);
        }
        var categories = new List<string> { "food", "salary" };
        Console.WriteLine(categories.Contains("food"));
    }
}`,
        labels: [
          { lines: [2, 2], label: 'List lives in this namespace; arrays need nothing extra.' },
          { lines: [8, 12], label: 'A fixed array of three slots: fill each by position, then show its Length, 3.' },
          { lines: [13, 17], label: 'An empty list of ints, grown one Add at a time.' },
          { lines: [18, 20], label: 'Count is 4; the first item is 100; the last is at Count - 1, so -10.' },
          { lines: [21, 22], label: 'Remove the first -30 and keep the answer: True.' },
          { lines: [23, 26], label: 'Visit what is left in order: 100, 50, -10.' },
          { lines: [27, 28], label: 'A list of strings made with a collection initialiser; Contains answers True.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`xs = []` becomes `new List<int>()` and the element type is part of the name. `append` is `Add`, `len(xs)` is `xs.Count`, `xs.remove(x)` is `xs.Remove(x)` (which returns a bool instead of raising when x is missing). `xs[-1]` does not exist: write `xs[xs.Count - 1]`. Slicing has no bracket syntax; the next lessons use LINQ instead.' },
        { from: 'c', note: '`int week[3];` becomes `int[] week = new int[3];`, and the slots start at 0 instead of garbage. The array carries its own `Length`, so no `sizeof(a) / sizeof(a[0])` and no separate count parameter. An index past the end throws instead of corrupting memory. `List<T>` is the growable array you built with malloc and realloc in the Vault, with the capacity bookkeeping done for you.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What happens when this `Main` runs?',
      code: { language: 'csharp', source: 'int[] xs = new int[2];\nxs[0] = 5;\nxs[1] = 7;\nxs[2] = 9;\nConsole.WriteLine(xs.Length);' },
      choices: ['a runtime exception: IndexOutOfRangeException', '3', '2', 'a compile error: the array is full'],
      answer: 'a runtime exception: IndexOutOfRangeException',
      explanation: '`new int[2]` has exactly two slots, positions 0 and 1, and an array never grows. The compiler does not track which indexes you use, so the program compiles and then throws when it reaches `xs[2]`. To hold a third value you need `new int[3]` up front, or a `List<int>` and `Add`.',
    },
    {
      kind: 'predict',
      prompt: 'What does this print?',
      code: { language: 'csharp', source: 'var xs = new List<int> { 5, 7, 5 };\nxs.Remove(5);\nConsole.WriteLine(xs.Count);\nConsole.WriteLine(xs[0]);' },
      choices: ['2\n7', '1\n7', '2\n5', '3\n7'],
      answer: '2\n7',
      explanation: '`Remove(5)` deletes only the first item equal to 5 and shifts the rest down, so the list becomes `{ 7, 5 }`: Count is 2 and position 0 now holds 7. `Remove` takes a value, not a position; `RemoveAt(0)` would be the positional version.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the part of `Main` (first line indented 8 spaces) that reads amounts until `quit` into a list and then prints `Count: <n>`.',
      language: 'csharp',
      indentation: true,
      solution: ['        var amounts = new List<int>();', '        Console.WriteLine("Amount (or quit)?");', '        string line = Console.ReadLine();', '        while (line != "quit")', '        {', '            amounts.Add(int.Parse(line));', '            Console.WriteLine("Amount (or quit)?");', '            line = Console.ReadLine();', '        }', '        Console.WriteLine($"Count: {amounts.Count}");'],
      distractors: ['            amounts.Append(int.Parse(line));', '        Console.WriteLine($"Count: {amounts.Length}");'],
      explanation: 'The list method is `Add`; `Append` is Python\'s word (and in C# it is a LINQ method that returns a new sequence and leaves the list alone). `Length` belongs to arrays; a List reports its size through `Count`.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the declarations and calls: a three-slot array, an empty list, an append, and the size of the list.',
      language: 'csharp',
      template: 'int[] week = new {{arr}};\nweek[0] = 100;\nvar amounts = new {{list}}();\namounts.{{add}}(-30);\nConsole.WriteLine(amounts.{{count}});\nConsole.WriteLine(week.Length);',
      blanks: [
        { id: 'arr', answers: ['int[3]', 'int [3]'], hint: 'the element type, then the number of slots in square brackets' },
        { id: 'list', answers: ['List<int>', 'List<int> '], hint: 'the list type with its element type in angle brackets' },
        { id: 'add', answers: ['Add'], hint: 'the method that appends to a List' },
        { id: 'count', answers: ['Count'], hint: 'the property a List uses for its size (an array would say Length)' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'This program accepts exactly three amounts because it stores them in an array. Replace the array with a `List<int>` and read amounts until the user types `quit`, then print `Count: <n>` and `Total: <sum>` as before.',
      language: 'csharp',
      starter: `using System;

class Program
{
    static void Main(string[] args)
    {
        int[] amounts = new int[3];
        for (int i = 0; i < 3; i++)
        {
            Console.WriteLine("Amount (or quit)?");
            amounts[i] = int.Parse(Console.ReadLine());
        }
        int total = 0;
        foreach (int a in amounts)
        {
            total = total + a;
        }
        Console.WriteLine($"Count: {amounts.Length}");
        Console.WriteLine($"Total: {total}");
    }
}
`,
      tests: [
        { description: 'four amounts', stdin: '10\n20\n30\n40\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nCount: 4\nTotal: 100' },
        { description: 'quit at once', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nCount: 0\nTotal: 0' },
        { description: 'two amounts that cancel', stdin: '-5\n5\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nCount: 2\nTotal: 0' },
      ],
      hint: 'Add `using System.Collections.Generic;`. The counted `for` becomes the Module 2 sentinel loop: ask once before `while (line != "quit")`, `amounts.Add(int.Parse(line))`, ask again at the bottom. `Length` becomes `Count`.',
      solution: `using System;
using System.Collections.Generic;

class Program
{
    static void Main(string[] args)
    {
        var amounts = new List<int>();
        Console.WriteLine("Amount (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            amounts.Add(int.Parse(line));
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }
        int total = 0;
        foreach (int a in amounts)
        {
            total = total + a;
        }
        Console.WriteLine($"Count: {amounts.Count}");
        Console.WriteLine($"Total: {total}");
    }
}
`,
    },
    {
      kind: 'create',
      prompt: 'Read amounts with the prompt `Amount (or quit)?` until `quit`, storing them in a `List<int>`. After quit, remove the first `0` from the list (if there is one) with `Remove`, and print `Removed zero: True` or `Removed zero: False`. Then print `Count: <n>` and, using a counted `for` loop over the indexer, the remaining amounts from last to first, one per line.',
      language: 'csharp',
      tests: [
        { description: 'a zero in the middle', stdin: '10\n0\n-30\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nRemoved zero: True\nCount: 2\n-30\n10' },
        { description: 'quit at once', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nRemoved zero: False\nCount: 0' },
        { description: 'two zeros: only the first goes', stdin: '0\n7\n0\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nRemoved zero: True\nCount: 2\n0\n7' },
        { description: 'no zero', stdin: '5\n-5\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nRemoved zero: False\nCount: 2\n-5\n5' },
      ],
      hint: '`bool removed = amounts.Remove(0);` does both jobs at once. The backwards loop starts at `amounts.Count - 1` and runs while `i >= 0`.',
      solution: `using System;
using System.Collections.Generic;

class Program
{
    static void Main(string[] args)
    {
        var amounts = new List<int>();
        Console.WriteLine("Amount (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            amounts.Add(int.Parse(line));
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }
        bool removed = amounts.Remove(0);
        Console.WriteLine($"Removed zero: {removed}");
        Console.WriteLine($"Count: {amounts.Count}");
        for (int i = amounts.Count - 1; i >= 0; i--)
        {
            Console.WriteLine(amounts[i]);
        }
    }
}
`,
      projectNote: 'The Ledger\'s `List<Entry>` is this list with Entry objects in it. Nothing in LedgerSharp ever needs a fixed-size array, which is why it never has one.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 4-2 Dictionary<K,V>                                                */
/* ------------------------------------------------------------------ */

const l42: Lesson = {
  id: 'cs-4-2',
  title: 'Looking things up by key',
  objective: 'Map keys to values in a Dictionary, look up safely with ContainsKey and TryGetValue, accumulate per key, and print it in a fixed order.',
  minutes: 18,
  lexicon: [
    { id: 'cs.4.dictionary', term: 'Dictionary<string, int>', kind: 'builtin', meaning: 'Key to value lookup with both types declared. `d[key] = v` adds or replaces; `d[key]` reads. Each key appears once. `Count` is the number of keys. The order you get when iterating is not alphabetical and not promised.', example: 'var totals = new Dictionary<string, int>();\ntotals["food"] = -30;\nConsole.WriteLine(totals["food"]);', analogy: 'A filing cabinet with one labelled folder per key. It breaks at browsing: a real cabinet is in label order, a Dictionary is not.' },
    { id: 'cs.4.keynotfound', term: 'KeyNotFoundException', kind: 'concept', meaning: 'What reading `d[key]` throws when key is absent. Writing never throws. So before reading a key that might be missing, ask `ContainsKey` or use `TryGetValue`.', example: 'if (totals.ContainsKey("rent"))\n{\n    Console.WriteLine(totals["rent"]);\n}' },
    { id: 'cs.4.trygetvalue', term: 'd.TryGetValue(key, out v)', kind: 'builtin', meaning: 'Look up key in one step: returns true and fills v with the value, or returns false and sets v to the type\'s default (0 for int, null for a class). Declare v first; `out` marks it as filled in by the call.', example: 'int rent;\nif (totals.TryGetValue("rent", out rent))\n{\n    Console.WriteLine(rent);\n}' },
    { id: 'cs.4.accumulate', term: 'TryGetValue(k, out cur); d[k] = cur + x;', kind: 'pattern', meaning: 'Add x to the total stored under k, starting from 0 the first time k appears. Because a missing key leaves cur at 0, the pattern needs no if. The Module 3 version with ContainsKey and a seeded 0 does the same job in more lines.', example: 'int current;\ntotals.TryGetValue(category, out current);\ntotals[category] = current + amount;' },
    { id: 'cs.4.keyvaluepair', term: 'foreach (KeyValuePair<string, int> pair in d)', kind: 'pattern', meaning: 'Iterate a dictionary one pair at a time; `pair.Key` and `pair.Value` are the parts. Wrap d in `new SortedDictionary<string, int>(d)` to visit the keys in sorted order and make output identical on every run.', example: 'foreach (KeyValuePair<string, int> pair in new SortedDictionary<string, int>(totals))\n{\n    Console.WriteLine($"{pair.Key}: {pair.Value}");\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Keys, values, and the missing key',
      body: `A **Dictionary<K, V>** maps each key to one value, and both types are declared. Writing \`totals["food"] = -30\` adds the key or replaces its value. Reading \`totals["food"]\` gives the value back, and reading a key that is not there throws **KeyNotFoundException**: there is no default, unlike Python's \`get\`.

Two safe lookups exist. \`ContainsKey\` asks first. \`TryGetValue(key, out v)\` asks and fetches in one call: it returns true and fills \`v\`, or returns false and leaves \`v\` at the type's default, 0 for an int. That default is what makes the **accumulate pattern** short: fetch the current total (0 if new), add, store.

Iterating gives \`KeyValuePair\` objects with \`.Key\` and \`.Value\`, in an order the Dictionary does not promise. When the order matters, as it always does for printed output, copy into a \`SortedDictionary\` first, exactly as v0.3 did.`,
      example: {
        language: 'csharp',
        source: `using System;
using System.Collections.Generic;

class Program
{
    static void Main(string[] args)
    {
        var totals = new Dictionary<string, int>();
        totals["food"] = -30;
        totals["salary"] = 500;
        totals["food"] = totals["food"] + -10;
        Console.WriteLine(totals["food"]);
        Console.WriteLine(totals.ContainsKey("rent"));
        int rent;
        if (totals.TryGetValue("rent", out rent))
        {
            Console.WriteLine(rent);
        }
        else
        {
            Console.WriteLine("no rent yet");
        }
        int current;
        totals.TryGetValue("bus", out current);
        totals["bus"] = current + -5;
        Console.WriteLine(totals.Count);
        foreach (KeyValuePair<string, int> pair in new SortedDictionary<string, int>(totals))
        {
            Console.WriteLine($"{pair.Key}: {pair.Value}");
        }
    }
}`,
        labels: [
          { lines: [8, 10], label: 'An empty dictionary, then two keys written with the indexer.' },
          { lines: [11, 12], label: 'Read, add, write back under the same key; prints -40.' },
          { lines: [13, 13], label: 'Ask without reading: False, no exception.' },
          { lines: [14, 22], label: 'Ask and fetch in one call. The key is absent, so the else branch prints `no rent yet`.' },
          { lines: [23, 25], label: 'The accumulate pattern: bus is new, so `current` stays 0 and bus becomes -5.' },
          { lines: [26, 26], label: 'Three keys now.' },
          { lines: [27, 30], label: 'Print every pair in key order: `bus: -5`, `food: -40`, `salary: 500`.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`{}` becomes `new Dictionary<string, int>()`. `d[k]` on a missing key raises in both languages, but Python\'s `d.get(k, 0)` has no direct twin: `TryGetValue` plays that role, with the value coming back through an `out` parameter instead of a return value. `for k, v in d.items()` is `foreach (KeyValuePair<string, int> pair in d)`. Python 3.7+ dicts keep insertion order; C# does not promise any order, so sort before printing.' },
        { from: 'c', note: 'C has no dictionary; the Vault used a names table and a linear search with strcmp. `Dictionary` is that table with hashing, growth and the search built in. `out` is the C idiom of passing `&result` so the callee can fill it, but the compiler checks that it was assigned before the call returns.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What happens when this runs?',
      code: { language: 'csharp', source: 'var d = new Dictionary<string, int>();\nd["food"] = -30;\nConsole.WriteLine(d["rent"]);' },
      choices: ['a runtime exception: KeyNotFoundException', '0', 'null', 'a compile error'],
      answer: 'a runtime exception: KeyNotFoundException',
      explanation: 'Reading with the indexer demands that the key exist; `rent` was never written, so the program compiles and then throws when it reaches the read. Writing `d["rent"] = 0` first, checking `ContainsKey`, or using `TryGetValue` are the three ways to avoid it. The compiler cannot know which keys will exist at run time.',
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'csharp', source: 'var d = new Dictionary<string, int>();\nd["food"] = -30;\nint v;\nbool found = d.TryGetValue("rent", out v);\nConsole.WriteLine($"{found} {v}");' },
      choices: ['False 0', 'False null', 'True 0', 'a runtime exception: KeyNotFoundException'],
      answer: 'False 0',
      explanation: '`TryGetValue` never throws. The key is absent, so it returns false, and the `out` parameter is set to the default for `int`, which is 0. That 0 is what the accumulate pattern relies on: a new key starts from zero without any special case.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the part of `Main` (first line indented 8 spaces) that counts how often each string in `categories` appears, then prints `<category>: <count>` in alphabetical order.',
      language: 'csharp',
      indentation: true,
      solution: ['        var counts = new Dictionary<string, int>();', '        foreach (string c in categories)', '        {', '            int seen;', '            counts.TryGetValue(c, out seen);', '            counts[c] = seen + 1;', '        }', '        foreach (KeyValuePair<string, int> pair in new SortedDictionary<string, int>(counts))', '        {', '            Console.WriteLine($"{pair.Key}: {pair.Value}");', '        }'],
      distractors: ['            counts[c] = counts[c] + 1;', '        foreach (KeyValuePair<string, int> pair in counts)'],
      explanation: '`counts[c] + 1` reads the key before it has ever been written, which throws KeyNotFoundException on the first occurrence of every category; `TryGetValue` gives 0 instead. Iterating `counts` directly gives an order the Dictionary does not promise; the SortedDictionary copy gives alphabetical order every run.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the accumulate pattern, the existence check, and the loop that prints the pairs.',
      language: 'csharp',
      template: 'var totals = new Dictionary<string, int>();\nint current;\ntotals.{{tryget}}(category, {{outkw}} current);\ntotals[category] = current + amount;\nif (!totals.{{has}}("rent"))\n{\n    Console.WriteLine("no rent yet");\n}\nforeach ({{pair}} pair in new SortedDictionary<string, int>(totals))\n{\n    Console.WriteLine($"{pair.Key}: {pair.Value}");\n}',
      blanks: [
        { id: 'tryget', answers: ['TryGetValue'], hint: 'the lookup that returns a bool and fills a variable' },
        { id: 'outkw', answers: ['out'], hint: 'the keyword that marks a parameter the call will fill in' },
        { id: 'has', answers: ['ContainsKey'], hint: 'the yes/no question about a key' },
        { id: 'pair', answers: ['KeyValuePair<string, int>', 'KeyValuePair<string,int>', 'var'], hint: 'the type of one key-and-value item' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'This program should count how many times each category is typed, but it crashes on the first category and would print in an unpromised order. Fix the counting so a new key starts from 0, and print the counts sorted by category name.',
      language: 'csharp',
      starter: `using System;
using System.Collections.Generic;

class Program
{
    static void Main(string[] args)
    {
        var counts = new Dictionary<string, int>();
        Console.WriteLine("Category (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            counts[line] = counts[line] + 1;
            Console.WriteLine("Category (or quit)?");
            line = Console.ReadLine();
        }
        foreach (KeyValuePair<string, int> pair in counts)
        {
            Console.WriteLine($"{pair.Key}: {pair.Value}");
        }
        Console.WriteLine($"Categories: {counts.Count}");
    }
}
`,
      tests: [
        { description: 'a repeated category', stdin: 'food\nrent\nfood\nquit', expectedStdout: 'Category (or quit)?\nCategory (or quit)?\nCategory (or quit)?\nCategory (or quit)?\nfood: 2\nrent: 1\nCategories: 2' },
        { description: 'quit at once', stdin: 'quit', expectedStdout: 'Category (or quit)?\nCategories: 0' },
        { description: 'typed out of alphabetical order', stdin: 'zoo\napple\nquit', expectedStdout: 'Category (or quit)?\nCategory (or quit)?\nCategory (or quit)?\napple: 1\nzoo: 1\nCategories: 2' },
      ],
      hint: 'Inside the loop: `int seen; counts.TryGetValue(line, out seen); counts[line] = seen + 1;`. For the output, iterate `new SortedDictionary<string, int>(counts)`.',
      solution: `using System;
using System.Collections.Generic;

class Program
{
    static void Main(string[] args)
    {
        var counts = new Dictionary<string, int>();
        Console.WriteLine("Category (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            int seen;
            counts.TryGetValue(line, out seen);
            counts[line] = seen + 1;
            Console.WriteLine("Category (or quit)?");
            line = Console.ReadLine();
        }
        foreach (KeyValuePair<string, int> pair in new SortedDictionary<string, int>(counts))
        {
            Console.WriteLine($"{pair.Key}: {pair.Value}");
        }
        Console.WriteLine($"Categories: {counts.Count}");
    }
}
`,
    },
    {
      kind: 'create',
      prompt: 'Repeat `Amount (or quit)?` and, for each amount, `Category?`; keep a running total per category in a `Dictionary<string, int>`. After `quit`, print one `<category>: <total>` line per category sorted by name. Then print `Lookup?`, read a category name, and print `<name>: <total>` if it exists or `<name>: none` if it does not.',
      language: 'csharp',
      tests: [
        { description: 'lookup of a repeated category', stdin: '-30\nfood\n50\nsalary\n-10\nfood\nquit\nfood', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nfood: -40\nsalary: 50\nLookup?\nfood: -40' },
        { description: 'lookup of a missing category', stdin: '-30\nfood\nquit\nrent', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nfood: -30\nLookup?\nrent: none' },
        { description: 'nothing entered', stdin: 'quit\nfood', expectedStdout: 'Amount (or quit)?\nLookup?\nfood: none' },
        { description: 'out of order categories', stdin: '10\nzoo\n-5\napple\nquit\nzoo', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\napple: -5\nzoo: 10\nLookup?\nzoo: 10' },
      ],
      hint: 'The loop body is the accumulate pattern with `category` as the key and `amount` as the increment. The lookup at the end is `TryGetValue` with an if/else on its bool.',
      solution: `using System;
using System.Collections.Generic;

class Program
{
    static void Main(string[] args)
    {
        var totals = new Dictionary<string, int>();
        Console.WriteLine("Amount (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            int amount = int.Parse(line);
            Console.WriteLine("Category?");
            string category = Console.ReadLine();
            int current;
            totals.TryGetValue(category, out current);
            totals[category] = current + amount;
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }
        foreach (KeyValuePair<string, int> pair in new SortedDictionary<string, int>(totals))
        {
            Console.WriteLine($"{pair.Key}: {pair.Value}");
        }
        Console.WriteLine("Lookup?");
        string wanted = Console.ReadLine();
        int found;
        if (totals.TryGetValue(wanted, out found))
        {
            Console.WriteLine($"{wanted}: {found}");
        }
        else
        {
            Console.WriteLine($"{wanted}: none");
        }
    }
}
`,
      projectNote: 'This is v0.3\'s ByCategory written in the shorter TryGetValue form. The next two lessons replace the loop itself with a query, and the dictionary stops being needed at all.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 4-3 LINQ queries                                                   */
/* ------------------------------------------------------------------ */

const l43: Lesson = {
  id: 'cs-4-3',
  title: 'Asking a collection a question',
  objective: 'Filter, project, total and sort a collection with LINQ methods and lambdas, and predict when a deferred query is evaluated.',
  minutes: 22,
  lexicon: [
    { id: 'cs.4.lambda', term: 'x => x.Amount < 0', kind: 'pattern', meaning: 'A lambda: a small unnamed function. Left of the arrow is the parameter (its type is inferred from the collection), right of it is the expression that is returned. LINQ methods take lambdas to say what to test, pick or sort by.', example: 'entries.Where(x => x.Amount < 0)\nentries.Select(x => x.Category)', analogy: 'Python\'s `lambda x: x.amount < 0`, with `=>` in place of `lambda ... :`. It breaks at typing: the C# compiler knows what x is and rejects `x.Amoutn` before the program runs.' },
    { id: 'cs.4.where-select', term: 'Where, Select, Sum', kind: 'builtin', meaning: 'The three everyday LINQ verbs. `Where(test)` keeps the items for which the lambda is true. `Select(f)` turns each item into whatever the lambda returns. `Sum(f)` adds up what the lambda returns for each item; `Sum()` with no lambda works on a sequence of numbers.', example: 'int spent = entries.Where(x => x.Amount < 0).Sum(x => x.Amount);\nList<string> names = entries.Select(x => x.Category).ToList();' },
    { id: 'cs.4.orderby-thenby', term: 'OrderBy(key).ThenBy(key2)', kind: 'builtin', meaning: 'A new sequence sorted by the key the lambda returns, with `ThenBy` breaking ties by a second key. `OrderByDescending` reverses. The original list is not changed; `xs.Sort()` would change it in place.', example: 'foreach (Entry e in entries.OrderBy(x => x.Category).ThenBy(x => x.Amount))\n{\n    Console.WriteLine(e.Category);\n}' },
    { id: 'cs.4.deferred', term: 'deferred execution and ToList()', kind: 'concept', meaning: 'A `Where`, `Select` or `OrderBy` result is a recipe, not a copy: it reruns against the current list every time you iterate, Count() or Sum it. `ToList()` runs the recipe once and freezes the result into a real List.', example: 'var expenses = entries.Where(x => x.Amount < 0);\nentries.Add(new Entry(-5, "bus"));\nConsole.WriteLine(expenses.Count());   // includes the bus entry', analogy: 'A saved search versus a printed report. The search is re-run each time you open it; the printout shows what was true when you printed. It breaks if you expect the search to be cheap: a long chain re-executes fully each time.' },
    { id: 'cs.4.first-or-default', term: 'First(test) vs FirstOrDefault(test)', kind: 'builtin', meaning: 'Both return the first item that passes the test. `First` throws InvalidOperationException when nothing passes; `FirstOrDefault` returns the default instead: null for a class, 0 for an int. Use the latter when "none" is a normal outcome and check for it.', example: 'Entry huge = entries.FirstOrDefault(x => x.Amount > 1000);\nif (huge == null)\n{\n    Console.WriteLine("none");\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Queries instead of loops',
      body: `Every loop you wrote over a collection was one of a few shapes: keep some items, transform each item, add them up, sort them, find one. **LINQ** gives those shapes names. Add \`using System.Linq;\` and every List gets \`Where\`, \`Select\`, \`Sum\`, \`OrderBy\`, \`First\` and more. Each takes a **lambda**, \`x => expression\`, that says what to test or pick.

The notional machine has one new rule. \`Where\`, \`Select\` and \`OrderBy\` do not build a new list; they build a **query** that runs when you ask for results, and runs again every time you ask. Add an item to the source and the next \`Count()\` sees it. \`ToList()\` runs the query once and freezes the answer into a real List. \`Sum\`, \`Count()\` and \`First\` run the query immediately and return a value.

\`First\` throws when nothing matches; \`FirstOrDefault\` returns null (for a class) so you can check. Note \`Count()\` with parentheses is the LINQ method on a query; \`Count\` without is the List property.`,
      example: {
        language: 'csharp',
        source: `using System;
using System.Collections.Generic;
using System.Linq;

${ENTRY_CLASS}

class Program
{
    static void Main(string[] args)
    {
        var entries = new List<Entry>();
        entries.Add(new Entry(-30, "food"));
        entries.Add(new Entry(500, "salary"));
        entries.Add(new Entry(-10, "food"));
        var expenses = entries.Where(x => x.Amount < 0);
        Console.WriteLine(expenses.Count());
        entries.Add(new Entry(-200, "rent"));
        Console.WriteLine(expenses.Count());
        Console.WriteLine(expenses.Sum(x => x.Amount));
        List<string> names = entries.Select(x => x.Category).ToList();
        Console.WriteLine(names.Count);
        var ordered = entries.OrderBy(x => x.Category).ThenBy(x => x.Amount);
        foreach (Entry e in ordered)
        {
            Console.WriteLine($"{e.Category} {e.Amount}");
        }
        Entry firstExpense = entries.First(x => x.Amount < 0);
        Entry huge = entries.FirstOrDefault(x => x.Amount > 1000);
        Console.WriteLine(firstExpense.Category);
        Console.WriteLine(huge == null);
    }
}`,
        labels: [
          { lines: [3, 3], label: 'Without this line none of the query methods exist.' },
          { lines: [5, 15], label: 'The immutable Entry from Module 3.' },
          { lines: [21, 24], label: 'Three entries to query.' },
          { lines: [25, 26], label: 'A query that keeps the negative amounts; asking it to count runs it: 2.' },
          { lines: [27, 28], label: 'The same query, asked again after an Add, sees the new entry: 3.' },
          { lines: [29, 29], label: 'Total the amounts of the filtered items: -240.' },
          { lines: [30, 31], label: 'Project each entry to its category and freeze into a real List of 4 strings.' },
          { lines: [32, 36], label: 'Sort by category, ties by amount: food -30, food -10, rent -200, salary 500.' },
          { lines: [37, 40], label: 'Find one: First returns the food entry; FirstOrDefault finds nothing and gives null, so True.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'A list comprehension `[e for e in entries if e.amount < 0]` is `entries.Where(x => x.Amount < 0)`, but the comprehension builds a list at once while the C# query is lazy, like a generator expression. `sum(e.amount for e in ...)` is `Sum(x => x.Amount)`; `sorted(entries, key=lambda e: (e.category, e.amount))` is `OrderBy(...).ThenBy(...)`; `next(iter(...), None)` is `FirstOrDefault`.' },
        { from: 'c', note: 'In C every one of these was a hand-written for loop over an array with an index and an accumulator. LINQ names the loop shape and hides the index. The lambda is a function pointer the compiler writes for you, and the query object is a tiny struct of state that walks the list when asked.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this print?',
      code: { language: 'csharp', source: 'var xs = new List<int> { 1, 2, 3 };\nvar big = xs.Where(x => x > 1);\nxs.Add(10);\nConsole.WriteLine(big.Count());\nvar frozen = xs.Where(x => x > 1).ToList();\nxs.Add(20);\nConsole.WriteLine(frozen.Count);' },
      choices: ['3\n3', '2\n3', '3\n4', '2\n2'],
      answer: '3\n3',
      explanation: '`big` is a deferred query: it is not run at line 2 but at `Count()`, by which time 10 has been added, so 2, 3 and 10 pass and the count is 3. `frozen` was materialised with `ToList()` while the list held 1, 2, 3, 10 (three pass); adding 20 afterwards does not change a List that already exists.',
    },
    {
      kind: 'predict',
      prompt: 'What happens when this runs?',
      code: { language: 'csharp', source: 'var xs = new List<int> { 5, 7 };\nConsole.WriteLine(xs.FirstOrDefault(x => x > 10));\nConsole.WriteLine(xs.First(x => x > 10));' },
      choices: ['0, then a runtime exception: InvalidOperationException', '0\n0', 'null\nnull', 'a compile error'],
      answer: '0, then a runtime exception: InvalidOperationException',
      explanation: 'Nothing in the list is greater than 10. `FirstOrDefault` returns the default for `int`, which is 0 (it would be null for a class such as Entry). `First` has no such fallback and throws. Choose `FirstOrDefault` when "no match" is a normal case you intend to handle.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the part of `Main` (first line indented 8 spaces) that prints every expense in `entries` sorted by amount then category, followed by `Spent: <total of the expenses>`.',
      language: 'csharp',
      indentation: true,
      solution: ['        var expenses = entries.Where(x => x.Amount < 0);', '        foreach (Entry e in expenses.OrderBy(x => x.Amount).ThenBy(x => x.Category))', '        {', '            Console.WriteLine($"{e.Category}: {e.Amount}");', '        }', '        Console.WriteLine($"Spent: {expenses.Sum(x => x.Amount)}");'],
      distractors: ['        var expenses = entries.Where(x.Amount < 0);', '        Console.WriteLine($"Spent: {expenses.Sum()}");'],
      explanation: '`Where` needs a lambda, `x => x.Amount < 0`; without the arrow there is no `x` and the condition does not compile. `Sum()` with no lambda only works on a sequence of numbers; a sequence of Entry objects needs `Sum(x => x.Amount)` to say which number to add.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the using line and the four query calls.',
      language: 'csharp',
      template: 'using System.{{linq}};\n\n// inside Main, with entries filled:\nvar expenses = entries.{{where}}(x => x.Amount < 0);\nint spent = expenses.{{sum}}(x => x.Amount);\nList<string> names = entries.Select(x => x.Category).{{tolist}}();\nforeach (Entry e in entries.OrderBy(x => x.Category).{{thenby}}(x => x.Amount))\n{\n    Console.WriteLine(e.Category);\n}',
      blanks: [
        { id: 'linq', answers: ['Linq'], hint: 'the namespace that adds the query methods' },
        { id: 'where', answers: ['Where'], hint: 'keep the items that pass a test' },
        { id: 'sum', answers: ['Sum'], hint: 'add up what the lambda picks' },
        { id: 'tolist', answers: ['ToList'], hint: 'run the query now and freeze the result' },
        { id: 'thenby', answers: ['ThenBy'], hint: 'the tie-breaker after OrderBy' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program prints entries in the order typed and totals the expenses with a loop. Using LINQ, print the entries sorted by category then by amount, and compute `Spent:` with `Where` and `Sum`. No `foreach` should contain an `if`.',
      language: 'csharp',
      starter: `using System;
using System.Collections.Generic;

${ENTRY_CLASS}

class Program
{
    static void Main(string[] args)
    {
${READ_ENTRIES_LOOP}
        foreach (Entry e in entries)
        {
            Console.WriteLine($"{e.Category}: {e.Amount}");
        }
        int spent = 0;
        foreach (Entry e in entries)
        {
            if (e.Amount < 0)
            {
                spent = spent + e.Amount;
            }
        }
        Console.WriteLine($"Spent: {spent}");
    }
}
`,
      tests: [
        { description: 'categories typed out of order', stdin: '10\nzoo\n-5\napple\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\napple: -5\nzoo: 10\nSpent: -5' },
        { description: 'same category sorted by amount', stdin: '-30\nfood\n50\nsalary\n-40\nfood\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nfood: -40\nfood: -30\nsalary: 50\nSpent: -70' },
        { description: 'no entries', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nSpent: 0' },
      ],
      hint: 'Add `using System.Linq;`. Loop over `entries.OrderBy(x => x.Category).ThenBy(x => x.Amount)`. `Spent` is one line: `entries.Where(x => x.Amount < 0).Sum(x => x.Amount)`.',
      solution: `using System;
using System.Collections.Generic;
using System.Linq;

${ENTRY_CLASS}

class Program
{
    static void Main(string[] args)
    {
${READ_ENTRIES_LOOP}
        var ordered = entries.OrderBy(x => x.Category).ThenBy(x => x.Amount);
        foreach (Entry e in ordered)
        {
            Console.WriteLine($"{e.Category}: {e.Amount}");
        }
        int spent = entries.Where(x => x.Amount < 0).Sum(x => x.Amount);
        Console.WriteLine($"Spent: {spent}");
    }
}
`,
    },
    {
      kind: 'create',
      prompt: 'Read entries with `Amount (or quit)?` and `Category?` until `quit` (use the `Entry` class). Then print `Expenses:` followed by every entry with a negative amount as `<category>: <amount>`, sorted by amount and then by category; then `Spent: <sum of the negative amounts>`; then `Biggest: <category> <amount>` for the entry with the largest amount (ties broken by category name) or `Biggest: none` when there are no entries. Use LINQ for all three answers.',
      language: 'csharp',
      tests: [
        { description: 'mixed entries', stdin: '-30\nfood\n50\nsalary\n-40\nrent\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nExpenses:\nrent: -40\nfood: -30\nSpent: -70\nBiggest: salary 50' },
        { description: 'no entries', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nExpenses:\nSpent: 0\nBiggest: none' },
        { description: 'tie on the biggest amount', stdin: '10\na\n10\nb\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nExpenses:\nSpent: 0\nBiggest: a 10' },
        { description: 'only expenses, tie on amount', stdin: '-5\nbus\n-5\nape\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nExpenses:\nape: -5\nbus: -5\nSpent: -10\nBiggest: ape -5' },
      ],
      hint: 'One `Where` query named `expenses` serves both the list and the `Sum`. For the biggest, `OrderByDescending(x => x.Amount).ThenBy(x => x.Category).FirstOrDefault()` and a null check.',
      solution: `using System;
using System.Collections.Generic;
using System.Linq;

${ENTRY_CLASS}

class Program
{
    static void Main(string[] args)
    {
${READ_ENTRIES_LOOP}
        var expenses = entries.Where(x => x.Amount < 0);
        Console.WriteLine("Expenses:");
        foreach (Entry e in expenses.OrderBy(x => x.Amount).ThenBy(x => x.Category))
        {
            Console.WriteLine($"{e.Category}: {e.Amount}");
        }
        Console.WriteLine($"Spent: {expenses.Sum(x => x.Amount)}");
        Entry biggest = entries.OrderByDescending(x => x.Amount).ThenBy(x => x.Category).FirstOrDefault();
        if (biggest == null)
        {
            Console.WriteLine("Biggest: none");
        }
        else
        {
            Console.WriteLine($"Biggest: {biggest.Category} {biggest.Amount}");
        }
    }
}
`,
      projectNote: 'Ledger.Balance becomes `Starting + _entries.Sum(e => e.Amount)` in v0.4, and the `top` command is a Where, an OrderBy and a FirstOrDefault with a null check, exactly like Biggest here.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 4-4 Grouping and aggregation                                       */
/* ------------------------------------------------------------------ */

const l44: Lesson = {
  id: 'cs-4-4',
  title: 'Totals per group',
  objective: 'Group a collection by a key, aggregate each group with Sum, Count, Min, Max and Average, test with Any and All, and pick the top group.',
  minutes: 22,
  lexicon: [
    { id: 'cs.4.groupby', term: 'GroupBy(x => x.Category)', kind: 'builtin', meaning: 'Split a sequence into groups, one per distinct key the lambda returns. Each group is itself a sequence of the items that share the key, with the key in `g.Key`. Groups come out in the order their keys were first seen, so sort before printing.', example: 'foreach (var g in entries.GroupBy(x => x.Category))\n{\n    Console.WriteLine($"{g.Key}: {g.Sum(x => x.Amount)}");\n}', analogy: 'Dealing a pile of receipts into one stack per shop. It breaks at order: the stacks are not alphabetical until you sort them.' },
    { id: 'cs.4.anonymous', term: 'new { Category = g.Key, Total = ... }', kind: 'pattern', meaning: 'An anonymous type: an object with exactly these read-only properties, whose class the compiler names for you. Declare the variable with `var`. It lives inside one method; it cannot be a method\'s return type, so to hand such rows out of a method you write a small named class instead.', example: 'var totals = entries\n    .GroupBy(x => x.Category)\n    .Select(g => new { Category = g.Key, Total = g.Sum(x => x.Amount) });' },
    { id: 'cs.4.min-max-average', term: 'Min, Max, Average', kind: 'builtin', meaning: 'Aggregates that read a whole sequence: smallest, largest, mean of what the lambda picks. All three throw InvalidOperationException on an empty sequence, so guard with `Any()`. `Average` returns a double even for ints.', example: 'int lowest = entries.Min(x => x.Amount);\nint highest = entries.Max(x => x.Amount);\ndouble mean = entries.Average(x => x.Amount);' },
    { id: 'cs.4.any-all', term: 'Any(test), All(test)', kind: 'builtin', meaning: '`Any(test)` is true if at least one item passes; `Any()` with no test asks whether the sequence has items at all. `All(test)` is true if every item passes, and is true for an empty sequence because nothing fails.', example: 'bool hasExpense = entries.Any(x => x.Amount < 0);\nbool allNamed = entries.All(x => x.Category != "");' },
    { id: 'cs.4.top-query', term: 'Where → OrderBy → FirstOrDefault', kind: 'pattern', meaning: 'The shape of "the best one, if any": keep the candidates, sort so the best comes first, take the first or null. Add `ThenBy` on a second key so ties are broken the same way every run.', example: 'var top = totals.Where(t => t.Total < 0).OrderBy(t => t.Total).ThenBy(t => t.Category).FirstOrDefault();\nif (top == null)\n{\n    Console.WriteLine("Top: none");\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'From a dictionary loop to a GroupBy',
      body: `The ByCategory loop was really two steps: put each entry in its category's pile, then total each pile. **GroupBy** does the first step: \`entries.GroupBy(x => x.Category)\` yields one group per distinct category, each group a sequence of entries with \`g.Key\` holding the category. **Select** then does the second: \`g.Sum(x => x.Amount)\` totals one pile.

What should a row of the report be? Here an **anonymous type**: \`new { Category = g.Key, Total = ... }\` makes an object with exactly those properties, and \`var\` names it. Anonymous types cannot leave the method they are made in; the project lesson shows the named class that replaces them when a Ledger method must return rows.

The other aggregates are \`Min\`, \`Max\` and \`Average\` (a double; cast or format it), all of which throw on an empty sequence, and the two questions \`Any\` and \`All\`. The last lines combine the lesson: among the totals, keep the negative ones, sort ascending so the most negative is first, take it or null.`,
      example: {
        language: 'csharp',
        source: `using System;
using System.Collections.Generic;
using System.Linq;

${ENTRY_CLASS}

class Program
{
    static void Main(string[] args)
    {
        var entries = new List<Entry>();
        entries.Add(new Entry(-30, "food"));
        entries.Add(new Entry(500, "salary"));
        entries.Add(new Entry(-10, "food"));
        entries.Add(new Entry(-200, "rent"));
        var totals = entries
            .GroupBy(x => x.Category)
            .Select(g => new { Category = g.Key, Total = g.Sum(x => x.Amount), Count = g.Count() })
            .OrderBy(t => t.Category);
        foreach (var t in totals)
        {
            Console.WriteLine($"{t.Category}: {t.Total} ({t.Count})");
        }
        Console.WriteLine(entries.Min(x => x.Amount));
        Console.WriteLine(entries.Max(x => x.Amount));
        Console.WriteLine((int)entries.Average(x => x.Amount));
        Console.WriteLine(entries.Any(x => x.Amount > 1000));
        Console.WriteLine(entries.All(x => x.Category != ""));
        var top = totals.Where(t => t.Total < 0).OrderBy(t => t.Total).FirstOrDefault();
        if (top == null)
        {
            Console.WriteLine("Top: none");
        }
        else
        {
            Console.WriteLine($"Top: {top.Category} {top.Total}");
        }
    }
}`,
        labels: [
          { lines: [21, 25], label: 'Four entries in three categories.' },
          { lines: [26, 29], label: 'One pile per category, each pile reduced to a row with Key, Sum and Count, rows sorted by name.' },
          { lines: [30, 33], label: 'Prints `food: -40 (2)`, `rent: -200 (1)`, `salary: 500 (1)`.' },
          { lines: [34, 36], label: 'Whole-sequence aggregates: -200, 500, and the mean 65 cast to an int.' },
          { lines: [37, 38], label: 'Two yes/no questions: False (no amount above 1000), True (every category is named).' },
          { lines: [39, 47], label: 'The top expense category: negative totals only, most negative first, or null. Prints `Top: rent -200`.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python had no groupby in the Ledger; you accumulated into a dict with `d[k] = d.get(k, 0) + x`. `GroupBy` plus `Select` replaces that loop. `min`, `max`, `any` and `all` exist in Python with the same meanings, including `all([])` being True. The anonymous type is like a namedtuple made on the spot, with typed fields.' },
        { from: 'c', note: 'Grouping in C meant parallel arrays of names and totals and a linear search per record, as in the Vault. `GroupBy` hashes the key and builds the piles for you. `Average` returning a double is the `(double)sum / n` you had to write by hand to avoid integer division.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'What does this print?',
      code: { language: 'csharp', source: 'var cats = new List<string> { "food", "rent", "food", "bus", "food" };\nvar groups = cats.GroupBy(c => c).OrderByDescending(g => g.Count()).ThenBy(g => g.Key);\nforeach (var g in groups)\n{\n    Console.WriteLine($"{g.Key} {g.Count()}");\n}' },
      choices: ['food 3\nbus 1\nrent 1', 'food 3\nrent 1\nbus 1', 'bus 1\nfood 3\nrent 1', 'food 1\nrent 1\nfood 1\nbus 1\nfood 1'],
      answer: 'food 3\nbus 1\nrent 1',
      explanation: '`GroupBy` makes three groups (food with 3 members, rent with 1, bus with 1), one per distinct key, never one per item. `OrderByDescending` on the count puts food first; rent and bus tie at 1, and `ThenBy(g => g.Key)` breaks the tie alphabetically, so bus comes before rent. Without the ThenBy the tie order would be first-seen order (rent, bus).',
    },
    {
      kind: 'predict',
      prompt: 'The list is empty. What is printed?',
      code: { language: 'csharp', source: 'var xs = new List<int>();\nConsole.WriteLine(xs.Any(x => x < 0));\nConsole.WriteLine(xs.All(x => x < 0));' },
      choices: ['False\nTrue', 'False\nFalse', 'True\nTrue', 'a runtime exception: InvalidOperationException'],
      answer: 'False\nTrue',
      explanation: '`Any` asks whether at least one item passes; with no items, none does, so False. `All` asks whether every item passes; there is no item that fails, so True (mathematicians call this vacuous truth). Neither throws on an empty sequence; `Min`, `Max` and `Average` would.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the part of `Main` (first line indented 8 spaces) that finds the category with the most negative total in `entries` and prints `Top: <category> <total>` or `Top: none`.',
      language: 'csharp',
      indentation: true,
      solution: ['        var groups = entries.GroupBy(x => x.Category);', '        var totals = groups.Select(g => new { Category = g.Key, Total = g.Sum(x => x.Amount) });', '        var top = totals.Where(t => t.Total < 0).OrderBy(t => t.Total).ThenBy(t => t.Category).FirstOrDefault();', '        if (top == null)', '        {', '            Console.WriteLine("Top: none");', '        }', '        else', '        {', '            Console.WriteLine($"Top: {top.Category} {top.Total}");', '        }'],
      distractors: ['        var totals = groups.Select(g => new { Category = g.Category, Total = g.Sum(x => x.Amount) });', '        var top = totals.OrderByDescending(t => t.Total).FirstOrDefault();'],
      explanation: 'A group has no `Category` property; the value every member shares is `g.Key`. Sorting all totals descending and taking the first gives the largest income, not the largest expense: the top expense needs `Where(t => t.Total < 0)` first and ascending order so the most negative comes out on top.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the grouped report and the yes/no question after it.',
      language: 'csharp',
      template: 'var totals = entries\n    .{{group}}(x => x.Category)\n    .Select(g => new { Category = g.{{key}}, Total = g.{{sum}}(x => x.Amount) })\n    .OrderBy(t => t.Category);\nforeach ({{v}} t in totals)\n{\n    Console.WriteLine($"{t.Category}: {t.Total}");\n}\nbool anyExpense = entries.{{any}}(x => x.Amount < 0);',
      blanks: [
        { id: 'group', answers: ['GroupBy'], hint: 'one pile per distinct category' },
        { id: 'key', answers: ['Key'], hint: 'the property of a group that holds what its members share' },
        { id: 'sum', answers: ['Sum'], hint: 'reduce one pile to a total' },
        { id: 'v', answers: ['var'], hint: 'the only way to name a variable of an anonymous type' },
        { id: 'any', answers: ['Any'], hint: 'true if at least one item passes' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The report is built with the Module 3 dictionary loop, and `Top:` is wrong: it names the single most negative entry instead of the category with the most negative total. Rebuild the per-category totals with `GroupBy`, `Select` and `OrderBy`, and compute `Top:` from those totals (ties broken by category name), or `Top: none` when no category total is negative.',
      language: 'csharp',
      starter: `using System;
using System.Collections.Generic;
using System.Linq;

${ENTRY_CLASS}

class Program
{
    static void Main(string[] args)
    {
${READ_ENTRIES_LOOP}
        var totals = new Dictionary<string, int>();
        foreach (Entry e in entries)
        {
            if (!totals.ContainsKey(e.Category))
            {
                totals[e.Category] = 0;
            }
            totals[e.Category] = totals[e.Category] + e.Amount;
        }
        foreach (KeyValuePair<string, int> pair in new SortedDictionary<string, int>(totals))
        {
            Console.WriteLine($"{pair.Key}: {pair.Value}");
        }
        Entry lowest = entries.OrderBy(x => x.Amount).FirstOrDefault();
        if (lowest == null || lowest.Amount >= 0)
        {
            Console.WriteLine("Top: none");
        }
        else
        {
            Console.WriteLine($"Top: {lowest.Category} {lowest.Amount}");
        }
    }
}
`,
      tests: [
        { description: 'two small food expenses outweigh one rent', stdin: '-30\nfood\n-30\nfood\n-50\nrent\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nfood: -60\nrent: -50\nTop: food -60' },
        { description: 'income only', stdin: '50\nsalary\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nsalary: 50\nTop: none' },
        { description: 'no entries', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nTop: none' },
        { description: 'tie broken by name', stdin: '-10\nb\n-10\na\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\na: -10\nb: -10\nTop: a -10' },
      ],
      hint: 'Build `totals` as in the concept step and call `ToList()` on it so it is a List of rows. Print the rows, then `totals.Where(t => t.Total < 0).OrderBy(t => t.Total).ThenBy(t => t.Category).FirstOrDefault()`.',
      solution: `using System;
using System.Collections.Generic;
using System.Linq;

${ENTRY_CLASS}

class Program
{
    static void Main(string[] args)
    {
${READ_ENTRIES_LOOP}
        var totals = entries
            .GroupBy(x => x.Category)
            .Select(g => new { Category = g.Key, Total = g.Sum(x => x.Amount) })
            .OrderBy(t => t.Category)
            .ToList();
        foreach (var t in totals)
        {
            Console.WriteLine($"{t.Category}: {t.Total}");
        }
        var top = totals.Where(t => t.Total < 0).OrderBy(t => t.Total).ThenBy(t => t.Category).FirstOrDefault();
        if (top == null)
        {
            Console.WriteLine("Top: none");
        }
        else
        {
            Console.WriteLine($"Top: {top.Category} {top.Total}");
        }
    }
}
`,
    },
    {
      kind: 'create',
      prompt: 'Read entries with `Amount (or quit)?` and `Category?` until `quit`. Then print `--- report ---`, one `<category>: <total>` line per category sorted by name (built with `GroupBy`), then `Top: <category> <total>` for the category with the most negative total (ties by name) or `Top: none`. Finally, if there is at least one entry, print `Smallest: <min amount>` and `Largest: <max amount>`; otherwise print `No entries`.',
      language: 'csharp',
      tests: [
        { description: 'four entries, three categories', stdin: '-30\nfood\n500\nsalary\n-10\nfood\n-200\nrent\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\n--- report ---\nfood: -40\nrent: -200\nsalary: 500\nTop: rent -200\nSmallest: -200\nLargest: 500' },
        { description: 'no entries', stdin: 'quit', expectedStdout: 'Amount (or quit)?\n--- report ---\nTop: none\nNo entries' },
        { description: 'a category whose total is positive despite an expense', stdin: '20\na\n-5\na\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\n--- report ---\na: 15\nTop: none\nSmallest: -5\nLargest: 20' },
        { description: 'tie broken by name', stdin: '-10\nb\n-10\na\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\n--- report ---\na: -10\nb: -10\nTop: a -10\nSmallest: -10\nLargest: -10' },
      ],
      hint: 'Guard `Min` and `Max` with `if (entries.Any())`: both throw on an empty list. The rest is the modify step with a header line.',
      solution: `using System;
using System.Collections.Generic;
using System.Linq;

${ENTRY_CLASS}

class Program
{
    static void Main(string[] args)
    {
${READ_ENTRIES_LOOP}
        Console.WriteLine("--- report ---");
        var totals = entries
            .GroupBy(x => x.Category)
            .Select(g => new { Category = g.Key, Total = g.Sum(x => x.Amount) })
            .OrderBy(t => t.Category)
            .ToList();
        foreach (var t in totals)
        {
            Console.WriteLine($"{t.Category}: {t.Total}");
        }
        var top = totals.Where(t => t.Total < 0).OrderBy(t => t.Total).ThenBy(t => t.Category).FirstOrDefault();
        if (top == null)
        {
            Console.WriteLine("Top: none");
        }
        else
        {
            Console.WriteLine($"Top: {top.Category} {top.Total}");
        }
        if (entries.Any())
        {
            Console.WriteLine($"Smallest: {entries.Min(x => x.Amount)}");
            Console.WriteLine($"Largest: {entries.Max(x => x.Amount)}");
        }
        else
        {
            Console.WriteLine("No entries");
        }
    }
}
`,
      projectNote: 'This is the v0.4 report and the `top` answer, computed in Main. The project lesson moves both queries into Ledger, which forces the anonymous row to become a named CategoryTotal class.',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* 4-5 Project: LedgerSharp v0.4                                      */
/* ------------------------------------------------------------------ */

const l45: Lesson = {
  id: 'cs-4-5',
  title: 'Project: LedgerSharp v0.4',
  objective: 'Rebuild the Ledger\'s report and balance as LINQ queries inside the class and add the `top` command to the conversation.',
  minutes: 24,
  lexicon: [
    { id: 'cs.4.row-class', term: 'class CategoryTotal { Category; Total }', kind: 'pattern', meaning: 'A small immutable class that names the shape of one report row. It replaces the anonymous type the moment a method must return rows, because `List<CategoryTotal>` can be a return type and `List<anonymous>` cannot.', example: 'class CategoryTotal\n{\n    public string Category { get; }\n    public int Total { get; }\n\n    public CategoryTotal(string category, int total)\n    {\n        Category = category;\n        Total = total;\n    }\n}' },
    { id: 'cs.4.queries-in-class', term: 'queries live in Ledger, Main prints', kind: 'pattern', meaning: 'Ledger answers questions with LINQ (`Balance`, `ByCategory`, `TopExpense`) and Main only formats the answers. A query that returns rows ends in `ToList()` so callers get a finished List, not a recipe over a private field.', example: 'public List<CategoryTotal> ByCategory()\n{\n    return _entries\n        .GroupBy(e => e.Category)\n        .Select(g => new CategoryTotal(g.Key, g.Sum(e => e.Amount)))\n        .OrderBy(t => t.Category)\n        .ToList();\n}' },
    { id: 'cs.4.command-word', term: 'a word at the amount prompt', kind: 'pattern', meaning: 'The input loop checks for command words (`quit`, now `top`) before parsing a number. A command prints its answer and re-prompts without adding an entry, so `Entries:` is unchanged by it.', example: 'if (line == "top")\n{\n    ...\n}\nelse\n{\n    int amount = int.Parse(line);\n    ...\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The same conversation, with queries inside',
      body: `LedgerSharp v0.4 prints what v0.3 printed, plus one command. Inside, every loop in \`Ledger\` is now a query. \`Balance\` is \`Starting + _entries.Sum(...)\`. \`ByCategory()\` is the GroupBy from the previous lesson, but it returns \`List<CategoryTotal>\`: an anonymous row cannot leave a method, so a small **named class** takes its place, and the method sorts and calls \`ToList()\` so Main receives finished rows. \`TopExpense()\` reuses \`ByCategory()\` with the Where, OrderBy, ThenBy, FirstOrDefault shape and returns a row or null.

The command: when the user types \`top\` at the amount prompt, print \`Top: <category> <total>\` for the category with the most negative total, or \`Top: none\`, then ask again. No entry is added and no \`Category?\` is asked. The loop therefore checks for the word before it parses a number.

Everything in the transcript that v0.3 promised still holds: \`Balance?\` once, \`Amount (or quit)?\` before every input, the summary sorted by category name, then the two footer lines.`,
      example: {
        language: 'csharp',
        source: LEDGER_V04.trimEnd(),
        labels: [
          { lines: [3, 3], label: 'LINQ is used inside Ledger, so the using goes at the top of the file.' },
          { lines: [5, 15], label: 'Entry, unchanged since Module 3.' },
          { lines: [17, 27], label: 'The named row that replaces the anonymous type: a category and its total, immutable.' },
          { lines: [31, 47], label: 'Ledger state, Add and Count, unchanged.' },
          { lines: [49, 52], label: 'Balance as one Sum instead of a loop.' },
          { lines: [54, 61], label: 'The report: group, reduce each group to a row, sort by name, freeze into a List.' },
          { lines: [63, 70], label: 'The top expense: negative rows only, most negative first, name breaks ties, or null.' },
          { lines: [77, 81], label: 'Starting balance and the first prompt, as before.' },
          { lines: [84, 95], label: 'The command word: ask the ledger, print the answer or `Top: none`, add nothing.' },
          { lines: [96, 103], label: 'Otherwise it is an amount: the v0.3 round.' },
          { lines: [104, 106], label: 'Both branches end by asking again.' },
          { lines: [107, 113], label: 'Summary from the rows, then the footer; the loop that built totals is gone.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'The Python Ledger reached v0.4 with a list of tuples and a dict loop in main. The C# v0.4 has the same transcript, but the report is a query inside the class and the row type is declared. If you wrote a Python `top` command it would be `min(totals.items(), key=lambda kv: (kv[1], kv[0]))` guarded by an `if`; here that is Where, OrderBy, ThenBy, FirstOrDefault.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The user types `100`, `-30`, `food`, `top`, `-30`, `food`, `top`, `quit`. Which lines are printed after the second `top` is entered, up to and including `Entries:`?',
      code: { language: 'csharp', source: LEDGER_V04.trimEnd() },
      choices: ['Top: food -60\nAmount (or quit)?\n--- summary ---\nfood: -60\nEntries: 2', 'Top: food -30\nAmount (or quit)?\n--- summary ---\nfood: -60\nEntries: 2', 'Top: food -60\nAmount (or quit)?\n--- summary ---\nfood: -60\nEntries: 4', 'Category?\nTop: food -60\n--- summary ---\nfood: -60\nEntries: 2'],
      answer: 'Top: food -60\nAmount (or quit)?\n--- summary ---\nfood: -60\nEntries: 2',
      explanation: '`TopExpense` reports the category total, and by the second `top` both food entries exist, so -60, not the single entry -30. The command branch asks no `Category?` and adds nothing, so the two `top` words leave `Count` at 2. Every branch of the loop ends with `Amount (or quit)?`, so the prompt appears before `quit` ends the loop and the summary begins.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the `TopExpense` method inside `Ledger` (first line indented 4 spaces). It builds on `ByCategory()`, which already returns the sorted rows.',
      language: 'csharp',
      indentation: true,
      solution: ['    public CategoryTotal TopExpense()', '    {', '        return ByCategory()', '            .Where(t => t.Total < 0)', '            .OrderBy(t => t.Total)', '            .ThenBy(t => t.Category)', '            .FirstOrDefault();', '    }'],
      distractors: ['            .First();', '            .OrderByDescending(t => t.Total)'],
      explanation: '`First()` throws when no category total is negative, and "no expenses yet" is a normal state of the ledger; `FirstOrDefault()` gives null, which Main turns into `Top: none`. Descending order would put the largest total, an income, first; the most negative total must come first, which ascending order does.',
    },
    {
      kind: 'create',
      prompt: `Write LedgerSharp v0.4. Keep \`Entry\` and add \`CategoryTotal\` (\`Category\`, \`Total\`, constructor). \`Ledger\` has \`Add\`, \`Count\`, \`Balance\` (via \`Sum\`), \`ByCategory()\` returning a \`List<CategoryTotal>\` sorted by category (via \`GroupBy\`, \`Select\`, \`OrderBy\`, \`ToList\`) and \`TopExpense()\` returning the row with the most negative total (ties by name) or null. Behaviour:

- Print \`Balance?\` and read the starting balance.
- Repeat \`Amount (or quit)?\`. On \`quit\` stop. On \`top\` print \`Top: <category> <total>\` for the category with the most negative total, or \`Top: none\`, and ask again without adding anything. Otherwise print \`Category?\`, read it, add the entry and print \`Balance: <running>\`.
- After quit print \`--- summary ---\`, one \`<category>: <total>\` line per category sorted by name, then \`Entries: <count>\` and \`Final balance: <n>\`.`,
      language: 'csharp',
      tests: [
        { description: 'the v0.3 transcript still holds', stdin: '100\n-30\nfood\n50\nsalary\n-10\nfood\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: 70\nAmount (or quit)?\nCategory?\nBalance: 120\nAmount (or quit)?\nCategory?\nBalance: 110\nAmount (or quit)?\n--- summary ---\nfood: -40\nsalary: 50\nEntries: 3\nFinal balance: 110' },
        { description: 'quit immediately', stdin: '100\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\n--- summary ---\nEntries: 0\nFinal balance: 100' },
        { description: 'top with expenses: category total beats single entry', stdin: '100\n-30\nfood\n-30\nfood\n-50\nrent\ntop\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: 70\nAmount (or quit)?\nCategory?\nBalance: 40\nAmount (or quit)?\nCategory?\nBalance: -10\nAmount (or quit)?\nTop: food -60\nAmount (or quit)?\n--- summary ---\nfood: -60\nrent: -50\nEntries: 3\nFinal balance: -10' },
        { description: 'top without expenses, before and after an income', stdin: '100\ntop\n50\nsalary\ntop\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nTop: none\nAmount (or quit)?\nCategory?\nBalance: 150\nAmount (or quit)?\nTop: none\nAmount (or quit)?\n--- summary ---\nsalary: 50\nEntries: 1\nFinal balance: 150' },
        { description: 'a category that nets positive is not an expense', stdin: '0\n-30\nfood\n40\nfood\ntop\n-5\nbus\ntop\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: -30\nAmount (or quit)?\nCategory?\nBalance: 10\nAmount (or quit)?\nTop: none\nAmount (or quit)?\nCategory?\nBalance: 5\nAmount (or quit)?\nTop: bus -5\nAmount (or quit)?\n--- summary ---\nbus: -5\nfood: 10\nEntries: 3\nFinal balance: 5' },
        { description: 'tie on the top total is broken by name', stdin: '10\n-10\nb\n-10\na\ntop\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: 0\nAmount (or quit)?\nCategory?\nBalance: -10\nAmount (or quit)?\nTop: a -10\nAmount (or quit)?\n--- summary ---\na: -10\nb: -10\nEntries: 2\nFinal balance: -10' },
      ],
      hint: 'Start from v0.3 and the labels in the concept step: add CategoryTotal, swap the two loops in Ledger for queries, add TopExpense, then put an `if (line == "top") ... else ...` around the body of the input loop with the re-prompt after both branches. Run the tests after each chunk.',
      solution: LEDGER_V04,
      projectNote: 'LedgerSharp v0.4 complete: the v0.3 conversation with every loop inside Ledger replaced by a LINQ query, and a `top` command answered by one. Module 5 keeps this I/O and adds the JSON file, TryParse and error handling around it.',
    },
  ],
};

export const m4: Module = {
  id: 'cs-m4',
  title: 'Collections and LINQ',
  goal: 'List<T> and arrays, Dictionary<K,V> with TryGetValue, LINQ queries (Where/Select/Sum/OrderBy), deferred execution, GroupBy with anonymous types, Min/Max/Average and Any/All.',
  projectMilestone: 'LedgerSharp v0.4: reports by category with LINQ.',
  status: 'available',
  lessons: [l41, l42, l43, l44, l45],
};
