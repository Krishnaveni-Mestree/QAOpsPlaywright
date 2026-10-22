//FILE 8 - PLAYWRIGHT REPORTING, SCREENSHOTS & TRACE VIEWER - like files 6/7, this is pure notes on
//the TOOLING/config itself, not a runnable scenario, which is why there's no test() below.
//See playwright.config.js's `use` block (trace/screenshot) and `reporter` key - this file explains
//WHY those values are set the way they are.

//1) TURNING ON SCREENSHOTS/TRACE - NO CODE CHANGES NEEDED
//   Both are pure config switches in playwright.config.js's `use` block - you never write screenshot/
//   trace-capturing code yourself, Playwright's test runner does it automatically around every action.
//   - screenshot: 'on' captures a screenshot after every step of every test (useful when a manager
//     specifically asks for "a screenshot per step" as proof).
//   - trace: 'on' captures a full trace.zip (DOM snapshots + network + console + timing) for every test.
//   CORRECTION/RECOMMENDATION (see playwright.config.js): 'on' for both means every test - pass AND
//   fail - leaves artifacts on disk, which doesn't scale once you have hundreds of tests. Prefer
//   screenshot: 'only-on-failure' and trace: 'retain-on-failure' - same debugging info, but artifacts
//   only stick around for tests that actually failed (passed tests' temp artifacts are deleted).

//2) RUNNING THE WHOLE SUITE
//   `npx playwright test` with no file argument runs every spec file under testDir (./tests here).
//   GOTCHA FROM THE LECTURE: a stray test.only(...) left in any file will silently limit execution
//   to just that one test, even when you run the whole suite - always grep for test.only before a
//   full run (forbidOnly:true in config only blocks this on CI, not local runs).

//3) THE HTML REPORT (reporter: 'html' in config)
//   - After a run, Playwright auto-opens (or prints a path to) playwright-report/index.html.
//   - Reopen it anytime with: npx playwright show-report
//   - The report lists every test with pass/fail status; opening a FAILED test shows:
//     a) the thrown error (e.g. "page was closed" from a navigation timing out after 30s - see
//        navigationTimeout in config),
//     b) a step-by-step breakdown with duration per step (handy for spotting which step is slow),
//     c) the failure screenshot (only present if screenshot capturing was enabled for that run),
//     d) a "trace" link/attachment you can download/open (only present if trace capturing was on).

//4) THE TRACE VIEWER - the single most useful debugging artifact
//   Open a trace.zip either by:
//     - running: npx playwright show-trace <path-to-trace.zip>
//     - or dragging/dropping the zip onto https://trace.playwright.dev/ (runs entirely in-browser)
//   What you get, PER ACTION in the test:
//     - a BEFORE and AFTER screenshot of the page at that exact moment,
//     - the locator/selector used and the exact text/value involved in that action,
//     - a timeline across the top (e.g. "2.4s -> this action, 2.6s -> next action") so you can see
//       visually where time was spent across the whole test,
//     - console/network log entries tied to that action.
//   This is what actually lets you answer "why is this test flaky/where exactly did it break" instead
//   of just knowing THAT it failed.

//5) WHERE THESE ARTIFACTS LIVE ON DISK: the test-results/ FOLDER
//   - Every test gets its OWN subfolder here (not shared) - e.g. running 5 test cases produces 5
//     subfolders, each named after that test's file+title.
//   - Inside each subfolder: the failure screenshot(s) and a trace.zip for that specific test.
//   - This is exactly why 'retain-on-failure'/'only-on-failure' matter at scale: with 'on', a 100-test
//     suite creates 100 of these subfolders (with full trace.zips) every single run, passed or not.

//6) WORKFLOW SUMMARY
//   a) Set trace/screenshot to 'retain-on-failure'/'only-on-failure' (or 'on' temporarily while
//      actively debugging/demoing).
//   b) Run `npx playwright test`.
//   c) Open the HTML report (`npx playwright show-report`) to see which tests failed and why.
//   d) For a deeper look at a failing test, open its trace.zip (from the report's attachment link, or
//      straight from test-results/<test-folder>/trace.zip) in the trace viewer and step through it
//      action-by-action with before/after screenshots.

//NEXT STEPS: use this workflow whenever a test fails intermittently (flaky) - the trace viewer's
//before/after screenshots + timeline are far faster for root-causing than re-running headed locally.
