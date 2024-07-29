/**
 * @author Septimiu Dumitru
 * @email septimiu.dumitru@jpard.com
 * @created date 2022-06-23 11:00:00
 * @modify date 2022-07-01 11:38:00
 * @desc this class will create the account and contact when requested by community user
 */

public without sharing class B2B_PartnerRegistration {
    /**
     * @description creating an account for new user
     * @author Septimiu Dumitru
     * @param  accountInfo   accountInfo JSON input from the LWC
     * @param  contactInfo   contactInfo JSON input from the LWC
     */
    @AuraEnabled
    public static void createPartnerAccount(String accountInfo, String contactInfo, String language, Boolean isSilhouetteLogin) {
        try {
            Id prospectRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get(B2B_Constants.PROSPECT_RECORD_TYPE_NAME).getRecordTypeId();
            Map<String, Object> accountMap = (Map<String, Object>) JSON.deserializeUntyped(accountInfo);
            Account partnerAccount = new Account();
            partnerAccount.RecordTypeId = prospectRecordTypeId;
            partnerAccount.Name = accountMap.get('companyName') != null ? (String) accountMap.get('companyName') : null;
            partnerAccount.k_Email__c = accountMap.get('email') != null ? (String) accountMap.get('email') : null;
            partnerAccount.Phone = accountMap.get('phone') != null ? (String) accountMap.get('phone') : null;
            partnerAccount.B2B_AccountMessage__c = accountMap.get('message') != null ? (String) accountMap.get('message') : null;
            partnerAccount.Brand__c = accountMap.get('accountBrand') != null ? (String) accountMap.get('accountBrand') : null;
            partnerAccount.Website = accountMap.get('website') != null ? (String) accountMap.get('website') : null;

            partnerAccount.k_Billing_Street__c = accountMap.get('street') != null ? (String) accountMap.get('street') : null;
            partnerAccount.BillingStreet = accountMap.get('street') != null ? (String) accountMap.get('street') : null;
            partnerAccount.ShippingStreet = accountMap.get('street') != null ? (String) accountMap.get('street') : null;
            partnerAccount.k_Billing_City__c = accountMap.get('city') != null ? (String) accountMap.get('city') : null;
            partnerAccount.BillingCity = accountMap.get('city') != null ? (String) accountMap.get('city') : null;
            partnerAccount.ShippingCity = accountMap.get('city') != null ? (String) accountMap.get('city') : null;
            partnerAccount.k_Billing_Region__c = accountMap.get('province') != null ? (String) accountMap.get('province') : null;
            partnerAccount.BillingState = accountMap.get('province') != null ? (String) accountMap.get('province') : null;
            partnerAccount.ShippingState = accountMap.get('province') != null ? (String) accountMap.get('province') : null;
            partnerAccount.k_Billing_Country__c = accountMap.get('storeCountry') != null ? (String) accountMap.get('storeCountry') : null;
            partnerAccount.BillingCountry = accountMap.get('storeCountry') != null ? (String) accountMap.get('storeCountry') : null;
            partnerAccount.ShippingCountry = accountMap.get('storeCountry') != null ? (String) accountMap.get('storeCountry') : null;
            partnerAccount.k_Billing_Postal_Code__c = accountMap.get('postalCode') != null ? (String) accountMap.get('postalCode') : null;
            partnerAccount.BillingPostalCode = accountMap.get('postalCode') != null ? (String) accountMap.get('postalCode') : null;
            partnerAccount.ShippingPostalCode = accountMap.get('postalCode') != null ? (String) accountMap.get('postalCode') : null;
            partnerAccount.Store_Country__c = accountMap.get('storeCountry') != null ? (String) accountMap.get('storeCountry') : null;
            partnerAccount.k_Stage__c = 'Prospect_B2B';
            partnerAccount.k_GDPR_Approval__c = 'Yes';
            partnerAccount.k_GDPR_Approval_Date__c = Date.today();

            insert partnerAccount;

            /**
             * BS-1057
             * Updated the logic to send the partner registration emial based on the contact rather than the user.
             */
            Id contactId = createContact(contactInfo, partnerAccount.Id);
            createTask(partnerAccount);
            if (contactId != null) {
                B2B_Utils.sendPartnerRegistrationEmailToUser(language, isSilhouetteLogin, partnerAccount.k_Email__c, true, contactId);
            }
            /* End : BS-1057 */
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_PartnerRegistration', Label.B2B_LOGIN_Generic_Error);
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description creating a contact for new user
     * @author Septimiu Dumitru
     * @param  accountId   accountId the account for which the contact is created
     * @param  contactInfo   contactInfo JSON input from the LWC
     * @return Id of the contact inserted.
     */
    @AuraEnabled
    public static Id createContact(String contactInfo, String accountId) {
        try {
            Map<String, Object> contactMap = (Map<String, Object>) JSON.deserializeUntyped(contactInfo);
            Contact newContact = new Contact();
            newContact.AccountId = accountId;
            newContact.Salutation = contactMap.get('salutation') != null ? (String) contactMap.get('salutation') : null;
            newContact.FirstName = contactMap.get('firstName') != null ? (String) contactMap.get('firstName') : null;
            newContact.LastName = contactMap.get('lastName') != null ? (String) contactMap.get('lastName') : null;
            newContact.Email = contactMap.get('email') != null ? (String) contactMap.get('email') : null;
            List<Object> functionList = contactMap.get('function') != null ? (List<Object>) contactMap.get('function') : new List<Object>();
            if (!functionList.isEmpty()) {
                String functionOptions = (String) functionList[0];
                for (Integer i = 1; i < functionList.size(); i++) {
                    functionOptions += ';' + (String) functionList[i];
                }
                newContact.k_Function__c = functionOptions;
            }

            insert newContact;
            return newContact?.Id; /* Added as part of BS-1057 */
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_PartnerRegistration', Label.B2B_LOGIN_Generic_Error);
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description creating a task for new user
     * @author Rahul P
     * @param  partnerAccount  account object for which the task is created
     */
    @AuraEnabled
    public static void createTask(Account partnerAccount) {
        boolean isCsePresent = false;
        Id customerServiceEmpId;
        List<Contact> contactList = [
            SELECT Id, Name, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM Contact
            WHERE AccountId = :partnerAccount.Id
            LIMIT 1
        ];
        try {
            if (partnerAccount != null && !contactList.isEmpty()) {
                if (
                    partnerAccount.Brand__c != null &&
                    (partnerAccount.Brand__c == Bfl_Constant.SH_BRAND_FULL ||
                    partnerAccount.Brand__c == Bfl_Constant.EE_BRAND_FULL) &&
                    contactList[0].Account.B2B_SH_EE_Customer_Service_Agent__c != null
                ) {
                    isCsePresent = true;
                    customerServiceEmpId = contactList[0].Account.B2B_SH_EE_Customer_Service_Agent__c;
                } else if (
                    partnerAccount.Brand__c != null &&
                    partnerAccount.Brand__c == Bfl_Constant.NB_BRAND_FULL &&
                    contactList[0].Account.B2B_NB_Customer_Service_Agent__c != null
                ) {
                    isCsePresent = true;
                    customerServiceEmpId = contactList[0].Account.B2B_NB_Customer_Service_Agent__c;
                }

                if (isCsePresent) {
                    Task taskObj = new Task();
                    taskObj.Subject = Label.B2B_Task_Subject;
                    taskObj.k_Activity_Brand__c = String.isNotBlank(getBrand((String) partnerAccount.Brand__c))
                        ? getBrand((String) partnerAccount.Brand__c)
                        : null;
                    taskObj.Description = partnerAccount.B2B_AccountMessage__c != null ? partnerAccount.B2B_AccountMessage__c : null;
                    taskObj.ActivityDate = System.today().addDays(7);
                    taskObj.Priority = 'High';
                    taskObj.OwnerId = customerServiceEmpId;
                    taskObj.WhatId = partnerAccount.Id;
                    taskObj.WhoId = contactList[0].Id;
                    /* Start : BS-1645 */
                    taskObj.BFL_Event_Source__c = B2B_Constants.TASK_B2B_PARTNER_PORTAL;
                    taskObj.Bfl_Task_Source__c = B2B_Constants.TASK_B2B_PARTNER_PORTAL;
                    /* End : BS-1645 */
                    insert taskObj;
                }
            }
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_PartnerRegistration', Label.B2B_LOGIN_Generic_Error);
            throw new AuraHandledException(e.getMessage());
        }
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
        }

        return brand;
    }
}
