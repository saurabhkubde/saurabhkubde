/**
 * @author Soumyakant Pandya
 * @create date 2022-12-09
 * @modify date 2022-12-30
 * @desc This class handles the data from trigger and call the metadata queueable jobs.
 */
@SuppressWarnings('PMD.avoiddeeplynestedifstmts, PMD.ExcessiveParameterList')
public with sharing class B2B_TranslationTriggerHandler {
    public static final String PICKLIST_VALUE = 'Picklist Value';
    public static final String FIELD_LABEL = 'Field Label';
    public static final String FAILURE = 'failure'; //BS-1404
    public static final String SUCCESS = 'Success'; //BS-1404
    public static String errorMessageFromMetadata = ''; //BS-1404

    public static List<B2B_Translation__c> validTranslationRecords = new List<B2B_Translation__c>(); //BS-1404
    public static Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap = new Map<Id, B2B_Translation__c>(); //BS-1404
    public static Map<Id, String> inValidTranslationRecordsIdVsErrorMsg = new Map<Id, String>(); //BS-1404

    public static void handleTranslation(
        List<B2B_Translation__c> translationRecordNewList,
        List<B2B_Translation__c> translationRecordOldList,
        Map<Id, B2B_Translation__c> triggerNewMap,
        Map<Id, B2B_Translation__c> triggerOldMap,
        Boolean isInsert,
        Boolean isUpdate,
        Boolean isDelete,
        Boolean isBefore,
        Boolean isAfter
    ) {
        if (isInsert || isUpdate) {
            inValidTranslationRecordsIdVsErrorMsg = checkValidityOfTranslationRecords(translationRecordNewList); //BS-1404

            if (validTranslationRecords.isEmpty() == false) {
                manageTranslations(validTranslationRecords, isDelete);
            } else {
                if (inValidTranslationRecordsIdVsErrorMsg.isEmpty() == false && translationRecordIdVsRecordMap.isEmpty() == false) {
                    createCommerceLogRecord(inValidTranslationRecordsIdVsErrorMsg, translationRecordIdVsRecordMap);
                }
            } //end inner if
        } //end outer if

        if (isDelete) {
            manageTranslations(translationRecordOldList, isDelete);
        }
    }
    /**
     * @description : This method fills the data recieved from the dml operations and populates the Map which will then be fed to metadata queueable jobs.
     * @param translationRecordNewList List of B2B_Translation__c on which the dml operations are being performed.
     * @param isDelete Trigger instance variable to identify that if delete opration is being performed on the records.
     * @return void
     */
    public static void manageTranslations(list<B2B_Translation__c> translationRecordNewList, Boolean isDelete) {
        Map<String, Map<String, String>> objectNameAndLanguageVsFieldMap = new Map<String, Map<String, String>>();
        Map<String, Map<String, Map<String, String>>> customPickListObjectNameAndLanguageVsFieldMap = new Map<String, Map<String, Map<String, String>>>();
        Map<String, Map<String, String>> standardObjectNameAndLanguageVsFieldMap = new Map<String, Map<String, String>>();
        try {
            for (B2B_Translation__c translationInstance : translationRecordNewList) {
                if (
                    String.isNotBlank(translationInstance.B2B_Object_Name__c) &&
                    String.isNotBlank(translationInstance.B2B_Field_Name__c) &&
                    String.isNotBlank(translationInstance.B2B_Translation__c) &&
                    String.isNotBlank(translationInstance.B2B_Type__c) &&
                    String.isNotBlank(translationInstance.B2B_Language__c)
                ) {
                    //Populating the Map for custom field label translation.
                    if (
                        translationInstance.B2B_Type__c == FIELD_LABEL &&
                        translationInstance.B2B_Field_Name__c.containsIgnoreCase('__c') == true &&
                        objectNameAndLanguageVsFieldMap.containsKey(translationInstance.B2B_Object_Name__c + '-' + translationInstance.B2B_Language__c) == false
                    ) {
                        objectNameAndLanguageVsFieldMap.put(
                            (translationInstance.B2B_Object_Name__c +
                            '-' +
                            translationInstance.B2B_Language__c),
                            new Map<String, String>()
                        );
                        objectNameAndLanguageVsFieldMap.get((translationInstance.B2B_Object_Name__c + '-' + translationInstance.B2B_Language__c))
                            .put(translationInstance.B2B_Field_Name__c, translationInstance.B2B_Translation__c);
                        //If Custom Map already contains the object-language the putting the new values against the same key.
                    } else if (
                        translationInstance.B2B_Type__c == FIELD_LABEL &&
                        objectNameAndLanguageVsFieldMap.containsKey(translationInstance.B2B_Object_Name__c + '-' + translationInstance.B2B_Language__c)
                    ) {
                        objectNameAndLanguageVsFieldMap.get((translationInstance.B2B_Object_Name__c + '-' + translationInstance.B2B_Language__c))
                            .put(translationInstance.B2B_Field_Name__c, translationInstance.B2B_Translation__c);

                        //Populating Map for custom picklist value translations Map
                    } else if (
                        translationInstance.B2B_Type__c == PICKLIST_VALUE &&
                        translationInstance.B2B_Field_Name__c.containsIgnoreCase('__c') == true &&
                        String.isNotBlank(translationInstance.B2B_Picklist_Value__c)
                    ) {
                        if (
                            customPickListObjectNameAndLanguageVsFieldMap.containsKey(
                                translationInstance.B2B_Object_Name__c +
                                '-' +
                                translationInstance.B2B_Language__c
                            ) == false
                        ) {
                            customPickListObjectNameAndLanguageVsFieldMap.put(
                                (translationInstance.B2B_Object_Name__c +
                                '-' +
                                translationInstance.B2B_Language__c),
                                new Map<String, Map<String, String>>{
                                    translationInstance.B2B_Field_Name__c => new Map<String, String>{
                                        translationInstance.B2B_Picklist_Value__c => translationInstance.B2B_Translation__c
                                    }
                                }
                            );
                        } else if (
                            customPickListObjectNameAndLanguageVsFieldMap.containsKey(
                                translationInstance.B2B_Object_Name__c +
                                '-' +
                                translationInstance.B2B_Language__c
                            ) == true &&
                            customPickListObjectNameAndLanguageVsFieldMap.get(
                                    translationInstance.B2B_Object_Name__c +
                                    '-' +
                                    translationInstance.B2B_Language__c
                                )
                                .containsKey(translationInstance.B2B_Field_Name__c) == false
                        ) {
                            customPickListObjectNameAndLanguageVsFieldMap.get(
                                    translationInstance.B2B_Object_Name__c +
                                    '-' +
                                    translationInstance.B2B_Language__c
                                )
                                .put(
                                    translationInstance.B2B_Field_Name__c,
                                    new Map<String, String>{ translationInstance.B2B_Picklist_Value__c => translationInstance.B2B_Translation__c }
                                );
                        } else if (
                            customPickListObjectNameAndLanguageVsFieldMap.containsKey(
                                translationInstance.B2B_Object_Name__c +
                                '-' +
                                translationInstance.B2B_Language__c
                            ) == true &&
                            customPickListObjectNameAndLanguageVsFieldMap.get(
                                    translationInstance.B2B_Object_Name__c +
                                    '-' +
                                    translationInstance.B2B_Language__c
                                )
                                .containsKey(translationInstance.B2B_Field_Name__c) == true &&
                            customPickListObjectNameAndLanguageVsFieldMap.get(
                                    translationInstance.B2B_Object_Name__c +
                                    '-' +
                                    translationInstance.B2B_Language__c
                                )
                                .get(translationInstance.B2B_Field_Name__c)
                                .containsKey(translationInstance.B2B_Picklist_Value__c) == false
                        ) {
                            customPickListObjectNameAndLanguageVsFieldMap.get(
                                    translationInstance.B2B_Object_Name__c +
                                    '-' +
                                    translationInstance.B2B_Language__c
                                )
                                .get(translationInstance.B2B_Field_Name__c)
                                .put(translationInstance.B2B_Picklist_Value__c, translationInstance.B2B_Translation__c);
                        }
                        //Populating Map for standard picklist value translations
                    } else if (
                        translationInstance.B2B_Type__c == PICKLIST_VALUE &&
                        translationInstance.B2B_Field_Name__c.containsIgnoreCase('__c') == false &&
                        String.isNotBlank(translationInstance.B2B_Picklist_Value__c)
                    ) {
                        if (
                            standardObjectNameAndLanguageVsFieldMap.containsKey(
                                translationInstance.B2B_Object_Name__c +
                                '.' +
                                translationInstance.B2B_Field_Name__c +
                                '-' +
                                translationInstance.B2B_Language__c
                            ) == false
                        ) {
                            standardObjectNameAndLanguageVsFieldMap.put(
                                translationInstance.B2B_Object_Name__c +
                                '.' +
                                translationInstance.B2B_Field_Name__c +
                                '-' +
                                translationInstance.B2B_Language__c,
                                new Map<String, String>{ translationInstance.B2B_Picklist_Value__c => translationInstance.B2B_Translation__c }
                            );
                        } else if (
                            standardObjectNameAndLanguageVsFieldMap.containsKey(
                                translationInstance.B2B_Object_Name__c +
                                '.' +
                                translationInstance.B2B_Field_Name__c +
                                '-' +
                                translationInstance.B2B_Language__c
                            ) == true &&
                            standardObjectNameAndLanguageVsFieldMap.get(
                                    translationInstance.B2B_Object_Name__c +
                                    '.' +
                                    translationInstance.B2B_Field_Name__c +
                                    '-' +
                                    translationInstance.B2B_Language__c
                                )
                                .containsKey(translationInstance.B2B_Picklist_Value__c) == false
                        ) {
                            standardObjectNameAndLanguageVsFieldMap.get(
                                    translationInstance.B2B_Object_Name__c +
                                    '.' +
                                    translationInstance.B2B_Field_Name__c +
                                    '-' +
                                    translationInstance.B2B_Language__c
                                )
                                .put(translationInstance.B2B_Picklist_Value__c, translationInstance.B2B_Translation__c);
                        }
                    }
                }
            }
        } catch (Exception exceptionInstance) {
            B2B_TranslationTriggerHandler.errorMessageFromMetadata =
                B2B_TranslationTriggerHandler.errorMessageFromMetadata +
                ' | ' +
                exceptionInstance.getMessage(); //BS-1404
        }
        try {
            //Creating the an instance of B2B_ReadTranslationMetadataQueueable and passing the values in constructor to be used for read callout.
            B2B_ReadTranslationMetadataQueueable readMetadataQueueable = new B2B_ReadTranslationMetadataQueueable(
                objectNameAndLanguageVsFieldMap,
                customPickListObjectNameAndLanguageVsFieldMap,
                standardObjectNameAndLanguageVsFieldMap,
                isDelete,
                inValidTranslationRecordsIdVsErrorMsg, //BS-1404
                translationRecordIdVsRecordMap //BS-1404
            );
            System.enqueueJob(readMetadataQueueable);
        } catch (Exception exceptionInstance) {
            B2B_TranslationTriggerHandler.errorMessageFromMetadata =
                B2B_TranslationTriggerHandler.errorMessageFromMetadata +
                ' | ' +
                exceptionInstance.getMessage(); //BS-1404
        }
    }

    /**
     * BS-1404
     * @description : This method find out valid invalid translation records and return invalid record for further process.
     * @param translationRecordNewList List of B2B_Translation__c on which the dml operations are being performed.s
     * @return Map<Id,String>
     */
    public static Map<Id, String> checkValidityOfTranslationRecords(List<B2B_Translation__c> translationRecordNewList) {
        Map<Id, String> inValidTranslationRecordsIdVsErrorMsg = new Map<Id, String>();

        List<String> objectList = new List<String>();

        //BS-1404 Getting all objects
        Map<String, Schema.SObjectType> globalDescribe = Schema.getGlobalDescribe();

        for (String objectApiName : globalDescribe.keySet()) {
            //BS-1404 Adding in list
            objectList.add(objectApiName);
        } //end for

        for (B2B_Translation__c record : translationRecordNewList) {
            try {
                if (String.isBlank(record.B2B_Object_Name__c)) {
                    inValidTranslationRecordsIdVsErrorMsg.put(record.Id, System.Label.B2B_Translation_Object_Field_Empty_Msg);
                } else if (String.isBlank(record.B2B_Language__c)) {
                    inValidTranslationRecordsIdVsErrorMsg.put(record.Id, System.Label.B2B_Translation_Language_Field_Empty_Msg);
                } else {
                    //BS-1404 Checking object is present in System or not
                    if (objectList.contains(record.B2B_Object_Name__c.toLowercase())) {
                        Schema.DescribeSObjectResult objectDescribe = Schema.getGlobalDescribe().get(record.B2B_Object_Name__c).getDescribe();
                        //BS-1404 Checking B2B_Type__c field is empty or not
                        if (String.isNotBlank(record.B2B_Type__c)) {
                            if (record.B2B_Type__c == PICKLIST_VALUE) {
                                Map<String, Schema.SObjectField> fieldsMap = objectDescribe.fields.getMap();
                                //BS-1404 Checking B2B_Field_Name__c field is empty or not
                                if (String.isNotBlank(record.B2B_Field_Name__c)) {
                                    if (fieldsMap.containsKey(record.B2B_Field_Name__c)) {
                                        //BS-1404 Checking B2B_Picklist_Value__c field is empty or not
                                        if (String.isNotBlank(record.B2B_Picklist_Value__c)) {
                                            //BS-1404 Checking B2B_Translation__c field is empty or not
                                            if (String.isNotBlank(record.B2B_Translation__c)) {
                                                validTranslationRecords.add(record);
                                            } else {
                                                inValidTranslationRecordsIdVsErrorMsg.put(record.Id, System.Label.B2B_Translation_Translation_Field_Empty_Msg);
                                            } //end if else
                                        } else {
                                            inValidTranslationRecordsIdVsErrorMsg.put(record.Id, System.Label.B2B_Translation_Picklist_Value_Field_Empty_Msg);
                                        }
                                    } else {
                                        inValidTranslationRecordsIdVsErrorMsg.put(record.Id, System.Label.B2B_Translation_Field_Name_Field_Incorrect_Msg);
                                    } //end inner inner if
                                } else {
                                    inValidTranslationRecordsIdVsErrorMsg.put(record.Id, System.Label.B2B_Translation_Field_Name_Field_Empty_Msg);
                                } //end inner if else
                            } else if (record.B2B_Type__c == FIELD_LABEL) {
                                Map<String, Schema.SObjectField> fieldsMap = objectDescribe.fields.getMap();
                                if (String.isNotBlank(record.B2B_Field_Name__c)) {
                                    if (fieldsMap.containsKey(record.B2B_Field_Name__c)) {
                                        if (String.isNotBlank(record.B2B_Translation__c)) {
                                            validTranslationRecords.add(record);
                                        } else {
                                            inValidTranslationRecordsIdVsErrorMsg.put(record.Id, System.Label.B2B_Translation_Translation_Field_Empty_Msg);
                                        }
                                    } else {
                                        inValidTranslationRecordsIdVsErrorMsg.put(record.Id, System.Label.B2B_Translation_Field_Name_Field_Incorrect_Msg);
                                    } //end inner inner if
                                } else {
                                    inValidTranslationRecordsIdVsErrorMsg.put(record.Id, System.Label.B2B_Translation_Field_Name_Field_Empty_Msg);
                                } //end inner if else
                            } //end inner inner if
                        } else {
                            inValidTranslationRecordsIdVsErrorMsg.put(record.Id, System.Label.B2B_Translation_Type_Field_Empty_Msg);
                        }
                    } else {
                        inValidTranslationRecordsIdVsErrorMsg.put(record.Id, System.Label.B2B_Translation_Object_Field_Incorrect_Msg);
                    } //end inner if
                } //end outer if
            } catch (Exception err) {
                B2B_TranslationTriggerHandler.errorMessageFromMetadata = B2B_TranslationTriggerHandler.errorMessageFromMetadata + ' | ' + err.getMessage(); //BS-1404
            }

            translationRecordIdVsRecordMap.put(record.Id, record);
        } //end for loops

        return inValidTranslationRecordsIdVsErrorMsg;
    } //End checkValidityOfTranslationRecords

    /**
     * BS-1404
     * @description : This method will create commerce log record and JSON of invalid records.
     * @param inValidTranslationRecordsIdVsErrorMsg Map of B2B_Translation__c invalid records.
     * @param translationRecordIdVsRecordMap Map of B2B_Translation__c inserted records.
     * @return void
     */
    public static void createCommerceLogRecord(
        Map<Id, String> inValidTranslationRecordsIdVsErrorMsg,
        Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap
    ) {
        List<B2B_Result> commerceLogRecord = new List<B2B_Result>();

        if (inValidTranslationRecordsIdVsErrorMsg.isEmpty() == false && translationRecordIdVsRecordMap.isEmpty() == false) {
            for (Id invalidRecordId : inValidTranslationRecordsIdVsErrorMsg.keySet()) {
                //BS-1404 Creating JSON for invalid records
                B2B_Result resultObj = new B2B_Result();
                resultObj.recordId = invalidRecordId;
                resultObj.erpId = translationRecordIdVsRecordMap.containsKey(invalidRecordId) == true
                    ? translationRecordIdVsRecordMap.get(invalidRecordId).B2B_ERP_ID__c
                    : null;
                B2B_TranslationStatus translationStatusObj = new B2B_TranslationStatus();
                translationStatusObj.errorMessage = inValidTranslationRecordsIdVsErrorMsg.get(invalidRecordId);
                translationStatusObj.status = FAILURE;
                resultObj.translationStatus = translationStatusObj;

                commerceLogRecord.add(resultObj);
            } //end for

            //BS-1404 Creating commerce log record
            Id insertedLogId = B2B_LogUtils.createLogForStoringTranslationResult(
                JSON.serialize(commerceLogRecord),
                B2B_LogUtils.LOG_PROCESS_TRANSLATION,
                B2B_LogUtils.LOG_TYPE_ERROR,
                'B2B_TranslationTriggerHandler.checkValidityOfTranslationRecords',
                null
            );

            if (insertedLogId != null) {
                updateErrorMessageOnInvalidRecords(inValidTranslationRecordsIdVsErrorMsg, translationRecordIdVsRecordMap, insertedLogId);
            }
        } else {
            //BS-1404 Creating commerce log record if all records are inserted successfully
            Id insertedLogId = B2B_LogUtils.createLogForStoringTranslationResult(
                System.Label.B2B_Translation_Record_Success_Msg,
                B2B_LogUtils.LOG_PROCESS_TRANSLATION,
                B2B_LogUtils.LOG_TYPE_INFO,
                '',
                null
            );

            if (insertedLogId != null) {
                updateErrorMessageOnInvalidRecords(inValidTranslationRecordsIdVsErrorMsg, translationRecordIdVsRecordMap, insertedLogId);
            }
        }
    } //end createCommerceLogRecord

    /**
     * BS-1404
     * @description : This method will update message details and status of inserted translation records.
     * @param inValidTranslationRecordsIdVsErrorMsg Map of B2B_Translation__c invalid records.
     * @param translationRecordIdVsRecordMap Map of B2B_Translation__c inserted records.
     * @param insertedLogId this is inserted commerce log ID
     * @return void
     */
    public static void updateErrorMessageOnInvalidRecords(
        Map<Id, String> inValidTranslationRecordsIdVsErrorMsg,
        Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap,
        Id insertedLogId
    ) {
        List<B2B_Translation__c> fetchInsertedTranslationsRecordsList = [
            SELECT Id, B2B_Commerce_Log__c, B2B_Message_Details__c, B2B_Status__c
            FROM B2B_Translation__c
            WHERE Id IN :translationRecordIdVsRecordMap.keyset()
        ];

        List<B2B_Translation__c> updateTranslationRecordList = new List<B2B_Translation__c>();

        if (fetchInsertedTranslationsRecordsList.isEmpty() == false) {
            //BS-1404 Updating status and message details fields on translation records with required values
            for (B2B_Translation__c record : fetchInsertedTranslationsRecordsList) {
                if (inValidTranslationRecordsIdVsErrorMsg.containsKey(record.Id)) {
                    record.B2B_Commerce_Log__c = insertedLogId;
                    record.B2B_Message_Details__c = inValidTranslationRecordsIdVsErrorMsg.get(record.Id);
                    record.B2B_Status__c = FAILURE;
                } else {
                    record.B2B_Message_Details__c = System.Label.B2B_Translation_Record_Success_Msg;
                    record.B2B_Commerce_Log__c = insertedLogId;
                    record.B2B_Status__c = SUCCESS;
                } //end if else

                updateTranslationRecordList.add(record);
            } //end for loop
        }

        //BS-1404 To handle recursion
        B2B_RecursionHandler.doNotRerun = true;

        if (updateTranslationRecordList.isEmpty() == false) {
            update updateTranslationRecordList;
        }
    } //updateErrorMessageOnInvalidRecords

    //BS-1404 Wrapper class
    class B2B_Result {
        Id recordId;
        String erpId;
        B2B_TranslationStatus translationStatus;
    }

    //BS-1404 Wrapper class
    class B2B_TranslationStatus {
        String status;
        String errorMessage;
    }
}
