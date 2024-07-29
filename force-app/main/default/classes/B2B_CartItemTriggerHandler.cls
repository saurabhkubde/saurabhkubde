/**
 * @author Chirag L
 * @email  chirag.lapasia@theblueflamelabs.com
 * @desc   This class is a handler for CartItemTrigger and contains various methods to execute according to triggering conditions and functionality
 * BS-1409
 **/
@SuppressWarnings('PMD.avoiddeeplynestedifstmts')
public with sharing class B2B_CartItemTriggerHandler {
    //BS-1409 : This boolean variable is used to control recurssion in trigger
    public static Boolean isFirstTime = true;

    /**
     * BS-1409
     * @description This method is used to control the sequence of function calls depending upon the triggering event
     * @author Chirag L
     */
    public static void runCartItemTrigger() {
        if (Trigger.isBefore) {
            if (Trigger.isUpdate) {
                if (isFirstTime) {
                    isFirstTime = false;
                    onBeforeUpdate((Map<Id, CartItem>) Trigger.oldMap, (Map<Id, CartItem>) Trigger.newMap);
                }
            }
        }
    }

    /**
     * BS-1409
     * @description This method is used to handle logic that needs to be executed for triggering condition of before update
     * @author Chirag L
     * @param oldCartItemMap    :   This Map contains the state of information of cartItem Id and CartItem object before the user has made changes
     * @param newCartItemMap    :   This Map contains the state of information of cartItem Id and CartItem object after the user has made changes
     */
    public static void onBeforeUpdate(Map<Id, CartItem> oldCartItemMap, Map<Id, CartItem> newCartItemMap) {
        B2B_CartItemTriggerHelper.createNormalCartItemForExistingVSRXCartItems(oldCartItemMap, newCartItemMap);
    }
}
