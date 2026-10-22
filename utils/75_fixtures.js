const base = require('@playwright/test');
const { request } = require('@playwright/test');
//reusing the SAME APIUtils class from the web+API mix lectures - the create-order logic doesn't change,
//only WHERE it is invoked from (a fixture now, instead of a test's before all block) changes.
//APIUtils.js does `module.exports = APIUtils` (the class itself, not a named export) - so it must be
//required WITHOUT destructuring; `const {APIUtils} = require(...)` gives you `undefined` here instead.
//path is relative to THIS file's own location (utils/), which already sits next to APIUtils.js - no
//need to climb back out with ../../utils/ the way a spec file under tests/sec-13/ would have to.
const APIUtils = require('./APIUtils.js');


const loginPayload = {userEmail: "mkrishnaveni1102@gmail.com", userPassword: "Qazmlp@1505"}
const orderPayload= {orders: [{country: "Cuba", productOrderedId: "6960eae1c941646b7a8b3ed3"}]}



//a single test.extend() call can define as many fixtures as you need, each separated by a comma - any
//spec file importing this customTest can mix and match which of these fixture names it destructures.
exports.customTest=base.test.extend({
    authenticatedPage: async ({browser}, use)=>{
        const context=await browser.newContext();
        const page=await context.newPage();

        await page.goto('https://rahulshettyacademy.com/client/')
        await page.locator('#userEmail').fill('mkrishnaveni1102@gmail.com')
        await page.locator('#userPassword').fill('Qazmlp@1505')
        await page.locator(`[type$='submit']`).click()
        await page.waitForLoadState('networkidle');
        await use(page);
    },
    //`{}` as the first param (instead of `{browser}`) means this fixture asks for NO other fixtures - it
    //only needs an API context, not a browser page, since creating an order here is a pure API call.
    createOrder:async({},use)=>{
        const apiContext= await request.newContext();
        const apiUtils=new APIUtils(apiContext,loginPayload)
        //this runs to completion (order created in the backend) BEFORE the test body starts - by the time
        //the test reaches the orders page, the order already exists, no separate before all needed.
        const response = await apiUtils.createOrder(orderPayload);
        //awaited for consistency with the authenticatedPage fixture above - use() itself has no teardown
        //code after it here, so this matters less, but it's good habit once a fixture does have cleanup.
        await use(response);
    }
})