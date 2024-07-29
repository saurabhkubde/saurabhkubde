/**
 * @author Chirag L
 * BS-895
 * @email chirag.lapasia@theblueflamelabs.com
 * @desc This test class is created for the testing purpose of class 'B2B_VS_OMACalloutUtility'
 */
@SuppressWarnings('PMD')
@isTest
private class B2B_VS_OMACalloutUtilityTest {
    //BS-895
    @isTest
    private static void performSuccessfulOMAGetCalloutTest() {
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));
        B2B_VS_OMACalloutUtility omaUtility = new B2B_VS_OMACalloutUtility();
        B2B_VS_OMACalloutUtility.B2B_OMARequest request = new B2B_VS_OMACalloutUtility.B2B_OMARequest();
        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = omaUtility.performOMACallout(
            B2B_Constants.CALLOUT_TYPE_OMA_SHAPE,
            request,
            configurationList[0].Id
        );
        Test.stopTest();
        System.assertEquals(true, response.statusCode == 200, 'Success Response Wrapper should be returned');
    }

    //BS-895
    @isTest
    private static void performSuccessfulOMAGetCalloutWithRedirectTest() {
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(303, true));
        B2B_VS_OMACalloutUtility omaUtility = new B2B_VS_OMACalloutUtility();
        B2B_VS_OMACalloutUtility.B2B_OMARequest request = new B2B_VS_OMACalloutUtility.B2B_OMARequest();
        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper responseWrapper = omaUtility.performOMACallout(
            B2B_Constants.CALLOUT_TYPE_OMA_SHAPE,
            request,
            configurationList[0].Id
        );
        Test.stopTest();
        System.assertEquals(true, responseWrapper == null, 'Response Wrapper should not be returned');
    }

    //BS-895
    @isTest
    private static void performIncorrectOMAGetCalloutTest() {
        Test.startTest();
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));
        B2B_VS_OMACalloutUtility omaUtility = new B2B_VS_OMACalloutUtility();
        B2B_VS_OMACalloutUtility.B2B_OMARequest request = new B2B_VS_OMACalloutUtility.B2B_OMARequest();
        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = omaUtility.performOMACallout(
            B2B_Constants.CALLOUT_TYPE_OMA_SHAPE,
            null,
            configurationList[0].Id
        );
        Test.stopTest();
        System.assertEquals(true, response == null, 'Response Wrapper should be empty');
    }

    //BS-895
    @isTest
    private static void performSuccessfulOMAPostCalloutTest() {
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));
        B2B_VS_OMACalloutUtility omaUtility = new B2B_VS_OMACalloutUtility();
        B2B_VS_OMACalloutUtility.B2B_OMARequest request = new B2B_VS_OMACalloutUtility.B2B_OMARequest();
        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = omaUtility.performOMACallout(
            B2B_Constants.CALLOUT_TYPE_OMA_SCALE,
            request,
            configurationList[0].Id
        );
        Test.stopTest();
        System.assertEquals(true, response.statusCode == 200, 'Success Response Wrapper should be returned');
    }

    //BS-895
    @isTest
    private static void performIncorrectOMAPostCalloutTest() {
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));
        B2B_VS_OMACalloutUtility omaUtility = new B2B_VS_OMACalloutUtility();
        B2B_VS_OMACalloutUtility.B2B_OMARequest request = new B2B_VS_OMACalloutUtility.B2B_OMARequest();
        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = omaUtility.performOMACallout(
            B2B_Constants.CALLOUT_TYPE_OMA_SCALE,
            null,
            configurationList[0].Id
        );
        Test.stopTest();
        System.assertEquals(true, response == null, 'Response Wrapper should be empty');
    }

    //BS-895
    @isTest
    private static void performOMAUnkownTypeCalloutTest() {
        Test.startTest();
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));
        B2B_VS_OMACalloutUtility omaUtility = new B2B_VS_OMACalloutUtility();
        B2B_VS_OMACalloutUtility.B2B_OMARequest request = new B2B_VS_OMACalloutUtility.B2B_OMARequest();
        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = omaUtility.performOMACallout('PATCH', request, configurationList[0].Id);
        Test.stopTest();
        System.assertEquals(true, response == null, 'Response Wrapper should be empty');
    }

    //BS-895
    @isTest
    private static void performPostProcessingForOMASuccessfulCalloutTest() {
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));
        B2B_VS_OMACalloutUtility omaUtility = new B2B_VS_OMACalloutUtility();
        B2B_VS_OMACalloutUtility.B2B_OMARequest request = new B2B_VS_OMACalloutUtility.B2B_OMARequest();
        Http http = new Http();
        HttpRequest calloutRequest = new HttpRequest();
        calloutRequest.setEndpoint('callout:B2B_OMACallout');
        calloutRequest.setMethod(B2B_Constants.CALLOUT_TYPE_OMA_SHAPE);
        calloutRequest.setHeader('Content-Type', 'application/json');
        calloutRequest.setTimeout(120000);
        HttpResponse response = http.send(calloutRequest);
        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper responseWrapper = B2B_VS_OMACalloutUtility.performPostProcessingForOMACallout(
            request,
            response,
            configurationList[0].Id
        );
        Test.stopTest();
        System.assertEquals(true, responseWrapper.statusCode == 200, 'Success Response Wrapper should be returned');
    }

    //BS-895
    @isTest
    private static void performPostProcessingForOMAFailureCalloutTest() {
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(500, true));
        B2B_VS_OMACalloutUtility omaUtility = new B2B_VS_OMACalloutUtility();
        B2B_VS_OMACalloutUtility.B2B_OMARequest request = new B2B_VS_OMACalloutUtility.B2B_OMARequest();
        Http http = new Http();
        HttpRequest calloutRequest = new HttpRequest();
        calloutRequest.setEndpoint('callout:B2B_OMACallout');
        calloutRequest.setMethod(B2B_Constants.CALLOUT_TYPE_OMA_SHAPE);
        calloutRequest.setHeader('Content-Type', 'application/json');
        calloutRequest.setTimeout(120000);
        HttpResponse response = http.send(calloutRequest);
        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper responseWrapper = B2B_VS_OMACalloutUtility.performPostProcessingForOMACallout(
            request,
            response,
            configurationList[0].Id
        );
        Test.stopTest();
        List<B2B_CommerceLog__c> commerceLogList = [SELECT Id FROM B2B_CommerceLog__c];
        System.assertEquals(true, responseWrapper != null, 'Error Response Wrapper should be returned');
        System.assertEquals(1, commerceLogList.size(), 'commerce log should be created');
    }

    //BS-999
    @isTest
    private static void performPostProcessingForServerFailureCalloutTest() {
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(404, true));
        B2B_VS_OMACalloutUtility omaUtility = new B2B_VS_OMACalloutUtility();
        B2B_VS_OMACalloutUtility.B2B_OMARequest request = new B2B_VS_OMACalloutUtility.B2B_OMARequest();
        Http http = new Http();
        HttpRequest calloutRequest = new HttpRequest();
        calloutRequest.setEndpoint('callout:B2B_OMACallout');
        calloutRequest.setMethod(B2B_Constants.CALLOUT_TYPE_OMA_SHAPE);
        calloutRequest.setHeader('Content-Type', 'application/json');
        calloutRequest.setTimeout(120000);
        HttpResponse response = http.send(calloutRequest);
        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper responseWrapper = B2B_VS_OMACalloutUtility.performPostProcessingForOMACallout(
            request,
            response,
            configurationList[0].Id
        );
        Test.stopTest();
        List<B2B_CommerceLog__c> commerceLogList = [SELECT Id FROM B2B_CommerceLog__c];
        System.assertEquals(true, responseWrapper != null, 'Error Response Wrapper should be returned');
        System.assertEquals(1, commerceLogList.size(), 'commerce log should be created');
    }

    //BS-895
    @isTest
    private static void performPostProcessingForEmptyOMARequestTest() {
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));
        B2B_VS_OMACalloutUtility omaUtility = new B2B_VS_OMACalloutUtility();
        B2B_VS_OMACalloutUtility.B2B_OMARequest request = new B2B_VS_OMACalloutUtility.B2B_OMARequest();
        Http http = new Http();
        HttpRequest calloutRequest = new HttpRequest();
        calloutRequest.setEndpoint('callout:B2B_OMACallout');
        calloutRequest.setMethod(B2B_Constants.CALLOUT_TYPE_OMA_SHAPE);
        calloutRequest.setHeader('Content-Type', 'application/json');
        calloutRequest.setTimeout(120000);
        HttpResponse response = http.send(calloutRequest);
        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper responseWrapper = B2B_VS_OMACalloutUtility.performPostProcessingForOMACallout(
            null,
            response,
            configurationList[0].Id
        );
        Test.stopTest();
        System.assertEquals(true, responseWrapper == null, 'Response Wrapper should not be returned');
    }

    //BS-896
    @isTest
    private static void initiateOMAcalloutTest() {
        List<B2B_Lens_Shapes__c> lensShapesList = B2B_TestDataFactory.createLensShapes(1);
        insert lensShapesList;
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Map<String, Object> userInputMap = B2B_TestDataFactory.createUserInputResponseForOMA();
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));

        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = B2B_VS_OMACalloutUtility.initiateOMAcallout(
            String.valueOf(configurationList[0].Id),
            lensShapesList[0],
            userInputMap,
            B2B_Constants.CALLOUT_TYPE_OMA_SCALE
        );
        Test.stopTest();
        System.assertEquals(true, response != null, 'Response Wrapper should be returned');
    }

    //BS-896
    @isTest
    private static void initiateOMAcalloutForErrorTest() {
        List<B2B_Lens_Shapes__c> lensShapesList = B2B_TestDataFactory.createLensShapes(1);
        insert lensShapesList;
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Map<String, Object> userInputMap = B2B_TestDataFactory.createUserInputResponseForOMA();
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(500, true));

        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = B2B_VS_OMACalloutUtility.initiateOMAcallout(
            String.valueOf(configurationList[0].Id),
            lensShapesList[0],
            userInputMap,
            B2B_Constants.CALLOUT_TYPE_OMA_SCALE
        );
        Test.stopTest();
        System.assertEquals(true, response != null, 'Response Wrapper should be returned');
    }

    //BS-896
    @isTest
    private static void initiateOMAcalloutForEmptyConfiguratorTest() {
        List<B2B_Lens_Shapes__c> lensShapesList = B2B_TestDataFactory.createLensShapes(1);
        insert lensShapesList;
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Map<String, Object> userInputMap = B2B_TestDataFactory.createUserInputResponseForOMA();
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(500, true));

        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = B2B_VS_OMACalloutUtility.initiateOMAcallout(
            null,
            lensShapesList[0],
            userInputMap,
            B2B_Constants.CALLOUT_TYPE_OMA_SCALE
        );
        Test.stopTest();
        System.assertEquals(false, response != null, 'Response Wrapper should be returned');
    }

    //BS-896
    @isTest
    private static void updateLensConfiguratorTest() {
        List<B2B_Lens_Shapes__c> lensShapesList = B2B_TestDataFactory.createLensShapes(1);
        insert lensShapesList;
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Map<String, Object> userInputMap = B2B_TestDataFactory.createUserInputResponseForOMA();
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));

        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = B2B_VS_OMACalloutUtility.initiateOMAcallout(
            String.valueOf(configurationList[0].Id),
            lensShapesList[0],
            userInputMap,
            B2B_Constants.CALLOUT_TYPE_OMA_SCALE
        );
        Boolean result = B2B_VS_OMACalloutUtility.updateLensConfigurator(
            String.valueOf(configurationList[0].Id),
            response.omaSuccessResponseWrapper,
            response.omaSuccessResponseWrapper,
            userInputMap
        );
        Test.stopTest();
        System.assertEquals(false, result == false, 'Lens Configurator should get updated');
    }

    //BS-1492
    @isTest
    private static void updateLensConfiguratorUpdatedTest() {
        List<B2B_Lens_Shapes__c> lensShapesList = B2B_TestDataFactory.createLensShapes(1);
        insert lensShapesList;
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Map<String, Object> userInputMap = B2B_TestDataFactory.createUserInputResponseForOMA();
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));

        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = B2B_VS_OMACalloutUtility.initiateOMAcallout(
            String.valueOf(configurationList[0].Id),
            lensShapesList[0],
            userInputMap,
            B2B_Constants.CALLOUT_TYPE_OMA_SCALE
        );
        Boolean result = B2B_VS_OMACalloutUtility.updateLensConfigurator(
            String.valueOf(configurationList[0].Id),
            response.omaSuccessResponseWrapper,
            null,
            userInputMap
        );
        Test.stopTest();
        System.assertEquals(false, result == false, 'Lens Configurator should get updated');
    }

    //BS-896
    @isTest
    private static void updateInvalidLensConfiguratorTest() {
        List<B2B_Lens_Shapes__c> lensShapesList = B2B_TestDataFactory.createLensShapes(1);
        insert lensShapesList;
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Map<String, Object> userInputMap = B2B_TestDataFactory.createUserInputResponseForOMA();
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));

        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = B2B_VS_OMACalloutUtility.initiateOMAcallout(
            String.valueOf(configurationList[0].Id),
            lensShapesList[0],
            userInputMap,
            B2B_Constants.CALLOUT_TYPE_OMA_SCALE
        );
        Boolean result = B2B_VS_OMACalloutUtility.updateLensConfigurator(
            null,
            response.omaSuccessResponseWrapper,
            response.omaSuccessResponseWrapper,
            userInputMap
        );
        Test.stopTest();
        System.assertEquals(true, result == false, 'Lens Configurator should not get updated');
    }

    //BS-896
    @isTest
    private static void updateInLensConfiguratorNullTest() {
        List<B2B_Lens_Shapes__c> lensShapesList = B2B_TestDataFactory.createLensShapes(1);
        insert lensShapesList;
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Map<String, Object> userInputMap = B2B_TestDataFactory.createUserInputNullResponseForOMA();
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));

        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = B2B_VS_OMACalloutUtility.initiateOMAcallout(
            String.valueOf(configurationList[0].Id),
            lensShapesList[0],
            userInputMap,
            B2B_Constants.CALLOUT_TYPE_OMA_SCALE
        );
        Boolean result = B2B_VS_OMACalloutUtility.updateLensConfigurator(
            null,
            response.omaSuccessResponseWrapper,
            response.omaSuccessResponseWrapper,
            userInputMap
        );
        Test.stopTest();
        System.assertEquals(true, result == false, 'Lens Configurator should not get updated');
    }

    //BS-2137
    @isTest
    private static void updateLensConfiguratorPartialGrrovePositiveTest() {
        List<B2B_Lens_Shapes__c> lensShapesList = B2B_TestDataFactory.createLensShapes(1);
        insert lensShapesList;
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Map<String, Object> userInputMap = B2B_TestDataFactory.createUserInputResponseForOMA();
        userInputMap.put('partialGroove', true);
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));

        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = B2B_VS_OMACalloutUtility.initiateOMAcallout(
            String.valueOf(configurationList[0].Id),
            lensShapesList[0],
            userInputMap,
            B2B_Constants.CALLOUT_TYPE_OMA_SCALE
        );
        Boolean result = B2B_VS_OMACalloutUtility.updateLensConfigurator(
            String.valueOf(configurationList[0].Id),
            response.omaSuccessResponseWrapper,
            response.omaSuccessResponseWrapper,
            userInputMap
        );
        Test.stopTest();
        System.assertEquals(false, result == false, 'Lens Configurator should get updated');
    }

    //BS-2137
    @isTest
    private static void updateLensConfiguratorPartialGrroveNegativeTest() {
        List<B2B_Lens_Shapes__c> lensShapesList = B2B_TestDataFactory.createLensShapes(1);
        insert lensShapesList;
        List<B2B_Lens_Configurator__c> configurationList = B2B_TestDataFactory.createCorrectRecordsForLensConfigurator();
        insert configurationList;
        Map<String, Object> userInputMap = B2B_TestDataFactory.createUserInputResponseForOMA();
        userInputMap.put('partialGroove', null);
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_OMACalloutMockInterface(200, true));

        B2B_VS_OMACalloutUtility.B2B_OMACalloutWrapper response = B2B_VS_OMACalloutUtility.initiateOMAcallout(
            String.valueOf(configurationList[0].Id),
            lensShapesList[0],
            userInputMap,
            B2B_Constants.CALLOUT_TYPE_OMA_SCALE
        );
        Boolean result = B2B_VS_OMACalloutUtility.updateLensConfigurator(
            String.valueOf(configurationList[0].Id),
            response.omaSuccessResponseWrapper,
            response.omaSuccessResponseWrapper,
            userInputMap
        );
        Test.stopTest();
        System.assertEquals(false, result == false, 'Lens Configurator should get updated');
    }
}
