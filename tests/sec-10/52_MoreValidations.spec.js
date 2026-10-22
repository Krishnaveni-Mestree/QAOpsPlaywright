const { test, expect } = require('@playwright/test');

//SECTION 10 - more Playwright capabilities, on a second practice site (this one has iframes, which
//is why page loads take noticeably longer here - covered in a later lecture).

test("@Web navigations", async({ page }) => {
    await page.goto('https://rahulshettyacademy.com/AutomationPractice/');
    //page.goto() to a second URL on the SAME page object acts just like typing a new address in the
    //existing browser tab - no new tab/page is opened.
    await page.goto('https://google.com')
    //goBack()/goForward() mirror the browser's own back/forward buttons - they navigate within this
    //page's history stack, so goBack() here returns to the AutomationPractice site, and goForward()
    //after that goes back to google.com.
    await page.goBack()
    await page.goForward()
})

test.only("@Web popup validations", async({ page }) => {
    await page.goto('https://rahulshettyacademy.com/AutomationPractice/');
    //isVisible() alone does nothing without an assertion wrapped around it (no auto-wait/retry either) -
    //it's shown here only for contrast with the real assertion on the next line.
    await page.locator('#displayed-text').isVisible();
    //MISSING-HASH TRAP: '#displayed-text' is an ID selector - forgetting the leading '#' (i.e. writing
    //just 'displayed-text') makes Playwright treat it as a TAG NAME instead, so the locator matches
    //nothing and times out with "waiting for selector" - easy typo to make, always double check the '#'/'.'.
    await expect(page.locator('#displayed-text')).toBeVisible();
    await page.locator('#hide-textbox').click();
    //toBeHidden() passes for BOTH "detached from DOM" and "present but display:none/visibility:hidden" -
    //use this (not toBeVisible().not or isVisible()) to confirm an element disappeared after an action.
    await expect(page.locator('#displayed-text')).toBeHidden();
})
