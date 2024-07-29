/**
 * @author Chirag L
 * @email  chirag.lapasia@theblueflamelabs.com
 * @desc   This call contains contains the functionality to perform OMA callout
 * BS-895
 **/
@SuppressWarnings('PMD')
public with sharing class B2B_VS_OMACalloutUtility {
    /**
     * BS-895
     * @description This method is used to initiate a OMA Callout
     * @author Chirag L
     * @param lensConfiguratorId    :   Id of lens configurator record that needs to be used
     * @param lensShape             :   Instance of B2B_Lens_Shapes__c record from which the data needs to be pulled out to form OMA Request
     * @param userInputValuesMap    :   Map containing the input values entered by user on UI. (Key: field name and Value: user selection)
     * @param calloutType           :   Type of callout that needs to be made (getOMAShape : It will be a 'GET' type of callout to get OMA shape & postOMAScale: It will be a 'POST' type of callout to get OMA shape according to values entered by user for scale)
     * @return B2B_OMACalloutWrapper    :   Wrapper structure containing the response received
     */
    public static B2B_OMACalloutWrapper initiateOMAcallout(
        String lensConfiguratorId,
        B2B_Lens_Shapes__c lensShape,
        Map<String, Object> userInputValuesMap,
        String calloutType
    ) {
        B2B_OMACalloutWrapper omaWrapper = new B2B_OMACalloutWrapper();
        if (String.isNotBlank(lensConfiguratorId) && lensShape != null && userInputValuesMap.isEmpty() == false && String.isNotBlank(calloutType)) {
            B2B_OMARequest omaRequest = constructOMACalloutRequest(lensConfiguratorId, lensShape, userInputValuesMap);
            B2B_VS_OMACalloutUtility omaCalloutUtility = new B2B_VS_OMACalloutUtility();
            omaWrapper = omaCalloutUtility.performOMACallout(calloutType, omaRequest, lensConfiguratorId);
            Boolean lensConfiguratorUpdated = false;
            return omaWrapper;
        } else {
            return null;
        }
    }

    /**
     * BS-895
     * @description This method is used to construct the request structure that needs to be pass while making a OMA callout
     * @author Chirag L
     * @param lensConfiguratorId    :   Id of lens configurator record that needs to be used
     * @param lensShape             :   Instance of B2B_Lens_Shapes__c record from which the data needs to be pulled out to form OMA Request
     * @param userInputValuesMap    :   Map containing the input values entered by user on UI. (Key: field name and Value: user selection)
                Expected Map enteries :
                    1. features     = AR(Accent Rings), GR(Colored grooves)
                    2. removeDrills = False/True
                    3. a            = '1.1' etc.
                    4. b            = '1.1' etc.
                    4. sf           = '1.1' etc.
                    4. b1           = '1.1' etc.
                    4. b2           = '1.1' etc.
                    4. blp          = '1.1' etc.
     * @return B2B_OMARequest       :   OMA request that needs to be used for making OMA callout
     */
    public static B2B_OMARequest constructOMACalloutRequest(String lensConfiguratorId, B2B_Lens_Shapes__c lensShape, Map<String, Object> userInputValuesMap) {
        B2B_OMARequest omaRequest = new B2B_OMARequest();
        String features = String.isNotBlank(lensShape.B2B_Mounting_Type__c) ? String.valueOf(lensShape.B2B_Mounting_Type__c) : ''; //BS-791
        features += userInputValuesMap.containsKey(B2B_Constants.OMA_CALLOUT_FEATURES) == true &&
            userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_FEATURES) != null
            ? String.valueOf(userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_FEATURES))
            : ''; //BS-791
        omaRequest.features = String.isNotBlank(features) ? String.valueOf(features) : ''; //BS-791
        omaRequest.omaShapeKey = String.isNotBlank(lensShape.B2B_OMAShapeKey__c) ? String.valueOf(lensShape.B2B_OMAShapeKey__c) : null;
        omaRequest.removeDrills = userInputValuesMap.containsKey(B2B_Constants.OMA_CALLOUT_REMOVE_DRILLS) &&
            userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_REMOVE_DRILLS) != null
            ? Boolean.valueOf(userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_REMOVE_DRILLS))
            : false;
        omaRequest.omaOnly = false;

        B2B_OMARequest_Commands commands = new B2B_OMARequest_Commands();
        commands.a = userInputValuesMap.containsKey(B2B_Constants.OMA_CALLOUT_A) == true &&
            userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_A) != null
            ? String.valueOf(userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_A))
            : null;
        commands.b = userInputValuesMap.containsKey(B2B_Constants.OMA_CALLOUT_B) == true &&
            userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_B) != null
            ? String.valueOf(userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_B))
            : null;
        commands.sf = userInputValuesMap.containsKey(B2B_Constants.OMA_CALLOUT_SF) == true &&
            userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_SF) != null
            ? String.valueOf(userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_SF))
            : null;
        commands.b1 = userInputValuesMap.containsKey(B2B_Constants.OMA_CALLOUT_B1) == true &&
            userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_B1) != null
            ? String.valueOf(userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_B1))
            : null;
        commands.b2 = userInputValuesMap.containsKey(B2B_Constants.OMA_CALLOUT_B2) == true &&
            userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_B2) != null
            ? String.valueOf(userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_B2))
            : null;
        commands.blp = userInputValuesMap.containsKey(B2B_Constants.OMA_CALLOUT_BLP) == true &&
            userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_BLP) != null
            ? String.valueOf(userInputValuesMap.get(B2B_Constants.OMA_CALLOUT_BLP))
            : null;

        omaRequest.commands = commands;
        return omaRequest;
    }

    /**
     * BS-895
     * @description This method is used to perform a OMA Callout
     * @author Chirag L
     * @param calloutType :   Type of callout that needs to be made (getOMAShape : It will be a 'GET' type of callout to get OMA shape & postOMAScale: It will be a 'POST' type of callout to get OMA shape according to values entered by user for scale)
     * @param omaRequest  :   Request structure that needs to be pass while making a callout
     * @return B2B_OMACalloutWrapper    :   Wrapper structure containing the response received
     */
    @SuppressWarnings('PMD')
    public B2B_OMACalloutWrapper performOMACallout(String calloutType, B2B_OMARequest omaRequest, String lensConfiguratorId) {
        //Identifying whether the callout Type and omaRequest is not null/empty
        if (String.isNotBlank(calloutType) && omaRequest != null) {
            B2B_OMACalloutWrapper omaCalloutWrapper = new B2B_OMACalloutWrapper();
            // Below code block will be executed if the callout type is 'GET'
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            HttpResponse response = new HttpResponse();
            if (calloutType.equalsIgnoreCase(B2B_Constants.CALLOUT_TYPE_OMA_SHAPE)) {
                List<String> endpointApplicableQueryParametersList = new List<String>{
                    B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_FEATURES,
                    B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_OMASHAPE_KEY,
                    B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_REMOVE_DRILLS,
                    B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_OMA_ONLY
                };
                Map<String, String> endPointQueryParametersMap = new Map<String, String>();

                // Identifying the query parameters and adding it to map
                for (String parameter : endpointApplicableQueryParametersList) {
                    if (parameter.equalsIgnoreCase(B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_FEATURES)) {
                        endPointQueryParametersMap.put(
                            parameter,
                            String.isNotBlank(omaRequest.features)
                                ? String.valueOf(omaRequest.features) + B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_AND
                                : B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_AND
                        );
                    } else if (parameter.equalsIgnoreCase(B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_OMASHAPE_KEY)) {
                        endPointQueryParametersMap.put(
                            parameter,
                            String.isNotBlank(omaRequest.omaShapeKey)
                                ? String.valueOf(omaRequest.omaShapeKey) + B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_AND
                                : B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_AND
                        );
                    } else if (parameter.equalsIgnoreCase(B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_REMOVE_DRILLS)) {
                        endPointQueryParametersMap.put(
                            parameter,
                            omaRequest.removeDrills != null
                                ? String.valueOf(omaRequest.removeDrills) + B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_AND
                                : B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_FALSE + B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_AND
                        );
                    } else if (parameter.equalsIgnoreCase(B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_OMA_ONLY)) {
                        endPointQueryParametersMap.put(
                            parameter,
                            omaRequest.omaOnly != null
                                ? String.valueOf(omaRequest.omaOnly) + B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_AND
                                : B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_FALSE + B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_AND
                        );
                    }
                }

                //Making a initial callout that shall provide status code of 303 and endpoint redirect location URL
                String endpointQueryParameters = B2B_Constants.OMA_CALLOUT_STARTING_QUERY_PARAMETER;

                for (String queryParameter : endPointQueryParametersMap.keySet()) {
                    if (
                        queryParameter.equalsIgnoreCase(B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_REMOVE_DRILLS) ||
                        queryParameter.equalsIgnoreCase(B2B_Constants.OMA_CALLOUT_QUERY_PARAMETER_OMA_ONLY)
                    ) {
                        String value = String.valueOf(endPointQueryParametersMap.get(queryParameter)).replace('&', '');
                        endpointQueryParameters += queryParameter + value + '&';
                    } else {
                        //BS-791
                        if (endPointQueryParametersMap.containsKey(queryParameter) && endPointQueryParametersMap.get(queryParameter) != null) {
                            endpointQueryParameters += queryParameter + endPointQueryParametersMap.get(queryParameter);
                        }
                    }
                }
                endpointQueryParameters = endpointQueryParameters.removeEnd('&');
                request.setEndpoint('callout:B2B_OMACallout' + endpointQueryParameters);
                request.setMethod(B2B_Constants.CALLOUT_TYPE_GET);
                request.setTimeout(120000);
                response = http.send(request);

                if (response.getStatusCode() == 303) {
                    //Making a final callout to the endpoint obtained from above callout that should provide status code 200 and response body containing OMA data
                    //BS-791
                    response = performRecurssiveCallouts(request, response);
                }
            } else if (calloutType.equalsIgnoreCase(B2B_Constants.CALLOUT_TYPE_OMA_SCALE)) {
                //This code block will get executed if the callout type is 'POST'
                request.setEndpoint('callout:B2B_OMACallout' + B2B_Constants.OMA_SHAPE_CALLOUT_STARTING_QUERY_PARAMETER);
                request.setMethod(B2B_Constants.CALLOUT_TYPE_POST);
                request.setBody(JSON.serialize(omaRequest));
                request.setTimeout(120000);
                request.setHeader('Content-Type', 'application/json');
                request.setHeader('Accept', 'application/json'); //Added to handle server errors.
                response = http.send(request);
            } else {
                return null;
            }
            omaCalloutWrapper = performPostProcessingForOMACallout(omaRequest, response, lensConfiguratorId);
            return omaCalloutWrapper;
        } else {
            return null;
        }
    }

    /**
     * BS-791
     * @description This method is used to perform recurssive callout to provided endpoint if the status code obtained from callout is 303
     * @author Sachin V
     * @param request               :   Request structure that needs to be pass while making a callout
     * @param response              :   Http response obtained from OMA callout
     * @return obtainedResponse     :   response obtained from callout
     */
    public static HttpResponse performRecurssiveCallouts(HttpRequest request, HttpResponse response) {
        if (request != null && response != null) {
            Http http = new Http();
            HttpResponse obtainedResponse = new HttpResponse();
            request.setEndpoint('callout:B2B_OMACallout' + response.getHeader(B2B_Constants.OMA_CALLOUT_QUERY_HEADER_PARAMETER_LOCATION));
            obtainedResponse = http.send(request);
            if (obtainedResponse.getStatusCode() == 303 && (Limits.getLimitCallouts() - Limits.getCallouts()) > 0) {
                obtainedResponse = performRecurssiveCallouts(request, obtainedResponse);
            }
            return obtainedResponse;
        } else {
            return null;
        }
    }

    /**
     * BS-895
     * @description This method is used to perform post processing of response obtained from OMA Callout
     * @author Chirag L
     * @param omaRequest                :   Request structure that needs to be pass while making a callout
     * @param calloutResponse           :   Http response obtained from OMA callout
     * @return B2B_OMACalloutWrapper    :   Wrapper structure containing the response received
     */
    public static B2B_OMACalloutWrapper performPostProcessingForOMACallout(B2B_OMARequest omaRequest, HttpResponse calloutResponse, String recordId) {
        if (omaRequest != null && calloutResponse != null) {
            B2B_OMACalloutWrapper omaCalloutWrapper = new B2B_OMACalloutWrapper();
            List<B2B_Lens_Configurator__c> lensConfiguratorList = [
                SELECT Id, B2B_Account__c, B2B_Account__r.k_ARIS_Account_ID__c, B2B_Account__r.k_Account_No__c, B2B_ARIS_Account_Id__c
                FROM B2B_Lens_Configurator__c
                WHERE Id = :recordId
            ]; //BS-999
            if (calloutResponse.getStatusCode() == 200) {
                omaCalloutWrapper.omaRequestWrapper = omaRequest;
                String finalResponseBody = calloutResponse.getBody()
                    .replace(
                        B2B_Constants.OMA_CALLOUT_RESPONSE_SOURCE_TEXT_TO_BE_REPLACED_END,
                        B2B_Constants.OMA_CALLOUT_RESPONSE_TARGET_TEXT_TO_BE_REPLACED_ENDS
                    );
                omaCalloutWrapper.omaSuccessResponseWrapper = String.isNotBlank(finalResponseBody)
                    ? (B2B_VS_OMACalloutUtility.B2B_OMASuccessResponseWrapper) JSON.deserialize(
                          finalResponseBody,
                          B2B_VS_OMACalloutUtility.B2B_OMASuccessResponseWrapper.class
                      )
                    : null;
                omaCalloutWrapper.statusCode = calloutResponse.getStatusCode();
                return omaCalloutWrapper;
                //BS-999 - Start
            } else if (calloutResponse.getStatusCode() == 404) {
                omaCalloutWrapper.omaErrorResponse = String.isNotBlank(calloutResponse.getBody()) ? calloutResponse.getBody() : null;
                omaCalloutWrapper.statusCode = calloutResponse.getStatusCode();
                B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                    B2B_Constants.OMA_CALLOUT_FAILURE_GENERIC_HEADER + calloutResponse.getStatusCode(),
                    B2B_Constants.OMA_CALLOUT_FAILURE_REQUEST_HEADING +
                    JSON.serializePretty(omaRequest) +
                    '\n' +
                    B2B_Constants.OMA_CALLOUT_FAILURE_RESPONSE_HEADING +
                    calloutResponse.getBody() +
                    '\n' +
                    B2B_Constants.OMA_CALLOUT_FAILURE_LENS_CONFIGURATOR_ID_HEADING +
                    recordId +
                    '\n' +
                    B2B_Constants.OMA_CALLOUT_FAILURE_ARIS_ACCOUNT_ID_HEADING +
                    (lensConfiguratorList.isEmpty() == false &&
                        lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c != null
                        ? lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c
                        : null),
                    B2B_Constants.OMA_CALLOUT_PROCESS,
                    B2B_Constants.ERROR_TYPE_LOGGING,
                    lensConfiguratorList.isEmpty() == false &&
                        lensConfiguratorList[0].B2B_Account__c != null
                        ? String.valueOf(lensConfiguratorList[0].B2B_Account__c)
                        : null
                );
                insert commerceLog;

                B2B_Utils.sendSchneiderCalloutEmails(
                    (new List<String>{ System.Label.B2B_CALLOUT_EMAIL_ADDRESSES.split(',')[0] }),
                    (System.Label.B2B_CALLOUT_RESPONSE_EMAIL_SUBJECT_LABELS.split(',')[6] +
                    String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_Account_No__c) +
                    '/' +
                    String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c)),
                    (B2B_Constants.EMAIL_BODY_HEAD_FOR_OMA_CALLOUT_CALCULATION_ERROR + calloutResponse.getBody())
                );
                /* Start : BS-1706 */
            } else if (calloutResponse.getStatusCode() >= 500) {
                /* End : BS-1706 */
                omaCalloutWrapper.omaServerErrorResponse = String.isNotBlank(calloutResponse.getBody()) ? calloutResponse.getBody() : null;
                omaCalloutWrapper.statusCode = calloutResponse.getStatusCode();
                B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                    B2B_Constants.OMA_CALLOUT_FAILURE_GENERIC_HEADER + calloutResponse.getStatusCode(),
                    B2B_Constants.OMA_CALLOUT_FAILURE_REQUEST_HEADING +
                    JSON.serializePretty(omaRequest) +
                    '\n' +
                    B2B_Constants.OMA_CALLOUT_FAILURE_RESPONSE_HEADING +
                    calloutResponse.getBody() +
                    '\n' +
                    B2B_Constants.OMA_CALLOUT_FAILURE_LENS_CONFIGURATOR_ID_HEADING +
                    recordId +
                    '\n' +
                    B2B_Constants.OMA_CALLOUT_FAILURE_ARIS_ACCOUNT_ID_HEADING +
                    (lensConfiguratorList.isEmpty() == false &&
                        lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c != null
                        ? lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c
                        : null),
                    B2B_Constants.OMA_CALLOUT_PROCESS,
                    B2B_Constants.ERROR_TYPE_LOGGING,
                    lensConfiguratorList.isEmpty() == false &&
                        lensConfiguratorList[0].B2B_Account__c != null
                        ? String.valueOf(lensConfiguratorList[0].B2B_Account__c)
                        : null
                );
                insert commerceLog;
                B2B_Utils.sendSchneiderCalloutEmails(
                    (new List<String>{ System.Label.B2B_CALLOUT_EMAIL_ADDRESSES.split(',')[0] }),
                    (System.Label.B2B_CALLOUT_RESPONSE_EMAIL_SUBJECT_LABELS.split(',')[1] +
                    String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_Account_No__c) +
                    '/' +
                    String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c)),
                    (B2B_Constants.EMAIL_BODY_HEAD_FOR_OMA_CALLOUT_CALCULATION_ERROR + calloutResponse.getBody())
                );
            } else {
                // Creating Log for the scenario of any unknown error during OMA callout
                B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                    B2B_Constants.OMA_CALLOUT_FAILURE_GENERIC_HEADER + calloutResponse.getStatusCode(),
                    B2B_Constants.OMA_CALLOUT_FAILURE_REQUEST_HEADING +
                    JSON.serializePretty(omaRequest) +
                    '\n' +
                    B2B_Constants.OMA_CALLOUT_FAILURE_RESPONSE_HEADING +
                    calloutResponse.getBody() +
                    '\n' +
                    B2B_Constants.OMA_CALLOUT_FAILURE_LENS_CONFIGURATOR_ID_HEADING +
                    recordId +
                    '\n' +
                    B2B_Constants.OMA_CALLOUT_FAILURE_ARIS_ACCOUNT_ID_HEADING +
                    (lensConfiguratorList.isEmpty() == false &&
                        lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c != null
                        ? lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c
                        : null),
                    B2B_Constants.OMA_CALLOUT_PROCESS,
                    B2B_Constants.ERROR_TYPE_LOGGING,
                    lensConfiguratorList.isEmpty() == false &&
                        lensConfiguratorList[0].B2B_Account__c != null
                        ? String.valueOf(lensConfiguratorList[0].B2B_Account__c)
                        : null
                );
                insert commerceLog;

                B2B_Utils.sendSchneiderCalloutEmails(
                    (new List<String>{ System.Label.B2B_CALLOUT_EMAIL_ADDRESSES.split(',')[0] }),
                    (System.Label.B2B_CALLOUT_RESPONSE_EMAIL_SUBJECT_LABELS.split(',')[7] +
                    String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_Account_No__c) +
                    '/' +
                    String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c)),
                    (B2B_Constants.EMAIL_BODY_HEAD_FOR_OMA_CALLOUT_CALCULATION_ERROR + calloutResponse.getBody())
                );
                return null;
            }
            return omaCalloutWrapper; //BS-999 - end
        } else {
            return null;
        }
    }

    /**
     * BS-895
     * @description This method is used to update lens configurator record according to the response recieved from OMA callout
     * @author Chirag L
     * @param lensConfiguratorId        :   Id of lens configurator record that needs to be used
     * @param omaCalloutWrapper         :   Wrapper structure containing response received from successful OMA callout
     * @return Boolean                  :   Status whether the lens configurator record is updated
     */
    public static Boolean updateLensConfigurator(
        String lensConfiguratorId,
        B2B_OMASuccessResponseWrapper omaCalloutWrapper,
        B2B_OMASuccessResponseWrapper omaCalloutUpdatedWrapper,
        Map<String, Object> userInputMap
    ) {
        try {
            if (String.isNotBlank(lensConfiguratorId) && omaCalloutWrapper != null && userInputMap.isEmpty() == false) {
                B2B_Lens_Configurator__c lensConfigurator = new B2B_Lens_Configurator__c();
                lensConfigurator.Id = lensConfiguratorId;
                if (omaCalloutUpdatedWrapper == null) {
                    lensConfigurator.B2B_Coordinates__c = omaCalloutWrapper.coordinates != null &&
                        omaCalloutWrapper.coordinates.isEmpty() == false
                        ? JSON.serialize(omaCalloutWrapper.coordinates)
                        : null;
                    lensConfigurator.B2B_OMA_Height__c = omaCalloutWrapper.height != null ? String.valueOf(omaCalloutWrapper.height) : null;
                    lensConfigurator.B2B_Width__c = omaCalloutWrapper.width != null ? String.valueOf(omaCalloutWrapper.width) : null;
                    lensConfigurator.B2B_Drills__c = omaCalloutWrapper.drills != null &&
                        omaCalloutWrapper.drills.isEmpty() == false
                        ? JSON.serialize(omaCalloutWrapper.drills)
                        : null;
                    lensConfigurator.B2B_OMA__c = String.isNotBlank(omaCalloutWrapper.oma) ? omaCalloutWrapper.oma : null;
                    lensConfigurator.B2B_hasDrills__c = omaCalloutWrapper.hasDrills != null ? Boolean.valueOf(omaCalloutWrapper.hasDrills) : false;
                    lensConfigurator.B2B_allowedScaling__c = omaCalloutWrapper.allowedScaling != null ? JSON.serialize(omaCalloutWrapper.allowedScaling) : null;
                }
                if (omaCalloutUpdatedWrapper != null) {
                    lensConfigurator.B2B_Coordinates__c = omaCalloutUpdatedWrapper.coordinates != null &&
                        omaCalloutUpdatedWrapper.coordinates.isEmpty() == false
                        ? JSON.serialize(omaCalloutUpdatedWrapper.coordinates)
                        : null;
                    lensConfigurator.B2B_OMA_Height__c = omaCalloutUpdatedWrapper.height != null ? String.valueOf(omaCalloutUpdatedWrapper.height) : null;
                    lensConfigurator.B2B_Width__c = omaCalloutUpdatedWrapper.width != null ? String.valueOf(omaCalloutUpdatedWrapper.width) : null;
                    lensConfigurator.B2B_Drills__c = omaCalloutUpdatedWrapper.drills != null &&
                        omaCalloutUpdatedWrapper.drills.isEmpty() == false
                        ? JSON.serialize(omaCalloutUpdatedWrapper.drills)
                        : null;
                    lensConfigurator.B2B_OMA__c = omaCalloutUpdatedWrapper.oma != null && String.isNotBlank(omaCalloutUpdatedWrapper.oma)
                        ? omaCalloutUpdatedWrapper.oma
                        : null;
                    lensConfigurator.B2B_hasDrills__c = omaCalloutUpdatedWrapper.hasDrills != null
                        ? Boolean.valueOf(omaCalloutUpdatedWrapper.hasDrills)
                        : false;
                    lensConfigurator.B2B_allowedScaling__c = omaCalloutUpdatedWrapper.allowedScaling != null
                        ? JSON.serialize(omaCalloutUpdatedWrapper.allowedScaling)
                        : null;

                    lensConfigurator.B2B_Original_Coordinates__c = omaCalloutWrapper.coordinates != null &&
                        omaCalloutWrapper.coordinates.isEmpty() == false
                        ? JSON.serialize(omaCalloutWrapper.coordinates)
                        : null;
                    lensConfigurator.B2B_Original_OMA_Height__c = omaCalloutWrapper.height != null ? String.valueOf(omaCalloutWrapper.height) : null;
                    lensConfigurator.B2B_Original_Width__c = omaCalloutWrapper.width != null ? String.valueOf(omaCalloutWrapper.width) : null;
                    lensConfigurator.B2B_Original_Drills__c = omaCalloutWrapper.drills != null &&
                        omaCalloutWrapper.drills.isEmpty() == false
                        ? JSON.serialize(omaCalloutWrapper.drills)
                        : null;
                    lensConfigurator.B2B_Original_OMA__c = omaCalloutWrapper.oma != null && String.isNotBlank(omaCalloutWrapper.oma)
                        ? omaCalloutWrapper.oma
                        : null;
                    lensConfigurator.B2B_Original_has_Drills__c = omaCalloutWrapper.hasDrills != null ? Boolean.valueOf(omaCalloutWrapper.hasDrills) : false;
                    lensConfigurator.B2B_Original_allowedScaling__c = omaCalloutWrapper.allowedScaling != null
                        ? JSON.serialize(omaCalloutWrapper.allowedScaling)
                        : null;
                }
                String lensShapeImage;
                if (userInputMap.containsKey(B2B_Constants.LENS_SHAPE_IMAGE)) {
                    lensShapeImage = userInputMap.get(B2B_Constants.LENS_SHAPE_IMAGE) != null
                        ? String.valueOf(userInputMap.get(B2B_Constants.LENS_SHAPE_IMAGE))
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.FEATURE_VALUE)) {
                    lensConfigurator.B2B_Features__c = String.valueOf(userInputMap.get(B2B_Constants.FEATURE_VALUE)) != null
                        ? String.valueOf(userInputMap.get(B2B_Constants.FEATURE_VALUE))
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.SELECTED_LENS_SHAPE_ID)) {
                    lensConfigurator.B2B_Selected_Lens_Shape__c = String.valueOf(userInputMap.get(B2B_Constants.SELECTED_LENS_SHAPE_ID)) != null
                        ? String.valueOf(userInputMap.get(B2B_Constants.SELECTED_LENS_SHAPE_ID))
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.OMA_SHAPE_KEY_VALUE)) {
                    lensConfigurator.B2B_Oma_Shape_Key__c = String.valueOf(userInputMap.get(B2B_Constants.OMA_SHAPE_KEY_VALUE)) != null
                        ? String.valueOf(userInputMap.get(B2B_Constants.OMA_SHAPE_KEY_VALUE))
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.ACCENT_RING_IMAGE_URL)) {
                    lensConfigurator.B2B_Selected_Accent_Ring_Image__c = userInputMap.get(B2B_Constants.ACCENT_RING_IMAGE_URL) != null
                        ? String.valueOf(userInputMap.get(B2B_Constants.ACCENT_RING_IMAGE_URL))
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.WITH_ACCENT_RING_VALUE)) {
                    lensConfigurator.B2B_Accent_Ring__c = (Boolean) userInputMap.get(B2B_Constants.WITH_ACCENT_RING_VALUE) != null
                        ? (Boolean) userInputMap.get(B2B_Constants.WITH_ACCENT_RING_VALUE)
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.ACCENT_RING_PRODUCT_ID)) {
                    lensConfigurator.B2B_Selected_Accent_Ring_Product__c = String.valueOf(userInputMap.get(B2B_Constants.ACCENT_RING_PRODUCT_ID)) != null
                        ? String.valueOf(userInputMap.get(B2B_Constants.ACCENT_RING_PRODUCT_ID))
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.WITH_COLORED_GROOVE_VALUE)) {
                    lensConfigurator.B2B_With_Color_Groove__c = (Boolean) userInputMap.get(B2B_Constants.WITH_COLORED_GROOVE_VALUE) != null
                        ? (Boolean) userInputMap.get(B2B_Constants.WITH_COLORED_GROOVE_VALUE)
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.COLORED_GROOVE_COLOR_PRODUCT_ID)) {
                    lensConfigurator.B2B_Selected_Color_Groove_Product__c = String.valueOf(userInputMap.get(B2B_Constants.COLORED_GROOVE_COLOR_PRODUCT_ID)) !=
                        null
                        ? String.valueOf(userInputMap.get(B2B_Constants.COLORED_GROOVE_COLOR_PRODUCT_ID))
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.REMOVE_GROOVE_VALUE)) {
                    lensConfigurator.B2B_Remove_Groove__c = (Boolean) userInputMap.get(B2B_Constants.REMOVE_GROOVE_VALUE) != null
                        ? (Boolean) userInputMap.get(B2B_Constants.REMOVE_GROOVE_VALUE)
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.ACCENT_RING_COLOR_SKU)) {
                    lensConfigurator.B2B_Selected_Accent_Ring__c = userInputMap.get(B2B_Constants.ACCENT_RING_COLOR_SKU) != null
                        ? String.valueOf(userInputMap.get(B2B_Constants.ACCENT_RING_COLOR_SKU))
                        : null;
                }

                if (userInputMap.containsKey(B2B_Constants.LENS_SHAPE)) {
                    lensConfigurator.B2B_Lens_Shape__c = userInputMap.get(B2B_Constants.LENS_SHAPE) != null
                        ? String.valueOf(userInputMap.get(B2B_Constants.LENS_SHAPE))
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.LENS_SIZE)) {
                    lensConfigurator.B2B_Lens_Size__c = userInputMap.get(B2B_Constants.LENS_SIZE) != null
                        ? Decimal.valueOf(String.valueOf(userInputMap.get(B2B_Constants.LENS_SIZE)))
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.SHOW_ALL_SHAPES)) {
                    lensConfigurator.B2B_Show_All_Shapes__c = (Boolean) userInputMap.get(B2B_Constants.SHOW_ALL_SHAPES) != null
                        ? (Boolean) userInputMap.get(B2B_Constants.SHOW_ALL_SHAPES)
                        : false;
                }
                if (userInputMap.containsKey(B2B_Constants.SHOW_ALL_SHAPES)) {
                    lensConfigurator.B2B_Show_All_Shapes__c = (Boolean) userInputMap.get(B2B_Constants.SHOW_ALL_SHAPES) != null
                        ? (Boolean) userInputMap.get(B2B_Constants.SHOW_ALL_SHAPES)
                        : false;
                }
                //BS-791
                if (userInputMap.containsKey(B2B_Constants.OMA_CALLOUT_A)) {
                    lensConfigurator.B2B_a__c = (Double) userInputMap.get(B2B_Constants.OMA_CALLOUT_A) != null
                        ? (Double) userInputMap.get(B2B_Constants.OMA_CALLOUT_A)
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.OMA_CALLOUT_B)) {
                    lensConfigurator.B2B_b__c = (Double) userInputMap.get(B2B_Constants.OMA_CALLOUT_B) != null
                        ? (Double) userInputMap.get(B2B_Constants.OMA_CALLOUT_B)
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.OMA_CALLOUT_SF)) {
                    lensConfigurator.B2B_SF__c = (Double) userInputMap.get(B2B_Constants.OMA_CALLOUT_SF) != null
                        ? (Double) userInputMap.get(B2B_Constants.OMA_CALLOUT_SF)
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.OMA_CALLOUT_B1)) {
                    lensConfigurator.B2B_b1__c = (Double) userInputMap.get(B2B_Constants.OMA_CALLOUT_B1) != null
                        ? (Double) userInputMap.get(B2B_Constants.OMA_CALLOUT_B1)
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.OMA_CALLOUT_B2)) {
                    lensConfigurator.B2B_b2__c = (Double) userInputMap.get(B2B_Constants.OMA_CALLOUT_B2) != null
                        ? (Double) userInputMap.get(B2B_Constants.OMA_CALLOUT_B2)
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.OMA_CALLOUT_BLP)) {
                    lensConfigurator.B2B_blp__c = (Double) userInputMap.get(B2B_Constants.OMA_CALLOUT_BLP) != null
                        ? (Double) userInputMap.get(B2B_Constants.OMA_CALLOUT_BLP)
                        : null;
                }
                if (userInputMap.containsKey(B2B_Constants.OMA_CALLOUT_REMOVE_DRILLS)) {
                    lensConfigurator.B2B_Remove_Drills__c = userInputMap.get(B2B_Constants.OMA_CALLOUT_REMOVE_DRILLS) != null
                        ? (Boolean) userInputMap.get(B2B_Constants.OMA_CALLOUT_REMOVE_DRILLS)
                        : null;
                }
                /* Start : BS-2137 */
                if (userInputMap.containsKey(B2B_Constants.PARTIAL_GROOVE)) {
                    lensConfigurator.B2B_With_Partial_Color_Groove__c = userInputMap.get(B2B_Constants.PARTIAL_GROOVE) != null
                        ? (Boolean) userInputMap.get(B2B_Constants.PARTIAL_GROOVE)
                        : false;
                }
                /* End : BS-2137 */
                /* Start BS-1492 */
                Set<String> vsLensShapeImageTitleSet = new Set<String>{ B2B_Constants.LENS_SHAPE_TITLE };
                List<ContentDocumentLink> previousContentDocumentLinkList = new List<ContentDocumentLink>();
                if (String.isNotBlank(lensShapeImage)) {
                    previousContentDocumentLinkList = [
                        SELECT Id
                        FROM ContentDocumentLink
                        WHERE LinkedEntityId = :lensConfiguratorId AND ContentDocument.Title IN :vsLensShapeImageTitleSet
                    ];
                    if (previousContentDocumentLinkList.isEmpty() == false) {
                        delete previousContentDocumentLinkList;
                    }
                    List<ContentVersion> contentVersionList = new List<ContentVersion>();
                    ContentVersion contentVersion = new ContentVersion(
                        versionData = EncodingUtil.base64Decode(lensShapeImage),
                        title = B2B_Constants.LENS_SHAPE_TITLE,
                        pathOnClient = B2B_Constants.LENS_SHAPE_TITLE + '.' + B2B_Constants.CALCULATED_LENS_IMAGE_FORMAT,
                        ContentLocation = B2B_Constants.CONTENT_DOCUMENT_LOCATION,
                        FirstPublishLocationId = lensConfiguratorId
                    );
                    contentVersionList.add(contentVersion);
                    if (contentVersionList.isEmpty() == false) {
                        insert contentVersionList;
                    }
                }
                /* End BS-1492 */

                Database.SaveResult saveResult = Database.update(lensConfigurator, false);

                if (saveResult.isSuccess()) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (Exception exceptionInstance) {
            throw new AuraHandledException('Error while updating Lens Configurator record for OMA data. Message: ' + exceptionInstance.getMessage());
        }
    }

    //BS-895
    public class B2B_OMARequest {
        public String features;
        public String omaShapeKey;
        public Boolean removeDrills;
        public Boolean omaOnly;
        public B2B_OMARequest_Commands commands;
    }

    //BS-895
    public class B2B_OMARequest_Commands {
        public String a;
        public String b;
        public String sf;
        public String b1;
        public String b2;
        public String blp;
    }

    //BS-895
    public class B2B_OMASuccessResponseWrapper {
        @AuraEnabled
        public List<B2B_OMASuccessResponseWrapper_Coordinates> coordinates;

        @AuraEnabled
        public Double height;

        @AuraEnabled
        public Double width;

        @AuraEnabled
        public List<B2B_OMASuccessResponseWrapper_Drills> drills;

        @AuraEnabled
        public String oma;

        @AuraEnabled
        public Boolean hasDrills;

        @AuraEnabled
        public B2B_OMASuccessResponseWrapper_AllowedScaling allowedScaling;
    }

    //BS-895
    public class B2B_OMASuccessResponseWrapper_Drills {
        @AuraEnabled
        public B2B_OMASuccessResponseWrapper_Drills_Start start;

        @AuraEnabled
        public B2B_OMASuccessResponseWrapper_Drills_End ends; // Here 'Ends' is used insted of 'End' as it is a reserved keyword

        @AuraEnabled
        public Double diameter;
    }

    //BS-895
    public class B2B_OMASuccessResponseWrapper_Coordinates {
        @AuraEnabled
        public Double x;

        @AuraEnabled
        public Double y;
    }

    //BS-895
    public class B2B_OMASuccessResponseWrapper_Drills_Start {
        @AuraEnabled
        public Double x;

        @AuraEnabled
        public Double y;
    }

    //BS-895
    public class B2B_OMASuccessResponseWrapper_Drills_End {
        @AuraEnabled
        public Double x;

        @AuraEnabled
        public Double y;
    }

    //BS-895
    public class B2B_OMASuccessResponseWrapper_AllowedScaling {
        @AuraEnabled
        public B2B_OMASuccessResponseWrapper_AllowedScaling_A a;

        @AuraEnabled
        public B2B_OMASuccessResponseWrapper_AllowedScaling_B b;

        @AuraEnabled
        public B2B_OMASuccessResponseWrapper_AllowedScaling_B1 b1;

        @AuraEnabled
        public B2B_OMASuccessResponseWrapper_AllowedScaling_B2 b2;

        @AuraEnabled
        public B2B_OMASuccessResponseWrapper_AllowedScaling_BLP blp;

        @AuraEnabled
        public B2B_OMASuccessResponseWrapper_AllowedScaling_SF sf;
    }

    //BS-895
    public class B2B_OMASuccessResponseWrapper_AllowedScaling_A {
        @AuraEnabled
        public Double min;

        @AuraEnabled
        public Double max;
    }

    //BS-895
    public class B2B_OMASuccessResponseWrapper_AllowedScaling_B {
        @AuraEnabled
        public Double min;

        @AuraEnabled
        public Double max;
    }

    //BS-895
    public class B2B_OMASuccessResponseWrapper_AllowedScaling_B1 {
        @AuraEnabled
        public Double min;

        @AuraEnabled
        public Double max;
    }

    //BS-895
    public class B2B_OMASuccessResponseWrapper_AllowedScaling_B2 {
        @AuraEnabled
        public Double min;

        @AuraEnabled
        public Double max;
    }

    //BS-895
    public class B2B_OMASuccessResponseWrapper_AllowedScaling_BLP {
        @AuraEnabled
        public Double min;

        @AuraEnabled
        public Double max;
    }

    //BS-895
    public class B2B_OMASuccessResponseWrapper_AllowedScaling_SF {
        @AuraEnabled
        public Double min;

        @AuraEnabled
        public Double max;
    }

    /**
     * BS-895
     * @description This master wrapper holds all the information of the oma callout. It holds the following information:
     *        1. omaRequestWrapper : This wrapper contains the request body sent during schneider callout
     *        2. omaSuccessResponseWrapper          :   This wrapper hold the response obtained on a successfull oma callout
     *        3. omaErrorResponseWrapper            :   This wrapper holds  error response obtained on oma callout
     *        4. omaServerErrorResponseWrapper      :   This wrapper holds Server error response obtained on oma callout
     *        5. statusCode                         :   This parameter holds the status code obtained in oma callout
     */
    public class B2B_OMACalloutWrapper {
        @AuraEnabled
        public B2B_OMARequest omaRequestWrapper;

        @AuraEnabled
        public B2B_OMASuccessResponseWrapper omaSuccessResponseWrapper;

        @AuraEnabled
        public String omaErrorResponse;

        @AuraEnabled
        public String omaServerErrorResponse;

        @AuraEnabled
        public Integer statusCode;
    }
}
