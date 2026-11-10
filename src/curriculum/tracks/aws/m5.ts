import type { Lesson, Module } from '../../schema';

/*
 * Module 5: Data: DynamoDB.
 * Continues the hand-built stack from Modules 3–4: Lambda `cyberling-classify` (Python 3.12, file app.py,
 * handler app.handler, role cyberling-lambda-role, env CURRENCY=USD) behind the HTTP API `cyberling-ledger`,
 * which Lesson 4-4 deleted and Lesson 5-3 recreates with two routes, `POST /entries` and `GET /balance`.
 * Creates the table `LedgerEntries` (partition key `owner` S, sort key `ts` S, on-demand billing); the handler
 * reads the table name from the environment variable TABLE_NAME. Lesson 5-4 deletes the table.
 */

const HANDLER_V3 = [
  'import json',
  'import os',
  'from datetime import datetime, timezone',
  'from decimal import Decimal',
  '',
  'import boto3',
  'from boto3.dynamodb.conditions import Key',
  '',
  'table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])',
  '',
  '',
  'def classify(amount):',
  '    return "expense" if amount < 0 else "income"',
  '',
  '',
  'def respond(status, payload):',
  '    return {',
  '        "statusCode": status,',
  '        "headers": {"Content-Type": "application/json"},',
  '        "body": json.dumps(payload),',
  '    }',
  '',
  '',
  'def handler(event, context):',
  '    route = event["routeKey"]',
  '    if route == "POST /entries":',
  '        body = json.loads(event["body"])',
  '        amount = Decimal(str(body["amount"]))',
  '        item = {',
  '            "owner": body.get("owner", "learner"),',
  '            "ts": datetime.now(timezone.utc).isoformat(),',
  '            "amount": amount,',
  '            "kind": classify(amount),',
  '        }',
  '        table.put_item(Item=item)',
  '        return respond(201, {"kind": item["kind"], "ts": item["ts"]})',
  '    if route == "GET /balance":',
  '        params = event.get("queryStringParameters") or {}',
  '        owner = params.get("owner", "learner")',
  '        result = table.query(KeyConditionExpression=Key("owner").eq(owner))',
  '        balance = sum(item["amount"] for item in result["Items"])',
  '        return respond(200, {"owner": owner, "balance": float(balance), "count": result["Count"]})',
  '    return respond(404, {"message": "no such route"})',
].join('\n');

