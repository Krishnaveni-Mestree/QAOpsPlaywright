//Conceptual lecture only - no code shown yet (route() syntax/params come in lecture 69), so no test() below.

// INTERVIEW TOPIC: "Network interception / response mocking with Playwright"
// RECAP OF HOW THE APP ACTUALLY WORKS (sets up WHY mocking is needed):
// - Every screen on the client app is driven by an API call you can see in DevTools -> Network tab:
//   login POST returns a token, "get all products" GET returns the product list rendered on the
//   products page, "get orders for a customer (by customerId)" GET returns the array rendered on
//   the Orders page. The frontend doesn't "know" anything - it just paints whatever JSON the API
//   call returned (product names/images/prices, order product/description/quantity, etc. all come
//   straight from that response body).

// THE SCENARIO THAT NEEDS TESTING: an "empty state" message
// - When a customer has ZERO orders, the Orders page is supposed to show a friendly
//   "Sorry, there are no orders to display" message (locator used in the lecture: a class like
//   `.empty-fork` / an empty-state icon+text block).
// - To verify that message renders, you need an account whose "get orders" API response is
//   genuinely empty/null for that session.

// THE WRONG WAYS TO GET AN "EMPTY ORDERS" ACCOUNT (both called out explicitly in the lecture):
// 1) Hardcoding a specific real account that "currently" has no orders.
//    PROBLEM: this is shared test data - another teammate (or another automated suite) can place
//    an order on that same account later for unrelated testing. The moment that happens, your
//    empty-state test silently stops hitting the empty case and starts failing for a reason that
//    has NOTHING to do with a real bug in your app - it's a false failure caused by bad test data,
//    not a product defect.
// 2) Deleting ALL existing orders on an account as a "test setup" step before running the test.
//    PROBLEM: that account/data may be shared - other people or other automated tests could be
//    actively relying on those exact orders existing (e.g. another test searching for a specific
//    order by ID). Wiping them out as a side effect of YOUR test destroys someone else's state and
//    is not an accurate way to reproduce "no orders" anyway, since it mutates real backend data.

// THE RIGHT WAY: intercept/mock the network RESPONSE instead of touching real data
// - Request/response flow recap: browser fires request -> server returns response -> frontend reads
//   that response and renders it. Playwright can sit in the middle of that flow and, right before the
//   response reaches the browser, SWAP IT for a fake response you define (e.g. an empty array/null
//   for the orders call) - the UI then renders the empty-state message exactly as if the real backend
//   had returned no orders, with zero real data ever being deleted or modified.
// - Scope/lifetime: this faked response only exists for that one automated browser session/context.
//   Close the browser and everything is back to normal - the real account's real orders are
//   completely untouched the whole time. This also means the SAME account can safely be reused by
//   this test over and over without ever caring how many real orders it currently has.
// - Bonus use case mentioned: this same technique also lets you catch REAL bugs. If the empty-state
//   message is supposed to show whenever the orders response is empty/null but there's a bug where
//   it doesn't, you can deterministically force that exact response with mocking and assert the
//   message appears - without needing to hunt for (or fabricate) a real account in that state.
// - This general technique goes by a couple of interchangeable names in the lecture: "intercepting
//   network calls" and "mocking the response".

//NEXT LECTURES (not covered here yet - will revisit with real code):
//  69 - the actual `route()` method and its parameters, used to intercept a RESPONSE and fulfill it
//       with fake data (this is what implements everything described above).
//  71 - intercepting the REQUEST side (e.g. inspecting/altering what the browser sends out).
//  73 - aborting network calls entirely (simulating a failed/blocked request).

//CURRENT PLAYWRIGHT API NOTE (not in this lecture, still accurate/unchanged going into 69-73):
// the method is `page.route(urlOrGlob, handler)` (or `context.route(...)` to apply it to every page
// in that browser context at once), paired with `route.fulfill({...})` to send the fake response,
// `route.continue()` to let the real request through unmodified, or `route.abort()` to kill it.
//MODERN ADDITION worth knowing for interviews (didn't exist when this course was recorded):
// `route.fetch()` lets you fetch the REAL response first and then selectively tweak just a field or
// two before calling `route.fulfill({ response, json: {...} })` - useful when you only want to fake
// ONE part of a response (e.g. force `orders: []`) instead of hand-writing the entire fake payload.
