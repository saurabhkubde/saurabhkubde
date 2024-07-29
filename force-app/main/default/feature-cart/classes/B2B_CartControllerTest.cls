/**
 * @author Chirag L
 * @email chirag.lapasia@theblueflamelabs.com
 * @created date 2022-11-10 17:29:00
 * @desc Test class for B2B_CartController
 */

@isTest
private with sharing class B2B_CartControllerTest {
    @TestSetup
    static void setup() {
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFront();
        User communityUser = new User(Id = storeResponse.get('userId'));
        Id accountId = storeResponse.get('accountId');

        WebCart newCart = B2B_TestDataFactory.createActiveEmptyCart(storeResponse.get('webStoreId'), accountId);
        if (newCart != null) {
            newCart.Status = 'Active';
            insert newCart;
        }

        List<CartItem> cartItemList = B2B_TestDataFactory.createCartItem(
            200,
            newCart,
            storeResponse,
            B2B_TestDataFactory.createInsertCartDeliveryGroup(newCart.Id)
        );

        if (cartItemList.isEmpty() == false) {
            insert cartItemList;
        }
        // BS-1094 -- Creates the custom cart Items
        List<B2B_CartItems__c> createVsRxCartItems = B2B_TestDataFactory.createVsRxCartItems(newCart.Id, cartItemList[0].Id, storeResponse, 4);
        insert createVsRxCartItems;

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
        } //end if
    }

    @isTest
    private static void addToCartTest() {
        String quantity = '1';
        String currencyIsoCode = 'USD'; //BS-1245
        List<WebStore> webStoreList = [SELECT Id, Name FROM WebStore];
        List<Account> accountList = [SELECT Id FROM Account];
        List<BuyerGroup> buyerGroupList = [SELECT Id FROM BuyerGroup];
        List<Product2> productList = [SELECT Id FROM Product2];
        List<User> communityUserList = [SELECT Id FROM User WHERE isActive = TRUE];

        // Stub response
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartItem mockCartItem = new ConnectApi.CartItem();
        stub.mockedResponseByMethod.put('addItemToCart', mockCartItem);
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUserList[0]) {
            ConnectApi.CartItem cartItemResult = B2B_CartController.addToCart(
                webStoreList[0].Id,
                productList[0].Id,
                quantity,
                accountList[0].Id,
                currencyIsoCode
            ); // BS-1245 : Added currencyIsoCode as input parameter
            System.assertNotEquals(null, cartItemResult, 'Item added to cart');
        }
        Test.stopTest();
    }

    @isTest
    private static void getCartSummaryTest() {
        String currencyIsoCode = 'USD'; //BS-1245
        List<WebStore> webStoreList = [SELECT Id, Name FROM WebStore];
        List<Account> accountList = [SELECT Id FROM Account];
        List<BuyerGroup> buyerGroupList = [SELECT Id FROM BuyerGroup];
        List<Product2> productList = [SELECT Id FROM Product2];
        List<User> communityUserList = [SELECT Id FROM User WHERE isActive = TRUE];

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartSummary mockCartSummary = new ConnectApi.CartSummary();
        mockCartSummary.accountId = accountList[0].Id;
        stub.mockedResponseByMethod.put('getCartSummary', mockCartSummary);
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUserList[0]) {
            ConnectApi.CartSummary cartSummaryResult = B2B_CartController.getCartSummary(webStoreList[0].Id, accountList[0].Id, currencyIsoCode); // BS-1245 : Added currencyIsoCode as input parameter
            System.assertNotEquals(null, cartSummaryResult, 'Cart summary was null');
        }
        Test.stopTest();
    }

    @isTest
    private static void getCartItemsTest() {
        List<WebStore> webStoreList = [SELECT Id, Name FROM WebStore];
        List<Account> accountList = [SELECT Id FROM Account];
        List<BuyerGroup> buyerGroupList = [SELECT Id FROM BuyerGroup];
        List<Product2> productList = [SELECT Id FROM Product2];
        List<User> communityUserList = [SELECT Id FROM User WHERE isActive = TRUE];
        List<WebCart> cartList = [SELECT Id FROM WebCart];
        List<CartItem> cartItemList = [SELECT Id FROM CartItem WHERE CartId IN :cartList];

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();
        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartList[0].Id;
        cartItem.productId = productList[0].Id;
        ConnectApi.CartItemResult cartItemResult = new ConnectApi.CartItemResult();
        cartItemResult.cartItem = cartItem;

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>{};
        stub.mockedResponseByMethod.put('getCartItems', mockCartItemCollection);
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUserList[0]) {
            ConnectApi.CartItemCollection cartItemCollectionResult = B2B_CartController.getCartItems(
                webStoreList[0].Id,
                accountList[0].Id,
                cartList[0].Id,
                null,
                100,
                null
            );
            System.assertNotEquals(null, cartItemCollectionResult, 'CartItemModel summary was null');
        }
        Test.stopTest();
    }

    @isTest
    private static void updateCartItemsTest() {
        String updatedQuantity = '45';
        List<WebStore> webStoreList = [SELECT Id, Name FROM WebStore];
        List<Account> accountList = [SELECT Id FROM Account];
        List<BuyerGroup> buyerGroupList = [SELECT Id FROM BuyerGroup];
        List<Product2> productList = [SELECT Id FROM Product2];
        List<User> communityUserList = [SELECT Id FROM User WHERE isActive = TRUE];
        List<WebCart> cartList = [SELECT Id FROM WebCart];
        List<CartItem> cartItemList = [SELECT Id FROM CartItem WHERE CartId IN :cartList];

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();
        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartList[0].Id;
        cartItem.productId = productList[0].Id;
        ConnectApi.CartItemResult cartItemResult = new ConnectApi.CartItemResult();
        cartItemResult.cartItem = cartItem;

        ConnectApi.CartItemInput cartInput = new ConnectApi.CartItemInput();
        cartInput.productId = productList[0].Id;
        cartInput.quantity = updatedQuantity;
        cartInput.type = ConnectApi.CartItemType.PRODUCT;

        ConnectApi.CartItem mockCartItemCollection = new ConnectApi.CartItem();
        stub.mockedResponseByMethod.put('updateCartItem', mockCartItemCollection);
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUserList[0]) {
            ConnectApi.CartItem cartItemOutput = B2B_CartController.updateCartItem(
                webStoreList[0].Id,
                accountList[0].Id,
                (String) cartList[0].Id,
                (String) cartItemList[0].Id,
                cartInput
            );
            System.assertNotEquals(null, cartItemOutput, 'CartItem is not updated');
        }
        Test.stopTest();
    }

    @isTest
    private static void deleteCartTest() {
        List<WebStore> webStoreList = [SELECT Id, Name FROM WebStore];
        List<Account> accountList = [SELECT Id FROM Account];
        List<BuyerGroup> buyerGroupList = [SELECT Id FROM BuyerGroup];
        List<Product2> productList = [SELECT Id FROM Product2];
        List<User> communityUserList = [SELECT Id FROM User WHERE isActive = TRUE];
        List<WebCart> cartList = [SELECT Id FROM WebCart];
        List<CartItem> cartItemList = [SELECT Id FROM CartItem WHERE CartId IN :cartList];

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();
        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartList[0].Id;
        cartItem.productId = productList[0].Id;
        ConnectApi.CartItemResult cartItemResult = new ConnectApi.CartItemResult();
        cartItemResult.cartItem = cartItem;

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>{};
        stub.mockedResponseByMethod.put('deleteCart', mockCartItemCollection);
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUserList[0]) {
            B2B_CartController.deleteCart(webStoreList[0].Id, accountList[0].Id, cartList[0].Id);
            System.assertNotEquals(true, [SELECT Id FROM WebCart WHERE Id = :cartList[0].Id].isEmpty(), 'CartItem is not removed');
        }
        Test.stopTest();
    }

    @isTest
    private static void deleteCartItemTest() {
        String updatedQuantity = '45';
        List<WebStore> webStoreList = [SELECT Id, Name FROM WebStore];
        List<Account> accountList = [SELECT Id FROM Account];
        List<BuyerGroup> buyerGroupList = [SELECT Id FROM BuyerGroup];
        List<Product2> productList = [SELECT Id FROM Product2];
        List<User> communityUserList = [SELECT Id FROM User WHERE isActive = TRUE];
        List<WebCart> cartList = [SELECT Id FROM WebCart];
        List<CartItem> cartItemList = [SELECT Id FROM CartItem WHERE CartId IN :cartList];

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();
        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartList[0].Id;
        cartItem.productId = productList[0].Id;
        ConnectApi.CartItemResult cartItemResult = new ConnectApi.CartItemResult();
        cartItemResult.cartItem = cartItem;

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>{};
        stub.mockedResponseByMethod.put('deleteCartItems', mockCartItemCollection);
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUserList[0]) {
            B2B_CartController.deleteCartItem(webStoreList[0].Id, accountList[0].Id, cartList[0].Id, cartItemList[0].Id);
            System.assertNotEquals(true, [SELECT Id FROM CartItem WHERE Id = :cartItemList[0].Id].isEmpty(), 'CartItem is not removed');
        }
        Test.stopTest();
    }

    @isTest
    private static void createCartTest() {
        List<WebStore> webStoreList = [SELECT Id, Name FROM WebStore];
        List<Account> accountList = [SELECT Id FROM Account];
        List<User> communityUserList = [SELECT Id FROM User WHERE isActive = TRUE];

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartSummary mockCartSummary = new ConnectApi.CartSummary();
        mockCartSummary.accountId = accountList[0].Id;
        stub.mockedResponseByMethod.put('createCart', mockCartSummary);
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUserList[0]) {
            ConnectApi.CartSummary cartSummaryResult = B2B_CartController.createCart(webStoreList[0].id, accountList[0].Id);
            System.assertNotEquals(null, cartSummaryResult, 'Cart is not created');
        }
        Test.stopTest();
    }

    @isTest
    private static void getProductDetailsTest() {
        List<Product2> productList = [SELECT Id FROM Product2];
        List<String> productIdList = new List<String>();
        Map<Id, Product2> productIdVsProductMap = new Map<Id, Product2>();

        for (Product2 product : productList) {
            if (productIdList.contains(product.Id) == false) {
                productIdList.add(product.Id);
            }
        }

        Test.startTest();
        if (productIdList.isEmpty() == false) {
            productIdVsProductMap = B2B_CartController.getProductDetails(productIdList);
        }
        System.assertNotEquals(null, productIdVsProductMap, 'Fail to fetch ProductData');
        Test.stopTest();
    }

    @isTest
    private static void getCartItemDataTest() {
        List<CartItem> cartItemList = [SELECT Id FROM CartItem];
        Map<Id, CartItem> cartItemIdVsCartItemMap = new Map<Id, CartItem>();

        List<String> cartItemIdList = new List<String>();
        for (CartItem cartItem : cartItemList) {
            if (cartItemIdList.contains(cartItem.Id) == false) {
                cartItemIdList.add(cartItem.Id);
            }
        }

        Test.startTest();
        if (cartItemIdList.isEmpty() == false) {
            cartItemIdVsCartItemMap = B2B_CartController.getCartItemData(cartItemIdList);
        }
        System.assertNotEquals(null, cartItemIdVsCartItemMap, 'Fail to fetch Cart Item data');
        Test.stopTest();
    }

    @isTest
    private static void getCartItemDataWithoutCartItemTest() {
        List<CartItem> cartItemList = [SELECT Id FROM CartItem];
        Map<Id, CartItem> cartItemIdVsCartItemMap;

        List<String> cartItemIdList = new List<String>();

        Test.startTest();
        cartItemIdVsCartItemMap = B2B_CartController.getCartItemData(cartItemIdList);
        System.assertEquals(null, cartItemIdVsCartItemMap, 'Fail to fetch Cart Item data');
        Test.stopTest();
    }

    @isTest
    private static void getCartItemsWithProductDetailsTest() {
        Integer pageSize = 25;
        Integer numberOfRecords = 200;

        List<WebStore> webStoreList = [SELECT Id, Name FROM WebStore];
        List<Account> accountList = [SELECT Id FROM Account];
        List<BuyerGroup> buyerGroupList = [SELECT Id FROM BuyerGroup];
        List<Product2> productList = [SELECT Id FROM Product2];
        List<User> communityUserList = [SELECT Id FROM User WHERE isActive = TRUE];
        List<WebCart> cartList = [SELECT Id FROM WebCart];
        List<CartItem> cartItemList = [SELECT Id FROM CartItem WHERE CartId IN :cartList];

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();
        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartList[0].Id;
        cartItem.productId = productList[0].Id;
        ConnectApi.CartItemResult cartItemResult = new ConnectApi.CartItemResult();
        cartItemResult.cartItem = cartItem;

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>{};
        stub.mockedResponseByMethod.put('getCartItemsWithProductDetails', mockCartItemCollection);
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUserList[0]) {
            ConnectApi.CartItemCollection cartItemCollectionResult = B2B_CartController.getCartItemsWithProductDetails(
                webStoreList[0].Id,
                accountList[0].id,
                cartList[0].Id,
                null,
                pageSize,
                null
            );
            System.assertNotEquals(null, cartItemCollectionResult, 'Fetching CartItemWithProductDetails failed');
        }
        Test.stopTest();
    }

    @isTest
    private static void getProductDetailsWithoutProductTest() {
        List<Product2> productList = [SELECT Id FROM Product2];
        List<String> productIdList = new List<String>();
        Map<Id, Product2> productIdVsProductMap;

        Test.startTest();
        productIdVsProductMap = B2B_CartController.getProductDetails(productIdList);
        System.assertEquals(null, productIdVsProductMap, 'Fail to fetch ProductData');
        Test.stopTest();
    }

    @isTest
    private static void updateCartItemDataWithCustomerReferenceModeTest() {
        String customerReference = 'Test User';
        String enteredBy = 'Test';
        String cartItemId;
        List<WebStore> webStoreList = [SELECT Id, Name FROM WebStore];
        List<Account> accountList = [SELECT Id FROM Account];
        List<BuyerGroup> buyerGroupList = [SELECT Id FROM BuyerGroup];
        List<Product2> productList = [SELECT Id FROM Product2];
        List<User> communityUserList = [SELECT Id FROM User WHERE isActive = TRUE];
        List<WebCart> cartList = [SELECT Id FROM WebCart];
        List<CartItem> cartItemList = [SELECT Id FROM CartItem WHERE CartId IN :cartList];
        cartItemId = cartItemList[0].Id;
        List<CartItem> cartItemsList = new List<CartItem>();

        Test.startTest();
        if (String.isNotBlank(cartItemId)) {
            cartItemsList = B2B_CartController.updateCartItemData(cartItemId, customerReference, enteredBy);
        }
        System.assertNotEquals(null, cartItemsList, 'Fail to update Cart Item data');
        Test.stopTest();
    }

    @isTest
    private static void getCartItemDetailsTest() {
        List<CartItem> cartItemList = [SELECT Id FROM CartItem];
        Map<Id, CartItem> cartItemIdVsCartItemMap = new Map<Id, CartItem>();

        List<String> cartItemIdList = new List<String>();
        for (CartItem cartItem : cartItemList) {
            if (cartItemIdList.contains(cartItem.Id) == false) {
                cartItemIdList.add(cartItem.Id);
            }
        }
        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
            B2B_PB1_Right__c = 1,
            B2B_PB1_Left__c = 1,
            B2B_Cart_Item__c = cartItemIdList[0]
        );
        insert lensConfiguratorObj;
        Map<Id, B2B_Lens_Configurator__c> cartItemIdVsLensConfiguratorMap = new Map<Id, B2B_Lens_Configurator__c>();
        Test.startTest();
        if (cartItemIdList.isEmpty() == false) {
            cartItemIdVsLensConfiguratorMap = B2B_CartController.getCartItemDetails(cartItemIdList);
        }
        System.assertNotEquals(null, cartItemIdVsLensConfiguratorMap, 'Fail to fetch Cart Item data');
        Test.stopTest();
    }

    //BS-787
    @isTest
    public static void getEntitlementProductsForVisionSensationGlobalTest() {
        List<Account> accountList = [SELECT Id FROM Account];

        List<CommerceEntitlementPolicy> commerceEntitlementPolicyList = [SELECT Id, Name FROM CommerceEntitlementPolicy];
        for (CommerceEntitlementPolicy commerceEntitlementPolicy : commerceEntitlementPolicyList) {
            commerceEntitlementPolicy.Name = 'Global - RX Solution';
        }
        update commerceEntitlementPolicyList;

        String buyerGroupType = 'Vision Sensation';
        String accountId = accountList[0].Id;
        B2B_CartController.B2B_EntitlementWrapper entitlementObj = new B2B_CartController.B2B_EntitlementWrapper();
        entitlementObj = B2B_CartController.checkEligibilityForVSRX(accountId);
        System.assertEquals(true, entitlementObj.isEligibleForRX, 'Should return Eligibility for VS RX');
    }

    //BS-787
    @isTest
    public static void checkVSRXEligibilityFromAccountTest() {
        List<Account> accountList = [SELECT Id, k_Account_Status_SVS__c, k_EERX_Account_Status__c FROM Account];

        String accountId = accountList[0].Id;
        B2B_CartController.B2B_EntitlementWrapper entitlementObj = new B2B_CartController.B2B_EntitlementWrapper();
        Test.startTest();
        entitlementObj = B2B_CartController.checkVSRXEligibilityFromAccount(accountId);
        Test.stopTest();
        System.assertEquals(false, entitlementObj.isEligibleForRX, 'Should return Eligibility for RX');
        System.assertEquals(false, entitlementObj.isEligibleForVS, 'Should return Eligibility for VS ');
    }

    @isTest
    private static void getGlassDetailsTest() {
        List<CartItem> cartItemList = [SELECT Id FROM CartItem];
        Map<Id, CartItem> cartItemIdVsCartItemMap = new Map<Id, CartItem>();

        List<String> cartItemIdList = new List<String>();
        for (CartItem cartItem : cartItemList) {
            if (cartItemIdList.contains(cartItem.Id) == false) {
                cartItemIdList.add(cartItem.Id);
            }
        }
        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
            B2B_PB1_Right__c = 1,
            B2B_PB1_Left__c = 1,
            B2B_Cart_Item__c = cartItemIdList[0],
            B2B_Selected_RX_Solution_SKU__c = 'TestSKU0',
            B2B_Selected_Lens_SKU__c = 'TestSKU0'
        );
        insert lensConfiguratorObj;
        Map<Id, B2B_Lens_Configurator__c> cartItemIdVsLensConfiguratorMap = new Map<Id, B2B_Lens_Configurator__c>();
        if (cartItemIdList.isEmpty() == false) {
            cartItemIdVsLensConfiguratorMap = B2B_CartController.getCartItemDetails(cartItemIdList);
        }

        list<B2B_CartController.B2B_CartGlassDetailsWrapper> glassDetailsList = new List<B2B_CartController.B2B_CartGlassDetailsWrapper>();
        Test.startTest();
        if (cartItemIdList.isEmpty() == false) {
            glassDetailsList = B2B_CartController.getGlassDetails(cartItemIdVsLensConfiguratorMap);
        }
        System.assertNotEquals(null, glassDetailsList, 'Fail to fetch Cart Item data');
        Test.stopTest();
    }

    /**
     * BS-1094
     * This is a test method for the getTotalPriceForCartItem when data is properly provided
     */
    @isTest
    private static void getTotalPriceForCartItemTest() {
        List<CartItem> cartItemList = [SELECT Id, Name FROM CartItem LIMIT 1];
        List<String> cartItemIdList = new List<String>();
        for (CartItem cartItemObj : cartItemList) {
            cartItemIdList.add(cartItemList[0].Id);
        }
        List<B2B_CartItems__c> customCartItemList = [SELECT Id, Name FROM B2B_CartItems__c LIMIT 2];
        for (B2B_CartItems__c customCartItem : customCartItemList) {
            customCartItem.B2B_Parent_Cart_Item__c = cartItemIdList[0];
        }
        update customCartItemList;
        Test.startTest();
        Map<Id, List<B2B_CartItems__c>> cartItemIdVsCustomCartItemListMap = B2B_CartController.getTotalPriceForCartItem(cartItemIdList);
        Test.stopTest();
        System.assertNotEquals(null, cartItemIdVsCustomCartItemListMap, 'custom cart items returned');
    }

    /**
     * BS-1094
     * This is a test method for the getTotalPriceForCartItem when data is properly not provided
     */
    @isTest
    private static void getTotalPriceForCartItemEmptyMapTest() {
        List<CartItem> cartItemList = [SELECT Id, Name FROM CartItem LIMIT 1];
        List<String> cartItemIdList = new List<String>();
        List<B2B_CartItems__c> customCartItemList = [SELECT Id, Name FROM B2B_CartItems__c LIMIT 2];
        for (B2B_CartItems__c customCartItem : customCartItemList) {
            customCartItem.B2B_Parent_Cart_Item__c = null;
        }
        update customCartItemList;
        Test.startTest();
        Map<Id, List<B2B_CartItems__c>> cartItemIdVsCustomCartItemListMap = B2B_CartController.getTotalPriceForCartItem(cartItemIdList);
        Test.stopTest();
        System.assertEquals(null, cartItemIdVsCustomCartItemListMap, 'custom cart items not returned');
    }

    //BS-1137
    @isTest
    private static void getProductTypeTest() {
        List<String> productIdList = new List<String>();
        Map<Id, String> productIdVsProductMap = new Map<Id, String>();

        B2B_TestDataFactory.createCommerceProductLinkRecords();
        List<Product2> productList = [SELECT Id FROM Product2];
        for (Product2 product : productList) {
            if (productIdList.contains(product.Id) == false) {
                productIdList.add(product.Id);
            }
        }
        Test.startTest();
        productIdVsProductMap = B2B_CartController.getProductType(productIdList);
        Test.stopTest();
        System.assertNotEquals(null, productIdVsProductMap, 'Map of spare part products');
    }

    //BS-1137
    @isTest
    private static void getProductTypeNullTest() {
        List<String> productIdList = new List<String>();
        Map<Id, String> productIdVsProductMap = new Map<Id, String>();
        Test.startTest();
        productIdVsProductMap = B2B_CartController.getProductType(productIdList);
        Test.stopTest();
        System.assertEquals(null, productIdVsProductMap, 'Fail to fetch ProductData');
    }

    /**
     * BS-1036
     * This is a test method for the saveToMyWishList
     */
    @isTest
    private static void saveToMyWishListTest() {
        String updatedQuantity = '45';
        List<WebStore> webStoreList = [SELECT Id, Name FROM WebStore];
        List<Account> accountList = [SELECT Id FROM Account];
        List<BuyerGroup> buyerGroupList = [SELECT Id FROM BuyerGroup];
        List<Product2> productList = [SELECT Id FROM Product2];
        List<User> communityUserList = [SELECT Id FROM User WHERE isActive = TRUE];
        List<WebCart> cartList = [SELECT Id FROM WebCart];
        List<CartItem> cartItemList = [SELECT Id FROM CartItem WHERE CartId IN :cartList];

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();
        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartList[0].Id;
        cartItem.productId = productList[0].Id;
        ConnectApi.CartItemResult cartItemResult = new ConnectApi.CartItemResult();
        cartItemResult.cartItem = cartItem;

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>{};
        stub.mockedResponseByMethod.put('deleteCartItems', mockCartItemCollection);
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUserList[0]) {
            B2B_CartController.saveToMyWishList(webStoreList[0].Id, accountList[0].Id, cartList[0].Id, cartItemList[0].Id, true);
        }
        Test.stopTest();
        System.assertNotEquals(true, [SELECT Id FROM CartItem WHERE Id = :cartItemList[0].Id].isEmpty(), 'CartItem is not removed');
    }

    /**
     * BS-1036
     * This is a test method for the deleteVsRxCartItems
     */
    @isTest
    private static void deleteVsRxCartItemsTest() {
        List<CartItem> cartItemList = [SELECT Id FROM CartItem LIMIT 1];
        List<B2B_CartItems__c> vsRxCartItemsList = [SELECT Id, B2B_Parent_Cart_Item__c FROM B2B_CartItems__c LIMIT 1];
        vsRxCartItemsList[0].B2B_Parent_Cart_Item__c = cartItemList[0].Id;
        update vsRxCartItemsList;
        Test.startTest();
        B2B_CartController.deleteVsRxCartItems(cartItemList[0].Id);
        List<B2B_CartItems__c> vsRxCartItemsListReturned = [
            SELECT Id, B2B_Parent_Cart_Item__c
            FROM B2B_CartItems__c
            WHERE B2B_Parent_Cart_Item__c = :cartItemList[0].Id
        ];
        Test.stopTest();
        System.assertEquals(true, vsRxCartItemsListReturned.isEmpty(), 'vs rx CartItem is not deleted');
    }

    /**
     * BS-1036
     * This is a test method for the deleteLensConfigurator
     */
    @isTest
    private static void deleteLensConfiguratorTest() {
        List<CartItem> cartItemList = [SELECT Id FROM CartItem LIMIT 1];
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT ID, B2B_Cart_Item__c FROM B2B_Lens_Configurator__c LIMIT 1];
        lensConfiguratorList[0].B2B_Cart_Item__c = cartItemList[0].Id;
        update lensConfiguratorList;
        Test.startTest();
        B2B_CartController.deleteVsRxCartItems(cartItemList[0].Id);
        List<B2B_Lens_Configurator__c> lensConfigList = [
            SELECT Id, B2B_Cart_Item__c
            FROM B2B_Lens_Configurator__c
            WHERE B2B_Cart_Item__c = :cartItemList[0].Id
        ];
        Test.stopTest();
        System.assertEquals(true, lensConfigList.isEmpty(), 'Lens Configurator is not deleted');
    }

    /**
     * BS-1036
     * This is a test method for the updateLensConfiguratorStatus
     */
    @isTest
    private static void updateLensConfiguratorStatusTest() {
        List<CartItem> cartItemList = [SELECT Id FROM CartItem LIMIT 1];
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT ID, B2B_Cart_Item__c FROM B2B_Lens_Configurator__c LIMIT 1];
        lensConfiguratorList[0].B2B_Cart_Item__c = cartItemList[0].Id;
        update lensConfiguratorList;
        Test.startTest();
        B2B_CartController.updateLensConfiguratorStatus(cartItemList[0].Id);
        List<B2B_Lens_Configurator__c> lensConfigList = [
            SELECT Id, B2B_Cart_Item__c, B2B_Status__c
            FROM B2B_Lens_Configurator__c
            WHERE B2B_Cart_Item__c = :cartItemList[0].Id
        ];
        Test.stopTest();
        System.assertEquals('Open', lensConfigList[0].B2B_Status__c, 'Lens Configurator is not updated');
    }

    /**
     * BS-1036
     * This is a test method for the getCartItemType
     */
    @isTest
    private static void getCartItemTypeTest() {
        List<CartItem> cartItemList = [SELECT Id FROM CartItem LIMIT 10];
        List<String> cartItemIdList = new List<String>();
        for (CartItem cartItemObj : cartItemList) {
            cartItemIdList.add(cartItemObj.Id);
        }
        Test.startTest();
        List<CartItem> cartItemListReturned = B2B_CartController.getCartItemType(cartItemIdList);
        Test.stopTest();
        System.assertNotEquals(null, cartItemListReturned, 'Cart Item List not returned');
    }

    /**
     * BS-1245
     * This is a test method for getCurrencyCode()
     */
    @isTest
    private static void getCurrencyCodeWithValidInputParametersTest() {
        List<String> pricebookEntryIdList = new List<String>();
        for (Pricebookentry priceBookEntry : [SELECT Id FROM Pricebookentry LIMIT 100]) {
            pricebookEntryIdList.add(priceBookEntry.Id);
        }
        List<String> currencyCodesList = new List<String>();
        Test.startTest();
        currencyCodesList = B2B_CartController.getCurrencyCode(pricebookEntryIdList);
        Test.stopTest();
        Assert.areEqual(false, currencyCodesList.isEmpty(), 'Should return List containing currency ISO Codes for provided pricebookEntries');
    }

    /**
     * BS-1245
     * This is a test method for getCurrencyCode()
     */
    @isTest
    private static void getCurrencyCodeWithInValidInputParametersTest() {
        List<String> pricebookEntryIdList = new List<String>();
        for (Pricebookentry priceBookEntry : [SELECT Id FROM Pricebookentry LIMIT 100]) {
            pricebookEntryIdList.add(priceBookEntry.Id);
        }
        List<String> currencyCodesList = new List<String>();
        Test.startTest();
        currencyCodesList = B2B_CartController.getCurrencyCode(pricebookEntryIdList);
        Test.stopTest();
        Assert.areEqual(false, currencyCodesList.isEmpty(), 'Should return List containing currency ISO Codes for provided pricebookEntries');
    }

    //BS-1090
    @isTest
    public static void getProductsWithEntitlePolicyTest() {
        List<Account> accountList = [SELECT Id FROM Account];

        List<CommerceEntitlementPolicy> commerceEntitlementPolicyList = [SELECT Id, Name FROM CommerceEntitlementPolicy];
        for (CommerceEntitlementPolicy commerceEntitlementPolicy : commerceEntitlementPolicyList) {
            commerceEntitlementPolicy.Name = 'All Access for Silhouette B2B Store';
        }
        update commerceEntitlementPolicyList;

        String buyerGroupType = 'Silhouette B2B Store Buyer Group';
        String accountId = accountList[0].Id;
        List<String> productIdList = B2B_CartController.getEntitledSHProducts(accountId);
        System.assertNotEquals(0, productIdList.size());
    }

    //BS-1090
    @isTest
    public static void deleteMultipleCartItemsTest() {
        List<CartItem> cartItemList = [SELECT Id, Product2.Id FROM CartItem WHERE B2B_Type__c = NULL AND Cart.Status = 'Active'];
        List<String> productIdList = new List<String>();
        Integer count = 0;
        for (CartItem cartItemObj : cartItemList) {
            productIdList.add(cartItemObj.Product2.Id);
            count++;
            if (count == 1) {
                break;
            }
        }

        B2B_CartController.deleteMultipleCartItems(productIdList);
        List<CartItem> cartItemAfterDeleteList = [SELECT Id, Product2.Id FROM CartItem WHERE B2B_Type__c = NULL AND Cart.Status = 'Active'];
        System.assertEquals(0, cartItemAfterDeleteList.size(), 'Items not got deleted');
    }

    //BS-1339
    @isTest
    private static void deleteSilhouetteStoreCartTest() {
        List<WebStore> webStoreList = [SELECT Id, Name FROM WebStore];
        List<Account> accountList = [SELECT Id FROM Account];
        List<User> communityUserList = [SELECT Id FROM User WHERE isActive = TRUE];
        List<WebCart> cartList = [SELECT Id FROM WebCart];
        List<CartItem> cartItemList = [SELECT Id, Product2Id, B2B_Type__c FROM CartItem WHERE CartId IN :cartList];
        CartItem cartItemToUpdate = new cartItem();
        cartItemToUpdate.Id = cartItemList[0].Id;
        cartItemToUpdate.B2B_Type__c = 'RX Glazing';
        update cartItemToUpdate;
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();
        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartList[0].Id;
        cartItem.productId = cartItemList[0].Product2Id;
        cartItem.Quantity = '1';

        B2B_CartItems__c customCartItem = new B2B_CartItems__c(
            B2B_Parent_Cart_Item__c = cartItemList[0].Id,
            B2B_List_Price__c = 1,
            B2B_Unit_Price__c = 1,
            B2B_Quantity__c = 1,
            B2B_Product__c = cartItemList[0].Product2Id
        );
        insert customCartItem;

        List<B2B_Lens_Configurator__c> lensConfigList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        lensConfigList[0].B2B_Cart_Item__c = cartItemList[0].Id;
        insert lensConfigList;
        ConnectApi.CartItemResult cartItemResult = new ConnectApi.CartItemResult();
        cartItemResult.cartItem = cartItem;

        ConnectApi.CartSummary mockCartSummary = new ConnectApi.CartSummary();
        mockCartSummary.cartId = cartList[0].Id;

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>{ cartItemResult };
        mockCartItemCollection.cartSummary = mockCartSummary;
        stub.mockedResponseByMethod.put('getCartItems', mockCartItemCollection);

        stub.mockedResponseByMethod.put('deleteCart', mockCartItemCollection);
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        Test.startTest();
        System.runAs(communityUserList[0]) {
            B2B_CartController.deleteSilhouetteStoreCart(webStoreList[0].Id, accountList[0].Id, cartList[0].Id, null, 100, null);
            System.assertNotEquals(true, [SELECT Id FROM WebCart WHERE Id = :cartList[0].Id].isEmpty(), 'CartItem is not removed');
        }
        Test.stopTest();
    }
    @isTest
    private static void getProductDetailsNBTest() {
        List<Product2> productList = [SELECT Id FROM Product2 LIMIT 1];
        List<String> productIdList = new List<String>();
        Map<Id, B2B_CartController.B2B_ProductDataWrapper> productIdVsProductMap = new Map<Id, B2B_CartController.B2B_ProductDataWrapper>();

        for (Product2 product : productList) {
            if (productIdList.contains(product.Id) == false) {
                productIdList.add(product.Id);
            }
        }

        List<ProductCatalog> productCatalogList = [SELECT Id, Name FROM ProductCatalog LIMIT 1];
        productCatalogList[0].Name = System.Label.B2B_STORE_CATALOG_NAME.split(',')[1];
        update productCatalogList;

        ProductCategory productCategoryObj = new ProductCategory();
        productCategoryObj.Name = System.Label.B2B_NEUBAU_FRAME_CATEGORY.split(',')[0];
        productCategoryObj.CatalogId = productCatalogList[0].Id;
        insert productCategoryObj;

        ProductCategory productCategoryChildObj = new ProductCategory();
        productCategoryChildObj.Name = 'Child';
        productCategoryChildObj.CatalogId = productCatalogList[0].Id;
        insert productCategoryChildObj;

        List<ProductCategoryProduct> productCategoryProductList = new List<ProductCategoryProduct>();
        for (Product2 product : productList) {
            if (productIdList.contains(product.Id) == false) {
                productIdList.add(product.Id);
                productCategoryProductList.add(new ProductCategoryProduct(ProductCategoryId = productCategoryChildObj.Id, ProductId = product.Id));
            }
        }
        insert productCategoryProductList;

        Test.startTest();
        productIdVsProductMap = B2B_CartController.getProductDetailsNB(productIdList);
        Test.stopTest();
        System.assertEquals(null, productIdVsProductMap, 'Returns a populated map');
    }

    //BS-1568
    @isTest
    private static void checkSparePartsOnlyFramesNBTest() {
        List<Product2> productList = [SELECT Id FROM Product2];
        List<String> productIdList = new List<String>();
        List<ProductCategoryProduct> productCategoryProductList = new List<ProductCategoryProduct>();
        Map<Id, Boolean> productIdVsisFrameMap = new Map<Id, Boolean>();
        List<ProductCategory> productCategoryList = [SELECT Id, Name FROM ProductCategory LIMIT 1];
        productCategoryList[0].Name = System.Label.B2B_NEUBAU_FRAME_CATEGORY.split(',')[0];
        List<ProductCatalog> productCatalogList = [SELECT Id, Name FROM ProductCatalog LIMIT 1];
        productCatalogList[0].Name = System.Label.B2B_STORE_CATALOG_NAME.split(',')[1];
        update productCategoryList;
        update productCatalogList;

        for (Product2 product : productList) {
            if (productIdList.contains(product.Id) == false) {
                productIdList.add(product.Id);
                productCategoryProductList.add(new ProductCategoryProduct(ProductCategoryId = productCategoryList[0].Id, ProductId = product.Id));
            }
        }
        insert productCategoryProductList;

        Test.startTest();
        productIdVsisFrameMap = B2B_CartController.checkSparePartsOnlyFrames(productIdList, false);
        Test.stopTest();
        System.assertEquals(1, productIdVsisFrameMap.size(), 'Returns a populated map');
    }

    //BS-1568
    @isTest
    private static void checkSparePartsOnlyFramesSHEETest() {
        List<Product2> productList = [SELECT Id FROM Product2];
        List<String> productIdList = new List<String>();
        List<ProductCategoryProduct> productCategoryProductList = new List<ProductCategoryProduct>();
        Map<Id, Boolean> productIdVsisFrameMap = new Map<Id, Boolean>();

        List<ProductCatalog> productCatalogList = [SELECT Id, Name FROM ProductCatalog LIMIT 1];
        productCatalogList[0].Name = System.Label.B2B_STORE_CATALOG_NAME.split(',')[0];
        update productCatalogList;

        ProductCategory productCategoryObj = new ProductCategory();
        productCategoryObj.Name = 'Master';
        productCategoryObj.CatalogId = productCatalogList[0].Id;
        insert productCategoryObj;

        List<ProductCategory> productCategoryList = [SELECT Id, Name FROM ProductCategory LIMIT 1];
        productCategoryList[0].Name = System.Label.B2B_SILHOUETTE_SPARE_PART_ONLY_FRAME_CATEGORY.split(',')[0];
        productCategoryList[0].ParentCategoryId = productCategoryObj.Id;
        update productCategoryList;

        for (Product2 product : productList) {
            if (productIdList.contains(product.Id) == false) {
                productIdList.add(product.Id);
                productCategoryProductList.add(new ProductCategoryProduct(ProductCategoryId = productCategoryList[0].Id, ProductId = product.Id));
            }
        }
        insert productCategoryProductList;

        Test.startTest();
        productIdVsisFrameMap = B2B_CartController.checkSparePartsOnlyFrames(productIdList, true);
        Test.stopTest();
        System.assertEquals(1, productIdVsisFrameMap.size(), 'Returns a populated map');
    }

    //BS-1714
    @isTest
    private static void getBrandWiseCCSFlagSilhouetteTest() {
        List<Account> accountList = [SELECT Id, k_Account_Closed_SH__c FROM Account LIMIT 1];
        accountList[0].k_Account_Closed_SH__c = '1';
        update accountList;

        List<CartItem> shCartItemList = [SELECT Id, Product2Id, CartId FROM CartItem LIMIT 1];

        List<Id> shProductList = new List<Id>();
        for (CartItem cartItemObj : shCartItemList) {
            shProductList.add(cartItemObj.Product2Id);
        }

        List<Product2> productList = [SELECT Id, B2B_Brand__c FROM Product2 WHERE Id IN :shProductList];
        for (Product2 productObj : productList) {
            productObj.B2B_Brand__c = B2B_Constants.B2B_SH_BRAND_API_NAME_01;
        }
        update productList;
        List<ProductCatalog> productCatalogList = [SELECT Id, Name FROM ProductCatalog LIMIT 1];
        productCatalogList[0].Name = System.Label.B2B_STORE_CATALOG_NAME.split(',')[0];

        update productCatalogList;

        ProductCategory productCategoryObj = new ProductCategory();
        productCategoryObj.Name = System.Label.B2B_SILHOUETTE_CCS_FRAMES.split(',')[0];
        productCategoryObj.CatalogId = productCatalogList[0].Id;
        insert productCategoryObj;

        List<ProductCategory> productCategoryList = [SELECT Id, Name FROM ProductCategory WHERE Id != :productCategoryObj.Id];
        productCategoryList[0].ParentCategoryId = productCategoryObj.Id;

        update productCategoryList;

        List<ProductCategoryProduct> productCategoryProductList = new List<ProductCategoryProduct>();
        for (Id productId : shProductList) {
            productCategoryProductList.add(new ProductCategoryProduct(ProductCategoryId = productCategoryList[0].Id, ProductId = productId));
        }
        insert productCategoryProductList;

        Test.startTest();
        B2B_CartController.B2B_CcsFlagWrapper ccsWrapperObj = B2B_CartController.getBrandWiseCCSFlag(shCartItemList[0].CartId, accountList[0].Id);
        Test.stopTest();
        System.assertEquals(ccsWrapperObj != null, true, 'Data Should be returned');
    }

    //BS-1714
    @isTest
    private static void getBrandWiseCCSFlagEvilEyeTest() {
        List<Account> accountList = [SELECT Id, k_Account_Closed_EE__c FROM Account LIMIT 1];
        accountList[0].k_Account_Closed_EE__c = '1';
        update accountList;
        List<CartItem> eeCartItemList = [SELECT Id, Product2Id, CartId FROM CartItem LIMIT 1];

        List<Id> eeProductList = new List<Id>();
        for (CartItem cartItemObj : eeCartItemList) {
            eeProductList.add(cartItemObj.Product2Id);
        }

        List<Product2> productList = [SELECT Id, B2B_Brand__c FROM Product2 WHERE Id IN :eeProductList];
        for (Product2 productObj : productList) {
            productObj.B2B_Brand__c = B2B_Constants.B2B_EE_BRAND_API_NAME_05;
        }
        update productList;

        List<ProductCatalog> productCatalogList = [SELECT Id, Name FROM ProductCatalog LIMIT 1];
        productCatalogList[0].Name = System.Label.B2B_STORE_CATALOG_NAME.split(',')[0];

        update productCatalogList;

        ProductCategory productCategoryObj = new ProductCategory();
        productCategoryObj.Name = System.Label.B2B_EVIL_EYE_CCS_FRAMES.split(',')[0];
        productCategoryObj.CatalogId = productCatalogList[0].Id;
        insert productCategoryObj;

        List<ProductCategory> productCategoryList = [SELECT Id, Name FROM ProductCategory WHERE Id != :productCategoryObj.Id];
        productCategoryList[0].ParentCategoryId = productCategoryObj.Id;

        update productCategoryList;

        List<ProductCategoryProduct> productCategoryProductList = new List<ProductCategoryProduct>();
        for (Id productId : eeProductList) {
            productCategoryProductList.add(new ProductCategoryProduct(ProductCategoryId = productCategoryList[0].Id, ProductId = productId));
        }
        insert productCategoryProductList;

        Test.startTest();
        B2B_CartController.B2B_CcsFlagWrapper ccsWrapperObj = B2B_CartController.getBrandWiseCCSFlag(eeCartItemList[0].CartId, accountList[0].Id);
        Test.stopTest();
        System.assertEquals(ccsWrapperObj != null, true, 'Data Should be returned');
    }
}
