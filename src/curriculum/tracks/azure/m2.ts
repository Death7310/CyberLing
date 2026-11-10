import type { Lesson, Module } from '../../schema';

const l21: Lesson = {
  id: 'az-2-1',
  title: 'Storage accounts: one account, four services',
  objective: 'Create a storage account with the right redundancy and tier, and read its provisioning state.',
  minutes: 25,
  lexicon: [
    { id: 'az.2.storage-account', term: 'storage account', kind: 'service', meaning: 'A globally unique namespace (3–24 lowercase letters and digits) that hosts four services at once: Blob, Table, Queue and File. Everything is billed and secured at this level.', example: 'az storage account create --name cyberlingstore<yourname> --resource-group cyberling-rg --location westeurope --sku Standard_LRS --kind StorageV2', analogy: 'An S3 bucket, a DynamoDB-lite table store, an SQS-lite queue and a network share, all behind one hostname. The analogy breaks on scope: an S3 bucket holds objects only; a storage account holds all four services.' },
    { id: 'az.2.redundancy', term: 'LRS / ZRS / GRS', kind: 'concept', meaning: 'How many copies and where. LRS: three copies in one datacentre. ZRS: three availability zones in one region. GRS: LRS plus an asynchronous copy in the paired region hundreds of kilometres away.', example: '--sku Standard_GRS' },
    { id: 'az.2.access-tier', term: 'access tier', kind: 'concept', meaning: 'Hot, Cool, Cold or Archive. Colder tiers store cheaper but charge more per read and may take hours to rehydrate (Archive).', example: '--access-tier Hot', analogy: 'S3 storage classes (Standard, IA, Glacier). Same trade-off, different names.' },
    { id: 'az.2.provisioning-state', term: 'provisioningState', kind: 'concept', meaning: 'The field Azure Resource Manager sets on every resource to say whether the create or update finished: Succeeded, Failed, Creating, Deleting.', example: 'az storage account show --name cyberlingstore<yourname> --resource-group cyberling-rg --query provisioningState' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'One account, four services',
      body: `Azure's storage primitive is the **storage account**. One account gives you four services under one globally unique name: **Blob** (objects, like S3), **Table** (a key-value store), **Queue** (messages) and **File** (SMB shares). Each service has its own hostname: \`https://<account>.blob.core.windows.net\`, \`https://<account>.table.core.windows.net\`, and so on.

When you create the account you choose two things that are hard to change later:

- **Redundancy** (the \`--sku\`): \`Standard_LRS\` keeps three copies in one datacentre; \`Standard_ZRS\` spreads them across three zones in the region; \`Standard_GRS\` adds an asynchronous copy in the **paired region**. More copies, more money.
- **Kind**: always \`StorageV2\` for new work. The older kinds exist for compatibility only.

Access tier (\`Hot\`, \`Cool\`, \`Cold\`, \`Archive\`) can change per blob later. Every create returns a JSON document whose \`provisioningState\` says whether the operation finished.`,
      example: {
        language: 'shell',
        source: 'az group create --name cyberling-rg --location westeurope\naz storage account create --name cyberlingstore<yourname> --resource-group cyberling-rg --location westeurope --sku Standard_LRS --kind StorageV2\naz storage account show --name cyberlingstore<yourname> --resource-group cyberling-rg --query provisioningState --output tsv',
        labels: [
          { lines: [1, 1], label: 'Make sure the lesson\'s folder exists (harmless if it already does).' },
          { lines: [2, 2], label: 'Create the cheapest sensible account: locally redundant, modern kind.' },
          { lines: [3, 3], label: 'Prove it finished: prints Succeeded.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'S3 ≈ Blob Storage, but S3 has no "account" layer: you make buckets directly. In Azure the storage account is the unit that is created, billed and secured; the blob container (next lesson) is the bucket-like thing inside it. LRS/ZRS/GRS ≈ S3 storage classes crossed with cross-region replication, chosen once per account.' }],
    },
    {
      kind: 'predict',
      prompt: 'Three teammates created accounts with these SKUs in westeurope. The whole westeurope region goes dark for a day. Whose data still has a readable copy somewhere else?',
      code: { language: 'text', source: 'ana:   --sku Standard_LRS\nbenoit: --sku Standard_ZRS\ncarla: --sku Standard_GRS' },
      choices: ['Only carla: GRS copies data to the paired region', 'benoit and carla: zones are separate regions', 'All three: Azure always keeps a copy elsewhere', 'Nobody: redundancy only protects against disk failure'],
      answer: 'Only carla: GRS copies data to the paired region',
      explanation: 'LRS and ZRS both live entirely inside one region: zones are separate buildings with separate power and networking, not separate regions. Only GRS (and GZRS) replicate to the paired region. Reading from that copy during an outage needs the RA- variant or an account failover, and the copy is asynchronous, so the last few seconds of writes can be lost. Cheap LRS is the right choice for this course.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the steps for creating a storage account you can verify and clean up.',
      language: 'text',
      indentation: false,
      solution: [
        'Run az account show to confirm the subscription you are about to bill',
        'Create or confirm the resource group cyberling-rg',
        'Create the storage account with --sku Standard_LRS --kind StorageV2',
        'Read provisioningState from az storage account show',
        'Delete the account (or the whole group) when the experiment is over',
      ],
      distractors: [
        'Create the storage account first, then create a resource group for it',
        'Pick --sku Standard_GRS so the lesson data is safe',
      ],
      explanation: 'A resource must be born inside a resource group, so the group comes first. GRS doubles the storage bill for data you will delete in an hour; the right redundancy for throwaway work is LRS.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill in the flags and the field that proves the account exists.',
      language: 'shell',
      template: 'az storage account create --name cyberlingstore<yourname> --resource-group cyberling-rg --location westeurope --sku {{sku}} --kind {{kind}}\naz storage account show --name cyberlingstore<yourname> --resource-group cyberling-rg --query {{state}} --output tsv',
      blanks: [
        { id: 'sku', answers: ['Standard_LRS'], hint: 'Locally redundant: the cheapest SKU.' },
        { id: 'kind', answers: ['StorageV2'], hint: 'The modern general-purpose kind.' },
        { id: 'state', answers: ['provisioningState'], hint: 'The field Resource Manager sets to Succeeded.' },
      ],
      explanation: '--sku chooses redundancy, --kind chooses the account generation, and provisioningState is how every ARM resource reports that a create finished.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Create the storage account this module builds on.',
      warning: 'An empty Standard_LRS account costs nothing while it is empty; a few megabytes of blobs cost well under a cent a month. The free account\'s credit covers all of it. The account name must be globally unique and only lowercase letters and digits: if "cyberlingstore<yourname>" is taken, add digits.',
      checklist: [
        'Run `az account show` and confirm the subscription name is the one you expect.',
        'Run `az group create --name cyberling-rg --location westeurope` (or the region nearest you); it is harmless if the group already exists.',
        'Run `az storage account create --name cyberlingstore<yourname> --resource-group cyberling-rg --location westeurope --sku Standard_LRS --kind StorageV2`.',
        'Run `az storage account show --name cyberlingstore<yourname> --resource-group cyberling-rg --query provisioningState --output tsv`.',
        'Teardown: the next three lessons use this account, so keep it if you are continuing today. If you stop here, delete it with `az storage account delete --name cyberlingstore<yourname> --resource-group cyberling-rg --yes` and recreate it next time.',
      ],
      verify: { question: 'What did the last command print as the value of provisioningState?', answers: ['Succeeded'] },
    },
  ],
};

const l22: Lesson = {
  id: 'az-2-2',
  title: 'Blobs, containers and SAS tokens',
  objective: 'Upload ledger.json to a private container and share it with a time-limited SAS link.',
  minutes: 30,
  lexicon: [
    { id: 'az.2.container', term: 'blob container', kind: 'service', meaning: 'A flat namespace for blobs inside a storage account. Names are lowercase; slashes in blob names are just characters that tools render as folders.', example: 'az storage container create --name ledger --account-name cyberlingstore<yourname> --auth-mode login', analogy: 'An S3 bucket, except it is not globally named: it lives inside your account.' },
    { id: 'az.2.blob', term: 'block blob', kind: 'concept', meaning: 'The ordinary blob type for files: uploaded in blocks, replaced as a whole. Append blobs grow at the end (logs); page blobs are random-access (disks).', example: 'az storage blob upload --container-name ledger --name ledger.json --file ledger.json --account-name cyberlingstore<yourname> --auth-mode login' },
    { id: 'az.2.auth-mode', term: '--auth-mode login | key', kind: 'pattern', meaning: 'How the CLI authenticates data operations: login uses your Entra ID sign-in (needs a data-plane role), key uses the account\'s shared key (needs only the right to read keys, which Owners have).', example: 'az storage blob list --container-name ledger --account-name cyberlingstore<yourname> --auth-mode login --output table' },
    { id: 'az.2.sas', term: 'SAS token', kind: 'concept', meaning: 'Shared Access Signature: a signed query string granting specific permissions on a blob, container or account until an expiry time. Appended to the blob URL with ?.', example: 'az storage blob generate-sas --container-name ledger --name ledger.json --permissions r --expiry 2026-12-31T00:00Z --https-only --account-name cyberlingstore<yourname> --output tsv', analogy: 'An S3 presigned URL. Both are signed links; a SAS is the token part on its own and can also cover a whole container.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Containers and blobs through the CLI',
      body: `Inside the account, blobs live in **containers**. A container is a flat list; \`exports/2026/ledger.json\` is one blob whose name happens to contain slashes. New accounts disallow public access by default, so every container is private until you say otherwise.

Data commands (\`az storage blob ...\`) differ from the management commands you have used so far: they talk to the **data plane** at \`<account>.blob.core.windows.net\`, not to Resource Manager. They must say how to authenticate. \`--auth-mode login\` uses your \`az login\` identity, which only works once that identity holds a **data role** such as Storage Blob Data Contributor (next lesson). \`--auth-mode key\` fetches the account's shared key, which any Owner of the account can read.

Three blob types exist; files are **block blobs**, and the CLI picks that by default.`,
      example: {
        language: 'shell',
        source: 'az storage container create --name ledger --account-name cyberlingstore<yourname> --auth-mode login\naz storage blob upload --container-name ledger --name ledger.json --file ledger.json --account-name cyberlingstore<yourname> --auth-mode login\naz storage blob list --container-name ledger --account-name cyberlingstore<yourname> --auth-mode login --output table\naz storage blob download --container-name ledger --name ledger.json --file copy.json --account-name cyberlingstore<yourname> --auth-mode login',
        labels: [
          { lines: [1, 1], label: 'Make a private container; the account stays closed to anonymous callers.' },
          { lines: [2, 2], label: 'Upload a local file as a block blob with the given name.' },
          { lines: [3, 3], label: 'List what is there; --output table is easier to read than JSON.' },
          { lines: [4, 4], label: 'Download it back under a new local name to prove the round trip.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'aws s3 cp ledger.json s3://bucket/ ≈ az storage blob upload. S3 keys with slashes work the same way: folders are an illusion. The big difference is authentication: the AWS CLI always used your configured credentials; the az data commands make you choose --auth-mode, because control-plane rights (Owner) do not imply data-plane rights in Azure.' }],
    },
    {
      kind: 'concept',
      title: 'Sharing without sharing credentials: SAS',
      body: `To let a browser or a teammate read one blob without an Azure identity, generate a **Shared Access Signature**. A SAS is a signed query string: which resource, which permissions (\`r\` read, \`w\` write, \`d\` delete, \`l\` list), until when, HTTPS only. Append it to the blob URL and the link works until the expiry, then dies.

Two kinds matter: a **service SAS** signed with the account key (what \`--auth-mode key\` produces), and a **user delegation SAS** signed with your Entra identity (\`--auth-mode login --as-user\`, which needs a data role). Both look identical to the caller.`,
      example: {
        language: 'shell',
        source: 'SAS=$(az storage blob generate-sas --container-name ledger --name ledger.json --permissions r --expiry 2026-12-31T00:00Z --https-only --account-name cyberlingstore<yourname> --auth-mode key --output tsv)\ncurl -I "https://cyberlingstore<yourname>.blob.core.windows.net/ledger/ledger.json?$SAS"',
        labels: [
          { lines: [1, 1], label: 'Sign a read-only, HTTPS-only token that expires on a fixed date.' },
          { lines: [2, 2], label: 'Fetch only the headers: a 200 proves the signature works.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'aws s3 presign s3://bucket/ledger.json --expires-in 3600 ≈ az storage blob generate-sas. A presigned URL is always one object, one method, signed by one IAM identity; a SAS can also cover a container or the whole account and lists its permissions as letters in the token itself.' }],
    },
    {
      kind: 'predict',
      prompt: 'The container is private and the account disallows public access. Someone runs this without any token. What status code comes back?',
      code: { language: 'shell', source: 'curl -I https://cyberlingstore<yourname>.blob.core.windows.net/ledger/ledger.json' },
      choices: ['404 Not Found (ResourceNotFound)', '403 Forbidden (AccessDenied)', '409 Conflict (PublicAccessNotPermitted)', '401 Unauthorized'],
      answer: '404 Not Found (ResourceNotFound)',
      explanation: 'Azure Storage answers anonymous requests for private data with 404 ResourceNotFound, deliberately: an unauthenticated caller must not even learn whether the blob exists. 403 is reserved for callers who did authenticate (a SAS or a signed-in identity) but lack the permission; 409 PublicAccessNotPermitted is what you get when you try to make a container public on an account that forbids it.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the commands that get ledger.json into Azure and share a read-only link to it.',
      language: 'shell',
      indentation: false,
      solution: [
        'az storage container create --name ledger --account-name cyberlingstore<yourname> --auth-mode key',
        'az storage blob upload --container-name ledger --name ledger.json --file ledger.json --account-name cyberlingstore<yourname> --auth-mode key',
        'az storage blob list --container-name ledger --account-name cyberlingstore<yourname> --auth-mode key --output table',
        'SAS=$(az storage blob generate-sas --container-name ledger --name ledger.json --permissions r --expiry 2026-12-31T00:00Z --https-only --account-name cyberlingstore<yourname> --auth-mode key --output tsv)',
        'curl -I "https://cyberlingstore<yourname>.blob.core.windows.net/ledger/ledger.json?$SAS"',
      ],
      distractors: [
        'az storage container create --name Ledger --account-name cyberlingstore<yourname> --auth-mode key',
        'SAS=$(az storage blob generate-sas --container-name ledger --name ledger.json --permissions w --expiry 2026-12-31T00:00Z --https-only --account-name cyberlingstore<yourname> --auth-mode key --output tsv)',
        'aws s3 cp ledger.json s3://ledger/ledger.json',
      ],
      explanation: 'Container names must be lowercase, so "Ledger" is rejected. A token with permission w lets the holder overwrite the file but not read it, so curl -I would get 403. And the S3 copy syntax is muscle memory from the other cloud.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the SAS that lets someone read, and only read, over HTTPS, until the end of the year.',
      language: 'shell',
      template: 'az storage blob generate-sas --container-name ledger --name ledger.json --permissions {{perm}} --{{expiry}} 2026-12-31T00:00Z --{{https}} --account-name cyberlingstore<yourname> --auth-mode key --output tsv',
      blanks: [
        { id: 'perm', answers: ['r'], hint: 'One letter: read.' },
        { id: 'expiry', answers: ['expiry'], hint: 'When the link stops working.' },
        { id: 'https', answers: ['https-only'], hint: 'Refuse plain http.' },
      ],
      explanation: 'A SAS is as dangerous as its permissions times its lifetime. Read-only, short-lived, HTTPS-only is the default habit.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Upload the ledger and share it by link.',
      warning: 'Storing one small JSON file and a handful of requests costs a fraction of a cent. A SAS token is a bearer secret: anyone holding the URL can read the blob until it expires, so do not paste it anywhere public. This fieldwork uses --auth-mode key because your account does not yet hold a data role; the next lesson fixes that properly.',
      checklist: [
        'Save this as `ledger.json` locally: `[{"description":"Salary","amount":2500},{"description":"Rent","amount":-900},{"description":"Coffee","amount":-3.5}]` (exactly three entries; the next lesson counts them).',
        'Run `az storage container create --name ledger --account-name cyberlingstore<yourname> --auth-mode key`.',
        'Run `az storage blob upload --container-name ledger --name ledger.json --file ledger.json --account-name cyberlingstore<yourname> --auth-mode key`, then list the container with `az storage blob list ... --output table`.',
        'Run `curl -I https://cyberlingstore<yourname>.blob.core.windows.net/ledger/ledger.json` with no token and note the status.',
        'Generate a read SAS: `SAS=$(az storage blob generate-sas --container-name ledger --name ledger.json --permissions r --expiry <tomorrow, e.g. 2026-11-10T00:00Z> --https-only --account-name cyberlingstore<yourname> --auth-mode key --output tsv)`.',
        'Run `curl -I "https://cyberlingstore<yourname>.blob.core.windows.net/ledger/ledger.json?$SAS"` and read the first line.',
        'Teardown: keep the container and blob if you are continuing to the next lesson today (they cost nothing measurable). Otherwise run `az storage container delete --name ledger --account-name cyberlingstore<yourname> --auth-mode key`; the SAS dies with the blob.',
      ],
      verify: { question: 'What HTTP status code did curl -I return for the URL with the SAS token?', answers: ['200'] },
    },
  ],
};

const l23: Lesson = {
  id: 'az-2-3',
  title: 'The .NET SDK and the data-plane role',
  objective: 'Read a blob from C# with DefaultAzureCredential, after granting your identity the Storage Blob Data Contributor role.',
  minutes: 35,
  lexicon: [
    { id: 'az.2.blob-service-client', term: 'BlobServiceClient', kind: 'builtin', meaning: 'The root client of the Azure.Storage.Blobs package. From it you get a BlobContainerClient, and from that a BlobClient for one blob.', example: 'new BlobServiceClient(new Uri("https://cyberlingstore<yourname>.blob.core.windows.net"), new DefaultAzureCredential())' },
    { id: 'az.2.default-azure-credential', term: 'DefaultAzureCredential', kind: 'builtin', meaning: 'From Azure.Identity: tries a chain of credential sources (environment variables, managed identity, Visual Studio, Azure CLI, ...) and uses the first that works. Locally that is your az login.', example: 'new DefaultAzureCredential()', analogy: 'The AWS SDK credential chain (env vars, profile, instance role). Same idea: code never changes between laptop and cloud, only where the identity comes from.' },
    { id: 'az.2.data-plane-role', term: 'Storage Blob Data Contributor', kind: 'concept', meaning: 'The RBAC role that allows reading and writing blob data. Owner and Contributor manage the account but do not include it, so even the person who created the account gets 403 without it.', example: 'az role assignment create --assignee <object-id> --role "Storage Blob Data Contributor" --scope <storage-account-id>' },
    { id: 'az.2.download-content', term: 'DownloadContentAsync', kind: 'builtin', meaning: 'BlobClient method that fetches a whole blob into memory and returns BlobDownloadResult; .Value.Content is a BinaryData you can turn into a string or stream.', example: 'var content = await blob.DownloadContentAsync();' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Three clients, one credential',
      body: `The SDK mirrors the hierarchy: \`BlobServiceClient\` (the account) gives a \`BlobContainerClient\`, which gives a \`BlobClient\` for one blob. Install two packages: \`Azure.Storage.Blobs\` for the clients and \`Azure.Identity\` for credentials.

\`DefaultAzureCredential\` is the credential you want almost everywhere. It walks a chain: environment variables, a managed identity if the code runs in Azure, Visual Studio, the Azure CLI, and more. On your laptop it quietly reuses your \`az login\`. In Module 6 the same line will pick up the web app's managed identity, with no code change and no connection string in config.

\`DownloadContentAsync\` pulls the blob into memory; \`UploadAsync\` sends a stream or \`BinaryData\` back. A failed call throws \`RequestFailedException\` with the HTTP status in \`.Status\`.`,
      example: {
        language: 'csharp',
        source: 'using Azure;\nusing Azure.Identity;\nusing Azure.Storage.Blobs;\nusing System.Text.Json;\n\nvar service = new BlobServiceClient(new Uri("https://cyberlingstore<yourname>.blob.core.windows.net"), new DefaultAzureCredential());\nvar blob = service.GetBlobContainerClient("ledger").GetBlobClient("ledger.json");\ntry\n{\n    var content = await blob.DownloadContentAsync();\n    using var doc = JsonDocument.Parse(content.Value.Content.ToString());\n    Console.WriteLine($"Entries: {doc.RootElement.GetArrayLength()}");\n    await blob.UploadAsync(BinaryData.FromString(doc.RootElement.GetRawText()), overwrite: true);\n}\ncatch (RequestFailedException e) when (e.Status == 403)\n{\n    Console.WriteLine("403: your identity has no data-plane role on this account yet.");\n}',
        labels: [
          { lines: [1, 4], label: 'Clients, credentials and the JSON reader you already know from LedgerSharp.' },
          { lines: [6, 7], label: 'Account → container → blob, authenticated by whatever DefaultAzureCredential finds.' },
          { lines: [10, 12], label: 'Fetch the blob, parse it as a JSON array, print how many entries it holds.' },
          { lines: [13, 13], label: 'Write it back unchanged, to show the upload side of the API.' },
          { lines: [15, 18], label: 'Name the one failure you will actually see first: 403 for a missing data role.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'boto3.client("s3").get_object(Bucket=..., Key=...) had the credential chain built in and you never named it. Here the chain is an object, DefaultAzureCredential, that you pass to the client. And the permission model splits: in AWS one IAM policy covered both "create bucket" and "get object"; in Azure, Owner covers creating the account but data access is a separate role on the data plane.' }],
    },
    {
      kind: 'predict',
      prompt: 'You created the storage account yourself and are Owner of the subscription. You run the program above for the first time, with no role assignments added. What prints?',
      code: { language: 'shell', source: 'dotnet run' },
      choices: ['403: your identity has no data-plane role on this account yet.', 'Entries: 3', 'A 404, because DefaultAzureCredential cannot find az login', 'A 401, because dotnet run has no credentials'],
      answer: '403: your identity has no data-plane role on this account yet.',
      explanation: 'Owner is a control-plane role: it lets you create, configure and delete the account, and read its keys. Reading blob data with an Entra identity needs a data-plane role (Storage Blob Data Reader or Contributor). Without it the service authenticates you fine (so not 401), finds the blob (so not 404), and refuses with 403 AuthorizationPermissionMismatch. The CLI --auth-mode key path worked earlier only because it used the shared key, not your identity.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the program that downloads ledger.json and prints the entry count. Indent the body of the try and catch blocks by 4 spaces.',
      language: 'csharp',
      indentation: true,
      solution: [
        'using Azure;',
        'using Azure.Identity;',
        'using Azure.Storage.Blobs;',
        'using System.Text.Json;',
        'var service = new BlobServiceClient(new Uri("https://cyberlingstore<yourname>.blob.core.windows.net"), new DefaultAzureCredential());',
        'var blob = service.GetBlobContainerClient("ledger").GetBlobClient("ledger.json");',
        'try',
        '{',
        '    var content = await blob.DownloadContentAsync();',
        '    using var doc = JsonDocument.Parse(content.Value.Content.ToString());',
        '    Console.WriteLine($"Entries: {doc.RootElement.GetArrayLength()}");',
        '}',
        'catch (RequestFailedException e) when (e.Status == 403)',
        '{',
        '    Console.WriteLine("403: your identity has no data-plane role on this account yet.");',
        '}',
      ],
      distractors: [
        'var service = new BlobServiceClient("DefaultEndpointsProtocol=https;AccountName=cyberlingstore<yourname>;AccountKey=...");',
        'var blob = service.GetBlobClient("ledger/ledger.json");',
      ],
      explanation: 'A connection string with the account key works, but it is exactly the secret-in-config habit this track is unlearning; DefaultAzureCredential keeps secrets out of the program. And BlobServiceClient has no GetBlobClient: the path is account → container → blob, not an S3-style "bucket/key" string.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the role assignment that turns the 403 into a 200.',
      language: 'shell',
      template: 'az role assignment create \\\n  --assignee $(az ad signed-in-user show --query {{idq}} --output tsv) \\\n  --role "{{role}}" \\\n  --{{scopeflag}} $(az storage account show --name cyberlingstore<yourname> --resource-group cyberling-rg --query id --output tsv)',
      blanks: [
        { id: 'idq', answers: ['id'], hint: 'The object id of the signed-in user.' },
        { id: 'role', answers: ['Storage Blob Data Contributor'], hint: 'The built-in data role for reading and writing blobs.' },
        { id: 'scopeflag', answers: ['scope'], hint: 'The flag that limits the grant to this one storage account.' },
      ],
      explanation: 'Assignee (who), role (what), scope (where). Scope the grant to the storage account, not the subscription: least privilege is a habit, not a module.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Grant yourself the data role and read the ledger from C#.',
      warning: 'Downloading a few kilobytes costs nothing measurable. Role assignments are free. Expect the role to take one to five minutes to propagate: a 403 right after the assignment is normal, so wait and retry rather than widening the scope. Azure.Identity may open a browser if az login has expired.',
      checklist: [
        'Create a console project: `dotnet new console -n LedgerBlobs && cd LedgerBlobs`, then `dotnet add package Azure.Storage.Blobs` and `dotnet add package Azure.Identity`.',
        'Replace Program.cs with the program from the parsons step (your account name in the URL) and run `dotnet run`. Note the 403 line.',
        'Run the role assignment from the cloze step: `az role assignment create --assignee $(az ad signed-in-user show --query id --output tsv) --role "Storage Blob Data Contributor" --scope $(az storage account show --name cyberlingstore<yourname> --resource-group cyberling-rg --query id --output tsv)`.',
        'Wait a couple of minutes, run `dotnet run` again and read the line it prints.',
        'Try the CLI with your identity now: `az storage blob list --container-name ledger --account-name cyberlingstore<yourname> --auth-mode login --output table` works too.',
        'Teardown: the role assignment costs nothing and the next lesson deletes the account, which removes it. If you stop here instead, delete the account with `az storage account delete --name cyberlingstore<yourname> --resource-group cyberling-rg --yes`.',
      ],
      verify: { question: 'Type the exact line the program printed once the role had propagated.', answers: ['Entries: 3', 'Entries:3'] },
    },
  ],
};

const l24: Lesson = {
  id: 'az-2-4',
  title: 'Table Storage preview and teardown',
  objective: 'Insert and query entities in Table Storage, then delete the storage account and prove it is gone.',
  minutes: 30,
  lexicon: [
    { id: 'az.2.table', term: 'Table Storage', kind: 'service', meaning: 'The storage account\'s schemaless key-value service: tables of entities with arbitrary properties, indexed only by PartitionKey and RowKey. Priced per GB and per transaction, with no per-hour charge.', example: 'az storage table create --name entries --account-name cyberlingstore<yourname> --auth-mode key', analogy: 'DynamoDB without the knobs: no secondary indexes, no capacity modes, no streams. Cheaper and simpler, slower under heavy load.' },
    { id: 'az.2.partition-row-key', term: 'PartitionKey / RowKey', kind: 'concept', meaning: 'The two mandatory string properties of every entity. Together they are the unique key; all entities with the same PartitionKey are stored together, so queries inside a partition are fast.', example: 'PartitionKey=alice RowKey=2026-11-09T10:00:00Z', analogy: 'DynamoDB partition key and sort key. Same roles, but in Table Storage both must be strings.' },
    { id: 'az.2.entity-insert', term: 'az storage entity insert --entity k=v ...', kind: 'pattern', meaning: 'Insert one entity from space-separated key=value pairs. Non-string types are declared with an @odata.type pair.', example: 'az storage entity insert --table-name entries --entity PartitionKey=alice RowKey=1 Amount=-3.5 Amount@odata.type=Edm.Double --account-name cyberlingstore<yourname> --auth-mode key' },
    { id: 'az.2.account-delete', term: 'az storage account delete', kind: 'pattern', meaning: 'Remove the account and every blob, table, queue and share in it. Afterwards az storage account show fails with error code ResourceNotFound.', example: 'az storage account delete --name cyberlingstore<yourname> --resource-group cyberling-rg --yes' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Table Storage: the cheap store for Module 5',
      body: `The same storage account also serves **Table Storage**: tables of **entities**, each a bag of properties with no schema. Two properties are mandatory and together form the key: **PartitionKey** and **RowKey**, both strings. Entities with the same PartitionKey live together, so a query that names the partition is fast; a filter without it scans the whole table.

Module 5 will store LedgerSharp entries here with PartitionKey = owner and RowKey = timestamp, and compute \`GET /balance\` by summing one partition. Why not Cosmos DB? Table Storage bills only for gigabytes and transactions, with no hourly minimum: a ledger with a few thousand rows costs cents a month. Cosmos DB adds global distribution, indexes on every property and single-digit-millisecond guarantees, for a floor of tens of dollars a month. Start cheap; Module 5 shows when to upgrade.

Property values are strings unless you declare a type with an \`@odata.type\` pair.`,
      example: {
        language: 'shell',
        source: 'az storage table create --name entries --account-name cyberlingstore<yourname> --auth-mode key\naz storage entity insert --table-name entries --entity PartitionKey=alice RowKey=2026-11-09T10:00:00Z Description=Coffee Amount=-3.5 Amount@odata.type=Edm.Double --account-name cyberlingstore<yourname> --auth-mode key\naz storage entity query --table-name entries --filter "PartitionKey eq \'alice\'" --account-name cyberlingstore<yourname> --auth-mode key --output table',
        labels: [
          { lines: [1, 1], label: 'Create a table; it costs nothing while empty.' },
          { lines: [2, 2], label: 'Insert one entity: key pair, two properties, and a type annotation so Amount is a number.' },
          { lines: [3, 3], label: 'Query one partition with an OData filter: fast, because the keys are the index.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'DynamoDB table LedgerEntries (owner, ts) ≈ Table Storage table entries (PartitionKey, RowKey). DynamoDB Query needed the partition key and used a separate Scan for everything else; Table Storage has one query operation and quietly scans when the filter lacks PartitionKey. DynamoDB on-demand had no floor either, but Table Storage is cheaper per request and has no GSIs, no streams and no autoscaling to configure.' }],
    },
    {
      kind: 'predict',
      prompt: 'The table has entities for several owners. What does this query do?',
      code: { language: 'shell', source: 'az storage entity query --table-name entries --filter "Amount lt 0" --account-name cyberlingstore<yourname> --auth-mode key' },
      choices: ['Returns the matching entities, but by scanning every partition (slow and more transactions)', 'Fails: a query must include PartitionKey', 'Returns nothing: Amount is not a key property', 'Returns the matches as fast as a PartitionKey query'],
      answer: 'Returns the matching entities, but by scanning every partition (slow and more transactions)',
      explanation: 'Table Storage lets you filter on any property, but only PartitionKey and RowKey are indexed. A filter without them reads the whole table, which is fine for a few hundred rows and painful for millions. That is why Module 5 chooses PartitionKey = owner: the balance query stays inside one partition. DynamoDB would have made you call Scan explicitly for the same thing.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the insert and the partition query.',
      language: 'shell',
      template: 'az storage entity insert --table-name entries --entity {{pk}}=alice {{rk}}=2026-11-09T10:00:00Z Description=Coffee Amount=-3.5 Amount@odata.type=Edm.Double --account-name cyberlingstore<yourname> --auth-mode key\naz storage entity query --table-name entries --filter "PartitionKey {{op}} \'alice\'" --account-name cyberlingstore<yourname> --auth-mode key --output table',
      blanks: [
        { id: 'pk', answers: ['PartitionKey'], hint: 'The property that groups entities that are stored together.' },
        { id: 'rk', answers: ['RowKey'], hint: 'The property that is unique within a partition.' },
        { id: 'op', answers: ['eq'], hint: 'OData\'s equality operator is two letters, not ==.' },
      ],
      explanation: 'PartitionKey and RowKey are spelled exactly like that and are required on every entity. Filters use OData operators: eq, ne, gt, ge, lt, le.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the steps for the module\'s teardown, ending with the proof that nothing is left.',
      language: 'text',
      indentation: false,
      solution: [
        'Query the entries table once more so you know what you are deleting',
        'Delete the ledger container with az storage container delete',
        'Delete the storage account with az storage account delete --yes',
        'Run az storage account show on the deleted name and read the error code',
        'Run az group show --name cyberling-rg to confirm the group itself is still there for Module 3',
      ],
      distractors: [
        'Delete the resource group cyberling-rg, since the account is its only resource',
        'Delete every blob individually before the container, because a non-empty container cannot be deleted',
      ],
      explanation: 'The group stays: Module 3 reuses it, and the spine deletes it only at the end of the track. Deleting a container removes its blobs with it, and deleting the account removes containers and tables alike, so there is no need to empty anything by hand. That is the opposite of S3, where aws s3 rb refused a non-empty bucket without --force.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Milestone: preview Table Storage, then tear the storage account down and prove it is gone.',
      warning: 'A table with two entities costs nothing measurable. Deleting the storage account is permanent for the data; you can recreate the name later, though it can stay reserved for a short while after deletion, so do not panic if a re-create fails for a few minutes. The resource group is kept on purpose; an empty group costs nothing.',
      checklist: [
        'Run `az storage table create --name entries --account-name cyberlingstore<yourname> --auth-mode key`.',
        'Insert two entities for owner alice with different RowKey timestamps using `az storage entity insert ... --entity PartitionKey=alice RowKey=<timestamp> Description=<text> Amount=<number> Amount@odata.type=Edm.Double`.',
        'Run `az storage entity query --table-name entries --filter "PartitionKey eq \'alice\'" --account-name cyberlingstore<yourname> --auth-mode key --output table` and check both rows appear.',
        'Delete the container: `az storage container delete --name ledger --account-name cyberlingstore<yourname> --auth-mode login`.',
        'Delete the account: `az storage account delete --name cyberlingstore<yourname> --resource-group cyberling-rg --yes`.',
        'Run `az storage account show --name cyberlingstore<yourname> --resource-group cyberling-rg` and read the error code in parentheses at the start of the message.',
        'Run `az group show --name cyberling-rg --query properties.provisioningState` to confirm the group is still there for Module 3. Remember: at the end of the track, `az group delete --name cyberling-rg --yes` is the universal cleanup.',
      ],
      verify: { question: 'Type the error code (the word in parentheses) that az storage account show printed for the deleted account.', answers: ['ResourceNotFound'] },
    },
  ],
};

export const m2: Module = {
  id: 'az-m2',
  title: 'Storage',
  goal: 'Storage accounts, blobs, tables, SAS tokens, the CLI and the .NET SDK.',
  projectMilestone: 'Ledger exports in Blob Storage.',
  status: 'available',
  lessons: [l21, l22, l23, l24],
};
