/**
 * @author Vishalsingh Gaur
 * @email vishalsingh.gaur@theblueflamelabs.com
 * @create date 2023-04-05 16:18:32
 * @modify date 2023-04-06 13:03:32
 * @desc PDP controller class
 */

@SuppressWarnings('PMD')
public with sharing class B2B_VS_RX_PDP_Controller {
    @TestVisible
    private static B2B_CommerceProxy b2bProxy = new B2B_CommerceProxy();
    private static Integer queryLimit = 20;
    /**
     * @description getProduct
     * @author Vishalsingh Gaur
     * @param  communityId        communityId of the current store
     * @param  productId          productId of the selected product
     * @param  effectiveAccountId effectiveAccountId of the current user
     * @return                    return ConnectApi.ProductDetail product details
     */
    @AuraEnabled(cacheable=true)
    public static ConnectApi.ProductDetail getProduct(String communityId, String productId, String effectiveAccountId) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCatalog_static_methods.htm#apex_ConnectAPI_CommerceCatalog_static_methods
        return b2bProxy.getProduct(webstoreId, productId, effectiveAccountID, new List<String>());
    }

    /**
     * @description getProduct
     * @author Vishalsingh Gaur
     * @Modefied By Vishalsingh Gaur
     * @param  communityId        communityId of the current store
     * @param  productId          productId of the selected product
     * @param  effectiveAccountId effectiveAccountId of the current user
     * @param relationType        product link type
     * @param relatedProductIdList product ids which needs to be exclude
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
                LIMIT :queryLimit
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
                'B2B_VS_RX_PDP_Controller',
                null
            );
            return null;
        }
    }

    /**
     * @description getProductPrice
     * @author Vishalsingh Gaur
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
     * @author Vishalsingh Gaur
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
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_VS_RX_PDP_Controller', 'Error when fetching product images: ' + productId);
            throw new NullPointerException();
        }
    }

    /**
     * @description getProductMedia
     * @author Vishalsingh Gaur
     * @param  productId          productId of the selected product
     * @return                    return List<B2B_ProductDetailsModel.B2B_ProductMediaWrapper>
     */
    @AuraEnabled(cacheable=true)
    public static List<B2B_ProductDetailsModel.B2B_ProductMediaWrapper> getProductMedia(String productId) {
        try {
            List<B2B_Product_Media__c> productMedias = new B2B_FetchDataInSystemContext().getProductMedia(productId);

            List<B2B_ProductDetailsModel.B2B_ProductMediaWrapper> mediasList = new List<B2B_ProductDetailsModel.B2B_ProductMediaWrapper>();
            if (productMedias.isEmpty() == false) {
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
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_VS_RX_PDP_Controller', 'Error when fetching product medias: ' + productId);
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
     * @author Vishalsingh Gaur
     * @param  productId : productId of the selected product
     * @return return Boolean that if product is of brand Evil eye and product type frame
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
     * @author Vishalsingh Gaur
     * @param  currentCategoryRecordId : Id of the current passed category
     * @param  parentCategoryRecordId : Parent category Id of the current passed category
     * @param  productCategoryObj : current ProductCategory record
     * @param  categoryIdSet : Set that would contain the top level parent of which child nodes need to be returned
     * @param  productCategoryIdVsProductCategoryObj : Map of Id vs ProductCategory record
     * @return returns set containing Ids of all the child node categories
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

    /**
     * BS-788
     * @description this method will insert a data into lens configurator object
     * @param inputData: this parameter will get JSON data(which is lens configurator data) which gets from frame details save and next button
     */
    @AuraEnabled(cacheable=false)
    public static B2B_Lens_Configurator__c saveLensConfiguratorData(Map<String, Object> fieldNameVsLensConfiguratorDataMap) {
        B2B_Lens_Configurator__c lensConfObj = new B2B_Lens_Configurator__c();

        if (!fieldNameVsLensConfiguratorDataMap.isEmpty()) {
            //setting lens configurator data
            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.ACCOUNTID)) {
                lensConfObj.B2B_Account__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ACCOUNTID);
            }

            //BS-1117 : Extracting applicable brand (VS / RX) from configurator collection to set it's value in the field : B2B_Type__c
            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.APPLICABLE_BRAND)) {
                lensConfObj.B2B_Type__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.APPLICABLE_BRAND);
            }
            //BS-1117 - End

            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.COLLECTIONDESIGNFAMILY)) {
                lensConfObj.B2B_Frame_Collection__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.COLLECTIONDESIGNFAMILY);
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.CLERK)) {
                lensConfObj.B2B_Clerk__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.CLERK);
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.CUSTOMER_NAME)) {
                lensConfObj.B2B_Customer_Name__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.CUSTOMER_NAME);
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.FRAME_TYPE)) {
                lensConfObj.B2B_Frame_Type__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.FRAME_TYPE);
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.LENS_SIZE)) {
                lensConfObj.B2B_Lens_Size__c = Decimal.valueof((String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SIZE));
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.ORDER_TYPE)) {
                lensConfObj.B2B_Order_Type__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ORDER_TYPE);
            }

            if (
                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.ORDER_TYPE) &&
                B2B_Constants.LENS_ONLY.equalsIgnoreCase((String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ORDER_TYPE))
            ) {
                lensConfObj.B2B_LensHandling_SKU__c = System.Label.B2B_LENS_ONLY_LHA_SKU;
            }

            if (
                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.ORDER_TYPE) &&
                B2B_Constants.LENS_ONLY_FRAME_PROVIDED.equalsIgnoreCase((String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ORDER_TYPE))
            ) {
                lensConfObj.B2B_LensHandling_SKU__c = System.Label.B2B_LENS_ONLY_FRAME_PROVIDED_LHA_SKU;
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_FRAME_SKU)) {
                lensConfObj.B2B_Selected_Frame__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU);
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.STATUS)) {
                lensConfObj.B2B_Status__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.STATUS);
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.BRIDGE_SIZE)) {
                lensConfObj.B2B_Bridge__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BRIDGE_SIZE);
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.TEMPLE_LENGTH)) {
                lensConfObj.B2B_Temple__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.TEMPLE_LENGTH);
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.FRAME_COLOR_DESCRIPTION)) {
                lensConfObj.B2B_Frame_Color_Description__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.FRAME_COLOR_DESCRIPTION);
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.FRAME_COLOR)) {
                lensConfObj.B2B_Frame_Color__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.FRAME_COLOR);
            }

            if (
                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.APPLICABLE_BRAND) &&
                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.APPLICABLE_BRAND)).equalsIgnoreCase(B2B_Constants.RX_GLAZING) &&
                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.EE_SIZE)
            ) {
                lensConfObj.B2B_EE_Size__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.EE_SIZE);
            }

            if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.VARIANT_SHAPE)) {
                lensConfObj.B2B_Variant_Shape__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.VARIANT_SHAPE);
            }
            //BS-974
            if (
                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.APPLICABLE_BRAND) &&
                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.APPLICABLE_BRAND)).equalsIgnoreCase(B2B_Constants.VISION_SENSATION)
            ) {
                if (
                    fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_FRAME_SKU) &&
                    fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU) != null
                ) {
                    List<Product2> selectedFrameProductDetailsList = [
                        SELECT Id, B2B_Base_Curve__c, B2B_Salesconcept_unique__c, B2B_Color_Number__c
                        FROM Product2
                        WHERE StockKeepingUnit = :String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                        LIMIT 1
                    ];
                    if (selectedFrameProductDetailsList.isEmpty() == false) {
                        lensConfObj.B2B_Base_Curve__c = String.isNotBlank(selectedFrameProductDetailsList[0].B2B_Base_Curve__c)
                            ? selectedFrameProductDetailsList[0].B2B_Base_Curve__c
                            : null;
                        lensConfObj.B2B_Salesconcept__c = String.isNotBlank(selectedFrameProductDetailsList[0].B2B_Salesconcept_unique__c)
                            ? selectedFrameProductDetailsList[0].B2B_Salesconcept_unique__c
                            : null;
                        lensConfObj.B2B_Color_Number__c = String.isNotBlank(selectedFrameProductDetailsList[0].B2B_Color_Number__c)
                            ? selectedFrameProductDetailsList[0].B2B_Color_Number__c
                            : null;
                    }
                }
            }
            //BS-974

            //inserting data
            insert lensConfObj;
        } //end if

        return lensConfObj;
    }

    /**
     * BS-1255
     * @description this method will return the wrapper containing the details of the field that needs to shown on the PDP.
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
         * Name of the catalog for which the category translations needs to be fetched.
         */
        String categoryFieldName;

        /*
         * BS-1255
         * Variable to store which field to dynamically refer for ordering the fields based on the brand
         */
        String orderByFieldName;

        /*
         * BS-1255
         * Variable to store which field to dynamically refer for ordering the fields based on the brand
         */
        String applicableCatalogue;

        /**
         * Start BS-1255
         * Block to identify and populate the fields for category and order.
         */
        if (brand.equalsIgnoreCase(B2B_Constants.SILHOUETTE_BRAND)) {
            categoryFieldName = B2B_Constants.PDP_METADATA_SILHOUETTE_CATEGORY_FIELD;
            orderByFieldName = B2B_Constants.PDP_METADATA_SH_ORDER_FIELD;
        } else if (brand.equalsIgnoreCase(B2B_Constants.EVIL_EYE_BRAND)) {
            categoryFieldName = B2B_Constants.PDP_METADATA_EVIL_EYE_CATEGORY_FIELD;
            orderByFieldName = B2B_Constants.PDP_METADATA_EE_ORDER_FIELD;
        }

        /*
         * Fetch the custom metadata records using query to fetch them based on the order we want them to be displayed on UI
         * Added the fields B2B_Category_Evil_Eye__c & B2B_Category_Silhouette__c
         * Updated the query to be a dynamic query.
         */
        String metadataQuery =
            'SELECT Id,' +
            'DeveloperName,' +
            'B2B_Brand__c,' +
            'B2B_Field_Name__c,' +
            'B2B_Category_Evil_Eye__c,' +
            'B2B_Category_Silhouette__c,' +
            'B2B_Attribute_Display_Order_Evil_Eye__c,' +
            'B2B_Attribute_Display_Order_Silhouette__c,' +
            'Is_Active__c ' +
            'FROM B2B_PDP_Show_More_Preference_Setting__mdt ' +
            'WHERE Is_Active__c = TRUE ORDER BY ' +
            String.escapeSingleQuotes(orderByFieldName);

        for (B2B_PDP_Show_More_Preference_Setting__mdt showMorePreferenceObj : Database.query(String.escapeSingleQuotes(metadataQuery))) {
            showMorePreferenceSettingMetadataMap.put(showMorePreferenceObj.DeveloperName, showMorePreferenceObj);
        }

        if (catalogNameList.isEmpty() == false && catalogNameList[0] != null) {
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

        List<B2B_ProductFieldWrapper> productFieldWrapperList = new List<B2B_ProductFieldWrapper>(); //Wrapper list which would be returned.
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

    /**
     * BS-722
     * @description : this method will return the List of product record.
     * @param productId: id of the product
     */
    @AuraEnabled(cacheable=false)
    public static List<Product2> getFrameTypeAndModelData(String productId) {
        List<Product2> productList = new List<Product2>();
        if (String.isNotBlank(productId)) {
            //BS-1701 : Added Name, BS-1916 : added variant shape and shape size.
            productList = [
                SELECT
                    Id,
                    Name,
                    B2B_Frame_type__c,
                    B2B_Model__c,
                    B2B_Variant_Shape__c,
                    B2B_Shape_Size__c,
                    B2B_Rimless_Variant__c,
                    B2B_Bridge_Size__c,
                    B2B_Hexcode_Accent__c,
                    B2B_Hexcode__c
                FROM Product2
                WHERE Id = :productId
                LIMIT 1
            ];
        }
        return productList.isEmpty() == false ? productList : null;
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
                    AND D2C_Available_In__c = :B2B_Constants.B2B_FIELD_FORMAT
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
         * Added as part of BS-709
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
         * Added as part of BS-709
         */
        @TestVisible
        private List<ProductCategory> getProductCategory() {
            Integer remainingQueryRowLimit = Limits.getLimitQueryRows() - Limits.getQueryRows();
            return [SELECT Id, Name, ParentCategoryId, B2B_Category_External_ID__c FROM ProductCategory LIMIT :remainingQueryRowLimit];
        }

        /**
         * BS-1255
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
     * BS-960
     * @author Vishalsingh Gaur
     * @desc Method to will fetch the Id of Special Parent product related to the variation parent.
     * @param  productId Variation Parent Id
     * @return Id of the Special Parent Product
     */
    @AuraEnabled(cacheable=false)
    public static Id getSpacialVariationParentData(String productId) {
        List<B2B_Commerce_Product_Link__c> commerceLinkList = [
            SELECT B2B_Type__c, B2B_Source_Product__c, B2B_Target_Product__c
            FROM B2B_Commerce_Product_Link__c
            WHERE B2B_Source_Product__c = :productId AND B2B_Type__c = :B2B_Constants.SPECIAL_VARIATION_PARENT
        ];
        return commerceLinkList.isEmpty() == false ? commerceLinkList[0].B2B_Target_Product__c : null;
    }

    /**
     * BS-960
     * @author Vishalsingh Gaur
     * @desc Method to will fetch the Id of the Variation Parent product related to the Spacial variation parent.
     * @param  productId Variation Parent Id
     * @return Id of the Special Parent Product
     */
    @AuraEnabled(cacheable=false)
    public static Id getVariationParentData(String productId) {
        List<B2B_Commerce_Product_Link__c> commerceLinkList = [
            SELECT B2B_Type__c, B2B_Source_Product__c, B2B_Target_Product__c
            FROM B2B_Commerce_Product_Link__c
            WHERE B2B_Target_Product__c = :productId AND B2B_Type__c = :B2B_Constants.SPECIAL_VARIATION_PARENT
        ];
        return commerceLinkList.isEmpty() == false ? commerceLinkList[0].B2B_Source_Product__c : null;
    }

    /**
     * @description : This method is used to fetch the product details from server for the provided Ids
     * @author Chirag L
     * BS-1713
     * @param  productIdList : List containing product Ids
     */
    @AuraEnabled(cacheable=false)
    public static List<Product2> getProductDetails(List<Id> productIdList) {
        if (productIdList.isEmpty() == false) {
            List<Product2> productList = [SELECT Id, B2B_Availability_JSON__c FROM Product2 WHERE Id IN :productIdList];
            return productList;
        } else {
            return null;
        }
    }

    /**
     * @description : This method is used to fetch the account details from server for the provided Id
     * @author Chirag L
     * BS-1713
     * @param  accountId : Id account for whic the details needs to be fetched
     */
    @AuraEnabled(cacheable=false)
    public static List<Account> getAccountDetails(Id accountId) {
        if (accountId != null) {
            List<Account> accountList = [SELECT Id, k_ARIS_Account_ID__c FROM Account WHERE Id = :accountId];
            return accountList;
        } else {
            return null;
        }
    }

    /**
     * @author Vishalsingh Gaur
     * @desc Wrapper to store the field API name and their respective labels based on the locale.
     * Added as part of BS-709
     */
    public class B2B_ProductFieldWrapper {
        @AuraEnabled
        public String fieldName;

        @AuraEnabled
        public String fieldLabel;

        @AuraEnabled
        public List<String> categoryList; //BS-1255 : Update the category list to be a generic list.

        @AuraEnabled
        public Boolean isDateField; //BS-1255
    }
}
