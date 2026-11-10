import type { Lesson, Module } from '../../schema';

const l51: Lesson = {
  id: 'az-5-1',
  title: 'The Table Storage model: PartitionKey and RowKey',
  objective: 'Model ledger entries as table entities keyed by owner and timestamp, and query one owner\'s partition from the CLI.',
  minutes: 30,
  lexicon: [
    { id: 'az.5.table', term: 'Table Storage', kind: 'service', meaning: 'The key/value store inside a storage account: tables of entities with no fixed schema, no joins, and two indexed keys. Pennies per GB and per 10,000 operations.', example: 'az storage table create --name LedgerEntries' },
    { id: 'az.5.entity', term: 'entity', kind: 'concept', meaning: 'One row of a table: PartitionKey, RowKey, a Timestamp Azure maintains, and up to 252 properties of your own, each typed (string, double, int64, bool, datetime, guid, binary).', example: 'PartitionKey=sam RowKey=2026-03-01T09:00:00Z amount=-40.0 note=coffee' },
    { id: 'az.5.keys', term: 'PartitionKey + RowKey', kind: 'concept', meaning: 'The only indexed columns and together the unique id of an entity. Entities sharing a PartitionKey are stored together and sorted by RowKey as strings.', example: 'PartitionKey = owner, RowKey = ISO-8601 timestamp so a partition reads in time order', analogy: 'A filing cabinet: the drawer is the PartitionKey, the folder tab is the RowKey. The analogy breaks at size: a drawer can hold terabytes and the cabinet has no limit on drawers.' },
    { id: 'az.5.filter', term: '--filter "PartitionKey eq \'sam\'"', kind: 'pattern', meaning: 'An OData filter string. eq, ne, gt, ge, lt, le, and, or, not. Filtering on PartitionKey (and RowKey) uses the index; filtering on anything else scans.', example: 'az storage entity query --table-name LedgerEntries --filter "PartitionKey eq \'sam\' and amount lt 0"' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Two keys, any properties, no joins',
      body: `Table Storage is the cheapest database Azure sells, and it lives inside the storage account you already have. A **table** holds **entities**. An entity has exactly two keys you choose, **PartitionKey** and **RowKey**, plus any **properties** you like; two entities in the same table may have different properties, because there is no schema.

Design starts with the question "what will I query?". LedgerSharp needs *all entries for one owner, in time order*. So **PartitionKey = owner** (every query names it) and **RowKey = an ISO-8601 timestamp** (sorts chronologically as a string). A **point read** names both keys and fetches one entity. A **partition query** names the PartitionKey and streams that owner's entries. A filter that names neither (\`amount lt 0\`) scans the whole table: correct, but slow and billed per entity examined.

There are no joins, no secondary indexes and no aggregates: \`GET /balance\` will sum \`amount\` in C#, not in the database.

From the CLI, data commands need credentials for the account. The simplest for now is the connection string in an environment variable; module 6 replaces it with a managed identity.`,
      example: {
        language: 'shell',
        source: 'export AZURE_STORAGE_CONNECTION_STRING=$(az storage account show-connection-string --name cyberlingstore<yourname> --resource-group cyberling-rg --query connectionString --output tsv)\naz storage table create --name LedgerEntries\naz storage entity insert --table-name LedgerEntries --entity PartitionKey=sam RowKey=2026-03-01T09:00:00Z amount=-40 amount@odata.type=Edm.Double note=coffee\naz storage entity insert --table-name LedgerEntries --entity PartitionKey=sam RowKey=2026-03-01T18:30:00Z amount=100 amount@odata.type=Edm.Double note=refund\naz storage entity query --table-name LedgerEntries --filter "PartitionKey eq \'sam\'"\naz storage entity show --table-name LedgerEntries --partition-key sam --row-key 2026-03-01T09:00:00Z',
        labels: [
          { lines: [1, 1], label: 'Let every az storage command find the account without repeating --account-name and a key.' },
          { lines: [2, 2], label: 'Create the table; the name is unique only inside this account.' },
          { lines: [3, 4], label: 'Insert two entities for owner sam; amount is typed Double so it sums, not concatenates.' },
          { lines: [5, 5], label: 'Partition query: everything sam owns, oldest first, under an items key.' },
          { lines: [6, 6], label: 'Point read: both keys, one entity, the fastest and cheapest operation.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'DynamoDB partition key ≈ PartitionKey, sort key ≈ RowKey, and the same design rule applies: choose keys for your queries. Differences: Table Storage has no secondary indexes at all (DynamoDB has GSIs/LSIs), the RowKey is always a string compared lexically, and the table is not a top-level resource but lives inside a storage account.' }],
    },
    {
      kind: 'predict',
      prompt: 'LedgerEntries holds three entities: two with PartitionKey sam, one with PartitionKey ana. Which filter is a point read (one entity, no scan)?',
      code: { language: 'text', source: 'A  --filter "PartitionKey eq \'sam\' and RowKey eq \'2026-03-01T09:00:00Z\'"\nB  --filter "PartitionKey eq \'sam\'"\nC  --filter "RowKey eq \'2026-03-01T09:00:00Z\'"\nD  --filter "amount lt 0"' },
      choices: ['A: both keys named, exactly one entity', 'B: one partition is one entity', 'C: RowKey is unique so this is a point read', 'D: amount is indexed like the keys'],
      answer: 'A: both keys named, exactly one entity',
      explanation: 'Only PartitionKey + RowKey together identify an entity, so A is the point read. B is a partition query that returns both of sam\'s entities. RowKey is unique only within a partition, so C must look in every partition: a scan that happens to find one row. D scans too; properties are never indexed in Table Storage.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the CLI session that creates the table, fills it and reads it back.',
      language: 'shell',
      indentation: false,
      solution: [
        'export AZURE_STORAGE_CONNECTION_STRING=$(az storage account show-connection-string --name cyberlingstore<yourname> --resource-group cyberling-rg --query connectionString --output tsv)',
        'az storage table create --name LedgerEntries',
        'az storage entity insert --table-name LedgerEntries --entity PartitionKey=<yourname> RowKey=2026-03-01T09:00:00Z amount=-40 amount@odata.type=Edm.Double note=coffee',
        'az storage entity query --table-name LedgerEntries --filter "PartitionKey eq \'<yourname>\'"',
      ],
      distractors: [
        'az storage table create --name LedgerEntries --resource-group cyberling-rg',
        'az storage entity insert --table-name LedgerEntries --entity owner=<yourname> ts=2026-03-01T09:00:00Z amount=-40',
        'az storage entity query --table-name LedgerEntries --filter "owner eq \'<yourname>\'"',
      ],
      explanation: 'Tables are data-plane objects: they belong to a storage account, not to a resource group, so --resource-group is not a flag here. Every entity must carry PartitionKey and RowKey spelled exactly so; owner and ts would be ordinary unindexed properties, and filtering on owner would scan.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill the key names and the filter for a partition query.',
      language: 'shell',
      template: 'az storage entity insert --table-name LedgerEntries --entity {{pk}}=sam {{rk}}=2026-03-01T09:00:00Z amount=-40 amount@odata.type={{type}} note=coffee\naz storage entity query --table-name LedgerEntries --filter "PartitionKey {{op}} \'sam\'"',
      blanks: [
        { id: 'pk', answers: ['PartitionKey'], hint: 'The key that groups an owner\'s entries.' },
        { id: 'rk', answers: ['RowKey'], hint: 'The key that orders entries inside the partition.' },
        { id: 'type', answers: ['Edm.Double'], hint: 'The OData type for a floating-point number.' },
        { id: 'op', answers: ['eq'], hint: 'OData spells equality with two letters.' },
      ],
      explanation: 'Without amount@odata.type the CLI stores "-40" as a string and your C# sum would fail to read it as a number.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Create LedgerEntries in your storage account, insert two entries for yourself, and query your partition.',
      warning: 'Table Storage costs about $0.05 per GB-month plus $0.00036 per 10,000 transactions; this lesson costs a fraction of a cent. The storage account from module 2 must still exist; if you deleted it, recreate it first with `az storage account create --name cyberlingstore<yourname> --resource-group cyberling-rg --sku Standard_LRS`.',
      checklist: [
        'Confirm the group and account: `az storage account show --name cyberlingstore<yourname> --resource-group cyberling-rg --query provisioningState`.',
        'Run `export AZURE_STORAGE_CONNECTION_STRING=$(az storage account show-connection-string --name cyberlingstore<yourname> --resource-group cyberling-rg --query connectionString --output tsv)`. Treat this value as a password; module 6 removes the need for it.',
        'Run `az storage table create --name LedgerEntries`.',
        'Insert two entities with PartitionKey=<yourname>, RowKeys 2026-03-01T09:00:00Z and 2026-03-01T18:30:00Z, amounts -40 and 100 (both `amount@odata.type=Edm.Double`).',
        'Run `az storage entity query --table-name LedgerEntries --filter "PartitionKey eq \'<yourname>\'"` and count the objects under `items`.',
        'Run `az storage entity show --table-name LedgerEntries --partition-key <yourname> --row-key 2026-03-01T09:00:00Z` and compare its speed and shape with the query.',
        'Keep the table for the next lesson, where the API writes to it. If you stop here, tear down with `az storage table delete --name LedgerEntries` and confirm with `az storage table exists --name LedgerEntries`.',
      ],
      verify: { question: 'How many objects did the partition query return under items?', answers: ['2'] },
    },
  ],
};

const l52: Lesson = {
  id: 'az-5-2',
  title: 'Azure.Data.Tables from ASP.NET: persisting entries',
  objective: 'Replace the in-memory list with TableClient so POST /entries writes an entity and GET /balance sums a partition.',
  minutes: 35,
  lexicon: [
    { id: 'az.5.tableclient', term: 'TableClient', kind: 'builtin', meaning: 'The Azure.Data.Tables object for one table: create it, add, get, query and delete entities. Built from a connection string (now) or an endpoint plus a credential (module 6).', example: 'var table = new TableClient(builder.Configuration.GetConnectionString("Storage"), "LedgerEntries");' },
    { id: 'az.5.tableentity', term: 'TableEntity', kind: 'builtin', meaning: 'A dictionary-shaped entity: constructor takes PartitionKey and RowKey, indexer sets properties, GetDouble/GetString read them back typed.', example: 'new TableEntity(owner, DateTime.UtcNow.ToString("o")) { ["amount"] = dto.Amount }' },
    { id: 'az.5.addentity', term: 'AddEntityAsync', kind: 'builtin', meaning: 'Insert one entity; fails with 409 Conflict if the key pair already exists. UpsertEntityAsync overwrites instead.', example: 'await table.AddEntityAsync(entity);' },
    { id: 'az.5.queryasync', term: 'QueryAsync<TableEntity>(filter)', kind: 'builtin', meaning: 'Run an OData filter and get an AsyncPageable you consume with await foreach; paging is handled for you.', example: 'await foreach (var e in table.QueryAsync<TableEntity>($"PartitionKey eq \'{owner}\'")) total += e.GetDouble("amount") ?? 0;' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'TableClient replaces List<Entry>',
      body: `The SDK is the NuGet package **Azure.Data.Tables**. One \`TableClient\` represents one table. Build it from the connection string, kept out of the code: locally in the environment variable \`ConnectionStrings__Storage\`, in Azure as a **connection string setting** named \`Storage\` (lesson 4-3), and read in both places with \`GetConnectionString("Storage")\`.

\`POST /entries\` becomes: build a \`TableEntity\` with PartitionKey = the owner from the \`LEDGER_OWNER\` setting and RowKey = the current UTC time in round-trip format, set \`amount\` and \`note\`, call \`AddEntityAsync\`, return **201 Created**. \`GET /balance\` becomes: a partition query, \`await foreach\` over the results, add up \`GetDouble("amount")\`, return \`{"balance": total}\`.

Two honest limits. Table Storage has no \`decimal\`, so money is stored as a double here; a production ledger would store integer cents as \`Int64\`. And two POSTs in the same tick would collide on RowKey; appending a GUID fixes that. Both are one-line changes once the shape is clear.`,
      example: {
        language: 'csharp',
        source: 'using Azure.Data.Tables;\n\nvar builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\n\nvar owner = app.Configuration["LEDGER_OWNER"] ?? "unknown";\nvar table = new TableClient(builder.Configuration.GetConnectionString("Storage"), "LedgerEntries");\nawait table.CreateIfNotExistsAsync();\n\napp.MapPost("/entries", async (EntryDto dto) =>\n{\n    var entity = new TableEntity(owner, DateTime.UtcNow.ToString("o"))\n    {\n        ["amount"] = dto.Amount,\n        ["note"] = dto.Note,\n    };\n    await table.AddEntityAsync(entity);\n    return Results.Created($"/entries/{entity.RowKey}", entity);\n});\n\napp.MapGet("/balance", async () =>\n{\n    double total = 0;\n    var filter = $"PartitionKey eq \'{owner}\'";\n    await foreach (var e in table.QueryAsync<TableEntity>(filter))\n    {\n        total += e.GetDouble("amount") ?? 0;\n    }\n    return Results.Ok(new { balance = total });\n});\n\napp.Run();\n\nrecord EntryDto(double Amount, string Note);',
        labels: [
          { lines: [6, 8], label: 'Read the owner and the connection string from configuration; make sure the table exists.' },
          { lines: [10, 19], label: 'POST: shape the entity with owner and timestamp as keys, insert it, answer 201.' },
          { lines: [21, 30], label: 'GET: stream the owner\'s partition and sum amounts in C#, since the store cannot.' },
          { lines: [34, 34], label: 'The JSON body a client POSTs: amount and note.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'boto3 `put_item` ≈ `AddEntityAsync`; `query(KeyConditionExpression=Key("owner").eq(...))` ≈ `QueryAsync` with a PartitionKey filter; both sum on the client. DynamoDB items are dicts of typed attributes ({"N": "-40"}); TableEntity hides the typing behind an indexer and GetDouble.' }],
    },
    {
      kind: 'predict',
      prompt: 'The table-backed API is deployed and LedgerEntries is empty for owner sam. What does the last command print?',
      code: { language: 'shell', source: 'curl -s -X POST -H "Content-Type: application/json" -d \'{"amount": -40, "note": "coffee"}\' https://cyberling-api-sam.azurewebsites.net/entries\ncurl -s -X POST -H "Content-Type: application/json" -d \'{"amount": 100, "note": "refund"}\' https://cyberling-api-sam.azurewebsites.net/entries\ncurl -s https://cyberling-api-sam.azurewebsites.net/balance' },
      choices: ['{"balance":60}', '{"balance":-40}', '{"balance":[-40,100]}', '{"balance":0}'],
      answer: '{"balance":60}',
      explanation: 'Each POST added one entity to partition sam. GET streams that partition and sums amount: -40 + 100 = 60. Nothing is cached in the process, so this stays right if the app restarts or runs on three instances, which is what the in-memory version could not promise.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the GET /balance handler. Indent with 4 spaces.',
      language: 'csharp',
      indentation: true,
      solution: [
        'app.MapGet("/balance", async () =>',
        '{',
        '    double total = 0;',
        '    var filter = $"PartitionKey eq \'{owner}\'";',
        '    await foreach (var e in table.QueryAsync<TableEntity>(filter))',
        '    {',
        '        total += e.GetDouble("amount") ?? 0;',
        '    }',
        '    return Results.Ok(new { balance = total });',
        '});',
      ],
      distractors: [
        '    var filter = $"RowKey eq \'{owner}\'";',
        '    foreach (var e in table.QueryAsync<TableEntity>(filter))',
        '    return Results.Ok(total);',
      ],
      explanation: 'The owner is the PartitionKey; filtering RowKey by owner finds nothing (and scans). QueryAsync returns an AsyncPageable, which needs `await foreach`; a plain foreach does not compile. Returning the bare number gives a body like 60 with no balance key.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill the SDK names in the POST handler.',
      language: 'csharp',
      template: 'var table = new {{client}}(builder.Configuration.GetConnectionString("Storage"), "LedgerEntries");\n\napp.MapPost("/entries", async (EntryDto dto) =>\n{\n    var entity = new {{entity}}(owner, DateTime.UtcNow.ToString("o"))\n    {\n        ["amount"] = dto.Amount,\n        ["note"] = dto.Note,\n    };\n    await table.{{add}}(entity);\n    return Results.{{created}}($"/entries/{entity.RowKey}", entity);\n});',
      blanks: [
        { id: 'client', answers: ['TableClient'], hint: 'One object per table.' },
        { id: 'entity', answers: ['TableEntity'], hint: 'The dictionary-shaped row type.' },
        { id: 'add', answers: ['AddEntityAsync'], hint: 'Insert; conflicts on an existing key pair.' },
        { id: 'created', answers: ['Created'], hint: 'The 201 helper on Results.' },
      ],
      explanation: 'TableClient, TableEntity, AddEntityAsync, Results.Created: the four names that turn a POST into a persisted row.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Redeploy LedgerSharp with table-backed routes and prove a POST survives into a GET.',
      warning: 'The F1 plan is free and the table costs a fraction of a cent. `az webapp up` recreates the plan and app you deleted at the end of module 4; delete them again at the end of this module. The connection string you store as a setting is a secret: never commit it, and module 6 replaces it with a managed identity.',
      checklist: [
        'In LedgerSharp.Api run `dotnet add package Azure.Data.Tables`, then replace the list-backed routes with the concept step\'s code.',
        'Run locally: `export ConnectionStrings__Storage="$AZURE_STORAGE_CONNECTION_STRING"`, `LEDGER_OWNER=<yourname> dotnet run`, then POST and GET against localhost to check the sum.',
        'Redeploy: `az webapp up --name cyberling-api-<yourname> --resource-group cyberling-rg --plan cyberling-plan --runtime "DOTNETCORE:8.0" --sku F1 --os-type Linux --location westeurope`.',
        'Set the settings: `az webapp config appsettings set --name cyberling-api-<yourname> --resource-group cyberling-rg --settings LEDGER_OWNER=<yourname>` and `az webapp config connection-string set --name cyberling-api-<yourname> --resource-group cyberling-rg --connection-string-type Custom --settings Storage="$AZURE_STORAGE_CONNECTION_STRING"`.',
        'Run `curl -i -X POST -H "Content-Type: application/json" -d \'{"amount": -40, "note": "coffee"}\' https://cyberling-api-<yourname>.azurewebsites.net/entries` and read the status line.',
        'Run `curl https://cyberling-api-<yourname>.azurewebsites.net/balance`: the JSON key is `balance` and the value includes the two CLI entries from the previous lesson plus this POST.',
        'Confirm from the CLI side: `az storage entity query --table-name LedgerEntries --filter "PartitionKey eq \'<yourname>\'"` now shows three items.',
        'Keep everything for the last lesson of the module, which tears it all down. If you stop here: `az webapp delete`, `az appservice plan delete --yes`, `az storage table delete --name LedgerEntries`.',
      ],
      verify: { question: 'Type the HTTP status code in the first line of the `curl -i -X POST .../entries` response.', answers: ['201'] },
    },
  ],
};

const l53: Lesson = {
  id: 'az-5-3',
  title: 'Cosmos DB: when Table Storage is not enough',
  objective: 'Name what Cosmos DB adds over Table Storage, what a request unit is, and when the extra cost is worth paying.',
  minutes: 25,
  lexicon: [
    { id: 'az.5.cosmos', term: 'Cosmos DB', kind: 'service', meaning: 'Azure\'s globally distributed, multi-model database: single-digit-millisecond SLAs, automatic indexing of every property, replication to any region. Billed in request units, not per entity.', example: 'az cosmosdb create --name cyberling-cosmos-sam --resource-group cyberling-rg --capabilities EnableTable EnableServerless' },
    { id: 'az.5.ru', term: 'request unit (RU)', kind: 'concept', meaning: 'Cosmos DB\'s currency for work: reading a 1 KB item by key costs 1 RU; writes and queries cost more. Provisioned mode bills RU/s per hour whether used or not; serverless bills only the RUs consumed.', example: '400 RU/s provisioned ≈ $24/month idle; serverless ≈ $0.25 per million RUs', analogy: 'Prepaid phone minutes versus pay-per-call. Provisioned throughput expires every second whether you talk or not.' },
    { id: 'az.5.tableapi', term: 'Cosmos DB for Table', kind: 'service', meaning: 'A Cosmos DB account that speaks the Table Storage protocol. The same Azure.Data.Tables code works; only the connection string changes.', example: 'az cosmosdb table create --account-name cyberling-cosmos-sam --resource-group cyberling-rg --name LedgerEntries' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Same API, different promises, different bill',
      body: `Table Storage is a good home for the ledger: strongly consistent in its region, almost free, and simple. You outgrow it when you need one of four things: **global distribution** (writes and reads in several regions, with automatic failover), **latency SLAs** (under 10 ms reads at the 99th percentile), **indexing of every property** (so \`amount lt 0\` stops being a scan), or **throughput guarantees** instead of best effort.

That is **Cosmos DB**. Its **Table API** speaks the Table Storage protocol, so the \`TableClient\` code from the previous lesson runs unchanged against a Cosmos account; you swap the connection string. What changes is the bill. Cosmos meters **request units (RU)**: a point read of a 1 KB item is 1 RU, a write about 5, a query more. In **provisioned** mode you reserve RU/s and pay per hour for the reservation, down to a floor of 400 RU/s, even at zero traffic. In **serverless** mode you pay only for RUs actually consumed plus storage, so an idle account costs cents. A **free tier** (first 1000 RU/s and 25 GB, one account per subscription) exists for provisioned accounts only.

For LedgerSharp at a few requests a day, Table Storage wins. Know the escape hatch; do not pay for it yet.`,
      example: {
        language: 'shell',
        source: 'az cosmosdb create --name cyberling-cosmos-<yourname> --resource-group cyberling-rg --capabilities EnableTable EnableServerless --locations regionName=westeurope\naz cosmosdb table create --account-name cyberling-cosmos-<yourname> --resource-group cyberling-rg --name LedgerEntries\naz cosmosdb keys list --name cyberling-cosmos-<yourname> --resource-group cyberling-rg --type connection-strings --query "connectionStrings[?description==\'Primary Table Connection String\'].connectionString" --output tsv\naz cosmosdb delete --name cyberling-cosmos-<yourname> --resource-group cyberling-rg --yes',
        labels: [
          { lines: [1, 1], label: 'An account that speaks the Table protocol and bills per RU consumed (serverless). Takes several minutes.' },
          { lines: [2, 2], label: 'The same table name; the same TableClient code will work against it.' },
          { lines: [3, 3], label: 'The connection string you would put in the Storage connection-string setting instead of the storage account\'s.' },
          { lines: [4, 4], label: 'Teardown: a Cosmos account is a billable resource even when empty (in provisioned mode).' },
        ],
      },
      contrast: [{ from: 'aws', note: 'DynamoDB sits between the two: like Cosmos it is a top-level service with secondary indexes, global tables and on-demand billing (≈ Cosmos serverless) or provisioned capacity (≈ RU/s). Table Storage has no DynamoDB equivalent cheaper than DynamoDB itself. DynamoDB read/write capacity units ≈ request units, but RUs are one currency for reads, writes and queries.' }],
    },
    {
      kind: 'predict',
      prompt: 'Three empty data stores sit idle for a month with zero requests. Which costs the most?',
      code: { language: 'text', source: 'A  Table Storage table in a Standard_LRS storage account (0 entities)\nB  Cosmos DB for Table, provisioned at the 400 RU/s minimum (0 items)\nC  Cosmos DB for Table, serverless (0 items)' },
      choices: ['B: provisioned RU/s bill per hour whether used or not', 'A: storage accounts have a monthly minimum', 'C: serverless accounts charge a standing fee', 'All three cost zero at zero traffic'],
      answer: 'B: provisioned RU/s bill per hour whether used or not',
      explanation: 'Provisioned throughput is a reservation: 400 RU/s runs about $24 a month with nobody calling. Serverless bills per RU consumed plus storage, so an empty idle account is near zero. Table Storage bills per GB stored and per transaction, so an empty idle table is zero. The pricing dimension, not the service name, decides the idle cost.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the steps to move LedgerSharp from Table Storage to Cosmos DB for Table without changing C# code.',
      language: 'text',
      indentation: false,
      solution: [
        'Create a Cosmos DB account with --capabilities EnableTable (serverless for low traffic)',
        'Create a table named LedgerEntries in that account',
        'Read the Primary Table Connection String from az cosmosdb keys list',
        'Replace the Storage connection-string setting on the web app with it',
        'Restart the app and run the same POST and GET smoke tests',
      ],
      distractors: [
        'Rewrite the handlers against the Cosmos SQL (NoSQL) API SDK',
        'Point TableClient at the storage account and the Cosmos account at the same time for a live sync',
      ],
      explanation: 'The Table API exists precisely so Azure.Data.Tables code moves by configuration alone. The NoSQL API is a different protocol and SDK; and TableClient talks to one endpoint, so migrating data is a copy job (export and import), not a dual connection.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill the capabilities and the sub-command that create a pay-per-use Table API account and its table.',
      language: 'shell',
      template: 'az cosmosdb create --name cyberling-cosmos-sam --resource-group cyberling-rg --capabilities {{table}} {{serverless}} --locations regionName=westeurope\naz cosmosdb {{sub}} create --account-name cyberling-cosmos-sam --resource-group cyberling-rg --name LedgerEntries',
      blanks: [
        { id: 'table', answers: ['EnableTable'], hint: 'The capability that makes the account speak the Table protocol.' },
        { id: 'serverless', answers: ['EnableServerless'], hint: 'Bill per RU consumed instead of reserving RU/s.' },
        { id: 'sub', answers: ['table'], hint: 'The az cosmosdb sub-command for Table API resources.' },
      ],
      explanation: 'Capabilities are fixed at creation: you cannot switch an account between provisioned and serverless later.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Read the pricing page, and only if you choose to, create a serverless Cosmos account and delete it.',
      warning: 'Cosmos DB is NOT free by default. A provisioned account bills about $24/month at the 400 RU/s floor from the minute it exists. A serverless account bills per request plus about $0.25 per GB stored, so creating one, running a few curls and deleting it within the hour costs under a cent; the free tier (1000 RU/s, 25 GB) applies only to one provisioned account per subscription. The create step below is optional; the pricing reading and the verify question are not.',
      checklist: [
        'Open the Cosmos DB pricing page and find the name of the unit that both provisioned and serverless modes are priced in.',
        'In the Azure pricing calculator, compare 400 RU/s provisioned for 730 hours with serverless at 1 million RUs for the month. Note which is cheaper for a ledger with a few requests a day.',
        'Optional (costs under a cent if deleted the same hour): `az cosmosdb create --name cyberling-cosmos-<yourname> --resource-group cyberling-rg --capabilities EnableTable EnableServerless --locations regionName=westeurope`. Wait for it to finish (several minutes).',
        'Optional: `az cosmosdb table create --account-name cyberling-cosmos-<yourname> --resource-group cyberling-rg --name LedgerEntries`, fetch the Primary Table Connection String with `az cosmosdb keys list ... --type connection-strings`, and point a local `dotnet run` at it via `ConnectionStrings__Storage`. POST and GET work unchanged.',
        'Teardown if you created it: `az cosmosdb delete --name cyberling-cosmos-<yourname> --resource-group cyberling-rg --yes`, then `az cosmosdb show --name cyberling-cosmos-<yourname> --resource-group cyberling-rg` should fail with ResourceNotFound.',
      ],
      verify: { question: 'What is the pricing unit Cosmos DB bills in (the full name or its two-letter abbreviation)?', answers: ['RU', 'request unit', 'request units', 'RUs', 'Request Unit', 'Request Units'] },
    },
  ],
};

const l54: Lesson = {
  id: 'az-5-4',
  title: 'Backups, consistency, and teardown',
  objective: 'State what protects (and does not protect) table data, name the consistency models, export the ledger and delete the table.',
  minutes: 25,
  lexicon: [
    { id: 'az.5.softdelete', term: 'soft delete (blobs, not tables)', kind: 'concept', meaning: 'Blob Storage can keep deleted blobs for a retention period; Table Storage has no soft delete and no point-in-time restore. A deleted table or entity is gone, so exports are your backup.', example: 'az storage entity query --table-name LedgerEntries > ledger-export.json' },
    { id: 'az.5.consistency', term: 'consistency level', kind: 'concept', meaning: 'How stale a read may be. Table Storage: strong on the primary, eventual on an RA-GRS secondary. Cosmos DB: five levels from strong to eventual, session by default.', example: 'az cosmosdb create ... --default-consistency-level Session' },
    { id: 'az.5.table-exists', term: 'az storage table exists', kind: 'pattern', meaning: 'Ask whether a table is there; prints {"exists": true|false}. The clean way to prove a teardown.', example: 'az storage table exists --name LedgerEntries' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'What survives a mistake, and how stale a read can be',
      body: `**Durability** and **backup** are different things. Table Storage stores three copies (LRS) or more, so a disk failure never loses an entity. But if *you* delete the table, or a bug overwrites every \`amount\`, replication faithfully copies the damage. Blob Storage offers **soft delete** and versioning for exactly this; Table Storage offers neither, and there is no point-in-time restore. Your protection is an **export**: a partition query redirected to a file, or AzCopy or Data Factory for larger tables. Deleting a table is asynchronous: the name is unavailable for up to about a minute, and the data does not come back. Cosmos DB, by contrast, takes periodic backups (two retained, eight hours apart by default) or continuous backups with self-service point-in-time restore.

**Consistency** in one paragraph. Table Storage reads from the primary region are **strongly consistent**: once a write is acknowledged, every read sees it. If the account is RA-GRS, reads from the secondary endpoint are **eventually consistent** and may lag by minutes. Cosmos DB lets you choose per account among **strong**, **bounded staleness**, **session** (the default: your own writes are always visible to you), **consistent prefix** and **eventual**; weaker levels are cheaper in RUs and latency.

Then the teardown. Export, delete the table, prove it is gone, and remove the web app and plan that lesson 5-2 recreated. The storage account and the resource group stay for modules 6 and 7.`,
      example: {
        language: 'shell',
        source: 'az storage entity query --table-name LedgerEntries --filter "PartitionKey eq \'<yourname>\'" > ledger-export.json\naz storage table delete --name LedgerEntries\naz storage table exists --name LedgerEntries\naz webapp delete --name cyberling-api-<yourname> --resource-group cyberling-rg\naz appservice plan delete --name cyberling-plan --resource-group cyberling-rg --yes\naz resource list --resource-group cyberling-rg --output table',
        labels: [
          { lines: [1, 1], label: 'The only backup Table Storage gives you is the one you make.' },
          { lines: [2, 3], label: 'Delete and prove it: exists flips to false.' },
          { lines: [4, 5], label: 'Remove the compute again so the plan cannot bill.' },
          { lines: [6, 6], label: 'What is left should be just the storage account.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'DynamoDB has point-in-time recovery and on-demand backups built in; Table Storage has neither, so the export habit matters more here. DynamoDB\'s two read modes (eventually consistent by default, strongly consistent on request) map onto the ends of Cosmos DB\'s five levels; Table Storage is simply strong on the primary.' }],
    },
    {
      kind: 'predict',
      prompt: 'You delete LedgerEntries and five seconds later run the create command again. What happens?',
      code: { language: 'shell', source: 'az storage table delete --name LedgerEntries\nsleep 5\naz storage table create --name LedgerEntries' },
      choices: [
        'The create may fail with a 409 TableBeingDeleted until the deletion finishes; when it succeeds the table is empty',
        'The create succeeds and the old entities are back, because deletion is soft for a retention period',
        'The create succeeds instantly with an empty table; deletion is synchronous',
        'The create fails permanently: a deleted table name can never be reused',
      ],
      answer: 'The create may fail with a 409 TableBeingDeleted until the deletion finishes; when it succeeds the table is empty',
      explanation: 'Table deletion is asynchronous and can take up to about 40 seconds during which the name is reserved. There is no soft delete for tables, so nothing comes back. The name is reusable once the deletion completes. If you ever need a fast rebuild, export first, delete, wait, recreate, re-insert.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the end-of-module teardown so the data is saved, nothing bills, and modules 6 and 7 still have their storage account.',
      language: 'shell',
      indentation: false,
      solution: [
        'az storage entity query --table-name LedgerEntries --filter "PartitionKey eq \'<yourname>\'" > ledger-export.json',
        'az storage table delete --name LedgerEntries',
        'az storage table exists --name LedgerEntries',
        'az webapp delete --name cyberling-api-<yourname> --resource-group cyberling-rg',
        'az appservice plan delete --name cyberling-plan --resource-group cyberling-rg --yes',
      ],
      distractors: [
        'az group delete --name cyberling-rg --yes',
        'az storage account delete --name cyberlingstore<yourname> --resource-group cyberling-rg --yes',
      ],
      explanation: 'Export before delete, because nothing restores a table. Deleting the group or the storage account would also take the module 2 blob container and leave module 6 with nothing to secure; those two commands belong to the very last fieldwork of the track.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill the consistency vocabulary.',
      language: 'text',
      template: 'Table Storage reads from the primary endpoint are {{primary}}ly consistent.\nReads from an RA-GRS secondary endpoint are {{secondary}}ly consistent and may lag.\nCosmos DB\'s default level is {{cosmos}}: you always read your own writes.\nTable Storage has {{backup}} soft delete, so an export is the backup.',
      blanks: [
        { id: 'primary', answers: ['strong'], hint: 'A write acknowledged is a write visible.' },
        { id: 'secondary', answers: ['eventual'], hint: 'Replication catches up, in time.' },
        { id: 'cosmos', answers: ['session', 'Session'], hint: 'Scoped to one client\'s session.' },
        { id: 'backup', answers: ['no'], hint: 'Blobs have it; tables do not.' },
      ],
    },
    {
      kind: 'fieldwork',
      prompt: 'Milestone: the ledger has lived in a table. Export it, delete the table, remove the compute, and prove the teardown.',
      warning: 'After this checklist the only resource left is the storage account, which costs a few cents a month for the ledger.json blob from module 2. If you created a Cosmos account in the previous lesson and kept it, delete it here: a provisioned one bills about $24/month.',
      checklist: [
        'Make sure `AZURE_STORAGE_CONNECTION_STRING` is still exported (lesson 5-1), then run `az storage entity query --table-name LedgerEntries --filter "PartitionKey eq \'<yourname>\'" > ledger-export.json` and open the file: your three entries are there.',
        'Run `az storage table delete --name LedgerEntries`.',
        'Run `az storage table exists --name LedgerEntries` and read the value of `exists`.',
        'If you created `cyberling-cosmos-<yourname>` and still have it: `az cosmosdb delete --name cyberling-cosmos-<yourname> --resource-group cyberling-rg --yes`.',
        'Run `az webapp delete --name cyberling-api-<yourname> --resource-group cyberling-rg` then `az appservice plan delete --name cyberling-plan --resource-group cyberling-rg --yes`.',
        'Run `az resource list --resource-group cyberling-rg --output table`: only `cyberlingstore<yourname>` should remain. Keep it and the group; module 6 adds a managed identity to this account. Remember that `az group delete --name cyberling-rg --yes` is the universal cleanup if you ever stop the track.',
        'Run `unset AZURE_STORAGE_CONNECTION_STRING` so the key does not linger in your shell.',
      ],
      verify: { question: 'After deleting the table, what value does `az storage table exists --name LedgerEntries` print for the key exists?', answers: ['false'] },
    },
  ],
};

export const m5: Module = {
  id: 'az-m5',
  title: 'Data: Table Storage and Cosmos DB',
  goal: 'Partition keys, point reads, queries, pricing.',
  projectMilestone: 'Entries persist in a table.',
  status: 'available',
  lessons: [l51, l52, l53, l54],
};
