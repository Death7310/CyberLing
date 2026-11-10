import type { Lesson, Module } from '../../schema';

/*
 * Module 7: Infrastructure as code.
 * Describes everything Modules 2 to 6 built by hand (storage account + table, App Service plan + web app with a
 * system-assigned identity, Application Insights, the RBAC assignment) in one `main.bicep`, previews it with
 * what-if, deploys it, reads the deployment's provisioningState, then deletes the resource group for good.
 * Names match the earlier modules exactly, so the deployment adopts the hand-made resources instead of duplicating them.
 */

const TEMPLATE = [
  '// LedgerSharp on Azure: everything Modules 2 to 6 built, in one file.',
  'param location string = resourceGroup().location',
  'param yourName string',
  "param ledgerOwner string = 'me'",
  '',
  "var storageName = 'cyberlingstore${yourName}'",
  "var apiName = 'cyberling-api-${yourName}'",
  "var tableDataContributor = '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3' // Storage Table Data Contributor",
  '',
  "resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {",
  '  name: storageName',
  '  location: location',
  '  sku: {',
  "    name: 'Standard_LRS'",
  '  }',
  "  kind: 'StorageV2'",
  '  properties: {',
  "    minimumTlsVersion: 'TLS1_2'",
  '    allowBlobPublicAccess: false',
  '  }',
  '}',
  '',
  "resource tableService 'Microsoft.Storage/storageAccounts/tableServices@2023-05-01' = {",
  '  parent: storage',
  "  name: 'default'",
  '}',
  '',
  "resource ledgerTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = {",
  '  parent: tableService',
  "  name: 'LedgerEntries'",
  '}',
  '',
  "resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {",
  "  name: 'cyberling-logs'",
  '  location: location',
  '  properties: {',
  '    sku: {',
  "      name: 'PerGB2018'",
  '    }',
  '    retentionInDays: 30',
  '  }',
  '}',
  '',
  "resource insights 'Microsoft.Insights/components@2020-02-02' = {",
  "  name: 'cyberling-ai'",
  '  location: location',
  "  kind: 'web'",
  '  properties: {',
  "    Application_Type: 'web'",
  '    WorkspaceResourceId: logs.id',
  '  }',
  '}',
  '',
  "resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {",
  "  name: 'cyberling-plan'",
  '  location: location',
  "  kind: 'linux'",
  '  sku: {',
  "    name: 'F1'",
  "    tier: 'Free'",
  '  }',
  '  properties: {',
  '    reserved: true',
  '  }',
  '}',
  '',
  "resource api 'Microsoft.Web/sites@2023-12-01' = {",
  '  name: apiName',
  '  location: location',
  "  kind: 'app,linux'",
  '  identity: {',
  "    type: 'SystemAssigned'",
  '  }',
  '  properties: {',
  '    serverFarmId: plan.id',
  '    httpsOnly: true',
  '    siteConfig: {',
  "      linuxFxVersion: 'DOTNETCORE|8.0'",
  '      appSettings: [',
  '        {',
  "          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'",
  '          value: insights.properties.ConnectionString',
  '        }',
  '        {',
  "          name: 'STORAGE_ACCOUNT'",
  '          value: storage.name',
  '        }',
  '        {',
  "          name: 'LEDGER_OWNER'",
  '          value: ledgerOwner',
  '        }',
  '      ]',
  '    }',
  '  }',
  '}',
  '',
  "resource tableAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {",
  '  name: guid(storage.id, api.id, tableDataContributor)',
  '  scope: storage',
  '  properties: {',
  "    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', tableDataContributor)",
  '    principalId: api.identity.principalId',
  "    principalType: 'ServicePrincipal'",
  '  }',
  '}',
  '',
  "output apiUrl string = 'https://${api.properties.defaultHostName}'",
  'output storageAccountName string = storage.name',
  'output apiPrincipalId string = api.identity.principalId',
].join('\n');

