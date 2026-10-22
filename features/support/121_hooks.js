//HOOKS FILE: Cucumber's convention is to keep hooks in features/support/, separate from the
//step definitions in features/step_definitions/. Hooks run automatically - no step text needed, they apply to
//EVERY scenario (that's why, unlike Given/When/Then, they have no "plain English" first argument).
//Keeping setup here means the steps only describe business actions, and any new scenario gets a ready browser for free.
//NOTE: cucumber.js `require` must list this file too, otherwise Cucumber never loads these hooks.
//
//HOOK EXECUTION ORDER (for a feature with 1 scenario and N steps):
//  BeforeAll -> Before -> [BeforeStep -> step -> AfterStep] x N -> After -> AfterAll
//
//  BeforeAll / AfterAll   : run ONCE for the whole test run (even with 5 scenarios).
//  Before / After         : run once PER SCENARIO (5 scenarios = 5 times).
//  BeforeStep / AfterStep : run around EVERY single step (10 steps = 10 times).
//All of these must be imported from '@cucumber/cucumber' (Status too) - they are not available globally.

const { Before, After, BeforeAll, AfterAll, BeforeStep, AfterStep, Status } = require('@cucumber/cucumber');
//`chromium` is the same as `playwright.chromium` in the lecture (importing the whole module as `playwright` also works).
const { chromium } = require('@playwright/test');
//PATH: this file is in features/support/ (2 levels deep), so '../../' reaches the project root.
const { POManager } = require('../../pageobjects/90_POManager.js');

//Runs ONCE before the first scenario. Good for global setup (test data, folders, reading config).
//Note: there is no scenario World here, so `this` can't be used to share data in BeforeAll/AfterAll.
BeforeAll(async function () {
    //Any global setup before all scenarios can go here.
});

//Runs before EVERY scenario. Must be a normal `function` (not an arrow) so `this` is the scenario's World,
//which is how hooks and steps share data: whatever we store on `this` here is read as `this.xxx` in any step.
//This replaced the browser -> context -> page code that used to sit inside the login step, so the login step
//now does ONLY the login.
Before(async function () {
    this.browser = await chromium.launch({ headless: false }); //stored so the After hook can close it
    const context = await this.browser.newContext();
    this.page = await context.newPage();                       //this.page: also needed by AfterStep for screenshots
    this.poManager = new POManager(this.page);                 //steps use this.poManager.getXxxPage()
});

//Runs before EVERY STEP (each Given/When/Then line in the feature file). 5 steps = 5 runs.
BeforeStep(async function () {
    //Any setup needed before each step can go here.
});

//Runs after EVERY STEP, whether it passed or failed. Cucumber hands us the step's outcome as `result`.
//Typical use: take a screenshot only when that step FAILED.
//(How to know the syntax? From Cucumber's official hooks documentation - the sample there is Selenium; we swap
//in the Playwright call `page.screenshot`.)
AfterStep(async function ({ result }) {
    if (result?.status === Status.FAILED) { //Status.FAILED comes from the imported `Status`; `?.` avoids errors if no result
        //this.page = the page stored in the World by the Before hook. `path` = where the image is saved
        //(project root); Date.now() makes each file name unique so screenshots don't overwrite each other.
        await this.page.screenshot({ path: `screenshot-cucumber-${Date.now()}.png` });
    }
});

//Runs after EVERY scenario, pass OR fail. Use it to clean up: delete test data, clear cookies, close the browser...
After(async function () {
    console.log('Iam last to execute'); //demo log: proves the After hook runs once the scenario is finished
    //Playwright Test used to close the browser for us; with Cucumber we do it. Otherwise the open browser
    //keeps Node alive after the run (that's why the lecture needed --exit).
    if (this.browser) {
        await this.browser.close();
    }
});

//Runs ONCE after the last scenario. Counterpart of BeforeAll (e.g. global cleanup).
AfterAll(async function () {
    //Any global cleanup after all scenarios can go here.
});
