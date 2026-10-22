# QA Ops — Implementation Plan (Architecture Walkthrough)

## Goal
By the end of this section we implement the complete architecture below: **a code push / merged pull request automatically
runs our Playwright tests in the cloud (Azure) and shows the results in a central dashboard.**

## The flow at a glance
```
Test automation developer
        |  1. push code / merge pull request
        v
GitHub repository  (all code lives here)
        |  2. event TRIGGERS the pipeline automatically (not manual)
        v
GitHub Actions pipeline  -> checkout code -> install dependencies -> install browsers -> set environment variables
        |  3. framework is ready; hand over execution (instead of running on the GitHub machine)
        v
Azure (dedicated Playwright workspace)  -> runs the tests in the cloud, in parallel, in the browsers you asked for
        |  4. results collected (pass / fail)           \
        v                                                v
Back to the pipeline: pass = OK, fail = blocked      Azure dashboard: run summary, failures, traces, screenshots
```

## Step by step
1. **Developer pushes code to GitHub.**
   - First task: create a GitHub account/repository and push our current code.
   - This folder is not a git repository yet, so the first real action is to `git init` and push.
2. **Event triggers the pipeline (GitHub Actions).**
   - Trigger = a **push**, or a **pull request merge**. It is automatic - nobody clicks "run".
   - The pipeline always "listens" to events in the repository.
3. **Pipeline prepares the environment.**
   - Check out the latest pushed code → install dependencies → install Playwright browsers → set environment variables.
   - Afterwards the framework is *ready to execute*, the same as running `npx playwright test` locally.
4. **Execution is handed over to the cloud (Azure).**
   - Instead of running the tests on the (small) pipeline machine, the command is mapped to **Azure's dedicated Playwright workspace**.
   - Tests run there in the requested browsers and, if configured, **in parallel**.
   - Scaling example from the lecture: with 100 tests you could run 20-30 at the same time - the number depends on your **subscription**.
5. **Results and report.**
   - The full report is visible in the **Azure portal dashboard**: run summary, failure details, trace viewer, screenshots - what you normally see in Playwright's own report, but centralized for the whole team.
   - Pass/fail is sent **back to the pipeline**.
6. **Pipeline decides: proceed or stop.**
   - If tests pass, the pipeline passes → the pull request can be merged.
   - If tests fail, the pipeline shows **failed** → **you cannot merge** the code.
   - This is the real value: bad code is blocked automatically (a "quality gate").

## Responsibilities (who does what)
| Component | Its job |
|---|---|
| GitHub repository | Stores the code; source of events (push / PR merge) |
| GitHub Actions pipeline | Listens for events, prepares the environment, **kicks off** the run, reports pass/fail |
| Azure Playwright workspace | **Actually runs** the tests (scalable, parallel), stores and displays the reports |

In one line: **the pipeline starts the execution; Azure runs it; the result comes back to the pipeline.**

## How we will learn it (order of the lectures)
- **Part 1 - Azure first, from local (next 2 lectures):** run a command from our local VS Code and see how the tests are handed to Azure, how the cloud picks them up, and how the dashboard shows the results. Learn the cloud side separately, with no pipeline yet.
- **Part 2 - GitHub Actions:** create the pipeline (trigger, checkout, install, env variables).
- **Part 3 - Put it together:** call the same Azure command from the GitHub Actions pipeline and see the full picture end-to-end.
- Instructor's estimate: about 1 - 1.5 hours in total.

## Notes for our project
- Playwright Test specs (`npx playwright test` / `npm run regression`) are what will run in the cloud. The Cucumber scenarios (`npm run cucumberRegression`) are a separate runner - this Azure flow is described for Playwright's own runner.
- Things we will need soon: a GitHub account, an Azure account (with a subscription - it controls how many parallel workers we get), and secrets such as Azure tokens stored as environment variables / GitHub secrets (never committed to code).

## Key terms
- **Trigger / event**: something happening in the repo (push, pull request) that starts the pipeline.
- **Workflow / pipeline**: the automated steps defined for GitHub Actions.
- **Quality gate**: a rule that blocks merging when tests fail.
- **Workers**: the parallel browsers/machines in the cloud that execute tests at the same time.
- **Subscription**: your Azure plan; limits how much you can scale.
