/**
 * @author Aman Kumar
 * @email aman.kumar@theblueflamelabs.com
 * @create date 2022-07-22 15:16:37
 * @modify date 2022-07-22 15:16:37
 * @modify date 2022-11-10 17:13:00
 * @desc this class is handling the Ordered Product Requests from b2b_reorderComponent.
 */
@SuppressWarnings('PMD.UnusedLocalVariable')
public without sharing class B2B_ReorderComponentController {
    @TestVisible
    private static B2B_CommerceProxy commerceProxy = new B2B_CommerceProxy();

    /**
     * @description               This method is used to get the list of category Ids.
     * @author Aman Kumar
     * @param  storeName          Name of store on which the storefront user is logged in.
     * @return List of Category Ids
     */
    @AuraEnabled(cacheable=false)
    public static List<String> getAllCategoryId(String storeName) {
        String catalogName;
        if (String.isNotBlank(storeName) && storeName.equalsIgnoreCase(B2B_Constants.SILHOUETTE_STORE)) {
            catalogName = B2B_Constants.SILHOUETTE_CATALOG;
        } else if (storeName != null && storeName.equalsIgnoreCase(B2B_Constants.NEUBAU_STORE)) {
            catalogName = B2B_Constants.NEUBAU_CATALOG;
        }
        List<String> categoryIdList = new List<String>();
        for (ProductCategory categoryObj : [SELECT Id, Name FROM ProductCategory WHERE Catalog.Name = :catalogName AND ParentCategoryId = NULL]) {
            categoryIdList.add(categoryObj.Id);
        }

        return categoryIdList;
    }

    /**
     * @description        This method is used to get the Products
     * BS-524
     * @author Aman Kumar
     * @param communityId  The Id of the community from which the call originated
     * @param searchQuery  Dynamic query which will be passed to connectApi.ProductSearchInput
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @return Object of ConnectApi.ProductSearchResults.
     */
    @AuraEnabled(cacheable=false)
    public static Object productSearch(String communityId, String searchQuery, String effectiveAccountId) {
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        ConnectApi.ProductSearchInput searchInput = (ConnectApi.ProductSearchInput) JSON.deserialize(searchQuery, ConnectApi.ProductSearchInput.class);
        return commerceProxy.searchProducts(webstoreId, effectiveAccountId, searchInput);
    }

    /**
     * @description         This method is used to get the list of Ids of Ordered Products
     * BS-524
     * @author Aman Kumar
     * @param periodValue   Time period till the data is fetched
     * @param sourceValue   Source value from the order source picklist
     * @param sortByValue   Sort By value which is used to handle the sorting of the data.
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @param orderId        Order Id for which the Product IDs needs to be fetched (Added as part of BS-525)
     * @return List of Product Ids
     */
    @AuraEnabled(cacheable=false)
    public static B2B_ReorderComponentWrapper getOrderedProductsId(
        String periodValue,
        String sourceValue,
        String sortByValue,
        String effectiveAccountId,
        String orderId
    ) {
        //List<String> commerceEntitlementPolicyIdList = B2B_SearchController.getPolicy(effectiveAccountId); BS-858
        List<String> commerceEntitlementProductIdList = B2B_SearchController.searchProducts(effectiveAccountId);
        B2B_ReorderComponentWrapper reorderCompWrapperObj = new B2B_ReorderComponentWrapper();

        // Fetching the B2B Order record type id
        Id b2bOrderRecordtypeId = Schema.SObjectType.Order.getRecordTypeInfosByDeveloperName()
            .get(B2B_Constants.B2B_ORDER_RECORDTYPE_DEVELOPERNAME)
            .getRecordTypeId();
        List<String> productIdList = new List<String>();
        String createdDateTime = DateTime.now().addMonths(-Integer.valueOf(String.escapeSingleQuotes(periodValue))).formatGMT('yyyy-MM-dd\'T\'HH:mm:ss.SSSZ');

        // Creating a dynamic query based on the 'Period', 'Source' and 'Sort By' value that are being set from the reorder component.
        String query =
            'SELECT Id, Product2Id,Order.Order_Source__c FROM OrderItem WHERE Order.AccountId =\'' +
            String.escapeSingleQuotes(effectiveAccountId) +
            '\' AND Order.RecordTypeId =\'' +
            String.escapeSingleQuotes(b2bOrderRecordtypeId);

        query = query + '\' AND Order.B2B_Order_Type__c = null AND Order.OrderedDate >' + String.escapeSingleQuotes(createdDateTime);
        if (String.isNotBlank(sourceValue)) {
            query = query + ' AND Order.Order_Source__c = \'' + String.escapeSingleQuotes(sourceValue) + '\'';
        }
        if (String.isNotBlank(orderId)) {
            query = query + ' AND OrderId   = \'' + String.escapeSingleQuotes(orderId) + '\'';
        }
        query = query + ' AND Product2Id IN: commerceEntitlementProductIdList' + ' ORDER BY ' + String.escapeSingleQuotes(sortByValue);
        List<OrderItem> orderItemList = Database.query(query);
        Set<String> productIdSet = new Set<String>();
        if (String.isNotBlank(orderId) && orderItemList.isEmpty() == false) {
            reorderCompWrapperObj.orderSource = orderItemList[0].Order.Order_Source__c;
        }

        // Adding the product ids returned from the query in the set 'productIdSet'
        for (OrderItem orderItemObj : orderItemList) {
            productIdSet.add(orderItemObj.Product2Id);
        }

        // Cloning the set into a list
        if (productIdSet.isEmpty() == false) {
            productIdList = new List<String>(productIdSet);

            List<Product2> productList = B2B_Utils.getAllProducts(productIdList, '');
            reorderCompWrapperObj.productList = productList;
            return reorderCompWrapperObj;
        }
        return null;
    }

    /**
     * @description        This method is used to get Product Ids in sorted order.
     * BS-524
     * @author Aman Kumar
     * @param productList  List of Product Ids
     * @param fieldName    Name of the field.
     * @return             list of sorted product ids.
     */
    @AuraEnabled(cacheable=false)
    public static List<String> getSortedProductsIds(List<String> productList, String fieldName, Id effectiveAccountId) {
        List<String> productIdList = new List<String>();
        Map<String, List<String>> valueVsProductIdListMap = new Map<String, List<String>>();

        Id orderRecordTypeId = Schema.SObjectType.Order.getRecordTypeInfosByDeveloperName()
            .get(B2B_Constants.B2B_ORDER_RECORDTYPE_DEVELOPERNAME)
            .getRecordTypeId();
        // Fetching all data from OrderItem Related to the given list of productId
        for (OrderItem orderItemObj : [
            SELECT Id, Product2Id, Product2.Name, Product2.StockKeepingUnit, Order.OrderedDate
            FROM OrderItem
            WHERE Order.AccountId = :effectiveAccountId AND Order.RecordTypeId = :orderRecordTypeId AND Product2Id IN :productList AND Order.OrderedDate != NULL
        ]) {
            // Checking the field name and accordingly filling the map
            if (
                String.isNotBlank(fieldName) &&
                fieldName.containsIgnoreCase('Product2.Name') &&
                valueVsProductIdListMap.containsKey(orderItemObj.Product2.Name) &&
                valueVsProductIdListMap.get(orderItemObj.Product2.Name).contains(orderItemObj.Product2Id) == false
            ) {
                valueVsProductIdListMap.get(orderItemObj.Product2.Name).add(orderItemObj.Product2Id);
            } else if (
                String.isNotBlank(fieldName) &&
                fieldName.containsIgnoreCase('Product2.Name') &&
                valueVsProductIdListMap.containsKey(orderItemObj.Product2.Name) &&
                valueVsProductIdListMap.get(orderItemObj.Product2.Name).contains(orderItemObj.Product2Id)
            ) {
                valueVsProductIdListMap.get(orderItemObj.Product2.Name)
                    .remove(valueVsProductIdListMap.get(orderItemObj.Product2.Name).indexOf(orderItemObj.Product2Id));
                valueVsProductIdListMap.get(orderItemObj.Product2.Name).add(orderItemObj.Product2Id);
            } else if (
                String.isNotBlank(fieldName) &&
                fieldName.containsIgnoreCase('Product2.Name') &&
                valueVsProductIdListMap.containsKey(orderItemObj.Product2.Name) == false
            ) {
                valueVsProductIdListMap.put(orderItemObj.Product2.Name, new List<String>{ orderItemObj.Product2Id });
            } else if (
                String.isNotBlank(fieldName) &&
                fieldName.containsIgnoreCase('Product2.StockKeepingUnit') &&
                valueVsProductIdListMap.containsKey(orderItemObj.Product2.StockKeepingUnit) &&
                valueVsProductIdListMap.get(orderItemObj.Product2.StockKeepingUnit).contains(orderItemObj.Product2Id) == false
            ) {
                valueVsProductIdListMap.get(orderItemObj.Product2.StockKeepingUnit).add(orderItemObj.Product2Id);
            } else if (
                String.isNotBlank(fieldName) &&
                fieldName.containsIgnoreCase('Product2.StockKeepingUnit') &&
                valueVsProductIdListMap.containsKey(orderItemObj.Product2.StockKeepingUnit) &&
                valueVsProductIdListMap.get(orderItemObj.Product2.StockKeepingUnit).contains(orderItemObj.Product2Id)
            ) {
                valueVsProductIdListMap.get(orderItemObj.Product2.StockKeepingUnit)
                    .remove(valueVsProductIdListMap.get(orderItemObj.Product2.StockKeepingUnit).indexOf(orderItemObj.Product2Id));
                valueVsProductIdListMap.get(orderItemObj.Product2.StockKeepingUnit).add(orderItemObj.Product2Id);
            } else if (
                String.isNotBlank(fieldName) &&
                fieldName.containsIgnoreCase('Product2.StockKeepingUnit') &&
                valueVsProductIdListMap.containsKey(orderItemObj.Product2.StockKeepingUnit) == false
            ) {
                valueVsProductIdListMap.put(orderItemObj.Product2.StockKeepingUnit, new List<String>{ orderItemObj.Product2Id });
            } else if (
                String.isNotBlank(fieldName) &&
                fieldName.containsIgnoreCase('Order.OrderedDate') &&
                valueVsProductIdListMap.containsKey(orderItemObj.Order.OrderedDate.formatGMT('yyyy-MM-dd kk:mm:ss.SSS')) &&
                valueVsProductIdListMap.get(orderItemObj.Order.OrderedDate.formatGMT('yyyy-MM-dd kk:mm:ss.SSS')).contains(orderItemObj.Product2Id) == false
            ) {
                valueVsProductIdListMap.get(orderItemObj.Order.OrderedDate.formatGMT('yyyy-MM-dd kk:mm:ss.SSS')).add(orderItemObj.Product2Id);
            } else if (
                String.isNotBlank(fieldName) &&
                fieldName.containsIgnoreCase('Order.OrderedDate') &&
                valueVsProductIdListMap.containsKey(orderItemObj.Order.OrderedDate.formatGMT('yyyy-MM-dd kk:mm:ss.SSS')) &&
                valueVsProductIdListMap.get(orderItemObj.Order.OrderedDate.formatGMT('yyyy-MM-dd kk:mm:ss.SSS')).contains(orderItemObj.Product2Id)
            ) {
                valueVsProductIdListMap.get(orderItemObj.Order.OrderedDate.formatGMT('yyyy-MM-dd kk:mm:ss.SSS'))
                    .remove(valueVsProductIdListMap.get(orderItemObj.Order.OrderedDate.formatGMT('yyyy-MM-dd kk:mm:ss.SSS')).indexOf(orderItemObj.Product2Id));
                valueVsProductIdListMap.get(orderItemObj.Order.OrderedDate.formatGMT('yyyy-MM-dd kk:mm:ss.SSS')).add(orderItemObj.Product2Id);
            } else if (
                String.isNotBlank(fieldName) &&
                fieldName.containsIgnoreCase('Order.OrderedDate') &&
                valueVsProductIdListMap.containsKey(orderItemObj.Order.OrderedDate.formatGMT('yyyy-MM-dd kk:mm:ss.SSS')) == false
            ) {
                valueVsProductIdListMap.put(orderItemObj.Order.OrderedDate.formatGMT('yyyy-MM-dd kk:mm:ss.SSS'), new List<String>{ orderItemObj.Product2Id });
            }
        }
        if (valueVsProductIdListMap != null) {
            List<String> keyValueList = new List<String>();
            keyValueList.addAll(valueVsProductIdListMap.keySet());
            keyValueList.sort();
            for (String keyValue : keyValueList) {
                for (String valueFromMap : valueVsProductIdListMap.get(keyValue)) {
                    if (productIdList.indexOf(valueFromMap) == -1) {
                        productIdList.add(valueFromMap);
                    } else {
                        productIdList.remove(productIdList.indexOf(valueFromMap));
                        productIdList.add(valueFromMap);
                    }
                }
            }
        }
        // Checking if the field name is containing 'Desc' and returning the list in reverse order if true.
        if (fieldName.containsIgnoreCase('DESC')) {
            List<String> productIdTempList = new List<String>();
            for (Integer index = productIdList.size() - 1; index >= 0; index--) {
                productIdTempList.add(productIdList[index]);
            }
            if (productIdTempList.isEmpty() == false) {
                productIdList = productIdTempList;
            }
        }
        return productIdList;
    }
    @AuraEnabled
    public static Object getOrderedProductData(String communityId, String effectiveAccountId, List<String> productIds) {
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);
        return commerceProxy.getProducts(webstoreId, effectiveAccountId, productIds, new List<String>(), new List<String>(), false, false);
    }

    /**
     * BS-528
     * @description this method will return the Source Product Ids from B2B Commerce Product Link Object.
     */
    @AuraEnabled(cacheable=true)
    public static List<B2B_Commerce_Product_Link__c> getChassisProducts() {
        List<B2B_Commerce_Product_Link__c> sourceProductObjList = [
            SELECT ID, B2B_Source_Product__c, B2B_Target_Product__c
            FROM B2B_Commerce_Product_Link__c
            WHERE B2B_Type__c = :B2B_Constants.DEMO_TO_CHASSIS_VALUE
        ];

        return sourceProductObjList;
    }

    public class B2B_ReorderComponentWrapper {
        @AuraEnabled
        public List<Product2> productList;
        @AuraEnabled
        public String orderSource;
    }

    /**
     * @description      This method is used to get the additional information for displaying on product card.
     * BS-650
     * @author Aman Kumar
     * @param productId  Product Id, Effective Account Id
     * @return           Order record containing source and created date.
     */
    @AuraEnabled
    public static List<OrderItem> getOrderAdditionalInformation(Id productId, String effectiveAccountId, String orderSource) {
        List<OrderItem> orderItemList = new List<OrderItem>();

        if (String.isBlank(orderSource)) {
            //BS-772 Added order Orderdate in query and order by
            //modified as a part of BS-1954
            orderItemList = [
                SELECT Id, CreatedDate, toLabel(Order.Order_Source__c), Order.AccountId, Order.CreatedDate, Order.OrderedDate
                FROM OrderItem
                WHERE Product2Id = :productId AND Order.AccountId = :effectiveAccountId
                ORDER BY Order.OrderedDate DESC
                LIMIT 1
            ];
        } else {
            //BS-772 Added order Orderdate in query and order by
            //modified as a part of BS-1954
            orderItemList = [
                SELECT Id, CreatedDate, toLabel(Order.Order_Source__c), Order.AccountId, Order.CreatedDate, Order.OrderedDate
                FROM OrderItem
                WHERE Product2Id = :productId AND Order.AccountId = :effectiveAccountId AND Order.Order_Source__c = :orderSource
                ORDER BY Order.OrderedDate DESC
                LIMIT 1
            ];
        }

        return orderItemList;
    }
}
