# Run Tests in the Cloud with GitHub Only: Sharding (No Azure)

## Goal
Get the same "fast, parallel, in the cloud" result as the Azure setup (129-133), but using **only GitHub Actions machines**. This is the fallback when the company will not pay for Azure Playwright Workspaces but already has GitHub.

Workflow file for this lecture: [shards-pipeline.yml](../.github/workflows/shards-pipeline.yml)
Azure workflow (triggers commented out for this demo): [playwright.yml](../.github/workflows/playwright.yml)

## Azure vs GitHub machines
| | Azure Playwright Workspaces | GitHub-hosted runners (`ubuntu-latest`) |
|---|---|---|
| Playwright browsers and OS dependencies | Already installed and managed for you | **Blank machine**: you must install them (`npx playwright install --with-deps`) |
| Where tests run | Azure cloud browsers (parallel, up to the workspace limit) | The Ubuntu runner(s) GitHub gives you |
| Combined report | Azure collects results from all machines automatically | **You** must merge the per-machine reports yourself |
| Cost | Paid Azure service | Uses your GitHub plan's **free minutes**; extra minutes are billed |
| Setup | Service principal, secrets, service config | Only a YAML file |

Notes:
- GitHub runners are **not free without limit**. The plan includes a monthly quota of minutes, shared by **every repo/project in the organisation**. If 10 projects use CI, the quota drains quickly and you must upgrade. Check your plan for the exact numbers.
- Recommendation from the lecture: if there is a QA budget, Azure is more stable and simpler. If the company only has GitHub, sharding is a good way to reuse what they already pay for.

## What is sharding?
- `--workers=N` runs tests in parallel **inside one machine**, using that machine's CPU cores. Too many workers = one overloaded machine.
- **Sharding** splits the test suite across **several machines**, each running its share at the same time. Each part is a **shard**.
- Example: 20 tests, 4 shards -> 5 tests per machine, 4 machines in parallel. Less load per machine and a faster total run.
- Playwright docs: *Test sharding* (`--shard=x/y`).

## How the shard command works
```bash
npx playwright test --shard=1/4    # machine 1 runs the 1st quarter of the tests
npx playwright test --shard=2/4    # machine 2 runs the 2nd quarter
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```
Format: `--shard=<shardIndex>/<shardTotal>`. In GitHub Actions a **matrix** generates the four jobs for you:
```yaml
strategy:
  fail-fast: false
  matrix:
    shardIndex: [1, 2, 3, 4]    # the IDs of the machines
    shardTotal: [4]             # total number of machines
```
```yaml
--shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}
```
GitHub starts one job per `shardIndex` value (1/4, 2/4, 3/4, 4/4), each on its own fresh Ubuntu VM.
`fail-fast: false` = if one shard fails, the others keep running (so you still get a full report).

## Shards vs workers (they work together)
1. **Shards** decide *which machine* gets which tests (4 shards -> 20 tests become 4 groups of 5).
2. **Workers** decide *how many of that machine's tests run at the same time*.
   - `--workers=4` and 5 tests on the shard: 4 run in parallel, then the 5th.
   - `--workers=5`: all 5 run in parallel.

## The workflow, step by step
The file has **two jobs**: `test` (runs the shards) and `merge-reports` (builds the final report).

### Job 1: `test` (runs 4 times, once per shard)
| Step | What it does | Why |
|---|---|---|
| `actions/checkout` | Download the code onto the Ubuntu machine | Every shard needs the whole repo |
| `actions/setup-node` | Install Node (LTS) | Run npm / Playwright |
| `npm ci` | Install dependencies from `package-lock.json` | Same as before |
| `npx playwright install --with-deps` | Install browsers **and** Linux dependencies | **Extra vs Azure**: the GitHub machine is blank. This step takes noticeable time |
| `npx playwright test --config=playwright.config.js --workers=4 --shard=i/4 --reporter=blob` | Run this shard's tests on the local machine | `--config` points to the normal config (not the Azure service config) |
| `actions/upload-artifact` (`blob-report-<i>`) | Upload this shard's report | The machine is thrown away afterwards, so the report must be saved |

Why `--reporter=blob`? A **blob report** is a raw, mergeable format. Each shard produces a partial result that can be combined later. (The normal HTML reporter cannot be merged.)
`if: ${{ !cancelled() }}` uploads the blob even when tests failed. Without it, a failing shard would have no report.
`retention-days: 1` keeps the temporary blobs only a day, since the merged report is the one you keep.

