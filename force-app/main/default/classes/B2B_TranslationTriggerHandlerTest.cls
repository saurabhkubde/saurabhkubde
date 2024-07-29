//ExcessiveParameterList are being suppresed as we will have to override the doInvoke of WebServiceMock interface.
@SuppressWarnings('PMD.ExcessiveParameterList')
@isTest
public with sharing class B2B_TranslationTriggerHandlerTest {
    @isTest
    public static void b2bTranslationInsertTest() {
        List<B2B_Translation__c> translationList = B2B_TestDataFactory.createB2B_Translation();
        Test.setMock(WebServiceMock.class, new B2B_WebServiceMockImpl());
        Test.startTest();
        insert translationList;
        System.assertEquals(1, Limits.getQueueableJobs(), 'One queueable job should be called from Test');
        Test.stopTest();
    }

    @isTest
    public static void b2bTranslationDeleteTest() {
        List<B2B_Translation__c> translationList = B2B_TestDataFactory.createB2B_Translation();
        Test.setMock(WebServiceMock.class, new B2B_WebServiceMockImpl());
        insert translationList;
        Test.startTest();
        delete translationList;
        System.assertEquals(1, Limits.getQueueableJobs(), 'One queueable job should be called from Test');
        Test.stopTest();
    }

    @isTest
    public static void checkValidityOfTranslationRecordsTest() {
        List<B2B_Translation__c> translationList = B2B_TestDataFactory.createB2B_Translation();
        Test.setMock(WebServiceMock.class, new B2B_WebServiceMockImpl());
        insert translationList;
        Test.startTest();
        Map<Id, String> inValidTranslationRecordsIdVsErrorMsg = B2B_TranslationTriggerHandler.checkValidityOfTranslationRecords(translationList);
        Test.stopTest();
        System.assertEquals(false, inValidTranslationRecordsIdVsErrorMsg.isEmpty(), 'inValidTranslationRecordsIdVsErrorMsg should not empty');
    }

    @isTest
    public static void createCommerceLogRecordTest() {
        Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap = new Map<Id, B2B_Translation__c>();
        List<B2B_Translation__c> translationList = B2B_TestDataFactory.createB2B_Translation();
        Test.setMock(WebServiceMock.class, new B2B_WebServiceMockImpl());
        insert translationList;

        for (B2B_Translation__c record : translationList) {
            translationRecordIdVsRecordMap.put(record.Id, record);
        }

        Test.startTest();
        Map<Id, String> inValidTranslationRecordsIdVsErrorMsg = B2B_TranslationTriggerHandler.checkValidityOfTranslationRecords(translationList);
        B2B_TranslationTriggerHandler.createCommerceLogRecord(inValidTranslationRecordsIdVsErrorMsg, translationRecordIdVsRecordMap);
        Test.stopTest();
        System.assertEquals(false, inValidTranslationRecordsIdVsErrorMsg.isEmpty(), 'inValidTranslationRecordsIdVsErrorMsg should not empty');
        System.assertEquals(false, translationRecordIdVsRecordMap.isEmpty(), 'translationRecordIdVsRecordMap should not empty');
    }

    @isTest
    public static void createSuccessCommerceLogRecordTest() {
        Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap = new Map<Id, B2B_Translation__c>();
        Map<Id, String> inValidTranslationRecordsIdVsErrorMsg = new Map<Id, String>();
        List<B2B_Translation__c> translationList = B2B_TestDataFactory.createB2B_Translation();
        Test.setMock(WebServiceMock.class, new B2B_WebServiceMockImpl());
        insert translationList;

        for (B2B_Translation__c record : translationList) {
            translationRecordIdVsRecordMap.put(record.Id, record);
        }

        Test.startTest();
        B2B_TranslationTriggerHandler.createCommerceLogRecord(inValidTranslationRecordsIdVsErrorMsg, translationRecordIdVsRecordMap);
        Test.stopTest();
        System.assertEquals(false, translationRecordIdVsRecordMap.isEmpty(), 'translationRecordIdVsRecordMap should not empty');
    }
    @isTest
    public static void allFailedB2BTranslationInsertTest() {
        List<B2B_Translation__c> translationList = B2B_TestDataFactory.createB2B_TranslationWrongData();
        Test.setMock(WebServiceMock.class, new B2B_WebServiceMockImpl());
        Test.startTest();
        insert translationList;
        Test.stopTest();
        System.assertEquals(true, B2B_TranslationTriggerHandler.validTranslationRecords.isEmpty(), 'validTranslationRecords are empty');
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
