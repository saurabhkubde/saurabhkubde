@isTest
public with sharing class B2B_ProductDetailsControllerTest {
    @isTest
    public static void addToCartTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));
        String currencyIsoCode = 'USD'; //BS-1245

        String accountId = storeResponse.get('accountId');
        // Stub response
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartItem mockCartItem = new ConnectApi.CartItem();
        stub.mockedResponseByMethod.put('addItemToCart', mockCartItem);
        B2B_ProductDetailsController.b2bProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUser) {
            ConnectApi.CartItem ci = B2B_ProductDetailsController.addToCart(
                storeResponse.get('webStoreId'),
                storeResponse.get('productId'),
                '1',
                accountId,
                currencyIsoCode
            );
            System.assertNotEquals(null, ci, 'Item added to cart');
        }
        Test.stopTest();
    }

    @isTest
    public static void getProductTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        String accountId = storeResponse.get('accountId');
        // Stub response
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductDetail mockProductDetail = new ConnectApi.ProductDetail();
        stub.mockedResponseByMethod.put('getProduct', mockProductDetail);
        B2B_ProductDetailsController.b2bProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUser) {
            ConnectApi.ProductDetail productDetail = B2B_ProductDetailsController.getProduct(
                storeResponse.get('webStoreId'),
                storeResponse.get('productId'),
                accountId
            );
            System.assertNotEquals(null, productDetail, 'Get Product Details');
        }
        Test.stopTest();
    }

    @isTest
    public static void getCartSummaryTest() {
        String currencyIsoCode = 'USD'; //BS-1245
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));
        String accountId = storeResponse.get('accountId');
        // Stub response
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartSummary mockCartSummary = new ConnectApi.CartSummary();
        mockCartSummary.accountId = accountId;
        stub.mockedResponseByMethod.put('getCartSummary', mockCartSummary);
        B2B_ProductDetailsController.b2bProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUser) {
            ConnectApi.CartSummary cs = B2B_ProductDetailsController.getCartSummary(storeResponse.get('webStoreId'), accountId, currencyIsoCode);
            System.assertNotEquals(null, cs, 'Cart summary was null');
        }
        Test.stopTest();
    }

    @isTest
    public static void createAndAddToListTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        String accountId = storeResponse.get('accountId');
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.Wishlist mockWishlist = new ConnectApi.Wishlist();
        stub.mockedResponseByMethod.put('createWishlist', mockWishlist);
        B2B_ProductDetailsController.b2bProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);
        Test.startTest();
        System.runAs(communityUser) {
            ConnectApi.Wishlist wishList = B2B_ProductDetailsController.createAndAddToList(
                storeResponse.get('webStoreId'),
                storeResponse.get('productId'),
                'testWishlist',
                accountId
            );
            System.assertNotEquals(null, wishList, 'Item added to list');
        }
        Test.stopTest();
    }

    @isTest
    public static void getProductPriceTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        String accountId = storeResponse.get('accountId');
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductPrice productPriceMock = new ConnectApi.ProductPrice();
        stub.mockedResponseByMethod.put('getProductPrice', productPriceMock);
        B2B_ProductDetailsController.b2bProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);
        Test.startTest();
        System.runAs(communityUser) {
            ConnectApi.ProductPrice productPrice = B2B_ProductDetailsController.getProductPrice(
                storeResponse.get('webStoreId'),
                storeResponse.get('productId'),
                accountId
            );
            System.assertNotEquals(null, productPrice, 'Get product price');
        }
        Test.stopTest();
    }

    @isTest
    public static void getProductImagesTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        Product2 insertedProduct = [SELECT Id FROM Product2 LIMIT 1];
        B2B_Product_Image__c productImage = B2B_TestDataFactory.createProductImage(insertedProduct.Id);
        insert productImage;

        Test.startTest();
        System.runAs(communityUser) {
            List<B2B_ProductDetailsModel.B2B_ProductImageWrapper> wrapperList = B2B_ProductDetailsController.getProductImages(insertedProduct.Id);
            System.assertEquals(1, wrapperList.size(), 'Product images not returned correctly');
        }
        Test.stopTest();
    }

    @isTest
    public static void productSearchTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        Product2 insertedProductSource = [SELECT Id FROM Product2 LIMIT 1];
        List<Product2> insertedProductTargetList = B2B_TestDataFactory.createProducts(70, null);
        for (Product2 insertedProductTarget : insertedProductTargetList) {
            insertedProductTarget.StockKeepingUnit += '1';
        }
        insert insertedProductTargetList;
        List<B2B_Commerce_Product_Link__c> relatedProductList = new List<B2B_Commerce_Product_Link__c>();
        Integer counter = 0;
        for (Product2 insertedProductTarget : insertedProductTargetList) {
            if (counter < 23) {
                relatedProductList.add(B2B_TestDataFactory.createProductLink(insertedProductSource.Id, insertedProductTarget.Id, 'Spare Part'));
            } else if (counter >= 23 && counter < 48) {
                relatedProductList.add(B2B_TestDataFactory.createProductLink(insertedProductSource.Id, insertedProductTarget.Id, 'Demo'));
            } else {
                relatedProductList.add(B2B_TestDataFactory.createProductLink(insertedProductSource.Id, insertedProductTarget.Id, 'Style Shades'));
            }
            counter++;
        }
        insert relatedProductList;
        List<String> relatedSpareProductIdList = new List<String>();
        List<String> relatedDemoProductIdList = new List<String>();
        List<String> relatedStyleShadeIdList = new List<String>();
        for (B2B_Commerce_Product_Link__c relatedProduct : relatedProductList) {
            if (relatedSpareProductIdList.size() <= 20 && relatedProduct.B2B_Type__c == 'Spare Part') {
                relatedSpareProductIdList.add(relatedProduct.Id);
            } else if (relatedDemoProductIdList.size() <= 20 && relatedProduct.B2B_Type__c == 'demo') {
                relatedDemoProductIdList.add(relatedProduct.Id);
            } else if (relatedStyleShadeIdList.size() <= 20 && relatedProduct.B2B_Type__c == 'Style Shades') {
                relatedStyleShadeIdList.add(relatedProduct.Id);
            }
        }

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductOverviewCollection mockGetProducts = new ConnectApi.ProductOverviewCollection();
        stub.mockedResponseByMethod.put('getProducts', mockGetProducts);
        B2B_ProductDetailsController.b2bProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUser) {
            Object spareProduct = B2B_ProductDetailsController.productSearch(
                storeResponse.get('webStoreId'),
                storeResponse.get('accountId'),
                insertedProductSource.Id,
                'Spare Part',
                relatedSpareProductIdList
            );

            Object demoProduct = B2B_ProductDetailsController.productSearch(
                storeResponse.get('webStoreId'),
                storeResponse.get('accountId'),
                insertedProductSource.Id,
                'Demo',
                relatedDemoProductIdList
            );

            Object styleShadeProduct = B2B_ProductDetailsController.productSearch(
                storeResponse.get('webStoreId'),
                storeResponse.get('accountId'),
                insertedProductSource.Id,
                'Style Shades',
                relatedStyleShadeIdList
            );

            System.assertNotEquals(null, spareProduct, 'Product spare parts not returned correctly');
            System.assertNotEquals(null, demoProduct, 'Product demo glasses not returned correctly');
            System.assertNotEquals(null, styleShadeProduct, 'Style Shade not returned correctly');
        }
        Test.stopTest();
    }

    @isTest
    public static void productSearchTestFail() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        Product2 insertedProductSource = [SELECT Id FROM Product2 LIMIT 1];
        List<Product2> insertedProductTargetList = B2B_TestDataFactory.createProducts(1, null);
        Product2 insertedProductTarget = insertedProductTargetList[0];
        insertedProductTarget.StockKeepingUnit += '1';
        insert insertedProductTarget;

        B2B_Commerce_Product_Link__c productLinkSpare = B2B_TestDataFactory.createProductLink(insertedProductSource.Id, insertedProductTarget.Id, 'Spare Part');
        insert productLinkSpare;
        List<String> relatedSpareProductIdList = new List<String>();
        List<String> relatedDemoProductIdList = new List<String>();
        List<String> relatedStyleShadeIdList = new List<String>();
        Test.startTest();
        System.runAs(communityUser) {
            Object spareProduct = B2B_ProductDetailsController.productSearch(
                storeResponse.get('webStoreId'),
                storeResponse.get('accountId'),
                insertedProductSource.Id,
                'Spare Part',
                relatedSpareProductIdList
            );
            Object demoProduct = B2B_ProductDetailsController.productSearch(
                storeResponse.get('webStoreId'),
                storeResponse.get('accountId'),
                insertedProductSource.Id,
                'Demo',
                relatedDemoProductIdList
            );

            Object styleShadeProduct = B2B_ProductDetailsController.productSearch(
                storeResponse.get('webStoreId'),
                storeResponse.get('accountId'),
                insertedProductSource.Id,
                'Style Shades',
                relatedStyleShadeIdList
            );
            System.assertEquals(null, spareProduct, 'Product spare parts not returned correctly');
            System.assertEquals(null, demoProduct, 'Product demo glasses not returned correctly');
            System.assertEquals(null, styleShadeProduct, 'Style shades not returned correctly');
        }
        Test.stopTest();
    }

    @isTest
    public static void getProductMediaTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        Product2 insertedProduct = [SELECT Id FROM Product2 LIMIT 1];
        B2B_Product_Media__c productMedia = B2B_TestDataFactory.createProductMedia(insertedProduct.Id);
        insert productMedia;

        Test.startTest();
        System.runAs(communityUser) {
            List<B2B_ProductDetailsModel.B2B_ProductMediaWrapper> wrapperList = B2B_ProductDetailsController.getProductMedia(insertedProduct.Id);
            System.assertEquals(1, wrapperList.size(), 'Product media not returned correctly');
        }
        Test.stopTest();
    }

    @isTest
    public static void getProductsColorsTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        Product2 insertedProduct = [SELECT Id, B2B_Frame_Color_Description__c, B2B_Hexcode__c, B2B_Hexcode_Accent__c FROM Product2 LIMIT 1];
        insertedProduct.B2B_Frame_Color_Description__c = 'Test color';
        insertedProduct.B2B_Hexcode__c = '#ffff';
        insertedProduct.B2B_Hexcode_Accent__c = '#ffff';
        update insertedProduct;

        Test.startTest();
        System.runAs(communityUser) {
            List<B2B_ProductDetailsModel.B2B_ProductColorWrapper> wrapperList = B2B_ProductDetailsController.getProductsColors(
                new List<String>{ insertedProduct.Id }
            );
            System.assertEquals(1, wrapperList.size(), 'Products colors not returned correctly');
        }
        Test.stopTest();
    }

    @isTest
    public static void evilEyeProductPositiveTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        Product2 insertedProduct = [SELECT Id, B2B_Brand__c, B2B_Product_Type__c FROM Product2 LIMIT 1];
        insertedProduct.B2B_Brand__c = '05';
        update insertedProduct;

        ProductCategory productCategoryObj = new ProductCategory(
            Name = 'Frames',
            CatalogId = storeResponse.get('catalogId'),
            B2B_Category_External_ID__c = B2B_Constants.FRAME_CATEGORY_EXT_ID
        );
        insert productCategoryObj;

        ProductCategoryProduct productCategoryProductObj = new ProductCategoryProduct(
            ProductCategoryId = productCategoryObj.Id,
            ProductId = insertedProduct.Id
        );
        insert productCategoryProductObj;

        Test.startTest();
        System.runAs(communityUser) {
            Boolean isEvilEyeProduct = B2B_ProductDetailsController.checkEvilEyeFrame(insertedProduct.Id);
            System.assertEquals(true, isEvilEyeProduct, 'Product is of Brand evil eye and of type frame');
        }
        Test.stopTest();
    }

    @isTest
    public static void evilEyeProductNegativeTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        Product2 insertedProduct = [SELECT Id, B2B_Brand__c, B2B_Product_Type__c FROM Product2 LIMIT 1];
        insertedProduct.B2B_Brand__c = '01';
        update insertedProduct;

        Test.startTest();
        System.runAs(communityUser) {
            Boolean isEvilEyeProduct = B2B_ProductDetailsController.checkEvilEyeFrame(insertedProduct.Id);
            System.assertEquals(false, isEvilEyeProduct, 'Product is of not of Brand evil eye but of type frame');
        }
        Test.stopTest();
    }

    @isTest
    public static void getRecommendedRetailPriceTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        PricebookEntry insertedPricebookEntry = [SELECT Id FROM PricebookEntry LIMIT 1];
        insertedPricebookEntry.B2B_RRP__c = 100;

        update insertedPricebookEntry;

        Test.startTest();
        System.runAs(communityUser) {
            PricebookEntry pricebookEntryObj = B2B_ProductDetailsController.getRecommendedRetailPrice(insertedPricebookEntry.Id);
            System.assertEquals(true, pricebookEntryObj != null, 'pricebookEntry object should be returned correctly');
        }
        Test.stopTest();
    }

    @isTest
    public static void getUpdateMyB2BShopPreferenceTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();

        My_B2B_Shop_Preference__c myB2BShopPrefernceObj = new My_B2B_Shop_Preference__c(
            B2B_Account__c = storeResponse.get('accountId'),
            B2B_Show_RRP__c = true
        );
        insert myB2BShopPrefernceObj;

        Test.startTest();
        B2B_ProductDetailsController.updateMyB2BShopPreference(storeResponse.get('accountId'), true);
        Test.stopTest();
    }

    @isTest
    public static void getShowRecommendedRetailPriceTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();

        My_B2B_Shop_Preference__c myB2BShopPrefernceObj = new My_B2B_Shop_Preference__c(
            B2B_Account__c = storeResponse.get('accountId'),
            B2B_Show_RRP__c = true
        );
        insert myB2BShopPrefernceObj;

        Test.startTest();
        Boolean showRRPBoolean = B2B_ProductDetailsController.getShowRecommendedRetailPrice(storeResponse.get('accountId'));
        System.assertEquals(true, showRRPBoolean, 'The value for show RRP should be returned as true for the passed accountId');
        Test.stopTest();
    }

    //BS-1740 : Test Method added for testing of checkEligibilityForVSRX
    @isTest
    public static void getEligibilityForRXTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));
        Id accountId = storeResponse.get('accountId');
        //BS-1740
        List<Account> accountList = [SELECT Id, k_EERX_Account_Status__c, k_Account_Status_SVS__c FROM Account WHERE id = :accountId];
        if (accountList.isEmpty() == false) {
            accountList[0].k_EERX_Account_Status__c = '1';
            update accountList;
        }
        List<CommerceEntitlementPolicy> commerceEntitlementPolicyList = [SELECT Id, Name FROM CommerceEntitlementPolicy];
        for (CommerceEntitlementPolicy commerceEntitlementPolicy : commerceEntitlementPolicyList) {
            commerceEntitlementPolicy.Name = 'Global - RX Solution';
        }
        update commerceEntitlementPolicyList;

        String buyerGroupType = 'Vision Sensation';
        B2B_ProductDetailsController.B2B_EntitlementWrapper entitlementObj = new B2B_ProductDetailsController.B2B_EntitlementWrapper();
        entitlementObj = B2B_ProductDetailsController.checkEligibilityForVSRX(accountId);
        System.assertEquals(true, entitlementObj.isEligibleForRX, 'Should return Eligibility for VS RX');
    }

    //BS-1740 : Test Method added for testing of checkEligibilityForVSRX
    @isTest
    public static void getEligibilityForVSTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));
        Id accountId = storeResponse.get('accountId');
        //BS-1740
        List<Account> accountList = [SELECT Id, k_EERX_Account_Status__c, k_Account_Status_SVS__c FROM Account WHERE id = :accountId];
        if (accountList.isEmpty() == false) {
            accountList[0].k_Account_Status_SVS__c = '1';
            update accountList;
        }
        List<CommerceEntitlementPolicy> commerceEntitlementPolicyList = [SELECT Id, Name FROM CommerceEntitlementPolicy];
        for (CommerceEntitlementPolicy commerceEntitlementPolicy : commerceEntitlementPolicyList) {
            commerceEntitlementPolicy.Name = 'Global - Vision Sensation';
        }
        update commerceEntitlementPolicyList;

        String buyerGroupType = 'Vision Sensation';
        B2B_ProductDetailsController.B2B_EntitlementWrapper entitlementObj = new B2B_ProductDetailsController.B2B_EntitlementWrapper();
        entitlementObj = B2B_ProductDetailsController.checkEligibilityForVSRX(accountId);
        System.assertEquals(true, entitlementObj.isEligibleForVS, 'Should return Eligibility for VS');
    }

    //BS-1175
    @isTest
    public static void getAdditionalAttributeFieldDataNBTest() {
        String categoryName = 'NB';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();

        List<ProductCatalog> catalogList = [SELECT Id, Name FROM ProductCatalog];
        catalogList[0].Name = (System.Label.B2B_STORE_CATALOG_NAME).split(',')[1];
        update catalogList;

        List<ProductCategory> productCategoryList = [SELECT Id, Name, Catalog.Name FROM ProductCategory];
        productCategoryList[0].Name = 'Optical Eyewear';
        update productCategoryList;

        List<ProductCategoryDataTranslation> categoryTranslationList = B2B_TestDataFactory.createProductCategoryDataTranslation(productCategoryList);

        Test.startTest();
        List<B2B_ProductDetailsController.B2B_ProductFieldWrapper> productFieldWrapperList = B2B_ProductDetailsController.getAdditionalAttributeFieldData(
            categoryName,
            'de'
        );
        Test.stopTest();
        System.assertEquals(false, productFieldWrapperList.isEmpty(), 'Wrapper list with the field labels and field names should be returned');
        System.assertEquals(false, categoryTranslationList.isEmpty(), 'Category Translations should be returned');
    }

    //BS-1255
    @isTest
    public static void getAdditionalAttributeFieldDataSHTest() {
        String categoryName = 'SH';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();

        List<ProductCatalog> catalogList = [SELECT Id, Name FROM ProductCatalog];
        catalogList[0].Name = (System.Label.B2B_STORE_CATALOG_NAME).split(',')[1];
        update catalogList;

        List<ProductCategory> productCategoryList = [SELECT Id, Name, Catalog.Name FROM ProductCategory];
        productCategoryList[0].Name = 'Optical Eyewear';
        update productCategoryList;

        List<ProductCategoryDataTranslation> categoryTranslationList = B2B_TestDataFactory.createProductCategoryDataTranslation(productCategoryList);

        Test.startTest();
        List<B2B_ProductDetailsController.B2B_ProductFieldWrapper> productFieldWrapperList = B2B_ProductDetailsController.getAdditionalAttributeFieldData(
            categoryName,
            'de'
        );
        Test.stopTest();
        System.assertEquals(false, productFieldWrapperList.isEmpty(), 'Wrapper list with the field labels and field names should be returned');
        System.assertEquals(false, categoryTranslationList.isEmpty(), 'Category Translations should be returned');
    }

    //BS-1255
    @isTest
    public static void getAdditionalAttributeFieldDataEETest() {
        String categoryName = 'EE';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();

        List<ProductCatalog> catalogList = [SELECT Id, Name FROM ProductCatalog];
        catalogList[0].Name = (System.Label.B2B_STORE_CATALOG_NAME).split(',')[1];
        update catalogList;

        List<ProductCategory> productCategoryList = [SELECT Id, Name, Catalog.Name FROM ProductCategory];
        productCategoryList[0].Name = 'Optical Eyewear';
        update productCategoryList;

        List<ProductCategoryDataTranslation> categoryTranslationList = B2B_TestDataFactory.createProductCategoryDataTranslation(productCategoryList);

        Test.startTest();
        List<B2B_ProductDetailsController.B2B_ProductFieldWrapper> productFieldWrapperList = B2B_ProductDetailsController.getAdditionalAttributeFieldData(
            categoryName,
            'de'
        );
        Test.stopTest();
        System.assertEquals(false, productFieldWrapperList.isEmpty(), 'Wrapper list with the field labels and field names should be returned');
        System.assertEquals(false, categoryTranslationList.isEmpty(), 'Category Translations should be returned');
    }

    //BS-1500
    // This method provides the code coverage for getSourceTargetStatus() method of B2B_ProductDetailsController apex controller class.
    @isTest
    public static void getSourceTargetStatusForSourceProductTest() {
        List<Product2> products = B2B_TestDataFactory.createInsertProducts(5, null);
        String productId = products[0].Id;
        String targetId = products[1].Id;
        B2B_Commerce_Product_Link__c commerceProductLink = B2B_TestDataFactory.createProductLink(productId, targetId, 'glazed to unglazed');
        insert commerceProductLink;
        Test.startTest();
        B2B_ProductDetailsController.B2B_SourceTargetWrapper SourceTargetObj = B2B_ProductDetailsController.getSourceTargetStatus(productId);
        Test.stopTest();
        System.assertNotEquals(null, SourceTargetObj, 'Expected source and target products boolean values and its related product Id is not returned');
        System.assertEquals(
            products[1].Id,
            SourceTargetObj.relatedProductId,
            'Expected source and target products boolean values and its related product Id is returned'
        );
    }

    //BS-1500
    // This method provides the code coverage for getSourceTargetStatus() method of B2B_ProductDetailsController apex controller class.
    @isTest
    public static void getSourceTargetStatusForTargetProductTest() {
        List<Product2> products = B2B_TestDataFactory.createInsertProducts(5, null);
        String productId = products[0].Id;
        String targetId = products[1].Id;
        B2B_Commerce_Product_Link__c commerceProductLink = B2B_TestDataFactory.createProductLink(productId, targetId, 'glazed to unglazed');
        insert commerceProductLink;
        Test.startTest();
        B2B_ProductDetailsController.B2B_SourceTargetWrapper SourceTargetObj = B2B_ProductDetailsController.getSourceTargetStatus(targetId);
        Test.stopTest();
        System.assertNotEquals(null, SourceTargetObj, 'Expected source and target products boolean values and its related product Id is not returned');
        System.assertEquals(
            products[0].Id,
            SourceTargetObj.relatedProductId,
            'Expected source and target products boolean values and its related product Id is returned'
        );
    }
}
