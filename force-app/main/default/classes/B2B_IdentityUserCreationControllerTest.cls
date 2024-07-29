@isTest
private class B2B_IdentityUserCreationControllerTest {
    @isTest
    private static void getFieldSetDataTest() {
        Test.startTest();
        List<B2B_IdentityUserCreationController.B2B_FieldSetWrapper> fieldSetWrapperList = B2B_IdentityUserCreationController.getFieldSetData(
            'User',
            'Identity_User_Creation_Fields'
        );
        Test.stopTest();

        System.assertEquals(true, fieldSetWrapperList.size() > 0, ' Field set should not empty');
    }

    @isTest
    private static void createUserTest() {
        Map<String, Object> userFields = new Map<String, Object>{
            'FederationIdentifier' => 'test123',
            'B2B_Brand_content_Neubau__c' => true,
            'B2B_Brand_content_Evil_Eye__c' => true,
            'B2B_Brand_content_Silhouette__c' => true,
            'B2B_User_Type__c' => 'Distributor',
            'Username' => 'nametest@gmail.com.dev',
            'Email' => 'nametest@gmail.com',
            'LastName' => 'name',
            'FirstName' => 'Test'
        };

        Account accountObject = new Account(Name = 'Test account');
        insert accountObject;

        Contact contactObject = new Contact(
            Salutation = 'N/A',
            firstname = 'Test',
            lastname = 'contact',
            Email = 'test@gmail.com',
            accountId = accountObject.Id
        );
        insert contactObject;

        Test.startTest();
        Id insertedUserId = B2B_IdentityUserCreationController.createUser(userFields, contactObject.Id);
        Test.stopTest();

        System.assertEquals(true, insertedUserId != null, 'User inserted successfully');
    }

    @isTest
    private static void createAccountAndContactTest() {
        Map<String, Object> userFields = new Map<String, Object>{
            'FederationIdentifier' => 'test123',
            'B2B_Brand_content_Neubau__c' => true,
            'B2B_Brand_content_Evil_Eye__c' => true,
            'B2B_Brand_content_Silhouette__c' => true,
            'B2B_User_Type__c' => 'Distributor',
            'Username' => 'nametest@gmail.com.dev',
            'Email' => 'nametest@gmail.com',
            'LastName' => 'name',
            'FirstName' => 'Test'
        };

        Test.startTest();
        Id contactId = B2B_IdentityUserCreationController.createAccountContact(userFields);
        Test.stopTest();

        System.assertEquals(true, contactId != null, ' contact created successfully');
    }

    @isTest
    private static void rollbackAccountCreationOnFailureTest() {
        Account accountObject = new Account(Name = 'Test account 2');
        insert accountObject;

        Contact contactObject = new Contact(
            Salutation = 'N/A',
            firstname = 'Test',
            lastname = 'contact 2',
            Email = 'test@gmail.com',
            accountId = accountObject.Id
        );
        insert contactObject;

        Test.startTest();
        B2B_IdentityUserCreationController.rollbackAccountCreationOnFailure(contactObject.Id);
        Test.stopTest();
        List<Account> accountList = [SELECT Id FROM Account WHERE Id = :accountObject.Id];

        System.assertEquals(true, accountList.isEmpty(), ' Account Contact deleted successfully');
    }
}
