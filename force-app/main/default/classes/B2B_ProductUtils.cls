/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-06-27 15:10:41
 * @modify date 2022-06-27 15:10:41
 * @desc product related util class
 */

public with sharing class B2B_ProductUtils {
    @TestVisible
    private static B2B_CommerceProxy commerceProxy = new B2B_CommerceProxy();

    @AuraEnabled(cacheable=true)
    public static ConnectApi.ProductDetail getProduct(String communityId, String productId, String effectiveAccountId, List<String> fields) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCatalog_static_methods.htm#apex_ConnectAPI_CommerceCatalog_static_methods
        return commerceProxy.getProduct(webstoreId, productId, effectiveAccountID, fields);
    }

    /**
     * @description Retrieve price data for multiple products
     * @param String communityId
     * @param String effectiveAccountId
     * @param List<Id> list of Product Ids
     * @return ConnectApi.PricingResult
     **/
    @AuraEnabled(cacheable=true)
    public static ConnectApi.PricingResult getProductPrices(String communityId, String effectiveAccountId, List<Id> productIds) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        ConnectApi.PricingInput pricingInput = new ConnectApi.PricingInput();
        List<ConnectApi.PricingLineItemInput> pricingLineInputList = new List<ConnectApi.PricingLineItemInput>();
        for (Id productId : productIds) {
            ConnectApi.PricingLineItemInput lineItemInput = new ConnectApi.PricingLineItemInput();
            lineItemInput.productId = productId;
            pricingLineInputList.add(lineItemInput);
        }

        pricingInput.pricingLineItems = pricingLineInputList;
        return getProductPrices(webstoreId, effectiveAccountId, pricingInput);
    }

    /**
     * @description Retrieve price data for multiple products
     * @param String communityId
     * @param String effectiveAccountId
     * @param ConnectApi.PricingInput pricingInput
     * @return ConnectApi.PricingResult
     **/
    public static ConnectApi.PricingResult getProductPrices(String communityId, String effectiveAccountId, ConnectApi.PricingInput pricingInput) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        return commerceProxy.getProductPrices(webstoreId, effectiveAccountId, pricingInput);
    }
}
