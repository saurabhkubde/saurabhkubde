/**
 * @author Soumyakant Pandya
 * @create date 2022-12-08
 * @modify date 2022-12-30
 * @desc This trigger get the values passed as translation and deploys the provided translation through the Metadata API.
 */
trigger B2B_TranslationTrigger on B2B_Translation__c(after insert, after update, after delete) {
    //BS-1404 To handle recursion
    if (B2B_RecursionHandler.doNotRerun == false) {
        B2B_TranslationTriggerHandler.handleTranslation(
            Trigger.new,
            Trigger.old,
            Trigger.newMap,
            Trigger.oldMap,
            Trigger.isInsert,
            Trigger.isUpdate,
            Trigger.isDelete,
            Trigger.isBefore,
            Trigger.isAfter
        );
    }
}
