//SECTION 11 - API + UI INTEGRATION: using API calls to make web automation faster/more stable, not
//API testing in isolation. Like files 6-8, this is pure notes on the CONCEPT - the actual Playwright
//implementation (making the login API call, extracting the token, injecting it into the browser)
//is built in the next lecture's spec file, which is why there's no test() below yet.

//1) HOW MOST MODERN WEB APPS AUTHENTICATE (API-DRIVEN)
//   - Submitting a login form doesn't validate anything in the browser itself - the frontend sends
//     an HTTP request (visible in DevTools Network tab) to a backend login API, with the typed
//     email/password as the JSON request payload.
//   - The backend validates credentials and responds with JSON containing a TOKEN (and often a
//     userId) - this token is the proof-of-login, not the email/password themselves.
//   - The frontend JS then stores that token in the browser's localStorage (DevTools: Application
//     tab -> Storage -> Local Storage -> look for a 'token' key) - every subsequent page load reads
//     this token to decide "is this user logged in" instead of asking for credentials again.

//2) WHY A NEW TAB STAYS LOGGED IN, BUT INCOGNITO DOESN'T
//   - A new tab in the SAME browser profile shares the same localStorage - the app finds the existing
//     token and treats you as already authenticated, skipping the login screen entirely.
//   - Incognito/private mode starts with empty storage (no cookies/localStorage carried over), so
//     there's no token to find - the app correctly asks you to log in again.
//   - Proof-of-concept: manually pasting a still-valid token into Incognito's localStorage (via
//     DevTools) and reloading logs you in WITHOUT ever submitting the login form - this is the exact
//     mechanic the next lecture automates.

//3) WHY THIS MATTERS FOR TEST AUTOMATION
//   - If 50 UI test cases all start by driving the real login form (load page -> fill email -> fill
//     password -> click submit -> wait for redirect), that's 4-5+ seconds of slow/flaky UI interaction
//     PER TEST, repeated 50 times, just to reach a logged-in state before the real test logic starts.
//   - A direct API call to the same login endpoint returns the token in milliseconds - no page
//     rendering, no flaky selectors, no waiting on a form to become interactive.
//   - Plan: call the login API directly from Playwright, grab the token out of the JSON response,
//     inject it into the browser's localStorage ourselves, then load the target page directly -
//     the app sees a valid token and treats the session as already authenticated, skipping the
//     login UI entirely while still exercising a REAL, valid session (not a mock).
//   - This doesn't mean "never test the login UI" - keep one dedicated login test that exercises the
//     real form; every OTHER test that merely NEEDS to be logged in (e.g. create order, view orders)
//     shouldn't re-pay that cost.

//NEXT LECTURE: implement this with Playwright - use its built-in API testing support (request
//context) to call the login endpoint, read the token from the JSON response, inject it into
//localStorage via the browser context, then navigate straight to an authenticated page.
