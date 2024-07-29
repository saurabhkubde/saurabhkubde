/**
 * @author : Soumyakant Pandya
 * @email : soumyakant.pandyaa@theblueflamelabs.com
 * @description : This trigger has been developed as part of BS-1589 in order to execute functions on DML operations performed on standard BuyerGroupMember Object
 **/
trigger B2B_BuyerGroupMemberTrigger on BuyerGroupMember(after insert) {
    B2B_BuyerGroupMemberTriggerHandler.runBuyerGroupMemberTrigger();
}
