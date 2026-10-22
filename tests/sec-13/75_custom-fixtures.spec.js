const { test, expect } = require('@playwright/test');

//must import from 75_fixtures (not 74_fixtures) - 74_fixtures.js only defines authenticatedPage, it has
//no createOrder fixture, so destructuring createOrder below would be undefined with the wrong import.
const {customTest} = require('../../utils/75_fixtures');

//destructuring BOTH fixture names here is what tells playwright to run BOTH fixtures first - login and
//order-creation both complete before this test body executes, in just one line of setup per fixture.
customTest('@Web @api fixtures demo', async({authenticatedPage,createOrder})=>{
    //authenticatedPage dot, not plain page dot - this page object came from the fixture's own browser
    //context, already logged in, so this goto() lands straight on the dashboard, no login screen.
    await authenticatedPage.goto('https://rahulshettyacademy.com/client/')
    await authenticatedPage.locator("button[routerlink*='myorders']").click();
    await authenticatedPage.locator("tbody").waitFor();
    //createOrder here is the response object the fixture returned via use(response) - orderID (capital
    //ID) is the exact property name APIUtils.createOrder() sets, must match casing exactly in JS.
    await expect(authenticatedPage.getByText(createOrder.orderID)).toBeVisible();
})