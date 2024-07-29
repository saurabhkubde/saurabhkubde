/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-06-27 11:23:18
 * @modify date 2022-06-27 11:23:18
 * @desc wrapper class for featured products
 */

public with sharing class B2B_FeaturedProductsModel {
    public class B2B_ProductDetailWrapper {
        public String id { get; set; }
        public String name { get; set; }

        public ConnectApi.ProductMedia defaultImage { get; set; }
        public ConnectApi.ProductEntitlement entitlement { get; set; }
        public Map<String, Object> fields { get; set; }
        public List<ConnectApi.ProductMediaGroup> mediaGroups { get; set; }
        public ConnectApi.ProductCategoryPath primaryProductCategoryPath { get; set; }

        public B2B_ProductPricingWrapper prices { get; set; }
        public String modelNumber { get; set; } // Added as Part of BS-645

        public Integer sequence { get; set; }
    }

    public class B2B_ProductPricingWrapper {
        public String listPrice { get; set; }
        public String unitPrice { get; set; }

        public String pricebookEntryId { get; set; }
    }
}
