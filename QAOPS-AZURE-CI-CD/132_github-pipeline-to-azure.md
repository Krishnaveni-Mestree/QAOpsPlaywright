# GitHub Actions Pipeline -> Azure Playwright Workspaces

## Goal
Make the GitHub Actions pipeline run our tests on **Azure cloud browsers** (not on the GitHub machine) and publish the report to Azure.
Lecture 131 explained the sample YAML. This lecture changes it. The finished file is [playwright.yml](../../.github/workflows/playwright.yml).

## Big picture (what talks to what)
```
git push -> GitHub Actions starts an Ubuntu machine
              |-- checkout code, install Node, npm ci
              |-- azure/login  (proves who we are, using the service principal secret)
              '-- npx playwright test --config=playwright.service.config.js
                        |  (PLAYWRIGHT_SERVICE_URL says which Azure region/workspace)
                        v
               Azure Playwright Workspace: browsers run here, in parallel
                        |  (reporter uploads results; needs storage role)
                        v
               Storage account + Azure portal report dashboard
```
The Ubuntu machine only **downloads code and hands over**. The browsers run in Azure.

## Why we can't keep the sample as it is
1. `npx playwright test` would run the tests on the GitHub machine, so we'd never use Azure. We need `--config=playwright.service.config.js`.
2. From your laptop, `az login` proved who you were. From GitHub, **nobody is logged in**, so Azure would refuse the connection. We need a non-human identity for the pipeline.
3. The cloud config needs `PLAYWRIGHT_SERVICE_URL` (the browser endpoint). On your laptop it was in a local `.env`. In GitHub it must be set as a repository variable.
4. The uploaded results/traces go to a storage account, so that identity needs permission on it.
5. We don't need to install browsers on Ubuntu (Azure has them), so we remove that step. This saves time.

## Step A: create the service principal (the pipeline's identity)
A **service principal** is a "bot account" in Azure. **RBAC** = role-based access control (you give an identity a role on a scope).
Run as **one line** (see "Mistakes we hit"):
```bash
az ad sp create-for-rbac --name "github-playwright" --role "Contributor" --scopes "/subscriptions/<subscription-id>/resourceGroups/<resource-group>" --json-auth
```
| Part | Meaning |
|---|---|
| `az ad sp create-for-rbac` | Create a service principal and give it a role in one go |
| `--name "github-playwright"` | Name of the bot. Reuse the same name in later commands |
| `--role "Contributor"` | What it may do. Contributor can create/manage resources, which is enough to run tests in the workspace |
| `--scopes ".../resourceGroups/<rg>"` | **Where** the role applies: only this resource group (ours is `rrd`, which holds the Playwright workspace) |
| `--json-auth` | Print the credentials as JSON that GitHub's `azure/login` understands (`clientId`, `clientSecret`, `subscriptionId`, `tenantId`, plus endpoint URLs) |

The output contains a **`clientSecret`**. It is like a password and is shown **only once**.

## Step B: give the bot access to the storage account
The Playwright reporter uploads results, screenshots and traces to the storage account. Contributor on the resource group is **not enough** for the data inside storage, so we add a data role:
```bash
az role assignment create --assignee "$(az ad sp list --display-name 'github-playwright' --query '[0].appId' -o tsv)" --role "Storage Blob Data Contributor" --scope "$(az storage account show --name <storage-account> --resource-group <resource-group> --query id -o tsv)"
```
| Part | Meaning |
|---|---|
| `--assignee "$(az ad sp list ...)"` | Looks up the **appId** (clientId) of `github-playwright`. `$(...)` runs the inner command first and pastes the result |
| `--role "Storage Blob Data Contributor"` | Read/write/delete blobs (files) in storage |
| `--scope "$(az storage account show ...)"` | The **resource ID** of our storage account (ours: `pwstrgrrd8a05` in `rrd`) |

