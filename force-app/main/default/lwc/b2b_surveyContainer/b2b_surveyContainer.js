/* eslint-disable no-undef */
import { LightningElement, api, track } from 'lwc';

//Controller Methods
import getSurveyAndQuestions from '@salesforce/apex/B2B_SurveyController.getSurveyAndQuestions';
import saveSurveyAnswer from '@salesforce/apex/B2B_SurveyController.saveSurveyAnswer';
import getSurveyResponseId from '@salesforce/apex/B2B_SurveyController.getSurveyResponseId'; //Added as part of BS-1509
import updateNoResponseCount from '@salesforce/apex/B2B_SurveyController.updateNoResponseCount'; //Added as part of BS-1509

//Labels
import LANG from '@salesforce/i18n/lang';
import userId from '@salesforce/user/Id';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';
import BUTTON_LABELS from '@salesforce/label/c.B2B_VS_RX_Labels';
import SUBMIT_BUTTON_LABEL from '@salesforce/label/c.SUBMIT_BUTTON_LABEL';
import SURVEY_CLOSING_LABEL from '@salesforce/label/c.B2B_SURVEY_CLOSING_LABEL';
import COMMENT_LABELS from '@salesforce/label/c.B2B_SURVEY_COMMENT_LABELS';
import SURVEY_OPENING from '@salesforce/label/c.B2B_SURVEY_OPENING';
import LINK_FOR_SURVEY from '@salesforce/label/c.B2B_LINK_FOR_SURVEY';
import SURVEY_OPENING_FOOTER from '@salesforce/label/c.B2B_SURVEY_OPENING_FOOTER';
import SURVEY_ERROR from '@salesforce/label/c.B2B_SURVEY_ERROR';

const SH_STORE = 'silhouette';
const HOME_PAGE_SOURCE = 'Home Page'; //Added as part of BS-1509
const LOAD_EVENT = 'beforeunload'; //Added as part of BS-1509
const BACK_EVENT = 'popstate'; //Added as part of BS-1509
const USER_CLOSE_FLAG = 'surveyclosed'; //BS-1509
const SURVEY_CLOSE_EVENT = 'surveyclose'; //BS-1509
const SURVEY_LOAD_COMPLETE = 'surveyload'; //BS-1509
const SURVEY_PAGE_SOURCE = 'checkout'; //BS-1509

export default class B2b_surveyContainer extends LightningElement {
    @api effectiveAccountId;
    @api pageSource; //Added as part of BS-1509
    @api userId = userId;
    @api userLocale = LANG.replace('-', '_');

    @track _questions = [];

    _count;
    _error;
    _isShowModal;
    _showModal = false;
    _currentIndex = 0;
    @track
    _currentQuestion = {};
    _showCard = true;
    _questionList = [];
    _surveyId;
    _closeIcon = STORE_STYLING + '/icons/cross.svg';
    _nextButtonLabel = BUTTON_LABELS.split(',')[0];
    _backButtonLabel = BUTTON_LABELS.split(',')[1];
    _submitButtonLabel = SUBMIT_BUTTON_LABEL.split(',')[0];
    _showBack = false;
    _showNext = true;
    _showSubmit = false;
    _showSurveyOpening = true;
    _showSurvey = false;
    _showSurveyClosing = false;
    _commentLabel = COMMENT_LABELS.split(',')[0];
    _reponseLabel = COMMENT_LABELS.split(',')[1];
    _validationError = false;

    @track
    _closingLabel = {
        thanksLabel: SURVEY_CLOSING_LABEL.split(',')[0],
        appreciationLabel: SURVEY_CLOSING_LABEL.split(',')[1],
        silhouetteClosingLabel: SURVEY_CLOSING_LABEL.split(',')[2],
        neubauClosingLabel: SURVEY_CLOSING_LABEL.split(',')[3]
    };

    @track
    _surveyOpeningLabel = {
        thanksLabel: SURVEY_OPENING.split(':')[0],
        informationLabel: SURVEY_OPENING.split(':')[1],
        linkToSurvey: LINK_FOR_SURVEY,
        footerInfo: SURVEY_OPENING_FOOTER.split('/')[0],
        footerNote: SURVEY_OPENING_FOOTER.split('/')[1],
        footerFurtherInformation: SURVEY_OPENING_FOOTER.split('/')[2]
    };

