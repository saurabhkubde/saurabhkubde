import { LightningElement, track, wire, api } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { navigate, NavigationContext } from 'lightning/navigation';

//Apex Classes
import handleEmailSubscription from '@salesforce/apex/D2C_UtilityController.handleEmailSubscription';
import getSupportedCountries from '@salesforce/apex/D2C_UtilityController.getSupportedCountries';
import getSupportedLanguages from '@salesforce/apex/D2C_UtilityController.getSupportedLanguages';

//Custom Labels
import NEWSLETTER_FORM_LABELS from '@salesforce/label/c.D2C_NB_Newsletter_Form_Labels';
import NEWSLETTER_SUCCESS_PAGE_URL from '@salesforce/label/c.D2C_NB_Newsletter_Form_URL_and_Success_Page_URL';
import SALUTATION_OPTIONS from '@salesforce/label/c.D2C_NB_Newsletter_Salutations';
import D2C_SH_Newsletter_TC_Privacy_Policy from '@salesforce/label/c.D2C_SH_Newsletter_TC_Privacy_Policy';
import D2C_SH_Newsletter_Accept from '@salesforce/label/c.D2C_SH_Newsletter_Accept';
import D2C_SH_Newsletter_Mandatory from '@salesforce/label/c.D2C_SH_Newsletter_Mandatory';

//Static resource
import STORE_STYLING from '@salesforce/resourceUrl/D2C_NB_StoreStyling';

// Constants for input types
const CHECKBOX = 'checkbox';
const SELECT = 'select';

const COMM_NAMED_PAGE = 'comm__namedPage';

// CSS variable for background image URL
const SET_BACKGROUND_URL = '--background-image-url';
const SH = 'SH'; //DVM21-48
const NB = 'NB'; //DVM21-48

export default class EmailSubscriptionForm extends NavigationMixin(LightningElement) {
    // Tracked variables for form fields
    @track _salutationValue = '';
    @track _firstName = '';
    @track _lastName = '';
    @track _email = '';
    @track _newsletterLanguage = '';
    @track _country = '';

    @api
    selectedBrand; //DVM21-48

    @track
    _isSHBrand = false; //DVM21-48

    @track
    _isNBBrand = false; //DVM21-48

    /* Custom labels: START */
    // Custom labels for various form fields and messages
    _newsLetterLabel = NEWSLETTER_FORM_LABELS.split(',')[7];
    _salutationLabel = NEWSLETTER_FORM_LABELS.split(',')[8];
    _firstNameLabel = NEWSLETTER_FORM_LABELS.split(',')[9];
    _lastNameLabel = NEWSLETTER_FORM_LABELS.split(',')[10];
    _emailLabel = NEWSLETTER_FORM_LABELS.split(',')[11];
    _newsLetterLanguageLabel = NEWSLETTER_FORM_LABELS.split(',')[12];
    _countryLabel = NEWSLETTER_FORM_LABELS.split(',')[13];
    _checkboxInitialText = NEWSLETTER_FORM_LABELS.split(',')[14];
    _checkboxMiddleText = NEWSLETTER_FORM_LABELS.split(',')[15];
    _checkboxEndText = NEWSLETTER_FORM_LABELS.split(',')[16];
    _sendButton = NEWSLETTER_FORM_LABELS.split(',')[17];
    _commonFieldValidationMessage = NEWSLETTER_FORM_LABELS.split(',')[4];
    _selectFieldValidationMessage = NEWSLETTER_FORM_LABELS.split(',')[6];
    _checkboxFieldValidationMessage = NEWSLETTER_FORM_LABELS.split(',')[5];
    _selectLanguage = NEWSLETTER_FORM_LABELS.split(',')[18];
    _selectCountry = NEWSLETTER_FORM_LABELS.split(',')[18];
    _newsletterSuccessPageURL = NEWSLETTER_SUCCESS_PAGE_URL.split(',')[1];
    _shNewsletterSuccessPageURL = NEWSLETTER_SUCCESS_PAGE_URL.split(',')[3]; //DVM21-48
    _shNewsLetterTCPrivacyPolicy = D2C_SH_Newsletter_TC_Privacy_Policy; //DVM21-48
    _shNewsLetterAcceptance = D2C_SH_Newsletter_Accept; //DVM21-48
    _shNewsLetterMandatory = D2C_SH_Newsletter_Mandatory.split(',')[0]; //DVM21-48
    _shSendButton = D2C_SH_Newsletter_Mandatory.split(',')[1]; //DVM21-48
    _shNewsLetterHeadline = D2C_SH_Newsletter_Mandatory.split(',')[2]; //DVM21-48

    /* Custom Labels: END */

    /**
     * NBD2C-32
     * @description: Fetches the navigation context.
     */
    @wire(NavigationContext)
    _navigationalContext;

    /**
     * NBD2C-32
     * @description This variable is used to handle the hide and show of the spinner.
     */
    _showSpinner = false;

    /**
     * NBD2C-32
     * @description This variable is used store the drop down icon that is used in the country and language combobox fields.
     */
    _dropDownIcon = STORE_STYLING + '/icons/arrowIconDown.svg';

    /**
     * NBD2C-32
     * @description: Array to track the supported countries.
     * Used to store the list of countries supported for email subscription.
     */
    @track _supportedCountries = [];

