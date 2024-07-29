/**
 * @author Saurabh K
 * @email  saurabh.kubde@theblueflamelabs.com
 * @desc   This is test class created for testing of methods created in D2C_VTO_ProductCardController
 * DVM21-32 : Created as part of DVM21-32
 **/
@isTest
public with sharing class D2C_VTO_ProductCardControllerTest {
    @isTest
    private static void getColorsMetadataTest() {
        Test.startTest();
        String mapColorCodes = D2C_VTO_ProductCardController.getColorsMetadata();
        Test.stopTest();
        Assert.areEqual(true, mapColorCodes != null, 'The color codes should be present');
    }

    @isTest
    private static void getPicklistValuesTest() {
        Test.startTest();
        List<D2C_VTO_ProductCardController.D2C_VTO_PicklistValue> pickListValues = D2C_VTO_ProductCardController.getPicklistValues(
            'Product2',
            'B2B_Lens_Shape__c'
        );
        Test.stopTest();
        Assert.areEqual(true, pickListValues != null, 'The picklist values should be present');
    }
}
