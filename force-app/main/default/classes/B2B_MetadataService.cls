/**
 * @author Soumyakant Pandya
 * @create date 2022-12-08
 * @modify date 2022-12-30 12:00:00
 * @desc This class used for reading, parsing and deploying metadata data from metadata api
 * @referred from https://github.com/financialforcedev/apex-mdapi/tree/master/apex-mdapi/src
 */

//Had to suppress the PMD as this class is generated by WSDL.
@SuppressWarnings('PMD')
public class B2B_MetadataService {
    public static String SOAP_M_URI = 'http://soap.sforce.com/2006/04/metadata';
    public class SaveResult {
        public B2B_MetadataService.Error[] errors;
        public String fullName;
        public Boolean success;
        private String[] errors_type_info = new List<String>{ 'errors', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] fullName_type_info = new List<String>{ 'fullName', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] success_type_info = new List<String>{ 'success', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'errors', 'fullName', 'success' };
    }

    public class ExtendedErrorDetails {
        public String extendedErrorCode;
        private String[] extendedErrorCode_type_info = new List<String>{ 'extendedErrorCode', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'extendedErrorCode' };
    }

    public class SessionSettings {
        public Boolean disableTimeoutWarning;
        public Boolean enableCSPOnEmail;
        public Boolean enableCSRFOnGet;
        public Boolean enableCSRFOnPost;
        public Boolean enableCacheAndAutocomplete;
        public Boolean enableClickjackNonsetupSFDC;
        public Boolean enableClickjackNonsetupUser;
        public Boolean enableClickjackNonsetupUserHeaderless;
        public Boolean enableClickjackSetup;
        public Boolean enableContentSniffingProtection;
        public Boolean enablePostForSessions;
        public Boolean enableSMSIdentity;
        public Boolean enableUpgradeInsecureRequests;
        public Boolean enableXssProtection;
        public Boolean enforceIpRangesEveryRequest;
        public Boolean forceLogoutOnSessionTimeout;
        public Boolean forceRelogin;
        public Boolean hstsOnForcecomSites;
        public Boolean identityConfirmationOnEmailChange;
        public Boolean identityConfirmationOnTwoFactorRegistrationEnabled;
        public Boolean lockSessionsToDomain;
        public Boolean lockSessionsToIp;
        public String logoutURL;
        public Boolean redirectionWarning;
        public Boolean referrerPolicy;
        public Boolean requireHttpOnly;
        public Boolean requireHttps;
        public Boolean securityCentralKillSession;
        public String sessionTimeout;
        private String[] disableTimeoutWarning_type_info = new List<String>{ 'disableTimeoutWarning', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] enableCSPOnEmail_type_info = new List<String>{ 'enableCSPOnEmail', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] enableCSRFOnGet_type_info = new List<String>{ 'enableCSRFOnGet', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] enableCSRFOnPost_type_info = new List<String>{ 'enableCSRFOnPost', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] enableCacheAndAutocomplete_type_info = new List<String>{ 'enableCacheAndAutocomplete', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] enableClickjackNonsetupSFDC_type_info = new List<String>{ 'enableClickjackNonsetupSFDC', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] enableClickjackNonsetupUser_type_info = new List<String>{ 'enableClickjackNonsetupUser', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] enableClickjackNonsetupUserHeaderless_type_info = new List<String>{
            'enableClickjackNonsetupUserHeaderless',
            SOAP_M_URI,
            null,
            '0',
            '1',
            'false'
        };
        private String[] enableClickjackSetup_type_info = new List<String>{ 'enableClickjackSetup', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] enableContentSniffingProtection_type_info = new List<String>{ 'enableContentSniffingProtection', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] enablePostForSessions_type_info = new List<String>{ 'enablePostForSessions', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] enableSMSIdentity_type_info = new List<String>{ 'enableSMSIdentity', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] enableUpgradeInsecureRequests_type_info = new List<String>{ 'enableUpgradeInsecureRequests', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] enableXssProtection_type_info = new List<String>{ 'enableXssProtection', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] enforceIpRangesEveryRequest_type_info = new List<String>{ 'enforceIpRangesEveryRequest', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] forceLogoutOnSessionTimeout_type_info = new List<String>{ 'forceLogoutOnSessionTimeout', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] forceRelogin_type_info = new List<String>{ 'forceRelogin', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] hstsOnForcecomSites_type_info = new List<String>{ 'hstsOnForcecomSites', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] identityConfirmationOnEmailChange_type_info = new List<String>{
            'identityConfirmationOnEmailChange',
            SOAP_M_URI,
            null,
            '0',
            '1',
            'false'
        };
        private String[] identityConfirmationOnTwoFactorRegistrationEnabled_type_info = new List<String>{
            'identityConfirmationOnTwoFactorRegistrationEnabled',
            SOAP_M_URI,
            null,
            '0',
            '1',
            'false'
        };
        private String[] lockSessionsToDomain_type_info = new List<String>{ 'lockSessionsToDomain', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] lockSessionsToIp_type_info = new List<String>{ 'lockSessionsToIp', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] logoutURL_type_info = new List<String>{ 'logoutURL', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] redirectionWarning_type_info = new List<String>{ 'redirectionWarning', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] referrerPolicy_type_info = new List<String>{ 'referrerPolicy', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] requireHttpOnly_type_info = new List<String>{ 'requireHttpOnly', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] requireHttps_type_info = new List<String>{ 'requireHttps', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] securityCentralKillSession_type_info = new List<String>{ 'securityCentralKillSession', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] sessionTimeout_type_info = new List<String>{ 'sessionTimeout', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{
            'disableTimeoutWarning',
            'enableCSPOnEmail',
            'enableCSRFOnGet',
            'enableCSRFOnPost',
            'enableCacheAndAutocomplete',
            'enableClickjackNonsetupSFDC',
            'enableClickjackNonsetupUser',
            'enableClickjackNonsetupUserHeaderless',
            'enableClickjackSetup',
            'enableContentSniffingProtection',
            'enablePostForSessions',
            'enableSMSIdentity',
            'enableUpgradeInsecureRequests',
            'enableXssProtection',
            'enforceIpRangesEveryRequest',
            'forceLogoutOnSessionTimeout',
            'forceRelogin',
            'hstsOnForcecomSites',
            'identityConfirmationOnEmailChange',
            'identityConfirmationOnTwoFactorRegistrationEnabled',
            'lockSessionsToDomain',
            'lockSessionsToIp',
            'logoutURL',
            'redirectionWarning',
            'referrerPolicy',
            'requireHttpOnly',
            'requireHttps',
            'securityCentralKillSession',
            'sessionTimeout'
        };
    }
    public class WebLinkTranslation {
        public String label;
        public String name;
        private String[] label_type_info = new List<String>{ 'label', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] name_type_info = new List<String>{ 'name', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'label', 'name' };
    }

