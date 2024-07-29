/*************************************************************************************************************
 * This class tests D2C_VTO_SessionController
 *
 * @author – Shrikant Dangi
 ***************************************************************************************************************/
@isTest
private class D2C_VTO_SessionControllerTest {
    /**
     * @description Tests that a sessionId is returned when createSessionRecord is called
     */
    @IsTest
    static void positiveSessionCreationTest() {
        Test.startTest();
        Id sessionId = D2C_VTO_SessionController.createSessionRecord(D2C_VTO_Constants.SESSION_STATUS_OPEN, Datetime.now());
        Test.stopTest();
        Assert.areNotEqual(null, sessionId, 'createSessionRecord must return non null id');
    }

    /**
     * @description Tests checkIfActivityRecordExists returns true when
     * activity with SA_COMMAND_QR_CODE_SCANNED is present
     */
    @isTest
    static void positiveNegativeQrScanTest() {
        Test.startTest();
        Id sessionId = D2C_VTO_SessionController.createSessionRecord(D2C_VTO_Constants.SESSION_STATUS_OPEN, Datetime.now());
        Assert.isFalse(D2C_VTO_SessionController.checkIfActivityRecordExists(sessionId, D2C_VTO_Constants.SA_COMMAND_QR_CODE_SCANNED), 'should return false');
        D2C_VTO_SessionController.createSessionActivityIfNotExists(sessionId, D2C_VTO_Constants.SA_COMMAND_QR_CODE_SCANNED);
        D2C_VTO_SessionController.createSessionActivityIfNotExists(sessionId, D2C_VTO_Constants.SA_COMMAND_QR_CODE_SCANNED);
        D2C_VTO_SessionController.updateSessionStatus(sessionId, D2C_VTO_Constants.SESSION_STATUS_IN_PROGRESS);
        Test.stopTest();
        Assert.isTrue(D2C_VTO_SessionController.checkIfActivityRecordExists(sessionId, D2C_VTO_Constants.SA_COMMAND_QR_CODE_SCANNED), 'should return true');
        List<D2C_VTO_POS_Session_Activity__c> posSessionActivityLst = [
            SELECT Id, D2C_VTO_Product_SKU__c
            FROM D2C_VTO_POS_Session_Activity__c
            WHERE D2C_VTO_POS_Session__c = :sessionId AND D2C_VTO_Command__c = :D2C_VTO_Constants.SA_COMMAND_QR_CODE_SCANNED
        ];
        Assert.areEqual(1, posSessionActivityLst.size(), 'should create only one qrCodeScanned activity');
    }

    /**
     * @description Tests updateSessionStatus to mark session in progress
     */
    @IsTest
    static void markSessionInProgressTest() {
        Id sessionId = D2C_VTO_SessionController.createSessionRecord(D2C_VTO_Constants.SESSION_STATUS_OPEN, Datetime.now());
        Test.startTest();
        D2C_VTO_SessionController.updateSessionStatus(sessionId, D2C_VTO_Constants.SESSION_STATUS_IN_PROGRESS);
        Test.stopTest();

        List<D2C_VTO_POS_Session__c> inProgressSession = [
            SELECT Id
            FROM D2C_VTO_POS_Session__c
            WHERE Id = :sessionId AND D2C_VTO_Status__c = :D2C_VTO_Constants.SESSION_STATUS_IN_PROGRESS
        ];
        Assert.isFalse(inProgressSession.isEmpty(), 'must mark session in progress');
    }
}
