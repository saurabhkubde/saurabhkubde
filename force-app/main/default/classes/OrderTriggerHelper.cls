@SuppressWarnings('PMD.classnamingconventions')
public with sharing class OrderTriggerHelper {
    public static Boolean isOrderFromB2BCheckout = false;
    public static Id b2cOrderRecordtypeId = Schema.SObjectType.Order.getRecordTypeInfosByDeveloperName()
        .get(B2B_Constants.B2C_ORDER_RECORDTYPE_DEVELOPERNAME)
        .getRecordTypeId();
    public static Id b2bOrderRecordtypeId = Schema.SObjectType.Order.getRecordTypeInfosByDeveloperName()
        .get(B2B_Constants.B2B_ORDER_RECORDTYPE_DEVELOPERNAME)
        .getRecordTypeId();

    /**
     * @description OrderTriggerHelper.populateOrderRecordType
     * @param newOrderList list of new order records that are to be inserted or updated
     * @param oldOrderMap map of order record old values
     */
    @SuppressWarnings('PMD.avoiddeeplynestedifstmts')
    public static void populateOrderRecordType(List<Order> newOrderList, Map<Id, Order> oldOrderMap) {
        List<String> b2cOrderPicklistValues = System.Label.B2C_Order_Source_Picklist_Values.split(',');
        List<String> b2bOrderPicklistValues = System.Label.B2B_Order_Source_Picklist_Values.split(',');
        Set<Id> accountIdSet = new Set<Id>();
        if (isOrderFromB2BCheckout == false && newOrderList.isEmpty() == false && oldOrderMap != null) {
            for (Order orderObj : newOrderList) {
                if (
                    orderObj.Order_Source__c != null &&
                    orderObj.Order_Source__c != oldOrderMap.get(orderObj.Id).Order_Source__c &&
                    b2bOrderPicklistValues.isEmpty() == false &&
                    b2bOrderPicklistValues.contains(oldOrderMap.get(orderObj.Id).Order_Source__c) == false
                ) {
                    orderObj.RecordTypeId = b2bOrderRecordtypeId;
                }
                if (
                    orderObj.Order_Source__c != null &&
                    !b2cOrderPicklistValues.isEmpty() &&
                    b2cOrderPicklistValues.contains(orderObj.Order_Source__c) &&
                    orderObj.AccountId != oldOrderMap.get(orderObj.Id).AccountId
                ) {
                    accountIdSet.add(orderObj.AccountId);
                }
            }
        } else if (isOrderFromB2BCheckout == false && newOrderList.isEmpty() == false) {
            for (Order orderObj : newOrderList) {
                if (orderObj.Order_Source__c != null && b2bOrderPicklistValues.contains(orderObj.Order_Source__c)) {
                    orderObj.RecordTypeId = b2bOrderRecordtypeId;
                } else if (orderObj.Order_Source__c != null && !b2cOrderPicklistValues.isEmpty() && b2cOrderPicklistValues.contains(orderObj.Order_Source__c)) {
                    orderObj.RecordTypeId = b2cOrderRecordtypeId;
                    accountIdSet.add(orderObj.AccountId);
                }
            }
        } else {
            isOrderFromB2BCheckout = false;
        }

        if (!accountIdSet.isEmpty()) {
            Map<Id, Id> accountIdVsContactIdMap = getContactRelatedToThatAccount(accountIdSet);
            for (Order orderObject : newOrderList) {
                if (orderObject.RecordTypeId == b2cOrderRecordtypeId) {
                    if (accountIdVsContactIdMap.containskey(orderObject.AccountId)) {
                        orderObject.B2C_Consumer__c = accountIdVsContactIdMap.get(orderObject.AccountId);
                        orderObject.BillToContactId = accountIdVsContactIdMap.get(orderObject.AccountId); //Added as Part of DBUSF-516.
                    }
                }
            }
        }
    }

    /**
     * @description populateRelatedB2COrderField
     * @param newOrderList list of new order records that are inserted
     * @param oldOrderMap map of order record old values
     */
    @SuppressWarnings('PMD.avoiddeeplynestedifstmts')
    public static void populateRelatedB2COrderField(List<Order> newOrderList, Map<Id, Order> oldOrderMap) {
        List<Order> b2bOrderToUpdateList = new List<Order>();
        List<String> b2bOrderNumberList = new List<String>();
        List<String> b2cOrderNumberList = new List<String>();
        Map<String, AccountShare> accountIdVsAccountShareMap = new Map<String, AccountShare>();
        Map<String, String> b2bOrderNumberVsOrderIdMap = new Map<String, String>();
        Map<String, String> b2cOrderNumberVsOrderIdMap = new Map<String, String>();
        if (!newOrderList.isEmpty() && oldOrderMap == null) {
            for (Order orderObj : newOrderList) {
                if (
                    orderObj.RecordTypeId == b2bOrderRecordtypeId &&
                    orderObj.Order_Source__c == System.Label.B2C_Buy_Local_Order_Source_Value &&
                    String.isNotBlank(orderObj.Related_B2C_Order_Number__c)
                ) {
                    b2bOrderNumberList.add(orderObj.Related_B2C_Order_Number__c);
                    b2bOrderNumberVsOrderIdMap.put(orderObj.Related_B2C_Order_Number__c, orderObj.Id);
                } else if (
                    orderObj.RecordTypeId == b2cOrderRecordtypeId &&
                    orderObj.Order_Source__c == B2B_Constants.B2C_ORDER_SOURCE_VALUE &&
                    String.isNotBlank(orderObj.B2C_Order_Number__c)
                ) {
                    b2cOrderNumberList.add(orderObj.B2C_Order_Number__c);
                    b2cOrderNumberVsOrderIdMap.put(orderObj.B2C_Order_Number__c, orderObj.Id);
                }
            }
        } else if (!newOrderList.isEmpty() && oldOrderMap != null) {
            for (Order orderObj : newOrderList) {
                if (
                    orderObj.RecordTypeId == b2bOrderRecordtypeId &&
                    orderObj.Order_Source__c == System.Label.B2C_Buy_Local_Order_Source_Value &&
                    orderObj.Related_B2C_Order_Number__c != oldOrderMap.get(orderObj.Id).Related_B2C_Order_Number__c
                ) {
                    b2bOrderNumberList.add(orderObj.Related_B2C_Order_Number__c);
                    b2bOrderNumberVsOrderIdMap.put(orderObj.Related_B2C_Order_Number__c, orderObj.Id);
                }
            }
        }

        if (!b2bOrderNumberList.isEmpty()) {
            List<Order> b2cOrderList = [
                SELECT Id, RecordTypeId, Order_Source__c, B2C_Order_Number__c
                FROM Order
                WHERE RecordTypeId = :b2cOrderRecordtypeId AND B2C_Order_Number__c IN :b2bOrderNumberList
            ];
            if (!b2cOrderList.isEmpty()) {
                for (Order b2cOrderObj : b2cOrderList) {
                    if (b2bOrderNumberVsOrderIdMap.containsKey(b2cOrderObj.B2C_Order_Number__c)) {
                        Order order = new Order();
                        order.Id = b2bOrderNumberVsOrderIdMap.get(b2cOrderObj.B2C_Order_Number__c);
                        order.B2C_Related_B2C_Order__c = b2cOrderObj.Id;
                        b2bOrderToUpdateList.add(order);
                    }
                }
            }
        }
        if (!b2cOrderNumberList.isEmpty()) {
            List<Order> b2bOrderList = [
                SELECT Id, RecordTypeId, Order_Source__c, Related_B2C_Order_Number__c
                FROM Order
                WHERE RecordTypeId = :b2bOrderRecordtypeId AND Related_B2C_Order_Number__c IN :b2cOrderNumberList
            ];
            if (!b2bOrderList.isEmpty()) {
                for (Order b2bOrderObj : b2bOrderList) {
                    if (b2cOrderNumberVsOrderIdMap.containsKey(b2bOrderObj.Related_B2C_Order_Number__c)) {
                        Order order = new Order();
                        order.Id = b2bOrderObj.Id;
                        order.B2C_Related_B2C_Order__c = b2cOrderNumberVsOrderIdMap.get(b2bOrderObj.Related_B2C_Order_Number__c);
                        b2bOrderToUpdateList.add(order);
                    }
                }
            }
        }
        if (!b2bOrderToUpdateList.isEmpty()) {
            update b2bOrderToUpdateList;
            List<Group> groupList = [SELECT id, name FROM group WHERE DeveloperName = 'All_B2C_Users'];
            for (Order orderObj : [SELECT id, accountId FROM Order WHERE id IN :b2bOrderToUpdateList]) {
                AccountShare accountShare = new AccountShare();
                accountShare.userorgroupid = groupList[0].Id;
                accountShare.accountid = orderObj.AccountId;
                accountShare.accountaccesslevel = 'Edit';
                accountShare.OpportunityAccessLevel = 'None';
                accountShare.CaseAccessLevel = 'None';
                accountIdVsAccountShareMap.put(orderObj.AccountId, accountShare);
            }
            if (!accountIdVsAccountShareMap.isEmpty()) {
                insert accountIdVsAccountShareMap.values();
            }
        }
    }

    /**
     * @description OrderTriggerHelper.getContactRelatedToThatAccount
     * @param accountIdSet Set of Account records that are related to the Order.
     */
    public static Map<Id, Id> getContactRelatedToThatAccount(Set<Id> accountIdSet) {
        Map<Id, Id> accountIdVsContactIdMap = new Map<Id, Id>();
        List<Contact> contactList = [SELECT Id, AccountId, B2C_Is_B2C_Contact__c FROM Contact WHERE AccountId = :accountIdSet AND B2C_Is_B2C_Contact__c = TRUE];
        for (Contact contactObject : contactList) {
            if (String.isNotBlank(contactObject.AccountId) && contactObject.B2C_Is_B2C_Contact__c == true) {
                accountIdVsContactIdMap.put(contactObject.AccountId, contactObject.Id);
            }
        }
        return accountIdVsContactIdMap;
    }
}
