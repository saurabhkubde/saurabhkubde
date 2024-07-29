/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-06-27 14:47:39
 * @modify date 2022-12-05 14:47:39
 * @desc this is an extended version of the SF Labs implementation for related products
 */

@SuppressWarnings('PMD')
public without sharing class B2B_FeaturedProductsController {
    @TestVisible
    private static B2B_CommerceProxy commerceProxy = new B2B_CommerceProxy();

    public static final String AVAILABILITY_FIELD = 'B2B_Availability_JSON__c';
    public static final String VALUE_STRING = 'value';
    public static final String SILHOUETTE_STORE_NAME = 'Silhouette B2B Store';
    public static final String REST_CATEGORY_KEY = 'rest';
    public static final String SILHOUETTE_CATEGORY_NAME = System.Label.B2B_SH_Feature_Category.split(',')[0];

    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getProductsByCategoryId(
        String communityId,
        String effectiveAccountId,
        String categoryId,
        Boolean includePrices,
        Integer maxNumberOfProducts
    ) {
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);
        Map<String, Object> responseMap = new Map<String, Object>();

        List<Object> featuredProductList = new List<Object>();

        try {
            Set<Id> productIds = getFeaturedProductIdsByCategoryId(categoryId, maxNumberOfProducts);
            if (productIds.isEmpty() == true) {
                B2B_LogUtils.createPersistLogAsync(
                    Label.B2B_FP_Component_configuration_error + ' : Category contains no products',
                    B2B_LogUtils.LOG_COMMERCE_SETUP,
                    B2B_LogUtils.LOG_TYPE_ERROR,
                    'B2B_FeaturedProducts_Controller',
                    null
                );
                throw new B2B_CustomException('Configuration Error');
            }

            featuredProductList = getProductDetails(productIds, webstoreId, effectiveAccountId);

            if (includePrices && featuredProductList.isEmpty() == false && String.isNotBlank(effectiveAccountId)) {
                getProductPriceDetails(featuredProductList, webstoreId, effectiveAccountId);
            }
        } catch (B2B_CustomException e) {
        } catch (Exception err) {
            B2B_LogUtils.createPersistLogAsync(
                'Exception occured while fetching products for category:' +
                categoryId +
                ' | ' +
                err.getMessage(),
                B2B_LogUtils.LOG_COMMERCE_SETUP,
                B2B_LogUtils.LOG_TYPE_ERROR,
                'B2B_FeaturedProducts_Controller',
                null
            );
        }

        responseMap.put('data', featuredProductList.size() > 0 ? JSON.serialize(featuredProductList) : null);
        return responseMap;
    }

    /**
     * @description Call to fetch Product link related to the products added in cart.
     * @param communityId The Id of the community from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @param recordId ID of the cart.
     * @param linkType B2B Type of B2B Commerce Product Link that needs to be fetched.
     * @param includePrices specifies if product has should contain prices or not.
     * @param maxNumberOfProducts number of products to be returned from this method
     * @return map of 'data' Vs List of product data
     */

    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getProductsByLinkyType(
        String communityId,
        String effectiveAccountId,
        String recordId,
        String linkType,
        Boolean includePrices,
        Integer maxNumberOfProducts
    ) {
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);
        Map<String, Object> responseMap = new Map<String, Object>();
        List<Object> featuredProductList = new List<Object>(); //Added as part of BS-207
        List<Object> restFeaturedProductList = new List<Object>(); //Added as part of BS-207
        Set<Id> cartProductIdSet = new Set<Id>(); //Updated as part of BS-207
        Set<Id> spareCategoryProductIdSet = new Set<Id>(); //Added as part of BS-207
        Set<Id> filteredProductIdSet = new Set<Id>(); //Added as part of BS-207

        ProductCategory silhouetteCategoryObj; //Added as part of BS-207

        List<Object> availableFeaturedProductList = new List<Object>();

        List<WebStore> silhouetteWebStore = [SELECT Id FROM WebStore WHERE Name = :SILHOUETTE_STORE_NAME LIMIT 1]; //Added as part of BS-207

        List<Account> accountList = [SELECT Id, k_ARIS_Account_ID__c FROM ACCOUNT WHERE Id = :effectiveAccountId]; //Added as part of BS-207

        Set<Id> silhouetteProductCategorySet = new Set<Id>();

        List<String> categoryNameList = System.Label.B2B_SH_Feature_Category.split(',');

        List<ProductCategory> spareCategoryList = new List<ProductCategory>();

        //BS-207 : Fetch the Product category for silhouette store.
        List<ProductCategory> silhouetteAllCategoryList = [
            SELECT Id, ProductCategory.Name, ParentCategoryId, ParentCategory.ParentCategoryId
            FROM ProductCategory
            WHERE Name IN :categoryNameList
        ];

        //BS-207 : Identifying the top level category for Silhoutte and assigning it to an object for further refernces.
        for (ProductCategory categoryObj : silhouetteAllCategoryList) {
            if (categoryObj.Name == categoryNameList[0]) {
                silhouetteCategoryObj = categoryObj;
            } else {
                spareCategoryList.add(categoryObj);
            }
        }

        Map<String, String> categoryIdVsParentCategoryMap = getAllCategories();
        try {
            if (linkType == null) {
                B2B_LogUtils.createPersistLogAsync(
                    Label.B2B_FP_Component_configuration_error +
                    ' : ' +
                    Label.B2B_FP_LinkType_is_blank,
                    B2B_LogUtils.LOG_COMMERCE_SETUP,
                    B2B_LogUtils.LOG_TYPE_ERROR,
                    'B2B_FeaturedProducts_Controller',
                    null
                );
                throw new B2B_CustomException('Configuration Error');
            }

            //BS-207 : Fetching all the product Id which are added in the cart using in the Connect API.
            ConnectApi.CartItemCollection cartItemCollection = commerceProxy.getCartItems(webstoreId, effectiveAccountId, recordId);
            List<ProductCategoryProduct> productCategoryList = new List<ProductCategoryProduct>();

            if (cartItemCollection.cartItems.isEmpty() == false) {
                for (ConnectApi.CartItemResult item : cartItemCollection.cartItems) {
                    cartProductIdSet.add(item.cartItem.productId);
                }

                //BS-207 : Fetching all Product Category Category recods for the product added in cart to bifurcate Silhouette and Other category products.
                productCategoryList = [
                    SELECT Id, ProductCategoryId, ProductCategory.ParentCategoryId, ProductId
                    FROM ProductCategoryProduct
                    WHERE ProductId IN :cartProductIdSet
                ];
            } else {
                return responseMap;
            }

            Set<Id> silhouetteCartProductId = new Set<Id>();
            Set<Id> restCategoryCartProductId = new Set<Id>();

            //BS-207 : Block which calls getParentCategoryId which returns the top level Parent Category and checks if that is Silhouette and stores in separate Sets.
            for (ProductCategoryProduct productCategoryProductObj : productCategoryList) {
                if ((getParentCategoryId(productCategoryProductObj.ProductCategoryId, categoryIdVsParentCategoryMap) == silhouetteCategoryObj.Id)) {
                    silhouetteCartProductId.add(productCategoryProductObj.ProductId);
                } else {
                    restCategoryCartProductId.add(productCategoryProductObj.ProductId);
                }
            }
            Set<Id> silhouetteLinkProductIdSet = new Set<Id>();
            Set<Id> restLinkProductIdSet = new Set<Id>();

            Map<String, Set<Id>> getFeatureMap = new Map<String, Set<Id>>{
                SILHOUETTE_CATEGORY_NAME => new Set<Id>(silhouetteCartProductId),
                REST_CATEGORY_KEY => new Set<Id>(restCategoryCartProductId)
            };

            //BS-207 : Call to getFeaturedProductIdsByLinkType to get Map having links related to Silhouette and remaining category.
            Map<String, Set<Id>> storeVsFeatureProductbyLinkType = getFeaturedProductIdsByLinkType(getFeatureMap, linkType, maxNumberOfProducts);
            if (storeVsFeatureProductbyLinkType.containsKey(SILHOUETTE_CATEGORY_NAME)) {
                silhouetteLinkProductIdSet = storeVsFeatureProductbyLinkType.get(SILHOUETTE_CATEGORY_NAME);
            }

            if (storeVsFeatureProductbyLinkType.containsKey(REST_CATEGORY_KEY)) {
                restLinkProductIdSet = storeVsFeatureProductbyLinkType.get(REST_CATEGORY_KEY);
            }

            if (silhouetteLinkProductIdSet.isEmpty() == true && restLinkProductIdSet.isEmpty() == true) {
                B2B_LogUtils.createPersistLogAsync(
                    Label.B2B_FP_Component_configuration_error + ' : No B2B_Commerce_Product_Links__c available',
                    B2B_LogUtils.LOG_COMMERCE_SETUP,
                    B2B_LogUtils.LOG_TYPE_ERROR,
                    'B2B_FeaturedProducts_Controller',
                    null
                );
                throw new B2B_CustomException('Configuration Error');
            }

            //BS-207 : To run logic for silhouette store.
            if (webstoreId == silhouetteWebStore[0].Id) {
                for (ProductCategory categoryObj : spareCategoryList) {
                    if (getParentCategoryId(categoryObj.Id, categoryIdVsParentCategoryMap) == silhouetteCategoryObj.Id) {
                        silhouetteProductCategorySet.add(categoryObj.Id);
                    }
                }
                if (silhouetteProductCategorySet.isEmpty() == false && silhouetteLinkProductIdSet.isEmpty() == false) {
                    filteredProductIdSet = getFeaturedSpareCartProductIdsByCategoryId(silhouetteProductCategorySet, silhouetteLinkProductIdSet);
                    if (filteredProductIdSet.isEmpty() == true) {
                        B2B_LogUtils.createPersistLogAsync(
                            Label.B2B_FP_Component_configuration_error + ' : Category contains no products',
                            B2B_LogUtils.LOG_COMMERCE_SETUP,
                            B2B_LogUtils.LOG_TYPE_ERROR,
                            'B2B_FeaturedProducts_Controller',
                            null
                        );
                        throw new B2B_CustomException('Configuration Error');
                    }
                }
            }

            if (filteredProductIdSet.isEmpty() == false) {
                featuredProductList = getProductDetails(filteredProductIdSet, webstoreId, effectiveAccountId);
            }
            if (restLinkProductIdSet.isEmpty() == false) {
                restFeaturedProductList = getProductDetails(restLinkProductIdSet, webstoreId, effectiveAccountId);
            }

            //BS-207 : For running this logic for silhouette products.
            if (webstoreId == silhouetteWebStore[0].Id && silhouetteCategoryObj != null && featuredProductList.isEmpty() == false) {
                for (
                    B2B_FeaturedProductsModel.B2B_ProductDetailWrapper productObj : (List<B2B_FeaturedProductsModel.B2B_ProductDetailWrapper>) featuredProductList
                ) {
                    //BS-207 : Checking the availability of the product based on B2B_Availability_JSON__c field.
                    if (productObj.fields.get(AVAILABILITY_FIELD) != null) {
                        Map<String, Integer> countryCodeVsAvailabilityMap = (Map<String, Integer>) JSON.deserialize(
                            ((Map<String, String>) productObj.fields.get(AVAILABILITY_FIELD)).get(VALUE_STRING),
                            Map<String, Integer>.class
                        );
                        if (
                            countryCodeVsAvailabilityMap.containsKey(accountList[0].k_ARIS_Account_ID__c.substring(0, 4)) &&
                            countryCodeVsAvailabilityMap.get(accountList[0].k_ARIS_Account_ID__c.substring(0, 4)) > 0
                        ) {
                            availableFeaturedProductList.add((Object) productObj);
                        }
                    }
                }
            }

            if (restFeaturedProductList.isEmpty() == false) {
                availableFeaturedProductList.addAll(restFeaturedProductList);
            }

            //BS-207 : Checks if final Product Link list have more than maxNumberOfProducts and trims it to length having maxNumberOfProducts.
            if (availableFeaturedProductList.isEmpty() == false && availableFeaturedProductList.size() > maxNumberOfProducts) {
                Integer spareListSize = availableFeaturedProductList.size() - 1;
                for (Integer index = spareListSize; index >= maxNumberOfProducts; index--) {
                    availableFeaturedProductList.remove(index);
                }
            }
            if (includePrices && availableFeaturedProductList.isEmpty() == false && String.isNotBlank(effectiveAccountId)) {
                getProductPriceDetails(availableFeaturedProductList, webstoreId, effectiveAccountId);
            }
        } catch (B2B_CustomException e) {
        } catch (Exception err) {
            B2B_LogUtils.createPersistLogAsync(
                'Exception when fetching <' +
                linkType +
                '> for product: ' +
                cartProductIdSet +
                ' | ' +
                err.getMessage(),
                B2B_LogUtils.LOG_COMMERCE_SETUP,
                B2B_LogUtils.LOG_TYPE_ERROR,
                'B2B_FeaturedProducts_Controller',
                null
            );
        }

        responseMap.put('data', availableFeaturedProductList.size() > 0 ? JSON.serialize(availableFeaturedProductList) : null);
        return responseMap;
    }

    /**
     * @description : Returns a Map containing all categories as keys and their respective parent as values.
     */
    @TestVisible
    private static Map<String, String> getAllCategories() {
        Map<String, String> categoryIdVsParentCategoryMap = new Map<String, String>();
        List<ProductCategory> allProductCategory = [SELECT Id, ParentCategoryId FROM ProductCategory];
        if (allProductCategory.isEmpty() == false) {
            for (ProductCategory categoryObj : allProductCategory) {
                if (!categoryIdVsParentCategoryMap.containsKey(categoryObj.Id)) {
                    categoryIdVsParentCategoryMap.put(categoryObj.Id, categoryObj.ParentCategoryId);
                }
            }
        }

        return categoryIdVsParentCategoryMap;
    }

    /**
     * @description : Returns the top level parent for the category passed in as categoryId param
     * @param  categoryId : Category for which top level Category needs to identified
     * @param categoryIdVsParentCategoryMap :  Map containing all categories as keys and their respective parent as values.
     */
    @TestVisible
    private static Id getParentCategoryId(Id categoryId, Map<String, String> categoryIdVsParentCategoryMap) {
        String lastLevelParent = null;
        if (categoryIdVsParentCategoryMap.containsKey(categoryId) && categoryIdVsParentCategoryMap.get(categoryId) != null) {
            lastLevelParent = getParentCategoryId(categoryIdVsParentCategoryMap.get(categoryId), categoryIdVsParentCategoryMap);
        } else if (categoryIdVsParentCategoryMap.containsKey(categoryId) && categoryIdVsParentCategoryMap.get(categoryId) == null) {
            lastLevelParent = categoryId;
        }
        return lastLevelParent;
    }

    /**
     * Utilzes the Connect Apex API to retrieve the product details for each product Id in the List.
     */
    private static List<Object> getProductDetails(Set<Id> productIdList, String webstoreId, String effectiveAccountId) {
        List<String> mediaGroups = new List<String>();

        List<String> fields = new List<String>();
        fields.add('StockKeepingUnit');
        fields.add('Name');
        fields.add('Description');
        fields.add('B2B_Disable_Product__c');
        fields.add('B2B_Shipping_Status_JSON__c');
        fields.add('B2B_Availability_JSON__c');
        fields.add('B2B_Sparepart_Type__c'); //Added as part of BS-530
        fields.add('B2B_Picture_Link__c'); //Added as part of BS-207
        fields.add('B2B_Model__c'); //Added as part of BS-645
        fields.add('B2B_Brand__c'); //Added as part of BS-882
        fields.add('B2B_Product_Type__c'); //Added as part of BS-882
        fields.add('B2B_Frame_Color_Description__c'); //Added as part of BS-882
        fields.add('B2B_Design_Family__c'); //Added as part of BS-882

        List<B2B_FeaturedProductsModel.B2B_ProductDetailWrapper> productList = new List<B2B_FeaturedProductsModel.B2B_ProductDetailWrapper>();

        for (String productId : productIdList) {
            ConnectApi.ProductDetail detail = null;
            try {
                detail = B2B_ProductUtils.getProduct(webstoreId, productId, effectiveAccountId, fields);

                if (detail != null) {
                    B2B_FeaturedProductsModel.B2B_ProductDetailWrapper product = new B2B_FeaturedProductsModel.B2B_ProductDetailWrapper();
                    product.defaultImage = detail.defaultImage;

                    // Need to convert the field data returned to match how the search REST API returns that data.
                    Map<String, Object> fieldsMap = new Map<String, Object>();

                    for (String fieldName : detail.fields.keySet()) {
                        String fieldValue = detail.fields.get(fieldName);

                        Map<String, String> fieldValueMap = new Map<String, String>{ 'value' => fieldValue };

                        fieldsMap.put(fieldName, fieldValueMap);
                    }

                    product.fields = fieldsMap;
                    //product.entitlement = detail.entitlement; //BS-1245 : Commenting this line because of error : common.apex.runtime.impl.ExecutionException: This object was built in version 57.0. Maximum version for 'entitlement' access is: 56.0
                    product.mediaGroups = detail.mediaGroups;
                    product.primaryProductCategoryPath = detail.primaryProductCategoryPath;
                    product.id = detail.id;
                    product.name = detail.fields.get('Name');
                    product.modelNumber = detail.fields.get('B2B_Model__c'); // Added as a Part of BS-645
                    productList.add(product);
                }
            } catch (Exception e) {
                System.debug(LoggingLevel.WARN, 'Couldnt fetch product details for Product:' + productId);
            }
        }

        return productList;
    }

    /*
    Utilzes the Connect Apex API to retrieve the product pricing for each product Id in the List.
    */
    private static void getProductPriceDetails(List<Object> productList, String webstoreId, String effectiveAccountId) {
        List<ConnectApi.PricingLineItemInput> pricingLineItems = new List<ConnectApi.PricingLineItemInput>();

        ConnectApi.PricingInput pricingInput = new ConnectApi.PricingInput();

        for (Object obj : productList) {
            B2B_FeaturedProductsModel.B2B_ProductDetailWrapper product = (B2B_FeaturedProductsModel.B2B_ProductDetailWrapper) obj;

            String productId = product.id;

            ConnectApi.PricingLineItemInput lineItem = new ConnectApi.PricingLineItemInput();
            lineItem.productId = productId;

            pricingLineItems.add(lineItem);
        }

        pricingInput.pricingLineItems = pricingLineItems;

        List<ConnectApi.PricingResultLineItem> pricingLineItemResults = B2B_ProductUtils.getProductPrices(webstoreId, effectiveAccountId, pricingInput)
            .pricingLineItemResults;

        // Put all of the pricing results into a Map by productId
        Map<String, ConnectApi.PricingResultLineItem> pricingMap = new Map<String, ConnectApi.PricingResultLineItem>();

        for (ConnectApi.PricingResultLineItem resultLineItem : pricingLineItemResults) {
            String productId = resultLineItem.productId;
            pricingMap.put(productId, resultLineItem);
        }

        for (Object obj : productList) {
            B2B_FeaturedProductsModel.B2B_ProductDetailWrapper product = (B2B_FeaturedProductsModel.B2B_ProductDetailWrapper) obj;
            B2B_FeaturedProductsModel.B2B_ProductPricingWrapper prices = new B2B_FeaturedProductsModel.B2B_ProductPricingWrapper();

            String productId = product.id;

            //BS-1245 : Commenting out this block as it was causing Price Unavailable issue in featured products section
            /* if (productId.length() > 15) {
            productId = productId.substring(0, 15);
            } */

            if (pricingMap.containsKey(productId) || Test.isRunningTest()) {
                ConnectApi.PricingResultLineItem resultLineItem = Test.isRunningTest() ? pricingMap.values()[0] : pricingMap.get(productId);

                prices.listPrice = resultLineItem.listPrice;
                prices.unitPrice = resultLineItem.unitPrice;
                prices.pricebookEntryId = resultLineItem.pricebookEntryId;
            }

            product.prices = prices;
        }
    }

    /**
     * @description Call to fetch Product link related to the Ids defined in the values of the Map passed.
     * @param  categoryVsCartProductIdSetMap Map having bifurcated Silhouette and Remaining category product Ids (used to reduce the queries)
     * @param linkType B2B Type of B2B Commerce Product Link that needs to be fetched.
     * @param maxNumberOfProducts number of products to be returned from this method
     */

    @TestVisible
    private static Map<String, Set<Id>> getFeaturedProductIdsByLinkType(
        Map<String, Set<Id>> categoryVsCartProductIdSetMap,
        String linkType,
        Integer maxNumberOfProducts
    ) {
        Map<String, Set<Id>> responseLinkMap = new Map<String, Set<Id>>();

        Set<Id> cartProductIdSet = new Set<Id>();
        for (String key : categoryVsCartProductIdSetMap.keySet()) {
            if (categoryVsCartProductIdSetMap.get(key) != null && categoryVsCartProductIdSetMap.get(key).isEmpty() == false) {
                cartProductIdSet.addAll(categoryVsCartProductIdSetMap.get(key));
            }
        }
        List<B2B_Commerce_Product_Link__c> productLinkList = new List<B2B_Commerce_Product_Link__c>();

        if (
            B2B_Utils.checkIfAccessible(
                'B2B_Commerce_Product_Link__c',
                new List<String>{ 'Id', 'B2B_Source_Product__c', 'B2B_Target_Product__c', 'B2B_Type__c' }
            )
        ) {
            productLinkList = [
                SELECT Id, B2B_Target_Product__c, B2B_Source_Product__c
                FROM B2B_Commerce_Product_Link__c
                WHERE B2B_Source_Product__c IN :cartProductIdSet AND B2B_Type__c = :linkType
            ];

            //BS-207 : This block identifies for which Category type what all product Ids to return so as to apply further filtering logic.
            for (B2B_Commerce_Product_Link__c linkObj : productLinkList) {
                if (
                    responseLinkMap.containsKey(SILHOUETTE_CATEGORY_NAME) == false &&
                    categoryVsCartProductIdSetMap.containsKey(SILHOUETTE_CATEGORY_NAME) &&
                    categoryVsCartProductIdSetMap.get(SILHOUETTE_CATEGORY_NAME).contains(linkObj.B2B_Source_Product__c)
                ) {
                    responseLinkMap.put(SILHOUETTE_CATEGORY_NAME, new Set<Id>{ linkObj.B2B_Target_Product__c });
                } else if (
                    responseLinkMap.containsKey(SILHOUETTE_CATEGORY_NAME) &&
                    categoryVsCartProductIdSetMap.containsKey(SILHOUETTE_CATEGORY_NAME) &&
                    categoryVsCartProductIdSetMap.get(SILHOUETTE_CATEGORY_NAME).contains(linkObj.B2B_Source_Product__c)
                ) {
                    responseLinkMap.get(SILHOUETTE_CATEGORY_NAME).add(linkObj.B2B_Target_Product__c);
                }

                if (
                    responseLinkMap.containsKey(REST_CATEGORY_KEY) == false &&
                    categoryVsCartProductIdSetMap.containsKey(REST_CATEGORY_KEY) &&
                    categoryVsCartProductIdSetMap.get(REST_CATEGORY_KEY).contains(linkObj.B2B_Source_Product__c)
                ) {
                    responseLinkMap.put(REST_CATEGORY_KEY, new Set<Id>{ linkObj.B2B_Target_Product__c });
                } else if (
                    responseLinkMap.containsKey(REST_CATEGORY_KEY) &&
                    categoryVsCartProductIdSetMap.containsKey(REST_CATEGORY_KEY) &&
                    categoryVsCartProductIdSetMap.get(REST_CATEGORY_KEY).contains(linkObj.B2B_Source_Product__c)
                ) {
                    responseLinkMap.get(REST_CATEGORY_KEY).add(linkObj.B2B_Target_Product__c);
                }
            }
        } else {
            B2B_LogUtils.createPersistLogAsync(
                Label.B2B_FP_Component_configuration_error +
                ' : ' +
                Label.B2B_FP_ProductLink_not_accessible,
                B2B_LogUtils.LOG_COMMERCE_SETUP,
                B2B_LogUtils.LOG_TYPE_ERROR,
                'B2B_FeaturedProducts_Controller',
                null
            );
            throw new B2B_CustomException('Configuration Error');
        }
        return responseLinkMap;
    }

    @TestVisible
    private static Set<Id> getFeaturedProductIdsByCategoryId(String categoryId, Integer maxNumberOfProducts) {
        Set<Id> productIds = new Set<Id>();
        if (categoryId == null) {
            B2B_LogUtils.createPersistLogAsync(
                Label.B2B_FP_Component_configuration_error +
                ' : ' +
                Label.B2B_FP_CategoryId_is_blank,
                B2B_LogUtils.LOG_COMMERCE_SETUP,
                B2B_LogUtils.LOG_TYPE_ERROR,
                'B2B_FeaturedProducts_Controller',
                categoryId
            );
            throw new B2B_CustomException('Configuration Error');
        }

        Id categoryIdFromExternalId = [SELECT Id FROM ProductCategory WHERE B2B_Category_External_ID__c = :categoryId LIMIT 1]?.Id;

        final String[] objFields = new List<String>{ 'Id', 'ProductId', 'ProductCategoryId' };

        List<ProductCategoryProduct> categoryProductList = new List<ProductCategoryProduct>();

        if (B2B_Utils.checkIfAccessible('ProductCategoryProduct', objFields)) {
            categoryProductList = [
                SELECT Id, ProductId
                FROM ProductCategoryProduct
                WHERE ProductCategoryId = :categoryIdFromExternalId
                LIMIT :maxNumberOfProducts
            ];
        }
        if (categoryProductList.isEmpty() == false) {
            for (ProductCategoryProduct categoryProduct : categoryProductList) {
                productIds.add(categoryProduct.ProductId);
            }
        } else {
            return productIds;
        }

        return productIds;
    }

    /**
     * @description Call to fetch Product link related to the products added in cart. (Done to reduce number of queries)
     * @param  categoryIdSet Set containing
     * @param maxNumberOfProducts number of products to be returned from this method
     */
    @TestVisible
    private static Set<Id> getFeaturedSpareCartProductIdsByCategoryId(Set<Id> categoryIdSet, Set<Id> silhouetteLinkProductIdSet) {
        Set<Id> productIdSet = new Set<Id>();
        if (categoryIdSet.isEmpty() == true) {
            B2B_LogUtils.createPersistLogAsync(
                Label.B2B_FP_Component_configuration_error +
                ' : ' +
                Label.B2B_FP_CategoryId_is_blank,
                B2B_LogUtils.LOG_COMMERCE_SETUP,
                B2B_LogUtils.LOG_TYPE_ERROR,
                'B2B_FeaturedProducts_Controller',
                JSON.serializePretty(categoryIdSet)
            );
            throw new B2B_CustomException('Configuration Error');
        }

        final String[] objFields = new List<String>{ 'Id', 'ProductId', 'ProductCategoryId' };

        List<ProductCategoryProduct> categoryProductList = new List<ProductCategoryProduct>();

        if (B2B_Utils.checkIfAccessible('ProductCategoryProduct', objFields)) {
            categoryProductList = [
                SELECT Id, ProductId, ProductCategoryId
                FROM ProductCategoryProduct
                WHERE ProductCategoryId IN :categoryIdSet AND ProductId IN :silhouetteLinkProductIdSet
            ];
        }
        if (categoryProductList.isEmpty() == false) {
            for (ProductCategoryProduct categoryProduct : categoryProductList) {
                productIdSet.add(categoryProduct.ProductId);
            }
        } else {
            return productIdSet;
        }

        return productIdSet;
    }

    public class B2B_CustomException extends Exception {
    }
}
