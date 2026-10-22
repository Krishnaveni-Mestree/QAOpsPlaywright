//HOOKS FILE (Tags lesson): same hooks as 121_hooks.js, now explaining TAGGED HOOKS.
//Hooks live in features/support/, separate from the step definitions in features/step_definitions/. They run
//automatically - no step text needed, they apply to EVERY scenario unless you restrict them with a tag.
//NOTE: cucumber.js `require` must list this file too, otherwise Cucumber never loads these hooks.
//
//HOOK EXECUTION ORDER (for a feature with 1 scenario and N steps):
//  BeforeAll -> Before -> [BeforeStep -> step -> AfterStep] x N -> After -> AfterAll
//  BeforeAll / AfterAll   : run ONCE for the whole test run (even with 5 scenarios).
//  Before / After         : run once PER SCENARIO (5 scenarios = 5 times).
//  BeforeStep / AfterStep : run around EVERY single step (10 steps = 10 times).
//
//TAGGED HOOKS: pass an options object as the FIRST argument and the hook runs ONLY for scenarios having that tag:
//    Before({ tags: '@Validations' }, async function () { ... })          -> only @Validations scenarios
//    Before({ tags: '@Validations or @Smoke' }, ...)                      -> scenarios with ANY of the tags
//    Before({ tags: '@Validations and @Smoke' }, ...)                     -> scenarios that have BOTH tags
//  No first argument (what we use below) = runs for EVERY scenario.
//  WARNING (seen in the lecture): if the tag in the hook does NOT match the scenario being run
//  (e.g. hook says '@foo', scenario is '@Validations'), the hook is skipped. Then this.page / this.poManager are
//  never created and the steps fail with "undefined". Our Before is untagged on purpose, because every scenario needs a browser.

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

//Runs before EVERY scenario (no tag given). Must be a normal `function` (not an arrow) so `this` is the
//scenario's World, which is how hooks and steps share data: whatever we store on `this` is read as `this.xxx` in any step.
Before(async function () {
    this.browser = await chromium.launch({ headless: false }); //stored so the After hook can close it
    const context = await this.browser.newContext();
    this.page = await context.newPage();                       //this.page: used by steps and by AfterStep for screenshots
    this.poManager = new POManager(this.page);                 //steps use this.poManager.getXxxPage()
});

//Runs before EVERY STEP (each Given/When/Then line in the feature file). 5 steps = 5 runs.
BeforeStep(async function () {
    //Any setup needed before each step can go here.
});

//Runs after EVERY STEP, pass or fail. Cucumber hands us the step's outcome as `result`.
//Typical use: take a screenshot only when that step FAILED.
AfterStep(async function ({ result }) {
    if (result?.status === Status.FAILED) { //`?.` avoids errors if there is no result
        //path = where the image is saved (project root); Date.now() keeps file names unique.
        await this.page.screenshot({ path: `screenshot-cucumber-${Date.now()}.png` });
    }
});

//Runs after EVERY scenario, pass OR fail. Use it to clean up: delete test data, clear cookies, close the browser...
After(async function () {
    console.log('Iam last to execute'); //demo log: proves the After hook runs once the scenario is finished
    //With Cucumber we must close the browser ourselves, otherwise it keeps Node alive after the run.
    if (this.browser) {
        await this.browser.close();
    }
});

//Runs ONCE after the last scenario. Counterpart of BeforeAll (e.g. global cleanup).
AfterAll(async function () {
    //Any global cleanup after all scenarios can go here.
});
