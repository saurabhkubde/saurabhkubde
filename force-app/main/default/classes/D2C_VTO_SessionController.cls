/*************************************************************************************************************
 * This class D2C_VTO_SessionController contains methods used to manage a session under Virtual Try On
 *
 * @author – Shrikant Dangi
 ***************************************************************************************************************/
public without sharing class D2C_VTO_SessionController {
    /**
     * DVM21-5
     * this method checks if a record with given sessionId and command exists in the D2C_VTO_POS_Session_Activity__c
     * @param sessionId
     * @param command
     * @return Boolean
     */
    @AuraEnabled
    public static Boolean checkIfActivityRecordExists(Id sessionId, String command) {
        List<D2C_VTO_POS_Session_Activity__c> posSessionActivityLst = getActivityRecords(sessionId, command, null);
        if (posSessionActivityLst.isEmpty()) {
            return false;
        }
        return true;
    }

    /**
     * DVM21-5
     * this method returns records with given sessionId and command from the D2C_VTO_POS_Session_Activity__c
     * @param sessionId
     * @param command
     * @return List
     */
    @AuraEnabled
    public static List<D2C_VTO_POS_Session_Activity__c> getActivityRecords(Id sessionId, String command, String productSku) {
        if (String.isNotBlank(productSku)) {
            return [
                SELECT Id, D2C_VTO_Product_SKU__c
                FROM D2C_VTO_POS_Session_Activity__c
                WHERE D2C_VTO_POS_Session__c = :sessionId AND D2C_VTO_Command__c = :command AND D2C_VTO_Product_SKU__c = :productSku
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];
        }
        return [
            SELECT Id, D2C_VTO_Product_SKU__c
            FROM D2C_VTO_POS_Session_Activity__c
            WHERE D2C_VTO_POS_Session__c = :sessionId AND D2C_VTO_Command__c = :command
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
    }

    /**
     * DVM21-5
     * this method creates a new activity with given command
     * if the activity is already present then it does nothing
     * @param sessionId
     * @param command
     * @return void
     */
    @AuraEnabled
    public static void createSessionActivityIfNotExists(Id sessionId, String command) {
        List<D2C_VTO_POS_Session_Activity__c> posSessionActivityLst = getActivityRecords(sessionId, command, null);
        if (posSessionActivityLst.isEmpty()) {
            createSessionActivity(sessionId, command, null);
        }
    }

    /**
     * DVM21-5
     * this method creates a new activity with given command
     * @param sessionId
     * @param command
     * @return void
     */
    @AuraEnabled
    public static void createSessionActivity(Id sessionId, String command, String productSku) {
        if (String.isBlank(productSku)) {
            insert new D2C_VTO_POS_Session_Activity__c(D2C_VTO_Command__c = command, D2C_VTO_POS_Session__c = sessionId);
        } else {
            insert new D2C_VTO_POS_Session_Activity__c(D2C_VTO_Command__c = command, D2C_VTO_POS_Session__c = sessionId, D2C_VTO_Product_SKU__c = productSku);
        }
    }

    /**
     * DVM21-5
     * this method updates the session status with given status
     * @param sessionId
     * @param status
     * @return void
     */
    @AuraEnabled
    public static void updateSessionStatus(Id sessionId, String status) {
        update new D2C_VTO_POS_Session__c(Id = sessionId, D2C_VTO_Status__c = status);
    }

    /**
     * DVM21-5
     * this method starts a new session with given status and openTimeStamp and returns the id of it
     * @return Id
     */
    @AuraEnabled
    public static Id createSessionRecord(String status, Datetime sessionOpenTimeStamp) {
        D2C_VTO_POS_Session__c posSessionObject = new D2C_VTO_POS_Session__c(
            D2C_VTO_Status__c = status,
            D2C_VTO_Session_Open_Time_Stamp__c = sessionOpenTimeStamp
        );
        insert posSessionObject;
        return posSessionObject.Id;
    }

    /**
     * DVM21-5
     * this method returns the category id based on given catalogName and categoryName
     * @param catalogName
     * @param categoryName
     * @return Id
     */
    @AuraEnabled(cacheable=true)
    public static Id getCategoryId(String catalogName, String categoryName) {
        List<ProductCategory> productCategoryList = [SELECT Id FROM ProductCategory WHERE Catalog.Name = :catalogName AND Name = :categoryName];
        if (!productCategoryList.isempty()) {
            return productCategoryList[0].Id;
        }
        return null;
    }
}
