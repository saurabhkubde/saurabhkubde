/*
 *  Test class to test "B2B_ContactCustomerSupportController" and its methods.
 *
 *  @author – Garima Kour – Garima.kour@theblueflamelabs.com
 */
@isTest
public class B2B_ContactCustomerSupportContTest {
    /*
     * Setup method to create Test data
     */
    @testSetup
    static void setup() {
        UserRole userrole = [SELECT Id, DeveloperName FROM UserRole WHERE DeveloperName = 'k_Sil_International_HQ' LIMIT 1];

        User userRecord = B2B_TestDataFactory.createUser('test0', 'test0', 'test0@ksection.com', UserInfo.getProfileId());
        userRecord.Phone = '1234567890';
        userRecord.k_Rep_Code__c = '567';
        userRecord.IsActive = true;
        userRecord.UserRoleId = userRole.Id;
        insert userRecord;

        User userRecord2 = B2B_TestDataFactory.createUser('test2', 'test2', 'test2@ksection.com', UserInfo.getProfileId());
        userRecord2.Phone = '1234567890';
        insert userRecord2;

        User userRecord3 = B2B_TestDataFactory.createUser('test1', 'test1', 'test011@ksection.com', UserInfo.getProfileId());
        userRecord3.Phone = '1234567890';
        insert userRecord3;
        System.runAs(userRecord2) {
            B2B_TestDataFactory.createCountrySpecificPreferenceSettingRecords();
        }
        System.runAs(userRecord) {
            Id prospectRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName()
                .get(B2B_Constants.PROSPECT_RECORD_TYPE_DEVELOPER_NAME)
                .getRecordTypeId();
            List<Account> accountsList = B2B_TestDataFactory.createAccounts(2, 'testProspect1', 'Prospect_B2B', false);

            accountsList[0].recordTypeId = prospectRecordTypeId;
            accountsList[0].OwnerId = userRecord.Id;
            accountsList[0].k_Account_No__c = '123456';
            accountsList[0].k_Sales_Rep_Silhouette__c = userRecord2.Id;
            accountsList[0].NB_Account_executive__c = userRecord2.Id;
            accountsList[0].k_SVSTrainer__c = userRecord2.Id;
            accountsList[0].k_Style_Consultant__c = userRecord2.Id;
            accountsList[0].k_Trainer__c = userRecord2.Id;
            accountsList[0].k_SVS_Trainer1__c = userRecord2.Id;
            accountsList[0].k_SVS_Trainer__c = userRecord2.Id;
            accountsList[0].k_Sales_Rep_EvilEye__c = userRecord2.Id;
            accountsList[0].k_Stage__c = 'Prospect_B2B';
            accountsList[0].Brand__c = Bfl_Constant.SH_BRAND_FULL;
            accountsList[0].k_ARIS_Account_ID__c = 'DEDE12345';
            accountsList[0].k_Email__c = 'test@exampletest.com';
            accountsList[0].Store_Country__c = 'Germany';
            accountsList[0].B2B_SVS_Customer_Service_Agent__c = userRecord2.Id; //BS-2055

            accountsList[1].recordTypeId = prospectRecordTypeId;
            accountsList[1].OwnerId = userRecord.Id;
            accountsList[1].k_Account_No__c = '1234567';
            accountsList[1].k_Sales_Rep_Silhouette__c = userRecord2.Id;
            accountsList[1].NB_Account_executive__c = userRecord2.Id;
            accountsList[1].k_SVSTrainer__c = userRecord2.Id;
            accountsList[1].k_Style_Consultant__c = userRecord2.Id;
            accountsList[1].k_Trainer__c = userRecord2.Id;
            accountsList[1].k_SVS_Trainer1__c = userRecord2.Id;
            accountsList[1].k_SVS_Trainer__c = userRecord2.Id;
            accountsList[1].k_Sales_Rep_EvilEye__c = userRecord2.Id;
            accountsList[1].k_Stage__c = 'Prospect_B2B';
            accountsList[1].Brand__c = Bfl_Constant.NB_BRAND_FULL;
            accountsList[1].k_ARIS_Account_ID__c = 'DEDE123456';
            accountsList[1].k_Email__c = 'testnb@exampletest.com';
            accountsList[1].Store_Country__c = 'Germany';
            accountsList[1].B2B_SVS_Customer_Service_Agent__c = userRecord2.Id; //BS-2055

            insert accountsList;
            Contact objContactRecord = B2B_TestDataFactory.createContact('Mr.', 'test', 'con', accountsList[0].Id, false);
            insert objContactRecord;

            Contact objContactNBRecord = B2B_TestDataFactory.createContact('Mr.', 'test', 'contact', accountsList[1].Id, false);
            insert objContactNBRecord;

            Id b2bSilUserProfile = [SELECT id FROM profile WHERE name = 'B2B Commerce User Silhouette'].id;

            List<User> userList = new List<User>{
                new User(
                    alias = 'test123',
                    email = 'test123@noemail.com',
                    emailencodingkey = 'UTF-8',
                    lastname = 'Testing commerce user',
                    languagelocalekey = 'en_US',
                    localesidkey = 'en_US',
                    profileid = b2bSilUserProfile,
                    country = 'Germany',
                    IsActive = true,
                    ContactId = objContactRecord.Id,
                    timezonesidkey = 'America/Los_Angeles',
                    username = 'tester@noemail.com'
                ),
                new User(
                    alias = 'test1234',
                    email = 'test1234@noemail.com',
                    emailencodingkey = 'UTF-8',
                    lastname = 'Testing NB commerce user',
                    languagelocalekey = 'en_US',
                    localesidkey = 'en_US',
                    profileid = b2bSilUserProfile,
                    country = 'Germany',
                    IsActive = true,
                    ContactId = objContactNBRecord.Id,
                    timezonesidkey = 'America/Los_Angeles',
                    username = 'testerNB@noemail.com'
                )
            };
            insert userList;
        }
    }