const l71: Lesson = {
  id: 'az-7-1',
  title: 'ARM and Bicep: describe, do not click',
  objective: 'Explain Azure Resource Manager as the one API behind everything and read a Bicep file\'s param, var, resource and output declarations.',
  minutes: 30,
  lexicon: [
    { id: 'az.7.arm', term: 'Azure Resource Manager (ARM)', kind: 'service', meaning: 'The single control-plane API every Azure tool talks to. The portal, the CLI, the SDKs and templates all send it the same requests; it authenticates them, checks RBAC and forwards them to the resource provider.', example: 'az rest --method get --url "https://management.azure.com/subscriptions/<sub>/resourceGroups/cyberling-rg?api-version=2021-04-01"', analogy: 'CloudFormation is one AWS service among many; ARM is the front door to all of them. The analogy breaks there: in Azure there is no way around the template engine\'s API, because it is the same API the CLI uses.' },
    { id: 'az.7.bicep', term: 'Bicep', kind: 'service', meaning: 'A declarative language for Azure resources that compiles to an ARM JSON template. Same resources, same API versions, a tenth of the punctuation.', example: 'az bicep build --file main.bicep   # writes main.json', analogy: 'SAM is to CloudFormation what Bicep is to ARM JSON: a friendlier way to write the same thing. The analogy breaks on mechanism: SAM expands at deploy time in the cloud; Bicep compiles on your machine and the cloud sees only JSON.' },
    { id: 'az.7.resource', term: 'resource <symbol> \'<type>@<apiVersion>\' = { ... }', kind: 'keyword', meaning: 'Declare one resource: a symbolic name you use elsewhere in the file, the fully qualified type with its API version, and the body (name, location, sku, properties).', example: "resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {\n  name: 'cyberlingstoresam'\n  location: 'westeurope'\n  sku: { name: 'Standard_LRS' }\n  kind: 'StorageV2'\n}" },
    { id: 'az.7.param-var-output', term: 'param / var / output', kind: 'keyword', meaning: 'param: a typed input the deployer supplies (or a default). var: a value computed from params and other vars. output: a value the deployment publishes after it finishes, such as a hostname.', example: "param yourName string\nvar apiName = 'cyberling-api-${yourName}'\noutput apiUrl string = 'https://${api.properties.defaultHostName}'" },
    { id: 'az.7.idempotent', term: 'idempotent deployment', kind: 'concept', meaning: 'Deploying the same template twice leaves the same result as deploying it once. ARM sends each resource a PUT with the desired state; a resource that already matches is left as it is.', example: 'az deployment group create --resource-group cyberling-rg --template-file main.bicep   # run it again: Succeeded, nothing changes', analogy: 'Setting a thermostat to 20 degrees twice does not make the room 40 degrees. The analogy breaks for properties a provider cannot compare, where what-if may still report a Modify that changes nothing.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'One API, and a file that describes the result',
      body: `Every \`az\` command you ran in Modules 1 to 6 became an HTTPS request to **Azure Resource Manager**, the one control-plane API for the whole platform. The portal sends the same requests. So does a template. That is the first notional-machine fact of this module: there is no separate "infrastructure as code" service; a template is just a batch of the requests you already know, sent together.

The second fact is the shape of the request. ARM is **declarative**: you do not say "create a storage account", you send a **PUT** for a storage account with these properties. If it does not exist, it is created; if it exists and matches, nothing happens; if it exists and differs, it is updated. A file full of such declarations is a **template**, and deploying it is **idempotent**: run it twice, get one result.

**Bicep** is the language for writing templates. It compiles to the ARM JSON that ARM actually accepts (\`az bicep build\` shows you), with far less punctuation. The CLI runs the compiler for you whenever you pass a \`.bicep\` file to \`az deployment\`.`,
      example: {
        language: 'text',
        source: "param location string = resourceGroup().location\nparam yourName string\n\nvar storageName = 'cyberlingstore${yourName}'\n\nresource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {\n  name: storageName\n  location: location\n  sku: {\n    name: 'Standard_LRS'\n  }\n  kind: 'StorageV2'\n}\n\noutput storageId string = storage.id",
        labels: [
          { lines: [1, 2], label: 'Inputs: the location defaults to the resource group\'s; your name has no default, so the deployer must supply it.' },
          { lines: [4, 4], label: 'A computed value: the globally unique account name, built from the parameter.' },
          { lines: [6, 13], label: 'One resource: symbolic name storage, type and API version, then the same settings you passed as flags in Module 2.' },
          { lines: [15, 15], label: 'Publish the resource id so the next step (or a person) can read it without looking it up.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'CloudFormation template ≈ ARM template; SAM ≈ Bicep as the friendlier syntax. Stack ≈ resource group plus a deployment record, with one false friend: a CloudFormation stack owns its resources, but an ARM deployment is only a record of an operation; the resource group is what contains things. Lesson 7-4 shows what that means for deleting.' }],
    },
    {
      kind: 'concept',
      title: 'The five words of Bicep',
      body: `A Bicep file has five kinds of top-level statement, and you have just met four:

- \`param name type = default\`: an input. Types are \`string\`, \`int\`, \`bool\`, \`object\`, \`array\`. No default means required.
- \`var name = expression\`: a computed value, typed by inference.
- \`resource symbol 'Type@apiVersion' = { ... }\`: a declaration. The **symbolic name** is for the file; the \`name:\` property is what Azure sees.
- \`output name type = expression\`: a published value.
- \`module symbol './file.bicep' = { name: ..., params: { ... } }\`: another Bicep file deployed as a unit, with its own params and outputs.

Two things make a file hang together. **String interpolation** \`'\${...}'\` builds names from params. **Symbolic references** such as \`storage.id\`, \`plan.id\` or \`api.identity.principalId\` read a property of another resource, and every such reference is also a **dependency**: ARM creates the referenced resource first. You rarely write \`dependsOn\` by hand. Functions like \`resourceGroup()\`, \`guid()\` and \`subscriptionResourceId()\` fill in values the file cannot know in advance.`,
      example: {
        language: 'text',
        source: "param yourName string\nparam location string = resourceGroup().location\n\nmodule storage './storage.bicep' = {\n  name: 'storage'\n  params: {\n    yourName: yourName\n    location: location\n  }\n}\n\nmodule web './web.bicep' = {\n  name: 'web'\n  params: {\n    yourName: yourName\n    location: location\n    storageAccountName: storage.outputs.accountName\n  }\n}\n\noutput apiUrl string = web.outputs.apiUrl",
        labels: [
          { lines: [4, 10], label: 'Deploy storage.bicep as a module, passing it the two params it declares.' },
          { lines: [12, 19], label: 'A second module that needs a value the first one produced; the reference makes web wait for storage.' },
          { lines: [21, 21], label: 'Re-export a module output so the deployer sees it.' },
        ],
      },
      contrast: [{ from: 'aws', note: '!Ref LedgerTable ≈ table.name; !GetAtt LedgerTable.Arn ≈ table.id; !Sub "...${X}..." ≈ \'...${x}...\'. Nested stacks ≈ modules. SAM policy templates such as DynamoDBCrudPolicy have no Bicep twin: Bicep has no shorthand types at all, only the real resource types with their API versions. The Transform line has nothing to correspond to; Bicep is finished before Azure sees it.' }],
    },
    {
      kind: 'predict',
      prompt: 'You deployed this file on Monday. On Tuesday you run the identical command again without touching the file or the storage account. What happens?',
      code: { language: 'shell', source: 'az deployment group create --resource-group cyberling-rg --template-file main.bicep --parameters yourName=sam\n# Tuesday, nothing changed:\naz deployment group create --resource-group cyberling-rg --template-file main.bicep --parameters yourName=sam' },
      choices: [
        'It succeeds and nothing is created, deleted or reconfigured: the storage account already matches the declaration',
        'It fails: a storage account named cyberlingstoresam already exists',
        'It creates a second storage account with a numeric suffix',
        'It deletes the storage account and recreates it empty',
      ],
      answer: 'It succeeds and nothing is created, deleted or reconfigured: the storage account already matches the declaration',
      explanation: 'ARM sends a PUT describing the desired state. The storage provider compares it with the account that exists, finds no difference, and leaves it alone; the deployment ends with provisioningState Succeeded. That is idempotency, and it is why a template can be deployed on every push without fear. "Already exists" errors come from imperative create commands (az storage account create), not from declarations.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the four keywords and the one symbolic reference in this smallest useful Bicep file.',
      language: 'text',
      template: "{{param}} location string = resourceGroup().location\nparam yourName string\n\n{{var}} storageName = 'cyberlingstore${yourName}'\n\nresource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {\n  name: storageName\n  location: location\n  sku: {\n    name: 'Standard_LRS'\n  }\n  kind: 'StorageV2'\n}\n\n{{output}} storageId string = storage.{{id}}",
      blanks: [
        { id: 'param', answers: ['param'], hint: 'The keyword for a typed input the deployer supplies.' },
        { id: 'var', answers: ['var'], hint: 'The keyword for a value computed inside the file.' },
        { id: 'output', answers: ['output'], hint: 'The keyword for a value published when the deployment finishes.' },
        { id: 'id', answers: ['id'], hint: 'The property holding the full resource id (the string you used as a --scope in Module 6).' },
      ],
      explanation: 'param in, var in between, output out. storage.id reads the resource id from the symbolic name; the same dotted syntax reaches any property, such as api.identity.principalId.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Install the Bicep compiler and compile the smallest useful file, without deploying anything.',
      warning: 'Nothing in this lesson touches your subscription: the Bicep compiler runs on your machine and az bicep build sends no request to Azure. Cost: zero. Whatever cyberling-rg contains from Module 6 keeps costing what it already did (nothing on the F1 plan, pennies of storage, free telemetry allowance).',
      checklist: [
        'Run `az bicep install` (or `az bicep upgrade` if it is already there), then `az bicep version`.',
        'Create a folder `infra` next to your LedgerSharp project and save the concept example above as `infra/main.bicep`.',
        'Run `az bicep build --file infra/main.bicep` and open the file it produced. Find your three statements inside it: the `param` under "parameters", the `resource` inside the "resources" array, the `output` under "outputs".',
        'Read the compiled resource block: the type and API version you wrote are there verbatim, and `storage.id` has become a `resourceId(...)` function call. Nothing was sent to Azure.',
        'Change `Standard_LRS` to `Standard_LRX`, rebuild, and read the compiler\'s complaint; then fix it. Errors at build time are free; errors at deploy time are not.',
        'Keep the file: Lesson 7-2 grows it into the whole project. No teardown is needed, because nothing was created.',
      ],
      verify: { question: 'az bicep build wrote a file next to main.bicep. Type its file name, with extension.', answers: ['main.json'] },
    },
  ],
};

const l72: Lesson = {
  id: 'az-7-2',
  title: 'The template: LedgerSharp on one page',
  objective: 'Read and complete a main.bicep that declares the storage account and table, the plan and web app with its identity and settings, Application Insights and the RBAC assignment.',
  minutes: 35,
  lexicon: [
    { id: 'az.7.apiversion', term: '@<apiVersion>', kind: 'punctuation', meaning: 'The dated version of a resource type\'s schema, written after the type. It fixes which properties exist and how they behave, so a template deploys the same way next year.', example: "'Microsoft.Web/sites@2023-12-01'" },
    { id: 'az.7.parent', term: 'parent:', kind: 'keyword', meaning: 'Declares a child resource (a table inside a storage account\'s table service) by naming its parent symbol; Bicep builds the full nested name and the dependency for you.', example: "resource ledgerTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = {\n  parent: tableService\n  name: 'LedgerEntries'\n}" },
    { id: 'az.7.identity-block', term: "identity: { type: 'SystemAssigned' }", kind: 'pattern', meaning: 'The block on a web app (or function app, VM) that gives it a system-assigned managed identity at creation. Its principalId is readable in the same file as <symbol>.identity.principalId.', example: "identity: {\n  type: 'SystemAssigned'\n}", analogy: 'The Role property on a SAM function. The analogy breaks on who writes the permissions: SAM generates a role from Policies; here the identity is empty until a separate roleAssignments resource grants it something.' },
    { id: 'az.7.roleassignment', term: 'Microsoft.Authorization/roleAssignments', kind: 'pattern', meaning: 'The RBAC assignment as a resource: a name that must be a GUID (use guid(...) over stable inputs), a scope (the resource it applies to), a roleDefinitionId and a principalId.', example: "resource tableAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {\n  name: guid(storage.id, api.id, tableDataContributor)\n  scope: storage\n  properties: {\n    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', tableDataContributor)\n    principalId: api.identity.principalId\n    principalType: 'ServicePrincipal'\n  }\n}" },
    { id: 'az.7.implicit-dependency', term: 'implicit dependency', kind: 'concept', meaning: 'When one resource\'s body reads a property of another (plan.id, insights.properties.ConnectionString), ARM deploys the referenced resource first. Order in the file is irrelevant; references are what order the work.', example: 'serverFarmId: plan.id   // the plan is created before the web app, no dependsOn needed' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Six modules, one hundred lines',
      body: `Here is everything you built by hand in Modules 2 to 6, declared. Read it with the labels; every value in it is one you have typed as a CLI flag before.

A few decisions deserve a sentence. **Names are the same** as the hand-made resources (\`cyberling-plan\`, \`cyberling-ai\`, \`cyberlingstore<yourname>\`), on purpose: ARM matches a declaration to a resource by type and name, so deploying this into your existing \`cyberling-rg\` **adopts** what is there instead of duplicating it. The table is declared as a **child** of the account's table service with \`parent:\`, which is how nested names like \`cyberlingstoresam/default/LedgerEntries\` are written. The web app's settings are declared in \`siteConfig.appSettings\`, which **replaces** the whole list on every deploy: anything set by hand (including the build flag \`az webapp up\` adds) is gone until the next \`az webapp up\` puts it back. And the role assignment is a resource like any other, with two rules: its \`name\` must be a GUID, so \`guid()\` over stable inputs gives the same GUID every deploy; and the role is referred to by its **definition id**, built from the role's fixed GUID (\`0a9a7e1f-...\` is Storage Table Data Contributor in every subscription).

What the file does **not** contain is the code. Bicep deploys infrastructure and configuration; \`az webapp up\` or a workflow ships the zip.`,
      example: {
        language: 'text',
        source: TEMPLATE,
        labels: [
          { lines: [2, 4], label: 'Inputs: the location follows the group, your name makes the global names unique, the owner becomes the PartitionKey.' },
          { lines: [6, 8], label: 'Computed names and the fixed GUID of the Storage Table Data Contributor role.' },
          { lines: [10, 21], label: 'The storage account from Module 2: LRS, StorageV2, with two hardening properties Defender recommended.' },
          { lines: [23, 31], label: 'The table service (always named default) and the LedgerEntries table from Module 5, as children.' },
          { lines: [33, 52], label: 'The Log Analytics workspace and the workspace-based Application Insights component from Module 6.' },
          { lines: [54, 65], label: 'The free Linux plan from Module 4; reserved: true is how a plan says Linux.' },
          { lines: [67, 73], label: 'The web app with a system-assigned identity, created in the same request as the app.' },
          { lines: [74, 95], label: 'Which plan, HTTPS only, .NET 8 on Linux, and the three app settings, two of them read from sibling resources.' },
          { lines: [97, 105], label: 'Who (the app\'s principal), what (the data role), where (the storage account): Module 6\'s role assignment, declared.' },
          { lines: [107, 109], label: 'Outputs: the URL you will curl, the account name, the principal id.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'This is the raw-CloudFormation level of detail, with no SAM-style shorthand: each resource names its real type and API version. The Ledger stack had a generated table name read through TABLE_NAME; here names are fixed by your yourName param, because storage account and web app names must be globally unique and the earlier modules already chose them.' }],
    },
    {
      kind: 'predict',
      prompt: 'You move the tableAccess block to the very top of main.bicep, above the storage and api resources, and deploy. What happens?',
      code: { language: 'text', source: "resource tableAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {\n  name: guid(storage.id, api.id, tableDataContributor)\n  scope: storage\n  properties: {\n    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', tableDataContributor)\n    principalId: api.identity.principalId\n    principalType: 'ServicePrincipal'\n  }\n}\n\nresource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {\n  // ... unchanged\n}\n\nresource api 'Microsoft.Web/sites@2023-12-01' = {\n  // ... unchanged\n}" },
      choices: [
        'Same result as before: the references to storage.id and api.identity.principalId tell ARM to create the account and the app first, wherever the block sits in the file',
        'A compile error: storage and api are used before they are declared',
        'The role assignment is attempted first and fails because the principal does not exist yet',
        'It deploys only if you add dependsOn: [storage, api] to the moved block',
      ],
      answer: 'Same result as before: the references to storage.id and api.identity.principalId tell ARM to create the account and the app first, wherever the block sits in the file',
      explanation: 'A Bicep file is a set of declarations, not a script. The compiler resolves symbolic names across the whole file, and every property reference becomes an implicit dependency in the compiled JSON, so ARM orders the work from the references. dependsOn exists for the rare dependency that no property expresses; writing it where a reference already exists is noise.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the parts of main.bicep that are new in this module: the declaration keyword, the location default, the identity block, and the two role-assignment expressions.',
      language: 'text',
      template: "param location string = {{loc}}\nparam yourName string\n\nvar apiName = 'cyberling-api-${yourName}'\nvar tableDataContributor = '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3' // Storage Table Data Contributor\n\n{{kw}} api 'Microsoft.Web/sites@2023-12-01' = {\n  name: apiName\n  location: location\n  kind: 'app,linux'\n  identity: {\n    type: '{{identity}}'\n  }\n  properties: {\n    serverFarmId: plan.id\n    httpsOnly: true\n  }\n}\n\nresource tableAccess 'Microsoft.Authorization/roleAssignments@2022-04-01' = {\n  name: {{guidfn}}(storage.id, api.id, tableDataContributor)\n  scope: storage\n  properties: {\n    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', {{roleVar}})\n    principalId: api.identity.principalId\n    principalType: 'ServicePrincipal'\n  }\n}",
      blanks: [
        { id: 'loc', answers: ['resourceGroup().location'], hint: 'A function call: the location of the group you deploy into.' },
        { id: 'kw', answers: ['resource'], hint: 'The keyword that declares something Azure should make exist.' },
        { id: 'identity', answers: ['SystemAssigned'], hint: 'The identity type Azure creates and rotates for this one app (one word, capital S and A).' },
        { id: 'guidfn', answers: ['guid'], hint: 'The function that turns stable inputs into a deterministic GUID for the assignment\'s name.' },
        { id: 'roleVar', answers: ['tableDataContributor'], hint: 'The var holding the role definition GUID, declared near the top.' },
      ],
      explanation: 'resourceGroup().location keeps every resource beside its group. resource declares; SystemAssigned asks for the identity in the same request. guid() makes the assignment name stable across deploys, and subscriptionResourceId() turns the role\'s fixed GUID into the full definition id the API expects.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the storage part of the template in conventional order and with correct nesting. Indentation is part of the answer: two spaces per level.',
      language: 'text',
      indentation: true,
      solution: [
        'param location string = resourceGroup().location',
        'param yourName string',
        "var storageName = 'cyberlingstore${yourName}'",
        "resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {",
        '  name: storageName',
        '  location: location',
        '  sku: {',
        "    name: 'Standard_LRS'",
        '  }',
        "  kind: 'StorageV2'",
        '}',
        "resource ledgerTable 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = {",
        '  parent: tableService',
        "  name: 'LedgerEntries'",
        '}',
        'output storageId string = storage.id',
      ],
      distractors: [
        "resource storage 'Microsoft.Storage/storageAccounts' = {",
        "  location: 'westeurope'",
        "  name: 'cyberlingstore${yourName}/default/LedgerEntries'",
        'output storageId = storage.id',
      ],
      explanation: 'Params, vars, resources, outputs is the order reviewers expect, though the compiler accepts any. A type without @apiVersion does not compile. A hard-coded location breaks the "deploy anywhere" promise the param exists for. With parent: you give only the child\'s own name; the slash-separated full name is the compiler\'s job. And an output needs its type.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Write the whole main.bicep and have Azure validate it, without deploying.',
      warning: 'az bicep build runs locally and az deployment group validate only asks ARM to check the template against your subscription; neither creates, changes or bills anything. Cost of this lesson: zero. Deploying is the next lesson.',
      checklist: [
        'Replace `infra/main.bicep` with the full template from the concept step. Keep the resource names exactly as in Modules 2 to 6 so the deployment adopts your existing resources.',
        'Run `az bicep build --file infra/main.bicep`. Fix any error it reports; the message names the line.',
        'Open the compiled `main.json`: your three `param` declarations are under one top-level key, the eight resources under another, and note how `guid(...)` and `subscriptionResourceId(...)` survived as ARM functions in strings.',
        'Confirm the group still exists: `az group show --name cyberling-rg --query properties.provisioningState -o tsv`. If you deleted it after Module 6, create it again with `az group create --name cyberling-rg --location westeurope` (or your region); the template will create everything into it.',
        'Run `az deployment group validate --resource-group cyberling-rg --template-file infra/main.bicep --parameters yourName=<yourname>`. A valid template prints a JSON document describing the deployment; an invalid one prints an error block naming the resource and the property.',
        'Deliberately break it once: change `principalType` to `\'ServicePrincipals\'`, validate again, read the error, then fix it. Learning what the errors look like now saves a failed deploy later.',
        'No teardown is needed: nothing was created. Keep the file for Lesson 7-3.',
      ],
      verify: { question: 'In the compiled main.json, your param declarations sit under one top-level key. Type that key exactly as it appears.', answers: ['parameters'] },
    },
  ],
};

const l73: Lesson = {
  id: 'az-7-3',
  title: 'Deploy, what-if, update',
  objective: 'Preview a deployment with what-if, run it, read its provisioningState and outputs, and explain what complete mode would delete.',
  minutes: 35,
  lexicon: [
    { id: 'az.7.whatif', term: 'az deployment group what-if', kind: 'pattern', meaning: 'A dry run: ARM compares the template with the resource group and lists what it would Create (+), Modify (~), Delete (-) or leave unchanged (=), touching nothing.', example: 'az deployment group what-if --resource-group cyberling-rg --template-file main.bicep --parameters yourName=sam', analogy: 'A CloudFormation change set, without the two-step dance: what-if is a read-only command, not a saved object you later execute.' },
    { id: 'az.7.deployment-create', term: 'az deployment group create', kind: 'pattern', meaning: 'Deploy a template into a resource group. --template-file takes .bicep or .json; --parameters takes key=value pairs or a .bicepparam file. The deployment is named after the template file unless --name says otherwise.', example: 'az deployment group create --resource-group cyberling-rg --template-file main.bicep --parameters yourName=sam' },
    { id: 'az.7.mode', term: '--mode Incremental | Complete', kind: 'concept', meaning: 'Incremental (default): resources in the group that the template does not mention are left alone. Complete: they are deleted, so the group ends up containing exactly the template. Resource-group deployments only.', example: 'az deployment group create --mode Complete --resource-group cyberling-rg --template-file main.bicep --parameters yourName=sam', analogy: 'Complete mode is the CloudFormation default: a stack always deletes what you removed from the template. Incremental has no AWS twin and is the Azure default, which surprises people coming from stacks.' },
    { id: 'az.7.provisioningstate', term: 'provisioningState', kind: 'concept', meaning: 'The lifecycle field every ARM resource and deployment carries: Accepted, Running, Succeeded, Failed, Canceled. For a deployment, Succeeded means every resource reached its declared state.', example: 'az deployment group show --resource-group cyberling-rg --name main --query properties.provisioningState -o tsv' },
    { id: 'az.7.outputs', term: 'properties.outputs.<name>.value', kind: 'pattern', meaning: 'Where a finished deployment keeps its output values; read them with az deployment group show and a JMESPath query instead of hunting through the portal.', example: 'az deployment group show --resource-group cyberling-rg --name main --query properties.outputs.apiUrl.value -o tsv' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Look before you deploy',
      body: `A template is a request for change, and \`what-if\` shows you the change before it happens. ARM evaluates the template against the actual resource group and prints one line per resource with a symbol: \`+\` Create, \`~\` Modify (with the property-level diff beneath), \`-\` Delete, \`=\` NoChange, \`*\` Ignore (not evaluated). Deploying into your Module 6 group, expect mostly \`=\` and a few \`~\` where a hand-set property differs from the declaration, plus \`+\` for the role assignment, whose deterministic name is new.

Then \`create\`. The CLI compiles the Bicep, uploads the JSON, and ARM works through the resources in dependency order, in parallel where it can. The deployment gets a **name** (the template file name, \`main\`, unless you pass \`--name\`) and a record in the group's deployment history. When it finishes, \`az deployment group show\` returns its **provisioningState** and its **outputs**.

Updates are the same command. Change the template, what-if, create. ARM applies only the difference.`,
      example: {
        language: 'shell',
        source: 'az deployment group what-if --resource-group cyberling-rg --template-file infra/main.bicep --parameters yourName=<yourname>\naz deployment group create --resource-group cyberling-rg --template-file infra/main.bicep --parameters yourName=<yourname>\naz deployment group show --resource-group cyberling-rg --name main --query properties.provisioningState -o tsv\naz deployment group show --resource-group cyberling-rg --name main --query properties.outputs.apiUrl.value -o tsv\naz deployment group list --resource-group cyberling-rg --query "[].{name:name, state:properties.provisioningState, when:properties.timestamp}" -o table',
        labels: [
          { lines: [1, 1], label: 'The dry run: read every + ~ - before anything is touched.' },
          { lines: [2, 2], label: 'The deployment itself; the CLI compiles the Bicep and waits for ARM to finish.' },
          { lines: [3, 3], label: 'Did it work? Succeeded, or Failed with the error in properties.error.' },
          { lines: [4, 4], label: 'Read an output by name instead of looking the hostname up.' },
          { lines: [5, 5], label: 'The group remembers every deployment; this is your audit trail.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'sam deploy creates a change set, shows it, asks y, executes it, and streams stack events until CREATE_COMPLETE. Here that is two commands: what-if (read-only, nothing saved) and create (which waits by default and prints the result). StackStatus CREATE_COMPLETE ≈ deployment provisioningState Succeeded.' }],
    },
    {
      kind: 'concept',
      title: 'Incremental or complete: what happens to what you did not mention',
      body: `By default a deployment is **incremental**: ARM creates and updates what the template declares and ignores everything else in the group. Delete a \`resource\` block from \`main.bicep\`, redeploy, and the resource in Azure is still there, now unmanaged. That is safe, and it is also how drift accumulates.

\`--mode Complete\` makes the template the whole truth: after the deployment the group contains exactly the declared resources, and **everything else is deleted**, data included. Run it against a group with a hand-made scratch storage account and the account is gone, no prompt. Always what-if a complete deployment first; the \`-\` lines are the point.

Two honest caveats. What-if can show **noise**: a \`~\` on a property the provider stores differently from how you wrote it, which the deployment then changes to nothing. And a deployment that **fails** half way leaves the resources it already created; ARM does not roll back by default. Read \`properties.error\`, fix the template, deploy again: idempotency means the second run picks up where the first stopped.`,
      example: {
        language: 'shell',
        source: 'az deployment group what-if --mode Complete --resource-group cyberling-rg --template-file infra/main.bicep --parameters yourName=<yourname>\naz deployment group create --mode Complete --resource-group cyberling-rg --template-file infra/main.bicep --parameters yourName=<yourname>\naz deployment group show --resource-group cyberling-rg --name main --query properties.error',
        labels: [
          { lines: [1, 1], label: 'In complete mode the dry run lists, with a -, every resource the template does not mention.' },
          { lines: [2, 2], label: 'Only after reading those lines. The deletions happen without further confirmation.' },
          { lines: [3, 3], label: 'When provisioningState is Failed, the reason lives here.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'A CloudFormation stack behaves like complete mode by default (remove a resource from the template and the update deletes it) and rolls back a failed create to the previous state. ARM\'s default is incremental and no rollback: fewer surprises on deletion, more responsibility for cleaning up after a failure.' }],
    },
    {
      kind: 'predict',
      prompt: 'cyberling-rg contains everything main.bicep declares, plus a storage account scratchstore<yourname> you created by hand last week. You delete the insights resource block from main.bicep and run the two deployments below, one after the other. Which resources are gone at the end?',
      code: { language: 'shell', source: '# insights block removed from main.bicep\naz deployment group create --resource-group cyberling-rg --template-file infra/main.bicep --parameters yourName=<yourname>\naz deployment group create --mode Complete --resource-group cyberling-rg --template-file infra/main.bicep --parameters yourName=<yourname>' },
      choices: [
        'After the first command nothing is deleted; after the second, both cyberling-ai and scratchstore are gone: complete mode removes everything the template does not mention',
        'The first command deletes cyberling-ai because it was removed from the template; the second then deletes scratchstore as well',
        'Nothing is deleted by either command: only az group delete removes resources',
        'The second command deletes the whole group and recreates the declared resources empty, so the LedgerEntries data is lost too',
      ],
      answer: 'After the first command nothing is deleted; after the second, both cyberling-ai and scratchstore are gone: complete mode removes everything the template does not mention',
      explanation: 'Incremental mode never deletes: removing a block only stops managing the resource. Complete mode compares the group with the template and deletes every top-level resource not declared, however it got there: the Application Insights component you dropped and the scratch account alike. The declared resources are updated in place, not recreated, so the storage account and its LedgerEntries table keep their data.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the steps of one safe deployment cycle for LedgerSharp.',
      language: 'text',
      indentation: false,
      solution: [
        'Edit main.bicep and run az bicep build to catch syntax errors locally',
        'Run az deployment group what-if and read every + ~ - line',
        'Run az deployment group create with the same template and parameters',
        'Check provisioningState with az deployment group show; read properties.error if it is Failed',
        'Read the apiUrl output from the deployment',
        'Ship the code with az webapp up, then curl POST /entries and expect 201',
      ],
      distractors: [
        'Skip what-if: create is idempotent, so it cannot do any harm',
        'Use --mode Complete on the first deploy so the group matches the template exactly',
        'Run az deployment group delete to undo the deployment if the curl fails',
      ],
      explanation: 'Compile, preview, deploy, verify, read outputs, ship code. Idempotent does not mean harmless: a wrong property is applied faithfully. Complete mode against a group with hand-made resources deletes them, which is exactly what what-if would have shown. And az deployment group delete removes only the history record; the resources stay (Lesson 7-4 proves it).',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the deployment cycle: the dry run, the deployment, and the two fields you read afterwards.',
      language: 'shell',
      template: 'az deployment group {{whatif}} --resource-group cyberling-rg --template-file infra/main.bicep --parameters yourName=<yourname>\naz deployment group {{create}} --resource-group cyberling-rg --template-file infra/main.bicep --parameters yourName=<yourname>\naz deployment group show --resource-group cyberling-rg --name {{name}} --query properties.{{state}} -o tsv\naz deployment group show --resource-group cyberling-rg --name main --query properties.outputs.apiUrl.value -o tsv',
      blanks: [
        { id: 'whatif', answers: ['what-if'], hint: 'The read-only preview subcommand, with a hyphen.' },
        { id: 'create', answers: ['create'], hint: 'The subcommand that actually deploys.' },
        { id: 'name', answers: ['main'], hint: 'The default deployment name: the template file name without its extension.' },
        { id: 'state', answers: ['provisioningState'], hint: 'The lifecycle field whose value should read Succeeded.' },
      ],
      explanation: 'what-if then create, always in that order. The deployment is named after main.bicep unless you pass --name, and provisioningState is the same field every ARM resource reports.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Deploy LedgerSharp from the template into cyberling-rg and prove it with the deployment\'s provisioningState.',
      warning: 'Deployments and what-if are free. The template declares the same F1 plan (free), the same Standard_LRS account (pennies), the same free-allowance Application Insights and a Log Analytics workspace on the PerGB2018 plan (first 5 GB a month free, 30-day retention free), so this lesson adds nothing to your bill. Do not change F1 to a paid SKU in the template. Do not use --mode Complete in this lesson: anything left in the group from Modules 2 to 6 that the template does not name would be deleted.',
      checklist: [
        'Confirm the group: `az group show --name cyberling-rg`. If you recreated it empty in Lesson 7-2, that is fine: the template creates everything.',
        'If your Module 6 hand-made role assignment still exists, remove it first: `az role assignment delete --assignee <principalId> --role "Storage Table Data Contributor" --scope <storage account id>`. A role assignment is identified by its GUID name, and two names for the same principal, role and scope are refused with RoleAssignmentExists; the template will recreate it under its own stable GUID.',
        'Run `az deployment group what-if --resource-group cyberling-rg --template-file infra/main.bicep --parameters yourName=<yourname>`. Read the legend and every line: `=` and `~` for adopted resources, `+` for the role assignment (and for everything, if the group was empty).',
        'Run `az deployment group create --resource-group cyberling-rg --template-file infra/main.bicep --parameters yourName=<yourname>`. It waits; a first deploy into an empty group takes a few minutes.',
        'Run `az deployment group show --resource-group cyberling-rg --name main --query properties.provisioningState -o tsv`. If it prints Failed, run the same command with `--query properties.error`, fix the template, deploy again.',
        'Read the URL: `az deployment group show --resource-group cyberling-rg --name main --query properties.outputs.apiUrl.value -o tsv`.',
        'The template deployed configuration, not code, and it replaced the app settings list. Ship the code from the project folder: `az webapp up --name cyberling-api-<yourname> --resource-group cyberling-rg --plan cyberling-plan --runtime "DOTNETCORE:8.0" --sku F1 --os-type Linux`.',
        'Run `curl -i -X POST -H "Content-Type: application/json" -d \'{"amount": -40, "note": "coffee"}\' <apiUrl>/entries` and expect 201 (allow a few minutes of 500s if the role assignment was just created). Then `curl <apiUrl>/balance`.',
        'Deploy again with no changes and watch what-if print only `=` lines; then run create once more and confirm it still says Succeeded.',
        'Teardown: leave everything running for Lesson 7-4, which deletes the group. If you stop here instead, run `az group delete --name cyberling-rg --yes` now.',
      ],
      verify: { question: 'az deployment group show printed the deployment\'s provisioningState. Type its value exactly.', answers: ['Succeeded'] },
    },
  ],
};

const l74: Lesson = {
  id: 'az-7-4',
  title: 'Ship, then clean up',
  objective: 'Describe a GitHub Actions deployment with OIDC and per-environment parameters, review the bill, and delete cyberling-rg for good.',
  minutes: 30,
  lexicon: [
    { id: 'az.7.oidc-login', term: 'azure/login with OIDC', kind: 'pattern', meaning: 'A GitHub Actions step that signs in as an Entra ID app registration using a federated credential: GitHub presents a short-lived identity token, Entra trusts the repository and branch (or environment) named in the credential, and no client secret is stored anywhere.', example: '- uses: azure/login@v2\n  with:\n    client-id: ${{ secrets.AZURE_CLIENT_ID }}\n    tenant-id: ${{ secrets.AZURE_TENANT_ID }}\n    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}', analogy: 'aws-actions/configure-aws-credentials with role-to-assume: the same OIDC trust, with an app registration and federated credential in place of an IAM role and trust policy.' },
    { id: 'az.7.bicepparam', term: '.bicepparam', kind: 'pattern', meaning: 'A parameters file for one environment: a using line naming the template, then param assignments. One template, one file per environment (dev, prod), no copy-pasted templates.', example: "using './main.bicep'\nparam yourName = 'sam'\nparam ledgerOwner = 'sam'", analogy: 'samconfig.toml holds the answers for sam deploy. The analogy breaks on scope: a .bicepparam holds only template parameters, not CLI settings such as the resource group.' },
    { id: 'az.7.cost-analysis', term: 'Cost analysis', kind: 'concept', meaning: 'The Cost Management view that breaks the bill down by resource group, resource or service over a date range. The place to confirm what a project really cost before you delete it.', example: 'Portal: Cost Management > Cost analysis > Group by: Resource group' },
    { id: 'az.7.group-delete', term: 'az group delete --yes --no-wait', kind: 'pattern', meaning: 'Delete a resource group and everything in it without a prompt, returning immediately while Azure works. The universal cleanup; poll az group exists until it prints false.', example: 'az group delete --name cyberling-rg --yes --no-wait\naz group exists --name cyberling-rg' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'From your laptop to a workflow, and what it cost',
      body: `**CI/CD.** You deployed from your laptop as yourself. A GitHub Actions workflow does the same two things on every push to \`main\`: \`az deployment group create\` for the infrastructure, then a zip deploy of the published app. It signs in with **\`azure/login\`** using **OIDC**: you register an application in Entra ID, give it Contributor on \`cyberling-rg\` (and a role that may assign roles, since the template creates one), and add a **federated credential** that trusts tokens from \`repo:<you>/<repo>:environment:production\`. GitHub mints that token per run; no password or client secret is stored anywhere. The pull request that changes \`main.bicep\` is the review step, and \`what-if\` in the PR job is the reviewer's diff.

**Environments.** One template, one **\`.bicepparam\`** file per environment: \`dev.bicepparam\` and \`prod.bicepparam\` differ only in parameter values and perhaps the resource group they target. A GitHub **environment** named \`production\` can require an approval before the job runs, and the federated credential can be scoped to it, so only approved runs can touch the real group.

**Cost review.** Before deleting, look at **Cost analysis** grouped by resource group: for \`cyberling-rg\` you should see cents (storage transactions, a few GB-hours of logs) and nothing else. If a number surprises you, click into it; that is how an idle B1 plan or a forgotten Cosmos account gets found. Your Module 1 budget stays.`,
      example: {
        language: 'text',
        source: 'name: deploy\non:\n  push:\n    branches: [main]\npermissions:\n  id-token: write\n  contents: read\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    environment: production\n    steps:\n      - uses: actions/checkout@v4\n      - uses: azure/login@v2\n        with:\n          client-id: ${{ secrets.AZURE_CLIENT_ID }}\n          tenant-id: ${{ secrets.AZURE_TENANT_ID }}\n          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}\n      - run: az deployment group create --resource-group cyberling-rg --parameters infra/prod.bicepparam\n      - run: dotnet publish LedgerSharp.Api -c Release -o out && cd out && zip -r ../app.zip .\n      - run: az webapp deploy --resource-group cyberling-rg --name cyberling-api-${{ vars.YOUR_NAME }} --src-path app.zip --type zip',
        labels: [
          { lines: [5, 7], label: 'Let the job request an OIDC token; without id-token: write the login cannot federate.' },
          { lines: [11, 11], label: 'Bind the job to the production environment: approvals, and the federated credential\'s subject.' },
          { lines: [14, 18], label: 'Sign in as the app registration with ids only; there is no secret to leak.' },
          { lines: [19, 19], label: 'Infrastructure: the .bicepparam names the template in its using line, so --template-file is not needed.' },
          { lines: [20, 21], label: 'Code: publish, zip, deploy to the web app the template just ensured exists.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'The Ledger pipeline ran sam build && sam deploy after assuming an IAM role through OIDC; here it is azure/login against an app registration with a federated credential, then az deployment group create plus a separate code deploy, because Bicep does not package code the way SAM does. samconfig.toml ≈ .bicepparam; AWS Budgets and Cost Explorer ≈ Cost Management budgets and Cost analysis.' }],
    },
    {
      kind: 'concept',
      title: 'Two clouds, one API, side by side',
      body: `You have now built the same service twice. On AWS the Ledger API was a **Lambda** function behind an **HTTP API**, writing to a **DynamoDB** table with an **execution role** whose policy named one table ARN, logging to **CloudWatch**, declared in a **SAM template** and deployed with \`sam deploy\` into a **stack**. On Azure LedgerSharp is a **web app** on an **App Service plan**, writing to **Table Storage** with a **managed identity** granted a built-in role at the storage account's scope, reporting to **Application Insights**, declared in **Bicep** and deployed into a **resource group**.

The ideas rhyme. Identity instead of keys, on both. Least privilege, on both: a policy document on AWS, a role at a scope on Azure. Telemetry you query, on both: Logs Insights there, KQL here. A file that recreates everything, on both.

The differences are real and worth remembering. Azure's **containment** (resource group) is explicit and makes cleanup one command; AWS leans on the stack for the same job. Azure's **compute default** in this track was a process that is always running on a free plan; AWS's was a function billed per invocation. Azure separates **control plane and data plane** roles sharply (Owner cannot read a row); AWS folds both into IAM actions. And ARM's **incremental** default means deleting a line does not delete a resource, where a stack would. Neither is better; knowing which one you are standing in is the skill.`,
      example: {
        language: 'text',
        source: 'Concern         AWS (Ledger)                          Azure (LedgerSharp)\nCompute         Lambda, per invocation                 App Service web app, F1 plan\nHTTP            API Gateway HTTP API routes            Kestrel routes behind App Service\nData            DynamoDB table (owner, ts)             Table Storage (PartitionKey, RowKey)\nIdentity        Execution role + inline policy         System-assigned identity + role at scope\nTelemetry       CloudWatch Logs, Logs Insights         Application Insights, KQL\nTemplate        SAM template.yaml, Transform           main.bicep compiled to ARM JSON\nPreview         Change set                             what-if\nUnit            Stack (owns resources)                 Resource group (contains resources)\nDelete          sam delete                             az group delete',
        labels: [
          { lines: [2, 4], label: 'The runtime pieces: a function versus a process, a managed API versus your own routes, two key-value stores.' },
          { lines: [5, 6], label: 'Security and observability: the same ideas with different vocabulary.' },
          { lines: [7, 10], label: 'Infrastructure as code: how you describe, preview, group and delete.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'When you read Azure documentation, translate: stack → resource group plus deployment, change set → what-if, DeletionPolicy Retain → there is no twin (move the resource to another group or use a lock), CloudFormation drift detection → compare what-if output against the template.' }],
    },
    {
      kind: 'predict',
      prompt: 'Hoping to undo Lesson 7-3, you delete the deployment record and then list the group. What does the second command print?',
      code: { language: 'shell', source: 'az deployment group delete --resource-group cyberling-rg --name main\naz resource list --resource-group cyberling-rg --query "[].name" -o tsv' },
      choices: [
        'All the resources, unchanged: a deployment is a record of an operation, and deleting the record touches nothing in the group',
        'Nothing: deleting the deployment deletes the resources it created',
        'Only the storage account, because it holds data and ARM protects it',
        'An error: a deployment cannot be deleted while its resources exist',
      ],
      answer: 'All the resources, unchanged: a deployment is a record of an operation, and deleting the record touches nothing in the group',
      explanation: 'This is the false friend from Lesson 7-1. A CloudFormation stack owns its resources, so deleting the stack deletes them. An ARM deployment is history: the template, the parameters, the outcome. The resource group is what contains the resources, and az group delete is what removes them. Deleting deployment records is housekeeping (a group keeps at most 800), nothing more.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the end-of-track checks and teardown.',
      language: 'text',
      indentation: false,
      solution: [
        'Commit infra/main.bicep (and the workflow, if you wrote it) to the repository',
        'Open Cost analysis grouped by resource group and read what cyberling-rg cost',
        'Run az group delete --name cyberling-rg --yes --no-wait',
        'Poll az group exists --name cyberling-rg until it prints false',
        'Run az group list -o table and confirm no cyberling group remains',
        'Confirm the Module 1 budget still exists in Cost Management',
      ],
      distractors: [
        'Run az deployment group delete --name main to remove the resources',
        'Delete each resource one by one before the group so nothing is missed',
        'Delete the budget: with the group gone there is nothing left to watch',
      ],
      explanation: 'The template is the project; commit it before you delete what it describes. The group delete removes every resource inside, so deleting them one by one is wasted effort, and deleting the deployment record removes nothing. The budget guards the subscription, not this group; it is the one thing from this track you keep.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Milestone: LedgerSharp v1.0 exists as one file. Review the cost, delete the resource group, and prove it is gone.',
      warning: 'Deleting is free, and after it nothing from this track bills: the F1 plan, the storage account, the web app, Application Insights and the role assignment all go with the group. One thing lingers harmlessly: a deleted Log Analytics workspace is soft-deleted for 14 days (not billed) and its name cyberling-logs is reserved until then. Your Module 1 budget stays. If you set up the GitHub workflow, disable it or delete the app registration\'s federated credential, or a push will recreate the group: that is the template doing its job.',
      checklist: [
        'Commit `infra/main.bicep` to your LedgerSharp repository. Optional: add `infra/prod.bicepparam` with `using \'./main.bicep\'` and your two param values, and run `az deployment group what-if --resource-group cyberling-rg --parameters infra/prod.bicepparam` to see it resolve.',
        'Optional (free, no secrets involved): read the GitHub Actions example above and note the three ids you would store: client, tenant, subscription. Do not create the app registration unless you intend to use the pipeline; if you do, give it Contributor on cyberling-rg only.',
        'Open Cost Management > Cost analysis, set the range to the weeks of this track and group by resource group. Note what cyberling-rg cost (expect cents).',
        'Run `az resource list --resource-group cyberling-rg -o table` one last time and read the list: this is exactly what main.bicep describes, and exactly what is about to go.',
        'Run `az group delete --name cyberling-rg --yes --no-wait`. It returns at once; Azure deletes in the background for a few minutes.',
        'Run `az group exists --name cyberling-rg` every minute or so. It prints true while the group is in the Deleting state, then false.',
        'Run `az group list -o table` and confirm nothing named cyberling remains. If you created a scratch group in any module, delete it the same way.',
        'Confirm the Module 1 budget alert still exists in Cost Management > Budgets; keep it.',
        'Keep the file. `az group create --name cyberling-rg --location westeurope` followed by `az deployment group create --resource-group cyberling-rg --template-file infra/main.bicep --parameters yourName=<yourname>` brings LedgerSharp back in minutes; that is what this module was for.',
      ],
      verify: { question: 'Once the deletion finished, what did az group exists --name cyberling-rg print? Type it exactly.', answers: ['false'] },
    },
  ],
};

export const m7: Module = {
  id: 'az-m7',
  title: 'Infrastructure as code',
  goal: 'Azure Resource Manager and Bicep: param, var, resource, output and modules; the whole project as main.bicep; what-if, deployment, incremental versus complete mode and provisioningState; CI/CD with OIDC, environments, cost review and the final az group delete.',
  projectMilestone: 'LedgerSharp v1.0 on Azure: one deploy, one delete.',
  status: 'available',
  lessons: [l71, l72, l73, l74],
};
