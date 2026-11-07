import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 7: Structure                                                */
/* ------------------------------------------------------------------ */

/** Ledger v0.7, exactly as tested in py-7-5 and shown labelled in its concept step. */
const LEDGER_V07 = `import json
from dataclasses import dataclass, asdict


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
        total = self.starting
        for e in self.entries:
            total = total + e.amount
        return total

    def by_category(self):
        totals = {}
        for e in self.entries:
            totals[e.category] = totals.get(e.category, 0) + e.amount
        return totals

    def save(self, path):
        rows = []
        for e in self.entries:
            rows.append(asdict(e))
        with open(path, "w") as f:
            json.dump(rows, f)

    @classmethod
    def load(cls, path, starting=0):
        ledger = cls(starting)
        try:
            with open(path) as f:
                rows = json.load(f)
        except FileNotFoundError:
            rows = []
        for row in rows:
            ledger.add(Entry(row["amount"], row["category"]))
        return ledger


def main():
    ledger = Ledger.load("ledger.json")
    print(f"Loaded {len(ledger.entries)} entries")
    print("Balance?")
    ledger.starting = int(input())
    while True:
        print("Amount (or quit)?")
        text = input()
        if text == "quit":
            break
        try:
            amount = int(text)
        except ValueError:
            print("Not a number, try again")
            continue
        print("Category?")
        category = input()
        ledger.add(Entry(amount, category))
        print(f"Balance: {ledger.balance}")
    ledger.save("ledger.json")
    print(f"Saved {len(ledger.entries)} entries")
    print("--- summary ---")
    for category, total in sorted(ledger.by_category().items()):
        print(f"{category}: {total}")
    print(f"Entries: {len(ledger.entries)}")
    print(f"Final balance: {ledger.balance}")


main()
`;

