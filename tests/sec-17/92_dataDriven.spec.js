const { test, expect } = require('@playwright/test');
const { POManager } = require('../../pageobjects/90_POManager.js');

//DATA-DRIVEN TESTING: username/password/productName no longer live inline in the test - they're read
//from an external JSON file instead, so non-technical team members can update test data without
//touching test code, and the same test could be re-run against different data files.
//require(...) on a .json file ALREADY returns a parsed JS object in Node - the extra
//JSON.stringify()+JSON.parse() round-trip here is a defensive "re-serialize then re-parse" step the
//lecture recommends to guard against encoding/formatting quirks in the raw file, at the cost of being
//technically redundant for a well-formed JSON file.
const dataSet=JSON.parse(JSON.stringify(require('../../utils/92_placeorderData.json')))

test('@Web playwright test - client app e2e', async ({ page })=>{
    
    const poManager = new POManager(page);

    
    const loginPage = poManager.getLoginPage();
    const dashboardPage = poManager.getDashboardPage();
    const cartPage = poManager.getCartPage();
    const ordersReviewPage = poManager.getOrdersReviewPage();
    
    const orderHistoryPage = poManager.getOrderHistoryPage();
    
    await loginPage.goTo();
    
    //every hardcoded value from the earlier POManager tests is now dataSet.xxx - swapping the JSON
    //file's contents (or pointing at a different JSON file) changes what this test logs in/searches for,
    //with zero code changes needed.
    await loginPage.validLogin(dataSet.username, dataSet.password);
    await dashboardPage.searchProductAddCart(dataSet.productName);
    await dashboardPage.navigateToCart();
    
    
    const isItemInCart = await cartPage.VerifyProductIsDisplayed(dataSet.productName);
    await expect(isItemInCart).toBeTruthy();
    await cartPage.Checkout();

   
    await ordersReviewPage.searchCountryAndSelect('ind', 'India');
    const orderID = await ordersReviewPage.SubmitAndGetOrderId();
    console.log(orderID)

    await dashboardPage.navigateToOrders();
    await orderHistoryPage.selectOrderByOrderId(orderID);
    const isOrderIdDisplayed = await orderHistoryPage.verifyOrderIdIsDisplayed(orderID);
    expect(isOrderIdDisplayed).toBeTruthy();


})