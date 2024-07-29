/**
 * @description : This class handles the insertion of BuyerGroupMember and creates related records
 * @author : Soumyakant Pandya
 * @email : soumyakant.pandya@theblueflamelabs.com
 * Created as part of BS-1589
 */
public with sharing class B2B_BuyerGroupMemberTriggerHandler {
    /**
     * BS-1589
     * @description This method is used to control the sequence of function calls depending upon the triggering event
     * @author Soumyakant Pandya
     */
    public static void runBuyerGroupMemberTrigger() {
        if (Trigger.isInsert && Trigger.isAfter) {
            onAfterInsert((List<BuyerGroupMember>) Trigger.new);
        }
    }

    /**
     * BS-1589
     * @description This method is used to handle the after insert of BuyerGroupMember
     * @author Soumyakant Pandya
     * @param newBuyerGroupMemberList : This List containing the new records which were commit to the backend.
     */
    public static void onAfterInsert(List<BuyerGroupMember> newBuyerGroupMemberList) {
        B2B_BuyerGroupMemberTriggerHelper.createMyShopPreference(newBuyerGroupMemberList);
    }
}
