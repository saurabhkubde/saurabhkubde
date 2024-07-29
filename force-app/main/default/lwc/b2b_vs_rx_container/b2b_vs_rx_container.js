import { api, track, wire, LightningElement } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { getRecord } from 'lightning/uiRecordApi';
import HIDE_PRICES_FIELD from '@salesforce/schema/Account.B2B_Hide_Prices__c';

import B2B_SCHNEIDER_CALLOUT_BEHAVE_CODES from '@salesforce/label/c.B2B_SCHNEIDER_CALLOUT_BEHAVE_CODES'; //BS-1034
import B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE from '@salesforce/label/c.B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE'; //BS-1248
import VISION_ZONE_CALLOUT_ERROR_MESSAGE from '@salesforce/label/c.VISION_ZONE_CALLOUT_ERROR_MESSAGE'; //BS-1914
import B2B_VS_RX_APPLICABLE_ACCOUNTS from '@salesforce/label/c.B2B_VS_RX_APPLICABLE_ACCOUNTS'; //BS-1582
import updateCurrentStepNumber from '@salesforce/apex/B2B_VisionSensation_RX_Controller.updateCurrentStepNumber'; //BS-1775
import B2B_CONFIRM_VS_RX_CONFIGURATOR_EXIT from '@salesforce/label/c.B2B_CONFIRM_VS_RX_CONFIGURATOR_EXIT'; //BS-2185
import B2B_ORDER_FIELDS_CHARACTER_LIMIT_ERROR_MESSAGE from '@salesforce/label/c.B2B_ORDER_FIELDS_CHARACTER_LIMIT_ERROR_MESSAGE'; //BS-2185
import {
    handlePrescriptionValueUpdateIntoConfigurator,
    handleCenteringDataUpdateIntoConfigurator,
    resetLensConfiguratorCollectionExceptPrescription,
    handleRxSolutionDataUpdateIntoConfigurator,
    handleLensConfiguratorByLensCollectionUpdateData
} from 'c/b2b_vs_rx_utils'; //727

import {
    operateProgressBarCollection,
    setComponentVisibility,
    createLabels,
    handleCancelButtonClickUtility,
    handleProgressBarChange,
    setAddToCartStorage,
    setLensConfiguratorCollection,
    checkFromMyVSRXPrescription,
    updateShapeSelectionDataUpdate
} from 'c/b2b_vs_rx_containerUtility';

import { showToastMessage } from 'c/b2b_cartUtils'; //BS-898

//728 - Start
import validateAddToCart from '@salesforce/apex/B2B_VisionSensation_RX_Controller.validateAddToCart';
import addToCartForVSRX from '@salesforce/apex/B2B_VisionSensation_RX_Controller.addToCartForVSRX';
import createCartItemsForVSRX from '@salesforce/apex/B2B_VisionSensation_RX_Controller.createCartItemsForVSRX';
import resetLensConfiguratorDataExceptPrescription from '@salesforce/apex/B2B_VisionSensation_RX_Controller.resetLensConfiguratorDataExceptPrescription';
import updateLensConfiguratorRecord from '@salesforce/apex/B2B_VisionSensation_RX_Controller.updateLensConfiguratorRecord';
import updateLensConfiguratorRecordForCartItem from '@salesforce/apex/B2B_VisionSensation_RX_Controller.updateLensConfiguratorRecordForCartItem'; //BS-728
import resetCartForCurrencyMismatch from '@salesforce/apex/B2B_VisionSensation_RX_Controller.resetCartForCurrencyMismatch'; //BS-1245
import saveOrderInformationData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.saveOrderInformationData';
import clearLensConfiguratorData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.clearLensConfiguratorData'; //BS-1798
import communityId from '@salesforce/community/Id';
import LANG from '@salesforce/i18n/lang';

const CART_CHANGED_EVT = 'cartchanged';
const APPLICABLE_QUANTITY = '1';
//728 - End

// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-655

import RESPONSE_MESSAGE from '@salesforce/label/c.B2B_Something_Went_Wrong'; //BS-898

const NEXT_ACTION = 'Next'; //BS-655
const BACK_ACTION = 'Back'; //BS-655
const SAVE_NEXT_ACTION = 'SaveAndNext'; //BS-788
const PROGRESS_BAR_COMPONENT = 'c-b2b_progress-bar-component'; //BS-655
const ORDER_REFERENCE_COMPONENT = 'c-b2b_vs_rx_order_reference_component'; //BS-654
const PAGE_SOURCE_VS = 'VS'; //BS-655
const PAGE_SOURCE_RX = 'RX'; //BS-655
const CATEGORY_FRAMES = 'Frames';
const OPTICAL_EYEWEAR_CATEGORY = 'Optical Eyewear'; //BS-762
const LENS_ONLY = 'Lens Only'; //Bs-1093

const VS_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE = 'orderInformationSummaryCollectionForVS'; //BS-762
const RX_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE = 'orderInformationSummaryCollectionForRX'; //BS-762

const VS_CURRENT_ACTIVE_STEP_KEY_FOR_LOCAL_STORAGE = '_currentActiveStepNumberCollectionForVS'; // BS-762
const RX_CURRENT_ACTIVE_STEP_KEY_FOR_LOCAL_STORAGE = '_currentActiveStepNumberCollectionForRX'; // BS-762
const NAVIGATION_FROM_HOME_PAGE = 'source';
const fields = [HIDE_PRICES_FIELD];
const FILTER_KEY_FOR_VS = 'selectedFiltersForVS'; // BS-762
const FILTER_KEY_FOR_RX = 'SelectedFiltersForRX'; // BS-762
const SELECTED_VS_CATEGORY_KEY = 'selectedVSCategory'; //BS-762
const SELECTED_RX_CATEGORY_KEY = 'selectedRXCategory'; //BS-762
const SELECTED_FRAME_VS = 'SelectedFrameVS'; //BS-709
const SELECTED_FRAME_RX = 'SelectedFrameRX'; //BS-709
const LOCAL_PRODUCT_DATA_KEY_VS = '_productDataVS'; //BS-788
const LOCAL_PRODUCT_DATA_KEY_RX = '_productDataRX'; //BS-788
const LOCAL_LENS_CONFIGURATOR_DATA_KEY_VS = 'lensConfiguratorCollectionVS'; //BS-724
const LOCAL_LENS_CONFIGURATOR_DATA_KEY_RX = 'lensConfiguratorCollectionRX'; //BS-724
const PRESCRIPTION_VALUE_COMPONENT = 'c-b2b_vsrx-prescription-value';
const CENTERING_DATA_COMPONENT = 'c-b2b_vsrx-centering-data';
const RX_SOLUTION_COMPONENT = 'c-b2b_rx_solution'; // BS-1051
const CUSTOMER_NAME = 'End-Consumer/Reference';
const CLERK = 'Order Remark';
const NAVIGATION_FROM_PDP_KEY = 'customerInformationSummaryCollectionFromPDP'; //BS-787

const NAVIGATION_FROM_MY_VS_RX_KEY = 'lensConfiguratorCollection'; //BS-997
const STANDARD_RECORD_PAGE = 'standard__recordPage'; //BS-787
const PAGE_MODE_VIEW = 'view'; //BS-787
const IS_FROM_PDP_KEY_FOR_VS = 'fromPDPforVS'; //BS-787
const IS_FROM_PDP_KEY_FOR_RX = 'fromPDPforRX'; //BS-787

const BOTH_EYE_SIDE = 'right and left lens side';
const EYE_SIDE_LEFT = 'Left Lens';
const EYE_SIDE_RIGHT = 'Right Lens';

//728
const ORDER_TYPE_COMPLETE_EYEWEAR = 'Complete Eyewear'; // BS-728
const IN_CART_STATUS = 'In Cart'; // BS-728
//728

const ERROR_TOAST_VARIENT = 'error'; //BS-898
const TOAST_MODE = 'dismissable'; //BS-898

const CALCULATE_LENS_COMPONENT = 'c-b2b_vs_rx_calculate_lens_component'; //BS-727
const LENS_CALCULATION_KEY_FOR_VS = 'lensCalculationKeyForVS'; //BS-727
const LENS_CALCULATION_KEY_FOR_RX = 'lensCalculationKeyForRX'; //BS-727
const FROM_VS_RX_PAGE = 'fromVsRxPage';

const ADD_TO_CART_COMPONENT = 'c-b2b_vs_rx_add_to_cart_component'; //BS-1034
const FALSE_VALUE = 'false'; //BS-1248
const SHAPE_SELECTION_SCREEN = 'c-b2b_vs_shape_selection_component';

//BS-1582
const STANDARD_NAMED_PAGE = 'standard__namedPage';
const VS_UNDERCONSTRUCTION_PAGE = 'vsrxsilhouette__c';
const RX_UNDERCONSTRUCTION_PAGE = 'vsrxevileye__c';
const ACCESS_TO_ALL_IDENTIFIER = '*';
const PRESCRIPTION_DATA = 'fromContainer'; //Added as part of BS-1443
const KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_VS = 'selectedSpecialHandlingOptionForVS';
const KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX = 'selectedSpecialHandlingOptionForRX';
const KEY_FOR_USER_NOTE_ENTERED_FOR_VS = 'userNoteForVS';
const KEY_FOR_USER_NOTE_ENTERED_FOR_RX = 'userNoteForRX';
const KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_VS = 'customerServicePreferenceForVS';
const KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX = 'customerServicePreferenceForRX';
const ORDER_OR_FRAME_TYPE_CHANGE_TRIGGERING_EVENT = 'orderOrFrameTypeChange'; //BS-1798
const FRAME_CHANGE_TRIGGERING_EVENT = 'frameChange'; //BS-1798
const LANGUAGE_CHANGED_VARIABLE = 'languageChanged'; //BS-2185
const SIZE_SHAPE_CHANGED_VARIABLE = 'sizeShapeModified'; //BS-2185
const CLEAR_ALL_FILTER = 'clearAllFilter'; //BS-2185

export default class B2b_vs_rx_container extends NavigationMixin(LightningElement) {
    _showAddToCartModel = false;
    _addToCartSuccessfull;
    _addToCartFailed;
    _parentCartId;
    _userInputForNotesField;
    _userInputForSpecialHandlingField;
    _customerServicePrefernceChoice = false;
    _selectedFrameId;
    productsAddedToCart = false; //BS-2185
    cancelVSConfiguration = false; //BS-2185
    get successIcon() {
        return STORE_STYLING + '/icons/success.svg';
    }

    get errorIcon() {
        return STORE_STYLING + '/icons/close.svg';
    }

    //728
    @track
    _isLoading = false;

    //655:Collection having progress bar steps collection provided by 'b2b_progressBarComponent'
    @track
    _progressBarStepsCollection = [];

    //BS-655:Collection to hold current active step details
    @track
    _currentActiveStep = [];

    //BS-788:Collection to hold product data details
    @track
    _productData;

    _frameType;
    _model;

    //BS-788:Collection to hold lens configurator details
    @track
    lensConfiguratorData;

    //BS-724:Collection to hold RX Solution data
    @track
    selectedRXSolutionData;

    //BS-788:Collection to hold lens configurator details
    @track
    _insertedLensConfiguratorId;

    //BS-788:Collection to hold input lens configurator details
    @track
    lensConfiguratorCollection;

    //BS-654:ariable that indicates whether the progress bar steps are loaded from backend
    @track
    _progressBarStepsLoaded = false;

    //Property indicating source of Page (VS/RX)
    @api
    pageSource;

    //BS-655:Variable to indicate whether the source is VS
    _isSourceVS = false;

    // BS-655:Variable to indicate whether the source is RX
    _isSourceRX = false;

    // BS-654:Collection of customer information summary obtained from 'c/c/b2b_vs_order_reference_component'
    @track
    _orderInformationSummaryCollection;

    //BS-708:Variable to store selected order type value by user on UI
    _selectedOrderType;

    //BS-708:Collection to store selected frame type value by user on UI
    _selectedFrameTypeCollection = {};

    //BS-708:Variable to store account Id of currently logged in user
    _effectiveAccountId;

    //BS-708:Variable to store accound Id.
    @api
    accountId;

    /**
     * Variable to store current url path
     * BS-708
     * @type {String}
     */
    //BS-708:Variable to store current url path
    _urlPath;

    //BS-708:Collection for order information feched from local storage
    @track
    _preservedOrderInformationCollection;

    //BS-708:Variable to indicate whether initial loading is completed
    @track
    _isInitialLoadComplete = false;

    //BS-708:Flag to indicate whether current active step is fetched from local storage
    @track
    _isCurrentActiveStepFetchedFromLocalStorage = false;

    //BS-708:Variable to hold value of current active step number
    @track
    _currentActiveStepNumber;

    @track
    _previousOrderType;
    @track
    _previousClerk;
    @track
    _previousCustomerName;

    /**
     * This variable is used to indicate whether user has navigated from PDP page by clicking RX Glazing button
     * BS-787
     * @type {Boolean}
     */
    _isFromPDPPage = false;

    //BS-787:This variable is used to indicate whether order information selection section to be shown in edit mode
    @track
    orderTypeSelectionEditModeForPDPSource = false;

    /**
     * Variable used to indicate whether the user is navigated from My VS-RX page
     * BS-997
     *
     * @type {Boolean}
     */
    _isNavigatedFromMyVSRX = false;