    /**
     * This method will update the repCodes of the accounts so that it populates Account Executives respectively
     */
    private static void updateAccountRepCodes() {
        List<Account> accountObjList = [
            SELECT
                Id,
                Name,
                recordTypeId,
                OwnerId,
                k_Sales_Rep_Silhouette__c,
                k_SVSTrainer__c,
                k_Style_Consultant__c,
                k_Trainer__c,
                k_SVS_Trainer1__c,
                k_SVS_Trainer__c,
                k_Sales_Rep_EvilEye__c,
                k_SH_Account_Executive_2__c,
                k_Stage__c
            FROM Account
            WHERE k_Account_No__c = '123456'
        ];
        accountObjList[0].k_SH_ARIS_Rep_code__c = '567';
        accountObjList[0].k_SVS_Trainer_ARIS_Rep_code__c = '567';
        accountObjList[0].k_NB_ARIS_Rep_Code__c = '567';
        accountObjList[0].k_StyleConsRC__c = '567';
        accountObjList[0].k_SVSTrain1RC__c = '567';
        accountObjList[0].EE_Rep__c = '567';
        accountObjList[0].k_SVS_ARIS_Rep_code__c = '567';
        update accountObjList;
    }

    /*
     * this method will check if the new Account is getting created or not according to user Input
     */
    @isTest
    private static void newB2BAccountCreationTest() {
        Map<String, Object> userInputMap = genrateUserInput(false, false, Bfl_Constant.EE_BRAND_FULL, 'salesvisit', 'false');
        String msg = B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow(
            userInputMap,
            true,
            '',
            'en_US',
            false,
            'Test File Content',
            'TestName'
        );
        List<Account> accountList = [SELECT k_Email__c, Store_Country__c FROM Account WHERE k_Email__c = 'test@test.com'];
        List<Task> taskList = [SELECT Id FROM Task WHERE WhatId = :accountList[0].Id];
        System.assertEquals('Success', msg, 'account not created');
        System.assertEquals(1, accountList.size(), 'account not created');
        System.assertEquals(1, taskList.size(), 'Task not created');
        System.assertEquals('Germany', accountList[0].Store_Country__c, 'store country not populated');
    }

    /*
     * this method will check if the error is thrown or not when Account Number is Invalid
     */
    @isTest
    private static void whenAccountNumberIsInvalidTest() {
        Map<String, Object> userInputMap = genrateUserInput(false, true, Bfl_Constant.EE_BRAND_FULL, 'salesvisit', '342765');
        String msg = B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow(
            userInputMap,
            true,
            '',
            'en_US',
            false,
            'Test File Content',
            'TestName'
        );
        System.assertNotEquals('Success', msg, 'Invalid Account Number');
    }
    /*
     * this method will test if task is getting created or not when request is sales visit and AE is present for Silhouette.
     */
    @isTest
    private static void requestForSalesVisitWhenAEPresentForSHTest() {
        B2B_ContactCustomerSupportContTest.updateAccountRepCodes();
        Map<String, Object> userInputMap = genrateUserInput(false, true, Bfl_Constant.SH_BRAND_FULL, 'salesvisit', '123456');
        String msg = B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow(
            userInputMap,
            true,
            '',
            'en_US',
            false,
            'Test File Content',
            'TestName'
        );
        List<Task> taskList = [SELECT Status FROM Task WHERE Subject = :System.Label.B2B_ProspectB2B_Task_Subject_Other];
        System.assertEquals('Success', msg, 'Account not Created');
        System.assertEquals(1, taskList.size(), 'task not created');
    }
    /*
     * this method will test if task is getting created or not when request is sales visit and AE is present for Evil Eye.
     */
    @isTest
    private static void requestForSalesVisitWhenAEPresentForEETest() {
        B2B_ContactCustomerSupportContTest.updateAccountRepCodes();
        Map<String, Object> userInputMap = genrateUserInput(false, true, Bfl_Constant.EE_BRAND_FULL, 'salesvisit', '123456');
        String msg = B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow(
            userInputMap,
            true,
            '',
            'en_US',
            false,
            'Test File Content',
            'TestName'
        );
        List<Task> taskList = [SELECT Status FROM Task WHERE Subject = :System.Label.B2B_ProspectB2B_Task_Subject_Other];
        System.assertEquals('Success', msg, 'task not created');
        System.assertEquals(1, taskList.size(), 'task not created');
    }

