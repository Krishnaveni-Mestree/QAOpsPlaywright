//ES6 CLASS wraps all API-testing helper methods in one reusable object - any spec file can create one
//instance and call createOrder()/getToken() through it, instead of duplicating raw apiContext.post(...)
//calls inline in every test (compare to the "before" version in 59_api-ui-mix.spec.js).
class APIUtils {

    //constructor runs automatically the instant `new APIUtils(...)` is called from a test - whatever
    //arguments are passed there land on these parameters.
    constructor(apiContext, loginPayload){
        //`this` refers to the CURRENT instance - attaching apiContext/loginPayload to it (instead of
        //leaving them as plain constructor-local parameters) is what makes them reachable from every
        //OTHER method below (getToken/createOrder), not just inside the constructor body itself.
        this.apiContext = apiContext;
        this.loginPayload = loginPayload;
    }

    //MANDATORY via the constructor (not an optional method argument) because every API call this class
    //can make needs a valid session first - forcing apiContext+loginPayload through the constructor
    //means no method on this class can be used without a login already wired up.
    async getToken(){
        const loginResponse = await this.apiContext.post('https://rahulshettyacademy.com/api/ecom/auth/login',{
                data: this.loginPayload
            })
        const loginResponseJson = await loginResponse.json();
        const token = loginResponseJson.token;
        console.log(token);
        return token
    }

    //orderPayload is NOT taken through the constructor (unlike apiContext/loginPayload) because it's
    //unique per test case (different country/product each time) - passing it as a method argument lets
    //every test call createOrder() with its own data while reusing the same logged-in apiUtils instance.
    async createOrder(orderPayload){
        let response={};
        response.token=await this.getToken();

        const orderResponse=await this.apiContext.post('https://rahulshettyacademy.com/api/ecom/order/create-order',{
                data: orderPayload,
                headers:{
                    //calling this.getToken() here means createOrder() always logs in fresh on its own -
                    //correct, but redundant if a caller ALSO calls getToken() separately beforehand (see
                    //61_Refactor-1.spec.js's first test) - caching this token instead of refetching it
                    //is exactly the "one more refactor" the lecture defers to next time.
                    'Authorization' : response.token,
                    'content-Type' : 'application/json'
                }
            })
        const orderResponseJson=await orderResponse.json();
        console.log(orderResponseJson);
        const orderID=orderResponseJson.orders[0];
        console.log(orderID);
        response.orderID=orderID
        
        return response;

    }
}

//exporting the CLASS ITSELF (not wrapped in an object) - matches how spec files import it:
//`const APIUtils = require('../../utils/APIUtils')`, then `new APIUtils(...)` directly.
module.exports = APIUtils;