const { test,expect } = require('@playwright/test');

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





customtest.only(`@Web client app e2e`, async ({ page, testDataForOrder })=>{
    
        const poManager = new POManager(page);

        
        const loginPage = poManager.getLoginPage();
        const dashboardPage = poManager.getDashboardPage();
        const cartPage = poManager.getCartPage();
        const ordersReviewPage = poManager.getOrdersReviewPage();
        
        const orderHistoryPage = poManager.getOrderHistoryPage();
        
        await loginPage.goTo();
    
        
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