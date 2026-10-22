const { test, expect , request } = require('@playwright/test');
const APIUtils = require('../../utils/APIUtils');


const loginPayload = {userEmail: "mkrishnaveni1102@gmail.com", userPassword: "Qazmlp@1505"}
const orderPayload= {orders: [{country: "Cuba", productOrderedId: "6960eae1c941646b7a8b3ed3"}]}


let response;

test.beforeAll(async ()=>{
    const apiContext= await request.newContext();
    const apiUtils=new APIUtils(apiContext,loginPayload)
    response = await apiUtils.createOrder(orderPayload);

})


test('@Web @api placing order -Refactoring2', async ({ page })=>{
    
    page.addInitScript((val)=>{
        window.localStorage.setItem('token', val);
    }, response.token);

    await page.goto('https://rahulshettyacademy.com/client/')
    

    await page.locator("button[routerlink*='myorders']").click();
    await page.locator("tbody").waitFor();
    const rows = await page.locator("tbody tr");

    for (let i = 0; i < await rows.count(); ++i) {
        const rowOrderId = await rows.nth(i).locator("th").textContent();
        if (response.orderID.includes(rowOrderId)) {
            await rows.nth(i).locator("button").first().click();
            break;
        }
    }
    const orderIdDetails = await page.locator(".col-text").textContent();
    await page.pause()
    expect(orderID.includes(orderIdDetails)).toBeTruthy();


})

