import type { Lesson, Module } from '../../schema';

/* ------------------------------------------------------------------ */
/* Module 7: A web API                                                */
/* v1.0: a command-line LedgerSharp that runs in the app, plus the    */
/* HTTP/ASP.NET Core layer taught by reading and by fieldwork.        */
/* ------------------------------------------------------------------ */

/* ---------------------------- 7-1 --------------------------------- */

const verbsSolution = `using System;

class Program
{
    static int Usage()
    {
        Console.Error.WriteLine("Usage: apply <balance> <amount> | classify <amount>");
        return 1;
    }

    static string Classify(int amount)
    {
        if (amount < 0) return "expense";
        if (amount == 0) return "nothing";
        return "income";
    }

    static int Main(string[] args)
    {
        if (args.Length == 0) return Usage();
        switch (args[0])
        {
            case "apply":
                int balance, amount;
                if (args.Length != 3 || !int.TryParse(args[1], out balance) || !int.TryParse(args[2], out amount)) return Usage();
                Console.WriteLine("Balance: " + (balance + amount));
                return 0;
            case "classify":
                int n;
                if (args.Length != 2 || !int.TryParse(args[1], out n)) return Usage();
                Console.WriteLine(Classify(n));
                return 0;
            default:
                return Usage();
        }
    }
}`;

