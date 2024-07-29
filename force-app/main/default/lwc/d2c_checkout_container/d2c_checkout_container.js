import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { CartSummaryAdapter } from 'commerce/cartApi';
import { NavigationMixin, navigate, NavigationContext } from 'lightning/navigation';

// GET LABELS
import CLICK_AND_COLLECT_STEPS from '@salesforce/label/c.D2C_NB_ClickAndCollectStepsForBacked'; // NBD2C-95 Labels of Steps applicable for Click and Collect
import ONLINE_PURCHASE_STEPS from '@salesforce/label/c.D2C_NB_OnlinePurchaseStepsForBackend'; // NBD2C-95 Labels of Steps applicable for Online Purchase
import CHECKOUT_LABELS from '@salesforce/label/c.D2C_NB_CheckoutLabels'; //NBD2C-95 Utility labels for checkout

// NBD2C-95 - Constants - Start
const BACK = 'Back';
const CLICK_AND_COLLECT = 'clickAndCollect';
const EMPTY_STRING = '';
const NEXT = 'Next';
const ONLINE_PURCHASE = 'onlinePurchase';
const PERSONAL_DETAILS_COMPONENT = 'c-d2c_personal-details';
const PROGRESS_BAR_COMPONENT = 'c-d2c_progress_bar_component';
const CART_PAGE = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Current_Cart'
    }
};

// NBD2C-114 - Constants - Start
const SALUTATION = 'salutation';
const FIRST_NAME = 'firstName';
const LAST_NAME = 'lastName';
const EMAIL = 'email';
const PHONE_NUMBER = 'phoneNumber';
const COUNTRY_CODE = 'countryCode';
const STREET = 'street';
const ZIP_CODE = 'zipCode';
const TOWN_CITY = 'townCity';
const COUNTRY = 'country';
// NBD2C-114 - Constants - End

// NBD2C-95 - Constants - End

const RETAILER_DATA_EVENT = 'retailerinformation'; //NBD2C-112

export default class D2C_Checkout_Container extends NavigationMixin(LightningElement) {
    /**
     * NBD2C-95
     * This variable holds the label for the Next button.
     * @type {String}
     */
    _nextButtonLabel = CHECKOUT_LABELS.split(';')[0];

    /**
     * NBD2C-95
     * This variable holds the label for the Back button.
     * @type {String}
     */
    _backButtonLabel = CHECKOUT_LABELS.split(';')[1];

    /**
     * NBD2C-95
     * This is used to check if the current process is "Online Purchase".
     * True if "Online Purchase".
     * @type {Boolean}
     */
    _isOnlinePurchase;

    /**
     * NBD2C-95
     * This variable is used to send the current process type to 'c-d2c_progress_bar_component' child.
     * @type {String}
     */
    _pageSource;

    /**
     * NBD2C-95
     * This variable is used to store the current step and send the same information to 'c-d2c_progress_bar_component' component
     * @type {Number}
     */
    _currentStep = 1;

    /**
     * NBD2C-95
     * This stores the total number of steps for the current checkout process.
     * @type {Number}
     */
    _totalSteps;

    /**
     * NBD2C-95
     * This is used to toggle the "BACK" button.
     * If true: disable the back button.
     * @type {Boolean}
     */
    @track
    _disableBackButton = false;

    /**
     * NBD2C-95
     * This is used to toggle the "NEXT" button.
     * If true: disable the next button.
     * @type {Boolean}
     */
    @track
    _disableNextButton = false;

    /**
     * NBD2C-95
     * This is used to toggle the loader.
     * @type {Boolean}
     */
    @track
    _loadComponents = false;

    /**
     * NBD2C-96
     * This variable holds the selected appointment date and time
     * @type {String}
     */
    _appointmentDateTime = '';

