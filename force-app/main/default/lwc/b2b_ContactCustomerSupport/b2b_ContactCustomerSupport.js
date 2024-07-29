import { LightningElement, track, wire, api } from 'lwc';
import { LABELS } from './labelsUtility';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { redirectToPage, getSiteLogo } from 'c/b2b_utils';
import Id from '@salesforce/user/Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import handleContactCustomerSupportFlow from '@salesforce/apex/B2B_ContactCustomerSupportController.handleContactCustomerSupportFlow';
import BRAND_FIELD from '@salesforce/schema/Account.Brand__c';
import COUNTRY_FIELD from '@salesforce/schema/Account.Store_Country__c';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import LANG from '@salesforce/i18n/lang';
const ACCOUNT_BRAND = 'accountBrand';
const NEUBAU = 'NEUBAU';
const LOGIN_PAGE_LANGUAGE = 'loginPageLanguage'; //Added as a part of BS 1414
const LANGUAGE = '?language='; //BS-1414
const LOGIN = 'login'; //BS-1414
const BRAND_SELECTION_EVENT = 'accountBrand'; //BS-2055
const REQUEST_SELECTION_EVENT = 'request'; //BS-2055
const MAX_FILE_SIZE = 3670016; //3.5MB in bytes BS-836

export default class B2b_ContactCustomerSupport extends LightningElement {
    @track brandOptions = [];
    @track countryOptions = [];
    @api isLoginPage;
    @api isSilhouetteLogin;
    @track registrationForm = {};
    value = '';
    @track currentLoggedInUserId = Id;
    imageLogo;
    @track isStoreCountryRequired = true;
    isLoading = false;
    _needHelpH1;
    _needHelpH2;
    _showUploadedFileName = true; //BS-836
    fileSectionLabel; //BS-836
    fileUploadSizeExceeds; //BS-836
    fileTypeUnsupported; //BS-836
    fileName = ''; //BS-836
    fileContent; //BS-836

    /* Start : BS-2055 */
    _showOptions = true;

    _optionListGlobal = [
        { label: this.labels.callback, value: 'callback' },
        { label: this.labels.salesVisit, value: 'salesvisit' },
        { label: this.labels.addresschange, value: 'addresschange' },
        { label: this.labels.other, value: 'other' }
    ];

    _optionList = [];
    /* End : BS-2055 */

    connectedCallback() {
        this.imageLogo = getSiteLogo();
        this.setImageDimentions();
        this._needHelpH1 = this.labels.needHelp.split(',')[0];
        this._needHelpH2 = this.labels.needHelp.split(',')[1];
        this.fileTypeUnsupported = this.labels.B2B_ContactCustomerFileUploadErrors.split('|')[1];
        this.fileUploadSizeExceeds = this.labels.B2B_ContactCustomerFileUploadErrors.split('|')[0];
        this.fileSectionLabel = this.labels.B2B_ContactCustomerFileUploadErrors.split('|')[2];
        //Added as a part of BS-1414
        if (
            this.isLoginPage === true &&
            localStorage.getItem(LOGIN_PAGE_LANGUAGE) &&
            LANG &&
            localStorage.getItem(LOGIN_PAGE_LANGUAGE) !== LANG &&
            localStorage.getItem(LOGIN_PAGE_LANGUAGE) !== LANG.toString().replace('-', '_')
        ) {
            this.handlelanguageChange();
        }
        /* Start : BS-2055 */
        if (this.isLoginPage) {
            let optionsList = JSON.parse(JSON.stringify(this._optionListGlobal));
            optionsList.splice(2, 1);
            this._optionList = optionsList;
        } else {
            this._optionList = JSON.parse(JSON.stringify(this._optionListGlobal));
        }
        /* End : BS-2055 */
    }

    get labels() {
        return LABELS;
    }

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    accountInfo;

