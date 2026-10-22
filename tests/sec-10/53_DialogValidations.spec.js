const { test, expect } = require('@playwright/test');


test.only("@Web Dialog Validations", async({ page }) => {
    await page.goto('https://rahulshettyacademy.com/AutomationPractice/');
    await page.locator('#displayed-text').isVisible();
    await expect(page.locator('#displayed-text')).toBeVisible();
    await page.locator('#hide-textbox').click();
    await expect(page.locator('#displayed-text')).toBeHidden();
    //await page.pause()
    //NATIVE BROWSER DIALOGS (alert/confirm/prompt - "JS pop-ups", not a webpage element) have NO
    //DOM/locator you can spy on - they block the whole page until accepted/dismissed, so you can't
    //click an "OK" button via page.locator(). Playwright instead exposes them as a 'dialog' EVENT on
    //the page object: page.on(event, handler) registers the handler BEFORE the dialog ever appears -
    //wherever this line sits in the script, the handler fires the instant ANY dialog opens later on.
    //dialog.accept() clicks the positive button (OK/Confirm); dialog.dismiss() clicks the negative one
    //(Cancel) instead - pick whichever matches the test's intent.
    page.on('dialog',dialog=>dialog.accept())
    //clicking this button is what actually TRIGGERS the dialog to open - the listener above just
    //stands by ready to handle it the moment that happens, it doesn't open the dialog itself.
    await page.locator('#confirmbtn').click()
    //hover() moves the mouse onto this element WITHOUT clicking - needed here because the menu's
    //sub-content only renders on :hover (CSS-driven), so a direct click on the hidden sub-item would
    //fail; you must hover the parent first to reveal it, same as a real user would.
    await page.locator('#mousehover').hover()
    await expect(page.locator('.mouse-hover-content')).toBeVisible()
})
