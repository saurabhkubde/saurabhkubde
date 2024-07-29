/**
 * @author Soumyakant Pandya
 * BS-498
 * @email soumyakant.pandya@theblueflamelabs.com
 * @desc This class conatins the methods to empower the survey functionalities.
 */
@SuppressWarnings('PMD.ExcessivePublicCount')
public without sharing class B2B_SurveyController {
    /**
     * @description checkIfSurveyApplicable : Checks if the current user and account should be shown the survey pop-up on order confirmation.
     * @param  userId : Id of the current logged in User
     * @param effectiveAccountId : Id of the account to which the user is associated.
     * @param isHomePage : Boolean to identify if the current page is Home pgae added as part of BS-1509
     * @return Boolean : If the survey should be shown or not.
     * Added as part of BS-498
     */

    @AuraEnabled(cacheable=false)
    public static Boolean checkIfSurveyApplicable(String userId, Id effectiveAccountId, Boolean isHomePage) {
        Integer loginCount = 0;
        Boolean isShowSurvey = false;

        //Returns the current active suvey.
        List<B2B_Survey__c> activeSurveyList = [
            SELECT Id, B2B_Is_Active__c, B2B_Number_Of_Logins__c, B2B_Survey_Start_Date__c
            FROM B2B_Survey__c
            WHERE B2B_Is_Active__c = TRUE
            LIMIT 1
        ];

        if (activeSurveyList.isEmpty() == true) {
            return isShowSurvey;
        } else {
            // Returns the successful login count number onwards specific date provided in query of currently logged in user.
            List<AggregateResult> loginCountList = [
                SELECT count(Id) LoginCount, Status
                FROM LoginHistory
                WHERE LoginTime >= :activeSurveyList[0].B2B_Survey_Start_Date__c AND UserId = :userId
                GROUP BY Status
            ];

            // Returns survey response data based on current active survey and accountId of the current logged in user.
            List<B2B_Survey_Response__c> surveyResponseList = [
                SELECT Id, B2B_Account__c, B2B_Date_Time_Of_Survey__c, B2B_Survey_Status__c, B2B_Survey__r.Name
                FROM B2B_Survey_Response__c
                WHERE B2B_Survey__c = :activeSurveyList[0].Id AND B2B_Account__c = :effectiveAccountId
                LIMIT 1
            ];

            if (loginCountList.isEmpty() == false) {
                if (loginCountList[0].get(B2B_Constants.STATUS_STRING) == B2B_Constants.SUCCESS) {
                    loginCount = Integer.valueOf(loginCountList[0].get(B2B_Constants.LOGIN_COUNT));
                }
                /* Start BS-1509 : Updated logic to set visibity of survey */
                if (
                    ((isHomePage == true &&
                    surveyResponseList.isEmpty() == false &&
                    surveyResponseList[0].B2B_Survey_Status__c != B2B_Constants.COMPLETED &&
                    surveyResponseList[0].B2B_Survey_Status__c != B2B_Constants.SURVEY_NO_RESPONSE) ||
                    (isHomePage == false &&
                    surveyResponseList.isEmpty() == true)) && loginCount > activeSurveyList[0].B2B_Number_Of_Logins__c
                ) {
                    isShowSurvey = true;
                }
                /* End BS-1509*/
            }
            return isShowSurvey;
        }
    }

    /**
     * @description getSurveyAndQuestions : Fetches the survey and its related questions with options and previous answer and returns a wrapper based on it
     * @param  userLocale : The current language locale of the user.
     * @param effectiveAccountId : Id of the account to which the user is associated.
     * @return B2B_SurveyAndQuestionWrapper : Object having all the details related to the survey
     * Added as part of BS-498
     */
    @AuraEnabled(cacheable=false)
    public static B2B_SurveyAndQuestionWrapper getSurveyAndQuestions(String userLocale, Id effectiveAccountId) {
        Id surveyId;
        Map<Id, B2B_Question__c> questionIdVsQuestionMap = new Map<Id, B2B_Question__c>();
        Map<Id, List<B2B_Option__c>> questionAndOptionMap = new Map<Id, List<B2B_Option__c>>();
        Map<Id, Id> questionIdVsSurveyQuestionIdMap = new Map<Id, Id>();
        Map<Id, Id> surveyQuestionIdVsquestionIdMap = new Map<Id, Id>(); //BS-1610
        Map<Id, B2B_Survey_Answer__c> questionIdVsAnswerMap = new Map<Id, B2B_Survey_Answer__c>();
        List<B2B_Survey_Answer__c> surveyAnswerList = new List<B2B_Survey_Answer__c>();

        /* Start BS-1610 */
        List<B2B_Survey_Question__c> surveyQuestionList = [
            SELECT Id, B2B_Survey__c, B2B_Survey__r.B2B_Is_Active__c, B2B_Survey_Question_Number__c
            FROM B2B_Survey_Question__c
            WHERE B2B_Survey__r.B2B_Is_Active__c = TRUE
            ORDER BY B2B_Survey_Question_Number__c
        ];

        List<B2B_Question__c> questionList = [
            SELECT Id, B2B_Type__c, B2B_Survey_Question__c, B2B_Question__c
            FROM B2B_Question__c
            WHERE B2B_Survey_Question__c IN :surveyQuestionList AND B2B_Language__c = :userLocale
        ];

        for (B2B_Question__c questionObj : questionList) {
            if (!questionIdVsQuestionMap.containsKey(questionObj.Id)) {
                questionIdVsQuestionMap.put(questionObj.Id, questionObj);
            }
            if (!questionIdVsSurveyQuestionIdMap.containsKey(questionObj.Id)) {
                questionIdVsSurveyQuestionIdMap.put(questionObj.Id, questionObj.B2B_Survey_Question__c);
            }
            if (!surveyQuestionIdVsquestionIdMap.containsKey(questionObj.Id)) {
                surveyQuestionIdVsquestionIdMap.put(questionObj.B2B_Survey_Question__c, questionObj.Id);
            }
        }

        if (surveyQuestionList.isEmpty() == false) {
            for (B2B_Survey_Question__c surveyQuestionsObj : surveyQuestionList) {
                if (String.isEmpty(surveyQuestionsObj.B2B_Survey__c) == false) {
                    surveyId = surveyQuestionsObj.B2B_Survey__c;
                }
            }
        }

        List<B2B_Survey_Response__c> surveyResponseList = [
            SELECT Id
            FROM B2B_Survey_Response__c
            WHERE B2B_Account__c = :effectiveAccountId AND B2B_Survey__c = :surveyId AND B2B_Survey_Status__c = :B2B_Constants.IN_PROGRESS
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];

        if (surveyResponseList.isEmpty() == false) {
            surveyAnswerList = [
                SELECT Id, B2B_Survey_Question__c, B2B_Survey_Response__c, B2B_Associated_Score__c, B2B_Answer_Comment__c
                FROM B2B_Survey_Answer__c
                WHERE B2B_Survey_Response__c = :surveyResponseList[0].Id
            ];
        }
        for (B2B_Survey_Answer__c surveyAnswerObj : surveyAnswerList) {
            if (
                !questionIdVsAnswerMap.containsKey(surveyAnswerObj.B2B_Survey_Question__c) &&
                surveyQuestionIdVsquestionIdMap.containsKey(surveyAnswerObj.B2B_Survey_Question__c)
            ) {
                questionIdVsAnswerMap.put(surveyQuestionIdVsquestionIdMap.get(surveyAnswerObj.B2B_Survey_Question__c), surveyAnswerObj);
            }
        }
        List<B2B_Option__c> optionList = [
            SELECT B2B_API_Name__c, B2B_Image__c, B2B_Label__c, B2B_Question__c, B2B_Question__r.B2B_Question__c, B2B_Question__r.B2B_Type__c
            FROM B2B_Option__c
            WHERE B2B_Question__c IN :questionIdVsQuestionMap.keySet()
            ORDER BY B2B_API_Name__c ASC
        ];

        /** Create a map having questions and its related options. */
        for (B2B_Option__c optionObj : optionList) {
            if (!questionAndOptionMap.containsKey(optionObj.B2B_Question__c)) {
                questionAndOptionMap.put(optionObj.B2B_Question__c, new List<B2B_Option__c>{ optionObj });
            } else if (questionAndOptionMap.containsKey(optionObj.B2B_Question__c)) {
                questionAndOptionMap.get(optionObj.B2B_Question__c).add(optionObj);
            }
        }
        /* End BS-1610 */

        B2B_SurveyAndQuestionWrapper surveyWrapperObj = populateSurveyWrapper(
            questionIdVsSurveyQuestionIdMap,
            questionAndOptionMap,
            questionIdVsQuestionMap,
            questionIdVsAnswerMap,
            surveyId
        );
        return surveyWrapperObj;
    }

    /**
     * @description populateSurveyWrapper
     * @param  questionIdVsSurveyQuestionIdMap : Map having key as question and its related survey question record
     * @param  questionAndOptionMap : Map having key as question and its all relatedB2B_Option__c records.
     * @param  questionIdVsQuestionMap : Map having key as question record related to that B2B_Question__c Id.
     * @param  questionIdVsAnswerMap : Map having key as question and its related previous B2B_Survey_Answer__c record.
     * @param surveyId : Id of the current survey.
     * @return B2B_SurveyAndQuestionWrapper : Final wrapper that will be sent to the UI component.
     * Added as part of BS-498
     */
    @TestVisible
    private static B2B_SurveyAndQuestionWrapper populateSurveyWrapper(
        Map<Id, Id> questionIdVsSurveyQuestionIdMap,
        Map<Id, List<B2B_Option__c>> questionAndOptionMap,
        Map<Id, B2B_Question__c> questionIdVsQuestionMap,
        Map<Id, B2B_Survey_Answer__c> questionIdVsAnswerMap,
        Id surveyId
    ) {
        B2B_SurveyAndQuestionWrapper surveyWrapperObj = new B2B_SurveyAndQuestionWrapper();
        surveyWrapperObj.surveyId = surveyId;
        List<B2B_SurveyQuestionWrapper> surveyQuestionwrapperList = new List<B2B_SurveyQuestionWrapper>();

        /** Iterate over the questions */
        for (Id questionId : questionIdVsQuestionMap.keySet()) {
            B2B_SurveyQuestionWrapper surveyQuestionWrapperobj = new B2B_SurveyQuestionWrapper();
            String questionResponse = '';
            List<B2B_SurveyQuestionOptionWrapper> questionOptionsWrapperList = new List<B2B_SurveyQuestionOptionWrapper>();

            surveyQuestionWrapperobj.questionId = questionId;
            surveyQuestionWrapperobj.question = questionIdVsQuestionMap.get(questionId).B2B_Question__c;

            if (questionIdVsQuestionMap.containsKey(questionId) && questionIdVsQuestionMap.get(questionId).B2B_Type__c == B2B_Constants.TEXT_PICKLIST) {
                surveyQuestionWrapperobj.isText = true;
                surveyQuestionWrapperobj.hasOptions = false;
            } else if (
                questionIdVsQuestionMap.containsKey(questionId) && questionIdVsQuestionMap.get(questionId).B2B_Type__c == B2B_Constants.OPTIONS_PICKLIST
            ) {
                surveyQuestionWrapperobj.hasOptions = true;
                surveyQuestionWrapperobj.isText = false;
            }

            if (questionIdVsSurveyQuestionIdMap.containsKey(questionId)) {
                surveyQuestionWrapperobj.surveyQuestionId = questionIdVsSurveyQuestionIdMap.get(questionId);
            }

            /** If user has already answered a question but the survey is in progress populate the wrapper. */
            B2B_SurveyAnswerWrapper surveyAnswerObj = new B2B_SurveyAnswerWrapper();
            if (questionIdVsAnswerMap.containsKey(questionId)) {
                surveyAnswerObj.answer = String.valueOf(questionIdVsAnswerMap.get(questionId).B2B_Associated_Score__c);
                surveyAnswerObj.comment = questionIdVsAnswerMap.get(questionId).B2B_Answer_Comment__c;
                surveyAnswerObj.surveyAnswerId = questionIdVsAnswerMap.get(questionId).Id;
                surveyAnswerObj.surveyQuestionId = questionIdVsAnswerMap.get(questionId).B2B_Survey_Question__c;
                surveyAnswerObj.surveyResponseId = questionIdVsAnswerMap.get(questionId).B2B_Survey_Response__c;
            }
            surveyQuestionWrapperobj.answerObject = surveyAnswerObj;
            /*End: Population of wrapper containing previous answered response */

            //Fill the question specific wrapper.
            if (questionAndOptionMap.containsKey(questionId) && questionIdVsQuestionMap.get(questionId).B2B_Type__c == B2B_Constants.OPTIONS_PICKLIST) {
                for (B2B_Option__c optionObj : questionAndOptionMap.get(questionId)) {
                    B2B_SurveyQuestionOptionWrapper surveyQuestionOptionWrapper = new B2B_SurveyQuestionOptionWrapper();
                    surveyQuestionOptionWrapper.optionId = optionObj.Id;
                    surveyQuestionOptionWrapper.label = optionObj.B2B_Label__c;
                    surveyQuestionOptionWrapper.score = optionObj.B2B_API_Name__c;
                    surveyQuestionOptionWrapper.imageURL = optionObj.B2B_Image__c;
                    if (
                        questionIdVsAnswerMap.containsKey(questionId) &&
                        optionObj.B2B_API_Name__c == questionIdVsAnswerMap.get(questionId).B2B_Associated_Score__c
                    ) {
                        surveyQuestionOptionWrapper.isSelected = true;
                    } else {
                        surveyQuestionOptionWrapper.isSelected = false;
                    }
                    questionOptionsWrapperList.add(surveyQuestionOptionWrapper);
                }
            } else if (questionIdVsAnswerMap.containsKey(questionId) && questionIdVsQuestionMap.get(questionId).B2B_Type__c == B2B_Constants.TEXT_PICKLIST) {
                questionResponse = questionIdVsAnswerMap.get(questionId).B2B_Answer_Comment__c;
            }
            surveyQuestionWrapperobj.questionResponse = questionResponse;
            surveyQuestionWrapperobj.questionOptionsList = questionOptionsWrapperList;
            surveyQuestionwrapperList.add(surveyQuestionWrapperobj);
        }
        surveyWrapperObj.surveyQuestionList = surveyQuestionwrapperList;
        return surveyWrapperObj;
    }

    /**
     * @description saveSurveyAnswer : This method saves the user response from the survey.
     * @param  surveyObject : JSON containing all the user inputs
     * @param  effectiveAccountId : Id of the account to which the user is associated with.
     * @param  surveyId : Id of the current survey.
     * @param  hasOptions : Boolean if the current question of type Options
     * @param isSubmit : Boolean if thge survey needs to be sbmitted.
     * @param surveyResponseId : Id of the survey Response created on first screen of survey.
     * @return B2B_SurveyAnswerWrapper : Final wrapper that will be sent to the UI component for the current answer.
     * Added as part of BS-498
     */
    @AuraEnabled(cacheable=false)
    public static B2B_SurveyController.B2B_SurveyAnswerWrapper saveSurveyAnswer(
        String surveyObject,
        Id effectiveAccountId,
        Id surveyId,
        Boolean hasOptions,
        Boolean isSubmit,
        Id surveyResponseId
    ) {
        /**
         * Example JSON
         * answerObject": {
                "answer": "9",
                "surveyAnswerId": "a1U8E000003ChYJUA0",
                "surveyQuestionId": "a1T8E000006C8HMUA0",
            }
            */
        B2B_SurveyAnswerWrapper answerMap = (B2B_SurveyAnswerWrapper) JSON.deserializeStrict(surveyObject, B2B_SurveyAnswerWrapper.class);
        B2B_Survey_Response__c surveyResponseObj = new B2B_Survey_Response__c();
        /* Start : BS-1509 */
        if (surveyResponseId != null) {
            surveyResponseObj.Id = surveyResponseId;
            surveyResponseObj.B2B_Survey_Status__c = B2B_Constants.IN_PROGRESS;
        }
        /* End : BS-1509 */
        B2B_Survey_Answer__c surveyAnswerObj = new B2B_Survey_Answer__c();
        if (answerMap.surveyAnswerId == null) {
            surveyAnswerObj.B2B_Survey__c = surveyId;
            surveyAnswerObj.B2B_Survey_Response__c = surveyResponseObj.Id;
            if (hasOptions == true && answerMap.answer != null) {
                surveyAnswerObj.B2B_Associated_Score__c = Integer.valueOf(answerMap.answer);
            } else if (hasOptions == false && answerMap.answer != null) {
                surveyAnswerObj.B2B_Answer_Comment__c = (String) answerMap.answer;
            }
            if (answerMap.comment != null) {
                surveyAnswerObj.B2B_Answer_Comment__c = answerMap.comment;
            }
            surveyAnswerObj.B2B_Survey_Question__c = answerMap.surveyQuestionId;
            insert surveyAnswerObj;
        } else if (answerMap.surveyAnswerId != null) {
            surveyAnswerObj.B2B_Survey_Response__c = surveyResponseObj.Id;
            surveyAnswerObj.Id = answerMap.surveyAnswerId;
            if (hasOptions == true && answerMap.answer != null) {
                surveyAnswerObj.B2B_Associated_Score__c = Integer.valueOf(answerMap.answer);
            } else if (hasOptions == false && answerMap.answer != null) {
                surveyAnswerObj.B2B_Answer_Comment__c = (String) answerMap.answer;
            }
            if (answerMap.comment != null) {
                surveyAnswerObj.B2B_Answer_Comment__c = answerMap.comment;
            }
            surveyAnswerObj.B2B_Survey_Question__c = answerMap.surveyQuestionId;
            surveyAnswerObj.B2B_Survey__c = surveyId;
            update surveyAnswerObj;
        }
        /* Start : BS-1509 */
        if (isSubmit == true) {
            surveyResponseObj.B2B_Survey_Status__c = B2B_Constants.COMPLETED;
        }
        try {
            update surveyResponseObj;
        } catch (DmlException exceptionInstance) {
            B2B_LogUtils.createPersistLogAsync(
                exceptionInstance.getMessage(),
                B2B_LogUtils.LOG_PROCESS_SURVEY_COMMIT,
                B2B_LogUtils.LOG_TYPE_ERROR,
                'B2B_SurveyController',
                surveyResponseId
            );
        }
        /* End : BS-1509 */

        B2B_SurveyAnswerWrapper answerObject = new B2B_SurveyAnswerWrapper();
        answerObject.answer = String.valueOf(surveyAnswerObj.B2B_Associated_Score__c);
        answerObject.comment = surveyAnswerObj.B2B_Answer_Comment__c;
        answerObject.surveyAnswerId = surveyAnswerObj.Id;
        answerObject.surveyQuestionId = surveyAnswerObj.B2B_Survey_Question__c;
        answerObject.surveyResponseId = surveyResponseObj.Id;
        return answerObject;
    }

    /**
     * @description getSurveyResponseId : Returns the fetched or created the survey response object
     * @param effectiveAccountId : Id of the account to which the user is associated.
     * @return B2B_Survey_Response__c : Returns the survey response object
     * Added as part of BS-1509
     */
    @AuraEnabled(cacheable=false)
    public static B2B_Survey_Response__c getSurveyResponseId(Id effectiveAccountId) {
        B2B_Survey_Response__c surveyResponseObj = new B2B_Survey_Response__c();
        List<B2B_Survey_Response__c> surveyResponseList = new List<B2B_Survey_Response__c>();

        List<B2B_Survey__c> activeSurveyList = [
            SELECT Id, B2B_Is_Active__c, B2B_Number_Of_Logins__c, B2B_Survey_Start_Date__c
            FROM B2B_Survey__c
            WHERE B2B_Is_Active__c = TRUE
            LIMIT 1
        ];

        /** If active survey exist check if response for same survey exist for the current logged in user's account*/
        if (activeSurveyList.isEmpty() == false) {
            surveyResponseList = [
                SELECT Id
                FROM B2B_Survey_Response__c
                WHERE B2B_Account__c = :effectiveAccountId AND B2B_Survey__c = :activeSurveyList[0].Id
                ORDER BY CreatedDate DESC
                LIMIT 1
            ];

            if (surveyResponseList.isEmpty() == false) {
                surveyResponseObj = surveyResponseList[0];
            } else {
                surveyResponseObj.B2B_Account__c = effectiveAccountId;
                surveyResponseObj.B2B_Survey__c = activeSurveyList[0].Id;
                surveyResponseObj.B2B_Date_Time_Of_Survey__c = System.now();
                surveyResponseObj.B2B_Survey_Status__c = B2B_Constants.SURVEY_OPEN_STATUS;
                insert surveyResponseObj;
            }
        }
        return surveyResponseObj;
    }

    @AuraEnabled(cacheable=false)
    public static void updateNoResponseCount(Id surveyResponseId) {
        List<B2B_Survey_Response__c> surveyResponseList = [
            SELECT Id, B2B_No_Response__c, B2B_Survey_Status__c
            FROM B2B_Survey_Response__c
            WHERE Id = :surveyResponseId
            LIMIT 1
        ];

        if (surveyResponseList.isEmpty() == false) {
            surveyResponseList[0].B2B_No_Response__c += 1;
            if (surveyResponseList[0].B2B_No_Response__c == 3 && surveyResponseList[0].B2B_Survey_Status__c != B2B_Constants.COMPLETED) {
                surveyResponseList[0].B2B_Survey_Status__c = B2B_Constants.SURVEY_NO_RESPONSE;
            }
            update surveyResponseList;
        }
    }

    public class B2B_SurveyAndQuestionWrapper {
        @AuraEnabled
        public String surveyId; //Id of the current survey

        @AuraEnabled
        public List<B2B_SurveyQuestionWrapper> surveyQuestionList; // List having data of all the questions shown on the UI with options and previous answers.
    }

    public class B2B_SurveyQuestionWrapper {
        @AuraEnabled
        public Id surveyQuestionId; //The Id of the B2B_Survey_Question__c related to the question

        @AuraEnabled
        public Id questionId; //Id of the question.

        @AuraEnabled
        public Boolean isText; //Flag to show if this question is Text based.

        @AuraEnabled
        public Boolean hasOptions; //Flag to show if this question has option.

        @AuraEnabled
        public String question; // The question expression shown to the user.

        @AuraEnabled
        public B2B_SurveyAnswerWrapper answerObject; //Data of the earlier anwered reponse.

        @AuraEnabled
        public List<B2B_SurveyQuestionOptionWrapper> questionOptionsList; //List of options associated with the question

        @AuraEnabled
        public String questionResponse; //If text based question, what value needs to be populates
    }

    public class B2B_SurveyQuestionOptionWrapper {
        @AuraEnabled
        public Id optionId;

        @AuraEnabled
        public String label;

        @AuraEnabled
        public String imageURL;

        @AuraEnabled
        public Decimal score;

        @AuraEnabled
        public Boolean isSelected;
    }

    public class B2B_SurveyAnswerWrapper {
        @AuraEnabled
        public Id surveyResponseId; //The survey response to which this answer is associated to

        @AuraEnabled
        public Id surveyAnswerId; //Id of the survey answer record

        @AuraEnabled
        public String answer; //The value selected earlier by the user

        @AuraEnabled
        public Id surveyQuestionId; //Id of survey question record to which this answer record is accociated to.

        @AuraEnabled
        public String comment; //Associated comment with the selected value entered by the user.
    }
}
