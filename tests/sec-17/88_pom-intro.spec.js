const { test, expect } = require('@playwright/test');
//importing the page object CLASS, not an instance - a new instance is created per test below, scoped to
//that test's own `page` fixture (so parallel tests each get their own independent login page object).
const { LoginPage } = require('../../pageobjects/88_LoginPage.js');



test('@Web playwright test - client app e2e', async ({ page })=>{
    
    //creating the page object HERE (inside the test, after `page` exists) - the constructor needs a
    //real page to attach its locators to, so this can't happen at module load time, only at test runtime.
    const loginPage = new LoginPage(page)

    const products=page.locator('.card-body ')
    const productName='ZARA COAT 3'

    const userName = 'mkrishnaveni1102@gmail.com'
    const password='Qazmlp@1505'
    //compare this to the pre-POM version: no raw locators/fill/click here anymore - the test just reads
    //as "go to login page, then log in", all the HOW is hidden inside LoginPage_88.
    await loginPage.goTo();
    await loginPage.validLogin(userName, password);

    const cardTitles=page.locator('.card-body b')
    
    await page.waitForLoadState('networkidle');
    await cardTitles.first().waitFor()
    
    const allCardTitles=await cardTitles.allTextContents()
    console.log(allCardTitles)

    const count=await products.count()
    for(let i=0;i<count;++i){
        if(await products.nth(i).locator('b').textContent()===productName){
            await products.nth(i).locator(`text= Add To Cart`).click()
            break;
        }
    }
    await page.locator(`[routerlink*='cart']`).click()
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