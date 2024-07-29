import { LightningElement, track, api } from 'lwc';
import getAccountByUsername from '@salesforce/apex/B2B_CustomResetPassword.getAccountByUsername';
import { redirectToPage, getSiteLogo } from 'c/b2b_utils';

// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';

import { LABELS } from './labelsUtility';
const LOGIN_PAGE_LANGUAGE = 'loginPageLanguage'; //Added as a part of BS 1414
const LANGUAGE = '?language='; //BS-1414
const LOGIN = 'login'; //BS-1414
const EMAIL_ADDRESS = 'EMAIL_ADDRESS'; //BS-1852
export default class B2B_CustomResetPassword extends LightningElement {
    @api isSilhouetteLogin;
    imageLogo;
    loading = false;
    _userEmail; //BS-1852

    @track toastVariant;
    @track toastMessage;

    get labels() {
        return LABELS;
    }

    //BS-1859
    get alertIcon() {
        return STORE_STYLING + '/icons/INFO.svg';
    }

    connectedCallback() {
        this.imageLogo = getSiteLogo();
        this.setImageDimentions();
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

    handleReset() {
        if (this.isInputValid()) {
            this.loading = true;
            getAccountByUsername({ userName: this.template.querySelector('[data-id="accountNumber"]').value })
                .then((result) => {
                    //BS-1852
                    this.loading = false;
                    this._userEmail = result; //BS-1852
                    this.toastVariant = 'success';
                    this.toastMessage = this.labels.resetSuccessMessage.replace(EMAIL_ADDRESS, this._userEmail); //BS-1852
                    this.template.querySelector('c-b2-b_-custom-toast-event').showCustomNotice();
                })
                .catch(() => {
                    this.loading = false;
                    this.toastVariant = 'error';
                    this.toastMessage = this.labels.resetErrorMessage;
                    this.template.querySelector('c-b2-b_-custom-toast-event').showCustomNotice();
                });
        }
    }

    setImageDimentions() {
        var css = this.template.host.style;
        if (this.imageLogo.includes('silhouette')) {
            css.setProperty('--height', '109px');
            css.setProperty('--width', '251px');
        } else {
            css.setProperty('--height', '22px');
            css.setProperty('--width', '155px');
        }
    }

    redirectToHome() {
        window.location.href = redirectToPage('');
    }

    goBack() {
        window.location.href = redirectToPage(LOGIN + '/' + LANGUAGE + localStorage.getItem(LOGIN_PAGE_LANGUAGE)); //BS-1414
    }
}
