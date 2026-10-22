const { test, expect } = require('@playwright/test');


test('@Web playwright test - UI controls', async ({ page })=>{
   
    const userName = page.locator('#username')
    const password = page.locator("[type='password']")
    const signInBtn = page.locator('#signInBtn')
    //navigate to a URL
    await page.goto('https://rahulshettyacademy.com/loginpagePractise/')
    console.log(await page.title());
    await userName.fill('rahulshettyacademy')
    await password.fill('Learning@830$3mK2')

    //STATIC dropdown = native HTML <select> tag (options are fixed in the DOM, no JS-rendered custom widget).
    //'.form-control' alone matched 3 elements (not unique/strict-mode violation) - combining tag+class
    //('select.form-control') narrows it to only the <select> element, since tag+class together are more specific.
    const dropdown=page.locator('select.form-control');
    //selectOption() picks by the OPTION's `value` attribute (not its visible label) by default -
    //you can also pass { label: '...' } or { index: n } if you don't know/trust the value attribute.
    await dropdown.selectOption('consult');
    //await page.pause()

    //RADIO BUTTONS: '.radiotextsty' matches 2 elements (admin + user radios) - .last() picks the 2nd/last one (user),
    //same strict-mode-violation concept as before, resolved with .first()/.last()/.nth(index) instead of a plain click.
    await page.locator('.radiotextsty').last().click()
    //clicking "user" triggers a confirmation popup - #okayBtn's click() auto-waits for that popup to render
    //before clicking it, no manual wait needed (same auto-wait intelligence covered in UIBasicstest.spec.js).
    await page.locator('#okayBtn').click()
    //page.pause() opens the Playwright Inspector - pauses execution so you can step through actions and
    //inspect locators live; only works in headed mode (or with PWDEBUG=1 env var). Remove before CI runs,
    //since it blocks the test waiting for you to manually resume/close the inspector.

    await expect(page.locator('.radiotextsty').last()).toBeChecked();
    //isChecked() is an instant boolean check - it does NOT auto-wait/retry like toBeChecked() does.
    //Only useful for debug logging or feeding into custom logic, never as a substitute for a real assertion
    //(if the radio isn't checked yet when this runs, you just get `false` printed, not a failed test).
    console.log(await page.locator('.radiotextsty').last().isChecked())
    // await page.pause()

    await page.locator(`[type='checkbox']`).click()
    await expect(page.locator(`[type='checkbox']`)).toBeChecked();
    //uncheck()/check() are more intention-revealing than click() for checkboxes - they're idempotent
    //(uncheck() on an already-unchecked box is a no-op, unlike click() which would just re-check it).
    await page.locator(`[type='checkbox']`).uncheck();
    //assert to uncheck
    //CORRECTING transcript: latest Playwright DOES support asserting "unchecked" directly via
    //toBeChecked({ checked: false }) - no need for the toBeFalsy()/isChecked() workaround below, though it still works.
    
    //AWAIT PLACEMENT RULE: put `await` wherever the actual action/method call happens, not just at the front out of habit.
    //expect(locator).toBeChecked() - the action (toBeChecked) is OUTSIDE expect()'s parentheses, so await goes before expect.
    //expect(locator.isChecked()).toBeFalsy() - here the action (isChecked()) is INSIDE the parentheses passed to expect,
    //so THAT inner call needs its own await (await page.locator(...).isChecked()), since it resolves to a value first.
    await expect(await page.locator(`[type='checkbox']`).isChecked()).toBeFalsy();
    //or
    await expect(page.locator(`[type='checkbox']`)).not.toBeChecked();
    //modern equivalent: await expect(page.locator(`[type='checkbox']`)).toBeChecked({ checked: false });
    await expect(page.locator(`[type='checkbox']`)).toBeChecked({ checked: false });
    // await page.pause()

    //[href*='documents-request'] - partial/contains match again (see UIBasicstest.spec.js), useful since you only
    //need to confirm the link points to that request, not match its full exact href.
    const documentLink=page.locator(`[href*='documents-request']`);
    //toHaveAttribute(name, value) checks an actual DOM attribute's value - here it indirectly verifies the link
    //"blinks" by confirming the CSS class responsible for the blink animation is present, since there's no
    //direct Playwright API to detect a visual blinking effect.
    await expect(documentLink).toHaveAttribute('class','blinkingText');


    // await signInBtn.click(); 

})



