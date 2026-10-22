const { test, expect } = require('@playwright/test');

//from 77/78 files - DEFAULT behavior recap: playwright ALWAYS runs different test FILES in parallel
//(one worker per file, up to the `workers` limit), but tests WITHIN one file run one after another,
//in declaration order, in the SAME worker - that's why these 3 tests used to execute sequentially
//even with multiple workers free. test.describe.configure({mode}) overrides that per-file/per-describe
//default. Modes: 'default' (sequential, as above), 'parallel' (each test gets its own worker, runs
//concurrently), 'serial' (sequential + inter-dependent - see below). Can also set `fullyParallel: true`
//in playwright.config.js to make EVERY file behave like mode:'parallel' project-wide, without needing
//this line in each spec file.

//uncomment to run these 3 tests in parallel - watch the HTML report/terminal open 3 worker processes
//instead of reusing 1. NOTE: parallel tests run in separate OS processes and can't share state/module-level
//variables (e.g. a `let page` declared outside test()) - each test gets a fully fresh page/context.
//test.describe.configure({mode:'parallel'})

//serial mode: still runs sequentially (like default), but ALSO marks these tests as inter-dependent -
//if any test in the group fails, every test AFTER it is skipped (not run at all), instead of continuing
//to execute independently. Useful when test 2 only makes sense if test 1 succeeded (e.g. test 2 needs
//the order-confirmation page that only test 1's checkout flow can reach) - avoids wasting time/resources
//chasing assertions that are guaranteed to fail anyway. Current docs recommend test.describe.configure()
//over the older test.describe.serial()/test.describe.parallel() wrapper functions seen in some tutorials -
//those are now DISCOURAGED (still work, but configure() is the single preferred API for all 3 modes).
//Also note: if `retries` is set (config-level or via test.describe.configure({retries: N}) itself), a
//serial group is retried AS A WHOLE from the first test, not just the one that failed.
test.describe.configure({mode:'serial'})

//first test in the serial chain - must pass for 'partial screenshot demo' below to even attempt running.
test('@Web complete screenshot demo', async ({ page }) => {
    await page.goto('https://rahulshettyacademy.com/AutomationPractice/');
    await expect(page.locator('#displayed-text')).toBeVisible();
    await page.locator('#hide-textbox').click();
    await page.screenshot({ path: 'screenshot.png' });
    await expect(page.locator('#displayed-text')).toBeHidden();
})



//second test - if THIS fails (e.g. the hide-textbox id changes), 'visual comparison demo' below gets
//skipped entirely (shown as "skipped" in the report, not "failed") because of the serial mode above.
test('@Web partial screenshot demo', async ({ page }) => {
    await page.goto('https://rahulshettyacademy.com/AutomationPractice/');
    await expect(page.locator('#displayed-text')).toBeVisible();
    await page.locator('#displayed-text').screenshot({ path: 'partial-screenshot.png' });
    await page.locator('#hide-textbox').click();
    await expect(page.locator('#displayed-text')).toBeHidden();
})



test('@Web visual comparison demo', async ({ page }) => {
    await page.goto('https://www.google.com/')
    expect(await page.screenshot()).toMatchSnapshot('baseline-screenshot.png');
});

//Recent Playwright docs updates worth knowing (current as of this writing):
//1. test.describe.serial()/test.describe.parallel() (and their .only variants) are now explicitly
//   marked DISCOURAGED in the docs - test.describe.configure({mode}) is the one recommended API going
//   forward for all three modes (default/parallel/serial), same as used above.
//2. test.describe.configure() now also accepts `retries` and `timeout` directly, e.g.
//   test.describe.configure({ retries: 2, timeout: 20_000 }) - lets you override config-level retries/
//   timeout for just this file/group instead of touching playwright.config.js globally.
//3. New "test locks" feature (`lock` option on test()/test.describe()/test.describe.configure()) lets
//   you name a shared resource (e.g. lock: 'user-settings') so that any tests sharing that lock name
//   never run concurrently - even across different files/projects/workers - while every other test still
//   runs fully in parallel. Useful alternative to serial mode when only ONE shared resource needs
//   protecting, not the whole test's ordering/dependency chain.