    public class AllOrNoneHeader_element {
        public Boolean allOrNone;
        private String[] allOrNone_type_info = new List<String>{ 'allOrNone', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'allOrNone' };
    }

    public class WorkflowTaskTranslation {
        public String description;
        public String name;
        public String subject;
        private String[] description_type_info = new List<String>{ 'description', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] name_type_info = new List<String>{ 'name', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] subject_type_info = new List<String>{ 'subject', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'description', 'name', 'subject' };
    }
    public class ObjectNameCaseValue {
        public String article;
        public String caseType;
        public Boolean plural;
        public String possessive;
        public String value;
        private String[] article_type_info = new List<String>{ 'article', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] caseType_type_info = new List<String>{ 'caseType', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] plural_type_info = new List<String>{ 'plural', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] possessive_type_info = new List<String>{ 'possessive', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] value_type_info = new List<String>{ 'value', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'article', 'caseType', 'plural', 'possessive', 'value' };
    }

    public class LookupFilterTranslation {
        public String errorMessage;
        public String informationalMessage;
        private String[] errorMessage_type_info = new List<String>{ 'errorMessage', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] informationalMessage_type_info = new List<String>{ 'informationalMessage', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'errorMessage', 'informationalMessage' };
    }

    public class DebuggingInfo_element {
        public String debugLog;
        private String[] debugLog_type_info = new List<String>{ 'debugLog', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'debugLog' };
    }

    public class RecordTypeTranslation {
        public String description;
        public String label;
        public String name;
        private String[] description_type_info = new List<String>{ 'description', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] label_type_info = new List<String>{ 'label', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] name_type_info = new List<String>{ 'name', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'description', 'label', 'name' };
    }

    public class StandardValueSetTranslation extends Metadata {
        public B2B_MetadataService.ValueTranslation[] valueTranslation;
        public String fullName;
        public String type = 'StandardValueSetTranslation'; /**/
        private String[] fullName_type_info = new List<String>{ 'fullName', SOAP_M_URI, null, '0', '1', 'false' }; /**/
        private String[] valueTranslation_type_info = new List<String>{ 'valueTranslation', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'fullName', 'valueTranslation' }; /**/
        private String[] type_att_info = new List<String>{ 'xsi:type' }; /**/
    }

