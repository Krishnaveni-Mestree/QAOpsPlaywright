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


  //retries is a GLOBAL/project-level setting (not inside "use") - it only applies after a whole test
  //run finishes, re-running whatever failed. retries:1 = re-run a failed test once more; if it passes
  //on that retry, the HTML report marks it "flaky" (not "passed") since it didn't pass on attempt 1 -
  //only a test that never passes even after all retries is reported as truly "failed".
  retries:1,



  
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */

  reporter: 'html',  //generates an HTML report; view it with "npx playwright show-report" (opens playwright-report/index.html)
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  
  
  use: {

    trace: 'retain-on-failure',
    
    screenshot: 'only-on-failure',

    headless: false,  //false indicates the browser will be launched in headed mode (visible UI)

    actionTimeout: 10 * 1000,
    
    navigationTimeout: 30 * 1000,
  },

  /* Configure projects for major browsers */
  //by default tests run headless (no visible browser UI); pass --headed flag to npx playwright test to see the browser.
  //use test.only(...) on a single test to skip all other tests while developing/debugging.
  projects: [
    {
      name: 'chrome',
      use: { 
        browserName: 'chromium',
        headless: true,  //false indicates the browser will be launched in headed mode (visible UI)
        screenshot: 'only-on-failure',
        trace:'on',
        viewport: { width: 720, height: 720 },
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    {
      name: 'safari',
      use: { 
        browserName: 'webkit',
        headless: false,  //false indicates the browser will be launched in headed mode (visible UI)
        screenshot: 'only-on-failure',
        trace:'on',
        ...devices['Desktop Safari'],
        ignoreHTTPSErrors: true,  //auto-accepts the "connection is not private" SSL warning instead of needing a manual "Advanced > Proceed" click
        permissions: ['geolocation'],  //auto-grants the "this site wants to know your location" browser prompt instead of it blocking the test
        video: 'retain-on-failure',  //records a .webm video per test, keeps it only if the test fails (same on/off/retain-on-failure pattern as screenshot/trace) - view it from the HTML report alongside the trace and screenshots
      },
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

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
