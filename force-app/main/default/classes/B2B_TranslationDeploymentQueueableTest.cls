//ExcessiveParameterList are being suppresed as we will have to override the doInvoke of WebServiceMock interface.
@SuppressWarnings('PMD.ExcessiveParameterList')
@isTest
public with sharing class B2B_TranslationDeploymentQueueableTest {
    @isTest
    private static void translationDeploymentWithoutErrorTest() {
        List<B2B_Translation__c> translationList = B2B_TestDataFactory.createB2B_TranslationWrongData();
        insert translationList;

        Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap = new Map<Id, B2B_Translation__c>(); //BS-1404

        for (B2B_Translation__c record : translationList) {
            translationRecordIdVsRecordMap.put(record.Id, record);
        }

        Map<Id, String> inValidTranslationRecordsIdVsErrorMsg = new Map<Id, String>();
        Set<String> invalidPicklistValues = new Set<String>{ 'Picklist Value' }; //BS-1404
        String errorMessageFromMetadata = '';

        List<B2B_MetadataService.Metadata> deploymentMetadataList = new List<B2B_MetadataService.Metadata>();

        B2B_TranslationDeploymentQueueable translationDeploymentQueueable = new B2B_TranslationDeploymentQueueable(
            deploymentMetadataList,
            errorMessageFromMetadata,
            inValidTranslationRecordsIdVsErrorMsg,
            translationRecordIdVsRecordMap,
            invalidPicklistValues
        );
        Test.setMock(WebServiceMock.class, new B2B_WebServiceMockImpl());
        Test.startTest();
        System.enqueueJob(translationDeploymentQueueable);
        System.assertEquals(1, Limits.getQueueableJobs(), 'One queueable job should be called');
        Test.stopTest();
    }

    @isTest
    private static void translationDeploymentErrorMessageFromMetadataTest() {
        List<B2B_Translation__c> translationList = B2B_TestDataFactory.createB2B_Translation();

        Map<Id, B2B_Translation__c> translationRecordIdVsRecordMap = new Map<Id, B2B_Translation__c>(); //BS-1404

        for (B2B_Translation__c record : translationList) {
            translationRecordIdVsRecordMap.put(record.Id, record);
        }

        Map<Id, String> inValidTranslationRecordsIdVsErrorMsg = B2B_TranslationTriggerHandler.checkValidityOfTranslationRecords(translationList); //BS-1404
        Set<String> invalidPicklistValues = new Set<String>(); //BS-1404
        String errorMessageFromMetadata = 'Test';

        List<B2B_MetadataService.Metadata> deploymentMetadataList = new List<B2B_MetadataService.Metadata>();

        B2B_TranslationDeploymentQueueable translationDeploymentQueueable = new B2B_TranslationDeploymentQueueable(
            deploymentMetadataList,
            errorMessageFromMetadata,
            inValidTranslationRecordsIdVsErrorMsg,
            translationRecordIdVsRecordMap,
            invalidPicklistValues
        );
        Test.setMock(WebServiceMock.class, new B2B_WebServiceMockImpl());
        Test.startTest();
        System.enqueueJob(translationDeploymentQueueable);
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
            B2B_MetadataService.updateMetadataResponse_element updateMetadataResponseObj = new B2B_MetadataService.updateMetadataResponse_element();
            List<B2B_MetadataService.SaveResult> saveResultList = new List<B2B_MetadataService.SaveResult>();
            B2B_MetadataService.SaveResult saveResultObj = new B2B_MetadataService.SaveResult();
            saveResultObj.success = true;
            saveResultList.add(saveResultObj);
            updateMetadataResponseObj.result = saveResultList;
            response.put('response_x', updateMetadataResponseObj);
            return;
        }
    }
}
