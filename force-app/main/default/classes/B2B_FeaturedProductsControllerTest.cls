@isTest
public with sharing class B2B_FeaturedProductsControllerTest {
    private static Id userId = null;
    private static Id accountId = null;
    private static Id storeId = null;
    private static Id productId = null;

    private static final Integer MAX_PRODUCTS = 4;

    private static String categoryId = null;
    private static String categoryId2 = null;

    private static String sku = null;
    private static String productDesc = B2B_TestDataFactory.PRODUCT_TEST_DESCRIPTION;
    private static final String B2B_COMMERCE_USER_PROFILE = 'B2B Commerce User Silhouette';

    /**
     * @description This method will mock the result which we usually retrieve via Connect API
     *              This can be done as the Commerce API is tested separately and we want to avoid "SeeAllData"
     **/
    private static void mockProductPriceTestData() {
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        List<Product2> mockProducts = B2B_TestDataFactory.createProducts(1, null, true);
        ConnectApi.ProductDetail mockProductDetail = B2B_TestDataFactory.mockProductDetail(mockProducts[0]);
        stub.mockedResponseByMethod.put('getProduct', mockProductDetail);
        B2B_ProductUtils.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);
        ConnectApi.PricingResult productPriceMock = B2B_TestDataFactory.mockProductPricing(mockProducts);
        stub.mockedResponseByMethod.put('getProductPrices', productPriceMock);
    }

    /**
     * @description Create featured products and return "Source product"
     **/
    private static WebCart setupTestDataProductLink() {
        List<Product2> products = B2B_TestDataFactory.createProducts(MAX_PRODUCTS + 10, null);
        products[0].StockKeepingUnit = 'productTestSku' + '6';
        products[1].B2B_Availability_JSON__c = '{"DEDE": 1, "USUS": 3}';
        products[2].B2B_Availability_JSON__c = '{"DEDE": 1, "USUS": 3}';
        products[3].B2B_Availability_JSON__c = '{"DEDE": 1, "USUS": 3}';
        products[4].B2B_Availability_JSON__c = '{"DEDE": 1, "USUS": 3}';
        products[5].B2B_Availability_JSON__c = '{"DEDE": 1, "USUS": 3}';

        insert products;

        List<B2B_Commerce_Product_Link__c> featuredProducts = new List<B2B_Commerce_Product_Link__c>{
            new B2B_Commerce_Product_Link__c(B2B_Source_Product__c = products[0].Id, B2B_Target_Product__c = products[1].Id, B2B_Type__c = 'Spare Part'),
            new B2B_Commerce_Product_Link__c(B2B_Source_Product__c = products[0].Id, B2B_Target_Product__c = products[2].Id, B2B_Type__c = 'Spare Part'),
            new B2B_Commerce_Product_Link__c(B2B_Source_Product__c = products[3].Id, B2B_Target_Product__c = products[4].Id, B2B_Type__c = 'Spare Part'),
            new B2B_Commerce_Product_Link__c(B2B_Source_Product__c = products[3].Id, B2B_Target_Product__c = products[5].Id, B2B_Type__c = 'Spare Part'),
            new B2B_Commerce_Product_Link__c(B2B_Source_Product__c = products[3].Id, B2B_Target_Product__c = products[6].Id, B2B_Type__c = 'Spare Part'),
            new B2B_Commerce_Product_Link__c(B2B_Source_Product__c = products[3].Id, B2B_Target_Product__c = products[7].Id, B2B_Type__c = 'Spare Part'),
            new B2B_Commerce_Product_Link__c(B2B_Source_Product__c = products[3].Id, B2B_Target_Product__c = products[10].Id, B2B_Type__c = 'Spare Part')
        };
        insert featuredProducts;

        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();

        Id accountId = storeResponse.get('accountId');

        Account accObj = new Account(Id = accountId, k_ARIS_Account_ID__c = 'DEDE_123');
        update accObj;

        WebCart cartObj = B2B_TestDataFactory.createActiveEmptyCart(storeResponse.get('webStoreId'), accountId);
        cartObj.Status = 'Active';

        insert cartObj;
        Map<String, String> storeResponseEmpty = new Map<String, String>();

        CartDeliveryGroup cartDeliveryObj = B2B_TestDataFactory.createInsertCartDeliveryGroup(cartObj.Id);

        List<cartItem> cartItemList = B2B_TestDataFactory.createCartItem(2, cartObj, storeResponseEmpty, cartDeliveryObj);

        cartItemList[0].product2Id = products[0].Id;
        cartItemList[1].product2Id = products[3].Id;
        insert cartItemList;

        List<ProductCategory> productCategoryList = new List<ProductCategory>();

        ProductCategory storeSilhouetteCategoryObj = new ProductCategory(
            CatalogId = storeResponse.get('catalogId'),
            Name = 'Silhouette',
            CurrencyIsoCode = 'EUR'
        );
        insert storeSilhouetteCategoryObj;

        ProductCategory storeSilhouetteSpareCategoryObj = new ProductCategory(
            CatalogId = storeResponse.get('catalogId'),
            Name = 'Spare Parts',
            ParentCategoryId = storeSilhouetteCategoryObj.Id,
            CurrencyIsoCode = 'EUR'
        );
        insert storeSilhouetteSpareCategoryObj;

        ProductCategory silhouetteStoreSubCategory = new ProductCategory(CatalogId = storeResponse.get('catalogId'), Name = 'Test', CurrencyIsoCode = 'EUR');
        insert silhouetteStoreSubCategory;

        ProductCategory spareSubCategoryObj1 = new ProductCategory(
            CatalogId = storeResponse.get('catalogId'),
            Name = 'Supplement Parts',
            ParentCategoryId = storeSilhouetteSpareCategoryObj.Id,
            CurrencyIsoCode = 'EUR'
        );
        productCategoryList.add(spareSubCategoryObj1);

        ProductCategory spareSubCategoryObj2 = new ProductCategory(
            CatalogId = storeResponse.get('catalogId'),
            Name = 'Technical Support',
            ParentCategoryId = storeSilhouetteSpareCategoryObj.Id,
            CurrencyIsoCode = 'EUR'
        );
        productCategoryList.add(spareSubCategoryObj2);

        ProductCategory spareSubCategoryObj3 = new ProductCategory(
            CatalogId = storeResponse.get('catalogId'),
            Name = 'Product Equipment',
            ParentCategoryId = storeSilhouetteSpareCategoryObj.Id,
            CurrencyIsoCode = 'EUR'
        );
        productCategoryList.add(spareSubCategoryObj3);

        insert productCategoryList;

        List<ProductCategoryProduct> productCategoryProducts = new List<ProductCategoryProduct>{
            new ProductCategoryProduct(ProductCategoryId = silhouetteStoreSubCategory.Id, ProductId = products[0].Id, IsPrimaryCategory = true),
            new ProductCategoryProduct(ProductCategoryId = storeSilhouetteSpareCategoryObj.Id, ProductId = products[3].Id, IsPrimaryCategory = true),
            new ProductCategoryProduct(ProductCategoryId = silhouetteStoreSubCategory.Id, ProductId = products[9].Id, IsPrimaryCategory = true),
            new ProductCategoryProduct(ProductCategoryId = productCategoryList[0].Id, ProductId = products[1].Id, IsPrimaryCategory = true),
            new ProductCategoryProduct(ProductCategoryId = productCategoryList[1].Id, ProductId = products[2].Id, IsPrimaryCategory = true),
            new ProductCategoryProduct(ProductCategoryId = productCategoryList[2].Id, ProductId = products[4].Id, IsPrimaryCategory = true),
            new ProductCategoryProduct(ProductCategoryId = productCategoryList[1].Id, ProductId = products[5].Id, IsPrimaryCategory = true)
        };

        insert productCategoryProducts;

        return cartObj;
    }

    /*
        getProductsByCategoryId - success
        Get products using a category Id
    */
    @IsTest
    public static void testFeaturedByCategory1() {
        mockProductPriceTestData();
        Map<String, String> sampleCatalog = B2B_TestDataFactory.createInsertCatalogAndCategory();
        String categoryExternalId = (String) sampleCatalog.get('categoryExternalId');
        Id categoryId = (Id) sampleCatalog.get('parentCategoryId');

        List<Product2> testProducts = B2B_TestDataFactory.createInsertProducts(10, null);
        List<ProductCategoryProduct> productCategoryProducts = new List<ProductCategoryProduct>();
        for (Product2 product : testProducts) {
            productCategoryProducts.add(new ProductCategoryProduct(ProductCategoryId = categoryId, ProductId = product.Id, IsPrimaryCategory = true));
        }
        insert productCategoryProducts;

        // >
        Map<String, Object> responseMap = null;
        Integer numOfReturnedFProducts = 0;
        Test.startTest();
        numOfReturnedFProducts = B2B_FeaturedProductsController.getFeaturedProductIdsByCategoryId(categoryExternalId, MAX_PRODUCTS).size();
        responseMap = B2B_FeaturedProductsController.getProductsByCategoryId(
            B2B_TestDataFactory.mockRecordId(WebStore.getSObjectType()),
            B2B_TestDataFactory.mockRecordId(Account.getSObjectType()),
            categoryExternalId,
            true,
            MAX_PRODUCTS
        );

        Test.stopTest();

        String jsonData = (String) responseMap.get('data');
        List<Object> productList = new List<Object>();

        if (jsonData != null) {
            productList = (List<Object>) JSON.deserializeUntyped(jsonData);
        }

        System.assertNotEquals(null, jsonData, 'Product data shouldnt be empty');
        System.assertEquals(MAX_PRODUCTS, numOfReturnedFProducts, 'Only specifid limit of products should be returned');
    }

    /*
        getProductsByCategoryId - error condition
        Get products using a null category Id
    */
    @IsTest
    public static void testFeaturedByCategoryException() {
        mockProductPriceTestData();

        User communityUser = B2B_TestDataFactory.createInsertCommerceUser();
        Boolean includePrices = true;
        List<String> skuList = new List<String>();
        skuList.add(sku);

        Map<String, Object> responseMap1 = null;
        Map<String, Object> responseMap2 = null;
        Test.startTest();

        System.runAs(communityUser) {
            // Check with empty category
            responseMap1 = B2B_FeaturedProductsController.getProductsByCategoryId(
                B2B_TestDataFactory.mockRecordId(WebStore.getSObjectType()),
                B2B_TestDataFactory.mockRecordId(Account.getSObjectType()),
                null,
                includePrices,
                MAX_PRODUCTS
            );
            // Check with mocked category -> shouldnt return any result either
            responseMap2 = B2B_FeaturedProductsController.getProductsByCategoryId(
                B2B_TestDataFactory.mockRecordId(WebStore.getSObjectType()),
                B2B_TestDataFactory.mockRecordId(Account.getSObjectType()),
                B2B_TestDataFactory.mockRecordId(ProductCategory.getSObjectType()),
                includePrices,
                MAX_PRODUCTS
            );
        }

        Test.stopTest();

        String jsonData = (String) responseMap1.get('data');

        List<Object> productList = new List<Object>();

        if (jsonData != null) {
            productList = (List<Object>) JSON.deserializeUntyped(jsonData);
        }

        String retValue = null;

        for (Object obj : productList) {
            Map<String, Object> productMap = (Map<String, Object>) obj;
            Map<String, Object> fieldsMap = (Map<String, Object>) productMap.get('fields');
            Map<String, Object> fieldValueMap = (Map<String, Object>) fieldsMap.get('StockKeepingUnit');

            retValue = (String) fieldValueMap.get('value');
        }

        System.assertEquals(null, responseMap1.get('data'), 'ret value should be null');
        System.assertEquals(null, responseMap2.get('data'), 'ret value should be null');
    }

    /*
        getProductsByCategoryId - error condition
        Get products using a null webstore Id
    */
    @IsTest
    public static void testFeaturedByCategoryExceptionWithNullWebstore() {
        Map<String, String> sampleCatalog = B2B_TestDataFactory.createInsertCatalogAndCategory();
        String categoryExternalId = (String) sampleCatalog.get('categoryExternalId');
        Id categoryId = (Id) sampleCatalog.get('parentCategoryId');

        List<Product2> testProducts = B2B_TestDataFactory.createInsertProducts(10, null);
        List<ProductCategoryProduct> productCategoryProducts = new List<ProductCategoryProduct>();
        for (Product2 product : testProducts) {
            productCategoryProducts.add(new ProductCategoryProduct(ProductCategoryId = categoryId, ProductId = product.Id, IsPrimaryCategory = true));
        }
        insert productCategoryProducts;

        // >
        Map<String, Object> responseMap = null;
        Integer numOfReturnedFProducts = 0;
        Test.startTest();
        numOfReturnedFProducts = B2B_FeaturedProductsController.getFeaturedProductIdsByCategoryId(categoryExternalId, MAX_PRODUCTS).size();
        responseMap = B2B_FeaturedProductsController.getProductsByCategoryId(
            null,
            B2B_TestDataFactory.mockRecordId(Account.getSObjectType()),
            categoryExternalId,
            true,
            MAX_PRODUCTS
        );

        Test.stopTest();

        String jsonData = (String) responseMap.get('data');
        List<Object> productList = new List<Object>();

        if (jsonData != null) {
            productList = (List<Object>) JSON.deserializeUntyped(jsonData);
        }

        System.assertEquals(null, jsonData, 'Product data should be empty');
    }

    @IsTest
    public static void testFeaturedByLinkType1() {
        mockProductPriceTestData();
        WebCart cartObj = setupTestDataProductLink();
        List<cartItem> cartItemList = [SELECT Product2Id, cartId FROM CartItem WHERE cartId = :cartObj.Id LIMIT 2];
        Map<String, Object> responseMap = null;
        //Id profileId = [SELECT Id FROM Profile WHERE Name = :B2B_COMMERCE_USER_PROFILE LIMIT 1].Id;
        //User communityUser = [SELECT Id FROM User WHERE ProfileId = :profileId AND IsActive = TRUE LIMIT 1];

        List<Product2> prodList = [SELECT Id, ProductClass FROM Product2 LIMIT 14];

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();

        ConnectApi.CartItem cartItem1 = new ConnectApi.CartItem();
        cartItem1.cartItemId = cartItemList[0].Id;
        cartItem1.cartId = cartObj.Id;
        cartItem1.productId = prodList[0].Id;

        ConnectApi.CartItem cartItem2 = new ConnectApi.CartItem();
        cartItem2.cartItemId = cartItemList[1].Id;
        cartItem2.cartId = cartObj.Id;
        cartItem2.productId = prodList[3].Id;

        ConnectApi.CartItemResult cartItemResult1 = new ConnectApi.CartItemResult();
        cartItemResult1.cartItem = cartItem1;

        ConnectApi.CartItemResult cartItemResult2 = new ConnectApi.CartItemResult();
        cartItemResult2.cartItem = cartItem2;

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>{ cartItemResult1, cartItemResult2 };

        stub.mockedResponseByMethod.put('getCartItems', mockCartItemCollection);
        B2B_FeaturedProductsController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        B2B_CommerceMockProvider stubObj = new B2B_CommerceMockProvider();

        List<Product2> productList = [
            SELECT Id, Name, Description, Type, StockKeepingUnit, IsActive, B2B_Availability_JSON__c
            FROM Product2
            WHERE B2B_Availability_JSON__c != NULL
            LIMIT 1
        ];

        ConnectApi.ProductDetail mockProductDetail = B2B_TestDataFactory.mockProductDetail(productList[0]);

        stubObj.mockedResponseByMethod.put('getProduct', mockProductDetail);
        B2B_ProductUtils.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stubObj);

        List<WebStore> storeList = [SELECT Id FROM WebStore LIMIT 1];
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];

        Set<Id> cartProductIdSet = new Set<Id>();

        for (CartItem cartItemObj : cartItemList) {
            cartProductIdSet.add(cartItemObj.Product2Id);
        }

        Test.startTest();

        /*
        System.runAs(communityUser) {
            responseMap = B2B_FeaturedProductsController.getProductsByLinkyType(storeList[0].Id, accountList[0].Id, cartObj.Id, 'Spare Part', true, 5);
        }
		*/
        responseMap = B2B_FeaturedProductsController.getProductsByLinkyType(storeList[0].Id, accountList[0].Id, cartObj.Id, 'Spare Part', true, 5);

        Test.stopTest();
        System.debug(LoggingLevel.INFO, 'responseMap: ' + JSON.serialize(responseMap));

        System.assertNotEquals(null, responseMap, 'ret value should not be null');
    }

    @IsTest
    public static void testFeaturedByLinkTypeSpareWithNoParent() {
        mockProductPriceTestData();
        WebCart cartObj = setupTestDataProductLink();
        List<cartItem> cartItemList = [SELECT Product2Id, cartId FROM CartItem WHERE cartId = :cartObj.Id LIMIT 1];
        Map<String, Object> responseMap = null;
        Id profileId = [SELECT Id FROM Profile WHERE Name = :B2B_COMMERCE_USER_PROFILE LIMIT 1].Id;
        User communityUser = [SELECT Id FROM User WHERE ProfileId = :profileId AND IsActive = TRUE LIMIT 1];

        List<ProductCategoryProduct> productCategoryList = [SELECT Id FROM ProductCategoryProduct];

        delete productCategoryList;

        List<Product2> prodList = [SELECT Id FROM Product2 LIMIT 1];

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();

        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();

        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartObj.Id;
        cartItem.productId = prodList[0].Id;
        ConnectApi.CartItemResult cartItemResult = new ConnectApi.CartItemResult();
        cartItemResult.cartItem = cartItem;

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>{ cartItemResult };

        stub.mockedResponseByMethod.put('getCartItems', mockCartItemCollection);
        B2B_FeaturedProductsController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        List<WebStore> storeList = [SELECT Id FROM WebStore LIMIT 1];
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];

        Set<Id> cartProductIdSet = new Set<Id>();

        for (CartItem cartItemObj : cartItemList) {
            cartProductIdSet.add(cartItemObj.Product2Id);
        }

        Test.startTest();
        System.runAs(communityUser) {
            responseMap = B2B_FeaturedProductsController.getProductsByLinkyType(storeList[0].Id, accountList[0].Id, cartObj.Id, 'Spare Part', true, 5);
        }

        Test.stopTest();
        System.debug(LoggingLevel.INFO, 'responseMap: ' + JSON.serialize(responseMap));

        System.assertNotEquals(null, responseMap, 'ret value should not be null');
    }

    @IsTest
    public static void testFeaturedByLinkTypeWithoutProduct() {
        mockProductPriceTestData();
        WebCart cartObj = setupTestDataProductLink();
        List<cartItem> cartItemList = [SELECT Product2Id, cartId FROM CartItem WHERE cartId = :cartObj.Id LIMIT 1];
        Map<String, Object> responseMap = null;
        Id profileId = [SELECT Id FROM Profile WHERE Name = :B2B_COMMERCE_USER_PROFILE LIMIT 1].Id;
        User communityUser = [SELECT Id FROM User WHERE ProfileId = :profileId AND IsActive = TRUE LIMIT 1];

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();

        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();

        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartObj.Id;
        cartItem.productId = null;
        ConnectApi.CartItemResult cartItemResult = new ConnectApi.CartItemResult();
        cartItemResult.cartItem = cartItem;

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>{ cartItemResult };

        stub.mockedResponseByMethod.put('getCartItems', mockCartItemCollection);
        B2B_FeaturedProductsController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        List<WebStore> storeList = [SELECT Id FROM WebStore LIMIT 1];
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];

        Set<Id> cartProductIdSet = new Set<Id>();

        for (CartItem cartItemObj : cartItemList) {
            cartProductIdSet.add(cartItemObj.Product2Id);
        }

        Test.startTest();
        System.runAs(communityUser) {
            responseMap = B2B_FeaturedProductsController.getProductsByLinkyType(storeList[0].Id, accountList[0].Id, cartObj.Id, 'Spare Part', true, 5);
        }

        Test.stopTest();
        System.debug(LoggingLevel.INFO, 'responseMap: ' + JSON.serialize(responseMap));

        System.assertNotEquals(null, responseMap, 'ret value should not be null');
    }

    @IsTest
    public static void testFeaturedByLinkTypeWithEmptyCartItemResult() {
        mockProductPriceTestData();
        WebCart cartObj = setupTestDataProductLink();
        List<cartItem> cartItemList = [SELECT Product2Id, cartId FROM CartItem WHERE cartId = :cartObj.Id LIMIT 1];
        Map<String, Object> responseMap = null;
        Id profileId = [SELECT Id FROM Profile WHERE Name = :B2B_COMMERCE_USER_PROFILE LIMIT 1].Id;
        User communityUser = [SELECT Id FROM User WHERE ProfileId = :profileId AND IsActive = TRUE LIMIT 1];

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>();

        stub.mockedResponseByMethod.put('getCartItems', mockCartItemCollection);
        B2B_FeaturedProductsController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        List<WebStore> storeList = [SELECT Id FROM WebStore LIMIT 1];
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];

        Set<Id> cartProductIdSet = new Set<Id>();

        for (CartItem cartItemObj : cartItemList) {
            cartProductIdSet.add(cartItemObj.Product2Id);
        }

        Test.startTest();
        System.runAs(communityUser) {
            responseMap = B2B_FeaturedProductsController.getProductsByLinkyType(storeList[0].Id, accountList[0].Id, cartObj.Id, 'Spare Part', true, 5);
        }

        Test.stopTest();
        System.debug(LoggingLevel.INFO, 'responseMap: ' + JSON.serialize(responseMap));

        System.assertNotEquals(null, responseMap, 'ret value should not be null');
    }

    @IsTest
    public static void testFeaturedByLinkType3() {
        mockProductPriceTestData();
        WebCart cartObj = setupTestDataProductLink();

        List<WebStore> storeList = [SELECT Id FROM WebStore LIMIT 1];
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];

        List<cartItem> cartItemList = [SELECT Product2Id, cartId FROM CartItem WHERE cartId = :cartObj.Id];
        Set<Id> cartProductIdSet = new Set<Id>();

        for (CartItem cartItemObj : cartItemList) {
            cartProductIdSet.add(cartItemObj.Product2Id);
        }

        Id profileId = [SELECT Id FROM Profile WHERE Name = :B2B_COMMERCE_USER_PROFILE LIMIT 1].Id;
        User communityUser = [SELECT Id FROM User WHERE ProfileId = :profileId AND IsActive = TRUE LIMIT 1];
        Boolean includePrices = true;

        Map<String, Object> responseMap = null;
        Test.startTest();

        System.runAs(communityUser) {
            responseMap = B2B_FeaturedProductsController.getProductsByLinkyType(
                storeList[0].Id,
                accountList[0].Id,
                cartObj.Id,
                'Cross Sell',
                includePrices,
                MAX_PRODUCTS
            );
        }

        Test.stopTest();

        System.debug(LoggingLevel.INFO, 'responseMap: ' + JSON.serialize(responseMap));

        System.assertNotEquals(null, responseMap, 'ret value should not be null');
    }
    @IsTest(SeeAllData=false)
    public static void testFeaturedByLinkTypeException() {
        User communityUser = B2B_TestDataFactory.createInsertCommerceUser();
        Test.startTest();

        Map<String, Object> responseMap = null;
        System.runAs(communityUser) {
            // We dont specify a link type to prove an exception
            responseMap = B2B_FeaturedProductsController.getProductsByLinkyType(
                B2B_TestDataFactory.mockRecordId(WebStore.getSObjectType()),
                B2B_TestDataFactory.mockRecordId(Account.getSObjectType()),
                B2B_TestDataFactory.mockRecordId(Product2.getSObjectType()),
                null,
                true,
                MAX_PRODUCTS
            );
        }

        Test.stopTest();

        System.assertEquals(null, responseMap.get('data'), 'data should be empty');
    }
    @IsTest
    public static void testRelatedProductsPicklist() {
        B2B_FeaturedProductTypes pcl = new B2B_FeaturedProductTypes();
        VisualEditor.DynamicPickListRows rows = pcl.getValues();
        VisualEditor.DataRow defaultValue = pcl.getDefaultValue();

        System.assertNotEquals(null, rows, 'Rows should be available');
        System.assertNotEquals(null, defaultValue, 'DefaultValue should be available');
    }

    @isTest
    public static void testFeaturedByLinkTypeException2() {
        WebCart cartObj = setupTestDataProductLink();
        List<cartItem> cartItemList = [SELECT Product2Id, cartId FROM CartItem WHERE cartId = :cartObj.Id LIMIT 1];
        Map<String, Object> responseMap = null;

        List<Product2> prodList = [SELECT Id FROM Product2 LIMIT 1];

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();

        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();

        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartObj.Id;
        cartItem.productId = prodList[0].Id;
        ConnectApi.CartItemResult cartItemResult = new ConnectApi.CartItemResult();
        cartItemResult.cartItem = cartItem;

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>{ cartItemResult };

        stub.mockedResponseByMethod.put('getCartItems', mockCartItemCollection);
        B2B_FeaturedProductsController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        List<WebStore> storeList = [SELECT Id FROM WebStore LIMIT 1];
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];

        Set<Id> cartProductIdSet = new Set<Id>();

        for (CartItem cartItemObj : cartItemList) {
            cartProductIdSet.add(cartItemObj.Product2Id);
        }
        User readOnlyUser = B2B_TestDataFactory.createInsertReadOnlyUser();
        Test.startTest();

        System.runAs(readOnlyUser) {
            responseMap = B2B_FeaturedProductsController.getProductsByLinkyType(storeList[0].Id, accountList[0].Id, cartObj.Id, 'Spare Part', true, 5);

            Test.stopTest();

            System.assertEquals(null, responseMap.get('data'), 'data should be empty');
        }
    }

    @isTest
    static void generateExpectionForgetFeaturedSpareCartProductIdsByCategoryId() {
        try {
            Set<Id> productIdSet = B2B_FeaturedProductsController.getFeaturedSpareCartProductIdsByCategoryId(new Set<Id>(), new Set<Id>());
            System.assertEquals(0, productIdSet.size(), 'This should not be returned');
        } catch (Exception e) {
            String msgString = e.getMessage();
            System.assertEquals('Configuration Error', msgString, 'Should throw an Exception');
        }
    }
}
