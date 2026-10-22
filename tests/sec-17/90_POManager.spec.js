const { test, expect } = require('@playwright/test');
//ONE import, instead of a separate require() per page object - POManager is the single entry point
//for every page this test needs to interact with.
const { POManager } = require('../../pageobjects/90_POManager.js');


test('@Web playwright test - client app e2e', async ({ page })=>{
    
    //ONE object creation instead of `new LoginPage(page)`, `new DashboardPage(page)`, etc repeated per
    //page - POManager's constructor builds and holds all of them internally.
    const poManager = new POManager(page);

    //pulling out each page object via its getter - the test still ends up with loginPage/dashboardPage/
    //cartPage/ordersReviewPage variables to call methods on, just without having constructed them itself.
    const loginPage = poManager.getLoginPage();
    const dashboardPage = poManager.getDashboardPage();
    const cartPage = poManager.getCartPage();
    const ordersReviewPage = poManager.getOrdersReviewPage();

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
    expect(orderID.includes(orderIdDetails)).toBeTruthy();


})