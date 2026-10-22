//expect MUST be imported from '@playwright/test' (not from a separate 'expect'/chai/jasmine package) -
//playwright ships its own built-in assertion library, unlike older tools (Selenium/Cypress/WebdriverIO) which need external assertion frameworks.
const { test, expect } = require('@playwright/test');

test('@Web test title', async function(){
    //playwright code-
    //step1 -open broeser
    //step2- enter un & password
    //step3 - click login button
    //there is no guarantee in js that these 3 steps will execute in sequentially
    //in js, all 3 steps will try to execute at a time, that is called asynchronous execution.
    //to handle this, we use async/await in playwright. - explicitly telling js to wait for a step to complete before moving to the next one.
    //whenever we write await in code, the function containing it must be declared as async. 
})

test('@Web Browser Context Declaration', async ({ browser })=>{
    //we need a browser instance to start the test - context
    const context=await browser.newContext();
    //we need a page instance to interact with the web page
    const page=await context.newPage();
    //navigate to a URL
    await page.goto('https://rahulshettyacademy.com/loginpagePractise/')
    console.log(await page.title());
})

//we no need to mention context and page explicitly in every test, Playwright provides them through fixtures.
//we can directly use the page fixture in our tests without explicitly creating context and page instances.
//playwright  will understand that we were in default test environment and provide the necessary fixtures like page, browser, and context automatically.

test('@Web Using page fixture', async ({ page })=>{
    //directly using the page fixture provided by Playwright
    //COMMON MISTAKE: missing 'await' here (e.g. page.goto(...) without await) lets the next line start
    //before navigation finishes, so the assertion below would run against the wrong/blank page and fail misleadingly.
    await page.goto('https://google.com');
    console.log(await page.title());
    //toHaveTitle is a web-first assertion - it auto-retries/polls until expect.timeout, no need to manually wait/sleep.
    await expect(page).toHaveTitle('Google');
})

//to run the tests, use the command: npx playwright test
//here npx is the path to the locally installed Playwright library

//and also execution depends on playwright.config.js files, there we mentione testDir ,those will run automatically.
//By default (and when fullyParallel:true is set in config), Playwright runs EACH TEST in its own worker process,
//even if they are in the same file - so tests in the same file run in PARALLEL, not sequentially.
//Example: "Running 3 tests using 3 workers" means all 3 tests (even from this single file) ran at the same time.
//If fullyParallel is false/unset, tests in the same file run sequentially in one worker,
//but tests across different files can still run in parallel (across multiple workers).
//To force fully sequential execution, use test.describe.serial() or set workers:1 in playwright.config.js.

//Test annotation attributes (helper flags you can chain on test()):
//test.only(...) - runs ONLY this test, skips all other tests in the run (useful while developing one test).
//test.skip(...) - skips this test, won't run at all (shows as skipped in report).
//test.skip(condition, reason) - conditionally skip, e.g. test.skip(browserName==='firefox', 'not supported').
//test.fixme(...) - marks test as broken/to-be-fixed, skips it but flags it differently in report.
//test.fail() - marks test as expected to fail; if it fails, report shows it as expected (not a failure).
//test.slow() - triples the default timeout for that test (for known slow tests).
//test.describe.serial(...) - groups tests to run in order, in the same worker, stopping on first failure.
//test.describe.parallel(...) - forces tests inside the group to run in parallel even if fullyParallel is false.

//Cross-browser execution (UPDATED for latest Playwright - this repo's config already uses the current/correct approach):
//OLD/simplified way some tutorials teach: set a single `use: { browserName: 'firefox' }` in config and rerun.
//CURRENT way: define multiple entries in the `projects` array in playwright.config.js (chromium/firefox/webkit),
//each can have its own `use` overrides (viewport, device, headless, etc.).
//Run all enabled projects together with: npx playwright test
//Run just one browser with: npx playwright test --project=chromium (or firefox/webkit)
//See this repo's playwright.config.js - firefox/webkit projects are present but commented out; uncomment to enable them.

//Headless control (same effect as the --headed CLI flag, but persisted in config):
//add `use: { headless: false }` in playwright.config.js to always show the browser without passing --headed every time.
//Playwright defaults to headless: true when not specified.

