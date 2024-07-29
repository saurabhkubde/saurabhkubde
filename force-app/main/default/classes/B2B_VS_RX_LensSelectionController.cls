@SuppressWarnings('PMD')
public without sharing class B2B_VS_RX_LensSelectionController {
    @AuraEnabled(cacheable=false)
    public static List<ProductCategoryProduct> getAvailableLensProducts(String categoryName, String selectedFrameSKU, String pageSource) {
        //BS-1132 - Start
        //Added input parameter - selectedFrameSKU that holds the SKU of currently selected frame by user on UI

        if (String.isNotBlank(categoryName)) {
            String query = 'SELECT Id, Name, Product.Id, Product.Name, Product.StockKeepingUnit, toLabel(Product.B2B_Lens_Type__c), Product.Description, ';
            query += 'Product.B2B_Lens_Index__c, toLabel(Product.B2B_Material__c), Product.B2B_Base_Curve_Optical_Sun__c, Product.B2B_Base_Curve__c, Product.B2B_Availability_JSON__c, Product.B2B_Schneider_SKU__c, ProductCategory.Name FROM ProductCategoryProduct';
            query += ' WHERE ProductCategory.Name = \'' + String.escapeSingleQuotes(categoryName) + '\'';

            if (String.isNotBlank(selectedFrameSKU)) {
                // Here adding extra condition to search query that will fetch products whoes base curve is same as of base curve of selected frame by user on UI.
                // This will be applicable only if the selected category is either adapter or direct glazing.
                List<Product2> frameProductList = new List<Product2>();
                frameProductList = [SELECT Id, Name, B2B_Base_Curve__c, B2B_Base_Curve_Optical_Sun__c FROM Product2 WHERE StockKeepingUnit = :selectedFrameSKU];

                if (frameProductList.isEmpty() == false) {
                    //BS-2219
                    String frameProductBaseCurve = categoryName == B2B_Constants.OPTICAL_SUN_GLAZING
                        ? frameProductList[0].B2B_Base_Curve_Optical_Sun__c
                        : frameProductList[0].B2B_Base_Curve__c;
                    query += ' AND Product.B2B_Base_Curve__c = \'' + String.escapeSingleQuotes(frameProductBaseCurve) + '\'';
                }
            }

            List<ProductCategoryProduct> availableCategoryProductsList = new List<ProductCategoryProduct>();
            availableCategoryProductsList = Database.query(query);

            if (availableCategoryProductsList.isEmpty() == false) {
                return availableCategoryProductsList;
            } else {
                return null;
            }
        } else {
            return null;
        }
        //BS-1132 - End
    }

    /**
     * BS-1019
     * @description This method is used to get antireflection and hardcoating SKUs from commerce product link for source lens selected by user
     * @auther Chirag L
     * @param isAntireflectionSKUApplicable : Whether the antireflection SKU is applicable
     * @param isHardCoatingApplicable       : Whether the hard coating SKU is applicable
     * @param sourceProductSKU              : SKU of source product(selected Lens)
     * @return commerceProductLinkList      : Collection containing commerce product link records
     */
    @AuraEnabled(cacheable=false)
    public static List<B2B_Commerce_Product_Link__c> getApplicableTargetProductDetails(
        Boolean isAntireflectionSKUApplicable,
        Boolean isHardCoatingApplicable,
        String sourceProductSKU
    ) {
        try {
            List<B2B_Commerce_Product_Link__c> commerceProductLinkList = new List<B2B_Commerce_Product_Link__c>();
            if (isAntireflectionSKUApplicable != null && isHardCoatingApplicable != null && String.isNotBlank(sourceProductSKU)) {
                Set<String> applicableRelationTypesSet = new Set<String>();
                if (isAntireflectionSKUApplicable == true) {
                    applicableRelationTypesSet.add(B2B_Constants.RELATION_TYPE_ANTIREFLECTION);
                }
                if (isHardCoatingApplicable == true) {
                    applicableRelationTypesSet.add(B2B_Constants.RELATION_TYPE_HARDCOATING);
                }
                commerceProductLinkList = [
                    SELECT
                        Id,
                        B2B_Source_Product__c,
                        B2B_Source_Product__r.name,
                        B2B_Source_Product__r.StockKeepingUnit,
                        B2B_Type__c,
                        B2B_Target_Product__r.B2B_Schneider_SKU__c, // BS-1019
                        B2B_Target_Product__c //BS-1522
                    FROM B2B_Commerce_Product_Link__c
                    WHERE B2B_Source_Product__r.StockKeepingUnit = :sourceProductSKU AND B2B_Type__c IN :applicableRelationTypesSet
                ];
            }
            return commerceProductLinkList;
        } catch (Exception exceptionInstance) {
            B2B_LogUtils.createInfoLog(exceptionInstance.getMessage(), 'B2B_VS_RX_LensSelectionController', null);
            throw new AuraHandledException('Error while fetching SchneiderSKU from Commerce Product Link');
        }
    }

    /**
     * BS-1466
     * @description This method is used to get the products from commerce product link for source lens selected by user
     * @auther Vishalsingh Gaur
     * @param productSku   : SKU of source product(selected Lens)
     * @return commerceProductLinkList  : Collection containing commerce product link records
     */
    @AuraEnabled(cacheable=false)
    public static List<B2B_Commerce_Product_Link__c> getLensRelatedProducts(String productSKU) {
        List<B2B_Commerce_Product_Link__c> commerceProductLinkList = new List<B2B_Commerce_Product_Link__c>();
        Set<String> applicableRelationTypesSet = new Set<String>{
            B2B_Constants.RELATION_TYPE_LENS_COLOR,
            B2B_Constants.RELATION_TYPE_PHOTO_SENSATION,
            B2B_Constants.RELATION_TYPE_BLUE_SENSATION,
            B2B_Constants.RELATION_TYPE_ANTIREFLECTION,
            B2B_Constants.RELATION_TYPE_HARDCOATING
        };
        commerceProductLinkList = [
            SELECT
                Id,
                B2B_Source_Product__c,
                B2B_Source_Product__r.name,
                B2B_Source_Product__r.Id,
                B2B_Target_Product__r.Id,
                B2B_Type__c,
                B2B_Source_Product__r.B2B_Schneider_SKU__c,
                toLabel(B2B_Target_Product__r.Description),
                B2B_Schneider_SKU__c,
                B2B_Target_Product__r.B2B_Availability_JSON__c
            FROM B2B_Commerce_Product_Link__c
            WHERE B2B_Source_Product__r.StockKeepingUnit = :productSKU AND B2B_Type__c IN :applicableRelationTypesSet
        ];
        return commerceProductLinkList;
    }

    /**
     * BS-1466
     * @description This method is used to get the frame products category name.
     * @auther Vishalsingh Gaur
     * @param productSku   : SKU of frame product
     * @return category name of the frame product.
     */
    @AuraEnabled(cacheable=false)
    public static String getProductCategoryName(String selectedSKU) {
        List<ProductCategoryProduct> productCategoryProductList = [
            SELECT Id, ProductCategory.Name
            FROM ProductCategoryProduct
            WHERE Product.StockKeepingUnit = :selectedSKU
        ];
        return productCategoryProductList.isEmpty() == false ? productCategoryProductList[0].productCategory.Name : null;
    }

    /**
     * BS-1524
     * @description This method is remove the antireflection SKU field is user opt out for antireflection
     * @auther Chirag L
     * @param lensConfiguratorId   : Id of B2B_Lens_Configurator__c record
     */
    @AuraEnabled(cacheable=false)
    public static void updateAntireflectionSKU(String lensConfiguratorId) {
        if (String.isNotBlank(lensConfiguratorId)) {
            List<B2B_Lens_Configurator__c> lensConfiguratorList = [
                SELECT Id, B2B_Antireflection_SKU__c
                FROM B2B_Lens_Configurator__c
                WHERE Id = :lensConfiguratorId
            ];
            if (lensConfiguratorList.isEmpty() == false) {
                lensConfiguratorList[0].B2B_Antireflection_SKU__c = null;
                update lensConfiguratorList;
            }
        }
    }

    /**
     * BS-1647
     * @description This method fetches the k_ARIS_Account_ID__c field from account record
     * @auther Vishalsingh Gaur
     * @param accountId   : Id of Account record
     */
    @AuraEnabled(cacheable=false)
    public static String getAccountInfo(String accountId) {
        List<Account> accountList = [SELECT Id, k_ARIS_Account_ID__c FROM Account WHERE Id = :accountId];
        return accountList.isEmpty() == false ? accountList[0].k_ARIS_Account_ID__c : null;
    }

    /**
     * @description This method is used to check if the product is entitled for the user.
     * BS-1796
     * @author Vishalsingh G
     * @param effectiveAccountId  effectiveAccountId of logged in user
     */
    @AuraEnabled(cacheable=false)
    public static Boolean checkProductEntitlement(String effectiveAccountId, String productSku) {
        Set<String> productIdSet = new Set<String>();
        set<String> buyerGroupIdSet = new Set<String>();
        set<String> policyIdSet = new Set<String>();
        List<CommerceEntitlementProduct> commerceEntitlementProductList = new List<CommerceEntitlementProduct>();
        for (BuyerGroupMember bgMember : [SELECT Id, Name, BuyerGroupId, BuyerId FROM BuyerGroupMember WHERE BuyerId = :effectiveAccountId]) {
            buyerGroupIdSet.add(bgMember.BuyerGroupId);
        }
        List<CommerceEntitlementBuyerGroup> commerceEntitlementBuyerGroupList = [
            SELECT Id, Name, PolicyId, BuyerGroupId
            FROM CommerceEntitlementBuyerGroup
            WHERE BuyerGroupId IN :buyerGroupIdSet
        ];
        for (CommerceEntitlementBuyerGroup commerceEntitlementBuyerGroupObject : commerceEntitlementBuyerGroupList) {
            policyIdSet.add(commerceEntitlementBuyerGroupObject.PolicyId);
        }

        commerceEntitlementProductList = [
            SELECT Id, PolicyId, ProductId
            FROM CommerceEntitlementProduct
            WHERE PolicyId IN :policyIdSet AND Product.StockKeepingUnit = :productSku
        ];
        return commerceEntitlementProductList.size() >= 1 ? true : false;
    }
}
