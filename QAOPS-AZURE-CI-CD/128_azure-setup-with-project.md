# Connecting the Local Project to Azure Playwright Workspaces (5-step setup)

## Goal
Connect our local Playwright project to the Azure **Playwright workspace** created in `127_azure-intro.md`, so that tests we start
from our laptop run on **Azure's cloud browsers** and the reports can be stored in Azure. This is still the **local** part
(no GitHub Actions yet). Follows Microsoft's "Get started to run high-scale parallel tests" guide.

## Big picture
```
Local VS Code project
  1. npm package @azure/playwright   -> knows HOW to talk to the cloud
  2. az login                         -> proves WHO you are (your own Azure account, securely)
  3. PLAYWRIGHT_SERVICE_URL           -> tells it WHICH workspace/region to use
  4. storage account + role + reporter-> lets it STORE reports from every run
  5. npx playwright test -c playwright.service.config.js --workers=20   -> runs the tests in the cloud (next lecture)
```

---

## Step 1 - Install the Playwright service package
```bash
npm init @azure/playwright@latest
```
- Run from the **project root** (the folder with `package.json`).
- `npm init <package>` runs the package's own setup tool (here `@azure/create-playwright`). It asked "Ok to proceed? (y)" because it downloads that tool first.
- What it did for us (confirmed in this project):
  - Ran `npm install --save-dev @azure/playwright @azure/identity` -> both now appear in `package.json`.
    - `@azure/playwright`: connects Playwright to the cloud workspace.
    - `@azure/identity`: gives `DefaultAzureCredential`, which reuses your `az login` session to authenticate (no password in code).
  - Created **`playwright.service.config.js`** (explained below).
- Verify: open `package.json` and look for `@azure/playwright`.

## Step 2 - Authenticate: `az login`
- `az` is the **Azure CLI**. It is not installed by default, so install it first:
  - **macOS** (what we used): `brew update && brew install azure-cli` (needs Homebrew; it installed v2.91.0 and linked `az` to `/opt/homebrew/bin/az`).
  - **Windows**: download the **MSI installer** (next-next-next) or use `winget`, then **restart the terminal** so `az` is recognized.
- Then:
  ```bash
  az login
  ```
  - A browser opens -> sign in to your Azure account -> the terminal shows your **tenant** and **subscription** (e.g. "Azure subscription 1", tenant "Default Directory").
  - It asks to select a subscription/tenant: with only one, just press **Enter**.
  - If you belong to several tenants: `az login --tenant <TenantID>`, using the tenant linked to your workspace.
- Why: there are millions of cloud accounts; this securely creates the "tunnel" so tests go to **your own** account.

## Step 3 - Tell it which workspace: `PLAYWRIGHT_SERVICE_URL`
```bash
export PLAYWRIGHT_SERVICE_URL=wss://<region>.api.playwright.microsoft.com/playwrightworkspaces/<workspace-id>/browsers
```
- Copy the exact value from the portal's **Get started** page for your workspace (it contains your region, e.g. `eastus`, and the workspace ID).
- `wss://` = secure WebSocket: the **browser endpoint** our tests connect to for remote browsers.
- **No spaces around `=`.** The doc page shows `PLAYWRIGHT_SERVICE_URL = wss://...` with spaces, which does not work in bash/zsh.
- `export` only lasts for **that terminal session**. After closing the terminal (or opening a new one) you must run it again.
  - Windows PowerShell equivalent: `$env:PLAYWRIGHT_SERVICE_URL="wss://..."`.

## Step 4 - Reporting: store reports in Azure (optional but we want it)
Reports of past runs need somewhere to live -> a **storage account** linked to the workspace.

**4.1 Enable reporting and link a storage account** (Azure portal -> your workspace)
- **Settings -> Storage configuration** -> toggle **Reporting = Enabled** -> create a new storage account or select an existing one -> **Save**.

**4.2 Give YOUR user permission to write to that storage ("RBAC")**
- By default you have **no** permission to upload into the storage account. Two ways:
  - Portal: storage account -> **Access Control (IAM)** -> **Add role assignment** -> role **Storage Blob Data Contributor** -> add everyone who runs tests -> Review + assign.
  - Or one CLI command (what the lecture did):
  ```bash
  az role assignment create \
    --assignee "<your-user-object-id>" \
    --role "Storage Blob Data Contributor" \
    --scope "$(az storage account show --name <storage-account-name> --resource-group <resource-group> --query id -o tsv)"
  ```
