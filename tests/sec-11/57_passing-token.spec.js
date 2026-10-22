const { test, expect , request } = require('@playwright/test');


const loginPayload = {userEmail: "mkrishnaveni1102@gmail.com", userPassword: "Qazmlp@1505"}
//declared OUTSIDE beforeAll (not with const inside it) so every test() in this file can read the
//same token - a variable declared inside beforeAll would be scoped to that function only.
let token;
test.beforeAll(async ()=>{
    const apiContext= await request.newContext();
    //AWAIT IS MANDATORY even though this is "just an API call, not a UI action" - skipping it here
    //would let the next line try to read .json() on a pending Promise instead of the real response.
    const loginResponse = await apiContext.post('https://rahulshettyacademy.com/api/ecom/auth/login',{
        data: loginPayload
    })
    expect(loginResponse.ok()).toBeTruthy();
    //the response object exposes more than just .json() - .status()/.headers()/.body()/.url() are
    //all available too (same idea as a page locator exposing many methods), useful for deeper
    //assertions (e.g. expect(loginResponse.status()).toBe(200)) beyond just reading the payload.
    const loginResponseJson = await loginResponse.json();
    token = loginResponseJson.token;
    console.log(token);
})

test('@Web @api place the order', async ({ page })=>{
    const products=page.locator('.card-body ')
    const productName='ZARA COAT 3'

    //addInitScript injects this function into the page BEFORE any of the site's own JS runs on
    //navigation - necessary because the app reads its auth token from localStorage on page load,
    //so the token must already be there by the time goto() below resolves, not set afterward.
    //the 2nd argument (token) is passed into the function as its `val` parameter at runtime - this is
    //how a value from Node.js reaches code that actually executes inside the browser's JS context.
    page.addInitScript((val)=>{
        window.localStorage.setItem('token', val);
    }, token);

    //BYPASSED LOGIN: hitting the SAME /client URL that used to land on the login screen now goes
    //straight to the dashboard, because the app finds a valid token in localStorage already -
    //no #userEmail/#userPassword/.click() steps needed anymore (compare to 56_WebApiPart1.spec.js).
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

    //commented out because `userName` no longer exists - it was only ever set by the now-removed
    //UI login steps; re-enable by reading the email back out of loginPayload instead, if needed.
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