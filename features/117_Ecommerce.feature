Feature: Ecommerce validations

  # TAG: @Regression marks this as a positive end-to-end test. Run only these with:
  #   npx cucumber-js --tags "@Regression" --exit
  # (the other feature's @Validations scenario is skipped, so a quick certification run takes minutes, not hours)
  @Regression
  Scenario: Placing the order
    Given a login to Ecommerce application with "mkrishnaveni1102@gmail.com" and "Qazmlp@1505"
    When Add "ZARA COAT 3" to cart
    Then Verify "ZARA COAT 3" is displayed in the cart
    When Enter valid details and place the order
    Then Verify order is present in the OrderHistory page