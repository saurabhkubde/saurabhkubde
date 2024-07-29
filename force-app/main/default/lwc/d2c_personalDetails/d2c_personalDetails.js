import { LightningElement, wire, api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import phoneNumberLibrary from '@salesforce/resourceUrl/libphonenumber';
import LANG from '@salesforce/i18n/lang';

//Apex Classes
import getSupportedCountries from '@salesforce/apex/D2C_UtilityController.getSupportedCountries';

//Custom Labels
import NEWSLETTER_FORM_LABELS from '@salesforce/label/c.D2C_NB_Newsletter_Form_Labels';
import PERSONAL_DETAIL_FORM_LABELS from '@salesforce/label/c.D2C_NB_Personal_Detail_Section_Label'; // NBD2C - 97 : Utility labels
import SALUTATION_OPTIONS from '@salesforce/label/c.D2C_NB_Newsletter_Salutations'; // NBD2C - 97 : Salutation labels
import D2C_NB_PDP_LABELS from '@salesforce/label/c.D2C_NB_PDP_LABELS'; // NBD2C - 97 : Label for the loader alternative text
import STORE_STYLING from '@salesforce/resourceUrl/D2C_NB_StoreStyling'; // NBD2C - 97 : Down arrow for selector component, and calendar icon

// Constants
const CHECKBOX = 'checkbox';
const CLICK = 'click';
const COUNTRY_CODES_CLASS = '.countryCodes';
const DOWN_ARROW_LOCATION = '/icons/arrowIconDown.svg';
const EMAIL = 'email';
const INPUT_DATA_ID_PHONE = 'input[data-id="phone"]';
const INPUT_EMAIL = 'input[name="email"]';
const INPUT_FIRST_NAME = 'input[name="firstName"]';
const INPUT_LAST_NAME = 'input[name="lastName"]';
const INPUT_PHONE_NUMBER = 'input[name="phoneNumber"]';
const INPUT_STREET = 'input[name="street"]';
const INPUT_TOWN_CITY = 'input[name="townCity"]';
const INPUT_ZIP_CODE = 'input[name="zipCode"]';
const LABEL_COMPONENT = '.marketingConsent label';
const MARKETING_CONSENT_LABEL_HOLDER = '.marketingConsentLabelHolder';
const PRIVACY_POLICY_LABEL_HOLDER = '.privacyPolicyLabelHolder';
const SELECT = 'select';
const SELECT_COUNTRY = 'select[name="country"]';
const SELECTED = 'selected';
const SET_BACKGROUND_URL = '--background-image-url';
const TEL = 'tel';
const TERMS_AND_CONDITIONS_LABEL_HOLDER = '.termsAndConditionsLabelHolder';
const USER_INFORMATION = 'userinformation';
const ZIP_CODE = 'zipCode';

export default class D2C_PersonalDetails extends LightningElement {
    /**
     * NBD2C - 97
     * This variable holds the email label
     * @type {String}
     */
    _emailLabel = PERSONAL_DETAIL_FORM_LABELS.split(';')[5]; // "Email";

    /**
     * NBD2C - 97
     * This variable holds the first name label
     * @type {String}
     */
    _firstNameLabel = PERSONAL_DETAIL_FORM_LABELS.split(';')[3]; // "First Name";

    /**
     * NBD2C - 97
     * This variable holds the heading label
     * @type {String}
     */
    _headingValue = PERSONAL_DETAIL_FORM_LABELS.split(';')[1]; // 'Please enter following information';

    /**
     * NBD2C - 97
     * This variable holds the last name label
     * @type {String}
     */
    _lastNameLabel = PERSONAL_DETAIL_FORM_LABELS.split(';')[4]; // "Last Name";

    /**
     * NBD2C - 97
     * This variable holds the phone label
     * @type {String}
     */
    _phoneLabel = PERSONAL_DETAIL_FORM_LABELS.split(';')[6]; // "Phone";

    /**
     * NBD2C - 97
     * This variable holds the salutation label
     * @type {String}
     */
    _salutationLabel = PERSONAL_DETAIL_FORM_LABELS.split(';')[2]; // 'Salutation*';

    /**
     * NBD2C - 97
     * This variable holds the marketing concent label
     * @type {String}
     */
    _marketingConsentLabel = PERSONAL_DETAIL_FORM_LABELS.split(';')[7];

    /**
     * NBD2C - 97
     * This variable holds the terms and conditions label
     * @type {String}
     */
    _termsAndConditionsText = PERSONAL_DETAIL_FORM_LABELS.split(';')[8];

    /**
     * NBD2C - 97
     * This variable holds the privacy policy lable
     * @type {String}
     */
    _privacyPolicyText = PERSONAL_DETAIL_FORM_LABELS.split(';')[9];

    /**
     * NBD2C - 97
     * This variable holds the salutation value
     * @type {String}
     */
    @track _salutationValue = '';

    /**
     * NBD2C - 97
     * This variable holds the First Name value
     * @type {String}
     */
    @track _firstName = '';

    /**
     * NBD2C - 97
     * This variable holds the Last Name value
     * @type {String}
     */
    @track _lastName = '';

    /**
     * NBD2C - 97
     * This variable holds the email value
     * @type {String}
     */
    @track _email = '';

    /**
     * NBD2C - 97
     * This variable holds the phone number
     * @type {String}
     */
    @track _phoneNumber = '';

    /**
     * NBD2C - 97
     * This variable holds the selected country code
     * @type {String}
     */
    @track _selectedCountryCode = '';

    /**
     * NBD2C - 97
     * This variable holds the marketing concent checkbox value
     * @type {String}
     */
    @track _marketingConsent = false;

    /**
     * NBD2C - 97
     * This variable holds the error message for invalid phone number
     * @type {String}
     */
    _invalidPhoneNumberErrorMessage = PERSONAL_DETAIL_FORM_LABELS.split(';')[10];

    /**
     * NBD2C - 97
     * This variable holds the error message for invalid email
     * @type {String}
     */
    _invalidEmailErrorMessage = NEWSLETTER_FORM_LABELS.split(',')[0];

    /**
     * NBD2C - 97
     * This variable holds the error message
     * @type {String}
     */
    _errorMessage = NEWSLETTER_FORM_LABELS.split(',')[4]; // 'Please fill out this field.';

    /**
     * NBD2C - 97
     * This variable holds the country codes for phone number
     * @type {Array}
     */
    @track _countryCodes = [];

    /**
     * NBD2C - 97
     * This variable is used to validate if libphonenumber library is loaded successfully
     * @type {Boolean}
     */
    _phoneNumberLibraryLoaded = false;

    /**
     * NBD2C - 97
     * This variable is used to check whether the phone number is valid
     * @type {Boolean}
     */
    _isPhoneNumberValid = false;

    /**
     * NBD2C - 97
     * This variable is used to check whether the email is valid
     * @type {Boolean}
     */
    _isEmailValid = false;

    /**
     * NBD2C - 97
     * This variable holds the alternative text for loader
     * @type {Array}
     */
    _loadingLabel = D2C_NB_PDP_LABELS.split(',')[24];

    /**
     * NBD2C - 97
     * This variable holds the url of the dropdown icon (down)
     * @type {String}
     */
    _dropDownIcon = STORE_STYLING + DOWN_ARROW_LOCATION;

    /**
     * NBD2C - 97
     * This variable holds the value for current store country
     * @type {String}
     */
    _storeCountry = '';

    /**
     * NBD2C - 114
     * This variable holds the options for country field
     * @type {String}
     */
    @track _supportedCountries = [];

    /**
     * NBD2C - 114
     * This variable holds the label for street field
     * @type {String}
     */
    _streetLabel = PERSONAL_DETAIL_FORM_LABELS.split(';')[11];

    /**
     * NBD2C - 114
     * This variable holds the label for address2 field
     * @type {String}
     */
    _addressLabel = PERSONAL_DETAIL_FORM_LABELS.split(';')[12];

    /**
     * NBD2C - 114
     * This variable holds the label for zip code field
     * @type {String}
     */
    _zipCodeLabel = PERSONAL_DETAIL_FORM_LABELS.split(';')[13];

    /**
     * NBD2C - 114
     * This variable holds the label for town/city field
     * @type {String}
     */
    _townCityLabel = PERSONAL_DETAIL_FORM_LABELS.split(';')[14];

    /**
     * NBD2C - 114
     * This variable holds the label for country field
     * @type {String}
     */
    _countryLabel = PERSONAL_DETAIL_FORM_LABELS.split(';')[15];

    /**
     * NBD2C - 114
     * This variable holds the error message in case user enters invalid zip code value
     * @type {String}
     */
    _invalidZipCodeErrorMessage = PERSONAL_DETAIL_FORM_LABELS.split(';')[16];

    /**
     * NBD2C - 114
     * This variable holds the value for street field
     * @type {String}
     */
    @track
    _street = '';

    /**
     * NBD2C - 114
     * This variable holds the value for address2 field
     * @type {String}
     */
    @track
    _address = '';

    /**
     * NBD2C - 114
     * This variable holds the value for zip code field
     * @type {String}
     */
    @track
    _zipCode = '';

    /**
     * NBD2C - 114
     * This variable holds the value for town/city field
     * @type {String}
     */
    @track
    _townCity = '';

    /**
     * NBD2C - 114
     * This variable holds the value for country field
     * @type {String}
     */
    @track
    _country = '';

    /**
     * NBD2C - 114
     * This variable holds the error message for invalid select value
     * @type {String}
     */
    _selectFieldValidationMessage = NEWSLETTER_FORM_LABELS.split(',')[6];

    /**
     * NBD2C - 97
     * This variable is used to verify if the current checkout process is Online Purchase or Click and Collect
     * @type {Boolean}
     */
    @api
    isOnlinePurchase = false;

    /**
     * NBD2C - 97
     * This variable holds the all values for the personal detail section
     * @type {JSON}
     */
    @api
    userDetails = {
        salutation: this._salutationValue,
        firstName: this._firstName,
        lastName: this._lastName,
        email: this._email,
        phoneNumber: this._phoneNumber,
        countryCode: this._countryCodes,
        street: this._street,
        address: this._address,
        zipCode: this._zipCode,
        townCity: this._townCity,
        country: this._country,
        marketingConsent: false
    };

    // Wire method to fetch supported countries
    @wire(getSupportedCountries)
    _wiredCountries({ error, data }) {
        if (data) {
            data.forEach((countryInstance) => {
                let option = {};
                if (countryInstance.IsPersonalDetails__c) {
                    if (this.userDetails && this.userDetails.country && this.userDetails.country == countryInstance.Country_Code__c) {
                        option = {
                            label: countryInstance.Country_Name__c,
                            value: countryInstance.Country_Code__c,
                            selected: SELECTED
                        };
                    } else {
                        option = {
                            label: countryInstance.Country_Name__c,
                            value: countryInstance.Country_Code__c,
                            selected: ''
                        };
                    }
                    this._supportedCountries.push(option);
                }
            });
        } else if (error) {
            console.error(error);
        }
    }

    /**
     * NBD2C-97
     * @description: Retrieves the component from markup as per the provided input
     * @param {String} componentName : Name of the component that is to be retrieved
     * @returns {Object} - Object representing the component that is to be retrieved
     */
    async retrieveComponent(componentName) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                const element = this.template.querySelector(componentName);
                if (element) {
                    clearInterval(interval);
                    resolve(element);
                }
            }, 100);
        });
    }

    /**
     * NBD2C-97
     * @description: This method is used to set values to variables if user data exists
     */
    async connectedCallback() {
        // Extracting the site's current language and country and performing formatting
        const currentLanguage = LANG ? JSON.stringify(LANG.toUpperCase()).split('-') : null;
        this._storeCountry = currentLanguage?.length > 1 ? currentLanguage[1].replace('"', '') : currentLanguage[0].replaceAll('"', '');
        this.loadPhoneNumberLibrary();

        const {
            salutation = '',
            firstName = '',
            lastName = '',
            email = '',
            phoneNumber = '',
            countryCode = this._storeCountry,
            street = '',
            address = '',
            zipCode = '',
            townCity = '',
            country = '',
            marketingConsent = false
        } = this.userDetails ?? {};

        this._salutationValue = salutation;
        this._firstName = firstName;
        this._lastName = lastName;
        this._email = email;
        this._phoneNumber = phoneNumber;
        this._selectedCountryCode = countryCode;
        this._street = street;
        this._address = address;
        this._zipCode = zipCode;
        this._townCity = townCity;
        this._country = country;
        this._marketingConsent = marketingConsent;

        if (this._marketingConsent) {
            const labelComponent = await this.retrieveComponent(LABEL_COMPONENT);

            // Check if the element exists
            if (labelComponent) {
                // Create and dispatch a click event
                const clickEvent = new MouseEvent(CLICK, {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                labelComponent.dispatchEvent(clickEvent);
            }
        }
    }

    /**
     * NBD2C - 97
     * @description: Sets background image URL for dropdown on component render.
     */
    renderedCallback() {
        this.template.host.style.setProperty(SET_BACKGROUND_URL, `url(${this._dropDownIcon})`);
        this.template.querySelector(PRIVACY_POLICY_LABEL_HOLDER).innerHTML = this._privacyPolicyText;
        this.template.querySelector(TERMS_AND_CONDITIONS_LABEL_HOLDER).innerHTML = this._termsAndConditionsText;
        this.template.querySelector(MARKETING_CONSENT_LABEL_HOLDER).innerHTML = this._marketingConsentLabel;
    }

    /**
     * NBD2C-97
     * @description: Handles the change event for salutation dropdown.
     * @param {Event} event - The event object.
     */
    handleSalutationChange(event) {
        this._salutationValue = event && event.detail && event.detail.value ? event.detail.value : '';

        this.userDetails = {
            ...this.userDetails,
            salutation: this._salutationValue
        };
    }

    /**
     * NBD2C - 97
     * @description: Handles the change event for input fields.
     * @param {Event} event - The event object.
     */
    handleInputChange(event) {
        const field = event.target.name;
        if (event && event.target && event.target.value && event.target.type && event.target.type == TEL) {
            this._phoneNumber = event.target.value;
            this.validatePhoneNumber({});
        }

        if (event && event.target && event.target.value && event.target.type && event.target.type == EMAIL) {
            this._email = event.target.value;
            this.validateEmail(event);
        }

        this[`_${field}`] = event.target.type === CHECKBOX ? event.target.checked : event.target.value;
        this.userDetails = {
            ...this.userDetails,
            [field]: this[`_${field}`]
        };
        this.sendDataToParent();
    }

    /**
     * NBD2C - 97
     * @description: Validates the form fields.
     * @returns {boolean} - Indicates whether all fields are valid or not.
     */
    @api
    validateFields() {
        // Get form fields in the order they appear in the HTML.
        const fieldsToValidate = [
            ...this.template.querySelectorAll(
                `${INPUT_FIRST_NAME},  ${INPUT_LAST_NAME}, ${INPUT_EMAIL}, ${INPUT_PHONE_NUMBER}, ${INPUT_STREET}, ${INPUT_ZIP_CODE}, ${INPUT_TOWN_CITY}, ${SELECT_COUNTRY}`
            )
        ];

        let allFieldsValid = true;

        for (let inputCompare of fieldsToValidate) {
            inputCompare.setCustomValidity(''); // Clear previous custom error
            if (!inputCompare.checkValidity()) {
                let validationMessage = this._errorMessage;
                if (inputCompare.type == TEL) {
                    validationMessage = this._invalidPhoneNumberErrorMessage;
                }

                if (inputCompare.type == EMAIL) {
                    validationMessage = this._invalidEmailErrorMessage;
                }

                if (inputCompare.name == ZIP_CODE) {
                    validationMessage = this._invalidZipCodeErrorMessage;
                }

                if (inputCompare.tagName.toLowerCase() === SELECT) {
                    validationMessage = this._selectFieldValidationMessage;
                }
                inputCompare.setCustomValidity(validationMessage);
                inputCompare.reportValidity();
                inputCompare.focus(); // Focus the first invalid field
                allFieldsValid = false; // Set to false if any field is invalid
                break; // Stop further validation once an invalid field is found
            }
            if (inputCompare.type == EMAIL) {
                this.validateEmail({
                    target: {
                        value: this._email
                    }
                });
                if (!this._isEmailValid) {
                    break;
                }
            }
        }
        this.validatePhoneNumber({});
        allFieldsValid && this._isPhoneNumberValid && this._isEmailValid ? this.sendDataToParent() : '';
    }

    /**
     * NBD2C - 97
     * @description: Validates the user phone number.
     * @returns {boolean} - Indicates whether phone field is valid or not.
     */
    validatePhoneNumber(event) {
        const { parsePhoneNumberFromString } = window.libphonenumber;
        const fieldToValidate = [...this.template.querySelectorAll(INPUT_PHONE_NUMBER)];

        if (this._selectedCountryCode && this._phoneNumber) {
            const phoneNumber = parsePhoneNumberFromString(this._phoneNumber, this._selectedCountryCode);
            if (phoneNumber && phoneNumber.isValid()) {
                this._phoneNumber = phoneNumber.formatNational(); // Format the number in national format
                for (let inputCompare of fieldToValidate) {
                    inputCompare.setCustomValidity(''); // Clear previous custom error
                }
                this._isPhoneNumberValid = true;
            } else {
                for (let inputCompare of fieldToValidate) {
                    inputCompare.setCustomValidity(''); // Clear previous custom error
                    let validationMessage = this._invalidPhoneNumberErrorMessage;
                    inputCompare.setCustomValidity(validationMessage);
                    inputCompare.reportValidity();
                    inputCompare.focus(); // Focus the first invalid field
                }
                this._isPhoneNumberValid = false;
            }
        }
    }

    /**
     * NBD2C-97
     * @description: Validates the email address.
     * @param {String} email - The email address to validate.
     * @returns {Boolean} - Indicates whether the email is valid or not.
     */
    validateEmail(event) {
        let email = event.target.value;
        const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+$/;

        const fieldToValidate = [...this.template.querySelectorAll(INPUT_EMAIL)];

        if (regex.test(email)) {
            this._isEmailValid = true;

            for (let inputCompare of fieldToValidate) {
                inputCompare.setCustomValidity(''); // Clear previous custom error
            }
        } else {
            this._isEmailValid = false;
            for (let inputCompare of fieldToValidate) {
                inputCompare.setCustomValidity(''); // Clear previous custom error
                let validationMessage = this._invalidEmailErrorMessage;
                inputCompare.setCustomValidity(validationMessage);
                inputCompare.reportValidity();
                inputCompare.focus(); // Focus the first invalid field
            }
        }
    }

    /**
     * NBD2C - 97
     * @description: This method sends data to parent component.
     */
    sendDataToParent() {
        this.userDetails = {
            salutation: this._salutationValue,
            firstName: this._firstName,
            lastName: this._lastName,
            email: this._isEmailValid ? this._email : '',
            phoneNumber: this._isPhoneNumberValid ? this._phoneNumber : '',
            countryCode: this._selectedCountryCode,
            street: this._street,
            address: this._address,
            zipCode: this._zipCode,
            townCity: this._townCity,
            country: this._country,
            marketingConsent: this._marketingConsent
        };

        this.userDetails && this.userDetails.firstName && this.userDetails.lastName && this.userDetails.email && this.userDetails.phoneNumber
            ? this.dispatchEvent(new CustomEvent(USER_INFORMATION, { detail: this.userDetails }))
            : this.dispatchEvent(new CustomEvent(USER_INFORMATION, { detail: {} }));
    }

    /**
     * NBD2C - 97
     * @description: Load phoneNumberLibrary library from static resources
     */
    loadPhoneNumberLibrary() {
        loadScript(this, phoneNumberLibrary)
            .then(() => {
                this._phoneNumberLibraryLoaded = true;
                this.extractCountryData();
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /**
     * NBD2C - 97
     * @description: Once library is loaded generate the country codes.
     */
    extractCountryData() {
        const { getCountries, getCountryCallingCode } = window.libphonenumber;
        const countryCodeSet = new Set(); // Using a Set to keep track of unique country codes

        getCountries().forEach((countryCode) => {
            const callingCode = getCountryCallingCode(countryCode);
            if (this.userDetails.countryCode == countryCode) {
                this._selectedCountryCode = countryCode;
                const countryItem = {
                    label: `+${callingCode}`,
                    value: countryCode,
                    selected: SELECTED
                };
                countryCodeSet.add(callingCode);
                this._countryCodes.push(countryItem);
            } else if (countryCode == this._storeCountry) {
                this._selectedCountryCode = countryCode;
                const countryItem = {
                    label: `+${callingCode}`,
                    value: countryCode,
                    selected: SELECTED
                };
                countryCodeSet.add(callingCode);
                this._countryCodes.push(countryItem);
            } else if (!countryCodeSet.has(callingCode)) {
                const countryItem = {
                    label: `+${callingCode}`,
                    value: countryCode,
                    selected: ''
                };
                this._countryCodes.push(countryItem);
                countryCodeSet.add(callingCode);
            }
        });

        this._countryCodes.sort((a, b) => a.label.localeCompare(b.label));

        if (this.userDetails.countryCode) {
            const countryCodeComponent = this.template.querySelector(COUNTRY_CODES_CLASS);
            this._countryCodes.forEach((countryCode, index) => {
                if (countryCode.value == this.userDetails.countryCode) {
                    countryCodeComponent.selectedIndex = index;
                    this._selectedCountryCode = countryCode.value;
                }
            });
        }
    }

    /**
     * NBD2C - 97
     * @description: Update the selected country code.
     */
    handleCountryChange(event) {
        if (event && event.target && event.target.value) {
            this._selectedCountryCode = event.target.value;
        }
        this.userDetails = {
            ...this.userDetails,
            countryCode: this._selectedCountryCode
        };
        this.validatePhoneNumber();
        this.formatPhoneNumber();
    }

    /**
     * NBD2C-97
     * @description: This method is used to save the value for phone number entered by user,
     * It further calls formatPhoneNumber method to format entered phone number
     */
    handlePhoneNumberChange(event) {
        if (event && event.target && event.target.value) {
            this._phoneNumber = event.target.value;
        } else {
            this._phoneNumber = '';
        }
        this.userDetails = {
            ...this.userDetails,
            phoneNumber: this._phoneNumber
        };
        this.formatPhoneNumber();
    }

    /**
     * NBD2C-97
     * @description: This method formatted the user entered phone number as per the selected country styling
     */
    formatPhoneNumber() {
        if (this._phoneNumberLibraryLoaded && this._selectedCountryCode && this.phoneNumber) {
            const { AsYouType } = window.libphonenumber;
            const formatter = new AsYouType(this._selectedCountryCode);
            const formattedNumber = formatter.input(this._phoneNumber.replace(/[^0-9]/g, ''));
            this._phoneNumber = formattedNumber;
            this.template.querySelector(INPUT_DATA_ID_PHONE).value = formattedNumber;
        }
    }

    /**
     * NBD2C-97
     * @description: Retrieves the salutation options.
     * @returns {Object[]} - Array of objects representing salutation options.
     */
    get salutationOptions() {
        const options = SALUTATION_OPTIONS.split(',').map((option) => {
            const [value, label] = option.split(':');
            return { label, value };
        });
        if (this.userDetails.salutation) {
            this._salutationValue = this.userDetails.salutation;
        }
        // Set default value for _salutationValue if not already set
        else if (!this._salutationValue && options.length > 0) {
            this._salutationValue = options[0].value;
            this.userDetails = {
                ...this.userDetails,
                salutation: this._salutationValue
            };
        }
        return options;
    }
}
