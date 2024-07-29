@IsTest
public with sharing class B2B_CustomResetPasswordTest {
    @SuppressWarnings('PMD.debugsshoulduselogginglevel')
    @IsTest
    public static void testGetAccountByUsername() {
        B2B_CustomResetPassword.B2B_WithoutSharingController controller = new B2B_CustomResetPassword.B2B_WithoutSharingController();

        try {
            B2B_CustomResetPassword.getAccountByUsername('tstUser');
        } catch (Exception e) {
            System.debug('Error when querying account: ' + e.getMessage());
        }

        User commerceUser = B2B_TestDataFactory.createInsertCommerceUser();
        B2B_CustomResetPassword.getAccountByUsername('tstUser');
        String accountId = [SELECT Id, k_B2B_Shop_Username__c FROM Account WHERE k_B2B_Shop_Username__c = 'tstUser' LIMIT 1].Id;

        System.assertEquals(accountId, controller.getAccountByUsername('tstUser'), 'The method should return the correct Account');
        System.assertEquals(commerceUser.Id, (controller.getUserByAccount(accountId)).Id, 'The method should return the correct User'); //BS-1852
    }
}
