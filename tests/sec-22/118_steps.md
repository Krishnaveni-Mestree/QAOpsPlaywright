# Generating Step Definition Skeletons (Section Notes)

## 1. How the skeleton is generated
Cucumber does **not** create step files by itself. The workflow is:
1. Write the [feature file](/features/117_Ecommerce.feature).
2. Run it: `npx cucumber-js`
3. Because no step definitions exist yet, every step is reported **Undefined**, and Cucumber prints a
   ready-made code snippet for each one ("Implement with the following snippet").
4. Copy those snippets into a new JS file → that is your skeleton. Fill in real code next lecture.

Correct command is **`npx cucumber-js`** (hyphen). `npx cucumber.js` fails with an npm 404 because
npx searches the registry for a package literally named "cucumber.js".

## 2. What `npx cucumber-js` actually does
- `@cucumber/cucumber` installs an executable called `cucumber-js` in `node_modules/.bin/`.
- `npx <name>` runs the executable `<name>` from the local `node_modules/.bin` (downloading it only
  if it is not installed). So `npx cucumber-js` = run `node_modules/.bin/cucumber-js`.
- That program scans the project: it looks for a **`features/`** folder, loads every `*.feature` file
  and also auto-loads JS files from `features/**` (this includes `features/step_definitions/`).
  Anything outside `features/` must be listed with `require` (config file or `--require`).
- Exit code is non-zero when steps are undefined/failed — important later for Jenkins.

## 3. The step definition file
Location: [features/step_definitions/118_steps.js](/features/step_definitions/118_steps.js)
(any name/sub-folder under `features/` works; `step_definitions` and `support` are the usual conventions).

```js
const { Given, When, Then } = require('@cucumber/cucumber');

Given('a login to Ecommerce application with {string} and {string}', function (username, password) {
  return 'pending';
});
```
- **Import `Given, When, Then`** from `@cucumber/cucumber` — they are functions, not built-in keywords.
- **First argument** = the step text from the feature file. It must match the line (the keyword
  Given/When/Then itself is not compared — only the text).
- **`{string}`** is a *Cucumber expression* placeholder. It matches any value in double quotes in
  the feature line, so one definition serves any username/password/product:
  ```gherkin
  Given a login to Ecommerce application with "other@mail.com" and "OtherPwd"
  ```
  uses the same step with different data — no new function needed.
- **Second argument** = the function that runs. Captured `{string}` values arrive **in order** as its
  parameters. Names are free; `username, password, productName` are clearer than the generated
  `string, string2`.
- Steps with no quotes (e.g. `Enter valid details and place the order`) take no parameters.
- `return 'pending'` marks a step as *not implemented yet* — the scenario shows **pending** and the
  remaining steps are **skipped**. Replace it with real code in the next lecture.

## 4. Typical output meanings
| Status | Meaning |
|---|---|
| passed | step code ran without error |
| failed | step code threw (assertion/exception) |
| undefined | no step definition matches the text (snippet printed) |
| pending | definition exists but returns `'pending'` |
| skipped | not run because an earlier step in the scenario did not pass |

## 5. Recent changes (vs. tutorials from a few years ago)
- **Cucumber expressions** (`{string}`, `{int}`, `{float}`, `{word}`) are the default and what the
  generated snippets use; regex step text still works but is the older style. Placeholders
  are parsed and type-converted for you (`{int}` gives a number).
- **Use `function () {}` not arrow functions** in step definitions and hooks if you need `this`
  (the shared *World* object: it holds the `page`, etc. in the next lectures). Arrow functions lose `this`.
- **Config via `cucumber.js`/`cucumber.json` profiles** is now the recommended way to set
  `require`, `format`, `parallel`, `retry`, `tags`, instead of long CLI flags.
- Useful flags: `npx cucumber-js --dry-run` (check steps are all defined without executing them),
  `--name "Placing the order"` (run one scenario), `--tags "@smoke"`.
- Async steps: write `async function` and `await` Playwright calls; returning a Promise is enough.
  `return 'pending'` is a special value (as are `'skipped'`); a returned plain value is otherwise ignored.
- Both CommonJS (`require`, used here) and ESM (`import`) are supported by current Cucumber.js.

## Interview takeaway
Undefined-step snippets are Cucumber's built-in scaffolding. A step definition = keyword + text
pattern (with `{string}` etc. for dynamic data) + function. Matching is text-based, so one definition
can serve many feature files with different data.

## Next lecture
Plug the real Playwright login / add-to-cart / checkout / order-history code into these step bodies.
