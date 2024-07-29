/**
 * This Class is dedicated specifically for Product Details Page to provide Product related details
 */
public with sharing class D2C_ProductDetailsController {
    /**
     * @description Returns a wrapper of the Product Images data from B2B Product Images
     * @author Shrihari
     * @param  productId          productId of the selected product
     * @return                    return List<D2C_ProductVariationDataWrapper>
     */
    @AuraEnabled(cacheable=true)
    public static List<D2C_ProductVariationDataWrapper> getProductImages(String productId) {
        List<D2C_ProductVariationDataWrapper> imageWrapperList = new List<D2C_ProductVariationDataWrapper>();
        for (
            B2B_Product_Image__c productImage : new D2C_FetchDataInSystemContext()
                .getProductImageList(new List<String>{ productId }, D2C_Constants.PRODUCT_IMAGE)
        ) {
            D2C_ProductVariationDataWrapper imageWrapper = new D2C_ProductVariationDataWrapper();
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
     * @description Gets all the Product variation records based on List of Product Ids
     * @author Shrihari
     * @param productIds         Variation ProductId's of the product selected from PLP
     * @return                   return List<D2C_ProductVariationDataWrapper>
     */
    @AuraEnabled(cacheable=true)
    public static List<D2C_ProductVariationDataWrapper> getProductVariationDetails(List<String> productIds) {
        Map<Id, List<B2B_Product_Image__c>> productIdVsProductImageListMap = new Map<Id, List<B2B_Product_Image__c>>();
        List<D2C_ProductVariationDataWrapper> productVariationDataWrapperList = new List<D2C_ProductVariationDataWrapper>();
        List<Product2> productRecordsList = new D2C_FetchDataInSystemContext().getProductRecords(productIds);
        List<B2B_Product_Image__c> productImagesRecordsList = new D2C_FetchDataInSystemContext().getProductImageList(productIds, D2C_Constants.PRODUCT_IMAGE);
        for (B2B_Product_Image__c productImage : productImagesRecordsList) {
            if (productIdVsProductImageListMap.containsKey(productImage.B2B_Product__c)) {
                productIdVsProductImageListMap.get(productImage.B2B_Product__c).add(productImage);
            } else {
                productIdVsProductImageListMap.put(productImage.B2B_Product__c, new List<B2B_Product_Image__c>{ productImage });
            }
        }
        for (Product2 product : productRecordsList) {
            D2C_ProductVariationDataWrapper productVariationWrapperObj = new D2C_ProductVariationDataWrapper();
            productVariationWrapperObj.ProductId = product.Id;
            productVariationWrapperObj.hexcode = product.B2B_Hexcode__c;
            productVariationWrapperObj.hexAccentCode = product.B2B_Hexcode_Accent__c;
            productVariationWrapperObj.colorName = product.B2B_Frame_Color_Description__c;
            productVariationWrapperObj.productImagesList = productIdVsProductImageListMap.containsKey(product.Id)
                ? productIdVsProductImageListMap.get(product.Id)
                : null;

            productVariationDataWrapperList.add(productVariationWrapperObj);
        }
        return productVariationDataWrapperList;
    }

    /**
     * NBD2C-73
     * @description Returns image URL of image type 'Packaging Image'
     * @author Shrihari
     * @param  productId          productId of the selected product
     * @return                    return List<D2C_ProductVariationDataWrapper>
     */
    @AuraEnabled(cacheable=true)
    public static List<D2C_ProductVariationDataWrapper> getPackagingImageUrl(String productId) {
        List<D2C_ProductVariationDataWrapper> imageWrapperList = new List<D2C_ProductVariationDataWrapper>();
        for (
            B2B_Product_Image__c productImage : new D2C_FetchDataInSystemContext()
                .getProductImageList(new List<String>{ productId }, D2C_Constants.PACKAGING_IMAGE)
        ) {
            D2C_ProductVariationDataWrapper imageWrapper = new D2C_ProductVariationDataWrapper();
            imageWrapper.imageURL = productImage.B2B_Image_URL__c;
            imageWrapper.imageAltText = productImage.B2B_Image_Alt_Text__c;
            imageWrapperList.add(imageWrapper);
        }
        return imageWrapperList;
    }

    /**
     * NBD2C-49
     * Inner class used to fetch the data in System Context
     */
    @TestVisible
    private without sharing class D2C_FetchDataInSystemContext {
        /**
         * @description Gets all the Product Images records based on List of Product Ids
         * @author Shrihari
         * @param productIds         List of ProductId's
         * @return                   return List<B2B_Product_Image__c>
         */
        @TestVisible
        private List<B2B_Product_Image__c> getProductImageList(List<String> productIdList, String productImageType) {
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
                    AND D2C_Product_Image_Type__c = :productImageType
                    AND D2C_Available_In__c INCLUDES (:D2C_Constants.D2C_VALUE)
                    AND D2C_Active__c = TRUE
                ORDER BY B2B_Image_Order__c
            ];
        }
        /**
         * @description Gets all the Product records based on List of Product Ids
         * @author Shrihari
         * @param productIds         List of ProductId's
         * @return                   return List<Product2>
         */
        @TestVisible
        private List<Product2> getProductRecords(List<String> productIds) {
            return [SELECT Id, Name, B2B_Frame_Color_Description__c, B2B_Hexcode__c, B2B_Hexcode_Accent__c FROM Product2 WHERE Id IN :productIds];
        }
    }

    /**
     * NBD2C-49
     * Wrapper to store the data of variation products
     */
    public class D2C_ProductVariationDataWrapper {
        @AuraEnabled
        public String productId;

        @AuraEnabled
        public String hexcode;

        @AuraEnabled
        public List<B2B_Product_Image__c> productImagesList;

        @AuraEnabled
        public String hexAccentCode;

        @AuraEnabled
        public String colorName;

        @AuraEnabled
        public String imageTitle;

        @AuraEnabled
        public String imageURL;

        @AuraEnabled
        public Integer imageOrder;

        @AuraEnabled
        public String imageAltText;

        @AuraEnabled
        public String currencyIsoCode;

        @AuraEnabled
        public Boolean lastImage = false;
    }
}
