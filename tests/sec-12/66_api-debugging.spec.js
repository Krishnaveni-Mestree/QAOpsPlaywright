const { test, expect, request } = require('@playwright/test');
const APIUtils = require('../../utils/APIUtils');

// INTERVIEW TOPIC: "Debugging a mixed API + UI test in Playwright"
// PROBLEM: `npx playwright test --debug` (Playwright Inspector) only steps through actions that
// touch a `page` (click/fill/goto/etc). Any pure-API code that runs BEFORE the page is involved
// (e.g. everything inside `test.beforeAll` below - login call, create-order call) is NOT pausable
// with `--debug` - Playwright Inspector silently runs straight through it and only starts pausing
// once control reaches the first `page.*` call inside the `test(...)` body.
// So if an API call returns a wrong/unexpected response (e.g. order creation fails because of a
// bad payload), you can't see that live with `--debug` alone - you need a real step-by-step
// debugger that understands plain JS/Node, not just browser actions.
//
// FIX: debug this file as a normal Node/VS Code debug session instead of via Playwright Inspector:
//   1) Add a script in package.json: "scripts": { "test": "playwright test" }  (done in this repo).
//   2) In VS Code: Cmd+Shift+P (Mac) / Ctrl+Shift+P (Win) -> "Debug npm script" -> pick "test".
//   3) Set breakpoints anywhere, including inside beforeAll/APIUtils.getToken()/createOrder() -
//      VS Code will actually stop there since it's debugging the whole Node process, not just the
//      browser-driven parts the way Playwright Inspector does.
//   4) While paused, hover any variable (response, token, orderID) to inspect its live value -
//      this is how you confirm whether the API actually returned what the test expected.
//   5) IMPORTANT: while you sit on a breakpoint, the test clock keeps running - bump timeouts in
//      playwright.config.js (e.g. timeout: 100 * 1000) for the duration of a debugging session so
//      the 30/40s default doesn't fail the test out from under you mid-step.
//
// MODERN ALTERNATIVES (not in the original lecture, worth knowing for interviews):
// - Playwright Test extension for VS Code (ms-playwright.playwright) adds a Run/Debug icon
//   directly next to every `test(...)` in the editor gutter and in the Testing sidebar - this is
//   now the easiest way to debug a single test with real breakpoints, no manual "Debug npm script"
//   step needed, and it also supports picking locators and recording new steps.
// - `PWDEBUG=1 npx playwright test` is the env-var equivalent of `--debug` (same Inspector,
//   same limitation: UI actions only, API-only code before the first `page.*` call still isn't
//   stepped through).
// - Trace Viewer (`npx playwright show-trace trace.zip` or https://trace.playwright.dev) is the
//   modern answer to "I don't want to console.log every request/response" mentioned at the end of
//   this lecture - with `trace: 'on'` (or 'retain-on-failure') in playwright.config.js, every API
//   call made through Playwright's `request` fixture shows up in the trace's Network tab with full
//   request/response headers and bodies, no manual logging needed.

const loginPayload = { userEmail: "mkrishnaveni1102@gmail.com", userPassword: "Qazmlp@1505" }
const orderPayload = { orders: [{ country: "Cuba", productOrderedId: "6960eae1c941646b7a8b3ed3" }] }

let token;
let orderID;

test.beforeAll(async () => {
    // Set a breakpoint on any line below and debug via "Debug npm script" (not `--debug`) to
    // actually pause here - Playwright Inspector would skip straight past this whole hook.
    const apiContext = await request.newContext();
    const apiUtils = new APIUtils(apiContext, loginPayload);
    token = await apiUtils.getToken();
    orderID = await apiUtils.createOrder(orderPayload);
});

test('@Web @api placing order - api+web debugging demo', async ({ page }) => {
    // Everything from here on IS steppable with `--debug` too, since it's all `page.*` calls -
    // only the API setup above needed the VS Code/Node debugger instead.
    page.addInitScript((val) => {
        window.localStorage.setItem('token', val);
    }, token);

    await page.goto('https://rahulshettyacademy.com/client/')

    await page.locator("button[routerlink*='myorders']").click();
    await page.locator("tbody").waitFor();
    const rows = await page.locator("tbody tr");

    for (let i = 0; i < await rows.count(); ++i) {
        const rowOrderId = await rows.nth(i).locator("th").textContent();
        if (orderID.includes(rowOrderId)) {
            await rows.nth(i).locator("button").first().click();
            break;
        }
    }
    const orderIdDetails = await page.locator(".col-text").textContent();
    expect(orderID.includes(orderIdDetails)).toBeTruthy();
})
