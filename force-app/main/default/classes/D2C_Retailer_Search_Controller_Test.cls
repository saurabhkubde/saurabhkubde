/**
 * @author Sachin V
 * @email Sachin.vispute@theblueflamelabs.com
 * @description This test class is created for testing methods created in D2C_Retailer_Search_Controller
 * NBD2C-65: Created as part of NBD2C-65
 **/
@isTest
private class D2C_Retailer_Search_Controller_Test {
    /**
     * NBD2C-65
     * @description This method is used to create test data
     * @TestSetup annotated method is invoked before the invocation of any test method
     * @author Sachin V
     */
    @TestSetup
    private static void createTestData() {
        List<Account> accountList = D2C_TestDataFactory.createAccountRecords(10, 10, 10);
        insert accountList;

        List<Account> accountToUpdate = new List<Account>();

        for (Account accountRecord : [SELECT Id, k_Stage__c FROM Account WHERE Id IN :accountList]) {
            accountRecord.k_Stage__c = 'Account';
            accountToUpdate.add(accountRecord);
        }

        update accountToUpdate;
    }

    /**
     * NBD2C-65
     * @description This method is created for testing with valid data
     * @author Sachin V
     */
    @isTest
    private static void testRetailerSearchVFControllerForPositiveScenario() {
        Test.startTest();
        D2C_Retailer_Search_Controller controller = new D2C_Retailer_Search_Controller();
        Test.stopTest();

        // Verify data in retailerInfoWrapperList
        Assert.areNotEqual(null, controller, 'The Retailer Search Controller should be invoked');

        //Verify retailerInformation is not empty
        Assert.areEqual(true, String.isNotEmpty(D2C_Retailer_Search_Controller.retailerInformation), 'Retailer Data string should contain the information');
    }

    /**
     * NBD2C-65
     * @description This method is created for testing with invalid data
     * @author Sachin V
     */
    @isTest
    private static void testRetailerSearchVFControllerForNegativeScenario() {
        delete [
            SELECT Id
            FROM Account
            WHERE Name LIKE 'Test Account%' AND (k_Partner_Program_NB__c = :D2C_Constants.Premium OR k_Partner_Program_NB__c = :D2C_Constants.LightHouse)
        ];
        Test.startTest();
        D2C_Retailer_Search_Controller controller = new D2C_Retailer_Search_Controller();
        Test.stopTest();

        //Verify retailerInformation is not empty
        Assert.areEqual(true, String.isNotEmpty(D2C_Retailer_Search_Controller.retailerInformation), 'Retailer Data String should have premium values');
        Assert.areNotEqual(null, controller, 'The Retailer Search Controller should be invoked');
    }
}
