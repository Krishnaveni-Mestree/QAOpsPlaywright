const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pageobjects/88_LoginPage.js');
const { DashboardPage } = require('../../pageobjects/89_1Dashboard.js');



test('@Web playwright test - client app e2e', async ({ page })=>{
    
    //each page object gets its OWN instance here, all sharing the same `page` fixture - every page the
    //test touches (login, dashboard, and eventually cart/checkout) gets its own dedicated class.
    const loginPage = new LoginPage(page)
    const dashboardPage=new DashboardPage(page)

    const products=page.locator('.card-body ')
    const productName='ZARA COAT 3'

    const userName = 'mkrishnaveni1102@gmail.com'
    const password='Qazmlp@1505'
    await loginPage.goTo();
    await loginPage.validLogin(userName, password);

    //no more waitForLoadState/manual card-matching loop here - that whole block now lives inside
    //DashboardPage, the test just expresses INTENT: search for this product, then go to the cart.
    await dashboardPage.searchProductAddCart(productName);
    await dashboardPage.navigateToCart();
    
    await page.locator('div li').first().waitFor()
    const isItemInCart = await page.locator(`h3:has-text('${productName}')`).isVisible();
    await expect(isItemInCart).toBeTruthy();

    await page.locator(`text=Checkout`).click()
    const dropdown=page.locator(`[placeholder*='Country']`)
    await dropdown.pressSequentially('ind', { delay: 150 });
    const countryOptionsDropdown = page.locator('.ta-results')
    await countryOptionsDropdown.locator('button').first().waitFor()
    const optionsCount=await countryOptionsDropdown.locator('button').count()
    for(let i=0;i<optionsCount;++i){
        const text=await countryOptionsDropdown.locator('button').nth(i).textContent()
        if(text.trim().endsWith('India')){
            await countryOptionsDropdown.locator('button').nth(i).click({ force: true })
            break;
        }
    }
    await countryOptionsDropdown.waitFor({ state: 'hidden' })

    await expect(page.locator(`.user__name [type='text']`).first()).toHaveText(userName);
    await page.locator('.action__submit').click()

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