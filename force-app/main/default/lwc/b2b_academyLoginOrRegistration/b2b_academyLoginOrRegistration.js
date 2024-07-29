import { LightningElement, track, wire, api } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-2121

import { getRecord } from 'lightning/uiRecordApi'; //BS-2121

import fetchContactsAssociatedWithAccount from '@salesforce/apex/B2B_AcademyIntegrationController.fetchContactsAssociatedWithAccount'; //BS-2121
import sendEmailAndCreateTaskForCustomerService from '@salesforce/apex/B2B_AcademyIntegrationController.sendEmailAndCreateTaskForCustomerService'; //BS-2290

import CONTACT_OBJECT from '@salesforce/schema/Contact'; //BS-2121
import SALUTATION_FIELD from '@salesforce/schema/Contact.Salutation'; //BS-2121
import FUNCTION_FIELD from '@salesforce/schema/Contact.k_Function__c'; //BS-2121
import STORE_COUNTRY from '@salesforce/schema/Account.Store_Country__c'; //BS-2121

import B2B_ACADEMY_REGISTRATION_FORM_PAGE from '@salesforce/label/c.B2B_ACADEMY_REGISTRATION_FORM_PAGE'; //BS-2121
import B2B_ACADEMY_REGISTRATION_START_YOUR_JOURNEY from '@salesforce/label/c.B2B_ACADEMY_REGISTRATION_START_YOUR_JOURNEY'; //BS-2237
import B2B_ACADEMY_LINKOUT_URL from '@salesforce/label/c.B2B_ACADEMY_LINKOUT_URL'; //BS-2237

const fields = [STORE_COUNTRY]; //BS-2121
const SALUTATION = 'salutation'; //BS-2290
const FIRSTNAME = 'firstName'; //BS-2290
const LASTNAME = 'lastName'; //BS-2290
const EMAIL_ADDRESS = 'emailAddress'; //BS-2290
const FUNCTION = 'function'; //BS-2290

const NAME_CLASSES = 'validate';
const NAME_ERROR_CLASSES = 'validate errorName';

export default class B2b_academyLoginOrRegistration extends LightningElement {
    @api accountId; //BS-2121
    @track salutationOptions;
    @track functionOptions;
    @track isFirstScreen = false;
    @track isSecondScreen = false;
    @track isThirdScreen = false;
    @track academyRegistrationForm = {}; //BS-2290
    //Start of BS-2237
    @track isFourthScreen = false;
    @track proceedButttonShow = false;
    @track showStartJourneyButton = false;
    @track contactList = [];
    _selectedContact;
    _academyLink = B2B_ACADEMY_LINKOUT_URL;

    @track _isFirstNameInValid = false;
    @track _isLastNameInValid = false;
    @track _firstNameClassList = NAME_CLASSES;
    @track _lastNameClassList = NAME_CLASSES;
    //End of BS-2237

    label = {
        academyTitleContentJoin: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[0],
        academyClickToProceedContent: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[1],
        academyProceedButton: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[2],
        academyRegistrationFormHeadline: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[3],
        academyRegistrationFormTitle: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[4],
        academyRegistrationFormSalutation: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[5],
        academyRegistrationFormFirstName: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[6],
        academyRegistrationFormLastName: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[7],
        academyRegistrationFormPersonalEmailAddress: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[8],
        academyRegistrationFormFunction: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[9],
        academyRegistrationFormFooter: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[10],
        academyRegistrationFormSuccessTitle: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[0],
        academyRegistrationFormSuccessThank: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[11],
        academyRegistrationFormSuccessMessage: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[12],
        academyRegistrationChooseContactMessage: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[13],
        noContactfoundlabelPart1: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[14],
        noContactfoundlabelPart2: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[15],
        startJourneyButtonLabel: B2B_ACADEMY_REGISTRATION_START_YOUR_JOURNEY,
        minThreeCharactersRequiredMessage: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[16],
        completeThisField: B2B_ACADEMY_REGISTRATION_FORM_PAGE.split('|')[17]
    };

    _successIcon = STORE_STYLING + '/icons/success.svg';
    _contactIcon = STORE_STYLING + '/icons/person.svg'; //BS-2237

    //BS-2121
    get resolvedEffectiveAccountId() {
        const effectiveAcocuntId = this.accountId || '';
        let resolved = null;

        if (effectiveAcocuntId.length > 0 && effectiveAcocuntId !== '000000000000000') {
            resolved = effectiveAcocuntId;
        }
        return resolved;
    }

