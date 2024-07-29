@isTest
public with sharing class D2C_VTO_TestDataFactory {
    /**
     * DVM21-45
     * @description This reusable method is used to create product records according to provided input
     * @author Shrikant Dangi
     * @param productCount  :   Number of products that needs to be created
     * @return productList  :   Output Collection of type list containing product records
     */
    public static List<Product2> createD2CVTOProductsRecords(Integer productCount) {
        if (productCount != null) {
            List<Product2> productList = new List<Product2>();
            for (Integer index = 0; index < productCount; index++) {
                Product2 product = new Product2();
                product.Name = 'Test Product' + index;
                product.Type = null;
                product.StockKeepingUnit = 'TEST SKU' + index;
                product.IsActive = true;
                product.B2B_Frame_Color_Description__c = 'dark Grey';
                product.B2B_Hexcode__c = '#667596';
                product.B2B_Hexcode_Accent__c = null;
                product.B2B_Shape_Size__c = '50';
                product.B2B_Bridge_Size__c = '21';
                product.B2B_Temple_Length__c = '140';
                product.B2C_Material__c = 'natural Acetate';
                product.Product_Description__c = 'Test Product Description';
                product.B2B_Lens_Technology__c = 'EF101;EF104';
                product.B2B_Model_Name__c = 'Accent Shades 8164';
                product.B2B_Lens_Technology__c = 'Mirrored;Polarised filter - Intelligent sun protection;Anti-reflective coating on backside;Prescription ready';
                productList.add(product);
            }
            return productList;
        } else {
            return null;
        }
    }

    /**
     * DVM21-45
     * @description This reusable method is used to create product images for D2C Products for provided media type
     * @author Shrikant Dangi
     * @param productImagesToBeCreated  :   Number of product Images that needs to be created
     * @param productImageType          :   Type of image that needs to be created (Model Image/Product Image)
     * @param productIdsList            :   List containing Ids of products that needs to be mapped againt product image records.
     * @return productImagesList        :   Output Collection of type list containing product image records
     */
    public static List<B2B_Product_Image__c> createD2CVTOProductImagesRecords(
        Integer productImagesToBeCreated,
        String productImageType,
        List<Product2> productIdsList
    ) {
        if (productImagesToBeCreated != null && String.isNotBlank(productImageType) && productIdsList.isEmpty() == false) {
            List<B2B_Product_Image__c> productImagesList = new List<B2B_Product_Image__c>();
            for (Integer index = 0; index < productImagesToBeCreated; index++) {
                B2B_Product_Image__c productImage = new B2B_Product_Image__c();

                //If the image type is 'Model Image' then creating single model image record for every product as model images cannot be multiple for single product
                if (productImagesToBeCreated == productIdsList.size() && productImageType.equalsIgnoreCase(D2C_Constants.MODEL_IMAGE)) {
                    productImage.B2B_Product__c = productIdsList[index] != null && productIdsList[index].Id != null ? productIdsList[index].Id : null;
                } else {
                    //If the image type is  other than 'Model Image' then creating multiple images record for single product as there can be multiple images for single product
                    productImage.B2B_Product__c = productIdsList[0] != null && productIdsList[0].Id != null ? productIdsList[index].Id : null;
                }
                productImage.B2B_Image_Order__c = 0;
                productImage.B2B_Image_Title__c = 'Test Model Image' + index;
                productImage.B2B_Image_URL__c = 'Test_Image_URL';
                productImage.D2C_Product_Image_Type__c = 'Product Image';
                productImage.D2C_Available_In__c = D2C_VTO_Constants.VTO_VALUE;
                productImage.D2C_Active__c = true;
                productImage.B2B_Image_Alt_Text__c = 'Image ' + index + 'Alt Text';
                productImage.CurrencyIsoCode = 'USD';
                productImagesList.add(productImage);
            }
            return productImagesList;
        } else {
            return null;
        }
    }
}
