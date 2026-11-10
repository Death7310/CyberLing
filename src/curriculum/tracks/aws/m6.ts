import type { Lesson, Module } from '../../schema';

/*
 * Module 6: Observe and secure.
 * Assumes the learner's hand-built stack from Modules 3–5: Lambda `cyberling-classify` (Python 3.12,
 * handler `app.lambda_handler`) behind an HTTP API with `POST /entries` and `GET /balance`, writing to and
 * querying the DynamoDB table `LedgerEntries` (owner, ts). The lessons say "the name you used" wherever a
 * learner's choice in an earlier module could differ.
 */

const l61: Lesson = {
  id: 'aws-6-1',
  title: 'Roles for machines, least privilege',
  objective: 'Replace the Lambda\'s broad DynamoDB permissions with a policy that allows exactly two actions on one table.',
  minutes: 35,
  lexicon: [
    { id: 'aws.6.execution-role', term: 'execution role', kind: 'concept', meaning: 'The IAM role a Lambda function runs as. Its permissions decide what the function\'s boto3 calls may do; the function never holds long-lived keys.', example: 'aws lambda get-function-configuration --function-name cyberling-classify --query Role', analogy: 'A staff badge issued to a machine instead of a person. Like a badge it opens only listed doors; unlike a badge it is renewed automatically every few hours.' },
    { id: 'aws.6.trust-policy', term: 'trust policy', kind: 'concept', meaning: 'The half of a role that says WHO may wear it (which service or account may call sts:AssumeRole). For Lambda it names the principal lambda.amazonaws.com.', example: '"Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"' },
    { id: 'aws.6.permissions-policy', term: 'permissions policy', kind: 'concept', meaning: 'The half of a role (or user) that says WHAT the wearer may do: a JSON document of statements, each with Effect, Action and Resource.', example: 'aws iam put-role-policy --role-name $ROLE --policy-name ledger-least --policy-document file://policy.json' },
    { id: 'aws.6.statement', term: 'Effect / Action / Resource / Condition', kind: 'pattern', meaning: 'The four keys of a policy statement: Allow or Deny; which API operations; which ARNs; under what extra conditions. IAM denies anything no statement allows.', example: '{"Effect": "Allow", "Action": "dynamodb:Query", "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/LedgerEntries"}' },
    { id: 'aws.6.least-privilege', term: 'least privilege', kind: 'concept', meaning: 'Grant only the actions on only the resources a workload actually uses, and nothing else. Measured, not felt: the role can do X and Y on this ARN, full stop.', example: 'Action: ["dynamodb:PutItem", "dynamodb:Query"]   # not dynamodb:*' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Users are for people, roles are for programs',
      body: `In Module 1 you made an IAM **user** with an access key, because a person at a keyboard needs credentials that last. Your Lambda function has no keyboard. It runs as an **execution role**: when the function starts, the Lambda service calls \`sts:AssumeRole\` and hands the code short-lived credentials that expire on their own. Nothing to leak, nothing to rotate.

A role has two documents, and mixing them up is the classic error:

- The **trust policy** answers *who may become this role*. For a function it names the service principal \`lambda.amazonaws.com\`.
- The **permissions policy** answers *what the role may do*: \`dynamodb:PutItem\` on this table, \`logs:PutLogEvents\` on that log group.

In Module 5 you probably attached a managed policy such as \`AmazonDynamoDBFullAccess\` to get moving. It lets your classifier delete every table in the account. **Least privilege** means replacing it with exactly the two operations the handler calls, on exactly the one table ARN. IAM denies by default, so whatever you do not list is already forbidden.`,
      example: {
        language: 'shell',
        source: 'ROLE=$(aws lambda get-function-configuration --function-name cyberling-classify --query Role --output text | cut -d/ -f2)\naws iam get-role --role-name $ROLE --query Role.AssumeRolePolicyDocument\naws iam list-attached-role-policies --role-name $ROLE\naws iam list-role-policies --role-name $ROLE',
        labels: [
          { lines: [1, 1], label: 'Find the role name the function runs as (the last segment of its ARN).' },
          { lines: [2, 2], label: 'Read the trust policy: who may assume this role.' },
          { lines: [3, 3], label: 'List managed policies attached by ARN (the broad one lives here).' },
          { lines: [4, 4], label: 'List inline policies written straight into the role (your tight one will live here).' },
        ],
      },
      contrast: [{ from: 'python', note: 'In Module 5 your handler called `boto3.resource("dynamodb")` with no keys at all. That worked because boto3 reads the role\'s temporary credentials from the function\'s environment. The permissions policy is what decides whether `table.put_item(...)` succeeds or raises `ClientError`.' }],
    },
    {
      kind: 'predict',
      prompt: 'A role has two JSON documents. Which one contains the string lambda.amazonaws.com?',
      code: { language: 'text', source: 'Document A: "Principal": { "Service": "???" }, "Action": "sts:AssumeRole"\nDocument B: "Action": [ "dynamodb:PutItem", "dynamodb:Query" ], "Resource": "arn:aws:dynamodb:...:table/LedgerEntries"' },
      choices: ['Document A, the trust policy: it names the service allowed to assume the role', 'Document B, the permissions policy: it names the service the role may call', 'Both: every policy must name the caller and the callee', 'Neither: the function ARN is used instead of a service name'],
      answer: 'Document A, the trust policy: it names the service allowed to assume the role',
      explanation: 'The trust policy is about *becoming* the role, so its Principal is the Lambda service. The permissions policy is about *doing*, so it names actions (`dynamodb:PutItem`) and resources (a table ARN), never the caller. A role whose trust policy names `ec2.amazonaws.com` cannot be used by a Lambda function no matter how generous its permissions are.',
    },
    {
      kind: 'concept',
      title: 'Anatomy of a statement',
      body: `A permissions policy is a list of **statements**. Each statement has an \`Effect\` (\`Allow\` or \`Deny\`), one or more \`Action\`s written as \`service:Operation\`, one or more \`Resource\` ARNs, and an optional \`Condition\` block (for example, only from a given VPC, only with MFA). An explicit \`Deny\` beats any \`Allow\`; no statement at all is an implicit deny.

Two habits make policies honest. First, name resources by ARN rather than \`"*"\`: the table ARN is printed by \`describe-table\`. Second, list operations, not wildcards: \`dynamodb:*\` includes \`DeleteTable\`.

Policies written into a role are **inline**; policies created separately and attached by ARN are **managed**. Inline is fine for a policy that belongs to exactly one role, which is our case. After you change IAM, allow up to a minute: permissions are eventually consistent across regions.`,
      example: {
        language: 'text',
        source: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Sid": "LedgerTableOnly",\n      "Effect": "Allow",\n      "Action": ["dynamodb:PutItem", "dynamodb:Query"],\n      "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/LedgerEntries"\n    }\n  ]\n}',
        labels: [
          { lines: [2, 2], label: 'Policy language version; always this fixed date.' },
          { lines: [5, 5], label: 'Optional human label for the statement.' },
          { lines: [6, 6], label: 'Allow. Anything not allowed is denied anyway.' },
          { lines: [7, 7], label: 'Exactly the two operations the handler calls: one write, one read.' },
          { lines: [8, 8], label: 'One table ARN: region, account id, then table/<name>. Use your own account id.' },
        ],
      },
    },
    {
      kind: 'cloze',
      prompt: 'Complete the policy so the role may only write and query the LedgerEntries table.',
      language: 'text',
      template: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "{{effect}}",\n      "Action": ["dynamodb:{{put}}", "dynamodb:{{query}}"],\n      "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/{{table}}"\n    }\n  ]\n}',
      blanks: [
        { id: 'effect', answers: ['Allow'], hint: 'Grants are spelled with a capital letter: Allow or Deny.' },
        { id: 'put', answers: ['PutItem'], hint: 'The DynamoDB operation that writes one item.' },
        { id: 'query', answers: ['Query'], hint: 'The operation that reads items sharing one partition key.' },
        { id: 'table', answers: ['LedgerEntries'], hint: 'The table name from Module 5, after table/.' },
      ],
      explanation: 'Scan, DeleteItem, UpdateItem and every other DynamoDB operation are now denied for this role, as are all other tables. The ARN pins region and account too.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Tighten your function\'s role and prove that the tightening is real.',
      warning: 'IAM has no charge. The invocations and the handful of DynamoDB requests here are free-tier. Keep the ARN exact: a typo in the table name silently breaks every POST with AccessDeniedException until you fix it.',
      checklist: [
        'Set `ROLE=$(aws lambda get-function-configuration --function-name cyberling-classify --query Role --output text | cut -d/ -f2)` and `TABLE_ARN=$(aws dynamodb describe-table --table-name LedgerEntries --query Table.TableArn --output text)`.',
        'Save the completed cloze policy as `ledger-policy.json`, replacing the sample ARN with `$TABLE_ARN` (`echo $TABLE_ARN` and paste it).',
        'Attach it inline: `aws iam put-role-policy --role-name $ROLE --policy-name cyberling-ledger-least --policy-document file://ledger-policy.json`.',
        'Find the broad policy with `aws iam list-attached-role-policies --role-name $ROLE` and detach it: `aws iam detach-role-policy --role-name $ROLE --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess` (or whichever DynamoDB policy you attached in Module 5). Leave the basic execution policy that allows logging.',
        'Wait a minute, then invoke the function the way you did in Module 5 (for example `aws lambda invoke --function-name cyberling-classify --cli-binary-format raw-in-base64-out --payload file://event.json out.json`). The CLI prints `"StatusCode": 200`, and `cat out.json` shows your usual response, not an error. Also `curl -X POST` to `/entries` once: still 200.',
        'Now prove the deny. Add one temporary line to your handler before the write: `table.scan(Limit=1)`. Redeploy with `aws lambda update-function-code` as in Module 3 and POST once more.',
        'Read the failure: `aws logs tail /aws/lambda/cyberling-classify --since 5m`. The traceback ends in a botocore `ClientError` whose message starts `An error occurred (<code>) when calling the Scan operation`. Note the code in the parentheses.',
        'Remove the `scan` line, redeploy, POST once and confirm 200 again.',
        'Teardown: this lesson created only the inline policy, which replaces the broad one and stays until Lesson 6-4 removes it with the hand-built stack. If you are stopping the track here, run `aws iam delete-role-policy --role-name $ROLE --policy-name cyberling-ledger-least` together with the Module 3–5 teardowns.',
      ],
      verify: { question: 'After the role was tightened, the Scan attempt failed. Type the error code that appeared in parentheses in the log message.', answers: ['AccessDeniedException'] },
    },
  ],
};

