@isTest
private with sharing class D2C_ProductCardControllerTest {
    @testSetup
    static void setup() {
        List<Product2> productList = D2C_TestDataFactory.createProducts(2);
        insert productList;
        List<String> productIdList = new List<String>();
        for (Product2 product : productList) {
            productIdList.add(product.Id);
        }
        List<B2B_Product_Image__c> productImagesList = D2C_TestDataFactory.createProductImages(productIdList);
        insert productImagesList;
    }

    @isTest
    private static void getProductImagesTest() {
        List<Product2> insertedProductList = [SELECT Id FROM Product2 LIMIT 2];
        List<String> productIdList = new List<String>();
        for (Product2 product : insertedProductList) {
            productIdList.add(product.Id);
        }
        Test.startTest();
        List<B2B_Product_Image__c> productImageList = D2C_ProductCardController.getProductImages(productIdList);
        Assert.areEqual(2, productImageList.size(), 'Product images returned correctly');
        Test.stopTest();
    }

    @isTest
    private static void getColorsMetadataTest() {
        Test.startTest();
        String mapColorCodes = D2C_ProductCardController.getColorsMetadata();
        Test.stopTest();
        Assert.areNotEqual(null, mapColorCodes, 'Should Return a String value');
    }
}
