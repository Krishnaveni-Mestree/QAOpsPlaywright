# QA Ops with Playwright — Section Intro Notes

## What this section covers
Until now we built the **test framework** (Playwright Test + Cucumber + page objects + data-driven tests).
This section is about everything *around* the framework: where the code lives, how tests run automatically,
how they scale, and how the whole team sees the results. We call this **QA Ops**.

## What is QA Ops?
- **DevOps** = bringing development and operations together (build → deploy → run, automated).
- **QA Ops** = the same philosophy applied to testing: integrate quality assurance into the DevOps pipeline
  so testing is part of *continuous delivery*, not a manual step done on one person's laptop.
- A few years back, the focus was only the test scripts and running them. Nobody thought about:
  - running **hundreds of tests in a short time** (scaling)
  - running in **different browsers / configurations** (infrastructure to maintain)
  - **CI/CD integration** (tests triggered automatically)
  - **centralized reporting** (everyone can see what is happening during execution)
- QA Ops means these concerns are handled **from day one of framework development**, with the same care as writing the tests.

## The real pain point (important idea)
- Writing test scripts is only about **20%** of the real problem in big projects (per the research the instructor mentions).
- The bigger 80% is making tests **run reliably, fast, in parallel, automatically and at scale**, on the right infrastructure.
- Writing a test is easy; *running it reliably at scale* is the hard part → so build QA Ops in from the beginning.

## Questions to ask yourself: "Is running only on my laptop enough?"
| If you only run locally... | Problem |
|---|---|
| Only you know what is happening on your machine | May fail in other configurations (OS, browser, versions) |
| Execution is sequential | Triggering in parallel eats memory quickly → tests get slow |
| No CI/CD | Tests must be started **manually** every time |
| Reports stay on your machine | No visibility for the team |
| Shared environments vs your own setup | **Flaky** results, "works on my machine" |

## The QA Ops plan for this section (what we will build, step by step)
1. **Repository** — store the whole code in **GitHub** (single source of truth).
2. **CI/CD pipeline with GitHub Actions** — pipeline triggers automatically when you **push code or merge a pull request**, and runs the tests.
3. **Cloud execution with Azure** — run tests on Azure workspaces/workers instead of your laptop, in different configurations.
4. **Sharding / parallel scaling** — split tests across cloud workers (e.g. 100 tests → 20 running at a time) to finish faster.
5. **Centralized reporting dashboard** — one place where everyone sees failures, errors, screenshots, **trace viewer** and all the details Playwright records.

Together: **GitHub (code) → GitHub Actions (CI/CD trigger) → Azure (scalable cloud workers) → central dashboard (reports)** = QA Ops.

## How it connects to what we already have in this project
(Based on the current project files — these are the things the pipeline will run later.)
- `npm run regression` / `npx playwright test` → Playwright Test specs (`tests/`), config in `playwright.config.js`.
- `npm run webTests` / `apiTests` → tag-filtered Playwright runs (`--grep @Web`, `--grep @api`).
- `npm run cucumberRegression` → Cucumber scenarios tagged `@Regression`, with `--retry 1` and an HTML report (`cucumber-report.html`).
- Features we already learned that matter for CI: **parallel workers**, **retries**, **HTML/trace/screenshot reports**, and **tags** to choose which tests to run.
- Not yet in place: this folder is **not a git repository** (no `.git`), so step 1 will be creating the repo and pushing the code.

## Key terms
- **CI/CD**: Continuous Integration / Continuous Delivery - automatically build and test on every code change.
- **Pipeline**: the automated sequence of steps (install → run tests → publish report) defined in a YAML file.
- **GitHub Actions**: GitHub's built-in CI/CD; workflows live in `.github/workflows/*.yml`.
- **Sharding**: splitting the test suite into parts that run on separate machines at the same time.
- **Centralized reporting**: a single, shared place to view results (instead of an HTML file on one laptop).
- **Flaky test**: passes sometimes and fails sometimes without code changes (often due to environment differences).

## Next lecture
The instructor explains the step-by-step plan and then we start implementing: GitHub repo → GitHub Actions → Azure → sharding → reporting.
