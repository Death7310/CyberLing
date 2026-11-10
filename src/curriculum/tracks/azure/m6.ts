import type { Lesson, Module } from '../../schema';

/**
 * Module 6: Observe and secure.
 * Application Insights for telemetry, a managed identity with RBAC instead of a connection string,
 * Key Vault for the secrets you still need, alerts and the teardown habit.
 */

const l61: Lesson = {
  id: 'az-6-1',
  title: 'Application Insights: see what the API is doing',
  objective: 'Wire Application Insights into LedgerSharp and query its requests with KQL.',
  minutes: 30,
  lexicon: [
    { id: 'az.6.appinsights', term: 'Application Insights', kind: 'service', meaning: 'Application performance monitoring: collects requests, dependencies, exceptions and traces from your app and stores them in a Log Analytics workspace.', example: 'az monitor app-insights component create --app cyberling-ai --resource-group cyberling-rg --location westeurope --workspace cyberling-logs', analogy: 'CloudWatch Logs + X-Ray in one resource. The analogy breaks on query language: KQL, not Logs Insights syntax.' },
    { id: 'az.6.connectionstring', term: 'APPLICATIONINSIGHTS_CONNECTION_STRING', kind: 'pattern', meaning: 'The app setting the SDK reads to know where to send telemetry. It identifies the resource and its ingestion endpoint; it is not a secret in the Key Vault sense, but it belongs in app settings, not source.', example: 'az webapp config appsettings set --name cyberling-api-<yourname> --resource-group cyberling-rg --settings APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=...;IngestionEndpoint=..."' },
    { id: 'az.6.kql', term: 'KQL (Kusto Query Language)', kind: 'concept', meaning: 'The pipe-based query language of Log Analytics: start from a table, then filter, summarize and sort with | operators.', example: 'requests | where resultCode == "500" | count', analogy: 'Like a Unix pipeline: each | hands rows to the next operator. Unlike SQL, the table comes first and the order of clauses is the order of execution.' },
    { id: 'az.6.livemetrics', term: 'Live Metrics', kind: 'concept', meaning: 'A real-time view (about one second of latency) of incoming requests, failures and dependency calls, streamed from the SDK without waiting for ingestion.', example: 'Portal: Application Insights resource > Investigate > Live metrics' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'One resource, one connection string, one line of C#',
      body: `So far you have found out that LedgerSharp is broken by calling it with \`curl\`. **Application Insights** makes the app report on itself: every incoming request (path, duration, status code), every **dependency** call (your Table Storage queries), every unhandled **exception**, plus whatever you log through \`ILogger\`.

Modern Application Insights is **workspace-based**: the component stores its data in a **Log Analytics workspace**, so you create the workspace first and link the component to it. The component has a **connection string**; the ASP.NET SDK reads it from the app setting \`APPLICATIONINSIGHTS_CONNECTION_STRING\` and one call in \`Program.cs\` turns collection on.

Data lands in tables (\`requests\`, \`dependencies\`, \`exceptions\`, \`traces\`) that you query with **KQL**: a table name, then a pipeline of operators. Ingestion takes a few minutes; **Live Metrics** shows traffic the moment it happens.`,
      example: {
        language: 'csharp',
        source: 'using Azure.Data.Tables;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddApplicationInsightsTelemetry();\nbuilder.Services.AddSingleton(new TableServiceClient(builder.Configuration["STORAGE_CONNECTION"]));\n\nvar app = builder.Build();\n\napp.MapGet("/balance", async (TableServiceClient tables, ILogger<Program> log) =>\n{\n    log.LogInformation("Summing balance");\n    var table = tables.GetTableClient("LedgerEntries");\n    decimal total = 0;\n    await foreach (var e in table.QueryAsync<TableEntity>(x => x.PartitionKey == "me"))\n        total += (decimal)(double)e["Amount"];\n    return Results.Ok(new { balance = total });\n});\n\napp.Run();',
        labels: [
          { lines: [4, 4], label: 'Turn on request, dependency and exception collection; the SDK finds the connection string in configuration.' },
          { lines: [5, 5], label: 'The Module 5 wiring, unchanged for now (Lesson 2 replaces the connection string).' },
          { lines: [11, 11], label: 'Anything you log through ILogger lands in the traces table.' },
          { lines: [12, 15], label: 'Each Table Storage query is recorded as a dependency with its duration.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'CloudWatch Logs ≈ Log Analytics workspace; Logs Insights queries ≈ KQL; X-Ray traces ≈ Application Insights dependencies and the application map. A Lambda logs to CloudWatch with no setup; an App Service app sends nothing until you add the SDK (or enable the portal\'s codeless agent).' }],
    },
    {
      kind: 'concept',
      title: 'Creating it from the CLI and asking it questions',
      body: `The CLI commands below live in the \`application-insights\` extension; \`az\` offers to install it on first use. The component needs the **workspace**, the web app needs the **connection string** as an app setting, and after a redeploy the data starts arriving.

A KQL query starts with the table and pipes rows through operators: \`where\` filters, \`summarize\` aggregates, \`count\` is shorthand for counting rows, \`order by\` sorts. Column \`resultCode\` in \`requests\` is a **string**, so compare it with \`"500"\` in quotes.`,
      example: {
        language: 'shell',
        source: 'az monitor log-analytics workspace create --resource-group cyberling-rg --workspace-name cyberling-logs --location westeurope\naz monitor app-insights component create --app cyberling-ai --resource-group cyberling-rg --location westeurope --workspace cyberling-logs\naz monitor app-insights component show --app cyberling-ai --resource-group cyberling-rg --query connectionString -o tsv\naz webapp config appsettings set --name cyberling-api-<yourname> --resource-group cyberling-rg --settings APPLICATIONINSIGHTS_CONNECTION_STRING="<paste the value>"\naz monitor app-insights query --app cyberling-ai --resource-group cyberling-rg --analytics-query \'requests | where resultCode == "500" | count\'',
        labels: [
          { lines: [1, 1], label: 'Create the workspace that will store the data (or reuse one).' },
          { lines: [2, 2], label: 'Create the workspace-based component in the same resource group.' },
          { lines: [3, 3], label: 'Read the connection string the SDK needs.' },
          { lines: [4, 4], label: 'Hand it to the web app as configuration, never in source.' },
          { lines: [5, 5], label: 'Count failed requests with a KQL pipeline (the portal\'s Logs blade runs the same query).' },
        ],
      },
      contrast: [{ from: 'aws', note: 'aws logs start-query ≈ az monitor app-insights query. In AWS the log group exists as soon as the Lambda runs; here you create the workspace and component deliberately, like most Azure resources.' }],
    },
    {
      kind: 'predict',
      prompt: 'LedgerSharp has the SDK enabled. A GET /balance request throws a NullReferenceException that nothing catches. A few minutes later, which KQL tables have a row for that request?',
      code: { language: 'csharp', source: 'app.MapGet("/balance", (TableServiceClient tables) =>\n{\n    string owner = null;\n    return Results.Ok(new { len = owner.Length }); // throws\n});' },
      choices: ['Only exceptions', 'Only requests, with resultCode "500"', 'Both: a requests row with resultCode "500" and an exceptions row linked to it by operation_Id', 'Neither: unhandled exceptions crash the process before anything is sent'],
      answer: 'Both: a requests row with resultCode "500" and an exceptions row linked to it by operation_Id',
      explanation: 'The SDK records every request, including the failed one, as a requests row (resultCode "500", success false). The unhandled exception becomes an exceptions row sharing the same operation_Id, so you can join the two. ASP.NET Core turns unhandled exceptions into a 500 response; the process keeps running.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the steps that take LedgerSharp from "no telemetry" to "a KQL query shows my requests".',
      language: 'text',
      indentation: false,
      solution: [
        'Create a Log Analytics workspace in cyberling-rg',
        'Create the Application Insights component linked to that workspace',
        'Read the connection string with --query connectionString',
        'Set APPLICATIONINSIGHTS_CONNECTION_STRING as an app setting on the web app',
        'Add the Microsoft.ApplicationInsights.AspNetCore package and call AddApplicationInsightsTelemetry() in Program.cs, then redeploy',
        'Send a few requests, wait a few minutes, then query the requests table',
      ],
      distractors: [
        'Paste the connection string into appsettings.json and commit it',
        'Create a classic (non-workspace) Application Insights component',
        'Query the requests table immediately after the first request',
      ],
      explanation: 'Workspace, component, connection string, configuration, code, traffic. Classic components are retired; configuration belongs in app settings, not in the repository; and ingestion lag means a query right after the first request returns nothing, which is not a bug.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the two KQL queries you will run against LedgerSharp.',
      language: 'text',
      template: '// 1. How many requests failed with a 500 in the last hour?\n{{table}}\n| where timestamp > ago(1h)\n| where {{field}} == "500"\n| {{agg}}\n\n// 2. Which Table Storage calls are slowest?\n{{deps}}\n| summarize avg(duration) by name\n| order by avg_duration desc',
      blanks: [
        { id: 'table', answers: ['requests'], hint: 'The table of incoming HTTP requests.' },
        { id: 'field', answers: ['resultCode'], hint: 'The column holding the HTTP status code, as a string.' },
        { id: 'agg', answers: ['count', 'count()', 'summarize count()'], hint: 'The shortest operator that returns the number of rows.' },
        { id: 'deps', answers: ['dependencies'], hint: 'Outbound calls your app made (storage, HTTP, SQL).' },
      ],
      explanation: 'Table first, then a pipeline. requests holds what came in; dependencies holds what your app called out to; exceptions and traces complete the set.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Turn on telemetry for LedgerSharp and ask it one question.',
      warning: 'Application Insights ingestion has a free allowance (the first 5 GB per month per workspace) and 31 days of retention are free; five requests generate kilobytes. The web app and storage from earlier modules keep costing what they already did (nothing on the F1 plan, pennies for storage). Soft-deleted workspaces are free.',
      checklist: [
        'Confirm the group exists: `az group show --name cyberling-rg` (create it with `az group create` if you deleted it after Module 5, then redeploy the Module 5 app).',
        'Create the workspace `cyberling-logs` and the component `cyberling-ai` in cyberling-rg, westeurope or the region nearest you.',
        'Read the connection string and set it as `APPLICATIONINSIGHTS_CONNECTION_STRING` on `cyberling-api-<yourname>`.',
        'In the LedgerSharp project run `dotnet add package Microsoft.ApplicationInsights.AspNetCore`, add `builder.Services.AddApplicationInsightsTelemetry();`, redeploy.',
        'Send 5 requests: `for i in 1 2 3 4 5; do curl -s https://cyberling-api-<yourname>.azurewebsites.net/balance; done`. Open Live Metrics in the portal while you do.',
        'Wait 2 to 5 minutes, then run `az monitor app-insights query --app cyberling-ai --resource-group cyberling-rg --analytics-query "requests | summarize count() by resultCode"`.',
        'Teardown (when you finish the module; Module 7 recreates these in Bicep): `az monitor app-insights component delete --app cyberling-ai --resource-group cyberling-rg` and `az monitor log-analytics workspace delete --resource-group cyberling-rg --workspace-name cyberling-logs --force true` (without --force the workspace is soft-deleted for 14 days and its name stays reserved).',
      ],
      verify: { question: 'Type the name of the KQL table your query read from to count the five requests.', answers: ['requests'] },
    },
  ],
};

const l62: Lesson = {
  id: 'az-6-2',
  title: 'Managed identity: the API without a connection string',
  objective: 'Replace the storage connection string with a managed identity and a scoped RBAC role.',
  minutes: 35,
  lexicon: [
    { id: 'az.6.managedidentity', term: 'managed identity', kind: 'service', meaning: 'An Entra ID identity that Azure creates and rotates for a resource (system-assigned) or that you create and attach (user-assigned). Your code never sees a password: the platform hands it tokens.', example: 'az webapp identity assign --name cyberling-api-<yourname> --resource-group cyberling-rg', analogy: 'A Lambda execution role: the service wears an identity instead of carrying keys. The analogy breaks on scope: an IAM policy names resources inside the document; an Azure role is assigned at a scope.' },
    { id: 'az.6.roleassignment', term: 'az role assignment create', kind: 'pattern', meaning: 'Grant a role (a named bundle of permissions) to a principal at a scope. Who, what, where.', example: 'az role assignment create --assignee-object-id <principalId> --assignee-principal-type ServicePrincipal --role "Storage Table Data Contributor" --scope <storage account id>' },
    { id: 'az.6.defaultazurecredential', term: 'DefaultAzureCredential', kind: 'builtin', meaning: 'An Azure.Identity credential that tries a chain of sources: environment variables, a managed identity, Visual Studio, the Azure CLI (az login). The same line of code works on your laptop and in App Service.', example: 'new TableServiceClient(new Uri("https://cyberlingstore<yourname>.table.core.windows.net"), new DefaultAzureCredential())' },
    { id: 'az.6.scope', term: 'scope', kind: 'concept', meaning: 'The resource id a role assignment applies to: a management group, a subscription, a resource group or one resource. Permissions inherit downward, so assign at the narrowest scope that works.', example: '--scope /subscriptions/<sub>/resourceGroups/cyberling-rg/providers/Microsoft.Storage/storageAccounts/cyberlingstore<yourname>' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Who, what, where: identity, role, scope',
      body: `The Module 5 app reads Table Storage with a **connection string**: an account key that grants everything on the whole storage account to anyone who copies it. Rotating it means redeploying. A **managed identity** removes the key. You tell App Service "give this web app an identity", Azure creates a service principal in Entra ID, and the app can ask the platform for tokens at runtime.

Permission is a separate step. **RBAC** is three things: a **principal** (the identity), a **role** (\`Storage Table Data Contributor\`: read, write, delete table entities and nothing else) and a **scope** (this one storage account). The assignment grants the role to the principal at the scope, and nothing wider.

Deny is the default: an identity with no assignments can do nothing. The commands below create the identity, capture the scope and make the assignment.`,
      example: {
        language: 'shell',
        source: 'az webapp identity assign --name cyberling-api-<yourname> --resource-group cyberling-rg --query principalId -o tsv\naz storage account show --name cyberlingstore<yourname> --resource-group cyberling-rg --query id -o tsv\naz role assignment create --assignee-object-id <principalId> --assignee-principal-type ServicePrincipal --role "Storage Table Data Contributor" --scope <storage account id>\naz role assignment list --scope <storage account id> -o table',
        labels: [
          { lines: [1, 1], label: 'Give the web app a system-assigned identity; print its principal (object) id.' },
          { lines: [2, 2], label: 'The scope: the full resource id of the one storage account.' },
          { lines: [3, 3], label: 'Who (the principal), what (the data role), where (that account).' },
          { lines: [4, 4], label: 'Check what the account now allows and to whom.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'Lambda execution role ≈ managed identity; the role\'s inline policy allowing dynamodb:PutItem/Query on one table ARN ≈ a built-in role assigned at the storage account scope. In AWS you write the permission JSON; in Azure you pick a built-in role and choose where it applies.' }],
    },
    {
      kind: 'concept',
      title: 'The code change: one credential, no secret',
      body: `The SDK change is small. Instead of a connection string, \`TableServiceClient\` takes the account's **table endpoint** and a credential. \`DefaultAzureCredential\` walks a chain: on App Service it finds the managed identity; on your laptop it finds the user you signed in with \`az login\`. Same code, no branches.

That also means **your own user** needs the data role to run the app locally: being Owner of the subscription lets you manage the account, not read its rows. Control plane and data plane are different doors.

The connection-string app setting is then deleted. The name of the storage account is not a secret, so it stays as a plain app setting \`STORAGE_ACCOUNT\`.`,
      example: {
        language: 'csharp',
        source: 'using Azure.Data.Tables;\nusing Azure.Identity;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddApplicationInsightsTelemetry();\n\nvar account = builder.Configuration["STORAGE_ACCOUNT"];\nvar endpoint = new Uri($"https://{account}.table.core.windows.net");\nbuilder.Services.AddSingleton(new TableServiceClient(endpoint, new DefaultAzureCredential()));\n\nvar app = builder.Build();\napp.MapGet("/balance", async (TableServiceClient tables) =>\n{\n    var table = tables.GetTableClient("LedgerEntries");\n    decimal total = 0;\n    await foreach (var e in table.QueryAsync<TableEntity>(x => x.PartitionKey == "me"))\n        total += (decimal)(double)e["Amount"];\n    return Results.Ok(new { balance = total });\n});\napp.Run();',
        labels: [
          { lines: [2, 2], label: 'Azure.Identity provides the credential types.' },
          { lines: [7, 8], label: 'Build the public table endpoint from a non-secret setting.' },
          { lines: [9, 9], label: 'Authenticate with whatever identity the environment provides: managed identity on Azure, az login locally.' },
          { lines: [12, 18], label: 'The data access code does not change at all.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'boto3 picks up the Lambda role automatically with no credential object at all. DefaultAzureCredential is the explicit version of that same credential chain; you must mention it once.' }],
    },
    {
      kind: 'predict',
      prompt: 'You run these three commands within ten seconds, then curl GET /balance at once and again three minutes later. What do you most likely see?',
      code: { language: 'shell', source: 'az role assignment create --assignee-object-id <principalId> --assignee-principal-type ServicePrincipal --role "Storage Table Data Contributor" --scope <storage account id>\naz webapp config appsettings delete --name cyberling-api-<yourname> --resource-group cyberling-rg --setting-names STORAGE_CONNECTION\naz webapp restart --name cyberling-api-<yourname> --resource-group cyberling-rg\ncurl -i https://cyberling-api-<yourname>.azurewebsites.net/balance' },
      choices: ['200 both times: the assignment is immediate', 'A 500 (the SDK surfaces a 403 Forbidden from storage) at first, then 200 once the assignment has propagated', '401 forever: a managed identity cannot read tables without a connection string', '404: deleting an app setting removes the route'],
      answer: 'A 500 (the SDK surfaces a 403 Forbidden from storage) at first, then 200 once the assignment has propagated',
      explanation: 'Role assignments propagate through Entra ID and the storage service; it can take up to a few minutes before the token the app presents is honoured. During that window storage answers 403 AuthorizationPermissionMismatch, the SDK throws, and ASP.NET returns 500. Wait, retry, and resist the urge to widen the scope: the assignment was correct, just not yet visible.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the steps to move LedgerSharp from an account key to a managed identity.',
      language: 'text',
      indentation: false,
      solution: [
        'Assign a system-assigned identity to the web app and note its principalId',
        'Capture the storage account resource id to use as the scope',
        'Create the role assignment: Storage Table Data Contributor for the principal at that scope',
        'Change the code to new TableServiceClient(endpoint, new DefaultAzureCredential()) and add the STORAGE_ACCOUNT app setting',
        'Redeploy, then delete the STORAGE_CONNECTION app setting',
        'Restart the web app and curl GET /balance until it returns 200',
      ],
      distractors: [
        'Assign the role at subscription scope so it definitely works',
        'Give the identity the Contributor role on the storage account',
        'Copy the identity\'s password into an app setting for the SDK',
      ],
      explanation: 'Subscription scope would let the app touch every table in every account you own. Contributor is a control-plane role: it can delete the storage account but not read one row. And a managed identity has no password you can copy: that is the whole point.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill in the CLI steps that replace the key with an identity.',
      language: 'shell',
      template: 'az webapp identity {{verb}} --name cyberling-api-<yourname> --resource-group cyberling-rg --query principalId -o tsv\n\naz role assignment create \\\n  --assignee-object-id <principalId> \\\n  --assignee-principal-type ServicePrincipal \\\n  --role "{{role}}" \\\n  --scope $(az storage account show --name cyberlingstore<yourname> --resource-group cyberling-rg --query {{idfield}} -o tsv)\n\naz webapp config appsettings set --name cyberling-api-<yourname> --resource-group cyberling-rg --settings STORAGE_ACCOUNT=cyberlingstore<yourname>\naz webapp config appsettings {{del}} --name cyberling-api-<yourname> --resource-group cyberling-rg --setting-names STORAGE_CONNECTION',
      blanks: [
        { id: 'verb', answers: ['assign'], hint: 'The subcommand that creates the system-assigned identity.' },
        { id: 'role', answers: ['Storage Table Data Contributor'], hint: 'The data-plane role for reading and writing table entities, exactly as Azure names it.' },
        { id: 'idfield', answers: ['id'], hint: 'The JSON field holding the full resource id (the scope).' },
        { id: 'del', answers: ['delete'], hint: 'Remove the setting entirely; do not set it to an empty string.' },
      ],
      explanation: 'Identity, role at a narrow scope, non-secret config in, secret config out. Everything the app needs is now granted, not carried.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Make LedgerSharp run with no connection string anywhere.',
      warning: 'Managed identities and role assignments are free. You are not creating any billable resource in this lesson; the web app (F1) and the storage account continue at their previous cost (nothing, and pennies). Expect a few minutes of 500s while the assignment propagates; that is normal, not a reason to widen the scope.',
      checklist: [
        'Run `az webapp identity assign --name cyberling-api-<yourname> --resource-group cyberling-rg --query principalId -o tsv` and copy the id.',
        'Create the role assignment for that principal with role "Storage Table Data Contributor" scoped to `cyberlingstore<yourname>` (use `--assignee-principal-type ServicePrincipal`).',
        'Also grant your own user the same role at the same scope so `dotnet run` works locally: `az role assignment create --assignee $(az ad signed-in-user show --query id -o tsv) --role "Storage Table Data Contributor" --scope <storage account id>`.',
        'Add the `Azure.Identity` package, switch to `new TableServiceClient(endpoint, new DefaultAzureCredential())`, set the `STORAGE_ACCOUNT` app setting, redeploy.',
        'Delete the `STORAGE_CONNECTION` app setting and restart the web app.',
        'Run `curl -i https://cyberling-api-<yourname>.azurewebsites.net/balance`; if you get 500, wait two minutes and retry. Then `curl -X POST .../entries -H "Content-Type: application/json" -d \'{"amount": -40}\'` and check /balance changed.',
        'Confirm with `az webapp config appsettings list --name cyberling-api-<yourname> --resource-group cyberling-rg -o table` that no setting contains "AccountKey=".',
        'Teardown (optional, nothing here costs money): `az role assignment delete --assignee <principalId> --scope <storage account id>` and `az webapp identity remove --name cyberling-api-<yourname> --resource-group cyberling-rg`. The final `az group delete` removes the identity with the web app anyway.',
      ],
      verify: { question: 'Once the role has propagated, what HTTP status code does GET /balance return with no connection string configured?', answers: ['200'] },
    },
  ],
};

const l63: Lesson = {
  id: 'az-6-3',
  title: 'Key Vault: for the secrets you still need',
  objective: 'Store a secret in Key Vault and let the web app read it through a Key Vault reference.',
  minutes: 30,
  lexicon: [
    { id: 'az.6.keyvault', term: 'Key Vault', kind: 'service', meaning: 'A managed store for secrets, keys and certificates with its own access control, audit log and soft-delete. Use it for credentials to systems that cannot use managed identity.', example: 'az keyvault create --name cyberling-kv-<yourname> --resource-group cyberling-rg --location westeurope --enable-rbac-authorization true', analogy: 'AWS Secrets Manager (and SSM Parameter Store\'s SecureString). The analogy breaks on pricing: Key Vault has no per-secret monthly fee, only per-operation charges.' },
    { id: 'az.6.kvreference', term: '@Microsoft.KeyVault(SecretUri=...)', kind: 'pattern', meaning: 'A Key Vault reference: an app setting whose value App Service resolves from the vault at startup using the web app\'s managed identity. The code reads a plain string.', example: 'RATES_API_KEY="@Microsoft.KeyVault(SecretUri=https://cyberling-kv-<yourname>.vault.azure.net/secrets/RatesApiKey/)"' },
    { id: 'az.6.dataplane', term: 'control plane vs data plane', kind: 'concept', meaning: 'Control plane: managing the resource (create, configure, delete) through Resource Manager. Data plane: using its contents (rows, blobs, secrets). Different roles guard each door; Owner and Contributor are control-plane only.', example: 'Contributor can delete a vault but cannot read one secret in it.' },
    { id: 'az.6.secretsuser', term: 'Key Vault Secrets User', kind: 'concept', meaning: 'The data-plane role that allows reading secret values and nothing else. Key Vault Secrets Officer additionally allows creating and deleting secrets.', example: 'az role assignment create --assignee-object-id <principalId> --assignee-principal-type ServicePrincipal --role "Key Vault Secrets User" --scope <vault id>' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'When identity is not enough: a vault and a reference',
      body: `Managed identity covers every Azure service. It does not cover a third-party API key, a SMTP password or a partner's certificate. Those still exist, and they must live somewhere that is not source code and not a plain app setting that anyone with Contributor on the group can read.

**Key Vault** is that somewhere. Create the vault in **RBAC mode**, so the same role model you just learned applies: being Owner of the vault does not let you read a secret; you need a **data-plane** role (\`Key Vault Secrets Officer\` to write, \`Key Vault Secrets User\` to read).

App Service then does the reading for you. An app setting whose value is a **Key Vault reference** is resolved at startup, using the web app's managed identity. \`Configuration["RATES_API_KEY"]\` returns the secret; the code never knows a vault exists. For LedgerSharp we store a placeholder key for a future exchange-rate API, to learn the mechanism.`,
      example: {
        language: 'shell',
        source: 'az keyvault create --name cyberling-kv-<yourname> --resource-group cyberling-rg --location westeurope --enable-rbac-authorization true\naz role assignment create --assignee $(az ad signed-in-user show --query id -o tsv) --role "Key Vault Secrets Officer" --scope $(az keyvault show --name cyberling-kv-<yourname> --query id -o tsv)\naz keyvault secret set --vault-name cyberling-kv-<yourname> --name RatesApiKey --value demo-key-123\naz role assignment create --assignee-object-id <principalId> --assignee-principal-type ServicePrincipal --role "Key Vault Secrets User" --scope $(az keyvault show --name cyberling-kv-<yourname> --query id -o tsv)\naz webapp config appsettings set --name cyberling-api-<yourname> --resource-group cyberling-rg --settings RATES_API_KEY="@Microsoft.KeyVault(SecretUri=https://cyberling-kv-<yourname>.vault.azure.net/secrets/RatesApiKey/)"',
        labels: [
          { lines: [1, 1], label: 'Create the vault with RBAC (not legacy access policies) deciding who can read secrets.' },
          { lines: [2, 2], label: 'Even the creator needs a data-plane role before writing a secret.' },
          { lines: [3, 3], label: 'Store the secret; the CLI never prints it again unless asked.' },
          { lines: [4, 4], label: 'Let the web app\'s identity read secrets, and only read.' },
          { lines: [5, 5], label: 'The reference: App Service swaps it for the value at startup. No version in the URI means "latest".' },
        ],
      },
      contrast: [{ from: 'aws', note: 'Secrets Manager secret ≈ Key Vault secret; the Lambda role\'s secretsmanager:GetSecretValue ≈ the Key Vault Secrets User role. A Lambda fetches the value with the SDK (or the Parameters and Secrets extension); App Service resolves the reference in configuration for you.' }],
    },
    {
      kind: 'predict',
      prompt: 'A teammate has the Contributor role on cyberling-rg and nothing else. They run this. What happens?',
      code: { language: 'shell', source: 'az keyvault secret show --vault-name cyberling-kv-<yourname> --name RatesApiKey --query value -o tsv' },
      choices: ['It prints demo-key-123: Contributor can do everything except assign roles', 'It prints only the secret\'s metadata, not the value', 'Forbidden: Contributor is a control-plane role; reading a secret needs Key Vault Secrets User or Officer at the vault scope', 'It works only if they have MFA enabled'],
      answer: 'Forbidden: Contributor is a control-plane role; reading a secret needs Key Vault Secrets User or Officer at the vault scope',
      explanation: 'Contributor (and even Owner) manage the vault resource: they could delete it or change its network rules. The secret values sit behind the data plane, which RBAC-mode vaults guard with separate roles. That separation is why a Key Vault reference is safer than a plain app setting: Contributor can read app settings.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the steps that put a secret in a vault and into LedgerSharp\'s configuration.',
      language: 'text',
      indentation: false,
      solution: [
        'Create the vault in cyberling-rg with RBAC authorization enabled',
        'Grant yourself Key Vault Secrets Officer at the vault scope',
        'Set the secret RatesApiKey with az keyvault secret set',
        'Grant the web app\'s managed identity Key Vault Secrets User at the vault scope',
        'Set the app setting RATES_API_KEY to a @Microsoft.KeyVault(SecretUri=...) reference',
        'Restart the web app and check the reference shows as resolved',
      ],
      distractors: [
        'Put the secret value straight into the app setting: app settings are encrypted at rest',
        'Grant the web app\'s identity Owner on the vault so it can also rotate the secret',
        'Set the secret before granting yourself a data-plane role',
      ],
      explanation: 'Encrypted at rest does not mean hidden from Contributors: app settings are readable by anyone who can manage the app. Owner on the vault is control-plane and more than the app needs; Secrets User reads and nothing else. And in RBAC mode even you cannot write a secret until a data-plane role says so.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the reference syntax and the role that lets the web app resolve it.',
      language: 'shell',
      template: 'az role assignment create \\\n  --assignee-object-id <principalId> \\\n  --assignee-principal-type ServicePrincipal \\\n  --role "{{role}}" \\\n  --scope $(az keyvault show --name cyberling-kv-<yourname> --query id -o tsv)\n\naz webapp config appsettings set --name cyberling-api-<yourname> --resource-group cyberling-rg \\\n  --settings RATES_API_KEY="@Microsoft.{{kv}}({{param}}=https://cyberling-kv-<yourname>.vault.azure.net/secrets/RatesApiKey/)"',
      blanks: [
        { id: 'role', answers: ['Key Vault Secrets User'], hint: 'Read secrets, nothing more.' },
        { id: 'kv', answers: ['KeyVault'], hint: 'The service name as it appears in the reference prefix, no space.' },
        { id: 'param', answers: ['SecretUri'], hint: 'The parameter that takes the full https URL of the secret.' },
      ],
      explanation: 'The prefix @Microsoft.KeyVault( tells App Service to resolve rather than pass through. SecretUri without a trailing version always picks the latest version; the alternative form is @Microsoft.KeyVault(VaultName=...;SecretName=...).',
    },
    {
      kind: 'fieldwork',
      prompt: 'Create a vault, store one secret and reference it from LedgerSharp.',
      warning: 'A standard-tier Key Vault has no standing charge; secret operations cost about 3 cents per 10,000, so this lesson costs a fraction of a cent. A deleted vault is soft-deleted for 90 days (free) and its name is reserved until purged. Key Vault names are globally unique: if cyberling-kv-<yourname> is taken, add digits.',
      checklist: [
        'Create `cyberling-kv-<yourname>` in cyberling-rg with `--enable-rbac-authorization true`.',
        'Grant yourself "Key Vault Secrets Officer" at the vault scope, wait a minute, then `az keyvault secret set --vault-name cyberling-kv-<yourname> --name RatesApiKey --value demo-key-123`.',
        'Grant the web app\'s principalId (from Lesson 2) "Key Vault Secrets User" at the vault scope.',
        'Set the app setting `RATES_API_KEY` to `@Microsoft.KeyVault(SecretUri=https://cyberling-kv-<yourname>.vault.azure.net/secrets/RatesApiKey/)` and restart the app.',
        'Run `az webapp config appsettings list --name cyberling-api-<yourname> --resource-group cyberling-rg --query "[?name==\'RATES_API_KEY\'].value" -o tsv`: the CLI shows the reference string, not the secret.',
        'In the portal open the web app > Environment variables: the RATES_API_KEY row shows a green check (resolved) or a red mark with the reason (usually a missing role or a typo in the URI).',
        'Optional: add `app.MapGet("/config-check", (IConfiguration c) => Results.Ok(new { hasKey = !string.IsNullOrEmpty(c["RATES_API_KEY"]) }));`, redeploy, and confirm `{"hasKey":true}`. Never return the value itself.',
        'Teardown: Lesson 4 deletes and purges the vault. If you stop here instead, run `az keyvault delete --name cyberling-kv-<yourname>` now (then `az keyvault purge --name cyberling-kv-<yourname>` to free the name).',
      ],
      verify: { question: 'The CLI prints the stored value of the RATES_API_KEY app setting. Type the text it starts with, up to and including "KeyVault".', answers: ['@Microsoft.KeyVault'] },
    },
  ],
};

const l64: Lesson = {
  id: 'az-6-4',
  title: 'Alerts, Defender, budgets, teardown',
  objective: 'Alert on server errors, know what Defender for Cloud watches for free, and tear the extras down.',
  minutes: 30,
  lexicon: [
    { id: 'az.6.metricalert', term: 'az monitor metrics alert create', kind: 'pattern', meaning: 'Create a rule that evaluates a platform metric on a schedule and fires an action group when a condition holds.', example: 'az monitor metrics alert create --name cyberling-5xx --resource-group cyberling-rg --scopes <web app id> --condition "total Http5xx > 5" --window-size 5m --evaluation-frequency 1m --action cyberling-oncall', analogy: 'A CloudWatch alarm on the Lambda Errors metric. The analogy breaks on wiring: an alarm names an SNS topic; an alert rule names an action group, which can email, SMS, call a webhook or run a Function.' },
    { id: 'az.6.actiongroup', term: 'action group', kind: 'service', meaning: 'A reusable list of notifications and automations (email, SMS, webhook, Logic App) that alert rules reference by name.', example: 'az monitor action-group create --name cyberling-oncall --resource-group cyberling-rg --short-name oncall --action email me you@example.com' },
    { id: 'az.6.defender', term: 'Defender for Cloud', kind: 'service', meaning: 'Azure\'s security posture service. The foundational layer (Secure Score, recommendations such as "storage account allows shared key access") is free; per-resource Defender plans are paid and opt-in.', example: 'az security pricing list --query "[].{name:name, tier:pricingTier}" -o table', analogy: 'AWS Security Hub plus GuardDuty. The analogy holds for posture checks; the paid plans differ resource by resource.' },
    { id: 'az.6.softdelete', term: 'soft delete (Key Vault)', kind: 'concept', meaning: 'A deleted vault is kept recoverable for 90 days by default. Its name stays reserved until the retention ends or you purge it explicitly.', example: 'az keyvault list-deleted -o table && az keyvault purge --name cyberling-kv-<yourname>' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Tell me when it breaks, then clean up',
      body: `Telemetry you have to go and look at is a diary. An **alert** is an alarm clock. Azure Monitor evaluates a **metric** (here \`Http5xx\`, the count of 5xx responses the web app returned) over a **window** on a **frequency**, and when the condition holds it fires an **action group**: a named list of recipients and automations you create once and reuse across rules.

**Defender for Cloud** is worth one paragraph. Its free foundational layer scores your subscription and lists recommendations; it will already be telling you that \`cyberlingstore<yourname>\` allows shared-key access, which you no longer need after Lesson 2. The paid Defender plans (for App Service, Storage, Key Vault and so on) are per resource per month and are **off** unless someone turns them on; \`az security pricing list\` shows which tier each is on.

Then the habit: **confirm your budget** from Module 1 still exists, and delete what this module added that Module 7 will not recreate.`,
      example: {
        language: 'shell',
        source: 'az monitor action-group create --name cyberling-oncall --resource-group cyberling-rg --short-name oncall --action email me you@example.com\naz monitor metrics alert create --name cyberling-5xx --resource-group cyberling-rg --scopes $(az webapp show --name cyberling-api-<yourname> --resource-group cyberling-rg --query id -o tsv) --condition "total Http5xx > 5" --window-size 5m --evaluation-frequency 1m --action cyberling-oncall --description "LedgerSharp is returning server errors"\naz security pricing list --query "[].{name:name, tier:pricingTier}" -o table\naz consumption budget list -o table\naz monitor metrics alert delete --name cyberling-5xx --resource-group cyberling-rg\naz monitor action-group delete --name cyberling-oncall --resource-group cyberling-rg\naz keyvault delete --name cyberling-kv-<yourname>\naz keyvault purge --name cyberling-kv-<yourname>',
        labels: [
          { lines: [1, 1], label: 'Who gets told: one email receiver named "me".' },
          { lines: [2, 2], label: 'What counts as broken: more than 5 server errors in any 5-minute window, checked every minute.' },
          { lines: [3, 3], label: 'Make sure every Defender plan still says Free.' },
          { lines: [4, 4], label: 'The Module 1 budget is the backstop for everything else.' },
          { lines: [5, 6], label: 'Remove the rule, then the group it referenced.' },
          { lines: [7, 8], label: 'Delete soft-deletes; purge is permanent and frees the name. Think before purging anything real.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'CloudWatch alarm + SNS topic + email subscription ≈ metric alert + action group with an email receiver. AWS Budgets ≈ Cost Management budgets. Security Hub / GuardDuty ≈ Defender for Cloud. Neither cloud deletes a vault outright: Secrets Manager also schedules deletion (7 to 30 days) unless forced.' }],
    },
    {
      kind: 'predict',
      prompt: 'You run the two commands below, then immediately try to create a new vault with the same name. What happens?',
      code: { language: 'shell', source: 'az keyvault delete --name cyberling-kv-<yourname>\naz keyvault list-deleted --query "[].name" -o tsv\naz keyvault create --name cyberling-kv-<yourname> --resource-group cyberling-rg --location westeurope' },
      choices: ['The create succeeds: delete removed the vault completely', 'The create fails: the vault is soft-deleted, still listed by list-deleted, and the name is reserved until it is purged or recovered', 'The create succeeds but the old secrets reappear inside it', 'The delete fails: a vault with secrets cannot be deleted'],
      answer: 'The create fails: the vault is soft-deleted, still listed by list-deleted, and the name is reserved until it is purged or recovered',
      explanation: 'Soft delete is on for every vault and cannot be turned off. After delete, the vault shows up in list-deleted for 90 days; creating another with the same name is refused (the error suggests recovering it with az keyvault recover). az keyvault purge removes it for good and releases the name. Recovering is the third option; it does bring the secrets back.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the end-of-module checks and teardown.',
      language: 'text',
      indentation: false,
      solution: [
        'Create the action group with your email, then the Http5xx metric alert on the web app',
        'Confirm every Defender plan shows the Free tier',
        'Confirm the Module 1 budget still exists in Cost Management',
        'Delete the metric alert rule, then the action group',
        'Delete the Key Vault, then purge it so the name is released',
        'Check az keyvault list-deleted no longer shows your vault',
      ],
      distractors: [
        'Skip the purge: a soft-deleted vault releases its name immediately',
        'Turn off Defender\'s foundational plan to save money',
        'Delete the budget: with the module done there is nothing to watch',
      ],
      explanation: 'The name stays reserved until purge or 90 days. The foundational Defender layer is free, so switching it off saves nothing and hides recommendations. The budget guards the subscription, not this module; it stays until the subscription does.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the alert, its action group and the final vault cleanup.',
      language: 'shell',
      template: 'az monitor action-group create --name cyberling-oncall --resource-group cyberling-rg --short-name oncall --action {{kind}} me you@example.com\n\naz monitor metrics alert create --name cyberling-5xx --resource-group cyberling-rg \\\n  --scopes $(az webapp show --name cyberling-api-<yourname> --resource-group cyberling-rg --query id -o tsv) \\\n  --condition "{{agg}} {{metric}} > 5" --window-size 5m --evaluation-frequency 1m \\\n  --action cyberling-oncall\n\naz keyvault delete --name cyberling-kv-<yourname>\naz keyvault {{purge}} --name cyberling-kv-<yourname>',
      blanks: [
        { id: 'kind', answers: ['email'], hint: 'The receiver type for a mailbox.' },
        { id: 'agg', answers: ['total', 'count'], hint: 'How to aggregate the metric over the window: add the values up.' },
        { id: 'metric', answers: ['Http5xx'], hint: 'The App Service metric counting server-error responses.' },
        { id: 'purge', answers: ['purge'], hint: 'The permanent step after a soft delete.' },
      ],
      explanation: 'Receiver, aggregation and metric, then the irreversible step spelled out so you never type it by accident.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Milestone: LedgerSharp is observed and secured. Alert on errors, check your posture, then remove what Module 7 will not rebuild.',
      warning: 'A metric alert rule costs about 10 cents per month per monitored time series, prorated, so an afternoon is well under a cent; email notifications are free in the low thousands per month. Defender\'s foundational layer is free; do not enable any paid plan here. Everything else in this lesson is deletion. The web app, storage account, identity and Application Insights stay for Module 7, at the same cost as before (free plan, pennies of storage, free telemetry allowance).',
      checklist: [
        'Create the action group `cyberling-oncall` with your email, then the alert `cyberling-5xx` on `cyberling-api-<yourname>` with condition "total Http5xx > 5". Accept the confirmation email the action group sends you.',
        'Optional: force some 5xx by temporarily setting `STORAGE_ACCOUNT` to a wrong name, restarting and sending 6 requests; watch the alert fire in Monitor > Alerts, then fix the setting.',
        'Run `az security pricing list --query "[].{name:name, tier:pricingTier}" -o table` and confirm every row says Free.',
        'Run `az consumption budget list -o table` (or open Cost Management > Budgets) and confirm your Module 1 budget exists.',
        'Teardown: `az monitor metrics alert delete --name cyberling-5xx --resource-group cyberling-rg` then `az monitor action-group delete --name cyberling-oncall --resource-group cyberling-rg`.',
        'Teardown: `az keyvault delete --name cyberling-kv-<yourname>`, then `az keyvault list-deleted --query "[].name" -o tsv` to see it listed, then `az keyvault purge --name cyberling-kv-<yourname>` (permanent: do this only for the practice vault).',
        'Remove the `RATES_API_KEY` app setting from the web app so it does not point at a vault that no longer exists.',
        'Keep cyberling-rg, the web app, the storage account and Application Insights: Module 7 describes exactly these in Bicep, then deletes the group for good.',
      ],
      verify: { question: 'After az keyvault delete, your vault appeared in the output of az keyvault list-deleted. In one word, what state was the vault in while it appeared there (the word in the command name)?', answers: ['deleted', 'Deleted', 'soft-deleted', 'soft deleted'] },
    },
  ],
};

export const m6: Module = {
  id: 'az-m6',
  title: 'Observe and secure',
  goal: 'Application Insights, managed identities, Key Vault, RBAC scopes.',
  projectMilestone: 'The API uses a managed identity, no secrets in config.',
  status: 'available',
  lessons: [l61, l62, l63, l64],
};
