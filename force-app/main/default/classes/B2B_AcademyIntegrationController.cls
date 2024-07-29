public without sharing class B2B_AcademyIntegrationController {
    public static final String ACADEMY_SALUTATION = '{!salutation}'; //BS-2290
    public static final String ACADEMY_FIRSTNAME = '{!firstName}'; //BS-2290
    public static final String ACADEMY_LASTNAME = '{!lastName}'; //BS-2290
    public static final String ACADEMY_EMAIL_ADDRESS = '{!emailAddress}'; //BS-2290
    public static final String ACADEMY_FUNCTION = '{!function}'; //BS-2290

    /**
     * BS-2289
     * @description This method is used to check current logged account is active or not for academy.
     */

    @AuraEnabled(cacheable=false)
    public static Boolean checkCurrentUserCountryActive(String countryName) {
        List<B2B_Active_Academy_Country__mdt> activeCountriesList = new List<B2B_Active_Academy_Country__mdt>();
        Boolean isActive = false;

        if (String.isEmpty(countryName) == false) {
            activeCountriesList = [
                SELECT MasterLabel, DeveloperName, B2B_Is_Active__c, B2B_Country_Name__c
                FROM B2B_Active_Academy_Country__mdt
                WHERE B2B_Is_Active__c = TRUE AND B2B_Country_Name__c = :countryName
            ];
        } //end if

        if (activeCountriesList.isEmpty() == false) {
            isActive = true;
        } //end if

        return isActive;
    }

    /**
     * BS-2289
     * @description This method is fetching all contacts for asked account.
     */
    @AuraEnabled(cacheable=false)
    public static List<Contact> fetchContactsAssociatedWithAccount(String accountId) {
        List<Contact> contactList = new List<Contact>();

        if (String.isEmpty(accountId) == false) {
            contactList = [
                SELECT Id, Name, AccountId, LMS_Is_LMS_Contact__c, LMS_Is_Active__c, B2B_Enabled_for_Partner_Portal__c, Email
                FROM Contact
                WHERE AccountId = :accountId
            ];
        } //end if

        return contactList;
    }

    /**
     * BS-2290
     * @description This method is used to create task. Assigned task to related account customer service.
     */
    @AuraEnabled(cacheable=false)
    public static Boolean sendEmailAndCreateTaskForCustomerService(String accountId, Map<String, Object> academyRegistrationInputMap) {
        String customerServiceAgent = '';
        Boolean isTaskCreated = false;

        List<Account> accountList = [SELECT Id, B2B_SH_EE_Customer_Service_Agent__c FROM Account WHERE Id = :accountId];

        if (accountList.isEmpty() == false) {
            customerServiceAgent = accountList[0].B2B_SH_EE_Customer_Service_Agent__c;
        }

        String taskComments = getTaskComment(academyRegistrationInputMap);

        Task taskObj = new Task();
        taskObj.Subject = System.label.B2B_Academy_Task_Subject;
        taskObj.k_Activity_Brand__c = B2B_Constants.SILHOUETTE_BRAND;
        taskObj.Description = taskComments;
        taskObj.ActivityDate = System.today().addDays(7);
        taskObj.Priority = B2B_Constants.TASK_PRIORITY;
        taskObj.Status = B2B_Constants.TASK_STATUS;
        taskObj.OwnerId = customerServiceAgent;
        taskObj.WhatId = accountId;
        taskObj.TaskSubtype = B2B_Constants.TASK_SUBTYPE;
        taskObj.Bfl_Task_Source__c = B2B_Constants.TASK_B2B_PARTNER_PORTAL;

        insert taskObj;

        if (String.isNotBlank(taskObj.Id)) {
            isTaskCreated = true;
        }
        sendEmailToUserInputEmailAddress(academyRegistrationInputMap);

        return isTaskCreated;
    }

    /**
     * BS-2290
     * @description This method is used to send email to user input email.
     */
    public static void sendEmailToUserInputEmailAddress(Map<String, Object> academyRegistrationInputMap) {
        String userInputEmailAddress;
        if (academyRegistrationInputMap.containsKey(B2B_Constants.ACADEMY_EMAIL_ADDRESS)) {
            userInputEmailAddress = String.valueOf(academyRegistrationInputMap.get(B2B_Constants.ACADEMY_EMAIL_ADDRESS));
        }
        List<EmailTemplate> emailTemplateList = [
            SELECT Id, Subject, Description, HtmlValue, DeveloperName, Body
            FROM EmailTemplate
            WHERE DeveloperName = :B2B_Constants.ACADEMY_REGISTRATION_EMAIL_TEMPLATE_NAME
        ];

        List<OrgWideEmailAddress> orgWideEmailAddressList = [
            SELECT Id, Address
            FROM OrgWideEmailAddress
            WHERE Address = :B2B_Constants.SILHOUETTE_NO_REPLY_EMAIL_ADDRESS
        ];

        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        message.toAddresses = new List<String>{ userInputEmailAddress };
        message.setOrgWideEmailAddressId(orgWideEmailAddressList[0].Id);
        message.setReplyTo(orgWideEmailAddressList[0].Address);
        message.setSaveAsActivity(false);
        message.setTemplateId(emailTemplateList[0].Id);
        message.setTreatTargetObjectAsRecipient(false);
        message.setTargetObjectId(UserInfo.getUserId());

        Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage>{ message };

        Savepoint storedSavePoint = Database.setSavepoint();
        Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
        /* When We replaced htmlbody content and set htmlbody for email then image was not visible on email. For that, we made rollback
           where we retrieved the HTML body containing the image and made the necessary modifications as per
           the requirements before resending the email. */
        Database.rollback(storedSavePoint);

        Messaging.SingleEmailMessage messageObj = messages[0];

        String htmlbody = messageObj.getHtmlBody();

        if (
            academyRegistrationInputMap.containsKey(B2B_Constants.ACADEMY_SALUTATION) == false ||
            academyRegistrationInputMap.get(B2B_Constants.ACADEMY_SALUTATION) == null
        ) {
            htmlbody = htmlbody.replace(ACADEMY_SALUTATION, '');
        } else {
            htmlbody = htmlbody.replace(ACADEMY_SALUTATION, String.valueOf(academyRegistrationInputMap.get(B2B_Constants.ACADEMY_SALUTATION)));
        }

        if (academyRegistrationInputMap.containsKey(B2B_Constants.ACADEMY_FIRSTNAME)) {
            htmlbody = htmlbody.replace(ACADEMY_FIRSTNAME, String.valueOf(academyRegistrationInputMap.get(B2B_Constants.ACADEMY_FIRSTNAME)));
        }
        if (academyRegistrationInputMap.containsKey(B2B_Constants.ACADEMY_LASTNAME)) {
            htmlbody = htmlbody.replace(ACADEMY_LASTNAME, String.valueOf(academyRegistrationInputMap.get(B2B_Constants.ACADEMY_LASTNAME)));
        }
        if (academyRegistrationInputMap.containsKey(B2B_Constants.ACADEMY_EMAIL_ADDRESS)) {
            htmlbody = htmlbody.replace(ACADEMY_EMAIL_ADDRESS, String.valueOf(academyRegistrationInputMap.get(B2B_Constants.ACADEMY_EMAIL_ADDRESS)));
        }
        if (academyRegistrationInputMap.containsKey(B2B_Constants.ACADEMY_FUNCTION)) {
            htmlbody = htmlbody.replace(ACADEMY_FUNCTION, String.valueOf(academyRegistrationInputMap.get(B2B_Constants.ACADEMY_FUNCTION)));
        }

        Messaging.SingleEmailMessage updatedMessage = new Messaging.SingleEmailMessage();
        updatedMessage.toAddresses = new List<String>{ userInputEmailAddress };
        updatedMessage.setOrgWideEmailAddressId(orgWideEmailAddressList[0].Id);
        updatedMessage.setReplyTo(orgWideEmailAddressList[0].Address);
        updatedMessage.setSaveAsActivity(false);
        updatedMessage.setHtmlBody(htmlbody);
        updatedMessage.setSubject(System.label.B2B_Academy_Registration_Email_Subject);
        updatedMessage.setTreatTargetObjectAsRecipient(false);
        updatedMessage.setTargetObjectId(UserInfo.getUserId());

        Messaging.SingleEmailMessage[] updatedMessages = new List<Messaging.SingleEmailMessage>{ updatedMessage };
        Messaging.SendEmailResult[] updatedResults = Messaging.sendEmail(updatedMessages);

        if (!updatedResults[0].success) {
            B2B_LogUtils.createPersistLogAsync(results[0].errors[0].message, B2B_Constants.ACADEMY_REGISTRATION, B2B_LogUtils.LOG_TYPE_ERROR, 'none', 'none');
        }
    }

    /**
     * BS-2290
     * @description This method is used to get task description in required format.
     */
    public static String getTaskComment(Map<String, Object> academyRegistrationInputMap) {
        String comment = '';
        List<String> labelParameterList = new List<String>();
        if (academyRegistrationInputMap.isEmpty() == false) {
            if (
                academyRegistrationInputMap.containsKey(B2B_Constants.ACADEMY_SALUTATION) == false ||
                academyRegistrationInputMap.get(B2B_Constants.ACADEMY_SALUTATION) == null
            ) {
                labelParameterList.add('');
            } else {
                labelParameterList.add(String.valueOf(academyRegistrationInputMap.get(B2B_Constants.ACADEMY_SALUTATION)));
            }

            if (academyRegistrationInputMap.containsKey(B2B_Constants.ACADEMY_FIRSTNAME)) {
                labelParameterList.add(String.valueOf(academyRegistrationInputMap.get(B2B_Constants.ACADEMY_FIRSTNAME)));
            }
            if (academyRegistrationInputMap.containsKey(B2B_Constants.ACADEMY_LASTNAME)) {
                labelParameterList.add(String.valueOf(academyRegistrationInputMap.get(B2B_Constants.ACADEMY_LASTNAME)));
            }
            if (academyRegistrationInputMap.containsKey(B2B_Constants.ACADEMY_EMAIL_ADDRESS)) {
                labelParameterList.add(String.valueOf(academyRegistrationInputMap.get(B2B_Constants.ACADEMY_EMAIL_ADDRESS)));
            }
            if (academyRegistrationInputMap.containsKey(B2B_Constants.ACADEMY_FUNCTION)) {
                labelParameterList.add(String.valueOf(academyRegistrationInputMap.get(B2B_Constants.ACADEMY_FUNCTION)));
            }

            comment = String.format(System.label.B2B_ACADEMY_TASK_DESCRIPTION, labelParameterList);
        }

        return comment;
    }
}
