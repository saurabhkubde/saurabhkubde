import { api, LightningElement, wire, track } from 'lwc';
import getUserAccess from '@salesforce/apex/B2B_Registration.getUserAccess';
import getAccountEmail from '@salesforce/apex/B2B_Registration.getAccountEmail'; //BS-1850
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import COUNTRY_FIELD from '@salesforce/schema/Account.Store_Country__c';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import { LABELS } from './labelsUtility';
import { redirectToPage, getSiteLogo } from 'c/b2b_utils';
import LANG from '@salesforce/i18n/lang';
import B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE from '@salesforce/label/c.B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE'; //BS-1662
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import GET_ACCESS_MISSING_SUBSEGMENT_ERROR_MESSAGE from '@salesforce/label/c.B2B_GET_ACCESS_MISSING_SUBSEGMENT_ERROR_MESSAGE'; //BS-2059
import SEE_COUNTRY_CODE from '@salesforce/label/c.B2B_See_Country_Code_Label'; //BS-2095
import B2B_Account_Blocked_For_Partner_Portal_Error_Message from '@salesforce/label/c.B2B_Account_Blocked_For_Partner_Portal_Error_Message'; //BS-2057

// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-1859

const LOGIN_PAGE_LANGUAGE = 'loginPageLanguage'; //Added as a part of BS 1414
const LANGUAGE = '?language='; //BS-1414
const LOGIN = 'login'; //BS-1414
const FALSE = 'false'; //BS-1662
const INDEX_ZERO = '{0}'; //BS-1662
const TOAST_TYPE_SUCCESS = 'success'; //BS-1662
const TOAST_TYPE_ERROR = 'error'; //BS-1662
const BACK_EVENT = 'popstate'; //Added
const SHOP_LANGUAGE_LOGIN_PAGE = 'shopLanguageLoginPage'; // Added as a part of BS-397
const SUBSEGMENT_ERROR = 'Subsegment Error'; //BS-2059
const ENGLISH_LANG = 'en-US'; //BS-2095
const POPOVER_CLASS = 'country-code-popover'; //BS-2095
const POPOVER_CLASS_LARGE = 'country-code-popover-large'; //BS-2095
const ACCOUNT_BLOCKED_FOR_REGISTRATION_ERROR = 'Account Blocked For Registration Error'; // BS-2057
const VERTICAL_BAR_SYMBOL = '|'; // BS-2057

export default class B2b_RegistrationComponent extends LightningElement {
    @api isSilhouetteLogin;
    @track registrationForm = {};
    @track countryOptions = [];
    @track showTooltip = false;

    loading = false;
    imageLogo;
    _accountEmail; //BS-1850
    _contactCustomerServiceRedirectUrl; //BS-2005

    _popoverClass = 'country-code-popover'; //BS-2095

    label = {
        ExistingPartnerH1: this.labels.alreadyCustomer.split(',')[0],
        ExistingPartnerH2: this.labels.alreadyCustomer.split(',')[1],
        ExistingPartnerNBH1: this.labels.ALLREADY_CUSTOMER_NB.split(',')[0],
        ExistingPartnerNBH2: this.labels.ALLREADY_CUSTOMER_NB.split(',')[1],
        registerButtonLabel: this.labels.SH_EE_GET_ACCESS_PAGE_HEADING_AND_DESCRIPTION.split(VERTICAL_BAR_SYMBOL)[0], //BS-2005
        silhouetteHeading: this.labels.SH_EE_GET_ACCESS_PAGE_HEADING_AND_DESCRIPTION.split(VERTICAL_BAR_SYMBOL)[1], //BS-2005
        silhouetteDescription1: this.labels.SH_EE_GET_ACCESS_PAGE_HEADING_AND_DESCRIPTION.split(VERTICAL_BAR_SYMBOL)[2], //BS-2005
        silhouetteDescription2: this.labels.SH_EE_GET_ACCESS_PAGE_HEADING_AND_DESCRIPTION.split(VERTICAL_BAR_SYMBOL)[3], //BS-2005
        silhouetteDescription3: this.labels.SH_EE_GET_ACCESS_PAGE_HEADING_AND_DESCRIPTION.split(VERTICAL_BAR_SYMBOL)[4], //BS-2005
        contactCustomerServiceLabel: this.labels.SH_EE_GET_ACCESS_PAGE_HEADING_AND_DESCRIPTION.split(VERTICAL_BAR_SYMBOL)[5], //BS-2005
        neubauDescription1: this.labels.NB_GET_ACCESS_PAGE_HEADING_AND_DESCRIPTION.split(VERTICAL_BAR_SYMBOL)[0], //BS-2017
        neubauDescription2: this.labels.NB_GET_ACCESS_PAGE_HEADING_AND_DESCRIPTION.split(VERTICAL_BAR_SYMBOL)[1], //BS-2017
        neubauDescription3: this.labels.NB_GET_ACCESS_PAGE_HEADING_AND_DESCRIPTION.split(VERTICAL_BAR_SYMBOL)[2], //BS-2017
        neubauContactCustomerServiceLabel: this.labels.NB_GET_ACCESS_PAGE_HEADING_AND_DESCRIPTION.split(VERTICAL_BAR_SYMBOL)[3], //BS-2017
        SEE_COUNTRY_CODE,
        nbUsernameHelpText: this.labels.B2B_NB_PARTNER_PORTAL_USERNAME_INPUT_FIELD_HELPTEXT //BS-2097
    };