const l51: Lesson = {
  id: 'aws-5-1',
  title: 'Tables, items and the key that decides everything',
  objective: 'Describe a DynamoDB table in terms of items, attributes and a partition-plus-sort primary key, and predict what GetItem and Query return for the LedgerEntries table.',
  minutes: 20,
  lexicon: [
    { id: 'aws.5.table', term: 'table', kind: 'service', meaning: 'A DynamoDB table: a named collection of items in one region with a fixed primary key and no other schema. Tables are created and deleted whole; there is no database above them.', example: 'aws dynamodb list-tables' },
    { id: 'aws.5.item', term: 'item / attribute', kind: 'concept', meaning: 'An item is one record, a set of named, typed attributes (at most 400 KB). Items in the same table may carry different attributes; only the key attributes are required.', example: '{"owner": "learner", "ts": "2026-11-10T09:15:00Z", "amount": -40, "kind": "expense"}', analogy: 'A dict in a list of dicts, like the Ledger\'s entries. The analogy breaks at the key: a Python list lets you find an entry by looping over anything, a table only by its key.' },
    { id: 'aws.5.partition-key', term: 'partition key (HASH)', kind: 'concept', meaning: 'The attribute DynamoDB hashes to decide where an item is stored. Every read must name it except Scan; items sharing it are stored together and can be fetched in one Query.', example: 'AttributeName=owner,KeyType=HASH' },
    { id: 'aws.5.sort-key', term: 'sort key (RANGE)', kind: 'concept', meaning: 'The optional second key attribute that orders items inside one partition and makes the pair unique. A string timestamp in ISO 8601 sorts by time because it sorts lexically.', example: 'AttributeName=ts,KeyType=RANGE' },
    { id: 'aws.5.get-query-scan', term: 'GetItem / Query / Scan', kind: 'concept', meaning: 'The three ways to read. GetItem needs the full key and returns one item; Query needs the partition key and returns every item in that partition, optionally narrowed by sort key; Scan reads the whole table and costs accordingly.', example: 'GetItem owner=learner ts=2026-11-10T09:15:00Z   Query owner=learner   Scan' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'No rows, no joins: items under a key',
      body: `The Ledger kept its entries in \`ledger.json\`. **DynamoDB** keeps them in a **table** of **items**. An item is a set of named, typed **attributes**; the only schema is the **primary key**: a **partition key**, hashed to decide where the item lives, plus an optional **sort key**, which orders items inside one partition. Everything else (\`amount\`, \`kind\`, a \`note\` on some items) is simply carried.

Our table is \`LedgerEntries\`: partition key \`owner\` (string), sort key \`ts\` (string, an ISO 8601 timestamp, so alphabetical order is time order).

No joins, no \`WHERE amount < 0\` across the table: you read by key. **GetItem** takes the full key and returns one item. **Query** takes a partition key and returns that partition in sort-key order, optionally narrowed. **Scan** reads everything and is the expensive last resort.

**Single-table thinking** in one paragraph: start from the questions you will ask ("every entry of one owner, newest first"), choose the key so each is one Query, and let one table hold several kinds of item side by side. Design for the reads, not from the entities.`,
      example: {
        language: 'text',
        source: 'Table LedgerEntries    partition key: owner (S)    sort key: ts (S)\n{"owner": "learner", "ts": "2026-11-10T09:15:00Z", "amount": -40, "kind": "expense"}\n{"owner": "learner", "ts": "2026-11-10T12:00:00Z", "amount": 120, "kind": "income", "note": "refund"}\n{"owner": "sam",     "ts": "2026-11-10T08:00:00Z", "amount": -12, "kind": "expense"}\nGetItem  owner=learner, ts=2026-11-10T09:15:00Z  -> exactly the first item\nQuery    owner=learner                           -> both learner items, in ts order\nScan                                             -> every item from every partition',
        labels: [
          { lines: [1, 1], label: 'The whole schema: a name and a two-part key. Nothing else is declared.' },
          { lines: [2, 4], label: 'Three items. Same key attributes, otherwise free-form: one carries a note, the others do not.' },
          { lines: [5, 5], label: 'Full key in, one item out.' },
          { lines: [6, 6], label: 'Partition key in, the whole partition out, sorted by ts.' },
          { lines: [7, 7], label: 'No key: read the table end to end.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'In the Python track you found entries with a loop or a comprehension: `[e for e in entries if e["owner"] == "learner"]`. That is a Scan. DynamoDB asks you to name the key up front so that the same question becomes a hash lookup, which costs the same at ten items and ten billion.' },
        { from: 'python', note: 'A Python dict needs unique keys; so does a table, but the key is the *pair* (owner, ts). Two entries for the same owner at the same timestamp would overwrite each other, which is why the handler in 5-3 uses a timestamp with microseconds.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The table holds the three items from the example. You Query with only the partition key. What comes back?',
      code: { language: 'text', source: 'Query LedgerEntries where owner = "learner"' },
      choices: [
        'Both learner items, in ts order, with Count 2',
        'Only the first learner item: a Query returns one item per call',
        'ValidationException: a Query needs the full primary key',
        'All three items: Query filters after reading the table',
      ],
      answer: 'Both learner items, in ts order, with Count 2',
      explanation: 'Query needs only the partition key; the sort key is optional and, when given, narrows the range (ts between two dates, ts beginning with "2026-11"). Sam\'s item lives in another partition and is never touched. The response carries Items and a Count, and that Count is how 5-2 verifies your work.',
    },
    {
      kind: 'predict',
      prompt: 'Same table. This time you call GetItem with only the owner. What happens?',
      code: { language: 'text', source: 'GetItem LedgerEntries with key {"owner": "learner"}' },
      choices: [
        'ValidationException: the provided key element does not match the schema',
        'The first learner item by ts',
        'Both learner items',
        'An empty result and no error',
      ],
      answer: 'ValidationException: the provided key element does not match the schema',
      explanation: 'GetItem fetches exactly one item, so it needs the *full* primary key: owner and ts. The request is rejected before anything is read, with the error code ValidationException. When you want "everything for this owner", Query is the call; when you have both halves of the key, GetItem is cheaper and more direct.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the steps of designing the LedgerEntries table the DynamoDB way.',
      language: 'text',
      indentation: false,
      solution: [
        'List the questions the API will ask: store one entry; read every entry of one owner, newest first',
        'Pick the partition key that every question names: owner',
        'Pick a sort key that orders items inside a partition and makes the key unique: ts',
        'Leave the other attributes (amount, kind, note) undeclared; items carry what they carry',
        'Create the table with that key and nothing else',
      ],
      distractors: [
        'Draw the entities first (Owners table, Entries table) and plan to join them at read time',
        'Declare every attribute and its type up front so the table rejects items with a missing note',
      ],
      explanation: 'DynamoDB design runs from access patterns to key, not from entities to tables: there is no join, so the data a question needs must sit in one partition. Only key attributes are declared; declaring the rest is a relational habit the table cannot even express.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Look at the DynamoDB side of your account before creating anything.',
      warning: 'Nothing in this lesson creates a resource or costs anything: list-tables and describe-limits are free control-plane calls. There is nothing to tear down.',
      checklist: [
        'Run `aws dynamodb list-tables` (us-east-1 or your default region). On a fresh account the list is empty, but the JSON object and its one key are still printed.',
        'Run `aws dynamodb describe-limits` and read the four account-level capacity numbers. They matter only for provisioned tables, which 5-4 explains; ours will be on-demand.',
        'On paper, write the two questions the Ledger API will ask of the table and, under each, which call answers it (GetItem, Query or Scan) and which key attributes that call needs.',
        'Teardown: nothing was created.',
      ],
      verify: { question: 'list-tables printed a JSON object with one key whose value is a list. Type that key exactly.', answers: ['TableNames'] },
    },
  ],
};

const l52: Lesson = {
  id: 'aws-5-2',
  title: 'The table from the CLI and from boto3',
  objective: 'Create the LedgerEntries table with on-demand billing, write items with typed JSON, query a partition, and do the same from Python with a boto3 Table.',
  minutes: 30,
  lexicon: [
    { id: 'aws.5.create-table', term: 'create-table --attribute-definitions / --key-schema', kind: 'pattern', meaning: 'Create a table by declaring the types of the key attributes (attribute-definitions) and their roles (key-schema: HASH for the partition key, RANGE for the sort key). Only key attributes are declared.', example: 'aws dynamodb create-table --table-name LedgerEntries --attribute-definitions AttributeName=owner,AttributeType=S AttributeName=ts,AttributeType=S --key-schema AttributeName=owner,KeyType=HASH AttributeName=ts,KeyType=RANGE --billing-mode PAY_PER_REQUEST' },
    { id: 'aws.5.pay-per-request', term: '--billing-mode PAY_PER_REQUEST', kind: 'pattern', meaning: 'On-demand billing: no capacity to size, you pay per read and write request unit. The right default for a table whose traffic you cannot predict, which includes every table in this track.', example: 'aws dynamodb create-table ... --billing-mode PAY_PER_REQUEST' },
    { id: 'aws.5.typed-json', term: '{"S": "..."} / {"N": "-40"}', kind: 'pattern', meaning: 'The low-level item format the CLI and the API use: every value is wrapped in a one-letter type tag (S string, N number, BOOL, L list, M map). Numbers are sent as strings so that no JSON parser rounds them.', example: '--item \'{"owner": {"S": "learner"}, "ts": {"S": "2026-11-10T09:15:00Z"}, "amount": {"N": "-40"}}\'' },
    { id: 'aws.5.key-condition', term: '--key-condition-expression "#o = :o"', kind: 'pattern', meaning: 'The Query condition on key attributes. #name placeholders stand for attribute names (required when the name is a reserved word, and owner is one), :value placeholders for values supplied in typed JSON.', example: 'aws dynamodb query --table-name LedgerEntries --key-condition-expression "#o = :o" --expression-attribute-names \'{"#o": "owner"}\' --expression-attribute-values \'{":o": {"S": "learner"}}\'' },
    { id: 'aws.5.table-resource', term: 'boto3.resource("dynamodb").Table(name)', kind: 'pattern', meaning: 'The high-level boto3 object for one table. Its put_item takes a plain dict (no type tags) and its query takes Key("owner").eq(value), which writes the placeholders for you. Responses keep the CLI\'s keys: Items, Count.', example: 'table = boto3.resource("dynamodb").Table("LedgerEntries")\ntable.query(KeyConditionExpression=Key("owner").eq("learner"))["Count"]' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Create, put, query: the CLI grammar',
      body: `**create-table** declares the key twice: \`--attribute-definitions\` gives each key attribute a type (\`S\` string, \`N\` number, \`B\` binary) and \`--key-schema\` gives it a role, \`HASH\` for the partition key and \`RANGE\` for the sort key. Non-key attributes are never declared. \`--billing-mode PAY_PER_REQUEST\` chooses on-demand billing; a table takes a few seconds to become \`ACTIVE\`, and \`wait table-exists\` blocks until it is.

**put-item** sends the item in **typed JSON**: every value wrapped in a type tag, \`{"S": "learner"}\`, \`{"N": "-40"}\`. Notice the number is quoted. put-item replaces any item with the same key; there is no error for "already exists".

**query** takes a **key condition expression**. Attribute names that collide with DynamoDB's reserved words must go through a \`#placeholder\`, and \`owner\` is a reserved word, so the expression reads \`#o = :o\`, with the name and the value supplied separately. The response has \`Items\`, \`Count\` and \`ScannedCount\`.`,
      example: {
        language: 'shell',
        source: 'aws dynamodb create-table --table-name LedgerEntries \\\n  --attribute-definitions AttributeName=owner,AttributeType=S AttributeName=ts,AttributeType=S \\\n  --key-schema AttributeName=owner,KeyType=HASH AttributeName=ts,KeyType=RANGE \\\n  --billing-mode PAY_PER_REQUEST\naws dynamodb wait table-exists --table-name LedgerEntries\naws dynamodb put-item --table-name LedgerEntries \\\n  --item \'{"owner": {"S": "learner"}, "ts": {"S": "2026-11-10T09:15:00Z"}, "amount": {"N": "-40"}, "kind": {"S": "expense"}}\'\naws dynamodb query --table-name LedgerEntries \\\n  --key-condition-expression "#o = :o" \\\n  --expression-attribute-names \'{"#o": "owner"}\' \\\n  --expression-attribute-values \'{":o": {"S": "learner"}}\'',
        labels: [
          { lines: [1, 2], label: 'Name the table and type the two key attributes. Nothing else is declared.' },
          { lines: [3, 3], label: 'Assign roles: owner is the partition key, ts the sort key.' },
          { lines: [4, 4], label: 'On-demand billing: no capacity numbers to choose.' },
          { lines: [5, 5], label: 'Block until the table is ACTIVE; a put-item before that fails.' },
          { lines: [6, 7], label: 'Write one item in typed JSON. The number travels as a string.' },
          { lines: [8, 11], label: 'Read the learner partition. owner is a reserved word, so it goes through #o.' },
        ],
      },
      contrast: [{ from: 'python', note: 'Typed JSON is the wire format; think of it as what json.dumps would produce if Python had to tell the receiver the type of every value. The boto3 Table object in the next step hides it, the way json.load hid the bytes of ledger.json.' }],
    },
    {
      kind: 'predict',
      prompt: 'You write the amount as a bare JSON number. The CLI rejects the command with a parameter validation error. Why does the N type insist on a string?',
      code: { language: 'shell', source: 'aws dynamodb put-item --table-name LedgerEntries \\\n  --item \'{"owner": {"S": "learner"}, "ts": {"S": "2026-11-10T09:15:00Z"}, "amount": {"N": -40}}\'' },
      choices: [
        'Numbers travel as strings so that no JSON parser on the way turns them into binary floats; DynamoDB keeps up to 38 decimal digits exactly',
        'Every value in CLI JSON must be a string; it is a quoting rule of the aws command, not of DynamoDB',
        'N stands for "numeric string": the value is stored as text and compared alphabetically',
        'A CLI quirk only: boto3 accepts Python floats for N attributes',
      ],
      answer: 'Numbers travel as strings so that no JSON parser on the way turns them into binary floats; DynamoDB keeps up to 38 decimal digits exactly',
      explanation: 'Most JSON parsers decode a number into an IEEE double, which cannot hold 0.1 exactly or more than about 16 digits. DynamoDB numbers are exact decimals with up to 38 digits, so the API refuses to let a number pass through a stage that would round it: on the wire it is a string, and DynamoDB parses it itself. It is still stored and compared as a number (-40 < 120). boto3 enforces the same rule in Python by refusing float and asking for Decimal, which the next lesson leans on.',
    },
    {
      kind: 'predict',
      prompt: 'The table exists and holds the learner item. You query it without placeholders. What does the CLI print?',
      code: { language: 'shell', source: 'aws dynamodb query --table-name LedgerEntries \\\n  --key-condition-expression "owner = :o" \\\n  --expression-attribute-values \'{":o": {"S": "learner"}}\'' },
      choices: [
        'An error occurred (ValidationException): Invalid KeyConditionExpression: Attribute name is a reserved keyword; reserved keyword: owner',
        'The learner item, with Count 1',
        'Nothing: without --expression-attribute-names the expression is ignored and Count is 0',
        'An error occurred (AccessDeniedException): the IAM user may not query',
      ],
      answer: 'An error occurred (ValidationException): Invalid KeyConditionExpression: Attribute name is a reserved keyword; reserved keyword: owner',
      explanation: 'DynamoDB reserves a few hundred words for its expression language (owner, name, count, date, status, year and many more). An attribute with one of those names is fine to store but must be written as a #placeholder in every expression, mapped through --expression-attribute-names. The error is a ValidationException, so nothing was read and nothing was charged. boto3\'s Key("owner").eq(...) generates the placeholder for you, which is one reason the handler uses it.',
    },
    {
      kind: 'concept',
      title: 'The same three calls from Python',
      body: `boto3 offers DynamoDB twice. \`boto3.client("dynamodb")\` mirrors the CLI, typed JSON included. \`boto3.resource("dynamodb").Table("LedgerEntries")\` is the high-level **Table** object the handler will use: \`put_item(Item=...)\` takes a plain dict and adds the type tags itself, and \`query(KeyConditionExpression=Key("owner").eq("learner"))\` builds the expression, the \`#o\` placeholder and the typed value from a small object imported from \`boto3.dynamodb.conditions\`.

The response is a dict with the CLI's keys: \`Items\` is a list of plain dicts, \`Count\` the number returned. Python \`int\` is accepted for a number; \`float\` is not, and 5-3 explains what to use instead. Credentials come from the chain you met in Module 2: nothing in the code.`,
      example: {
        language: 'python',
        source: 'import boto3\nfrom boto3.dynamodb.conditions import Key\n\ntable = boto3.resource("dynamodb").Table("LedgerEntries")\n\ntable.put_item(Item={"owner": "learner", "ts": "2026-11-10T12:00:00Z", "amount": 120, "kind": "income"})\n\nresult = table.query(KeyConditionExpression=Key("owner").eq("learner"))\nfor item in result["Items"]:\n    print(item["ts"], item["amount"], item["kind"])\nprint("count:", result["Count"])',
        labels: [
          { lines: [1, 2], label: 'The SDK, and the helper that builds key conditions.' },
          { lines: [4, 4], label: 'One object for one table; the resource looks up nothing until you call it.' },
          { lines: [6, 6], label: 'Write a plain dict; boto3 adds the S and N tags.' },
          { lines: [8, 8], label: 'Query the learner partition. Reserved-word placeholders are generated for you.' },
          { lines: [9, 11], label: 'Items are plain dicts in ts order; Count matches the CLI field.' },
        ],
      },
      contrast: [{ from: 'python', note: 'Key("owner").eq("learner") is an object that *describes* a comparison, not the result of one; boto3 serialises it into "#n0 = :v0" plus the two placeholder maps. Compare the Python track, where `e["owner"] == "learner"` was evaluated on the spot.' }],
    },
    {
      kind: 'cloze',
      prompt: 'Complete the create-table command for LedgerEntries with on-demand billing.',
      language: 'shell',
      template: 'aws dynamodb create-table --table-name {{table}} \\\n  --attribute-definitions AttributeName=owner,AttributeType={{type}} AttributeName=ts,AttributeType=S \\\n  --key-schema AttributeName=owner,KeyType={{hash}} AttributeName=ts,KeyType={{range}} \\\n  --billing-mode {{billing}}',
      blanks: [
        { id: 'table', answers: ['LedgerEntries'], hint: 'The table name the whole track uses, CamelCase.' },
        { id: 'type', answers: ['S'], hint: 'owner is a string; one letter.' },
        { id: 'hash', answers: ['HASH'], hint: 'The key-schema role of the partition key.' },
        { id: 'range', answers: ['RANGE'], hint: 'The key-schema role of the sort key.' },
        { id: 'billing', answers: ['PAY_PER_REQUEST'], hint: 'On-demand, in SHOUTING_CASE with underscores.' },
      ],
      explanation: 'Types live in attribute-definitions, roles in key-schema: HASH is the partition key, RANGE the sort key. PAY_PER_REQUEST means no capacity to size; the alternative, PROVISIONED, is 5-4\'s topic.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Create the table, write two entries and read them back.',
      warning: 'An idle on-demand table costs nothing, and the first 25 GB of storage are free. The handful of requests here cost a fraction of a cent (on-demand writes are priced around a dollar per million, reads a quarter of that). The table stays for 5-3 and 5-4 unless you stop here, in which case the last item removes it.',
      checklist: [
        'Create the table with the completed cloze command (us-east-1 or your default region), then `aws dynamodb wait table-exists --table-name LedgerEntries`.',
        'Confirm the shape: `aws dynamodb describe-table --table-name LedgerEntries --query "Table.[TableStatus,KeySchema,BillingModeSummary.BillingMode]"`.',
        'Write two items with put-item in typed JSON: owner `learner`, ts `2026-11-10T09:15:00Z` with amount `-40` and kind `expense`; then ts `2026-11-10T12:00:00Z` with amount `120` and kind `income`. Quote the numbers.',
        'Query the partition with the four-line query from the concept step and read Items and Count.',
        'Fetch one item by full key: `aws dynamodb get-item --table-name LedgerEntries --key \'{"owner": {"S": "learner"}, "ts": {"S": "2026-11-10T09:15:00Z"}}\'`. Then try it with only the owner and read the ValidationException you predicted.',
        'Optional, from Python: in a virtual environment with boto3 (Module 2), run the concept\'s script with a third ts and watch Count become 3; the next step then reports 3 instead of 2. For the verification below, use the count you saw right after the two CLI puts.',
        'Teardown: keep the table for 5-3. If you are stopping here, `aws dynamodb delete-table --table-name LedgerEntries`; recreating it is one command.',
      ],
      verify: { question: 'After the two put-item calls, the query response had a numeric field named Count. Type its value.', answers: ['2'] },
    },
  ],
};

const l53: Lesson = {
  id: 'aws-5-3',
  title: 'The Lambda writes and reads',
  objective: 'Extend the handler so POST /entries stores an item and GET /balance sums a Query, pass the table name through an environment variable, and deploy both routes.',
  minutes: 35,
  lexicon: [
    { id: 'aws.5.decimal', term: 'Decimal(str(x))', kind: 'pattern', meaning: 'The number type boto3 requires for DynamoDB: it refuses float ("Float types are not supported. Use Decimal types instead."). Convert through str so the digits you saw are the digits stored; numbers read back are Decimal too, and json.dumps cannot serialise them without float() or str().', example: 'from decimal import Decimal\namount = Decimal(str(body["amount"]))' },
    { id: 'aws.5.table-name-env', term: 'os.environ["TABLE_NAME"]', kind: 'pattern', meaning: 'Read the table name from the function\'s environment instead of hard-coding it, so the same code serves a hand-built table today and a generated one in Module 7. Set with update-function-configuration --environment, which replaces the whole variable set.', example: 'aws lambda update-function-configuration --function-name cyberling-classify --environment "Variables={TABLE_NAME=LedgerEntries,CURRENCY=USD}"' },
    { id: 'aws.5.route-dispatch', term: 'event["routeKey"]', kind: 'pattern', meaning: 'In the HTTP API proxy event, the matched route ("POST /entries", "GET /balance") as one string. Branching on it lets one function serve several routes; an unknown key gets a 404 from your code.', example: 'if event["routeKey"] == "GET /balance":' },
    { id: 'aws.5.sum-query', term: 'sum(item["amount"] for item in result["Items"])', kind: 'pattern', meaning: 'Aggregate in the function: DynamoDB has no SUM. Query the partition, add the Decimals in Python, convert once for the JSON response. Fine for hundreds of items; a running total item is the pattern for millions.', example: 'balance = sum(item["amount"] for item in result["Items"])' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'One function, two routes, one table',
      body: `The Module 4 handler classified and forgot. This version keeps the proxy shape and adds the table. Three things are new.

**Dispatch.** The proxy event carries \`routeKey\`, the matched \`"METHOD /path"\`. The handler branches on it: \`POST /entries\` writes, \`GET /balance\` reads, anything else gets a 404 from our code.

**Decimal.** boto3's Table rejects Python \`float\` outright, so the amount from the body becomes \`Decimal(str(...))\`: through \`str\`, so \`-40.5\` stays \`-40.5\` and does not pick up binary noise. Items read back carry \`Decimal\` too, and \`json.dumps\` cannot serialise that, so the balance is converted with \`float()\` on the way out (use \`str()\` when every cent must survive the trip).

**Configuration.** The table name comes from \`os.environ["TABLE_NAME"]\`, exactly like \`CURRENCY\` in Module 3, so Module 7 can hand the function a generated name.

The sort key is \`datetime.now(timezone.utc).isoformat()\`: a string, microseconds included, so two fast POSTs do not share a key. POST answers **201**, as promised in Module 4; GET answers **200** with the sum.`,
      example: {
        language: 'python',
        source: HANDLER_V3,
        labels: [
          { lines: [1, 7], label: 'Standard library for JSON, env, time and exact decimals; boto3 and the key-condition helper.' },
          { lines: [9, 9], label: 'One Table object at import time (reused across warm invocations); the name comes from the environment.' },
          { lines: [12, 13], label: 'The rule from Module 3, unchanged. It works on Decimal as it did on int.' },
          { lines: [16, 21], label: 'Wrap any payload in the proxy response shape, once.' },
          { lines: [24, 25], label: 'Read the matched route from the proxy event.' },
          { lines: [26, 36], label: 'POST: parse the body, make the amount a Decimal, build the item with owner and a UTC timestamp key, store it, answer 201.' },
          { lines: [37, 42], label: 'GET: read owner from the query string (default learner), Query the partition, sum in Python, answer 200 with a float.' },
          { lines: [43, 43], label: 'Any route you did not wire gets an honest 404.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'sum(item["amount"] for item in result["Items"]) is the generator-expression sum from the Python track\'s balance function. The only change is where the entries come from: a Query response instead of a list you loaded from ledger.json.' },
        { from: 'python', note: 'Decimal is the standard library\'s exact decimal type (import decimal). You met float\'s 0.1 + 0.2 problem in the Python track; DynamoDB simply refuses to let it into the table.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'A first draft converts the amount with float. The handler receives a POST with body {"amount": -40.5}. What happens at put_item?',
      code: { language: 'python', source: 'body = json.loads(event["body"])\namount = float(body["amount"])\ntable.put_item(Item={"owner": "learner", "ts": now, "amount": amount, "kind": classify(amount)})' },
      choices: [
        'TypeError: Float types are not supported. Use Decimal types instead. Raised by boto3 before any request is sent; the client sees a 500',
        'The item is stored with amount -40.5 as an N attribute',
        'The item is stored with amount "-40.5" as an S attribute',
        'ValidationException from DynamoDB: the amount is not a string',
      ],
      answer: 'TypeError: Float types are not supported. Use Decimal types instead. Raised by boto3 before any request is sent; the client sees a 500',
      explanation: 'The Table serialiser checks every value\'s type on the client side and refuses float with that exact message, because a float has already lost the exactness DynamoDB numbers promise. Nothing reaches the service; the uncaught TypeError ends the invocation, Lambda logs the traceback, and API Gateway answers 500. int is accepted (it is exact), and Decimal(str(x)) is the fix for anything that might carry cents.',
    },
    {
      kind: 'predict',
      prompt: 'Two items were stored with amounts Decimal("-40") and Decimal("120"). This GET branch runs. What does the print show, and what does the client get?',
      code: { language: 'python', source: 'result = table.query(KeyConditionExpression=Key("owner").eq("learner"))\nprint(type(result["Items"][0]["amount"]).__name__)\nbalance = sum(item["amount"] for item in result["Items"])\nreturn respond(200, {"balance": balance})' },
      choices: [
        'Decimal; then json.dumps raises TypeError: Object of type Decimal is not JSON serializable, and the client sees a 500',
        'int; the client gets 200 with {"balance": 80}',
        'float; the client gets 200 with {"balance": 80.0}',
        'str; the client gets 200 with {"balance": "-40120"}',
      ],
      answer: 'Decimal; then json.dumps raises TypeError: Object of type Decimal is not JSON serializable, and the client sees a 500',
      explanation: 'Every N attribute comes back as decimal.Decimal, whole numbers included; boto3 never guesses int. Summing Decimals gives Decimal("80"), and the standard json module refuses it. Convert at the edge: float(balance) for a readable number, str(balance) when exactness matters more than type. That conversion is the one line the parsons and the working handler both contain.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble a trimmed handler: POST stores an item, anything else returns the balance. Indentation counts. (The full handler also checks for GET /balance and answers 404 otherwise.)',
      language: 'python',
      indentation: true,
      solution: [
        'def handler(event, context):',
        '    if event["routeKey"] == "POST /entries":',
        '        body = json.loads(event["body"])',
        '        amount = Decimal(str(body["amount"]))',
        '        table.put_item(Item={"owner": "learner", "ts": now_iso(), "amount": amount, "kind": classify(amount)})',
        '        return respond(201, {"kind": classify(amount)})',
        '    result = table.query(KeyConditionExpression=Key("owner").eq("learner"))',
        '    total = sum(item["amount"] for item in result["Items"])',
        '    return respond(200, {"balance": float(total)})',
      ],
      distractors: [
        '        amount = float(body["amount"])',
        '        table.put_item({"owner": "learner", "ts": now_iso(), "amount": amount, "kind": classify(amount)})',
        '    result = table.query(Key("owner").eq("learner"))',
        '    return respond(200, {"balance": total})',
      ],
      explanation: 'float is refused by put_item; Decimal(str(...)) is the accepted exact form. Table methods take keyword arguments only: Item=, KeyConditionExpression=; a positional dict or condition raises TypeError. And the total is a Decimal until float() makes it JSON-serialisable. The POST lines sit inside the if; the Query lines run for the other route, one level out.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the imports and configuration the handler needs.',
      language: 'python',
      template: 'import os\nfrom decimal import {{dec}}\nfrom boto3.dynamodb.conditions import {{key}}\n\ntable = boto3.resource("dynamodb").Table(os.environ["{{name}}"])\n\n\ndef handler(event, context):\n    if event["{{route}}"] == "GET /balance":\n        result = table.query(KeyConditionExpression=Key("owner").eq("learner"))\n        return respond(200, {"balance": float(sum(i["amount"] for i in result["Items"]))})',
      blanks: [
        { id: 'dec', answers: ['Decimal'], hint: 'The exact number type boto3 asks for instead of float.' },
        { id: 'key', answers: ['Key'], hint: 'The helper whose .eq() builds a key condition.' },
        { id: 'name', answers: ['TABLE_NAME'], hint: 'The environment variable Module 7 will also set; upper case with an underscore.' },
        { id: 'route', answers: ['routeKey'], hint: 'The proxy-event field holding "METHOD /path"; camelCase like statusCode.' },
      ],
      explanation: 'Decimal and Key are the two imports Module 4\'s handler did not have; TABLE_NAME is read once at import time; routeKey is how one function tells its routes apart.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Deploy the new handler, wire both routes, and watch entries land in the table.',
      warning: 'Lambda invocations, the API requests and the few DynamoDB requests here stay inside free tiers or cost a fraction of a cent. The real exposure in this lesson is permission, not money: AmazonDynamoDBFullAccess lets the function touch every table in the account. It is the quick way to get moving; Lesson 6-1 replaces it with a two-action policy on one table ARN. Delete the API if you stop here.',
      checklist: [
        'Make sure the table exists (`aws dynamodb describe-table --table-name LedgerEntries --query Table.TableStatus`); if you deleted it after 5-2, recreate it with the cloze command and wait for table-exists.',
        'Let the function reach DynamoDB: `aws iam attach-role-policy --role-name cyberling-lambda-role --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess`. Too broad on purpose; Module 6 narrows it.',
        'Set the table name, keeping CURRENCY (the flag replaces the whole set): `aws lambda update-function-configuration --function-name cyberling-classify --environment "Variables={TABLE_NAME=LedgerEntries,CURRENCY=USD}"`, then `aws lambda wait function-updated --function-name cyberling-classify`.',
        'Save the concept handler as `app.py` (the handler setting is still `app.handler` from Module 3), `zip function.zip app.py`, `aws lambda update-function-code --function-name cyberling-classify --zip-file fileb://function.zip`, and wait for function-updated again.',
        'Recreate the API that 4-4 deleted: `create-api --name cyberling-ledger --protocol-type HTTP --target <function arn>`, `lambda add-permission` with the new api id (statement-id apigw-invoke; remove the old statement first if it still exists), `get-integrations`, then two routes: `create-route --route-key \'POST /entries\'` and `create-route --route-key \'GET /balance\'`, both with `--target integrations/<integration-id>`. Delete the `$default` route. Keep the endpoint in a variable: `API=<ApiEndpoint>`.',
        'Write: `curl -i -X POST "$API/entries" -H \'content-type: application/json\' -d \'{"amount": -40}\'`. Read the status line, then the body with kind and ts. Repeat with amounts 120 and -15.',
        'Read: `curl -i "$API/balance"`. The body is a JSON object with the owner, the sum and the number of items. Then `curl -i "$API/balance?owner=nobody"` and see a zero sum with count 0, no error.',
        'Cross-check from the CLI: the query from 5-2 with `--select COUNT` added prints the same Count the API reported (the two items from 5-2 are included if you kept them).',
        'If anything answered 500, `aws logs tail /aws/lambda/cyberling-classify --since 10m` shows the traceback: the two TypeErrors from the predict steps and a KeyError on TABLE_NAME are the usual three.',
        'Teardown: the table stays for 5-4, which deletes it. If you stop here, `aws apigatewayv2 delete-api --api-id <api-id>` and `aws iam detach-role-policy --role-name cyberling-lambda-role --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess`; otherwise keep both for the next lesson and Module 6.',
      ],
      verify: { question: 'The GET /balance response body is a JSON object with three keys. Type the key that holds the sum of the amounts.', answers: ['balance'] },
    },
  ],
};

const l54: Lesson = {
  id: 'aws-5-4',
  title: 'Capacity, pricing and teardown',
  objective: 'Choose between on-demand and provisioned capacity, reason about request units and item size, enable TTL and point-in-time recovery, and delete the table with proof.',
  minutes: 25,
  lexicon: [
    { id: 'aws.5.capacity-modes', term: 'on-demand vs provisioned', kind: 'concept', meaning: 'Two ways to pay. On-demand (PAY_PER_REQUEST) bills each request unit and scales by itself. Provisioned reserves read and write capacity units per second, cheaper per unit for steady load, throttled (ProvisionedThroughputExceededException) above it. Switchable, at most once per 24 hours.', example: 'aws dynamodb update-table --table-name LedgerEntries --billing-mode PROVISIONED --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5' },
    { id: 'aws.5.request-unit', term: 'read / write request unit', kind: 'concept', meaning: 'The billing grain. One write unit per 1 KB of item (rounded up); one read unit per 4 KB for a strongly consistent read, half that for an eventually consistent one. A Query is charged on the total bytes it returns, not per item.', example: 'a 2.5 KB item: 3 write units to put; 1 read unit to get' },
    { id: 'aws.5.ttl', term: 'TTL (update-time-to-live)', kind: 'pattern', meaning: 'Name one Number attribute holding a Unix epoch in seconds; DynamoDB deletes items past that time in the background, typically within a couple of days, at no write cost. Items without the attribute, or with it as a string, never expire.', example: 'aws dynamodb update-time-to-live --table-name LedgerEntries --time-to-live-specification Enabled=true,AttributeName=expires_at' },
    { id: 'aws.5.pitr', term: 'point-in-time recovery', kind: 'concept', meaning: 'Continuous backups that let you restore the table to any second in the last 35 days, into a new table. Billed per GB-month of table data; protects against your own bad writes, which replication does not.', example: 'aws dynamodb update-continuous-backups --table-name LedgerEntries --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true' },
    { id: 'aws.5.delete-table', term: 'delete-table', kind: 'pattern', meaning: 'Removes the table and every item in it; no empty-table requirement, no confirmation. describe-table afterwards fails with ResourceNotFoundException. Any PITR system backup it leaves behind is kept 35 days.', example: 'aws dynamodb delete-table --table-name LedgerEntries\naws dynamodb wait table-not-exists --table-name LedgerEntries' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'What you pay for, what survives, and the exit',
      body: `**Capacity.** On-demand bills per **request unit** and scales on its own: right when traffic is unknown or spiky, which is the Ledger. **Provisioned** reserves read and write units per second, cheaper per unit for steady load, and throttles requests above the reservation. Modes can be switched once a day.

**Units and size.** A write unit covers 1 KB of item, rounded up; a read unit covers 4 KB strongly consistent, 8 KB eventually consistent. Items are capped at 400 KB; storage bills per GB-month after a free 25 GB. A Ledger entry is about 100 bytes: one unit each way.

**TTL** names a Number attribute holding a Unix epoch in seconds; expired items are deleted in the background, typically within 48 hours, free. **Point-in-time recovery** keeps 35 days of continuous backups to restore the table as of any second, into a new table; billed per GB-month, it defends against your own bad write.

**Teardown.** \`delete-table\` removes the table and all its items in one call. The proof that it worked is an error.`,
      example: {
        language: 'shell',
        source: 'aws dynamodb describe-table --table-name LedgerEntries \\\n  --query "Table.[BillingModeSummary.BillingMode,ItemCount,TableSizeBytes]"\naws dynamodb update-time-to-live --table-name LedgerEntries \\\n  --time-to-live-specification Enabled=true,AttributeName=expires_at\naws dynamodb update-continuous-backups --table-name LedgerEntries \\\n  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true\naws dynamodb delete-table --table-name LedgerEntries\naws dynamodb wait table-not-exists --table-name LedgerEntries\naws dynamodb describe-table --table-name LedgerEntries',
        labels: [
          { lines: [1, 2], label: 'Read the billing mode, item count and size. Both counts are refreshed about every six hours, so they may lag.' },
          { lines: [3, 4], label: 'Expire items whose expires_at (a Number, epoch seconds) is in the past.' },
          { lines: [5, 6], label: 'Turn on continuous backups with a 35-day window.' },
          { lines: [7, 8], label: 'Remove the table and block until it is gone.' },
          { lines: [9, 9], label: 'Ask about it again: the error code is the proof.' },
        ],
      },
      contrast: [{ from: 'python', note: 'ledger.json had no capacity to size and no backup unless you copied the file. The cloud trade: you never run out of disk, and you pay per request instead; backups become a flag you turn on rather than a cp you remember to run.' }],
    },
    {
      kind: 'predict',
      prompt: 'An on-demand table receives this put-item with a 2.5 KB item. How many write request units is it billed?',
      code: { language: 'shell', source: 'aws dynamodb put-item --table-name LedgerEntries --item file://big-item.json   # 2.5 KB of attributes' },
      choices: ['3: write units are per 1 KB, rounded up', '1: one request, one unit', '2.5: units are exact', '0: on-demand tables have no units, only a monthly fee'],
      answer: '3: write units are per 1 KB, rounded up',
      explanation: 'Write request units count 1 KB each and round up, so 2.5 KB costs 3; a 100-byte Ledger entry costs 1, the same as a 1 KB one. Reads are gentler: 4 KB per unit strongly consistent, 8 KB eventually consistent, and a Query is charged on the bytes returned in total. On-demand has no monthly fee; it has exactly these units.',
    },
    {
      kind: 'predict',
      prompt: 'TTL is enabled on expires_at. This item is written. What happens to it?',
      code: { language: 'shell', source: 'aws dynamodb put-item --table-name LedgerEntries \\\n  --item \'{"owner": {"S": "learner"}, "ts": {"S": "2026-11-10T09:15:00Z"}, "amount": {"N": "-40"}, "expires_at": {"S": "2026-11-01T00:00:00Z"}}\'' },
      choices: [
        'It never expires: TTL only reads a Number attribute holding epoch seconds, and a string is ignored',
        'It is deleted within 48 hours, since the date is in the past',
        'put-item is rejected with a ValidationException because expires_at must be a number',
        'It is deleted immediately on write',
      ],
      answer: 'It never expires: TTL only reads a Number attribute holding epoch seconds, and a string is ignored',
      explanation: 'TTL is silent about mistakes. The attribute must be type N with a Unix timestamp in seconds (for example 1761955200); an S value, a millisecond timestamp (far future) or a missing attribute all mean "keep forever", and put-item does not validate it. When the value is right, deletion is a background process: within 48 hours, not at the instant of expiry, and a Query in between still returns the item unless you filter it yourself.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the operations commands: expiry, backups, and a clean deletion.',
      language: 'shell',
      template: 'aws dynamodb update-time-to-live --table-name LedgerEntries \\\n  --time-to-live-specification Enabled=true,AttributeName={{attr}}\naws dynamodb update-continuous-backups --table-name LedgerEntries \\\n  --point-in-time-recovery-specification {{pitr}}=true\naws dynamodb {{del}} --table-name LedgerEntries\naws dynamodb wait {{waiter}} --table-name LedgerEntries',
      blanks: [
        { id: 'attr', answers: ['expires_at'], hint: 'The Number attribute the lesson uses for the expiry epoch.' },
        { id: 'pitr', answers: ['PointInTimeRecoveryEnabled'], hint: 'CamelCase, the one key of the specification.' },
        { id: 'del', answers: ['delete-table'], hint: 'The verb that removes a table and its items.' },
        { id: 'waiter', answers: ['table-not-exists'], hint: 'The opposite of the waiter you used after create-table.' },
      ],
      explanation: 'TTL and PITR are table settings, switched on with their own update-* commands; delete-table takes no flags and asks no questions, and table-not-exists polls describe-table until it fails.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the teardown so that the final command proves the table is gone.',
      language: 'shell',
      indentation: false,
      solution: [
        'aws dynamodb describe-table --table-name LedgerEntries --query "Table.[TableStatus,ItemCount]"',
        'aws dynamodb delete-table --table-name LedgerEntries',
        'aws dynamodb wait table-not-exists --table-name LedgerEntries',
        'aws dynamodb describe-table --table-name LedgerEntries',
      ],
      distractors: [
        'aws dynamodb delete-item --table-name LedgerEntries --key \'{"owner": {"S": "learner"}}\'   # empty the table first',
        'aws dynamodb delete-table --table-name LedgerEntries --force',
      ],
      explanation: 'A table does not need emptying before deletion (and that delete-item would fail anyway: it names half the key). There is no --force; delete-table is already unconditional. Look before you delete, wait for the state change, then ask again and read the error.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Milestone: inspect the table\'s billing and size, switch on expiry and backups, then delete the table and prove it.',
      warning: 'TTL and delete-table are free. Point-in-time recovery is the one switch here that bills continuously, per GB-month of table data; on a table of a few hundred bytes it rounds to nothing, and it ends when the table does. Deleting the table deletes your entries; Module 6 needs the table again, and the last item says how to get it back in one command.',
      checklist: [
        'Read the table\'s shape and cost drivers: `aws dynamodb describe-table --table-name LedgerEntries --query "Table.[BillingModeSummary.BillingMode,ItemCount,TableSizeBytes]"`. ItemCount may still say 0: it is refreshed about every six hours.',
        'Enable TTL on `expires_at` with the cloze command, then `aws dynamodb describe-time-to-live --table-name LedgerEntries` and read TimeToLiveStatus (ENABLING, then ENABLED).',
        'Write one item that will expire: owner `learner`, ts `2000-01-01T00:00:00Z`, amount `0`, and `"expires_at": {"N": "<epoch>"}` where `<epoch>` is `date +%s` minus a day. It is still returned by a Query now; TTL would remove it within 48 hours if the table lived that long.',
        'Enable PITR with the cloze command, then `aws dynamodb describe-continuous-backups --table-name LedgerEntries --query ContinuousBackupsDescription.PointInTimeRecoveryDescription` and read PointInTimeRecoveryStatus and EarliestRestorableDateTime.',
        'One last `curl "$API/balance"` to see the sum with the extra zero item counted.',
        'Teardown: `aws dynamodb delete-table --table-name LedgerEntries`, then `aws dynamodb wait table-not-exists --table-name LedgerEntries`.',
        'Prove it: `aws dynamodb describe-table --table-name LedgerEntries` and read the error message. Also `curl -i "$API/balance"`: the API now answers 500, because the function\'s Query hits the same error; that is the dependency Module 7 will capture in one template.',
        'Module 6 continues with the table, the API and the function in place. If you are going straight on, recreate the table with the 5-2 cloze command, wait for table-exists and POST one or two entries. If you are stopping, also `aws apigatewayv2 delete-api --api-id <api-id>` and detach AmazonDynamoDBFullAccess as in 5-3; recreating all of it is the 5-3 checklist.',
      ],
      verify: { question: 'describe-table on the deleted table failed with "An error occurred (...) when calling the DescribeTable operation". Type the name inside the parentheses.', answers: ['ResourceNotFoundException'] },
    },
  ],
};

export const m5: Module = {
  id: 'aws-m5',
  title: 'Data: DynamoDB',
  goal: 'Tables, items and keys; create-table, put-item and query from the CLI and boto3; a Lambda that writes items and sums a Query; capacity modes, request units, TTL, point-in-time recovery, teardown.',
  projectMilestone: 'Entries persist in a table.',
  status: 'available',
  lessons: [l51, l52, l53, l54],
};
