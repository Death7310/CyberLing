import type { Lesson, Module, Track } from '../schema';

const l11: Lesson = {
  id: 'aws-1-1',
  title: 'Accounts, regions, and the CLI',
  objective: 'Explain what an AWS account, region and IAM identity are, and prove the CLI is talking to your account.',
  minutes: 30,
  lexicon: [
    { id: 'aws.account', term: 'account', kind: 'service', meaning: 'The billing and security boundary. Everything you create belongs to exactly one account (a 12-digit number).', example: 'aws sts get-caller-identity   # shows your Account' },
    { id: 'aws.region', term: 'region', kind: 'concept', meaning: 'A geographic cluster of data centres (us-east-1, eu-west-1). Most resources live in one region and are invisible from others.', example: 'aws s3 ls --region eu-west-1', analogy: 'A country with its own copy of every service. Your things do not cross the border unless you move them.' },
    { id: 'aws.iam', term: 'IAM user / role', kind: 'service', meaning: 'Identity and Access Management: who may do what. Never work as the root user; create an IAM identity with only the permissions needed.', example: 'arn:aws:iam::123456789012:user/learner' },
    { id: 'aws.cli', term: 'aws <service> <action>', kind: 'pattern', meaning: 'The command-line shape for every AWS operation: service name, then verb, then --options.', example: 'aws s3 mb s3://my-unique-bucket-name' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Three words you need before any service',
      body: `Every AWS resource lives inside an **account**, in a **region**, and is touched by an **identity** that IAM allows or denies.

The root user (the email you signed up with) can do anything, including deleting the account. Treat it like the key to the building: use it once to create an IAM identity for yourself, then lock it away with MFA.

Every CLI command has the same grammar: \`aws\`, the service, the action, then options.`,
      example: {
        language: 'shell',
        source: 'aws configure\naws sts get-caller-identity\naws s3 ls',
        labels: [
          { lines: [1, 1], label: 'Store your access key, secret and default region locally.' },
          { lines: [2, 2], label: 'Ask "who am I?". Prints UserId, Account and Arn.' },
          { lines: [3, 3], label: 'List buckets. Empty output on a new account is correct.' },
        ],
      },
      contrast: [{ from: 'python', note: 'The CLI is a program like any other; later you will call the same operations from Python with boto3, with the same service/action vocabulary.' }],
    },
    {
      kind: 'predict',
      prompt: 'You run this in region us-east-1 and then list buckets in eu-west-1. What does the second command show?',
      code: { language: 'shell', source: 'aws s3 mb s3://cyberling-demo-4821 --region us-east-1\naws s3 ls --region eu-west-1' },
      choices: ['The bucket, because S3 bucket names are global and the list is account-wide', 'Nothing, because the bucket is in another region', 'An error', 'Only buckets created today'],
      answer: 'The bucket, because S3 bucket names are global and the list is account-wide',
      explanation: 'S3 is the exception that teaches the rule: bucket *names* are globally unique and `s3 ls` lists all your buckets, but each bucket\'s *data* lives in the region you chose. Most other services (EC2, Lambda) show only the current region.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the steps for a safe first day.',
      language: 'text',
      indentation: false,
      solution: ['Create the account and turn on MFA for the root user', 'Create an IAM user for yourself with programmatic access', 'Run aws configure with that user\'s keys', 'Run aws sts get-caller-identity to confirm', 'Set a billing alarm'],
      distractors: ['Run aws configure with the root user\'s keys'],
      explanation: 'Root keys should never exist. Configure the CLI with an IAM identity.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Do this in your own AWS account.',
      warning: 'Everything in this lesson is free-tier. Set a billing alarm before you create anything else; a forgotten resource is the usual cause of a surprise bill.',
      checklist: [
        'Sign up (or sign in) and enable MFA on the root user.',
        'Create an IAM user named `learner` with an access key for CLI use.',
        'Install the AWS CLI and run `aws configure` with those keys and a default region.',
        'Run `aws sts get-caller-identity`.',
        'Create a billing alarm for a small amount (for example 5 USD).',
      ],
      verify: { question: 'get-caller-identity printed three fields. Type the name of the field that holds your 12-digit account number.', answers: ['Account'] },
    },
  ],
};

const planned = (id: string, title: string, goal: string, projectMilestone: string): Module => ({ id, title, goal, projectMilestone, lessons: [], status: 'planned' });

export const aws: Track = {
  id: 'aws',
  title: 'Amazon Web Services',
  tagline: 'Put your programs on the internet. Taught by shipping the Python Ledger as a real, tiny, serverless service.',
  prerequisites: ['python'],
  runnable: false,
  notionalMachine: [
    'Everything is an **API call**: the console, the CLI, boto3 and infrastructure-as-code all call the same operations.',
    'Resources live in an **account** and (mostly) in a **region**; identity and permission come from **IAM**, which denies by default.',
    'You pay for what exists and what runs. Every lesson ends with removing what it created.',
    'A **managed service** is someone else\'s program you configure instead of write: storage (S3), compute (Lambda, EC2), databases (DynamoDB), routing (API Gateway).',
    'Infrastructure is **code**: once you can describe it in a template, you can recreate it, review it and delete it reliably.',
  ],
  projectSpine: {
    title: 'Ship the Ledger',
    description: 'Deploy the Python Ledger as an HTTP API: a Lambda function behind API Gateway storing entries in DynamoDB, with logs in CloudWatch, defined as code, and torn down cleanly at the end.',
  },
  modules: [
    { id: 'aws-m1', title: 'Accounts, identity, CLI', goal: 'Account, region, IAM, MFA, the CLI grammar, billing alarms.', projectMilestone: 'A safe account you can script against.', status: 'available', lessons: [l11] },
    planned('aws-m2', 'Storage: S3', 'Buckets, objects, permissions, static hosting, the CLI and boto3.', 'Ledger exports saved to a bucket.'),
    planned('aws-m3', 'Compute: Lambda', 'Functions, handlers, events, environment variables, logs.', 'A Lambda that classifies an entry.'),
    planned('aws-m4', 'HTTP: API Gateway', 'Routes, integrations, request/response shapes, testing with curl.', 'POST /entries reaches the Lambda.'),
    planned('aws-m5', 'Data: DynamoDB', 'Tables, keys, put/get/query, pricing model.', 'Entries persist in a table.'),
    planned('aws-m6', 'Observe and secure', 'CloudWatch logs and metrics, IAM roles for services, least privilege.', 'The API has a role that can only touch its own table.'),
    planned('aws-m7', 'Infrastructure as code', 'AWS SAM or CDK: define, deploy, update and delete the whole stack.', 'Ledger API v1.0: one command deploys, one command destroys.'),
  ],
};
