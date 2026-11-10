import type { Lesson, Module } from '../../schema';

const l31: Lesson = {
  id: 'az-3-1',
  title: 'The Functions model: apps, plans, triggers',
  objective: 'Explain how a function app, its plan and an HTTP trigger fit together, and read an isolated-worker function.',
  minutes: 25,
  lexicon: [
    { id: 'az.3.function-app', term: 'function app', kind: 'service', meaning: 'The deployable unit: one process hosting one or more functions, with one set of app settings and one plan. Each function inside it has a trigger.', example: 'az functionapp create --name cyberling-fn-<yourname> --resource-group cyberling-rg ...', analogy: 'A Lambda function is one handler; a function app is a whole project of handlers deployed together, closer to a SAM template\'s worth of Lambdas.' },
    { id: 'az.3.plan', term: 'Consumption vs Premium plan', kind: 'concept', meaning: 'How compute is billed. Consumption: pay per execution and per GB-second, scale to zero, cold starts. Premium: pre-warmed instances billed every hour they exist, no cold start, VNet access.', example: '--consumption-plan-location westeurope' },
    { id: 'az.3.trigger-binding', term: 'trigger / binding', kind: 'concept', meaning: 'A trigger is the event that starts a function (HTTP request, timer, queue message, new blob). Bindings are declarative inputs and outputs (write to a table, read a blob) so the function body stays about logic.', example: '[HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req', analogy: 'A Lambda event source mapping is a trigger. Lambda has no output bindings: you call the SDK yourself.' },
    { id: 'az.3.isolated-worker', term: 'dotnet-isolated worker', kind: 'concept', meaning: 'Your code runs in its own .NET process that talks to the Functions host over gRPC. You pick the .NET version, own Program.cs and the dependency container; the host only routes events.', example: 'func init --worker-runtime dotnet-isolated' },
    { id: 'az.3.function-attribute', term: '[Function("name")]', kind: 'pattern', meaning: 'Marks a method as a function and names it. The name becomes the route (/api/name) for HTTP triggers and the identifier in logs and the portal.', example: '[Function("classify")]\npublic async Task<HttpResponseData> Run(...)' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'App, plan, trigger',
      body: `Azure Functions is the event-driven compute service. The unit you deploy is a **function app**: a project with a \`host.json\`, a \`Program.cs\`, and one or more **functions**, each started by a **trigger** (HTTP request, timer, queue message, new blob). **Bindings** let a function declare inputs and outputs (write this return value to a table) without SDK code.

A function app runs on a **plan**. The **Consumption** plan bills per execution and per GB-second, scales to zero and has cold starts of a second or two. The **Premium** plan keeps at least one instance warm, which you pay for every hour whether or not a request arrives. (Microsoft now also offers Flex Consumption, a newer pay-per-use plan; the CLI flag differs but the idea is the same.)

Every function app needs a storage account for its own bookkeeping, which is why Module 2 came first. Two files configure it: \`host.json\` for the host, and \`local.settings.json\` for settings that only apply on your machine.`,
      example: {
        language: 'text',
        source: '// host.json\n{ "version": "2.0" }\n\n// local.settings.json (never deployed, never committed)\n{\n  "IsEncrypted": false,\n  "Values": {\n    "AzureWebJobsStorage": "UseDevelopmentStorage=true",\n    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated"\n  }\n}',
        labels: [
          { lines: [1, 2], label: 'Host configuration shared by every function in the app; the version is the runtime schema, not yours.' },
          { lines: [4, 11], label: 'Local-only app settings: the storage the host uses for bookkeeping and the worker language.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'Lambda ≈ Functions, but the units differ: one Lambda function is one handler with its own config, while an Azure function app bundles several functions under one set of settings and one plan. The Consumption plan is Lambda\'s billing model (per request and GB-second, scale to zero); Premium has no Lambda twin other than provisioned concurrency, which also bills while idle.' }],
    },
    {
      kind: 'concept',
      title: 'The classify function in the isolated worker',
      body: `In the **dotnet-isolated** worker your code is an ordinary .NET process. The Functions host receives the HTTP request and forwards it over gRPC to your process, where a method marked \`[Function("classify")]\` runs. The HTTP trigger is an attribute on the parameter: \`[HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req\`. The function name becomes the route, \`/api/classify\`.

\`HttpRequestData\` gives you the body as a stream and headers; you build an \`HttpResponseData\` from it and return it. The classification rule is the one LedgerSharp already uses: a negative amount is an expense.`,
      example: {
        language: 'csharp',
        source: 'using System.Net;\nusing System.Text.Json;\nusing Microsoft.Azure.Functions.Worker;\nusing Microsoft.Azure.Functions.Worker.Http;\n\npublic class Classify\n{\n    [Function("classify")]\n    public async Task<HttpResponseData> Run(\n        [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req)\n    {\n        using var doc = await JsonDocument.ParseAsync(req.Body);\n        var amount = doc.RootElement.GetProperty("amount").GetDecimal();\n        var kind = amount < 0 ? "expense" : "income";\n        var res = req.CreateResponse(HttpStatusCode.OK);\n        await res.WriteAsJsonAsync(new { kind });\n        return res;\n    }\n}',
        labels: [
          { lines: [1, 4], label: 'JSON you know from LedgerSharp, plus the worker and HTTP binding namespaces.' },
          { lines: [8, 10], label: 'Name the function and declare its trigger: POST only, a function key required in Azure.' },
          { lines: [12, 14], label: 'Read the body, pull out amount, apply the ledger rule.' },
          { lines: [15, 17], label: 'Build a 200 response with a JSON body: {"kind":"expense"} for -40.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'The Lambda handler def handler(event, context) got a pre-parsed dict and returned {"statusCode": 200, "body": json.dumps(...)}. Here the method signature declares the trigger with attributes, the body is a stream you parse, and you return a typed HttpResponseData. The minimal API you ran locally in the C# track is the closer relative: a method per route, JSON in and out.' }],
    },
    {
      kind: 'predict',
      prompt: 'Two function apps run the same classify code and receive zero requests for a month. What does the compute bill look like?',
      code: { language: 'text', source: 'app A: Consumption plan\napp B: Premium plan (EP1, one pre-warmed instance)' },
      choices: ['A: nothing for compute; B: the instance is billed for every hour of the month', 'Both: nothing, serverless means pay per request', 'Both: a small hourly charge for keeping the app registered', 'A: a small hourly charge; B: nothing, Premium includes idle time'],
      answer: 'A: nothing for compute; B: the instance is billed for every hour of the month',
      explanation: 'Consumption scales to zero: no executions, no GB-seconds, no compute charge (the storage account still costs cents). Premium exists to avoid cold starts, and the way it does that is by keeping an instance running, which is billed every hour it exists, traffic or not. For this course only Consumption makes sense.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the attributes that make this method the classify endpoint.',
      language: 'csharp',
      template: '[{{attr}}("classify")]\npublic async Task<HttpResponseData> Run(\n    [HttpTrigger(AuthorizationLevel.{{level}}, "{{method}}")] HttpRequestData req)',
      blanks: [
        { id: 'attr', answers: ['Function'], hint: 'The attribute that names a function.' },
        { id: 'level', answers: ['Function'], hint: 'Callers must present a function key (not Anonymous, not Admin).' },
        { id: 'method', answers: ['post'], hint: 'The HTTP method the ledger client uses to send an entry.' },
      ],
      explanation: 'The Function attribute names the function (and the route); the HttpTrigger attribute on the parameter sets the authorization level and allowed methods.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Get the local toolchain ready; nothing in Azure is touched yet.',
      warning: 'This fieldwork installs tools on your machine only. No Azure resources are created and nothing is billed.',
      checklist: [
        'Confirm the .NET 8 SDK is installed: `dotnet --list-sdks` shows an 8.x entry.',
        'Install Azure Functions Core Tools v4 for your OS (npm: `npm install -g azure-functions-core-tools@4`, or the package for your platform).',
        'Run `func --version` and note the major version.',
        'Read host.json and local.settings.json from the concept step once more; you will see Core Tools generate both next lesson.',
        'Teardown: nothing to delete; no cloud resources were created.',
      ],
      verify: { question: 'What major version number does func --version print first?', answers: ['4'] },
    },
  ],
};

const l32: Lesson = {
  id: 'az-3-2',
  title: 'Local development with Core Tools',
  objective: 'Scaffold a dotnet-isolated function app, run it locally and call classify with curl.',
  minutes: 30,
  lexicon: [
    { id: 'az.3.core-tools', term: 'Azure Functions Core Tools (func)', kind: 'builtin', meaning: 'The command-line tool that scaffolds, runs and publishes function apps. Locally it runs the same Functions host that Azure runs.', example: 'func --version', analogy: 'The SAM CLI (sam init, sam local start-api, sam deploy). func covers the same loop for one function app.' },
    { id: 'az.3.func-init', term: 'func init --worker-runtime dotnet-isolated', kind: 'pattern', meaning: 'Create a function app project: csproj, Program.cs, host.json, local.settings.json. The worker runtime is fixed per app.', example: 'func init LedgerFunctions --worker-runtime dotnet-isolated --target-framework net8.0' },
    { id: 'az.3.func-new', term: 'func new --template "HTTP trigger"', kind: 'pattern', meaning: 'Add one function from a template. --name becomes the class and the route; --authlevel sets the key requirement.', example: 'func new --name classify --template "HTTP trigger" --authlevel function' },
    { id: 'az.3.func-start', term: 'func start', kind: 'pattern', meaning: 'Build and run the app locally on http://localhost:7071. Function keys are not enforced locally, so every HTTP function answers without a key.', example: 'func start' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Scaffold, run, call',
      body: `Core Tools gives you the whole inner loop. \`func init\` creates the project with the worker runtime baked in. \`func new\` adds one function from a template; \`--name classify\` produces \`classify.cs\` with \`[Function("classify")]\` already in place, so you replace the body with the code from last lesson. \`func start\` builds the project and runs the real Functions host on port **7071**; every HTTP function is listed with its URL, \`http://localhost:7071/api/classify\`.

Two local facts to remember. HTTP-only apps run without a storage emulator, so the \`UseDevelopmentStorage=true\` setting is harmless here. And locally the host does **not** enforce function keys: a request with no key succeeds on your machine and will be refused in Azure (next lesson).`,
      example: {
        language: 'shell',
        source: 'func init LedgerFunctions --worker-runtime dotnet-isolated --target-framework net8.0\ncd LedgerFunctions\nfunc new --name classify --template "HTTP trigger" --authlevel function\nfunc start\ncurl -i -X POST http://localhost:7071/api/classify -H "Content-Type: application/json" -d \'{"amount": -40}\'',
        labels: [
          { lines: [1, 2], label: 'Create the project; the worker runtime and .NET version are decided here, once.' },
          { lines: [3, 3], label: 'Add the function; the name sets the class, the file and the route.' },
          { lines: [4, 4], label: 'Build and run the host locally; it prints the URL of every HTTP function.' },
          { lines: [5, 5], label: 'From a second terminal: POST an entry and show the status line and the JSON body.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'sam init → func init; sam local start-api → func start, except that func runs the actual Functions host rather than a Docker emulation, so it starts in seconds. The URL shape changes too: API Gateway gave you a stage path, Functions always prefixes /api unless you change host.json.' }],
    },
    {
      kind: 'predict',
      prompt: 'The app is running locally. What does this request return?',
      code: { language: 'shell', source: 'curl -s -X POST http://localhost:7071/api/classify -H "Content-Type: application/json" -d \'{"amount": 120}\'' },
      choices: ['{"kind":"income"}', '{"kind":"expense"}', '401 Unauthorized, because no function key was sent', '{"kind":"income","amount":120}'],
      answer: '{"kind":"income"}',
      explanation: 'The rule is amount < 0 → expense, otherwise income, and the response object has only the kind property. No key is needed locally: Core Tools skips key enforcement so you can iterate; the 401 appears only after deployment.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the commands from empty folder to a classified entry.',
      language: 'shell',
      indentation: false,
      solution: [
        'func init LedgerFunctions --worker-runtime dotnet-isolated --target-framework net8.0',
        'cd LedgerFunctions',
        'func new --name classify --template "HTTP trigger" --authlevel function',
        'func start',
        'curl -i -X POST http://localhost:7071/api/classify -H "Content-Type: application/json" -d \'{"amount": -40}\'',
      ],
      distractors: [
        'func new --name classify --template "HTTP trigger" --worker-runtime dotnet-isolated',
        'dotnet run',
        'curl -i -X POST http://localhost:7071/classify -H "Content-Type: application/json" -d \'{"amount": -40}\'',
      ],
      explanation: 'The worker runtime belongs to func init, not func new: it is a property of the app. dotnet run would start your worker process alone, without the Functions host that listens on 7071 and routes HTTP to it. And the host puts every HTTP function under /api by default, so /classify without the prefix is a 404.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the request that classifies a -40 entry against the local host.',
      language: 'shell',
      template: 'curl -i -X {{method}} http://localhost:{{port}}/{{prefix}}/classify -H "Content-Type: application/json" -d \'{"amount": -40}\'',
      blanks: [
        { id: 'method', answers: ['POST'], hint: 'The only method the trigger allows.' },
        { id: 'port', answers: ['7071'], hint: 'Core Tools\' default port.' },
        { id: 'prefix', answers: ['api'], hint: 'The route prefix the host adds to every HTTP function.' },
      ],
      explanation: 'POST to localhost:7071/api/<function name>: the function name from the attribute, the prefix from host.json defaults, the port from Core Tools.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Run classify on your own machine.',
      warning: 'Everything in this fieldwork runs locally. No Azure resources are created and nothing is billed. func start keeps running until you press Ctrl+C.',
      checklist: [
        'Run `func init LedgerFunctions --worker-runtime dotnet-isolated --target-framework net8.0` and `cd LedgerFunctions`.',
        'Run `func new --name classify --template "HTTP trigger" --authlevel function`, then replace the body of classify.cs with the Classify class from lesson 3-1 (keep the file\'s namespace line if the template added one).',
        'Run `func start` and wait for the line that lists `classify: [POST] http://localhost:7071/api/classify`.',
        'In a second terminal run `curl -i -X POST http://localhost:7071/api/classify -H "Content-Type: application/json" -d \'{"amount": -40}\'`.',
        'Read the status line and the JSON body; try `{"amount": 120}` too.',
        'Teardown: press Ctrl+C in the func start terminal. Keep the project folder; the next lesson publishes it.',
      ],
      verify: { question: 'Type the HTTP status code, a space, and the JSON key in the response body (for example: 418 flavour).', answers: ['200 kind', '200, kind', '200 "kind"'] },
    },
  ],
};

const l33: Lesson = {
  id: 'az-3-3',
  title: 'Deploying and calling with a function key',
  objective: 'Create a Consumption function app, publish classify to it, and call it with its function key.',
  minutes: 35,
  lexicon: [
    { id: 'az.3.functionapp-create', term: 'az functionapp create', kind: 'pattern', meaning: 'Create the function app resource: name, plan (consumption location), runtime and version, and the storage account the host needs.', example: 'az functionapp create --name cyberling-fn-<yourname> --resource-group cyberling-rg --consumption-plan-location westeurope --runtime dotnet-isolated --runtime-version 8.0 --functions-version 4 --os-type Linux --storage-account cyberlingstore<yourname>' },
    { id: 'az.3.publish', term: 'func azure functionapp publish', kind: 'pattern', meaning: 'Build the project in release mode, zip it, upload it to the function app and list the deployed functions with their invoke URLs.', example: 'func azure functionapp publish cyberling-fn-<yourname>', analogy: 'sam deploy without the template: it ships code to an app that already exists.' },
    { id: 'az.3.auth-level', term: 'AuthorizationLevel', kind: 'concept', meaning: 'Who may call an HTTP function in Azure: Anonymous (anyone), Function (a function or host key), Admin (the master key only). Ignored when running locally.', example: '[HttpTrigger(AuthorizationLevel.Function, "post")]' },
    { id: 'az.3.function-key', term: 'function key (?code=)', kind: 'concept', meaning: 'A secret the host generates per function (and per app). Sent as the code query parameter or the x-functions-key header. Without it a Function-level trigger returns 401.', example: 'az functionapp function keys list --name cyberling-fn-<yourname> --resource-group cyberling-rg --function-name classify', analogy: 'An API Gateway API key, but built into the host rather than a separate service, and with no usage plan attached.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Create the app, ship the code',
      body: `Deployment is two steps. First create the **function app** resource with \`az functionapp create\`. You name the app (globally unique: it becomes \`cyberling-fn-<yourname>.azurewebsites.net\`), choose a Consumption plan by giving its location, state the runtime (\`dotnet-isolated\`, version \`8.0\`, Functions version \`4\`) and point it at a **storage account** for the host's bookkeeping. Module 2 deleted ours, so this lesson creates a fresh one.

Second, from inside the project folder, \`func azure functionapp publish <app>\` builds in release mode, zips the output and uploads it. It ends by printing each function with its **invoke URL**, including the function key.

The CLI also creates an Application Insights resource with the same name as the app, so logs have somewhere to go; next lesson uses it.`,
      example: {
        language: 'shell',
        source: 'az storage account create --name cyberlingstore<yourname> --resource-group cyberling-rg --location westeurope --sku Standard_LRS --kind StorageV2\naz functionapp create --name cyberling-fn-<yourname> --resource-group cyberling-rg --consumption-plan-location westeurope --runtime dotnet-isolated --runtime-version 8.0 --functions-version 4 --os-type Linux --storage-account cyberlingstore<yourname>\nfunc azure functionapp publish cyberling-fn-<yourname>',
        labels: [
          { lines: [1, 1], label: 'The host needs a storage account; recreate the one Module 2 removed.' },
          { lines: [2, 2], label: 'Create the app on a Consumption plan in the region, with the right worker and Functions version.' },
          { lines: [3, 3], label: 'Build, zip, upload; prints the invoke URL of classify with its key.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'aws lambda create-function needed a zip and an execution role up front; az functionapp create makes an empty app and publish fills it. Lambda needed API Gateway to be reachable over HTTP; a Functions HTTP trigger is reachable at the app\'s hostname as soon as it is published, and the key system replaces the API key / usage plan dance.' }],
    },
    {
      kind: 'concept',
      title: 'authLevel and keys',
      body: `The \`AuthorizationLevel\` in the trigger attribute decides who may call the function once it is in Azure. \`Anonymous\` means anyone on the internet. \`Function\` (what we chose) means the caller must present a **function key**: either \`?code=<key>\` in the query string or an \`x-functions-key\` header. \`Admin\` requires the app's master key.

Keys are generated by the host, stored in the app's storage account, and listed with \`az functionapp function keys list\`. They are a convenience lock, not an identity system: anyone holding the key is a valid caller, so treat keys like SAS tokens. Module 6 shows the proper way, Entra ID authentication, when LedgerSharp needs real users.`,
      example: {
        language: 'shell',
        source: 'KEY=$(az functionapp function keys list --name cyberling-fn-<yourname> --resource-group cyberling-rg --function-name classify --query default --output tsv)\ncurl -i -X POST "https://cyberling-fn-<yourname>.azurewebsites.net/api/classify?code=$KEY" -H "Content-Type: application/json" -d \'{"amount": -40}\'',
        labels: [
          { lines: [1, 1], label: 'Read the default function key for classify into a shell variable.' },
          { lines: [2, 2], label: 'Call the deployed function over HTTPS with the key in the query string.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'The deployed Lambda behind API Gateway was open unless you added an API key or an authorizer. Functions default the other way: the template\'s authLevel function closes the door until a key is presented. Both are shared secrets; neither is a substitute for proper authentication.' }],
    },
    {
      kind: 'predict',
      prompt: 'classify is published with AuthorizationLevel.Function. Locally this exact request worked. What happens now?',
      code: { language: 'shell', source: 'curl -i -X POST https://cyberling-fn-<yourname>.azurewebsites.net/api/classify -H "Content-Type: application/json" -d \'{"amount": -40}\'' },
      choices: ['401 Unauthorized: no function key was presented', '200 with {"kind":"expense"}, same as locally', '403 Forbidden: the caller is not in Entra ID', '404 Not Found: keys are part of the route'],
      answer: '401 Unauthorized: no function key was presented',
      explanation: 'Core Tools skips key checks locally; the Azure host does not. A Function-level trigger without ?code= or x-functions-key is rejected with 401 before your code runs. 403 is what you would see from an Entra ID or IP restriction, and the route exists regardless of the key, so it is not a 404.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the steps from an empty resource group to a successful call of the deployed function.',
      language: 'text',
      indentation: false,
      solution: [
        'Create a storage account for the host\'s bookkeeping',
        'Create the function app on a Consumption plan with runtime dotnet-isolated and functions version 4',
        'Run func azure functionapp publish from the project folder',
        'List the classify function key with az functionapp function keys list',
        'curl the https URL with ?code=<key> and check for 200',
      ],
      distractors: [
        'Create the function app on a Premium plan so the first call has no cold start',
        'Run func start so the deployed app can receive requests',
      ],
      explanation: 'Premium would bill every hour of the month for a lesson that makes three requests; a cold start of a second is the right trade. func start runs the host on your laptop and has nothing to do with the app in Azure; publish is the step that ships code.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the app creation command.',
      language: 'shell',
      template: 'az functionapp create --name cyberling-fn-<yourname> --resource-group cyberling-rg --consumption-plan-location {{loc}} --runtime {{runtime}} --runtime-version 8.0 --functions-version {{ver}} --os-type Linux --storage-account cyberlingstore<yourname>',
      blanks: [
        { id: 'loc', answers: ['westeurope'], hint: 'The region used in every example of this track.' },
        { id: 'runtime', answers: ['dotnet-isolated'], hint: 'The worker you chose in func init.' },
        { id: 'ver', answers: ['4'], hint: 'The current Functions host major version.' },
      ],
      explanation: 'The consumption plan is created implicitly by naming its location; runtime and functions version must match what func init produced or publish will refuse.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Publish classify and call it with its key.',
      warning: 'A Consumption function app with a few requests costs nothing for compute; the storage account and Application Insights hold a few kilobytes and cost cents at most. The function key is a shared secret: do not paste it publicly. Both resources are deleted next lesson.',
      checklist: [
        'Recreate the storage account: `az storage account create --name cyberlingstore<yourname> --resource-group cyberling-rg --location westeurope --sku Standard_LRS --kind StorageV2` (or the region nearest you).',
        'Run `az functionapp create --name cyberling-fn-<yourname> --resource-group cyberling-rg --consumption-plan-location westeurope --runtime dotnet-isolated --runtime-version 8.0 --functions-version 4 --os-type Linux --storage-account cyberlingstore<yourname>`.',
        'From the LedgerFunctions folder run `func azure functionapp publish cyberling-fn-<yourname>` and wait for the invoke URL to print.',
        'Call it without a key: `curl -i -X POST https://cyberling-fn-<yourname>.azurewebsites.net/api/classify -H "Content-Type: application/json" -d \'{"amount": -40}\'` and note the status.',
        'Run `KEY=$(az functionapp function keys list --name cyberling-fn-<yourname> --resource-group cyberling-rg --function-name classify --query default --output tsv)`.',
        'Call it with the key: `curl -i -X POST "https://cyberling-fn-<yourname>.azurewebsites.net/api/classify?code=$KEY" -H "Content-Type: application/json" -d \'{"amount": -40}\'` and read the status line and body.',
        'Teardown: the next lesson uses this app, so keep it if you are continuing today (idle Consumption apps cost nothing). If you stop here, run `az functionapp delete --name cyberling-fn-<yourname> --resource-group cyberling-rg` and `az storage account delete --name cyberlingstore<yourname> --resource-group cyberling-rg --yes`.',
      ],
      verify: { question: 'What HTTP status code did the request with ?code=$KEY return?', answers: ['200'] },
    },
  ],
};

const l34: Lesson = {
  id: 'az-3-4',
  title: 'Settings, logs and teardown',
  objective: 'Configure the function app with app settings, watch its logs live, and delete it while keeping the resource group.',
  minutes: 30,
  lexicon: [
    { id: 'az.3.app-settings', term: 'app settings', kind: 'concept', meaning: 'Key-value configuration stored on the function app and exposed to your code as environment variables. Changing them restarts the app; local.settings.json plays the same role on your machine.', example: 'az functionapp config appsettings set --name cyberling-fn-<yourname> --resource-group cyberling-rg --settings LEDGER_OWNER=alice', analogy: 'Lambda environment variables. Same idea, but shared by every function in the app.' },
    { id: 'az.3.logstream', term: 'func azure functionapp logstream', kind: 'pattern', meaning: 'Stream the deployed app\'s log output to your terminal. Each invocation shows start, your log lines and end with duration.', example: 'func azure functionapp logstream cyberling-fn-<yourname>', analogy: 'aws logs tail /aws/lambda/<fn> --follow.' },
    { id: 'az.3.app-insights', term: 'Application Insights', kind: 'service', meaning: 'Azure Monitor\'s application telemetry: requests, dependencies, exceptions and traces, queried with KQL. The CLI wires a function app to it through the APPLICATIONINSIGHTS_CONNECTION_STRING setting.', example: 'az monitor app-insights component show --app cyberling-fn-<yourname> --resource-group cyberling-rg', analogy: 'CloudWatch Logs and X-Ray in one product.' },
    { id: 'az.3.functionapp-delete', term: 'az functionapp delete', kind: 'pattern', meaning: 'Delete the function app and its functions. The plan, storage account and Application Insights are separate resources and stay unless deleted too; az group delete catches everything at the end of the track.', example: 'az functionapp delete --name cyberling-fn-<yourname> --resource-group cyberling-rg' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Configuration lives in app settings',
      body: `Anything your function needs that differs between laptop and cloud (an owner name, a storage URL, later a connection to Table Storage) belongs in **app settings**, not in code. In Azure they are set with \`az functionapp config appsettings set\` and arrive in your process as environment variables; locally the \`Values\` block of \`local.settings.json\` plays the same role. Your C# reads both the same way: \`Environment.GetEnvironmentVariable("LEDGER_OWNER")\`.

Changing a setting **restarts** the app, so the new value is live within seconds without a redeploy. Settings are stored encrypted at rest but are visible to anyone who can read the app, so Module 6 moves real secrets to a managed identity instead.`,
      example: {
        language: 'shell',
        source: 'az functionapp config appsettings set --name cyberling-fn-<yourname> --resource-group cyberling-rg --settings LEDGER_OWNER=alice\naz functionapp config appsettings list --name cyberling-fn-<yourname> --resource-group cyberling-rg --query "[].name" --output tsv',
        labels: [
          { lines: [1, 1], label: 'Set one setting; the app restarts and the code sees the new environment variable.' },
          { lines: [2, 2], label: 'List setting names only; values include secrets such as the storage connection string.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'aws lambda update-function-configuration --environment Variables={...} ≈ az functionapp config appsettings set. Both land as environment variables. Differences: Azure settings apply to every function in the app, and the list already contains host settings (AzureWebJobsStorage, FUNCTIONS_WORKER_RUNTIME) that Lambda kept out of your sight.' }],
    },
    {
      kind: 'concept',
      title: 'Watching it run',
      body: `Two ways to see what the deployed function did. \`func azure functionapp logstream <app>\` streams the host's log to your terminal: each request appears as an invocation with your \`ILogger\` lines and its duration. It is the quickest way to confirm a request reached your code.

**Application Insights** is the durable store. \`az functionapp create\` made one with the app's name and set \`APPLICATIONINSIGHTS_CONNECTION_STRING\`, so every request, exception and trace is already being recorded. In the portal, Live Metrics shows requests as they happen and Logs lets you query them with KQL. Module 6 goes deeper; here you only need to know it exists and that it is a separate resource that teardown must remove.`,
      example: {
        language: 'shell',
        source: 'func azure functionapp logstream cyberling-fn-<yourname>\n# in another terminal:\ncurl -s -X POST "https://cyberling-fn-<yourname>.azurewebsites.net/api/classify?code=$KEY" -H "Content-Type: application/json" -d \'{"amount": -40}\'',
        labels: [
          { lines: [1, 1], label: 'Attach to the live log of the deployed app.' },
          { lines: [2, 3], label: 'Trigger an invocation and watch it appear in the stream with its duration.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'CloudWatch Logs gave you a log group per Lambda you had to delete separately; Application Insights is likewise a separate resource that az functionapp delete leaves behind. aws logs tail --follow ≈ func azure functionapp logstream.' }],
    },
    {
      kind: 'predict',
      prompt: 'The function reads LEDGER_OWNER with Environment.GetEnvironmentVariable and includes it in its response. You run this and immediately call the function again. What do you see?',
      code: { language: 'shell', source: 'az functionapp config appsettings set --name cyberling-fn-<yourname> --resource-group cyberling-rg --settings LEDGER_OWNER=bob' },
      choices: ['bob, after a brief pause while the app restarts with the new setting', 'alice, until you run func azure functionapp publish again', 'alice forever: settings are read only when the app is created', 'An error: settings cannot change while the app is running'],
      answer: 'bob, after a brief pause while the app restarts with the new setting',
      explanation: 'App settings are configuration, not code. Changing them restarts the function app, which rereads its environment; the next request (after a cold start of a second or two) sees the new value. No publish is needed, which is the whole point of keeping configuration out of the build.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the setting change and the log stream command.',
      language: 'shell',
      template: 'az functionapp config appsettings {{verb}} --name cyberling-fn-<yourname> --resource-group cyberling-rg --settings {{key}}=alice\nfunc azure functionapp {{cmd}} cyberling-fn-<yourname>',
      blanks: [
        { id: 'verb', answers: ['set'], hint: 'Create or update settings.' },
        { id: 'key', answers: ['LEDGER_OWNER'], hint: 'The variable name the code reads with Environment.GetEnvironmentVariable.' },
        { id: 'cmd', answers: ['logstream'], hint: 'Stream the deployed app\'s logs to the terminal.' },
      ],
      explanation: 'appsettings set takes KEY=value pairs; the code reads KEY as an environment variable. logstream is the func subcommand for live logs.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the teardown so nothing from this module keeps costing, while the resource group survives for Module 4.',
      language: 'text',
      indentation: false,
      solution: [
        'Stop the logstream with Ctrl+C',
        'Delete the function app with az functionapp delete',
        'Delete the Application Insights component that was created with the app',
        'Delete the storage account that held the host\'s bookkeeping',
        'Run az functionapp show on the deleted name and read the error code',
        'Run az resource list --resource-group cyberling-rg --output table to see what, if anything, is left',
      ],
      distractors: [
        'Delete the resource group cyberling-rg to be sure everything is gone',
        'Delete the storage account first, then the function app',
      ],
      explanation: 'The group stays until the end of the track; Module 4 deploys into it. Delete the app before its storage account: a running host whose storage vanishes logs errors until it is removed, and the app\'s keys live in that storage. The idle Consumption plan the CLI created costs nothing and az group delete will catch it later.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Milestone: configure, observe, then tear the function app down and prove it is gone.',
      warning: 'Nothing here adds cost beyond cents for storage and telemetry. Deleting the function app removes its code and keys permanently; the project on your laptop is untouched and can be republished any time. The resource group is kept on purpose for Module 4; an empty group costs nothing.',
      checklist: [
        'Run `az functionapp config appsettings set --name cyberling-fn-<yourname> --resource-group cyberling-rg --settings LEDGER_OWNER=alice` and list the setting names with `... appsettings list --query "[].name" --output tsv`.',
        'Run `func azure functionapp logstream cyberling-fn-<yourname>` in one terminal; in another, POST `{"amount": -40}` with your key as in lesson 3-3 and watch the invocation appear. Stop the stream with Ctrl+C.',
        'In the portal, open the Application Insights resource named cyberling-fn-<yourname> and find the request under Live Metrics or Logs (optional, free).',
        'Delete the app: `az functionapp delete --name cyberling-fn-<yourname> --resource-group cyberling-rg`.',
        'Delete its telemetry: `az monitor app-insights component delete --app cyberling-fn-<yourname> --resource-group cyberling-rg` (the CLI may offer to install the application-insights extension; accept).',
        'Delete the storage account: `az storage account delete --name cyberlingstore<yourname> --resource-group cyberling-rg --yes`.',
        'Run `az functionapp show --name cyberling-fn-<yourname> --resource-group cyberling-rg` and read the error code in parentheses at the start of the message.',
        'Run `az resource list --resource-group cyberling-rg --output table`; an empty Consumption plan may remain and costs nothing. Remember that `az group delete --name cyberling-rg --yes` at the end of the track removes everything.',
      ],
      verify: { question: 'Type the error code (the word in parentheses) that az functionapp show printed for the deleted app.', answers: ['ResourceNotFound'] },
    },
  ],
};

export const m3: Module = {
  id: 'az-m3',
  title: 'Compute: Functions',
  goal: 'Triggers, bindings, local development with Core Tools, deployment.',
  projectMilestone: 'A Function that classifies an entry.',
  status: 'available',
  lessons: [l31, l32, l33, l34],
};
