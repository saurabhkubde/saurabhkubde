@IsTest
public with sharing class B2B_PartnerRegistration_Test {
    @testSetup
    static void setup() {
        B2B_TestDataFactory.createCountrySpecificPreferenceSettingRecords();
    }

    @SuppressWarnings('PMD.debugsshoulduselogginglevel')
    @IsTest
    public static void testCreateAccountAndContact() {
        String accountJSON = '{"companyName":"Test Company","email":"test.email@test.com","phone":"594353","street":"Test Street 10-12","city":"Test City","province":"","storeCountry":"Germany","accountBrand":"Silhouette","postalCode":"600800"}';
        String contactJSON = '{"firstName":"Test","lastName":"Contact","email":"test.email@test.com","salutation":"Mr.","function":["Optometrist","Optical Assistant"]}';

        try {
            B2B_PartnerRegistration.createPartnerAccount(accountJSON, contactJSON, 'de', true);
        } catch (Exception e) {
            System.debug('Error when inserting account: ' + e.getMessage());
        }

        Integer emailInvocations = Limits.getEmailInvocations();
        List<Account> accList = [SELECT Id, Store_Country__c FROM Account WHERE Name = 'Test Company'];
        List<Contact> contactList = [SELECT Id FROM Contact WHERE Email = 'test.email@test.com'];
        List<Task> taskList = [SELECT Id FROM Task WHERE WhatId = :accList[0].Id];
        System.assertEquals(true, accList.size() == 1 && contactList.size() == 1, 'The account and contact were not created correctly');
        System.assertEquals(1, taskList.size(), 'Task not created');
        System.assertEquals('Germany', accList[0].Store_Country__c, 'The Store Country has not been populated');
        System.assertEquals(1, emailInvocations, 'Email not got sent');
    }

    @SuppressWarnings('PMD.debugsshoulduselogginglevel')
    @IsTest
    public static void testCreateAccountAndContactWithBrandNeuBau() {
        String accountJSON = '{"companyName":"Test Company","email":"test.email@test.com","phone":"594353","street":"Test Street 10-12","city":"Test City","province":"","storeCountry":"Germany","accountBrand":"NEUBAU","postalCode":"600800"}';
        String contactJSON = '{"firstName":"Test","lastName":"Contact","email":"test.email@test.com","salutation":"Mr.","function":["Optometrist","Optical Assistant"]}';

        try {
            B2B_PartnerRegistration.createPartnerAccount(accountJSON, contactJSON, 'en_US', false);
        } catch (Exception e) {
            System.debug('Error when inserting account: ' + e.getMessage());
        }

        Integer emailInvocations = Limits.getEmailInvocations();
        List<Account> accList = [SELECT Id, Store_Country__c FROM Account WHERE Name = 'Test Company'];
        List<Contact> contactList = [SELECT Id FROM Contact WHERE Email = 'test.email@test.com'];
        List<Task> taskList = [SELECT Id FROM Task WHERE WhatId = :accList[0].Id];
        System.assertEquals(true, accList.size() == 1 && contactList.size() == 1, 'The account and contact were not created correctly');
        System.assertEquals(1, taskList.size(), 'Task not created');
        System.assertEquals('Germany', accList[0].Store_Country__c, 'Store Country not Populated');
        System.assertEquals(1, emailInvocations, 'Email not got sent');
    }

    @SuppressWarnings('PMD.debugsshoulduselogginglevel')
    @IsTest
    public static void testCreateAccountAndContactWithBrandEvilEye() {
        String accountJSON = '{"companyName":"Test Company","email":"test.email@test.com","phone":"594353","street":"Test Street 10-12","city":"Test City","province":"","storeCountry":"Germany","accountBrand":"evil eye","postalCode":"600800"}';
        String contactJSON = '{"firstName":"Test","lastName":"Contact","email":"test.email@test.com","salutation":"Mr.","function":["Optometrist","Optical Assistant"]}';

        try {
            B2B_PartnerRegistration.createPartnerAccount(accountJSON, contactJSON, 'en_US', true);
        } catch (Exception e) {
            System.debug('Error when inserting account: ' + e.getMessage());
        }

        Integer emailInvocations = Limits.getEmailInvocations();
        List<Account> accList = [SELECT Id, Store_Country__c FROM Account WHERE Name = 'Test Company'];
        List<Contact> contactList = [SELECT Id FROM Contact WHERE Email = 'test.email@test.com'];
        List<Task> taskList = [SELECT Id FROM Task WHERE WhatId = :accList[0].Id];
        System.assertEquals(true, accList.size() == 1 && contactList.size() == 1, 'The account and contact were not created correctly');
        System.assertEquals(1, taskList.size(), 'Task not created');
        System.assertEquals('Germany', accList[0].Store_Country__c, 'Store Country not Populated');
        System.assertEquals(1, emailInvocations, 'Email not got sent');
    }

    @IsTest
    public static void testCreateAccountAndContactFailingAccount() {
        String accountJSON = '{"companyName":"","email":"test.email@test.com","phone":"594353","street":"Test Street 10-12","city":"Test City","province":"","country":"US","postalCode":"600800"}';
        String contactJSON = '{"firstName":"Test","lastName":"Contact","email":"test.email@test.com","salutation":"Mr.","function":["Optometrist","Optical Assistant"]}';

        try {
            B2B_PartnerRegistration.createPartnerAccount(accountJSON, contactJSON, 'en_US', false);
        } catch (Exception e) {
            System.assert(e != null, 'testCreateAccountAndContactFailingAccount should throw an excepion');
        }
    }

    @IsTest
    public static void testCreateAccountAndContactFailingContact() {
        String accountJSON = '{"companyName":"Test Company","email":"test.email@test.com","phone":"594353","street":"Test Street 10-12","city":"Test City","province":"","country":"US","postalCode":"600800"}';
        String contactJSON = '{"firstName":"Test","lastName":"","salutation":"Mr.","function":["Optometrist","Optical Assistant"]}';

        try {
            B2B_PartnerRegistration.createPartnerAccount(accountJSON, contactJSON, 'de', true);
        } catch (Exception e) {
            System.assert(e != null, 'testCreateAccountAndContactFailingContact should throw an excepion');
        }
    }
}
