//ORDER HISTORY PAGE: covers BOTH the orders list screen and the order-details screen reached after
//clicking into one row - the transcript explains these were combined into one page object because the
//details screen only has a single locator worth checking, so a separate class for it would be overkill.
class OrderHistoryPage {
    constructor(page) {
        this.page = page;
        this.rows = page.locator("tbody tr");
        //this one locator is the ENTIRE reason the details screen didn't get its own class - it's all
        //we ever need to check once we land there.
        this.orderIdDetails = page.locator(".col-text");
    }

    //orderId is a METHOD param (coming from whatever OrdersReviewPage.SubmitAndGetOrderId() returned) -
    //this works for whichever order was just placed, not a hardcoded one.
    async selectOrderByOrderId(orderId) {
        //table loads asynchronously (spinner first) - without this wait, rows.count() below could run
        //too early and read 0.
        await this.page.locator("tbody").waitFor();
        const count = await this.rows.count();
        //scan every row instead of assuming a fixed position - the newest order isn't guaranteed to be
        //first/last if other orders exist.
        for (let i = 0; i < count; ++i) {
            const rowOrderId = await this.rows.nth(i).locator("th").textContent();
            //includes() (not ===) because orderId can carry leading/trailing characters around the raw
            //id that this cell's trimmed text won't have.
            if (orderId.includes(rowOrderId)) {
                //each row has 2 buttons (View + Delete) - .first() picks View, the leftmost one.
                await this.rows.nth(i).locator("button").first().click();
                break;
            }
        }
    }

    //returns a boolean (doesn't assert internally) - same pattern as CartPage.VerifyProductIsDisplayed,
    //keeps the actual expect() call in the test file, not buried inside the page object.
    async verifyOrderIdIsDisplayed(orderId) {
        const orderIdDetails = await this.orderIdDetails.textContent();
        return orderId.includes(orderIdDetails);
    }
}

module.exports = { OrderHistoryPage };
