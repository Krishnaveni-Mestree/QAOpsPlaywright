//imported as `base` (not `test`) on purpose - this IS the original playwright test object, and we are
//about to build a CUSTOMIZED version on top of it without losing access to the original.
const base = require('@playwright/test');

//by default, base.test only understands playwright's built-in fixtures (page, browser, context) - it has
//no idea what "authenticatedPage" means. base.test.extend({...}) is what teaches a NEW test object about
//extra, custom fixtures - the result is stored in `customTest`, which is what spec files must import and
//use instead of the plain `test` if they want to use `authenticatedPage`.
//`authenticatedPage` here is just a fixture NAME (like a method name) we're inventing - its value is
//whatever this whole async function body produces via `use(...)` below.
exports.customTest=base.test.extend({authenticatedPage: async ({browser}, use)=>{
    const context=await browser.newContext();
    const page=await context.newPage();

    //all the login steps a test would normally repeat are done ONCE here, inside the fixture itself -
    //any spec file using `authenticatedPage` skips writing this block entirely.
    await page.goto('https://rahulshettyacademy.com/client/')
    await page.locator('#userEmail').fill('mkrishnaveni1102@gmail.com')
    await page.locator('#userPassword').fill('Qazmlp@1505')
    await page.locator(`[type$='submit']`).click()
    await page.waitForLoadState('networkidle');
    //`use(page)` is what actually hands this already-logged-in `page` object back to whichever test asked
    //for `authenticatedPage` - playwright runs this ENTIRE fixture function to completion first (so login
    //finishes) before the test body itself is allowed to run, and whatever is passed into use() becomes
    //the value the test receives under the `authenticatedPage` parameter name.
    await use(page);
}})