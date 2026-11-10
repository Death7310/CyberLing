import type { Lesson, Module } from '../../schema';

/*
 * Module 7: Infrastructure as code.
 * Rebuilds the Ledger API (Modules 3–5, hardened in Module 6) as one AWS SAM template, deploys it with
 * `sam build && sam deploy --guided`, and removes it with `sam delete`.
 * Assumes the handler file is `app.py` with `lambda_handler`, reading the table name from the
 * environment variable TABLE_NAME. The lessons say where to adapt if a learner's Module 5 code differs.
 */

const TEMPLATE = [
  'AWSTemplateFormatVersion: "2010-09-09"',
  'Transform: AWS::Serverless-2016-10-31',
  'Description: Ledger API - the Python Ledger as a serverless service',
  '',
  'Globals:',
  '  Function:',
  '    Runtime: python3.12',
  '    Timeout: 10',
  '    MemorySize: 128',
  '',
  'Resources:',
  '  LedgerTable:',
  '    Type: AWS::DynamoDB::Table',
  '    Properties:',
  '      BillingMode: PAY_PER_REQUEST',
  '      AttributeDefinitions:',
  '        - AttributeName: owner',
  '          AttributeType: S',
  '        - AttributeName: ts',
  '          AttributeType: S',
  '      KeySchema:',
  '        - AttributeName: owner',
  '          KeyType: HASH',
  '        - AttributeName: ts',
  '          KeyType: RANGE',
  '',
  '  ClassifyFunction:',
  '    Type: AWS::Serverless::Function',
  '    Properties:',
  '      CodeUri: src/',
  '      Handler: app.lambda_handler',
  '      Environment:',
  '        Variables:',
  '          TABLE_NAME: !Ref LedgerTable',
  '      Policies:',
  '        - DynamoDBCrudPolicy:',
  '            TableName: !Ref LedgerTable',
  '      Events:',
  '        PostEntry:',
  '          Type: HttpApi',
  '          Properties:',
  '            Path: /entries',
  '            Method: post',
  '        GetBalance:',
  '          Type: HttpApi',
  '          Properties:',
  '            Path: /balance',
  '            Method: get',
  '',
  'Outputs:',
  '  ApiUrl:',
  '    Description: Base URL of the HTTP API',
  '    Value: !Sub "https://${ServerlessHttpApi}.execute-api.${AWS::Region}.amazonaws.com"',
  '  TableName:',
  '    Value: !Ref LedgerTable',
].join('\n');

