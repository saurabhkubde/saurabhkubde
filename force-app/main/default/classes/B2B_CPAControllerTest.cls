@isTest
public with sharing class B2B_CPAControllerTest {
    @TestSetup
    static void testData() {
        UserRole userrole = [SELECT Id, DeveloperName FROM UserRole WHERE DeveloperName = :Bfl_Constant.SIL_INTERNATIONAL_HQ_ROLE LIMIT 1];

        User userRecord = B2B_TestDataFactory.createUser('test0', 'test0', 'test0@ksection.com', UserInfo.getProfileId());
        userRecord.Phone = '098765432112';
        userRecord.k_Rep_Code__c = '567';
        userRecord.IsActive = true;
        userRecord.UserRoleId = userRole.Id;
        insert userRecord;

        User userRecord2 = B2B_TestDataFactory.createUser('test2', 'test2', 'test2@ksection.com', UserInfo.getProfileId());
        userRecord2.Phone = '1234567890';
        insert userRecord2;
        System.runAs(userRecord2) {
            B2B_TestDataFactory.createCountrySpecificPreferenceSettingRecords();
        }
        User userRecord3 = B2B_TestDataFactory.createUser('test1', 'test1', 'test011@ksection.com', UserInfo.getProfileId());
        userRecord3.Phone = '1234567890';
        insert userRecord3;
        System.runAs(userRecord) {
            Id prospectRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByDeveloperName()
                .get(B2B_Constants.PROSPECT_RECORD_TYPE_DEVELOPER_NAME)
                .getRecordTypeId();
            List<Account> accountsList = B2B_TestDataFactory.createAccounts(2, 'testProspect1', 'Account', false);
            accountsList[0].recordTypeId = prospectRecordTypeId;
            accountsList[0].OwnerId = userRecord.Id;
            accountsList[0].Store_Country__c = 'Germany';
            accountsList[0].k_Stage__c = 'Prospect_B2B';
            accountsList[0].Brand__c = Bfl_Constant.SH_BRAND_FULL;
            accountsList[0].k_ARIS_Account_ID__c = 'DEDE12345';
            accountsList[0].k_Email__c = 'test@exampletest.com';

            accountsList[1].recordTypeId = prospectRecordTypeId;
            accountsList[1].OwnerId = userRecord.Id;
            accountsList[1].Store_Country__c = 'Germany';
            accountsList[1].k_Stage__c = 'Account';
            accountsList[1].Brand__c = Bfl_Constant.NB_BRAND_FULL;
            accountsList[1].k_ARIS_Account_ID__c = 'DEDE123456';
            accountsList[1].k_Email__c = 'testnb@exampletest.com';

            insert accountsList;

            Contact objContactRecord = B2B_TestDataFactory.createContact('Mr.', 'test', 'con', accountsList[0].Id, false);
            insert objContactRecord;

            Contact objContactNBRecord = B2B_TestDataFactory.createContact('Mr.', 'test', 'contact', accountsList[1].Id, false);
            insert objContactNBRecord;

            Id b2bSilUserProfile = [SELECT id FROM profile WHERE name = :Bfl_Constant.COMMERCE_USER_PROFILE_NAME].id;
            List<User> userList = new List<User>{
                new User(
                    alias = 'test123',
                    email = 'test123@noemail.com',
                    emailencodingkey = 'UTF-8',
                    lastname = 'Testing commerce user',
                    languagelocalekey = 'en_US',
                    localesidkey = 'en_US',
                    profileid = b2bSilUserProfile,
                    country = 'Germany',
                    IsActive = true,
                    ContactId = objContactRecord.Id,
                    timezonesidkey = 'America/Los_Angeles',
                    username = 'tester@noemail.com'
                ),
                new User(
                    alias = 'test1234',
                    email = 'test1234@noemail.com',
                    emailencodingkey = 'UTF-8',
                    lastname = 'Testing NB commerce user',
                    languagelocalekey = 'en_US',
                    localesidkey = 'en_US',
                    profileid = b2bSilUserProfile,
                    country = 'Germany',
                    IsActive = true,
                    ContactId = objContactNBRecord.Id,
                    timezonesidkey = 'America/Los_Angeles',
                    username = 'testerNB@noemail.com'
                )
            };
            insert userList;
        }
        System.runAs(userRecord2) {
            B2B_TestDataFactory.createCountrySpecificPreferenceSettingRecords();
        }
    }

    @isTest
    public static void testGetContactPointAddresses() {
        List<ContactPointAddress> cpas = new List<ContactPointAddress>();
        User u = B2B_TestDataFactory.createInsertCommerceUser();

        System.runAs(u) {
            cpas = B2B_CPAController.getContactPointAddresses();
            System.assertEquals(0, cpas.size(), 'getContactPointAddresses should not return any CPA');
        }

        String accountId = [SELECT Id FROM Account WHERE Name = 'Silhouette Account' LIMIT 1]?.Id;
        ContactPointAddress cpa = B2B_TestDataFactory.createShippingAddress(accountId, true);

        insert cpa;

        System.runAs(u) {
            cpas = B2B_CPAController.getContactPointAddresses();
            System.assertEquals(1, cpas.size(), 'getContactPointAddresses should return one CPA');
        }
    }

    @isTest
    public static void testGetAccountAddressChange() {
        Boolean hasAddressChange;
        User u = B2B_TestDataFactory.createInsertCommerceUser();

        System.runAs(u) {
            hasAddressChange = B2B_CPAController.getAccountAddressChange();
            System.assertEquals(false, hasAddressChange, 'getAccountAddressChange should return false');
        }

        Account acc = [SELECT Id FROM Account WHERE Name = 'Silhouette Account' LIMIT 1];
        acc.B2B_Requested_Address_Change__c = true;

        update acc;

        System.runAs(u) {
            hasAddressChange = B2B_CPAController.getAccountAddressChange();
            System.assertEquals(true, hasAddressChange, 'getAccountAddressChange should return true');
        }
    }

    /**
     * @description testSilhouetteAddShippingAddressChange
     * @author Rahul P
     * checks if for silhouette a task is being created with request add shipping address
     */
    @isTest
    public static void testSilhouetteAddShippingAddressChange() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE lastName = 'Testing commerce user'
        ];
        Map<String, Object> userInputMap = genrateUserInput('addShippingAddress', '');
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, true);
        List<Task> taskList = [SELECT Id, Subject FROM Task WHERE Subject = :System.label.B2B_Task_Subject_Address_Change];
        System.assertEquals(Bfl_Constant.SUCCESS, msg, 'Task not created');
        System.assertEquals(1, taskList.size(), 'Task not created');
    }

    /**
     * @description testSilhouetteAddBillingAddressChange
     * @author Rahul P
     * checks if for silhouette a task is being created with request add billing address
     */

    @isTest
    public static void testSilhouetteAddBillingAddressChange() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE lastName = 'Testing commerce user'
        ];
        Map<String, Object> userInputMap = genrateUserInput('changeBillingAddress', 'addBillingAddress');
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, true);
        List<Task> taskList = [SELECT Id, Subject, Description FROM Task WHERE Subject = :System.label.B2B_Task_Subject_Address_Change];
        System.assertEquals(Bfl_Constant.SUCCESS, msg, 'Task not created');
        System.assertEquals(1, taskList.size(), 'Task not created');
    }

    /**
     * @description testSilhouetteEditBillingAddressChange
     * @author Rahul P
     * checks if for silhouette a task is being created with request edit billing address
     */

    @isTest
    public static void testSilhouetteEditBillingAddressChange() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE lastName = 'Testing commerce user'
        ];
        Map<String, Object> userInputMap = genrateUserInput('changeBillingAddress', 'editBillingAddress');
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, true);
        List<Task> taskList = [SELECT Id, Subject, Description FROM Task WHERE Subject = :System.label.B2B_Task_Subject_Address_Change];
        System.assertEquals(Bfl_Constant.SUCCESS, msg, 'Task not created');
        System.assertEquals(1, taskList.size(), 'Task not created');
    }

    /**
     * @description testSilhouetteDeleteBillingAddressChange
     * @author Rahul P
     * checks if for silhouette a task is being created with request delete billing address
     */

    @isTest
    public static void testSilhouetteDeleteBillingAddressChange() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE lastName = 'Testing commerce user'
        ];
        Map<String, Object> userInputMap = genrateUserInput('changeBillingAddress', 'deleteBillingAddress');
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, true);
        List<Task> taskList = [SELECT Id, Subject, Description FROM Task WHERE Subject = :System.label.B2B_Task_Subject_Address_Change];
        System.assertEquals(Bfl_Constant.SUCCESS, msg, 'Task not created');
        System.assertEquals(1, taskList.size(), 'Task not created');
    }

    /**
     * @description testSilhouetteEditShippingAddressChange
     * @author Rahul P
     * checks if for silhouette a task is being created with request edit shipping address
     */

    @isTest
    public static void testSilhouetteEditShippingAddressChange() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE lastName = 'Testing commerce user'
        ];
        Map<String, Object> userInputMap = genrateUserInput('editShippingAddressRequest', '');
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, true);
        List<Task> taskList = [SELECT Id, Subject, Description FROM Task WHERE Subject = :System.label.B2B_Task_Subject_Address_Change];
        System.assertEquals(Bfl_Constant.SUCCESS, msg, 'Task not created');
        System.assertEquals(1, taskList.size(), 'Task not created');
    }

    /**
     * @description testSilhouetteDeleteShippingAddressChange
     * @author Rahul P
     * checks if for silhouette a task is being created with request detete shipping address
     */

    @isTest
    public static void testSilhouetteDeleteShippingAddressChange() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE lastName = 'Testing commerce user'
        ];
        Map<String, Object> userInputMap = genrateUserInput('deleteShippingAddress', '');
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, true);
        List<Task> taskList = [SELECT Id, Subject, Description FROM Task WHERE Subject = :System.label.B2B_Task_Subject_Address_Change];
        System.assertEquals(Bfl_Constant.SUCCESS, msg, 'Task not created');
        System.assertEquals(1, taskList.size(), 'Task not created');
    }

    /**
     * @description testSilhouetteAddShippingAddressChange
     * @author Rahul P
     * checks if for Neubau a task is being created with request add shipping address
     */

    @isTest
    public static void testNeubauAddShippingAddressChange() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE lastName = 'Testing NB commerce user'
        ];
        Map<String, Object> userInputMap = genrateUserInput('addShippingAddress', '');
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, false);
        List<Task> taskList = [SELECT Id, Subject FROM Task WHERE Subject = :System.label.B2B_Task_Subject_Address_Change];
        System.assertEquals(Bfl_Constant.SUCCESS, msg, 'Task not created');
        System.assertEquals(1, taskList.size(), 'Task not created');
    }

    /**
     * @description testNeubauAddBillingAddressChange
     * @author Rahul P
     * checks if for Neubau a task is being created with request add billing address
     */

    @isTest
    public static void testNeubauAddBillingAddressChange() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE lastName = 'Testing NB commerce user'
        ];
        Map<String, Object> userInputMap = genrateUserInput('changeBillingAddress', 'addBillingAddress');
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, false);
        List<Task> taskList = [SELECT Id, Subject, Description FROM Task WHERE Subject = :System.label.B2B_Task_Subject_Address_Change];
        System.assertEquals(Bfl_Constant.SUCCESS, msg, 'Task not created');
        System.assertEquals(1, taskList.size(), 'Task not created');
    }

    /**
     * @description testNeubauEditBillingAddressChange
     * @author Rahul P
     * checks if for Neubau a task is being created with request edit billing address
     */

    @isTest
    public static void testNeubauEditBillingAddressChange() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE lastName = 'Testing NB commerce user'
        ];
        Map<String, Object> userInputMap = genrateUserInput('changeBillingAddress', 'editBillingAddress');
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, false);
        List<Task> taskList = [SELECT Id, Subject, Description FROM Task WHERE Subject = :System.label.B2B_Task_Subject_Address_Change];
        System.assertEquals(Bfl_Constant.SUCCESS, msg, 'Task not created');
        System.assertEquals(1, taskList.size(), 'Task not created');
    }

    /**
     * @description testNeubauDeleteBillingAddressChange
     * @author Rahul P
     * checks if for Neubau a task is being created with request delete billing address
     */

    @isTest
    public static void testNeubauDeleteBillingAddressChange() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE lastName = 'Testing NB commerce user'
        ];
        Map<String, Object> userInputMap = genrateUserInput('changeBillingAddress', 'deleteBillingAddress');
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, false);
        List<Task> taskList = [SELECT Id, Subject, Description FROM Task WHERE Subject = :System.label.B2B_Task_Subject_Address_Change];
        System.assertEquals(Bfl_Constant.SUCCESS, msg, 'Task not created');
        System.assertEquals(1, taskList.size(), 'Task not created');
    }

    /**
     * @description testNeubauEditShippingAddressChange
     * @author Rahul P
     * checks if for Neubau a task is being created with request edit shipping address
     */

    @isTest
    public static void testNeubauEditShippingAddressChange() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE lastName = 'Testing NB commerce user'
        ];
        Map<String, Object> userInputMap = genrateUserInput('editShippingAddressRequest', '');
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, false);
        List<Task> taskList = [SELECT Id, Subject, Description FROM Task WHERE Subject = :System.label.B2B_Task_Subject_Address_Change];
        System.assertEquals(Bfl_Constant.SUCCESS, msg, 'Task not created');
        System.assertEquals(1, taskList.size(), 'Task not created');
    }

    /**
     * @description testNeubauDeleteShippingAddressChange
     * @author Rahul P
     * checks if for Neubau a task is being created with request delete shipping address
     */

    @isTest
    public static void testNeubauDeleteShippingAddressChange() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE lastName = 'Testing NB commerce user'
        ];
        Map<String, Object> userInputMap = genrateUserInput('deleteShippingAddress', '');
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, false);
        List<Task> taskList = [SELECT Id, Subject, Description FROM Task WHERE Subject = :System.label.B2B_Task_Subject_Address_Change];
        System.assertEquals(Bfl_Constant.SUCCESS, msg, 'Task not created');
        System.assertEquals(1, taskList.size(), 'Task not created');
    }

    /**
     * @description testErrorWhenEmptyRequestInAddressChange
     * @author Rahul P
     * checks if for Neubau if coming request is empty
     */
    @isTest
    public static void testErrorWhenEmptyRequestInAddressChange() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE lastName = 'Testing commerce user'
        ];
        Map<String, Object> userInputMap = new Map<String, Object>();
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, false);
        System.assertEquals(System.Label.B2B_Something_Went_Wrong, msg, 'Task not created');
    }

    /**
     * @description testErrorWhenCseNotPresent
     * @author Rahul P
     * checks if there is no customer service executive available on the account
     */
    @isTest
    public static void testErrorWhenCseNotPresent() {
        List<User> userList = [
            SELECT Id, AccountId, Account.B2B_SH_EE_Customer_Service_Agent__c, Account.B2B_NB_Customer_Service_Agent__c
            FROM User
            WHERE Phone = '098765432112'
        ];
        Map<String, Object> userInputMap = genrateUserInput('editShippingAddressRequest', '');
        String msg = B2B_CPAController.handleAddressChangeRequest(userInputMap, userList[0].Id, false);
        System.assertEquals(System.Label.B2B_Something_Went_Wrong, msg, 'Task not created');
    }

    /**
     * @description genrateUserInput
     * @author Rahul P
     * generates the user input for the task creation
     */
    private static Map<String, Object> genrateUserInput(String requestType, String optionForBillingAddressChange) {
        Map<String, Object> userInputMap;
        if (requestType == 'addShippingAddress') {
            userInputMap = new Map<String, Object>{
                'AddAddress_ShippingName' => 'Test ShippingName',
                'requestType' => 'addShippingAddress',
                'AddAddress_ShippingStreet' => 'Test street',
                'AddAddress_PostalCode' => '12345',
                'AddAddress_City' => 'Test City',
                'AddAddress_Province' => 'Test Province',
                'AddAddress_Country' => 'Test Country',
                'AddAddress_Comment' => 'Test Comment'
            };
        } else if (requestType == 'changeBillingAddress') {
            userInputMap = new Map<String, Object>{
                'editAddressName' => 'Test Name',
                'requestType' => 'changeBillingAddress',
                'EditBillingAddress_Options' => optionForBillingAddressChange,
                'EditBillingAddress_ChangeRequestReason' => 'Test Reason'
            };
        } else if (requestType == 'editShippingAddressRequest') {
            userInputMap = new Map<String, Object>{
                'editAddressName' => 'Test Name',
                'requestType' => 'editShippingAddressRequest',
                'EditShippingAddress_Street' => 'Test Street',
                'EditShippingAddress_PostalCode' => '12345',
                'EditShippingAddress_City' => 'Test City',
                'EditShippingAddress_Province' => 'Test Province',
                'EditShippingAddress_Country' => 'Test Country',
                'EditShippingAddress_Comment' => 'Test Comment'
            };
        } else if (requestType == 'deleteShippingAddress') {
            userInputMap = new Map<String, Object>{ 'editAddressName' => 'Test Name', 'requestType' => 'deleteShippingAddress' };
        }
        return userInputMap;
    }
}