    /**
     * NBD2C-95
     * This JSON object is used to toggle the child component based on the steps.
     * @type {Object}
     */
    @track
    _currentActiveComponent = {
        retailer_Search: false,
        personal_Details: false,
        appointment_Section: false,
        order_Summary: false,
        order_Confirmation: false,
        payment_Method: false
    };

    /**
     * NBD2C-95
     * This array stores the flow for check out for the Online Purchase process
     * @type {Array}
     */
    _onlineSteps = ONLINE_PURCHASE_STEPS.split(';');

    /**
     * NBD2C-95
     * This array stores the flow for check out for the Click&Collect process
     * @type {Array}
     */
    _clickAndCollectSteps = CLICK_AND_COLLECT_STEPS.split(';');

    /**
     * NBD2C-95
     * This variable is used to save the steps for the current checkout process sent by 'c-d2c_progress_bar_component' component
     * @type {Object}
     */
    @track
    _steps = {};

    /**
     * NBD2C-95
     * This variable is used to save the steps for the current checkout process sent by 'c-d2c_progress_bar_component' component
     * @type {Object}
     */
    @track
    _userDetails = {};

    /**
     * NBD2C-95
     * This variable is used to save the data of steps
     * @type {Object}
     */
    @track
    _customerSummary = {
        retailerData: {},
        appointmentData: {},
        personalData: {}
    };

    /**
     * NBD2C-95
     * This variable holds the retailer information received from 'c-d2c_progress_bar_component'
     * @type {Object}
     */
    @track
    _retailerData;

    /**
     * This wire adapter fetches the navigation-context
     * NBD2C-95
     */
    @wire(NavigationContext)
    navigationalContext;

    /**
     * NBD2C-95
     * This method is used to retrieve the pageRef attributes via wire call
     */
    @wire(CurrentPageReference)
    pageRef;

    /**
     * NBD2C-95
     * Fetch the details of the current Cart
     * If absent then redirect user to cart page
     */
    @wire(CartSummaryAdapter)
    cartSummary;

    /**
     * NBD2C-95
     * This getter method is used to send latest retailer data to 'c-d2c_retailer_search_component'
     */
    @api
    get retailerDataValue() {
        return this._retailerData;
    }

    /**
     * NBD2C-95
     * This method call's handleRedirectToCartPage method if there is no items within cart or if cartSummary returned an error
     */
    cartSummaryCallback({ error, data }) {
        if (error) {
            this.handleRedirectToCartPage();
        } else if (data && data.totalProductCount === 0) {
            this.handleRedirectToCartPage();
        }
    }

    /**
     * NBD2C-95
     * This method is used to set the visibility of the 'NEXT' and 'BACK' buttons
     * If pageRef is present then set the values of '_isOnlinePurchase' and '_pageSource' variables
     * If cartSummary adapter returned any data then we call the cartSummaryCallback method to handle further processing of it
     */
    connectedCallback() {
        this.checkCartValidity(); // NBD2C-98
        if (this._currentStep == 1) {
            this._disableBackButton = true;
            this._disableNextButton = false;
        }

        if (this.pageRef && this.pageRef.state && this.pageRef.state.cartType) {
            const currentCartType = this.pageRef.state.cartType;

            this._isOnlinePurchase =
                currentCartType && currentCartType.toLowerCase() == ONLINE_PURCHASE.toLowerCase()
                    ? true
                    : currentCartType.toLowerCase() == CLICK_AND_COLLECT.toLowerCase()
                    ? false
                    : null;

            this._pageSource = this._isOnlinePurchase ? ONLINE_PURCHASE : CLICK_AND_COLLECT;
            currentCartType ? (this._loadComponents = true) : (this._loadComponents = false);
        }

        let retailerDataFromSession = sessionStorage.getItem(RETAILER_DATA_EVENT) ?? '';

        //NBD2C-112
        if (retailerDataFromSession !== undefined && retailerDataFromSession !== null && retailerDataFromSession !== '') {
            let retailerData = retailerDataFromSession ? this.decodeString(retailerDataFromSession) : '';
            this._retailerData = JSON.parse(retailerData);
            this._customerSummary.retailerData = this._retailerData;
            this.checkStepwiseValidity();
        }
    }

