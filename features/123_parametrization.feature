Feature: Error Validations in Ecommerce Application

    # PARAMETERIZATION (data-driven testing in Cucumber) - replaces the JSON file + for-loop we used with Playwright Test.
    #
    # 1. "Scenario Outline" (instead of "Scenario") tells Cucumber: run this scenario once PER DATA ROW.
    #    Without the word Outline, Cucumber treats <username> as plain text and does not look at the table.
    # 2. "<username>" / "<password>" (angle brackets) are placeholders. At runtime Cucumber matches the name inside
    #    <> with a COLUMN NAME in the Examples table and swaps in that row's value before running the step.
    #    So the step text becomes: ... with "invalidUser" and "invalidPass"  -> same {string} step definition, no JS change.
    # 3. "Examples:" holds the data. The FIRST row is the column headers (not data); every row after it is one run.
    #    Below there are 3 data rows -> the scenario runs 3 times, each with a fresh browser (the Before hook runs per run).
    #    Add a row = add a test run. No code changes needed.
    # Run only these: npx cucumber-js features/123_parametrization.feature --exit   (or --tags "@Validations")
    # NOTE: @Validations is also on 122_ErrorValidations.feature, so --tags "@Validations" runs BOTH files.
    @Validations
    Scenario Outline: Verify error message for invalid login
        Given a login to Ecommerce2 application with "<username>" and "<password>"
        Then Verify Error message is displayed

        Examples:
            | username           | password          |
            | invalidUser        | invalidPass       |
            | anotherInvalidUser | anotherInvalidPass |
            | hello@123.com      | InvalidPass       |
    # The same idea works for the e-commerce order flow (117_Ecommerce.feature): make it a Scenario Outline and put
    # username, password and productName columns in Examples to order different products with different logins.