    @track
    _errorLabel = {
        optionError: SURVEY_ERROR.split(',')[0],
        commentError: SURVEY_ERROR.split(',')[1]
    };

    _showTextArea = true;

    _isSilhouetteStore = false;

    _isNextDisabled = false;

    _surveyResponseId; //Added as part of BS-1509

    async connectedCallback() {
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');

        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }
        //Get Survey and Survey questions
        await getSurveyAndQuestions({ userLocale: this.userLocale, effectiveAccountId: this.effectiveAccountId })
            .then((result) => {
                if (
                    result.surveyQuestionList !== undefined &&
                    result.surveyQuestionList !== null &&
                    result.surveyQuestionList.length > 0 &&
                    result.surveyId !== undefined &&
                    result.surveyId
                ) {
                    this._surveyId = result.surveyId;
                    this._questionList = result.surveyQuestionList;
                    this._currentQuestion = this._questionList[this._currentIndex];
                    this._error = undefined;
                    if (this._questionList.length === 1) {
                        this._showNext = false;
                        this._showBack = false;
                        this._showSubmit = true;
                    }
                } else {
                    this._showModal = false;
                }
            })
            .catch((errorInstance) => {
                this._error = errorInstance;
                this._questions = undefined;
                this._showModal = false;
            });

        /* Start : BS-1509 */
        await getSurveyResponseId({ effectiveAccountId: this.effectiveAccountId })
            .then((result) => {
                let responseObject = result;
                this._surveyResponseId = responseObject.Id;
            })
            .catch((errorInstance) => {
                this._error = errorInstance;
            });
        if (this.pageSource !== HOME_PAGE_SOURCE) {
            window.addEventListener(LOAD_EVENT, () => this.handleBeforeUnload(this._surveyResponseId, this._showModal));
            window.addEventListener(BACK_EVENT, () => this.handleBeforeUnload(this._surveyResponseId, this._showModal));
        }

