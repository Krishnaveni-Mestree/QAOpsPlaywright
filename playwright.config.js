// @ts-check
import { defineConfig, devices } from '@playwright/test';

//this config file is the heart of the project - decides what tests to run, on which browser, timeouts, reporting etc.
//npx playwright test -> npx finds the playwright module path in node_modules automatically, then triggers this config file,
//which in turn triggers whatever tests are present inside testDir.
//defineConfig() just takes all our key-value settings as one object and exports it, so it is available project-wide.

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

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

  
  
  reporter: 'html',  //generates an HTML report; view it with "npx playwright show-report" (opens playwright-report/index.html)
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  
  
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    //trace values: 'off' | 'on' (always, every test) | 'on-first-retry' | 'on-all-retries' | 'retain-on-failure'
    //(keep the trace only if that test ultimately failed, delete it if passed). 'on' is great for learning/debugging
    //every single test, but at scale (100s of tests) it generates a trace.zip per test regardless of outcome,
    //which wastes disk space - 'retain-on-failure' gives the same debugging info only where it's actually needed.
    //Open a trace with: npx playwright show-trace <path-to-trace.zip>, or drag/drop the zip onto https://trace.playwright.dev/
    trace: 'retain-on-failure',
    //screenshot values: 'off' | 'on' (every step, every test) | 'only-on-failure' - same memory tradeoff as trace above;
    //'only-on-failure' is the recommended default once you're past initial debugging/demoing to stakeholders.
    screenshot: 'only-on-failure',

    headless: false,  //false indicates the browser will be launched in headed mode (visible UI)

    //actions (click/fill/check etc.) have NO built-in default timeout like expect() does - without
    //this, a stuck action would just keep retrying until the whole-test `timeout` above expires,
    //wasting the remaining budget. Can be overridden per test with page.setDefaultTimeout(ms), or
    //per step by passing { timeout } as the action's own option.
    actionTimeout: 10 * 1000,
    //only applies to page.goto()/navigations - everything else (actions, assertions) ignores this.
    //if unset, a slow goto() would instead fall back to eating the whole-test `timeout` above.
    navigationTimeout: 30 * 1000,
  },

  /* Configure projects for major browsers */
  //by default tests run headless (no visible browser UI); pass --headed flag to npx playwright test to see the browser.
  //use test.only(...) on a single test to skip all other tests while developing/debugging.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

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

