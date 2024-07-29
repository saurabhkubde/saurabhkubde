/**
 * @author Chirag L
 * @email chirag.lapasia@theblueflamelabs.com
 * @desc This contains all the methods that are necessary for VS-RX functionality
 * As Category is not visible hence needed to make class as without sharing
 */
@SuppressWarnings('PMD')
public without sharing class B2B_VisionSensation_RX_Controller {
    @TestVisible
    private static B2B_CommerceProxy commerceProxy = new B2B_CommerceProxy();

    /**
     * BS-708
     * @description This method is used to get sorting rules applicable for the store according to communityId
     * @author Chirag L
     * @param communityId   Id of community of current logged in user
     */
    @AuraEnabled(cacheable=false)
    public static Object getSortRules(String communityId) {
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        return commerceProxy.getSortRules(webstoreId);
    }

    /**
     * @description This method is used to return structured category details list
     * BS-708
     * @author Chirag L
     * @param productIdList     list of products that are respecting current users entitlement policy
     * @param categoryId        Id of current category selected by user
     * @param language          language locale of currently logged in user
     * @return                  returns category details in custom wrapper/data format
     */
    @AuraEnabled(cacheable=false)
    public static List<B2B_CategoryWrapper> getCategoryData(List<String> productIdList, String categoryId, String language) {
        Map<String, B2B_CategoryWrapper> categoryIdVsCategoryMap = new Map<String, B2B_CategoryWrapper>();
        Map<String, String> categoryNameVStranslationMap;
        B2B_CategoryWrapper categoryWrapper;
        if (categoryId != null) {
            AggregateResult[] categoryProductCountList = [
                SELECT
                    count(ProductId) productCount,
                    ProductCategory.Name categoryName,
                    ProductCategory.Id categoryId,
                    ProductCategory.ParentCategory.Name parentCategory,
                    ProductCategory.ParentCategoryId parentCategoryId,
                    ProductCategory.ParentCategory.ParentCategory.Name superParent,
                    ProductCategory.ParentCategory.ParentCategoryId superParentCategoryId
                FROM ProductCategoryProduct
                WHERE
                    ProductId IN :productIdList
                    AND (ProductCategory.ParentCategoryId = :categoryId
                    OR ProductCategory.ParentCategory.ParentCategoryId = :categoryId)
                GROUP BY
                    ProductCategory.ParentCategory.Name,
                    ProductCategory.Name,
                    ProductCategory.Id,
                    ProductCategory.ParentCategoryId,
                    ProductCategory.ParentCategory.ParentCategory.Name,
                    ProductCategory.ParentCategory.ParentCategoryId

            ];

            for (AggregateResult categoryData : categoryProductCountList) {
                if (
                    categoryData.get(B2B_Constants.SUPER_PARENT_CATEGORY) == null ||
                    categoryId != String.valueOf(categoryData.get(B2B_Constants.SUPER_PARENT_CATEGORY_ID))
                ) {
                    categoryWrapper = new B2B_CategoryWrapper();
                    categoryWrapper.categoryId = String.valueOf(categoryData.get(B2B_Constants.CATEGORY_ID));
                    categoryWrapper.categoryName = String.valueOf(categoryData.get(B2B_Constants.CATEGORY_NAME));
                    categoryWrapper.parentCategory = String.valueOf(categoryData.get(B2B_Constants.PARENT_CATEGORY));
                    categoryWrapper.productCount = Integer.valueOf(categoryData.get(B2B_Constants.PRODUCT_COUNT));
                    categoryIdVsCategoryMap.put(categoryWrapper.categoryId, categoryWrapper);
                } else {
                    if (categoryIdVsCategoryMap.containsKey(String.valueOf(categoryData.get(B2B_Constants.PARENT_CATEGORY_ID)))) {
                        categoryWrapper = categoryIdVsCategoryMap.get(String.valueOf(categoryData.get(B2B_Constants.PARENT_CATEGORY_ID)));
                        categoryWrapper.productCount = categoryWrapper.productCount + Integer.valueOf(categoryData.get(B2B_Constants.PRODUCT_COUNT));
                    } else {
                        categoryWrapper = new B2B_CategoryWrapper();
                        categoryWrapper.categoryId = String.valueOf(categoryData.get(B2B_Constants.PARENT_CATEGORY_ID));
                        categoryWrapper.categoryName = String.valueOf(categoryData.get(B2B_Constants.PARENT_CATEGORY));
                        categoryWrapper.parentCategory = String.valueOf(categoryData.get(B2B_Constants.SUPER_PARENT_CATEGORY));
                        categoryWrapper.productCount = Integer.valueOf(categoryData.get(B2B_Constants.PRODUCT_COUNT));
                        categoryIdVsCategoryMap.put(categoryWrapper.categoryId, categoryWrapper);
                    }
                }
            }
        } else {
            categoryIdVsCategoryMap = getParentCategoryData(productIdList);
        }
        //BS-2342: removed a condition
        if (categoryIdVsCategoryMap != null && categoryIdVsCategoryMap.isEmpty() == false) {
            //BS-2342: added WHERE clause
            List<ProductCategoryDataTranslation> productCategoryDataTranslationList = [
                SELECT Id, Name, Language, ParentId, Parent.name
                FROM ProductCategoryDataTranslation
                WHERE Language = :language
            ];
            categoryNameVStranslationMap = new Map<String, String>();
            for (ProductCategoryDataTranslation categoryTranslation : productCategoryDataTranslationList) {
                if (categoryNameVStranslationMap.containsKey(categoryTranslation.ParentId) == false) {
                    categoryNameVStranslationMap.put(categoryTranslation.ParentId, categoryTranslation.Name);
                }
            }
            for (String category : categoryIdVsCategoryMap.keySet()) {
                if (categoryNameVStranslationMap.containsKey(category)) {
                    categoryIdVsCategoryMap.get(category).categoryName = categoryNameVStranslationMap.get(category);
                    categoryIdVsCategoryMap.get(category).parentCategory = categoryNameVStranslationMap.containsKey(categoryId)
                        ? categoryNameVStranslationMap.get(categoryId)
                        : categoryIdVsCategoryMap.get(category).parentCategory;
                }
            }
        }

        //To sort the categories as per the sorting order
        List<B2B_CategoryWrapper> categoryWrapperList = new List<B2B_CategoryWrapper>();
        if (categoryIdVsCategoryMap.isEmpty() == false) {
            Map<Id, ProductCategory> idVsProductCategoryMap = new Map<Id, ProductCategory>(
                [SELECT Id, IsDeleted, Name, SortOrder FROM ProductCategory WHERE Id IN :categoryIdVsCategoryMap.keySet() ORDER BY SortOrder]
            );
            for (Id productCategoryId : idVsProductCategoryMap.keySet()) {
                if (categoryIdVsCategoryMap.containsKey(productCategoryId)) {
                    categoryWrapperList.add(categoryIdVsCategoryMap.get(productCategoryId));
                }
            }
        }

        return categoryWrapperList.isEmpty() ? null : categoryWrapperList;
    }

    /**
     * @description This method is used to return details of parent category of currently selected category by user
     * BS-708
     * @author  Chirag L
     * @param   productIdList product ids to get the category for
     * @return  parent category details in Map format
     */
    public static Map<String, B2B_CategoryWrapper> getParentCategoryData(List<String> productIdList) {
        B2B_CategoryWrapper categoryWrapper;
        Map<String, B2B_CategoryWrapper> categoryIdVsCategoryMap = new Map<String, B2B_CategoryWrapper>();
        AggregateResult[] categoryProductCountList = [
            SELECT
                count(ProductId) productCount,
                ProductCategory.Name categoryName,
                ProductCategory.Id categoryId,
                ProductCategory.ParentCategory.Name parentCategory,
                ProductCategory.ParentCategoryId parentCategoryId,
                ProductCategory.ParentCategory.ParentCategory.Name superParent,
                ProductCategory.ParentCategory.ParentCategoryId superParentCategoryId
            FROM ProductCategoryProduct
            WHERE ProductId IN :productIdList
            GROUP BY
                ProductCategory.ParentCategory.Name,
                ProductCategory.Name,
                ProductCategory.Id,
                ProductCategory.ParentCategoryId,
                ProductCategory.ParentCategory.ParentCategory.Name,
                ProductCategory.ParentCategory.ParentCategoryId

        ];

        for (AggregateResult categoryData : categoryProductCountList) {
            if (
                categoryData.get(B2B_Constants.SUPER_PARENT_CATEGORY) != null &&
                categoryIdVsCategoryMap.containsKey(String.valueOf(categoryData.get(B2B_Constants.SUPER_PARENT_CATEGORY_ID))) == false
            ) {
                categoryWrapper = new B2B_CategoryWrapper();
                categoryWrapper.categoryId = String.valueOf(categoryData.get(B2B_Constants.SUPER_PARENT_CATEGORY_ID));
                categoryWrapper.categoryName = String.valueOf(categoryData.get(B2B_Constants.SUPER_PARENT_CATEGORY));
                categoryWrapper.parentCategory = System.Label.B2B_All_Category;
                categoryWrapper.productCount = Integer.valueOf(categoryData.get(B2B_Constants.PRODUCT_COUNT));
                categoryIdVsCategoryMap.put(categoryWrapper.categoryId, categoryWrapper);
            } else if (
                categoryData.get(B2B_Constants.SUPER_PARENT_CATEGORY) != null &&
                categoryIdVsCategoryMap.containsKey(String.valueOf(categoryData.get(B2B_Constants.SUPER_PARENT_CATEGORY_ID)))
            ) {
                categoryWrapper = categoryIdVsCategoryMap.get(String.valueOf(categoryData.get(B2B_Constants.SUPER_PARENT_CATEGORY_ID)));
                categoryWrapper.productCount = categoryWrapper.productCount + Integer.valueOf(categoryData.get(B2B_Constants.PRODUCT_COUNT));
            } else if (
                categoryData.get(B2B_Constants.PARENT_CATEGORY) != null &&
                categoryIdVsCategoryMap.containsKey(String.valueOf(categoryData.get(B2B_Constants.PARENT_CATEGORY_ID))) == false
            ) {
                categoryWrapper = new B2B_CategoryWrapper();
                categoryWrapper.categoryId = String.valueOf(categoryData.get(B2B_Constants.PARENT_CATEGORY_ID));
                categoryWrapper.categoryName = String.valueOf(categoryData.get(B2B_Constants.PARENT_CATEGORY));
                categoryWrapper.parentCategory = System.Label.B2B_All_Category;
                categoryWrapper.productCount = Integer.valueOf(categoryData.get(B2B_Constants.PRODUCT_COUNT));
                categoryIdVsCategoryMap.put(categoryWrapper.categoryId, categoryWrapper);
            } else if (categoryIdVsCategoryMap.containsKey(String.valueOf(categoryData.get(B2B_Constants.PARENT_CATEGORY_ID)))) {
                categoryWrapper = categoryIdVsCategoryMap.get(String.valueOf(categoryData.get(B2B_Constants.PARENT_CATEGORY_ID)));
                categoryWrapper.productCount = categoryWrapper.productCount + Integer.valueOf(categoryData.get(B2B_Constants.PRODUCT_COUNT));
            } else {
                categoryWrapper = new B2B_CategoryWrapper();
                categoryWrapper.categoryId = String.valueOf(categoryData.get(B2B_Constants.CATEGORY_ID));
                categoryWrapper.categoryName = String.valueOf(categoryData.get(B2B_Constants.CATEGORY_NAME));
                categoryWrapper.parentCategory = System.Label.B2B_All_Category;
                categoryWrapper.productCount = Integer.valueOf(categoryData.get(B2B_Constants.PRODUCT_COUNT));
                categoryIdVsCategoryMap.put(categoryWrapper.categoryId, categoryWrapper);
            }
        }
        return categoryIdVsCategoryMap;
    }

    /**
     * @description This method is used to return picklist values and field name wit additional parameters
     * BS-654
     * @author Chirag L
     * @param  objectApiName    API name of the object on which the picklist field whose values to be fetched is present
     * @param  picklistField    name of picklist field whose values to be fetched
     * @return                  returns the available picklist values with custom parameters in wrapper format
     */
    @AuraEnabled(cacheable=true)
    public static B2B_PicklistFieldWrapper getFieldPicklistValues(String objectApiName, String picklistField) {
        if (String.isNotBlank(objectApiName) && String.isNotBlank(picklistField)) {
            List<B2B_PicklistValuesWrapper> pickListValuesList = new List<B2B_PicklistValuesWrapper>();
            B2B_PicklistFieldWrapper picklistFieldDataWrapper = new B2B_PicklistFieldWrapper();
            DescribeSObjectResult objectSchemaResult = Schema.getGlobalDescribe().get(objectApiName).getDescribe();
            Schema.DescribeFieldResult fieldResult = objectSchemaResult.fields.getMap().get(picklistField).getDescribe();

            List<Schema.PicklistEntry> picklistEntryList = fieldResult.getPicklistValues();

            for (Schema.PicklistEntry pickListValue : picklistEntryList) {
                B2B_PicklistValuesWrapper picklistWrapper = new B2B_PicklistValuesWrapper();
                picklistWrapper.apiName = pickListValue.getValue();
                picklistWrapper.picklistValue = pickListValue.getLabel();

                pickListValuesList.add(picklistWrapper);
            }

            picklistFieldDataWrapper.fieldName = fieldResult.getLabel();
            picklistFieldDataWrapper.picklistValues = pickListValuesList;
            return picklistFieldDataWrapper;
        } else {
            return null;
        }
    }

    /**
     * @description This method is used to return all filters available for specified store and category
     * BS-442
     * @author Chirag L
     * @param  categoryName     name of category associated with the store and selected by user
     * @param  storeName        web store in which user is currently logged in
     * @return                  returns the available filters with various custom parameters in wrapper format
     */
    @AuraEnabled
    public static List<B2B_AvailableFiltersDataWrapper> getFilters(String categoryName, String storeName) {
        // Fetching Filter Preference Setting Records and assigning to filtersMap
        //filtersMap : Key: Filter Preference Setting API Name, Value : Filter Preference Setting record
        Map<String, B2B_VS_RX_Filters_Preference_Settings__mdt> filtersMap = new Map<String, B2B_VS_RX_Filters_Preference_Settings__mdt>();
        filtersMap = getFilterPreferenceSettingRecords();

        // Fill all Filter Preference Setting record data into custom wrapper: B2B_filterDataWrapper
        List<B2B_filterDataWrapper> filtersDataWrapperList = new List<B2B_filterDataWrapper>();
        if ((filtersMap != null) || (filtersMap.isEmpty() == false)) {
            filtersDataWrapperList = fillFilterDataWrapper(filtersMap);
        }

        // Set the needed Filter Preference Setting record data into custom wrapper: B2B_AvailableFiltersDataWrapper
        List<B2B_AvailableFiltersDataWrapper> availableFiltersList = new List<B2B_AvailableFiltersDataWrapper>();
        availableFiltersList = fillAvailableFilterDataWrapper(filtersDataWrapperList, categoryName, storeName);

        return availableFiltersList;
    }

    /**
     * @description This method is used to return all VS RX filter preference setting records
     * BS-442
     * @author Chirag L
     * @return returns the filter preference setting records with selected fields
     */
    public static Map<String, B2B_VS_RX_Filters_Preference_Settings__mdt> getFilterPreferenceSettingRecords() {
        //BS-1594 : Updated the logic to fetch filters on basis of Filter_Order__c
        Map<String, B2B_VS_RX_Filters_Preference_Settings__mdt> filtersMap = new Map<String, B2B_VS_RX_Filters_Preference_Settings__mdt>();

        List<B2B_VS_RX_Filters_Preference_Settings__mdt> filtersList = [
            SELECT
                Id,
                DeveloperName,
                MasterLabel,
                Language,
                NamespacePrefix,
                Label,
                QualifiedApiName,
                Brand__c,
                Category_EE__c,
                Category_SH__c,
                Filter_Type__c,
                Filter_Order__c,
                IsActive__c,
                Source_Product_Field__c,
                Parent_Controlling_Filter__c,
                Specified_Values__c,
                Slider_Minimum_Value__c, //BS-457
                Slider_Maximum_Value__c, //BS-457
                Slider_Increment_Value__c, //BS-457
                Slider_Type__c, //BS-457
                Multiselect__c //BS-930
            FROM B2B_VS_RX_Filters_Preference_Settings__mdt
            WHERE IsActive__c = TRUE
            ORDER BY Filter_Order__c ASC NULLS LAST, Source_Product_Field__c ASC
        ];

        if (filtersList.isEmpty() == false) {
            for (B2B_VS_RX_Filters_Preference_Settings__mdt filter : filtersList) {
                filtersMap.put(filter.DeveloperName, filter);
            }
        }
        if (filtersMap.isEmpty() == false) {
            return filtersMap;
        } else {
            return null;
        }
    }

    /**
     * @description This method is used to return the product Image list dependig on the frame selected.
     * BS-1341
     * @author Sachin V
     * @param  selectedFrameSKU   selected rx solution sku from the configurator
     * @return                   returns the product image list of the provided frame sku
     * BS-2424      Now we get the frame image from picture link field of Product object instead of Product Image Object
     *              for better segregation of images between B2B and D2C
     */
    @AuraEnabled(cacheable=false)
    public static List<Product2> getFrameImage(String selectedFrameSKU) {
        List<Product2> productImageList = new List<Product2>();
        if (String.isNotBlank(selectedFrameSKU)) {
            productImageList = [
                SELECT Id, B2B_Picture_Link__c
                FROM Product2
                WHERE B2B_Picture_Link__c != NULL AND StockKeepingUnit = :selectedFrameSKU
                LIMIT 1
            ];
        }
        return productImageList.isEmpty() ? null : productImageList;
    }

    /**
     * @description This method is used to return the product Image list dependig on the frame selected.
     * BS-1341
     * @author Sachin V
     * @param  selectedFrameSKU   selected rx solution sku from the configurator
     * @return                   returns the product image list of the provided frame sku
     */
    @AuraEnabled(cacheable=false)
    public static List<Product2> getFrameProductValues(String selectedFrameSKU) {
        List<Product2> productList = new List<product2>();
        if (String.isNotBlank(selectedFrameSKU)) {
            productList = [
                SELECT
                    Id,
                    Name, //BS-1701
                    B2B_Design_Family__c,
                    StockKeepingUnit,
                    B2B_Frame_Color_Description__c,
                    B2B_Lens_Size__c,
                    B2B_EE_Size__c,
                    B2B_Model__c,
                    B2B_Frame_type__c,
                    B2B_Bridge_Size__c,
                    B2B_Color_Number__c,
                    B2B_Variant_Shape__c,
                    B2B_Shape_Size__c,
                    B2B_Rimless_Variant__c,
                    B2B_Hexcode__c, //BS-2158
                    B2B_Hexcode_Accent__c, //BS-2158
                    B2B_Temple_Length__c //BS-1064
                FROM Product2
                WHERE StockKeepingUnit = :selectedFrameSKU
                LIMIT 1
            ];
        }
        return productList.isEmpty() ? null : productList;
    }

    /**
     * @description This method is used to return the product list dependig on the rx solution selected in the configurator.
     * BS-1151
     * @author Sachin V
     * @param  selectedRxSolutionSKU   selected rx solution sku from the configurator
     * @return                   returns the product list of the provided rx solution sku
     */
    @AuraEnabled(cacheable=false)
    public static List<Product2> getRxSolutionValues(String selectedRxSolutionSKU) {
        List<Product2> productList = [SELECT Id, Description FROM Product2 WHERE StockKeepingUnit = :selectedRxSolutionSKU LIMIT 1];
        return productList.isEmpty() ? null : productList;
    }

    /**
     * @description This method is used to return the product list of the provided lens sku and lens index.
     * BS-1151
     * @author Sachin V
     * @param  selectedLensSKU   selected lens sku from the configurator
     * @param  lensIndex         selected lens index from the configurator
     * @return                   returns the product list of the provided lens sku and lens index.
     */
    @AuraEnabled(cacheable=false)
    public static List<Product2> getLensSelectionValues(String selectedLensSKU, String lensIndex) {
        List<Product2> productList = [
            SELECT Id, B2B_Material__c
            FROM Product2
            WHERE StockKeepingUnit = :selectedLensSKU AND B2B_Lens_Index__c = :lensIndex
            LIMIT 1
        ];
        return productList.isEmpty() ? null : productList;
    }

    /**
     * @description This method will get all the field values of a lens configurator.
     * @param  lensConfiguratorId   id of the lens configurator record.
     * BS-1151
     * @author Sachin V
     */
    @AuraEnabled
    public static List<B2B_Lens_Configurator__c> getLensConfiguratorData(String lensConfiguratorId, Boolean isReadOnlyPage) {
        if (String.isNotBlank(lensConfiguratorId)) {
            Set<String> lensConfiguratorFieldSet = new Set<String>();

            List<B2B_Lens_Configurator__c> lensConfiguratorDataList = new List<B2B_Lens_Configurator__c>();
            for (Schema.FieldSetMember fieldSetInstance : SObjectType.B2B_Lens_Configurator__c.FieldSets.VS_RX_Configurator_fieldset.getFields()) {
                lensConfiguratorFieldSet.add(fieldSetInstance.getFieldPath());
            }

            String query = 'SELECT ';
            if (isReadOnlyPage == false) {
                for (String fields : lensConfiguratorFieldSet) {
                    if (fields.equalsIgnoreCase('B2B_Account__c') == false) {
                        query += fields + ',';
                    }
                }
                query += ' B2B_Account__c FROM B2B_Lens_Configurator__c WHERE Id=\'' + lensConfiguratorId + '\'';
            } else {
                for (String fields : lensConfiguratorFieldSet) {
                    if (
                        fields.equalsIgnoreCase('B2B_Account__c') == false &&
                        fields.equalsIgnoreCase('B2B_Order_Type__c') == false &&
                        fields.equalsIgnoreCase('B2B_Base_Values__c') == false &&
                        fields.equalsIgnoreCase('B2B_Eye_Side__c') == false &&
                        fields.equalsIgnoreCase('B2B_Frame_Type__c') == false
                    ) {
                        query += fields + ',';
                    }
                }
                query +=
                    ' B2B_Account__c, toLabel(B2B_Order_Type__c),toLabel(B2B_Frame_Type__c),toLabel(B2B_Base_Values__c),toLabel(B2B_Eye_Side__c) FROM B2B_Lens_Configurator__c WHERE Id=\'' +
                    lensConfiguratorId +
                    '\'';
            }
            lensConfiguratorDataList = Database.query(query);
            if (lensConfiguratorDataList.isEmpty() == false) {
                return lensConfiguratorDataList;
            }
        }
        return null;
    }

    /**
     * @description This method is used to return selected frame modal and size data
     * BS-1065
     * @author Sachin V
     * @return Product Data
     */
    @AuraEnabled
    public static List<Product2> getSelectedFrameModalSize(String selectedFrameSku) {
        List<Product2> productList = new List<Product2>();

        if (selectedFrameSku != null) {
            productList = [SELECT Id, B2B_Model__c, B2B_EE_Size__c, Stockkeepingunit FROM product2 WHERE Stockkeepingunit = :selectedFrameSku];
        } //end if

        return productList;
    } //end getSelectedFrameModalSize

    /**
     * @description This method is used to return fetched filter preference setting records in structured/ reformed format
     * BS-442
     * @author Chirag L
     * @param  filtersMap   map of filter preference setting API name vs filter preference setting records
     * @return              returns the fetched filter preference setting records in structured/ reformed format
     */
    public static List<B2B_filterDataWrapper> fillFilterDataWrapper(Map<String, B2B_VS_RX_Filters_Preference_Settings__mdt> filtersMap) {
        List<B2B_filterDataWrapper> filtersDataWrapperList = new List<B2B_filterDataWrapper>();

        for (String key : filtersMap.keySet()) {
            B2B_filterDataWrapper filterDataWrapper = new B2B_filterDataWrapper();
            filterDataWrapper.checkedFilterValue = false;
            filterDataWrapper.isActive = filtersMap.get(key).IsActive__c;
            filterDataWrapper.masterLabel = (filtersMap.get(key).MasterLabel).trim();
            filterDataWrapper.language = (filtersMap.get(key).Language).trim();

            filterDataWrapper.filterType = (String.isNotBlank(filtersMap.get(key).Filter_Type__c)) ? (filtersMap.get(key).Filter_Type__c).trim() : null;
            filterDataWrapper.isMultiselect = filtersMap.get(key).Multiselect__c; //Added as part of BS-930

            if (filterDataWrapper.filterType.equalsIgnoreCase(B2B_Constants.RADIO_BUTTON_TYPE_FILTER) == true) {
                filterDataWrapper.isRadioButtonType = true;
            } else if (filterDataWrapper.filterType.equalsIgnoreCase(B2B_Constants.COLOR_RADIO_BUTTON_TYPE_FILTER)) {
                filterDataWrapper.isColorRadioButtonType = true;

                //BS-457 - Start
            } else if (filterDataWrapper.filterType.equalsIgnoreCase(B2B_Constants.SLIDER_TYPE_FILTER)) {
                filterDataWrapper.isSliderType = true;
                filterDataWrapper.sliderMinimumValue = filtersMap.get(key).Slider_Minimum_Value__c != null
                    ? (filtersMap.get(key).Slider_Minimum_Value__c)
                    : null;
                filterDataWrapper.sliderMaximumValue = filtersMap.get(key).Slider_Maximum_Value__c != null
                    ? (filtersMap.get(key).Slider_Maximum_Value__c)
                    : null;
                filterDataWrapper.sliderIncrementValue = filtersMap.get(key).Slider_Increment_Value__c != null
                    ? (filtersMap.get(key).Slider_Increment_Value__c)
                    : null;
                filterDataWrapper.sliderType = String.isNotBlank(filtersMap.get(key).Slider_Type__c) ? filtersMap.get(key).Slider_Type__c : null;
                filterDataWrapper.sliderSelectedLeftValue = null;
                filterDataWrapper.sliderSelectedRightValue = null;

                //BS-457 - End
            } else {
                filterDataWrapper.isRadioButtonType = false;
                filterDataWrapper.isColorRadioButtonType = false;
                filterDataWrapper.isSliderType = false;
            }

            filterDataWrapper.developerName = filtersMap.get(key).DeveloperName;
            filterDataWrapper.filterOrder = (Integer) filtersMap.get(key).Filter_Order__c;

            String categorySH = (String.isNotBlank(filtersMap.get(key).Category_SH__c)) ? (filtersMap.get(key).Category_SH__c).trim() : null;

            List<String> categorySHList = categorySH != null ? categorySH.split(',') : new List<String>();
            filterDataWrapper.categorySHList = getCategoryList(categorySHList);

            String categoryEE = (String.isNotBlank(filtersMap.get(key).Category_EE__c)) ? (filtersMap.get(key).Category_EE__c).trim() : null;

            List<String> categoryEEList = categoryEE != null ? categoryEE.split(',') : new List<String>();
            filterDataWrapper.categoryEEList = getCategoryList(categoryEEList);

            String tempFilterValues = (String.isNotBlank(filtersMap.get(key).Specified_Values__c)) ? (filtersMap.get(key).Specified_Values__c).trim() : null;
            List<String> valuesList = tempFilterValues != null ? tempFilterValues.split(',') : new List<String>();
            List<String> filterValuesList = new List<String>();

            if (valuesList != null && valuesList.isEmpty() == false) {
                for (String value : valuesList) {
                    if (String.isNotBlank(value)) {
                        filterValuesList.add(value.trim());
                    }
                }
            }

            filterDataWrapper.filterValuesList = filterValuesList;

            String brandNames = (String.isNotBlank(filtersMap.get(key).Brand__c)) ? (filtersMap.get(key).Brand__c).trim() : null;
            List<String> brandsNameList = brandNames != null ? brandNames.split(',') : new List<String>();
            List<String> brandsList = new List<String>();

            if (brandsNameList != null && brandsNameList.isEmpty() == false) {
                for (String brand : brandsNameList) {
                    if (String.isNotBlank(brand)) {
                        brandsList.add(brand.trim());
                    }
                }
            }

            filterDataWrapper.brandsList = brandsList;
            filterDataWrapper.sourceProductField = (filtersMap.get(key).Source_Product_Field__c).trim();
            filterDataWrapper.filterValues = getFieldPicklistValues(B2B_Constants.PRODUCT_OBJECT_API_NAME, filtersMap.get(key).Source_Product_Field__c);
            filterDataWrapper.fieldName = filterDataWrapper.filterValues.fieldName;
            filterDataWrapper.controllingFieldList = (String.isNotBlank(filtersMap.get(key).Parent_Controlling_Filter__c))
                ? (filtersMap.get(key).Parent_Controlling_Filter__c).split('=')
                : new List<String>();
            List<B2B_PicklistValuesWrapper> picklistValuesList = new List<B2B_PicklistValuesWrapper>();

            List<String> controlledByList = (String.isNotBlank(filtersMap.get(key).Parent_Controlling_Filter__c))
                ? (filtersMap.get(key).Parent_Controlling_Filter__c).split(',')
                : new List<String>();
            List<List<String>> controlledKeyList = new List<List<String>>();

            for (String controllingParameterValue : controlledByList) {
                if (String.isNotBlank(controllingParameterValue)) {
                    controlledKeyList.add(controllingParameterValue.split('='));
                }
            }

            String parentSourceProductField;

            List<List<String>> controllingParameters = new List<List<String>>();
            for (List<String> controllingingListValue : controlledKeyList) {
                for (String value : controllingingListValue) {
                    controllingParameters.add(value.split(';'));
                    if (((value.containsIgnoreCase(B2B_Constants.CUSTOM_FIELD_FORMAT)) || (value.containsIgnoreCase(B2B_Constants.B2B_FIELD_FORMAT)))) {
                        parentSourceProductField = value;
                    }
                }
            }

            List<String> controllingValuesList = new List<String>();
            for (List<String> controlingParameterListValue : controllingParameters) {
                for (String value : controlingParameterListValue) {
                    controllingValuesList.add(value);
                }
            }

            List<String> picklistValuesNameList = new List<String>();

            filterDataWrapper.controllingParametersList = controllingValuesList != null ? controllingValuesList : new List<String>();

            if (filterDataWrapper.controllingParametersList.isEmpty() == false && String.isNotBlank(parentSourceProductField)) {
                B2B_PicklistFieldWrapper tempPicklistValues = getFieldPicklistValues(B2B_Constants.PRODUCT_OBJECT_API_NAME, parentSourceProductField);
                for (String controllingParameter : filterDataWrapper.controllingParametersList) {
                    for (B2B_PicklistValuesWrapper pickListValuesWrapper : tempPicklistValues.picklistValues) {
                        if (pickListValuesWrapper.apiName.equalsIgnoreCase(controllingParameter)) {
                            picklistValuesNameList.add(pickListValuesWrapper.picklistValue);
                        }
                    }
                }
                if (picklistValuesNameList.isEmpty() == false) {
                    for (String picklistValueName : picklistValuesNameList) {
                        if (filterDataWrapper.controllingParametersList.contains(picklistValueName) == false) {
                            filterDataWrapper.controllingParametersList.add(picklistValueName);
                        }
                    }
                }
            }

            for (B2B_PicklistValuesWrapper values : filterDataWrapper.filterValues.picklistValues) {
                String nameOfFilter = values.apiname.toLowerCase().replaceAll('\\s+', '');

                if (filterDataWrapper.sourceProductField.equalsIgnoreCase(B2B_Constants.SHAPE_FIELD)) {
                    values.filterIcon = B2B_Constants.FILTER_LABEL + '-' + B2B_Constants.SHAPE_FILTER + '-' + nameOfFilter;
                } else if (filterDataWrapper.sourceProductField.equalsIgnoreCase(B2B_Constants.FACE_TYPE_FIELD)) {
                    values.filterIcon = B2B_Constants.FILTER_LABEL + '-' + B2B_Constants.FACE_FILTER + '-' + nameOfFilter;
                } else {
                    values.filterIcon = null;
                }
                values.isValueChecked = false;

                if (filterDataWrapper.filterValuesList.isEmpty() == false) {
                    for (String filterValue : filterDataWrapper.filterValuesList) {
                        if (values.apiName.equalsIgnoreCase(filterValue) || values.picklistValue.equalsIgnoreCase(filterValue)) {
                            picklistValuesList.add(values);
                        }
                    }
                } else {
                    picklistValuesList.add(values);
                }
            }

            filterDataWrapper.filterValues.picklistValues = picklistValuesList;
            filterDataWrapper.filterId = filtersMap.get(key).Id;
            filtersDataWrapperList.add(filterDataWrapper);
        }
        return filtersDataWrapperList;
    }

    /**
     * @description This method is used to restructure available filters
     * BS-442
     * @author Chirag L
     * @param  filtersDataWrapperList   list of filter preference setting records in formatted manner
     * @param  categoryName             name of category associated with the store and selected by user
     * @param  storeName                web store in which user is currently logged in
     * @return                          returns the fetched available preference setting records in structured/ reformed format
     */
    public static List<B2B_AvailableFiltersDataWrapper> fillAvailableFilterDataWrapper(
        List<B2B_filterDataWrapper> filtersDataWrapperList,
        String categoryName,
        String storeName
    ) {
        if (string.isNotBlank(categoryName)) {
            List<B2B_AvailableFiltersDataWrapper> availableFiltersList = new List<B2B_AvailableFiltersDataWrapper>();
            for (B2B_filterDataWrapper filterWrapper : filtersDataWrapperList) {
                B2B_AvailableFiltersDataWrapper availableFilterWrapper = new B2B_AvailableFiltersDataWrapper();

                List<String> referenceCategory;
                if (storeName.equalsIgnoreCase(B2B_Constants.SILHOUETTE_BRAND)) {
                    referenceCategory = filterWrapper.categorySHList != null ? filterWrapper.categorySHList : new List<String>();
                } else if (storeName.equalsIgnoreCase(B2B_Constants.EVIL_EYE_BRAND)) {
                    referenceCategory = filterWrapper.categoryEEList != null ? filterWrapper.categoryEEList : new List<String>();
                }

                if (
                    filterWrapper.brandsList.contains(storeName) &&
                    referenceCategory != null &&
                    (referenceCategory.isEmpty() == false) &&
                    referenceCategory.contains(categoryName)
                ) {
                    availableFilterWrapper.filterType = filterWrapper.filterType;
                    availableFilterWrapper.category = categoryName;
                    availableFilterWrapper.filterName = filterWrapper.fieldName;
                    availableFilterWrapper.availableFilters = filterWrapper;
                    availableFiltersList.add(availableFilterWrapper);
                } else if (filterWrapper.brandsList.contains(storeName) && referenceCategory != null && ((referenceCategory.isEmpty()))) {
                    availableFilterWrapper.filterType = filterWrapper.filterType;
                    availableFilterWrapper.category = categoryName;
                    availableFilterWrapper.filterName = filterWrapper.fieldName;
                    availableFilterWrapper.availableFilters = filterWrapper;
                    availableFiltersList.add(availableFilterWrapper);
                }
            }
            return availableFiltersList;
        } else {
            List<B2B_AvailableFiltersDataWrapper> availableFiltersList = new List<B2B_AvailableFiltersDataWrapper>();
            for (B2B_filterDataWrapper filterWrapper : filtersDataWrapperList) {
                B2B_AvailableFiltersDataWrapper availableFilterWrapper = new B2B_AvailableFiltersDataWrapper();
                if (filterWrapper.brandsList.contains(storeName)) {
                    availableFilterWrapper.filterType = filterWrapper.filterType;
                    availableFilterWrapper.category = null;
                    availableFilterWrapper.filterName = filterWrapper.fieldName;
                    availableFilterWrapper.availableFilters = filterWrapper;
                    availableFiltersList.add(availableFilterWrapper);
                }
            }
            return availableFiltersList;
        }
    }

    /**
     * @description This method is used to return structured/trimmed category details list
     * BS-442
     * @author Chirag L
     * @param inputCategoryList     category list containing unnecessary white spaces
     * @return                      returns list containing structured and formatted categories data
     */
    public static List<String> getCategoryList(List<String> inputCategoryList) {
        List<String> categoryList = new List<String>();
        if (inputCategoryList != null && inputCategoryList.isEmpty() == false) {
            for (String category : inputCategoryList) {
                categoryList.add(category.trim());
            }
        }
        if (categoryList.isEmpty() == false) {
            return categoryList;
        } else {
            return null;
        }
    }

    /**
     * @description Retrieves the custom metadata type records.
     */
    @AuraEnabled(cacheable=true)
    public static String getColorsMetadata() {
        Map<String, B2B_Color_Filters__mdt> mapColorCodes = B2B_Color_Filters__mdt.getAll();
        return JSON.serialize(mapColorCodes);
    }

    /**
     * @description This method is used to return applicable products according to entitlement policy and category
     * BS-442
     * @author Chirag L
     * @param  effectiveAccountId            :   AccountId of currently logged in user
     * @param  storeName                     :   Current store of logged in user (Vision Sensation/ RX Glazing)
     * @param  globalEntitlementApplicable   :   Whether Global entitlement policy should be applicable(True/False)
     * @param  categoryIdList                :   List containing category names
     * @return returns list of applicable products
     */
    @AuraEnabled(cacheable=false)
    public static List<Product2> getEntitlementProducts(
        String effectiveAccountId,
        String storeName,
        Boolean globalEntitlementApplicable,
        List<String> categoryIdList
    ) {
        String applicableStore = '';
        String productType = B2B_Constants.PERFORMANCE_SPORT_RX_SOLUTION; //BS-1215
        if (
            String.isNotBlank(effectiveAccountId) &&
            String.isNotBlank(storeName) &&
            String.isNotBlank(effectiveAccountId) &&
            categoryIdList.isEmpty() == false
        ) {
            if (storeName.equalsIgnoreCase(B2B_Constants.SILHOUETTE_BRAND)) {
                applicableStore = B2B_Constants.VISION_SENSATION;
            } else if (storeName.equalsIgnoreCase(B2B_Constants.EVIL_EYE_BRAND)) {
                applicableStore = B2B_Constants.RX_GLAZING;
            }
            List<BuyerGroupMember> buyerGroupMembersList = new List<BuyerGroupMember>();
            Set<String> buyerGroupIdSet = new Set<String>();
            Map<String, Object> buyerGroupBindVariablesMap = new Map<String, Object>{
                'applicableStoreType' => applicableStore,
                'accountOfCurrentUser' => effectiveAccountId
            };
            String query = 'SELECT Id, Name, BuyerGroupId, BuyerId FROM BuyerGroupMember WHERE Buyer.Id =:accountOfCurrentUser AND ';
            if (globalEntitlementApplicable == false) {
                query += ' BuyerGroup.B2B_Type__c = null';
            } else if (globalEntitlementApplicable == true) {
                query += ' BuyerGroup.B2B_Type__c != null AND BuyerGroup.B2B_Type__c = :applicableStoreType';
            }
            buyerGroupMembersList = Database.queryWithBinds(query, buyerGroupBindVariablesMap, AccessLevel.SYSTEM_MODE);
            if (buyerGroupMembersList.isEmpty() == false) {
                for (BuyerGroupMember buyerGroupMember : buyerGroupMembersList) {
                    buyerGroupIdSet.add(buyerGroupMember.BuyerGroupId);
                }
                List<String> policyIdList = new List<String>();
                List<CommerceEntitlementBuyerGroup> commerceEntitlementBuyerGroupList = [
                    SELECT Id, Name, PolicyId, BuyerGroupId
                    FROM CommerceEntitlementBuyerGroup
                    WHERE BuyerGroupId IN :buyerGroupIdSet
                ];

                for (CommerceEntitlementBuyerGroup commerceEntitlementBuyerGroup : commerceEntitlementBuyerGroupList) {
                    policyIdList.add(commerceEntitlementBuyerGroup.PolicyId);
                }
                List<String> productIdList = new List<String>();
                List<CommerceEntitlementProduct> commerceEntitlementProductList = [
                    SELECT Id, PolicyId, ProductId
                    FROM CommerceEntitlementProduct
                    WHERE PolicyId IN :policyIdList
                ];
                for (CommerceEntitlementProduct comEntProductObj : commerceEntitlementProductList) {
                    productIdList.add(comEntProductObj.ProductId);
                }
                Set<Id> categoryIdSet = new Set<Id>();
                for (String categoryId : categoryIdList) {
                    categoryIdSet.add(categoryId);
                }
                List<ProductCategory> productCategoryList = [SELECT Id, Name FROM ProductCategory WHERE ParentCategoryId IN :categoryIdList];
                if (productCategoryList.isEmpty() == false) {
                    for (ProductCategory productCategory : productCategoryList) {
                        categoryIdSet.add(productCategory.Id);
                    }
                    List<ProductCategory> childProductCategoryList = [SELECT Id, Name FROM ProductCategory WHERE ParentCategoryId IN :categoryIdSet];
                    if (childProductCategoryList.isEmpty() == false) {
                        for (ProductCategory productCategory : childProductCategoryList) {
                            categoryIdSet.add(productCategory.Id);
                        }
                    }
                }
                Set<Id> productIdSet2 = new Set<Id>();
                List<ProductCategoryProduct> productCategoryproductList = [
                    SELECT ProductId
                    FROM ProductCategoryProduct
                    WHERE
                        ProductId IN :productIdList
                        AND ProductCategoryId IN :categoryIdSet
                        AND Product.ProductClass != 'VariationParent'
                        AND Product.B2B_Is_Special__c = FALSE
                ];
                for (ProductCategoryProduct productCatProObj : productCategoryproductList) {
                    productIdSet2.add(productCatProObj.ProductId);
                }

                String productListQuery = '';
                Schema.DisplayType picklistType;

                //Global describe call for storing the sobject data.
                Map<String, Schema.SObjectField> sObjectNameVsFieldMap = Schema.getGlobalDescribe()
                    .get(B2B_Constants.PRODUCT_OBJECT_API_NAME)
                    .getDescribe()
                    .fields.getMap();
                // building a query to get the products
                productListQuery = 'SELECT ';
                for (Schema.FieldSetMember fieldSetInstance : SObjectType.Product2.FieldSets.VS_RX_Product_Search_Attributes.getFields()) {
                    productListQuery += ' ' + fieldSetInstance.getFieldPath() + ',';
                }
                productListQuery = productListQuery.removeEnd(',');
                productListQuery += ' FROM Product2 WHERE Id IN :productIdSet2';
                //below if statement is Added as part of BS-1215
                if (storeName.equalsIgnoreCase(B2B_Constants.EVIL_EYE_BRAND)) {
                    productListQuery += ' AND B2B_Product_Type__c !=: productType';
                }
                String remainingQueryLimit = String.valueOf(Limits.getLimitQueryRows() - Limits.getQueryRows());
                productListQuery += ' LIMIT ' + remainingQueryLimit;
                List<Product2> productList = Database.query(productListQuery);
                if (productList.isEmpty() == false) {
                    return productList;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     * @description This method is used to get category details for VS/RX categories
     * BS-708
     * @author Chirag L
     * @param categoriesList    List containing category names from which the products shouldbe displayed
     * @return category details in custom format
     */
    @AuraEnabled(cacheable=false)
    public static List<B2B_VS_RX_CategoriesDataWrapper> getCategoriesDataForVSRX(List<String> categoriesList) {
        if (categoriesList.isEmpty() == false) {
            List<B2B_VS_RX_CategoriesDataWrapper> categoriesDataWrapperList = new List<B2B_VS_RX_CategoriesDataWrapper>();
            B2B_VS_RX_CategoriesDataWrapper categoriesDataWrapper = new B2B_VS_RX_CategoriesDataWrapper();
            List<WebStoreCatalog> webStoreCatalogList = new List<WebStoreCatalog>();

            //Fetching catalog name through webstore
            String silhouetteStoreFront = System.Label.B2B_StoreFrontName;
            webStoreCatalogList = [
                SELECT Id, Name, ProductCatalogId, ProductCatalog.Name, SalesStore.name
                FROM WebStoreCatalog
                WHERE SalesStore.name = :silhouetteStoreFront
            ];

            String silhouetteStoreCatalog = '';
            for (WebStoreCatalog webStoreCatalog : webStoreCatalogList) {
                silhouetteStoreCatalog = webStoreCatalog.ProductCatalog.Name;
            }
            // Bug Fix BS-2233
            Set<String> vsRxCategoryIdName = new Set<String>();
            for (ProductCategoryDataTranslation productCategoryTranslationObj : [
                SELECT ParentId, Name, Parent.Name
                FROM ProductCategoryDataTranslation
                WHERE Name IN :categoriesList OR Parent.Name IN :categoriesList
            ]) {
                vsRxCategoryIdName.add(productCategoryTranslationObj.Parent.Name);
            } //Bs-2267 Added one more condition (Parent.Name IN : categoriesList)

            List<ProductCategory> categoryDetailsList = new List<ProductCategory>();
            categoryDetailsList = [
                SELECT Id, Name, ParentCategoryId, ParentCategory.Name
                FROM ProductCategory
                WHERE
                    (Name IN :vsRxCategoryIdName
                    OR Id IN :categoriesList)
                    AND Catalog.Name = :silhouetteStoreCatalog
                    AND ParentCategory.ParentCategory.Name != :B2B_Constants.COMPACT
            ]; //Bs-2267 Modified condition (Id IN :categoriesList)

            if (categoryDetailsList.isEmpty() == false) {
                String parentCategoryId;
                String parentCategoryName;
                for (ProductCategory category : categoryDetailsList) {
                    parentCategoryId = category.parentCategoryId;
                    parentCategoryName = category.ParentCategory.Name;
                }
                categoriesDataWrapper.parentCategoryId = parentCategoryId;
                categoriesDataWrapper.parentCategoryName = parentCategoryName;
                categoriesDataWrapper.childCategoriesList = categoryDetailsList;
            }
            categoriesDataWrapperList.add(categoriesDataWrapper);
            return categoriesDataWrapperList;
        } else {
            return null;
        }
    }

    /**
     * @description This method will get the products from connect API
     * BS-708
     * @author  Chirag L
     * @param   communityId   current community Id
     * @param   effectiveAccountId  account Id of a logged in User
     * @param   productIdList product ids to fetch using connect ApI
     * @return  returns connect API response
     */
    @AuraEnabled(cacheable=false)
    public static Object productsSearch(String communityId, String effectiveAccountId, List<String> productIdList) {
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);
        return commerceProxy.getProducts(webstoreId, effectiveAccountId, productIdList, null, null, false, false);
    }

    /**
     * BS-708
     * @description this method will return the wrapper containing the
     * api name, label and value for the fields of field set on Product2 object.
     */
    @AuraEnabled
    public static List<B2B_ProductDataWrapper> getProductData(Id productId) {
        List<B2B_ProductDataWrapper> productWrapperList = new List<B2B_ProductDataWrapper>();

        //Fetching the fields in field set.
        List<String> productFieldList = new List<String>();
        for (Schema.FieldSetMember fieldSetInstance : SObjectType.Product2.FieldSets.Product_Search_Card_Attributes.getFields()) {
            productFieldList.add(fieldSetInstance.getFieldPath());
        }
        String query = 'SELECT ';
        for (String fields : productFieldList) {
            query += fields + ',';
        }
        query += 'Id, Name FROM Product2 WHERE Id=\'' + productId + '\'';
        List<Product2> productList = Database.query(query);

        //Global describe call for storing the sobject data.
        Map<String, Schema.SObjectField> sObjectNameVsFieldMap = Schema.getGlobalDescribe()
            .get(B2B_Constants.PRODUCT_OBJECT_API_NAME)
            .getDescribe()
            .fields.getMap();

        String fieldLabel;
        String fieldName;

        //Storing the api name, label and value of fields in field set into a wrapper.
        for (Schema.FieldSetMember field : SObjectType.Product2.FieldSets.Product_Search_Card_Attributes.getFields()) {
            fieldName = field.getFieldPath();
            fieldLabel = sObjectNameVsFieldMap.get(fieldName).getDescribe().getLabel();
            B2B_ProductDataWrapper productWrapper = new B2B_ProductDataWrapper();
            productWrapper.fieldApiName = fieldName;
            productWrapper.fieldLabel = fieldLabel;
            productWrapper.fieldValue = productList[0].get(fieldName);
            productWrapperList.add(productWrapper);
        }
        return productWrapperList;
    }

    /**
     * @description This method is used to return requested categories details
     * BS-708
     * @author Chirag L
     * @param  categoryId   Id of category selected by user
     * @return              returns the categories data
     */
    @AuraEnabled(cacheable=true)
    public static List<ProductCategory> getCategoryDetails(String categoryId) {
        List<ProductCategory> categoryDetailsList = new List<ProductCategory>();
        if (String.isNotBlank(categoryId)) {
            categoryDetailsList = [SELECT Id, Name FROM ProductCategory WHERE Id = :categoryId];
        }
        return categoryDetailsList;
    }

    /**
     * BS-708
     * @description update HidePriceOnAccount
     * @param  hidePrices indicates if the prices should be hidden or shown
     */
    @AuraEnabled(cacheable=false)
    public static String updateHidePriceOnAccount(Boolean hidePrices) {
        User user = [SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId()];
        Account account = new Account(Id = user.AccountId, B2B_Hide_Prices__c = hidePrices);
        update account;
        return account.Id;
    }

    /**
     * BS-724
     * @description update HidePriceOnAccount
     * @param
     */
    @AuraEnabled(cacheable=false)
    public static List<Product2> getSelectedFrameRelatedRXSolutionData(Id selectedProductId) {
        Map<String, B2B_Commerce_Product_Link__c> typeVsCommerceProductLinkMap = new Map<String, B2B_Commerce_Product_Link__c>();

        //BS-2376: Added toLabel to get translated value
        List<Product2> productList = [
            SELECT
                Id,
                Name,
                toLabel(B2B_RX_Solution__c),
                B2B_Mounting_Type__c,
                B2B_Variant_Shape__c,
                B2B_Bridge_Size__c,
                B2B_Schneider_SKU__c,
                B2B_Lens_Size__c,
                B2B_Base_Curve__c,
                B2B_Color_Number__c,
                B2B_Temple_Length__c
            FROM Product2
            WHERE Id = :selectedProductId
        ];
        return productList;
    }

    /**
     * BS-724
     * @description get getRXTypesForSelectedSolution
     * @param selectedSolution : Category for which product data needs to be fetched
     * @param language : Language for which the name of category needs to considered.
     */
    @AuraEnabled(cacheable=false)
    public static List<B2B_Commerce_Product_Link__c> getRXTypesForSelectedSolution(String selectedSolution, String language, Id selectedProductId) {
        List<B2B_Commerce_Product_Link__c> selectedCategoryProductList = new List<B2B_Commerce_Product_Link__c>();
        List<ProductCategoryDataTranslation> productCategoryDataTranslationList = new List<ProductCategoryDataTranslation>();

        //Block to fetch the translated name for the category for which the B2B_Commerce_Product_Link__c  needs to be fetched.
        if (language.equalsIgnoreCase(B2B_Constants.ENGLISH_US) == false) {
            productCategoryDataTranslationList = getCategoryTranslations(language);

            for (ProductCategoryDataTranslation categoryTranslationObj : productCategoryDataTranslationList) {
                if (selectedSolution.equalsIgnoreCase(categoryTranslationObj.Name)) {
                    selectedSolution = categoryTranslationObj.Parent.Name;
                    //BS-2376: removing extra spaces from "clip - in"
                    selectedSolution = selectedSolution == B2B_Constants.CLIPIN_WITH_SPACE ? B2B_Constants.CLIPIN : selectedSolution;
                }
            }
        } else {
            selectedSolution = selectedSolution == B2B_Constants.CLIPIN_WITH_SPACE ? B2B_Constants.CLIPIN : selectedSolution;
        }

        if (String.isEmpty(selectedSolution) == false && selectedProductId != null) {
            Integer remainingQueryRowLimit = Limits.getLimitQueryRows() - Limits.getQueryRows();
            selectedCategoryProductList = [
                SELECT
                    Id,
                    Name,
                    B2B_Source_Product__c,
                    B2B_Source_Product__r.Name,
                    B2B_Target_Product__c,
                    B2B_Target_Product__r.StockKeepingUnit,
                    B2B_Target_Product__r.Description,
                    B2B_Target_Product__r.Name,
                    B2B_Type__c
                FROM B2B_Commerce_Product_Link__c
                WHERE B2B_Type__c = :selectedSolution AND B2B_Source_Product__c = :selectedProductId
                LIMIT :remainingQueryRowLimit
            ];
        }
        return selectedCategoryProductList;
    }

    /**
     * BS-898
     * @description this method will update a data into lens configurator object
     * @param fieldNameVsLensConfiguratorDataMap: this parameter will get JSON data(which is lens configurator data) which gets from frame details save and next button
     * @param lensConfiguratorId: lens configurator data id which need to update
     */
    @AuraEnabled(cacheable=false)
    public static Id updateLensConfiguratorData(Id lensConfiguratorId, Map<String, Object> fieldNameVsLensConfiguratorDataMap, String language) {
        try {
            List<ProductCategoryDataTranslation> productCategoryDataTranslationList = new List<ProductCategoryDataTranslation>();

            if (lensConfiguratorId != null) {
                B2B_Lens_Configurator__c lensConfObj = [
                    SELECT
                        Id,
                        B2B_Type__c, //BS-1483
                        B2B_RX_Solution__c,
                        B2B_RX_Type__c,
                        B2B_Selected_RX_Solution_SKU__c,
                        B2B_Lens_Type__c,
                        B2B_Lens_Index__c,
                        B2B_Selected_Lens_SKU__c,
                        B2B_Progression_Length__c,
                        B2B_Antireflection_SKU__c, //BS-1019
                        B2B_Hard_Coating_SKU__c, //BS-1019
                        B2B_Evil_Eye_Edge__c, //BS-1019
                        B2B_without_clipin__c, //BS-1093
                        B2B_Features__c,
                        B2B_Lens_Size__c,
                        B2B_Lens_Shape__c,
                        B2B_Variant_Shape__c, //BS-1157
                        B2B_Bridge__c,
                        B2B_Temple__c,
                        B2B_Salesconcept__c,
                        B2B_Base_Curve__c,
                        B2B_Schneider_SKU__c,
                        B2B_Color_Number__c,
                        B2B_Oma_Shape_Key__c,
                        //BS-727 - Start
                        B2B_Thickness_Matching_Calculator_Right__c,
                        B2B_Thickness_Matching_Calculator_Left__c,
                        B2B_Weight_Right__c,
                        B2B_Weight_Left_Lens__c,
                        B2B_Weight_Right_Lens_Adjusted__c,
                        B2B_Weight_Left_Lens_Adjusted__c,
                        B2B_Axis_Min_Right_Lens__c,
                        B2B_Axis_Min_Left_Lens__c,
                        B2B_Axis_Minimum_Right_Lens_Adjusted__c,
                        B2B_Axis_Min_Left_Lens_Adjusted__c,
                        B2B_Axis_Max_Right_Lens__c,
                        B2B_Axis_Max_Left_Lens__c,
                        B2B_Axis_Max_Right_Lens_Adjusted__c,
                        B2B_Axis_Max_Left_Lens_Adjusted__c,
                        B2B_Center_Thickness_Right_Lens__c,
                        B2B_Center_Thickness_Left_Lens__c,
                        B2B_Center_Thickness_Right_Lens_Adjusted__c,
                        B2B_Center_Thickness_Left_Lens_Adjusted__c,
                        B2B_Min_thickness_border_Right_Lens__c,
                        B2B_Min_thickness_border_Right_Adjusted__c,
                        B2B_Min_thickness_border_Lens_Adjusted__c,
                        B2B_Min_thickness_border_Left_Lens__c,
                        B2B_Max_Border_Thickness_Right_Adjusted__c,
                        B2B_Max_Border_Thickness_Left_Adjusted__c,
                        B2B_Max_Border_Thickess_Right_Lens__c,
                        B2B_Max_Border_Thickess_Left_Lens__c,
                        B2B_Right_Lens_Image_SRC__c,
                        B2B_Left_Lens_Image_SRC__c,
                        //BS-727 - End
                        B2B_Selected_Frame__c, //BS-1121
                        B2B_Lens_Color__c, //BS-1334
                        B2B_Lenses_without_Adapter__c, //BS-1340
                        B2B_Selected_RX_Solution_Color__c,
                        B2B_Final_PreCalcGuid__c, //BS-1439
                        B2B_Antireflection_Product__c, //BS-1522
                        B2B_Hard_Coating_Product__c, //BS-1522
                        B2B_Lens_Color_Id__c, //BS-1466 Start
                        B2B_Lens_Distance__c,
                        B2B_Lens_Edge__c,
                        B2B_Glazing_Type__c,
                        B2B_Visual_Preference__c,
                        B2B_Photo_Sensation__c,
                        B2B_Blue_Sensation__c,
                        B2B_BlankCoatingSKU__c,
                        B2B_GlassProductSKU__c,
                        Lens_Product__c,
                        B2B_Lens_Material__c, //BS-1466 End
                        B2B_Vision_Zone_Analysis_Code__c, //BS-967
                        B2B_Vision_Zone_Analysis_Result__c, //BS-1612
                        B2B_Original_Vision_Zone_Analysis__c //BS-1612
                    FROM B2B_Lens_Configurator__c
                    WHERE Id = :lensConfiguratorId
                ];
                if (fieldNameVsLensConfiguratorDataMap.isEmpty() == false) {
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
                                SELECT Id, B2B_Salesconcept_unique__c, B2B_Color_Number__c
                                FROM Product2
                                WHERE StockKeepingUnit = :String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                LIMIT 1
                            ];
                            if (selectedFrameProductDetailsList.isEmpty() == false) {
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

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.RX_SOLUTION)) {
                        String selectedRXSolution = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.RX_SOLUTION);
                        //Block to fetch the translated name for the category for which the ProductCategoryProduct needs to be fetched.
                        if (language.equalsIgnoreCase(B2B_Constants.EN_US) == false) {
                            productCategoryDataTranslationList = getCategoryTranslations(language);

                            for (ProductCategoryDataTranslation categoryTranslationObj : productCategoryDataTranslationList) {
                                if (selectedRXSolution.equalsIgnoreCase(categoryTranslationObj.Name)) {
                                    selectedRXSolution = categoryTranslationObj.Parent.Name;
                                }
                            }
                        }

                        lensConfObj.B2B_RX_Solution__c = selectedRXSolution;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.RX_TYPE)) {
                        lensConfObj.B2B_RX_Type__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.RX_TYPE);
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY)) {
                        lensConfObj.B2B_Selected_RX_Solution_SKU__c = (String) fieldNameVsLensConfiguratorDataMap.get(
                            B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY
                        );
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_RX_SOLUTION_SKU)) {
                        lensConfObj.B2B_Selected_RX_Solution_SKU__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU);
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_RX_TYPE_COLOR)) {
                        lensConfObj.B2B_Selected_RX_Solution_Color__c = String.valueOf(
                            fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_TYPE_COLOR)
                        );
                    }
                    //BS-1093 Storing without clip in checkbox value
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.WITHOUT_CLIPIN)) {
                        lensConfObj.B2B_without_clipin__c = (Boolean) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WITHOUT_CLIPIN);
                    }

                    if (
                        fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.WITHOUT_ADAPTER) &&
                        (String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WITHOUT_ADAPTER)).equalsIgnoreCase(B2B_Constants.TRUE_VALUE) ||
                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WITHOUT_ADAPTER)).equalsIgnoreCase(B2B_Constants.FALSE_VALUE))
                    ) {
                        lensConfObj.B2B_Lenses_without_Adapter__c = Boolean.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WITHOUT_ADAPTER));
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.ACCOUNTID)) {
                        lensConfObj.B2B_Account__c = String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ACCOUNTID));
                    }

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

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.ORDER_TYPE)) {
                        lensConfObj.B2B_Order_Type__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ORDER_TYPE);
                        if (B2B_Constants.LENS_ONLY.equalsIgnoreCase((String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ORDER_TYPE))) {
                            lensConfObj.B2B_LensHandling_SKU__c = System.Label.B2B_LENS_ONLY_LHA_SKU;
                        } else if (
                            B2B_Constants.LENS_ONLY_FRAME_PROVIDED.equalsIgnoreCase((String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ORDER_TYPE))
                        ) {
                            lensConfObj.B2B_LensHandling_SKU__c = System.Label.B2B_LENS_ONLY_FRAME_PROVIDED_LHA_SKU;
                        } else {
                            lensConfObj.B2B_LensHandling_SKU__c = '';
                        }
                    }
                    //Updated as part of BS-1121 glazed to un-glazed
                    if (
                        fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_FRAME_SKU) &&
                        fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.RX_SOLUTION) &&
                        (String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.RX_SOLUTION)).equalsIgnoreCase(B2B_Constants.CLIPIN) ||
                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.RX_SOLUTION)).equalsIgnoreCase(B2B_Constants.CLIPIN_WITH_SPACE)) &&
                        //BS-1651  : Added checks for VS/RX
                        String.isNotBlank(lensConfObj.B2B_Type__c) &&
                        String.valueOf(lensConfObj.B2B_Type__c).equalsIgnoreCase(B2B_Constants.RX_GLAZING) //BS-1651 : End
                    ) {
                        lensConfObj.B2B_Selected_Frame__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU);
                    } else if (
                        fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_FRAME_SKU) &&
                        fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.RX_SOLUTION) &&
                        (String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.RX_SOLUTION)).equalsIgnoreCase(B2B_Constants.CLIPIN) == false &&
                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.RX_SOLUTION)).equalsIgnoreCase(B2B_Constants.CLIPIN_WITH_SPACE) ==
                        false) &&
                        //BS-1651 : Added checks for VS/RX
                        String.isNotBlank(lensConfObj.B2B_Type__c) &&
                        String.valueOf(lensConfObj.B2B_Type__c).equalsIgnoreCase(B2B_Constants.RX_GLAZING) //BS-1651 : End
                    ) {
                        List<Product2> frameProductList = [
                            SELECT Id
                            FROM Product2
                            WHERE StockKeepingUnit = :(String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)
                        ];
                        List<B2B_Commerce_Product_Link__c> commerceProductLinkList = frameProductList.isEmpty() == false
                            ? [
                                  SELECT Id, B2B_Source_Product__c, B2B_Target_Product__c, B2B_Type__c, B2B_Target_Product__r.StockKeepingUnit
                                  FROM B2B_Commerce_Product_Link__c
                                  WHERE B2B_Type__c = :B2B_Constants.GLAZED_TO_UNGLAZED AND B2B_Source_Product__c = :frameProductList[0].Id
                              ]
                            : null;
                        lensConfObj.B2B_Selected_Frame__c = commerceProductLinkList.isEmpty() == false
                            ? commerceProductLinkList[0].B2B_Target_Product__r.StockKeepingUnit
                            : (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU);
                    } else if (
                        //BS-1651 : Added checks for VS/RX
                        String.isNotBlank(lensConfObj.B2B_Type__c) &&
                        String.valueOf(lensConfObj.B2B_Type__c).equalsIgnoreCase(B2B_Constants.VISION_SENSATION) &&
                        //BS-1651 : End
                        fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_FRAME_SKU)
                    ) {
                        //BS-1494
                        lensConfObj.B2B_Selected_Frame__c = String.isNotBlank(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                            )
                            ? (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)
                            : null;
                    }
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.BRIDGE_SIZE)) {
                        lensConfObj.B2B_Bridge__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BRIDGE_SIZE);
                    }
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.TEMPLE_LENGTH)) {
                        lensConfObj.B2B_Temple__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.TEMPLE_LENGTH);
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.STATUS)) {
                        lensConfObj.B2B_Status__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.STATUS);
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.LENS_TYPE)) {
                        lensConfObj.B2B_Lens_Type__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_TYPE);
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.LENS_INDEX)) {
                        lensConfObj.B2B_Lens_Index__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_INDEX);
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.LENS_COLOR)) {
                        lensConfObj.B2B_Lens_Color__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_COLOR);
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.LENS_SKU)) {
                        lensConfObj.B2B_Selected_Lens_SKU__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU);
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.PROGRESSION_LENGTH_LENS)) {
                        if (fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.PROGRESSION_LENGTH_LENS) != null) {
                            // Replace any commas with periods to standardize the decimal separator

                            String value = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.PROGRESSION_LENGTH_LENS);

                            lensConfObj.B2B_Progression_Length__c = Decimal.valueOf(value.replace(',', '.'));
                        } else {
                            lensConfObj.B2B_Progression_Length__c = null;
                        }
                    }

                    //BS-1019 Start

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.ANTIRELECTION_SKU)) {
                        lensConfObj.B2B_Antireflection_SKU__c = String.isNotBlank(
                                (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ANTIRELECTION_SKU)
                            )
                            ? ((String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ANTIRELECTION_SKU))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.HARDCOATING_SKU)) {
                        lensConfObj.B2B_Hard_Coating_SKU__c = String.isNotBlank((String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.HARDCOATING_SKU))
                            ? ((String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.HARDCOATING_SKU))
                            : null;
                    }

                    //BS-1522 -Start
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.ANTIREFLECTION_PRODUCT)) {
                        lensConfObj.B2B_Antireflection_Product__c = String.isNotBlank(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ANTIREFLECTION_PRODUCT))
                            )
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ANTIREFLECTION_PRODUCT))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.HARDCOATING_PRODUCT)) {
                        lensConfObj.B2B_Hard_Coating_Product__c = String.isNotBlank(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.HARDCOATING_PRODUCT))
                            )
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.HARDCOATING_PRODUCT))
                            : null;
                    }
                    //BS-1522 -End

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.WITH_EVIL_EYE_EDGE)) {
                        lensConfObj.B2B_Evil_Eye_Edge__c = Boolean.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WITH_EVIL_EYE_EDGE)) != null
                            ? Boolean.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WITH_EVIL_EYE_EDGE))
                            : false;
                    }
                    //BS-1466 Start
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.PHOTO_SENSATION_ID)) {
                        lensConfObj.B2B_Photo_Sensation__c = String.isNotBlank(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.PHOTO_SENSATION_ID))
                            )
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.PHOTO_SENSATION_ID))
                            : null;
                    }
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.FACET_CUT_VALUE)) {
                        lensConfObj.B2B_Optimized_Facet_Cut__c = (Boolean) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.FACET_CUT_VALUE)
                            ? (Boolean) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.FACET_CUT_VALUE)
                            : false;
                    }
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.S_GRAVING_VALUE)) {
                        lensConfObj.B2B_S_Graving__c = (Boolean) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.S_GRAVING_VALUE)
                            ? (Boolean) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.S_GRAVING_VALUE)
                            : false;
                    } //BS-1796
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.LENS_COLOR_ID)) {
                        lensConfObj.B2B_Lens_Color_Id__c = String.isNotBlank(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_COLOR_ID))
                            )
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_COLOR_ID))
                            : null;
                    }
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.BLUE_SENSATION_ID)) {
                        lensConfObj.B2B_Blue_Sensation__c = String.isNotBlank(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BLUE_SENSATION_ID))
                            )
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BLUE_SENSATION_ID))
                            : null;
                    }
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.LENS_DISTANCE)) {
                        lensConfObj.B2B_Lens_Distance__c = String.isNotBlank(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_DISTANCE))
                            )
                            ? Decimal.valueOf((String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_DISTANCE))
                            : null;
                    }
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.VISUAL_PREFERENCES)) {
                        lensConfObj.B2B_Visual_Preference__c = String.isNotBlank(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.VISUAL_PREFERENCES))
                            )
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.VISUAL_PREFERENCES))
                            : null;
                    }
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.LENS_EDGE)) {
                        lensConfObj.B2B_Lens_Edge__c = String.isNotBlank(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_EDGE)))
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_EDGE))
                            : null;
                    }
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.GLAZING)) {
                        lensConfObj.B2B_Glazing_Type__c = String.isNotBlank(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.GLAZING)))
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.GLAZING))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.GLASS_PRODUCT)) {
                        lensConfObj.B2B_GlassProductSKU__c = String.isNotBlank(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.GLASS_PRODUCT))
                            )
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.GLASS_PRODUCT))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.BLANK_COATING)) {
                        lensConfObj.B2B_BlankCoatingSKU__c = String.isNotBlank(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BLANK_COATING))
                            )
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BLANK_COATING))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.LENS_PRODUCT_ID)) {
                        lensConfObj.Lens_Product__c = String.isNotBlank(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_PRODUCT_ID)))
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_PRODUCT_ID))
                            : null;
                    }

                    if (
                        String.isNotBlank(lensConfObj.B2B_Type__c) &&
                        String.valueOf(lensConfObj.B2B_Type__c).equalsIgnoreCase(B2B_Constants.RX_GLAZING) == false &&
                        fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.ANTIREFLECTION_ID)
                    ) {
                        lensConfObj.B2B_Antireflection_Product__c = String.isNotBlank(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ANTIREFLECTION_ID))
                            )
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ANTIREFLECTION_ID))
                            : null;
                        //BS-974
                        if (lensConfObj.B2B_Antireflection_Product__c != null) {
                            List<Product2> productList = [SELECT Id, B2B_Schneider_SKU__c FROM Product2 WHERE Id = :lensConfObj.B2B_Antireflection_Product__c];
                            if (productList.isEmpty() == false) {
                                lensConfObj.B2B_Antireflection_SKU__c = String.isNotBlank(productList[0].B2B_Schneider_SKU__c)
                                    ? productList[0].B2B_Schneider_SKU__c
                                    : null;
                            }
                        }
                        //BS-974
                    }
                    //BS-974
                    if (
                        fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.APPLICABLE_BRAND) &&
                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.APPLICABLE_BRAND))
                            .equalsIgnoreCase(B2B_Constants.VISION_SENSATION) &&
                        fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.LENS_SKU) &&
                        fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU) != null
                    ) {
                        List<Product2> selectedFrameProductDetailsList = [
                            SELECT Id, B2B_Base_Curve__c
                            FROM Product2
                            WHERE StockKeepingUnit = :String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU))
                            LIMIT 1
                        ];
                        if (selectedFrameProductDetailsList.isEmpty() == false) {
                            lensConfObj.B2B_Base_Curve__c = String.isNotBlank(selectedFrameProductDetailsList[0].B2B_Base_Curve__c)
                                ? selectedFrameProductDetailsList[0].B2B_Base_Curve__c
                                : null;
                        }
                    }
                    //BS-974

                    if (
                        String.isNotBlank(lensConfObj.B2B_Type__c) &&
                        String.valueOf(lensConfObj.B2B_Type__c).equalsIgnoreCase(B2B_Constants.RX_GLAZING) == false &&
                        fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.HARD_COATING_ID)
                    ) {
                        lensConfObj.B2B_Hard_Coating_Product__c = String.isNotBlank(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.HARD_COATING_ID))
                            )
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.HARD_COATING_ID))
                            : null;
                        //BS-974
                        if (lensConfObj.B2B_Hard_Coating_Product__c != null) {
                            List<Product2> productList = [SELECT Id, B2B_Schneider_SKU__c FROM Product2 WHERE Id = :lensConfObj.B2B_Hard_Coating_Product__c];
                            if (productList.isEmpty() == false) {
                                lensConfObj.B2B_Hard_Coating_SKU__c = String.isNotBlank(productList[0].B2B_Schneider_SKU__c)
                                    ? productList[0].B2B_Schneider_SKU__c
                                    : null;
                            }
                        }
                        //BS-974
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.PRODUCT_MATERIAL)) {
                        lensConfObj.B2B_Lens_Material__c = String.isNotBlank(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.PRODUCT_MATERIAL))
                            )
                            ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.PRODUCT_MATERIAL))
                            : null;
                    }
                    //BS-1466 End

                    //BS-974
                    // RetailerId (ARIS Account Id)
                    if (
                        fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.ACCOUNTID) &&
                        String.isNotBlank((String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ACCOUNTID))))
                    ) {
                        String applicableAccountId = (String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ACCOUNTID)));
                        Map<Id, Account> accountIdVSAccountMap = new Map<Id, Account>();
                        for (Account account : [SELECT Id, Name, k_ARIS_Account_ID__c FROM Account WHERE Id = :applicableAccountId]) {
                            accountIdVSAccountMap.put(account.Id, account);
                        }
                        lensConfObj.B2B_ARIS_Account_Id__c = accountIdVSAccountMap.containsKey(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ACCOUNTID))
                            )
                            ? accountIdVSAccountMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ACCOUNTID))).k_ARIS_Account_ID__c
                            : null;
                    }
                    //BS-974

                    //BS-898 - Start
                    if (
                        fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_RX_SOLUTION) &&
                        fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION) != null
                    ) {
                        String productSKU = null;
                        String selectedRXSolution = null;
                        Set<String> productSKUSet = new Set<String>();

                        // BS-1202 : Refer BS-1202 for the scenarios
                        if (
                            String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION))
                                .equalsIgnoreCase(B2B_Constants.DIRECT_GLAZING) &&
                            fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_FRAME_SKU)
                        ) {
                            productSKUSet.add(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)));
                        } else if (
                            (String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION))
                                .equalsIgnoreCase(B2B_Constants.CLIPIN_WITH_SPACE) &&
                            fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY)) ||
                            (String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION))
                                .equalsIgnoreCase(B2B_Constants.ADAPTER) &&
                            fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                        ) {
                            productSKUSet.add(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)));
                            productSKUSet.add(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY)));
                        }

                        if (
                            fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.LENS_SKU) &&
                            String.isNotBlank(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU)))
                        ) {
                            productSKUSet.add(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU)));
                        }

                        Map<String, Product2> stockKeepingUnitVsProductMap = new Map<String, Product2>();

                        if (productSKUSet.isEmpty() == false) {
                            List<Product2> productDetailsList = [
                                SELECT
                                    Id,
                                    B2B_Model__c,
                                    B2B_EE_Size__c,
                                    StockKeepingUnit,
                                    B2B_Variant_Shape__c,
                                    B2B_Bridge_Size__c,
                                    B2B_Temple_Length__c,
                                    B2B_Salesconcept_unique__c,
                                    B2B_Base_Curve__c,
                                    B2B_Schneider_SKU__c,
                                    B2B_Color_Number__c,
                                    Description,
                                    B2B_Material__c,
                                    B2B_Picture_Link__c
                                FROM Product2
                                WHERE StockKeepingUnit IN :productSKUSet
                            ];
                            for (Product2 product : productDetailsList) {
                                stockKeepingUnitVsProductMap.put(product.StockKeepingUnit, product);
                            }

                            String modelSource = null;
                            String sizingSource = null;
                            String shapeSource = null;
                            String bridgeSizeSourceSKU = null;
                            String shapeIdSourceSKU = null;
                            String baseCurveSourceSKU = null;

                            if (
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION))
                                    .equalsIgnoreCase(B2B_Constants.DIRECT_GLAZING) &&
                                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY)
                            ) {
                                modelSource = stockKeepingUnitVsProductMap.containsKey(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                    )
                                    ? stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)))
                                          .B2B_Model__c
                                    : null;
                                sizingSource = stockKeepingUnitVsProductMap.containsKey(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                    )
                                    ? stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)))
                                          .B2B_EE_Size__c
                                    : null;
                                shapeSource = stockKeepingUnitVsProductMap.containsKey(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                    )
                                    ? stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)))
                                          .B2B_Model__c
                                    : null;
                                bridgeSizeSourceSKU = String.isNotBlank(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                    )
                                    ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                    : null;
                                shapeIdSourceSKU = String.isNotBlank(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)))
                                    ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                    : null;
                                baseCurveSourceSKU = String.isNotBlank(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)))
                                    ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                    : null;
                            } else if (
                                (String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION))
                                    .equalsIgnoreCase(B2B_Constants.CLIPIN_WITH_SPACE) &&
                                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY) &&
                                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_FRAME_SKU)) ||
                                (String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION))
                                    .equalsIgnoreCase(B2B_Constants.ADAPTER) &&
                                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY) &&
                                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_FRAME_SKU))
                            ) {
                                modelSource = stockKeepingUnitVsProductMap.containsKey(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                    )
                                    ? stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)))
                                          .B2B_Model__c
                                    : null;
                                sizingSource = stockKeepingUnitVsProductMap.containsKey(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                    )
                                    ? stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)))
                                          .B2B_EE_Size__c
                                    : null;
                                shapeSource = stockKeepingUnitVsProductMap.containsKey(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                                    )
                                    ? stockKeepingUnitVsProductMap.get(
                                              String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                                          )
                                          .B2B_Model__c
                                    : null;
                                bridgeSizeSourceSKU = String.isNotBlank(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                                    )
                                    ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                                    : null;
                                shapeIdSourceSKU = String.isNotBlank(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                                    )
                                    ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                                    : null;
                                baseCurveSourceSKU = String.isNotBlank(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                                    )
                                    ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                                    : null;
                            }

                            //BS-1483 : Modified the condition in order to execute below block only for RX
                            if (
                                String.isNotBlank(lensConfObj.B2B_Type__c) &&
                                lensConfObj.B2B_Type__c.equalsIgnoreCase(B2B_Constants.RX_GLAZING) &&
                                String.isNotBlank(modelSource) &&
                                String.isNotBlank(sizingSource) &&
                                String.isNotBlank(shapeSource)
                            ) {
                                List<B2B_Lens_Shapes__c> lensShapeDetailsList = [
                                    SELECT Id, B2B_Size__c, B2B_Mounting_Type__c, B2B_OMAShapeKey__c
                                    FROM B2B_Lens_Shapes__c
                                    WHERE B2B_Model__c = :modelSource AND B2B_Shape_Name__c = :shapeSource AND B2B_EE_Size__c = :sizingSource
                                ];

                                // Features, Lens Size, Oma Shape Key
                                if (lensShapeDetailsList.isEmpty() == false) {
                                    lensConfObj.B2B_Features__c = String.isNotBlank(lensShapeDetailsList[0].B2B_Mounting_Type__c)
                                        ? lensShapeDetailsList[0].B2B_Mounting_Type__c
                                        : null;
                                    lensConfObj.B2B_Lens_Size__c = String.isNotBlank(lensShapeDetailsList[0].B2B_Size__c)
                                        ? Double.valueOf(lensShapeDetailsList[0].B2B_Size__c)
                                        : 0.0;
                                    lensConfObj.B2B_Oma_Shape_Key__c = String.isNotBlank(lensShapeDetailsList[0].B2B_OMAShapeKey__c)
                                        ? lensShapeDetailsList[0].B2B_OMAShapeKey__c
                                        : null;
                                }
                            }

                            // shapeID
                            //BS-1157 : Changed Lens Shape to Varient Shape
                            lensConfObj.B2B_Variant_Shape__c = stockKeepingUnitVsProductMap.containsKey(shapeIdSourceSKU) &&
                                String.isNotBlank(String.valueOf(stockKeepingUnitVsProductMap.get(shapeIdSourceSKU).B2B_Variant_Shape__c))
                                ? String.valueOf(stockKeepingUnitVsProductMap.get(shapeIdSourceSKU).B2B_Variant_Shape__c)
                                : null;

                            //BridgeSize
                            lensConfObj.B2B_Bridge__c = stockKeepingUnitVsProductMap.containsKey(bridgeSizeSourceSKU) &&
                                String.isNotBlank(String.valueOf(stockKeepingUnitVsProductMap.get(bridgeSizeSourceSKU).B2B_Bridge_Size__c))
                                ? String.valueOf(stockKeepingUnitVsProductMap.get(bridgeSizeSourceSKU).B2B_Bridge_Size__c)
                                : null;

                            //lensBase
                            lensConfObj.B2B_Base_Curve__c = stockKeepingUnitVsProductMap.containsKey(baseCurveSourceSKU) &&
                                String.isNotBlank(String.valueOf(stockKeepingUnitVsProductMap.get(baseCurveSourceSKU).B2B_Base_Curve__c))
                                ? String.valueOf(stockKeepingUnitVsProductMap.get(baseCurveSourceSKU).B2B_Base_Curve__c)
                                : null;

                            // TempleLength
                            if (
                                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_FRAME_SKU) &&
                                stockKeepingUnitVsProductMap.containsKey(
                                    String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                )
                            ) {
                                lensConfObj.B2B_Temple__c = stockKeepingUnitVsProductMap.containsKey(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                    ) &&
                                    stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)))
                                        .B2B_Temple_Length__c != null
                                    ? stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)))
                                          .B2B_Temple_Length__c
                                    : null;
                            }

                            // salesconcept
                            if (
                                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_FRAME_SKU) &&
                                stockKeepingUnitVsProductMap.containsKey(
                                    String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                )
                            ) {
                                lensConfObj.B2B_Salesconcept__c = stockKeepingUnitVsProductMap.containsKey(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                    ) &&
                                    stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)))
                                        .B2B_Salesconcept_unique__c != null
                                    ? stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)))
                                          .B2B_Salesconcept_unique__c
                                    : null;
                            }

                            // glassProduct
                            if (
                                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.LENS_SKU) &&
                                stockKeepingUnitVsProductMap.containsKey(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU)))
                            ) {
                                lensConfObj.B2B_Schneider_SKU__c = stockKeepingUnitVsProductMap.containsKey(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU))
                                    ) &&
                                    stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU)))
                                        .B2B_Schneider_SKU__c != null
                                    ? stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU)))
                                          .B2B_Schneider_SKU__c
                                    : null;
                            }

                            // Color Number
                            if (
                                fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.SELECTED_FRAME_SKU) &&
                                stockKeepingUnitVsProductMap.containsKey(
                                    String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                )
                            ) {
                                lensConfObj.B2B_Color_Number__c = stockKeepingUnitVsProductMap.containsKey(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU))
                                    ) &&
                                    stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)))
                                        .B2B_Color_Number__c != null
                                    ? stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_FRAME_SKU)))
                                          .B2B_Color_Number__c
                                    : null;
                            }
                        }
                        //BS-1302 : Populating fields to use on order details.
                        if (
                            stockKeepingUnitVsProductMap.containsKey(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                            )
                        ) {
                            lensConfObj.B2B_RX_Solution_Description__c = stockKeepingUnitVsProductMap.get(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                                    )
                                    .Description != null
                                ? stockKeepingUnitVsProductMap.get(
                                          String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                                      )
                                      .Description
                                : null;
                        }

                        if (stockKeepingUnitVsProductMap.containsKey(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU)))) {
                            lensConfObj.B2B_Lens_Material__c = stockKeepingUnitVsProductMap.get(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU))
                                    )
                                    .B2B_Material__c != null
                                ? stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU)))
                                      .B2B_Material__c
                                : null;
                        }

                        //BS-1270 start
                        if (
                            stockKeepingUnitVsProductMap.containsKey(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU))) &&
                            String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION))
                                .equalsIgnoreCase(B2B_Constants.DIRECT_GLAZING)
                        ) {
                            lensConfObj.B2B_Lens_Picture_Link__c = stockKeepingUnitVsProductMap.get(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU))
                                    )
                                    .B2B_Picture_Link__c != null
                                ? stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU)))
                                      .B2B_Picture_Link__c
                                : null;
                        }

                        if (
                            stockKeepingUnitVsProductMap.containsKey(
                                String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                            ) &&
                            stockKeepingUnitVsProductMap.containsKey(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU))) &&
                            (String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION)).equalsIgnoreCase(B2B_Constants.ADAPTER))
                        ) {
                            lensConfObj.B2B_Lens_Picture_Link__c = stockKeepingUnitVsProductMap.get(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU))
                                    )
                                    .B2B_Picture_Link__c != null
                                ? stockKeepingUnitVsProductMap.get(String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LENS_SKU)))
                                      .B2B_Picture_Link__c
                                : null;

                            lensConfObj.B2B_RX_Picture_Link__c = stockKeepingUnitVsProductMap.get(
                                        String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                                    )
                                    .B2B_Picture_Link__c != null
                                ? stockKeepingUnitVsProductMap.get(
                                          String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY))
                                      )
                                      .B2B_Picture_Link__c
                                : null;
                        }
                        //BS-1270 end
                    }

                    //BS-727 : Saving Thickness Matching Calculator Values entered by user on UI into Lens Configurator - Start
                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.THICKNESS_VALUE_LEFT)) {
                        lensConfObj.B2B_Thickness_Matching_Calculator_Left__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.THICKNESS_VALUE_LEFT) !=
                            null
                            ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.THICKNESS_VALUE_LEFT))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.THICKNESS_VALUE_RIGHT)) {
                        lensConfObj.B2B_Thickness_Matching_Calculator_Right__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.THICKNESS_VALUE_RIGHT) !=
                            null
                            ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.THICKNESS_VALUE_RIGHT))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.WEIGHT_LEFT_LENS)) {
                        lensConfObj.B2B_Weight_Left_Lens__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WEIGHT_LEFT_LENS) != null
                            ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WEIGHT_LEFT_LENS))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.WEIGHT_RIGHT_LENS)) {
                        lensConfObj.B2B_Weight_Right__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WEIGHT_RIGHT_LENS) != null
                            ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WEIGHT_RIGHT_LENS))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.WEIGHT_LEFT_LENS_ADJUSTED)) {
                        lensConfObj.B2B_Weight_Left_Lens_Adjusted__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WEIGHT_LEFT_LENS_ADJUSTED) != null
                            ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WEIGHT_LEFT_LENS_ADJUSTED))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.WEIGHT_RIGHT_LENS_ADJUSTED)) {
                        lensConfObj.B2B_Weight_Right_Lens_Adjusted__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WEIGHT_RIGHT_LENS_ADJUSTED) != null
                            ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.WEIGHT_RIGHT_LENS_ADJUSTED))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.AXIS_MIN_LEFT_LENS)) {
                        lensConfObj.B2B_Axis_Min_Left_Lens__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MIN_LEFT_LENS) != null
                            ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MIN_LEFT_LENS))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.AXIS_MIN_RIGHT_LENS)) {
                        lensConfObj.B2B_Axis_Min_Right_Lens__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MIN_RIGHT_LENS) != null
                            ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MIN_RIGHT_LENS))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.AXIS_MIN_LEFT_LENS_ADJUSTED)) {
                        lensConfObj.B2B_Axis_Min_Left_Lens_Adjusted__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MIN_LEFT_LENS_ADJUSTED) !=
                            null
                            ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MIN_LEFT_LENS_ADJUSTED))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.AXIS_MIN_RIGHT_LENS_ADJUSTED)) {
                        lensConfObj.B2B_Axis_Minimum_Right_Lens_Adjusted__c = fieldNameVsLensConfiguratorDataMap.get(
                                B2B_Constants.AXIS_MIN_RIGHT_LENS_ADJUSTED
                            ) != null
                            ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MIN_RIGHT_LENS_ADJUSTED))
                            : null;
                    }

                    if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.AXIS_MAX_LEFT_LENS)) {
                        lensConfObj.B2B_Axis_Max_Left_Lens__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MAX_LEFT_LENS) != null
                            ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MAX_LEFT_LENS))
                            : null;
                    }
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.AXIS_MAX_RIGHT_LENS)) {
                    lensConfObj.B2B_Axis_Max_Right_Lens__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MAX_RIGHT_LENS) != null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MAX_RIGHT_LENS))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.AXIS_MAX_LEFT_LENS_ADJUSTED)) {
                    lensConfObj.B2B_Axis_Max_Left_Lens_Adjusted__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MAX_LEFT_LENS_ADJUSTED) != null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MAX_LEFT_LENS_ADJUSTED))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.AXIS_MAX_RIGHT_LENS_ADJUSTED)) {
                    lensConfObj.B2B_Axis_Max_Right_Lens_Adjusted__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MAX_RIGHT_LENS_ADJUSTED) != null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.AXIS_MAX_RIGHT_LENS_ADJUSTED))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.CENTER_THICKNESS_LEFT_LENS)) {
                    lensConfObj.B2B_Center_Thickness_Left_Lens__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.CENTER_THICKNESS_LEFT_LENS) != null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.CENTER_THICKNESS_LEFT_LENS))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.CENTER_THICKNESS_RIGHT_LENS)) {
                    lensConfObj.B2B_Center_Thickness_Right_Lens__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.CENTER_THICKNESS_RIGHT_LENS) != null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.CENTER_THICKNESS_RIGHT_LENS))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.CENTER_THICKNESS_LEFT_LENS_ADJUSTED)) {
                    lensConfObj.B2B_Center_Thickness_Left_Lens_Adjusted__c = fieldNameVsLensConfiguratorDataMap.get(
                            B2B_Constants.CENTER_THICKNESS_LEFT_LENS_ADJUSTED
                        ) != null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.CENTER_THICKNESS_LEFT_LENS))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.CENTER_THICKNESS_RIGHT_LENS_ADJUSTED)) {
                    lensConfObj.B2B_Center_Thickness_Right_Lens_Adjusted__c = fieldNameVsLensConfiguratorDataMap.get(
                            B2B_Constants.CENTER_THICKNESS_RIGHT_LENS_ADJUSTED
                        ) != null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.CENTER_THICKNESS_RIGHT_LENS_ADJUSTED))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.BORDER_MAX_THICKNESS_LEFT_LENS)) {
                    lensConfObj.B2B_Max_Border_Thickess_Left_Lens__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BORDER_MAX_THICKNESS_LEFT_LENS) !=
                        null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BORDER_MAX_THICKNESS_LEFT_LENS))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.BORDER_MAX_THICKNESS_RIGHT_LENS)) {
                    lensConfObj.B2B_Max_Border_Thickess_Right_Lens__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BORDER_MAX_THICKNESS_RIGHT_LENS) !=
                        null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BORDER_MAX_THICKNESS_RIGHT_LENS))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.BORDER_MAX_THICKNESS_LEFT_LENS_ADJUSTED)) {
                    lensConfObj.B2B_Max_Border_Thickness_Left_Adjusted__c = fieldNameVsLensConfiguratorDataMap.get(
                            B2B_Constants.BORDER_MAX_THICKNESS_LEFT_LENS_ADJUSTED
                        ) != null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BORDER_MAX_THICKNESS_LEFT_LENS_ADJUSTED))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.BORDER_MAX_THICKNESS_RIGHT_LENS_ADJUSTED)) {
                    lensConfObj.B2B_Max_Border_Thickness_Right_Adjusted__c = fieldNameVsLensConfiguratorDataMap.get(
                            B2B_Constants.BORDER_MAX_THICKNESS_RIGHT_LENS_ADJUSTED
                        ) != null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BORDER_MAX_THICKNESS_RIGHT_LENS_ADJUSTED))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.BORDER_MIN_THICKNESS_LEFT_LENS)) {
                    lensConfObj.B2B_Min_thickness_border_Left_Lens__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BORDER_MIN_THICKNESS_LEFT_LENS) !=
                        null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BORDER_MIN_THICKNESS_LEFT_LENS))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.BORDER_MIN_THICKNESS_RIGHT_LENS)) {
                    lensConfObj.B2B_Min_thickness_border_Right_Lens__c = fieldNameVsLensConfiguratorDataMap.get(
                            B2B_Constants.BORDER_MIN_THICKNESS_RIGHT_LENS
                        ) != null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BORDER_MIN_THICKNESS_RIGHT_LENS))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.BORDER_MIN_THICKNESS_LEFT_LENS_ADJUSTED)) {
                    lensConfObj.B2B_Min_thickness_border_Lens_Adjusted__c = fieldNameVsLensConfiguratorDataMap.get(
                            B2B_Constants.BORDER_MIN_THICKNESS_LEFT_LENS_ADJUSTED
                        ) != null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BORDER_MAX_THICKNESS_LEFT_LENS_ADJUSTED))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.BORDER_MIN_THICKNESS_RIGHT_LENS_ADJUSTED)) {
                    lensConfObj.B2B_Min_thickness_border_Right_Adjusted__c = fieldNameVsLensConfiguratorDataMap.get(
                            B2B_Constants.BORDER_MIN_THICKNESS_RIGHT_LENS_ADJUSTED
                        ) != null
                        ? Double.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.BORDER_MAX_THICKNESS_RIGHT_LENS_ADJUSTED))
                        : null;
                }
                //BS-1439
                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.PRECALCGUID)) {
                    lensConfObj.B2B_Final_PreCalcGuid__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.PRECALCGUID) != null
                        ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.PRECALCGUID))
                        : null;
                }

                String leftImage;
                String rightImage;
                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.LEFT_IMAGE_SRC_TO_BE_SAVED)) {
                    lensConfObj.B2B_Left_Lens_Image_SRC__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LEFT_IMAGE_SRC_TO_BE_SAVED) != null
                        ? B2B_Constants.BASE64_IMAGE_ENCODING_FORMAT +
                          ',' +
                          String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LEFT_IMAGE_SRC_TO_BE_SAVED))
                        : null;
                    leftImage = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LEFT_IMAGE_SRC_TO_BE_SAVED) != null
                        ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.LEFT_IMAGE_SRC_TO_BE_SAVED))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.RIGHT_IMAGE_SRC_TO_BE_SAVED)) {
                    lensConfObj.B2B_Right_Lens_Image_SRC__c = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.RIGHT_IMAGE_SRC_TO_BE_SAVED) != null
                        ? B2B_Constants.BASE64_IMAGE_ENCODING_FORMAT +
                          ',' +
                          String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.RIGHT_IMAGE_SRC_TO_BE_SAVED))
                        : null;
                    rightImage = fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.RIGHT_IMAGE_SRC_TO_BE_SAVED) != null
                        ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.RIGHT_IMAGE_SRC_TO_BE_SAVED))
                        : null;
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.FRAME_COLOR_DESCRIPTION)) {
                    lensConfObj.B2B_Frame_Color_Description__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.FRAME_COLOR_DESCRIPTION);
                }

                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.FRAME_COLOR)) {
                    lensConfObj.B2B_Frame_Color__c = (String) fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.FRAME_COLOR);
                }
                /* Start : BS-967 */
                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.VISION_ZONE_ANALYSIS_ID)) {
                    lensConfObj.B2B_Vision_Zone_Analysis_Code__c = String.isNotBlank(
                            String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.VISION_ZONE_ANALYSIS_ID))
                        )
                        ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.VISION_ZONE_ANALYSIS_ID))
                        : null;
                }
                /* End : BS-967 */
                /* Start : BS-1612 */
                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.VISION_ZONE_ANALYSIS_RESULT)) {
                    lensConfObj.B2B_Vision_Zone_Analysis_Result__c = String.isNotBlank(
                            String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.VISION_ZONE_ANALYSIS_RESULT))
                        )
                        ? String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.VISION_ZONE_ANALYSIS_RESULT))
                        : null;
                }
                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.VISION_ZONE_ANALYSIS_RESULT_DATA)) {
                    lensConfObj.B2B_Original_Vision_Zone_Analysis__c = String.isNotBlank(
                            JSON.serialize(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.VISION_ZONE_ANALYSIS_RESULT_DATA))
                        ) && fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.VISION_ZONE_ANALYSIS_RESULT_DATA) != null
                        ? JSON.serialize(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.VISION_ZONE_ANALYSIS_RESULT_DATA))
                        : null;
                }
                /* End : BS-1612 */
                if (String.isNotBlank(leftImage) || String.isNotBlank(rightImage)) {
                    Map<String, String> lensVsImageMap = new Map<String, String>();
                    if (String.isNotEmpty(leftImage)) {
                        lensVsImageMap.put(B2B_Constants.LEFT_LENS_IMAGE, leftImage);
                    }
                    if (String.isNotEmpty(rightImage)) {
                        lensVsImageMap.put(B2B_Constants.RIGHT_LENS_IMAGE, rightImage);
                    }
                    List<ContentVersion> contentVersionList = new List<ContentVersion>();

                    for (String image : lensVsImageMap.keySet()) {
                        ContentVersion contentVersion = new ContentVersion(
                            versionData = EncodingUtil.base64Decode(lensVsImageMap.get(image)),
                            title = image,
                            pathOnClient = image + '.' + B2B_Constants.CALCULATED_LENS_IMAGE_FORMAT,
                            ContentLocation = B2B_Constants.CONTENT_DOCUMENT_LOCATION,
                            FirstPublishLocationId = lensConfiguratorId
                        );
                        contentVersionList.add(contentVersion);
                    }

                    if (contentVersionList.isEmpty() == false) {
                        Set<String> calculatedLensAttachmentsSet = new Set<String>{ B2B_Constants.LEFT_LENS_IMAGE, B2B_Constants.RIGHT_LENS_IMAGE }; //BS-793
                        List<ContentDocumentLink> contentDocumentLinkToDeleteList = new List<ContentDocumentLink>();
                        contentDocumentLinkToDeleteList = [
                            SELECT Id
                            FROM ContentDocumentLink
                            WHERE LinkedEntityId = :lensConfiguratorId AND ContentDocument.Title IN :calculatedLensAttachmentsSet
                        ]; //BS-793

                        if (contentDocumentLinkToDeleteList.isEmpty() == false) {
                            delete contentDocumentLinkToDeleteList;
                        }
                        insert contentVersionList;
                    }
                }
                //BS-727 : Saving Thickness Matching Calculator Values entered by user on UI into Lens Configurator - End
                update lensConfObj;
            }
            return lensConfiguratorId;
        } catch (Exception exceptionInstance) {
            // Throwing custom exception in case of any errors
            B2B_LogUtils.createInfoLog(
                exceptionInstance.getMessage(),
                'B2B_VisionSensation_RX_Controller',
                'Lens COnfigurator Id: ' +
                lensConfiguratorId +
                'Data Input Map-->' +
                fieldNameVsLensConfiguratorDataMap
            );
            throw new AuraHandledException('Error while performing DML');
        }
    }

    /**
     * BS-762
     * @description This method is used to get translations for category according to provided language
     * @param  language :   Applicable language
     */
    @AuraEnabled
    public static List<ProductCategoryDataTranslation> getCategoryTranslations(String language) {
        try {
            List<ProductCategoryDataTranslation> productCategoryDataTranslationList = new List<ProductCategoryDataTranslation>();
            if (String.isNotBlank(language)) {
                productCategoryDataTranslationList = [
                    SELECT Id, ParentId, Parent.name, Language, Name
                    FROM ProductCategoryDataTranslation
                    WHERE Language = :language
                ];
            }
            return productCategoryDataTranslationList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * BS-762
     * @description This method is used to get translations for category according to provided language
     * @param  language :   Applicable language
     */
    @AuraEnabled
    public static List<ProductCategory> getCategoryDetail(String catalog) {
        try {
            List<WebStoreCatalog> webStoreCatalogList = new List<WebStoreCatalog>();

            //Fetching catalog name through webstore
            String silhouetteStoreFront = System.Label.B2B_StoreFrontName;
            webStoreCatalogList = [
                SELECT Id, Name, ProductCatalogId, ProductCatalog.Name, SalesStore.name
                FROM WebStoreCatalog
                WHERE SalesStore.name = :silhouetteStoreFront
            ];

            String silhouetteStoreCatalog = '';
            for (WebStoreCatalog webStoreCatalog : webStoreCatalogList) {
                silhouetteStoreCatalog = webStoreCatalog.ProductCatalog.Name;
            }

            List<ProductCategory> categoryDetailsList = new List<ProductCategory>();
            categoryDetailsList = [SELECT Id, Name, ParentCategoryId, ParentCategory.Name FROM ProductCategory WHERE Catalog.Name = :silhouetteStoreCatalog];
            return categoryDetailsList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     *  BS-978
     *  @description This method is used to get B2B_Lens_Configurator__c records from database according to provided input options
     *  @author Sachin V
     *  @param  applicableBrand      :   Value of applicable brand as:
                                            1. Vision Sensation
                                            2. RX Glazing
     *  @param  selectedOrderType    :   Value of order type field such as:
                                            1. Complete Eyewear
                                            2. Lens Only
                                            3. Lens Only + Frame provided
     *  @param  selectedStatus       :   Value of status field such as:
                                            1. Open
                                            2. In cart
                                            3. Closed
     *  @param  selectedTimeframe    :   Value of created date field
     *  @return configurationDataList : List of B2B_Lens_Configurator__c records in custom wrapper format
     */
    @AuraEnabled
    public static List<B2B_VS_RX_Configuration_Data_Wrapper> getVSRXConfigurationData(
        String applicableBrand,
        String selectedOrderType,
        String selectedStatus,
        String selectedTimeframe
    ) {
        List<B2B_VS_RX_Configuration_Data_Wrapper> configurationDataList = new List<B2B_VS_RX_Configuration_Data_Wrapper>();
        String query = '';
        try {
            // Fetching accountId of currently logged in user
            Id accountId = B2B_Utils.getAccountIdByCurrentUser();
            if (accountId != null) {
                // If account Id is present then executing further logic
                String statusToExclude = B2B_Constants.STATUS_IN_CART; // As per curren requirement, 'In cart' picklist value of field 'B2B_Status__c' should be excluded while fetching the records
                List<B2B_Lens_Configurator__c> lensConfiguratorDataList = new List<B2B_Lens_Configurator__c>();

                // Constructing a dynaimic query accoridng to inputs provided
                query =
                    'SELECT Id, B2B_Selected_Frame__c, toLabel(B2B_Order_Type__c), B2B_Status__c, B2B_Frame_Collection__c, B2B_Lens_Size__c, toLabel(B2B_Lens_Type__c), B2B_Customer_Name__c, ' +
                    'CreatedDate, LastModifiedDate FROM B2B_Lens_Configurator__c WHERE B2B_Type__c = \'' +
                    applicableBrand +
                    '\' AND  B2B_Account__c = \'' +
                    accountId +
                    '\' AND DAY_ONLY(CreatedDate) > ' +
                    DateTime.now().addDays(-Integer.valueOf(String.escapeSingleQuotes(selectedTimeframe))).format('yyyy-MM-dd');

                // If order type value is provided as input and value is not equal to 'All' then considering the value provided as input
                if (String.isNotBlank(selectedOrderType) && selectedOrderType.equalsIgnoreCase('All') == false) {
                    query = (String.isNotEmpty(selectedOrderType))
                        ? query + ' AND B2B_Order_Type__c = \'' + String.escapeSingleQuotes(selectedOrderType) + '\''
                        : query;
                }

                // If status value is provided as input and value is not equal to 'All' then considering the value provided as input
                if (String.isNotBlank(selectedStatus) && selectedStatus.equalsIgnoreCase('All') == false) {
                    query = (String.isNotEmpty(selectedStatus)) ? query + ' AND B2B_Status__c = \'' + String.escapeSingleQuotes(selectedStatus) + '\'' : query;

                    // If status value is provided as input and value = 'All' then considering all values of status field excluding value in 'statusToExclude'
                } else if (String.isNotBlank(selectedStatus) && selectedStatus.equalsIgnoreCase('All')) {
                    query = (String.isNotEmpty(statusToExclude))
                        ? query + ' AND B2B_Status__c != \'' + String.escapeSingleQuotes(statusToExclude) + '\''
                        : query;
                }

                lensConfiguratorDataList = Database.query(query);
                if (lensConfiguratorDataList.isEmpty() == false) {
                    Set<String> stockKeepingUnitSet = new Set<String>();

                    // Iterating over the fetched records and storing the selected frame SKU in stockKeepingUnitSet
                    for (B2B_Lens_Configurator__c lensConfigurator : lensConfiguratorDataList) {
                        if (String.isNotBlank(lensConfigurator.B2B_Selected_Frame__c)) {
                            stockKeepingUnitSet.add(lensConfigurator.B2B_Selected_Frame__c);
                        }
                    }

                    List<Product2> productList = new List<Product2>();
                    // Fetching the details of Product records that matches the SKU in stockKeepingUnitSet
                    //BS-1701 : Added B2B_Model_Name__c
                    productList = [
                        SELECT Id, Name, StockKeepingUnit, B2B_Model__c, B2B_Model_Name__c
                        FROM Product2
                        WHERE StockKeepingUnit IN :stockKeepingUnitSet
                    ];

                    // Constructing a map of SKU as key and Product record as value as it's values can be accessed later
                    Map<String, Product2> stockKeepingUnitVSProductMap = new Map<String, Product2>();
                    for (Product2 product : productList) {
                        stockKeepingUnitVSProductMap.put(product.StockKeepingUnit, product);
                    }

                    //Iterating over the fetched records and constructing  custom wrapper: B2B_VS_RX_Configuration_Data_Wrapper
                    for (B2B_Lens_Configurator__c lensConfigurator : lensConfiguratorDataList) {
                        B2B_VS_RX_Configuration_Data_Wrapper configurationData = new B2B_VS_RX_Configuration_Data_Wrapper();
                        configurationData.recordId = lensConfigurator.Id;
                        configurationData.orderType = String.isNotBlank(lensConfigurator.B2B_Order_Type__c) ? lensConfigurator.B2B_Order_Type__c : null;
                        configurationData.status = String.isNotBlank(lensConfigurator.B2B_Status__c) ? lensConfigurator.B2B_Status__c : null;

                        // Here according to requirement collection name from field: 'B2B_Frame_Collection__c' and Model number from Product2 should get combined
                        // Hence fetching the model number from stockKeepingUnitVSProductMap by giving SKU as key
                        if (stockKeepingUnitVSProductMap.containsKey(lensConfigurator.B2B_Selected_Frame__c)) {
                            configurationData.collectionNameAndNumber = (String.isNotBlank(
                                    stockKeepingUnitVSProductMap.get(lensConfigurator.B2B_Selected_Frame__c).Name
                                )
                                ? String.valueOf(stockKeepingUnitVSProductMap.get(lensConfigurator.B2B_Selected_Frame__c).Name)
                                : ''); // BS-1701 : Added B2B_Model_Name__c
                        }
                        if (stockKeepingUnitVSProductMap.containsKey(lensConfigurator.B2B_Selected_Frame__c)) {
                            configurationData.collectionNameAndNumber += (String.isNotBlank(
                                    stockKeepingUnitVSProductMap.get(lensConfigurator.B2B_Selected_Frame__c).B2B_Model__c
                                )
                                ? ' ' + String.valueOf(stockKeepingUnitVSProductMap.get(lensConfigurator.B2B_Selected_Frame__c).B2B_Model__c)
                                : ''); // BS-1701 : Added B2B_Model_Name__c
                        }
                        configurationData.lensName = String.isNotBlank(lensConfigurator.B2B_Lens_Type__c) ? lensConfigurator.B2B_Lens_Type__c : null;
                        configurationData.customerName = String.isNotBlank(lensConfigurator.B2B_Customer_Name__c)
                            ? lensConfigurator.B2B_Customer_Name__c
                            : null;

                        // Peforming formatting to createdDate so that it can be user friendly and converting it from DateTime to Date
                        configurationData.createdDate = (Date.newinstance(
                            lensConfigurator.CreatedDate.year(),
                            lensConfigurator.CreatedDate.month(),
                            lensConfigurator.CreatedDate.day()
                        ));

                        // Peforming formatting to LastModifiedDate so that it can be user friendly and converting it from DateTime to Date and Finally Date
                        configurationData.lastModifiedDate = (Date.newinstance(
                            lensConfigurator.LastModifiedDate.year(),
                            lensConfigurator.LastModifiedDate.month(),
                            lensConfigurator.LastModifiedDate.day()
                        ));
                        configurationDataList.add(configurationData);
                    }
                }
            }
            // Returning the constructed list of records
            return configurationDataList;
        } catch (Exception exceptionInstance) {
            // Throwing custom exce[tion in case of any errors
            B2B_LogUtils.createInfoLog(exceptionInstance.getMessage(), 'B2B_VisionSensation_RX_Controller', 'Query: ' + query);
            throw new AuraHandledException('Error while fetching B2B Lens Configurator records');
        }
    }

    /**
     * BS-979
     * @description This method is used to delete B2B_Lens_Configurator__c records according to provided recordId
     * @author Sachin V
     * @param  recordId     :   Id of record that needs to be deleted from database
     */
    @AuraEnabled
    public static void deleteConfiguratorRecord(String recordId) {
        try {
            if (String.isNotBlank(recordId)) {
                delete new B2B_Lens_Configurator__c(Id = recordId);
            }
        } catch (Exception exceptionInstance) {
            B2B_LogUtils.createInfoLog(exceptionInstance.getMessage(), 'B2B_VisionSensation_RX_Controller', +'RecordId: ' + recordId);
            throw new AuraHandledException('Error while deleting B2B Lens Configurator record');
        }
    }

    /**
     * @description This method is used to return the lens database field for prescription values.
     * BS-725
     * @author Chirag L
     * @param  productId   Id of category selected by user
     * @return              returns the categories data
     */
    @AuraEnabled(cacheable=false)
    public static List<Product2> getPrescriptionValues(String lensProductSKU) {
        List<Product2> productList = [
            SELECT
                Id,
                StockKeepingUnit,
                B2B_Prism_1_Max__c,
                B2B_Prism_1_Max_Allowed__c,
                B2B_Prism_1_Min__c,
                B2B_Prism_1_Min_Allowed__c,
                B2B_Prism_2_Max__c,
                B2B_Prism_2_Max_Allowed__c,
                B2B_Prism_2_Min__c,
                B2B_Prism_2_Min_Allowed__c,
                B2B_Prism_base_1_Max__c,
                B2B_Prism_base_1_Max_Allowed__c,
                B2B_Prism_base_1_Min__c,
                B2B_Prism_base_1_Min_Allowed__c,
                B2B_Prism_base_2_Max__c,
                B2B_Prism_base_2_Max_Allowed__c,
                B2B_Prism_base_2_Min__c,
                B2B_Prism_base_2_Min_Allowed__c,
                B2B_Sphere_Max__c,
                B2B_Sphere_Max_Allowed__c,
                B2B_Sphere_Min__c,
                B2B_Sphere_Min_Allowed__c,
                B2B_Axis_Max__c,
                B2B_Axis_Max_Allowed__c,
                B2B_Axis_Min__c,
                B2B_Axis_Min_Allowed__c,
                B2B_Cylinder_Max__c,
                B2B_Cylinder_Max_Allowed__c,
                B2B_Cylinder_Min__c,
                B2B_Cylinder_Min_Allowed__c,
                B2B_Addition_Min_Allowed__c,
                B2B_Addition_Max_Allowed__c,
                B2B_Addition_Min__c,
                B2B_Addition_Max__c,
                //BS-1708
                B2B_WithEE_Sphere_Min__c,
                B2B_WithEE_Sphere_Max__c
            //BS-1708
            FROM Product2
            WHERE StockKeepingUnit = :lensProductSKU
            LIMIT 1
        ];

        return productList.isEmpty() ? null : productList;
    }

    /**
     * @description This method will save the inputed data to lens configurator.
     * BS-725
     * @author Chirag L
     * @param  customerInputMap   inputs from user.
     * @param lensConfiguratorId lens configurator id to be used to save data in.
     * @param eyeSide selected eye side values.
     * @param baseValue selected base value.
     */
    @AuraEnabled(cacheable=false)
    public static string savePrescriptionData(Map<String, Object> customerInputMap, String lensConfiguratorId, String eyeSide, String baseValue) {
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [
            SELECT
                Id,
                B2B_Axis_Left__c,
                B2B_Axis_Right__c,
                B2B_Cylinder_Left__c,
                B2B_Cylinder_Right__c,
                B2B_Prism_1_Left__c,
                B2B_Prism_1_Right__c,
                B2B_Prism2_Left__c,
                B2B_Prism2_Right__c,
                B2B_Prism_base2_Left__c,
                B2B_Prism_base2_Right__c,
                B2B_Sphere_Right__c,
                B2B_PB1Placement_Left__c,
                B2B_PB1_Left__c,
                B2B_PB1_Right__c,
                B2B_PB1Placement_Right__c,
                B2B_PB2Placement_Right__c,
                B2B_PB2Placement_Left__c,
                B2B_Sphere_Left__c,
                B2B_Eye_Side__c,
                B2B_Base_Values__c,
                B2B_Addition_Left__c,
                B2B_Addition_Right__c
            FROM B2B_Lens_Configurator__c
            WHERE Id = :lensConfiguratorId
        ];

        if (lensConfiguratorList.isEmpty() == false) {
            lensConfiguratorList[0].B2B_Eye_Side__c = eyeSide;
            lensConfiguratorList[0].B2B_Base_Values__c = baseValue;

            if (customerInputMap.containsKey(B2B_Constants.RIGHT_PRISM_BASE2_RADIO)) {
                lensConfiguratorList[0].B2B_PB2Placement_Right__c = customerInputMap.get(B2B_Constants.RIGHT_PRISM_BASE2_RADIO) != null
                    ? (String) customerInputMap.get(B2B_Constants.RIGHT_PRISM_BASE2_RADIO)
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.RIGHT_PRISM_BASE2_RADIO) == false) {
                lensConfiguratorList[0].B2B_PB2Placement_Right__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.RIGHT_PRISM2)) {
                lensConfiguratorList[0].B2B_Prism2_Right__c = customerInputMap.get(B2B_Constants.RIGHT_PRISM2) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.RIGHT_PRISM2))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.RIGHT_PRISM2) == false) {
                lensConfiguratorList[0].B2B_Prism2_Right__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.RIGHT_PRISM_BASE1_RADIO)) {
                lensConfiguratorList[0].B2B_PB1Placement_Right__c = customerInputMap.get(B2B_Constants.RIGHT_PRISM_BASE1_RADIO) != null
                    ? (String) customerInputMap.get(B2B_Constants.RIGHT_PRISM_BASE1_RADIO)
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.RIGHT_PRISM_BASE1_RADIO) == false) {
                lensConfiguratorList[0].B2B_PB1Placement_Right__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.RIGHT_PRISM1)) {
                lensConfiguratorList[0].B2B_Prism_1_Right__c = customerInputMap.get(B2B_Constants.RIGHT_PRISM1) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.RIGHT_PRISM1))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.RIGHT_PRISM1) == false) {
                lensConfiguratorList[0].B2B_Prism_1_Right__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.RIGHT_AXIS)) {
                lensConfiguratorList[0].B2B_Axis_Right__c = customerInputMap.get(B2B_Constants.RIGHT_AXIS) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.RIGHT_AXIS))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.RIGHT_AXIS) == false) {
                lensConfiguratorList[0].B2B_Axis_Right__c = null;
            }
            if (customerInputMap.containsKey(B2B_Constants.RIGHT_ADDITION)) {
                lensConfiguratorList[0].B2B_Addition_Right__c = customerInputMap.get(B2B_Constants.RIGHT_ADDITION) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.RIGHT_ADDITION))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.RIGHT_ADDITION) == false) {
                lensConfiguratorList[0].B2B_Addition_Right__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.RIGHT_CYLINDER)) {
                lensConfiguratorList[0].B2B_Cylinder_Right__c = customerInputMap.get(B2B_Constants.RIGHT_CYLINDER) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.RIGHT_CYLINDER))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.RIGHT_CYLINDER) == false) {
                lensConfiguratorList[0].B2B_Cylinder_Right__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.RIGHT_SPHERE)) {
                lensConfiguratorList[0].B2B_Sphere_Right__c = customerInputMap.get(B2B_Constants.RIGHT_SPHERE) != null
                    ? (String) customerInputMap.get(B2B_Constants.RIGHT_SPHERE)
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.RIGHT_SPHERE) == false) {
                lensConfiguratorList[0].B2B_Sphere_Right__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.LEFT_SPHERE)) {
                lensConfiguratorList[0].B2B_Sphere_Left__c = customerInputMap.get(B2B_Constants.LEFT_SPHERE) != null
                    ? (String) customerInputMap.get(B2B_Constants.LEFT_SPHERE)
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.LEFT_SPHERE) == false) {
                lensConfiguratorList[0].B2B_Sphere_Left__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.LEFT_CYLINDER)) {
                lensConfiguratorList[0].B2B_Cylinder_Left__c = customerInputMap.get(B2B_Constants.LEFT_CYLINDER) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.LEFT_CYLINDER))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.LEFT_CYLINDER) == false) {
                lensConfiguratorList[0].B2B_Cylinder_Left__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.LEFT_AXIS)) {
                lensConfiguratorList[0].B2B_Axis_Left__c = customerInputMap.get(B2B_Constants.LEFT_AXIS) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.LEFT_AXIS))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.LEFT_AXIS) == false) {
                lensConfiguratorList[0].B2B_Axis_Left__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.LEFT_ADDITION)) {
                lensConfiguratorList[0].B2B_Addition_Left__c = customerInputMap.get(B2B_Constants.LEFT_ADDITION) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.LEFT_ADDITION))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.LEFT_ADDITION) == false) {
                lensConfiguratorList[0].B2B_Addition_Left__c = null;
            }
            if (customerInputMap.containsKey(B2B_Constants.LEFT_PRISM1)) {
                lensConfiguratorList[0].B2B_Prism_1_Left__c = customerInputMap.get(B2B_Constants.LEFT_PRISM1) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.LEFT_PRISM1))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.LEFT_PRISM1) == false) {
                lensConfiguratorList[0].B2B_Prism_1_Left__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.LEFT_PRISM_BASE1_RADIO)) {
                lensConfiguratorList[0].B2B_PB1Placement_Left__c = customerInputMap.get(B2B_Constants.LEFT_PRISM_BASE1_RADIO) != null
                    ? (String) customerInputMap.get(B2B_Constants.LEFT_PRISM_BASE1_RADIO)
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.LEFT_PRISM_BASE1_RADIO) == false) {
                lensConfiguratorList[0].B2B_PB1Placement_Left__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.LEFT_PRISM2)) {
                lensConfiguratorList[0].B2B_Prism2_Left__c = customerInputMap.get(B2B_Constants.LEFT_PRISM2) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.LEFT_PRISM2))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.LEFT_PRISM2) == false) {
                lensConfiguratorList[0].B2B_Prism2_Left__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.LEFT_PRISM_BASE2_RADIO)) {
                lensConfiguratorList[0].B2B_PB2Placement_Left__c = customerInputMap.get(B2B_Constants.LEFT_PRISM_BASE2_RADIO) != null
                    ? (String) customerInputMap.get(B2B_Constants.LEFT_PRISM_BASE2_RADIO)
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.LEFT_PRISM_BASE2_RADIO) == false) {
                lensConfiguratorList[0].B2B_PB2Placement_Left__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.LEFT_PRISM_BASE2)) {
                lensConfiguratorList[0].B2B_Prism_base2_Left__c = customerInputMap.get(B2B_Constants.LEFT_PRISM_BASE2) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.LEFT_PRISM_BASE2))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.LEFT_PRISM_BASE2) == false) {
                lensConfiguratorList[0].B2B_Prism_base2_Left__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.LEFT_PRISM_BASE1)) {
                lensConfiguratorList[0].B2B_PB1_Left__c = customerInputMap.get(B2B_Constants.LEFT_PRISM_BASE1) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.LEFT_PRISM_BASE1))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.LEFT_PRISM_BASE1) == false) {
                lensConfiguratorList[0].B2B_PB1_Left__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.RIGHT_PRISM_BASE2)) {
                lensConfiguratorList[0].B2B_Prism_base2_Right__c = customerInputMap.get(B2B_Constants.RIGHT_PRISM_BASE2) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.RIGHT_PRISM_BASE2))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.RIGHT_PRISM_BASE2) == false) {
                lensConfiguratorList[0].B2B_Prism_base2_Right__c = null;
            }

            if (customerInputMap.containsKey(B2B_Constants.RIGHT_PRISM_BASE1)) {
                lensConfiguratorList[0].B2B_PB1_Right__c = customerInputMap.get(B2B_Constants.RIGHT_PRISM_BASE1) != null
                    ? Decimal.valueOf((String) customerInputMap.get(B2B_Constants.RIGHT_PRISM_BASE1))
                    : null;
            } else if (customerInputMap.containsKey(B2B_Constants.RIGHT_PRISM_BASE1) == false) {
                lensConfiguratorList[0].B2B_PB1_Right__c = null;
            }

            update lensConfiguratorList[0];
        }
        return 'success';
    }

    /**
     * @description This method will save the inputed data to lens configurator.
     * BS-726
     * @author Chirag L
     * @param  customerInputMap   inputs from user.
     */
    @AuraEnabled(cacheable=false)
    public static string saveCenteringData(Map<String, Object> customerInputMap, String lensConfiguratorId) {
        List<B2B_Lens_Configurator__c> lensConfiguratorList = new List<B2B_Lens_Configurator__c>();
        if (lensConfiguratorId != null) {
            lensConfiguratorList = [
                SELECT
                    Id,
                    B2B_BVD_refracted__c,
                    B2B_BVD_worn__c,
                    B2B_Fitting_height_Left_Eye__c,
                    B2B_Fitting_height_Right_Eye__c,
                    B2B_Pantoscopic_tilt__c,
                    B2B_Pupil_Distance_Left_Eye__c,
                    B2B_Pupil_Distance_Right_Eye__c,
                    B2B_Measurement_System__c,
                    B2B_Working_Distance__c, //BS-1117
                    B2B_Agreement_To_Direct_Glazing__c,
                    B2B_Agreement_To_Adapter__c
                FROM B2B_Lens_Configurator__c
                WHERE Id = :lensConfiguratorId
            ];
        } //end if

        if (lensConfiguratorList.isEmpty() == false) {
            //BS-1117 : Extracting Working Distance Field from user input map
            if (customerInputMap.containsKey(B2B_Constants.WORKING_DISTANCE)) {
                lensConfiguratorList[0].B2B_Working_Distance__c = (String) customerInputMap.get(B2B_Constants.WORKING_DISTANCE);
            } else {
                // If field is not present then explicitely setting it to null
                lensConfiguratorList[0].B2B_Working_Distance__c = null;
            }
            //BS-1117 : End

            if (
                customerInputMap.containsKey(B2B_Constants.PUPIL_DISTANCE_RIGHT_EYE) &&
                (String) customerInputMap.get(B2B_Constants.PUPIL_DISTANCE_RIGHT_EYE) != null
            ) {
                lensConfiguratorList[0].B2B_Pupil_Distance_Right_Eye__c = Decimal.valueOf(
                    (String) customerInputMap.get(B2B_Constants.PUPIL_DISTANCE_RIGHT_EYE)
                );
            } else {
                lensConfiguratorList[0].B2B_Pupil_Distance_Right_Eye__c = null;
            }
            if (
                customerInputMap.containsKey(B2B_Constants.PUPIL_DISTANCE_LEFT_EYE) &&
                (String) customerInputMap.get(B2B_Constants.PUPIL_DISTANCE_LEFT_EYE) != null
            ) {
                lensConfiguratorList[0].B2B_Pupil_Distance_Left_Eye__c = Decimal.valueOf((String) customerInputMap.get(B2B_Constants.PUPIL_DISTANCE_LEFT_EYE));
            } else {
                lensConfiguratorList[0].B2B_Pupil_Distance_Left_Eye__c = null;
            }
            if (
                customerInputMap.containsKey(B2B_Constants.FITTING_HEIGHT_RIGHT_EYE) &&
                (String) customerInputMap.get(B2B_Constants.FITTING_HEIGHT_RIGHT_EYE) != null
            ) {
                lensConfiguratorList[0].B2B_Fitting_height_Right_Eye__c = Decimal.valueOf(
                    (String) customerInputMap.get(B2B_Constants.FITTING_HEIGHT_RIGHT_EYE)
                );
            } else {
                lensConfiguratorList[0].B2B_Fitting_height_Right_Eye__c = null;
            }
            if (
                customerInputMap.containsKey(B2B_Constants.FITTING_HEIGHT_LEFT_EYE) &&
                (String) customerInputMap.get(B2B_Constants.FITTING_HEIGHT_LEFT_EYE) != null
            ) {
                lensConfiguratorList[0].B2B_Fitting_height_Left_Eye__c = Decimal.valueOf((String) customerInputMap.get(B2B_Constants.FITTING_HEIGHT_LEFT_EYE));
            } else {
                lensConfiguratorList[0].B2B_Fitting_height_Left_Eye__c = null;
            }
            if (customerInputMap.containsKey(B2B_Constants.PANTASCOPIC_TILT)) {
                lensConfiguratorList[0].B2B_Pantoscopic_tilt__c = Decimal.valueOf((String) customerInputMap.get(B2B_Constants.PANTASCOPIC_TILT));
            } else {
                lensConfiguratorList[0].B2B_Pantoscopic_tilt__c = null;
            }
            if (customerInputMap.containsKey(B2B_Constants.BVDWORN)) {
                lensConfiguratorList[0].B2B_BVD_worn__c = Decimal.valueOf((String) customerInputMap.get(B2B_Constants.BVDWORN));
            } else {
                lensConfiguratorList[0].B2B_BVD_worn__c = null;
            }
            if (customerInputMap.containsKey(B2B_Constants.BVDREFFRACTED)) {
                lensConfiguratorList[0].B2B_BVD_refracted__c = Decimal.valueOf((String) customerInputMap.get(B2B_Constants.BVDREFFRACTED));
            } else {
                lensConfiguratorList[0].B2B_BVD_refracted__c = null;
            }
            if (customerInputMap.containsKey(B2B_Constants.RADIOVALUE)) {
                lensConfiguratorList[0].B2B_Measurement_System__c = (String) customerInputMap.get(B2B_Constants.RADIOVALUE);
            } else {
                lensConfiguratorList[0].B2B_Measurement_System__c = null;
            }
            if (customerInputMap.containsKey(B2B_Constants.CHECKED_DG_AGREEMENT)) {
                lensConfiguratorList[0].B2B_Agreement_To_Direct_Glazing__c = (Boolean) customerInputMap.get(B2B_Constants.CHECKED_DG_AGREEMENT);
            } else {
                lensConfiguratorList[0].B2B_Agreement_To_Direct_Glazing__c = false;
            }
            if (customerInputMap.containsKey(B2B_Constants.CHECKED_ADAPTER_AGREEMENT)) {
                lensConfiguratorList[0].B2B_Agreement_To_Adapter__c = (Boolean) customerInputMap.get(B2B_Constants.CHECKED_ADAPTER_AGREEMENT);
            } else {
                lensConfiguratorList[0].B2B_Agreement_To_Adapter__c = false;
            }

            update lensConfiguratorList[0];
        }

        return 'success';
    }

    /**
     * @description This method will take the data from lensConfigurator and form a Request needed for Schneider callout
     * BS-898
     * @author Chirag L
     * @param  recordId   lens configuratorId
     * @param applicableBrand brand VS or RX
     * @param applicableLanguage language of user.
     */
    @AuraEnabled
    public static B2B_VisionSensationUtility.B2B_SchneiderRequest constructLensConfiguratorData(
        String recordId,
        String applicableBrand,
        String applicableLanguage,
        String leftValue,
        String rightValue,
        Boolean blending //BS-572 : Added blending as parameter that represents Evil Eye Edge selection by user
    ) {
        if (String.isNotBlank(recordId) && String.isNotBlank(applicableBrand)) {
            Set<String> lensConfiguratorFieldSet = new Set<String>();

            B2B_VisionSensationUtility.B2B_SchneiderRequest schneiderRequestInstance = new B2B_VisionSensationUtility.B2B_SchneiderRequest();

            List<B2B_Lens_Configurator__c> lensConfiguratorDataList = new List<B2B_Lens_Configurator__c>();
            for (Schema.FieldSetMember fieldSetInstance : SObjectType.B2B_Lens_Configurator__c.FieldSets.VS_RX_Configurator_fieldset.getFields()) {
                lensConfiguratorFieldSet.add(fieldSetInstance.getFieldPath());
            }

            String query = 'SELECT ';
            for (String fields : lensConfiguratorFieldSet) {
                //BS-1244 : Added check
                if (fields.equalsIgnoreCase('B2B_Account__c') == false) {
                    query += fields + ',';
                }
            }

            query += ' B2B_Account__c FROM B2B_Lens_Configurator__c WHERE Id=\'' + recordId + '\'';
            lensConfiguratorDataList = Database.query(query);

            if (lensConfiguratorDataList.isEmpty() == false) {
                //BS-1248 - Start
                for (B2B_Lens_Configurator__c lensConfigurator : lensConfiguratorDataList) {
                    //BS-1157 : Changed Lens Shape to Varient Shape
                    if (
                        String.isBlank(lensConfigurator.B2B_Features__c) == true ||
                        lensConfigurator.B2B_Lens_Size__c == null ||
                        String.isBlank(lensConfigurator.B2B_Variant_Shape__c) == true ||
                        String.isBlank(lensConfigurator.B2B_Schneider_SKU__c) == true
                    ) {
                        String errorMessage =
                            B2B_Constants.TIMESTAMP_FIELD +
                            String.valueOf(System.now()) +
                            B2B_Constants.STRING_SEPERATOR_LABEL +
                            System.label.B2B_SCHNEIDER_CALLOUT_DATA_MISSING_LABEL;
                        if (String.isBlank(lensConfigurator.B2B_Features__c) == true) {
                            errorMessage += B2B_Constants.FEATURES_MISSING;
                        }
                        if (lensConfigurator.B2B_Lens_Size__c == null) {
                            errorMessage += B2B_Constants.LENS_SIZE_MISSING;
                        }
                        if (String.isBlank(lensConfigurator.B2B_Variant_Shape__c) == true) {
                            errorMessage += B2B_Constants.VARIENT_SHAPE_MISSING;
                        }
                        if (String.isBlank(lensConfigurator.B2B_Schneider_SKU__c) == true) {
                            errorMessage += B2B_Constants.SCHNEIDER_SKU_MISSING;
                        }
                        if (String.isNotBlank(lensConfigurator.B2B_Selected_Frame__c) == true) {
                            errorMessage += B2B_Constants.SELECTED_FRAME + lensConfigurator.B2B_Selected_Frame__c;
                        }
                        if (String.isNotBlank(lensConfigurator.B2B_Selected_Lens_SKU__c) == true) {
                            errorMessage += B2B_Constants.SELECTED_LENS + lensConfigurator.B2B_Selected_Lens_SKU__c;
                        }
                        if (String.isNotBlank(lensConfigurator.B2B_Selected_RX_Solution_SKU__c) == true) {
                            errorMessage += B2B_Constants.SELECTED_SOLUTION_RX + lensConfigurator.B2B_Selected_RX_Solution_SKU__c;
                        }

                        B2B_CommerceLog__c commerceLog = B2B_LogUtils.createInfoLog(
                            errorMessage +
                            ', Configurator Id :' +
                            recordId,
                            'B2B_VisionSensation_RX_Controller.constructLensConfiguratorData()',
                            recordId
                        );
                        //insert commerceLog;
                    }
                    B2B_VisionSensationUtility.B2B_SchneiderRequest_PowerLeft powerLeft = new B2B_VisionSensationUtility.B2B_SchneiderRequest_PowerLeft();
                    powerLeft.sph = (lensConfigurator.B2B_Sphere_Left__c) != null ? Double.valueOf(lensConfigurator.B2B_Sphere_Left__c) : 0.0; //(Sphere - Left Eye - User Input - Centering Data)
                    powerLeft.cyl = (lensConfigurator.B2B_Cylinder_Left__c) != null ? Double.valueOf(lensConfigurator.B2B_Cylinder_Left__c) : 0.0; //(Cylinder - Left Eye- User Input - Centering Data)
                    powerLeft.ax = (lensConfigurator.B2B_Axis_Left__c) != null ? Double.valueOf(lensConfigurator.B2B_Axis_Left__c) : 0.0; //(Axis - Left Eye User Input - Centering Data)
                    powerLeft.add = (lensConfigurator.B2B_Addition_Left__c) != null ? Double.valueOf(lensConfigurator.B2B_Addition_Left__c) : 0.0; //(Addition - Left Eye User Input - Centering Data)
                    powerLeft.prvm1 = (lensConfigurator.B2B_Prism_1_Left__c) != null ? Double.valueOf(lensConfigurator.B2B_Prism_1_Left__c) : 0.0; //(Prism 1 - Left Eye User Input - Centering Data)
                    powerLeft.prvm2 = (lensConfigurator.B2B_Prism2_Left__c) != null ? Double.valueOf(lensConfigurator.B2B_Prism2_Left__c) : 0.0; //(Prism 2 - Left Eye User Input - Centering Data)
                    powerLeft.prva1 = (lensConfigurator.B2B_PB1_Left__c) != null ? Double.valueOf(lensConfigurator.B2B_PB1_Left__c) : 0.0; //(Prism base 1  - Left Eye User Input - Centering Data)
                    powerLeft.prva2 = (lensConfigurator.B2B_Prism_base2_Left__c) != null ? Double.valueOf(lensConfigurator.B2B_Prism_base2_Left__c) : 0.0; //(Prism base 2 - Left Eye User Input - Centering Data)

                    B2B_VisionSensationUtility.B2B_SchneiderRequest_PowerRight powerRight = new B2B_VisionSensationUtility.B2B_SchneiderRequest_PowerRight();
                    powerRight.sph = String.isNotBlank(lensConfigurator.B2B_Sphere_Right__c) ? Double.valueOf(lensConfigurator.B2B_Sphere_Right__c) : 0.0; //(Sphere - Right Eye User Input - Centering Data)
                    powerRight.cyl = (lensConfigurator.B2B_Cylinder_Right__c) != null ? Double.valueOf(lensConfigurator.B2B_Cylinder_Right__c) : 0.0; //(Cylinder - Right Eye User Input - Centering Data)
                    powerRight.ax = (lensConfigurator.B2B_Axis_Right__c) != null ? Double.valueOf(lensConfigurator.B2B_Axis_Right__c) : 0.0; //(Axis - Right Eye User Input - Centering Data)
                    powerRight.add = (lensConfigurator.B2B_Addition_Right__c) != null ? Double.valueOf(lensConfigurator.B2B_Addition_Right__c) : 0.0; // (Addition - Right Eye User Input - Centering Data)
                    powerRight.prvm1 = (lensConfigurator.B2B_Prism_1_Right__c) != null ? Double.valueOf(lensConfigurator.B2B_Prism_1_Right__c) : 0.0; //(Prism 1 - Right Eye User Input - Centering Data
                    powerRight.prvm2 = (lensConfigurator.B2B_Prism2_Right__c) != null ? Double.valueOf(lensConfigurator.B2B_Prism2_Right__c) : 0.0; //(Prism 2 - Right Eye User Input - Centering Data)
                    powerRight.prva1 = (lensConfigurator.B2B_PB1_Right__c) != null ? Double.valueOf(lensConfigurator.B2B_PB1_Right__c) : 0.0; //(Prism base 1  - Right Eye User Input - Centering Data)
                    powerRight.prva2 = (lensConfigurator.B2B_Prism_base2_Right__c) != null ? Double.valueOf(lensConfigurator.B2B_Prism_base2_Right__c) : 0.0; //(Prism base 2 - Right Eye User Input - Centering Data)

                    B2B_VisionSensationUtility.B2B_SchneiderRequest_MeasurementData measurementData = new B2B_VisionSensationUtility.B2B_SchneiderRequest_MeasurementData();
                    measurementData.vnw = (lensConfigurator.B2B_Pantoscopic_tilt__c) != null ? Double.valueOf(lensConfigurator.B2B_Pantoscopic_tilt__c) : 0.0; // (Pantoscopic tilt User Input - Centering Data)
                    measurementData.hsa = (lensConfigurator.B2B_BVD_worn__c) != null ? Double.valueOf(lensConfigurator.B2B_BVD_worn__c) : 0.0; //(BVD worn User Input - Centering Data)
                    measurementData.hsa2 = (lensConfigurator.B2B_BVD_refracted__c) != null ? Double.valueOf(lensConfigurator.B2B_BVD_refracted__c) : 0.0; //(BVD refracted User Input - Centering Data)
                    measurementData.le = (lensConfigurator.B2B_Lens_Distance__c) != null ? Double.valueOf(lensConfigurator.B2B_Lens_Distance__c) : 0.0; //(Working distance User Input - Centering Data)
                    measurementData.pdLeft = (lensConfigurator.B2B_Pupil_Distance_Left_Eye__c) != null
                        ? Double.valueOf(lensConfigurator.B2B_Pupil_Distance_Left_Eye__c)
                        : 0.0; //(Pupil distance - Left Eye User Input - Centering Data)
                    measurementData.pdRight = (lensConfigurator.B2B_Pupil_Distance_Right_Eye__c) != null
                        ? Double.valueOf(lensConfigurator.B2B_Pupil_Distance_Right_Eye__c)
                        : 0.0; //(Pupil distance - Right Eye User Input - Centering Data)
                    measurementData.ehLeft = (lensConfigurator.B2B_Fitting_height_Left_Eye__c) != null
                        ? Double.valueOf(lensConfigurator.B2B_Fitting_height_Left_Eye__c)
                        : 0.0; //(Fitting height - Left Eye User Input - Centering Data)
                    measurementData.ehRight = (lensConfigurator.B2B_Fitting_height_Right_Eye__c) != null
                        ? Double.valueOf(lensConfigurator.B2B_Fitting_height_Right_Eye__c)
                        : 0.0; //(Fitting height - Left Eye User Input - Centering Data)
                    String applicableMeasurementSystem;
                    if (String.isNotBlank(lensConfigurator.B2B_Measurement_System__c)) {
                        if ((String.valueOf(lensConfigurator.B2B_Measurement_System__c)).equalsIgnoreCase(B2B_Constants.BOXING_SYSTEM)) {
                            applicableMeasurementSystem = B2B_Constants.KM; // Boxing System
                        } else if ((String.valueOf(lensConfigurator.B2B_Measurement_System__c)).equalsIgnoreCase(B2B_Constants.MEASUREMENT_LINE_SYSTEM)) {
                            applicableMeasurementSystem = B2B_Constants.ML; // Measurement Line System
                        }
                    }
                    measurementData.measurementSystem = String.isNotBlank(lensConfigurator.B2B_Measurement_System__c) ? applicableMeasurementSystem : '';

                    B2B_VisionSensationUtility.B2B_SchneiderRequest_MinEdge minEdge = new B2B_VisionSensationUtility.B2B_SchneiderRequest_MinEdge();
                    minEdge.left = String.isNotBlank(leftValue) ? Double.valueOf(leftValue) : 0.0; //(new min edge for left Lens) (User Input Left - Thickness Matching Calculator - calculate lens) - Need to configure this later
                    minEdge.right = String.isNotBlank(rightValue) ? Double.valueOf(rightValue) : 0.0; //(new min edge for right Lens) (User Input Right - Thickness Matching Calculator - calculate lens) - Need to configure this later

                    // FOR RX Glazing, Scale is not applicable
                    B2B_VisionSensationUtility.B2B_SchneiderRequest_Scale scale = new B2B_VisionSensationUtility.B2B_SchneiderRequest_Scale();
                    scale.a = (lensConfigurator.B2B_a__c) != null ? Double.valueOf(lensConfigurator.B2B_a__c) : 0.0; // This will be obtained from OMA Callout
                    scale.b = (lensConfigurator.B2B_b__c) != null ? Double.valueOf(lensConfigurator.B2B_b__c) : 0.0; // This will be obtained from OMA Callout
                    scale.b1 = (lensConfigurator.B2B_b1__c) != null ? Double.valueOf(lensConfigurator.B2B_b1__c) : 0.0; // This will be obtained from OMA Callout
                    scale.b2 = (lensConfigurator.B2B_b2__c) != null ? Double.valueOf(lensConfigurator.B2B_b2__c) : 0.0; // This will be obtained from OMA Callout
                    scale.sf = (lensConfigurator.B2B_SF__c) != null ? Double.valueOf(lensConfigurator.B2B_SF__c) : 0.0; // This will be obtained from OMA Callout
                    scale.blp = (lensConfigurator.B2B_blp__c) != null ? Double.valueOf(lensConfigurator.B2B_blp__c) : 0.0; // This will be obtained from oma callout - Need to configure this later

                    B2B_VisionSensationUtility.B2B_SchneiderRequest schneiderRequest = new B2B_VisionSensationUtility.B2B_SchneiderRequest();

                    //BS-1483 - Start
                    if (applicableBrand.equalsIgnoreCase(B2B_Constants.BRAND_VS)) {
                        schneiderRequest.oma = String.isNotBlank(lensConfigurator.B2B_OMA__c) ? lensConfigurator.B2B_OMA__c : '';
                        schneiderRequest.glassProduct = String.isNotBlank(lensConfigurator.B2B_GlassProductSKU__c)
                            ? lensConfigurator.B2B_GlassProductSKU__c
                            : '';
                        schneiderRequest.shapeId = String.isNotBlank(lensConfigurator.B2B_Lens_Shape__c) ? lensConfigurator.B2B_Lens_Shape__c : '';
                        schneiderRequest.blankcoating = String.isNotBlank(lensConfigurator.B2B_BlankCoatingSKU__c)
                            ? lensConfigurator.B2B_BlankCoatingSKU__c
                            : '';
                    } else {
                        schneiderRequest.oma = ''; // It will be obtained from oma callout. RX glazing does not have OMA Callout
                        schneiderRequest.glassProduct = String.isNotBlank(lensConfigurator.B2B_Schneider_SKU__c) ? lensConfigurator.B2B_Schneider_SKU__c : '';
                        schneiderRequest.shapeId = String.isNotBlank(lensConfigurator.B2B_Variant_Shape__c) ? lensConfigurator.B2B_Variant_Shape__c : '';
                        schneiderRequest.blankcoating = '';
                    }
                    //BS-1483 - End
                    schneiderRequest.powerLeft = powerLeft;
                    schneiderRequest.powerRight = powerRight;
                    schneiderRequest.measurementData = measurementData;
                    schneiderRequest.minEdge = minEdge;
                    schneiderRequest.lensBase = lensConfigurator.B2B_Base_Curve__c != null ? Double.valueOf(lensConfigurator.B2B_Base_Curve__c) : 0.0; //(Base curve) (SF Frame database, selected frame)
                    schneiderRequest.progressionLength = (lensConfigurator.B2B_Progression_Length__c) != null
                        ? Integer.valueOf(lensConfigurator.B2B_Progression_Length__c)
                        : 0; //(Progression length) (Lens Selection screen)
                    schneiderRequest.removeDrills = lensConfigurator.B2B_Remove_Drills__c != null ? lensConfigurator.B2B_Remove_Drills__c : false; //It will be obtained from oma callout
                    schneiderRequest.features = String.isNotBlank(lensConfigurator.B2B_Features__c) ? lensConfigurator.B2B_Features__c : ''; // Features obtained from lens shape database
                    //BS-1157 : Changed Lens Shape to Variant Shape
                    schneiderRequest.dblDistance = String.isNotBlank(lensConfigurator.B2B_Bridge__c) ? Integer.valueOf(lensConfigurator.B2B_Bridge__c) : 0; //(Bridge) (Bridge size of selected frame, SF Frame database)
                    schneiderRequest.size = lensConfigurator.B2B_Lens_Size__c != null ? String.valueOf(lensConfigurator.B2B_Lens_Size__c) : ''; //(Lens Size -> has to be a string, since the size for evileye is determined by XS, S, L,...
                    if (String.isNotBlank(lensConfigurator.B2B_Eye_Side__c)) {
                        if (lensConfigurator.B2B_Eye_Side__c.containsIgnoreCase(B2B_Constants.BOTH_EYE_SIDE)) {
                            schneiderRequest.calculateLeft = true;
                            schneiderRequest.calculateRight = true;
                        } else if (lensConfigurator.B2B_Eye_Side__c.containsIgnoreCase(B2B_Constants.RIGHT_EYE_SIDE)) {
                            schneiderRequest.calculateLeft = false;
                            schneiderRequest.calculateRight = true;
                        } else if (lensConfigurator.B2B_Eye_Side__c.containsIgnoreCase(B2B_Constants.LEFT_EYE_SIDE)) {
                            schneiderRequest.calculateLeft = true;
                            schneiderRequest.calculateRight = false;
                        }
                    }
                    //Added calculate left and calculate right functionality
                    if (schneiderRequest.calculateLeft == false) {
                        schneiderRequest.powerLeft = null;
                    }
                    if (schneiderRequest.calculateRight == false) {
                        schneiderRequest.powerRight = null;
                    }
                    //Added calculate left and calculate right functionality
                    /**
                     * NOT PRESENT - //(result of the vision zone analysis PAL One)
                     * (We can pass the code or the api result here. Question for rene, what parameters are required from the result? )
                     * Below visionzoneAnalysis attribute for callout was added as part of BS-1612
                     */
                    schneiderRequest.visionzoneAnalysis = String.isNotBlank(lensConfigurator.B2B_Vision_Zone_Analysis_Result__c)
                        ? lensConfigurator.B2B_Vision_Zone_Analysis_Result__c
                        : '';
                    schneiderRequest.lensARlms = lensConfigurator.B2B_Antireflection_SKU__c != null ? lensConfigurator.B2B_Antireflection_SKU__c : ''; // Need to configure this later
                    schneiderRequest.lensHClms = lensConfigurator.B2B_Hard_Coating_SKU__c != null ? lensConfigurator.B2B_Hard_Coating_SKU__c : ''; // Need to configure this later
                    //BS-572
                    schneiderRequest.blending = blending != null
                        ? blending
                        : lensConfigurator.B2B_Evil_Eye_Edge__c != null ? lensConfigurator.B2B_Evil_Eye_Edge__c : false;
                    //BS-572
                    schneiderRequest.retailerId = String.isNotBlank(lensConfigurator.B2B_ARIS_Account_Id__c)
                        ? String.valueOf(lensConfigurator.B2B_ARIS_Account_Id__c)
                        : '';
                    schneiderRequest.scale = scale;
                    // BS-1248 : Changes in applicableLanguage
                    schneiderRequest.language = applicableLanguage.equalsIgnoreCase(B2B_Constants.ENGLISH_US) == true
                        ? B2B_Constants.ENGLISH_LANGUAGE
                        : applicableLanguage; //(selected language, will be needed for the error messages that could be returned) REQUIRED since it has to be forwarded to CheckSVSORder
                    schneiderRequest.salesconcept = String.isNotBlank(lensConfigurator.B2B_Salesconcept__c) ? lensConfigurator.B2B_Salesconcept__c : ''; //REQUIRED since it has to be forwarded to CheckSVSORder // B2B_Salesconcept__c from Product2
                    schneiderRequest.colorNumber = String.isNotBlank(lensConfigurator.B2B_Color_Number__c) ? lensConfigurator.B2B_Color_Number__c : ''; //REQUIRED since it has to be forwarded to CheckSVSORder. B2B_ColorNumber__c from Product2
                    schneiderRequest.typeOrForm = B2B_Constants.TYPE_OR_FORM_APPLICABLE_VALUE_FOR_SCHNEIDER_CALLOUT; //REQUIRED since it has to be forwarded to CheckSVSORder //B2B_Variant_Shape__c from Product2 //BS-1483
                    schneiderRequest.earpiece = String.isNotBlank(lensConfigurator.B2B_Temple__c) ? lensConfigurator.B2B_Temple__c : ''; //(length of the earpiece) REQUIRED since it has to be forwarded to CheckSVSORder //B2B_Temple_Length__c from product2
                    schneiderRequest.omaShapeKey = String.isNotBlank(lensConfigurator.B2B_Oma_Shape_Key__c) ? lensConfigurator.B2B_Oma_Shape_Key__c : ''; //lensConfigurator.B2B_Oma_Shape_Key__c
                    schneiderRequestInstance = schneiderRequest;
                }
                return schneiderRequestInstance;
                //BS-1248 - End
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     * @description This method will confirm if the products need to be added to cart.
     * BS-728
     * Modified as part of BS-1244 (Added leftValue and rightValue attributes)
     * @author Vishalsingh G
     */
    @AuraEnabled
    public static B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper validateAddToCart(
        String recordId,
        String applicableBrand,
        String applicableLanguage,
        String leftValue,
        String rightValue,
        Boolean saveToDatabase
    ) {
        B2B_VisionSensationUtility.B2B_SchneiderRequest schneiderRequestCopy = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper schneiderCalloutResponseWrapper = new B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper();
        try {
            //BS-898 Start
            if (String.isNotBlank(recordId) && String.isNotBlank(applicableBrand)) {
                B2B_VisionSensationUtility.B2B_SchneiderRequest schneiderRequest = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
                if (String.isNotBlank(recordId)) {
                    schneiderRequest = constructLensConfiguratorData(recordId, applicableBrand, applicableLanguage, leftValue, rightValue, null); //BS-572 Added blending parameter as null
                    if (schneiderRequest != null) {
                        schneiderRequestCopy = schneiderRequest;
                        B2B_VisionSensationUtility utility = new B2B_VisionSensationUtility();
                        //BS-1248 - Start
                        schneiderCalloutResponseWrapper = utility.performSchneiderCallout(schneiderRequest);
                        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedSchneiderCalloutResponseWrapper = new B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper();
                        parsedSchneiderCalloutResponseWrapper = B2B_Utils.performSchneiderCalloutProcessing(schneiderCalloutResponseWrapper, recordId);

                        if (schneiderCalloutResponseWrapper.statusCode == 200) {
                            if (
                                schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper != null &&
                                schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper.success != null &&
                                (Boolean.valueOf(schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper.success)) == true
                            ) {
                                //BS-1244
                                if (saveToDatabase == true) {
                                    saveLensCalculationsToLensConfigurator(recordId, schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper);
                                }
                                //BS-1244
                                return schneiderCalloutResponseWrapper;
                            } else {
                                return schneiderCalloutResponseWrapper;
                            }
                            //BS-1034
                        } else {
                            return schneiderCalloutResponseWrapper;
                        }
                        //BS-1248 - End
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            } else {
                return null;
            }
            //BS-898 End
        } catch (Exception exceptionInstance) {
            throw new AuraHandledException('Error while performing schneider callout with Request Body' + ' Error: ' + exceptionInstance.getMessage());
        }
    }

    /**
     * @description This will update the lens configurator record
     * BS-728
     * @author Vishalsingh G
     */
    @AuraEnabled
    public static void updateLensConfiguratorRecord(
        String lensConfiguratorId,
        String specialHandlingValue,
        String noteValue,
        String statusValue,
        Boolean customerServicePreference
    ) {
        if (String.isNotBlank(lensConfiguratorId) && String.isBlank(statusValue)) {
            update new B2B_Lens_Configurator__c(
                Id = lensConfiguratorId,
                B2B_Special_Handling__c = specialHandlingValue,
                B2B_Note__c = noteValue,
                B2B_Customer_Service_Preference__c = customerServicePreference
            );
        }
        if (String.isNotBlank(lensConfiguratorId) && String.isNotBlank(statusValue)) {
            update new B2B_Lens_Configurator__c(Id = lensConfiguratorId, B2B_Status__c = B2B_Constants.STATUS_IN_CART);
        }
    }

    /**
     * @description This method will create a cart Item for VS RX
     * BS-728
     * @author Vishalsingh G
     */
    @AuraEnabled
    public static CartItem addToCartForVSRX(String communityId, String lensConfiguratorId, String quantity, String effectiveAccountId, String pageSource) {
        //BS-1121 start
        //BS-1689 : Added B2B_Order_Type__c to query
        List<B2B_Lens_Configurator__c> configuratorList = [
            SELECT Id, B2B_Selected_Frame__c, B2B_Order_Type__c
            FROM B2B_Lens_Configurator__c
            WHERE Id = :lensConfiguratorId
        ];
        List<Product2> productList = new List<Product2>();
        if (configuratorList.isEmpty() == false && configuratorList[0].B2B_Selected_Frame__c != null) {
            productList = [SELECT Id FROM Product2 WHERE StockKeepingUnit = :configuratorList[0].B2B_Selected_Frame__c];
        }
        //BS-1121 end
        CartItem cartItemObj = new CartItem();
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);
        if (productList.isEmpty() == false) {
            if (effectiveAccountId != '000000000000000' && webstoreId != null) {
                ConnectApi.CartSummary cartSummaryObject = commerceProxy.getOrCreateActiveCartSummary(webstoreId, effectiveAccountId);
                ConnectApi.ProductOverviewCollection productDetails = commerceProxy.getProducts(
                    webstoreId,
                    effectiveAccountId,
                    new List<Id>{ productList[0].Id },
                    null,
                    null,
                    false,
                    false
                );
                // Lookup the webstore ID associated with the community
                List<CartDeliveryGroup> cartDeliveryGroupList = [SELECT Id FROM CartDeliveryGroup WHERE CartId = :cartSummaryObject.CartId LIMIT 200];

                //BS-1689 :  Added Below logic to check the order type and on basis of it whether the frame prices whould be excluded is decided
                List<String> framePricesToBeExcludedForTheseOrderTypesValuesList = System.Label.B2B_VS_RX_FRAME_PRICES_TO_BE_EXCLUDED_ORDER_TYPE_VALUES.split(
                    ','
                );
                Boolean framePriceToBeExcluded = false;
                for (String framePricesToBeExcludedOrderType : framePricesToBeExcludedForTheseOrderTypesValuesList) {
                    if (
                        configuratorList.isEmpty() == false &&
                        configuratorList[0].B2B_Order_Type__c != null &&
                        configuratorList[0].B2B_Order_Type__c.equalsIgnoreCase(framePricesToBeExcludedOrderType)
                    ) {
                        framePriceToBeExcluded = true;
                    }
                }
                //BS-1689 : End
                if (cartDeliveryGroupList.isEmpty() == false && productDetails != null && cartSummaryObject != null) {
                    cartItemObj.CartId = cartSummaryObject.CartId;
                    cartItemObj.CurrencyIsoCode = cartSummaryObject.CurrencyIsoCode;
                    cartItemObj.CartDeliveryGroupId = cartDeliveryGroupList[0].Id;
                    //BS-1689 : Added Extra Condition - framePriceToBeExcluded == false to every field
                    cartItemObj.ListPrice = framePriceToBeExcluded == false &&
                        productDetails.products[0].prices.listPrice != null
                        ? Decimal.valueOf(productDetails.products[0].prices.listPrice)
                        : null;
                    cartItemObj.GrossUnitPrice = framePriceToBeExcluded == false &&
                        productDetails.products[0].prices.unitPrice != null
                        ? Decimal.valueOf(productDetails.products[0].prices.unitPrice)
                        : null;
                    cartItemObj.NetUnitPrice = framePriceToBeExcluded == false &&
                        productDetails.products[0].prices.unitPrice != null
                        ? Decimal.valueOf(productDetails.products[0].prices.unitPrice)
                        : null;
                    cartItemObj.SalesPrice = framePriceToBeExcluded == false &&
                        productDetails.products[0].prices.unitPrice != null
                        ? Decimal.valueOf(productDetails.products[0].prices.unitPrice)
                        : null;
                    cartItemObj.TotalLineAmount = framePriceToBeExcluded == false &&
                        productDetails.products[0].prices.unitPrice != null
                        ? Decimal.valueOf(productDetails.products[0].prices.unitPrice)
                        : null;
                    cartItemObj.TotalListPrice = framePriceToBeExcluded == false &&
                        productDetails.products[0].prices.unitPrice != null
                        ? Decimal.valueOf(productDetails.products[0].prices.unitPrice)
                        : null;
                    cartItemObj.TotalPrice = framePriceToBeExcluded == false &&
                        productDetails.products[0].prices.unitPrice != null
                        ? Decimal.valueOf(productDetails.products[0].prices.unitPrice)
                        : null;
                    cartItemObj.UnitAdjustedPrice = framePriceToBeExcluded == false &&
                        productDetails.products[0].prices.unitPrice != null
                        ? Decimal.valueOf(productDetails.products[0].prices.unitPrice)
                        : null;
                    cartItemObj.TotalPriceAfterAllAdjustments = framePriceToBeExcluded == false &&
                        productDetails.products[0].prices.unitPrice != null
                        ? Decimal.valueOf(productDetails.products[0].prices.unitPrice)
                        : null;
                    //BS-1689 : End
                    cartItemObj.Sku = productDetails.products[0].sku;
                    if (pageSource == B2B_Constants.BRAND_RX) {
                        cartItemObj.B2B_Type__c = B2B_Constants.RX_GLAZING;
                    } else {
                        cartItemObj.B2B_Type__c = B2B_Constants.VISION_SENSATION;
                    } //BS-1471
                    cartItemObj.B2B_Type__c = B2B_Constants.RX_GLAZING;
                    cartItemObj.Name = productDetails.products[0].fields.get(B2B_Constants.NAME);
                    cartItemObj.Product2Id = productDetails.products[0].prices.productId;
                    cartItemObj.Type = B2B_Constants.PRODUCT;
                    cartItemObj.Quantity = 1;
                    //BS-2355 start
                    if (
                        (cartItemObj.unitAdjustedPrice != null && cartItemObj.unitAdjustedPrice < 0) ||
                        (cartItemObj.totalPrice != null &&
                        cartItemObj.totalPrice < 0)
                    ) {
                        cartItemObj.TotalPrice = 0;
                        cartItemObj.TotalPriceAfterAllAdjustments = 0;
                        cartItemObj.UnitAdjustedPrice = 0;
                        cartItemObj.NetUnitPrice = 0;
                        cartItemObj.SalesPrice = 0;
                        cartItemObj.GrossUnitPrice = 0;
                    }
                    //BS-2355 end
                    insert cartItemObj;
                }
            }
            return cartItemObj;
        } else {
            return null;
        }
    }

    /**
     * @description This method will create a cart item record.
     * BS-728
     * @author Vishalsingh G
     */
    @AuraEnabled
    public static Boolean createCartItemsForVSRX(
        String cartId,
        String parentCartItemId,
        String lensConfiguratorId,
        String accountId,
        String storeName,
        Boolean globalEntitlementApplicable,
        Integer applicableLensQuantity, //BS-1494
        String communityId
    ) {
        Integer applicableDefaultQuantity = 1; //BS-1494
        Map<String, String> cartItemTypeVSproductSKUMap = new Map<String, String>(); //BS-1494
        Boolean customCartItemsCreated = false;
        String rxSolutionProductSku;
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);
        try {
            if (String.isNotBlank(cartId) && String.isNotBlank(parentCartItemId) && String.isNotBlank(lensConfiguratorId)) {
                //BS-1245
                String currencyCode;
                for (WebCart webCart : [SELECT Id, CurrencyIsoCode FROM WebCart WHERE Id = :cartId]) {
                    if (String.isNotBlank(webCart.CurrencyIsoCode)) {
                        currencyCode = webCart.CurrencyIsoCode;
                    }
                }
                //BS-1245

                String applicableStore;
                if (storeName.equalsIgnoreCase(B2B_Constants.SILHOUETTE_BRAND)) {
                    applicableStore = B2B_Constants.VISION_SENSATION;
                } else if (storeName.equalsIgnoreCase(B2B_Constants.EVIL_EYE_BRAND)) {
                    applicableStore = B2B_Constants.RX_GLAZING;
                }

                List<B2B_Lens_Configurator__c> configuratorList = new List<B2B_Lens_Configurator__c>();
                configuratorList = [
                    SELECT
                        Id,
                        B2B_Selected_Frame__c,
                        B2B_Selected_Lens_SKU__c,
                        B2B_Selected_RX_Solution_SKU__c,
                        B2B_Selected_Accent_Ring__c,
                        B2B_Antireflection_SKU__c,
                        B2B_Hard_Coating_SKU__c,
                        B2B_Antireflection_Product__c, // BS-1522
                        B2B_Hard_Coating_Product__c, //BS-1522
                        B2B_LensHandling_SKU__c,
                        B2B_Selected_Accent_Ring_Product__c,
                        B2B_Selected_Color_Groove_Product__c,
                        B2B_Lens_Color_Id__c,
                        B2B_Photo_Sensation__c,
                        B2B_Blue_Sensation__c, //BS-1471
                        B2B_Lens_Color_Id__r.StockKeepingUnit, //BS-1495 start
                        B2B_Photo_Sensation__r.StockKeepingUnit,
                        B2B_Blue_Sensation__r.StockKeepingUnit,
                        B2B_Selected_Color_Groove_Product__r.StockKeepingUnit,
                        B2B_Antireflection_Product__r.StockKeepingUnit,
                        B2B_Hard_Coating_Product__r.StockKeepingUnit, //BS-1495 end
                        B2B_Evil_Eye_Edge__c, //BS-1785
                        B2B_S_Graving__c //BS-1796
                    FROM B2B_Lens_Configurator__c
                    WHERE Id = :lensConfiguratorId
                ];

                Set<Id> productIdSet = new Set<Id>(); //BS-1522
                Set<String> lensAndLensRelatedProductSkuSet = new Set<String>(); //BS-1495

                if (configuratorList.isEmpty() == false && (String.isNotBlank(configuratorList[0].B2B_Antireflection_SKU__c))) {
                    cartItemTypeVSproductSKUMap.put(B2B_Constants.ANTIRELECTION_SKU, configuratorList[0].B2B_Antireflection_SKU__c);
                }
                if (configuratorList.isEmpty() == false && (String.isNotBlank(configuratorList[0].B2B_Hard_Coating_SKU__c))) {
                    cartItemTypeVSproductSKUMap.put(B2B_Constants.HARDCOATING_SKU, configuratorList[0].B2B_Hard_Coating_SKU__c);
                }
                //BS-1522
                if (configuratorList.isEmpty() == false && (String.isNotBlank(configuratorList[0].B2B_Antireflection_Product__c))) {
                    productIdSet.add(configuratorList[0].B2B_Antireflection_Product__c);
                    cartItemTypeVSproductSKUMap.put(B2B_Constants.ANTIRELECTION_SKU, configuratorList[0].B2B_Antireflection_SKU__c);
                    lensAndLensRelatedProductSkuSet.add(configuratorList[0].B2B_Antireflection_Product__r.StockKeepingUnit); //BS-1495
                }
                if (configuratorList.isEmpty() == false && (String.isNotBlank(configuratorList[0].B2B_Hard_Coating_Product__c))) {
                    productIdSet.add(configuratorList[0].B2B_Hard_Coating_Product__c);
                    cartItemTypeVSproductSKUMap.put(B2B_Constants.HARDCOATING_SKU, configuratorList[0].B2B_Hard_Coating_SKU__c);
                    lensAndLensRelatedProductSkuSet.add(configuratorList[0].B2B_Hard_Coating_Product__r.StockKeepingUnit); //BS-1495
                }
                if (configuratorList.isEmpty() == false && (String.isNotBlank(configuratorList[0].B2B_Lens_Color_Id__c))) {
                    productIdSet.add(configuratorList[0].B2B_Lens_Color_Id__c);
                    lensAndLensRelatedProductSkuSet.add(configuratorList[0].B2B_Lens_Color_Id__r.StockKeepingUnit); //BS-1495
                }
                if (configuratorList.isEmpty() == false && (String.isNotBlank(configuratorList[0].B2B_Photo_Sensation__c))) {
                    productIdSet.add(configuratorList[0].B2B_Photo_Sensation__c);
                    lensAndLensRelatedProductSkuSet.add(configuratorList[0].B2B_Photo_Sensation__r.StockKeepingUnit); //BS-1495
                }
                if (configuratorList.isEmpty() == false && (String.isNotBlank(configuratorList[0].B2B_Blue_Sensation__c))) {
                    productIdSet.add(configuratorList[0].B2B_Blue_Sensation__c);
                    lensAndLensRelatedProductSkuSet.add(configuratorList[0].B2B_Blue_Sensation__r.StockKeepingUnit); //BS-1495
                }
                if (configuratorList.isEmpty() == false && (String.isNotBlank(configuratorList[0].B2B_Selected_Color_Groove_Product__c))) {
                    productIdSet.add(configuratorList[0].B2B_Selected_Color_Groove_Product__c);
                    lensAndLensRelatedProductSkuSet.add(configuratorList[0].B2B_Selected_Color_Groove_Product__r.StockKeepingUnit); //BS-1495
                }

                Set<String> stockKeepingUnitSet = new Set<String>();

                if (productIdSet.isEmpty() == false) {
                    for (Product2 product : [SELECT Id, B2B_Schneider_SKU__c, StockKeepingUnit FROM Product2 WHERE Id IN :productIdSet]) {
                        stockKeepingUnitSet.add(product.StockKeepingUnit);
                    }
                }
                //BS-1522

                Set<String> applicableSKUSet = new Set<String>(); //BS-1454
                for (B2B_Lens_Configurator__c lensConfigurator : configuratorList) {
                    if (String.isNotBlank(lensConfigurator.B2B_Selected_Lens_SKU__c)) {
                        applicableSKUSet.add(lensConfigurator.B2B_Selected_Lens_SKU__c);
                        cartItemTypeVSproductSKUMap.put(B2B_Constants.LENS_SKU, lensConfigurator.B2B_Selected_Lens_SKU__c); //BS-1494
                        lensAndLensRelatedProductSkuSet.add(lensConfigurator.B2B_Selected_Lens_SKU__c); //BS-1495
                    }
                    if (String.isNotBlank(lensConfigurator.B2B_Selected_RX_Solution_SKU__c)) {
                        rxSolutionProductSku = lensConfigurator.B2B_Selected_RX_Solution_SKU__c;
                        cartItemTypeVSproductSKUMap.put(B2B_Constants.SELECTED_RX_SOLUTION_SKU_KEY, lensConfigurator.B2B_Selected_RX_Solution_SKU__c); //BS-1494
                    }
                    if (String.isNotBlank(lensConfigurator.B2B_Selected_Accent_Ring__c)) {
                        applicableSKUSet.add(lensConfigurator.B2B_Selected_Accent_Ring__c);
                        cartItemTypeVSproductSKUMap.put(B2B_Constants.ACCENT_RINGS_SKU, lensConfigurator.B2B_Selected_Accent_Ring__c); //BS-1494
                    }
                    if (String.isNotBlank(lensConfigurator.B2B_LensHandling_SKU__c)) {
                        applicableSKUSet.add(lensConfigurator.B2B_LensHandling_SKU__c);
                        cartItemTypeVSproductSKUMap.put(B2B_Constants.LENS_HANDLING_SKU, lensConfigurator.B2B_LensHandling_SKU__c); //BS-1494
                    }
                    if (applicableStore == B2B_Constants.RX_GLAZING && lensConfigurator.B2B_Evil_Eye_Edge__c == true) {
                        applicableSKUSet.add(System.Label.B2B_RX_EVIL_EYE_EDGE_PRODUCT_SKU);
                    } //BS-1785
                    if (applicableStore == B2B_Constants.VISION_SENSATION && lensConfigurator.B2B_S_Graving__c == true) {
                        applicableSKUSet.add(System.Label.B2B_VS_SGRAVING_SKU);
                    } //BS-1796
                }

                applicableSKUSet.addAll(stockKeepingUnitSet);

                /* Logic to populate the main products's B2B_type on CartItem object created initially
                 (i.e if main product belongs to Vision Sensation or RX Glazing)*/

                CartItem parentCartItem = new CartItem(Id = parentCartItemId, B2B_Type__c = applicableStore);
                update parentCartItem;
                /* End Logic to populate main products's B2B_type */

                List<BuyerGroupMember> buyerGroupMembersList = new List<BuyerGroupMember>();
                Set<String> buyerGroupIdSet = new Set<String>();
                Map<String, Object> buyerGroupBindVariablesMap = new Map<String, Object>{
                    'applicableStoreType' => applicableStore,
                    'accountOfCurrentUser' => accountId
                };
                String query = 'SELECT Id, Name, BuyerGroupId, BuyerId FROM BuyerGroupMember WHERE Buyer.Id =:accountOfCurrentUser';
                buyerGroupMembersList = Database.queryWithBinds(query, buyerGroupBindVariablesMap, AccessLevel.SYSTEM_MODE);
                if (buyerGroupMembersList.isEmpty() == false) {
                    for (BuyerGroupMember buyerGroupMember : buyerGroupMembersList) {
                        buyerGroupIdSet.add(buyerGroupMember.BuyerGroupId);
                    }

                    //BS-1630 : Updated logic to fetch pricebooks that are assigned to buyer groups
                    List<BuyerGroupPricebook> buyerGroupAndPricebookList = new List<BuyerGroupPricebook>();
                    buyerGroupAndPricebookList = [
                        SELECT Id, Name, BuyerGroup.name, BuyerGroupId, Pricebook2.name, Pricebook2Id
                        FROM BuyerGroupPricebook
                        WHERE BuyerGroupId IN :buyerGroupIdSet
                    ];
                    Set<Id> priceBookIdSet = new Set<Id>();
                    if (buyerGroupAndPricebookList.isEmpty() == false) {
                        for (BuyerGroupPricebook buyerGroupPricebookObj : buyerGroupAndPricebookList) {
                            priceBookIdSet.add(buyerGroupPricebookObj.Pricebook2Id);
                        }
                        List<PricebookEntry> pricebookEntryList = new List<PricebookEntry>();
                        //BS-1630 : Modified the logic to fetch pricebookentries matching with provided pricebooks, products and correncyIsoCode
                        pricebookEntryList = [
                            SELECT Id, Name, Pricebook2Id, Product2Id, Product2.name, Product2.StockKeepingUnit, UnitPrice
                            FROM PricebookEntry
                            WHERE Pricebook2Id IN :priceBookIdSet AND Product2.StockKeepingUnit IN :applicableSKUSet AND CurrencyIsoCode = :currencyCode
                        ];
                        Map<String, PricebookEntry> productSkuVSPricebookEntryMap = new Map<String, PricebookEntry>();
                        for (PricebookEntry pricebookEntry : pricebookEntryList) {
                            productSkuVSPricebookEntryMap.put(pricebookEntry.Product2.StockKeepingUnit, pricebookEntry);
                        }
                        List<B2B_CartItems__c> cartItemsTobeCreatedList = new List<B2B_CartItems__c>();
                        Set<String> missingPriceBookEntryProductSet = new Set<String>();
                        if (rxSolutionProductSku != null) {
                            List<Product2> productList = [SELECT Id, Name FROM Product2 WHERE StockKeepingUnit = :rxSolutionProductSku LIMIT 1];
                            if (productList.isEmpty() == false) {
                                ConnectApi.ProductPrice productPriceObject = commerceProxy.getProductPrice(webstoreId, productList[0].id, accountId);
                                if (productPriceObject.UnitPrice != null) {
                                    B2B_CartItems__c b2bCartItem = new B2B_CartItems__c();
                                    b2bCartItem.B2B_Cart__c = cartId;
                                    b2bCartItem.B2B_Parent_Cart_Item__c = parentCartItemId;
                                    b2bCartItem.Name = productList[0].Name != null ? productList[0].Name : null;
                                    b2bCartItem.B2B_Product__c = productList[0].id;
                                    b2bCartItem.B2B_List_Price__c = productPriceObject.UnitPrice != null ? Decimal.valueOf(productPriceObject.UnitPrice) : null;
                                    b2bCartItem.B2B_Unit_Price__c = productPriceObject.UnitPrice != null ? Decimal.valueOf(productPriceObject.UnitPrice) : null;
                                    b2bCartItem.B2B_Quantity__c = applicableDefaultQuantity;
                                    b2bCartItem.B2B_Type__c = applicableStore; //Populating the brand on custom cartItem
                                    //BS-1245
                                    if (String.isNotBlank(currencyCode)) {
                                        b2bCartItem.CurrencyIsoCode = currencyCode;
                                    }
                                    //BS-1245
                                    cartItemsTobeCreatedList.add(b2bCartItem);
                                } else {
                                    missingPriceBookEntryProductSet.add(rxSolutionProductSku);
                                }
                            }
                        }
                        for (String productSKU : applicableSKUSet) {
                            if (productSkuVSPricebookEntryMap.containsKey(productSKU)) {
                                B2B_CartItems__c b2bCartItem = new B2B_CartItems__c();
                                b2bCartItem.B2B_Cart__c = cartId;
                                b2bCartItem.B2B_Parent_Cart_Item__c = parentCartItemId;
                                b2bCartItem.Name = productSkuVSPricebookEntryMap.containsKey(productSKU)
                                    ? productSkuVSPricebookEntryMap.get(productSKU).Product2.name
                                    : null;
                                b2bCartItem.B2B_Product__c = productSkuVSPricebookEntryMap.containsKey(productSKU)
                                    ? productSkuVSPricebookEntryMap.get(productSKU).Product2Id
                                    : null;

                                //BS-1494 - Start
                                Integer appliedLensQuantity;
                                if (
                                    applicableStore == B2B_Constants.RX_GLAZING &&
                                    cartItemTypeVSproductSKUMap.containsKey(B2B_Constants.LENS_SKU) &&
                                    cartItemTypeVSproductSKUMap.get(B2B_Constants.LENS_SKU) != null &&
                                    cartItemTypeVSproductSKUMap.get(B2B_Constants.LENS_SKU) == productSKU
                                ) {
                                    appliedLensQuantity = applicableLensQuantity != null ? applicableLensQuantity : applicableDefaultQuantity;
                                } else if (applicableStore == B2B_Constants.VISION_SENSATION && lensAndLensRelatedProductSkuSet.contains(productSKU)) {
                                    appliedLensQuantity = applicableLensQuantity != null ? applicableLensQuantity : applicableDefaultQuantity; //BS-1495
                                } else {
                                    appliedLensQuantity = applicableDefaultQuantity;
                                }
                                b2bCartItem.B2B_Quantity__c = appliedLensQuantity != null ? appliedLensQuantity : 1;
                                b2bCartItem.B2B_List_Price__c = productSkuVSPricebookEntryMap.containsKey(productSKU) &&
                                    productSkuVSPricebookEntryMap.get(productSKU) != null &&
                                    productSkuVSPricebookEntryMap.get(productSKU).UnitPrice != null
                                    ? productSkuVSPricebookEntryMap.get(productSKU).UnitPrice * (appliedLensQuantity)
                                    : null;
                                b2bCartItem.B2B_Unit_Price__c = productSkuVSPricebookEntryMap.containsKey(productSKU) &&
                                    productSkuVSPricebookEntryMap.get(productSKU) != null &&
                                    productSkuVSPricebookEntryMap.get(productSKU).UnitPrice != null
                                    ? productSkuVSPricebookEntryMap.get(productSKU).UnitPrice * (appliedLensQuantity)
                                    : null;
                                //BS-1494 - End
                                b2bCartItem.B2B_Type__c = applicableStore; //Populating the brand on custom cartItem
                                //BS-1245
                                if (String.isNotBlank(currencyCode)) {
                                    b2bCartItem.CurrencyIsoCode = currencyCode;
                                }
                                //BS-2355
                                if (
                                    (b2bCartItem.B2B_Unit_Price__c != null && b2bCartItem.B2B_Unit_Price__c < 0) ||
                                    (b2bCartItem.B2B_List_Price__c != null &&
                                    b2bCartItem.B2B_List_Price__c < 0)
                                ) {
                                    b2bCartItem.B2B_Unit_Price__c = 0;
                                    b2bCartItem.B2B_List_Price__c = 0;
                                }
                                //BS-1245
                                cartItemsTobeCreatedList.add(b2bCartItem);
                            } else {
                                missingPriceBookEntryProductSet.add(productSKU);
                            }
                        }

                        if (rxSolutionProductSku != null) {
                            applicableSKUSet.add(rxSolutionProductSku);
                        }

                        if (applicableSKUSet.size() == cartItemsTobeCreatedList.size()) {
                            Database.SaveResult[] results = Database.insert(cartItemsTobeCreatedList, true);
                            for (Database.SaveResult result : results) {
                                if (result.isSuccess()) {
                                    customCartItemsCreated = true;
                                } else if (result.isSuccess() == false) {
                                    customCartItemsCreated = false;
                                    break;
                                }
                            }
                            if (customCartItemsCreated == false) {
                                B2B_CommerceLog__c commerceLog = B2B_LogUtils.createInfoLog(
                                    'Error While creating cart items for product SKUs: ' + applicableSKUSet,
                                    'B2B_VisionSensation_RX_Controller.createCartItemsForVSRX',
                                    lensConfiguratorId
                                );
                                insert commerceLog;
                                if (String.isNotBlank(parentCartItemId)) {
                                    delete new CartItem(Id = parentCartItemId);
                                }
                            }
                        } else {
                            customCartItemsCreated = false;
                            B2B_CommerceLog__c commerceLog = B2B_LogUtils.createInfoLog(
                                'Custom Cart Items Creation failed due to Pricebook Entry is missing for product SKUs: ' +
                                missingPriceBookEntryProductSet +
                                '. In Either of these PriceBooks: ' +
                                priceBookIdSet,
                                'B2B_VisionSensation_RX_Controller.createCartItemsForVSRX',
                                lensConfiguratorId
                            );
                            insert commerceLog;
                            if (String.isNotBlank(parentCartItemId)) {
                                delete new CartItem(Id = parentCartItemId);
                            }
                        }
                    }
                } else {
                    //BS-974 : Added Safety check
                    if (String.isNotBlank(parentCartItemId)) {
                        delete new CartItem(Id = parentCartItemId);
                    }
                }
            }
            return customCartItemsCreated;
        } catch (Exception exceptionInstance) {
            //BS-974 : Added Safety check
            if (String.isNotBlank(parentCartItemId)) {
                delete new CartItem(Id = parentCartItemId);
            }
            B2B_CommerceLog__c commerceLog = B2B_LogUtils.createInfoLog(
                exceptionInstance.getMessage(),
                'B2B_VisionSensation_RX_Controller',
                +lensConfiguratorId
            );
            insert commerceLog;
            throw new AuraHandledException('Error during custom cart item creation ' + exceptionInstance.getMessage());
        }
    }

    /**
     * @description This method will get the value of mounting type and Size.
     * BS-728
     * @author Vishalsingh G
     */
    @AuraEnabled
    public static String getFieldValue(
        List<B2B_Lens_Shapes__c> lensShapeList,
        Boolean isMountingType,
        List<B2B_Lens_Configurator__c> lensConfiguratorDataList,
        Map<String, Product2> productSKUVSProductMap,
        Boolean isDirectGlazing
    ) {
        String fieldValue;
        List<String> modelValuesList = new List<String>();
        for (B2B_Lens_Shapes__c lensShape : lensShapeList) {
            if (lensShape.B2B_Model__c != null) {
                modelValuesList = lensShape.B2B_Model__c.split(';');
                if (
                    isMountingType == true &&
                    modelValuesList.contains(productSKUVSProductMap.get(lensConfiguratorDataList[0].B2B_Selected_Frame__c).B2B_Model__c.toUppercase())
                ) {
                    fieldValue = lensShape.B2B_Mounting_Type__c;
                } else if (
                    isDirectGlazing == true &&
                    modelValuesList.contains(productSKUVSProductMap.get(lensConfiguratorDataList[0].B2B_Selected_Frame__c).B2B_Model__c.toUppercase())
                ) {
                    fieldValue = lensShape.B2B_Size__c;
                } else if (
                    modelValuesList.contains(productSKUVSProductMap.get(lensConfiguratorDataList[0].B2B_Selected_Lens_SKU__c).B2B_Model__c.toUppercase())
                ) {
                    fieldValue = lensShape.B2B_Size__c;
                }
            }
        }
        return fieldValue;
    }

    /**
     * @description This method is used to perform schneider callout
     * BS-727
     * Modified as part of BS-1244 (Added leftValue and rightValue attributes)
     * @author Chirag L
     * @param  recordId             :   lens configuratorId
     * @param  applicableBrand      :   brand VS or RX
     * @param  applicableLanguage   :   current language of user
     * @param  leftValue            :   Thickness matching calculator left value
     * @param  rightValue           :   Thickness matching calculator right value
     * @return schneiderResponse    :   response obtained from Schneider callout
     */
    @AuraEnabled
    public static B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper performSchneiderCallout(
        String recordId,
        String applicableBrand,
        String applicableLanguage,
        String leftValue,
        String rightValue,
        Boolean blending //BS-572 : Added blending as parameter that represents Evil Eye Edge selection by user
    ) {
        B2B_VisionSensationUtility.B2B_SchneiderResponse schneiderResponse = new B2B_VisionSensationUtility.B2B_SchneiderResponse();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper schneiderCalloutResponseWrapper = new B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper();
        try {
            if (String.isNotBlank(recordId) && String.isNotBlank(applicableBrand)) {
                B2B_VisionSensationUtility.B2B_SchneiderRequest schneiderRequest = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
                schneiderRequest = constructLensConfiguratorData(recordId, applicableBrand, applicableLanguage, leftValue, rightValue, blending); //BS-572 : Added blending parameter
                if (schneiderRequest != null) {
                    B2B_VisionSensationUtility utility = new B2B_VisionSensationUtility();
                    //BS-1248 - Start
                    schneiderCalloutResponseWrapper = utility.performSchneiderCallout(schneiderRequest);
                    B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedSchneiderCalloutResponseWrapper = new B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper();
                    parsedSchneiderCalloutResponseWrapper = B2B_Utils.performSchneiderCalloutProcessing(schneiderCalloutResponseWrapper, recordId);
                    return schneiderCalloutResponseWrapper;
                    //BS-1248 - End
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (Exception exceptionInstance) {
            B2B_CommerceLog__c commerceLog = B2B_LogUtils.createInfoLog(
                exceptionInstance.getMessage(),
                'B2B_VisionSensation_RX_Controller.performSchneiderCallout',
                recordId
            );
            insert commerceLog;
            throw new AuraHandledException('Error while performing schneider callout Please Check Commerce Log' + 'Error :' + exceptionInstance.getMessage());
        }
    }

    /**
     * BS-821
     * @description this method will return the wrapper of picklist API name and Label
     */
    @AuraEnabled(cacheable=false)
    public static List<B2B_PicklistDataWraper> getPicklistValues() {
        List<B2B_PicklistDataWraper> picklistWrapperList = new List<B2B_PicklistDataWraper>();
        //Global describe call for storing the sobject data.
        Map<String, Schema.SObjectField> sObjectNameVsFieldMap = Schema.getGlobalDescribe()
            .get(B2B_Constants.PRODUCT_OBJECT_API_NAME)
            .getDescribe()
            .fields.getMap();
        String fieldLabel;
        String fieldName;
        Schema.DisplayType picklistType;
        Schema.DescribeFieldResult fieldResult;
        List<Schema.PicklistEntry> picklistEntryList;
        for (Schema.FieldSetMember field : SObjectType.Product2.FieldSets.Product_Search_Query_Attributes.getFields()) {
            picklistType = sObjectNameVsFieldMap.get(field.getFieldPath()).getDescribe().getType(); // or getSOAPType()
            if (String.valueOf(picklistType) == 'MULTIPICKLIST' || String.valueOf(picklistType) == 'PICKLIST') {
                fieldResult = sObjectNameVsFieldMap.get(field.getFieldPath()).getDescribe();
                picklistEntryList = fieldResult.getPicklistValues();
                for (Schema.PicklistEntry pickListVal : picklistEntryList) {
                    B2B_PicklistDataWraper picklistWrapper = new B2B_PicklistDataWraper();
                    picklistWrapper.fieldApiName = field.getFieldPath();
                    picklistWrapper.picklistApiName = pickListVal.getValue();
                    picklistWrapper.picklistValue = pickListVal.getLabel();
                    picklistWrapperList.add(picklistWrapper);
                }
            }
        }
        return picklistWrapperList;
    }

    /**
     * @description This method is used to store lens calculations obtained from Schneider callout to database in case of user click's on NEXT insted of 'PREVIEW AND NEXT' button on UI
     * BS-1244
     * @author Chirag L
     * @param  recordId                 :   lens configuratorId
     * @param  schneiderResponse        :   response obtained from Schneider callout
     */
    public static void saveLensCalculationsToLensConfigurator(String recordId, B2B_VisionSensationUtility.B2B_SchneiderResponse schneiderResponse) {
        if (schneiderResponse != null && String.isNotBlank(recordId)) {
            if (recordId != null) {
                List<ContentVersion> contentVersionList = new List<ContentVersion>();
                Map<String, String> lensVsImageMap = new Map<String, String>();
                List<B2B_Lens_Configurator__c> configuratorToUpdateList = new List<B2B_Lens_Configurator__c>();
                for (
                    B2B_Lens_Configurator__c configuratorInstance : [
                        SELECT
                            Id,
                            B2B_Weight_Right__c,
                            B2B_Weight_Left_Lens__c,
                            B2B_Axis_Min_Right_Lens__c,
                            B2B_Axis_Min_Left_Lens__c,
                            B2B_Axis_Max_Right_Lens__c,
                            B2B_Axis_Max_Left_Lens__c,
                            B2B_Center_Thickness_Right_Lens__c,
                            B2B_Center_Thickness_Left_Lens__c,
                            B2B_Min_thickness_border_Right_Lens__c,
                            B2B_Min_thickness_border_Left_Lens__c,
                            B2B_Max_Border_Thickess_Right_Lens__c,
                            B2B_Max_Border_Thickess_Left_Lens__c,
                            B2B_Right_Lens_Image_SRC__c,
                            B2B_Left_Lens_Image_SRC__c,
                            B2B_Thickness_Matching_Calculator_Right__c,
                            B2B_Thickness_Matching_Calculator_Left__c,
                            B2B_Weight_Right_Lens_Adjusted__c,
                            B2B_Weight_Left_Lens_Adjusted__c,
                            B2B_Axis_Minimum_Right_Lens_Adjusted__c,
                            B2B_Axis_Min_Left_Lens_Adjusted__c,
                            B2B_Axis_Max_Right_Lens_Adjusted__c,
                            B2B_Axis_Max_Left_Lens_Adjusted__c,
                            B2B_Center_Thickness_Right_Lens_Adjusted__c,
                            B2B_Center_Thickness_Left_Lens_Adjusted__c,
                            B2B_Min_thickness_border_Right_Adjusted__c,
                            B2B_Min_thickness_border_Lens_Adjusted__c,
                            B2B_Max_Border_Thickness_Right_Adjusted__c,
                            B2B_Max_Border_Thickness_Left_Adjusted__c,
                            B2B_Final_PreCalcGuid__c //BS-1439
                        FROM B2B_Lens_Configurator__c
                        WHERE Id = :recordId
                    ]
                ) {
                    configuratorInstance.B2B_Weight_Right__c = schneiderResponse.right != null &&
                        schneiderResponse.right.weight != null
                        ? Double.valueOf(schneiderResponse.right.weight)
                        : null;
                    configuratorInstance.B2B_Weight_Left_Lens__c = schneiderResponse.left != null &&
                        schneiderResponse.left.weight != null
                        ? Double.valueOf(schneiderResponse.left.weight)
                        : null;
                    configuratorInstance.B2B_Axis_Min_Right_Lens__c = schneiderResponse.right != null &&
                        schneiderResponse.right.edge != null &&
                        schneiderResponse.right.edge.axisMin != null
                        ? Double.valueOf(schneiderResponse.right.edge.axisMin)
                        : null;
                    configuratorInstance.B2B_Axis_Min_Left_Lens__c = schneiderResponse.left != null &&
                        schneiderResponse.left.edge != null &&
                        schneiderResponse.left.edge.axisMin != null
                        ? Double.valueOf(schneiderResponse.left.edge.axisMin)
                        : null;
                    configuratorInstance.B2B_Axis_Max_Right_Lens__c = schneiderResponse.right != null &&
                        schneiderResponse.right.edge != null &&
                        schneiderResponse.right.edge.axisMax != null
                        ? Double.valueOf(schneiderResponse.right.edge.axisMax)
                        : null;
                    configuratorInstance.B2B_Axis_Max_Left_Lens__c = schneiderResponse.left != null &&
                        schneiderResponse.left.edge != null &&
                        schneiderResponse.left.edge.axisMax != null
                        ? Double.valueOf(schneiderResponse.left.edge.axisMax)
                        : null;
                    configuratorInstance.B2B_Center_Thickness_Right_Lens__c = schneiderResponse.right != null &&
                        schneiderResponse.right.centerThickness != null
                        ? Double.valueOf(schneiderResponse.right.centerThickness)
                        : null;
                    configuratorInstance.B2B_Center_Thickness_Left_Lens__c = schneiderResponse.left != null &&
                        schneiderResponse.left.centerThickness != null
                        ? Double.valueOf(schneiderResponse.left.centerThickness)
                        : null;
                    configuratorInstance.B2B_Min_thickness_border_Right_Lens__c = schneiderResponse.right != null &&
                        schneiderResponse.right.edge != null &&
                        schneiderResponse.right.edge.rdMin != null
                        ? Double.valueOf(schneiderResponse.right.edge.rdMin)
                        : null;
                    configuratorInstance.B2B_Min_thickness_border_Left_Lens__c = schneiderResponse.left != null &&
                        schneiderResponse.left.edge != null &&
                        schneiderResponse.left.edge.rdMin != null
                        ? Double.valueOf(schneiderResponse.left.edge.rdMin)
                        : null;
                    configuratorInstance.B2B_Max_Border_Thickess_Right_Lens__c = schneiderResponse.right != null &&
                        schneiderResponse.right.edge != null &&
                        schneiderResponse.right.edge.rdMax != null
                        ? Double.valueOf(schneiderResponse.right.edge.rdMax)
                        : null;
                    configuratorInstance.B2B_Max_Border_Thickess_Left_Lens__c = schneiderResponse.left != null &&
                        schneiderResponse.left.edge != null &&
                        schneiderResponse.left.edge.rdMax != null
                        ? Double.valueOf(schneiderResponse.left.edge.rdMax)
                        : null;
                    configuratorInstance.B2B_Right_Lens_Image_SRC__c = schneiderResponse.right != null &&
                        schneiderResponse.right.images != null &&
                        schneiderResponse.right.images[0] != null
                        ? String.valueOf(B2B_Constants.BASE64_IMAGE_ENCODING_FORMAT + ',' + schneiderResponse.right.images[0])
                        : null;
                    configuratorInstance.B2B_Left_Lens_Image_SRC__c = schneiderResponse.left != null &&
                        schneiderResponse.left.images != null &&
                        schneiderResponse.left.images[0] != null
                        ? String.valueOf(B2B_Constants.BASE64_IMAGE_ENCODING_FORMAT + ',' + schneiderResponse.left.images[0])
                        : null;
                    configuratorInstance.B2B_Final_PreCalcGuid__c = schneiderResponse.silhData != null &&
                        schneiderResponse.silhData.preCalcGuid != null
                        ? String.valueOf(schneiderResponse.silhData.preCalcGuid)
                        : null; //BS-1439
                    configuratorInstance.B2B_Thickness_Matching_Calculator_Right__c = null;
                    configuratorInstance.B2B_Thickness_Matching_Calculator_Left__c = null;
                    configuratorInstance.B2B_Weight_Right_Lens_Adjusted__c = null;
                    configuratorInstance.B2B_Weight_Left_Lens_Adjusted__c = null;
                    configuratorInstance.B2B_Axis_Minimum_Right_Lens_Adjusted__c = null;
                    configuratorInstance.B2B_Axis_Min_Left_Lens_Adjusted__c = null;
                    configuratorInstance.B2B_Axis_Max_Right_Lens_Adjusted__c = null;
                    configuratorInstance.B2B_Axis_Max_Left_Lens_Adjusted__c = null;
                    configuratorInstance.B2B_Center_Thickness_Right_Lens_Adjusted__c = null;
                    configuratorInstance.B2B_Center_Thickness_Left_Lens_Adjusted__c = null;
                    configuratorInstance.B2B_Min_thickness_border_Right_Adjusted__c = null;
                    configuratorInstance.B2B_Min_thickness_border_Lens_Adjusted__c = null;
                    configuratorInstance.B2B_Max_Border_Thickness_Right_Adjusted__c = null;
                    configuratorInstance.B2B_Max_Border_Thickness_Left_Adjusted__c = null;
                    String leftLens = schneiderResponse.right != null &&
                        schneiderResponse.right.images != null &&
                        schneiderResponse.right.images[0] != null
                        ? String.valueOf(schneiderResponse.right.images[0])
                        : null;
                    String rightLens = schneiderResponse.left != null &&
                        schneiderResponse.left.images != null &&
                        schneiderResponse.left.images[0] != null
                        ? String.valueOf(schneiderResponse.left.images[0])
                        : null;

                    if (String.isNotBlank(leftLens) || String.isNotBlank(rightLens)) {
                        if (String.isNotBlank(leftLens)) {
                            lensVsImageMap.put(B2B_Constants.LEFT_LENS_IMAGE, leftLens);
                        }
                        if (String.isNotBlank(rightLens)) {
                            lensVsImageMap.put(B2B_Constants.RIGHT_LENS_IMAGE, rightLens);
                        }
                    }
                    configuratorToUpdateList.add(configuratorInstance);
                }

                for (String image : lensVsImageMap.keySet()) {
                    if (lensVsImageMap.containsKey(image)) {
                        ContentVersion contentVersion = new ContentVersion(
                            versionData = EncodingUtil.base64Decode(lensVsImageMap.get(image)),
                            title = image,
                            pathOnClient = image + '.' + B2B_Constants.CALCULATED_LENS_IMAGE_FORMAT,
                            ContentLocation = B2B_Constants.CONTENT_DOCUMENT_LOCATION,
                            FirstPublishLocationId = recordId
                        );
                        contentVersionList.add(contentVersion);
                    }
                }

                if (contentVersionList.isEmpty() == false) {
                    insert contentVersionList;
                }

                if (configuratorToUpdateList.isEmpty() == false) {
                    update configuratorToUpdateList;
                }
            }
        }
    }

    /**
     * @description This method is used to clear the cart
     * BS-1245
     *
     * @author Chirag L
     * @param  effectiveAccountId   :   Account Id of currently logged in user
     * @return isSuccess            :   boolean indicating the status
     */
    @AuraEnabled
    public static Boolean resetCartForCurrencyMismatch(String effectiveAccountId) {
        Boolean isSuccess = false;
        try {
            if (String.isNotBlank(effectiveAccountId)) {
                List<WebCart> webCartToDeleteList = new List<WebCart>();
                for (WebCart webCart : [
                    SELECT Id, Status, CurrencyIsoCode
                    FROM webcart
                    WHERE AccountId = :effectiveAccountId AND Status = :B2B_Constants.WEB_CART_STATUS_ACTIVE
                ]) {
                    webCartToDeleteList.add(webCart);
                }
                if (webCartToDeleteList.isEmpty() == false) {
                    delete webCartToDeleteList;
                    isSuccess = true;
                }
            }
            return isSuccess;
        } catch (Exception exceptionInstance) {
            throw new AuraHandledException(exceptionInstance.getMessage());
        }
    }

    /**
     * BS-1213
     * @description a method to reset lens configurator on ordertype change
     * @param lensConfiguratorId Id of the lens configurator
     */
    @AuraEnabled
    public static void resetLensConfiguratorDataExceptPrescription(String lensConfiguratorId) {
        List<B2B_Lens_Configurator__c> lensConfiguratorList = new List<B2B_Lens_Configurator__c>();
        if (String.isBlank(lensConfiguratorId) == false) {
            String query = 'SELECT Id,';
            for (Schema.FieldSetMember fieldSetInstance : SObjectType.B2B_Lens_Configurator__c.FieldSets.B2B_Lens_Configurator_Fields_To_Reset.getFields()) {
                query += ' ' + fieldSetInstance.getFieldPath() + ','; //BS-821
            }
            query = query.removeEnd(',');
            query += ' FROM B2B_Lens_Configurator__c WHERE Id =:lensConfiguratorId';
            lensConfiguratorList = Database.query(query);
            if (lensConfiguratorList.isEmpty() == false) {
                // get the SObjectType
                Schema.SObjectType objectType = Schema.getGlobalDescribe().get(B2B_Constants.B2B_LENS_CONFIGURATOR_OBJECT);
                // get the fields on the object
                Map<String, SObjectField> fieldMap = objectType.getDescribe().fields.getMap();
                for (
                    Schema.FieldSetMember fieldSetInstance : SObjectType.B2B_Lens_Configurator__c.FieldSets.B2B_Lens_Configurator_Fields_To_Reset.getFields()
                ) {
                    Schema.SobjectField fieldName = fieldMap.get(fieldSetInstance.getFieldPath());
                    String fielddataType = fieldMap.get(fieldSetInstance.getFieldPath()).getDescribe().getType() + '';
                    if (fielddataType.equalsIgnoreCase(B2B_Constants.BOOLEAN_STRING) == false) {
                        lensConfiguratorList[0].put(fieldSetInstance.getFieldPath(), null);
                    } else {
                        lensConfiguratorList[0].put(fieldSetInstance.getFieldPath(), false);
                    }
                }
                update lensConfiguratorList;
            }
        }
    }

    /**
     * BS-1213
     * @description this method will update a data into lens configurator object's Customer Name, Clerk and Order type
     * @param fieldNameVsLensConfiguratorDataMap: this parameter will get JSON data(which is lens configurator data) which gets from frame details save and next button
     * @param lensConfiguratorId: lens configurator data id which need to update
     */
    @AuraEnabled
    public static void saveOrderInformationData(String lensConfiguratorId, Map<String, Object> fieldNameVsLensConfiguratorDataMap) {
        try {
            if (lensConfiguratorId != null) {
                B2B_Lens_Configurator__c lensConfObj = [
                    SELECT Id, B2B_Customer_Name__c, B2B_Clerk__c, B2B_Order_Type__c
                    FROM B2B_Lens_Configurator__c
                    WHERE Id = :lensConfiguratorId
                ];
                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.CLERK)) {
                    lensConfObj.B2B_Clerk__c = String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.CLERK));
                }
                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.CUSTOMER_NAME)) {
                    lensConfObj.B2B_Customer_Name__c = String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.CUSTOMER_NAME));
                }
                if (fieldNameVsLensConfiguratorDataMap.containsKey(B2B_Constants.ORDER_TYPE)) {
                    lensConfObj.B2B_Order_Type__c = String.valueOf(fieldNameVsLensConfiguratorDataMap.get(B2B_Constants.ORDER_TYPE));
                }
                update lensConfObj;
            }
        } catch (Exception exceptionInstance) {
            B2B_CommerceLog__c commerceLog = B2B_LogUtils.createInfoLog(
                exceptionInstance.getMessage(),
                'B2B_VisionSensation_RX_Controller.performSchneiderCallout',
                ''
            );
            insert commerceLog;
        }
    }

    /**
     * BS-722
     * @description this method will return the list of lens shape records
     * @param frameType: frame type of the product
     * @param modelNumber: model number of the product
     */
    @AuraEnabled
    public static List<B2B_Lens_Shapes__c> getLensShapeData(String frameType, String modelNumber, Boolean showAll, Double bridgeSize) {
        List<B2B_Lens_Shapes__c> lensShapeList = new List<B2B_Lens_Shapes__c>();
        List<B2B_Lens_Shapes__c> initialLensShapeList = new List<B2B_Lens_Shapes__c>(); //BS-2015
        if (String.isNotBlank(frameType) == true && String.isNotBlank(modelNumber) == true) {
            String query = 'SELECT Id, B2B_Shape_Name__c, B2B_Size__c, B2B_Exclusive_Models__c,B2B_Lens_Only_Available__c,B2B_Available_features__c ,B2B_Default_Features__c,B2B_Media_Link__c,B2B_Mounting_Type__c,B2B_OMAShapeKey__c,B2B_Bridge_Size__c  FROM B2B_Lens_Shapes__c WHERE B2B_Frame_Type__c = :frameType AND '; //BS-2015
            if (showAll == false) {
                query =
                    query +
                    '(B2B_Model__c INCLUDES (:modelNumber) OR B2B_Exclusive_Models__c INCLUDES  (:modelNumber)) ORDER BY B2B_Shape_Name__c, B2B_Size__c ASC';
            } else if (showAll == true) {
                query =
                    query +
                    '(B2B_Model__c INCLUDES (:modelNumber) OR B2B_Exclusive_Models__c INCLUDES  (:modelNumber) OR B2B_Exclusive_Models__c = null)  ORDER BY B2B_Shape_Name__c, B2B_Size__c ASC';
            }
            initialLensShapeList = Database.query(query);
            if (initialLensShapeList.isEmpty() == false) {
                for (B2B_Lens_Shapes__c lensShape : initialLensShapeList) {
                    if (lensShape.B2B_Bridge_Size__c != 0 && lensShape.B2B_Bridge_Size__c == bridgeSize) {
                        lensShapeList.add(lensShape);
                    } else if (lensShape.B2B_Bridge_Size__c == null || lensShape.B2B_Bridge_Size__c == 0) {
                        lensShapeList.add(lensShape);
                    }
                }
            } //BS-2015
        }
        return (lensShapeList.isEmpty() == false) ? lensShapeList : null;
    }

    /**
     * BS-722
     * @description this method will return the oma callout response
     * @param lensConfiguratorId: id of the lens configurator
     * @param lensShapeId: lens shape record id
     * @param selectedLensInformationMap : inputs of the selected lens
     * @param calloutType: type of the callout
     */
    @AuraEnabled
    public static B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper getLensShape(
        String lensConfiguratorId,
        String lensShapeId,
        Map<String, Object> selectedLensInformationMap,
        String calloutType
    ) {
        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper omaCalloutWrapperObj = new B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper();
        if (String.isNotBlank(lensShapeId) == true) {
            List<B2B_Lens_Shapes__c> lensShapeList = [
                SELECT Id, B2B_Shape_Name__c, B2B_Size__c, B2B_Mounting_Type__c, B2B_OMAShapeKey__c, B2B_Exclusive_Models__c
                FROM B2B_Lens_Shapes__c
                WHERE Id = :lensShapeId
                LIMIT 1
            ];
            if (lensShapeList.isEmpty() == false) {
                omaCalloutWrapperObj = B2B_VS_OMACalloutUtility.initiateOMAcallout(
                    lensConfiguratorId,
                    lensShapeList[0],
                    selectedLensInformationMap,
                    calloutType
                );
            }
        }
        return omaCalloutWrapperObj != null ? omaCalloutWrapperObj : null;
    }

    /**
     * BS-1473
     * @description this method will return list of accent ring product image
     * @param productId: id of the product
     */
    @AuraEnabled
    public static List<B2B_Product_Image__c> getAccentRingImage(String productId) {
        List<B2B_Product_Image__c> productImageList = new List<B2B_Product_Image__c>();
        if (String.isNotBlank(productId) == true) {
            productImageList = [
                SELECT Id, B2B_Image_URL__c
                FROM B2B_Product_Image__c
                WHERE
                    B2B_Product__c != NULL
                    AND B2B_Product__c = :productId
                    AND D2C_Active__c = TRUE
                    AND D2C_Available_In__c INCLUDES (:B2B_Constants.B2B_FIELD_FORMAT)
                    AND D2C_Product_Image_Type__c = :B2B_Constants.PRODUCT_IMAGE
                ORDER BY B2B_Image_Order__c NULLS LAST
                LIMIT 1
            ];
        }

        return productImageList.isEmpty() == false ? productImageList : null;
    }

    /**
     * BS-1473
     * @description this method will return list of product
     * @param lensShape: variant shape of the product
     * @param lensSize: lens size of the product
     * @param effectiveAccountId added as part of BS-2063 to add entitlement check
     */
    @AuraEnabled
    public static List<Product2> getAccentRingColor(String lensShape, String shapeSize, String effectiveAccountId) {
        List<Product2> productList = new List<Product2>();
        List<Product2> entitlementProductList = new List<Product2>();
        Set<String> productIdSet = new Set<String>();
        Set<String> entitleProductIdSet = new Set<String>();
        if (String.isNotBlank(lensShape) == true && String.isNotBlank(shapeSize)) {
            productList = [
                SELECT Id, B2B_Color_Number__c, B2B_Hexcode__c, StockKeepingUnit, B2B_Frame_Color_Description__c, B2B_Availability_JSON__c
                FROM Product2
                WHERE B2B_Variant_Shape__c = :lensShape AND B2B_Shape_Size__c = :shapeSize AND B2B_Product_Type__c = :B2B_Constants.ACCENT_RING_VALUE_API_NAME
                ORDER BY B2B_Color_Number__c NULLS LAST
            ]; //BS-1902 Undated query condition B2B_Lens_Size__c -> B2B_Shape_Size__c.
        }

        if (productList.isEmpty() == false) {
            for (Product2 product : productList) {
                productIdSet.add(product.Id);
            }
            entitleProductIdSet = getEntitledProductIds(effectiveAccountId, productIdSet);
            if (entitleProductIdSet != null && entitleProductIdSet.isEmpty() == false) {
                for (Product2 product : productList) {
                    if (entitleProductIdSet.contains(product.Id)) {
                        entitlementProductList.add(product);
                    }
                }
            }
        }

        return entitlementProductList.isEmpty() == false ? entitlementProductList : null;
    }
    /**
     * BS-1493
     * @description this method will return list of ProductCategoryproduct
     * @param effectiveAccountId added as part of BS-2063 to add entitlement check
     */
    @AuraEnabled
    public static List<ProductCategoryproduct> getColoredGrooveColor(String effectiveAccountId) {
        List<ProductCategoryproduct> entitlementProductCategoryProductList = new List<ProductCategoryproduct>();
        Set<String> productIdSet = new Set<String>();
        Set<String> entitleProductIdSet = new Set<String>();
        List<ProductCategoryproduct> productCategoryProductList = [
            SELECT
                Id,
                Product.Name,
                Product.B2B_Color_Number__c,
                Product.Id,
                Product.B2B_Hexcode__c,
                ProductCategory.Name,
                Product.StockKeepingUnit,
                Product.B2B_Availability_JSON__c
            FROM ProductCategoryproduct
            WHERE ProductCategory.Name = :B2B_Constants.COLOR_GROOVE_CATEGORY
        ];

        if (productCategoryProductList.isEmpty() == false) {
            for (ProductCategoryproduct productCategoryProduct : productCategoryProductList) {
                productIdSet.add(productCategoryProduct.ProductId);
            }
            entitleProductIdSet = getEntitledProductIds(effectiveAccountId, productIdSet);
            if (entitleProductIdSet != null && entitleProductIdSet.isEmpty() == false) {
                for (ProductCategoryproduct productCategoryProduct : productCategoryProductList) {
                    if (entitleProductIdSet.contains(productCategoryProduct.ProductId)) {
                        entitlementProductCategoryProductList.add(productCategoryProduct);
                    }
                }
            }
        }

        return entitlementProductCategoryProductList.isEmpty() == false ? entitlementProductCategoryProductList : null;
    }

    /**
     * BS-793
     * @description this method will return list of lens shape records.
     */
    @AuraEnabled
    public static List<B2B_Lens_Shapes__c> getLensShapeRecord(String recordId) {
        List<B2B_Lens_Shapes__c> lensShapesList = new List<B2B_Lens_Shapes__c>();
        if (String.isNotBlank(recordId) == true) {
            lensShapesList = [
                SELECT
                    Id,
                    B2B_Shape_Name__c,
                    B2B_Size__c,
                    B2B_Exclusive_Models__c,
                    B2B_Lens_Only_Available__c,
                    B2B_Available_features__c,
                    B2B_Default_Features__c,
                    B2B_Media_Link__c,
                    B2B_Mounting_Type__c
                FROM B2B_Lens_Shapes__c
                WHERE Id = :recordId
                LIMIT 1
            ];
        }
        return lensShapesList.isEmpty() == false ? lensShapesList : null;
    }

    /**
     * BS-722
     * @description this method will return true if the lens configurator is updated with shape selection data
     * @param lensConfiguratorId: id of the lens configurator
     * @param omaCalloutSuccessWrapper: oma callout wrapper object
     * @param userInputMap : user inputs of the selected lens
     * @param calloutType: type of the callout
     */
    @AuraEnabled(cacheable=false)
    public static Boolean saveShapeSelectionData(
        String lensConfiguratorId,
        String omaCalloutSuccessWrapper,
        String omaCalloutSuccessUpdatedWrapper,
        Map<String, Object> userInputMap
    ) {
        Boolean isDataSaved = false;
        if (String.isNotBlank(omaCalloutSuccessWrapper) == true) {
            B2B_VS_OMACalloutUtility.B2B_OMASuccessResponseWrapper successResponseWrapperObj = (B2B_VS_OMACalloutUtility.B2B_OMASuccessResponseWrapper) JSON.deserialize(
                omaCalloutSuccessWrapper,
                B2B_VS_OMACalloutUtility.B2B_OMASuccessResponseWrapper.class
            );
            B2B_VS_OMACalloutUtility.B2B_OMASuccessResponseWrapper successResponseWrapperUpdatedObj;
            if (omaCalloutSuccessUpdatedWrapper != null && String.isNotBlank(omaCalloutSuccessUpdatedWrapper) == true) {
                successResponseWrapperUpdatedObj = (B2B_VS_OMACalloutUtility.B2B_OMASuccessResponseWrapper) JSON.deserialize(
                    omaCalloutSuccessUpdatedWrapper,
                    B2B_VS_OMACalloutUtility.B2B_OMASuccessResponseWrapper.class
                );
            }
            isDataSaved = B2B_VS_OMACalloutUtility.updateLensConfigurator(
                lensConfiguratorId,
                successResponseWrapperObj,
                successResponseWrapperUpdatedObj,
                userInputMap
            );
        }
        return isDataSaved;
    }

    /**
     * BS-1525
     * @description this method will return the data that is required for setting up the VS-RX PLP page
     * @param objectApiName : API Name of the object
     * @param picklistField : API Name of the field
     * @param userInputMap : user inputs of the selected lens
     * @return setupDataWrapper: wrapper containing various data
     */
    @AuraEnabled(cacheable=false)
    public static B2B_SearchResultContainerInitialSetupDataWrapper performInitialSetupOfSearchResultContainer(String objectApiName, String picklistField) {
        B2B_SearchResultContainerInitialSetupDataWrapper setupDataWrapper = new B2B_SearchResultContainerInitialSetupDataWrapper();
        setupDataWrapper.categoryDetailsList = getCategoryDetail(System.Label.B2B_StoreFrontName);
        setupDataWrapper.picklistWrapper = getFieldPicklistValues(objectApiName, picklistField);
        setupDataWrapper.productPicklistDataWrapper = B2B_SearchController.getPicklistValues();
        setupDataWrapper.mapColorCodes = B2B_SearchController.getColorsMetadata();
        return setupDataWrapper;
    }

    @AuraEnabled
    public static List<B2B_Lens_Shapes__c> getLensShapeDataByShapeName(String shapeName, String size, String recordId) {
        List<B2B_Lens_Shapes__c> lensShapeRecord = new List<B2B_Lens_Shapes__c>();
        if (String.isNotBlank(shapeName) == true && String.isNotBlank(size) == true) {
            lensShapeRecord = [
                SELECT Id, B2B_Available_features__c, B2B_Default_Features__c, B2B_Lens_Only_Available__c
                FROM B2B_Lens_Shapes__c
                WHERE B2B_Shape_Name__c = :shapeName AND B2B_Size__c = :size AND Id = :recordId
            ];
        }
        return lensShapeRecord.isEmpty() == false ? lensShapeRecord : null;
    }

    /**
     * BS-1584
     * @description this method will fetch the lens selection screen data to show on read only screen
     *
     */
    @AuraEnabled
    public static B2B_Lens_Configurator__c getLensSelectionScreenData(String recordId) {
        List<B2B_Lens_Configurator__c> lensConfiguratorList = new List<B2B_Lens_Configurator__c>();
        if (String.isNotBlank(recordId) == true) {
            lensConfiguratorList = [
                SELECT
                    Id,
                    B2B_Selected_Lens_Shape__c,
                    toLabel(B2B_Lens_Type__c),
                    B2B_Lens_Index__c,
                    B2B_Selected_Lens_SKU__c,
                    toLabel(B2B_Lens_Material__c),
                    B2B_Lens_Color_Id__c,
                    B2B_Photo_Sensation__r.Id,
                    B2B_Blue_Sensation__r.Id,
                    B2B_Lens_Distance__c,
                    toLabel(B2B_Visual_Preference__c),
                    toLabel(B2B_Lens_Edge__c),
                    toLabel(B2B_Glazing_Type__c),
                    B2B_GlassProductSKU__c,
                    B2B_BlankCoatingSKU__c,
                    Lens_Product__r.Id,
                    B2B_Antireflection_Product__r.Id,
                    B2B_Hard_Coating_Product__r.Id,
                    B2B_Optimized_Facet_Cut__c,
                    B2B_Progression_Length__c,
                    B2B_Lens_Color__c,
                    toLabel(B2B_Lens_Color_Id__r.Description),
                    toLabel(B2B_Photo_Sensation__r.Description),
                    toLabel(B2B_Blue_Sensation__r.Description),
                    toLabel(B2B_Antireflection_Product__r.Description),
                    toLabel(B2B_Hard_Coating_Product__r.Description),
                    B2B_Vision_Zone_Analysis_Code__c,
                    B2B_S_Graving__c //BS-1796
                FROM B2B_Lens_Configurator__c
                WHERE Id = :recordId
                LIMIT 1
            ];
        }
        return lensConfiguratorList.isEmpty() == false ? lensConfiguratorList[0] : null;
    }

    @AuraEnabled(cacheable=false)
    public static B2B_ShapeSelectionDataWrapper getShapeSelectionScreenData(String recordId) {
        List<B2B_Lens_Configurator__c> lensConfiguratorList = new List<B2B_Lens_Configurator__c>();
        if (String.isNotBlank(recordId)) {
            lensConfiguratorList = [
                SELECT
                    Id,
                    B2B_Selected_Lens_Shape__c,
                    B2B_Lens_Shape__c,
                    B2B_Lens_Size__c,
                    B2B_Show_All_Shapes__c,
                    B2B_Order_Type__c,
                    B2B_a__c,
                    B2B_b__c,
                    B2B_b1__c,
                    B2B_b2__c,
                    B2B_blp__c,
                    B2B_SF__c,
                    B2B_Remove_Groove__c,
                    B2B_Accent_Ring__c,
                    B2B_Selected_Accent_Ring_Product__r.B2B_Color_Number__c,
                    B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c,
                    B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c,
                    B2B_Selected_Accent_Ring_Product__r.StockKeepingUnit,
                    B2B_Selected_Accent_Ring_Product__r.Id,
                    B2B_Selected_Accent_Ring_Image__c,
                    B2B_Remove_Drills__c,
                    B2B_Width__c,
                    B2B_OMA_Height__c,
                    B2B_With_Color_Groove__c,
                    B2B_Selected_Color_Groove_Product__r.Name,
                    B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c,
                    B2B_Selected_Color_Groove_Product__r.Id,
                    B2B_Selected_Color_Groove_Product__r.StockKeepingUnit,
                    B2B_Coordinates__c,
                    B2B_Drills__c,
                    B2B_OMA__c,
                    B2B_hasDrills__c,
                    B2B_allowedScaling__c,
                    B2B_Original_Coordinates__c,
                    B2B_Original_OMA_Height__c,
                    B2B_Original_Width__c,
                    B2B_Original_Drills__c,
                    B2B_Original_OMA__c,
                    B2B_Original_has_Drills__c,
                    B2B_Original_allowedScaling__c,
                    B2B_With_Partial_Color_Groove__c //BS-2137
                FROM B2B_Lens_Configurator__c
                WHERE Id = :recordId
            ];
        }
        B2B_ShapeSelectionDataWrapper shapeSelectionDataWrapperObj = new B2B_ShapeSelectionDataWrapper();
        if (lensConfiguratorList.isEmpty() == false) {
            shapeSelectionDataWrapperObj.lensConfiguratorObj = lensConfiguratorList[0];
            B2B_OMASuccessResponseWrapper omaSuccessResponseWrapperObj = new B2B_OMASuccessResponseWrapper();
            omaSuccessResponseWrapperObj.coordinates = lensConfiguratorList[0].B2B_Coordinates__c;
            omaSuccessResponseWrapperObj.originalCoordinates = lensConfiguratorList[0].B2B_Original_Coordinates__c != null
                ? lensConfiguratorList[0].B2B_Original_Coordinates__c
                : null;
            omaSuccessResponseWrapperObj.height = lensConfiguratorList[0].B2B_OMA_Height__c;
            omaSuccessResponseWrapperObj.originalHeight = lensConfiguratorList[0].B2B_Original_OMA_Height__c != null
                ? lensConfiguratorList[0].B2B_Original_OMA_Height__c
                : null;
            omaSuccessResponseWrapperObj.width = lensConfiguratorList[0].B2B_Width__c;
            omaSuccessResponseWrapperObj.originalWidth = lensConfiguratorList[0].B2B_Original_Width__c != null
                ? lensConfiguratorList[0].B2B_Original_Width__c
                : null;
            if (
                String.isNotBlank(lensConfiguratorList[0].B2B_Drills__c) == true &&
                lensConfiguratorList[0].B2B_Drills__c.containsIgnoreCase(B2B_Constants.OMA_CALLOUT_RESPONSE_TARGET_TEXT_TO_BE_REPLACED_ENDS)
            ) {
                omaSuccessResponseWrapperObj.drills = lensConfiguratorList[0]
                    .B2B_Drills__c.replace(
                        B2B_Constants.OMA_CALLOUT_RESPONSE_TARGET_TEXT_TO_BE_REPLACED_ENDS,
                        B2B_Constants.OMA_CALLOUT_RESPONSE_SOURCE_TEXT_TO_BE_REPLACED_END
                    );
            }

            if (
                String.isNotBlank(lensConfiguratorList[0].B2B_Original_Drills__c) == true &&
                lensConfiguratorList[0].B2B_Original_Drills__c.containsIgnoreCase(B2B_Constants.OMA_CALLOUT_RESPONSE_TARGET_TEXT_TO_BE_REPLACED_ENDS)
            ) {
                omaSuccessResponseWrapperObj.originalDrills = lensConfiguratorList[0]
                    .B2B_Original_Drills__c.replace(
                        B2B_Constants.OMA_CALLOUT_RESPONSE_TARGET_TEXT_TO_BE_REPLACED_ENDS,
                        B2B_Constants.OMA_CALLOUT_RESPONSE_SOURCE_TEXT_TO_BE_REPLACED_END
                    );
            }

            omaSuccessResponseWrapperObj.oma = lensConfiguratorList[0].B2B_OMA__c;
            omaSuccessResponseWrapperObj.originalOma = lensConfiguratorList[0].B2B_Original_OMA__c != null ? lensConfiguratorList[0].B2B_Original_OMA__c : null;
            omaSuccessResponseWrapperObj.hasDrills = lensConfiguratorList[0].B2B_hasDrills__c;
            omaSuccessResponseWrapperObj.originalHasDrills = lensConfiguratorList[0].B2B_Original_has_Drills__c != null
                ? lensConfiguratorList[0].B2B_Original_has_Drills__c
                : null;
            omaSuccessResponseWrapperObj.allowedScaling = lensConfiguratorList[0].B2B_allowedScaling__c;
            omaSuccessResponseWrapperObj.originalAllowedScaling = lensConfiguratorList[0].B2B_Original_allowedScaling__c != null
                ? lensConfiguratorList[0].B2B_Original_allowedScaling__c
                : null;
            shapeSelectionDataWrapperObj.omaSuccessResponseWrapper = omaSuccessResponseWrapperObj;
        }
        return shapeSelectionDataWrapperObj != null ? shapeSelectionDataWrapperObj : null;
    }

    /**
     * BS-1650
     * @description this method will return the selected productDetail
     * @param recordId : id of the product record
     * @return Product2: returns the product object
     */
    @AuraEnabled
    public static Product2 getSelectedProductDetail(String recordId) {
        List<Product2> productList = new List<Product2>();
        if (String.isNotBlank(recordId) == true) {
            productList = [SELECT Id, B2B_Availability_JSON__c, B2B_RX_Able__c FROM Product2 WHERE Id = :recordId];
        }
        return productList.isEmpty() == false ? productList[0] : null;
    }

    /**
     * BS-1650
     * @description this method will return the Account Object.
     * @param recordId : id of the Account record
     * @return Account: returns the Account object
     */
    @AuraEnabled
    public static Account getAccountDetail(String recordId) {
        List<Account> accountList = new List<Account>();
        if (String.isNotBlank(recordId) == true) {
            accountList = [SELECT Id, k_ARIS_Account_ID__c FROM Account WHERE Id = :recordId];
        }
        return accountList.isEmpty() == false ? accountList[0] : null;
    }

    /**
     * BS-1415
     * @description this method will return the Account Object.
     * @return Account: returns the Account object
     */
    @AuraEnabled
    public static Account getAccountData() {
        Id accountId = B2B_Utils.getAccountIdByCurrentUser();
        List<Account> accountList = new List<Account>();
        if (String.isNotBlank(accountId) == true) {
            accountList = [SELECT Id, k_ARIS_Account_ID__c FROM Account WHERE Id = :accountId];
        }
        return accountList.isEmpty() == false ? accountList[0] : null;
    }

    /**
     * BS-1775
     * @description This method is used to save the current step number
     * @author Vishalsingh G
     * @param lensConfiguratorId
     * @param currentStepNumber
     */
    @AuraEnabled(cacheable=false)
    public static void updateCurrentStepNumber(String lensConfiguratorId, Integer currentStepNumber) {
        if (String.isNotBlank(lensConfiguratorId) && currentStepNumber != null) {
            update new B2B_Lens_Configurator__c(Id = lensConfiguratorId, B2B_Last_Completed_Step__c = currentStepNumber);
        }
    }

    public class B2B_ShapeSelectionDataWrapper {
        @AuraEnabled
        public B2B_Lens_Configurator__c lensConfiguratorObj;
        @AuraEnabled
        public B2B_OMASuccessResponseWrapper omaSuccessResponseWrapper;
    }

    public class B2B_OMASuccessResponseWrapper {
        @AuraEnabled
        public String coordinates;

        @AuraEnabled
        public String height;

        @AuraEnabled
        public String width;

        @AuraEnabled
        public String drills;

        @AuraEnabled
        public String oma;

        @AuraEnabled
        public Boolean hasDrills;

        @AuraEnabled
        public String allowedScaling;
        @AuraEnabled
        public String originalCoordinates;

        @AuraEnabled
        public String originalHeight;

        @AuraEnabled
        public String originalWidth;

        @AuraEnabled
        public String originalDrills;

        @AuraEnabled
        public String originalOma;

        @AuraEnabled
        public Boolean originalHasDrills;

        @AuraEnabled
        public String originalAllowedScaling;
    }
    /**
     * BS-708
     * @description Wrapper to store the product data related to field set for display on product card.
     */
    public class B2B_ProductDataWrapper {
        @AuraEnabled
        public String fieldApiName;
        @AuraEnabled
        public String fieldLabel;
        @AuraEnabled
        public Object fieldValue;
    }

    /**
     * BS-708
     * @description Wrapper of filter to be returned containing the filter information fetched from Custom Metadata.
     */
    public class B2B_AvailableFiltersDataWrapper {
        @AuraEnabled
        public String filterType;
        @AuraEnabled
        public String filterName;
        @AuraEnabled
        public String category;
        @AuraEnabled
        public String checkedFilterValue;
        @AuraEnabled
        public String sectionFieldName;
        @AuraEnabled
        public B2B_filterDataWrapper availableFilters;
    }

    /**
     * BS-708
     * @description Wrapper to restructure filter preference setting records
     */
    public class B2B_filterDataWrapper {
        @AuraEnabled
        public Boolean checkedFilterValue;
        @AuraEnabled
        public Boolean isActive;
        @AuraEnabled
        public Boolean isRadioButtonType;
        @AuraEnabled
        public Boolean isColorRadioButtonType;
        @AuraEnabled
        public Boolean isSliderType; //BS-457
        @AuraEnabled
        public B2B_PicklistFieldWrapper filterValues;
        @AuraEnabled
        public Integer filterOrder;
        @AuraEnabled
        public Id filterId;
        @AuraEnabled
        public String masterLabel;
        @AuraEnabled
        public String language;
        @AuraEnabled
        public String filterType;
        @AuraEnabled
        public String developerName;
        @AuraEnabled
        public String fieldName;
        @AuraEnabled
        public String sourceProductField;
        @AuraEnabled
        public Decimal sliderMinimumValue;
        @AuraEnabled
        public Decimal sliderMaximumValue;
        @AuraEnabled
        public Decimal sliderIncrementValue;
        @AuraEnabled
        public Integer sliderSelectedLeftValue;
        @AuraEnabled
        public Integer sliderSelectedRightValue;
        @AuraEnabled
        public String sliderType;
        @AuraEnabled
        public List<String> filterValuesList;
        @AuraEnabled
        public List<String> controllingFieldList;
        @AuraEnabled
        public List<String> controllingParametersList;
        @AuraEnabled
        public List<String> categorySHList;
        @AuraEnabled
        public List<String> categoryEEList;
        @AuraEnabled
        public List<String> brandsList;
        @AuraEnabled
        public Boolean isMultiselect; //BS-930 : Boolean to identify if user is allowed to have multiple selection from this filter
    }

    /**
     * BS-654
     * @description Wrapper to be returned containing the picklist values with additional paramters
     */
    public class B2B_PicklistValuesWrapper {
        @AuraEnabled
        public String apiName { get; set; }
        @AuraEnabled
        public String picklistValue { get; set; }
        @AuraEnabled
        public String filterIcon { get; set; }
        @AuraEnabled
        public Boolean isValueChecked { get; set; }
    }

    /**
     * BS-654
     * @description Wrapper to be returned containing picklist field name and respective values
     */
    public class B2B_PicklistFieldWrapper {
        @AuraEnabled
        public String fieldName { get; set; }
        @AuraEnabled
        public List<B2B_PicklistValuesWrapper> picklistValues { get; set; }
    }

    /**
     * BS-708
     * @description Wrapper to store the product data related to field set for display on product card.
     */
    public class B2B_VS_RX_CategoriesDataWrapper {
        @AuraEnabled
        public String parentCategoryId;
        @AuraEnabled
        public String parentCategoryName;
        @AuraEnabled
        public List<ProductCategory> childCategoriesList;
    }

    /**
     * BS-708
     * @description Wrapper of category data
     */
    public class B2B_CategoryWrapper {
        @AuraEnabled
        public String categoryId;
        @AuraEnabled
        public String categoryName;
        @AuraEnabled
        public String parentCategory;
        @AuraEnabled
        public Integer productCount;
    }

    /**
     * BS-978
     * @description This Wrapper is usedto store the B2B_Lens_configurator__c records that needs to be displayed under My Vision Sensation/RX screen on UI
     * @author Sachin V
     */
    public class B2B_VS_RX_Configuration_Data_Wrapper {
        @AuraEnabled
        public String recordId; // This is used to represent Id of record
        @AuraEnabled
        public String orderType; // This is used to represent field: 'B2B_Order_Type__c' on Object: 'B2B_Lens_Configurator__c'
        @AuraEnabled
        public String customerName; // This is used to represent field: 'B2B_Customer_Name__c' on Object: 'B2B_Lens_Configurator__c'
        @AuraEnabled
        public String collectionNameAndNumber; // This is used to represent combination of 'B2B_Frame_Collection__c'(B2B_Lens_Configurator__c) + 'B2B_Model__c'(Product2)
        @AuraEnabled
        public String lensName; // This is used to represent field: 'B2B_Lens_Type__c' on Object: 'B2B_Lens_Configurator__c'
        @AuraEnabled
        public Date createdDate; // This is used to represent field: 'CreatedDate' on Object: 'B2B_Lens_Configurator__c'
        @AuraEnabled
        public Date lastModifiedDate; // This is used to represent field: 'LastModifiedDate' on Object: 'B2B_Lens_Configurator__c'
        @AuraEnabled
        public String status; // This is used to represent field: 'B2B_status__c' on Object: 'B2B_Lens_Configurator__c'
    }

    /**
     * @description This will update the lens configurator record with cart Item ID
     * BS-728
     * @author Vishalsingh G
     */
    @AuraEnabled
    public static void updateLensConfiguratorRecordForCartItem(String lensConfiguratorId, String cartItemId) {
        if (String.isNotBlank(lensConfiguratorId) && String.isNotBlank(cartItemId)) {
            update new B2B_Lens_Configurator__c(Id = lensConfiguratorId, B2B_Cart_Item__c = cartItemId);
        }
    }

    /**
     * Created - BS-1213
     * Modified - BS-1798 (Added : B2B_VS_Fields_To_Reset_on_Frame_Change)
     * @description This method is used to clear out the values of Lens Configurator record depending on the type and fields to reset
     * @param lensConfiguratorId    :   Id of the lens configurator
     * @param pageSource            :   Page Type (VS/RX)
     * @param triggeringAttribute   :   Attribute name that triggred this method such as FrameChange, OrderType Change, FrameType Change
     * @return isSuccess            :   Status whether the lens configurator record is updated
     */
    @AuraEnabled
    public static Boolean clearLensConfiguratorData(String lensConfiguratorId, String pageSource, String triggeringAttribute) {
        Boolean isSuccess = false;
        if (String.isNotBlank(lensConfiguratorId) && String.isNotBlank(pageSource) && String.isNotBlank(triggeringAttribute)) {
            Boolean lensShapeImageToClear = false;
            List<B2B_Lens_Configurator__c> lensConfiguratorList = new List<B2B_Lens_Configurator__c>();
            String query = 'SELECT Id,';
            List<Schema.FieldSetMember> fieldSetList = new List<Schema.FieldSetMember>();
            switch on pageSource {
                //Added hardcoded checks instead of moving it into constants because switch case works on ENUMS and it does not make sense to create ENUM class just for these values
                when 'VS' {
                    switch on triggeringAttribute {
                        when 'frameChange' {
                            fieldSetList = SObjectType.B2B_Lens_Configurator__c.FieldSets.B2B_VS_Fields_To_Reset_on_Frame_Change.getFields();
                            lensShapeImageToClear = true;
                        }
                        when 'orderOrFrameTypeChange' {
                            fieldSetList = SObjectType.B2B_Lens_Configurator__c.FieldSets.B2B_Lens_Configurator_Fields_To_Reset.getFields();
                        }
                    }
                }
                when 'RX' {
                    switch on triggeringAttribute {
                        when 'orderOrFrameTypeChange' {
                            fieldSetList = SObjectType.B2B_Lens_Configurator__c.FieldSets.B2B_Lens_Configurator_Fields_To_Reset.getFields();
                        }
                    }
                }
            }

            for (Schema.FieldSetMember fieldSetInstance : fieldSetList) {
                query += ' ' + fieldSetInstance.getFieldPath() + ',';
            }

            query = query.removeEnd(',');
            query += ' FROM B2B_Lens_Configurator__c WHERE Id =:lensConfiguratorId';
            lensConfiguratorList = Database.query(query);
            if (lensConfiguratorList.isEmpty() == false) {
                // get the SObjectType
                Schema.SObjectType objectType = Schema.getGlobalDescribe().get(B2B_Constants.B2B_LENS_CONFIGURATOR_OBJECT);
                // get the fields on the object
                Map<String, SObjectField> fieldMap = objectType.getDescribe().fields.getMap();
                for (Schema.FieldSetMember fieldSetInstance : fieldSetList) {
                    Schema.SobjectField fieldName = fieldMap.get(fieldSetInstance.getFieldPath());
                    String fielddataType = fieldMap.get(fieldSetInstance.getFieldPath()).getDescribe().getType() + '';
                    if (fielddataType.equalsIgnoreCase(B2B_Constants.BOOLEAN_STRING) == false) {
                        lensConfiguratorList[0].put(fieldSetInstance.getFieldPath(), null);
                    } else {
                        lensConfiguratorList[0].put(fieldSetInstance.getFieldPath(), false);
                    }
                }
                update lensConfiguratorList;
                isSuccess = true;
            }
            if (lensShapeImageToClear == true) {
                Set<String> vsLensShapeImageTitleSet = new Set<String>{ B2B_Constants.LENS_SHAPE_TITLE };
                List<ContentDocumentLink> previousContentDocumentLinkList = new List<ContentDocumentLink>();
                previousContentDocumentLinkList = [
                    SELECT Id
                    FROM ContentDocumentLink
                    WHERE LinkedEntityId = :lensConfiguratorId AND ContentDocument.Title IN :vsLensShapeImageTitleSet
                ];
                if (previousContentDocumentLinkList.isEmpty() == false) {
                    delete previousContentDocumentLinkList;
                }
            }
        }
        return isSuccess;
    }

    /**
     * @description This will update the lens configurator record with the lens Edge
     * BS-1845
     * @author Vishalsingh G
     */
    @AuraEnabled
    public static void updateLensConfiguratorRecordForLensEdge(String lensConfiguratorId, String lensEdge) {
        if (String.isNotBlank(lensConfiguratorId)) {
            update new B2B_Lens_Configurator__c(Id = lensConfiguratorId, B2B_Lens_Edge__c = lensEdge);
        }
    }

    /**
     * @description This will return entitled product list.
     * BS-2063
     * @author Vishalsingh G
     */
    public static Set<String> getEntitledProductIds(String effectiveAccountId, Set<String> productIdSet) {
        Set<String> entitleProductIdSet = new Set<String>();
        Set<String> buyerGroupIdSet = new Set<String>();
        Set<String> policyIdSet = new Set<String>();
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

        for (CommerceEntitlementProduct product : [
            SELECT Id, PolicyId, ProductId
            FROM CommerceEntitlementProduct
            WHERE PolicyId IN :policyIdSet AND ProductId IN :productIdSet
        ]) {
            entitleProductIdSet.add(product.ProductId);
        }

        return entitleProductIdSet.isEmpty() == false ? entitleProductIdSet : null;
    }

    /**
     * BS-821
     * @description Wrapper to store picklist data.
     */
    public class B2B_PicklistDataWraper {
        @AuraEnabled
        public String fieldApiName;
        @AuraEnabled
        public String picklistApiName;
        @AuraEnabled
        public String picklistValue;
    }

    /**
     * BS-1525
     * @description : This Wrapper stores the initial data needed for search result container component of VS-RX
     */
    public class B2B_SearchResultContainerInitialSetupDataWrapper {
        @AuraEnabled
        public List<ProductCategory> categoryDetailsList;

        @AuraEnabled
        public B2B_PicklistFieldWrapper picklistWrapper;

        @AuraEnabled
        public List<B2B_SearchController.B2B_PicklistDataWraper> productPicklistDataWrapper;

        @AuraEnabled
        public String mapColorCodes;
    }
}
