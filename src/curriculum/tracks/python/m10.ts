import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 10: Algorithms and growth                                   */
/* ------------------------------------------------------------------ */

/* ---------------------------- 10-1 -------------------------------- */

const l101: Lesson = {
  id: 'py-10-1',
  title: 'A function that calls itself',
  objective: 'Write a recursive function with a base case and a smaller problem, and read the call stack it builds.',
  minutes: 26,
  lexicon: [
    { id: 'py.10.recursion', term: 'recursion', kind: 'concept', meaning: 'Solving a problem by having a function call itself on a smaller version of the same problem, until the problem is small enough to answer directly. Each call gets its own frame on the call stack.', example: 'def total(node):\n    if not isinstance(node, dict):\n        return node\n    return sum(total(child) for child in node.values())', analogy: 'Russian nesting dolls: to count the dolls, open one and count the dolls inside it the same way, until you reach a doll that does not open. The analogy breaks on size: dolls get smaller for free, but your code must make the problem smaller on every call or it never stops.' },
    { id: 'py.10.base-case', term: 'base case', kind: 'pattern', meaning: 'The branch of a recursive function that returns without calling itself. It must come first and must be reached by every chain of calls; without it the recursion never ends.', example: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)' },
    { id: 'py.10.recursionerror', term: 'RecursionError', kind: 'builtin', meaning: 'The error Python raises when the call stack grows past its limit (about 1000 frames). It almost always means a missing or unreachable base case, not a problem that is genuinely too big.', example: 'def forever(n):\n    return forever(n - 1)\n# forever(3) -> RecursionError: maximum recursion depth exceeded' },
    { id: 'py.10.isinstance', term: 'isinstance(value, dict)', kind: 'builtin', meaning: 'True if the value is of the given type (or a subclass). In a tree of nested dicts it is how you tell a branch from a leaf.', example: 'isinstance({"a": 1}, dict)   # True\nisinstance(-30, dict)        # False' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Base case, then a smaller problem',
      body: `The ledger's categories can nest: \`food\` holds \`groceries\` and \`eating out\`, which holds \`lunch\` and \`dinner\`. As a dict of dicts, the depth is not fixed, so no loop with a known number of levels can total it. A function that **calls itself** can.

A recursive function has two parts, in this order. The **base case** answers the smallest problem directly: a number is its own total. The **recursive case** calls the same function on smaller pieces: a dict's total is the sum of its values' totals.

Remember the notional machine from Module 4: every call gets its own frame on the stack, with its own \`node\`. \`total(tree)\` pushes a frame; inside it, \`total(tree["food"])\` pushes another, and so on down to a leaf. Each frame returns its answer to the one below, and the stack unwinds. Recursion is the clearer tool exactly when the data is shaped like this: a thing that contains smaller things of the same kind.`,
      example: {
        language: 'python',
        source: `def total(node):
    if not isinstance(node, dict):
        return node
    result = 0
    for child in node.values():
        result += total(child)
    return result

tree = {
    "food": {"groceries": -120, "eating out": {"lunch": -30, "dinner": -45}},
    "rent": -800,
}
print(total(tree))

# Trace of total(tree):
#   total(tree)                       frame 1: a dict, loop over two children
#     total(tree["food"])             frame 2: a dict, loop over two children
#       total(-120)                   frame 3: a leaf, returns -120
#       total({"lunch": -30, ...})    frame 3 again: a dict
#         total(-30) -> -30, total(-45) -> -45   frame 4, twice
#       returns -75
#     returns -195
#     total(-800)                     frame 2: a leaf, returns -800
#   returns -995`,
        labels: [
          { lines: [1, 3], label: 'The base case comes first: a leaf (anything that is not a dict) is its own total. No further calls.' },
          { lines: [4, 7], label: 'The recursive case: the total of a dict is the sum of the totals of its children. Each total(child) is a smaller problem.' },
          { lines: [9, 13], label: 'A tree three levels deep. Output: -995.' },
          { lines: [15, 24], label: 'The call stack as it grows and unwinds. Deeper indentation is a frame higher on the stack; each frame returns to the one below it.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'This factorial prints its own trace. What is the complete output?',
      code: {
        language: 'python',
        source: `def factorial(n, indent=""):
    print(f"{indent}factorial({n})")
    if n <= 1:
        return 1
    return n * factorial(n - 1, indent + "  ")

print(factorial(3))`,
      },
      choices: [
        'factorial(3)\n  factorial(2)\n    factorial(1)\n6',
        'factorial(3)\n  factorial(2)\n    factorial(1)\n      factorial(0)\n6',
        '6\nfactorial(3)\n  factorial(2)\n    factorial(1)',
        'factorial(3)\nfactorial(2)\nfactorial(1)\n6',
      ],
      answer: 'factorial(3)\n  factorial(2)\n    factorial(1)\n6',
      explanation: 'Each call prints before it recurses, with two more spaces per frame, so the trace shows the stack growing. The base case `n <= 1` stops at 1, so there is no `factorial(0)`. The final `print` runs only after every frame has returned, so `6` comes last. The same result with a loop would be `result = 1; for i in range(2, n + 1): result *= i`: for factorial the loop is just as clear, which is why recursion is kept for data that nests.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `count_leaves(node)`, which returns how many numbers a nested category tree holds. Set the indentation.',
      language: 'python',
      solution: [
        'def count_leaves(node):',
        '    if not isinstance(node, dict):',
        '        return 1',
        '    count = 0',
        '    for child in node.values():',
        '        count += count_leaves(child)',
        '    return count',
      ],
      distractors: ['        return 0', '    if node == {}:', '        count += count_leaves(node)'],
      indentation: true,
      explanation: 'The base case is a leaf, and a leaf counts as one, so `return 0` would make every total zero. `node == {}` tests for an empty dict, which is never a leaf. `count_leaves(node)` would call the function on the same problem, not a smaller one, and never stop.',
    },
    {
      kind: 'predict',
      prompt: 'What happens when this program runs?',
      code: {
        language: 'python',
        source: `def countdown(n):
    print(n)
    countdown(n - 1)

countdown(3)`,
      },
      choices: [
        '3, 2, 1, 0 on separate lines, then the program ends',
        '3, 2, 1 on separate lines, then the program ends',
        '3, 2, 1, 0, -1, -2 and so on, until Python stops it with RecursionError',
        'Nothing: Python refuses to run a function that calls itself',
      ],
      answer: '3, 2, 1, 0, -1, -2 and so on, until Python stops it with RecursionError',
      explanation: 'There is no base case, so nothing ever returns: each call prints and pushes another frame. After roughly a thousand frames Python raises `RecursionError: maximum recursion depth exceeded`. The traceback is long because it lists the same line once per frame; read its last line first. The fix is a base case before the recursive call: `if n < 0: return`.',
    },
    {
      kind: 'modify',
      prompt: 'This program reads a nested category tree from `tree.json` and prints a total per top-level category, then the grand total. It is wrong: `total` adds only the numbers directly inside a dict and ignores nested dicts, so `food` comes out as 0 instead of -195. Rewrite `total(node)` recursively: return `node` itself when it is not a dict (the base case), otherwise the sum of `total` over its values.',
      language: 'python',
      starter: `import json

def total(node):
    result = 0
    for value in node.values():
        if isinstance(value, int):
            result += value
    return result

with open("tree.json") as f:
    tree = json.load(f)

for name in sorted(tree):
    print(f"{name}: {total(tree[name])}")
print(f"Total: {total(tree)}")
`,
      tests: [
        {
          description: 'three levels of nesting',
          files: { 'tree.json': '{"food": {"groceries": -120, "eating out": {"lunch": -30, "dinner": -45}}, "rent": -800, "salary": 2000}' },
          expectedStdout: 'food: -195\nrent: -800\nsalary: 2000\nTotal: 1005',
        },
        {
          description: 'a flat tree still works',
          files: { 'tree.json': '{"rent": -800, "salary": 2000}' },
          expectedStdout: 'rent: -800\nsalary: 2000\nTotal: 1200',
        },
        {
          description: 'four levels deep',
          files: { 'tree.json': '{"travel": {"work": {"trains": {"paris": -90, "lyon": -60}}, "holiday": -300}}' },
          expectedStdout: 'travel: -450\nTotal: -450',
        },
      ],
      hint: 'Start with the base case: `if not isinstance(node, dict): return node`. Then the loop no longer needs to check the type of each value; it just adds `total(value)`. Note that `tree[name]` can itself be a plain number (`rent`), which the base case now handles.',
      solution: `import json

def total(node):
    if not isinstance(node, dict):
        return node
    result = 0
    for value in node.values():
        result += total(value)
    return result

with open("tree.json") as f:
    tree = json.load(f)

for name in sorted(tree):
    print(f"{name}: {total(tree[name])}")
print(f"Total: {total(tree)}")
`,
    },
    {
      kind: 'create',
      prompt: `Write a program that flattens a nested category tree from \`tree.json\`.

- \`print_leaves(node, path)\` prints one line per number in the tree as \`<path>: <amount>\`, where the path joins the keys from the top with \`/\` (for example \`food/eating out/dinner: -45\`). At every level, visit keys in sorted order.
- \`depth(node)\` returns how many dict levels the tree has: a number is depth 0, \`{"rent": -800}\` is depth 1, and a dict's depth is one more than its deepest child.
- After the leaves, print \`Depth: <n>\`.

Fixtures always contain at least one number and no empty dicts.`,
      language: 'python',
      tests: [
        {
          description: 'three levels, sorted at every level',
          files: { 'tree.json': '{"food": {"groceries": -120, "eating out": {"lunch": -30, "dinner": -45}}, "rent": -800, "salary": 2000}' },
          expectedStdout: 'food/eating out/dinner: -45\nfood/eating out/lunch: -30\nfood/groceries: -120\nrent: -800\nsalary: 2000\nDepth: 3',
        },
        {
          description: 'a flat tree has depth 1',
          files: { 'tree.json': '{"salary": 2000, "rent": -800}' },
          expectedStdout: 'rent: -800\nsalary: 2000\nDepth: 1',
        },
        {
          description: 'one deep branch beside a shallow one',
          files: { 'tree.json': '{"travel": {"work": {"trains": {"paris": -90}}, "holiday": -300}, "gifts": -40}' },
          expectedStdout: 'gifts: -40\ntravel/holiday: -300\ntravel/work/trains/paris: -90\nDepth: 4',
        },
      ],
      hint: 'Both functions start with the same base case, `if not isinstance(node, dict)`. For the path, the top-level call passes `""`, and a child\'s path is the key alone when the path is empty, otherwise `f"{path}/{key}"`. For depth, `1 + max(depth(child) for child in node.values())`.',
      solution: `import json

def print_leaves(node, path):
    if not isinstance(node, dict):
        print(f"{path}: {node}")
        return
    for key in sorted(node):
        child_path = key if path == "" else f"{path}/{key}"
        print_leaves(node[key], child_path)

def depth(node):
    if not isinstance(node, dict):
        return 0
    return 1 + max(depth(child) for child in node.values())

with open("tree.json") as f:
    tree = json.load(f)

print_leaves(tree, "")
print(f"Depth: {depth(tree)}")
`,
      projectNote: 'Nested categories are the first ledger data a plain loop cannot handle. The insights tool in 10-5 stays flat, but the same base-case-first habit returns in 10-4 with lru_cache.',
    },
  ],
};

/* ---------------------------- 10-2 -------------------------------- */

const l102: Lesson = {
  id: 'py-10-2',
  title: 'Finding one amount among many',
  objective: 'Write linear and binary search by hand, count their comparisons, and use bisect for the library version.',
  minutes: 24,
  lexicon: [
    { id: 'py.10.linear-search', term: 'linear search', kind: 'pattern', meaning: 'Look at each item in turn until you find the target or run out. Works on any list, sorted or not; in the worst case it looks at every item, so the comparison count grows with the length.', example: 'for i, item in enumerate(items):\n    if item == target:\n        return i\nreturn -1' },
    { id: 'py.10.binary-search', term: 'binary search', kind: 'pattern', meaning: 'On a sorted list, compare the target with the middle item and discard the half that cannot contain it; repeat on the remaining half. Each comparison halves the search space, so 1024 items need at most 11 looks.', example: 'low, high = 0, len(items) - 1\nwhile low <= high:\n    mid = (low + high) // 2\n    if items[mid] == target:\n        return mid\n    if items[mid] < target:\n        low = mid + 1\n    else:\n        high = mid - 1\nreturn -1', analogy: 'Finding a word in a paper dictionary: open near the middle, decide which half, repeat. The analogy breaks on the precondition: a dictionary is always alphabetical, but a Python list is only sorted if you sorted it, and binary search on an unsorted list silently returns nonsense.' },
    { id: 'py.10.bisect-left', term: 'bisect.bisect_left(sorted_items, x)', kind: 'builtin', meaning: 'Binary search from the standard library: returns the index where x would be inserted to keep the list sorted, before any equal items. That index is also how many items are smaller than x.', example: 'from bisect import bisect_left\nbisect_left([-800, -120, 60, 250], 60)   # 2' },
    { id: 'py.10.bisect-right', term: 'bisect.bisect_right(sorted_items, x)', kind: 'builtin', meaning: 'Like bisect_left but returns the insertion point after any items equal to x. The difference between the two is how many copies of x the list holds.', example: 'from bisect import bisect_right\nbisect_right([15, 60, 60, 250], 60)   # 3' },
    { id: 'py.10.operation-count', term: 'operation count', kind: 'concept', meaning: 'The number of basic steps (comparisons, swaps, looks at an item) an algorithm performs for an input of a given size. Counting it, rather than timing it, shows how the work grows as the input grows, independent of the machine.', example: 'comparisons = 0\nwhile low <= high:\n    comparisons += 1\n    ...' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Halve the problem instead of walking it',
      body: `To find whether an amount appears in the ledger, the obvious way is to walk the list from the front comparing each item: **linear search**. It works on any list, and n items may take n comparisons.

If the list is **sorted**, you can do far better. Compare the target with the middle item. If they match, done. If the target is bigger, it can only be in the right half; otherwise only in the left half. Repeat on that half. This is **binary search**: every comparison throws away half of what is left, so 8 items need at most 4 looks and 1024 need at most 11.

To see the difference, we **count** comparisons rather than time the code: a counter in the loop is repeatable, a stopwatch depends on the machine. Both functions below return the index and the count. Binary search's one demand is a sorted list; \`sorted()\` first, or it returns nonsense without any error.`,
      example: {
        language: 'python',
        source: `def linear_search(items, target):
    comparisons = 0
    for i, item in enumerate(items):
        comparisons += 1
        if item == target:
            return i, comparisons
    return -1, comparisons

def binary_search(items, target):
    low, high = 0, len(items) - 1
    comparisons = 0
    while low <= high:
        mid = (low + high) // 2
        comparisons += 1
        if items[mid] == target:
            return mid, comparisons
        if items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1, comparisons

amounts = [-800, -120, -45, -30, 15, 60, 250, 2000]
print(linear_search(amounts, 2000))
print(binary_search(amounts, 2000))`,
        labels: [
          { lines: [1, 7], label: 'Linear search: look at every item from the front, counting each look. Not found means every item was looked at.' },
          { lines: [9, 11], label: 'Binary search keeps two indexes that fence in the part of the list that may still hold the target.' },
          { lines: [12, 14], label: 'While the fence has something inside it, look at the middle item. That look is one comparison.' },
          { lines: [15, 20], label: 'Found: return. Otherwise move one fence past the middle, discarding the half that cannot hold the target.' },
          { lines: [23, 25], label: 'Eight sorted amounts, target at the far end. Output: (7, 8) then (7, 4).' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'Using the two functions from the example, this program searches for a value that is not in the list. What does it print?',
      code: {
        language: 'python',
        source: `for n in (8, 1024):
    items = list(range(n))
    missing = n
    print(n, linear_search(items, missing)[1], binary_search(items, missing)[1])`,
      },
      choices: ['8 8 4\n1024 1024 11', '8 8 3\n1024 1024 10', '8 8 8\n1024 1024 1024', '8 4 4\n1024 512 512'],
      answer: '8 8 4\n1024 1024 11',
      explanation: 'A missing target makes linear search look at every item: 8, then 1024. Binary search halves the fence each time: 8 -> 4 -> 2 -> 1 -> empty is 4 looks, and 1024 -> 512 -> ... -> 1 -> empty is 11. Multiplying the list by 128 multiplied the linear count by 128 and the binary count by less than 3. That ratio is the whole point of the next lesson.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the binary search so it prints `5` (the index of 60).',
      language: 'python',
      template: `def binary_search(items, target):
    low, high = 0, len(items) - 1
    while low <= high:
        mid = {{mid}}
        if items[mid] == target:
            return mid
        if items[mid] < target:
            low = {{low}}
        else:
            high = {{high}}
    return -1

amounts = [-800, -120, -45, -30, 15, 60, 250, 2000]
print(binary_search(amounts, 60))`,
      blanks: [
        { id: 'mid', answers: ['(low + high) // 2', '(low+high)//2', '(high + low) // 2'], hint: 'the index halfway between the two fences, as a whole number' },
        { id: 'low', answers: ['mid + 1', 'mid+1'], hint: 'the middle item was too small, and it has been looked at, so start just past it' },
        { id: 'high', answers: ['mid - 1', 'mid-1'], hint: 'the middle item was too big; end just before it' },
      ],
      explanation: 'The `+ 1` and `- 1` matter: if the fence stopped at `mid`, a missing target would leave `low == high == mid` forever and the loop would never end. Discard the middle item too; you have already looked at it.',
    },
    {
      kind: 'modify',
      prompt: 'This program reads a target amount and reports where it sits in a sorted list and how many comparisons that took. It uses linear search, so `250` takes 7 comparisons. Replace the search with binary search (count one comparison each time you look at `items[mid]`) so the same program reports `Found 250 at index 6 after 3 comparisons`. Keep the output format exactly, including `Not found after <k> comparisons` for a missing amount.',
      language: 'python',
      starter: `amounts = [-800, -120, -45, -30, 15, 60, 250, 2000]

def search(items, target):
    comparisons = 0
    for i, item in enumerate(items):
        comparisons += 1
        if item == target:
            return i, comparisons
    return -1, comparisons

print("Target?")
target = int(input())
index, comparisons = search(amounts, target)
if index == -1:
    print(f"Not found after {comparisons} comparisons")
else:
    print(f"Found {target} at index {index} after {comparisons} comparisons")
`,
      tests: [
        { description: '250 is found in three looks', stdin: '250', expectedStdout: 'Target?\nFound 250 at index 6 after 3 comparisons' },
        { description: 'the first item still takes three looks', stdin: '-800', expectedStdout: 'Target?\nFound -800 at index 0 after 3 comparisons' },
        { description: 'the middle item is found at once', stdin: '-30', expectedStdout: 'Target?\nFound -30 at index 3 after 1 comparisons' },
        { description: 'a missing amount gives up after three looks', stdin: '100', expectedStdout: 'Target?\nNot found after 3 comparisons' },
      ],
      hint: 'Keep `low` and `high`, loop while `low <= high`, compute `mid`, add one to the counter, then the three-way decision. Return `-1, comparisons` after the loop.',
      solution: `amounts = [-800, -120, -45, -30, 15, 60, 250, 2000]

def search(items, target):
    low, high = 0, len(items) - 1
    comparisons = 0
    while low <= high:
        mid = (low + high) // 2
        comparisons += 1
        if items[mid] == target:
            return mid, comparisons
        if items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1, comparisons

print("Target?")
target = int(input())
index, comparisons = search(amounts, target)
if index == -1:
    print(f"Not found after {comparisons} comparisons")
else:
    print(f"Found {target} at index {index} after {comparisons} comparisons")
`,
    },
    {
      kind: 'create',
      prompt: `You have written binary search once; now use the library's. Write a program that reads whole-number amounts from \`amounts.txt\` (one per line, unsorted), sorts them, and takes a target amount from \`argv[1]\`. Print:

- \`Sorted: <amounts separated by single spaces>\`
- \`Smaller: <how many amounts are less than the target>\` (that is \`bisect_left\`)
- \`Present: yes\` or \`Present: no\`
- \`Larger: <how many amounts are greater than the target>\` (use \`bisect_right\`)

The file always holds at least one amount.`,
      language: 'python',
      tests: [
        { description: 'target present once', files: { 'amounts.txt': '250\n-120\n60\n-800\n15\n' }, argv: ['60'], expectedStdout: 'Sorted: -800 -120 15 60 250\nSmaller: 3\nPresent: yes\nLarger: 1' },
        { description: 'target absent, in the middle', files: { 'amounts.txt': '250\n-120\n60\n-800\n15\n' }, argv: ['100'], expectedStdout: 'Sorted: -800 -120 15 60 250\nSmaller: 4\nPresent: no\nLarger: 1' },
        { description: 'target below everything', files: { 'amounts.txt': '250\n-120\n60\n-800\n15\n' }, argv: ['-1000'], expectedStdout: 'Sorted: -800 -120 15 60 250\nSmaller: 0\nPresent: no\nLarger: 5' },
        { description: 'duplicates count on neither side', files: { 'amounts.txt': '60\n60\n15\n' }, argv: ['60'], expectedStdout: 'Sorted: 15 60 60\nSmaller: 1\nPresent: yes\nLarger: 0' },
      ],
      hint: 'After `i = bisect_left(amounts, target)`, the target is present when `i < len(amounts) and amounts[i] == target`. `Larger` is `len(amounts) - bisect_right(amounts, target)`.',
      solution: `import sys
from bisect import bisect_left, bisect_right

with open("amounts.txt") as f:
    amounts = sorted(int(line) for line in f if line.strip())
target = int(sys.argv[1])

left = bisect_left(amounts, target)
right = bisect_right(amounts, target)
print("Sorted:", " ".join(str(a) for a in amounts))
print(f"Smaller: {left}")
print("Present:", "yes" if left < len(amounts) and amounts[left] == target else "no")
print(f"Larger: {len(amounts) - right}")
`,
      projectNote: 'Sort once, then answer position questions in a handful of comparisons: the insights tool relies on the same sort-first discipline for dates.',
    },
  ],
};

/* ---------------------------- 10-3 -------------------------------- */

const l103: Lesson = {
  id: 'py-10-3',
  title: 'How the work grows',
  objective: 'Write selection sort with counters, name growth rates with big-O, and choose list, set or dict lookups accordingly.',
  minutes: 26,
  lexicon: [
    { id: 'py.10.selection-sort', term: 'selection sort', kind: 'pattern', meaning: 'Sort by repeatedly finding the smallest remaining item and swapping it into the next position. Simple to write, but it compares every pair, so n items need n(n-1)/2 comparisons: doubling the list quadruples the work.', example: 'for i in range(len(items)):\n    smallest = i\n    for j in range(i + 1, len(items)):\n        if items[j] < items[smallest]:\n            smallest = j\n    items[i], items[smallest] = items[smallest], items[i]' },
    { id: 'py.10.big-o', term: 'O(1), O(log n), O(n), O(n²)', kind: 'concept', meaning: 'Big-O names how an operation count grows with the input size n, ignoring constants. O(1): the same whatever n. O(log n): one more step each time n doubles (binary search). O(n): doubles with n (linear search, a loop). O(n²): quadruples with n (a loop inside a loop, selection sort).', example: '# binary search: O(log n)\n# one pass over a list: O(n)\n# selection sort: O(n^2)\n# sorted(): O(n log n)', analogy: 'Gears on a bicycle: the label tells you the ratio between pedalling and distance, not how fast you are going right now. It breaks for small inputs: an O(n²) routine on ten items can beat an O(n log n) one, because the label ignores constants.' },
    { id: 'py.10.set-membership', term: 'x in some_set', kind: 'pattern', meaning: 'Membership test on a set (or a dict key lookup): O(1), the same speed at a million items as at ten, because the value is hashed straight to its slot. On a list, `in` is a linear search, O(n).', example: 'seen = set(categories)\n"food" in seen   # O(1)\n"food" in categories   # O(n)' },
    { id: 'py.10.stable-sort', term: 'stable sort', kind: 'concept', meaning: 'A sort that keeps items with equal keys in their original order. Python\'s sorted() and list.sort() are stable, which is why sorting by one key and then by another gives a sensible combined order.', example: 'rows = [("food", -30), ("rent", -800), ("food", -10)]\nsorted(rows, key=lambda r: r[0])\n# [("food", -30), ("food", -10), ("rent", -800)]: the two food rows keep their order' },
    { id: 'py.10.tuple-key', term: 'key=lambda e: (first, second)', kind: 'pattern', meaning: 'Sort by several criteria at once by returning a tuple from the key function: tuples compare element by element, so the second value only decides ties in the first. Negate a number to sort it descending inside an otherwise ascending key.', example: 'sorted(entries, key=lambda e: (e[1], -abs(e[0])))\n# by category, then largest absolute amount first' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Count the steps, then name the shape',
      body: `Here is a sort written by hand. **Selection sort** finds the smallest remaining item and swaps it into place, n times. The inner loop compares every remaining pair, so the comparison count is n(n-1)/2: 6 for four items, 28 for eight, 120 for sixteen. Double the input, quadruple the work.

**Big-O** is the name for that shape. It ignores constants and asks only: when n doubles, what happens to the count? Stays the same: **O(1)**, like \`x in some_set\` or a dict lookup. Grows by one step: **O(log n)**, binary search. Doubles: **O(n)**, one pass over a list, including \`x in some_list\`. Quadruples: **O(n²)**, a loop inside a loop, selection sort.

Python's \`sorted()\` is Timsort, O(n log n), stable, and written in C. You write selection sort once to feel the n², then use \`sorted\` for the rest of your life, with a \`key\` tuple when one criterion must break ties in another.`,
      example: {
        language: 'python',
        source: `def selection_sort(items):
    items = list(items)
    comparisons = 0
    swaps = 0
    for i in range(len(items)):
        smallest = i
        for j in range(i + 1, len(items)):
            comparisons += 1
            if items[j] < items[smallest]:
                smallest = j
        if smallest != i:
            items[i], items[smallest] = items[smallest], items[i]
            swaps += 1
    return items, comparisons, swaps

print(selection_sort([60, -800, 250, -120]))

entries = [(-30, "food"), (-800, "rent"), (-120, "food"), (-45, "food")]
print(sorted(entries, key=lambda e: (e[1], -abs(e[0]))))`,
        labels: [
          { lines: [1, 4], label: 'Work on a copy and keep two counters: looks and swaps are the operations we count.' },
          { lines: [5, 10], label: 'For each position, scan everything after it for the smallest. The inner loop is what makes this O(n^2).' },
          { lines: [11, 13], label: 'Swap only when the smallest is not already in place; that is the swap count rule.' },
          { lines: [16, 16], label: 'Output: ([-800, -120, 60, 250], 6, 3). Four items, six comparisons.' },
          { lines: [18, 19], label: 'The library sort with a tuple key: by category, then largest absolute amount first. Output: [(-120, "food"), (-45, "food"), (-30, "food"), (-800, "rent")].' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'Using `selection_sort` from the example, this program sorts reversed lists of three sizes and prints the comparison count for each. What does it print?',
      code: {
        language: 'python',
        source: `for n in (4, 8, 16):
    items = list(range(n, 0, -1))
    print(n, selection_sort(items)[1])`,
      },
      choices: ['4 6\n8 28\n16 120', '4 4\n8 8\n16 16', '4 6\n8 12\n16 24', '4 16\n8 64\n16 256'],
      answer: '4 6\n8 28\n16 120',
      explanation: 'The inner loop runs n-1, then n-2, ... then 0 times: n(n-1)/2 comparisons, whatever the order of the items. 6, 28, 120: each doubling of n multiplies the count by roughly four. That is the signature of O(n²). (The reversed order only affects the swap count, not the comparisons.)',
    },
    {
      kind: 'predict',
      prompt: '`shared` counts how many amounts in `a` also appear in `b`, where both lists hold n items. If n doubles, by roughly what factor does the number of comparisons grow?',
      code: {
        language: 'python',
        source: `def shared(a, b):
    count = 0
    for x in a:
        if x in b:
            count += 1
    return count`,
      },
      choices: ['About 4 times: `x in b` scans the list, so this is a loop inside a loop', 'About 2 times: there is only one for loop', 'It stays the same: `in` is a single operation', 'About 8 times'],
      answer: 'About 4 times: `x in b` scans the list, so this is a loop inside a loop',
      explanation: '`x in b` on a **list** is a linear search hidden behind one keyword: up to n comparisons, done n times, so O(n²). Build `b_set = set(b)` once (O(n)) and test `x in b_set` (O(1)) and the whole function becomes O(n). Same output, different growth: this is the most common speed-up in everyday Python.',
    },
    {
      kind: 'modify',
      prompt: 'This program reads `amount category` lines from `entries.txt` and prints them sorted by category as `<category> <amount>`. Change the sort so that, within a category, the largest absolute amount comes first; rows with the same category and the same amount keep their file order. Use a single `sorted` call with a tuple key.',
      language: 'python',
      starter: `entries = []
with open("entries.txt") as f:
    for line in f:
        if line.strip():
            amount, category = line.split()
            entries.append((int(amount), category))

for amount, category in sorted(entries, key=lambda e: e[1]):
    print(f"{category} {amount}")
`,
      tests: [
        {
          description: 'three food rows ordered by absolute amount',
          files: { 'entries.txt': '-30 food\n2000 salary\n-120 food\n-800 rent\n-45 food\n' },
          expectedStdout: 'food -120\nfood -45\nfood -30\nrent -800\nsalary 2000',
        },
        {
          description: 'equal amounts keep file order (stable)',
          files: { 'entries.txt': '-20 travel\n-50 food\n-20 food\n-50 travel\n' },
          expectedStdout: 'food -50\nfood -20\ntravel -50\ntravel -20',
        },
        {
          description: 'income sorts by absolute size too',
          files: { 'entries.txt': '300 salary\n-10 food\n2000 salary\n' },
          expectedStdout: 'food -10\nsalary 2000\nsalary 300',
        },
      ],
      hint: 'The key should return `(category, -abs(amount))`: ascending by category, then descending by size. Because `sorted` is stable, rows whose keys tie stay in the order they were read.',
      solution: `entries = []
with open("entries.txt") as f:
    for line in f:
        if line.strip():
            amount, category = line.split()
            entries.append((int(amount), category))

for amount, category in sorted(entries, key=lambda e: (e[1], -abs(e[0]))):
    print(f"{category} {amount}")
`,
    },
    {
      kind: 'create',
      prompt: `Write a program that sorts the amounts in \`amounts.txt\` (one whole number per line) by hand and reports the work it took.

- Implement \`selection_sort(items)\` returning a new sorted list, the number of comparisons and the number of swaps. Count one comparison per \`items[j] < items[smallest]\` test and one swap each time the smallest item is not already in position \`i\`.
- Print \`Sorted: <amounts separated by spaces>\`, \`Comparisons: <n>\`, \`Swaps: <n>\`.
- Print \`Matches sorted(): yes\` if your result equals \`sorted(amounts)\`, otherwise \`no\`.
- Print \`Distinct: <n>\`, the number of different amounts, using a set.

The file always holds at least one amount.`,
      language: 'python',
      tests: [
        { description: 'four amounts: six comparisons, three swaps', files: { 'amounts.txt': '60\n-800\n250\n-120\n' }, expectedStdout: 'Sorted: -800 -120 60 250\nComparisons: 6\nSwaps: 3\nMatches sorted(): yes\nDistinct: 4' },
        { description: 'already sorted: comparisons but no swaps', files: { 'amounts.txt': '1\n2\n3\n' }, expectedStdout: 'Sorted: 1 2 3\nComparisons: 3\nSwaps: 0\nMatches sorted(): yes\nDistinct: 3' },
        { description: 'duplicates are not swapped with each other', files: { 'amounts.txt': '5\n5\n1\n' }, expectedStdout: 'Sorted: 1 5 5\nComparisons: 3\nSwaps: 1\nMatches sorted(): yes\nDistinct: 2' },
        { description: 'a single amount needs no work', files: { 'amounts.txt': '7\n' }, expectedStdout: 'Sorted: 7\nComparisons: 0\nSwaps: 0\nMatches sorted(): yes\nDistinct: 1' },
      ],
      hint: 'Copy the example\'s selection_sort. `len(set(amounts))` is the distinct count. Compare your list with `sorted(amounts)` using `==`.',
      solution: `def selection_sort(items):
    items = list(items)
    comparisons = 0
    swaps = 0
    for i in range(len(items)):
        smallest = i
        for j in range(i + 1, len(items)):
            comparisons += 1
            if items[j] < items[smallest]:
                smallest = j
        if smallest != i:
            items[i], items[smallest] = items[smallest], items[i]
            swaps += 1
    return items, comparisons, swaps

with open("amounts.txt") as f:
    amounts = [int(line) for line in f if line.strip()]

result, comparisons, swaps = selection_sort(amounts)
print("Sorted:", " ".join(str(a) for a in result))
print(f"Comparisons: {comparisons}")
print(f"Swaps: {swaps}")
print("Matches sorted():", "yes" if result == sorted(amounts) else "no")
print(f"Distinct: {len(set(amounts))}")
`,
      projectNote: 'You now know what `sorted` saves you and why a set beats a list for membership. From here on, the library does the sorting; you choose the key.',
    },
  ],
};

/* ---------------------------- 10-4 -------------------------------- */

const l104: Lesson = {
  id: 'py-10-4',
  title: 'Tools that encode algorithms',
  objective: 'Use heapq, lru_cache, bisect.insort and deque instead of hand-written loops, and predict what each saves.',
  minutes: 24,
  lexicon: [
    { id: 'py.10.nlargest', term: 'heapq.nlargest(k, items, key=...)', kind: 'builtin', meaning: 'The k largest items, biggest first, without sorting everything: O(n log k) instead of O(n log n). nsmallest is the mirror. With a dict, pass the dict for its keys and key=d.get to rank by value.', example: 'import heapq\ntotals = {"food": 195, "rent": 800, "travel": 60}\nheapq.nlargest(2, totals, key=totals.get)   # ["rent", "food"]' },
    { id: 'py.10.heappush-pop', term: 'heapq.heappush(q, item) / heapq.heappop(q)', kind: 'pattern', meaning: 'Treat a plain list as a priority queue: heappush adds an item and heappop removes the smallest, both in O(log n). Push (priority, name) tuples so the priority decides and the name breaks ties.', example: 'q = []\nheapq.heappush(q, (2, "pay rent"))\nheapq.heappush(q, (1, "buy food"))\nheapq.heappop(q)   # (1, "buy food")', analogy: 'A hospital waiting room: the most urgent case goes next regardless of arrival order. It breaks on inspection: you can peek at q[0], but the rest of the list is not in sorted order, so printing q shows a heap, not a queue.' },
    { id: 'py.10.lru-cache', term: '@functools.lru_cache(maxsize=None)', kind: 'pattern', meaning: 'A decorator that remembers the result for each set of arguments and returns it on repeat calls without running the body. On a recursive function with overlapping subproblems it turns exponential call counts into linear ones. Arguments must be hashable.', example: 'from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)' },
    { id: 'py.10.insort', term: 'bisect.insort(sorted_items, x)', kind: 'builtin', meaning: 'Insert x into an already sorted list at the position that keeps it sorted. It finds the spot by binary search but shifting the items after it is O(n), so it suits a list that grows by one item at a time.', example: 'from bisect import insort\namounts = [-800, -120, 60]\ninsort(amounts, 15)   # [-800, -120, 15, 60]' },
    { id: 'py.10.deque', term: 'collections.deque', kind: 'builtin', meaning: 'A double-ended queue: append and popleft are both O(1), where list.pop(0) is O(n) because every item shifts. With maxlen=k it keeps only the last k items added.', example: 'from collections import deque\nrecent = deque(maxlen=3)\nfor name in ["a", "b", "c", "d"]:\n    recent.append(name)\nlist(recent)   # ["b", "c", "d"]' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The standard library has already written the loop',
      body: `Everything in this module so far has a standard-library version that is faster, tested and shorter. Learn to recognise the **shape** of the problem and reach for the tool.

- Top k of many: \`heapq.nlargest\` and \`heapq.nsmallest\`, with \`key\` to rank dict entries by value. No need to sort all n items to find three.
- Always process the most urgent item next: a **priority queue**. \`heapq.heappush\` and \`heapq.heappop\` on a plain list, with \`(priority, name)\` tuples.
- A recursive function that recomputes the same subproblems: \`@lru_cache\`. \`fib(30)\` without it makes over a million calls; with it, 31.
- Keep a list sorted as items arrive: \`bisect.insort\`.
- A first-in, first-out queue, or "the last k things": \`collections.deque\`, whose \`popleft\` is O(1) where \`list.pop(0)\` shifts every item.

Each of these is an algorithm from this module, packaged. Knowing the growth rate underneath is what lets you choose correctly; the library then saves you the bugs.`,
      example: {
        language: 'python',
        source: `import heapq
from functools import lru_cache
from bisect import insort
from collections import deque

totals = {"food": 195, "rent": 800, "travel": 60, "gifts": 40}
print(heapq.nlargest(2, totals, key=totals.get))
print(heapq.nsmallest(1, totals.items(), key=lambda kv: kv[1]))

queue = []
heapq.heappush(queue, (2, "pay rent"))
heapq.heappush(queue, (1, "buy food"))
heapq.heappush(queue, (3, "book trip"))
print(heapq.heappop(queue))

calls = 0

@lru_cache(maxsize=None)
def fib(n):
    global calls
    calls += 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(30), calls)

amounts = [-800, -120, 60]
insort(amounts, 15)
print(amounts)

recent = deque(maxlen=3)
for name in ["a", "b", "c", "d"]:
    recent.append(name)
print(list(recent))`,
        labels: [
          { lines: [6, 8], label: 'Top-k by value: pass the dict (its keys) with key=totals.get, or its items with a lambda. Output: ["rent", "food"] then [("gifts", 40)].' },
          { lines: [10, 14], label: 'A priority queue on a plain list. The smallest tuple comes out first: (1, "buy food").' },
          { lines: [16, 26], label: 'Memoised recursion: each n is computed once and remembered. Output: 832040 31. Without the decorator the call count would be 2692537.' },
          { lines: [28, 30], label: 'Keep a sorted list sorted as one item arrives. Output: [-800, -120, 15, 60].' },
          { lines: [32, 35], label: 'A bounded queue: the oldest item falls off when the fourth arrives. Output: ["b", "c", "d"].' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'Both functions compute the same Fibonacci number and count how often they are called. What does the program print?',
      code: {
        language: 'python',
        source: `from functools import lru_cache

slow_calls = 0

def slow_fib(n):
    global slow_calls
    slow_calls += 1
    if n < 2:
        return n
    return slow_fib(n - 1) + slow_fib(n - 2)

fast_calls = 0

@lru_cache(maxsize=None)
def fast_fib(n):
    global fast_calls
    fast_calls += 1
    if n < 2:
        return n
    return fast_fib(n - 1) + fast_fib(n - 2)

print(slow_fib(10), slow_calls)
print(fast_fib(10), fast_calls)`,
      },
      choices: ['55 177\n55 11', '55 177\n55 177', '55 11\n55 11', '55 10\n55 1'],
      answer: '55 177\n55 11',
      explanation: '`slow_fib(10)` calls `slow_fib(9)` and `slow_fib(8)`, each of which calls two more: the tree has 177 calls, and it roughly doubles with each extra n (exponential). The cached version runs the body once per distinct argument, 0 through 10, so 11 calls; every other call is answered from the cache. The answer is 55 either way: the cache changes the count, not the result.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the priority queue so the program prints the tasks most urgent first (`1 buy food`, `2 pay rent`, `3 book trip`), then the two categories with the biggest totals (`["rent", "food"]`).',
      language: 'python',
      template: `import heapq

tasks = []
heapq.{{push}}(tasks, (2, "pay rent"))
heapq.{{push}}(tasks, (1, "buy food"))
heapq.{{push}}(tasks, (3, "book trip"))
while tasks:
    priority, name = heapq.{{pop}}(tasks)
    print(priority, name)

totals = {"food": 195, "rent": 800, "travel": 60}
print(heapq.{{top}}(2, totals, key=totals.get))`,
      blanks: [
        { id: 'push', answers: ['heappush'], hint: 'add an item to the heap' },
        { id: 'pop', answers: ['heappop'], hint: 'remove and return the smallest item' },
        { id: 'top', answers: ['nlargest'], hint: 'the k biggest, biggest first' },
      ],
      explanation: 'A heap always pops its smallest item, so a smaller number means more urgent. If two tasks shared a priority the name would break the tie, because tuples compare element by element.',
    },
    {
      kind: 'predict',
      prompt: 'What does this program print?',
      code: {
        language: 'python',
        source: `from collections import deque
from bisect import insort

queue = deque(["a", "b"])
queue.append("c")
first = queue.popleft()

amounts = [10, 30]
insort(amounts, 20)

print(first, list(queue), amounts)`,
      },
      choices: ["a ['b', 'c'] [10, 20, 30]", "c ['a', 'b'] [10, 20, 30]", "a ['b', 'c'] [10, 30, 20]", "b ['a', 'c'] [10, 20, 30]"],
      answer: "a ['b', 'c'] [10, 20, 30]",
      explanation: '`append` adds at the right, `popleft` removes from the left, so the deque is first-in, first-out: `a` leaves and `b`, `c` remain. `insort` places 20 between 10 and 30 instead of at the end, which is what `append` would have done.',
    },
    {
      kind: 'modify',
      prompt: 'This program totals expenses per category from `entries.txt` (`amount category` lines) and should print the three biggest categories as `<category>: <total>`, biggest first, then `Smallest: <category>`. It is wrong: `heapq.nlargest(3, totals)` ranks the category **names** alphabetically, not their totals. Fix the ranking with a `key`, and add the `Smallest` line using `heapq.nsmallest`. Totals in the fixtures are distinct.',
      language: 'python',
      starter: `import heapq

totals = {}
with open("entries.txt") as f:
    for line in f:
        if line.strip():
            amount, category = line.split()
            amount = int(amount)
            if amount < 0:
                totals[category] = totals.get(category, 0) - amount

for category in heapq.nlargest(3, totals):
    print(f"{category}: {totals[category]}")
`,
      tests: [
        {
          description: 'four expense categories, salary ignored',
          files: { 'entries.txt': '-30 food\n-800 rent\n-120 food\n2000 salary\n-60 travel\n-40 gifts\n' },
          expectedStdout: 'rent: 800\nfood: 150\ntravel: 60\nSmallest: gifts',
        },
        {
          description: 'two categories give two lines',
          files: { 'entries.txt': '-500 rent\n-25 food\n100 salary\n' },
          expectedStdout: 'rent: 500\nfood: 25\nSmallest: food',
        },
      ],
      hint: '`heapq.nlargest(3, totals, key=totals.get)` ranks keys by their values. `heapq.nsmallest(1, totals, key=totals.get)` returns a one-item list; print its `[0]`.',
      solution: `import heapq

totals = {}
with open("entries.txt") as f:
    for line in f:
        if line.strip():
            amount, category = line.split()
            amount = int(amount)
            if amount < 0:
                totals[category] = totals.get(category, 0) - amount

for category in heapq.nlargest(3, totals, key=totals.get):
    print(f"{category}: {totals[category]}")
print("Smallest:", heapq.nsmallest(1, totals, key=totals.get)[0])
`,
    },
    {
      kind: 'create',
      prompt: `Write a program that works through a to-do file in priority order.

- \`tasks.txt\` has one task per line: a whole-number priority, a space, then the task name (which may contain spaces). Lower numbers are more urgent.
- Push every task onto a heap as \`(priority, name)\`, then pop until it is empty, printing \`<priority> <name>\` per task. Tasks with equal priority come out in alphabetical order of name (the tuple does this for you).
- Keep a \`deque(maxlen=3)\` of the names in the order they were processed, and finish with \`Recent: <names joined by ", ">\` (fewer than three if there were fewer tasks).`,
      language: 'python',
      tests: [
        { description: 'four tasks, one tie on priority', files: { 'tasks.txt': '2 pay rent\n1 buy food\n3 book trip\n1 call bank\n' }, expectedStdout: '1 buy food\n1 call bank\n2 pay rent\n3 book trip\nRecent: call bank, pay rent, book trip' },
        { description: 'two tasks: Recent holds both', files: { 'tasks.txt': '5 water plants\n4 reply to Sam\n' }, expectedStdout: '4 reply to Sam\n5 water plants\nRecent: reply to Sam, water plants' },
        { description: 'priorities are numbers, not strings', files: { 'tasks.txt': '10 file taxes\n9 renew passport\n1 breathe\n' }, expectedStdout: '1 breathe\n9 renew passport\n10 file taxes\nRecent: breathe, renew passport, file taxes' },
      ],
      hint: 'Split each line with `line.split(maxsplit=1)` so the name keeps its spaces, and convert the priority with `int` before pushing, or 10 will sort before 9.',
      solution: `import heapq
from collections import deque

tasks = []
with open("tasks.txt") as f:
    for line in f:
        if line.strip():
            priority, name = line.split(maxsplit=1)
            heapq.heappush(tasks, (int(priority), name.strip()))

recent = deque(maxlen=3)
while tasks:
    priority, name = heapq.heappop(tasks)
    print(f"{priority} {name}")
    recent.append(name)
print("Recent:", ", ".join(recent))
`,
      projectNote: 'heapq picks the top entries without a full sort; in 10-5 it ranks the ledger\'s expense categories.',
    },
  ],
};

/* ---------------------------- 10-5 -------------------------------- */

const insightsSolution = `import csv
import heapq
import sys


def read_entries(path):
    with open(path, newline="") as f:
        rows = [(row["date"], int(row["amount"]), row["category"]) for row in csv.DictReader(f)]
    rows.sort(key=lambda row: row[0])
    return rows


def expense_totals(entries):
    totals = {}
    for date, amount, category in entries:
        if amount < 0:
            totals[category] = totals.get(category, 0) - amount
    return totals


def top_expenses(totals, k=3):
    items = sorted(totals.items())
    return heapq.nlargest(k, items, key=lambda item: item[1])


def lowest_balance(entries):
    balance = 0
    lowest = None
    for date, amount, category in entries:
        balance += amount
        if lowest is None or balance < lowest[0]:
            lowest = (balance, date)
    return lowest


def budget_exceeded_on(entries, budget):
    spent = 0
    for date, amount, category in entries:
        if amount < 0:
            spent -= amount
            if spent > budget:
                return date
    return None


def main():
    budget = int(sys.argv[1])
    entries = read_entries("entries.csv")
    for rank, (category, total) in enumerate(top_expenses(expense_totals(entries)), start=1):
        print(f"{rank}. {category} {total}")
    balance, date = lowest_balance(entries)
    print(f"Lowest balance: {balance} on {date}")
    date = budget_exceeded_on(entries, budget)
    if date is None:
        print("Within budget")
    else:
        print(f"Budget exceeded on {date}")


if __name__ == "__main__":
    main()
`;

const l105: Lesson = {
  id: 'py-10-5',
  title: 'Project: insights.py',
  objective: 'Build a tool that ranks expense categories, finds the lowest running balance and checks a budget from a CSV ledger.',
  minutes: 28,
  lexicon: [
    { id: 'py.10.sort-then-scan', term: 'sort first, then one pass', kind: 'concept', meaning: 'Many questions about a sequence (running totals, the first time a threshold is crossed) are only meaningful in order. Sort once, O(n log n), then answer with a single O(n) pass. Sorting inside the pass would be O(n² log n).', example: 'rows.sort(key=lambda row: row[0])   # by date, once\nfor date, amount, category in rows:\n    balance += amount' },
    { id: 'py.10.running-minimum', term: 'running minimum', kind: 'pattern', meaning: 'Track the best value seen so far and where it occurred, updating only on a strict improvement. Starting from None and comparing with < keeps the earliest position on ties.', example: 'lowest = None\nfor date, amount, category in entries:\n    balance += amount\n    if lowest is None or balance < lowest[0]:\n        lowest = (balance, date)' },
    { id: 'py.10.nlargest-items', term: 'heapq.nlargest(k, sorted(d.items()), key=lambda kv: kv[1])', kind: 'pattern', meaning: 'Top-k (name, total) pairs from a dict, ranked by total. Feeding the items in sorted order makes ties deterministic: nlargest keeps earlier items first when values are equal, so equal totals come out alphabetically.', example: 'totals = {"rent": 800, "food": 195, "travel": 60, "gifts": 40}\nheapq.nlargest(3, sorted(totals.items()), key=lambda kv: kv[1])\n# [("rent", 800), ("food", 195), ("travel", 60)]' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Three questions, one pass each',
      body: `\`insights.py\` reads \`entries.csv\` (\`date,amount,category\`, dates as \`YYYY-MM-DD\`) and an integer budget from \`argv[1]\`, and answers three questions. The rows may be in any order, so the first job is to **sort by date**; with this format, string order is date order, and the stable sort keeps same-date rows in file order.

The **contract**:

- Top expense categories by absolute total, biggest first, numbered: \`1. rent 800\`, \`2. food 195\`, \`3. travel 60\`. Fewer lines if fewer categories have expenses; none if there are no expenses. Equal totals: alphabetical first.
- \`Lowest balance: <n> on <date>\`: the running balance starts at 0 and is recorded after each row; report its minimum. On a tie, the earliest date.
- \`Budget exceeded on <date>\` for the first row where cumulative absolute expenses become **greater than** the budget, else \`Within budget\`. Equal is not exceeded.

Every helper is a plain function over the sorted list, so each is testable alone, as in Module 8.`,
      example: {
        language: 'python',
        source: insightsSolution.trimEnd(),
        labels: [
          { lines: [6, 10], label: 'Read with DictReader, convert the amount, then sort by date once. Everything below assumes date order.' },
          { lines: [13, 18], label: 'Absolute expense total per category. Subtracting a negative amount adds its size; incomes are skipped.' },
          { lines: [21, 23], label: 'Top three by total. The items go in alphabetically so that equal totals come out alphabetically.' },
          { lines: [26, 33], label: 'A running minimum: update only on a strict improvement, so the earliest date wins a tie.' },
          { lines: [36, 43], label: 'Cumulative expenses in date order; return the first date that goes over. None means it never did.' },
          { lines: [46, 57], label: 'Print the contract: numbered top list, the lowest balance line, then the budget verdict.' },
          { lines: [60, 61], label: 'The guard, so the helpers can be imported by tests.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'With `entries` already sorted by date as shown, what does `lowest_balance(entries)` return?',
      code: {
        language: 'python',
        source: `def lowest_balance(entries):
    balance = 0
    lowest = None
    for date, amount, category in entries:
        balance += amount
        if lowest is None or balance < lowest[0]:
            lowest = (balance, date)
    return lowest

entries = [
    ("2026-04-01", -100, "food"),
    ("2026-04-02", 100, "salary"),
    ("2026-04-03", -100, "food"),
    ("2026-04-04", 50, "salary"),
]
print(lowest_balance(entries))`,
      },
      choices: ["(-100, '2026-04-01')", "(-100, '2026-04-03')", "(-50, '2026-04-04')", "(0, '2026-04-02')"],
      answer: "(-100, '2026-04-01')",
      explanation: 'The balances after each row are -100, 0, -100, -50. The minimum, -100, occurs twice; because the update uses `<` and not `<=`, the second -100 does not replace the first, so the earliest date is kept. Swapping in `<=` would silently change the contract to "latest date".',
    },
    {
      kind: 'predict',
      prompt: 'Using `expense_totals` and `top_expenses` from the example, what does this print?',
      code: {
        language: 'python',
        source: `entries = [
    ("2026-05-01", 1000, "salary"),
    ("2026-05-02", -50, "travel"),
    ("2026-05-03", -50, "food"),
    ("2026-05-04", -50, "rent"),
    ("2026-05-05", -50, "gifts"),
]
for rank, (category, total) in enumerate(top_expenses(expense_totals(entries)), start=1):
    print(f"{rank}. {category} {total}")`,
      },
      choices: ['1. food 50\n2. gifts 50\n3. rent 50', '1. travel 50\n2. food 50\n3. rent 50', '1. salary 1000\n2. food 50\n3. gifts 50', '1. food 50\n2. gifts 50\n3. rent 50\n4. travel 50'],
      answer: '1. food 50\n2. gifts 50\n3. rent 50',
      explanation: 'Salary is income, so it never enters the totals. All four expense totals tie at 50, and `top_expenses` feeds `nlargest` the items in alphabetical order, so the tie resolves to food, gifts, rent, and travel is cut by `k=3`. Had the items gone in file order, travel would have come first: ties are where you must choose the rule on purpose.',
    },
    {
      kind: 'create',
      prompt: `Write \`insights.py\`. It reads \`entries.csv\` with columns \`date,amount,category\` (whole-number amounts, dates \`YYYY-MM-DD\`, rows in any order, at least one row) and an integer budget from \`argv[1]\`.

- Sort the rows by date first.
- Print the top three expense categories by absolute total, biggest first, as \`<rank>. <category> <total>\` using \`heapq.nlargest\`. Print fewer lines if fewer categories have expenses. Equal totals: alphabetical order.
- Print \`Lowest balance: <n> on <date>\`: the running balance from 0, recorded after each row in date order; on a tie, the earliest date.
- Print \`Budget exceeded on <date>\` for the first row at which cumulative absolute expenses exceed (are strictly greater than) the budget, otherwise \`Within budget\`.`,
      language: 'python',
      tests: [
        {
          description: 'sorted file, budget exceeded mid-month',
          argv: ['900'],
          files: { 'entries.csv': 'date,amount,category\n2026-01-01,2000,salary\n2026-01-03,-800,rent\n2026-01-05,-120,food\n2026-01-10,-60,travel\n2026-01-12,-75,food\n2026-01-20,-40,gifts\n' },
          expectedStdout: '1. rent 800\n2. food 195\n3. travel 60\nLowest balance: 905 on 2026-01-20\nBudget exceeded on 2026-01-05',
        },
        {
          description: 'unsorted dates must be sorted before the running balance',
          argv: ['400'],
          files: { 'entries.csv': 'date,amount,category\n2026-02-10,-50,food\n2026-02-01,-300,rent\n2026-02-03,500,salary\n2026-02-15,-20,travel\n' },
          expectedStdout: '1. rent 300\n2. food 50\n3. travel 20\nLowest balance: -300 on 2026-02-01\nWithin budget',
        },
        {
          description: 'no expenses: empty top list, lowest balance still printed',
          argv: ['100'],
          files: { 'entries.csv': 'date,amount,category\n2026-03-05,100,gift\n2026-03-01,2000,salary\n' },
          expectedStdout: 'Lowest balance: 2000 on 2026-03-01\nWithin budget',
        },
        {
          description: 'tied lowest balance reports the earliest date; one category; budget equal is not exceeded',
          argv: ['200'],
          files: { 'entries.csv': 'date,amount,category\n2026-04-01,-100,food\n2026-04-02,100,salary\n2026-04-03,-100,food\n2026-04-04,50,salary\n' },
          expectedStdout: '1. food 200\nLowest balance: -100 on 2026-04-01\nWithin budget',
        },
        {
          description: 'equal totals rank alphabetically; budget exceeded on the last day',
          argv: ['150'],
          files: { 'entries.csv': 'date,amount,category\n2026-05-01,1000,salary\n2026-05-02,-50,travel\n2026-05-03,-50,food\n2026-05-04,-50,rent\n2026-05-05,-50,gifts\n' },
          expectedStdout: '1. food 50\n2. gifts 50\n3. rent 50\nLowest balance: 800 on 2026-05-05\nBudget exceeded on 2026-05-05',
        },
        {
          description: 'a zero budget is exceeded by the first expense in date order',
          argv: ['0'],
          files: { 'entries.csv': 'date,amount,category\n2026-01-05,-120,food\n2026-01-01,2000,salary\n2026-01-03,-800,rent\n' },
          expectedStdout: '1. rent 800\n2. food 120\nLowest balance: 1080 on 2026-01-05\nBudget exceeded on 2026-01-03',
        },
      ],
      hint: 'Write the four helpers from the example in order and test each by printing its result before writing main. Sorting happens once, inside read_entries. For the top list, `sorted(totals.items())` before `nlargest` gives the alphabetical tie rule; `enumerate(..., start=1)` numbers the lines.',
      solution: insightsSolution,
      projectNote: 'insights.py completes the module: a sort, a top-k with heapq, a running minimum and a threshold scan, each chosen for how its work grows. The Ledger data model has carried you from print() to algorithm choice.',
    },
  ],
};

export const m10: Module = {
  id: 'py-m10',
  title: 'Algorithms and growth',
  goal: 'Recursion, searching and sorting, big-O intuition, heapq, lru_cache.',
  projectMilestone: 'insights.py: top-3 categories, lowest running balance, budget check from a CSV ledger.',
  status: 'available',
  lessons: [l101, l102, l103, l104, l105],
};
