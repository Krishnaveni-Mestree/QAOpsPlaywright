import { test, expect } from '@playwright/test';

//playwright's special/spatial locators - unlike plain CSS/XPath/ID, these locate elements
//the way a user would describe them (by label text, role, placeholder etc.), so they don't
//break when class names/IDs change, and they are only available in Playwright (not Selenium/Cypress).

test('@Web playwright special locators', async ({ page }) => {
    await page.goto('https://rahulshettyacademy.com/angularpractice/');

    //getByLabel finds the <label> with this text, then acts on whatever is associated/clickable
    //inside that label's zone - here it's a checkbox, so .check() ticks it (equivalent to .click()
    //for checkboxes/radio buttons, but .check() explicitly asserts it ends up checked).
    await page.getByLabel('Check me out if you Love IceCreams!').check();

    //same idea for a radio button - get by its label text and click/select it.
    await page.getByLabel('Employed').click();

    //GOTCHA (from the lecture): getByLabel works reliably for things you SELECT (checkboxes,
    //radios, dropdowns) because clicking the label is equivalent to clicking the control.
    //It is NOT reliable for things you TYPE into (e.g. password field) - clicking a label next to
    //a text input does not focus/type into it, so avoid getByLabel().fill() for text inputs.

    //selectOption() only works on native <select> dropdowns - it directly picks the option
    //by value/label instead of simulating clicks+hovers like a user would.
    await page.getByLabel('Gender').selectOption('Female');

    //getByPlaceholder matches the element's placeholder attribute directly - works here because
    //the password field has one. GOTCHA: the email field has no placeholder AND clicking its label
    //doesn't focus it (unlike checkboxes/radios above), so neither getByPlaceholder nor getByLabel
    //can be used for it - you'd fall back to a plain CSS/XPath locator for that field.
    await page.getByPlaceholder('password').fill('abc123');

    //getByRole filters all elements of that ARIA role (here 'button') then narrows by accessible
    //name - no CSS/XPath needed. Only pass { name } when multiple matches exist on the page.
    await page.getByRole('button', { name: 'Submit' }).click();

    //getByText scans the whole page for this exact text and returns a locator pointing at it -
    //isVisible() resolves to a boolean (true/false) you can assert on, it does not auto-wait/retry.
    await page.getByText('Success! The Form has been submitted successfully!.').isVisible()

    //getByRole also matches <a> tags under the 'link' role - same name-filter pattern as buttons.
    await page.getByRole('link', {name:'Shop'}).click();
    
    //Chaining pattern: locator('app-card') returns ALL 4 product cards, .filter({ hasText }) narrows
    //to the one card containing "Nokia Edge" (internally this re-applies getByText within each card),
    //then getByRole('button') (no name needed - only one button per card) clicks that card's own
    //Add button. Replaces manually looping/indexing through a list to find the right card.
    await page.locator('app-card').filter({hasText:'Nokia Edge'}).getByRole('button').click();

});

//RECENT PLAYWRIGHT UPDATES for THIS concept (getByLabel/getByPlaceholder/getByRole/getByText/
//locator().filter() + the UI test runner):
//- None of these locator methods have had breaking/behavioral changes in recent releases - they've
//  been stable since Locators were introduced (v1.14+/v1.27+), so every gotcha above still applies.
//- The most relevant past addition to the chaining pattern used here is locator.filter() gaining
//  hasNot/hasNotText options (v1.33), alongside the hasText used above, for excluding elements too.
//- The `--ui` test runner shown in this lecture keeps getting UI-only upgrades, not API changes:
//  v1.56 added a "merge files" view and single-worker mode, v1.62 added `--shuffle` to randomize
//  test order (useful for catching tests that accidentally depend on each other).