    public class FieldSetTranslation {
        public String label;
        public String name;
        private String[] label_type_info = new List<String>{ 'label', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] name_type_info = new List<String>{ 'name', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'label', 'name' };
    }

    public class SessionHeader_element {
        public String sessionId;
        private String[] sessionId_type_info = new List<String>{ 'sessionId', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'sessionId' };
    }

    public class PicklistValueTranslation {
        public String masterLabel;
        public String translation;
        private String[] masterLabel_type_info = new List<String>{ 'masterLabel', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] translation_type_info = new List<String>{ 'translation', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'masterLabel', 'translation' };
    }

    public class ValueTranslation {
        public String masterLabel;
        public String translation;
        private String[] masterLabel_type_info = new List<String>{ 'masterLabel', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] translation_type_info = new List<String>{ 'translation', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'masterLabel', 'translation' };
    }

    public class Error {
        public B2B_MetadataService.ExtendedErrorDetails[] extendedErrorDetails;
        public String[] fields;
        public String message;
        public String statusCode;
        private String[] extendedErrorDetails_type_info = new List<String>{ 'extendedErrorDetails', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] fields_type_info = new List<String>{ 'fields', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] message_type_info = new List<String>{ 'message', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] statusCode_type_info = new List<String>{ 'statusCode', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'extendedErrorDetails', 'fields', 'message', 'statusCode' };
    }

    public class CallOptions_element {
        public String client;
        private String[] client_type_info = new List<String>{ 'client', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'client' };
    }

    public class CustomFieldTranslation {
        public B2B_MetadataService.ObjectNameCaseValue[] caseValues;
        public String gender;
        public String help;
        public String label;
        public B2B_MetadataService.LookupFilterTranslation lookupFilter;
        public String name;
        public B2B_MetadataService.PicklistValueTranslation[] picklistValues;
        public String relationshipLabel;
        public String startsWith;
        private String[] caseValues_type_info = new List<String>{ 'caseValues', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] gender_type_info = new List<String>{ 'gender', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] help_type_info = new List<String>{ 'help', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] label_type_info = new List<String>{ 'label', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] lookupFilter_type_info = new List<String>{ 'lookupFilter', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] name_type_info = new List<String>{ 'name', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] picklistValues_type_info = new List<String>{ 'picklistValues', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] relationshipLabel_type_info = new List<String>{ 'relationshipLabel', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] startsWith_type_info = new List<String>{ 'startsWith', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{
            'caseValues',
            'gender',
            'help',
            'label',
            'lookupFilter',
            'name',
            'picklistValues',
            'relationshipLabel',
            'startsWith'
        };
    }

    public virtual class Metadata {
        public String fullName;
    }

    public class LogInfo {
        public String category;
        public String level;
        private String[] category_type_info = new List<String>{ 'category', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] level_type_info = new List<String>{ 'level', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'category', 'level' };
    }

    public class DebuggingHeader_element {
        public B2B_MetadataService.LogInfo[] categories;
        public String debugLevel;
        private String[] categories_type_info = new List<String>{ 'categories', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] debugLevel_type_info = new List<String>{ 'debugLevel', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'categories', 'debugLevel' };
    }

    public class QuickActionTranslation {
        public String label;
        public String name;
        private String[] label_type_info = new List<String>{ 'label', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] name_type_info = new List<String>{ 'name', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'label', 'name' };
    }

    public class ValidationRuleTranslation {
        public String errorMessage;
        public String name;
        private String[] errorMessage_type_info = new List<String>{ 'errorMessage', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] name_type_info = new List<String>{ 'name', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'errorMessage', 'name' };
    }

    public class readMetadata_element {
        public String type_x;
        public String[] fullNames;
        private String[] type_x_type_info = new List<String>{ 'type', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] fullNames_type_info = new List<String>{ 'fullNames', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'type_x', 'fullNames' };
    }

    public class updateMetadataResponse_element {
        public B2B_MetadataService.SaveResult[] result;
        private String[] result_type_info = new List<String>{ 'result', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'result' };
    }

    public interface IReadResult {
        B2B_MetadataService.Metadata[] getRecords();
    }

    public interface IReadResponseElement {
        IReadResult getResult();
    }

    public class ReadCustomObjectTranslationResult implements IReadResult {
        public B2B_MetadataService.CustomObjectTranslation[] records;
        public B2B_MetadataService.Metadata[] getRecords() {
            return records;
        }
        private String[] records_type_info = new List<String>{ 'records', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'records' };
    }

    public class readCustomObjectTranslationResponse_element implements IReadResponseElement {
        public B2B_MetadataService.ReadCustomObjectTranslationResult result;
        public IReadResult getResult() {
            return result;
        }
        private String[] result_type_info = new List<String>{ 'result', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'result' };
    }

