# Custom npm Scripts in package.json — Section Notes

## Why
A Playwright framework is driven by two core files: `playwright.config.js`
(how tests run) and [package.json](/package.json) (what shortcuts you type to
run them). Instead of remembering long CLI commands (`--grep`, `--config`,
`--project`), wrap each one in a named script under `"scripts"` and run it with
`npm run <name>`. This is also what a Jenkins/CI job will call later.

## Scripts in this repo
```json
"scripts": {
  "test": "playwright test",
  "regression": "npx playwright test",
  "webTests": "npx playwright test --grep @Web",
  "api": "npx playwright test --grep @api",
  "SafariNewConfig": "npx playwright test --config playwright.config97.js --project=safari"
}
```

| Command | What it runs |
|---|---|
| `npm run regression` | Every test under `testDir` using the default `playwright.config.js`. |
| `npm run webTests` | Only tests whose title contains `@Web` (UI tests). |
| `npm run api` | Only tests whose title contains `@api` (tests that call the API — currently the hybrid `@Web @api` ones). |
| `npm run SafariNewConfig` | Uses a **different config file** (`--config`) and runs only its `safari` project (`--project`, WebKit). |

## How it works
- `npm run <name>` looks up `<name>` in the `scripts` section of `package.json`
  and executes that string as a shell command. `test` and `start` are special
  (`npm test` works without `run`); custom names always need `npm run`.
- npm echoes the command it executed, so you can always see the real
  underlying `playwright test ...` line in the output.
- `--config <file>` swaps the whole configuration; `--project <name>` picks one
  entry from that config's `projects` array (names are case-sensitive and must
  exist in that config — `safari` exists in `playwright.config97.js`).
- With no `--config`, Playwright uses `playwright.config.js`.

## Gotchas
- `--grep` is a **case-sensitive regex** on the test title: `@Web` ≠ `@web`,
  and `@api` ≠ `@API`. The script must match the tag exactly as written in the
  specs (an earlier `@API` in the `api` script matched zero tests).
- `test.only(...)` left in a spec file silently narrows any run (including these
  scripts) to just those tests — remove `.only` before running a full regression.
- Safari/WebKit with an iPhone-style device profile may fail on this demo app
  because it isn't fully responsive; the script itself is still valid.
- Extra flags can be appended after `--`, e.g. `npm run webTests -- --headed`.

## Interview takeaway
Custom scripts + tags = one-word entry points for smoke/regression/browser-
specific runs. In CI (Jenkins) the pipeline just calls `npm run <script>`, and
parameterized jobs can choose which script (or `--grep` value) to run.
