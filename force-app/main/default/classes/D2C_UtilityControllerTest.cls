/**
 * @author Sachin V
 * @email  Sachin.vispute@theblueflamelabs.com
 * @desc   This is test class created for testing of methods created in D2C_UtilityController
 * NBD2C-29 : Created as part of NBD2C-29
 **/
@isTest
private class D2C_UtilityControllerTest {
    /**
     * NBD2C-29
     * @description This method is used to create test data that is needed for a testing. @testSetup annoted method invokes before invocation of any test method
     * @author Sachin V
     */
    @TestSetup
    private static void createTestData() {
        List<Product2> productList = D2C_TestDataFactory.createD2CProducts(20);
        if (productList.isEmpty() == false) {
            insert productList;
            List<B2B_Product_Image__c> productImagesList = D2C_TestDataFactory.createD2CProductImages(
                productList.size(),
                D2C_Constants.MODEL_IMAGE,
                productList
            );
            insert productImagesList;
        }

        List<Account> accountList = D2C_TestDataFactory.createAccountRecords(1);

        if (accountList.isEmpty() == false) {
            insert accountList;

            List<Contact> contactList = D2C_TestDataFactory.createContactRecords(1, accountList);
            if (contactList.isEmpty() == false) {
                insert contactList;
            }
        }
    }

    /**
     * NBD2C-29
     * @description This method is created for positive testing the getProductMedia() method
     * @author Sachin V
     */
    @isTest
    private static void getProductMediaForValidDataOfModelImagesTest() {
        Test.StartTest();
        List<Product2> productList = [SELECT Id, Name FROM Product2 WHERE IsActive = TRUE LIMIT 20];
        List<B2B_Product_Image__c> productImagesList = D2C_TestDataFactory.createD2CProductImages(productList.size(), D2C_Constants.MODEL_IMAGE, productList);
        insert productImagesList;
        if (productList.isEmpty() == false) {
            List<Id> productIdList = new List<Id>();
            for (Product2 product : productList) {
                if (product != null && product.Id != null) {
                    productIdList.add(product.Id);
                }
            }
            if (productIdList.isEmpty() == false) {
                Map<Id, List<B2B_Product_Image__c>> productImageIdVSProductImageMap = D2C_UtilityController.getProductMedia(
                    productIdList,
                    D2C_Constants.MODEL_IMAGE,
                    D2C_Constants.D2C_VALUE,
                    true
                );
                Assert.areEqual(productIdList.size(), productImageIdVSProductImageMap.size(), 'Product images should be fetched successfully');
            }
        }
        Test.stopTest();
    }

    /**
     * NBD2C-29
     * @description This method is created for negative testing the getProductMedia() method by providing empty input data
     * @author Sachin V
     */
    @isTest
    private static void getProductMediaForEmptyDataTest() {
        Test.StartTest();
        List<Product2> productList = [SELECT Id, Name FROM Product2 WHERE IsActive = TRUE LIMIT 20];
        if (productList.isEmpty() == false) {
            List<Id> productIdList = new List<Id>();
            Map<Id, List<B2B_Product_Image__c>> productImageIdVSProductImageMap = D2C_UtilityController.getProductMedia(
                productIdList,
                D2C_Constants.MODEL_IMAGE,
                D2C_Constants.D2C_VALUE,
                true
            );
            Assert.areEqual(null, productImageIdVSProductImageMap, 'Product images should not be fetched as providing empty list of Product Ids as input');
        }
        Test.stopTest();
    }

    /**
     * NBD2C-29
     * @description This method is created for negative testing the getProductMedia() method by providing mismatched input paramters
     * @author Sachin V
     */
    @isTest
    private static void getProductMediaForMismatchImageTypeTest() {
        Test.StartTest();
        List<Product2> productList = [SELECT Id, Name FROM Product2 WHERE IsActive = TRUE LIMIT 20];
        if (productList.isEmpty() == false) {
            List<Id> productIdList = new List<Id>();
            for (Product2 product : productList) {
                if (product != null && product.Id != null) {
                    productIdList.add(product.Id);
                }
            }
            if (productIdList.isEmpty() == false) {
                Map<Id, List<B2B_Product_Image__c>> productImageIdVSProductImageMap = D2C_UtilityController.getProductMedia(
                    productIdList,
                    D2C_Constants.PRODUCT_IMAGE,
                    D2C_Constants.D2C_VALUE,
                    true
                );
                Assert.areEqual(
                    null,
                    productImageIdVSProductImageMap,
                    'Product images should not be fetched as product image type images not exists in database'
                );
            }
        }
        Test.stopTest();
    }

