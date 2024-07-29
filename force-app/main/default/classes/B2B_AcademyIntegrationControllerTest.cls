@isTest
public with sharing class B2B_AcademyIntegrationControllerTest {
    @TestSetup
    static void dataSetup() {
        Id accountRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Account').getRecordTypeId();

        Account acc = B2B_TestDataFactory.createTestAccount();
        acc.k_Account_No__c = 'DENB_123';
        acc.CSG_SubSeg_EE__c = 'populated';
        acc.k_Stage__c = 'Account';
        acc.k_Customer_Status__c = '1';
        acc.Store_Country__c = 'United States';
        acc.B2B_SH_EE_Customer_Service_Agent__c = [SELECT Id FROM USER WHERE Id = :UserInfo.getUserId()].Id;
        acc.RecordTypeId = accountRecordTypeId;
        insert acc;

        Contact objContactRecord = B2B_TestDataFactory.createContact('Mr.', 'test', 'contact', acc.Id, false);
        objContactRecord.LMS_Is_Active__c = true;
        objContactRecord.LMS_Is_LMS_Contact__c = true;
        objContactRecord.B2B_Enabled_for_Partner_Portal__c = true;
        objContactRecord.LMS_License_Type_Client_role__c = 'ROLESTORE';
        insert objContactRecord;
    } //end dataSetup

    @isTest
    public static void checkCurrentUserCountryActiveTest() {
        List<Account> accountList = [SELECT Id, Name, Store_Country__c FROM Account WHERE Name = 'Silhouette Account'];

        Test.startTest();
        Boolean isActiveCountry = B2B_AcademyIntegrationController.checkCurrentUserCountryActive(accountList[0].Store_Country__c);
        Test.stopTest();

        System.assertEquals(true, isActiveCountry, 'Country is active');
    }

    @isTest
    public static void fetchContactsAssociatedWithAccountTest() {
        List<Account> accountList = [SELECT Id, Name, Store_Country__c FROM Account WHERE Name = 'Silhouette Account'];

        Test.startTest();
        List<Contact> contactList = B2B_AcademyIntegrationController.fetchContactsAssociatedWithAccount(accountList[0].Id);
        Test.stopTest();

        System.assertEquals(true, contactList.size() > 0, 'Contact list is not empty');
    }

    @isTest
    public static void sendEmailAndCreateTaskForCustomerServiceTest() {
        List<Account> accountList = [SELECT Id, Name, Store_Country__c FROM Account WHERE Name = 'Silhouette Account'];
        Map<String, Object> academyRegistrationInputMap = new Map<String, Object>{
            'salutation' => 'Mr',
            'firstName' => 'Test',
            'lastName' => 'Data',
            'emailAddress' => 'test@test.com',
            'function' => 'Dispensing Optician'
        };

        Test.startTest();
        Boolean isTaskCreated = B2B_AcademyIntegrationController.sendEmailAndCreateTaskForCustomerService(accountList[0].Id, academyRegistrationInputMap);
        Test.stopTest();

        System.assertEquals(true, isTaskCreated, 'Task created successfully');
    }
}
