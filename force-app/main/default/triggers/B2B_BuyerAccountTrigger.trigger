/**
 * @author Razvan Ficuta
 * @email razvan.ficuta@jpard.com
 * @created date 2022-07-13 11:00:00
 * @modify date 2022-07-13 11:38:00
 * @desc this class will be used as a Trigger for BuyerAccount
 */
trigger B2B_BuyerAccountTrigger on BuyerAccount(before insert, before update, before delete, after insert, after update) {
    B2B_BuyerAccountTriggerHandler handler = new B2B_BuyerAccountTriggerHandler();

    if (Trigger.isBefore) {
        if (Trigger.isInsert) {
            if (B2B_BuyerAccountTriggerHandler.skipTriggerExcecution == false) {
                handler.onBeforeInsert(Trigger.new);
            }
        }
        // else if(Trigger.isUpdate) {
        //     handler.onBeforeUpdate(Trigger.new, Trigger.newMap, Trigger.oldMap);

        // }
        // else if(Trigger.isDelete) {
        //     handler.onBeforeDelete(Trigger.oldMap);
        // }
    }
    // else if(Trigger.isAfter) {
    //     if(Trigger.isInsert) {
    //         handler.onAfterInsert(Trigger.newMap, Trigger.new);

    //     }
    //     else if(Trigger.isUpdate){
    //         handler.onAfterUpdate(Trigger.newMap, Trigger.oldMap, Trigger.new);

    //     }
    // }
}
