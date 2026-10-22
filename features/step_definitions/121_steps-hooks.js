//STEP DEFINITIONS (Hooks lesson): browser/page/POManager setup and cleanup are NOT here anymore - they live in
//features/support/121_hooks.js (Before/After). Each step just uses `this.poManager`, which the Before hook created
//and stored in the World (`this`) before the first step ran.
//Imports are smaller too: no POManager/chromium needed here, because the hook builds them.

const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test'); //only for assertions

//{string} values come from the feature file; {timeout: 100 * 1000} = up to 100s (Cucumber's default is only 5s).
Given('a login to Ecommerce application with {string} and {string}', { timeout: 100 * 1000 }, async function (username, password) {
    const loginPage = this.poManager.getLoginPage();
    await loginPage.goTo();
    await loginPage.validLogin(username, password);
});

When('Add {string} to cart', async function (productName) {
    const dashboardPage = this.poManager.getDashboardPage();
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
