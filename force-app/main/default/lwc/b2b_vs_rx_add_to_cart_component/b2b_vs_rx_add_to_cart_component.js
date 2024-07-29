import { api, LightningElement, track } from 'lwc'; // 728

import getPicklistValues from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFieldPicklistValues'; // 728
import B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS from '@salesforce/label/c.B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS';
import B2B_CALLOUT_RESPONSE_LABELS from '@salesforce/label/c.B2B_CALLOUT_RESPONSE_LABELS'; //BS-1034
import B2B_VS_RX_CUSTOMER_SERVICE_INFO_LABEL from '@salesforce/label/c.B2B_VS_RX_CUSTOMER_SERVICE_INFO_LABEL'; //BS-1471
import B2B_VS_RX_REORDER_LABEL from '@salesforce/label/c.B2B_VS_RX_REORDER_LABEL'; //BS-1064

// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';

const LENS_CONFIGURATOR_API_NAME = 'B2B_Lens_Configurator__c';
const SPECIAL_HANDLING_FIELD_API_NAME = 'B2B_Special_Handling__c';
const OPERATE_LOADER = 'operateloader';
const USER_INPUT = 'userinput';
const NO_SELECTION_VALUE = 'No selection';
const KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_VS = 'selectedSpecialHandlingOptionForVS';
const KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX = 'selectedSpecialHandlingOptionForRX';
const KEY_FOR_USER_NOTE_ENTERED_FOR_VS = 'userNoteForVS';
const KEY_FOR_USER_NOTE_ENTERED_FOR_RX = 'userNoteForRX';
const KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_VS = 'customerServicePreferenceForVS';
const KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX = 'customerServicePreferenceForRX';
const PAGE_SOURCE_VS = 'VS'; //BS-655
const PAGE_SOURCE_RX = 'RX'; //BS-655
const LINE_BREAK_TAG = '<br>'; //BS-1034
const NULL_KEY = 'null'; //BS-1153

export default class B2b_vs_rx_add_to_cart_component extends LightningElement {
    _headerLabel = B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[0];
    _specialHandlingLabel = B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[1];
    _noteFieldLabel = B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[2];
    _instructionsLabel = B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[3];
    _helpTextInstructionLabel = B2B_VS_RX_CUSTOMER_SERVICE_INFO_LABEL; //BS-1471
    _relatedOrderLabel = B2B_VS_RX_REORDER_LABEL.split('|')[3]; //BS-1064
    _selectedSpecialHandlingOption;
    _userInputForNoteField;
    _isInitialLoadComplete;
    _customerServicePrefernceChoice = false;
    _customerServicePrefernceUnchecked = false; //BS-1312

    get successIcon() {
        return STORE_STYLING + '/icons/success.svg';
    }

    get alertIcon() {
        return STORE_STYLING + '/icons/INFO.svg';
    }

    @track
    _specialHandlingOptionsCollection;

    //BS-1064
    _relatedOrder;
    _isClonedOrder = false;

    @api
    pageSource;

    showNoteValue = false;

    /**
     * Variable to store input for special handling options
     * BS-1244
     * @type {String}
     */
    @api
    userInputForSpecialHandlingField;

    /**
     * Variable to store input for note options
     * BS-1244
     * @type {String}
     */
    @api
    userInputForNotesField;

    /**
     * Variable to store input for customer service preference
     * BS-1244
     * @type {Boolean}
     */
    @api
    customerServicePreferenceChoice;

    @api
    lensConfiguratorCollection; //BS-1064

    /**
     * This variable indicates whether schneiderCallout is failed
     * BS-1034
     * @type {Boolean}
     */
    schneiderCalloutFailed = false;

    /**
     * This variable holds the user friendly response message that needs to be shown on UI
     * BS-1034
     * @type {Boolean}
     */
    responseMessage;

