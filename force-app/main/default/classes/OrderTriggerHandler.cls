/**
 * @author Aman Kumar
 * @desc this class is a handler class for OrderTrigger.
 */
@SuppressWarnings('PMD.classnamingconventions')
public without sharing class OrderTriggerHandler {
    /**
     * @description OrderTriggerHandler.runOrderTrigger
     * this method is calling the Helper method.
     */
    public static void runOrderTrigger() {
        if (Trigger.isBefore) {
            if (Trigger.isInsert) {
                OrderTriggerHelper.populateOrderRecordType((List<Order>) Trigger.new, null);
            } else if (Trigger.isUpdate) {
                OrderTriggerHelper.populateOrderRecordType((List<Order>) Trigger.new, (Map<Id, Order>) Trigger.oldMap);
            }
        } else if (Trigger.isAfter) {
            if (Trigger.isInsert) {
                OrderTriggerHelper.populateRelatedB2COrderField((List<Order>) Trigger.new, null);
            } else if (Trigger.isUpdate) {
                OrderTriggerHelper.populateRelatedB2COrderField((List<Order>) Trigger.new, (Map<Id, Order>) Trigger.oldMap);
            }
        }
    }
}
