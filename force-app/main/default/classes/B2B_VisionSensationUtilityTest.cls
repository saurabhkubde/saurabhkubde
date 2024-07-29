/**
 * @author Chirag L
 * @email chirag.lapasia@theblueflamelabs.com
 * @desc This class is re-constructed as part of BS-1248
 */

@isTest
private without sharing class B2B_VisionSensationUtilityTest {
    //BS-1248
    @isTest
    private static void performSuccessfulSchneiderCalloutTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, true));
        B2B_VisionSensationUtility visionSensationUtility = new B2B_VisionSensationUtility();
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper response = visionSensationUtility.performSchneiderCallout(request);
        Test.stopTest();
        System.assertEquals(true, Boolean.valueOf(response.schneiderSuccessResponseWrapper.success) == true, 'Success Response Wrapper should be returned');
    }

    //BS-1248
    @isTest
    private static void performCalculationErrorSchneiderCalloutTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, false));
        B2B_VisionSensationUtility visionSensationUtility = new B2B_VisionSensationUtility();
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper response = visionSensationUtility.performSchneiderCallout(request);
        Test.stopTest();
        System.assertEquals(false, Boolean.valueOf(response.schneiderSuccessResponseWrapper.success) == true, 'Calculation Error Occured');
    }

    //BS-1248
    @isTest
    private static void performOMAErrorSchneiderCalloutTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(404, false));
        B2B_VisionSensationUtility visionSensationUtility = new B2B_VisionSensationUtility();
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper response = visionSensationUtility.performSchneiderCallout(request);
        Test.stopTest();
        System.assertEquals(true, response.schneiderErrorResponseWrapper != null, 'Error Response Wrapper should be returned');
    }

    //BS-1248
    @isTest
    private static void performInternalServerErrorSchneiderCalloutTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(503, false));
        B2B_VisionSensationUtility visionSensationUtility = new B2B_VisionSensationUtility();
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper response = visionSensationUtility.performSchneiderCallout(request);
        Test.stopTest();
        System.assertEquals(true, response.schneiderServerErrorResponseWrapper != null, 'Server Error Response Wrapper should be returned');
    }

    //BS-1248
    @isTest
    private static void perforPostProcessingForBlankSchneiderCalloutTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(503, false));
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper response = B2B_VisionSensationUtility.performPostProcessingForSchneiderCallout(
            request,
            null
        );
        Test.stopTest();
        System.assertEquals(true, response == null, 'Should Not Return Anything');
    }

    //BS-1248
    @isTest
    private static void perforPostProcessingForSuccessfulSchneiderCalloutTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, true));
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();

        List<String> headerLabelList = System.Label.B2B_VS_RX_CALLOUT_HEADERS.split(',');
        Http http = new Http();
        HttpRequest calloutRequest = new HttpRequest();
        calloutRequest.setEndpoint('callout:B2B_SchneiderCallout');
        calloutRequest.setMethod('POST');
        calloutRequest.setHeader('Token', headerLabelList[0]);
        calloutRequest.setHeader('Content-Type', 'application/json');
        calloutRequest.setHeader('Cookie', headerLabelList[1]);
        calloutRequest.setTimeout(120000);

        String body = JSON.serialize(request);
        calloutRequest.setBody(body);

        HttpResponse response = http.send(calloutRequest);

        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponse = B2B_VisionSensationUtility.performPostProcessingForSchneiderCallout(
            request,
            response
        );
        Test.stopTest();
        System.assertEquals(
            true,
            Boolean.valueOf(parsedResponse.schneiderSuccessResponseWrapper.success) == true,
            'Success Response Wrapper should be returned'
        );
    }

    //BS-1248
    @isTest
    private static void perforPostProcessingForCalculationErrorSchneiderCalloutTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(200, false));
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();

        List<String> headerLabelList = System.Label.B2B_VS_RX_CALLOUT_HEADERS.split(',');
        Http http = new Http();
        HttpRequest calloutRequest = new HttpRequest();
        calloutRequest.setEndpoint('callout:B2B_SchneiderCallout');
        calloutRequest.setMethod('POST');
        calloutRequest.setHeader('Token', headerLabelList[0]);
        calloutRequest.setHeader('Content-Type', 'application/json');
        calloutRequest.setHeader('Cookie', headerLabelList[1]);
        calloutRequest.setTimeout(120000);

        String body = JSON.serialize(request);
        calloutRequest.setBody(body);

        HttpResponse response = http.send(calloutRequest);
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponse = B2B_VisionSensationUtility.performPostProcessingForSchneiderCallout(
            request,
            response
        );
        Test.stopTest();
        System.assertEquals(
            false,
            Boolean.valueOf(parsedResponse.schneiderSuccessResponseWrapper.success) == true,
            'Failure Response Wrapper should be returned'
        );
    }

    //BS-1248
    @isTest
    private static void perforPostProcessingForOMANotFoundErrorSchneiderCalloutTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(404, false));
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();

        List<String> headerLabelList = System.Label.B2B_VS_RX_CALLOUT_HEADERS.split(',');
        Http http = new Http();
        HttpRequest calloutRequest = new HttpRequest();
        calloutRequest.setEndpoint('callout:B2B_SchneiderCallout');
        calloutRequest.setMethod('POST');
        calloutRequest.setHeader('Token', headerLabelList[0]);
        calloutRequest.setHeader('Content-Type', 'application/json');
        calloutRequest.setHeader('Cookie', headerLabelList[1]);
        calloutRequest.setTimeout(120000);

        String body = JSON.serialize(request);
        calloutRequest.setBody(body);

        HttpResponse response = http.send(calloutRequest);
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponse = B2B_VisionSensationUtility.performPostProcessingForSchneiderCallout(
            request,
            response
        );
        Test.stopTest();
        System.assertEquals(true, parsedResponse.schneiderErrorResponseWrapper != null, 'Error Response Wrapper should be returned');
    }

    //BS-1248
    @isTest
    private static void perforPostProcessingForServerErrorSchneiderCalloutTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(503, false));
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();

        List<String> headerLabelList = System.Label.B2B_VS_RX_CALLOUT_HEADERS.split(',');
        Http http = new Http();
        HttpRequest calloutRequest = new HttpRequest();
        calloutRequest.setEndpoint('callout:B2B_SchneiderCallout');
        calloutRequest.setMethod('POST');
        calloutRequest.setHeader('Token', headerLabelList[0]);
        calloutRequest.setHeader('Content-Type', 'application/json');
        calloutRequest.setHeader('Cookie', headerLabelList[1]);
        calloutRequest.setTimeout(120000);

        String body = JSON.serialize(request);
        calloutRequest.setBody(body);

        HttpResponse response = http.send(calloutRequest);
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponse = B2B_VisionSensationUtility.performPostProcessingForSchneiderCallout(
            request,
            response
        );
        Test.stopTest();
        System.assertEquals(true, parsedResponse.schneiderServerErrorResponseWrapper != null, 'Server Error Response Wrapper should be returned');
    }

    //BS-1248
    @isTest
    private static void perforPostProcessingForInvalidStatusCodeSchneiderCalloutTest() {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new B2B_TestDataFactory.B2B_SchneiderCalloutMockInterface(500, false));
        B2B_VisionSensationUtility.B2B_SchneiderRequest request = new B2B_VisionSensationUtility.B2B_SchneiderRequest();

        List<String> headerLabelList = System.Label.B2B_VS_RX_CALLOUT_HEADERS.split(',');
        Http http = new Http();
        HttpRequest calloutRequest = new HttpRequest();
        calloutRequest.setEndpoint('callout:B2B_SchneiderCallout');
        calloutRequest.setMethod('POST');
        calloutRequest.setHeader('Token', headerLabelList[0]);
        calloutRequest.setHeader('Content-Type', 'application/json');
        calloutRequest.setHeader('Cookie', headerLabelList[1]);
        calloutRequest.setTimeout(120000);

        String body = JSON.serialize(request);
        calloutRequest.setBody(body);

        HttpResponse response = http.send(calloutRequest);
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper parsedResponse = B2B_VisionSensationUtility.performPostProcessingForSchneiderCallout(
            request,
            response
        );
        Test.stopTest();
        System.assertEquals(true, parsedResponse != null, 'Response should be returned for This status Code');
    }
}
