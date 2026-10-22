const { test, expect } = require('@playwright/test');

test('@Web playwright test - client app login', async ({ page })=>{
    const userName = 'mkrishnaveni1102@gmail.com'
    const password='Qazmlp@1505'
    await page.goto('https://rahulshettyacademy.com/client/')
    await page.locator('#userEmail').fill(userName)
    await page.locator('#userPassword').fill(password)
    //[type$='submit'] - '$=' means attribute value ENDS WITH 'submit' (vs '*=' contains, used in UIBasicstest.spec.js);
    //pick the operator based on how much of the attribute value you actually know/trust to be stable.
    await page.locator(`[type$='submit']`).click()

    const cardTitles=page.locator('.card-body b')
    //waitForLoadState('networkidle') is DISCOURAGED in latest Playwright docs - SPAs with polling/websockets/analytics
    //keep network activity alive indefinitely, so 'networkidle' may never fire (or fire too early/late) - that's why it didn't work here.
    await page.waitForLoadState('networkidle');
    //when neworkildle lso not worked
    //CORRECT MODERN FIX for the allTextContents() flakiness trap: explicitly wait for the first matching element
    //to appear before reading the whole list - waitFor() defaults to state:'visible', so this blocks until
    //at least one product card is actually rendered, then allTextContents() below is safe to call.
    await cardTitles.first().waitFor()
    const allCardTitles=await cardTitles.allTextContents()
    console.log(allCardTitles)
})