const l71: Lesson = {
  id: 'py-7-1',
  title: 'Borrowing words: import',
  objective: 'Use code from other files and from the standard library with import.',
  minutes: 16,
  lexicon: [
    { id: 'py.7.module', term: 'module', kind: 'concept', meaning: 'A file of Python code. Importing it runs the file once, top to bottom, and makes the names it defined available. The standard library is a few hundred modules that ship with Python.', example: '# money.py defines apply(); main.py says:\nimport money\nprint(money.apply(100, -30))', analogy: 'A dictionary you take off the shelf: you look words up in it rather than memorising them. It breaks in one way: opening a Python module runs its code, while opening a dictionary does nothing.' },
    { id: 'py.7.import', term: 'import name', kind: 'keyword', meaning: 'Load a module and bind its name. Everything inside is reached through the prefix: `math.sqrt`, never bare `sqrt`.', example: 'import math\nprint(math.floor(2.7))' },
    { id: 'py.7.from-import', term: 'from module import name', kind: 'keyword', meaning: 'Load a module but bind only the named thing, so you use it bare. The module name itself is not bound.', example: 'from collections import Counter\nprint(Counter(["a", "b", "a"])["a"])' },
    { id: 'py.7.import-as', term: 'import module as alias', kind: 'keyword', meaning: 'Load a module under a shorter name of your choosing. Only the alias is bound.', example: 'import statistics as stats\nprint(stats.mean([2, 4, 6]))' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Vocabulary you look up',
      body: `Everything you have used so far was either built in (\`print\`, \`len\`, \`int\`) or written by you. The third source is **modules**: files of Python code that someone already wrote. Python ships with a few hundred of them, the **standard library**. You do not memorise it; you learn that it exists and look things up.

\`import math\` runs the file \`math\` once and binds the name \`math\`. Everything inside is reached with a dot: \`math.floor\`. \`from collections import Counter\` binds only \`Counter\`, so you use it bare. \`import statistics as stats\` binds the shorter alias instead.

Three modules worth knowing today: \`statistics\` (averages), \`collections\` (\`Counter\`, a dict that counts), \`pathlib\` (\`Path\`, questions about files). Module 6's \`json\` was one too.`,
      example: {
        language: 'python',
        source: 'import math\nimport statistics as stats\nfrom collections import Counter\nfrom pathlib import Path\n\namounts = [-30, 50, -10, -30]\ncategories = ["food", "salary", "food", "rent"]\nprint(math.floor(2.7))\nprint(stats.mean(amounts))\nprint(Counter(categories))\nprint(Path("ledger.json").exists())',
        labels: [
          { lines: [1, 1], label: 'Load the whole module; every name inside needs the prefix math.' },
          { lines: [2, 2], label: 'Load under a shorter alias; only stats is bound.' },
          { lines: [3, 4], label: 'Borrow one name each; use them bare.' },
          { lines: [6, 7], label: 'Some ledger data.' },
          { lines: [8, 8], label: '2: floor rounds down.' },
          { lines: [9, 9], label: '-5: the mean of the amounts.' },
          { lines: [10, 10], label: "Counter({'food': 2, 'salary': 1, 'rent': 1}): a dict of item -> count, shown most common first." },
          { lines: [11, 11], label: 'False: no such file in the working folder.' },
        ],
      },
    },
    {
      kind: 'concept',
      title: 'Your own modules (and why this app runs one file)',
      body: `Your files are modules too. Save functions in \`money.py\`, and a \`main.py\` in the same folder can \`from money import apply\`. Python finds the file by its name, runs it once, top to bottom, and hands over the names you asked for. That is why a module should **define** things, not **do** things: any \`print\` at its top level fires during the import.

The runner inside this app executes a single file, so your project stays in one file here. In a real project Ledger v0.7 would be three files:

- \`entry.py\` holds \`class Entry\`
- \`ledger.py\` starts with \`from entry import Entry\` and holds \`class Ledger\`
- \`main.py\` starts with \`from ledger import Entry, Ledger\` and holds the conversation with the user

Same code, different files. The import lines are the only glue.`,
      example: {
        language: 'python',
        source: '# --- money.py: definitions only ---\ndef apply(balance, amount):\n    return balance + amount\n\ndef is_expense(amount):\n    return amount < 0\n\n# --- main.py: the file you run ---\nfrom money import apply, is_expense\n\nprint(apply(100, -30))\nprint(is_expense(-30))',
        labels: [
          { lines: [1, 6], label: 'A module: a plain file next to main.py. It defines and does not act.' },
          { lines: [8, 9], label: 'Python runs money.py once and binds the two names here.' },
          { lines: [11, 12], label: 'Used as if they were defined in this file: 70, then True.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What happens when this runs?',
      code: { language: 'python', source: 'import math\nfrom collections import Counter\n\ncounts = Counter(["food", "rent", "food"])\nprint(counts["food"])\nprint(sqrt(16))' },
      choices: ['2, then an error', '2\n4.0', '2\n4', 'an error before anything is printed'],
      answer: '2, then an error',
      explanation: '`import math` binds only the name `math`, so bare `sqrt` is undefined and line 6 raises a NameError. Line 5 has already run by then and printed 2. Either `math.sqrt(16)` or `from math import sqrt` would fix it.',
    },
    {
      kind: 'parsons',
      prompt: 'Count a list of categories with `Counter`. Print how many times `food` appears, then how many distinct categories there are.',
      language: 'python',
      indentation: false,
      solution: ['from collections import Counter', 'categories = ["food", "salary", "food"]', 'counts = Counter(categories)', 'print(counts["food"])', 'print(len(counts))'],
      distractors: ['import Counter from collections', 'counts = collections.Counter(categories)'],
      explanation: 'Python says `from` first, then `import`. After `from collections import Counter` the name `collections` is not bound, so `collections.Counter` would be a NameError.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the imports so the program prints `5` and then `2`.',
      language: 'python',
      template: '{{kw}} statistics {{alias}} stats\nfrom collections {{imp}} Counter\n\nprint(stats.median([5, 1, 9]))\nprint(Counter(["a", "b", "a"])["a"])',
      blanks: [
        { id: 'kw', answers: ['import'] },
        { id: 'alias', answers: ['as'], hint: 'the word that gives a module a nickname' },
        { id: 'imp', answers: ['import'] },
      ],
    },
    {
      kind: 'modify',
      prompt: 'This program crashes with a NameError. Fix only the import lines (add or change them) so it prints `-5`, `3`, then `False` when no file is present. Do not change the three print lines.',
      language: 'python',
      starter: 'import statistics\nfrom collections import Counter\n\namounts = [-30, 50, -10, -30]\ncategories = ["food", "salary", "food", "food"]\nprint(mean(amounts))\nprint(Counter(categories)["food"])\nprint(Path("ledger.json").exists())\n',
      tests: [
        { description: 'no ledger.json', expectedStdout: '-5\n3\nFalse' },
        { description: 'ledger.json present', files: { 'ledger.json': '[]' }, expectedStdout: '-5\n3\nTrue' },
      ],
      hint: 'Bare `mean` needs `from statistics import mean`. `Path` lives in `pathlib` and is not imported at all yet.',
      solution: 'from statistics import mean\nfrom collections import Counter\nfrom pathlib import Path\n\namounts = [-30, 50, -10, -30]\ncategories = ["food", "salary", "food", "food"]\nprint(mean(amounts))\nprint(Counter(categories)["food"])\nprint(Path("ledger.json").exists())\n',
    },
    {
      kind: 'create',
      prompt: 'Read category names: print `Category (or quit)?`, read a line, repeat until the user types `quit`. Then, using `collections.Counter`, print one line per category in sorted order as `<name>: <count>`, and finally `Distinct: <number of different categories>`.',
      language: 'python',
      tests: [
        { description: 'food twice, rent once', stdin: 'food\nrent\nfood\nquit', expectedStdout: 'Category (or quit)?\nCategory (or quit)?\nCategory (or quit)?\nCategory (or quit)?\nfood: 2\nrent: 1\nDistinct: 2' },
        { description: 'quit at once', stdin: 'quit', expectedStdout: 'Category (or quit)?\nDistinct: 0' },
        { description: 'sorted output', stdin: 'rent\nfood\nquit', expectedStdout: 'Category (or quit)?\nCategory (or quit)?\nCategory (or quit)?\nfood: 1\nrent: 1\nDistinct: 2' },
      ],
      hint: 'Collect the names in a list, then `Counter(names)`. `sorted(counts.items())` gives (name, count) pairs in order; `len(counts)` is the number of distinct keys.',
      solution: 'from collections import Counter\n\ncategories = []\nwhile True:\n    print("Category (or quit)?")\n    text = input()\n    if text == "quit":\n        break\n    categories.append(text)\ncounts = Counter(categories)\nfor name, count in sorted(counts.items()):\n    print(f"{name}: {count}")\nprint(f"Distinct: {len(counts)}")\n',
      projectNote: 'The ledger stops reinventing tools: the standard library already counts, averages and checks files.',
    },
  ],
};

const l72: Lesson = {
  id: 'py-7-2',
  title: 'Blueprints: class and self',
  objective: 'Define a class and create instances that each keep their own state.',
  minutes: 20,
  lexicon: [
    { id: 'py.7.class', term: 'class Name:', kind: 'keyword', meaning: 'Define a new kind of value: a blueprint listing the methods every instance will share. Names are written CapitalCase.', example: 'class Account:\n    def __init__(self, owner):\n        self.owner = owner', analogy: 'A noun versus an individual: "account" is the class, Sam\'s account is an instance. The analogy breaks because in Python the class itself is also a value you can pass around and call.' },
    { id: 'py.7.instance', term: 'Name(...)', kind: 'pattern', meaning: 'Calling a class makes a new instance, runs `__init__` on it with the arguments, and gives the instance back.', example: 'sam = Account("Sam")\nana = Account("Ana")' },
    { id: 'py.7.init', term: 'def __init__(self, ...):', kind: 'pattern', meaning: 'The method Python runs on a freshly made instance. Its job is to create the starting attributes. Two underscores on each side.', example: 'def __init__(self, owner):\n    self.owner = owner\n    self.balance = 0' },
    { id: 'py.7.self', term: 'self', kind: 'concept', meaning: 'Inside a method, the instance being worked on. It is the first parameter of every method; Python fills it in when you write `obj.method(...)`.', example: 'def deposit(self, amount):\n    self.balance = self.balance + amount', analogy: '"Myself" in a recipe card that every account carries: "add the amount to my balance". It breaks because the word is not magic: `self` is an ordinary parameter name that convention, not grammar, fixes.' },
    { id: 'py.7.attribute', term: 'obj.name', kind: 'pattern', meaning: 'A value stored inside an instance. Assigning `self.x = ...` creates it; reading `obj.x` gets it back. Each instance has its own.', example: 'print(sam.balance)' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'One blueprint, many objects',
      body: `A dict can hold an account's data, but nothing stops a typo like \`acc["balanse"]\`, and the functions that work on it live somewhere else. A **class** bundles both: the data an object holds and the operations that belong to it.

Here is the machine model. An **instance** is a small box of named values, its **attributes**, plus a pointer to its class, where the **methods** live. Every instance has its own box; all instances share one set of methods.

\`class Account:\` starts the blueprint. Inside, \`def\` lines are methods. Their first parameter, \`self\`, is the instance being operated on. \`__init__\` runs when you call \`Account(...)\` and fills the new box. \`sam.deposit(50)\` is Python's spelling of \`Account.deposit(sam, 50)\`: the object before the dot becomes \`self\`.`,
      example: {
        language: 'python',
        source: 'class Account:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance = self.balance + amount\n\nsam = Account("Sam", 100)\nana = Account("Ana", 0)\nsam.deposit(50)\nprint(sam.owner, sam.balance)\nprint(ana.owner, ana.balance)',
        labels: [
          { lines: [1, 1], label: 'Start the blueprint. Everything indented under it belongs to the class.' },
          { lines: [2, 4], label: 'Fill the new instance: two attributes created on self.' },
          { lines: [6, 7], label: 'A method: changes the balance of whichever instance it was called on.' },
          { lines: [9, 10], label: 'Two instances, two separate boxes. __init__ ran twice.' },
          { lines: [11, 11], label: 'Same as Account.deposit(sam, 50). Only sam changes.' },
          { lines: [12, 13], label: 'Sam 150, then Ana 0.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'class Jar:\n    def __init__(self):\n        self.coins = 0\n\n    def put(self, n):\n        self.coins = self.coins + n\n\na = Jar()\nb = Jar()\na.put(3)\na.put(4)\nb.put(10)\nprint(a.coins, b.coins)' },
      choices: ['7 10', '17 17', '10 10', '7 7'],
      answer: '7 10',
      explanation: 'Each call to `Jar()` makes a separate instance with its own `coins` attribute. `a.put` only ever touches `a`\'s box (3 + 4 = 7); `b.put(10)` only touches `b`\'s. The method is shared, the data is not.',
    },
    {
      kind: 'parsons',
      prompt: 'Build a `Wallet` class: `__init__` stores `cash`, then a `spend` method subtracts an amount. Then make a wallet with 100, spend 30 and print the cash. Set the indentation yourself (`__init__` comes first, by convention).',
      language: 'python',
      indentation: true,
      solution: ['class Wallet:', '    def __init__(self, cash):', '        self.cash = cash', '    def spend(self, amount):', '        self.cash = self.cash - amount', 'w = Wallet(100)', 'w.spend(30)', 'print(w.cash)'],
      distractors: ['    def spend(amount):', '        cash = cash - amount', 'w.spend(w, 30)'],
      explanation: 'Every method takes `self` first, but you never pass it yourself: `w.spend(30)` fills it in. Inside the method, `cash` alone would be a new local name; the attribute is `self.cash`.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the class so the program prints `Sam` and then `0`.',
      language: 'python',
      template: 'class Account:\n    def {{init}}(self, owner):\n        {{s}}.owner = owner\n        self.balance = 0\n\nacc = Account("Sam")\nprint(acc.owner)\nprint(acc.balance)',
      blanks: [
        { id: 'init', answers: ['__init__'], hint: 'the method that runs on a new instance; two underscores each side' },
        { id: 's', answers: ['self'], hint: 'the instance being filled in' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The deposit is lost: `deposit` computes the new balance but stores it in a local name. Fix it. Then add a `withdraw(self, amount)` method that subtracts, and after the deposit report add: print `Withdraw?`, read a whole number, call `withdraw`, and print `<owner>: <balance>` again.',
      language: 'python',
      starter: 'class Account:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        balance = self.balance + amount\n\nacc = Account("Sam", 100)\nprint("Deposit?")\nacc.deposit(int(input()))\nprint(f"{acc.owner}: {acc.balance}")\n',
      tests: [
        { description: 'deposit 50, withdraw 30', stdin: '50\n30', expectedStdout: 'Deposit?\nSam: 150\nWithdraw?\nSam: 120' },
        { description: 'zero and zero', stdin: '0\n0', expectedStdout: 'Deposit?\nSam: 100\nWithdraw?\nSam: 100' },
      ],
      hint: 'Inside a method, a bare name is local and vanishes when the method returns. The attribute is `self.balance`, on both sides of the `=`.',
      solution: 'class Account:\n    def __init__(self, owner, balance):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance = self.balance + amount\n\n    def withdraw(self, amount):\n        self.balance = self.balance - amount\n\nacc = Account("Sam", 100)\nprint("Deposit?")\nacc.deposit(int(input()))\nprint(f"{acc.owner}: {acc.balance}")\nprint("Withdraw?")\nacc.withdraw(int(input()))\nprint(f"{acc.owner}: {acc.balance}")\n',
    },
    {
      kind: 'create',
      prompt: 'Write a class `Account` with `__init__(self, owner)` that sets `owner` and a `balance` of 0, and a method `add(self, amount)` that changes the balance. Create two accounts, `Sam` and `Ana`, and keep them in a dict keyed by name. Then repeat: print `Name (or quit)?` and read a line; stop on `quit`; otherwise print `Amount?`, read a whole number and add it to that person\'s account. Finally print `Sam: <balance>` then `Ana: <balance>`.',
      language: 'python',
      tests: [
        { description: 'three movements', stdin: 'Sam\n100\nAna\n-20\nSam\n-30\nquit', expectedStdout: 'Name (or quit)?\nAmount?\nName (or quit)?\nAmount?\nName (or quit)?\nAmount?\nName (or quit)?\nSam: 70\nAna: -20' },
        { description: 'quit at once', stdin: 'quit', expectedStdout: 'Name (or quit)?\nSam: 0\nAna: 0' },
        { description: 'only Ana', stdin: 'Ana\n5\nAna\n5\nquit', expectedStdout: 'Name (or quit)?\nAmount?\nName (or quit)?\nAmount?\nName (or quit)?\nSam: 0\nAna: 10' },
      ],
      hint: '`accounts = {"Sam": Account("Sam"), "Ana": Account("Ana")}`, then `accounts[name].add(amount)`. Two instances, two separate balances.',
      solution: 'class Account:\n    def __init__(self, owner):\n        self.owner = owner\n        self.balance = 0\n\n    def add(self, amount):\n        self.balance = self.balance + amount\n\naccounts = {"Sam": Account("Sam"), "Ana": Account("Ana")}\nwhile True:\n    print("Name (or quit)?")\n    name = input()\n    if name == "quit":\n        break\n    print("Amount?")\n    amount = int(input())\n    accounts[name].add(amount)\nfor name in ["Sam", "Ana"]:\n    acc = accounts[name]\n    print(f"{acc.owner}: {acc.balance}")\n',
      projectNote: 'The ledger is about to become an object that owns its entries instead of a pile of loose names.',
    },
  ],
};

const l73: Lesson = {
  id: 'py-7-3',
  title: 'What an object can do',
  objective: 'Write methods that change state or answer questions, print objects readably, and build them in more than one way.',
  minutes: 20,
  lexicon: [
    { id: 'py.7.method', term: 'obj.method(...)', kind: 'pattern', meaning: 'Call a function that lives on the class with obj as self. Commands change the object and return nothing; queries return an answer and change nothing. Name them so the reader can tell.', example: 'acc.add(-30)        # command\nprint(acc.total())  # query' },
    { id: 'py.7.decorator', term: '@name', kind: 'punctuation', meaning: 'A line directly above a def that changes how the function is registered. You will use three ready-made ones: @property, @classmethod and @dataclass.', example: '@property\ndef balance(self):\n    return sum(self.history)', analogy: 'A stamp on a form that changes how the office files it. It breaks because a decorator can do anything to the function, not just file it differently.' },
    { id: 'py.7.repr', term: 'def __repr__(self):', kind: 'pattern', meaning: 'Return the string that print and the error messages show for this object. Without it you get `<Account object at 0x...>`. `__str__` is a friendlier variant; if only __repr__ exists, print uses it.', example: 'def __repr__(self):\n    return f"Account({self.owner}, {self.balance})"' },
    { id: 'py.7.property', term: '@property', kind: 'keyword', meaning: 'Make a no-argument query method readable like an attribute: `acc.balance`, no parentheses. The value is computed fresh every time it is read.', example: '@property\ndef balance(self):\n    return sum(self.history)\n\nprint(acc.balance)' },
    { id: 'py.7.classmethod', term: '@classmethod', kind: 'keyword', meaning: 'A method called on the class itself, receiving the class as `cls` instead of an instance. Used as an alternative way to build instances, for example from a file.', example: '@classmethod\ndef empty(cls):\n    return cls("nobody")\n\nacc = Account.empty()' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Commands, queries, and other ways in',
      body: `Methods come in two flavours. A **command** changes the object and returns nothing (\`add\`). A **query** returns an answer and leaves the object alone (\`balance\`). Mixing the two in one method makes code hard to trace, so keep them apart.

Three decorations round out a class. \`__repr__\` returns the text that \`print(obj)\` shows; without it you get an unhelpful \`<Account object at 0x...>\`. \`@property\` above a query lets you read it as \`acc.balance\` rather than \`acc.balance()\`: it looks like stored data but is computed each time. \`@classmethod\` gives a method the **class** as \`cls\` instead of an instance; it is the standard way to offer a second constructor, such as "build an account from a list" or, next week, "load a ledger from a file".`,
      example: {
        language: 'python',
        source: 'class Account:\n    def __init__(self, owner):\n        self.owner = owner\n        self.history = []\n\n    def add(self, amount):\n        self.history.append(amount)\n\n    @property\n    def balance(self):\n        return sum(self.history)\n\n    def __repr__(self):\n        return f"Account({self.owner}, {self.balance})"\n\n    @classmethod\n    def from_amounts(cls, owner, amounts):\n        acc = cls(owner)\n        for amount in amounts:\n            acc.add(amount)\n        return acc\n\nacc = Account.from_amounts("Sam", [100, -30])\nacc.add(-20)\nprint(acc.balance)\nprint(acc)',
        labels: [
          { lines: [2, 4], label: 'State: an owner and the list of amounts so far.' },
          { lines: [6, 7], label: 'A command: changes self, returns nothing.' },
          { lines: [9, 11], label: 'A query, read like an attribute: acc.balance, no parentheses.' },
          { lines: [13, 14], label: 'What print(acc) shows. Return the text; do not print it here.' },
          { lines: [16, 21], label: 'Alternative constructor: cls(owner) makes the instance, then it is filled.' },
          { lines: [23, 23], label: 'Called on the class, not on an instance.' },
          { lines: [24, 26], label: '50, then Account(Sam, 50).' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'class Jar:\n    def __init__(self):\n        self.coins = []\n\n    def put(self, n):\n        self.coins.append(n)\n\n    @property\n    def total(self):\n        return sum(self.coins)\n\n    def __repr__(self):\n        return f"Jar({self.total})"\n\nj = Jar()\nj.put(5)\nj.put(7)\nprint(j.total)\nprint(j)' },
      choices: ['12\nJar(12)', '[5, 7]\nJar(12)', '12\n<Jar object>', 'an error: total is not called with ()'],
      answer: '12\nJar(12)',
      explanation: 'A property is read without parentheses and computed on the spot: 5 + 7 = 12. `print(j)` asks `__repr__`, which itself reads `self.total`. Writing `j.total()` would be the error: it tries to call the number 12.',
    },
    {
      kind: 'parsons',
      prompt: 'Build a `Wallet` with, in this order: `__init__` storing `cash`, a property `empty` that is True when cash is 0, and a `__repr__` giving `Wallet(<cash>)`. Then make an empty wallet, print `empty`, print the wallet. Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['class Wallet:', '    def __init__(self, cash):', '        self.cash = cash', '    @property', '    def empty(self):', '        return self.cash == 0', '    def __repr__(self):', '        return f"Wallet({self.cash})"', 'w = Wallet(0)', 'print(w.empty)', 'print(w)'],
      distractors: ['print(w.empty())', '        print(f"Wallet({self.cash})")', '    def __repr__():'],
      explanation: 'A property is read without parentheses. `__repr__` must return its text, not print it, and like every method it takes `self`.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the decorators and the parameter name so the program prints `0`.',
      language: 'python',
      template: 'class Box:\n    def __init__(self, items):\n        self.items = items\n\n    {{prop}}\n    def count(self):\n        return len(self.items)\n\n    {{cm}}\n    def empty({{c}}):\n        return cls([])\n\nb = Box.empty()\nprint(b.count)',
      blanks: [
        { id: 'prop', answers: ['@property'], hint: 'count is read without parentheses below' },
        { id: 'cm', answers: ['@classmethod'], hint: 'empty is called on Box itself' },
        { id: 'c', answers: ['cls'], hint: 'the class, not an instance' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'The two last prints are unreadable. Turn `balance` into a property (the bottom code already reads it without parentheses) and add a `__repr__` that returns `Account(<owner>, <balance>)`. Do not change the bottom code.',
      language: 'python',
      starter: 'class Account:\n    def __init__(self, owner):\n        self.owner = owner\n        self.history = []\n\n    def add(self, amount):\n        self.history.append(amount)\n\n    def balance(self):\n        return sum(self.history)\n\nacc = Account("Sam")\nprint("Amount?")\nacc.add(int(input()))\nprint("Amount?")\nacc.add(int(input()))\nprint(acc.balance)\nprint(acc)\n',
      tests: [
        { description: '100 and -30', stdin: '100\n-30', expectedStdout: 'Amount?\nAmount?\n70\nAccount(Sam, 70)' },
        { description: 'zero and zero', stdin: '0\n0', expectedStdout: 'Amount?\nAmount?\n0\nAccount(Sam, 0)' },
      ],
      hint: 'One line above `def balance` does the first job. `__repr__` can use `self.balance` inside its f-string.',
      solution: 'class Account:\n    def __init__(self, owner):\n        self.owner = owner\n        self.history = []\n\n    def add(self, amount):\n        self.history.append(amount)\n\n    @property\n    def balance(self):\n        return sum(self.history)\n\n    def __repr__(self):\n        return f"Account({self.owner}, {self.balance})"\n\nacc = Account("Sam")\nprint("Amount?")\nacc.add(int(input()))\nprint("Amount?")\nacc.add(int(input()))\nprint(acc.balance)\nprint(acc)\n',
    },
    {
      kind: 'create',
      prompt: 'Write `Account` with `__init__(self, owner)` (owner and an empty `history` list), a command `add(self, amount)`, a property `balance` (sum of history), a `__repr__` returning `Account(<owner>, <balance>)`, and a classmethod `from_input(cls)` that prints `Owner?`, reads the owner, then repeats: print `Amount (or quit)?`, read a line, stop on `quit`, otherwise add the whole number; it returns the finished account. The main program calls `Account.from_input()`, prints the account, then prints `Entries: <length of history>`.',
      language: 'python',
      tests: [
        { description: 'Sam, two amounts', stdin: 'Sam\n100\n-30\nquit', expectedStdout: 'Owner?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nAccount(Sam, 70)\nEntries: 2' },
        { description: 'Ana, nothing', stdin: 'Ana\nquit', expectedStdout: 'Owner?\nAmount (or quit)?\nAccount(Ana, 0)\nEntries: 0' },
        { description: 'Bo, three expenses', stdin: 'Bo\n-5\n-5\n-5\nquit', expectedStdout: 'Owner?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nAccount(Bo, -15)\nEntries: 3' },
      ],
      hint: 'Inside `from_input`, build the instance with `acc = cls(input())` right after the owner prompt, then `acc.add(...)` in the loop and `return acc` on quit.',
      solution: 'class Account:\n    def __init__(self, owner):\n        self.owner = owner\n        self.history = []\n\n    def add(self, amount):\n        self.history.append(amount)\n\n    @property\n    def balance(self):\n        return sum(self.history)\n\n    def __repr__(self):\n        return f"Account({self.owner}, {self.balance})"\n\n    @classmethod\n    def from_input(cls):\n        print("Owner?")\n        acc = cls(input())\n        while True:\n            print("Amount (or quit)?")\n            text = input()\n            if text == "quit":\n                return acc\n            acc.add(int(text))\n\nacc = Account.from_input()\nprint(acc)\nprint(f"Entries: {len(acc.history)}")\n',
      projectNote: 'Ledger.balance will be a property and Ledger.load a classmethod, exactly these two shapes.',
    },
  ],
};

const l74: Lesson = {
  id: 'py-7-4',
  title: 'Records: @dataclass',
  objective: 'Describe a record as a dataclass and let Python generate its boilerplate.',
  minutes: 18,
  lexicon: [
    { id: 'py.7.dataclass', term: '@dataclass', kind: 'keyword', meaning: 'Placed above a class whose body lists fields. Python then writes __init__ (fields in order), __repr__ (showing the fields) and __eq__ (field by field) for you. Import it from dataclasses.', example: 'from dataclasses import dataclass\n\n@dataclass\nclass Entry:\n    amount: int\n    category: str' },
    { id: 'py.7.field', term: 'name: type', kind: 'pattern', meaning: 'A field with a type hint. The hint documents what belongs there and tells @dataclass the field exists; Python does not check it at run time.', example: 'amount: int' },
    { id: 'py.7.asdict', term: 'asdict(obj)', kind: 'builtin', meaning: 'Turn a dataclass instance into a plain dict of its fields, which json can write.', example: 'asdict(Entry(-30, "food"))   # {\'amount\': -30, \'category\': \'food\'}' },
    { id: 'py.7.eq', term: '== on objects', kind: 'concept', meaning: 'A plain class compares by identity: two separate instances are never equal. A dataclass compares field by field, like a tuple.', example: 'Entry(1, "a") == Entry(1, "a")   # True' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A record with a name',
      body: `An entry is two values that travel together. As a tuple, \`(amount, category)\`, you must remember which position is which. As a dict, a typo in a key is a silent bug. As a plain class you write \`__init__\`, \`__repr__\` and \`__eq__\` by hand for every record.

\`@dataclass\` is the fourth way. Write the class as a list of **fields**, each with a **type hint**, and Python generates the three methods: \`__init__\` takes the fields in order, \`__repr__\` shows them by name, \`__eq__\` compares them one by one. The hints are documentation; Python does not enforce them.

\`asdict\` turns an instance back into a dict for \`json\`. The other direction is a loop that calls \`Entry(...)\` on each dict, which is exactly how the ledger will load its file.`,
      example: {
        language: 'python',
        source: 'from dataclasses import dataclass, asdict\n\n@dataclass\nclass Entry:\n    amount: int\n    category: str\n\na = Entry(-30, "food")\nb = Entry(-30, "food")\nprint(a)\nprint(a.amount, a.category)\nprint(a == b)\nprint(asdict(a))\n\nrows = [{"amount": -20, "category": "food"}, {"amount": 50, "category": "salary"}]\nentries = []\nfor row in rows:\n    entries.append(Entry(row["amount"], row["category"]))\nprint(entries[1])',
        labels: [
          { lines: [1, 1], label: 'Both names come from the dataclasses module.' },
          { lines: [3, 6], label: 'The whole record: two fields, in the order __init__ will expect them.' },
          { lines: [8, 9], label: 'The generated __init__: positional, amount first.' },
          { lines: [10, 11], label: "Entry(amount=-30, category='food'), then -30 food." },
          { lines: [12, 12], label: 'True: generated __eq__ compares the fields.' },
          { lines: [13, 13], label: "{'amount': -30, 'category': 'food'}: ready for json.dump." },
          { lines: [15, 19], label: 'Dicts from a file become Entry objects: the loading loop.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'What is printed?',
      code: { language: 'python', source: 'from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: int\n    y: int\n\nclass Pair:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\nprint(Point(1, 2) == Point(1, 2))\nprint(Pair(1, 2) == Pair(1, 2))\nprint(Point(1, 2))' },
      choices: ['True\nFalse\nPoint(x=1, y=2)', 'True\nTrue\nPoint(x=1, y=2)', 'True\nFalse\n(1, 2)', 'False\nFalse\nPoint(1, 2)'],
      answer: 'True\nFalse\nPoint(x=1, y=2)',
      explanation: 'The dataclass got a generated `__eq__` that compares `x` and `y`, so equal fields mean equal points. `Pair` has no `__eq__`, so `==` falls back to identity and two separate instances are not equal. The generated `__repr__` names each field.',
    },
    {
      kind: 'parsons',
      prompt: 'Define the `Entry` dataclass (amount first), build an `Entry` from the first row of `rows`, print it, then print whether it equals `Entry(-20, "food")`. Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['from dataclasses import dataclass', '@dataclass', 'class Entry:', '    amount: int', '    category: str', 'rows = [{"amount": -20, "category": "food"}, {"amount": 50, "category": "salary"}]', 'first = Entry(rows[0]["amount"], rows[0]["category"])', 'print(first)', 'print(first == Entry(-20, "food"))'],
      distractors: ['class Entry(dataclass):', '    amount = int', 'first = Entry(rows[0])'],
      explanation: '`@dataclass` is a decorator line above the class, not a parent class. A field is `name: type`; `amount = int` would be an ordinary assignment and no field. The generated `__init__` wants one argument per field, so a whole dict is one argument too few.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the program so it prints `{\'amount\': -5, \'category\': \'fees\'}`.',
      language: 'python',
      template: 'from dataclasses import dataclass, {{fn}}\n\n{{deco}}\nclass Entry:\n    amount: {{t}}\n    category: str\n\ne = Entry(-5, "fees")\nprint({{fn}}(e))',
      blanks: [
        { id: 'fn', answers: ['asdict'], hint: 'the converter to a plain dict' },
        { id: 'deco', answers: ['@dataclass'], hint: 'the decorator line, with its @' },
        { id: 't', answers: ['int'], hint: 'money is a whole number' },
      ],
    },
    {
      kind: 'modify',
      prompt: 'Replace the hand-written class with a dataclass so that the three final prints show the generated repr `Entry(amount=-30, category=\'food\')`, then `True`, then the dict from `asdict`. Leave the input part unchanged.',
      language: 'python',
      starter: 'from dataclasses import asdict\n\nclass Entry:\n    def __init__(self, amount, category):\n        self.amount = amount\n        self.category = category\n\nprint("Amount?")\namount = int(input())\nprint("Category?")\ncategory = input()\ne = Entry(amount, category)\nprint(e)\nprint(e == Entry(amount, category))\nprint(asdict(e))\n',
      tests: [
        { description: '-30 food', stdin: '-30\nfood', expectedStdout: "Amount?\nCategory?\nEntry(amount=-30, category='food')\nTrue\n{'amount': -30, 'category': 'food'}" },
        { description: '500 salary', stdin: '500\nsalary', expectedStdout: "Amount?\nCategory?\nEntry(amount=500, category='salary')\nTrue\n{'amount': 500, 'category': 'salary'}" },
      ],
      hint: 'Import `dataclass` too, put `@dataclass` above the class, and replace the whole `__init__` with two field lines: `amount: int` and `category: str`.',
      solution: 'from dataclasses import dataclass, asdict\n\n@dataclass\nclass Entry:\n    amount: int\n    category: str\n\nprint("Amount?")\namount = int(input())\nprint("Category?")\ncategory = input()\ne = Entry(amount, category)\nprint(e)\nprint(e == Entry(amount, category))\nprint(asdict(e))\n',
    },
    {
      kind: 'create',
      prompt: 'Define an `Entry` dataclass with fields `amount: int` and `category: str`. If a file `entries.json` exists it holds a JSON list of objects with those two keys; load it into a list of `Entry` (an absent file means an empty list). Then repeat: print `Amount (or quit)?`, read a line, stop on `quit`; otherwise print `Category?`, read it, and append an `Entry`. Finally print every entry (one per line, in order, using the generated repr), then `Total: <sum of amounts>`.',
      language: 'python',
      tests: [
        { description: 'file with one entry, one typed', files: { 'entries.json': '[{"amount": -20, "category": "food"}]' }, stdin: '50\nsalary\nquit', expectedStdout: "Amount (or quit)?\nCategory?\nAmount (or quit)?\nEntry(amount=-20, category='food')\nEntry(amount=50, category='salary')\nTotal: 30" },
        { description: 'no file, two typed', stdin: '-5\nrent\n-5\nfood\nquit', expectedStdout: "Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nEntry(amount=-5, category='rent')\nEntry(amount=-5, category='food')\nTotal: -10" },
        { description: 'no file, quit at once', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nTotal: 0' },
        { description: 'file with two entries, quit at once', files: { 'entries.json': '[{"amount": 300, "category": "salary"}, {"amount": -45, "category": "rent"}]' }, stdin: 'quit', expectedStdout: "Amount (or quit)?\nEntry(amount=300, category='salary')\nEntry(amount=-45, category='rent')\nTotal: 255" },
      ],
      hint: 'Load as in Module 6: `try: ... json.load(f) ... except FileNotFoundError: rows = []`. Then `for row in rows: entries.append(Entry(row["amount"], row["category"]))`.',
      solution: 'import json\nfrom dataclasses import dataclass\n\n\n@dataclass\nclass Entry:\n    amount: int\n    category: str\n\n\nentries = []\ntry:\n    with open("entries.json") as f:\n        rows = json.load(f)\nexcept FileNotFoundError:\n    rows = []\nfor row in rows:\n    entries.append(Entry(row["amount"], row["category"]))\nwhile True:\n    print("Amount (or quit)?")\n    text = input()\n    if text == "quit":\n        break\n    print("Category?")\n    entries.append(Entry(int(text), input()))\nfor e in entries:\n    print(e)\ntotal = 0\nfor e in entries:\n    total = total + e.amount\nprint(f"Total: {total}")\n',
      projectNote: 'The ledger\'s entries stop being anonymous dicts: each one is an Entry with named fields.',
    },
  ],
};

const l75: Lesson = {
  id: 'py-7-5',
  title: 'Project: Ledger v0.7',
  objective: 'Rebuild the ledger as an Entry dataclass and a Ledger class without changing what the user sees.',
  minutes: 24,
  lexicon: [
    { id: 'py.7.cls-call', term: 'cls(...)', kind: 'pattern', meaning: 'Inside a classmethod, make an instance of whatever class the method was called on. It is how an alternative constructor starts.', example: '@classmethod\ndef load(cls, path, starting=0):\n    ledger = cls(starting)' },
    { id: 'py.7.main-fn', term: 'def main(): ... main()', kind: 'pattern', meaning: 'Keep the program\'s steps in one function and call it once at the bottom. The classes above it only define; the last line acts.', example: 'def main():\n    ledger = Ledger.load("ledger.json")\n\nmain()' },
    { id: 'py.7.encapsulation', term: 'an object owns its data', kind: 'concept', meaning: 'Keep the data and every operation on it inside one class, so callers ask (`ledger.balance`) instead of recomputing. The design rule behind Ledger.', example: 'ledger.add(Entry(-30, "food"))\nprint(ledger.balance)', analogy: 'A bank clerk: you hand over an entry and ask for the balance; you do not reach into the drawer. It breaks because Python locks nothing: `ledger.entries` is still there for anyone who insists.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The same ledger, now with structure',
      body: `Ledger v0.7 prints exactly what v0.6 printed. Only the inside changes: an \`Entry\` dataclass for each record, and a \`Ledger\` class that owns the list of entries, the starting balance, and every operation on them. \`main()\` is the conversation with the user; it never touches \`ledger.entries\` to compute anything, it asks.

Read the labels: they are the plan. Two things to notice. \`balance\` is a property, so the running total is never stored and can never go stale. \`load\` is a classmethod: it builds the ledger, fills it from the file if there is one, and returns it; \`main\` then sets \`starting\` once it has asked the user.

In a real project \`Entry\` goes in \`entry.py\`, \`Ledger\` in \`ledger.py\` (starting with \`from entry import Entry\`), and \`main\` in \`main.py\` (starting with \`from ledger import Entry, Ledger\`). Here it is one file, so the runner can execute it.`,
      example: {
        language: 'python',
        source: LEDGER_V07.trimEnd(),
        labels: [
          { lines: [1, 2], label: 'Borrow json for the file and the two dataclass tools.' },
          { lines: [5, 8], label: 'Entry: one record, two named fields.' },
          { lines: [11, 14], label: 'Ledger state: the starting balance and the list of entries.' },
          { lines: [16, 17], label: 'Command: record an entry.' },
          { lines: [19, 24], label: 'Query as a property: starting plus every amount, computed on demand.' },
          { lines: [26, 30], label: 'Query: totals per category as a dict; main sorts it when printing.' },
          { lines: [32, 37], label: 'Write every entry as a dict, then the list as JSON.' },
          { lines: [39, 49], label: 'Alternative constructor: an empty ledger, filled from the file when it exists.' },
          { lines: [52, 56], label: 'Start: load, report the count, ask for the starting balance.' },
          { lines: [57, 70], label: 'The loop from v0.6: quit, retry on a bad number, or record and report.' },
          { lines: [71, 77], label: 'Finish: save, then the summary and footer.' },
          { lines: [80, 80], label: 'The only line that acts; everything above defines.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'Using `Entry` and `Ledger` exactly as defined in the previous step, what does this script print?',
      code: { language: 'python', source: 'ledger = Ledger(100)\nledger.add(Entry(-30, "food"))\nledger.add(Entry(-10, "food"))\nledger.add(Entry(50, "salary"))\nprint(ledger.balance)\nprint(ledger.by_category()["food"])\nprint(len(ledger.entries))' },
      choices: ['110\n-40\n3', '10\n-40\n3', '110\n-30\n2', '110\n-40\n4'],
      answer: '110\n-40\n3',
      explanation: '`Ledger(100)` runs `__init__` with starting 100 and an empty list. Three `add` calls append three entries. `balance` is recomputed when read: 100 - 30 - 10 + 50 = 110. `by_category` adds up the two food entries to -40. The starting balance is not an entry, so the list has 3.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the `load` classmethod. It lives inside `class Ledger:`, so its first line is already indented 4 spaces. Create the empty ledger first, then try to read the file, then add an Entry per row. Set the indentation yourself.',
      language: 'python',
      indentation: true,
      solution: ['    @classmethod', '    def load(cls, path, starting=0):', '        ledger = cls(starting)', '        try:', '            with open(path) as f:', '                rows = json.load(f)', '        except FileNotFoundError:', '            rows = []', '        for row in rows:', '            ledger.add(Entry(row["amount"], row["category"]))', '        return ledger'],
      distractors: ['    def load(self, path, starting=0):', '        ledger = cls.__init__(starting)', '    @property'],
      explanation: 'A classmethod receives the class as `cls`, and `cls(starting)` is how it makes the instance; `__init__` is never called by hand. `@property` would make `load` a read-only attribute, not a constructor.',
    },
    {
      kind: 'create',
      prompt: `Write Ledger v0.7. Define \`Entry\` as a dataclass (\`amount: int\`, \`category: str\`) and \`Ledger\` with \`__init__(self, starting=0)\`, \`add(self, entry)\`, a \`balance\` property, \`by_category(self)\`, \`save(self, path)\` and a classmethod \`load(cls, path, starting=0)\`. The behaviour is v0.6 exactly:

- On start load \`ledger.json\` if it exists (a JSON list of \`{"amount": int, "category": str}\`) and print \`Loaded <k> entries\` (\`Loaded 0 entries\` when absent).
- Print \`Balance?\` and read the starting balance; the balance is that plus the sum of all entry amounts.
- Repeat \`Amount (or quit)?\`. On \`quit\` stop. If the answer is not a whole number print \`Not a number, try again\` and ask again without asking a category. Otherwise print \`Category?\`, read it, add the entry and print \`Balance: <running>\`.
- After quit, save all entries to \`ledger.json\` and print \`Saved <total> entries\`, then \`--- summary ---\`, one \`<category>: <total>\` line per category sorted by name, \`Entries: <total>\` and \`Final balance: <n>\`.`,
      language: 'python',
      tests: [
        { description: 'no file, three entries', stdin: '100\n-30\nfood\n50\nsalary\n-10\nfood\nquit', expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nCategory?\nBalance: 70\nAmount (or quit)?\nCategory?\nBalance: 120\nAmount (or quit)?\nCategory?\nBalance: 110\nAmount (or quit)?\nSaved 3 entries\n--- summary ---\nfood: -40\nsalary: 50\nEntries: 3\nFinal balance: 110' },
        { description: 'file with one entry, one added', files: { 'ledger.json': '[{"amount": -20, "category": "food"}]' }, stdin: '100\n50\nsalary\nquit', expectedStdout: 'Loaded 1 entries\nBalance?\nAmount (or quit)?\nCategory?\nBalance: 130\nAmount (or quit)?\nSaved 2 entries\n--- summary ---\nfood: -20\nsalary: 50\nEntries: 2\nFinal balance: 130' },
        { description: 'bad amount is retried without a category', stdin: '0\nabc\n-5\nrent\nquit', expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nNot a number, try again\nAmount (or quit)?\nCategory?\nBalance: -5\nAmount (or quit)?\nSaved 1 entries\n--- summary ---\nrent: -5\nEntries: 1\nFinal balance: -5' },
        { description: 'file with two entries, quit at once', files: { 'ledger.json': '[{"amount": -20, "category": "food"}, {"amount": 300, "category": "salary"}]' }, stdin: '10\nquit', expectedStdout: 'Loaded 2 entries\nBalance?\nAmount (or quit)?\nSaved 2 entries\n--- summary ---\nfood: -20\nsalary: 300\nEntries: 2\nFinal balance: 290' },
        { description: 'no file, quit at once', stdin: '40\nquit', expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nSaved 0 entries\n--- summary ---\nEntries: 0\nFinal balance: 40' },
      ],
      hint: 'Write the two classes first and check them in your head against the predict step. Then write `main()` straight from the labels: load, ask, loop, save, report. `main` should only ever call methods and read `ledger.balance` and `ledger.entries`.',
      solution: LEDGER_V07,
      projectNote: 'Ledger v0.7 complete: same conversation as v0.6, now an Entry dataclass and a Ledger class that owns its data. Module 8 turns it into a command-line tool with tests.',
    },
  ],
};

export const m7: Module = {
  id: 'py-m7',
  title: 'Structure',
  goal: 'Modules and imports, classes and dataclasses, methods, the standard library.',
  projectMilestone: 'Ledger v0.7: an Entry dataclass and a Ledger class (one file in the app; split across files in a real project).',
  status: 'available',
  lessons: [l71, l72, l73, l74, l75],
};