const l71: Lesson = {
  id: 'cs-7-1',
  title: 'Command-line verbs',
  objective: 'Turn a console program into a command-line tool that dispatches on a verb in args, validates numbers, and signals failure with an exit code.',
  minutes: 25,
  lexicon: [
    { id: 'cs.7.args', term: 'string[] args', kind: 'pattern', meaning: 'The words typed after the program name, each one a string. args[0] is the first real argument; there is no slot for the program\'s own name.', example: '// Program add 50 food\n// args = { "add", "50", "food" }\nConsole.WriteLine(args.Length);   // 3', analogy: 'The arguments of a sentence after the verb. The analogy breaks because the shell, not your program, decides where the words are split: quotes keep "weekly food" together as one argument.' },
    { id: 'cs.7.int-main', term: 'static int Main(string[] args)', kind: 'pattern', meaning: 'An entry point whose return value becomes the process exit code. 0 means success; any other number means failure, and shells and scripts read it.', example: 'static int Main(string[] args)\n{\n    if (args.Length == 0) return 1;\n    return 0;\n}' },
    { id: 'cs.7.console-error', term: 'Console.Error.WriteLine(...)', kind: 'builtin', meaning: 'Write to standard error, the second output stream. Usage lines and complaints go here so that standard output holds only results that other programs can consume.', example: 'Console.Error.WriteLine("Usage: add <amount> <category>");' },
    { id: 'cs.7.working-directory', term: 'working directory', kind: 'concept', meaning: 'The folder the shell was in when it started the program. Every relative path, such as "ledger.json", is resolved against it, so the same program sees different files from different folders.', example: 'Console.WriteLine(Directory.GetCurrentDirectory());', analogy: 'The desk you are sitting at: "the red folder" means the one on this desk. It breaks for absolute paths, which name the drawer and the building explicitly.' },
    { id: 'cs.7.environment', term: 'Environment.GetEnvironmentVariable("NAME")', kind: 'builtin', meaning: 'Read one variable from the environment the process inherited from its shell (HOME, PATH, a connection string). Returns null when it is not set.', example: 'var home = Environment.GetEnvironmentVariable("HOME");' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The program is told, not asked',
      body: `Until now LedgerSharp asked questions. Real tools are **told** what to do in one line: \`Program add 50 food\`. Everything after the program name arrives in \`args\`, a \`string[]\`; \`args[0]\` is the first word you typed, and every element is text until you convert it.

Three habits make a command-line program trustworthy. **Dispatch** on the verb with a \`switch\` on \`args[0]\`. **Convert** with \`int.TryParse\`, never \`int.Parse\`, because a user can type anything. When the input is wrong, **complain on the right channel**: print a usage line to \`Console.Error\` and \`return 1\` from \`static int Main\`. The exit code tells the shell that the command failed, while standard output stays clean for the result.

The program runs in a **working directory**, the folder the shell was in. A relative path such as \`ledger.json\` means "in that folder". \`Environment.GetEnvironmentVariable\` reads the surrounding environment the same way.`,
      example: {
        language: 'csharp',
        source: verbsSolution,
        labels: [
          { lines: [5, 9], label: 'One place for every complaint: the usage line goes to standard error and the method hands back the failure exit code.' },
          { lines: [11, 16], label: 'A pure method, unchanged from Module 2. Nothing about the command line leaks into it.' },
          { lines: [18, 18], label: 'int, not void: what Main returns is what the shell sees as the exit code.' },
          { lines: [20, 20], label: 'No verb at all is a usage error, not a crash on args[0].' },
          { lines: [21, 22], label: 'Dispatch on the verb. Each case is one command the tool understands.' },
          { lines: [23, 27], label: 'apply: check the argument count, convert both numbers safely, then print the result on standard output.' },
          { lines: [28, 32], label: 'classify: the same shape with one number. The method does the thinking; the case does the parsing.' },
          { lines: [33, 34], label: 'An unknown verb is also a usage error.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'In Python sys.argv[0] was the script path and the real arguments began at index 1; argparse did the converting and exited with code 2 on bad input. Here args has no program-name slot, and you choose the conversion (TryParse) and the exit code (return 1) yourself.' },
        { from: 'c', note: 'C gave you argc and argv with argv[0] as the program name. C# gives one array with its own Length and without that first slot, so the C habit of starting at argv[1] produces an off-by-one here.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The program is started as `Program add 50 food`. What does it print?',
      code: { language: 'csharp', source: 'static void Main(string[] args)\n{\n    Console.WriteLine(args.Length);\n    Console.WriteLine(args[1] + 1);\n}' },
      choices: ['3\n501', '3\n51', '4\n501', 'A compile error: cannot add int to string'],
      answer: '3\n501',
      explanation: 'Three words follow the program name, so Length is 3. `args[1]` is the **string** "50"; string + int concatenates, giving "501". To add you must convert first, which is what `int.TryParse` is for.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a Main with one verb, `greet <name>`, that prints `Hello, <name>` and treats everything else as a usage error.',
      language: 'csharp',
      indentation: true,
      solution: [
        'static int Main(string[] args)',
        '{',
        '    if (args.Length == 0) return Usage();',
        '    switch (args[0])',
        '    {',
        '        case "greet":',
        '            if (args.Length != 2) return Usage();',
        '            Console.WriteLine("Hello, " + args[1]);',
        '            return 0;',
        '        default:',
        '            return Usage();',
        '    }',
        '}',
      ],
      distractors: ['    switch (args[1])', '    if (args.Length == 0) Usage();', '        case greet:'],
      explanation: 'The verb is `args[0]`, not `args[1]`: there is no program-name slot. Calling `Usage()` without `return` prints the message and then crashes on `args[0]` anyway. Case labels compare against a string literal, so the quotes are required.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill in the new material: the return type, the verb, the safe conversion, the error stream and the failure code.',
      language: 'csharp',
      template: `static {{ret}} Main(string[] args)
{
    if (args.Length == 0) return Usage();
    switch ({{verb}})
    {
        case "classify":
            int n;
            if (args.Length != 2 || !int.{{parse}}(args[1], out n)) return Usage();
            Console.WriteLine(Classify(n));
            return 0;
        default:
            return Usage();
    }
}

static int Usage()
{
    Console.{{stream}}.WriteLine("Usage: classify <amount>");
    return {{code}};
}`,
      blanks: [
        { id: 'ret', answers: ['int'], hint: 'Main must hand a number back to the shell.' },
        { id: 'verb', answers: ['args[0]'], hint: 'The first word after the program name.' },
        { id: 'parse', answers: ['TryParse'], hint: 'The conversion that reports failure instead of throwing.' },
        { id: 'stream', answers: ['Error'], hint: 'Complaints do not go on standard output.' },
        { id: 'code', answers: ['1'], hint: 'Any non-zero exit code means failure; by convention usage errors return 1.' },
      ],
      explanation: '`int Main` returns the exit code, `args[0]` is the verb, `TryParse` converts safely, `Console.Error` keeps stdout clean, and `1` signals failure.',
    },
    {
      kind: 'modify',
      prompt: `A teammate reports two wrong results from this tool, both on standard output with exit code 0:

- \`Program apply 100 50\` prints \`Balance: 10050\` instead of \`Balance: 150\`
- \`Program classify 0\` prints \`expense\` instead of \`nothing\`

Fix both. Change nothing about the usage handling.`,
      language: 'csharp',
      starter: verbsSolution.replace('Console.WriteLine("Balance: " + (balance + amount));', 'Console.WriteLine("Balance: " + args[1] + args[2]);').replace('if (amount < 0) return "expense";', 'if (amount <= 0) return "expense";'),
      tests: [
        { description: 'apply 100 50', argv: ['apply', '100', '50'], expectedStdout: 'Balance: 150' },
        { description: 'apply 100 -30', argv: ['apply', '100', '-30'], expectedStdout: 'Balance: 70' },
        { description: 'classify -5', argv: ['classify', '-5'], expectedStdout: 'expense' },
        { description: 'classify 0', argv: ['classify', '0'], expectedStdout: 'nothing' },
        { description: 'classify 12', argv: ['classify', '12'], expectedStdout: 'income' },
      ],
      hint: 'The numbers were already converted by TryParse; print the sum of the converted values, not the original strings. Zero is "nothing", so the expense test must be strictly less than zero.',
      solution: verbsSolution,
    },
    {
      kind: 'create',
      prompt: `Write a small file-backed tool with three verbs over \`entries.txt\` in the working directory:

- \`add <amount> <category>\` appends one line \`<amount> <category>\` to the file (creating it if needed) and prints \`Added <amount> to <category>\`.
- \`total\` prints \`Total: <sum>\` of the first column of every non-blank line; \`Total: 0\` when the file does not exist.
- \`count\` prints \`Entries: <number of non-blank lines>\`; \`Entries: 0\` without a file.

Anything else, including a non-numeric amount, prints a usage line to standard error and returns 1. Write a label comment for each verb before you code it.`,
      language: 'csharp',
      starter: `using System;
using System.IO;
using System.Linq;

class Program
{
    const string Path = "entries.txt";

    static int Usage()
    {
        // TODO: usage line to standard error, then return 1
        return 1;
    }

    static int Main(string[] args)
    {
        // TODO: dispatch on args[0]: add <amount> <category> | total | count
        return Usage();
    }
}`,
      tests: [
        { description: 'add without a file', argv: ['add', '50', 'food'], expectedStdout: 'Added 50 to food' },
        { description: 'add an expense to an existing file', argv: ['add', '-20', 'food'], files: { 'entries.txt': '50 food\n100 salary\n' }, expectedStdout: 'Added -20 to food' },
        { description: 'total without a file', argv: ['total'], expectedStdout: 'Total: 0' },
        { description: 'total over three lines', argv: ['total'], files: { 'entries.txt': '50 food\n-20 food\n100 salary\n' }, expectedStdout: 'Total: 130' },
        { description: 'count ignores blank lines', argv: ['count'], files: { 'entries.txt': '50 food\n\n-20 food\n100 salary\n\n' }, expectedStdout: 'Entries: 3' },
      ],
      hint: '`File.Exists(Path)` first; `File.AppendAllText(Path, line + "\\n")` adds without rewriting; `File.ReadAllLines(Path).Where(l => l.Trim().Length > 0)` drops blanks; `l.Split(\' \')[0]` is the amount column.',
      solution: `using System;
using System.IO;
using System.Linq;

class Program
{
    const string Path = "entries.txt";

    static int Usage()
    {
        Console.Error.WriteLine("Usage: add <amount> <category> | total | count");
        return 1;
    }

    static string[] Lines()
    {
        if (!File.Exists(Path)) return new string[0];
        return File.ReadAllLines(Path).Where(l => l.Trim().Length > 0).ToArray();
    }

    static int Main(string[] args)
    {
        if (args.Length == 0) return Usage();
        switch (args[0])
        {
            case "add":
                int amount;
                if (args.Length != 3 || !int.TryParse(args[1], out amount)) return Usage();
                File.AppendAllText(Path, amount + " " + args[2] + "\\n");
                Console.WriteLine("Added " + amount + " to " + args[2]);
                return 0;
            case "total":
                int total = Lines().Sum(l => int.Parse(l.Split(' ')[0]));
                Console.WriteLine("Total: " + total);
                return 0;
            case "count":
                Console.WriteLine("Entries: " + Lines().Length);
                return 0;
            default:
                return Usage();
        }
    }
}`,
      projectNote: 'LedgerSharp stops asking and starts obeying. The verb dispatch, the file in the working directory and the exit code are exactly the skeleton of v1.0 in lesson 7-5; only the storage (JSON, from Module 5) and the Ledger class are missing.',
    },
  ],
};

/* ---------------------------- 7-2 --------------------------------- */

const l72: Lesson = {
  id: 'cs-7-2',
  title: 'HTTP in one lesson',
  objective: 'Read an HTTP request and response, choose the right method and status code for an action, and exercise a server with curl.',
  minutes: 22,
  lexicon: [
    { id: 'cs.7.request-response', term: 'request / response', kind: 'concept', meaning: 'One HTTP exchange: the client sends a request (method, path, headers, optional body) and the server answers with exactly one response (status line, headers, optional body). Nothing happens until the client asks.', example: 'GET /balance HTTP/1.1\nHost: localhost:5000\n\nHTTP/1.1 200 OK\n\n{"balance":-40}', analogy: 'A letter and its reply. The analogy breaks because HTTP is stateless: the server does not remember the previous letter unless you include something (a cookie, a token) that reminds it.' },
    { id: 'cs.7.method', term: 'GET / POST', kind: 'concept', meaning: 'The verb of a request. GET reads and must not change anything, so it can be repeated or cached. POST sends a body to create or act, and repeating it may create twice.', example: 'GET  /balance      -> read\nPOST /entries      -> create one entry from the body' },
    { id: 'cs.7.status-code', term: 'status code', kind: 'concept', meaning: 'A three-digit result on the first line of every response. 2xx worked (200 OK, 201 Created), 4xx is the client\'s fault (400 Bad Request: malformed input, 404 Not Found: no such route or thing), 5xx is the server\'s fault.', example: 'HTTP/1.1 201 Created\nHTTP/1.1 404 Not Found' },
    { id: 'cs.7.json-body', term: 'Content-Type: application/json', kind: 'concept', meaning: 'The header that declares what the body is. With application/json the body is exactly the text a JSON serializer produces, which is why the Module 5 ledger.json shape appears again on the wire.', example: 'Content-Type: application/json\n\n{"amount":-40,"category":"food"}' },
    { id: 'cs.7.curl', term: 'curl -X POST <url> -H "content-type: application/json" -d \'<json>\' -i', kind: 'pattern', meaning: 'The command-line HTTP client. -X sets the method (GET is the default), -H adds a header, -d sends a body, -i prints the response status line and headers along with the body.', example: 'curl -i http://localhost:5000/balance' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Two text messages',
      body: `A web API is a program that answers **HTTP**: a conversation of plain-text messages. A client (curl, a browser, another program) sends a **request**; the server sends back exactly one **response**. The server never speaks first.

A request has a **method** that states intent, a **path** that names what the request is about, **headers** that describe the message, a blank line, and an optional **body**. \`GET\` reads and changes nothing; \`POST\` carries a body to create something. The response starts with a **status code**: 2xx means it worked (200 OK for a read, 201 Created for a creation), 4xx means the client got it wrong (400 Bad Request for a malformed body, 404 Not Found for a path or thing that does not exist), 5xx means the server broke.

Bodies are JSON, and the \`Content-Type\` header says so. Below is the whole exchange that will create a ledger entry in the next lesson.`,
      example: {
        language: 'text',
        source: `POST /entries HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{"amount":-40,"category":"food"}

HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /entries/0

{"amount":-40,"category":"food"}`,
        labels: [
          { lines: [1, 1], label: 'Request line: method, path, protocol version. The verb and the thing, in that order.' },
          { lines: [2, 3], label: 'Request headers: which server this is for, and what format the body is in.' },
          { lines: [4, 4], label: 'A blank line separates headers from body. It is part of the format, not decoration.' },
          { lines: [5, 5], label: 'The body: the Module 5 JSON shape of one entry.' },
          { lines: [7, 7], label: 'Status line: 201 says "created", more precise than a plain 200.' },
          { lines: [8, 9], label: 'Response headers. Location tells the client where the new thing now lives.' },
          { lines: [11, 11], label: 'The response body echoes what was stored, so the client can see any defaults the server filled in.' },
        ],
      },
      contrast: [{ from: 'python', note: 'The body is exactly what json.dumps produced in the Python Ledger and what JsonSerializer.Serialize produces here. HTTP adds only an envelope around it: method, path, headers, status.' }],
    },
    {
      kind: 'concept',
      title: 'curl: HTTP from the keyboard',
      body: `You do not need a browser to talk to an API. \`curl\` builds a request from flags and prints the response. Without flags it sends a \`GET\` and prints only the body; \`-i\` includes the status line and headers, which is how you check a status code; \`-X POST\` changes the method; \`-H\` adds a header; \`-d\` attaches a body.

Read the first line of what \`-i\` prints before anything else: it is the status line, and it tells you whether to read the body as a result or as a complaint.`,
      example: {
        language: 'shell',
        source: `curl -i http://localhost:5000/balance
curl -X POST http://localhost:5000/entries -H "content-type: application/json" -d '{"amount":-40,"category":"food"}' -i
curl -i http://localhost:5000/entries/0
curl -i http://localhost:5000/entries/99`,
        labels: [
          { lines: [1, 1], label: 'A read. GET is the default, -i shows "HTTP/1.1 200 OK" above the JSON body.' },
          { lines: [2, 2], label: 'A creation: method, header and body spelled out. Expect "HTTP/1.1 201 Created" and a Location header.' },
          { lines: [3, 3], label: 'Read back the thing that Location pointed at.' },
          { lines: [4, 4], label: 'Ask for an entry that does not exist: a well-formed request for a missing thing is 404, not an error in your program.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'The ledger holds two entries (indexes 0 and 1). A client sends this request. Which status should the server answer with?',
      code: { language: 'text', source: 'GET /entries/5 HTTP/1.1\nHost: localhost:5000' },
      choices: ['200 OK', '201 Created', '400 Bad Request', '404 Not Found'],
      answer: '404 Not Found',
      explanation: 'The request is perfectly well formed, so it is not a 400, and it asked for a thing that does not exist, which is exactly what 404 means. 201 is reserved for POSTs that created something.',
    },
    {
      kind: 'predict',
      prompt: 'A client sends this request to create an entry. Which status should it get?',
      code: { language: 'text', source: 'POST /entries HTTP/1.1\nHost: localhost:5000\nContent-Type: application/json\n\n{"amount":"forty","category":"food"}' },
      choices: ['201 Created', '200 OK', '400 Bad Request', '404 Not Found'],
      answer: '400 Bad Request',
      explanation: 'The route exists and the method is right, but the body cannot be read into an entry: "forty" is not an int. That is the client\'s mistake, so the server reports 400 and creates nothing. 404 would mean the path itself was unknown.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the request that creates one entry, top to bottom.',
      language: 'text',
      indentation: false,
      solution: ['POST /entries HTTP/1.1', 'Host: localhost:5000', 'Content-Type: application/json', '(blank line)', '{"amount":-40,"category":"food"}'],
      distractors: ['GET /entries HTTP/1.1', 'Content-Type: text/plain', 'HTTP/1.1 201 Created'],
      explanation: 'Creating is a POST; a GET carries no body. The body is JSON, so the header must say application/json or the server will not parse it. A status line belongs to the response, never to the request.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the curl session and the status codes you expect back.',
      language: 'shell',
      template: `# create an entry
curl -X {{method}} http://localhost:5000/entries -H "content-type: {{ctype}}" -d '{"amount":-40,"category":"food"}' -i
# first line printed: HTTP/1.1 {{created}} Created

# read the balance
curl -i http://localhost:5000/balance
# first line printed: HTTP/1.1 {{ok}} OK

# a route that does not exist
curl -i http://localhost:5000/nothing-here
# first line printed: HTTP/1.1 {{missing}} Not Found`,
      blanks: [
        { id: 'method', answers: ['POST'], hint: 'The method that carries a body to create something.' },
        { id: 'ctype', answers: ['application/json'], hint: 'The media type of a JSON body.' },
        { id: 'created', answers: ['201'], hint: 'The success code that is more specific than 200.' },
        { id: 'ok', answers: ['200'], hint: 'A plain successful read.' },
        { id: 'missing', answers: ['404'], hint: 'The path is unknown to the server.' },
      ],
      explanation: 'POST with application/json creates and earns a 201; a GET that works is 200; an unknown path is 404.',
    },
  ],
};

/* ---------------------------- 7-3 --------------------------------- */

const apiProgram = `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
var ledger = new Ledger();

app.MapGet("/balance", () => Results.Ok(new { balance = ledger.Balance }));

app.MapGet("/entries", () => Results.Ok(ledger.Entries));

app.MapGet("/entries/{index}", (int index) =>
    index >= 0 && index < ledger.Entries.Count ? Results.Ok(ledger.Entries[index]) : Results.NotFound());

app.MapPost("/entries", (EntryDto dto) =>
{
    if (string.IsNullOrEmpty(dto.Category)) return Results.BadRequest("category is required");
    var entry = new Entry(dto.Amount, dto.Category);
    ledger.Add(entry);
    return Results.Created("/entries/" + (ledger.Entries.Count - 1), entry);
});

app.Run();

class EntryDto
{
    public int Amount { get; set; }
    public string Category { get; set; } = "";
}

class Entry
{
    public int Amount { get; set; }
    public string Category { get; set; }
    public Entry(int amount, string category) { Amount = amount; Category = category; }
}

class Ledger
{
    public List<Entry> Entries { get; } = new List<Entry>();
    public int Balance { get { return Entries.Sum(e => e.Amount); } }
    public void Add(Entry entry) { Entries.Add(entry); }
}`;

const l73: Lesson = {
  id: 'cs-7-3',
  title: 'A minimal API',
  objective: 'Read an ASP.NET Core minimal API, map routes to handlers and status helpers, and run one on your own machine.',
  minutes: 30,
  lexicon: [
    { id: 'cs.7.webapplication', term: 'WebApplication.CreateBuilder(args) / builder.Build()', kind: 'pattern', meaning: 'The two lines that turn a console program into a web server. The builder gathers configuration and logging; Build() produces the app you attach routes to; app.Run() starts listening and does not return.', example: 'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\napp.Run();' },
    { id: 'cs.7.mapget', term: 'app.MapGet("/path", () => ...)', kind: 'pattern', meaning: 'Attach a handler to GET requests for a route. The lambda runs once per request and whatever it returns becomes the response. A segment in braces, such as /entries/{index}, binds to a lambda parameter of the same name.', example: 'app.MapGet("/balance", () => Results.Ok(new { balance = ledger.Balance }));' },
    { id: 'cs.7.mappost', term: 'app.MapPost("/path", (Dto dto) => ...)', kind: 'pattern', meaning: 'Attach a handler to POST requests. A class-typed parameter is filled from the JSON body (model binding); if the body cannot be read into it the framework answers 400 before your code runs.', example: 'app.MapPost("/entries", (EntryDto dto) => Results.Created("/entries/0", dto));' },
    { id: 'cs.7.results', term: 'Results.Ok / Created / BadRequest / NotFound', kind: 'builtin', meaning: 'Helpers that build a response with the right status code and serialize the value you pass as JSON. Created takes the Location of the new thing first, then the body.', example: 'return Results.Created("/entries/3", entry);   // 201\nreturn Results.NotFound();                       // 404' },
    { id: 'cs.7.dto', term: 'DTO (data transfer object)', kind: 'concept', meaning: 'A plain class whose only job is to describe the shape of a request or response body. It keeps the wire format separate from your domain class, so Entry can change without breaking every client.', example: 'class EntryDto\n{\n    public int Amount { get; set; }\n    public string Category { get; set; } = "";\n}', analogy: 'A form at a counter: it has exactly the fields the clerk needs, and the clerk copies them into the real record. It breaks when you let the form grow into the record itself; then you have two copies of one class.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Forty lines that listen',
      body: `ASP.NET Core's **minimal API** turns a program into a server in two lines: \`WebApplication.CreateBuilder(args)\` then \`builder.Build()\`. After that, every \`app.MapGet\` or \`app.MapPost\` attaches a **handler**, an ordinary lambda, to a **route**. \`app.Run()\` starts listening and never returns.

A handler returns a \`Results.*\` value, which sets the status code and serializes the payload to JSON: \`Ok\` is 200, \`Created\` is 201 with a Location, \`BadRequest\` is 400, \`NotFound\` is 404. Inputs arrive by **model binding**: a route segment such as \`{index}\` fills a parameter of the same name, and a class-typed parameter is filled from the JSON body, case-insensitively, so \`"amount"\` lands in \`Amount\`. The class that describes the body is a **DTO**.

Read the program; do not try to run it here. It uses top-level statements and the ASP.NET Core framework, neither of which the in-app runner has. In the fieldwork step you will run it on your own machine.`,
      example: {
        language: 'csharp',
        source: apiProgram,
        labels: [
          { lines: [1, 2], label: 'Console program to web server: gather configuration, then build the app.' },
          { lines: [3, 3], label: 'One ledger shared by every request. It lives as long as the process; a restart empties it.' },
          { lines: [5, 5], label: 'A read route. An anonymous object becomes {"balance": n} on the wire.' },
          { lines: [7, 7], label: 'A list route: the whole collection as a JSON array.' },
          { lines: [9, 10], label: '{index} in the route binds to the int parameter. A well-formed request for a missing entry is 404.' },
          { lines: [12, 14], label: 'A creation route. The DTO is filled from the body; your own validation answers 400 for a legal body with wrong content.' },
          { lines: [15, 17], label: 'Copy the DTO into the domain object, store it, answer 201 with where it now lives.' },
          { lines: [20, 20], label: 'Start listening. Everything above only registered handlers; nothing ran yet.' },
          { lines: [22, 26], label: 'The DTO: the shape of the request body and nothing else.' },
          { lines: [28, 40], label: 'The Module 3 classes, trimmed to what this program uses. In a real project they are a separate file.' },
        ],
      },
      contrast: [{ from: 'python', note: 'Where the Python Ledger\'s main() read a verb from argparse and called a method, a handler is called by the framework when a request matches its route. You never write the loop that waits for requests; app.Run() is that loop.' }],
    },
    {
      kind: 'predict',
      prompt: 'The program above is running with an empty ledger. A client sends `POST /entries` with body `{"amount": 10}`. Which status comes back?',
      code: { language: 'csharp', source: 'app.MapPost("/entries", (EntryDto dto) =>\n{\n    if (string.IsNullOrEmpty(dto.Category)) return Results.BadRequest("category is required");\n    var entry = new Entry(dto.Amount, dto.Category);\n    ledger.Add(entry);\n    return Results.Created("/entries/" + (ledger.Entries.Count - 1), entry);\n});' },
      choices: ['201 Created', '400 Bad Request', '404 Not Found', '200 OK'],
      answer: '400 Bad Request',
      explanation: 'The body is legal JSON and binds fine: Amount is 10 and Category keeps its default "". Your own check then rejects it with `Results.BadRequest`, so nothing is added. Binding failures (a string where an int belongs) are also 400, but those never reach your code.',
    },
    {
      kind: 'predict',
      prompt: 'Two entries have been POSTed. A client sends `GET /entries/1`. What does the server answer?',
      code: { language: 'csharp', source: 'app.MapGet("/entries/{index}", (int index) =>\n    index >= 0 && index < ledger.Entries.Count ? Results.Ok(ledger.Entries[index]) : Results.NotFound());' },
      choices: ['200 OK with the second entry as JSON', '200 OK with the first entry as JSON', '404 Not Found', '201 Created'],
      answer: '200 OK with the second entry as JSON',
      explanation: '"1" in the path binds to the int parameter `index`. Two entries occupy indexes 0 and 1, so 1 is in range and `Results.Ok` returns that entry, the second one, with status 200. Index 2 would be the 404.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the top-level statements of a minimal API. Assume `ledger`, `Entry` and `EntryDto` already exist, and register the GET route before the POST route.',
      language: 'csharp',
      indentation: false,
      solution: [
        'var builder = WebApplication.CreateBuilder(args);',
        'var app = builder.Build();',
        'app.MapGet("/balance", () => Results.Ok(new { balance = ledger.Balance }));',
        'app.MapPost("/entries", (EntryDto dto) => { ledger.Add(new Entry(dto.Amount, dto.Category)); return Results.Created("/entries/" + (ledger.Entries.Count - 1), dto); });',
        'app.Run();',
      ],
      distractors: ['var app = WebApplication.CreateBuilder(args);', 'app.MapGet("/balance", Results.Ok(ledger.Balance));', 'builder.Run();'],
      explanation: 'CreateBuilder gives a builder, not the app; Build() gives the app. A handler is a lambda that runs per request, so `() =>` is required: `Results.Ok(...)` on its own would compute one response at startup. Run belongs to the app; routes must be mapped before it because Run never returns.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill in the route strings and the status helpers.',
      language: 'csharp',
      template: `app.{{get}}("{{balanceRoute}}", () => Results.Ok(new { balance = ledger.Balance }));

app.MapPost("{{entriesRoute}}", (EntryDto dto) =>
{
    if (string.IsNullOrEmpty(dto.Category)) return Results.{{bad}}("category is required");
    ledger.Add(new Entry(dto.Amount, dto.Category));
    return Results.{{created}}("/entries/" + (ledger.Entries.Count - 1), dto);
});

app.MapGet("/entries/{index}", (int index) =>
    index >= 0 && index < ledger.Entries.Count ? Results.Ok(ledger.Entries[index]) : Results.{{missing}}());`,
      blanks: [
        { id: 'get', answers: ['MapGet'], hint: 'The method that registers a read route.' },
        { id: 'balanceRoute', answers: ['/balance'], hint: 'Routes start with a slash and name the thing.' },
        { id: 'entriesRoute', answers: ['/entries'], hint: 'The collection that a POST adds to.' },
        { id: 'bad', answers: ['BadRequest'], hint: 'The 400 helper: the client sent something unacceptable.' },
        { id: 'created', answers: ['Created'], hint: 'The 201 helper; its first argument is the Location.' },
        { id: 'missing', answers: ['NotFound'], hint: 'The 404 helper.' },
      ],
      explanation: 'MapGet("/balance") reads; MapPost("/entries") creates and answers Created (201) or BadRequest (400); a missing index is NotFound (404).',
    },
    {
      kind: 'fieldwork',
      prompt: 'Run the API from the first step on your own computer and create one entry with curl.',
      warning: 'Everything here runs on your own machine at localhost. Nothing is deployed, nothing is reachable from the internet, and nothing costs money. The Azure track is where this program leaves your laptop.',
      checklist: [
        'Run `dotnet --version`. If it does not print 8.x or newer, install the .NET 8 SDK first.',
        'In an empty folder run `dotnet new web -o LedgerApi`, then `cd LedgerApi`.',
        'Replace the entire contents of `Program.cs` with the program from the first step of this lesson (all forty lines, including the three classes at the bottom).',
        'Run `dotnet run --urls http://localhost:5000` and wait for the line `Now listening on: http://localhost:5000`.',
        'In a second terminal run: `curl -X POST http://localhost:5000/entries -H "content-type: application/json" -d \'{"amount":-40,"category":"food"}\' -i`',
        'Then run `curl -i http://localhost:5000/balance` and check the body reads `{"balance":-40}`.',
        'Stop the server with Ctrl+C.',
      ],
      verify: { question: 'The first line curl printed for the POST is the status line. Type the three-digit status code it contains.', answers: ['201'] },
    },
  ],
};

/* ---------------------------- 7-4 --------------------------------- */

const importerSource = `using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

// Statement importer: turns a bank CSV export into a category report.
interface IReportWriter
{
    void Line(string category, int total);
    void Footer(int count, string largest);
}

class ConsoleWriter : IReportWriter
{
    public void Line(string category, int total) { Console.WriteLine(category + ": " + total); }

    public void Footer(int count, string largest)
    {
        Console.WriteLine("Entries: " + count);
        if (largest != null) Console.WriteLine("Largest expense: " + largest);
    }
}

class Row
{
    public string Date { get; private set; }
    public int Amount { get; private set; }
    public string Category { get; private set; }

    public Row(string date, int amount, string category) { Date = date; Amount = amount; Category = category; }
}

static class Importer
{
    public static Row Parse(string line)
    {
        var parts = line.Split(',');
        return new Row(parts[0].Trim(), int.Parse(parts[1].Trim()), parts[2].Trim());
    }

    public static List<Row> Read(string path)
    {
        return File.ReadAllLines(path)
            .Skip(1)
            .Where(l => l.Trim().Length > 0)
            .Select(l => Parse(l))
            .ToList();
    }

    public static Dictionary<string, int> Totals(List<Row> rows)
    {
        return rows.GroupBy(r => r.Category)
            .ToDictionary(g => g.Key, g => g.Sum(r => r.Amount));
    }

    public static string LargestExpense(Dictionary<string, int> totals)
    {
        var expenses = totals.Where(kv => kv.Value < 0).ToList();
        if (expenses.Count == 0) return null;
        return expenses.OrderBy(kv => kv.Value).First().Key;
    }
}

class Program
{
    static void Report(List<Row> rows, IReportWriter writer)
    {
        var totals = Importer.Totals(rows);
        foreach (var category in totals.Keys.OrderBy(c => c, StringComparer.Ordinal))
            writer.Line(category, totals[category]);
        writer.Footer(rows.Count, Importer.LargestExpense(totals));
    }

    static void Main(string[] args)
    {
        var rows = Importer.Read("statement.csv");
        Report(rows, new ConsoleWriter());
    }
}`;

const importerStarter = importerSource
  .replace('int.Parse(parts[1].Trim()), parts[2].Trim());', 'int.Parse(parts[1].Trim()), parts[2]);')
  .replace('expenses.OrderBy(kv => kv.Value).First().Key;', 'expenses.OrderByDescending(kv => kv.Value).First().Key;');

const importerWithMarkdown = importerSource
  .replace('class Row', `class MarkdownWriter : IReportWriter
{
    public void Line(string category, int total) { Console.WriteLine("| " + category + " | " + total + " |"); }

    public void Footer(int count, string largest)
    {
        Console.WriteLine("| entries | " + count + " |");
        if (largest != null) Console.WriteLine("| largest expense | " + largest + " |");
    }
}

class Row`)
  .replace('        var rows = Importer.Read("statement.csv");\n        Report(rows, new ConsoleWriter());', '        var rows = Importer.Read("statement.csv");\n        IReportWriter writer = new ConsoleWriter();\n        if (args.Length > 0 && args[0] == "md") writer = new MarkdownWriter();\n        Report(rows, writer);');

const statementFixture = 'date,amount,category\n2024-03-01,-30,food\n2024-03-02,120,salary\n2024-03-03,-500, rent\n\n2024-03-05,-10,food\n';
const statementNoExpenses = 'date,amount,category\n2024-04-01,120,salary\n2024-04-02,15,refund\n';
const statementReport = 'food: -40\nrent: -500\nsalary: 120\nEntries: 4\nLargest expense: rent';

const l74: Lesson = {
  id: 'cs-7-4',
  title: 'Reading other people\'s code',
  objective: 'Find the plan in an unfamiliar C# program, fix a described bug in it, and add a feature through its interface without changing its existing output.',
  minutes: 30,
  lexicon: [
    { id: 'cs.7.reading-order', term: 'reading order', kind: 'concept', meaning: 'How to read C# you did not write: Main first, then the type names as a table of contents, then the method signatures of the type Main uses, and only then the bodies you need to change.', example: '// 1. static void Main\n// 2. interface, class, static class names\n// 3. public static Row Parse(string line) ...\n// 4. one body at a time', analogy: 'A textbook by its contents page and chapter summaries before the chapters. It breaks when Main is a one-liner that hands everything to a framework; then start from the method that produces the output you care about.' },
    { id: 'cs.7.seam', term: 'interface as a seam', kind: 'concept', meaning: 'A place where one implementation can be swapped for another without touching the code that calls it. Code written against IReportWriter gains a new output format by adding a class, not by editing Report.', example: 'IReportWriter writer = new ConsoleWriter();\nif (args.Length > 0 && args[0] == "md") writer = new MarkdownWriter();\nReport(rows, writer);' },
    { id: 'cs.7.todictionary', term: '.ToDictionary(g => g.Key, g => g.Sum(...))', kind: 'builtin', meaning: 'Finish a LINQ pipeline as a Dictionary: the first lambda picks the key, the second the value. After GroupBy it turns groups into one total per category.', example: 'var totals = rows.GroupBy(r => r.Category)\n    .ToDictionary(g => g.Key, g => g.Sum(r => r.Amount));' },
    { id: 'cs.7.ordinal', term: 'StringComparer.Ordinal', kind: 'builtin', meaning: 'Compare strings by their character codes instead of the current culture\'s alphabet rules. Use it wherever output order must be identical on every machine, such as a sorted report that tests compare exactly.', example: 'totals.Keys.OrderBy(c => c, StringComparer.Ordinal)' },
    { id: 'cs.7.dotnet-publish', term: 'dotnet publish -c Release -o out', kind: 'pattern', meaning: 'Build an optimised, ready-to-ship copy of the program into a folder. Framework-dependent by default (small, needs the .NET runtime on the target); add --self-contained -r <rid> to bundle the runtime.', example: 'dotnet publish -c Release -o out\ndotnet publish -c Release -r linux-x64 --self-contained -o out' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Main first, then the names',
      body: `Most programming is reading code someone else wrote. The skill is to find the plan without reading every line.

Read in this order. **First**, \`Main\`: it says what the program does in a few calls. **Second**, the type names: \`interface\`, \`class\`, \`static class\` lines are the table of contents. **Third**, the signatures of the methods Main uses: a name, its parameters and its return type tell you what it promises. **Only then** the bodies, and only the ones you need.

Below is someone else's importer for a bank export, a CSV with a header row and one line per entry. It uses three things you may not have seen: \`ToDictionary\` to finish a LINQ pipeline, \`StringComparer.Ordinal\` to sort the same way on every machine, and an interface used as a **seam**: \`Report\` never knows which writer it is talking to. Notice that you can already say what the program does before understanding any of them.`,
      example: {
        language: 'csharp',
        source: importerSource,
        labels: [
          { lines: [6, 11], label: 'The contract for anything that can print a report: one method per line kind. No implementation here.' },
          { lines: [13, 22], label: 'The only implementation so far. It is the only code in the file that calls Console.' },
          { lines: [24, 31], label: 'One CSV line as an object. Private setters: a Row never changes after construction.' },
          { lines: [35, 39], label: 'Text in, Row out: split on commas, trim the stray spaces, convert the amount.' },
          { lines: [41, 48], label: 'A LINQ pipeline: skip the header row, drop blank lines, parse each remaining line into a Row.' },
          { lines: [50, 54], label: 'GroupBy then ToDictionary: one total per category, keyed by the category name.' },
          { lines: [56, 61], label: 'Keep only negative totals; the largest expense is the most negative, so ascending order and First. null when there is none.' },
          { lines: [66, 72], label: 'The only method that uses the writer. Ordinal sort makes the order the same on every machine.' },
          { lines: [74, 78], label: 'Read this first: read the file, report through the console writer. Two calls.' },
        ],
      },
      contrast: [{ from: 'python', note: 'The Python importer in Module 8 used defaultdict and a dict comprehension for the same totals; here GroupBy plus ToDictionary does both in one pipeline, and the type names (interface, static class) give you a table of contents Python left implicit.' }],
    },
    {
      kind: 'predict',
      prompt: '`statement.csv` holds the header line and these three rows: `2024-05-01,-80,travel`, `2024-05-02,200,salary`, `2024-05-03,-15,food`. What does the program print?',
      code: { language: 'csharp', source: 'static void Report(List<Row> rows, IReportWriter writer)\n{\n    var totals = Importer.Totals(rows);\n    foreach (var category in totals.Keys.OrderBy(c => c, StringComparer.Ordinal))\n        writer.Line(category, totals[category]);\n    writer.Footer(rows.Count, Importer.LargestExpense(totals));\n}' },
      choices: [
        'food: -15\nsalary: 200\ntravel: -80\nEntries: 3\nLargest expense: travel',
        'travel: -80\nsalary: 200\nfood: -15\nEntries: 3\nLargest expense: travel',
        'food: -15\nsalary: 200\ntravel: -80\nEntries: 3\nLargest expense: food',
        'food: -15\nsalary: 200\ntravel: -80\nEntries: 3\nLargest expense: -80',
      ],
      answer: 'food: -15\nsalary: 200\ntravel: -80\nEntries: 3\nLargest expense: travel',
      explanation: 'OrderBy on the keys sorts the categories alphabetically, whatever order the file had. LargestExpense keeps the negative totals (-80 and -15), orders ascending and takes the first, which is -80, but returns its **Key**, so the last line names the category, not the number.',
    },
    {
      kind: 'modify',
      prompt: `A colleague ran the importer on the fixture below and got a wrong report: a category \` rent\` with a leading space appears before \`food\`, and the last line says \`Largest expense: food\` although rent is -500.

Fix \`Parse\` and \`LargestExpense\`. Change nothing else; with the fixture the output must be exactly:

\`\`\`
food: -40
rent: -500
salary: 120
Entries: 4
Largest expense: rent
\`\`\``,
      language: 'csharp',
      starter: importerStarter,
      tests: [
        { description: 'report on the fixture', files: { 'statement.csv': statementFixture }, expectedStdout: statementReport },
        { description: 'no expenses, no largest line', files: { 'statement.csv': statementNoExpenses }, expectedStdout: 'refund: 15\nsalary: 120\nEntries: 2' },
      ],
      hint: 'Compare the three arguments to the Row constructor: two are trimmed, one is not. The largest expense is the most negative total; ascending order puts it first.',
      solution: importerSource,
    },
    {
      kind: 'create',
      prompt: `Add a second output format without touching \`Report\`, \`Importer\` or \`ConsoleWriter\`: a \`MarkdownWriter\` that implements \`IReportWriter\` and prints table rows:

- each category as \`| <category> | <total> |\`
- then \`| entries | <count> |\`
- then, only when there is one, \`| largest expense | <category> |\`

Select it in \`Main\` when the program is started with \`md\` as its first argument. Without arguments the output must stay byte-for-byte what it is today.`,
      language: 'csharp',
      starter: importerSource,
      tests: [
        { description: 'default output unchanged', files: { 'statement.csv': statementFixture }, expectedStdout: statementReport },
        { description: 'markdown table', argv: ['md'], files: { 'statement.csv': statementFixture }, expectedStdout: '| food | -40 |\n| rent | -500 |\n| salary | 120 |\n| entries | 4 |\n| largest expense | rent |' },
        { description: 'markdown without expenses', argv: ['md'], files: { 'statement.csv': statementNoExpenses }, expectedStdout: '| refund | 15 |\n| salary | 120 |\n| entries | 2 |' },
      ],
      hint: 'Copy ConsoleWriter, rename it, change the two WriteLine formats. In Main declare `IReportWriter writer = new ConsoleWriter();` and reassign it when `args.Length > 0 && args[0] == "md"`.',
      solution: importerWithMarkdown,
      projectNote: 'This is why LedgerSharp\'s interfaces from Module 6 exist: the API in the previous lesson and the CLI in the next one are two front ends over the same Ledger, exactly as two writers sit over the same Report.',
    },
    {
      kind: 'concept',
      title: 'Shipping it',
      body: `\`dotnet run\` is for development. To hand the program to someone, \`dotnet publish -c Release -o out\` builds an optimised copy into \`out/\`. The default is **framework-dependent**: a small output that needs the .NET runtime installed on the target machine. Add \`--self-contained -r linux-x64\` (or \`win-x64\`, \`osx-arm64\`) for a **self-contained** build that bundles the runtime: much larger, but it runs on a machine with nothing installed.

Libraries come from **NuGet**. \`dotnet add package Newtonsoft.Json\` records the dependency and its version in the \`.csproj\`, and \`dotnet restore\` (run automatically by build) downloads it. The \`.csproj\` and your \`.cs\` files are what you commit; \`bin/\` and \`obj/\` are not.`,
      contrast: [{ from: 'python', note: 'The .csproj plays the role of requirements.txt, and dotnet restore the role of pip install -r. There is no equivalent of a venv: packages are cached per machine and referenced per project.' }],
    },
  ],
};

/* ---------------------------- 7-5 --------------------------------- */

const ledgerClasses = `class Entry
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
    private readonly List<Entry> entries = new List<Entry>();

    public List<Entry> Entries { get { return entries; } }

    public void Add(Entry entry) { entries.Add(entry); }

    public int Balance { get { return entries.Sum(e => e.Amount); } }

    public List<KeyValuePair<string, int>> ByCategory()
    {
        return entries
            .GroupBy(e => e.Category)
            .Select(g => new KeyValuePair<string, int>(g.Key, g.Sum(e => e.Amount)))
            .OrderBy(kv => kv.Key, StringComparer.Ordinal)
            .ToList();
    }
}`;

const storageAndSelfTest = `static class Storage
{
    const string Path = "ledger.json";

    public static Ledger Load()
    {
        var ledger = new Ledger();
        if (!File.Exists(Path)) return ledger;
        var entries = JsonSerializer.Deserialize<List<Entry>>(File.ReadAllText(Path));
        foreach (var e in entries) ledger.Add(e);
        return ledger;
    }

    public static void Save(Ledger ledger)
    {
        File.WriteAllText(Path, JsonSerializer.Serialize(ledger.Entries));
    }
}

static class SelfTest
{
    static int passed = 0;

    static void Check(bool condition, string name)
    {
        if (!condition) throw new Exception("FAILED: " + name);
        passed++;
    }

    public static int Run()
    {
        passed = 0;
        var ledger = new Ledger();
        ledger.Add(new Entry(-20, "food"));
        ledger.Add(new Entry(100, "salary"));
        Check(ledger.Balance == 80, "balance sums all entries");
        Check(ledger.ByCategory()[0].Key == "food", "report sorted by category");
        return passed;
    }
}`;

const usings = `using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

`;

const ledgerV10 = `${usings}${ledgerClasses}

static class Storage
{
    const string Path = "ledger.json";

    public static Ledger Load()
    {
        var ledger = new Ledger();
        if (!File.Exists(Path)) return ledger;
        var entries = JsonSerializer.Deserialize<List<Entry>>(File.ReadAllText(Path));
        foreach (var e in entries) ledger.Add(e);
        return ledger;
    }

    public static void Save(Ledger ledger)
    {
        File.WriteAllText(Path, JsonSerializer.Serialize(ledger.Entries));
    }
}

static class SelfTest
{
    static int passed = 0;

    static void Check(bool condition, string name)
    {
        if (!condition) throw new Exception("FAILED: " + name);
        passed++;
    }

    public static int Run()
    {
        passed = 0;
        var empty = new Ledger();
        Check(empty.Balance == 0, "empty balance");
        Check(empty.ByCategory().Count == 0, "empty report");

        var ledger = new Ledger();
        ledger.Add(new Entry(-20, "food"));
        ledger.Add(new Entry(100, "salary"));
        ledger.Add(new Entry(-15, "food"));
        Check(ledger.Balance == 65, "balance sums all entries");
        var report = ledger.ByCategory();
        Check(report.Count == 2 && report[0].Key == "food" && report[0].Value == -35, "food total first");
        Check(report[1].Key == "salary" && report[1].Value == 100, "salary total second");
        return passed;
    }
}

class Program
{
    static int Usage()
    {
        Console.Error.WriteLine("Usage: add|balance|report|selftest");
        return 1;
    }

    static int Main(string[] args)
    {
        if (args.Length == 0) return Usage();
        switch (args[0])
        {
            case "add":
                int amount;
                if (args.Length != 3 || !int.TryParse(args[1], out amount)) return Usage();
                var ledger = Storage.Load();
                ledger.Add(new Entry(amount, args[2]));
                Storage.Save(ledger);
                Console.WriteLine("Added " + amount + " to " + args[2]);
                return 0;
            case "balance":
                Console.WriteLine("Balance: " + Storage.Load().Balance);
                return 0;
            case "report":
                var loaded = Storage.Load();
                foreach (var kv in loaded.ByCategory())
                    Console.WriteLine(kv.Key + ": " + kv.Value);
                Console.WriteLine("Entries: " + loaded.Entries.Count);
                return 0;
            case "selftest":
                Console.WriteLine(SelfTest.Run() + " tests passed");
                return 0;
            default:
                return Usage();
        }
    }
}`;

const ledgerV10Starter = `${usings}${ledgerClasses}

static class Storage
{
    const string Path = "ledger.json";

    public static Ledger Load()
    {
        var ledger = new Ledger();
        if (!File.Exists(Path)) return ledger;
        var entries = JsonSerializer.Deserialize<List<Entry>>(File.ReadAllText(Path));
        foreach (var e in entries) ledger.Add(e);
        return ledger;
    }

    public static void Save(Ledger ledger)
    {
        File.WriteAllText(Path, JsonSerializer.Serialize(ledger.Entries));
    }
}

static class SelfTest
{
    static int passed = 0;

    static void Check(bool condition, string name)
    {
        if (!condition) throw new Exception("FAILED: " + name);
        passed++;
    }

    public static int Run()
    {
        passed = 0;
        // TODO: at least three checks on Ledger: an empty balance, a balance over several entries,
        // and ByCategory's order and totals. Build the fixture here; touch no files.
        return passed;
    }
}

class Program
{
    static int Usage()
    {
        // TODO: the usage line to standard error, then return 1
        return 1;
    }

    static int Main(string[] args)
    {
        // TODO: dispatch on args[0]: add <amount> <category> | balance | report | selftest
        return Usage();
    }
}`;

const ledger3 = '[{"Amount":-20,"Category":"food"},{"Amount":100,"Category":"salary"},{"Amount":-15,"Category":"food"}]';

const l75: Lesson = {
  id: 'cs-7-5',
  title: 'LedgerSharp v1.0',
  objective: 'Ship LedgerSharp as a command-line tool with four verbs over ledger.json, a self-test, and a usage error with exit code 1.',
  minutes: 35,
  lexicon: [
    { id: 'cs.7.contract', term: 'I/O contract', kind: 'concept', meaning: 'The exact verbs a program accepts and the exact lines it prints for each, written down before the code. Tests check the contract, so it changes only on purpose.', example: '// Program balance -> Balance: <sum>\n// Program report  -> <category>: <total> per line, then Entries: <k>' },
    { id: 'cs.7.dotnet-run-args', term: 'dotnet run -- add 50 food', kind: 'pattern', meaning: 'Run the project and pass everything after -- to the program as args. Without the separator dotnet would try to read the words as its own options.', example: 'dotnet run -- report' },
    { id: 'cs.7.exit-code', term: 'exit code ($?)', kind: 'concept', meaning: 'The number a process hands back when it ends: what int Main returned. The shell stores the last one in $? and scripts branch on it, so 0 for success and 1 for a usage error is a promise other programs rely on.', example: 'dotnet run -- bogus\necho $?        # 1' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The contract, then the code',
      body: `v1.0 is the ledger as a tool. Every verb reads \`ledger.json\` from the working directory, does one thing, and prints exactly what the contract says:

- \`add <amount> <category>\` appends an entry, saves, prints \`Added <amount> to <category>\`
- \`balance\` prints \`Balance: <sum>\`
- \`report\` prints \`<category>: <total>\` per category in ordinal order, then \`Entries: <k>\`
- \`selftest\` prints \`<n> tests passed\`
- anything else prints \`Usage: add|balance|report|selftest\` to standard error and returns 1

A missing file is an empty ledger, never an error: \`balance\` says \`Balance: 0\` and \`report\` says \`Entries: 0\`. The file format is the Module 5 one: a JSON array of \`{"Amount": int, "Category": string}\`.

\`Entry\` and \`Ledger\` are the Module 6 classes unchanged. Below are the two pieces that are new to this version: storage that tolerates absence, and a self-test that builds its own fixture in memory.`,
      example: {
        language: 'csharp',
        source: storageAndSelfTest,
        labels: [
          { lines: [3, 3], label: 'One relative path, resolved against the working directory. Running from another folder means another ledger.' },
          { lines: [5, 12], label: 'Load: no file is an empty ledger, not an exception. Deserialize gives a List<Entry>; copy it into the Ledger through Add.' },
          { lines: [14, 17], label: 'Save rewrites the whole list; with whole-number money and a few hundred entries that is fine.' },
          { lines: [24, 28], label: 'A claim. A false one throws, the process exits non-zero, and the count is never printed: a failing self-test cannot look like success.' },
          { lines: [30, 39], label: 'Build a fixture in memory, make claims about it, return the count. No files, no args: pure, so it is the same everywhere.' },
        ],
      },
      contrast: [{ from: 'python', note: 'Python v1.0 had the same four verbs through argparse subparsers and a run_tests() runner. Here the dispatch is your own switch, the test runner is your own Check, and the exit code is an explicit return from Main.' }],
    },
    {
      kind: 'predict',
      prompt: 'In an empty folder you run these three commands. What does the third one print?',
      code: { language: 'shell', source: 'dotnet run -- add 50 food\ndotnet run -- add 50 food\ndotnet run -- balance' },
      choices: ['Balance: 100', 'Balance: 50', 'Balance: 0', 'Added 50 to food'],
      answer: 'Balance: 100',
      explanation: 'Each `add` loads whatever ledger.json holds, appends one entry and saves, so the second run finds the first entry and the file ends up with two. `balance` loads both and sums them. Persistence is the whole point of the file: without it every run would start from zero.',
    },
    {
      kind: 'create',
      prompt: `Finish LedgerSharp v1.0. The classes, storage and the Check helper are given; write \`SelfTest.Run\` (at least three claims about Ledger, with a fixture built in memory) and \`Program\` (\`Usage\` and the dispatch in \`Main\`) so that every line of the contract in the first step holds. Label each verb with a comment before you write it.`,
      language: 'csharp',
      starter: ledgerV10Starter,
      tests: [
        { description: 'add without a file', argv: ['add', '50', 'food'], expectedStdout: 'Added 50 to food' },
        { description: 'add an expense to an existing file', argv: ['add', '-30', 'food'], files: { 'ledger.json': '[{"Amount":100,"Category":"salary"}]' }, expectedStdout: 'Added -30 to food' },
        { description: 'balance without a file', argv: ['balance'], expectedStdout: 'Balance: 0' },
        { description: 'balance with one entry', argv: ['balance'], files: { 'ledger.json': '[{"Amount":100,"Category":"salary"}]' }, expectedStdout: 'Balance: 100' },
        { description: 'balance with three entries', argv: ['balance'], files: { 'ledger.json': ledger3 }, expectedStdout: 'Balance: 65' },
        { description: 'report with three entries in two categories', argv: ['report'], files: { 'ledger.json': ledger3 }, expectedStdout: 'food: -35\nsalary: 100\nEntries: 3' },
        { description: 'report without a file', argv: ['report'], expectedStdout: 'Entries: 0' },
        { description: 'selftest reports a count', argv: ['selftest'], expectedStdout: '^[1-9][0-9]* tests passed$', match: 'regex' },
      ],
      hint: 'Every verb starts with `Storage.Load()`; only `add` calls `Storage.Save`. `report` is a foreach over `ByCategory()` printing `kv.Key + ": " + kv.Value`, then the count. Print the self-test count as `SelfTest.Run() + " tests passed"`.',
      solution: ledgerV10,
      projectNote: 'LedgerSharp v1.0: the Python Ledger reborn in .NET, driven from the command line, persisted as JSON, able to prove itself with one verb. The Ledger class inside it is the one the minimal API from lesson 7-3 serves over HTTP.',
    },
    {
      kind: 'concept',
      title: 'Where the API would go next',
      body: `The CLI and the API of lesson 7-3 are two front ends over one \`Ledger\`. Each verb already has an HTTP twin, and the Azure track takes that twin off your laptop.

Three things change when it does. **Storage**: \`ledger.json\` in a working directory does not survive a server restart or a second instance; the Azure track moves it to a database or a blob, and \`Storage\` becomes an interface with two implementations. **Configuration**: the connection string arrives through \`Environment.GetEnvironmentVariable\`, never in the code. **Delivery**: \`dotnet publish\` builds the folder that App Service or a container runs, and the \`selftest\` verb grows into an xUnit project that a pipeline runs before every deployment.

Nothing in the C# changes shape. Routes stay routes, DTOs stay DTOs, and the status codes you can now predict are the same ones a monitoring dashboard will count.`,
      example: {
        language: 'text',
        source: `add <amount> <category>  ->  POST /entries   {"amount": n, "category": "..."}   201 Created
balance                  ->  GET  /balance                                     200 OK
report                   ->  GET  /report                                      200 OK
selftest                 ->  dotnet test in the pipeline, not a route`,
        labels: [
          { lines: [1, 1], label: 'A command that changes state becomes a POST with a body and answers 201.' },
          { lines: [2, 3], label: 'Reads become GETs; the printed lines become JSON objects.' },
          { lines: [4, 4], label: 'Tests do not ship as a route. They run before the deployment that ships the routes.' },
        ],
      },
      contrast: [{ from: 'python', note: 'The Python track ended at a tested CLI. This is the step it stopped before: the same program, listening instead of reading args, which is the shape every cloud track deploys.' }],
    },
  ],
};

export const m7: Module = {
  id: 'cs-m7',
  title: 'A web API',
  goal: 'Command-line verbs and exit codes, HTTP semantics, ASP.NET Core minimal API (routing, DTOs, Results), reading unfamiliar code, packaging.',
  projectMilestone: 'LedgerSharp v1.0: the ledger as an HTTP service, ready for Azure.',
  status: 'available',
  lessons: [l71, l72, l73, l74, l75],
};
