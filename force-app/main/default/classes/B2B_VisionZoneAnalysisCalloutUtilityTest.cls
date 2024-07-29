@isTest
private with sharing class B2B_VisionZoneAnalysisCalloutUtilityTest {
    @TestSetup
    static void testDataSetup() {
        B2B_TestDataFactory.createAccounts(1, 'Test Account', 'Account', true);
        B2B_TestDataFactory.createLensConfiguratorRecordsForSelectedFrame(); //BS-1815
    }

    //BS-967
    @isTest
    private static void getVisionZoneAnalysisIdSuccessTest() {
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1]; //BS-1815
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_VisionZoneAnalysisCalloutMockInterface(200, false, true));
        B2B_VisionZoneAnalysisCalloutUtility.B2B_GetVisionZoneIdCalloutWrapper getVisionZoneAnalysisIdWrapper = B2B_VisionZoneAnalysisCalloutUtility.getVisionZoneAnalysisId(
            accountList[0].Id,
            lensConfiguratorList[0].Id
        );
        Test.stopTest();
        System.assertEquals(true, getVisionZoneAnalysisIdWrapper != null, 'The Vision Zone Id should be returned');
    }

    //BS-967
    @isTest
    private static void getVisionZoneAnalysisIdFailureTest() {
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1]; //BS-1815
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_VisionZoneAnalysisCalloutMockInterface(404, false, true));
        B2B_VisionZoneAnalysisCalloutUtility.getVisionZoneAnalysisId(accountList[0].Id, lensConfiguratorList[0].Id);
        Test.stopTest();
        List<B2B_CommerceLog__c> commerceLogList = [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Related_Record_Id__c = :accountList[0].Id];
        System.assertEquals(true, commerceLogList.isEmpty() == false, 'Commerce Log should be created');
    }

    //BS-967
    @isTest
    private static void getVisionZoneAnalysisIdSystemFailureTest() {
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1]; //BS-1815
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_VisionZoneAnalysisCalloutMockInterface(404, true, true));
        B2B_VisionZoneAnalysisCalloutUtility.getVisionZoneAnalysisId(accountList[0].Id, lensConfiguratorList[0].Id);
        Test.stopTest();
        List<B2B_CommerceLog__c> commerceLogList = [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Related_Record_Id__c = :accountList[0].Id];
        System.assertEquals(true, commerceLogList.isEmpty() == false, 'Commerce Log should be created');
    }

    //BS-1612
    @isTest
    private static void checkVisionZoneAnalysisResultSuccessTest() {
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1]; //BS-1815
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_VisionZoneAnalysisCalloutMockInterface(200, false, false));
        Map<String, Object> visionZoneAnalysisDataMap = B2B_VisionZoneAnalysisCalloutUtility.checkVisionZoneAnalysisResult(
            'testId',
            accountList[0].Id,
            lensConfiguratorList[0].Id
        );
        Test.stopTest();
        System.assertEquals(true, visionZoneAnalysisDataMap.isEmpty() == false, 'The callout data should be returned');
    }

    //BS-1612
    @isTest
    private static void checkVisionZoneAnalysisResultFailureTest() {
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1]; //BS-1815
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_VisionZoneAnalysisCalloutMockInterface(404, false, false));
        B2B_VisionZoneAnalysisCalloutUtility.checkVisionZoneAnalysisResult('testId', accountList[0].Id, lensConfiguratorList[0].Id);
        Test.stopTest();
        List<B2B_CommerceLog__c> commerceLogList = [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Related_Record_Id__c = :accountList[0].Id];
        System.assertEquals(true, commerceLogList.isEmpty() == false, 'Commerce Log should be created');
    }

    //BS-1612
    @isTest
    private static void checkVisionZoneAnalysisResultSystemFailureTest() {
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1]; //BS-1815
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_VisionZoneAnalysisCalloutMockInterface(404, true, false));
        B2B_VisionZoneAnalysisCalloutUtility.checkVisionZoneAnalysisResult('testId', accountList[0].Id, lensConfiguratorList[0].Id);
        Test.stopTest();
        List<B2B_CommerceLog__c> commerceLogList = [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Related_Record_Id__c = :accountList[0].Id];
        System.assertEquals(true, commerceLogList.isEmpty() == false, 'Commerce Log should be created');
    }

    //BS-1815
    @isTest
    private static void checkVisionZoneAnalysisCalloutFailureTest() {
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1];
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_VisionZoneAnalysisCalloutMockInterface(503, true, false));
        B2B_VisionZoneAnalysisCalloutUtility.checkVisionZoneAnalysisResult('testId', accountList[0].Id, lensConfiguratorList[0].Id);
        Test.stopTest();
        List<B2B_CommerceLog__c> commerceLogList = [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Related_Record_Id__c = :accountList[0].Id];
        System.assertEquals(true, commerceLogList.isEmpty() == false, 'Commerce Log should be created');
    }

    //BS-1815
    @isTest
    private static void getVisionZoneAnalysisIdCalloutFailureTest() {
        List<Account> accountList = [SELECT Id FROM Account LIMIT 1];
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c LIMIT 1];
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_VisionZoneAnalysisCalloutMockInterface(503, true, false));
        B2B_VisionZoneAnalysisCalloutUtility.getVisionZoneAnalysisId(accountList[0].Id, lensConfiguratorList[0].Id);
        Test.stopTest();
        List<B2B_CommerceLog__c> commerceLogList = [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Related_Record_Id__c = :accountList[0].Id];
        System.assertEquals(true, commerceLogList.isEmpty() == false, 'Commerce Log should be created');
    }
}
