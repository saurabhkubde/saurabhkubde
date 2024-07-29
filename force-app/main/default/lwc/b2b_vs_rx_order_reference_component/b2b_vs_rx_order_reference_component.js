import { api, track, LightningElement } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import LANG from '@salesforce/i18n/lang';

//GET LABELS
import B2B_VS_RX_ORDER_REFERENCE_LABELS from '@salesforce/label/c.B2B_VS_RX_Order_Reference_Labels';
import B2B_RESET_LENS_CONFIGURATOR_WARNING from '@salesforce/label/c.B2B_RESET_LENS_CONFIGURATOR_WARNING';
import B2B_YES_BUTTON_LABEL from '@salesforce/label/c.B2B_YES_BUTTON_LABEL';
import B2B_NO_BUTTON_LABEL from '@salesforce/label/c.B2B_NO_BUTTON_LABEL';
import B2B_LEAVE_THE_CONFIGURATION_LABEL from '@salesforce/label/c.B2B_LEAVE_THE_CONFIGURATION_LABEL';
import B2B_ORDER_FIELD_LEVEL_CHARACTER_LIMIT_ERROR_MESSAGE from '@salesforce/label/c.B2B_ORDER_FIELD_LEVEL_CHARACTER_LIMIT_ERROR_MESSAGE';
import getPicklistValues from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFieldPicklistValues';
import updateLensConfiguratorData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.updateLensConfiguratorData';
import getSelectedProductDetail from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getSelectedProductDetail';
import getAccountDetail from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getAccountDetail';
// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-655

// CUSTOM LABELS
import SAVE_BUTTON from '@salesforce/label/c.B2B_ACC_Save';
import CANCEL_BUTTON from '@salesforce/label/c.B2B_ACC_Cancel';
import B2B_VS_RX_VALIDATION_LABELS from '@salesforce/label/c.B2B_VS_RX_VALIDATION_LABELS'; //BS-978
import { checkProductAvailability } from 'c/b2b_utils';
import LENS_ONLY_AND_FRAME_PROVIDED_EXCLUDED_COUNTRY_CODES from '@salesforce/label/c.B2B_VS_RX_LENS_ONLY_AND_FRAME_PROVIDED_EXCLUDED_COUNTRY_CODES'; //BS-1415
import ORDER_REMARK_FIELD_HELPTEXT from '@salesforce/label/c.B2B_ORDER_REMARK_FIELD_HELPTEXT'; //BS-2437
import CONSUMER_REFERENCE_FIELD_HELPTEXT from '@salesforce/label/c.B2B_CONSUMER_REFERENCE_FIELD_HELPTEXT'; //BS-2437

const PAGE_SOURCE_RX = 'RX'; //BS-655
const ORDER_INFORMATION_AVAILABLE = 'orderinformationavailable';
const UPDATE_PROGRESS_BAR = 'updateprogressbar';
const OPERATE_LOADER = 'operateloader';
const REGULAR_CONDITION_STYLING = 'custom slds-m-top_small';
const ERROR_CONDITION_STYLING = 'error slds-p-top_small';
const EMPTY = '';
const EDIT_MODE = 'edit';
const READ_ONLY_MODE = 'read';
const OBJECT_API_NAME = 'B2B_Lens_Configurator__c';
const B2B_ORDER_TYPE = 'B2B_Order_Type__c';
const B2B_FRAME_TYPE = 'B2B_Frame_Type__c';
const CUSTOMER_NAME_FIELD = 'End-Consumer/Reference';
const CUSTOMER_NAME_FIELD_GERMAN = 'Konsument/Referenz';
const CLERK_FIELD = 'Order Remark';
const CLERK_FIELD_GERMAN = 'Bestellhinweis';
const OPTICAL_EYEWEAR_FIELD = 'Optical Eyewear';
const SUNGLASSES_FIELD = 'Sunglasses';
const COMPLETE_EYEWEAR_FIELD = 'Complete Eyewear';
const LENS_ONLY_FIELD = 'Lens Only';
const ORDER_TYPE_FIELD = 'OrderType'; //BS-787;
const FRAME_TYPE_FIELD = 'FrameType'; //BS-787;
const LENS_ONLY_AND_FRAME_PROVIDED_FIELD = 'Lens Only + frame provided';
const KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX = 'selectedSpecialHandlingOptionForRX';
const KEY_FOR_USER_NOTE_ENTERED_FOR_RX = 'userNoteForRX';
const KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX = 'customerServicePreferenceForRX';

const HOME_PAGE = 'home'; //BS-1213
const STANDARD_NAMED_PAGE = 'standard__namedPage'; //BS-1213
const UPDATE_LENS_CONFIGURATOR_DATA = 'updateconfiguratordata'; //BS-1213
const PAGE_SOURCE_VS = 'VS'; //BS-1442
const FILTER_KEY_FOR_VS = 'selectedFiltersForVS'; // BS-1442
const REMOVE_ALL = 'Remove_All'; //BS-1442

//BS-1608
const FILTER_KEY = 'selectedFiltersForVS';
const FILTER_KEY_FOR_RX = 'SelectedFiltersForRX';
const SELECTED_VS_CATEGORY_KEY = 'selectedVSCategory';
const SELECTED_RX_CATEGORY_KEY = 'selectedRXCategory';
const TEXTAREA_STYLE = 'orderInformationSummaryFields slds-p-top_small textarea_styling';
const TEXTAREA_ERROR_STYLE = 'orderInformationSummaryFields slds-p-top_small textarea_styling redBorder';
//BS-1608

export default class B2b_vs_rx_order_reference_component extends NavigationMixin(LightningElement) {
    /**
     * Api property recieved from the parent 'b2b_visionSensation_RX_cotainer' that indicates the source of Page
     * BS-654
     * @type {String}
     */
    @api
    pageSource;

    /**
     * Variable to indicate whether the source is RX
     * BS-654
     * @type {Boolean}
     */
    _isSourceRX = false;

    /**
     * Variable to set current mode of component
     * BS-654
     * @type {Boolean}
     */
    @track
    _isReadOnly = false;

    /**
     * Variable to represent label of Order Information Header Section
     * BS-654
     * @type {String}
     */
    _orderInformationHeaderLabel;

    /**
     * This variable hold the label that needs to shown as warning alert label while leaving the configurator
     * BS-1213
     * @type {String}
     */
    _warningMessageForDelete = B2B_VS_RX_VALIDATION_LABELS.split(',')[1];

    /**
     * Variable to represent label of Customer Information Header Section
     * BS-654
     * @type {String}
     */
    _customerInformationHeaderLabel;

    /**
     * Variable to represent label of Order Type Header Section
     * BS-654
     * @type {String}
     */
    _orderTypeHeaderLabel;

