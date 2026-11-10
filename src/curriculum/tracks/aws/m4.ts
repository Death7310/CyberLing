import type { Lesson, Module } from '../../schema';

const l41: Lesson = {
  id: 'aws-4-1',
  title: 'HTTP for builders',
  objective: 'Read an HTTP exchange (method, path, headers, body, status code) and choose the right status code for a request.',
  minutes: 25,
  lexicon: [
    { id: 'aws.4.method', term: 'GET / POST / PUT / DELETE', kind: 'keyword', meaning: 'The verb of an HTTP request. GET reads, POST creates or triggers, PUT replaces, DELETE removes. The verb plus the path is what a server routes on.', example: 'curl -X POST https://api.example.com/entries' },
    { id: 'aws.4.status', term: 'status code', kind: 'concept', meaning: 'A three-digit number on the first line of every response saying how it went: 2xx success, 4xx the client asked wrongly, 5xx the server failed.', example: 'HTTP/2 201', analogy: 'The first word of a reply ("yes", "what?", "sorry") before any detail. The analogy breaks because codes are fixed numbers that programs branch on, not free text.' },
    { id: 'aws.4.header', term: 'header', kind: 'concept', meaning: 'A name: value line sent before the body, describing the body or the request. Content-Type says what format the body is in.', example: "-H 'Content-Type: application/json'" },
    { id: 'aws.4.curl', term: 'curl -i', kind: 'builtin', meaning: 'Command-line HTTP client. -i prints the response status line and headers with the body; -X sets the method, -d sends a body, -H adds a header.', example: 'curl -i -X POST https://api.example.com/entries -H \'Content-Type: application/json\' -d \'{"amount": -40}\'' },
    { id: 'aws.4.idempotent', term: 'idempotent', kind: 'concept', meaning: 'Doing it twice has the same effect as once. GET, PUT and DELETE are meant to be idempotent; POST is not, so a retried POST can create two entries.', example: 'DELETE /entries/42 twice: the second answers 404, but the system state is the same.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Request, response, and the number that matters',
      body: `The Ledger is about to get a front door. Everything that walks through it is an **HTTP request**: a method (GET, POST), a path (\`/entries\`), headers (\`Content-Type: application/json\`) and, for POST and PUT, a body. Every reply is an **HTTP response**: a status line with a three-digit code, headers, then a body.

The code is the contract. \`200\` means fine, \`201\` means something was created, \`400\` means the request was malformed, \`404\` means no such path, \`500\` means the server broke. Your Lambda will choose these numbers; clients will branch on them without reading the body.

One more word: **idempotent**. Repeating a GET or a DELETE changes nothing further; repeating a POST may create a second entry. That decides whether a client may retry blindly.

\`curl\` shows all of this. \`-i\` prints the status line and headers, which is where the truth is.`,
      example: {
        language: 'shell',
        source: 'curl -i -X POST https://api.example.com/entries \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"amount": -40}\'\nHTTP/2 201\ncontent-type: application/json\n\n{"kind": "expense"}',
        labels: [
          { lines: [1, 3], label: 'Send a POST to the /entries path with a JSON body, and say so in a header.' },
          { lines: [4, 4], label: 'Status line: the server created something.' },
          { lines: [5, 5], label: 'Response header: the body is JSON.' },
          { lines: [7, 7], label: 'Body: the JSON the server (soon your Lambda) returned.' },
        ],
      },
      contrast: [{ from: 'python', note: 'In the Python track your program read input() and wrote print(). The request body is the input, the response body is the output, and the status code plays the role of the exit code: a number for the caller, not for the human.' }],
    },
    {
      kind: 'predict',
      prompt: 'The server receives this, stores a new entry successfully, and wants to say exactly that. Which status line is the precise reply?',
      code: { language: 'shell', source: 'curl -i -X POST https://api.example.com/entries \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"amount": -40}\'' },
      choices: ['HTTP/2 201', 'HTTP/2 200', 'HTTP/2 204', 'HTTP/2 302'],
      answer: 'HTTP/2 201',
      explanation: '201 Created is the precise answer to a POST that made something. 200 is not wrong, only vaguer: the Lambda in this module answers 200 because it only classifies and stores nothing; in Module 5, once it writes an item, it will answer 201. 204 means success with no body, and 302 is a redirect.',
    },
    {
      kind: 'predict',
      prompt: 'A typo in the path. What status code should come back?',
      code: { language: 'shell', source: 'curl -i -X POST https://api.example.com/entires \\\n  -d \'{"amount": -40}\'' },
      choices: ['404 Not Found', '400 Bad Request', '500 Internal Server Error', '200 OK with an empty body'],
      answer: '404 Not Found',
      explanation: 'There is no route for /entires, so the right answer is 404: the request was well formed but names something that does not exist. 400 is for a malformed request, 500 for a server failure. Returning 200 with nothing would hide the bug from the client.',
    },
    {
      kind: 'predict',
      prompt: 'The body is missing its closing brace. What should a well-written server answer?',
      code: { language: 'shell', source: 'curl -i -X POST https://api.example.com/entries \\\n  -H \'Content-Type: application/json\' \\\n  -d \'{"amount": -40\'' },
      choices: ['400 Bad Request: the client sent something the server could not parse', '500 Internal Server Error: json.loads raised', '404 Not Found', '201 Created with an empty entry'],
      answer: '400 Bad Request: the client sent something the server could not parse',
      explanation: 'The fault is in the request, so the code should be in the 4xx family: 400. If the handler lets json.loads raise instead of catching it, the platform turns the crash into a 500, which truthfully says "the server broke" but blames the wrong side. Catching parse errors and answering 400 is the handler\'s job.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the curl command that creates an entry and shows the response status line.',
      language: 'shell',
      template: 'curl {{show}} -X {{method}} https://api.example.com/entries \\\n  -H \'{{header}}: application/json\' \\\n  -d \'{"amount": -40}\'',
      blanks: [
        { id: 'show', answers: ['-i', '--include'], hint: 'The flag that includes the status line and headers in the output.' },
        { id: 'method', answers: ['POST'], hint: 'The verb for creating something.' },
        { id: 'header', answers: ['Content-Type', 'content-type'], hint: 'The header that names the body\'s format.' },
      ],
      explanation: '-i shows the status line; POST creates; Content-Type tells the server how to read the body. Header names are case-insensitive, so either spelling works.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Read a real HTTP exchange from your terminal. No AWS account needed yet.',
      warning: 'Nothing here touches your AWS account or costs anything. example.com is a public demonstration site run by IANA.',
      checklist: [
        'Check curl is installed: `curl --version`. It ships with macOS, most Linux distributions and Windows 10 and later.',
        'Run `curl -i https://example.com/` and find the status line and the `content-type` header above the HTML body.',
        'Run `curl -i https://example.com/no-such-page` and read the status line. Whatever the number, notice that the server answered with a code rather than crashing.',
        'Run `curl -i -X POST https://example.com/ -d \'{"amount": -40}\'` and compare. A static site has no idea what to do with your JSON; that gap is what API Gateway and your Lambda fill in the next lessons.',
        'Write down the three status codes your Ledger API will use on purpose: 200/201 for success, 400 for a bad body, 404 for an unknown path.',
      ],
      verify: { question: 'What status code did `curl -i https://example.com/` print on its first line?', answers: ['200'] },
    },
  ],
};