    public class SharingReasonTranslation {
        public String label;
        public String name;
        private String[] label_type_info = new List<String>{ 'label', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] name_type_info = new List<String>{ 'name', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'label', 'name' };
    }

    public class StandardFieldTranslation extends Metadata {
        public String label;
        public String name;
        public B2B_MetadataService.PicklistValueTranslation[] picklistValues;
        private String[] picklistValues_type_info = new List<String>{ 'picklistValues', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] label_type_info = new List<String>{ 'label', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] name_type_info = new List<String>{ 'name', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'label', 'name' };
    }

    public class LayoutTranslation {
        public String layout;
        public String layoutType;
        public B2B_MetadataService.LayoutSectionTranslation[] sections;
        private String[] layout_type_info = new List<String>{ 'layout', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] layoutType_type_info = new List<String>{ 'layoutType', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] sections_type_info = new List<String>{ 'sections', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'layout', 'layoutType', 'sections' };
    }
    public class LayoutSectionTranslation {
        public String label;
        public String section;
        private String[] label_type_info = new List<String>{ 'label', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] section_type_info = new List<String>{ 'section', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'label', 'section' };
    }
    public class ReadStandardValueSetTranslationResult extends Metadata implements IReadResult {
        public B2B_MetadataService.StandardValueSetTranslation[] records;
        public B2B_MetadataService.Metadata[] getRecords() {
            return records;
        }
        private String[] records_type_info = new List<String>{ 'records', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'records' };
    }

    public class readStandardValueSetTranslationResponse_element implements IReadResponseElement {
        public B2B_MetadataService.ReadStandardValueSetTranslationResult result;
        public IReadResult getResult() {
            return result;
        }
        private String[] result_type_info = new List<String>{ 'result', SOAP_M_URI, null, '1', '1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'result' };
    }

