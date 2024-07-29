/**
 * @author Septimiu Dumitru
 * @email septimiu.dumitru@jpard.com
 * @created date 2022-07-07 11:00:00
 * @modify date 2022-07-07 18:10:00
 * @desc this class will reset the requested user password
 */

public with sharing class B2B_CustomResetPassword {
    /**
     * @description querying the account and reseting user password
     * @author Septimiu Dumitru
     * @param  userName   userName input from the LWC
     */
    @AuraEnabled
    public static String getAccountByUsername(String userName) {
        User userObj = new User(); //BS-1852
        try {
            B2B_WithoutSharingController controller = new B2B_WithoutSharingController();
            String returnedAccountId = controller.getAccountByUsername(userName);
            if (String.isNotBlank(returnedAccountId)) {
                userObj = controller.getUserByAccount(returnedAccountId); //BS-1852
                String userToResetId = userObj.Id; //BS-1852
                controller.resetUserPassword(userToResetId);
            }
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_CustomResetPassword', Label.B2B_LOGIN_Generic_Error);
            throw new AuraHandledException(e.getMessage());
        }
        return userObj.Email; //BS-1852
    }

    @TestVisible
    private without sharing class B2B_WithoutSharingController {
        @TestVisible
        private String getAccountByUsername(String userName) {
            return [SELECT Id, Name, k_B2B_Shop_Username__c FROM Account WHERE k_B2B_Shop_Username__c = :userName LIMIT 1].Id;
        }

        @TestVisible
        private User getUserByAccount(String accountNumber) {
            return [SELECT Id, Contact.AccountId, Email FROM User WHERE Contact.AccountId = :accountNumber LIMIT 1]; //BS-1852
        }

        @TestVisible
        private void resetUserPassword(String userToResetId) {
            System.resetPassword(userToResetId, true);
        }
    }
}
