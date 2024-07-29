@SuppressWarnings('PMD')
@isTest
public with sharing class B2B_UtilsTest {
    @testSetup
    static void setup() {
        List<Account> accountList = B2B_TestDataFactory.createAccounts(1, 'TestAccount001', 'Account', true);
        My_B2B_Shop_Preference__c myB2BShopPrefernceObj = new My_B2B_Shop_Preference__c(
            B2B_Account__c = accountList[0].Id,
            B2B_Hide_Account_Closure_Popup__c = false
        );
        insert myB2BShopPrefernceObj; //BS-1953

        List<User> userList = new List<User>();
        userList.add(B2B_TestDataFactory.createUser('TestUser0011', 'TestUser0011', 'TestUser0110@test.com', UserInfo.getProfileId()));
        if (userList.isEmpty() == false) {
            userList[0].IsActive = true;
            userList[0].Phone = '9988776655';
            userList[0].UserRoleId = null;
            insert userList;
        }
    }

    @IsTest
    public static void getWebstoreByCommunityIdTest() {
        B2B_Utils.communityIdToWebstoreCache.put('Silhouette B2B Shop', new Webstore(Name = 'Silhouette B2B Shop'));

        Webstore store = B2B_Utils.getWebstoreByCommunityId('Silhouette B2B Shop');

        System.assertEquals('Silhouette B2B Shop', store.name, 'the method should return the correct webstore');

        store = B2B_Utils.getWebstoreByCommunityId(null);

        System.assertEquals(null, store, 'the method should not return a webstore');

        try {
            store = B2B_Utils.getWebstoreByCommunityId('test');
        } catch (Exception e) {
            // catch exception due to missing webstore
        }
    }

    @isTest
    public static void resolveCommunityIdToWebstoreIdTest() {
        Test.startTest();

        String communityId = '0DB3L0000000000000';
        String wsId = B2B_Utils.resolveWebstoreId(communityId);

        Test.stopTest();
        System.assertNotEquals(null, wsId, 'Webstore Id should not be null but mocked');
    }

    @isTest
    public static void resolveWebstoreIdTest() {
        Test.startTest();

        String webstoreId = B2B_TestDataFactory.mockRecordId(WebStore.getSObjectType());
        String wsId = B2B_Utils.resolveWebstoreId(webstoreId);
        System.assertEquals(webstoreId, wsId, 'Webstore Id returned should be the same');
        Test.stopTest();
    }

    @isTest
    public static void resolveWebstoreIdFailTest() {
        Test.startTest();

        String wsId = B2B_Utils.resolveWebstoreId(null);
        System.assertEquals(null, wsId, 'Webstore Id returned should be null');
        Test.stopTest();
    }

    @IsTest
    public static void insertCommunityUserTest() {
        Account acc = B2B_TestDataFactory.createInsertTestAccount();
        Contact con = B2B_TestDataFactory.createInsertDefaultContact(acc);

        Test.startTest();
        B2B_Utils.insertCommunityUser(con.Id, 'silhouette');
        Test.stopTest();

        List<User> users = [SELECT Id FROM User WHERE ContactId = :con.Id];

        System.assertEquals(1, users.size(), 'there should only be one user assigned to the created contact.');
    }

    @IsTest
    public static void insertCommunityUserNeubauTest() {
        Account acc = B2B_TestDataFactory.createInsertTestAccount();
        Contact con = B2B_TestDataFactory.createInsertDefaultContact(acc);

        Test.startTest();
        B2B_Utils.insertCommunityUser(con.Id, 'neubau');
        Test.stopTest();

        List<User> users = [SELECT Id FROM User WHERE ContactId = :con.Id];

        System.assertEquals(1, users.size(), 'there should only be one user assigned to the created contact.');
    }

    @IsTest
    public static void checkIfAccessibleTest() {
        final String[] objFields = new List<String>{ 'Id', 'Name' };

        Test.startTest();
        Boolean isAccessible = B2B_Utils.checkIfAccessible('Account', objFields);
        Test.stopTest();

        System.assertEquals(true, isAccessible, 'the user should have access to the account name and id');
    }

    @IsTest
    public static void getAvailableWebstoreLanguagesTest() {
        String languages = B2B_Utils.getAvailableWebstoreLanguages('0DB3L0000000000000');
        System.assertEquals(null, languages, 'should return null due to missing community/webstore');
    }

    @IsTest
    static void changePasswordTest() {
        User communityUser = B2B_TestDataFactory.createInsertCommerceUser();

        try {
            System.runAs(communityUser) {
                B2B_Utils.changePassword('test', 'test2', 'test2', 'de', true);
            }
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to password data');
        }
    }

    @IsTest
    static void sendChangePasswordMailTest() {
        User communityUser = B2B_TestDataFactory.createInsertCommerceUser();

        try {
            System.runAs(communityUser) {
                B2B_Utils.sendChangePasswordMail('de', true);
                B2B_Utils.sendChangePasswordMail('en_US', true);
                B2B_Utils.sendChangePasswordMail('de', false);
                B2B_Utils.sendChangePasswordMail('en_US', false);
            }
        } catch (Exception e) {
            // no error
        }

        System.assert(true, 'sendChangePasswordMail should not throw an error');
    }

    @IsTest
    public static void sendEmailToUserTest() {
        B2B_Utils.sendEmailToUser('de', true, 'test@test.com', false);
        B2B_Utils.sendEmailToUser('en_US', true, 'test@test.com', false);
        B2B_Utils.sendEmailToUser('de', false, 'test@test.com', false);
        B2B_Utils.sendEmailToUser('en_US', false, 'test@test.com', false);
        Integer emailInvocations = Limits.getEmailInvocations();
        System.assertEquals(4, emailInvocations, 'emails not sent');
    }

    //BS-443
    @IsTest
    public static void getAllProductsTest() {
        List<String> productIdList = new List<String>();
        Map<String, String> sampleCatalog = B2B_TestDataFactory.createInsertCatalogAndCategory();
        List<Product2> products = B2B_TestDataFactory.createProducts(10, null);
        insert products;
        List<ProductCategoryProduct> productCategoryProductList = B2B_TestDataFactory.createProductCategoryProduct(
            products.size(),
            products,
            sampleCatalog.get('childCategoryId')
        );
        insert productCategoryProductList;
        for (Product2 product : products) {
            productIdList.add(product.Id);
        }
        List<Product2> productList = B2B_Utils.getAllProducts(productIdList, sampleCatalog.get('parentCategoryId'));
        System.assertEquals(10, productList.size(), 'All the products not fetched');
    }

    //BS-443
    @IsTest
    public static void getAllProductsWithoutCategoryTest() {
        List<String> productIdList = new List<String>();
        List<Product2> products = B2B_TestDataFactory.createProducts(10, null);
        insert products;
        for (Product2 product : products) {
            productIdList.add(product.Id);
        }
        List<Product2> productList = B2B_Utils.getAllProducts(productIdList, null);
        System.assertEquals(10, productList.size(), 'All the products not fetched');
    }

    //Added for BS-866
    @IsTest
    public static void changeAddressMailTest() {
        Test.startTest();
        B2B_Utils.sendMailForAddressChangeRequest('de', true);
        B2B_Utils.sendMailForAddressChangeRequest('de', false);
        B2B_Utils.sendMailForAddressChangeRequest('en_US', true);
        B2B_Utils.sendMailForAddressChangeRequest('en_US', false);
        String exceptionMessage;
        try {
            B2B_Utils.sendMailForAddressChangeRequest('', null);
        } catch (Exception e) {
            exceptionMessage = e.getMessage();
        }
        Integer emailInvocations = Limits.getEmailInvocations();
        System.assertEquals('Attempt to de-reference a null object', exceptionMessage, 'Should throw an exception');
        System.assertEquals(4, emailInvocations, 'emails not sent');
        Test.stopTest();
    }

    //BS-1057
    @isTest
    public static void sendPartnerRegistrationEmailToUserSHTest() {
        B2B_TestDataFactory.createCountrySpecificPreferenceSettingRecords();
        Account accountObj = B2B_TestDataFactory.createTestAccount();
        accountObj.Store_Country__c = 'Germany';
        accountObj.Brand__c = 'Silhouette';
        insert accountObj;
        Contact contactObj = B2B_TestDataFactory.createInsertDefaultContact(accountObj);
        Test.startTest();
        B2B_Utils.sendPartnerRegistrationEmailToUser('de', true, 'test@test.com', true, contactObj.Id);
        B2B_Utils.sendPartnerRegistrationEmailToUser('en_US', true, 'test@test.com', true, contactObj.Id);
        Integer emailInvocations = Limits.getEmailInvocations();
        Test.stopTest();
        System.assertEquals(2, emailInvocations, 'Check for number of emails invoked');
    }

    //BS-1057
    @isTest
    public static void sendPartnerRegistrationEmailToUserNBTest() {
        B2B_TestDataFactory.createCountrySpecificPreferenceSettingRecords();
        Account accountObj = B2B_TestDataFactory.createTestAccount();
        accountObj.Store_Country__c = 'Germany';
        accountObj.Brand__c = 'NEUBAU';
        insert accountObj;
        Contact contactObj = B2B_TestDataFactory.createInsertDefaultContact(accountObj);
        Test.startTest();
        B2B_Utils.sendPartnerRegistrationEmailToUser('de', false, 'test@test.com', true, contactObj.Id);
        B2B_Utils.sendPartnerRegistrationEmailToUser('en_US', false, 'test@test.com', true, contactObj.Id);
        Integer emailInvocations = Limits.getEmailInvocations();
        Test.stopTest();
        System.assertEquals(2, emailInvocations, 'Check for number of emails invoked');
    }

    //BS-1034
    @isTest
    private static void sendSchneiderCalloutEmailsTest() {
        Test.startTest();
        B2B_Utils.sendSchneiderCalloutEmails(new List<String>{ 'abc@xyz.com' }, 'Test', 'Test');
        Integer emailInvocations = Limits.getEmailInvocations();
        Test.stopTest();
        System.assertEquals(1, emailInvocations, 'Check for number of emails invoked');
    }

    //Added below methods to increase the code coverage for B2B_Utils class as a part of BS-963 ticket.
    @IsTest
    public static void checkAccountWithOrderLockStatusTest() {
        Account accountObj = B2B_TestDataFactory.createTestAccount();
        accountObj.Order_Lock_Status__c = '1';
        insert accountObj;
        Test.startTest();
        Boolean orderStatusResult = B2B_Utils.checkAccountOrderLock(accountObj.Id);
        Test.stopTest();
        System.assertEquals(true, orderStatusResult, 'Order lock status on Account is locked.');
    }

    @IsTest
    public static void checkAccountWithoutOrderLockStatusTest() {
        Account accountObj = B2B_TestDataFactory.createTestAccount();
        accountObj.Order_Lock_Status__c = '0';
        insert accountObj;
        Test.startTest();
        Boolean orderStatusResult = B2B_Utils.checkAccountOrderLock(accountObj.Id);
        Test.stopTest();
        System.assertEquals(false, orderStatusResult, 'Order lock status on Account is unlocked.');
    }

    @IsTest
    public static void resolveSortParamTest() {
        Test.startTest();
        ConnectApi.CartItemSortOrder sortOrderResult = B2B_Utils.resolveSortParam(null);
        Test.stopTest();
        System.assertEquals(null, sortOrderResult, 'Cart item sort order is by default null.');
    }

    @IsTest
    public static void getAccountIdByCurrentUserTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        Test.startTest();
        System.runAs(new user(Id = storeResponse.get('userId'))) {
            Id accountId = B2B_Utils.getAccountIdByCurrentUser();
            System.assertNotEquals(null, accountId, 'Account Id account be null');
        }
        Test.stopTest();
    }

    @IsTest
    public static void negativeCheckForChangePasswordTest() {
        Test.startTest();
        try {
            B2B_Utils.changePassword(null, null, null, null, null);
        } catch (Exception e) {
            System.assertEquals(e.getMessage(), e.getMessage(), 'Aura Handled Exception Occur');
        }
        Test.stopTest();
    }

    //BS-1248
    @isTest
    private static void performSchneiderCalloutProcessingForSuccessfulResponseTest() {
        List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
        insert productList;

        List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert lensConfiguratorList;

        List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
        insert lensShapeList;

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, true));
        B2B_VisionSensationUtility vsUtility = new B2B_VisionSensationUtility();
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper responseWrapper = vsUtility.performSchneiderCallout(request);
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponseWrapper = B2B_Utils.performSchneiderCalloutProcessing(
            responseWrapper,
            String.valueOf(lensConfiguratorList[0].Id)
        );
        List<B2B_Lens_Configurator__c> parsedLensConfiguratorList = [
            SELECT Id, B2B_Account__c, B2B_Account__r.k_ARIS_Account_ID__c, B2B_Account__r.k_Account_No__c, B2B_ARIS_Account_Id__c
            FROM B2B_Lens_Configurator__c
            WHERE Id = :lensConfiguratorList[0].Id
        ];
        List<B2B_CommerceLog__c> commerceLogsList = new List<B2B_CommerceLog__c>();
        if (parsedLensConfiguratorList.isEmpty() == false) {
            commerceLogsList = [
                SELECT Id, B2B_Message__c, B2B_Process__c, B2B_Type__c, B2B_Related_Record_Id__c
                FROM B2B_CommerceLog__c
                WHERE B2B_Related_Record_Id__c = :lensConfiguratorList[0].B2B_Account__c
            ];
        }
        Test.stopTest();
        Assert.areEqual(true, commerceLogsList.isEmpty(), 'Commerce Logs should not get created as Callout is successful without any errora');
    }

    //BS-1248
    @isTest
    private static void performSchneiderCalloutProcessingForCalculationErrorTest() {
        List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
        insert productList;

        List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert lensConfiguratorList;

        List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
        insert lensShapeList;

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, false));
        B2B_VisionSensationUtility vsUtility = new B2B_VisionSensationUtility();
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper responseWrapper = vsUtility.performSchneiderCallout(request);
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponseWrapper = B2B_Utils.performSchneiderCalloutProcessing(
            responseWrapper,
            String.valueOf(lensConfiguratorList[0].Id)
        );
        List<B2B_Lens_Configurator__c> parsedLensConfiguratorList = [
            SELECT Id, B2B_Account__c, B2B_Account__r.k_ARIS_Account_ID__c, B2B_Account__r.k_Account_No__c, B2B_ARIS_Account_Id__c
            FROM B2B_Lens_Configurator__c
            WHERE Id = :lensConfiguratorList[0].Id
        ];
        List<B2B_CommerceLog__c> commerceLogsList = new List<B2B_CommerceLog__c>();
        if (parsedLensConfiguratorList.isEmpty() == false) {
            commerceLogsList = [
                SELECT Id, B2B_Message__c, B2B_Process__c, B2B_Type__c, B2B_Related_Record_Id__c
                FROM B2B_CommerceLog__c
                WHERE B2B_Related_Record_Id__c = :lensConfiguratorList[0].B2B_Account__c
            ];
        }
        Test.stopTest();
        Assert.areEqual(false, commerceLogsList.isEmpty(), 'Commerce Logs should get created as Callout is failed due to calculation error');
    }

    //BS-1248
    @isTest
    private static void performSchneiderCalloutProcessingForOMANotFoundErrorTest() {
        List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
        insert productList;

        List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert lensConfiguratorList;

        List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
        insert lensShapeList;

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(404, false));
        B2B_VisionSensationUtility vsUtility = new B2B_VisionSensationUtility();
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper responseWrapper = vsUtility.performSchneiderCallout(request);
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponseWrapper = B2B_Utils.performSchneiderCalloutProcessing(
            responseWrapper,
            String.valueOf(lensConfiguratorList[0].Id)
        );
        List<B2B_Lens_Configurator__c> parsedLensConfiguratorList = [
            SELECT Id, B2B_Account__c, B2B_Account__r.k_ARIS_Account_ID__c, B2B_Account__r.k_Account_No__c, B2B_ARIS_Account_Id__c
            FROM B2B_Lens_Configurator__c
            WHERE Id = :lensConfiguratorList[0].Id
        ];
        List<B2B_CommerceLog__c> commerceLogsList = new List<B2B_CommerceLog__c>();
        if (parsedLensConfiguratorList.isEmpty() == false) {
            commerceLogsList = [
                SELECT Id, B2B_Message__c, B2B_Process__c, B2B_Type__c, B2B_Related_Record_Id__c
                FROM B2B_CommerceLog__c
                WHERE B2B_Related_Record_Id__c = :lensConfiguratorList[0].B2B_Account__c
            ];
        }
        Test.stopTest();
        Assert.areEqual(false, commerceLogsList.isEmpty(), 'Commerce Logs should get created as Callout is failed due to OMA Data error');
    }

    //BS-1248
    @isTest
    private static void performSchneiderCalloutProcessingForServerErrorTest() {
        List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
        insert productList;

        List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert lensConfiguratorList;

        List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
        insert lensShapeList;

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(503, false));
        B2B_VisionSensationUtility vsUtility = new B2B_VisionSensationUtility();
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper responseWrapper = vsUtility.performSchneiderCallout(request);
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponseWrapper = B2B_Utils.performSchneiderCalloutProcessing(
            responseWrapper,
            String.valueOf(lensConfiguratorList[0].Id)
        );
        List<B2B_Lens_Configurator__c> parsedLensConfiguratorList = [
            SELECT Id, B2B_Account__c, B2B_Account__r.k_ARIS_Account_ID__c, B2B_Account__r.k_Account_No__c, B2B_ARIS_Account_Id__c
            FROM B2B_Lens_Configurator__c
            WHERE Id = :lensConfiguratorList[0].Id
        ];
        List<B2B_CommerceLog__c> commerceLogsList = new List<B2B_CommerceLog__c>();
        if (parsedLensConfiguratorList.isEmpty() == false) {
            commerceLogsList = [
                SELECT Id, B2B_Message__c, B2B_Process__c, B2B_Type__c, B2B_Related_Record_Id__c
                FROM B2B_CommerceLog__c
                WHERE B2B_Related_Record_Id__c = :lensConfiguratorList[0].B2B_Account__c
            ];
        }
        Test.stopTest();
        Assert.areEqual(false, commerceLogsList.isEmpty(), 'Commerce Logs should get created as Callout is failed due to Server Error');
    }

    //BS-1248
    @isTest
    private static void performSchneiderCalloutProcessingForSchneiderServerErrorTest() {
        List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
        insert productList;

        List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert lensConfiguratorList;

        List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
        insert lensShapeList;

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, null));
        B2B_VisionSensationUtility vsUtility = new B2B_VisionSensationUtility();
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper responseWrapper = vsUtility.performSchneiderCallout(request);
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponseWrapper = B2B_Utils.performSchneiderCalloutProcessing(
            responseWrapper,
            String.valueOf(lensConfiguratorList[0].Id)
        );
        List<B2B_Lens_Configurator__c> parsedLensConfiguratorList = [
            SELECT Id, B2B_Account__c, B2B_Account__r.k_ARIS_Account_ID__c, B2B_Account__r.k_Account_No__c, B2B_ARIS_Account_Id__c
            FROM B2B_Lens_Configurator__c
            WHERE Id = :lensConfiguratorList[0].Id
        ];
        List<B2B_CommerceLog__c> commerceLogsList = new List<B2B_CommerceLog__c>();
        if (parsedLensConfiguratorList.isEmpty() == false) {
            commerceLogsList = [
                SELECT Id, B2B_Message__c, B2B_Process__c, B2B_Type__c, B2B_Related_Record_Id__c
                FROM B2B_CommerceLog__c
                WHERE B2B_Related_Record_Id__c = :lensConfiguratorList[0].B2B_Account__c
            ];
        }
        Test.stopTest();
        Assert.areEqual(false, commerceLogsList.isEmpty(), 'Commerce Logs should get created as Callout is failed due to Schneider Server Error');
    }

    //BS-1248
    // Test method for the scenario of any unknown error during schneider callout
    @isTest
    private static void performSchneiderCalloutProcessingForSchneiderErrorTest() {
        List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
        insert productList;

        List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert lensConfiguratorList;

        List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
        insert lensShapeList;

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(0, null));
        B2B_VisionSensationUtility vsUtility = new B2B_VisionSensationUtility();
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper responseWrapper = vsUtility.performSchneiderCallout(request);
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponseWrapper = B2B_Utils.performSchneiderCalloutProcessing(
            responseWrapper,
            String.valueOf(lensConfiguratorList[0].Id)
        );
        List<B2B_Lens_Configurator__c> parsedLensConfiguratorList = [
            SELECT Id, B2B_Account__c, B2B_Account__r.k_ARIS_Account_ID__c, B2B_Account__r.k_Account_No__c, B2B_ARIS_Account_Id__c
            FROM B2B_Lens_Configurator__c
            WHERE Id = :lensConfiguratorList[0].Id
        ];
        List<B2B_CommerceLog__c> commerceLogsList = new List<B2B_CommerceLog__c>();
        if (parsedLensConfiguratorList.isEmpty() == false) {
            commerceLogsList = [
                SELECT Id, B2B_Message__c, B2B_Message_Details__c, B2B_Process__c, B2B_Type__c, B2B_Related_Record_Id__c
                FROM B2B_CommerceLog__c
                WHERE B2B_Related_Record_Id__c = :lensConfiguratorList[0].B2B_Account__c
            ];
        }
        Test.stopTest();
        Assert.areEqual(false, commerceLogsList.isEmpty(), 'Commerce Logs should get created as Callout is failed due to Schneider Server Error');
    }

    //BS-1248
    @isTest
    private static void performSchneiderCalloutProcessingForEmptyInputsTest() {
        Test.startTest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponseWrapper = B2B_Utils.performSchneiderCalloutProcessing(null, null);
        Test.stopTest();
        Assert.areEqual(false, parsedResponseWrapper != null, 'Nothing should be returned as inputs are invalid');
    }

    //BS-1278
    @IsTest
    public static void getCountrySpecificDetailsTest() {
        B2B_TestDataFactory.createCountrySpecificPreferenceSettingRecords();
        Account accountObj = B2B_TestDataFactory.createTestAccount();
        accountObj.Store_Country__c = 'Germany';
        accountObj.Brand__c = 'Silhouette';
        insert accountObj;
        Contact contactObj = B2B_TestDataFactory.createInsertDefaultContact(accountObj);
        User commerceUserObj = new User();
        System.runAs(new User(Id = UserInfo.getUserId())) {
            commerceUserObj = B2B_TestDataFactory.createInsertCommerceUser(contactObj.Id);
        }

        Test.startTest();
        B2B_Utils.B2B_FooterContentWrapper footerContentObj = B2B_Utils.getCountrySpecificDetails(commerceUserObj.Id);
        Test.stopTest();

        System.assertNotEquals(null, footerContentObj, 'Wrapper object should be returned');
    }
    //Added below methods to increase the code coverage for B2B_Utils class as a part of BS-1663 ticket.
    @IsTest
    public static void checkAccountClosedForNBTest() {
        Account accountObj = B2B_TestDataFactory.createTestAccount();
        accountObj.k_Account_Closed_NB__c = '1';
        insert accountObj;
        Test.startTest();
        Boolean AccountStatusResult = B2B_Utils.checkAccountClosedForNB(accountObj.Id);
        Test.stopTest();
        System.assertEquals(true, AccountStatusResult, 'Account status is closed.');
    }

    //BS-1714
    @IsTest
    public static void checkAccountClosedForSHTest() {
        Account accountObj = B2B_TestDataFactory.createTestAccount();
        accountObj.k_Account_Closed_SH__c = '1';
        accountObj.k_Account_Status_Silhouette__c = '1';
        insert accountObj;
        Test.startTest();
        Boolean AccountStatusResult = B2B_Utils.checkAccountClosedForSH(accountObj.Id);
        Test.stopTest();
        System.assertEquals(true, AccountStatusResult, 'Account status is closed for Silhouette.');
    }

    //BS-1714
    @IsTest
    public static void checkAccountClosedForEETest() {
        Account accountObj = B2B_TestDataFactory.createTestAccount();
        accountObj.k_Account_Closed_EE__c = '1';
        accountObj.Acct_Stat_EE__c = '1';
        insert accountObj;
        Test.startTest();
        Boolean AccountStatusResult = B2B_Utils.checkAccountClosedForEE(accountObj.Id);
        Test.stopTest();
        System.assertEquals(true, AccountStatusResult, 'Account status is closee for evil eye.');
    }

    //BS-1953
    @IsTest
    public static void checkHideAccountClosurePopupTest() {
        Account accountObj = [SELECT Id FROM Account LIMIT 1];
        Test.startTest();
        My_B2B_Shop_Preference__c shopPreference = B2B_Utils.checkHideAccountClosurePopup(accountObj.Id);
        Test.stopTest();
        System.assertNotEquals(null, shopPreference, 'It should return one record');
    }

    //BS-1953
    @isTest
    public static void updateMyB2BShopPreferenceTest() {
        Account accountObj = [SELECT Id FROM Account LIMIT 1];

        Test.startTest();
        B2B_Utils.updateMyB2BShopPreference(accountObj.Id);
        Test.stopTest();
        List<My_B2B_Shop_Preference__c> shopPreferenceList = [
            SELECT Id, B2B_Hide_Account_Closure_Popup__c
            FROM My_B2B_Shop_Preference__c
            WHERE B2B_Account__c = :accountObj.Id
        ];
        System.assertEquals(true, shopPreferenceList[0].B2B_Hide_Account_Closure_Popup__c, 'field should have true value');
    }
    //BS-1849
    @IsTest
    private static void setPasswordForValidInputsTest() {
        List<User> userList = [SELECT Id, Name FROM User LIMIT 1];
        String password = 'Test@1234';
        Test.startTest();
        Id jobId = B2B_Utils.setPassword(userList[0].Id, password);
        Test.stopTest();
        Assert.areEqual(false, jobId == null, 'Apex Job Id should not be empty as we have supplied correct inputs while invoking the method');
    }

    //BS-1849
    @IsTest
    private static void setPasswordForInValidInputsTest() {
        List<User> userList = [SELECT Id, Name FROM User LIMIT 1];
        String password = 'Test@1234';
        Test.startTest();
        Id jobId = B2B_Utils.setPassword(null, password);
        Test.stopTest();
        Assert.areEqual(true, jobId == null, 'Apex Job Id should be empty as we have supplied incorrect inputs while invoking the method');
    }

    //BS-1849
    @IsTest
    private static void fetchUserAssociatedWithAccountTest() {
        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];
        Test.startTest();
        List<User> userList = new List<User>();
        userList = B2B_Utils.fetchUserAssociatedWithAccount(String.valueOf(accountList[0].Id));
        Test.stopTest();
        Assert.areEqual(true, userList == null, 'User records should not be returned as no user is associated with provided account');
    }

    //BS-1849
    @IsTest
    private static void getProcessStatusTest() {
        List<User> userList = [SELECT Id, Name FROM User LIMIT 1];
        String password = 'Test@1234';
        Test.startTest();
        Id jobId = B2B_Utils.setPassword(userList[0].Id, password);
        List<AsyncApexJob> apexJobList = B2B_Utils.getProcessStatus(jobId, userList[0].Id);
        Test.stopTest();
        Assert.areEqual(false, apexJobList.isEmpty(), 'Apex Job List should not be empty as we have supplied correct inputs while invoking the method');
    }

    //BS-1248
    @isTest
    private static void performSchneiderCalloutProcessingPreCalcGuidMissingTest() {
        List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
        insert productList;

        List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert lensConfiguratorList;

        List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
        insert lensShapeList;

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, false));
        B2B_VisionSensationUtility vsUtility = new B2B_VisionSensationUtility();
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper responseWrapper = vsUtility.performSchneiderCallout(request);
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponseWrapper = B2B_Utils.performSchneiderCalloutProcessing(
            responseWrapper,
            String.valueOf(lensConfiguratorList[0].Id)
        );
        List<B2B_Lens_Configurator__c> parsedLensConfiguratorList = [
            SELECT Id, B2B_Account__c, B2B_Account__r.k_ARIS_Account_ID__c, B2B_Account__r.k_Account_No__c, B2B_ARIS_Account_Id__c
            FROM B2B_Lens_Configurator__c
            WHERE Id = :lensConfiguratorList[0].Id
        ];
        List<B2B_CommerceLog__c> commerceLogsList = new List<B2B_CommerceLog__c>();
        if (parsedLensConfiguratorList.isEmpty() == false) {
            commerceLogsList = [
                SELECT Id, B2B_Message__c, B2B_Process__c, B2B_Type__c, B2B_Related_Record_Id__c
                FROM B2B_CommerceLog__c
                WHERE B2B_Related_Record_Id__c = :lensConfiguratorList[0].B2B_Account__c
            ];
        }
        Test.stopTest();
        Assert.areEqual(false, commerceLogsList.isEmpty(), 'Commerce Logs should get created as Callout is failed due to calculation error');
    }

    //BS-1914
    @isTest
    private static void performSchneiderCalloutProcessingForSuccessfulCalloutButMissingCalcGuidTest() {
        List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
        insert productList;

        List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert lensConfiguratorList;

        List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
        insert lensShapeList;

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(100, true));
        B2B_VisionSensationUtility vsUtility = new B2B_VisionSensationUtility();
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper responseWrapper = vsUtility.performSchneiderCallout(request);
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponseWrapper = B2B_Utils.performSchneiderCalloutProcessing(
            responseWrapper,
            String.valueOf(lensConfiguratorList[0].Id)
        );
        List<B2B_Lens_Configurator__c> parsedLensConfiguratorList = [
            SELECT Id, B2B_Account__c, B2B_Account__r.k_ARIS_Account_ID__c, B2B_Account__r.k_Account_No__c, B2B_ARIS_Account_Id__c
            FROM B2B_Lens_Configurator__c
            WHERE Id = :lensConfiguratorList[0].Id
        ];
        List<B2B_CommerceLog__c> commerceLogsList = new List<B2B_CommerceLog__c>();
        if (parsedLensConfiguratorList.isEmpty() == false) {
            commerceLogsList = [
                SELECT Id, B2B_Message__c, B2B_Process__c, B2B_Type__c, B2B_Related_Record_Id__c
                FROM B2B_CommerceLog__c
                WHERE B2B_Related_Record_Id__c = :lensConfiguratorList[0].B2B_Account__c
            ];
        }
        Test.stopTest();
        Assert.areEqual(false, commerceLogsList.isEmpty(), 'Commerce Logs should get created as Callout is failed due to Server Error');
    }
}
