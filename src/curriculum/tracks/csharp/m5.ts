import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 5: Errors, files and JSON                                   */
/* v0.5: LedgerSharp loads ledger.json, retries a bad amount, saves.  */
/* ------------------------------------------------------------------ */

/* ---------------------------- 5-1 --------------------------------- */

const exceptionsExample = `using System;

class Program
{
    static int ReadInt(string prompt)
    {
        while (true)
        {
            Console.WriteLine(prompt);
            string line = Console.ReadLine();
            try
            {
                return int.Parse(line);
            }
            catch (FormatException)
            {
                Console.WriteLine("Not a number, try again");
            }
        }
    }

    static void Main(string[] args)
    {
        int amount = ReadInt("Amount?");
        try
        {
            if (amount == 0)
            {
                throw new ArgumentException("amount must not be zero");
            }
            Console.WriteLine($"Recorded {amount}");
        }
        catch (ArgumentException e)
        {
            Console.WriteLine("Rejected: " + e.Message);
        }
        finally
        {
            Console.WriteLine("Done");
        }
    }
}`;

const retryStarter = `using System;

class Program
{
    static int ReadInt(string prompt)
    {
        Console.WriteLine(prompt);
        return int.Parse(Console.ReadLine());
    }

    static void Main(string[] args)
    {
        int amount = ReadInt("Amount?");
        Console.WriteLine($"Recorded {amount}");
    }
}
`;

const retrySolution = `using System;

class Program
{
    static int ReadInt(string prompt)
    {
        while (true)
        {
            Console.WriteLine(prompt);
            string line = Console.ReadLine();
            try
            {
                return int.Parse(line);
            }
            catch (FormatException)
            {
                Console.WriteLine("Not a number, try again");
            }
        }
    }

    static void Main(string[] args)
    {
        int amount = ReadInt("Amount?");
        Console.WriteLine($"Recorded {amount}");
    }
}
`;

const applySolution = `using System;

class Program
{
    static int ReadInt(string prompt)
    {
        while (true)
        {
            Console.WriteLine(prompt);
            int value;
            if (int.TryParse(Console.ReadLine(), out value))
            {
                return value;
            }
            Console.WriteLine("Not a number, try again");
        }
    }

    static int Apply(int balance, int amount)
    {
        if (balance + amount < 0)
        {
            throw new ArgumentException("insufficient funds");
        }
        return balance + amount;
    }

    static void Main(string[] args)
    {
        int balance = ReadInt("Balance?");
        Console.WriteLine("Amount (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            int amount;
            if (int.TryParse(line, out amount))
            {
                try
                {
                    balance = Apply(balance, amount);
                    Console.WriteLine($"Balance: {balance}");
                }
                catch (ArgumentException e)
                {
                    Console.WriteLine("Rejected: " + e.Message);
                }
            }
            else
            {
                Console.WriteLine("Not a number, try again");
            }
            Console.WriteLine("Amount (or quit)?");
            line = Console.ReadLine();
        }
        Console.WriteLine($"Final balance: {balance}");
    }
}
`;

