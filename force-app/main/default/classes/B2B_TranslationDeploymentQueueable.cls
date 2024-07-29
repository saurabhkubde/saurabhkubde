/**
 * @author Soumyakant Pandya
 * @create date 2022-12-09
 * @modify date 2022-12-30
 * @desc Queueable class to depoly the metadata translations
 */
@SuppressWarnings('PMD.avoiddeeplynestedifstmts, PMD.ExcessiveParameterList')
public class B2B_TranslationDeploymentQueueable implements System.Queueable, Database.AllowsCallouts {
    Map<Id, String> inValidTranslationRecordsIdVsErrorMsg = new Map<Id, String>(); //BS-1404
    Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap = new Map<Id, B2B_Translation__c>(); //BS-1404
    Set<String> invalidPicklistValues = new Set<String>(); //BS-1404
    List<B2B_MetadataService.Metadata> deploymentMetadataList { get; set; }

    public B2B_TranslationDeploymentQueueable(
        List<B2B_MetadataService.Metadata> deploymentMetadataList,
        String errorMessageFromMetadata,
        Map<Id, String> inValidTranslationRecordsIdVsErrorMsg,
        Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap,
        Set<String> invalidPicklistValues
    ) {
        this.deploymentMetadataList = deploymentMetadataList;
        B2B_TranslationTriggerHandler.errorMessageFromMetadata = errorMessageFromMetadata;
        this.inValidTranslationRecordsIdVsErrorMsg = inValidTranslationRecordsIdVsErrorMsg; //BS-1404
        this.translationRecordIdVsRecordMap = translationRecordIdVsRecordMap; //BS-1404
        this.invalidPicklistValues = invalidPicklistValues; //BS-1404
    }

    public void execute(QueueableContext context) {
        try {
            B2B_MetadataService.MetadataPort service = B2B_MetadataService.createService();
            service.updateMetadata(deploymentMetadataList);
        } catch (Exception exceptionInstance) {
            B2B_TranslationTriggerHandler.errorMessageFromMetadata =
                B2B_TranslationTriggerHandler.errorMessageFromMetadata +
                ' | ' +
                exceptionInstance.getMessage();
        }

        //BS-1404 creating commerce log record for invalid translation records
        if (String.isBlank(B2B_TranslationTriggerHandler.errorMessageFromMetadata)) {
            //BS-1404 Checking picklist value is incorrect or not
            if (this.invalidPicklistValues.isEmpty() == false) {
                for (B2B_Translation__c recObject : this.translationRecordIdVsRecordMap.values()) {
                    if (this.invalidPicklistValues.contains(recObject.B2B_Picklist_Value__c)) {
                        this.inValidTranslationRecordsIdVsErrorMsg.put(recObject.Id, System.label.B2B_Translation_Picklist_Value_Field_Incorrect_Msg);
                    } //end if
                } //end for
            } //end inner if

            B2B_TranslationTriggerHandler.createCommerceLogRecord(this.inValidTranslationRecordsIdVsErrorMsg, this.translationRecordIdVsRecordMap);
        } else if (
            String.isNotBlank(B2B_TranslationTriggerHandler.errorMessageFromMetadata) && this.translationRecordIdVsRecordMap.keySet().isEmpty() == false
        ) {
            for (B2B_Translation__c recObject : this.translationRecordIdVsRecordMap.values()) {
                if (this.inValidTranslationRecordsIdVsErrorMsg.containsKey(recObject.Id)) {
                } else {
                    this.inValidTranslationRecordsIdVsErrorMsg.put(recObject.Id, B2B_TranslationTriggerHandler.errorMessageFromMetadata);
                } //end inner if
            } //end for

            B2B_TranslationTriggerHandler.createCommerceLogRecord(this.inValidTranslationRecordsIdVsErrorMsg, this.translationRecordIdVsRecordMap);
        } //end else if
    }
}