test.only('@Web @child window handle', async ({page})=>{
    await page.goto('https://rahulshettyacademy.com/loginpagePractise/')
    const documentLink=page.locator(`[href*='documents-request']`);

    //const page2=await page.context().waitForEvent('page');
    //=== INTERVIEW-READY EXPLANATION: Promise.all() for child window/new tab handling ===
    //
    //BACKGROUND - JS promises have 3 states: pending (still running), fulfilled (succeeded, has a value),
    //rejected (failed/threw). Every playwright action (click, goto, waitForEvent...) returns a promise.
    //JS is single-threaded but non-blocking/asynchronous by default: when you call an async function WITHOUT
    //await, JS does not pause - it immediately moves to the next line while that promise is still pending in
    //the background. `await` is what forces JS to pause and wait for a promise to settle (fulfilled/rejected)
    //before continuing - that's how we fake "synchronous, step-by-step" behavior on top of async JS.
    //
    //THE PROBLEM: clicking documentLink opens a brand-new tab/page in the SAME browser context. Playwright's
    //only way to "know about" that new tab is an event: context().waitForEvent('page'). But:
    //  - if you `await documentLink.click()` FIRST, the new page event already fired and is gone by the time
    //    you start listening for it afterward -> waitForEvent('page') hangs/times out (listener attached too late).
    //  - if you `await page.context().waitForEvent('page')` FIRST, you're blocking/waiting for an event that
    //    can only be caused by the click - but the click hasn't happened yet because you're stuck awaiting -> deadlock.
    //  This is a genuine RACE CONDITION: one action must trigger the event while the other is already listening,
    //  and plain sequential await can't express "start both now, at the same instant."
    //
    //THE FIX: Promise.all([promiseA, promiseB]) starts ALL promises in the array immediately/concurrently
    //(neither one blocks the other from starting), then waits until EVERY one of them is fulfilled before
    //resolving itself and returning an array of their results in the same order. So here:
    //  - page.context().waitForEvent('page') starts listening immediately (pending)
    //  - documentLink.click() fires in parallel, which is what actually triggers the 'page' event
    //  - once both are fulfilled, Promise.all resolves to [newPageObject, clickResult] - we destructure
    //    just the first element as `newPage` (click() itself resolves to undefined, so it's discarded).
    //  If EITHER promise rejects (e.g. click target not found), Promise.all immediately rejects too and the test fails.
    //
    //ALTERNATIVE PATTERN (equally valid, sometimes clearer): capture the listener promise in a variable
    //WITHOUT awaiting it yet, then await the click, then await the stored promise:
    //    const newPagePromise = page.context().waitForEvent('page');
    //    await documentLink.click();
    //    const newPage = await newPagePromise;
    //Both achieve the same "arm the listener before/alongside the triggering action" result.
    const [newPage]=await Promise.all([
        page.context().waitForEvent('page'),
        documentLink.click()
    ])
    //dont use these
        //await documentLink.click()
        // const page2=await page.context().waitForEvent('page');

    //newPage has its own independent locator scope - the original `page` variable only knows about the
    //parent tab and will never find elements that exist solely in this new child tab/window.
    const text=await newPage.locator('.red').textContent();
    console.log(text);
    //split('@') breaks "text@domain.com ..." into [left-of-@, right-of-@...]; index[1] is everything after '@'.
    const arrayText=text.split('@')
    //further split on whitespace and take index[0] to isolate just the domain, discarding trailing sentence text.
    const domain=arrayText[1].split(" ")[0]
    console.log(domain);
    //can fill domain into main page input field
    //switching back to the PARENT page's scope here (`page`, not `newPage`) to type into the original username field.
    await page.locator('#username').fill(domain);
    //CORRECTING transcript/common mistake: textContent() reads a DOM node's rendered TEXT CONTENT, but an <input>'s
    //typed value lives in its `value` property, not as child text - so this will likely log null/empty, not the domain.
    //Use inputValue() instead to read back what fill() actually typed into an <input>/<textarea>/<select>.
    //
    //=== INTERVIEW-READY EXPLANATION: textContent() vs inputValue() ===
    //textContent() returns whatever text is ATTACHED TO THE DOM AT PAGE LOAD (static/initial markup) -
    //e.g. a <label>, <div>, <span>, <p> or <h1> that already has its text baked into the HTML when the page renders.
    //An <input>'s value, however, is NOT part of its text content/children - it's a separate `value` property/attribute,
    //and for form fields that get filled dynamically (by a real user typing, OR programmatically via fill()/type()
    //AFTER the page has already loaded), textContent() was never watching that property, so it just returns empty/blank.
    //inputValue() is the playwright method built specifically to read the CURRENT runtime value of
    //<input>/<textarea>/<select> elements - use it anytime you need to verify something that was entered/changed
    //at runtime, as opposed to text that was already present in the initial DOM when the page loaded.
    //Rule of thumb: static page text -> textContent(); live form field value -> inputValue().
    //console.log(await page.locator('#username').textContent())
    console.log(await page.locator('#username').inputValue());

})