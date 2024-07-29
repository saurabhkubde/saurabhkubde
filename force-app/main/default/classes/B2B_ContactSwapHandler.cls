/*Apex class made as a part of BS-2224*/
public with sharing class B2B_ContactSwapHandler {
    /**
     * @description get contact details
     * @author Vishalsingh Gaur
     * @param  contactId   id of the contact
     * This method returns list of contacts
     */
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactDetails(Id contactId) {
        List<Contact> contactList = new List<Contact>([SELECT Id, Name, Email, LastName, Account.k_ARIS_Account_ID__c FROM Contact WHERE Id = :contactId]);
        return contactList.isEmpty() ? null : contactList;
    }

    /**
     * @description get contacts which have same account as the one contact selected
     * @author Vishalsingh Gaur
     * @param  contactId   id of the contact
     * This method returns list of contacts
     */
    @AuraEnabled
    public static List<Contact> getContactsRelatedToAccount(Id contactId) {
        List<Contact> oldContactList = [SELECT Id, AccountId FROM Contact WHERE Id = :contactId LIMIT 1];
        List<Contact> contactList = new List<Contact>();

        if (!oldContactList.isEmpty()) {
            contactList = [SELECT Id, Name, AccountId, Email FROM Contact WHERE AccountId = :oldContactList[0].AccountId AND Id != :contactId];
        }

        return contactList.isEmpty() ? null : contactList;
    }

    /**
     * @description disabling the contact  which is being swapped
     * @author Vishalsingh Gaur
     * @param  swapFromContactId               Id of the contact which needs to be swapped
     * @param  swapToContactId                 Id of contact which is being swappped to
     */

    @AuraEnabled
    public static void disableContactAsCustomerUser(Id swapFromContactId, Id swapToContactId) {
        List<Contact> swapFromContactList = new List<Contact>(
            [SELECT Id, k_ToBeDeleted__c, B2B_Enabled_for_Partner_Portal__c, AccountId FROM Contact WHERE Id = :swapFromContactId LIMIT 1]
        );
        List<Contact> swapToContactList = new List<Contact>(
            [SELECT id, k_ToBeDeleted__c, B2B_Enabled_for_Partner_Portal__c FROM Contact WHERE Id = :swapToContactId LIMIT 1]
        );

        for (Contact contactObj : swapFromContactList) {
            contactObj.B2B_Enabled_for_Partner_Portal__c = false;
            contactObj.k_ToBeDeleted__c = true;
        }
        try {
            update swapFromContactList;
        } catch (Exception e) {
            B2B_LogUtils.createErrorLog(e.getMessage(), 'B2B_ContactSwapHandler', e.getStackTraceString(), swapFromContactList[0].Id);
            throw new AuraHandledException(B2B_Constants.GENERIC_ERROR);
        }

        for (Contact contactObj : swapToContactList) {
            contactObj.B2B_Enabled_for_Partner_Portal__c = true;
            contactObj.k_ToBeDeleted__c = false;
        }

        try {
            update swapToContactList;
        } catch (Exception e) {
            B2B_LogUtils.createErrorLog(e.getMessage(), 'B2B_ContactSwapHandler', e.getStackTraceString(), swapToContactList[0].Id);
            throw new AuraHandledException(B2B_Constants.GENERIC_ERROR);
        }
    }

    /**
     * @description get federation id from the contact's user
     * @author Vishalsingh Gaur
     * @param  swapFromContactId               Id of the contact
     * This method returns the federation Id of swapFromContactId
     */
    @AuraEnabled
    public static String getFederationIdFromUser(Id swapFromContactId) {
        String federationId = '';
        List<Contact> swapFromContactList = new List<Contact>(
            [SELECT Id, k_ToBeDeleted__c, B2B_Enabled_for_Partner_Portal__c, AccountId FROM Contact WHERE Id = :swapFromContactId LIMIT 1]
        );
        List<User> userList = new List<User>([SELECT id, ContactId, FederationIdentifier FROM User WHERE ContactId = :swapFromContactList[0].Id LIMIT 1]);

        for (User userObj : userList) {
            userObj.IsActive = false;
            userObj.IsPortalEnabled = false;
            federationId = userObj.FederationIdentifier;
            userObj.FederationIdentifier = null;
            userObj.CommunityNickname = null;
        }
        try {
            update userList;
        } catch (Exception e) {
            B2B_LogUtils.createErrorLog(e.getMessage(), 'B2B_ContactSwapHandler', e.getStackTraceString(), userList[0].Id);
            throw new AuraHandledException(B2B_Constants.GENERIC_ERROR);
        }

        return String.isBlank(federationId) ? null : federationId;
    }

    /**
     * @description creating an user for existing customer
     * @author Vishalsingh Gaur
     * @param  existingCustomerArisAccountId   informations about the existing customer aris account id
     * @param  existingCustomerName            informations about the existing customer name
     * @param  contactId                       informations about the existing contact id
     * @param  userEmail                       user email address
     * @param  userNickname                    user's nickname
     */

    @AuraEnabled
    public static String createUser(
        String existingCustomerArisAccountId,
        String existingCustomerName,
        String contactId,
        String userEmail,
        String userNickname
    ) {
        Id profileIdNB = [SELECT Id FROM Profile WHERE Name = :B2B_Constants.PROFILE_NAME_NB LIMIT 1][0]?.Id;

        Id profileSH = [SELECT Id FROM Profile WHERE Name = :B2B_Constants.PROFILE_NAME_SH LIMIT 1][0]?.Id;

        String organizationId = UserInfo.getOrganizationId();
        String dateString = String.valueof(Datetime.now()).replace(' ', '').replace(':', '').replace('-', '');

        String uniqueName = organizationId + dateString + Integer.valueOf(Math.rint(Math.random() * 1000000));

        Id userProfile;
        if (existingCustomerArisAccountId.contains(B2B_Constants.NEUBAU_BRAND)) {
            userProfile = profileIdNB;
        } else {
            userProfile = profileSH;
        }
        try {
            User newUser = new User(
                UserName = userEmail + DateTime.now().millisecondGMT(),
                ProfileId = userProfile,
                LastName = existingCustomerName,
                Email = userEmail,
                CommunityNickname = userNickname,
                FederationIdentifier = userNickname,
                Alias = uniqueName.substring(18, 25),
                ContactId = contactId,
                emailencodingkey = B2B_Constants.EMAIL_ENCODING_KEY,
                languagelocalekey = B2B_Constants.EN_US,
                localesidkey = B2B_Constants.EN_US,
                timezonesidkey = B2B_Constants.TIME_ZONE_ID_KEY,
                isActive = true
            );
            insert newUser;
            System.resetPassword(newUser.Id, false);
            return 'Success';
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_ContactSwapHandler', B2B_Constants.INSERT_FAILED);
            return 'Error';
        }
    }
}