        this._showModal = true;
        if (this.pageSource === SURVEY_PAGE_SOURCE) {
            this.dispatchEvent(new CustomEvent(SURVEY_LOAD_COMPLETE));
        }
        /* End : BS-1509 */
    }

    handleDialogClose() {
        /* Start : BS-1509 */
        if (this.pageSource !== HOME_PAGE_SOURCE) {
            this.dispatchEvent(
                new CustomEvent(SURVEY_CLOSE_EVENT, {
                    detail: {
                        click: true
                    }
                })
            );
        }

        /* End : BS-1509 */
        window.removeEventListener(LOAD_EVENT);
        window.removeEventListener(BACK_EVENT);
        if (this.pageSource === HOME_PAGE_SOURCE) {
            localStorage.setItem(USER_CLOSE_FLAG, true);
        }
        updateNoResponseCount({ surveyResponseId: this._surveyResponseId });
        /* End : BS-1509 */
        this._showModal = false;
    }

    handleNext(event) {
        this._isNextDisabled = true;
        this._showSurvey = false;
        this._validationError = this.validateSelection();
        if (this._validationError == false) {
            this.saveUserResponse(this._currentQuestion.answerObject, this.effectiveAccountId, this._surveyId, this._currentQuestion.hasOptions, false).then(
                () => {
                    if (this._currentIndex == this._questionList.length - 2) {
                        this._showNext = false;
                        this._showSubmit = true;
                    }
                    if (this._currentIndex < this._questionList.length - 1) {
                        this._currentIndex++;
                        this._currentQuestion = this._questionList[this._currentIndex];
                    }
                    if (this._currentIndex != 0) {
                        this._showBack = true;
                    } else if (this._currentIndex == 0) {
                        this._showBack = false;
                    }
                    this._isNextDisabled = false;
                }
            );
        } else {
            this._isNextDisabled = false;
        }
        this._showSurvey = true;
    }

    handleBack(event) {
        this._validationError = false;
        this._showSurvey = false;

        if (this._currentIndex == this._questionList.length - 1) {
            this._showNext = true;
        }
        if (this._currentIndex > 0) {
            this._currentIndex--;
            if (this._currentIndex != this._questionList.length - 1) {
                this._showSubmit = false;
            }
            this._currentQuestion = this._questionList[this._currentIndex];
            if (this._currentIndex == 0) {
                this._showBack = false;
            }
        }
        this._showSurvey = true;
    }

    handleQuestionScore(event) {
        let selectedAnswer = event.target.dataset.scoreValue;
        let surveyQuestionId = event.target.dataset.surveyQuestionId;
        let selectedOptionId = event.target.dataset.id;
        for (let index = 0; index < this._currentQuestion.questionOptionsList.length; index++) {
            this._currentQuestion.questionOptionsList[index].isSelected = false;
        }
        let optionObj = this._currentQuestion.questionOptionsList.find((itr) => itr.optionId === selectedOptionId);
        optionObj.isSelected = true;
        this._currentQuestion.answerObject = { ...this._currentQuestion.answerObject, answer: selectedAnswer, surveyQuestionId: surveyQuestionId };
    }

    populateQuestionResponse(event) {
        let surveyQuestionId = event.target.dataset.surveyQuestionId;
        let selectedAnswer = event.target.value;
        this._currentQuestion.answerObject = { ...this._currentQuestion.answerObject, answer: selectedAnswer, surveyQuestionId: surveyQuestionId };
    }

    handleComment(event) {
        let surveyQuestionId = event.target.dataset.surveyQuestionId;
        let selectedAnswer = event.target.value;
        this._currentQuestion.answerObject = { ...this._currentQuestion.answerObject, comment: selectedAnswer, surveyQuestionId: surveyQuestionId };
    }

    handleSubmit() {
        this._validationError = this.validateSelection();
        if (this._validationError == false) {
            this.saveUserResponse(this._currentQuestion.answerObject, this.effectiveAccountId, this._surveyId, this._currentQuestion.hasOptions, true)
                .then(() => {
                    this._showSurvey = false;
                    this._showSurveyClosing = true;
                })
                .catch((errorInstance) => {
                    this._error = errorInstance;
                });
        }
    }

    async saveUserResponse(answerJSON, effectiveAccountId, surveyId, hasOptions, isSubmit) {
        await saveSurveyAnswer({
            surveyObject: JSON.stringify(answerJSON),
            effectiveAccountId: effectiveAccountId,
            surveyId: surveyId,
            hasOptions: hasOptions,
            isSubmit: isSubmit,
            surveyResponseId: this._surveyResponseId
        })
            .then((result) => {
                this._currentQuestion.answerObject = { ...this._currentQuestion.answerObject, ...result };
                let responseId = result.surveyResponseId;
                for (let index = 0; index < this._questionList.length; index++) {
                    if (
                        this._questionList[index].answerObject !== undefined &&
                        this._questionList[index].answerObject !== null &&
                        (this._questionList[index].answerObject.surveyResponseId === undefined ||
                            this._questionList[index].answerObject.surveyResponseId === null)
                    ) {
                        this._questionList[index].answerObject = { ...this._questionList[index].answerObject, surveyResponseId: responseId };
                    }
                }
            })
            .catch((errorInstance) => {
                this._error = errorInstance;
            });
    }

    openSurvey(event) {
        this._showSurveyOpening = false;
        this._showSurveyClosing = false;
        this._showSurvey = true;
    }

    validateSelection() {
        let whiteSpaceOnlyRegex = /^\s*$/;
        if (
            this._currentQuestion.isText == false &&
            this._currentQuestion.answerObject.answer !== undefined &&
            (this._currentQuestion.answerObject.answer !== null || this._currentQuestion.answerObject.answer == '')
        ) {
            return false;
        } else if (
            this._currentQuestion.isText == true &&
            this._currentQuestion.answerObject.answer !== undefined &&
            this._currentQuestion.answerObject.answer !== null &&
            whiteSpaceOnlyRegex.test(this._currentQuestion.answerObject.answer) === false
        ) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * BS-1509
     * If the component gets removed from dom update the no  response count
     * If user gets disconnected from internet, closes the Tab, window
     */
    disconnectedCallback() {
        if (this.pageSource !== HOME_PAGE_SOURCE) {
            window.removeEventListener(LOAD_EVENT);
            window.removeEventListener(BACK_EVENT);
            this.handleBeforeUnload(this._surveyResponseId, this._showModal);
        }
    }

    /**
     * BS-1509
     * @param {*} _surveyResponseId
     * @param {*} showModal
     * Method which updated the no response count if user reloads or press browser back
     */
    handleBeforeUnload(_surveyResponseId, showModal) {
        if (showModal === true) {
            updateNoResponseCount({ surveyResponseId: _surveyResponseId });
        }
    }
}
