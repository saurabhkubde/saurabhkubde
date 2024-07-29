@isTest
public with sharing class B2B_HidePriceControllerTest {
    @IsTest
    public static void updateHidePriceOnAccountTest() {
        User testUser = B2B_TestDataFactory.createInsertCommerceUser();

        Test.startTest();
        System.runAs(testUser) {
            B2B_HidePriceController.updateHidePriceOnAccount(true);
        }
        Test.stopTest();

        Account accCheck = [SELECT B2B_Hide_Prices__c FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123'];

        System.assertEquals(true, accCheck.B2B_Hide_Prices__c, 'hide price field was not updated.');
    }
}
