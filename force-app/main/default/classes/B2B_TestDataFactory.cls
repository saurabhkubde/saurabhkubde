@isTest
public with sharing class B2B_TestDataFactory {
    /**
     * @description Product & Catalog related
     */
    public static String productTestSku = 'TestSKU';
    public static final String PRODUCT_TEST_CATALOG = 'Test Catalog';
    public static final String PRODUCT_TEST_PARENT = 'TestParent';
    public static final String PRODUCT_TEST_DESCRIPTION = 'Test Product Description';
    public static final String PRODUCT_PARENT_TYPE = 'BASE';
    /**
     *  @description Address related
     */
    public static final String BILL_STREET = 'Parent Billing Address';
    public static final String BILL_CITY = 'Test city';
    public static final String BILL_COUNTRY = 'Germany';
    public static final String BILL_POSTAL_CODE = '22222';

    public static final String SHIP_STREET = 'Parent Shipping Address';
    public static final String SHIP_CITY = 'Test City';
    public static final String SHIP_COUNTRY = 'Germany';
    public static final String SHIP_POSTAL_CODE = '67890';

    /**
     * @description Buyer account related
     */
    public static final String BUYER_STATUS = 'Active';

    /**
     * @description Cart related
     */
    public static final String CARD_NAME = 'Test Cart';

    /**
     * @description profile related
     */
    public static final String B2B_COMMERCE_USER_PROFILE = 'B2B Commerce User Silhouette';
    public static final String READ_ONLY = 'Read Only';

    public static Map<String, String> setupCommerceStoreFront() {
        WebStore webStr = B2B_TestDataFactory.createWebStore();
        insert webStr;

        Map<String, String> catalogCatMap = B2B_TestDataFactory.createInsertCatalogAndCategory();
        BuyerGroup buyGrp = B2B_TestDataFactory.createInsertBuyerGroupForStore(webStr.ID);
        CommerceEntitlementPolicy commerceEntPolicy = B2B_TestDataFactory.createInsertEntitlements(buyGrp.ID);

        List<Product2> products = B2B_TestDataFactory.createInsertProducts(1, null);
        Product2 product = products[0];

        CommerceEntitlementProduct entitlementProduct = new CommerceEntitlementProduct(PolicyId = commerceEntPolicy.Id, ProductId = product.Id);
        insert entitlementProduct;

        B2B_TestDataFactory.createInsertPriceBookAndEntries(product.Id, buyGrp.Id);

        Account acc = B2B_TestDataFactory.createTestAccount();
        insert acc;
        B2B_TestDataFactory.createInsertBuyerAccount(acc);

        Contact con = B2B_TestDataFactory.createInsertDefaultContact(acc);
        B2B_TestDataFactory.createInsertBuyerGroupMemberForAccount(acc.Id, buyGrp.Id);

        String communityUserId;
        // Running (admin/deployment) user needs a role to setup community users
        System.assertNotEquals(
            null,
            UserInfo.getUserRoleId(),
            'Running user (deployment/admin) has no role assigned.' +
            'This is required for Community User creation during TestSetup.' +
            'Please assign a role to your user before running these tests.'
        );
        System.runAs(new User(Id = UserInfo.getUserId())) {
            User commUser = B2B_TestDataFactory.createInsertCommerceUser(con.Id);
            communityUserId = commUser.Id;
        }
        Map<String, String> testData = new Map<String, String>{
            'productId' => product.Id,
            'webStoreName' => webStr.Name,
            'webStoreId' => webStr.Id,
            'accountId' => acc.Id,
            'contactId' => con.Id,
            'userId' => communityUserId,
            'buyerGroupId' => buyGrp.Id
        };
        testData.putAll(catalogCatMap);
        System.debug(LoggingLevel.INFO, 'Generated testdata:' + testData);

        return testData;
    }

    public static WebStore createWebStore() {
        WebStore webStr = new WebStore(Name = 'Silhouette B2B Store', PricingStrategy = 'LowestPrice');
        return webStr;
    }
    /**
     * @description create a commerce eligable user
     */
    public static User createInsertCommerceUser(ID contactId) {
        Id profileId = [SELECT Id FROM Profile WHERE Name = :B2B_COMMERCE_USER_PROFILE LIMIT 1].Id;
        String organizationId = UserInfo.getOrganizationId();
        String dateString = String.valueof(Datetime.now()).replace(' ', '').replace(':', '').replace('-', '');
        String uniqueName = organizationId + dateString + Integer.valueOf(Math.rint(Math.random() * 1000000));
        User commUser = new User(
            firstname = 'Silhouette',
            lastName = 'TestUSer',
            email = uniqueName + '@test' + organizationId + '.org',
            Username = uniqueName + '@test' + organizationId + '.org',
            EmailEncodingKey = 'ISO-8859-1',
            Alias = uniqueName.substring(18, 23),
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            LanguageLocaleKey = 'en_US',
            CommunityNickname = 'commNick' + dateString,
            IsActive = true,
            ProfileId = profileId,
            ContactId = contactId,
            PortalRole = 'Manager'
        );
        insert commUser;

        return commUser;
    }

    public static User createInsertCommerceUser() {
        User communityUser;
        Account a = createInsertTestAccount();
        Contact c = createInsertDefaultContact(a);
        // Running (admin/deployment) user needs a role to setup community users
        System.assertNotEquals(
            null,
            UserInfo.getUserRoleId(),
            'Running user (deployment/admin) has no role assigned.' +
            'This is required for Community User creation during TestSetup.' +
            'Please assign a role to your user before running these tests.'
        );
        System.runAs(new User(Id = UserInfo.getUserId())) {
            communityUser = createInsertCommerceUser(c.Id);
        }
        return communityUser;
    }

    /**
     * @description creates a catalog and a category
     */
    public static Map<String, String> createInsertCatalogAndCategory() {
        ProductCatalog prodCatalog = new ProductCatalog();
        prodCatalog.Name = PRODUCT_TEST_CATALOG;
        insert prodCatalog;

        ProductCategory parentCategory = new ProductCategory();
        parentCategory.Name = 'ParentCategory';
        parentCategory.CatalogId = prodCatalog.Id;
        parentCategory.B2B_Category_External_ID__c = 'test';
        insert parentCategory;

        ProductCategory childCategory = new ProductCategory();
        childCategory.Name = 'ChildCategory';
        childCategory.IsNavigational = true;
        childCategory.ParentCategoryId = parentCategory.Id;
        childCategory.CatalogId = prodCatalog.Id;
        insert childCategory;

        return new Map<String, String>{
            'catalogId' => prodCatalog.Id,
            'parentCategoryId' => parentCategory.Id,
            'childCategoryId' => childCategory.Id,
            'categoryExternalId' => parentCategory.B2B_Category_External_ID__c
        };
    }

    /**
     * @description Creates a simple product (DML)
     * @param size - amount of products to create
     * @param productType - Type of product, either null or base for parent
     * @return Product2
     */
    public static List<Product2> createInsertProducts(Integer size, String productType) {
        List<Product2> testProducts = createProducts(size, productType);
        insert testProducts;
        return testProducts;
    }

    /**
     * @description Creates a simple product (no DML)
     * @param size - amount of products to create
     * @param productType - Type of product, either null or base for parent
     * @return Product2
     */
    public static List<Product2> createProducts(Integer size, String productType) {
        return createProducts(size, productType, false);
    }

    public static List<Product2> createProducts(Integer size, String productType, Boolean mockIds) {
        List<Product2> testProducts = new List<Product2>();
        for (Integer i = 0; i < size; i++) {
            Product2 product = new Product2(
                Name = productTestSku + i,
                Description = PRODUCT_TEST_DESCRIPTION,
                Type = productType,
                StockKeepingUnit = productTestSku + i,
                IsActive = true,
                B2B_Model__c = 'e0018', //BS-898
                B2B_EE_Size__c = '52', //BS-898
                B2B_Temple_Length__c = '140', //BS-898
                B2B_Salesconcept_unique__c = 'E018', //BS-898
                B2B_Schneider_SKU__c = 'TEST0001', //BS-898
                B2B_Color_Number__c = '4000', //BS-898
                B2B_Picture_Link__c = 'http.test.image' //BS-1269
            );
            if (mockIds) {
                product.Id = mockRecordId(Product2.getSObjectType(), i);
            }
            testProducts.add(product);
        }
        return testProducts;
    }

    /**
     * @description Returns a test Account.
     * @return Account
     */
    public static Account createTestAccount() {
        Account testAcc = new Account();
        testAcc.Name = 'Silhouette Account';
        testAcc.k_Email__c = 'test@example.com';
        testAcc.k_ARIS_Account_ID__c = 'DEDE_123';
        testAcc.BillingStreet = BILL_STREET;
        testAcc.BillingCity = BILL_CITY;
        testAcc.BillingCountry = BILL_COUNTRY;
        testAcc.BillingPostalCode = BILL_POSTAL_CODE;

        testAcc.ShippingStreet = SHIP_STREET;
        testAcc.ShippingCity = SHIP_CITY;
        testAcc.ShippingCountry = SHIP_COUNTRY;
        testAcc.ShippingPostalCode = SHIP_POSTAL_CODE;
        testAcc.k_B2B_Shop_Username__c = 'tstUser';

        return testAcc;
    }

    /**
     * @description Returns a test Account.
     * @return Account
     */
    public static Account createInsertTestAccount() {
        Account testAcc = createTestAccount();
        insert testAcc;
        return testAcc;
    }

    /**
     * @description Returns a test buyer Account
     * @param associatedAccount - associatedAccount for the buyer account
     * @return BuyerAccount
     */
    public static BuyerAccount createInsertBuyerAccount(Account associatedAccount) {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        BuyerAccount bA = new BuyerAccount();
        bA.CommerceType = 'Buyer';
        bA.Name = 'Test Buyer Account';
        bA.BuyerStatus = BUYER_STATUS;
        bA.BuyerID = associatedAccount.Id;
        bA.IsActive = true;
        insert bA;
        return bA;
    }

    /**
     * @description associates an account with the buyergroup to create a new member
     * @param accountId
     * @param buyerGroupId
     * @return BuyerGroupMember
     */
    public static BuyerGroupMember createInsertBuyerGroupMemberForAccount(Id accountId, Id buyerGroupId) {
        BuyerGroupMember bgMember = new BuyerGroupMember();
        bgMember.BuyerId = accountId;
        bgMember.BuyerGroupId = buyerGroupId;
        insert bgMember;
        return bgMember;
    }

    /**
     * @description Creates and insert a buyer group and the reference to the store
     * @param webStoreId Store Id to reference
     */
    public static BuyerGroup createInsertBuyerGroupForStore(Id webStoreId) {
        BuyerGroup bg = new BuyerGroup();
        bg.Name = 'Test Buyer Group';
        insert bg;

        WebStoreBuyerGroup webStrBuyerGrp = new WebStoreBuyerGroup();
        webStrBuyerGrp.WebStoreId = webStoreId;
        webStrBuyerGrp.BuyerGroupId = bg.Id;
        insert webStrBuyerGrp;
        return bg;
    }

    /**
     * @description Creates and insert entitlements for store by the given buyerGroup
     * @param buyerGroupId
     * @returns CommerceEntitlementPolicy
     */
    public static CommerceEntitlementPolicy createInsertEntitlements(Id buyerGroupId) {
        CommerceEntitlementPolicy commerceEntPolicy = new CommerceEntitlementPolicy(
            Name = 'Test Policy',
            CanViewProduct = true,
            CanViewPrice = true,
            IsActive = true
        );
        insert commerceEntPolicy;

        CommerceEntitlementBuyerGroup commerceEntBuyerGrp = new CommerceEntitlementBuyerGroup(PolicyId = commerceEntPolicy.Id, BuyerGroupId = buyerGroupId);
        insert commerceEntBuyerGrp;
        return commerceEntPolicy;
    }

    /**
     * @description Creates a test contact (DML)
     * @param account - account for contact
     * @return Contact
     */
    public static Contact createDefaultContact(Account account) {
        Contact contact = new Contact(
            AccountId = account.Id,
            Salutation = 'Mrs.',
            FirstName = 'Default Contact',
            LastName = 'Default Contact',
            Email = 'defaultcontact@domain.com',
            MailingStreet = 'testMailingStreet',
            MailingPostalCode = '90210',
            MailingCity = 'testMailingCity'
        );
        return contact;
    }
    /**
     * @description Creates a test contact
     * @param account - account for contact
     * @return Contact
     */
    public static Contact createInsertDefaultContact(Account account) {
        Contact contact = createDefaultContact(account);
        insert contact;
        return contact;
    }

    /**
     * @description creates store relevant pices and entries for the given buyergroup
     * @param productId
     * @param buyerGroupId
     */
    public static void createInsertPriceBookAndEntries(Id productId, Id buyerGroupId) {
        Pricebook2 standardPricebook = new Pricebook2(Id = Test.getStandardPricebookId(), IsActive = true);
        update standardPricebook;

        standardPricebook = [SELECT Id, IsStandard FROM Pricebook2 WHERE Id = :standardPricebook.Id];
        String rxPriceBookName = System.Label.B2B_VS_RX_EVIL_EYE_PRICEBOOK;

        Pricebook2 newPricebook = new Pricebook2(Name = rxPriceBookName, IsActive = true);
        insert newPricebook;

        BuyerGroupPricebook buyerGrpPricebook = new BuyerGroupPricebook();
        buyerGrpPricebook.BuyerGroupId = buyerGroupId;
        buyerGrpPricebook.Pricebook2Id = newPricebook.Id;
        buyerGrpPricebook.IsActive = true;
        insert buyerGrpPricebook;

        PricebookEntry pbeStandard = new PricebookEntry(Pricebook2Id = standardPricebook.Id, Product2Id = productId, UnitPrice = 100, IsActive = true);
        insert pbeStandard;

        PricebookEntry pbe1 = new PricebookEntry(Pricebook2Id = newPricebook.Id, Product2Id = productId, UnitPrice = 100, IsActive = true);
        insert pbe1;
    }

    /**
     * @description Creates a cart summary
     * @param webStoreID - ID of the store to create the cart for
     * @param accountId - Account to create the cart for
     * @param cartItems - Items to add to the cart
     * @return ConnectApi.CartSummary
     */
    public static ConnectApi.CartSummary createInsertCartSummary(String webStoreID, String accountId, List<ConnectApi.BatchInput> cartItems) {
        ConnectApi.CartInput cartInput = new ConnectApi.CartInput();
        cartInput.name = CARD_NAME;
        ConnectApi.CartSummary cartSummary = ConnectApi.CommerceCart.createCart(webstoreID, cartInput);
        return cartSummary;
    }

    /**
     * @description Creates a cartItem to add to a cart
     * @param productId - ID of the product
     * @param quantity - Quantity to add the product in
     * @return ConnectApi.CartItemInput
     */
    public static ConnectApi.CartItemInput createCartItemInput(String productId, String quantity) {
        ConnectApi.CartItemInput cartInput = new ConnectApi.CartItemInput();
        cartInput.productId = productId;
        cartInput.quantity = quantity;
        cartInput.type = ConnectApi.CartItemType.PRODUCT;
        return cartInput;
    }

    /**
     * @description Creates a new CartDeliveryGroup for a given cart (DML)
     * @param Id cartId
     **/
    public static CartDeliveryGroup createInsertCartDeliveryGroup(Id cartId) {
        CartDeliveryGroup cartDelGrp = new CartDeliveryGroup();
        cartDelGrp.CartId = cartId;
        cartDelGrp.DeliverToPostalCode = '80636';
        cartDelGrp.DeliverToCity = 'Munich';
        cartDelGrp.DeliverToStreet = 'Erika-mann-str 123';
        cartDelGrp.DeliverToName = 'Erik';
        cartDelGrp.name = 'Default Delivery';
        insert cartDelGrp;
        return cartDelGrp;
    }

    /**
     * @description Return a active cart without items (no DML)
     * @param String webstoreId
     * @param String accountId
     * @return WebCart
     **/
    public static WebCart createActiveEmptyCart(String webstoreId, String accountId) {
        WebCart newCart = new WebCart();
        newCart.WebStoreId = webstoreId;
        newCart.Name = 'TestCart';
        newCart.AccountId = accountId;
        newCart.Status = 'Active';
        newCart.type = 'Cart';
        newCart.IsRepricingNeeded = false;
        newCart.BillingCity = 'Munich';
        newCart.BillingStreet = 'Erika-mann-str 123';

        return newCart;
    }

    /**
     * @description Return an active checkout session
     * @param String cartId
     * @return CheckoutSession
     **/
    public static CartCheckoutSession createActiveCartCheckoutSession(String cartId, String orderId) {
        CartCheckoutSession checkoutSession = new CartCheckoutSession();
        checkoutSession.WebCartId = cartId;
        checkoutSession.OrderId = orderId;
        checkoutSession.IsArchived = false;
        checkoutSession.Name = 'DummySession';
        checkoutSession.State = 'Start';
        return checkoutSession;
    }

    /**
     * @description Return sample ContactPointAddress
     * @param String accountId
     * @param Boolean isDefault
     * @return ContactPointAddress
     **/
    public static ContactPointAddress createShippingAddress(String accountId, Boolean isDefault) {
        ContactPointAddress cpa = new ContactPointAddress();
        cpa.Name = 'Testaddress';
        cpa.City = SHIP_CITY;
        cpa.Street = SHIP_STREET;
        cpa.PostalCode = BILL_POSTAL_CODE;
        cpa.Country = SHIP_COUNTRY;
        cpa.AddressType = 'Shipping';
        cpa.ParentId = accountId;
        cpa.isDefault = isDefault ? isDefault : false;

        return cpa;
    }

    /**
     * @description Determine or create a product to be used as shipping charge (cart item)
     * @return Id
     */
    private static Id getOrCreateDefaultShippingChargeProduct2Id() {
        String shippingChargeProductCode = 'CommerceShippingCharge';
        List<Product2> shippingChargeProducts = [SELECT Id, Name FROM Product2 WHERE ProductCode = :shippingChargeProductCode];
        if (shippingChargeProducts.isEmpty()) {
            Product2 shippingChargeProduct = new Product2(isActive = true, Name = shippingChargeProductCode, ProductCode = shippingChargeProductCode);
            insert (shippingChargeProduct);
            return shippingChargeProduct.Id;
        } else {
            return shippingChargeProducts[0].Id;
        }
    }

    /**
     * @description Return an order delivery method
     * @return OrderDeliveryMethod
     **/
    public static OrderDeliveryMethod createOrderDeliveryMethod() {
        OrderDeliveryMethod defaultOrderDeliveryMethod = new OrderDeliveryMethod(
            Name = 'Test Standard Shipmment',
            Carrier = 'DummyCarrier',
            ClassOfService = 'Standard',
            //ProductId = getOrCreateDefaultShippingChargeProduct2Id(),
            isActive = true
        );
        return defaultOrderDeliveryMethod;
    }

    /**
     * @description Return a mocked Record Id
     * @param SObjectType sobjectType
     * @return String
     **/
    public static String mockRecordId(SObjectType sobjectType) {
        return mockRecordId(sobjectType, 0);
    }

    public static String mockRecordId(SObjectType sobjectType, Integer startingNumber) {
        return sobjectType.getDescribe().getKeyPrefix() + '0'.repeat(15 - String.valueOf(startingNumber).length()) + startingNumber;
    }

    public static ConnectApi.ProductDetail mockProductDetail(Product2 product) {
        ConnectApi.ProductDetail productDetails = new ConnectApi.ProductDetail();
        productDetails.id = product.Id;

        // Create the fields Map
        productDetails.fields = new Map<String, String>{
            'StockKeepingUnit' => product.StockKeepingUnit,
            'Name' => product.Name,
            'Description' => product.Description,
            'B2B_Availability_JSON__c' => product.B2B_Availability_JSON__c,
            'B2B_Sparepart_Type__c' => 'Schmuck' //Added as part of BS-530
        };

        // Create the product entitlement object
        ConnectApi.ProductEntitlement pe = new ConnectApi.ProductEntitlement();
        pe.canViewPrice = true;

        productDetails.entitlement = pe;

        ConnectApi.ProductMedia pm = new ConnectApi.ProductMedia();
        pm.id = '1';
        pm.alternateText = 'Sample image';
        pm.mediaType = ConnectApi.ProductMediaType.Image;
        pm.sortOrder = 1;
        pm.thumbnailUrl = null;
        pm.title = 'Sample image';
        pm.url = '/image/path/picture.png';

        List<ConnectApi.ProductMedia> mediaItems = new List<ConnectApi.ProductMedia>();
        mediaItems.add(pm);

        ConnectApi.ProductMediaGroup pmg = new ConnectApi.ProductMediaGroup();
        pmg.developerName = 'productDetailImage';
        pmg.id = '1';
        pmg.mediaItems = mediaItems;

        List<ConnectApi.ProductMediaGroup> mediaGroups = new List<ConnectApi.ProductMediaGroup>();
        mediaGroups.add(pmg);

        return productDetails;
    }

    public static ConnectApi.PricingResult mockProductPricing(List<Product2> productList) {
        ConnectApi.PricingResult result = new ConnectApi.PricingResult();

        List<ConnectApi.PricingResultLineItem> pricingLineItemResults = new List<ConnectApi.PricingResultLineItem>();

        for (Product2 product : productList) {
            ConnectApi.PricingResultLineItem pricingResultLineItem = new ConnectApi.PricingResultLineItem();

            pricingResultLineItem.ListPrice = String.valueOf(150);
            pricingResultLineItem.UnitPrice = String.valueOf(100);
            pricingResultLineItem.pricebookEntryId = mockRecordId(PriceBookEntry.getSObjectType());
            String product2Id = product.Id != null ? product.Id.to15() : mockRecordId(Product2.getSObjectType());
            pricingResultLineItem.productId = product2Id;
            pricingResultLineItem.error = null;
            pricingResultLineItem.success = true;

            pricingLineItemResults.add(pricingResultLineItem);
        }

        result.error = null;
        result.success = true;
        result.pricingLineItemResults = pricingLineItemResults;

        return result;
    }

    /**
     * @description Returns a test product image
     * @param productId - product id for the product image
     * @return B2B_Product_Image__c
     */
    public static B2B_Product_Image__c createProductImage(String productId) {
        B2B_Product_Image__c productImage = new B2B_Product_Image__c();
        productImage.B2B_Product__c = productId;
        productImage.B2B_Image_Order__c = 0;
        productImage.B2B_Image_Title__c = 'Test title';
        productImage.B2B_Image_URL__c = 'Test url';
        productImage.B2B_Image_Alt_Text__c = 'Test alt text';
        productImage.B2B_External_Id__c = 'Test external id';
        productImage.D2C_Active__c = true;
        productImage.D2C_Available_In__c = 'B2B';
        productImage.D2C_Product_Image_Type__c = 'Product Image';

        return productImage;
    }

    /**
     * @description Returns commerce product link record
     * @param sourceId - product id for the source image
     * @param targetId - product id for the target image
     * @param relationType - type of products relation
     * @return B2B_Commerce_Product_Link__c
     */
    public static B2B_Commerce_Product_Link__c createProductLink(String sourceId, String targetId, String relationType) {
        B2B_Commerce_Product_Link__c productLink = new B2B_Commerce_Product_Link__c();
        productLink.B2B_Source_Product__c = sourceId;
        productLink.B2B_Target_Product__c = targetId;
        productLink.B2B_Type__c = relationType;

        return productLink;
    }

    /**
     * @description Returns a test product media
     * @param productId - product id for the product media
     * @return B2B_Product_Media__c
     */
    public static B2B_Product_Media__c createProductMedia(String productId) {
        B2B_Product_Media__c productMedia = new B2B_Product_Media__c();
        productMedia.B2B_Product__c = productId;
        productMedia.B2B_Sort_Order__c = 0;
        productMedia.Name = 'Test title';
        productMedia.B2B_Media_URL__c = 'Test url';
        productMedia.B2B_Product_Media_Type__c = 'Catalogue Page';

        return productMedia;
    }

    /**
     * @description Returns a user record
     * @param lastName - lastName of the user
     * @param firstName - firstName of the user
     * @param mailAddress - mailAddress of the user
     * @param profileId - profileId of the user
     * @return User
     */
    public static User createUser(String lastName, String firstName, String mailAddress, String profileId) {
        return new User(
            lastName = lastName,
            firstName = firstName,
            Email = mailAddress,
            profileId = profileId,
            Username = mailAddress,
            Alias = mailAddress.substring(0, 6),
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US'
        );
    }

    /**
     * @description Returns a List of account
     * @param numberOfAccounts - number of account record to be created
     * @param name - name of the account
     * @param stage - stage of the account
     * @param isInsert - boolean value to determine if the record to be inserted or not
     * @return List<Account>
     */
    public static List<Account> createAccounts(Integer numberOfAccounts, String name, String stage, Boolean isInsert) {
        List<Account> accountList = new List<Account>();
        for (Integer i = 0; i < numberOfAccounts; i++) {
            accountList.add(new Account(name = name + '' + i, k_Stage__c = stage, k_ARIS_Account_ID__c = 'DEDE_1234')); //BS-1647
        }
        if (isInsert && !accountList.isEmpty()) {
            insert accountList;
        }
        return accountList;
    }
    /**
     * @description Returns a List of account
     * @param numberOfAccounts - number of account record to be created
     * @param name - name of the account
     * @param isInsert - boolean value to determine if the record to be inserted or not
     * @return List<Account>
     */
    public static List<Account> createAccountswithUniqueARISId(Integer numberOfAccounts, String name, Boolean isInsert) {
        List<Account> accountList = new List<Account>();
        for (Integer i = 0; i < numberOfAccounts; i++) {
            accountList.add(new Account(name = name + i, k_ARIS_Account_ID__c = 'DEDE_223' + i));
        }
        if (isInsert && !accountList.isEmpty()) {
            insert accountList;
        }
        return accountList;
    }

    /**
     * @description Returns a contact record
     * @param salutation - salutation of the contact
     * @param lastName - lastName of the contact
     * @param firstName - firstName of the contact
     * @param accID - AccountId of the contact
     * @param TBD - boolean value for k_ToBeDeleted__c field
     * @return Contact
     */
    public static Contact createContact(String salutation, String lastName, String firstName, ID accID, Boolean TBD) {
        return new Contact(
            Salutation = salutation,
            Lastname = lastName,
            FirstName = firstName,
            AccountId = accID,
            k_ToBeDeleted__c = TBD,
            Email = 'no@email.com'
        );
    }

    /**
     * @description Returns a List of tasks
     * @param numberOfTasks - number of task records to be created
     * @param subject - subject of the tasks
     * @param status - status of the tasks
     * @param whatId - whatId of the tasks
     * @param whoId - whoId of the tasks
     * @param isInsert - boolean value to determine if the records to be inserted or not
     * @return List<Task>
     */
    public static List<Task> createTasks(Integer numberOfTasks, String subject, String status, Id whatId, Id whoId, Boolean isInsert) {
        List<Task> taskList = new List<Task>();
        for (Integer i = 0; i < numberOfTasks; i++) {
            taskList.add(new Task(Subject = subject, Status = status, WhatId = whatId, WhoId = whoId));
        }
        if (isInsert && !taskList.isEmpty()) {
            insert taskList;
        }
        return taskList;
    }
    /**
     * @description Returns List of CartItem
     * @param numberOfRecords - number of records to be returned
     * @param cart - carts for which cartItems needs to be created
     * @param storeResponse -
     * @param cartDelGrp - Cart delivery to be associated with the cart item.
     * @return List<CartItems>
     */
    public static List<CartItem> createCartItem(Integer numberOfRecords, WebCart cart, Map<String, String> storeResponse, CartDeliveryGroup cartDelGrp) {
        List<CartItem> testCartItemsList = new List<CartItem>();
        for (Integer index = 0; index < numberOfRecords; index++) {
            CartItem item = new CartItem();
            item.Name = 'TestProduct' + index;
            item.CartId = cart.Id;
            if (storeResponse.isEmpty() == false) {
                item.Product2Id = storeResponse.get('productId');
            }
            item.CartDeliveryGroupId = cartDelGrp.Id;
            item.Type = 'Product';
            item.Sku = 'Product-000001';
            item.Quantity = 1;
            item.ListPrice = 100.00;
            item.TotalListPrice = 100.00;
            item.SalesPrice = 100.00;
            item.TotalLineAmount = 100.00;
            item.AdjustmentAmount = 0;
            item.TotalPrice = 100.00;
            testCartItemsList.add(item);
        }
        if (testCartItemsList.isEmpty() == false) {
            return testCartItemsList;
        } else {
            return null;
        }
    }

    /* @description Returns a List of contract
     * @param numberOfContract - number of Contract records to be created
     * @param - accountId - accountId of the contract
     * @return List<Contract>
     */
    public static List<Contract> createContract(Integer numberOfContract, String accountId) {
        List<Contract> contractList = new List<Contract>();
        for (Integer i = 0; i < numberOfContract; i++) {
            Contract contractObj = new Contract();
            contractObj.AccountId = accountId;
            contractObj.Status = 'Draft';
            contractObj.CurrencyIsoCode = 'EUR';
            contractObj.StartDate = System.today();
            contractObj.ContractTerm = 5;
            contractList.add(contractObj);
        }
        return contractList;
    }

    /**
     * @description Returns a List of Orders
     * @param numberOfOrders - number of order records to be created
     * @param - recordTypeId - recordType of the order
     * @param source - order source value
     * @param accountId - accountId of the order
     * @param contractId - contractId of the order
     * @return List<Order>
     */
    public static List<Order> createOrder(Integer numberOfOrders, String recordTypeId, String source, String accountId, String contractId) {
        List<Order> orderList = new List<Order>();
        for (Integer i = 0; i < numberOfOrders; i++) {
            Order orderObject = new Order();
            orderObject.RecordTypeId = recordTypeId;
            orderObject.AccountId = accountId;
            orderObject.ContractId = contractId;
            orderObject.EffectiveDate = System.Today();
            orderObject.Status = 'Draft';
            orderObject.Order_Source__c = source;
            orderList.add(orderObject);
        }
        return orderList;
    }

    /**
     * @description create a ReadOnly user which (Does not have commerce permissions)
     */
    public static User createInsertReadOnlyUser() {
        Id profileId = [SELECT Id FROM Profile WHERE Name = :READ_ONLY LIMIT 1].Id;
        String organizationId = UserInfo.getOrganizationId();
        String dateString = String.valueof(Datetime.now()).replace(' ', '').replace(':', '').replace('-', '');
        String uniqueName = organizationId + dateString + Integer.valueOf(Math.rint(Math.random() * 1000000));
        User commUser = new User(
            firstname = 'Read Only',
            lastName = 'TestUSer',
            email = uniqueName + '@test' + organizationId + '.org',
            Username = uniqueName + '@test' + organizationId + '.org',
            EmailEncodingKey = 'ISO-8859-1',
            Alias = uniqueName.substring(18, 23),
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            LanguageLocaleKey = 'en_US',
            CommunityNickname = 'commNick' + dateString,
            IsActive = true,
            ProfileId = profileId,
            PortalRole = 'Manager',
            Phone = '1234567890'
        );
        insert commUser;

        return commUser;
    }
    /**
     * @description Returns a List List<B2B_Translation__c>
     * @return List<B2B_Translation__c>
     */
    public static List<B2B_Translation__c> createB2B_Translation() {
        List<B2B_Translation__c> translationList = new List<B2B_Translation__c>();

        B2B_Translation__c translationObjectCustomField = new B2B_Translation__c();
        translationObjectCustomField.B2B_Type__c = 'Field Label';
        translationObjectCustomField.B2B_Field_Name__c = 'k_Account_No__c';
        translationObjectCustomField.B2B_Translation__c = 'Kontonummer';
        translationObjectCustomField.B2B_Language__c = 'de';
        translationObjectCustomField.B2B_Object_Name__c = 'Account';
        translationList.add(translationObjectCustomField);

        B2B_Translation__c translationObjectCustomField1 = new B2B_Translation__c();
        translationObjectCustomField1.B2B_Type__c = 'Field Label';
        translationObjectCustomField1.B2B_Field_Name__c = 'k_Account_Type__c';
        translationObjectCustomField1.B2B_Translation__c = 'Kontonummer';
        translationObjectCustomField1.B2B_Language__c = 'de';
        translationObjectCustomField1.B2B_Object_Name__c = 'Account';
        translationList.add(translationObjectCustomField1);

        B2B_Translation__c translationObjectCStandardPicklist = new B2B_Translation__c();
        translationObjectCStandardPicklist.B2B_Field_Name__c = 'Industry';
        translationObjectCStandardPicklist.B2B_Language__c = 'de';
        translationObjectCStandardPicklist.B2B_Object_Name__c = 'Account';
        translationObjectCStandardPicklist.B2B_Picklist_Value__c = 'Engineering';
        translationObjectCStandardPicklist.B2B_Translation__c = 'Ingenieurwesen';
        translationObjectCStandardPicklist.B2B_Type__c = 'Picklist Value';
        translationList.add(translationObjectCStandardPicklist);

        B2B_Translation__c translationObjectCStandardPicklist1 = new B2B_Translation__c();
        translationObjectCStandardPicklist1.B2B_Field_Name__c = 'Ownership';
        translationObjectCStandardPicklist1.B2B_Language__c = 'de';
        translationObjectCStandardPicklist1.B2B_Object_Name__c = 'Account';
        translationObjectCStandardPicklist1.B2B_Picklist_Value__c = 'Private';
        translationObjectCStandardPicklist1.B2B_Translation__c = 'Private-de';
        translationObjectCStandardPicklist1.B2B_Type__c = 'Picklist Value';
        translationList.add(translationObjectCStandardPicklist1);

        B2B_Translation__c translationObjectCStandardPicklist2 = new B2B_Translation__c();
        translationObjectCStandardPicklist2.B2B_Field_Name__c = 'Ownership';
        translationObjectCStandardPicklist2.B2B_Language__c = 'de';
        translationObjectCStandardPicklist2.B2B_Object_Name__c = 'Account';
        translationObjectCStandardPicklist2.B2B_Picklist_Value__c = 'Public';
        translationObjectCStandardPicklist2.B2B_Translation__c = 'Public-de';
        translationObjectCStandardPicklist2.B2B_Type__c = 'Picklist Value';
        translationList.add(translationObjectCStandardPicklist2);

        B2B_Translation__c translationObjectCustomPicklist3 = new B2B_Translation__c();
        translationObjectCustomPicklist3.B2B_Field_Name__c = 'Brand__c';
        translationObjectCustomPicklist3.B2B_Language__c = 'de';
        translationObjectCustomPicklist3.B2B_Object_Name__c = 'Account';
        translationObjectCustomPicklist3.B2B_Picklist_Value__c = 'Silhouette';
        translationObjectCustomPicklist3.B2B_Type__c = 'Picklist Value';
        translationObjectCustomPicklist3.B2B_Translation__c = 'silhouette';
        translationList.add(translationObjectCustomPicklist3);

        B2B_Translation__c translationObjectCustomPicklist4 = new B2B_Translation__c();
        translationObjectCustomPicklist3.B2B_Field_Name__c = 'Brand__c';
        translationObjectCustomPicklist3.B2B_Language__c = 'de';
        translationObjectCustomPicklist3.B2B_Object_Name__c = 'Account';
        translationObjectCustomPicklist3.B2B_Picklist_Value__c = 'NEUBAU';
        translationObjectCustomPicklist3.B2B_Type__c = 'Picklist Value';
        translationObjectCustomPicklist3.B2B_Translation__c = 'NEUBAU-de';
        translationList.add(translationObjectCustomPicklist4);

        B2B_Translation__c translationObjectCustomPicklistSecond = new B2B_Translation__c();
        translationObjectCustomPicklist3.B2B_Field_Name__c = 'k_EE_VF__c';
        translationObjectCustomPicklist3.B2B_Language__c = 'de';
        translationObjectCustomPicklist3.B2B_Object_Name__c = 'Account';
        translationObjectCustomPicklist3.B2B_Picklist_Value__c = '1 time p.a.';
        translationObjectCustomPicklist3.B2B_Type__c = 'Picklist Value';
        translationObjectCustomPicklist3.B2B_Translation__c = '1 time p.a.-de';
        translationList.add(translationObjectCustomPicklistSecond);

        B2B_Translation__c translationObjectCustomPicklistSecond1 = new B2B_Translation__c();
        translationObjectCustomPicklist3.B2B_Field_Name__c = 'k_EE_VF__c';
        translationObjectCustomPicklist3.B2B_Language__c = 'de';
        translationObjectCustomPicklist3.B2B_Object_Name__c = 'Account';
        translationObjectCustomPicklist3.B2B_Picklist_Value__c = '2 times p.a.';
        translationObjectCustomPicklist3.B2B_Type__c = 'Picklist Value';
        translationObjectCustomPicklist3.B2B_Translation__c = '2 time p.a.-de';
        translationList.add(translationObjectCustomPicklistSecond1);

        B2B_Translation__c translationObjectCustomPicklist5 = new B2B_Translation__c();
        translationObjectCustomPicklist4.B2B_Field_Name__c = 'B2B_Type__c';
        translationObjectCustomPicklist4.B2B_Language__c = 'de';
        translationObjectCustomPicklist4.B2B_Object_Name__c = 'B2B_Translation__c';
        translationObjectCustomPicklist4.B2B_Picklist_Value__c = 'Field Label';
        translationObjectCustomPicklist4.B2B_Type__c = 'Picklist Value';
        translationObjectCustomPicklist4.B2B_Translation__c = 'Field Label';
        translationList.add(translationObjectCustomPicklist5);

        B2B_Translation__c translationObjectCustomPicklist6 = new B2B_Translation__c();
        translationObjectCustomPicklist5.B2B_Field_Name__c = 'B2B_Type__c';
        translationObjectCustomPicklist5.B2B_Language__c = 'de';
        translationObjectCustomPicklist5.B2B_Object_Name__c = 'B2B_Translation__c';
        translationObjectCustomPicklist5.B2B_Picklist_Value__c = 'Picklist Value';
        translationObjectCustomPicklist5.B2B_Type__c = 'Picklist Value';
        translationObjectCustomPicklist5.B2B_Translation__c = 'Picklist Value 1';
        translationList.add(translationObjectCustomPicklist6);

        B2B_Translation__c translationFieldNameEmpty = new B2B_Translation__c();
        translationFieldNameEmpty.B2B_Field_Name__c = '';
        translationFieldNameEmpty.B2B_Language__c = 'de';
        translationFieldNameEmpty.B2B_Object_Name__c = 'B2B_Translation__c';
        translationFieldNameEmpty.B2B_Picklist_Value__c = 'Picklist Value';
        translationFieldNameEmpty.B2B_Type__c = 'Picklist Value';
        translationFieldNameEmpty.B2B_Translation__c = 'Picklist Value 1';
        translationList.add(translationFieldNameEmpty);

        B2B_Translation__c translationLanguageEmpty = new B2B_Translation__c();
        translationLanguageEmpty.B2B_Field_Name__c = 'B2B_Type__c';
        translationLanguageEmpty.B2B_Language__c = '';
        translationLanguageEmpty.B2B_Object_Name__c = 'B2B_Translation__c';
        translationLanguageEmpty.B2B_Picklist_Value__c = 'Picklist Value';
        translationLanguageEmpty.B2B_Type__c = 'Picklist Value';
        translationLanguageEmpty.B2B_Translation__c = 'Picklist Value 1';
        translationList.add(translationLanguageEmpty);

        B2B_Translation__c translationObjectEmpty = new B2B_Translation__c();
        translationObjectEmpty.B2B_Field_Name__c = 'B2B_Type__c';
        translationObjectEmpty.B2B_Language__c = 'de';
        translationObjectEmpty.B2B_Object_Name__c = '';
        translationObjectEmpty.B2B_Picklist_Value__c = 'Picklist Value';
        translationObjectEmpty.B2B_Type__c = 'Picklist Value';
        translationObjectEmpty.B2B_Translation__c = 'Picklist Value 1';
        translationList.add(translationObjectEmpty);

        B2B_Translation__c translationPicklistValueEmpty = new B2B_Translation__c();
        translationPicklistValueEmpty.B2B_Field_Name__c = 'B2B_Type__c';
        translationPicklistValueEmpty.B2B_Language__c = 'de';
        translationPicklistValueEmpty.B2B_Object_Name__c = 'B2B_Translation__c';
        translationPicklistValueEmpty.B2B_Picklist_Value__c = '';
        translationPicklistValueEmpty.B2B_Type__c = 'Picklist Value';
        translationPicklistValueEmpty.B2B_Translation__c = 'Picklist Value 1';
        translationList.add(translationPicklistValueEmpty);

        B2B_Translation__c translationTypeFieldEmpty = new B2B_Translation__c();
        translationTypeFieldEmpty.B2B_Field_Name__c = 'B2B_Type__c';
        translationTypeFieldEmpty.B2B_Language__c = 'de';
        translationTypeFieldEmpty.B2B_Object_Name__c = 'B2B_Translation__c';
        translationTypeFieldEmpty.B2B_Picklist_Value__c = 'Picklist Value';
        translationTypeFieldEmpty.B2B_Type__c = '';
        translationTypeFieldEmpty.B2B_Translation__c = 'Picklist Value 1';
        translationList.add(translationTypeFieldEmpty);

        B2B_Translation__c translationEmpty = new B2B_Translation__c();
        translationEmpty.B2B_Field_Name__c = 'B2B_Type__c';
        translationEmpty.B2B_Language__c = 'de';
        translationEmpty.B2B_Object_Name__c = 'B2B_Translation__c';
        translationEmpty.B2B_Picklist_Value__c = 'Picklist Value';
        translationEmpty.B2B_Type__c = 'Picklist Value';
        translationEmpty.B2B_Translation__c = '';
        translationList.add(translationEmpty);

        B2B_Translation__c translationEmpty2 = new B2B_Translation__c();
        translationEmpty2.B2B_Field_Name__c = 'B2B_Type__c';
        translationEmpty2.B2B_Language__c = 'de';
        translationEmpty2.B2B_Object_Name__c = 'B2B_Translation__c';
        translationEmpty2.B2B_Picklist_Value__c = 'Picklist Value';
        translationEmpty2.B2B_Type__c = 'Field Label';
        translationEmpty2.B2B_Translation__c = '';
        translationList.add(translationEmpty2);

        B2B_Translation__c translationFieldNameEmpty2 = new B2B_Translation__c();
        translationFieldNameEmpty2.B2B_Field_Name__c = '';
        translationFieldNameEmpty2.B2B_Language__c = 'de';
        translationFieldNameEmpty2.B2B_Object_Name__c = 'B2B_Translation__c';
        translationFieldNameEmpty2.B2B_Picklist_Value__c = 'Picklist Value';
        translationFieldNameEmpty2.B2B_Type__c = 'Field Label';
        translationFieldNameEmpty2.B2B_Translation__c = 'Picklist Value 1';
        translationList.add(translationFieldNameEmpty2);

        B2B_Translation__c translationObjectNameIncorrect = new B2B_Translation__c();
        translationObjectNameIncorrect.B2B_Field_Name__c = 'B2B_Type__c';
        translationObjectNameIncorrect.B2B_Language__c = 'de';
        translationObjectNameIncorrect.B2B_Object_Name__c = 'B2B_';
        translationObjectNameIncorrect.B2B_Picklist_Value__c = 'Picklist Value';
        translationObjectNameIncorrect.B2B_Type__c = 'Picklist Value';
        translationObjectNameIncorrect.B2B_Translation__c = 'Picklist Value 1';
        translationList.add(translationObjectNameIncorrect);

        B2B_Translation__c translationFieldNameIncorrect = new B2B_Translation__c();
        translationFieldNameIncorrect.B2B_Field_Name__c = 'B2B_';
        translationFieldNameIncorrect.B2B_Language__c = 'de';
        translationFieldNameIncorrect.B2B_Object_Name__c = 'B2B_Translation__c';
        translationFieldNameIncorrect.B2B_Picklist_Value__c = 'Picklist Value';
        translationFieldNameIncorrect.B2B_Type__c = 'Field Label';
        translationFieldNameIncorrect.B2B_Translation__c = 'Picklist Value 1';
        translationList.add(translationFieldNameIncorrect);

        B2B_Translation__c translationPicklistValueFieldNameIncorrect = new B2B_Translation__c();
        translationPicklistValueFieldNameIncorrect.B2B_Field_Name__c = 'B2B_';
        translationPicklistValueFieldNameIncorrect.B2B_Language__c = 'de';
        translationPicklistValueFieldNameIncorrect.B2B_Object_Name__c = 'B2B_Translation__c';
        translationPicklistValueFieldNameIncorrect.B2B_Picklist_Value__c = 'Picklist Value';
        translationPicklistValueFieldNameIncorrect.B2B_Type__c = 'Picklist Value';
        translationPicklistValueFieldNameIncorrect.B2B_Translation__c = 'Picklist Value 1';
        translationList.add(translationPicklistValueFieldNameIncorrect);

        return translationList;
    }

    /**
     * @description Returns a List List<B2B_Translation__c>
     * @return List<B2B_Translation__c>
     */
    public static List<B2B_Translation__c> createB2B_TranslationWrongData() {
        List<B2B_Translation__c> translationList = new List<B2B_Translation__c>();

        B2B_Translation__c translationFieldNameIncorrect = new B2B_Translation__c();
        translationFieldNameIncorrect.B2B_Field_Name__c = 'B2B_';
        translationFieldNameIncorrect.B2B_Language__c = 'de';
        translationFieldNameIncorrect.B2B_Object_Name__c = 'B2B_Translation__c';
        translationFieldNameIncorrect.B2B_Picklist_Value__c = 'Picklist Value';
        translationFieldNameIncorrect.B2B_Type__c = 'Field Label';
        translationFieldNameIncorrect.B2B_Translation__c = 'Picklist Value 1';
        translationList.add(translationFieldNameIncorrect);

        B2B_Translation__c translationPicklistValueFieldNameIncorrect = new B2B_Translation__c();
        translationPicklistValueFieldNameIncorrect.B2B_Field_Name__c = 'B2B_';
        translationPicklistValueFieldNameIncorrect.B2B_Language__c = 'de';
        translationPicklistValueFieldNameIncorrect.B2B_Object_Name__c = 'B2B_Translation__c';
        translationPicklistValueFieldNameIncorrect.B2B_Picklist_Value__c = 'Picklist Value';
        translationPicklistValueFieldNameIncorrect.B2B_Type__c = 'Picklist Value';
        translationPicklistValueFieldNameIncorrect.B2B_Translation__c = 'Picklist Value 1';
        translationList.add(translationPicklistValueFieldNameIncorrect);

        return translationList;
    }

    /**
     * @description Returns a mock response for readMetadata of StandardValueSet.
     * @return B2B_MetadataService.readStandardValueSetTranslationResponse_element
     */
    public static B2B_MetadataService.readStandardValueSetTranslationResponse_element createStandardValueSetTranslationResponse() {
        B2B_MetadataService.readStandardValueSetTranslationResponse_element readResponseStandardValueSetTranslationObj = new B2B_MetadataService.readStandardValueSetTranslationResponse_element();

        B2B_MetadataService.ReadStandardValueSetTranslationResult readStandardValueSetTranslationResult = new B2B_MetadataService.ReadStandardValueSetTranslationResult();

        B2B_MetadataService.StandardValueSetTranslation standardValueSetTranslationObj = new B2B_MetadataService.StandardValueSetTranslation();
        standardValueSetTranslationObj.fullName = 'Industry-de';
        B2B_MetadataService.ValueTranslation valueTranslationObj = new B2B_MetadataService.ValueTranslation();
        valueTranslationObj.masterLabel = 'Engineering';
        valueTranslationObj.translation = 'Ingenieurwesen 1';

        B2B_MetadataService.StandardValueSetTranslation standardValueSetTranslationObj1 = new B2B_MetadataService.StandardValueSetTranslation();
        standardValueSetTranslationObj1.fullName = 'AccountOwnership-de';
        B2B_MetadataService.ValueTranslation valueTranslationObj1 = new B2B_MetadataService.ValueTranslation();
        valueTranslationObj1.masterLabel = 'Private';
        valueTranslationObj1.translation = 'Private-un';
        standardValueSetTranslationObj.valueTranslation = new List<B2B_MetadataService.ValueTranslation>{ valueTranslationObj };

        standardValueSetTranslationObj1.valueTranslation = new List<B2B_MetadataService.ValueTranslation>{ valueTranslationObj1 };

        readStandardValueSetTranslationResult.records = new List<B2B_MetadataService.StandardValueSetTranslation>{
            standardValueSetTranslationObj,
            standardValueSetTranslationObj1
        };

        readResponseStandardValueSetTranslationObj.result = readStandardValueSetTranslationResult;
        return readResponseStandardValueSetTranslationObj;
    }

    /**
     * @description Returns a mock response for readMetadata of CustomObjectTransaltion.
     * @return B2B_MetadataService.readCustomObjectTranslationResponse_element
     */
    public static B2B_MetadataService.readCustomObjectTranslationResponse_element createCustomObjectTranslationResponse() {
        B2B_MetadataService.readCustomObjectTranslationResponse_element readResponseCustomObjectTranslationObj = new B2B_MetadataService.readCustomObjectTranslationResponse_element();
        B2B_MetadataService.ReadCustomObjectTranslationResult readResponseResult = new B2B_MetadataService.ReadCustomObjectTranslationResult();
        B2B_MetadataService.CustomObjectTranslation customObjTranslationObj = new B2B_MetadataService.CustomObjectTranslation();
        List<B2B_MetadataService.CustomFieldTranslation> fieldMetadataList = new List<B2B_MetadataService.CustomFieldTranslation>();
        customObjTranslationObj.fullName = 'Account-de';

        B2B_MetadataService.CustomFieldTranslation fieldMetadata1 = new B2B_MetadataService.CustomFieldTranslation();

        fieldMetadata1.label = 'Account #';
        fieldMetadata1.name = 'k_Account_No__c';
        fieldMetadataList.add(fieldMetadata1);
        B2B_MetadataService.CustomFieldTranslation fieldMetadata2 = new B2B_MetadataService.CustomFieldTranslation();

        fieldMetadata2.label = 'Brand';
        fieldMetadata2.name = 'Brand__c';

        B2B_MetadataService.PicklistValueTranslation picklistValues1 = new B2B_MetadataService.PicklistValueTranslation();
        picklistValues1.masterLabel = 'Silhouette';
        picklistValues1.translation = 'Silhouette-de';
        fieldMetadata2.picklistValues = new List<B2B_MetadataService.PicklistValueTranslation>{ picklistValues1 };

        fieldMetadataList.add(fieldMetadata2);

        customObjTranslationObj.fields = fieldMetadataList;
        readResponseResult.records = new List<B2B_MetadataService.CustomObjectTranslation>{ customObjTranslationObj };
        readResponseCustomObjectTranslationObj.result = readResponseResult;
        return readResponseCustomObjectTranslationObj;
    }

    //BS-443
    /**
     * @description create Product Category Product records related to products
     * @return list of Product Category Product records
     */
    public static List<ProductCategoryProduct> createProductCategoryProduct(Integer size, List<Product2> productList, String productCategoryId) {
        List<ProductCategoryProduct> productCategoryProductList = new List<ProductCategoryProduct>();
        for (Integer i = 0; i < size; i++) {
            ProductCategoryProduct productCategoryProductObj = new ProductCategoryProduct();
            productCategoryProductObj.ProductId = productList[i].Id;
            productCategoryProductObj.ProductCategoryId = productCategoryId;
            productCategoryProductList.add(productCategoryProductObj);
        }
        return productCategoryProductList;
    }

    /**
     * BS-708
     * This method is used to setup store front for VS-RX
     * @param buyerGroupType    :   buyer group type (Vision Sensation/ RX Glazing) if applicable
     */
    public static Map<String, String> setupCommerceStoreFrontForVS_RX(String buyerGroupType) {
        WebStore WebStore = B2B_TestDataFactory.createWebStore();
        insert WebStore;

        Map<String, String> catalogCatMap = B2B_TestDataFactory.createInsertCatalogAndCategory();
        BuyerGroup buyerGroup = B2B_TestDataFactory.createBuyerGroupForVS_RX(WebStore.ID, buyerGroupType);
        CommerceEntitlementPolicy commerceEntitlementPolicy = B2B_TestDataFactory.createInsertEntitlementsForVS_RX(buyerGroup.ID);

        List<Product2> products = B2B_TestDataFactory.createInsertProducts(1, null);
        Product2 product = products[0];

        CommerceEntitlementProduct entitlementProduct = new CommerceEntitlementProduct(PolicyId = commerceEntitlementPolicy.Id, ProductId = product.Id);
        insert entitlementProduct;

        B2B_TestDataFactory.createInsertPriceBookAndEntries(product.Id, buyerGroup.Id);

        List<Account> accountsList = B2B_TestDataFactory.createTestAccountForVS_RX(1);

        Account account = accountsList[0];
        B2B_TestDataFactory.createInsertBuyerAccountForVS_RX(account);

        Contact contact = B2B_TestDataFactory.createInsertDefaultContact(account);
        B2B_TestDataFactory.createInsertBuyerGroupMemberForAccount(account.Id, buyerGroup.Id);

        String communityUserId;
        // Running (admin/deployment) user needs a role to setup community users
        System.assertNotEquals(
            null,
            UserInfo.getUserRoleId(),
            'Running user (deployment/admin) has no role assigned.' +
            'This is required for Community User creation during TestSetup.' +
            'Please assign a role to your user before running these tests.'
        );
        System.runAs(new User(Id = UserInfo.getUserId())) {
            User commerceUser = B2B_TestDataFactory.createInsertCommerceUser(contact.Id);
            communityUserId = commerceUser.Id;
        }
        Map<String, String> testDataMappings = new Map<String, String>{
            'productId' => product.Id,
            'webStoreName' => WebStore.Name,
            'webStoreId' => WebStore.Id,
            'accountId' => account.Id,
            'contactId' => contact.Id,
            'userId' => communityUserId,
            'buyerGroupId' => buyerGroup.Id
        };
        testDataMappings.putAll(catalogCatMap);
        System.debug(LoggingLevel.INFO, 'Generated testDataMappings:' + testDataMappings);

        return testDataMappings;
    }

    /**
     * BS-708
     * @description Returns a test Account.
     * @return Account
     */
    public static List<Account> createTestAccountForVS_RX(Integer NumberOfAccountsToInsert) {
        List<Account> accountsToInsertList = new List<Account>();

        for (Integer i = 0; i < NumberOfAccountsToInsert; i++) {
            Account account = new Account();
            account.Name = 'Silhouette Account' + ' ' + i;
            account.k_Email__c = 'test@example.com';
            account.k_ARIS_Account_ID__c = 'DEDE_123';
            account.BillingStreet = BILL_STREET;
            account.BillingCity = BILL_CITY;
            account.BillingCountry = BILL_COUNTRY;
            account.BillingPostalCode = BILL_POSTAL_CODE;

            account.ShippingStreet = SHIP_STREET;
            account.ShippingCity = SHIP_CITY;
            account.ShippingCountry = SHIP_COUNTRY;
            account.ShippingPostalCode = SHIP_POSTAL_CODE;
            account.k_B2B_Shop_Username__c = 'tstUser';
            account.Store_Country__c = 'Germany';
            accountsToInsertList.add(account);
        }
        insert accountsToInsertList;

        if (accountsToInsertList.isEmpty() == false) {
            return accountsToInsertList;
        } else {
            return null;
        }
    }

    /**
     * BS-708
     * @description Returns a test buyer Account
     * @param associatedAccount - associatedAccount for the buyer account
     * @return BuyerAccount
     */
    public static BuyerAccount createInsertBuyerAccountForVS_RX(Account associatedAccount) {
        B2B_BuyerAccountTriggerHandler.skipTriggerExcecution = true;
        BuyerAccount buyerAccount = new BuyerAccount();
        buyerAccount.CommerceType = 'Buyer';
        buyerAccount.Name = 'Test Buyer Account';
        buyerAccount.BuyerStatus = BUYER_STATUS;
        buyerAccount.BuyerID = associatedAccount.Id;
        buyerAccount.IsActive = true;
        insert buyerAccount;
        return buyerAccount;
    }

    /**
     * BS-708
     * @description Creates and insert a buyer group and the reference to the store for VS RX
     * @param webStoreId        :   Store Id to reference
     * @param buyerGroupType    :   buyer group type (Vision Sensation/ RX Glazing) if applicable
     */
    public static BuyerGroup createBuyerGroupForVS_RX(Id webStoreId, String buyerGroupType) {
        BuyerGroup buyerGroup = new BuyerGroup();
        String evilEyeBuyerGroup = System.Label.B2B_VS_RX_EVIL_EYE_BUYERGROUP;
        buyerGroup.Name = evilEyeBuyerGroup;

        if (buyerGroupType == B2B_Constants.VISION_SENSATION) {
            buyerGroup.B2B_Type__c = B2B_Constants.VISION_SENSATION;
        } else if (buyerGroupType == B2B_Constants.RX_GLAZING) {
            buyerGroup.B2B_Type__c = B2B_Constants.RX_GLAZING;
        } else {
            buyerGroup.B2B_Type__c = null;
        }
        insert buyerGroup;

        WebStoreBuyerGroup WebStoreBuyerGroup = new WebStoreBuyerGroup();
        WebStoreBuyerGroup.WebStoreId = webStoreId;
        WebStoreBuyerGroup.BuyerGroupId = buyerGroup.Id;
        insert WebStoreBuyerGroup;
        return buyerGroup;
    }

    /**
     * BS-708
     * @description Creates and insert entitlements for store by the given buyerGroup
     * @param buyerGroupId
     * @returns CommerceEntitlementPolicy
     */
    public static CommerceEntitlementPolicy createInsertEntitlementsForVS_RX(Id buyerGroupId) {
        CommerceEntitlementPolicy commerceEntitlementPolicy = new CommerceEntitlementPolicy(
            Name = 'Global - RX Solution', //BS-787 : Added a global entitlement name for RX Glazing
            CanViewProduct = true,
            CanViewPrice = true,
            IsActive = true
        );
        insert commerceEntitlementPolicy;

        CommerceEntitlementBuyerGroup commerceEntitlementBuyerGroup = new CommerceEntitlementBuyerGroup(
            PolicyId = commerceEntitlementPolicy.Id,
            BuyerGroupId = buyerGroupId
        );
        insert commerceEntitlementBuyerGroup;
        return commerceEntitlementPolicy;
    }

    /**
     * BS-708
     * @description This method sets up the initial database of product, category, catalog records
     *
     */
    public static void createinitialDatabaseSetup() {
        Product2 product = new Product2(Name = 'testProduct', Description = 'testProduct', Type = null, StockKeepingUnit = 'testProSku', IsActive = true);
        insert product;
        List<Product2> productList = new List<Product2>();
        productList.add(product);
        ProductCatalog productCatalog = new ProductCatalog();
        productCatalog.Name = 'Silhouette B2B Store Catalog';
        insert productCatalog;

        ProductCategory parentCategory = new ProductCategory();
        parentCategory.Name = 'ParentCategory2';
        parentCategory.CatalogId = productCatalog.Id;
        parentCategory.B2B_Category_External_ID__c = 'test2';
        insert parentCategory;

        ProductCategory childCategory = new ProductCategory();
        childCategory.Name = 'ChildCategory';
        childCategory.IsNavigational = true;
        childCategory.ParentCategoryId = parentCategory.Id;
        childCategory.CatalogId = productCatalog.Id;
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
    }

    //BS-788 Creating test json data to insert in lens configurator object
    public static Map<string, object> createLensConfiguratorTestData() {
        Account acc = createTestAccount();
        List<Product2> productData = createProducts(1, '', false);

        Map<string, object> lensConfigDataMap = new Map<string, object>();

        lensConfigDataMap.put('accountId', acc.Id);
        lensConfigDataMap.put('collectionDesignFamily', 'Dynamics Colorwave');
        lensConfigDataMap.put('selectedFrameSKU', productData[0].StockKeepingUnit);
        lensConfigDataMap.put('productIdPDP', productData[0].Id);
        lensConfigDataMap.put('frameColor', '3530');
        lensConfigDataMap.put('frameColorDescription', 'Rose Gold / Raspberry');
        lensConfigDataMap.put('bridgeSize', '17');
        lensConfigDataMap.put('templeLength', '135');
        lensConfigDataMap.put('lensSize', '567');
        lensConfigDataMap.put('eeSize', '17 / 135');
        lensConfigDataMap.put('customerName', 'test');
        lensConfigDataMap.put('clerk', 'testdata');
        lensConfigDataMap.put('orderType', 'Complete Eyewear');
        lensConfigDataMap.put('frameType', 'Optical Eyewear');
        lensConfigDataMap.put('status', 'Open');
        lensConfigDataMap.put('B2B_RX_Solution__c', 'Adapter');
        lensConfigDataMap.put('B2B_RX_Type__c', productData[0].Name);
        lensConfigDataMap.put('B2B_Selected_RX_Solution_SKU__c', productData[0].StockKeepingUnit);
        lensConfigDataMap.put('selectedRxTypeColor', 'transparent');
        lensConfigDataMap.put('lensType', 'Panorama Single Vision');
        lensConfigDataMap.put('lensIndex', '1,59');
        lensConfigDataMap.put('lensSKU', productData[0].StockKeepingUnit);
        lensConfigDataMap.put('progressionLengthLens', '22');
        lensConfigDataMap.put('selectedRXSolution', 'Direct Glazing'); //BS-877
        lensConfigDataMap.put('selectedRXSolutionSKU', productData[0].StockKeepingUnit); //BS-877
        lensConfigDataMap.put('antireflectionSKU', 'C004'); //BS-877
        lensConfigDataMap.put('hardCoatingSKU', 'C0003'); //BS-877
        lensConfigDataMap.put('withEvilEyeEdge', true); //BS-877

        //BS-727 - Start
        lensConfigDataMap.put('weightOfLeftLens', 2.5);
        lensConfigDataMap.put('weightOfRightLens', 2.5);
        lensConfigDataMap.put('weightOfLeftLensAdjusted', 2.6);
        lensConfigDataMap.put('weightOfRightLensAdjusted', 2.6);
        lensConfigDataMap.put('axisMinimumOfLeftLens', 3.2);
        lensConfigDataMap.put('axisMinimumOfRightLens', 3.2);
        lensConfigDataMap.put('axisMinimumOfOfLeftLensAdjusted', 4.5);
        lensConfigDataMap.put('axisMinimumOfRightLensAdjusted', 4.5);
        lensConfigDataMap.put('axisMaximumOfLeftLens', 5.5);
        lensConfigDataMap.put('axisMaximumOfRightLens', 5.5);
        lensConfigDataMap.put('axisMaximumOfOfLeftLensAdjusted', 6.7);
        lensConfigDataMap.put('axisMaximumOfRightLensAdjusted', 6.7);
        lensConfigDataMap.put('centerThicknessOfLeftLens', 7);
        lensConfigDataMap.put('centerThicknessOfRightLens', 7);
        lensConfigDataMap.put('centerThicknessOfOfLeftLensAdjusted', 8);
        lensConfigDataMap.put('centerThicknessOfRightLensAdjusted', 8);
        lensConfigDataMap.put('borderMaximumThicknessOfLeftLens', 9);
        lensConfigDataMap.put('borderMaximumThicknessOfRightLens', 9);
        lensConfigDataMap.put('borderMaximumThicknessOfOfLeftLensAdjusted', 8.6);
        lensConfigDataMap.put('borderMaximumThicknessOfRightLensAdjusted', 8.6);
        lensConfigDataMap.put('borderMinimumThicknessOfLeftLens', 9.6);
        lensConfigDataMap.put('borderMinimumThicknessOfRightLens', 9.6);
        lensConfigDataMap.put('borderMinimumThicknessOfOfLeftLensAdjusted', 10.6);
        lensConfigDataMap.put('borderMinimumThicknessOfRightLensAdjusted', 10.6);
        lensConfigDataMap.put('leftImageSRC', 'Test Image');
        lensConfigDataMap.put('rightImageSRC', 'Test Image');
        lensConfigDataMap.put('thicknessMatchingCalculatorLeftValue', 2);
        lensConfigDataMap.put('antireflectionProduct', productData[0].Id); //BS-1522
        lensConfigDataMap.put('hardCoatingProduct', productData[0].Id); //BS-1522
        //BS-1244
        lensConfigDataMap.put(
            'leftImageSRCToBeSaved',
            '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'
        );
        lensConfigDataMap.put(
            'rightImageSRCToBeSaved',
            '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'
        );
        //BS-1244
        //BS-727 - End
        lensConfigDataMap.put('lensColor', 'LST bright'); //BS-1334
        lensConfigDataMap.put('lensesWithoutAdapter', true); //BS-1340
        lensConfigDataMap.put('preCalcGuid', 'abcdefgh'); //BS-1439

        lensConfigDataMap.put('optimisedFacetCutValue', true); //BS-793
        lensConfigDataMap.put('productMaterial', 'Plastic'); //BS-793

        return lensConfigDataMap;
    } //end method

    //BS-723 Creating test productCategory with provided name.
    public static List<ProductCategory> createProductCategory(String categoryName) {
        ProductCatalog prodCatalog = new ProductCatalog();
        prodCatalog.Name = PRODUCT_TEST_CATALOG;
        insert prodCatalog;
        List<ProductCategory> productCategoryList = new List<ProductCategory>();
        ProductCategory productCategory = new ProductCategory();
        productCategory.Name = categoryName;
        productCategory.CatalogId = prodCatalog.Id;
        productCategory.B2B_Category_External_ID__c = 'test';
        productCategoryList.add(productCategory);
        return productCategoryList;
    }

    /**
     * BS-978
     * @description This method is used for create test records that needs for the testing of functionalities developed for BS-978
     * @author Sachin V
     */
    public static List<User> createLensConfiguratorRecords(
        String applicableBrand,
        Integer numberOfRecords,
        String orderType,
        String status,
        String createdDate
    ) {
        String buyerGroupType = 'Vision Sensation';
        Map<String, String> storeResponse = B2B_TestDataFactory.setupCommerceStoreFrontForVS_RX(buyerGroupType);
        List<B2B_Lens_Configurator__c> configuratorDataList = new List<B2B_Lens_Configurator__c>();
        List<Product2> productList = new List<Product2>();
        productList = [SELECT Id, Name, StockKeepingUnit FROM Product2 WHERE StockKeepingUnit != NULL LIMIT 1];
        List<User> userList = [SELECT AccountId FROM User WHERE AccountId != NULL LIMIT 1];
        for (Integer i = 0; i < numberOfRecords; i++) {
            B2B_Lens_Configurator__c configurator = new B2B_Lens_Configurator__c();
            configurator.B2B_Selected_Frame__c = productList[0].StockKeepingUnit;
            configurator.B2B_Customer_Name__c = 'Testuser ' + i;
            if (String.isNotBlank(orderType)) {
                configurator.B2B_Order_Type__c = orderType;
            } else {
                configurator.B2B_Order_Type__c = 'Complete Eyewear';
            }
            if (String.isNotBlank(status)) {
                configurator.B2B_Status__c = status;
            } else {
                configurator.B2B_Status__c = 'Open';
            }
            configurator.B2B_Type__c = 'RX Glazing';
            configurator.B2B_Lens_Type__c = 'Panorama Single Vision';
            configurator.B2B_Frame_Collection__c = 'Clara';
            configurator.B2B_Account__c = userList[0].AccountId;
            configuratorDataList.add(configurator);
        }
        insert configuratorDataList;
        return userList;
    }

    /**
     * BS-976
     * @description This method is used for create Lens Configurator Records with Selected Frame SKU
     */
    public static void createLensConfiguratorRecordsForSelectedFrame() {
        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
            B2B_Selected_Frame__c = 'Test Product SKU 1',
            B2B_Selected_Lens_SKU__c = 'Test Product SKU 2'
        );
        insert lensConfiguratorObj;
    }

    /**
     * BS-976
     * @description This method sets up multilevel categories
     *
     */
    public static void createSubCategories() {
        Product2 product = new Product2(Name = 'testProductOne', Description = 'testProduct', Type = null, StockKeepingUnit = 'testProSku3', IsActive = true);
        insert product;
        List<Product2> productList = new List<Product2>();
        productList.add(product);
        ProductCatalog productCatalog = new ProductCatalog();
        productCatalog.Name = 'Silhouette Store Catalog';
        insert productCatalog;

        ProductCategory grandParentCategory = new ProductCategory();
        grandParentCategory.Name = 'GrandParentCategory';
        grandParentCategory.CatalogId = productCatalog.Id;
        grandParentCategory.B2B_Category_External_ID__c = 'test3';
        insert grandParentCategory;

        ProductCategory parentCategory = new ProductCategory();
        parentCategory.Name = 'ParentCategory3';
        parentCategory.CatalogId = productCatalog.Id;
        parentCategory.ParentCategoryId = grandParentCategory.Id;
        parentCategory.B2B_Category_External_ID__c = 'test4';
        insert parentCategory;

        ProductCategory childCategory = new ProductCategory();
        childCategory.Name = 'ChildCategory2';
        childCategory.IsNavigational = true;
        childCategory.ParentCategoryId = parentCategory.Id;
        childCategory.CatalogId = productCatalog.Id;
        insert childCategory;

        ProductCategoryProduct productCategoryProduct = new ProductCategoryProduct();
        productCategoryProduct.ProductCategoryId = childCategory.Id;
        productCategoryProduct.ProductId = productList[0].Id;
        insert productCategoryProduct;

        ProductCategoryDataTranslation productCategoryTranslation = new ProductCategoryDataTranslation(
            Name = 'test',
            ParentId = grandParentCategory.Id,
            Language = 'de'
        );
        insert productCategoryTranslation;
    }

    /**
     * BS-976
     * @description This method sets up multilevel categories
     *
     */
    public static void createProductDataForLensConfigurator() {
        List<Product2> productList = new List<Product2>{
            new Product2(
                Name = 'Test Product 1',
                StockKeepingUnit = 'Test Product SKU 1',
                B2B_Base_Curve__c = '2.0',
                B2B_Bridge_Size__c = '18',
                B2B_Salesconcept_unique__c = 'E8',
                B2B_Color_Number__c = '4000',
                B2B_Temple_Length__c = '140',
                B2B_EE_Size__c = 'L',
                B2B_Model__c = 'e018',
                Description = 'test',
                B2B_Material__c = 'Plastic'
            ),
            new Product2(
                Name = 'Test Product 2',
                StockKeepingUnit = 'TestSKU0',
                B2B_Base_Curve__c = '2.0',
                B2B_Bridge_Size__c = '18',
                B2B_Salesconcept_unique__c = 'E8',
                B2B_Color_Number__c = '4000',
                B2B_Temple_Length__c = '140',
                B2B_EE_Size__c = 'L',
                B2B_Model__c = 'e018',
                Description = 'test',
                B2B_Material__c = 'Plastic'
            )
        };
        insert productList;
        B2B_Lens_Shapes__c lensShapeObj = new B2B_Lens_Shapes__c(B2B_EE_Size__c = 'L', B2B_Model__c = 'e018', B2B_Shape_Name__c = 'e018');
        insert lensShapeObj;
    }

    /**
     * BS-1094
     * @description This method creates the custom cartItems
     */
    public static List<B2B_CartItems__c> createVsRxCartItems(String cartId, String carItemId, Map<String, String> storeResponse, Integer quantity) {
        List<B2B_CartItems__c> vsRxCartItemObjList = new List<B2B_CartItems__c>();
        for (Integer index = 0; index < quantity; index++) {
            B2B_CartItems__c vsRxCartItemObj = new B2B_CartItems__c(
                B2B_Cart__c = cartId,
                B2B_Parent_Cart_Item__c = carItemId,
                Name = 'test cartItem',
                CurrencyIsoCode = 'EUR',
                B2B_List_Price__c = 50,
                B2B_Product__c = storeResponse.get('productId'),
                B2B_Unit_Price__c = 50,
                B2B_Type__c = 'RX Glazing'
            );
            vsRxCartItemObjList.add(vsRxCartItemObj);
        }
        return vsRxCartItemObjList;
    }

    /**
     * BS-1023
     * @description This method create order for order history
     *
     */
    public static Order createOrderForOrderHistory(Account acc, String orderType) {
        Order order = new Order(
            Name = 'testOrder',
            AccountId = acc.Id,
            EffectiveDate = System.today(),
            Status = 'Draft',
            B2B_Order_Type__c = orderType,
            B2B_Configuration_Type__c = 'Lens Only'
        );

        return order;
    } //end createOrderForOrderHistory

    /**
     * BS-1023
     * @description This method create B2B_Order_Reference__c
     *
     */
    public static B2B_Order_Reference__c createOrderReferenceForOrderHistory(Order order) {
        B2B_Order_Reference__c ref1 = new B2B_Order_Reference__c(
            B2B_Order__c = order.Id,
            B2B_Order_Reference_Link__c = 'https://google.com',
            B2B_Order_Reference_Type__c = 'Tracking'
        );

        return ref1;
    } //end createOrderReferenceForOrderHistory

    /**
     * BS-1023
     * @description This method create Product
     *
     */
    public static Product2 createProductForOrderHistory() {
        Product2 product1 = new Product2(Name = 'TestProduct', StockKeepingUnit = 'SKU_Test1', Description = 'Test Product', IsActive = true);

        return product1;
    } //end createProductForOrderHistory

    /**
     * BS-1023
     * @description This method create procebook
     *
     */
    public static PricebookEntry createPriceBookEntryForOrderHistory(product2 product1, Id pricebookId) {
        PricebookEntry priceBookEntry = new PricebookEntry(
            IsActive = true,
            UnitPrice = 50,
            Pricebook2Id = pricebookId,
            Product2Id = product1.Id,
            UseStandardPrice = false
        );

        return priceBookEntry;
    } //end createPriceBookEntryForOrderHistory

    /**
     * BS-1023
     * @description This method create orderItem
     *
     */
    public static OrderItem createOrderItemForOrderHistory(Order order, Product2 product1) {
        OrderItem orderItem = new OrderItem(OrderId = order.Id, Quantity = 2, ListPrice = 100, TotalLineAmount = 200, Product2Id = product1.Id);

        return orderItem;
    } //end createOrderItemForOrderHistory

    //BS-587 Start

    /**
     * @description create B2B Orders
     **/
    public static List<Order> createB2BOrders(Integer size, String accountId, String b2cOrderNumber) {
        Id b2bOrderRecordtypeId = Schema.SObjectType.Order.getRecordTypeInfosByDeveloperName()
            .get(B2B_Constants.B2B_ORDER_RECORDTYPE_DEVELOPERNAME)
            .getRecordTypeId();
        List<Order> orderList = new List<Order>();
        for (Integer index = 1; index <= size; index++) {
            Order orderObj = new Order();
            orderObj.AccountId = accountId;
            orderObj.RecordTypeId = b2bOrderRecordtypeId;
            orderObj.Related_B2C_Order_Number__c = b2cOrderNumber + index;
            orderObj.Status = 'Draft';
            orderObj.EffectiveDate = System.today();
            orderObj.Order_Source__c = 'Click & Collect';
            orderList.add(orderObj);
        }
        return orderList;
    }
    /**
     * @description create B2C Orders
     **/
    public static List<Order> createOrders(Integer size, String accountId, String orderNumber) {
        List<Order> orderList = new List<Order>();
        for (Integer index = 1; index <= size; index++) {
            Order orderObj = new Order();
            orderObj.AccountId = accountId;
            orderObj.B2C_Order_Number__c = orderNumber + index;
            orderObj.Status = 'Draft';
            orderObj.EffectiveDate = System.today();
            orderObj.Order_Source__c = 'B2C Online Shop';
            orderList.add(orderObj);
        }
        return orderList;
    }

    /**
     * @description create B2C Accounts
     **/
    public static List<Account> createAccounts(Integer size, String name, String email, String customerId) {
        List<Account> accountList = new List<Account>();
        for (Integer index = 1; index <= size; index++) {
            Account accountObj = new Account();
            accountObj.Name = name;
            accountObj.k_Email__c = email + index;
            accountObj.k_Shipping_Name__c = name;
            accountObj.ShippingStreet = 'Test Address';
            accountObj.Language__c = 'English';
            accountList.add(accountObj);
        }
        return accountList;
    }

    //BS-587 End

    /**
     * BS-1137
     * @description this method creates multiple records of B2B_Commerce_Product_Link__c
     *
     */
    public static void createCommerceProductLinkRecords() {
        List<Product2> products = createProducts(10, null);
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
            new B2B_Commerce_Product_Link__c(B2B_Source_Product__c = products[3].Id, B2B_Target_Product__c = products[7].Id, B2B_Type__c = 'Spare Part')
        };
        insert featuredProducts;
    }

    /**
     * BS-727
     * @description this method creates multiple records of product2
     *
     */
    public static List<Product2> createProductsForLensConfigurator() {
        List<Product2> productList = new List<Product2>{
            new Product2(
                Name = 'Test Product 1',
                StockKeepingUnit = 'Test Product SKU 1',
                B2B_Base_Curve__c = '2.0',
                B2B_Bridge_Size__c = '18',
                B2B_Salesconcept_unique__c = 'E8',
                B2B_Color_Number__c = '4000',
                B2B_Temple_Length__c = '140',
                B2B_EE_Size__c = 'L',
                B2B_Model__c = 'e018',
                B2B_Variant_Shape__c = 'E018' //BS-1157
            ),
            new Product2(
                Name = 'Test Product 2',
                StockKeepingUnit = 'Test Product SKU 2',
                B2B_Base_Curve__c = '2.0',
                B2B_Bridge_Size__c = '18',
                B2B_Salesconcept_unique__c = 'E8',
                B2B_Color_Number__c = '4000',
                B2B_Temple_Length__c = '140',
                B2B_EE_Size__c = 'L',
                B2B_Model__c = 'e018',
                B2B_Variant_Shape__c = 'E018' //BS-1157
            )
        };
        return productList;
    }

    /**
     * BS-727
     * @description this method creates multiple incorrect records of product2
     *
     */
    public static List<Product2> createIncorrectProductsForLensConfigurator() {
        List<Product2> productList = new List<Product2>{
            new Product2(
                Name = 'Test Product 1',
                StockKeepingUnit = 'Test Product SKU 1',
                B2B_Base_Curve__c = '2.0',
                B2B_Bridge_Size__c = '18',
                B2B_Salesconcept_unique__c = 'E8',
                B2B_Color_Number__c = '4000',
                B2B_Temple_Length__c = '140',
                B2B_EE_Size__c = 'L',
                B2B_Model__c = 'e018'
            ),
            new Product2(Name = 'Test Product 2', StockKeepingUnit = 'Test Product SKU 2')
        };
        return productList;
    }

    /**
     * BS-727
     * @description this method creates correct records of Lens Configurator
     *
     */
    public static List<B2B_Lens_Configurator__c> createCorrectRecordsForLensConfigurator() {
        //BS-1248
        Account account = new Account(k_ARIS_Account_ID__c = 'Test_1', k_Account_No__c = 'Test_5', Name = 'Test');
        insert account;
        //BS-1248

        List<B2B_Lens_Configurator__c> configurationList = new List<B2B_Lens_Configurator__c>();
        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
            B2B_Selected_Frame__c = 'Test Product SKU 1',
            B2B_Selected_RX_Solution_SKU__c = 'Test Product SKU 2',
            B2B_Pupil_Distance_Left_Eye__c = 27.0,
            B2B_Pupil_Distance_Right_Eye__c = 27.0,
            B2B_Fitting_height_Left_Eye__c = 5,
            B2B_Measurement_System__c = 'Boxing System',
            B2B_Progression_Length__c = 18,
            B2B_Features__c = 'E',
            B2B_Lens_Shape__c = 'e018',
            B2B_Bridge__c = '14',
            B2B_Lens_Size__c = 59,
            B2B_Eye_Side__c = 'Right lens',
            B2B_Antireflection_SKU__c = 'C0001',
            B2B_Hard_Coating_SKU__c = 'C0004',
            B2B_Evil_Eye_Edge__c = true,
            B2B_Salesconcept__c = 'E018',
            B2B_Temple__c = '130',
            B2B_Remove_Drills__c = false,
            B2B_Schneider_SKU__c = 'ESV001',
            B2B_Variant_Shape__c = 'E018',
            B2B_RX_Picture_Link__c = 'testlink',
            B2B_Lens_Picture_Link__c = 'testlink',
            B2B_Lens_Color__c = 'LST bright',
            B2B_Lenses_without_Adapter__c = true,
            B2B_Account__c = account.Id, //BS-1248
            B2B_Final_PreCalcGuid__c = 'abcdefgh',
            B2B_Type__c = 'Vision Sensation',
            B2B_Customer_Name__c = 'test',
            B2B_Order_Type__c = 'Complete Eyewear',
            B2B_Clerk__c = 'test',
            B2B_Addition_Left__c = 1,
            B2B_Addition_Right__c = 1,
            B2B_Axis_Left__c = 1,
            B2B_Axis_Right__c = 1,
            B2B_Cylinder_Left__c = 1,
            B2B_Cylinder_Right__c = 1,
            B2B_Prism_1_Left__c = 1,
            B2B_Prism_1_Right__c = 1,
            B2B_Prism2_Left__c = 1,
            B2B_Prism2_Right__c = 1,
            B2B_Prism_base2_Left__c = 1,
            B2B_Prism_base2_Right__c = 1,
            B2B_Sphere_Right__c = '1',
            B2B_PB1Placement_Left__c = 'Out',
            B2B_PB1_Left__c = 1,
            B2B_PB1_Right__c = 1,
            B2B_PB1Placement_Right__c = 'In',
            B2B_PB2Placement_Right__c = 'Up',
            B2B_PB2Placement_Left__c = 'Up',
            B2B_Sphere_Left__c = '1',
            B2B_Fitting_height_Right_Eye__c = 1,
            B2B_Pantoscopic_tilt__c = 1,
            B2B_Working_Distance__c = '1',
            B2B_Thickness_Matching_Calculator_Left__c = 1,
            B2B_Thickness_Matching_Calculator_Right__c = 1,
            B2B_Special_Handling__c = 'No selection',
            B2B_Note__c = 'test',
            B2B_RX_Solution__c = 'Direct Glazing',
            B2B_RX_Type__c = 'test',
            B2B_Lens_Type__c = 'Panorama Single Vision',
            B2B_Lens_Index__c = '1,67',
            B2B_RX_Solution_Description__c = 'test',
            B2B_Lens_Material__c = 'Plastic',
            B2B_Base_Values__c = 'No Prism',
            B2B_BVD_refracted__c = 1,
            B2B_BVD_worn__c = 1
        );
        configurationList.add(lensConfiguratorObj);
        return configurationList;
    }

    /**
     * BS-727
     * @description this method creates incorrect records of Lens Configurator
     *
     */
    public static List<B2B_Lens_Configurator__c> createIncorrectRecordsForLensConfigurator() {
        List<B2B_Lens_Configurator__c> configurationList = new List<B2B_Lens_Configurator__c>();
        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
            B2B_Selected_Frame__c = 'Test Product SKU 1',
            B2B_Selected_RX_Solution_SKU__c = 'Test Product SKU 2',
            B2B_Pupil_Distance_Left_Eye__c = 27.0,
            B2B_Pupil_Distance_Right_Eye__c = 27.0,
            B2B_Fitting_height_Left_Eye__c = 5,
            B2B_Measurement_System__c = 'Boxing System',
            B2B_Progression_Length__c = 18,
            B2B_Evil_Eye_Edge__c = true,
            B2B_Salesconcept__c = 'E018',
            B2B_Temple__c = '130',
            B2B_Remove_Drills__c = false
        );
        configurationList.add(lensConfiguratorObj);
        return configurationList;
    }

    /**
     * BS-727
     * @description this method creates correct data of Lens shape database
     *
     */
    public static List<B2B_Lens_Shapes__c> createCorrectRecordsForLensShapes() {
        List<B2B_Lens_Shapes__c> lensShapesList = new List<B2B_Lens_Shapes__c>();
        B2B_Lens_Shapes__c lensShapeObj = new B2B_Lens_Shapes__c(B2B_EE_Size__c = 'L', B2B_Model__c = 'e018', B2B_Shape_Name__c = 'e018');
        lensShapesList.add(lensShapeObj);
        return lensShapesList;
    }

    /**
     * BS-727
     * @description this method creates incorrect data of lens shapes database
     *
     */
    public static List<B2B_Lens_Shapes__c> createInCorrectRecordsForLensShapes() {
        List<B2B_Lens_Shapes__c> lensShapesList = new List<B2B_Lens_Shapes__c>();
        B2B_Lens_Shapes__c lensShapeObj = new B2B_Lens_Shapes__c(B2B_EE_Size__c = 'L', B2B_Model__c = 'e018');
        lensShapesList.add(lensShapeObj);
        return lensShapesList;
    }

    //BS-1092 Creating test json data to insert in lens configurator object
    public static Map<string, object> createLensConfiguratorTestData(String orderType) {
        Account acc = createTestAccount();
        insert acc;
        List<Product2> productData = createProducts(1, '', false);

        Map<string, object> lensConfigDataMap = new Map<string, object>();

        lensConfigDataMap.put('accountId', acc.Id);
        lensConfigDataMap.put('collectionDesignFamily', 'Dynamics Colorwave');
        lensConfigDataMap.put('selectedFrameSKU', productData[0].StockKeepingUnit);
        lensConfigDataMap.put('productIdPDP', productData[0].Id);
        lensConfigDataMap.put('frameColor', '3530');
        lensConfigDataMap.put('frameColorDescription', 'Rose Gold / Raspberry');
        lensConfigDataMap.put('bridgeSize', '17');
        lensConfigDataMap.put('templeLength', '135');
        lensConfigDataMap.put('lensSize', '567');
        lensConfigDataMap.put('eeSize', '17 / 135');
        lensConfigDataMap.put('variantShape', 'FU');
        lensConfigDataMap.put('customerName', 'test');
        lensConfigDataMap.put('clerk', 'testdata');
        lensConfigDataMap.put('orderType', orderType);
        lensConfigDataMap.put('frameType', 'Optical Eyewear');
        lensConfigDataMap.put('status', 'Open');
        lensConfigDataMap.put('B2B_RX_Solution__c', 'Adapter');
        lensConfigDataMap.put('B2B_RX_Type__c', productData[0].Name);
        lensConfigDataMap.put('B2B_Selected_RX_Solution_SKU__c', productData[0].StockKeepingUnit);
        lensConfigDataMap.put('lensType', 'Panorama Single Vision');
        lensConfigDataMap.put('lensIndex', '1,59');
        lensConfigDataMap.put('lensSKU', productData[0].StockKeepingUnit);
        lensConfigDataMap.put('progressionLengthLens', '22');
        lensConfigDataMap.put('selectedRXSolution', 'Direct Glazing');
        lensConfigDataMap.put('selectedRXSolutionSKU', productData[0].StockKeepingUnit);
        lensConfigDataMap.put('antireflectionSKU', 'C004');
        lensConfigDataMap.put('hardCoatingSKU', 'C0003');
        lensConfigDataMap.put('withEvilEyeEdge', true);

        lensConfigDataMap.put('weightOfLeftLens', 2.5);
        lensConfigDataMap.put('weightOfRightLens', 2.5);
        lensConfigDataMap.put('weightOfLeftLensAdjusted', 2.6);
        lensConfigDataMap.put('weightOfRightLensAdjusted', 2.6);
        lensConfigDataMap.put('axisMinimumOfLeftLens', 3.2);
        lensConfigDataMap.put('axisMinimumOfRightLens', 3.2);
        lensConfigDataMap.put('axisMinimumOfOfLeftLensAdjusted', 4.5);
        lensConfigDataMap.put('axisMinimumOfRightLensAdjusted', 4.5);
        lensConfigDataMap.put('axisMaximumOfLeftLens', 5.5);
        lensConfigDataMap.put('axisMaximumOfRightLens', 5.5);
        lensConfigDataMap.put('axisMaximumOfOfLeftLensAdjusted', 6.7);
        lensConfigDataMap.put('axisMaximumOfRightLensAdjusted', 6.7);
        lensConfigDataMap.put('centerThicknessOfLeftLens', 7);
        lensConfigDataMap.put('centerThicknessOfRightLens', 7);
        lensConfigDataMap.put('centerThicknessOfOfLeftLensAdjusted', 8);
        lensConfigDataMap.put('centerThicknessOfRightLensAdjusted', 8);
        lensConfigDataMap.put('borderMaximumThicknessOfLeftLens', 9);
        lensConfigDataMap.put('borderMaximumThicknessOfRightLens', 9);
        lensConfigDataMap.put('borderMaximumThicknessOfOfLeftLensAdjusted', 8.6);
        lensConfigDataMap.put('borderMaximumThicknessOfRightLensAdjusted', 8.6);
        lensConfigDataMap.put('borderMinimumThicknessOfLeftLens', 9.6);
        lensConfigDataMap.put('borderMinimumThicknessOfRightLens', 9.6);
        lensConfigDataMap.put('borderMinimumThicknessOfOfLeftLensAdjusted', 10.6);
        lensConfigDataMap.put('borderMinimumThicknessOfRightLensAdjusted', 10.6);
        lensConfigDataMap.put('leftImageSRC', 'Test Image');
        lensConfigDataMap.put('rightImageSRC', 'Test Image');
        lensConfigDataMap.put('thicknessMatchingCalculatorLeftValue', 2);
        lensConfigDataMap.put('thicknessMatchingCalculatorRightValue', 3);
        lensConfigDataMap.put('applicableBrand', 'RX Glazing');
        //BS-1244
        lensConfigDataMap.put(
            'leftImageSRCToBeSaved',
            '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'
        );
        lensConfigDataMap.put(
            'rightImageSRCToBeSaved',
            'iVBORw0KGgoAAAANSUhEUgAAAlgAAAJYCAIAAAAxBA+LAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAXGUlEQVR4nO3dPXIbx6KG4cYpL8FKpVPlwJG2IAU3o1JtQMzsDVBnBTY3YCe3xA0oFbMbiFtQ5MBVFlOdPfAGlCiQxM/MYAYz3d/zRDYFUQBn0C+6pwGubm5uCgCk+tfcdwAA5iSEAEQTQgCiCSEA0YQQgGhCCEA0IQQgmhACEE0IAYgmhABEE0IAogkhANGEEIBoQghANCEEIJoQAhBNCAGIJoQARBNCAKIJIQDRhBCAaEIIQDQhBCCaEAIQTQgBiCaEAEQTQgCiCSEA0YQQgGhCCEA0IQQgmhACEE0IAYgmhABEE0IAogkhANGEEIBoQghANCEEIJoQAhBNCAGIJoQARBNCAKIJIQDRhBCAaEIIQDQhBCCaEAIQTQgBiCaEAEQTQgCiCSEA0YQQgGhCCEA0IQQgmhACEE0IAYgmhABEE0IAogkhANGEEIBoQghANCEEIJoQAhBNCAGIJoQARBNCAKIJIQDRhBCAaEIIQDQhBCCaEAIQTQgBiCaEAEQTQgCiCSEA0YQQgGhCCEA0IQQgmhACEE0IAYgmhABEE0IAogkhANGEEIBoQghANCEEIJoQAhBNCAGIJoQARBNCAKIJIQDRhBCAaEIIQDQhBCCaEAIQTQgBiCaEAEQTQgCiCSEA0YQQgGhCCEA0IQQgmhACEE0IAYgmhABEE0IAogkhANGEEIBoQghANCEEIJoQAhBNCAGIJoQARBNCAKIJIQDRhBCAaEIIQDQhBCCaEAIQTQgBiCaEAEQTQgCiCSEc4Ort6s7bq/U/ub54tXrg/g26WvtGry6ux7nbwBohhIEuXq1WL8vHm29+f/HwFmff/3DzDfa6vnj17P3rz1+/wev3v0ghjE4IYYirt6vT5x8Hxa3Pv/LH6fOPH948/fq/b/58/f6Xiyn/QUgkhNDf9cX5p3cTR7CUcnV5fnay/o88/en55XuTQhiXEEJv1//3vrz+nw43vPx+CfFV/5nc9d+fHn7pxc8nl3/90/s7ATsIIfT2z1+XpcsulvPzu0uIn1+/H7hZBpiYEEJvf38q5f0vz07Lu8/fKvfsYQufvvmwvj/m6Zuzs/Nzq5qwQEIIQ1xelnefv21jefrmw+fX7//YPeGzqgkLJYTQ20/PSzl5fbeZs5RS/vnr8tPfI/8zT396Xj79fW8SefXX5cnP/x7534FwQgi9vfj13cmD3Zv//vnk+U+7/s71xfvL+1tASyl378jfvJXmxcnZ/Unk1eX5gwADBxNC6O/pmz/fldO7t/Tdvu3917XKXb2990ky1xevnp2Wd78+7uDleSmllC1vinjx+8fy8vu3uTj/9O7PNyM9BuArIYQhbi8Lft00+uz9688f7k3UXvx+c/OxvPy2q/TZ6doVxXUvTs5KKY8WWte/0dq3ef/6T9NBGN3q5uZm7vsAALMxIwQg2g9z3wHgGFar1XTf3MISVRNCWK4R6zVpq6aorLhyNK4RwvH0DUby07PXzyr5B8XhhBBGs3fs9nSbyO6fvB87uwkhdKVzldpx4BwyihDCAwbNKNsOt2MdRQgJVdkI+J9v9/a3m3v/W/VXFqyy04PDCCGNW+KIdpuEXglZfDmGqDCfj08nQ2gDhJBGLCV4XSK3gAG9YjtiOccP9sGJZ0StkRBSpdlemN9NzkRugXYfnaMcGlPGGgkhFTj24LKwOQfj2HaddeJjasq4fELI4syfPaLsmEdOYP30NvwuhBAys2Nkb/d1O9hm4rNFFBdCCDm2aVeKNi5/CR5jmSyNojgjIWRaE074ct5mwJJNcK1RFI9MCBnZVBM+S5os3DSvw+6eUMbq6Qghh5qkfLJHvabZj6qI0xFChhh56Ub2aJI5YiWEkE5GnvZ5Wx5Rptm0pYhjEUK2GnPa9+ANDPpHoMn2MCvigYSQ78ac9j14k7Lywbop54hG9b6EkFFfTlrzhO7kcBmEMNQ4y542ucBYxr5kYL20OyEMMkL8TPhgOiaIMxHCxo0TP5tc4GimfNOFAX8jIWzTCKsiJn8wrwmKuFoZ8zfwQ2nHoZM/5YOlmWCx1NTwMSGs3kGTP8uesHzTTA2LHH4jhFUy+YNEE+wslYAihHUZPvlTPmjD2IulpoZFCKtw6M4Xy57QGFPDUUU/+IUb2D9vcgf6S54aCuHiDO+f7EGaCVZKA6OQ+JiX6dD5nwpCrFFfBwe2MO4BL9CQFQnzP2CdFh4g69EuypApoPkfsNtIRYy6ZCiExzawf8oHdDTeiBEyNYx4kAvR+xWW+R8wjBb20f4jnF3vKaD5H3C48dZIm89E+49wRgOngCoILEnzLWz84c3FRlBgKcYYW9puYcuP7fj6rYK6BAgcxxirTQ23sNkHdmRDVkH1Dzimg4edVlvY5qM6ph4JdAkQqJkQ8pAEAmmabGGDD+kIoj5zAWjNYWuk7bXwX3PfgcqsVqvbk2D/efCf1b3fiASwEL/dGJ3WtRb26VgIBZpywLywsUlhUw9mIhZCgTYNbaEQZul6vM0CgSQttfCHue/AcnWdCEogQM3aSfqIrIUCQeIXSO0avafrplA7QoFmxG8itTT6XadXNxZCAdrSyMT2QNZCgXSDFkjbWB21NFq6roUCNCx4oSt6abTTRNBaKEDTWpjVDtP1iqAEAiFSV0erfwADuCIIsFn/FjYQwril0f3HzFooQJLqS95LpwpKIJCs5zDYwIyw+gfQnQoCTKH2FtZ977ur/TgBLFbtA2zE+wj3HCTvEQS4kzckth/C/RW0HApwJ++jRxsPoQoCsFvLIVRBAPaq+wrnDrVfvAWoRe3jbZszwtqPCgBH02YIdwm7CAwwRJ+h8ubm5vajKyvVYAh3TQddFwTgvgZDCADdtRZC00EAemltU4ltMgDHV/XY29SMsOojAcAsmgrhVnaKAvSSNGy2E0LTQQAGaCeEW9kjA8B2ASEEgO0aWU60Lgowo6oHYTNCAKK1HsKkjU8Ao0kaPFsPIQDs1EIIt65N2y8KwD4thBCAGVW9U6a0sWu09mMAULXaB2EzQgCiVR/CXRcIARgmaQitPoQAjCxsp6EQAhBNCAGIVvdWn1L/biWA2tU+DpsRAhCt0RAm7XcCGFmfIbT26WCpPYQNHAAA5lV3CAHgQEIIwJqwNxGW2neNWhoFmFcD47AZIQDRWgyhLaMAg+UNoS2GEICjaGBdtAghAOGEEIBv8raMFrtGARisjUHYjBCAaC2GMG/LE8A4IsfPFkMIwAA9LxC2sS5aqg5hM8cAgBlVHEIAOFzFkyozQoAZNTMImxECEK3FEEbuegI4SPDI2WIIAZhYM+uiRQgBCCeEAESreG7b0sQcoC4tjcBmhABEazGEwXufAIboOWy2NB0sbYYQADoTQoBskb+Md50QAhCt4nXexhapAWrR2PBrRghAD41VsDQYQltGAbozZjYYQgDoQwgBiCaEAHTV3gXCYtcoAN01OfCaEQIQrbkQ2gEF0JEBs5TSYAh/u3FoAeiuuRAC0EX/jxht8gJhEUIAwlWc91ZfmwAsU6ujrhkhANFaDKHNMgC79R8nW50OljZDCACdVRzCm5ub1crkD4CDVBxCAIbo/8aJttW95tvwmjXAcrQ92JoRAhCtxRDaNQqwjRHykRZDCACdCSEAu7R9gbAIIUAQ+0U3qbvzzb9OAZhd8yOtGSEAWzVfwdJmCO2Joh5PnjyZ+y6QxPC4SYshBOAxFwi3EEIAogkhAJslXCAsdo3CvJ48efLly5e57wVsFjLGmhECEK3RENoZBbDOqLhd3SH0u3kB9hu0XzRkXbTUHkIAOJAQAhCtWwivL16tVqtXF4feZt/fvvXq4nrYN/nOm0YB7lgX3alTCC9+OS0nJ4ffZpurt6tnp88/3tz6+Pz02ert1bBvBQC9dAjh1dvTy7Ozs+eH3mab64vz85N3n39/8fX/X/x+8/Hs/PygaaH9UQC3jIf7/LD3FreZelH+OPA2Wz198+Hmzf0vvfj55OVf/5TydMj3A+AQUeuiZX8Ir96elnc3b56WHUuVXW7Ty/XF+8uzsw8jfTc4ul6/U6LXjX0MDf34oO0O9oTw4vz87GzPD7HLbfq4evvs/evPH17svyUsVPdc+Yg1mN2uEF5fvDot7252FqnLbfq4ert6WT7evDlwUdQrIIBiv2gnO0J49cfp5dnH3QuUXW7T3dcK/m4yCHA466LdbA/h9d+fSrl8uTpf+9pq9de9TnW5TUfXF6+enT7v/zdvP2Vtw+sXZwAAHWx/+8TTNx9u1nw8Kyfvbh50qsttvrl6+/Xd8pv/7Nn715/NBQHGYzLQzdE+Yu3q8nbaePn+4RsEvy6Ifli/LnjxylvqAY4t8AJh6fiG+tVqtXp5Xi5Pt36C2v7bvDg5K6WUcvL6wUaY678/lXL+cnXP6WW/hwHAPd5H31kL8c98CUMbvH2CqfjVS5357RMAzVHBPtoNoWUBADpoN4QAsewX7UMIAchdFy1CCNAaF4Z6ajeEVgaAQLbJ9NdCCG8/ZW3uewFAlVoI4VbWB1g8byKE2TUdQoA01kX7E0IAogkhQBNcDBqq6RDaOAqwk3XR0ngIAWCfpkNooQAIMejtg9xqZ1K8eYLv5ADYwrroraZnhACwjxACVG7QZSDTwTuth9C6KAA7tR5CgLbZCXGw1kNo4yjAI9ZF17UeQoC2mQ4erJ0Q+mVMAAzQTgg3++3G6ijQLPtFx9DUj8PRBYIM3SZjqHyg9RkhAGtU8LGAEFoaBWC7gBACNMl+0ZEIIUAK66IbCSFAbVzxGVVTIdz8VkKrBwCmg9s1FUKA9vlw0bFlhNAyAgBbZIQQoBneRD82IQQgmhAC1MOHi06gwZ+OQw60yYeLTsOMEKBlKrhXTAhtHAWq5l0Tk4kJIUDVVHAyQgjQLOuiXQghwOK5uDOlBkPoE0cBiulgZw2GEKAptslMLCmE1haAGKaD3SWFEKBGpoMTE0KA1pgO9iKEAEvlgs5RtBlCG0eBWKaDfbUZQoDq2Sx6LGEhtM4AwH1hIQSohd+4dCxCCEC0ZkO4eb8MwPINvYhjOjhMsyHczJVnAO4LCyHAwg3dLGo6OFheCG0cBWBNXggBlsx08OiEEIBoLYdw6wetWR0FFshm0Zm0HMKt7B0F4JvIEAIsjc2i84kMoaVRAL5pPIQ+Xwaog+ngfBoP4Wb2ywDwTWQIAZbDZtG5pYbQxlEASim5IQRYAptFF6D9EG7eL+MaIQCllFIiXlNsfuk09IUYwLxMB8fV/owQoCUqODohBJiDCzSLEfHKwgsoYFnskVmSiBmhz5cBYJuIEG5laQI4PtPBhckOIcDxqeDCCCEA0VJC6LfVA/PzsaKLlBLCrbynHiBbfAgBjsMemaWKD6GlUeAIVHDBsn7EPnQUqIsQHkH8jBBgqVTwOIQQYEp2ii6eENo4ChAtK4Q+dBQ4KntkapAVwq3sHQVGZyNeJYQQYBpDK2g6eGRCeJ+pITArFTy+xJ/4hvPscf8saACDuTRYFTPCLbNAU0OADPEh3BE8LQQGMB2sTejP/esJ1yV11kiBsv2V8W+PrrOoYG3iZ4QAe3VfOlLBCv0w9x0AWLAu60a3t7F6VK3QGaGPmAH267VRwGeKVis0hF95BQdsMyBs/f+KCi5Bdgj3UkrIdJRN4yq4ELkh/Lo6uiN1Kgj05W1XFcoN4Xcbg6eCEMt0MEz6kdh6LvrYeIh1eAj3jR4quChmhABrpp8OquDSpIdw6/soTAeBCajgAqWHEOBoVHCZhHDnm+ttAANGooKLJYSl7F4g1ULgYCq4ZEK4jxZClAn2B6jgwgnhV7sWSLUQGEoFl88RuscpC5Ry2P6AtTmlIaUKZoT3+K0UwEFUsEJC2JM1Ukhw8JVCFayIED60Z1LoeiGEGNDCb39FBeviaG225zz2SaSQo8trXyuiNTMj3My8EEL9Z/Xw2b33Va8KVs4x28U5DVn2LvbcNXLTzYwYlXLY9th/ZlsmhTYc8Fy+XUAynFZKCPfTQmAHE8HauUa43+31QpcMoU2HPXlVsAEOYQ+2kkJrDnvaqmAbHMV+Op33igjLdzsRdFEQIRxACyGciWBjHM4hOr0YPOz1JjCJg9dCi4lgc4RwOE8JqMnBr01NBFvluB6q60ppMTuE+ZgIsp0QjqDrk0QO4ZhGesaZCDbPAR5Nv9eMdtPAdMZLYDERDCCEI+vx4tEEEcY13utLCYwihOMzNYSj2vlB2ANYC03jeE+l9yvKsZ/M0LgJXkSaCGYSwmndfUJpvyJqIWwzzUtGCUwmhEcy5Gm2/lnA0kiyKS+oSyBCeFRDJojrTBZJI4FMTwjnMfwZ6FIiDTvKKsihr0dpjhDOaYQnpOVTqnbcF3amgGwkhIsw5ktUb09kydbPzyMu9UsgOwjhsoxWxAfDTZFGZnJXuznOQ6ugdCGECzX+E1gaOYIH2SvznGb6Ry9CuHR3T+ky+rN6pkUq2rGM7N3RP4YRwppMGMXyaCwza+SBhWXv1rRPCjIIYa2O9Px/vKBaFjH8Hc2TJ0/u/vvLly8z3pOjWvZxF78p3J3qQef5N0LYgmOPC49nBmVBo+RYbseF9UHh8VdaUMlKgPhN5HH/2jzPdxLC1qyPF+X4Q8bjNNZ59fHJkyfbBoIdf7R0VR2dmc/kDG2e5/0JYeMWMZpsnHOsf2Vh9g4Bix4jqp2vL+JcTVL3eT4qIcyy0LFm40zlwVeOpeOTf4YxYuN1u8dfqaF5txZ6Nsbocg6HtFAIo9U0EnWJ5RgLfccOYcfHVWoq3DY1nW+tW+4LvjkIId89GKdKjUPV3mXYnV958r8/fvnype/fOugr7TrkdArcr3Fk3QuX0EIhZJfFpnH9XQ2DPX5693rOb7zxRHds+UY8VTLfsjLKmbPRYs/zjWY54j8c/5+kIo/HsoWkcbHj42Lv2LgWchq0pK4zp657u9e/5r4DVObmkdUmc9/NySWsF5VSNh7c1Wr1+DQY8R+9+8Em/IRn8eXLl+mmdDUyI+RQGwfBbS1c+LzhdoDIHH83HrK5jlfmIVigkKeDEDKJbQPojsniwhvZBj9/eMxmGZZi94LqMU/Uet9ovHdR2vOdO/We56MTQurQ8brjWOfzAj96qstPwNOZXhZ4ns9CCGnKKPt0bp8UDz6M+JDP5h/xXsG4fOh2EUJ47EG3fvzxx1LKf//738Hf0LOM5fNrmAAglPcRAhBNCAGIJoQARBNCAKIJIQDRhBCAaEIIQDQhBCCaEAIQTQgBiCaEAEQTQgCiCSEA0YQQgGhCCEA0IQQgmhACEE0IAYgmhABEE0IAogkhANGEEIBoQghANCEEIJoQAhBNCAGIJoQARBNCAKIJIQDRhBCAaEIIQDQhBCCaEAIQTQgBiCaEAEQTQgCiCSEA0YQQgGhCCEA0IQQgmhACEE0IAYgmhABEE0IAogkhANGEEIBoQghANCEEIJoQAhBNCAGIJoQARBNCAKIJIQDRhBCAaEIIQDQhBCCaEAIQTQgBiCaEAEQTQgCiCSEA0YQQgGhCCEA0IQQgmhACEE0IAYgmhABEE0IAogkhANGEEIBoQghANCEEIJoQAhBNCAGIJoQARBNCAKIJIQDRhBCAaEIIQDQhBCCaEAIQTQgBiCaEAEQTQgCiCSEA0YQQgGhCCEA0IQQgmhACEE0IAYgmhABEE0IAogkhANGEEIBoQghANCEEIJoQAhBNCAGIJoQARBNCAKIJIQDRhBCAaEIIQDQhBCCaEAIQTQgBiCaEAEQTQgCiCSEA0YQQgGhCCEA0IQQgmhACEE0IAYgmhABEE0IAogkhANGEEIBoQghANCEEIJoQAhBNCAGIJoQARBNCAKIJIQDRhBCAaEIIQDQhBCCaEAIQTQgBiCaEAEQTQgCiCSEA0YQQgGhCCEA0IQQgmhACEO3/Ab4j5N7YL9SgAAAAAElFTkSuQmCC'
        ); //BS-1244
        //BS-1244
        //BS-1092 - End

        lensConfigDataMap.put('photoSensationId', productData[0].Id); //BS-1466
        lensConfigDataMap.put('lensColorId', productData[0].Id); //BS-1466
        lensConfigDataMap.put('blueSensationId', productData[0].Id); //BS-1466
        lensConfigDataMap.put('lensDistance', '2'); //BS-1466
        lensConfigDataMap.put('hardCoatingId', productData[0].Id); //BS-1466
        lensConfigDataMap.put('visualPreferences', 'Long-distance'); //BS-1466
        lensConfigDataMap.put('lensEdge', 'semi-matte'); //BS-1466
        lensConfigDataMap.put('glazing', 'Optical Glazing'); //BS-1466
        lensConfigDataMap.put('glassProduct', 'SVS805'); //BS-1466
        lensConfigDataMap.put('blankCoating', 'testSku'); //BS-1466
        lensConfigDataMap.put('lensProductId', productData[0].Id); //BS-1466
        lensConfigDataMap.put('antireflectionId', productData[0].Id); //BS-1466

        return lensConfigDataMap;
    } //end method

    /**
     * BS-1175
     * @description this method creates category Translation records
     * @param : List of Category Ids.
     * @return List<ProductCategoryDataTranslation> : List containing all the category Transaltions for the passed categories.
     */
    public static List<ProductCategoryDataTranslation> createProductCategoryDataTranslation(List<ProductCategory> categoryList) {
        List<ProductCategoryDataTranslation> categoryTranslationList = new List<ProductCategoryDataTranslation>();
        ProductCategoryDataTranslation categoryDataTranslationObj;
        Integer counter = 0;
        for (ProductCategory productCategoryObj : categoryList) {
            categoryDataTranslationObj = new ProductCategoryDataTranslation();
            categoryDataTranslationObj.ParentId = productCategoryObj.Id;
            categoryDataTranslationObj.Language = 'de';
            categoryDataTranslationObj.Name = 'abc' + counter;
            categoryTranslationList.add(categoryDataTranslationObj);
            counter++;
            break;
        }
        insert categoryTranslationList;
        return categoryTranslationList;
    }

    /**
     * BS-1057
     * @description this method creates Country Specific details of Customer service.
     * @return List<B2B_Country_Specific_Preference_Setting__c > : List containing all the category Transaltions for the passed categories.
     */
    public static void createCountrySpecificPreferenceSettingRecords() {
        List<User> userList = [SELECT Id, Username FROM USER LIMIT 1];
        List<B2B_Country_Specific_Preference_Setting__c> countrySpecificPereferenceSettingList = new List<B2B_Country_Specific_Preference_Setting__c>{
            new B2B_Country_Specific_Preference_Setting__c(
                Name = 'Austria',
                B2B_Account_Brand__c = 'Silhouette,evil eye',
                B2B_Country__c = 'Austria',
                B2B_Type__c = 'Customer Service Information',
                B2B_Customer_Service_Telephone_Number__c = '0049(0)7141 4420-10',
                B2B_Customer_Service_Username__c = userList[0].Username
            ),
            new B2B_Country_Specific_Preference_Setting__c(
                Name = 'Germany',
                B2B_Account_Brand__c = 'Silhouette,evil eye',
                B2B_Country__c = 'Germany',
                B2B_Type__c = 'Customer Service Information',
                B2B_Customer_Service_Telephone_Number__c = '0049(0)7141 4420-10',
                B2B_Customer_Service_Username__c = userList[0].Username
            ),
            new B2B_Country_Specific_Preference_Setting__c(
                Name = 'Austria',
                B2B_Account_Brand__c = 'NEUBAU',
                B2B_Country__c = 'Austria',
                B2B_Type__c = 'Customer Service Information',
                B2B_Customer_Service_Telephone_Number__c = '0049(0)7141 4420-10',
                B2B_Customer_Service_Username__c = userList[0].Username
            ),
            new B2B_Country_Specific_Preference_Setting__c(
                Name = 'Germany',
                B2B_Account_Brand__c = 'NEUBAU',
                B2B_Country__c = 'Germany',
                B2B_Type__c = 'Customer Service Information',
                B2B_Customer_Service_Telephone_Number__c = '0049(0)7141 4420-10',
                B2B_Customer_Service_Username__c = userList[0].Username
            ),
            new B2B_Country_Specific_Preference_Setting__c(
                Name = 'Germany',
                B2B_Account_Brand__c = 'Silhouette,evil eye',
                B2B_Country__c = 'Germany',
                B2B_Type__c = 'Footer Facts with T & C',
                B2B_Customer_Service_Telephone_Number__c = '0049(0)7141 4420-10',
                B2B_Company_Opening__c = 'Test',
                B2B_Company_Name__c = 'Test',
                B2B_Language__c = 'de',
                B2B_Terms_And_Conditions__c = 'test.com'
            ),
            new B2B_Country_Specific_Preference_Setting__c(
                Name = 'Germany',
                B2B_Account_Brand__c = 'Silhouette,evil eye',
                B2B_Country__c = 'Germany',
                B2B_Type__c = 'Footer Facts with T & C',
                B2B_Customer_Service_Telephone_Number__c = '0049(0)7141 4420-10',
                B2B_Company_Opening__c = 'Test',
                B2B_Company_Name__c = 'Test',
                B2B_Language__c = 'en_US',
                B2B_Terms_And_Conditions__c = 'test.com'
            )
        };
        insert countrySpecificPereferenceSettingList;
    }

    /**
     * BS-895
     * @description this method creates correct data of Lens shape database
     *
     */
    public static List<B2B_Lens_Shapes__c> createLensShapes(Integer numberOfRecordsToBeCreated) {
        List<B2B_Lens_Shapes__c> lensShapesList = new List<B2B_Lens_Shapes__c>();
        for (Integer i = 0; i < numberOfRecordsToBeCreated; i++) {
            B2B_Lens_Shapes__c lensShapeObj = new B2B_Lens_Shapes__c(
                B2B_EE_Size__c = 'L',
                B2B_Model__c = 'e018',
                B2B_Shape_Name__c = 'e018',
                B2B_OMAShapeKey__c = 'TEST_ESV_111' + i,
                B2B_Mounting_Type__c = 'b'
            ); //BS-895
            lensShapesList.add(lensShapeObj);
        }
        return lensShapesList;
    }

    /**
     * BS-895
     * @description this method creates correct data of Lens shape database
     *
     */
    public static Map<String, Object> createUserInputResponseForOMA() {
        return new Map<String, Object>{
            'features' => 'AR,GR',
            'removeDrills' => false,
            'a' => 1.1, //BS-791
            'b' => 1.1, //BS-791
            'sf' => 1.1, //BS-791
            'b1' => 1.1, //BS-791
            'b2' => 1.1, //BS-791
            'blp' => 1.1, //BS-791
            'lensShapeImage' => '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',
            'lensShape' => 'Oval',
            'lensSize' => '1.3',
            'showAllShapes' => true,
            // BS-1473
            'accentRingColorProductId' => null,
            'accentRingColorSKU' => 'test12345',
            'removeGrooveValue' => true,
            'withAccentRingValue' => true,
            'accentRingImageUrl' => null,
            'featureValue' => 'B',
            'withColoredGroove' => true,
            'coloredGrooveColorProductId' => null,
            'omaShapeKeyValue' => '123456',
            'selectedLensShapeId' => ''
        };
    }

    /**
     * BS-980
     * @description this method creates correct data of Lens shape database
     *
     */
    public static Map<String, Object> createUserInputNullResponseForOMA() {
        return new Map<String, Object>{
            'features' => '',
            'removeDrills' => false,
            'a' => null, //BS-791
            'b' => null, //BS-791
            'sf' => null, //BS-791
            'b1' => null, //BS-791
            'b2' => null, //BS-791
            'blp' => null, //BS-791
            'lensShapeImage' => null,
            'lensShape' => null,
            'lensSize' => null,
            'showAllShapes' => false,
            // BS-1473
            'accentRingColorProductId' => null,
            'accentRingColorSKU' => null,
            'removeGrooveValue' => true,
            'withAccentRingValue' => false,
            'accentRingImageUrl' => null,
            'featureValue' => null,
            'withColoredGroove' => true,
            'coloredGrooveColorProductId' => null,
            'omaShapeKeyValue' => null,
            'selectedLensShapeId' => ''
        };
    }

    /**
     * @author Chirag L
     * BS-1248
     * @email chirag.lapasia@theblueflamelabs.com
     * @description This class is used to test schneider callout through creating the mock responses based on status codes
     */
    public without sharing class B2B_SchneiderCalloutMockInterface implements HttpCalloutMock {
        public Integer statusCode;
        public String responseBody;

        /**
         * BS-1248
         * @description The following parameterised constructor is used to setup status code and reesponse body on basis of provided status code
         *
         * statusCode : status code that needs to be set for HTTP response (example: 200, 404, 503)
         */
        public B2B_SchneiderCalloutMockInterface(Integer statusCode, Boolean success) {
            if (statusCode == 200) {
                this.statusCode = 200;
                if (success != null && success == true) {
                    this.responseBody = '{ "images": ["","",""],"success": true,"msg": null,"raw": null,"errorCode": null,"left": {"images": ["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","",""],"centerThickness": 3.11,"weight": 6.059212,"edge": {"rdMin": 1.3,"rdMax": 2.9,"axis": null,"axisMin": 325.0,"axisMax": 104.0}},';
                    this.responseBody += '"right": {"images": ["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","",""],"centerThickness": 3.11,"weight": 6.059212,"edge": {"rdMin": 1.3,"rdMax": 2.9,"axis": null,"axisMin": 325.0,"axisMax": 104.0}';
                    this.responseBody += '},"silhData": {"statusCode": 1,"infoCode": "","infoText": "","behav": "","preCalcGuid": "ffbc272a-c9a2-43e7-a713-39047f3c89bb" }}';
                } else if (success != null && success == false) {
                    this.responseBody = '{"images": [],"success": false, "msg": "Calculation failed -1102 ERROR XSTATUS=R;XPB01016;1016;Blank center thickness 1.21mm too small;E XSTATUS=Status error;-1102;Status error;E XSTATUS=L;XPB01016;1016;Blank center thickness 1.21mm too small;E XSTATUS=Status error;-1102;Status error;E",';
                    this.responseBody += ' "raw": null, "errorCode": -1102, "left": null, "right": null, "silhData": { "statusCode": 1, "infoCode": "ERR0006", "infoText": "Rechtes Glas:<br/> edge thickness of the blank is to low<br/>maximum edge thickness is too high.Please choose a smaller shape or use the possibility of scaling.(1016)<br/>Linkes Glas:<br/> edge thickness of the blank is to low<br/>maximum edge thickness is too high.Please choose a smaller shape or use the possibility of scaling.(1016)","behav": "3", "preCalcGuid": "0eae3d33-9232-4a84-98ec-5abbaefd9f0b"}}';
                } else if (success == null) {
                    this.responseBody = '{"images": [],"success": false, "msg": "MaxWaitThreshold of 4 is reached. Please come back later.",';
                    this.responseBody += ' "raw": null, "errorCode": 4, "left": null, "right": null, "silhData": { "statusCode": -1, "infoCode": null, "infoText": "DB Error","behav": null, "preCalcGuid": "8a054de1-085d-4f60-b483-39d4d4330532"}}';
                }
            } else if (statusCode == 404) {
                this.statusCode = 404;
                this.responseBody = '{ "suppressed" : [], "stackTrace" : [], "message" : "OMA data not found", "localizedMessage" : "OMA data not found", "cause" : null }';
            } else if (statusCode == 503) {
                this.statusCode = 503;
                this.responseBody = '{"timestamp": "2023-05-29T04:41:11.739+00:00", "status": 500, "error": "Internal Server Error", "path": "/schneider/calculate"}';
            } else if (statusCode == 0) {
                // Creating the scenario of any unknown error during schneider callout
                this.statusCode = 200;
                this.responseBody = '{"images": [],"success": false,"msg": "Calculation failed -1080 ERROR XSTATUS=E;-1080;E;E XSTATUS=E;-1080;E;E XSTATUS=E;-1080;E;E XSTATUS=E;-1080;E;E","raw": null,"errorCode": -1080,"left": null,"right": null,"silhData": {"statusCode": -1,"infoCode": null,"infoText": "DB Error","behav": null,"preCalcGuid": "7a24ffcb-d983-4566-8048-09dc1713784e"}}';
            } else if (statusCode == 100) {
                //BS-1914 Added a mock that has success = true but preCalcGuid is blank
                this.statusCode = 200;
                this.responseBody = '{ "images": ["","",""],"success": true,"msg": null,"raw": null,"errorCode": null,"left": {"images": ["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","",""],"centerThickness": 3.11,"weight": 6.059212,"edge": {"rdMin": 1.3,"rdMax": 2.9,"axis": null,"axisMin": 325.0,"axisMax": 104.0}},';
                this.responseBody += '"right": {"images": ["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","",""],"centerThickness": 3.11,"weight": 6.059212,"edge": {"rdMin": 1.3,"rdMax": 2.9,"axis": null,"axisMin": 325.0,"axisMax": 104.0}';
                this.responseBody += '},"silhData": {"statusCode": 1,"infoCode": "","infoText": "","behav": "","preCalcGuid": "" }}';
            } else {
                this.statusCode = statusCode;
                this.responseBody = '{"timestamp": "2023-05-29T04:41:11.739+00:00", "status": 500, "error": "Internal Server Error", "path": "/schneider/calculate"}';
            }
        }

        /**
         * BS-1248
         * @description The following method returns the HTTP response as a mock callout response
         * @param   request  : HTTP request that needs to be sent for making a callout
         * @return  response : HTTP response with body and status code
         */
        public HTTPResponse respond(HTTPRequest request) {
            HttpResponse response = new HttpResponse();
            response.setHeader('Content-Type', 'application/json');
            response.setBody(responseBody);
            response.setStatusCode(statusCode);
            return response;
        }
    }

    /**
     * @author Chirag L
     * BS-895
     * @email chirag.lapasia@theblueflamelabs.com
     * @description This class is used to test schneider callout through creating the mock responses based on status codes
     */
    public without sharing class B2B_OMACalloutMockInterface implements HttpCalloutMock {
        public Integer statusCode;
        public String responseBody;

        /**
         * BS-895
         * @description The following parameterised constructor is used to setup status code and reesponse body on basis of provided status code
         *
         * statusCode : status code that needs to be set for HTTP response (example: 200, 404, 503)
         */
        public B2B_OMACalloutMockInterface(Integer statusCode, Boolean success) {
            if (statusCode == 200) {
                this.statusCode = 200;
                if (success != null && success == true) {
                    this.responseBody = '{"coordinates": [{"x": 26.221974547522869,"y": -0.3059525979007372},{"x": 26.283593102389624,"y": -0.13452098105674518}],"height": 45.862454072000006,"width": 55.874110527,"drills": [{"start": {"x": -25.321074406760893,"y": 8.99062592507166},"end": {"x": -25.321074406760893,"y": 8.99062592507166},"diameter": 1.4}],"oma": "REQ=FRM10.","hasDrills": true,"allowedScaling": {}}';
                } else if (success != null && success == false) {
                    this.responseBody = '<html><head><base href="/error_path/"><title>404 Not Found</title></head><body><h1>Not Found</h1><p>The document at the specified URL does not exist.</p><p>Your request ID was: ZMJLGFYdNrg2cYKHpr@vOAAAAC8</p></body></html>';
                } else if (success == null) {
                    this.responseBody = '{"images": [],"success": false, "msg": "MaxWaitThreshold of 4 is reached. Please come back later.",';
                    this.responseBody += ' "raw": null, "errorCode": 4, "left": null, "right": null, "silhData": { "statusCode": -1, "infoCode": null, "infoText": "DB Error","behav": null, "preCalcGuid": "8a054de1-085d-4f60-b483-39d4d4330532"}}';
                }
            } else if (statusCode == 404) {
                this.statusCode = 404;
                this.responseBody = '{ "suppressed" : [], "stackTrace" : [], "message" : "OMA data not found", "localizedMessage" : "OMA data not found", "cause" : null }';
            } else if (statusCode == 503) {
                this.statusCode = 503;
                this.responseBody = '{"timestamp": "2023-05-29T04:41:11.739+00:00", "status": 500, "error": "Internal Server Error", "path": "/oma/oma"}';
            } else if (statusCode == 0) {
                // Creating the scenario of any unknown error during schneider callout
                this.statusCode = 200;
                this.responseBody = '{"images": [],"success": false,"msg": "Calculation failed -1080 ERROR XSTATUS=E;-1080;E;E XSTATUS=E;-1080;E;E XSTATUS=E;-1080;E;E XSTATUS=E;-1080;E;E","raw": null,"errorCode": -1080,"left": null,"right": null,"silhData": {"statusCode": -1,"infoCode": null,"infoText": "DB Error","behav": null,"preCalcGuid": "7a24ffcb-d983-4566-8048-09dc1713784e"}}';
            } else if (statusCode == 303) {
                // Creating the scenario of any unknown error during schneider callout
                this.statusCode = 303;
                this.responseBody = '<html><body>Please follow <a href="/oma/?features=b,noScale&amp;shapeId=AA&amp;size=54&amp;removeDrills=false&amp;omaOnly=false">this link</a></body></html>';
            } else {
                this.statusCode = statusCode;
                this.responseBody = '{"timestamp": "2023-05-29T04:41:11.739+00:00", "status": 500, "error": "Internal Server Error", "path": "/oma/oma"}';
            }
        }

        /**
         * BS-895
         * @description The following method returns the HTTP response as a mock callout response
         * @param   request  : HTTP request that needs to be sent for making a callout
         * @return  response : HTTP response with body and status code
         */
        public HTTPResponse respond(HTTPRequest request) {
            HttpResponse response = new HttpResponse();
            response.setHeader('Content-Type', 'application/json');
            response.setBody(responseBody);
            response.setStatusCode(statusCode);
            return response;
        }
    }

    //BS-498
    /**
     * @description Returns a List of B2B_Survey__c
     * @param numberOfRecords - number of records to be created
     * @param IsActive - survey active or not(boolean values)
     * @return List<B2B_Survey__c>
     */
    public static List<B2B_Survey__c> createSurveys(Integer numberOfRecords, Boolean IsActive) {
        List<B2B_Survey__c> surveyList = new List<B2B_Survey__c>();

        for (Integer index = 0; index <= numberOfRecords; index++) {
            B2B_Survey__c surveyObj = new B2B_Survey__c();
            surveyObj.B2B_Is_Active__c = IsActive;
            surveyObj.B2B_Number_Of_Logins__c = 10;
            surveyList.add(surveyObj);
        }

        insert surveyList;
        return surveyList;
    }

    //BS-498
    /**
     * @description Returns a List of B2B_Question__c
     * @param numberOfRecords - number of records to be created
     * @param questionString - Actual Question String
     * @param questionType - Question Type (Options/Text)
     * @return List<B2B_Question__c>
     * Method updated as part of BS-1610 for updated data model
     */
    public static List<B2B_Question__c> createQuestions(
        String language,
        String questionString,
        String questionType,
        List<B2B_Survey_Question__c> surveyQuestionList
    ) {
        List<B2B_Question__c> questionList = new List<B2B_Question__c>();
        Integer index = 0;
        for (B2B_Survey_Question__c surveyQuestionObj : surveyQuestionList) {
            B2B_Question__c questionobj = new B2B_Question__c();
            questionobj.B2B_Survey_Question__c = surveyQuestionObj.Id;
            questionobj.B2B_Language__c = language;
            questionobj.B2B_Question__c = questionString + index + ' ?';
            questionobj.B2B_Type__c = questionType;
            questionList.add(questionobj);
            index++;
        }

        insert questionList;
        return questionList;
    }

    //BS-498
    /**
     * @description Returns a List of B2B_Survey_Question__c
     * @param language - users language
     * @param questionId - question Id which needs to map wih survey question
     * @return List<B2B_Survey_Question__c>
     * Method updated as part of BS-1610 for updated data model
     */
    public static List<B2B_Survey_Question__c> createSurveyQuestions(Id surveyId, Integer numberOfRecords) {
        List<B2B_Survey_Question__c> surveyQuestionList = new List<B2B_Survey_Question__c>();

        for (Integer index = 0; index < numberOfRecords; index++) {
            B2B_Survey_Question__c surveyQuestionObj = new B2B_Survey_Question__c();
            surveyQuestionObj.B2B_Survey_Question_Number__c = index;
            surveyQuestionObj.B2B_Survey__c = surveyId;
            surveyQuestionList.add(surveyQuestionObj);
        }

        insert surveyQuestionList;
        return surveyQuestionList;
    }

    //BS-498
    /**
     * @description Returns a List of B2B_Option__c
     * @param labelName - option label name
     * @param imageURL - Image url
     * @param questionId - question Id which needs to map wih survey option
     * @return List<B2B_Option__c>
     */
    public static List<B2B_Option__c> createOptions(String labelName, String imageURL, List<B2B_Question__c> questionList) {
        List<B2B_Option__c> surveyOptionList = new List<B2B_Option__c>();
        Integer index = 0;
        for (B2B_Question__c questionObj : questionList) {
            B2B_Option__c optionObj = new B2B_Option__c();
            optionObj.B2B_Label__c = labelName + index;
            optionObj.B2B_API_Name__c = 1;
            optionObj.B2B_Image__c = imageURL;
            optionObj.B2B_Question__c = questionObj.Id;
            surveyOptionList.add(optionObj);

            B2B_Option__c secondOptionObj = new B2B_Option__c();
            secondOptionObj.B2B_Label__c = labelName + index;
            secondOptionObj.B2B_API_Name__c = 2;
            secondOptionObj.B2B_Image__c = imageURL;
            secondOptionObj.B2B_Question__c = questionObj.Id;
            surveyOptionList.add(secondOptionObj);
            index++;
        }

        insert surveyOptionList;
        return surveyOptionList;
    }

    //BS-498
    /**
     * @description Returns a List of B2B_Survey_Response__c
     * @param numberOfRecords - number of records to be created
     * @param accountId - account Id associated with survey response
     * @param responseDateTime - survey response date and time
     * @param surveyStatus - survey status
     * @return List<B2B_Survey_Response__c>
     */
    public static List<B2B_Survey_Response__c> createSurveyResponse(
        Integer numberOfRecords,
        Id accountId,
        Datetime responseDateTime,
        String surveyStatus,
        Id surveyId
    ) {
        List<B2B_Survey_Response__c> surveyResponseList = new List<B2B_Survey_Response__c>();

        for (Integer index = 0; index < numberOfRecords; index++) {
            B2B_Survey_Response__c surveyResponseObj = new B2B_Survey_Response__c();
            surveyResponseObj.B2B_Account__c = accountId;
            surveyResponseObj.B2B_Survey__c = surveyId;
            surveyResponseObj.B2B_Date_Time_Of_Survey__c = responseDateTime;
            surveyResponseObj.B2B_Survey_Status__c = surveyStatus;
            surveyResponseList.add(surveyResponseObj);
        }

        insert surveyResponseList;
        return surveyResponseList;
    }

    //BS-498
    /**
     * @description Returns a List of B2B_Survey_Answer__c
     * @param numberOfRecords - number of records to be created
     * @param surveyId - survey Id associated with question
     * @param surveyResponseId - survey response Id
     * @return List<B2B_Survey_Answer__c>
     */
    public static List<B2B_Survey_Answer__c> createSurveyAnswers(Integer numberOfRecords, Id surveyId, Id surveyResponseId, Id surveyQuestionId) {
        List<B2B_Survey_Answer__c> answerList = new List<B2B_Survey_Answer__c>();

        for (Integer index = 0; index <= numberOfRecords; index++) {
            B2B_Survey_Answer__c surveyAnswerObj = new B2B_Survey_Answer__c();
            surveyAnswerObj.B2B_Survey__c = surveyId;
            surveyAnswerObj.B2B_Survey_Response__c = surveyResponseId;
            surveyAnswerObj.B2B_Survey_Question__c = surveyQuestionId;
            surveyAnswerObj.B2B_Associated_Score__c = 1;
            surveyAnswerObj.B2B_Answer_Comment__c = 'Test';
            answerList.add(surveyAnswerObj);
        }

        insert answerList;
        return answerList;
    }

    //BS-1514
    /**
     * @description Returns a List of B2B_Survey_Answer__c
     * @param accountId - Id of the accoun to which the order will be related
     * @return List<Order>
     */
    public static List<Order> createInsertOrderDataForReorder(
        Id accountId,
        Pricebook2 pricebook,
        Product2 productObj,
        Id productId,
        List<PricebookEntry> pricebookEntryList
    ) {
        List<CommerceEntitlementProduct> entitlementProductList = [SELECT Id, ProductId FROM CommerceEntitlementProduct LIMIT 1];
        Id orderRecordTypeId = Schema.SObjectType.Order.getRecordTypeInfosByDeveloperName()
            .get(B2B_Constants.B2B_ORDER_RECORDTYPE_DEVELOPERNAME)
            .getRecordTypeId();
        Order orderObj = new Order(
            Name = 'Test Order',
            RecordTypeId = orderRecordTypeId,
            OrderedDate = System.now(),
            AccountId = accountId,
            EffectiveDate = System.today(),
            Status = 'Draft',
            Pricebook2Id = pricebook.Id,
            Order_Source__c = 'Partner Portal'
        );
        Order orderTestObj = new Order(
            Name = 'Test Order Two',
            AccountId = accountId,
            EffectiveDate = System.today(),
            Status = 'Draft',
            Pricebook2Id = pricebook.Id,
            RecordTypeId = orderRecordTypeId,
            OrderedDate = System.now(),
            Order_Source__c = 'Partner Portal'
        );

        List<Order> orderList = new List<Order>();
        orderList.add(orderObj);
        orderList.add(orderTestObj);

        insert orderList;

        List<OrderItem> orderItemList = new List<OrderItem>();
        OrderItem orderItemObj = new OrderItem(
            Product2Id = entitlementProductList[0].ProductId,
            OrderId = orderObj.Id,
            PricebookEntryId = pricebookEntryList[0].Id,
            UnitPrice = 153,
            TotalLineAmount = 153,
            Quantity = 2
        );
        OrderItem orderItemTestObj = new OrderItem(
            Product2Id = productId,
            OrderId = orderTestObj.Id,
            PricebookEntryId = pricebookEntryList[0].Id,
            UnitPrice = 199,
            TotalLineAmount = 199,
            Quantity = 2
        );
        orderItemList.add(orderItemObj);
        orderItemList.add(orderItemTestObj);

        insert orderItemList;

        return orderList;
    }

    /**
     * @description Returns a List of commerce products links
     * @return List<B2B_Commerce_Product_Link__c>
     */
    public static List<B2B_Commerce_Product_Link__c> createCommerceLinkProducts() {
        List<Product2> productsList = B2B_TestDataFactory.createProducts(2, null);
        insert productsList;

        List<Product2> productList = [SELECT Id, StockKeepingUnit, B2B_Schneider_SKU__c FROM Product2 LIMIT 2];

        List<B2B_Commerce_Product_Link__c> commerceProductsToInsertList = new List<B2B_Commerce_Product_Link__c>();

        B2B_Commerce_Product_Link__c commerceProduct = new B2B_Commerce_Product_Link__c();
        commerceProduct.B2B_Source_Product__c = productList[0].Id;
        commerceProduct.B2B_Schneider_SKU__c = productList[0].B2B_Schneider_SKU__c;
        commerceProduct.B2B_Type__c = B2B_Constants.RELATION_TYPE_HARDCOATING;
        commerceProduct.B2B_Target_Product__c = productList[1].Id;
        commerceProductsToInsertList.add(commerceProduct);

        B2B_Commerce_Product_Link__c commerceProduct2 = new B2B_Commerce_Product_Link__c();
        commerceProduct2.B2B_Source_Product__c = productList[0].Id;
        commerceProduct2.B2B_Schneider_SKU__c = productList[0].B2B_Schneider_SKU__c;
        commerceProduct2.B2B_Type__c = B2B_Constants.RELATION_TYPE_ANTIREFLECTION;
        commerceProduct.B2B_Target_Product__c = productList[1].Id;
        commerceProductsToInsertList.add(commerceProduct2);

        insert commerceProductsToInsertList;
        return commerceProductsToInsertList;
    }
    //BS-1148
    public static List<B2B_Lens_Configurator__c> createRecordsForLensConfigurator() {
        Account account = new Account(k_ARIS_Account_ID__c = 'Test_1', k_Account_No__c = 'Test_5', Name = 'Test');
        insert account;

        List<Product2> productList = B2B_TestDataFactory.createProducts(2, null);
        insert productList;

        List<B2B_Lens_Configurator__c> configurationList = new List<B2B_Lens_Configurator__c>();
        B2B_Lens_Configurator__c lensConfiguratorObj = new B2B_Lens_Configurator__c(
            B2B_Selected_Frame__c = 'Test Product SKU 1',
            B2B_Selected_RX_Solution_SKU__c = 'Test Product SKU 2',
            B2B_Pupil_Distance_Left_Eye__c = 27.0,
            B2B_Pupil_Distance_Right_Eye__c = 27.0,
            B2B_Fitting_height_Left_Eye__c = 5,
            B2B_Measurement_System__c = 'Boxing System',
            B2B_Progression_Length__c = 18,
            B2B_Features__c = 'E',
            B2B_Lens_Shape__c = 'e018',
            B2B_Bridge__c = '14',
            B2B_Lens_Size__c = 59,
            B2B_Eye_Side__c = 'Right lens',
            B2B_Antireflection_SKU__c = 'C0001',
            B2B_Hard_Coating_SKU__c = 'C0004',
            B2B_Evil_Eye_Edge__c = true,
            B2B_Salesconcept__c = 'E018',
            B2B_Temple__c = '130',
            B2B_Remove_Drills__c = false,
            B2B_Schneider_SKU__c = 'ESV001',
            B2B_Variant_Shape__c = 'E018',
            B2B_RX_Picture_Link__c = 'testlink',
            B2B_Lens_Picture_Link__c = 'testlink',
            B2B_Lens_Color__c = 'LST bright',
            B2B_Lenses_without_Adapter__c = true,
            B2B_Account__c = account.Id,
            B2B_Final_PreCalcGuid__c = 'abcdefgh',
            B2B_Type__c = 'Vision Sensation',
            B2B_Customer_Name__c = 'test',
            B2B_Order_Type__c = 'Complete Eyewear',
            B2B_Clerk__c = 'test',
            B2B_Addition_Left__c = 1,
            B2B_Addition_Right__c = 1,
            B2B_Axis_Left__c = 1,
            B2B_Axis_Right__c = 1,
            B2B_Cylinder_Left__c = 1,
            B2B_Cylinder_Right__c = 1,
            B2B_Prism_1_Left__c = 1,
            B2B_Prism_1_Right__c = 1,
            B2B_Prism2_Left__c = 1,
            B2B_Prism2_Right__c = 1,
            B2B_Prism_base2_Left__c = 1,
            B2B_Prism_base2_Right__c = 1,
            B2B_Sphere_Right__c = '1',
            B2B_PB1Placement_Left__c = 'Out',
            B2B_PB1_Left__c = 1,
            B2B_PB1_Right__c = 1,
            B2B_PB1Placement_Right__c = 'In',
            B2B_PB2Placement_Right__c = 'Up',
            B2B_PB2Placement_Left__c = 'Up',
            B2B_Sphere_Left__c = '1',
            B2B_Fitting_height_Right_Eye__c = 1,
            B2B_Pantoscopic_tilt__c = 1,
            B2B_Working_Distance__c = '1',
            B2B_Thickness_Matching_Calculator_Left__c = 1,
            B2B_Thickness_Matching_Calculator_Right__c = 1,
            B2B_Special_Handling__c = 'No selection',
            B2B_Note__c = 'test',
            B2B_RX_Solution__c = 'Direct Glazing',
            B2B_RX_Type__c = 'test',
            B2B_Lens_Type__c = 'Panorama Single Vision',
            B2B_Lens_Index__c = '1,67',
            B2B_RX_Solution_Description__c = 'test',
            B2B_Lens_Material__c = 'Plastic',
            B2B_Base_Values__c = 'No Prism',
            B2B_BVD_refracted__c = 1,
            B2B_BVD_worn__c = 1,
            B2B_a__c = 0,
            B2B_b__c = 0,
            B2B_b1__c = 0,
            B2B_b2__c = 0,
            B2B_SF__c = 0,
            B2B_blp__c = 0,
            B2B_Accent_Ring__c = false,
            B2B_With_Color_Groove__c = false,
            B2B_Remove_Groove__c = false,
            B2B_Selected_Accent_Ring_Product__c = productList[0].Id,
            B2B_Selected_Accent_Ring_Image__c = 'www.url.com',
            B2B_Selected_Color_Groove_Product__c = productList[0].Id,
            B2B_Coordinates__c = '{"x": 26.221974547522869,"y": -0.3059525979007372}',
            B2B_OMA_Height__c = '45.862454072000006',
            B2B_Width__c = '55.874110527',
            B2B_Drills__c = '[{"start":{"y":8.389913016398388,"x":-26.620270491562408},"ends":{"y":8.389913016398388,"x":-26.620270491562408},"diameter":1.4},{"start":{"y":8.549913016398389,"x":-23.630270491562406},"ends":{"y":8.549913016398389,"x":-23.630270491562406},"diameter":1.4},{"start":{"y":9.569913016398388,"x":26.529729508437594},"ends":{"y":9.569913016398388,"x":26.529729508437594},"diameter":1.4},{"start":{"y":9.569913016398388,"x":23.529729508437594},"ends":{"y":9.569913016398388,"x":23.529729508437594},"diameter":1.4}]',
            B2B_OMA__c = 'REQ=FRM10.',
            B2B_hasDrills__c = true,
            B2B_allowedScaling__c = '{"sf":{"min":0.0,"max":0.0},"blp":{"min":0.0,"max":0.0},"b2":{"min":0.0,"max":0.0},"b1":{"min":0.0,"max":0.0},"b":{"min":0.0,"max":0.0},"a":{"min":0.0,"max":0.0}}',
            B2B_Antireflection_Product__c = productList[0].Id,
            B2B_Hard_Coating_Product__c = productList[0].Id,
            B2B_Lens_Color_Id__c = productList[0].Id,
            B2B_Photo_Sensation__c = productList[0].Id,
            B2B_Blue_Sensation__c = productList[0].Id,
            B2B_Visual_Preference__c = 'middle-distance',
            B2B_Lens_Distance__c = 1,
            B2B_Lens_Edge__c = 'semi-matte',
            B2B_Glazing_Type__c = 'Optical Glazing'
        );
        configurationList.add(lensConfiguratorObj);
        return configurationList;
    }

    /**
     * @author Sachin Vispute
     * BS-895
     * @email : sachin.vispute@theblueflamelabs.com
     * @description This class is used to test vision zone anlaysis callout through creating the mock responses based on status codes
     */
    public without sharing class B2B_VisionZoneAnalysisCalloutMockInterface implements HttpCalloutMock {
        public Integer statusCode;
        public String responseBody;

        /**
         * BS-967
         * @description The following parameterised constructor is used to setup status code and reesponse body on basis of provided status code
         *
         * statusCode : status code that needs to be set for HTTP response (example: 200, 404)
         */
        public B2B_VisionZoneAnalysisCalloutMockInterface(Integer statusCode, Boolean isError, Boolean fetchIdFlag) {
            if (statusCode == 200 && fetchIdFlag == true) {
                this.statusCode = 200;
                this.responseBody = '{"id":"aaaadf34"}';
            } else if (statusCode == 404 && fetchIdFlag == true && isError == false) {
                this.statusCode = 404;
                this.responseBody = '{"id":"","message":"error"}';
            } else if (statusCode == 404 && isError == true && fetchIdFlag == true) {
                statusCode = 404;
                this.responseBody = '{id:aaaadf34}';
            } else if (statusCode == 200 && fetchIdFlag == false && isError == false) {
                this.statusCode = 200;
                this.responseBody = '{"totalQuestions": 10,"totalAnswers": 10,"result": 0.67,"image": "https://media.silhouette.com/sza/beruf-frage3-icon@3x.png","backgroundImage": "https://media.silhouette.com/sza/beruf-frage3-oval@3x.png","text": "Breites Sehfeld in mittlerer Distanz","answers": {"_2d": 80.0,"_2c": 50.0,"_1b": 20.0,"_3d": 90.0,"_3a": 30.0,"_2b": 40.0,"_1a": 80.0,"_3c": 40.0,"_2a": 30.0,"_3b": 40.0},"overwritten": false}';
            } else if (statusCode == 404 && fetchIdFlag == false && isError == false) {
                this.statusCode = 404;
                this.responseBody = '';
            } else if (statusCode == 404 && fetchIdFlag == false && isError == true) {
                this.statusCode = 404;
                this.responseBody = '{answers={_1a=70.0, _1b=30.0, _2a=20.0, _2b=40.0, _2c=40.0, _2d=40.0, _3a=50.0, _3b=30.0, _3c=30.0, _3d=40.0}, backgroundImage=https://media.silhouette.com/sza/beruf-frage2-oval@3x.png, image=https://media.silhouette.com/sza/beruf-frage2-icon@3x.png, overwritten=false, result=0.33, text=Highlypreciselong-distancevision, totalAnswers=10, totalQuestions=10}';
            } else if (statusCode == 503 && fetchIdFlag == false && isError == true) {
                this.statusCode = 503;
                this.responseBody = '{answers={_1a=70.0, _1b=30.0, _2a=20.0, _2b=40.0, _2c=40.0, _2d=40.0, _3a=50.0, _3b=30.0, _3c=30.0, _3d=40.0}, backgroundImage=https://media.silhouette.com/sza/beruf-frage2-oval@3x.png, image=https://media.silhouette.com/sza/beruf-frage2-icon@3x.png, overwritten=false, result=0.33, text=Highlypreciselong-distancevision, totalAnswers=10, totalQuestions=10}';
            } //BS-1815
        }

        /**
         * BS-967
         * @description The following method returns the HTTP response as a mock callout response
         * @param   request  : HTTP request that needs to be sent for making a callout
         * @return  response : HTTP response with body and status code
         */
        public HTTPResponse respond(HTTPRequest request) {
            HttpResponse response = new HttpResponse();
            response.setBody(responseBody);
            response.setStatusCode(statusCode);
            return response;
        }
    }
}
