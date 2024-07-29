/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-09-01 16:18:32
 * @modify date 2023-03-02 13:03:32
 * @desc PDP controller class
 */

public with sharing class B2B_ProductDetailsController {
    @TestVisible
    private static B2B_CommerceProxy b2bProxy = new B2B_CommerceProxy();

    /**
     * @description getProduct
     * @author Matthias Lindner
     * @param  communityId        communityId of the current store
     * @param  productId          productId of the selected product
     * @param  effectiveAccountId effectiveAccountId of the current user
     * @return                    return ConnectApi.ProductDetail product details
     */
    @AuraEnabled(cacheable=true)
    public static ConnectApi.ProductDetail getProduct(String communityId, String productId, String effectiveAccountId) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        List<String> fields = new List<String>();

        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCatalog_static_methods.htm#apex_ConnectAPI_CommerceCatalog_static_methods
        return b2bProxy.getProduct(webstoreId, productId, effectiveAccountID, fields);
    }

    @AuraEnabled(cacheable=true)
    public static List<String> filterInvalidVariationProducts(String effectiveAccountId) {
        return new B2B_EntitlementPolicyProductGetter().filterInvalidVariationProducts(effectiveAccountId);
    }

    /**
     * @description getProduct
     * @author Matthias Lindner
     * @Modefied By Vishalsingh Gaur
     * @param  communityId        communityId of the current store
     * @param  productId          productId of the selected product
     * @param  effectiveAccountId effectiveAccountId of the current user
     * @param relationType        product link type
     * @param relatedProductIdList product ids which needs to be exclude //BS-413
     * @return                    return ConnectApi.ProductDetail product details
     */
    @AuraEnabled(cacheable=false)
    public static Object productSearch(
        String communityId,
        String effectiveAccountId,
        String productId,
        String relationType,
        List<String> relatedProductIdList
    ) {
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        try {
            List<B2B_Commerce_Product_Link__c> spareProducts = [
                SELECT B2B_Type__c, B2B_Source_Product__c, B2B_Target_Product__c
                FROM B2B_Commerce_Product_Link__c
                WHERE B2B_Type__c = :relationType AND B2B_Source_Product__c = :productId AND B2B_Target_Product__c NOT IN :relatedProductIdList
                LIMIT 20
            ];
            List<String> partsIds = new List<String>();

            for (B2B_Commerce_Product_Link__c product : spareProducts) {
                partsIds.add(product.B2B_Target_Product__c);
            }

            if (!partsIds.isEmpty()) {
                return b2bProxy.getProducts(webstoreId, effectiveAccountId, partsIds, null, null, false, false);
            } else {
                return null;
            }
        } catch (Exception e) {
            B2B_LogUtils.createPersistLogAsync(
                'Exception occured while fetching spare or demo products for product:' +
                productId +
                ' | ' +
                e.getMessage(),
                B2B_LogUtils.LOG_COMMERCE_SETUP,
                B2B_LogUtils.LOG_TYPE_ERROR,
                'B2B_ProductDetailsController',
                null
            );
            return null;
        }
    }

    /**
     * @description getCartSummary
     * @author Matthias Lindner
     * @param  communityId        communityId of the current store
     * @param  effectiveAccountId effectiveAccountId of the current user
     * @param  currencyIsoCode    applicable Currency Code (Added as part of BS-1245)
     * @return                    return ConnectApi.CartSummary of the current user
     */
    @AuraEnabled
    public static ConnectApi.CartSummary getCartSummary(String communityId, String effectiveAccountId, String currencyIsoCode) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        //'current' is available in version 50.0 and later and indicates a cart with a status that isn’t Closed or PendingDelete
        //This is important for the product detail page since we are using the cart summary to check if the status is "Processing" or "Checkout"
        String activeCartOrId = 'current';

        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        return b2bProxy.getCartSummary(webstoreId, effectiveAccountId, activeCartOrId, currencyIsoCode); // BS-1245 : Added currencyIsoCode as input parameter
    }

    /**
     * @description addToCart
     * @author Matthias Lindner
     * @param  communityId        communityId of the current store
     * @param  productId          productId of the selected product
     * @param  quantity           quantity of the selcted product
     * @param  effectiveAccountId effectiveAccountId of the current user
     * @param  currencyIsoCode    applicable Currency Code (Added as part of BS-1245)
     * @return                    return ConnectApi.CartItem
     */
    @AuraEnabled
    public static ConnectApi.CartItem addToCart(String communityId, String productId, String quantity, String effectiveAccountId, String currencyIsoCode) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        ConnectApi.CartItemInput cartInput = new ConnectApi.CartItemInput();
        cartInput.productId = productId;
        cartInput.quantity = quantity;
        cartInput.type = ConnectApi.CartItemType.PRODUCT;

        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm#apex_ConnectAPI_CommerceCart_static_methods

        //BS-2355 start
        ConnectApi.CartItem cartItemObj = b2bProxy.addItemToCart(webstoreId, effectiveAccountId, 'active', cartInput, currencyIsoCode); // BS-1245 : Added currencyIsoCode as input parameter
        if (
            cartItemObj != null &&
            ((cartItemObj.unitAdjustedPrice != null && Decimal.valueOf(cartItemObj.unitAdjustedPrice) < 0) ||
            (cartItemObj.totalPrice != null &&
            Decimal.valueOf(cartItemObj.totalPrice) < 0))
        ) {
            CartItem createdCartItem = new CartItem();
            createdCartItem.Id = cartItemObj.cartItemId;
            createdCartItem.TotalPrice = 0;
            createdCartItem.TotalPriceAfterAllAdjustments = 0;
            createdCartItem.UnitAdjustedPrice = 0;
            createdCartItem.NetUnitPrice = 0;
            createdCartItem.SalesPrice = 0;
            createdCartItem.GrossUnitPrice = 0;
            update createdCartItem;
        }
        //BS-2355 end
        return cartItemObj;
    }

    /**
     * @description createAndAddToList
     * @author Matthias Lindner
     * @param  communityId        communityId of the current store
     * @param  productId          productId of the selected product
     * @param  wishlistName       wishlistName
     * @param  effectiveAccountId effectiveAccountId of the current user
     * @return                    return ConnectApi.Wishlist
     */
    @AuraEnabled
    public static ConnectApi.Wishlist createAndAddToList(String communityId, String productId, String wishlistName, String effectiveAccountId) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        // Store the product in a WishlistItemInput to pass to the Wishlist
        ConnectApi.WishlistItemInput wishlistItemInput = new ConnectApi.WishlistItemInput();
        wishlistItemInput.productId = productId;

        //Create a wishlistInput to be created
        ConnectApi.WishlistInput wishlistInput = new ConnectApi.WishlistInput();
        wishlistInput.name = wishlistName;
        wishlistInput.products = new List<ConnectApi.WishlistItemInput>{ wishlistItemInput };

        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceWishlist_static_methods.htm#apex_ConnectAPI_CommerceWishlist_static_methods
        return b2bProxy.createWishlist(webstoreId, effectiveAccountId, wishlistInput);
    }

    /**
     * @description getProductPrice
     * @author Matthias Lindner
     * @param  communityId        communityId of the current store
     * @param  productId          productId of the selected product
     * @param  effectiveAccountId effectiveAccountId of the current user
     * @return                    return ConnectApi.ProductPrice
     */
    @AuraEnabled(cacheable=true)
    public static ConnectApi.ProductPrice getProductPrice(String communityId, String productId, String effectiveAccountId) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceStorePricing_static_methods.htm#apex_ConnectAPI_CommerceStorePricing_static_methods
        return b2bProxy.getProductPrice(webstoreId, productId, effectiveAccountId);
    }

    /**
     * @description getProductImages
     * @author Septimiu Dumitru
     * @param  productId          productId of the selected product
     * @return                    return List<B2B_ProductDetailsModel.B2B_ProductImageWrapper>
     */
    @AuraEnabled(cacheable=true)
    public static List<B2B_ProductDetailsModel.B2B_ProductImageWrapper> getProductImages(String productId) {
        try {
            List<B2B_Product_Image__c> productImages = new B2B_FetchDataInSystemContext().getProductList(productId);

            List<B2B_ProductDetailsModel.B2B_ProductImageWrapper> imagesList = new List<B2B_ProductDetailsModel.B2B_ProductImageWrapper>();
            if (!productImages.isEmpty()) {
                for (B2B_Product_Image__c productImage : productImages) {
                    B2B_ProductDetailsModel.B2B_ProductImageWrapper imageWrapper = new B2B_ProductDetailsModel.B2B_ProductImageWrapper();
                    imageWrapper.imageTitle = productImage.B2B_Image_Title__c;
                    imageWrapper.imageAltText = productImage.B2B_Image_Alt_Text__c;
                    imageWrapper.imageOrder = (Integer) productImage.B2B_Image_Order__c;
                    imageWrapper.imageUrl = productImage.B2B_Image_URL__c;
                    imageWrapper.imageExternalId = productImage.B2B_External_Id__c;
                    imageWrapper.lastImage = (Integer) productImage.B2B_Image_Order__c == (Integer) productImages[productImages.size() - 1].B2B_Image_Order__c
                        ? true
                        : false;

                    imagesList.add(imageWrapper);
                }
            }
            return imagesList;
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_ProductDetailsController', 'Error when fetching product images: ' + productId);
            throw new NullPointerException();
        }
    }

    /**
     * @description getProductMedia
     * @author Septimiu Dumitru
     * @param  productId          productId of the selected product
     * @return                    return List<B2B_ProductDetailsModel.B2B_ProductMediaWrapper>
     */
    @AuraEnabled(cacheable=true)
    public static List<B2B_ProductDetailsModel.B2B_ProductMediaWrapper> getProductMedia(String productId) {
        try {
            List<B2B_Product_Media__c> productMedias = new B2B_FetchDataInSystemContext().getProductMedia(productId);

            List<B2B_ProductDetailsModel.B2B_ProductMediaWrapper> mediasList = new List<B2B_ProductDetailsModel.B2B_ProductMediaWrapper>();
            if (!productMedias.isEmpty()) {
                for (B2B_Product_Media__c productMedia : productMedias) {
                    B2B_ProductDetailsModel.B2B_ProductMediaWrapper mediaWrapper = new B2B_ProductDetailsModel.B2B_ProductMediaWrapper();
                    mediaWrapper.mediaName = productMedia.Name;
                    mediaWrapper.mediaOrder = (Integer) productMedia.B2B_Sort_Order__c;
                    mediaWrapper.mediaType = productMedia.B2B_Product_Media_Type__c;
                    mediaWrapper.mediaUrl = productMedia.B2B_Media_URL__c;
                    mediaWrapper.productId = productMedia.B2B_Product__c;

                    mediasList.add(mediaWrapper);
                }
            }
            return mediasList;
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_ProductDetailsController', 'Error when fetching product medias: ' + productId);
            throw new NullPointerException();
        }
    }

    @AuraEnabled(cacheable=false)
    public static List<B2B_ProductDetailsModel.B2B_ProductColorWrapper> getProductsColors(List<String> productIds) {
        try {
            List<Product2> productList = new B2B_FetchDataInSystemContext().getProductRecords(productIds);
            List<B2B_ProductDetailsModel.B2B_ProductColorWrapper> colorsList = new List<B2B_ProductDetailsModel.B2B_ProductColorWrapper>();
            for (Product2 product : productList) {
                B2B_ProductDetailsModel.B2B_ProductColorWrapper productColor = new B2B_ProductDetailsModel.B2B_ProductColorWrapper();
                productColor.productId = product.Id;
                productColor.colorName = product.B2B_Frame_Color_Description__c;
                productColor.hexCodeFrame = product.B2B_Hexcode__c;
                productColor.hexCodeAccent = product.B2B_Hexcode_Accent__c;

                colorsList.add(productColor);
            }

            return colorsList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description checkEvilEyeFrame
     * @author Soumyakant Pandya
     * @param  productId : productId of the selected product
     * @return return Boolean that if product is of brand Evil eye and product type frame
     * Added as part of BS-578
     */
    @AuraEnabled(cacheable=false)
    public static Boolean checkEvilEyeFrame(String productId) {
        Id parentCategoryRecordId;
        Id currentCategoryRecordId;
        Set<Id> categoryIdSet = new Set<Id>();

        ProductCategory evilEyeCategoryObj = new ProductCategory();
        List<ProductCategory> allProductCategoryList = new B2B_FetchDataInSystemContext().getProductCategory();

        for (ProductCategory productCategoryObj : allProductCategoryList) {
            //Check if the current iteration's external id is of ee frame to identify the Evil eye category's object
            if (productCategoryObj.B2B_Category_External_ID__c == B2B_Constants.FRAME_CATEGORY_EXT_ID) {
                evilEyeCategoryObj = productCategoryObj;
                categoryIdSet.add((Id) productCategoryObj.Id);
            }
        }

        //Map to store the ProductCategory Id and its its object
        Map<Id, productCategory> productCategoryIdVsProductCategoryObj = new Map<Id, productCategory>();
        for (ProductCategory productCategoryObj : allProductCategoryList) {
            productCategoryIdVsProductCategoryObj.put(productCategoryObj.Id, productCategoryObj);
        }

        for (ProductCategory productCategoryObj : allProductCategoryList) {
            currentCategoryRecordId = productCategoryObj.Id;
            parentCategoryRecordId = productCategoryObj.ParentCategoryId;
            //Recursive call to get all the child node categories related to the passed top level product category Id
            categoryIdSet = getCategoryIdSet(
                currentCategoryRecordId,
                parentCategoryRecordId,
                evilEyeCategoryObj.Id,
                productCategoryObj,
                categoryIdSet,
                productCategoryIdVsProductCategoryObj
            );
        }

        //Query to identify if the passed product belongs to evil eye frame category
        List<ProductCategoryProduct> productCategoryProductList = new B2B_FetchDataInSystemContext().getProductCategoryProduct(productId, categoryIdSet);

        //Condition to check if the product belongs to the evil eye frame category and id of brand evil eye.
        if (productCategoryProductList.isEmpty() == false) {
            //If all conditions are met return true that product is of EE and is from frame category.
            return true;
        }
        //If even one of the condition fails default return false
        return false;
    }

    /**
     * @description getCategoryIdSet
     * @author Soumyakant Pandya
     * @param  currentCategoryRecordId : Id of the current passed category
     * @param  parentCategoryRecordId : Parent category Id of the current passed category
     * @param  productCategoryObj : current ProductCategory record
     * @param  categoryIdSet : Set that would contain the top level parent of which child nodes need to be returned
     * @param  productCategoryIdVsProductCategoryObj : Map of Id vs ProductCategory record
     * @return returns set containing Ids of all the child node categories
     * Added as part of BS-578
     */
    public static Set<Id> getCategoryIdSet(
        Id currentCategoryRecordId,
        Id parentCategoryRecordId,
        Id topLevelParentCategoryId,
        productCategory productCategoryObj,
        Set<Id> categoryIdSet,
        Map<Id, productCategory> productCategoryIdVsProductCategoryObj
    ) {
        if (parentCategoryRecordId == null) {
            return categoryIdSet;
        } else if (
            productCategoryIdVsProductCategoryObj.get(parentCategoryRecordId).Id != null &&
            productCategoryIdVsProductCategoryObj.get(parentCategoryRecordId).Id != topLevelParentCategoryId
        ) {
            currentCategoryRecordId = productCategoryIdVsProductCategoryObj.get(parentCategoryRecordId).Id;
            parentCategoryRecordId = productCategoryIdVsProductCategoryObj.get(parentCategoryRecordId).ParentCategoryId;
            categoryIdSet = getCategoryIdSet(
                currentCategoryRecordId,
                parentCategoryRecordId,
                topLevelParentCategoryId,
                productCategoryObj,
                categoryIdSet,
                productCategoryIdVsProductCategoryObj
            );
        } else if (productCategoryIdVsProductCategoryObj.get(parentCategoryRecordId).Id == topLevelParentCategoryId) {
            categoryIdSet.add(productCategoryObj.Id);
        }
        return categoryIdSet;
    }

    @AuraEnabled(cacheable=true)
    public static PricebookEntry getRecommendedRetailPrice(String pricebookEntryId) {
        List<PricebookEntry> pricebookEntryList = new B2B_FetchDataInSystemContext().getPricebookEntry(pricebookEntryId);
        return pricebookEntryList[0];
    }

    /**
     * @description Update the show RRP field  My_B2B_Shop_Preference__c  Record
     * @author Soumyakant Pandya
     * BS-575
     * @param  showRRP    boolean to set Show RRP field in  My_B2B_Shop_Preference__c
     * @param  userId     Current logged in user Id
     */
    @AuraEnabled(cacheable=false)
    public static void updateMyB2BShopPreference(String accountId, Boolean showRRP) {
        List<My_B2B_Shop_Preference__c> myB2BShopPreferenceList = new B2B_FetchDataInSystemContext().getMyB2BShopPreferenceList(accountId);
        if (myB2BShopPreferenceList.isEmpty() == false) {
            myB2BShopPreferenceList[0].B2B_Show_RRP__c = showRRP;
        }
        try {
            new B2B_FetchDataInSystemContext().updateMyB2BShopPreferenceList(myB2BShopPreferenceList);
        } catch (Exception exceptionInstance) {
            B2B_LogUtils.createPersistLogAsync(
                'Exception occured while updating the boolean on My_B2B_Shop_Preference__c :' + exceptionInstance.getMessage(),
                B2B_LogUtils.LOG_COMMERCE_SETUP,
                B2B_LogUtils.LOG_TYPE_ERROR,
                'B2B_ProductDetailsController',
                null
            );
        }
    }
    /**
     * @description return the showRRP from My_B2B_Shop_Preference__c
     * @author Soumyakant Pandya
     * BS-575
     * @param  userId Current logged in user Id
     */
    @AuraEnabled(cacheable=false)
    public static Boolean getShowRecommendedRetailPrice(String accountId) {
        List<My_B2B_Shop_Preference__c> myB2BShopPreferenceList = new B2B_FetchDataInSystemContext().getMyB2BShopPreferenceList(accountId);
        if (myB2BShopPreferenceList.size() > 0) {
            return myB2BShopPreferenceList[0].B2B_Show_RRP__c;
        } else {
            return true;
        }
    }

    /**
     * BS-1128
     * @auther : Sachin V
     * @description This private method is used to check whether the account of currently logged in user is entitled with VS-RX entitlement policy
     * @param  accountId            :   Account Id of currently logged in user
     * @return entitlementObj    :   Whether the account is entitled with VS-RX entitlement policy (True / False)
     */
    @AuraEnabled(cacheable=false)
    public static B2B_EntitlementWrapper checkEligibilityForVSRX(String accountId) {
        B2B_EntitlementWrapper entitlementObj = new B2B_EntitlementWrapper();
        if (String.isNotBlank(accountId)) {
            B2B_FetchDataInSystemContext contextInstance = new B2B_FetchDataInSystemContext();
            entitlementObj = contextInstance.getEligibilityForVSRX(accountId);
        }
        return entitlementObj;
    }

    /**
     * BS-1175
     * @description this method will return the wrapper containing the
     * @param brand : Brand for which the field needs to be fetched
     * @param language : Language for which the category translations needs to be fetched.
     * api name, label, NB category List and Boolean for date/date time field for the fields containing in the metadata to be shown on UI
     */
    @SuppressWarnings('PMD.avoiddeeplynestedifstmts')
    @AuraEnabled(cacheable=false)
    public static List<B2B_ProductFieldWrapper> getAdditionalAttributeFieldData(String brand, String language) {
        List<String> catalogNameList = (System.Label.B2B_STORE_CATALOG_NAME).split(',');

        /* This map is used to store the reference of fetched metadata records against their Developer Name */
        Map<String, B2B_PDP_Show_More_Preference_Setting__mdt> showMorePreferenceSettingMetadataMap = new Map<String, B2B_PDP_Show_More_Preference_Setting__mdt>();

        /*
         * BS-1255
         * This map is used to store the reference of category Name against their translations in the language passed as parameter
         */
        Map<String, String> categoryNameVsCategoryTranslationMap = new Map<String, String>();

        /*
         * BS-1255
         * Variable to store which field to dynamically refer for category based on the brand
         */
        String categoryFieldName;

        /*
         * BS-1255
         * Variable to store which field to dynamically refer for ordering the fields based on the brand
         */
        String orderByFieldName;

        /**
         * Start BS-1255
         * Block to identify and populate the fields for category and order.
         */
        if (brand.equalsIgnoreCase(B2B_Constants.NEUBAU_BRAND)) {
            categoryFieldName = B2B_Constants.PDP_METADATA_NEUBAU_CATEGORY_FIELD;
            orderByFieldName = B2B_Constants.PDP_METADATA_NB_ORDER_FIELD;
        } else if (brand.equalsIgnoreCase(B2B_Constants.SILHOUETTE_BRAND)) {
            categoryFieldName = B2B_Constants.PDP_METADATA_SILHOUETTE_CATEGORY_FIELD;
            orderByFieldName = B2B_Constants.PDP_METADATA_SH_ORDER_FIELD;
        } else if (brand.equalsIgnoreCase(B2B_Constants.EVIL_EYE_BRAND)) {
            categoryFieldName = B2B_Constants.PDP_METADATA_EVIL_EYE_CATEGORY_FIELD;
            orderByFieldName = B2B_Constants.PDP_METADATA_EE_ORDER_FIELD;
        }

        /*
         * Fetch the custom metadata records using query to fetch them based on the order we want them to be displayed on UI
         * BS-1255 : Added the fields B2B_Category_Evil_Eye__c & B2B_Category_Silhouette__c
         * BS-1255 : Updated the query to be a dynamic query.
         */
        String metadataQuery =
            'SELECT Id,' +
            'DeveloperName,' +
            'B2B_Brand__c,' +
            'B2B_Field_Name__c,' +
            'B2B_Category_Neubau__c,' +
            'B2B_Category_Evil_Eye__c,' +
            'B2B_Category_Silhouette__c,' +
            'B2B_Attribute_Display_Order__c,' +
            'B2B_Attribute_Display_Order_Evil_Eye__c,' +
            'B2B_Attribute_Display_Order_Silhouette__c,' +
            'Is_Active__c ' +
            'FROM B2B_PDP_Show_More_Preference_Setting__mdt ' +
            'WHERE Is_Active__c = TRUE ORDER BY ' +
            String.escapeSingleQuotes(orderByFieldName);

        for (B2B_PDP_Show_More_Preference_Setting__mdt showMorePreferenceObj : Database.query(String.escapeSingleQuotes(metadataQuery))) {
            showMorePreferenceSettingMetadataMap.put(showMorePreferenceObj.DeveloperName, showMorePreferenceObj);
        }
        String applicableCatalogue;
        if (catalogNameList.isEmpty() == false && catalogNameList[1] != null && brand.equalsIgnoreCase(B2B_Constants.NEUBAU_BRAND)) {
            applicableCatalogue = catalogNameList[1];
        } else if (catalogNameList.isEmpty() == false && catalogNameList[0] != null) {
            applicableCatalogue = catalogNameList[0];
        }
        //Fetch the category populate the categoryNameVsCategoryTranslationMap
        for (
            ProductCategoryDataTranslation categoryTranslationObj : new B2B_FetchDataInSystemContext()
                .getProductCategoryDataTranslation(language, applicableCatalogue)
        ) {
            categoryNameVsCategoryTranslationMap.put(categoryTranslationObj.Parent.Name, categoryTranslationObj.Name);
        }

        String objectName = B2B_Constants.PRODUCT_OBJECT_API_NAME;
        Map<String, Schema.SObjectType> globalDescribeMap = Schema.getGlobalDescribe();
        Schema.SObjectType sObjectTypeObj = globalDescribeMap.get(objectName);
        Map<String, Schema.SObjectField> fieldMap = sObjectTypeObj.getDescribe().fields.getMap();
        List<B2B_ProductFieldWrapper> productFieldWrapperList = new List<B2B_ProductFieldWrapper>();
        B2B_ProductFieldWrapper productFieldWrapperObj;
        for (String key : showMorePreferenceSettingMetadataMap.keySet()) {
            productFieldWrapperObj = new B2B_ProductFieldWrapper();

            /*
             * Have used List in place of Set as @AuraEnabled attributes do not support Sets.
             */
            List<String> fieldCategoryList = new List<String>();
            if (
                String.isNotBlank(showMorePreferenceSettingMetadataMap.get(key).B2B_Brand__c) &&
                showMorePreferenceSettingMetadataMap.get(key).Is_Active__c == true &&
                (showMorePreferenceSettingMetadataMap.get(key).B2B_Brand__c).contains(brand)
            ) {
                Schema.SOAPType fieldType;
                if (String.isNotBlank(showMorePreferenceSettingMetadataMap.get(key).B2B_Field_Name__c)) {
                    productFieldWrapperObj.fieldName = showMorePreferenceSettingMetadataMap.get(key).B2B_Field_Name__c;
                    productFieldWrapperObj.fieldLabel = fieldMap.get(showMorePreferenceSettingMetadataMap.get(key).B2B_Field_Name__c).getDescribe().getLabel();
                    fieldType = fieldMap.get(showMorePreferenceSettingMetadataMap.get(key).B2B_Field_Name__c).getDescribe().getSOAPType();
                }
                if (fieldType != null && fieldType == Schema.SOAPType.DATE || fieldType == Schema.SOAPType.DATETIME) {
                    productFieldWrapperObj.isDateField = true;
                } else {
                    productFieldWrapperObj.isDateField = false;
                }

                /**
                 * Start BS-1255
                 * Assign which to refer for category data
                 * Fill the category translations fetched earlier from the categoryNameVsCategoryTranslationMap
                 */
                if (
                    showMorePreferenceSettingMetadataMap.get(key).get(categoryFieldName) != null &&
                    String.isNotBlank((String) showMorePreferenceSettingMetadataMap.get(key).get(categoryFieldName))
                ) {
                    for (String categoryName : ((String) (showMorePreferenceSettingMetadataMap.get(key).get(categoryFieldName))).split(',')) {
                        if (categoryNameVsCategoryTranslationMap.containsKey(categoryName)) {
                            fieldCategoryList.add(categoryNameVsCategoryTranslationMap.get(categoryName));
                        } else {
                            fieldCategoryList.add(categoryName);
                        }
                    }
                }
                productFieldWrapperObj.categoryList = fieldCategoryList;
                productFieldWrapperList.add(productFieldWrapperObj);
            }
        }

        return productFieldWrapperList;
    }

    @TestVisible
    private without sharing class B2B_FetchDataInSystemContext {
        @TestVisible
        private List<B2B_Product_Image__c> getProductList(String productId) {
            return [
                SELECT Name, B2B_Image_Title__c, B2B_Image_Order__c, B2B_Image_URL__c, B2B_Image_Alt_Text__c, B2B_External_Id__c, B2B_Product__c
                FROM B2B_Product_Image__c
                WHERE
                    B2B_Product__c = :productId
                    AND D2C_Active__c = TRUE
                    AND D2C_Available_In__c INCLUDES (:B2B_Constants.B2B_FIELD_FORMAT)
                    AND D2C_Product_Image_Type__c = :B2B_Constants.PRODUCT_IMAGE
                ORDER BY B2B_Image_Order__c
            ];
        }

        @TestVisible
        private List<B2B_Product_Media__c> getProductMedia(String productId) {
            return [
                SELECT Name, B2B_Media_URL__c, toLabel(B2B_Product_Media_Type__c), B2B_Sort_Order__c, B2B_Product__c
                FROM B2B_Product_Media__c
                WHERE B2B_Product__c = :productId
                ORDER BY B2B_Sort_Order__c
            ];
        }

        @TestVisible
        private List<Product2> getProductRecords(List<String> productIds) {
            return [SELECT Id, B2B_Frame_Color_Description__c, B2B_Hexcode__c, B2B_Hexcode_Accent__c FROM Product2 WHERE Id IN :productIds];
        }

        /**
         * @description getProductCategoryProduct
         * @param  productId : productId of the selected product
         * @param categoryIdSet category to which the product should belong to
         * @return List<ProductCategoryProduct> List of the ProductCategoryProduct record belonging to the passed filters.
         * Added as part of BS-578
         */
        @TestVisible
        private List<ProductCategoryProduct> getProductCategoryProduct(String productId, Set<Id> categoryIdSet) {
            return [
                SELECT Id, ProductId, Product.B2B_Brand__c
                FROM ProductCategoryProduct
                WHERE ProductId = :productId AND ProductCategoryId IN :categoryIdSet AND Product.B2B_Brand__c = :B2B_Constants.B2B_EE_BRAND_API_NAME_05
            ];
        }

        /**
         * @description getProductCategory
         * @return List<ProductCategory> List of  all the ProductCategory in the org.
         * Added as part of BS-578
         */
        @TestVisible
        private List<ProductCategory> getProductCategory() {
            Integer remainingQueryRowLimit = Limits.getLimitQueryRows() - Limits.getQueryRows();
            return [SELECT Id, Name, ParentCategoryId, B2B_Category_External_ID__c FROM ProductCategory LIMIT :remainingQueryRowLimit];
        }

        @TestVisible
        private List<PricebookEntry> getPricebookEntry(String pricebookEntryId) {
            return [SELECT B2B_RRP__c FROM PricebookEntry WHERE Id = :pricebookEntryId LIMIT 1];
        }

        /**
         * @description getMyB2BShopPreferenceList
         * @param accountId Account for which stored pereference needs to be fetched
         * @return List<My_B2B_Shop_Preference__c> List containing preference of the  for the passed account
         * Added as part of BS-575
         */
        @TestVisible
        private List<My_B2B_Shop_Preference__c> getMyB2BShopPreferenceList(String accountId) {
            return [SELECT B2B_Show_RRP__c, B2B_Account__c FROM My_B2B_Shop_Preference__c WHERE B2B_Account__c = :accountId ORDER BY CreatedDate LIMIT 1];
        }

        /**
         * @description getMyB2BShopPreferenceList update
         * @param List<My_B2B_Shop_Preference__c> List containing preference of the Account
         * Added as part of BS-575
         */
        @TestVisible
        private void updateMyB2BShopPreferenceList(List<My_B2B_Shop_Preference__c> myB2BShopPreferenceList) {
            update myB2BShopPreferenceList;
        }

        /**
         * BS-1128
         * @auther : Sachin V
         * @description This private method is used to check whether the account of currently logged in user is entitled with VS-RX entitlement policy
         * @param  accountId            :   Account Id of currently logged in user
         * @return entitlementObj    :   Whether the account is entitled with VS-RX entitlement policy (True / False)
         */
        @TestVisible
        private B2B_EntitlementWrapper getEligibilityForVSRX(String accountId) {
            B2B_EntitlementWrapper entitlementObj = new B2B_EntitlementWrapper();
            try {
                Set<Id> buyerGroupIdSet = new Set<Id>();
                for (BuyerGroupMember buyerGroupMemeber : [SELECT Id, Name, BuyerGroupId, BuyerId FROM BuyerGroupMember WHERE Buyer.Id = :accountId]) {
                    buyerGroupIdSet.add(buyerGroupMemeber.BuyerGroupId);
                }
                for (CommerceEntitlementBuyerGroup commerceEntitlementBuyerGroup : [
                    SELECT Id, Policy.name
                    FROM CommerceEntitlementBuyerGroup
                    WHERE BuyerGroupId IN :buyerGroupIdSet
                ]) {
                    if (
                        String.isNotBlank(commerceEntitlementBuyerGroup.policy.name) &&
                        commerceEntitlementBuyerGroup.policy.name.equalsIgnoreCase(B2B_Constants.GLOBAL_ENTITLEMENT_VS)
                    ) {
                        entitlementObj.isEligibleForVS = true;
                    } else if (
                        String.isNotBlank(commerceEntitlementBuyerGroup.policy.name) &&
                        commerceEntitlementBuyerGroup.policy.name.equalsIgnoreCase(B2B_Constants.GLOBAL_ENTITLEMENT_RX)
                    ) {
                        entitlementObj.isEligibleForRX = true;
                    }
                }

                //BS-1740 - Start
                List<Account> accountList = [SELECT id, k_EERX_Account_Status__c, k_Account_Status_SVS__c FROM Account WHERE Id = :accountId];

                if (accountList.isEmpty() == false) {
                    entitlementObj.isEligibleForRX = entitlementObj.isEligibleForRX == true &&
                        String.isNotBlank(accountList[0].k_EERX_Account_Status__c) &&
                        ((accountList[0].k_EERX_Account_Status__c == B2B_Constants.ACCOUNT_STATUS_ACTIVATED) ||
                        (accountList[0].k_EERX_Account_Status__c == B2B_Constants.ACCOUNT_STATUS_ACTIVE))
                        ? true
                        : false;
                    entitlementObj.isEligibleForVS = entitlementObj.isEligibleForVS == true &&
                        String.isNotBlank(accountList[0].k_Account_Status_SVS__c) &&
                        ((accountList[0].k_Account_Status_SVS__c == B2B_Constants.ACCOUNT_STATUS_ACTIVATED) ||
                        (accountList[0].k_Account_Status_SVS__c == B2B_Constants.ACCOUNT_STATUS_ACTIVE))
                        ? true
                        : false;
                }
                //BS-1740 - End
                return entitlementObj;
            } catch (Exception exceptionInstance) {
                // Throwing custom exception in case of any errors
                B2B_LogUtils.createInfoLog(exceptionInstance.getMessage(), 'B2B_ProductDetailsController', 'Account Id: ' + accountId);
                throw new AuraHandledException('Error while checking eligibility for VS RX');
            }
        }

        /**
         * BS-1175
         * @auther : Soumyakant Pandya
         * @description This private method is used to fetch the translation for the categories.
         * @param  language : Language for which the category translation needs to be fetched
         * @return List<ProductCategoryDataTranslation> : List containing all the ProductCategoryDataTranslation records
         */
        @TestVisible
        private List<ProductCategoryDataTranslation> getProductCategoryDataTranslation(String language, String brand) {
            return [
                SELECT Id, Name, ParentId, Parent.Name, Parent.Catalog.Name, Language
                FROM ProductCategoryDataTranslation
                WHERE Language = :language AND Parent.Catalog.Name = :brand
            ];
        }
    }

    /**
     * @description It returns the the json which contains boolean values for source and target product along with related product Id.
     * @author Soumyakant Pandya
     * BS-1500
     * @param  productId currently selected product Id
     */
    @AuraEnabled(cacheable=false)
    public static B2B_SourceTargetWrapper getSourceTargetStatus(String productId) {
        B2B_SourceTargetWrapper wrapObj = new B2B_SourceTargetWrapper();

        List<B2B_Commerce_Product_Link__c> sourceTargetDataList = [
            SELECT Id, B2B_Source_Product__c, B2B_Target_Product__c, B2B_Type__c
            FROM B2B_Commerce_Product_Link__c
            WHERE B2B_Type__c = :B2B_Constants.GLAZED_TO_UNGLAZED
        ];

        for (B2B_Commerce_Product_Link__c data : sourceTargetDataList) {
            if (data.B2B_Source_Product__c == productId && data.B2B_Target_Product__c != null) {
                wrapObj.isGlazed = true;
                wrapObj.isUnglazed = false;
                wrapObj.relatedProductId = data.B2B_Target_Product__c;
            } else if (data.B2B_Target_Product__c == productId && data.B2B_Source_Product__c != null) {
                wrapObj.isUnglazed = true;
                wrapObj.isGlazed = false;
                wrapObj.relatedProductId = data.B2B_Source_Product__c;
            }
        }

        return wrapObj;
    }

    /**
     * @desc Wrapper to store the booleans and related product Id of source and target of glazed and unglazed products.
     * Added as part of BS-1500
     */
    public class B2B_SourceTargetWrapper {
        @AuraEnabled
        public Boolean isUnglazed;

        @AuraEnabled
        public Boolean isGlazed;

        @AuraEnabled
        public Id relatedProductId;
    }

    /**
     * @author Soumyakant Pandya
     * @desc Wrapper to store the field API name and their respective labels based on the locale.
     * Added as part of BS-357
     */
    public class B2B_ProductFieldWrapper {
        @AuraEnabled
        public String fieldName;

        @AuraEnabled
        public String fieldLabel;

        @AuraEnabled
        public List<String> categoryList; //BS-1255 : Update the category list to be a generic list.

        @AuraEnabled
        public Boolean isDateField; //BS-1175
    }

    /**
     * @desc Wrapper to store the booleans for entitlement of VSRX.
     * Added as part of BS-976
     */
    public class B2B_EntitlementWrapper {
        @AuraEnabled
        public Boolean isEligibleForVS;

        @AuraEnabled
        public Boolean isEligibleForRX;
    }

    public without sharing class B2B_EntitlementPolicyProductGetter {
        /**
         * BS-2488: Get all the product Ids that are in entitalment policy related to the user's account
         * Do not consider global entitalment policies
         */
        public List<String> filterInvalidVariationProducts(String effectiveAccountId) {
            List<String> validVariationProductIds = new List<String>();
            if (effectiveAccountId != null) {
                list<String> buyerGroupIdList = new List<String>();
                for (BuyerGroupMember buyerGroupMemberRecord : [
                    SELECT Id, Name, BuyerGroupId, BuyerId, BuyerGroup.B2B_Type__c
                    FROM BuyerGroupMember
                    WHERE Buyer.Id = :effectiveAccountId
                ]) {
                    if (buyerGroupMemberRecord.BuyerGroupId != null && buyerGroupMemberRecord.BuyerGroup.B2B_Type__c == null) {
                        buyerGroupIdList.add(buyerGroupMemberRecord.BuyerGroupId);
                    }
                }
                List<String> accRelatedPolicyIdList = new List<String>();
                for (CommerceEntitlementBuyerGroup commerceEntitlementBuyerGroupRec : [
                    SELECT Id, Name, PolicyId, BuyerGroupId
                    FROM CommerceEntitlementBuyerGroup
                    WHERE BuyerGroupId IN :buyerGroupIdList
                ]) {
                    accRelatedPolicyIdList.add(commerceEntitlementBuyerGroupRec.PolicyId);
                }
                if (accRelatedPolicyIdList.isEmpty() == false) {
                    List<CommerceEntitlementProduct> commerceEntitlementProductList = [
                        SELECT Id, PolicyId, ProductId
                        FROM CommerceEntitlementProduct
                        WHERE PolicyId IN :accRelatedPolicyIdList
                    ];
                    if (commerceEntitlementProductList.isEmpty() == false) {
                        for (CommerceEntitlementProduct commerceEntitlementProductRec : commerceEntitlementProductList) {
                            validVariationProductIds.add(commerceEntitlementProductRec.ProductId);
                        }
                    }
                }
            }
            return validVariationProductIds;
        }
    }
}
