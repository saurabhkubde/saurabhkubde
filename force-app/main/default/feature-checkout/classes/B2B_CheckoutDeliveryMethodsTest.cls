@IsTest
public with sharing class B2B_CheckoutDeliveryMethodsTest {
    @testSetup
    static void setup() {
        Account testAccount = new Account(Name = 'TestAccount');
        insert testAccount;
        WebStore testWebStore = new WebStore(Name = 'TestWebStore', SupportedLanguages = 'en_US', DefaultLanguage = 'en_US');
        insert testWebStore;

        Account account = [SELECT Id FROM Account WHERE Name = 'TestAccount' LIMIT 1];
        WebStore webStore = [SELECT Id FROM WebStore WHERE Name = 'TestWebStore' LIMIT 1];
        WebCart cart = new WebCart(Name = 'Cart', WebStoreId = webStore.Id, AccountId = account.Id);
        insert cart;

        CartDeliveryGroup cartDeliveryGroup = new CartDeliveryGroup(CartId = cart.Id, Name = 'Default Delivery 1');
        insert cartDeliveryGroup;

        CartItem cartItem = new CartItem(CartId = cart.Id, Type = 'Product', Name = 'TestProduct', CartDeliveryGroupId = cartDeliveryGroup.Id);
        insert cartItem;
    }

    /*
        Run the method that gets the delivery methods via an external service.
    */
    @isTest
    static void testCode1() {
        Test.startTest();

        // Test: execute the integration for the test cart ID.
        WebCart webCart = [SELECT Id FROM WebCart WHERE Name = 'Cart' LIMIT 1];

        List<ID> cartIds = new List<ID>();
        cartIds.add(webCart.Id);
        B2B_CheckoutDeliveryMethods.prepDeliveryMethodsInternal(cartIds);
        // Verify: the integration executed successfully
        List<CartDeliveryGroupMethod> methodList = [SELECT Id, Name FROM CartDeliveryGroupMethod WHERE WebCartId = :webCart.Id];

        System.assertNotEquals(0, methodList.size());

        Test.stopTest();
    }

    @isTest
    static void testPrepDeliveryMethods() {
        Test.startTest();

        // Test: execute the integration for the test cart ID.
        WebCart webCart = [SELECT Id FROM WebCart WHERE Name = 'Cart' LIMIT 1];

        List<ID> cartIds = new List<ID>();
        cartIds.add(webCart.Id);
        B2B_CheckoutDeliveryMethods.prepDeliveryMethods(cartIds);
        // Verify: the integration executed successfully
        List<CartDeliveryGroupMethod> methodList = [SELECT Id, Name FROM CartDeliveryGroupMethod WHERE WebCartId = :webCart.Id];

        System.assertNotEquals(0, methodList.size());

        B2B_CheckoutDeliveryMethods.integrationStatusFailedWithCartValidationOutputError('test', webCart.Id);

        System.assertEquals(1, [SELECT Id FROM CartValidationOutput WHERE CartId = :webCart.Id].size(), 'Validation error should be saved');

        Test.stopTest();
    }

    @isTest
    static void testPrepDefaultDeliveryMethodInternal() {
        Test.startTest();

        // Test: execute the integration for the test cart ID.
        WebCart webCart = [SELECT Id FROM WebCart WHERE Name = 'Cart' LIMIT 1];

        List<ID> cartIds = new List<ID>();
        cartIds.add(webCart.Id);
        B2B_CheckoutDeliveryMethods.prepDefaultDeliveryMethodInternal(cartIds);

        Test.stopTest();
    }
}
