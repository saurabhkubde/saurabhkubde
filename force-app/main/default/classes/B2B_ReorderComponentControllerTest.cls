@isTest
private without sharing class B2B_ReorderComponentControllerTest {
    @TestSetup
    static void setup() {
        Map<String, String> storeResponseMap = B2B_TestDataFactory.setupCommerceStoreFront();
        List<PricebookEntry> pricebookEntryList = [SELECT Id FROM PricebookEntry];
        Id accountId = storeResponseMap.get('accountId');
        Id productId = storeResponseMap.get('productId');

        Pricebook2 pricebook = [SELECT Id FROM Pricebook2 LIMIT 1];
        Product2 productObj = new Product2(Name = 'TestProduct', StockKeepingUnit = 'SKU_Test1', Description = 'Test Product', IsActive = true);

        insert productObj;

        B2B_TestDataFactory.createInsertOrderDataForReorder(accountId, pricebook, productObj, productId, pricebookEntryList);

        B2B_Commerce_Product_Link__c productLinkObj = B2B_TestDataFactory.createProductLink(productId, productObj.Id, 'Demo to Chassis');
        insert productLinkObj;
    }

    @isTest
    private static void getAllCategoryIdTestSH() {
        ProductCatalog prodCatalog = new ProductCatalog();
        prodCatalog.Name = 'Silhouette B2B Store Catalog';
        insert prodCatalog;
        ProductCategory productCategory = new ProductCategory(ParentCategoryId = null, Name = 'Silhouette', CatalogId = prodCatalog.Id);
        insert productCategory;
        Test.startTest();
        List<String> categoryList = B2B_ReorderComponentController.getAllCategoryId('Silhouette');
        Test.stopTest();

        System.assertNotEquals(null, categoryList, 'Should return List of Categories');
    }

    @isTest
    private static void getAllCategoryIdTestNB() {
        Test.startTest();
        List<String> categoryList = B2B_ReorderComponentController.getAllCategoryId('NeuBau');
        Test.stopTest();

        System.assertNotEquals(null, categoryList, 'Should return List of Categories');
    }

    @isTest
    private static void testProductSearch() {
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductSearchResults mocksearchResults = new ConnectApi.ProductSearchResults();
        mocksearchResults.productsPage = new ConnectApi.ProductSummaryPage();
        mocksearchResults.productsPage.products = new List<ConnectApi.ProductSummary>();
        stub.mockedResponseByMethod.put('searchProducts', mocksearchResults);
        B2B_ReorderComponentController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        String searchInput = '{"searchTerm":"","refinements":[],"pageSize":200,"page":0,"includePrices":true}';
        Object searchResults;

        Test.startTest();
        searchResults = B2B_ReorderComponentController.productSearch(
            B2B_TestDataFactory.mockRecordId(WebStore.getSObjectType()),
            searchInput,
            B2B_TestDataFactory.mockRecordId(Account.getSObjectType())
        );
        Test.stopTest();

        System.assertNotEquals(null, searchResults, 'Should return a product search result');
    }

    @isTest
    private static void getOrderedProductsIdTest() {
        Test.startTest();
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        B2B_ReorderComponentController.B2B_ReorderComponentWrapper categoryList = B2B_ReorderComponentController.getOrderedProductsId(
            '24',
            'Partner Portal',
            'Product2.Name ASC',
            accountList[0].Id,
            ''
        );
        Test.stopTest();

        System.assertNotEquals(null, categoryList, 'Should return null');
    }

    @isTest
    private static void getOrderedProductsForSpecificOrderTest() {
        List<CommerceEntitlementProduct> entitlementProductList = [SELECT Id, ProductId FROM CommerceEntitlementProduct LIMIT 1];

        List<OrderItem> orderItemList = [
            SELECT Id, OrderId, Order.AccountId, Order.OrderedDate
            FROM OrderItem
            WHERE Product2Id = :entitlementProductList[0].ProductId
            LIMIT 1
        ];

        update orderItemList;

        Test.startTest();
        B2B_ReorderComponentController.B2B_ReorderComponentWrapper categoryList = B2B_ReorderComponentController.getOrderedProductsId(
            '24',
            'Partner Portal',
            'Product2.Name ASC',
            orderItemList[0].OrderId,
            orderItemList[0].OrderId
        );
        Test.stopTest();

        System.assertEquals(null, categoryList, 'Should return null');
    }

    @isTest
    private static void getSortedProductsIdsTestSKU() {
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<Product2> productList = [SELECT Id FROM Product2];
        List<String> productIdList = new List<String>();
        for (Product2 product : productList) {
            productIdList.add(product.Id);
        }
        Test.startTest();
        List<String> productIdsList = B2B_ReorderComponentController.getSortedProductsIds(productIdList, 'Product2.StockKeepingUnit', accountList[0].Id);
        Test.stopTest();

        System.assertNotEquals(null, productIdsList, 'Should return List of Product Ids');
    }

    @isTest
    private static void getSortedProductsIdsTestName() {
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<Product2> productList = [SELECT Id FROM Product2];
        List<String> productIdList = new List<String>();
        for (Product2 product : productList) {
            productIdList.add(product.Id);
        }
        Test.startTest();
        List<String> productIdsList = B2B_ReorderComponentController.getSortedProductsIds(productIdList, 'Product2.Name', accountList[0].Id);
        Test.stopTest();

        System.assertNotEquals(null, productIdsList, 'Should return List of Product Ids');
    }

    @isTest
    private static void getSortedProductsIdsTestCreatedDate() {
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<Product2> productList = [SELECT Id FROM Product2];
        List<String> productIdList = new List<String>();
        for (Product2 product : productList) {
            productIdList.add(product.Id);
        }
        Test.startTest();
        List<String> productIdsList = B2B_ReorderComponentController.getSortedProductsIds(productIdList, 'Order.OrderedDate', accountList[0].Id);
        Test.stopTest();

        System.assertNotEquals(null, productIdsList, 'Should return List of Product Ids');
    }

    @isTest
    private static void getSortedProductsIdsTestDESC() {
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<Product2> productList = [SELECT Id FROM Product2];
        List<String> productIdList = new List<String>();
        for (Product2 product : productList) {
            productIdList.add(product.Id);
        }
        Test.startTest();
        List<String> productIdsList = B2B_ReorderComponentController.getSortedProductsIds(productIdList, 'DESC', accountList[0].Id);
        Test.stopTest();

        System.assertNotEquals(null, productIdsList, 'Should return List of Product Ids');
    }

    @isTest
    private static void getChassisProductTest() {
        Test.startTest();
        List<B2B_Commerce_Product_Link__c> chassisProductObjList = B2B_ReorderComponentController.getChassisProducts();
        Test.stopTest();
        System.assertNotEquals(0, chassisProductObjList.size(), 'Should return List of B2B Commerce Product Links');
    }

    @isTest
    private static void getOrderAdditionalInformationForNoSourceTest() {
        Product2 productRec = [SELECT Id FROM Product2 LIMIT 1];

        Test.startTest();
        List<OrderItem> orderItemList = B2B_ReorderComponentController.getOrderAdditionalInformation(
            productRec.Id,
            B2B_TestDataFactory.mockRecordId(Account.getSObjectType()),
            ''
        );
        Test.stopTest();

        System.assertNotEquals(null, orderItemList, 'Should return order record related to product Id.');
    }

    @isTest
    private static void getOrderAdditionalInformationTest() {
        List<CommerceEntitlementProduct> entitlementProductList = [SELECT Id, ProductId FROM CommerceEntitlementProduct LIMIT 1];

        Test.startTest();
        List<OrderItem> orderItemList = B2B_ReorderComponentController.getOrderAdditionalInformation(
            entitlementProductList[0].Id,
            B2B_TestDataFactory.mockRecordId(Account.getSObjectType()),
            'Partner Portal'
        );
        Test.stopTest();

        System.assertNotEquals(null, orderItemList, 'Should return order record related to product Id.');
    }

    @isTest
    public static void getOrderedProductDataTest() {
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductOverviewCollection mockGetProducts = new ConnectApi.ProductOverviewCollection();
        stub.mockedResponseByMethod.put('getProducts', mockGetProducts);
        B2B_ReorderComponentController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<String> productIdList = B2B_SearchController.searchProducts(accountList[0].Id);
        List<WebStore> webStoreList = [SELECT Id FROM WebStore LIMIT 1];
        Object product = B2B_ReorderComponentController.getOrderedProductData(webStoreList[0].Id, accountList[0].Id, productIdList);
        System.assertNotEquals(null, product, 'Product spare parts not returned correctly');
    }
}
