@isTest
private class D2C_ProductDetailsControllerTest {
    @TestSetup
    private static void createTestData() {
        //NBD2C-50 : Updated invocation of createD2CProductsRecords() by providing collection containing values for model and salesconcept field.
        List<Product2> productList = D2C_TestDataFactory.createD2CProductsRecords(
            20,
            new Map<String, List<String>>{ 'model' => new List<String>{ null }, 'salesConcept' => new List<String>{ null } }
        );
        if (productList.isEmpty() == false) {
            insert productList;
            List<B2B_Product_Image__c> productImageList = D2C_TestDataFactory.createD2CProductImagesRecords(
                productList.size(),
                D2C_Constants.MODEL_IMAGE,
                productList
            );
            if (productImageList.isEmpty() == false) {
                insert productImageList;
            }

            List<B2B_Product_Image__c> productPackagingImageList = D2C_TestDataFactory.createD2CProductImagesRecordsOfTypePackagingImage(
                5,
                D2C_Constants.PACKAGING_IMAGE,
                productList
            );
            if (productPackagingImageList.isEmpty() == false) {
                insert productPackagingImageList;
            }
        }
    }

    @isTest
    private static void getProductImageListTestPositive() {
        List<Product2> productList = [SELECT Id FROM Product2 WHERE Name LIKE 'Test Product%' AND CreatedDate = TODAY];
        List<String> productIdList = new List<String>();

        for (Product2 productRecord : productList) {
            productIdList.add(productRecord.Id);
        }
        Test.startTest();
        D2C_ProductDetailsController.D2C_FetchDataInSystemContext fetchDataInSystemContextObj = new D2C_ProductDetailsController.D2C_FetchDataInSystemContext();
        List<B2B_Product_Image__c> productImageList = fetchDataInSystemContextObj.getProductImageList(productIdList, D2C_Constants.PRODUCT_IMAGE);
        Test.stopTest();

        Assert.areEqual(20, productImageList.size(), 'The number of images returned is not equal to the inserted images');
    }

    @isTest
    private static void getProductImageListTestNegative() {
        Test.startTest();
        D2C_ProductDetailsController.D2C_FetchDataInSystemContext fetchDataInSystemContextObj = new D2C_ProductDetailsController.D2C_FetchDataInSystemContext();
        List<B2B_Product_Image__c> productImageList = fetchDataInSystemContextObj.getProductImageList(new List<String>(), D2C_Constants.PRODUCT_IMAGE);
        Test.stopTest();

        Assert.areEqual(0, productImageList.size(), 'The returned product image list should be empty');
    }

    @isTest
    private static void getProductRecordsTestPositive() {
        List<Product2> productList = [SELECT Id FROM Product2 WHERE Name LIKE 'Test Product%' AND CreatedDate = TODAY];
        List<String> productIdList = new List<String>();

        for (Product2 productRecord : productList) {
            productIdList.add(productRecord.Id);
        }
        Test.startTest();
        D2C_ProductDetailsController.D2C_FetchDataInSystemContext fetchDataInSystemContextObj = new D2C_ProductDetailsController.D2C_FetchDataInSystemContext();
        List<Product2> productDataList = fetchDataInSystemContextObj.getProductRecords(productIdList);
        Test.stopTest();

        Assert.areEqual(20, productDataList.size(), 'The number of images returned is not equal to the inserted images');
    }

    @isTest
    private static void getProductImagesTestPositive() {
        Test.startTest();
        List<Product2> productList = [SELECT Id FROM Product2 WHERE Name LIKE 'Test %' AND StockKeepingUnit LIKE 'Test SKU%' AND CreatedDate = TODAY];
        List<D2C_ProductDetailsController.D2C_ProductVariationDataWrapper> productVariationDataWrapperList = D2C_ProductDetailsController.getProductImages(
            productList[0].Id
        );
        Assert.areEqual(false, productVariationDataWrapperList.isEmpty(), 'The returned D2C_ProductVariationDataWrapper list should not be empty');
        Test.stopTest();
    }

    @isTest
    private static void getProductImagesTestNegative() {
        Test.startTest();
        List<D2C_ProductDetailsController.D2C_ProductVariationDataWrapper> productVariationDataWrapperList = D2C_ProductDetailsController.getProductImages('');
        Assert.areEqual(true, productVariationDataWrapperList.isEmpty(), 'The returned D2C_ProductVariationDataWrapper list should be empty');
        Test.stopTest();
    }

    /**
     * NBD2C-73
     * @description This method is created for positive testing the getPackagingImageUrl() method
     * @author Shrihari Kendre
     */
    @isTest
    private static void getPackagingImageUrlTestPositive() {
        Test.startTest();
        List<Product2> productList = [SELECT Id FROM Product2 WHERE Name LIKE 'Test %' AND StockKeepingUnit LIKE 'Test SKU%' AND CreatedDate = TODAY];
        List<D2C_ProductDetailsController.D2C_ProductVariationDataWrapper> productVariationDataWrapperList = D2C_ProductDetailsController.getPackagingImageUrl(
            productList[0].Id
        );
        Assert.areEqual(false, productVariationDataWrapperList.isEmpty(), 'The returned D2C_ProductVariationDataWrapper list should not be empty');
        Test.stopTest();
    }

    /**
     * NBD2C-73
     * @description This method is created for negative testing the getPackagingImageUrl() method by providing empty input data
     * @author Shrihari Kendre
     */
    @isTest
    private static void getPackagingImageUrlTestNagative() {
        Test.startTest();
        List<D2C_ProductDetailsController.D2C_ProductVariationDataWrapper> productVariationDataWrapperList = D2C_ProductDetailsController.getPackagingImageUrl(
            ''
        );
        Assert.areEqual(true, productVariationDataWrapperList.isEmpty(), 'The returned D2C_ProductVariationDataWrapper list should be empty');
        Test.stopTest();
    }

    @isTest
    private static void getProductVariationDetailsTestPositive() {
        List<String> productIdList = new List<String>();
        for (Product2 productRecord : [SELECT Id FROM Product2 WHERE Name LIKE 'Test %' AND StockKeepingUnit LIKE 'Test SKU%' AND CreatedDate = TODAY]) {
            productIdList.add(productRecord.Id);
        }

        Test.startTest();

        List<D2C_ProductDetailsController.D2C_ProductVariationDataWrapper> productVariationDataWrapperList = D2C_ProductDetailsController.getProductVariationDetails(
            productIdList
        );
        Assert.areEqual(false, productVariationDataWrapperList.isEmpty(), 'The returned D2C_ProductVariationDataWrapper list should not be empty');
        Test.stopTest();
    }

    @isTest
    private static void getProductVariationDetailsTestNegative() {
        Test.startTest();
        List<D2C_ProductDetailsController.D2C_ProductVariationDataWrapper> productVariationDataWrapperList = D2C_ProductDetailsController.getProductVariationDetails(
            new List<String>()
        );
        Assert.areEqual(true, productVariationDataWrapperList.isEmpty(), 'The returned D2C_ProductVariationDataWrapper list should be empty');
        Test.stopTest();
    }
}
