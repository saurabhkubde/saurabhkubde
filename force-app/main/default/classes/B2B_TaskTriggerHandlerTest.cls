@isTest
public without sharing class B2B_TaskTriggerHandlerTest {
    @TestSetup
    static void dataSetup() {
        Id accountRecordTypeId = Schema.SObjectType.Account.getRecordTypeInfosByName().get(Bfl_Constant.STAGE_ACCOUNT).getRecordTypeId();
        List<Account> accToInsertLst = new List<Account>();

        Account acc = B2B_TestDataFactory.createTestAccount();
        acc.k_ARIS_Account_ID__c = 'DEDE_123';
        acc.k_Account_No__c = 'DENB_123';
        acc.CSG_SubSeg_EE__c = 'populated';
        acc.k_Stage__c = 'Account';
        acc.k_Customer_Status__c = '1';
        acc.RecordTypeId = accountRecordTypeId;
        accToInsertLst.add(acc);

        Account acc2 = B2B_TestDataFactory.createTestAccount();
        acc2.k_ARIS_Account_ID__c = 'DENB_123';
        acc2.k_Account_No__c = 'DENB_123';
        acc2.k_Stage__c = 'Account';
        acc2.k_Customer_Status__c = '1';
        acc2.RecordTypeId = accountRecordTypeId;
        accToInsertLst.add(acc2);

        insert accToInsertLst;
    }

    /*
     *Scenario: Both Accounts have open tasks, completely updates all tasks from one of
     *the Account such that to Close them and verifies that address checkbox on that account
     *is changed to false
     */
    @IsTest
    public static void testCompleteUpdateTasks() {
        String closedStatus;
        String openStatus;
        for (TaskStatus taskStatus : [SELECT ApiName, IsClosed FROM TaskStatus]) {
            if (taskStatus.IsClosed == true) {
                closedStatus = taskStatus.ApiName;
            } else if (taskStatus.IsClosed == false) {
                openStatus = taskStatus.ApiName;
            }
        }
        List<Account> accLst = [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE k_Account_No__c = 'DENB_123'];
        List<Task> taskLst = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[0].Id, null, false);
        List<Task> tasksToClose;
        tasksToClose = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[1].Id, null, false);
        taskLst.addAll(tasksToClose);
        insert taskLst;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.startTest();
        for (Task tsk : tasksToClose) {
            tsk.Status = closedStatus;
        }
        update tasksToClose;
        Test.stopTest();
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            false,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
    }

    /*
     *Scenario: Both Accounts have open tasks, partially updates all tasks from one of
     *the Account such that to Close them and verifies that address checkbox on that account
     *is still true
     */
    @IsTest
    public static void testUpdateTasksPartialClosed() {
        String closedStatus;
        String openStatus;
        for (TaskStatus taskStatus : [SELECT ApiName, IsClosed FROM TaskStatus]) {
            if (taskStatus.IsClosed == true) {
                closedStatus = taskStatus.ApiName;
            } else if (taskStatus.IsClosed == false) {
                openStatus = taskStatus.ApiName;
            }
        }
        List<Account> accLst = [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE k_Account_No__c = 'DENB_123'];
        List<Task> taskLst = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[0].Id, null, false);
        List<Task> tasksToClose;
        tasksToClose = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[1].Id, null, false);
        taskLst.addAll(tasksToClose);
        insert taskLst;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.startTest();
        tasksToClose[0].Status = closedStatus;
        update tasksToClose;
        Test.stopTest();
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
    }

    /*
     *Scenario: Both Accounts have open tasks, partially updates one tasks from both
     *the Accounts such that to Close them and verifies that address checkbox on both account
     *is still true
     */
    @IsTest
    public static void testUpdateTasksMixed() {
        String closedStatus;
        String openStatus;
        for (TaskStatus taskStatus : [SELECT ApiName, IsClosed FROM TaskStatus]) {
            if (taskStatus.IsClosed == true) {
                closedStatus = taskStatus.ApiName;
            } else if (taskStatus.IsClosed == false) {
                openStatus = taskStatus.ApiName;
            }
        }
        List<Account> accLst = [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE k_Account_No__c = 'DENB_123'];
        List<Task> taskLst = B2B_TestDataFactory.createTasks(102, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[0].Id, null, false);
        List<Task> tasksToClose;
        tasksToClose = B2B_TestDataFactory.createTasks(102, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[1].Id, null, false);
        taskLst.addAll(tasksToClose);
        insert taskLst;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.startTest();
        taskLst[0].Status = closedStatus;
        taskLst[taskLst.size() - 1].Status = closedStatus;
        update taskLst;
        Test.stopTest();
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
    }

    /*
     *Scenario: Both Accounts have open tasks, updates all tasks from one of
     *the Accounts such that whatId is changed to Other Account and verifies that
     *address checkbox on that changed account is changed to false
     */
    @IsTest
    public static void testUpdateAllTasksWhatIdChange() {
        String closedStatus;
        String openStatus;
        for (TaskStatus taskStatus : [SELECT ApiName, IsClosed FROM TaskStatus]) {
            if (taskStatus.IsClosed == true) {
                closedStatus = taskStatus.ApiName;
            } else if (taskStatus.IsClosed == false) {
                openStatus = taskStatus.ApiName;
            }
        }
        List<Account> accLst = [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE k_Account_No__c = 'DENB_123'];
        List<Task> taskLst = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[0].Id, null, false);
        List<Task> tasksToTransfer;
        tasksToTransfer = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[1].Id, null, false);
        taskLst.addAll(tasksToTransfer);
        insert taskLst;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.startTest();
        for (Integer i = 0; i < tasksToTransfer.size(); i++) {
            tasksToTransfer[i].WhatId = accLst[0].Id;
        }
        update taskLst;
        Test.stopTest();
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            false,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
    }

    /*
     *Scenario: Both Accounts have open tasks, updates all tasks from one of
     *the Accounts such that whatId is set to empty and verifies that
     *address checkbox on that changed account is changed to false
     */
    @IsTest
    public static void testClearAllTasksWhatIdChange() {
        String closedStatus;
        String openStatus;
        for (TaskStatus taskStatus : [SELECT ApiName, IsClosed FROM TaskStatus]) {
            if (taskStatus.IsClosed == true) {
                closedStatus = taskStatus.ApiName;
            } else if (taskStatus.IsClosed == false) {
                openStatus = taskStatus.ApiName;
            }
        }
        List<Account> accLst = [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE k_Account_No__c = 'DENB_123'];
        List<Task> taskLst = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[0].Id, null, false);
        List<Task> tasksToTransfer;
        tasksToTransfer = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[1].Id, null, false);
        taskLst.addAll(tasksToTransfer);
        insert taskLst;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.startTest();
        for (Integer i = 0; i < tasksToTransfer.size(); i++) {
            tasksToTransfer[i].WhatId = null;
        }
        update taskLst;
        Test.stopTest();
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            false,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
    }

    /*
     *Scenario: One Account have open tasks, other list of tasks is without whatId
     *updates all tasks with null whatId such that whatId is set to one Account and verifies that
     *address checkbox on that changed tasks account is changed to true
     */
    @IsTest
    public static void testEmptyWhatIdToAccountChange() {
        String closedStatus;
        String openStatus;
        for (TaskStatus taskStatus : [SELECT ApiName, IsClosed FROM TaskStatus]) {
            if (taskStatus.IsClosed == true) {
                closedStatus = taskStatus.ApiName;
            } else if (taskStatus.IsClosed == false) {
                openStatus = taskStatus.ApiName;
            }
        }
        List<Account> accLst = [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE k_Account_No__c = 'DENB_123'];
        List<Task> taskLst = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[0].Id, null, false);
        List<Task> tasksToTransfer;
        tasksToTransfer = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, null, null, false);
        taskLst.addAll(tasksToTransfer);
        insert taskLst;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            false,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.startTest();
        for (Integer i = 0; i < tasksToTransfer.size(); i++) {
            tasksToTransfer[i].WhatId = accLst[1].Id;
        }
        update taskLst;
        Test.stopTest();
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
    }

    /*
     *Scenario: Both Accounts have open tasks, updates one task from one of
     *the Accounts such that whatId is changed to Other Account and verifies that
     *address checkbox on that changed account is still true
     */
    @IsTest
    public static void testUpdateOneTasksWhatIdChange() {
        String closedStatus;
        String openStatus;
        for (TaskStatus taskStatus : [SELECT ApiName, IsClosed FROM TaskStatus]) {
            if (taskStatus.IsClosed == true) {
                closedStatus = taskStatus.ApiName;
            } else if (taskStatus.IsClosed == false) {
                openStatus = taskStatus.ApiName;
            }
        }
        List<Account> accLst = [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE k_Account_No__c = 'DENB_123'];
        List<Task> taskLst = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[0].Id, null, false);
        List<Task> tasksToTransfer;
        tasksToTransfer = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[1].Id, null, false);
        taskLst.addAll(tasksToTransfer);
        insert taskLst;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.startTest();
        tasksToTransfer[0].WhatId = accLst[0].Id;
        update taskLst;
        Test.stopTest();
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
    }

    /*
     *Scenario: Both Accounts have open tasks, updates one task from one of
     *the Accounts such that whatId is changed to Other Account and vice versa, verifies that
     *address checkbox on both changed task accounts is still true
     */
    @IsTest
    public static void testUpdatePartialTasksWhatIdChange() {
        String closedStatus;
        String openStatus;
        for (TaskStatus taskStatus : [SELECT ApiName, IsClosed FROM TaskStatus]) {
            if (taskStatus.IsClosed == true) {
                closedStatus = taskStatus.ApiName;
            } else if (taskStatus.IsClosed == false) {
                openStatus = taskStatus.ApiName;
            }
        }
        List<Account> accLst = [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE k_Account_No__c = 'DENB_123'];
        List<Task> taskLst = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[0].Id, null, false);
        List<Task> tasksToTransfer;
        tasksToTransfer = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[1].Id, null, false);
        taskLst.addAll(tasksToTransfer);
        insert taskLst;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.startTest();
        taskLst[0].WhatId = accLst[0].Id;
        taskLst[taskLst.size() - 1].WhatId = accLst[1].Id;
        update taskLst;
        Test.stopTest();
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
    }

    /*
     *Scenario: Both Accounts have open tasks, completely deletes all tasks from one of
     *the Accounts and verifies that address checkbox on that account is changed to false
     */
    @IsTest
    public static void testDeleteAllTasks() {
        String closedStatus;
        String openStatus;
        for (TaskStatus taskStatus : [SELECT ApiName, IsClosed FROM TaskStatus]) {
            if (taskStatus.IsClosed == true) {
                closedStatus = taskStatus.ApiName;
            } else if (taskStatus.IsClosed == false) {
                openStatus = taskStatus.ApiName;
            }
        }
        List<Account> accLst = [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE k_Account_No__c = 'DENB_123'];
        List<Task> taskLst = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[0].Id, null, false);
        List<Task> tasksToDelete;
        tasksToDelete = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[1].Id, null, false);
        taskLst.addAll(tasksToDelete);
        insert taskLst;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.startTest();
        delete tasksToDelete;
        Test.stopTest();
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            false,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
    }

    /*
     *Scenario: Both Accounts have open tasks, only deletes one tasks from one of
     *the Accounts and verifies that address checkbox on that account is still true
     */
    @IsTest
    public static void testDeletePartialTasks() {
        String closedStatus;
        String openStatus;
        for (TaskStatus taskStatus : [SELECT ApiName, IsClosed FROM TaskStatus]) {
            if (taskStatus.IsClosed == true) {
                closedStatus = taskStatus.ApiName;
            } else if (taskStatus.IsClosed == false) {
                openStatus = taskStatus.ApiName;
            }
        }
        List<Account> accLst = [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE k_Account_No__c = 'DENB_123'];
        List<Task> taskLst = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[0].Id, null, false);
        List<Task> tasksToDelete;
        tasksToDelete = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[1].Id, null, false);
        taskLst.addAll(tasksToDelete);
        insert taskLst;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.startTest();
        delete tasksToDelete[0];
        Test.stopTest();
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
    }

    /*
     *Scenario: Both Accounts have open tasks, partially deletes some tasks from both
     *the Accounts and verifies that address checkbox on both account is still true
     */
    @IsTest
    public static void testDeleteTasksMixedPartial() {
        String closedStatus;
        String openStatus;
        for (TaskStatus taskStatus : [SELECT ApiName, IsClosed FROM TaskStatus]) {
            if (taskStatus.IsClosed == true) {
                closedStatus = taskStatus.ApiName;
            } else if (taskStatus.IsClosed == false) {
                openStatus = taskStatus.ApiName;
            }
        }
        List<Account> accLst = [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE k_Account_No__c = 'DENB_123'];
        List<Task> taskLst = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[0].Id, null, false);
        List<Task> tasksToClose;
        tasksToClose = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[1].Id, null, false);
        taskLst.addAll(tasksToClose);
        insert taskLst;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.startTest();
        List<Task> tasksToDelete = new List<Task>();
        for (Integer i = 0; i < 50; i++) {
            tasksToDelete.add(taskLst[i]);
        }
        for (Integer i = 150; i < 200; i++) {
            tasksToDelete.add(taskLst[i]);
        }
        delete tasksToDelete;
        Test.stopTest();
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
    }

    /*
     *Scenario: Both Accounts have open tasks, completely deletes all tasks from one of
     *the Accounts and undeletes them, verifies that address checkbox on that account is still true
     */
    @IsTest
    public static void testUnDeleteAllTasks() {
        String closedStatus;
        String openStatus;
        for (TaskStatus taskStatus : [SELECT ApiName, IsClosed FROM TaskStatus]) {
            if (taskStatus.IsClosed == true) {
                closedStatus = taskStatus.ApiName;
            } else if (taskStatus.IsClosed == false) {
                openStatus = taskStatus.ApiName;
            }
        }
        List<Account> accLst = [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE k_Account_No__c = 'DENB_123'];
        List<Task> taskLst = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[0].Id, null, false);
        List<Task> tasksToDelete;
        tasksToDelete = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[1].Id, null, false);
        taskLst.addAll(tasksToDelete);
        insert taskLst;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.startTest();
        delete tasksToDelete;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            false,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        undelete tasksToDelete;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.stopTest();
    }

    /*
     *Scenario: Both Accounts have open tasks, partially deletes some tasks from both
     *the Accounts and undeletes them, verifies that address checkbox on both account is still true
     */
    @IsTest
    public static void testUnDeleteTasksMixedPartial() {
        String closedStatus;
        String openStatus;
        for (TaskStatus taskStatus : [SELECT ApiName, IsClosed FROM TaskStatus]) {
            if (taskStatus.IsClosed == true) {
                closedStatus = taskStatus.ApiName;
            } else if (taskStatus.IsClosed == false) {
                openStatus = taskStatus.ApiName;
            }
        }
        List<Account> accLst = [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE k_Account_No__c = 'DENB_123'];
        List<Task> taskLst = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[0].Id, null, false);
        List<Task> tasksToDelete;
        tasksToDelete = B2B_TestDataFactory.createTasks(101, System.Label.B2B_Task_Subject_Address_Change, openStatus, accLst[1].Id, null, false);
        taskLst.addAll(tasksToDelete);
        insert taskLst;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.startTest();
        tasksToDelete.add(taskLst[0]);
        delete tasksToDelete;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            false,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        undelete tasksToDelete;
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[0].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        System.assertEquals(
            true,
            [SELECT Id, Name, B2B_Requested_Address_Change__c FROM Account WHERE Id = :accLst[1].Id]
            .B2B_Requested_Address_Change__c,
            'checkbox not updated'
        );
        Test.stopTest();
    }
}
