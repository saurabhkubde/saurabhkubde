/* eslint-disable @lwc/lwc/no-dupe-class-members */
import { LightningElement, wire, track, api } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import SALUTATION_FIELD from '@salesforce/schema/Contact.Salutation';
import FUNCTION_FIELD from '@salesforce/schema/Contact.k_Function__c';
import BRAND_FIELD from '@salesforce/schema/Account.Brand__c';
import COUNTRY_FIELD from '@salesforce/schema/Account.Store_Country__c';
import { LABELS } from './labelsUtility';

import createPartnerAccount from '@salesforce/apex/B2B_PartnerRegistration.createPartnerAccount';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { redirectToPage, getSiteLogo } from 'c/b2b_utils';
import LANG from '@salesforce/i18n/lang';

const LOGIN_PAGE_LANGUAGE = 'loginPageLanguage'; //Added as a part of BS 1414
const LANGUAGE = '?language='; //BS-1414
const LOGIN = 'login'; //BS-1414

export default class B2B_PartnerRegistration extends LightningElement {
    @api isSilhouetteLogin;
    @track contactInfo;
    @track salutationOptions;
    @track functionOptions = [];
    @track brandOptions;
    @track accountFields = {};
    @track contactFields = {};
    @track countryOptions = [];

    loading = false;
    imageLogo;

    //Added as a part of BS-693
    label = {
        titleLabelH1NB: this.labels.titleLabel.split(',')[0],
        titleLabelH2NB: this.labels.titleLabel.split(',')[1]
    };

    connectedCallback() {
        this.imageLogo = getSiteLogo();
        this.setImageDimentions();
        //Added as a part of BS-1414
        if (localStorage.getItem(LOGIN_PAGE_LANGUAGE) != LANG) {
            this.handlelanguageChange();
        }
    }

    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
    contactInfo;

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    accountInfo;

    get recordTypeId() {
        const rtis = this.objectInfo.data.recordTypeInfos;
        return Object.keys(rtis).find((rti) => rtis[rti].name === 'Special Account');
    }

    @wire(getPicklistValues, { recordTypeId: '$contactInfo.data.defaultRecordTypeId', fieldApiName: SALUTATION_FIELD })
    salutationValues({ error, data }) {
        if (data) {
            this.salutationOptions = data.values;
        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$contactInfo.data.defaultRecordTypeId', fieldApiName: FUNCTION_FIELD })
    functionValues({ error, data }) {
        if (data) {
            data.values.forEach((element) => {
                this.functionOptions.push({
                    label: element.label,
                    value: element.value
                });
            });
        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$accountInfo.data.defaultRecordTypeId', fieldApiName: COUNTRY_FIELD })
    accountCountryValues({ error, data }) {
        if (data) {
            data.values.forEach((element) => {
                this.countryOptions.push({
                    label: element.label,
                    value: element.value
                });
            });
            this.countryOptions = data.values;
        } else if (error) {
            console.log(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$accountInfo.data.defaultRecordTypeId', fieldApiName: BRAND_FIELD })
    accountBrandValues({ error, data }) {
        if (data) {
            this.brandOptions = data.values;
        } else if (error) {
            console.log(error);
        }
    }

    get labels() {
        return LABELS;
    }

    //Added as a part of BS-1414
    handlelanguageChange() {
        window.location.replace(window.location.origin + window.location.pathname + LANGUAGE + localStorage.getItem(LOGIN_PAGE_LANGUAGE));
    }

    handleAccountInputChange(event) {
        this.accountFields[event.target.name] = event.target.value;
        if (event.target.name === 'email') {
            this.contactFields[event.target.name] = event.target.value;
        }
    }

    handleContactInputChange(event) {
        this.contactFields[event.target.name] = event.target.value;
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

    handleRequest() {
        if (this.isInputValid()) {
            this.loading = true;
            this.error = false;
            this.success = false;
            createPartnerAccount({
                accountInfo: JSON.stringify(this.accountFields),
                contactInfo: JSON.stringify(this.contactFields),
                language: LANG,
                isSilhouetteLogin: this.isSilhouetteLogin
            })
                .then((result) => {
                    this.loading = false;
                    const toastEvent = new ShowToastEvent({
                        message: this.labels.successMessage,
                        variant: 'success'
                    });
                    this.dispatchEvent(toastEvent);
                    this.template.querySelector('[data-id="requestBtn"]').disabled = true;
                })
                .catch((error) => {
                    const toastEvent = new ShowToastEvent({
                        message: this.labels.errorMessage,
                        variant: 'error'
                    });
                    this.dispatchEvent(toastEvent);
                    this.loading = false;
                });
        }
    }

    goBack() {
        window.location.href = redirectToPage(LOGIN + '/' + LANGUAGE + localStorage.getItem(LOGIN_PAGE_LANGUAGE)); //BS-1414
    }
}
