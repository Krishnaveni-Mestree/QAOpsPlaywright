const { test, expect , request } = require('@playwright/test');
const APIUtils = require('../../utils/APIUtils');


const loginPayload = {userEmail: "mkrishnaveni1102@gmail.com", userPassword: "Qazmlp@1505"}
const orderPayload= {orders: [{country: "Cuba", productOrderedId: "6960eae1c941646b7a8b3ed3"}]}
//this is the body we will forcibly inject in place of the REAL "my orders" response, so the UI renders
//an empty-orders state on demand - this is how we test the "no orders" scenario without needing an
//account that genuinely has zero orders in the backend.
const fakePayloadResponse = {data: [], message: "No Orders"}


let response;

test.beforeAll(async ()=>{
    const apiContext= await request.newContext();
    const apiUtils=new APIUtils(apiContext,loginPayload)
    //we still create a real order here (reused from the web+API mix tests) - it doesn't interfere with
    //this test because we are about to fake the GET call that displays orders, so whatever actually
    //exists in the backend becomes irrelevant to what the browser shows.
    response = await apiUtils.createOrder(orderPayload);

})


test('@Web @api @sp- intercepting response', async ({ page })=>{
    
    page.addInitScript((val)=>{
        window.localStorage.setItem('token', val);
    }, response.token);

    await page.goto('https://rahulshettyacademy.com/client/')
    
    //page.route() tells Playwright, IN ADVANCE, to keep watching for any network call matching this URL.
    //this MUST be set up before the UI action that triggers the call (the "my orders" click below) -
    //registering a route after the call has already fired has no effect, since Playwright can only
    //intercept calls it was already listening for.
    await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*",async route=>{
        //switching page into "API testing helper" mode via page.request lets us manually fire the real
        //request and get the real response back - route.request() carries only the request info (URL,
        //headers etc), so we explicitly fetch() it to pull the actual response that the backend sent.
        const response=await page.request.fetch(route.request());
        //fulfill() expects body as a JSON STRING, not a raw JS object - JSON.stringify() converts our
        //plain JavaScript object into the JSON standard the frontend expects to parse.
        let body = JSON.stringify(fakePayloadResponse);
        //route.fulfill() is what actually sends the (now faked) response back down to the browser -
        //passing `response` keeps all the original headers/status/etc, but explicitly overriding `body`
        //replaces just the payload with our fake one before the frontend ever sees the real data.
        route.fulfill({
            response,
            body
        })
        //intercepting response - Api response ->||fake response||->browser-> render data on frontend
        //full picture: real API response -> we intercept it here -> swap in our fake body -> fulfill()
        //sends THAT to the browser -> frontend renders "no orders" based on the fake body, not reality.
    });

    //wildcard (*) at the end of the URL instead of a hardcoded customer id - makes the route match
    //regardless of which logged-in user's id appears in the URL, so this script isn't tied to one
    //hardcoded account and keeps working if you swap in your own signup credentials.
    await page.locator("button[routerlink*='myorders']").click();
    //without this wait, fulfill() can race ahead of the real response finishing (page.request.fetch is
    //still in flight) and throw "Request context disposed" - waitForResponse pauses here until the real
    //network round trip completes, so by the time the route handler runs, the original response is
    //already safely back and ready to be faked.
    await page.waitForResponse("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*");
   
    //printing the actual DOM text instead of pausing - confirms the frontend genuinely rendered our fake
    //"No Orders" message, proving the interception worked end-to-end.
    console.log(await page.locator('.mt-4').textContent());


})

