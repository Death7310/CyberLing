import type { Track } from '../../schema';
import { m1 } from './m1';
import { m2 } from './m2';
import { m3 } from './m3';
import { m4 } from './m4';
import { m5 } from './m5';
import { m6 } from './m6';
import { m7 } from './m7';

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
  modules: [m1, m2, m3, m4, m5, m6, m7],
};
