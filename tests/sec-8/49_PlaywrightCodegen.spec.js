//FILE 7 - PLAYWRIGHT CODEGEN (record & playback script generation) - like file 6, this is pure
//notes on the TOOLING itself, not a runnable scenario, which is why there's no test() below.
//Codegen is a DIFFERENT tool from the Inspector in file 6 (even though Codegen also opens the
//Inspector window alongside it) - Codegen's job is to WRITE the script for you as you click around
//the real browser; the Inspector in file 6 is for stepping through/debugging a script you already wrote.

//1) HOW TO LAUNCH CODEGEN
//   npx playwright codegen <url>
//   e.g. npx playwright codegen https://rahulshettyacademy.com/angularpractice/
//   Passing the URL directly after the codegen keyword launches the browser already navigated there,
//   instead of landing on a blank page and having to goto() manually.

//2) WHAT OPENS
//   - A real (headed) browser window, driven by Playwright, alongside the Playwright Inspector.
//   - The Inspector's left panel shows the record/playback controls (a red "recording" dot you can
//     click to pause/stop) and a live-growing code pane - every action you perform in the real
//     browser window gets translated into a line of code here AS YOU DO IT, not after the fact.

//3) RECORDING AN END-TO-END FLOW
//   - Just interact with the app normally (click links, click buttons, fill fields) - Codegen
//     listens to real DOM events and infers the right Playwright call + locator for each one.
//   - e.g. clicking a "Shop" nav link generates something like:
//       await page.getByRole('link', { name: 'Shop' }).click();
//   - e.g. clicking "Add to Cart" on a product card generates a scoped locator similar to:
//       await page.locator('.card').filter({ hasText: 'iPhone' }).getByRole('button', { name: 'Add' }).click();
//   - Codegen doesn't always pick the same locator STYLE for every element - sometimes it emits
//     page.locator(cssSelector), sometimes getByRole(...)/getByText(...)/getByPlaceholder(...) -
//     it picks whichever it judges most unique/stable for that specific element at that moment.
//     Don't expect 100% consistency; review/clean up the generated locators afterward if needed.

//4) RECORDING ASSERTIONS (not just clicks/fills) - the Inspector toolbar has dedicated assertion
//   buttons; hover an element in the real browser first, then pick one of these three:
//   a) "Assert visibility" - checks the element is present/visible on the page. Generates:
//        await expect(page.locator('...')).toBeVisible();
//      Use when you only care THAT something rendered, not what text/value it holds.
//   b) "Assert text" - checks the element's text content matches exactly what's on screen right now.
//      e.g. hovering a "Please choose your delivery location" label and confirming generates:
//        await expect(page.locator('...')).toContainText('Please choose your delivery location');
//      Use for labels/headings/messages where the exact wording matters.
//   c) "Assert value" - checks an input/textbox's current VALUE (not its visible label text).
//      e.g. hovering a country textbox that currently has "India" typed into it generates:
//        await expect(page.locator('...')).toHaveValue('India');
//      Use for form fields (inputs/selects) where you want to confirm what's actually entered/selected,
//      since toHaveText/toContainText read rendered text, not an input's value attribute.
//   In all three cases: hover the element -> pick the assertion type -> a green checkmark confirms
//   the condition currently holds -> the matching expect(...) line is appended to the generated script.

//5) STOPPING, COPYING, AND REUSING THE SCRIPT
//   - Click the red recording dot again to stop recording.
//   - The Inspector has a "copy" button on the code pane - copy the whole generated script and paste
//     it into a real .spec.js file (e.g. a new tests/ file) to start cleaning it up/extending it.
//   - Codegen's generated script is a complete, runnable test on its own (imports + test() wrapper
//     included) - you don't have to hand-assemble boilerplate before pasting.

//6) CROSS-LANGUAGE EXPORT
//   - The Inspector has a target/language dropdown (defaults to JavaScript/TypeScript since that's
//     what `npx playwright codegen` runs under Node.js here) - switching it to Java (or Python/.NET)
//     instantly re-renders the ENTIRE recorded script in that language's Playwright API.
//   - Useful if your team's actual framework is in a different language - record once in whichever
//     language is convenient, then export/migrate to the target framework instead of hand-translating.

//7) HOW MUCH OF A REAL FRAMEWORK THIS COVERS - AND WHY WE STILL WRITE SCRIPTS BY HAND
//   - Codegen + Inspector together can get you roughly 50-70% of a straightforward end-to-end flow:
//     navigation, clicks, fills, and the three assertion types above, all with working locators.
//   - It CANNOT generate: loops over dynamic lists (e.g. scanning cards to find one by name, as in
//     ClientApp.spec.js), conditional logic, data-driven iteration, custom waits/retries, or any
//     reusable structure (page objects, helper functions) - that's the 30% "core logic" that comes
//     from knowing the Playwright API, not from recording.
//   - Recommended workflow: use Codegen to quickly scaffold the happy-path flow and grab correct
//     locators, paste it into a real spec file, then hand-edit it to add the logic/structure a
//     production framework actually needs (as done throughout this repo's other spec files).

//8) TERMINOLOGY NOTE
//   - "Record and playback" and "Codegen" refer to the SAME feature - `codegen` is just the CLI
//     keyword used to launch it; everything happens inside the same Playwright Inspector window
//     covered in file 6, just with the extra recording panel active.

//NEXT STEPS: take a Codegen-generated script, paste it into a new spec file, and refactor it using
//the patterns already covered in ClientApp.spec.js / ClientAppOtherWay.spec.js (scoped locators,
//loops for dynamic lists, auto-waiting, special locators) to turn it into production-quality code.
