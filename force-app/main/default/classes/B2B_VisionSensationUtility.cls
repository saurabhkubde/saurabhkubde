/**
 * @author Chirag L
 * @email chirag.lapasia@theblueflamelabs.com
 * @desc This is the utility class for Vision sensation
 */
@SuppressWarnings('PMD')
public with sharing class B2B_VisionSensationUtility {
    /**
     * BS-898
     * BS-1248 : This class is fully re-constructed as part of BS-1248
     * @description This method is used to perform a Schneider Callout
     * @author Chirag L
     * @param schneiderRequest request pass by user.
     */
    public B2B_SchneiderCalloutResponseWrapper performSchneiderCallout(B2B_SchneiderRequest schneiderRequest) {
        List<String> headerLabelList = System.Label.B2B_VS_RX_CALLOUT_HEADERS.split(',');
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        B2B_SchneiderResponse schneiderResponse = new B2B_SchneiderResponse(); //BS-1034
        request.setEndpoint('callout:B2B_SchneiderCallout');
        request.setMethod('POST');
        request.setHeader('Token', headerLabelList[0]);
        request.setHeader('Content-Type', 'application/json');
        request.setHeader('Accept', 'application/json'); //Added to handle server errors.
        request.setHeader('Cookie', headerLabelList[1]);
        request.setTimeout(120000);

        String body = JSON.serialize(schneiderRequest);
        request.setBody(body);

        HttpResponse response = http.send(request);
        B2B_SchneiderCalloutResponseWrapper schneiderCalloutResponseWrapper = performPostProcessingForSchneiderCallout(schneiderRequest, response);

        //BS-1914 Below Code is added for testing purpose of scenario when preCalcGuid is missing
        /*
        B2B_SchneiderCalloutResponseWrapper schneiderCalloutResponseWrapper = new B2B_SchneiderCalloutResponseWrapper();
        schneiderCalloutResponseWrapper.statusCode = 200;
        String responseBody = '{ "images": ["","",""],"success": true,"msg": null,"raw": null,"errorCode": null,"left": {"images": ["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","",""],"centerThickness": 3.11,"weight": 6.059212,"edge": {"rdMin": 1.3,"rdMax": 2.9,"axis": null,"axisMin": 325.0,"axisMax": 104.0}},';
        responseBody += '"right": {"images": ["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","",""],"centerThickness": 3.11,"weight": 6.059212,"edge": {"rdMin": 1.3,"rdMax": 2.9,"axis": null,"axisMin": 325.0,"axisMax": 104.0}';
        responseBody += '},"silhData": {"statusCode": 1,"infoCode": "","infoText": "","behav": "","preCalcGuid": "" }}';
        schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper = (B2B_VisionSensationUtility.B2B_SchneiderResponse) JSON.deserialize(responseBody, B2B_VisionSensationUtility.B2B_SchneiderResponse.class);
        */
        //BS-1914

        // Below Code is added for testing purpose of scenario for Internal Server Error of respone status code 503/500
        // This code is added for explecitely generating error scenario of 'Internal Server Error'
        /*
        B2B_SchneiderCalloutResponseWrapper schneiderCalloutResponseWrapper = new B2B_SchneiderCalloutResponseWrapper();
        schneiderCalloutResponseWrapper.statusCode = 503;
        String internalServerErrorSampleBody = '{"timestamp": "2023-05-29T04:41:11.739+00:00","status": 500,"error": "Internal Server Error","path": "/schneider/calculate"}';
        schneiderCalloutResponseWrapper.schneiderServerErrorResponseWrapper = (B2B_VisionSensationUtility.B2B_SchneiderServerErrorResponseWrapper) JSON.deserialize(internalServerErrorSampleBody, B2B_VisionSensationUtility.B2B_SchneiderServerErrorResponseWrapper.class);
        */

        // Below Code is added for testing purpose of scenario for Schneider Server Error of respone status code 200
        // This code is added for explecitely generating error scenario of 'Schneider Server Error'
        /*
        B2B_SchneiderCalloutResponseWrapper schneiderCalloutResponseWrapper = new B2B_SchneiderCalloutResponseWrapper();
        schneiderCalloutResponseWrapper.statusCode = 200;
        String internalServerErrorSampleBody = '{"images": [],"success": false,"msg": "MaxWaitThreshold of 4 is reached. Please come back later.","raw": null,"errorCode": 4,"left": null,"right": null,"silhData": {"statusCode": -1,"infoCode": null,"infoText": "DB Error","behav": null,"preCalcGuid": "8a054de1-085d-4f60-b483-39d4d4330532"}}';
        schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper = (B2B_VisionSensationUtility.B2B_SchneiderResponse) JSON.deserialize(internalServerErrorSampleBody, B2B_VisionSensationUtility.B2B_SchneiderResponse.class);
        */

        return schneiderCalloutResponseWrapper;
    }

    /**
     * BS-1248
     * @description This method is used to perform pst processing of response obtained from a Schneider Callout
     * @author Chirag L
     * @param schneiderRequest                 : request pass by user.
     * @param calloutResponse                  : reponse obtained from callout.
     * @return schneiderCalloutResponseWrapper : wrapper containing request sent, response obtained and status code obtained on schneidercallout
     */
    public static B2B_SchneiderCalloutResponseWrapper performPostProcessingForSchneiderCallout(
        B2B_SchneiderRequest schneiderRequest,
        HttpResponse calloutResponse
    ) {
        if (calloutResponse != null) {
            B2B_SchneiderCalloutResponseWrapper schneiderCalloutResponseWrapper = new B2B_SchneiderCalloutResponseWrapper();
            schneiderCalloutResponseWrapper.schneiderRequestWrapper = schneiderRequest != null ? schneiderRequest : null;
            schneiderCalloutResponseWrapper.statusCode = calloutResponse.getStatusCode() != null ? calloutResponse.getStatusCode() : 0;
            if (calloutResponse.getStatusCode() == 200) {
                schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper = String.isNotBlank(calloutResponse.getBody())
                    ? (B2B_VisionSensationUtility.B2B_SchneiderResponse) JSON.deserialize(
                          calloutResponse.getBody(),
                          B2B_VisionSensationUtility.B2B_SchneiderResponse.class
                      )
                    : null;
                //Start BS-1292
                if (
                    schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper != null &&
                    schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper.left != null &&
                    String.isNotBlank(schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper.left.weight)
                ) {
                    schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper.left.weight =
                        schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper.left.weight.substringBefore('.') +
                        '.' +
                        schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper.left.weight.substringAfter('.').left(2);
                }
                if (
                    schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper != null &&
                    schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper.right != null &&
                    String.isNotBlank(schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper.right.weight)
                ) {
                    schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper.right.weight =
                        schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper.right.weight.substringBefore('.') +
                        '.' +
                        schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper.right.weight.substringAfter('.').left(2);
                }
                //End BS-1292
            } else if (calloutResponse.getStatusCode() == 404) {
                schneiderCalloutResponseWrapper.schneiderErrorResponseWrapper = String.isNotBlank(calloutResponse.getBody())
                    ? (B2B_VisionSensationUtility.B2B_SchneiderErrorResponseWrapper) JSON.deserialize(
                          calloutResponse.getBody(),
                          B2B_VisionSensationUtility.B2B_SchneiderErrorResponseWrapper.class
                      )
                    : null;
                /* Start : BS-1706 */
            } else if (calloutResponse.getStatusCode() >= 500) {
                /* End : BS-1706 */
                schneiderCalloutResponseWrapper.schneiderServerErrorResponseWrapper = String.isNotBlank(calloutResponse.getBody())
                    ? (B2B_VisionSensationUtility.B2B_SchneiderServerErrorResponseWrapper) JSON.deserialize(
                          calloutResponse.getBody(),
                          B2B_VisionSensationUtility.B2B_SchneiderServerErrorResponseWrapper.class
                      )
                    : null;
            } else {
                // Creating Log for the scenario of any unknown error during schneider callout
                B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                    B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_RESPONSE_MESSAGE_HEADING + calloutResponse.getStatusCode(),
                    B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_REQUEST_HEADING +
                    JSON.serializePretty(schneiderRequest) +
                    '\n' +
                    B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_RESPONSE_HEADING +
                    calloutResponse.getBody(),
                    B2B_Constants.SCHNEIDER_CALLOUT_PROCESS,
                    B2B_Constants.ERROR_TYPE_LOGGING,
                    null
                );
                insert commerceLog;
                return null;
            }
            return schneiderCalloutResponseWrapper;
        } else {
            return null;
        }
    }

    /**
     * BS-898
     * @description Wrapper for Schneider Request
     */
    public class B2B_SchneiderRequest {
        @AuraEnabled
        public B2B_SchneiderRequest_PowerLeft powerLeft;

        @AuraEnabled
        public B2B_SchneiderRequest_PowerRight powerRight;

        @AuraEnabled
        public B2B_SchneiderRequest_MeasurementData measurementData;

        @AuraEnabled
        public B2B_SchneiderRequest_MinEdge minEdge;

        @AuraEnabled
        public String oma;

        @AuraEnabled
        public String glassProduct;

        @AuraEnabled
        public Double lensBase;

        @AuraEnabled
        public Integer progressionLength;

        @AuraEnabled
        public Boolean removeDrills;

        @AuraEnabled
        public String features;

        @AuraEnabled
        public String shapeId;

        @AuraEnabled
        public Integer dblDistance;

        @AuraEnabled
        public String size;

        @AuraEnabled
        public Boolean calculateLeft;

        @AuraEnabled
        public Boolean calculateRight;

        @AuraEnabled
        public String visionzoneAnalysis;

        @AuraEnabled
        public String lensARlms;

        @AuraEnabled
        public String blankcoating;

        @AuraEnabled
        public String lensHClms;

        @AuraEnabled
        public Boolean blending;

        @AuraEnabled
        public B2B_SchneiderRequest_Scale scale; //728

        @AuraEnabled
        public String retailerId;

        @AuraEnabled
        public String language;

        @AuraEnabled
        public String salesconcept;

        @AuraEnabled
        public String colorNumber;

        @AuraEnabled
        public String typeOrForm;

        @AuraEnabled
        public String earpiece;

        @AuraEnabled
        public String omaShapeKey; //BS-898
    }

    /**
     * BS-898
     * @description Wrapper for request parameter
     */
    public class B2B_SchneiderRequest_PowerLeft {
        @AuraEnabled
        public Double sph;

        @AuraEnabled
        public Double cyl;

        @AuraEnabled
        public Double ax;

        @AuraEnabled
        public Double add;

        @AuraEnabled
        public Double prvm1;

        @AuraEnabled
        public Double prvm2;

        @AuraEnabled
        public Double prva1;

        @AuraEnabled
        public Double prva2;
    }

    /**
     * BS-898
     * @description Wrapper for request parameter
     */
    public class B2B_SchneiderRequest_PowerRight {
        @AuraEnabled
        public Double sph;

        @AuraEnabled
        public Double cyl;

        @AuraEnabled
        public Double ax;

        @AuraEnabled
        public Double add;

        @AuraEnabled
        public Double prvm1;

        @AuraEnabled
        public Double prvm2;

        @AuraEnabled
        public Double prva1;

        @AuraEnabled
        public Double prva2;
    }

    /**
     * BS-898
     * @description Wrapper for request parameter
     */
    public class B2B_SchneiderRequest_MeasurementData {
        @AuraEnabled
        public Double vnw;

        @AuraEnabled
        public Double hsa;

        @AuraEnabled
        public Double hsa2;

        @AuraEnabled
        public Double le;

        @AuraEnabled
        public Double pdLeft; //728

        @AuraEnabled
        public Double pdRight; //728

        @AuraEnabled
        public Double ehLeft; //728

        @AuraEnabled
        public Double ehRight; //728

        @AuraEnabled
        public String measurementSystem;
    }

    /**
     * BS-898
     * @description Wrapper for request parameter
     */
    public class B2B_SchneiderRequest_MinEdge {
        @AuraEnabled
        public Double left;

        @AuraEnabled
        public Double right;
    }

    /**
     * BS-898
     * @description Wrapper for request parameter
     */
    public class B2B_SchneiderRequest_Scale {
        @AuraEnabled
        public Double a;

        @AuraEnabled
        public Double b;

        @AuraEnabled
        public Double b1;

        @AuraEnabled
        public Double b2;

        @AuraEnabled
        public Double sf;

        @AuraEnabled
        public Double blp;
    }

    /**
     * BS-898
     * @description Wrapper for Schneider Response
     */
    public class B2B_SchneiderResponse {
        //BS-727 : Added AuraEnabled annotation
        @AuraEnabled
        public List<String> images;

        @AuraEnabled
        public String success;

        @AuraEnabled
        public String msg;

        @AuraEnabled
        public String raw;

        @AuraEnabled
        public String errorCode;

        @AuraEnabled
        public B2B_SchneiderResponse_Left left;

        @AuraEnabled
        public B2B_SchneiderResponse_Right right;

        @AuraEnabled
        public B2B_SchneiderResponse_SilhData silhData;

        @AuraEnabled
        public Integer statusCode; //BS-1034
    }

    /**
     * BS-898
     * @description Wrapper for response parameter
     */
    public class B2B_SchneiderResponse_Left {
        @AuraEnabled
        public List<String> images;

        @AuraEnabled
        public String centerThickness;

        @AuraEnabled
        public String weight;

        @AuraEnabled
        public B2B_SchneiderResponse_LeftEdge edge;
    }

    /**
     * BS-898
     * @description Wrapper for response parameter
     */
    public class B2B_SchneiderResponse_Right {
        @AuraEnabled
        public List<String> images;

        @AuraEnabled
        public String centerThickness;

        @AuraEnabled
        public String weight;

        @AuraEnabled
        public B2B_SchneiderResponse_RightEdge edge;
    }

    /**
     * BS-898
     * @description Wrapper for response parameter
     */
    public class B2B_SchneiderResponse_LeftEdge {
        @AuraEnabled
        public String rdMin;

        @AuraEnabled
        public String rdMax;

        @AuraEnabled
        public String axis;

        @AuraEnabled
        public String axisMin;

        @AuraEnabled
        public String axisMax;
    }

    /**
     * BS-898
     * @description Wrapper for response parameter
     */
    public class B2B_SchneiderResponse_RightEdge {
        @AuraEnabled
        public String rdMin;

        @AuraEnabled
        public String rdMax;

        @AuraEnabled
        public String axis;

        @AuraEnabled
        public String axisMin;

        @AuraEnabled
        public String axisMax;
    }

    /**
     * BS-898
     * @description Wrapper for response parameter
     */
    public class B2B_SchneiderResponse_SilhData {
        @AuraEnabled
        public String statusCode;

        @AuraEnabled
        public String infoCode;

        @AuraEnabled
        public String infoText;

        @AuraEnabled
        public String behav;

        @AuraEnabled
        public String preCalcGuid;
    }

    /**
     * BS-1248
     * @description This wrapper is developed to hold OMA data not found type of error response obtained on shcneider callout
     */
    public class B2B_SchneiderErrorResponseWrapper {
        @AuraEnabled
        public String cause;

        @AuraEnabled
        public List<String> stackTrace;

        @AuraEnabled
        public String message;

        @AuraEnabled
        public List<String> suppressed;

        @AuraEnabled
        public String localizedMessage;
    }

    /**
     * BS-1248
     * @description This wrapper is developed to hold Server Error response obtained on shcneider callout
     */
    public class B2B_SchneiderServerErrorResponseWrapper {
        @AuraEnabled
        public String timestamp;

        @AuraEnabled
        public Integer status;

        @AuraEnabled
        public String error;

        @AuraEnabled
        public String path;
    }

    /**
     * BS-1248
     * @description This master wrapper holds all the information of the schneider callout. It holds the following information:
     *        1. schneiderRequestWrapper : This wrapper contains the request body sent during schneider callout
     *        2. schneiderSuccessResponseWrapper          :   This wrapper hold the response obtained on a successfull schneider callout
     *        3. schneiderErrorResponseWrapper            :   This wrapper holds OMA data not found type of error response obtained on shcneider callout
     *        4. schneiderServerErrorResponseWrapper      :   This wrapper holds Server error response obtained on shcneider callout
     *        5. statusCode                               :   This parameter holds the status code obtained on schneider callout
     */
    public class B2B_SchneiderCalloutResponseWrapper {
        @AuraEnabled
        public B2B_SchneiderRequest schneiderRequestWrapper;

        @AuraEnabled
        public B2B_SchneiderResponse schneiderSuccessResponseWrapper;

        @AuraEnabled
        public B2B_SchneiderErrorResponseWrapper schneiderErrorResponseWrapper;

        @AuraEnabled
        public B2B_SchneiderServerErrorResponseWrapper schneiderServerErrorResponseWrapper;

        @AuraEnabled
        public Integer statusCode;
    }
}
