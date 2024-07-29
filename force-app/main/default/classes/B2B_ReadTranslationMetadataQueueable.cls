/**
 * @author Soumyakant Pandya
 * @create date 2022-12-09
 * @modify date 2022-12-30
 * @desc Queueable class to read the Metadata
 */
@SuppressWarnings('PMD.ExcessiveParameterList')
public class B2B_ReadTranslationMetadataQueueable implements System.Queueable, Database.AllowsCallouts {
    public static B2B_MetadataService.MetadataPort service = B2B_MetadataService.createService();
    private static final String STANDARD_VALUE_SET_MATADATA_STRING = 'StandardValueSetTranslation';
    private static final String CUSTOM_OBJECT_TRANSLATION_STRING = 'CustomObjectTranslation';

    Map<Id, String> inValidTranslationRecordsIdVsErrorMsg = new Map<Id, String>(); //BS-1404
    Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap = new Map<Id, B2B_Translation__c>(); //BS-1404
    public static List<String> validPicklistValues = new List<String>(); //BS-1404
    public static Set<String> invalidPicklistValues = new Set<String>(); //BS-1404
    Map<String, Map<String, String>> objectNameAndLanguageVsFieldMap { get; set; }
    Map<String, Map<String, Map<String, String>>> customPickListObjectNameAndLanguageVsFieldMap { get; set; }
    Map<String, Map<String, String>> standardObjectNameAndLanguageVsFieldMap { get; set; }
    Boolean isDelete { get; set; }

    public B2B_ReadTranslationMetadataQueueable(
        Map<String, Map<String, String>> objectNameAndLanguageVsFieldMap,
        Map<String, Map<String, Map<String, String>>> customPickListObjectNameAndLanguageVsFieldMap,
        Map<String, Map<String, String>> standardObjectNameAndLanguageVsFieldMap,
        Boolean isDelete,
        Map<Id, String> inValidTranslationRecordsIdVsErrorMsg, //BS-1404
        Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap //BS-1404
    ) {
        this.objectNameAndLanguageVsFieldMap = objectNameAndLanguageVsFieldMap;
        this.customPickListObjectNameAndLanguageVsFieldMap = customPickListObjectNameAndLanguageVsFieldMap;
        this.standardObjectNameAndLanguageVsFieldMap = standardObjectNameAndLanguageVsFieldMap;
        this.isDelete = isDelete;
        this.inValidTranslationRecordsIdVsErrorMsg = inValidTranslationRecordsIdVsErrorMsg; //BS-1404
        this.translationRecordIdVsRecordMap = translationRecordIdVsRecordMap; //BS-1404
    }