//assertion vs plain boolean check: isVisible() (used in the test above) returns true/false
//immediately with no retry/wait, so a not-yet-rendered element just reads as false and nothing
//fails. Wrapping the same locator in expect(...).toBeVisible() instead makes it a real assertion -
//Playwright auto-retries the check and FAILS the test if the element never becomes visible.
test('@Web playwright assertion timeout - step level', async ({ page }) => {
    await page.goto('https://rahulshettyacademy.com/angularpractice/');

    await page.getByLabel('Check me out if you Love IceCreams!').check();

    await page.getByLabel('Employed').click();

    await page.getByLabel('Gender').selectOption('Female');
    await page.getByPlaceholder('password').fill('abc123');
    await page.getByRole('button', { name: 'Submit' }).click();

    //every expect() assertion has its own built-in wait/retry window - default is 5s, but this
    //project's playwright.config.js raises the global default to 20s via expect.timeout.
    //the { timeout: 10_000 } here OVERRIDES that global value for just THIS one assertion step -
    //use a step-level override like this only when you've confirmed this specific action is slower
    //than the rest of the app (e.g. a known-slow submit), not as a blanket fix for flakiness.
    await expect(page.getByText('Success! The Form has been submitted successfully!.')).toBeVisible({timeout: 10_000});
    await page.getByRole('link', {name:'Shop'}).click();
    
    await page.locator('app-card').filter({hasText:'Nokia Edge'}).getByRole('button').click();

});


//test-level timeout override: use this when MOST/ALL assertions in one specific test are slow
//(e.g. this one flow's pages lag), but you don't want to touch the 20s global expect.timeout in
//playwright.config.js (that would affect all 50+ other tests too) and don't want to repeat
//{ timeout: ... } on every single expect() line (step-level override) either.
test('@Web playwright test level timeout', async ({ page }) => {

    //expect.configure() returns a NEW expect function pre-set with this timeout - it does not
    //mutate the real expect, so regular expect() calls elsewhere are unaffected. Scoped to this
    //test only (just a local const); give it any name (slowExpect here is just a convention).
    const slowExpect=expect.configure({ timeout: 9_000 });

    await page.goto('https://rahulshettyacademy.com/angularpractice/');

    await page.getByLabel('Check me out if you Love IceCreams!').check();

    await page.getByLabel('Employed').click();

    await page.getByLabel('Gender').selectOption('Female');
    await page.getByPlaceholder('password').fill('abc123');
    await page.getByRole('button', { name: 'Submit' }).click();

    //use slowExpect exactly like expect - every call through it now waits up to 9s instead of 5s/20s.
    await slowExpect(page.getByText('Success! The Form has been submitted successfully!.')).toBeVisible();
    
    await page.getByRole('link', {name:'Shop'}).click();

    //'.my-4' CSS class matches more than one element on the shop page, so .first() narrows to the
    //heading we actually want - toHaveText() auto-retries (substring match) until slowExpect's 9s
    //timeout, giving the page time to render the heading after the navigation above.
    await slowExpect(page.locator('.my-4').first()).toHaveText('Shop')
    
    await page.locator('app-card').filter({hasText:'Nokia Edge'}).getByRole('button').click();

});



//action timeouts follow the same global -> test -> step precedence as assertion timeouts, but
//through different APIs: actionTimeout in playwright.config.js (global) -> page.setDefaultTimeout()
//(test-level, shown below) -> { timeout } passed directly to one action call (step-level, highest
//priority). Unlike assertions, actions have no framework default - skip all of these and a stuck
//action just burns through the whole-test timeout before failing.
test('@Web playwright action timeouts', async ({ page }) => {
    //these 3 lines are independent (each controls its own clock: test/assertion/action) and are
    //combined here only to demo all three together - use just the one(s) a real test needs.

    //overrides this file's/config's overall per-test budget (config has 40s) for JUST this test -
    //useful when one flow is legitimately longer than the rest of the suite.
    test.setTimeout(60000) //1

    const slowExpect=expect.configure({ timeout: 9_000 });//2

    //test-level override for ACTIONS (click/fill/check/...), the action-timeout equivalent of
    //expect.configure() above - overrides config's actionTimeout (10s) to 9s for every action in
    //this test only; a { timeout } passed to an individual action would still win over this.
    page.setDefaultTimeout(9000);//3

    await page.goto('https://rahulshettyacademy.com/angularpractice/');

    await page.getByLabel('Check me out if you Love IceCreams!').check();

    await page.getByLabel('Employed').click();

    await page.getByLabel('Gender').selectOption('Female');
    await page.getByPlaceholder('password').fill('abc123');
    await page.getByRole('button', { name: 'Submit' }).click();

    await slowExpect(page.getByText('Success! The Form has been submitted successfully!.')).toBeVisible();
    
    await page.getByRole('link', {name:'Shop'}).click();

    await slowExpect(page.locator('.my-4').first()).toHaveText('Shop')
    
    await page.locator('app-card').filter({hasText:'Nokia Edge'}).getByRole('button').click();

});

