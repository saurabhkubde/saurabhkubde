@isTest
private with sharing class B2B_RegistrationTest {
    @SuppressWarnings('PMD.debugsshoulduselogginglevel')
    @TestSetup
    static void dataSetup() {
        UserRole userrole = [SELECT Id, DeveloperName FROM UserRole WHERE DeveloperName = 'k_Sil_International_HQ' LIMIT 1];

        User userRecord = B2B_TestDataFactory.createUser('test0', 'test0', 'test0@ksection.com', UserInfo.getProfileId());
        userRecord.Phone = '1234567890';
        userRecord.k_Rep_Code__c = '567';
        userRecord.IsActive = true;
        userRecord.UserRoleId = userRole.Id;
        insert userRecord;
        System.runAs(userRecord) {
            Id accountRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Account').getRecordTypeId();
            List<Account> accountList = new List<Account>();
            Account acc = B2B_TestDataFactory.createTestAccount();
            acc.k_ARIS_Account_ID__c = 'DEDE_123';
            acc.k_Account_No__c = 'DEDE_123';
            acc.k_Account_Status_Silhouette__c = '1';
            acc.Acct_Stat_EE__c = '1';
            acc.B2B_Vision_Sensation__c = true;
            acc.B2B_Sonnenverglasung__c = true;
            acc.k_Stage__c = 'Account';
            acc.Brand__c = 'Silhouette';
            acc.k_Customer_Status__c = '1';
            acc.RecordTypeId = accountRecordTypeId;
            acc.k_Email__c = 'test5.email@test.com';
            acc.Store_Country__c = 'Germany';
            acc.B2B_ERP_Pricebook__c = 'Buyer Group Germany - Silhouette (Gen)'; //BS-1964
            accountList.add(acc);

            Account acc2 = B2B_TestDataFactory.createTestAccount();
            acc2.k_ARIS_Account_ID__c = 'DEDE_456';
            acc2.k_Account_No__c = 'DEDE_456';
            acc2.k_Account_Status_Silhouette__c = '1';
            acc2.RecordTypeId = accountRecordTypeId;
            acc2.B2B_ERP_Pricebook__c = 'Buyer Group Germany - Silhouette (Gen)'; //BS-1964
            accountList.add(acc2);

            Account acc3 = B2B_TestDataFactory.createTestAccount();
            acc3.k_ARIS_Account_ID__c = 'DEDE_789';
            acc3.k_Account_No__c = 'DEDE_789';
            acc3.CSG_SubSeg_EE__c = '123';
            acc3.Acct_Stat_EE__c = '1';
            acc3.B2B_Vision_Sensation__c = true;
            acc3.B2B_Sonnenverglasung__c = true;
            acc3.k_Stage__c = 'Account';
            acc3.Brand__c = 'evil eye';
            acc3.k_Customer_Status__c = '1';
            acc3.k_B2B_Shop_Username__c = 'DEDE_789';
            acc3.B2B_ERP_Pricebook__c = 'Buyer Group Germany - Silhouette (Gen)'; //BS-1964
            acc3.RecordTypeId = accountRecordTypeId;
            insert acc3;

            Account acc4 = B2B_TestDataFactory.createTestAccount();
            acc4.k_ARIS_Account_ID__c = 'NB_556';
            acc4.k_Account_No__c = 'NB_556';
            acc4.RecordTypeId = accountRecordTypeId;
            accountList.add(acc4);

            Account acc5 = B2B_TestDataFactory.createTestAccount();
            acc5.k_ARIS_Account_ID__c = '7556';
            acc5.k_Account_No__c = '7556';
            acc5.RecordTypeId = accountRecordTypeId;
            acc5.k_Email__c = 'test1.email@test.com';
            acc5.Store_Country__c = 'Germany';
            accountList.add(acc5);
            insert accountList;

            List<String> buyerGroupNameList = new List<String>();
            List<BuyerGroup> buyerGroupList = new List<BuyerGroup>();
            List<Brand_to_Buyer_Group_Mapping__mdt> buyerGroupMetadataList = Brand_to_Buyer_Group_Mapping__mdt.getAll().values();
            for (Brand_to_Buyer_Group_Mapping__mdt buyerGroupMetadataObj : buyerGroupMetadataList) {
                if (buyerGroupNameList.contains(buyerGroupMetadataObj.Buyer_Group_Name__c) == false) {
                    buyerGroupNameList.add(buyerGroupMetadataObj.Buyer_Group_Name__c);
                }
            }
            for (String buyerGroupName : buyerGroupNameList) {
                BuyerGroup buyerGroupObj = new BuyerGroup();
                buyerGroupObj.Name = buyerGroupName;
                buyerGroupList.add(buyerGroupObj);
            }
            insert buyerGroupList;

            Contact existingContact = new Contact();
            existingContact.Salutation = 'N/A';
            existingContact.AccountId = acc3.Id;
            existingContact.FirstName = acc3.Name;
            existingContact.LastName = acc3.Name;
            existingContact.Email = 'test.email2@test.com';
            existingContact.k_Function__c = 'Other';
            insert existingContact;

            Id b2bSilUserProfile = [SELECT id FROM profile WHERE name = 'B2B Commerce User Silhouette'].id;
            User userObj = new User(
                alias = 'test123',
                email = 'test.email2@test.com',
                emailencodingkey = 'UTF-8',
                lastname = 'Testing',
                languagelocalekey = 'en_US',
                localesidkey = 'en_US',
                profileid = b2bSilUserProfile,
                country = 'Germany',
                CommunityNickname = 'DEDE_789',
                IsActive = true,
                ContactId = existingContact.Id,
                timezonesidkey = 'America/Los_Angeles',
                username = 'test.email2@test.com'
            );
            insert userObj;

            B2B_Country_Specific_Preference_Setting__c countrySpecificSetting = new B2B_Country_Specific_Preference_Setting__c(
                Name = 'Germany',
                B2B_Account_Brand__c = 'Silhouette,evil eye',
                B2B_Country__c = 'Germany',
                B2B_Type__c = 'Customer Service Information',
                B2B_Customer_Service_Telephone_Number__c = '0049(0)7141 4420-10',
                B2B_Customer_Service_Username__c = userObj.Username
            );
            insert countrySpecificSetting;
        }
    }
    @isTest
    private static void testGetUser() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"DEDE_123","accountEmail":"test.email@test.com","accountName":"Test","city":"Berlin","zipCode":"12345"';
        List<Account> accountObjectList = [SELECT Id, Name, Store_Country__c FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123' LIMIT 1];
        registrationForm += '"countryName":"' + accountObjectList[0].Store_Country__c + '"}';
        String functionResult;
        try {
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'de', true);
            List<User> insertedUser = [SELECT UserName FROM User WHERE Email = 'test.email@test.com' LIMIT 1];
            String sandboxName = (String) System.DomainParser.parse(URL.getOrgDomainUrl()).getSandboxName();
            System.assertEquals(functionResult, '', 'Function failed');
            System.assertEquals(insertedUser[0].UserName, 'test.email@test.com' + sandboxName, 'User Not Found');
        } catch (Exception e) {
            System.assert(e != null, 'testGetUser should throw an error');
        }
    }

    @isTest
    private static void testGetUserNonSilForNonDE() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"123","accountEmail":"test.email@test.com","accountName":"Test","countryName":"Germany","city":"Berlin","zipCode":"12345"}';
        String functionResult;
        try {
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'en_US', false);
            System.assertEquals(System.Label.B2B_LOGIN_Account_Number_Not_Found, functionResult, 'Function failed');
        } catch (Exception e) {
            System.assert(e != null, 'testGetUser should throw an error');
        }
    }

    @isTest
    private static void testGetUserNonSilForDE() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"123","accountEmail":"test.email@test.com","accountName":"Test","countryName":"Germany","city":"Berlin","zipCode":"12345"}';
        String functionResult;
        try {
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'de', false);
            System.assertEquals(System.Label.B2B_LOGIN_Account_Number_Not_Found, functionResult, 'Function failed');
        } catch (Exception e) {
            System.assert(e != null, 'testGetUser should throw an error');
        }
    }

    @isTest
    private static void testExceptionCreateContact() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"DEDE_123","accountName":"Test","countryName":"Germany","city":"Berlin","zipCode":"12345"}';
        String functionResult;

        try {
            List<Account> lstAccount = [SELECT Id, k_Account_No__c, k_Email__c FROM Account WHERE k_Account_No__c = 'DEDE_123'];
            lstAccount[0].k_Email__c = null;
            update lstAccount;
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'de', false);
            System.assertEquals(System.Label.B2B_Login_Existing_User_Page_Error, functionResult, 'Function failed');
        } catch (Exception e) {
            System.assert(e != null, 'testGetUser should throw an error');
        }
    }

    @isTest
    private static void testExceptionUpdateContact() {
        Savepoint sp = Database.setSavepoint();
        try {
            B2B_Registration.updateContact(null, null, sp);
        } catch (Exception e) {
            System.assert(e != null, 'updateContact should throw an error');
        }
    }

    @isTest
    private static void testExceptioncreateBuyerGroupAssignment() {
        Savepoint sp = Database.setSavepoint();
        try {
            B2B_Registration.createBuyerGroupAssignment(null, sp); //BS-1964
        } catch (Exception e) {
            System.assert(e != null, 'createBuyerGroupAssignment should throw an error');
        }
    }

    @isTest
    private static void testGetUserIsSilhouetteForNonDE() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"123","accountEmail":"test.email@test.com","accountName":"Test","countryName":"Germany","city":"Berlin","zipCode":"12345"}';
        String functionResult;
        try {
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'en_US', true);
            System.assertEquals(System.Label.B2B_LOGIN_Account_Number_Not_Found, functionResult, 'Function failed');
        } catch (Exception e) {
            System.assert(e != null, 'testGetUser should throw an error');
        }
    }

    @isTest
    private static void testStageValidationFailure() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"7556","accountName":"Test","countryName":"Germany","city":"Berlin","zipCode":"12345"}';
        String functionResult;
        Test.startTest();
        try {
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'de', true);
        } catch (Exception e) {
        }
        Test.stopTest();
        System.assertEquals(System.Label.B2B_LOGIN_Account_Number_Not_Found, functionResult, 'Function failed');
    }
    @isTest
    private static void testEnableBuyerAccountException() {
        String registrationForm = '{"accountNumber":"DEDE_123","accountEmail":"test.email@test.com","accountName":"Test","countryName":"Germany","city":"Berlin","zipCode":"12345"}';
        String functionResult;
        try {
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'de', true);
        } catch (Exception e) {
            System.assert(e != null, 'testGetUser should throw an error');
        }
    }

    @isTest
    private static void testExceptionCreateTask() {
        List<User> customerServiceUserList = new List<User>();
        try {
            Test.startTest();
            Savepoint sp = Database.setSavepoint();
            B2B_Registration.createTask(null, null, sp, null, true, customerServiceUserList);
            Test.stopTest();
        } catch (Exception e) {
            System.assert(e != null, 'testGetUser should throw an error');
        }
    }
    @isTest
    private static void testGetUserOnlySilhouette() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"DEDE_456","accountEmail":"test.email@test.com","accountName":"Test","city":"Berlin","zipCode":"12345"';
        List<Account> accountObjectList = [SELECT Id, Name, Store_Country__c FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123' LIMIT 1];
        registrationForm += '"countryName":"' + accountObjectList[0].Store_Country__c + '"}';
        String functionResult;
        try {
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'de', true);
            List<User> insertedUser = [SELECT UserName FROM User WHERE Email = 'test.email@test.com' LIMIT 1];
            String sandboxName = (String) System.DomainParser.parse(URL.getOrgDomainUrl()).getSandboxName();
            System.assertEquals(functionResult, '', 'Function failed');
            System.assertEquals(insertedUser[0].UserName, 'test.email@test.com' + sandboxName, 'User Not Found');
        } catch (Exception e) {
            System.assert(e != null, 'testGetUser should throw an error');
        }
    }

    @isTest
    private static void testGetUserOnlyEvilEye() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"DEDE_789","accountEmail":"test.email@test.com","accountName":"Test","city":"Berlin","zipCode":"12345"';
        List<Account> accountObjectList = [SELECT Id, Name, Store_Country__c FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123' LIMIT 1];
        registrationForm += '"countryName":"' + accountObjectList[0].Store_Country__c + '"}';
        String functionResult;
        try {
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'de', true);
            List<User> insertedUser = [SELECT UserName FROM User WHERE Email = 'test.email@test.com' LIMIT 1];
            String sandboxName = (String) System.DomainParser.parse(URL.getOrgDomainUrl()).getSandboxName();
            System.assertEquals(functionResult, '', 'Function failed');
            System.assertEquals(insertedUser[0].UserName, 'test.email@test.com' + sandboxName, 'User Not Found');
        } catch (Exception e) {
            System.assert(e != null, 'testGetUser should throw an error');
        }
    }

    @isTest
    private static void testGetUserOnlyNeubau() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"NB_556","accountEmail":"test.email@test.com","accountName":"Test","countryName":"Germany","city":"Berlin","zipCode":"12345"}';
        String functionResult;
        try {
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'de', false);
            List<User> insertedUser = [SELECT UserName FROM User WHERE Email = 'test.email@test.com' LIMIT 1];
            String sandboxName = (String) System.DomainParser.parse(URL.getOrgDomainUrl()).getSandboxName();
            System.assertEquals(functionResult, '', 'Function failed');
            System.assertEquals(insertedUser[0].UserName, 'test.email@test.com' + sandboxName, 'User Not Found');
        } catch (Exception e) {
            System.assert(e != null, 'testGetUser should throw an error');
        }
    }

    @isTest
    private static void testGetUserForExistingContact() {
        String registrationForm = '{"accountNumber":"DEDE_789","accountEmail":"test.email2@test.com","accountName":"Test","countryName":"Germany","city":"Berlin","zipCode":"12345"}';
        String functionResult;
        try {
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'de', false);
            List<User> insertedUser = [SELECT UserName FROM User WHERE Email = 'test.email2@test.com' LIMIT 1];
            System.assertEquals('', functionResult, 'Function failed');
            System.assertEquals(insertedUser[0].UserName, 'test.email2@test.com', 'User Not Found');
            System.assertEquals(insertedUser[0].CommunityNickname, 'DEDE_789', 'User should have the correct nickname');
        } catch (Exception e) {
            System.assert(e != null, 'testGetUser should throw an error');
        }
    }

    @isTest
    private static void testTaskCreation() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"DEDE_456","accountEmail":"test.email@test.com","accountName":"Test","city":"Berlin","zipCode":"12345"}';
        String functionResult;
        try {
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'en_US', true);
            Account acc = [SELECT Id FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_456' LIMIT 1][0];
            Task tsk = [SELECT Subject FROM Task WHERE WhatId = :acc.Id LIMIT 1][0];

            System.assertEquals(functionResult, System.Label.B2B_LOGIN_Generic_Error, 'Function failed');
            System.assertEquals(tsk.Subject, 'Existing Customer Issue for DEDE_456', 'Task created incorrectly');
        } catch (Exception e) {
            System.assert(e != null, 'testTaskCreation should throw an error');
        }
    }

    @isTest
    private static void testAccountNumberNotFound() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"DEDE_4565","accountEmail":"test.email@test.com","accountName":"Test","countryName":"Germany","city":"Berlin","zipCode":"12345"}';
        String functionResult;
        try {
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'en_US', false);
            System.assertEquals(functionResult, System.Label.B2B_LOGIN_Account_Number_Not_Found, 'Function run incorrectly');
        } catch (Exception e) {
            System.assert(e != null, 'testTaskCreation should throw an error');
        }
    }

    @isTest
    private static void testBuyerAccountFound() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"DEDE_123","accountEmail":"test.email@test.com","accountName":"Test","city":"Berlin","zipCode":"12345"';

        List<Account> accountObjectList = [SELECT Id, Name, Store_Country__c FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123' LIMIT 1];
        registrationForm += '"countryName":"' + accountObjectList[0].Store_Country__c + '"}';
        BuyerAccount buyerAccountObject = new BuyerAccount();
        buyerAccountObject.BuyerId = accountObjectList[0].Id;
        buyerAccountObject.Name = accountObjectList[0].Name;
        buyerAccountObject.isActive = true;
        insert buyerAccountObject;

        String functionResult;
        try {
            functionResult = B2B_Registration.getUserAccess(registrationForm, 'de', true);
            List<BuyerAccount> buyerList = [SELECT Id, Name, BuyerId FROM BuyerAccount WHERE BuyerId = :accountObjectList[0].Id];
            System.assertEquals(functionResult, System.Label.B2B_Already_A_Buyer_Account, 'Function run incorrectly');
            System.assertEquals(buyerList[0].Name, 'Silhouette Account', 'BuyerAccount created incorrectly');
        } catch (Exception e) {
            System.assert(e != null, 'testBuyerAccountFound should throw an error');
        }
    }

    //BS-1850
    @isTest
    private static void testGetAccountEmail() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"DEDE_123","accountEmail":"test.email@test.com","accountName":"Test","city":"Berlin","zipCode":"12345",';
        List<Account> accountObjectList = [SELECT Id, Name, Store_Country__c, k_Email__c FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123' LIMIT 1];
        registrationForm += '"countryName":"' + accountObjectList[0].Store_Country__c + '"}';
        Test.startTest();
        String functionResult;
        functionResult = B2B_Registration.getAccountEmail(registrationForm, true);
        System.assertEquals(functionResult, accountObjectList[0].k_Email__c, ' getAccountEmail function failed.');
        Test.stopTest();
    }

    //BS-1850
    @isTest
    private static void testGetNonSilAccountEmail() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        String registrationForm = '{"accountNumber":"DEDE_123","accountEmail":"test.email@test.com","accountName":"Test","countryName":"Germany","city":"Berlin","zipCode":"12345"}';
        Test.startTest();
        String functionResult;
        functionResult = B2B_Registration.getAccountEmail(registrationForm, false);
        List<Account> accountObjectList = [SELECT Id, Name, Store_Country__c, k_Email__c FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123' LIMIT 1];
        System.assertEquals(functionResult, accountObjectList[0].k_Email__c, ' getAccountEmail function failed.');
        Test.stopTest();
    }

    //BS-2007
    @isTest
    private static void testRegisterAsBuyer() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        List<Account> accountObjectList = [SELECT Id, Name, Store_Country__c FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123' LIMIT 1];
        Test.startTest();
        String functionResult;
        functionResult = B2B_Registration.registerAsBuyer(accountObjectList[0].Id);
        System.assertEquals(functionResult, 'true', 'registerAsBuyer function failed.');
        Test.stopTest();
    }
}
