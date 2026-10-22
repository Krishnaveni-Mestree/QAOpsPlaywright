const { test, expect, request } = require('@playwright/test');
const APIUtils = require('../../utils/APIUtils');

// INTERVIEW TOPIC: "Trace Viewer for inspecting API request/response without manual logging"
// PROBLEM (continuing from 66_api-debugging.spec.js): stepping through code in a live debugger
// is great for investigating failures interactively, but you don't want to re-run a debug session
// every time just to answer "what exact payload did we send, and what did the server send back?"
// - especially for stuff that already ran and finished (passed or failed) in a normal/CI run.
// Logging everything manually with console.log (as earlier lectures did for token/response) doesn't
// scale and isn't searchable/structured.
//
// SOLUTION: Playwright's trace (playwright.config.js -> use.trace) already records this for you -
// every `request`/`apiContext` call (URL, method, headers, payload, response body/headers/status)
// shows up in the trace viewer's Network tab, with zero extra logging code required.
//
// `trace: 'on'` below OVERRIDES the project-level `trace: 'retain-on-failure'` set in
// playwright.config.js, but ONLY for tests in this file - this is the per-file equivalent of what
// the lecture does by hand-editing the config to 'on' and back to 'retain-on-failure' afterwards.
// Useful while you're specifically demoing/learning trace viewer; for everyday suites, keep the
// project-level 'retain-on-failure' (full trace on every passing test wastes disk at scale).
test.use({ trace: 'on' });  //we can keep this in the #playwright.config.js to enable trace for all tests by default

const loginPayload = { userEmail: "mkrishnaveni1102@gmail.com", userPassword: "Qazmlp@1505" }
const orderPayload = { orders: [{ country: "Cuba", productOrderedId: "6960eae1c941646b7a8b3ed3" }] }

let token;
let orderID;

test.beforeAll(async () => {
    // Playwright records a SEPARATE trace for beforeAll/beforeEach hooks (shows as its own node,
    // e.g. "Before Hooks", in test-results/.../trace.zip) distinct from the test body's trace -
    // this is the one that actually contains the login + create-order API calls below, since
    // that's where they run.
    const apiContext = await request.newContext();
    const apiUtils = new APIUtils(apiContext, loginPayload);
    token = await apiUtils.getToken();
    orderID = await apiUtils.createOrder(orderPayload);
});

test('@Web @api placing order - trace viewer demo', async ({ page }) => {
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

// HOW TO OPEN THE TRACE AFTER RUNNING THIS FILE:
//   npx playwright show-trace test-results/<folder-for-this-test>/trace.zip
// Inside the viewer, the "Before Hooks" step in the left Actions panel is the one to click to see
// the login POST and create-order POST calls - expand the "API Requests"/Network tab for each to see
// request URL, method, headers, payload, and the full JSON response body/status - exactly what we
// used to console.log by hand.
//
// MODERN ALTERNATIVES (not in the original lecture, worth knowing for interviews):
// - `npx playwright test --trace on` - CLI flag to force tracing for a single run without editing
//   playwright.config.js or any spec file at all.
// - https://trace.playwright.dev - drag-and-drop a trace.zip in the browser, no CLI needed; useful
//   for sharing a trace with a teammate who doesn't have the repo checked out.
// - Playwright Test extension for VS Code: after a test run, the Testing sidebar shows a "Show
//   trace" icon per test result that opens the trace viewer in-editor directly - no manual path
//   lookup/CLI command needed.
// - HTML report (`reporter: 'html'`, already configured in playwright.config.js) embeds a link to
//   open the trace straight from a failed test's report entry via `npx playwright show-report`.
