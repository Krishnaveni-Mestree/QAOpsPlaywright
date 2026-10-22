//CART PAGE: scoped to just the cart screen - verifying the added product is there, and moving on to
//checkout. Country selection/order placement is a SEPARATE page (OrdersReviewPage), since that's a
//different screen in the app with its own distinct locators/responsibilities.
class CartPage {
    constructor(page) {
        this.page = page;
        this.checkoutButton = page.locator(`text=Checkout`);
    }

    //productName is a METHOD param (not hardcoded) - this works for whichever product the test added.
    async VerifyProductIsDisplayed(productName) {
        //wait for ANY cart row first - isVisible() below has no built-in auto-wait, so without this the
        //check could run before the cart has finished rendering and return a false negative.
        await this.page.locator('div li').first().waitFor();
        return await this.page.locator(`h3:has-text('${productName}')`).isVisible();
    }

    async Checkout() {
        await this.checkoutButton.click();
    }
}

module.exports = { CartPage };