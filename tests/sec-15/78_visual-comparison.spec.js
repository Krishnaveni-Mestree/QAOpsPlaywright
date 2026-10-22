const { test, expect } = require('@playwright/test');

//visual comparison demo using Playwright's built-in screenshot comparison
//toMatchSnapshot() does PIXEL-LEVEL comparison, not just DOM/text assertions - catches things normal
//assertions can't, like misaligned buttons, missing elements, or shifted layout.
//FIRST RUN ALWAYS "FAILS" ON PURPOSE: there's no baseline image yet, so playwright auto-generates
//'baseline-screenshot.png' into a __snapshots__ folder next to this spec file and reports it missing -
//that's expected, not a real bug; every SUBSEQUENT run compares against that saved baseline instead.
//IMPORTANT: only use this on pages/content that are visually STABLE run-to-run - a page with a live
//clock, rotating news, or any other constantly-changing element will fail every time even with zero
//real bugs, since the comparison is exact-pixel, not "close enough" (that's why google.com's static
//logo works here but a news homepage or anything showing a timestamp would not).
test('@Web visual comparison demo', async ({ page }) => {
    await page.goto('https://www.google.com/')
    expect(await page.screenshot()).toMatchSnapshot('baseline-screenshot.png');
});