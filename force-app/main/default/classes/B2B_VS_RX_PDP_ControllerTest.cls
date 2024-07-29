@isTest
public with sharing class B2B_VS_RX_PDP_ControllerTest {
    @isTest
    public static void getProductTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        String accountId = storeResponse.get('accountId');
        // Stub response
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductDetail mockProductDetail = new ConnectApi.ProductDetail();
        stub.mockedResponseByMethod.put('getProduct', mockProductDetail);
        B2B_VS_RX_PDP_Controller.b2bProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUser) {
            ConnectApi.ProductDetail productDetail = B2B_VS_RX_PDP_Controller.getProduct(
                storeResponse.get('webStoreId'),
                storeResponse.get('productId'),
                accountId
            );
            System.assertNotEquals(null, productDetail, 'Get Product Details');
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
        B2B_VS_RX_PDP_Controller.b2bProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);
        Test.startTest();
        System.runAs(communityUser) {
            ConnectApi.ProductPrice productPrice = B2B_VS_RX_PDP_Controller.getProductPrice(
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
            List<B2B_ProductDetailsModel.B2B_ProductImageWrapper> wrapperList = B2B_VS_RX_PDP_Controller.getProductImages(insertedProduct.Id);
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
        B2B_VS_RX_PDP_Controller.b2bProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUser) {
            Object spareProduct = B2B_VS_RX_PDP_Controller.productSearch(
                storeResponse.get('webStoreId'),
                storeResponse.get('accountId'),
                insertedProductSource.Id,
                'Spare Part',
                relatedSpareProductIdList
            );

            Object demoProduct = B2B_VS_RX_PDP_Controller.productSearch(
                storeResponse.get('webStoreId'),
                storeResponse.get('accountId'),
                insertedProductSource.Id,
                'Demo',
                relatedDemoProductIdList
            );

            Object styleShadeProduct = B2B_VS_RX_PDP_Controller.productSearch(
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
    public static void productSearchFailTest() {
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
            Object spareProduct = B2B_VS_RX_PDP_Controller.productSearch(
                storeResponse.get('webStoreId'),
                storeResponse.get('accountId'),
                insertedProductSource.Id,
                'Spare Part',
                relatedSpareProductIdList
            );
            Object demoProduct = B2B_VS_RX_PDP_Controller.productSearch(
                storeResponse.get('webStoreId'),
                storeResponse.get('accountId'),
                insertedProductSource.Id,
                'Demo',
                relatedDemoProductIdList
            );

            Object styleShadeProduct = B2B_VS_RX_PDP_Controller.productSearch(
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
            List<B2B_ProductDetailsModel.B2B_ProductMediaWrapper> wrapperList = B2B_VS_RX_PDP_Controller.getProductMedia(insertedProduct.Id);
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
            List<B2B_ProductDetailsModel.B2B_ProductColorWrapper> wrapperList = B2B_VS_RX_PDP_Controller.getProductsColors(
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
            Boolean isEvilEyeProduct = B2B_VS_RX_PDP_Controller.checkEvilEyeFrame(insertedProduct.Id);
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
            Boolean isEvilEyeProduct = B2B_VS_RX_PDP_Controller.checkEvilEyeFrame(insertedProduct.Id);
            System.assertEquals(false, isEvilEyeProduct, 'Product is of not of Brand evil eye but of type frame');
        }
        Test.stopTest();
    }

    //BS-788 to cover saveLensConfiguratorData method
    @isTest
    public static void saveLensConfiguratorDataTest() {
        Test.startTest();
        B2B_Lens_Configurator__c lensData = B2B_VS_RX_PDP_Controller.saveLensConfiguratorData(
            B2B_TestDataFactory.createLensConfiguratorTestData(B2B_Constants.LENS_ONLY)
        );
        Test.stopTest();

        System.assertEquals(true, lensData != null, 'checking data is inserted or not');
    }

    //BS-788 to cover saveLensConfiguratorData method
    @isTest
    public static void saveLensConfiguratorDataFrameProvidedTest() {
        Test.startTest();
        B2B_Lens_Configurator__c lensData = B2B_VS_RX_PDP_Controller.saveLensConfiguratorData(
            B2B_TestDataFactory.createLensConfiguratorTestData(B2B_Constants.LENS_ONLY_FRAME_PROVIDED)
        );
        Test.stopTest();

        System.assertEquals(true, lensData != null, 'checking data is inserted or not');
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
        List<B2B_VS_RX_PDP_Controller.B2B_ProductFieldWrapper> productFieldWrapperList = B2B_VS_RX_PDP_Controller.getAdditionalAttributeFieldData(
            categoryName,
            'de'
        );
        Test.stopTest();
        System.assertEquals(false, storeResponse.isEmpty(), 'Store response should be fetched');
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
        List<B2B_VS_RX_PDP_Controller.B2B_ProductFieldWrapper> productFieldWrapperList = B2B_VS_RX_PDP_Controller.getAdditionalAttributeFieldData(
            categoryName,
            'de'
        );
        Test.stopTest();
        System.assertEquals(false, storeResponse.isEmpty(), 'Store response should be fetched');
        System.assertEquals(false, productFieldWrapperList.isEmpty(), 'Wrapper list with the field labels and field names should be returned');
        System.assertEquals(false, categoryTranslationList.isEmpty(), 'Category Translations should be returned');
    }

    //BS-722
    @isTest
    public static void getFrameTypeAndModelDataTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));
        Product2 insertedProduct = [SELECT Id FROM Product2 LIMIT 1];
        List<Product2> returnedList = new List<Product2>();
        Test.startTest();
        System.runAs(communityUser) {
            returnedList = B2B_VS_RX_PDP_Controller.getFrameTypeAndModelData(insertedProduct.id);
            System.assertNotEquals(null, returnedList, 'Product List Not returned');
        }
        Test.stopTest();
    }

    //BS-960
    @isTest
    public static void getVariationProductDataTest() {
        B2B_TestDataFactory.createProductDataForLensConfigurator();
        List<Product2> productList = [SELECT Id FROM Product2 LIMIT 2];
        B2B_Commerce_Product_Link__c productLink = B2B_TestDataFactory.createProductLink(
            productList[0].Id,
            productList[1].Id,
            B2B_Constants.SPECIAL_VARIATION_PARENT
        );
        insert productLink;
        Test.startTest();
        Id spacialParentId = B2B_VS_RX_PDP_Controller.getSpacialVariationParentData(productList[0].Id);
        Id variationParentId = B2B_VS_RX_PDP_Controller.getVariationParentData(productList[1].Id);
        System.assertEquals(productList[1].Id, spacialParentId, 'Product Not Found');
        System.assertEquals(productList[0].Id, variationParentId, 'Product Not Found');
        Test.stopTest();
    }

    //BS-1713
    @isTest
    public static void getProductDetailsTest() {
        B2B_TestDataFactory.createProductDataForLensConfigurator();
        List<Product2> productList = [SELECT Id FROM Product2 LIMIT 2];
        List<Id> productIdList = new List<Id>();
        for (Product2 product : productList) {
            productIdList.add(product.Id);
        }
        Test.startTest();
        List<Product2> recievedProductDetailsList = B2B_VS_RX_PDP_Controller.getProductDetails(productIdList);
        Test.stopTest();
        Assert.areEqual(false, recievedProductDetailsList.isEmpty(), 'Product Details Should be returned');
    }

    //BS-1713
    @isTest
    public static void getCountryCodeTest() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        String accountId = storeResponse.get('accountId');
        Test.startTest();
        List<Account> recievedAccountDetailsList = B2B_VS_RX_PDP_Controller.getAccountDetails(accountId);
        Test.stopTest();
        Assert.areEqual(false, recievedAccountDetailsList.isEmpty(), 'Account Details Should be returned');
    }
}