const l42: Lesson = {
  id: 'aws-4-2',
  title: 'Routes, integrations and the proxy event',
  objective: 'Describe how API Gateway routes a request to a Lambda and adapt the handler to the proxy event and response shapes.',
  minutes: 30,
  lexicon: [
    { id: 'aws.4.http-api', term: 'HTTP API', kind: 'service', meaning: 'API Gateway\'s lighter, cheaper API type (the apigatewayv2 CLI service). It routes requests to a Lambda or another HTTP endpoint. The older REST API type adds request validation, API keys, usage plans and caching at several times the price.', example: 'aws apigatewayv2 create-api --name cyberling-ledger --protocol-type HTTP' },
    { id: 'aws.4.route', term: 'route key', kind: 'concept', meaning: 'A method plus a path, written "POST /entries", mapped to an integration. The special key "$default" catches everything no other route matches.', example: "--route-key 'POST /entries'" },
    { id: 'aws.4.integration', term: 'integration', kind: 'concept', meaning: 'What a route hands the request to: a Lambda function (proxy integration) or an HTTP URL. One integration can serve many routes.', example: 'aws apigatewayv2 get-integrations --api-id abc123' },
    { id: 'aws.4.stage', term: 'stage', kind: 'concept', meaning: 'A deployed, addressable copy of the API with its own URL. The "$default" stage has no path prefix and auto-deploys every change.', example: 'https://abc123.execute-api.us-east-1.amazonaws.com/entries' },
    { id: 'aws.4.proxy-event', term: 'event["body"]', kind: 'pattern', meaning: 'In the proxy event API Gateway sends to a Lambda, the request body arrives as a string, exactly as the client sent it. Parse it with json.loads; return a dict with statusCode and a string body.', example: 'body = json.loads(event["body"])' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'A front door that speaks JSON to your function',
      body: `**API Gateway** is the managed front door: it listens on a public HTTPS address, matches each request to a **route** (\`POST /entries\`) and passes it to an **integration**, here your Lambda. There are two API types. **HTTP APIs** (CLI service \`apigatewayv2\`) are simple and cheap, about one dollar per million requests. **REST APIs** (CLI service \`apigateway\`) cost several times more and add request validation, API keys, usage plans and caching. The Ledger needs none of that, so we build an HTTP API.

Routes are deployed to a **stage**, a copy of the API with its own URL. We keep the \`$default\` stage: it auto-deploys and adds no path prefix.

The Lambda receives the request as a **proxy event**, a dict with \`routeKey\`, \`rawPath\`, \`headers\` and \`body\`. The body is a *string*, untouched. The Lambda must return a dict with \`statusCode\` and a string \`body\`; API Gateway turns that into the HTTP response. The Module 3 handler read \`event["amount"]\` directly; this version unwraps the request and wraps the reply.`,
      example: {
        language: 'python',
        source: 'import json\n\n\ndef classify(amount):\n    return "expense" if amount < 0 else "income"\n\n\ndef handler(event, context):\n    body = json.loads(event["body"])\n    kind = classify(body["amount"])\n    return {\n        "statusCode": 200,\n        "headers": {"Content-Type": "application/json"},\n        "body": json.dumps({"kind": kind}),\n    }',
        labels: [
          { lines: [4, 5], label: 'The rule from Module 3, unchanged.' },
          { lines: [9, 9], label: 'Unwrap the request: the body arrives as a string, so parse it.' },
          { lines: [10, 10], label: 'Apply the rule to the parsed amount.' },
          { lines: [11, 15], label: 'Wrap the reply: a status code, a header, and the result serialized back to a string.' },
        ],
      },
      contrast: [{ from: 'python', note: 'json.loads and json.dumps are the functions you used to read and write ledger.json. The "file" is now a request body in one direction and a response body in the other; the serializing is the same.' }],
    },
    {
      kind: 'predict',
      prompt: 'This handler sits behind an HTTP API. A client sends `curl -X POST .../entries -d \'{"amount": -40}\'`. What happens?',
      code: { language: 'python', source: 'def handler(event, context):\n    amount = event["body"]["amount"]\n    return {"statusCode": 200, "body": json.dumps({"kind": classify(amount)})}' },
      choices: [
        'TypeError: string indices must be integers, because event["body"] is the raw string \'{"amount": -40}\'',
        'It works: API Gateway parses JSON bodies before invoking the function',
        'KeyError: \'body\', because the body is under event["payload"]',
        'It returns {"kind": "expense"} with status 500',
      ],
      answer: 'TypeError: string indices must be integers, because event["body"] is the raw string \'{"amount": -40}\'',
      explanation: 'API Gateway does not parse the body; it might not even be JSON. event["body"] is a str, and indexing a str with "amount" raises TypeError. The exception ends the invocation, Lambda logs the traceback to CloudWatch, and API Gateway answers the client with a generic 500 Internal Server Error. The fix is one call: json.loads(event["body"]).',
    },
    {
      kind: 'predict',
      prompt: 'The handler forgets the response shape and returns a plain dict. The API is an HTTP API with the default payload format (2.0). What does the client see?',
      code: { language: 'python', source: 'def handler(event, context):\n    body = json.loads(event["body"])\n    return {"kind": classify(body["amount"])}' },
      choices: [
        '200 with body {"kind": "expense"}: HTTP APIs infer a 200 and JSON-encode a plain dict',
        '500, because the response has no statusCode',
        '200 with an empty body',
        '502 Bad Gateway: malformed Lambda proxy response',
      ],
      answer: '200 with body {"kind": "expense"}: HTTP APIs infer a 200 and JSON-encode a plain dict',
      explanation: 'A convenience specific to HTTP APIs with payload format 2.0: a response without statusCode is treated as the body, with status 200 and Content-Type application/json. REST APIs and payload format 1.0 answer 502 "Malformed Lambda proxy response" instead. Writing statusCode and json.dumps explicitly works everywhere and is the only way to answer 201, 400 or 404.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the handler so it unwraps the proxy event and wraps the response.',
      language: 'python',
      template: 'def handler(event, context):\n    body = json.{{loads}}(event["{{bodykey}}"])\n    kind = classify(body["amount"])\n    return {\n        "{{status}}": 200,\n        "headers": {"Content-Type": "application/json"},\n        "body": json.{{dumps}}({"kind": kind}),\n    }',
      blanks: [
        { id: 'loads', answers: ['loads'], hint: 'String to Python object.' },
        { id: 'bodykey', answers: ['body'], hint: 'The event key holding the request body string.' },
        { id: 'status', answers: ['statusCode'], hint: 'camelCase; the key API Gateway reads for the HTTP status.' },
        { id: 'dumps', answers: ['dumps'], hint: 'Python object to string.' },
      ],
      explanation: 'loads on the way in, dumps on the way out, and statusCode (camelCase, API Gateway\'s spelling) chooses the HTTP status.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Teach your Module 3 function the proxy shape, then invoke it with a hand-made proxy event. No API yet: this isolates the handler change.',
      warning: 'One code upload and two Lambda invocations, inside Lambda\'s always-free tier (1 million requests a month). Nothing new is created, so there is nothing to tear down.',
      checklist: [
        'Find the file and handler name your function is configured with: `aws lambda get-function-configuration --function-name cyberling-classify --query Handler --output text` (for example `lambda_function.handler` means file lambda_function.py, function handler).',
        'Save the worked-example handler under that file name and zip it: `zip function.zip lambda_function.py`.',
        'Deploy: `aws lambda update-function-code --function-name cyberling-classify --zip-file fileb://function.zip`.',
        'Write `event.json` shaped like a proxy event: `{"routeKey": "POST /entries", "rawPath": "/entries", "body": "{\\"amount\\": -40}"}`. The body is a string, so its inner quotes are escaped.',
        'Invoke: `aws lambda invoke --function-name cyberling-classify --cli-binary-format raw-in-base64-out --payload file://event.json out.json` then `cat out.json`.',
        'Invoke again with the Module 3 shape `{"amount": -40}` and read the error in out.json: the handler now expects a body string. This is the KeyError the proxy shape prevents.',
        'Nothing was created in this lesson; the function stays for the next one.',
      ],
      verify: { question: 'out.json from the proxy-shaped invoke is a JSON object with a numeric field whose value is 200. Type that field\'s name.', answers: ['statusCode'] },
    },
  ],
};

