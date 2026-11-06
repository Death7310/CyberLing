import type { Lesson, Module, Track } from '../schema';

const l11: Lesson = {
  id: 'az-1-1',
  title: 'Subscriptions, resource groups, and the CLI',
  objective: 'Explain Azure\'s containment hierarchy and prove the CLI is signed in.',
  minutes: 30,
  lexicon: [
    { id: 'az.subscription', term: 'subscription', kind: 'service', meaning: 'The billing boundary. Resources are charged to exactly one subscription.', example: 'az account show' },
    { id: 'az.rg', term: 'resource group', kind: 'service', meaning: 'A named folder for resources that live and die together. Deleting the group deletes everything inside: the cleanest way to avoid bills.', example: 'az group create --name ledger-rg --location westeurope', analogy: 'A project folder. AWS has no direct equivalent; tags and stacks do part of the job.' },
    { id: 'az.entra', term: 'Microsoft Entra ID', kind: 'service', meaning: 'Identity: users, service principals and role assignments (RBAC) decide who may do what on which scope.', example: 'az role assignment list --assignee <user>' },
    { id: 'az.cli', term: 'az <service> <action>', kind: 'pattern', meaning: 'The command-line grammar: az, the service, the verb, then --options.', example: 'az storage account create --name ledgerstore123 --resource-group ledger-rg' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The hierarchy: tenant, subscription, resource group, resource',
      body: `Azure groups things more explicitly than AWS. A **tenant** (your Entra ID directory) holds **subscriptions** (billing). A subscription holds **resource groups**. A resource group holds **resources**.

The resource group is your friend: create one per lesson and delete it at the end, and nothing lingers.

The CLI grammar is the same shape as the AWS CLI: \`az\`, service, action, options.`,
      example: {
        language: 'shell',
        source: 'az login\naz account show\naz group create --name cyberling-rg --location westeurope\naz group delete --name cyberling-rg --yes',
        labels: [
          { lines: [1, 2], label: 'Sign in and show the active subscription.' },
          { lines: [3, 3], label: 'Create a folder for this lesson\'s resources.' },
          { lines: [4, 4], label: 'Delete everything in it, in one command.' },
        ],
      },
      contrast: [{ from: 'aws', note: 'AWS account ≈ Azure subscription. AWS region ≈ Azure location. IAM ≈ Entra ID + RBAC. The resource group has no AWS twin; CloudFormation stacks are the closest idea.' }],
    },
    {
      kind: 'predict',
      prompt: 'After these commands, does the storage account still exist?',
      code: { language: 'shell', source: 'az group create --name demo-rg --location westeurope\naz storage account create --name demostore9931 --resource-group demo-rg\naz group delete --name demo-rg --yes' },
      choices: ['No: deleting the group deletes its resources', 'Yes: storage accounts are global', 'Yes: delete only empties the group', 'It depends on the location'],
      answer: 'No: deleting the group deletes its resources',
      explanation: 'A resource group owns its resources. Deleting the group deletes them all, which is exactly why one group per experiment is the habit to build.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the steps for a safe first day.',
      language: 'text',
      indentation: false,
      solution: ['Create the account and enable MFA', 'Install the Azure CLI and run az login', 'Run az account show to confirm the subscription', 'Create a budget alert', 'Create a resource group for your first experiment'],
      distractors: ['Create resources in the default subscription without a resource group'],
      explanation: 'Every resource needs a resource group anyway; choosing it deliberately is what keeps cleanup trivial.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Do this in your own Azure subscription.',
      warning: 'A free account includes credit and free services for 12 months. Set a budget alert first.',
      checklist: [
        'Create or sign in to an Azure account and enable MFA.',
        'Install the Azure CLI and run `az login`.',
        'Run `az account show` and note the subscription name.',
        'Create a budget alert in Cost Management.',
        'Run `az group create --name cyberling-rg --location <nearest>` and then delete it with `az group delete`.',
      ],
      verify: { question: 'az account show prints a JSON object. Type the name of the field whose value is "Enabled" for a working subscription.', answers: ['state'] },
    },
  ],
};

const planned = (id: string, title: string, goal: string, projectMilestone: string): Module => ({ id, title, goal, projectMilestone, lessons: [], status: 'planned' });

export const azure: Track = {
  id: 'azure',
  title: 'Microsoft Azure',
  tagline: 'The same cloud ideas with Microsoft\'s names, taught by deploying LedgerSharp.',
  prerequisites: ['csharp', 'aws'],
  runnable: false,
  notionalMachine: [
    'Everything is an **API call** through Azure Resource Manager; the portal, the CLI and Bicep templates all go through it.',
    'Containment: tenant → subscription → resource group → resource. Delete the group, delete the experiment.',
    'Identity is **Entra ID**; permission is **RBAC** on a scope. Deny by default.',
    'Managed services mirror AWS: Blob Storage ≈ S3, Functions ≈ Lambda, Cosmos DB / Table Storage ≈ DynamoDB, App Service ≈ a managed web host.',
    'Infrastructure is code: **Bicep** describes a resource group\'s contents declaratively.',
  ],
  projectSpine: {
    title: 'Ship LedgerSharp',
    description: 'Deploy the C# LedgerSharp API to Azure: Functions or App Service for compute, Table Storage for entries, Application Insights for logs, all described in Bicep and deleted with one command.',
  },
  modules: [
    { id: 'az-m1', title: 'Subscriptions, identity, CLI', goal: 'Tenant, subscription, resource group, Entra ID, the CLI grammar, budgets.', projectMilestone: 'A safe subscription you can script against.', status: 'available', lessons: [l11] },
    planned('az-m2', 'Storage', 'Storage accounts, blobs, tables, SAS tokens, the CLI and the .NET SDK.', 'Ledger exports in Blob Storage.'),
    planned('az-m3', 'Compute: Functions', 'Triggers, bindings, local development with Core Tools, deployment.', 'A Function that classifies an entry.'),
    planned('az-m4', 'Web: App Service', 'Deploying an ASP.NET Core API, configuration, slots.', 'LedgerSharp API running on App Service.'),
    planned('az-m5', 'Data: Table Storage and Cosmos DB', 'Partition keys, point reads, queries, pricing.', 'Entries persist in a table.'),
    planned('az-m6', 'Observe and secure', 'Application Insights, managed identities, Key Vault, RBAC scopes.', 'The API uses a managed identity, no secrets in config.'),
    planned('az-m7', 'Infrastructure as code', 'Bicep: parameters, modules, deployment, what-if, teardown.', 'LedgerSharp v1.0 on Azure: one deploy, one delete.'),
  ],
};
