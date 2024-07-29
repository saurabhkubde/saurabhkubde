/**
 * @author Soumyakant Pandya
 * @create date 2022-12-08
 * @modify date 2022-12-30
 * @desc This class based on the translation provided updated the metadata data and returns the metadata list with new / updated translations.
 */
public class B2B_MetadataTranslationService {
    /**
     * @description : Based on the B2B_Translation__c provided, identifies which metadata to update and populates the values for same.
     * @param customObjectTranslationMetadataList : List of custom object metadata for translation.
     * @param objectNameAndLanguageVsFieldMap : Map containing object name and with its field and related translations.
     * @param customPickListObjectNameAndLanguageVsFieldMap : Map containing object name and with its picklist field, picklist value and related translations.
     * @param standardPicklistobjectTranslationList : List of Standard value set and its translations.
     * @param standardObjectNameAndLanguageVsFieldMap : Map containing transaltions for standard value set.
     * @param isDelete : Boolean to identify if the DML opration performed is DELETE.
     * @return Updated List of B2B_MetadataService.Metadata
     */
    public List<B2B_MetadataService.Metadata> updateMetadataTranslation(
        List<B2B_MetadataService.CustomObjectTranslation> customObjectTranslationMetadataList,
        Map<String, Map<String, String>> objectNameAndLanguageVsFieldMap,
        Map<String, Map<String, Map<String, String>>> customPickListObjectNameAndLanguageVsFieldMap,
        List<B2B_MetadataService.StandardValueSetTranslation> standardPicklistobjectTranslationList,
        Map<String, Map<String, String>> standardObjectNameAndLanguageVsFieldMap,
        Boolean isDelete
    ) {
        List<B2B_MetadataService.Metadata> deploymentMetadataList = new List<B2B_MetadataService.Metadata>();
        List<B2B_MetadataService.CustomObjectTranslation> customFieldTranslationDeploymentMetadataList = new List<B2B_MetadataService.CustomObjectTranslation>();
        List<B2B_MetadataService.Metadata> customPickListTransaltionDeploymentMetadataList = new List<B2B_MetadataService.Metadata>();
        List<B2B_MetadataService.Metadata> standardPicklistdeploymentMetadataList = new List<B2B_MetadataService.Metadata>();

        if (
            customObjectTranslationMetadataList != null &&
            customObjectTranslationMetadataList.isEmpty() == false &&
            objectNameAndLanguageVsFieldMap.isEmpty() == false
        ) {
            customFieldTranslationDeploymentMetadataList = customFieldTranslation(
                customObjectTranslationMetadataList,
                objectNameAndLanguageVsFieldMap,
                isDelete
            );
        } else if (
            customObjectTranslationMetadataList != null &&
            customObjectTranslationMetadataList.isEmpty() == false &&
            objectNameAndLanguageVsFieldMap.isEmpty() == true &&
            customPickListObjectNameAndLanguageVsFieldMap.isEmpty() == false
        ) {
            customFieldTranslationDeploymentMetadataList = customObjectTranslationMetadataList;
        }

        if (customFieldTranslationDeploymentMetadataList.isEmpty() == false && customPickListObjectNameAndLanguageVsFieldMap.isEmpty() == false) {
            customPickListTransaltionDeploymentMetadataList = doCustomPicklistTranslation(
                customFieldTranslationDeploymentMetadataList,
                customPickListObjectNameAndLanguageVsFieldMap,
                isDelete
            );
        }
        if (
            customPickListTransaltionDeploymentMetadataList != null &&
            customPickListTransaltionDeploymentMetadataList.isEmpty() == true &&
            customFieldTranslationDeploymentMetadataList.isEmpty() == false
        ) {
            customPickListTransaltionDeploymentMetadataList = customFieldTranslationDeploymentMetadataList;
        }
        if (
            standardPicklistobjectTranslationList != null &&
            standardPicklistobjectTranslationList.isEmpty() == false &&
            standardObjectNameAndLanguageVsFieldMap.isEmpty() == false
        ) {
            standardPicklistdeploymentMetadataList = createStandardPicklistTransaltion(
                standardPicklistobjectTranslationList,
                standardObjectNameAndLanguageVsFieldMap,
                isDelete
            );
        }

        if (customPickListTransaltionDeploymentMetadataList.isEmpty() == false) {
            deploymentMetadataList.addAll(customPickListTransaltionDeploymentMetadataList);
        }
        if (standardPicklistdeploymentMetadataList.isEmpty() == false) {
            deploymentMetadataList.addAll(standardPicklistdeploymentMetadataList);
        }

        return deploymentMetadataList.isEmpty() == false ? deploymentMetadataList : new List<B2B_MetadataService.Metadata>();
    }

