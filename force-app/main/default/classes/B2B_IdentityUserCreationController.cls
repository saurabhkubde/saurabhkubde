@SuppressWarnings('PMD')
public without sharing class B2B_IdentityUserCreationController {
    @AuraEnabled(cacheable=true)
    public static List<B2B_FieldSetWrapper> getFieldSetData(String objectName, String fieldSetName) {
        List<B2B_FieldSetWrapper> fieldSetData = new List<B2B_FieldSetWrapper>();

        Schema.SObjectType sObjectType = Schema.getGlobalDescribe().get(objectName);
        if (sObjectType != null) {
            Schema.FieldSet fieldSet = sObjectType.getDescribe().fieldSets.getMap().get(fieldSetName);
            if (fieldSet != null) {
                for (Schema.FieldSetMember field : fieldSet.getFields()) {
                    fieldSetData.add(new B2B_FieldSetWrapper(field.fieldPath, field.label, String.valueOf(field.getType())));
                }
            }
        }

        return fieldSetData;
    }

    @AuraEnabled //BS-1923
    public static Id createAccountContact(Map<String, Object> userFields) {
        String splitedLastName = String.valueOf(userFields.get(B2B_Constants.LASTNAME)).replaceAll(' ', '');

        //BS-1923 Create Account for mediahub user
        Account accountObject = new Account();
        accountObject.Name = userFields.get(B2B_Constants.FIRSTNAME) != null &&
            String.isBlank(String.valueOf(userFields.get(B2B_Constants.FIRSTNAME))) == false
            ? userFields.get(B2B_Constants.FIRSTNAME) + ' ' + splitedLastName
            : splitedLastName;
        accountObject.k_Customer_Status__c = B2B_Constants.ACTIVE_STATUS;
        accountObject.k_B2B_Shop_Username__c = String.valueOf(userFields.get(B2B_Constants.FEDERATIONIDENTIFIER));
        accountObject.RecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get('Account').getRecordTypeId();
        accountObject.k_Stage__c = B2B_Constants.IDENTITY_USER_MEDIAHUB_ONLY;
        accountObject.K_Email__c = String.valueOf(userFields.get(B2B_Constants.EMAIL));

        insert accountObject;

        //BS-1923 Create Contact for mediahub user
        Contact contactObject = new Contact();
        contactObject.Salutation = B2B_Constants.SALUTATION;
        contactObject.firstname = String.valueOf(userFields.get(B2B_Constants.FIRSTNAME));
        contactObject.lastname = splitedLastName;
        contactObject.email = String.valueOf(userFields.get(B2B_Constants.EMAIL));
        contactObject.accountId = accountObject.Id;
        contactObject.phone = '000000';

        insert contactObject;

        return contactObject.Id;
    }

    @AuraEnabled
    public static Id createUser(Map<String, Object> userFields, String contactId) {
        String splitedLastName;
        User newIdentityUserObj = new User();
        List<Profile> profileList = [SELECT Id, Name FROM Profile WHERE Name = :System.Label.B2B_Identity_User_Profile_Name LIMIT 1];

        for (String field : userFields.keySet()) {
            newIdentityUserObj.put(field, userFields.get(field));
        }

        //BS-1784 prepopulating alias field
        splitedLastName = String.valueOf(userFields.get(B2B_Constants.LASTNAME)).replaceAll(' ', '');

        if (splitedLastName.length() > 4) {
            splitedLastName = splitedLastName.substring(0, 4);
        }

        String aliasName = userFields.get(B2B_Constants.FIRSTNAME) != null &&
            String.isBlank(String.valueOf(userFields.get(B2B_Constants.FIRSTNAME))) == false
            ? String.valueOf(userFields.get(B2B_Constants.FIRSTNAME)).substring(0, 1) + '' + splitedLastName
            : splitedLastName;

        newIdentityUserObj.put(B2B_Constants.PROFILEID, profileList[0].Id);
        newIdentityUserObj.put(B2B_Constants.ALIAS, aliasName); //BS-1784
        newIdentityUserObj.put(B2B_Constants.PHONE, '00000000'); //BS-1784
        newIdentityUserObj.put(B2B_Constants.LANGUAGRLOCALKEY, B2B_Constants.EN_US);
        newIdentityUserObj.put(B2B_Constants.LOCALSIDKEY, B2B_Constants.EN_US);
        newIdentityUserObj.put(B2B_Constants.TIMEZONESIDKEY, B2B_Constants.TIME_ZONE_KEY);
        newIdentityUserObj.put(B2B_Constants.EMAILENCODINGKEY, B2B_Constants.EMAIL_ENCODING_KEY);
        newIdentityUserObj.put(B2B_Constants.ENABLEFILTERPREFERENCESETTING, true);
        newIdentityUserObj.put(B2B_Constants.CONTACTID, contactId); //BS-1923

        insert newIdentityUserObj;

        return newIdentityUserObj.Id;
    }

    //BS-1923
    @AuraEnabled
    public static Void rollbackAccountCreationOnFailure(String contactId) {
        List<Contact> contactList = [SELECT Id, AccountId FROM Contact WHERE Id = :contactId];
        delete [SELECT Id FROM Account WHERE Id = :contactList[0].AccountId]; //BS-1923
    }

    public with sharing class B2B_FieldSetWrapper {
        @AuraEnabled
        public String fieldApiName { get; set; }
        @AuraEnabled
        public String fieldLabel { get; set; }
        @AuraEnabled
        public String fieldType { get; set; }

        public B2B_FieldSetWrapper(String fieldApiName, String fieldLabel, String fieldType) {
            this.fieldApiName = fieldApiName;
            this.fieldLabel = fieldLabel;
            this.fieldType = fieldType;
        }
    }
}
