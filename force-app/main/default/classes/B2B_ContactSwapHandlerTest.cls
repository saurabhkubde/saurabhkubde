/*Test class made as a part of BS-2224*/

@isTest
public with sharing class B2B_ContactSwapHandlerTest {
    @TestSetup
    static void setup() {
        List<Account> accountList = B2B_TestDataFactory.createAccountswithUniqueARISId(2, 'Test Account ', true);

        accountList[1].k_ARIS_Account_ID__c = 'SHDEDE112';
        update accountList;

        List<Contact> contactList = new List<Contact>();
        for (Integer i = 0; i < 10; i = i + 1) {
            Integer index = math.mod(i, 2);
            contactList.add(
                new Contact(
                    Salutation = 'Mr.',
                    FirstName = 'Test' + i,
                    LastName = 'Contact' + i,
                    Email = 'test' + i + '@example.com',
                    AccountId = accountList[index].Id
                )
            );
        }
        insert contactList;

        Contact swapToContact = new Contact(
            Salutation = 'Mr.',
            FirstName = 'SwapTo',
            LastName = 'Contact',
            B2B_Enabled_for_Partner_Portal__c = false,
            Email = 'test@test.com',
            AccountId = accountList[0].Id
        );
        insert swapToContact;
    }

    @isTest
    static void testGetContactDetails() {
        Test.startTest();
        List<Contact> resultContactList = B2B_ContactSwapHandler.getContactDetails([SELECT Id, Name FROM Contact WHERE LastName = 'Contact4'].Id);
        Test.stopTest();
        System.assertEquals(1, resultContactList.size(), 'Expected one contact record');
    }

    @isTest
    static void testGetContactsRelatedToAccount() {
        Contact testContact = [SELECT Id, LastName FROM Contact WHERE LastName = 'Contact0' LIMIT 1];
        Test.startTest();
        List<Contact> result = B2B_ContactSwapHandler.getContactsRelatedToAccount(testContact.Id);
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals(5, result.size(), 'Expected four contact records related to the account');
    }

    @isTest
    static void testDisableContactAsCustomerUser() {
        Contact swapFromContact = [
            SELECT Id, Email, FirstName, k_ToBeDeleted__c, B2B_Enabled_for_Partner_Portal__c
            FROM Contact
            WHERE FirstName = 'Test0'
            LIMIT 1
        ];
        Contact swapToContact = [SELECT Id, FirstName, k_ToBeDeleted__c, B2B_Enabled_for_Partner_Portal__c FROM Contact WHERE FirstName = 'SwapTo' LIMIT 1];

        Test.startTest();
        B2B_ContactSwapHandler.disableContactAsCustomerUser(swapFromContact.Id, swapToContact.Id);
        Test.stopTest();

        // Verify the results
        swapFromContact = [SELECT Id, B2B_Enabled_for_Partner_Portal__c, k_ToBeDeleted__c FROM Contact WHERE Id = :swapFromContact.Id LIMIT 1];
        swapToContact = [SELECT Id, B2B_Enabled_for_Partner_Portal__c, k_ToBeDeleted__c FROM Contact WHERE Id = :swapToContact.Id LIMIT 1];

        System.assertEquals(false, swapFromContact.B2B_Enabled_for_Partner_Portal__c, 'B2B_Enabled_for_Partner_Portal__c should be false for swapFromContact');
        System.assertEquals(true, swapFromContact.k_ToBeDeleted__c, 'k_ToBeDeleted__c should be true for swapFromContact');
        System.assertEquals(true, swapToContact.B2B_Enabled_for_Partner_Portal__c, 'B2B_Enabled_for_Partner_Portal__c should be true for swapToContact');
        System.assertEquals(false, swapToContact.k_ToBeDeleted__c, 'k_ToBeDeleted__c should be false for swapToContact');
    }

    @isTest
    static void testGetFederationId() {
        Contact swapFromContact = [
            SELECT Id, Email, FirstName, k_ToBeDeleted__c, B2B_Enabled_for_Partner_Portal__c
            FROM Contact
            WHERE FirstName = 'Test0'
            LIMIT 1
        ];
        Profile p = [SELECT Id FROM Profile WHERE Name = 'B2B Commerce User Silhouette'];

        User testUser = new User(
            FirstName = 'Test',
            LastName = 'User',
            Username = 'testuser@example.com',
            ContactId = swapFromContact.Id,
            Email = swapFromContact.Email,
            IsActive = true,
            FederationIdentifier = 'DEDE_2230',
            Alias = 'tuser',
            TimeZoneSidKey = 'GMT',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            ProfileId = p.Id
        );
        insert testUser;

        Test.startTest();
        String result = B2B_ContactSwapHandler.getFederationIdFromUser(swapFromContact.Id);
        Test.stopTest();

        System.assertNotEquals(null, result, 'Result should not be null');
        System.assertEquals('DEDE_2230', result, 'Returned federationId should match the user\'s FederationIdentifier');

        User updatedUser = [SELECT FederationIdentifier FROM User WHERE Id = :testUser.Id LIMIT 1];
        System.assertEquals(null, updatedUser.FederationIdentifier, 'FederationIdentifier should be null after update');
    }

    @isTest
    static void testCreateUser() {
        Id contactId0 = [SELECT Id, LastName FROM Contact WHERE LastName = 'Contact0'].Id;
        Id contactId1 = [SELECT Id, LastName FROM Contact WHERE LastName = 'Contact1'].Id;
        Test.startTest();
        String resultSH = B2B_ContactSwapHandler.createUser('DEDE_2231', 'Contact0', contactId0, 'test0@example.com', 'TestFederationId0');
        String resultNB = B2B_ContactSwapHandler.createUser('NBDEDE112', 'Contact1', contactId1, 'test1@example.com', 'TestFederationId1');
        Test.stopTest();

        User newUser0 = [SELECT Id, Email, FederationIdentifier FROM User WHERE LastName = 'Contact0' LIMIT 1];
        System.assertEquals('Success', resultSH, 'Method should return Success');
        System.assertEquals('test0@example.com', newUser0.Email, 'User email should match');
        System.assertEquals('TestFederationId0', newUser0.FederationIdentifier, 'User nickname should match');

        User newUser1 = [SELECT Id, Email, FederationIdentifier FROM User WHERE LastName = 'Contact1' LIMIT 1];
        System.assertEquals('Success', resultNB, 'Method should return Success');
        System.assertEquals('test1@example.com', newUser1.Email, 'User email should match');
        System.assertEquals('TestFederationId1', newUser1.FederationIdentifier, 'User nickname should match');
    }
}
