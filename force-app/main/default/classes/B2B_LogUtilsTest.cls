/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-06-02 11:27:32
 * @modify date 2022-06-02 11:27:32
 * @desc test class for B2B_LogUtils
 */

@isTest
public with sharing class B2B_LogUtilsTest {
    @isTest
    public static void createInfoLogTest() {
        Test.startTest();
        insert B2B_LogUtils.createInfoLog('B2B_LogUtils createInfoLog', null, null);
        Test.stopTest();
        System.assertEquals(false, [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Message__c = 'B2B_LogUtils createInfoLog'].isEmpty(), 'Log should be created');
    }

    @isTest
    public static void createB2BCheckoutInfoLogTest() {
        Test.startTest();
        insert B2B_LogUtils.CreateB2BCheckoutInfoLog('B2B_LogUtils CreateB2BCheckoutInfoLog', null);
        Test.stopTest();
        System.assertEquals(
            false,
            [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Message__c = 'B2B_LogUtils CreateB2BCheckoutInfoLog'].isEmpty(),
            'Log should be created'
        );
    }

    @isTest
    public static void createWarningLogTest() {
        Test.startTest();
        insert B2B_LogUtils.createWarningLog('B2B_LogUtils createWarningLog', null, null);
        Test.stopTest();
        System.assertEquals(
            false,
            [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Message__c = 'B2B_LogUtils createWarningLog'].isEmpty(),
            'Log should be created'
        );
    }

    @isTest
    public static void createB2BCheckoutWarningLogTest() {
        Test.startTest();
        insert B2B_LogUtils.CreateB2BCheckoutWarningLog('B2B_LogUtils CreateB2BCheckoutWarningLog', null);
        Test.stopTest();
        System.assertEquals(
            false,
            [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Message__c = 'B2B_LogUtils CreateB2BCheckoutWarningLog'].isEmpty(),
            'Log should be created'
        );
    }

    @isTest
    public static void createErrorLogTest() {
        Test.startTest();
        insert B2B_LogUtils.createErrorLog('B2B_LogUtils createErrorLog', null, null);
        Test.stopTest();
        System.assertEquals(false, [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Message__c = 'B2B_LogUtils createErrorLog'].isEmpty(), 'Log should be created');
    }

    @isTest
    public static void createB2BCheckoutErrorLogTest() {
        Test.startTest();
        insert B2B_LogUtils.createB2BCheckoutErrorLog('B2B_LogUtils createB2BCheckoutErrorLog', null);
        Test.stopTest();
        System.assertEquals(
            false,
            [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Message__c = 'B2B_LogUtils createB2BCheckoutErrorLog'].isEmpty(),
            'Log should be created'
        );
    }

    @isTest
    public static void b2bCreateErrorLogWithExTest() {
        try {
            integer a = null;
            a++;
        } catch (Exception ex) {
            Test.startTest();
            insert B2B_LogUtils.createErrorLog(ex, null, null);
            Test.stopTest();
            System.assertEquals(false, [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Message__c = :ex.getMessage()].isEmpty(), 'Log should be created');
        }
    }

    @isTest
    public static void b2bCheckoutErrorLogWithExTest() {
        try {
            integer a = null;
            a++;
        } catch (Exception ex) {
            Test.startTest();
            insert B2B_LogUtils.createB2BCheckoutErrorLog(ex, null);
            Test.stopTest();
            System.assertEquals(false, [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Message__c = :ex.getMessage()].isEmpty(), 'Log should be created');
        }
    }

    @isTest
    public static void createB2BCheckoutErrorLogAsyncTest() {
        Test.startTest();
        B2B_LogUtils.createPersistLogAsync('B2B_LogUtils createB2BCheckoutErrorLog', null, null, null, null);
        Test.stopTest();

        System.assertEquals(
            false,
            [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Message__c = 'B2B_LogUtils createB2BCheckoutErrorLog'].isEmpty(),
            'Log should be created'
        );
    }

    @isTest
    private static void createIntegrationLogTest() {
        Test.startTest();
        insert B2B_LogUtils.createIntegrationLog('Test', 'Test', 'Test', 'Error', 'Test');
        Test.stopTest();
        System.assertEquals(false, [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Message__c = 'Test'].isEmpty(), 'Log should be created');
    }

    @isTest
    private static void createLogForStoringTranslationResultTest() {
        Test.startTest();
        B2B_LogUtils.createLogForStoringTranslationResult('B2B_LogUtils createB2BTranslationErrorLog', null, null, null, null);
        Test.stopTest();

        System.assertEquals(
            false,
            [SELECT Id FROM B2B_CommerceLog__c WHERE B2B_Message__c = 'B2B_LogUtils createB2BTranslationErrorLog'].isEmpty(),
            'Log should be created'
        );
    }
}