- Decoding the command:
  | Part | Meaning |
  |---|---|
  | `az role assignment create` | Create a permission ("role") for someone |
  | `--assignee` | **Who** gets it: your user's **Object ID** (portal -> search **Microsoft Entra ID** -> **Users** -> your user -> *Object ID*) |
  | `--role "Storage Blob Data Contributor"` | **What** they may do: add/modify data (blobs = our reports) in the storage |
  | `--scope` | **Where** it applies: the storage account's full resource **ID** |
  | `$(az storage account show ... --query id -o tsv)` | Inner command that **looks up that ID** from the storage account name + resource group, so you don't type the long ID by hand |
- The **3 values to replace with yours**: your Object ID, your storage account name (portal: workspace -> Storage configuration), your resource group (portal: workspace -> Overview).
- Success looks like a JSON response with `"type": "Microsoft.Authorization/roleAssignments"` (we got this).
- Permissions can take a few minutes to take effect.

**4.3 Allow the public trace viewer (CORS)** - in the Microsoft doc, *not covered in the lecture*
- Storage account -> **Settings -> Resource sharing (CORS)** -> **Blob service** -> add a record, then **Save**.
- Needed so the **trace viewer** in the browser can read trace files from your storage. The values on Microsoft's page (verify there) are
  allowed origin `https://trace.playwright.dev`, method `GET`, allowed/exposed headers `*`, max age `86400`.
- If skipped, runs may work but traces may not open from the dashboard.

**4.4 Add the reporter to the service config** - see the config file below.

## The service config file: `playwright.service.config.js`
Created automatically by Step 1. This is the **cloud version** of `playwright.config.js` (the "driver" file that decides what runs and how).
- Normal local run -> `playwright.config.js`. Cloud run -> `playwright.service.config.js`.
```js
const config = require('./playwright.config');            // reuse ALL our existing settings (testDir, projects, timeouts...)
export default defineConfig(
  config,                                                  // 1. start from the base config
  createAzurePlaywrightConfig(config, {                    // 2. add the cloud connection settings
    exposeNetwork: '<loopback>',                           //    lets cloud browsers reach localhost / local network apps
    connectTimeout: 3 * 60 * 1000,                         //    wait up to 3 minutes to get cloud browsers
    os: ServiceOS.LINUX,                                   //    cloud machines run Linux
    credential: new DefaultAzureCredential(),              //    use the `az login` session (Step 2) - no secrets in code
  }),
  {
    reporter: [                                            // 3. reporters (this REPLACES the reporter of the base config)
      ["html", { open: "never" }],                         //    normal HTML report, don't auto-open the browser
      ["@azure/playwright/reporter"],                      //    uploads results/traces/screenshots to the workspace dashboard
    ],
  }
);
```
- **We enabled reporting** by uncommenting the `reporter` block (the template ships with it commented out).
- The doc says: the **HTML reporter must come before** the Workspaces reporter.
- Because it *replaces* the base `reporter`, put any other reporter you need in this array.
- Because `playwright.service.config.js` re-uses `./playwright.config`, any change to the base config (projects, retries...) applies to cloud runs too.
- Note: the file uses `export default` while the rest of the project is CommonJS - Playwright handles that when loading config files (checked: the file loads fine).

## Step 5 - Run the tests in the cloud (done in the next lecture)
```bash
npx playwright test -c playwright.service.config.js --workers=20
```
- `-c` = which config file. `--workers=20` = up to 20 tests in parallel on cloud browsers (limited by your subscription).
- The doc page writes `.ts`; our file is **`.js`**, so use `playwright.service.config.js`.
- `npm init` printed this exact command at the end.
- Needs each time: `az login` done + `PLAYWRIGHT_SERVICE_URL` exported in the same terminal.

## Check-list before running
- [ ] `@azure/playwright` and `@azure/identity` in `package.json` (Step 1)
- [ ] `az login` done (Step 2)
- [ ] `PLAYWRIGHT_SERVICE_URL` exported in this terminal (Step 3)
- [ ] Reporting enabled + storage linked + "Storage Blob Data Contributor" role assigned (4.1, 4.2) (+ CORS, 4.3)
- [ ] Reporter block uncommented in `playwright.service.config.js` (4.4)

## Notes / gotchas
- **Secrets**: the workspace URL, subscription ID and object ID are identifiers, not passwords, but don't publish them. Authentication is your `az login`; never put tokens in code.
  When we move to GitHub Actions, the pipeline will need its own credentials stored as **GitHub secrets**.
- **Which tests run**: this config reuses `testDir: './tests'`, so the Playwright Test specs run in the cloud. The Cucumber scenarios (`npm run cucumberRegression`) don't use this flow.
- **Quick sanity test (no cloud run)**: `npx playwright test -c playwright.service.config.js --list` checks that the config file loads. With a wrong/missing workspace URL it printed "Reporting upload status: FAILED / Test run creation failed during setup", so that message means the URL, login or storage permissions still need fixing in that terminal.
