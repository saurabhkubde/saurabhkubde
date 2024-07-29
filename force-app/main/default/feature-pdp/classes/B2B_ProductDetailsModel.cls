/**
 * @author Septimiu Dumitru
 * @email septimiu.dumitru@jpard.com
 * @create date 2022-09-26 11:23:18
 * @modify date 2022-09-26 11:23:18
 * @desc wrapper class for product details
 */

public with sharing class B2B_ProductDetailsModel {
    /**
     * @description Wrapper to return the product image attributes.
     */
    public class B2B_ProductImageWrapper {
        @AuraEnabled
        public String imageTitle { get; set; }
        @AuraEnabled
        public String imageAltText { get; set; }
        @AuraEnabled
        public Integer imageOrder { get; set; }
        @AuraEnabled
        public String imageUrl { get; set; }
        @AuraEnabled
        public String imageExternalId { get; set; }
        @AuraEnabled
        public Boolean lastImage { get; set; }
    }

    /**
     * @description Wrapper to return the product media attributes.
     */
    public class B2B_ProductMediaWrapper {
        @AuraEnabled
        public String mediaName { get; set; }
        @AuraEnabled
        public String productId { get; set; }
        @AuraEnabled
        public Integer mediaOrder { get; set; }
        @AuraEnabled
        public String mediaUrl { get; set; }
        @AuraEnabled
        public String mediaType { get; set; }
    }

    /**
     * @description Wrapper to return the product color attributes.
     */
    public class B2B_ProductColorWrapper {
        @AuraEnabled
        public String productId { get; set; }
        @AuraEnabled
        public String colorName { get; set; }
        @AuraEnabled
        public String hexCodeFrame { get; set; }
        @AuraEnabled
        public String hexCodeAccent { get; set; }
    }
}
