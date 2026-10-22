class DashboardPage{
    constructor(page){
       //parent locator for every product card - needed as the SCOPE to search within when picking one
       //specific card by name, same idea as the row-scoping technique used in the Excel/table lectures.
       this.products=page.locator('.card-body')
       //all product name <b> tags at once - used to both print every title and to wait for the list to
       //actually render (via .first().waitFor()) before reading/filtering anything.
       this.productsTitles=page.locator('.card-body b')
       this.cartButton=page.locator(`[routerlink*='cart']`)
       this.myOrdersButton=page.locator("button[routerlink*='myorders']")
    }

    //productName comes in as a METHOD parameter (not hardcoded) - this method works for ANY product the
    //test asks for, not just one fixed item.
    async searchProductAddCart(productName){
        
        //waiting here instead of relying on the login step's networkidle wait alone - makes this method
        //safe to call on its own, without depending on what happened right before it.
        await this.productsTitles.first().waitFor()
        
        const allCardTitles=await this.productsTitles.allTextContents()
        console.log(allCardTitles)

        //scans every card (count() re-read, not hardcoded) until the one matching productName is found,
        //then clicks THAT card's own "Add To Cart" button - `this.products` here is the class property
        //set in the constructor, not a fresh locator, so don't forget the `this.` prefix.
        const count=await this.products.count()
        for(let i=0;i<count;++i){
            if(await this.products.nth(i).locator('b').textContent()===productName){
                await this.products.nth(i).locator(`text= Add To Cart`).click()
                break;
            }
        }
    }

    //kept as its own tiny method (not merged into searchProductAddCart) so the test can read as two clear,
    //separate steps: find+add the product, THEN navigate to the cart.
    async navigateToCart(){
        await this.cartButton.click()
    }

    //this button also lives on the dashboard's nav header - navigating back here (from the order
    //confirmation screen) is still a DashboardPage concern, not the orders-review page's job.
    async navigateToOrders(){
        await this.myOrdersButton.click()
    }

    
}

module.exports = { DashboardPage };
