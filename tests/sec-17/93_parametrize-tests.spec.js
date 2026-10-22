const { test, expect } = require('@playwright/test');
const { POManager } = require('../../pageobjects/90_POManager.js');

//TEST DATA is now an ARRAY of objects (see 93_parametrizeTestData.json), not a single object like
//92_dataDriven.spec.js - each array entry is one full dataset to run the SAME test logic against.
const dataSet=JSON.parse(JSON.stringify(require('../../utils/93_parametrizeTestData.json')))

//wrapping test(...) itself inside a for...of loop is what PARAMETERIZES the test - this registers one
//separate test() per dataset entry (2 datasets here = 2 distinct tests), instead of running the same
//test body once with hardcoded data.
for(const data of dataSet){
    //the test title MUST be unique per iteration - using a template literal (`...${data.productName}`)
    //to embed the current dataset's product name is what makes each generated test's name distinct;
    //without this, every iteration would register a test with the identical literal title and playwright
    //would error about duplicate test names.
    test(`@Web client app e2e ${data.productName}`, async ({ page })=>{
    
        const poManager = new POManager(page);

        
        const loginPage = poManager.getLoginPage();
        const dashboardPage = poManager.getDashboardPage();
        const cartPage = poManager.getCartPage();
        const ordersReviewPage = poManager.getOrdersReviewPage();
        
        const orderHistoryPage = poManager.getOrderHistoryPage();
        
        await loginPage.goTo();
        
        //`data` here is whichever single dataset object this particular loop iteration captured - same
        //test body, different credentials/product per generated test.
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