    /**
     * @description : Based on the B2B_Translation__c for custom picklist updates the metadata list with translations provided.
     * @param customFieldTranslationDeploymentMetadataList : List of custom object metadata for translation.
     * @param customPickListObjectNameAndLanguageVsFieldMap : Map containing object name and with its picklist field, picklist value and related translations.
     * @param isDelete : Boolean to identify if the DML opration performed is DELETE.
     * @return updated List of B2B_MetadataService.Metadata
     */
    public static List<B2B_MetadataService.Metadata> doCustomPicklistTranslation(
        List<B2B_MetadataService.CustomObjectTranslation> customFieldTranslationDeploymentMetadataList,
        Map<String, Map<String, Map<String, String>>> customPickListObjectNameAndLanguageVsFieldMap,
        Boolean isDelete
    ) {
        List<B2B_MetadataService.Metadata> metadataList = new List<B2B_MetadataService.Metadata>();
        try {
            for (B2B_MetadataService.CustomObjectTranslation fieldMetadataObj : customFieldTranslationDeploymentMetadataList) {
                for (B2B_MetadataService.CustomFieldTranslation customFieldTranslation : fieldMetadataObj.fields) {
                    for (
                        String fieldNameString : customPickListObjectNameAndLanguageVsFieldMap.containsKey(fieldMetadataObj.fullName)
                            ? customPickListObjectNameAndLanguageVsFieldMap.get(fieldMetadataObj.fullName).keySet()
                            : new Set<String>()
                    ) {
                        if (customFieldTranslation.name == fieldNameString && customFieldTranslation.picklistValues != null) {
                            for (B2B_MetadataService.PicklistValueTranslation picklistValueTranslation : customFieldTranslation.picklistValues) {
                                for (
                                    String value : customPickListObjectNameAndLanguageVsFieldMap.get(fieldMetadataObj.fullName).containsKey(fieldNameString)
                                        ? customPickListObjectNameAndLanguageVsFieldMap.get(fieldMetadataObj.fullName).get(fieldNameString).keySet()
                                        : new Set<String>()
                                ) {
                                    if (picklistValueTranslation.masterLabel == value && isDelete) {
                                        picklistValueTranslation.translation = picklistValueTranslation.masterLabel;
                                    } else if (picklistValueTranslation.masterLabel == value) {
                                        picklistValueTranslation.translation = customPickListObjectNameAndLanguageVsFieldMap.get(fieldMetadataObj.fullName)
                                            .get(fieldNameString)
                                            .get(value);
                                        B2B_ReadTranslationMetadataQueueable.validPicklistValues.add(value); //BS-1404
                                    }
                                    B2B_ReadTranslationMetadataQueueable.invalidPicklistValues.add(value); //BS-1404
                                }
                            }
                        }
                    }
                }
            }
            metadataList.addAll(customFieldTranslationDeploymentMetadataList);
        } catch (Exception exceptionInstance) {
            B2B_TranslationTriggerHandler.errorMessageFromMetadata =
                B2B_TranslationTriggerHandler.errorMessageFromMetadata +
                ' | ' +
                exceptionInstance.getMessage(); //BS-1404
        }
        return metadataList;
    }

