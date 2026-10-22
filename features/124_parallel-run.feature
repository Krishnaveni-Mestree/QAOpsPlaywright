Feature: Ecommerce validations

    # PARALLEL RUN: Cucumber runs SCENARIOS in parallel (not feature FILES). This file has 2 scenarios, so:
    #   npx cucumber-js features/124_parallel-run.feature --parallel 2 --exit
    # starts 2 workers, each with its own browser, and both scenarios run at the same time.
    # Scenarios must be independent of each other (no sharing data between them) - the World (`this`) is per scenario, so ours are.
    # More commands (report, retry, npm script): see features/124_cucumber-reports-rerun.md
    @Validations-1
    Scenario: Placing the order
        Given a login to Ecommerce application with "mkrishnaveni1102@gmail.com" and "Qazmlp@1505"
        When Add "ZARA COAT 3" to cart
        Then Verify "ZARA COAT 3" is displayed in the cart
        When Enter valid details and place the order
        Then Verify order is present in the OrderHistory page


    @Validations-1
    Scenario: Verify error message for invalid login
        Given a login to Ecommerce2 application with "invalidUser" and "invalidPass"
        Then Verify Error message is displayed
