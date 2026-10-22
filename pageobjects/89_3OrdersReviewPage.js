//ORDERS REVIEW PAGE: the checkout/review screen reached after clicking Checkout on the cart - country
//selection, placing the order, and reading back the generated order id all belong to THIS screen, which
//is why they're split out of CartPage instead of being bundled in there.
class OrdersReviewPage {
    constructor(page) {
        this.page = page;
        this.dropdown = page.locator(`[placeholder*='Country']`);
        this.countryOptionsDropdown = page.locator('.ta-results');
        this.placeOrderButton = page.locator('.action__submit');
        this.thankYouMessage = page.locator('.hero-primary');
        this.orderIdText = page.locator('.em-spacer-1 .ng-star-inserted');
    }

    //two separate params on purpose: searchText is what gets TYPED (can be a partial match like "ind"),
    //selectText is the exact option label to click - lets you type less than the full country name while
    //still picking the right option out of several partial matches (e.g. "ind" also matches Indonesia).
    async searchCountryAndSelect(searchText, selectText) {
        //pressSequentially (not fill) because this is an autocomplete field - suggestions only render
        //after the app sees individual keystrokes, which fill() skips by setting the value in one go.
        await this.dropdown.pressSequentially(searchText, { delay: 150 });
        await this.countryOptionsDropdown.locator('button').first().waitFor();
        const optionsCount = await this.countryOptionsDropdown.locator('button').count();
        for (let i = 0; i < optionsCount; ++i) {
            const text = await this.countryOptionsDropdown.locator('button').nth(i).textContent();
            //endsWith (not ===) tolerates the option's visible text having extra leading content.
            if (text.trim().endsWith(selectText)) {
                //force:true bypasses an invisible overlay sibling that can otherwise intercept the click.
                await this.countryOptionsDropdown.locator('button').nth(i).click({ force: true });
                break;
            }
        }
        //confirm the dropdown actually closed (selection accepted) before moving on to placing the order.
        await this.countryOptionsDropdown.waitFor({ state: 'hidden' });
    }

    //combines placing the order with reading back the id it generated - callers only need the id, not
    //the intermediate steps, so this is exposed as one method instead of two.
    async SubmitAndGetOrderId() {
        await this.placeOrderButton.click();
        //wait for the confirmation screen to actually render before reading the order id off it -
        //without this, textContent() below could run before the page navigates/updates.
        await this.thankYouMessage.waitFor();
        return await this.orderIdText.textContent();
    }
}

module.exports = { OrdersReviewPage };
