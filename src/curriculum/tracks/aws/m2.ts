import type { Lesson, Module } from '../../schema';

/*
 * Module 2: Storage: S3.
 * The Ledger's exports move into a bucket. The learner creates `cyberling-ledger-<yourname>` with the CLI,
 * uploads a fixed ledger.json (three entries, used again by Module 3), locks it down, shares it with a
 * presigned URL, reads it back with boto3, demonstrates static hosting and tears the bucket down.
 *
 * Fixed fixture used by every lesson (the learner types it in 2-1):
 *   [{"ts": "2026-01-03", "amount": -40, "note": "groceries"},
 *    {"ts": "2026-01-05", "amount": 1200, "note": "salary"},
 *    {"ts": "2026-01-09", "amount": -15, "note": "coffee"}]
 */

const LEDGER_JSON = '[\n  {"ts": "2026-01-03", "amount": -40, "note": "groceries"},\n  {"ts": "2026-01-05", "amount": 1200, "note": "salary"},\n  {"ts": "2026-01-09", "amount": -15, "note": "coffee"}\n]';

const l21: Lesson = {
  id: 'aws-2-1',
  title: 'Buckets and objects',
  objective: 'Create a bucket, upload a file as an object and read its metadata back with the CLI.',
  minutes: 30,
  lexicon: [
    { id: 'aws.2.bucket', term: 'bucket', kind: 'service', meaning: 'A named container for objects in S3. The name is unique across every AWS account in the world; the data lives in the one region you chose.', example: 'aws s3 mb s3://cyberling-ledger-sam --region us-east-1', analogy: 'A domain name: whoever registers it first owns it. It breaks here: a bucket has no DNS record you manage, and deleting it frees the name for anyone (after a delay).' },
    { id: 'aws.2.object-key', term: 'object / key', kind: 'concept', meaning: 'An object is the bytes plus metadata; its key is the full string that names it inside the bucket. Slashes in a key are ordinary characters, not directories.', example: 'exports/ledger.json   # one key, no folder exists', analogy: 'A filename that happens to contain slashes. It breaks here: you cannot rename a "folder", only copy each object to a new key.' },
    { id: 'aws.2.s3-uri', term: 's3://bucket/key', kind: 'pattern', meaning: 'How the CLI addresses a bucket or an object. Local paths have no scheme; remote ones start with s3://.', example: 'aws s3 cp ledger.json s3://cyberling-ledger-sam/exports/ledger.json' },
    { id: 'aws.2.s3-vs-s3api', term: 'aws s3 vs aws s3api', kind: 'pattern', meaning: 'Two front doors to the same service. s3 has a few friendly file-like verbs (mb, cp, ls, rm, rb, sync); s3api exposes every raw operation with its exact parameters (head-object, put-bucket-policy).', example: 'aws s3 ls s3://b/\naws s3api list-objects-v2 --bucket b' },
    { id: 'aws.2.head-object', term: 'head-object', kind: 'service', meaning: 'Fetch an object\'s metadata (size, type, ETag, last modified) without downloading its bytes. The output keys are the same for every object.', example: 'aws s3api head-object --bucket b --key exports/ledger.json' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Buckets hold objects; objects have keys',
      body: `S3 (Simple Storage Service) stores **objects** in **buckets**. An object is some bytes plus metadata. A bucket is a flat namespace of **keys**: strings that name the objects.

Two facts surprise everyone. First, bucket names are **global**: no two accounts anywhere can own \`cyberling-ledger\`, which is why this track asks for \`cyberling-ledger-<yourname>\`. Second, there are **no folders**. The key \`exports/ledger.json\` is one string; the console draws a folder called \`exports\` because the slash is a convenient *delimiter*, nothing more. Deleting the only object with that prefix makes the "folder" vanish.

A bucket lives in one region (\`us-east-1\` in our examples, or your default region). The CLI has two front doors: \`aws s3\` for a handful of file-like verbs, and \`aws s3api\` for every raw operation with its exact parameters.`,
      example: {
        language: 'shell',
        source: 'aws s3 mb s3://cyberling-ledger-sam --region us-east-1\naws s3 cp ledger.json s3://cyberling-ledger-sam/exports/ledger.json\naws s3 ls s3://cyberling-ledger-sam/exports/\naws s3api head-object --bucket cyberling-ledger-sam --key exports/ledger.json\naws s3 rm s3://cyberling-ledger-sam/exports/ledger.json\naws s3 rb s3://cyberling-ledger-sam',
        labels: [
          { lines: [1, 1], label: 'Make a bucket. The name must be unused by anyone, anywhere.' },
          { lines: [2, 2], label: 'Upload: local path on the left, s3:// URI with the full key on the right.' },
          { lines: [3, 3], label: 'List keys under a prefix. Prints date, time, size and key.' },
          { lines: [4, 4], label: 'Ask for metadata only, through the raw API. Prints JSON.' },
          { lines: [5, 6], label: 'Teardown: remove the object, then the (now empty) bucket.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'Module 6 of the Python track wrote ledger.json with `json.dump(entries, f)`. S3 does not know or care that the bytes are JSON; to it the file is an object with a key and a ContentType. Reading it back as a list of dicts is your job, as it was with `json.load`.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The bucket holds exactly two objects: `reports/2026-01.csv` and `reports-archive/2025.csv`. What does the second command print?',
      code: { language: 'shell', source: 'aws s3 ls s3://cyberling-ledger-sam/\naws s3 ls s3://cyberling-ledger-sam/reports/' },
      choices: [
        'Only 2026-01.csv, because the prefix reports/ matches one key',
        'Both files, because they both start with "reports"',
        'An error: the folder reports does not exist',
        'Nothing, because ls needs --recursive to see inside folders',
      ],
      answer: 'Only 2026-01.csv, because the prefix reports/ matches one key',
      explanation: 'There are no folders, only keys. `ls s3://bucket/reports/` asks for keys beginning with the exact prefix `reports/` and prints the remainder, so `reports-archive/2025.csv` does not match (its prefix is `reports-archive/`). Had you asked for `s3://bucket/reports` without the slash, both would appear, as `PRE reports/` and `PRE reports-archive/`. The first command prints the two "folders" as `PRE` lines because the slash is used as a delimiter.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the commands to create the bucket, upload the export, inspect it, and remove both.',
      language: 'shell',
      indentation: false,
      solution: [
        'aws s3 mb s3://cyberling-ledger-sam',
        'aws s3 cp ledger.json s3://cyberling-ledger-sam/exports/ledger.json',
        'aws s3api head-object --bucket cyberling-ledger-sam --key exports/ledger.json',
        'aws s3 rm s3://cyberling-ledger-sam/exports/ledger.json',
        'aws s3 rb s3://cyberling-ledger-sam',
      ],
      distractors: [
        'aws s3 mkdir s3://cyberling-ledger-sam/exports',
        'aws s3 cp ledger.json cyberling-ledger-sam/exports/ledger.json',
        'aws s3 create-bucket --bucket cyberling-ledger-sam',
      ],
      explanation: 'There is no mkdir because there are no folders: the key `exports/ledger.json` creates the prefix as a side effect. A destination without `s3://` is a local path, so the file would be copied to a directory on your disk. `create-bucket` is the raw operation and belongs to `aws s3api`; the friendly `aws s3` verb is `mb`.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill in the four verbs.',
      language: 'shell',
      template: 'aws s3 {{mb}} s3://cyberling-ledger-sam\naws s3 {{cp}} ledger.json s3://cyberling-ledger-sam/exports/ledger.json\naws s3 {{ls}} s3://cyberling-ledger-sam/exports/\naws s3api {{head}} --bucket cyberling-ledger-sam --key exports/ledger.json',
      blanks: [
        { id: 'mb', answers: ['mb'], hint: 'make bucket' },
        { id: 'cp', answers: ['cp'], hint: 'the same verb as the Unix copy command' },
        { id: 'ls', answers: ['ls'], hint: 'the same verb as the Unix list command' },
        { id: 'head', answers: ['head-object'], hint: 'HTTP HEAD: metadata without the body. s3api verbs are hyphenated.' },
      ],
      explanation: '`aws s3` borrows Unix spelling (mb, cp, ls, rm, rb). `aws s3api` uses the API operation names, lower-cased and hyphenated: head-object, list-objects-v2, put-bucket-policy.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Create the Ledger export bucket in your own account.',
      warning: 'S3 free tier (first 12 months) covers 5 GB of storage and thousands of requests; after that a 1 KB object costs a fraction of a cent per month. An empty bucket costs nothing. The only real exposure is forgetting the bucket exists, so the teardown item is not optional when you finish the module.',
      checklist: [
        'Save this as `ledger.json` in an empty working directory (exactly these three entries; Module 3 reuses them):\n' + LEDGER_JSON,
        'Pick a name: `cyberling-ledger-<yourname>` (lower-case letters, digits and hyphens only, 3 to 63 characters). Run `aws s3 mb s3://cyberling-ledger-<yourname>` in us-east-1 or your default region. If it says BucketAlreadyExists, someone in the world took that name: add digits and try again.',
        'Upload: `aws s3 cp ledger.json s3://cyberling-ledger-<yourname>/exports/ledger.json`.',
        'List it two ways: `aws s3 ls s3://cyberling-ledger-<yourname>/` (expect one `PRE exports/` line) and `aws s3 ls s3://cyberling-ledger-<yourname>/exports/` (expect the file).',
        'Inspect without downloading: `aws s3api head-object --bucket cyberling-ledger-<yourname> --key exports/ledger.json`. Read the JSON it prints.',
        'Teardown: if you are stopping here for more than a day, run `aws s3 rb s3://cyberling-ledger-<yourname> --force` (it empties and deletes). Otherwise keep the bucket: lessons 2-2 to 2-4 use it, and 2-4 deletes it.',
      ],
      verify: { question: 'head-object printed a JSON object. Type the name of the field that holds the object\'s size in bytes.', answers: ['ContentLength', '"ContentLength"'] },
    },
  ],
};

const l22: Lesson = {
  id: 'aws-2-2',
  title: 'Who may read it',
  objective: 'Explain why a new object is unreachable from the internet, and share it for five minutes with a presigned URL instead of making it public.',
  minutes: 30,
  lexicon: [
    { id: 'aws.2.block-public-access', term: 'Block Public Access', kind: 'service', meaning: 'Four account- or bucket-level switches, all on for a new bucket, that refuse any policy or ACL that would grant access to the world even if you write one.', example: 'aws s3api get-public-access-block --bucket cyberling-ledger-sam', analogy: 'A safety catch on a door lock: even with the key turned, the door stays shut. It breaks here: the catch only stops *public* grants, not a mistaken grant to another specific account.' },
    { id: 'aws.2.bucket-policy', term: 'bucket policy', kind: 'concept', meaning: 'A JSON policy attached to the bucket, saying which principals may perform which actions on which resources. IAM policies attach to identities and say what *they* may do; a request is allowed only if nothing denies it and something allows it.', example: 'aws s3api put-bucket-policy --bucket cyberling-ledger-sam --policy file://policy.json' },
    { id: 'aws.2.principal', term: '"Principal": "*"', kind: 'pattern', meaning: 'The "who" of a policy statement. A star means everyone, including anonymous internet users. Block Public Access exists to catch exactly this line.', example: '"Principal": "*", "Action": "s3:GetObject"' },
    { id: 'aws.2.resource-arn', term: 'arn:aws:s3:::bucket/*', kind: 'pattern', meaning: 'The Amazon Resource Name of every object in a bucket. Without the /* it names the bucket itself, which is a different resource for a different set of actions (ListBucket, not GetObject).', example: '"Resource": "arn:aws:s3:::cyberling-ledger-sam/*"' },
    { id: 'aws.2.presign', term: 'aws s3 presign', kind: 'service', meaning: 'Produce a URL that carries your signature and an expiry. Whoever holds it can GET that one object until it expires, with no account and no policy change.', example: 'aws s3 presign s3://cyberling-ledger-sam/exports/ledger.json --expires-in 300', analogy: 'A ticket for one show on one night. It breaks here: a ticket can be checked at the door against a list; a presigned URL cannot be revoked early except by rotating the key that signed it.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'Private by default, and kept that way',
      body: `Everything you put in S3 is **private**: only identities in your account that IAM allows can read it. The notional machine says IAM denies by default, and S3 adds a second layer. Each new bucket has **Block Public Access** switched on, so even if you attach a policy that says "everyone may read", S3 refuses to honour it.

Two kinds of policy can grant access. An **IAM policy** is attached to an identity (your \`learner\` user) and says what that identity may do anywhere. A **bucket policy** is attached to the bucket and says who may do what to *this* bucket. Both are JSON with the same shape: Effect, Principal, Action, Resource.

To let someone outside your account read one file, you do not make the bucket public. You hand them a **presigned URL**: a link that carries your signature and expires.`,
      example: {
        language: 'text',
        source: '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Sid": "PublicReadExports",\n    "Effect": "Allow",\n    "Principal": "*",\n    "Action": "s3:GetObject",\n    "Resource": "arn:aws:s3:::cyberling-ledger-sam/*"\n  }]\n}',
        labels: [
          { lines: [2, 2], label: 'The policy language version. Always this date; it is not today\'s date.' },
          { lines: [4, 5], label: 'Name the statement and say whether it grants or forbids.' },
          { lines: [6, 6], label: 'Who: a star is everyone, anonymous included.' },
          { lines: [7, 7], label: 'Which API action: service, colon, operation name.' },
          { lines: [8, 8], label: 'Which resources: every object in the bucket. The /* is what makes it objects.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'A policy is a dict with string keys, exactly what `json.load` would give you. "Statement" is a list so a policy can carry several rules; the star in Principal is a literal string "*", not a wildcard operator the way it is in a glob.' },
      ],
    },
    {
      kind: 'concept',
      title: 'Sharing without opening the door',
      body: `\`aws s3 presign\` asks the CLI to sign a GET request for one object with *your* credentials and glue the signature into the query string. The result is a long \`https://\` URL. Anyone with it gets the object until \`--expires-in\` seconds pass (default 3600, maximum seven days with long-term keys). Nothing about the bucket changes: Block Public Access stays on, no policy is written.

Strip the query string off that URL and you have the object's plain address. Fetching it anonymously gets a **403 Forbidden**, not a 404: S3 will not even confirm the object exists to someone who may not list the bucket.`,
      example: {
        language: 'shell',
        source: 'URL=$(aws s3 presign s3://cyberling-ledger-sam/exports/ledger.json --expires-in 300)\ncurl -s -o /dev/null -w "%{http_code}\\n" "$URL"\ncurl -s -o /dev/null -w "%{http_code}\\n" "${URL%%\\?*}"',
        labels: [
          { lines: [1, 1], label: 'Sign a five-minute link and keep it in a shell variable.' },
          { lines: [2, 2], label: 'Fetch it; print only the HTTP status. Expect 200.' },
          { lines: [3, 3], label: 'Fetch the same address with the signature cut off. Expect 403.' },
        ],
      },
    },
    {
      kind: 'predict',
      prompt: 'Block Public Access is on and no bucket policy exists. Someone who is not signed in to AWS runs this. What status code do they get?',
      code: { language: 'shell', source: 'curl -s -o /dev/null -w "%{http_code}\\n" https://cyberling-ledger-sam.s3.us-east-1.amazonaws.com/exports/ledger.json' },
      choices: ['403', '404', '200', '401'],
      answer: '403',
      explanation: 'The object exists, but an anonymous request has no identity that any policy allows, so S3 denies it: 403 Forbidden with an AccessDenied body. It is not 404, because telling strangers which keys exist is itself information; S3 only returns 404 for a missing key to a caller who is allowed to list the bucket. It is not 401, because S3 does not ask you to log in; it simply refuses.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the bucket policy that would let anyone read every object under the bucket (you will not apply it yet; 2-4 does, briefly).',
      language: 'text',
      template: '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Sid": "PublicReadExports",\n    "Effect": "{{effect}}",\n    "Principal": "{{principal}}",\n    "Action": "{{action}}",\n    "Resource": "{{resource}}"\n  }]\n}',
      blanks: [
        { id: 'effect', answers: ['Allow'], hint: 'The other value is Deny. Capitalised.' },
        { id: 'principal', answers: ['*'], hint: 'Everyone, in one character.' },
        { id: 'action', answers: ['s3:GetObject'], hint: 'service:Operation; the operation that downloads an object.' },
        { id: 'resource', answers: ['arn:aws:s3:::cyberling-ledger-sam/*'], hint: 'arn:aws:s3:::<bucket>/* for the objects (three colons in a row: S3 ARNs have no region or account).' },
      ],
      explanation: 'Allow, to everyone, the GetObject action, on every object in the bucket. The `/*` matters: `arn:aws:s3:::cyberling-ledger-sam` alone is the bucket resource, on which GetObject means nothing. With Block Public Access on, applying this policy fails with AccessDenied; that is the safety catch working.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the commands to confirm the bucket is still locked down, then share the export for five minutes and check both fetches.',
      language: 'shell',
      indentation: false,
      solution: [
        'aws s3api get-public-access-block --bucket cyberling-ledger-sam',
        'URL=$(aws s3 presign s3://cyberling-ledger-sam/exports/ledger.json --expires-in 300)',
        'curl -s -o /dev/null -w "%{http_code}\\n" "$URL"',
        'curl -s -o /dev/null -w "%{http_code}\\n" "${URL%%\\?*}"',
      ],
      distractors: [
        'aws s3api put-bucket-acl --bucket cyberling-ledger-sam --acl public-read',
        'URL=$(aws s3 presign ledger.json --expires-in 300)',
      ],
      explanation: 'Sharing one file never needs the bucket made public; `public-read` is the thing Block Public Access exists to stop. `presign` takes an `s3://` URI: the object is in the bucket, not on your disk.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Share the export for five minutes without changing a single permission.',
      warning: 'Cost is zero to a fraction of a cent: two GET requests. The real exposure is the URL itself: anyone who gets it can download the file until it expires, so do not paste it anywhere public. Nothing new is created in this lesson, but the bucket from 2-1 still exists; the teardown item covers it.',
      checklist: [
        'Confirm the safety catch: `aws s3api get-public-access-block --bucket cyberling-ledger-<yourname>`. All four values should be true.',
        'Confirm the plain address is refused: `curl -s -o /dev/null -w "%{http_code}\\n" https://cyberling-ledger-<yourname>.s3.<region>.amazonaws.com/exports/ledger.json` (substitute your region, e.g. us-east-1).',
        'Sign a link: `URL=$(aws s3 presign s3://cyberling-ledger-<yourname>/exports/ledger.json --expires-in 300)` then `echo "$URL"` and notice the X-Amz-Signature and X-Amz-Expires parameters.',
        'Fetch it: `curl -s -o /dev/null -w "%{http_code}\\n" "$URL"`.',
        'Cut the signature off and fetch again: `curl -s -o /dev/null -w "%{http_code}\\n" "${URL%%\\?*}"`. Optional: wait six minutes and repeat step 4 to watch the signed link expire.',
        'Teardown: nothing new was created. If you are stopping for more than a day, `aws s3 rb s3://cyberling-ledger-<yourname> --force`; otherwise keep the bucket for 2-3.',
      ],
      verify: { question: 'Type the two status codes you saw, signed fetch first, separated by a space.', answers: ['200 403', '200, 403', '200,403'] },
    },
  ],
};

const l23: Lesson = {
  id: 'aws-2-3',
  title: 'S3 from Python with boto3',
  objective: 'Upload and download an object from a Python script with boto3, read the body as JSON, and list keys page by page.',
  minutes: 30,
  lexicon: [
    { id: 'aws.2.boto3-client', term: 'boto3.client("s3")', kind: 'pattern', meaning: 'Create an object whose methods are the S3 API operations, in snake_case. The CLI\'s head-object is client.head_object(...); every CLI --flag becomes a CamelCase keyword argument.', example: 's3 = boto3.client("s3")\ns3.head_object(Bucket="b", Key="k")' },
    { id: 'aws.2.put-get-object', term: 'put_object / get_object', kind: 'pattern', meaning: 'Upload bytes to a key; fetch an object as a response dict. Both take Bucket= and Key=; put_object also takes Body= (bytes or an open binary file).', example: 's3.put_object(Bucket="b", Key="k", Body=b"[]")\nresp = s3.get_object(Bucket="b", Key="k")' },
    { id: 'aws.2.body-stream', term: 'resp["Body"].read()', kind: 'pattern', meaning: 'get_object does not return the bytes; it returns a dict whose "Body" is a stream. Call .read() once to get bytes, then decode or json.loads.', example: 'data = json.loads(resp["Body"].read())', analogy: 'Like an open file from `open(...)`: you still have to read it. It breaks here: you can read it only once; a second .read() returns b"".' },
    { id: 'aws.2.paginator', term: 'get_paginator("list_objects_v2")', kind: 'pattern', meaning: 'A single list call returns at most 1000 keys and a continuation token. A paginator loops over the pages for you; iterate pages, then each page\'s "Contents".', example: 'for page in s3.get_paginator("list_objects_v2").paginate(Bucket="b"):\n    for obj in page.get("Contents", []):\n        print(obj["Key"])' },
    { id: 'aws.2.credential-chain', term: 'credential chain', kind: 'concept', meaning: 'Where boto3 looks for keys, in order: explicit arguments, environment variables (AWS_ACCESS_KEY_ID), the files aws configure wrote (~/.aws/credentials), then the role of the machine it runs on. Your script names no key, so it works unchanged on your laptop and inside Lambda.', example: 'boto3.client("s3")   # no keys in code, ever' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'The same API, as Python method calls',
      body: `**boto3** is the AWS SDK for Python. \`boto3.client("s3")\` returns an object with one method per API operation, the same operations \`aws s3api\` exposes, renamed to snake_case: \`head-object\` becomes \`head_object\`, and every \`--flag\` becomes a CamelCase keyword argument (\`Bucket=\`, \`Key=\`).

\`put_object\` uploads; \`Body\` may be bytes or an open file in binary mode. \`get_object\` returns a **dict**, not bytes: the data is in \`response["Body"]\`, a stream you \`.read()\` once. Pass the bytes to \`json.loads\` and you are back in the Python you know.

Listing is paged: one call returns at most 1000 keys. A **paginator** hides the continuation tokens.

Where do the credentials come from? Nowhere in the code. boto3 walks the **credential chain**: environment variables, then the files \`aws configure\` wrote, then the role of whatever machine it runs on. That last step is why the same script will later work inside Lambda without a single key.`,
      example: {
        language: 'python',
        source: 'import json\nimport boto3\n\nBUCKET = "cyberling-ledger-sam"\nKEY = "exports/ledger.json"\ns3 = boto3.client("s3")\n\nwith open("ledger.json", "rb") as f:\n    s3.put_object(Bucket=BUCKET, Key=KEY, Body=f)\n\nresponse = s3.get_object(Bucket=BUCKET, Key=KEY)\nentries = json.loads(response["Body"].read())\nprint("entries:", len(entries))\n\nwith open("ledger.json") as f:\n    same = entries == json.load(f)\nprint("round trip:", "ok" if same else "mismatch")',
        labels: [
          { lines: [1, 2], label: 'Standard library for JSON; boto3 for AWS (pip install boto3).' },
          { lines: [4, 6], label: 'Name the target once; make the client. No keys appear: the credential chain finds them.' },
          { lines: [8, 9], label: 'Upload: open in binary mode and hand the file to Body.' },
          { lines: [11, 12], label: 'Download: get_object gives a dict; read the Body stream once, parse the bytes as JSON.' },
          { lines: [13, 17], label: 'Prove the round trip: count entries and compare with the local file.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'In Module 6 you wrote `json.load(f)` on a local file. Here the "file" is the stream in response["Body"]: `json.load(response["Body"])` works too, because the stream has a .read() method, which is all json.load needs (duck typing from Module 7).' },
        { from: 'python', note: 'Errors from boto3 are exceptions, like FileNotFoundError was: catch `s3.exceptions.NoSuchKey` (or the general `botocore.exceptions.ClientError`) with the same try/except you learned in Module 6.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'The bucket exists and you may read it, but nobody has uploaded `exports/missing.json`. What happens?',
      code: { language: 'python', source: 'import boto3\n\ns3 = boto3.client("s3")\nresponse = s3.get_object(Bucket="cyberling-ledger-sam", Key="exports/missing.json")\nprint(response["Body"].read())' },
      choices: [
        'Line 4 raises s3.exceptions.NoSuchKey (a ClientError) and line 5 never runs',
        'Line 5 prints b"" because the body is empty',
        'Line 4 returns None and line 5 raises TypeError',
        'Line 4 creates an empty object with that key and line 5 prints b""',
      ],
      answer: 'Line 4 raises s3.exceptions.NoSuchKey (a ClientError) and line 5 never runs',
      explanation: 'boto3 turns every error response into an exception: a missing key is a 404 from S3, surfaced as `s3.exceptions.NoSuchKey`, a subclass of `botocore.exceptions.ClientError`. Nothing is returned, so the print never runs. Note the contrast with lesson 2-2: an *anonymous* caller gets 403 for a missing key, but you may list the bucket, so you are told 404/NoSuchKey. S3 never creates objects on read; only put_object writes.',
    },
    {
      kind: 'parsons',
      prompt: 'Assemble the upload-and-read-back script. Indentation counts.',
      language: 'python',
      indentation: true,
      solution: [
        'import json',
        'import boto3',
        's3 = boto3.client("s3")',
        'with open("ledger.json", "rb") as f:',
        '    s3.put_object(Bucket="cyberling-ledger-sam", Key="exports/ledger.json", Body=f)',
        'response = s3.get_object(Bucket="cyberling-ledger-sam", Key="exports/ledger.json")',
        'entries = json.loads(response["Body"].read())',
        'print("entries:", len(entries))',
      ],
      distractors: [
        's3 = boto3.client("s3", access_key="AKIA...", secret="...")',
        'entries = json.loads(response)',
        'entries = json.loads(response["Body"])',
        'with open("ledger.json") as f:',
      ],
      explanation: 'Keys never go in code: the credential chain finds them (and those keyword names do not even exist). get_object returns a dict, and its "Body" is a stream, so you must `.read()` it before json.loads can see bytes. Upload with "rb": Body wants bytes, and a text-mode file would hand boto3 str.',
    },
    {
      kind: 'cloze',
      prompt: 'Complete the listing that prints every key under exports/, however many there are.',
      language: 'python',
      template: 'import boto3\n\ns3 = boto3.client("s3")\npaginator = s3.get_paginator("{{op}}")\nfor page in paginator.paginate(Bucket="cyberling-ledger-sam", Prefix="exports/"):\n    for obj in page.get("{{contents}}", []):\n        print(obj["{{key}}"], obj["Size"])',
      blanks: [
        { id: 'op', answers: ['list_objects_v2'], hint: 'The CLI operation list-objects-v2, in snake_case.' },
        { id: 'contents', answers: ['Contents'], hint: 'The response field that holds the list of objects. Absent on an empty page, hence .get with a default.' },
        { id: 'key', answers: ['Key'], hint: 'Each object dict has Key, Size, LastModified, ETag.' },
      ],
      explanation: 'A paginator is created from the operation name and iterated page by page. Each page is the same dict `aws s3api list-objects-v2` prints: the objects are under "Contents", and an empty bucket omits that field entirely, which is why `.get("Contents", [])` is safer than `page["Contents"]`.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Read the export back from Python.',
      warning: 'Two requests and one 1 KB object: free tier, or well under a cent outside it. The bucket from 2-1 is still the only resource; the teardown item covers it.',
      checklist: [
        'Install the SDK in a virtual environment: `python3 -m venv .venv && source .venv/bin/activate && pip install boto3`.',
        'In the directory that holds `ledger.json` from 2-1, save the 17-line script from the concept step as `roundtrip.py`, replacing `cyberling-ledger-sam` with your bucket name.',
        'Run `python3 roundtrip.py`. It should print two lines.',
        'Confirm from the CLI that the object was (re)written: `aws s3 ls s3://cyberling-ledger-<yourname>/exports/`; the timestamp is now.',
        'Try the failure for yourself: change KEY to `exports/missing.json`, rerun, read the traceback, then change it back. Optional: wrap get_object in try/except s3.exceptions.NoSuchKey and print a friendly message.',
        'Teardown: nothing new in AWS was created. If you are stopping for more than a day, `aws s3 rb s3://cyberling-ledger-<yourname> --force`; otherwise keep the bucket for the milestone in 2-4.',
      ],
      verify: { question: 'Type the exact text of the last line the script printed.', answers: ['round trip: ok'] },
    },
  ],
};

const l24: Lesson = {
  id: 'aws-2-4',
  title: 'Project: a website for five minutes, then nothing',
  objective: 'Turn the bucket into a static website, explain why real sites put CloudFront in front, then disable hosting and delete the bucket completely.',
  minutes: 30,
  lexicon: [
    { id: 'aws.2.website', term: 'aws s3 website', kind: 'service', meaning: 'Turn on static website hosting for a bucket: S3 answers plain HTTP at a special endpoint and serves objects as pages. It needs public reads, so Block Public Access must be relaxed for it to work.', example: 'aws s3 website s3://cyberling-ledger-sam/ --index-document index.html' },
    { id: 'aws.2.index-document', term: 'index document', kind: 'concept', meaning: 'The object S3 serves when a request names the root (or a "folder" prefix) instead of a key. Conventionally index.html; set per bucket.', example: 'http://cyberling-ledger-sam.s3-website-us-east-1.amazonaws.com/   # serves index.html' },
    { id: 'aws.2.cloudfront', term: 'CloudFront', kind: 'service', meaning: 'AWS\'s content delivery network: caches your objects at edge locations near users, terminates HTTPS with your own domain, and can read a *private* bucket on your behalf. The production way to serve a site from S3.', example: 'Browser -> CloudFront (HTTPS, cached) -> private S3 bucket', analogy: 'A chain of newsstands that stock copies of one newspaper. It breaks here: a newsstand sells yesterday\'s paper until it runs out; CloudFront serves a cached copy until its TTL expires or you invalidate it, which costs money past the first 1000 paths a month.' },
    { id: 'aws.2.rb-force', term: 'aws s3 rb --force', kind: 'pattern', meaning: 'Delete every object (all current versions) and then the bucket in one command. Without --force an S3 bucket must be empty before rb succeeds.', example: 'aws s3 rb s3://cyberling-ledger-sam --force', analogy: 'rm -r for a directory. It breaks here: if versioning was ever enabled, old versions survive --force and you must delete them with s3api first.' },
  ],
  steps: [
    {
      kind: 'concept',
      title: 'S3 can be a web server, barely',
      body: `An S3 bucket can serve objects over plain HTTP as a **static website**. \`aws s3 website\` sets the **index document** (what to serve for \`/\`) and optionally an error document, and the bucket gets a second hostname of the form \`<bucket>.s3-website-<region>.amazonaws.com\`.

Anonymous browsers need to read the objects, so the website endpoint only works once you turn off Block Public Access for the bucket and attach the policy from 2-2. Until then it returns 403, which is a good thing to see once.

Nobody ships a real site this way. The endpoint is HTTP only, on an AWS hostname, served from one region. **CloudFront** fixes all three: HTTPS with your domain, copies cached near every user, and it can read a bucket that stays *private*, so Block Public Access never comes off. This lesson shows the raw mechanism so that CloudFront makes sense later, then removes everything.

Teardown is the milestone. \`aws s3 rb --force\` empties the bucket and deletes it; the name becomes available to the world again shortly after.`,
      example: {
        language: 'shell',
        source: 'echo "<h1>CyberLing Ledger</h1>" > index.html\naws s3 cp index.html s3://cyberling-ledger-sam/index.html --content-type text/html\naws s3 website s3://cyberling-ledger-sam/ --index-document index.html\naws s3api put-public-access-block --bucket cyberling-ledger-sam --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false\naws s3api put-bucket-policy --bucket cyberling-ledger-sam --policy file://policy.json\ncurl -s -o /dev/null -w "%{http_code}\\n" http://cyberling-ledger-sam.s3-website-us-east-1.amazonaws.com/\naws s3api delete-bucket-website --bucket cyberling-ledger-sam\naws s3 rb s3://cyberling-ledger-sam --force\naws s3 ls s3://cyberling-ledger-sam/',
        labels: [
          { lines: [1, 2], label: 'A one-line page, uploaded with the right ContentType so browsers render it.' },
          { lines: [3, 3], label: 'Turn on hosting and name the index document.' },
          { lines: [4, 5], label: 'Relax only the two policy switches, then attach the 2-2 policy. The ACL switches stay on.' },
          { lines: [6, 6], label: 'Fetch the website endpoint (HTTP, not HTTPS). Expect 200 once the policy is in place.' },
          { lines: [7, 8], label: 'Teardown: hosting off, then empty and delete the bucket in one command.' },
          { lines: [9, 9], label: 'Prove it is gone: listing a deleted bucket is an error with a specific code.' },
        ],
      },
      contrast: [
        { from: 'python', note: 'rb --force is the cloud version of deleting a directory tree: irreversible, no bin. Your local ledger.json is untouched; the copy in S3 is gone for good, exactly as `os.remove` leaves nothing to undo.' },
      ],
    },
    {
      kind: 'predict',
      prompt: 'You have uploaded index.html and run `aws s3 website`, but Block Public Access is still fully on and no policy is attached. What does this print?',
      code: { language: 'shell', source: 'curl -s -o /dev/null -w "%{http_code}\\n" http://cyberling-ledger-sam.s3-website-us-east-1.amazonaws.com/' },
      choices: ['403', '200', '404', '301'],
      answer: '403',
      explanation: 'Website hosting changes how S3 answers (index documents, HTML error pages) but not who may read. The browser is anonymous, no policy allows it, so S3 returns 403 Forbidden. 404 would mean "no index.html" on a bucket that already allows public reads. The lesson\'s next steps relax Block Public Access and attach the policy, and only then does the same command print 200.',
    },
    {
      kind: 'parsons',
      prompt: 'Order the teardown so that each command can succeed, ending with the proof.',
      language: 'shell',
      indentation: false,
      solution: [
        'aws s3api delete-bucket-website --bucket cyberling-ledger-sam',
        'aws s3api delete-bucket-policy --bucket cyberling-ledger-sam',
        'aws s3 rb s3://cyberling-ledger-sam --force',
        'aws s3 ls s3://cyberling-ledger-sam/',
      ],
      distractors: [
        'aws s3 rb s3://cyberling-ledger-sam',
        'aws s3 rm s3://cyberling-ledger-sam',
        'aws s3api delete-bucket --bucket cyberling-ledger-sam/*',
      ],
      explanation: 'Without --force, rb refuses a non-empty bucket (BucketNotEmpty). `rm` on a bucket URI with no key and no --recursive deletes nothing. `delete-bucket` is the raw operation, but it takes a bare bucket name and also refuses a non-empty bucket; the /* belongs in policy ARNs, not here. Removing the policy before deleting is not strictly required (it dies with the bucket) but makes the state readable if a step fails midway.',
    },
    {
      kind: 'cloze',
      prompt: 'Fill in the hosting command, the website endpoint and the teardown.',
      language: 'shell',
      template: 'aws s3 {{website}} s3://cyberling-ledger-sam/ --index-document {{index}}\ncurl -s -o /dev/null -w "%{http_code}\\n" http://cyberling-ledger-sam.{{host}}.amazonaws.com/\naws s3api delete-bucket-website --bucket cyberling-ledger-sam\naws s3 rb s3://cyberling-ledger-sam {{force}}',
      blanks: [
        { id: 'website', answers: ['website'], hint: 'The aws s3 verb that turns on hosting.' },
        { id: 'index', answers: ['index.html'], hint: 'The conventional index document.' },
        { id: 'host', answers: ['s3-website-us-east-1'], hint: 'Not the API hostname (s3.us-east-1): the website one has a hyphen and the word website, then the region.' },
        { id: 'force', answers: ['--force'], hint: 'Empty the bucket as part of removing it.' },
      ],
      explanation: 'The website endpoint is a different hostname from the API endpoint (`s3-website-<region>` versus `s3.<region>`), speaks only HTTP, and is what CloudFront or a DNS record would point at. `rb --force` is the one-command teardown.',
    },
    {
      kind: 'fieldwork',
      prompt: 'Milestone: host a page from the bucket, then remove every trace of the bucket.',
      warning: 'For the few minutes between step 5 and step 8 your index.html and ledger.json are readable by anyone on the internet who guesses the URL. Put nothing private in that bucket (the three fixture entries are fine). Cost: a handful of requests, free tier or under a cent. After step 8 nothing exists, so nothing can be billed; if `rb` fails, fix it before you stop, because a forgotten bucket is the usual cause of a surprise invoice. If your organisation has account-level Block Public Access on, step 7 will keep returning 403: skip to step 8; the milestone check still works.',
      checklist: [
        'Create the page: `echo "<h1>CyberLing Ledger</h1>" > index.html` and upload it: `aws s3 cp index.html s3://cyberling-ledger-<yourname>/index.html --content-type text/html`.',
        'Turn on hosting: `aws s3 website s3://cyberling-ledger-<yourname>/ --index-document index.html`. Check with `aws s3api get-bucket-website --bucket cyberling-ledger-<yourname>`.',
        'Fetch the endpoint before opening it: `curl -s -o /dev/null -w "%{http_code}\\n" http://cyberling-ledger-<yourname>.s3-website-<region>.amazonaws.com/`. Expect 403 (region is us-east-1 or your default).',
        'Save the 2-2 policy as `policy.json` with your bucket name in the Resource ARN.',
        'Relax the two policy switches only: `aws s3api put-public-access-block --bucket cyberling-ledger-<yourname> --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false`.',
        'Attach it: `aws s3api put-bucket-policy --bucket cyberling-ledger-<yourname> --policy file://policy.json`.',
        'Repeat the curl from step 3; expect 200. Open the URL in a browser to see the heading. Notice the browser warns the page is not secure: HTTP only.',
        'Teardown, all of it: `aws s3api delete-bucket-website --bucket cyberling-ledger-<yourname>`, `aws s3api delete-bucket-policy --bucket cyberling-ledger-<yourname>`, then `aws s3 rb s3://cyberling-ledger-<yourname> --force`.',
        'Prove it: `aws s3 ls s3://cyberling-ledger-<yourname>/` and read the error. Also run `aws s3 ls` with no argument and confirm the bucket is not listed.',
      ],
      verify: { question: 'Listing the deleted bucket printed "An error occurred (...) when calling the ListObjectsV2 operation". Type the error code in the parentheses.', answers: ['NoSuchBucket'] },
    },
  ],
};

export const m2: Module = {
  id: 'aws-m2',
  title: 'Storage: S3',
  goal: 'Buckets, objects, permissions, static hosting, the CLI and boto3.',
  projectMilestone: 'Ledger exports saved to a bucket.',
  status: 'available',
  lessons: [l21, l22, l23, l24],
};
