const { test, expect , request } = require('@playwright/test');

//SECURITY TEST: simulates a hacker tweaking the "view order" GET call's id param to an order that does
//NOT belong to the logged-in account - the app must reject it with an "unauthorized" message instead of
//leaking someone else's order details (classic IDOR / broken object-level authorization vulnerability).
test('@Web @QW security test request inetercept',async({ page })=>{
    //login
    const userName = 'mkrishnaveni1102@gmail.com'
    const password='Qazmlp@1505'
    await page.goto('https://rahulshettyacademy.com/client/')
    await page.locator('#userEmail').fill(userName)
    await page.locator('#userPassword').fill(password)
    await page.locator(`[type$='submit']`).click()

    await page.locator("button[routerlink*='myorders']").click();

    //page.route() must be registered BEFORE the "View" click below - Playwright can only intercept a
    //network call if it was already watching for that URL pattern when the call fires. The trailing *
    //wildcard matches any order id, so this isn't hardcoded to one specific order on the page.
    await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=*",async route=>{
        //route.continue() = REQUEST interception (unlike route.fulfill() used in the previous lecture,
        //which fakes the RESPONSE after the server already answered). Here we rewrite the outgoing
        //request's URL itself, before it ever reaches the server, swapping in an id that belongs to a
        //completely different account - exactly what a hacker tampering with the request would do.
        await route.continue({url: "https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=621661f884b053f6765465b6"})
    })
    //`.first()` because the orders page lists multiple "View" buttons (one per order) - we don't care
    //which one we click since our intercept rewrites the request to a foreign order id regardless.
    await page.locator(`button:has-text('View')`).first().click();
    //  await page.pause();
    //if the app is secure, the server must reject this foreign order id and show this message instead
    //of rendering someone else's order details - that rejection is the actual thing under test here.
    await expect(page.locator('p').last()).toHaveText('You are not authorize to view this order')
     
})