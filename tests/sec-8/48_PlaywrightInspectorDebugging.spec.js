//FILE 6 - PLAYWRIGHT INSPECTOR / --debug MODE (no new test syntax in this lecture - this file is
//pure notes on the TOOLING itself, not a runnable scenario, which is why there's no test() below).
//Use any existing spec (e.g. UIBasicstest.spec.js) with the --debug flag to see everything described here.

//1) HOW TO LAUNCH DEBUG MODE
//   npx playwright test tests/UIBasicstest.spec.js --debug
//   Adding --debug to the normal `npx playwright test <file>` command opens the PLAYWRIGHT INSPECTOR
//   window alongside the real browser - no third-party plugin, this ships with Playwright itself.

//2) STEP-BY-STEP EXECUTION
//   - The Inspector pauses BEFORE the first line; nothing has executed yet.
//   - "Step over" runs exactly one action/assertion at a time - the Inspector highlights which
//     element it's ABOUT TO act on (red circle/crosshair) before committing the step, so you see
//     the target highlighted on the real page first, then confirm it actually happened after.
//   - Useful specifically when a test fails intermittently and you need to see, line by line,
//     whether it's a sync/timing issue (e.g. clicking before the element loaded) vs. a bad locator.
//   - "Resume" (the play button, or F8) stops single-stepping and lets the rest of the test run
//     to completion normally - use this once you've confirmed the part you were worried about.

//3) LOCATOR PICKER ("spy") INSIDE THE INSPECTOR
//   - Click the pointer/"Explore" icon, then click any element in the real browser (e.g. the
//     "Student" radio button) - the Inspector instantly fills in the locator tab with Playwright's
//     own best-guess locator for that element (e.g. getByRole('radio', { name: 'Student' })).
//   - Lets you discover a correct/alternative locator AT RUNTIME when a line in your script fails -
//     e.g. if getByLabel('Employed') isn't resolving (see the getByLabel association rules in
//     practice2.spec.js), spy the element directly, copy the suggested locator, and drop it into
//     your script instead of guessing blindly.

//4) TESTING YOUR OWN LOCATOR STRING AT RUNTIME
//   - The Inspector's "Locator" input box lets you type ANY locator (CSS or Playwright syntax,
//     page. prefix optional) and hit Enter to see live in the browser whether/what it matches.
//   - It reports if a locator resolves to 0, 1, or multiple elements - e.g. `[name='name']` on the
//     Angular practice form returns "problem is one of 2" (strict-mode style ambiguity: 2 matches,
//     not unique) BEFORE you ever run it in a real test and hit a strict-mode violation failure.
//   - If your own locator isn't unique, you can instead click the Inspector's own "pick locator"
//     against that same element and let Playwright generate a unique parent->child CSS chain for
//     you (e.g. form input) - copy that back into your script.
//   - Works for any locator syntax, including the special locators (getByLabel, getByRole, etc.) -
//     type getByLabel('Gender') directly into the Locator box to confirm it resolves before using
//     it in code.

//5) WHY THIS MATTERS
//   - Removes the need for external browser plugins (e.g. SelectorHub) just to validate/author
//     locators - Playwright Inspector does spying, locator validation, AND line-by-line debugging
//     in one built-in tool.
//   - Best used reactively: when a test fails or a locator is uncertain, rerun with --debug, step
//     to the failing line, spy/validate the real locator, fix the script, rerun normally (without
//     --debug) to confirm.

//NEXT LECTURE: Playwright's "codegen" tool (record-and-playback script generation) - a different
//tool from the Inspector shown here, covered separately.
