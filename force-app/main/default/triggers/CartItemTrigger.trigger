/**
 * @author Chirag L
 * @email  chirag.lapasia@theblueflamelabs.com
 * @desc   This trigger has been developed as part of BS-1409 in order to execute functions on DML operations performed on standard CartItem Object
 * BS-1409
 **/
trigger CartItemTrigger on CartItem(before insert, before update, after insert, after update) {
    B2B_CartItemTriggerHandler.runCartItemTrigger();
}
