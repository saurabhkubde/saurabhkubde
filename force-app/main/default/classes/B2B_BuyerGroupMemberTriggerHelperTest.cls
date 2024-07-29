@isTest
private with sharing class B2B_BuyerGroupMemberTriggerHelperTest {
    //BS-1589
    @isTest
    private static void buyerGroupMemberTriggerTestForNonExistingShopPreference() {
        Account accountObj = B2B_TestDataFactory.createTestAccount();
        insert accountObj;
        B2B_TestDataFactory.createInsertBuyerAccount(accountObj);

        WebStore webStoreObj = B2B_TestDataFactory.createWebStore();
        insert webStoreObj;

        BuyerGroup buyerGroupObj = B2B_TestDataFactory.createInsertBuyerGroupForStore(webStoreObj.Id);

        List<BuyerGroupMember> buyerGroupMemeberList = new List<BuyerGroupMember>{
            new BuyerGroupMember(BuyerId = accountObj.Id, BuyerGroupId = buyerGroupObj.Id),
            new BuyerGroupMember(BuyerId = accountObj.Id, BuyerGroupId = buyerGroupObj.Id)
        };

        Test.startTest();
        B2B_BuyerGroupMemberTriggerHelper.createMyShopPreference(buyerGroupMemeberList);
        Test.stopTest();

        List<My_B2B_Shop_Preference__c> myShopPreferenceList = [SELECT Id FROM My_B2B_Shop_Preference__c WHERE B2B_Account__c = :accountObj.Id];
        System.assertEquals(myShopPreferenceList.isEmpty(), false, 'Shop Preference should be created');
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
