@isTest
@SuppressWarnings('PMD.avoiddeeplynestedifstmts')
public with sharing class D2C_TestDataFactory {
    public static final String PRODUCT_TEST_DESCRIPTION = 'Test Product Description';
    public static String productTestSku = 'TestSKU';

    /**
     * @description Returns a test product image
     * @param productId - product id for the product image
     * @return B2B_Product_Image__c
     * NBD2C-39
     */
    public static List<B2B_Product_Image__c> createProductImages(List<String> productIdList) {
        List<B2B_Product_Image__c> productImageList = new List<B2B_Product_Image__c>();
        for (Integer index = 0; index < productIdList.size(); index++) {
            B2B_Product_Image__c productImage = new B2B_Product_Image__c();
            productImage.B2B_Product__c = productIdList[index];
            productImage.B2B_Image_Order__c = index;
            productImage.B2B_Image_Title__c = 'Test title' + index;
            productImage.B2B_Image_URL__c = 'Test url' + index;
            productImage.B2B_Image_Alt_Text__c = 'Test alt text' + index;
            productImage.B2B_External_Id__c = 'Test external id' + index;
            productImage.D2C_Product_Image_Type__c = 'Model Image';
            productImageList.add(productImage);
        }

        return productImageList;
    }

    /**
     * @description Returns a test products
     * @return List of Product2
     * NBD2C-39
     */
    public static List<Product2> createProducts(Integer size) {
        List<Product2> testProducts = new List<Product2>();
        for (Integer index = 0; index < size; index++) {
            Product2 product = new Product2(
                Name = productTestSku + index,
                Description = PRODUCT_TEST_DESCRIPTION,
                StockKeepingUnit = productTestSku + index,
                IsActive = true
            );
            testProducts.add(product);
        }
        return testProducts;
    }

    /**
     * NBD2C-29
     * @description This reusable method is used to create product images for D2C Products for provided media type
     * @author Sachin V
     * @param productImagesToBeCreated  :   Number of product Images that needs to be created
     * @param productImageType          :   Type of image that needs to be created (Model Image/Product Image)
     * @param productIdsList            :   List containing Ids of products that needs to be mapped againt product image records.
     * @return productImagesList        :   Output Collection of type list containing product image records
     */
    public static List<B2B_Product_Image__c> createD2CProductImages(Integer productImagesToBeCreated, String productImageType, List<Product2> productIdsList) {
        if (productImagesToBeCreated != null && String.isNotBlank(productImageType) && productIdsList.isEmpty() == false) {
            List<B2B_Product_Image__c> productImagesList = new List<B2B_Product_Image__c>();
            for (Integer index = 0; index < productImagesToBeCreated; index++) {
                B2B_Product_Image__c productImage = new B2B_Product_Image__c();

                //If the image type is 'Model Image' then creating single model image record for every product as model images cannot be multiple for single product
                if (productImagesToBeCreated == productIdsList.size() && productImageType.equalsIgnoreCase(D2C_Constants.MODEL_IMAGE)) {
                    productImage.B2B_Product__c = productIdsList[index] != null && productIdsList[index].Id != null ? productIdsList[index].Id : null;
                } else {
                    //If the image type is  other than 'Model Image' then creating multiple images record for single product as there can be multiple images for single product
                    productImage.B2B_Product__c = productIdsList[0] != null && productIdsList[0].Id != null ? productIdsList[index].Id : null;
                }
                productImage.B2B_Image_Order__c = 0;
                productImage.B2B_Image_Title__c = 'Test Model Image' + index;
                productImage.B2B_Image_URL__c = 'Test_Image_URL';
                productImage.D2C_Product_Image_Type__c = productImageType;
                productImage.D2C_Available_In__c = 'D2C';
                productImage.D2C_Active__c = true;
                productImagesList.add(productImage);
            }
            return productImagesList;
        } else {
            return null;
        }
    }

    /**
     * NBD2C-29
     * @description This reusable method is used to create product records according to provided input
     * @author Sachin V
     * @param productRecordsToBeCreated  :   Number of products that needs to be created
     * @return productList               :   Output Collection of type list containing product records
     */
    public static List<Product2> createD2CProducts(Integer productRecordsToBeCreated) {
        if (productRecordsToBeCreated != null) {
            List<Product2> productList = new List<Product2>();
            for (Integer index = 0; index < productRecordsToBeCreated; index++) {
                Product2 product = new Product2();
                product.Name = 'Test Product' + index;
                product.Type = null;
                product.StockKeepingUnit = 'TEST001' + index;
                product.IsActive = true;
                productList.add(product);
            }
            return productList;
        } else {
            return null;
        }
    }

    /**
     * NBD2C-49
     * @description This reusable method is used to create product records according to provided input
     * @author Shrihari
     * @param productCount          : Number of products that needs to be created
     * @param fieldVsValueListMap   : A map of model and salesconcept field and list of their values.
     * @return productList          : Output Collection of type list containing product records
     */
    public static List<Product2> createD2CProductsRecords(Integer productCount, Map<String, List<String>> fieldVsValueListMap) {
        if (productCount != null && fieldVsValueListMap.isEmpty() == false) {
            Integer modelListSize = fieldVsValueListMap.get('model').size();
            Integer salesConceptListSize = fieldVsValueListMap.get('salesConcept').size();
            List<Product2> productList = new List<Product2>();
            for (Integer index = 0; index < productCount; index++) {
                Product2 product = new Product2();
                product.Name = 'Test Product' + index;
                product.Type = null;
                product.StockKeepingUnit = 'TEST SKU' + index;
                product.IsActive = true;
                product.B2B_Frame_Color_Description__c = 'dark Grey';
                product.B2B_Hexcode__c = '#667596';
                product.B2B_Hexcode_Accent__c = null;
                product.B2B_Shape_Size__c = '50';
                product.B2B_Bridge_Size__c = '21';
                product.B2B_Temple_Length__c = '140';
                product.Product_Description__c = PRODUCT_TEST_DESCRIPTION;
                product.B2B_Lens_Technology__c = 'EF101;EF104';
                product.B2B_Model_Name__c = 'Accent Shades 8164';
                product.B2B_Lens_Technology__c = 'Mirrored;Polarised filter - Intelligent sun protection;Anti-reflective coating on backside;Prescription ready';
                product.B2B_Model__c = fieldVsValueListMap.get('model')[Math.mod(productCount, modelListSize)];
                product.B2B_Salesconcept__c = fieldVsValueListMap.get('salesConcept')[Math.mod(productCount, salesConceptListSize)];
                productList.add(product);
            }
            return productList;
        } else {
            return null;
        }
    }

    /**
     * NBD2C-49
     * @description This reusable method is used to create product images for D2C Products for provided media type
     * @author Shrihari
     * @param productImagesToBeCreated  :   Number of product Images that needs to be created
     * @param productImageType          :   Type of image that needs to be created (Model Image/Product Image)
     * @param productIdsList            :   List containing Ids of products that needs to be mapped againt product image records.
     * @return productImagesList        :   Output Collection of type list containing product image records
     */
    public static List<B2B_Product_Image__c> createD2CProductImagesRecords(
        Integer productImagesToBeCreated,
        String productImageType,
        List<Product2> productIdsList
    ) {
        if (productImagesToBeCreated != null && String.isNotBlank(productImageType) && productIdsList.isEmpty() == false) {
            List<B2B_Product_Image__c> productImagesList = new List<B2B_Product_Image__c>();
            for (Integer index = 0; index < productImagesToBeCreated; index++) {
                B2B_Product_Image__c productImage = new B2B_Product_Image__c();

                //If the image type is 'Model Image' then creating single model image record for every product as model images cannot be multiple for single product
                if (productImagesToBeCreated == productIdsList.size() && productImageType.equalsIgnoreCase(D2C_Constants.MODEL_IMAGE)) {
                    productImage.B2B_Product__c = productIdsList[index] != null && productIdsList[index].Id != null ? productIdsList[index].Id : null;
                } else {
                    //If the image type is  other than 'Model Image' then creating multiple images record for single product as there can be multiple images for single product
                    productImage.B2B_Product__c = productIdsList[0] != null && productIdsList[0].Id != null ? productIdsList[index].Id : null;
                }
                productImage.B2B_Image_Order__c = 0;
                productImage.B2B_Image_Title__c = 'Test Model Image' + index;
                productImage.B2B_Image_URL__c = 'Test_Image_URL';
                productImage.D2C_Product_Image_Type__c = 'Product Image';
                productImage.D2C_Available_In__c = 'D2C';
                productImage.D2C_Active__c = true;
                productImage.B2B_Image_Alt_Text__c = 'Image ' + index + 'Alt Text';
                productImage.CurrencyIsoCode = 'USD';
                productImagesList.add(productImage);
            }
            return productImagesList;
        } else {
            return null;
        }
    }

    /**
     * NBD2C-65
     * @description This reusable method is used to create account records specific to k_Partner_Program_NB__c field on account
     * @author Sachin V
     * @param standardAccounts  :   Number of accounts with k_Partner_Program_NB__c = Standard to be create
     * @param premiumAccounts  :   Number of accounts with k_Partner_Program_NB__c = Premium to beo create
     * @param basicAccounts  :   Number of accounts with k_Partner_Program_NB__c = Basic or '' to be create
     * @return List<Account> Collection of account records created
     */
    public static List<Account> createAccountRecords(Integer standardAccounts, Integer premiumAccounts, Integer basicAccounts) {
        if (standardAccounts > 0 || premiumAccounts > 0 || basicAccounts > 0) {
            List<Account> accountList = new List<Account>();

            //Standard accounts with k_Partner_Program_NB__c value other then "Premium, LightHouse, Basic"
            if (standardAccounts > 0) {
                for (Integer index = 0; index < standardAccounts; index++) {
                    Account account = createRetailerAccount('Standard', index);
                    accountList.add(account);
                }
            }
            if (premiumAccounts > 0) {
                Integer currentIndex = standardAccounts > 0 ? standardAccounts : 0;
                for (Integer index = currentIndex; index < currentIndex + premiumAccounts; index++) {
                    Account account = createRetailerAccount(index < currentIndex + premiumAccounts - 5 ? 'Premium' : 'LightHouse', index);
                    accountList.add(account);
                }
            }
            if (basicAccounts > 0) {
                Integer currentIndex = standardAccounts > 0 ? premiumAccounts > 0 ? standardAccounts + premiumAccounts : standardAccounts : 0;
                for (Integer index = currentIndex; index < currentIndex + basicAccounts; index++) {
                    Account account = createRetailerAccount(Math.mod(index, 5) == 0 ? '' : 'Basic', index);
                    accountList.add(account);
                }
            }

            return accountList;
        } else {
            return null;
        }
    }

    /**
     * NBD2C-65
     * @description This reusable method is used to create account records according to provided input
     * @author Sachin V
     * @param partnerProgram : Value of k_Partner_Program_NB__c field on Account record
     * @param index : Number used to create a unique k_ARIS_Account_ID__c field value
     * @return Account : returns a Account record
     */
    private static Account createRetailerAccount(String partnerProgram, Integer index) {
        return new Account(
            Name = 'Test Account ' + index,
            BillingCountry = 'USA',
            BillingLatitude = 37.7749,
            BillingLongitude = -122.4194,
            Country_Code__c = 'NBNB',
            BillingState = 'CA',
            BillingCity = 'San Francisco',
            BillingStreet = '123 Test St',
            BillingPostalCode = '94105',
            k_ARIS_Account_ID__c = 'NB_1234455' + index,
            k_Partner_Program_NB__c = partnerProgram,
            Phone = '1234567890'
        );
    }

    /**
     * NBD2C-50
     * @description This reusable method is used to create sectionContent records
     * @author Sachin V
     * @param fieldVsValueListMap    : Map of field name vs field Values(List).
     * @param recordTypeName         : Record Type name of Section Content object
     * @return D2C_SectionContent__c : returns a list of D2C_SectionContent__c records
     */
    public static List<D2C_SectionContent__c> createSectionContentRecords(Map<String, List<String>> fieldVsValueListMap, String recordTypeName) {
        List<D2C_SectionContent__c> sectionContentList = new List<D2C_SectionContent__c>();
        Integer count = fieldVsValueListMap.get('model').size() - 1;
        Integer modelListSize = fieldVsValueListMap.get('model').size();
        Integer salesConceptListSize = fieldVsValueListMap.get('salesConcept').size();

        //NBD2C-82 : Fetching record type for creating section content record
        List<RecordType> recordTypeList = [SELECT Id, Name FROM RecordType WHERE name = :recordTypeName];

        for (; count > -1; count--) {
            sectionContentList.add(
                new D2C_SectionContent__c(
                    D2C_Brand__c = 'Neubau',
                    D2C_Active__c = true,
                    D2C_ImageUrl__c = 'ImageURL',
                    RecordTypeId = recordTypeList[0].Id,
                    D2C_Model__c = fieldVsValueListMap.get('model')[Math.mod(count, salesConceptListSize)],
                    D2C_SalesConcept__c = fieldVsValueListMap.get('salesConcept')[Math.mod(count, modelListSize)],
                    D2C_SortOrder__c = 1
                )
            );
        }

        return sectionContentList;
    }

    /**
     * NBD2C-50
     * @description This reusable method is used to create D2C_SectionTranslations records
     * @author Sachin V
     * @param fieldVsValueListMap : Map of field name vs field Values(List).
     * @return D2C_SectionTranslations__c : returns a list of D2C_SectionTranslations__c records
     */
    public static List<D2C_SectionTranslations__c> createSectionTranslationsRecords(List<Id> sectionContentIdList) {
        List<D2C_SectionTranslations__c> sectionTranslationsList = new List<D2C_SectionTranslations__c>();
        Integer count = sectionContentIdList.size() - 1;
        for (; count > -1; count--) {
            sectionTranslationsList.add(
                new D2C_SectionTranslations__c(
                    D2C_IsActive__c = true,
                    D2C_Content__c = sectionContentIdList[count],
                    D2C_TR_Language__c = 'en',
                    D2C_Country__c = 'at',
                    D2C_Brand__c = 'Neubau',
                    D2C_TR_SectionHeader__c = 'SectionHeader1',
                    D2C_TR_Title__c = 'Title1',
                    D2C_TR_SubTitle__c = 'SubTitle1',
                    D2C_TR_ButtonLabel__c = 'ButtonLabel1',
                    D2C_TR_ButtonLink__c = 'ButtonLink1',
                    D2C_TR_ImageAltText__c = 'ImageAltText1'
                )
            );
        }

        return sectionTranslationsList;
    }

    /**
     * @description Return a active cart without items (no DML)
     * @param String webstoreId
     * @param String accountId
     *  NBD2C-75
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
     * @description Returns List of CartItem
     * @param numberOfRecords - number of records to be returned
     * @param cart - carts for which cartItems needs to be created
     * @param productIdList - List of product Ids to create Cart Item
     * @return List<CartItems>
     * NBD2C-75
     */
    public static List<CartItem> createCartItem(Integer numberOfRecords, WebCart cart, List<String> productIdList, String cartDeliveryGroupId) {
        List<CartItem> testCartItemsList = new List<CartItem>();
        for (Integer index = 0; index < numberOfRecords; index++) {
            CartItem item = new CartItem();
            item.Name = 'TestProduct' + index;
            item.CartId = cart.Id;
            item.Product2Id = productIdList[index];
            item.CartDeliveryGroupId = cartDeliveryGroupId;
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

    public static WebStore createWebStore() {
        WebStore webStoreObj = new WebStore(Name = 'NBD2C Store', PricingStrategy = 'LowestPrice');
        return webStoreObj;
    }

    /**
     * @description Returns a List of account
     * @param numberOfAccounts - number of account record to be created
     * @param name - name of the account
     * @param stage - stage of the account
     * @param isInsert - boolean value to determine if the record to be inserted or not
     * @return List<Account>
     * NBD2C-75
     */
    public static List<Account> createAccounts(Integer numberOfAccounts, String name, Boolean isInsert) {
        List<Account> accountList = new List<Account>();
        for (Integer i = 0; i < numberOfAccounts; i++) {
            accountList.add(new Account(name = name + '' + i));
        }
        if (isInsert && !accountList.isEmpty()) {
            insert accountList;
        }
        return accountList;
    }

    /**
     * @description Creates a new CartDeliveryGroup for a given cart (DML)
     * @param Id cartId
     * NBD2C-75
     **/
    public static CartDeliveryGroup createInsertCartDeliveryGroup(Id cartId) {
        CartDeliveryGroup cartDeliveryGroupObj = new CartDeliveryGroup();
        cartDeliveryGroupObj.CartId = cartId;
        cartDeliveryGroupObj.DeliverToPostalCode = '80636';
        cartDeliveryGroupObj.DeliverToCity = 'Munich';
        cartDeliveryGroupObj.DeliverToStreet = 'Erika-mann-str 123';
        cartDeliveryGroupObj.DeliverToName = 'Erik';
        cartDeliveryGroupObj.name = 'Default Delivery';
        insert cartDeliveryGroupObj;
        return cartDeliveryGroupObj;
    }

    /**
     * NBD2C-32
     * @author Shrihari
     * @description This method creates contact records related to a specific account
     * @param Integer: Number of records to be created
     * @param List<Account> : List of account
     */
    public static List<Contact> createContactRecords(Integer contactRecordsToBeCreated, List<Account> accountList) {
        if (contactRecordsToBeCreated != null) {
            List<Contact> contactList = new List<Contact>();
            for (Integer index = 0; index < contactRecordsToBeCreated; index++) {
                Contact newContact = new Contact();
                newContact.Email = 'test@gmail.com';
                newContact.FirstName = 'testFirstName' + index;
                newContact.LastName = 'testLastName' + index;
                newContact.Salutation = 'Mr';
                newContact.B2C_Marketing_Consent__c = true;
                newContact.B2C_Communication_Language__c = 'EN';
                newContact.B2C_Brand_Source__c = 'Neubau';
                newContact.B2C_Brand_Interest__c = 'Silhouette';
                newContact.AccountId = accountList.isEmpty() == false ? accountList[0].Id : null;
                contactList.add(newContact);
            }
            return contactList;
        } else {
            return null;
        }
    }

    /**
     * NBD2C-32
     * @author Shrihari
     * @description This method creates account records
     * @param Integer: Number of records to be created
     */
    public static List<Account> createAccountRecords(Integer accountRecordsToBeCreated) {
        List<RecordType> recordTypeList = [SELECT Id FROM RecordType WHERE DeveloperName = 'B2C_Consumer' AND SObjectType = 'Account' LIMIT 1];
        List<Account> accountList = new List<Account>();
        if (accountRecordsToBeCreated != null) {
            for (Integer index = 0; index < accountRecordsToBeCreated; index++) {
                Account account = new Account();
                account.Name = 'Test Account';
                account.RecordTypeId = recordTypeList.isEmpty() == false ? recordTypeList[0].Id : null;

                accountList.add(account);
            }
            return accountList;
        } else {
            return null;
        }
    }

    /**
     * NBD2C-73
     * @description This reusable method is used to create product images for D2C Products for provided media type
     * @author Sachin V
     * @param numberOfRecords  :   Number of product Images that needs to be created
     * @param imageType          :   Type of image that needs to be created (Model Image/Product Image)
     * @param productIdsList            :   List containing Ids of products that needs to be mapped againt product image records.
     * @return productImagesList        :   Output Collection of type list containing product image records
     */
    public static List<B2B_Product_Image__c> createD2CProductImagesRecordsOfTypePackagingImage(
        Integer numberOfRecords,
        String imageType,
        List<Product2> productList
    ) {
        List<B2B_Product_Image__c> productImagesList = new List<B2B_Product_Image__c>();
        for (Integer i = 0; i < numberOfRecords; i++) {
            for (Product2 product : productList) {
                B2B_Product_Image__c productImage = new B2B_Product_Image__c(
                    B2B_Product__c = product.Id,
                    B2B_Image_Order__c = i,
                    D2C_Product_Image_Type__c = imageType,
                    D2C_Active__c = true,
                    D2C_Available_In__c = D2C_Constants.D2C_VALUE,
                    B2B_Image_Alt_Text__c = 'Test ' + imageType + ' Image Alt Text ' + i,
                    B2B_Image_Title__c = 'Test ' + imageType + ' Image Title ' + i,
                    B2B_Image_URL__c = 'http://test.imageUrl.com',
                    CurrencyIsoCode = 'EUR'
                );
                productImagesList.add(productImage);
            }
        }
        return productImagesList;
    }
}
