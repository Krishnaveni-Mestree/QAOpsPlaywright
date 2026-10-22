//STEP DEFINITIONS (Tags lesson): this file holds ALL steps of the project so far - the e-commerce order flow
//(117_Ecommerce.feature) plus the new login error validation (122_ErrorValidations.feature).
//Browser/page/POManager setup and cleanup are NOT here - they come from the hooks in features/support/122_tagged-hooks.js
//and are shared through the World (`this`): this.page, this.poManager, this.orderID.
//NOTE: cucumber.js `require` must point to THIS file; a feature step that is not found in a loaded file shows as "Undefined".

const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test'); //only for assertions

//---------- Scenario 1: place an order (117_Ecommerce.feature) ----------

//{string} values come from the feature file; {timeout: 100 * 1000} = up to 100s (Cucumber's default is only 5s).
Given('a login to Ecommerce application with {string} and {string}', { timeout: 100 * 1000 }, async function (username, password) {
    const loginPage = this.poManager.getLoginPage();
    await loginPage.goTo();
    await loginPage.validLogin(username, password);
});

When('Add {string} to cart', async function (productName) {
    const dashboardPage = this.poManager.getDashboardPage();
    //Wait until the product cards are visible first, so we don't search the list before the dashboard has rendered.
    await this.page.locator('.card-body ').first().waitFor();
    await dashboardPage.searchProductAddCart(productName);
    await dashboardPage.navigateToCart();
});

Then('Verify {string} is displayed in the cart', async function (productName) {
    const cartPage = this.poManager.getCartPage();
    //Assert so the scenario really FAILS if the product is missing.
    const isItemInCart = await cartPage.VerifyProductIsDisplayed(productName);
    expect(isItemInCart).toBeTruthy();
    await cartPage.Checkout();
});

When('Enter valid details and place the order', async function () {
    const ordersReviewPage = this.poManager.getOrdersReviewPage();
    await ordersReviewPage.searchCountryAndSelect('ind', 'India');
    //Saved in the World so the last step can look for this exact order in Order History.
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

//---------- Scenario 2: invalid login error (122_ErrorValidations.feature) ----------
//This is a DIFFERENT app page (the login practice site), so it has its own step text ("Ecommerce2") - if it reused
//the "Ecommerce application" text, Cucumber would not know which Given to run. It doesn't use page objects:
//it works directly on `this.page`, the page created by the Before hook.

//{timeout: 100 * 1000}: this step opens a real website (page.goto), which can take longer than Cucumber's 5s default.
//Without it you get "function timed out, ensure the promise resolves within 5000 milliseconds".
Given('a login to Ecommerce2 application with {string} and {string}', { timeout: 100 * 1000 }, async function (username, password) {
    //BUG FIX: `page.locator(...)` -> `this.page.locator(...)`. Plain `page` doesn't exist inside a step
    //(the page lives in the World), which caused "page is not defined".
    const userName = this.page.locator('#username');
    const signInBtn = this.page.locator('#signInBtn');
    await this.page.goto('https://rahulshettyacademy.com/loginpagePractise/');
    console.log(await this.page.title());
    await userName.fill(username);
    const passwordField = this.page.locator("[type='password']");
    await passwordField.fill(password);
    await signInBtn.click();
});

Then('Verify Error message is displayed', async function () {
    //The error box is hidden until a login fails; its style turns to "display: block" when it appears.
    console.log(await this.page.locator("[style*='block']").textContent());
    //expect(locator).toContainText auto-waits (retries) until the text shows up or times out.
    await expect(this.page.locator("[style*='block']")).toContainText('Incorrect');
});
