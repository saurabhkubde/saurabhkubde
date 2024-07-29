/**

 * @author Razvan Ficuta
 * @modified by Rahul P
 * @email razvan.ficuta@jpard.com
 * @created date 2022-06-23 11:00:00
 * @modify date 2022-11-18 11:38:00
 * @desc this class will create BuyerUser, BuyerGroupAssignment, Contact, User when an existing customer is registering
 */
public without sharing class B2B_Registration {
    public static Map<String, Object> registrationMap;
    public static final String TASK_SUBJECT_FOR_EXISTING_CUSTOMER_ISSUE = 'Existing Customer Issue for '; //BS-1430
    public static final string TYPE_OF_COUNTRY_SPECIFIC_SETTING = 'Customer Service Information'; //BS-1528

    /**
     * @description creating an account for existing user
     * @author Razvan Ficuta
     * @modified by Rahul P
     * @param  registrationForm   registrationForm JSON input from the LWC
     * @param  language           selected language of store.
     * @param  isSilhouetteLogin  if store is silhouette store
     */
    @SuppressWarnings('PMD.avoiddeeplynestedifstmts')
    @AuraEnabled
    public static String getUserAccess(String registrationForm, String language, Boolean isSilhouetteLogin) {
        Savepoint sp = Database.setSavepoint();
        try {
            registrationMap = (Map<String, Object>) JSON.deserializeUntyped(registrationForm);
            List<Account> existingCustomerList = new List<Account>();
            if (isSilhouetteLogin) {
                existingCustomerList = [
                    SELECT
                        Id,
                        Name,
                        Brand__c,
                        k_Email__c, //BS-1777
                        IsBuyer,
                        k_Stage__c,
                        k_Account_No__c,
                        B2B_Vision_Sensation__c,
                        B2B_Sonnenverglasung__c,
                        k_ARIS_Account_ID__c,
                        k_Customer_Status__c,
                        k_Account_Status_Silhouette__c,
                        Acct_Stat_EE__c,
                        B2B_Neubau_Account__c,
                        k_B2B_Shop_Username__c,
                        k_Account_Status_Neubau__c, //BS-1662
                        Store_Country__c,
                        B2B_ERP_Pricebook__c, //BS-1964
                        CSG_SubSeg_EE__c, //BS-2059
                        SH_Subsegment__c, //BS-2059
                        B2B_Blocked_for_Partner_Portal__c // BS-2057
                    FROM Account
                    WHERE
                        /* Start : BS-1552*/
                        (k_Account_No__c = :(String) registrationMap.get('accountNumber')
                        OR k_B2B_Shop_Username__c = :(String) registrationMap.get('accountNumber'))
                        AND Store_Country__c = :(String) registrationMap.get('countryName')
                    /* End : BS-1552*/
                    LIMIT 1
                ];
            } else {
                existingCustomerList = [
                    SELECT
                        Id,
                        Name,
                        Brand__c,
                        k_Email__c, //BS-1777
                        IsBuyer,
                        k_Stage__c,
                        k_Account_No__c,
                        B2B_Vision_Sensation__c,
                        B2B_Sonnenverglasung__c,
                        k_ARIS_Account_ID__c,
                        k_Customer_Status__c,
                        k_Account_Status_Silhouette__c,
                        Acct_Stat_EE__c,
                        B2B_Neubau_Account__c,
                        k_B2B_Shop_Username__c,
                        k_Account_Status_Neubau__c, //BS-1662
                        B2B_ERP_Pricebook__c, //BS-1964
                        CSG_SubSeg_EE__c, //BS-2059
                        SH_Subsegment__c, //BS-2059
                        B2B_Blocked_for_Partner_Portal__c // BS-2057
                    FROM Account
                    WHERE
                        k_Account_No__c = :(String) registrationMap.get('accountNumber')
                        OR k_B2B_Shop_Username__c = :(String) registrationMap.get('accountNumber')
                    LIMIT 1
                ];
            }
            /*START: BS-1777 */
            if (existingCustomerList.isEmpty() == false) {
                //BS-2057
                if (existingCustomerList[0].B2B_Blocked_for_Partner_Portal__c) {
                    return B2B_Constants.ACCOUNT_BLOCKED_FOR_REGISTRATION_ERROR;
                }

                registrationMap.put('accountEmail', existingCustomerList[0].k_Email__c);
            } else {
                registrationMap.put('accountEmail', null);
            }
            /*END: BS-1777 */
            Account existingCustomer = new Account();
            if (existingCustomerList.isEmpty() == false) {
                //BS-1662 : Added a logic to check whether account status is active for Neubau Store
                if (
                    isSilhouetteLogin == false &&
                    (existingCustomerList[0].k_Account_Status_Neubau__c != null &&
                    (existingCustomerList[0].k_Account_Status_Neubau__c.equalsIgnoreCase(B2B_Constants.NEUBAU_ACCOUNT_STATUS_INACTIVE) ||
                    existingCustomerList[0].k_Account_Status_Neubau__c.equalsIgnoreCase(B2B_Constants.NEUBAU_ACCOUNT_STATUS_INACTIVE_API_NAME)))
                ) {
                    return String.valueOf(false);
                }
                //BS-1662 : End

                //BS-1823 - Start
                String countryName = registrationMap.isEmpty() == false &&
                    registrationMap.containsKey(B2B_Constants.COUNTRY_NAME_USER_INPUT) &&
                    String.isNotBlank(String.valueOf(registrationMap.get(B2B_Constants.COUNTRY_NAME_USER_INPUT)))
                    ? String.valueOf(registrationMap.get(B2B_Constants.COUNTRY_NAME_USER_INPUT))
                    : '';
                String brand;
                if (isSilhouetteLogin != null && isSilhouetteLogin == true) {
                    brand = B2B_Constants.ACTIVE_COUNTRY_METADATA_BRAND_VALUE_SH_EE;
                } else if (isSilhouetteLogin != null && isSilhouetteLogin == false) {
                    brand = B2B_Constants.ACTIVE_COUNTRY_METADATA_BRAND_VALUE_NB;
                }
                //BS-1823 : Added a check for countryName and brand and added else block for handling error scenarios
                if (String.isNotBlank(countryName) && String.isNotBlank(brand)) {
                    List<Active_Country__mdt> activeCountryMetadataList = [
                        SELECT Id, MasterLabel, Country_Name__c, Is_Active__c, B2B_Brand__c
                        FROM Active_Country__mdt
                        WHERE Country_Name__c = :countryName AND B2B_Brand__c = :brand
                    ];
                    existingCustomer = existingCustomerList[0];
                    if (
                        existingCustomer.k_Stage__c.equalsIgnoreCase(Bfl_Constant.STAGE_ACCOUNT) &&
                        //BS-1823 : Added 2 checks activeCountryMetadataList empty/null check and Is_Active__c empty/null check
                        ((existingCustomer.k_Account_Status_Silhouette__c != null && existingCustomer.k_Account_Status_Silhouette__c.equalsIgnoreCase('1')) ||
                        (existingCustomer.Acct_Stat_EE__c != null && existingCustomer.Acct_Stat_EE__c.equalsIgnoreCase('1')) ||
                        (existingCustomer.B2B_Neubau_Account__c != null && existingCustomer.B2B_Neubau_Account__c))
                    ) {
                        if (existingCustomer.IsBuyer) {
                            return System.Label.B2B_Already_A_Buyer_Account;
                        } else {
                            if (
                                isSilhouetteLogin == false ||
                                (isSilhouetteLogin &&
                                (String.isNotBlank(existingCustomer.CSG_SubSeg_EE__c) || String.isNotBlank(existingCustomer.SH_Subsegment__c)))
                            ) {
                                /* START: BS-2006 : Added check to provide buyer access if contry is active*/
                                if (
                                    existingCustomer.B2B_ERP_Pricebook__c != null &&
                                    activeCountryMetadataList.isEmpty() == false &&
                                    activeCountryMetadataList[0].Is_Active__c
                                ) {
                                    BuyerAccount buyer = new BuyerAccount();
                                    /* START: BS-1904 : Added a check to verify if ERP Pricebook exists */
                                    enableBuyerAccount(existingCustomer, buyer, sp);
                                    createBuyerGroupAssignment(existingCustomer, sp); //BS-1964 removed country field parameter
                                    /*END : BS-1904*/
                                }
                                /*END : BS-2006*/
                                Contact newContact = new Contact();
                                Contact contactToBeUsed;
                                List<Contact> contactList = [
                                    SELECT Id, LastName, Email, FirstName, Salutation
                                    FROM Contact
                                    WHERE Email = :(String) registrationMap.get('accountEmail') AND AccountId = :existingCustomer.Id
                                ]; //BS-1862 : Added FirstName, Salutation to the query
                                List<User> userList = new List<User>();
                                if (contactList.isEmpty() == false) {
                                    userList = [
                                        SELECT Id
                                        FROM User
                                        WHERE
                                            ContactId = :contactList[0].Id
                                            AND Email = :(String) registrationMap.get('accountEmail')
                                            AND isPortalEnabled = TRUE
                                    ];
                                }
                                if (contactList.isEmpty() == false) {
                                    updateContact(existingCustomer, contactList[0], sp);
                                    contactToBeUsed = contactList[0];
                                } else {
                                    createContact(existingCustomer, newContact, sp);
                                    contactToBeUsed = newContact;
                                }

                                if (userList.isEmpty() == false) {
                                    updateUser(userList[0].Id);
                                } else if (existingCustomer.k_ARIS_Account_ID__c != null && String.isNotBlank(existingCustomer.k_B2B_Shop_Username__c)) {
                                    createUser(
                                        (String) existingCustomer.k_ARIS_Account_ID__c,
                                        (String) existingCustomer.Name,
                                        (String) contactToBeUsed.Id,
                                        (String) registrationMap.get('accountEmail'),
                                        (String) existingCustomer.k_B2B_Shop_Username__c,
                                        language //BS-1214
                                    );
                                }
                                return '';
                            } else {
                                Task customerTask = new Task();
                                customerTask.Subject = System.Label.B2B_Task_Existing_Customer_Subsegment_Missing_Subject;
                                customerTask.k_Activity_Brand__c = isSilhouetteLogin
                                    ? (B2B_Constants.SILHOUETTE_BRAND + ';' + B2B_Constants.EVIL_EYE_BRAND)
                                    : null;
                                handleTaskCreationAndSendEmail(registrationMap, existingCustomer, customerTask, sp, language, isSilhouetteLogin);
                                return B2B_Constants.SUBSEGMENT_ERROR;
                            }
                        }
                    } else {
                        Task customerTask = new Task();
                        handleTaskCreationAndSendEmail(registrationMap, existingCustomer, customerTask, sp, language, isSilhouetteLogin);
                        return System.Label.B2B_LOGIN_Account_Number_Not_Found;
                    }
                } else {
                    Task customerTask = new Task();
                    handleTaskCreationAndSendEmail(registrationMap, existingCustomer, customerTask, sp, language, isSilhouetteLogin);
                    return System.Label.B2B_LOGIN_Account_Number_Not_Found;
                }
            } else {
                Task customerTask = new Task();
                handleTaskCreationAndSendEmail(registrationMap, existingCustomer, customerTask, sp, language, isSilhouetteLogin);
                return System.Label.B2B_LOGIN_Account_Number_Not_Found;
            }
        } catch (Exception e) {
            B2B_LogUtils.createPersistLogAsync(e.getMessage(), 'B2B_Registration', B2B_LogUtils.LOG_TYPE_ERROR, e.getStackTraceString(), 'None');
            throw new AuraHandledException(System.Label.B2B_Login_Existing_User_Page_Error);
        }
    }

    /**
     * @description enabeling buyer account for existing user
     * @author Razvan Ficuta
     * @modified by Rahul P
     * @param  existingCustomer   account information about the existing customer
     * @param  buyer              buyer information required to enable the existing customer
     * @param  sp                 database savepoint used to rollback the changes if any issue shows up
     */
    public static void enableBuyerAccount(Account existingCustomer, BuyerAccount buyer, Savepoint sp) {
        try {
            if (buyer.BuyerId == null) {
                buyer.BuyerId = existingCustomer.Id;
            }
            buyer.Name = existingCustomer.Name;
            buyer.isActive = true;
            upsert buyer;
        } catch (Exception e) {
            Database.rollback(sp);
            B2B_LogUtils.createPersistLogAsync(e.getMessage(), 'B2B_Registration', B2B_LogUtils.LOG_TYPE_ERROR, e.getStackTraceString(), 'none');
            throw new AuraHandledException(System.Label.B2B_Login_Existing_User_Page_Error);
        }
    }

    /**
     * @description assinging the existing user to a buyer group
     * @author Razvan FicutaBrand__c
     * @modified by Chirag L (22-03-2023 18:05:55) as part of BS-712
     * @param  existingCustomer   account information about the existing customer
     * @param  sp                 database savepoint used to rollback the changes if any issue shows up
     */
    @SuppressWarnings('PMD.avoiddeeplynestedifstmts')
    public static void createBuyerGroupAssignment(Account existingCustomer, Savepoint sp) {
        // BS-712 Start
        try {
            // Fetching all Brand_to_Buyer_Group_Mapping records and storing into list
            List<Brand_to_Buyer_Group_Mapping__mdt> buyerGroupMetadataList = Brand_to_Buyer_Group_Mapping__mdt.getAll().values();
            Set<String> buyerGroupNameSet = new Set<String>();
            if (buyerGroupMetadataList.isEmpty() == false) {
                // Below Map:brandVsBuyerGroupMap will store List of Brand_to_Buyer_Group_Mapping records based on the brand
                Map<String, List<Brand_to_Buyer_Group_Mapping__mdt>> brandVsBuyerGroupMap = new Map<String, List<Brand_to_Buyer_Group_Mapping__mdt>>();

                // Iterating over the list of Brand_to_Buyer_Group_Mapping records to fill brandVsBuyerGroupMap
                for (Brand_to_Buyer_Group_Mapping__mdt buyerGroupMetadataObj : buyerGroupMetadataList) {
                    // If brand is already present as a key in brandVsBuyerGroupMap then adding the record as value into list
                    if (brandVsBuyerGroupMap.containsKey(buyerGroupMetadataObj.Brand__c)) {
                        brandVsBuyerGroupMap.get(buyerGroupMetadataObj.Brand__c).add(buyerGroupMetadataObj);
                    } else {
                        // If brand is not present as a key in brandVsBuyerGroupMap then putting the brand
                        // as key and List of Brand_to_Buyer_Group_Mapping record as value
                        brandVsBuyerGroupMap.put(buyerGroupMetadataObj.Brand__c, new List<Brand_to_Buyer_Group_Mapping__mdt>{ buyerGroupMetadataObj });
                    }
                    // Extracting and Storing the Buyer Group Names into buyerGroupNameSet
                    if (String.isNotBlank(buyerGroupMetadataObj.Buyer_Group_Name__c)) {
                        buyerGroupNameSet.add(buyerGroupMetadataObj.Buyer_Group_Name__c);
                    }
                }
                List<BuyerGroup> buyerGroupList = new List<BuyerGroup>();

                if (buyerGroupNameSet.isEmpty() == false) {
                    // Fetching BuyerGroup records based on Name presen in buyerGroupNameSet
                    buyerGroupList = [SELECT Id, Name FROM BuyerGroup WHERE Name IN :buyerGroupNameSet];
                }
                Map<String, Id> buyerGroupNameVsIdMap = new Map<String, Id>();

                // Iterating over buyerGroupList and filling the map:buyerGroupNameVsIdMap that contains
                // Buyer Group Name as key and Buyer Group Id as value
                for (BuyerGroup buyerGroupObj : buyerGroupList) {
                    buyerGroupNameVsIdMap.put(buyerGroupObj.Name, buyerGroupObj.Id);
                }

                if (brandVsBuyerGroupMap.isEmpty() == false && buyerGroupList.isEmpty() == false && buyerGroupNameVsIdMap.isEmpty() == false) {
                    List<BuyerGroupMember> buyerGroupMemberList = new List<BuyerGroupMember>();
                    List<String> brandsNameList = new List<String>();

                    // Checking if Account that requested guest access is to be enabled for Silhouette and evil eye both brands
                    if (
                        existingCustomer.k_Account_Status_Silhouette__c != null &&
                        existingCustomer.k_Account_Status_Silhouette__c.equalsIgnoreCase('1') &&
                        existingCustomer.Acct_Stat_EE__c != null &&
                        existingCustomer.Acct_Stat_EE__c.equalsIgnoreCase('1')
                    ) {
                        // If the above Account needs to be enabled for both brands then adding name of both brands into brandsNameList
                        brandsNameList.add(Bfl_Constant.SH_BRAND_FULL);
                        brandsNameList.add(Bfl_Constant.EE_BRAND_FULL);
                    } else if (
                        existingCustomer.k_Account_Status_Silhouette__c != null && existingCustomer.k_Account_Status_Silhouette__c.equalsIgnoreCase('1')
                    ) {
                        // If the above Account needs to be enabled for Silhouette brand then adding name of Silhouette brand into brandsNameList
                        brandsNameList.add(Bfl_Constant.SH_BRAND_FULL);
                    } else if (existingCustomer.Acct_Stat_EE__c != null && existingCustomer.Acct_Stat_EE__c.equalsIgnoreCase('1')) {
                        // If the above Account needs to be enabled for evil eye brand then adding name of evil eye brand into brandsNameList
                        brandsNameList.add(Bfl_Constant.EE_BRAND_FULL);
                    } else if (existingCustomer.B2B_Neubau_Account__c) {
                        // If the above Account needs to be enabled for Neubau brand then adding name of Neubau brand into brandsNameList
                        brandsNameList.add(Bfl_Constant.NB_BRAND_FULL);
                    }
                    // Invoking getBuyerGroupMembers() that will return list of all Buyer Group Memeber records that needs to be inserted into database
                    buyerGroupMemberList = getBuyerGroupMembers(existingCustomer, brandsNameList, brandVsBuyerGroupMap, buyerGroupNameVsIdMap); //BS-1964 removed country field parameter
                    if (buyerGroupMemberList.isEmpty() == false) {
                        // If list contains Buyer Group Members records then performing DML of insertion of Buyer Group Memebers
                        insert buyerGroupMemberList;
                    }
                }
            }
        } catch (Exception e) {
            // If any error/execption occures during the process then rolling back everything according to savePoint
            // Also, throwing exception
            Database.rollback(sp);
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_Registration', 'Insert Buyer Group Assignment Failed: ' + registrationMap);
            throw new AuraHandledException(System.Label.B2B_Login_Existing_User_Page_Error);
        }
        // BS-712 End
    }

    /**
     * BS-712
     * @description This method is used to get Buyer Group Members list based on brand
     * @author Chirag Lapasia
     * @param  existingCustomer             :   Current Account record that is in operation
     * @param  brandsNameList               :   List containing brands list
     * @param  brandVsBuyerGroupMap :   Map containing list of Brand_to_Buyer_Group_Mapping__mdt records according to brand
     * @param  buyerGroupNameVsIdMap        :   Map containg Buyer Group Name and it's Id
     * @return buyerGroupMemberList         :   Returns List containing Buyer Group Memebrs that needs to be created in database
     */
    public static List<BuyerGroupMember> getBuyerGroupMembers(
        Account existingCustomer,
        List<String> brandsNameList,
        Map<String, List<Brand_to_Buyer_Group_Mapping__mdt>> brandVsBuyerGroupMap,
        Map<String, Id> buyerGroupNameVsIdMap
    ) {
        List<BuyerGroupMember> buyerGroupMemberList = new List<BuyerGroupMember>();
        // Iterating over the obtained list of brand names and filling Buyer Group memebrs records into list
        if (brandsNameList.isEmpty() == false && brandVsBuyerGroupMap.isEmpty() == false) {
            for (String brandName : brandsNameList) {
                if (brandVsBuyerGroupMap.containsKey(brandName)) {
                    //Invoking getBuyerGroupMembersInstance() that will return list of Buyer Group Memebrs list containg instances
                    // of Buyer Group Memebrs with data filled into it's fields
                    List<BuyerGroupMember> buyerGroupMemebersInstanceList = getBuyerGroupMembersInstance(
                        existingCustomer,
                        brandVsBuyerGroupMap.get(brandName),
                        buyerGroupNameVsIdMap
                    ); //BS-1964 removed country field parameter
                    for (BuyerGroupMember buyerGroupMember : buyerGroupMemebersInstanceList) {
                        buyerGroupMemberList.add(buyerGroupMember);
                    }
                }
            }
        }
        return buyerGroupMemberList;
    }

    /**
     * BS-712
     * @description This method is used to get List of Buyer Group Memeber Instances from provided Buyer Group Map
     * @author Chirag Lapasia
     * @param  existingCustomer             :   Current Account record that is in operation
     * @param  brandToBuyerGroupList        :   List containing Brand_to_Buyer_Group_Mapping__mdt records
     * @param  buyerGroupNameVsIdMap        :   Map containg Buyer Group Name and it's Id
     * @return buyerGroupMemberList         :   Returns List containing Buyer Group Memebrs that needs to be created in database
     */
    public static List<BuyerGroupMember> getBuyerGroupMembersInstance(
        Account existingCustomer,
        List<Brand_to_Buyer_Group_Mapping__mdt> brandToBuyerGroupList,
        Map<String, Id> buyerGroupNameVsIdMap
    ) {
        List<BuyerGroupMember> buyerGroupMemberList = new List<BuyerGroupMember>();

        //Iterating over the obtained brandToBuyerGroupList, creating instances of Buyer Group Memebrs and adding them into buyerGroupMemberList
        for (Brand_to_Buyer_Group_Mapping__mdt brandToBuyerGroupMapping : brandToBuyerGroupList) {
            // If the country present on Brand_to_Buyer_Group_Mapping macthes with the country provided also, if the records are active then,
            // Creating buyer group memebr instace, putting the data into fields and adding the instance into list that to be returned.
            //BS-1964 added new checks
            if (
                brandToBuyerGroupMapping.Is_Active__c != null &&
                brandToBuyerGroupMapping.Is_Active__c == true &&
                String.isNotBlank(brandToBuyerGroupMapping.B2B_ERP_Pricebook__c) &&
                String.isNotBlank(existingCustomer.B2B_ERP_Pricebook__c) &&
                (brandToBuyerGroupMapping.B2B_ERP_Pricebook__c.equalsIgnoreCase(existingCustomer.B2B_ERP_Pricebook__c))
            ) {
                BuyerGroupMember buyerGroupMember = new BuyerGroupMember();
                buyerGroupMember.buyerId = existingCustomer.Id;
                buyerGroupMember.BuyerGroupId = buyerGroupNameVsIdMap.get(brandToBuyerGroupMapping.Buyer_Group_Name__c);
                buyerGroupMemberList.add(buyerGroupMember);
            }
        }
        return buyerGroupMemberList;
    }

    /**
     * @description creating a contact for existing user
     * @author Razvan Ficuta
     * @param  existingCustomer   account information about the existing customer
     * @param  existingContact    contact information about the existing customer
     * @param  sp                 database savepoint used to rollback the changes if any issue shows up
     */
    public static void updateContact(Account existingCustomer, Contact existingContact, Savepoint sp) {
        try {
            existingContact.AccountId = existingCustomer.Id;
            existingContact.B2B_Enabled_for_Partner_Portal__c = true; // BS-1838

            //BS-1862 : Assigning 'N/A' value to FirstName and Salutation field of contact if null or blank
            if (String.isBlank(existingContact.FirstName)) {
                existingContact.FirstName = B2B_Constants.NOT_APPLICABLE_VALUE;
            }
            if (String.isBlank(existingContact.Salutation)) {
                existingContact.Salutation = B2B_Constants.NOT_APPLICABLE_VALUE;
            }
            //BS-1862 : End

            update existingContact;
        } catch (Exception e) {
            Database.rollback(sp);
            B2B_LogUtils.createPersistLogAsync(e.getMessage(), 'B2B_Registration', B2B_LogUtils.LOG_TYPE_ERROR, e.getStackTraceString(), 'None');
            throw new AuraHandledException(System.Label.B2B_Login_Existing_User_Page_Error);
        }
    }

    /**
     * @description creating a contact for existing user
     * @author Razvan Ficuta
     * @param  existingCustomer   account information about the existing customer
     * @param  newContact         contact information about the existing customer
     * @param  sp                 database savepoint used to rollback the changes if any issue shows up
     */
    public static void createContact(Account existingCustomer, Contact newContact, Savepoint sp) {
        try {
            newContact.Salutation = B2B_Constants.NOT_APPLICABLE_VALUE;
            newContact.AccountId = existingCustomer.Id;
            newContact.FirstName = existingCustomer.Name;
            newContact.LastName = existingCustomer.Name;
            newContact.Email = (String) registrationMap.get('accountEmail');
            newContact.k_Function__c = 'Other';
            newContact.B2B_Enabled_for_Partner_Portal__c = true; //BS-1838

            //BS-1862 : Assigning 'N/A' value to FirstName field of contact if null or blank
            if (String.isBlank(newContact.FirstName)) {
                newContact.FirstName = B2B_Constants.NOT_APPLICABLE_VALUE;
            }
            //BS-1862 : End

            insert newContact;
        } catch (Exception e) {
            Database.rollback(sp);
            B2B_LogUtils.createPersistLogAsync(e.getMessage(), 'B2B_Registration', B2B_LogUtils.LOG_TYPE_ERROR, e.getStackTraceString(), 'none');
            throw new AuraHandledException(System.Label.B2B_Login_Existing_User_Page_Error);
        }
    }

    /**
     * @description creating an user for existing customer
     * @author Razvan Ficuta
     * @param  existingUserId   informations about the existing user id
     */
    @future
    public static void updateUser(String existingUserId) {
        try {
            System.resetPassword(existingUserId, true);
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_Registration', 'Update User Failed: ' + registrationMap);
        }
    }

    /**
     * @description creating an user for existing customer
     * @author Razvan Ficuta
     * @param  existingCustomerArisAccountId   informations about the existing customer aris account id
     * @param  existingCustomerName            informations about the existing customer name
     * @param  contactId                       informations about the existing contact id
     * @param  userEmail                       user email address
     * @param  userNickname                    user's nickname
     */
    @future
    public static void createUser(
        String existingCustomerArisAccountId,
        String existingCustomerName,
        String contactId,
        String userEmail,
        String userNickname,
        String language
    ) {
        if (language == B2B_Constants.ENGLISH_US) {
            language = B2B_Constants.EN_US;
        } //BS-1214

        Id profileIdNB = [SELECT Id FROM Profile WHERE Name = 'B2B Commerce User Neubau' LIMIT 1][0]?.Id;
        Id profileSH = [SELECT Id FROM Profile WHERE Name = 'B2B Commerce User Silhouette' LIMIT 1][0]?.Id;
        String organizationId = UserInfo.getOrganizationId();
        String dateString = String.valueof(Datetime.now()).replace(' ', '').replace(':', '').replace('-', '');
        String uniqueName = organizationId + dateString + Integer.valueOf(Math.rint(Math.random() * 1000000));

        Id profileOfUser;
        if (existingCustomerArisAccountId.contains('NB')) {
            profileOfUser = profileIdNB;
        } else {
            profileOfUser = profileSH;
        }
        try {
            User newUser = new User(
                UserName = userEmail + DateTime.now().millisecondGMT(),
                ProfileId = profileOfUser,
                LastName = existingCustomerName,
                Email = userEmail,
                CommunityNickname = userNickname,
                FederationIdentifier = userNickname,
                Alias = uniqueName.substring(18, 25),
                ContactId = contactId,
                emailencodingkey = 'UTF-8',
                languagelocalekey = language, //BS-1214
                localesidkey = language, //BS-1214
                timezonesidkey = 'Europe/Berlin'
            );
            insert newUser;
            System.resetPassword(newUser.Id, false);
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_Registration', 'Insert User Failed: ' + registrationMap);
        }
    }

    /**
     * @description send emails to user and customer support if user account number can't be found
     * @author Razvan Ficuta
     * @modified By Vishalsingh Gaur
     * @param  language           site language of the guest user.
     * @param  isSilhouetteLogin  login from Silhouette store
     * @param  sendOnlyToUser      Send only to user or both CS and CU
     */
    public static void sendEmailsToUserAndCustomerSupport(
        String language,
        Boolean isSilhouetteLogin,
        Boolean sendOnlyToUser,
        List<User> customerServiceUserList
    ) {
        EmailTemplate emailTemplateCS;
        EmailTemplate emailTemplateCU;
        if (isSilhouetteLogin) {
            //BS-1365
            for (EmailTemplate emailTemplate : [
                SELECT Id, Subject, Description, HtmlValue, DeveloperName, Body, Name
                FROM EmailTemplate
                WHERE Name IN ('B2B SH Get Access Error All Languages', 'B2B_ SH_INTERNAL_Issue registering_EN')
            ]) {
                if (emailTemplate.Name == 'B2B SH Get Access Error All Languages') {
                    emailTemplateCU = emailTemplate;
                } else if (emailTemplate.Name == 'B2B_ SH_INTERNAL_Issue registering_EN') {
                    emailTemplateCS = emailTemplate;
                }
            }
        } else {
            //BS-1457
            for (EmailTemplate emailTemplate : [
                SELECT Id, Subject, Description, HtmlValue, DeveloperName, Body, Name
                FROM EmailTemplate
                WHERE Name IN ('B2B NB Get Access Error All Languages', 'B2B_ NB_INTERNAL_Issue registering_EN')
            ]) {
                if (emailTemplate.Name == 'B2B NB Get Access Error All Languages') {
                    emailTemplateCU = emailTemplate;
                } else if (emailTemplate.Name == 'B2B_ NB_INTERNAL_Issue registering_EN') {
                    emailTemplateCS = emailTemplate;
                }
            }
        }
        /* Start BS-1976 */
        String defaultCustomerServiceName = isSilhouetteLogin
            ? System.Label.B2B_SH_DEFAULT_CUSTOMER_SERVICE_FULL_NAME
            : System.Label.B2B_NB_DEFAULT_CUSTOMER_SERVICE_FULL_NAME;
        emailTemplateCS.Body = emailTemplateCS.Body.replace('{!Receiving_User.Name}', defaultCustomerServiceName);
        /* End BS-1976 */

        emailTemplateCS.Body = emailTemplateCS.Body.replace('{!Account.AccountNumber}', (String) registrationMap.get('accountNumber'));
        emailTemplateCS.Body = emailTemplateCS.Body.replace('{!Account.Name}', (String) registrationMap.get('accountName'));
        emailTemplateCS.Body = emailTemplateCS.Body.replace('{!Account.BillingPostalCode}', (String) registrationMap.get('zipCode'));
        emailTemplateCS.Body = emailTemplateCS.Body.replace('{!Account.BillingCity}', (String) registrationMap.get('city'));
        emailTemplateCS.Body = emailTemplateCS.Body.replace('{!Account.Store_Country__c}', (String) registrationMap.get('countryName'));
        if (sendOnlyToUser) {
            sendEmail(emailTemplateCU, false, customerServiceUserList, isSilhouetteLogin); //BS-1528 Added customerServiceUserList parameter
        } else {
            if (registrationMap.get('accountEmail') != null) {
                sendEmail(emailTemplateCU, false, customerServiceUserList, isSilhouetteLogin); //BS-1528 Added customerServiceUserList parameter
            }
            sendEmail(emailTemplateCS, true, customerServiceUserList, isSilhouetteLogin); //BS-1528 Added customerServiceUserList parameter
        }
    }

    /**
     * @description creating a task in case existing customer account does not meet the requirements and sends email to user
     * @author Razvan Ficuta
     * @modefied by Vishalsingh Gaur
     * @param  existingCustomer   account information about the existing customer
     * @param  customerTask       task information about the existing customer details
     * @param  sp                 database savepoint used to rollback the changes if any issue shows up
     * @param  language           site language of the guest user.
     * @param  isSilhouetteLogin  login from Silhouette store
     */
    public static void handleTaskCreationAndSendEmail(
        Map<String, Object> registrationMap,
        Account existingCustomer,
        Task customerTask,
        Savepoint sp,
        String language,
        Boolean isSilhouetteLogin
    ) {
        String comment = getTaskComment(registrationMap, isSilhouetteLogin); //BS-1430
        List<User> customerServiceUserList = getCountrySpecificCustomerService(isSilhouetteLogin, registrationMap); //BS-1528
        sendEmailsToUserAndCustomerSupport(language, isSilhouetteLogin, false, customerServiceUserList); //BS-1528 Added customerServiceUserList parameter
        createTask(existingCustomer, customerTask, sp, comment, isSilhouetteLogin, customerServiceUserList);
        //BS-1430 > BS-1528 Added customerServiceUserList parameter
    }

    /**
     * @description Getting customer service as per user input country and brand
     * @author Jay I
     * @param  isSilhouetteLogin   login from Silhouette store
     * @param  getAccessInputMap   registrationForm JSON input from the LWC
     */
    public static List<User> getCountrySpecificCustomerService(Boolean isSilhouetteLogin, Map<String, Object> getAccessInputMap) {
        String currentStoreBrandName;
        List<User> customerServiceUserList = new List<User>();
        currentStoreBrandName = isSilhouetteLogin ? B2B_Constants.SILHOUETTE_EVIL_EYE : B2B_Constants.NEUBAU_STORE;

        List<B2B_Country_Specific_Preference_Setting__c> countrySpecificCSRecordList = [
            SELECT Id, B2B_Country__c, B2B_Customer_Service_Username__c, B2B_Language__c, B2B_Account_Brand__c
            FROM B2B_Country_Specific_Preference_Setting__c
            WHERE
                B2B_Country__c = :(String) getAccessInputMap.get('countryName')
                AND B2B_Account_Brand__c = :currentStoreBrandName
                AND B2B_Type__c = :TYPE_OF_COUNTRY_SPECIFIC_SETTING
        ];

        if (countrySpecificCSRecordList.isEmpty() == false) {
            customerServiceUserList = [SELECT Id, Username, Email FROM User WHERE Username = :countrySpecificCSRecordList[0].B2B_Customer_Service_Username__c];
        } //end outer if
        return customerServiceUserList;
    }

    /**
     * @description creating a task in case existing customer account does not meet the requirements
     * @author Razvan Ficuta
     * @param  existingCustomer   account information about the existing customer
     * @param  customerTask       task information about the existing customer details
     * @param  sp                 database savepoint used to rollback the changes if any issue shows up
     */
    public static void createTask(
        Account existingCustomer,
        Task customerTask,
        Savepoint sp,
        String comment,
        Boolean isSilhouetteLogin,
        List<User> customerServiceUserList
    ) {
        try {
            if (String.isBlank(customerTask.Subject)) {
                customerTask.Subject = existingCustomer.Id != null
                    ? TASK_SUBJECT_FOR_EXISTING_CUSTOMER_ISSUE + existingCustomer.k_ARIS_Account_ID__c
                    : System.Label.B2B_Task_Existing_Customer_Issue_Msg;
            }
            customerTask.WhatId = existingCustomer.Id != null ? existingCustomer.Id : null;
            customerTask.Description = comment; //BS-1430
            if (String.isBlank(customerTask.k_Activity_Brand__c)) {
                customerTask.k_Activity_Brand__c = isSilhouetteLogin ? B2B_Constants.SILHOUETTE_BRAND : B2B_Constants.NEUBAU_BRAND;
            }
            /* Start BS-1976 */
            String defaultCustomerServiceName = isSilhouetteLogin
                ? System.Label.B2B_SH_DEFAULT_CUSTOMER_SERVICE_FULL_NAME
                : System.Label.B2B_NB_DEFAULT_CUSTOMER_SERVICE_FULL_NAME;
            customerTask.OwnerId = customerServiceUserList.isEmpty()
                ? [SELECT Id FROM User WHERE Name = :defaultCustomerServiceName LIMIT 1][0]?.Id
                : customerServiceUserList[0].Id;
            /* End BS-1976 */
            /* Start : BS-1645 */
            customerTask.BFL_Event_Source__c = B2B_Constants.TASK_B2B_PARTNER_PORTAL;
            customerTask.Bfl_Task_Source__c = B2B_Constants.TASK_B2B_PARTNER_PORTAL;
            /* End : BS-1645 */
            insert customerTask;
        } catch (Exception e) {
            Database.rollback(sp);
            B2B_LogUtils.createPersistLogAsync(e.getMessage(), 'B2B_Registration', B2B_LogUtils.LOG_TYPE_ERROR, e.getStackTraceString(), 'none');
            throw new AuraHandledException(System.Label.B2B_Login_Existing_User_Page_Error);
        }
    }

    /**
     * BS-1430
     * @description getTaskComment
     * @author Jay I
     * @return   String
     * This method returns task comment which contains user input information which filled at the time of get access.
     */
    public static String getTaskComment(Map<String, Object> getAccessInputMap, Boolean isSilhouetteLogin) {
        String comment = '';
        List<String> labelParameterList = new List<String>();

        if (getAccessInputMap.isEmpty() == false) {
            labelParameterList.add((String) getAccessInputMap.get('accountNumber'));
            labelParameterList.add((String) getAccessInputMap.get('accountName'));
            labelParameterList.add((String) getAccessInputMap.get('zipCode'));
            labelParameterList.add((String) getAccessInputMap.get('city'));
        }
        if (isSilhouetteLogin == true) {
            comment = String.format(System.label.B2B_Task_Comment_For_Get_Access_Error_SH, labelParameterList);
        } else {
            comment = String.format(System.label.B2B_Task_Comment_For_Get_Access_Error_NB, labelParameterList);
        }
        return comment;
    } //end getTaskComment

    /**
     * @description reusable method to send an email based on Email Template
     * @author Razvan Ficuta
     * @modefied by Vishalsingh Gaur
     * @param  template           email template used by the email
     * @param  useCustomerSupportEmail  parameter used in case we need to send this to the customer suppport
     * @param customerServiceUserList list having details of customer service agent : BS-1976
     * @param isSilhouetteLogin Flag for SH/NB store : BS-1976
     */
    public static void sendEmail(EmailTemplate template, Boolean useCustomerSupportEmail, List<User> customerServiceUserList, Boolean isSilhouetteLogin) {
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        String customerSupportEmail;
        if (useCustomerSupportEmail) {
            //BS-1528
            if (customerServiceUserList.isEmpty() == false) {
                customerSupportEmail = customerServiceUserList[0].Email;
            } else {
                /* Start : BS-1976 */
                String defaultCustomerServiceName = isSilhouetteLogin
                    ? System.Label.B2B_SH_DEFAULT_CUSTOMER_SERVICE_FULL_NAME
                    : System.Label.B2B_NB_DEFAULT_CUSTOMER_SERVICE_FULL_NAME;
                customerSupportEmail = [SELECT Id, Email FROM User WHERE Name = :defaultCustomerServiceName LIMIT 1][0]?.Email;

                /* End : BS-1976 */
            } //end if else
            message.toAddresses = new List<String>{ customerSupportEmail };
            message.setSubject(template.Subject);
            message.setPlainTextBody(template.Body);
        } else {
            message.toAddresses = new List<String>{ (String) registrationMap.get('accountEmail') };
            message.setTemplateId(template.Id);
        }

        message.setTargetObjectId(UserInfo.getUserId());
        message.setSenderDisplayName('Company Support');
        message.setReplyTo('no-reply@company.com');
        message.setTreatTargetObjectAsRecipient(false);
        message.setSaveAsActivity(false);
        Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage>{ message };
        Messaging.SendEmailResult[] results;
        //Added check as a part of BS-1777
        if (message.toAddresses.size() > 0) {
            results = Messaging.sendEmail(messages);
        }
        if (!results[0].success) {
            B2B_LogUtils.createPersistLogAsync(results[0].errors[0].message, 'B2B_Registration', B2B_LogUtils.LOG_TYPE_ERROR, 'none', 'none');
            throw new AuraHandledException(System.Label.B2B_Login_Existing_User_Page_Error);
        }
    }

    /**
     * BS-1850
     * @description getAccountEmail
     * @author Sachin V
     * @return   String
     * This method returns account email on which get access email is sent.
     */
    @AuraEnabled
    public static String getAccountEmail(String registrationForm, Boolean isSilhouetteLogin) {
        String email;
        registrationMap = (Map<String, Object>) JSON.deserializeUntyped(registrationForm);
        List<Account> existingCustomerList = new List<Account>();
        if (isSilhouetteLogin) {
            existingCustomerList = [
                SELECT Id, k_Email__c
                FROM Account
                WHERE
                    (k_Account_No__c = :(String) registrationMap.get('accountNumber')
                    OR k_B2B_Shop_Username__c = :(String) registrationMap.get('accountNumber'))
                    AND Store_Country__c = :(String) registrationMap.get('countryName')
                LIMIT 1
            ];
        } else {
            existingCustomerList = [
                SELECT Id, k_Email__c
                FROM Account
                WHERE
                    k_Account_No__c = :(String) registrationMap.get('accountNumber')
                    OR k_B2B_Shop_Username__c = :(String) registrationMap.get('accountNumber')
                LIMIT 1
            ];
        }
        if (existingCustomerList.isEmpty() == false) {
            email = existingCustomerList[0].k_Email__c;
        }
        return email;
    }

    /**
     * BS-2007
     * @description register Account as Buyer and updates B2B_Is_Not_Buyer_Portal_Enabled_User__c
     *              checkbox on Account
     * @author Vishal Gaur
     * @param  accountId   Account Id
     */
    @AuraEnabled
    public static String registerAsBuyer(String accountId) {
        List<Account> accountList = [
            SELECT
                Id,
                Name,
                Brand__c,
                k_Email__c,
                IsBuyer,
                k_Stage__c,
                k_Account_No__c,
                B2B_Vision_Sensation__c,
                B2B_Sonnenverglasung__c,
                k_ARIS_Account_ID__c,
                k_Customer_Status__c,
                k_Account_Status_Silhouette__c,
                Acct_Stat_EE__c,
                B2B_Neubau_Account__c,
                k_B2B_Shop_Username__c,
                k_Account_Status_Neubau__c,
                Store_Country__c,
                B2B_ERP_Pricebook__c
            FROM Account
            WHERE Id = :accountId
            LIMIT 1
        ];
        if (accountList.isEmpty() == false) {
            Savepoint sp = Database.setSavepoint();
            try {
                BuyerAccount buyer = new BuyerAccount();
                enableBuyerAccount(accountList[0], buyer, sp);
                createBuyerGroupAssignment(accountList[0], sp);
                Account accountObj = new Account();
                accountObj.Id = accountList[0].Id;
                accountObj.B2B_Is_Not_Buyer_Portal_Enabled_User__c = false;
                update accountObj;
                return String.valueOf(true);
            } catch (Exception error) {
                Database.rollback(sp);
                return error.getMessage();
            }
        }
        return System.label.B2B_Something_Went_Wrong;
    }
}
