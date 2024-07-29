@isTest
public with sharing class B2B_SearchControllerTest {
    @testSetup
    static void setup() {
        Product2 product = new Product2(Name = 'testProduct', Description = 'testProduct', Type = 'Base', StockKeepingUnit = 'testProSku', IsActive = true);
        insert product;
        List<Product2> productList = new List<Product2>();
        productList.add(product);
        ProductCatalog prodCatalog = new ProductCatalog();
        prodCatalog.Name = 'Silhouette B2B Store Catalog';
        insert prodCatalog;

        ProductCategory parentCategory = new ProductCategory();
        parentCategory.Name = 'ParentCategory2';
        parentCategory.CatalogId = prodCatalog.Id;
        parentCategory.B2B_Category_External_ID__c = 'test2';
        insert parentCategory;

        ProductCategory childCategory = new ProductCategory();
        childCategory.Name = 'ChildCategory';
        childCategory.IsNavigational = true;
        childCategory.ParentCategoryId = parentCategory.Id;
        childCategory.CatalogId = prodCatalog.Id;
        insert childCategory;

        ProductCategoryProduct productCategoryProduct = new ProductCategoryProduct();
        productCategoryProduct.ProductCategoryId = childCategory.Id;
        productCategoryProduct.ProductId = productList[0].Id;
        insert productCategoryProduct;

        Product2 productObj = new Product2();
        productObj.Name = 'Test Product';
        productObj.B2B_Shape_Size__c = '50';
        productObj.B2B_Bridge_Size__c = '0';
        productObj.B2B_Temple_Length__c = '100';
        insert productObj;

        ProductAttribute productAttributeObj = new ProductAttribute(
            ProductId = product.Id,
            B2B_Color__c = 'Red',
            B2B_EE_Size__c = 'S',
            B2B_Bridge_Size__c = '140',
            B2B_Temple_Length__c = '70'
        );
        insert productAttributeObj;

        List<ProductAttributeSet> productAttributeSetList = new List<ProductAttributeSet>(
            [
                SELECT id, MasterLabel
                FROM ProductAttributeSet
                WHERE MasterLabel = 'SH Rimless Demo' OR MasterLabel = 'SH Rimless Frame' OR MasterLabel = 'SH Fullrim'
                LIMIT 5
            ]
        );
        ProductAttributeSetProduct productAttributeSetProductObj = new ProductAttributeSetProduct(
            ProductId = product.Id,
            ProductAttributeSetId = productAttributeSetList[0].Id
        );
        insert productAttributeSetProductObj;

        ProductAttribute productAttributeObj2 = new ProductAttribute(
            ProductId = productObj.Id,
            B2B_Color__c = 'Red',
            B2B_EE_Size__c = 'S',
            B2B_Bridge_Size__c = '140',
            B2B_Temple_Length__c = '70',
            VariantParentId = product.Id,
            B2B_Shape_Size__c = '49'
        );
        insert productAttributeObj2;
    }

    @isTest
    public static void testProductSearch() {
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductSearchResults mocksearchResults = new ConnectApi.ProductSearchResults();
        mocksearchResults.productsPage = new ConnectApi.ProductSummaryPage();
        mocksearchResults.productsPage.products = new List<ConnectApi.ProductSummary>();

        stub.mockedResponseByMethod.put('searchProducts', mocksearchResults);
        B2B_SearchController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        String searchInput = '{"searchTerm":"test","refinements":[],"page":0,"includePrices":true}';

        //ConnectApi.ProductSearchResults searchResults;
        Object searchResults;
        Test.startTest();
        searchResults = B2B_SearchController.productSearch(
            B2B_TestDataFactory.mockRecordId(WebStore.getSObjectType()),
            searchInput,
            B2B_TestDataFactory.mockRecordId(Account.getSObjectType())
        );
        Test.stopTest();

        System.assertNotEquals(null, searchResults, 'Should return a product search result');
    }

    @isTest
    public static void testGetSortRules() {
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.SortRulesCollection mocksearchResults = new ConnectApi.SortRulesCollection();
        mocksearchResults.sortRules = new List<ConnectApi.SortRule>();

        stub.mockedResponseByMethod.put('getSortRules', mocksearchResults);
        B2B_SearchController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Object sortRules;
        Test.startTest();
        sortRules = B2B_SearchController.getSortRules(B2B_TestDataFactory.mockRecordId(WebStore.getSObjectType()));
        Test.stopTest();

        System.assertNotEquals(null, sortRules, 'Should return sort rules');
    }

    @isTest
    public static void testGetColorsMetadata() {
        Test.startTest();
        Map<String, Object> metadataRecords = (Map<String, Object>) JSON.deserializeUntyped(B2B_SearchController.getColorsMetadata());
        Test.stopTest();
        System.assertEquals(true, metadataRecords.keySet().size() > 0, 'Should return custom metadata records');
    }

    @isTest
    public static void testGetFramePicklist() {
        Test.startTest();
        B2B_SearchController.B2B_PicklistFieldWrapper picklistRecords = B2B_SearchController.getFieldPicklistValues('B2B_Frame_type__c');
        Test.stopTest();
        System.assertEquals(true, picklistRecords.picklistValues.size() > 0, 'Should return frame picklist values');
    }

    @isTest
    public static void testGetLensPicklist() {
        Test.startTest();
        B2B_SearchController.B2B_PicklistFieldWrapper picklistRecords = B2B_SearchController.getFieldPicklistValues('B2B_Lens_Shape__c');
        Test.stopTest();
        System.assertEquals(true, picklistRecords.picklistValues.size() > 0, 'Should return lens shape picklist values');
    }

    @isTest
    public static void testGetFaceShapePicklist() {
        Test.startTest();
        B2B_SearchController.B2B_PicklistFieldWrapper picklistRecords = B2B_SearchController.getFieldPicklistValues('B2B_Face_Shape__c');
        Test.stopTest();
        System.assertEquals(true, picklistRecords.picklistValues.size() > 0, 'Should return face shape picklist values');
    }

    @isTest
    public static void testFillAvailableFilterData() {
        Test.startTest();
        Map<String, B2B_Filters_Preference_Settings__mdt> filterPreferenceSettingRecords = B2B_SearchController.getFilterPreferenceSettingRecords();
        List<B2B_SearchController.B2B_filterDataWrapper> filterDataList = B2B_SearchController.fillFilterDataWrapper(filterPreferenceSettingRecords);
        if ((filterDataList.isEmpty() == false) && (filterDataList[0].categorySHList != null) && (filterDataList[0].categorySHList.isEmpty() == false)) {
            filterDataList[0].categorySHList.add('Silhouette');
            List<B2B_SearchController.B2B_AvailableFiltersDataWrapper> availableFilterList = B2B_SearchController.fillAvailableFilterDataWrapper(
                filterDataList,
                'Silhouette',
                'SH'
            );
            Test.stopTest();
            System.assertEquals(true, availableFilterList.size() > 0, 'Should return List of available filters');
        }
    }
    @isTest
    public static void testFillAvailableFilterDataNull() {
        Test.startTest();
        List<B2B_SearchController.B2B_filterDataWrapper> filterDataList = new List<B2B_SearchController.B2B_filterDataWrapper>();
        List<B2B_SearchController.B2B_AvailableFiltersDataWrapper> availableFilterList = B2B_SearchController.fillAvailableFilterDataWrapper(
            filterDataList,
            'Silhouette',
            'SH'
        );
        Test.stopTest();
        System.assertEquals(new List<B2B_SearchController.B2B_AvailableFiltersDataWrapper>{}, availableFilterList, 'Should return Null');
    }

    @isTest
    public static void testFillFilterDataNull() {
        Test.startTest();
        Map<String, B2B_Filters_Preference_Settings__mdt> filtersMap = new Map<String, B2B_Filters_Preference_Settings__mdt>();
        List<B2B_SearchController.B2B_filterDataWrapper> availableFilterList = B2B_SearchController.fillFilterDataWrapper(filtersMap);
        Test.stopTest();
        System.assertEquals(null, availableFilterList, 'Should return Null');
    }

    @isTest
    public static void testGetFiltersSH() {
        Test.startTest();
        List<B2B_SearchController.B2B_AvailableFiltersDataWrapper> filtersList = B2B_SearchController.getFilters('Optical Eyewear', 'SH');
        Test.stopTest();
        System.assertEquals(true, filtersList.size() > 0, 'Should return List of Filters');
    }

    @isTest
    public static void testGetReorderFilters() {
        Test.startTest();
        List<B2B_SearchController.B2B_AvailableFiltersDataWrapper> filtersList = B2B_SearchController.getReorderFilters('both SH EE');
        Test.stopTest();
        System.assertEquals(true, filtersList.size() > 0, 'Should return List of Filters');
    }
    @isTest
    public static void testGetReorderFiltersNB() {
        Test.startTest();
        List<B2B_SearchController.B2B_AvailableFiltersDataWrapper> filtersList = B2B_SearchController.getReorderFilters('NB');
        Test.stopTest();
        System.assertEquals(true, filtersList.size() > 0, 'Should return List of Filters');
    }

    @isTest
    public static void testGetFiltersNB() {
        Test.startTest();
        List<B2B_SearchController.B2B_AvailableFiltersDataWrapper> filtersList = B2B_SearchController.getFilters('Optical Eyewear', 'NB');
        Test.stopTest();
        System.assertEquals(true, filtersList.size() > 0, 'Should return List of Filters');
    }

    @isTest
    public static void testGetFiltersEE() {
        Test.startTest();
        List<B2B_SearchController.B2B_AvailableFiltersDataWrapper> filtersList = B2B_SearchController.getFilters('evil eye', 'EE');
        Test.stopTest();
        System.assertEquals(true, filtersList.size() > 0, 'Should return List of Filters');
    }

    @isTest
    public static void testGetCategoryDetails() {
        List<ProductCategory> productcategoryValueList = [SELECT Id FROM ProductCategory];
        Test.startTest();
        List<ProductCategory> productCategoryList = B2B_SearchController.getCategoryDetails(productcategoryValueList[0].Id);
        Test.stopTest();
        System.assertEquals(true, productCategoryList.size() > 0, 'Should return List of Filters');
    }

    @isTest
    public static void testGetCategories() {
        List<ProductCategory> productcategoryValueList = [SELECT Id FROM ProductCategory];
        Test.startTest();
        Map<String, String> productCategoryNameVsIdMap = B2B_SearchController.getCategories(productcategoryValueList[0].Id);
        Test.stopTest();
        System.assertEquals(true, productCategoryNameVsIdMap.size() > 0, 'Should return Map of category names and Ids');
    }

    @isTest
    public static void testFetchProductDataPicklistValues() {
        Test.startTest();
        List<String> picklistValueList = B2B_SearchController.fetchProductDataPicklistValues();
        Test.stopTest();
        System.assertEquals(true, picklistValueList.size() > 0, 'Should return List of Picklist Values');
    }

    @isTest
    public static void testGetCategoryDataSH() {
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
        B2B_SearchController.B2B_CategoryDetailsWrapper categoryWrapper = B2B_SearchController.getCategoryData(
            productIdList,
            productcategoryList[0].Id,
            'de',
            'SH'
        );
        Test.stopTest();
        System.assertEquals(true, categoryWrapper.categoryProductCountList.size() > 0, 'Should return List of Aggregate Result');
    }

    //BS-1544
    @isTest
    public static void testGetCategoryDataNB() {
        List<Product2> productList = [SELECT Id FROM Product2 WHERE Name = 'testProduct'];

        List<ProductCatalog> productCatalogueList = [SELECT Id, Name FROM ProductCatalog LIMIT 1];
        productCatalogueList[0].Name = 'Neubau B2B Store Catalog';
        update productCatalogueList;

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
        B2B_SearchController.B2B_CategoryDetailsWrapper categoryWrapper = B2B_SearchController.getCategoryData(
            productIdList,
            productcategoryList[0].Id,
            'de',
            'NB'
        );
        Test.stopTest();
        System.assertEquals(true, categoryWrapper.categoryProductCountList.size() > 0, 'Should return List of Aggregate Result');
    }

    @isTest
    public static void testGetPolicy() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        String accountId = storeResponse.get('accountId');
        List<String> policyIdList = B2B_SearchController.getPolicy(accountId);
        System.assertEquals(true, policyIdList.size() > 0, 'Should return List of policy Result');
    }

    @isTest
    public static void testSearchProducts() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        String accountId = storeResponse.get('accountId');
        List<String> policyIdList = B2B_SearchController.getPolicy(accountId);
        List<String> productIdList = B2B_SearchController.searchProducts(accountId);
        System.assertEquals(true, productIdList.size() > 0, 'Should return List of product Ids');
    }

    @isTest
    public static void testGetAllProducts() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        List<ProductCategory> productcategoryList = [SELECT Id FROM ProductCategory WHERE Name = 'ParentCategory'];
        ProductCategoryProduct productCategoryProduct = new ProductCategoryProduct(
            ProductCategoryId = productcategoryList[0].Id,
            ProductId = storeResponse.get('productId'),
            IsPrimaryCategory = true
        );
        insert productCategoryProduct;
        String accountId = storeResponse.get('accountId');
        List<String> policyIdList = B2B_SearchController.getPolicy(accountId);
        List<String> productIdList = B2B_SearchController.searchProducts(accountId);
        List<Id> categoryIdList = new List<Id>();
        B2B_SearchController.B2B_productCategoryWrapper categoryWrapper = B2B_SearchController.getAllProducts(
            productIdList,
            productcategoryList[0].Id,
            categoryIdList
        );
        System.assertEquals(true, categoryWrapper.productList.size() > 0, 'Should return List of product data');
    }

    @isTest
    public static void testProductsSearch() {
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductOverviewCollection mockGetProducts = new ConnectApi.ProductOverviewCollection();
        stub.mockedResponseByMethod.put('getProducts', mockGetProducts);
        B2B_SearchController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        String accountId = storeResponse.get('accountId');
        List<String> policyIdList = B2B_SearchController.getPolicy(accountId);
        List<String> productIdList = B2B_SearchController.searchProducts(accountId);
        Object product = B2B_SearchController.productsSearch(storeResponse.get('webStoreId'), storeResponse.get('accountId'), productIdList);
        System.assertNotEquals(null, product, 'Product spare parts not returned correctly');
    }

    @isTest
    public static void testGetProductFieldSet() {
        List<Product2> productList = [SELECT Id FROM Product2 WHERE B2B_Shape_Size__c != NULL LIMIT 1];
        Test.startTest();
        List<B2B_SearchController.B2B_ProductDataWrapper> productDataWrapperList = B2B_SearchController.getProductData(productList[0].Id);
        Test.stopTest();
        System.assertEquals(true, productDataWrapperList.size() > 0, 'Should return List of Product data Wrapper ');
    }

    @isTest
    public static void testGetSearchedProducts() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        List<ProductCategory> productcategoryList = [SELECT Id FROM ProductCategory WHERE Name = 'ParentCategory'];
        ProductCategoryProduct productCategoryProduct = new ProductCategoryProduct(
            ProductCategoryId = productcategoryList[0].Id,
            ProductId = storeResponse.get('productId'),
            IsPrimaryCategory = true
        );
        insert productCategoryProduct;
        String accountId = storeResponse.get('accountId');
        List<String> policyIdList = B2B_SearchController.getPolicy(accountId);
        List<String> productIdList = B2B_SearchController.searchProducts(accountId);
        B2B_SearchController.B2B_productCategoryWrapper categoryWrapperSH = B2B_SearchController.getSearchedProducts(productIdList, 'TestSKU', 'SH');
        B2B_SearchController.B2B_productCategoryWrapper categoryWrapperNB = B2B_SearchController.getSearchedProducts(productIdList, 'TestSKU', 'NB');
        System.assertEquals(true, categoryWrapperSH.productList.size() > 0, 'Should return List of product data');
        System.assertEquals(true, categoryWrapperNB.productList.size() > 0, 'Should return List of product data');
    }

    @isTest
    public static void testgetPicklistValues() {
        List<B2B_SearchController.B2B_PicklistDataWraper> picklistWrapperList = new List<B2B_SearchController.B2B_PicklistDataWraper>();
        picklistWrapperList = B2B_SearchController.getPicklistValues();
        System.assertEquals(true, picklistWrapperList.size() > 0, 'Should return List of picklist values');
    }

    //BS-1179
    @isTest
    public static void getAttributeFieldDataTest() {
        Test.startTest();
        List<B2B_SearchController.B2B_ProductDataWrapper> productDatWrapperList = B2B_SearchController.getAttributeFieldData();
        Test.stopTest();
        System.assertEquals(false, productDatWrapperList.isEmpty(), 'Should return List of picklist values');
    }

    //BS-1562
    @IsTest
    private static void updateCartItemTest() {
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
                1,
                newCart,
                storeResponseMap,
                B2B_TestDataFactory.createInsertCartDeliveryGroup(newCart.Id)
            );

            if (cartItemList.isEmpty() == false) {
                insert cartItemList;
            }
            Test.startTest();
            String customerInput = '[{"value":"Test Name","fieldAPIName":"Customer_Reference__c"},{"value":"Test Clerk","fieldAPIName":"Entered_By__c"}]';
            CartItem updatedCartItem = B2B_SearchController.updateCartItem(cartItemList[0].Id, customerInput);
            List<CartItem> updatedCartItemList = [SELECT Id, Customer_Reference__c, Entered_By__c FROM CartItem WHERE Id = :updatedCartItem.Id];
            System.assertEquals('Test Name', updatedCartItemList[0].Customer_Reference__c, 'Customer Name should be updated on Cart Item');
            System.assertEquals('Test Clerk', updatedCartItemList[0].Entered_By__c, 'Clerk should be updated on Cart Item');
            Test.stopTest();
        } catch (Exception exceptionInstance) {
            System.assertNotEquals(null, exceptionInstance, 'Should throw an error for ConnectAPI');
        }
    }

    //BS-1562
    @isTest
    private static void getCartItemDetailsTest() {
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
            1,
            newCart,
            storeResponseMap,
            B2B_TestDataFactory.createInsertCartDeliveryGroup(newCart.Id)
        );

        if (cartItemList.isEmpty() == false) {
            insert cartItemList;
        }
        Test.startTest();
        CartItem cartItemObj = B2B_SearchController.getCartItemDetails(cartItemList[0].Id);
        Test.stopTest();
        System.assertEquals(true, cartItemObj != null, 'Cart Item should be returned');
    }
    @isTest
    private static void testGetBridgeTempleCountforProduct() {
        List<Product2> productList = [SELECT Id FROM Product2 WHERE Name = 'Test Product' LIMIT 1];

        List<String> productIdList = new List<String>();
        for (Product2 product : productList) {
            productIdList.add(product.Id);
        }
        Test.StartTest();
        Map<Id, Integer> result = B2B_SearchController.getBridgeTempleCountforProduct(productIdList);
        Test.StopTest();
        System.assertEquals(false, result.size() == 0, 'Result should not be empty');
    }
    @isTest
    private static void testGetColorCountAndSizeforProduct() {
        List<Product2> productList = [SELECT Id FROM Product2 WHERE Name = 'Test Product' LIMIT 1];
        List<String> productIdList = new List<String>();
        for (Product2 product : productList) {
            productIdList.add(product.Id);
        }
        Test.StartTest();
        Map<Id, List<String>> result = B2B_SearchController.getColorCountAndSizeforProduct(productIdList);
        Test.StopTest();

        System.assertEquals(false, result.size() == 0, 'Result should not be empty');
    }
}
