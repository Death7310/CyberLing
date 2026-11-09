import type { Track } from '../../schema';
import { m1 } from './m1';
import { m2 } from './m2';
import { m3 } from './m3';
import { m4 } from './m4';
import { m5 } from './m5';
import { m6 } from './m6';
import { m7 } from './m7';

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
  modules: [m1, m2, m3, m4, m5, m6, m7],
};