const l62: Lesson = {
  id: 'aws-6-2',
  title: 'Logs you can query, metrics you get for free',
  objective: 'Log one JSON object per event, query it with CloudWatch Logs Insights, and read Lambda\'s built-in metrics.',
  minutes: 30,
  lexicon: [
    { id: 'aws.6.structured-log', term: 'structured log line', kind: 'pattern', meaning: 'One log event that is a complete JSON object, so each key becomes a queryable field instead of a word inside a sentence.', example: 'print(json.dumps({"kind": kind, "amount": amount}))', analogy: 'A form with labelled boxes instead of a paragraph. The analogy breaks when you nest objects: Insights flattens them to dotted names like detail.amount.' },
    { id: 'aws.6.logs-insights', term: 'fields … | filter …', kind: 'pattern', meaning: 'The CloudWatch Logs Insights query language: pipeline stages separated by |, applied to every log event in a group over a time range.', example: 'fields @timestamp, kind | filter kind = "expense" | sort @timestamp desc' },
    { id: 'aws.6.lambda-metrics', term: 'Invocations / Errors / Duration', kind: 'concept', meaning: 'Metrics the Lambda service records for every function without any code: how many times it ran, how many runs ended in an uncaught error or timeout, and how long each took.', example: 'aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Errors --dimensions Name=FunctionName,Value=cyberling-classify --statistic Sum --period 300 --start-time ... --end-time ...' },
    { id: 'aws.6.emf', term: 'Embedded Metric Format', kind: 'concept', meaning: 'A JSON log line with an `_aws` block that CloudWatch turns into a custom metric as it ingests the log, so you publish metrics by printing, with no extra API call.', example: '{"_aws": {"Timestamp": 1700000000000, "CloudWatchMetrics": [{"Namespace": "Cyberling", "Dimensions": [["Kind"]], "Metrics": [{"Name": "Amount"}]}]}, "Kind": "expense", "Amount": 40}' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Print JSON, not sentences',
      body: `In Module 3 you saw your \`print\` lines appear in CloudWatch Logs. That is enough for one function and one afternoon. When you need "how many expenses did we classify yesterday?", a sentence like \`classified expense of -40\` has to be parsed with regular expressions. A **structured log line** does not: print one JSON object per event and CloudWatch Logs Insights discovers its keys as fields automatically.

Two cautions. Use \`print(json.dumps(...))\` or configure the function's log format as JSON: the default Python \`logging\` formatter prefixes each line with \`[INFO] <timestamp> <request id>\`, and a line that is not *entirely* JSON gets no field discovery. And log facts, not secrets: whoever can read the log group can read the line.

An **Insights** query is a pipeline: \`fields\` picks columns, \`filter\` keeps rows, \`stats\`, \`sort\` and \`limit\` do what they say. The built-in fields start with \`@\`: \`@timestamp\`, \`@message\`, \`@requestId\`.`,
      example: {
        language: 'python',
        source: 'import json\n\ndef lambda_handler(event, context):\n    body = json.loads(event["body"])\n    amount = body["amount"]\n    kind = "expense" if amount < 0 else "income"\n    print(json.dumps({"kind": kind, "amount": amount, "requestId": context.aws_request_id}))\n    # ... write the item, as in Module 5 ...\n    return {"statusCode": 200, "body": json.dumps({"kind": kind})}',
        labels: [
          { lines: [4, 6], label: 'Classify as before.' },
          { lines: [7, 7], label: 'Emit one JSON object: every key becomes a queryable field.' },
          { lines: [9, 9], label: 'Respond to API Gateway as before.' },
        ],
      },
      contrast: [{ from: 'python', note: '`json.dumps` is the same call you used to save the Ledger to a file. The difference is the reader: a file you parsed yourself with `json.load`; a log line CloudWatch parses for you, as long as the whole line is one object.' }],
    },
    {
      kind: 'concept',
      title: 'Metrics you did not write',
      body: `Every Lambda function reports metrics in the \`AWS/Lambda\` namespace with the dimension \`FunctionName\`: **Invocations** (every run), **Errors** (runs that ended in an uncaught exception or a timeout), **Duration** (milliseconds), plus Throttles and ConcurrentExecutions. They cost nothing and need no code. Note what does *not* count as an Error: a handler that catches the exception and returns \`{"statusCode": 500}\` ran successfully as far as Lambda is concerned.

For your own numbers, the **Embedded Metric Format** is the cheapest route: a JSON log line carrying an \`_aws\` block that declares a namespace, dimensions and metric names; CloudWatch extracts the metric while ingesting the log, so there is no \`put-metric-data\` call to slow the handler down. Custom metrics are billed per metric per month after a free allowance, so declare a few and keep dimensions low-cardinality (a kind, not a user id).`,
      example: {
        language: 'shell',
        source: 'aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Invocations \\\n  --dimensions Name=FunctionName,Value=cyberling-classify \\\n  --statistic Sum --period 3600 \\\n  --start-time $(date -u -d "1 hour ago" +%FT%TZ) --end-time $(date -u +%FT%TZ)',
        labels: [
          { lines: [1, 1], label: 'Namespace and metric name select which series.' },
          { lines: [2, 2], label: 'The dimension narrows it to one function.' },
          { lines: [3, 3], label: 'Aggregate: sum per one-hour bucket.' },
          { lines: [4, 4], label: 'Time window in ISO 8601 UTC.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'A client POSTs the body {"amount": "forty"} to /entries. The handler runs this code. What happens to the Invocations and Errors metrics?',
      code: { language: 'python', source: 'def lambda_handler(event, context):\n    body = json.loads(event["body"])\n    kind = "expense" if body["amount"] < 0 else "income"   # str < int raises TypeError\n    ...' },
      choices: ['Invocations +1 and Errors +1: an uncaught exception is a function error', 'Invocations +1, Errors unchanged: a Python exception is not an AWS error', 'Invocations unchanged, Errors +1: failed runs are not invocations', 'Nothing changes: metrics only count successful requests'],
      answer: 'Invocations +1 and Errors +1: an uncaught exception is a function error',
      explanation: 'Every start counts as an invocation. The `TypeError` escapes the handler, so the runtime reports a function error: Errors goes up by one, the log shows a traceback, and API Gateway answers the client with 500. Had the handler caught the exception and returned `{"statusCode": 400}`, Errors would stay at zero, which is why the alarm in the next lesson watches uncaught failures, not bad requests.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the Insights query that lists the most recent expense classifications.',
      language: 'text',
      template: '{{fields}} @timestamp, kind, amount\n| {{filter}} kind = "{{value}}"\n| sort @timestamp {{order}}\n| limit 20',
      blanks: [
        { id: 'fields', answers: ['fields'], hint: 'The stage that chooses which columns to show.' },
        { id: 'filter', answers: ['filter'], hint: 'The stage that keeps only matching rows.' },
        { id: 'value', answers: ['expense'], hint: 'The kind your handler logs for negative amounts.' },
        { id: 'order', answers: ['desc'], hint: 'Newest first.' },
      ],
      explanation: 'Each stage feeds the next through |. `kind` and `amount` exist as fields only because the whole log line was a JSON object.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Make your function log JSON, then query it from the CLI.',
      warning: 'Logs Insights is billed per gigabyte scanned (about half a cent per GB); your log group is kilobytes. Log storage and the built-in metrics are within the free tier. Nothing in this lesson needs tearing down because nothing new was created.',
      checklist: [
        'Add the `print(json.dumps({...}))` line from the example to your handler and redeploy with `aws lambda update-function-code` as in Module 3.',
        'Send three requests with `curl -X POST "$API/entries" -H "content-type: application/json" -d \'{"amount": -40}\'`, varying the amount so at least two are negative and one positive.',
        'Start the query (logs take a few seconds to arrive): `QID=$(aws logs start-query --log-group-name /aws/lambda/cyberling-classify --start-time $(date -d "30 min ago" +%s) --end-time $(date +%s) --query-string \'fields @timestamp, kind, amount | filter kind = "expense" | sort @timestamp desc | limit 20\' --query queryId --output text)`.',
        'Fetch results: `aws logs get-query-results --query-id $QID`. If `status` is `Running`, run it again. Each row in `results` is a list of `{"field": ..., "value": ...}` pairs; only the negative-amount requests appear.',
        'Read the built-in metrics with the `get-metric-statistics` command from the concept, once for Invocations and once for Errors. Invocations should equal your request count.',
        'Teardown: nothing was created; the log group from Module 3 is removed with the function in Lesson 6-4.',
      ],
      verify: { question: 'In get-query-results, every result row begins with the same built-in field. Type its name, including the @ sign.', answers: ['@timestamp'] },
    },
  ],
};

const l63: Lesson = {
  id: 'aws-6-3',
  title: 'Alarms that email you, traces that explain',
  objective: 'Create an SNS topic with an email subscription and a CloudWatch alarm on the function\'s Errors metric, then trip it.',
  minutes: 30,
  lexicon: [
    { id: 'aws.6.alarm', term: 'put-metric-alarm', kind: 'pattern', meaning: 'Create or replace a CloudWatch alarm: a metric, a statistic over a period, a threshold and comparison, and the actions (topic ARNs) to notify when the state changes.', example: 'aws cloudwatch put-metric-alarm --alarm-name cyberling-errors --namespace AWS/Lambda --metric-name Errors --statistic Sum --period 60 --evaluation-periods 1 --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold --alarm-actions $TOPIC' },
    { id: 'aws.6.alarm-state', term: 'OK / ALARM / INSUFFICIENT_DATA', kind: 'concept', meaning: 'The three states of an alarm. New alarms start INSUFFICIENT_DATA until enough datapoints arrive; actions fire on transitions, not on every evaluation.', example: 'aws cloudwatch describe-alarms --alarm-names cyberling-errors --query MetricAlarms[0].StateValue' },
    { id: 'aws.6.sns-topic', term: 'SNS topic', kind: 'service', meaning: 'A named channel in Simple Notification Service. Publishers (an alarm, your code) send a message to the topic; every confirmed subscription (email, SMS, Lambda, HTTPS) receives a copy.', example: 'aws sns create-topic --name cyberling-alerts', analogy: 'A mailing list. Unlike a mailing list, the sender cannot add you: you must click the confirmation link yourself.' },
    { id: 'aws.6.subscription', term: 'sns subscribe', kind: 'pattern', meaning: 'Attach an endpoint to a topic by protocol. Email endpoints stay PendingConfirmation until the recipient clicks the link AWS sends.', example: 'aws sns subscribe --topic-arn $TOPIC --protocol email --notification-endpoint you@example.com' },
    { id: 'aws.6.xray', term: 'X-Ray trace', kind: 'service', meaning: 'A timeline of one request across services (API Gateway → Lambda → DynamoDB) with the time spent in each segment, enabled per function with tracing mode Active.', example: 'aws lambda update-function-configuration --function-name cyberling-classify --tracing-config Mode=Active' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'From metric to inbox',
      body: `A metric nobody looks at is a diary. An **alarm** watches one metric and changes **state**: \`OK\`, \`ALARM\`, or \`INSUFFICIENT_DATA\` when there are not enough datapoints yet. You describe what to watch (namespace, metric, dimension), how to summarise it (\`Sum\` over a 60-second \`period\`), when to worry (\`threshold\` 1, \`GreaterThanOrEqualToThreshold\`, for 1 \`evaluation-period\`) and what to do (\`alarm-actions\`).

Alarm actions are ARNs, not email addresses. The usual target is an **SNS topic**: the alarm publishes to the topic, and the topic fans out to its **subscriptions**. An email subscription is created in state \`PendingConfirmation\`; AWS mails the address a link, and until the recipient clicks it nothing is delivered. Order matters: topic, then subscription, then confirmation, then alarm.

**X-Ray** answers a different question: not "is it failing?" but "where did the 900 ms go?". With tracing mode \`Active\`, each request gets a trace showing API Gateway, your function and the DynamoDB call as timed segments. One paragraph here, one flag to turn on; it is the tool to reach for when a Duration metric climbs and the logs say nothing.`,
      example: {
        language: 'shell',
        source: 'TOPIC=$(aws sns create-topic --name cyberling-alerts --query TopicArn --output text)\naws sns subscribe --topic-arn $TOPIC --protocol email --notification-endpoint you@example.com\naws cloudwatch put-metric-alarm --alarm-name cyberling-errors \\\n  --namespace AWS/Lambda --metric-name Errors --dimensions Name=FunctionName,Value=cyberling-classify \\\n  --statistic Sum --period 60 --evaluation-periods 1 \\\n  --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold \\\n  --alarm-actions $TOPIC\naws cloudwatch describe-alarms --alarm-names cyberling-errors --query "MetricAlarms[0].StateValue"',
        labels: [
          { lines: [1, 1], label: 'Create the channel and keep its ARN.' },
          { lines: [2, 2], label: 'Ask for emails; the recipient must confirm before any arrive.' },
          { lines: [3, 4], label: 'Name the alarm and pick the series: Errors for this one function.' },
          { lines: [5, 6], label: 'Sum each minute; worry when one minute has 1 or more.' },
          { lines: [7, 7], label: 'On entering ALARM, publish to the topic.' },
          { lines: [8, 8], label: 'Read the current state.' },
        ],
      },
      contrast: [{ from: 'python', note: 'An alarm is a condition evaluated for you on a schedule, roughly `if sum(errors_last_minute) >= 1 and state != "ALARM": publish()`. You never write the loop; you fill in its parameters.' }],
    },
    {
      kind: 'predict',
      prompt: 'You run put-metric-alarm and, ten seconds later, describe-alarms. No request has reached the function in the last hour. What is StateValue?',
      code: { language: 'shell', source: 'aws cloudwatch put-metric-alarm --alarm-name cyberling-errors ... --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold\naws cloudwatch describe-alarms --alarm-names cyberling-errors --query "MetricAlarms[0].StateValue"' },
      choices: ['"INSUFFICIENT_DATA": no datapoints exist yet for the alarm to judge', '"OK": zero errors is below the threshold', '"ALARM": a new alarm starts alarmed until proven healthy', '"PENDING": alarms take a minute to become active'],
      answer: '"INSUFFICIENT_DATA": no datapoints exist yet for the alarm to judge',
      explanation: 'Lambda publishes Errors only for minutes in which the function ran, so an idle function has no datapoints and the alarm cannot evaluate. It stays INSUFFICIENT_DATA until data arrives (or until you set `--treat-missing-data notBreaching`, which makes a quiet minute count as OK). There is no PENDING state.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the commands so that an error in the function reaches your inbox.',
      language: 'shell',
      indentation: false,
      solution: [
        'TOPIC=$(aws sns create-topic --name cyberling-alerts --query TopicArn --output text)',
        'aws sns subscribe --topic-arn $TOPIC --protocol email --notification-endpoint you@example.com',
        '# open the message from AWS Notifications and click "Confirm subscription"',
        'aws cloudwatch put-metric-alarm --alarm-name cyberling-errors --namespace AWS/Lambda --metric-name Errors --dimensions Name=FunctionName,Value=cyberling-classify --statistic Sum --period 60 --evaluation-periods 1 --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold --alarm-actions $TOPIC',
        'curl -X POST "$API/entries" -H "content-type: application/json" -d \'{not json\'',
        'aws cloudwatch describe-alarms --alarm-names cyberling-errors --query "MetricAlarms[0].StateValue"',
      ],
      distractors: [
        'aws cloudwatch put-metric-alarm --alarm-name cyberling-errors --namespace AWS/Lambda --metric-name Errors --dimensions Name=FunctionName,Value=cyberling-classify --statistic Sum --period 60 --evaluation-periods 1 --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold --alarm-actions you@example.com',
        'aws sns subscribe --topic-arn $TOPIC --protocol email --notification-endpoint you@example.com --confirm',
      ],
      explanation: 'Alarm actions take topic ARNs, never addresses, so the alarm needs the topic first. Only the recipient can confirm an email subscription; there is no --confirm flag, which is the point: nobody can subscribe your inbox without your click.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Wire up the alarm and trip it once on purpose.',
      warning: 'One standard alarm costs 0.10 USD per month, prorated to the minutes it exists (ten alarms are free-tier). SNS email delivery is free for the first 1,000 messages. The deliberate error is one free invocation. Delete the alarm in Lesson 6-4 so the cents stop.',
      checklist: [
        'Create the topic and keep its ARN in `$TOPIC`; subscribe your own email; open the confirmation mail and click the link. `aws sns list-subscriptions-by-topic --topic-arn $TOPIC` now shows a real SubscriptionArn instead of PendingConfirmation.',
        'Create the alarm with the full `put-metric-alarm` command from the concept. Run `describe-alarms`: StateValue is INSUFFICIENT_DATA, as predicted.',
        'Force one uncaught error: `curl -X POST "$API/entries" -H "content-type: application/json" -d \'{not json\'`. If your handler catches bad JSON and returns 400 (so Errors stays 0), invoke it directly with an event it cannot handle instead: `aws lambda invoke --function-name cyberling-classify --cli-binary-format raw-in-base64-out --payload \'{}\' out.json`; the output shows `"FunctionError": "Unhandled"`.',
        'Wait one to two minutes, then run `describe-alarms` again and watch StateValue change. Check your inbox: the message subject starts with `ALARM: "cyberling-errors"`.',
        'Optional: turn on tracing with `aws lambda update-function-configuration --function-name cyberling-classify --tracing-config Mode=Active`, send one good POST, and open X-Ray (CloudWatch → Traces) to see the API Gateway → Lambda → DynamoDB segments. Turn it off again with `Mode=PassThrough`.',
        'Teardown: leave the topic and alarm in place for Lesson 6-4, which deletes them. If you stop here instead, run `aws cloudwatch delete-alarms --alarm-names cyberling-errors` and `aws sns delete-topic --topic-arn $TOPIC` now.',
      ],
      verify: { question: 'After the forced error, describe-alarms printed a new StateValue. Type it exactly.', answers: ['ALARM'] },
    },
  ],
};

const l64: Lesson = {
  id: 'aws-6-4',
  title: 'Secrets, encryption, and a clean desk',
  objective: 'Keep secrets out of code with Parameter Store or Secrets Manager, explain encryption at rest, and remove this module\'s resources.',
  minutes: 25,
  lexicon: [
    { id: 'aws.6.ssm-parameter', term: 'SSM Parameter Store', kind: 'service', meaning: 'A key/value store for configuration under path-like names; a SecureString parameter is encrypted with KMS and decrypted only for callers who ask and are allowed. Standard parameters are free.', example: 'aws ssm put-parameter --name /cyberling/api-key --type SecureString --value "..."' },
    { id: 'aws.6.secrets-manager', term: 'Secrets Manager', kind: 'service', meaning: 'A store built for credentials: versioned, with scheduled automatic rotation through a Lambda function, billed per secret per month (about 0.40 USD) plus per 10,000 API calls.', example: 'aws secretsmanager get-secret-value --secret-id cyberling/db --query SecretString' },
    { id: 'aws.6.get-parameter', term: 'get_parameter(..., WithDecryption=True)', kind: 'pattern', meaning: 'The boto3 call that reads one parameter; without WithDecryption a SecureString comes back as ciphertext. Read it once at import time, not on every request.', example: 'ssm.get_parameter(Name="/cyberling/api-key", WithDecryption=True)["Parameter"]["Value"]' },
    { id: 'aws.6.kms', term: 'KMS key', kind: 'service', meaning: 'A key in Key Management Service that never leaves the service; other services call it to encrypt and decrypt your data. S3, DynamoDB, Lambda environment variables and SecureString parameters are encrypted at rest by default with AWS-managed keys.', example: 'aws kms list-aliases --query "Aliases[].AliasName"', analogy: 'A notary who stamps and unstamps documents for you but never hands over the stamp. The analogy breaks on scale: KMS does this millions of times a second and charges per call for customer-managed keys.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Where a secret may live',
      body: `Not in code, not in a repository, not in a log line. Lambda environment variables are better: they are encrypted at rest and not in your source, but anyone who can read the function's configuration can read them in plain text in the console. For a real secret, store it where reads are an audited IAM permission and the code fetches it at start-up.

**SSM Parameter Store** holds configuration under names like \`/cyberling/api-key\`. A \`SecureString\` parameter is encrypted with a KMS key, and a caller only gets the plain value by asking \`WithDecryption=True\` *and* having \`ssm:GetParameter\` plus \`kms:Decrypt\`. Standard parameters cost nothing.

**Secrets Manager** does one more thing: **rotation**. On a schedule it runs a Lambda function that sets a new database password and stores the new version, so the old one stops working without anyone typing it. That is worth its 0.40 USD per secret per month for credentials; it is overkill for a feature flag.

**Encryption at rest** is on by default for the services in this track, using AWS-managed keys in **KMS**. You only reach for your own KMS key when you need to control who may decrypt, audit every use, or delete the key to make data unreadable.`,
      example: {
        language: 'python',
        source: 'import boto3\n\nssm = boto3.client("ssm")\nAPI_KEY = ssm.get_parameter(Name="/cyberling/api-key", WithDecryption=True)["Parameter"]["Value"]\n\ndef lambda_handler(event, context):\n    if event["headers"].get("x-api-key") != API_KEY:\n        return {"statusCode": 401, "body": "nope"}\n    ...',
        labels: [
          { lines: [3, 4], label: 'Fetch once, outside the handler, so warm invocations reuse it.' },
          { lines: [7, 8], label: 'Use the secret; never log it.' },
        ],
      },
      contrast: [{ from: 'python', note: 'Module-level code runs once per container start, like a module import in Python: the `get_parameter` call happens on the cold start, and every warm invocation reuses `API_KEY`. The same is true of `boto3.client(...)`, which is why it sits at the top.' }],
    },
    {
      kind: 'predict',
      prompt: 'The Ledger grows a relational database whose password must change every 30 days without downtime. Which store fits?',
      code: { language: 'text', source: 'Option 1: SSM Parameter Store, SecureString /cyberling/db-password\nOption 2: Secrets Manager secret cyberling/db with a rotation schedule\nOption 3: Lambda environment variable DB_PASSWORD\nOption 4: a constant in app.py' },
      choices: ['Option 2: rotation is what Secrets Manager adds over Parameter Store', 'Option 1: SecureString is encrypted, which is all a password needs', 'Option 3: environment variables are encrypted at rest and free', 'Option 4: the code is private to the account anyway'],
      answer: 'Option 2: rotation is what Secrets Manager adds over Parameter Store',
      explanation: 'Both stores encrypt; only Secrets Manager rotates on a schedule by running a Lambda that changes the real password and stores the new version. A SecureString parameter is right for a value that changes rarely and costs nothing. Environment variables are readable by anyone with `lambda:GetFunctionConfiguration`, and a constant in code lands in every clone of the repository.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the boto3 call that reads a SecureString parameter in plain text.',
      language: 'python',
      template: 'ssm = boto3.client("ssm")\nvalue = ssm.{{call}}(Name="/cyberling/api-key", {{flag}}=True)["Parameter"]["{{key}}"]',
      blanks: [
        { id: 'call', answers: ['get_parameter'], hint: 'Singular: one parameter by name.' },
        { id: 'flag', answers: ['WithDecryption'], hint: 'Without it a SecureString comes back as ciphertext.' },
        { id: 'key', answers: ['Value'], hint: 'The field holding the parameter\'s content, next to Name and Type.' },
      ],
      explanation: 'The response nests the parameter under "Parameter"; its "Value" is plain text only because WithDecryption was True and the caller\'s role allows ssm:GetParameter and kms:Decrypt.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Store and read one secret, then take down everything this module created.',
      warning: 'Standard SecureString parameters are free, including the AWS-managed KMS key they use. Deleting the alarm stops its 0.10 USD/month; the topic is free. Everything below is reversible except the data in the hand-built table, which Module 7 recreates from code anyway.',
      checklist: [
        'Store a parameter (not a real secret): `aws ssm put-parameter --name /cyberling/demo-secret --type SecureString --value "rotate-me-please"`.',
        'Read it twice: `aws ssm get-parameter --name /cyberling/demo-secret --query Parameter.Value --output text` prints ciphertext; add `--with-decryption` and it prints the plain value. Same permission model your function would face.',
        'Teardown, parameter: `aws ssm delete-parameter --name /cyberling/demo-secret`.',
        'Teardown, alarm: `aws cloudwatch delete-alarms --alarm-names cyberling-errors`. Then `aws cloudwatch describe-alarms --alarm-names cyberling-errors`: CloudWatch does not error on a missing alarm, it prints `"MetricAlarms": []`. Absence is the proof here.',
        'Teardown, topic: `aws sns delete-topic --topic-arn $TOPIC` (recover the ARN with `aws sns list-topics` if the variable is gone). Then `aws sns get-topic-attributes --topic-arn $TOPIC`: SNS does error, with `An error occurred (<code>) when calling the GetTopicAttributes operation: Topic does not exist`. Note the code.',
        'Teardown, the extra policy: Module 7 rebuilds the whole API from a template with its own role, so the hand-built function, its role and the inline policy from Lesson 6-1 can go now: `aws iam delete-role-policy --role-name $ROLE --policy-name cyberling-ledger-least`, then the Module 3–5 teardowns (function and log group, API, table). Keep them only if you want to compare by hand in Module 7.',
        'Confirm with `aws iam list-role-policies --role-name $ROLE` (empty list, or NoSuchEntity if you deleted the role) and a last look at the billing alarm from Module 1.',
      ],
      verify: { question: 'After deleting the topic, get-topic-attributes failed. Type the error code shown in parentheses.', answers: ['NotFound', 'NotFoundException'] },
    },
  ],
};

export const m6: Module = {
  id: 'aws-m6',
  title: 'Observe and secure',
  goal: 'IAM roles for services and least privilege, structured logs and Logs Insights, Lambda metrics, alarms through SNS, X-Ray, secrets in Parameter Store and Secrets Manager, encryption at rest.',
  projectMilestone: 'The API has a role that can only touch its own table.',
  status: 'available',
  lessons: [l61, l62, l63, l64],
};
