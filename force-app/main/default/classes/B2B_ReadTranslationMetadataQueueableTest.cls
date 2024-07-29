//ExcessiveParameterList are being suppresed as we will have to override the doInvoke of WebServiceMock interface.
@SuppressWarnings('PMD.ExcessiveParameterList')
@isTest
public with sharing class B2B_ReadTranslationMetadataQueueableTest {
    static Map<Id, String> inValidTranslationRecordsIdVsErrorMsg = new Map<Id, String>(); //BS-1404
    static Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap = new Map<Id, B2B_Translation__c>(); //BS-1404

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

    @isTest
    private static void readMetadataTest() {
        List<B2B_Translation__c> translationList = B2B_TestDataFactory.createB2B_Translation();
        insert translationList;

        Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap = new Map<Id, B2B_Translation__c>(); //BS-1404

        for (B2B_Translation__c record : translationList) {
            translationRecordIdVsRecordMap.put(record.Id, record);
        }
        B2B_TranslationTriggerHandler.errorMessageFromMetadata = 'test';
        Map<Id, String> inValidTranslationRecordsIdVsErrorMsg = B2B_TranslationTriggerHandler.checkValidityOfTranslationRecords(translationList);

        B2B_ReadTranslationMetadataQueueable readTranslationMetadataQueueableClassObj = new B2B_ReadTranslationMetadataQueueable(
            OBJECT_NAME_AND_LANGUAGE_VS_FIELD_MAP,
            CUSTOM_PICKLIST_OBJECT_NAME_AND_LANGUAGE_VS_FIELD_MAP,
            STANDARD_OBJECT_NAME_AND_LANGUAGE_VS_FIELD_MAP,
            false,
            inValidTranslationRecordsIdVsErrorMsg,
            translationRecordIdVsRecordMap
        );

        Test.setMock(WebServiceMock.class, new B2B_WebServiceMockImpl());
        Test.startTest();
        B2B_TranslationTriggerHandler.errorMessageFromMetadata = 'test';
        System.enqueueJob(readTranslationMetadataQueueableClassObj);
        System.assertEquals(1, Limits.getQueueableJobs(), 'One queueable job should be called');
        Test.stopTest();
    }

    @isTest
    private static void readEmptyMetadataTest() {
        Map<String, Map<String, String>> objectNameAndLanguageVsFieldMap = new Map<String, Map<String, String>>();
        Map<String, Map<String, Map<String, String>>> customPicklistObjectNameAndLanguageVsFieldMap = new Map<String, Map<String, Map<String, String>>>();
        Map<String, Map<String, String>> standardObjectNameAndLanguageVsFieldMap = new Map<String, Map<String, String>>();

        B2B_ReadTranslationMetadataQueueable readTranslationMetadataQueueableClassObj = new B2B_ReadTranslationMetadataQueueable(
            objectNameAndLanguageVsFieldMap,
            customPicklistObjectNameAndLanguageVsFieldMap,
            standardObjectNameAndLanguageVsFieldMap,
            false,
            inValidTranslationRecordsIdVsErrorMsg,
            translationRecordIdVsRecordMap
        );

        Test.setMock(WebServiceMock.class, new B2B_WebServiceMockImpl());
        Test.startTest();
        B2B_TranslationTriggerHandler.errorMessageFromMetadata = 'test';
        System.enqueueJob(readTranslationMetadataQueueableClassObj);
        System.assertEquals(1, Limits.getQueueableJobs(), 'One queueable job should be called');
        Test.stopTest();
    }

    public class B2B_WebServiceMockImpl implements WebServiceMock {
        public void doInvoke(
            Object stub,
            Object request,
            Map<String, Object> response,
            String endpoint,
            String soapAction,
            String requestName,
            String responseNS,
            String responseName,
            String responseType
        ) {
            B2B_MetadataService.readMetadata_element requestObj = (B2B_MetadataService.readMetadata_element) request;
            if (requestObj.type_x == 'CustomObjectTranslation') {
                B2B_MetadataService.readCustomObjectTranslationResponse_element customObjectTranslationResponseObj = B2B_TestDataFactory.createCustomObjectTranslationResponse();
                response.put('response_x', customObjectTranslationResponseObj);
            }
            if (requestObj.type_x == 'StandardValueSetTranslation') {
                B2B_MetadataService.readStandardValueSetTranslationResponse_element standardValueSetTransaltionResponseObj = B2B_TestDataFactory.createStandardValueSetTranslationResponse();
                response.put('response_x', standardValueSetTransaltionResponseObj);
            }
            return;
        }
    }
}
