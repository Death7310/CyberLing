import type { Lesson, Module } from '../../schema';

/*
 * Module 3: Compute: Lambda.
 * The Ledger's classification rule becomes a function in the cloud: `cyberling-classify` (Python 3.12)
 * takes {"amount": -40} and returns {"kind": "expense"}. The learner writes the handler, deploys it with
 * the CLI, reads its logs, configures it, tests it locally and tears it down (function, log group, role).
 *
 * Fixed names used by every lesson: function cyberling-classify, role cyberling-lambda-role,
 * file app.py, handler app.handler, zip function.zip, env var CURRENCY=USD.
 */

const HANDLER_V1 = 'def handler(event, context):\n    amount = event.get("amount", 0)\n    if amount < 0:\n        kind = "expense"\n    else:\n        kind = "income"\n    return {"kind": kind}';

const HANDLER_V2 = 'import os\n\n\ndef handler(event, context):\n    amount = event.get("amount", 0)\n    currency = os.environ.get("CURRENCY", "unset")\n    kind = "expense" if amount < 0 else "income"\n    print(f"classified {amount} {currency} as {kind}")\n    return {"kind": kind, "currency": currency}';

const l31: Lesson = {
  id: 'aws-3-1',
  title: 'Functions as a service',
  objective: 'Explain what Lambda runs, write a handler that classifies a ledger entry, and predict its output from an event.',
  minutes: 25,
  lexicon: [
    { id: 'aws.3.lambda', term: 'Lambda', kind: 'service', meaning: 'Run a function without a server you manage. You upload code; AWS starts a copy when an event arrives, runs it once per event, and bills per request and per millisecond of memory-time.', example: 'aws lambda invoke --function-name cyberling-classify out.json', analogy: 'A vending machine for one recipe: insert an event, get a result, pay per press. It breaks here: the machine is sometimes cold and takes a second to warm up, and several can run at once.' },
    { id: 'aws.3.handler', term: 'def handler(event, context)', kind: 'pattern', meaning: 'The function Lambda calls. event is the input, already parsed from JSON into a dict (or list, str, number). context carries runtime facts (remaining time, request id). The return value is serialised back to JSON.', example: 'def handler(event, context):\n    return {"kind": "expense"}' },
    { id: 'aws.3.event', term: 'event', kind: 'concept', meaning: 'The input to one invocation, as Python data. Who calls the function decides its shape: a direct invoke passes exactly the JSON you give; API Gateway (Module 4) wraps the HTTP request in its own dict.', example: '{"amount": -40}   # arrives as event["amount"] == -40' },
    { id: 'aws.3.cold-start', term: 'cold start', kind: 'concept', meaning: 'The extra delay when Lambda must create a fresh copy of your function (download code, start Python, run module-level code) before calling the handler. Later invocations reuse the warm copy for a while.', example: 'First call: 300 ms. Next call a second later: 5 ms.', analogy: 'Opening a shop in the morning versus serving the next customer. It breaks here: AWS may open several shops at once under load and close any of them without telling you.' },
    { id: 'aws.3.timeout-memory', term: 'timeout / memory', kind: 'concept', meaning: 'Two limits you set per function. Timeout (default 3 s, max 15 min) kills a slow invocation. Memory (default 128 MB, 10 GB max) also scales the CPU share and is the price dimension: GB-seconds.', example: '--timeout 10 --memory-size 256' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Code that runs when something happens',
      body: `**Lambda** runs a function for you. You do not rent a machine; you upload code and name an entry point, the **handler**. When an **event** arrives (a direct invoke today, an HTTP request in Module 4) Lambda starts a copy of your code if none is warm, calls \`handler(event, context)\`, and serialises whatever you return to JSON.

\`event\` is the input already parsed from JSON into Python data; \`context\` is an object with the request id and the time remaining. Returning a dict is the normal case: Lambda turns it into a JSON object for the caller. A \`print\` does **not** go to the caller; it goes to the logs (lesson 3-3).

Three numbers matter. A **cold start** is the delay before the first call on a fresh copy. The **timeout** (default 3 s) stops a runaway invocation. **Memory** (default 128 MB) also sets your CPU share, and you pay per request plus per GB-second. The Lambda free tier (1 million requests and 400,000 GB-seconds a month) is "always free" on most accounts, which is why this module costs nothing measurable.

The project: a function \`cyberling-classify\` that applies the Ledger's rule, negative amounts are expenses, to one entry.`,
      example: {
        language: 'python',
        source: HANDLER_V1,
        labels: [
          { lines: [1, 1], label: 'The entry point Lambda calls. The name is yours; the two parameters are not.' },
          { lines: [2, 2], label: 'Read the input defensively: a missing amount is 0, not a KeyError.' },
          { lines: [3, 6], label: 'The Ledger\'s rule from the Python track: below zero is an expense.' },
          { lines: [7, 7], label: 'Return Python data; Lambda serialises it to {"kind": "..."} for the caller.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'This is a plain Python function with no main guard, no input(), no argparse. The "program" that calls it is Lambda itself, so there is nothing to run at module level, and anything you do put there runs once per cold start, not once per event.' },
        { from: 'python', note: '`return`, not `print`, is how a result leaves a handler, exactly as it was for the functions in Module 5. print still works; its output lands in CloudWatch Logs.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'Lambda invokes this handler with the event `{"amount": 0}`. What JSON does the caller receive?',
      code: { language: 'python', source: HANDLER_V1 },
      choices: ['{"kind": "income"}', '{"kind": "expense"}', '{"kind": null}', 'An error: amount must be negative or positive'],
      answer: '{"kind": "income"}',
      explanation: '`0 < 0` is False, so the else branch runs and kind is "income". That may or may not be what the Ledger wants for a zero entry; the point is that the boundary is decided by the handler, silently. Lesson 3-4 pins it down with a local test so a future change cannot flip it unnoticed. No error is possible here: the handler never raises for a number.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the classify handler. Indentation counts.',
      language: 'python',
      indentation: true,
      solution: [
        'def handler(event, context):',
        '    amount = event.get("amount", 0)',
        '    if amount < 0:',
        '        kind = "expense"',
        '    else:',
        '        kind = "income"',
        '    return {"kind": kind}',
      ],
      distractors: [
        'def handler(event):',
        '    return json.dumps({"kind": kind})',
        '    print({"kind": kind})',
      ],
      explanation: 'Lambda always passes two arguments, so a one-parameter handler fails on every call with a TypeError. Return Python data, not a JSON string: Lambda does the serialising, and a string you dumps yourself comes back double-encoded as "{\\"kind\\": ...}". print sends text to the logs; the caller sees null.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Write the handler and run it on your own machine, with no AWS involved yet.',
      warning: 'Cost is zero: nothing in this lesson touches your account. The file you write here is deployed in 3-2.',
      checklist: [
        'In a new empty directory, save the handler from the concept step as `app.py`.',
        'Call it the way Lambda will, from the shell: `python3 -c "import app; print(app.handler({\'amount\': -40}, None))"`.',
        'Call it again with `{\'amount\': 1200}` and with `{}` (no amount at all) and check all three answers against your prediction.',
        'Keep the directory; 3-2 zips it. Teardown: nothing was created in AWS.',
      ],
      verify: { question: 'For the event with amount -40, what value did the printed dict hold under "kind"? Type the word only.', answers: ['expense', '\'expense\'', '"expense"'] },
    },
  ],
};

const l32: Lesson = {
  id: 'aws-3-2',
  title: 'Deploying with the CLI',
  objective: 'Package a handler, give it an execution role, create the function with the CLI and invoke it.',
  minutes: 35,
  lexicon: [
    { id: 'aws.3.deployment-package', term: 'deployment package (zip)', kind: 'concept', meaning: 'The zip file Lambda unpacks into /var/task. Your files must sit at the top of the zip, not inside a folder, or the runtime cannot find app.handler.', example: 'zip function.zip app.py' },
    { id: 'aws.3.execution-role', term: 'execution role', kind: 'service', meaning: 'The IAM role Lambda assumes while running your code; it is where the function\'s credentials come from (the end of boto3\'s credential chain). Its trust policy must let lambda.amazonaws.com assume it.', example: 'aws iam create-role --role-name cyberling-lambda-role --assume-role-policy-document file://trust.json', analogy: 'A staff badge the function wears while on shift. It breaks here: a badge is checked at the door once; a role is checked on every single API call the function makes.' },
    { id: 'aws.3.basic-execution-role', term: 'AWSLambdaBasicExecutionRole', kind: 'service', meaning: 'An AWS-managed policy that allows exactly what every function needs: creating its log group and writing log events to CloudWatch. Attach it to the execution role; add nothing else until a lesson needs it.', example: 'aws iam attach-role-policy --role-name cyberling-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole' },
    { id: 'aws.3.create-invoke', term: 'create-function / invoke', kind: 'pattern', meaning: 'create-function uploads the zip and binds runtime, handler and role. invoke sends one event and writes the response body to the file you name; its own stdout is the status JSON.', example: 'aws lambda invoke --function-name cyberling-classify --cli-binary-format raw-in-base64-out --payload \'{"amount": -40}\' out.json' },
    { id: 'aws.3.query-output', term: '--query ... --output text', kind: 'pattern', meaning: 'Pick one field out of a CLI response (JMESPath) and print it bare, so it can feed another command. Works on every aws command.', example: 'aws iam get-role --role-name cyberling-lambda-role --query Role.Arn --output text' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Zip, role, create, invoke',
      body: `Deploying by hand is four moves, and each one teaches something Module 7 will later automate.

**Zip.** Lambda wants a **deployment package**: a zip with your files at the top level. \`app.py\` inside the zip plus \`--handler app.handler\` means "module app, function handler".

**Role.** Code needs an identity. An **execution role** is an IAM role whose *trust policy* lets the Lambda service assume it. Attach the managed policy **AWSLambdaBasicExecutionRole** so the function may write logs, and nothing more. IAM is eventually consistent: a role created one second ago may not yet be visible to Lambda, so a retry after ten seconds is normal, not a bug.

**Create.** \`aws lambda create-function\` binds name, runtime (\`python3.12\`), handler, role ARN and zip. The \`fileb://\` prefix means "binary file"; \`file://\` would try to read it as text.

**Invoke.** \`aws lambda invoke\` sends one event. Its stdout is a small status JSON (\`StatusCode\` 200 means Lambda ran the function, even if your code raised; a raised exception adds \`FunctionError\`). The function's return value goes to the output file you name. Since CLI v2, \`--payload\` is expected base64-encoded unless you pass \`--cli-binary-format raw-in-base64-out\`.`,
      example: {
        language: 'shell',
        source: 'zip function.zip app.py\ncat > trust.json <<\'EOF\'\n{"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}\nEOF\naws iam create-role --role-name cyberling-lambda-role --assume-role-policy-document file://trust.json\naws iam attach-role-policy --role-name cyberling-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole\nROLE_ARN=$(aws iam get-role --role-name cyberling-lambda-role --query Role.Arn --output text)\naws lambda create-function --function-name cyberling-classify --runtime python3.12 --handler app.handler --role "$ROLE_ARN" --zip-file fileb://function.zip\naws lambda invoke --function-name cyberling-classify --cli-binary-format raw-in-base64-out --payload \'{"amount": -40}\' out.json\ncat out.json',
        labels: [
          { lines: [1, 1], label: 'Package: app.py at the top level of the zip.' },
          { lines: [2, 4], label: 'Trust policy: the Lambda service, and only it, may assume this role.' },
          { lines: [5, 6], label: 'Create the role and let it write logs. Nothing else.' },
          { lines: [7, 7], label: 'Pull the role ARN out of the response as bare text, for the next command.' },
          { lines: [8, 8], label: 'Create: name, runtime, module.function, role, binary zip.' },
          { lines: [9, 10], label: 'Invoke with a raw JSON payload; the status goes to stdout, the result to out.json.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'The role is the last link of the credential chain from 2-3: inside Lambda, `boto3.client("s3")` finds the execution role\'s temporary keys with no configuration, which is why there is nothing to `aws configure` on a Lambda.' },
        { from: 'python', note: '`--handler app.handler` is the same dotted path as `from app import handler`: file name without .py, then the function.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'You run create-role, attach-role-policy and create-function in one script, with no pause between them. What is the most likely outcome of create-function?',
      code: { language: 'shell', source: 'aws iam create-role --role-name cyberling-lambda-role --assume-role-policy-document file://trust.json\naws iam attach-role-policy --role-name cyberling-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole\nROLE_ARN=$(aws iam get-role --role-name cyberling-lambda-role --query Role.Arn --output text)\naws lambda create-function --function-name cyberling-classify --runtime python3.12 --handler app.handler --role "$ROLE_ARN" --zip-file fileb://function.zip' },
      choices: [
        'It may fail with InvalidParameterValueException: the role cannot be assumed by Lambda, and succeed if rerun a few seconds later',
        'It always succeeds, because get-role returned the ARN so the role exists',
        'It fails with AccessDenied because the IAM user may not create functions',
        'It succeeds but the function has no permissions until the policy propagates',
      ],
      answer: 'It may fail with InvalidParameterValueException: the role cannot be assumed by Lambda, and succeed if rerun a few seconds later',
      explanation: 'IAM is eventually consistent. get-role reads from the region you asked, but the Lambda service checks the trust policy through its own path, which may lag by several seconds. The error text is "The role defined for the function cannot be assumed by Lambda." Wait ten seconds and rerun; nothing is wrong with the role. Scripts and Module 7\'s templates handle this with retries. The policy attachment is separate and can also lag, but create-function does not check it.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the deployment so that every command has what it needs.',
      language: 'shell',
      indentation: false,
      solution: [
        'zip function.zip app.py',
        'aws iam create-role --role-name cyberling-lambda-role --assume-role-policy-document file://trust.json',
        'aws iam attach-role-policy --role-name cyberling-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
        'ROLE_ARN=$(aws iam get-role --role-name cyberling-lambda-role --query Role.Arn --output text)',
        'aws lambda create-function --function-name cyberling-classify --runtime python3.12 --handler app.handler --role "$ROLE_ARN" --zip-file fileb://function.zip',
        'aws lambda invoke --function-name cyberling-classify --cli-binary-format raw-in-base64-out --payload \'{"amount": -40}\' out.json',
      ],
      distractors: [
        'aws lambda create-function --function-name cyberling-classify --runtime python3.12 --handler app.py --role "$ROLE_ARN" --zip-file fileb://function.zip',
        'aws lambda create-function --function-name cyberling-classify --runtime python3.12 --handler app.handler --role "$ROLE_ARN" --zip-file file://function.zip',
        'aws iam attach-role-policy --role-name cyberling-lambda-role --policy-arn AWSLambdaBasicExecutionRole',
      ],
      explanation: 'The role must exist before create-function names it, and the zip before it is uploaded. `--handler app.py` is a file name, not module.function; the runtime would report "Handler app.py missing". `file://` reads the zip as text and corrupts it: binary needs `fileb://`. attach-role-policy wants the full policy ARN, not the bare name.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill in the create and invoke commands.',
      language: 'shell',
      template: 'aws lambda create-function --function-name cyberling-classify --runtime {{runtime}} --handler {{handler}} --role "$ROLE_ARN" --zip-file {{zip}}\naws lambda invoke --function-name cyberling-classify --cli-binary-format {{fmt}} --payload \'{"amount": -40}\' out.json',
      blanks: [
        { id: 'runtime', answers: ['python3.12'], hint: 'Language and version, no space, no hyphen.' },
        { id: 'handler', answers: ['app.handler'], hint: 'module.function, as in from app import handler.' },
        { id: 'zip', answers: ['fileb://function.zip'], hint: 'The binary-file prefix, then the zip name.' },
        { id: 'fmt', answers: ['raw-in-base64-out'], hint: 'Raw JSON in, base64 out. CLI v2 otherwise expects base64 input.' },
      ],
      explanation: 'Runtime names are fixed strings (python3.12, python3.13, nodejs22.x). The handler is module.function. fileb:// marks binary. The binary-format flag is the single most common reason a first `invoke` fails with "Invalid base64".',
    },
    {
      kind: 'fieldwork',
      prompt: 'Deploy cyberling-classify and invoke it.',
      warning: 'Lambda free tier: 1 million requests and 400,000 GB-seconds per month, always free on most accounts; this lesson uses a handful of requests. A function that is not invoked costs nothing, and an IAM role costs nothing. Only the log group written by invocations holds data (a few kilobytes, free tier 5 GB); 3-4 deletes it.',
      checklist: [
        'In the directory with `app.py` from 3-1, run `zip function.zip app.py` and check with `unzip -l function.zip` that app.py is at the top level.',
        'Save the trust policy from the concept step as `trust.json`, then `aws iam create-role --role-name cyberling-lambda-role --assume-role-policy-document file://trust.json`.',
        'Attach logging permission: `aws iam attach-role-policy --role-name cyberling-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole`.',
        'Capture the ARN: `ROLE_ARN=$(aws iam get-role --role-name cyberling-lambda-role --query Role.Arn --output text)` and `echo "$ROLE_ARN"`.',
        'Create: `aws lambda create-function --function-name cyberling-classify --runtime python3.12 --handler app.handler --role "$ROLE_ARN" --zip-file fileb://function.zip`. If it says the role cannot be assumed, wait ten seconds and rerun.',
        'Wait until it is ready: `aws lambda wait function-active-v2 --function-name cyberling-classify`.',
        'Invoke: `aws lambda invoke --function-name cyberling-classify --cli-binary-format raw-in-base64-out --payload \'{"amount": -40}\' out.json` and then `cat out.json`. Expect {"kind": "expense"}.',
        'Invoke twice more with amounts 1200 and 0 and compare with 3-1. Notice the first invoke was slower (cold start).',
        'Teardown: if you are stopping for more than a day, `aws lambda delete-function --function-name cyberling-classify` (the role and log group are removed in 3-4). Otherwise keep it: 3-3 configures it.',
      ],
      verify: { question: 'The invoke command printed a small JSON object to the terminal. What number is the value of its StatusCode field?', answers: ['200'] },
    },
  ],
};

const l33: Lesson = {
  id: 'aws-3-3',
  title: 'Logs and configuration',
  objective: 'Find a function\'s output in CloudWatch Logs, change its environment and limits from the CLI, and update its code in place.',
  minutes: 30,
  lexicon: [
    { id: 'aws.3.log-group', term: '/aws/lambda/<name>', kind: 'service', meaning: 'The CloudWatch Logs log group Lambda creates on the first invocation of a function. Inside it, one log stream per warm copy; each invocation writes START, your prints, END and a REPORT line with duration and memory.', example: 'aws logs tail /aws/lambda/cyberling-classify --since 10m', analogy: 'A filing cabinet (group) of notebooks (streams), one per worker. It breaks here: the cabinet outlives the function; deleting the function leaves the logs, and their storage, behind.' },
    { id: 'aws.3.logs-tail', term: 'aws logs tail --follow', kind: 'pattern', meaning: 'Print recent events from a log group and keep printing as new ones arrive. Logs reach CloudWatch a few seconds after the invocation; --follow waits for them.', example: 'aws logs tail /aws/lambda/cyberling-classify --follow' },
    { id: 'aws.3.environment', term: 'environment variables', kind: 'concept', meaning: 'Key-value settings stored on the function and exposed to your code through os.environ. Configuration lives here; code stays the same across environments. Setting them replaces the whole set, not one key.', example: 'aws lambda update-function-configuration --function-name cyberling-classify --environment "Variables={CURRENCY=USD}"' },
    { id: 'aws.3.update-function', term: 'update-function-code / -configuration', kind: 'pattern', meaning: 'Two commands that change a deployed function: one swaps the zip, the other changes settings (environment, timeout, memory, handler). Both are asynchronous; `aws lambda wait function-updated` blocks until done.', example: 'aws lambda update-function-code --function-name cyberling-classify --zip-file fileb://function.zip' },
    { id: 'aws.3.version-alias', term: '$LATEST, versions, aliases', kind: 'concept', meaning: '$LATEST is the mutable copy you edit. publish-version freezes it as an immutable number; an alias (prod) is a name that points at a version and can be moved. You invoke $LATEST unless you say otherwise.', example: 'aws lambda publish-version --function-name cyberling-classify\naws lambda create-alias --function-name cyberling-classify --name prod --function-version 1' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Where print goes, and how to change a running function',
      body: `Inside Lambda, **stdout and stderr are the logs**. Every \`print\` becomes an event in the CloudWatch Logs **log group** \`/aws/lambda/cyberling-classify\`, which Lambda created at your first invoke using the permission from AWSLambdaBasicExecutionRole. Each invocation adds START, your lines, END and a REPORT with duration, billed duration and memory used. \`aws logs tail\` reads them; \`--follow\` keeps waiting, which you need because events arrive a few seconds late.

Configuration that differs between environments (a currency, a table name) belongs in **environment variables**, read with \`os.environ.get\`. \`update-function-configuration --environment\` sets them, and **replaces the whole set**: to add one variable you must repeat the others. The same command changes \`--timeout\` and \`--memory-size\`. New code goes up with \`update-function-code\`. Both are asynchronous: invoking during an update fails with ResourceConflictException, so wait with \`aws lambda wait function-updated\`.

You have been editing **$LATEST**. \`publish-version\` freezes a numbered, immutable copy; an **alias** such as \`prod\` points at a version so callers never name numbers. Module 7 will manage these for you; today it is enough to know they exist.`,
      example: {
        language: 'python',
        source: HANDLER_V2,
        labels: [
          { lines: [1, 1], label: 'os.environ is how a handler reads its environment variables.' },
          { lines: [5, 6], label: 'Read the event and the configuration; default to "unset" so a missing variable is visible, not a crash.' },
          { lines: [7, 8], label: 'Classify, then print one line for the logs. The caller never sees it.' },
          { lines: [9, 9], label: 'Return both facts to the caller.' },
        ],
      },
      contrast: [
        { from: 'python', note: '`os.environ.get("CURRENCY", "unset")` is the dict .get with a default you used for `event.get`; environment variables are a dict of strings the operating system hands to the process. On your laptop you set one with `CURRENCY=USD python3 app.py`; on Lambda, with update-function-configuration.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'You deploy this handler and invoke it with `{"amount": -40}`, writing the result to out.json. Where does the text "classified -40 ..." appear?',
      code: { language: 'python', source: HANDLER_V2 },
      choices: [
        'Only in the CloudWatch log group /aws/lambda/cyberling-classify',
        'In out.json, before the JSON result',
        'In the terminal that ran aws lambda invoke',
        'Nowhere: print is disabled inside Lambda',
      ],
      answer: 'Only in the CloudWatch log group /aws/lambda/cyberling-classify',
      explanation: 'The handler runs on a machine you never see; its stdout is captured and shipped to CloudWatch Logs. out.json receives only the serialised return value, {"kind": "expense", "currency": ...}; the terminal shows the invoke status JSON. print is not disabled, it is simply redirected, which is exactly what makes it useful for debugging.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill in the commands that set the variable, wait for the update, invoke and read the logs.',
      language: 'shell',
      template: 'aws lambda update-function-configuration --function-name cyberling-classify --environment "Variables={{{var}}}"\naws lambda wait {{wait}} --function-name cyberling-classify\naws lambda invoke --function-name cyberling-classify --cli-binary-format raw-in-base64-out --payload \'{"amount": -40}\' out.json\naws logs tail {{group}} --since 5m',
      blanks: [
        { id: 'var', answers: ['CURRENCY=USD'], hint: 'KEY=value, inside the braces. Several would be separated by commas.' },
        { id: 'wait', answers: ['function-updated'], hint: 'The waiter that returns once a configuration or code update has finished.' },
        { id: 'group', answers: ['/aws/lambda/cyberling-classify'], hint: 'Lambda log groups are always /aws/lambda/ followed by the function name.' },
      ],
      explanation: 'The shorthand `Variables={KEY=value,KEY2=value2}` is the CLI\'s compact map syntax; quoting it protects the braces from the shell. Waiting avoids ResourceConflictException on the next invoke. The log group name is derived from the function name, so you never have to look it up.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the steps to ship the new handler, configure it and watch the log line appear.',
      language: 'shell',
      indentation: false,
      solution: [
        'zip function.zip app.py',
        'aws lambda update-function-code --function-name cyberling-classify --zip-file fileb://function.zip',
        'aws lambda wait function-updated --function-name cyberling-classify',
        'aws lambda update-function-configuration --function-name cyberling-classify --environment "Variables={CURRENCY=USD}"',
        'aws lambda wait function-updated --function-name cyberling-classify',
        'aws lambda invoke --function-name cyberling-classify --cli-binary-format raw-in-base64-out --payload \'{"amount": -40}\' out.json',
        'aws logs tail /aws/lambda/cyberling-classify --since 5m',
      ],
      distractors: [
        'aws lambda create-function --function-name cyberling-classify --runtime python3.12 --handler app.handler --zip-file fileb://function.zip',
        'export CURRENCY=USD',
        'aws logs tail cyberling-classify --since 5m',
      ],
      explanation: 'The function exists, so create-function would fail with ResourceConflictException; code changes go through update-function-code. `export` sets a variable in your shell, which the function on AWS never sees. Log groups carry the /aws/lambda/ prefix; the bare function name is not a log group.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Give the function a currency and read what it says about itself.',
      warning: 'A few invocations and a few kilobytes of logs: free tier. The log group is the one resource in this module that stores data and would keep storing it as long as the function is invoked; 3-4 deletes it along with the function.',
      checklist: [
        'Replace `app.py` with the handler from the concept step (the one that reads CURRENCY and prints a line). Re-zip: `zip function.zip app.py`.',
        'Ship the code: `aws lambda update-function-code --function-name cyberling-classify --zip-file fileb://function.zip`, then `aws lambda wait function-updated --function-name cyberling-classify`.',
        'Invoke once before configuring: `aws lambda invoke --function-name cyberling-classify --cli-binary-format raw-in-base64-out --payload \'{"amount": -40}\' out.json && cat out.json`. Expect currency "unset".',
        'Set the variable: `aws lambda update-function-configuration --function-name cyberling-classify --environment "Variables={CURRENCY=USD}"`, then wait with `aws lambda wait function-updated --function-name cyberling-classify`.',
        'Invoke again with the same payload and `cat out.json`. Expect {"kind": "expense", "currency": "USD"}.',
        'Read the logs: `aws logs tail /aws/lambda/cyberling-classify --since 10m`. Find both of your printed lines among START/END/REPORT, and note the Duration on the REPORT lines.',
        'Optional: in a second terminal run `aws logs tail /aws/lambda/cyberling-classify --follow`, invoke from the first, and watch the line arrive a few seconds later.',
        'Optional: `aws lambda update-function-configuration --function-name cyberling-classify --timeout 10 --memory-size 256` and confirm with `aws lambda get-function-configuration --function-name cyberling-classify --query "[Timeout,MemorySize]"`.',
        'Teardown: if you are stopping for more than a day, `aws lambda delete-function --function-name cyberling-classify` and `aws logs delete-log-group --log-group-name /aws/lambda/cyberling-classify`. Otherwise keep both: 3-4 is the milestone and removes everything.',
      ],
      verify: { question: 'Copy the line your handler printed for the USD invocation, exactly as it appears in the log (without the timestamp).', answers: ['classified -40 USD as expense'] },
    },
  ],
};

const l34: Lesson = {
  id: 'aws-3-4',
  title: 'Project: test it locally, then take it down',
  objective: 'Test the handler on your machine with no network, reason about event shapes and idempotency, then delete the function, its log group and its role.',
  minutes: 30,
  lexicon: [
    { id: 'aws.3.local-test', term: 'handler(event, None)', kind: 'pattern', meaning: 'Call the handler directly from a test with a hand-built event dict and None for context. No deploy, no network, milliseconds per run. Only code that touches AWS needs the cloud to be tested.', example: 'assert handler({"amount": -40}, None) == {"kind": "expense", "currency": "unset"}' },
    { id: 'aws.3.event-shape', term: 'event shape', kind: 'concept', meaning: 'The structure of the dict a particular caller sends. A direct invoke sends your JSON as-is; API Gateway sends a dict whose "body" is a JSON *string* you must json.loads. Tests should use the shape the real caller will send.', example: '{"body": "{\\"amount\\": -40}"}   # what API Gateway will send in Module 4' },
    { id: 'aws.3.idempotent', term: 'idempotent', kind: 'concept', meaning: 'Calling the function twice with the same event has the same effect as calling it once. Lambda may retry an invocation after a failure, so handlers that write (Module 5) must be safe to repeat; a pure classifier is idempotent for free.', example: 'handler(e, None) == handler(e, None)   # same answer, no side effects', analogy: 'Pressing an elevator button twice: the lift comes once. It breaks here: an elevator is idempotent by design; a handler that appends a row is not, until you make it so.' },
    { id: 'aws.3.delete-cleanup', term: 'delete-function / delete-log-group / delete-role', kind: 'pattern', meaning: 'The three deletes that undo this module, in that order. Deleting a function leaves its log group and its role behind; a role with attached policies cannot be deleted until they are detached.', example: 'aws lambda delete-function --function-name cyberling-classify\naws logs delete-log-group --log-group-name /aws/lambda/cyberling-classify\naws iam detach-role-policy ... && aws iam delete-role --role-name cyberling-lambda-role' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A handler is just a function',
      body: `Everything in \`app.py\` that does not call AWS can be tested the way Module 8 taught: import it, call it with a known input, \`assert\` the exact output. Pass a dict for \`event\` and \`None\` for \`context\`; the classifier never looks at context. No deploy, no network, no cost, and it runs in milliseconds, so you can afford a test for every boundary, including the \`amount: 0\` case you predicted in 3-1.

Two ideas matter for the tests you write next module. **Event shape**: a direct invoke delivers your JSON unchanged, but API Gateway (Module 4) wraps the HTTP request, and the body arrives as a JSON *string* under \`"body"\`. A handler written for one shape breaks on the other, so tests should use the real caller's shape. **Idempotency**: Lambda may retry an invocation that failed part-way, so calling the handler twice with the same event must be harmless. A classifier with no side effects is idempotent by construction; the DynamoDB writer in Module 5 will have to earn it.

Then the milestone: remove the function, the log group it left behind, and the role, and prove the function is gone.`,
      example: {
        language: 'python',
        source: 'from app import handler\n\n\ndef test_negative_is_expense():\n    assert handler({"amount": -40}, None)["kind"] == "expense"\n\n\ndef test_zero_is_income():\n    assert handler({"amount": 0}, None)["kind"] == "income"\n\n\ndef test_missing_amount_defaults_to_income():\n    assert handler({}, None)["kind"] == "income"\n\n\ndef test_same_event_same_answer():\n    event = {"amount": -15}\n    assert handler(event, None) == handler(event, None)\n\n\nif __name__ == "__main__":\n    tests = [test_negative_is_expense, test_zero_is_income, test_missing_amount_defaults_to_income, test_same_event_same_answer]\n    for t in tests:\n        t()\n    print(f"{len(tests)} passed")',
        labels: [
          { lines: [1, 1], label: 'Import the handler exactly as Lambda names it: module app, function handler.' },
          { lines: [4, 5], label: 'The rule itself, on the example the module is built around.' },
          { lines: [8, 13], label: 'Boundaries: zero, and a missing field. Both are decisions the handler makes silently.' },
          { lines: [16, 18], label: 'Idempotency for a pure function: same event, same answer.' },
          { lines: [21, 25], label: 'The Module 8 runner: call each test, report the count.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'This is the test-function pattern from Module 8 (`def test_...():` with assert), unchanged. The only cloud-specific part is passing None where Lambda would pass a context object.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'An HTML form posts amounts as text, so a future caller sends this event. What happens?',
      code: { language: 'python', source: 'from app import handler\n\nprint(handler({"amount": "-40"}, None))' },
      choices: [
        'TypeError: \'<\' not supported between instances of \'str\' and \'int\'',
        '{"kind": "expense", "currency": "unset"}',
        '{"kind": "income", "currency": "unset"}',
        'ValueError: invalid literal for int()',
      ],
      answer: 'TypeError: \'<\' not supported between instances of \'str\' and \'int\'',
      explanation: 'The handler compares `"-40" < 0`, and Python refuses to order a str against an int. No int() call is made, so there is no ValueError. Deployed, this would be an invoke with StatusCode 200 and a FunctionError field, with the traceback in the log group. A local test that sends the real caller\'s shape catches it in a millisecond; Module 4 adds the conversion when the HTTP shape arrives.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the local test file.',
      language: 'python',
      template: 'from app import {{fn}}\n\n\ndef test_negative_is_expense():\n    assert handler({"amount": -40}, {{ctx}})["kind"] == "{{neg}}"\n\n\ndef test_zero_is_income():\n    assert handler({"amount": 0}, None)["kind"] == "{{zero}}"',
      blanks: [
        { id: 'fn', answers: ['handler'], hint: 'The name after the dot in --handler app.handler.' },
        { id: 'ctx', answers: ['None'], hint: 'The classifier ignores context, so pass nothing meaningful.' },
        { id: 'neg', answers: ['expense'], hint: 'Below zero.' },
        { id: 'zero', answers: ['income'], hint: 'You predicted this in 3-1: 0 < 0 is False.' },
      ],
      explanation: 'The import mirrors the handler string Lambda uses. None stands in for the context object. The two expected strings pin the rule and its boundary so a later edit cannot change them unnoticed.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the teardown so each command can succeed, ending with the proof that the function is gone.',
      language: 'shell',
      indentation: false,
      solution: [
        'aws lambda delete-function --function-name cyberling-classify',
        'aws logs delete-log-group --log-group-name /aws/lambda/cyberling-classify',
        'aws iam detach-role-policy --role-name cyberling-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
        'aws iam delete-role --role-name cyberling-lambda-role',
        'aws lambda get-function --function-name cyberling-classify',
      ],
      distractors: [
        'aws logs delete-log-group --log-group-name cyberling-classify',
        'aws iam delete-role-policy --role-name cyberling-lambda-role --policy-name AWSLambdaBasicExecutionRole',
        'aws lambda delete-function --function-name /aws/lambda/cyberling-classify',
      ],
      explanation: 'Deleting the function does not delete its log group, and deleting the role fails (DeleteConflict) while a policy is attached, so detach first. The log group has the /aws/lambda/ prefix and the function does not. delete-role-policy removes an *inline* policy; AWSLambdaBasicExecutionRole is a *managed* policy, which is detached, not deleted.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Milestone: prove the handler locally, then remove the function, its logs and its role.',
      warning: 'The tests cost nothing: they never leave your machine. After the teardown nothing from this module exists, so nothing can be billed. If any delete fails, fix it before you stop: a leftover function costs nothing until invoked, but a leftover log group keeps its data, and a leftover role is clutter that makes the next audit harder.',
      checklist: [
        'In the directory with `app.py`, save the test file from the concept step as `test_app.py` and run `python3 test_app.py`. Expect `4 passed`.',
        'Break the rule on purpose: change `< 0` to `<= 0` in app.py, rerun, and read which test fails and why. Put it back and rerun.',
        'Try the string event from the predict step: `python3 -c "from app import handler; print(handler({\'amount\': \'-40\'}, None))"`. Read the traceback.',
        'Delete the function: `aws lambda delete-function --function-name cyberling-classify`.',
        'Delete the logs it left behind: `aws logs delete-log-group --log-group-name /aws/lambda/cyberling-classify`.',
        'Detach, then delete the role: `aws iam detach-role-policy --role-name cyberling-lambda-role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole` and `aws iam delete-role --role-name cyberling-lambda-role`.',
        'Prove it: `aws lambda get-function --function-name cyberling-classify` and read the error. Also `aws lambda list-functions --query "Functions[].FunctionName"` should not show it, and `aws logs describe-log-groups --log-group-name-prefix /aws/lambda/cyberling` should print an empty list.',
        'Keep `app.py`, `test_app.py` and `trust.json`: Module 4 redeploys the function behind an HTTP API, and Module 7 writes all of this as a template.',
      ],
      verify: { question: 'get-function printed "An error occurred (...) when calling the GetFunction operation". Type the error code in the parentheses.', answers: ['ResourceNotFoundException'] },
    },
  ],
};

export const m3: Module = {
  id: 'aws-m3',
  title: 'Compute: Lambda',
  goal: 'Functions, handlers, events, environment variables, logs.',
  projectMilestone: 'A Lambda that classifies an entry.',
  status: 'available',
  lessons: [l31, l32, l33, l34],
};
