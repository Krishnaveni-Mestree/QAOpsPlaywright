# Race Conditions in Parallel Test Runs — Section Notes

## What actually happened in the previous run
Running the whole suite surfaced **5 failures**. The instructor's point: this
wasn't 5 real app bugs — it was **the same login + the same product, repeated
across many independent spec files, all racing each other** once Playwright
started running those files in parallel (the default file-level parallelism
from the previous lecture).

In this very repo, `productName = 'ZARA COAT 3'` plus the same hardcoded demo
credentials (e.g. `mkrishnaveni1102@gmail.com` / `anshika@gmail.com`) show up
in [ClientApp.spec.js](/tests/ClientApp.spec.js),
[ClientAppOtherWay.spec.js](/tests/ClientAppOtherWay.spec.js), and nearly every
file under `sec-11/` and `sec-17/` (56, 57, 58, 59, 65, 88, 89_pom-1, 89_pom-2,
90_POManager, 91_POManager, 92-94) — each one logging in as the same user and
adding/removing the same product from the same real backend cart.

## Why that causes a race condition (not a bug)
A **race condition** = two or more independent processes read/write the
**same shared, mutable resource at the same time**, and the outcome depends on
unpredictable timing instead of test logic. Here, the shared resource is the
**backend cart/account state for one demo user**:
- Test A (e.g. the standalone `ClientApp.spec.js` e2e test) adds "ZARA COAT 3"
  to the cart, then places the order — which **empties the cart server-side**.
- Test B (e.g. the page-object version of the exact same flow), running in a
  **different parallel worker at the same moment**, expects that same item to
  still be sitting in the cart when it checks — but Test A's order just wiped
  it out from under it.
- Same story on the **API side**: multiple spec files reuse the same
  credentials to fetch a token and create/modify the same item — different
  UI, same backend truth, same collision.

This is why real-world automation avoids giving two tests **identical data AND
identical logic** — vary the credentials, the product, or at minimum isolate
each test's own slice of data, so parallel workers never fight over the same
row/record.

## Two mitigations applied in this lecture

### 1. `test.skip` on the genuinely duplicate test
Once the page-object (POM) version of "login → add ZARA COAT 3 → place
order" existed with properly isolated data, the **older standalone duplicate**
(same steps, same hardcoded data, just not refactored into POM yet) adds no
coverage — it only adds another racer contending for the same backend state.
Skipping it directly reduces how many near-identical tests can collide:
```js
test.skip('playwright test - client app e2e', async ({ page }) => { ... })
```

### 2. `retries` in `playwright.config.js`
```js
export default defineConfig({
  retries: 2, // not present in this repo's current config — this is what the lecture adds
  use: {
    headless: true, // switched from false → true for the same run, for stability
  },
});
```
- **`retries`**: when a test fails, Playwright automatically re-runs it (in a
  **fresh worker process**) up to N more times before declaring it truly
  failed. A test that fails once but then passes on a retry is bucketed as
  **"flaky"** in the HTML report/terminal summary — not "passed" cleanly, not
  "failed" either, so you can still see it happened without breaking the
  build.
- **`headless: true`**: a headless browser renders no visible UI chrome and
  uses less memory/CPU than headed mode — with 15 tests racing in parallel on
  one machine, this reduces (but doesn't eliminate) timing-related flakiness
  caused purely by system load.

## Result after applying both
Failures dropped from 5 to 2, and only one of those was a **genuine** issue:
1. **Visual snapshot mismatch** (`toMatchSnapshot('baseline-screenshot.png')`
   against google.com) — Google changed their homepage UI since the baseline
   was captured. Retries can't fix this (it's deterministic, not timing-based)
   — the fix is to regenerate the baseline, or avoid snapshotting third-party
   pages you don't control, as already noted in
   [78_visual-comparison.spec.js notes](/memories/repo/playwright-course-notes-workspace.md).
2. **One real flaky test** — a country dropdown never opened on its first
   attempt in headless mode (confirmed via the **trace viewer's**
   before/after screenshots — same trace-viewer workflow from sec-12), most
   likely because the page took longer to become interactive while 15 tests
   were competing for the same machine's resources. It passed cleanly on the
   automatic retry, so Playwright correctly classified it as **flaky**, not
   failed.

## Retries are a safety net, not a substitute for test isolation
The instructor is explicit about this: reaching for `retries` to paper over
failures caused by tests stepping on each other's shared data is a workaround,
not the real fix. The durable fix is **test isolation** — give every test its
own data so it literally cannot collide with another test running at the same
time (Playwright's own docs call this pattern out directly):
```js
test('creates an order', async ({ page }, testInfo) => {
  const orderId = `order-${testInfo.testId}`; // unique per test, never collides
  await page.goto(`/orders/new?id=${orderId}`);
});
```
If many tests can safely share one dataset instead, scope it **per worker**
(via `testInfo.workerIndex`) rather than per test, and create/tear it down in
a `beforeAll`/fixture — see `testInfo.workerIndex` / `TEST_WORKER_INDEX` in the
official Parallelism guide.

## Key concepts to remember for interviews

| Concept | Explanation |
|---|---|
| Race condition (test automation) | Two or more tests/processes read-write the same shared backend resource concurrently; outcome depends on timing, not logic — classic symptom of reusing identical login/data across many parallel tests. |
| `retries` (config or `test.describe.configure({ retries })`) | Re-runs a failed test (in a new worker) up to N times before marking it failed; a first-attempt failure that later passes is reported as **"flaky"**, a separate category from passed/failed. |
| `testInfo.retry` | Accessible in any test/hook/fixture; lets you detect "this is a retry attempt" to do cleanup (e.g. clear server-side state) before trying again. |
| `test.skip(...)` | Removes a redundant/duplicate test from execution entirely — best option when a newer, better-isolated version of the same coverage already exists. |
| `headless: true` vs `false` | Headless uses less memory/CPU per browser instance — more stable under heavy parallel load; headed is better for live debugging, worse for large parallel runs. |
| Flaky vs failed | "Flaky" = failed at least once but eventually passed within the retry budget. "Failed" = still failing after all retries exhausted. Both are visible in the report, but only "failed" breaks a CI build by default. |
| Test isolation (`testInfo.testId` / `testInfo.workerIndex`) | The actual long-term fix for race conditions — give each test (or each worker) its own unique slice of data so parallel runs can never contend over the same record. |
| Trace viewer for flaky diagnosis | Opening the trace of a failed attempt (before/after screenshots, network, console) is how you tell "environment timing glitch" apart from "real app/test bug" — used here to confirm the dropdown genuinely never rendered on attempt 1. |

## Possible interview questions this section prepares you for
1. What is a race condition in the context of parallel test execution, and how would you recognize one from a test report?
2. How do Playwright retries work, and what's the difference between a "flaky" and a "failed" test in the report?
3. Why shouldn't you rely on `retries` alone to fix intermittent failures?
4. How would you design test data so that tests can safely run in parallel without colliding?
5. When would you choose `test.skip()` over just deleting a test?
6. Why might `headless: true` reduce flakiness compared to running headed, especially under heavy parallel load?
7. How do you use the trace viewer to tell apart a genuine bug from environment-induced flakiness?
