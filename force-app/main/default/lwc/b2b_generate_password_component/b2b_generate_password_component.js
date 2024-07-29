import { LightningElement, track, wire, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import B2B_GENERATE_PASSWORD_UTILITY_LABELS from '@salesforce/label/c.B2B_GENERATE_PASSWORD_UTILITY_LABELS';
import B2B_Something_Went_Wrong from '@salesforce/label/c.B2B_Something_Went_Wrong';
import setPassword from '@salesforce/apex/B2B_Utils.setPassword';
import getProcessStatus from '@salesforce/apex/B2B_Utils.getProcessStatus';
import fetchUserAssociatedWithAccount from '@salesforce/apex/B2B_Utils.fetchUserAssociatedWithAccount';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

//BS-1849 - Start
const FIELD_TYPE_PASSWORD = 'password';
const FIELD_TYPE_TEXT = 'text';
const HIDE_ICON = 'utility:hide';
const EYE_ICON = 'utility:preview';
const VALID_CLASS = 'valid';
const INVALID_CLASS = 'invalid';
const ERROR_TITLE = 'Error';
const SUCCESS_TITLE = 'Success';
const TOAST_TYPE_ERROR = 'error';
const TOAST_TYPE_SUCCESS = 'success';
const PROCESSING_STATUS_COMPLETED = 'Completed';
const PROCESSING_STATUS_FAILED = 'Failed';
const PROCESSING_STATUS_ABORTED = 'Aborted';
const REPEATED_PASSWORD_EXCEPTION = 'UNKNOWN_EXCEPTION: invalid repeated password';
const REQUIREMENTS_CLASS_VALID = 'requirements valid';
const REQUIREMENTS_CLASS_INVALID = 'requirements invalid';
//BS-1849 - End

export default class B2b_generate_password_component extends LightningElement {
    /**
     * Variable to store record Id from current screen
     * BS-1849
     * @type {String}
     */
    @api recordId;

    /**
     * Variable to store password entered by user on UI into Enter New Password field
     * BS-1849
     * @type {String}
     */
    newPassword;

    /**
     * Variable to store password entered by user on UI into Confirm New Password field
     * BS-1849
     * @type {String}
     */
    verifyPassword;

    /**
     * Variable to store userId of User associated with Account
     * BS-1849
     * @type {String}
     */
    userId;

    /**
     * Variable to indicate whether the entered password is of desired size (at least 8 characters)
     * BS-1849
     * @type {Boolean}
     */
    passwordOfDesiredLength = false;

    /**
     * Variable to indicate whether the entered password matches the pattern (alphanumeric)
     * BS-1849
     * @type {Boolean}
     */
    passwordOfDesiredPattern = false;

    /**
     * Variable to control visibilty of 'SAVE' button on UI
     * BS-1849
     * @type {Boolean}
     */
    showSetPasswordButton = false;

    /**
     * Variable to control visibilty of 'SET PASSWORD' button on UI
     * BS-1849
     * @type {Boolean}
     */
    disableSetPasswordButton = true;

    /**
     * Variable to control loader on UI
     * BS-1849
     * @type {Boolean}
     */
    isLoading = true;

    /**
     * Variable to indicate whether the initial setup is complete and UI is ready to be shown
     * BS-1849
     * @type {Boolean}
     */
    isInitialLoadComplete = false;

    /**
     * Variable to indicate whether both passwords matches
     * BS-1849
     * @type {Boolean}
     */
    showPasswordMismatchMessage = false;

    /**
     * Variable to indicate field type of New Password field
     * BS-1849
     * @type {Boolean}
     */
    newPasswordFieldType = FIELD_TYPE_PASSWORD;

    /**
     * Variable to indicate the applicable icon on Confirm New Password field
     * BS-1849
     * @type {Boolean}
     */
    newPasswordIconName = HIDE_ICON;

    /**
     * Variable to indicate field type of Confirm New Password field
     * BS-1849
     * @type {Boolean}
     */
    verifyPasswordFieldType = FIELD_TYPE_PASSWORD;

    /**
     * Variable to indicate the applicable icon on Confirm New Password field
     * BS-1849
     * @type {Boolean}
     */
    verifyPasswordIconName = HIDE_ICON;

    /**
     * Variable to indicate whether there is any account that the user belongs to
     * BS-1849
     * @type {Boolean}
     */
    userNotFound = false;

    /**
     * Variable to indicate whether there validations of password to be shown on UI
     * BS-1849
     * @type {Boolean}
     */
    showPasswordValidations = true;

    /**
     * Collection Variable that holds all of the  applicable labels that needs to be shown on UI
     * BS-1849
     * @type {Boolean}
     */
    labels = {
        headerLabel: B2B_GENERATE_PASSWORD_UTILITY_LABELS.split(',')[0],
        passwordLengthValidationErrorLabel: B2B_GENERATE_PASSWORD_UTILITY_LABELS.split(',')[1],
        passwordCombinationValidationErrorLabel: B2B_GENERATE_PASSWORD_UTILITY_LABELS.split(',')[2],
        passwordMisMatchValidationErrorLabel: B2B_GENERATE_PASSWORD_UTILITY_LABELS.split(',')[3],
        saveButtonLabel: B2B_GENERATE_PASSWORD_UTILITY_LABELS.split(',')[4],
        passwordSetSuccessfullMessageLabel: B2B_GENERATE_PASSWORD_UTILITY_LABELS.split(',')[5],
        passwordChangeNotAllowedLabel: B2B_GENERATE_PASSWORD_UTILITY_LABELS.split(',')[6] + B2B_GENERATE_PASSWORD_UTILITY_LABELS.split(',')[7],
        userDoesNotExistLabel: B2B_GENERATE_PASSWORD_UTILITY_LABELS.split(',')[8],
        newPasswordInputFieldLabel: B2B_GENERATE_PASSWORD_UTILITY_LABELS.split(',')[9],
        confirmNewPasswordInputFieldLabel: B2B_GENERATE_PASSWORD_UTILITY_LABELS.split(',')[10],
        repeatedPasswordErrorLabel: B2B_GENERATE_PASSWORD_UTILITY_LABELS.split(',')[11],
        generalErrorLabel: B2B_Something_Went_Wrong
    };

    // Capturing current page reference to fetch th record Id
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.recordId =
                currentPageReference && currentPageReference.state && currentPageReference.state.recordId ? currentPageReference.state.recordId : null;
        }
    }

    async connectedCallback() {
        if (this.recordId) {
            await fetchUserAssociatedWithAccount({ accountId: this.recordId })
                .then((result) => {
                    if (result && result[0] && result[0].Id) {
                        this.userId = result[0].Id;
                        this.isLoading = false;
                        this.userNotFound = false;
                        this.isInitialLoadComplete = true;
                    } else {
                        this.isLoading = false;
                        this.userNotFound = true;
                        this.isInitialLoadComplete = true;
                    }
                })
                .catch((error) => {
                    console.error(error);
                    this.isLoading = false;
                    this.isInitialLoadComplete = true;
                });
        } else {
            this.isLoading = false;
            this.userNotFound = true;
        }
    }

    /**
     * This method is used to handle the click on eye icon present next to Enter new password field'
     * BS-1849
     *
     */
    toggleNewPasswordVisibility() {
        this.newPasswordFieldType = this.newPasswordFieldType === FIELD_TYPE_PASSWORD ? FIELD_TYPE_TEXT : FIELD_TYPE_PASSWORD;
        this.newPasswordIconName = this.newPasswordFieldType === FIELD_TYPE_PASSWORD ? HIDE_ICON : EYE_ICON;
    }

    /**
     * This method is used to handle the click on eye icon present next to Confirm new password field'
     * BS-1849
     *
     */
    toggleVerifyPasswordVisibility() {
        this.verifyPasswordFieldType = this.verifyPasswordFieldType === FIELD_TYPE_PASSWORD ? FIELD_TYPE_TEXT : FIELD_TYPE_PASSWORD;
        this.verifyPasswordIconName = this.verifyPasswordFieldType === FIELD_TYPE_PASSWORD ? HIDE_ICON : EYE_ICON;
    }

    /**
     * This method is a getter method to get the applicable class styling
     * BS-1849
     *
     */
    get passwordLengthClass() {
        this.passwordOfDesiredLength = this.newPassword && this.newPassword.length >= 8 ? true : false;
        return this.newPassword && this.newPassword.length >= 8 ? VALID_CLASS : INVALID_CLASS;
    }

    /**
     * This method is a getter method to get the applicable class styling
     * BS-1849
     *
     */
    get passwordAlphaNumericClass() {
        const alphaNumericRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*()_+=.-]*$/;
        this.passwordOfDesiredPattern = this.newPassword && alphaNumericRegex.test(this.newPassword) ? true : false;
        return this.newPassword && alphaNumericRegex.test(this.newPassword) ? VALID_CLASS : INVALID_CLASS;
    }

    /**
     * This method is a getter method to get the applicable class styling
     * BS-1849
     *
     */
    get passwordRequirementsClass() {
        return this.passwordLengthClass === VALID_CLASS && this.passwordAlphaNumericClass === VALID_CLASS
            ? REQUIREMENTS_CLASS_VALID
            : REQUIREMENTS_CLASS_INVALID;
    }

    /**
     * This method is used to handle the event fired during input given by user for New Password field
     * BS-1849
     *
     */
    handleNewPasswordChange(event) {
        this.newPassword = event.target.value;
        this.disableSetPasswordButton =
            this.newPassword && this.verifyPassword && this.newPassword === this.verifyPassword && this.passwordOfDesiredLength && this.passwordOfDesiredPattern
                ? false
                : true;
        if (this.newPassword && this.verifyPassword && this.newPassword !== this.verifyPassword) {
            this.showPasswordMismatchMessage = true;
        } else if (this.newPassword && this.verifyPassword && this.newPassword === this.verifyPassword) {
            this.showPasswordMismatchMessage = false;
        }
        if (this.disableSetPasswordButton == false) {
            this.showPasswordValidations = false;
        } else {
            this.showPasswordValidations = true;
        }
    }

    /**
     * This method is used to handle the event fired during input given by user for Conform nNew Password field
     * BS-1849
     *
     */
    handleVerifyPasswordChange(event) {
        this.verifyPassword = event.target.value;
        this.disableSetPasswordButton =
            this.newPassword && this.verifyPassword && this.newPassword === this.verifyPassword && this.passwordOfDesiredLength && this.passwordOfDesiredPattern
                ? false
                : true;
        if (this.newPassword && this.verifyPassword && this.newPassword !== this.verifyPassword) {
            this.showPasswordMismatchMessage = true;
        } else if (this.newPassword && this.verifyPassword && this.newPassword === this.verifyPassword) {
            this.showPasswordMismatchMessage = false;
        }
        if (this.disableSetPasswordButton == false) {
            this.showPasswordValidations = false;
        } else {
            this.showPasswordValidations = true;
        }
    }

    /**
     * This method is used to handle the event triggered on click of 'Save' button on UI
     * BS-1849
     *
     */
    setUserPassword() {
        this.isLoading = true;
        if (
            this.userId &&
            this.newPassword &&
            this.verifyPassword &&
            this.newPassword === this.verifyPassword &&
            this.passwordOfDesiredLength &&
            this.passwordOfDesiredPattern
        ) {
            // Invoking SetPassword method from Apex
            setPassword({ userId: this.userId, newPassword: this.newPassword })
                .then((result) => {
                    // If the setPassowrd method is successfully executed and result obtained, then invoking a next method after a slight delay
                    if (result) {
                        //Adding a delay of 3 sec for execution of next function
                        setTimeout(() => {
                            this.checkSetPasswordStatus(result);
                        }, 3000);
                    } else {
                        this.isLoading = false;
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: ERROR_TITLE,
                                message: this.labels.generalErrorLabel,
                                variant: TOAST_TYPE_ERROR
                            })
                        );
                    }
                })
                .catch((exceptionInstance) => {
                    console.error(exceptionInstance);
                    this.isLoading = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: ERROR_TITLE,
                            message: this.labels.generalErrorLabel,
                            variant: TOAST_TYPE_ERROR
                        })
                    );
                });
        } else {
            this.isLoading = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: this.labels.generalErrorLabel,
                    variant: TOAST_TYPE_ERROR
                })
            );
        }
    }

    /**
     * This method is used to check whether the password has been successfully set for the user
     * BS-1849
     *
     */
    checkSetPasswordStatus(executionId) {
        getProcessStatus({ jobId: executionId, userId: this.userId })
            .then((result) => {
                if (result) {
                    let processingStatusResult = JSON.parse(JSON.stringify(result));
                    // If the status is 'Completed' then showing the Success message on UI
                    if (processingStatusResult && processingStatusResult[0].Status && processingStatusResult[0].Status == PROCESSING_STATUS_COMPLETED) {
                        this.isLoading = false;
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: SUCCESS_TITLE,
                                message: this.labels.passwordSetSuccessfullMessageLabel,
                                variant: TOAST_TYPE_SUCCESS
                            })
                        );
                    } else if (
                        processingStatusResult &&
                        processingStatusResult[0].Status &&
                        (processingStatusResult[0].Status == PROCESSING_STATUS_FAILED || processingStatusResult[0].Status == PROCESSING_STATUS_ABORTED)
                    ) {
                        // If the status is 'Failed' then showing the Error message on UI
                        if (
                            processingStatusResult &&
                            processingStatusResult[0].ExtendedStatus &&
                            processingStatusResult[0].ExtendedStatus == REPEATED_PASSWORD_EXCEPTION
                        ) {
                            this.isLoading = false;
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: ERROR_TITLE,
                                    message: this.labels.repeatedPasswordErrorLabel,
                                    variant: TOAST_TYPE_ERROR
                                })
                            );
                        } else {
                            this.isLoading = false;
                            new ShowToastEvent({
                                title: ERROR_TITLE,
                                message: this.labels.generalErrorLabel,
                                variant: TOAST_TYPE_ERROR
                            });
                        }
                    } else {
                        // If the status is 'Queued' then again calling the same function to fetch the status
                        this.checkSetPasswordStatus(executionId);
                    }
                }
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
                this.isLoading = false;
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: this.labels.generalErrorLabel,
                    variant: TOAST_TYPE_ERROR
                });
            });
    }
}