    /*
     * this method will check if the error is occuring while account creation
     */
    @isTest
    private static void newB2BAccountCreationErrorTest() {
        Map<String, Object> userInputMap = new Map<String, Object>();
        String msg = B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow(
            userInputMap,
            true,
            '',
            'en_US',
            false,
            'Test File Content',
            'TestName'
        );
        System.assertEquals(System.Label.B2B_Something_Went_Wrong, msg, 'account not created');
    }

    /*
     * this method will test if task is getting created or not when request is sales visit and AE is present for NB.
     */
    @isTest
    private static void requestForSalesVisitWhenAEPresentForNBTest() {
        B2B_ContactCustomerSupportContTest.updateAccountRepCodes();
        Map<String, Object> userInputMap = genrateUserInput(false, true, Bfl_Constant.NB_BRAND_FULL, 'salesvisit', '1234567');
        String msg = B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow(
            userInputMap,
            true,
            '',
            'en_US',
            false,
            'Test File Content',
            'TestName'
        );
        List<Task> taskList = [SELECT Status FROM Task WHERE Subject = :System.Label.B2B_ProspectB2B_Task_Subject_Other];
        System.assertEquals('Success', msg, 'task not created');
        System.assertEquals(1, taskList.size(), 'task not created');
    }

    /*
     * this method will test if task is getting created or not when request is Other and AE is present.
     */
    @isTest
    private static void requestForOtherWhenAEisPresentTest() {
        B2B_ContactCustomerSupportContTest.updateAccountRepCodes();
        Map<String, Object> userInputMap = genrateUserInput(false, true, Bfl_Constant.EE_BRAND_FULL, 'other', '123456');
        String msg = B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow(
            userInputMap,
            true,
            '',
            'en_US',
            false,
            'Test File Content',
            'TestName'
        );
        List<Task> taskList = [SELECT Status FROM Task WHERE Subject = :System.Label.B2B_ProspectB2B_Task_Subject_Other];
        System.assertEquals('Success', msg, 'task not created');
        System.assertEquals(1, taskList.size(), 'task not created');
    }

    /*
     * this method will test if task is getting created or not when request is sales visit and AE is Not present for Silhouette.
     */
    @isTest
    private static void requestForSalesVisitWhenAENotPresentTest() {
        Map<String, Object> userInputMap = genrateUserInput(false, true, Bfl_Constant.SH_BRAND_FULL, 'salesvisit', '123456');
        String msg = B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow(
            userInputMap,
            true,
            '',
            'en_US',
            false,
            'Test File Content',
            'TestName'
        );
        List<Task> taskList = [SELECT Status FROM Task WHERE Subject = :System.Label.B2B_ProspectB2B_Task_Subject_Other];
        System.assertEquals('Success', msg, 'task not created');
        System.assertEquals(1, taskList.size(), 'task not created');
    }
    /*
     * this method will test if task is getting created or not when request is sales visit and AE is Not present for NeuBau.
     */
    @isTest
    private static void requestForSalesVisitWhenAENotPresentforNBTest() {
        Map<String, Object> userInputMap = genrateUserInput(false, true, Bfl_Constant.NB_BRAND_FULL, 'other', '1234567');
        String msg = B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow(
            userInputMap,
            true,
            '',
            'en_US',
            false,
            'Test File Content',
            'TestName'
        );
        List<Task> taskList = [SELECT Status FROM Task WHERE Subject = :System.Label.B2B_ProspectB2B_Task_Subject_Other];
        System.assertEquals('Success', msg, 'task not created');
        System.assertEquals(1, taskList.size(), 'task not created');
    }

