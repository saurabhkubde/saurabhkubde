/**
 * @author Soumyakant Pandya
 * @create date 2022-12-08
 * @modify date 2022-12-30
 * @desc This is a test class to obtain coverage for the generated WSDL2Apex (B2B_MetadataService) code
 */
@SuppressWarnings('PMD')
@isTest
private class B2B_MetadataServiceTest {
    /**
     * Dummy Metadata API web service mock class (see MetadataCreateJobTest.cls for a better example)
     **/
    private class WebServiceMockImpl implements WebServiceMock {
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
            if (request instanceof B2B_MetadataService.updateMetadata_element) {
                response.put('response_x', new B2B_MetadataService.updateMetadataResponse_element());
            }
            if (request instanceof B2B_MetadataService.readMetadata_element) {
                response.put('response_x', B2B_TestDataFactory.createCustomObjectTranslationResponse());
            }
            return;
        }
    }
    @IsTest
    private static void coverGeneratedCodeCRUDOperations() {
        // Null Web Service mock implementation
        System.Test.setMock(WebServiceMock.class, new WebServiceMockImpl());
        // Only required to workaround a current code coverage bug in the platform
        B2B_MetadataService B2B_MetadataService = new B2B_MetadataService();
        // Invoke operations
        Test.startTest();
        B2B_MetadataService.MetadataPort metaDataPort = new B2B_MetadataService.MetadataPort();
        Test.stopTest();
    }

    @IsTest
    private static void coverGeneratedCodeFileBasedOperations1() {
        // Null Web Service mock implementation
        System.Test.setMock(WebServiceMock.class, new WebServiceMockImpl());
        // Only required to workaround a current code coverage bug in the platform
        B2B_MetadataService B2B_MetadataService = new B2B_MetadataService();
        // Invoke operations
        Test.startTest();
        B2B_MetadataService.MetadataPort metaDataPort = new B2B_MetadataService.MetadataPort();
        metaDataPort.updateMetadata(null);
        Test.stopTest();
    }

    @IsTest
    private static void coverGeneratedCodeFileBasedOperations2() {
        // Null Web Service mock implementation
        System.Test.setMock(WebServiceMock.class, new WebServiceMockImpl());
        // Only required to workaround a current code coverage bug in the platform
        B2B_MetadataService B2B_MetadataService = new B2B_MetadataService();
        // Invoke operations
        Test.startTest();
        B2B_MetadataService.MetadataPort metaDataPort = new B2B_MetadataService.MetadataPort();
        metaDataPort.readMetadata(null, null);
        Test.stopTest();
    }

    @IsTest
    private static void coverGeneratedCodeTypes() {
        // Reference types
        Test.startTest();
        new B2B_MetadataService.PicklistValueTranslation();
        new B2B_MetadataService.ObjectNameCaseValue();
        new B2B_MetadataService.CustomFieldTranslation();

        new B2B_MetadataService.Metadata();
        new B2B_MetadataService.SessionHeader_element();
        new B2B_MetadataService.CustomObjectTranslation();
        new B2B_MetadataService.DebuggingInfo_element();
        new B2B_MetadataService.SessionSettings();
        new B2B_MetadataService.Error();
        new B2B_MetadataService.SaveResult();
        new B2B_MetadataService.updateMetadataResponse_element();
        new B2B_MetadataService.readMetadata_element();
        new B2B_MetadataService.ReadCustomObjectTranslationResult();
        new B2B_MetadataService.readCustomObjectTranslationResponse_element();
        new B2B_MetadataService.StandardFieldTranslation();
        new B2B_MetadataService.AllOrNoneHeader_element();
        new B2B_MetadataService.ValueTranslation();
        new B2B_MetadataService.StandardValueSetTranslation();
        Test.stopTest();
    }

    @IsTest
    private static void elfMissingGetRecordsTest() {
        // elf patch
        Test.startTest();

        Test.stopTest();
    }

    @IsTest
    private static void elfMissingGetResultTest() {
        // elf patch
        Test.startTest();
        new B2B_MetadataService.readCustomObjectTranslationResponse_element().getResult();
        Test.stopTest();
    }
    @IsTest
    private static void coverMetadataServiceExamples() {
        Test.startTest();
        B2B_MetadataService.createService();
        Test.stopTest();
    }
}
