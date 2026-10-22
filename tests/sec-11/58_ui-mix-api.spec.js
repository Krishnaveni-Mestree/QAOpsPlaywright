const { test, expect , request } = require('@playwright/test');


const loginPayload = {userEmail: "mkrishnaveni1102@gmail.com", userPassword: "Qazmlp@1505"}
let token;
test.beforeAll(async ()=>{
    const apiContext= await request.newContext();
    const loginResponse = await apiContext.post('https://rahulshettyacademy.com/api/ecom/auth/login',{
        data: loginPayload
    })
    expect(loginResponse.ok()).toBeTruthy();
    const loginResponseJson = await loginResponse.json();
    token = loginResponseJson.token;
    console.log(token);
})

test('@Web @api place the order', async ({ page })=>{
    const products=page.locator('.card-body ')
    const productName='ZARA COAT 3'

    page.addInitScript((val)=>{
        window.localStorage.setItem('token', val);
    }, token);

    await page.goto('https://rahulshettyacademy.com/client/')
    
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

    // await expect(page.locator(`.user__name [type='text']`).first()).toHaveText(userName);
    
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




//SECTION 11 (continued) - RECAP + NEXT GOAL: using APIs to create TEST DATA, not just to skip login.
//Like file 55, this is pure notes on the CONCEPT - the actual "create order via API" implementation
//is built in the next lecture's spec file, which is why there's no test() below yet.

//1) RECAP: THE LOGIN-BYPASS TRICK ISN'T UNIVERSAL
//   - 57_passing-token.spec.js/58_ui-mix-api.spec.js injected the token into localStorage because
//     THIS app's developer happens to store auth there - that's an implementation detail, not a
//     Playwright rule.
//   - Other apps store the same kind of session proof in sessionStorage (same idea, swap
//     window.localStorage.setItem(...) for window.sessionStorage.setItem(...) inside addInitScript),
//     or in cookies (handled differently - via context.addCookies(), not addInitScript at all -
//     covered in a later lecture).
//   - LESSON: there's no single universal way to "inject a logged-in session" - always check (ask the
//     developer, or inspect DevTools -> Application tab yourself) WHERE this specific app keeps its
//     session proof before trying to replicate the bypass trick on a new app.

//2) THE BIGGER IDEA: PRECONDITION DATA SETUP VIA API, NOT JUST AUTH
//   - Ask what the test is actually trying to verify. e.g. "an order I already placed shows up
//     correctly in the order-history page" - the REAL assertion only concerns the history page.
//   - Driving the full UI flow (open cart -> checkout -> fill country -> place order) just to GET an
//     order to look at is pure precondition setup, not the thing under test - and it's slow/flaky
//     (page loads, autocomplete timing, overlay z-index issues, etc. - see 56_WebApiPart1.spec.js's
//     many workarounds for exactly these UI quirks).
//   - If the backend exposes an API to create an order directly, call THAT instead, grab the returned
//     order id, and jump straight to the order-history page - skips every fragile UI step that isn't
//     actually part of what this test is verifying.

//3) HOW TO DISCOVER the create-order API (no special tooling - just DevTools)
//   - Open DevTools Network tab BEFORE performing the real action (here: clicking "Place Order").
//   - Perform the action once manually, then scan the network log for the matching XHR/fetch call -
//     its request payload, URL, and method (POST here) are all visible directly, no documentation
//     needed, same approach already used to find the login API in file 55/56.

//4) NEW WRINKLE VS. THE LOGIN CALL: THIS ONE NEEDS AN AUTHORIZATION HEADER
//   - The login call needed no headers (anyone can attempt to log in) - but create-order must be tied
//     to a SPECIFIC logged-in user, or any order would get created against a random/no account.
//   - The app does this by sending the token from the login response back as a request HEADER (key
//     'authorization', value = the raw token string) - inspect the failed/succeeded request's Headers
//     tab in DevTools to see the exact header name this backend expects.
//   - In Playwright, this means the create-order apiContext.post(url, { data, headers }) call needs a
//     SECOND option alongside data: `headers: { authorization: token }` - same request() API as
//     before, just with one more field populated (headers were skipped entirely for login because
//     that call didn't need any).

//5) WHAT YOU GET BACK
//   - The create-order response's JSON body already contains the new order's id directly - no need to
//     scrape it off a confirmation page afterward (compare to orderID via .textContent() in
//     56_WebApiPart1.spec.js) - one less fragile UI read.

//NEXT LECTURE: implement the create-order API call - build the order payload (country + product id,
//discovered the same way as loginPayload), send it with the authorization header carrying the token
//from beforeAll, extract the new order id from the JSON response, then navigate straight to the order
//history page to verify it - skipping cart/checkout/country-autocomplete/place-order entirely.
