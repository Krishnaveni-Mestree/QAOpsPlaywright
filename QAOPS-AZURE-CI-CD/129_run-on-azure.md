# Running the Tests on Azure (Cloud) and Viewing the Report

## Goal
Run our existing Playwright tests on **Azure's cloud browsers** instead of our laptop, and read the results in the **Azure portal**.
The code and tests do not change. Only the **config file** (and where the browsers run) changes.
You confirmed it works: the run was created, artifacts were uploaded (`Reporting upload status: SUCCESS`) and the report is visible in Azure.

## The command
```bash
npx playwright test --config=playwright.service.config.js --workers=4
```
| Part | Meaning |
|---|---|
| `npx playwright test` | Run the Playwright Test specs (same command as always) |
| `--config=playwright.service.config.js` | Use the **cloud** config instead of `playwright.config.js` |
| `--workers=4` | Up to 4 tests in parallel on cloud browsers |

- **Local run**: `npx playwright test` -> `playwright.config.js` -> browsers on your laptop.
- **Cloud run**: add `--config=playwright.service.config.js` -> same tests, browsers in Azure.
- **`--workers`**: the setup guide suggested `20`. The lecture used **4** for a free account because the number of parallel workers is limited by your subscription. Raise it only if your plan allows.
- **Use `.js`, not `.ts`**: our file is `playwright.service.config.js`. Running `--config=playwright.service.config.ts` fails with
  `playwright.service.config.ts does not exist` (you hit this before the successful run). The doc page shows `.ts`, but the extension must match the real file.

## Why nothing in the tests has to change
`playwright.service.config.js` does `const config = require('./playwright.config')` and merges it with the cloud settings:
- Everything you set in `playwright.config.js` (`testDir: './tests'`, timeouts, `expect` timeout, `use` options, `projects`, ...) is **reused automatically** by the cloud run.
- So: keep configuring *what/how to run* in `playwright.config.js`; the service config only adds *where to run* (Azure).
- Our `testDir: './tests'` means every `*.spec.js` under `tests/` runs in the cloud, same as locally.
- **Other config files are not used**: `playwright.config96.js`... `playwright.config100.js` (e.g. the chrome + safari projects with `retries: 1`) are separate configs. Only the file you pass with `--config` (and what it imports) counts.
- Only the **reporter** differs: the service config **replaces** the base `reporter` with `["html", { open: "never" }]` + `["@azure/playwright/reporter"]`
  (the second one uploads results, screenshots, videos and traces to Azure).

## What you see in the terminal (your successful run, explained)
```
Running tests using Playwright workspaces.        <- cloud config detected
Test run created successfully.                    <- a "test run" now exists in the Azure workspace
Playwright Workspaces reporting: ENABLED          <- the reporter block is active
Collecting artifacts: screenshots, videos, traces.
Uploading artifacts to: storage account= <your storage account>, storage container= <workspace id>, folder= <test run id>
Reporting upload status: SUCCESS                  <- storage account + role permission are correct
Published report URL: https://ms.portal.azure.com/#view/...TestReport.../testRunId/<test run id>/...
To open last HTML report run:  npx playwright show-report      <- the normal LOCAL html report also exists
```
- **Published report URL**: the link to the cloud report. Share it with your team/manager. (Opening it needs access to your Azure subscription.)
- **Two reports exist**: the Azure one (central, shareable) and the usual local `playwright-report/` (`npx playwright show-report`).

## Watching the run in the Azure portal
Portal -> your **Playwright workspace** -> **Overview** -> **Test runs**:
- A new entry appears as soon as the run starts (it is "in progress" until the run ends).
- **Browser sessions / activity log**: shows the remote browsers starting. With `--workers=4`, 4 start at once; when one test finishes, the next browser starts, until all tests are done.
- **Duration and totals** are not instant: wait 1-2 minutes and refresh.
- When it finishes the run shows pass/fail totals, timing, and per-test details.

## Troubleshooting seen in the lecture: "user is not authorized to perform this operation"
- **Symptom**: the tests ran fine in the cloud, but the end of the run showed an error while **uploading artifacts to the storage account**
  ("user is not authorized to perform this operation").
- **Cause**: the **Storage Blob Data Contributor** role was granted on **a different storage account** than the one linked to the workspace.
  (The instructor had several storage accounts; he assigned the role on one but the workspace used another.)
- **Fix**:
  1. Portal -> workspace -> **Settings -> Storage configuration** -> note the **storage account name** actually linked.
  2. Re-run the `az role assignment create ...` command from `128_azure-setup-with-project.md` with **that** storage account name.
  3. Re-run the tests. `Reporting upload status: SUCCESS` means it is fixed.
- **Tip**: if you create everything from scratch you will have just one storage account, so this mix-up is unlikely.
- Our own setup: the role was assigned for the same storage account that the run uploads to, which is why our first run already reported `SUCCESS`.

## Reading failures in the Azure report
- Each test shows steps, error message, screenshot and (if enabled) video.
- A failing test has a **View trace** link. The lecture's tip: clicking the link directly may redirect or fail, so instead
  **download the trace `.zip`**, then open the Playwright trace viewer (`https://trace.playwright.dev`), or run
  `npx playwright show-trace <trace.zip>` locally, and choose the file.
- The trace viewer shows the full timeline: each step, the **locator** used, **browser console logs**, **network calls**, **screenshots/snapshots** and the error.
- Example from the lecture: 2 of 18 tests failed because of **concurrency** - the same user account was used by several tests at once (one test booked, another deleted).
  When you run in parallel on many workers, tests that share the same data/account can collide. Fix by using separate test data or not sharing state between tests.
- Why it matters: running in parallel (4 -> 20 workers) is what exposes this kind of hidden dependency.

## Why this is "QA Ops"
- **Execution** happens in the cloud (Azure), not on your machine.
- **Reports and artifacts** are stored in the cloud (Azure storage) and **shared** with a link.
- Nothing runs or stays on your laptop apart from the code.
- **Automation next**: the same command can be scheduled/triggered by a CI tool - the lecture mentions **Jenkins** (e.g. every morning at 8 a.m.),
  and in this course we use **GitHub Actions** next (push / pull request trigger). The person then just opens **Test runs** in Azure to see the result.
- Remember: for any machine that is not yours (CI), it needs its **own Azure login/credentials** (`az login` does not exist there) and the `PLAYWRIGHT_SERVICE_URL` variable. We will handle that with **GitHub secrets** in the pipeline lectures.

## Quick checklist for every cloud run
- [ ] `az login` done (session still valid)
- [ ] `export PLAYWRIGHT_SERVICE_URL=wss://<region>.api.playwright.microsoft.com/playwrightworkspaces/<workspace-id>/browsers` in **this terminal** (it is forgotten when the terminal closes)
- [ ] `npx playwright test --config=playwright.service.config.js --workers=4`
- [ ] Check `Reporting upload status: SUCCESS`, then open the **Published report URL** or **Azure portal -> workspace -> Test runs**

## Related notes
- `126_plan-to-implement-qaOps.md` - overall plan
- `127_azure-intro.md` - creating the workspace
- `128_azure-setup-with-project.md` - the 5-step local setup (package, `az login`, URL, storage role, reporter)