    public void execute(QueueableContext context) {
        List<String> customObjectTranslationList = this.objectNameAndLanguageVsFieldMap.keySet().isEmpty() == false
            ? new List<String>(this.objectNameAndLanguageVsFieldMap.keySet())
            : new List<String>();
        List<String> customPickListObjectNameList = this.customPickListObjectNameAndLanguageVsFieldMap.keySet().isEmpty() == false
            ? new List<String>(this.customPickListObjectNameAndLanguageVsFieldMap.keySet())
            : new List<String>();
        List<String> standardObjectNameList = new List<String>();
        List<String> filteredObjectLanguageList = customObjectTranslationList.isEmpty() == false
            ? new List<String>(customObjectTranslationList)
            : new List<String>();

        try {
            for (String filteredObjectName : customPickListObjectNameList) {
                if (filteredObjectLanguageList.contains(filteredObjectName) == false) {
                    filteredObjectLanguageList.add(filteredObjectName);
                }
            }
            Map<String, String> labelVsStandardValueSetNameMap = new Map<String, String>();

            for (Standard_Picklist_Value_Set_Names__mdt valueSetObj : Standard_Picklist_Value_Set_Names__mdt.getAll().values()) {
                if (labelVsStandardValueSetNameMap.containsKey(valueSetObj.Label) == false) {
                    labelVsStandardValueSetNameMap.put(valueSetObj.Label, valueSetObj.Standard_Value_Set_Name__c);
                }
            }

            for (String objectNameKey : standardObjectNameAndLanguageVsFieldMap.keySet()) {
                List<String> splitForStandardValueSetNameList = objectNameKey.split('-');
                String standardValueSetNameFromMetadata = labelVsStandardValueSetNameMap.containsKey(splitForStandardValueSetNameList[0]) &&
                    splitForStandardValueSetNameList.isEmpty() == false
                    ? labelVsStandardValueSetNameMap.get(splitForStandardValueSetNameList[0])
                    : null;
                standardValueSetNameFromMetadata += standardValueSetNameFromMetadata != null
                    ? splitForStandardValueSetNameList[1] != null &&
                          splitForStandardValueSetNameList.isEmpty() == false &&
                          splitForStandardValueSetNameList.size() == 2
                          ? '-' + splitForStandardValueSetNameList[1]
                          : null
                    : null;

                if (standardValueSetNameFromMetadata != null) {
                    standardObjectNameList.add(standardValueSetNameFromMetadata);
                }
            }
        } catch (Exception exceptionInstance) {
            B2B_TranslationTriggerHandler.errorMessageFromMetadata =
                B2B_TranslationTriggerHandler.errorMessageFromMetadata +
                ' | ' +
                exceptionInstance.getMessage(); //BS-1404
        }

        List<B2B_MetadataService.CustomObjectTranslation> customObjectTranslationMetadataList = new List<B2B_MetadataService.CustomObjectTranslation>();

        if (String.isNotBlank(CUSTOM_OBJECT_TRANSLATION_STRING) == true && filteredObjectLanguageList.isEmpty() == false) {
            customObjectTranslationMetadataList = readCustomMetadata(CUSTOM_OBJECT_TRANSLATION_STRING, filteredObjectLanguageList);
        }

        List<B2B_MetadataService.StandardValueSetTranslation> standardPicklistobjectTranslationList = new List<B2B_MetadataService.StandardValueSetTranslation>();

        if (String.isNotBlank(STANDARD_VALUE_SET_MATADATA_STRING) && standardObjectNameList.isEmpty() == false) {
            standardPicklistobjectTranslationList = readStandardMetadata(STANDARD_VALUE_SET_MATADATA_STRING, standardObjectNameList);
        }
        B2B_MetadataTranslationService serviceClassObj = new B2B_MetadataTranslationService();
        List<B2B_MetadataService.Metadata> deploymentMetadataList = serviceClassObj.updateMetadataTranslation(
            customObjectTranslationMetadataList,
            objectNameAndLanguageVsFieldMap,
            customPickListObjectNameAndLanguageVsFieldMap,
            standardPicklistobjectTranslationList,
            standardObjectNameAndLanguageVsFieldMap,
            isDelete
        );

        //BS-1404 removing valid picklist values from invalidPicklistValues which contains
        for (String picklistValue : invalidPicklistValues) {
            if (validPicklistValues.contains(picklistValue)) {
                invalidPicklistValues.remove(picklistValue);
            } //end if
        } //end for

        if (deploymentMetadataList.isEmpty() == false) {
            if (Test.isRunningTest() == false) {
                addMetadataDeploymentQueueable(
                    deploymentMetadataList,
                    B2B_TranslationTriggerHandler.errorMessageFromMetadata,
                    this.inValidTranslationRecordsIdVsErrorMsg,
                    this.translationRecordIdVsRecordMap,
                    invalidPicklistValues
                );
            }
        }

        //BS-1404 creating commerce log record for invalid translation records
        if (String.isNotBlank(B2B_TranslationTriggerHandler.errorMessageFromMetadata) && this.translationRecordIdVsRecordMap.keySet().isEmpty() == false) {
            for (B2B_Translation__c recObject : this.translationRecordIdVsRecordMap.values()) {
                if (this.inValidTranslationRecordsIdVsErrorMsg.containsKey(recObject.Id)) {
                } else {
                    this.inValidTranslationRecordsIdVsErrorMsg.put(recObject.Id, B2B_TranslationTriggerHandler.errorMessageFromMetadata);
                } //end inner if
            } //end for

            B2B_TranslationTriggerHandler.createCommerceLogRecord(this.inValidTranslationRecordsIdVsErrorMsg, this.translationRecordIdVsRecordMap);
        } //end else if
    }

    /**
     * @description : Reads the Custom Object Translation metadata by making a metadataApi callout.
     * @param customObjectTranslationString : String 'CustomObjectTranslation' for reading the custom field and picklist values from Metadata API
     * @param filteredObjectLanguageList : Common list for custom fields and picklists whose metadata needs to be fetched.
     * @return List of B2B_MetadataService.Metadata
     */
    public static List<B2B_MetadataService.CustomObjectTranslation> readCustomMetadata(
        String customObjectTranslationString,
        List<String> filteredObjectLanguageList
    ) {
        return (List<B2B_MetadataService.CustomObjectTranslation>) service.readMetadata(customObjectTranslationString, filteredObjectLanguageList).getRecords();
    }

    /**
     * @description : Reads the Standard Value Set Translation metadata by making a metadataApi callout.
     * @param standardValueSetTranslationString : String StandardValueSetTranslation for reading Standard Values Set Translations
     * @param standardObjectNameList : List of StandardValueSet whose transaltions need to be fetched to be updated.
     * @return List of B2B_MetadataService.Metadata
     */
    public static List<B2B_MetadataService.StandardValueSetTranslation> readStandardMetadata(
        String standardValueSetTranslationString,
        List<String> standardObjectNameList
    ) {
        return (List<B2B_MetadataService.StandardValueSetTranslation>) service.readMetadata(STANDARD_VALUE_SET_MATADATA_STRING, standardObjectNameList)
            .getRecords();
    }
    public static void addMetadataDeploymentQueueable(
        List<B2B_MetadataService.Metadata> deploymentMetadataList,
        String errorMessageFromMetadata,
        Map<Id, String> inValidTranslationRecordsIdVsErrorMsg,
        Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap,
        Set<String> invalidPicklistValues
    ) {
        B2B_TranslationDeploymentQueueable deployMetadataQueueableObj = new B2B_TranslationDeploymentQueueable(
            deploymentMetadataList,
            errorMessageFromMetadata,
            inValidTranslationRecordsIdVsErrorMsg,
            translationRecordIdVsRecordMap,
            invalidPicklistValues
        );
        System.enqueueJob(deployMetadataQueueableObj);
    }
}
