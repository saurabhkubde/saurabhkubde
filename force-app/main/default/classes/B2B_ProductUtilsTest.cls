@isTest
public with sharing class B2B_ProductUtilsTest {
    @isTest
    public static void getProduct() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        Id accountId = storeResponse.get('accountId');
        // Stub response
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductDetail mockProductDetail = new ConnectApi.ProductDetail();
        stub.mockedResponseByMethod.put('getProduct', mockProductDetail);
        B2B_ProductUtils.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);
        List<String> emptyList = new List<String>();

        Test.startTest();
        System.runAs(communityUser) {
            ConnectApi.ProductDetail productDetail = B2B_ProductUtils.getProduct(
                storeResponse.get('webStoreId'),
                storeResponse.get('productId'),
                accountId,
                emptyList
            );
            System.assertNotEquals(null, productDetail, 'Get Product Details');
        }
        Test.stopTest();
    }

    @isTest
    public static void getProductPricesTest() {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));

        Id accountId = storeResponse.get('accountId');
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.PricingResult productPricesMock = new ConnectApi.PricingResult();
        stub.mockedResponseByMethod.put('getProductPrices', productPricesMock);
        B2B_ProductUtils.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);
        Test.startTest();
        System.runAs(communityUser) {
            ConnectApi.PricingResult productPrices = B2B_ProductUtils.getProductPrices(
                storeResponse.get('webStoreId'),
                accountId,
                new List<String>{ storeResponse.get('productId') }
            );
            System.assertNotEquals(null, productPrices, 'Product price should be available');
        }
        Test.stopTest();
    }
}
