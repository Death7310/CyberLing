import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 3: Classes and objects                                      */
/* ------------------------------------------------------------------ */

/** LedgerSharp v0.3, exactly as tested in cs-3-5 and shown labelled in its concept step. */
const LEDGER_V03 = `using System;
using System.Collections.Generic;

class Entry
{
    public int Amount { get; }
    public string Category { get; }

    public Entry(int amount, string category)
    {
        Amount = amount;
        Category = category;
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
        get
        {
            int total = Starting;
            foreach (Entry e in _entries)
            {
                total = total + e.Amount;
            }
            return total;
        }
    }

    public Dictionary<string, int> ByCategory()
    {
        var totals = new Dictionary<string, int>();
        foreach (Entry e in _entries)
        {
            if (!totals.ContainsKey(e.Category))
            {
                totals[e.Category] = 0;
            }
            totals[e.Category] = totals[e.Category] + e.Amount;
        }
        return totals;
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
            int amount = int.Parse(line);
            Console.WriteLine("Category?");
            string category = Console.ReadLine();
            ledger.Add(new Entry(amount, category));
            Console.WriteLine($"Balance: {ledger.Balance}");
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }
        Console.WriteLine("--- summary ---");
        var sorted = new SortedDictionary<string, int>(ledger.ByCategory());
        foreach (KeyValuePair<string, int> pair in sorted)
        {
            Console.WriteLine($"{pair.Key}: {pair.Value}");
        }
        Console.WriteLine($"Entries: {ledger.Count}");
        Console.WriteLine($"Final balance: {ledger.Balance}");
    }
}
`;