//TIMEOUT CHEAT SHEET (3 independent clocks, each with global -> test -> step precedence):
//1) ASSERTION (expect) - "is it there?" - default 5s (this project's config raises global to 20s).
//   global: config expect.timeout | test: expect.configure({timeout}) | step: toBeVisible({timeout}).
//2) ACTION (click/fill/check/waitFor...) - "do it now" - default 0, i.e. NO own limit, just borrows
//   whatever time is left on the test clock. global: config use.actionTimeout | test:
//   page.setDefaultTimeout() | step: click({timeout}). Note setDefaultTimeout affects actions ONLY,
//   never assertions.
//3) TEST (the whole test function) - "how long can it all run" - default 30s (config raises to 40s
//   here), one cumulative clock that never resets between steps. global: config timeout | test:
//   test.setTimeout() (or test.slow() to triple it) | step: not applicable, no per-line override.
//GOLDEN RULE: an explicit assertion/action timeout only shortens/lengthens that one operation's own
//wait - it can never push execution past the overall Test Timeout; if the test clock hits 0 first,
//everything stops regardless of what any action/assertion timeout was set to.




test('@Web getBylabel explanation', async ({ page }) => {
    //getByLabel DEEP DIVE - why it worked for the password field in 'playwright special locators'
//above but students report it failing to type into edit boxes on other pages. getByLabel only
//resolves to an input when Playwright can prove an ASSOCIATION between the <label> and that input -
//there are exactly 2 HTML patterns that count as an association, everything else fails silently
//(locator resolves to 0 elements, .fill() then times out).
//
//1) WRAPPING: the <input> is physically nested inside the <label>...</label> tags
//      <label>Password <input type="password"/></label>
//   -> getByLabel('Password').fill(...) works, because the input IS the label's content.
//
//2) for/id LINKAGE: the <label> and <input> are siblings/separate, but the label's `for`
//   attribute matches the input's `id` attribute exactly
//      <label for="input-password1">Password</label> <input id="input-password1"/>
//   -> getByLabel('Password').fill(...) still works, because `for` <-> `id` is an explicit link.
//
//NEITHER applies (common real-world bug): label and input are separate AND for/id don't match
//      <label for="email">Email</label> <input id="user-email"/>
//   -> getByLabel('Email') matches nothing - `for="email"` has no input with id="email" to point
//   to, and `id="user-email"` is a different string, so Playwright can't link them. Same deal for
//   password (`for="password"` vs `id="user-password"`) and name fields with no `for` at all.
//
//GOTCHA: this is a developer/HTML authoring issue, not a Playwright bug - the fix on the test side
//isn't a different getByLabel syntax, it's to stop using getByLabel for that specific field and
//fall back to another locator instead. getByPlaceholder (if the input has one, e.g. "email@example.com")
//is the next best option before dropping down to a plain CSS/XPath locator by id/name.
//
//RECENT PLAYWRIGHT UPDATES: no change to this core wrapping/for-id association logic in recent
//releases. One nuance worth knowing (not covered above): getByLabel can ALSO match via
//aria-label/aria-labelledby attributes on the input itself, even with no <label> element at all -
//so "no visible <label> tag" doesn't automatically mean getByLabel is unusable, always check the
//input's own attributes too before falling back to getByPlaceholder/CSS.
})

