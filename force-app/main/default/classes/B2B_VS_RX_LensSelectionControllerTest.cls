@isTest
@SuppressWarnings('PMD')
public class B2B_VS_RX_LensSelectionControllerTest {
    // This method contains all common data required to cover the methods of a B2B_VS_RX_LensSelectionController apex controller class.
    @testSetup
    static void setUp() {
        //It inserts the Product's and B2B_Commerce_Product_Link__c  object data.
        B2B_TestDataFactory.createCommerceLinkProducts();
        B2B_TestDataFactory.createAccounts(1, 'Account', 'Account', true); //BS-1647
        List<Product2> productsList = [SELECT Id, StockKeepingUnit, B2B_Schneider_SKU__c, B2B_Base_Curve__c FROM Product2 LIMIT 2];
        //BS-1019
        for (Product2 product : productsList) {
            product.B2B_Schneider_SKU__c = 'TESTSKU001';
            product.B2B_Base_Curve__c = '8'; //BS-1132
        }
        //BS-1019
        upsert productsList;

        List<ProductCategory> prodCategoryList = B2B_TestDataFactory.createProductCategory('Adapter');
        insert prodCategoryList;

        List<ProductCategoryProduct> productCategoryProductList = B2B_TestDataFactory.createProductCategoryProduct(
            productsList.size(),
            productsList,
            prodCategoryList[0].Id
        );
        insert productCategoryProductList;
    }

    // This method provides a code coverage for getAvailableLensProducts() method of a B2B_VS_RX_LensSelectionController apex controller class.
    @isTest
    public static void getAvailableLensProductsTest() {
        List<ProductCategoryProduct> prodCategoryProductList = new List<ProductCategoryProduct>();
        //BS-1132 - Start
        List<Product2> productList = [SELECT Id, Name, StockKeepingUnit FROM Product2 LIMIT 1];
        String applicableSKU = null;
        if (productList.isEmpty() == false) {
            applicableSKU = productList[0].StockKeepingUnit;
        }
        Test.startTest();
        prodCategoryProductList = B2B_VS_RX_LensSelectionController.getAvailableLensProducts('Adapter', applicableSKU, 'RX');
        Test.stopTest();
        System.assertEquals(2, prodCategoryProductList.size(), 'ProductCategoryProduct not returned');
        //BS-1132 - End
    }

    // This method provides a code coverage for getAvailableLensProducts() method of a B2B_VS_RX_LensSelectionController apex controller class.
    //BS-1132
    @isTest
    public static void getAvailableLensProductsWithoutCategoryTest() {
        try {
            //BS-1132 - Start
            List<ProductCategoryProduct> prodCategoryProductList = new List<ProductCategoryProduct>();
            List<Product2> productList = [SELECT Id, Name, StockKeepingUnit FROM Product2 LIMIT 1];
            String applicableSKU = null;
            if (productList.isEmpty() == false) {
                applicableSKU = productList[0].StockKeepingUnit;
            }
            Test.startTest();
            prodCategoryProductList = B2B_VS_RX_LensSelectionController.getAvailableLensProducts(null, applicableSKU, 'RX');
            Test.stopTest();
            System.assertEquals(2, prodCategoryProductList.size(), 'ProductCategoryProduct not returned');
            //BS-1132 - Start
        } catch (Exception exceptionInstance) {
            System.assertEquals(true, exceptionInstance.getMessage().containsIgnoreCase('Attempt to de-reference a null object'));
        }
    }

    // This method provides a code coverage for getAvailableLensProducts() method of a B2B_VS_RX_LensSelectionController apex controller class.
    @isTest
    public static void getAvailableLensProductsWithBlankCategoryTest() {
        //BS-1132 - Start
        List<Product2> productList = [SELECT Id, Name, StockKeepingUnit FROM Product2 LIMIT 1];
        String applicableSKU = null;
        if (productList.isEmpty() == false) {
            applicableSKU = productList[0].StockKeepingUnit;
        }
        Test.startTest();
        List<ProductCategoryProduct> prodCategoryProductList = B2B_VS_RX_LensSelectionController.getAvailableLensProducts('', applicableSKU, 'RX');
        Test.stopTest();
        System.assertEquals(null, prodCategoryProductList, 'ProductCategoryProduct not returned');
        //BS-1132 - End
    }

    // This method provides a code coverage for getAvailableLensProducts() method of a B2B_VS_RX_LensSelectionController apex controller class.
    @isTest
    public static void getAvailableLensProductsNoProductCategoryProductTest() {
        //BS-1132 - Start
        List<Product2> productList = [SELECT Id, Name, StockKeepingUnit FROM Product2 LIMIT 1];
        String applicableSKU = null;
        if (productList.isEmpty() == false) {
            applicableSKU = productList[0].StockKeepingUnit;
        }
        Test.startTest();
        List<ProductCategoryProduct> prodCategoryProductList = B2B_VS_RX_LensSelectionController.getAvailableLensProducts('Clip - In', applicableSKU, 'RX');
        Test.stopTest();
        System.assertEquals(null, prodCategoryProductList, 'ProductCategoryProduct not returned');
        //BS-1132 - End
    }