    //BS-1859
    get alertIcon() {
        return STORE_STYLING + '/icons/INFO.svg';
    }

    //BS-2095
    get globeIcon() {
        return STORE_STYLING + '/icons/globe.svg';
    }

    //Language Prod Fix
    currentLanguage;

    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        try {
            // Starting the loader
            this._isLoading = true;
            this._urlPath = pageRef;

            // Checking if url state contains parameters
            if (this._urlPath != null && this._urlPath != undefined && this._urlPath.state != null && this._urlPath.state != undefined && this._urlPath.state) {
                let stateAttributes = this._urlPath.state;
                if (stateAttributes && stateAttributes.language) {
                    this.currentLanguage = stateAttributes.language;
                }
            }
        } catch (exceptionInstance) {
            console.error(exceptionInstance);
        }
    }
    //Language Prod Fix

    connectedCallback() {
        /* Start : BS-2095 */
        if (LANG !== ENGLISH_LANG) {
            this._popoverClass = POPOVER_CLASS_LARGE;
        } else {
            this._popoverClass = POPOVER_CLASS;
        }
        /* End : BS-2095 */
        this.imageLogo = getSiteLogo();
        this.setImageDimentions();
        localStorage.setItem(LOGIN_PAGE_LANGUAGE, this.currentLanguage); //Language Prod Fix
        localStorage.setItem(SHOP_LANGUAGE_LOGIN_PAGE, this.currentLanguage); //Language Prod Fix
        window.addEventListener(BACK_EVENT, () => this.setLanguageIntoLocalStorage(this.currentLanguage));
        //Added as a part of BS 1414
        if (
            localStorage.getItem(LOGIN_PAGE_LANGUAGE) != undefined &&
            localStorage.getItem(LOGIN_PAGE_LANGUAGE) != null &&
            localStorage.getItem(LOGIN_PAGE_LANGUAGE) != LANG.replace('-', '_')
        ) {
            this.handlelanguageChange();
        }
        this._contactCustomerServiceRedirectUrl = redirectToPage('contact-customer-service'); //BS-2005
    }

    setLanguageIntoLocalStorage(language) {
        localStorage.setItem(LOGIN_PAGE_LANGUAGE, language); //Language Prod Fix
        localStorage.setItem(SHOP_LANGUAGE_LOGIN_PAGE, language); //Language Prod Fix
    }

    disconnectedCallback() {
        this.setLanguageIntoLocalStorage(this.currentLanguage);
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

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    accountInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$accountInfo.data.defaultRecordTypeId',
        fieldApiName: COUNTRY_FIELD
    })
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

    handleGetAccessButton() {
        if (this.isInputValid()) {
            this.loading = true;
            getUserAccess({ registrationForm: JSON.stringify(this.registrationForm), language: LANG, isSilhouetteLogin: this.isSilhouetteLogin })
                .then((result) => {
                    if (result === '') {
                        getAccountEmail({ registrationForm: JSON.stringify(this.registrationForm), isSilhouetteLogin: this.isSilhouetteLogin }) //BS-1850
                            .then((data) => {
                                this._accountEmail = data; //BS-1850
                                this.loading = false;
                                const toastEvent = new ShowToastEvent({
                                    message: this.labels.successMessage + ' ' + this._accountEmail, //BS-1850
                                    variant: 'success'
                                });
                                this.dispatchEvent(toastEvent);
                                this.template.querySelector('[data-id="getAccessBtn"]').disabled = true;
                            }); //BS-1850
                    } else {
                        //BS-1662 : Checking whether the account status is active for NB shop. If not then showing validation message
                        if (result != undefined && result != null && result == FALSE) {
                            let initialMessage =
                                B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE.split(',')[0] + B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE.split(',')[1];
                            let customerServiceLabel = INDEX_ZERO;
                            let applicableLink = B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE.split(',')[3];
                            let endNBInactiveErrorResponseMessage = B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE.split(',')[4];
                            let applicableResponseMessage = initialMessage + customerServiceLabel + endNBInactiveErrorResponseMessage;
                            const event = new ShowToastEvent({
                                message: applicableResponseMessage,
                                variant: TOAST_TYPE_ERROR,
                                messageData: [
                                    {
                                        url: applicableLink,
                                        label: B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE.split(',')[2]
                                    }
                                ]
                            });
                            this.dispatchEvent(event);
                        } else if (result != undefined && result != null && result === SUBSEGMENT_ERROR) {
                            let applicableErrorMessage = GET_ACCESS_MISSING_SUBSEGMENT_ERROR_MESSAGE.split(VERTICAL_BAR_SYMBOL)[0];
                            const event = new ShowToastEvent({
                                message: applicableErrorMessage,
                                variant: TOAST_TYPE_ERROR,
                                messageData: [
                                    {
                                        url: this._contactCustomerServiceRedirectUrl,
                                        label: GET_ACCESS_MISSING_SUBSEGMENT_ERROR_MESSAGE.split(VERTICAL_BAR_SYMBOL)[1]
                                    }
                                ]
                            });
                            this.dispatchEvent(event);
                        } else if (result != undefined && result != null && result === ACCOUNT_BLOCKED_FOR_REGISTRATION_ERROR) {
                            let applicableErrorMessage = B2B_Account_Blocked_For_Partner_Portal_Error_Message.split(VERTICAL_BAR_SYMBOL)[0];
                            const event = new ShowToastEvent({
                                message: applicableErrorMessage,
                                variant: TOAST_TYPE_ERROR,
                                messageData: [
                                    {
                                        url: this._contactCustomerServiceRedirectUrl,
                                        label: B2B_Account_Blocked_For_Partner_Portal_Error_Message.split(VERTICAL_BAR_SYMBOL)[1]
                                    }
                                ]
                            });
                            this.dispatchEvent(event);
                        } else {
                            const toastEvent = new ShowToastEvent({
                                message: result,
                                variant: TOAST_TYPE_ERROR
                            });
                            this.dispatchEvent(toastEvent);
                        }
                        //BS-1662 : End
                        this.loading = false;
                    }
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

    genericOnChange(event) {
        if (event.target.value) {
            this.registrationForm[event.target.name] = event.target.value;
        } else {
            this.registrationForm[event.target.name] = event.target.checked;
        }
    }

    get labels() {
        return LABELS;
    }

    goBack() {
        window.location.href = redirectToPage(LOGIN + '/' + LANGUAGE + localStorage.getItem(LOGIN_PAGE_LANGUAGE)); //BS-1414);
    }

    //Added as a part of BS-1414
    handlelanguageChange() {
        window.location.replace(window.location.origin + window.location.pathname + LANGUAGE + localStorage.getItem(LOGIN_PAGE_LANGUAGE));
    }

    toggleTooltip() {
        this.showTooltip = !this.showTooltip;
    }

    closeTooltip() {
        this.showTooltip = false;
    }
}
