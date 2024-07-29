@isTest
private with sharing class B2B_BuyerGroupMemberTriggerHandlerTest {
    //BS-1589
    @isTest
    private static void buyerGroupMemberTriggerTestForNonExistingShopPreference() {
        Test.startTest();
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        Test.stopTest();

        List<My_B2B_Shop_Preference__c> myShopPreferenceList = [
            SELECT Id
            FROM My_B2B_Shop_Preference__c
            WHERE B2B_Account__c = :storeResponse.get('accountId')
        ];
        System.assertEquals(myShopPreferenceList.isEmpty(), false, 'Shop Preference should be created');
        System.assertEquals(storeResponse.isEmpty(), false, 'Store response should be generated');
    }

    //BS-1589
    @isTest
    private static void buyerGroupMemberTriggerTestForExistingShopPreference() {
        Test.startTest();
        Account accountObj = B2B_TestDataFactory.createTestAccount();
        insert accountObj;

        B2B_TestDataFactory.createInsertBuyerAccount(accountObj);

        My_B2B_Shop_Preference__c shopPreferenceObj = new My_B2B_Shop_Preference__c();
        shopPreferenceObj.B2B_Account__c = accountObj.Id;
        insert shopPreferenceObj;

        WebStore webStroreObj = B2B_TestDataFactory.createWebStore();
        insert webStroreObj;

        BuyerGroup buyyerGroupObj = B2B_TestDataFactory.createInsertBuyerGroupForStore(webStroreObj.Id);

        B2B_TestDataFactory.createInsertBuyerGroupMemberForAccount(accountObj.Id, buyyerGroupObj.Id);

        Test.stopTest();

        List<My_B2B_Shop_Preference__c> myShopPreferenceList = [SELECT Id FROM My_B2B_Shop_Preference__c WHERE B2B_Account__c = :accountObj.Id];
        System.assertEquals(myShopPreferenceList.size(), 1, 'No new Shop Preference should be created');
    }
}
