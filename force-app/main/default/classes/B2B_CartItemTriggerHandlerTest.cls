/**
 * @author Chirag L
 * @email  chirag.lapasia@theblueflamelabs.com
 * @desc   This class is developed for testing purpose of methods present in B2B_CartItemTriggerHandler
 * BS-1409
 **/
@isTest
private class B2B_CartItemTriggerHandlerTest {
    //BS-1409 : Testing scenario of RX Type of CartItem is already present in Cart and SH/EE type of CartItem is already present in Cart then update the existing SH/EE CartItem
    @isTest
    private static void onBeforeUpdateTest() {
        String buyerGroupType = 'RX Glazing';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType);

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.ProductPrice mockProductPrice = new ConnectApi.ProductPrice();
        mockProductPrice.listPrice = '10.00';
        mockProductPrice.unitPrice = '8.00';
        stub.mockedResponseByMethod.put('getProductPrice', mockProductPrice);
        B2B_VisionSensation_RX_Controller.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Id accountId = storeResponse.get('accountId');

        WebCart cartObj = B2B_TestDataFactory.createActiveEmptyCart(storeResponse.get('webStoreId'), accountId);
        cartObj.Status = 'Active';
        insert cartObj;

        CartDeliveryGroup cartDeliveryObj = B2B_TestDataFactory.createInsertCartDeliveryGroup(cartObj.Id);
        Map<String, String> storeResponseEmpty = new Map<String, String>();
        List<CartItem> cartItemList = B2B_TestDataFactory.createCartItem(1, cartObj, storeResponseEmpty, cartDeliveryObj);

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

        List<CartItem> parsedCartItemList = B2B_TestDataFactory.createCartItem(1, cartObj, storeResponseEmpty, cartDeliveryObj);
        parsedCartItemList[0].product2Id = productList[0].Id;
        parsedCartItemList[0].Sku = productList[0].StockKeepingUnit;
        parsedCartItemList[0].CurrencyIsoCode = 'EUR';
        parsedCartItemList[0].B2B_Type__c = null;
        insert parsedCartItemList;

        cartItemList[0].Product2Id = productList[0].Id;
        cartItemList[0].Sku = productList[0].StockKeepingUnit;
        cartItemList[0].CurrencyIsoCode = 'EUR';
        List<CartItem> normalCartItemsList = new List<CartItem>{ cartItemList[0] };

        normalCartItemsList[0].B2B_Type__c = null;
        insert normalCartItemsList;

        cartItemList[0].B2B_Type__c = 'RX Glazing';
        cartItemList[0].Id = null;
        insert cartItemList;

        Map<Id, CartItem> idVSCartItemOldMap = new Map<Id, CartItem>();
        idVSCartItemOldMap.put(cartItemList[0].Id, cartItemList[0]);

        cartItemList[0].Quantity = 2;
        Map<Id, CartItem> idVSCartItemNewMap = new Map<Id, CartItem>();
        idVSCartItemNewMap.put(cartItemList[0].Id, cartItemList[0]);

        Test.startTest();
        B2B_CartItemTriggerHandler.onBeforeUpdate(idVSCartItemOldMap, idVSCartItemNewMap);
        Test.stopTest();

        List<CartItem> finalCartItemList = [SELECT Id, Quantity FROM CartItem WHERE Id IN :cartItemList];
        Assert.areEqual(
            true,
            finalCartItemList.isEmpty() == false &&
            finalCartItemList[0] != null &&
            finalCartItemList[0].Quantity != null &&
            finalCartItemList[0].Quantity == 1,
            'VS-RX Type of CartItems should always have quantity as 1'
        );
    }
}
