# CI/CD in Action: Push Code -> Pipeline -> Azure Report

## Goal
See the full QAOps loop work end to end: **a git push triggers GitHub Actions, which runs the tests on Azure cloud browsers and shows the report in the Azure portal.**
The hard part (service principal, secrets, workflow) was done in 132. This lecture is the proof.

## The flow (what happens after a push)
```
Edit code -> git add / commit / push to main
      -> GitHub sees the push event (our workflow has: on: push: branches [main, master])
      -> Actions starts an Ubuntu runner (the job appears as "queued", then "in progress")
            1. checkout latest main code
            2. set up Node, npm ci (install dependencies)
            3. Azure Login  -> log shows "Login successful" / Azure CLI login succeeded
            4. npx playwright test --config=playwright.service.config.js --workers=4
                 (PLAYWRIGHT_SERVICE_URL tells which Azure endpoint to use)
            5. upload the report artifact
      -> Azure Playwright Workspace runs the tests on cloud browsers
      -> A new entry appears under Azure portal -> workspace -> Test runs
```
Nothing was started by hand. The push itself is the trigger. This is **continuous integration**: every change gets tested automatically.

## Demo 1: commit directly on GitHub
1. In the GitHub repo, open the workflow file, edit it in the browser, and click **Commit changes**.
   (Copilot may suggest a commit message, like "Update playwright workflow".)
2. Committing on the `main` branch = a **push to main** = the `push` event fires.
3. Open the **Actions** tab: a run appears and shows "in progress".
4. Click the run -> job -> expand steps to read the logs:
   - **Checkout** got the latest code.
   - **Install dependencies** (`npm ci`) ran.
   - **Azure Login** succeeded because `AZURE_CREDENTIALS` is correct.
   - **Run Playwright tests** used `PLAYWRIGHT_SERVICE_URL` and handed execution to Azure.
5. In the Azure portal -> **Test runs**, a new run shows up (often within seconds; the run itself took very little time because browsers start in parallel). Open it to see the full report: passed/failed counts, screenshots, traces, and so on.

A failing test (for example a **visual comparison** test with a screenshot mismatch) makes the run show failures. That is **correct behaviour**: the pipeline reports the real status of the tests, and the report is available either way.

## Demo 2: push from your laptop
```bash
git status                      # see which file changed
git add <changed-file>          # stage only that file
git commit -m "small change for CI/CD demo"
git push origin main            # push to main -> triggers the pipeline
```
| Command | Meaning |
|---|---|
| `git status` | Shows modified/untracked files |
| `git add <file>` | Moves one file to staging (use `git add .` for everything) |
| `git commit -m "..."` | Saves it locally |
| `git push origin main` | Sends it to GitHub's `main` branch. Because we configured the upstream earlier with `-u`, plain `git push` also works |

Then: **Actions** tab (queued -> in progress -> done) and Azure **Test runs** (a new run, so the count goes up by one).
This is the real-life flow: **change code locally -> push -> pipeline tells you whether the change broke anything**.

## Where do the browsers/parallelism come from?
- `--workers=4` in the workflow command: up to **4 tests at once**. Azure starts 4 cloud browsers; when one test finishes, the next starts.
- Which browser runs is decided in the **project config**, not the workflow. `playwright.service.config.js` imports `playwright.config.js`, so it inherits its `projects`.
  In our [playwright.config.js](../playwright.config.js) there is a single project: **`chromium`** (`devices['Desktop Chrome']`). So tests run in Chrome.
- To run more browsers: add projects (for example Firefox/WebKit) in `playwright.config.js`. The service config picks them up automatically, and the pipeline then runs every browser in the cloud. No YAML change is needed.
- `headless: false` in our config is fine here: the browsers run remotely in Azure, not on the GitHub runner, so no display is needed on Ubuntu.

## Chain of events (retrospective)
1. You changed code and pushed (laptop, or the GitHub web editor).
2. GitHub looked in `.github/workflows/`, found our YAML, and matched the `push` event.
3. The runner downloaded the code, installed packages, logged into Azure, and handed off to Azure.
4. Azure ran the tests in parallel on cloud browsers and stored the report.
5. You read the report in the Azure portal (and the HTML report artifact in GitHub Actions).

This matches the architecture diagram from the start of the QAOps section.

## How to read results quickly
| Where | What you see |
|---|---|
| GitHub -> **Actions** -> run | Pass/fail of the pipeline, step logs, and the `playwright-report` artifact (downloadable for 30 days) |
| Azure portal -> workspace -> **Test runs** | Cloud report: totals, per-test results, screenshots, videos, traces |
| Terminal log line `Published report URL: ...` | Direct link to the Azure report for that run |

## Troubleshooting
| Symptom | Likely cause |
|---|---|
| No run starts after the push | You pushed to a branch other than `main`/`master`, or the YAML is not in `.github/workflows/` |
| Run is "queued" for a while | Normal; GitHub is assigning a runner. It starts shortly |
| Azure Login step fails | `AZURE_CREDENTIALS` missing/wrong, or the client secret expired or was rotated and the secret was not updated |
| Tests fail to connect / endpoint error | `PLAYWRIGHT_SERVICE_URL` variable is missing or has the wrong region endpoint |
| `Reporting upload` or storage errors | The service principal lacks **Storage Blob Data Contributor** on the storage account |
| Pipeline red but Azure report exists | Some tests failed (real failures, such as visual snapshot mismatch). The infrastructure worked |
| Visual test fails only in CI | Screenshots are OS-specific: baseline images taken on macOS (`...-chromium-darwin.png`) differ from the Linux cloud browsers. Create Linux baselines (`--update-snapshots` on a Linux run) or skip visual tests in CI |

## What's next
So far the pipeline runs on **push to main**. Next lecture:
- Raise a **pull request** so the same pipeline runs on the PR (we already have `pull_request` in `on:`).
- Add a **branch protection rule / required status check** so a PR **cannot be merged until the pipeline passes**. This is the "gate check" you see in real company projects.