    public class CustomObjectTranslation extends Metadata {
        public String type = 'CustomObjectTranslation';
        public String fullName;
        private String[] fullName_type_info = new List<String>{ 'fullName', SOAP_M_URI, null, '0', '1', 'false' };
        public B2B_MetadataService.ObjectNameCaseValue[] caseValues;
        public B2B_MetadataService.FieldSetTranslation[] fieldSets;
        public B2B_MetadataService.CustomFieldTranslation[] fields;
        public String gender;
        public B2B_MetadataService.LayoutTranslation[] layouts;
        public String nameFieldLabel;
        public B2B_MetadataService.QuickActionTranslation[] quickActions;
        public B2B_MetadataService.RecordTypeTranslation[] recordTypes;
        public B2B_MetadataService.SharingReasonTranslation[] sharingReasons;
        public B2B_MetadataService.StandardFieldTranslation[] standardFields;
        public String startsWith;
        public B2B_MetadataService.ValidationRuleTranslation[] validationRules;
        public B2B_MetadataService.WebLinkTranslation[] webLinks;
        public B2B_MetadataService.WorkflowTaskTranslation[] workflowTasks;
        private String[] caseValues_type_info = new List<String>{ 'caseValues', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] fieldSets_type_info = new List<String>{ 'fieldSets', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] fields_type_info = new List<String>{ 'fields', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] gender_type_info = new List<String>{ 'gender', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] layouts_type_info = new List<String>{ 'layouts', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] nameFieldLabel_type_info = new List<String>{ 'nameFieldLabel', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] quickActions_type_info = new List<String>{ 'quickActions', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] recordTypes_type_info = new List<String>{ 'recordTypes', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] sharingReasons_type_info = new List<String>{ 'sharingReasons', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] standardFields_type_info = new List<String>{ 'standardFields', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] startsWith_type_info = new List<String>{ 'startsWith', SOAP_M_URI, null, '0', '1', 'false' };
        private String[] validationRules_type_info = new List<String>{ 'validationRules', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] webLinks_type_info = new List<String>{ 'webLinks', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] workflowTasks_type_info = new List<String>{ 'workflowTasks', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] type_att_info = new List<String>{ 'xsi:type' };
        private String[] field_order_type_info = new List<String>{
            'fullName',
            'caseValues',
            'fieldSets',
            'fields',
            'gender',
            'layouts',
            'nameFieldLabel',
            'quickActions',
            'recordTypes',
            'sharingReasons',
            'standardFields',
            'startsWith',
            'validationRules',
            'webLinks',
            'workflowTasks'
        };
    }
    public class updateMetadata_element {
        public B2B_MetadataService.Metadata[] metadata;
        private String[] metadata_type_info = new List<String>{ 'metadata', SOAP_M_URI, null, '0', '-1', 'false' };
        private String[] apex_schema_type_info = new List<String>{ SOAP_M_URI, 'true', 'false' };
        private String[] field_order_type_info = new List<String>{ 'metadata' };
    }
    public class MetadataPort {
        public String endpoint_x = URL.getOrgDomainUrl().toExternalForm() + '/services/Soap/m/42.0';
        public Map<String, String> inputHttpHeaders_x;
        public Map<String, String> outputHttpHeaders_x;
        public String clientCertName_x;
        public String clientCert_x;
        public String clientCertPasswd_x;
        public Integer timeout_x;
        public B2B_MetadataService.SessionHeader_element SessionHeader;
        public B2B_MetadataService.DebuggingInfo_element DebuggingInfo;
        public B2B_MetadataService.DebuggingHeader_element DebuggingHeader;
        public B2B_MetadataService.CallOptions_element CallOptions;
        public B2B_MetadataService.AllOrNoneHeader_element AllOrNoneHeader;
        private String SessionHeader_hns = 'SessionHeader=http://soap.sforce.com/2006/04/metadata';
        private String DebuggingInfo_hns = 'DebuggingInfo=http://soap.sforce.com/2006/04/metadata';
        private String DebuggingHeader_hns = 'DebuggingHeader=http://soap.sforce.com/2006/04/metadata';
        private String CallOptions_hns = 'CallOptions=http://soap.sforce.com/2006/04/metadata';
        private String AllOrNoneHeader_hns = 'AllOrNoneHeader=http://soap.sforce.com/2006/04/metadata';
        private String[] ns_map_type_info = new List<String>{ SOAP_M_URI, 'B2B_MetadataService' };
        //Required
        public B2B_MetadataService.SaveResult[] updateMetadata(B2B_MetadataService.Metadata[] metadata) {
            B2B_MetadataService.updateMetadata_element request_x = new B2B_MetadataService.updateMetadata_element();
            request_x.metadata = metadata;
            B2B_MetadataService.updateMetadataResponse_element response_x;
            Map<String, B2B_MetadataService.updateMetadataResponse_element> response_map_x = new Map<String, B2B_MetadataService.updateMetadataResponse_element>();
            response_map_x.put('response_x', response_x);
            try {
                WebServiceCallout.invoke(
                    this,
                    request_x,
                    response_map_x,
                    new List<String>{
                        endpoint_x,
                        '',
                        SOAP_M_URI,
                        'updateMetadata',
                        SOAP_M_URI,
                        'updateMetadataResponse',
                        'B2B_MetadataService.updateMetadataResponse_element'
                    }
                );
            } catch (Exception exceptionInstance) {
                B2B_TranslationTriggerHandler.errorMessageFromMetadata =
                    B2B_TranslationTriggerHandler.errorMessageFromMetadata +
                    ' | ' +
                    exceptionInstance.getMessage(); //BS-1404
            }
            response_x = response_map_x.get('response_x');
            return response_x.result;
        }
        //Required
        public B2B_MetadataService.IReadResult readMetadata(String type_x, String[] fullNames) {
            B2B_MetadataService.readMetadata_element request_x = new B2B_MetadataService.readMetadata_element();
            request_x.type_x = type_x;
            request_x.fullNames = fullNames;
            B2B_MetadataService.IReadResponseElement response_x;
            Map<String, B2B_MetadataService.IReadResponseElement> response_map_x = new Map<String, B2B_MetadataService.IReadResponseElement>();
            response_map_x.put('response_x', response_x);
            try {
                WebServiceCallout.invoke(
                    this,
                    request_x,
                    response_map_x,
                    new List<String>{
                        endpoint_x,
                        '',
                        SOAP_M_URI,
                        'readMetadata',
                        SOAP_M_URI,
                        'readMetadataResponse',
                        'B2B_MetadataService.read' +
                        type_x +
                        'Response_element'
                    }
                );
            } catch (Exception exceptionInstance) {
                B2B_TranslationTriggerHandler.errorMessageFromMetadata =
                    B2B_TranslationTriggerHandler.errorMessageFromMetadata +
                    ' | ' +
                    exceptionInstance.getMessage(); //BS-1404
            }
            response_x = response_map_x.get('response_x');
            return response_x.getResult();
        }
    }
    public static B2B_MetadataService.MetadataPort createService() {
        B2B_MetadataService.MetadataPort service = new B2B_MetadataService.MetadataPort();
        service.SessionHeader = new B2B_MetadataService.SessionHeader_element();
        service.SessionHeader.sessionId = UserInfo.getSessionId();
        return service;
    }
}
