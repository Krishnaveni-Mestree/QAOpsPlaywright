const { test, expect } = require('@playwright/test');

//from 52_MoreValidations.spec.js file
//page.screenshot() captures the ENTIRE page (viewport), saved as a .png at the given path in the
//project root - useful as visual proof when an assertion alone doesn't convince you something actually
//rendered/disappeared correctly (e.g. proving this textbox is truly hidden, not just slow to hide).
test('@Web complete screenshot demo', async ({ page }) => {
    await page.goto('https://rahulshettyacademy.com/AutomationPractice/');
    await expect(page.locator('#displayed-text')).toBeVisible();
    await page.locator('#hide-textbox').click();
    await page.screenshot({ path: 'screenshot.png' });
    await expect(page.locator('#displayed-text')).toBeHidden();
})


//same screenshot() method, but called ON A LOCATOR instead of on `page` - captures only that element's
//bounding box, not the whole page. Taken BEFORE the hide-click here, to visually prove what the textbox
//looked like while still visible, since after clicking hide there'd be nothing left to screenshot.
test('@Web partial screenshot demo', async ({ page }) => {
    await page.goto('https://rahulshettyacademy.com/AutomationPractice/');
    await expect(page.locator('#displayed-text')).toBeVisible();
    await page.locator('#displayed-text').screenshot({ path: 'partial-screenshot.png' });
    await page.locator('#hide-textbox').click();
    await expect(page.locator('#displayed-text')).toBeHidden();
})