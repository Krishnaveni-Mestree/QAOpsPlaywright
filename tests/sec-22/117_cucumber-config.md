# Cucumber Installation & First Feature File (Section Notes)

## 1. Install Cucumber.js in the project
```bash
npm install @cucumber/cucumber
```
- Adds `@cucumber/cucumber` to `dependencies` in [package.json](/package.json) (this repo has `^12.9.0`).
  Cucumber.js is just a Node module, so no separate download is needed.
- Verify with `npx cucumber-js --version`.
- **Node compatibility (check this!):** the installed 12.9.0 supports Node `20 || 22 || >=24`, so it works
  with this machine's Node 25.1.0. The newest major (13.3.0) requires `22 || 24 || >=26`, which would
  **not** support Node 25 — stay on 12.x or move to Node 24 LTS before upgrading. (This corrects the
  broader remark in [116_cucumber-intro.md](./116_cucumber-intro.md), which assumed the newest version.)

## 2. VS Code extension (optional but recommended)
Extensions panel → search **Cucumber** → install *"Cucumber (Gherkin) Full Support"*
(`alexkrechik.cucumberautocomplete`). It gives syntax highlighting for `.feature` files,
autocomplete of steps, and *Go to definition* from a feature line to its step definition, and
warns about steps with no matching definition. Not needed to run tests — purely editor help.

## 3. Feature file basics
- A **feature** is like a test suite/folder; each **Scenario** is one test case. One `.feature`
  file can hold many scenarios.
- Cucumber looks in a **`features/`** folder in the project root by default — create it and put
  `*.feature` files there (extension must be `.feature`, not `.js`).
- Our first file: [Ecommerce.feature](/features/Ecommerce.feature)
  ```gherkin
  Feature: Ecommerce validations

    Scenario: Placing the order
      Given a login to Ecommerce application with "mkrishnaveni1102@gmail.com" and "Qazmlp@1505"
      When Add "Zara coat 3" to cart
      Then Verify "zara coat 3" is displayed in the cart
      When Enter valid details and place the order
      Then Verify order is present in the OrderHistory page
  ```
- **Given** = starting condition (we have login credentials), **When** = action performed
  (add to cart, place order), **Then** = verification/assertion. A scenario can contain several of
  each; the keyword is for human readability — Cucumber matches on the step text only.
- **Values in double quotes become parameters.** `"Zara coat 3"` is passed into the step's code
  as an argument, so the same step can be reused with different data (this is how you data-drive from
  the feature file instead of a JSON file).

## 4. Same code, plain-English layer
No new automation logic is written. Each line maps to code we already have in
[ClientApp.spec.js](/tests/ClientApp.spec.js) / the page objects:

| Feature line | Existing code it will wrap |
|---|---|
| Given a login ... with "user" and "password" | `goto`, fill `#userEmail` / `#userPassword`, click submit (login page object) |
| When Add "Zara coat 3" to cart | loop over `.card-body`, match product title, click *Add To Cart* |
| Then Verify "zara coat 3" is displayed in the cart | go to cart, assert product visible |
| When Enter valid details and place the order | country selection, *Place Order* click |
| Then Verify order is present in the OrderHistory page | orders page, match order id |

Each line needs a **step definition** with exactly matching text (next lecture: Cucumber can
generate the outer skeleton for undefined steps; we fill in the code).

## 5. Recent changes (since this was taught a few years ago)
- **Cucumber expressions** (`{string}`, `{int}`) are the default way to match steps now.
  Regex still works but older tutorials lean on it.
  `Given('a login to Ecommerce application with {string} and {string}', async function (user, pwd) {...})`
- **ESM and CommonJS:** newer Cucumber supports both; this repo is CommonJS (`"type": "commonjs"`),
  so use `require('@cucumber/cucumber')` and the config below.
- **Config file:** modern Cucumber uses a `cucumber.js` (or `cucumber.json`) file with named
  *profiles* (`default`, ...) instead of long CLI flags; `require`/`import` of step files and
  `format`/`parallel`/`retry` live there.
- **Parallel, retry, tags, reports** are built in (`--parallel`, `--retry`, `--tags`, `--format html`),
  replacing the Playwright Test runner features that don't apply with Cucumber.
- **Playwright + Cucumber:** use the plain `playwright` API (`chromium.launch()`) in `Before`/`After`
  hooks via a shared *World*; Playwright Test fixtures (`{ page }`) are not available.
- **Node versions:** Cucumber drops older Node versions every major release — check
  `npm view @cucumber/cucumber engines` before upgrading.

## 6. Security / hygiene
The feature file currently holds a **real email and password** in plain text, as does the demo spec.
That is fine for a practice site, but credentials in committed files get shared with everyone who sees
the repo. Later, move them to environment variables or a gitignored data file and pass them via
parameters.

## Interview takeaway
Feature file = *what* (readable, business-facing); step definitions = *how* (code). Quoted values in
steps act as parameters, giving data-driven reuse. A new step text without a matching definition is
reported as *undefined*.

## Next lecture
Generate step-definition skeletons with `npx cucumber-js`, then plug in the real Playwright code.
