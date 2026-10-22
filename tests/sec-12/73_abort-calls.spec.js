const { test, expect } = require('@playwright/test');

//ABORT = 4th interception method (continue/fulfill/fetch seen earlier, abort is the new one here) - it
//stops a matching request from ever reaching the browser, simulating things like "server is down" or
//deliberately skipping non-essential assets (css/images) to speed up automation that doesn't verify them.
test('@Web abort calls test', async ({ browser })=>{
    const context=await browser.newContext();
    const page=await context.newPage();

    //route() must be registered before goto() - same rule as every other interception lecture: Playwright
    //can only abort a call it was already watching for when the request fires.
    //**/*.css = wildcard regex meaning "any path, ending in .css" - blocks ALL stylesheet requests, which
    //is why the page renders unstyled/"ugly" below, but functional automation (clicks/text) still works.
    page.route('**/*.css',route=>route.abort());
    //{jpg,png,jpeg} groups multiple extensions in one pattern - blocks all three image types in a single
    //route() call instead of registering one route per extension.
    page.route('**/*.{jpg,png,jpeg}', route=>route.abort());

    await page.goto('https://rahulshettyacademy.com/loginpagePractise/')
    console.log(await page.title());

    await page.locator('#username').fill('rahulshettyacademy')
    await page.locator('#password').fill('Learning@830$3mK2')
    await page.locator('#signInBtn').click();

    const cardTitles=page.locator('.card-body a')
    console.log(await cardTitles.first().textContent())
    console.log(await cardTitles.nth(1).textContent())
    //pause here lets you visually confirm in the Inspector that css/images never loaded - purely for
    //this demo, not needed once you trust the abort() behavior.
    await page.pause();
})



//test.only() restricts this run to ONLY this test in the file - the abort test above gets skipped
//whenever you run this file, since both tests can't realistically run together in one demo session.
test.only('@Web handling request and response event', async ({ browser })=>{
    const context=await browser.newContext();
    const page=await context.newPage();

    //page.on() is a LISTENER (same concept as the popup/new-window listener from earlier lectures) -
    //it doesn't intercept/modify anything, it just fires automatically every time that event type
    //occurs, letting us observe and log every network call the browser makes, start to finish.
    //'request' fires the instant the browser sends a call - request.url() tells us WHAT was called.
    page.on('request',request=>console.log(request.url()));
    //'response' fires once the backend answers - response.status() is the key diagnostic: codes in the
    //400s/500s point straight at which service call broke, without needing to re-debug the whole test.
    page.on('response',response=>console.log(response.url(), response.status()));
    await page.goto('https://rahulshettyacademy.com/loginpagePractise/')
    console.log(await page.title());

    await page.locator('#username').fill('rahulshettyacademy')
    await page.locator('#password').fill('Learning@830$3mK2')
    await page.locator('#signInBtn').click();

    const cardTitles=page.locator('.card-body a')
    console.log(await cardTitles.first().textContent())
    console.log(await cardTitles.nth(1).textContent())
    // await page.pause();
})