const l43: Lesson = {
  id: 'aws-4-3',
  title: 'Wiring the API to the Lambda',
  objective: 'Create an HTTP API with a POST /entries route to the Lambda, grant API Gateway permission to invoke it, and test it with curl.',
  minutes: 30,
  lexicon: [
    { id: 'aws.4.create-api', term: 'apigatewayv2 create-api --target', kind: 'pattern', meaning: 'Quick create: one command makes an HTTP API, a Lambda proxy integration, a $default route and a $default auto-deploying stage. It prints ApiId and ApiEndpoint.', example: 'aws apigatewayv2 create-api --name cyberling-ledger --protocol-type HTTP --target arn:aws:lambda:us-east-1:123456789012:function:cyberling-classify' },
    { id: 'aws.4.add-permission', term: 'lambda add-permission', kind: 'pattern', meaning: 'A resource-based policy statement on the function allowing another service principal to invoke it. Without it API Gateway is denied and the client sees a 500.', example: 'aws lambda add-permission --function-name cyberling-classify --statement-id apigw-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:us-east-1:123456789012:abc123/*"' },
    { id: 'aws.4.create-route', term: 'create-route --route-key', kind: 'pattern', meaning: 'Attach a method-and-path to an integration. The target is written integrations/<integration-id>, never the function ARN.', example: "aws apigatewayv2 create-route --api-id abc123 --route-key 'POST /entries' --target integrations/xyz789" },
    { id: 'aws.4.invoke-url', term: 'ApiEndpoint', kind: 'concept', meaning: 'The public base URL of the API: https://<api-id>.execute-api.<region>.amazonaws.com. Routes on the $default stage hang directly off it.', example: 'curl -X POST https://abc123.execute-api.us-east-1.amazonaws.com/entries -d \'{"amount": -40}\'' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Create, permit, route, call',
      body: `Three commands connect the internet to your function, plus one test.

\`create-api\` with \`--target\` is **quick create**: API Gateway makes the API, a Lambda proxy integration pointing at the target ARN, a \`$default\` route that matches every request, and a \`$default\` stage that auto-deploys. It prints \`ApiId\` and \`ApiEndpoint\`.

The Lambda will still refuse the call. IAM denies by default, and API Gateway is just another caller. \`lambda add-permission\` adds a statement to the function's own policy: the principal \`apigateway.amazonaws.com\` may \`lambda:InvokeFunction\`, limited by \`--source-arn\` to this one API. The console does this for you; the CLI does not.

Then replace the catch-all with a real route: read the integration id from \`get-integrations\`, \`create-route\` with key \`POST /entries\`, and delete the \`$default\` route so unknown paths get a 404 instead of reaching your code.

Finally \`curl -i\`. Read the status code first.`,
      example: {
        language: 'shell',
        source: 'FN_ARN=$(aws lambda get-function --function-name cyberling-classify --query Configuration.FunctionArn --output text)\naws apigatewayv2 create-api --name cyberling-ledger --protocol-type HTTP --target "$FN_ARN"\naws lambda add-permission --function-name cyberling-classify --statement-id apigw-invoke \\\n  --action lambda:InvokeFunction --principal apigateway.amazonaws.com \\\n  --source-arn "arn:aws:execute-api:us-east-1:<account-id>:<api-id>/*"\naws apigatewayv2 get-integrations --api-id <api-id>\naws apigatewayv2 create-route --api-id <api-id> --route-key \'POST /entries\' --target integrations/<integration-id>\naws apigatewayv2 get-routes --api-id <api-id>\naws apigatewayv2 delete-route --api-id <api-id> --route-id <route-id of $default>\ncurl -i -X POST https://<api-id>.execute-api.us-east-1.amazonaws.com/entries -d \'{"amount": -40}\'',
        labels: [
          { lines: [1, 1], label: 'Look up the function ARN the API will target.' },
          { lines: [2, 2], label: 'Quick create: API, integration, $default route and $default stage in one call. Note ApiId and ApiEndpoint.' },
          { lines: [3, 5], label: 'Allow API Gateway, and only this API, to invoke the function.' },
          { lines: [6, 7], label: 'Find the integration id and give it a real route.' },
          { lines: [8, 9], label: 'Remove the catch-all so unmatched paths answer 404.' },
          { lines: [10, 10], label: 'Test from outside: status code first, then body.' },
        ],
      },
      contrast: [{ from: 'python', note: 'boto3 has the same verbs: boto3.client("apigatewayv2").create_api(Name=..., ProtocolType="HTTP", Target=...). Snake_case method, CamelCase keyword arguments, same output keys as the CLI.' }],
    },
    {
      kind: 'predict',
      prompt: 'You ran create-api and curl, but skipped add-permission. What does curl print?',
      code: { language: 'shell', source: 'aws apigatewayv2 create-api --name cyberling-ledger --protocol-type HTTP --target "$FN_ARN"\ncurl -i -X POST https://<api-id>.execute-api.us-east-1.amazonaws.com/entries -d \'{"amount": -40}\'' },
      choices: [
        'HTTP/2 500 with {"message":"Internal Server Error"}: API Gateway was denied when invoking the function',
        'HTTP/2 403 Forbidden from the Lambda',
        'HTTP/2 200 with {"kind": "expense"}: quick create grants the permission',
        'HTTP/2 404 Not Found',
      ],
      answer: 'HTTP/2 500 with {"message":"Internal Server Error"}: API Gateway was denied when invoking the function',
      explanation: 'CLI quick create does not add the invoke permission (the console does, silently). Lambda denies API Gateway, and API Gateway reports a generic 500 to the client. The tell-tale sign: the function\'s CloudWatch log group has no new entries, because the function never ran.',
    },
    {
      kind: 'predict',
      prompt: 'The route POST /entries exists and the $default route is deleted. A client sends a GET to the same path. What comes back?',
      code: { language: 'shell', source: 'curl -i https://<api-id>.execute-api.us-east-1.amazonaws.com/entries' },
      choices: [
        'HTTP/2 404 with {"message":"Not Found"}: no route key matches GET /entries',
        'HTTP/2 405 Method Not Allowed',
        'HTTP/2 200 with {"kind": ...}: the path matches',
        'HTTP/2 500: the Lambda crashed on a missing body',
      ],
      answer: 'HTTP/2 404 with {"message":"Not Found"}: no route key matches GET /entries',
      explanation: 'A route key is method plus path. GET /entries is not a key you created, so HTTP APIs answer 404 Not Found (they do not distinguish 405). Had you kept the $default route, the GET would have reached the Lambda, which would raise KeyError on the missing body and the client would see a 500.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the commands as the lesson ran them, each one using an id printed by the one before.',
      language: 'shell',
      indentation: false,
      solution: [
        'aws apigatewayv2 create-api --name cyberling-ledger --protocol-type HTTP --target <function arn>',
        'Note ApiId and ApiEndpoint from the output',
        'aws lambda add-permission --function-name cyberling-classify --statement-id apigw-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn <execute-api arn ending in /*>',
        'aws apigatewayv2 get-integrations --api-id <api-id>',
        "aws apigatewayv2 create-route --api-id <api-id> --route-key 'POST /entries' --target integrations/<integration-id>",
        "curl -i -X POST <ApiEndpoint>/entries -d '{\"amount\": -40}'",
      ],
      distractors: [
        'aws apigatewayv2 create-api --name cyberling-ledger --protocol-type REST --target <function arn>',
        'aws lambda add-permission --function-name cyberling-classify --statement-id apigw-invoke --action lambda:InvokeFunction --principal lambda.amazonaws.com --source-arn <execute-api arn ending in /*>',
        "aws apigatewayv2 create-route --api-id <api-id> --route-key 'POST /entries' --target <function arn>",
      ],
      explanation: 'The API id comes from create-api, so the permission and the integration lookup come after it; the route needs the integration id. "REST" is not a protocol type (REST APIs are the separate apigateway service); the caller to permit is apigateway.amazonaws.com, not lambda; and a route targets integrations/<id>, never the function ARN.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Put your Lambda behind an HTTP API and call it from the internet.',
      warning: 'HTTP APIs bill per request (about 1 USD per million) with 1 million free per month for the first 12 months; an idle API costs nothing. The Lambda calls stay inside the always-free tier. Delete the API if you stop here all the same: the habit matters more than the cents.',
      checklist: [
        'Get the function ARN: `aws lambda get-function --function-name cyberling-classify --query Configuration.FunctionArn --output text`.',
        'Create the API: `aws apigatewayv2 create-api --name cyberling-ledger --protocol-type HTTP --target <function arn>` (us-east-1 or your default region). Save ApiId and ApiEndpoint from the output.',
        'Allow API Gateway to invoke the function: `aws lambda add-permission --function-name cyberling-classify --statement-id apigw-invoke --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:<region>:<account-id>:<api-id>/*"`. Your account id is in `aws sts get-caller-identity`.',
        'Find the integration id with `aws apigatewayv2 get-integrations --api-id <api-id>`, then `aws apigatewayv2 create-route --api-id <api-id> --route-key \'POST /entries\' --target integrations/<integration-id>`.',
        'List routes with `aws apigatewayv2 get-routes --api-id <api-id>`, find the RouteId whose RouteKey is `$default`, and remove it: `aws apigatewayv2 delete-route --api-id <api-id> --route-id <route-id>`.',
        'Call it: `curl -i -X POST <ApiEndpoint>/entries -d \'{"amount": -40}\'`. Read the status line, then the body.',
        'Probe the edges: `curl -i <ApiEndpoint>/entries` (a GET) and `curl -i -X POST <ApiEndpoint>/entries -d \'{"amount": 120}\'`. Match each result to a predict step.',
        'Teardown: if you are not continuing straight to the next lesson, `aws apigatewayv2 delete-api --api-id <api-id>` now. Recreating it is these same commands.',
      ],
      verify: { question: 'The successful POST printed status 200 and a JSON body with a single key. Type that key.', answers: ['kind'] },
    },
  ],
};

