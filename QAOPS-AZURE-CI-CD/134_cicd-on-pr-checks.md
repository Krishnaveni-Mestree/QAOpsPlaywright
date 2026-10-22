# Pull Requests, Pipeline Checks and Merge Gates

## Goal
Finish the QAOps solution: run the pipeline on **pull requests** and make GitHub **block merging** until the tests pass.
Result: nobody can break the `main` branch (the one that produces the daily automation results) by merging untested code.

## What is a pull request (PR)?
- You never work directly on `main`. You create a **branch**, make changes there, and then ask to **pull** (merge) your branch into `main`. That request is the **pull request**.
- Teammates review it and press **Merge**. `main` stays clean: it is the version that runs daily and whose results go to management.
- Our workflow already has this trigger in [playwright.yml](../.github/workflows/playwright.yml):
  ```yaml
  on:
    push:
      branches: [ main, master ]
    pull_request:
      branches: [ main, master ]
  ```
  `pull_request` + `branches: [main, master]` = "run when a PR is opened/updated **targeting** main or master". No YAML change is needed for this lecture.

## Demo: create a branch, change code, open a PR
```bash
git checkout main                       # start from main
git checkout -b rahul-fixes             # create AND switch to a new branch (-b = create)
# ...edit a test file...
git status                              # shows the modified file
git add <file>                          # stage it
git commit -m "rahul fixes"             # commit on the branch
git push origin rahul-fixes             # push the BRANCH (not main)
```
| Command | Meaning |
|---|---|
| `git checkout main` | Switch to `main` |
| `git checkout -b <name>` | Create a new branch from where you are and switch to it (`git switch -c <name>` does the same) |
| `git push origin <branch>` | Upload that branch to GitHub. This does **not** trigger our `push` event, because the `push` filter allows only `main`/`master` |

Then on GitHub:
1. The repo shows a banner "**rahul-fixes had recent pushes**" -> **Compare & pull request**. (Or: **Pull requests** -> **New pull request** -> base `main`, compare `rahul-fixes`.)
2. Check the **Files changed** diff (green = added, red = removed).
3. Click **Create pull request**.
4. Immediately the PR shows **"Some checks haven't completed yet"** and the **Playwright Tests** workflow starts, because of the `pull_request` trigger.

## Which code does the PR pipeline test?
- Not `main` (it is already known to be good), but **your branch's changes**. That is the whole point: find problems **before** merging.
- Technical detail (GitHub docs): for `pull_request` events GitHub checks out a **temporary merge of your branch into `main`**, so the test sees what `main` would look like **after** the merge. (The lecture simplifies this as "runs the branch code".)
- The Azure Test runs page gets a new entry for it, and the log shows the `Published report URL`, so reviewers can open the cloud report.

## Result: pass or fail
- All checks pass -> green tick "All checks have passed" -> merging is safe.
- A check fails -> red "Some checks were not successful". Click **Details** -> open the failing step and the **Published report URL** in the Azure portal to see which tests failed and why.
- Reviewer/lead's job: don't merge; ask the author to fix; the author pushes more commits to the **same branch**; the PR re-runs the pipeline automatically.

## Problem: the Merge button is still enabled
A failed check does **not** stop merging by default. Someone could click **Merge pull request** by mistake and break `main`. We fix this with a **rule**.

## Merge gate: a ruleset with required status checks
Repo -> **Settings** -> **Rules** -> **Rulesets** -> **New ruleset** -> **New branch ruleset**.
| Setting | Value | Why |
|---|---|---|
| Ruleset name | e.g. `PR merge rule` | Any label |
| Enforcement status | **Active** | "Disabled" does nothing |
| Target branches | **Add target** -> *Include by pattern* -> `main` and `master` | The rule applies only when someone acts on those branches |
| **Require status checks to pass** | tick | The core of the gate |
| -> **Add checks** | search and select **`test`** | `test` is the **job name** in our workflow (`jobs: test:`). GitHub lists it under the check name |
| Require branches to be up to date before merging | optional | The PR must be current with `main` before merging |

Click **Create**.

**Important:** the check name only appears in the search list **after the workflow has run at least once** (GitHub says a check must have run recently, within the last 7 days). So: **create one PR first, let the pipeline run, then add the rule.** It applies to later PRs. If `test` doesn't show up, run the pipeline again.

Now open the PR again: the **Merge pull request** button is **disabled** while the `test` check is failing or running. Merge becomes possible only when the pipeline passes.

## Useful notes
- **Name matching:** the required check name must match the job. If you rename the job in the YAML (for example `test` -> `playwright-tests`), update the rule, or merging will wait forever for a check that no longer exists.
- **Admins:** by default, repository admins may be allowed to bypass rulesets. For a strict gate, check the **Bypass list** is empty.
- **Rulesets vs branch protection rules:** older tutorials use Settings -> Branches -> *Branch protection rule*. Rulesets are the newer, more flexible replacement; both can enforce required checks. The lecture uses rulesets.
- **Availability:** rulesets work on **public** repos (ours is public). For **private** repos they need a paid GitHub plan. Check your plan if you can't see them.
- **Fork PRs:** secrets (`AZURE_CREDENTIALS`) are **not** passed to PRs from forks, so for those the Azure Login step fails and the check turns red. PRs from branches inside our own repo (like `rahul-fixes`) are fine.
- **Visual tests:** if a Linux-vs-macOS snapshot mismatch makes `test` fail on every PR, the gate will block all merges until that's fixed (see 133).

## Why this matters (QAOps)
| Part | Purpose |
|---|---|
| Branch + PR | Review before changes reach `main` |
| GitHub Actions on `pull_request` | Automatic proof the tests still pass |
| Azure Playwright Workspaces | Fast, parallel cloud run and shareable report |
| Required status check (ruleset) | Technically **prevents** merging broken code |

**DevOps** does this for application code. Doing it to protect an **automation framework** (stable daily results, trustworthy reports) is **QAOps**.
As an architect you would own: the cloud infrastructure, the pipeline, and these gate rules.

## Complete flow recap (whole QAOps section)
1. Code lives in GitHub; `main` runs the daily automation.
2. A developer/tester makes a branch, commits, pushes, and opens a PR to `main`.
3. GitHub Actions starts (Ubuntu runner) -> checkout -> `npm ci` -> Azure Login -> `npx playwright test --config=playwright.service.config.js --workers=4`.
4. Azure runs the tests in parallel on cloud browsers and stores the report.
5. The PR shows pass/fail; the ruleset blocks merge unless `test` passes.
6. After merge to `main`, the `push` trigger runs the pipeline again on `main`.

## Checklist
- [ ] Branch created, pushed, PR opened; pipeline ran at least once
- [ ] Ruleset created: target `main`/`master`, required status check `test`, enforcement **Active**
- [ ] On a PR with failing tests: Merge button disabled
- [ ] On a PR with passing tests: Merge enabled
- [ ] Rotated the client secret that was exposed earlier (see 132)

