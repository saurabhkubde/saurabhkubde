@isTest
private class D2C_CartControllerTest {
    @testSetup
    static void setup() {
        List<Product2> productList = D2C_TestDataFactory.createProducts(2);
        insert productList;

        List<String> productIdList = new List<String>();
        for (Product2 product : productList) {
            productIdList.add(product.Id);
        }
        WebStore webStore = D2C_TestDataFactory.createWebStore();
        insert webStore;

        List<Account> accountList = D2C_TestDataFactory.createAccounts(1, 'Account', true);
        WebCart newCart = D2C_TestDataFactory.createActiveEmptyCart(webStore.Id, accountList[0].Id);
        insert newCart;

        CartDeliveryGroup cartDeliveryGroupObj = D2C_TestDataFactory.createInsertCartDeliveryGroup(newCart.Id);
        List<CartItem> cartItemList = D2C_TestDataFactory.createCartItem(2, newCart, productIdList, cartDeliveryGroupObj.Id);
        insert cartItemList;
    }

    @isTest
    private static void getCartItemDataTest() {
        List<WebCart> webCartList = [SELECT Id FROM WebCart LIMIT 1];
        List<CartItem> result = D2C_CartController.getCartItemData(webCartList[0].Id);

        Test.startTest();
        System.assertEquals(2, result.size(), 'There should be two CartItem in the result');
        Test.stopTest();
    }

    @isTest
    private static void updateCartRecordTest() {
        List<WebCart> webCartList = [SELECT Id FROM WebCart LIMIT 1];
        D2C_CartController.updateCartRecord(webCartList[0].Id, 'Online Purchase');
        List<WebCart> updatedWebCartList = [SELECT Id, D2C_Order_Type__c FROM WebCart LIMIT 1];

        Test.startTest();
        System.assertEquals('Online Purchase', updatedWebCartList[0].D2C_Order_Type__c, 'Order Type should be updated');
        Test.stopTest();
    }

    @isTest
    static void updateCartRecordWithExceptionTest() {
        String orderType = 'Test';
        String cartId = '00000000000000';
        try {
            Test.startTest();
            D2C_CartController.updateCartRecord(cartId, orderType);
            Test.stopTest();
            System.assert(false, 'Expected exception was not thrown');
        } catch (AuraHandledException exceptionInstance) {
            System.assert(exceptionInstance.getMessage().contains(''), 'Unexpected exception message: ' + exceptionInstance.getMessage());
        }
    }
}