    // This method provides a code coverage for getApplicableTargetProductDetails() method of a B2B_VS_RX_LensSelectionController apex controller class.
    @isTest
    public static void getApplicableHardCoatingTargetProductDetailsTest() {
        List<Product2> productsList = [SELECT Id, StockKeepingUnit FROM Product2 LIMIT 2];
        Boolean isAntireflectionSKUApplicable = false;
        Boolean isHardCoatingApplicable = true;

        List<B2B_Commerce_Product_Link__c> commerceProductList = new List<B2B_Commerce_Product_Link__c>();

        Test.startTest();
        commerceProductList = B2B_VS_RX_LensSelectionController.getApplicableTargetProductDetails(
            isAntireflectionSKUApplicable,
            isHardCoatingApplicable,
            productsList[0].StockKeepingUnit
        );
        Test.stopTest();
        System.assertEquals(false, commerceProductList.isEmpty(), 'Should return list of commerce products');
    }

    // This method provides a code coverage for getApplicableTargetProductDetails() method of a B2B_VS_RX_LensSelectionController apex controller class.
    @isTest
    public static void getApplicableAntirelfectionTargetProductDetailsTest() {
        List<Product2> productsList = [SELECT Id, StockKeepingUnit FROM Product2 LIMIT 2];
        Boolean isAntireflectionSKUApplicable = true;
        Boolean isHardCoatingApplicable = true;

        List<B2B_Commerce_Product_Link__c> commerceProductList = new List<B2B_Commerce_Product_Link__c>();

        Test.startTest();
        commerceProductList = B2B_VS_RX_LensSelectionController.getApplicableTargetProductDetails(
            isAntireflectionSKUApplicable,
            isHardCoatingApplicable,
            productsList[0].StockKeepingUnit
        );
        Test.stopTest();
        System.assertEquals(false, commerceProductList.isEmpty(), 'Should return list of commerce products');
    }

    // This method provides a code coverage for getLensRelatedProducts() method of a B2B_VS_RX_LensSelectionController apex controller class.
    @isTest
    public static void getLensRelatedProductsTest() {
        List<Product2> productsList = [SELECT Id, StockKeepingUnit FROM Product2 LIMIT 2];
        String productSku = productsList[0].StockKeepingUnit;

        Test.startTest();
        List<B2B_Commerce_Product_Link__c> commerceProductLinkList = B2B_VS_RX_LensSelectionController.getLensRelatedProducts(productSku);
        Test.stopTest();
        System.assertEquals(false, commerceProductLinkList.isEmpty(), 'Should return list of commerce products');
    }

    //BS-1466
    @isTest
    public static void getProductCategoryNameTest() {
        List<Product2> productsList = [SELECT Id, StockKeepingUnit FROM Product2 LIMIT 2];
        String productSku = productsList[0].StockKeepingUnit;

        Test.startTest();
        String categoryName = B2B_VS_RX_LensSelectionController.getProductCategoryName(productSku);
        Test.stopTest();
        System.assertNotEquals(null, categoryName, 'Should return category name of product');
    }

    //BS-1524
    @isTest
    public static void updateAntireflectionSKUTest() {
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;

        Test.startTest();
        B2B_VS_RX_LensSelectionController.updateAntireflectionSKU(configurationList[0].Id);
        List<B2B_Lens_Configurator__c> updatedLensConfiguratorList = [
            SELECT Id, B2B_Antireflection_SKU__c
            FROM B2B_Lens_Configurator__c
            WHERE Id = :configurationList[0].Id
        ];
        Test.stopTest();
        System.assertEquals(null, updatedLensConfiguratorList[0].B2B_Antireflection_SKU__c, 'Antireflection SKU should be removed');
    }
    //BS-1647
    @isTest
    public static void getAccountInfoTest() {
        List<Account> accountList = [SELECT Id, k_ARIS_Account_ID__c FROM Account LIMIT 1];
        Test.startTest();
        String arisId = B2B_VS_RX_LensSelectionController.getAccountInfo(accountList[0].Id);
        Test.stopTest();
        System.assertNotEquals(null, arisId, 'Aris Id should be present');
    }

    //BS-1796
    @isTest
    public static void checkProductEntitlementTest() {
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        Boolean isEntitled = B2B_VS_RX_LensSelectionController.checkProductEntitlement(accountList[0].Id, 'TestSKU0');
        System.assertEquals(false, isEntitled, 'Should return false');
    }
}
