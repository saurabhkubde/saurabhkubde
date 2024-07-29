@isTest
private class D2C_VTO_ProductDetailsControllerTest {
    @TestSetup
    private static void createTestData() {
        List<Product2> productList = D2C_VTO_TestDataFactory.createD2CVTOProductsRecords(20);
        if (productList.isEmpty() == false) {
            insert productList;
            List<B2B_Product_Image__c> productImageList = D2C_VTO_TestDataFactory.createD2CVTOProductImagesRecords(
                productList.size(),
                D2C_VTO_Constants.PRODUCT_IMAGE,
                productList
            );
            if (productImageList.isEmpty() == false) {
                insert productImageList;
            }
        }
    }

    @isTest
    private static void getProductImagesTestPositive() {
        Test.startTest();
        List<Product2> productList = [SELECT Id FROM Product2 WHERE Name LIKE 'Test %' AND StockKeepingUnit LIKE 'Test SKU%' AND CreatedDate = TODAY];
        List<D2C_VTO_ProductDetailsController.D2C_VTO_ProductImageWrapper> productImageWrapperList = D2C_VTO_ProductDetailsController.getProductImages(
            productList[0].Id
        );
        Assert.areEqual(false, productImageWrapperList.isEmpty(), 'The returned D2C_ProductVariationDataWrapper list should not be empty');
        Test.stopTest();
    }

    @isTest
    private static void getProductImagesTestNegative() {
        Test.startTest();
        List<D2C_VTO_ProductDetailsController.D2C_VTO_ProductImageWrapper> productImageWrapperList = D2C_VTO_ProductDetailsController.getProductImages('');
        Assert.areEqual(true, productImageWrapperList.isEmpty(), 'The returned D2C_ProductVariationDataWrapper list should be empty');
        Test.stopTest();
    }

    @isTest
    public static void testGetColorsMetadata() {
        Test.startTest();
        Map<String, Object> metadataRecords = (Map<String, Object>) JSON.deserializeUntyped(D2C_VTO_ProductDetailsController.getColorsMetadata());
        Test.stopTest();
        System.assertEquals(true, metadataRecords.keySet().size() > 0, 'Should return custom metadata records');
    }
}