test('@Web playwright test to validate login error', async ({ browser })=>{
    //we need a browser instance to start the test - context
    const context=await browser.newContext();
    //we need a page instance to interact with the web page
    const page=await context.newPage();
    //navigate to a URL
    await page.goto('https://rahulshettyacademy.com/loginpagePractise/')
    console.log(await page.title());
    //page.locator(selector) - playwright cannot find an element on its own, you must give it a CSS/XPath selector;
    //playwright recommends CSS over XPath. Selector recipes: tag#id, tag.class, [attribute='value'] (tag name is optional in all 3).
    //Use a browser devtools "inspect" + a plugin (SelectorsHub/ChroPath) to build/verify these selectors against the live DOM.
    await page.locator('#username').fill('rahulshetty')
    //NOTE (latest Playwright): the old `.type()` method is DEPRECATED - always use `.fill()` to enter text into inputs.
    await page.locator("[type='password']").fill('learning')
    //click() is an action (not a data-entry method) - same locator() call, different method depending on what you need to do with the element.
    await page.locator('#signInBtn').click();
    //[style*='block'] uses a regex-like partial-match attribute selector (style CONTAINS 'block'), useful when the
    //full attribute value (e.g. "display: block;") isn't fixed/known, or only part of it is reliable to match on.
    //AUTO-WAITING: this error message is hidden/empty until a delayed JS update makes it visible. Unlike Selenium
    //(which needs explicit WebDriverWait), playwright's locator automatically retries/polls for the element to appear
    //in the DOM up to the action/assertion timeout - no manual wait code needed.
    //textContent() extracts the visible text of the element located (after playwright has waited for it to show up).
    console.log(await page.locator("[style*='block']").textContent());
    //toContainText does a substring match (not exact match) and is itself a web-first assertion -
    //it keeps retrying until the text appears or expect.timeout is hit, then reports actual vs expected on failure.
    await expect(page.locator("[style*='block']")).toContainText('Incorrect');

})

//Timeout defaults (correcting transcript): Playwright's built-in defaults are 30s per test and 5s per expect() assertion.
//This repo's playwright.config.js overrides these to 40s per test and 20s per expect() assertion
//(see timeout and expect.timeout keys) - so assertions here get up to 20s, not the 5s default the transcript describes.

test('@Web playwright test - login success', async ({ page })=>{
   
    //locators can be stored in a variable WITHOUT await - no action is performed yet, it's just the selector reference;
    //await is only needed when you actually call an action (.fill/.click/.textContent etc.) on it.
    const userName = page.locator('#username')
    const signInBtn = page.locator('#signInBtn')
    //navigate to a URL
    await page.goto('https://rahulshettyacademy.com/loginpagePractise/')
    console.log(await page.title());
    await userName.fill('rahulshetty')
    const password = page.locator("[type='password']")
    await password.fill('Learning@830$3mK2')
    await signInBtn.click();
    console.log(await page.locator("[style*='block']").textContent());
    await expect(page.locator("[style*='block']")).toContainText('Incorrect');
    //fill('') clears existing input content first, then fill(value) types the new value - reuse the same 
    //.clear() explicitly it also clears the input field before filling it again.
    //locator variable instead of re-writing page.locator(...) every time.
    //await userName.fill('')
    await userName.clear()
    await userName.fill('rahulshettyacademy')
    await signInBtn.click();
    //STRICT MODE: in modern Playwright, a locator matching MULTIPLE elements throws "strict mode violation"
    //on actions/assertions (not just .textContent() - this applies to click/fill too) - it refuses to guess which one you meant.
    //'.card-body a' matches all 4 product titles here, so you must narrow it down with .first()/.nth(index)/.last() (0-indexed).
    console.log(await page.locator('.card-body a').first().textContent())
    console.log(await page.locator('.card-body a').nth(1).textContent())
    console.log(await page.locator('.card-body a').last().textContent())
    

})



test.only('@Web playwright test - to get list of products', async ({ page })=>{
   
    const userName = page.locator('#username')
    const password = page.locator("[type='password']")
    const signInBtn = page.locator('#signInBtn')
    const cardTitles=page.locator('.card-body a')
    //navigate to a URL
    await page.goto('https://rahulshettyacademy.com/loginpagePractise/')
    console.log(await page.title());
    await userName.fill('rahulshetty')
    await password.fill('Learning@830$3mK2')
    await signInBtn.click();
    console.log(await page.locator("[style*='block']").textContent());
    await expect(page.locator("[style*='block']")).toContainText('Incorrect');
    await userName.fill('')
    await userName.fill('rahulshettyacademy')
    await signInBtn.click();
    console.log(await cardTitles.first().textContent())
    console.log(await cardTitles.nth(1).textContent())
    // console.log(await cardTitles.last().textContent())

    //IMPORTANT FLAKINESS TRAP: allTextContents() (and other "list" methods like count()/allInnerTexts())
    //does NOT auto-wait for elements to attach to the DOM - it just reads whatever matches right now and
    //returns an array, even if that's []. A single-element action like .first().textContent()/.click() DOES
    //auto-wait (retries until found or timeout), because "not found" for one element is treated as not-ready-yet,
    //but an empty list for a multi-match locator is considered a valid result (zero matches), not a sync signal.
    //So if the product cards haven't rendered yet when this runs, you'd silently get [] instead of a failure or the real data.
    //Fix: either keep a prior step that already waited for the list (e.g. an earlier .first() call on the same locator),
    //or explicitly wait, e.g. await cardTitles.first().waitFor() / await expect(cardTitles).not.toHaveCount(0) before reading allTextContents().
    const allTitles=await cardTitles.allTextContents()
    console.log(allTitles)

})


