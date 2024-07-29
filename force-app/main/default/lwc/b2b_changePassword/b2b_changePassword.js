import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import changePassword from '@salesforce/apex/B2B_Utils.changePassword';

import changePasswordHeadline from '@salesforce/label/c.B2B_ACC_Change_Password_Headline';
import changePasswordLabel from '@salesforce/label/c.B2B_ACC_Change_Password';
import oldPassword from '@salesforce/label/c.B2B_ACC_Old_Password';
import newPassword from '@salesforce/label/c.B2B_ACC_New_Password';
import verifyPassword from '@salesforce/label/c.B2B_ACC_Verify_Password';
import save from '@salesforce/label/c.B2B_ACC_Save';
import cancel from '@salesforce/label/c.B2B_ACC_Cancel';
import changePasswordError from '@salesforce/label/c.B2B_LOGIN_Change_Password_Error';
import changePasswordSuccess from '@salesforce/label/c.B2B_ACC_Change_Password_Success';
import password from '@salesforce/label/c.B2B_ACC_Password';
import passwordMismatch from '@salesforce/label/c.B2B_ACC_Change_Password_Mismatch';
import newAndOldPasswordEqual from '@salesforce/label/c.B2B_ACC_Old_And_New_Password_Equal';
import LANG from '@salesforce/i18n/lang';
const PASSWORD = 'password'; //BS-1855
const TEXT = 'text'; //BS-1855
const HIDE_ICON = 'utility:hide'; //BS-1855
const PREVIEW_ICON = 'utility:preview'; //BS-1855
const OLD_PASSWORD = 'oldPassword'; //BS-1855
const NEW_PASSWORD = 'newPassword'; //BS-1855
const CONFIRM_PASSWORD = 'confirmPassword'; //BS-1855
export default class B2b_changePassword extends LightningElement {
    @api isSilhouetteSite;
    @track showModal = false;
    isLoading = false;

    oldpassword;
    newpassword;
    verifyedpassword;
    /** Start for variables added for BS-1855 */
    oldPasswordType = PASSWORD;
    newPasswordType = PASSWORD;
    confirmPasswordType = PASSWORD;
    oldPasswordVisibilityControllerIcon = HIDE_ICON;
    newPasswordVisibilityControllerIcon = HIDE_ICON;
    confirmPasswordVisibilityControllerIcon = HIDE_ICON;
    /** End variables added for BS-1855 */

    label = {
        changePasswordHeadline,
        changePasswordLabel,
        oldPassword,
        newPassword,
        verifyPassword,
        save,
        cancel,
        changePasswordError,
        changePasswordSuccess,
        password,
        passwordMismatch,
        newAndOldPasswordEqual
    };

    /**
     * BS-1855
     * Desc : this method handles preview icon click beside the password input field.
     * On click , it shows the typed password in text format until clicked back.
     */
    handlePreviewClick(event) {
        if (event.currentTarget.dataset.id == OLD_PASSWORD) {
            if (this.oldPasswordType == PASSWORD) {
                this.oldPasswordType = TEXT;
                this.oldPasswordVisibilityControllerIcon = PREVIEW_ICON;
            } else {
                this.oldPasswordType = PASSWORD;
                this.oldPasswordVisibilityControllerIcon = HIDE_ICON;
            }
        } else if (event.currentTarget.dataset.id == NEW_PASSWORD) {
            if (this.newPasswordType === PASSWORD) {
                this.newPasswordType = TEXT;
                this.newPasswordVisibilityControllerIcon = PREVIEW_ICON;
            } else {
                this.newPasswordType = PASSWORD;
                this.newPasswordVisibilityControllerIcon = HIDE_ICON;
            }
        } else if (event.currentTarget.dataset.id == CONFIRM_PASSWORD) {
            if (this.confirmPasswordType === PASSWORD) {
                this.confirmPasswordType = TEXT;
                this.confirmPasswordVisibilityControllerIcon = PREVIEW_ICON;
            } else {
                this.confirmPasswordType = PASSWORD;
                this.confirmPasswordVisibilityControllerIcon = HIDE_ICON;
            }
        }
    }

    changePassword() {
        if (this.isInputValid()) {
            this.isLoading = true;
            if (this.isPasswordEqual() === true && this.isNewAndOldPasswordEqual() === false) {
                changePassword({
                    oldPassword: this.oldpassword,
                    newPassword: this.newpassword,
                    verifyedPassword: this.verifyedpassword,
                    language: LANG,
                    isSilhouetteSite: this.isSilhouetteSite
                })
                    .then(() => {
                        this.closeModal();
                        this.showToast(true);
                    })
                    .catch((error) => {
                        this.showToast(false);
                        console.log(error);
                    });
            } else {
                const toastEvent = new ShowToastEvent({
                    message: this.isPasswordEqual() === false ? this.label.passwordMismatch : this.label.newAndOldPasswordEqual,
                    variant: 'error'
                });
                this.dispatchEvent(toastEvent);
            }
            this.isLoading = false;
        }
    }

    isPasswordEqual() {
        return this.newpassword === this.verifyedpassword ? true : false;
    }

    isNewAndOldPasswordEqual() {
        return this.newpassword === this.oldpassword ? true : false;
    }

    handleOldPasswordChange(event) {
        this.oldpassword = event.target.value;
    }

    handleNewPasswordChange(event) {
        this.newpassword = event.target.value;
    }

    handleVerifyPasswordChange(event) {
        this.verifyedpassword = event.target.value;
    }

    openModal() {
        this.showModal = true;

        //Added as a part of BS-1855
        this.oldPasswordType = PASSWORD;
        this.newPasswordType = PASSWORD;
        this.confirmPasswordType = PASSWORD;
        this.oldPasswordVisibilityControllerIcon = HIDE_ICON;
        this.newPasswordVisibilityControllerIcon = HIDE_ICON;
        this.confirmPasswordVisibilityControllerIcon = HIDE_ICON;
    }

    closeModal() {
        this.showModal = false;
    }

    showToast(isSuccess) {
        let variant = isSuccess === true ? 'success' : 'error';
        let message = isSuccess === true ? this.label.changePasswordSuccess : this.label.changePasswordError;

        const toastEvent = new ShowToastEvent({
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }

    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach((inputField) => {
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }
}