const l71: Lesson = {
  id: 'aws-7-1',
  title: 'Why the infrastructure should be code',
  objective: 'Explain stacks, resources and outputs, and why a template beats a sequence of console clicks.',
  minutes: 25,
  lexicon: [
    { id: 'aws.7.stack', term: 'stack', kind: 'service', meaning: 'A CloudFormation unit of deployment: every resource created from one template, managed, updated and deleted together under one name.', example: 'aws cloudformation describe-stacks --stack-name cyberling-ledger --query Stacks[0].StackStatus', analogy: 'A recipe plus the dish it produced. Unlike a dish, the stack remembers which recipe made it and can be re-cooked to match a changed recipe.' },
    { id: 'aws.7.resource', term: 'Resources:', kind: 'pattern', meaning: 'The template section that declares each thing to create, under a logical id of your choosing, with a Type and its Properties. CloudFormation works out creation order from the references between them.', example: 'Resources:\n  LedgerTable:\n    Type: AWS::DynamoDB::Table' },
    { id: 'aws.7.output', term: 'Outputs:', kind: 'pattern', meaning: 'Values the stack publishes after creation, such as the API URL, for people and other stacks to read without hunting through the console.', example: 'aws cloudformation describe-stacks --stack-name cyberling-ledger --query "Stacks[0].Outputs"' },
    { id: 'aws.7.sam', term: 'AWS SAM', kind: 'service', meaning: 'Serverless Application Model: a CloudFormation transform that expands short resource types (AWS::Serverless::Function, HttpApi, SimpleTable) into the full set of Lambda, API Gateway, IAM and DynamoDB resources, plus the `sam` CLI to build and deploy.', example: 'Transform: AWS::Serverless-2016-10-31' },
    { id: 'aws.7.drift', term: 'drift', kind: 'concept', meaning: 'The gap between what the template says and what actually exists after someone changed a resource by hand. Detectable with drift detection; curable by making the change in the template instead.', example: 'aws cloudformation detect-stack-drift --stack-name cyberling-ledger' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'What you cannot remember, you cannot repeat',
      body: `Over five modules you clicked and typed the Ledger API into existence: a role, a function, an API, two routes, a table, a policy. Could you do it again in a second region tomorrow, identically? Could a colleague review what you did? If you fixed a flag by hand in the console on Tuesday, does anyone know by Friday? That gap between intention and reality is **drift**, and the cure is to make the description the source of truth.

**CloudFormation** reads a template (YAML or JSON) and creates a **stack**: every resource in it, tracked under one name. Change the template and update the stack: CloudFormation computes the difference and applies only that. Delete the stack and every resource goes with it. Each resource has a logical id you choose, a \`Type\` and \`Properties\`; **Outputs** publish the values you will need afterwards, like the API URL.

Three wins come for free: **repeatability** (same template, same stack, any account or region), **review** (a template is a diff in a pull request), and **cleanup** (one delete instead of a scavenger hunt).`,
      example: {
        language: 'text',
        source: 'AWSTemplateFormatVersion: "2010-09-09"\nDescription: The smallest useful stack\n\nResources:\n  LedgerTable:\n    Type: AWS::DynamoDB::Table\n    Properties:\n      BillingMode: PAY_PER_REQUEST\n      AttributeDefinitions:\n        - AttributeName: owner\n          AttributeType: S\n      KeySchema:\n        - AttributeName: owner\n          KeyType: HASH\n\nOutputs:\n  TableName:\n    Value: !Ref LedgerTable',
        labels: [
          { lines: [1, 2], label: 'Header: the template language version and a description.' },
          { lines: [4, 6], label: 'Declare one resource under a logical id you choose, with its AWS type.' },
          { lines: [7, 13], label: 'Properties: what you passed as flags to create-table in Module 5, as YAML.' },
          { lines: [15, 17], label: 'Publish the generated table name so nobody has to look it up.' },
        ],
      },
      contrast: [{ from: 'python', note: 'A template is a declaration, not a script: closer to a dict literal than to a sequence of statements. There is no "first create the table, then the function"; CloudFormation orders the work from the `!Ref`s, the way Python evaluates the inner expression before the outer one.' }],
    },
    {
      kind: 'concept',
      title: 'SAM: the shorthand for serverless',
      body: `Writing the Ledger API in raw CloudFormation takes a dozen resources: the function, its role, the role's policy, the HTTP API, an integration, two routes, a stage, two permissions letting API Gateway invoke the function, a log group. **AWS SAM** adds a \`Transform\` line to the template that expands a few short types into all of that:

- \`AWS::Serverless::Function\`: a Lambda function plus its role, policies and event sources.
- \`AWS::Serverless::HttpApi\`: an HTTP API; usually you never write it, because \`HttpApi\` events on a function create one implicitly, with the logical id \`ServerlessHttpApi\`.
- \`AWS::Serverless::SimpleTable\`: a DynamoDB table with a single-attribute primary key.

The \`sam\` CLI builds your Python dependencies, uploads the code to S3 and drives CloudFormation. Nothing is hidden: \`sam deploy\` prints the expanded change set, and the console shows every generated resource.`,
      example: {
        language: 'text',
        source: 'Transform: AWS::Serverless-2016-10-31\n\nResources:\n  ClassifyFunction:\n    Type: AWS::Serverless::Function\n    Properties:\n      CodeUri: src/\n      Handler: app.lambda_handler\n      Runtime: python3.12\n      Events:\n        PostEntry:\n          Type: HttpApi\n          Properties:\n            Path: /entries\n            Method: post',
        labels: [
          { lines: [1, 1], label: 'Turn on the SAM transform: without it the Serverless types are unknown.' },
          { lines: [4, 9], label: 'One function: where the code is, which function to call, which runtime.' },
          { lines: [10, 15], label: 'One event source: an HTTP API route that invokes the function. SAM creates the API, route, integration and permission.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'This stack has been running for a week and the table holds 300 entries. You run aws cloudformation delete-stack. What happens to the table and the function?',
      code: { language: 'text', source: 'Resources:\n  LedgerTable:\n    Type: AWS::DynamoDB::Table\n    Properties: ...\n  ClassifyFunction:\n    Type: AWS::Serverless::Function\n    Properties: ...' },
      choices: ['Both are deleted, entries included: a stack owns its resources unless a DeletionPolicy says Retain', 'The function is deleted but the table is kept because it contains data', 'Nothing is deleted; delete-stack only removes the template from CloudFormation', 'Deletion fails because the table is not empty'],
      answer: 'Both are deleted, entries included: a stack owns its resources unless a DeletionPolicy says Retain',
      explanation: 'Deleting a stack deletes what it created, data and all; CloudFormation does not check whether a table is empty (that rule is for S3 buckets). To keep a table through a stack deletion you add `DeletionPolicy: Retain` to that resource, after which it is orphaned and you own its cost and cleanup. Choose deliberately: this track wants a clean account, so our table has no DeletionPolicy.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the skeleton every SAM template shares.',
      language: 'text',
      template: 'AWSTemplateFormatVersion: "2010-09-09"\n{{transform}}: AWS::Serverless-2016-10-31\n\n{{resources}}:\n  LedgerTable:\n    Type: AWS::Serverless::{{table}}\n    Properties:\n      PrimaryKey:\n        Name: owner\n        Type: String\n\n{{outputs}}:\n  TableName:\n    Value: !Ref LedgerTable',
      blanks: [
        { id: 'transform', answers: ['Transform'], hint: 'The top-level key that enables SAM\'s shorthand types.' },
        { id: 'resources', answers: ['Resources'], hint: 'The section that declares what to create.' },
        { id: 'table', answers: ['SimpleTable'], hint: 'SAM\'s single-key DynamoDB shorthand.' },
        { id: 'outputs', answers: ['Outputs'], hint: 'The section that publishes values after creation.' },
      ],
      explanation: 'Transform is what makes AWS::Serverless::* legal. Resources is the only mandatory section; Outputs is how the stack tells you what it made.',
    },
  ],
};

const l72: Lesson = {
  id: 'aws-7-2',
  title: 'The template',
  objective: 'Read and complete a SAM template that declares the whole Ledger API: function, routes, table, environment and permissions.',
  minutes: 35,
  lexicon: [
    { id: 'aws.7.serverless-function', term: 'AWS::Serverless::Function', kind: 'pattern', meaning: 'SAM resource for a Lambda function: CodeUri (folder), Handler (file.function), Runtime, Environment, Policies and Events, expanding to the function, its role and its event wiring.', example: 'Type: AWS::Serverless::Function\nProperties:\n  CodeUri: src/\n  Handler: app.lambda_handler' },
    { id: 'aws.7.httpapi-event', term: 'Events: Type: HttpApi', kind: 'pattern', meaning: 'An event source on a function that creates (or joins) an HTTP API and routes one Path and Method to the function.', example: 'Events:\n  PostEntry:\n    Type: HttpApi\n    Properties:\n      Path: /entries\n      Method: post' },
    { id: 'aws.7.ref', term: '!Ref / !Sub / !GetAtt', kind: 'operator', meaning: 'Intrinsic functions that fill values at deploy time: !Ref gives a resource\'s main identifier (a table\'s name), !GetAtt an attribute (its Arn), !Sub substitutes ${...} inside a string.', example: 'TABLE_NAME: !Ref LedgerTable\nValue: !Sub "https://${ServerlessHttpApi}.execute-api.${AWS::Region}.amazonaws.com"' },
    { id: 'aws.7.crud-policy', term: 'DynamoDBCrudPolicy', kind: 'pattern', meaning: 'A SAM policy template: a named, parameterised IAM policy (here: item-level read/write on one table) that SAM expands into the function\'s role, so you do not hand-write the JSON from Module 6.', example: 'Policies:\n  - DynamoDBCrudPolicy:\n      TableName: !Ref LedgerTable' },
    { id: 'aws.7.globals', term: 'Globals:', kind: 'pattern', meaning: 'A SAM section for properties shared by every function in the template (Runtime, Timeout, MemorySize), overridable per resource.', example: 'Globals:\n  Function:\n    Runtime: python3.12\n    Timeout: 10' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The whole Ledger API on one page',
      body: `Here is everything from Modules 3 to 6 as one \`template.yaml\`. Read it top to bottom with the labels; nothing in it is new behaviour, only a new way of saying it.

Two decisions deserve a sentence. The table uses the full \`AWS::DynamoDB::Table\` type rather than \`SimpleTable\`, because our table has a sort key (\`ts\`) and the shorthand supports only a single-attribute key: shorthand is for the common case, and you drop to the full type when it does not fit. And the table has no fixed \`TableName\`: CloudFormation generates one, and the function learns it through the environment variable \`TABLE_NAME: !Ref LedgerTable\`. That avoids a name clash with any hand-built table and lets two copies of the stack coexist.

\`DynamoDBCrudPolicy\` is a SAM **policy template**: it expands to item-level read and write actions on exactly that table ARN. It is broader than the two-action policy you wrote in Module 6 (it includes UpdateItem, DeleteItem, Scan) but still scoped to one table; if you want the Module 6 strictness, replace it with an inline \`Statement:\` list using the same JSON keys.`,
      example: {
        language: 'text',
        source: TEMPLATE,
        labels: [
          { lines: [1, 3], label: 'Header: CloudFormation version, the SAM transform, a description.' },
          { lines: [5, 9], label: 'Defaults for every function in the stack.' },
          { lines: [12, 25], label: 'The table, as in Module 5: on-demand billing, owner as partition key, ts as sort key (use AttributeType N if your handler stores a number).' },
          { lines: [27, 31], label: 'The function: code in src/, handler app.lambda_handler (match your file and function names).' },
          { lines: [32, 34], label: 'Tell the code the generated table name; your handler reads os.environ["TABLE_NAME"].' },
          { lines: [35, 37], label: 'Permissions on exactly this table, generated into the role.' },
          { lines: [38, 48], label: 'Two routes on one implicit HTTP API: POST /entries and GET /balance.' },
          { lines: [50, 55], label: 'Publish the API base URL and the table name.' },
        ],
      },
      contrast: [{ from: 'python', note: 'Indentation is structure here as it is in Python, but with a stricter rule: two spaces per level, never tabs. A property indented one level too far silently becomes a child of the wrong key, and the error names a key you never wrote.' }],
    },
    {
      kind: 'predict',
      prompt: 'During deployment CloudFormation resolves the environment variable. What value does the function see in TABLE_NAME?',
      code: { language: 'text', source: 'Resources:\n  LedgerTable:\n    Type: AWS::DynamoDB::Table\n    Properties:\n      BillingMode: PAY_PER_REQUEST\n      ...\n  ClassifyFunction:\n    Type: AWS::Serverless::Function\n    Properties:\n      Environment:\n        Variables:\n          TABLE_NAME: !Ref LedgerTable' },
      choices: ['A generated table name such as cyberling-ledger-LedgerTable-1A2B3C4D5E6F', 'The string "LedgerTable", the logical id', 'The table\'s ARN', 'An error: the table has no TableName property so !Ref has nothing to return'],
      answer: 'A generated table name such as cyberling-ledger-LedgerTable-1A2B3C4D5E6F',
      explanation: '`!Ref` on a table returns its physical name, which CloudFormation generates from the stack name, the logical id and a random suffix when you omit TableName. The ARN needs `!GetAtt LedgerTable.Arn`. The logical id is only a name inside the template. Because the name is generated, the code must read it from the environment rather than hard-code `LedgerEntries`.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the function resource so it runs your handler and answers POST /entries.',
      language: 'text',
      template: '  ClassifyFunction:\n    Type: AWS::Serverless::Function\n    Properties:\n      CodeUri: src/\n      Handler: {{handler}}\n      Runtime: {{runtime}}\n      Events:\n        PostEntry:\n          Type: HttpApi\n          Properties:\n            Path: {{path}}\n            Method: {{method}}',
      blanks: [
        { id: 'handler', answers: ['app.lambda_handler'], hint: 'file name without .py, a dot, the function name.' },
        { id: 'runtime', answers: ['python3.12'], hint: 'The runtime identifier you chose in Module 3.' },
        { id: 'path', answers: ['/entries'], hint: 'The route, with its leading slash.' },
        { id: 'method', answers: ['post', 'POST'], hint: 'The HTTP verb for creating an entry.' },
      ],
      explanation: 'Handler is the Python import path to the function; Runtime fixes the interpreter; Path and Method are the route you curled in Module 4.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the top of the template in conventional order and with correct nesting. Indentation is part of the answer: two spaces per level.',
      language: 'text',
      indentation: true,
      solution: [
        'AWSTemplateFormatVersion: "2010-09-09"',
        'Transform: AWS::Serverless-2016-10-31',
        'Globals:',
        '  Function:',
        '    Runtime: python3.12',
        'Resources:',
        '  LedgerTable:',
        '    Type: AWS::DynamoDB::Table',
        '  ClassifyFunction:',
        '    Type: AWS::Serverless::Function',
        'Outputs:',
        '  ApiUrl:',
        '    Value: !Sub "https://${ServerlessHttpApi}.execute-api.${AWS::Region}.amazonaws.com"',
      ],
      distractors: [
        'Transform: AWS::Serverless',
        '    Type: AWS::Lambda::Function',
        '    Value: !Ref ServerlessHttpApi',
      ],
      explanation: 'YAML maps are unordered, so CloudFormation would accept any section order; the header-Globals-Resources-Outputs order is the convention reviewers expect. The transform name carries its version date. AWS::Lambda::Function is the raw type: it has no Events or Policies, so SAM shorthand under it fails. !Ref on the API gives only its id; the URL needs !Sub to wrap it.',
    },
  ],
};

const l73: Lesson = {
  id: 'aws-7-3',
  title: 'Build, deploy, update',
  objective: 'Deploy the template with sam build and sam deploy, read the change set, and reach the API it created.',
  minutes: 40,
  lexicon: [
    { id: 'aws.7.sam-build', term: 'sam build', kind: 'pattern', meaning: 'Resolve each function\'s CodeUri and requirements.txt into a deployable folder under .aws-sam/build, with a copy of the template pointing at it.', example: 'sam build' },
    { id: 'aws.7.sam-deploy', term: 'sam deploy --guided', kind: 'pattern', meaning: 'Upload the built code to S3, create a CloudFormation change set and, after your confirmation, execute it. --guided asks for stack name, region and permissions once and saves the answers.', example: 'sam deploy --guided' },
    { id: 'aws.7.samconfig', term: 'samconfig.toml', kind: 'concept', meaning: 'The file --guided writes: stack name, region, S3 bucket, capabilities and confirmation preferences, so later deploys are just `sam deploy`. Commit it; it holds no secrets.', example: '[default.deploy.parameters]\nstack_name = "cyberling-ledger"\ncapabilities = "CAPABILITY_IAM"' },
    { id: 'aws.7.change-set', term: 'change set', kind: 'concept', meaning: 'CloudFormation\'s dry run: a list of every resource it would Add, Modify or Remove to make the stack match the template, shown before anything is touched.', example: 'aws cloudformation describe-change-set --stack-name cyberling-ledger --change-set-name <name> --query "Changes[].ResourceChange.[Action,LogicalResourceId]"' },
    { id: 'aws.7.sam-local', term: 'sam local invoke / sam logs', kind: 'pattern', meaning: 'Run one function on your machine in a Lambda-like Docker container with an event file; tail the deployed function\'s CloudWatch logs by logical id.', example: 'sam local invoke ClassifyFunction --event events/post.json\nsam logs -n ClassifyFunction --stack-name cyberling-ledger --tail' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Two commands and a saved answer sheet',
      body: `A SAM project is a folder: \`template.yaml\`, a \`src/\` directory with \`app.py\` and a \`requirements.txt\` (boto3 is already in the runtime, so the file may be empty), and optionally an \`events/\` folder with sample JSON.

\`sam build\` copies each function's code and installs its requirements into \`.aws-sam/build\`. \`sam deploy --guided\` asks a few questions the first time: stack name, region, whether to confirm change sets, whether SAM may create IAM roles (\`CAPABILITY_IAM\`), whether a route without authentication is intentional (it is, for now). It saves the answers in \`samconfig.toml\`, so from then on \`sam deploy\` alone is enough.

Each deploy uploads the code to an S3 bucket SAM manages, then creates a **change set**: the list of resources CloudFormation would add, modify or remove. You read it, type \`y\`, and watch the stack events scroll until \`CREATE_COMPLETE\` (first time) or \`UPDATE_COMPLETE\`. Change the handler, run \`sam build && sam deploy\`, and the change set shows one Modify on the function. That loop is the whole workflow.`,
      example: {
        language: 'shell',
        source: 'sam validate --lint\nsam build\nsam deploy --guided\naws cloudformation describe-stacks --stack-name cyberling-ledger --query "Stacks[0].StackStatus" --output text\nAPI=$(aws cloudformation describe-stacks --stack-name cyberling-ledger --query "Stacks[0].Outputs[?OutputKey==\'ApiUrl\'].OutputValue" --output text)\ncurl -s -o /dev/null -w "%{http_code}\\n" -X POST "$API/entries" -H "content-type: application/json" -d \'{"amount": -40}\'',
        labels: [
          { lines: [1, 1], label: 'Catch template typos before uploading anything.' },
          { lines: [2, 2], label: 'Package the code into .aws-sam/build.' },
          { lines: [3, 3], label: 'First deploy: answer the prompts, review the change set, confirm.' },
          { lines: [4, 4], label: 'Ask CloudFormation how the stack ended up.' },
          { lines: [5, 5], label: 'Read the ApiUrl output instead of hunting in the console.' },
          { lines: [6, 6], label: 'Print only the HTTP status of a real request.' },
        ],
      },
      contrast: [{ from: 'python', note: '`sam build` is to a template what installing a `requirements.txt` into a virtual environment is to a script: it gathers dependencies into a known folder so the thing can run somewhere else. `.aws-sam/` belongs in `.gitignore`, like `venv/`.' }],
    },
    {
      kind: 'concept',
      title: 'Seeing it run: logs and local invocations',
      body: `Once deployed, you do not need to remember the generated function name: \`sam logs -n ClassifyFunction --stack-name cyberling-ledger --tail\` resolves the logical id and streams the CloudWatch log group, including the JSON lines from Module 6.

Before deploying, \`sam local invoke ClassifyFunction --event events/post.json\` runs the handler on your machine inside a container that mimics the Lambda runtime. It needs Docker, and your local AWS credentials are used for any boto3 call, so the local function talks to the *real* table unless you point it elsewhere. It is excellent for catching a missing import or a wrong handler name in seconds instead of a two-minute deploy. \`sam local start-api\` goes one step further and serves the routes on localhost.`,
      example: {
        language: 'text',
        source: '{\n  "body": "{\\"amount\\": -40}",\n  "headers": { "content-type": "application/json" },\n  "requestContext": { "http": { "method": "POST", "path": "/entries" } }\n}',
        labels: [
          { lines: [2, 2], label: 'The body is a string, as API Gateway sends it: JSON inside JSON.' },
          { lines: [3, 4], label: 'Enough of the HTTP API event shape for your handler to route on.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'You change Timeout from 10 to 15 in Globals and add a third HttpApi event to the function, then run sam build && sam deploy. Before you type y, what does the change set list?',
      code: { language: 'shell', source: 'sam build && sam deploy\n# ... CloudFormation stack changeset\n# Operation   LogicalResourceId                 ResourceType\n# ???' },
      choices: ['Modify on ClassifyFunction and Add on the new route and permission resources; the table is not listed', 'Add on every resource: a deploy always recreates the stack', 'Modify on every resource, because the template file changed', 'Nothing: change sets only list deletions'],
      answer: 'Modify on ClassifyFunction and Add on the new route and permission resources; the table is not listed',
      explanation: 'A change set is a diff of the desired against the deployed state. Timeout touches the function (Modify); a new event expands to new API Gateway route and Lambda permission resources (Add). Untouched resources, like the table, do not appear. Read the Replacement column too: some property changes force CloudFormation to create a new resource and delete the old one, which for a table means losing data.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the commands of the build-deploy-inspect loop.',
      language: 'shell',
      template: 'sam {{build}}\nsam deploy --{{guided}}\nsam logs -n ClassifyFunction --stack-name cyberling-ledger --{{tail}}\nsam local invoke ClassifyFunction --{{event}} events/post.json',
      blanks: [
        { id: 'build', answers: ['build'], hint: 'Gather code and requirements into .aws-sam/build.' },
        { id: 'guided', answers: ['guided'], hint: 'The flag that asks the questions and writes samconfig.toml.' },
        { id: 'tail', answers: ['tail'], hint: 'Keep streaming new log lines.' },
        { id: 'event', answers: ['event'], hint: 'The flag that names the JSON file to pass as the event.' },
      ],
      explanation: 'After the first guided run, plain `sam deploy` reuses samconfig.toml.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Deploy the Ledger API from the template and prove it answers.',
      warning: 'The stack creates a Lambda function, an HTTP API, an on-demand DynamoDB table and an S3 bucket for build artifacts; at this traffic all of it is within the free tier, and the artifacts are a few kilobytes. Leaving the stack up overnight costs nothing measurable, but Lesson 7-4 removes it. Install the SAM CLI first (see the AWS docs for your OS); Docker is only needed for sam local.',
      checklist: [
        'Make a folder `cyberling-ledger/` with `template.yaml` (the full template from Lesson 7-2), `src/app.py` (your Module 5/6 handler) and an empty `src/requirements.txt`. If the handler hard-codes `LedgerEntries`, change it to `os.environ["TABLE_NAME"]`; if your `ts` is a number, change the AttributeType to `N`.',
        'Run `sam validate --lint`, fix anything it names, then `sam build`.',
        'Run `sam deploy --guided`. Stack name `cyberling-ledger`, region `us-east-1` or your default, confirm changes before deploy: y, allow SAM CLI IAM role creation: y, "ClassifyFunction has no authentication, is this okay?": y, save arguments to configuration file: y.',
        'Read the change set it prints (every line is Add on the first deploy), type y, and watch events until the final line reads `Successfully created/updated stack`.',
        'Run `aws cloudformation describe-stacks --stack-name cyberling-ledger --query "Stacks[0].StackStatus" --output text` and note the status string.',
        'Read the URL: `API=$(aws cloudformation describe-stacks --stack-name cyberling-ledger --query "Stacks[0].Outputs[?OutputKey==\'ApiUrl\'].OutputValue" --output text)`.',
        'POST and GET: `curl -s -o /dev/null -w "%{http_code}\\n" -X POST "$API/entries" -H "content-type: application/json" -d \'{"amount": -40}\'` prints 200; `curl "$API/balance"` returns the sum. Then `sam logs -n ClassifyFunction --stack-name cyberling-ledger` shows your JSON log line.',
        'Make one change (for example Timeout: 15 in Globals), run `sam build && sam deploy`, and confirm the change set lists one Modify on ClassifyFunction.',
        'Teardown: leave the stack running for Lesson 7-4, which removes it with `sam delete`. If you stop here, run `sam delete --stack-name cyberling-ledger --no-prompts` now.',
      ],
      verify: { question: 'After the first deploy, describe-stacks printed the StackStatus. Type it exactly.', answers: ['CREATE_COMPLETE'] },
    },
  ],
};

const l74: Lesson = {
  id: 'aws-7-4',
  title: 'Ship, then clean up',
  objective: 'Publish outputs and tags, understand what production would add, and delete the whole stack with one command.',
  minutes: 30,
  lexicon: [
    { id: 'aws.7.tags', term: 'tags', kind: 'concept', meaning: 'Key/value labels on resources (project=cyberling). Applied to a whole stack with `sam deploy --tags`, they propagate to every resource and, once activated as cost allocation tags, split the bill by project.', example: 'sam deploy --tags project=cyberling owner=learner' },
    { id: 'aws.7.sam-delete', term: 'sam delete', kind: 'pattern', meaning: 'Delete the stack and the build artifacts SAM uploaded for it. Resources with DeletionPolicy Retain and log groups Lambda created on its own are not removed.', example: 'sam delete --stack-name cyberling-ledger' },
    { id: 'aws.7.jwt-authorizer', term: 'JWT authorizer', kind: 'concept', meaning: 'An HTTP API setting that rejects requests without a valid signed token from an issuer such as a Cognito user pool, before the function runs; declared in the template under Auth.', example: 'Auth:\n  Authorizers:\n    CognitoJwt:\n      JwtConfiguration:\n        issuer: https://cognito-idp.us-east-1.amazonaws.com/<pool-id>' },
    { id: 'aws.7.cicd', term: 'CI/CD pipeline', kind: 'concept', meaning: 'Automation that runs sam build and sam deploy on every push to the main branch, usually from GitHub Actions assuming an AWS role through OIDC so no long-lived keys are stored.', example: 'run: sam build && sam deploy --no-confirm-changeset --no-fail-on-empty-changeset' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Outputs for humans, tags for the bill',
      body: `A stack's **Outputs** are its public face: \`ApiUrl\` is what you paste into a README or hand to a frontend, and another stack can import it with \`!ImportValue\` if you add an \`Export\` name. Keep outputs to what a reader needs.

**Tags** answer "whose is this and what does it cost?". Pass them once with \`sam deploy --tags project=cyberling\` (saved to \`samconfig.toml\`) and CloudFormation stamps every resource in the stack. Tags become useful for money when you activate them as **cost allocation tags** in the Billing console; from the next day, Cost Explorer can group spend by \`project\`. On a hobby account this shows zeros, which is itself the information you want.

**sam delete** is the exit: it deletes the stack (function, role, API, table) and the artifacts it uploaded. Two things survive by design: resources marked \`DeletionPolicy: Retain\`, and the CloudWatch log group that Lambda created implicitly on first invocation, because the stack never declared it. A tidy template adds an \`AWS::Logs::LogGroup\` resource so the log group is owned too.`,
      example: {
        language: 'shell',
        source: 'sam deploy --tags project=cyberling owner=learner\naws cloudformation describe-stacks --stack-name cyberling-ledger --query "Stacks[0].Outputs"\naws cloudformation describe-stack-resources --stack-name cyberling-ledger --query "StackResources[].[ResourceType,PhysicalResourceId]" --output table\nsam delete --stack-name cyberling-ledger\naws cloudformation describe-stacks --stack-name cyberling-ledger',
        labels: [
          { lines: [1, 1], label: 'Stamp every resource in the stack with project tags.' },
          { lines: [2, 2], label: 'The values the stack publishes.' },
          { lines: [3, 3], label: 'Every real resource SAM expanded your template into, with its generated name.' },
          { lines: [4, 4], label: 'Remove the stack and its artifacts, after two confirmation prompts.' },
          { lines: [5, 5], label: 'Afterwards: DELETE_IN_PROGRESS, then an error saying the stack does not exist.' },
        ],
      },
      contrast: [{ from: 'python', note: 'Tags are metadata the way a docstring is: they change nothing about how the code runs, and they are the first thing the next person reads. Unlike a docstring, the billing system reads them too.' }],
    },
    {
      kind: 'concept',
      title: 'What you built, and what production adds',
      body: `You built a real service: an HTTP endpoint backed by a function, a database, least-privilege permissions, structured logs, an alarm, and a template that recreates all of it in one command. Three things separate it from something you would charge money for.

**A custom domain.** Today the URL is \`https://<id>.execute-api.us-east-1.amazonaws.com\`. Production requests a TLS certificate in ACM for \`api.example.com\`, attaches it as an API Gateway custom domain, and points a Route 53 record at it, all declarable in the same template.

**Authentication.** Every route is open. The usual fix is a Cognito user pool that issues JWTs to signed-in users and a **JWT authorizer** on the HTTP API that rejects requests without a valid token before your function runs; the handler then reads the user id from the token claims and uses it as \`owner\` instead of trusting the body.

**CI/CD.** You deployed from your laptop with your own keys. A GitHub Actions workflow runs \`sam build && sam deploy\` on every push to \`main\`, authenticating by assuming an AWS role through OIDC so no keys are stored anywhere, and the pull request that changes \`template.yaml\` is the review step this module promised.`,
      example: {
        language: 'text',
        source: 'Resources:\n  LedgerApi:\n    Type: AWS::Serverless::HttpApi\n    Properties:\n      Auth:\n        DefaultAuthorizer: CognitoJwt\n        Authorizers:\n          CognitoJwt:\n            IdentitySource: $request.header.Authorization\n            JwtConfiguration:\n              issuer: https://cognito-idp.us-east-1.amazonaws.com/us-east-1_EXAMPLE\n              audience:\n                - <app-client-id>',
        labels: [
          { lines: [2, 3], label: 'Declare the API explicitly once you need to configure it.' },
          { lines: [5, 8], label: 'Require a token on every route by default.' },
          { lines: [9, 13], label: 'Where the token comes from, who must have signed it, and for which app.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'You run sam delete and, two minutes later, describe-stacks. What does the CLI print?',
      code: { language: 'shell', source: 'sam delete --stack-name cyberling-ledger\n# ... Deleted successfully\naws cloudformation describe-stacks --stack-name cyberling-ledger' },
      choices: ['An error: Stack with id cyberling-ledger does not exist', 'The stack with StackStatus DELETE_COMPLETE, forever', 'The stack with StackStatus DELETED', 'The stack unchanged: sam delete removes only the local build folder'],
      answer: 'An error: Stack with id cyberling-ledger does not exist',
      explanation: 'A deleted stack disappears from describe-stacks by name. It stays visible for about 90 days with StackStatus DELETE_COMPLETE in `aws cloudformation list-stacks --stack-status-filter DELETE_COMPLETE`, which is the way to audit what you removed. There is no DELETED status.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the release-and-retire sequence for the Ledger API.',
      language: 'text',
      indentation: false,
      solution: [
        'Redeploy with --tags project=cyberling so every resource carries the project label',
        'Read ApiUrl from the stack outputs and send one POST and one GET',
        'Run sam delete and confirm both prompts',
        'Run describe-stacks for the stack name and read the status or error',
        'Delete the implicit Lambda log group the stack did not own',
        'Check the billing alarm from Module 1 is still in place',
      ],
      distractors: [
        'Empty the DynamoDB table by hand before sam delete so CloudFormation is allowed to remove it',
        'Delete the function in the console first so the stack has less to remove',
        'Deactivate the cost allocation tag before deleting, or the bill keeps running',
      ],
      explanation: 'Tables need not be empty to be deleted (buckets do). Deleting resources by hand before the stack creates drift and does not speed anything up; let CloudFormation own the removal. Tags cost nothing and record nothing on their own; the bill stops when the resources do.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Tag it, use it one last time, then remove it all.',
      warning: 'Deleting is free. After sam delete nothing from this track should be billing: the only remaining pieces are the SAM-managed artifact bucket (kilobytes; removable below) and the implicit log group (free tier), both named in the checklist. Your Module 1 billing alarm is the final safety net; keep it.',
      checklist: [
        'Redeploy with tags: `sam deploy --tags project=cyberling owner=learner` and confirm the change set (Modify on tagged resources). In the Billing console, Cost allocation tags, activate `project`; it will show zeros tomorrow, which is the point.',
        'Use the API once more: read `ApiUrl` from the outputs, POST one entry and GET /balance.',
        'Run `sam delete --stack-name cyberling-ledger`. Answer y to deleting the stack and y to deleting the artifacts in S3. Wait for `Deleted successfully`.',
        'Run `aws cloudformation describe-stacks --stack-name cyberling-ledger`. Early you may see `DELETE_IN_PROGRESS`; afterwards the CLI reports an error that the stack does not exist. `aws cloudformation list-stacks --stack-status-filter DELETE_COMPLETE --query "StackSummaries[].StackName"` still lists it.',
        'Confirm the resources are gone: `aws lambda list-functions --query "Functions[].FunctionName"` and `aws dynamodb list-tables` show nothing from cyberling-ledger.',
        'Teardown, leftovers: `aws logs describe-log-groups --log-group-name-prefix /aws/lambda/cyberling-ledger --query "logGroups[].logGroupName"` and `aws logs delete-log-group --log-group-name <that name>`. Optionally remove the SAM artifact bucket: empty it with `aws s3 rm s3://<aws-sam-cli-managed-default-samclisourcebucket-...> --recursive`, then `aws cloudformation delete-stack --stack-name aws-sam-cli-managed-default`.',
        'Final sweep: `aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE` should show no cyberling stacks, and the Module 1 billing alarm should still exist. The template in your folder is the whole project: `sam deploy` brings it back in two minutes.',
      ],
      verify: { question: 'After sam delete, what did describe-stacks tell you about cyberling-ledger? Either answer is correct: type the StackStatus if the stack was still visible (DELETE_COMPLETE), or the three words from the error message that say the stack is gone (does not exist).', answers: ['DELETE_COMPLETE', 'does not exist'] },
    },
  ],
};

export const m7: Module = {
  id: 'aws-m7',
  title: 'Infrastructure as code',
  goal: 'CloudFormation stacks, resources and outputs; AWS SAM templates and policy templates; sam build, deploy, change sets, logs and local invocation; tags, cost allocation and sam delete; what production adds.',
  projectMilestone: 'Ledger API v1.0: one command deploys, one command destroys.',
  status: 'available',
  lessons: [l71, l72, l73, l74],
};
