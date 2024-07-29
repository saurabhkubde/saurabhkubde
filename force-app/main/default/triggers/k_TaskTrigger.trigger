trigger k_TaskTrigger on Task(before update, before delete, after delete, after insert, before insert, after update, after undelete) {
    if (Trigger.isBefore) {
        if (Trigger.isUpdate) {
            k_TaskTriggerHandler.populateAccount(Trigger.new);
            k_TaskTriggerHandler.onBeforeUpdate(Trigger.newMap, Trigger.oldMap);
        }
        if (Trigger.isDelete) {
            k_TaskTriggerHandler.onBeforeDelete(Trigger.newMap, Trigger.oldMap);
        }
        if (Trigger.isInsert) {
            k_TaskTriggerHandler.populateAccount(Trigger.new);
            k_TaskTriggerHandler.populateTaskSourceField(Trigger.new); //SC-196
        }
    }
    if (Trigger.isAfter) {
        if (Trigger.isInsert) {
            //k_TaskTriggerHandler.onAfterInsert(Trigger.new);
            B2B_TaskTriggerHandler.updateAccountAddressCheckbox(Trigger.new, null);
        }
        if (Trigger.isUpdate) {
            B2B_TaskTriggerHandler.updateAccountAddressCheckbox(Trigger.new, Trigger.oldMap);
        }
        if (Trigger.isDelete) {
            B2B_TaskTriggerHandler.updateAccountAddressCheckbox(Trigger.old, null);
        }
        if (Trigger.isUnDelete) {
            B2B_TaskTriggerHandler.updateAccountAddressCheckbox(Trigger.new, null);
        }
    }
}
