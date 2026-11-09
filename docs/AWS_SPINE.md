# AWS track: "Ship the Ledger" project spine

Deploy the Python Ledger as a tiny serverless API, one service per module, then describe it all as code and tear it down. The learner has completed the Python track.

## Rules for cloud lessons

- Step kinds allowed: `concept`, `predict`, `parsons`, `cloze`, `fieldwork`. **No `modify`/`create`**: nothing executes in-app. Code samples use `language: 'shell'` for CLI, `'python'` for boto3/Lambda handlers (read-only), `'text'` for JSON/YAML.
- Every lesson that creates a resource ends with a teardown item in its fieldwork checklist, and the `warning` field states the cost exposure honestly (free tier or cents).
- Fieldwork `verify.answers` must be facts that are identical for every learner: HTTP status codes, JSON field names, CLI output keys, fixed strings the lesson told them to use. Never account ids, ARNs, timestamps or bucket names.
- Names: resource group of ideas is the prefix `cyberling-`; bucket names must be globally unique, so lessons say `cyberling-ledger-<yourname>`.
- Region: lessons use `us-east-1` in examples and say "or your default region".
- Predict steps target real behaviour: what a command prints, what IAM denies by default, what happens to data when a resource is deleted, eventual consistency, pricing dimensions.

## The project at each milestone

| Module | Service | Milestone (observable) |
|---|---|---|
| 1 (done) | Account, IAM, CLI | `aws sts get-caller-identity` works as an IAM user with MFA on root and a billing alarm. |
| 2 | S3 | A bucket `cyberling-ledger-<name>` holding `ledger.json` uploaded by the CLI and read back by boto3 (`s3.get_object`). Static website hosting demonstrated and then disabled. Teardown: `aws s3 rb --force`. |
| 3 | Lambda | A function `cyberling-classify` (Python 3.12) whose handler takes `{"amount": -40}` and returns `{"kind": "expense"}`; invoked with `aws lambda invoke`; logs seen in CloudWatch. Teardown: delete function and log group. |
| 4 | API Gateway | HTTP API with `POST /entries` → the Lambda; `curl -X POST` returns 200 with the JSON body; CORS explained. Teardown: delete API. |
| 5 | DynamoDB | Table `LedgerEntries` (partition key `owner`, sort key `ts`); Lambda writes an item per POST and `GET /balance` sums items with `Query`; on-demand billing. Teardown: delete table. |
| 6 | Observe and secure | The Lambda's execution role allows only `dynamodb:PutItem/Query` on that one table ARN; CloudWatch metric + alarm on errors; structured logging. |
| 7 | Infrastructure as code | The whole stack in an AWS SAM template (`template.yaml`): `sam build && sam deploy --guided` creates it, `sam delete` removes it. Final fieldwork verifies by the stack status string `CREATE_COMPLETE` and the HTTP code from the deployed POST. |

## Lesson shape

Each module: 3–4 lessons, 20–35 minutes. Typical sequence: concept (service model + the CLI grammar) → predict (behaviour) → parsons (order the CLI steps or assemble a policy/JSON) → cloze (fill flags/keys) → fieldwork (do it, verify, tear down). The last lesson of each module is the milestone fieldwork. Contrast notes `from: 'python'` connect boto3 calls to the CLI; module 7 contrasts SAM with hand-clicking.
