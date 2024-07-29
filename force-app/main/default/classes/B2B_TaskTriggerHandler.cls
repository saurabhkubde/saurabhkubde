public without sharing class B2B_TaskTriggerHandler {
    /*
     * @author: Rahul P
     * @description: Used to update the Account Address Request Checkbox with respect to the task status
     * Implementation for BS-364
     */

    public static void updateAccountAddressCheckbox(List<Task> newTaskList, Map<Id, Task> taskIdVsTaskObjMap) {
        Map<Id, Boolean> mapAccountIdOpenTask = new Map<Id, Boolean>();
        for (Task tskObj : newTaskList) {
            if (
                String.isNotBlank(tskObj.Subject) && //BS-1424
                tskObj.Subject.equalsIgnoreCase(System.Label.B2B_Task_Subject_Address_Change) &&
                (tskObj.WhatId != null ||
                (taskIdVsTaskObjMap != null &&
                (tskObj.WhatId != taskIdVsTaskObjMap.get(tskObj.Id).WhatId) &&
                tskObj.WhatId == null)) &&
                (taskIdVsTaskObjMap == null ||
                (taskIdVsTaskObjMap != null &&
                (tskObj.IsClosed != taskIdVsTaskObjMap.get(tskObj.Id).IsClosed ||
                tskObj.WhatId != taskIdVsTaskObjMap.get(tskObj.Id).WhatId)))
            ) {
                if (tskObj.WhatId != null && tskObj.WhatId.getSObjectType() == Account.getSObjectType()) {
                    mapAccountIdOpenTask.put(tskObj.WhatId, null);
                } else if (
                    tskObj.WhatId == null &&
                    taskIdVsTaskObjMap != null &&
                    (tskObj.WhatId != taskIdVsTaskObjMap.get(tskObj.Id).WhatId) &&
                    taskIdVsTaskObjMap.get(tskObj.Id).WhatId.getSObjectType() == Account.getSObjectType()
                ) {
                    mapAccountIdOpenTask.put(taskIdVsTaskObjMap.get(tskObj.Id).WhatId, null);
                }

                //If WhatId is changed and is changed from Account to Account then consider earlier Account for reEvaluation
                if (
                    taskIdVsTaskObjMap != null &&
                    tskObj.WhatId != taskIdVsTaskObjMap.get(tskObj.Id).WhatId &&
                    taskIdVsTaskObjMap.get(tskObj.Id).WhatId != null &&
                    taskIdVsTaskObjMap.get(tskObj.Id).WhatId.getSObjectType() == Account.getSObjectType()
                ) {
                    mapAccountIdOpenTask.put(taskIdVsTaskObjMap.get(tskObj.Id).WhatId, null);
                }
            }
        }
        Set<Id> alreadyChecked = new Set<Id>();
        for (Task relatedTasks : [
            SELECT Id, IsClosed, Account.B2B_Requested_Address_Change__c, WhatId, Subject
            FROM Task
            WHERE WhatId IN :mapAccountIdOpenTask.keySet() AND Subject = :System.Label.B2B_Task_Subject_Address_Change
            ORDER BY WhatId, IsClosed
        ]) {
            if (relatedTasks.IsClosed == false && relatedTasks.Account.B2B_Requested_Address_Change__c == false) {
                mapAccountIdOpenTask.put(relatedTasks.WhatId, true);
            } else if (relatedTasks.IsClosed == false && relatedTasks.Account.B2B_Requested_Address_Change__c == true) {
                mapAccountIdOpenTask.remove(relatedTasks.WhatId);
                alreadyChecked.add(relatedTasks.WhatId);
            } else if (
                relatedTasks.IsClosed == true &&
                relatedTasks.Account.B2B_Requested_Address_Change__c == true &&
                mapAccountIdOpenTask.get(relatedTasks.WhatId) != true &&
                !alreadyChecked.contains(relatedTasks.WhatId)
            ) {
                mapAccountIdOpenTask.put(relatedTasks.WhatId, false);
            }
        }
        List<Account> accListToUpdate = new List<Account>();
        Account accInst;
        Set<Id> accountsWithNoTasks = new Set<Id>();

        /*Collect such Account Ids which donot have tasks associated either because last task
         *was deleted or reparented from one acc to other*/
        for (Id accId : mapAccountIdOpenTask.keySet()) {
            if (mapAccountIdOpenTask.get(accId) == null) {
                accountsWithNoTasks.add(accId);
            }
        }

        /*check if the Account B2B_Requested_Address_Change__c checkbox was not already
         *unchecked since the last task would have been a closed task*/
        if (accountsWithNoTasks.isEmpty() == false) {
            for (Account accObj : [SELECT Id, B2B_Requested_Address_Change__c FROM Account WHERE Id IN :accountsWithNoTasks]) {
                if (accObj.B2B_Requested_Address_Change__c) {
                    mapAccountIdOpenTask.put(accObj.Id, false);
                }
            }
        }

        for (Id accId : mapAccountIdOpenTask.keySet()) {
            if (mapAccountIdOpenTask.get(accId) == true) {
                accInst = new Account(Id = accId, B2B_Requested_Address_Change__c = true);
                accListToUpdate.add(accInst);
            } else if (mapAccountIdOpenTask.get(accId) == false) {
                accInst = new Account(Id = accId, B2B_Requested_Address_Change__c = false);
                accListToUpdate.add(accInst);
            }
        }
        update accListToUpdate;
    }
}