    /**
     * NBD2C-32
     * @description: Array to track the supported languages.
     * Used to store the list of languages supported for email subscription.
     */
    @track _supportedLanguages = [];

    // Wire method to fetch supported countries
    @wire(getSupportedCountries, { currentBrand: '$selectedBrand' })
    _wiredCountries({ error, data }) {
        if (data) {
            this._supportedCountries = data.map((instance) => ({ label: instance.Country_Name__c, value: instance.Country_Code__c }));
            //DVM21-48
            if (this.selectedBrand == NB) {
                this._isSHBrand = false;
                this._isNBBrand = true;
            } else if (this.selectedBrand == SH) {
                this._isNBBrand = false;
                this._isSHBrand = true;
            }
        } else if (error) {
            console.error(error);
        }
    }

    // Wire method to fetch supported languages
    @wire(getSupportedLanguages, { currentBrand: '$selectedBrand' })
    _wiredLanguages({ error, data }) {
        if (data) {
            this._supportedLanguages = data.map((language) => ({ label: language.Language__c, value: language.Language_Code__c }));
        } else if (error) {
            console.error(error);
        }
    }

    // Wire method to get current page reference
    @wire(CurrentPageReference)
    _currentPageReference;

    /**
     * NBD2C-32
     * @description: Updates email field if present in the current page reference state.
     */
    connectedCallback() {
        if (this._currentPageReference && this._currentPageReference.state.email) {
            this._email = this._currentPageReference.state.email;
        }
    }

    /**
     * NBD2C-32
     * @description: Sets background image URL on component render.
     */
    renderedCallback() {
        this.template.host.style.setProperty(SET_BACKGROUND_URL, `url(${this._dropDownIcon})`);
    }

    /**
     * NBD2C-32
     * @description: Handles the change event for salutation dropdown.
     * @param {Event} event - The event object.
     */
    handleSalutationChange(event) {
        this._salutationValue = event.detail.value;
    }

    /**
     * NBD2C-32
     * @description: Handles the change event for input fields.
     * @param {Event} event - The event object.
     */
    handleInputChange(event) {
        const field = event.target.name;
        this[`_${field}`] = event.target.type === CHECKBOX ? event.target.checked : event.target.value;
    }

    /**
     * NBD2C-32
     * @description: Validates the form fields.
     * @returns {boolean} - Indicates whether all fields are valid or not.
     */
    validateFields() {
        // Get form fields in the order they appear in the HTML.
        const fieldsToValidate = [
            ...this.template.querySelectorAll(
                'input[name="firstName"], input[name="lastName"], input[name="email"], select[name="newsletterLanguage"], select[name="country"], input[name="terms"]'
            )
        ];

        let allFieldsValid = true;
        for (let inputCompare of fieldsToValidate) {
            inputCompare.setCustomValidity(''); // Clear previous custom error
            if (!inputCompare.checkValidity()) {
                let validationMessage = this._commonFieldValidationMessage;
                if (inputCompare.type === CHECKBOX) {
                    validationMessage = this._checkboxFieldValidationMessage;
                } else if (inputCompare.tagName.toLowerCase() === SELECT) {
                    validationMessage = this._selectFieldValidationMessage;
                }
                inputCompare.setCustomValidity(validationMessage);
                inputCompare.reportValidity();
                inputCompare.focus(); // Focus the first invalid field
                allFieldsValid = false; // Set to false if any field is invalid
                break; // Stop further validation once an invalid field is found
            }
        }

        return allFieldsValid;
    }

    /**
     * NBD2C-32
     * @description: Handles subscription to the email service.
     * If form fields are valid, it initiates the subscription process,shows a spinner, and handles the success or error response accordingly.
     */
    handleSubscribe() {
        // Check if all form fields are valid
        if (this.validateFields()) {
            this._showSpinner = true; // Show spinner while processing subscription
            // Prepare form inputs for subscription
            let formInputs = {
                salutation: this._salutationValue,
                firstname: this._firstName,
                lastname: this._lastName,
                email: this._email,
                language: this._newsletterLanguage,
                country: this._country
            };

            const EMAIL_SUBSCRIPTION_SUCCESS_PAGE = {
                type: COMM_NAMED_PAGE,
                attributes: {
                    name: this.selectedBrand == SH ? this._shNewsletterSuccessPageURL : this._newsletterSuccessPageURL
                }
            };

            // Call the server-side method to handle email subscription
            handleEmailSubscription({
                userInputValues: JSON.stringify(formInputs),
                currentBrand: this.selectedBrand
            })
                .then(() => {
                    navigate(this._navigationalContext, EMAIL_SUBSCRIPTION_SUCCESS_PAGE); // Navigate to success page
                    this._showSpinner = false; // Hide spinner
                })
                .catch((error) => {
                    this._showSpinner = false; // Hide spinner
                    console.error(error);
                });
        }
    }

    /**
     * NBD2C-32
     * @description: Retrieves the salutation options.
     * @returns {Object[]} - Array of objects representing salutation options.
     */
    get salutationOptions() {
        const options = SALUTATION_OPTIONS.split(',').map((option) => {
            const [value, label] = option.split(':');
            return { label, value };
        });

        // Set default value for _salutationValue if not already set
        if (!this._salutationValue && options.length > 0) {
            this._salutationValue = options[0].value;
        }

        return options;
    }
}