Your result confirmed it worked: `principalType: ServicePrincipal` and `scope: .../storageAccounts/pwstrgrrd8a05`.
Use **your** storage account name and the same bot name you used in Step A.

## Step C: store the credentials in GitHub
Repo -> **Settings** -> **Secrets and variables** -> **Actions**.
| Tab | Name | Value | Why this tab |
|---|---|---|---|
| **Secrets** | `AZURE_CREDENTIALS` | the **entire JSON** from Step A | It contains a password -> hidden, never shown in logs |
| **Variables** | `PLAYWRIGHT_SERVICE_URL` | the workspace's regional browser endpoint (Azure portal -> workspace -> Get started / endpoint) | Not sensitive -> visible, editable |

In YAML: `${{ secrets.NAME }}` reads a secret; `${{ vars.NAME }}` reads a variable.

## Step D: the workflow changes
Final steps in [playwright.yml](../../.github/workflows/playwright.yml) (every line is commented in the file):
```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: lts/*
- name: Install dependencies
  run: npm ci
# Install Playwright Browsers step REMOVED (browsers run in Azure)

- name: Azure Login
  uses: azure/login@v2
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: Run Playwright tests
  env:
    PLAYWRIGHT_SERVICE_URL: ${{vars.PLAYWRIGHT_SERVICE_URL}}
  run: npx playwright test --config=playwright.service.config.js --workers=4

- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```
| Change | Why |
|---|---|
| **Azure Login** step (before the tests) | Signs the runner in as the bot. `azure/login` is an **action**. It reads the JSON from the secret |
| **`env: PLAYWRIGHT_SERVICE_URL`** | Gives the test command the cloud endpoint. `env` must sit at the same level as `run` (indentation matters) |
| **`--config=playwright.service.config.js`** | Runs tests through the Azure service config |
| **Removed browser install** | Azure provides the browsers |
| `npm ci` kept | Installs `@azure/playwright` and `@azure/identity` from `package.json`. The lecture's "getting started" install step is covered by this |

**How the login reaches the tests:** `playwright.service.config.js` uses `credential: new DefaultAzureCredential()`. It tries several sources, including the **Azure CLI session** that `azure/login` just created, so no extra code is needed.

## Where to put the YAML (reminder)
`.github/workflows/<any-name>.yml` at the project root. Commit and push it. The push (to `main`) then triggers the run. Pushing a workflow file also needs the **Workflows** permission on your token (see 130).

## Mistakes we hit (and what they meant)
| Symptom | Cause | Fix |
|---|---|---|
| `unrecognized arguments: --name ... --scopes ...` | Pasted with `\` followed by a space, so it became one broken argument | Put the command on one line, or make sure `\` is the **last character** on the line |
| `zsh: no matches found: '[0].appId'` and `Cannot find user or service principal ... '“”'` | Curly quotes `“ ” ‘ ’` and em dashes `—` (from a doc/chat) instead of plain `" '` and `--` | Retype with plain ASCII quotes and two hyphens. Zsh treats unquoted `[0]` as a file pattern |
| Empty `--assignee` | The `$(az ad sp list ...)` lookup failed or returned nothing | Run the inner command alone first to confirm it prints a GUID |

