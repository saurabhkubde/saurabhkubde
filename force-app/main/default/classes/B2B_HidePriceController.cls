/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-10-13 13:56:57
 * @modify date 2022-10-13 13:56:57
 * @desc class to update the account to show/hide prices in the store
 */

public without sharing class B2B_HidePriceController {
    /**
     * @description updateHidePriceOnAccount description
     * @author Matthias Lindner
     * @param  hidePrices indicates if the prices should be hidden or shown
     */
    @AuraEnabled(cacheable=false)
    public static String updateHidePriceOnAccount(Boolean hidePrices) {
        User u = [SELECT AccountId FROM User WHERE Id = :UserInfo.getUserId()];

        Account acc = new Account(Id = u.AccountId, B2B_Hide_Prices__c = hidePrices);

        update acc;

        return acc.Id;
    }
}