const l51: Lesson = {
  id: 'cs-5-1',
  title: 'When a method cannot answer',
  objective: 'Catch the exception a failing conversion throws, throw your own with a message, and choose between TryParse and try/catch.',
  minutes: 22,
  lexicon: [
    { id: 'cs.5.try-catch', term: 'try { ... } catch (FormatException) { ... }', kind: 'keyword', meaning: 'Run the try block. If a statement inside throws an exception of the named type (or a subtype), skip the rest of the block and run the catch block instead; then carry on after both. Other exception types pass straight through.', example: 'try\n{\n    return int.Parse(line);\n}\ncatch (FormatException)\n{\n    Console.WriteLine("Not a number, try again");\n}', analogy: '"Try the door; if it is locked, use the window." It breaks because C# takes the window only for the kind of trouble you named: any other exception still stops the program.' },
    { id: 'cs.5.format-exception', term: 'FormatException', kind: 'builtin', meaning: 'The exception int.Parse throws when the text is not a whole number: letters, an empty line, a decimal point. Its Message says which string failed. Reading an exception type name tells you which catch would handle it.', example: 'int.Parse("12a");   // throws FormatException\nint.Parse("");      // throws FormatException too' },
    { id: 'cs.5.finally', term: 'finally { ... }', kind: 'keyword', meaning: 'A block after try/catch that runs whether the try block finished, threw and was caught, or threw and was not caught. Use it for clean-up that must happen either way.', example: 'try\n{\n    Work();\n}\nfinally\n{\n    Console.WriteLine("Done");\n}' },
    { id: 'cs.5.throw', term: 'throw new ArgumentException("...")', kind: 'keyword', meaning: 'Signal that this method cannot do its job. Execution leaves the method at once and climbs the call stack until a matching catch is found; with none, the program ends with the message. ArgumentException is the conventional type for a bad input value.', example: 'if (amount == 0)\n{\n    throw new ArgumentException("amount must not be zero");\n}' },
    { id: 'cs.5.tryparse', term: 'int.TryParse(text, out value)', kind: 'builtin', meaning: 'Convert without throwing: returns true and fills the out variable, or returns false and leaves it 0. Use it when a wrong answer is expected, such as user input; keep exceptions for the unexpected.', example: 'int amount;\nif (int.TryParse(line, out amount))\n{\n    Console.WriteLine(amount * 2);\n}', analogy: 'A yes/no question with the answer handed back in a second hand. It breaks because the second hand, the out variable, exists even when the answer is no, holding a 0 you must not trust.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Exceptions climb the stack until someone catches them',
      body: `Python taught you \`try\`/\`except ValueError\`. C# has the same machine with braces and different names: \`int.Parse("12a")\` **throws** a \`FormatException\`, which climbs the call stack, out of \`Parse\`, out of your method, until a \`catch\` for that type catches it. With none, the program ends and prints the exception. Name the type in every catch: \`catch (FormatException)\`. A bare \`catch\` would also swallow your own bugs.

\`finally\` runs whether or not anything was thrown. \`throw new ArgumentException("...")\` lets your own method refuse: the message travels with the object and \`e.Message\` reads it in the catch.

Exceptions cost time and interrupt the flow, so for input you *expect* to be wrong C# offers \`int.TryParse(line, out value)\`: it returns false instead of throwing. The rule: TryParse for the expected, exceptions for the exceptional. The retry loop below uses Parse to show the catch; the project will use TryParse.`,
      example: {
        language: 'csharp',
        source: exceptionsExample,
        labels: [
          { lines: [5, 10], label: 'A retry loop: ask, read, and only a return gets out.' },
          { lines: [11, 14], label: 'The risky statement sits in try. On success the return leaves the method.' },
          { lines: [15, 18], label: 'Only a FormatException lands here; the loop then asks again.' },
          { lines: [25, 31], label: 'A try around code that may refuse: zero is rejected by throwing, with a message.' },
          { lines: [33, 36], label: 'The thrown object arrives as `e`; its Message is the text given to the constructor.' },
          { lines: [37, 40], label: 'finally runs after either path: typing 0 prints Rejected then Done; typing 5 prints Recorded 5 then Done.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`except ValueError:` becomes `catch (FormatException)`, `raise ValueError("...")` becomes `throw new ArgumentException("...")`, and `except ValueError as e:` becomes `catch (ArgumentException e)`. `finally` is the same word. The new choice is TryParse: Python makes you catch; C# lets you ask first.' },
        { from: 'c', note: 'C has no exceptions: a function returns an error code and you must remember to check it. `int.TryParse` is that style done properly, with the bool as the return value and the number in an out parameter. `throw` is what you could not write in C: an error that cannot be ignored by forgetting to check.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The user types `12a`. What happens?',
      code: { language: 'csharp', source: 'Console.WriteLine("Amount?");\nint amount = int.Parse(Console.ReadLine());\nConsole.WriteLine($"Recorded {amount}");' },
      choices: ['The program ends with an unhandled FormatException after printing Amount?', 'Recorded 12', 'Recorded 0', 'A compile error: a string cannot be assigned to an int'],
      answer: 'The program ends with an unhandled FormatException after printing Amount?',
      explanation: '`int.Parse` accepts only a whole number, optionally signed. `12a` makes it throw a FormatException, and with no try/catch anywhere up the stack the program ends there. Parse never returns a partial result such as 12 or a default such as 0; that is what TryParse\'s false and 0 are for.',
    },
    {
      kind: 'predict',
      prompt: 'Which letters are printed, in order?',
      code: { language: 'csharp', source: 'try\n{\n    Console.WriteLine("a");\n    int n = int.Parse("x");\n    Console.WriteLine("b");\n}\ncatch (FormatException)\n{\n    Console.WriteLine("c");\n}\nfinally\n{\n    Console.WriteLine("d");\n}\nConsole.WriteLine("e");' },
      choices: ['a\nc\nd\ne', 'a\nb\nc\nd\ne', 'a\nc\ne', 'a\nd\ne'],
      answer: 'a\nc\nd\ne',
      explanation: '`a` prints, then Parse throws, so `b` is skipped. The catch matches FormatException and prints `c`. `finally` always runs, so `d`. The exception is handled, so execution continues after the whole statement with `e`.',
    },
    {
      kind: 'predict',
      prompt: 'The catch names a different type than the one thrown. What happens when the user types `abc`?',
      code: { language: 'csharp', source: 'try\n{\n    int n = int.Parse(Console.ReadLine());\n    Console.WriteLine(n);\n}\ncatch (ArgumentException)\n{\n    Console.WriteLine("bad input");\n}' },
      choices: ['The program ends with an unhandled FormatException', 'bad input', '0', 'A compile error: the catch type does not match'],
      answer: 'The program ends with an unhandled FormatException',
      explanation: 'A catch handles only its named type and that type\'s subtypes. FormatException is not an ArgumentException, so this catch is skipped and the exception keeps climbing until the runtime ends the program. The compiler cannot know what Parse will throw, so it does not warn you.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `ReadInt`: a retry loop that returns the first whole number typed and prints `Not a number, try again` for anything else. Set the indentation yourself.',
      language: 'csharp',
      indentation: true,
      solution: [
        'static int ReadInt(string prompt)',
        '{',
        '    while (true)',
        '    {',
        '        Console.WriteLine(prompt);',
        '        string line = Console.ReadLine();',
        '        try',
        '        {',
        '            return int.Parse(line);',
        '        }',
        '        catch (FormatException)',
        '        {',
        '            Console.WriteLine("Not a number, try again");',
        '        }',
        '    }',
        '}',
      ],
      distractors: ['        catch (ValueError)', '        except FormatException:', '            int.Parse(line);'],
      explanation: 'The type is C#\'s FormatException; ValueError is the Python name and does not exist here. The keyword is `catch` with the type in parentheses, not `except` with a colon. Without `return`, a successful Parse throws the number away and the loop asks forever.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the TryParse version of the retry loop and the refusing method.',
      language: 'csharp',
      template: `static int ReadInt(string prompt)
{
    while (true)
    {
        Console.WriteLine(prompt);
        int value;
        if (int.{{method}}(Console.ReadLine(), {{modifier}} value))
        {
            return value;
        }
        Console.WriteLine("Not a number, try again");
    }
}

static int Apply(int balance, int amount)
{
    if (balance + amount < 0)
    {
        {{raise}} new ArgumentException("insufficient funds");
    }
    return balance + amount;
}`,
      blanks: [
        { id: 'method', answers: ['TryParse'], hint: 'the conversion that answers true or false instead of throwing' },
        { id: 'modifier', answers: ['out'], hint: 'the keyword that lets the method fill your variable' },
        { id: 'raise', answers: ['throw'], hint: 'the C# word for raising an exception' },
      ],
      explanation: '`int.TryParse(text, out value)` returns false on bad text, so no catch is needed. `throw new ...` creates the exception object and starts it climbing.',
    },
    {
      kind: 'modify',
      prompt: 'This program ends with an unhandled exception the moment someone mistypes. Make `ReadInt` a retry loop: on a FormatException print `Not a number, try again` and ask again, until a whole number arrives.',
      language: 'csharp',
      starter: retryStarter,
      tests: [
        { description: 'a good answer first time', stdin: '12', expectedStdout: 'Amount?\nRecorded 12' },
        { description: 'letters, then a number', stdin: 'abc\n12', expectedStdout: 'Amount?\nNot a number, try again\nAmount?\nRecorded 12' },
        { description: 'an empty line and a decimal are not whole numbers', stdin: '\n2.5\n-7', expectedStdout: 'Amount?\nNot a number, try again\nAmount?\nNot a number, try again\nAmount?\nRecorded -7' },
      ],
      hint: 'Wrap only the `return int.Parse(...)` in try; put the message in `catch (FormatException)`; surround both with `while (true)`.',
      solution: retrySolution,
    },
    {
      kind: 'create',
      prompt: `Write a program with two static methods: \`ReadInt(string prompt)\`, a TryParse retry loop that prints \`Not a number, try again\` on bad input, and \`Apply(int balance, int amount)\`, which returns the new balance or throws \`new ArgumentException("insufficient funds")\` when the result would be negative.

In \`Main\`: read \`Balance?\` with ReadInt. Repeat \`Amount (or quit)?\`: on \`quit\` stop; if the line is not a whole number print \`Not a number, try again\`; otherwise call Apply inside a try and print \`Balance: <n>\`, or in the catch print \`Rejected: <message>\`. After quit print \`Final balance: <n>\`.`,
      language: 'csharp',
      tests: [
        { description: 'income then expense', stdin: '100\n50\n-30\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nBalance: 150\nAmount (or quit)?\nBalance: 120\nAmount (or quit)?\nFinal balance: 120' },
        { description: 'a refused expense leaves the balance alone', stdin: '20\n-50\n-20\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nRejected: insufficient funds\nAmount (or quit)?\nBalance: 0\nAmount (or quit)?\nFinal balance: 0' },
        { description: 'bad text at both prompts', stdin: 'ten\n10\nx\n5\nquit', expectedStdout: 'Balance?\nNot a number, try again\nBalance?\nAmount (or quit)?\nNot a number, try again\nAmount (or quit)?\nBalance: 15\nAmount (or quit)?\nFinal balance: 15' },
        { description: 'quit at once', stdin: '0\nquit', expectedStdout: 'Balance?\nAmount (or quit)?\nFinal balance: 0' },
      ],
      hint: 'In the loop, first test `line == "quit"` (the while condition), then `int.TryParse(line, out amount)`. Only the Apply call needs the try; the message comes from `e.Message`.',
      solution: applySolution,
      projectNote: 'LedgerSharp v0.5 gets exactly this: a TryParse retry at the amount prompt, so a typo no longer ends the session. The exception machinery is what the file and JSON lessons rely on next.',
    },
  ],
};

/* ---------------------------- 5-2 --------------------------------- */

const filesExample = `using System;
using System.IO;

class Program
{
    static void Main(string[] args)
    {
        string path = "notes.txt";
        using (var writer = new StreamWriter(path))
        {
            writer.WriteLine("rent paid");
            writer.WriteLine("food -30");
        }
        if (File.Exists(path))
        {
            string[] lines = File.ReadAllLines(path);
            Console.WriteLine($"Lines: {lines.Length}");
            Console.WriteLine(lines[1]);
        }
        File.WriteAllText(path, "reset\\n");
        Console.WriteLine(File.ReadAllText(path).Trim());
    }
}`;

const amountsFileStarter = `using System;
using System.Collections.Generic;
using System.IO;

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
        foreach (int amount in amounts)
        {
            File.WriteAllText("amounts.txt", amount + "\\n");
        }
        string[] lines = File.ReadAllLines("amounts.txt");
        Console.WriteLine($"Lines in file: {lines.Length}");
        int total = 0;
        foreach (string l in lines)
        {
            total = total + int.Parse(l);
        }
        Console.WriteLine($"Total from file: {total}");
    }
}
`;

const amountsFileSolution = `using System;
using System.Collections.Generic;
using System.IO;

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
        using (var writer = new StreamWriter("amounts.txt"))
        {
            foreach (int amount in amounts)
            {
                writer.WriteLine(amount);
            }
        }
        string[] lines = File.ReadAllLines("amounts.txt");
        Console.WriteLine($"Lines in file: {lines.Length}");
        int total = 0;
        foreach (string l in lines)
        {
            total = total + int.Parse(l);
        }
        Console.WriteLine($"Total from file: {total}");
    }
}
`;

const notesSolution = `using System;
using System.Collections.Generic;
using System.IO;

class Program
{
    static void Main(string[] args)
    {
        string path = "notes.txt";
        if (File.Exists(path))
        {
            Console.WriteLine($"Found {File.ReadAllLines(path).Length} old notes");
        }
        else
        {
            Console.WriteLine("No notes yet");
        }
        var notes = new List<string>();
        Console.WriteLine("Note (or quit)?");
        string line = Console.ReadLine();
        while (line != "quit")
        {
            notes.Add(line);
            Console.WriteLine("Note (or quit)?");
            line = Console.ReadLine();
        }
        using (var writer = new StreamWriter(path))
        {
            foreach (string note in notes)
            {
                writer.WriteLine(note);
            }
        }
        string[] saved = File.ReadAllLines(path);
        Console.WriteLine($"Saved {saved.Length} notes");
        for (int i = 0; i < saved.Length; i++)
        {
            Console.WriteLine($"{i + 1}. {saved[i]}");
        }
    }
}
`;

const l52: Lesson = {
  id: 'cs-5-2',
  title: 'Text that outlives the program',
  objective: 'Write and read text files with System.IO, test for a file before reading it, and release a writer with a using block.',
  minutes: 22,
  lexicon: [
    { id: 'cs.5.system-io', term: 'using System.IO;', kind: 'keyword', meaning: 'The namespace that holds File, StreamWriter, StreamReader, Directory and Path. Without this line at the top, `File` is an unknown name.', example: 'using System;\nusing System.IO;' },
    { id: 'cs.5.file-exists', term: 'File.Exists(path)', kind: 'builtin', meaning: 'True when a file is at that path right now. Reading a file that is not there throws FileNotFoundException, so ask first whenever absence is normal, such as the first run of a program.', example: 'if (!File.Exists("ledger.json"))\n{\n    Console.WriteLine("first run");\n}' },
    { id: 'cs.5.file-readall', term: 'File.ReadAllText(path) / File.ReadAllLines(path)', kind: 'builtin', meaning: 'Read a whole file in one call: as one string with its line breaks, or as a string[] with the line breaks removed. Both open and close the file for you.', example: 'string text = File.ReadAllText("notes.txt");\nstring[] lines = File.ReadAllLines("notes.txt");\nConsole.WriteLine(lines.Length);' },
    { id: 'cs.5.file-writealltext', term: 'File.WriteAllText(path, text)', kind: 'builtin', meaning: 'Create the file if needed, replace its entire contents with the text, close it. Calling it twice keeps only the second text; File.AppendAllText adds instead.', example: 'File.WriteAllText("notes.txt", "rent paid\\n");', analogy: 'Writing on a whiteboard after wiping it. It breaks for AppendAllText, which writes below whatever is already there.' },
    { id: 'cs.5.using-disposable', term: 'using (var writer = new StreamWriter(path)) { ... }', kind: 'pattern', meaning: 'Hold a resource for the block and release it at the closing brace, even if an exception leaves the block early. Works for any IDisposable, which is what a file handle, a network connection and a database connection all are. The writer\'s name exists only inside the block.', example: 'using (var writer = new StreamWriter("log.txt"))\n{\n    writer.WriteLine("rent paid");\n}', analogy: 'A library loan that returns itself when you leave the building, whatever happened inside. It breaks because `using` here is a statement; the `using System.IO;` at the top of the file is a different thing with the same word.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Open, write, release; or let File do it in one call',
      body: `Everything about files lives in \`System.IO\`, so that namespace goes at the top. For small files the \`File\` class does whole jobs in one call: \`File.WriteAllText\` creates or **replaces** a file, \`File.ReadAllText\` gives the whole text, \`File.ReadAllLines\` gives a \`string[]\` without the line breaks. Reading a file that does not exist throws, so \`File.Exists\` goes first whenever absence is normal.

When you write many lines, open a \`StreamWriter\` once instead. A writer holds an operating-system resource, so it must be released. The \`using\` **statement** does that: at the closing brace the writer is disposed, flushed and closed, even if an exception left the block early. Anything that is \`IDisposable\` works in a using block, and the variable exists only inside it.

Paths here are **relative**: \`"notes.txt"\` means in the working directory, the folder the program was started from.`,
      example: {
        language: 'csharp',
        source: filesExample,
        labels: [
          { lines: [2, 2], label: 'File and StreamWriter come from System.IO.' },
          { lines: [8, 8], label: 'A relative path: resolved against the working directory.' },
          { lines: [9, 13], label: 'Hold a writer for the block; the closing brace flushes and closes it, even on an exception.' },
          { lines: [14, 19], label: 'Ask before reading. ReadAllLines strips the line breaks: prints `Lines: 2` and `food -30`.' },
          { lines: [20, 21], label: 'WriteAllText replaces everything; the read-back prints `reset`.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`with open(path, "w") as f:` is `using (var writer = new StreamWriter(path))`: same guarantee, same scope rule. `f.write(s)` adds no newline, `writer.WriteLine(s)` does. `open(path).read()` is `File.ReadAllText(path)`; a missing file raises FileNotFoundError there and throws FileNotFoundException here.' },
        { from: 'c', note: 'fopen/fprintf/fclose, with fclose done for you by the closing brace of the using block, on every path out of it. There is no NULL check after opening: a path that cannot be opened throws instead.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'In an empty folder, what does this print?',
      code: { language: 'csharp', source: 'File.WriteAllText("a.txt", "one\\n");\nFile.WriteAllText("a.txt", "two\\n");\nConsole.WriteLine(File.ReadAllLines("a.txt").Length);\nConsole.WriteLine(File.ReadAllText("a.txt").Trim());' },
      choices: ['1\ntwo', '2\ntwo', '2\none', '1\none'],
      answer: '1\ntwo',
      explanation: 'WriteAllText replaces the whole file each time, so after the second call only `two` is there: one line. ReadAllText returns it with its line break, which Trim removes. To keep both lines you would use AppendAllText, or one StreamWriter for both.',
    },
    {
      kind: 'predict',
      prompt: 'The folder is empty: there is no `missing.txt`. What happens?',
      code: { language: 'csharp', source: 'Console.WriteLine(File.Exists("missing.txt"));\nstring text = File.ReadAllText("missing.txt");\nConsole.WriteLine(text.Length);' },
      choices: ['False, then the program ends with a FileNotFoundException', 'False\n0', 'False, then an empty file is created and 0 is printed', 'A compile error: the file does not exist'],
      answer: 'False, then the program ends with a FileNotFoundException',
      explanation: '`File.Exists` just answers the question: False. Reading does not create anything; `ReadAllText` on a missing file throws FileNotFoundException, and nothing catches it. Writing methods create files; reading methods never do. The compiler knows nothing about which files will exist at run time.',
    },
    {
      kind: 'predict',
      prompt: 'What happens when this is compiled?',
      code: { language: 'csharp', source: 'using (var writer = new StreamWriter("log.txt"))\n{\n    writer.WriteLine("rent paid");\n}\nwriter.WriteLine("food -30");' },
      choices: ['A compile error: the name writer does not exist after the block', 'Both lines end up in log.txt', 'The second WriteLine throws because the writer is closed', 'Only food -30 ends up in log.txt'],
      answer: 'A compile error: the name writer does not exist after the block',
      explanation: 'The variable declared in a using statement lives only inside its braces, exactly like a loop variable. After the closing brace the writer has been disposed and its name is gone, so the compiler rejects the last line. That scope rule is what guarantees nobody writes to a closed file.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a program fragment that writes one line to `log.txt` through a StreamWriter and reads it back. Set the indentation yourself.',
      language: 'csharp',
      indentation: true,
      solution: [
        'using (var writer = new StreamWriter("log.txt"))',
        '{',
        '    writer.WriteLine("rent paid");',
        '}',
        'string text = File.ReadAllText("log.txt");',
        'Console.WriteLine(text.Trim());',
      ],
      distractors: ['using (var writer = new StreamWriter("log.txt"));', 'with (var writer = new StreamWriter("log.txt"))', 'string text = File.ReadAllLines("log.txt");'],
      explanation: 'A semicolon after the using header ends the statement at once: the writer is disposed before the block, and the WriteLine inside then refers to a name that does not exist. `with` is Python; the C# keyword is `using`. ReadAllLines returns a string[], which cannot be assigned to a string.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the namespace, the existence check and the two whole-file calls.',
      language: 'csharp',
      template: `using System;
using System.{{ns}};

class Program
{
    static void Main(string[] args)
    {
        string path = "balance.txt";
        if (!File.{{exists}}(path))
        {
            File.{{write}}(path, "0\\n");
        }
        string[] lines = File.{{readlines}}(path);
        Console.WriteLine(lines[0]);
    }
}`,
      blanks: [
        { id: 'ns', answers: ['IO'], hint: 'the namespace that holds File' },
        { id: 'exists', answers: ['Exists'], hint: 'the question to ask before reading' },
        { id: 'write', answers: ['WriteAllText'], hint: 'create or replace the file with one string' },
        { id: 'readlines', answers: ['ReadAllLines'], hint: 'the call that returns a string[]' },
      ],
      explanation: 'System.IO, File.Exists before reading, WriteAllText to create the file on the first run, ReadAllLines for an array of lines.',
    },
    {
      kind: 'modify',
      prompt: 'The program should save every amount to `amounts.txt`, one per line, then read the file back. It saves only the last one. Fix the writing so that all amounts end up in the file. Use one StreamWriter in a using block.',
      language: 'csharp',
      starter: amountsFileStarter,
      tests: [
        { description: 'three amounts', stdin: '10\n-3\n5\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nAmount (or quit)?\nLines in file: 3\nTotal from file: 12' },
        { description: 'one amount', stdin: '-40\nquit', expectedStdout: 'Amount (or quit)?\nAmount (or quit)?\nLines in file: 1\nTotal from file: -40' },
        { description: 'no amounts gives an empty file', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nLines in file: 0\nTotal from file: 0' },
      ],
      hint: 'WriteAllText replaces the file on every call. Open `new StreamWriter("amounts.txt")` once, before the foreach, and call `writer.WriteLine(amount)` inside it.',
      solution: amountsFileSolution,
    },
    {
      kind: 'create',
      prompt: `Write a notes program over \`notes.txt\` in the working directory:

- At start, if the file exists print \`Found <k> old notes\` (k = its number of lines); otherwise print \`No notes yet\`.
- Repeat \`Note (or quit)?\` and collect each line until \`quit\`.
- Write the collected notes to \`notes.txt\` through a StreamWriter, replacing the old contents.
- Read the file back with ReadAllLines and print \`Saved <n> notes\`, then one line \`<i>. <note>\` per saved note, numbered from 1.`,
      language: 'csharp',
      tests: [
        { description: 'no file, two notes', stdin: 'rent paid\nfood -30\nquit', expectedStdout: 'No notes yet\nNote (or quit)?\nNote (or quit)?\nNote (or quit)?\nSaved 2 notes\n1. rent paid\n2. food -30' },
        { description: 'an old file is replaced', files: { 'notes.txt': 'old one\nold two\nold three\n' }, stdin: 'new\nquit', expectedStdout: 'Found 3 old notes\nNote (or quit)?\nNote (or quit)?\nSaved 1 notes\n1. new' },
        { description: 'quit at once empties the file', files: { 'notes.txt': 'old one\n' }, stdin: 'quit', expectedStdout: 'Found 1 old notes\nNote (or quit)?\nSaved 0 notes' },
      ],
      hint: 'File.Exists, then ReadAllLines(...).Length for the count. Collect into a List<string>, write them in a using block, then ReadAllLines again and a counted for loop for the numbering.',
      solution: notesSolution,
      projectNote: 'Check-then-read at start, write-then-read-back at the end: this is the shape of LedgerSharp v0.5\'s persistence. The next lesson replaces the plain lines with JSON so that entries keep their structure.',
    },
  ],
};

/* ---------------------------- 5-3 --------------------------------- */

const jsonExample = `using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

class Entry
{
    public int Amount { get; set; }
    public string Category { get; set; }

    public Entry() { }

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
        var entries = new List<Entry>();
        entries.Add(new Entry(-30, "food"));
        entries.Add(new Entry(50, "salary"));
        var options = new JsonSerializerOptions { WriteIndented = true };
        string json = JsonSerializer.Serialize(entries, options);
        File.WriteAllText("ledger.json", json);
        string text = File.ReadAllText("ledger.json");
        List<Entry> restored = JsonSerializer.Deserialize<List<Entry>>(text);
        Console.WriteLine($"Restored {restored.Count} entries");
        Console.WriteLine($"{restored[0].Category}: {restored[0].Amount}");
    }
}`;

const jsonRoundTripStarter = `using System;
using System.Collections.Generic;
using System.Text.Json;

class Entry
{
    public int Amount;
    public string Category;

    public Entry() { }

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
        var entries = new List<Entry>();
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
        }
        string json = JsonSerializer.Serialize(entries);
        Console.WriteLine(json);
        List<Entry> restored = JsonSerializer.Deserialize<List<Entry>>(json);
        int total = 0;
        foreach (Entry e in restored)
        {
            total = total + e.Amount;
        }
        Console.WriteLine($"Restored {restored.Count} entries");
        Console.WriteLine($"Balance: {total}");
    }
}
`;

const jsonRoundTripSolution = jsonRoundTripStarter.replace('    public int Amount;\n    public string Category;', '    public int Amount { get; set; }\n    public string Category { get; set; }');

const jsonSaveSolution = `using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;

class Entry
{
    public int Amount { get; set; }
    public string Category { get; set; }

    public Entry() { }

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
        var entries = new List<Entry>();
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
        }
        var options = new JsonSerializerOptions { WriteIndented = true };
        File.WriteAllText("ledger.json", JsonSerializer.Serialize(entries, options));
        Console.WriteLine($"Saved {entries.Count} entries");
        string text = File.ReadAllText("ledger.json");
        Console.WriteLine(text);
        List<Entry> restored = JsonSerializer.Deserialize<List<Entry>>(text);
        int total = 0;
        foreach (Entry e in restored)
        {
            total = total + e.Amount;
        }
        Console.WriteLine($"Restored {restored.Count} entries");
        Console.WriteLine($"Balance: {total}");
    }
}
`;

const l53: Lesson = {
  id: 'cs-5-3',
  title: 'Saving structure with JSON',
  objective: 'Serialize a list of objects to JSON text with System.Text.Json, read it back into typed objects, and shape a class so the serializer can see it.',
  minutes: 22,
  lexicon: [
    { id: 'cs.5.system-text-json', term: 'using System.Text.Json;', kind: 'keyword', meaning: 'The namespace of the built-in JSON library: JsonSerializer, JsonSerializerOptions and JsonException. Part of .NET since Core 3.0; no package to install.', example: 'using System.Text.Json;' },
    { id: 'cs.5.serialize', term: 'JsonSerializer.Serialize(value)', kind: 'builtin', meaning: 'Turn an object, list or dictionary into JSON text. Each public property with a getter becomes a "Name": value pair, spelled exactly as the property is; a List becomes an array.', example: 'JsonSerializer.Serialize(new Entry(-30, "food"))\n// {"Amount":-30,"Category":"food"}' },
    { id: 'cs.5.deserialize', term: 'JsonSerializer.Deserialize<List<Entry>>(text)', kind: 'builtin', meaning: 'Parse JSON text into the type named in the angle brackets. The serializer makes each object with its parameterless constructor and sets each public property whose name matches a key exactly; keys with no matching property are ignored, and properties with no key keep their default.', example: 'List<Entry> entries = JsonSerializer.Deserialize<List<Entry>>(text);', analogy: 'Translating into a shared language and back. It breaks because the way back needs a form to fill: the type you name decides what is kept, and anything the form has no box for is dropped.' },
    { id: 'cs.5.json-options', term: 'new JsonSerializerOptions { WriteIndented = true }', kind: 'pattern', meaning: 'Settings passed as a second argument to Serialize. WriteIndented puts each value on its own line with two-space indentation, so the file is readable in an editor; the default is one long line.', example: 'var options = new JsonSerializerOptions { WriteIndented = true };\nFile.WriteAllText("ledger.json", JsonSerializer.Serialize(entries, options));' },
    { id: 'cs.5.serializable-class', term: 'serializable class', kind: 'concept', meaning: 'A class the serializer can both write and read: public properties with get and set (fields are skipped), and a public parameterless constructor. Keep a second constructor for your own code; the serializer ignores it.', example: 'class Entry\n{\n    public int Amount { get; set; }\n    public string Category { get; set; }\n    public Entry() { }\n    public Entry(int amount, string category) { Amount = amount; Category = category; }\n}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Properties out, properties in',
      body: `A text file of lines loses structure: which number belonged to which category? JSON keeps it, and .NET reads and writes JSON with \`System.Text.Json\`. \`JsonSerializer.Serialize(entries)\` walks every **public property** of each object and writes \`"Amount": -30\`, using the property's exact name. A \`List<Entry>\` becomes a JSON array. Pass \`new JsonSerializerOptions { WriteIndented = true }\` and the output is laid out one value per line.

\`JsonSerializer.Deserialize<List<Entry>>(text)\` is the way back. The type in the angle brackets is the form to fill: for each object the serializer calls the **parameterless constructor**, then **sets** each property whose name matches a key. So a class the serializer can read needs \`{ get; set; }\` on its properties and a \`public Entry() { }\`. Module 3's getter-only Entry has to give that up; the second constructor stays for your own code.

Fields are skipped, and key names are matched exactly: \`"amount"\` does not fill \`Amount\`. That is why LedgerSharp's file uses \`Amount\` and \`Category\`, capitalised.`,
      example: {
        language: 'csharp',
        source: jsonExample,
        labels: [
          { lines: [4, 4], label: 'JsonSerializer lives here.' },
          { lines: [6, 18], label: 'A serializable Entry: get and set on both properties, a parameterless constructor, and the convenient constructor kept.' },
          { lines: [24, 26], label: 'Two objects in a list: the value to save.' },
          { lines: [27, 29], label: 'List to indented JSON text to file. The text starts `[`, then `{`, then `"Amount": -30`.' },
          { lines: [30, 31], label: 'File to text to typed objects: the angle brackets say what to build.' },
          { lines: [32, 33], label: 'The objects are real Entry instances again: prints `Restored 2 entries` and `food: -30`.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`json.dumps(list_of_dicts)` becomes `JsonSerializer.Serialize(list_of_objects)`: the dict keys were whatever you typed; here they are the property names. `json.loads` gave you dicts to index with strings; `Deserialize<List<Entry>>` gives you typed objects, which is why you must name the type. The Python ledger file used lowercase keys; this one uses the C# property names.' },
        { from: 'c', note: 'In C you wrote the file format yourself, byte by byte with fprintf and fscanf. The serializer uses the type information that C threw away at compile time: it can see the names and types of the properties at run time, so you describe the shape once, as a class.' },
      ],
    },
    {
      kind: 'predict',
      prompt: '`Amount` is declared as a field here, not a property. What text is printed?',
      code: { language: 'csharp', source: 'class Entry\n{\n    public int Amount;\n    public string Category { get; set; }\n}\n\n// in Main:\nvar e = new Entry();\ne.Amount = -30;\ne.Category = "food";\nConsole.WriteLine(JsonSerializer.Serialize(e));' },
      choices: ['{"Category":"food"}', '{"Amount":-30,"Category":"food"}', '{"Amount":0,"Category":"food"}', 'A compile error: fields cannot be serialized'],
      answer: '{"Category":"food"}',
      explanation: 'By default System.Text.Json looks only at public **properties**. `Amount` is a field, so it is skipped silently: no error, no zero, just absent. Give it `{ get; set; }` and it appears. This is the most common reason a saved file is missing a value.',
    },
    {
      kind: 'predict',
      prompt: 'The file was written by the Python ledger, with lowercase keys. `Entry` is the serializable class from the example. What is printed?',
      code: { language: 'csharp', source: 'string text = "[{\\"amount\\": -20, \\"category\\": \\"food\\"}]";\nList<Entry> entries = JsonSerializer.Deserialize<List<Entry>>(text);\nConsole.WriteLine(entries.Count);\nConsole.WriteLine(entries[0].Amount);\nConsole.WriteLine(entries[0].Category == null);' },
      choices: ['1\n0\nTrue', '1\n-20\nFalse', '0', 'The program ends with a JsonException'],
      answer: '1\n0\nTrue',
      explanation: 'The array has one object, so one Entry is built with the parameterless constructor. Key matching is case-sensitive by default: `amount` is not `Amount`, so neither property is set and both keep their defaults, 0 and null. No exception, because unknown keys are simply ignored. The file for LedgerSharp therefore spells the keys `Amount` and `Category`.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the body of `Main`: save a list of entries to `ledger.json` with indentation, then read the file back into a list and print how many entries came back. Set the indentation yourself; `entries` already exists.',
      language: 'csharp',
      indentation: true,
      solution: [
        'var options = new JsonSerializerOptions { WriteIndented = true };',
        'string json = JsonSerializer.Serialize(entries, options);',
        'File.WriteAllText("ledger.json", json);',
        'string text = File.ReadAllText("ledger.json");',
        'List<Entry> restored = JsonSerializer.Deserialize<List<Entry>>(text);',
        'Console.WriteLine($"Restored {restored.Count} entries");',
      ],
      distractors: ['List<Entry> restored = JsonSerializer.Deserialize(text);', 'string json = JsonSerializer.Serialize(options, entries);', 'string text = File.ReadAllLines("ledger.json");'],
      explanation: 'Deserialize needs the target type in angle brackets; without it the compiler cannot know what to build. Serialize takes the value first and the options second. ReadAllLines gives a string[], and the serializer wants the whole text as one string.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the serializable class and the round trip.',
      language: 'csharp',
      template: `class Entry
{
    public int Amount {{prop}}
    public string Category { get; set; }

    public Entry() { }
}

// in Main:
var options = new JsonSerializerOptions { {{indent}} = true };
string json = JsonSerializer.{{write}}(entries, options);
List<Entry> restored = JsonSerializer.{{read}}<List<Entry>>(json);`,
      blanks: [
        { id: 'prop', answers: ['{ get; set; }', '{get; set;}', '{ get; set;}', '{get;set;}'], hint: 'the serializer must be able to set it as well as read it' },
        { id: 'indent', answers: ['WriteIndented'], hint: 'the option that lays the JSON out one value per line' },
        { id: 'write', answers: ['Serialize'], hint: 'object to text' },
        { id: 'read', answers: ['Deserialize'], hint: 'text to object' },
      ],
      explanation: 'A settable property, WriteIndented for readable files, Serialize out and Deserialize<T> back in.',
    },
    {
      kind: 'modify',
      prompt: 'The round trip loses everything: the JSON printed is `[{},{}]` and the restored balance is 0. The program is right; the `Entry` class is not shaped for the serializer. Fix the class so that `Amount` and `Category` are written and read.',
      language: 'csharp',
      starter: jsonRoundTripStarter,
      tests: [
        { description: 'two entries round trip', stdin: '-30\nfood\n50\nsalary\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\n[{"Amount":-30,"Category":"food"},{"Amount":50,"Category":"salary"}]\nRestored 2 entries\nBalance: 20' },
        { description: 'one entry', stdin: '-5\nbus\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\n[{"Amount":-5,"Category":"bus"}]\nRestored 1 entries\nBalance: -5' },
        { description: 'no entries', stdin: 'quit', expectedStdout: 'Amount (or quit)?\n[]\nRestored 0 entries\nBalance: 0' },
      ],
      hint: 'The serializer sees public properties, not public fields. Add `{ get; set; }` to both declarations; nothing else changes.',
      solution: jsonRoundTripSolution,
    },
    {
      kind: 'create',
      prompt: `Write a program with the serializable \`Entry\` class. Repeat \`Amount (or quit)?\` and \`Category?\` to collect entries. After quit:

- Save the list to \`ledger.json\` with \`WriteIndented = true\` and print \`Saved <n> entries\`.
- Read the file back as text and print that text exactly as it is in the file.
- Deserialize it into a \`List<Entry>\` and print \`Restored <n> entries\` and \`Balance: <sum of amounts>\`.`,
      language: 'csharp',
      tests: [
        { description: 'two entries', stdin: '-30\nfood\n50\nsalary\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nSaved 2 entries\n[\n  {\n    "Amount": -30,\n    "Category": "food"\n  },\n  {\n    "Amount": 50,\n    "Category": "salary"\n  }\n]\nRestored 2 entries\nBalance: 20' },
        { description: 'one entry', stdin: '7\ntips\nquit', expectedStdout: 'Amount (or quit)?\nCategory?\nAmount (or quit)?\nSaved 1 entries\n[\n  {\n    "Amount": 7,\n    "Category": "tips"\n  }\n]\nRestored 1 entries\nBalance: 7' },
        { description: 'no entries is an empty array', stdin: 'quit', expectedStdout: 'Amount (or quit)?\nSaved 0 entries\n[]\nRestored 0 entries\nBalance: 0' },
      ],
      hint: 'Serialize with the options object, WriteAllText, then ReadAllText and print the string as is: the indentation and the `"Amount": -30` spacing come from the serializer. Deserialize<List<Entry>> for the restore.',
      solution: jsonSaveSolution,
      projectNote: 'This is the file format of LedgerSharp from v0.5 to v1.0: a JSON array of objects with `Amount` and `Category`. The next lesson wraps save and load in a Storage class that survives a missing or broken file.',
    },
  ],
};

/* ---------------------------- 5-4 --------------------------------- */

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

const storageClass = `class Storage
{
    public static List<Entry> Load(string path)
    {
        if (!File.Exists(path))
        {
            return new List<Entry>();
        }
        try
        {
            List<Entry> entries = JsonSerializer.Deserialize<List<Entry>>(File.ReadAllText(path));
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
}`;

const storageUsings = `using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

`;

const storageExample = `${storageUsings}${entryClass}

${storageClass}

class Program
{
    static void Main(string[] args)
    {
        List<Entry> entries = Storage.Load("ledger.json");
        Console.WriteLine($"Loaded {entries.Count} entries");
        entries.Add(new Entry(-5, "bus"));
        Storage.Save("ledger.json", entries);
        Console.WriteLine($"Saved {entries.Count} entries");
    }
}`;

const naiveStorageStarter = `${storageUsings}${entryClass}

class Storage
{
    public static List<Entry> Load(string path)
    {
        return JsonSerializer.Deserialize<List<Entry>>(File.ReadAllText(path));
    }
}

class Program
{
    static void Main(string[] args)
    {
        List<Entry> entries = Storage.Load("ledger.json");
        Console.WriteLine($"Loaded {entries.Count} entries");
        int total = 0;
        foreach (Entry e in entries)
        {
            total = total + e.Amount;
        }
        Console.WriteLine($"Balance: {total}");
    }
}
`;

const defensiveStorageSolution = `${storageUsings}${entryClass}

class Storage
{
    public static List<Entry> Load(string path)
    {
        if (!File.Exists(path))
        {
            return new List<Entry>();
        }
        try
        {
            List<Entry> entries = JsonSerializer.Deserialize<List<Entry>>(File.ReadAllText(path));
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
}

class Program
{
    static void Main(string[] args)
    {
        List<Entry> entries = Storage.Load("ledger.json");
        Console.WriteLine($"Loaded {entries.Count} entries");
        int total = 0;
        foreach (Entry e in entries)
        {
            total = total + e.Amount;
        }
        Console.WriteLine($"Balance: {total}");
    }
}
`;

const storageCreateSolution = `${storageUsings}${entryClass}

${storageClass}

class Program
{
    static void Main(string[] args)
    {
        string path = "ledger.json";
        List<Entry> entries = Storage.Load(path);
        Console.WriteLine($"Loaded {entries.Count} entries");
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
        }
        Storage.Save(path, entries);
        Console.WriteLine($"Saved {entries.Count} entries");
        List<Entry> again = Storage.Load(path);
        int total = 0;
        foreach (Entry e in again)
        {
            total = total + e.Amount;
        }
        Console.WriteLine($"Reloaded {again.Count} entries");
        Console.WriteLine($"Balance: {total}");
    }
}
`;

const l54: Lesson = {
  id: 'cs-5-4',
  title: 'Loading what might not be there',
  objective: 'Build a Storage class whose Load tolerates a missing file, a broken file and incomplete entries, and whose Save writes the whole list.',
  minutes: 22,
  lexicon: [
    { id: 'cs.5.json-exception', term: 'JsonException', kind: 'builtin', meaning: 'Thrown by Deserialize when the text is not valid JSON or a value has the wrong type for its property, such as a string where an int belongs. Catch exactly this type around a load; a missing file is a different problem with a different answer.', example: 'try\n{\n    entries = JsonSerializer.Deserialize<List<Entry>>(text);\n}\ncatch (JsonException)\n{\n    entries = new List<Entry>();\n}' },
    { id: 'cs.5.load-or-empty', term: 'load or start empty', kind: 'pattern', meaning: 'Check File.Exists first and return an empty list when there is no file. The first run and every later run then share one code path, and nobody has to create the file by hand.', example: 'if (!File.Exists(path))\n{\n    return new List<Entry>();\n}' },
    { id: 'cs.5.validate-after-load', term: 'validate after loading', kind: 'concept', meaning: 'Deserialized data is still input: a key can be missing, leaving a property null or 0, and the array itself can be the word null. Drop or reject what does not meet your rules before the rest of the program trusts it.', example: 'if (entries == null) return new List<Entry>();\nreturn entries.Where(e => e != null && !string.IsNullOrEmpty(e.Category)).ToList();' },
    { id: 'cs.5.storage-class', term: 'class Storage { Load(path); Save(path, entries) }', kind: 'pattern', meaning: 'One class that owns every line touching the file: a Load that always returns a usable list and a Save that writes the whole list. The rest of the program never mentions File or JsonSerializer.', example: 'List<Entry> entries = Storage.Load("ledger.json");\nStorage.Save("ledger.json", entries);', analogy: 'A clerk who fetches and files the folder for you: ask for the folder and you get one, even if it had to be a new empty one. It breaks because a clerk would tell you the old folder was ruined; this Load quietly starts fresh, which is fine for a ledger of a few entries and wrong for data you cannot retype.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Three ways a load can go wrong',
      body: `A program that reads its own file meets three situations that are not bugs. **No file**: the first run. \`File.Exists\` is false, and the right answer is an empty list, not an exception. **A broken file**: someone edited it by hand, or a crash cut it short. \`Deserialize\` throws a \`JsonException\`, which you catch and answer with an empty list. **A file that parses but lies**: the text \`null\` deserializes to a null list; an object without \`"Category"\` gives an entry whose Category is null. Check for both after loading, because the serializer cannot know your rules.

Put all of this in one place: a \`Storage\` class with \`Load(path)\` that always returns a usable \`List<Entry>\` and \`Save(path, entries)\` that writes the whole list, indented. Everything else in the program talks to Storage and never to File or JsonSerializer. Keep Load pure about output: it returns, it does not print, so Main decides what the user sees.`,
      example: {
        language: 'csharp',
        source: storageExample,
        labels: [
          { lines: [3, 5], label: 'IO for the file, Linq for Where, Text.Json for the serializer.' },
          { lines: [7, 19], label: 'The serializable Entry from the previous lesson.' },
          { lines: [23, 28], label: 'No file is the first run: an empty list, no exception.' },
          { lines: [29, 36], label: 'Parse inside a try. A null list (the text was `null`) and entries without a category are filtered out.' },
          { lines: [38, 41], label: 'Broken text throws JsonException; the answer is again an empty list.' },
          { lines: [44, 48], label: 'Save replaces the whole file with the indented array.' },
          { lines: [55, 59], label: 'Main never touches File: it loads, announces, changes the list, saves. Prints `Loaded 0 entries` then `Saved 1 entries` in an empty folder.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Python v0.6 caught FileNotFoundError around open. C# asks File.Exists first and reserves the catch for JsonException, the equivalent of json.JSONDecodeError. The null checks are new: json.load gave you dicts you indexed, and a missing key raised KeyError; here a missing key leaves a default behind, silently, so you must look.' },
        { from: 'c', note: 'This is the defensive checking you did after every fopen and fscanf, moved into one method. The difference is that the serializer already rejected malformed text for you; what remains is checking the shape of what parsed.' },
      ],
    },
    {
      kind: 'predict',
      prompt: '`ledger.json` contains the text below, a file cut short mid-write. Using the `Storage` class from the example, what does `Main` print?',
      code: { language: 'text', source: '[{"Amount": -20, "Category": "food"}, {"Amount": 5' },
      choices: ['Loaded 0 entries\nSaved 1 entries', 'Loaded 1 entries\nSaved 2 entries', 'The program ends with a JsonException', 'Loaded 2 entries\nSaved 3 entries'],
      answer: 'Loaded 0 entries\nSaved 1 entries',
      explanation: 'The text is not valid JSON, so Deserialize throws a JsonException before producing anything; there is no partial result with the one good entry. The catch returns an empty list, Main announces 0, adds the bus entry and saves 1. Note that Save then overwrites the broken file: acceptable here, worth a backup in a real program.',
    },
    {
      kind: 'predict',
      prompt: '`ledger.json` is valid JSON but the first object has no `Category` key. What does `Main` print?',
      code: { language: 'text', source: '[{"Amount": 5}, {"Amount": -3, "Category": "food"}]' },
      choices: ['Loaded 1 entries\nSaved 2 entries', 'Loaded 2 entries\nSaved 3 entries', 'The program ends with a JsonException', 'Loaded 0 entries\nSaved 1 entries'],
      answer: 'Loaded 1 entries\nSaved 2 entries',
      explanation: 'The text parses, so no exception: the serializer builds two entries and simply leaves the first one\'s Category null. The Where in Load drops it, so one entry survives. Without that filter the ledger would later print a category line with an empty name.',
    },
    {
      kind: 'predict',
      prompt: 'The folder is empty: no `ledger.json` at all. What does `Main` print?',
      code: { language: 'csharp', source: 'List<Entry> entries = Storage.Load("ledger.json");\nConsole.WriteLine($"Loaded {entries.Count} entries");\nentries.Add(new Entry(-5, "bus"));\nStorage.Save("ledger.json", entries);\nConsole.WriteLine($"Saved {entries.Count} entries");' },
      choices: ['Loaded 0 entries\nSaved 1 entries', 'The program ends with a FileNotFoundException', 'The program ends with a JsonException', 'Loaded 0 entries, then Save fails because the file does not exist'],
      answer: 'Loaded 0 entries\nSaved 1 entries',
      explanation: 'Load checks File.Exists before reading, so the missing file is the first-run case and returns an empty list. Save uses WriteAllText, which creates the file. After this run the folder holds a ledger.json with one entry, and the next run prints `Loaded 1 entries`.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble `Storage.Load` (first line indented 4 spaces): empty list when the file is missing, empty list when the JSON is broken, otherwise the parsed list.',
      language: 'csharp',
      indentation: true,
      solution: [
        '    public static List<Entry> Load(string path)',
        '    {',
        '        if (!File.Exists(path))',
        '        {',
        '            return new List<Entry>();',
        '        }',
        '        try',
        '        {',
        '            return JsonSerializer.Deserialize<List<Entry>>(File.ReadAllText(path));',
        '        }',
        '        catch (JsonException)',
        '        {',
        '            return new List<Entry>();',
        '        }',
        '    }',
      ],
      distractors: ['        catch (FileNotFoundException)', '            return null;', '        if (File.Exists(path))'],
      explanation: 'The Exists check already handles the missing file, so the catch is for JsonException, the one Deserialize throws. Returning null pushes the problem to every caller, which would then crash on `.Count`. The condition is negated: return early when the file is **not** there.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the defensive Load.',
      language: 'csharp',
      template: `public static List<Entry> Load(string path)
{
    if (!File.{{exists}}(path))
    {
        return new List<Entry>();
    }
    try
    {
        List<Entry> entries = JsonSerializer.Deserialize<List<Entry>>(File.ReadAllText(path));
        if (entries == {{nothing}})
        {
            return new List<Entry>();
        }
        return entries.Where(e => e != null && !string.IsNullOrEmpty(e.Category)).ToList();
    }
    catch ({{type}})
    {
        return new List<Entry>();
    }
}`,
      blanks: [
        { id: 'exists', answers: ['Exists'], hint: 'the question that makes the first run safe' },
        { id: 'nothing', answers: ['null'], hint: 'what Deserialize returns for the text `null`' },
        { id: 'type', answers: ['JsonException'], hint: 'the exception Deserialize throws for broken text' },
      ],
      explanation: 'Exists before reading, a null check after parsing, and JsonException as the only type caught.',
    },
    {
      kind: 'modify',
      prompt: 'This `Storage.Load` works only on a perfect file. Make it defensive: a missing file and a broken file both give an empty list, a `null` list becomes empty, and entries without a category are dropped. `Main` must not change.',
      language: 'csharp',
      starter: naiveStorageStarter,
      tests: [
        { description: 'no file', expectedStdout: 'Loaded 0 entries\nBalance: 0' },
        { description: 'a good file', files: { 'ledger.json': '[{"Amount": -20, "Category": "food"}, {"Amount": 50, "Category": "salary"}]' }, expectedStdout: 'Loaded 2 entries\nBalance: 30' },
        { description: 'a broken file', files: { 'ledger.json': '[{"Amount": -20, "Category": "food"}, {"Amount": 5' }, expectedStdout: 'Loaded 0 entries\nBalance: 0' },
        { description: 'an entry without a category is dropped', files: { 'ledger.json': '[{"Amount": 999}, {"Amount": -3, "Category": "food"}]' }, expectedStdout: 'Loaded 1 entries\nBalance: -3' },
        { description: 'the text null', files: { 'ledger.json': 'null' }, expectedStdout: 'Loaded 0 entries\nBalance: 0' },
      ],
      hint: 'Four pieces, in this order: `if (!File.Exists(path)) return new List<Entry>();`, a try around Deserialize, `if (entries == null)`, a `Where(...).ToList()` on the category, and `catch (JsonException)`.',
      solution: defensiveStorageSolution,
    },
    {
      kind: 'create',
      prompt: `Write the serializable \`Entry\`, the full \`Storage\` class (\`Load(path)\` defensive as in this lesson, \`Save(path, entries)\` indented) and a \`Main\` that:

- loads \`ledger.json\` and prints \`Loaded <k> entries\`;
- repeats \`Amount (or quit)?\` and \`Category?\`, adding each entry to the loaded list;
- after quit saves the list and prints \`Saved <n> entries\`;
- loads the file again, fresh, and prints \`Reloaded <n> entries\` and \`Balance: <sum of amounts>\`.`,
      language: 'csharp',
      tests: [
        { description: 'no file, two new entries', stdin: '-30\nfood\n50\nsalary\nquit', expectedStdout: 'Loaded 0 entries\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nSaved 2 entries\nReloaded 2 entries\nBalance: 20' },
        { description: 'an existing file plus one entry', files: { 'ledger.json': '[{"Amount": -20, "Category": "food"}]' }, stdin: '100\nsalary\nquit', expectedStdout: 'Loaded 1 entries\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nSaved 2 entries\nReloaded 2 entries\nBalance: 80' },
        { description: 'a broken file is replaced', files: { 'ledger.json': '{not json' }, stdin: '5\ntips\nquit', expectedStdout: 'Loaded 0 entries\nAmount (or quit)?\nCategory?\nAmount (or quit)?\nSaved 1 entries\nReloaded 1 entries\nBalance: 5' },
        { description: 'quit at once keeps the old entries', files: { 'ledger.json': '[{"Amount": -20, "Category": "food"}, {"Amount": 7, "Category": "tips"}]' }, stdin: 'quit', expectedStdout: 'Loaded 2 entries\nAmount (or quit)?\nSaved 2 entries\nReloaded 2 entries\nBalance: -13' },
      ],
      hint: 'Copy Storage from the concept step. Main is: Load, announce, the Module 3 loop adding to the same list, Save, announce, Load again into a second variable and sum it.',
      solution: storageCreateSolution,
      projectNote: 'Storage is complete and will not change until Module 6 makes it an interface. LedgerSharp v0.5 drops it in front of the v0.4 program and adds the TryParse retry from lesson 5-1.',
    },
  ],
};

/* ---------------------------- 5-5 --------------------------------- */

const LEDGER_V05 = `using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

class Entry
{
    public int Amount { get; set; }
    public string Category { get; set; }

    public Entry() { }

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
}

class Storage
{
    public static List<Entry> Load(string path)
    {
        if (!File.Exists(path))
        {
            return new List<Entry>();
        }
        try
        {
            List<Entry> entries = JsonSerializer.Deserialize<List<Entry>>(File.ReadAllText(path));
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

    static string TopLine(Ledger ledger)
    {
        string top = ledger.TopCategory();
        if (top == null)
        {
            return "Top: none";
        }
        return $"Top: {top} {ledger.ByCategory()[top]}";
    }

    static void Main(string[] args)
    {
        List<Entry> loaded = Storage.Load(Path);
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
    }
}
`;

const v05Starter = LEDGER_V05.replace(/class Storage[\s\S]*?\n}\n\nclass Program/, `class Storage
{
    // TODO: Load(path): empty list for a missing or broken file, entries without a category dropped
    // TODO: Save(path, entries): the indented JSON array
}

class Program`).replace(/    static void Main\(string\[\] args\)\n    \{[\s\S]*\n    \}\n\}\n$/, `    static void Main(string[] args)
    {
        // TODO: load and announce, ask Balance?, build the ledger with the loaded entries
        // TODO: the amount loop: quit | top | a whole number | Not a number, try again
        // TODO: save and announce, then the summary
    }
}
`);

const l55: Lesson = {
  id: 'cs-5-5',
  title: 'Project: LedgerSharp v0.5',
  objective: 'Make LedgerSharp remember its entries in ledger.json between runs and survive a mistyped amount.',
  minutes: 24,
  lexicon: [
    { id: 'cs.5.load-announce-save', term: 'load at start, save at quit', kind: 'pattern', meaning: 'Read the file before anything else happens and tell the user how many entries came back; write everything back once, when the user is done, and say how many went out. In between, work only with the objects in memory.', example: 'List<Entry> loaded = Storage.Load(Path);\nConsole.WriteLine($"Loaded {loaded.Count} entries");\n...\nStorage.Save(Path, ledger.Entries);\nConsole.WriteLine($"Saved {ledger.Count} entries");' },
    { id: 'cs.5.command-or-number', term: 'word, number, or neither', kind: 'pattern', meaning: 'At one prompt, test the special words first (quit, top), then try the number with TryParse, and treat anything else as a typo to report and re-ask. The order matters: a word is never a number, but testing the number first would make the message fire for every command.', example: 'if (line == "top") { ... }\nelse if (int.TryParse(line, out amount)) { ... }\nelse { Console.WriteLine("Not a number, try again"); }' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The plan for v0.5',
      body: `LedgerSharp v0.4 forgot everything at exit and ended with an exception on a typo. v0.5 keeps the same \`Entry\`, \`Ledger\` and transcript and adds four things, one per lesson of this module:

- \`Storage.Load\` reads \`ledger.json\` if it is there, defensively (5-4); the program prints \`Loaded <k> entries\` before \`Balance?\`.
- \`Entry\` is the serializable version, with setters and a parameterless constructor (5-3).
- At the amount prompt, \`int.TryParse\` decides: a number is an entry, \`top\` and \`quit\` are commands, anything else prints \`Not a number, try again\` and the prompt repeats without asking for a category (5-1).
- On quit \`Storage.Save\` writes every entry, loaded and new, and the program prints \`Saved <n> entries\` before \`--- summary ---\` (5-2, 5-4).

The starting balance is the \`Balance?\` answer; the loaded entries are added to the ledger after it is built, so \`Final balance\` includes them. Read the labels: they are the plan.`,
      example: {
        language: 'csharp',
        source: LEDGER_V05.trimEnd(),
        labels: [
          { lines: [7, 19], label: 'Entry, now serializable: get and set, and a parameterless constructor beside the useful one.' },
          { lines: [21, 44], label: 'Ledger state and commands, as in v0.4. Entries hands out a copy so Storage can save without reaching inside.' },
          { lines: [46, 66], label: 'The v0.4 queries by LINQ: Balance, totals per category, the category with the most negative total or null.' },
          { lines: [69, 95], label: 'Storage from lesson 5-4: Load never throws and never returns null; Save writes the indented array.' },
          { lines: [101, 101], label: 'One relative path, named once.' },
          { lines: [103, 111], label: 'The top command of v0.4, formatted by a helper so the loop stays readable.' },
          { lines: [115, 123], label: 'Load and announce before Balance?; then build the ledger and add every loaded entry.' },
          { lines: [124, 128], label: 'The sentinel loop. The out variable is declared once, before the chain.' },
          { lines: [129, 132], label: 'A command word is tested before any conversion is tried.' },
          { lines: [133, 143], label: 'A number is an entry; anything else is reported and the prompt repeats. No Category? after a typo.' },
          { lines: [147, 148], label: 'Save everything and announce, before the summary.' },
          { lines: [149, 155], label: 'The v0.4 summary: categories sorted, count, final balance.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'This is Python Ledger v0.6 with C# names: load_entries became Storage.Load, the retry in read_amount became an else branch after TryParse, and the records became Entry objects again on the way in. The one visible difference is the file: the keys are `Amount` and `Category`, so the two programs do not share a ledger.json.' },
      ],
    },
    {
      kind: 'predict',
      prompt: '`ledger.json` holds `[{"Amount": -20, "Category": "food"}]`. The user types `100`, then `quit`. What does the program print, in full?',
      code: { language: 'csharp', source: LEDGER_V05.trimEnd() },
      choices: [
        'Loaded 1 entries\nBalance?\nAmount (or quit)?\nSaved 1 entries\n--- summary ---\nfood: -20\nEntries: 1\nFinal balance: 80',
        'Loaded 1 entries\nBalance?\nAmount (or quit)?\nSaved 1 entries\n--- summary ---\nfood: -20\nEntries: 1\nFinal balance: 100',
        'Loaded 1 entries\nBalance?\nAmount (or quit)?\nSaved 0 entries\n--- summary ---\nEntries: 0\nFinal balance: 80',
        'Loaded 0 entries\nBalance?\nAmount (or quit)?\nSaved 0 entries\n--- summary ---\nEntries: 0\nFinal balance: 100',
      ],
      answer: 'Loaded 1 entries\nBalance?\nAmount (or quit)?\nSaved 1 entries\n--- summary ---\nfood: -20\nEntries: 1\nFinal balance: 80',
      explanation: 'One entry is loaded and announced before Balance?. It is added to the ledger, so the balance is 100 - 20 = 80 before any new entry. quit adds nothing, but the loaded entry is still in the ledger: it is saved again (Saved 1 entries), summarized and counted.',
    },
    {
      kind: 'predict',
      prompt: 'No file. The user types `50`, `abc`, `-30`, `food`, `top`, `quit`. Which lines appear between the first `Amount (or quit)?` and `Saved 1 entries`?',
      code: { language: 'csharp', source: 'int amount;\nif (line == "top")\n{\n    Console.WriteLine(TopLine(ledger));\n}\nelse if (int.TryParse(line, out amount))\n{\n    Console.WriteLine("Category?");\n    string category = Console.ReadLine();\n    ledger.Add(new Entry(amount, category));\n    Console.WriteLine($"Balance: {ledger.Balance}");\n}\nelse\n{\n    Console.WriteLine("Not a number, try again");\n}\nConsole.WriteLine("Amount (or quit)?");\nline = Console.ReadLine();' },
      choices: [
        'Not a number, try again\nAmount (or quit)?\nCategory?\nBalance: 20\nAmount (or quit)?\nTop: food -30\nAmount (or quit)?',
        'Not a number, try again\nCategory?\nBalance: 20\nAmount (or quit)?\nTop: food -30\nAmount (or quit)?',
        'Not a number, try again\nAmount (or quit)?\nCategory?\nBalance: 20\nAmount (or quit)?\nTop: none\nAmount (or quit)?',
        'Category?\nBalance: 20\nAmount (or quit)?\nTop: food -30\nAmount (or quit)?',
      ],
      answer: 'Not a number, try again\nAmount (or quit)?\nCategory?\nBalance: 20\nAmount (or quit)?\nTop: food -30\nAmount (or quit)?',
      explanation: '`abc` fails TryParse: the message prints and the prompt repeats at the bottom of the loop, with no Category?. `-30` is a number: Category?, then Balance: 50 - 30 = 20. `top` finds one expense category, food at -30. Every round ends with the prompt, so quit is read by the last one.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the body of the amount loop (first line indented 12 spaces, inside `while (line != "quit")`): commands first, then the number, then the complaint, then the re-prompt.',
      language: 'csharp',
      indentation: true,
      solution: [
        '            int amount;',
        '            if (line == "top")',
        '            {',
        '                Console.WriteLine(TopLine(ledger));',
        '            }',
        '            else if (int.TryParse(line, out amount))',
        '            {',
        '                Console.WriteLine("Category?");',
        '                string category = Console.ReadLine();',
        '                ledger.Add(new Entry(amount, category));',
        '                Console.WriteLine($"Balance: {ledger.Balance}");',
        '            }',
        '            else',
        '            {',
        '                Console.WriteLine("Not a number, try again");',
        '            }',
        '            Console.WriteLine("Amount (or quit)?");',
        '            line = Console.ReadLine();',
      ],
      distractors: ['            else if (int.Parse(line) != 0)', '            else if (int.TryParse(line, amount))', '            int amount = int.Parse(line);'],
      explanation: 'Parse would throw on the typo you are trying to handle; TryParse is the whole point of the branch. TryParse fills its second argument, so it must be passed with `out`; without it the call does not compile. Declaring the amount with Parse before the chain would crash on `top` as well as on a typo. TopLine is the helper from the concept step.',
    },
    {
      kind: 'create',
      prompt: `Write LedgerSharp v0.5. \`Entry\` and \`Ledger\` are given. Write \`Storage\` (defensive \`Load\`, indented \`Save\`) and \`Main\`:

- Load \`ledger.json\` and print \`Loaded <k> entries\`. Then print \`Balance?\` and read the starting balance; build the ledger and add every loaded entry.
- Repeat \`Amount (or quit)?\`. \`quit\` stops. \`top\` prints \`Top: <category> <total>\` for the most negative category total, or \`Top: none\`. A whole number prints \`Category?\`, reads it, adds the entry and prints \`Balance: <running>\`. Anything else prints \`Not a number, try again\`. After each of these the prompt repeats.
- After quit save all entries, print \`Saved <n> entries\`, then \`--- summary ---\`, one \`<category>: <total>\` line per category sorted by name, \`Entries: <n>\`, \`Final balance: <n>\`.`,
      language: 'csharp',
      starter: v05Starter,
      tests: [
        { description: 'no file, quit immediately', stdin: '100\nquit', expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nSaved 0 entries\n--- summary ---\nEntries: 0\nFinal balance: 100' },
        { description: 'two saved entries plus one new', files: { 'ledger.json': '[{"Amount": -20, "Category": "food"}, {"Amount": 50, "Category": "salary"}]' }, stdin: '100\n-10\nfood\nquit', expectedStdout: 'Loaded 2 entries\nBalance?\nAmount (or quit)?\nCategory?\nBalance: 120\nAmount (or quit)?\nSaved 3 entries\n--- summary ---\nfood: -30\nsalary: 50\nEntries: 3\nFinal balance: 120' },
        { description: 'a bad amount, then a good one', stdin: '50\nabc\n25\ntips\nquit', expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nNot a number, try again\nAmount (or quit)?\nCategory?\nBalance: 75\nAmount (or quit)?\nSaved 1 entries\n--- summary ---\ntips: 25\nEntries: 1\nFinal balance: 75' },
        { description: 'top with and without expenses', stdin: '0\ntop\n-30\nfood\n50\nsalary\n-5\nbus\ntop\nquit', expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nTop: none\nAmount (or quit)?\nCategory?\nBalance: -30\nAmount (or quit)?\nCategory?\nBalance: 20\nAmount (or quit)?\nCategory?\nBalance: 15\nAmount (or quit)?\nTop: food -30\nAmount (or quit)?\nSaved 3 entries\n--- summary ---\nbus: -5\nfood: -30\nsalary: 50\nEntries: 3\nFinal balance: 15' },
        { description: 'a saved entry counts toward the balance and the top', files: { 'ledger.json': '[{"Amount": -20, "Category": "food"}]' }, stdin: '100\ntop\nquit', expectedStdout: 'Loaded 1 entries\nBalance?\nAmount (or quit)?\nTop: food -20\nAmount (or quit)?\nSaved 1 entries\n--- summary ---\nfood: -20\nEntries: 1\nFinal balance: 80' },
        { description: 'a broken file is treated as empty and replaced', files: { 'ledger.json': '[{"Amount": -20, "Category": "food"' }, stdin: '10\n-4\nbus\nquit', expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nCategory?\nBalance: 6\nAmount (or quit)?\nSaved 1 entries\n--- summary ---\nbus: -4\nEntries: 1\nFinal balance: 6' },
        { description: 'the v0.4 transcript, with no file', stdin: '100\n-30\nfood\n50\nsalary\n-10\nfood\nquit', expectedStdout: 'Loaded 0 entries\nBalance?\nAmount (or quit)?\nCategory?\nBalance: 70\nAmount (or quit)?\nCategory?\nBalance: 120\nAmount (or quit)?\nCategory?\nBalance: 110\nAmount (or quit)?\nSaved 3 entries\n--- summary ---\nfood: -40\nsalary: 50\nEntries: 3\nFinal balance: 110' },
      ],
      hint: 'Start from the labels in the concept step and run the tests after each chunk. The Loaded line comes before Balance?; the Saved line comes before the summary; the prompt is printed once at the bottom of the loop whatever branch ran.',
      solution: LEDGER_V05,
      projectNote: 'LedgerSharp v0.5 complete: entries survive between runs in ledger.json, and a mistyped amount is asked again instead of ending the program. Module 6 proves the Ledger with a self-test, reads the file asynchronously, and puts an interface in front of Storage.',
    },
  ],
};

export const m5: Module = {
  id: 'cs-m5',
  title: 'Errors, files and JSON',
  goal: 'Exceptions (try/catch/finally, throw, TryParse), System.IO and the using statement, System.Text.Json serialization, defensive loading behind a Storage class.',
  projectMilestone: 'LedgerSharp v0.5: persistence with validation.',
  status: 'available',
  lessons: [l51, l52, l53, l54, l55],
};
