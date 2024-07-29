@IsTest
public with sharing class B2B_CheckoutControllerTest {
    public static String effectiveAccountId = null;
    public static String shipToContactPointAddressId = null;
    public static String cartId = null;
    public static String webstoreId = null;
    public static String deliveryMethodId = null;
    public static String cartDeliveryGroupId = null;
    public static String cartDeliveryGroupMethodId = null;

    private static void setup() {
        Product2 product1 = new Product2(Name = 'TestProduct', StockKeepingUnit = 'SKU_Test1', Description = 'Test Product', IsActive = true);

        insert product1;

        Id pricebookId = Test.getStandardPricebookId();

        PricebookEntry pbe = new PricebookEntry(
            IsActive = true,
            UnitPrice = 50,
            Pricebook2Id = pricebookId,
            Product2Id = product1.Id,
            UseStandardPrice = false
        );

        insert pbe;

        Account account = new Account(Name = 'TestAccount');
        insert account;
        effectiveAccountId = account.Id;

        WebStore webStore = new WebStore(Name = 'TestWebStore', SupportedLanguages = 'en_US', DefaultLanguage = 'en_US');
        insert webStore;
        webstoreId = webStore.Id;

        WebCart cart = new WebCart(Name = 'Cart', WebStoreId = webStore.Id, AccountId = account.Id);
        insert cart;
        cartId = cart.Id;

        System.debug('cartId: ' + cartId);

        CartDeliveryGroup cartDeliveryGroup = new CartDeliveryGroup(
            CartId = cart.Id,
            Name = 'Default Delivery',
            DeliverToState = 'MI',
            DeliverToCountry = 'USA'
        );
        insert cartDeliveryGroup;

        cartDeliveryGroupId = cartDeliveryGroup.Id;

        CartItem cartItem = new CartItem(
            CartId = cart.Id,
            Sku = 'SKU_Test1',
            Quantity = 3.0,
            Type = 'Product',
            Name = 'TestProduct',
            CartDeliveryGroupId = cartDeliveryGroup.Id,
            TotalPrice = 150,
            Product2Id = product1.Id
        );
        insert cartItem;

        List<ContactPointAddress> cpaList = new List<ContactPointAddress>();
        ContactPointAddress billingAddr = new ContactPointAddress(
            AddressType = 'Billing',
            Street = '2100 Woodward Ave',
            ParentId = effectiveAccountId,
            Name = 'Detroit IGHQ',
            City = 'Detroit',
            State = 'MI',
            PostalCode = '48201',
            Country = 'USA',
            IsDefault = true,
            IsPrimary = true
        );
        cpaList.add(billingAddr);

        ContactPointAddress shippingAddr = new ContactPointAddress(
            AddressType = 'Shipping',
            Street = '2100 Woodward Ave',
            ParentId = effectiveAccountId,
            Name = 'Detroit IGHQ',
            City = 'Detroit',
            State = 'MI',
            PostalCode = '48201',
            Country = 'USA',
            IsDefault = true,
            IsPrimary = true
        );
        cpaList.add(shippingAddr);

        insert (cpaList);

        shipToContactPointAddressId = cpaList.get(1).Id;
    }

    private static void setup2() {
        System.debug('begin setup2()');

        Product2 product = new Product2(Name = 'Shipping Charge for this delivery method', IsActive = true);

        insert product;

        Id pricebookId = Test.getStandardPricebookId();

        PricebookEntry pbe = new PricebookEntry(IsActive = true, UnitPrice = 50, Pricebook2Id = pricebookId, Product2Id = product.Id, UseStandardPrice = false);

        insert pbe;

        OrderDeliveryMethod defaultOrderDeliveryMethod = new OrderDeliveryMethod(
            Name = 'Order Delivery Method1',
            Carrier = 'DHL',
            isActive = true,
            ProductId = product.Id,
            ClassOfService = 'DHLND9'
        );
        insert (defaultOrderDeliveryMethod);

        deliveryMethodId = defaultOrderDeliveryMethod.Id;

        String shippingOptionProvider = 'DHLND9';
        String shippingOptionName = 'Next day 9am';
        Decimal shippingOptionRate = 39.99;

        CartDeliveryGroupMethod cartDeliveryGroupMethod = new CartDeliveryGroupMethod(
            CartDeliveryGroupId = cartDeliveryGroupId,
            DeliveryMethodId = deliveryMethodId,
            ExternalProvider = shippingOptionProvider,
            Name = shippingOptionName,
            ShippingFee = shippingOptionRate,
            WebCartId = cartId
        );
        insert (cartDeliveryGroupMethod);

        cartDeliveryGroupMethodId = cartDeliveryGroupMethod.Id;

        CartDeliveryGroup cartDeliveryGroup = [SELECT Id, DeliveryMethodId FROM CartDeliveryGroup WHERE Id = :cartDeliveryGroupId][0];
        cartDeliveryGroup.DeliveryMethodId = deliveryMethodId;
        update cartDeliveryGroup;
    }

    /*
        Test getting the addresses
    */
    @isTest
    static void testCode1() {
        setup();

        Test.startTest();

        // Get shipping addresses
        Map<String, Object> responseMap = B2B_CheckoutController.getAddressInfo(effectiveAccountId, true, false);

        // Get billing addresses
        Map<String, Object> responseMap2 = B2B_CheckoutController.getAddressInfo(effectiveAccountId, false, true);

        Test.stopTest();
    }

    /*
        Test getting the cart summary, where a delivery method has not been selected.
    */
    @isTest
    static void testCode2a() {
        setup();

        Test.startTest();

        // Test: execute the integration for the test cart ID.
        WebCart webCart = [SELECT Id FROM WebCart WHERE Name = 'Cart' LIMIT 1];

        List<CartItem> cartItemList = [SELECT Id FROM CartItem WHERE CartId = :webCart.Id];

        System.debug('cartItemList size = ' + cartItemList.size());

        List<CartDeliveryGroup> cdgList = [SELECT Id FROM CartDeliveryGroup WHERE CartId = :webCart.Id];

        System.debug('cartItemList size = ' + cartItemList.size());

        // Get cart summary
        Map<String, Object> responseMap = B2B_CheckoutController.getCartSummary(effectiveAccountId, webstoreId, cartId, true, false);

        Test.stopTest();
    }

    /*
        Test getting the cart summary, where a delivery method has been selected.
    */
    @isTest
    static void testCode2b() {
        setup();

        // Additional setup to associate a cart delivery group method with the cart delivery group.
        setup2();

        Test.startTest();

        // Get cart summary
        Map<String, Object> responseMap = B2B_CheckoutController.getCartSummary(effectiveAccountId, webstoreId, cartId, true, false);

        Test.stopTest();
    }

    /*
        Test getting the delivery methods
    */
    @isTest
    static void testCode3() {
        setup();

        Test.startTest();

        // Get delivery methods
        Map<String, Object> responseMap = B2B_CheckoutController.fetchDeliveryMethods(cartId);

        Test.stopTest();
    }

    /*
        Set the cart delivery method.
    */
    @isTest
    static void testCode4() {
        setup();

        // Additional setup to associate a cart delivery group method with the cart delivery group.
        setup2();

        Test.startTest();

        // Set the cart delivery group to the selected delivery method.
        Map<String, Object> responseMap = B2B_CheckoutController.setCartItemDeliveryGroup(cartDeliveryGroupMethodId, deliveryMethodId, cartId);

        Test.stopTest();
    }

    /*
        Update the cart delivery group record with the selected ship to address (contact point address record).
    */
    @isTest
    static void testCode5() {
        setup();

        // Additional setup to associate a cart delivery group method with the cart delivery group.
        setup2();

        Test.startTest();

        // Set the cart delivery group to the selected delivery method.
        Map<String, Object> responseMap = B2B_CheckoutController.setCartDeliveryGroupShipToAddress(shipToContactPointAddressId, cartId);

        Test.stopTest();
    }

    /*
        Fetch the init values with an existing cart
    */
    @isTest
    static void testCode6a() {
        setup();

        String communityId = null;

        Test.startTest();

        // Get the init info with an existing cart
        Map<String, Object> responseMap = B2B_CheckoutController.fetchInitValues(communityId, effectiveAccountId, cartId);

        Test.stopTest();
    }

    /*
        Fetch the init values with no cart
    */
    @isTest
    static void testCode6b() {
        setup();

        String communityId = null;

        Test.startTest();

        // Get the init info with an existing cart
        Map<String, Object> responseMap = B2B_CheckoutController.fetchInitValues(communityId, effectiveAccountId, null);

        Test.stopTest();
    }

    /*
        Work the util methods
    */
    @isTest
    static void testCode7() {
        Map<String, Object> responseMap = new Map<String, Object>();

        B2B_CheckoutUtil.addMessage(new B2B_CheckoutUtil.Message('Error', 'Some error message', B2B_CheckoutUtil.ERROR), null, responseMap);
        B2B_CheckoutUtil.addMessage(new B2B_CheckoutUtil.Message('Error', 'Some error message', B2B_CheckoutUtil.ERROR), 0, responseMap);

        B2B_CheckoutUtil.addMessage(new B2B_CheckoutUtil.Message('Error', 'Some error message', B2B_CheckoutUtil.ERROR, true), 0, responseMap);
    }

    @isTest
    static void testFetchDefaultDeliveryMethod() {
        setup();
        setup2();
        Map<String, Object> obj = B2B_CheckoutController.fetchDefaultDeliveryMethod(cartId);
        System.debug(obj);
    }

    @isTest
    static void testUpdateCartItemDeliveryGroup() {
        setup();
        setup2();
        B2B_CheckoutController.updateCartItemDeliveryGroup(cartDeliveryGroupMethodId, deliveryMethodId, cartId);
    }

    @isTest
    static void testFetchCartDeliveryGroupAddress() {
        setup();
        Map<String, Object> response = B2B_CheckoutController.fetchCartDeliveryGroupAddress(cartId);
    }

    /*
        Test for getting the Account Info
    */
    @isTest
    static void testGetAccountInfos() {
        setup();

        Test.startTest();
        // Get Account Info
        Account accountRecord = B2B_CheckoutController.getAccountInfos(effectiveAccountId);
        Test.stopTest();
        System.assertNotEquals(null, accountRecord, 'Account info not fetched');
    }

    /*
        Test order creation 
    */
    @isTest
    static void testCreateOrder() {
        setup();

        List<WebCart> cartList = [SELECT Id FROM WebCart];
        List<CartItem> cartItemList = [SELECT Id, Product2Id FROM CartItem WHERE CartId IN :cartList];
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();
        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartList[0].Id;
        cartItem.productId = cartItemList[0].Product2Id;
        cartItem.Quantity = '1';

        ConnectApi.CartItemResult cartItemResult = new ConnectApi.CartItemResult();
        cartItemResult.cartItem = cartItem;

        ConnectApi.CartSummary mockCartSummary = new ConnectApi.CartSummary();
        mockCartSummary.cartId = cartList[0].Id;

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>{ cartItemResult };
        mockCartItemCollection.cartSummary = mockCartSummary;
        stub.mockedResponseByMethod.put('getCartItems', mockCartItemCollection);
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        //BS-1245 : Added 'USD' as input parameter
        B2B_CheckoutController.createOrder(
            webstoreId,
            effectiveAccountId,
            cartId,
            null,
            100,
            'CreatedDateDesc',
            shipToContactPointAddressId,
            'test',
            false,
            'USD'
        );

        List<Order> orderList = [SELECT Id, B2B_PO_Number__c FROM Order WHERE AccountId = :effectiveAccountId];
        System.assertNotEquals(true, orderList.isEmpty(), 'Order Not got created');
    }
    /*
        Test order Item creation 
    */
    @isTest
    static void testCreateOrderItem() {
        setup();

        Id orderRecordTypeId = Schema.SObjectType.Order.getRecordTypeInfosByName().get(Bfl_Constant.B2B_ORDER_RECORDTYPE).getRecordTypeId();
        List<WebCart> cartList = [SELECT Id FROM WebCart];
        List<CartItem> cartItemList = [SELECT Id, Product2Id FROM CartItem WHERE CartId IN :cartList];
        Order orderObject = new Order();
        orderObject.AccountId = effectiveAccountId;
        orderObject.Status = Bfl_Constant.ORDER_STATUS_DRAFT;
        orderObject.OrderedDate = Datetime.now();
        orderObject.EffectiveDate = Date.today();
        orderObject.RecordTypeId = orderRecordTypeId;
        orderObject.Order_Source__c = Bfl_Constant.ORDER_SOURCE_B2B_SHOP;
        insert orderObject;

        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();
        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartList[0].Id;
        cartItem.productId = cartItemList[0].Product2Id;
        cartItem.Quantity = '1';

        ConnectApi.CartItemResult cartItemResult = new ConnectApi.CartItemResult();
        cartItemResult.cartItem = cartItem;

        ConnectApi.CartSummary mockCartSummary = new ConnectApi.CartSummary();
        mockCartSummary.cartId = cartList[0].Id;

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>{ cartItemResult };
        mockCartItemCollection.cartSummary = mockCartSummary;
        stub.mockedResponseByMethod.put('getCartItems', mockCartItemCollection);
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        B2B_CheckoutController.createOrderItems(
            webstoreId,
            effectiveAccountId,
            cartId,
            null,
            100,
            'CreatedDateDesc',
            shipToContactPointAddressId,
            'test',
            orderObject
        );

        List<OrderItem> orderItemList = [SELECT Id FROM OrderItem WHERE OrderId = :orderObject.Id];
        System.assertNotEquals(true, orderItemList.isEmpty(), 'Order Item Not got created');
    }

    /*
        Test order creation 
    */
    @isTest
    static void testCreateShOrder() {
        setup();

        List<WebCart> cartList = [SELECT Id FROM WebCart];
        List<CartItem> cartItemList = [SELECT Id, Product2Id FROM CartItem WHERE CartId IN :cartList];
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();
        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartList[0].Id;
        cartItem.productId = cartItemList[0].Product2Id;
        cartItem.Quantity = '1';

        ConnectApi.CartItemResult cartItemResult = new ConnectApi.CartItemResult();
        cartItemResult.cartItem = cartItem;

        ConnectApi.CartSummary mockCartSummary = new ConnectApi.CartSummary();
        mockCartSummary.cartId = cartList[0].Id;

        ConnectApi.CartItemCollection mockCartItemCollection = new ConnectApi.CartItemCollection();
        mockCartItemCollection.cartItems = new List<ConnectApi.CartItemResult>{ cartItemResult };
        mockCartItemCollection.cartSummary = mockCartSummary;
        stub.mockedResponseByMethod.put('getCartItems', mockCartItemCollection);
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        //BS-1245 : Added 'USD' as input parameter
        B2B_CheckoutController.createOrder(
            webstoreId,
            effectiveAccountId,
            cartId,
            null,
            100,
            'CreatedDateDesc',
            shipToContactPointAddressId,
            'test',
            true,
            'USD'
        );

        List<Order> orderList = [SELECT Id, B2B_PO_Number__c FROM Order WHERE AccountId = :effectiveAccountId];
        System.assertNotEquals(true, orderList.isEmpty(), 'Order Not got created');
    }

    /*
        Test order creation 
    */
    @isTest
    static void testCreateRxOrder() {
        setup();

        List<WebCart> cartList = [SELECT Id FROM WebCart];
        List<CartItem> cartItemList = [SELECT Id, Product2Id, B2B_Type__c FROM CartItem WHERE CartId IN :cartList];
        CartItem cartItemToUpdate = new cartItem();
        cartItemToUpdate.Id = cartItemList[0].Id;
        cartItemToUpdate.B2B_Type__c = 'RX Glazing';
        cartItemToUpdate.Quantity = 1; //BS-1409
        update cartItemToUpdate;
        B2B_CommerceMockProvider stub = new B2B_CommerceMockProvider();
        ConnectApi.CartItem cartItem = new ConnectApi.CartItem();
        cartItem.cartItemId = cartItemList[0].Id;
        cartItem.cartId = cartList[0].Id;
        cartItem.productId = cartItemList[0].Product2Id;
        cartItem.Quantity = '1'; //BS-1409

        B2B_CartItems__c customCartItem = new B2B_CartItems__c(
            B2B_Parent_Cart_Item__c = cartItemList[0].Id,
            B2B_List_Price__c = 1,
            B2B_Unit_Price__c = 1,
            B2B_Quantity__c = 1,
            B2B_Product__c = cartItemList[0].Product2Id
        );
        insert customCartItem;

        List<B2B_Lens_Configurator__c> lensConfigList = B2B_TestDataFactory.createRecordsForLensConfigurator();
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
        B2B_CartController.commerceProxy = (B2B_CommerceProxy) Test.createStub(B2B_CommerceProxy.class, stub);

        //BS-1245 : Added 'USD' as input parameter
        B2B_CheckoutController.createOrder(
            webstoreId,
            effectiveAccountId,
            cartId,
            null,
            100,
            'CreatedDateDesc',
            shipToContactPointAddressId,
            'test',
            true,
            'USD'
        );

        List<Order> orderList = [SELECT Id, B2B_PO_Number__c FROM Order WHERE AccountId = :effectiveAccountId];
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT B2B_Status__c FROM B2B_Lens_Configurator__c LIMIT 1]; //BS-1724
        System.assertNotEquals(true, orderList.isEmpty(), 'Order Not got created');
        System.assertEquals('Closed', lensConfiguratorList[0].B2B_Status__c, 'Lens Configurator Not got closed'); //BS-1724
    }
}
