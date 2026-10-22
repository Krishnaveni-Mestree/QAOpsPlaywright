const { test, expect } = require('@playwright/test');
const {customTest} = require('../../utils/76_js-fixtures.js');

//destructuring a third fixture (testDataForOrder) alongside the other two - any number of fixtures can
//be mixed into one test, playwright resolves each by matching this name back to test.extend()'s config.
customTest('@Web @api fixtures demo', async({authenticatedPage,createOrder,testDataForOrder})=>{
    await authenticatedPage.goto('https://rahulshettyacademy.com/client/')
    await authenticatedPage.locator("button[routerlink*='myorders']").click();
    await authenticatedPage.locator("tbody").waitFor();
    await expect(authenticatedPage.getByText(createOrder.orderID)).toBeVisible();
    //testDataForOrder is just the plain object from the fixture - no setup ran for it, it's purely
    //data-driven test input supplied externally instead of being hardcoded inline in this test.
    console.log(testDataForOrder.productName);
})