/**
 * @author Sachin Vispute
 * @email  sachin.vispute@theblueflamelabs.com
 * @desc   This class contains the functionalities to perform Vision Zone Analysis
 * BS-967
 **/
public without sharing class B2B_VisionZoneAnalysisCalloutUtility {
    /**
     * BS-967
     * @description This method is used to get the vision zone analysis Id
     * @author Sachin Vispute
     * @return B2B_GetVisionZoneIdCalloutWrapper : Wrapper containing The id of the vision zone analysis.
     */
    @AuraEnabled
    public static B2B_GetVisionZoneIdCalloutWrapper getVisionZoneAnalysisId(Id accountId, Id lensConfiguratorId) {
        try {
            B2B_GetVisionZoneIdCalloutWrapper visionZoneAnalysisIdWrapper = new B2B_GetVisionZoneIdCalloutWrapper(); // Wrapper object which will be returned.
            //Create the HTTP objects
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            HttpResponse response = new HttpResponse();

            List<String> endpointList = System.Label.B2B_VISION_ZONE_ANALYSIS_ENDPOINTS.split(',');

            if (endpointList.isEmpty() == false) {
                //Create the POST based request to get the Vision Zone analysis Id
                request.setEndpoint('callout:B2B_VisionZoneAnalysis' + '/' + endpointList[0] + '/' + endpointList[1]);
                request.setMethod('POST');

                //Send the request and save the response in reponse object
                response = http.send(request);
                //BS-1815- Added and commented the below code to test the negative scenario when needed.
                /*HttpResponse response = new HttpResponse();
                String responseBodyTest = '503 Gateway Timeout';
                Integer statusCodeTest = 503;
                response.setHeader('Content-Type', 'application/json');
                response.setBody(responseBodyTest);
                response.setStatusCode(statusCodeTest);*/
                //Process the response for success
                if (response != null && response.getStatusCode() == 200) {
                    visionZoneAnalysisIdWrapper = (B2B_GetVisionZoneIdCalloutWrapper) (System.JSON.deserialize(
                        response.getBody(),
                        B2B_VisionZoneAnalysisCalloutUtility.B2B_GetVisionZoneIdCalloutWrapper.class
                    ));
                } else if (response.getStatusCode() == 503) {
                    //BS-error handling as part of BS-1815
                    B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                        B2B_Constants.VISION_ZONE_CALLOUT_FAILURE_GENERIC_HEADER + response.getStatusCode(),
                        B2B_Constants.VISION_ZONE_CALLOUT_FAILURE_REQUEST_HEADING +
                        request +
                        '\n' +
                        B2B_Constants.VISION_ZONE_CALLOUT_FAILURE_RESPONSE_HEADING +
                        response.getBody() +
                        '\n' +
                        B2B_Constants.OMA_CALLOUT_FAILURE_LENS_CONFIGURATOR_ID_HEADING +
                        lensConfiguratorId +
                        '\n' +
                        B2B_Constants.OMA_CALLOUT_FAILURE_ARIS_ACCOUNT_ID_HEADING +
                        accountId,
                        B2B_Constants.VISION_ZONE_CALLOUT_PROCESS,
                        B2B_Constants.ERROR_TYPE_LOGGING,
                        String.valueOf(accountId)
                    );
                    insert commerceLog;

                    B2B_Utils.sendSchneiderCalloutEmails(
                        (new List<String>{ System.Label.B2B_CALLOUT_EMAIL_ADDRESSES.split(',')[0] }),
                        (B2B_Constants.VISION_ZONE_CALLOUT_PROCESS_EMAIL_SUBJECT),
                        (B2B_Constants.VISION_ZONE_CALLOUT_FAILURE_RESPONSE_HEADING + response.getBody())
                    );
                    return null;
                } else {
                    // Create log with account Id
                    B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                        B2B_Constants.VISION_ZONE_CALLOUT_FAILURE_GENERIC_HEADER + response.getStatusCode(),
                        B2B_Constants.VISION_ZONE_CALLOUT_FAILURE_RESPONSE_HEADING + response.getBody(),
                        B2B_Constants.VISION_ZONE_CALLOUT_PROCESS,
                        B2B_Constants.ERROR_TYPE_LOGGING,
                        accountId
                    );
                    insert commerceLog;
                    return null;
                }
            }
            return visionZoneAnalysisIdWrapper;
        } catch (Exception exceptionInstance) {
            // Create log with account Id
            B2B_CommerceLog__c commerceLog = B2B_LogUtils.createErrorLog(exceptionInstance, B2B_Constants.VISION_ZONE_CALLOUT_PROCESS, accountId);
            insert commerceLog;
            return null;
        }
    }

    /**
     * BS-967
     * @description This method is used to fetch the status of the passed vision zone analysis id.
     * @author Sachin Vispute
     * @param : id : Id of the survey for which the status needs to fetched
     * @param : id : Id of the account whose user is fetching the details.
     * @return Map<String, Object> : Map containing the deserialize response from the callout
     */
    @AuraEnabled
    public static Map<String, Object> checkVisionZoneAnalysisResult(String id, Id accountId, Id lensConfiguratorId) {
        try {
            Map<String, Object> visionZoneAnalysisDataMap = new Map<String, Object>();
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            HttpResponse response = new HttpResponse();
            List<String> endpointList = System.Label.B2B_VISION_ZONE_ANALYSIS_ENDPOINTS.split(',');
            if (endpointList.isEmpty() == false) {
                //Create the POST based request to get the Vision Zone analysis Id
                request.setEndpoint('callout:B2B_VisionZoneAnalysis' + '/' + endpointList[0] + '/' + endpointList[2] + '/' + id);
                request.setMethod('GET');

                //Send the request and save the response in reponse object
                response = http.send(request);
                //BS-1815- Added and commented the below code to test the negative scenarios when needed.
                /*HttpResponse response = new HttpResponse();
                String responseBodyTest = '503 Gateway Timeout';
                Integer statusCodeTest = 503;
                response.setHeader('Content-Type', 'application/json');
                response.setBody(responseBodyTest);
                response.setStatusCode(statusCodeTest);*/
                //Process the response for success
                if (response != null && response.getStatusCode() == 200) {
                    visionZoneAnalysisDataMap = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                } else if (response.getStatusCode() == 503) {
                    //BS-error handling as part of BS-1815
                    B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                        B2B_Constants.VISION_ZONE_CALLOUT_FAILURE_GENERIC_HEADER + response.getStatusCode(),
                        B2B_Constants.VISION_ZONE_CALLOUT_FAILURE_REQUEST_HEADING +
                        request +
                        '\n' +
                        B2B_Constants.VISION_ZONE_CALLOUT_FAILURE_RESPONSE_HEADING +
                        response.getBody() +
                        '\n' +
                        B2B_Constants.OMA_CALLOUT_FAILURE_LENS_CONFIGURATOR_ID_HEADING +
                        lensConfiguratorId +
                        '\n' +
                        B2B_Constants.OMA_CALLOUT_FAILURE_ARIS_ACCOUNT_ID_HEADING +
                        accountId,
                        B2B_Constants.VISION_ZONE_CALLOUT_PROCESS,
                        B2B_Constants.ERROR_TYPE_LOGGING,
                        String.valueOf(accountId)
                    );
                    insert commerceLog;

                    B2B_Utils.sendSchneiderCalloutEmails(
                        (new List<String>{ System.Label.B2B_CALLOUT_EMAIL_ADDRESSES.split(',')[0] }),
                        (B2B_Constants.VISION_ZONE_CALLOUT_PROCESS_EMAIL_SUBJECT),
                        (B2B_Constants.VISION_ZONE_CALLOUT_FAILURE_RESPONSE_HEADING + response.getBody())
                    );

                    return new Map<String, Object>{ B2B_Constants.VISION_ZONE_CALLOUT_ERROR_CODE => (Object) B2B_Constants.VISION_ZONE_CALLOUT_ERROR_CODE };
                } else {
                    // Create log with account Id
                    B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                        B2B_Constants.VISION_ZONE_CALLOUT_FAILURE_GENERIC_HEADER + response.getStatusCode(),
                        B2B_Constants.VISION_ZONE_CALLOUT_FAILURE_RESPONSE_HEADING + response.getBody(),
                        B2B_Constants.VISION_ZONE_CALLOUT_PROCESS,
                        B2B_Constants.ERROR_TYPE_LOGGING,
                        accountId
                    );
                    insert commerceLog;
                    return null;
                }
            }
            return visionZoneAnalysisDataMap;
        } catch (Exception exceptionInstance) {
            // Create log with account Id
            B2B_CommerceLog__c commerceLog = B2B_LogUtils.createErrorLog(exceptionInstance, B2B_Constants.VISION_ZONE_CALLOUT_PROCESS, accountId);
            insert commerceLog;
            return null;
        }
    }

    public class B2B_GetVisionZoneIdCalloutWrapper {
        @AuraEnabled
        public String id;
    }
}
