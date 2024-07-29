/*************************************************************************************************************
 * Controller class for NBD2C Store PLP page
 *  @author – Shrihari Kendre
 *  @email shrihari.kendre@theblueflamelabs.com
 *  @create date 2024-04-15 16:18:32
 ***************************************************************************************************************/
public without sharing class D2C_ProductCardController {
    /**
     * @description Get product Images from B2B_Product_Image__c Object based on product Ids
     * @author Shrihari Kendre
     * @param  productIds  List of product Ids
     * @return   List<B2B_Product_Image__c>
     */
    @AuraEnabled(cacheable=true)
    public static List<B2B_Product_Image__c> getProductImages(List<String> productIds) {
        List<B2B_Product_Image__c> productImageList = [
            SELECT Name, B2B_Image_Alt_Text__c, B2B_Image_Order__c, B2B_Image_Title__c, B2B_Image_URL__c, B2B_Product__c, B2B_External_Id__c
            FROM B2B_Product_Image__c
            WHERE B2B_Product__c IN :productIds AND D2C_Product_Image_Type__c = :D2C_Constants.MODEL_IMAGE
        ];
        return productImageList;
    }

    /**
     * @description Get metadata for the color values and hex codes
     * @author Shrihari Kendre
     * @return   Map of Color Metadata
     */
    @AuraEnabled(cacheable=true)
    public static String getColorsMetadata() {
        Map<String, B2B_Color_Filters__mdt> mapColorCodes = B2B_Color_Filters__mdt.getAll();
        return JSON.serialize(mapColorCodes);
    }
}