    /**
     * Variable to represent label of Frame Type Header Section
     * BS-654
     * @type {String}
     */
    _frameTypeHeaderLabel;

    /**
     * Collection of order type picklist field values
     * BS-654
     * @type {Array}
     */
    @track
    orderTypeValues = [];

    /**
     * Variable to indicate total fields that needs to be cheked while proceeding to next screen
     *  Valid Scenarios
     *      1. For VS : 4 Fields needs to be checked as follows:
     *                  1. Customer Name
     *                  2. Clerk
     *                  3. Order Type
     *                  4. Frame Type
     *
     *      2. For RX : 3 Fields needs to be checked as follows:
     *                  1. Customer Name
     *                  2. Clerk
     *                  3. Order Type
     *                  Note: As Frame Type selection is not applicable for RX so, no need to check Frame type
     *
     * BS-654
     * @type {Integer}
     */
    _totalFieldsToCheck;

    /**
     * Collection of Customer Information entered by User on UI
     * BS-654
     * @type {Array}
     */
    @track
    _customerInformationSummaryCollection;

    @track
    updatedCustomerInformation = {};
    /**
     * Collection to hold input lens configurator details
     * BS-789
     * @type {object}
     */
    @api
    lensConfiguratorCollection;

    /**
     * Collection of Customer Information entered by User on UI
     * BS-654
     * @type {Array}
     */
    @api
    orderInformationSummaryCollection;

    /**
     * Variable to indicate whether order Type is valid
     * BS-654
     * @type {Boolean}
     */
    _isOrderTypeInValid = false;

    /**
     * Variable to indicate whether frame Type is valid
     * BS-654
     * @type {Boolean}
     */
    _isFrameTypeInValid = false;

    /**
     * Variable to represent label of instruction to be displayed on UI if user does not enter values in customer input fields
     * BS-654
     * @type {String}
     */
    _errorInstructionToEnterValue;

    /**
     * Variable to represent label of instruction to be displayed on UI if user does not select values of Order Type/Frame Type fields
     * BS-654
     * @type {String}
     */
    _errorInstructionToSelectValue;

    /**
     * Variable to indicate whether loading spinner is active
     * BS-654
     * @type {String}
     */
    _isLoading = false;

    /**
     * Variable to hold value of frame category applicable for RX
     * BS-654
     * @type {String}
     */
    _frameCategoryLabel;

    @api
    preservedOrderInformationCollection;

    //BS-788
    @api
    orderReferenceComponentMode;

    @track
    frameTypeValuesCollection = [];

    @track
    _readOnlyOrderInformation = true;

    @track
    _updatedCustomerName;

    @track
    _updatedClerk;

    @track
    _previousCustomerNameValue;

    @track
    _previousClerkValue;

    saveButton = SAVE_BUTTON;
    cancelButton = CANCEL_BUTTON;
    _isPreviouslyCompleteEyewear = false;
    _lensConfigResetWarningPopup = false;

    _lensConfigResetWarningMessage = B2B_RESET_LENS_CONFIGURATOR_WARNING;
    _yesButtonLabel = B2B_YES_BUTTON_LABEL;
    _noButtonLabel = B2B_NO_BUTTON_LABEL;
    _leaveConfigurationMessage = B2B_LEAVE_THE_CONFIGURATION_LABEL;
    _orderFieldLevelCharacterLimitErrorMessage = B2B_ORDER_FIELD_LEVEL_CHARACTER_LIMIT_ERROR_MESSAGE;
    /**
     * This variable is used to indicate whether user has entered from other location than tiles or VS-RX URL (Such as from normal PDP)
     * Value of this variable is recieved from parent component 'c/b2b_vs_rx_container'
     * BS-787
     * @type {Boolean}
     */
    @api
    isSourceFromOutsideConfigurator;

    /**
     * This variable is used to indicate the mode of order type input selection from user to be shown on UI (True/False)
     * There can be read only mode or edit mode (True/False)
     * BS-787
     * @type {Boolean}
     */
    @api
    orderTypeSelectionEditModeForOtherSource;

    /**
     * This variable controls the visibility of cancel popup.
     * BS-1213
     * @type {Boolean}
     */
    @api
    openCancelWarningPopup;

    @api
    selectedFrameId;
    @api
    effectiveAccountId;

    @track
    _isDisabledProduct = false;
    _countryCode; //BS-1415
    _characterLimit = 50; //BS-2339
    _orderRemarkHelpText = ORDER_REMARK_FIELD_HELPTEXT; //BS-2437
    _infoSVG = STORE_STYLING + '/icons/INFO.svg'; //BS-2437
    _isCharacterLimitExceeded = false;
    _consumerReferenceHelpText = CONSUMER_REFERENCE_FIELD_HELPTEXT; //BS-2437

    /*
     * This getter Method is used to fill the customer Order Information fields collection from labels that needs to be displayed on UI
     * BS-654
     * @return parseStepsCollection : Collection of steps for progress bar (VS/RX)
     */
    get prepareCollection() {
        if (this.selectedFrameId !== undefined && this.selectedFrameId !== null && this.effectiveAccountId !== undefined && this.effectiveAccountId !== null) {
            this.getAccountDetails();
        } else {
            //BS-1415 Start
            this.getAccountDetails().then(() => {
                this.getOrderTypeValues();
            });
            //BS-1415 End
        }
    }

    getOrderTypeValues() {
        getPicklistValues({ objectApiName: OBJECT_API_NAME, picklistField: B2B_ORDER_TYPE })
            .then((data) => {
                this.orderTypeValues = JSON.parse(JSON.stringify(data));
                this.getFrameTypeValues();
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                this.fireOperateLoader(false); // Firing event to stop the loader/spinner
            });
    }