    /**
     * NBD2C-98
     */
    renderedCallback() {
        this.checkCartValidity(); //NBD2C-98
    }

    /**
     * NBD2C-98
     * This method checks whether the cart has any cart items and redirecting user to cart page in case of no cart items
     */
    checkCartValidity() {
        // Redirecting user to cart screen in case of empty cart.
        if (this.cartSummary && this.cartSummary.loaded == true) {
            if (this.cartSummary.error) {
                this.handleRedirectToCartPage();
            } else if (
                this.cartSummary.data == undefined ||
                this.cartSummary.data == null ||
                (this.cartSummary.data && this.cartSummary.data.totalProductCount === 0)
            ) {
                this.handleRedirectToCartPage();
            }
        }
    }

    /**
     * NBD2C-95
     * This method is used to calculate the total number of steps for the current process based on the data from the 'c-d2c_progress_bar_component'.
     * @param {Object} event - The event object containing progress bar steps collection.
     */
    handleTotalSteps(event) {
        this._steps =
            event && event.detail && event.detail.progressBarStepsCollection
                ? JSON.parse(JSON.stringify(event.detail.progressBarStepsCollection))
                : EMPTY_STRING;
        this._totalSteps =
            event && event.detail && event.detail.progressBarStepsCollection ? JSON.parse(JSON.stringify(event.detail.progressBarStepsCollection)).length : 0;
        this.setCurrentStep();
    }

    /**
     * NBD2C-95
     * This method is used to set the active step for current process
     */
    setCurrentStep() {
        if (this._isOnlinePurchase) {
            this._onlineSteps.forEach((step, index) => {
                index + 1 == this._currentStep ? (this._currentActiveComponent[step] = true) : (this._currentActiveComponent[step] = false);
            });
        }
        if (!this._isOnlinePurchase) {
            this._clickAndCollectSteps.forEach((step, index) => {
                index + 1 == this._currentStep ? (this._currentActiveComponent[step] = true) : (this._currentActiveComponent[step] = false);
            });
            if (this._currentActiveComponent && this._currentActiveComponent.order_Summary == true) {
                this._nextButtonLabel = CHECKOUT_LABELS.split(';')[2];
            } else {
                this._nextButtonLabel = CHECKOUT_LABELS.split(';')[0];
            }
        }
    }

    /**
     * NBD2C-95
     * This method is used to disable next button through child component.
     */
    disableNextButton(event) {
        this._disableNextButton = true;
    }

    /**
     * NBD2C-95
     * This method is used to handle the operations on click of NEXT or BACK buttons
     */
    handleButtonClick(event) {
        if (event && event.target && event.target.value) {
            const currentClickedButton = event.target.value;

            if (currentClickedButton == BACK) {
                this._currentStep = this._currentStep - 1 > 1 ? this._currentStep - 1 : 1;
                const component = this.template.querySelector(PROGRESS_BAR_COMPONENT);
                component.handleProgressBarStepsUpdate(this._currentStep);
                this._disableBackButton = this._currentStep == 1 ? true : false;
                this.setCurrentStep();
            } else if (currentClickedButton == NEXT) {
                this._disableBackButton = false;
                if (this.checkStepwiseValidity()) {
                    this._currentStep = this._currentStep + 1 <= this._totalSteps ? this._currentStep + 1 : this._currentStep;
                    const component = this.template.querySelector(PROGRESS_BAR_COMPONENT);
                    component.handleProgressBarStepsUpdate(this._currentStep);
                    this.setCurrentStep();
                }
            }
        }
    }

