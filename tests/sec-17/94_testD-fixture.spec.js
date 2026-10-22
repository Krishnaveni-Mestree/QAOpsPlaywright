const { test,expect } = require('@playwright/test');
//imported name (customtest) MUST exactly match the exported property name in 94_test-base.js
//(`exports.customtest = ...`) - mismatching these two names is the #1 way this pattern silently breaks.
const {customtest}=require('../../utils/94_test-base.js')
const { POManager } = require('../../pageobjects/90_POManager.js');

const dataSet=JSON.parse(JSON.stringify(require('../../utils/93_parametrizeTestData.json')))


for(const data of dataSet){
    test(`@Web client app e2e ${data.productName}`, async ({ page })=>{
    
        const poManager = new POManager(page);

        
        const loginPage = poManager.getLoginPage();
        const dashboardPage = poManager.getDashboardPage();
        const cartPage = poManager.getCartPage();
        const ordersReviewPage = poManager.getOrdersReviewPage();
        
        const orderHistoryPage = poManager.getOrderHistoryPage();
        
        await loginPage.goTo();
    
        await loginPage.validLogin(data.username, data.password);
        await dashboardPage.searchProductAddCart(data.productName);
        await dashboardPage.navigateToCart();
        
        
        const isItemInCart = await cartPage.VerifyProductIsDisplayed(data.productName);
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
}




//customtest.only(...) - using .only on the FIXTURE-based test object still affects the whole file:
//playwright's .only, wherever it appears, restricts a run to ONLY the .only-marked test(s) - so the
//plain `test(...)` loop above (2 parameterized tests) gets skipped while this one runs.
customtest.only(`@Web client app e2e`, async ({ page, testDataForOrder })=>{
    
        const poManager = new POManager(page);

        
        const loginPage = poManager.getLoginPage();
        const dashboardPage = poManager.getDashboardPage();
        const cartPage = poManager.getCartPage();
        const ordersReviewPage = poManager.getOrdersReviewPage();
        
        const orderHistoryPage = poManager.getOrderHistoryPage();
        
        await loginPage.goTo();
    
        //testDataForOrder is destructured as a test PARAMETER, same mechanism as authenticatedPage in
        //sec-13 - playwright matches this name back to the fixture defined in 94_test-base.js and hands
        //back that plain data object, no construction/setup logic runs for it (it's not a function fixture).
        await loginPage.validLogin(testDataForOrder.username, testDataForOrder.password);
        await dashboardPage.searchProductAddCart(testDataForOrder.productName);
        await dashboardPage.navigateToCart();
        
        
        const isItemInCart = await cartPage.VerifyProductIsDisplayed(testDataForOrder.productName);
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