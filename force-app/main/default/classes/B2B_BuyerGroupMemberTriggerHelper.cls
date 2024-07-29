/**
 * @description : This class handles the insertion of BuyerGroupMember and creates related records
 * @author : Soumyakant Pandya
 * @email : soumyakant.pandya@theblueflamelabs.com
 * Created as part of BS-1589
 */
public with sharing class B2B_BuyerGroupMemberTriggerHelper {
    /**
     * BS-1589
     * @description This method is used to create the records of My_B2B_Shop_Preference__c for accounts which do not have any associated shop preference setting records.
     * @author Soumyakant Pandya
     * @param newBuyerGroupMemberList : This List contains the records which were inserted for the BuyerGroupMember.
     */
    public static void createMyShopPreference(List<BuyerGroupMember> newBuyerGroupMemberList) {
        Set<Id> accountIdSet = new Set<Id>();
        List<My_B2B_Shop_Preference__c> myShopPreferenceList = new List<My_B2B_Shop_Preference__c>();
        List<My_B2B_Shop_Preference__c> myShopPreferenceInsertList = new List<My_B2B_Shop_Preference__c>();

        for (BuyerGroupMember buyerGroupMemberObj : newBuyerGroupMemberList) {
            accountIdSet.add(buyerGroupMemberObj.BuyerId);
        }

        myShopPreferenceList = new B2B_SystemContextClass().getMyShopPreferenceRecords(accountIdSet);

        if (myShopPreferenceList.isEmpty() == false) {
            for (My_B2B_Shop_Preference__c shopPreferenceObj : myShopPreferenceList) {
                accountIdSet.remove(shopPreferenceObj.B2B_Account__c);
            }
        }

        if (accountIdSet.isEmpty() == false) {
            for (Id accountId : accountIdSet) {
                My_B2B_Shop_Preference__c newShopPreferenceSettingObj = new My_B2B_Shop_Preference__c();
                newShopPreferenceSettingObj.B2B_Account__c = accountId;
                myShopPreferenceInsertList.add(newShopPreferenceSettingObj);
            }
        }
        new B2B_SystemContextClass().insertMyShopPreferenceRecord(myShopPreferenceInsertList);
    }

    /**
     * @description : This class performs DML operations in System context (Use case : For Guest user from Registration / Get Access flow)
     * @author : Soumyakant Pandya
     * Created as part of BS-1589
     */
    @TestVisible
    private without sharing class B2B_SystemContextClass {
        /**
         * BS-1589
         * @description This method is used query on My_B2B_Shop_Preference__c for account which were added in BuyerGroup.
         * @author Soumyakant Pandya
         * @param newBuyerGroupMemberList : This List contains the records which were inserted for the BuyerGroupMember.
         */
        @TestVisible
        private List<My_B2B_Shop_Preference__c> getMyShopPreferenceRecords(Set<Id> accountIdSet) {
            return [SELECT Id, B2B_Account__c FROM My_B2B_Shop_Preference__c WHERE B2B_Account__c IN :accountIdSet];
        }

        /**
         * BS-1589
         * @description This method is used insert the My_B2B_Shop_Preference__c records that needs to created
         * @author Soumyakant Pandya
         * @param myShopPreferenceInsertList : This List contains the records that to be needs inserted for My_B2B_Shop_Preference__c .
         */
        @TestVisible
        private void insertMyShopPreferenceRecord(List<My_B2B_Shop_Preference__c> myShopPreferenceInsertList) {
            insert myShopPreferenceInsertList;
        }
    }
}
