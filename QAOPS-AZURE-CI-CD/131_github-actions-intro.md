# GitHub Actions: Understanding the Workflow YAML

## Goal
Code is on GitHub. Now we want a **pipeline** that runs the tests automatically whenever code is pushed (CI/CD).
GitHub Actions is GitHub's CI/CD feature. The pipeline is defined in a **YAML workflow file**.
This lecture: understand the syntax of Playwright's sample file. Next lecture: tweak it to run on Azure.

> Don't just copy-paste the sample. Understand it, so you can change it for your project/company needs.

## Where the file lives
- Path: `.github/workflows/playwright.yml` (our project already has it).
- When you create a Playwright project, it asks "Add a GitHub Actions workflow?". Yes creates this file for you.
- If you said no, create the folders `.github` then `workflows` manually and add the file.
- If VS Code hides `.github`: Settings -> search `exclude` -> remove `.github` from the excluded list (Files: Exclude).
- Sample source: Playwright docs -> **Setting up CI**. Docs for the concepts: **Understanding GitHub Actions**.

## Our file (current)
```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm ci
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```
**Indentation matters in YAML.** If it breaks, ask Copilot/ChatGPT to fix the spacing.

## 1. Events: `on`
An **event** is an activity in the repository that **triggers** the workflow. Jobs only run after the event happens.
- `push` with `branches: [main, master]`: runs when someone pushes code to `main` or `master`.
  Pushes to your own feature branch do **not** trigger it.
- `pull_request` with `branches: [main, master]`: runs when someone **raises a pull request** targeting those branches (e.g. to review code before merging).
- That is the "continuous integration" idea: you keep pushing, the pipeline keeps running.

## 2. Jobs and steps
- `jobs:` holds one or more jobs. Ours has **one job**, named `test`.
- A **job** = a collection of **steps** that run on the **same runner** (machine).
- Ours has **6 steps**.
- `runs-on: ubuntu-latest`: GitHub starts a fresh **Ubuntu** cloud machine for the job. You can pick other OSes, but the Playwright sample uses Ubuntu.
- `timeout-minutes: 60`: the job is stopped if it runs longer than 60 minutes.

Each step is **either an action or a shell script**:
| Type | Keyword | Meaning |
|---|---|---|
| **Action** | `uses:` | A predefined, reusable piece of work (like calling a reusable function, e.g. a login method) |
| **Shell script** | `run:` | A command you type in the terminal. Add `name:` as a label |

## The 6 steps explained
| # | Step | Type | What it does |
|---|---|---|---|
| 1 | `actions/checkout@v4` | action | Gets the **latest code** of the branch that triggered the run onto the Ubuntu machine |
| 2 | `actions/setup-node@v4` (`node-version: lts/*`) | action | Installs **Node.js** (latest LTS) on that machine |
| 3 | `npm ci` | shell | Installs project dependencies (like `npm install`, but exact versions from `package-lock.json`). The fresh machine has no packages |
| 4 | `npx playwright install --with-deps` | shell | Installs the Playwright **browsers** and the OS libraries they need |
| 5 | `npx playwright test` | shell | **Runs the tests** (locally on that Ubuntu runner) |
| 6 | `actions/upload-artifact@v4` | action | Uploads the `playwright-report/` folder to GitHub, kept for **30 days** (`retention-days`). `if: ${{ !cancelled() }}` means it uploads even when tests fail |

## How to change the pipeline
- **Add a command** (e.g. between steps 2 and 3): add another entry with `- name: ...` and `run: ...`.
- **Reuse an existing action:** add a step with `uses: <owner>/<action>@<version>`.
- **Add a separate job:** add another key under `jobs:` (next to `test`).
- Example: to run on Azure instead, change the **Run** step command (next lecture).

## What this file does today
On push or PR to `main`/`master`: start Ubuntu -> check out code -> install Node -> `npm ci` -> install browsers -> run `npx playwright test` **on the GitHub runner itself** -> upload the report.
That runs tests sequentially on one machine, with no cloud scale, no parallel browsers, and no Azure dashboard.

## What changes next
We already have an **Azure Playwright Workspace** and `playwright.service.config.js`. The next lecture changes the run step so the pipeline hands execution to Azure:
```bash
npx playwright test --config=playwright.service.config.js --workers=4
```
This gives parallel runs on cloud browsers and the reporting dashboard (Azure access also has to be set up for the runner).

## Quick recap
- `on` = **when** to run (events).
- `jobs` = **what** to run; a job = steps on one runner.
- `runs-on` = **where** (the OS).
- `uses` = reusable **action**; `run` = **shell command**.
