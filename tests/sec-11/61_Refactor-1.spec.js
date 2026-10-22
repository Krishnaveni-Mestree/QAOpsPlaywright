const { test, expect , request } = require('@playwright/test');
//imported directly as the class itself (not destructured) - matches APIUtils.js's `module.exports = APIUtils`.
const APIUtils = require('../../utils/APIUtils');


const loginPayload = {userEmail: "mkrishnaveni1102@gmail.com", userPassword: "Qazmlp@1505"}
const orderPayload= {orders: [{country: "Cuba", productOrderedId: "6960eae1c941646b7a8b3ed3"}]}


let token;
let orderID;

//compare this to 59_api-ui-mix.spec.js's beforeAll - the login/create-order API calls are now hidden
//behind apiUtils.getToken()/.createOrder(), so this test file no longer needs to know the actual
//endpoint URLs, headers, or response JSON shape at all.
test.beforeAll(async ()=>{
    const apiContext= await request.newContext();
    const apiUtils=new APIUtils(apiContext,loginPayload)
    token = await apiUtils.getToken();
    orderID = await apiUtils.createOrder(orderPayload);

})


// test('place the order', async ({ page })=>{
  
//     page.addInitScript((val)=>{
//         window.localStorage.setItem('token', val);
//     }, token);

//     await page.goto('https://rahulshettyacademy.com/client/')
    

//     await page.locator("button[routerlink*='myorders']").click();
//     await page.locator("tbody").waitFor();
//     const rows = await page.locator("tbody tr");

//     for (let i = 0; i < await rows.count(); ++i) {
//         const rowOrderId = await rows.nth(i).locator("th").textContent();
//         if (orderID.includes(rowOrderId)) {
//             await rows.nth(i).locator("button").first().click();
//             break;
//         }
//     }
//     const orderIdDetails = await page.locator(".col-text").textContent();
//     await page.pause()
//     expect(orderID.includes(orderIdDetails)).toBeTruthy();


// })



test('@Web @api placing order -Refactoring', async ({ page })=>{
    //this test builds its OWN apiContext/apiUtils/order instead of reusing beforeAll's - each test
    //placing a genuinely separate order this way is what the "one more refactor" note in APIUtils.js
    //is about (avoiding a fresh login/order per test when one shared setup would do).
    const apiContext = await request.newContext();
    const apiUtils=new APIUtils(apiContext,loginPayload)
    const orderID = await apiUtils.createOrder(orderPayload);

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
    await page.pause()
    expect(orderID.includes(orderIdDetails)).toBeTruthy();


})

