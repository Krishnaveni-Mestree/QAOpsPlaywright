const { test, expect , request } = require('@playwright/test');

//plain JS object (no quotes needed on keys) holding the exact JSON body the login endpoint expects -
//captured straight from DevTools Network tab's request payload for the real login call.
const loginPayload = {userEmail: "mkrishnaveni1102@gmail.com", userPassword: "Qazmlp@1505"}

//beforeAll runs ONCE before every test in this file (vs beforeEach, which reruns before EACH test) -
//since logging in via API gives the same token regardless of which test needs it, there's no reason
//to repeat the API call per test; one call here is shared by the whole file.
test.beforeAll(async ()=>{
    //`request` is Playwright's dedicated API-testing fixture (separate from `browser`/`page`) -
    //newContext() here is the API equivalent of browser.newContext(): an isolated session you can
    //pass baseURL/headers/proxy/credentials options to (none needed yet for this plain login call).
    const apiContext= await request.newContext();
    //apiContext.post(url, { data }) sends the JSON body as the request payload - no real browser/page
    //involved at all, so there's no page load, no typing, no click - just a direct HTTP call.
    const loginResponse = await apiContext.post('https://rahulshettyacademy.com/api/ecom/auth/login',{
        data: loginPayload
    })
    //.ok() is true for any 2xx status code - asserting this BEFORE reading the body catches a failed
    //login (wrong credentials/down API) immediately, instead of getting a confusing crash later when
    //.json() turns out not to contain a token at all.
    expect(loginResponse.ok()).toBeTruthy();
    //.json() parses the response body as JSON - this is the API equivalent of textContent()/innerText
    //on a UI locator, just reading structured data instead of rendered text.
    const loginResponseJsonBody = await loginResponse.json();
    //token is the one piece of this response we actually need - next lecture injects this into the
    //browser's localStorage (same 'token' key DevTools showed) so the UI login steps below can be
    //skipped entirely for every other test in the file.
    const token = loginResponseJsonBody.token;
})







test('@Web @api playwright test - client app e2e', async ({ page })=>{

    const products=page.locator('.card-body ')
    const productName='ZARA COAT 3'

    const userName = 'mkrishnaveni1102@gmail.com'
    const password='Qazmlp@1505'
    await page.goto('https://rahulshettyacademy.com/client/')
    await page.locator('#userEmail').fill(userName)
    await page.locator('#userPassword').fill(password)
    await page.locator(`[type$='submit']`).click()

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

    await expect(page.locator(`.user__name [type='text']`).first()).toHaveText(userName);
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