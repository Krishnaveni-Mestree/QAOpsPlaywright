const { test, expect } = require('@playwright/test');

//Login UI->.json
//test browser->.json,cart->order,orderdetails,orderhistory


// INTERVIEW TOPIC: "Session/Auth reuse in Playwright" (a.k.a. storageState injection)
// WHY THIS EXISTS: logging in via UI (filling email/password, clicking submit) for EVERY test
// is slow and repeats the same work N times. Some apps also store MANY cookies/localStorage
// keys on login (banking/finance apps especially) — manually recreating each one with
// `page.addInitScript`/`context.addCookies` one-by-one would be tedious and fragile.
// SOLUTION: log in once via the real UI, capture the browser context's ENTIRE auth state
// (cookies + localStorage + sessionStorage) via `context.storageState()`, persist it to a
// JSON file, then inject that same JSON into fresh browser contexts for every other test.
// Those new contexts are "pre-authenticated" the moment they're created — no login step needed.
// CONTRAST WITH THE OTHER APPROACH (part 1 / 61-64 in this course): calling the login API
// directly and injecting just the token into localStorage. That's faster/simpler when the app
// only needs 1-2 values. This storageState approach is the better fit when auth state is complex
// (many cookies/keys) since Playwright captures/replays everything for you automatically.
// MODERN/OFFICIAL PATTERN (as of recent Playwright versions, not shown in this older lecture):
// Playwright now recommends doing this via a dedicated "setup project" instead of per-file
// `beforeAll` hooks — see https://playwright.dev/docs/auth. In playwright.config.ts you define:
//   projects: [
//     { name: 'setup', testMatch: /.*\.setup\.ts/ },
//     { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' }, dependencies: ['setup'] }
//   ]
// The setup project's `*.setup.ts` file logs in once and calls `page.context().storageState({ path: ... })`,
// then EVERY test file in dependent projects automatically starts pre-authenticated (no manual
// webContext/beforeAll plumbing per spec file like below). This scales better across many spec files
// and supports multiple auth states (e.g. admin.json vs user.json) via multiple setup projects.
// SECURITY NOTE: storageState.json contains live session cookies/tokens — never commit it to git
// (added to .gitignore) and treat it like a credential/secret in CI (short-lived, scoped per run).

let webContext;
    

test.beforeAll(async ({ browser }) => {
    // Use a throwaway context just for the one-time login — we don't reuse `context`/`page` after this.
    const context = await browser.newContext();
    const page = await context.newPage();

    const userName='mkrishnaveni1102@gmail.com'
    const password='Qazmlp@1505'

    await page.goto('https://rahulshettyacademy.com/client/')
    await page.locator('#userEmail').fill(userName)
    await page.locator('#userPassword').fill(password)
    await page.locator(`[type$='submit']`).click()
    await page.waitForLoadState('networkidle');

    // storageState() must be called on the CONTEXT, not the page — cookies/storage belong to
    // the whole browser context (shared across all its tabs/pages), not an individual page/tab.
    await context.storageState({ path: 'storageState.json' });
    // Create a SEPARATE long-lived context, seeded with the captured auth state, for every test
    // in this file to create pages from — this is the "pre-authenticated" context other tests reuse.
    webContext=await browser.newContext({storageState: 'storageState.json'});

});

test('@Web playwright test - injecting session storage', async ({})=>{
    // No fixture-provided `page` here — we deliberately create our own page from `webContext`
    // (seeded with the saved auth state) instead of the default fixture's fresh/unauthenticated page.
    const page=await webContext.newPage();
    await page.goto('https://rahulshettyacademy.com/client/')

    const products=page.locator('.card-body ')
    const productName='ZARA COAT 3'

    
    const cardTitles=page.locator('.card-body b')

    await page.waitForLoadState('networkidle');
    await cardTitles.first().waitFor()

    const allCardTitles=await cardTitles.allTextContents()
    console.log(allCardTitles)

    const count=await products.count()
    for(let i=0;i<count;++i){
        if(await products.nth(i).locator('b').textContent()===productName){
            await products.nth(i).locator(`text= Add To Cart`).click()
            break;
        }
    }
    await page.locator(`[routerlink*='cart']`).click()
    await page.locator('div li').first().waitFor()
    const isItemInCart = await page.locator(`h3:has-text('${productName}')`).isVisible();
    await expect(isItemInCart).toBeTruthy();

    await page.locator(`text=Checkout`).click()
    const dropdown=page.locator(`[placeholder*='Country']`)
    await dropdown.pressSequentially('ind', { delay: 150 });
    const countryOptionsDropdown = page.locator('.ta-results')
    await countryOptionsDropdown.locator('button').first().waitFor()
    const optionsCount=await countryOptionsDropdown.locator('button').count()
    for(let i=0;i<optionsCount;++i){
        const text=await countryOptionsDropdown.locator('button').nth(i).textContent()
        if(text.trim().endsWith('India')){
            await countryOptionsDropdown.locator('button').nth(i).click({ force: true })
            break;
        }
    }
    await countryOptionsDropdown.waitFor({ state: 'hidden' })

    //await expect(page.locator(`.user__name [type='text']`).first()).toHaveValue(userName);
    await page.locator('.action__submit').click()

    await expect(page.locator('.hero-primary')).toHaveText(' Thankyou for the order. ')
    const orderID= await page.locator('.em-spacer-1 .ng-star-inserted').textContent()
    console.log(orderID)

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


test('@Web test- to display product titles', async ({}) => {
    // Same webContext reused again — this test never logs in itself; it inherits the auth state
    // captured once in beforeAll. This is the actual time-saving payoff of the pattern: N tests,
    // 1 login. Benefit grows with more tests/spec files sharing the same webContext/auth state.
    const page=await webContext.newPage();
    await page.goto('https://rahulshettyacademy.com/client/')

    const cardTitles=page.locator('.card-body b')

    await page.waitForLoadState('networkidle');
    await cardTitles.first().waitFor()

    const allCardTitles=await cardTitles.allTextContents()
    console.log(allCardTitles)
})