test.only('@Web playwright test - client app e2e', async ({ page })=>{
    
    //PARENT locator holding ALL product cards (8 matches) - each card internally contains both the
    //product name (<b>) and its own "ADD TO CART" button, so this one locator is the scope we'll search within.
    const products=page.locator('.card-body ')
    const productName='ZARA COAT 3'

    const userName = 'mkrishnaveni1102@gmail.com'
    const password='Qazmlp@1505'
    await page.goto('https://rahulshettyacademy.com/client/')
    await page.locator('#userEmail').fill(userName)
    await page.locator('#userPassword').fill(password)
    await page.locator(`[type$='submit']`).click()

    const cardTitles=page.locator('.card-body b')
    
    await page.waitForLoadState('networkidle');
    await cardTitles.first().waitFor()
    
    const allCardTitles=await cardTitles.allTextContents()
    console.log(allCardTitles)

    //LOCATOR CHAINING/SCOPING: page.locator(...) searches the WHOLE page, but products.nth(i).locator(...)
    //restricts the search to only inside that specific card (parent->child scope) - this is how we read the
    //title/button of ONE product at a time instead of accidentally matching all 8 cards again.
    //count() tells you how many elements match products (8 here) so the loop knows how many iterations to run -
    //this makes the script work even if tomorrow there are 50 products instead of 8 (no hardcoded index).
    const count=await products.count()
    for(let i=0;i<count;++i){
        //COMMON PITFALL: textContent() can include leading/trailing whitespace from the markup - add .trim()
        //before the === comparison if this ever fails to match despite the text looking identical visually.
        if(await products.nth(i).locator('b').textContent()===productName){
            //add the item to cart
            //'text=...' is playwright's TEXT ENGINE selector - unquoted value does a trimmed, case-insensitive
            //SUBSTRING match (quote it exactly e.g. text="Add To Cart" for an exact match instead).
            //LATEST PLAYWRIGHT RECOMMENDATION: prefer getByRole('button', { name: /add to cart/i }) or getByText()
            //over the legacy 'text=' locator engine - they're more resilient to markup changes and accessibility-aware.
            await products.nth(i).locator(`text= Add To Cart`).click()
            break; //exit the loop once the product is added to the cart - no need to keep scanning remaining products
        }
    }
    //await page.pause()
    //[routerlink*='cart'] - contains-match on an Angular `routerlink` attribute, since the full value/class list
    //isn't unique/stable enough on its own to build a clean selector.
    await page.locator(`[routerlink*='cart']`).click()
    //SYNC ISSUE: isVisible() (below) has NO auto-wait built in (unlike click/fill which retry until actionable) -
    //it checks instantly and returns false if the cart page's items haven't rendered yet, even by a few hundred ms.
    //FIX: explicitly wait for a reliable "page is loaded" signal first. 'div li' alone matched 6+ elements
    //(strict-mode violation for methods that require a single match), so .first() is used purely to wait for
    //ANY one cart row to render - once one row shows up, the rest are effectively loaded too (no need to wait on all 6).
    await page.locator('div li').first().waitFor()
    //CSS pseudo-class :has-text('...') scopes the text search to elements with this specific h3 tag ONLY -
    //this avoids false positives from the earlier product-listing page's <b> tag also containing the same text
    //(a plain text= locator could wrongly match stale/leftover DOM from the page you're navigating away from).
    //BUG FIX: isVisible() alone does nothing without an assertion around it - wrap it in expect(...).toBeTruthy()
    //(as the transcript intends) so the test actually fails if the item isn't present in the cart.
    const isItemInCart = await page.locator(`h3:has-text('${productName}')`).isVisible();
    await expect(isItemInCart).toBeTruthy();
    //await page.pause()

    //text= locator used deliberately here (not CSS) because "Checkout" reads as a genuinely stable/unique label -
    //but per the transcript's caution, don't reach for text locators everywhere; only use them where the text
    //itself is unlikely to change (vs e.g. dynamic product names, counts, or other content-driven text).
    await page.locator(`text=Checkout`).click()
    //this is an AUTOCOMPLETE/typeahead field, not a native <select> - suggestions only render after the app's
    //JS sees individual keystrokes, so pasting the full value in one go (like fill() does) won't trigger them.
    const dropdown=page.locator(`[placeholder*='Country']`)
    //fill() dumps the whole string in one go (no keystroke events) and type() is deprecated - pressSequentially()
    //is the current recommended method specifically for typeahead/autosuggest fields that react to each keystroke;
    //{ delay: 150 } adds a pause between characters so the app's suggestion logic has time to respond.
    await dropdown.pressSequentially('ind', { delay: 150 });
    const countryOptionsDropdown = page.locator('.ta-results')
    //RACE CONDITION FIX: suggestions render asynchronously after the last keystroke - counting buttons
    //immediately could read 0 (list not painted yet), so wait for the first suggestion button to appear first.
    await countryOptionsDropdown.locator('button').first().waitFor()
    //countryOptionsDropdown.locator('button') is scoped chaining again - only searches buttons INSIDE the
    //suggestions popup, not the whole page, so count() here only reflects the visible suggestion options.
    const optionsCount=await countryOptionsDropdown.locator('button').count()
    for(let i=0;i<optionsCount;++i){
        const text=await countryOptionsDropdown.locator('button').nth(i).textContent()
        //endsWith('India') on the trimmed text safely matches only the "India" row - "Indonesia" doesn't end
        //with "India" and "British Indian Ocean Territory" ends with "Territory", so no false positives.
        if(text.trim().endsWith('India')){
            //BUG FIX: '.ta-backdrop' is an invisible overlay sibling that can sit above the suggestion list
            //and intercept pointer events, making the real click hang/timeout - force:true bypasses that check.
            await countryOptionsDropdown.locator('button').nth(i).click({ force: true })
            break; //exit the loop once the desired country is selected
        }
    }
    //confirm the dropdown actually closed (country accepted) before moving on to the next field
    await countryOptionsDropdown.waitFor({ state: 'hidden' })
    //await page.pause()

    //'.username ' (parent) + `[type='text']` (child) - the grayed-out email label has no unique id, and
    //`[type='text']` alone matches 6 elements on the page, so scoping via its unique parent class narrows
    //it down to just the 2 labels inside this form (login email + confirm-order email echo).
    //BUG FIX: .first() is a LOCATOR method, not an expect() method - it must be called on the locator
    //itself (narrowing it to one element) BEFORE wrapping it in expect(), not chained after expect(...).
    //toHaveText() asserts the read-only email label still matches the same userName used to log in -
    //reusing the variable (instead of a hardcoded string) means there's one source of truth for the email.
    await expect(page.locator(`.user__name [type='text']`).first()).toHaveText(userName);
    //'.action__submit' is unique on the page (no strict-mode collision), so no parent scoping needed here.
    //place order button click
    await page.locator('.action__submit').click()

    //MAIN GOAL of this whole flow: confirm the "Thank you for the order" message actually renders -
    //only this proves the order truly submitted. Copy the expected text (incl. leading space) straight
    //from devtools console output, not visually from the page, or whitespace mismatches will fail silently.
    await expect(page.locator('.hero-primary')).toHaveText(' Thankyou for the order. ')
    //'.em-spacer-1' (parent) + 'div' (child, or whatever wraps the id) - a bare class on the id span alone
    //matched 5 elements, so again scope through its unique parent to land on exactly 1.
    //textContent() (not toHaveText) because we're CAPTURING the order id into a variable, not asserting on it.
    const orderID= await page.locator('.em-spacer-1 .ng-star-inserted').textContent()
    //ASSIGNMENT: take this printed order id, go to the Orders tab, scan up to 25 rows to find the matching
    //order id, then click its "View" button - left as an exercise, not yet automated here.
    console.log(orderID)

    //[routerlink*='myorders'] - same contains-match trick as the cart link; adding the 'button' tag here
    //narrows 2 matches down to 1 (the header's nav button vs. whatever else shares that routerlink).
    await page.locator("button[routerlink*='myorders']").click();
    //SYNC ISSUE: this orders page loads its table asynchronously (spinner first) - without waiting for
    //tbody to actually render, rows.count() below would run too early and read 0.
    await page.locator("tbody").waitFor();
    //PARENT 'tbody' + child 'tr' grabs every row in the orders table (order unknown ahead of time: your
    //newest order isn't guaranteed to be first/last if other users submit orders at the same time).
    const rows = await page.locator("tbody tr");
    
    
    //scan EVERY row instead of assuming a fixed position - count() is re-evaluated each loop so this
    //still works if the table size changes.
    for (let i = 0; i < await rows.count(); ++i) {
        //'th' is this row's order-id cell; textContent() may include incidental whitespace around the id.
        const rowOrderId = await rows.nth(i).locator("th").textContent();
        //includes() (not ===) because the confirmation-page orderID can have leading/trailing characters
        //around the raw id - substring match tolerates that padding safely.
        if (orderID.includes(rowOrderId)) {
            //STRICT MODE: each row has 2 buttons (View + Delete) - .first() picks View, the leftmost one.
            await rows.nth(i).locator("button").first().click();
            break; //exit the loop once the matching order's row is found - no need to keep scanning
        }
    }
    //'.col-text' is unique on the order-details page - grab its text to confirm we landed on the right order.
    const orderIdDetails = await page.locator(".col-text").textContent();
    //final proof this whole flow worked end-to-end: the id shown on the details page actually belongs
    //to the order we just placed and clicked into (not some other row we accidentally matched).
    expect(orderID.includes(orderIdDetails)).toBeTruthy();


})