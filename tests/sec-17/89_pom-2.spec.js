const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageobjects/88_LoginPage.js');
const { DashboardPage } = require('../../pageobjects/89_1Dashboard.js');
const {CartPage} = require('../../pageobjects/89_2CartPage.js');


test('@Web playwright test - client app e2e', async ({ page })=>{
    
    const loginPage = new LoginPage(page)
    const dashboardPage=new DashboardPage(page)
    const checkoutPage=new CartPage(page)

    const products=page.locator('.card-body ')
    const productName='ZARA COAT 3'

    const userName = 'mkrishnaveni1102@gmail.com'
    const password='Qazmlp@1505'
    await loginPage.goTo();
    await loginPage.validLogin(userName, password);

    await dashboardPage.searchProductAddCart(productName);
    await dashboardPage.navigateToCart();
    
    await page.locator('div li').first().waitFor()
    const isItemInCart = await page.locator(`h3:has-text('${productName}')`).isVisible();
    await expect(isItemInCart).toBeTruthy();

    await page.locator(`text=Checkout`).click()
    await checkoutPage.enterCountry('India')

    const isMailCorrect = await checkoutPage.verifyMail(userName);
    await expect(isMailCorrect).toBeTruthy();
    await checkoutPage.placeOrder()

    await expect(page.locator('.hero-primary')).toHaveText(' Thankyou for the order. ')
    const orderID= await page.locator('.em-spacer-1 .ng-star-inserted').textContent()
    console.log(orderID)

    await page.locator("button[routerlink*='myorders']").click();
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