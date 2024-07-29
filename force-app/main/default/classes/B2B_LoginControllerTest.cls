@isTest
public with sharing class B2B_LoginControllerTest {
    @IsTest
    public static void testGetAccountByAccountNumber() {
        B2B_LoginController.B2B_WithoutSharingController controller = new B2B_LoginController.B2B_WithoutSharingController();
        Account acc;

        try {
            acc = controller.getAccountByAccountNumber('DE123456');
        } catch (Exception e) {
            System.assert(acc == null, 'getAccountByAccountNumber should throw an excepion');
        }

        Account insertAcc = B2B_TestDataFactory.createTestAccount();
        insertAcc.k_B2B_Shop_Username__c = 'DE123456';
        insert insertAcc;

        acc = controller.getAccountByAccountNumber('DE123456');

        System.assertEquals(insertAcc.Id, acc.Id, 'The method should return the correct Account');
    }

    @IsTest
    public static void testGetUsernameByAccountNumber() {
        B2B_LoginController.B2B_WithoutSharingController controller = new B2B_LoginController.B2B_WithoutSharingController();
        String username;

        try {
            username = controller.getUsernameByAccountNumber('tstUser');
        } catch (Exception e) {
            System.assert(username == null, 'getUsernameByAccountNumber should throw an excepion');
        }
        Test.startTest();
        User insertedUser = B2B_TestDataFactory.createInsertCommerceUser();
        Test.stopTest();

        username = controller.getUsernameByAccountNumber('tstUser');

        System.assertEquals(insertedUser.Username.toUpperCase(), username.toUpperCase(), 'getUsernameByAccountNumber should return the inserted username');

        username = B2B_LoginController.getUsernameByAccountNumber('tstUser');

        System.assertEquals(insertedUser.Username.toUpperCase(), username.toUpperCase(), 'getUsernameByAccountNumber should return the inserted username');
    }

    @IsTest
    public static void testIsAccountBlockedForLogin() {
        try {
            B2B_LoginController.isAccountBlockedForLogin('DE123456', '');
        } catch (Exception e) {
            System.assert(e != null, 'getAccountByAccountNumber should throw an excepion');
        }

        Account accSil = B2B_TestDataFactory.createTestAccount();
        accSil.k_Customer_Status__c = '0';
        accSil.CSG_SubSeg_EE__c = 'test';
        accSil.SH_Subsegment__c = 'test';
        accSil.k_B2B_Shop_Username__c = 'DE123456';

        insert accSil;

        B2B_Utils.communityIdToWebstoreCache.put('Silhouette B2B Shop', new Webstore(Name = 'Silhouette B2B Shop'));

        try {
            B2B_LoginController.isAccountBlockedForLogin('DE123456', 'Silhouette B2B Shop');
        } catch (Exception e) {
            System.assert(e != null, 'isAccountBlockedForLogin should throw an excepion');
        }

        accSil.k_Customer_Status__c = '1';
        update accSil;

        B2B_LoginController.isAccountBlockedForLogin('DE123456', 'Silhouette B2B Shop');

        accSil.k_Customer_Status__c = '0';
        accSil.CSG_SubSeg_EE__c = '';
        accSil.SH_Subsegment__c = 'test';
        update accSil;

        try {
            B2B_LoginController.isAccountBlockedForLogin('DE123456', 'Silhouette B2B Shop');
        } catch (Exception e) {
            System.assert(e != null, 'isAccountBlockedForLogin should throw an excepion');
        }

        accSil.k_Customer_Status__c = '0';
        accSil.CSG_SubSeg_EE__c = 'test';
        accSil.SH_Subsegment__c = '';
        update accSil;

        try {
            B2B_LoginController.isAccountBlockedForLogin('DE123456', 'Silhouette B2B Shop');
        } catch (Exception e) {
            System.assert(e != null, 'isAccountBlockedForLogin should throw an excepion');
        }

        accSil.k_Customer_Status__c = '1';
        accSil.CSG_SubSeg_EE__c = '';
        accSil.SH_Subsegment__c = 'test';
        update accSil;

        B2B_LoginController.isAccountBlockedForLogin('DE123456', 'Silhouette B2B Shop');

        accSil.k_Customer_Status__c = '1';
        accSil.CSG_SubSeg_EE__c = '';
        accSil.SH_Subsegment__c = '';
        update accSil;

        try {
            B2B_LoginController.isAccountBlockedForLogin('DE123456', 'Silhouette B2B Shop');
        } catch (Exception e) {
            System.assert(e != null, 'isAccountBlockedForLogin should throw an excepion');
        }

        B2B_Utils.communityIdToWebstoreCache.put('Neubau B2B Shop', new Webstore(Name = 'Neubau B2B Shop'));

        Account accNB = B2B_TestDataFactory.createTestAccount();
        accNB.k_Customer_Status__c = '0';
        accNB.k_ARIS_Account_ID__c = 'DEDE_321';
        accNB.k_B2B_Shop_Username__c = 'DE654321';

        insert accNB;

        try {
            B2B_LoginController.isAccountBlockedForLogin('DE654321', 'Neubau B2B Shop');
        } catch (Exception e) {
            System.assert(e != null, 'isAccountBlockedForLogin should throw an excepion');
        }

        accNB.k_Customer_Status__c = '1';
        update accNB;

        try {
            B2B_LoginController.isAccountBlockedForLogin('DE654321', 'Neubau B2B Shop');
        } catch (Exception e) {
            // no exception should be thrown
        }
    }

    @IsTest
    public static void testGetUsernameByAccountNumberWithoutAccNumber() {
        try {
            B2B_LoginController.getUsernameByAccountNumber('');
        } catch (Exception e) {
            System.assert(e != null, 'getUsernameByAccountNumber should throw an excepion');
        }
    }

    // added due to missing assert for the login tests
    @SuppressWarnings('PMD.ApexUnitTestClassShouldHaveAsserts')
    @IsTest
    public static void testLogin() {
        User insertedUser = B2B_TestDataFactory.createInsertCommerceUser();

        System.setPassword(insertedUser.Id, 'testTEST1!');

        Account acc = new Account(k_ARIS_Account_ID__c = 'DEDE_123');
        acc.k_Customer_Status__c = '1';
        acc.CSG_SubSeg_EE__c = 'test';
        acc.SH_Subsegment__c = 'test';
        acc.k_B2B_Shop_Username__c = 'DE123456';

        upsert acc k_ARIS_Account_ID__c;

        B2B_Utils.communityIdToWebstoreCache.put('Silhouette B2B Shop', new Webstore(Name = 'Silhouette B2B Shop'));

        try {
            B2B_LoginController.login('DE123456', 'testTEST1!', 'Silhouette B2B Shop', 'de');
        } catch (Exception e) {
            //catch exception due to missing community to login
        }

        try {
            B2B_LoginController.login('', 'test', 'Silhouette B2B Shop', 'de');
        } catch (Exception e) {
            //catch exception due to wrong password
        }
    }

    @SuppressWarnings('PMD.ApexUnitTestClassShouldHaveAsserts')
    @IsTest
    public static void testLoginWithInvalidCredentials() {
        User insertedUser = B2B_TestDataFactory.createInsertCommerceUser();

        System.setPassword(insertedUser.Id, 'testTEST1!');

        Account acc = new Account(k_ARIS_Account_ID__c = 'DEDE_123');
        acc.k_Customer_Status__c = '1';
        acc.CSG_SubSeg_EE__c = 'test';
        acc.SH_Subsegment__c = 'test';
        acc.k_B2B_Shop_Username__c = 'DE123456';

        upsert acc k_ARIS_Account_ID__c;

        B2B_Utils.communityIdToWebstoreCache.put('Silhouette B2B Shop', new Webstore(Name = 'Silhouette B2B Shop'));

        try {
            B2B_LoginController.login('DE1234567899', 'testTEST1!7878', 'Silhouette B2B Shop', 'de');
        } catch (Exception e) {
            Assert.areEqual('Script-thrown exception', e.getMessage(), 'Should throw the script thrown exception');
        }

        try {
            B2B_LoginController.login('', 'test2345', 'Silhouette B2B Shop', 'de');
        } catch (Exception e) {
            Assert.areEqual('Script-thrown exception', e.getMessage(), 'Should throw the script thrown exception');
        }
    }

    //BS-1861
    @SuppressWarnings('PMD.ApexUnitTestClassShouldHaveAsserts')
    @IsTest
    public static void testLoginWithInactiveAccountCredentials() {
        User insertedUser = B2B_TestDataFactory.createInsertCommerceUser();

        System.setPassword(insertedUser.Id, 'testTEST1!');

        Account acc = new Account(k_ARIS_Account_ID__c = 'DEDE_123');
        acc.k_Customer_Status__c = '0';
        acc.CSG_SubSeg_EE__c = 'test';
        acc.SH_Subsegment__c = 'test';
        acc.k_B2B_Shop_Username__c = 'DE123456';

        upsert acc k_ARIS_Account_ID__c;

        B2B_Utils.communityIdToWebstoreCache.put('Silhouette B2B Shop', new Webstore(Name = 'Silhouette B2B Shop'));

        try {
            B2B_LoginController.login('DE123456', 'testTEST1!', 'Silhouette B2B Shop', 'de');
        } catch (Exception e) {
            Assert.areEqual('Script-thrown exception', e.getMessage(), 'Should throw the script thrown exception');
        }
    }
}
