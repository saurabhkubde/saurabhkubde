@isTest
private class B2B_SetUserPasswordQueueableTest {
    @testSetup
    static void setup() {
        List<User> userList = new List<User>();
        userList.add(B2B_TestDataFactory.createUser('TestUser0011', 'TestUser0011', 'TestUser0110@test.com', UserInfo.getProfileId()));
        if (userList.isEmpty() == false) {
            userList[0].IsActive = true;
            userList[0].Phone = '9988776655';
            userList[0].UserRoleId = null;
            insert userList;
        }
    }

    @isTest
    private static void setUserPasswordQueueablePositiveTest() {
        List<User> userList = [SELECT Id, Name FROM User LIMIT 1];
        String password = 'Test@1234';
        Test.startTest();
        Id jobId = System.enqueueJob(new B2B_SetUserPasswordQueueable(userList[0].Id, password));
        List<AsyncApexJob> apexJobList = [SELECT Status, ExtendedStatus FROM AsyncApexJob WHERE Id = :jobId];
        Test.stopTest();
        Assert.areEqual(false, apexJobList.isEmpty(), 'Apex Job List should not be empty as we have supplied correct inputs while invoking the method');
    }

    private static void setUserPasswordQueueableNegativeTest() {
        String password = 'Test@1234';
        Test.startTest();
        Id jobId = System.enqueueJob(new B2B_SetUserPasswordQueueable(null, password));
        List<AsyncApexJob> apexJobList = [SELECT Status, ExtendedStatus FROM AsyncApexJob WHERE Id = :jobId];
        Test.stopTest();
        Assert.areEqual(true, apexJobList.isEmpty(), 'Apex Job List should be empty as we have not supplied correct input while invoking the method');
    }
}