    getFrameTypeValues() {
        getPicklistValues({ objectApiName: OBJECT_API_NAME, picklistField: B2B_FRAME_TYPE })
            .then((data) => {
                let parsedCustomerOrderInformationCollection = [];
                this.frameTypeValuesCollection = JSON.parse(JSON.stringify(data));
                let lensOnlyAndFramesProvidedCountryCodeList = LENS_ONLY_AND_FRAME_PROVIDED_EXCLUDED_COUNTRY_CODES.split(','); //BS-1415

                //Iterate over the custom label values and prepare the collection
                for (let i = 0; i < B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',').length; i++) {
                    //In custom labels, after 1st 4 labels, header labels are stored that is not needed to prepare collection hence neglecting the further labels
                    if (i < 4) {
                        const customerOrderInformationCollection = {};
                        customerOrderInformationCollection.label = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[i]; //label: Collection element to hold label that needs to be displayed on UI
                        customerOrderInformationCollection.value = ''; //value : Collection element to hold value that is entered by user on UI
                        customerOrderInformationCollection.isChecked = false; //isChecked : Collection element to indicate whether the value is selected by user from UI (Used for radio button type inputs)
                        customerOrderInformationCollection.isCustomerInput = false; //isCustomerInput : Collection element to indicate whether this is needed from user in form of input
                        customerOrderInformationCollection.isCustomerOutput = false; //isCustomerOutput : Collection element to indicate whether this is provided by user in form of output and these fields will be dispalyed on ready only screen
                        customerOrderInformationCollection.isOrderType = false; //isOrderType: Collection element to decide whether the field is of order type category
                        customerOrderInformationCollection.isFrameType = false; //isFrameType: Collection element to decide whether the field is of frame type category
                        customerOrderInformationCollection.isInvalid = false; //isInvalid: Collection element to decide whether the value entered by User on UI is vallid/Invalid
                        customerOrderInformationCollection.fieldName = ''; //fieldName: Collection element to hold fieldName
                        customerOrderInformationCollection.isOnFrameDetails = false; //BS-788 to identify frame type or order type
                        customerOrderInformationCollection.isOrderTypeLabel = false; //BS-788 to identify order type
                        customerOrderInformationCollection.isFrameTypeLabel = false; //BS-788 to identify frame type
                        customerOrderInformationCollection.isVsPage = false; //BS-788 to identify current page

                        //In Custom Labels, first 2 labels are used to represent customer input fields (Customer Name and Clerk)
                        if (i < 2) {
                            customerOrderInformationCollection.isCustomerInput = true; // As this fields needs input from customer, marking the element isCustomerInput as true
                            customerOrderInformationCollection.isCustomerOutput = true; // As this field needs to be displayed as output on ready only screen, marking element isCustomerOutput as true
                            customerOrderInformationCollection.applicableStyling = REGULAR_CONDITION_STYLING; // applicableStyling: Collection element to represent the styling class needs to be applied
                            if (customerOrderInformationCollection.showMaxCharError != true) {
                                customerOrderInformationCollection.applicableTextboxStyling = TEXTAREA_STYLE; // applicableStyling: Collection element to represent the styling class needs to be applied
                                customerOrderInformationCollection.showMaxCharError = false; // applicableStyling: Collection element to represent the styling class needs to be applied
                            }

                            if (i == 0) {
                                customerOrderInformationCollection.fieldName = CUSTOMER_NAME_FIELD; // BS-708 Setting up fieldName that needs to be used while fetching data from local storage
                            } else if (i == 1) {
                                customerOrderInformationCollection.fieldName = CLERK_FIELD; // BS-708 Setting up fieldName that needs to be used while fetching data from local storage
                            }
                            // Setting up applicableStyling as regular condition styling as input is not provided yet and validation checking is not performed
                        } else if (i >= 2 && i <= 3) {
                            //BS-788 setting values for new variables
                            if (i == 2) {
                                customerOrderInformationCollection.isVsPage = true;
                                customerOrderInformationCollection.fieldName = 'OrderType';
                                customerOrderInformationCollection.isOrderTypeLabel = true; //isOrderType: Collection element to decide whether the field is of order type category
                            } else if (i == 3) {
                                if (this.pageSource == 'VS') {
                                    customerOrderInformationCollection.isVsPage = true;
                                    customerOrderInformationCollection.fieldName = 'FrameType';
                                    customerOrderInformationCollection.isFrameTypeLabel = true;
                                } else {
                                    customerOrderInformationCollection.isVsPage = false;
                                }
                            } //end inner if

                            //In Custom Labels, from 2 to 3 position holds the labels that contains the fields labels that needs to be disaplyed as output on read only screen mode

                            customerOrderInformationCollection.isOnFrameDetails = true;
                        }
                        parsedCustomerOrderInformationCollection.push(customerOrderInformationCollection);
                    }
                }

                //Iterating over the obtained picklist values collection and preparing customer information summary collection
                this.orderTypeValues.picklistValues.forEach((value) => {
                    if (this._isDisabledProduct == true) {
                        if (value.apiName !== COMPLETE_EYEWEAR_FIELD) {
                            const customerOrderInformationCollection = {};
                            customerOrderInformationCollection.label = value.picklistValue; //label: Collection element to hold label that needs to be displayed on UI
                            customerOrderInformationCollection.value = ''; //value : Collection element to hold value that is entered by user on UI
                            customerOrderInformationCollection.isChecked = false; //isChecked : Collection element to indicate whether the value is selected by user from UI (Used for radio button type inputs)
                            customerOrderInformationCollection.isCustomerInput = false; //isCustomerInput : Collection element to indicate whether this is needed from user in form of input
                            customerOrderInformationCollection.isCustomerOutput = false; //isCustomerOutput : Collection element to indicate whether this is provided by user in form of output and these fields will be dispalyed on ready only screen
                            customerOrderInformationCollection.isOrderType = true; //isOrderType: Collection element to decide whether the field is of order type category
                            customerOrderInformationCollection.isFrameType = false; //isFrameType: Collection element to decide whether the field is of frame type category
                            customerOrderInformationCollection.isInvalid = false; //isInvalid: Collection element to decide whether the value entered by User on UI is vallid/Invalid
                            if (value.apiName == LENS_ONLY_FIELD) {
                                customerOrderInformationCollection.fieldName = LENS_ONLY_FIELD;
                            } else if (value.apiName == LENS_ONLY_AND_FRAME_PROVIDED_FIELD) {
                                customerOrderInformationCollection.fieldName = LENS_ONLY_AND_FRAME_PROVIDED_FIELD;
                            }
                            //Bs-1415 Start
                            if (value.apiName === LENS_ONLY_AND_FRAME_PROVIDED_FIELD) {
                                if (lensOnlyAndFramesProvidedCountryCodeList.includes(this._countryCode) === false) {
                                    parsedCustomerOrderInformationCollection.push(customerOrderInformationCollection);
                                }
                            } else {
                                parsedCustomerOrderInformationCollection.push(customerOrderInformationCollection);
                            }
                            //Bs-1415 End
                        }
                    } else {
                        const customerOrderInformationCollection = {};
                        customerOrderInformationCollection.label = value.picklistValue; //label: Collection element to hold label that needs to be displayed on UI
                        customerOrderInformationCollection.value = ''; //value : Collection element to hold value that is entered by user on UI
                        customerOrderInformationCollection.isChecked = false; //isChecked : Collection element to indicate whether the value is selected by user from UI (Used for radio button type inputs)
                        customerOrderInformationCollection.isCustomerInput = false; //isCustomerInput : Collection element to indicate whether this is needed from user in form of input
                        customerOrderInformationCollection.isCustomerOutput = false; //isCustomerOutput : Collection element to indicate whether this is provided by user in form of output and these fields will be dispalyed on ready only screen
                        customerOrderInformationCollection.isOrderType = true; //isOrderType: Collection element to decide whether the field is of order type category
                        customerOrderInformationCollection.isFrameType = false; //isFrameType: Collection element to decide whether the field is of frame type category
                        customerOrderInformationCollection.isInvalid = false; //isInvalid: Collection element to decide whether the value entered by User on UI is vallid/Invalid
                        if (value.apiName == COMPLETE_EYEWEAR_FIELD) {
                            customerOrderInformationCollection.fieldName = COMPLETE_EYEWEAR_FIELD;
                        } else if (value.apiName == LENS_ONLY_FIELD) {
                            customerOrderInformationCollection.fieldName = LENS_ONLY_FIELD;
                        } else if (value.apiName == LENS_ONLY_AND_FRAME_PROVIDED_FIELD) {
                            customerOrderInformationCollection.fieldName = LENS_ONLY_AND_FRAME_PROVIDED_FIELD;
                        }
                        //Bs-1415 Start
                        if (value.apiName === LENS_ONLY_AND_FRAME_PROVIDED_FIELD) {
                            if (lensOnlyAndFramesProvidedCountryCodeList.includes(this._countryCode) === false) {
                                parsedCustomerOrderInformationCollection.push(customerOrderInformationCollection);
                            }
                        } else {
                            parsedCustomerOrderInformationCollection.push(customerOrderInformationCollection);
                        }
                        //Bs-1415 End
                    }
                });

                this.frameTypeValuesCollection.picklistValues.forEach((frameValue) => {
                    const customerOrderInformationCollection = {};
                    customerOrderInformationCollection.label = frameValue.picklistValue; //label: Collection element to hold label that needs to be displayed on UI
                    customerOrderInformationCollection.value = ''; //value : Collection element to hold value that is entered by user on UI
                    customerOrderInformationCollection.isChecked = false; //isChecked : Collection element to indicate whether the value is selected by user from UI (Used for radio button type inputs)
                    customerOrderInformationCollection.isCustomerInput = false; //isCustomerInput : Collection element to indicate whether this is needed from user in form of input
                    customerOrderInformationCollection.isCustomerOutput = false; //isCustomerOutput : Collection element to indicate whether this is provided by user in form of output and these fields will be dispalyed on ready only screen
                    customerOrderInformationCollection.isOrderType = false; //isOrderType: Collection element to decide whether the field is of order type category
                    customerOrderInformationCollection.isFrameType = true; //isFrameType: Collection element to decide whether the field is of frame type category
                    customerOrderInformationCollection.isInvalid = false; //isInvalid: Collection element to decide whether the value entered by User on UI is vallid/Invalid
                    if (frameValue.apiName == OPTICAL_EYEWEAR_FIELD) {
                        customerOrderInformationCollection.fieldName = OPTICAL_EYEWEAR_FIELD;
                    } else if (frameValue.apiName == SUNGLASSES_FIELD) {
                        customerOrderInformationCollection.fieldName = SUNGLASSES_FIELD;
                    }
                    parsedCustomerOrderInformationCollection.push(customerOrderInformationCollection);
                });

                this._frameTypeHeaderLabel = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[3]; // Setting up frame type header section label
                this._customerInformationHeaderLabel = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[4]; // Setting up Customer information header section label
                this._orderInformationHeaderLabel = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[5]; // Setting up Order information header section label
                this._orderTypeHeaderLabel = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[6]; // Setting up order type header section label
                this._errorInstructionToEnterValue = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[10];
                this._errorInstructionToSelectValue = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[10];
                this._frameCategoryLabel = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[11];

                this.fireOperateLoader(false); // Firing event to stop the loader/spinner

                // If order information collection is preserved or user had already entered the values/data on UI then iterating over preserved collection and fetching the values from it
                if (this.preservedOrderInformationCollection != null && this.preservedOrderInformationCollection != undefined) {
                    let parsedCollection = JSON.parse(JSON.stringify(this.preservedOrderInformationCollection));
                    parsedCustomerOrderInformationCollection.forEach((orderInformation) => {
                        parsedCollection.forEach((parsedOrder) => {
                            if (orderInformation.fieldName == parsedOrder.fieldName) {
                                orderInformation.value = parsedOrder.value;
                                orderInformation.isChecked = parsedOrder.isChecked;
                                orderInformation.isOrderType = parsedOrder.isOrderType;
                            }
                        });
                    });
                    //BS-787 : Preserving Order and Frame type values
                    let orderInformationCollection = JSON.parse(JSON.stringify(parsedCustomerOrderInformationCollection));
                    for (var orderInformation in orderInformationCollection) {
                        if (
                            orderInformationCollection[orderInformation].isOrderType == true &&
                            orderInformationCollection[orderInformation].isChecked == true
                        ) {
                            for (var parsedOrderInformation in orderInformationCollection) {
                                if (orderInformationCollection[parsedOrderInformation].fieldName == ORDER_TYPE_FIELD) {
                                    orderInformationCollection[parsedOrderInformation].value = orderInformationCollection[orderInformation].label;
                                }
                            }
                        } else if (
                            orderInformationCollection[orderInformation].isFrameType == true &&
                            orderInformationCollection[orderInformation].isChecked == true
                        ) {
                            for (var parsedOrderInformation in orderInformationCollection) {
                                if (orderInformationCollection[parsedOrderInformation].fieldName == FRAME_TYPE_FIELD) {
                                    orderInformationCollection[parsedOrderInformation].value = orderInformationCollection[orderInformation].label;
                                }
                            }
                        }
                    }
                    parsedCustomerOrderInformationCollection = JSON.parse(JSON.stringify(orderInformationCollection));
                    //BS-787
                }

                //BS-997
                if (
                    (this.preservedOrderInformationCollection == null || this.preservedOrderInformationCollection == undefined) &&
                    this.lensConfiguratorCollection != null &&
                    this.lensConfiguratorCollection != undefined
                ) {
                    parsedCustomerOrderInformationCollection.forEach((orderInformation) => {
                        if (orderInformation.fieldName == CUSTOMER_NAME_FIELD) {
                            orderInformation.value = this.lensConfiguratorCollection.customerName;
                        }
                        if (orderInformation.fieldName == CLERK_FIELD) {
                            orderInformation.value = this.lensConfiguratorCollection.clerk;
                        }
                        if (orderInformation.fieldName == ORDER_TYPE_FIELD) {
                            this.orderTypeValues.picklistValues.forEach((value) => {
                                if (value.apiName == this.lensConfiguratorCollection.orderType) {
                                    orderInformation.value = value.picklistValue;
                                }
                            });
                        }
                        if (orderInformation.fieldName == FRAME_TYPE_FIELD) {
                            this.frameTypeValuesCollection.picklistValues.forEach((frameValue) => {
                                if (frameValue.apiName == this.lensConfiguratorCollection.frameType) {
                                    orderInformation.value = frameValue.picklistValue;
                                }
                            });
                        }
                        if (orderInformation.fieldName == this.lensConfiguratorCollection.orderType) {
                            orderInformation.isChecked = true;
                        }
                        if (this._isSourceRX == false && orderInformation.fieldName == this.lensConfiguratorCollection.frameType) {
                            orderInformation.isChecked = true;
                        }
                    });
                } else if (this.preservedOrderInformationCollection == null || this.preservedOrderInformationCollection == undefined) {
                    parsedCustomerOrderInformationCollection.forEach((orderInformation) => {
                        if (orderInformation.fieldName == ORDER_TYPE_FIELD) {
                            this.orderTypeValues.picklistValues.forEach((value) => {
                                if (value.apiName == COMPLETE_EYEWEAR_FIELD) {
                                    orderInformation.value = value.picklistValue;
                                }
                            });
                        }
                        if (this._isSourceRX == false && orderInformation.fieldName == FRAME_TYPE_FIELD) {
                            this.frameTypeValuesCollection.picklistValues.forEach((frameValue) => {
                                if (frameValue.apiName == OPTICAL_EYEWEAR_FIELD) {
                                    orderInformation.value = frameValue.picklistValue;
                                }
                            });
                        }
                        if (orderInformation.fieldName == COMPLETE_EYEWEAR_FIELD) {
                            orderInformation.isChecked = true;
                        }
                        if (this._isSourceRX == false && orderInformation.fieldName == OPTICAL_EYEWEAR_FIELD) {
                            orderInformation.isChecked = true;
                        }
                    });

                    //BS-1442
                    if (this.pageSource == PAGE_SOURCE_VS) {
                        localStorage.removeItem(FILTER_KEY_FOR_VS);
                        localStorage.removeItem(REMOVE_ALL); //BS-1442
                    }
                    //BS-1608
                    let key;
                    let categoryKey;
                    if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                        key = FILTER_KEY_FOR_RX;
                        categoryKey = SELECTED_RX_CATEGORY_KEY;
                    } else {
                        key = FILTER_KEY_FOR_VS;
                        categoryKey = SELECTED_VS_CATEGORY_KEY;
                    }
                    if (key != null && key != undefined) {
                        localStorage.removeItem(key);
                    }
                    if (categoryKey != null && categoryKey != undefined) {
                        localStorage.removeItem(categoryKey);
                    }
                    localStorage.removeItem(FILTER_KEY);
                } //BS-1887 added logic to show default order type and frame type
                this._customerInformationSummaryCollection = parsedCustomerOrderInformationCollection;
                this.showOrHideErrorMessage();
                if (
                    this._customerInformationSummaryCollection != null &&
                    this._customerInformationSummaryCollection != undefined &&
                    this._customerInformationSummaryCollection.length > 0
                ) {
                    this.fireSendLatestCustomerInformationSummaryCollection(this._customerInformationSummaryCollection); //Sending latest prepared customer information summary collection to 'c/b2b_visionSensation_RX_cotainer'
                }
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                this.fireOperateLoader(false); // Firing event to stop the loader/spinner
            });
    }

    /**
     * This method is used to set edit icon that is fetched from static resource 'B2B_StoreStyling'
     * BS-654
     * @return  rxIcon  :   icon for Edit
     */
    get editIcon() {
        let editIcon;
        editIcon = {
            icon: STORE_STYLING + '/icons/edit.png'
        };
        return editIcon;
    }

    /**
     * This variable hold the URL path of edit icon
     * BS-1213
     * @type {String}
     */
    _editIcon = STORE_STYLING + '/icons/pencil.svg';

    connectedCallback() {
        this.fireOperateLoader(true); // Firing event to start the loader/spinner
        this.setupComponentMode(this.orderReferenceComponentMode); //BS-788 setting order info ready only or edit only
        if (
            localStorage.getItem(KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX) != null &&
            localStorage.getItem(KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX) != undefined
        ) {
            localStorage.removeItem(KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX);
        }
        if (localStorage.getItem(KEY_FOR_USER_NOTE_ENTERED_FOR_RX) != null && localStorage.getItem(KEY_FOR_USER_NOTE_ENTERED_FOR_RX) != undefined) {
            localStorage.removeItem(KEY_FOR_USER_NOTE_ENTERED_FOR_RX);
        }
        if (
            localStorage.getItem(KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX) != null &&
            localStorage.getItem(KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX) != undefined
        ) {
            localStorage.removeItem(KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX);
        }
        //Checking the page source that passed from 'c/b2b_visionSensation_RX_cotainer' component
        if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
            this._isSourceRX = true; // If page source is RX, setting up sourceRX to true
            this._totalFieldsToCheck = 3; // If page source is RX, fields needs to be check : 3
        } else {
            this._isSourceRX = false; //If page source is not RX, setting up sourceRX to true
            this._totalFieldsToCheck = 4; // If page source is RX, fields needs to be check : 4
        }
        this.prepareCollection; //Setting up customer information summary collection from getter method: prepareCollection();
    }

    async getAccountDetails() {
        await getAccountDetail({ recordId: this.effectiveAccountId })
            .then((result) => {
                if (result !== undefined && result !== null) {
                    //Updated as part of BS-1415
                    this._countryCode = result.k_ARIS_Account_ID__c ? result.k_ARIS_Account_ID__c.substring(0, 4) : '';
                    if (this.selectedFrameId !== undefined && this.selectedFrameId !== null) {
                        this.getProductAvailability(this._countryCode);
                    }
                    //BS-1415 End
                }
            })
            .catch((error) => {});
    }

    async getProductAvailability(countryCode) {
        await getSelectedProductDetail({ recordId: this.selectedFrameId })
            .then((result) => {
                if (result !== undefined && result !== null) {
                    if (result.B2B_Availability_JSON__c !== undefined && result.B2B_Availability_JSON__c !== null) {
                        this._isDisabledProduct = checkProductAvailability(result.B2B_Availability_JSON__c, countryCode);
                        this.getOrderTypeValues();
                    }
                }
            })
            .catch((error) => {});
    }

    /**
     * This Method is used to handle event fired on click of edit icon by user on UI
     * BS-654
     *
     */
    handleOrderInformationEdit(event) {
        //BS-787 : If user has navigated from any other source such as PDP then on click of edit icon on order information redirecting user to 4th step instead of 1st step
        if (this.isSourceFromOutsideConfigurator != null && this.isSourceFromOutsideConfigurator != undefined && this.isSourceFromOutsideConfigurator == true) {
            this.fireUpdateProgressBar(4, true, false);
        } else if (
            this.isSourceFromOutsideConfigurator != null &&
            this.isSourceFromOutsideConfigurator != undefined &&
            this.isSourceFromOutsideConfigurator == false &&
            this._isReadOnly == true
        ) {
            this._isReadOnly = false;
            this.fireUpdateProgressBar(1, true, false);
        }
    }

    /**
     * This Method is used to handle event fired whenever user enters value in customer input fields
     * BS-654
     *
     */
    handleUserInput(event) {
        const field = event.target.dataset.field; // Field in which the user entered the value
        const value = event.target.value; // value entered by user on UI

        let orderInformationCollection = JSON.parse(JSON.stringify(this._customerInformationSummaryCollection));
        for (var input in orderInformationCollection) {
            //Iteration over the collection of customer information summary and setting up the entered value by user for that particuler field
            if (orderInformationCollection[input].label == field) {
                orderInformationCollection[input].value = value;
            }
            this.showOrHideErrorMessage();
        }

        this._customerInformationSummaryCollection = orderInformationCollection;
        this.fireSendLatestCustomerInformationSummaryCollection(this._customerInformationSummaryCollection); //Sending latest updated customer information summary collection to 'c/b2b_visionSensation_RX_cotainer'
    }

    /**
     * This Method is used to handle event fired whenever user selects values present under order type/ frame type section
     * BS-654
     *
     */
    handleSelection(event) {
        const field = event.target.dataset.field; // Field under which the user selected the value
        const value = event.target.value; //value selected by user on UI

        let orderInformationCollection = JSON.parse(JSON.stringify(this._customerInformationSummaryCollection));

        for (var input in orderInformationCollection) {
            // Iterating over the customer information summary collection and setting up isChecked property for that particuler field
            let typeValidity;
            if (field == this._orderTypeHeaderLabel) {
                typeValidity = orderInformationCollection[input].isOrderType;
            } else if (field == this._frameTypeHeaderLabel) {
                typeValidity = orderInformationCollection[input].isFrameType;
            }
            if (typeValidity == true && orderInformationCollection[input].label == value) {
                orderInformationCollection[input].isChecked = true; //setting up isChecked property for that particuler field
            } else if (typeValidity == true && orderInformationCollection[input].label != value) {
                orderInformationCollection[input].isChecked = false;
            }
        }

        //BS-1608
        let key;
        let categoryKey;
        if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
            key = FILTER_KEY_FOR_RX;
            categoryKey = SELECTED_RX_CATEGORY_KEY;
        } else {
            key = FILTER_KEY_FOR_VS;
            categoryKey = SELECTED_VS_CATEGORY_KEY;
        }
        //BS-1608

        //BS-787 Iterating over the orderInformationCollection and updating the selected order type and frame type
        for (var orderInformation in orderInformationCollection) {
            if (orderInformationCollection[orderInformation].isOrderType == true && orderInformationCollection[orderInformation].isChecked == true) {
                for (var parsedOrderInformation in orderInformationCollection) {
                    if (orderInformationCollection[parsedOrderInformation].fieldName == ORDER_TYPE_FIELD) {
                        orderInformationCollection[parsedOrderInformation].value = orderInformationCollection[orderInformation].fieldName;
                        //BS-1608 : Resetting the selected filters on change of order type - Start
                        if (key != null && key != undefined) {
                            localStorage.removeItem(key);
                        }
                        if (categoryKey != null && categoryKey != undefined) {
                            localStorage.removeItem(categoryKey);
                        }
                        localStorage.removeItem(FILTER_KEY);
                    }
                    if (orderInformationCollection[parsedOrderInformation].fieldName == FRAME_TYPE_FIELD) {
                        orderInformationCollection[parsedOrderInformation].value = orderInformationCollection[orderInformation].fieldName;
                        //BS-1608 : Resetting the selected filters on change of Frame type - Start
                        if (key != null && key != undefined) {
                            localStorage.removeItem(key);
                        }
                        if (categoryKey != null && categoryKey != undefined) {
                            localStorage.removeItem(categoryKey);
                        }
                        localStorage.removeItem(FILTER_KEY);
                        //BS-1608 : Resetting the selected filters on change of Frame type - End
                    }
                }
            }
        }
        //BS-787
        //BS-1442
        if (this.pageSource == PAGE_SOURCE_VS) {
            localStorage.removeItem(FILTER_KEY_FOR_VS);
            localStorage.removeItem(REMOVE_ALL); //BS-1442
        }

        this._customerInformationSummaryCollection = orderInformationCollection;
        this.fireSendLatestCustomerInformationSummaryCollection(this._customerInformationSummaryCollection);
        if (
            this.lensConfiguratorCollection &&
            (this.lensConfiguratorCollection.orderType == this.orderTypeValues.picklistValues[0].picklistValue ||
                this.lensConfiguratorCollection.orderType == this.orderTypeValues.picklistValues[0].apiName) &&
            value !== this.orderTypeValues.picklistValues[0].picklistValue
        ) {
            this._lensConfigResetWarningPopup = true;
        } else {
            this._lensConfigResetWarningPopup = false;
        }
        this.dispatchEvent(
            new CustomEvent(UPDATE_LENS_CONFIGURATOR_DATA, {
                detail: {
                    resetLensConfigurator: this._lensConfigResetWarningPopup
                }
            })
        ); //Sending latest updated customer information summary collection to 'c/b2b_visionSensation_RX_cotainer'
    }

    /**
     * This method used to fire event 'orderinformationavailable' to indicate parent component 'c/c/b2b_visionSensation_RX_cotainer' that,
     *          customer information summary collection is prepared and supply the collection
     * BS-654
     * @param customerInformationCollection : Collection of customer information summary
     */
    fireSendLatestCustomerInformationSummaryCollection(customerInformationCollection) {
        if (customerInformationCollection != null && customerInformationCollection != undefined) {
            this.dispatchEvent(
                new CustomEvent(ORDER_INFORMATION_AVAILABLE, {
                    bubbles: true,
                    composed: true,
                    cancelable: false,
                    detail: {
                        customerInformationSummaryCollection: customerInformationCollection,
                        orderTypeValues: this.orderTypeValues,
                        frameTypeValuesCollection: this.frameTypeValuesCollection
                    }
                })
            );
        }
    }

    /**
     * This api method is invoked by parent 'c/b2b_visionSensation_RX_cotainer'
     * This method is used to setup component mode
     * Below Mentioned are the valid scenarios:
     *      1. Component mode   : 1. Read-Only
     *                            2. Edit
     * BS-654
     * @param   componentMode   : Mode of compoenent that needs to be set
     */
    @api
    setupComponentMode(componentMode) {
        if (componentMode != null && componentMode != undefined) {
            if (componentMode == EDIT_MODE) {
                this._isReadOnly = false; //If component mode is Edit mode, setting up property: _isReadOnly to false
            } else if (componentMode == READ_ONLY_MODE) {
                this._isReadOnly = true; //If component mode is Read only mode, setting up property: _isReadOnly to true
            }
        }
    }

    /**
     * This api method is invoked by parent 'c/b2b_visionSensation_RX_cotainer'
     * This method is used to perform validity check by checking the values in input felds
     * BS-800
     * @return   isValid  : whether the values entered by user are valid
     */
    @api
    performValidityCheck() {
        let customerInformationSummaryCollection = JSON.parse(JSON.stringify(this._customerInformationSummaryCollection));
        let checkpointsPassed = 0;
        let isValid = false;
        let orderTypeisValid = false;
        let frameTypeisValid = false;
        let selectedOrderType; //BS-788
        let selectedFrameType; //BS-788
        for (var input in customerInformationSummaryCollection) {
            // Iterating over the collection and checking whether the values is entered by user in input field
            if (customerInformationSummaryCollection[input].isCustomerInput == true && customerInformationSummaryCollection[input].value != EMPTY) {
                // If the input fields is not empty, i.e., value is present in the input field then check point is pass
                checkpointsPassed++; // Incrementing the checkpointsPassed
                customerInformationSummaryCollection[input].isInvalid = false; // Setting up collection element isInvalid to false as checkpoint is pass
                customerInformationSummaryCollection[input].applicableStyling = REGULAR_CONDITION_STYLING; // Setting up collection element applicableStyling to regular styling
            } else if (customerInformationSummaryCollection[input].isCustomerInput == true && customerInformationSummaryCollection[input].value == EMPTY) {
                // If the input fields is empty, i.e., value is not present in the input field then check point fail
                if (customerInformationSummaryCollection[input].label == B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[0]) {
                    if (customerInformationSummaryCollection[input].value.length > 50) {
                        customerInformationSummaryCollection[input].isInvalid = false; // Setting up collection element isInvalid to true as checkpoint is pass for that particuler field
                    } else {
                        customerInformationSummaryCollection[input].isInvalid = true; // Setting up collection element isInvalid to true as checkpoint is pass for that particuler field
                    }
                    customerInformationSummaryCollection[input].applicableStyling = ERROR_CONDITION_STYLING; // Setting up collection element applicableStyling to error condition styling
                }
                if (customerInformationSummaryCollection[input].label == B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[1]) {
                    if (customerInformationSummaryCollection[input].value.length > 50) {
                        customerInformationSummaryCollection[input].isInvalid = false; // Setting up collection element isInvalid to true as checkpoint is pass for that particuler field
                    } else {
                        customerInformationSummaryCollection[input].isInvalid = true; // Setting up collection element isInvalid to true as checkpoint is pass for that particuler field
                    }
                    customerInformationSummaryCollection[input].applicableStyling = ERROR_CONDITION_STYLING; // Setting up collection element applicableStyling to error condition styling
                }
            }
            if (customerInformationSummaryCollection[input].isOrderType == true && customerInformationSummaryCollection[input].isChecked == true) {
                // If the user selects any value present under Order Type Section, the checkpoint is pass
                checkpointsPassed++; // Incrementing the checkpoint
                orderTypeisValid = true; //As user selected the value under order type section, orderTypeisValid is set to true
                selectedOrderType = customerInformationSummaryCollection[input].label; //BS-788 store selected order type
            }
            if (customerInformationSummaryCollection[input].isFrameType == true && customerInformationSummaryCollection[input].isChecked == true) {
                // If the user selects any value present under frame Type Section, the checkpoint is pass
                checkpointsPassed++; // Incrementing the checkpoint
                frameTypeisValid = true; //As user selected the value under frame type section, frameTypeisValid is set to true
                selectedFrameType = customerInformationSummaryCollection[input].label; //BS-788 store selected frame type
            }
        } //end for

        //BS-788 assignment of values to order type and frame type
        for (var input in customerInformationSummaryCollection) {
            if (customerInformationSummaryCollection[input].isOnFrameDetails == true && customerInformationSummaryCollection[input].isFrameTypeLabel == true) {
                customerInformationSummaryCollection[input].value = selectedFrameType;
            } else if (
                customerInformationSummaryCollection[input].isOnFrameDetails == true &&
                customerInformationSummaryCollection[input].isOrderTypeLabel == true
            ) {
                customerInformationSummaryCollection[input].value = selectedOrderType;
            }
        } //end for

        if (orderTypeisValid == false) {
            this._isOrderTypeInValid = true; // If orderTypeisValid is false, then settig up _isOrderTypeInValid to true
        } else if (orderTypeisValid == true) {
            this._isOrderTypeInValid = false; // If orderTypeisValid is true, then settig up _isOrderTypeInValid to false
        }

        if (frameTypeisValid == false) {
            this._isFrameTypeInValid = true; // If frameTypeisValid is false, then settig up _isFrameTypeInValid to true
        } else if (frameTypeisValid == true) {
            this._isFrameTypeInValid = false; // If frameTypeisValid is true, then settig up _isFrameTypeInValid to false
        }

        if (this._isSourceRX == true && checkpointsPassed == this._totalFieldsToCheck) {
            isValid = true; // If checkpoints total matches with the variable: _totalFieldsToCheck then, setting isValid to true
        } else if (this._isSourceRX == false && checkpointsPassed == this._totalFieldsToCheck) {
            isValid = true; // If checkpoints total does not matches with the variable: _totalFieldsToCheck then, setting isValid to false
        }

        this._customerInformationSummaryCollection = customerInformationSummaryCollection;
        if (isValid != null && isValid != undefined && isValid == true && this._readOnlyOrderInformation == true) {
            this.fireSendLatestCustomerInformationSummaryCollection(this._customerInformationSummaryCollection);
        }
        return isValid;
    }
    //BS-800 End

    /**
     * This method is use to fire event: 'updateprogressbar' that updates the progress bar step of 'c/c/b2b_progressBar_Component' according to stepNumber provided
     * BS-654
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
     * This method is use to fire event: 'updateprogressbar' that updates the progress bar step of 'c/c/b2b_progressBar_Component' according to stepNumber provided
     * BS-654
     * @return   stepNumber     : Step Number that needs to be set as current active step (Number)
     *           activeStatus   : Step active status to determine whether above step is set to be active - (Boolean)
     *           successStatus  : Step success status to determine whether above step is set to be completed - (Boolean)
     */
    fireUpdateProgressBar(stepNumber, activeStatus, successStatus) {
        if (stepNumber != null && stepNumber != undefined) {
            this.dispatchEvent(
                new CustomEvent(UPDATE_PROGRESS_BAR, {
                    bubbles: true,
                    composed: true,
                    cancelable: false,
                    detail: {
                        stepNumberToJump: stepNumber,
                        activeStatus: activeStatus,
                        successStatus: successStatus
                    }
                })
            );
        }
    }

    /**
     * Added as Part of BS-789
     * This method opens the inline edit mode of the order information on click of the pencil icon
     * and preserves the previously filled values.
     */
    handleOrderInformationInlineEdit(event) {
        let orderInformationCollection = JSON.parse(JSON.stringify(this._customerInformationSummaryCollection));
        for (var input in orderInformationCollection) {
            //Iteration over the collection of customer information summary and setting up the entered value by user for that particuler field
            if (orderInformationCollection[input].fieldName == CUSTOMER_NAME_FIELD) {
                this._previousCustomerNameValue = orderInformationCollection[input].value;
            }
            if (orderInformationCollection[input].fieldName == CLERK_FIELD) {
                this._previousClerkValue = orderInformationCollection[input].value;
            }
        }
        if (this._readOnlyOrderInformation == true) {
            this._readOnlyOrderInformation = false;
        }
    }

    /**
     * Added as Part of BS-789
     * This method handles the on change event of the input boxes in the inline edit section.
     */
    handleUserInputInlineChange(event) {
        const field = event.target.dataset.field; // Field in which the user entered the value
        const value = event.target.value; // value entered by user on UI
        let orderInformationCollection = JSON.parse(JSON.stringify(this._customerInformationSummaryCollection));
        for (var input in orderInformationCollection) {
            //Iteration over the collection of customer information summary and setting up the entered value by user for that particuler field
            if (orderInformationCollection[input].label == field) {
                orderInformationCollection[input].value = value;
            }

            if (field == CUSTOMER_NAME_FIELD || field == CUSTOMER_NAME_FIELD_GERMAN) {
                this._updatedCustomerName = value;
            }
            if (field == CLERK_FIELD || field == CLERK_FIELD_GERMAN) {
                this._updatedClerk = value;
            }
        }
        this._customerInformationSummaryCollection = orderInformationCollection;
        this.showOrHideErrorMessage();
    }

    /**
     * Added as Part of BS-789
     * This method updates the record of the lens configurator with the latest customer name and clerk.
     */
    async updateOrderInformationData(customerInformationData) {
        await updateLensConfiguratorData({
            lensConfiguratorId: this.lensConfiguratorCollection.lensConfiguratorID,
            fieldNameVsLensConfiguratorDataMap: customerInformationData,
            language: LANG
        })
            .then((data) => {})
            .catch((error) => {
                console.error(error);
            });
    } //end update

    /**
     * Added as Part of BS-789
     * This method handles the onclick event of the inline save button after validating the input values
     * and also updates the _customerInformationSummaryCollection.
     */
    handleInlineSaveClick(event) {
        let valid = this.performValidityCheck();
        if (this._readOnlyOrderInformation == false && valid === true) {
            if (this.lensConfiguratorCollection != undefined && this.lensConfiguratorCollection != null && this.lensConfiguratorCollection.lensConfiguratorID) {
                let updatedCustomerInformation = {
                    customerName:
                        this._updatedCustomerName != null || this._updatedCustomerName != undefined
                            ? this._updatedCustomerName
                            : this._previousCustomerNameValue,
                    clerk: this._updatedClerk != null || this._updatedClerk != undefined ? this._updatedClerk : this._previousClerkValue
                };
                this.updateOrderInformationData(updatedCustomerInformation);
            }
            this.fireSendLatestCustomerInformationSummaryCollection(this._customerInformationSummaryCollection);
            this._readOnlyOrderInformation = true;
        }
    }

    /**
     * Added as Part of BS-789
     * This method handles the onclick event of the inline cancel button
     * and opens the order information section in read only mode
     * and also updates the _customerInformationSummaryCollection with previous filled values.
     */
    handleInlineCancelClick(event) {
        let orderInformationCollection = JSON.parse(JSON.stringify(this._customerInformationSummaryCollection));
        for (var input in orderInformationCollection) {
            //Iteration over the collection of customer information summary and setting up the entered value by user for that particuler field
            if (orderInformationCollection[input].fieldName == CUSTOMER_NAME_FIELD) {
                orderInformationCollection[input].value = this._previousCustomerNameValue;
            }
            if (orderInformationCollection[input].fieldName == CLERK_FIELD) {
                orderInformationCollection[input].value = this._previousClerkValue;
            }
        }
        this._customerInformationSummaryCollection = orderInformationCollection;
        if (this._readOnlyOrderInformation == false) {
            this._readOnlyOrderInformation = true;
        }
    }

    /**
     * BS-1213
     * This method redirect the user to home page
     */
    handleRedirectionToHomePage(event) {
        this[NavigationMixin.Navigate]({
            type: STANDARD_NAMED_PAGE,
            attributes: {
                pageName: HOME_PAGE
            }
        });
    }

    /**
     * BS-1213
     * This method closes the warning popup
     */
    closePopup() {
        this.openCancelWarningPopup = false;
        if (this._lensConfigResetWarningPopup == true) {
            this._lensConfigResetWarningPopup = false;
        }
    }
    @api
    showOrHideErrorMessage() {
        let orderInformationCollection = JSON.parse(JSON.stringify(this._customerInformationSummaryCollection));
        this._isCharacterLimitExceeded = false;
        for (var input in orderInformationCollection) {
            if (orderInformationCollection[input].label == B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[0]) {
                if (orderInformationCollection[input].value.length > 50) {
                    orderInformationCollection[input].applicableTextboxStyling = TEXTAREA_ERROR_STYLE;
                    orderInformationCollection[input].showMaxCharError = true;
                    this._isCharacterLimitExceeded = true;
                } else {
                    orderInformationCollection[input].applicableTextboxStyling = TEXTAREA_STYLE;
                    orderInformationCollection[input].showMaxCharError = false;
                    this._isCharacterLimitExceeded = this._isCharacterLimitExceeded ? this._isCharacterLimitExceeded : false;
                }
            }
            if (orderInformationCollection[input].label == B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[1]) {
                if (orderInformationCollection[input].value.length > 50) {
                    orderInformationCollection[input].applicableTextboxStyling = TEXTAREA_ERROR_STYLE;
                    orderInformationCollection[input].showMaxCharError = true;
                    this._isCharacterLimitExceeded = true;
                } else {
                    orderInformationCollection[input].applicableTextboxStyling = TEXTAREA_STYLE;
                    orderInformationCollection[input].showMaxCharError = false;
                    this._isCharacterLimitExceeded = this._isCharacterLimitExceeded ? this._isCharacterLimitExceeded : false;
                }
            }
        }
        this.showCharLimitError();
        this._customerInformationSummaryCollection = orderInformationCollection;
    }
    showCharLimitError() {
        this.dispatchEvent(
            new CustomEvent('showcharlimitexception', {
                detail: this._isCharacterLimitExceeded
            })
        );
    }
}