const l31: Lesson = {
  id: 'cs-3-1',
  title: 'Blueprints and the objects they make',
  objective: 'Define a class with properties and a constructor, make objects with new, and predict what sharing a reference does.',
  minutes: 20,
  lexicon: [
    { id: 'cs.3.class', term: 'class Name { ... }', kind: 'keyword', meaning: 'Define a new type: a blueprint listing the data (properties) and behaviour (methods) every object of that type has. Names are CapitalCase; the body is in braces, not after a colon.', example: 'class Entry\n{\n    public int Amount { get; set; }\n}', analogy: 'A noun versus an individual: "entry" is the class, this -30 for food is an object. It breaks because a C# class is not itself a value you can pass around the way a Python class is.' },
    { id: 'cs.3.property', term: 'public int Amount { get; set; }', kind: 'pattern', meaning: 'An auto-property: a typed slot on the object that can be read (get) and written (set) with dot syntax. The compiler creates the hidden field. Leave out set to make it read-only after construction.', example: 'public string Category { get; set; }\n\nentry.Category = "food";\nConsole.WriteLine(entry.Category);' },
    { id: 'cs.3.ctor', term: 'public Entry(int amount, string category) { ... }', kind: 'pattern', meaning: 'The constructor: a method with the class name and no return type, run once on each new object to fill in its starting state.', example: 'public Entry(int amount, string category)\n{\n    Amount = amount;\n    Category = category;\n}' },
    { id: 'cs.3.new', term: 'new Entry(-30, "food")', kind: 'keyword', meaning: 'Allocate an object on the managed heap, run its constructor with these arguments, and hand back a reference to it. The garbage collector frees it later; you never do.', example: 'var e = new Entry(-30, "food");', analogy: 'malloc plus an initialiser, with the free() done for you. It breaks because you cannot ask for the address or the size: you only ever hold a reference.' },
    { id: 'cs.3.reference', term: 'reference vs value copy', kind: 'concept', meaning: 'A class-typed variable holds a reference to an object, so assigning it to another variable makes two names for one object. A struct is copied whole on assignment, so the copies are independent.', example: 'Entry a = new Entry(5, "x");\nEntry b = a;\nb.Amount = 9;   // a.Amount is 9 too', analogy: 'Two nicknames for one person (class) versus a photocopy of a form (struct). The nickname analogy breaks for `this`: inside the object, there is a word for "me" that Python spells `self`.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'One blueprint, many objects',
      body: `Python taught you the idea: a class is a blueprint, and calling it makes objects. C# keeps the idea and makes everything explicit. Each piece of data is a **property** with a declared type: \`public int Amount { get; set; }\`. The **constructor** is a method named after the class with no return type; it runs when you write \`new Entry(-30, "food")\`. Inside it, \`this.Amount\` means "this object's Amount", and the \`this.\` can be left out when no parameter has the same name.

The notional machine matters here. \`new\` puts the object on the managed heap and hands back a **reference**. A variable of class type holds that reference, not the object. Assign it to a second variable and you have two names for one object, like a Python list given two names. A \`struct\` is the exception: it is copied whole, like a C struct.`,
      example: {
        language: 'csharp',
        source: `using System;

class Entry
{
    public int Amount { get; set; }
    public string Category { get; set; }

    public Entry(int amount, string category)
    {
        this.Amount = amount;
        Category = category;
    }
}

class Program
{
    static void Main(string[] args)
    {
        var food = new Entry(-30, "food");
        var pay = new Entry(500, "salary");
        Entry same = food;
        same.Amount = -45;
        Console.WriteLine($"{food.Category}: {food.Amount}");
        Console.WriteLine($"{pay.Category}: {pay.Amount}");
    }
}`,
        labels: [
          { lines: [3, 4], label: 'Start the blueprint; braces open its body.' },
          { lines: [5, 6], label: 'Two typed properties with a getter and a setter.' },
          { lines: [8, 12], label: 'Constructor: same name as the class, no return type; fill in the starting state. `this.` is optional.' },
          { lines: [19, 20], label: 'Two objects on the heap, each with its own Amount and Category.' },
          { lines: [21, 22], label: 'A second name for the first object: the change is visible through `food` too.' },
          { lines: [23, 24], label: 'Prints `food: -45` and `salary: 500`.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`__init__(self, ...)` becomes a method named after the class, and `self` becomes `this`, which you may leave out. Attributes are declared up front as typed properties: you cannot invent `entry.note = 1` at run time. Sharing works as in Python: `same = food` is a second name, not a copy.' },
        { from: 'c', note: 'A C struct variable IS the data; copying it copies everything. A C# class variable is like a pointer to a heap block that `new` allocated, but with no `*`, no `->` (just `.`), no `free()`, and no pointer arithmetic. C# `struct` keeps the C copy semantics.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Using the `Entry` class from the example, what does this `Main` print?',
      code: { language: 'csharp', source: 'Entry a = new Entry(-30, "food");\nEntry b = a;\nb.Amount = -50;\nConsole.WriteLine(a.Amount);' },
      choices: ['-50', '-30', '0', 'a compile error'],
      answer: '-50',
      explanation: '`Entry` is a class, so `b = a` copies the reference, not the object. Both names point at the same heap object, and setting `b.Amount` changes the one object that `a` also refers to.',
    },
    {
      kind: 'predict',
      prompt: '`Money` is declared with the keyword `struct` instead of `class`. What is printed?',
      code: { language: 'csharp', source: 'struct Money\n{\n    public int Cents;\n}\n\nclass Program\n{\n    static void Main(string[] args)\n    {\n        Money a = new Money();\n        a.Cents = 100;\n        Money b = a;\n        b.Cents = 5;\n        Console.WriteLine(a.Cents);\n    }\n}' },
      choices: ['100', '5', '0', 'a compile error'],
      answer: '100',
      explanation: 'A struct is a value type: `b = a` copies the whole struct, so `b` is an independent copy and changing `b.Cents` leaves `a` alone. This is the C behaviour. Change `struct` to `class` and the answer becomes 5.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the `Entry` class: two auto-properties and a constructor that fills them. Braces go on their own lines; set the indentation yourself.',
      language: 'csharp',
      indentation: true,
      solution: ['class Entry', '{', '    public int Amount { get; set; }', '    public string Category { get; set; }', '    public Entry(int amount, string category)', '    {', '        Amount = amount;', '        Category = category;', '    }', '}'],
      distractors: ['    public void Entry(int amount, string category)', '        self.Amount = amount;'],
      explanation: 'A constructor has no return type at all; writing `void` turns it into an ordinary method that `new` never calls. The object\'s own name inside a method is `this`, and it is optional here; `self` is Python.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the class and the line that makes an object from it.',
      language: 'csharp',
      template: 'class Entry\n{\n    public int Amount {{prop}}\n    public string Category { get; set; }\n\n    public Entry(int amount, string category)\n    {\n        {{self}}.Amount = amount;\n        Category = category;\n    }\n}\n\n// inside Main:\nvar e = {{make}} Entry(-30, "food");',
      blanks: [
        { id: 'prop', answers: ['{ get; set; }', '{get; set;}', '{ get; set;}', '{get;set;}'], hint: 'the braces that make it an auto-property' },
        { id: 'self', answers: ['this'], hint: 'the C# word for the current object' },
        { id: 'make', answers: ['new'], hint: 'the keyword that allocates and runs the constructor' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The program reads an amount and a category but `Entry` only stores the amount. Add a `Category` property, take it in the constructor, and print `Entry: <category> <amount>`.',
      language: 'csharp',
      starter: `using System;

class Entry
{
    public int Amount { get; set; }

    public Entry(int amount)
    {
        Amount = amount;
    }
}

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Amount?");
        int amount = int.Parse(Console.ReadLine());
        Console.WriteLine("Category?");
        string category = Console.ReadLine();
        var entry = new Entry(amount);
        Console.WriteLine($"Entry: {entry.Amount}");
    }
}
`,
      tests: [
        { description: '-30 food', stdin: '-30\nfood', expectedStdout: 'Amount?\nCategory?\nEntry: food -30' },
        { description: '500 salary', stdin: '500\nsalary', expectedStdout: 'Amount?\nCategory?\nEntry: salary 500' },
      ],
      hint: 'A second property `public string Category { get; set; }`, a second constructor parameter, and `new Entry(amount, category)`.',
      solution: `using System;

class Entry
{
    public int Amount { get; set; }
    public string Category { get; set; }

    public Entry(int amount, string category)
    {
        Amount = amount;
        Category = category;
    }
}

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Amount?");
        int amount = int.Parse(Console.ReadLine());
        Console.WriteLine("Category?");
        string category = Console.ReadLine();
        var entry = new Entry(amount, category);
        Console.WriteLine($"Entry: {entry.Category} {entry.Amount}");
    }
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write a program with an `Entry` class (`Amount`, `Category`, constructor). Read two entries, each with the prompts `Amount?` then `Category?`, store each in its own `Entry` object, then print `1. <category>: <amount>`, `2. <category>: <amount>` and `Total: <sum of both amounts>`.',
      language: 'csharp',
      tests: [
        { description: 'expense and income', stdin: '-30\nfood\n50\nsalary', expectedStdout: 'Amount?\nCategory?\nAmount?\nCategory?\n1. food: -30\n2. salary: 50\nTotal: 20' },
        { description: 'two expenses', stdin: '-5\nbus\n-15\nfood', expectedStdout: 'Amount?\nCategory?\nAmount?\nCategory?\n1. bus: -5\n2. food: -15\nTotal: -20' },
        { description: 'zeros', stdin: '0\na\n0\nb', expectedStdout: 'Amount?\nCategory?\nAmount?\nCategory?\n1. a: 0\n2. b: 0\nTotal: 0' },
      ],
      hint: 'Write the class above `Program`. In Main, read amount and category twice, make two `new Entry(...)` objects, and add their `Amount` properties for the total.',
      solution: `using System;

class Entry
{
    public int Amount { get; set; }
    public string Category { get; set; }

    public Entry(int amount, string category)
    {
        Amount = amount;
        Category = category;
    }
}

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Amount?");
        int amount1 = int.Parse(Console.ReadLine());
        Console.WriteLine("Category?");
        string category1 = Console.ReadLine();
        var first = new Entry(amount1, category1);
        Console.WriteLine("Amount?");
        int amount2 = int.Parse(Console.ReadLine());
        Console.WriteLine("Category?");
        string category2 = Console.ReadLine();
        var second = new Entry(amount2, category2);
        Console.WriteLine($"1. {first.Category}: {first.Amount}");
        Console.WriteLine($"2. {second.Category}: {second.Amount}");
        Console.WriteLine($"Total: {first.Amount + second.Amount}");
    }
}
`,
      projectNote: 'Entry is the record type of LedgerSharp: one object per movement, with a typed Amount and Category. v0.3 stores many of them inside a Ledger.',
    },
  ],
};

const l32: Lesson = {
  id: 'cs-3-2',
  title: 'What an object can do',
  objective: 'Give a class instance methods, hide its fields behind private and read-only properties, and override ToString.',
  minutes: 20,
  lexicon: [
    { id: 'cs.3.method', term: 'public bool Apply(int amount) { ... }', kind: 'pattern', meaning: 'An instance method: a function that runs on one object and can read and change its fields. Called as `acc.Apply(-30)`; inside, the fields are reached directly or through `this`.', example: 'public void Reset()\n{\n    _balance = 0;\n}\n\nacc.Reset();' },
    { id: 'cs.3.private', term: 'private', kind: 'keyword', meaning: 'Visible only inside the class. Fields are usually private so that every change goes through a method that can check it. `{ get; private set; }` makes a property readable everywhere but writable only inside the class.', example: 'private int _balance;\npublic int Count { get; private set; }', analogy: 'A bank clerk between you and the drawer: you ask, you do not reach in. Unlike Python\'s underscore convention, the C# compiler enforces it: `acc._balance` outside the class does not compile.' },
    { id: 'cs.3.getter-only', term: 'public string Owner { get; }', kind: 'pattern', meaning: 'A read-only auto-property: it can be assigned only in the constructor. Anywhere else, assignment is a compile error. A property can also compute its value in a `get { ... }` block.', example: 'public string Owner { get; }\npublic int Balance\n{\n    get { return _balance; }\n}' },
    { id: 'cs.3.tostring', term: 'public override string ToString()', kind: 'pattern', meaning: 'The text that Console.WriteLine and string interpolation show for an object. Without it you get the type name, like `Account`. `override` is required because every object already has a ToString.', example: 'public override string ToString()\n{\n    return $"Account({Owner}, {_balance})";\n}' },
    { id: 'cs.3.static-vs-instance', term: 'static member vs instance member', kind: 'concept', meaning: 'A static member belongs to the class itself, one copy in total, reached as `Account.Created`. An instance member belongs to each object, reached as `acc.Balance`. Static methods (Module 2) cannot touch instance fields because there is no `this`.', example: 'public static int Created;\nConsole.WriteLine(Account.Created);' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Commands, queries, and a closed drawer',
      body: `An object is useful when it protects its own data. Make the field \`private\` and offer **methods** that change it under rules: \`Apply\` refuses an amount that would take the balance below zero and reports with a bool. A **read-only property** (\`{ get; }\`) can be set only in the constructor, so \`Owner\` can never be changed afterwards; a property with a \`get { ... }\` block computes its answer from the private field.

Override \`ToString\` to decide what \`Console.WriteLine(acc)\` shows; otherwise it prints the type name.

Everything above is per object. A \`static\` member belongs to the class: \`Account.Created\` is one counter shared by all accounts. Module 2's static methods were the same idea; they had no \`this\`.`,
      example: {
        language: 'csharp',
        source: `using System;

class Account
{
    private int _balance;
    public string Owner { get; }
    public static int Created = 0;

    public Account(string owner, int starting)
    {
        Owner = owner;
        _balance = starting;
        Created = Created + 1;
    }

    public bool Apply(int amount)
    {
        if (_balance + amount < 0)
        {
            return false;
        }
        _balance = _balance + amount;
        return true;
    }

    public int Balance
    {
        get { return _balance; }
    }

    public override string ToString()
    {
        return $"Account({Owner}, {_balance})";
    }
}

class Program
{
    static void Main(string[] args)
    {
        var sam = new Account("Sam", 100);
        var ana = new Account("Ana", 0);
        Console.WriteLine(sam.Apply(-30));
        Console.WriteLine(ana.Apply(-30));
        Console.WriteLine(sam);
        Console.WriteLine(ana.Balance);
        Console.WriteLine(Account.Created);
    }
}`,
        labels: [
          { lines: [5, 7], label: 'State: a private field, a read-only property, and one static counter shared by all accounts.' },
          { lines: [9, 14], label: 'Constructor fills the read-only property and the field, and counts the object.' },
          { lines: [16, 24], label: 'Command with a rule: refuse (false) or change and confirm (true).' },
          { lines: [26, 29], label: 'Query: a property that reads the private field. Nobody outside can write it.' },
          { lines: [31, 34], label: 'What the object looks like when printed.' },
          { lines: [41, 46], label: 'Prints True, False, Account(Sam, 70), 0, 2.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`__repr__` becomes `override ToString()`. `@property def balance(self)` becomes `public int Balance { get { ... } }`. A leading underscore is still a convention for private fields, but the word `private` is what actually closes the drawer: the compiler rejects `sam._balance` from outside.' },
        { from: 'c', note: 'In C you would write `apply(&acc, -30)` and pass the struct\'s address. In C# the object is the hidden first argument: `acc.Apply(-30)` and `this` is that pointer. A C struct has no way to hide a field; `private` does.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Using `Account` from the example, what does this `Main` print?',
      code: { language: 'csharp', source: 'var a = new Account("Sam", 50);\nConsole.WriteLine(a.Apply(-80));\nConsole.WriteLine(a.Apply(-20));\nConsole.WriteLine(a);' },
      choices: ['False\nTrue\nAccount(Sam, 30)', 'True\nTrue\nAccount(Sam, -50)', 'False\nTrue\nAccount', 'False\nFalse\nAccount(Sam, 50)'],
      answer: 'False\nTrue\nAccount(Sam, 30)',
      explanation: '50 - 80 would be negative, so the first Apply refuses and changes nothing. 50 - 20 = 30 is allowed. Printing the object uses the overridden ToString, so you see the owner and balance, not the type name.',
    },
    {
      kind: 'predict',
      prompt: 'A line `sam._balance = 0;` is added to `Main`, outside the class. What happens?',
      code: { language: 'csharp', source: 'var sam = new Account("Sam", 100);\nsam._balance = 0;\nConsole.WriteLine(sam.Balance);' },
      choices: ['a compile error: _balance is inaccessible', '0', '100', 'a runtime exception'],
      answer: 'a compile error: _balance is inaccessible',
      explanation: '`private` is enforced by the compiler, not at run time. Code outside `Account` cannot read or write `_balance`; the only way in is `Apply`, which checks the rule. This is the point of encapsulation.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the `Apply` method inside `Account` (its first line is indented 4 spaces). Refuse an amount that would make the balance negative; otherwise change the balance and report success.',
      language: 'csharp',
      indentation: true,
      solution: ['    public bool Apply(int amount)', '    {', '        if (_balance + amount < 0)', '        {', '            return false;', '        }', '        _balance = _balance + amount;', '        return true;', '    }'],
      distractors: ['        return True;', '        _balance = amount;'],
      explanation: 'C# booleans are lowercase `true` and `false`. The method adds the amount to the existing balance; assigning `amount` would replace the balance instead of moving it.',
    },
    {
      kind: 'modify',
      prompt: 'Anyone can write `acc.Balance = ...` and printing the account shows only `Account`. Make `Balance` writable only inside the class, add `public void Apply(int amount)` that adds to it, and override `ToString` to give `Account(<Owner>, <balance>)`. `Main` should call `Apply` instead of assigning.',
      language: 'csharp',
      starter: `using System;

class Account
{
    public string Owner { get; set; }
    public int Balance { get; set; }

    public Account(string owner, int starting)
    {
        Owner = owner;
        Balance = starting;
    }
}

class Program
{
    static void Main(string[] args)
    {
        var acc = new Account("Sam", 100);
        Console.WriteLine("Amount?");
        int amount = int.Parse(Console.ReadLine());
        acc.Balance = acc.Balance + amount;
        Console.WriteLine(acc);
    }
}
`,
      tests: [
        { description: 'expense of 30', stdin: '-30', expectedStdout: 'Amount?\nAccount(Sam, 70)' },
        { description: 'zero', stdin: '0', expectedStdout: 'Amount?\nAccount(Sam, 100)' },
        { description: 'income', stdin: '250', expectedStdout: 'Amount?\nAccount(Sam, 350)' },
      ],
      hint: '`public int Balance { get; private set; }` keeps the getter public. The override needs the word `override` and returns an interpolated string.',
      solution: `using System;

class Account
{
    public string Owner { get; }
    public int Balance { get; private set; }

    public Account(string owner, int starting)
    {
        Owner = owner;
        Balance = starting;
    }

    public void Apply(int amount)
    {
        Balance = Balance + amount;
    }

    public override string ToString()
    {
        return $"Account({Owner}, {Balance})";
    }
}

class Program
{
    static void Main(string[] args)
    {
        var acc = new Account("Sam", 100);
        Console.WriteLine("Amount?");
        int amount = int.Parse(Console.ReadLine());
        acc.Apply(amount);
        Console.WriteLine(acc);
    }
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write `class Account` with a private balance field, a read-only `Owner`, a constructor `Account(string owner, int starting)`, `bool Apply(int amount)` that refuses (returns false, changes nothing) when the balance would go below zero, and `ToString` giving `Account(<Owner>, <balance>)`. In `Main`: print `Owner?` and read it; create the account with a starting balance of 0; repeat `Amount (or quit)?`: for each amount print `Rejected` if `Apply` refused, otherwise print the account. After `quit` print `Final: <balance>`.',
      language: 'csharp',
      tests: [
        { description: 'income then expense', stdin: 'Sam\n100\n-30\nquit', expectedStdout: 'Owner?\nAmount (or quit)?\nAccount(Sam, 100)\nAmount (or quit)?\nAccount(Sam, 70)\nAmount (or quit)?\nFinal: 70' },
        { description: 'a rejected expense', stdin: 'Ana\n-5\n20\n-5\nquit', expectedStdout: 'Owner?\nAmount (or quit)?\nRejected\nAmount (or quit)?\nAccount(Ana, 20)\nAmount (or quit)?\nAccount(Ana, 15)\nAmount (or quit)?\nFinal: 15' },
        { description: 'quit at once', stdin: 'Bo\nquit', expectedStdout: 'Owner?\nAmount (or quit)?\nFinal: 0' },
        { description: 'exactly to zero is allowed', stdin: 'Cy\n10\n-10\nquit', expectedStdout: 'Owner?\nAmount (or quit)?\nAccount(Cy, 10)\nAmount (or quit)?\nAccount(Cy, 0)\nAmount (or quit)?\nFinal: 0' },
      ],
      hint: 'The class is the one from the concept step without the static counter. The loop is the Module 2 sentinel loop: ask once before `while`, then again at the bottom of the body.',
      solution: `using System;

class Account
{
    private int _balance;
    public string Owner { get; }

    public Account(string owner, int starting)
    {
        Owner = owner;
        _balance = starting;
    }

    public bool Apply(int amount)
    {
        if (_balance + amount < 0)
        {
            return false;
        }
        _balance = _balance + amount;
        return true;
    }

    public int Balance
    {
        get { return _balance; }
    }

    public override string ToString()
    {
        return $"Account({Owner}, {_balance})";
    }
}

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Owner?");
        string owner = Console.ReadLine();
        var acc = new Account(owner, 0);
        Console.WriteLine("Amount (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            int amount = int.Parse(line);
            if (acc.Apply(amount))
            {
                Console.WriteLine(acc);
            }
            else
            {
                Console.WriteLine("Rejected");
            }
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }
        Console.WriteLine($"Final: {acc.Balance}");
    }
}
`,
      projectNote: 'Ledger will own its entries the same way: a private list, an Add command, and Balance as a property that nobody outside can set.',
    },
  ],
};

const l33: Lesson = {
  id: 'cs-3-3',
  title: 'Objects that never change, and when two are equal',
  objective: 'Make a class immutable with readonly and getter-only properties, and define equality by value with Equals.',
  minutes: 18,
  lexicon: [
    { id: 'cs.3.readonly', term: 'readonly', kind: 'keyword', meaning: 'A field that can be assigned only in its declaration or in a constructor. Any later assignment is a compile error. Together with getter-only properties, it makes an object immutable.', example: 'private readonly int _amount;' },
    { id: 'cs.3.ref-equality', term: '== on class objects', kind: 'concept', meaning: 'For classes, `==` asks whether two variables refer to the same object, not whether the objects hold the same values. Two separately constructed objects are never `==`, even with identical properties. Strings are the exception: `==` compares their text.', example: 'var a = new Entry(5, "x");\nvar b = new Entry(5, "x");\nConsole.WriteLine(a == b);   // False', analogy: 'Two identical printed forms are still two sheets of paper. The analogy breaks for strings, where C# chose to compare the writing instead of the paper.' },
    { id: 'cs.3.equals-override', term: 'public override bool Equals(object obj)', kind: 'pattern', meaning: 'Define what "equal" means for your class, usually property by property. `obj as Entry` gives null when obj is not an Entry. Whenever you override Equals you also override GetHashCode so dictionaries agree with it.', example: 'public override bool Equals(object obj)\n{\n    Entry other = obj as Entry;\n    if (other == null)\n    {\n        return false;\n    }\n    return Amount == other.Amount && Category == other.Category;\n}' },
    { id: 'cs.3.value-like', term: 'value-like class', kind: 'concept', meaning: 'An immutable class whose Equals compares contents. It behaves like a number or a tuple: safe to share, safe to use as a dictionary key, compared by what it holds.', example: 'new Entry(-30, "food").Equals(new Entry(-30, "food"))   // True' },
    { id: 'cs.3.record', term: 'record (prose only here)', kind: 'concept', meaning: 'A newer C# declaration, `record Entry(int Amount, string Category);`, that writes the constructor, getter-only properties, value Equals, GetHashCode and ToString for you, like Python\'s @dataclass. The runner in this app targets older compilers, so this track writes those members by hand.', example: 'public record Entry(int Amount, string Category);   // C# 9+' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Immutable by construction, equal by content',
      body: `An object nobody can change is an object everybody can share. Two tools make it so: a **readonly** field can be assigned only in the constructor, and a getter-only property (\`{ get; }\`) has no setter at all. Try to assign either later and the compiler refuses.

Equality is the second question. For classes, \`==\` compares **references**: are these the same object? Two separate \`new Entry(-30, "food")\` are not. If you want "same contents", **override Equals**: convert the incoming object with \`as\`, reject null, then compare the properties. Override \`GetHashCode\` too, so a dictionary that uses Entry as a key agrees with Equals.

Modern C# can write all of this for you with \`record Entry(int Amount, string Category);\`, the way Python's \`@dataclass\` does. The compilers this app runs on do not all support records, so in this track you write the three members by hand and understand what a record would generate.`,
      example: {
        language: 'csharp',
        source: `using System;

class Entry
{
    private readonly int _amount;
    public string Category { get; }

    public Entry(int amount, string category)
    {
        _amount = amount;
        Category = category;
    }

    public int Amount
    {
        get { return _amount; }
    }

    public override bool Equals(object obj)
    {
        Entry other = obj as Entry;
        if (other == null)
        {
            return false;
        }
        return Amount == other.Amount && Category == other.Category;
    }

    public override int GetHashCode()
    {
        return Amount * 31 + Category.GetHashCode();
    }
}

class Program
{
    static void Main(string[] args)
    {
        var a = new Entry(-30, "food");
        var b = new Entry(-30, "food");
        var c = a;
        Console.WriteLine(a == b);
        Console.WriteLine(a.Equals(b));
        Console.WriteLine(a == c);
    }
}`,
        labels: [
          { lines: [5, 6], label: 'Immutable state: a readonly field and a getter-only property.' },
          { lines: [8, 12], label: 'The constructor is the only place either may be assigned.' },
          { lines: [14, 17], label: 'Expose the field through a computed read-only property.' },
          { lines: [19, 28], label: 'Equality by content: convert with `as`, reject null, compare both properties.' },
          { lines: [30, 33], label: 'A hash that agrees with Equals: equal entries give equal numbers.' },
          { lines: [39, 44], label: 'Prints False (different objects), True (same contents), True (same object).' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python `==` calls `__eq__`; a plain class inherits identity comparison, a @dataclass compares fields. C# is the same split: plain classes compare references with `==`, and `Equals` is the method you override (there is also `operator ==`, not taught here). `is` in Python is `ReferenceEquals(a, b)` in C#.' },
        { from: 'c', note: 'C has no `==` for structs at all; you compare field by field or memcmp. C# gives every object a default Equals (reference identity) and lets you replace it. `readonly` is `const` on a struct member, but checked at the point of assignment rather than through pointer types.' },
      ],
    },
    {
      kind: 'predict',
      prompt: '`Entry` here has NO Equals override. What is printed?',
      code: { language: 'csharp', source: 'class Entry\n{\n    public int Amount { get; set; }\n    public Entry(int amount) { Amount = amount; }\n}\n\n// in Main:\nvar a = new Entry(5);\nvar b = new Entry(5);\nvar c = a;\nConsole.WriteLine(a == b);\nConsole.WriteLine(a == c);\nConsole.WriteLine(a.Equals(b));' },
      choices: ['False\nTrue\nFalse', 'True\nTrue\nTrue', 'False\nTrue\nTrue', 'True\nTrue\nFalse'],
      answer: 'False\nTrue\nFalse',
      explanation: '`a` and `b` are two objects, so `==` is False and the default Equals (reference identity) is also False. `c` is another name for the object `a` refers to, so `a == c` is True. Only an Equals override would make `a.Equals(b)` True.',
    },
    {
      kind: 'predict',
      prompt: 'A method is added to the immutable `Entry` from the example. What happens when the file is compiled and run?',
      code: { language: 'csharp', source: 'public void Clear()\n{\n    _amount = 0;\n}' },
      choices: ['a compile error: a readonly field cannot be assigned here', 'Clear() sets Amount to 0 when called', 'a runtime exception when Clear() is called', 'Clear() compiles but does nothing'],
      answer: 'a compile error: a readonly field cannot be assigned here',
      explanation: '`readonly` fields may be assigned only in the declaration or a constructor. The compiler rejects the assignment in `Clear` before the program ever runs, which is exactly the guarantee immutability gives you.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the `Equals` override inside `Entry` (first line indented 4 spaces): convert, reject null, compare both properties.',
      language: 'csharp',
      indentation: true,
      solution: ['    public override bool Equals(object obj)', '    {', '        Entry other = obj as Entry;', '        if (other == null)', '        {', '            return false;', '        }', '        return Amount == other.Amount && Category == other.Category;', '    }'],
      distractors: ['    public bool Equals(Entry other)', '        return this == other;'],
      explanation: 'Without `override` and the `object` parameter you write a second, unrelated Equals that collections never call. Returning `this == other` compares references, which is the behaviour you were trying to replace.',
    },
    {
      kind: 'modify',
      prompt: 'Two entries typed identically print `Same: False`. Make `Entry` immutable (getter-only properties) and override `Equals` and `GetHashCode` so entries with the same amount and category are equal.',
      language: 'csharp',
      starter: `using System;

class Entry
{
    public int Amount { get; set; }
    public string Category { get; set; }

    public Entry(int amount, string category)
    {
        Amount = amount;
        Category = category;
    }
}

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Amount?");
        int amount1 = int.Parse(Console.ReadLine());
        Console.WriteLine("Category?");
        string category1 = Console.ReadLine();
        Console.WriteLine("Amount?");
        int amount2 = int.Parse(Console.ReadLine());
        Console.WriteLine("Category?");
        string category2 = Console.ReadLine();
        var a = new Entry(amount1, category1);
        var b = new Entry(amount2, category2);
        Console.WriteLine($"Same: {a.Equals(b)}");
    }
}
`,
      tests: [
        { description: 'identical entries', stdin: '-30\nfood\n-30\nfood', expectedStdout: 'Amount?\nCategory?\nAmount?\nCategory?\nSame: True' },
        { description: 'same amount, different category', stdin: '-30\nfood\n-30\nrent', expectedStdout: 'Amount?\nCategory?\nAmount?\nCategory?\nSame: False' },
        { description: 'different amount', stdin: '10\nfood\n-10\nfood', expectedStdout: 'Amount?\nCategory?\nAmount?\nCategory?\nSame: False' },
      ],
      hint: 'Drop the `set;` from both properties. Copy the Equals shape from the concept step, and return `Amount * 31 + Category.GetHashCode()` from GetHashCode.',
      solution: `using System;

class Entry
{
    public int Amount { get; }
    public string Category { get; }

    public Entry(int amount, string category)
    {
        Amount = amount;
        Category = category;
    }

    public override bool Equals(object obj)
    {
        Entry other = obj as Entry;
        if (other == null)
        {
            return false;
        }
        return Amount == other.Amount && Category == other.Category;
    }

    public override int GetHashCode()
    {
        return Amount * 31 + Category.GetHashCode();
    }
}

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Amount?");
        int amount1 = int.Parse(Console.ReadLine());
        Console.WriteLine("Category?");
        string category1 = Console.ReadLine();
        Console.WriteLine("Amount?");
        int amount2 = int.Parse(Console.ReadLine());
        Console.WriteLine("Category?");
        string category2 = Console.ReadLine();
        var a = new Entry(amount1, category1);
        var b = new Entry(amount2, category2);
        Console.WriteLine($"Same: {a.Equals(b)}");
    }
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write an immutable `Entry` (getter-only `Amount` and `Category`, constructor, `Equals` and `GetHashCode` by content). In `Main`, repeat `Amount (or quit)?` and, for each amount, `Category?`. Keep the previous entry in a variable that starts as `null`. For each new entry print `Repeat` if it equals the previous entry, otherwise `New`. After `quit` print `Entries: <count>`.',
      language: 'csharp',
      tests: [
        { description: 'a repeat in the middle', stdin: '-30\nfood\n-30\nfood\n50\nsalary\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nNew\nAmount (or quit)?\nCategory?\nRepeat\nAmount (or quit)?\nCategory?\nNew\nAmount (or quit)?\nEntries: 3' },
        { description: 'quit at once', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nEntries: 0' },
        { description: 'same category, different amounts', stdin: '5\na\n6\na\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nNew\nAmount (or quit)?\nCategory?\nNew\nAmount (or quit)?\nEntries: 2' },
      ],
      hint: '`Entry previous = null;` before the loop. `current.Equals(previous)` is safe when previous is null because `as` yields null and the override returns false.',
      solution: `using System;

class Entry
{
    public int Amount { get; }
    public string Category { get; }

    public Entry(int amount, string category)
    {
        Amount = amount;
        Category = category;
    }

    public override bool Equals(object obj)
    {
        Entry other = obj as Entry;
        if (other == null)
        {
            return false;
        }
        return Amount == other.Amount && Category == other.Category;
    }

    public override int GetHashCode()
    {
        return Amount * 31 + Category.GetHashCode();
    }
}

class Program
{
    static void Main(string[] args)
    {
        Entry previous = null;
        int count = 0;
        Console.WriteLine("Amount (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            int amount = int.Parse(line);
            Console.WriteLine("Category?");
            string category = Console.ReadLine();
            var current = new Entry(amount, category);
            if (current.Equals(previous))
            {
                Console.WriteLine("Repeat");
            }
            else
            {
                Console.WriteLine("New");
            }
            previous = current;
            count = count + 1;
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }
        Console.WriteLine($"Entries: {count}");
    }
}
`,
      projectNote: 'LedgerSharp\'s Entry is immutable from here on: once recorded, a movement never changes. Content equality is what the self-tests in Module 6 will rely on.',
    },
  ],
};

const l34: Lesson = {
  id: 'cs-3-4',
  title: 'An object that owns other objects',
  objective: 'Compose a Ledger class around a List of entries, with a computed Balance property and a ByCategory method that builds a dictionary.',
  minutes: 22,
  lexicon: [
    { id: 'cs.3.list-min', term: 'List<Entry>', kind: 'builtin', meaning: 'A growable list whose items are all of one declared type. `new List<Entry>()` is empty; `Add` appends; `Count` is the number of items; `foreach` visits them in order. Module 4 covers the rest.', example: 'var entries = new List<Entry>();\nentries.Add(new Entry(-30, "food"));\nConsole.WriteLine(entries.Count);' },
    { id: 'cs.3.computed-property', term: 'public int Balance { get { ... } }', kind: 'pattern', meaning: 'A property whose getter runs code, here a loop over the entries, every time it is read. Nothing is stored, so it can never go stale.', example: 'public int Balance\n{\n    get\n    {\n        int total = Starting;\n        foreach (Entry e in _entries)\n        {\n            total = total + e.Amount;\n        }\n        return total;\n    }\n}' },
    { id: 'cs.3.dictionary-min', term: 'Dictionary<string, int>', kind: 'builtin', meaning: 'Key to value lookup with declared types. `totals[key]` reads or writes; reading a missing key throws, so check `ContainsKey` first. Iteration order is not alphabetical.', example: 'var totals = new Dictionary<string, int>();\nif (!totals.ContainsKey("food"))\n{\n    totals["food"] = 0;\n}\ntotals["food"] = totals["food"] + -30;' },
    { id: 'cs.3.sorteddictionary', term: 'new SortedDictionary<string, int>(d)', kind: 'builtin', meaning: 'A copy of a dictionary that iterates its keys in sorted order. The way to print per-key output that is identical on every run.', example: 'foreach (KeyValuePair<string, int> pair in new SortedDictionary<string, int>(totals))\n{\n    Console.WriteLine($"{pair.Key}: {pair.Value}");\n}' },
    { id: 'cs.3.composition', term: 'composition (has-a)', kind: 'concept', meaning: 'Building a class out of other objects it owns: a Ledger has a list of Entry objects. Callers talk to the Ledger (Add, Balance, ByCategory) and never touch the list directly.', example: 'ledger.Add(new Entry(-30, "food"));\nConsole.WriteLine(ledger.Balance);', analogy: 'A folder that holds forms: you hand a form to the clerk, you do not open the folder. It breaks because the Ledger can also answer questions the forms alone cannot, like the balance.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A ledger has entries',
      body: `Python's Ledger v0.7 was a class owning a list and a starting balance. Here it is in C#. The list is \`private readonly List<Entry>\`: the reference never changes, the contents grow through \`Add\`. \`Balance\` is a **computed property**: its getter loops over the entries every time, so it is never stale. \`Count\` exposes the list's length without exposing the list.

\`ByCategory()\` builds a \`Dictionary<string, int>\`. Reading a key that is not there throws, so the accumulate pattern first checks \`ContainsKey\` and seeds a zero. A dictionary does not iterate alphabetically; when printing, copy it into a \`SortedDictionary\` so the output is the same on every run.

Module 4 gives List and Dictionary their full treatment. Here you need only Add, Count, foreach, ContainsKey and the indexer.`,
      example: {
        language: 'csharp',
        source: `using System;
using System.Collections.Generic;

class Entry
{
    public int Amount { get; }
    public string Category { get; }

    public Entry(int amount, string category)
    {
        Amount = amount;
        Category = category;
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
        get
        {
            int total = Starting;
            foreach (Entry e in _entries)
            {
                total = total + e.Amount;
            }
            return total;
        }
    }

    public Dictionary<string, int> ByCategory()
    {
        var totals = new Dictionary<string, int>();
        foreach (Entry e in _entries)
        {
            if (!totals.ContainsKey(e.Category))
            {
                totals[e.Category] = 0;
            }
            totals[e.Category] = totals[e.Category] + e.Amount;
        }
        return totals;
    }
}

class Program
{
    static void Main(string[] args)
    {
        var ledger = new Ledger(100);
        ledger.Add(new Entry(-30, "food"));
        ledger.Add(new Entry(50, "salary"));
        ledger.Add(new Entry(-10, "food"));
        Console.WriteLine(ledger.Balance);
        var sorted = new SortedDictionary<string, int>(ledger.ByCategory());
        foreach (KeyValuePair<string, int> pair in sorted)
        {
            Console.WriteLine($"{pair.Key}: {pair.Value}");
        }
    }
}`,
        labels: [
          { lines: [2, 2], label: 'List, Dictionary and SortedDictionary live in this namespace.' },
          { lines: [4, 14], label: 'The immutable Entry from the previous lesson.' },
          { lines: [18, 19], label: 'Ledger state: a private list it owns, and the starting balance.' },
          { lines: [26, 29], label: 'Command: record an entry by appending to the list.' },
          { lines: [31, 34], label: 'Query: how many entries, without handing out the list.' },
          { lines: [36, 47], label: 'Computed property: starting plus every amount, recomputed on each read.' },
          { lines: [49, 61], label: 'Totals per category: seed a missing key with 0, then accumulate.' },
          { lines: [67, 71], label: 'Build a ledger and ask it; prints 110.' },
          { lines: [72, 76], label: 'Sort the keys before printing: `food: -40` then `salary: 50`.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`self.entries = []` becomes a typed `List<Entry>`; `append` is `Add`; `len(xs)` is `xs.Count`. The accumulate idiom `d[k] = d.get(k, 0) + x` needs a `ContainsKey` check here because `totals[k]` on a missing key throws instead of returning a default. `sorted(d)` becomes a SortedDictionary copy.' },
        { from: 'c', note: 'In the Vault you grew an array with realloc and tracked its length yourself. `List<T>` does both; `Count` is always right. There is no free() when the Ledger goes away: the garbage collector reclaims the list and every Entry it referenced.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Using `Entry` and `Ledger` exactly as defined in the example, what does this `Main` print?',
      code: { language: 'csharp', source: 'var ledger = new Ledger(100);\nledger.Add(new Entry(-30, "food"));\nledger.Add(new Entry(-10, "food"));\nledger.Add(new Entry(50, "salary"));\nConsole.WriteLine(ledger.Balance);\nConsole.WriteLine(ledger.ByCategory()["food"]);\nConsole.WriteLine(ledger.Count);' },
      choices: ['110\n-40\n3', '10\n-40\n3', '110\n-30\n2', '110\n-40\n4'],
      answer: '110\n-40\n3',
      explanation: '`Balance` is recomputed when read: 100 - 30 - 10 + 50 = 110. `ByCategory` accumulates the two food entries to -40. The starting balance is not an entry, so `Count` is 3.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the `Balance` property inside `Ledger` (first line indented 4 spaces). It starts from `Starting` and adds every entry\'s amount.',
      language: 'csharp',
      indentation: true,
      solution: ['    public int Balance', '    {', '        get', '        {', '            int total = Starting;', '            foreach (Entry e in _entries)', '            {', '                total = total + e.Amount;', '            }', '            return total;', '        }', '    }'],
      distractors: ['            int total = 0;', '            for (Entry e in _entries)'],
      explanation: 'The balance includes the starting amount, so the total begins at `Starting`, not 0. C# spells the per-item loop `foreach (Type name in collection)`; `for` is the counted loop.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete `ByCategory` so it totals amounts per category without throwing on the first occurrence of a key.',
      language: 'csharp',
      template: '    public Dictionary<string, int> ByCategory()\n    {\n        var totals = new {{make}}();\n        foreach (Entry e in _entries)\n        {\n            if (!totals.{{has}}(e.Category))\n            {\n                totals[e.Category] = 0;\n            }\n            totals[e.Category] = totals[e.Category] + {{amt}};\n        }\n        return totals;\n    }',
      blanks: [
        { id: 'make', answers: ['Dictionary<string, int>', 'Dictionary<string,int>'], hint: 'the same type the method returns' },
        { id: 'has', answers: ['ContainsKey'], hint: 'the question to ask before reading a key' },
        { id: 'amt', answers: ['e.Amount'], hint: 'the number stored on the entry being visited' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The report is wrong twice: a category seen twice shows only its last amount, and categories print in the order they were typed. Fix `ByCategory` to accumulate, and print the categories sorted by name.',
      language: 'csharp',
      starter: `using System;
using System.Collections.Generic;

class Entry
{
    public int Amount { get; }
    public string Category { get; }

    public Entry(int amount, string category)
    {
        Amount = amount;
        Category = category;
    }
}

class Ledger
{
    private readonly List<Entry> _entries = new List<Entry>();

    public void Add(Entry entry)
    {
        _entries.Add(entry);
    }

    public int Count
    {
        get { return _entries.Count; }
    }

    public Dictionary<string, int> ByCategory()
    {
        var totals = new Dictionary<string, int>();
        foreach (Entry e in _entries)
        {
            totals[e.Category] = e.Amount;
        }
        return totals;
    }
}

class Program
{
    static void Main(string[] args)
    {
        var ledger = new Ledger();
        Console.WriteLine("Amount (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            int amount = int.Parse(line);
            Console.WriteLine("Category?");
            string category = Console.ReadLine();
            ledger.Add(new Entry(amount, category));
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }
        foreach (KeyValuePair<string, int> pair in ledger.ByCategory())
        {
            Console.WriteLine($"{pair.Key}: {pair.Value}");
        }
        Console.WriteLine($"Entries: {ledger.Count}");
    }
}
`,
      tests: [
        { description: 'food twice', stdin: '-30\nfood\n50\nsalary\n-10\nfood\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nfood: -40\nsalary: 50\nEntries: 3' },
        { description: 'categories typed out of order', stdin: '10\nzoo\n-5\napple\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\napple: -5\nzoo: 10\nEntries: 2' },
      ],
      hint: 'Seed with `ContainsKey` and add instead of assigning. Wrap the result in `new SortedDictionary<string, int>(...)` before the foreach.',
      solution: `using System;
using System.Collections.Generic;

class Entry
{
    public int Amount { get; }
    public string Category { get; }

    public Entry(int amount, string category)
    {
        Amount = amount;
        Category = category;
    }
}

class Ledger
{
    private readonly List<Entry> _entries = new List<Entry>();

    public void Add(Entry entry)
    {
        _entries.Add(entry);
    }

    public int Count
    {
        get { return _entries.Count; }
    }

    public Dictionary<string, int> ByCategory()
    {
        var totals = new Dictionary<string, int>();
        foreach (Entry e in _entries)
        {
            if (!totals.ContainsKey(e.Category))
            {
                totals[e.Category] = 0;
            }
            totals[e.Category] = totals[e.Category] + e.Amount;
        }
        return totals;
    }
}

class Program
{
    static void Main(string[] args)
    {
        var ledger = new Ledger();
        Console.WriteLine("Amount (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            int amount = int.Parse(line);
            Console.WriteLine("Category?");
            string category = Console.ReadLine();
            ledger.Add(new Entry(amount, category));
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }
        var sorted = new SortedDictionary<string, int>(ledger.ByCategory());
        foreach (KeyValuePair<string, int> pair in sorted)
        {
            Console.WriteLine($"{pair.Key}: {pair.Value}");
        }
        Console.WriteLine($"Entries: {ledger.Count}");
    }
}
`,
    },
    {
      kind: 'create',
      prompt: 'Write `Entry` (immutable) and `Ledger` with a constructor `Ledger(int starting)`, `Add`, `Count`, a computed `Balance` and `ByCategory()`. In `Main` create `new Ledger(0)`, then repeat `Amount (or quit)?` and `Category?`, adding an entry each time. After `quit` print one `<category>: <total>` line per category sorted by name, then `Entries: <count>` and `Total: <balance>`.',
      language: 'csharp',
      tests: [
        { description: 'three entries, one category repeated', stdin: '-30\nfood\n50\nsalary\n-10\nfood\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nfood: -40\nsalary: 50\nEntries: 3\nTotal: 10' },
        { description: 'quit at once', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nEntries: 0\nTotal: 0' },
        { description: 'out of order categories', stdin: '10\nzoo\n-5\napple\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\napple: -5\nzoo: 10\nEntries: 2\nTotal: 5' },
      ],
      hint: 'The two classes are in the concept step. Main is the sentinel loop from the previous lessons followed by the sorted report.',
      solution: `using System;
using System.Collections.Generic;

class Entry
{
    public int Amount { get; }
    public string Category { get; }

    public Entry(int amount, string category)
    {
        Amount = amount;
        Category = category;
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
        get
        {
            int total = Starting;
            foreach (Entry e in _entries)
            {
                total = total + e.Amount;
            }
            return total;
        }
    }

    public Dictionary<string, int> ByCategory()
    {
        var totals = new Dictionary<string, int>();
        foreach (Entry e in _entries)
        {
            if (!totals.ContainsKey(e.Category))
            {
                totals[e.Category] = 0;
            }
            totals[e.Category] = totals[e.Category] + e.Amount;
        }
        return totals;
    }
}

class Program
{
    static void Main(string[] args)
    {
        var ledger = new Ledger(0);
        Console.WriteLine("Amount (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            int amount = int.Parse(line);
            Console.WriteLine("Category?");
            string category = Console.ReadLine();
            ledger.Add(new Entry(amount, category));
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }
        var sorted = new SortedDictionary<string, int>(ledger.ByCategory());
        foreach (KeyValuePair<string, int> pair in sorted)
        {
            Console.WriteLine($"{pair.Key}: {pair.Value}");
        }
        Console.WriteLine($"Entries: {ledger.Count}");
        Console.WriteLine($"Total: {ledger.Balance}");
    }
}
`,
      projectNote: 'This is the Ledger of LedgerSharp v0.3. The project lesson adds the starting balance prompt, the running balance line and the summary header around it.',
    },
  ],
};

const l35: Lesson = {
  id: 'cs-3-5',
  title: 'Project: LedgerSharp v0.3',
  objective: 'Rebuild the Python v0.4 ledger conversation in C# with an Entry class and a Ledger class that owns the entries.',
  minutes: 22,
  lexicon: [
    { id: 'cs.3.define-then-act', term: 'classes define, Main acts', kind: 'pattern', meaning: 'Classes above Program only declare what objects can do; nothing runs until Main. Main holds the conversation with the user and asks the objects for answers instead of recomputing them.', example: 'class Entry { ... }\nclass Ledger { ... }\nclass Program\n{\n    static void Main(string[] args) { ... }\n}' },
    { id: 'cs.3.collect-report', term: 'collect, then report', kind: 'pattern', meaning: 'Add entries to the Ledger while the input loop runs; print the summary only after the loop ends, from the Ledger\'s queries. Reading and reporting never mix.', example: 'while (line != "quit")\n{\n    ledger.Add(new Entry(amount, category));\n    ...\n}\nConsole.WriteLine("--- summary ---");' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The same conversation, now with objects',
      body: `LedgerSharp v0.3 prints exactly what the Python Ledger v0.4 printed. The inside is this module: an immutable \`Entry\`, a \`Ledger\` that owns a list of them, and a \`Main\` that only talks to the user and to the ledger. \`Main\` never loops over entries itself: it asks \`ledger.Balance\`, \`ledger.Count\` and \`ledger.ByCategory()\`.

The transcript is a contract: \`Balance?\` once, then \`Amount (or quit)?\` before every amount and \`Category?\` after each amount (not after quit). After each entry \`Balance: <running>\`. After quit the header \`--- summary ---\`, one \`<category>: <total>\` line per category sorted by name, then \`Entries: <k>\` and \`Final balance: <n>\`.

Read the labels as the plan: define the two classes, collect during the loop, report after it.`,
      example: {
        language: 'csharp',
        source: LEDGER_V03.trimEnd(),
        labels: [
          { lines: [4, 14], label: 'Entry: one immutable record with two typed properties.' },
          { lines: [16, 24], label: 'Ledger state: the private list it owns and the starting balance.' },
          { lines: [26, 34], label: 'Command Add and query Count.' },
          { lines: [36, 47], label: 'Balance as a computed property: starting plus every amount.' },
          { lines: [49, 61], label: 'Totals per category with the ContainsKey-then-accumulate pattern.' },
          { lines: [68, 70], label: 'Ask the starting balance and build the ledger with it.' },
          { lines: [71, 72], label: 'Ask for the first amount before the loop so the sentinel can be checked.' },
          { lines: [73, 82], label: 'Each round: parse, ask the category, add the entry, report the running balance, ask again.' },
          { lines: [83, 88], label: 'Summary header and one sorted line per category.' },
          { lines: [89, 90], label: 'Footer: both numbers come from the ledger, not from counters in Main.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Line for line this is Python Ledger v0.7\'s structure (Entry, Ledger with add/balance/by_category, a main) producing v0.4\'s transcript. `int(input())` became `int.Parse(Console.ReadLine())`; the `(amount, category)` tuple became an Entry object; `sorted(totals)` became a SortedDictionary copy.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The user types `50`, `-20`, `rent`, `quit`. Which lines are printed after the last `Amount (or quit)?`?',
      code: { language: 'csharp', source: LEDGER_V03.trimEnd() },
      choices: ['--- summary ---\nrent: -20\nEntries: 1\nFinal balance: 30', '--- summary ---\nrent: -20\nEntries: 2\nFinal balance: 30', 'Category?\n--- summary ---\nrent: -20\nEntries: 1\nFinal balance: 30', '--- summary ---\nrent: 30\nEntries: 1\nFinal balance: 30'],
      answer: '--- summary ---\nrent: -20\nEntries: 1\nFinal balance: 30',
      explanation: 'One Entry was added (-20, rent). `quit` ends the loop before `Category?` is asked and is not an entry, so `ledger.Count` is 1. The summary shows the total per category (-20), not the balance; `Balance` is 50 - 20 = 30 and appears only in the footer.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the report that runs after the loop (inside Main, first line indented 8 spaces). `ledger` already holds the entries.',
      language: 'csharp',
      indentation: true,
      solution: ['        Console.WriteLine("--- summary ---");', '        var sorted = new SortedDictionary<string, int>(ledger.ByCategory());', '        foreach (KeyValuePair<string, int> pair in sorted)', '        {', '            Console.WriteLine($"{pair.Key}: {pair.Value}");', '        }', '        Console.WriteLine($"Entries: {ledger.Count}");', '        Console.WriteLine($"Final balance: {ledger.Balance}");'],
      distractors: ['        foreach (KeyValuePair<string, int> pair in ledger.ByCategory())', '        Console.WriteLine($"Entries: {sorted.Count}");'],
      explanation: 'Iterating the Dictionary directly gives insertion order; the contract wants names sorted. `sorted.Count` is the number of categories, but `Entries:` counts the records, which the Ledger knows.',
    },
    {
      kind: 'create',
      prompt: `Write LedgerSharp v0.3. Define \`Entry\` (getter-only \`Amount\` and \`Category\`, constructor) and \`Ledger\` (constructor \`Ledger(int starting)\`, \`Add\`, \`Count\`, computed \`Balance\`, \`ByCategory()\` returning a \`Dictionary<string, int>\`). Behaviour:

- Print \`Balance?\` and read the starting balance.
- Repeat \`Amount (or quit)?\`. On \`quit\` stop. Otherwise print \`Category?\`, read it, add the entry and print \`Balance: <running>\`.
- After quit print \`--- summary ---\`, one \`<category>: <total>\` line per category sorted by name, then \`Entries: <count>\` and \`Final balance: <n>\`.`,
      language: 'csharp',
      tests: [
        { description: 'quit immediately', stdin: '100\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\n--- summary ---\nEntries: 0\nFinal balance: 100' },
        { description: 'documented example', stdin: '100\n-30\nfood\n50\nsalary\n-10\nfood\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: 70\nAmount (or quit)?\nCategory?\nBalance: 120\nAmount (or quit)?\nCategory?\nBalance: 110\nAmount (or quit)?\n--- summary ---\nfood: -40\nsalary: 50\nEntries: 3\nFinal balance: 110' },
        { description: 'one category only', stdin: '20\n-5\nfood\n-15\nfood\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: 15\nAmount (or quit)?\nCategory?\nBalance: 0\nAmount (or quit)?\n--- summary ---\nfood: -20\nEntries: 2\nFinal balance: 0' },
        { description: 'categories entered out of alphabetical order', stdin: '0\n10\nzoo\n-5\napple\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: 10\nAmount (or quit)?\nCategory?\nBalance: 5\nAmount (or quit)?\n--- summary ---\napple: -5\nzoo: 10\nEntries: 2\nFinal balance: 5' },
        { description: 'negative starting balance', stdin: '-50\n30\nsalary\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nCategory?\nBalance: -20\nAmount (or quit)?\n--- summary ---\nsalary: 30\nEntries: 1\nFinal balance: -20' },
      ],
      hint: 'Start from the labels in the concept step: the two classes from lesson 4, then Main as the v0.2 loop plus `Category?` and `ledger.Add`, then the sorted report. Run the tests after each chunk.',
      solution: LEDGER_V03,
      projectNote: 'LedgerSharp v0.3 complete: the Python ledger\'s conversation, now produced by an Entry class and a Ledger that owns its entries. Module 4 replaces the loops inside Ledger with LINQ queries and adds the `top` command.',
    },
  ],
};

export const m3: Module = {
  id: 'cs-m3',
  title: 'Classes and objects',
  goal: 'Classes, properties, constructors, encapsulation, immutability and value equality, composition, reference vs value semantics.',
  projectMilestone: 'LedgerSharp v0.3: Entry record and Ledger class.',
  status: 'available',
  lessons: [l31, l32, l33, l34, l35],
};
