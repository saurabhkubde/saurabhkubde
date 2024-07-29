@isTest
public with sharing class B2B_MetadataTranslationServiceTest {
    private static final Map<String, Map<String, String>> OBJECT_NAME_AND_LANGUAGE_VS_FIELD_MAP = new Map<String, Map<String, String>>{
        'Account-de' => new Map<String, String>{ 'k_Account_Type__c' => 'Kontonummer' }
    };
    private static final Map<String, Map<String, Map<String, String>>> CUSTOM_PICKLIST_OBJECT_NAME_AND_LANGUAGE_VS_FIELD_MAP = new Map<String, Map<String, Map<String, String>>>{
        'Account-de' => new Map<String, Map<String, String>>{ 'Brand__c' => new Map<String, String>{ 'Silhouette' => 'Silhouette-de' } }
    };
    private static final Map<String, Map<String, String>> STANDARD_OBJECT_NAME_AND_LANGUAGE_VS_FIELD_MAP = new Map<String, Map<String, String>>{
        'Account.Industry-de' => new Map<String, String>{ 'Engineering' => 'Ingenieurwesen' },
        'Account.Ownership-de' => new Map<String, String>{ 'Private' => 'Private-de' }
    };

    private static B2B_MetadataService.readStandardValueSetTranslationResponse_element standardValueSetTransaltionResponseObj = B2B_TestDataFactory.createStandardValueSetTranslationResponse();
    private static B2B_MetadataService.readCustomObjectTranslationResponse_element customObjectTranslationResponseObj = B2B_TestDataFactory.createCustomObjectTranslationResponse();

    @isTest
    private static void testMetadataTranslationServiceForInsertUpdate() {
        B2B_MetadataTranslationService metadataTranslationServiceObj = new B2B_MetadataTranslationService();
        Test.startTest();
        List<B2B_MetadataService.Metadata> deploymentMetadataList = metadataTranslationServiceObj.updateMetadataTranslation(
            (List<B2B_MetadataService.CustomObjectTranslation>) customObjectTranslationResponseObj.getResult().getRecords(),
            OBJECT_NAME_AND_LANGUAGE_VS_FIELD_MAP,
            CUSTOM_PICKLIST_OBJECT_NAME_AND_LANGUAGE_VS_FIELD_MAP,
            (List<B2B_MetadataService.StandardValueSetTranslation>) standardValueSetTransaltionResponseObj.getResult().getRecords(),
            STANDARD_OBJECT_NAME_AND_LANGUAGE_VS_FIELD_MAP,
            false
        );
        System.assertEquals(false, deploymentMetadataList.isEmpty(), 'Metadata Deployment list should not be empty');
        Test.stopTest();
    }
    @isTest
    private static void testMetadataTranslationServiceForDelete() {
        B2B_MetadataTranslationService metadataTranslationServiceObj = new B2B_MetadataTranslationService();
        Test.startTest();
        List<B2B_MetadataService.Metadata> deploymentMetadataList = metadataTranslationServiceObj.updateMetadataTranslation(
            (List<B2B_MetadataService.CustomObjectTranslation>) customObjectTranslationResponseObj.getResult().getRecords(),
            OBJECT_NAME_AND_LANGUAGE_VS_FIELD_MAP,
            CUSTOM_PICKLIST_OBJECT_NAME_AND_LANGUAGE_VS_FIELD_MAP,
            (List<B2B_MetadataService.StandardValueSetTranslation>) standardValueSetTransaltionResponseObj.getResult().getRecords(),
            STANDARD_OBJECT_NAME_AND_LANGUAGE_VS_FIELD_MAP,
            true
        );
        System.assertEquals(false, deploymentMetadataList.isEmpty(), 'Metadata Deployment list should not be empty');
        Test.stopTest();
    }

    @isTest
    private static void testMetadataTranslationServiceForCustomPicklistTransaltionInsertOnly() {
        B2B_MetadataTranslationService metadataTranslationServiceObj = new B2B_MetadataTranslationService();
        Test.startTest();
        List<B2B_MetadataService.Metadata> deploymentMetadataList = metadataTranslationServiceObj.updateMetadataTranslation(
            (List<B2B_MetadataService.CustomObjectTranslation>) customObjectTranslationResponseObj.getResult().getRecords(),
            new Map<String, Map<String, String>>(),
            CUSTOM_PICKLIST_OBJECT_NAME_AND_LANGUAGE_VS_FIELD_MAP,
            new List<B2B_MetadataService.StandardValueSetTranslation>(),
            new Map<String, Map<String, String>>(),
            false
        );
        System.assertEquals(false, deploymentMetadataList.isEmpty(), 'Metadata Deployment list should not be empty');
        Test.stopTest();
    }

    @isTest
    private static void testMetadataTranslationServiceAllEmptyList() {
        B2B_MetadataTranslationService metadataTranslationServiceObj = new B2B_MetadataTranslationService();
        Test.startTest();
        List<B2B_MetadataService.Metadata> deploymentMetadataList = metadataTranslationServiceObj.updateMetadataTranslation(
            new List<B2B_MetadataService.CustomObjectTranslation>(),
            new Map<String, Map<String, String>>(),
            new Map<String, Map<String, Map<String, String>>>(),
            new List<B2B_MetadataService.StandardValueSetTranslation>(),
            new Map<String, Map<String, String>>(),
            false
        );
        System.assertEquals(true, deploymentMetadataList.isEmpty(), 'Metadata Deployment list should be empty');
        Test.stopTest();
    }
    @isTest
    private static void testMetadataTranslationServiceLoggingOnCustomPicklist() {
        Test.startTest();
        try {
            B2B_MetadataTranslationService.doCustomPicklistTranslation(null, null, false);
        } catch (Exception e) {
            String msgString = e.getMessage();
            System.assertEquals(
                'Exception while updating custom field\'s label\'s translation | Attempt to de-reference a null object',
                msgString,
                'Should throw an Exception'
            );
        }
    }
    @isTest
    private static void testMetadataTranslationServiceLoggingOnStandardPicklist() {
        Test.startTest();
        try {
            B2B_MetadataTranslationService.createStandardPicklistTransaltion(null, null, false);
        } catch (Exception e) {
            String msgString = e.getMessage();
            System.assertEquals(
                'Exception while updating standard picklist value translation | Attempt to de-reference a null object',
                msgString,
                'Should throw an Exception'
            );
        }
    }
    @isTest
    private static void testMetadataTranslationServiceLoggingOnCustomField() {
        Test.startTest();
        try {
            B2B_MetadataTranslationService.customFieldTranslation(null, null, false);
        } catch (Exception e) {
            String msgString = e.getMessage();
            System.assertEquals(
                'Exception while updating standard picklist value translation | Attempt to de-reference a null object',
                msgString,
                'Should throw an Exception'
            );
        }
    }
}
