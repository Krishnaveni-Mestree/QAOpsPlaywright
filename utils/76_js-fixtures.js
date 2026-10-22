const base = require('@playwright/test');
const { request } = require('@playwright/test');
const APIUtils = require('./APIUtils.js');


const loginPayload = {userEmail: "mkrishnaveni1102@gmail.com", userPassword: "Qazmlp@1505"}
const orderPayload= {orders: [{country: "Cuba", productOrderedId: "6960eae1c941646b7a8b3ed3"}]}




exports.customTest=base.test.extend({
    //ui browser fixture
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
    //api custom fixture
    createOrder:async({},use)=>{
        //setup
        const apiContext= await request.newContext();
        const apiUtils=new APIUtils(apiContext,loginPayload)
        const response = await apiUtils.createOrder(orderPayload);
        //use() is the dividing line: everything ABOVE it is setup (runs before the test), everything
        //BELOW it is teardown (runs after the test finishes) - no separate afterAll/afterEach needed.
        await use(response);
        //tear down
        //dispose() releases the API request context (sockets/connections) once the test is done, same
        //idea as closing a browser context - prevents these resources from leaking across test runs.
        await apiContext.dispose();
    },

    //data driven fixture
    //a fixture value doesn't have to be a function - a plain object works too, playwright just hands it
    //straight to the test with no setup/teardown lifecycle, purely for supplying reusable test data.
    testDataForOrder:{
        productName:"ADIDAS ORIGNAL"
    }
})