    @wire(getPicklistValues, { recordTypeId: '$accountInfo.data.defaultRecordTypeId', fieldApiName: BRAND_FIELD })
    accountBrandValues({ error, data }) {
        if (data) {
            this.brandOptions = data.values;
            // BS-1995
            let svsBrandOption = { label: this.labels.svsBrandLabel, value: this.labels.svsBrandLabel };
            this.brandOptions = JSON.parse(JSON.stringify(this.brandOptions));
            this.brandOptions.splice(2, 0, svsBrandOption);
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

    storeCountryCheck(event) {
        if (event.target.value) {
            this.isStoreCountryRequired = false;
        } else if (!event.target.value) {
            this.isStoreCountryRequired = true;
        }
    }

    genericOnChange(event) {
        if (event.target.name === 'accountNumber') {
            this.storeCountryCheck(event);
        }
        if (event.target.value) {
            this.registrationForm[event.target.name] = event.target.value;
            if (event.target.name === 'requestMessage') {
                this.registrationForm[event.target.name] = event.target.value.replace(/(<([^>]+)>)/gi, '');
            }
        } else {
            this.registrationForm[event.target.name] = event.target.checked;
        }

        if (this.isSilhouetteLogin === false && ACCOUNT_BRAND in this.registrationForm === false) {
            this.registrationForm[ACCOUNT_BRAND] = NEUBAU;
        }

        /* Start : BS-2055 */
        if (this.isLoginPage === false && event.target.name === BRAND_SELECTION_EVENT && event.target.value === this.labels.svsBrandLabel) {
            this._showOptions = false;
            this.registrationForm[REQUEST_SELECTION_EVENT] = null;
            this.value = null;
            let optionsList = [];
            optionsList = JSON.parse(JSON.stringify(this._optionListGlobal));
            optionsList.splice(2, 1);
            this._optionList = optionsList;
            this._showOptions = true;
        } else if (this.isLoginPage === false && event.target.name === BRAND_SELECTION_EVENT && event.target.value !== this.labels.svsBrandLabel) {
            this._optionList = JSON.parse(JSON.stringify(this._optionListGlobal));
        }
        /* End : BS-2055 */
    }

    //BS-836
    displayToast(message, status) {
        const toastEvent = new ShowToastEvent({
            title: '',
            message: message,
            variant: status,
            mode: 'sticky'
        });
        this.dispatchEvent(toastEvent);
    }

    //BS-836
    handleFilesChange(event) {
        this.fileName = '';
        this.fileContent = '';
        const files = event.target.files;
        const fileExtension = files[0].name.split('.').pop().toLowerCase();
        this._showUploadedFileName = true;
        if (files[0].size >= MAX_FILE_SIZE) {
            this._showUploadedFileName = false;
            this.displayToast(this.fileUploadSizeExceeds, 'error');
        }

        if (!this.labels.B2B_ContactCustomerSupportAcceptedFileFormats.includes(fileExtension)) {
            this._showUploadedFileName = false;
            this.displayToast(this.fileTypeUnsupported, 'error');
        }

        if (files.length > 0 && this._showUploadedFileName == true) {
            this.displayToast(this.labels.B2B_FileUploadSuccessfulMessage, 'success');
            this.fileName = files[0].name;
            let reader = new FileReader();
            reader.onload = () => {
                this.fileContent = reader.result.split(',')[1];
            };
            reader.readAsDataURL(files[0]);
        }
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

    handleRequest() {
        if (this.isInputValid()) {
            this.isLoading = true;
            if (typeof this.currentLoggedInUserId == 'undefined') {
                this.currentLoggedInUserId = '';
            }

            handleContactCustomerSupportFlow({
                customerInputMap: this.registrationForm,
                isLoginPage: this.isLoginPage,
                currentLoggedInUserId: this.currentLoggedInUserId,
                langauge: LANG,
                isSilhouetteLogin: this.isSilhouetteLogin,
                uploadedFileContent: this.fileContent,
                fileName: this.fileName
            })
                .then((result) => {
                    this.registrationForm = {};
                    if (result === 'Success') {
                        const toastEvent = new ShowToastEvent({
                            message: this.labels.thankMessage,
                            variant: 'success',
                            mode: 'sticky'
                        });
                        this.dispatchEvent(toastEvent);
                    } else {
                        const toastEvent = new ShowToastEvent({
                            message: result,
                            variant: 'error',
                            mode: 'sticky'
                        });
                        this.dispatchEvent(toastEvent);
                    }
                    setTimeout(() => {
                        if (this.isLoginPage) {
                            window.location.href = redirectToPage(LOGIN + '/' + LANGUAGE + localStorage.getItem(LOGIN_PAGE_LANGUAGE)); //BS-1414
                        }
                    }, 5000);
                })
                .catch((error) => {
                    const toastEvent = new ShowToastEvent({
                        message: this.labels.errorMessageLabel,
                        variant: 'error',
                        mode: 'sticky'
                    });
                    this.dispatchEvent(toastEvent);
                    console.log('error', error);
                    setTimeout(() => {
                        if (this.isLoginPage) {
                            window.location.href = redirectToPage(LOGIN + '/' + LANGUAGE + localStorage.getItem(LOGIN_PAGE_LANGUAGE)); //BS-1414
                        }
                    }, 5000);
                })
                .finally(() => {
                    this.isLoading = false;
                    this.handleResetAll();
                });
            if (this.isLoginPage) {
                this.template.querySelector('[data-id="requestBtn"]').disabled = true;
            }
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

    handleResetAll() {
        this.template
            .querySelectorAll(
                'lightning-input[data-name="contactSupportForm"],lightning-textarea[data-name="contactSupportForm"],lightning-radio-group[data-name="contactSupportForm"],lightning-combobox[data-name="contactSupportForm"]'
            )
            .forEach((element) => {
                if (element.type === 'checkbox' || element.type === 'lightning-radio-group') {
                    element.checked = false;
                } else {
                    element.value = null;
                }
            });
        this._showUploadedFileName = false; //BS-836
        this.fileContent = ''; //BS-836
        this.fileName = ''; //BS-836
    }

    //Added as a part of BS-1414
    handlelanguageChange() {
        window.location.replace(window.location.origin + window.location.pathname + LANGUAGE + localStorage.getItem(LOGIN_PAGE_LANGUAGE));
    }

    goBack() {
        window.location.href = redirectToPage(LOGIN + '/' + LANGUAGE + localStorage.getItem(LOGIN_PAGE_LANGUAGE)); //BS-1414
    }
}
