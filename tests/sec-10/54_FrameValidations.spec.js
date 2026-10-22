const { test, expect } = require('@playwright/test');

test.only("@Web Frame Validations", async({ page }) => {
    await page.goto('https://rahulshettyacademy.com/AutomationPractice/');
    //an <iframe>/<frame>/<frameset> tag embeds a whole separate HTML document inside the main page -
    //page.locator()/page.on() etc. only ever see the MAIN page's DOM, never reach inside an iframe.
    //frameLocator(selector) switches scope to that embedded document and returns a new locator root -
    //store it and chain everything meant for elements INSIDE the iframe off of this, not off `page`.
    const framesPage=page.frameLocator('#courses-iframe')
    //CSS attribute selector with *= does a substring match on href; ':visible' is needed because the
    //same href also matches a second, hidden duplicate element elsewhere in the iframe - without this
    //filter Playwright throws a strict-mode violation (2 matches) on a click (an action), even though
    //a non-action read (see textContent() below) tolerates multiple/invisible matches without erroring.
    await framesPage.locator(`li a[href*='lifetime-access']:visible`).click()
    //scoping through the unique parent class ('.text') first, THEN the child tag ('h2'), narrows what
    //would otherwise be 2 matches (1 visible + 1 hidden) down to exactly 1 - same idea as the :visible
    //filter above, just solved via DOM structure instead of a pseudo-class.
    const textCheck =await framesPage.locator('.text h2').textContent();
    //raw text looks like "Join 13,022 happy subscribers" - splitting on ' ' breaks it into
    //["Join","13,022","happy","subscribers"], so index 1 is the number we actually want.
    const num=textCheck.split(' ')[1]
    console.log(num);
})
