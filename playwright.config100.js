// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 40*1000,
  expect:{
    timeout:20*1000,
  },

  retries:1,

  //workers controls how many spec FILES run in parallel (default is up to 5) - each worker is its own
  //test execution process/browser instance. Tests within the SAME file always run serially regardless
  //of this setting - only different files get distributed across workers. workers:1 disables
  //parallelism entirely (one file at a time); workers:3 here caps it to 3 files running at once.
  workers:3,

  reporter: 'html',

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: false,
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
  },

  projects: [
    {
      name: 'chrome',
      use: { 
        browserName: 'chromium',
        headless: true,
        screenshot: 'only-on-failure',
        trace:'on',
        viewport: { width: 720, height: 720 },
      },
    },

    {
      name: 'safari',
      use: { 
        browserName: 'webkit',
        headless: false,
        screenshot: 'only-on-failure',
        trace:'on',
        ...devices['Desktop Safari'],
        ignoreHTTPSErrors: true,
        permissions: ['geolocation'],
        video: 'retain-on-failure',
      },
    },
  ],
});
