// @ts-check
import { defineConfig, devices } from '@playwright/test';


/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',   //it tells which files/file have to run 
  //overall per-test budget (goto + every action/assertion combined) - a test is killed once this
  //elapses, regardless of where it's stuck. Can be overridden per test with test.setTimeout(ms).
  timeout: 40*1000,   //specifies the maximum time one test can run for (default playwright timeout is 30s, overridden here to 40s)
  expect:{
    timeout:20*1000,  //this specifies assertion validations - separate timeout exclusively for expect() calls (default is also 5s)
  },



  
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */

  reporter: 'html',  //generates an HTML report; view it with "npx playwright show-report" (opens playwright-report/index.html)
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  
  
  use: {
    
    trace: 'retain-on-failure',
    
    //screenshot accepts 3 values: 'off' (never capture), 'on' (capture after every test, pass or fail),
    //'only-on-failure' (capture only when the test fails) - this top-level value is just a fallback,
    //each project below sets its own screenshot value which overrides this one.
    screenshot: 'only-on-failure',

    headless: false,  //false indicates the browser will be launched in headed mode (visible UI)

    actionTimeout: 10 * 1000,
    
    navigationTimeout: 30 * 1000,
  },

  //THIS IS A CUSTOM/SECOND CONFIG FILE, not the default playwright.config.js - Playwright only uses it
  //when you explicitly pass --config, e.g.: npx playwright test --config=playwright.config97.js
  //If you omit --config, Playwright silently falls back to the default playwright.config.js instead.

  /* Configure projects for major browsers */
  //by default tests run headless (no visible browser UI); pass --headed flag to npx playwright test to see the browser.
  //use test.only(...) on a single test to skip all other tests while developing/debugging.
  //Rather than creating a brand new config file every time you need a different browser/settings
  //combo, you can parameterize it all in ONE file via multiple named "projects" below - each project
  //has its own name + its own "use" block that overrides the top-level "use" settings above.
  projects: [
    {
      //"chrome" project - run only this one with: npx playwright test --config=playwright.config97.js --project=chrome
      name: 'chrome',
      use: { 
        browserName: 'chromium',
        headless: true,  //true here means headless (no visible browser UI) for this project
        screenshot: 'only-on-failure',
        trace:'on',
        ...devices['Desktop Safari'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    {
      //"safari" project - run only this one with: npx playwright test --config=playwright.config97.js --project=safari
      name: 'safari',
      use: { 
        browserName: 'webkit',
        headless: false,  //false indicates the browser will be launched in headed mode (visible UI) for this project
        screenshot: 'only-on-failure',
        trace:'on',
        ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
  //If you run without --project at all (just --config=playwright.config97.js), Playwright runs EVERY
  //project in this array one after another (chrome, then safari here) - handy for true cross-browser
  //runs without extra flags. Note: --project value must exactly match a project's "name" above,
  //otherwise you get a "Project(s) not found" error (also watch for accidental spaces around the "=").

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});









