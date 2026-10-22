const { test, expect } = require('@playwright/test');
//ONE import, instead of a separate require() per page object - POManager is the single entry point
//for every page this test needs to interact with.
const { POManager } = require('../../pageobjects/90_POManager.js');


test('@Web playwright test - client app e2e', async ({ page })=>{
    
    //ONE object creation instead of `new LoginPage(page)`, `new DashboardPage(page)`, etc repeated per
    //page - POManager's constructor builds and holds all of them internally.
    const poManager = new POManager(page);

    //pulling out each page object via its getter - the test still ends up with loginPage/dashboardPage/
    //cartPage/ordersReviewPage/orderHistoryPage variables to call methods on, just without having
    //constructed them itself.
    const loginPage = poManager.getLoginPage();
    const dashboardPage = poManager.getDashboardPage();
    const cartPage = poManager.getCartPage();
    const ordersReviewPage = poManager.getOrdersReviewPage();
    //NEW: covers both the orders LIST screen and the order DETAILS screen reached after clicking a row -
    //combined into one page object since the details screen only needs a single locator worth checking.
    const orderHistoryPage = poManager.getOrderHistoryPage();

    const productName='ZARA COAT 3'
    const userName = 'mkrishnaveni1102@gmail.com'
    const password='Qazmlp@1505'
    
    await loginPage.goTo();
    
    await loginPage.validLogin(userName, password);
    await dashboardPage.searchProductAddCart(productName);
    await dashboardPage.navigateToCart();
    
    //no more inline page.locator()/isVisible() calls here - the cart page object owns its own locators
    //and hands back a plain boolean for the test to assert on.
    const isItemInCart = await cartPage.VerifyProductIsDisplayed(productName);
    await expect(isItemInCart).toBeTruthy();
    await cartPage.Checkout();

    //"ind" is what gets TYPED into the autocomplete field, "India" is the exact option label to click -
    //kept as two separate args so a partial search term can still resolve to one unambiguous option.
    await ordersReviewPage.searchCountryAndSelect('ind', 'India');
    const orderID = await ordersReviewPage.SubmitAndGetOrderId();
    console.log(orderID)

    await dashboardPage.navigateToOrders();
    //no more manual tbody/row-scanning loop here either - orderHistoryPage owns that logic and simply
    //needs the order id to go find and click the matching row.
    await orderHistoryPage.selectOrderByOrderId(orderID);
    //same boolean-return pattern as cartPage - the page object reports whether the details screen shows
    //this order id, and the test is the one that decides to assert on it.
    const isOrderIdDisplayed = await orderHistoryPage.verifyOrderIdIsDisplayed(orderID);
    expect(isOrderIdDisplayed).toBeTruthy();


})