# Azure track: "Ship LedgerSharp" project spine

Deploy the C# LedgerSharp API to Azure, one service per module, then describe it in Bicep and delete the resource group. The learner has completed the C# track and the AWS track, so every lesson carries a `contrast: [{ from: 'aws', ... }]` note mapping names.

## Rules for cloud lessons

Same as docs/AWS_SPINE.md: only `concept`, `predict`, `parsons`, `cloze`, `fieldwork`; no in-app execution; teardown in every creating lesson; verification answers that are identical for all learners (HTTP codes, JSON field names, fixed strings, CLI output keys); honest `warning` text about cost.

- CLI: `az` with `--resource-group cyberling-rg` everywhere; `--location westeurope` in examples, "or the region nearest you".
- Names that must be globally unique (storage accounts, web apps) are written `cyberlingstore<yourname>` and `cyberling-api-<yourname>`.
- Every module's first fieldwork creates (or confirms) `cyberling-rg`; the last fieldwork of the track deletes it, and lessons remind learners that `az group delete` is the universal cleanup.

## The project at each milestone

| Module | Service | Milestone (observable) |
|---|---|---|
| 1 (done) | Subscription, Entra ID, CLI | `az account show` works, MFA on, budget alert, a resource group created and deleted. |
| 2 | Storage | Storage account + blob container `ledger`; `ledger.json` uploaded via `az storage blob upload` and read via the .NET SDK (`BlobClient.DownloadContent`); Table Storage introduced for later. |
| 3 | Functions | Function app (dotnet-isolated) with an HTTP trigger `classify`: POST `{"amount": -40}` → `{"kind": "expense"}`; run locally with Core Tools, then `func azure functionapp publish`. |
| 4 | App Service | LedgerSharp minimal API deployed with `az webapp up`; `GET /balance` returns JSON; app settings vs code; deployment slots explained. |
| 5 | Table Storage and Cosmos DB | Entries persisted in Table Storage (`PartitionKey` = owner, `RowKey` = timestamp); `GET /balance` sums a partition query; Cosmos DB contrasted (when to pay for it). |
| 6 | Observe and secure | Application Insights wired in; a managed identity for the web app with the `Storage Table Data Contributor` role on the one storage account; no connection strings in config. |
| 7 | Infrastructure as code | Everything in `main.bicep`; `az deployment group create` with `--what-if` first; final fieldwork verifies by the deployment `provisioningState` value `Succeeded` and the HTTP code from the deployed POST; then `az group delete`. |

## Lesson shape

3–4 lessons per module, 20–35 minutes: concept → predict → parsons → cloze → fieldwork, with the milestone fieldwork last. Contrast notes: `from: 'aws'` on every concept step (S3 ≈ Blob, Lambda ≈ Functions, API Gateway ≈ App Service routes / Functions HTTP trigger, DynamoDB ≈ Table/Cosmos, IAM role ≈ managed identity + RBAC, SAM ≈ Bicep).