const l44: Lesson = {
  id: 'aws-4-4',
  title: 'CORS, limits, logs and teardown',
  objective: 'Configure CORS, throttling and access logging on the HTTP API, then delete it and prove it is gone.',
  minutes: 30,
  lexicon: [
    { id: 'aws.4.cors', term: 'CORS', kind: 'concept', meaning: 'Cross-Origin Resource Sharing: the browser rule that a page from one origin may only read responses from another origin if that server allows it in Access-Control-Allow-* headers. Browsers enforce it; curl and Python ignore it.', example: 'aws apigatewayv2 update-api --api-id abc123 --cors-configuration AllowOrigins="*",AllowMethods="POST,GET",AllowHeaders="content-type"', analogy: 'A doorman who asks the host, not the guest, whether the guest may come in. The analogy breaks because only browsers employ the doorman; any other client walks straight past.' },
    { id: 'aws.4.preflight', term: 'OPTIONS preflight', kind: 'concept', meaning: 'The request a browser sends before a cross-origin POST with a JSON body, asking which methods and headers are allowed. Once CORS is configured, HTTP APIs answer it themselves; the Lambda never sees it.', example: 'OPTIONS /entries\nOrigin: https://ledger.example\nAccess-Control-Request-Method: POST' },
    { id: 'aws.4.throttle', term: 'throttling (429)', kind: 'concept', meaning: 'API Gateway caps request rate: by default 10,000 requests per second with a burst of 5,000 per account and region, and lower if you set stage limits. Requests over the cap get 429 Too Many Requests and never reach the Lambda.', example: 'aws apigatewayv2 update-stage --api-id abc123 --stage-name \'$default\' --default-route-settings ThrottlingRateLimit=10,ThrottlingBurstLimit=5' },
    { id: 'aws.4.access-log', term: 'access log', kind: 'concept', meaning: 'One line per request written by API Gateway to a CloudWatch log group you name: method, route, status, latency. Separate from the Lambda\'s own log group, and it includes requests that never reached the function.', example: 'aws apigatewayv2 update-stage --api-id abc123 --stage-name \'$default\' --access-log-settings DestinationArn=<log group arn>,Format=\'$context.requestId $context.httpMethod $context.routeKey $context.status\'' },
    { id: 'aws.4.delete-api', term: 'delete-api', kind: 'pattern', meaning: 'Removes the API with its routes, integrations and stages. The Lambda, its permission statement and any log group remain and are removed separately.', example: 'aws apigatewayv2 delete-api --api-id abc123' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Browsers, crowds, operators, and the exit',
      body: `The API works from curl. Three things stand between it and a browser, a crowd and an operator. Then we clean up.

**CORS.** A page served from \`https://ledger.example\` that calls your API's origin is making a cross-origin request. Before a POST with a JSON body, the browser sends an **OPTIONS** preflight asking which origins, methods and headers are allowed, and blocks the real request unless the reply carries \`Access-Control-Allow-Origin\`. The server does not enforce any of this: the browser does. HTTP APIs answer preflights for you once you set \`--cors-configuration\`.

**Throttling.** API Gateway rejects requests above a rate with \`429 Too Many Requests\`, before they cost a Lambda invocation. The account default is 10,000 requests per second with a burst of 5,000; a stage can be given a far lower limit.

**Access logs.** One line per request into a CloudWatch log group, including requests that were throttled or never matched a route.

**Teardown.** \`delete-api\` removes routes, integrations and stages. The permission statement on the Lambda and the log group are yours to remove too.`,
      example: {
        language: 'shell',
        source: 'aws apigatewayv2 update-api --api-id <api-id> \\\n  --cors-configuration AllowOrigins="*",AllowMethods="POST,GET",AllowHeaders="content-type"\naws apigatewayv2 update-stage --api-id <api-id> --stage-name \'$default\' \\\n  --default-route-settings ThrottlingRateLimit=10,ThrottlingBurstLimit=5\naws logs create-log-group --log-group-name /aws/apigateway/cyberling-ledger\naws apigatewayv2 update-stage --api-id <api-id> --stage-name \'$default\' \\\n  --access-log-settings DestinationArn=<log group arn without :*>,Format=\'$context.requestId $context.httpMethod $context.routeKey $context.status\'\naws apigatewayv2 delete-api --api-id <api-id>',
        labels: [
          { lines: [1, 2], label: 'Tell browsers which origins, methods and headers may call the API. API Gateway answers preflights from this.' },
          { lines: [3, 4], label: 'Cap the $default stage at 10 requests per second, burst 5; the rest get 429.' },
          { lines: [5, 7], label: 'Make a log group and point the stage\'s access log at it with a line format.' },
          { lines: [8, 8], label: 'Remove the API. Routes, integrations and stages go with it.' },
        ],
      },
      contrast: [{ from: 'python', note: 'Nothing in this lesson changes the handler. CORS headers, throttling and access logs are all handled by API Gateway around your code, the way a web framework\'s middleware would wrap a Python view function.' }],
    },
    {
      kind: 'predict',
      prompt: 'A web page on another origin runs this. Which HTTP method does the browser send to your API first?',
      code: { language: 'text', source: 'fetch("https://<api-id>.execute-api.us-east-1.amazonaws.com/entries", {\n  method: "POST",\n  headers: {"Content-Type": "application/json"},\n  body: JSON.stringify({amount: -40}),\n})' },
      choices: ['OPTIONS', 'POST', 'GET', 'HEAD'],
      answer: 'OPTIONS',
      explanation: 'A cross-origin POST with Content-Type application/json is not a "simple request", so the browser preflights with OPTIONS, asking which methods and headers are allowed. With CORS configured, API Gateway answers the OPTIONS itself (204 with Access-Control-Allow-* headers) and the browser then sends the POST. Your Lambda never sees the OPTIONS.',
    },
    {
      kind: 'predict',
      prompt: 'CORS is not configured on the API at all. You run this from your terminal. What happens?',
      code: { language: 'shell', source: 'curl -i -X POST <ApiEndpoint>/entries -H \'Origin: https://ledger.example\' -d \'{"amount": -40}\'' },
      choices: [
        'HTTP/2 200 with {"kind": "expense"}: CORS is enforced by browsers, not by the server',
        'HTTP/2 403 with a CORS error',
        'No output: the request is blocked before it is sent',
        'HTTP/2 500',
      ],
      answer: 'HTTP/2 200 with {"kind": "expense"}: CORS is enforced by browsers, not by the server',
      explanation: 'The Origin header is just a header to curl. CORS is a browser policy: the server only supplies Access-Control-Allow-* headers, and only a browser reads them and decides to withhold the response from the page. Every non-browser client, curl and Python included, is unaffected.',
    },
    {
      kind: 'predict',
      prompt: 'You set ThrottlingRateLimit=1 and ThrottlingBurstLimit=1 on the stage, then fire ten POSTs as fast as the shell can. What do you observe?',
      code: { language: 'shell', source: 'for i in $(seq 1 10); do\n  curl -s -o /dev/null -w "%{http_code}\\n" -X POST <ApiEndpoint>/entries -d \'{"amount": -1}\'\ndone' },
      choices: [
        'Some lines read 429, and the Lambda\'s log shows fewer than ten invocations',
        'All ten read 200, just slower',
        'All ten read 429 until the limit is raised again',
        'The Lambda returns 429 itself after the first call',
      ],
      answer: 'Some lines read 429, and the Lambda\'s log shows fewer than ten invocations',
      explanation: 'Throttling happens in API Gateway, before integration. Requests over the rate and burst limit are answered 429 Too Many Requests and never invoke the function, so they cost no Lambda time. The exact count varies with timing; the pattern of 200s mixed with 429s does not.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the CORS configuration for a public API that browsers may POST JSON to.',
      language: 'shell',
      template: '# browsers ask permission first with the {{preflight}} method\naws apigatewayv2 update-api --api-id <api-id> \\\n  --cors-configuration AllowOrigins="{{origin}}",AllowMethods="POST,GET",AllowHeaders="{{header}}"',
      blanks: [
        { id: 'preflight', answers: ['OPTIONS'], hint: 'The method of the preflight request.' },
        { id: 'origin', answers: ['*'], hint: 'The wildcard that allows any origin.' },
        { id: 'header', answers: ['content-type', 'Content-Type'], hint: 'The header a JSON POST sends that must be allowed.' },
      ],
      explanation: 'The browser preflights with OPTIONS; "*" allows any origin (fine for a demo, too open for real data); content-type must be allowed because a JSON POST sends it. Header names are case-insensitive.',
    },
    {
      kind: 'parsons',
      prompt: 'Order what happens when a web page on another origin POSTs an entry to the configured API.',
      language: 'text',
      indentation: false,
      solution: [
        'The browser sends OPTIONS /entries with Origin and Access-Control-Request-Method headers',
        'API Gateway answers the preflight with Access-Control-Allow-* headers; the Lambda is not invoked',
        'The browser sends POST /entries with the JSON body',
        'API Gateway checks the stage throttle and matches the route key POST /entries',
        'The Lambda runs and returns statusCode and body',
        'API Gateway writes one access-log line and returns the response to the browser',
      ],
      distractors: [
        'The Lambda receives the OPTIONS request and must answer it with CORS headers',
        'curl sends the same OPTIONS preflight before its POST',
      ],
      explanation: 'With --cors-configuration set, API Gateway owns the preflight; the Lambda only ever sees the POST. Preflights are a browser behaviour: curl, Python and other clients send the POST directly.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Milestone: make the API browser-ready and observable, then tear it down and prove it.',
      warning: 'The API, the log group and a few dozen requests stay inside free tiers; the only lasting cost would be forgetting them. This lesson ends with the API deleted. Keep the Lambda: Module 5 extends it.',
      checklist: [
        'If you deleted the API after 4-3, recreate it (create-api, add-permission with the new api id, create-route) and note the new ApiId and ApiEndpoint.',
        'Enable CORS: `aws apigatewayv2 update-api --api-id <api-id> --cors-configuration AllowOrigins="*",AllowMethods="POST,GET",AllowHeaders="content-type"`.',
        'Send a preflight by hand: `curl -i -X OPTIONS <ApiEndpoint>/entries -H "Origin: https://ledger.example" -H "Access-Control-Request-Method: POST"`. Find the `access-control-allow-origin` header, then check `aws logs tail /aws/lambda/cyberling-classify --since 5m`: the function did not run.',
        'Throttle: `aws apigatewayv2 update-stage --api-id <api-id> --stage-name \'$default\' --default-route-settings ThrottlingRateLimit=1,ThrottlingBurstLimit=1`, then run the ten-POST loop from the predict step and count the 429s.',
        'Access logs: `aws logs create-log-group --log-group-name /aws/apigateway/cyberling-ledger`; get its ARN with `aws logs describe-log-groups --log-group-name-prefix /aws/apigateway/cyberling-ledger --query "logGroups[0].arn" --output text` and drop the trailing `:*`; then `aws apigatewayv2 update-stage --api-id <api-id> --stage-name \'$default\' --access-log-settings DestinationArn=<arn>,Format=\'$context.requestId $context.httpMethod $context.routeKey $context.status\'`. Send one POST and read the line with `aws logs tail /aws/apigateway/cyberling-ledger`.',
        'Teardown: `aws apigatewayv2 delete-api --api-id <api-id>`, then `aws lambda remove-permission --function-name cyberling-classify --statement-id apigw-invoke`, then `aws logs delete-log-group --log-group-name /aws/apigateway/cyberling-ledger`.',
        'Prove it: `aws apigatewayv2 get-api --api-id <api-id>` and read the error message.',
      ],
      verify: { question: 'get-api on the deleted API fails with "An error occurred (...) when calling the GetApi operation". Type the name inside the parentheses.', answers: ['NotFoundException'] },
    },
  ],
};

export const m4: Module = {
  id: 'aws-m4',
  title: 'HTTP: API Gateway',
  goal: 'HTTP methods and status codes, HTTP APIs, routes and integrations, the Lambda proxy event and response, permissions, CORS, throttling, access logs, teardown.',
  projectMilestone: 'POST /entries reaches the Lambda.',
  status: 'available',
  lessons: [l41, l42, l43, l44],
};
