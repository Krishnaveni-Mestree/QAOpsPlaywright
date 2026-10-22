const { test, expect } = require('@playwright/test');

//"OTHER WAY" of writing the same end-to-end flow as ClientApp.spec.js (CSS locators + manual
//for-loops/if-conditions to scan cards/buttons/dropdown options) - this version instead leans on
//Playwright's special locators (getByPlaceholder/getByRole/getByText) + locator.filter()/nth() to
//replace most of that manual scanning in a single chained step. Both arrive at the same result;
//which style to use in a real project often comes down to company convention (some teams mandate
//CSS-only across the framework) rather than one being objectively better.
test('@Web @Webst Client App login', async ({ page }) => {
    const email = "anshika@gmail.com";
    const productName = 'ZARA COAT 3';
    const products = page.locator(".card-body");

    await page.goto("https://rahulshettyacademy.com/client");

    //getByLabel doesn't work here (no wrapping/for-id association on this page's email/password
    //fields - see the getByLabel explanation test above), so placeholder is the fallback locator.
    await page.getByPlaceholder("email@example.com").fill(email);
    //NOTE: "passsword" (3 s's) is NOT a typo in this test - it's a real bug in the app's own
    //placeholder text. Placeholder-based locators are brittle exactly because of this: if the app
    //ever fixes the typo, this locator silently breaks - a CSS/id locator wouldn't care either way.
    await page.getByPlaceholder("enter your passsword").fill("Iamking@000");
    await page.getByRole('button', { name: "Login" }).click();

    await page.waitForLoadState('networkidle');
    //no getByRole/getByLabel/getByText equivalent exists for "wait until the product grid has
    //rendered" - it's a plain div/component, so a CSS locator is still required for this one wait.
    await page.locator(".card-body b").first().waitFor();

    //CHAINED REPLACEMENT for the old for-loop: .filter({ hasText }) narrows all product cards down
    //to the one containing productName, then getByRole('button', { name }) - scoped to just that
    //card - finds its own "Add to Cart" button (each card has 2 buttons, so the name disambiguates).
    //One locator chain replaces "loop all cards -> read text -> compare -> click" entirely.
    await page.locator(".card-body").filter({ hasText: "ZARA COAT 3" })
        .getByRole("button", { name: "Add to Cart" }).click();

    //GOTCHA: a bare getByRole('button', { name: 'Cart' }) matches 4 buttons (regex-style substring
    //match against "Cart" hits "Add to Cart" too) - scoping through the parent getByRole('listitem')
    //first narrows the search to only the nav's list items before picking the Cart button inside it.
    await page.getByRole("listitem").getByRole('button', { name: "Cart" }).click();

    //same reasoning as ClientApp.spec.js's `div li` wait - no role/placeholder/text method exists
    //for "wait until the cart page's rows exist", so CSS is still the right tool for this wait.
    await page.locator("div li").first().waitFor();
    //getByText + toBeVisible() replaces the old `h3:has-text(...)` + isVisible() + toBeTruthy()
    //combo - functionally the same check (product name shows up in the cart), fewer moving parts.
    await expect(page.getByText("ZARA COAT 3")).toBeVisible();

    await page.getByRole("button", { name: "Checkout" }).click();

    //pressSequentially (not fill) because this is an autocomplete/typeahead field that only reacts
    //to individual keystrokes - same reasoning as the dropdown in ClientApp.spec.js.
    await page.getByPlaceholder("Select Country").pressSequentially("ind");
    //GOTCHA: "India" substring-matches BOTH "India" and "British Indian Ocean Territory" - nth(1)
    //picks the second match (index 1) instead of looping through every option and comparing text
    //like the CSS version does.
    await page.getByRole("button", { name: "India" }).nth(1).click();

    //GOTCHA: the "PLACE ORDER" element is an <a> (link) tag styled with a button CSS class, so
    //getByRole('button', ...) would miss it entirely (wrong ARIA role for its actual markup).
    //getByText sidesteps the role mismatch - it just finds the text and clicks whatever it's on.
    await page.getByText("PLACE ORDER").click();

    await expect(page.getByText("Thankyou for the order.")).toBeVisible();
});

//ASSIGNMENT (left for practice, same as ClientApp.spec.js's order-lookup section): after this
//point, navigate to the Orders tab, scan the order rows to find the one matching this order's id,
//open it, and confirm the order details page shows the same id - not yet automated here.
