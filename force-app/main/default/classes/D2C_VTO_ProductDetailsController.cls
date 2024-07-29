/**
 * @author : Shrikant Dangi
 * @email : shrikant.dangi@theblueflamelabs.com
 * @create date : 2024-06-12
 * @modify date : 2024-06-20
 * @desc : D2C VTO PDP controller class
 */
public with sharing class D2C_VTO_ProductDetailsController {
    /**
     * @description Retrieves the custom metadata type records.
     */
    @AuraEnabled(cacheable=true)
    public static String getColorsMetadata() {
        Map<String, B2B_Color_Filters__mdt> mapColorCodes = B2B_Color_Filters__mdt.getAll();
        return JSON.serialize(mapColorCodes);
    }

    /**
     * @description Returns a wrapper of the Product Images data from B2B Product Images
     * @author Shrikant Dangi
     * @param  productId          productId of the selected product
     * @return                    return List<D2C_VTO_ProductImageWrapper>
     */
    @AuraEnabled(cacheable=true)
    public static List<D2C_VTO_ProductImageWrapper> getProductImages(String productId) {
        List<D2C_VTO_ProductImageWrapper> imageWrapperList = new List<D2C_VTO_ProductImageWrapper>();
        for (B2B_Product_Image__c productImage : new D2C_VTO_FetchDataInSystemContext().getProductImageList(new List<String>{ productId })) {
            D2C_VTO_ProductImageWrapper imageWrapper = new D2C_VTO_ProductImageWrapper();
            imageWrapper.imageTitle = productImage.B2B_Image_Title__c;
            imageWrapper.imageURL = productImage.B2B_Image_URL__c;
            imageWrapper.imageOrder = (Integer) productImage.B2B_Image_Order__c;
            imageWrapper.imageAltText = productImage.B2B_Image_Alt_Text__c;
            imageWrapper.currencyIsoCode = productImage.CurrencyIsoCode;

            imageWrapperList.add(imageWrapper);
        }
        return imageWrapperList;
    }

    /**
     * Wrapper to store the data of variation products
     */
    public class D2C_VTO_ProductImageWrapper {
        @AuraEnabled
        public String imageTitle;

        @AuraEnabled
        public String imageURL;

        @AuraEnabled
        public Integer imageOrder;

        @AuraEnabled
        public String imageAltText;

        @AuraEnabled
        public Boolean lastImage = false;

        @AuraEnabled
        public String currencyIsoCode;
    }

    @TestVisible
    private without sharing class D2C_VTO_FetchDataInSystemContext {
        /**
         * @description Gets all the Product Images records based on List of Product Ids
         * @author Shrikant Dangi
         * @param productIds         List of ProductId's
         * @return                   return List<B2B_Product_Image__c>
         */
        @TestVisible
        private List<B2B_Product_Image__c> getProductImageList(List<String> productIdList) {
            return [
                SELECT
                    Id,
                    B2B_Image_Order__c,
                    B2B_Product__c,
                    D2C_Product_Image_Type__c,
                    D2C_Active__c,
                    D2C_Available_In__c,
                    B2B_Image_Alt_Text__c,
                    B2B_Image_Title__c,
                    B2B_Image_URL__c,
                    CurrencyIsoCode
                FROM B2B_Product_Image__c
                WHERE
                    B2B_Product__c IN :productIdList
                    AND D2C_Product_Image_Type__c = :D2C_VTO_Constants.PRODUCT_IMAGE
                    AND D2C_Available_In__c INCLUDES (:D2C_VTO_Constants.VTO_VALUE)
                    AND D2C_Active__c = TRUE
                ORDER BY B2B_Image_Order__c
            ];
        }
    }
}