## Security: important
- **The `clientSecret` is a password.** Never paste it into chat, notes, code, screenshots, or commits. Only into the GitHub secret.
- If it was exposed anywhere (for example pasted in a chat), **rotate it** and update the GitHub secret:
  ```bash
  az ad sp credential reset --id "$(az ad sp list --display-name 'github-playwright' --query '[0].appId' -o tsv)" --json-auth 2>/dev/null
  ```
  (Some CLI versions don't accept `--json-auth` on `credential reset`. Then reset it and build the JSON from `appId`, `password`, `tenant`, plus your subscription ID.) Afterwards update `AZURE_CREDENTIALS` in GitHub.
- **Public repo + pull requests:** secrets are **not** available to workflows triggered by PRs from **forks**, so the Azure Login step fails for them. That is expected and protects you. Also, never feed untrusted values (PR titles, branch names) into the login inputs.
- The credential has **Contributor on the whole resource group**. Treat it carefully, and keep the group limited to this project's resources.
- Secret expiry: `create-for-rbac` secrets expire (usually 1 year). When the login starts failing, rotate it.

## Changes vs. the lecture / official docs (checked today)
| Topic | Lecture said | What the docs/tools say now |
|---|---|---|
| `azure/login` version | "V3 is latest, V2 stable" | Official README: **v3 = supported, v2 = maintenance mode (security fixes only), v1 = end of life**. Our file uses `@v2` and works. Moving to `@v3` is recommended. Do not use `@master`. Pinning to a full commit SHA is the strictest option |
| Auth method | Service principal JSON in a secret (`creds`) | README says **OIDC (federated credentials) is recommended** for better security: no long-lived secret, `azure/login` uses `client-id`, `tenant-id`, `subscription-id` and the workflow needs `permissions: id-token: write`. The secret-JSON way still works |
| `--json-auth` | Use `--json-auth` | Azure CLI printed `Option '--sdk-auth' has been deprecated and will be removed in a future release` even with `--json-auth`. The output works today, but Microsoft is steering to OIDC |
| Product name / package | "Playwright workspace" | Docs now call it **Playwright Workspaces**; the package is `@azure/playwright` (`npm init @azure/playwright@latest`), which is what our project uses. Older tutorials mention "Microsoft Playwright Testing" and `@azure/microsoft-playwright-testing`. Don't mix them |
| Service auth in docs | `az login` then run | Docs: **Microsoft Entra ID is the default and recommended** auth. **Access tokens** also exist but are discouraged ("like long-lived passwords") |
| Endpoint variable | `PLAYWRIGHT_SERVICE_URL` | Unchanged: the docs still use `PLAYWRIGHT_SERVICE_URL`, set to the **region-specific** endpoint of your workspace |
| `azure/login` warning | not mentioned | README: only pass `${{ secrets.* }}` into `creds`/`client-id`/`tenant-id`/`subscription-id`; set `AZURE_CORE_OUTPUT=none` to keep CLI output out of logs; leave `enable-AzPSSession` unset unless you use PowerShell |

Not verified: Microsoft's dedicated **CI/CD page** for Playwright Workspaces returned 404 for every URL I tried, so I could not compare it line by line. Open `https://aka.ms/pww/docs` (also linked from our service config) and check the CI section for newer steps or roles.

## Optional: the OIDC version (more secure, no stored password)
Not needed for the course, but this is the direction of the docs:
```yaml
permissions:
  id-token: write   # lets the job request a short-lived token
  contents: read
...
- name: Azure Login (OIDC)
  uses: azure/login@v3
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```
You also add a **federated credential** to the app registration (Entra ID -> App registrations -> `github-playwright` -> Certificates & secrets -> Federated credentials -> GitHub Actions, for your repo and `main` branch). The same two role assignments (Contributor on the resource group, Storage Blob Data Contributor on the storage account) still apply.

## Checklist before the first run
- [ ] Service principal created (Step A); Storage role assigned (Step B)
- [ ] Secret `AZURE_CREDENTIALS` and variable `PLAYWRIGHT_SERVICE_URL` created (Step C)
- [ ] Workflow updated and pushed to `main` (Step D)
- [ ] Old/exposed secret rotated
- [ ] Next lecture: watch the run in the **Actions** tab and the report in the Azure portal

## Quick recap
- GitHub runner = only checks out code and hands over. Azure runs the browsers.
- Identity: service principal + `azure/login`. Config: secret (password JSON) + variable (endpoint URL).
- Permissions: Contributor (resource group) + Storage Blob Data Contributor (storage account).
- Command: `npx playwright test --config=playwright.service.config.js --workers=4`.