### Job 2: `merge-reports` (runs once, after all shards)
```yaml
needs: [test]                 # wait for ALL shard jobs
if: ${{ !cancelled() }}       # still merge when some shards failed
```
| Step | What it does |
|---|---|
| checkout, setup-node, `npm ci` | A new Ubuntu machine with the project (needs the Playwright CLI) |
| `actions/download-artifact` with `pattern: blob-report-*` and `merge-multiple: true` | Download all 4 blob reports into one folder `all-blob-reports` (`*` matches 1, 2, 3, 4) |
| `npx playwright merge-reports --reporter html ./all-blob-reports` | Merge the 4 partial reports into **one** HTML report |
| `actions/upload-artifact` (`playwright-report`) | Save the final report for 30 days |

With Azure none of this merge work exists, because the service consolidates results itself.

## Demo: push is blocked, so use a branch + PR
1. `git push origin main` is **rejected** (`GH013: Repository rule violations`), because the ruleset from 134 forces PRs with the required `test` check. Good: the rule works.
2. Create a branch, push it, open a PR to `main`:
   ```bash
   git checkout -b fixed-shards
   git add .
   git commit -m "add shards pipeline"
   git push origin fixed-shards
   ```
3. The PR triggers the workflow (`pull_request` -> `main`). In **Actions** you see 4 parallel `test` jobs, then `merge-reports`.
4. Two workflows are in the repo, but only one should be active. The Azure one has its `on:` triggers commented out, so it shows as failed/does nothing. Ideally keep **one** pipeline per repo; two are here only for practice.
5. Result in the demo: some shards failed because a few tests deliberately fail (screenshot comparison). A single failed test fails its shard, and any failed shard keeps the PR **blocked**. Fix the tests, push to the same branch, the pipeline re-runs.
6. Open the run summary -> **Artifacts**:
   - `blob-report-1` ... `blob-report-4`: partial reports from each shard.
   - `playwright-report`: the **final merged report**. Download, unzip, open `index.html` (e.g. 14 passed, 3 failed).

## Where to look when something fails
- **Actions -> run -> job -> step logs**: which test failed and why.
- **Run summary -> Artifacts -> `playwright-report`**: full proof (screenshots, traces, details).

## Gotchas to check in this repo
- **Required check name vs matrix jobs.** The ruleset requires a check named `test`. A matrix job reports as `test (1, 4)`, `test (2, 4)`, etc., so the plain name `test` may never appear and the PR can wait forever. If that happens, edit the ruleset to require those exact names, or add a final single job (for example `needs: [test, merge-reports]`) and require that job instead.
- **Two workflows with the same name** (`Playwright Tests`) and the same job id (`test`) make checks confusing. Give them different names, or keep only one active.
- **Headed mode on CI.** [playwright.config.js](../playwright.config.js) sets `headless: false`. A GitHub Ubuntu runner has no display, so headed browsers fail. For CI use headless (for example `headless: !!process.env.CI`) or run through `xvfb-run`.
- **Visual/snapshot tests** generated on macOS will not match Linux runners; generate baselines on Linux.
- The config's `html` reporter is overridden in the pipeline by `--reporter=blob`, which is what you want in CI.
- **Docker** is not needed here. An optional commented block (`container: mcr.microsoft.com/playwright:...`) in the YAML would give a prebuilt Playwright image and skip the browser install step; the lecture defers Docker to later.

## Which approach to choose
| Situation | Choice |
|---|---|
| Budget for QA tooling, want simplest and most stable | **Azure Playwright Workspaces** ([playwright.yml](../.github/workflows/playwright.yml)) |
| Only GitHub is paid for | **GitHub sharding** ([shards-pipeline.yml](../.github/workflows/shards-pipeline.yml)) |

Both are QAOps: automatic, parallel, gated by PR checks, with a shareable report.

## Checklist
- [ ] Understand shard (split across machines) vs workers (parallel inside one machine)
- [ ] Matrix `shardIndex: [1,2,3,4]`, `shardTotal: [4]` and `--shard=i/4 --reporter=blob`
- [ ] Browsers installed with `npx playwright install --with-deps` (not needed on Azure)
- [ ] Blob reports uploaded per shard, merged in `merge-reports` with `playwright merge-reports`
- [ ] Final `playwright-report` artifact downloaded and opened
- [ ] Only one pipeline active; required check name matches what the matrix job reports
