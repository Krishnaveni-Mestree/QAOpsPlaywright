//CUCUMBER COMMANDS CHEAT-SHEET (copy/paste from here). All are run from the project root.
//Every command already gets `--exit` behaviour from cucumber.js (forceExit: true), but writing --exit is harmless.

//RUN EVERYTHING (all feature files)
npx cucumber-js --exit

//RUN ONE FEATURE FILE
npx cucumber-js features/122_ErrorValidations.feature --exit

//RUN BY TAG (tags are written above scenarios, e.g. @Regression, @Validations)
npx cucumber-js --tags "@Regression" --exit
npx cucumber-js --tags "@Validations or @Regression" --exit      //either tag
npx cucumber-js --tags "not @Validations" --exit                  //everything except

//RUN SCENARIOS IN PARALLEL
npx cucumber-js features/124_parallel-run.feature --parallel 2 --exit
//  --parallel N = run N scenarios at the same time (N "workers"), each with its own browser (the Before hook runs per scenario).
//  LIMITATION: Cucumber parallelizes SCENARIOS, not feature FILES. Two feature files cannot be run side by side as
//  files, but all scenarios inside one file (or across files - they are just a pool of scenarios) can be shared out to workers.
//  Pick N = how many scenarios you want running at once (2 scenarios here -> 2). More workers = more CPU/RAM.
//  Check: the summary shows "0m12.9s (executing steps: 0m22.1s)" - the wall-clock time is LESS than the sum of the steps.

//GENERATE AN HTML REPORT
npx cucumber-js features/124_parallel-run.feature --parallel 2 --exit --format html:cucumber-report.html
//  --format <type>:<file>   Other formats: json:report.json , junit:report.xml (JSON/XML are used by CI tools).
//  Open cucumber-report.html in a browser: each scenario/step ticks green (pass) or red (fail) with the full error log,
//  plus totals (scenarios, pass %, duration). It is a basic report; external plugins give fancier ones.
//  NOTE: your cucumber.js already prints the normal console "progress" output; --format adds the report on top.

//RE-RUN FAILED SCENARIOS (for flaky tests: environment hiccups that pass on the second try)
npx cucumber-js --tags "@Regression" --retry 1 --exit --format html:cucumber-report.html
//  --retry 1 = if a scenario fails, run it ONE more time (use --retry 2 for two more tries).
//  If the retry passes -> reported as PASSED (the earlier failure is replaced). If it still fails -> reported as FAILED.
//  The report does NOT tell you it ran more than once, and the console still counts "1 scenario".
//  Same idea as `retries: 2` in playwright.config.js for the Playwright Test (Mocha-style) runner.

//RUN VIA npm SCRIPT (added to package.json "scripts")
npm run cucumberRegression
//  = all @Regression scenarios + retry once on failure + HTML report. (Playwright Test is still `npm run regression`.)
//  Inside package.json JSON, a quote inside a quote is not allowed, so the tag uses SINGLE quotes: --tags '@Regression'
//  Why it is nice: ONE framework, two ways to run - `npm run regression` (Playwright Test spec files) and
//  `npm run cucumberRegression` (Cucumber plain-English scenarios) - sharing the same page objects underneath.
