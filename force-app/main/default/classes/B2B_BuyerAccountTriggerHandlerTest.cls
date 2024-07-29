@isTest
public with sharing class B2B_BuyerAccountTriggerHandlerTest {
    @TestSetup
    static void dataSetup() {
        Id accountRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Account').getRecordTypeId();
        Id prospectRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Prospect').getRecordTypeId();

        Account acc = B2B_TestDataFactory.createTestAccount();
        acc.k_ARIS_Account_ID__c = 'DEDE_123';
        acc.k_Account_No__c = 'DENB_123';
        acc.CSG_SubSeg_EE__c = 'populated';
        acc.k_Stage__c = 'Account';
        acc.k_Customer_Status__c = '1';
        acc.RecordTypeId = accountRecordTypeId;
        insert acc;

        Account acc2 = B2B_TestDataFactory.createTestAccount();
        acc2.k_ARIS_Account_ID__c = 'DENB_123';
        acc2.k_Account_No__c = 'DENB_123';
        acc2.k_Stage__c = 'Account';
        acc2.k_Customer_Status__c = '1';
        acc2.RecordTypeId = accountRecordTypeId;
        insert acc2;

        Account acc3 = B2B_TestDataFactory.createTestAccount();
        acc3.k_ARIS_Account_ID__c = 'DEDE_1234';
        acc3.k_Stage__c = 'Prospect';
        acc3.k_Customer_Status__c = '1';
        acc3.RecordTypeId = prospectRecordTypeId;
        insert acc3;

        Account acc4 = B2B_TestDataFactory.createTestAccount();
        acc4.k_ARIS_Account_ID__c = 'DENB_1234';
        acc4.k_Stage__c = 'Prospect';
        acc4.k_Customer_Status__c = '1';
        acc4.RecordTypeId = prospectRecordTypeId;
        insert acc4;
    }
    @isTest
    public static void testBuyerAccountCreated() {
        BuyerAccount ba = new BuyerAccount();
        List<Account> accountList = [SELECT Id, k_ARIS_Account_ID__c FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123' LIMIT 1];

        ba.BuyerId = accountList[0].Id;
        ba.Name = 'Test1';
        ba.isActive = true;

        Test.startTest();
        insert ba;
        Test.stopTest();

        List<BuyerAccount> buyerList = [SELECT Id, BuyerId FROM BuyerAccount WHERE BuyerId = :accountList[0].Id LIMIT 1];

        System.assert(buyerList[0].Id != null, 'Account should be enabled as Buyer');
    }

    @isTest
    public static void testBuyerAccountCreatedNB() {
        BuyerAccount ba = new BuyerAccount();
        List<Account> accountList = [SELECT Id, k_ARIS_Account_ID__c FROM Account WHERE k_ARIS_Account_ID__c = 'DENB_123' LIMIT 1];

        ba.BuyerId = accountList[0].Id;
        ba.Name = 'Test1';
        ba.isActive = true;

        Test.startTest();
        insert ba;
        Test.stopTest();

        List<BuyerAccount> buyerList = [SELECT Id, BuyerId FROM BuyerAccount WHERE BuyerId = :accountList[0].Id LIMIT 1];

        System.assert(buyerList[0].Id != null, 'Account should be enabled as Buyer');
    }

    @isTest
    public static void testBuyerAccountNotCreated() {
        BuyerAccount ba = new BuyerAccount();
        List<Account> accountList = [SELECT Id, k_ARIS_Account_ID__c FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_1234' LIMIT 1];

        ba.BuyerId = accountList[0].Id;
        ba.Name = 'Test1';
        ba.isActive = true;

        try {
            insert ba;
            List<BuyerAccount> buyerList = [SELECT Id, BuyerId FROM BuyerAccount WHERE BuyerId = :accountList[0].Id LIMIT 1];
            System.assert(buyerList[0].Id == null, 'Account should not be enabled as Buyer');
        } catch (Exception e) {
            System.assert(e != null, 'testGetUser should throw an error');
        }
    }

    @isTest
    public static void testBuyerAccountNotCreatedNB() {
        BuyerAccount ba = new BuyerAccount();
        List<Account> accountList = [SELECT Id, k_ARIS_Account_ID__c FROM Account WHERE k_ARIS_Account_ID__c = 'DENB_1234' LIMIT 1];

        ba.BuyerId = accountList[0].Id;
        ba.Name = 'Test1';
        ba.isActive = true;

        try {
            insert ba;
            List<BuyerAccount> buyerList = [SELECT Id, BuyerId FROM BuyerAccount WHERE BuyerId = :accountList[0].Id LIMIT 1];
            System.assert(buyerList[0].Id == null, 'Account should not be enabled as Buyer');
        } catch (Exception e) {
            System.assert(e != null, 'testGetUser should throw an error');
        }
    }
}