    //BS-1244
    fromMyVSRX = false;
    _resetLensConfigurator = false;

    /* BS-1034:Gets the effective account - if any - of the user viewing the product. */
    _checkAndAddToCartDisabled = false;

    @track
    componentVisibilityObj;

    @track
    labelObject;

    _isPreviewAndNext = false; //BS-1775

    //BS-1582 : This variable is use to control visibility of VS-RX configurator on UI for permitted accounts
    _isVSRXApplicable = false;

    _isLensConfiguratorResetComplete = false; //BS-1798

    _isSchneiderCalloutFailed = false;
    _isCharacterLimitExceeded = false;

    @api
    get effectiveAccountId() {
        return this._effectiveAccountId;
    }
    _runBeforeUnloadEvent = true; //BS-2185
    _currentPageURL; //BS-2185

    /**
     * Sets the effective account - if any - of the user viewing the product
     * and fetches updated cart information
     */
    set effectiveAccountId(newId) {
        this._effectiveAccountId = newId;
        if (newId && this.term) {
            this.triggerGetSortRules();
        }
    }

    get resolvedEffectiveAccountId() {
        const effectiveAcocuntId = this.effectiveAccountId || '';
        let resolved = null;

        if (effectiveAcocuntId.length > 0 && effectiveAcocuntId !== '000000000000000') {
            resolved = effectiveAcocuntId;
        }
        return resolved;
    }

    /**
     * This method is used to set VS icon that is fetched from static resource 'B2B_StoreStyling'
     * BS-655
     * @return  vsIcon  :   icon of VS
     */
    get vsIcon() {
        let vsIcon;
        vsIcon = {
            icon: STORE_STYLING + '/icons/VS-logo.png'
        };
        return vsIcon;
    }

    /**
     * This method is used to set RX icon that is fetched from static resource 'B2B_StoreStyling'
     * BS-655
     * @return  rxIcon  :   icon of RX
     */
    get rxIcon() {
        let rxIcon;
        rxIcon = {
            icon: STORE_STYLING + '/icons/RX-logo.png'
        };
        return rxIcon;
    }

    /**
     * This wire method is use to fetch account fields through effective account id of currently logged in user
     * BS-655
     */
    @wire(getRecord, { recordId: '$effectiveAccountId', fields })
    account;

