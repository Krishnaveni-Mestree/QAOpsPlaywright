# Running Playwright Tests from Jenkins — Section Notes

## 1. Create the job
1. Jenkins dashboard → **New Item** → name it (e.g. `PlaywrightFramework`) → choose **Freestyle project** → OK.
2. **Source:** normally you point Jenkins at a Git repo URL and it checks out the code. Here the
   project is only on this machine, so use **Advanced → Use custom workspace** and enter the
   absolute project path, e.g. `/Users/krishnaveni_mestree/Levelup/PlaywrightAutomation`
   (macOS: right-click the folder → Copy as Pathname; Windows: copy the path from Explorer).
   Jenkins then runs commands from that folder — same as `cd <project>` in a terminal.
3. **Build Steps → Add build step:**
   - macOS/Linux → **Execute shell**
   - Windows → **Execute Windows batch command**
4. Command: `npm run regression` (any script from [package.json](/package.json), see
   [106_scripts.md](./106_scripts.md)). Save, then **Build Now**.
5. Open the build → **Console Output** to watch the run. Green ball = success. The log shows the
   real command (`npx playwright test`) because npm echoes it.

## 2. Parameterized build (one job, any script)
Hard-coding one script means a new job per suite. Instead:
1. Job → **Configure** → tick **This project is parameterized** → **Add Parameter → Choice Parameter**.
2. **Name:** `script`. **Choices** (one per line, must match the script names exactly):
   ```
   regression
   webTests
   api
   SafariNewConfig
   ```
3. Build step command uses the parameter as an environment variable:
   - Shell: `npm run "$script"`
   - Windows batch: `npm run "%script%"`
   (`$script` / `%script%` is how Jenkins injects the chosen value; without the `$`/`%` it is
   just the literal text "script".)
4. Save → the button becomes **Build with Parameters** → pick an option → Build.
   Console output now shows e.g. `npx playwright test --grep @api`.

One job, many suites: the web team picks `webTests`, the API team picks `api`, nightly picks
`regression` — no duplicate jobs.

## 3. Reports
- Default `reporter: 'html'` writes `playwright-report/index.html` inside the workspace; open it
  from the workspace path in a browser.
- For live console progress in Jenkins add a script such as
  `"regressionLive": "npx playwright test --reporter=line,html"` and add it to the choice list.
  (Allure: see [105_html-allure-reports.md](./105_html-allure-reports.md).)

## 4. Recent changes & gotchas (important — not in the lecture)
- **`npm: command not found` on macOS/Linux:** Jenkins starts with a minimal PATH, not your
  login shell's. Fix by either installing the **NodeJS plugin** (Manage Jenkins → Plugins →
  then enable it under Build Environment) or adding at the top of the shell step:
  `export PATH="/opt/homebrew/bin:$PATH"` (Homebrew on Apple Silicon).
- **Jenkins needs Java 21/25** and, like your terminal, the Playwright browsers must be installed
  for the user running Jenkins (`npx playwright install` once; on fresh Linux agents
  `npx playwright install --with-deps`).
- **Run headless in CI.** [playwright.config.js](/playwright.config.js) sets `headless: false`;
  on a server/agent without a display, headed runs fail. Use headless via config or `CI` env var.
- **Blocking builds:** a leftover `test.only` silently runs only those tests, and `page.pause()`
  hangs the build forever (Inspector waiting). Also the HTML reporter can try to open a report
  server after failures — set `PLAYWRIGHT_HTML_OPEN=never` (or `open: 'never'`) in CI.
- **HTML report looks broken inside Jenkins:** Jenkins' default Content-Security-Policy strips
  the report's JS/CSS. Use the **HTML Publisher plugin** (Post-build Actions → Publish HTML
  reports, directory `playwright-report`, index page `index.html`) instead of clicking the raw file.
- **Quote the parameter** (`"$script"`). Choice parameters limit values to your list, which keeps
  it safe; avoid free-text String parameters pasted straight into the shell (command injection).
- Freestyle is fine for learning; real teams usually move to a **Pipeline** (`Jenkinsfile`) kept in
  Git, with the same `npm run` commands inside a `sh` step.
- Jenkins is separate from the `playwright.config.js`: Jenkins only decides *which* `npm run`
  command executes; Playwright config/tags decide *what* runs.

## Interview takeaway
Tags (`@Web`, `@api`) → npm scripts → one parameterized Jenkins job. Anyone can trigger any
suite without remembering CLI flags, and the pipeline stays one job instead of many.
