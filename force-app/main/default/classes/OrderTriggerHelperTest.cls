@SuppressWarnings('PMD.classnamingconventions')
@istest
private class OrderTriggerHelperTest {
    /**
     * @method testData used to create test data
     */
    @testSetup
    static void testData() {
        //Added as Part of DBUSF-516.
        Id b2cRecordtypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName()
            .get(B2C_Constants.B2C_CONSUMER_RECORDTYPE_DEVELOPERNAME)
            .getRecordTypeId();
        List<Account> accountList = B2B_TestDataFactory.createAccounts(1, 'Test Account B2C', 'Test@test.com.Invalid', '552831');
        accountList[0].RecordTypeId = b2cRecordtypeId; //Added as Part of DBUSF-516.
        if (!accountList.isEmpty()) {
            insert accountList;
        }
        List<Order> b2cOrderList = B2B_TestDataFactory.createOrders(20, accountList[0].Id, '100');
        if (!b2cOrderList.isEmpty()) {
            insert b2cOrderList;
        }
        List<Order> b2bOrderList = B2B_TestDataFactory.createB2BOrders(10, accountList[0].Id, '200');
        if (!b2bOrderList.isEmpty()) {
            insert b2bOrderList;
        }

        //Added as Part of DBUSF-516.
        List<Account> b2cAccountList = [SELECT Id FROM Account WHERE Name = 'Test Account B2C' LIMIT 1];
        if (!b2cAccountList.isEmpty()) {
            Contact b2cContact = B2B_TestDataFactory.createContact('Mr', 'Test', 'Contact B2C', b2cAccountList[0].Id, false);

            if (b2cContact != null) {
                insert b2cContact;
            }
        }
    }

    /**
     * @method testOrderInsertWithB2COrderSource used to test B2C Order recordtype
     * is being set when the order is being created with having Order Source value allowed for
     * B2C Order Record type.
     */
    @isTest
    private static void testOrderInsertWithB2COrderSource() {
        Id b2cOrderRecordtypeId = Schema.SObjectType.Order.getRecordTypeInfosByDeveloperName()
            .get(B2B_Constants.B2C_ORDER_RECORDTYPE_DEVELOPERNAME)
            .getRecordTypeId();
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<Order> orderList = new List<Order>();
        for (integer index = 1; index <= 10; index++) {
            Order orderObject = new Order();
            orderObject.AccountId = accountList[0].Id;
            orderObject.EffectiveDate = System.Today().addDays(1);
            orderObject.Status = 'Draft';
            orderObject.Order_Source__c = 'B2C Online Shop';
            orderObject.B2C_Order_Number__c = '9976' + index;
            orderList.add(orderObject);
        }
        Test.startTest();
        insert orderList;
        Test.stopTest();
        List<Order> b2COrderList = [SELECT Id, RecordTypeId FROM Order WHERE RecordTypeId = :b2cOrderRecordtypeId AND EffectiveDate = TOMORROW];
        System.assertEquals(orderList.size(), b2COrderList.size(), 'recordtype not populated');
    }

    /**
     * @method testOrderInsertWithB2COrderSource used to test B2C Order recordtype
     * is being set when the order is being created with having Order Source value allowed for
     * B2C Order Record type.
     */
    @isTest
    private static void testB2BOrderInsertWithExistingRelatedB2COrder() {
        Id b2bOrderRecordtypeId = Schema.SObjectType.Order.getRecordTypeInfosByDeveloperName()
            .get(B2B_Constants.B2B_ORDER_RECORDTYPE_DEVELOPERNAME)
            .getRecordTypeId();
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<Order> orderList = B2B_TestDataFactory.createB2BOrders(10, accountList[0].Id, '100');
        Test.startTest();
        insert orderList;
        Test.stopTest();
        List<Order> b2bOrderList = [SELECT Id FROM Order WHERE RecordTypeId = :b2bOrderRecordtypeId AND B2C_Related_B2C_Order__c != NULL];
        System.assertEquals(orderList.size(), b2bOrderList.size(), 'Related B2C order Id is not populated');
    }

    /**
     * @method testOrderInsertWithB2COrderSource used to test B2C Order recordtype
     * is being set when the order is being created with having Order Source value allowed for
     * B2C Order Record type.
     */
    @isTest
    private static void testB2COrderInsertWithExistingRelatedB2BOrder() {
        Id b2bOrderRecordtypeId = Schema.SObjectType.Order.getRecordTypeInfosByDeveloperName()
            .get(B2B_Constants.B2B_ORDER_RECORDTYPE_DEVELOPERNAME)
            .getRecordTypeId();
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<Order> orderList = B2B_TestDataFactory.createOrders(10, accountList[0].Id, '200');
        Test.startTest();
        insert orderList;
        Test.stopTest();
        List<Order> b2bOrderList = [SELECT Id FROM Order WHERE RecordTypeId = :b2bOrderRecordtypeId AND B2C_Related_B2C_Order__c != NULL];
        System.assertEquals(orderList.size(), b2bOrderList.size(), 'Related B2C order Id is not populated');
    }

    /**
     * @method testOrderInsertWithB2COrderSource used to test B2C Order recordtype
     * is being set when the order is being created with having Order Source value allowed for
     * B2C Order Record type.
     */
    @isTest
    private static void testB2BOrderUpdateWithExistingRelatedB2COrder() {
        Id b2bOrderRecordtypeId = Schema.SObjectType.Order.getRecordTypeInfosByDeveloperName()
            .get(B2B_Constants.B2B_ORDER_RECORDTYPE_DEVELOPERNAME)
            .getRecordTypeId();
        List<Order> orderList = [SELECT Id, Related_B2C_Order_Number__c FROM Order WHERE RecordTypeId = :b2bOrderRecordtypeId];
        String newOrderNumber = '100';
        for (Integer index = 1; index <= orderList.size(); index++) {
            orderList[index - 1].Related_B2C_Order_Number__c = newOrderNumber + index;
        }
        Test.startTest();
        update orderList;
        Test.stopTest();
        List<Order> b2bOrderList = [SELECT Id FROM Order WHERE RecordTypeId = :b2bOrderRecordtypeId AND B2C_Related_B2C_Order__c != NULL];
        System.assertEquals(orderList.size(), b2bOrderList.size(), 'Related B2C order Id is not populated');
    }
}
