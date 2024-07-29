/**
 * @author Vishalsingh Gaur
 * @email vishalsingh.gaur@theblueflamelabs.com
 * @created date 10-10-2022
 * @desc This class will get invoked from contact customer support page from community site by clicking send button
 *  and perfom the operation as per the inputs provided by the user in the form.
 */
public without sharing class B2B_ContactCustomerSupportController {
    /*
     * this method will check if the request is from existing Account or from new Customer
     */
    private static Boolean isLogInPage = true;
    @AuraEnabled
    public static string handleContactCustomerSupportFlow(
        Map<String, Object> customerInputMap,
        Boolean isLoginPage,
        String currentLoggedInUserId,
        String langauge,
        Boolean isSilhouetteLogin,
        String uploadedFileContent, // BS-836
        String fileName // BS-836
    ) {
        B2B_ContactCustomerSupportController.isLogInPage = isLoginPage;
        List<Account> accountList;
        List<User> userList;
        String message = '';
        if (!customerInputMap.isEmpty() && isLoginPage && customerInputMap.get('accountNumber') != null) {
            accountList = [
                SELECT
                    Name,
                    k_Sales_Rep_EvilEye__c,
                    NB_Account_executive__c,
                    k_Sales_Rep_Silhouette__c,
                    B2B_SH_EE_Customer_Service_Agent__c,
                    B2B_NB_Customer_Service_Agent__c,
                    B2B_SVS_Customer_Service_Agent__c //BS-2055
                FROM Account
                WHERE k_Account_No__c = :String.valueOf(customerInputMap.get('accountNumber'))
            ];
            if (!accountList.isEmpty()) {
                message = handleCustomerSupportforExistingUser(customerInputMap, accountList[0], uploadedFileContent, fileName, isSilhouetteLogin);
            } else {
                message = System.Label.B2B_Account_Number_Invalid_Error;
            }
        } else if (!customerInputMap.isEmpty() && isLoginPage) {
            message = handleCustomerSupportforNewUser(customerInputMap, uploadedFileContent, fileName, isSilhouetteLogin);
        } else if (!customerInputMap.isEmpty() && !isLoginPage && currentLoggedInUserId != '') {
            userList = new List<User>(
                [
                    SELECT
                        Contact.AccountId,
                        Contact.Account.Name,
                        Contact.Account.k_Sales_Rep_EvilEye__c,
                        Contact.Account.NB_Account_executive__c,
                        Contact.Account.k_Sales_Rep_Silhouette__c,
                        Contact.Account.B2B_SH_EE_Customer_Service_Agent__c,
                        Contact.Account.B2B_NB_Customer_Service_Agent__c,
                        Contact.Account.k_Email__c,
                        Contact.Account.B2B_SVS_Customer_Service_Agent__c //BS-2055
                    FROM User
                    WHERE Id = :currentLoggedInUserId AND ContactId != NULL
                    LIMIT 1
                ]
            );
            if (!userList.isEmpty()) {
                Account accountRecord = userList[0].Contact.Account;
                message = handleCustomerSupportforExistingUser(customerInputMap, accountRecord, uploadedFileContent, fileName, isSilhouetteLogin);
            }
        } else if (customerInputMap.isEmpty()) {
            message = System.Label.B2B_Something_Went_Wrong;
        }
        if (message == Bfl_Constant.SUCCESS) {
            if (isLoginPage) {
                B2B_Utils.sendEmailToUser(langauge, isSilhouetteLogin, String.valueOf(customerInputMap.get('accountEmail')), false);
            } else if (
                !isLoginPage &&
                customerInputMap.get(B2B_Constants.CONTACT_EMAIL) != null &&
                String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_EMAIL)).length() > 0 &&
                (String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_EMAIL)) != userList[0].Contact.Account.k_Email__c)
            ) {
                B2B_Utils.sendEmailToUser(langauge, isSilhouetteLogin, String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_EMAIL)), false);
                B2B_Utils.sendEmailToUser(langauge, isSilhouetteLogin, userList[0].Contact.Account.k_Email__c, false);
            } else if (!isLoginPage) {
                B2B_Utils.sendEmailToUser(langauge, isSilhouetteLogin, userList[0].Contact.Account.k_Email__c, false);
            }
        }

        return message;
    }

    /*
     * This method will create a task and assigned to AE if the AE is present for the selected brand and the request
     * is for sales visit.
     */
    public static String handleCustomerSupportforExistingUser(
        Map<String, Object> customerInputMap,
        Account accountRecord,
        String uploadedFileContent,
        String fileName,
        Boolean isSilhouetteLogin
    ) {
        List<User> userList = new List<User>();
        if (isLogInPage) {
            userList = [
                SELECT Id, Contact.Name, ContactId
                FROM User
                WHERE
                    IsPortalEnabled = TRUE
                    AND AccountId = :accountRecord.Id
                    AND Contact.Name LIKE :String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_NAME))
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];
        } else if (!isLogInPage) {
            userList = [
                SELECT Id, Contact.Name, ContactId
                FROM User
                WHERE IsPortalEnabled = TRUE AND AccountId = :accountRecord.Id
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];
        }
        Boolean isAePresent = false;
        Id accountExecutiveId;
        String message = '';
        try {
            if (
                String.valueOf(customerInputMap.get(B2B_Constants.ACCOUNT_BRAND)) == Bfl_Constant.SH_BRAND_FULL &&
                accountRecord.k_Sales_Rep_Silhouette__c != null
            ) {
                isAePresent = true;
                accountExecutiveId = accountRecord.k_Sales_Rep_Silhouette__c;
            } else if (
                String.valueOf(customerInputMap.get(B2B_Constants.ACCOUNT_BRAND)) == Bfl_Constant.EE_BRAND_FULL &&
                accountRecord.k_Sales_Rep_EvilEye__c != null
            ) {
                isAePresent = true;
                accountExecutiveId = accountRecord.k_Sales_Rep_EvilEye__c;
            } else if (
                String.valueOf(customerInputMap.get(B2B_Constants.ACCOUNT_BRAND)) == Bfl_Constant.NB_BRAND_FULL &&
                accountRecord.B2B_NB_Customer_Service_Agent__c != null
            ) {
                isAePresent = true;
                accountExecutiveId = accountRecord.B2B_NB_Customer_Service_Agent__c;
            } else if (
                String.isNotBlank(String.valueOf(customerInputMap.get(B2B_Constants.ACCOUNT_BRAND))) &&
                (String.valueOf(customerInputMap.get(B2B_Constants.ACCOUNT_BRAND))).equals(System.Label.B2B_SVS_BRAND_LABEL)
            ) {
                isAePresent = true;
                accountExecutiveId = accountRecord.B2B_SVS_Customer_Service_Agent__c;
            }
            if (isAePresent && String.valueOf(customerInputMap.get(B2B_Constants.REQUEST)) == 'salesvisit') {
                String commentMessage = System.Label.B2B_Task_Comments_With_Request_Type;
                List<String> commentSectionList = commentMessage.split('\n');
                if (
                    (customerInputMap.get(B2B_Constants.CONTACT_NAME) == null ||
                    String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_NAME)).length() == 0) &&
                    (customerInputMap.get(B2B_Constants.CONTACT_EMAIL) == null ||
                    String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_EMAIL)).length() == 0)
                ) {
                    commentSectionList.remove(1);
                    commentSectionList.remove(1);
                    commentSectionList.remove(1);
                    commentSectionList.remove(1);
                } else if (
                    customerInputMap.get(B2B_Constants.CONTACT_NAME) == null ||
                    String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_NAME)).length() == 0
                ) {
                    commentSectionList.remove(2);
                    commentSectionList.remove(2);
                } else if (
                    customerInputMap.get(B2B_Constants.CONTACT_EMAIL) == null ||
                    String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_EMAIL)).length() == 0
                ) {
                    commentSectionList.remove(3);
                    commentSectionList.remove(3);
                }
                commentMessage = String.join(commentSectionList, '');
                commentMessage = commentMessage.replace(B2B_Constants.REQUEST_TYPE_PLACEHOLDER, String.valueOf(customerInputMap.get(B2B_Constants.REQUEST)));
                if (commentMessage.contains(B2B_Constants.CONTACT_NAME_PLACEHOLDER)) {
                    commentMessage = commentMessage.replace(
                        B2B_Constants.CONTACT_NAME_PLACEHOLDER,
                        String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_NAME))
                    );
                }
                if (commentMessage.contains(B2B_Constants.CONTACT_EMAIL_PLACEHOLDER)) {
                    commentMessage = commentMessage.replace(
                        B2B_Constants.CONTACT_EMAIL_PLACEHOLDER,
                        String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_EMAIL))
                    );
                }
                commentMessage = commentMessage.replace(
                    B2B_Constants.DESCRIPTION_PLACEHOLDER,
                    String.valueOf(customerInputMap.get(B2B_Constants.REQUEST_MESSAGE))
                );
                Task visitTask = new Task(
                    Subject = System.Label.B2B_ProspectB2B_Task_Subject_Other,
                    k_Activity_Brand__c = getBrand(String.valueOf(customerInputMap.get(B2B_Constants.ACCOUNT_BRAND))),
                    Description = commentMessage,
                    Priority = 'High',
                    Status = 'Open',
                    ActivityDate = System.today().addDays(7),
                    OwnerId = accountExecutiveId,
                    WhatId = accountRecord.Id,
                    WhoId = (!userList.isEmpty() && userList[0].ContactId != null) ? userList[0].ContactId : null,
                    /* Start : BS-1645 */
                    BFL_Event_Source__c = B2B_Constants.TASK_B2B_PARTNER_PORTAL,
                    Bfl_Task_Source__c = B2B_Constants.TASK_B2B_PARTNER_PORTAL
                    /* End : BS-1645 */
                );
                insert visitTask;
                // Start: BS-836
                uploadFile(uploadedFileContent, fileName, visitTask, isSilhouetteLogin);
                // End BS-836
                message = Bfl_Constant.SUCCESS;
            } else if (
                isAePresent &&
                isLogInPage &&
                (String.valueOf(customerInputMap.get(B2B_Constants.REQUEST)) == 'callback' ||
                String.valueOf(customerInputMap.get(B2B_Constants.REQUEST)) == 'other')
            ) {
                message = handleNoAEorCallbackOrOtherRequest(customerInputMap, accountRecord, uploadedFileContent, fileName, isSilhouetteLogin);
            } else if (
                isAePresent &&
                !isLogInPage &&
                (String.valueOf(customerInputMap.get(B2B_Constants.REQUEST)) == 'callback' ||
                String.valueOf(customerInputMap.get(B2B_Constants.REQUEST)) == 'other' ||
                String.valueOf(customerInputMap.get(B2B_Constants.REQUEST)) == 'addresschange')
            ) {
                message = handleNoAEorCallbackOrOtherRequest(customerInputMap, accountRecord, uploadedFileContent, fileName, isSilhouetteLogin);
            }
            if (isAePresent == false) {
                message = handleNoAEorCallbackOrOtherRequest(customerInputMap, accountRecord, uploadedFileContent, fileName, isSilhouetteLogin);
            }
        } catch (Exception e) {
            message = System.Label.B2B_Something_Went_Wrong;
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_ContactCustomerSupportController', Label.B2B_LOGIN_Generic_Error);
            throw new AuraHandledException(e.getMessage());
        }
        return message;
    }

    /*
     * This method will create a prospect using the inputs provided by the user and assigned to the user based on Brand.
     */
    public static String handleCustomerSupportforNewUser(
        Map<String, Object> customerInputMap,
        String uploadedFileContent,
        String fileName,
        Boolean isSilhouetteLogin
    ) {
        String message;
        try {
            Id prospectRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName()
                .get(B2B_Constants.PROSPECT_RECORD_TYPE_DEVELOPER_NAME)
                .getRecordTypeId();
            Account newProspectb2b = new Account(
                Name = String.valueOf(customerInputMap.get('accountName')),
                k_Stage__c = 'Prospect_B2B',
                RecordTypeId = prospectRecordTypeId,
                Store_Country__c = String.valueOf(customerInputMap.get('storeCountry')),
                Phone = String.valueOf(customerInputMap.get('phone')),
                k_Email__c = String.valueOf(customerInputMap.get('accountEmail')),
                Brand__c = String.valueOf(customerInputMap.get(B2B_Constants.ACCOUNT_BRAND)),
                Description = String.valueOf(customerInputMap.get(B2B_Constants.REQUEST_MESSAGE))
            );

            insert newProspectb2b;
            message = handleNoAEorCallbackOrOtherRequest(customerInputMap, newProspectb2b, uploadedFileContent, fileName, isSilhouetteLogin);
        } catch (Exception e) {
            message = System.Label.B2B_Something_Went_Wrong;
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_ContactCustomerSupportController', Label.B2B_LOGIN_Generic_Error);
            throw new AuraHandledException(e.getMessage());
        }
        return message;
    }

    /*
     * This method will check If the Customer service Employee is present. If present it will create a task and assign to delegated user.
     */
    public static String handleNoAEorCallbackOrOtherRequest(
        Map<String, Object> customerInputMap,
        Account accountRecord,
        String uploadedFileContent,
        String fileName,
        Boolean isSilhouetteLogin
    ) {
        List<Account> accountList = [
            SELECT Id, B2B_SH_EE_Customer_Service_Agent__c, B2B_NB_Customer_Service_Agent__c, B2B_SVS_Customer_Service_Agent__c
            FROM Account
            WHERE Id = :accountRecord.Id
        ];
        List<User> userList = new List<User>();
        if (isLogInPage) {
            userList = [
                SELECT Id, Contact.Name, ContactId
                FROM User
                WHERE
                    IsPortalEnabled = TRUE
                    AND AccountId = :accountRecord.Id
                    AND Contact.Name LIKE :String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_NAME))
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];
        } else if (!isLogInPage) {
            userList = [
                SELECT Id, Contact.Name, ContactId
                FROM User
                WHERE IsPortalEnabled = TRUE AND AccountId = :accountRecord.Id
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];
        }
        String message = '';
        Boolean isCsePresent = false;
        Id customerServiceEmpId;
        try {
            if (
                accountList[0].B2B_SH_EE_Customer_Service_Agent__c != null &&
                (String.valueOf(customerInputMap.get(B2B_Constants.ACCOUNT_BRAND)) == Bfl_Constant.SH_BRAND_FULL ||
                String.valueOf(customerInputMap.get(B2B_Constants.ACCOUNT_BRAND)) == Bfl_Constant.EE_BRAND_FULL)
            ) {
                isCsePresent = true;
                customerServiceEmpId = accountList[0].B2B_SH_EE_Customer_Service_Agent__c;
            } else if (
                String.valueOf(customerInputMap.get(B2B_Constants.ACCOUNT_BRAND)) == Bfl_Constant.NB_BRAND_FULL &&
                accountList[0].B2B_NB_Customer_Service_Agent__c != null
            ) {
                isCsePresent = true;
                customerServiceEmpId = accountList[0].B2B_NB_Customer_Service_Agent__c;
            } else if (
                String.isNotBlank(String.valueOf(customerInputMap.get(B2B_Constants.ACCOUNT_BRAND))) &&
                (String.valueOf(customerInputMap.get(B2B_Constants.ACCOUNT_BRAND))).equals(System.Label.B2B_SVS_BRAND_LABEL)
            ) {
                isCsePresent = true;
                customerServiceEmpId = accountList[0].B2B_SVS_Customer_Service_Agent__c;
            }
            if (isCsePresent) {
                String commentMessage = System.Label.B2B_Task_Comments_With_Request_Type;
                List<String> commentSectionList = commentMessage.split('\n');
                if (
                    (customerInputMap.get(B2B_Constants.CONTACT_NAME) == null ||
                    String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_NAME)).length() == 0) &&
                    (customerInputMap.get(B2B_Constants.CONTACT_EMAIL) == null ||
                    String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_EMAIL)).length() == 0)
                ) {
                    commentSectionList.remove(1);
                    commentSectionList.remove(1);
                    commentSectionList.remove(1);
                    commentSectionList.remove(1);
                } else if (
                    customerInputMap.get(B2B_Constants.CONTACT_NAME) == null ||
                    String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_NAME)).length() == 0
                ) {
                    commentSectionList.remove(2);
                    commentSectionList.remove(2);
                } else if (
                    customerInputMap.get(B2B_Constants.CONTACT_EMAIL) == null ||
                    String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_EMAIL)).length() == 0
                ) {
                    commentSectionList.remove(3);
                    commentSectionList.remove(3);
                }
                commentMessage = String.join(commentSectionList, '\n');
                commentMessage = commentMessage.replace(B2B_Constants.REQUEST_TYPE_PLACEHOLDER, String.valueOf(customerInputMap.get(B2B_Constants.REQUEST)));
                if (commentMessage.contains(B2B_Constants.CONTACT_NAME_PLACEHOLDER)) {
                    commentMessage = commentMessage.replace(
                        B2B_Constants.CONTACT_NAME_PLACEHOLDER,
                        String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_NAME))
                    );
                }
                if (commentMessage.contains(B2B_Constants.CONTACT_EMAIL_PLACEHOLDER)) {
                    commentMessage = commentMessage.replace(
                        B2B_Constants.CONTACT_EMAIL_PLACEHOLDER,
                        String.valueOf(customerInputMap.get(B2B_Constants.CONTACT_EMAIL))
                    );
                }
                commentMessage = commentMessage.replace(
                    B2B_Constants.DESCRIPTION_PLACEHOLDER,
                    String.valueOf(customerInputMap.get(B2B_Constants.REQUEST_MESSAGE))
                );
                Task taskObj = new Task(
                    Subject = System.Label.B2B_ProspectB2B_Task_Subject_Other,
                    k_Activity_Brand__c = getBrand(String.valueOf(customerInputMap.get(B2B_Constants.ACCOUNT_BRAND))),
                    Description = commentMessage,
                    Priority = 'High',
                    Status = 'Open',
                    ActivityDate = System.today().addDays(7),
                    OwnerId = customerServiceEmpId,
                    WhatId = accountRecord.Id,
                    WhoId = (!userList.isEmpty() && userList[0].ContactId != null) ? userList[0].ContactId : null,
                    /* Start : BS-1645 */
                    BFL_Event_Source__c = B2B_Constants.TASK_B2B_PARTNER_PORTAL,
                    Bfl_Task_Source__c = B2B_Constants.TASK_B2B_PARTNER_PORTAL
                    /* End : BS-1645 */
                );
                insert taskObj;
                // Start: BS-836
                uploadFile(uploadedFileContent, fileName, taskObj, isSilhouetteLogin);
                // End: BS-836
                message = Bfl_Constant.SUCCESS;
            } else {
                message = System.Label.B2B_Something_Went_Wrong;
            }
        } catch (Exception e) {
            message = System.Label.B2B_Something_Went_Wrong;
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_ContactCustomerSupportController', Label.B2B_LOGIN_Generic_Error);
            throw new AuraHandledException(e.getMessage());
        }
        return message;
    }

    /*
     * this method will return short form of a brand from Full Brand Value.
     */
    public static String getBrand(String brandValue) {
        String brand = '';
        if (brandValue == Bfl_Constant.SH_BRAND_FULL) {
            brand = Bfl_Constant.SH_BRAND_SHORT;
        } else if (brandValue == Bfl_Constant.EE_BRAND_FULL) {
            brand = Bfl_Constant.EE_BRAND_SHORT;
        } else if (brandValue == Bfl_Constant.NB_BRAND_FULL) {
            brand = Bfl_Constant.NB_BRAND_SHORT;
        } else if (brandValue.equals(System.Label.B2B_SVS_BRAND_LABEL)) {
            brand = B2B_Constants.SVS_BRAND_LABEL;
        }
        return brand;
    }

    /*
     * BS-836
     * This method creates ContentVersion and ContentDocumentLink records
     */
    @AuraEnabled
    public static void uploadFile(String uploadedFileContent, String filename, Task task, Boolean isSilhouetteLogin) {
        if (String.isNotBlank(fileName) && String.isNotBlank(uploadedFileContent)) {
            ContentVersion contentVersionData = createContentVersion(uploadedFileContent, fileName, task, isSilhouetteLogin);
            if (contentVersionData != null) {
                createContentDocumentLink(contentVersionData.Id, task.Id);
            }
        }
    }

    /*
     * BS-836
     * This method creates ContentVersion based on file content, filename and task data.
     */
    private static ContentVersion createContentVersion(String uploadedFileContent, String fileName, Task task, Boolean isSilhouetteLogin) {
        Id networkId;
        Map<String, Id> storeNameVsNetworkIdMap = new Map<String, Id>();
        ContentVersion newContentVersion = new ContentVersion();
        newContentVersion.VersionData = EncodingUtil.base64Decode(uploadedFileContent);
        newContentVersion.Title = fileName;
        newContentVersion.PathOnClient = fileName;
        List<Network> networkList = [SELECT Id, Name FROM Network WHERE Name = :B2B_Constants.SILHOUETTE_B2B_STORE OR Name = :B2B_Constants.NEUBAU_B2B_STORE];
        for (Network networkObject : networkList) {
            storeNameVsNetworkIdMap.put(networkObject.Name, networkObject.Id);
        }

        if (storeNameVsNetworkIdMap.isEmpty() == false) {
            networkId = isSilhouetteLogin
                ? storeNameVsNetworkIdMap.get(B2B_Constants.SILHOUETTE_B2B_STORE)
                : storeNameVsNetworkIdMap.get(B2B_Constants.NEUBAU_B2B_STORE);
        }
        newContentVersion.NetworkId = networkId;
        insert newContentVersion;
        return newContentVersion;
    }

    /*
     * BS-836
     * This method creates ContentDocumentLink based on contentVersionId and taskId
     */
    private static ContentDocumentLink createContentDocumentLink(String contentVersionId, Id taskId) {
        ContentDocumentLink newContentDocumentLink = new ContentDocumentLink();
        if (String.isNotBlank(contentVersionId)) {
            List<ContentVersion> contentVersionList = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersionId LIMIT 1];
            if (contentVersionList.isEmpty() == false) {
                newContentDocumentLink.ContentDocumentId = contentVersionList[0].ContentDocumentId;
            }
            newContentDocumentLink.LinkedEntityId = taskId;
            newContentDocumentLink.ShareType = B2B_Constants.SHARE_TYPE;
            insert newContentDocumentLink;
        }
        return newContentDocumentLink;
    }
}
