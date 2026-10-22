# Tagging Tests & Selective Execution — Section Notes

## The problem tagging solves
A real framework mixes many kinds of tests in one `tests/` folder — pure UI
end-to-end flows, pure API calls, UI+API hybrids, smoke checks, regression
checks. Running `npx playwright test` always triggers **everything** in
`testDir`. Tags let you label tests by category once, then selectively run
only the tests carrying a given label — without commenting anything out or
moving files around.

## Two ways to tag a test (both valid, current docs prefer the second)

### 1. Inline `@tag` inside the title string (what the lecture demonstrates)
```js
test('playwright test - client app e2e @web', async ({ page }) => { ... })
test('place the order @api', async ({ request }) => { ... })
```
- The tag is just text embedded in the title — `@` is a **convention**, not
  special syntax, but it's important: it keeps tags visually distinct and
  avoids accidentally matching ordinary English words elsewhere in other
  titles when filtering.

### 2. The `tag` option in test details (added v1.42 — the more structured, current-docs-recommended form)
```js
test('client app e2e', { tag: '@web' }, async ({ page }) => { ... });
test('place the order', { tag: ['@api', '@smoke'] }, async ({ request }) => { ... });

// tag a whole describe group at once - every test inside inherits it
test.describe('cart flows', { tag: '@web' }, () => {
  test('add to cart', async ({ page }) => { ... });
});
```
- Keeps the title clean/readable while still being queryable the same way via
  `--grep`.
- Supports **multiple tags per test** as an array, and tags are visible to
  custom reporters via `TestCase.tags` — useful if you ever build a custom
  HTML/Slack reporter that groups results by tag.
- Each tag must still start with `@`, same rule as the inline form.

## Running only tagged tests from the CLI
```bash
npx playwright test --grep @web          # only tests tagged @web
npx playwright test --grep @api          # only tests tagged @api
npx playwright test --grep "@web|@api"   # either tag (regex alternation)
npx playwright test --grep-invert @web   # everything EXCEPT @web
```
- `--grep` does a **regex match against the full test title** (which is why
  the inline-string tagging style works at all — the tag text becomes part of
  what gets matched). The `tag` option form is matched the same way under the
  hood.
- This can also be baked into the config instead of typed every time, via
  `testConfig.grep` / `testProject.grep` — handy for a dedicated `smoke`
  project in `playwright.config.js` that always only runs smoke-tagged tests.

## What the lecture demonstrated in this repo
- Tagged ~5 pure-UI tests `@web` across multiple files (the client-app e2e
  flow, a couple of validation tests, a UI-controls test that itself runs
  multiple times via parametrization) — running `--grep @web` picked up
  exactly those 5, spread across 3 files, so 3 workers ran them in parallel.
- Tagged 2 pure-API tests (e.g. "place the order" via API only, no browser)
  `@api` — running `--grep @api` picked up exactly those 2, across 2 workers.
- **Gotcha caught live in the lecture**: after adding a tag but forgetting to
  save the file, `--grep @api` only matched 1 of the 2 intended tests — not
  an error, just a reminder that `--grep` string-matches whatever is
  **currently saved on disk**, so an unsaved edit is silently invisible to it.
- `headless: true` was kept on for this run too — same reasoning as the
  previous lecture (retries/race-conditions notes): fewer real browser windows
  fighting for resources when several tagged tests run in parallel.

## Why this matters for a real framework (and for interviews)
This is the exact mechanism behind **smoke vs. regression suites**: tag ~10
critical tests out of 100 as `@smoke`, run only those on every commit/PR
(`--grep @smoke`), and reserve the full untagged run for a nightly/full
regression job. This is also the natural lead-in to **CI/CD integration**
(Jenkins) — a pipeline stage can simply pass a different `--grep` value
depending on the trigger (PR vs. nightly vs. release).

## Key concepts to remember for interviews

| Concept | Explanation |
|---|---|
| Inline `@tag` in title | Tag embedded directly in the title string; works with plain `--grep`, no special API needed, but clutters the title. |
| `{ tag: '@name' }` test/describe option | Structured tagging API (v1.42+); supports arrays of tags, tags a whole `describe` group at once, exposed to custom reporters via `TestCase.tags`. |
| `--grep <regex>` | CLI flag to only run tests whose title matches the given regex — tags are just a naming convention layered on top of this generic mechanism. |
| `--grep-invert <regex>` | Opposite of `--grep` — run everything that does NOT match (e.g. exclude a known-flaky or visual-only tag). |
| `testConfig.grep` / `testProject.grep` | Config-file equivalent of `--grep` — lets a dedicated project (e.g. `smoke`) always filter to certain tags without typing the flag each run. |
| Smoke vs regression suite | Tag a small critical subset `@smoke` for fast/frequent runs; run the full suite less often (nightly) — a standard CI/CD cost-saving pattern. |
| Tags are just text | No tag "registry" to maintain — a typo'd tag simply won't match anything, and `--grep` won't warn you; always re-run and confirm the expected test count. |

## Possible interview questions this section prepares you for
1. How do you run only a subset of tests (e.g. smoke tests) in a large Playwright suite?
2. What's the difference between tagging a test via its title string vs. the `tag` option, and when would you prefer one over the other?
3. How does `--grep` actually work under the hood — is it tag-aware, or something more generic?
4. How would you exclude a specific category of tests (e.g. visual/flaky tests) from a CI run?
5. How would you structure a Playwright project to support both a fast "smoke" pipeline stage and a full nightly regression run?
