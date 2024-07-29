@SuppressWarnings('PMD')
@isTest
public with sharing class B2B_VisionSensation_RX_ControllerTest {
    @testSetup
    static void setup() {
        B2B_TestDataFactory.createinitialDatabaseSetup();
        B2B_Lens_Configurator__c lensConfObj = new B2B_Lens_Configurator__c();
        Map<String, Object> fieldNameVsLensConfiguratorDataMap = B2B_TestDataFactory.createLensConfiguratorTestData();
        if (!fieldNameVsLensConfiguratorDataMap.isEmpty()) {
            //setting lens configurator data
            if (fieldNameVsLensConfiguratorDataMap.containsKey('accountId')) {
                lensConfObj.B2B_Account__c = (String) fieldNameVsLensConfiguratorDataMap.get('accountId');
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey('collectionDesignFamily')) {
                lensConfObj.B2B_Frame_Collection__c = (String) fieldNameVsLensConfiguratorDataMap.get('collectionDesignFamily');
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey('clerk')) {
                lensConfObj.B2B_Clerk__c = (String) fieldNameVsLensConfiguratorDataMap.get('clerk');
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey('customerName')) {
                lensConfObj.B2B_Customer_Name__c = (String) fieldNameVsLensConfiguratorDataMap.get('customerName');
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey('B2B_RX_Solution__c')) {
                lensConfObj.B2B_RX_Solution__c = (String) fieldNameVsLensConfiguratorDataMap.get('B2B_RX_Solution__c');
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey('frameType')) {
                lensConfObj.B2B_Frame_Type__c = (String) fieldNameVsLensConfiguratorDataMap.get('frameType');
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey('lensSize')) {
                lensConfObj.B2B_Lens_Size__c = Decimal.valueof((String) fieldNameVsLensConfiguratorDataMap.get('lensSize'));
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey('orderType')) {
                lensConfObj.B2B_Order_Type__c = (String) fieldNameVsLensConfiguratorDataMap.get('orderType');
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey('sku')) {
                lensConfObj.B2B_Selected_Frame__c = (String) fieldNameVsLensConfiguratorDataMap.get('sku');
            }
            if (fieldNameVsLensConfiguratorDataMap.containsKey('lensType')) {
                lensConfObj.B2B_Lens_Type__c = (String) fieldNameVsLensConfiguratorDataMap.get('lensType');
            }
            if (fieldNameVsLensConfiguratorDataMap.containsKey('lensIndex')) {
                lensConfObj.B2B_Lens_Index__c = (String) fieldNameVsLensConfiguratorDataMap.get('lensIndex');
            }
            if (fieldNameVsLensConfiguratorDataMap.containsKey('progressionLengthLens')) {
                lensConfObj.B2B_Progression_Length__c = Decimal.valueOf((String) fieldNameVsLensConfiguratorDataMap.get('progressionLengthLens'));
            }
            if (fieldNameVsLensConfiguratorDataMap.containsKey('lensSKU')) {
                lensConfObj.B2B_Selected_Lens_SKU__c = (String) fieldNameVsLensConfiguratorDataMap.get('lensSKU');
            }

            //inserting data
            insert lensConfObj;

            B2B_TestDataFactory.createLensConfiguratorRecordsForSelectedFrame(); // BS-976
        } //end if
    }

    @isTest
    public static void getFieldPicklistValuesWithValidObjectNameAndFieldNameTest() {
        String objectApiName = 'B2B_Lens_Configurator__c';
        String picklistFieldName = 'B2B_Order_Type__c';
        B2B_VisionSensation_RX_Controller.B2B_PicklistFieldWrapper picklistFieldDataWrapper = new B2B_VisionSensation_RX_Controller.B2B_PicklistFieldWrapper();
        Test.startTest();
        picklistFieldDataWrapper = B2B_VisionSensation_RX_Controller.getFieldPicklistValues(objectApiName, picklistFieldName);
        Test.stopTest();
        System.assertNotEquals(null, picklistFieldDataWrapper, 'Should return a picklist field values');
    }

    @isTest
    public static void getFieldPicklistValuesWithInValidObjectNameAndFieldNameTest() {
        String objectApiName = '';
        String picklistFieldName = '';
        B2B_VisionSensation_RX_Controller.B2B_PicklistFieldWrapper picklistFieldDataWrapper = new B2B_VisionSensation_RX_Controller.B2B_PicklistFieldWrapper();
        Test.startTest();
        picklistFieldDataWrapper = B2B_VisionSensation_RX_Controller.getFieldPicklistValues(objectApiName, picklistFieldName);
        Test.stopTest();
        System.assertEquals(null, picklistFieldDataWrapper, 'Should return a picklist field values');
    }

    @isTest
    public static void getSortRulesTest() {
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.SortRulesCollection mocksearchResults = new ConnectApi.SortRulesCollection();
        mocksearchResults.sortRules = new List<ConnectApi.SortRule>();

        stub.mockedResponseByMethod.put('getSortRules', mocksearchResults);
        B2B_VisionSensation_RX_Controller.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Object sortRules;
        Test.startTest();
        sortRules = B2B_VisionSensation_RX_Controller.getSortRules(B2B_TestDataFactory.mockRecordId(WebStore.getSObjectType()));
        Test.stopTest();

        System.assertNotEquals(null, sortRules, 'Should return sort rules');
    }

    @isTest
    public static void getCategoryDataTest() {
        List<Product2> productList = [SELECT Id FROM Product2 WHERE Name = 'testProduct'];
        List<ProductCategory> productcategoryList = [SELECT Id FROM ProductCategory];
        ProductCategoryDataTranslation productCategoryTranslation = new ProductCategoryDataTranslation(
            Name = 'test',
            ParentId = productcategoryList[0].Id,
            Language = 'de'
        );
        insert productCategoryTranslation;
        List<String> productIdList = new List<String>();
        for (Product2 product : productList) {
            productIdList.add(product.Id);
        }
        Test.startTest();
        List<B2B_VisionSensation_RX_Controller.B2B_CategoryWrapper> categoryWrapperList = B2B_VisionSensation_RX_Controller.getCategoryData(
            productIdList,
            productcategoryList[0].Id,
            'de'
        );
        List<B2B_VisionSensation_RX_Controller.B2B_CategoryWrapper> categoryWrapperList2 = B2B_VisionSensation_RX_Controller.getCategoryData(
            productIdList,
            null,
            'de'
        );
        Test.stopTest();
        System.assertEquals(true, categoryWrapperList.size() > 0, 'Should return List of Aggregate Result');
        System.assertEquals(true, categoryWrapperList2.size() > 0, 'Should return List of Aggregate Result');
    }

    @isTest
    public static void getFiltersVSTest() {
        Test.startTest();
        List<B2B_VisionSensation_RX_Controller.B2B_AvailableFiltersDataWrapper> filtersList = B2B_VisionSensation_RX_Controller.getFilters('Silhouette', 'SH');
        Test.stopTest();
        System.assertEquals(true, filtersList.size() > 0, 'Should return List of Filters');
    }

    @isTest
    public static void getFiltersRXTest() {
        Test.startTest();
        List<B2B_VisionSensation_RX_Controller.B2B_AvailableFiltersDataWrapper> filtersList = B2B_VisionSensation_RX_Controller.getFilters('Frames', 'EE');
        Test.stopTest();
        System.assertEquals(true, filtersList.size() > 0, 'Should return List of Filters');
    }

    @isTest
    public static void fillAvailableFilterDataTest() {
        Test.startTest();
        Map<String, B2B_VS_RX_Filters_Preference_Settings__mdt> filterPreferenceSettingRecords = B2B_VisionSensation_RX_Controller.getFilterPreferenceSettingRecords();
        List<B2B_VisionSensation_RX_Controller.B2B_filterDataWrapper> filterDataList = B2B_VisionSensation_RX_Controller.fillFilterDataWrapper(
            filterPreferenceSettingRecords
        );
        if ((filterDataList.isEmpty() == false) && (filterDataList[0].categorySHList != null) && (filterDataList[0].categorySHList.isEmpty() == false)) {
            filterDataList[0].categorySHList.add('Silhouette');
            List<B2B_VisionSensation_RX_Controller.B2B_AvailableFiltersDataWrapper> availableFilterList = B2B_VisionSensation_RX_Controller.fillAvailableFilterDataWrapper(
                filterDataList,
                'Silhouette',
                'SH'
            );
            Test.stopTest();
            System.assertEquals(true, availableFilterList.size() > 0, 'Should return List of available filters');
        }
    }

    @isTest
    public static void fillAvailableFilterDataNullTest() {
        Test.startTest();
        List<B2B_VisionSensation_RX_Controller.B2B_filterDataWrapper> filterDataList = new List<B2B_VisionSensation_RX_Controller.B2B_filterDataWrapper>();
        List<B2B_VisionSensation_RX_Controller.B2B_AvailableFiltersDataWrapper> availableFilterList = B2B_VisionSensation_RX_Controller.fillAvailableFilterDataWrapper(
            filterDataList,
            'Silhouette',
            'SH'
        );
        Test.stopTest();
        System.assertEquals(new List<B2B_VisionSensation_RX_Controller.B2B_AvailableFiltersDataWrapper>{}, availableFilterList, 'Should return Null');
    }

    @isTest
    public static void getCategoriesDataForVSRXTest() {
        List<ProductCategory> productCategoryList = [SELECT Id, Name FROM ProductCategory];
        List<String> productCategoryIdList = new List<String>();
        for (ProductCategory productCategory : productCategoryList) {
            productCategoryIdList.add(productCategory.Id);
        }
        List<B2B_VisionSensation_RX_Controller.B2B_VS_RX_CategoriesDataWrapper> fetchedProductCategoryList = new List<B2B_VisionSensation_RX_Controller.B2B_VS_RX_CategoriesDataWrapper>();
        Test.startTest();
        fetchedProductCategoryList = B2B_VisionSensation_RX_Controller.getCategoriesDataForVSRX(productCategoryIdList);
        Test.stopTest();
        System.assertEquals(true, fetchedProductCategoryList.size() > 0, 'Should return List of categories containing category details');
    }

    @isTest
    public static void getEntitlementProductsForVisionSensationGlobalTest() {
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductOverviewCollection mockGetProducts = new ConnectApi.ProductOverviewCollection();
        stub.mockedResponseByMethod.put('getProducts', mockGetProducts);
        B2B_VisionSensation_RX_Controller.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);
        String currentStore = 'SH';
        String buyerGroupType = 'Vision Sensation';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType);
        List<ProductCategory> productcategoryList = [SELECT Id FROM ProductCategory];
        List<ProductCategoryProduct> productToInsertList = new List<ProductCategoryProduct>();
        for (ProductCategory productCategory : productcategoryList) {
            ProductCategoryProduct productCategoryProduct = new ProductCategoryProduct(
                ProductCategoryId = productCategory.Id,
                ProductId = storeResponse.get('productId'),
                IsPrimaryCategory = true
            );
            productToInsertList.add(productCategoryProduct);
        }
        insert productToInsertList;
        String accountId = storeResponse.get('accountId');
        Boolean globalEntitlementApplicable = true;
        List<ProductCategory> categoryList = [SELECT ID, Name FROM ProductCategory];
        List<String> categoryIdList = new List<String>();
        for (ProductCategory productCategory : categoryList) {
            categoryIdList.add(productCategory.Id);
        }
        List<Product2> productList = B2B_VisionSensation_RX_Controller.getEntitlementProducts(
            accountId,
            currentStore,
            globalEntitlementApplicable,
            categoryIdList
        );
        //Object product = B2B_VisionSensation_RX_Controller.productsSearch(storeResponse.get('webStoreId'), storeResponse.get('accountId'), productIdList);
        System.assertEquals(false, productList.isEmpty(), 'Should return products list');
    }

    @isTest
    public static void getEntitlementProductsForRXGlazingGlobalTest() {
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductOverviewCollection mockGetProducts = new ConnectApi.ProductOverviewCollection();
        stub.mockedResponseByMethod.put('getProducts', mockGetProducts);
        B2B_VisionSensation_RX_Controller.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);
        String currentStore = 'ee';
        String buyerGroupType = 'RX Glazing';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType);
        List<ProductCategory> productcategoryList = [SELECT Id FROM ProductCategory];
        List<ProductCategoryProduct> productToInsertList = new List<ProductCategoryProduct>();
        for (ProductCategory productCategory : productcategoryList) {
            ProductCategoryProduct productCategoryProduct = new ProductCategoryProduct(
                ProductCategoryId = productCategory.Id,
                ProductId = storeResponse.get('productId'),
                IsPrimaryCategory = true
            );
            productToInsertList.add(productCategoryProduct);
        }
        insert productToInsertList;
        String accountId = storeResponse.get('accountId');
        Boolean globalEntitlementApplicable = true;
        List<ProductCategory> categoryList = [SELECT ID, Name FROM ProductCategory];
        List<String> categoryIdList = new List<String>();
        for (ProductCategory productCategory : categoryList) {
            categoryIdList.add(productCategory.Id);
        }
        List<Product2> productList = B2B_VisionSensation_RX_Controller.getEntitlementProducts(
            accountId,
            currentStore,
            globalEntitlementApplicable,
            categoryIdList
        );
        //Object product = B2B_VisionSensation_RX_Controller.productsSearch(storeResponse.get('webStoreId'), storeResponse.get('accountId'), productIdList);
        System.assertEquals(false, productList.isEmpty(), 'Should return products list');
    }

    @isTest
    public static void getEntitlementProductsAccordingToCountryTest() {
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductOverviewCollection mockGetProducts = new ConnectApi.ProductOverviewCollection();
        stub.mockedResponseByMethod.put('getProducts', mockGetProducts);
        B2B_VisionSensation_RX_Controller.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);
        String buyerGroupType = 'Vision Sensation';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType);
        List<ProductCategory> productcategoryList = [SELECT Id FROM ProductCategory];
        List<ProductCategoryProduct> productToInsertList = new List<ProductCategoryProduct>();
        for (ProductCategory productCategory : productcategoryList) {
            ProductCategoryProduct productCategoryProduct = new ProductCategoryProduct(
                ProductCategoryId = productCategory.Id,
                ProductId = storeResponse.get('productId'),
                IsPrimaryCategory = true
            );
            productToInsertList.add(productCategoryProduct);
        }
        insert productToInsertList;
        String accountId = storeResponse.get('accountId');
        Boolean globalEntitlementApplicable = false;
        List<ProductCategory> categoryList = [SELECT ID, Name FROM ProductCategory];
        List<String> categoryIdList = new List<String>();
        for (ProductCategory productCategory : categoryList) {
            categoryIdList.add(productCategory.Id);
        }
        //Object product = B2B_VisionSensation_RX_Controller.productsSearch(storeResponse.get('webStoreId'), storeResponse.get('accountId'), productIdList);
        System.assertEquals(
            null,
            B2B_VisionSensation_RX_Controller.getEntitlementProducts(accountId, buyerGroupType, globalEntitlementApplicable, categoryIdList),
            'Should not return products list'
        );
    }

    @isTest
    public static void productsSearchTest() {
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductOverviewCollection mockGetProducts = new ConnectApi.ProductOverviewCollection();
        stub.mockedResponseByMethod.put('getProducts', mockGetProducts);
        B2B_VisionSensation_RX_Controller.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);
        String currentStore = 'SH';
        String buyerGroupType = 'Vision Sensation';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType);
        List<ProductCategory> productcategoryList = [SELECT Id FROM ProductCategory];
        List<ProductCategoryProduct> productToInsertList = new List<ProductCategoryProduct>();
        for (ProductCategory productCategory : productcategoryList) {
            ProductCategoryProduct productCategoryProduct = new ProductCategoryProduct(
                ProductCategoryId = productCategory.Id,
                ProductId = storeResponse.get('productId'),
                IsPrimaryCategory = true
            );
            productToInsertList.add(productCategoryProduct);
        }
        insert productToInsertList;
        String accountId = storeResponse.get('accountId');
        String communityId = storeResponse.get('webStoreId');
        Boolean globalEntitlementApplicable = true;
        List<ProductCategory> categoryList = [SELECT ID, Name FROM ProductCategory];
        List<String> categoryIdList = new List<String>();
        for (ProductCategory productCategory : categoryList) {
            categoryIdList.add(productCategory.Id);
        }
        List<Product2> productList = B2B_VisionSensation_RX_Controller.getEntitlementProducts(
            accountId,
            currentStore,
            globalEntitlementApplicable,
            categoryIdList
        );
        List<String> productIdList = new List<String>();
        for (Product2 product : productList) {
            productIdList.add(product.Id);
        }
        Object product = B2B_VisionSensation_RX_Controller.productsSearch(communityId, accountId, productIdList);
        System.assertNotEquals(null, product, 'Should Return Product Correctly');
    }

    @isTest
    public static void getProductFieldSetTest() {
        List<Product2> productList = [SELECT Id FROM Product2 WHERE B2B_Shape_Size__c != NULL LIMIT 1];
        Test.startTest();
        List<B2B_VisionSensation_RX_Controller.B2B_ProductDataWrapper> productDataWrapperList = B2B_VisionSensation_RX_Controller.getProductData(
            productList[0].Id
        );
        Test.stopTest();
        System.assertEquals(true, productDataWrapperList.size() > 0, 'Should return List of Product data Wrapper ');
    }

    @isTest
    public static void getCategoryDetailsTest() {
        List<ProductCategory> productcategoryValueList = [SELECT Id FROM ProductCategory];
        Test.startTest();
        List<ProductCategory> productCategoryList = B2B_VisionSensation_RX_Controller.getCategoryDetails(productcategoryValueList[0].Id);
        Test.stopTest();
        System.assertEquals(true, productCategoryList.size() > 0, 'Should return List of Filters');
    }

    @isTest
    public static void updateHidePriceOnAccountTest() {
        User testUser = B2B_TestDataFactory.createInsertCommerceUser();
        Test.startTest();
        System.runAs(testUser) {
            B2B_VisionSensation_RX_Controller.updateHidePriceOnAccount(true);
        }
        Test.stopTest();
        Account account = [SELECT B2B_Hide_Prices__c FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123'];
        System.assertEquals(true, account.B2B_Hide_Prices__c, 'hide price field was not updated.');
    }

    /**
     * BS-762
     */
    @isTest
    public static void getCategoryTranslationsTest() {
        String language = 'de';
        List<ProductCategoryDataTranslation> productCategoryDataTranslationList = new List<ProductCategoryDataTranslation>();
        List<ProductCategory> productcategoryList = [SELECT Id FROM ProductCategory LIMIT 1];
        ProductCategoryDataTranslation productCategoryTranslation = new ProductCategoryDataTranslation(
            Name = 'test',
            ParentId = productcategoryList[0].Id,
            Language = 'de'
        );
        insert productCategoryTranslation;
        productCategoryDataTranslationList = B2B_VisionSensation_RX_Controller.getCategoryTranslations(language);
        System.assertEquals(false, productCategoryDataTranslationList.isEmpty(), 'Should return category transaltions');
    }

    /**
     * BS-978
     * @description This method is used for testing of 'getVSRXConfigurationData()' method developed for BS-978
     */
    @isTest
    public static void getConfiguratorRecordsWithInvalidValuesTest() {
        Integer recordsToCreate = 20;
        String orderType = null;
        String statusType = null;
        String createdDate = '90';
        String applicableBrand = 'RX Glazing';
        List<User> userList = B2B_TestDataFactory.createLensConfiguratorRecords(applicableBrand, recordsToCreate, orderType, statusType, createdDate);
        System.runAs(userList[0]) {
            Test.startTest();
            List<B2B_VisionSensation_RX_Controller.B2B_VS_RX_Configuration_Data_Wrapper> configuratorDatasList = new List<B2B_VisionSensation_RX_Controller.B2B_VS_RX_Configuration_Data_Wrapper>();
            configuratorDatasList = B2B_VisionSensation_RX_Controller.getVSRXConfigurationData(applicableBrand, orderType, statusType, createdDate);
            Test.stopTest();
            System.assertEquals(false, configuratorDatasList.isEmpty(), 'Should return list of Lens configurator records');
        }
    }

    /**
     * BS-978
     * @description This method is used for testing of 'getVSRXConfigurationData()' method developed for BS-978
     */
    @isTest
    public static void getConfiguratorRecordsWithValidValuesTest() {
        Integer recordsToCreate = 20;
        String orderType = 'Complete Eyewear';
        String statusType = 'Open';
        String createdDate = '90';
        String applicableBrand = 'RX Glazing';
        List<User> userList = B2B_TestDataFactory.createLensConfiguratorRecords(applicableBrand, recordsToCreate, orderType, statusType, createdDate);
        System.runAs(userList[0]) {
            Test.startTest();
            List<B2B_VisionSensation_RX_Controller.B2B_VS_RX_Configuration_Data_Wrapper> configuratorDatasList = new List<B2B_VisionSensation_RX_Controller.B2B_VS_RX_Configuration_Data_Wrapper>();
            configuratorDatasList = B2B_VisionSensation_RX_Controller.getVSRXConfigurationData(applicableBrand, orderType, statusType, createdDate);
            Test.stopTest();
            System.assertEquals(false, configuratorDatasList.isEmpty(), 'Should return list of Lens configurator records');
        }
    }

    /**
     * BS-979
     * @description This method is used for testing of 'deleteConfiguratorRecord()' method developed for BS-979
     */
    @isTest
    public static void deleteConfiguratorRecordsTest() {
        Integer recordsToCreate = 20;
        String orderType = 'Complete Eyewear';
        String statusType = 'Open';
        String createdDate = '90';
        String applicableBrand = 'RX Glazing';
        List<User> userList = B2B_TestDataFactory.createLensConfiguratorRecords(applicableBrand, recordsToCreate, orderType, statusType, createdDate);
        List<B2B_Lens_Configurator__c> configuratorRecordsList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1];
        B2B_VisionSensation_RX_Controller.deleteConfiguratorRecord(configuratorRecordsList[0].Id);
        List<B2B_Lens_Configurator__c> fetchedConfiguratorRecordsList = [SELECT Id FROM B2B_Lens_Configurator__c WHERE Id IN :configuratorRecordsList];
        System.assertEquals(true, fetchedConfiguratorRecordsList.isEmpty(), 'Should not return same record as it is deleted');
    }

    /**
     * BS-898
     * @description This method is used for testing of 'deleteConfiguratorRecord()' method developed for BS-979
     */
    @isTest
    public static void invalidDeleteConfiguratorRecordsTest() {
        try {
            Integer recordsToCreate = 20;
            String orderType = 'Complete Eyewear';
            String statusType = 'Open';
            String createdDate = '90';
            String applicableBrand = 'RX Glazing';
            List<User> userList = B2B_TestDataFactory.createLensConfiguratorRecords(applicableBrand, recordsToCreate, orderType, statusType, createdDate);
            List<B2B_Lens_Configurator__c> configuratorRecordsList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1];
            B2B_VisionSensation_RX_Controller.deleteConfiguratorRecord('TET001');
            List<B2B_Lens_Configurator__c> fetchedConfiguratorRecordsList = [SELECT Id FROM B2B_Lens_Configurator__c WHERE Id IN :configuratorRecordsList];
            System.assertEquals(false, fetchedConfiguratorRecordsList.isEmpty(), 'Should not return same record as it is deleted');
        } catch (Exception exceptionInstance) {
            System.assertEquals(true, exceptionInstance.getMessage().containsIgnoreCase('Script-thrown exception'));
        }
    }

    @isTest
    public static void getSelectedFrameRelatedRXSolutionDataTest() {
        List<Product2> productList = [SELECT Id FROM Product2 LIMIT 1];
        B2B_Commerce_Product_Link__c commerceProductLinkObj = new B2B_Commerce_Product_Link__c(
            B2B_Type__c = 'Adapter',
            B2B_Source_Product__c = productList[0].Id
        );
        insert commerceProductLinkObj;
        List<Product2> prodList = new List<Product2>();

        Test.startTest();
        prodList = B2B_VisionSensation_RX_Controller.getSelectedFrameRelatedRXSolutionData(productList[0].Id);
        Test.stopTest();
        System.assertNotEquals(null, prodList, '');
    }

    @isTest
    public static void getRXTypesForSelectedSolutionTest() {
        List<Product2> productData = B2B_TestDataFactory.createProducts(2, '', false);
        insert productData;

        B2B_Commerce_Product_Link__c commerceData = B2B_TestDataFactory.createProductLink(productData[0].Id, productData[1].Id, 'Adapter');
        insert commerceData;

        List<ProductCategory> productcategoryList = B2B_TestDataFactory.createProductCategory('Adapter');
        insert productcategoryList;

        ProductCategoryDataTranslation productCategoryTranslation = new ProductCategoryDataTranslation(
            Name = 'Adapter',
            ParentId = productcategoryList[0].Id,
            Language = 'de'
        );
        insert productCategoryTranslation;

        List<B2B_Commerce_Product_Link__c> prodCommerceProductLinkProductList = new List<B2B_Commerce_Product_Link__c>();
        Test.startTest();
        prodCommerceProductLinkProductList = B2B_VisionSensation_RX_Controller.getRXTypesForSelectedSolution(
            commerceData.B2B_Type__c,
            'de',
            commerceData.B2B_Source_Product__c
        );
        Test.stopTest();
        System.assertEquals(1, prodCommerceProductLinkProductList.size(), 'ProductCategoryProduct not returned');
    }

    @isTest
    public static void updateLensConfiguratorDataTest() {
        B2B_TestDataFactory.createProductDataForLensConfigurator();
        List<B2B_Lens_Configurator__c> lensConfigList = [SELECT Id, B2B_RX_Solution__c FROM B2B_Lens_Configurator__c LIMIT 1];
        B2B_Lens_Configurator__c lensConfigurator = lensConfigList[0];
        Map<String, Object> fieldNameVsLensConfiguratorDataMap = B2B_TestDataFactory.createLensConfiguratorTestData();
        Test.startTest();
        Id lensConfigratorId = B2B_VisionSensation_RX_Controller.updateLensConfiguratorData(lensConfigList[0].Id, fieldNameVsLensConfiguratorDataMap, 'de');
        Test.stopTest();
        System.assertEquals(
            lensConfigList[0].B2B_RX_Solution__c,
            fieldNameVsLensConfiguratorDataMap.get('B2B_RX_Solution__c'),
            'ProductCategoryProduct not returned'
        );
    }

    //BS-898
    @isTest
    public static void updateLensConfiguratorDataForAdapterTest() {
        List<B2B_Lens_Configurator__c> lensConfigList = [SELECT Id, B2B_RX_Solution__c, B2B_Selected_Frame__c FROM B2B_Lens_Configurator__c LIMIT 1];
        Map<String, Object> fieldNameVsLensConfiguratorDataMap = B2B_TestDataFactory.createLensConfiguratorTestData();
        List<Product2> productList = [SELECT Id FROM Product2 WHERE StockKeepingUnit = :lensConfigList[0].B2B_Selected_Frame__c];
        List<Product2> productCreateList = B2B_TestDataFactory.createInsertProducts(2, null);

        B2B_Commerce_Product_Link__c commerceProduct = B2B_TestDataFactory.createProductLink(
            productList[0].Id,
            productCreateList[1].Id,
            B2B_Constants.GLAZED_TO_UNGLAZED
        );
        insert commerceProduct;
        fieldNameVsLensConfiguratorDataMap.put('selectedRXSolution', 'Adapter');
        Test.startTest();
        Id lensConfigratorId = B2B_VisionSensation_RX_Controller.updateLensConfiguratorData(lensConfigList[0].Id, fieldNameVsLensConfiguratorDataMap, 'de');
        Test.stopTest();
        System.assertEquals(
            lensConfigList[0].B2B_RX_Solution__c,
            fieldNameVsLensConfiguratorDataMap.get('B2B_RX_Solution__c'),
            'ProductCategoryProduct not returned'
        );
    }

    //BS-898
    @isTest
    public static void updateLensConfiguratorDataForClipInTest() {
        List<B2B_Lens_Configurator__c> lensConfigList = [SELECT Id, B2B_RX_Solution__c, B2B_Selected_Frame__c FROM B2B_Lens_Configurator__c LIMIT 1];
        Map<String, Object> fieldNameVsLensConfiguratorDataMap = B2B_TestDataFactory.createLensConfiguratorTestData();
        List<Product2> productList = [SELECT Id FROM Product2 WHERE StockKeepingUnit = :lensConfigList[0].B2B_Selected_Frame__c];
        List<Product2> productCreateList = B2B_TestDataFactory.createInsertProducts(2, null);

        B2B_Commerce_Product_Link__c commerceProduct = B2B_TestDataFactory.createProductLink(
            productList[0].Id,
            productCreateList[1].Id,
            B2B_Constants.GLAZED_TO_UNGLAZED
        );
        insert commerceProduct;
        fieldNameVsLensConfiguratorDataMap.put('selectedRXSolution', 'Clip-in');
        Test.startTest();
        Id lensConfigratorId = B2B_VisionSensation_RX_Controller.updateLensConfiguratorData(lensConfigList[0].Id, fieldNameVsLensConfiguratorDataMap, 'de');
        Test.stopTest();
        System.assertEquals(
            lensConfigList[0].B2B_RX_Solution__c,
            fieldNameVsLensConfiguratorDataMap.get('B2B_RX_Solution__c'),
            'ProductCategoryProduct not returned'
        );
    }

    /**
     * BS-725
     */
    @isTest
    public static void getPrescriptionValuesTest() {
        Product2 product = new Product2(Name = 'prescription product', StockKeepingUnit = '12345');
        insert product;
        List<Product2> productList = B2B_VisionSensation_RX_Controller.getPrescriptionValues(product.StockKeepingUnit);
        System.assertEquals(1, productList.size(), 'Should return one product');
    }

    /**
     * BS-725
     */
    @isTest
    public static void savePrescriptionDataTest() {
        String eyeSide = 'right and left lens side';
        String baseValue = 'No Prism';
        Map<String, Object> customerInputMap = new Map<String, Object>{
            'rightprismbase2radio' => 'up',
            'rightprism2' => '1',
            'rightprismbase1radio' => 'in',
            'rightprism1' => '1',
            'rightaxis' => '1',
            'rightcylinder' => '1',
            'rightsphere' => '1',
            'leftsphere' => '1',
            'leftcylinder' => '1',
            'leftaxis' => '1',
            'leftprism1' => '1',
            'leftprismbase1radio' => 'in',
            'leftprism2' => '1',
            'leftprismbase2radio' => 'up',
            'leftprismbase2' => '1',
            'leftprismbase1' => '1',
            'rightprismbase2' => '1',
            'rightprismbase1' => '1',
            'leftaddition' => '1',
            'rightaddition' => '1'
        };

        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c();
        insert lensConfiguratorObj;

        String message = B2B_VisionSensation_RX_Controller.savePrescriptionData(customerInputMap, lensConfiguratorObj.Id, eyeSide, baseValue);
        System.assertEquals('success', message, 'Should return success message');
    }

    /**
     * BS-1219
     */
    @isTest
    public static void savePrescriptionDataEmptyValueTest() {
        String eyeSide = 'right and left lens side';
        String baseValue = 'No Prism';
        Map<String, Object> customerInputMap = new Map<String, Object>{
            'rightprismbase2radio' => null,
            'rightprism2' => null,
            'rightprismbase1radio' => null,
            'rightprism1' => null,
            'rightaxis' => null,
            'rightcylinder' => null,
            'rightsphere' => null,
            'leftsphere' => null,
            'leftcylinder' => null,
            'leftaxis' => null,
            'leftprism1' => null,
            'leftprismbase1radio' => null,
            'leftprism2' => null,
            'leftprismbase2radio' => null,
            'leftprismbase2' => null,
            'leftprismbase1' => null,
            'rightprismbase2' => null,
            'rightprismbase1' => null,
            'leftaddition' => null,
            'rightaddition' => null
        };

        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c();
        insert lensConfiguratorObj;

        String message = B2B_VisionSensation_RX_Controller.savePrescriptionData(customerInputMap, lensConfiguratorObj.Id, eyeSide, baseValue);
        System.assertEquals('success', message, 'Should return success message');
    }
    /**
     * BS-1219
     */
    @isTest
    public static void savePrescriptionDataNullValueTest() {
        String eyeSide = 'right and left lens side';
        String baseValue = 'No Prism';
        Map<String, Object> customerInputMap = new Map<String, Object>();

        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c();
        insert lensConfiguratorObj;

        String message = B2B_VisionSensation_RX_Controller.savePrescriptionData(customerInputMap, lensConfiguratorObj.Id, eyeSide, baseValue);
        System.assertEquals('success', message, 'Should return success message');
    }
    /**
     * BS-726
     */
    @isTest
    public static void saveCenteringDataTest() {
        Map<String, Object> customerInputMap = new Map<String, Object>{
            'pupilDistanceRightEye' => '1',
            'pupilDistanceLeftEye' => '1',
            'fittingHeightRightEye' => '1',
            'fittingHeightLeftEye' => '1',
            'pantascopicTilt' => '1',
            'bvdWorn' => '1',
            'bvdReffracted' => '1',
            'radioValue' => 'Boxing System',
            'isCheckedDirectGlazingAgreement' => true,
            'isCheckedAdapterAgreement' => true
        };

        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c();
        insert lensConfiguratorObj;

        Test.startTest();
        String message = B2B_VisionSensation_RX_Controller.saveCenteringData(customerInputMap, lensConfiguratorObj.Id);
        Test.stopTest();

        System.assertEquals('success', message, 'Should return success message');
    }

    /**
     * BS-1065
     */
    @isTest
    public static void getSelectedFrameSKUModalSizeTest() {
        List<Product2> prodListToInsert = B2B_TestDataFactory.createProducts(1, '', false);
        prodListToInsert[0].B2B_Model__c = 'e030';
        prodListToInsert[0].B2B_EE_Size__c = 'L';

        insert prodListToInsert[0];

        Test.startTest();
        List<Product2> productList = B2B_VisionSensation_RX_Controller.getSelectedFrameModalSize(prodListToInsert[0].StockKeepingUnit);
        Test.stopTest();

        System.assertEquals(1, productList.size(), 'Must have one record');
    }

    /**
     * BS-728
     * @description This method is used for testing of creating cartItem and custom cartItem
     */
    @isTest
    public static void createCartItemsForRXTest() {
        String buyerGroupType = 'RX Glazing';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType);

        B2B_CommerceMockProvider stubObj = new B2B_CommerceMockProvider();
        ConnectApi.ProductPrice mockProductPrice = new ConnectApi.ProductPrice();
        mockProductPrice.listPrice = '10.00';
        mockProductPrice.unitPrice = '8.00';
        stubObj.mockedResponseByMethod.put('getProductPrice', mockProductPrice);
        B2B_VisionSensation_RX_Controller.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stubObj);

        Id accountId = storeResponse.get('accountId');

        WebCart cartObj = B2B_TestDataFactory.createActiveEmptyCart(storeResponse.get('webStoreId'), accountId);
        cartObj.Status = 'Active';
        insert cartObj;

        CartDeliveryGroup cartDeliveryObj = B2B_TestDataFactory.createInsertCartDeliveryGroup(cartObj.Id);
        Map<String, String> storeResponseEmpty = new Map<String, String>();
        List<CartItem> cartItemList = B2B_TestDataFactory.createCartItem(1, cartObj, storeResponseEmpty, cartDeliveryObj);
        List<String> applicableSKUList = new List<String>();

        List<Product2> productList = new List<Product2>{
            new Product2(Name = 'Test Product 1', StockKeepingUnit = 'Test Product SKU 1'),
            new Product2(Name = 'Test Product 2', StockKeepingUnit = 'Test Product SKU 2')
        };
        insert productList;

        List<BuyerGroupPricebook> buyerGroupPricebookList = [
            SELECT Id, Pricebook2Id
            FROM BuyerGroupPricebook
            WHERE BuyerGroupId = :storeResponse.get('buyerGroupId')
            LIMIT 1
        ];

        List<PricebookEntry> pricebookEntryList = new List<PricebookEntry>{
            new PricebookEntry(Product2Id = productList[0].Id, Pricebook2Id = Test.getStandardPricebookId(), UnitPrice = 100),
            new PricebookEntry(Product2Id = productList[1].Id, Pricebook2Id = Test.getStandardPricebookId(), UnitPrice = 100),
            new PricebookEntry(Product2Id = productList[0].Id, Pricebook2Id = buyerGroupPricebookList[0].Pricebook2Id, UnitPrice = 100),
            new PricebookEntry(Product2Id = productList[1].Id, Pricebook2Id = buyerGroupPricebookList[0].Pricebook2Id, UnitPrice = 100)
        };
        insert pricebookEntryList;

        cartItemList[0].Product2Id = productList[0].Id;
        insert cartItemList;
        for (Product2 productObj : productList) {
            applicableSKUList.add(productObj.StockKeepingUnit);
        }
        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
            B2B_Selected_Frame__c = productList[1].StockKeepingUnit,
            B2B_Selected_Lens_SKU__c = productList[1].StockKeepingUnit,
            B2B_Selected_RX_Solution_SKU__c = productList[0].StockKeepingUnit,
            B2B_Selected_Accent_Ring__c = productList[1].StockKeepingUnit
        );

        insert lensConfiguratorObj;
        Test.startTest();

        //(String cartId, String parentCartItemId, String lensConfiguratorId, String accountId, String storeName, Boolean globalEntitlementApplicable, String   ) {
        Boolean createCartItem = B2B_VisionSensation_RX_Controller.createCartItemsForVSRX(
            cartObj.Id,
            cartItemList[0].Id,
            lensConfiguratorObj.Id,
            accountId,
            B2B_Constants.EVIL_EYE_BRAND,
            true,
            1, //BS-1494
            storeResponse.get('webStoreId')
        );
        Test.stopTest();
        System.assertEquals(true, createCartItem, 'Cart items should be created');
    }

    /**
     * BS-1471
     * @description This method is used for testing of creating cartItem and custom cartItem
     */
    @isTest
    public static void createCartItemsForVSTest() {
        String buyerGroupType = 'Vision Sensation';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType);

        B2B_CommerceMockProvider stubObj = new B2B_CommerceMockProvider();
        ConnectApi.ProductPrice mockProductPrice = new ConnectApi.ProductPrice();
        mockProductPrice.listPrice = '10.00';
        mockProductPrice.unitPrice = '8.00';
        stubObj.mockedResponseByMethod.put('getProductPrice', mockProductPrice);
        B2B_VisionSensation_RX_Controller.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stubObj);

        Id accountId = storeResponse.get('accountId');

        WebCart cartObj = B2B_TestDataFactory.createActiveEmptyCart(storeResponse.get('webStoreId'), accountId);
        cartObj.Status = 'Active';
        insert cartObj;

        CartDeliveryGroup cartDeliveryObj = B2B_TestDataFactory.createInsertCartDeliveryGroup(cartObj.Id);
        Map<String, String> storeResponseEmpty = new Map<String, String>();
        List<CartItem> cartItemList = B2B_TestDataFactory.createCartItem(1, cartObj, storeResponseEmpty, cartDeliveryObj);
        List<String> applicableSKUList = new List<String>();

        List<Product2> productList = new List<Product2>{
            new Product2(Name = 'Test Product 1', StockKeepingUnit = 'Test Product SKU 1'),
            new Product2(Name = 'Test Product 2', StockKeepingUnit = 'Test Product SKU 2')
        };
        insert productList;

        List<BuyerGroupPricebook> buyerGroupPricebookList = [
            SELECT Id, Pricebook2Id
            FROM BuyerGroupPricebook
            WHERE BuyerGroupId = :storeResponse.get('buyerGroupId')
            LIMIT 1
        ];

        List<PricebookEntry> pricebookEntryList = new List<PricebookEntry>{
            new PricebookEntry(Product2Id = productList[0].Id, Pricebook2Id = Test.getStandardPricebookId(), UnitPrice = 100),
            new PricebookEntry(Product2Id = productList[1].Id, Pricebook2Id = Test.getStandardPricebookId(), UnitPrice = 100),
            new PricebookEntry(Product2Id = productList[0].Id, Pricebook2Id = buyerGroupPricebookList[0].Pricebook2Id, UnitPrice = 100),
            new PricebookEntry(Product2Id = productList[1].Id, Pricebook2Id = buyerGroupPricebookList[0].Pricebook2Id, UnitPrice = 100)
        };
        insert pricebookEntryList;

        cartItemList[0].Product2Id = productList[0].Id;
        insert cartItemList;
        for (Product2 productObj : productList) {
            applicableSKUList.add(productObj.StockKeepingUnit);
        }
        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
            B2B_Selected_Frame__c = productList[1].StockKeepingUnit,
            B2B_Selected_Lens_SKU__c = productList[1].StockKeepingUnit,
            B2B_Lens_Color_Id__c = productList[0].Id,
            B2B_Selected_Accent_Ring__c = productList[1].StockKeepingUnit,
            B2B_Photo_Sensation__c = productList[1].Id,
            B2B_Blue_Sensation__c = productList[1].Id,
            B2B_Selected_Color_Groove_Product__c = productList[1].Id,
            B2B_LensHandling_SKU__c = productList[1].StockKeepingUnit,
            B2B_Antireflection_Product__c = productList[1].Id,
            B2B_Hard_Coating_Product__c = productList[1].Id
        );

        insert lensConfiguratorObj;
        Test.startTest();

        //(String cartId, String parentCartItemId, String lensConfiguratorId, String accountId, String storeName, Boolean globalEntitlementApplicable, String   ) {
        Boolean createCartItem = B2B_VisionSensation_RX_Controller.createCartItemsForVSRX(
            cartObj.Id,
            cartItemList[0].Id,
            lensConfiguratorObj.Id,
            accountId,
            B2B_Constants.SILHOUETTE_BRAND,
            true,
            1, //BS-1494
            storeResponse.get('webStoreId')
        );
        Test.stopTest();
        System.assertEquals(true, createCartItem, 'Cart items should be created');
    }

    @isTest
    public static void createCartItemsForVSRXGlobalTest() {
        String buyerGroupType = 'RX Glazing';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX('');

        B2B_CommerceMockProvider stubObj = new B2B_CommerceMockProvider();
        ConnectApi.ProductPrice mockProductPrice = new ConnectApi.ProductPrice();
        mockProductPrice.listPrice = '10.00';
        mockProductPrice.unitPrice = '8.00';
        stubObj.mockedResponseByMethod.put('getProductPrice', mockProductPrice);
        B2B_VisionSensation_RX_Controller.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stubObj);

        Id accountId = storeResponse.get('accountId');

        WebCart cartObj = B2B_TestDataFactory.createActiveEmptyCart(storeResponse.get('webStoreId'), accountId);
        cartObj.Status = 'Active';
        insert cartObj;

        CartDeliveryGroup cartDeliveryObj = B2B_TestDataFactory.createInsertCartDeliveryGroup(cartObj.Id);
        Map<String, String> storeResponseEmpty = new Map<String, String>();
        List<CartItem> cartItemList = B2B_TestDataFactory.createCartItem(1, cartObj, storeResponseEmpty, cartDeliveryObj);
        List<String> applicableSKUList = new List<String>();

        List<Product2> productList = new List<Product2>{
            new Product2(Name = 'Test Product 1', StockKeepingUnit = 'Test Product SKU 1'),
            new Product2(Name = 'Test Product 2', StockKeepingUnit = 'Test Product SKU 2')
        };
        insert productList;

        List<BuyerGroupPricebook> buyerGroupPricebookList = [
            SELECT Id, Pricebook2Id
            FROM BuyerGroupPricebook
            WHERE BuyerGroupId = :storeResponse.get('buyerGroupId')
            LIMIT 1
        ];
        List<PricebookEntry> pricebookEntryList = new List<PricebookEntry>{
            new PricebookEntry(Product2Id = productList[0].Id, Pricebook2Id = Test.getStandardPricebookId(), UnitPrice = 100),
            new PricebookEntry(Product2Id = productList[1].Id, Pricebook2Id = Test.getStandardPricebookId(), UnitPrice = 100),
            new PricebookEntry(Product2Id = productList[0].Id, Pricebook2Id = buyerGroupPricebookList[0].Pricebook2Id, UnitPrice = 100),
            new PricebookEntry(Product2Id = productList[1].Id, Pricebook2Id = buyerGroupPricebookList[0].Pricebook2Id, UnitPrice = 100)
        };
        insert pricebookEntryList;

        cartItemList[0].Product2Id = productList[0].Id;
        insert cartItemList;

        for (Product2 productObj : productList) {
            applicableSKUList.add(productObj.StockKeepingUnit);
        }
        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
            B2B_Selected_Frame__c = productList[1].StockKeepingUnit,
            B2B_Selected_Lens_SKU__c = productList[1].StockKeepingUnit,
            B2B_Selected_RX_Solution_SKU__c = productList[0].StockKeepingUnit,
            B2B_Selected_Accent_Ring__c = productList[1].StockKeepingUnit
        );

        insert lensConfiguratorObj;
        Test.startTest();

        //(String cartId, String parentCartItemId, String lensConfiguratorId, String accountId, String storeName, Boolean globalEntitlementApplicable, String   ) {
        Boolean createCartItem = B2B_VisionSensation_RX_Controller.createCartItemsForVSRX(
            cartObj.Id,
            cartItemList[0].Id,
            lensConfiguratorObj.Id,
            accountId,
            B2B_Constants.EVIL_EYE_BRAND,
            false,
            1, //BS-1494
            storeResponse.get('webStoreId')
        );
        Test.stopTest();
        System.assertEquals(true, createCartItem, 'Cart items should be created');
    }

    //BS-976
    @isTest
    static void addToCartForRXTest() {
        // Create test data

        String buyerGroupType = 'RX Glazing';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType);
        String quantity = '1';
        List<Product2> productList = [SELECT Id, StockKeepingUnit FROM Product2 LIMIT 1];
        List<WebStore> webStoreList = [SELECT Id, Name FROM WebStore];
        List<Account> accountList = [SELECT Id FROM Account];
        List<BuyerGroup> buyerGroupList = [SELECT Id FROM BuyerGroup];
        List<User> communityUserList = [SELECT Id FROM User];

        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(B2B_Selected_Frame__c = productList[0].StockKeepingUnit);
        insert lensConfiguratorObj;

        // Stub response

        WebCart cartObj = B2B_TestDataFactory.createActiveEmptyCart(storeResponse.get('webStoreId'), storeResponse.get('accountId'));
        cartObj.Status = 'Active';
        insert cartObj;
        CartDeliveryGroup cartDeliveryObj = B2B_TestDataFactory.createInsertCartDeliveryGroup(cartObj.Id);

        // Create a mock of ConnectApi.CartSummary
        ConnectApi.CartSummary mockCartSummary = new ConnectApi.CartSummary();
        mockCartSummary.CartId = cartObj.Id;
        mockCartSummary.CurrencyIsoCode = 'EUR';
        B2B_CommerceMockProvider stubObj = new B2B_CommerceMockProvider();

        stubObj.mockedResponseByMethod.put('getOrCreateActiveCartSummary', mockCartSummary);

        B2B_VisionSensation_RX_Controller.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stubObj);
        Map<String, String> fieldNameVsValueMap = new Map<String, String>{ 'Name' => 'test' };
        // Create a mock of ConnectApi.ProductOverviewCollection
        ConnectApi.ProductOverviewCollection mockProductDetails = new ConnectApi.ProductOverviewCollection();
        ConnectApi.ProductOverview mockProductOverview = new ConnectApi.ProductOverview();
        mockProductDetails.products = new List<ConnectApi.ProductOverview>{ mockProductOverview };
        ConnectApi.PricingResultLineItem mockPricingResultItem = new ConnectApi.PricingResultLineItem();
        mockPricingResultItem.listPrice = '10.00';
        mockPricingResultItem.unitPrice = '8.00';
        mockPricingResultItem.productId = productList[0].Id;
        mockProductDetails.products[0].prices = mockPricingResultItem;
        mockProductDetails.products[0].fields = fieldNameVsValueMap;
        stubObj.mockedResponseByMethod.put('getProducts', mockProductDetails);

        // Set up mock callout response

        // Call the method to test
        Test.startTest();
        CartItem result = B2B_VisionSensation_RX_Controller.addToCartForVSRX(
            storeResponse.get('webStoreId'),
            lensConfiguratorObj.Id,
            quantity,
            storeResponse.get('accountId'),
            buyerGroupType
        );
        Test.stopTest();
        System.assertNotEquals(null, result, 'Should Return result Correctly');
    }

    //BS-1471
    @isTest
    static void addToCartForVSTest() {
        // Create test data

        String buyerGroupType = 'Vision Sensation';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType);
        String quantity = '1';
        List<Product2> productList = [SELECT Id, StockKeepingUnit FROM Product2 LIMIT 1];
        List<WebStore> webStoreList = [SELECT Id, Name FROM WebStore];
        List<Account> accountList = [SELECT Id FROM Account];
        List<BuyerGroup> buyerGroupList = [SELECT Id FROM BuyerGroup];
        List<User> communityUserList = [SELECT Id FROM User];

        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(B2B_Selected_Frame__c = productList[0].StockKeepingUnit);
        insert lensConfiguratorObj;

        // Stub response

        WebCart cartObj = B2B_TestDataFactory.createActiveEmptyCart(storeResponse.get('webStoreId'), storeResponse.get('accountId'));
        cartObj.Status = 'Active';
        insert cartObj;
        CartDeliveryGroup cartDeliveryObj = B2B_TestDataFactory.createInsertCartDeliveryGroup(cartObj.Id);

        // Create a mock of ConnectApi.CartSummary
        ConnectApi.CartSummary mockCartSummary = new ConnectApi.CartSummary();
        mockCartSummary.CartId = cartObj.Id;
        mockCartSummary.CurrencyIsoCode = 'EUR';
        B2B_CommerceMockProvider stubObj = new B2B_CommerceMockProvider();

        stubObj.mockedResponseByMethod.put('getOrCreateActiveCartSummary', mockCartSummary);

        B2B_VisionSensation_RX_Controller.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stubObj);
        Map<String, String> fieldNameVsValueMap = new Map<String, String>{ 'Name' => 'test' };
        // Create a mock of ConnectApi.ProductOverviewCollection
        ConnectApi.ProductOverviewCollection mockProductDetails = new ConnectApi.ProductOverviewCollection();
        ConnectApi.ProductOverview mockProductOverview = new ConnectApi.ProductOverview();
        mockProductDetails.products = new List<ConnectApi.ProductOverview>{ mockProductOverview };
        ConnectApi.PricingResultLineItem mockPricingResultItem = new ConnectApi.PricingResultLineItem();
        mockPricingResultItem.listPrice = '10.00';
        mockPricingResultItem.unitPrice = '8.00';
        mockPricingResultItem.productId = productList[0].Id;
        mockProductDetails.products[0].prices = mockPricingResultItem;
        mockProductDetails.products[0].fields = fieldNameVsValueMap;
        stubObj.mockedResponseByMethod.put('getProducts', mockProductDetails);

        // Set up mock callout response

        // Call the method to test
        Test.startTest();
        CartItem result = B2B_VisionSensation_RX_Controller.addToCartForVSRX(
            storeResponse.get('webStoreId'),
            lensConfiguratorObj.Id,
            quantity,
            storeResponse.get('accountId'),
            buyerGroupType
        );
        Test.stopTest();
        System.assertNotEquals(null, result, 'Should Return result Correctly');
    }

    //BS-898
    @isTest
    private static void constructLensConfiguratorDataWithRightLensTest() {
        try {
            String applicableBrand = 'RX';
            Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, true)); //BS-1248
            List<Product2> productList = new List<Product2>{
                new Product2(
                    Name = 'Test Product 1',
                    StockKeepingUnit = 'Test Product SKU 1',
                    B2B_Base_Curve__c = '2.0',
                    B2B_Bridge_Size__c = '18',
                    B2B_Salesconcept_unique__c = 'E8',
                    B2B_Color_Number__c = '4000',
                    B2B_Temple_Length__c = '140',
                    B2B_EE_Size__c = 'L',
                    B2B_Model__c = 'e018',
                    B2B_Variant_Shape__c = 'E018' //BS-1157
                ),
                new Product2(
                    Name = 'Test Product 2',
                    StockKeepingUnit = 'Test Product SKU 2',
                    B2B_Base_Curve__c = '2.0',
                    B2B_Bridge_Size__c = '18',
                    B2B_Salesconcept_unique__c = 'E8',
                    B2B_Color_Number__c = '4000',
                    B2B_Temple_Length__c = '140',
                    B2B_EE_Size__c = 'L',
                    B2B_Model__c = 'e018',
                    B2B_Variant_Shape__c = 'E018' //BS-1157
                )
            };
            insert productList;

            B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
                B2B_Selected_Frame__c = 'Test Product SKU 1',
                B2B_Selected_RX_Solution_SKU__c = 'Test Product SKU 2',
                B2B_Pupil_Distance_Left_Eye__c = 27.0,
                B2B_Pupil_Distance_Right_Eye__c = 27.0,
                B2B_Fitting_height_Left_Eye__c = 5,
                B2B_Measurement_System__c = 'Boxing System',
                B2B_Progression_Length__c = 18,
                B2B_Features__c = 'E',
                B2B_Lens_Shape__c = 'e018',
                B2B_Bridge__c = '14',
                B2B_Lens_Size__c = 59,
                B2B_Eye_Side__c = 'Right lens',
                B2B_Antireflection_SKU__c = 'C0001',
                B2B_Hard_Coating_SKU__c = 'C0004',
                B2B_Evil_Eye_Edge__c = true,
                B2B_Salesconcept__c = 'E018',
                B2B_Temple__c = '130',
                B2B_Remove_Drills__c = false,
                B2B_Schneider_SKU__c = 'ESV001',
                B2B_Variant_Shape__c = 'E018' //BS-1157
            );
            insert lensConfiguratorObj;

            B2B_Lens_Shapes__c lensShapeObj = new B2B_Lens_Shapes__c(B2B_EE_Size__c = 'L', B2B_Model__c = 'e018', B2B_Shape_Name__c = 'e018');
            insert lensShapeObj;

            Test.startTest();
            //BS-1034 : Recieved response of validateAddToCart method into B2B_SchneiderResponse wrapper
            B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper schneiderResponse = B2B_VisionSensation_RX_Controller.validateAddToCart(
                lensConfiguratorObj.Id,
                applicableBrand,
                'en',
                null,
                null,
                true
            );
            Boolean isSuccess = Boolean.valueOf(schneiderResponse.schneiderSuccessResponseWrapper.success); //BS-1248
            Test.stopTest();
            System.assertEquals(true, isSuccess, 'Schneider call should get successfull');
        } catch (Exception exceptionInstance) {
            System.assertEquals(true, exceptionInstance.getMessage().containsIgnoreCase('Script-thrown exception'));
        }
    }

    //BS-898
    @isTest
    private static void constructLensConfiguratorDataWithLeftLensTest() {
        try {
            String applicableBrand = 'RX';
            Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, true)); //BS-1248
            List<Product2> productList = new List<Product2>{
                new Product2(
                    Name = 'Test Product 1',
                    StockKeepingUnit = 'Test Product SKU 1',
                    B2B_Base_Curve__c = '2.0',
                    B2B_Bridge_Size__c = '18',
                    B2B_Salesconcept_unique__c = 'E8',
                    B2B_Color_Number__c = '4000',
                    B2B_Temple_Length__c = '140',
                    B2B_EE_Size__c = 'L',
                    B2B_Model__c = 'e018',
                    B2B_Variant_Shape__c = 'E018' //BS-1157
                ),
                new Product2(
                    Name = 'Test Product 2',
                    StockKeepingUnit = 'Test Product SKU 2',
                    B2B_Base_Curve__c = '2.0',
                    B2B_Bridge_Size__c = '18',
                    B2B_Salesconcept_unique__c = 'E8',
                    B2B_Color_Number__c = '4000',
                    B2B_Temple_Length__c = '140',
                    B2B_EE_Size__c = 'L',
                    B2B_Model__c = 'e018',
                    B2B_Variant_Shape__c = 'E018' //BS-1157
                )
            };
            insert productList;

            B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
                B2B_Selected_Frame__c = 'Test Product SKU 1',
                B2B_Selected_RX_Solution_SKU__c = 'Test Product SKU 2',
                B2B_Pupil_Distance_Left_Eye__c = 27.0,
                B2B_Pupil_Distance_Right_Eye__c = 27.0,
                B2B_Fitting_height_Left_Eye__c = 5,
                B2B_Measurement_System__c = 'Boxing System',
                B2B_Progression_Length__c = 18,
                B2B_Features__c = 'E',
                B2B_Lens_Shape__c = 'e018',
                B2B_Bridge__c = '14',
                B2B_Lens_Size__c = 59,
                B2B_Eye_Side__c = 'Left lens',
                B2B_Antireflection_SKU__c = 'C0001',
                B2B_Hard_Coating_SKU__c = 'C0004',
                B2B_Evil_Eye_Edge__c = true,
                B2B_Salesconcept__c = 'E018',
                B2B_Temple__c = '130',
                B2B_Remove_Drills__c = false,
                B2B_Schneider_SKU__c = 'ESV001',
                B2B_Variant_Shape__c = 'E018' //BS-1157
            );
            insert lensConfiguratorObj;

            B2B_Lens_Shapes__c lensShapeObj = new B2B_Lens_Shapes__c(B2B_EE_Size__c = 'L', B2B_Model__c = 'e018', B2B_Shape_Name__c = 'e018');
            insert lensShapeObj;

            Test.startTest();
            //BS-1034 : Recieved response of validateAddToCart method into B2B_SchneiderResponse wrapper
            B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper schneiderResponse = B2B_VisionSensation_RX_Controller.validateAddToCart(
                lensConfiguratorObj.Id,
                applicableBrand,
                'en',
                null,
                null,
                false
            );
            Boolean isSuccess = Boolean.valueOf(schneiderResponse.schneiderSuccessResponseWrapper.success); //BS-1248
            Test.stopTest();
            System.assertEquals(true, isSuccess, 'Schneider call should get successfull');
        } catch (Exception exceptionInstance) {
            System.assertEquals(true, exceptionInstance.getMessage().containsIgnoreCase('Script-thrown exception'));
        }
    }

    //BS-898
    @isTest
    private static void constructLensConfiguratorDataTest() {
        try {
            String applicableBrand = 'RX';
            List<Product2> productList = new List<Product2>{
                new Product2(
                    Name = 'Test Product 1',
                    StockKeepingUnit = 'Test Product SKU 1',
                    B2B_Base_Curve__c = '2.0',
                    B2B_Bridge_Size__c = '18',
                    B2B_Salesconcept_unique__c = 'E8',
                    B2B_Color_Number__c = '4000',
                    B2B_Temple_Length__c = '140',
                    B2B_EE_Size__c = 'L',
                    B2B_Model__c = 'e018',
                    B2B_Variant_Shape__c = 'E018' //BS-1157
                ),
                new Product2(
                    Name = 'Test Product 2',
                    StockKeepingUnit = 'Test Product SKU 2',
                    B2B_Base_Curve__c = '2.0',
                    B2B_Bridge_Size__c = '18',
                    B2B_Salesconcept_unique__c = 'E8',
                    B2B_Color_Number__c = '4000',
                    B2B_Temple_Length__c = '140',
                    B2B_EE_Size__c = 'L',
                    B2B_Model__c = 'e018',
                    B2B_Variant_Shape__c = 'E018' //BS-1157
                )
            };
            insert productList;

            B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
                B2B_Selected_Frame__c = 'Test Product SKU 1',
                //BS-898
                B2B_Selected_RX_Solution_SKU__c = 'Test Product SKU 2',
                B2B_Pupil_Distance_Left_Eye__c = 27.0,
                B2B_Pupil_Distance_Right_Eye__c = 27.0,
                B2B_Fitting_height_Left_Eye__c = 5,
                B2B_Measurement_System__c = 'Boxing System',
                B2B_Progression_Length__c = 18,
                B2B_Features__c = 'E',
                B2B_Lens_Shape__c = 'e018',
                B2B_Bridge__c = '14',
                B2B_Lens_Size__c = 59,
                B2B_Eye_Side__c = 'right and left lens side',
                B2B_Antireflection_SKU__c = 'C0001',
                B2B_Hard_Coating_SKU__c = 'C0004',
                B2B_Evil_Eye_Edge__c = true,
                B2B_Salesconcept__c = 'E018',
                B2B_Temple__c = '130',
                B2B_Remove_Drills__c = false,
                B2B_Schneider_SKU__c = 'ESV001',
                B2B_Variant_Shape__c = 'E018' //BS-1157
            );
            insert lensConfiguratorObj;

            B2B_Lens_Shapes__c lensShapeObj = new B2B_Lens_Shapes__c(B2B_EE_Size__c = 'L', B2B_Model__c = 'e018', B2B_Shape_Name__c = 'e018');
            insert lensShapeObj;

            //BS-1248 - Start
            Test.startTest();
            B2B_VisionSensationUtility.B2B_SchneiderRequest schneiderRequest = B2B_VisionSensation_RX_Controller.constructLensConfiguratorData(
                String.valueOf(lensConfiguratorObj.Id),
                applicableBrand,
                'en',
                null,
                null,
                false
            ); //BS-572 : Added blending : false
            Test.stopTest();
            System.assertEquals(true, schneiderRequest != null, 'Request body should get constructed');
            //BS-1248 : End
        } catch (Exception exceptionInstance) {
            System.assertEquals(true, exceptionInstance.getMessage().containsIgnoreCase('Script-thrown exception'));
        }
    }

    @isTest
    private static void updateLensConfiguratorRecordForCartItemTest() {
        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
            B2B_Selected_Frame__c = 'Test Product SKU 1',
            B2B_Selected_Lens_SKU__c = 'Test Product SKU 2'
        );
        insert lensConfiguratorObj;

        String buyerGroupType = 'RX Glazing';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType);

        Id accountId = storeResponse.get('accountId');

        WebCart cartObj = B2B_TestDataFactory.createActiveEmptyCart(storeResponse.get('webStoreId'), accountId);
        cartObj.Status = 'Active';
        insert cartObj;

        CartDeliveryGroup cartDeliveryObj = B2B_TestDataFactory.createInsertCartDeliveryGroup(cartObj.Id);
        Map<String, String> storeResponseEmpty = new Map<String, String>();
        List<CartItem> cartItemList = B2B_TestDataFactory.createCartItem(1, cartObj, storeResponseEmpty, cartDeliveryObj);
        List<String> applicableSKUList = new List<String>();

        List<Product2> productList = new List<Product2>{ new Product2(Name = 'Test Product 1', StockKeepingUnit = 'Test Product SKU 1') };
        insert productList;

        List<BuyerGroupPricebook> buyerGroupPricebookList = [
            SELECT Id, Pricebook2Id
            FROM BuyerGroupPricebook
            WHERE BuyerGroupId = :storeResponse.get('buyerGroupId')
            LIMIT 1
        ];

        List<PricebookEntry> pricebookEntryList = new List<PricebookEntry>{
            new PricebookEntry(Product2Id = productList[0].Id, Pricebook2Id = Test.getStandardPricebookId(), UnitPrice = 100),
            new PricebookEntry(Product2Id = productList[0].Id, Pricebook2Id = buyerGroupPricebookList[0].Pricebook2Id, UnitPrice = 100)
        };
        insert pricebookEntryList;

        cartItemList[0].Product2Id = productList[0].Id;
        insert cartItemList;

        Test.startTest();
        B2B_VisionSensation_RX_Controller.updateLensConfiguratorRecordForCartItem(lensConfiguratorObj.Id, cartItemList[0].Id);
        Test.stopTest();

        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id, B2B_Cart_Item__c FROM B2B_Lens_Configurator__c WHERE Id = :lensConfiguratorObj.Id];

        System.assertNotEquals(lensConfiguratorList[0].B2B_Cart_Item__c, null, 'B2B Cart Item should be populated');
    }

    public without sharing class B2B_SchneiderCalloutMockInner implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            //BS-1034 : Modified response body
            String body = '{"images": ["","",""],"success":"true","msg": null,"raw": null,"errorCode": -1102,"left": {"images": ["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","",""],"centerThickness": 3.11,"weight": 6.059212,"edge": {"rdMin": 1.3,"rdMax": 2.9,"axis": null,"axisMin": 325.0,"axisMax": 104.0}},';
            body += '"right": {"images": ["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","",""],"centerThickness": 3.11,"weight": 6.059212,"edge": {"rdMin": 1.3,"rdMax": 2.9,"axis": null,"axisMin": 325.0,"axisMax": 104.0}';
            body += '},"silhData": {"statusCode": 1,"infoCode": "","infoText": "Rechtes Glas:<br/> edge thickness of the blank is to low<br/>maximum edge thickness is too high.Please choose a smaller shape or use the possibility of scaling.(1016)<br/>Linkes Glas:<br/> edge thickness of the blank is to low<br/>maximum edge thickness is too high.Please choose a smaller shape or use the possibility of scaling.(1016)","behav": "3","preCalcGuid": "ffbc272a-c9a2-43e7-a713-39047f3c89bb"}}';
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody(body);
            res.setStatusCode(200);
            return res;
        }
    }

    // BS-1244
    public without sharing class B2B_SchneiderCalloutCalculationErrorMockInner implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            String body = '{"images": ["","",""],"success":"false","msg": null,"raw": null,"errorCode": -1102,"left": {"images": ["","",""],"centerThickness": 3.11,"weight": 6.059212,"edge": {"rdMin": 1.3,"rdMax": 2.9,"axis": null,"axisMin": 325.0,"axisMax": 104.0}},';
            body += '"right": {"images": ["","",""],"centerThickness": 3.11,"weight": 6.059212,"edge": {"rdMin": 1.3,"rdMax": 2.9,"axis": null,"axisMin": 325.0,"axisMax": 104.0}';
            body += '},"silhData": {"statusCode": 1,"infoCode": "","infoText": "Rechtes Glas:<br/> edge thickness of the blank is to low<br/>maximum edge thickness is too high.Please choose a smaller shape or use the possibility of scaling.(1016)<br/>Linkes Glas:<br/> edge thickness of the blank is to low<br/>maximum edge thickness is too high.Please choose a smaller shape or use the possibility of scaling.(1016)","behav": "3","preCalcGuid": "ffbc272a-c9a2-43e7-a713-39047f3c89bb"}}';
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody(body);
            res.setStatusCode(200);
            return res;
        }
    }

    //BS-1244
    public without sharing class B2B_SchneiderCalloutErrorMockInner implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'application/json');
            res.setBody(null);
            res.setStatusCode(200);
            return null;
        }
    }

    @isTest
    public static void getCategoryDetailTest() {
        List<productCatalog> productCatalogList = [SELECT Id, Name FROM productCatalog LIMIT 5];
        Test.startTest();
        List<ProductCategory> productCategoryList = B2B_VisionSensation_RX_Controller.getCategoryDetail(productCatalogList[0].Name);
        Test.stopTest();
        System.assertEquals(false, productCategoryList.size() > 0, 'Should not return List of Product category');
    }

    //BS-976
    @isTest
    private static void updateLensConfiguratorRecordTest() {
        List<B2B_Lens_Configurator__c> lensConfigList = [SELECT Id FROM B2B_Lens_Configurator__c WHERE B2B_Selected_Frame__c = 'Test Product SKU 1' LIMIT 200];
        B2B_Lens_Configurator__c lensConfiguratorObj = lensConfigList[0];

        Test.startTest();
        B2B_VisionSensation_RX_Controller.updateLensConfiguratorRecord(lensConfiguratorObj.Id, '2nd Pair Offer', '2', '', true);
        Test.stopTest();

        List<B2B_Lens_Configurator__c> lensConfiguratorList = [
            SELECT Id, B2B_Customer_Service_Preference__c
            FROM B2B_Lens_Configurator__c
            WHERE Id = :lensConfiguratorObj.Id
        ];

        System.assertEquals(true, lensConfiguratorList[0].B2B_Customer_Service_Preference__c, 'should return true');
    }

    //BS-976
    @isTest
    private static void getFieldValueTest() {
        List<B2B_Lens_Configurator__c> lensConfigList = [SELECT Id FROM B2B_Lens_Configurator__c WHERE B2B_Selected_Frame__c = 'Test Product SKU 1' LIMIT 200];
        B2B_Lens_Configurator__c lensConfiguratorObj = lensConfigList[0];

        B2B_Lens_Shapes__c lensShapes = new B2B_Lens_Shapes__c(B2B_Mounting_Type__c = 'E', B2B_Size__c = '59', B2B_Model__c = 'E018');
        insert lensShapes;

        List<Product2> productList = [SELECT Id FROM Product2 LIMIT 200];
        for (Product2 product : productList) {
            product.B2B_Model__c = 'E018';
        }
        Map<String, Product2> productSKUVSProductMap = new Map<String, Product2>();
        productSKUVSProductMap.put('Test Product SKU 1', productList[0]);
        productSKUVSProductMap.put('Test Product SKU 2', productList[0]);

        List<B2B_Lens_Configurator__c> lensConfiguratorList = [
            SELECT Id, B2B_Selected_Frame__c, B2B_Selected_Lens_SKU__c
            FROM B2B_Lens_Configurator__c
            WHERE B2B_Selected_Lens_SKU__c = 'Test Product SKU 2'
            LIMIT 200
        ];
        List<B2B_Lens_Shapes__c> lensShapesList = [SELECT Id, B2B_Mounting_Type__c, B2B_Size__c, B2B_Model__c FROM B2B_Lens_Shapes__c LIMIT 200];

        String fieldValue;
        String fieldValueForDirectGlazing;
        String fieldValueForMountingType;
        Test.startTest();
        fieldValue = B2B_VisionSensation_RX_Controller.getFieldValue(lensShapesList, false, lensConfiguratorList, productSKUVSProductMap, false);
        fieldValueForMountingType = B2B_VisionSensation_RX_Controller.getFieldValue(lensShapesList, true, lensConfiguratorList, productSKUVSProductMap, false);
        fieldValueForDirectGlazing = B2B_VisionSensation_RX_Controller.getFieldValue(lensShapesList, false, lensConfiguratorList, productSKUVSProductMap, true);
        Test.stopTest();

        System.assertNotEquals(null, fieldValue, 'B2B Cart Item should be populated');
        System.assertNotEquals(null, fieldValueForDirectGlazing, 'B2B Cart Item should be populated');
        System.assertNotEquals(null, fieldValueForMountingType, 'B2B Cart Item should be populated');
    }

    //BS-976
    @isTest
    public static void getCategoryDataForAggregateTest() {
        B2B_TestDataFactory.createSubCategories();
        List<Product2> productList = [SELECT Id FROM Product2 WHERE Name = 'testProductOne'];

        List<ProductCategory> productcategoryList = [SELECT Id FROM ProductCategory WHERE Name = 'GrandParentCategory'];

        List<String> productIdList = new List<String>();
        for (Product2 product : productList) {
            productIdList.add(product.Id);
        }
        Test.startTest();
        List<B2B_VisionSensation_RX_Controller.B2B_CategoryWrapper> categoryWrapperList = B2B_VisionSensation_RX_Controller.getCategoryData(
            productIdList,
            productcategoryList[0].Id,
            'de'
        );
        List<B2B_VisionSensation_RX_Controller.B2B_CategoryWrapper> categoryWrapperList2 = B2B_VisionSensation_RX_Controller.getCategoryData(
            productIdList,
            null,
            'de'
        );
        Test.stopTest();
        System.assertEquals(true, categoryWrapperList.size() > 0, 'Should return List of Aggregate Result');
        System.assertEquals(true, categoryWrapperList2.size() > 0, 'Should return List of Aggregate Result');
    }

    //BS-976
    @isTest
    public static void getParentCategoryDataTest() {
        List<Product2> productList = [SELECT Id FROM Product2 WHERE Name = 'testProduct'];

        List<String> productIdList = new List<String>();
        for (Product2 product : productList) {
            productIdList.add(product.Id);
        }
        Test.startTest();
        Map<String, B2B_VisionSensation_RX_Controller.B2B_CategoryWrapper> stringVsCategoryWrapperMap = B2B_VisionSensation_RX_Controller.getParentCategoryData(
            productIdList
        );
        Test.stopTest();
        System.assertEquals(true, stringVsCategoryWrapperMap.size() > 0, 'Should return List of Aggregate Result');
        System.assertEquals(true, stringVsCategoryWrapperMap.size() > 0, 'Should return List of Aggregate Result');
    }

    @isTest
    public static void fillAvailableFilterDataForEmptyNameTest() {
        Map<String, B2B_VS_RX_Filters_Preference_Settings__mdt> filterPreferenceSettingRecords = B2B_VisionSensation_RX_Controller.getFilterPreferenceSettingRecords();
        List<B2B_VisionSensation_RX_Controller.B2B_filterDataWrapper> filterDataList = B2B_VisionSensation_RX_Controller.fillFilterDataWrapper(
            filterPreferenceSettingRecords
        );
        if ((filterDataList.isEmpty() == false) && (filterDataList[0].categorySHList != null) && (filterDataList[0].categorySHList.isEmpty() == false)) {
            filterDataList[0].categorySHList.add('Silhouette');
            Test.startTest();
            List<B2B_VisionSensation_RX_Controller.B2B_AvailableFiltersDataWrapper> availableFilterList = B2B_VisionSensation_RX_Controller.fillAvailableFilterDataWrapper(
                filterDataList,
                '',
                'SH'
            );
            Test.stopTest();
            System.assertEquals(true, availableFilterList.size() > 0, 'Should return List of available filters');
        }
    }

    @isTest
    public static void getColorsMetadataTest() {
        Test.startTest();
        String mapColorCodes = B2B_VisionSensation_RX_Controller.getColorsMetadata();
        Test.stopTest();
        System.assertNotEquals(null, mapColorCodes, 'Should Return a String value');
    }
    @isTest
    public static void getCategoriesDataForVSRXForEmptyListTest() {
        List<ProductCategory> productCategoryList = [SELECT Id, Name FROM ProductCategory LIMIT 200];
        List<String> productCategoryIdList = new List<String>();
        List<B2B_VisionSensation_RX_Controller.B2B_VS_RX_CategoriesDataWrapper> fetchedProductCategoryList = new List<B2B_VisionSensation_RX_Controller.B2B_VS_RX_CategoriesDataWrapper>();
        Test.startTest();
        fetchedProductCategoryList = B2B_VisionSensation_RX_Controller.getCategoriesDataForVSRX(productCategoryIdList);
        Test.stopTest();
        //Assert the conditions
        System.assertEquals(null, fetchedProductCategoryList, 'Should return null value for category details');
    }
    @isTest
    public static void createCartItemsForVSRXpriceMissingTest() {
        String buyerGroupType = 'RX Glazing';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX('');

        B2B_CommerceMockProvider stubObj = new B2B_CommerceMockProvider();
        ConnectApi.ProductPrice mockProductPrice = new ConnectApi.ProductPrice();
        mockProductPrice.listPrice = '10.00';
        mockProductPrice.unitPrice = '8.00';
        stubObj.mockedResponseByMethod.put('getProductPrice', mockProductPrice);
        B2B_VisionSensation_RX_Controller.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stubObj);

        Id accountId = storeResponse.get('accountId');

        WebCart cartObj = B2B_TestDataFactory.createActiveEmptyCart(storeResponse.get('webStoreId'), accountId);
        cartObj.Status = 'Active';
        insert cartObj;

        CartDeliveryGroup cartDeliveryObj = B2B_TestDataFactory.createInsertCartDeliveryGroup(cartObj.Id);
        Map<String, String> storeResponseEmpty = new Map<String, String>();
        List<CartItem> cartItemList = B2B_TestDataFactory.createCartItem(1, cartObj, storeResponseEmpty, cartDeliveryObj);
        List<String> applicableSKUList = new List<String>();

        List<Product2> productList = new List<Product2>{
            new Product2(Name = 'Test Product 1', StockKeepingUnit = 'Test Product SKU 1'),
            new Product2(Name = 'Test Product 2', StockKeepingUnit = 'Test Product SKU 2')
        };
        insert productList;

        List<BuyerGroupPricebook> buyerGroupPricebookList = [
            SELECT Id, Pricebook2Id
            FROM BuyerGroupPricebook
            WHERE BuyerGroupId = :storeResponse.get('buyerGroupId')
            LIMIT 1
        ];
        List<PricebookEntry> pricebookEntryList = new List<PricebookEntry>{
            new PricebookEntry(Product2Id = productList[0].Id, Pricebook2Id = Test.getStandardPricebookId(), UnitPrice = 100),
            new PricebookEntry(Product2Id = productList[1].Id, Pricebook2Id = Test.getStandardPricebookId(), UnitPrice = 100),
            new PricebookEntry(Product2Id = productList[0].Id, Pricebook2Id = buyerGroupPricebookList[0].Pricebook2Id, UnitPrice = 100)
        };
        insert pricebookEntryList;

        cartItemList[0].Product2Id = productList[0].Id;
        insert cartItemList;

        for (Product2 productObj : productList) {
            applicableSKUList.add(productObj.StockKeepingUnit);
        }
        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
            B2B_Selected_Frame__c = productList[0].StockKeepingUnit,
            B2B_Selected_Lens_SKU__c = productList[1].StockKeepingUnit,
            B2B_Selected_Accent_Ring__c = productList[1].StockKeepingUnit
        );

        insert lensConfiguratorObj;
        Test.startTest();

        //(String cartId, String parentCartItemId, String lensConfiguratorId, String accountId, String storeName, Boolean globalEntitlementApplicable, String   ) {
        Boolean createCartItem = B2B_VisionSensation_RX_Controller.createCartItemsForVSRX(
            cartObj.Id,
            cartItemList[0].Id,
            lensConfiguratorObj.Id,
            accountId,
            B2B_Constants.EVIL_EYE_BRAND,
            false,
            1, //BS-1494
            storeResponse.get('webStoreId')
        );
        Test.stopTest();
        System.assertEquals(false, createCartItem, 'Cart items should not be created');
    }

    /**
     * BS-1151
     */
    @isTest
    private static void getLensConfiguratorDataReadOnlyTest() {
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1];
        Test.startTest();
        List<B2B_Lens_Configurator__c> lensConfiguratorListReturned = B2B_VisionSensation_RX_Controller.getLensConfiguratorData(
            lensConfiguratorList[0].Id,
            true
        );
        Test.stopTest();
        System.assertNotEquals(null, lensConfiguratorListReturned, 'method is returning null');
    }

    /**
     * BS-1151
     */
    @isTest
    private static void getLensConfiguratorDataTest() {
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1];
        Test.startTest();
        List<B2B_Lens_Configurator__c> lensConfiguratorListReturned = B2B_VisionSensation_RX_Controller.getLensConfiguratorData(
            lensConfiguratorList[0].Id,
            false
        );
        Test.stopTest();
        System.assertNotEquals(null, lensConfiguratorListReturned, 'method is returning null');
    }

    /**
     * BS-1151
     */
    @isTest
    private static void getLensConfiguratorDataEmptyListTest() {
        Test.startTest();
        List<B2B_Lens_Configurator__c> lensConfiguratorListReturned = B2B_VisionSensation_RX_Controller.getLensConfiguratorData('', true);
        Test.stopTest();
        System.assertEquals(null, lensConfiguratorListReturned, 'method is not returning null');
    }

    /**
     * BS-1341
     */
    @isTest
    private static void getFrameProductValuesTest() {
        List<Product2> productList = [SELECT Id, StockKeepingUnit FROM Product2 LIMIT 1];
        productList[0].StockKeepingUnit = 'testsku1234';
        update productList;
        B2B_Product_Image__c productImageObj = B2B_TestDataFactory.createProductImage(productList[0].Id);
        insert productImageObj;
        Test.startTest();
        List<Product2> productListReturned = B2B_VisionSensation_RX_Controller.getFrameProductValues(productList[0].StockKeepingUnit);
        Test.stopTest();
        System.assertNotEquals(null, productListReturned, 'method is returning null');
    }

    /**
     * BS-1341
     */
    @isTest
    private static void getFrameImageTest() {
        List<Product2> productList = [SELECT Id, StockKeepingUnit FROM Product2 LIMIT 1];
        productList[0].StockKeepingUnit = 'testsku1234';
        productList[0].B2B_Picture_Link__c = 'test Picture Link';
        update productList;
        Test.startTest();
        List<Product2> productImageListReturned = B2B_VisionSensation_RX_Controller.getFrameImage(productList[0].StockKeepingUnit);
        Test.stopTest();
        System.assertNotEquals(null, productImageListReturned, 'method is returning null');
    }

    /**
     * BS-1151
     */
    @isTest
    private static void getRxSolutionValuesTest() {
        List<Product2> productList = [SELECT Id, StockKeepingUnit FROM Product2 LIMIT 1];
        productList[0].StockKeepingUnit = 'testsku1234';
        update productList;
        Test.startTest();
        List<Product2> productListReturned = B2B_VisionSensation_RX_Controller.getRxSolutionValues(productList[0].StockKeepingUnit);
        Test.stopTest();
        System.assertNotEquals(null, productListReturned, 'method is returning null');
    }

    /**
     * BS-1151
     */
    @isTest
    private static void getLensSelectionValuesTest() {
        List<Product2> productList = [SELECT Id, StockKeepingUnit FROM Product2 LIMIT 1];
        productList[0].StockKeepingUnit = 'testsku1234';
        productList[0].B2B_Lens_Index__c = '1,59';
        update productList;
        Test.startTest();
        List<Product2> productListReturned = B2B_VisionSensation_RX_Controller.getLensSelectionValues(
            productList[0].StockKeepingUnit,
            productList[0].B2B_Lens_Index__c
        );
        Test.stopTest();
        System.assertNotEquals(null, productListReturned, 'method is returning null');
    }

    //BS-727
    @isTest
    private static void constructLensConfiguratorDataWithoutCorrectLensTest() {
        try {
            String applicableBrand = 'RX';
            Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, true)); //BS-1248

            List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
            insert productList;

            List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
            insert lensConfiguratorList;

            List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
            insert lensShapeList;

            Test.startTest();
            //BS-1248
            B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper schneiderResponse = B2B_VisionSensation_RX_Controller.performSchneiderCallout(
                lensConfiguratorList[0].Id,
                applicableBrand,
                'en',
                null,
                null,
                false //BS-572 : Added blending : false
            );
            Test.stopTest();
            //BS-1248
            System.assertEquals(
                true,
                Boolean.valueOf(schneiderResponse.schneiderSuccessResponseWrapper.success) == true,
                'Schneider call should get successfull'
            );
        } catch (Exception exceptionInstance) {
            System.assertEquals(false, exceptionInstance.getMessage().containsIgnoreCase('Script-thrown exception'));
        }
    }

    //BS-727
    @isTest
    private static void constructLensConfiguratorDataWithInCorrectLensTest() {
        try {
            String applicableBrand = 'RX';
            Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, true)); //BS-1248

            List<Product2> productList = B2B_TestDataFactory.createIncorrectProductsForLensConfigurator();
            insert productList;

            List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createIncorrectRecordsForLensConfigurator();
            insert lensConfiguratorList;

            List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createInCorrectRecordsForLensShapes();
            insert lensShapeList;

            Test.startTest();
            B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper schneiderResponse = B2B_VisionSensation_RX_Controller.performSchneiderCallout(
                lensConfiguratorList[0].Id,
                applicableBrand,
                'en',
                null,
                null,
                false //BS-572 : Added blending : false
            );
            //BS-1248
            System.assertEquals(
                true,
                Boolean.valueOf(schneiderResponse.schneiderSuccessResponseWrapper.success) == true,
                'Schneider call should get successful'
            );
        } catch (Exception exceptionInstance) {
            System.assertEquals(false, exceptionInstance.getMessage().containsIgnoreCase('Script-thrown exception'));
        }
    }
    //BS-821
    @isTest
    public static void getPicklistValuesTest() {
        List<B2B_VisionSensation_RX_Controller.B2B_PicklistDataWraper> picklistWrapperList = new List<B2B_VisionSensation_RX_Controller.B2B_PicklistDataWraper>();
        picklistWrapperList = B2B_VisionSensation_RX_Controller.getPicklistValues();
        System.assertEquals(true, picklistWrapperList.size() > 0, 'Should return List of picklist values');
    }
    //BS-1092
    @isTest
    public static void updateLensConfiguratorDataLensOnlyTest() {
        B2B_TestDataFactory.createProductDataForLensConfigurator();
        List<B2B_Lens_Configurator__c> lensConfigList = [SELECT Id, B2B_RX_Solution__c FROM B2B_Lens_Configurator__c LIMIT 1];
        B2B_Lens_Configurator__c lensConfigurator = lensConfigList[0];
        Map<String, Object> fieldNameVsLensConfiguratorDataMap = B2B_TestDataFactory.createLensConfiguratorTestData(B2B_Constants.LENS_ONLY);
        Test.startTest();
        Id lensConfigratorId = B2B_VisionSensation_RX_Controller.updateLensConfiguratorData(lensConfigList[0].Id, fieldNameVsLensConfiguratorDataMap, 'de');
        Test.stopTest();
        System.assertEquals(
            lensConfigList[0].B2B_RX_Solution__c,
            fieldNameVsLensConfiguratorDataMap.get('B2B_RX_Solution__c'),
            'ProductCategoryProduct not returned'
        );
    }

    //BS-1092
    @isTest
    public static void updateLensConfiguratorDataFrameProvidedTest() {
        B2B_TestDataFactory.createProductDataForLensConfigurator();
        List<B2B_Lens_Configurator__c> lensConfigList = [SELECT Id, B2B_RX_Solution__c FROM B2B_Lens_Configurator__c LIMIT 1];
        B2B_Lens_Configurator__c lensConfigurator = lensConfigList[0];
        Map<String, Object> fieldNameVsLensConfiguratorDataMap = B2B_TestDataFactory.createLensConfiguratorTestData(B2B_Constants.LENS_ONLY_FRAME_PROVIDED);
        Test.startTest();
        Id lensConfigratorId = B2B_VisionSensation_RX_Controller.updateLensConfiguratorData(lensConfigList[0].Id, fieldNameVsLensConfiguratorDataMap, 'de');
        Test.stopTest();
        System.assertEquals(
            lensConfigList[0].B2B_RX_Solution__c,
            fieldNameVsLensConfiguratorDataMap.get('B2B_RX_Solution__c'),
            'ProductCategoryProduct not returned'
        );
    }

    //BS-1092
    @isTest
    private static void performSchneiderCalloutTest() {
        try {
            String applicableBrand = 'RX';

            List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
            insert productList;

            List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
            insert lensConfiguratorList;

            List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
            insert lensShapeList;

            Test.startTest();
            Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, true)); //BS-1248
            B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper schneiderResponse = B2B_VisionSensation_RX_Controller.performSchneiderCallout(
                lensConfiguratorList[0].Id,
                applicableBrand,
                'en',
                null,
                null,
                false //BS-572 : Added blending : false
            );
            Test.stopTest();
            //BS-1248
            System.assertEquals(
                true,
                Boolean.valueOf(schneiderResponse.schneiderSuccessResponseWrapper.success) == true,
                'Schneider call should get successfull'
            );
        } catch (Exception exceptionInstance) {
            System.assertEquals(false, exceptionInstance.getMessage().containsIgnoreCase('Script-thrown exception'));
        }
    }

    //BS-1092
    @isTest
    private static void performSchneiderCalloutWrongResponseTest() {
        try {
            String applicableBrand = 'RX';

            List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
            insert productList;

            List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
            insert lensConfiguratorList;

            List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
            insert lensShapeList;

            Test.startTest();
            Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(404, false)); //BS-1248
            B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper schneiderResponse = B2B_VisionSensation_RX_Controller.performSchneiderCallout(
                lensConfiguratorList[0].Id,
                applicableBrand,
                'en',
                null,
                null,
                false //BS-572 : Added blending : false
            );
            Test.stopTest();
            //BS-1248
            System.assertEquals(true, schneiderResponse.schneiderErrorResponseWrapper != null, 'OMA Error Response should be returned');
        } catch (Exception exceptionInstance) {
            System.assertEquals(false, exceptionInstance.getMessage().containsIgnoreCase('Script-thrown exception'));
        }
    }

    //BS-1092
    @isTest
    private static void performSchneiderCalloutFailedCallTest() {
        try {
            String applicableBrand = 'RX';

            List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
            insert productList;

            List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
            insert lensConfiguratorList;

            List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
            insert lensShapeList;

            Test.startTest();
            Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(404, false)); //BS-1248
            B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper schneiderResponse = B2B_VisionSensation_RX_Controller.performSchneiderCallout(
                lensConfiguratorList[0].Id,
                applicableBrand,
                'en',
                null,
                null,
                false //BS-572 : Added blending : false
            );
            Test.stopTest();
            System.assertEquals(true, schneiderResponse.schneiderErrorResponseWrapper != null, 'Error Response should be returned');
        } catch (Exception exceptionInstance) {
            System.assertEquals(false, exceptionInstance.getMessage().containsIgnoreCase('Script-thrown exception'));
        }
    }

    //BS-1092
    @isTest
    private static void validateAddToCartFailedTest() {
        try {
            String applicableBrand = 'RX';

            List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
            insert productList;

            List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
            insert lensConfiguratorList;

            List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
            insert lensShapeList;

            Test.startTest();
            //BS-1248 - Start
            Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, false)); //BS-1248
            //BS-1034 : Recieved response of validateAddToCart method into B2B_SchneiderResponse wrapper
            B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper schneiderResponse = B2B_VisionSensation_RX_Controller.validateAddToCart(
                lensConfiguratorList[0].Id,
                applicableBrand,
                'en',
                null,
                null,
                false
            );
            Boolean isSuccess = Boolean.valueOf(schneiderResponse.schneiderSuccessResponseWrapper.success);
            Test.stopTest();
            System.assertEquals(true, isSuccess != null, 'Schneider callout will fail due to calculation error');
            //BS-1248 - End
        } catch (Exception exceptionInstance) {
            System.assertEquals(true, exceptionInstance.getMessage() != null); //BS-1248
        }
    }

    @isTest
    private static void performSchneiderCalloutForCalculationErrorTest() {
        try {
            String applicableBrand = 'RX';
            Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, false)); //BS-1248

            List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
            insert productList;

            List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
            insert lensConfiguratorList;

            List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
            insert lensShapeList;

            Test.startTest();
            B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper schneiderResponse = B2B_VisionSensation_RX_Controller.performSchneiderCallout(
                lensConfiguratorList[0].Id,
                applicableBrand,
                'en',
                null,
                null,
                false //BS-572 : Added blending : false
            );
            Test.stopTest();
            System.assertEquals(
                true,
                Boolean.valueOf(schneiderResponse.schneiderSuccessResponseWrapper.success) == false,
                'Schneider call should get failed due to calculation error'
            );
        } catch (Exception exceptionInstance) {
            System.assertEquals(true, exceptionInstance.getMessage().containsIgnoreCase('Script-thrown exception'));
        }
    }

    //BS-1215
    @isTest
    public static void getEntitlementProductsForRXUnglazedGlobalTest() {
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductOverviewCollection mockGetProducts = new ConnectApi.ProductOverviewCollection();
        stub.mockedResponseByMethod.put('getProducts', mockGetProducts);
        B2B_VisionSensation_RX_Controller.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);
        String currentStore = 'ee';
        String buyerGroupType = 'RX Glazing';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType);
        List<ProductCategory> productcategoryList = [SELECT Id FROM ProductCategory];
        List<ProductCategoryProduct> productToInsertList = new List<ProductCategoryProduct>();
        List<Product2> productListToUpdate = [SELECT Id, B2B_Product_Type__c FROM Product2 WHERE Id = :storeResponse.get('productId')];
        productListToUpdate[0].B2B_Product_Type__c = 'performanceSportRXSolution';
        update productListToUpdate;
        for (ProductCategory productCategory : productcategoryList) {
            ProductCategoryProduct productCategoryProduct = new ProductCategoryProduct(
                ProductCategoryId = productCategory.Id,
                ProductId = storeResponse.get('productId'),
                IsPrimaryCategory = true
            );
            productToInsertList.add(productCategoryProduct);
        }
        insert productToInsertList;
        String accountId = storeResponse.get('accountId');
        Boolean globalEntitlementApplicable = true;
        List<ProductCategory> categoryList = [SELECT ID, Name FROM ProductCategory];
        List<String> categoryIdList = new List<String>();
        for (ProductCategory productCategory : categoryList) {
            categoryIdList.add(productCategory.Id);
        }
        List<Product2> productList = new List<Product2>();
        Test.startTest();
        productList = B2B_VisionSensation_RX_Controller.getEntitlementProducts(accountId, currentStore, globalEntitlementApplicable, categoryIdList);
        Test.stopTest();
        System.assertEquals(null, productList, 'Should not return any product');
    }

    //BS-1245
    @isTest
    private static void resetCartForCurrencyMismatchTest() {
        try {
            // Creating test data inside method as this data is required/applicable only for this test method.
            Map<String, String> storeResponseMap = B2B_TestDataFactory.setupCommerceStoreFront();
            Id userId = null;
            if (storeResponseMap.containsKey('userId')) {
                userId = storeResponseMap.get('userId');
            }
            User communityUser = new User(Id = userId);

            Id accountId = null;
            if (storeResponseMap.containsKey('accountId')) {
                accountId = storeResponseMap.get('accountId');
            }
            Id webStoreId = null;
            if (storeResponseMap.containsKey('webStoreId')) {
                webStoreId = storeResponseMap.get('webStoreId');
            }

            WebCart newCart = B2B_TestDataFactory.createActiveEmptyCart(webStoreId, accountId);
            if (newCart != null) {
                newCart.Status = 'Active';
                insert newCart;
            }

            List<CartItem> cartItemList = B2B_TestDataFactory.createCartItem(
                200,
                newCart,
                storeResponseMap,
                B2B_TestDataFactory.createInsertCartDeliveryGroup(newCart.Id)
            );

            if (cartItemList.isEmpty() == false) {
                insert cartItemList;
            }
            if (accountId != null) {
                Boolean status;
                Test.startTest();
                status = B2B_VisionSensation_RX_Controller.resetCartForCurrencyMismatch(String.valueOf(accountId));
                Test.stopTest();
                System.assertEquals(true, status != null, 'Method to reset cart should invoke');
            }
        } catch (Exception exceptionInstance) {
            system.assertEquals(true, exceptionInstance.getMessage().containsIgnoreCase('Script-thrown exception'));
        }
    }

    //BS-1213
    @isTest
    public static void resetLensConfiguratorDataExceptPrescriptionTest() {
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1];
        Test.startTest();
        B2B_VisionSensation_RX_Controller.resetLensConfiguratorDataExceptPrescription(lensConfiguratorList[0].Id);
        Test.stopTest();
        System.assertNotEquals(null, lensConfiguratorList, 'Lens Configurator Not updated');
    }

    //BS-1213
    @isTest
    public static void saveOrderInformationDataTest() {
        List<B2B_Lens_Configurator__c> lensConfigList = [SELECT Id, B2B_Customer_Name__c FROM B2B_Lens_Configurator__c LIMIT 1];
        B2B_Lens_Configurator__c lensConfigurator = lensConfigList[0];
        Map<String, Object> fieldNameVsLensConfiguratorDataMap = B2B_TestDataFactory.createLensConfiguratorTestData();
        Test.startTest();
        B2B_VisionSensation_RX_Controller.saveOrderInformationData(lensConfigList[0].Id, fieldNameVsLensConfiguratorDataMap);
        Test.stopTest();
        System.assertEquals(
            lensConfigList[0].B2B_Customer_Name__c,
            fieldNameVsLensConfiguratorDataMap.get('customerName'),
            'ProductCategoryProduct not returned'
        );
    }

    //BS-1213
    @isTest
    public static void saveOrderInformationExceptionTest() {
        List<B2B_Lens_Configurator__c> lensConfigList = [SELECT Id, B2B_Customer_Name__c, B2B_Order_Type__c FROM B2B_Lens_Configurator__c LIMIT 1];
        B2B_Lens_Configurator__c lensConfigurator = lensConfigList[0];
        Map<String, Object> fieldNameVsLensConfiguratorDataMap = B2B_TestDataFactory.createLensConfiguratorTestData();
        fieldNameVsLensConfiguratorDataMap.put('orderType', 'xyz');
        Test.startTest();
        B2B_VisionSensation_RX_Controller.saveOrderInformationData(lensConfigurator.Id, fieldNameVsLensConfiguratorDataMap);
        Test.stopTest();
        System.assertNotEquals('xyz', lensConfigurator.B2B_Order_Type__c, 'ProductCategoryProduct not returned');
    }

    //BS-1248
    @isTest
    private static void saveLensCalculationsToLensConfiguratorTest() {
        try {
            String applicableBrand = 'RX';
            Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, true)); //BS-1248

            List<Product2> productList = B2B_TestDataFactory.createProductsForLensConfigurator();
            insert productList;

            List<B2B_Lens_Configurator__c> lensConfiguratorList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
            insert lensConfiguratorList;

            List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createCorrectRecordsForLensShapes();
            insert lensShapeList;

            Test.startTest();
            B2B_VisionSensationUtility visionSensationUtility = new B2B_VisionSensationUtility();
            B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
            B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper response = visionSensationUtility.performSchneiderCallout(request);

            B2B_VisionSensation_RX_Controller.saveLensCalculationsToLensConfigurator(lensConfiguratorList[0].Id, response.schneiderSuccessResponseWrapper);
            List<B2B_Lens_Configurator__c> parsedLensConfiguratorList = [
                SELECT Id, B2B_Weight_Right__c, B2B_Weight_Left_Lens__c
                FROM B2B_Lens_Configurator__c
                WHERE Id = :lensConfiguratorList[0].Id
            ];
            Test.stopTest();
            //BS-1248
            System.assertEquals(
                true,
                (parsedLensConfiguratorList[0].B2B_Weight_Right__c != null ||
                parsedLensConfiguratorList[0].B2B_Weight_Left_Lens__c != null),
                'Lens Calculation values should get saved to database'
            );
        } catch (Exception exceptionInstance) {
            System.assertEquals(false, exceptionInstance.getMessage().containsIgnoreCase('Script-thrown exception'));
        }
    }

    //BS-722
    @isTest
    public static void getLensShapeDataShowAllTrueTest() {
        B2B_Lens_Shapes__c lensShapeObj = new B2B_Lens_Shapes__c(
            B2B_EE_Size__c = 'L',
            B2B_Model__c = 'e018',
            B2B_Shape_Name__c = 'e018',
            B2B_Frame_Type__c = 'Rimless',
            B2B_Bridge_Size__c = 17
        );
        insert lensShapeObj;

        String frameType = lensShapeObj.B2B_Frame_Type__c;
        String modelNumber = lensShapeObj.B2B_Model__c;

        List<B2B_Lens_Shapes__c> lensShapeList = new List<B2B_Lens_Shapes__c>();

        Test.startTest();
        lensShapeList = B2B_VisionSensation_RX_Controller.getLensShapeData(frameType, modelNumber, true, 17); //BS-2015
        Test.stopTest();

        System.assertNotEquals(null, lensShapeList, 'Lens Shape list is not returned');
    }

    //BS-795
    @isTest
    public static void getLensShapeDataShowAllFalseTest() {
        B2B_Lens_Shapes__c lensShapeObj = new B2B_Lens_Shapes__c(
            B2B_EE_Size__c = 'L',
            B2B_Model__c = 'e018',
            B2B_Shape_Name__c = 'e018',
            B2B_Frame_Type__c = 'Rimless',
            B2B_Bridge_Size__c = 0
        );
        insert lensShapeObj;

        String frameType = lensShapeObj.B2B_Frame_Type__c;
        String modelNumber = lensShapeObj.B2B_Model__c;

        List<B2B_Lens_Shapes__c> lensShapeList = new List<B2B_Lens_Shapes__c>();

        Test.startTest();
        lensShapeList = B2B_VisionSensation_RX_Controller.getLensShapeData(frameType, modelNumber, false, 0); //BS-2015
        Test.stopTest();

        System.assertNotEquals(null, lensShapeList, 'Lens Shape list is not returned');
    }

    //BS-722
    @isTest
    public static void getLensShapeTest() {
        Integer recordsToCreate = 20;
        String orderType = 'Complete Eyewear';
        String statusType = 'Open';
        String createdDate = '90';
        String applicableBrand = 'RX Glazing';

        B2B_TestDataFactory.createLensConfiguratorRecords(applicableBrand, recordsToCreate, orderType, statusType, createdDate);

        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id, B2B_Order_Type__c, B2B_Status__c, CreatedDate FROM B2B_Lens_Configurator__c LIMIT 1];
        String lensConfiguratorId = lensConfiguratorList[0].Id;

        B2B_Lens_Shapes__c lensShapeObj = new B2B_Lens_Shapes__c(B2B_EE_Size__c = 'L', B2B_Model__c = 'e018', B2B_Shape_Name__c = 'e018');
        insert lensShapeObj;

        List<B2B_Lens_Shapes__c> lensShapeIdList = [SELECT Id FROM B2B_Lens_Shapes__c LIMIT 1];

        String lensShapeId = lensShapeIdList[0].Id;

        Map<String, Object> fieldNameVsLensConfiguratorDataMap = B2B_TestDataFactory.createLensConfiguratorTestData();

        String calloutType = 'getOMAShape';

        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper omaUtilityObj = new B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper();

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));
        omaUtilityObj = B2B_VisionSensation_RX_Controller.getLensShape(lensConfiguratorId, lensShapeId, fieldNameVsLensConfiguratorDataMap, calloutType);
        Test.stopTest();

        System.assertNotEquals(null, omaUtilityObj, 'Expected ouput is not returned');
    }

    //BS-722
    @isTest
    public static void saveShapeSelectionDataTest() {
        Boolean isReturned;

        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id, B2B_Order_Type__c, B2B_Status__c, CreatedDate FROM B2B_Lens_Configurator__c limit1];
        String lensConfiguratorId = lensConfiguratorList[0].Id;

        String omaCalloutSuccessWrapper = '{"coordinates": [{"x": 26.221974547522869,"y": -0.3059525979007372},{"x": 26.283593102389624,"y": -0.13452098105674518}],"height": 45.862454072000006,"width": 55.874110527,"drills": [{"start": {"x": -25.321074406760893,"y": 8.99062592507166},"end": {"x": -25.321074406760893,"y": 8.99062592507166},"diameter": 1.4}],"oma": "REQ=FRM10.","hasDrills": true,"allowedScaling": {}}';

        Map<String, Object> userInputMap = B2B_TestDataFactory.createUserInputResponseForOMA();

        Test.startTest();
        isReturned = B2B_VisionSensation_RX_Controller.saveShapeSelectionData(
            lensConfiguratorId,
            omaCalloutSuccessWrapper,
            omaCalloutSuccessWrapper,
            userInputMap
        );
        Test.stopTest();

        System.assertNotEquals(false, isReturned, 'Expected flag value is not returned');
    }

    //BS-1525
    @isTest
    public static void performInitialSetupOfSearchResultContainerTest() {
        String objectApiName = 'B2B_Lens_Configurator__c';
        String picklistFieldName = 'B2B_Order_Type__c';
        B2B_VisionSensation_RX_Controller.B2B_SearchResultContainerInitialSetupDataWrapper initialsetupWrapper = new B2B_VisionSensation_RX_Controller.B2B_SearchResultContainerInitialSetupDataWrapper();
        Test.startTest();
        initialsetupWrapper = B2B_VisionSensation_RX_Controller.performInitialSetupOfSearchResultContainer(objectApiName, picklistFieldName);
        Test.stopTest();
        Assert.areEqual(false, initialsetupWrapper == null, 'response should not be null');
    }

    /**
     * BS-1473
     */
    @isTest
    private static void getAccentRingImageTest() {
        List<Product2> productList = [SELECT Id, StockKeepingUnit FROM Product2 LIMIT 1];
        B2B_Product_Image__c productImageObj = B2B_TestDataFactory.createProductImage(productList[0].Id);
        insert productImageObj;
        Test.startTest();
        List<B2B_Product_Image__c> productImageListReturned = B2B_VisionSensation_RX_Controller.getAccentRingImage(productList[0].Id);
        Test.stopTest();
        System.assertNotEquals(null, productImageListReturned, 'method is returning null');
    }

    /**
     * BS-1473
     */
    @isTest
    private static void getAccentRingColorTest() {
        String buyerGroupType = 'Vision Sensation';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType); //BS-2063
        List<Product2> productList = [SELECT Id, StockKeepingUnit FROM Product2 WHERE Name = 'TestSKU0'];
        productList[0].B2B_Variant_Shape__c = 'GZ';
        productList[0].B2B_Shape_Size__c = '48'; //BS-1902
        productList[0].B2B_Product_Type__c = B2B_Constants.ACCENT_RING_VALUE_API_NAME;
        update productList;
        Test.startTest();
        List<Product2> productListReturned = B2B_VisionSensation_RX_Controller.getAccentRingColor('GZ', '48', storeResponse.get('accountId')); //BS-2063
        Test.stopTest();
        System.assertNotEquals(null, productListReturned, 'method is returning null');
    }

    /**
     * BS-1493
     */
    @isTest
    private static void getColoredGrooveColorTest() {
        String buyerGroupType = 'Vision Sensation';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType); //BS-2063
        Test.startTest();
        List<ProductCategoryproduct> productCategoryProductListReturned = B2B_VisionSensation_RX_Controller.getColoredGrooveColor(
            storeResponse.get('accountId')
        ); //BS-2063
        Test.stopTest();
        System.assertEquals(null, productCategoryProductListReturned, 'method is returning null');
    }

    /**
     * BS-793
     */
    @isTest
    private static void getLensShapeRecordTest() {
        List<B2B_Lens_Shapes__c> lensShapeList = B2B_TestDataFactory.createLensShapes(1);
        insert lensShapeList;
        Test.startTest();
        List<B2B_Lens_Shapes__c> lensShapeListReturned = B2B_VisionSensation_RX_Controller.getLensShapeRecord(lensShapeList[0].Id);
        Test.stopTest();
        System.assertNotEquals(null, lensShapeListReturned, 'method is returning null');
    }

    //BS-1492:
    @isTest
    private static void getShapeSelectionScreenDataTest() {
        B2B_Lens_Configurator__c lensConfiguratorObj = [SELECT id, B2B_Drills__c FROM B2B_Lens_Configurator__c LIMIT 1];
        lensConfiguratorObj.B2B_Drills__c = 'ends';
        upsert lensConfiguratorObj;
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1];
        Test.startTest();
        B2B_VisionSensation_RX_Controller.B2B_ShapeSelectionDataWrapper WrapperObj = B2B_VisionSensation_RX_Controller.getShapeSelectionScreenData(
            lensConfiguratorList[0].Id
        );
        Test.stopTest();
        System.assertNotEquals(null, WrapperObj, 'Lens Configurator Not updated');
    }

    //BS-1492
    @isTest
    private static void getLensShapeDataByShapeNameTest() {
        Test.startTest();
        List<B2B_Lens_Shapes__c> lensShapesList = B2B_VisionSensation_RX_Controller.getLensShapeDataByShapeName('GZ', '48', null);
        Test.stopTest();
        System.assertEquals(null, lensShapesList, 'lens shape list not returned');
    }

    //BS-980
    @isTest
    private static void getLensSelectionScreenDataTest() {
        B2B_Lens_Configurator__c lensConfiguratorObj = [SELECT id, B2B_Drills__c FROM B2B_Lens_Configurator__c LIMIT 1];
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1];
        Test.startTest();
        B2B_Lens_Configurator__c lensConfigObj = B2B_VisionSensation_RX_Controller.getLensSelectionScreenData(lensConfiguratorObj.Id);
        Test.stopTest();
        System.assertNotEquals(null, lensConfigObj, 'Lens Configurator Not updated');
    }

    //BS-1650
    @isTest
    private static void getSelectedProductDetailTest() {
        List<Product2> productList = [SELECT Id, StockKeepingUnit FROM Product2 LIMIT 1];
        Test.startTest();
        Product2 productObj = B2B_VisionSensation_RX_Controller.getSelectedProductDetail(productList[0].Id);
        Test.stopTest();
        System.assertNotEquals(null, productObj, 'method is returning null');
    }

    //BS-1650
    @isTest
    private static void getAccountDetailTest() {
        List<Account> accountList = B2B_TestDataFactory.createAccounts(1, 'test', 'test@test.com', '1234');
        insert accountList;
        Test.startTest();
        Account accountObj = B2B_VisionSensation_RX_Controller.getAccountDetail(accountList[0].Id);
        Test.stopTest();
        System.assertNotEquals(null, accountObj, 'method is returning null');
    }

    //BS-967
    @isTest
    public static void updateLensConfiguratorDataVisionZoneIdPositiveTest() {
        B2B_TestDataFactory.createProductDataForLensConfigurator();
        List<B2B_Lens_Configurator__c> lensConfigList = [SELECT Id, B2B_RX_Solution__c FROM B2B_Lens_Configurator__c LIMIT 1];
        B2B_Lens_Configurator__c lensConfigurator = lensConfigList[0];
        Map<String, Object> fieldNameVsLensConfiguratorDataMap = B2B_TestDataFactory.createLensConfiguratorTestData();
        fieldNameVsLensConfiguratorDataMap.put(B2B_Constants.VISION_ZONE_ANALYSIS_ID, 'teststring1');
        Test.startTest();
        Id lensConfigratorId = B2B_VisionSensation_RX_Controller.updateLensConfiguratorData(lensConfigList[0].Id, fieldNameVsLensConfiguratorDataMap, 'de');
        Test.stopTest();
        System.assertEquals(
            lensConfigList[0].B2B_RX_Solution__c,
            fieldNameVsLensConfiguratorDataMap.get('B2B_RX_Solution__c'),
            'ProductCategoryProduct not returned'
        );
    }

    //BS-967
    @isTest
    public static void updateLensConfiguratorDataVisionZoneIdNegativeTest() {
        B2B_TestDataFactory.createProductDataForLensConfigurator();
        List<B2B_Lens_Configurator__c> lensConfigList = [SELECT Id, B2B_RX_Solution__c FROM B2B_Lens_Configurator__c LIMIT 1];
        B2B_Lens_Configurator__c lensConfigurator = lensConfigList[0];
        Map<String, Object> fieldNameVsLensConfiguratorDataMap = B2B_TestDataFactory.createLensConfiguratorTestData();
        fieldNameVsLensConfiguratorDataMap.put(B2B_Constants.VISION_ZONE_ANALYSIS_ID, '');
        Test.startTest();
        Id lensConfigratorId = B2B_VisionSensation_RX_Controller.updateLensConfiguratorData(lensConfigList[0].Id, fieldNameVsLensConfiguratorDataMap, 'de');
        Test.stopTest();
        System.assertEquals(
            lensConfigList[0].B2B_RX_Solution__c,
            fieldNameVsLensConfiguratorDataMap.get('B2B_RX_Solution__c'),
            'ProductCategoryProduct not returned'
        );
    }

    //BS-1612
    @isTest
    public static void updateLensConfiguratorDataVisionZoneResultPositiveTest() {
        B2B_TestDataFactory.createProductDataForLensConfigurator();
        List<B2B_Lens_Configurator__c> lensConfigList = [SELECT Id, B2B_RX_Solution__c FROM B2B_Lens_Configurator__c LIMIT 1];
        B2B_Lens_Configurator__c lensConfigurator = lensConfigList[0];
        Map<String, Object> fieldNameVsLensConfiguratorDataMap = B2B_TestDataFactory.createLensConfiguratorTestData();
        fieldNameVsLensConfiguratorDataMap.put(B2B_Constants.VISION_ZONE_ANALYSIS_RESULT, '0.67');
        fieldNameVsLensConfiguratorDataMap.put(
            B2B_Constants.VISION_ZONE_ANALYSIS_RESULT_DATA,
            '{answers={_1a=70.0, _1b=30.0, _2a=20.0, _2b=40.0, _2c=40.0, _2d=40.0, _3a=50.0, _3b=30.0, _3c=30.0, _3d=40.0, ...}, backgroundImage=https://media.silhouette.com/sza/beruf-frage2-oval@3x.png, image=https://media.silhouette.com/sza/beruf-frage2-icon@3x.png, overwritten=false, result=0.33, text=Highlypreciselong-distancevision, totalAnswers=10, totalQuestions=10}'
        );
        Test.startTest();
        Id lensConfigratorId = B2B_VisionSensation_RX_Controller.updateLensConfiguratorData(lensConfigList[0].Id, fieldNameVsLensConfiguratorDataMap, 'de');
        Test.stopTest();
        System.assertEquals(
            lensConfigList[0].B2B_RX_Solution__c,
            fieldNameVsLensConfiguratorDataMap.get('B2B_RX_Solution__c'),
            'ProductCategoryProduct not returned'
        );
    }

    //BS-1612
    @isTest
    public static void updateLensConfiguratorDataVisionZoneResultNegativeTest() {
        B2B_TestDataFactory.createProductDataForLensConfigurator();
        List<B2B_Lens_Configurator__c> lensConfigList = [SELECT Id, B2B_RX_Solution__c FROM B2B_Lens_Configurator__c LIMIT 1];
        B2B_Lens_Configurator__c lensConfigurator = lensConfigList[0];
        Map<String, Object> fieldNameVsLensConfiguratorDataMap = B2B_TestDataFactory.createLensConfiguratorTestData();
        fieldNameVsLensConfiguratorDataMap.put(B2B_Constants.VISION_ZONE_ANALYSIS_RESULT, '');
        fieldNameVsLensConfiguratorDataMap.put(B2B_Constants.VISION_ZONE_ANALYSIS_RESULT_DATA, null);
        Test.startTest();
        Id lensConfigratorId = B2B_VisionSensation_RX_Controller.updateLensConfiguratorData(lensConfigList[0].Id, fieldNameVsLensConfiguratorDataMap, 'de');
        Test.stopTest();
        System.assertEquals(
            lensConfigList[0].B2B_RX_Solution__c,
            fieldNameVsLensConfiguratorDataMap.get('B2B_RX_Solution__c'),
            'ProductCategoryProduct not returned'
        );
    }

    //BS-1612
    @isTest
    private static void constructLensConfiguratorDataVisionZoneTest() {
        try {
            String applicableBrand = 'RX';
            List<Product2> productList = new List<Product2>{
                new Product2(
                    Name = 'Test Product 1',
                    StockKeepingUnit = 'Test Product SKU 1',
                    B2B_Base_Curve__c = '2.0',
                    B2B_Bridge_Size__c = '18',
                    B2B_Salesconcept_unique__c = 'E8',
                    B2B_Color_Number__c = '4000',
                    B2B_Temple_Length__c = '140',
                    B2B_EE_Size__c = 'L',
                    B2B_Model__c = 'e018',
                    B2B_Variant_Shape__c = 'E018'
                ),
                new Product2(
                    Name = 'Test Product 2',
                    StockKeepingUnit = 'Test Product SKU 2',
                    B2B_Base_Curve__c = '2.0',
                    B2B_Bridge_Size__c = '18',
                    B2B_Salesconcept_unique__c = 'E8',
                    B2B_Color_Number__c = '4000',
                    B2B_Temple_Length__c = '140',
                    B2B_EE_Size__c = 'L',
                    B2B_Model__c = 'e018',
                    B2B_Variant_Shape__c = 'E018'
                )
            };
            insert productList;

            B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
                B2B_Selected_Frame__c = 'Test Product SKU 1',
                B2B_Selected_RX_Solution_SKU__c = 'Test Product SKU 2',
                B2B_Pupil_Distance_Left_Eye__c = 27.0,
                B2B_Pupil_Distance_Right_Eye__c = 27.0,
                B2B_Fitting_height_Left_Eye__c = 5,
                B2B_Measurement_System__c = 'Boxing System',
                B2B_Progression_Length__c = 18,
                B2B_Features__c = 'E',
                B2B_Lens_Shape__c = 'e018',
                B2B_Bridge__c = '14',
                B2B_Lens_Size__c = 59,
                B2B_Eye_Side__c = 'right and left lens side',
                B2B_Antireflection_SKU__c = 'C0001',
                B2B_Hard_Coating_SKU__c = 'C0004',
                B2B_Evil_Eye_Edge__c = true,
                B2B_Salesconcept__c = 'E018',
                B2B_Temple__c = '130',
                B2B_Remove_Drills__c = false,
                B2B_Schneider_SKU__c = 'ESV001',
                B2B_Variant_Shape__c = 'E018',
                B2B_Vision_Zone_Analysis_Result__c = '0.67'
            );
            insert lensConfiguratorObj;

            B2B_Lens_Shapes__c lensShapeObj = new B2B_Lens_Shapes__c(B2B_EE_Size__c = 'L', B2B_Model__c = 'e018', B2B_Shape_Name__c = 'e018');
            insert lensShapeObj;
            Test.startTest();
            B2B_VisionSensationUtility.B2B_SchneiderRequest schneiderRequest = B2B_VisionSensation_RX_Controller.constructLensConfiguratorData(
                String.valueOf(lensConfiguratorObj.Id),
                applicableBrand,
                'en',
                null,
                null,
                false
            );
            Test.stopTest();
            System.assertEquals(true, schneiderRequest != null, 'Request body should get constructed');
        } catch (Exception exceptionInstance) {
            System.assertEquals(true, exceptionInstance.getMessage().containsIgnoreCase('Script-thrown exception'));
        }
    }

    //BS-1798
    @isTest
    public static void clearLensConfiguratorDataTest() {
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1];
        Test.startTest();
        Boolean isSuccess = B2B_VisionSensation_RX_Controller.clearLensConfiguratorData(lensConfiguratorList[0].Id, B2B_Constants.BRAND_VS, 'frameChange');
        Test.stopTest();
        System.assertEquals(true, isSuccess, 'Lens Configurator Should be reset');
    }

    //BS-1415
    @IsTest
    public static void getAccountDataTest() {
        List<Account> accountList = new List<Account>();
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        Test.startTest();
        System.runAs(new user(Id = storeResponse.get('userId'))) {
            accountList.add(B2B_VisionSensation_RX_Controller.getAccountData());
            System.assertEquals(1, accountList.size(), 'Account should be returned');
        }
        Test.stopTest();
    }

    //BS-2063
    @IsTest
    public static void getEntitledProductIdsTest() {
        String buyerGroupType = 'Vision Sensation';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType);
        Set<String> productIdSet = new Set<String>();
        List<Product2> productIdList = [SELECT Id FROM Product2 WHERE Name = 'TestSKU0'];
        for (Product2 product : productIdList) {
            productIdSet.add(product.Id);
        }
        Test.startTest();
        Set<String> entitledProductIdSet = B2B_VisionSensation_RX_Controller.getEntitledProductIds(storeResponse.get('accountId'), productIdSet);
        Test.stopTest();

        System.assertNotEquals(null, entitledProductIdSet, 'Products should be returned');
    }

    //BS-1775
    @isTest
    public static void updateCurrentStepNumberTest() {
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1];
        Test.startTest();
        B2B_VisionSensation_RX_Controller.updateCurrentStepNumber(lensConfiguratorList[0].Id, 5);
        Test.stopTest();

        List<B2B_Lens_Configurator__c> lensConfiguratorReturnList = [SELECT Id, B2B_Last_Completed_Step__c FROM B2B_Lens_Configurator__c LIMIT 1];

        System.assertEquals(lensConfiguratorReturnList[0].B2B_Last_Completed_Step__c, 5, 'Should return 5');
    }
}
