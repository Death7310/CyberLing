import type { Lesson, Module } from '../../schema';

const l41: Lesson = {
  id: 'az-4-1',
  title: 'PaaS web hosting: plans and web apps',
  objective: 'Explain what an App Service plan pays for, what a web app is, and which SKU costs nothing.',
  minutes: 25,
  lexicon: [
    { id: 'az.4.appservice', term: 'App Service', kind: 'service', meaning: 'Azure\'s managed web host: you hand it a web application (code or container) and it runs the process, patches the OS, terminates TLS and gives you a public hostname.', example: 'az webapp create --name cyberling-api-sam --plan cyberling-plan --runtime "DOTNETCORE:8.0"', analogy: 'A landlord who keeps the building running. Closest AWS idea is Elastic Beanstalk, not Lambda: the process is always there, not started per request.' },
    { id: 'az.4.plan', term: 'App Service plan', kind: 'service', meaning: 'The compute you rent: operating system, size (SKU) and instance count. The plan is what is billed, whether or not an app inside it is running.', example: 'az appservice plan create --name cyberling-plan --resource-group cyberling-rg --sku F1 --is-linux' },
    { id: 'az.4.sku', term: 'SKU (F1, B1, S1, P1v3)', kind: 'concept', meaning: 'The pricing tier of a plan. F1 is free with hard limits; B1 is the cheapest paid tier; S1 adds slots and autoscale.', example: 'az appservice plan update --name cyberling-plan --resource-group cyberling-rg --sku B1' },
    { id: 'az.4.webapp', term: 'web app', kind: 'service', meaning: 'One deployed application inside a plan, with its own hostname <name>.azurewebsites.net, settings and logs. Several apps can share a plan.', example: 'az webapp show --name cyberling-api-sam --resource-group cyberling-rg --query state' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A plan is compute; a web app is a tenant of the plan',
      body: `App Service is **platform as a service**: you deploy an ASP.NET Core project and Azure runs the Kestrel process for you, keeps it alive, patches the operating system, terminates HTTPS and hands you a hostname. You never see a virtual machine.

Two resources are involved, and the distinction decides your bill:

- An **App Service plan** is the compute: Linux or Windows, a **SKU** (size and tier) and a number of instances. The plan is billed by the hour **as long as it exists**, even with zero apps or a stopped app inside it. The exception is the **F1 Free** SKU, which costs nothing and in return limits you to 60 CPU-minutes a day, 1 GB of storage, no Always On, no custom domains and no deployment slots.
- A **web app** lives inside a plan. It has the hostname \`<name>.azurewebsites.net\` (so the name must be globally unique), its own app settings, and its own logs.

.NET 8 runs on Linux plans, which are cheaper and the default in this track. Code gets in by **zip deploy**, by \`az webapp up\` (which zips and builds for you) or by a GitHub Actions workflow pushing on every commit.`,
      example: {
        language: 'shell',
        source: 'az group create --name cyberling-rg --location westeurope\naz appservice plan create --name cyberling-plan --resource-group cyberling-rg --sku F1 --is-linux\naz webapp create --name cyberling-api-<yourname> --resource-group cyberling-rg --plan cyberling-plan --runtime "DOTNETCORE:8.0"\naz webapp show --name cyberling-api-<yourname> --resource-group cyberling-rg --query "{state:state, host:defaultHostName}"',
        labels: [
          { lines: [1, 1], label: 'Make sure the project\'s resource group exists (idempotent).' },
          { lines: [2, 2], label: 'Rent the compute: a free Linux plan.' },
          { lines: [3, 3], label: 'Create an empty .NET 8 web app inside that plan; this fixes the public hostname.' },
          { lines: [4, 4], label: 'Read back the two facts you care about: is it Running, and where.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'API Gateway + Lambda starts a handler per request and bills per invocation; App Service keeps one Kestrel process running and bills for the plan by the hour. The nearest AWS service is Elastic Beanstalk. There is no AWS twin of the "plan shared by several apps" idea; each Beanstalk environment owns its instances.' }],
    },
    {
      kind: 'predict',
      prompt: 'You create the plan below and then stop the web app inside it for a month. Which statement about cost is true?',
      code: { language: 'shell', source: 'az appservice plan create --name demo-plan --resource-group demo-rg --sku B1 --is-linux\naz webapp create --name demo-api-9931 --resource-group demo-rg --plan demo-plan --runtime "DOTNETCORE:8.0"\naz webapp stop --name demo-api-9931 --resource-group demo-rg' },
      choices: [
        'B1 is billed for the whole month: the plan exists, and a stopped app does not stop the plan',
        'Nothing is billed: a stopped app uses no compute',
        'Only storage is billed; compute stops with the app',
        'B1 is free for the first 12 months like F1',
      ],
      answer: 'B1 is billed for the whole month: the plan exists, and a stopped app does not stop the plan',
      explanation: 'The plan is the billed unit. Stopping or even deleting the app leaves the B1 plan running the meter. Only F1 is free, and it pays for that with a 60 CPU-minute daily cap, no Always On, no custom domains and no slots. To stop paying, delete the plan (or scale it to F1).',
    },
    {
      kind: 'parsons',
      prompt: 'Order the lifecycle of a web app from nothing to clean teardown.',
      language: 'text',
      indentation: false,
      solution: [
        'Create or confirm the resource group cyberling-rg',
        'Create a Linux App Service plan with --sku F1',
        'Create the web app inside the plan with a globally unique name',
        'Deploy the code (zip deploy or az webapp up)',
        'Test the public hostname with curl',
        'Delete the web app, then delete the plan',
      ],
      distractors: [
        'Stop the web app so the plan stops billing',
        'Pick a Windows plan because the API is written in C#',
      ],
      explanation: 'The plan must exist before the app, and the app must be gone before the plan can be deleted. Stopping an app never stops a paid plan, and .NET 8 runs happily on the cheaper Linux plans.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill the flags that make this plan free and Linux, and attach a .NET 8 app to it.',
      language: 'shell',
      template: 'az appservice plan create --name cyberling-plan --resource-group cyberling-rg --sku {{sku}} {{linux}}\naz webapp create --name cyberling-api-sam --resource-group cyberling-rg --plan {{plan}} --runtime "{{runtime}}"',
      blanks: [
        { id: 'sku', answers: ['F1'], hint: 'The free tier, not the cheapest paid one.' },
        { id: 'linux', answers: ['--is-linux'], hint: 'Without it you get a Windows plan.' },
        { id: 'plan', answers: ['cyberling-plan'], hint: 'The plan you just created.' },
        { id: 'runtime', answers: ['DOTNETCORE:8.0', 'DOTNETCORE|8.0'], hint: 'az webapp list-runtimes --os linux shows the exact spelling.' },
      ],
      explanation: 'The plan carries the OS and SKU; the app carries the runtime and the public name.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Create an empty web app in your subscription and read its state back.',
      warning: 'F1 is free: no hourly charge, 60 CPU-minutes a day. Do not use B1 or higher in this lesson; a paid plan bills by the hour as long as it exists, even with the app stopped.',
      checklist: [
        'Run `az group create --name cyberling-rg --location westeurope` (or the region nearest you); it is harmless if the group already exists.',
        'Run `az appservice plan create --name cyberling-plan --resource-group cyberling-rg --sku F1 --is-linux`.',
        'Run `az webapp create --name cyberling-api-<yourname> --resource-group cyberling-rg --plan cyberling-plan --runtime "DOTNETCORE:8.0"`. If the name is taken, change <yourname>.',
        'Open `https://cyberling-api-<yourname>.azurewebsites.net` in a browser: you should see the default "Your web app is running and waiting for your content" page.',
        'Run `az webapp show --name cyberling-api-<yourname> --resource-group cyberling-rg --query state --output tsv`.',
        'Keep the plan and app for the next lesson, which deploys into them. If you stop here instead, tear down: `az webapp delete --name cyberling-api-<yourname> --resource-group cyberling-rg` then `az appservice plan delete --name cyberling-plan --resource-group cyberling-rg --yes`.',
      ],
      verify: { question: 'Type the exact value that `az webapp show --query state --output tsv` printed for your new app.', answers: ['Running'] },
    },
  ],
};

const l42: Lesson = {
  id: 'az-4-2',
  title: 'Deploying the LedgerSharp API with az webapp up',
  objective: 'Publish the minimal API from your machine to a public HTTPS hostname and prove GET /balance answers.',
  minutes: 30,
  lexicon: [
    { id: 'az.4.webapp-up', term: 'az webapp up', kind: 'pattern', meaning: 'One command that zips the current project folder, creates the plan and app if they are missing, uploads the zip and builds it on the server. Re-run with no flags to redeploy: it remembers its arguments in .azure/config.', example: 'az webapp up --name cyberling-api-sam --resource-group cyberling-rg --plan cyberling-plan --runtime "DOTNETCORE:8.0" --sku F1 --os-type Linux' },
    { id: 'az.4.publish', term: 'dotnet publish -c Release', kind: 'pattern', meaning: 'Compile the project in Release configuration and lay out everything the runtime needs in bin/Release/net8.0/publish. App Service runs exactly this output.', example: 'dotnet publish -c Release' },
    { id: 'az.4.hostname', term: '<name>.azurewebsites.net', kind: 'concept', meaning: 'The default hostname of every web app, with HTTPS already working. Because it is a global DNS name, two learners cannot both own cyberling-api.', example: 'curl -i https://cyberling-api-sam.azurewebsites.net/balance' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'From a project folder to a public URL',
      body: `LedgerSharp already runs locally: \`dotnet run\` starts Kestrel, \`GET /balance\` returns \`{"balance": 0}\` and \`POST /entries\` accepts JSON. Deploying changes none of the code. App Service runs the same \`dotnet LedgerSharp.Api.dll\` and injects the port Kestrel should listen on.

\`az webapp up\` does the whole trip. Run it **from the project folder** (where the \`.csproj\` is). It zips the folder, creates the plan and app if they do not exist yet, uploads the zip, and lets the build service (Oryx) run \`dotnet publish\` on the server. Afterwards it writes the names it used into \`.azure/config\`, so a bare \`az webapp up\` later redeploys the same app.

Run \`dotnet publish -c Release\` first anyway: if it fails on your machine, it will fail on the server too, and the local error message is far easier to read than a remote build log.

Then test the real thing: \`curl -i\` shows the status line and headers, not just the body.`,
      example: {
        language: 'shell',
        source: 'cd LedgerSharp.Api\ndotnet publish -c Release\naz webapp up --name cyberling-api-<yourname> --resource-group cyberling-rg --plan cyberling-plan --runtime "DOTNETCORE:8.0" --sku F1 --os-type Linux --location westeurope\ncurl -i https://cyberling-api-<yourname>.azurewebsites.net/balance',
        labels: [
          { lines: [1, 2], label: 'Stand in the project folder and prove it builds in Release before leaving your machine.' },
          { lines: [3, 3], label: 'Create (or reuse) plan and app, upload the folder, build it remotely.' },
          { lines: [4, 4], label: 'Hit the public URL and read the status line: 200 and a JSON body with the key balance.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'With API Gateway you created routes and integrations by hand and the Lambda zip had to match a handler signature. App Service has no route table of its own: every path goes to your Kestrel process and ASP.NET routing decides. `az webapp up` is closest to `sam deploy`, except nothing is declared in a template yet (module 7 fixes that with Bicep).' }],
    },
    {
      kind: 'predict',
      prompt: 'The deployed Program.cs maps only these two routes. What status code does the curl at the bottom print?',
      code: { language: 'csharp', source: 'app.MapGet("/balance", () => Results.Ok(new { balance = ledger.Balance }));\napp.MapPost("/entries", (Entry e) => { ledger.Add(e); return Results.Created("/entries", e); });\n\n// in the terminal:\n// curl -s -o /dev/null -w "%{http_code}" https://cyberling-api-sam.azurewebsites.net/entries' },
      choices: ['405: the path exists but only POST is mapped', '404: there is no GET /entries', '200: curl follows the route to the handler', '502: App Service rejects unmapped requests'],
      answer: '405: the path exists but only POST is mapped',
      explanation: 'curl sends GET by default. ASP.NET Core endpoint routing matches the path /entries to an endpoint, finds that no endpoint accepts GET, and answers 405 Method Not Allowed. A path with no endpoint at all (say /nothing) would be 404. App Service itself never answers for your routes; it only forwards to Kestrel.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the commands that take LedgerSharp from your laptop to a tested public URL.',
      language: 'shell',
      indentation: false,
      solution: [
        'cd LedgerSharp.Api',
        'dotnet publish -c Release',
        'az webapp up --name cyberling-api-<yourname> --resource-group cyberling-rg --plan cyberling-plan --runtime "DOTNETCORE:8.0" --sku F1 --os-type Linux',
        'curl -i https://cyberling-api-<yourname>.azurewebsites.net/balance',
      ],
      distractors: [
        'dotnet run -c Release',
        'az webapp create --name cyberling-api-<yourname> --resource-group cyberling-rg --plan cyberling-plan --runtime "DOTNETCORE:8.0"',
        'curl -i http://localhost:5000/balance',
      ],
      explanation: '`dotnet run` starts the API on your machine and never ships anything. `az webapp create` only makes an empty app; `az webapp up` both creates and deploys. Testing localhost proves nothing about the cloud copy.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the deployment command and the smoke test.',
      language: 'shell',
      template: 'dotnet {{publish}} -c Release\naz webapp {{up}} --name cyberling-api-sam --resource-group cyberling-rg --plan cyberling-plan --runtime "DOTNETCORE:8.0" --sku {{sku}} --os-type Linux\ncurl -i https://cyberling-api-sam.{{domain}}/balance',
      blanks: [
        { id: 'publish', answers: ['publish'], hint: 'Builds the deployable output, not just the binaries.' },
        { id: 'up', answers: ['up'], hint: 'The one-shot create-and-deploy verb.' },
        { id: 'sku', answers: ['F1'], hint: 'Free.' },
        { id: 'domain', answers: ['azurewebsites.net'], hint: 'Every web app gets a hostname under this domain.' },
      ],
    },
    {
      kind: 'fieldwork',
      prompt: 'Deploy LedgerSharp and verify it from the public internet.',
      warning: 'Stay on --sku F1: it is free. A deployment uses a few seconds of the daily 60 CPU-minutes. If `az webapp up` complains that a Free Linux plan already exists in the group, pass `--plan cyberling-plan` so it reuses the one from the previous lesson.',
      checklist: [
        'In the LedgerSharp.Api folder, run `dotnet publish -c Release` and fix any error before continuing.',
        'Run `az webapp up --name cyberling-api-<yourname> --resource-group cyberling-rg --plan cyberling-plan --runtime "DOTNETCORE:8.0" --sku F1 --os-type Linux --location westeurope` (or your region). It prints the public URL at the end.',
        'Run `curl -i https://cyberling-api-<yourname>.azurewebsites.net/balance`. Read the status line and confirm the body is JSON with the key `balance`.',
        'Run `curl -s -o /dev/null -w "%{http_code}\\n" https://cyberling-api-<yourname>.azurewebsites.net/entries` and confirm you predicted it right.',
        'Look at `.azure/config` in the project folder; this is why a bare `az webapp up` redeploys later.',
        'Keep the app for the next lesson. If you stop here, tear down: `az webapp delete --name cyberling-api-<yourname> --resource-group cyberling-rg` then `az appservice plan delete --name cyberling-plan --resource-group cyberling-rg --yes`.',
      ],
      verify: { question: 'Type the HTTP status code from the first line of `curl -i .../balance` against your deployed app.', answers: ['200'] },
    },
  ],
};

const l43: Lesson = {
  id: 'az-4-3',
  title: 'Configuration: app settings, connection strings, slots, logs',
  objective: 'Move a value out of the code into an app setting, read it with IConfiguration, and watch the live log.',
  minutes: 30,
  lexicon: [
    { id: 'az.4.appsettings', term: 'app settings', kind: 'concept', meaning: 'Key/value pairs stored on the web app and injected into the process as environment variables. Changing one restarts the app.', example: 'az webapp config appsettings set --name cyberling-api-sam --resource-group cyberling-rg --settings LEDGER_OWNER=sam' },
    { id: 'az.4.iconfiguration', term: 'IConfiguration', kind: 'builtin', meaning: 'ASP.NET Core\'s single view over appsettings.json, environment variables and user secrets. `app.Configuration["KEY"]` returns the value or null.', example: 'var owner = app.Configuration["LEDGER_OWNER"] ?? "unknown";' },
    { id: 'az.4.connstr', term: 'connection string setting', kind: 'concept', meaning: 'A setting stored in a separate, redacted list. App Service exposes it as an environment variable with a type prefix (CUSTOMCONNSTR_Name) and ASP.NET maps it to ConnectionStrings:Name.', example: 'builder.Configuration.GetConnectionString("Storage")' },
    { id: 'az.4.slot', term: 'deployment slot', kind: 'service', meaning: 'A second copy of the app (staging) with its own hostname. Swapping exchanges the code and most settings with production; settings marked "slot setting" stay put. Needs Standard tier or above.', example: 'az webapp deployment slot swap --name cyberling-api-sam --resource-group cyberling-rg --slot staging', analogy: 'Lambda aliases move a pointer between versions; a slot swap moves whole running processes, warmed up, and can carry settings with them.' },
    { id: 'az.4.logtail', term: 'az webapp log tail', kind: 'pattern', meaning: 'Stream the app\'s stdout and request log to your terminal, after application logging is switched on.', example: 'az webapp log tail --name cyberling-api-sam --resource-group cyberling-rg' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Settings live on the app, not in the code',
      body: `Anything that differs between your laptop and the cloud (an owner name, a storage connection string, a feature flag) belongs in an **app setting**. App Service stores the pairs on the web app and starts the process with them as **environment variables**. \`IConfiguration\` already reads environment variables, so \`app.Configuration["LEDGER_OWNER"]\` works unchanged locally (\`export LEDGER_OWNER=sam\`) and in Azure.

**Connection strings** are app settings with a separate, redacted list. Azure exposes one named \`Storage\` of type Custom as \`CUSTOMCONNSTR_Storage\`; ASP.NET's environment provider strips the prefix so \`GetConnectionString("Storage")\` finds it. You will use that in the next module.

**Deployment slots** (Standard tier and up, so not on F1) give you a staging copy with its own hostname. A **swap** exchanges staging and production: the code moves, and so do the settings, **except** those marked *slot setting*, which stay with their slot. That is how a staging slot keeps pointing at a staging database after the swap.

Changing a setting restarts the app. When something looks wrong, switch on logging and stream it.`,
      example: {
        language: 'csharp',
        source: 'var builder = WebApplication.CreateBuilder(args);\nvar app = builder.Build();\n\napp.MapGet("/whoami", () =>\n{\n    var owner = app.Configuration["LEDGER_OWNER"] ?? "unknown";\n    return Results.Ok(new { owner });\n});\n\napp.Run();',
        labels: [
          { lines: [1, 2], label: 'Build the app; Configuration already includes environment variables.' },
          { lines: [4, 8], label: 'A route that reveals one setting, with a safe fallback when it is unset.' },
          { lines: [7, 7], label: 'Return JSON whose key is owner, so the value is visible to curl.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'Lambda environment variables ≈ app settings; both become process environment variables. Secrets Manager/Parameter Store ≈ Key Vault (module 6). There is no slot in API Gateway + Lambda; aliases and stages shift traffic between versions but do not carry configuration along the way a slot setting does.' }],
    },
    {
      kind: 'predict',
      prompt: 'Production has DB=prod-db marked as a slot setting and THEME=blue not marked. Staging has DB=stage-db (slot setting) and THEME=green. After `az webapp deployment slot swap --slot staging`, what does production have?',
      code: { language: 'text', source: 'production:  DB=prod-db  [slot setting]   THEME=blue\nstaging:     DB=stage-db [slot setting]   THEME=green\n\naz webapp deployment slot swap --name cyberling-api-sam --resource-group cyberling-rg --slot staging' },
      choices: ['DB=prod-db, THEME=green', 'DB=stage-db, THEME=green', 'DB=prod-db, THEME=blue', 'DB=stage-db, THEME=blue'],
      answer: 'DB=prod-db, THEME=green',
      explanation: 'A swap moves the code and the ordinary settings with it, so THEME travels from staging into production. A slot setting is pinned to its slot, so production keeps DB=prod-db and staging keeps DB=stage-db. That pin is the whole point: the staging copy never touches the production database, before or after the swap.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the /whoami route so that `curl .../whoami` returns {"owner": "..."} from the LEDGER_OWNER app setting. Indent with 4 spaces.',
      language: 'csharp',
      indentation: true,
      solution: [
        'app.MapGet("/whoami", () =>',
        '{',
        '    var owner = app.Configuration["LEDGER_OWNER"] ?? "unknown";',
        '    return Results.Ok(new { owner });',
        '});',
      ],
      distractors: [
        'app.MapPost("/whoami", () =>',
        '    var owner = app.Configuration["LEDGER-OWNER"] ?? "unknown";',
        '    return owner;',
      ],
      explanation: 'MapPost would make a plain curl GET answer 405. The setting is LEDGER_OWNER with an underscore; a hyphen is a different key and you would always get "unknown". Returning the bare string gives text/plain with no owner key, so nothing to verify against.',
    },
    {
      kind: 'cloze',
      prompt: 'Set the owner, restart, and stream the log.',
      language: 'shell',
      template: 'az webapp config {{group}} set --name cyberling-api-sam --resource-group cyberling-rg --settings {{pair}}\naz webapp {{restart}} --name cyberling-api-sam --resource-group cyberling-rg\naz webapp log config --name cyberling-api-sam --resource-group cyberling-rg --application-logging filesystem\naz webapp log {{tail}} --name cyberling-api-sam --resource-group cyberling-rg',
      blanks: [
        { id: 'group', answers: ['appsettings'], hint: 'The sub-command for plain key/value settings (connection strings have their own).' },
        { id: 'pair', answers: ['LEDGER_OWNER=sam'], hint: 'KEY=value, the key the C# code reads, value sam.' },
        { id: 'restart', answers: ['restart'], hint: 'Setting a value already restarts; this makes it explicit.' },
        { id: 'tail', answers: ['tail'], hint: 'Follow the log like tail -f.' },
      ],
      explanation: 'appsettings set, restart, log tail: the three commands you will run most often while debugging configuration.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Add the /whoami route, configure the owner in Azure, and read it back.',
      warning: 'Still free on F1. Slots are not available on F1 (Standard and above), so this fieldwork only reads about them; do not scale up to try a swap unless you accept hourly billing and delete the plan afterwards.',
      checklist: [
        'Add the /whoami route from the concept step to Program.cs. Run locally with `LEDGER_OWNER=<yourname> dotnet run` and `curl http://localhost:5000/whoami` (use the port dotnet prints).',
        'Redeploy with a bare `az webapp up` from the project folder (it reads .azure/config).',
        'Run `curl https://cyberling-api-<yourname>.azurewebsites.net/whoami`: you should see {"owner":"unknown"} because the setting is not there yet.',
        'Run `az webapp config appsettings set --name cyberling-api-<yourname> --resource-group cyberling-rg --settings LEDGER_OWNER=<yourname>`.',
        'Run `az webapp restart --name cyberling-api-<yourname> --resource-group cyberling-rg`, wait ten seconds, and curl /whoami again. The value is now your name.',
        'Run `az webapp log config --name cyberling-api-<yourname> --resource-group cyberling-rg --application-logging filesystem` then `az webapp log tail ...` in one terminal while you curl in another. Ctrl+C to stop.',
        'Keep the app for the last lesson, which tears it down. If you stop here, delete the app and the plan as in the previous lesson.',
      ],
      verify: { question: 'Type the JSON key name in the body that `curl .../whoami` returned after you set the app setting.', answers: ['owner'] },
    },
  ],
};

const l44: Lesson = {
  id: 'az-4-4',
  title: 'Scaling, HTTPS, custom domains, and teardown',
  objective: 'Distinguish scaling up from scaling out, know what TLS and domains cost, and delete the plan so nothing bills.',
  minutes: 30,
  lexicon: [
    { id: 'az.4.scale-up', term: 'scale up', kind: 'concept', meaning: 'Change the plan to a bigger SKU: more CPU and memory per instance, and more features (slots, autoscale). Done with az appservice plan update --sku.', example: 'az appservice plan update --name cyberling-plan --resource-group cyberling-rg --sku B1' },
    { id: 'az.4.scale-out', term: 'scale out', kind: 'concept', meaning: 'Run more instances of the same SKU behind the built-in load balancer. Every instance has its own memory, so in-process state diverges.', example: 'az appservice plan update --name cyberling-plan --resource-group cyberling-rg --number-of-workers 2' },
    { id: 'az.4.autoscale', term: 'autoscale rule', kind: 'service', meaning: 'An Azure Monitor rule that changes the instance count when a metric crosses a threshold (CPU > 70% for 5 minutes → +1). Standard tier and above.', example: 'az monitor autoscale rule create --autoscale-name cyberling-scale --resource-group cyberling-rg --condition "CpuPercentage > 70 avg 5m" --scale out 1' },
    { id: 'az.4.managed-cert', term: 'App Service managed certificate', kind: 'service', meaning: 'A free, auto-renewing TLS certificate for a custom domain you have pointed at the app. Needs a paid tier; the default azurewebsites.net hostname has HTTPS on every tier.', example: 'az webapp config ssl create --hostname api.example.com --name cyberling-api-sam --resource-group cyberling-rg' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Bigger box, more boxes, and what they cost',
      body: `**Scale up** means a bigger SKU: F1 → B1 → S1 → P1v3. Each step buys CPU and memory and unlocks features: Basic adds custom domains, Always On and a free managed certificate; Standard adds slots and autoscale. **Scale out** means more instances of the same SKU behind App Service's load balancer. The two are independent, and both are plan-level settings, so every app in the plan scales together.

**Autoscale rules** (Standard and above) watch a metric and adjust the instance count, with a floor and a ceiling so a bug cannot buy you fifty instances. A **health check** path (\`/healthz\`, say) lets the platform stop sending traffic to an instance that answers anything but 2xx.

HTTPS on \`<name>.azurewebsites.net\` is free on every tier and already on. For your own domain you add a CNAME, register the hostname on the app, and request a **managed certificate**: free, auto-renewed, paid tiers only. \`--https-only true\` redirects any plain HTTP request.

None of this is free except the redirect. Finish by deleting the web app and then the plan. Leave \`cyberling-rg\` in place: the storage account from module 2 lives there and module 5 needs it.`,
      example: {
        language: 'shell',
        source: 'az appservice plan update --name cyberling-plan --resource-group cyberling-rg --sku S1\naz appservice plan update --name cyberling-plan --resource-group cyberling-rg --number-of-workers 2\naz webapp update --name cyberling-api-<yourname> --resource-group cyberling-rg --https-only true\naz webapp config set --name cyberling-api-<yourname> --resource-group cyberling-rg --generic-configurations \'{"healthCheckPath": "/healthz"}\'\naz webapp delete --name cyberling-api-<yourname> --resource-group cyberling-rg\naz appservice plan delete --name cyberling-plan --resource-group cyberling-rg --yes',
        labels: [
          { lines: [1, 1], label: 'Scale up: a bigger, paid SKU (billed hourly from this moment).' },
          { lines: [2, 2], label: 'Scale out: two instances of that SKU, two bills.' },
          { lines: [3, 4], label: 'Force HTTPS and tell the load balancer which path means healthy.' },
          { lines: [5, 6], label: 'Teardown: app first, then the plan that bills. The resource group stays.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'Lambda scales out by itself and you never pick a size beyond memory; App Service makes both choices explicit and bills for them whether traffic arrives or not. Autoscale rules ≈ EC2 Auto Scaling policies. The managed certificate ≈ an ACM certificate (also free), but ACM attaches to a load balancer or CloudFront, not to the compute.' }],
    },
    {
      kind: 'predict',
      prompt: 'LedgerSharp still keeps its entries in a List<Entry> inside the process. You scale out to 3 instances, POST one entry, then GET /balance five times. What do you see?',
      code: { language: 'shell', source: 'az appservice plan update --name cyberling-plan --resource-group cyberling-rg --sku S1 --number-of-workers 3\ncurl -X POST -H "Content-Type: application/json" -d \'{"amount": -40, "note": "coffee"}\' https://cyberling-api-sam.azurewebsites.net/entries\nfor i in 1 2 3 4 5; do curl -s https://cyberling-api-sam.azurewebsites.net/balance; echo; done' },
      choices: [
        'Some responses say -40 and some say 0: each instance has its own list',
        'All five say -40: App Service replicates process memory across instances',
        'The scale-out is refused because the app holds state',
        'All five say 0: POSTs are only accepted on the first instance',
      ],
      answer: 'Some responses say -40 and some say 0: each instance has its own list',
      explanation: 'Scaling out starts three independent processes with three independent lists. The POST landed on one of them; the load balancer spreads the GETs, so the answer depends on which instance you hit. Nothing is replicated and nothing is refused. In-memory state and scale-out do not mix, which is why the next module moves entries into Table Storage.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the teardown so that nothing in module 4 keeps billing, while the resource group and its storage account survive for module 5.',
      language: 'shell',
      indentation: false,
      solution: [
        'az webapp delete --name cyberling-api-<yourname> --resource-group cyberling-rg',
        'az appservice plan delete --name cyberling-plan --resource-group cyberling-rg --yes',
        'az webapp show --name cyberling-api-<yourname> --resource-group cyberling-rg',
        'az resource list --resource-group cyberling-rg --output table',
      ],
      distractors: [
        'az group delete --name cyberling-rg --yes',
        'az webapp stop --name cyberling-api-<yourname> --resource-group cyberling-rg',
      ],
      explanation: 'The plan refuses to delete while it still hosts an app, so the app goes first. `az group delete` is the universal cleanup, but here it would also remove the module 2 storage account that module 5 builds on. Stopping an app leaves a paid plan billing.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill the flags: scale up to the cheapest paid tier, scale out to two instances, force HTTPS.',
      language: 'shell',
      template: 'az appservice plan update --name cyberling-plan --resource-group cyberling-rg --sku {{sku}}\naz appservice plan update --name cyberling-plan --resource-group cyberling-rg --number-of-workers {{workers}}\naz webapp update --name cyberling-api-sam --resource-group cyberling-rg --https-only {{https}}',
      blanks: [
        { id: 'sku', answers: ['B1'], hint: 'Basic, size 1.' },
        { id: 'workers', answers: ['2'], hint: 'Instances, not CPUs.' },
        { id: 'https', answers: ['true'], hint: 'A boolean flag value.' },
      ],
      explanation: '--sku changes the box; --number-of-workers changes how many boxes; --https-only is per app and free.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Milestone: LedgerSharp has run on App Service. Secure the hostname, then tear down so the bill is zero.',
      warning: 'Scaling up or out leaves F1 and bills by the hour from that minute until the plan is deleted. Everything in this checklist that costs money is marked optional; the teardown at the end is not optional.',
      checklist: [
        'Run `az webapp update --name cyberling-api-<yourname> --resource-group cyberling-rg --https-only true` (free), then `curl -i http://cyberling-api-<yourname>.azurewebsites.net/balance` and observe the 301 redirect to https.',
        'Optional, costs money: `az appservice plan update ... --sku B1`, then `--number-of-workers 2`, then repeat the predict experiment. Scale back down with `--sku F1 --number-of-workers 1` the moment you are done (F1 allows one instance).',
        'Read the Scale out blade in the portal for your plan: on F1 the autoscale option is greyed out with the tier that enables it. Note that tier.',
        'Teardown: `az webapp delete --name cyberling-api-<yourname> --resource-group cyberling-rg`.',
        'Teardown: `az appservice plan delete --name cyberling-plan --resource-group cyberling-rg --yes`.',
        'Run `az webapp show --name cyberling-api-<yourname> --resource-group cyberling-rg` and read the error. Then run `az resource list --resource-group cyberling-rg --output table`: only the storage account from module 2 (and anything from module 3 you kept) should remain. Do not delete cyberling-rg; module 5 needs it.',
      ],
      verify: { question: 'After teardown, `az webapp show` fails with an error whose code appears in parentheses at the start of the message. Type that code.', answers: ['ResourceNotFound'] },
    },
  ],
};

export const m4: Module = {
  id: 'az-m4',
  title: 'Web: App Service',
  goal: 'Deploying an ASP.NET Core API, configuration, slots.',
  projectMilestone: 'LedgerSharp API running on App Service.',
  status: 'available',
  lessons: [l41, l42, l43, l44],
};
