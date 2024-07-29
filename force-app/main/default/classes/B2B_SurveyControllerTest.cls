/**
 * @author Soumyakant P
 * @email soumyakant.pandya@theblueflamelabs.com
 * @created date 2023-08-08
 * @desc Test class for B2B_SurveyController
 */
@isTest
private with sharing class B2B_SurveyControllerTest {
    //This method contains all the common test data
    @testsetup
    private static void setup() {
        /* Start : BS-1610 */
        // Creates survey data
        List<B2B_Survey__c> surveyList = B2B_TestDataFactory.createSurveys(1, true);

        // Creates survey questions data of type 'Text'
        List<B2B_Survey_Question__c> surveyQuestionTextList = B2B_TestDataFactory.createSurveyQuestions(surveyList[0].Id, 5);
        //Creates survey questions data
        B2B_TestDataFactory.createQuestions('en_US', 'Question ', 'Text', surveyQuestionTextList);

        // Creates survey questions data of type 'Option'
        List<B2B_Survey_Question__c> surveyQuestionOptionList = B2B_TestDataFactory.createSurveyQuestions(surveyList[0].Id, 5);

        List<B2B_Question__c> optionQuestionList = B2B_TestDataFactory.createQuestions('en_US', 'Question ', 'Options', surveyQuestionOptionList);

        //Creates survey options data
        B2B_TestDataFactory.createOptions('Emoji', 'test.com', optionQuestionList);
        //Creates account's data
        B2B_TestDataFactory.createAccounts(1, 'Account', 'Account', true);

        //Creates user's data
        B2B_TestDataFactory.createInsertCommerceUser();
    }

    //This method provide test coverage for checkIfSurveyApplicable() method of apex class "B2B_SurveyController"
    @isTest
    private static void checkIfSurveyApplicableForHomeTest() {
        List<User> userList = [SELECT Id FROM User LIMIT 1];
        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];

        Test.startTest();
        Boolean surveyFlag = B2B_SurveyController.checkIfSurveyApplicable(userList[0].Id, accountList[0].Id, true);
        System.assertEquals(surveyFlag, false, 'survey flag should be returned to false');
        Test.stopTest();
    }

    //BS-1509
    @isTest
    private static void checkIfSurveyApplicableWithNoActiveSurveyTest() {
        List<B2B_Survey__c> surveyList = [SELECT Id FROM B2B_Survey__c];
        delete surveyList;
        List<User> userList = [SELECT Id FROM User LIMIT 1];
        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];

        Test.startTest();
        Boolean surveyFlag = B2B_SurveyController.checkIfSurveyApplicable(userList[0].Id, accountList[0].Id, true);
        System.assertEquals(surveyFlag, false, 'survey flag should be returned to false');
        Test.stopTest();
    }

    //BS-1509
    @isTest
    private static void checkIfSurveyApplicableForOrderConfirmationTest() {
        List<User> userList = [SELECT Id FROM User LIMIT 1];
        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];

        Test.startTest();
        Boolean surveyFlag = B2B_SurveyController.checkIfSurveyApplicable(userList[0].Id, accountList[0].Id, false);
        System.assertEquals(surveyFlag, false, 'survey flag should be returned to false');
        Test.stopTest();
    }

    //This method provide test coverage for getSurveyAndQuestions() method of apex class "B2B_SurveyController"
    @isTest
    private static void getSurveyAndQuestionsWithoutExistingSurveyResponseTest() {
        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];

        Test.startTest();
        B2B_SurveyController.B2B_SurveyAndQuestionWrapper surveyQuestionWrapperObj = B2B_SurveyController.getSurveyAndQuestions('en_US', accountList[0].Id);
        Test.stopTest();

        System.assertNotEquals(null, surveyQuestionWrapperObj, 'Wrapper containing the wrapper should be returned');
    }

    @isTest
    private static void getSurveyAndQuestionsWithExistingSurveyResponseTest() {
        List<B2B_Survey__c> surveyList = [SELECT Id FROM B2B_Survey__c LIMIT 1];
        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];

        List<B2B_Question__c> optionQuestionList = [
            SELECT Id, B2B_Survey_Question__r.B2B_Survey__c
            FROM B2B_Question__c
            WHERE B2B_Type__c = :B2B_Constants.OPTIONS_PICKLIST AND B2B_Survey_Question__r.B2B_Survey__c = :surveyList[0].Id
            LIMIT 1
        ];

        List<B2B_Question__c> textQuestionList = [
            SELECT Id, B2B_Survey_Question__r.B2B_Survey__c
            FROM B2B_Question__c
            WHERE B2B_Type__c = :B2B_Constants.TEXT_PICKLIST AND B2B_Survey_Question__r.B2B_Survey__c = :surveyList[0].Id
            LIMIT 1
        ];
        List<B2B_Survey_Response__c> surveyResponseList = B2B_TestDataFactory.createSurveyResponse(
            1,
            accountList[0].Id,
            System.now(),
            B2B_Constants.IN_PROGRESS,
            surveyList[0].Id
        );
        B2B_TestDataFactory.createSurveyAnswers(1, surveyList[0].Id, surveyResponseList[0].Id, optionQuestionList[0].B2B_Survey_Question__c);
        B2B_TestDataFactory.createSurveyAnswers(1, surveyList[0].Id, surveyResponseList[0].Id, textQuestionList[0].B2B_Survey_Question__c);

        Test.startTest();
        B2B_SurveyController.B2B_SurveyAndQuestionWrapper surveyQuestionWrapperObj = B2B_SurveyController.getSurveyAndQuestions('en_US', accountList[0].Id);
        Test.stopTest();

        System.assertNotEquals(null, surveyQuestionWrapperObj, 'Wrapper containing the wrapper should be returned');
    }

    //This method provide test coverage for saveSurveyAnswer() method of apex class "B2B_SurveyController"
    @isTest
    private static void saveSurveyOptionAnswerSubmitTest() {
        List<B2B_Survey__c> surveyList = [SELECT Id FROM B2B_Survey__c LIMIT 1];
        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];

        List<B2B_Question__c> questionList = [
            SELECT Id, B2B_Survey_Question__r.B2B_Survey__c
            FROM B2B_Question__c
            WHERE B2B_Type__c = :B2B_Constants.OPTIONS_PICKLIST AND B2B_Survey_Question__r.B2B_Survey__c = :surveyList[0].Id
            LIMIT 1
        ];

        List<B2B_Survey_Response__c> surveyResponseList = B2B_TestDataFactory.createSurveyResponse(
            1,
            accountList[0].Id,
            System.now(),
            B2B_Constants.SURVEY_OPEN_STATUS,
            surveyList[0].Id
        );
        List<B2B_Survey_Answer__c> surveyAnswerList = B2B_TestDataFactory.createSurveyAnswers(
            1,
            surveyList[0].Id,
            surveyResponseList[0].Id,
            questionList[0].B2B_Survey_Question__c
        );

        String surveyObject =
            '{"answer": "9","comment":"Test"' +
            ',"surveyQuestionId": "' +
            questionList[0].B2B_Survey_Question__c +
            '","surveyResponseId":"' +
            surveyResponseList[0].Id +
            '","surveyAnswerId":"' +
            surveyAnswerList[0].Id +
            '"}';

        Boolean hasOptions = true;
        Boolean isSubmit = false;

        B2B_SurveyController.B2B_SurveyAnswerWrapper wrapperObj = new B2B_SurveyController.B2B_SurveyAnswerWrapper();

        Test.startTest();
        wrapperObj = B2B_SurveyController.saveSurveyAnswer(surveyObject, accountList[0].Id, surveyList[0].Id, hasOptions, isSubmit, surveyResponseList[0].Id);
        Test.stopTest();

        System.assertNotEquals(null, wrapperObj, 'Should return the wrapper with the data mapping from DML');
    }

    @isTest
    private static void saveSurveyOptionAnswerTest() {
        List<B2B_Survey__c> surveyList = [SELECT Id FROM B2B_Survey__c LIMIT 1];
        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];

        List<B2B_Question__c> questionList = [
            SELECT Id, B2B_Survey_Question__r.B2B_Survey__c
            FROM B2B_Question__c
            WHERE B2B_Type__c = :B2B_Constants.OPTIONS_PICKLIST AND B2B_Survey_Question__r.B2B_Survey__c = :surveyList[0].Id
            LIMIT 1
        ];

        String surveyObject = '{"answer": 9,"comment":"Test"' + ',"surveyQuestionId": "' + questionList[0].B2B_Survey_Question__c + '"}';

        Boolean hasOptions = true;
        Boolean isSubmit = false;

        B2B_SurveyController.B2B_SurveyAnswerWrapper wrapperObj = new B2B_SurveyController.B2B_SurveyAnswerWrapper();

        List<B2B_Survey_Response__c> surveyResponseList = B2B_TestDataFactory.createSurveyResponse(
            1,
            accountList[0].Id,
            System.now(),
            B2B_Constants.SURVEY_OPEN_STATUS,
            surveyList[0].Id
        );

        Test.startTest();
        wrapperObj = B2B_SurveyController.saveSurveyAnswer(surveyObject, accountList[0].Id, surveyList[0].Id, hasOptions, isSubmit, surveyResponseList[0].Id);
        Test.stopTest();

        System.assertNotEquals(null, wrapperObj, 'Should return the wrapper with the data mapping from DML');
    }

    @isTest
    private static void saveSurveyTextAnswerSubmitTest() {
        List<B2B_Survey__c> surveyList = [SELECT Id FROM B2B_Survey__c LIMIT 1];
        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];
        List<B2B_Question__c> questionList = [
            SELECT Id, B2B_Survey_Question__r.B2B_Survey__c
            FROM B2B_Question__c
            WHERE B2B_Type__c = :B2B_Constants.TEXT_PICKLIST AND B2B_Survey_Question__r.B2B_Survey__c = :surveyList[0].Id
            LIMIT 1
        ];

        List<B2B_Survey_Response__c> surveyResponseList = B2B_TestDataFactory.createSurveyResponse(
            1,
            accountList[0].Id,
            System.now(),
            B2B_Constants.SURVEY_OPEN_STATUS,
            surveyList[0].Id
        );
        String surveyObject =
            '{"answer": "9"' +
            ',"surveyQuestionId": "' +
            questionList[0].B2B_Survey_Question__c +
            '","surveyResponseId":"' +
            surveyResponseList[0].Id +
            '"}';

        Boolean hasOptions = false;
        Boolean isSubmit = true;

        B2B_SurveyController.B2B_SurveyAnswerWrapper wrapperObj = new B2B_SurveyController.B2B_SurveyAnswerWrapper();

        Test.startTest();
        wrapperObj = B2B_SurveyController.saveSurveyAnswer(surveyObject, accountList[0].Id, surveyList[0].Id, hasOptions, isSubmit, surveyResponseList[0].Id);
        Test.stopTest();

        System.assertNotEquals(null, wrapperObj, 'Should return the wrapper with the data mapping from DML');
    }

    @isTest
    private static void saveSurveyTextAnswerUpdateSubmitTest() {
        List<B2B_Survey__c> surveyList = [SELECT Id FROM B2B_Survey__c LIMIT 1];
        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];
        List<B2B_Question__c> questionList = [
            SELECT Id, B2B_Survey_Question__r.B2B_Survey__c
            FROM B2B_Question__c
            WHERE B2B_Type__c = :B2B_Constants.TEXT_PICKLIST AND B2B_Survey_Question__r.B2B_Survey__c = :surveyList[0].Id
            LIMIT 1
        ];

        List<B2B_Survey_Response__c> surveyResponseList = B2B_TestDataFactory.createSurveyResponse(
            1,
            accountList[0].Id,
            System.now(),
            B2B_Constants.SURVEY_OPEN_STATUS,
            surveyList[0].Id
        );
        List<B2B_Survey_Answer__c> surveyAnswerList = B2B_TestDataFactory.createSurveyAnswers(
            1,
            surveyList[0].Id,
            surveyResponseList[0].Id,
            questionList[0].B2B_Survey_Question__c
        );
        String surveyObject =
            '{"answer": "9"' +
            ',"surveyQuestionId": "' +
            questionList[0].B2B_Survey_Question__c +
            '","surveyResponseId":"' +
            surveyResponseList[0].Id +
            '","surveyAnswerId":"' +
            surveyAnswerList[0].Id +
            '"}';

        Boolean hasOptions = false;
        Boolean isSubmit = true;

        B2B_SurveyController.B2B_SurveyAnswerWrapper wrapperObj = new B2B_SurveyController.B2B_SurveyAnswerWrapper();

        Test.startTest();
        wrapperObj = B2B_SurveyController.saveSurveyAnswer(surveyObject, accountList[0].Id, surveyList[0].Id, hasOptions, isSubmit, surveyResponseList[0].Id);
        Test.stopTest();

        System.assertNotEquals(null, wrapperObj, 'Should return the wrapper with the data mapping from DML');
    }

    //BS-1509
    @isTest
    private static void getSurveyResponseIdWithoutExistingSurveyResponse() {
        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];

        Test.startTest();
        B2B_Survey_Response__c surveyResponseObj = B2B_SurveyController.getSurveyResponseId(accountList[0].Id);
        Test.stopTest();
        System.assertNotEquals(null, surveyResponseObj, 'The object should be returned');
    }

    //BS-1509
    @isTest
    private static void getSurveyResponseIdWithExistingSurveyResponse() {
        List<B2B_Survey__c> surveyList = [SELECT Id FROM B2B_Survey__c LIMIT 1];

        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];

        B2B_TestDataFactory.createSurveyResponse(1, accountList[0].Id, System.now(), B2B_Constants.SURVEY_OPEN_STATUS, surveyList[0].Id);

        Test.startTest();
        B2B_Survey_Response__c surveyResponseObj = B2B_SurveyController.getSurveyResponseId(accountList[0].Id);
        Test.stopTest();
        System.assertNotEquals(null, surveyResponseObj, 'The object should be returned');
    }

    //BS-1509
    @isTest
    private static void updateNoResponseCountTest() {
        List<B2B_Survey__c> surveyList = [SELECT Id FROM B2B_Survey__c LIMIT 1];

        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];

        List<B2B_Survey_Response__c> surveyResponseList = B2B_TestDataFactory.createSurveyResponse(
            1,
            accountList[0].Id,
            System.now(),
            B2B_Constants.IN_PROGRESS,
            surveyList[0].Id
        );

        Test.startTest();
        B2B_SurveyController.updateNoResponseCount(surveyResponseList[0].Id);
        Integer dmlCount = Limits.getDmlStatements();
        Test.stopTest();

        System.assertEquals(1, dmlCount, 'One record should be updated');
    }

    //BS-1509
    @isTest
    private static void updateNoResponseCounAndSurveyToNoResponsetTest() {
        List<B2B_Survey__c> surveyList = [SELECT Id FROM B2B_Survey__c LIMIT 1];

        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];

        List<B2B_Survey_Response__c> surveyResponseList = B2B_TestDataFactory.createSurveyResponse(
            1,
            accountList[0].Id,
            System.now(),
            B2B_Constants.IN_PROGRESS,
            surveyList[0].Id
        );

        surveyResponseList[0].B2B_No_Response__c = 2;

        update surveyResponseList;

        Test.startTest();
        B2B_SurveyController.updateNoResponseCount(surveyResponseList[0].Id);
        Integer dmlCount = Limits.getDmlStatements();
        Test.stopTest();

        System.assertEquals(1, dmlCount, 'One record should be updated');
    }

    //BS-1509
    @isTest
    private static void saveSurveyTextExceptionTest() {
        List<B2B_Survey__c> surveyList = [SELECT Id FROM B2B_Survey__c LIMIT 1];
        List<Account> accountList = [SELECT Id, Name FROM Account LIMIT 1];

        List<B2B_Question__c> questionList = [
            SELECT Id, B2B_Survey_Question__r.B2B_Survey__c
            FROM B2B_Question__c
            WHERE B2B_Type__c = :B2B_Constants.TEXT_PICKLIST AND B2B_Survey_Question__r.B2B_Survey__c = :surveyList[0].Id
            LIMIT 1
        ];

        List<B2B_Survey_Response__c> surveyResponseList = B2B_TestDataFactory.createSurveyResponse(
            1,
            accountList[0].Id,
            System.now(),
            B2B_Constants.SURVEY_OPEN_STATUS,
            surveyList[0].Id
        );
        List<B2B_Survey_Answer__c> surveyAnswerList = B2B_TestDataFactory.createSurveyAnswers(
            1,
            surveyList[0].Id,
            surveyResponseList[0].Id,
            questionList[0].B2B_Survey_Question__c
        );
        String surveyObject =
            '{"answer": "9"' +
            ',"surveyQuestionId": "' +
            questionList[0].B2B_Survey_Question__c +
            '","surveyAnswerId":"' +
            surveyAnswerList[0].Id +
            '"}';

        Boolean hasOptions = false;
        Boolean isSubmit = true;

        Test.startTest();
        B2B_SurveyController.saveSurveyAnswer(surveyObject, accountList[0].Id, surveyList[0].Id, hasOptions, isSubmit, null);
        Test.stopTest();

        List<B2B_CommerceLog__c> commerceLogList = [SELECT Id FROM B2B_CommerceLog__c];
        System.assertEquals(false, commerceLogList.isEmpty(), 'DML exception would be thrown');
    }
}
