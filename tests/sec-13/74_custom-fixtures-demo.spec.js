const { test, expect } = require('@playwright/test');
//importing customTest (not the plain `test`) is mandatory - only the test object returned by
//base.test.extend() in fixtures.js knows how to resolve the custom `authenticatedPage` fixture below.
//Using the plain `test` here instead would throw an error, since it has never heard of that fixture name.
const {customTest} = require('../../utils/74_fixtures');

//destructuring `{authenticatedPage}` as the test's parameter (instead of the usual `{page}`) is exactly
//how custom fixtures get wired in - playwright matches this parameter NAME against the fixture name
//defined in fixtures.js, runs that fixture's login logic first, then hands back the already-logged-in
//page object under this same name - so `authenticatedPage` behaves just like `page`, except pre-authenticated.
customTest('@Web fixtures demo', async({authenticatedPage})=>{
    //login to application.create and verify id the created from history page
    //this goto() will land directly on the dashboard - no login screen - because the fixture already
    //authenticated this exact page/context before this test body ever started executing.
    authenticatedPage.goto('https://rahulshettyacademy.com/client/')
})