    /**
     * NBD2C-65
     * @description Test method for testing getCountryCodeMetadata().
     * @author Sachin V
     */
    @isTest
    private static void getCountryCodeMetadataTest() {
        // Start test execution
        Test.startTest();

        // Call the method to be tested
        String countryCodes = D2C_UtilityController.getCountryCodeMetadata();

        // Stop test execution
        Test.stopTest();

        // Verify that the returned country codes string is not null
        Assert.areNotEqual(null, countryCodes, 'Returned country codes should not be null');

        // Verify that the returned country codes string is not empty
        Assert.areNotEqual('', countryCodes, 'Returned country codes should not be empty');

        // Add additional assertions if necessary to validate the correctness of the returned data
    }

    /**
     * NBD2C-50
     * @description This method is used to test getCollectionCardDetailsForPDP method for positive scenerio
     * @author Sachin V
     */
    @isTest
    private static void getCollectionCardDetailsForPDPPositiveTest() {
        List<Product2> productList = D2C_TestDataFactory.createD2CProductsRecords(
            3,
            new Map<String, List<String>>{
                'model' => new List<String>{ 'T670', 'T134', '' },
                'salesConcept' => new List<String>{ 'Sam Family', 'Sam Family', 'Sam Family' }
            }
        );
        insert productList;

        // Create test data - language
        String language1 = 'en-AT';
        String language2 = 'de';

        List<D2C_SectionContent__c> sectionContentCollectionDataList = D2C_TestDataFactory.createSectionContentRecords(
            new Map<String, List<String>>{ 'model' => new List<String>{ 'T670', 'T134' }, 'salesConcept' => new List<String>{ 'Sam Family', 'Sam Family' } },
            'Collection Summary Section'
        );

        List<D2C_SectionContent__c> sectionContentRecordsList = D2C_TestDataFactory.createSectionContentRecords(
            new Map<String, List<String>>{ 'model' => new List<String>{ 'T670', 'T134' }, 'salesConcept' => new List<String>{ 'Sam Family', 'Sam Family' } },
            'Dynamic Image Carousel'
        );

        sectionContentRecordsList.addAll(sectionContentCollectionDataList);
        insert sectionContentRecordsList;

        List<Id> sectionContentIdList = new List<Id>();
        for (D2C_SectionContent__c sectionContentRecord : sectionContentRecordsList) {
            sectionContentIdList.add(sectionContentRecord.Id);
        }

        // Create test data - D2C_SectionTranslations__c
        List<D2C_SectionTranslations__c> sectionTranslationList = D2C_TestDataFactory.createSectionTranslationsRecords(sectionContentIdList);
        insert sectionTranslationList;

        Test.startTest();
        // Call the method to be tested
        List<D2C_UtilityController.D2C_SectionContentWrapper> sectionContentWrapperList1 = D2C_UtilityController.getCollectionCardDetailsForPDP(
            new List<Id>{ productList[0].Id },
            language1,
            'Collection Summary Section'
        ); // NBD2C-82 : Updated the method by providing an additional input parameter (sectionType)

        List<D2C_UtilityController.D2C_SectionContentWrapper> sectionContentWrapperList2 = D2C_UtilityController.getCollectionCardDetailsForPDP(
            new List<Id>{ productList[1].Id },
            language2,
            'Dynamic Image Carousel'
        ); // NBD2C-82 : Updated the method by providing an additional input parameter (sectionType)
        Test.stopTest();

        Assert.areEqual(sectionContentWrapperList1.size() > 0, true, 'The returned sectionContentWrapper list should not be empty');
        Assert.areEqual(sectionContentWrapperList2.size() > 0, true, 'The returned sectionContentWrapper list should not be empty');
    }

