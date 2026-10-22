//WORLD CONSTRUCTOR (Cucumber): every scenario gets its OWN "world" - one object that is shared by ALL steps of
//that scenario. Inside a step function (a normal `function`, NOT an arrow function), `this` IS that world object.
//  - Save a value with   this.something = ...   -> it stays alive after the step ends.
//  - Read it in any later step with   this.something
//Before (119_steps.js) we used module-level variables (let poManager...) to share data. `this` replaces that:
//no globals, and each scenario gets a fresh world, so scenarios cannot leak data into each other.
//IMPORTANT: use `function () {}` for steps, never `() => {}` - arrow functions have no own `this`, so the world is lost.


/*


//`test` is no longer imported: that belongs to the Playwright Test (Mocha-style) runner. Cucumber is our runner now,
//and the two runners cannot be mixed. We only need `expect` (assertions) + `chromium` (to launch the browser).
const { Given, When, Then, After } = require('@cucumber/cucumber');
const { POManager } = require('../../pageobjects/90_POManager.js');
const { expect, chromium } = require('@playwright/test');
//NOTE: lecture used `playwright.chromium`; our @playwright/test (1.64) has no `playwright` export, only `chromium`.


//Username/password/product names are NOT read from a JSON file (`data.username`) anymore - that was the Playwright
//Test way. Now the data comes from the feature file: each {string} in the step text is passed as a parameter.
//{timeout: 100 * 1000} = give THIS step 100 seconds (in milliseconds). Cucumber's default is only 5 seconds, and
//this step opens a browser + logs in, which can take longer -> without it the step fails with "timed out".
Given('a login to Ecommerce application with {string} and {string}', { timeout: 100 * 1000 }, async function (username, password) {
    //Cucumber doesn't give us `page` automatically, so we build it: browser -> context -> page.
    //headless:false = show the browser window (default is headless, i.e. invisible).
    this.browser = await chromium.launch({ headless: false });
    const context = await this.browser.newContext();
    const page = await context.newPage();

    //this.poManager (not `const poManager`): saved in the world so the next steps can use the SAME instance.
    //If we had used `const`, it would die when this step ends -> "poManager is not defined" in the next step.
    this.poManager = new POManager(page);
    const loginPage = this.poManager.getLoginPage();
    await loginPage.goTo();
    await loginPage.validLogin(username, password);
});

When('Add {string} to cart', async function (productName) {
    //Reading from the world: `this.poManager` was set in the Given step above.
    const dashboardPage = this.poManager.getDashboardPage();
    await dashboardPage.searchProductAddCart(productName);
    await dashboardPage.navigateToCart();
});

Then('Verify {string} is displayed in the cart', async function (productName) {
    const cartPage = this.poManager.getCartPage();
    //Assert here so the scenario really FAILS if the product is missing (before, the result was ignored).
    const isItemInCart = await cartPage.VerifyProductIsDisplayed(productName);
    expect(isItemInCart).toBeTruthy();
    await cartPage.Checkout();
});

When('Enter valid details and place the order', async function () {
    const ordersReviewPage = this.poManager.getOrdersReviewPage();
    await ordersReviewPage.searchCountryAndSelect('ind', 'India');
    //Saved in the world so the LAST step can look for this exact order in Order History.
    this.orderID = await ordersReviewPage.SubmitAndGetOrderId();
    console.log(this.orderID);
});

Then('Verify order is present in the OrderHistory page', async function () {
    const dashboardPage = this.poManager.getDashboardPage();
    const orderHistoryPage = this.poManager.getOrderHistoryPage();
    await dashboardPage.navigateToOrders();
    await orderHistoryPage.selectOrderByOrderId(this.orderID);
    const isOrderIdDisplayed = await orderHistoryPage.verifyOrderIdIsDisplayed(this.orderID);
    expect(isOrderIdDisplayed).toBeTruthy();
});

//Hook: runs after every scenario (pass or fail). Closes the browser we stored in the world.
//Without this an open browser keeps Node alive, so the terminal "hangs" after the run finishes
//(the lecture works around that with --exit; see cucumber.js `forceExit`).
After(async function () {
    if (this.browser) {
        await this.browser.close();
    }
});



*/
