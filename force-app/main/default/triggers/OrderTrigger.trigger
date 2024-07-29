/**
 * @author Aman Kumar BFL
 * @desc this is a trigger on standard order object to Handle The functionality of B2B and B2C
 */

trigger OrderTrigger on Order(before insert, before update, after insert, after update) {
    OrderTriggerHandler.runOrderTrigger();
}