    /**
     * This wire method is use to fetch account fields through effective account id of currently logged in user
     * BS-2121
     */
    @wire(getRecord, { recordId: '$resolvedEffectiveAccountId', fields })
    account({ data }) {
        if (data) {
            this.evaluateAcademyUsecases();
        }
    }

    @wire(getObjectInfo, { objectApiName: CONTACT_OBJECT })
    contactInfo;

    @wire(getPicklistValues, { recordTypeId: '$contactInfo.data.defaultRecordTypeId', fieldApiName: SALUTATION_FIELD })
    salutationValues({ error, data }) {
        if (data) {
            this.salutationOptions = data.values;
        } else if (error) {
            console.error(error);
        }
    }

    @wire(getPicklistValues, { recordTypeId: '$contactInfo.data.defaultRecordTypeId', fieldApiName: FUNCTION_FIELD })
    functionValues({ error, data }) {
        if (data) {
            this.functionOptions = data.values;
        } else if (error) {
            console.error(error);
        }
    }

    connectedCallback() {}

    evaluateAcademyUsecases() {
        fetchContactsAssociatedWithAccount({ accountId: this.resolvedEffectiveAccountId })
            .then((result) => {
                if (result != null && result != undefined) {
                    if (result.length > 1) {
                        result.forEach((contactRecord) => {
                            if (contactRecord.LMS_Is_Active__c == true && contactRecord.LMS_Is_LMS_Contact__c == true) {
                                this.contactList.push(contactRecord);
                                this.isFourthScreen = true;
                            }
                        });
                    }
                    if (this.contactList != undefined && this.contactList != null && this.contactList.length == 0) {
                        this.isFirstScreen = true;
                        this.proceedButttonShow = true;
                        this.isFourthScreen = false;
                    }
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    handleProceed() {
        if (this.isFirstScreen == true || this.isFourthScreen == true) {
            this.proceedButttonShow = true;
            this.isFourthScreen = false;
            this.isFirstScreen = false;
            this.isSecondScreen = true;
        } else if (this.isSecondScreen == true) {
            if (this.isInputValid()) {
                this.isSecondScreen = false;
                this.sendEmailAndCreateTask(); //BS-2290
                this.isThirdScreen = true;
                this.proceedButttonShow = false;
            } else {
                this.isThirdScreen = false;
            }
        }
    }

    //BS-2290
    sendEmailAndCreateTask() {
        sendEmailAndCreateTaskForCustomerService({
            accountId: this.resolvedEffectiveAccountId,
            academyRegistrationInputMap: JSON.parse(JSON.stringify(this.academyRegistrationForm))
        })
            .then((result) => {
                //This will be handled in error handling ticket
            })
            .catch((error) => {
                console.error(error);
            });
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
        if (this._isFirstNameInValid || this._isLastNameInValid) {
            isValid = false;
        }
        return isValid;
    }

    //BS-2290
    handleSalutationChange(event) {
        this.academyRegistrationForm[SALUTATION] = event.target.options.find((opt) => opt.value === event.detail.value).label;
    }

    //BS-2290
    handleFirstNameChange(event) {
        this.academyRegistrationForm[FIRSTNAME] = event.target.value;
    }
    checkValidation(event) {
        if (event.target.label == this.label.academyRegistrationFormFirstName) {
            if (this.academyRegistrationForm[FIRSTNAME].trim().length > 0 && this.academyRegistrationForm[FIRSTNAME].length < 3) {
                this._isFirstNameInValid = true;
                this._firstNameClassList = NAME_ERROR_CLASSES;
            } else {
                this._isFirstNameInValid = false;
                this._firstNameClassList = NAME_CLASSES;
            }
        }
        if (event.target.label == this.label.academyRegistrationFormLastName) {
            if (this.academyRegistrationForm[LASTNAME].trim().length > 0 && this.academyRegistrationForm[LASTNAME].length < 3) {
                this._isLastNameInValid = true;
                this._lastNameClassList = NAME_ERROR_CLASSES;
            } else {
                this._isLastNameInValid = false;
                this._lastNameClassList = NAME_CLASSES;
            }
        }
    }

    //BS-2290
    handleLastNameChange(event) {
        this.academyRegistrationForm[LASTNAME] = event.target.value;
    }

    //BS-2290
    handleEmailAddressChange(event) {
        this.academyRegistrationForm[EMAIL_ADDRESS] = event.target.value;
    }

    //BS-2290
    handleFunctionChange(event) {
        this.academyRegistrationForm[FUNCTION] = event.target.options.find((opt) => opt.value === event.detail.value).label;
    }

    //BS-2237
    handleContactClick(event) {
        this._selectedContact = event.currentTarget.dataset.id;
        window.open(this._academyLink, '_blank');
    }
}
