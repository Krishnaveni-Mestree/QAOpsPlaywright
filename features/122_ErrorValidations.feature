Feature: Error Validations in Ecommerce Application
    # TAGS: a word starting with @ placed above a Scenario (or Feature) labels it. Then you can run ONLY the
    # labelled ones:  npx cucumber-js --tags "@Validations" --exit
    # Other examples: --tags "@Validations or @Smoke" | --tags "not @Validations" | --tags "@Web and @Smoke"
    # One scenario can have several tags, e.g. "@Validations @Smoke".
    @Validations
    Scenario: Verify error message for invalid login
        Given a login to Ecommerce2 application with "invalidUser" and "invalidPass"
        Then Verify Error message is displayed