    /**
     * NBD2C-95
     * This is to check if the requirements for the current steps are fulfilled or not.
     * If yes, then allow the user to move to the next step, by enabling the NEXT button.
     * else, disable the NEXT button.
     */
    checkStepwiseValidity() {
        if (this._currentActiveComponent.retailer_Search) {
            if (
                this._retailerData == EMPTY_STRING ||
                this._retailerData == null ||
                this._retailerData.openingHours === EMPTY_STRING ||
                this._retailerData.retailerAddress === EMPTY_STRING
            ) {
                this._disableNextButton = true;
                return false;
            } else {
                this._disableNextButton = false;
                return true;
            }
        }
        //NBD2C-96 : Check if user have selected Date and Time for appointment
        //If yes, enable the next button to proceed to the next step
        //else, keep next button disabled
        else if (this._currentActiveComponent.appointment_Section) {
            if (this._appointmentDateTime != null && this._appointmentDateTime != undefined && this._appointmentDateTime != EMPTY_STRING) {
                this._disableNextButton = false;
                return true;
            } else {
                return false;
            }
        }
        //NBD2C-97 : Check if user have filled all the input fields
        //If yes, proceed to the next step
        //else, show error message
        else if (this._currentActiveComponent.personal_Details) {
            const component = this.template.querySelector(PERSONAL_DETAILS_COMPONENT);
            component.validateFields();

            const requiredFieldsOnlinePurchase = [SALUTATION, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, COUNTRY_CODE, STREET, ZIP_CODE, TOWN_CITY, COUNTRY];

            const requiredFieldsClickAndCollect = [SALUTATION, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER];
            let fieldsToValidate = this._isOnlinePurchase ? requiredFieldsOnlinePurchase : requiredFieldsClickAndCollect;

            const isValid = fieldsToValidate.every((field) => {
                const value = this._userDetails?.[field];
                return value !== '' && value !== null && value !== undefined;
            });

            return isValid;
        }

        //NBD2C-98
        else if (this._currentActiveComponent.order_Summary) {
            return true;
        }
    }

    /**
     * NBD2C-95
     * @description This method is used to store the retailer Information received from 'c-d2c_retailer_search_component' component
     * @author Sachin V
     */
    handleRetailerInformation(event) {
        //NBD2C-96 : Check if the previously selected retailer is updated
        //If yes, then set _appointmentDateTime to empty string
        //else, set the value of _retailerDate variable
        if (
            this._retailerData &&
            event &&
            event.detail &&
            event.detail.retailerAddress &&
            event.detail.openingHours &&
            this._retailerData.retailerAddress &&
            this._retailerData.retailerAddress != event.detail.retailerAddress
        ) {
            this._retailerData = event.detail;
            this._appointmentDateTime = '';
        } else {
            this._retailerData = event && event.detail ? event.detail : EMPTY_STRING;
        }
        this._customerSummary.retailerData = this._retailerData;

        this.checkStepwiseValidity();
    }

    /**
     * NBD2C-96
     * This method is used to set the data passed by the appointment section child into _appointmentDateTime variable
     */
    handleAppointmentDateAndTime(event) {
        event && event.detail ? (this._appointmentDateTime = event.detail) : (this._appointmentDateTime = '');
        this._customerSummary.appointmentData = this._appointmentDateTime;
        this.checkStepwiseValidity();
    }

    /**
     * NBD2C-96
     * This method is used to set the personal details of user _appointmentDateTime variable
     */
    handleUserInformation(event) {
        this._userDetails = event && event.detail ? event.detail : {};
        this._customerSummary.personalData = this._userDetails;
    }

    /*
     * This method is used to redirect the user to cart page
     * NBD2C-95
     */
    handleRedirectToCartPage() {
        navigate(this.navigationalContext, CART_PAGE);
    }

    /*
     * This method is used to decode the string stored in session storage
     * NBD2C-112
     */
    decodeString(encodedString) {
        const binaryString = window.atob(encodedString);
        const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
        const decoder = new TextDecoder();
        return decoder.decode(bytes);
    }
}
