//STEP DEFINITIONS: each Gherkin line in 117_Ecommerce.feature is "glued" to a JS function below.
//Cucumber reads a line like `When Add "Zara coat 3" to cart`, finds the matching step here, and runs it.
//The code inside is the SAME code from our Playwright spec (119_POManager.spec.js), just split into small pieces.


/* commented due to ambiguity


const { Given, When, Then, After, setDefaultTimeout } = require('@cucumber/cucumber');
//NOTE: in the lecture `playwright` was imported from '@playwright/test'. In our installed version (1.64.x) that
//package does NOT export a `playwright` object - it exports `chromium` directly, which is the exact same thing as
//`playwright.chromium`. So we import `chromium` instead (otherwise `playwright` is undefined -> crash).
//`expect` comes from the same package, so we can still use Playwright assertions in Cucumber steps.
const { chromium, expect } = require('@playwright/test');
//PATH FIX: this file lives in features/step_definitions/ (2 levels deep), unlike the spec file in tests/.
//So we go up TWO folders ('../../') to reach the project root, then into pageobjects/.
const { POManager } = require('../../pageobjects/90_POManager.js');

//Cucumber's default step timeout is only 5 seconds - too short for login + checkout on a real website.
//Raising it to 60 seconds avoids "function timed out" errors.
setDefaultTimeout(60 * 1000);

//SHARING DATA BETWEEN STEPS (temporary approach):
//`poManager`, `browser` and `orderID` are created inside one step but needed in later steps.
//Variables declared INSIDE a step function die when that step ends, so we declare them OUTSIDE (module level).
//This works, but it is not clean. The next lecture introduces the Cucumber "World" constructor to fix this.
let browser;
let poManager;
let orderID;

//`async` is REQUIRED on the function whenever we use `await` inside it. Without `async`, `await` is a syntax error.
//{string} placeholders in the step text are passed in as the function params, in order (username, password).
Given('a login to Ecommerce application with {string} and {string}', async function (username, password) {
    //In a normal Playwright test, `page` is injected automatically by the `test` runner.
    //Cucumber does NOT do that, so we build it ourselves in 3 steps: browser -> context -> page.
    browser = await chromium.launch({ headless: false }); //1. start the browser (headless:false = visible window)
    const context = await browser.newContext();            //2. fresh, isolated browser session (like an incognito profile)
    const page = await context.newPage();                  //3. a tab inside that context - this is our `page`

    //Hand the page to POManager so every page object shares the same tab.
    poManager = new POManager(page);
    const loginPage = poManager.getLoginPage();
    await loginPage.goTo();
    //BUG FIX: the pasted code used `data.username` / `data.password`. `data` only existed in the spec's loop.
    //Here the values arrive from the feature file as the step params `username` and `password`.
    await loginPage.validLogin(username, password);
});

When('Add {string} to cart', async function (productName) {
    //`poManager` was created in the Given step above, so we can reuse it here.
    const dashboardPage = poManager.getDashboardPage();
    await dashboardPage.searchProductAddCart(productName); //productName = "Zara coat 3" from the feature file
    await dashboardPage.navigateToCart();
});

Then('Verify {string} is displayed in the cart', async function (productName) {
    const cartPage = poManager.getCartPage();
    //BUG FIX: was `data.productName`; now uses the step param.
    const isItemInCart = await cartPage.VerifyProductIsDisplayed(productName);
    expect(isItemInCart).toBeTruthy(); //fails the scenario if the product is not in the cart
    await cartPage.Checkout();
});

When('Enter valid details and place the order', async function () {
    const ordersReviewPage = poManager.getOrdersReviewPage();
    await ordersReviewPage.searchCountryAndSelect('ind', 'India');
    //Saved into the module-level `orderID` (no `const`) so the next step can verify this same order.
    orderID = await ordersReviewPage.SubmitAndGetOrderId();
    console.log(orderID);
});

Then('Verify order is present in the OrderHistory page', async function () {
    const dashboardPage = poManager.getDashboardPage();
    const orderHistoryPage = poManager.getOrderHistoryPage();
    await dashboardPage.navigateToOrders();
    await orderHistoryPage.selectOrderByOrderId(orderID);
    const isOrderIdDisplayed = await orderHistoryPage.verifyOrderIdIsDisplayed(orderID);
    expect(isOrderIdDisplayed).toBeTruthy();
});

//Hook: runs after EVERY scenario (pass or fail). Playwright's test runner used to close the browser for us;
//with Cucumber we must do it ourselves, otherwise the browser stays open and the run can hang.
After(async function () {
    if (browser) {
        await browser.close();
    }
});



*/
