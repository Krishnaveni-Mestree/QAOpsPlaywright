# HTML & Allure Reporting — Section Notes

## 1. The built-in HTML reporter (recap)
This repo's [playwright.config.js](/playwright.config.js) already sets
`reporter: 'html'`, which is why every `npx playwright test` run produces the
`playwright-report/` folder with an `index.html`. Key things demonstrated:
- **Opening it**: `npx playwright show-report` (or opening `playwright-report/index.html`
  directly) serves the report in a browser.
- **Investigating a failure**: click the failing test → see the exact assertion
  error (e.g. a timeout) → see which step it died on → see the attached
  **screenshot** (before/after) → open the **trace** for that test to get full
  network/console/DOM timeline.
- **Opening a trace manually**: if you only have the `trace.zip`, drop it onto
  [trace.playwright.dev](https://trace.playwright.dev), or run
  `npx playwright show-trace path/to/trace.zip` locally — same mechanism noted
  in the [playwright.config.js](/playwright.config.js) comments on the `trace` option.
- This is also how the two genuine failures from
  [102_race-condition.md](/tests/sec-19/102_race-condition.md) were diagnosed:
  one real timeout (flaky, passed on retry) and one expected visual-snapshot
  mismatch (Google's homepage UI changed — outside our control).

## 2. Why reach for Allure instead
The HTML reporter is good enough for day-to-day debugging, but **Allure**
gives a richer, more structured UI on top of the same underlying test run
data: pie-chart pass/fail breakdowns, suite/feature/story-based navigation,
and a report format that's shared across many test frameworks/languages (not
Playwright-specific) — handy when a QA org standardizes reporting across
multiple tools. It does **not** ship with Playwright — it's a separate
package you install and wire up as an additional reporter.

## 3. Installing & wiring up `allure-playwright`
```bash
npm i -D @playwright/test allure-playwright
```
This is the exact command already run in this project (see `package.json` →
`devDependencies.allure-playwright`). Then register it as a reporter — you can
run **multiple reporters at once** (an array), so you don't have to give up
the built-in HTML report to get Allure too:
```js
// playwright.config.js
reporter: [['line'], ['allure-playwright']],
```
- `line` prints a plain-text pass/fail summary to the terminal as tests run —
  besides being readable on its own, it's the lightweight "driver" reporter
  the lecture pairs with Allure so you still get live terminal feedback.
- You can also pass this at **runtime** instead of editing the config, which
  is what overriding looks like in practice:
  ```bash
  npx playwright test --grep @web --reporter=line,allure-playwright
  ```
  Without `--reporter`, Playwright falls back to whatever `reporter` is set
  to in `playwright.config.js` (`html`, in this repo).

Running tests with the Allure reporter active writes **raw result data**
(JSON + attachments, not human-readable) into an `allure-results/` folder —
this is just the data layer; it is not the report itself yet.

## 4. ⚠️ Important gap vs. what the lecture shows (current package docs)
The lecture's `allure generate ./allure-results --clean` / `allure open` /
`allure-results` workflow assumes a separately-installed, Java-based `allure`
CLI (what current docs now call **Allure Report 2**, installed globally or via
`allure-commandline`). As of the version actually installed here
(`allure-playwright@^3.14.0`), the officially documented path is **Allure
Report 3**, a pure npm package — and this repo currently has `allure-playwright`
installed but **not yet the renderer itself**. One more install is needed:
```bash
npm install -D allure          # the Allure Report 3 renderer/CLI (npm, no Java)
npx allure generate ./allure-results   # reads allure-results/, writes allure-report/
npx allure open ./allure-report        # serves the generated HTML report
# or, in one step:
npx allure serve ./allure-results      # generate + open immediately
```
Functionally this matches the lecture 1:1 (`allure-results` = raw data in,
`allure-report` = generated HTML out, `open` = serve it) — only the install
method and CLI invocation (`npx allure ...` vs. a global `allure` binary)
changed. The older Allure 2 CLI commands (`allure generate ... --clean`,
`allure open`) still work too if you install `allure-commandline`/Allure 2
instead — `allure-playwright` supports **both** Allure Report 2 and 3 as
renderers for the same `allure-results` data.

## 5. Bonus — enriching reports beyond the plain Playwright title
Not shown in the lecture, but available now via `allure-js-commons` (comes
with `allure-playwright`) — a **runtime API** to add structure/metadata Allure
can render as navigation (epics/features/stories), steps, parameters, and
attachments, instead of relying purely on the test title string:
```js
import { test } from '@playwright/test';
import * as allure from 'allure-js-commons';

test('sign in with a valid password', async ({ page }) => {
  await allure.epic('Signing in');
  await allure.feature('Authentication');
  await allure.tags('ui', 'web', 'smoke'); // complements the @web/@api title tags from 103_tags.md
  await allure.step('Fill the sign-in form', async () => { /* ... */ });
});
```
Useful once a suite grows large enough that scrolling a flat test list in the
report stops being practical.

## Key concepts to remember for interviews

| Concept | Explanation |
|---|---|
| Built-in `html` reporter | Zero-install, generates `playwright-report/`; `npx playwright show-report` opens it; includes screenshots + trace links per failed test out of the box. |
| `allure-playwright` | A **reporter plugin** that writes raw Allure-format result data (`allure-results/`) during the test run — it does not render the HTML report by itself. |
| `allure-results/` vs `allure-report/` | `allure-results` = raw per-test JSON/attachments written during the run; `allure-report` = the final generated HTML site, produced by a separate `allure generate` step. |
| Multiple reporters | `reporter: [['line'], ['allure-playwright']]` (config) or `--reporter=line,allure-playwright` (CLI) — reporters run side by side, they don't replace each other unless you only list one. |
| Allure Report 2 vs 3 | 2 = Java-based `allure` CLI (`allure-commandline`, installed separately/globally); 3 = pure npm package (`npm i -D allure`, invoked via `npx allure ...`). Same `allure-results` input, same `generate`/`open` concepts either way. |
| `allure serve` | One-shot convenience command: generates the report from `allure-results` **and** opens it immediately, skipping a separate `open` step. |
| `allure-js-commons` runtime API | Optional enrichment layer (`epic`/`feature`/`story`/`step`/`tags`/`parameter`/`attachment`) for structuring a large Allure report beyond flat test titles. |

## Possible interview questions this section prepares you for
1. What's the difference between Playwright's built-in HTML reporter and Allure, and when would you choose one over the other?
2. How do you configure Playwright to produce more than one report format from a single test run?
3. What's the difference between `allure-results` and `allure-report`, and why are they two separate folders/steps?
4. How would you make your HTML/Allure report attach a screenshot/trace for a failing test, and how do you open a trace file someone sends you?
5. How would you structure a very large Allure report (hundreds of tests) so it stays navigable?
