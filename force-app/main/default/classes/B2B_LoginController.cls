/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-06-23 15:18:00
 * @modify date 2022-06-27 17:33:00
 * @desc this class will provide the log in functionality based on the provided account number
 */

public with sharing class B2B_LoginController {
    /**
     * @description login description
     * @author Matthias Lindner
     * @param  accountNumber accountNumber input form the user
     * @param  password      password input from the user
     * @param  communityId   current communityId
     * @return               returns the url for the logged in user
     */
    @AuraEnabled
    public static String login(String accountNumber, String password, String communityId, String language) {
        Pagereference ref;
        String username;
        Boolean accountUsername; //BS-1317

        try {
            B2B_WithoutSharingController controller = new B2B_WithoutSharingController();
            accountUsername = controller.getAccountUsernameByAccountNumber(accountNumber); //BS-1317
            username = getUsernameByAccountNumber(accountNumber);

            //BS-1662 : Added a logic to check whether account status is active for Neubau Store
            List<Webstore> storeList = new List<WebStore>();
            Webstore store = B2B_Utils.getWebstoreByCommunityId(communityId);
            if (store != null) {
                storeList.add(store);
            } else {
                throw new B2B_CustomLoginException(System.Label.B2B_LOGIN_Generic_Error);
            }
            Account account;
            List<Account> accountList = new List<Account>();
            try {
                account = controller.getAccountByAccountNumber(accountNumber);
            } catch (Exception e) {
                B2B_CommerceLog__c commerceLog = B2B_LogUtils.createIntegrationLog(
                    null,
                    'Username: ' +
                    accountNumber +
                    ', Error: ' +
                    e.getMessage(),
                    'B2B_LoginController',
                    null,
                    null
                ); //BS-1861
                insert commerceLog;
                throw new B2B_CustomLoginException(System.Label.get(null, B2B_Constants.ERROR_LABEL_NAME, language)); //BS-1861
            }
            if (account != null) {
                accountList.add(account);
            }
            if (storeList.isEmpty() == false && storeList[0].Name.contains(B2B_Constants.NEUBAU_STORE) && accountList.isEmpty() == false) {
                if (
                    accountList[0].k_Account_Status_Neubau__c != null &&
                    (accountList[0].k_Account_Status_Neubau__c.equalsIgnoreCase(B2B_Constants.NEUBAU_ACCOUNT_STATUS_INACTIVE) ||
                    accountList[0].k_Account_Status_Neubau__c.equalsIgnoreCase(B2B_Constants.NEUBAU_ACCOUNT_STATUS_INACTIVE_API_NAME))
                ) {
                    return String.valueOf(false);
                }
            }
            //BS-1662 : End

            isAccountBlockedForLogin(accountNumber, communityId);
            ref = Site.login(username, password, '/');
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_LoginController', accountNumber); //BS-1861
            if (accountUsername == true) {
                /* START: BS-1861 */
                if (
                    e.getMessage().equalsIgnoreCase(System.Label.B2B_LOGIN_Silhouette_Account_Blocked) ||
                    e.getMessage().equalsIgnoreCase(System.Label.B2B_LOGIN_Neubau_Account_Blocked)
                ) {
                    throw new AuraHandledException(e.getMessage());
                } else {
                    throw new AuraHandledException(System.Label.get(null, B2B_Constants.ERROR_LABEL_NAME, language)); //BS-1625
                }
                /* END: BS-1861 */
            } else {
                throw new AuraHandledException(e.getMessage());
            }
        }

        return ref.getUrl();
    }

    /**
     * @author Matthias Lindner
     * @param  accountNumber accountNumber description
     * @return               returns the username from the given account number
     */
    @TestVisible
    private static String getUsernameByAccountNumber(String accountNumber) {
        if (String.isBlank(accountNumber)) {
            throw new B2B_CustomLoginException(System.Label.B2B_LOGIN_Account_Number_Error);
        }

        try {
            B2B_WithoutSharingController controller = new B2B_WithoutSharingController();
            return controller.getUsernameByAccountNumber(accountNumber);
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_LoginController', accountNumber); //BS-1861
            throw new B2B_CustomLoginException(System.Label.B2B_LOGIN_Generic_Error);
        }
    }

    /**
     * @description checks if a given account is blocked or not
     * @author Matthias Lindner
     * @param  accountNumber accountNumber
     * @param  communityId   communityId
     */
    @TestVisible
    private static void isAccountBlockedForLogin(String accountNumber, String communityId) {
        Webstore store = B2B_Utils.getWebstoreByCommunityId(communityId);

        if (store == null) {
            throw new B2B_CustomLoginException(System.Label.B2B_LOGIN_Generic_Error);
        }

        B2B_WithoutSharingController controller = new B2B_WithoutSharingController();
        Account acc;

        try {
            acc = controller.getAccountByAccountNumber(accountNumber);
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_LoginController', 'Account number: ' + accountNumber);
            throw new B2B_CustomLoginException(System.Label.B2B_LOGIN_Generic_Error);
        }

        if (store.Name.contains('Silhouette')) {
            if (acc.k_Customer_Status__c == '0') {
                throw new B2B_CustomLoginException(System.Label.B2B_LOGIN_Silhouette_Account_Blocked);
            }
        } else if (store.Name.contains('Neubau')) {
            if (acc.k_Customer_Status__c == '0') {
                throw new B2B_CustomLoginException(System.Label.B2B_LOGIN_Neubau_Account_Blocked);
            }
        } else {
            throw new B2B_CustomLoginException(System.Label.B2B_LOGIN_Generic_Error);
        }
    }

    @TestVisible
    private without sharing class B2B_WithoutSharingController {
        @TestVisible
        private String getUsernameByAccountNumber(String accountNumber) {
            return [SELECT Username FROM User WHERE Contact.Account.k_B2B_Shop_Username__c = :accountNumber LIMIT 1]?.Username;
        }

        @TestVisible
        private Account getAccountByAccountNumber(String accountNumber) {
            //BS-1662 : Added k_Account_Status_Neubau__c into query
            return [
                SELECT Id, Name, k_Customer_Status__c, CSG_SubSeg_EE__c, SH_Subsegment__c, k_Account_Status_Neubau__c
                FROM Account
                WHERE k_B2B_Shop_Username__c = :accountNumber
                LIMIT 1
            ];
        }
        /*BS-1317 
          Check if the Account Number Exists in the Account  
        */
        @TestVisible
        private Boolean getAccountUsernameByAccountNumber(String accountNumber) {
            List<Account> accountList = [SELECT k_B2B_Shop_Username__c FROM Account WHERE k_B2B_Shop_Username__c = :accountNumber LIMIT 1];
            if (accountList.isEmpty() == false) {
                return true;
            } else {
                return false;
            }
        }
    }
    private class B2B_CustomLoginException extends Exception {
    }
}
