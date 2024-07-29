/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-06-02 11:14:52
 * @modify date 2022-06-02 11:14:52
 * @desc this class will be used for exception logging
 */

public with sharing class B2B_LogUtils {
    public static final String LOG_TYPE_INFO = 'Info';
    public static final String LOG_TYPE_WARNING = 'Warning';
    public static final String LOG_TYPE_ERROR = 'Error';

    public static final String LOG_PROCESS_CHECKOUT = 'Checkout';
    public static final String LOG_PROCESS_SHIPPING = 'Shipping';
    public static final String LOG_PROCESS_CLIENT = 'ClientSide';
    public static final String LOG_COMMERCE_SETUP = 'CommerceSetup';
    public static final String LOG_PROCESS_REGISTER = 'Register';
    public static final String LOG_PROCESS_SURVEY_COMMIT = 'Survey'; //Added as part of BS-1509
    public static final String LOG_PROCESS_INTEGRATION = 'Integration';
    public static final String LOG_PROCESS_TRANSLATION = 'Translation';

    public class B2B_B2BCheckoutErrorLogsRequest {
        @InvocableVariable
        public String errorMessage;

        @InvocableVariable
        public ID cartId;
    }

    /**
     * @description B2B_LogUtils.createLog
     * @param message message for log
     * @param process : Process like B2BCheckout.
     * @param logType : log type Info, Warning, Error.
     * @param stackTrace :  stack trace of exception.
     * @param relatedRecordId : related record id
     */
    public static B2B_CommerceLog__c createLog(String message, String process, String logType, String stackTrace, String relatedRecordId) {
        B2B_CommerceLog__c commerceLog = new B2B_CommerceLog__c();
        commerceLog.B2B_Message__c = message.abbreviate(255);
        commerceLog.B2B_Message_Details__c = message;
        commerceLog.B2B_Process__c = process;
        commerceLog.B2B_Type__c = logType;
        commerceLog.B2B_Stack_Trace__c = stackTrace;
        commerceLog.B2B_Related_Record_Id__c = relatedRecordId;
        return commerceLog;
    }

    /**
     * @description B2B_LogUtils.createInfoLog
     * @param message : message for log
     * @param process : Process like B2BCheckout.
     * @param relatedRecordId : related record id
     */
    public static B2B_CommerceLog__c createInfoLog(String message, String process, String relatedRecordId) {
        return createLog(message, process, LOG_TYPE_INFO, null, relatedRecordId);
    }

    /**
     * @description B2B_LogUtils.createB2BCheckoutInfoLog
     * @param message : message for log
     * @param relatedRecordId : related record id
     */
    public static B2B_CommerceLog__c createB2BCheckoutInfoLog(String message, String relatedRecordId) {
        return createLog(message, LOG_PROCESS_CHECKOUT, LOG_TYPE_INFO, null, relatedRecordId);
    }

    /**
     * @description B2B_LogUtils.createWarningLog
     * @param message : message for log
     * @param process : Process like B2BCheckout.
     * @param relatedRecordId : related record id
     */
    public static B2B_CommerceLog__c createWarningLog(String message, String process, String relatedRecordId) {
        return createLog(message, process, LOG_TYPE_WARNING, null, relatedRecordId);
    }

    /**
     * @description B2B_LogUtils.createB2BCheckoutWarningLog
     * @param message : message for log
     * @param relatedRecordId : related record id
     */
    public static B2B_CommerceLog__c createB2BCheckoutWarningLog(String message, String relatedRecordId) {
        return createLog(message, LOG_PROCESS_CHECKOUT, LOG_TYPE_WARNING, null, relatedRecordId);
    }

    /**
     * @description B2B_LogUtils.createErrorLog
     * @param message : message for log
     * @param process : Process like B2BCheckout.
     * @param stackTrace : stack trace of exception.
     * @param relatedRecordId : related record id
     */
    public static B2B_CommerceLog__c createErrorLog(String message, String process, String stackTrace, String relatedRecordId) {
        return createLog(message, process, LOG_TYPE_ERROR, stackTrace, relatedRecordId);
    }

    /**
     * @description B2B_LogUtils.createB2BCheckoutErrorLog
     * @param message : message for log
     * @param stackTrace : stack trace of exception.
     * @param relatedRecordId : related record id
     */
    public static B2B_CommerceLog__c createB2BCheckoutErrorLog(String message, String stackTrace, String relatedRecordId) {
        return createErrorLog(message, LOG_PROCESS_CHECKOUT, stackTrace, relatedRecordId);
    }

    /**
     * @description B2B_LogUtils.createErrorLog
     * @param message : message for log
     * @param process : Process like B2BCheckout.
     * @param relatedRecordId : related record id
     */
    public static B2B_CommerceLog__c createErrorLog(String message, String process, String relatedRecordId) {
        return createErrorLog(message, process, null, relatedRecordId);
    }

    /**
     * @description B2B_LogUtils.createB2BCheckoutErrorLog
     * @param message : message for log
     * @param relatedRecordId : related record id
     */
    public static B2B_CommerceLog__c createB2BCheckoutErrorLog(String message, String relatedRecordId) {
        return createB2BCheckoutErrorLog(message, null, relatedRecordId);
    }

    /**
     * @description B2B_LogUtils.createErrorLog
     * @param ex : exception
     * @param process : Process like B2BCheckout.
     * @param relatedRecordId : related record id
     */
    public static B2B_CommerceLog__c createErrorLog(Exception ex, String process, String relatedRecordId) {
        return createErrorLog(ex.getMessage(), process, ex.getStackTraceString(), relatedRecordId);
    }

    /**
     * @description B2B_LogUtils.createB2BCheckoutErrorLog
     * @param ex : exception
     * @param relatedRecordId : related record id
     */
    public static B2B_CommerceLog__c createB2BCheckoutErrorLog(Exception ex, String relatedRecordId) {
        return createB2BCheckoutErrorLog(ex.getMessage(), ex.getStackTraceString(), relatedRecordId);
    }

    /**
     * @description Create a single Log record async
     * @param String message
     * @param String process
     * @param String logType
     * @param String stackTrace
     * @param String relatedRecordId
     **/
    @future
    public static void createPersistLogAsync(String message, String process, String logType, String stackTrace, String relatedRecordId) {
        B2B_CommerceLog__c log = createLog(message, process, logType, stackTrace, relatedRecordId);
        insert log;
    }

    /**
     * @description This method is used to create commerce log for the errors occured during callout
     * BS-1034
     * @param String message
     * @param String messageDetails
     * @param String process
     * @param String logType
     * @param String relatedRecordId
     **/
    public static B2B_CommerceLog__c createIntegrationLog(String message, String messageDetails, String process, String logType, String relatedRecordId) {
        B2B_CommerceLog__c commerceLog = new B2B_CommerceLog__c();
        commerceLog.B2B_Message__c = String.isNotBlank(message) ? message : null;
        commerceLog.B2B_Message_Details__c = String.isNotBlank(messageDetails) ? messageDetails : null;
        commerceLog.B2B_Process__c = String.isNotBlank(process) ? process : null;
        commerceLog.B2B_Type__c = String.isNotBlank(logType) ? logType : B2B_Constants.INFO_TYPE_LOGGING;
        commerceLog.B2B_Related_Record_Id__c = String.isNotBlank(relatedRecordId) ? relatedRecordId : null;
        return commerceLog;
    }

    /**
     * BS-1404
     * @description Creating a Log record for translation process.
     * @param String message
     * @param String process
     * @param String logType
     * @param String stackTrace
     * @param String relatedRecordId
     **/
    public static Id createLogForStoringTranslationResult(String message, String process, String logType, String stackTrace, String relatedRecordId) {
        Id insertedLogId;
        B2B_CommerceLog__c log = createLog(message, process, logType, stackTrace, relatedRecordId);

        if (log != null) {
            insert log;
            insertedLogId = log.Id;
        }

        return insertedLogId;
    }
}