    /*
     * this method will test if task is getting created or not when request is sales visit and from Logged in User.
     *
     */
    @isTest
    private static void requestForSalesVisitLoggedInUserTest() {
        User userlist1 = [SELECT lastName FROM User WHERE Email = 'test123@noemail.com' LIMIT 1];
        Map<String, Object> userInputMap = genrateUserInput(true, true, Bfl_Constant.SH_BRAND_FULL, 'salesvisit', '');
        Test.startTest();
        B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow(
            userInputMap,
            false,
            userlist1.Id,
            'en_US',
            false,
            'Test File Content',
            'TestName'
        );
        Test.stopTest();
        List<Task> taskList = [SELECT Status FROM Task WHERE Subject = :System.Label.B2B_ProspectB2B_Task_Subject_Other];
        System.assertEquals(1, taskList.size(), 'task not created');
    }

    /*
     * BS-111
     * this method will test if task is getting created or not when AE not present and request is for Address Change and from Logged in User.
     */
    @isTest
    private static void requestForAddressChangeLoggedInUserWhenNoAETest() {
        User userlist1 = [SELECT Id, Username, lastName FROM User WHERE Email = 'test123@noemail.com' LIMIT 1];
        B2B_ContactCustomerSupportContTest.updateAccountRepCodes();
        Map<String, Object> userInputMap = genrateUserInput(true, true, Bfl_Constant.SH_BRAND_FULL, 'addresschange', '');
        Test.startTest();
        B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow(
            userInputMap,
            false,
            userlist1.Id,
            'en_US',
            false,
            'Test File Content',
            'TestName'
        );
        Test.stopTest();
        List<Task> taskList = [SELECT Status FROM Task WHERE Subject = :System.Label.B2B_ProspectB2B_Task_Subject_Other];
        System.assertEquals(1, taskList.size(), 'task not created');
    }

    /* Start : BS-2055 */
    @isTest
    private static void requestForSalesVisitLoggedInUserSVSTest() {
        User userlist1 = [SELECT lastName FROM User WHERE Email = 'test123@noemail.com' LIMIT 1];
        Map<String, Object> userInputMap = genrateUserInput(true, true, System.Label.B2B_SVS_BRAND_LABEL, 'salesvisit', '1234567');
        Test.startTest();
        B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow(
            userInputMap,
            false,
            userlist1.Id,
            'en_US',
            false,
            'Test File Content',
            'TestName'
        );
        Test.stopTest();
        List<Task> taskList = [SELECT Status FROM Task WHERE Subject = :System.Label.B2B_ProspectB2B_Task_Subject_Other];
        System.assertEquals(1, taskList.size(), 'task not created');
    }

    @isTest
    private static void requestForSalesVisitLoggedInUserNoAESVSTest() {
        User userlist1 = [SELECT lastName FROM User WHERE Email = 'test123@noemail.com' LIMIT 1];
        for (Account accObj : [SELECT Id FROM Account WHERE k_Account_No__c = '1234567']) {
        }
        Map<String, Object> userInputMap = genrateUserInput(true, true, System.Label.B2B_SVS_BRAND_LABEL, 'other', '1234567');
        Test.startTest();
        B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow(
            userInputMap,
            false,
            userlist1.Id,
            'en_US',
            false,
            'Test File Content',
            'TestName'
        );
        Test.stopTest();
        List<Task> taskList = [SELECT Status FROM Task WHERE Subject = :System.Label.B2B_ProspectB2B_Task_Subject_Other];
        System.assertEquals(1, taskList.size(), 'task not created');
    }

    /* End : BS-2055 */

    /*
     * this method will genrate sample user input which is needed to call the class.
     */
    private static Map<String, Object> genrateUserInput(
        Boolean isLoggedInuser,
        Boolean isAccountNumberPresent,
        String brand,
        String request,
        String accNumber
    ) {
        Map<String, Object> userInputMap;
        if (!isLoggedInuser) {
            if (isAccountNumberPresent) {
                userInputMap = new Map<String, Object>{
                    'accountBrand' => brand,
                    'storeCountry' => 'Germany',
                    'accountNumber' => accNumber,
                    'contactName' => 'Test Contact',
                    'accountEmail' => 'test@test.com',
                    'accountName' => 'Test Optician',
                    'phone' => '7788665578',
                    'request' => request,
                    'requestMessage' => 'test msg'
                };
            } else {
                userInputMap = new Map<String, Object>{
                    'accountBrand' => brand,
                    'accountNumber' => null,
                    'contactName' => 'Test Contact',
                    'accountEmail' => 'test@test.com',
                    'accountName' => 'Test Optician',
                    'phone' => '7788665578',
                    'request' => request,
                    'storeCountry' => 'Germany',
                    'requestMessage' => 'test msg'
                };
            }
        } else {
            userInputMap = new Map<String, Object>{
                'accountBrand' => brand,
                'contactName' => 'Test Contact',
                'contactEmail' => 'test@test.com',
                'request' => request,
                'storeCountry' => 'Germany',
                'requestMessage' => 'test msg'
            };
        }
        return userInputMap;
    }
}