    /**
     * BS-728
     * Connected call back will handle pre-population of data.
     */
    connectedCallback() {
        if (
            this.lensConfiguratorCollection &&
            this.lensConfiguratorCollection.relatedOrderNumber != undefined &&
            this.lensConfiguratorCollection.relatedOrderNumber != null
        ) {
            this._isClonedOrder = true;
            this._relatedOrder = this._relatedOrderLabel + ' ' + this.lensConfiguratorCollection.relatedOrderNumber;
        } else {
            this._isClonedOrder = false;
        } //BS-1064
        let applicableKeyForSpecialHandlingOption;
        let applicableKeyForUserNote;
        let applicableKeyForCustomerServicePreference;
        if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
            applicableKeyForSpecialHandlingOption = KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_VS;
            applicableKeyForCustomerServicePreference = KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_VS;
            applicableKeyForUserNote = KEY_FOR_USER_NOTE_ENTERED_FOR_VS;
        } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
            applicableKeyForSpecialHandlingOption = KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX;
            applicableKeyForCustomerServicePreference = KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX;
            applicableKeyForUserNote = KEY_FOR_USER_NOTE_ENTERED_FOR_RX;
        }
        //Updated as part of BS-1153
        if (localStorage.getItem(applicableKeyForUserNote) !== NULL_KEY && localStorage.getItem(applicableKeyForUserNote) !== null) {
            this._userInputForNoteField = localStorage.getItem(applicableKeyForUserNote);
        } else {
            this._userInputForNoteField = '';
        }
        if (
            localStorage.getItem(applicableKeyForCustomerServicePreference) !== NULL_KEY &&
            localStorage.getItem(applicableKeyForCustomerServicePreference) !== null
        ) {
            this._customerServicePrefernceChoice = localStorage.getItem(applicableKeyForCustomerServicePreference);
        } else {
            this._customerServicePrefernceChoice = false;
        }
        if (localStorage.getItem(applicableKeyForSpecialHandlingOption) !== NULL_KEY && localStorage.getItem(applicableKeyForSpecialHandlingOption) !== null) {
            this._selectedSpecialHandlingOption = localStorage.getItem(applicableKeyForSpecialHandlingOption);
        } else {
            this._selectedSpecialHandlingOption = NO_SELECTION_VALUE;
        }
        //BS-1244
        if (this.userInputForSpecialHandlingField != undefined && this.userInputForSpecialHandlingField != null) {
            this._selectedSpecialHandlingOption = this.userInputForSpecialHandlingField;
        }

        if (this.userInputForNotesField != undefined && this.userInputForNotesField != null) {
            this._userInputForNoteField = this.userInputForNotesField;
        }

        if (this.customerServicePreferenceChoice != undefined && this.customerServicePreferenceChoice != null) {
            this._customerServicePrefernceChoice = this.customerServicePreferenceChoice;
        }
        //BS-1244

        this.fireOperateLoader(true);
        this.getSpecialHandlingOptions();
    }

    /**
     * BS-728
     * This method will used to get the special handling options.
     */
    getSpecialHandlingOptions() {
        getPicklistValues({ objectApiName: LENS_CONFIGURATOR_API_NAME, picklistField: SPECIAL_HANDLING_FIELD_API_NAME })
            .then((data) => {
                let result = JSON.parse(JSON.stringify(data));
                this._specialHandlingLabel = result.fieldName;
                let specialHandlingOptions = [];
                result.picklistValues.forEach((value) => {
                    const handlingOptions = {};
                    handlingOptions.label = value.picklistValue;
                    handlingOptions.value = value.apiName;
                    specialHandlingOptions.push(handlingOptions);
                });
                this._specialHandlingOptionsCollection = specialHandlingOptions;

                this._isInitialLoadComplete = true;
                this.showNoteValue = true;
                this.fireOperateLoader(false); // Firing event to stop the loader/spinner
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                this.fireOperateLoader(false); // Firing event to stop the loader/spinner
            });
    }

    /**
     * BS-728
     * This method is ued handle the inputs entered by user
     */
    handleUserInput(event) {
        if (this._customerServicePrefernceChoice != true && this._customerServicePrefernceUnchecked == false) {
            this._customerServicePrefernceChoice = true;
        } //BS-1312
        this._userInputForNoteField = event.target.value;
        this.fireSendUserPreferenceOptions();
    }

    handleSpecialHandingOptionSelection(event) {
        let fieldName = event.target.name; // Name of field of filter
        let selectedValue = event.target.value; // Value selected by user as filte option
        this._selectedSpecialHandlingOption = selectedValue;
        this.fireSendUserPreferenceOptions();
    }

    handleCustomerServicePreference(event) {
        if (event.target.checked != null && event.target.checked != undefined) {
            this._customerServicePrefernceChoice = event.target.checked;
            if (this._customerServicePrefernceChoice == false) {
                this._customerServicePrefernceUnchecked = true;
            } else {
                this._customerServicePrefernceUnchecked = false;
            } //BS-1312
            this.fireSendUserPreferenceOptions();
        }
    }

    /**
     * This method is use to fire event: 'updateprogressbar' that updates the progress bar step of 'c/c/b2b_progressBar_Component' according to stepNumber provided
     * BS-728
     * @return   stepNumber     : Step Number that needs to be set as current active step (Number)
     *           activeStatus   : Step active status to determine whether above step is set to be active - (Boolean)
     *           successStatus  : Step success status to determine whether above step is set to be completed - (Boolean)
     */
    fireOperateLoader(loadingStatus) {
        this.dispatchEvent(
            new CustomEvent(OPERATE_LOADER, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    loadingStatus: loadingStatus
                }
            })
        );
    }

    /**
     * BS-728
     * This method is used to fire an event which will later handled on Parent component
     */
    fireSendUserPreferenceOptions() {
        this.dispatchEvent(
            new CustomEvent(USER_INPUT, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    note: this._userInputForNoteField,
                    specialHandlingOption: this._selectedSpecialHandlingOption,
                    customerServicePreference: this._customerServicePrefernceChoice
                }
            })
        );
    }

    /**
     * BS-1034
     * This method gets invoked by c/b2b_vs_rx_filter_container and indicates the status of schneider callout
     */
    @api
    showSchneiderCalloutFailureResponse(schneiderCalloutFailed, responseMessage) {
        this.schneiderCalloutFailed = schneiderCalloutFailed;
        this.responseMessage = responseMessage + LINE_BREAK_TAG + B2B_CALLOUT_RESPONSE_LABELS.split(',')[0];
    }
}
