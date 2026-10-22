# Cucumber + Playwright — Introduction (Section Notes)

## What Cucumber is
Cucumber is a **BDD (behaviour-driven development) layer on top of existing automation code**.
You describe tests in plain English (the **Gherkin** language) so that non-programmers
(BAs, product owners, manual testers) can read and review what is automated. Underneath, the
same Playwright code still runs — Cucumber is just another interface.

Cucumber exists for several languages (Java, Python, Ruby, JavaScript). Playwright here is
JavaScript, so we use **Cucumber.js** (`@cucumber/cucumber` on npm).

## Gherkin keywords
| Keyword | Meaning | Example (our e-commerce app) |
|---|---|---|
| `Feature` | A capability being tested | `Feature: Ecommerce validations` |
| `Scenario` | One test case | `Scenario: Place the order` |
| `Given` | Pre-condition / starting state | Given a login to the Ecommerce app with valid credentials |
| `When` | The action performed | When I add the product to the cart and place the order |
| `Then` | The expected outcome (assertions go here) | Then the order is shown in order history |
| `And` / `But` | Continue the previous step type | And I verify the cart |

## The two files that make it work
1. **Feature file** (`*.feature`) — plain-English scenarios.
2. **Step definition file** (`*.js`) — maps each English line to code:
   ```js
   const { Given, When, Then } = require('@cucumber/cucumber');

   Given('a login to the Ecommerce app with valid credentials', async function () {
     // the same login code we already wrote (goto, fill email, fill password, click)
   });
   ```
At runtime Cucumber reads each line of the feature file, finds the step definition whose
**keyword + text match**, and executes its function. Match found → code runs; no match →
the step is reported as *undefined* (with a suggested snippet to copy).

Mapping our existing test (e.g. [ClientApp.spec.js](/tests/ClientApp.spec.js)): the login lines
become the `Given` step, add-to-cart / checkout become `When` steps, and the `expect(...)`
assertions become `Then` steps.

## Important: what changes versus plain Playwright Test
- Correction to the lecture wording: Playwright's runner is **Playwright Test** (its own runner),
  not Mocha. Either way: when Cucumber is the runner, you **cannot also use Playwright Test's
  runner** — both do the same job and would conflict.
- So the `test`/`expect` fixtures (`page`, `browser`), `playwright.config.js` settings (timeouts,
  retries, reporters, projects, screenshots/traces, parallel workers, `--grep` tags) **do not
  apply** to feature runs. Cucumber has its own equivalents, covered in the next lectures:
  - data-driving: Scenario Outline + Examples tables, DataTables
  - tags: `@tag` above a scenario, run with `--tags`
  - timeouts: `setDefaultTimeout`
  - retries of failed tests: `--retry`
  - screenshots on failure: in an `After` hook
  - parallel: `--parallel <n>`
  - reports: cucumber `--format` (html, json, message)
- You still use the **`playwright` library** (`chromium.launch()`, `page`, locators, `expect` from
  `@playwright/test` is optional) inside step definitions and hooks — browsers are launched by
  your own code (typically in `Before`/`After` hooks and a shared World), not by Playwright fixtures.
- Our existing `.spec.js` tests and `npm run` scripts keep working; Cucumber is added alongside.

## Recent changes / things to check before installing
- Current `@cucumber/cucumber` is **13.3.0**, which requires **Node 22, 24 or >=26**
  (check with `npm view @cucumber/cucumber engines`). This machine has **Node 25.1.0**, which is
  *outside* that range — use Node 24 LTS (e.g. `brew install node@24`, or nvm) before installing.
- Newer Cucumber.js config uses `cucumber.js` / `cucumber.json` profiles with `import`/`require`
  keys (older lectures used long CLI flags) — use the config file rather than long commands.
- `@cucumber/cucumber` is the maintained package name; the old `cucumber` package is deprecated.
- Gherkin keyword steps are matched by **text only** (Given/When/Then are interchangeable in
  matching), so keep step wording unique and reusable.

## Interview takeaway
Cucumber = readable specification (feature file) + glue code (step definitions) over the same
automation. It improves collaboration and traceability but adds a maintenance layer — worth it when
non-technical stakeholders must read the tests.

## Next lecture
Install Cucumber.js, create the first `.feature` file and step definitions for the e2e flow.
