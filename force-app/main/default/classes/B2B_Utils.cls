@SuppressWarnings('PMD')
public with sharing class B2B_Utils {
    public static final String VARIATION_PARENT = 'VariationParent';
    @TestVisible
    private static Map<String, Webstore> communityIdToWebstoreCache = new Map<String, Webstore>();

    // A cache which maps community Ids to WebStore Ids
    @TestVisible
    private static Map<String, String> communityIdToWebStoreIdCache = new Map<String, String>();

    // A cache to map a string to ConnectApi.CartItemSortOrder
    private static Map<String, ConnectApi.CartItemSortOrder> sortOrderCache = new Map<String, ConnectApi.CartItemSortOrder>();

    public static Webstore getWebstoreByCommunityId(String communityId) {
        if (String.isBlank(communityId)) {
            return null;
        }

        if (communityIdToWebstoreCache.containsKey(communityId)) {
            return communityIdToWebstoreCache.get(communityId);
        } else {
            WebStore store = [
                SELECT Id, Name, DefaultLanguage, SupportedLanguages
                FROM Webstore
                WHERE Id IN (SELECT WebstoreId FROM WebStoreNetwork WHERE NetworkId = :communityId)
                LIMIT 1
            ];
            communityIdToWebstoreCache.put(communityId, store);

            return store;
        }
    }

    /**
     * @description Given a community ID or WebStore Id, returns the relavent webstore ID for use in B2B Commerce on lightning
     * @param  communityOrWebstoreId The Id of the community from which the call originated
     * @return weStoreId The webStoreId corresponding to the community Id.
     */
    public static String resolveWebstoreId(String communityOrWebstoreId) {
        if (communityOrWebstoreId == null || String.isBlank(communityOrWebstoreId)) {
            if (Test.isRunningTest()) {
                return null;
            }
            throw new B2B_Exception('Community or WebStore Id null or blank:' + communityOrWebstoreId);
        }
        // WebStore -> return Id
        if (communityOrWebstoreId.startsWith(WebStore.sObjectType.getDescribe(SObjectDescribeOptions.FULL).getKeyPrefix())) {
            return communityOrWebstoreId;
        }
        if (communityIdToWebStoreIdCache.containsKey(communityOrWebstoreId)) {
            return communityIdToWebStoreIdCache.get(communityOrWebstoreId);
        } else {
            String webStoreId = Test.isRunningTest()
                ? B2B_TestDataFactory.mockRecordId(WebStore.getSObjectType())
                : [SELECT WebStoreId FROM WebStoreNetwork WHERE NetworkId = :communityOrWebstoreId]?.WebStoreId;
            communityIdToWebStoreIdCache.put(communityOrWebstoreId, webStoreId);
            return webStoreId;
        }
    }

    /**
     * @description checks if fields for a certain object are accessible
     * @author Matthias Lindner
     * @param  obj           obj name of the object which needs to be checked
     * @param  fieldsToCheck fieldsToCheck array with all fields to check
     * @return               returns if all fields are accessible or not
     */
    public static Boolean checkIfAccessible(String obj, String[] fieldsToCheck) {
        Boolean hasAccess = true;

        Schema.DescribeSObjectResult[] descResult = Schema.describeSObjects(new List<String>{ obj }, SObjectDescribeOptions.FULL);

        Map<String, Schema.SObjectField> m = descResult[0].fields.getMap();

        for (String fieldToCheck : fieldsToCheck) {
            // Check if the user has access to view field
            if (!m.get(fieldToCheck).getDescribe().isAccessible()) {
                hasAccess = false;
                break;
            }
        }

        return hasAccess;
    }

    /*
     * @description inserts a community user. needs to be future due to mixed dml
     * @author Matthias Lindner
     * @param  contactId contactId contact id for the new user
     * @param  context   context defines which profile will be assigned
     */
    @future
    public static void insertCommunityUser(String contactId, String context) {
        Id profileId;
        if (context == 'silhouette') {
            profileId = [SELECT Id FROM Profile WHERE Name = 'B2B Commerce User Silhouette' LIMIT 1].Id;
        } else if (context == 'neubau') {
            profileId = [SELECT Id FROM Profile WHERE Name = 'B2B Commerce User Neubau' LIMIT 1].Id;
        }

        String organizationId = UserInfo.getOrganizationId();
        String dateString = String.valueof(Datetime.now()).replace(' ', '').replace(':', '').replace('-', '');
        String uniqueName = organizationId + dateString + Integer.valueOf(Math.rint(Math.random() * 1000000));
        User commUser = new User(
            firstname = (context == 'silhouette') ? 'Silhouette' : 'Neubau',
            lastName = 'TestUSer',
            email = uniqueName + '@test' + organizationId + '.org',
            Username = uniqueName + '@test' + organizationId + '.org',
            EmailEncodingKey = 'ISO-8859-1',
            Alias = uniqueName.substring(18, 23),
            TimeZoneSidKey = 'Europe/Berlin',
            LocaleSidKey = 'de_DE',
            LanguageLocaleKey = 'de',
            CommunityNickname = 'commNick' + dateString,
            IsActive = true,
            ProfileId = profileId,
            ContactId = contactId,
            PortalRole = 'Manager'
        );

        insert commUser;
    }

    /**
     * @description returns the available store languages
     * @author Matthias Lindner
     * @param  communityId communityId holds the current communityId for the needed languages
     * @return             return returns a string with all country codes
     */
    @AuraEnabled(cacheable=true)
    public static String getAvailableWebstoreLanguages(Id communityId) {
        String webstoreId;
        try {
            webstoreId = resolveWebstoreId(communityId);
            return [SELECT SupportedLanguages FROM Webstore WHERE Id = :webstoreId LIMIT 1]?.SupportedLanguages;
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_Utils', webstoreId);
            throw new B2B_Exception('Could not resolve the available webstore languages for webstore: ' + webstoreId);
        }
    }

    /**
     * @description changePassword changes the password for the current user
     * @author Matthias Lindner
     * @param  oldPassword      oldPassword
     * @param  newPassword      newPassword
     * @param  verifyedPassword verifyedPassword
     */
    @AuraEnabled
    public static void changePassword(String oldPassword, String newPassword, String verifyedPassword, String language, Boolean isSilhouetteSite) {
        try {
            Site.changePassword(newPassword, verifyedPassword, oldPassword);
            sendChangePasswordMail(language, isSilhouetteSite);
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_Utils.changePassword', 'Change Password Controller');
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description sendChangePasswordMail sends out an email that the password was successfully changed
     * @author Matthias Lindner
     */
    public static void sendChangePasswordMail(String language, Boolean isSilhouetteSite) {
        List<EmailTemplate> emailTemplateList;
        String query = 'SELECT Id, Subject, Description, HtmlValue, DeveloperName, Body FROM EmailTemplate WHERE name = \'';
        if (isSilhouetteSite) {
            query = query + 'B2B SH New Password Notification All Languages\''; //BS-1365
        } else {
            query = query + 'B2B NB New Password Notification All Languages\''; //BS-1457
        }

        try {
            emailTemplateList = Database.query(query);
            String email = [SELECT Account.k_Email__c FROM Contact WHERE Id IN (SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId()) LIMIT 1]
            ?.Account.k_Email__c;
            new B2B_FetchDataInSystemContext().sendEmail(emailTemplateList[0], email, UserInfo.getUserId(), isSilhouetteSite);
        } catch (Exception e) {
            B2B_LogUtils.createPersistLogAsync(e.getMessage(), 'B2B_Utils.sendChangePasswordMail', B2B_LogUtils.LOG_TYPE_ERROR, 'none', 'none');
            throw new B2B_Exception(System.Label.B2B_LOGIN_Generic_Error);
        }
    }

    @AuraEnabled
    public static Id getAccountIdByCurrentUser() {
        return [SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1]?.AccountId;
    }

    /**
     * @description Given a sortParam string, return null or the relavent ConnectApi.CartItemSortOrder enum value
     * See https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/connectAPI_enums.htm#cartItemSortOrderEnum for the enum values
     * @param  sortParam A string representing a sort Param.
     * @return resolvedSortParam A ConnectApi.CartItemSortOrder enum value or null
     * @example
     * ConnectApi.CartItemSortOrder sortParam = B2BUtils.resolveSortParam('CreatedDateAsc');
     */
    public static ConnectApi.CartItemSortOrder resolveSortParam(String sortParam) {
        if (sortOrderCache.isEmpty()) {
            for (ConnectApi.CartItemSortOrder sortOrder : ConnectApi.CartItemSortOrder.values()) {
                sortOrderCache.put(sortOrder.name(), sortOrder);
            }
        }
        return sortOrderCache.get(sortParam);
    }

    /**
     * @description selects email template to send the email
     * @author Vishalsingh Gaur
     * @param language              site language
     * @param isSilhouetteLogin     is page from Silhouette store front
     * @param email                 email address to send the email
     * @param isPartnerRegistration is the request from partner registration from
     */
    public static void sendEmailToUser(String langauge, Boolean isSilhouetteLogin, String email, Boolean isPartnerRegistration) {
        List<EmailTemplate> emailTemplateList;
        String query = 'SELECT Id, Subject, Description, HtmlValue, DeveloperName, Body FROM EmailTemplate WHERE Name = \'';
        if (isSilhouetteLogin) {
            query = isPartnerRegistration
                ? query + 'B2B SH Partner Interest Confirmation All Languages\''
                : query + 'B2B SH  Contact Customer Service All Languages\''; //BS-1365
        } else {
            query = isPartnerRegistration
                ? query + 'B2B NB Partner Interest Confirmation All Languages\''
                : query + 'B2B NB Contact Customer Service All Languages\''; //BS-1457
        }

        try {
            emailTemplateList = Database.query(query);
            if (isPartnerRegistration == false) {
                new B2B_FetchDataInSystemContext().sendEmail(emailTemplateList[0], email, UserInfo.getUserId(), isSilhouetteLogin);
            }
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_Utils', 'Query: ' + query);
            throw new AuraHandledException(System.Label.B2B_LOGIN_Generic_Error);
        }
    }

    /**
     * @description Method to fetch the product details for filters
     * @param productIdList The Ids of the product for which the details needs to be fetched
     * @param categoryName Name of the category for which the products needs to be fetched.
     * @return List of product data
     */
    @AuraEnabled(cacheable=false)
    public static List<Product2> getAllProducts(List<String> productIdList, String categoryId) {
        Set<Id> categoryIdSet = new Set<Id>();
        Set<String> productIdSet2 = new Set<String>();
        List<ProductCategoryProduct> productCategoryProductList = new List<ProductCategoryProduct>();
        if (String.isBlank(categoryId) == false) {
            categoryIdSet.add((Id) categoryId);
            List<ProductCategory> productCategoryList = [SELECT Id, Name FROM ProductCategory WHERE ParentCategoryId = :categoryId];
            if (productCategoryList.isEmpty() == false) {
                for (ProductCategory productCategory : productCategoryList) {
                    categoryIdSet.add(productCategory.Id);
                }
                List<ProductCategory> childProductCategoryList = [SELECT Id, Name FROM ProductCategory WHERE ParentCategoryId IN :categoryIdSet];
                if (childProductCategoryList.isEmpty() == false) {
                    for (ProductCategory productCategory : childProductCategoryList) {
                        categoryIdSet.add(productCategory.Id);
                    }
                }
            }

            productCategoryProductList = [
                SELECT ProductId
                FROM ProductCategoryProduct
                WHERE ProductId IN :productIdList AND ProductCategoryId IN :categoryIdSet AND Product.ProductClass != :VARIATION_PARENT
            ];
            for (ProductCategoryProduct productCategoryProductObj : productCategoryProductList) {
                productIdSet2.add(productCategoryProductObj.ProductId);
            }
        } else {
            productIdSet2.addAll(productIdList);
        }
        //Removed toLabel as part of BS-821
        String productListQuery = '';
        // building a query to get the products
        productListQuery = 'SELECT ';
        for (Schema.FieldSetMember fieldSetInstance : SObjectType.Product2.FieldSets.Reorder_Product_Search_Attributes.getFields()) {
            if (fieldSetInstance.getFieldPath() != B2B_Constants.BRAND_FIELD_API_NAME) {
                productListQuery += ' ' + fieldSetInstance.getFieldPath() + ','; //BS-821
            }
        }
        productListQuery += ' toLabel(B2B_Brand__c)';
        productListQuery += '  FROM Product2 WHERE Id IN :productIdSet2 ORDER BY B2B_Launch_Date__c DESC';
        List<Product2> productList = Database.query(productListQuery);

        return productList;
    }

    /**
     * @description sendChangePasswordMail sends out an email that the password was successfully changed
     * @param language              site language
     * @param isSilhouetteLogin     is page from Silhouette store front
     * @author Soumyakant Pandya
     */
    @AuraEnabled
    public static void sendMailForAddressChangeRequest(String language, Boolean isSilhouetteSite) {
        List<EmailTemplate> emailTemplateList;
        String query = 'SELECT Id, Subject, Description, HtmlValue, DeveloperName, Body FROM EmailTemplate WHERE Name = \'';
        if (isSilhouetteSite) {
            query = query + 'B2B SH Change Address All Languages\''; //BS-1365
        } else {
            query = query + 'B2B NB Change Address All Languages\''; //BS-1457
        }

        try {
            emailTemplateList = Database.query(query);
            sendAddressChangeEmail(emailTemplateList[0], isSilhouetteSite);
        } catch (Exception e) {
            B2B_LogUtils.createPersistLogAsync(e.getMessage(), 'B2B_Utils.sendMailForAddressChangeRequest', B2B_LogUtils.LOG_TYPE_ERROR, 'none', 'none');
            throw new B2B_Exception(System.Label.B2B_LOGIN_Generic_Error);
        }
    }

    /**
     * @description reusable method to send an email based on Email Template
     * @author Soumyakant Pandya
     * @param  template           email template used by the email
     */
    public static void sendAddressChangeEmail(EmailTemplate template, Boolean isSilhouetteSite) {
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        List<OrgWideEmailAddress> orgWideEmailAddressList = new B2B_FetchDataInSystemContext().fetchOrgWideEmailAddress(isSilhouetteSite);
        if (orgWideEmailAddressList.isEmpty() == false) {
            message.setOrgWideEmailAddressId(orgWideEmailAddressList[0].Id);
        }

        message.setTargetObjectId(UserInfo.getUserId());
        message.setReplyTo(orgWideEmailAddressList[0].Address);
        message.setTemplateID(template.Id);
        message.setSaveAsActivity(false);
        Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage>{ message };
        Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);

        if (!results[0].success) {
            B2B_LogUtils.createPersistLogAsync(results[0].errors[0].message, 'B2B_Registration', B2B_LogUtils.LOG_TYPE_ERROR, 'none', 'none');
            throw new AuraHandledException(System.Label.B2B_LOGIN_Generic_Error);
        }
    }

    /**
     * @description selects email template to send the email
     * BS-1057
     * @author Soumyakant Pandya
     * @param language              site language
     * @param isSilhouetteLogin     is page from Silhouette store front
     * @param email                 email address to send the email
     * @param isPartnerRegistration is the request from partner registration from
     */
    public static void sendPartnerRegistrationEmailToUser(
        String langauge,
        Boolean isSilhouetteLogin,
        String email,
        Boolean isPartnerRegistration,
        Id contactId
    ) {
        List<EmailTemplate> emailTemplateList = new List<EmailTemplate>();
        String query = 'SELECT Id, Subject, Description, HtmlValue, DeveloperName, Body FROM EmailTemplate WHERE Name = \'';
        if (isSilhouetteLogin == true && isPartnerRegistration == true) {
            query = query + 'B2B SH Partner Interest Confirmation All Languages\''; //BS-1365
        } else if (isSilhouetteLogin == false && isPartnerRegistration == true) {
            query = query + 'B2B NB Partner Interest Confirmation All Languages\''; //BS-1457
        }
        emailTemplateList = Database.query(query);
        if (isPartnerRegistration == true) {
            new B2B_FetchDataInSystemContext().sendEmail(emailTemplateList[0], email, contactId, isSilhouetteLogin);
        }
    }

    /**
     * @description This Reusable method is used to send an email for erros occured during schneider callout
     * BS-1034
     * @author Chirag L
     * @param  subject  :  subject that needs to be set in the email
     * @param  body     :  body that needs to be sent in the email
     */
    public static void sendSchneiderCalloutEmails(List<String> targetEmailAddressList, String subject, String body) {
        if (targetEmailAddressList.isEmpty() == false && String.isNotBlank(subject) && String.isNotBlank(body)) {
            List<OrgWideEmailAddress> orgWideEmailAddressList = [
                SELECT Id, Address
                FROM OrgWideEmailAddress
                WHERE Address = :B2B_Constants.SILHOUETTE_NO_REPLY_EMAIL_ADDRESS
            ];
            Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
            message.toAddresses = targetEmailAddressList;
            message.setOrgWideEmailAddressId(orgWideEmailAddressList[0].Id);
            message.setReplyTo(orgWideEmailAddressList[0].Address);
            message.setSubject(subject);
            message.setPlainTextBody(body);
            message.setSaveAsActivity(false);
            Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage>{ message };
            Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);

            if (!results[0].success) {
                B2B_LogUtils.createPersistLogAsync(
                    results[0].errors[0].message,
                    B2B_Constants.SCHNEIDER_CALLOUT_PROCESS,
                    B2B_LogUtils.LOG_TYPE_ERROR,
                    'none',
                    'none'
                );
            }
        }
    }
    @AuraEnabled(cacheable=false)
    /**
     * @description Method to check whether the account is locked for the order.
     * BS-963
     * @author Soumyakant Pandya
     * @param  accountId : Id of the for which order lock status needs to be fetched.
     */
    public static Boolean checkAccountOrderLock(Id accountId) {
        List<Account> accountList = [SELECT Id, Order_Lock_Status__c FROM Account WHERE Id = :accountId LIMIT 1];
        if (accountList.isEmpty() == false && accountList[0].Order_Lock_Status__c == B2B_Constants.B2B_ORDER_LOCKED_STATUS_PICKLIST_VALUE) {
            return true;
        } else {
            return false;
        }
    }

    @AuraEnabled(cacheable=false)
    /**
     * @description Method to check if the account is closed for NB
     * BS-1663
     * @author Soumyakant Pandya
     * @param  accountId : Id of the account to check if its k_Account_Closed_NB if Yes or No.
     */
    public static Boolean checkAccountClosedForNB(Id accountId) {
        List<Account> accountList = [SELECT ID, k_Account_Closed_NB__c FROM Account WHERE Id = :accountId LIMIT 1];
        if (accountList.isEmpty() == false && accountList[0].k_Account_Closed_NB__c == '1') {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @description This Reusable method is used to create commerce logs, send emails to IT team and construct B2B_SchneiderCalloutResponseWrapper according to provided schneiderCalloutRe
     * BS-1034
     * @author Chirag L
     * @param  subject  :  subject that needs to be set in the email
     * @param  body     :  body that needs to be sent in the email
     */
    public static B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper performSchneiderCalloutProcessing(
        B2B_VisionSensationUtility.B2B_SchneiderCalloutResponseWrapper schneiderCalloutResponseWrapper,
        String recordId
    ) {
        if (schneiderCalloutResponseWrapper != null && String.isNotBlank(recordId)) {
            List<B2B_Lens_Configurator__c> lensConfiguratorList = [
                SELECT Id, B2B_Account__c, B2B_Account__r.k_ARIS_Account_ID__c, B2B_Account__r.k_Account_No__c, B2B_ARIS_Account_Id__c
                FROM B2B_Lens_Configurator__c
                WHERE Id = :recordId
            ];
            B2B_VisionSensationUtility.B2B_SchneiderResponse schneiderResponse = new B2B_VisionSensationUtility.B2B_SchneiderResponse();

            //BS-1248 - Start
            if (schneiderCalloutResponseWrapper.statusCode != null && schneiderCalloutResponseWrapper.statusCode == 200) {
                //BS-1034
                schneiderResponse = schneiderCalloutResponseWrapper.schneiderSuccessResponseWrapper;
                schneiderResponse.statusCode = schneiderCalloutResponseWrapper.statusCode != null ? schneiderCalloutResponseWrapper.statusCode : 0;

                //BS-1914 - Updated the condition and added preCalcGuid check - Start
                if (
                    schneiderResponse != null &&
                    schneiderResponse.success != null &&
                    schneiderResponse.silhData != null &&
                    String.isNotBlank(schneiderResponse.silhData.preCalcGuid) &&
                    (Boolean.valueOf(schneiderResponse.success)) == true
                ) {
                    return schneiderCalloutResponseWrapper;
                } else {
                    //BS-1034 Start
                    if (
                        schneiderResponse.silhData != null &&
                        String.isNotBlank(schneiderResponse.errorCode) &&
                        String.isNotBlank(schneiderResponse.silhData.behav) &&
                        schneiderResponse.silhData.behav.equalsIgnoreCase(System.Label.B2B_SCHNEIDER_CALLOUT_BEHAVE_CODES.split(',')[0])
                    ) {
                        B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_RESPONSE_MESSAGE_HEADING + schneiderResponse.statusCode,
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_REQUEST_HEADING +
                            JSON.serializePretty(schneiderCalloutResponseWrapper.schneiderRequestWrapper) +
                            '\n' +
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_RESPONSE_HEADING +
                            JSON.serializePretty(schneiderResponse) +
                            '\n' +
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_LENS_CONFIGURATOR_ID_HEADING +
                            recordId +
                            '\n' +
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_ARIS_ACCOUNT_ID_HEADING +
                            (lensConfiguratorList.isEmpty() == false &&
                                lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c != null
                                ? lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c
                                : null),
                            B2B_Constants.SCHNEIDER_CALLOUT_PROCESS,
                            B2B_Constants.ERROR_TYPE_LOGGING,
                            lensConfiguratorList.isEmpty() == false &&
                                lensConfiguratorList[0].B2B_Account__c != null
                                ? String.valueOf(lensConfiguratorList[0].B2B_Account__c)
                                : null
                        );
                        insert commerceLog;
                        sendSchneiderCalloutEmails(
                            (new List<String>{ System.Label.B2B_CALLOUT_EMAIL_ADDRESSES.split(',')[0] }),
                            (System.Label.B2B_CALLOUT_RESPONSE_EMAIL_SUBJECT_LABELS.split(',')[0] +
                            String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_Account_No__c) +
                            '/' +
                            String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c)),
                            (B2B_Constants.EMAIL_BODY_HEAD_FOR_SCHNEIDER_CALLOUT_CALCULATION_ERROR + JSON.serializePretty(schneiderResponse))
                        );
                        return schneiderCalloutResponseWrapper;
                        //BS-1248 Start
                    } else if (
                        schneiderResponse.msg != null &&
                        schneiderResponse.msg.equalsIgnoreCase(System.Label.B2B_CALLOUT_RESPONSE_EMAIL_SUBJECT_LABELS.split(',')[4])
                    ) {
                        B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_DUE_TO_SERVER_ERROR_RESPONSE_MESSAGE_HEADING + schneiderResponse.statusCode,
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_REQUEST_HEADING +
                            JSON.serializePretty(schneiderCalloutResponseWrapper.schneiderRequestWrapper) +
                            '\n' +
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_RESPONSE_HEADING +
                            JSON.serializePretty(schneiderResponse) +
                            '\n' +
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_LENS_CONFIGURATOR_ID_HEADING +
                            recordId +
                            '\n' +
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_ARIS_ACCOUNT_ID_HEADING +
                            (lensConfiguratorList.isEmpty() == false &&
                                lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c != null
                                ? lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c
                                : null),
                            B2B_Constants.SCHNEIDER_CALLOUT_PROCESS,
                            B2B_Constants.ERROR_TYPE_LOGGING,
                            lensConfiguratorList.isEmpty() == false &&
                                lensConfiguratorList[0].B2B_Account__c != null
                                ? String.valueOf(lensConfiguratorList[0].B2B_Account__c)
                                : null
                        );
                        insert commerceLog;
                        sendSchneiderCalloutEmails(
                            (new List<String>{ System.Label.B2B_CALLOUT_EMAIL_ADDRESSES.split(',')[0] }),
                            (System.Label.B2B_CALLOUT_RESPONSE_EMAIL_SUBJECT_LABELS.split(',')[5] +
                            String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_Account_No__c) +
                            '/' +
                            String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c)),
                            (B2B_Constants.EMAIL_BODY_HEAD_FOR_SCHNEIDER_CALLOUT_CALCULATION_ERROR + JSON.serializePretty(schneiderResponse))
                        );
                        return schneiderCalloutResponseWrapper;
                        //BS-1248 End
                        //BS-1914
                    } else if (
                        schneiderResponse != null &&
                        schneiderResponse.success != null &&
                        schneiderResponse.silhData != null &&
                        (Boolean.valueOf(schneiderResponse.success)) == true &&
                        String.isBlank(schneiderResponse.silhData.preCalcGuid)
                    ) {
                        //BS-1914 - Updated the condition and added preCalcGuid blank check
                        // If the success is true and PreCalcGuid is absent then creating a commerce log and sending mail
                        B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_RESPONSE_MESSAGE_HEADING + schneiderResponse.statusCode,
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_REQUEST_HEADING +
                            JSON.serializePretty(schneiderCalloutResponseWrapper.schneiderRequestWrapper) +
                            '\n' +
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_RESPONSE_HEADING +
                            JSON.serializePretty(schneiderResponse) +
                            '\n' +
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_LENS_CONFIGURATOR_ID_HEADING +
                            recordId +
                            '\n' +
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_ARIS_ACCOUNT_ID_HEADING +
                            (lensConfiguratorList.isEmpty() == false &&
                                lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c != null
                                ? lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c
                                : null),
                            B2B_Constants.SCHNEIDER_CALLOUT_PROCESS,
                            B2B_Constants.ERROR_TYPE_LOGGING,
                            lensConfiguratorList.isEmpty() == false &&
                                lensConfiguratorList[0].B2B_Account__c != null
                                ? String.valueOf(lensConfiguratorList[0].B2B_Account__c)
                                : null
                        );
                        insert commerceLog;
                        sendSchneiderCalloutEmails(
                            (new List<String>{ System.Label.B2B_CALLOUT_EMAIL_ADDRESSES.split(',')[0] }),
                            (System.Label.B2B_CALLOUT_RESPONSE_EMAIL_SUBJECT_LABELS.split(',')[0] +
                            String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_Account_No__c) +
                            '/' +
                            String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c)),
                            (B2B_Constants.EMAIL_BODY_HEAD_FOR_SCHNEIDER_CALLOUT_CALCULATION_ERROR + JSON.serializePretty(schneiderResponse))
                        );
                        return schneiderCalloutResponseWrapper;
                        //BS-1914 - End
                    } else {
                        // Creating Log for the scenario of any unknown error during schneider callout
                        B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_RESPONSE_MESSAGE_HEADING + schneiderResponse.statusCode,
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_REQUEST_HEADING +
                            JSON.serializePretty(schneiderCalloutResponseWrapper.schneiderRequestWrapper) +
                            '\n' +
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_RESPONSE_HEADING +
                            JSON.serializePretty(schneiderResponse) +
                            '\n' +
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_LENS_CONFIGURATOR_ID_HEADING +
                            recordId +
                            '\n' +
                            B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_ARIS_ACCOUNT_ID_HEADING +
                            (lensConfiguratorList.isEmpty() == false &&
                                lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c != null
                                ? lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c
                                : null),
                            B2B_Constants.SCHNEIDER_CALLOUT_PROCESS,
                            B2B_Constants.ERROR_TYPE_LOGGING,
                            lensConfiguratorList.isEmpty() == false &&
                                lensConfiguratorList[0].B2B_Account__c != null
                                ? String.valueOf(lensConfiguratorList[0].B2B_Account__c)
                                : null
                        );
                        insert commerceLog;
                        sendSchneiderCalloutEmails(
                            (new List<String>{ System.Label.B2B_CALLOUT_EMAIL_ADDRESSES.split(',')[0] }),
                            (System.Label.B2B_CALLOUT_RESPONSE_EMAIL_SUBJECT_LABELS.split(',')[5] +
                            String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_Account_No__c) +
                            '/' +
                            String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c)),
                            (B2B_Constants.EMAIL_BODY_HEAD_FOR_SCHNEIDER_CALLOUT_CALCULATION_ERROR + JSON.serializePretty(schneiderResponse))
                        );
                        return null;
                    }
                    //BS-1034 End
                }
                //BS-1248 Start
            } else if (schneiderCalloutResponseWrapper.statusCode != null && schneiderCalloutResponseWrapper.statusCode == 404) {
                B2B_VisionSensationUtility.B2B_SchneiderErrorResponseWrapper errorResponse = new B2B_VisionSensationUtility.B2B_SchneiderErrorResponseWrapper();
                errorResponse = schneiderCalloutResponseWrapper.schneiderErrorResponseWrapper;

                B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                    B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_DUE_TO_OMA_DATA_RESPONSE_MESSAGE_HEADING + schneiderCalloutResponseWrapper.statusCode,
                    B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_REQUEST_HEADING +
                    JSON.serializePretty(schneiderCalloutResponseWrapper.schneiderRequestWrapper) +
                    '\n' +
                    B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_RESPONSE_HEADING +
                    JSON.serializePretty(errorResponse) +
                    '\n' +
                    B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_LENS_CONFIGURATOR_ID_HEADING +
                    recordId +
                    '\n' +
                    B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_ARIS_ACCOUNT_ID_HEADING +
                    (lensConfiguratorList.isEmpty() == false &&
                        lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c != null
                        ? lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c
                        : null),
                    B2B_Constants.SCHNEIDER_CALLOUT_PROCESS,
                    B2B_Constants.ERROR_TYPE_LOGGING,
                    lensConfiguratorList.isEmpty() == false &&
                        lensConfiguratorList[0].B2B_Account__c != null
                        ? String.valueOf(lensConfiguratorList[0].B2B_Account__c)
                        : null
                );
                insert commerceLog;
                String omaShapeKeyValue = String.isNotBlank(schneiderCalloutResponseWrapper.schneiderRequestWrapper.omaShapeKey)
                    ? schneiderCalloutResponseWrapper.schneiderRequestWrapper.omaShapeKey
                    : System.Label.B2B_CALLOUT_RESPONSE_EMAIL_SUBJECT_LABELS.split(',')[3];
                sendSchneiderCalloutEmails(
                    (new List<String>{ System.Label.B2B_CALLOUT_EMAIL_ADDRESSES.split(',')[0] }),
                    (System.Label.B2B_CALLOUT_RESPONSE_EMAIL_SUBJECT_LABELS.split(',')[2] +
                    String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_Account_No__c) +
                    '/' +
                    String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c)),
                    (B2B_Constants.EMAIL_BODY_HEAD_FOR_SCHNEIDER_CALLOUT_CALCULATION_ERROR +
                    JSON.serializePretty(errorResponse) +
                    '\n' +
                    'OMAShapeKey : ' +
                    omaShapeKeyValue)
                );
                return schneiderCalloutResponseWrapper;
                /* Start : BS-1706 */
            } else if (schneiderCalloutResponseWrapper.statusCode != null && schneiderCalloutResponseWrapper.statusCode >= 500) {
                /* End : BS-1706 */
                B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                    B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_DUE_TO_SERVER_ERROR_RESPONSE_MESSAGE_HEADING + schneiderCalloutResponseWrapper.statusCode,
                    B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_REQUEST_HEADING +
                    JSON.serializePretty(schneiderCalloutResponseWrapper.schneiderRequestWrapper) +
                    '\n' +
                    B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_RESPONSE_HEADING +
                    JSON.serializePretty(schneiderCalloutResponseWrapper.schneiderServerErrorResponseWrapper) +
                    '\n' +
                    B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_LENS_CONFIGURATOR_ID_HEADING +
                    recordId +
                    '\n' +
                    B2B_Constants.SCHNEIDER_CALLOUT_FAILURE_ARIS_ACCOUNT_ID_HEADING +
                    (lensConfiguratorList.isEmpty() == false &&
                        lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c != null
                        ? lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c
                        : null),
                    B2B_Constants.SCHNEIDER_CALLOUT_PROCESS,
                    B2B_Constants.ERROR_TYPE_LOGGING,
                    lensConfiguratorList.isEmpty() == false &&
                        lensConfiguratorList[0].B2B_Account__c != null
                        ? String.valueOf(lensConfiguratorList[0].B2B_Account__c)
                        : null
                );
                insert commerceLog;
                sendSchneiderCalloutEmails(
                    (new List<String>{ System.Label.B2B_CALLOUT_EMAIL_ADDRESSES.split(',')[0] }),
                    (System.Label.B2B_CALLOUT_RESPONSE_EMAIL_SUBJECT_LABELS.split(',')[1] +
                    String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_Account_No__c) +
                    '/' +
                    String.valueOf(lensConfiguratorList[0].B2B_Account__r.k_ARIS_Account_ID__c)),
                    (B2B_Constants.EMAIL_BODY_HEAD_FOR_SCHNEIDER_CALLOUT_CALCULATION_ERROR +
                    JSON.serializePretty(schneiderCalloutResponseWrapper.schneiderServerErrorResponseWrapper))
                );
                return schneiderCalloutResponseWrapper;
            } else {
                return null;
            }
            //BS-1248 - End
        } else {
            return null;
        }
    }

    /**
     * BS-1278
     * @author : Soumyakant Pandya
     * @param : currentLoggedInUser : Id of the current logged in User from the Partner Portal
     * @return : B2B_FooterContentWrapper object containing footer details to displayed on SH/EE footer UI on Partner Portal.
     */
    @AuraEnabled(cacheable=false)
    public static B2B_FooterContentWrapper getCountrySpecificDetails(Id currentLoggedInUserId) {
        //Fetch the user's current language and the Store Country of the Account to which its is associated.
        List<User> loggedInUserList = [
            SELECT Id, LanguageLocaleKey, Contact.Account.Store_Country__c, Contact.Account.Brand__c
            FROM User
            WHERE Id = :currentLoggedInUserId
            LIMIT 1
        ];
        //Fetch the country specific footer records for the user in the language spefified.
        B2B_FooterContentWrapper footerWrapperObj = new B2B_FooterContentWrapper();
        for (
            B2B_Country_Specific_Preference_Setting__c countrySpecificSettingObj : new B2B_FetchDataInSystemContext()
                .fetchCountrySpecificPreferenceSettingRecords(
                    loggedInUserList[0].LanguageLocaleKey,
                    loggedInUserList[0].Contact.Account.Store_Country__c,
                    loggedInUserList[0].Contact.Account.Brand__c
                )
        ) {
            footerWrapperObj.companyName = countrySpecificSettingObj.B2B_Company_Name__c;
            footerWrapperObj.companyOpening = countrySpecificSettingObj.B2B_Company_Opening__c;
            footerWrapperObj.telephoneNumber = countrySpecificSettingObj.B2B_Customer_Service_Telephone_Number__c;
            footerWrapperObj.termsAndCondition = countrySpecificSettingObj.B2B_Terms_And_Conditions__c;
        }
        return footerWrapperObj;
    }

    @AuraEnabled(cacheable=false)
    /**
     * @description Method to check if the account is closed for SH
     * BS-1714
     * @author Soumyakant Pandya
     * @param  accountId : Id of the account to check if its k_Account_Closed_SH__c if Yes or No.
     */
    public static Boolean checkAccountClosedForSH(Id accountId) {
        List<Account> accountList = [SELECT ID, k_Account_Closed_SH__c, k_Account_Status_Silhouette__c FROM Account WHERE Id = :accountId LIMIT 1];
        if (accountList.isEmpty() == false && accountList[0].k_Account_Closed_SH__c == '1' && accountList[0].k_Account_Status_Silhouette__c == '1') {
            return true;
        } else {
            return false;
        }
    }

    @AuraEnabled(cacheable=false)
    /**
     * @description Method to check if the account is closed for EE
     * BS-1714
     * @author Soumyakant Pandya
     * @param  accountId : Id of the account to check if its k_Account_Closed_EE__c if Yes or No.
     */
    public static Boolean checkAccountClosedForEE(Id accountId) {
        List<Account> accountList = [SELECT ID, k_Account_Closed_EE__c, Acct_Stat_EE__c FROM Account WHERE Id = :accountId LIMIT 1];
        if (accountList.isEmpty() == false && accountList[0].k_Account_Closed_EE__c == '1' && accountList[0].Acct_Stat_EE__c == '1') {
            return true;
        } else {
            return false;
        }
    }

    @AuraEnabled(cacheable=false)
    /**
     * @description Method to check if the B2B_Hide_Account_Closure_Popup__c is true or false
     * BS-1953
     * @author Vishalsingh Gaur
     * @param  accountId : Id of the account.
     */
    public static My_B2B_Shop_Preference__c checkHideAccountClosurePopup(Id accountId) {
        List<My_B2B_Shop_Preference__c> shopPreferenceList = new B2B_FetchDataInSystemContext().shopPreference(accountId);
        return shopPreferenceList.isEmpty() == false ? shopPreferenceList[0] : null;
    }

    /**
     * @description Update the B2B_Hide_Account_Closure_Popup__c field  My_B2B_Shop_Preference__c  Record
     * @author Vishalsingh Gaur
     * BS-1953
     * @param  accountId
     */
    @AuraEnabled(cacheable=false)
    public static void updateMyB2BShopPreference(String accountId) {
        List<My_B2B_Shop_Preference__c> myB2BShopPreferenceList = new B2B_FetchDataInSystemContext().shopPreference(accountId);
        if (myB2BShopPreferenceList.isEmpty() == false) {
            myB2BShopPreferenceList[0].B2B_Hide_Account_Closure_Popup__c = true;
        }
        try {
            new B2B_FetchDataInSystemContext().updateMyB2BShopPreferenceList(myB2BShopPreferenceList);
        } catch (Exception exceptionInstance) {
            B2B_LogUtils.createPersistLogAsync(
                'Exception occured while updating the boolean on My_B2B_Shop_Preference__c :' + exceptionInstance.getMessage(),
                B2B_LogUtils.LOG_COMMERCE_SETUP,
                B2B_LogUtils.LOG_TYPE_ERROR,
                'B2B_Utils',
                null
            );
        }
    }

    /**
     * @description : This method is used to handle the execute triggered by LWC, it invokes the SetUserPasswordQueueable method for the provided userId and Password
     * BS-1849
     * @author Sachin Vispute
     * @param  userId       : Id of the user for which the Password needs to be set
     * @param  newPassword  : Password value that needs to be Set
     * @return jobId        : Id of Asyncronous Apex Jobs that obtained after invoking a SetUserPasswordQueueable method
     */
    @AuraEnabled(cacheable=false)
    public static Id setPassword(String userId, String newPassword) {
        if (String.isNotBlank(userId) && String.isNotBlank(newPassword)) {
            try {
                Id jobId = System.enqueueJob(new B2B_SetUserPasswordQueueable(userId, newPassword));
                return jobId;
            } catch (Exception exceptionInstance) {
                B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                    'Set Password Process Failed',
                    exceptionInstance.getMessage(),
                    'Set Password',
                    'Error',
                    userId
                );
                insert commerceLog;
                throw new AuraHandledException(exceptionInstance.getMessage() + ' Please check the commerce log');
            }
        } else {
            return null;
        }
    }

    /**
     * @description : This method is used to fetch the Asynchronous Apex Job record for the provided Apex Job Id
     * BS-1849
     * @author Sachin Vispute
     * @param  jobId        : Id of Asyncronous Apex Jobs that obtained as input after invoking a SetUserPasswordQueueable method
     * @param  userId       : Id of the user for which the Password needs to be set
     * @return apexJobList  : Collection of Asyncronous Apex Job Records fetched from database
     */
    @AuraEnabled
    public static List<AsyncApexJob> getProcessStatus(String jobId, String userId) {
        List<AsyncApexJob> apexJobList = new List<AsyncApexJob>();
        try {
            if (String.isNotBlank(jobId)) {
                apexJobList = [SELECT Status, ExtendedStatus FROM AsyncApexJob WHERE Id = :jobId];
            }
            return apexJobList.isEmpty() == false ? apexJobList : null;
        } catch (Exception exceptionInstance) {
            B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                'Set Password Process Failed While fetching the Processing Status',
                exceptionInstance.getMessage(),
                'Set Password',
                'Error',
                userId
            );
            insert commerceLog;
            throw new AuraHandledException(exceptionInstance.getMessage() + ' Please check the commerce log');
        }
    }

    /**
     * @description : This method is used to fetch the User records associated with the provided AccountId
     * BS-1849
     * @author Sachin Vispute
     * @param  accountId    : Id of the Account for which the User needs to be fetched
     * @return userList     : Collection of User record fetched from database
     */
    @AuraEnabled(cacheable=false)
    public static List<User> fetchUserAssociatedWithAccount(String accountId) {
        B2B_FetchDataInSystemContext b2bController = new B2B_FetchDataInSystemContext();
        List<User> userList = new List<User>();
        if (String.isNotBlank(accountId)) {
            userList = b2bController.fetchAssociatedUser(accountId);
            return userList.isEmpty() == false ? userList : null;
        } else {
            return null;
        }
    }

    @TestVisible
    private without sharing class B2B_FetchDataInSystemContext {
        /**
         * @description Method to fetch Or wide email address
         * @author Soumyakant Pandya
         * @param  isSilhouetteSite : Store for which address needs to fetched
         */
        @TestVisible
        private List<OrgWideEmailAddress> fetchOrgWideEmailAddress(Boolean isSilhouetteSite) {
            List<OrgWideEmailAddress> orgWideEmailAddressList = new List<OrgWideEmailAddress>();
            if (isSilhouetteSite == true) {
                orgWideEmailAddressList = [SELECT Id, Address FROM OrgWideEmailAddress WHERE Address = 'noreply@silhouette-international.com' LIMIT 1];
            } else if (isSilhouetteSite == false) {
                orgWideEmailAddressList = [SELECT Id, Address FROM OrgWideEmailAddress WHERE Address = 'noreply@neubau-eyewear.com' LIMIT 1];
            }
            return orgWideEmailAddressList;
        }

        /**
         * @description : This method is used to fetch the User records associated with the provided AccountId
         * BS-1849
         * @author Sachin Vispute
         * @param  accountId    : Id of the Account for which the User needs to be fetched
         * @return userList     : Collection of User record fetched from database
         */
        @TestVisible
        private List<User> fetchAssociatedUser(Id accountId) {
            if (accountId != null) {
                List<User> userList = new List<User>();
                userList = [SELECT Id, Email, ContactId, accountId FROM User WHERE accountId = :accountId LIMIT 1];
                return userList;
            } else {
                return null;
            }
        }

        @TestVisible
        /**
         * @description reusable method to send an email based on Email Template
         * Position updated as part of BS-1057 to send email in system mode.
         * @author Vishalsingh Gaur
         * @param  template           email template used by the email
         * @param email               email address to send the email
         */
        private void sendEmail(EmailTemplate template, String email, Id recordId, Boolean isSilhouetteLogin) {
            Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
            //BS-1370 Send email from respective store email address
            List<OrgWideEmailAddress> orgWideEmailAddressList = new B2B_FetchDataInSystemContext().fetchOrgWideEmailAddress(isSilhouetteLogin);
            if (orgWideEmailAddressList.isEmpty() == false) {
                message.setOrgWideEmailAddressId(orgWideEmailAddressList[0].Id);
            }

            message.toAddresses = new List<String>{ email };
            message.setTargetObjectId(recordId);
            message.setTreatTargetObjectAsRecipient(false); //BS-1370 It will stop to send email from target object record (user/contact/lead) email
            message.setReplyTo(System.Label.B2B_NO_REPLY_EMAIL);
            message.setTemplateID(template.Id);
            message.setSaveAsActivity(false);
            Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage>{ message };
            Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
            if (!results[0].success) {
                B2B_LogUtils.createPersistLogAsync(results[0].errors[0].message, 'B2B_Registration', B2B_LogUtils.LOG_TYPE_ERROR, 'none', 'none');
                throw new AuraHandledException(System.Label.B2B_LOGIN_Generic_Error);
            }
        }

        @TestVisible
        /**
         * BS-1278
         * @description Method to fetch country specific footer content from B2B_Country_Specific_Preference_Setting__c records.
         * @author : Soumyakant Pandya
         * @param  Id : Id of current logged in user
         * @return List<B2B_Country_Specific_Preference_Setting__c> : List having record of the content that needs to be shown on the footer.
         */
        private List<B2B_Country_Specific_Preference_Setting__c> fetchCountrySpecificPreferenceSettingRecords(
            String userLocaleKey,
            String country,
            String brand
        ) {
            String brandType = '%' + brand + '%';
            List<B2B_Country_Specific_Preference_Setting__c> countrySpecificPreferenceSettingObjList = [
                SELECT
                    Id,
                    B2B_Company_Name__c,
                    B2B_Company_Opening__c,
                    B2B_Customer_Service_Telephone_Number__c,
                    B2B_Terms_And_Conditions__c,
                    B2B_Language__c,
                    B2B_Type__c
                FROM B2B_Country_Specific_Preference_Setting__c
                WHERE
                    B2B_Type__c = :B2B_Constants.FOOTER_PICKLIST
                    AND B2B_Language__c = :userLocaleKey
                    AND B2B_Country__c = :country
                    AND B2B_Account_Brand__c LIKE :brandType
                LIMIT 1
            ];
            return countrySpecificPreferenceSettingObjList;
        }

        @TestVisible
        /**
         * @description Method to check if the B2B_Hide_Account_Closure_Popup__c is true or false
         * BS-1953
         * @author Vishalsingh Gaur
         * @param  accountId : Id of the account.
         */
        private List<My_B2B_Shop_Preference__c> shopPreference(Id accountId) {
            List<My_B2B_Shop_Preference__c> shopPreferenceList = [
                SELECT Id, B2B_Hide_Account_Closure_Popup__c
                FROM My_B2B_Shop_Preference__c
                WHERE B2B_Account__c = :accountId
            ];
            return shopPreferenceList;
        }

        /**
         * @description update My_B2B_Shop_Preference__c
         * @param List<My_B2B_Shop_Preference__c> List containing preference of the Account
         * Added as part of BS-1953
         */
        @TestVisible
        private void updateMyB2BShopPreferenceList(List<My_B2B_Shop_Preference__c> myB2BShopPreferenceList) {
            update myB2BShopPreferenceList;
        }
    }

    /**
     * BS-1278
     * @description This wrapper holds all the information of the footer tha needs to be showen on the UI.
     * 1. companyName : The name of subsidary o be shown on the footer based on the country.
     * 2. companyOpening : Country Specific Timings of openings.
     * 3. termsAndCondition : Link for Terms and Conditions to be shown on footer and at checkout.
     * 4. telephoneNumber : The Country Specific Telephone number that needs to be displayed on the footer.
     */
    public class B2B_FooterContentWrapper {
        @AuraEnabled
        public String companyName;

        @AuraEnabled
        public String companyOpening;

        @AuraEnabled
        public String termsAndCondition;

        @AuraEnabled
        public String telephoneNumber;
    }

    public class B2B_Exception extends Exception {
    }
}
