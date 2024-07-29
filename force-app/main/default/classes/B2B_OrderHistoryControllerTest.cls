@isTest
public with sharing class B2B_OrderHistoryControllerTest {
    @TestSetup
    static void setup() {
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
        }
    }

    @isTest
    static void getOrderHistoryListTest() {
        User u = B2B_TestDataFactory.createInsertCommerceUser();
        Account acc = [SELECT Id FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123'];

        System.runAs(u) {
            Order order = B2B_TestDataFactory.createOrderForOrderHistory(acc, '');
            insert order;

            Test.startTest();
            List<Order> orders = B2B_OrderHistoryController.getOrderHistoryList('90', '20', '', '', '');
            Test.stopTest();

            System.assertEquals(
                0,
                orders.size(),
                'The method should return Zero order because created order status is Order Sent which we did not show on order history.'
            );
        }
    }

    @isTest
    static void getOrderReferencesByIdTest() {
        User u = B2B_TestDataFactory.createInsertCommerceUser();
        Account acc = [SELECT Id FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123'];

        System.runAs(u) {
            Order order = B2B_TestDataFactory.createOrderForOrderHistory(acc, '');
            insert order;

            B2B_Order_Reference__c ref1 = B2B_TestDataFactory.createOrderReferenceForOrderHistory(order);
            insert ref1;

            Test.startTest();
            List<B2B_Order_Reference__c> refs = B2B_OrderHistoryController.getOrderReferencesById(order.Id);
            Test.stopTest();

            System.assertEquals(1, refs.size(), 'the method should return the created order.');
        }
    }

    @isTest
    static void createOrderDocumentRequestTest() {
        User u = B2B_TestDataFactory.createInsertCommerceUser();
        Account acc = [SELECT Id FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123'];

        System.runAs(u) {
            Order order = B2B_TestDataFactory.createOrderForOrderHistory(acc, '');
            insert order;

            B2B_Order_Reference__c ref1 = B2B_TestDataFactory.createOrderReferenceForOrderHistory(order);
            insert ref1;

            Test.startTest();
            B2B_OrderHistoryController.createOrderDocumentRequest(order.Id, 'Invoice');
            B2B_OrderHistoryController.createOrderDocumentRequest(order.Id, 'Delivery Note');
            B2B_OrderHistoryController.createOrderDocumentRequest(order.Id, 'Order Confirmation');
            Test.stopTest();

            List<B2B_Order_Document_Request__c> orderDocRequestList = [SELECT B2B_Document_Request_Type__c, B2b_Order__c FROM B2B_Order_Document_Request__c];
            System.assertEquals(3, orderDocRequestList.size(), 'the method should create 3 records');
            System.assertEquals(order.Id, orderDocRequestList[0].B2b_Order__c, 'passed order ID and lookup order Id should be same');
        }
    }
    //this method will test if method is returning the emailId or not
    @isTest
    static void getAccountEmailTest() {
        User u = B2B_TestDataFactory.createInsertCommerceUser();
        System.runAs(u) {
            Test.startTest();
            String emailId = B2B_OrderHistoryController.getAccountEmail();
            Test.stopTest();

            System.assertNotEquals(null, emailId, 'passed order ID and lookup order Id should be same');
        }
    }

    //this method will check if the method is throwing an exception or not
    @isTest
    static void createOrderDocumentRequestWithWrongOrderIDTest() {
        try {
            Test.startTest();
            B2B_OrderHistoryController.createOrderDocumentRequest('test', 'Invoice');
            Test.stopTest();

            List<B2B_Order_Document_Request__c> orderDocRequestList = [SELECT B2B_Document_Request_Type__c, B2b_Order__c FROM B2B_Order_Document_Request__c];
            System.assertNotEquals(1, orderDocRequestList.size(), 'document request got created fetched');
        } catch (Exception e) {
            System.assertEquals('Script-thrown exception', e.getMessage(), 'It should throw exception');
        }
    }

    //this method will test if the class method is throwing an exception or not
    @isTest
    static void getOrderHistoryListWithWrongTimeframeTest() {
        try {
            Test.startTest();
            List<Order> orderList = B2B_OrderHistoryController.getOrderHistoryList('9o', '', '', '', '');
            Test.stopTest();

            System.assertNotEquals(1, orderList.size(), 'order fetched');
        } catch (Exception e) {
            System.assertEquals('Script-thrown exception', e.getMessage(), 'It should throw exception');
        }
    }

    //This method will check if the order is getting fetched.
    @isTest
    static void getOrderDetailsTest() {
        User u = B2B_TestDataFactory.createInsertCommerceUser();
        Account acc = [SELECT Id FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123'];

        System.runAs(u) {
            Order order = B2B_TestDataFactory.createOrderForOrderHistory(acc, '');
            insert order;

            Test.startTest();
            Order orderRecord = B2B_OrderHistoryController.getOrderDetails(order.Id);
            Test.stopTest();

            System.assertNotEquals(null, orderRecord, 'the method should return a Order');
        }
    }
    //This method will check if the order items are getting fetched.
    @isTest
    static void getOrderItemDetailsTest() {
        User u = B2B_TestDataFactory.createInsertCommerceUser();
        Account acc = [SELECT Id FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123'];
        System.runAs(u) {
            Product2 product1 = B2B_TestDataFactory.createProductForOrderHistory();
            insert product1;

            Id pricebookId = Test.getStandardPricebookId();

            PricebookEntry priceBookEntry = B2B_TestDataFactory.createPriceBookEntryForOrderHistory(product1, pricebookId);

            insert priceBookEntry;

            Order order = B2B_TestDataFactory.createOrderForOrderHistory(acc, '');
            insert order;

            OrderItem orderItem = B2B_TestDataFactory.createOrderItemForOrderHistory(order, product1);
            insert orderItem;

            Test.startTest();
            List<OrderItem> orderItemList = B2B_OrderHistoryController.getOrderItemDetails(order.Id);
            Test.stopTest();

            System.assertEquals(1, orderItemList.size(), 'the method should return list of order Items');
        }
    }
    //BS-1096
    @isTest
    static void getOrderHistoryListForRxLensOnlyTest() {
        User u = B2B_TestDataFactory.createInsertCommerceUser();
        Account acc = [SELECT Id FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123'];
        List<Order> orders = new List<Order>();

        System.runAs(u) {
            Order order = B2B_TestDataFactory.createOrderForOrderHistory(acc, B2B_Constants.RX_GLAZING);
            insert order;

            Test.startTest();
            orders = B2B_OrderHistoryController.getOrderHistoryList('90', '', '', B2B_Constants.RX_GLAZING, 'Lens Only');
            Test.stopTest();
        }
        System.assertEquals(
            0,
            orders.size(),
            'The method should return Zero order because created order status is Order Sent which we did not show on order history.'
        );
    }
    //BS-1096
    @isTest
    static void getOrderHistoryListForRxTest() {
        User u = B2B_TestDataFactory.createInsertCommerceUser();
        Account acc = [SELECT Id FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123'];
        List<Order> orders = new List<Order>();

        System.runAs(u) {
            Product2 product1 = B2B_TestDataFactory.createProductForOrderHistory();
            insert product1;

            Id pricebookId = Test.getStandardPricebookId();

            PricebookEntry priceBookEntry = B2B_TestDataFactory.createPriceBookEntryForOrderHistory(product1, pricebookId);

            insert priceBookEntry;

            Order order = B2B_TestDataFactory.createOrderForOrderHistory(acc, B2B_Constants.RX_GLAZING);
            insert order;

            OrderItem orderItem = B2B_TestDataFactory.createOrderItemForOrderHistory(order, product1);
            insert orderItem;

            order.Status = '20';
            update order;

            Test.startTest();
            orders = B2B_OrderHistoryController.getOrderHistoryList('90', '', '', B2B_Constants.RX_GLAZING, B2B_Constants.ALL);
            Test.stopTest();
        }
        System.assertEquals(1, orders.size(), 'the method should return the created order.');
    }

    @isTest
    static void getLensSelectionScreenDataTest() {
        User userObj = B2B_TestDataFactory.createInsertCommerceUser();
        Account acc = [SELECT Id FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123'];
        Order orderObj = new Order();

        System.runAs(userObj) {
            Product2 product1 = B2B_TestDataFactory.createProductForOrderHistory();
            insert product1;

            Id pricebookId = Test.getStandardPricebookId();

            PricebookEntry priceBookEntry = B2B_TestDataFactory.createPriceBookEntryForOrderHistory(product1, pricebookId);

            insert priceBookEntry;

            Order order = B2B_TestDataFactory.createOrderForOrderHistory(acc, B2B_Constants.RX_GLAZING);
            insert order;

            OrderItem orderItem = B2B_TestDataFactory.createOrderItemForOrderHistory(order, product1);
            insert orderItem;

            order.Status = '20';
            update order;
            Test.startTest();
            orderObj = B2B_OrderHistoryController.getLensSelectionScreenData(order.Id);
            Test.stopTest();
        }
        System.assertNotEquals(null, orderObj, 'the method should return the created order.');
    }

    @isTest
    public static void getCountryDateFormatTest() {
        List<String> countryCodeList = new List<String>{
            'ATOE',
            'BEBE',
            'BRBR',
            'CNCN',
            'DKDK',
            'FIFI',
            'FRFR',
            'DEDE',
            'GBGB',
            'HKHK',
            'ITIT',
            'NONO',
            'ESES',
            'SESE',
            'CHCH',
            'USUS',
            '',
            null,
            'randomString'
        };
        List<String> countryCodeResultList = new List<String>();

        Test.startTest();
        for (Integer i = 0; i < countryCodeList.size(); i = i + 1) {
            countryCodeResultList.add(B2B_OrderHistoryController.getCountryDateFormat(countryCodeList[i]));
        }
        Test.stopTest();

        for (Integer index = 0; index < countryCodeResultList.size(); index = index + 1) {
            if (index < 16) {
                System.assertEquals(false, String.isBlank(countryCodeResultList[index]), 'Value should not be null');
            } else {
                System.assertEquals(true, String.isBlank(countryCodeResultList[index]), 'Value should be null');
            }
        }
    }

    //BS-1064
    @isTest
    static void createCloneConfiguratorForSameBrandTest() {
        User u = B2B_TestDataFactory.createInsertCommerceUser();
        B2B_Lens_Configurator__c clonedLensConfigurator;
        Account acc = [SELECT Id FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123' OR Id = :u.AccountId LIMIT 1];
        Order order = B2B_TestDataFactory.createOrderForOrderHistory(acc, B2B_Constants.RX_GLAZING);
        insert order;
        B2B_Lens_Configurator__c lensConfigurator = [SELECT Id, B2B_Order__c FROM B2B_Lens_Configurator__c LIMIT 1];

        lensConfigurator.B2B_Order__c = order.Id;
        update lensConfigurator;
        Test.startTest();
        clonedLensConfigurator = B2B_OrderHistoryController.createCloneConfiguratorForVSRX(order.Id, true, 'Vision Sensation');
        Test.stopTest();
        System.assertNotEquals(null, clonedLensConfigurator, 'lens configurator should be created');
    }

    //BS-1064
    @isTest
    static void createCloneConfiguratorForDifferentBrandTest() {
        User u = B2B_TestDataFactory.createInsertCommerceUser();
        B2B_Lens_Configurator__c clonedLensConfigurator;
        Account acc = [SELECT Id FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123' OR Id = :u.AccountId LIMIT 1];
        Order order = B2B_TestDataFactory.createOrderForOrderHistory(acc, B2B_Constants.RX_GLAZING);
        insert order;
        B2B_Lens_Configurator__c lensConfigurator = [SELECT Id, B2B_Order__c FROM B2B_Lens_Configurator__c LIMIT 1];

        lensConfigurator.B2B_Order__c = order.Id;
        update lensConfigurator;
        Test.startTest();
        clonedLensConfigurator = B2B_OrderHistoryController.createCloneConfiguratorForVSRX(order.Id, false, 'Vision Sensation');
        Test.stopTest();
        System.assertNotEquals(null, clonedLensConfigurator, 'lens configurator should be created');
    }

    //BS-2343
    @isTest
    static void getLensConfigIdTest() {
        User u = B2B_TestDataFactory.createInsertCommerceUser();
        Id lensConfiguratorId;
        Account acc = [SELECT Id FROM Account WHERE k_ARIS_Account_ID__c = 'DEDE_123' OR Id = :u.AccountId LIMIT 1];
        Order order = B2B_TestDataFactory.createOrderForOrderHistory(acc, B2B_Constants.RX_GLAZING);
        insert order;
        B2B_Lens_Configurator__c lensConfigurator = [SELECT Id, B2B_Order__c FROM B2B_Lens_Configurator__c LIMIT 1];

        lensConfigurator.B2B_Order__c = order.Id;
        update lensConfigurator;
        Test.startTest();
        lensConfiguratorId = B2B_OrderHistoryController.getLensConfigId(order.Id);
        Test.stopTest();
        System.assertNotEquals(null, lensConfiguratorId, 'lens configurator id should be fetched');
    }
}
