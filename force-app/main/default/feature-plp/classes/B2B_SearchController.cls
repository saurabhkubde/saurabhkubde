/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-07-22 15:08:38
 * @modify date 2022-08-09 14:00:00
 * @desc class for exceuting the product serach for PLP and search results
 * As Category is not visible hence needed to make class as without sharing
 */
public without sharing class B2B_SearchController {
    @TestVisible
    private static B2B_CommerceProxy commerceProxy = new B2B_CommerceProxy();

    /**
     * @description Demonstrates how to call ConnectApi.CommerceSearch.productSearch
     * @param communityId The Id of the community from which the call originated
     * @param searchQuery The search query parameters which includes searchTerm, categoryId, refinements, page and includePrices
     * @param @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     */
    @AuraEnabled(cacheable=false)
    public static Object productSearch(String communityId, String searchQuery, String effectiveAccountId) {
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        ConnectApi.ProductSearchInput searchInput = (ConnectApi.ProductSearchInput) JSON.deserialize(searchQuery, ConnectApi.ProductSearchInput.class);

        return commerceProxy.searchProducts(webstoreId, effectiveAccountId, searchInput);
    }

    /**
     * @description Demonstrates how to call ConnectApi.CommerceSearch.getSortRules
     */
    @AuraEnabled(cacheable=false)
    public static Object getSortRules(String communityId) {
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        return commerceProxy.getSortRules(webstoreId);
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
     * @description This method is used to return picklist values and field name wit additional parameters
     * BS-442
     * @author Chirag L
     * @param  picklistField    name of picklist field whose values to be fetched
     * @return                  returns the available picklist values with custom parameters in wrapper format
     */
    @AuraEnabled(cacheable=true)
    public static B2B_PicklistFieldWrapper getFieldPicklistValues(String picklistField) {
        List<B2B_PicklistValuesWrapper> pickListValuesList = new List<B2B_PicklistValuesWrapper>();
        B2B_PicklistFieldWrapper fieldWrapper = new B2B_PicklistFieldWrapper();

        DescribeSObjectResult objResult = Schema.getGlobalDescribe().get(B2B_Constants.PRODUCT_OBJECT_API_NAME).getDescribe();
        Schema.DescribeFieldResult fieldResult = objResult.fields.getMap().get(picklistField).getDescribe();

        List<Schema.PicklistEntry> picklistEntryList = fieldResult.getPicklistValues();

        for (Schema.PicklistEntry pickListVal : picklistEntryList) {
            B2B_PicklistValuesWrapper picklistWrapper = new B2B_PicklistValuesWrapper();
            picklistWrapper.apiName = pickListVal.getValue();
            picklistWrapper.picklistValue = pickListVal.getLabel();

            pickListValuesList.add(picklistWrapper);
        }

        fieldWrapper.fieldName = fieldResult.getLabel();
        fieldWrapper.picklistValues = pickListValuesList;
        return fieldWrapper;
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
        Map<String, B2B_Filters_Preference_Settings__mdt> filtersMap = new Map<String, B2B_Filters_Preference_Settings__mdt>();
        filtersMap = getFilterPreferenceSettingRecords();

        // Fill all Filter Preference Setting record data into custom wrapper: B2B_filterDataWrapper
        List<B2B_filterDataWrapper> filtersDataWrapperList = new List<B2B_filterDataWrapper>();
        if ((filtersMap != null) || (filtersMap.isEmpty() == false)) {
            filtersDataWrapperList = fillFilterDataWrapper(filtersMap);
        }

        // Set the needed Filter Preference Setting record data into custom wrapper: B2B_AvailableFiltersDataWrapper
        List<B2B_AvailableFiltersDataWrapper> availableFiltersList = new List<B2B_AvailableFiltersDataWrapper>();
        availableFiltersList = fillAvailableFilterDataWrapper(filtersDataWrapperList, categoryName, storeName);

        if (availableFiltersList.isEmpty() == false) {
            return availableFiltersList;
        } else {
            return null;
        }
    }

    /**
     * @description This method is used to return all filters available on reorder page based on the store selected
     * BS-443
     * @author Aman K
     * @param  storeName        web store in which user is currently logged in
     * @return                  returns the available filters with various custom parameters in wrapper format
     */
    @AuraEnabled
    public static List<B2B_AvailableFiltersDataWrapper> getReorderFilters(String storeName) {
        // Fetching Filter Preference Setting Records and assigning to filtersMap
        //filtersMap : Key: Filter Preference Setting API Name, Value : Filter Preference Setting record
        Map<String, B2B_Filters_Preference_Settings__mdt> filtersMap = new Map<String, B2B_Filters_Preference_Settings__mdt>();
        filtersMap = getFilterPreferenceSettingRecords();

        // Fill all Filter Preference Setting record data into custom wrapper: B2B_filterDataWrapper
        List<B2B_filterDataWrapper> filtersDataWrapperList = new List<B2B_filterDataWrapper>();
        if ((filtersMap != null) || (filtersMap.isEmpty() == false)) {
            filtersDataWrapperList = fillFilterDataWrapper(filtersMap);
        }
        List<B2B_AvailableFiltersDataWrapper> availableFiltersList = new List<B2B_AvailableFiltersDataWrapper>();
        if (String.isNotBlank(storeName) && storeName.equalsIgnoreCase(B2B_Constants.BOTH_SH_EE_BRAND)) {
            List<B2B_AvailableFiltersDataWrapper> availableSHFiltersList = new List<B2B_AvailableFiltersDataWrapper>();
            Set<String> filtersFieldNameSet = new Set<String>();
            availableSHFiltersList = fillAvailableFilterDataWrapper(filtersDataWrapperList, null, B2B_Constants.SILHOUETTE_BRAND);
            availableFiltersList.addAll(availableSHFiltersList);
            for (B2B_AvailableFiltersDataWrapper shAvailableFilterObj : availableSHFiltersList) {
                filtersFieldNameSet.add(shAvailableFilterObj.availableFilters.fieldName);
            }
            List<B2B_AvailableFiltersDataWrapper> availableEEFiltersList = new List<B2B_AvailableFiltersDataWrapper>();
            availableEEFiltersList = fillAvailableFilterDataWrapper(filtersDataWrapperList, null, B2B_Constants.EVIL_EYE_BRAND);
            for (B2B_AvailableFiltersDataWrapper availableFilterEE : availableEEFiltersList) {
                if (filtersFieldNameSet.contains(availableFilterEE.availableFilters.fieldName) == false) {
                    availableFiltersList.add(availableFilterEE);
                }
            }
        } else {
            availableFiltersList = fillAvailableFilterDataWrapper(filtersDataWrapperList, null, storeName);
        }
        return availableFiltersList;
    }

    /**
     * @description This method is used to return all filter preference setting records
     * BS-442
     * @author Chirag L
     * @return returns the filter preference setting records with selected fields
     */
    public static Map<String, B2B_Filters_Preference_Settings__mdt> getFilterPreferenceSettingRecords() {
        Map<String, B2B_Filters_Preference_Settings__mdt> filtersMap = new Map<String, B2B_Filters_Preference_Settings__mdt>();

        List<B2B_Filters_Preference_Settings__mdt> filtersList = [
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
                Category_NB__c,
                Filter_Type__c,
                Filter_Order__c,
                IsActive__c,
                Source_Product_Field__c,
                Parent_Controlling_Filter__c,
                Placement__c,
                Specified_Values__c,
                Slider_Minimum_Value__c, //BS-457
                Slider_Maximum_Value__c, //BS-457
                Slider_Increment_Value__c, //BS-457
                Slider_Type__c, //BS-457
                Multiselect__c //BS-930
            FROM B2B_Filters_Preference_Settings__mdt
            WHERE IsActive__c = TRUE
            ORDER BY Filter_Order__c ASC NULLS LAST, Source_Product_Field__c ASC
        ];

        if (filtersList.isEmpty() == false) {
            for (B2B_Filters_Preference_Settings__mdt filter : filtersList) {
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
     * @description This method is used to return fetched filter preference setting records in structured/ reformed format
     * BS-442
     * @author Chirag L
     * @param  filtersMap   map of filter preference setting API name vs filter preference setting records
     * @return              returns the fetched filter preference setting records in structured/ reformed format
     */
    public static List<B2B_filterDataWrapper> fillFilterDataWrapper(Map<String, B2B_Filters_Preference_Settings__mdt> filtersMap) {
        List<B2B_filterDataWrapper> filtersDataWrapperList = new List<B2B_filterDataWrapper>();

        for (String key : filtersMap.keySet()) {
            B2B_filterDataWrapper filterDataWrapper = new B2B_filterDataWrapper();
            filterDataWrapper.checkedFilterValue = false;
            filterDataWrapper.isActive = filtersMap.get(key).IsActive__c;
            filterDataWrapper.masterLabel = (filtersMap.get(key).MasterLabel).trim();
            filterDataWrapper.language = (filtersMap.get(key).Language).trim();
            filterDataWrapper.filterType = (String.isNotBlank(filtersMap.get(key).Filter_Type__c)) ? (filtersMap.get(key).Filter_Type__c).trim() : null;
            filterDataWrapper.isMultiselect = filtersMap.get(key).Multiselect__c; //Added as part of BS-930

            //BS-930 Added condition for multi select radio buttons
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

            String categoryNB = (String.isNotBlank(filtersMap.get(key).Category_NB__c)) ? (filtersMap.get(key).Category_NB__c).trim() : null;
            List<String> categoryNBList = categoryNB != null ? categoryNB.split(',') : new List<String>();
            filterDataWrapper.categoryNBList = getCategoryList(categoryNBList);

            String placementValue = (String.isNotBlank(filtersMap.get(key).Placement__c)) ? (filtersMap.get(key).Placement__c).replaceAll('\\s+', '') : null;
            filterDataWrapper.placementList = placementValue != null ? placementValue.split(',') : new List<String>();

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
            filterDataWrapper.filterValues = getFieldPicklistValues(filtersMap.get(key).Source_Product_Field__c);
            filterDataWrapper.fieldName = filterDataWrapper.filterValues.fieldName;
            filterDataWrapper.controllingFieldList = (String.isNotBlank(filtersMap.get(key).Parent_Controlling_Filter__c))
                ? (filtersMap.get(key).Parent_Controlling_Filter__c).split('=')
                : new List<String>();
            List<B2B_PicklistValuesWrapper> picklistValuesList = new List<B2B_PicklistValuesWrapper>();
            List<String> facetList = new List<String>();

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
                B2B_PicklistFieldWrapper tempPicklistValues = getFieldPicklistValues(parentSourceProductField);
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
                    //BS-665 removed frame type icons
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

        if (filtersDataWrapperList.isEmpty() == false) {
            return filtersDataWrapperList;
        } else {
            return null;
        }
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
                } else if (storeName.equalsIgnoreCase(B2B_Constants.NEUBAU_BRAND)) {
                    referenceCategory = filterWrapper.categoryNBList != null ? filterWrapper.categoryNBList : new List<String>();
                }

                if (
                    filterWrapper.brandsList.contains(storeName) &&
                    referenceCategory != null &&
                    (referenceCategory.isEmpty() == false) &&
                    referenceCategory.contains(categoryName)
                ) {
                    availableFilterWrapper.filterType = filterWrapper.filterType;
                    availableFilterWrapper.category = categoryName;
                    availableFilterWrapper.placementList = filterWrapper.placementList;
                    availableFilterWrapper.filterName = filterWrapper.fieldName;
                    availableFilterWrapper.availableFilters = filterWrapper;
                    availableFiltersList.add(availableFilterWrapper);
                } else if (filterWrapper.brandsList.contains(storeName) && referenceCategory != null && ((referenceCategory.isEmpty()))) {
                    availableFilterWrapper.filterType = filterWrapper.filterType;
                    availableFilterWrapper.category = categoryName;
                    availableFilterWrapper.placementList = filterWrapper.placementList;
                    availableFilterWrapper.filterName = filterWrapper.fieldName;
                    availableFilterWrapper.availableFilters = filterWrapper;
                    availableFiltersList.add(availableFilterWrapper);
                }
                //Commenting out this logic so that filters will not be shown under All Silhouette and all evil eye if not added in respective categories in Filter Preference Settings metadata
                /* else if (
                    filterWrapper.brandsList.contains(storeName) &&
                    referenceCategory != null &&
                    ((referenceCategory.isEmpty()) || (referenceCategory.contains(categoryName) == false)) &&
                    (categoryName.equalsIgnoreCase(B2B_Constants.SILHOUETTE_CATEGORY) || categoryName.equalsIgnoreCase(B2B_Constants.EVIL_EYE_CATEGORY))
                ) {
                    availableFilterWrapper.filterType = filterWrapper.filterType;
                    availableFilterWrapper.category = categoryName;
                    availableFilterWrapper.placementList = filterWrapper.placementList;
                    availableFilterWrapper.filterName = filterWrapper.fieldName;
                    availableFilterWrapper.availableFilters = filterWrapper;
                    availableFiltersList.add(availableFilterWrapper);
                } */
            }
            return availableFiltersList;
        } else {
            List<B2B_AvailableFiltersDataWrapper> availableFiltersList = new List<B2B_AvailableFiltersDataWrapper>();
            for (B2B_filterDataWrapper filterWrapper : filtersDataWrapperList) {
                B2B_AvailableFiltersDataWrapper availableFilterWrapper = new B2B_AvailableFiltersDataWrapper();
                if (filterWrapper.brandsList.contains(storeName)) {
                    availableFilterWrapper.filterType = filterWrapper.filterType;
                    availableFilterWrapper.category = null;
                    availableFilterWrapper.placementList = filterWrapper.placementList;
                    availableFilterWrapper.filterName = filterWrapper.fieldName;
                    availableFilterWrapper.availableFilters = filterWrapper;
                    availableFiltersList.add(availableFilterWrapper);
                }
            }
            return availableFiltersList;
        }
    }

    /**
     * @description This method is used to return requested categories details
     * BS-442
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
     * @description This method is used to return all parent categories and their Ids
     * BS-393
     * @param  categoryId   Id of category selected by user
     * @return              returns the categories data
     */
    @AuraEnabled(cacheable=false)
    public static Map<String, String> getCategories(String categoryId) {
        Map<String, String> categoryIdVsNameMap = new Map<String, String>();
        Map<String, ProductCategory> categoryIdVsCategoryMap = new Map<String, ProductCategory>();
        List<ProductCategory> allProductCategoryList = [SELECT Id, toLabel(Name), ParentCategoryId FROM ProductCategory];

        for (ProductCategory productObj : allProductCategoryList) {
            categoryIdVsCategoryMap.put(productObj.Id, productObj);
        }

        String childCategoryId = categoryId;
        while (childCategoryId != null) {
            categoryIdVsNameMap.put(
                childCategoryId,
                categoryIdVsCategoryMap.get(childCategoryId).Name.replaceAll('-', '').replaceAll('/', '').replaceAll('\\s+', '-').toLowercase() +
                '*****' +
                categoryIdVsCategoryMap.get(childCategoryId).Name
            );
            childCategoryId = categoryIdVsCategoryMap.get(childCategoryId).ParentCategoryId;
        }
        return categoryIdVsNameMap;
    }

    @AuraEnabled(cacheable=true)
    public static List<String> fetchProductDataPicklistValues() {
        List<String> pickListValuesList = new List<String>();
        Schema.DescribeFieldResult fieldResult = Product2.ProductClass.getDescribe();

        List<Schema.PicklistEntry> picklistEntryList = fieldResult.getPicklistValues();
        for (Schema.PicklistEntry pickListVal : picklistEntryList) {
            pickListValuesList.add(pickListVal.getLabel());
        }
        return pickListValuesList;
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
     * @description This method is used to return structured/trimmed category details list
     * BS-444 modified as a part of BS-1253
     * @author Vishalsingh G
     * @param categoryId     category list containing unnecessary white spaces
     * @param productIdList product ids to filter
     * @param storeName : Name of the store
     * @return                      returns list containing structured and formatted categories data
     */
    @AuraEnabled(cacheable=false)
    public static B2B_CategoryDetailsWrapper getCategoryData(List<String> productIdList, String categoryId, String language, String storeName) {
        /**
         * Added as a part of BS-1544
         */
        List<String> catalogNameList = (System.Label.B2B_STORE_CATALOG_NAME).split(',');
        String applicableCatalogue;
        if (catalogNameList.isEmpty() == false && catalogNameList[1] != null && storeName.equalsIgnoreCase(B2B_Constants.NEUBAU_BRAND)) {
            applicableCatalogue = catalogNameList[1];
        } else if (catalogNameList.isEmpty() == false && catalogNameList[0] != null) {
            applicableCatalogue = catalogNameList[0];
        }

        B2B_CategoryDetailsWrapper categoryWrapper = new B2B_CategoryDetailsWrapper();

        List<AggregateResult> categoryProductCountList;
        Integer remainingQueryRowLimit = Limits.getLimitQueryRows() - Limits.getQueryRows();

        if (productIdList != null) {
            categoryProductCountList = [
                SELECT
                    count(ProductId) productCount,
                    ProductCategory.Name categoryName,
                    ProductCategory.Id categoryId,
                    ProductCategory.ParentCategory.Name parentCategory,
                    ProductCategory.ParentCategoryId parentCategoryId,
                    ProductCategory.ParentCategory.ParentCategory.Name superParent,
                    ProductCategory.ParentCategory.ParentCategoryId superParentCategoryId
                FROM ProductCategoryProduct
                WHERE ProductId IN :productIdList AND Catalog.Name = :applicableCatalogue
                GROUP BY
                    ProductCategory.ParentCategory.Name,
                    ProductCategory.Name,
                    ProductCategory.Id,
                    ProductCategory.ParentCategoryId,
                    ProductCategory.ParentCategory.ParentCategory.Name,
                    ProductCategory.ParentCategory.ParentCategoryId

            ];
        }

        //The limit is used so that we don't hit query limit and get a server error during runtime
        List<ProductCategory> productCategoryList = [
            SELECT Id, Name, ParentCategoryId, B2B_Category_External_ID__c
            FROM ProductCategory
            WHERE Catalog.Name = :applicableCatalogue
            LIMIT :remainingQueryRowLimit
        ];
        //Added as a part of BS-1595
        Map<Id, ProductCategoryDataTranslation> productCategoryIdVsProductCategoryDataTranslationMap = new Map<Id, ProductCategoryDataTranslation>();
        //BS-2314
        List<ProductCategoryDataTranslation> categoryDataTranslationList = [
            SELECT Id, ParentId, Parent.ParentCategoryId, Parent.Name, Language, Name
            FROM ProductCategoryDataTranslation
            WHERE Language = :language
        ];

        if (categoryDataTranslationList.isEmpty() == false) {
            for (ProductCategoryDataTranslation productCategoryDataTranslation : categoryDataTranslationList) {
                productCategoryIdVsProductCategoryDataTranslationMap.put(productCategoryDataTranslation.ParentId, productCategoryDataTranslation);
            }
        }

        Map<Id, B2B_CategoryNameWrapper> productCategoryVsParentCategoryIdMap = new Map<Id, B2B_CategoryNameWrapper>();
        for (ProductCategory productCategory : productCategoryList) {
            B2B_CategoryNameWrapper nameVsParentWrapper = new B2B_CategoryNameWrapper();

            if (productCategoryIdVsProductCategoryDataTranslationMap.containsKey(productCategory.Id)) {
                nameVsParentWrapper.categoryLabel = productCategoryIdVsProductCategoryDataTranslationMap.get(productCategory.Id).Name;
            }
            //End: BS-1595
            nameVsParentWrapper.categoryName = productCategory.Name;
            nameVsParentWrapper.parentCategoryId = productCategory.ParentCategoryId;
            productCategoryVsParentCategoryIdMap.put(productCategory.Id, nameVsParentWrapper);
        }
        categoryWrapper.categoryProductCountList = categoryProductCountList;
        categoryWrapper.productCategoryVsParentCategoryIdMap = productCategoryVsParentCategoryIdMap;
        return categoryWrapper;
    }

    /**
     * @description This method is used to get the policy for the user Account
     * BS-444
     * @author Vishalsingh G
     * @param effectiveAccountId     Account id of the logged in user
     * @return              List of policy ids
     */
    @AuraEnabled(cacheable=false)
    public static List<String> getPolicy(String effectiveAccountId) {
        set<String> buyGrpIdSet = new Set<String>();
        set<String> policyIdSet = new Set<String>();
        List<BuyerGroupMember> buyGrpMemberList = [SELECT Id, Name, BuyerGroupId, BuyerId FROM BuyerGroupMember WHERE BuyerId = :effectiveAccountId];
        for (BuyerGroupMember bgMember : buyGrpMemberList) {
            buyGrpIdSet.add(bgMember.BuyerGroupId);
        }
        List<CommerceEntitlementBuyerGroup> comEntBuyGrpList = [
            SELECT Id, Name, PolicyId, BuyerGroupId
            FROM CommerceEntitlementBuyerGroup
            WHERE BuyerGroupId IN :buyGrpIdSet AND Policy.Name != :B2B_Constants.GLOBAL_ENTITLEMENT_VS AND Policy.Name != :B2B_Constants.GLOBAL_ENTITLEMENT_RX
        ];
        for (CommerceEntitlementBuyerGroup comEntBuyGrpObject : comEntBuyGrpList) {
            policyIdSet.add(comEntBuyGrpObject.PolicyId);
        }

        List<String> policyIdList = new List<String>(policyIdSet);
        return policyIdList;
    }

    /**
     * @description This method is used to get the products related to policy.
     * BS-444
     * @author Vishalsingh G
     * @param policyIdList    PolicyId list of logged in user
     * @return                 returns products under the policy.
     */
    @AuraEnabled(cacheable=false)
    public static List<String> searchProducts(String effectiveAccountId) {
        Set<String> productIdSet = new Set<String>();
        //BS-858 start
        set<String> buyGrpIdSet = new Set<String>();
        set<String> policyIdSet = new Set<String>();
        List<BuyerGroupMember> buyGrpMemberList = [SELECT Id, Name, BuyerGroupId, BuyerId FROM BuyerGroupMember WHERE BuyerId = :effectiveAccountId];
        for (BuyerGroupMember bgMember : buyGrpMemberList) {
            buyGrpIdSet.add(bgMember.BuyerGroupId);
        }
        List<CommerceEntitlementBuyerGroup> comEntBuyGrpList = [
            SELECT Id, Name, PolicyId, BuyerGroupId
            FROM CommerceEntitlementBuyerGroup
            WHERE BuyerGroupId IN :buyGrpIdSet AND Policy.Name != :B2B_Constants.GLOBAL_ENTITLEMENT_VS AND Policy.Name != :B2B_Constants.GLOBAL_ENTITLEMENT_RX
        ];
        for (CommerceEntitlementBuyerGroup comEntBuyGrpObject : comEntBuyGrpList) {
            policyIdSet.add(comEntBuyGrpObject.PolicyId);
        }

        List<String> policyIdList = new List<String>(policyIdSet);
        //BS-858 end
        List<CommerceEntitlementProduct> comEntProductList = [SELECT Id, PolicyId, ProductId FROM CommerceEntitlementProduct WHERE PolicyId IN :policyIdList];
        for (CommerceEntitlementProduct comEntProductObj : comEntProductList) {
            productIdSet.add(comEntProductObj.ProductId);
        }

        List<String> productIdList = new List<String>(productIdSet);
        return productIdList;
    }

    /**
     * @description This method is used to get the products related to policy.
     * BS-444
     * @author Vishalsingh G
     * @param Id currentCategoryId, Id parentCategoryId, Set<Id> categoryIdSet, Map<Id, productCategory> productCategoryIdVsProductCategoryObj
     * @return                 returns Category Id Set.
     */
    public static Set<Id> getCategoryIdSet(
        Id currentCategoryId,
        Id parentCategoryId,
        Id categoryName,
        productCategory productCatObj,
        Set<Id> categoryIdSet,
        Map<Id, productCategory> productCategoryIdVsProductCategoryObj
    ) {
        if (parentCategoryId == null) {
            return categoryIdSet;
        } else if (
            productCategoryIdVsProductCategoryObj.get(parentCategoryId).Id != null &&
            productCategoryIdVsProductCategoryObj.get(parentCategoryId).Id != categoryName
        ) {
            currentCategoryId = productCategoryIdVsProductCategoryObj.get(parentCategoryId).Id;
            parentCategoryId = productCategoryIdVsProductCategoryObj.get(parentCategoryId).ParentCategoryId;
            categoryIdSet = getCategoryIdSet(
                currentCategoryId,
                parentCategoryId,
                categoryName,
                productCatObj,
                categoryIdSet,
                productCategoryIdVsProductCategoryObj
            );
        } else if (productCategoryIdVsProductCategoryObj.get(parentCategoryId).Id == categoryName) {
            categoryIdSet.add(productCatObj.Id);
        }

        return categoryIdSet;
    }

    /**
     * @description Returns the wrapper containing the List of product details as well as its category and list of all the categories
     * BS-951
     * @author Aman Kumar
     * @param categoryName  Category Name
     * @param productIdList product ids to filter
     * @param categoryIdList Category ids to filter
     * @return returns the B2B_productCategoryWrapper
     */
    @AuraEnabled(cacheable=false)
    public static B2B_productCategoryWrapper getAllProducts(List<String> productIdList, String categoryName, List<Id> categoryIdList) {
        B2B_productCategoryWrapper productCategoryWrapper = new B2B_productCategoryWrapper();
        Id parentCategoryId;
        Id currentCategoryId;
        String productListQuery = '';
        String objectName = 'Product2';
        // If categoryIdSet of given products is already provided then there is no need to Query the same
        Set<Id> categoryIdSet = new Set<Id>();
        if (categoryIdList != null && categoryIdList.isEmpty() == false) {
            for (Id categoryId : categoryIdList) {
                categoryIdSet.add(categoryId);
            }
        } else {
            categoryIdSet.add((Id) categoryName);
            List<ProductCategory> allProductCategoryList = [SELECT Id, Name, ParentCategoryId FROM ProductCategory LIMIT 50000];
            Map<Id, productCategory> productCategoryIdVsProductCategoryObj = new Map<Id, productCategory>();
            for (ProductCategory productObj : allProductCategoryList) {
                productCategoryIdVsProductCategoryObj.put(productObj.Id, productObj);
            }
            for (ProductCategory productCatObj : allProductCategoryList) {
                currentCategoryId = productCatObj.Id;
                parentCategoryId = productCatObj.ParentCategoryId;
                categoryIdSet = getCategoryIdSet(
                    currentCategoryId,
                    parentCategoryId,
                    categoryName,
                    productCatObj,
                    categoryIdSet,
                    productCategoryIdVsProductCategoryObj
                );
            }
        }

        // Build a query to get all the product details as well as their category
        productListQuery = 'SELECT ProductId, ProductCategoryId, ';
        for (Schema.FieldSetMember fieldSetInstance : SObjectType.Product2.FieldSets.Product_Search_Query_Attributes.getFields()) {
            productListQuery += ' Product.' + fieldSetInstance.getFieldPath() + ','; //BS-821
        }
        productListQuery = productListQuery.removeEnd(',');
        productListQuery += ' FROM ProductCategoryProduct WHERE ProductId IN :productIdList AND ProductCategoryId IN :categoryIdSet AND Product.ProductClass != \'VariationParent\' AND Product.B2B_Is_Special__c = false';

        productCategoryWrapper.productList = Database.query(productListQuery);

        // Get all the categories ordered by Search result order
        productCategoryWrapper.productCategoryList = [
            SELECT Id, Name, B2B_Search_Result_Order__c, B2B_Category_External_ID__c, CreatedDate
            FROM ProductCategory
            ORDER BY B2B_Search_Result_Order__c ASC NULLS LAST
        ];
        return productCategoryWrapper;
    }

    /**
     * @description Returns the wrapper containing the List of product details as well as its category and list of all the categories
     * BS-951
     * @author Aman Kumar
     * @param categoryName  Category Name
     * @param productIdList product ids to filter
     * @param categoryIdList Category ids to filter
     * @return returns the B2B_productCategoryWrapper
     */
    @AuraEnabled(cacheable=false)
    public static B2B_productCategoryWrapper getSearchedProducts(List<String> productIdList, String searchTerm, String storeName) {
        Set<Id> productIdSet = new Set<Id>();
        B2B_productCategoryWrapper productCategoryWrapper = new B2B_productCategoryWrapper();
        List<ProductCategoryProduct> productSearchList;
        String newSearchString = '%' + searchTerm + '%';
        String newSearchStringWithoutWhiteSpace = '%' + searchTerm.deleteWhitespace() + '%';
        String searchStringCopy = newSearchString;
        while (searchStringCopy.contains('  ')) {
            searchStringCopy = searchStringCopy.replace('  ', ' ');
        }
        String newSearchStringWithRegEx = '%' + searchStringCopy.replace(' ', '%') + '%';
        //Variable to Dynamically create the Where clause for the query.
        String queryCondition = '';
        //Variable to Dynamically create query.
        String searchQuery = '';
        String productListQuery = '';
        String objectName = 'Product2';
        Set<String> categoryNameSet = new Set<String>();
        Schema.DisplayType picklistType;

        //Get the list of metadata for searchable fields
        List<B2B_Store_Search_Field__mdt> storeSearchMetadataList = [
            SELECT Search_Field__c
            FROM B2B_Store_Search_Field__mdt
            WHERE Store_Name__c = :storeName AND Is_Active__c = TRUE
        ];

        //Global describe call for storing the sobject data.
        Map<String, Schema.SObjectField> sObjectNameVsFieldMap = Schema.getGlobalDescribe()
            .get(B2B_Constants.PRODUCT_OBJECT_API_NAME)
            .getDescribe()
            .fields.getMap();

        for (B2B_Store_Search_Field__mdt storeSearchMetadata : storeSearchMetadataList) {
            //get the type of the field
            picklistType = sObjectNameVsFieldMap.get(storeSearchMetadata.Search_Field__c).getDescribe().getType(); // or getSOAPType()
            if (String.valueOf(picklistType) == 'MULTIPICKLIST') {
                queryCondition += ' ' + 'OR' + ' ' + 'toLabel(Product.' + storeSearchMetadata.Search_Field__c + ') '; //BS-776
                queryCondition += 'includes (' + '\'' + searchTerm + '\')' + ' ' + 'OR' + ' ' + 'toLabel(Product.' + storeSearchMetadata.Search_Field__c + ') '; //BS-776
                queryCondition += 'includes (' + '\'' + newSearchStringWithoutWhiteSpace + '\')'; //BS-776
            } else {
                queryCondition += ' ' + 'OR' + ' ' + 'Product.' + storeSearchMetadata.Search_Field__c + ' ';
                queryCondition += 'LIKE ' + '\'' + newSearchString + '\'' + ' ' + 'OR' + ' ' + 'Product.' + storeSearchMetadata.Search_Field__c + ' ';
                queryCondition += 'LIKE ' + '\'' + newSearchStringWithRegEx + '\'';
            }
        }

        List<ProductCategoryDataTranslation> productCategoryDataTranslationList = [
            SELECT Id, Name, Language, ParentId, Parent.Name
            FROM ProductCategoryDataTranslation
            WHERE
                Name LIKE :newSearchString
                OR Parent.name LIKE :newSearchString
                OR Name LIKE :newSearchStringWithRegEx
                OR Parent.name LIKE :newSearchStringWithRegEx
        ];
        if (productCategoryDataTranslationList.isEmpty() == false) {
            for (ProductCategoryDataTranslation categoryTranslation : productCategoryDataTranslationList) {
                categoryNameSet.add(categoryTranslation.Parent.Name);
            }
        }

        List<ProductCategory> productCategoryList = [
            SELECT Id, Name
            FROM ProductCategory
            WHERE Name LIKE :newSearchString OR Name LIKE :newSearchStringWithRegEx
        ];
        if (productCategoryList.isEmpty() == false) {
            for (ProductCategory productCategory : productCategoryList) {
                categoryNameSet.add(productCategory.Name);
            }
        }

        if (categoryNameSet.isEmpty() == true) {
            categoryNameSet.add(searchTerm);
            categoryNameSet.add(newSearchStringWithoutWhiteSpace);
        }

        List<String> categoryToExlcudeList = (System.Label.B2B_CATEGORIES_TO_EXCLUDE_FROM_GLOBAL_SEARCH).split(','); //BS-1676

        // BS-951
        // building a query to get the product details As well as its category
        searchQuery = 'SELECT ProductId, ProductCategory.Name, ProductCategoryId, ';
        for (Schema.FieldSetMember fieldSetInstance : SObjectType.Product2.FieldSets.Product_Search_Query_Attributes.getFields()) {
            searchQuery += ' Product.' + fieldSetInstance.getFieldPath() + ','; //BS-821
        }
        searchQuery = searchQuery.removeEnd(',');

        //building a search query to fetch the products
        //BS-1676 Updated Query : Added categoryToExlcudeList filteration
        searchQuery +=
            ' FROM ProductCategoryProduct WHERE ProductId IN :productIdList AND ProductCategory.Name NOT IN :categoryToExlcudeList AND ProductCategory.ParentCategory.Name NOT IN :categoryToExlcudeList AND ProductCategory.ParentCategory.ParentCategory.Name NOT IN :categoryToExlcudeList AND ProductCategory.ParentCategory.ParentCategory.ParentCategory.Name NOT IN :categoryToExlcudeList AND Product.B2B_Is_Special__c = false AND Product.ProductClass != ' +
            '\'' +
            B2B_Constants.VARIATION_PARENT +
            '\'' +
            ' AND (ProductCategory.Name IN :categoryNameSet OR ProductCategory.ParentCategory.Name LIKE ' +
            '\'' +
            newSearchString +
            '\'' +
            ' OR ProductCategory.ParentCategory.ParentCategory.Name LIKE ' +
            '\'' +
            newSearchString +
            '\'' +
            ' OR ProductCategory.ParentCategory.Name LIKE ' +
            '\'' +
            newSearchStringWithRegEx +
            '\'' +
            ' OR ProductCategory.ParentCategory.ParentCategory.Name LIKE ' +
            '\'' +
            newSearchStringWithRegEx +
            '\'';
        searchQuery += queryCondition + ')';
        productCategoryWrapper.productList = Database.query(searchQuery);
        productCategoryWrapper.productCategoryList = [
            SELECT Id, Name, B2B_Search_Result_Order__c, B2B_Category_External_ID__c, CreatedDate
            FROM ProductCategory
            ORDER BY B2B_Search_Result_Order__c ASC NULLS LAST
        ];
        return productCategoryWrapper;
    }

    /**
     * @description This method will get the products from connect API
     * BS-444
     * @author Vishalsingh G
     * @param communityId   current community Id
     * @param effectiveAccountId  account Id of a logged in User
     * @param productIdList product ids to fetch using connect ApI
     * @return               returns connect API response
     */
    @AuraEnabled(cacheable=false)
    public static Object productsSearch(String communityId, String effectiveAccountId, List<String> productIdList) {
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);
        return commerceProxy.getProducts(webstoreId, effectiveAccountId, productIdList, null, null, false, false);
    }

    /**
     * BS-402
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
     * BS-1179
     * @author : Aman Kumar
     * @description : This method will return the wrapper containing the
     * api name, label for the fields of field set on Product2 object.
     */
    @AuraEnabled
    public static List<B2B_ProductDataWrapper> getAttributeFieldData() {
        //Global describe call for storing the sobject data.
        Map<String, Schema.SObjectField> sObjectNameVsFieldMap = Schema.getGlobalDescribe()
            .get(B2B_Constants.PRODUCT_OBJECT_API_NAME)
            .getDescribe()
            .fields.getMap();

        List<B2B_ProductDataWrapper> productWrapperList = new List<B2B_ProductDataWrapper>();
        String fieldLabel;
        String fieldName;
        //Storing the api name, label and value of fields in field set into a wrapper.
        for (Schema.FieldSetMember field : SObjectType.Product2.FieldSets.Product_Search_Card_Attributes.getFields()) {
            fieldName = field.getFieldPath();
            fieldLabel = sObjectNameVsFieldMap.get(fieldName).getDescribe().getLabel();
            B2B_ProductDataWrapper productWrapper = new B2B_ProductDataWrapper();
            productWrapper.fieldApiName = fieldName;
            productWrapper.fieldLabel = fieldLabel;
            productWrapperList.add(productWrapper);
        }
        return productWrapperList;
    }

    /**
     * BS-1562
     * @description updates cart item customer input fields
     * @param cartItemId     ID of the cart item to be updated.
     * @param customerInputs Customer name and Clerk data of
     *        cart item to be updated.
     * @return CartItem      The updated cart item
     */
    @AuraEnabled
    public static CartItem updateCartItem(String cartItemId, String customerInputs) {
        List<B2B_CartItemCustomerInputFieldsWrapper> cartItemCustomerInputFieldsWrapperList = (List<B2B_CartItemCustomerInputFieldsWrapper>) JSON.deserialize(
            customerInputs,
            List<B2B_CartItemCustomerInputFieldsWrapper>.class
        );
        CartItem cartItemObj = new CartItem();
        cartItemObj.Id = cartItemId;
        for (B2B_CartItemCustomerInputFieldsWrapper customerInputObj : cartItemCustomerInputFieldsWrapperList) {
            if (customerInputObj.fieldAPIName == B2B_Constants.CART_ITEM_CUSTOMER_REFERENCE_FIELD) {
                cartItemObj.Customer_Reference__c = customerInputObj.value;
            } else if (customerInputObj.fieldAPIName == B2B_Constants.CART_ITEM_ENTERED_BY_FIELD) {
                cartItemObj.Entered_By__c = customerInputObj.value;
            }
        }
        update cartItemObj;
        return cartItemObj;
    }

    /**
     * BS-1562
     * @description Gets the value of Customer Name and clerk name for existing cartItem
     * @param cartItemId : ID of the cart item to be updated.
     * @return CartItem : The updated cart item
     */
    @AuraEnabled(cacheable=false)
    public static CartItem getCartItemDetails(String cartItemId) {
        List<CartItem> cartItemList = new List<CartItem>();
        CartItem cartItemObj = new CartItem();

        if (String.isNotBlank(cartItemId)) {
            cartItemList = [SELECT Id, Customer_Reference__c, Entered_By__c FROM CartItem WHERE Id = :cartItemId];
        }
        if (cartItemList.isEmpty() == false) {
            cartItemObj = cartItemList[0];
        }
        return cartItemObj;
    }

    /**
     * BS-402
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
     * BS-442
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
        @AuraEnabled
        public List<String> placementList;
    }

    /**
     * BS-442
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
        public Decimal sliderMinimumValue; //BS-457
        @AuraEnabled
        public Decimal sliderMaximumValue; //BS-457
        @AuraEnabled
        public Decimal sliderIncrementValue; //BS-457
        @AuraEnabled
        public Integer sliderSelectedLeftValue; //BS-457
        @AuraEnabled
        public Integer sliderSelectedRightValue; //BS-457
        @AuraEnabled
        public String sliderType; //BS-457
        @AuraEnabled
        public List<String> filterValuesList;
        @AuraEnabled
        public List<String> placementList;
        @AuraEnabled
        public List<String> controllingFieldList;
        @AuraEnabled
        public List<String> controllingParametersList;
        @AuraEnabled
        public List<String> categorySHList;
        @AuraEnabled
        public List<String> categoryEEList;
        @AuraEnabled
        public List<String> categoryNBList;
        @AuraEnabled
        public List<String> brandsList;
        @AuraEnabled
        public Boolean isMultiselect; //BS-930 : Boolean to identify if user is allowed to have multiple selection from this filter
    }

    /**
     * BS-442
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
     * BS-442
     * @description Wrapper to be returned containing picklist field name and respective values
     */
    public class B2B_PicklistFieldWrapper {
        @AuraEnabled
        public String fieldName { get; set; }
        @AuraEnabled
        public List<B2B_PicklistValuesWrapper> picklistValues { get; set; }
    }

    /**
     * BS-444
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
     * BS-1253
     * @description Wrapper for category details and all the categories
     */
    public class B2B_CategoryDetailsWrapper {
        @AuraEnabled
        public Map<Id, B2B_CategoryNameWrapper> productCategoryVsParentCategoryIdMap;
        @AuraEnabled
        public List<AggregateResult> categoryProductCountList;
    }

    /**
     * BS-1253
     * @description Wrapper for category details and all the categories
     */
    public class B2B_CategoryNameWrapper {
        @AuraEnabled
        public String parentCategoryId;
        @AuraEnabled
        public String categoryName;
        @AuraEnabled
        public String categoryLabel; //Added as a part of BS-1595
    }

    /**
     * BS-951
     */
    public class B2B_productCategoryWrapper {
        @AuraEnabled
        public List<ProductCategory> productCategoryList { get; set; }
        @AuraEnabled
        public List<ProductCategoryProduct> productList { get; set; }
    }

    /**
     * BS-1562
     * @description Wrapper for Cart Item customer Input field and value
     */
    public class B2B_CartItemCustomerInputFieldsWrapper {
        @AuraEnabled
        public String value;

        @AuraEnabled
        public String fieldAPIName;
    }
    /**
     * @author VishalSingh Gaur
     * @desc this method returns the count of colours and available sizes in which the product is available
     * Added as part of BS-2226
     */
    @AuraEnabled(cacheable=false)
    public static Map<Id, List<String>> getColorCountAndSizeforProduct(List<String> productIdList) {
        Map<Id, List<String>> productIdVsProductColourCountAndSizeMap = new Map<Id, List<String>>();
        Map<Id, String> variantProductIdVsSizeMap = new Map<Id, String>();
        Map<Id, Integer> productIdVsProductColourCountMap = new Map<Id, Integer>();
        Map<Id, Integer> variantParentIdvsColorCountMap = new Map<Id, Integer>();
        if (productIdList != null && !productIdList.isEmpty()) {
            List<ProductAttribute> productAttributeList = [SELECT Product.Id, VariantParentId FROM ProductAttribute WHERE Product.Id IN :productIdList];
            Set<Id> variantParentIdSet = new Set<Id>();
            for (ProductAttribute productAttribute : productAttributeList) {
                if (productAttribute.VariantParentId != null) {
                    variantParentIdSet.add(productAttribute.VariantParentId);
                }
            }
            if (!variantParentIdSet.isEmpty()) {
                List<AggregateResult> productColorCountList = [
                    SELECT COUNT_DISTINCT(B2B_Color__c) colorCount, VariantParentId
                    FROM ProductAttribute
                    WHERE VariantParentId IN :variantParentIdSet
                    GROUP BY VariantParentId
                ];
                for (AggregateResult productColorCount : productColorCountList) {
                    Id variantParentId = (Id) productColorCount.get('VariantParentId');
                    Integer colorCount = (Integer) productColorCount.get('colorCount');
                    variantParentIdvsColorCountMap.put(variantParentId, colorCount);
                }
                List<ProductAttribute> productSizeList = [
                    SELECT B2B_EE_Size__c, VariantParentId, ProductId
                    FROM ProductAttribute
                    WHERE VariantParentId IN :variantParentIdSet
                ];
                if (!productSizeList.isEmpty()) {
                    for (ProductAttribute productAttribute : productSizeList) {
                        if (!variantProductIdVsSizeMap.containsKey(productAttribute.VariantParentId)) {
                            String eeSize = (String) productAttribute.B2B_EE_Size__c;
                            variantProductIdVsSizeMap.put(productAttribute.VariantParentId, eeSize);
                        } else {
                            if (productAttribute.B2B_EE_Size__c != null) {
                                if (!variantProductIdVsSizeMap.get(productAttribute.VariantParentId).contains(productAttribute.B2B_EE_Size__c)) {
                                    String eeSize = variantProductIdVsSizeMap.get(productAttribute.VariantParentId) + ',' + productAttribute.B2B_EE_Size__c;
                                    variantProductIdVsSizeMap.put(productAttribute.VariantParentId, eeSize);
                                }
                            }
                        }
                    }
                }
            }
            for (ProductAttribute productAttribute : productAttributeList) {
                List<String> colorCountAndSizeList = new List<String>();
                colorCountAndSizeList.add((String.valueOf(variantParentIdvsColorCountMap.get(productAttribute.VariantParentId))));
                colorCountAndSizeList.add(variantProductIdVsSizeMap.get(productAttribute.VariantParentId));
                productIdVsProductColourCountAndSizeMap.put(productAttribute.Product.Id, colorCountAndSizeList);
            }
        }
        return productIdVsProductColourCountAndSizeMap;
    }

    /**
     * @author VishalSingh Gaur
     * @desc this method returns the unique combinations of Bridge/Temple lengths in which the product is available
     * Added as part of BS-2226
     */
    @AuraEnabled(cacheable=false)
    public static Map<Id, Integer> getBridgeTempleCountforProduct(List<String> productIdList) {
        Map<Id, Integer> productIdVsBridgeTempleCountMap = new Map<Id, Integer>();
        if (productIdList != null && !productIdList.isEmpty()) {
            // Query ProductAttributes for the given product IDs
            List<ProductAttribute> productAttributeList = [SELECT Product.Id, VariantParentId FROM ProductAttribute WHERE Product.Id IN :productIdList];

            Set<Id> variantParentIdSet = new Set<Id>();
            for (ProductAttribute productAttribute : productAttributeList) {
                if (productAttribute.VariantParentId != null) {
                    variantParentIdSet.add(productAttribute.VariantParentId);
                }
            }

            if (!variantParentIdSet.isEmpty()) {
                // Query ProductAttributes for the variant parent IDs
                List<ProductAttribute> productAttributesList = [
                    SELECT B2B_Bridge_Size__c, B2B_Temple_Length__c, VariantParentId
                    FROM ProductAttribute
                    WHERE VariantParentId IN :variantParentIdSet
                ];

                // Map to hold the unique combinations of Bridge and Temple size per Variant Parent ID
                Map<Id, Set<String>> variantParentIdToBridgeTempleSetMap = new Map<Id, Set<String>>();

                for (ProductAttribute productAttribute : productAttributesList) {
                    Id variantParentId = productAttribute.VariantParentId;
                    String bridgeTempleCombination = productAttribute.B2B_Bridge_Size__c + productAttribute.B2B_Temple_Length__c;

                    if (!variantParentIdToBridgeTempleSetMap.containsKey(variantParentId)) {
                        variantParentIdToBridgeTempleSetMap.put(variantParentId, new Set<String>());
                    }
                    variantParentIdToBridgeTempleSetMap.get(variantParentId).add(bridgeTempleCombination);
                }

                Map<Id, Integer> variantParentIdVsBridgeTempleCountMap = new Map<Id, Integer>();
                for (Id variantParentId : variantParentIdToBridgeTempleSetMap.keySet()) {
                    variantParentIdVsBridgeTempleCountMap.put(variantParentId, variantParentIdToBridgeTempleSetMap.get(variantParentId).size());
                }

                for (ProductAttribute productAttribute : productAttributeList) {
                    Id productId = productAttribute.Product.Id;
                    Id variantParentId = productAttribute.VariantParentId;

                    if (variantParentId != null && variantParentIdVsBridgeTempleCountMap.containsKey(variantParentId)) {
                        productIdVsBridgeTempleCountMap.put(productId, variantParentIdVsBridgeTempleCountMap.get(variantParentId));
                    } else {
                        productIdVsBridgeTempleCountMap.put(productId, 0);
                    }
                }
            }
        }

        return productIdVsBridgeTempleCountMap;
    }
}
