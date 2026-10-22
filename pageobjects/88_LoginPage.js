//PAGE OBJECT MODEL: one class per page/screen of the app - all its locators and user-actions live here,
//instead of scattered inline in test files. Tests then read like plain English (loginPage.goTo(),
//loginPage.validLogin(...)) instead of raw locator/click/fill calls.
class LoginPage{
    //constructor runs the moment `new LoginPage(page)` is called from a test - `page` is handed in
    //from there (this class has no browser of its own), and every locator below is defined ONCE here so
    //it's ready to use immediately, instead of re-declaring the same selector in every test that needs it.
    constructor(page){
        //`this.page` stores page as a CLASS property (not just a constructor-local param) - without this,
        //only the constructor itself could see `page`; methods like goTo()/validLogin() below need `this.`
        //to reach it, since each method runs in its own separate scope.
        this.page=page
        this.signInButton = page.locator(`[type$='submit']`)
        this.userName=page.locator('#userEmail')
        this.password=page.locator('#userPassword')
    }

    //navigation lives in the page object too - any test wanting to land on the login page calls this,
    //instead of hardcoding the URL inline (and repeating it if the URL ever changes).
    async goTo(){
        await this.page.goto('https://rahulshettyacademy.com/client/')
    }

    //username/password are NOT hardcoded here - they're passed in as METHOD parameters from the test,
    //so the page object only knows HOW to log in, while the test decides WHICH credentials to use.
    async validLogin(userName, password){
        await this.userName.fill(userName)
        await this.password.fill(password)
        await this.signInButton.click()
        //waiting here (not repeated in every test/page object that logs in) - login is always immediately
        //followed by the dashboard loading, so this is the one shared place that wait belongs.
        await this.page.waitForLoadState('networkidle');
    }
}

//exporting as a NAMED export ({ LoginPage }) - the test file must destructure it the same way:
//`const { LoginPage } = require(...)`, matching exactly how it's exported here.
module.exports = { LoginPage };
