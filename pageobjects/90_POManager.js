const { LoginPage } = require('./88_LoginPage.js');
const { DashboardPage } = require('./89_1Dashboard.js');
const { CartPage } = require('./89_2CartPage.js');
const { OrdersReviewPage } = require('./89_3OrdersReviewPage.js');
const { OrderHistoryPage } = require('./91_OrderHistoryPage.js');

//PAGE OBJECT MANAGER: a single "factory/repository" class that creates and holds ONE instance of every
//page object the test suite needs - without this, a test touching N pages would need N separate
//`require()` imports and N separate `new XPage(page)` calls; with this, it needs just one of each.
class POManager {
    //constructor runs once per test (see `new POManager(page)` in the spec) - `page` is accepted here
    //and handed down to EVERY page object it creates below, so each one shares the same browser page.
    constructor(page) {
        this.page = page;
       //all page objects are created UP FRONT, in one place, the moment the manager itself is created -
       //the test never calls `new LoginPage(...)` etc directly anymore, only POManager does that.
       this.loginPage = new LoginPage(this.page);
       this.dashboardPage = new DashboardPage(this.page);
       this.cartPage = new CartPage(this.page);
       this.ordersReviewPage = new OrdersReviewPage(this.page);
       this.orderHistoryPage = new OrderHistoryPage(this.page);
    }

    //these getter methods are the ONLY way the test interacts with individual page objects now - the
    //test asks the manager "give me the login page" instead of constructing it itself.
    getLoginPage() {
        return this.loginPage;
    }

    getDashboardPage() {
        return this.dashboardPage;
    }

    getCartPage() {
        return this.cartPage;
    }

    getOrdersReviewPage() {
        return this.ordersReviewPage;
    }

    getOrderHistoryPage() {
        return this.orderHistoryPage;
    }
}

module.exports = { POManager };