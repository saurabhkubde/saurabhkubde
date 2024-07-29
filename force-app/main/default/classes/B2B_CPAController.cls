/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-08-15 14:17:21
 * @modify date 2022-08-15 14:17:21
 * @desc controller class for the contact point address component in the my account area
 */
public without sharing class B2B_CPAController {
    /**
     * @description getContactPointAddresses description
     * @author Matthias Lindner
     * @return   return all contact point addresses for the logged in users account
     */
    @AuraEnabled(cacheable=false)
    public static List<ContactPointAddress> getContactPointAddresses() {
        Id accountId = B2B_Utils.getAccountIdByCurrentUser();
        return [
            SELECT Id, Name, toLabel(AddressType), IsDefault, Street, State, Country, City, PostalCode
            FROM ContactPointAddress
            WHERE ParentId = :accountId
        ];
    }

    /**
     * @description getAccountAddressChange description
     * @author Matthias Lindner
     * @return   return if the current users account has a pending address change
     */
    @AuraEnabled(cacheable=false)
    public static Boolean getAccountAddressChange() {
        return [SELECT B2B_Requested_Address_Change__c FROM Account WHERE Id IN (SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId()) LIMIT 1]
        .B2B_Requested_Address_Change__c;
    }

    /**
     * @description handleAddressChangeRequest description
     * @author Rahul P
     * @return   String
     */
    @AuraEnabled
    public static String handleAddressChangeRequest(Map<String, Object> addressChangeInputMap, String currentLoggedInUserId, Boolean isSilhouetteLogin) {
        String message;
        try {
            if (!addressChangeInputMap.isEmpty() && String.isNotBlank(currentLoggedInUserId)) {
                String brandValue;
                String taskComments = getTaskComment(addressChangeInputMap);
                Id customerServiceAgent;
                Boolean isCsePresent = false;
                List<User> userList = [
                    SELECT Id, AccountId, ContactId, Contact.Account.B2B_SH_EE_Customer_Service_Agent__c, Contact.Account.B2B_NB_Customer_Service_Agent__c
                    FROM User
                    WHERE Id = :currentLoggedInUserId
                    LIMIT 1
                ];
                if (!userList.isEmpty() && isSilhouetteLogin && userList[0].Contact.Account.B2B_SH_EE_Customer_Service_Agent__c != null) {
                    isCsePresent = true;
                    brandValue = Bfl_Constant.SH_BRAND_SHORT + ';' + Bfl_Constant.EE_BRAND_SHORT;
                    customerServiceAgent = userList[0].Contact.Account.B2B_SH_EE_Customer_Service_Agent__c;
                } else if (!userList.isEmpty() && !isSilhouetteLogin && userList[0].Contact.Account.B2B_NB_Customer_Service_Agent__c != null) {
                    isCsePresent = true;
                    brandValue = Bfl_Constant.NB_BRAND_SHORT;
                    customerServiceAgent = userList[0].Contact.Account.B2B_NB_Customer_Service_Agent__c;
                }
                if (!userList.isEmpty() && isCsePresent) {
                    Task taskObj = new Task();
                    taskObj.Subject = System.label.B2B_Task_Subject_Address_Change;
                    taskObj.k_Activity_Brand__c = brandValue;
                    taskObj.Description = taskComments;
                    taskObj.ActivityDate = System.today().addDays(7);
                    taskObj.Priority = 'High';
                    taskObj.OwnerId = customerServiceAgent;
                    taskObj.WhatId = userList[0].AccountId;
                    taskObj.WhoId = userList[0].ContactId;
                    /* Start : BS-1645 */
                    taskObj.BFL_Event_Source__c = B2B_Constants.TASK_B2B_PARTNER_PORTAL;
                    taskObj.Bfl_Task_Source__c = B2B_Constants.TASK_B2B_PARTNER_PORTAL;
                    /* End : BS-1645 */

                    insert taskObj;
                    message = Bfl_Constant.SUCCESS;
                } else {
                    message = System.Label.B2B_Something_Went_Wrong;
                }
            } else {
                message = System.Label.B2B_Something_Went_Wrong;
            }
        } catch (Exception e) {
            message = System.Label.B2B_Something_Went_Wrong;
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_CPAController', Label.B2B_LOGIN_Generic_Error);
        }
        return message;
    }

    /**
     * @description getTaskComment
     * @author Rahul P
     * @return   String
     * this method returns the respective comment according to the request type.
     */
    public static String getTaskComment(Map<String, Object> addressChangeInputMap) {
        String comment = '';
        List<String> labelParameterList = new List<String>();
        if (!addressChangeInputMap.isEmpty() && (String) addressChangeInputMap.get('requestType') == 'addShippingAddress') {
            labelParameterList.add((String) addressChangeInputMap.get('AddAddress_ShippingName'));
            labelParameterList.add((String) addressChangeInputMap.get('AddAddress_ShippingStreet'));
            labelParameterList.add((String) addressChangeInputMap.get('AddAddress_PostalCode'));
            labelParameterList.add((String) addressChangeInputMap.get('AddAddress_City'));
            labelParameterList.add(
                (String) addressChangeInputMap.get('AddAddress_Province') != null ? (String) addressChangeInputMap.get('AddAddress_Province') : ''
            );
            labelParameterList.add((String) addressChangeInputMap.get('AddAddress_Country'));
            labelParameterList.add(
                (String) addressChangeInputMap.get('AddAddress_Comment') != null ? (String) addressChangeInputMap.get('AddAddress_Comment') : ''
            );
            comment = String.format(System.label.B2B_Task_Comment_For_Add_Shipping_Address_Request, labelParameterList);
        } else if (!addressChangeInputMap.isEmpty() && (String) addressChangeInputMap.get('requestType') == 'changeBillingAddress') {
            if ((String) addressChangeInputMap.get('EditBillingAddress_Options') == 'addBillingAddress') {
                labelParameterList.add((String) addressChangeInputMap.get('EditBillingAddress_ChangeRequestReason'));
                comment = String.format(System.label.B2B_Task_Comment_For_Add_Billing_Address_Request, labelParameterList);
            } else if ((String) addressChangeInputMap.get('EditBillingAddress_Options') == 'editBillingAddress') {
                labelParameterList.add((String) addressChangeInputMap.get('editAddressName'));
                labelParameterList.add((String) addressChangeInputMap.get('EditBillingAddress_ChangeRequestReason'));
                comment = String.format(System.label.B2B_Task_Comment_For_Edit_Billing_Address, labelParameterList);
            } else if ((String) addressChangeInputMap.get('EditBillingAddress_Options') == 'deleteBillingAddress') {
                labelParameterList.add((String) addressChangeInputMap.get('editAddressName'));
                labelParameterList.add((String) addressChangeInputMap.get('EditBillingAddress_ChangeRequestReason'));
                comment = String.format(System.label.B2B_Task_Comment_To_Delete_Billing_Address, labelParameterList);
            }
        } else if (!addressChangeInputMap.isEmpty() && (String) addressChangeInputMap.get('requestType') == 'deleteShippingAddress') {
            labelParameterList.add((String) addressChangeInputMap.get('editAddressName'));
            comment = String.format(System.label.B2B_Task_Comments_To_Delete_Shipping_Address, labelParameterList);
        } else if (!addressChangeInputMap.isEmpty() && (String) addressChangeInputMap.get('requestType') == 'editShippingAddressRequest') {
            labelParameterList.add((String) addressChangeInputMap.get('editAddressName'));
            labelParameterList.add((String) addressChangeInputMap.get('EditShippingAddress_Street'));
            labelParameterList.add((String) addressChangeInputMap.get('EditShippingAddress_PostalCode'));
            labelParameterList.add((String) addressChangeInputMap.get('EditShippingAddress_City'));
            labelParameterList.add(
                (String) addressChangeInputMap.get('EditShippingAddress_Province') != null
                    ? (String) addressChangeInputMap.get('EditShippingAddress_Province')
                    : ''
            );
            labelParameterList.add((String) addressChangeInputMap.get('EditShippingAddress_Country'));
            labelParameterList.add(
                (String) addressChangeInputMap.get('EditShippingAddress_Comment') != null
                    ? (String) addressChangeInputMap.get('EditShippingAddress_Comment')
                    : ''
            );
            comment = String.format(System.label.B2B_Task_Comment_For_Edit_Shipping_Address, labelParameterList);
        }
        return comment;
    }
}
