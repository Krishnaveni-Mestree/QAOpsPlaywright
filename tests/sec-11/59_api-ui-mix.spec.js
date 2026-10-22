const { test, expect , request } = require('@playwright/test');

//product id is just the Mongo id visible in the "view product" page's own URL - no special tooling
//needed to find it, same DevTools-first approach used to find every API call in this section.
const loginPayload = {userEmail: "mkrishnaveni1102@gmail.com", userPassword: "Qazmlp@1505"}
const orderPayload= {orders: [{country: "Cuba", productOrderedId: "6960eae1c941646b7a8b3ed3"}]}

//declared with `let` (not `const`) and left UNINITIALIZED here - `const` requires a value at the
//declaration itself, but these only get their real value later inside beforeAll.
let token;
let orderID;

test.beforeAll(async ()=>{
    const apiContext= await request.newContext();
    const loginResponse = await apiContext.post('https://rahulshettyacademy.com/api/ecom/auth/login',{
        data: loginPayload
    })
    expect(loginResponse.ok()).toBeTruthy();
    const loginResponseJson = await loginResponse.json();
    token = loginResponseJson.token;
    console.log(token);

    //NEW VS. LOGIN CALL: create-order must be tied to THIS logged-in user, so (unlike login) it needs
    //an 'Authorization' header carrying the token just obtained above - otherwise the backend has no
    //way to know which account's order history this order belongs to. content-Type is set explicitly
    //as a defensive habit - this API defaults to JSON anyway, but not every API does.
    const orderResponse=await apiContext.post('https://rahulshettyacademy.com/api/ecom/order/create-order',{
        data: orderPayload,
        headers:{
            'Authorization' : token,
            'content-Type' : 'application/json'
        }
    })
    expect(orderResponse.ok()).toBeTruthy();
    const orderResponseJson=await orderResponse.json();
    console.log(orderResponseJson);
    //the response's own `orders` array already contains the new order's id directly - no need to
    //scrape a confirmation-page element for it like the pure-UI flow in 56_WebApiPart1.spec.js did.
    orderID=orderResponseJson.orders[0];
    console.log(orderID);

})

test('@Web @api place the order', async ({ page })=>{
    //unused now that adding-to-cart/checkout is gone - both order creation AND login happen via API
    //above, so the only UI work left is navigating straight to order history and verifying the order.
    const products=page.locator('.card-body ')
    const productName='ZARA COAT 3'

    page.addInitScript((val)=>{
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
    //manual checkpoint left in to visually confirm the API-created order (country, id) actually
    //landed on this details page before trusting the assertion below - remove before CI/headless runs.
    await page.pause()
    expect(orderID.includes(orderIdDetails)).toBeTruthy();


})