    /**
     * NBD2C-50
     * @description This method is used to test getCollectionCardDetailsForPDP method for negative scenerio
     * @author Sachin V
     */
    @isTest
    private static void getCollectionCardDetailsForPDPNegativeTest() {
        Product2 productwithNoModel = new Product2(Name = 'Test 1', StockKeepingUnit = 'SKU103', B2B_Model__c = null, B2B_Salesconcept__c = 'Sam Family');

        insert productwithNoModel;

        // Create test data - language
        String language1 = 'de';

        List<D2C_SectionContent__c> sectionContentList = D2C_TestDataFactory.createSectionContentRecords(
            new Map<String, List<String>>{ 'model' => new List<String>{ 'T670', 'T134' }, 'salesConcept' => new List<String>{ 'Sam Family', 'Sam Family' } },
            'Collection Summary Section'
        );

        List<D2C_SectionContent__c> sectionContentRecordsList = D2C_TestDataFactory.createSectionContentRecords(
            new Map<String, List<String>>{ 'model' => new List<String>{ 'T670', 'T134' }, 'salesConcept' => new List<String>{ 'Sam Family', 'Sam Family' } },
            'Dynamic Image Carousel'
        );

        sectionContentRecordsList.addAll(sectionContentList);

        insert sectionContentRecordsList;

        List<Id> sectionContentIdList = new List<Id>();
        for (D2C_SectionContent__c sectionContentRecord : sectionContentRecordsList) {
            sectionContentIdList.add(sectionContentRecord.Id);
        }

        // Create test data - D2C_SectionTranslations__c
        List<D2C_SectionTranslations__c> sectionTranslationList = D2C_TestDataFactory.createSectionTranslationsRecords(sectionContentIdList);
        insert sectionTranslationList;

        Test.startTest();
        // Call the method to be tested
        List<D2C_UtilityController.D2C_SectionContentWrapper> sectionContentWrapperList1 = D2C_UtilityController.getCollectionCardDetailsForPDP(
            new List<Id>{},
            language1,
            'Collection Summary Section'
        ); // NBD2C-82 : Updated the method by providing an additional input parameter (sectionType)
        List<D2C_UtilityController.D2C_SectionContentWrapper> sectionContentWrapperList2 = D2C_UtilityController.getCollectionCardDetailsForPDP(
            new List<Id>{ productwithNoModel.Id },
            language1,
            'Dynamic Image Carousel'
        ); // NBD2C-82 : Updated the method by providing an additional input parameter (sectionType)
        Test.stopTest();

        Assert.areEqual(sectionContentWrapperList1, null, 'The returned sectionContentWrapper list should be empty in absence of productId');
        Assert.areEqual(sectionContentWrapperList2, null, 'The returned sectionContentWrapper list should be empty');
    }

    /**
     * NBD2C-32
     * @author Shrihari Kendre
     * @description This method is used to test handleEmailSubscription method for positive scenerio
     */
    @isTest
    private static void handleEmailSubscriptionPositiveTest() {
        String userDataTest = '{"salutation":"Mrs","firstname":"Test","lastname":"Test","email":"test@test.com","language":"EN","country":"US"}';
        Test.startTest();
        D2C_UtilityController.handleEmailSubscription(userDataTest, D2C_Constants.SH);
        List<Contact> createdContactsList = [SELECT Id FROM Contact WHERE Email = 'test@test.com'];
        Test.stopTest();
        Assert.areEqual(false, createdContactsList.isEmpty(), 'Contact records are not created');
    }

    /**
     * NBD2C-32
     * @author Shrihari Kendre
     * @description This method is used to test handleEmailSubscription method for negative scenerio
     */
    @isTest
    private static void handleEmailSubscriptionNegativeTest() {
        String userDataTest = '{"salutation":"Mrs","firstname":"Test","lastname":"Test","email":"test@gmail.com","language":"EN","country":"US"}';
        Test.startTest();
        D2C_UtilityController.handleEmailSubscription(userDataTest, D2C_Constants.SH);
        List<Contact> createdContactsList = [
            SELECT Id, B2C_Brand_Interest__c, B2C_Marketing_Consent__c
            FROM Contact
            WHERE Email = 'test@gmail.com' AND B2C_Marketing_Consent__c = TRUE
        ];
        Test.stopTest();
        Assert.areEqual(false, createdContactsList.isEmpty(), 'Contact records are not updated');
    }

    /**
     * NBD2C-32
     * @author Shrihari Kendre
     * @description This method is used to test the getSupportedCountries function
     */
    @isTest
    private static void getSupportedCountriesTest() {
        Test.startTest();
        List<D2C_Supported_Newsletter_Countries__mdt> countryList = D2C_UtilityController.getSupportedCountries('SH');
        Test.stopTest();
        Assert.areNotEqual(null, countryList, 'Returned country metadata list should not be null');
    }

    /**
     * NBD2C-32
     * @author Shrihari Kendre
     * @description This method is used to test the getSupportedLanguages function
     */
    @isTest
    private static void getSupportedLanguagesTest() {
        Test.startTest();
        List<D2C_Supported_Newsletter_Languages__mdt> languageList = D2C_UtilityController.getSupportedLanguages('SH');
        Test.stopTest();
        Assert.areNotEqual(null, languageList, 'Returned language metadata list should not be null');
    }
}