    /**
     * This wire method is use to fetch current page reference
     * This method also contains the logic of fetching the data from local storage
     * BS-762
     */
    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        try {
            // Starting the loader
            this._isLoading = true;
            this._urlPath = pageRef;

            // Checking if url state contains parameters
            if (this._urlPath != null && this._urlPath != undefined && this._urlPath.state != null && this._urlPath.state != undefined && this._urlPath.state) {
                let stateAttributes = Object.keys(this._urlPath.state);

                // If user is navigated from home page then removing extra url parameters and removing Order Information collection and current active step collection from local storage
                if (stateAttributes != null && stateAttributes != undefined && stateAttributes.includes(NAVIGATION_FROM_HOME_PAGE)) {
                    this._isNavigatedFromMyVSRX = false; //BS-997
                    let key;
                    let categoryKey;
                    let orderInformationSummaryKey;
                    let currentActiveStepKey;
                    let currentProductData;
                    let selectedFrame;
                    let lensConfiguratorCollection;
                    let fromPDPIdentificationKey; //BS-787
                    let lensCalculationKey; //BS-727
                    let applicableKeyForSpecialHandlingOption; //BS-1471
                    let applicableKeyForCustomerServicePreference;
                    let applicableKeyForUserNote;

                    // If current page source is VS then clearing of local storage that are having VS related parameters
                    if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
                        key = FILTER_KEY_FOR_VS;
                        categoryKey = SELECTED_VS_CATEGORY_KEY;
                        orderInformationSummaryKey = VS_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE;
                        currentActiveStepKey = VS_CURRENT_ACTIVE_STEP_KEY_FOR_LOCAL_STORAGE;
                        currentProductData = LOCAL_PRODUCT_DATA_KEY_VS;
                        selectedFrame = SELECTED_FRAME_VS;
                        lensConfiguratorCollection = LOCAL_LENS_CONFIGURATOR_DATA_KEY_VS;
                        fromPDPIdentificationKey = IS_FROM_PDP_KEY_FOR_VS; //BS-787
                        lensCalculationKey = LENS_CALCULATION_KEY_FOR_VS; //BS-727
                        applicableKeyForSpecialHandlingOption = KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_VS;
                        applicableKeyForCustomerServicePreference = KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_VS;
                        applicableKeyForUserNote = KEY_FOR_USER_NOTE_ENTERED_FOR_VS;
                    } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                        // If current page source is RX then clearing of local storage that are having RX related parameters
                        key = FILTER_KEY_FOR_RX;
                        categoryKey = SELECTED_RX_CATEGORY_KEY;
                        orderInformationSummaryKey = RX_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE;
                        currentActiveStepKey = RX_CURRENT_ACTIVE_STEP_KEY_FOR_LOCAL_STORAGE;
                        currentProductData = LOCAL_PRODUCT_DATA_KEY_RX;
                        selectedFrame = SELECTED_FRAME_RX;
                        lensConfiguratorCollection = LOCAL_LENS_CONFIGURATOR_DATA_KEY_RX;
                        fromPDPIdentificationKey = IS_FROM_PDP_KEY_FOR_RX; //BS-787
                        lensCalculationKey = LENS_CALCULATION_KEY_FOR_RX; //BS-727
                        applicableKeyForSpecialHandlingOption = KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX;
                        applicableKeyForCustomerServicePreference = KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX;
                        applicableKeyForUserNote = KEY_FOR_USER_NOTE_ENTERED_FOR_RX;
                    }

                    if (key != null && key != undefined) {
                        localStorage.removeItem(key); // Clearing out filters selected by user
                    }
                    if (categoryKey != null && categoryKey != undefined) {
                        localStorage.removeItem(categoryKey); // Clearing out category selected by user
                    }
                    if (orderInformationSummaryKey != null && orderInformationSummaryKey != undefined) {
                        localStorage.removeItem(orderInformationSummaryKey); // Clearing out order information summary collection selected by user
                    }
                    if (currentActiveStepKey != null && currentActiveStepKey != undefined) {
                        localStorage.removeItem(currentActiveStepKey); // Clearing out current steps
                    }
                    if (selectedFrame != null && selectedFrame != undefined) {
                        localStorage.removeItem(selectedFrame); // Clearing out product data
                    }
                    if (currentProductData != null && currentProductData != undefined) {
                        localStorage.removeItem(currentProductData); // Clearing out product data
                    }
                    if (lensConfiguratorCollection != null && lensConfiguratorCollection != undefined) {
                        localStorage.removeItem(lensConfiguratorCollection); // Clearing out product data
                    }
                    //BS-787
                    if (fromPDPIdentificationKey != null && fromPDPIdentificationKey != undefined) {
                        localStorage.removeItem(fromPDPIdentificationKey);
                    }
                    //BS-787

                    //BS-727
                    if (lensCalculationKey != null && lensCalculationKey != undefined) {
                        localStorage.removeItem(lensCalculationKey);
                    }
                    //BS-727
                    //BS-1471
                    if (applicableKeyForSpecialHandlingOption != undefined && applicableKeyForSpecialHandlingOption != null) {
                        localStorage.removeItem(applicableKeyForSpecialHandlingOption);
                    }
                    if (applicableKeyForCustomerServicePreference != undefined && applicableKeyForCustomerServicePreference != null) {
                        localStorage.removeItem(applicableKeyForCustomerServicePreference);
                    }
                    if (applicableKeyForUserNote != undefined && applicableKeyForUserNote != null) {
                        localStorage.removeItem(applicableKeyForUserNote);
                    }
                    //BS-1471
                    //Removing extra parameters from URL and resetting it to original URL
                    window.history.replaceState({}, document.title, location.protocol + '//' + location.host + location.pathname);
                    this._isFromPDPPage = false; //BS-787
                } else if (stateAttributes != null && stateAttributes != undefined && stateAttributes.includes(NAVIGATION_FROM_PDP_KEY)) {
                    this._isNavigatedFromMyVSRX = false; //Bs-997
                    //BS-787 : If user is navigated from normal PDP page then performing initial setup for configurator
                    let key;
                    let categoryKey;
                    let orderInformationSummaryKey;
                    let currentActiveStepKey;
                    let currentProductData;
                    let selectedFrame;
                    let lensConfiguratorCollection;
                    let fromPDPIdentificationKey;
                    let lensCalculationKey; //BS-727

                    // If current page source is VS then clearing of local storage that are having VS related parameters
                    if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
                        key = FILTER_KEY_FOR_VS;
                        categoryKey = SELECTED_VS_CATEGORY_KEY;
                        orderInformationSummaryKey = VS_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE;
                        currentActiveStepKey = VS_CURRENT_ACTIVE_STEP_KEY_FOR_LOCAL_STORAGE;
                        currentProductData = LOCAL_PRODUCT_DATA_KEY_VS;
                        selectedFrame = SELECTED_FRAME_VS;
                        lensConfiguratorCollection = LOCAL_LENS_CONFIGURATOR_DATA_KEY_VS;
                        fromPDPIdentificationKey = IS_FROM_PDP_KEY_FOR_VS;
                        lensCalculationKey = LENS_CALCULATION_KEY_FOR_VS; //BS-727
                    } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                        // If current page source is RX then clearing of local storage that are having RX related parameters
                        key = FILTER_KEY_FOR_RX;
                        categoryKey = SELECTED_RX_CATEGORY_KEY;
                        orderInformationSummaryKey = RX_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE;
                        currentActiveStepKey = RX_CURRENT_ACTIVE_STEP_KEY_FOR_LOCAL_STORAGE;
                        currentProductData = LOCAL_PRODUCT_DATA_KEY_RX;
                        selectedFrame = SELECTED_FRAME_RX;
                        lensConfiguratorCollection = LOCAL_LENS_CONFIGURATOR_DATA_KEY_RX;
                        fromPDPIdentificationKey = IS_FROM_PDP_KEY_FOR_RX;
                        lensCalculationKey = LENS_CALCULATION_KEY_FOR_RX; //BS-727
                    }

                    if (key != null && key != undefined) {
                        localStorage.removeItem(key); // Clearing out filters selected by user
                    }
                    if (categoryKey != null && categoryKey != undefined) {
                        localStorage.removeItem(categoryKey); // Clearing out category selected by user
                    }
                    if (orderInformationSummaryKey != null && orderInformationSummaryKey != undefined) {
                        localStorage.removeItem(orderInformationSummaryKey); // Clearing out order information summary collection selected by user
                    }
                    if (currentActiveStepKey != null && currentActiveStepKey != undefined) {
                        localStorage.removeItem(currentActiveStepKey); // Clearing out current steps
                    }
                    if (selectedFrame != null && selectedFrame != undefined) {
                        localStorage.removeItem(selectedFrame); // Clearing out product data
                    }
                    if (currentProductData != null && currentProductData != undefined) {
                        localStorage.removeItem(currentProductData); // Clearing out product data
                    }
                    if (lensConfiguratorCollection != null && lensConfiguratorCollection != undefined) {
                        localStorage.removeItem(lensConfiguratorCollection); // Clearing out product data
                    }
                    if (fromPDPIdentificationKey != null && fromPDPIdentificationKey != undefined) {
                        localStorage.removeItem(fromPDPIdentificationKey); // BS-787
                    }

                    //BS-727
                    if (lensCalculationKey != null && lensCalculationKey != undefined) {
                        localStorage.removeItem(lensCalculationKey);
                    }
                    //BS-727

                    // Getting data from state of navigation mixin
                    this._orderInformationSummaryCollection = JSON.parse(this._urlPath.state.customerInformationSummaryCollectionFromPDP);
                    const currentActiveStep = {};
                    currentActiveStep.isActive = true;
                    currentActiveStep.isCompleted = false;
                    currentActiveStep.stepName = ''; // Purposefully kept it blank needed for further processing
                    currentActiveStep.stepNumber = 4; // Needed to hard code this as it is just a step number and has no further use
                    this._currentActiveStep = currentActiveStep;
                    this._currentActiveStepNumber = 4;
                    this._isCurrentActiveStepFetchedFromLocalStorage = true;

                    this._productData = JSON.parse(this._urlPath.state.productData);
                    this._selectedFrameId = this._urlPath.state.productId;
                    if (this._productData) {
                        this._frameType = this._productData.frameType;
                        this._model = this._productData.model;
                    }
                    this._preservedOrderInformationCollection = JSON.parse(JSON.stringify(this._orderInformationSummaryCollection));
                    let encodedFormattedCollection = btoa(unescape(encodeURIComponent(JSON.stringify(this._orderInformationSummaryCollection))));
                    this._isFromPDPPage = true;

                    if (orderInformationSummaryKey != null && orderInformationSummaryKey != undefined) {
                        localStorage.setItem(orderInformationSummaryKey, encodedFormattedCollection);
                    }

                    if (currentActiveStepKey != null && currentActiveStepKey != undefined) {
                        localStorage.setItem(currentActiveStepKey, this.currentActiveStep);
                    }

                    if (selectedFrame != null && selectedFrame != undefined) {
                        localStorage.setItem(selectedFrame, this._selectedFrameId);
                    }

                    if (currentProductData != null && currentProductData != undefined) {
                        let encodedFormattedProductCollection = btoa(unescape(encodeURIComponent(JSON.stringify(this._productData))));
                        localStorage.setItem(currentProductData, encodedFormattedProductCollection);
                    }

                    if (fromPDPIdentificationKey != null && fromPDPIdentificationKey != undefined) {
                        localStorage.setItem(fromPDPIdentificationKey, true);
                    }
                    //Removing extra parameters from the URL as the parameteres are consumed and do not have any further usage
                    window.history.replaceState({}, document.title, location.protocol + '//' + location.host + location.pathname);
                } else if (stateAttributes != null && stateAttributes != undefined && stateAttributes.includes(NAVIGATION_FROM_MY_VS_RX_KEY)) {
                    //BS-997 : Identifying whether the user is naviagted from My VS-RX page through state attribute and setting up the configurator according to that
                    this._isNavigatedFromMyVSRX = true;
                    let key;
                    let categoryKey;
                    let orderInformationSummaryKey;
                    let currentActiveStepKey;
                    let currentProductData;
                    let selectedFrame;
                    let lensConfiguratorCollection;
                    let fromPDPIdentificationKey;
                    let lensCalculationKey; //BS-727
                    let fromVsRxIdentificationKey;

                    // If current page source is VS then clearing of local storage that are having VS related parameters
                    if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
                        key = FILTER_KEY_FOR_VS;
                        categoryKey = SELECTED_VS_CATEGORY_KEY;
                        orderInformationSummaryKey = VS_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE;
                        currentActiveStepKey = VS_CURRENT_ACTIVE_STEP_KEY_FOR_LOCAL_STORAGE;
                        currentProductData = LOCAL_PRODUCT_DATA_KEY_VS;
                        selectedFrame = SELECTED_FRAME_VS;
                        lensConfiguratorCollection = LOCAL_LENS_CONFIGURATOR_DATA_KEY_VS;
                        fromPDPIdentificationKey = IS_FROM_PDP_KEY_FOR_VS;
                        lensCalculationKey = LENS_CALCULATION_KEY_FOR_VS; //BS-727
                    } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                        // If current page source is RX then clearing of local storage that are having RX related parameters
                        key = FILTER_KEY_FOR_RX;
                        categoryKey = SELECTED_RX_CATEGORY_KEY;
                        orderInformationSummaryKey = RX_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE;
                        currentActiveStepKey = RX_CURRENT_ACTIVE_STEP_KEY_FOR_LOCAL_STORAGE;
                        currentProductData = LOCAL_PRODUCT_DATA_KEY_RX;
                        selectedFrame = SELECTED_FRAME_RX;
                        lensConfiguratorCollection = LOCAL_LENS_CONFIGURATOR_DATA_KEY_RX;
                        fromPDPIdentificationKey = IS_FROM_PDP_KEY_FOR_RX;
                        lensCalculationKey = LENS_CALCULATION_KEY_FOR_RX; //BS-727
                    }

                    if (key != null && key != undefined) {
                        localStorage.removeItem(key); // Clearing out filters selected by user
                    }
                    if (categoryKey != null && categoryKey != undefined) {
                        localStorage.removeItem(categoryKey); // Clearing out category selected by user
                    }
                    if (orderInformationSummaryKey != null && orderInformationSummaryKey != undefined) {
                        localStorage.removeItem(orderInformationSummaryKey); // Clearing out order information summary collection selected by user
                    }
                    if (currentActiveStepKey != null && currentActiveStepKey != undefined) {
                        localStorage.removeItem(currentActiveStepKey); // Clearing out current steps
                    }
                    if (selectedFrame != null && selectedFrame != undefined) {
                        localStorage.removeItem(selectedFrame); // Clearing out product data
                    }
                    if (currentProductData != null && currentProductData != undefined) {
                        localStorage.removeItem(currentProductData); // Clearing out product data
                    }
                    if (lensConfiguratorCollection != null && lensConfiguratorCollection != undefined) {
                        localStorage.removeItem(lensConfiguratorCollection); // Clearing out product data
                    }
                    if (fromPDPIdentificationKey != null && fromPDPIdentificationKey != undefined) {
                        localStorage.removeItem(fromPDPIdentificationKey); // BS-787
                    }

                    if (lensCalculationKey != null && lensCalculationKey != undefined) {
                        localStorage.removeItem(lensCalculationKey);
                    }
                    if (fromVsRxIdentificationKey != null && fromVsRxIdentificationKey != undefined) {
                        localStorage.removeItem(fromVsRxIdentificationKey); // BS-787
                    }
                    const currentActiveStep = {};
                    currentActiveStep.isActive = true;
                    currentActiveStep.isCompleted = false;

                    this._productData = this._urlPath.state.productData != undefined ? JSON.parse(this._urlPath.state.productData) : null; //BS-1064
                    this._selectedFrameId = this._productData != undefined && this._productData != null ? this._productData.productIdPDP : null; //BS-1064
                    if (this._productData) {
                        this._frameType = this._productData.frameType;
                        this._model = this._productData.model;
                    }
                    this.lensConfiguratorCollection = JSON.parse(this._urlPath.state.lensConfiguratorCollection); //Assigning the object collection recieved from MY VS-RX page through state attibute to lens configurator collection
                    this.lensConfiguratorCollection.productFrameType = this._productData && this._productData.frameType ? this._productData.frameType : '';
                    this.lensConfiguratorCollection.productmodel = this._productData && this._productData.model ? this._productData.model : '';
                    if (
                        (this.lensConfiguratorCollection != null && this.lensConfiguratorCollection.variantShape == undefined) ||
                        this.lensConfiguratorCollection.variantShape == null
                    ) {
                        this.lensConfiguratorCollection.variantShape =
                            this._productData && this._productData.variantShape ? this._productData.variantShape : '';
                    }
                    if (
                        (this.lensConfiguratorCollection != null && this.lensConfiguratorCollection.shapeSize == undefined) ||
                        this.lensConfiguratorCollection.shapeSize == null
                    ) {
                        this.lensConfiguratorCollection.shapeSize = this._productData && this._productData.shapeSize ? this._productData.shapeSize : '';
                    } //BS-1916
                    if (
                        (this.lensConfiguratorCollection != null && this.lensConfiguratorCollection.rimlessVariant == undefined) ||
                        this.lensConfiguratorCollection.rimlessVariant == null
                    ) {
                        this.lensConfiguratorCollection.rimlessVariant =
                            this._productData && this._productData.rimlessVariant ? this._productData.rimlessVariant : '';
                    } //BS-1888
                    setLensConfiguratorCollection(this.lensConfiguratorCollection, this.pageSource);
                    localStorage.setItem(FROM_VS_RX_PAGE, true);
                    if (currentProductData != null && currentProductData != undefined) {
                        let encodedFormattedProductCollection = btoa(unescape(encodeURIComponent(JSON.stringify(this._productData))));
                        localStorage.setItem(currentProductData, encodedFormattedProductCollection);
                    }
                    if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
                        localStorage.setItem(SELECTED_FRAME_VS, this._selectedFrameId);
                    } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                        localStorage.setItem(SELECTED_FRAME_RX, this._selectedFrameId);
                    }
                    this._insertedLensConfiguratorId =
                        this.lensConfiguratorCollection.lensConfiguratorID != undefined && this.lensConfiguratorCollection.lensConfiguratorID != null
                            ? this.lensConfiguratorCollection.lensConfiguratorID
                            : null;
                    this._userInputForSpecialHandlingField =
                        this.lensConfiguratorCollection.userInputForSpecialHandlingField != undefined &&
                        this.lensConfiguratorCollection.userInputForSpecialHandlingField != null
                            ? this.lensConfiguratorCollection.userInputForSpecialHandlingField
                            : null;
                    this._userInputForNotesField =
                        this.lensConfiguratorCollection.userInputForNotesField != undefined && this.lensConfiguratorCollection.userInputForNotesField != null
                            ? this.lensConfiguratorCollection.userInputForNotesField
                            : null;
                    this._customerServicePrefernceChoice =
                        this.lensConfiguratorCollection.customerServicePrefernceChoice != undefined &&
                        this.lensConfiguratorCollection.customerServicePrefernceChoice != null
                            ? this.lensConfiguratorCollection.customerServicePrefernceChoice
                            : null;
                    setAddToCartStorage(
                        this._userInputForNotesField,
                        this._userInputForSpecialHandlingField,
                        this._customerServicePrefernceChoice,
                        this.pageSource
                    );

                    //BS-1775
                    let currentPageNumberMyVsRx = 4;
                    if (this.lensConfiguratorCollection.completedStep !== undefined && this.lensConfiguratorCollection.completedStep !== null) {
                        currentPageNumberMyVsRx = this.lensConfiguratorCollection.completedStep;
                    }

                    if (this.lensConfiguratorCollection.isFromCart) {
                        if (this._isPreviewAndNext) {
                            currentPageNumberMyVsRx = 9;
                        } else {
                            currentPageNumberMyVsRx = 10;
                        }
                    }

                    currentActiveStep.stepName = ''; // Purposefully kept it blank needed for further processing
                    currentActiveStep.stepNumber = currentPageNumberMyVsRx; // Needed to hard code this as it is just a step number and has no further use
                    this._currentActiveStep = currentActiveStep;
                    this._currentActiveStepNumber = currentPageNumberMyVsRx;
                    this._isCurrentActiveStepFetchedFromLocalStorage = true;
                    //BS-1244
                    this.fromMyVSRX = true;

                    //Removing extra parameters from the URL as the parameteres are consumed and do not have any further usage
                    window.history.replaceState({}, document.title, location.protocol + '//' + location.host + location.pathname);
                } else {
                    if (localStorage.getItem(FROM_VS_RX_PAGE)) {
                        this._isNavigatedFromMyVSRX = true;
                    } else {
                        this._isNavigatedFromMyVSRX = false;
                    }
                    // Added as a part of BS-709
                    // If user is not navigated from home page then fetching the details from local storage according to current store
                    let orderInformationSummaryKey;
                    let currentActiveStepKey;
                    let currentProductData;
                    let selectedFrame;
                    let lensConfiguratorCollection;
                    let fromPDPIdentificationKey; //BS-787

                    if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
                        orderInformationSummaryKey = VS_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE;
                        currentActiveStepKey = VS_CURRENT_ACTIVE_STEP_KEY_FOR_LOCAL_STORAGE;
                        currentProductData = LOCAL_PRODUCT_DATA_KEY_VS;
                        selectedFrame = SELECTED_FRAME_VS;
                        fromPDPIdentificationKey = IS_FROM_PDP_KEY_FOR_VS; // BS-787
                        lensConfiguratorCollection = LOCAL_LENS_CONFIGURATOR_DATA_KEY_VS;
                    } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                        orderInformationSummaryKey = RX_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE;
                        currentActiveStepKey = RX_CURRENT_ACTIVE_STEP_KEY_FOR_LOCAL_STORAGE;
                        currentProductData = LOCAL_PRODUCT_DATA_KEY_RX;
                        selectedFrame = SELECTED_FRAME_RX;
                        lensConfiguratorCollection = LOCAL_LENS_CONFIGURATOR_DATA_KEY_RX;
                        fromPDPIdentificationKey = IS_FROM_PDP_KEY_FOR_RX; //BS-787
                    }

                    //If User is not naviated from home page (refresh or language change) then getting values of order information collection and step number from local storage
                    if (
                        orderInformationSummaryKey != null &&
                        orderInformationSummaryKey != undefined &&
                        localStorage.getItem(orderInformationSummaryKey) != null &&
                        localStorage.getItem(orderInformationSummaryKey) != undefined
                    ) {
                        // Fetching preserved deails of order information summary stored for VS from local storage
                        let decodedFormattedOrderInformationCollection = decodeURIComponent(escape(atob(localStorage.getItem(orderInformationSummaryKey))));
                        this._preservedOrderInformationCollection = JSON.parse(decodedFormattedOrderInformationCollection);
                        this._orderInformationSummaryCollection = this._preservedOrderInformationCollection;
                    }

                    if (
                        currentActiveStepKey != null &&
                        currentActiveStepKey != undefined &&
                        localStorage.getItem(currentActiveStepKey) != null &&
                        localStorage.getItem(currentActiveStepKey) != undefined
                    ) {
                        // Fetching preserved deails of order information summary stored for RX from local storage
                        let decodedFormattedActiveStepNumberCollection = decodeURIComponent(escape(atob(localStorage.getItem(currentActiveStepKey))));
                        this._currentActiveStep = JSON.parse(decodedFormattedActiveStepNumberCollection);
                        this._currentActiveStepNumber = this._currentActiveStep.stepNumber;
                        this._isCurrentActiveStepFetchedFromLocalStorage = true;
                    }

                    //This below code is for Frame Details frame information section which populate displayed info automaticlly from local storage when page gets refresh
                    if (
                        selectedFrame != null &&
                        selectedFrame != undefined &&
                        localStorage.getItem(selectedFrame) != null &&
                        localStorage.getItem(selectedFrame) != undefined
                    ) {
                        // Added as a part of BS-709
                        this._selectedFrameId = localStorage.getItem(selectedFrame);
                    }
                    //This below code is for Frame Details frame information section which populate displayed info automaticlly from local storage when page gets refresh
                    if (
                        currentProductData != null &&
                        currentProductData != undefined &&
                        localStorage.getItem(currentProductData) != null &&
                        localStorage.getItem(currentProductData) != undefined
                    ) {
                        // Fetching preserved deails of order information summary stored for VS from local storage

                        let decodedFormattedProductData = decodeURIComponent(escape(atob(localStorage.getItem(currentProductData))));
                        this._productData = JSON.parse(decodedFormattedProductData);
                    }

                    //This below code is for lens configurator data
                    if (
                        lensConfiguratorCollection != null &&
                        lensConfiguratorCollection != undefined &&
                        localStorage.getItem(lensConfiguratorCollection) != null &&
                        localStorage.getItem(lensConfiguratorCollection) != undefined
                    ) {
                        // Fetching preserved deails of order information summary stored for VS from local storage
                        let decodedFormattedProductData = decodeURIComponent(escape(atob(localStorage.getItem(lensConfiguratorCollection))));
                        this.lensConfiguratorCollection = JSON.parse(decodedFormattedProductData);
                        this._insertedLensConfiguratorId = this.lensConfiguratorCollection.insertedLensConfiguratorId;
                    }

                    //Bs-728
                    this._selectedOrderType =
                        this.lensConfiguratorCollection != null &&
                        this.lensConfiguratorCollection != undefined &&
                        this.lensConfiguratorCollection.orderType != null &&
                        this.lensConfiguratorCollection.orderType != undefined
                            ? this.lensConfiguratorCollection.orderType
                            : null;

                    //BS-787
                    if (
                        fromPDPIdentificationKey != null &&
                        fromPDPIdentificationKey != undefined &&
                        localStorage.getItem(fromPDPIdentificationKey) != null &&
                        localStorage.getItem(fromPDPIdentificationKey) != undefined
                    ) {
                        this._isFromPDPPage = JSON.parse(localStorage.getItem(fromPDPIdentificationKey));
                    } else {
                        this._isFromPDPPage = false; //BS-787
                    }
                    //BS-787
                }
            }
            this._isInitialLoadComplete = true; // This indicates that the initial loading of component is done
        } catch (exceptionInstance) {
            this._isLoading = false;
            console.error(exceptionInstance);
        }
    }

    connectedCallback() {
        //BS-2185
        this._currentPageURL = window.location.href;
        //BS-1582 - Start
        let targetPage;
        if (this.pageSource != undefined && this.pageSource != null) {
            if (this.pageSource == PAGE_SOURCE_VS) {
                targetPage = VS_UNDERCONSTRUCTION_PAGE;
            } else if (this.pageSource == PAGE_SOURCE_RX) {
                targetPage = RX_UNDERCONSTRUCTION_PAGE;
            }
        }

        B2B_VS_RX_APPLICABLE_ACCOUNTS.split(',').forEach((value) => {
            if (value != undefined && value != null && (value == this.accountId || value == ACCESS_TO_ALL_IDENTIFIER)) {
                this._isVSRXApplicable = true;
            }
        });

        if (this._isVSRXApplicable != undefined && this._isVSRXApplicable != null && this._isVSRXApplicable == false) {
            this[NavigationMixin.Navigate]({
                type: STANDARD_NAMED_PAGE,
                attributes: {
                    name: targetPage
                }
            });
        }
        //BS-1582 - End

        this.labelObject = createLabels();
        //Setting up values of _isSourceVS & _isSourceRX from the page source recieved
        if (this.pageSource != null && this.pageSource != undefined) {
            if (this.pageSource == PAGE_SOURCE_VS) {
                this._isSourceVS = true;
                this._isSourceRX = false;
                this._frameType =
                    this.lensConfiguratorCollection && this.lensConfiguratorCollection.productFrameType ? this.lensConfiguratorCollection.productFrameType : '';
                this._model =
                    this.lensConfiguratorCollection && this.lensConfiguratorCollection.productmodel ? this.lensConfiguratorCollection.productmodel : '';
            } else if (this.pageSource == PAGE_SOURCE_RX) {
                this._isSourceVS = false;
                this._isSourceRX = true;
            }
        }
    }

    /* Start of BS-2185 */
    constructor() {
        super();
        window.addEventListener('beforeunload', (event) => {
            let hrefLocation = window.location.href.split('site.com')[1];
            let preventReloadWarning = false;
            if (localStorage.getItem(LANGUAGE_CHANGED_VARIABLE) && localStorage.getItem(LANGUAGE_CHANGED_VARIABLE) == 'true') {
                preventReloadWarning = true;
                localStorage.setItem(LANGUAGE_CHANGED_VARIABLE, 'false');
            }
            if (localStorage.getItem(SIZE_SHAPE_CHANGED_VARIABLE) && localStorage.getItem(SIZE_SHAPE_CHANGED_VARIABLE) == 'true') {
                preventReloadWarning = true;
                localStorage.setItem(SIZE_SHAPE_CHANGED_VARIABLE, 'false');
            }
            if (localStorage.getItem(CLEAR_ALL_FILTER) && localStorage.getItem(CLEAR_ALL_FILTER) == 'true') {
                preventReloadWarning = true;
                localStorage.setItem(CLEAR_ALL_FILTER, 'false');
            }
            if (
                hrefLocation != '/silhouette/s' &&
                preventReloadWarning === false &&
                this.productsAddedToCart == false &&
                this.cancelVSConfiguration == false &&
                this._runBeforeUnloadEvent == true
            ) {
                event.preventDefault();
            }
        });
    }
    async disconnectedCallback() {
        this._runBeforeUnloadEvent = false;
        let previousURL = window.location.href;
        let text = B2B_CONFIRM_VS_RX_CONFIGURATOR_EXIT;
        let response;
        if (this.cancelVSConfiguration == false && this.productsAddedToCart == false) {
            response = confirm(text);
            if (!response) {
                window.location.href = this._currentPageURL;
            } else {
                window.location.href = previousURL;
            }
        }
        this.productsAddedToCart = false;
        this.cancelVSConfiguration = false;
    }

    /* End of BS-2185 */

    /**
     * This method is used to operate progress bar section according to action (Next, Previous) and step number
     * BS-655
     * @param   event       :   Event fired on click of button
     */
    async handleButtonClick(event) {
        const selectedAction = event.target.value;
        let currentStepNumber = this._currentActiveStep.stepNumber; //Capturing current Active stepNumber
        //Checking whether the current active step is completed
        if (this._currentActiveStep != null && this._currentActiveStep != undefined && this._currentActiveStep.isCompleted == false) {
            if (selectedAction == NEXT_ACTION) {
                //BS-800 Start
                if (currentStepNumber == 1) {
                    // If NEXT Button is clicked by user on UI and Step Number is 1 then performing validity check whether user had entered valid information
                    const orderReferenceComponent = this.template.querySelector(ORDER_REFERENCE_COMPONENT);
                    let firstStepComplete = false;

                    // Invoking 'performValidityCheck' function of 'c/c/b2b_vs_order_reference_component' to perform validity check
                    firstStepComplete = orderReferenceComponent.performValidityCheck();

                    // If the response obtained from validtyCheck as true then incrementing progress bar step \
                    if (firstStepComplete == true) {
                        this._isLoading = true;
                        this._isCurrentActiveStepFetchedFromLocalStorage = operateProgressBarCollection(
                            selectedAction,
                            this._currentActiveStep,
                            this._isCurrentActiveStepFetchedFromLocalStorage,
                            this.template
                        );
                    }
                    if (firstStepComplete == true && this._resetLensConfigurator == true) {
                        if (
                            this.lensConfiguratorCollection &&
                            this.lensConfiguratorCollection.lensConfiguratorID != undefined &&
                            this.lensConfiguratorCollection.lensConfiguratorID != null
                        ) {
                            this.clearLensConfiguratorValues(
                                this.lensConfiguratorCollection.lensConfiguratorID,
                                this.pageSource,
                                ORDER_OR_FRAME_TYPE_CHANGE_TRIGGERING_EVENT
                            ); //BS-1798
                            this.lensConfiguratorCollection = resetLensConfiguratorCollectionExceptPrescription(
                                this.lensConfiguratorCollection,
                                this.labelObject._prescriptionValueFields
                            ); //BS-2013
                        }
                    }
                    if (firstStepComplete == true && this._isNavigatedFromMyVSRX == true) {
                        if (
                            this.lensConfiguratorCollection &&
                            this.lensConfiguratorCollection.lensConfiguratorID != undefined &&
                            this.lensConfiguratorCollection.lensConfiguratorID != null
                        ) {
                            let updatedCustomerInformation = {
                                customerName: this._previousCustomerName,
                                clerk: this._previousClerk,
                                orderType: this._previousOrderType
                            };
                            saveOrderInformationData({
                                lensConfiguratorId: this.lensConfiguratorCollection.lensConfiguratorID,
                                fieldNameVsLensConfiguratorDataMap: updatedCustomerInformation
                            })
                                .then((data) => {})
                                .catch((error) => {
                                    console.error(error);
                                });
                        }
                    }
                } else if (currentStepNumber == 3) {
                    this._isLoading = true;
                    this._isCurrentActiveStepFetchedFromLocalStorage = operateProgressBarCollection(
                        selectedAction,
                        this._currentActiveStep,
                        this._isCurrentActiveStepFetchedFromLocalStorage,
                        this.template
                    );
                } else if (currentStepNumber === 8) {
                    let saveData = false;
                    const centeringDataComponent = this.template.querySelector(CENTERING_DATA_COMPONENT);
                    if (centeringDataComponent.validateInput()) {
                        saveData = await centeringDataComponent.saveCenteringDataValues();
                        this._isLoading = true;
                        if (saveData === true) {
                            const progressBarComponent = this.template.querySelector(PROGRESS_BAR_COMPONENT);
                            //Invoking 'updateProgressBar' function on 'c/b2b_progressBar_Component' and supplying the details that will help to update progress bar steps accordingly
                            progressBarComponent.updateProgressBar(10, true, false);
                        }
                    }
                    //BS-1775
                    this.updateCurrentStepNumberLensConfigurator(this.lensConfiguratorCollection, 8);

                    this._isPreviewAndNext = false;
                }
            }

            if (selectedAction == SAVE_NEXT_ACTION) {
                const orderReferenceComponent = this.template.querySelector(ORDER_REFERENCE_COMPONENT);
                let firstStepComplete = false;
                let frameRun = false;

                if (orderReferenceComponent) {
                    firstStepComplete = orderReferenceComponent.performValidityCheck();
                }
                if (firstStepComplete == true) {
                    if (this.lensConfiguratorCollection != null && this.lensConfiguratorCollection != undefined && currentStepNumber == 4) {
                        if (
                            this.lensConfiguratorCollection.selectedFrameSKU === undefined ||
                            this.lensConfiguratorCollection.selectedFrameSKU != this._productData.selectedFrameSKU ||
                            this.lensConfiguratorCollection.customerName != this._previousCustomerName ||
                            this.lensConfiguratorCollection.clerk != this._previousClerk ||
                            this.lensConfiguratorCollection.orderType != this._previousOrderType
                        ) {
                            const lensConfiguratorDataSave = this.template.querySelector('c-b2b_vs_rx_frame_information');
                            if (lensConfiguratorDataSave) {
                                lensConfiguratorDataSave.handleUpdateInputData();
                                frameRun = true;
                            }
                        }
                    }
                    if (currentStepNumber == 4) {
                        if (this.lensConfiguratorCollection == null || this.lensConfiguratorCollection == undefined) {
                            const lensConfiguratorDataSave = this.template.querySelector('c-b2b_vs_rx_frame_information');
                            lensConfiguratorDataSave.handleSaveInputData();
                        } else if (frameRun != true) {
                            this._isLoading = true;
                            this._isCurrentActiveStepFetchedFromLocalStorage = operateProgressBarCollection(
                                selectedAction,
                                this._currentActiveStep,
                                this._isCurrentActiveStepFetchedFromLocalStorage,
                                this.template
                            );
                        }

                        //BS-1775
                        this.updateCurrentStepNumberLensConfigurator(this.lensConfiguratorCollection, 4);
                    } else if (currentStepNumber == 5) {
                        let valid;
                        let calloutResponse;
                        if (this.pageSource == PAGE_SOURCE_RX) {
                            const rxSolutionDataUpdate = this.template.querySelector(RX_SOLUTION_COMPONENT);
                            valid = rxSolutionDataUpdate.handleValidityCheck();
                            if (valid == true) {
                                rxSolutionDataUpdate.updateRXSolutionData();
                                this._isLoading = true;
                            }
                        } else if (this.pageSource == PAGE_SOURCE_VS) {
                            const shapeSelectionComponent = this.template.querySelector(SHAPE_SELECTION_SCREEN);
                            if (shapeSelectionComponent) {
                                valid = await shapeSelectionComponent.handleValidityCheck();
                                calloutResponse = await shapeSelectionComponent.getScaleShapeFromOMACallout(); //BS-2407
                                if (valid == true && calloutResponse == true) {
                                    shapeSelectionComponent.updateShapeSelectionData();
                                }
                            }
                        }

                        //BS-1775
                        this.updateCurrentStepNumberLensConfigurator(this.lensConfiguratorCollection, 5);
                    } else if (currentStepNumber === 6) {
                        let saveData;
                        const lensSelectionDataSave = this.template.querySelector('c-b2b_vs_rx_lens-selection');
                        saveData = await lensSelectionDataSave.handleLensSelectionDataUpdate();

                        if (saveData === true) {
                            this._isLoading = true;
                        }

                        //BS-1775
                        this.updateCurrentStepNumberLensConfigurator(this.lensConfiguratorCollection, 6);
                    } else if (currentStepNumber === 7) {
                        //BS-725
                        let saveData = false;
                        this._isLoading = true; //BS-1649 : turning on the loader in order to prevent double click
                        const prescriptionValueComponent = this.template.querySelector(PRESCRIPTION_VALUE_COMPONENT);
                        /* Start : BS-1443 : Add json to identify if the validation is triggered from container */
                        if (prescriptionValueComponent.validateInput({ target: { name: PRESCRIPTION_DATA } })) {
                            /* End : BS-1443*/
                            saveData = await prescriptionValueComponent.savePrescriptionValue();
                            if (saveData === true) {
                                //BS-1649 : Shifting the current screen to centering data screen as prescription data is saved successfully
                                const progressBarComponent = this.template.querySelector(PROGRESS_BAR_COMPONENT);
                                //Invoking 'updateProgressBar' function on 'c/b2b_progressBar_Component' and supplying the details that will help to update progress bar steps accordingly
                                progressBarComponent.updateProgressBar(8, true, false);
                                this._isCurrentActiveStepFetchedFromLocalStorage = false;
                                //BS-1649 : End
                            }
                            this._isLoading = false; //BS-1649 : turning off the loader
                        } //BS-1649 : Added below block to turn of the loader
                        else {
                            this._isLoading = false;
                        }
                        //BS-1649 - End

                        //BS-1775
                        this.updateCurrentStepNumberLensConfigurator(this.lensConfiguratorCollection, 7);
                    } else if (currentStepNumber === 8) {
                        //BS-726
                        let saveData = false;
                        const centeringDataComponent = this.template.querySelector(CENTERING_DATA_COMPONENT);
                        if (centeringDataComponent.validateInput()) {
                            saveData = await centeringDataComponent.saveCenteringDataValues();
                            if (saveData === true) {
                                this._isLoading = false;
                                /* BS-974 : Removed condition: this.pageSource == PAGE_SOURCE_RX to ensure that below block executes for both*/
                                if (this.pageSource != undefined && this.pageSource != null) {
                                    this._isCurrentActiveStepFetchedFromLocalStorage = operateProgressBarCollection(
                                        selectedAction,
                                        this._currentActiveStep,
                                        this._isCurrentActiveStepFetchedFromLocalStorage,
                                        this.template
                                    );
                                    //BS-727 - Start
                                    const progressBarComponent = this.template.querySelector(PROGRESS_BAR_COMPONENT);
                                    //Invoking 'updateProgressBar' function on 'c/b2b_progressBar_Component' and supplying the details that will help to update progress bar steps accordingly
                                    progressBarComponent.updateProgressBar(9, true, false);
                                    //BS-727 - End
                                }
                            }
                        }
                        this._isPreviewAndNext = true;
                        //BS-1775
                        this.updateCurrentStepNumberLensConfigurator(this.lensConfiguratorCollection, 8);
                    } else if (currentStepNumber === 9) {
                        //BS-727
                        const calculateLensComponent = this.template.querySelector(CALCULATE_LENS_COMPONENT);
                        let status = calculateLensComponent.handleSaveAndNextButtonClick();
                        this._isCurrentActiveStepFetchedFromLocalStorage = operateProgressBarCollection(
                            selectedAction,
                            this._currentActiveStep,
                            this._isCurrentActiveStepFetchedFromLocalStorage,
                            this.template
                        );
                        //BS-1775
                        this.updateCurrentStepNumberLensConfigurator(this.lensConfiguratorCollection, 9);
                    } else {
                        this._isLoading = true;
                        this._isCurrentActiveStepFetchedFromLocalStorage = operateProgressBarCollection(
                            selectedAction,
                            this._currentActiveStep,
                            this._isCurrentActiveStepFetchedFromLocalStorage,
                            this.template
                        );
                    }
                }
            } //end save and next

            if (selectedAction == BACK_ACTION) {
                // BS-790 - Start
                // If user is navigated from normal PDP page then on click of back button navigating user back to normal PDP page
                if (currentStepNumber == 4 && this._isFromPDPPage != null && this._isFromPDPPage != undefined && this._isFromPDPPage) {
                    this[NavigationMixin.Navigate]({
                        type: STANDARD_RECORD_PAGE,
                        attributes: {
                            recordId: this._selectedFrameId,
                            actionName: PAGE_MODE_VIEW
                        },
                        state: {
                            fromVSRX: true, //This attribute is used to determine whether user has naviagyed from PDP page (True/False)
                            customerInformationSummaryCollectionFromVSRX: JSON.stringify(this._orderInformationSummaryCollection) // This collections contains the information of customer entered by user on UI
                        }
                    });
                    //BS-790 - End
                } //BS-1054 start
                else if (currentStepNumber != null && currentStepNumber != undefined && currentStepNumber == 8) {
                    const prescriptionValueComponent = this.template.querySelector(PRESCRIPTION_VALUE_COMPONENT);
                    if (prescriptionValueComponent) {
                        prescriptionValueComponent.setOnloadInputFieldAttributes();
                    }
                    this._isCurrentActiveStepFetchedFromLocalStorage = operateProgressBarCollection(
                        selectedAction,
                        this._currentActiveStep,
                        this._isCurrentActiveStepFetchedFromLocalStorage,
                        this.template
                    );
                } //BS-1054 end
                else if (currentStepNumber != null && currentStepNumber != undefined && currentStepNumber == 10) {
                    //BS-1118
                    const progressBarComponent = this.template.querySelector(PROGRESS_BAR_COMPONENT);
                    //Invoking 'updateProgressBar' function on 'c/b2b_progressBar_Component' and supplying the details that will help to update progress bar steps accordingly
                    //BS-727 - start
                    if (
                        this.componentVisibilityObj._showCalculateLensComponent != null &&
                        this.componentVisibilityObj._showCalculateLensComponent != undefined &&
                        this.componentVisibilityObj._showCalculateLensComponent == true
                    ) {
                        const calculateLensComponent = this.template.querySelector(CALCULATE_LENS_COMPONENT);
                        if (calculateLensComponent != null && calculateLensComponent != undefined) {
                            calculateLensComponent.handleEditButton();
                        }
                    } else {
                        progressBarComponent.updateProgressBar(8, true, false);
                    }
                    //BS-727 - End
                } else {
                    this._isLoading = true; //BS-1525
                    this._isCurrentActiveStepFetchedFromLocalStorage = operateProgressBarCollection(
                        selectedAction,
                        this._currentActiveStep,
                        this._isCurrentActiveStepFetchedFromLocalStorage,
                        this.template
                    );
                }
            }
        }
    }

    /**
     * This method is used to handle event: 'progressbarstepscomplete' fired through 'b2b_progressBarComponent'
     * BS-655
     * @param   event       :   Event fired from 'b2b_progressBarComponent'
     */
    handleProgressBarStepsCollection(event) {
        if (event.detail != null && event.detail != undefined) {
            this._progressBarStepsCollection = event.detail.progressBarStepsCollection; //Assigning the recieved collection of progress bar steps
            if (this._isCurrentActiveStepFetchedFromLocalStorage == false) {
                for (var step in this._progressBarStepsCollection) {
                    if (this._progressBarStepsCollection[step].isActive == true) {
                        this._currentActiveStep = [];
                        this._currentActiveStep = this._progressBarStepsCollection[step]; //Iterating over the collection and identifying the current active step and putting that step into _currentActiveStep collecrtion
                        let encodedFormattedCurrentActiveStepsCollection = btoa(unescape(encodeURIComponent(JSON.stringify(this._currentActiveStep))));

                        let currentActiveStepKey;
                        if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
                            currentActiveStepKey = VS_CURRENT_ACTIVE_STEP_KEY_FOR_LOCAL_STORAGE;
                        } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                            currentActiveStepKey = RX_CURRENT_ACTIVE_STEP_KEY_FOR_LOCAL_STORAGE;
                        }
                        if (currentActiveStepKey != null && currentActiveStepKey != undefined) {
                            localStorage.setItem(currentActiveStepKey, encodedFormattedCurrentActiveStepsCollection);
                        }

                        this._progressBarStepsLoaded = true;
                    }
                }
                this.handleTemplatesAccordingToSteps();
            } else if (this._isCurrentActiveStepFetchedFromLocalStorage == true) {
                const activeStepNumberCollection = {};
                activeStepNumberCollection.stepNumber = this._currentActiveStepNumber;
                activeStepNumberCollection.activeStatus = true;
                activeStepNumberCollection.successStatus = false;
                this._isCurrentActiveStepFetchedFromLocalStorage = false;
                this.updateProgressBarToCustomStep(activeStepNumberCollection);
            }
        }
    }

    /**
     * This method is used to operate progress bar section explicitely according to step number provided
     * BS-708
     * @param   stepNumberDetailsCollection :   Collection containing details of current active step number such as:
     *                                          1. StepNumber    : Step Number to be jumped
     *                                          1. activeStatus  : Whether step Number to be jumped should be active (true/false)
     *                                          1. successStatus : Whether step Number to be jumped should be marked as completed (true/false)
     */
    updateProgressBarToCustomStep(stepNumberDetailsCollection) {
        if (stepNumberDetailsCollection != null && stepNumberDetailsCollection != undefined) {
            let stepNumber = stepNumberDetailsCollection.stepNumber;
            let activeStatus = stepNumberDetailsCollection.activeStatus;
            let successStatus = stepNumberDetailsCollection.successStatus;

            const progressBarComponent = this.template.querySelector(PROGRESS_BAR_COMPONENT);
            if (progressBarComponent != null && progressBarComponent != undefined) {
                //Invoking 'updateProgressBar' function on 'c/c/b2b_progressBar_Component' and supplying the details that will help to update progress bar steps accordingly
                progressBarComponent.updateProgressBar(stepNumber, activeStatus, successStatus);
            }
        }
    }

    /**
     * This method is used to handle the templates that needs to be shown on UI according to current active step
     * BS-654
     */
    async handleTemplatesAccordingToSteps() {
        let currentStepNumber = this._currentActiveStep.stepNumber;
        this.componentVisibilityObj = {};
        //BS-787 - Start
        //If user has navigated from any other source such as PDP then on click of edit icon on order information redirecting user to 4th step instead of 1st step
        if (currentStepNumber == 4 && this._isFromPDPPage != null && this._isFromPDPPage != undefined && this._isFromPDPPage == true) {
            this.orderTypeSelectionEditModeForPDPSource = true;
        } else if (currentStepNumber != 4 && this._isFromPDPPage != null && this._isFromPDPPage != undefined && this._isFromPDPPage == true) {
            this.orderTypeSelectionEditModeForPDPSource = false;
        }
        //BS-787 - End
        if (currentStepNumber != 2 && currentStepNumber != 9 && currentStepNumber <= 10) {
            this.componentVisibilityObj = await setComponentVisibility(currentStepNumber, this.template, this.pageSource);
            this._isLoading = false;
        } else if (currentStepNumber == 2) {
            this.componentVisibilityObj = await setComponentVisibility(currentStepNumber, this.template, this.pageSource);
            for (var orderInformation in this._orderInformationSummaryCollection) {
                // BS-762 Start
                // Below block is use to get order type and frame type selected by user on 1st screen
                if (
                    this._orderInformationSummaryCollection[orderInformation].isOrderType == true &&
                    this._orderInformationSummaryCollection[orderInformation].isChecked == true
                ) {
                    this._selectedOrderType = this._orderInformationSummaryCollection[orderInformation].fieldName;
                    // If selected order type from user is changed and identifying the changed order type and removing it from local storage
                    if (this._selectedOrderType != null && this._selectedOrderType != undefined) {
                        let previouslySelectedOrderType = this._selectedOrderType;
                        if (previouslySelectedOrderType != this._orderInformationSummaryCollection[orderInformation].fieldName) {
                            this._selectedOrderType = this._orderInformationSummaryCollection[orderInformation].fieldName;
                            let key;
                            let categoryKey;
                            if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
                                key = FILTER_KEY_FOR_VS;
                                categoryKey = SELECTED_VS_CATEGORY_KEY;
                            } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                                key = FILTER_KEY_FOR_RX;
                                categoryKey = SELECTED_RX_CATEGORY_KEY;
                            }

                            // If order type is changes then removing filters and categories selected by user previosuly
                            if (key != null && key != undefined) {
                                localStorage.removeItem(key);
                            }
                            if (categoryKey != null && categoryKey != undefined) {
                                localStorage.removeItem(categoryKey);
                            }
                        }
                    } else {
                        this._selectedOrderType = this._orderInformationSummaryCollection[orderInformation].fieldName;
                    }
                }

                // If frame type selection is changed then removing filters and category filter selected by user previously from local storage
                if (this._isSourceVS == true) {
                    if (
                        this._orderInformationSummaryCollection[orderInformation].isFrameType == true &&
                        this._orderInformationSummaryCollection[orderInformation].isChecked == true
                    ) {
                        this._selectedFrameTypeCollection.apiName = this._orderInformationSummaryCollection[orderInformation].fieldName;
                        this._selectedFrameTypeCollection.label = this._orderInformationSummaryCollection[orderInformation].label;
                        if (this._selectedFrameTypeCollection.apiName != null && this._selectedFrameTypeCollection.apiName != undefined) {
                            if (
                                this._selectedFrameTypeCollection.apiName != this._orderInformationSummaryCollection[orderInformation].fieldName ||
                                this._selectedFrameTypeCollection.label != this._orderInformationSummaryCollection[orderInformation].label
                            ) {
                                this._selectedFrameTypeCollection.apiName = this._orderInformationSummaryCollection[orderInformation].fieldName;
                                this._selectedFrameTypeCollection.label = this._orderInformationSummaryCollection[orderInformation].label;

                                let key;
                                let categoryKey;
                                if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
                                    key = FILTER_KEY_FOR_VS;
                                    categoryKey = SELECTED_VS_CATEGORY_KEY;
                                } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                                    key = FILTER_KEY_FOR_RX;
                                    categoryKey = SELECTED_RX_CATEGORY_KEY;
                                }
                                if (key != null && key != undefined) {
                                    localStorage.removeItem(key);
                                }
                                if (categoryKey != null && categoryKey != undefined) {
                                    localStorage.removeItem(categoryKey);
                                }
                            }
                        } else {
                            this._selectedFrameTypeCollection.apiName = this._orderInformationSummaryCollection[orderInformation].fieldName;
                            this._selectedFrameTypeCollection.label = this._orderInformationSummaryCollection[orderInformation].label;
                        }
                        if (
                            this._selectedFrameTypeCollection.apiName == OPTICAL_EYEWEAR_CATEGORY &&
                            this._selectedFrameTypeCollection.label != this.labelObject._opticalEyewearCategory
                        ) {
                            this._selectedFrameTypeCollection.label = this.labelObject._opticalEyewearCategory;
                        }
                    }
                } else if (this._isSourceRX == true) {
                    this._selectedFrameTypeCollection.apiName = CATEGORY_FRAMES;
                    this._selectedFrameTypeCollection.label = this.labelObject._frameCategoryLabel;
                }
                // BS-762 End
            }

            if (
                this._selectedOrderType != null &&
                this._selectedOrderType != undefined &&
                this._selectedFrameTypeCollection.apiName != null &&
                this._selectedFrameTypeCollection.apiName != undefined
            ) {
                this.componentVisibilityObj._showFrameSearchComponent = true;
            } else {
                this._isLoading = false;
            }
        } else if (currentStepNumber == 9) {
            this.componentVisibilityObj = await setComponentVisibility(currentStepNumber, this.template, this.pageSource);
            this.lensConfiguratorCollection.isLensCalculated = true;
            this._isLoading = false;
            /* End BS-1055 */
        } else {
            //final:For fail safety
            this.componentVisibilityObj = await setComponentVisibility('final', this.template, this.pageSource);
            this._isLoading = false;
        }
    }

    /**
     * This method is used to handle the event invoked by user onclick of 'Cancel' button on UI
     * This method is used to navigate user to home page
     * BS-655
     * @param   event  :   Event fired on click of 'Cancel' button
     */
    handleCancelButtonClick(event) {
        let returnValue = handleCancelButtonClickUtility(this._currentActiveStep, this._isNavigatedFromMyVSRX, this.template, this.pageSource);
        if (returnValue != null) {
            //BS-2185
            this.cancelVSConfiguration = true;
            this[NavigationMixin.Navigate](returnValue);
        }
    }

    /**
     * This method is used to handle event: 'orderinformationavailable' fired through 'c/c/b2b_vs_order_reference_component'
     * This method assigns the recieved collection of customer information summary to  _orderInformationSummaryCollection
     * BS-655
     * @param   event       :   Event fired from 'b2b_progressBarComponent'
     */
    handleOrderInformation(event) {
        if (event.detail != null && event.detail != undefined) {
            this._orderInformationSummaryCollection = event.detail.customerInformationSummaryCollection;
            this._preservedOrderInformationCollection = JSON.parse(JSON.stringify(this._orderInformationSummaryCollection));

            //Setting up order information summary collection into local storage as soon as updated (BS-708)
            let encodedFormattedCollection = btoa(unescape(encodeURIComponent(JSON.stringify(this._orderInformationSummaryCollection))));

            let orderInformationSummaryKey;
            if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
                orderInformationSummaryKey = VS_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE;
            } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                orderInformationSummaryKey = RX_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE;
            }
            if (orderInformationSummaryKey != null && orderInformationSummaryKey != undefined) {
                localStorage.setItem(orderInformationSummaryKey, encodedFormattedCollection);
            }
            if (this._isInitialLoadComplete != null && this._isInitialLoadComplete != undefined && this._isInitialLoadComplete == true) {
                // If initial loading is completed then preserving latest order information collection - BS-708
                this._preservedOrderInformationCollection = this._orderInformationSummaryCollection;
            }
            for (let data in this._preservedOrderInformationCollection) {
                if (this._preservedOrderInformationCollection[data].fieldName == CUSTOMER_NAME) {
                    this._previousCustomerName = this._preservedOrderInformationCollection[data].value;
                } else if (this._preservedOrderInformationCollection[data].fieldName == CLERK) {
                    this._previousClerk = this._preservedOrderInformationCollection[data].value;
                } else if (
                    this._preservedOrderInformationCollection[data].isOrderType == true &&
                    this._preservedOrderInformationCollection[data].isChecked == true
                ) {
                    this._previuousOrderType = this._preservedOrderInformationCollection[data].fieldName;
                }
            }
            const frameInformationComponent = this.template.querySelector('c-b2b_vs_rx_frame_information');
            if (frameInformationComponent) {
                frameInformationComponent.createLensConfiguratorData(); //BS-787
            }
        }
    }

    /**
     * This method is used to handle event 'updateprogressbar' fired from 'c/c/b2b_vs_order_reference_component'
     */
    handleProgressBarExplicitely(event) {
        handleProgressBarChange(event, this.template);
    }

    /**
     * This method is used to handle event 'handleloading' fired from 'c/c/b2b_vs_order_reference_component'
     */
    handleComponentLoading(event) {
        if (event.detail != null && event.detail != undefined) {
            this._isLoading = event.detail.loadingStatus;
        }
    }

    /**
     * BS-708
     * This method is used to handle event 'framesearchcomplete' fired from 'c/b2b_vs_rx_search_result_container'
     */
    handleFrameSearchCompletion(event) {
        if (event.detail != null && event.detail != undefined) {
            this._selectedFrameId = event.detail.productId;
            // Added as a part of BS-709

            if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
                // Added as a part of BS-709
                localStorage.setItem(SELECTED_FRAME_VS, this._selectedFrameId);
            } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                // Added as a part of BS-709
                localStorage.setItem(SELECTED_FRAME_RX, this._selectedFrameId);
            } //end inner if

            const selectedFrameInformation = {};
            selectedFrameInformation.productId = this._selectedFrameId;
            this._orderInformationSummaryCollection.push(selectedFrameInformation);

            let action = NEXT_ACTION;
            this._isCurrentActiveStepFetchedFromLocalStorage = operateProgressBarCollection(
                action,
                this._currentActiveStep,
                this._isCurrentActiveStepFetchedFromLocalStorage,
                this.template
            );
        }
    }

    //BS-788 capturing selected frame/product data
    handleSentSelectedProductData(event) {
        if (event.detail != null && event.detail != undefined) {
            this._productData = event.detail.productData;
            this._productData = JSON.parse(JSON.stringify(this._productData));
            if (this._productData) {
                this._frameType = this._productData.frameType;
                this._model = this._productData.model;
            }
            if (this.lensConfiguratorCollection != null && this.lensConfiguratorCollection != undefined) {
                if (this.lensConfiguratorCollection.selectedFrameSKU != this._productData.selectedFrameSKU) {
                    this.lensConfiguratorCollection.selectedRXSolution = null;
                    this.lensConfiguratorCollection.rxType = null;

                    //BS-1798 - Start
                    this.lensConfiguratorCollection.lensShapeImage = null;
                    this.lensConfiguratorCollection.shapeSelectionData = null;
                    this.lensConfiguratorCollection.selectedLensShapeId = null;
                    this.lensConfiguratorCollection.lensShape = null;
                    this.lensConfiguratorCollection.lensSize = null;
                    this.lensConfiguratorCollection.collectionDesignFamily =
                        this._productData.collectionDesignFamily != undefined ? this._productData.collectionDesignFamily : null;
                    this.lensConfiguratorCollection.frameColorDescription =
                        this._productData.frameColorDescription != undefined ? this._productData.frameColorDescription : null;
                    this.lensConfiguratorCollection.frameColor = this._productData.frameColor != undefined ? this._productData.frameColor : null;
                    this.lensConfiguratorCollection.bridgeSize = this._productData.bridgeSize != undefined ? this._productData.bridgeSize : null;
                    this.lensConfiguratorCollection.templeLength = this._productData.templeLength != undefined ? this._productData.templeLength : null; //BS-2013
                    this.clearLensConfiguratorValues(this.lensConfiguratorCollection.lensConfiguratorID, this.pageSource, FRAME_CHANGE_TRIGGERING_EVENT); //BS-1798
                    //BS-1798 - End

                    //Setting up product data into local storage as soon as updated (BS-788)
                    this.lensConfiguratorCollection = JSON.parse(JSON.stringify(this.lensConfiguratorCollection));
                    setLensConfiguratorCollection(this.lensConfiguratorCollection, this.pageSource);
                } //end if
            } //end outer if

            //Setting up product data into local storage as soon as updated (BS-788)
            let encodedFormattedCollection = btoa(unescape(encodeURIComponent(JSON.stringify(this._productData))));

            if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
                localStorage.setItem(LOCAL_PRODUCT_DATA_KEY_VS, encodedFormattedCollection);
            } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                localStorage.setItem(LOCAL_PRODUCT_DATA_KEY_RX, encodedFormattedCollection);
            } //end if
        } //end outer if
    } //end

    //BS-788 capturing lens configuator data
    handleInsertedLensConfiguratorData(event) {
        if (event.detail != null && event.detail != undefined) {
            if (event.detail.inputLensConfiguratorData) {
                if (event.detail.inputLensConfiguratorData.productFrameType !== undefined && event.detail.inputLensConfiguratorData.productFrameType !== null) {
                    this._frameType = event.detail.inputLensConfiguratorData.productFrameType;
                }
                if (event.detail.inputLensConfiguratorData.productmodel !== undefined && event.detail.inputLensConfiguratorData.productmodel !== null) {
                    this._model = event.detail.inputLensConfiguratorData.productmodel;
                }
            }
            if (event.detail.inputLensConfiguratorData.productFrameType !== undefined && event.detail.inputLensConfiguratorData.productFrameType !== null) {
                this._frameType = event.detail.inputLensConfiguratorData.productFrameType;
            }
            if (event.detail.inputLensConfiguratorData.productmodel !== undefined && event.detail.inputLensConfiguratorData.productmodel !== null) {
                this._model = event.detail.inputLensConfiguratorData.productmodel;
            }
            if (this.lensConfiguratorCollection != null && this.lensConfiguratorCollection != undefined) {
                if (
                    this.lensConfiguratorCollection.selectedFrameSKU != this._productData.selectedFrameSKU ||
                    this.lensConfiguratorCollection.customerName != this._previousCustomerName ||
                    this.lensConfiguratorCollection.clerk != this._previousClerk ||
                    this.lensConfiguratorCollection.orderType != this._previousOrderType
                ) {
                    this.lensConfiguratorData = event.detail.insertedData;

                    if (event.detail.inputLensConfiguratorData.customerName !== undefined && event.detail.inputLensConfiguratorData.customerName !== null) {
                        this.lensConfiguratorCollection.customerName = this._previousCustomerName;
                    }
                    if (event.detail.inputLensConfiguratorData.clerk !== undefined && event.detail.inputLensConfiguratorData.clerk !== null) {
                        this.lensConfiguratorCollection.clerk = this._previousClerk;
                    }
                    if (event.detail.inputLensConfiguratorData.orderType !== undefined && event.detail.inputLensConfiguratorData.orderType !== null) {
                        this.lensConfiguratorCollection.orderType = event.detail.inputLensConfiguratorData.orderType;
                        if (event.detail.inputLensConfiguratorData.orderType != LENS_ONLY) {
                            this.lensConfiguratorCollection.withoutClipIn = false;
                            this.lensConfiguratorCollection.withoutAdapter = false;
                        }
                    }
                    if (
                        event.detail.inputLensConfiguratorData.selectedFrameSKU !== undefined &&
                        event.detail.inputLensConfiguratorData.selectedFrameSKU !== null
                    ) {
                        this.lensConfiguratorCollection.selectedFrameSKU = event.detail.inputLensConfiguratorData.selectedFrameSKU;
                    }
                    if (
                        event.detail.inputLensConfiguratorData.productFrameType !== undefined &&
                        event.detail.inputLensConfiguratorData.productFrameType !== null
                    ) {
                        this._frameType = event.detail.inputLensConfiguratorData.productFrameType;
                    }
                    if (event.detail.inputLensConfiguratorData.productmodel !== undefined && event.detail.inputLensConfiguratorData.productmodel !== null) {
                        this._model = event.detail.inputLensConfiguratorData.productmodel;
                    }
                }
            } else {
                this.lensConfiguratorData = event.detail.insertedData;
                this.lensConfiguratorCollection = event.detail.inputLensConfiguratorData;
            }

            this.lensConfiguratorCollection = JSON.parse(JSON.stringify(this.lensConfiguratorCollection));

            this.lensConfiguratorCollection.productFrameType = this._frameType;
            this.lensConfiguratorCollection.productmodel = this._model;
            if (
                this.lensConfiguratorCollection != null &&
                this.lensConfiguratorCollection.variantShape !== undefined &&
                event.detail.inputLensConfiguratorData.variantShape !== undefined &&
                event.detail.inputLensConfiguratorData.variantShape !== null &&
                this.lensConfiguratorCollection.variantShape != event.detail.inputLensConfiguratorData.variantShape
            ) {
                this.lensConfiguratorCollection.variantShape = event.detail.inputLensConfiguratorData.variantShape;
            } //BS-1916
            if (
                this.lensConfiguratorCollection !== null &&
                this.lensConfiguratorCollection.shapeSize !== undefined &&
                event.detail.inputLensConfiguratorData.shapeSize !== undefined &&
                event.detail.inputLensConfiguratorData.shapeSize !== null &&
                this.lensConfiguratorCollection.shapeSize != event.detail.inputLensConfiguratorData.shapeSize
            ) {
                this.lensConfiguratorCollection.shapeSize = event.detail.inputLensConfiguratorData.shapeSize;
            } //BS-1916
            if (
                this.lensConfiguratorCollection != null &&
                this.lensConfiguratorCollection.frameType !== undefined &&
                event.detail.inputLensConfiguratorData.frameType !== undefined &&
                event.detail.inputLensConfiguratorData.frameType !== null &&
                this.lensConfiguratorCollection.frameType !== event.detail.inputLensConfiguratorData.frameType
            ) {
                this.lensConfiguratorCollection.frameType = event.detail.inputLensConfiguratorData.frameType;
            } //BS-1887
            if (
                this.lensConfiguratorCollection !== null &&
                this.lensConfiguratorCollection.rimlessVariant !== undefined &&
                event.detail.inputLensConfiguratorData.rimlessVariant !== undefined &&
                event.detail.inputLensConfiguratorData.rimlessVariant !== null &&
                this.lensConfiguratorCollection.rimlessVariant !== event.detail.inputLensConfiguratorData.rimlessVariant
            ) {
                this.lensConfiguratorCollection.rimlessVariant = event.detail.inputLensConfiguratorData.rimlessVariant;
            } //BS-1888
            if (
                this.lensConfiguratorCollection !== null &&
                this.lensConfiguratorCollection.bridgeSize !== undefined &&
                event.detail.inputLensConfiguratorData.bridgeSize !== undefined &&
                event.detail.inputLensConfiguratorData.bridgeSize !== null &&
                this.lensConfiguratorCollection.bridgeSize !== event.detail.inputLensConfiguratorData.bridgeSize
            ) {
                this.lensConfiguratorCollection.bridgeSize = event.detail.inputLensConfiguratorData.bridgeSize;
            } //BS-2015
            //Setting up product data into local storage as soon as updated (BS-788)
            setLensConfiguratorCollection(this.lensConfiguratorCollection, this.pageSource);

            this._insertedLensConfiguratorId = this.lensConfiguratorCollection.lensConfiguratorID;

            if (this._currentActiveStep.stepNumber == 4) {
                this._isLoading = true;
                this._isCurrentActiveStepFetchedFromLocalStorage = operateProgressBarCollection(
                    SAVE_NEXT_ACTION,
                    this._currentActiveStep,
                    this._isCurrentActiveStepFetchedFromLocalStorage,
                    this.template
                );
            }
        }
    } //end handleInsertedLensConfiguratorData

    //BS-724 capturing RX Solution data
    handleRXSolutionData(event) {
        if (event.detail != null && event.detail != undefined) {
            this.selectedRXSolutionData = event.detail;
            let updatedLensConfiguratorCollection = handleRxSolutionDataUpdateIntoConfigurator(event, this.lensConfiguratorCollection, this.pageSource);
            //Setting up product data into local storage as soon as updated (BS-788)
            this.lensConfiguratorCollection = JSON.parse(JSON.stringify(updatedLensConfiguratorCollection));
            setLensConfiguratorCollection(this.lensConfiguratorCollection, this.pageSource);
        } //end if
        this._isCurrentActiveStepFetchedFromLocalStorage = operateProgressBarCollection(
            SAVE_NEXT_ACTION,
            this._currentActiveStep,
            this._isCurrentActiveStepFetchedFromLocalStorage,
            this.template
        );
    } //end handleRXSolutionData

    updateLensConfiguratorByLensCollection(event) {
        this.lensConfiguratorCollection = handleLensConfiguratorByLensCollectionUpdateData(event, this.lensConfiguratorCollection);
        setLensConfiguratorCollection(this.lensConfiguratorCollection, this.pageSource);
        this._isCurrentActiveStepFetchedFromLocalStorage = operateProgressBarCollection(
            SAVE_NEXT_ACTION,
            this._currentActiveStep,
            this._isCurrentActiveStepFetchedFromLocalStorage,
            this.template
        );
    }

    handlePrescriptionValueUpdate(event) {
        let updatedLensConfiguratorCollection = handlePrescriptionValueUpdateIntoConfigurator(event, this.lensConfiguratorCollection);
        this.lensConfiguratorCollection = JSON.parse(JSON.stringify(updatedLensConfiguratorCollection));
        setLensConfiguratorCollection(this.lensConfiguratorCollection, this.pageSource);
    }

    handleCenteringDataUpdate(event) {
        let updatedLensConfiguratorCollection = handleCenteringDataUpdateIntoConfigurator(event, this.lensConfiguratorCollection);
        this.lensConfiguratorCollection = JSON.parse(JSON.stringify(updatedLensConfiguratorCollection));
        setLensConfiguratorCollection(this.lensConfiguratorCollection, this.pageSource);
    }

    /**
     * BS-728 : Used to handle event of add to cart button
     */
    async handleAddToCartButtonClick(event) {
        this._isLoading = true;
        const calculateLensComponent = this.template.querySelector(CALCULATE_LENS_COMPONENT);
        //BS-2185
        this.productsAddedToCart = true;
        if (calculateLensComponent != null && calculateLensComponent != undefined) {
            let status = await calculateLensComponent.handleSaveAndNextButtonClick();
            this.updateLensConfigurator(null);
            this.addProductsToCart();
        } else {
            this.updateLensConfigurator(null);
            this.checkEligibilityForAddToCart();
        }
    }

    /**
     * BS-728: Used to update the lens configurator.
     */
    updateLensConfigurator(applicableStatusValue) {
        let applicableStatus;
        if (applicableStatusValue != null && applicableStatusValue != undefined) {
            applicableStatus = applicableStatusValue;
        } else {
            applicableStatus = null;
        }

        //BS-572
        if (this._customerServicePrefernceChoice == undefined || this._customerServicePrefernceChoice == null) {
            this._customerServicePrefernceChoice = false;
        }
        //BS-572

        updateLensConfiguratorRecord({
            lensConfiguratorId: this._insertedLensConfiguratorId,
            specialHandlingValue: this._userInputForSpecialHandlingField,
            noteValue: this._userInputForNotesField,
            statusValue: applicableStatus,
            customerServicePreference: this._customerServicePrefernceChoice
        })
            .then((result) => {})
            .catch((exceptionInstance) => {
                console.log('error:', exceptionInstance);
                this._isLoading = false;
            });
    }

    /**
     * BS-728:  Used to check the eligibilty of item to be added to cart using Schneider callout.
     */
    checkEligibilityForAddToCart() {
        let calculateLeft = false;
        let calculateRight = false;
        if (
            this.lensConfiguratorCollection != null &&
            this.lensConfiguratorCollection != undefined &&
            this.lensConfiguratorCollection.eyeSide != null &&
            this.lensConfiguratorCollection.eyeSide != undefined
        ) {
            if (this.lensConfiguratorCollection.eyeSide == BOTH_EYE_SIDE) {
                calculateLeft = true;
                calculateRight = true;
            } else if (this.lensConfiguratorCollection.eyeSide == EYE_SIDE_LEFT) {
                calculateLeft = true;
                calculateRight = false;
            } else if (this.lensConfiguratorCollection.eyeSide == EYE_SIDE_RIGHT) {
                calculateLeft = false;
                calculateRight = true;
            }
        }
        //BS-1244
        let saveResponseToDatabase = true;
        if (
            this._currentActiveStep != undefined &&
            this._currentActiveStep != null &&
            this._currentActiveStep.stepNumber != undefined &&
            this._currentActiveStep.stepNumber != null &&
            this._currentActiveStep.stepNumber == 9
        ) {
            saveResponseToDatabase = false;
        }
        //BS-1244
        //BS-898
        validateAddToCart({
            recordId: this.lensConfiguratorCollection.lensConfiguratorID,
            applicableBrand: this.pageSource,
            applicableLanguage: LANG,
            leftValue:
                this.lensConfiguratorCollection != undefined &&
                this.lensConfiguratorCollection != null &&
                this.lensConfiguratorCollection.thicknessMatchingCalculatorLeftValue != undefined &&
                this.lensConfiguratorCollection.thicknessMatchingCalculatorLeftValue != null
                    ? this.lensConfiguratorCollection.thicknessMatchingCalculatorLeftValue
                    : null,
            rightValue:
                this.lensConfiguratorCollection != undefined &&
                this.lensConfiguratorCollection != null &&
                this.lensConfiguratorCollection.thicknessMatchingCalculatorRightValue != undefined &&
                this.lensConfiguratorCollection.thicknessMatchingCalculatorRightValue != null
                    ? this.lensConfiguratorCollection.thicknessMatchingCalculatorRightValue
                    : null,
            saveToDatabase: saveResponseToDatabase //BS-1244
        })
            .then((data) => {
                if (data != null && data != undefined) {
                    //BS-1034 - Start
                    let parsedResult = JSON.parse(JSON.stringify(data));
                    //BS-1248 - Start
                    if (parsedResult.statusCode == 200) {
                        let success =
                            parsedResult &&
                            parsedResult.schneiderSuccessResponseWrapper &&
                            parsedResult.schneiderSuccessResponseWrapper.success &&
                            String(parsedResult.schneiderSuccessResponseWrapper.success).toLowerCase() == FALSE_VALUE
                                ? false
                                : true;
                        //BS-1914 - Start
                        if (
                            success == true &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData != undefined &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData != null &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData.preCalcGuid != undefined &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData.preCalcGuid != null &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData.preCalcGuid != ''
                        ) {
                            if (this.lensConfiguratorCollection && this.lensConfiguratorCollection.selectedFrameSKU) {
                                this.addProductsToCart();
                            } else {
                                this._checkAndAddToCartDisabled = false;
                                this._isLoading = false;
                                showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null); //BS-898
                                this._showAddToCartModel = false;
                                this._addToCartSuccessfull = false;
                                this._addToCartFailed = true;
                            }
                        } else if (
                            success == true &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData != undefined &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData != null &&
                            (parsedResult.schneiderSuccessResponseWrapper.silhData.preCalcGuid == undefined ||
                                parsedResult.schneiderSuccessResponseWrapper.silhData.preCalcGuid == null ||
                                parsedResult.schneiderSuccessResponseWrapper.silhData.preCalcGuid == '')
                        ) {
                            const addToCartComponent = this.template.querySelector(ADD_TO_CART_COMPONENT);
                            addToCartComponent.showSchneiderCalloutFailureResponse(true, VISION_ZONE_CALLOUT_ERROR_MESSAGE);
                            this._isLoading = false;
                            //BS-1914 - End
                        } else if (success == false) {
                            if (
                                parsedResult.schneiderSuccessResponseWrapper.silhData &&
                                parsedResult.schneiderSuccessResponseWrapper.errorCode &&
                                parsedResult.schneiderSuccessResponseWrapper.silhData.behav &&
                                parsedResult.schneiderSuccessResponseWrapper.silhData.behav == B2B_SCHNEIDER_CALLOUT_BEHAVE_CODES.split(',')[0]
                            ) {
                                const addToCartComponent = this.template.querySelector(ADD_TO_CART_COMPONENT);
                                addToCartComponent.showSchneiderCalloutFailureResponse(
                                    true,
                                    parsedResult.schneiderSuccessResponseWrapper.silhData.infoText != undefined &&
                                        parsedResult.schneiderSuccessResponseWrapper.silhData.infoText != null
                                        ? parsedResult.schneiderSuccessResponseWrapper.silhData.infoText
                                        : ''
                                );
                                this._isLoading = false;
                            } else {
                                this._checkAndAddToCartDisabled = false;
                                showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null); //BS-898
                                this._showAddToCartModel = false;
                                this._addToCartSuccessfull = false;
                                this._addToCartFailed = true;
                                this._isLoading = false;
                            }
                        }
                    } else if (parsedResult.statusCode == 404) {
                        const addToCartComponent = this.template.querySelector(ADD_TO_CART_COMPONENT);
                        addToCartComponent.showSchneiderCalloutFailureResponse(true, B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE);
                        this._isLoading = false;
                        /* Start : BS-1706 */
                    } else if (parsedResult.statusCode >= 500) {
                        /* End : BS-1706 */
                        const addToCartComponent = this.template.querySelector(ADD_TO_CART_COMPONENT);
                        addToCartComponent.showSchneiderCalloutFailureResponse(true, B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE);
                        this._isLoading = false;
                    } else {
                        this._checkAndAddToCartDisabled = false;
                        this._isLoading = false;
                        showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null); //BS-898
                        this._showAddToCartModel = false;
                        this._addToCartSuccessfull = false;
                        this._addToCartFailed = true;
                    }
                    //BS-1248 - End
                    //BS-1034 - End
                } else {
                    //BS-1248
                    this._checkAndAddToCartDisabled = false;
                    this._isLoading = false;
                    showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null); //BS-898
                    this._showAddToCartModel = false;
                    this._addToCartSuccessfull = false;
                    this._addToCartFailed = true;
                    //BS-1248
                }
            })
            .catch((exceptionInstance) => {
                console.log('error:', exceptionInstance);
                this._isLoading = false;
                showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null); //BS-898
                this._showAddToCartModel = false;
                this._addToCartSuccessfull = false;
                this._addToCartFailed = true;
            });
    }

    /**
     * BS-728 : used to add the products into cart.
     */
    addProductsToCart() {
        addToCartForVSRX({
            communityId: communityId,
            lensConfiguratorId: this.lensConfiguratorCollection.lensConfiguratorID, //BS-1121
            quantity: APPLICABLE_QUANTITY,
            effectiveAccountId: this.accountId,
            pageSource: this.pageSource
        })
            .then(async (result) => {
                if (result != null && result != undefined) {
                    let createdCartData = result;
                    let createdCartId = createdCartData.CartId;
                    let parentCartItemId = createdCartData.Id;
                    this._parentCartId = createdCartId;
                    this.createCartItems(createdCartId, parentCartItemId);
                    let lensConfiguratorUpdateResult = await updateLensConfiguratorRecordForCartItem({
                        lensConfiguratorId: this.lensConfiguratorCollection.lensConfiguratorID,
                        cartItemId: parentCartItemId
                    });
                }
            })
            .catch((exceptionInstance) => {
                //BS-1245
                if (
                    exceptionInstance &&
                    exceptionInstance.body &&
                    exceptionInstance.body.message &&
                    exceptionInstance.body.message.includes(this.labelObject._currencyMismatchError)
                ) {
                    this.resetCart();
                }
                console.log('error:', JSON.parse(JSON.stringify(exceptionInstance)));
            });
    }

    /**
     * BS-1245
     * This method used to delete active cart associated with account of currently logged in user as currency is mismatched
     */
    resetCart() {
        resetCartForCurrencyMismatch({ effectiveAccountId: this.accountId })
            .then((result) => {
                if (result) {
                    this.addProductsToCart();
                } else {
                    this._showAddToCartModel = true;
                    this._addToCartSuccessfull = false;
                    this._addToCartFailed = true;
                    this._isLoading = false;
                }
            })
            .catch((exceptionInstance) => {
                console.log('error:', JSON.parse(JSON.stringify(exceptionInstance)));
            });
    }

    createCartItems(createdCartId, parentCartItemId) {
        let globalEntitlementPolicyNotApplicable = true;
        let applicableLensQuantity = APPLICABLE_QUANTITY; //BS-1494
        if (
            this.lensConfiguratorCollection != undefined &&
            this.lensConfiguratorCollection != null &&
            this.lensConfiguratorCollection.orderType != undefined &&
            this.lensConfiguratorCollection.orderType != null &&
            this.lensConfiguratorCollection.orderType == ORDER_TYPE_COMPLETE_EYEWEAR
        ) {
            globalEntitlementPolicyNotApplicable = true;
            applicableLensQuantity = 2; //BS-1494
        } else if (
            this.lensConfiguratorCollection != undefined &&
            this.lensConfiguratorCollection != null &&
            this.lensConfiguratorCollection.orderType != undefined &&
            this.lensConfiguratorCollection.orderType != null &&
            this.lensConfiguratorCollection.orderType != ORDER_TYPE_COMPLETE_EYEWEAR
        ) {
            globalEntitlementPolicyNotApplicable = false;
            //BS-1494
            if (this.lensConfiguratorCollection && this.lensConfiguratorCollection.eyeSide) {
                if (this.lensConfiguratorCollection.eyeSide == BOTH_EYE_SIDE) {
                    applicableLensQuantity = 2;
                } else {
                    applicableLensQuantity = APPLICABLE_QUANTITY;
                }
            }
            //BS-1494
        }
        let applicableBrand = this._isSourceRX == true ? 'EE' : 'SH';
        createCartItemsForVSRX({
            cartId: createdCartId,
            parentCartItemId: parentCartItemId, //Id of the main product
            lensConfiguratorId: this.lensConfiguratorCollection.lensConfiguratorID,
            accountId: this.accountId,
            storeName: applicableBrand,
            globalEntitlementApplicable: globalEntitlementPolicyNotApplicable,
            applicableLensQuantity: applicableLensQuantity, //BS-1494
            communityId: communityId
        })
            .then((result) => {
                if (result != null && result != undefined && result == true) {
                    this._showAddToCartModel = true;
                    this._addToCartSuccessfull = true;
                    this._addToCartFailed = false;
                    localStorage.clear(); //BS-976
                    this.updateLensConfigurator(IN_CART_STATUS);
                    this.notifyCartChanged();
                    localStorage.removeItem(LOCAL_LENS_CONFIGURATOR_DATA_KEY_RX);
                    this.navigateToCart();
                } else if (result != null && result != undefined && result == false) {
                    this._showAddToCartModel = true;
                    this._addToCartSuccessfull = false;
                    this._addToCartFailed = true;
                }
                this._isLoading = false;
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
                this._isLoading = false;
                this._showAddToCartModel = true;
                this._addToCartSuccessfull = false;
                this._addToCartFailed = true;
            });
    }

    closePopup() {
        this._showAddToCartModel = false;
    }
    notifyCartChanged() {
        this.dispatchEvent(
            new CustomEvent(CART_CHANGED_EVT, {
                bubbles: true,
                composed: true
            })
        );
    }

    //BS-728:This method is used to navigate to the cart page.
    navigateToCart(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this._parentCartId,
                objectApiName: 'WebCart',
                actionName: 'view'
            },
            // Added as a part of BS-1667
            state: {
                pageSource: this.pageSource
            }
        });
    }

    //BS-728:This method will update the lens configurator local object
    handleInputsFromAddToCartComponent(event) {
        if (event.detail != null && event.detail != undefined) {
            this._userInputForNotesField = event.detail.note;
            this._userInputForSpecialHandlingField = event.detail.specialHandlingOption;
            this._customerServicePrefernceChoice = event.detail.customerServicePreference;

            setAddToCartStorage(this._userInputForNotesField, this._userInputForSpecialHandlingField, this._customerServicePrefernceChoice, this.pageSource);
        }
    }

    //BS-727:Used to handle event fired from 'c/b2b_vs_rx_calculate_lens_component' and it captures and stores the user input for thickness matching calculator values into lens configuratpr collection
    handleLensCalculationData(event) {
        if (event.detail != null && event.detail != undefined) {
            if (event.detail.thicknessValueLeft != null && event.detail.thicknessValueLeft != undefined) {
                this.lensConfiguratorCollection.thicknessMatchingCalculatorLeftValue = event.detail.thicknessValueLeft;
            }
            if (event.detail.thicknessValueRight != null && event.detail.thicknessValueRight != undefined) {
                this.lensConfiguratorCollection.thicknessMatchingCalculatorRightValue = event.detail.thicknessValueRight;
            }
        }
    }

    //BS-727:This method is used to handle event fired from 'c/b2b_vs_rx_calculate_lens_component' and it jumps back to previous screen
    /**
     * BS-727
     * This method is used to handle event fired from 'c/b2b_vs_rx_calculate_lens_component'
     */
    navigateBackToPreviousScreen(event) {
        this.componentVisibilityObj._showCalculateLensComponent = false;
        this.lensConfiguratorCollection.isLensCalculated = false;
        setLensConfiguratorCollection(this.lensConfiguratorCollection, this.pageSource);
        showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
        const progressBarComponent = this.template.querySelector(PROGRESS_BAR_COMPONENT);
        progressBarComponent.updateProgressBar(8, true, false);
    }

    /**
     * BS-727
     * This method is used to handle event fired from 'c/b2b_vs_rx_calculate_lens_component'
     */
    handleLensCalculationDataUpdate(event) {
        if (event.detail != null && event.detail != undefined && event.detail.lensCalculationData != null && event.detail.lensCalculationData != undefined) {
            this.lensConfiguratorCollection = JSON.parse(JSON.stringify(event.detail.lensCalculationData));

            //Setting up product data into local storage as soon as updated
            setLensConfiguratorCollection(this.lensConfiguratorCollection, this.pageSource);
        }
    }

    /**
     * BS-1213
     * This method is used to handle event fired on order type change from order reference component.
     */
    handleResetLensConfigurator(event) {
        if (event.detail) {
            this._resetLensConfigurator = event.detail.resetLensConfigurator;
        }
    }

    /**
     * BS-1213
     * This method is used to reset the lensConfiguratorCollection except prescription values, customer name and clerk.
     */
    resetLensConfiguratorDataExceptPrescription() {
        resetLensConfiguratorDataExceptPrescription({ lensConfiguratorId: this.lensConfiguratorCollection.lensConfiguratorID })
            .then((result) => {
                this.lensConfiguratorCollection = resetLensConfiguratorCollectionExceptPrescription(
                    this.lensConfiguratorCollection,
                    this.labelObject._prescriptionValueFields
                );
                this._userInputForNotesField = null;
                this._userInputForSpecialHandlingField = null;
                this._customerServicePrefernceChoice = null;
            })
            .catch((error) => {
                console.error('ERROR : ', error);
            });
    }

    //BS-1034:This method is used to handle event fired from 'c/b2b_vs_rx_calculate_lens_component
    handleLensCalculationResponse(event) {
        if (event && event.detail && event.detail.schneiderCalloutFailed != undefined && event.detail.schneiderCalloutFailed != null) {
            if (event.detail.schneiderCalloutFailed == true) {
                this._isSchneiderCalloutFailed = true;
                this._checkAndAddToCartDisabled = true;
            } else {
                this._isSchneiderCalloutFailed = false;
                this._checkAndAddToCartDisabled = false;
            }
        }
    }

    setFrameTypeAndModel(event) {
        if (event.detail) {
            this._frameType = event.detail.frameType ? event.detail.frameType : '';
            this._model = event.detail.model ? event.detail.model : '';
            if (this._productData) {
                let clonedProductData = JSON.parse(JSON.stringify(this._productData));
                clonedProductData.frameType = event.detail.frameType;
                clonedProductData.model = event.detail.model;
                this._productData = JSON.parse(JSON.stringify(clonedProductData));
            }
        }
    }

    handleShapeSelectionDataUpdate(event) {
        let updatedLensConfiguratorCollection = updateShapeSelectionDataUpdate(event, this.lensConfiguratorCollection);
        this.lensConfiguratorCollection = JSON.parse(JSON.stringify(updatedLensConfiguratorCollection));
        setLensConfiguratorCollection(this.lensConfiguratorCollection, this.pageSource);
        this._isCurrentActiveStepFetchedFromLocalStorage = operateProgressBarCollection(
            SAVE_NEXT_ACTION,
            this._currentActiveStep,
            this._isCurrentActiveStepFetchedFromLocalStorage,
            this.template
        );
    }

    /**
     * BS-1798
     * This method is used to clear the values of lens configurator record depending upon the page source and triggering attribute such as orderType change/frameType change/frame change etc.
     */
    clearLensConfiguratorValues(lensConfiguratorId, pageSource, triggeringAttribute) {
        clearLensConfiguratorData({
            lensConfiguratorId: lensConfiguratorId,
            pageSource: pageSource,
            triggeringAttribute: triggeringAttribute
        })
            .then((result) => {
                if (result == true) {
                    this._isLensConfiguratorResetComplete = true;
                }
            })
            .catch((exceptionInstance) => {
                console.error('ERROR : ', exceptionInstance);
            });
    }

    //BS-1775
    async updateCurrentStepNumberLensConfigurator(lensConfiguratorCollection, currentStepNumber) {
        if (
            lensConfiguratorCollection &&
            lensConfiguratorCollection.lensConfiguratorID !== undefined &&
            lensConfiguratorCollection.lensConfiguratorID !== null
        ) {
            await updateCurrentStepNumber({
                lensConfiguratorId: lensConfiguratorCollection.lensConfiguratorID,
                currentStepNumber: currentStepNumber
            })
                .then(async (result) => {})
                .catch((exceptionInstance) => {
                    console.error(exceptionInstance);
                });
        }
    }
    showcharlimitexception(event) {
        if (this._currentActiveStep.stepNumber == 9 || this._currentActiveStep.stepNumber == 10) {
            this._isCharacterLimitExceeded = event.detail;
            if (this._isCharacterLimitExceeded || this._isSchneiderCalloutFailed) {
                this._checkAndAddToCartDisabled = true;
                if (this._isCharacterLimitExceeded) {
                    showToastMessage(this, B2B_ORDER_FIELDS_CHARACTER_LIMIT_ERROR_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
                }
            } else {
                this._checkAndAddToCartDisabled = false;
            }
        }
    }
}
