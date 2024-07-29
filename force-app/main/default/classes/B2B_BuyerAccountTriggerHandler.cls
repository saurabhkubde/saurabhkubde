/**
 * @author Razvan Ficuta
 * @email razvan.ficuta@jpard.com
 * @created date 2022-07-13 11:00:00
 * @modify date 2022-07-13 11:38:00
 * @desc this class will be used as a Trigger Handler for BuyerAccount
 */
public without sharing class B2B_BuyerAccountTriggerHandler {
    public static Boolean skipTriggerExcecution = false;
    /**
     * @description creating an user for existing customer
     * @author Razvan Ficuta
     * @param  newList   BuyerAccount list retrieved from Trigger
     */
    public void onBeforeInsert(List<BuyerAccount> newList) {
        checkBuyerAccountConditions(newList);
    }
    /**
     * @description creating an user for existing customer
     * @author Razvan Ficuta
     * @param  newList   BuyerAccount list retrieved from Trigger
     */
    public static void checkBuyerAccountConditions(List<BuyerAccount> newList) {
        Set<Id> accountId = new Set<Id>();
        for (BuyerAccount ba : newList) {
            if (ba.BuyerId != null) {
                accountId.add(ba.BuyerId);
            }
        }

        Map<ID, Account> buyerToAccount = new Map<ID, Account>(
            [SELECT Id, B2B_Neubau_Account__c, k_Customer_Status__c, k_Stage__c, CSG_SubSeg_EE__c, SH_Subsegment__c FROM Account WHERE Id IN :accountId]
        );

        for (BuyerAccount ba : newList) {
            Account specificBuyerAccount = buyerToAccount.get(ba.BuyerId);

            Boolean valid = true;
            if (specificBuyerAccount.B2B_Neubau_Account__c == true) {
                if (specificBuyerAccount.k_Stage__c != 'Account' || specificBuyerAccount.k_Customer_Status__c == '0') {
                    valid = false;
                }
            } else {
                if (
                    specificBuyerAccount.k_Stage__c != 'Account' ||
                    specificBuyerAccount.k_Customer_Status__c == '0' ||
                    (String.isEmpty(specificBuyerAccount.CSG_SubSeg_EE__c) && String.isEmpty(specificBuyerAccount.SH_Subsegment__c))
                ) {
                    valid = false;
                }
            }

            if (valid == false) {
                ba.addError('Error from trigger');
            }
        }
    }
}