    /**
     * @description : Based on the B2B_Translation__c provided, identifies which Standard Values Set's metadata to update and updates the translation.
     * @param standardPicklistobjectTranslationList : List of Standard value set and its translations.
     * @param standardObjectNameAndLanguageVsFieldMap : Map containing transaltions for standard value set.
     * @param isDelete : Boolean to identify if the DML opration performed is DELETE.
     * @return Updated List of B2B_MetadataService.Metadata
     */
    public static List<B2B_MetadataService.Metadata> createStandardPicklistTransaltion(
        List<B2B_MetadataService.StandardValueSetTranslation> standardPicklistobjectTranslationList,
        Map<String, Map<String, String>> standardObjectNameAndLanguageVsFieldMap,
        Boolean isDelete
    ) {
        Map<String, String> labelVsStandardValueSetNameMap = new Map<String, String>();

        for (Standard_Picklist_Value_Set_Names__mdt valueSetObj : Standard_Picklist_Value_Set_Names__mdt.getAll().values()) {
            if (labelVsStandardValueSetNameMap.containsKey(valueSetObj.Label) == false) {
                labelVsStandardValueSetNameMap.put(valueSetObj.Label, valueSetObj.Standard_Value_Set_Name__c);
            }
        }

        Map<String, Map<String, String>> updatedKeyMap = new Map<String, Map<String, String>>();
        List<B2B_MetadataService.Metadata> lstMetadata = new List<B2B_MetadataService.Metadata>();
        try {
            for (String key : standardObjectNameAndLanguageVsFieldMap.keySet()) {
                List<String> keySplitStringList = key.split('-');

                String standardValueSetNameFromMetadata = labelVsStandardValueSetNameMap.containsKey(keySplitStringList[0]) &&
                    keySplitStringList.isEmpty() == false
                    ? labelVsStandardValueSetNameMap.get(keySplitStringList[0])
                    : null;
                standardValueSetNameFromMetadata += standardValueSetNameFromMetadata != null
                    ? keySplitStringList[1] != null &&
                          keySplitStringList.isEmpty() == false &&
                          keySplitStringList.size() == 2
                          ? '-' + keySplitStringList[1]
                          : null
                    : null;

                updatedKeyMap.put(standardValueSetNameFromMetadata, standardObjectNameAndLanguageVsFieldMap.get(key));
            }

            for (B2B_MetadataService.StandardValueSetTranslation metadataRecord : standardPicklistobjectTranslationList) {
                for (B2B_MetadataService.ValueTranslation valueTranslation : metadataRecord.valueTranslation) {
                    for (String picklistValue : updatedKeyMap.get(metadataRecord.fullName).keySet()) {
                        if (valueTranslation.masterlabel == picklistValue && isDelete) {
                            valueTranslation.translation = valueTranslation.masterlabel;
                        } else if (valueTranslation.masterlabel == picklistValue) {
                            valueTranslation.translation = updatedKeyMap.get(metadataRecord.fullName).get(picklistValue);
                            B2B_ReadTranslationMetadataQueueable.validPicklistValues.add(picklistValue); //BS-1404
                        }
                        B2B_ReadTranslationMetadataQueueable.invalidPicklistValues.add(picklistValue); //BS-1404
                    }
                }
                lstMetadata.add(metadataRecord);
            }
        } catch (Exception exceptionInstance) {
            B2B_TranslationTriggerHandler.errorMessageFromMetadata =
                B2B_TranslationTriggerHandler.errorMessageFromMetadata +
                ' | ' +
                exceptionInstance.getMessage(); //BS-1404
        }
        return lstMetadata;
    }

    /**
     * @description : Based on the B2B_Translation__c provided, identifies which custom Field the field label needs to be update, for which language and populates the values for same.
     * @param customObjectTranslationMetadataList : List of custom object metadata for translation.
     * @param objectNameAndLanguageVsFieldMap : Map containing object name and with its field and related translations.
     * @param isDelete : Boolean to identify if the DML opration performed is DELETE.
     * @return Updated List of B2B_MetadataService.Metadata
     */
    public static List<B2B_MetadataService.CustomObjectTranslation> customFieldTranslation(
        List<B2B_MetadataService.CustomObjectTranslation> customObjectTranslationMetadataList,
        Map<String, Map<String, String>> objectNameAndLanguageVsFieldMap,
        Boolean isDelete
    ) {
        List<B2B_MetadataService.CustomObjectTranslation> fieldMetadataTranslation = new List<B2B_MetadataService.CustomObjectTranslation>();
        try {
            for (B2B_MetadataService.CustomObjectTranslation customFieldLabelMetadata : customObjectTranslationMetadataList) {
                for (B2B_MetadataService.CustomFieldTranslation customFieldTranslation : customFieldLabelMetadata.fields) {
                    for (
                        String value : objectNameAndLanguageVsFieldMap.containsKey(customFieldLabelMetadata.fullName)
                            ? objectNameAndLanguageVsFieldMap.get(customFieldLabelMetadata.fullName).keySet()
                            : new Set<String>()
                    ) {
                        if (customFieldTranslation.name == value && isDelete) {
                            //If delete then populate with English label of the field.
                            customFieldTranslation.label = Schema.getGlobalDescribe()
                                .get(customFieldLabelMetadata.fullName.split('-')[0])
                                .getDescribe()
                                .fields.getMap()
                                .get(value)
                                .getDescribe()
                                .getLabel();
                        } else if (customFieldTranslation.name == value) {
                            customFieldTranslation.label = objectNameAndLanguageVsFieldMap.get(customFieldLabelMetadata.fullName).get(value);
                        }
                    }
                }
            }

            fieldMetadataTranslation.addAll(customObjectTranslationMetadataList);
        } catch (Exception exceptionInstance) {
            B2B_TranslationTriggerHandler.errorMessageFromMetadata =
                B2B_TranslationTriggerHandler.errorMessageFromMetadata +
                ' | ' +
                exceptionInstance.getMessage(); //BS-1404
        }

        return fieldMetadataTranslation;
    }
}
