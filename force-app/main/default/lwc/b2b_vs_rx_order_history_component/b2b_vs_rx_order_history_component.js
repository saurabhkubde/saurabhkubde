import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { sortBy } from 'c/b2b_utils';

// Importing APEX
import getPicklistValuesForVSRX from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFieldPicklistValues'; //BS-978
import getVSRXConfigurationData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getVSRXConfigurationData'; //BS-978
import deleteConfiguratorRecord from '@salesforce/apex/B2B_VisionSensation_RX_Controller.deleteConfiguratorRecord'; //BS-979
import getLensConfiguratorData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensConfiguratorData'; //BS-1151
import getFrameProductValues from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFrameProductValues'; //BS-1341
import getFrameImage from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFrameImage'; //BS-1341
import getAccountData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getAccountData'; //BS-1415
import checkVSRXEligibilityFromAccount from '@salesforce/apex/B2B_CartController.checkVSRXEligibilityFromAccount'; //BS-1716
import getShapeSelectionScreenData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getShapeSelectionScreenData';
import getLensShapeDataByShapeName from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensShapeDataByShapeName';
import getCountryDateFormat from '@salesforce/apex/B2B_OrderHistoryController.getCountryDateFormat'; //BS-2142

// Importing Labels
import B2B_VS_RX_ORDER_HISTORY_FILTERS from '@salesforce/label/c.B2B_VS_RX_ORDER_HISTORY_FILTERS'; //BS-978
import B2B_VS_RX_ORDER_HISTORY_TIME_FRAME_OPTIONS from '@salesforce/label/c.B2B_VS_RX_ORDER_HISTORY_TIME_FRAME_OPTIONS'; //BS-978
import B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS from '@salesforce/label/c.B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS'; //BS-978
import B2B_VS_RX_ORDER_HISTORY_COLUMNS_OPTIONS from '@salesforce/label/c.B2B_VS_RX_ORDER_HISTORY_COLUMNS_OPTIONS'; //BS-978
import B2B_VS_RX_VALIDATION_LABELS from '@salesforce/label/c.B2B_VS_RX_VALIDATION_LABELS'; //BS-978
import LENS_SELECTION_LABELS from '@salesforce/label/c.B2B_Lens_Selection_Labels'; //BS-1417
import LENS_ONLY_AND_FRAME_PROVIDED_EXCLUDED_COUNTRY_CODES from '@salesforce/label/c.B2B_VS_RX_LENS_ONLY_AND_FRAME_PROVIDED_EXCLUDED_COUNTRY_CODES'; //BS-1415

// Importing Styling
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';

// Constant
// BS-978 and BS-979 - Start
const PAGE_SIZE = 10;
const FIRST_PAGE = 1;
const NAVIGATION_DESTINATION = 'comm__namedPage';
const ASCENDING_ORDER = 'asc';
const DESCENDING_ORDER = 'desc';
const B2B_LENS_CONFIGURATOR_API_NAME = 'B2B_Lens_Configurator__c';
const B2B_ORDER_TYPE_FIELD = 'B2B_Order_Type__c';
const B2B_STATUS_FIELD = 'B2B_Status__c';
const IN_CART_STATUS = 'In Cart';
const ALL_VALUE = 'all';
const ORDER_TYPE_FIELD = 'orderType';
const CUSTOMER_NAME_FIELD = 'customerName';
const COLLECTION_NAME_AND_NUMBER_FIELD = 'collectionNameAndNumber';
const LENS_NAME_FIELD = 'lensName';
const CREATED_DATE_FIELD = 'createdDate';
const LAST_MODIFIED_DATE_FIELD = 'lastModifiedDate';
const PERIOD_FIELD = 'period';
const STATUS_FIELD = 'status';
const ACTION_FIELD = 'action';
const SEARCH_FIELD = 'keyword';
const VS_BRAND = 'Vision Sensation';
const RX_BRAND = 'RX Glazing';
const DEFAULT_ORDER_TYPE = 'all';
const DEFAULT_STATUS = 'Open';
const DEFAULT_TIME_FRAME = '180';
const DEFAULT_SEARCH_KEYWORD = '';
const HOME_PAGE = 'home';
const CART_STATUS_CLOSED = 'Closed';
const VISION_SENSATION = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[1];
const RX_GLAZING = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[2];
const STYLING_FOR_ENABLE = 'document-enabled actionicon slds-m-right_small';
const STYLING_FOR_DISABLE = 'document-disabled actionicon slds-m-right_small';
const STANDARD_NAMED_PAGE = 'standard__namedPage';
const DATE_FORMAT = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
};
// BS-978 and BS-979 - End
const VS_RX_SUMMARY_PAGE = 'VS_RX_Summary_Page__c';
const RX_GLAZING_SITE_PAGE = 'RX__c'; //BS-997
const VISION_SENSATION_SITE_PAGE = 'VS__c'; //BS-997
const MY_VS_RX_PAGE_SOURCE_IDENTIFIER = 'fromMyVSRX'; //BS-997
const PAGE_SOURCE_VS = 'VS';
const PAGE_SOURCE = 'pageSource';
const ANTIREFLECTION_AND_HARDCOATING_SELECTION_KEY_FOR_RX = 'userSelectableOptionsForRX';
const ANTIREFLECTION_AND_HARDCOATING_SELECTION_KEY_FOR_VS = 'userSelectableOptionsForVS';
//BS-1153 start
const KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_VS = 'selectedSpecialHandlingOptionForVS';
const KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX = 'selectedSpecialHandlingOptionForRX';
const KEY_FOR_USER_NOTE_ENTERED_FOR_VS = 'userNoteForVS';
const KEY_FOR_USER_NOTE_ENTERED_FOR_RX = 'userNoteForRX';
const KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_VS = 'customerServicePreferenceForVS';
const KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX = 'customerServicePreferenceForRX';
//BS-1153 end
const LENS_ONLY_AND_FRAME_PROVIDED_ORDER_TYPE_VALUE = 'Lens Only + frame provided'; //BS-1415
const WITH_COLORED_GROOVE = 'with Colored grooves';
const REMOVE_DRILLS_VALUE = 'remove drills';
const WITH_ACCENT_RING_VALUE = 'with Accent Rings';
const STYLING_BACKGROUND_COLOR = 'background-color:';
const LENS_ONLY = 'Lens Only';
const HEX_ACCENT_RING_CONST_PRODUCT = '#3f242900;';
const PARTIAL_GROOVE_VALUE = 'With Partial Color Groove'; //BS-2137
const FIELDS_TO_LIMIT_CHARACTERS = ['orderType', 'customerName', 'collectionNameAndNumber']; //BS-2217
const CHARACTERS_LIMIT = 20; //BS-2217
export default class B2b_vs_rx_order_history_component extends NavigationMixin(LightningElement) {
    /**
     * This variable is used to hold the value selected by user for order type filter on UI
     * Default Value: All
     * BS-978
     * @type {String}
     */
    _selectedOrderType = DEFAULT_ORDER_TYPE;

    /**
     * This variable is used to hold the value selected by user for status filter on UI
     * Default Value: Open
     * BS-978
     * @type {String}
     */
    _selectedStatus = DEFAULT_STATUS;

    /**
     * This variable is used to hold the value selected by user for period filter on UI
     * Default Value: 180 (Last 6 months)
     * BS-978
     * @type {String}
     */
    _selectedTimeFrame = DEFAULT_TIME_FRAME;

    /**
     * This variable is used to hold label value of VS that needs to be shown as Tab option
     * BS-978
     * @type {String}
     */
    _labelForVS = VISION_SENSATION;

    /**
     * This variable is used to hold label value of RX that needs to be shown as Tab option
     * BS-978
     * @type {String}
     */
    _labelForRX = RX_GLAZING;

    /**
     * This variable is used to hold the value entered in text-input search field on UI
     * BS-978
     * @type {String}
     */
    _searchKeyword = DEFAULT_SEARCH_KEYWORD;

    /**
     * This variable is used to hold the applicable brand with respect to it, configurator records are fetched from database
     * BS-978
     * @type {String}
     */
    _applicableBrand;

    /**
     * This variable is used to indicate whether the current brand is RX Glazing
     * BS-978
     * @type {Boolean}
     */
    _isBrandRX = false;

    /**
     * This variable is used to indicate whether the data of configurator records are available
     * BS-978
     * @type {Boolean}
     */
    _isDataAvaialble = false;

    /**
     * This variable is used to indicate whether the data is loaded and component is ready to be shown on UI
     * BS-978
     * @type {Boolean}
     */
    _initialLoadComplete = false;

    /**
     * This variable is used to control delete popup screen that open on click of delete button
     * BS-978
     * @type {Boolean}
     */
    _showPopUpForDelete = false;

    /**
     * This variable is used to control VS Tab
     * BS-1716
     * @type {Boolean}
     */
    _isEligibleForVS = false;

    /**
     * This variable is used to control RX Tab
     * BS-1716
     * @type {Boolean}
     */
    _isEligibleForRX = false;

    /**
     * This variable is used to control RX Tab
     * BS-1716
     * @type {String}
     */
    @track
    _effectiveAccountId;

    /**
     * This variable is used to hold filter option value as 'all'
     * BS-978
     * @type {String}
     */
    _allValue = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[0];

    /**
     * This variable hold the label that needs to shown in case of no data available
     * BS-978
     * @type {String}
     */
    _noDataAvailableLabel = B2B_VS_RX_VALIDATION_LABELS.split(',')[0];

    /**
     * This variable hold the label that needs to shown as warning alert label while deleteing the record
     * BS-978
     * @type {String}
     */
    _warningMessageForDelete = B2B_VS_RX_VALIDATION_LABELS.split(',')[1];

    /**
     * This variable hold the label that needs to shown as warning information label while deleteing the record
     * BS-978
     * @type {String}
     */
    _informationMessageForDelete = B2B_VS_RX_VALIDATION_LABELS.split(',')[2];

    /**
     * This variable hold the user information that needs to shown in case of no data available
     * BS-978
     * @type {String}
     */
    _noDataAvailableInformationLabel = B2B_VS_RX_VALIDATION_LABELS.split(',')[3];

    /**
     * This variable hold the label of cancel button
     * BS-978
     * @type {String}
     */
    _cancelButtonLabel = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[3];

    /**
     * This variable hold the label of delete button
     * BS-978
     * @type {String}
     */
    _deleteButtonLabel = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[4];

    /**
     * This variable hold the URL path of delete icon
     * BS-978
     * @type {String}
     */
    _deleteIcon = STORE_STYLING + '/icons/delete.svg';

    /**
     * This variable is used to control the loading spinner on UI
     * BS-978
     * @type {String}
     */
    _isLoading;

    /**
     * This variable hold the label value of text for delete icon
     * BS-978
     * @type {String}
     */
    _deleteIconLabel = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[4];

    /**
     * This variable hold the label value of text for edit icon
     * BS-978
     * @type {String}
     */
    _editIconLabel = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[5];

    /**
     * This variable hold the label value of text for view icon
     * BS-978
     * @type {String}
     */
    _viewIconLabel = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[6];

    /**
     * This variable hold the label value of of text for clear all button
     * BS-978
     * @type {String}
     */
    _clearAllButtonLabel = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[7];

    /**
     * This variable hold the label value of continue shopoping button
     * BS-978
     * @type {String}
     */
    _continueShoppingButtonLabel = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[8];

    /**
     * This variable hold the record Id that needs to be deleted from database
     * BS-979
     * @type {String}
     */
    _recordIdToBeDeleted;

    /**
     * This collection is used to store the Lens COnfigurator records obtained from database through apex
     * This is referred as global collection/ preserved collection that will be availble for reference
     * BS-978
     * @type {Array}
     */
    _globalConfigurationDataCollection;

    /**
     * This collection is used to store order type picklist values of field: B2B_Order_Type__c present on B2B_Lens_Configurator__c
     * BS-978
     * @type {Array}
     */
    @track
    _orderTypeValuesCollection = [];

    @track
    _activeTabValue = VISION_SENSATION;

    /**
     * This collection is used to store status picklist values of field: B2B_Status__c present on B2B_Lens_Configurator__c
     * BS-978
     * @type {Array}
     */
    @track
    _statusValuesCollection = [];

    /**
     * This collection is used to store applicable filters that are available for selection on UI
     * BS-978
     * @type {Array}
     */
    @track
    _applicableFiltersCollection;

    /**
     * This collection is used to store applicable columns of datatable that is shown on UI
     * BS-978
     * @type {Array}
     */
    @track
    _applicableColumnsCollection;

    /**
     * This collection is used to store configurator records that are fetched from database through apex and that are matching the filter selection by user
     * BS-978
     * @type {Array}
     */
    @track
    _configurationDataCollection;

    @track
    _frameInformationCollection = {};
    @track
    lensConfiguratorCollectionData = {};
    @track
    _shapeSelectionCollection = {};

    @track
    _readOnlyParsedData;

    @track
    _readOnlyOriginalParsedData;

    /**
     * This variable is used to hold the value of page number
     * Default: 1st page
     * BS-978
     * @type {String}
     */
    _pageNumber = FIRST_PAGE;

    /**
     * This variable is used to hold the size of page
     * BS-978
     * @type {Integer}
     */
    _pageSize;

    /**
     * This variable is used to hold the count of total records fetched
     * BS-978
     * @type {Number}
     */
    _totalItemCount;

    /**
     * This variable is used to control the popup section for edit functionality
     * BS-997
     * @type {Boolean}
     */
    _showPopUpForEdit = false;

    /**
     * This variable is used to store the lens configurator Id of record that needs to be edited
     * BS-997
     * @type {String}
     */
    _recordIdToBeEdited;

    /**
     * This variable is used to hold the text that needs to be displayed as warning message
     * BS-997
     * @type {String}
     */
    _editInformationWarningLabel = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[9] + ', ' + B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[10];

    /**
     * This variable hold the URL path of edit icon
     * BS-997
     * @type {String}
     */
    _editIcon = STORE_STYLING + '/icons/pencil.svg';

    /**
     * This variable is use to store the key needed for local storage
     * BS-1417
     * @type {String}
     */
    applicableKeyPreservingUserSelectableOptions;
    _countryCode; //BS-1415

    _completeStepForNavigation; //BS-1175

    _selectedColoredGrooveColor = {}; //BS-1775
    _selectedAccentRingColor = {}; //BS-1775
    refreshIcon = STORE_STYLING + '/icons/refresh_icon.svg'; //BS-2175
    dateFormat; //BS-2142
    /**
     * This getter method is used to get icon for 'view' button
     * BS-978
     */
    get viewIcon() {
        return STORE_STYLING + '/hideshowpricepdp/show.svg';
    }

    /**
     * This getter method is used to get icon for 'edit' button
     * BS-978
     */
    get editIcon() {
        return STORE_STYLING + '/icons/pencil.svg';
    }

    /**
     * This getter method is used to get icon for 'delete' button
     * BS-978
     */
    get deleteIcon() {
        return STORE_STYLING + '/icons/delete-cart.svg';
    }

    /**
     * This getter method is used to get icon for 'close-icon' button
     * BS-978
     */
    get closeIcon() {
        return STORE_STYLING + '/icons/close.svg';
    }

    /**
     * This getter method is used to get the current page number of pagination component
     * BS-978
     */
    get pageNumber() {
        return this._pageNumber;
    }
    get label() {
        return {
            yesOptionLabel: LENS_SELECTION_LABELS.split(',')[11], //BS-1417
            noOptionLabel: LENS_SELECTION_LABELS.split(',')[12] //BS-1417
        };
    }

    /**
     * This getter method is used to get configurator records that needs to be shown on UI
     * BS-978
     */
    get configurationRecords() {
        let orderRecords = [];
        let counter = 0;
        this._configurationDataCollection.forEach((element) => {
            if (counter >= this._pageNumber * 10 - 10 && counter < this._pageNumber * 10) {
                orderRecords.push(element);
            }
            counter = counter + 1;
        });
        //BS-2217
        return this.addFieldValueCharacterLimit(orderRecords, FIELDS_TO_LIMIT_CHARACTERS, CHARACTERS_LIMIT);
    }

    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        try {
            // Starting the loader
            this._isLoading = true;
            this._urlPath = pageRef;
            if (this._urlPath != null && this._urlPath != undefined && this._urlPath.state != null && this._urlPath.state != undefined && this._urlPath.state) {
                let stateAttributes = Object.keys(this._urlPath.state);
                if (stateAttributes != null && stateAttributes != undefined && stateAttributes.includes(PAGE_SOURCE)) {
                    let activeTabBrand = this._urlPath.state.pageSource;
                    if (activeTabBrand == PAGE_SOURCE_VS) {
                        this._activeTabValue = this._labelForVS;
                    } else {
                        this._activeTabValue = this._labelForRX;
                    }
                }
            }
            window.history.replaceState({}, document.title, location.protocol + '//' + location.host + location.pathname);
        } catch (exceptionInstance) {
            this._isLoading = false;
            console.error(exceptionInstance);
        }
    }

    connectedCallback() {
        // Turning on the loading spinner
        this._isLoading = true;
        // Invoking getOrderTypeValues() that will fetch order type picklist values
        //BS-1415 start
        this.getAccountData().then(() => {
            this.checkEligibilityForVisionSensationEvilEyeRX();
        });
        //BS-1415 End
    }

    /**
     * handle pagejump as per BS-2128
     */
    handlePageJump(event) {
        this._pageNumber = event.detail;
    }

    /**
     * This method is used to handle event fired from paginator component for jumping to next page
     * BS-978
     */
    handleNextPage(evt) {
        this._pageNumber = this._pageNumber + 1;
    }

    /**
     * This method is used to handle event fired from paginator component for jumping to previous page
     * BS-978
     */
    handlePreviousPage(evt) {
        this._pageNumber = this._pageNumber - 1;
    }

    /**
     * This method is used to redirect the user to home page on click of 'Continue Shopping' button
     * BS-978
     */
    handleRedirectToHome() {
        //Navigate to home page
        this[NavigationMixin.Navigate]({
            type: STANDARD_NAMED_PAGE,
            attributes: {
                pageName: HOME_PAGE
            }
        });
    }

    /**
     * This method is used to handle tab selection event on UI
     * BS-978
     */
    handleTabSelection(event) {
        if (event.target.value != null && event.target.value != undefined) {
            this._isLoading = true; // Turning on loading spinner
            let applicableBrand = event.target.value; //Getting value of current active tab

            //Checking whether switched tab is VS
            if (applicableBrand == VISION_SENSATION) {
                // If switched tab is VS then setting it as applicable brand and fetching configurator records that are of VS type
                this._applicableBrand = VS_BRAND;
                this._isBrandRX = false;
                this.applicableKeyPreservingUserSelectableOptions = ANTIREFLECTION_AND_HARDCOATING_SELECTION_KEY_FOR_VS;
                this.getConfigurationData();
            } else if (applicableBrand == RX_GLAZING) {
                // Else switched tab is RX then setting it as applicable brand and fetching configurator records that are of RX type
                this._applicableBrand = RX_BRAND;
                this._isBrandRX = true;
                this.applicableKeyPreservingUserSelectableOptions = ANTIREFLECTION_AND_HARDCOATING_SELECTION_KEY_FOR_RX;
                this.getConfigurationData();
            }
        }
        // On switch of tab, redirect user to 1st page
        this._pageNumber = FIRST_PAGE;
    }

    /**
     * This method is used to fetch order type picklist values of field: B2B_Order_Type__c present on B2B_Lens_Configurator__c
     * BS-978
     */
    getOrderTypeValues() {
        // Fetching picklist values
        getPicklistValuesForVSRX({ objectApiName: B2B_LENS_CONFIGURATOR_API_NAME, picklistField: B2B_ORDER_TYPE_FIELD })
            .then((data) => {
                if (data != null && data != undefined) {
                    let fetchedOrderTypeValues = JSON.parse(JSON.stringify(data));
                    let lensOnlyAndFramesProvidedCountryCodeList = LENS_ONLY_AND_FRAME_PROVIDED_EXCLUDED_COUNTRY_CODES.split(','); //BS-1415
                    // Pushing the fetched values into '_orderTypeValuesCollection' so that they can be available as filter option for selection on UI
                    this._orderTypeValuesCollection.push({ label: this._allValue, value: ALL_VALUE });
                    fetchedOrderTypeValues.picklistValues.forEach((value) => {
                        let applicableValues = {};
                        applicableValues.label = value.picklistValue;
                        applicableValues.value = value.apiName;
                        //BS-1415 Start
                        if (value.apiName === LENS_ONLY_AND_FRAME_PROVIDED_ORDER_TYPE_VALUE) {
                            if (lensOnlyAndFramesProvidedCountryCodeList.includes(this._countryCode) === false) {
                                this._orderTypeValuesCollection.push(applicableValues);
                            }
                        } else {
                            this._orderTypeValuesCollection.push(applicableValues);
                        }
                        //BS-1415 End
                    });
                    this.getStatusValues();
                }
            })
            .catch((execptionInstance) => {
                this._isLoading = false;
                console.error(execptionInstance);
            });
    }

    /**
     * This method is used to fetch order type picklist values of field: B2B_Order_Type__c present on B2B_Lens_Configurator__c
     * BS-978
     */
    getStatusValues() {
        // Fetching picklist values
        getPicklistValuesForVSRX({ objectApiName: B2B_LENS_CONFIGURATOR_API_NAME, picklistField: B2B_STATUS_FIELD })
            .then((data) => {
                let fetchedStatusValues = JSON.parse(JSON.stringify(data));
                // Pushing the fetched values into '_statusValuesCollection' so that they can be available as filter option for selection on UI
                this._statusValuesCollection.push({ label: this._allValue, value: ALL_VALUE });
                fetchedStatusValues.picklistValues.forEach((value) => {
                    if (value.apiName != IN_CART_STATUS) {
                        let applicableValues = {};
                        applicableValues.label = value.picklistValue;
                        applicableValues.value = value.apiName;
                        this._statusValuesCollection.push(applicableValues);
                    }
                });
                this.doInitialSetup();
            })
            .catch((execptionInstance) => {
                this._isLoading = false;
                console.error(execptionInstance);
            });
    }

    /**
     * This method is used to create filter, filter options and columns that needs to be shown on UI
     * BS-978
     */
    doInitialSetup() {
        let applicableFiltersCollection = [];

        //Iterating over the custom label values stored as filters and preparing the filter collection
        for (let i = 0; i < B2B_VS_RX_ORDER_HISTORY_FILTERS.split(',').length; i++) {
            const applicableFilter = {};
            applicableFilter.label = B2B_VS_RX_ORDER_HISTORY_FILTERS.split(',')[i]; //Label: this attribute represents the label to be shown on UI
            applicableFilter.apiName = ''; //apiName: this attribute represents the value that is needed for backend logic development
            applicableFilter.value = ''; //apiName: this attribute represents the filter value
            applicableFilter.isOrderType = false; //isOrderType: this attribute represents whether the filter is: order type
            applicableFilter.isStatusType = false; //isStatusType: this attribute represents whether the filter is: status
            applicableFilter.isPeriodType = false; //isPeriodType: this attribute represents whether the filter is: period
            applicableFilter.isSearchType = false; //isSearchType: this attribute represents whether the filter is: keyword search
            applicableFilter.isDropdown = false; //isDropdown: this attribute represents whether the filter is of dropdown type
            applicableFilter.isKeywordSearch = false; //isKeywordSearch: this attribute represents whether the filter is of keyword search type
            applicableFilter.isButton = false; //isButton: this attribute represents button
            applicableFilter.availableOptions = [];
            if (i == 0) {
                // This block is for order type filter
                applicableFilter.isOrderType = true;
                applicableFilter.isDropdown = true;
                applicableFilter.apiName = ORDER_TYPE_FIELD;
                applicableFilter.availableOptions = this._orderTypeValuesCollection;
            } else if (i == 1) {
                // This block is for status filter
                applicableFilter.isStatusType = true;
                applicableFilter.isDropdown = true;
                applicableFilter.apiName = STATUS_FIELD;
                applicableFilter.availableOptions = this._statusValuesCollection;
            } else if (i == 2) {
                // This block is for period filter
                applicableFilter.isPeriodType = true;
                applicableFilter.isDropdown = true;
                applicableFilter.apiName = PERIOD_FIELD;
                for (let i = 0; i < B2B_VS_RX_ORDER_HISTORY_TIME_FRAME_OPTIONS.split(',').length; i++) {
                    let applicableValues = {};
                    applicableValues.label = B2B_VS_RX_ORDER_HISTORY_TIME_FRAME_OPTIONS.split(',')[i];
                    applicableValues.value = false;

                    // Storing the values of filter options in days
                    if (i == 0) {
                        applicableValues.value = '30'; // Last 1 month : 30 days
                    } else if (i == 1) {
                        applicableValues.value = '90'; // Last 3 months : 90 days
                    } else if (i == 2) {
                        applicableValues.value = '180'; // Last 6 months : 180 days
                    } else if (i == 3) {
                        applicableValues.value = '365'; // Last 12 months : 365 days
                    } else if (i == 4) {
                        applicableValues.value = '730'; // Last 24 months : 730 days
                    }
                    applicableFilter.availableOptions.push(applicableValues);
                }
            } else if (i == 3) {
                // This block is for keyword search filters
                applicableFilter.isSearchType = true;
                applicableFilter.isKeywordSearch = true;
                applicableFilter.apiName = SEARCH_FIELD; // Setting up default value of search keyword
            } else if (i == 4) {
                // This block is for button
                applicableFilter.isButton = true;
            }
            applicableFiltersCollection.push(applicableFilter);
        }
        this._applicableFiltersCollection = applicableFiltersCollection;

        let availableColumns = [];
        //Iterating over the custom label values stored as columns and preparing the columns collection
        for (let i = 0; i < B2B_VS_RX_ORDER_HISTORY_COLUMNS_OPTIONS.split(',').length; i++) {
            let displayColumn = {};
            displayColumn.label = B2B_VS_RX_ORDER_HISTORY_COLUMNS_OPTIONS.split(',')[i]; //Label: this attribute represents the label of column to be shown on UI
            displayColumn.name = ''; //name: this attribute represents the apiName of column to be used for backend development
            displayColumn.isOrderType = false; //isOrderType: this attribute indicates column: order type
            displayColumn.isCustomerNameType = false; //isCustomerNameType: this attribute indicates column: customer name
            displayColumn.isCollectionNameType = false; //isCollectionNameType: this attribute indicates column: collection name and number
            displayColumn.isLensNameType = false; //isCollectionNameType: this attribute indicates column: lens type
            displayColumn.isCreatedDate = false; //isCollectionNameType: this attribute indicates column: created date
            displayColumn.isLastModifiedType = false; //isCollectionNameType: this attribute indicates column: last modified
            displayColumn.isStatusType = false; //isStatusType: this attribute indicates column: status
            displayColumn.isActionType = false; //isActionType: this attribute indicates column: action
            displayColumn.isAscending = false; //isAscending: this attribute indicates whether the column is sorted in ascending order
            displayColumn.isDescending = false; //isDescending: this attribute indicates whether the column is sorted in descending order
            displayColumn.labelSecondLine = null; //labelSecondLine: this attribute will have the second part of label if label is too long

            if (i == 0) {
                displayColumn.name = ORDER_TYPE_FIELD;
                displayColumn.isOrderType = true;
            } else if (i == 1) {
                displayColumn.name = CUSTOMER_NAME_FIELD;
                let originialLabel = displayColumn.label;
                displayColumn.label = originialLabel.includes('/') ? originialLabel.split('/')[0] + '/' : originialLabel;
                displayColumn.labelSecondLine = originialLabel.includes('/') ? originialLabel.split('/')[1] : null;
                displayColumn.isCustomerNameType = true;
            } else if (i == 2) {
                displayColumn.name = COLLECTION_NAME_AND_NUMBER_FIELD;
                displayColumn.isCollectionNameType = true;
            } else if (i == 3) {
                displayColumn.name = LENS_NAME_FIELD;
                displayColumn.isLensNameType = true;
            } else if (i == 4) {
                displayColumn.name = CREATED_DATE_FIELD;
                displayColumn.isCreatedDate = true;
            } else if (i == 5) {
                displayColumn.name = LAST_MODIFIED_DATE_FIELD;
                displayColumn.isLastModifiedType = true;
                displayColumn.isDescending = true;
            } else if (i == 6) {
                displayColumn.name = STATUS_FIELD;
                displayColumn.isStatusType = true;
            } else if (i == 7) {
                displayColumn.name = ACTION_FIELD;
                displayColumn.isActionType = true;
            }
            displayColumn.isActionType = false;
            if (i == 7) {
                displayColumn.isActionType = true;
            }
            availableColumns.push(displayColumn);
        }
        this._applicableColumnsCollection = availableColumns;
        this.getConfigurationData();
    }

    /**
     * This method is used to fetch B2B_Lens_Configurator__c records from database accoridng to applicable filter values
     * BS-978
     */
    getConfigurationData() {
        // Fetching B2B_Lens_Configurator__c records
        getVSRXConfigurationData({
            applicableBrand: this._applicableBrand,
            selectedOrderType: this._selectedOrderType,
            selectedStatus: this._selectedStatus,
            selectedTimeframe: this._selectedTimeFrame
        })
            .then((data) => {
                if (data != null && data != undefined) {
                    let parsedData = JSON.parse(JSON.stringify(data));
                    parsedData.forEach((record) => {
                        // Checking whether the cart status is not 'Closed'
                        if ((record.status == CART_STATUS_CLOSED) == false) {
                            // If cart status is not closed then applying regular styling i.e., all icons and buttons will be enabled and clickable
                            record.statusStyling = STYLING_FOR_ENABLE;
                            record.isDisabled = false;
                        } else if (record.status == CART_STATUS_CLOSED) {
                            // Else if cart status is closed then applying disabled styling i.e., edit icon and button will be disabled and not clickable
                            record.statusStyling = STYLING_FOR_DISABLE;
                            record.isDisabled = true;
                        }
                        // Replacing picklist labels according to language of current user
                        this._statusValuesCollection.forEach((picklist) => {
                            if (record.status == picklist.value) {
                                record.status = picklist.label;
                            }
                        });
                        // Formatting created date and last modified date in displable format
                        // BS-2142
                        record.displayableCreatedDate = new Intl.DateTimeFormat(this.dateFormat, DATE_FORMAT).format(new Date(record.createdDate));
                        record.displayableLastModifiedDate = new Intl.DateTimeFormat(this.dateFormat, DATE_FORMAT).format(new Date(record.lastModifiedDate));
                    });

                    // By default sorting should: Last Modified Date Descending
                    let cloneData = [...parsedData]; // Taking a deep copy of collection
                    let sortableField = LAST_MODIFIED_DATE_FIELD; // Setting sortable field to: Last Modified date
                    cloneData.sort(sortBy(sortableField, -1)); // Performing sorting operarion by invoking sortBy() function. -1 indicates: Descending direction

                    // Assigning the formatted and sorted collection to _configurationDataCollection
                    this._configurationDataCollection = JSON.parse(JSON.stringify(cloneData));
                    this._globalConfigurationDataCollection = JSON.parse(JSON.stringify(cloneData)); // Preserving the fetched collection for further user

                    let parsedConfigurationData = JSON.parse(JSON.stringify(this._globalConfigurationDataCollection));
                    let resultedConfigurationDataCollection = [];

                    // Checking whether fetched records are matching with the search keyword entered by user
                    parsedConfigurationData.forEach((record) => {
                        if (
                            record.customerName != null &&
                            record.customerName != undefined &&
                            (record.customerName.toLowerCase().includes(this._searchKeyword.toLowerCase()) ||
                                record.collectionNameAndNumber.toLowerCase().includes(this._searchKeyword.toLowerCase()) ||
                                record.lensName.toLowerCase().includes(this._searchKeyword.toLowerCase()))
                        ) {
                            resultedConfigurationDataCollection.push(record);
                        }
                    });

                    this._configurationDataCollection = resultedConfigurationDataCollection;
                    this._pageSize = PAGE_SIZE;
                    this._totalItemCount = this._configurationDataCollection.length;
                    if (this._totalItemCount > 0) {
                        this._isDataAvaialble = true;
                    } else {
                        this._isDataAvaialble = false;
                    }
                    this._initialLoadComplete = true;
                    this._isLoading = false;
                } else {
                    this._initialLoadComplete = true;
                    this._isDataAvaialble = false;
                    this._isLoading = false;
                }
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                this._isLoading = false;
            });
    }

    /**
     * This method is used to handle sorting according to field and accoridnf to sorting preference selected by user on UI
     * BS-978
     */
    handleSort(event) {
        if (event.target != null && event.target != undefined && event.target.name != ACTION_FIELD) {
            this._isLoading = true;
            let parsedColumnsCollection = JSON.parse(JSON.stringify(this._applicableColumnsCollection));

            // Iterating over the columns collection and setting isAscending and isDescending attributes to false
            parsedColumnsCollection.forEach((data) => {
                data.isAscending = false;
                data.isDescending = false;
            });

            let sortableField = event.target.name; // Sortable field
            let sortByAscending = event.target.dataset.ascending == 'true' ? true : false; // Whether sort direction of field to be sorted is ascending
            let sortByDescending = event.target.dataset.descending == 'false' ? false : false; // Whether sort direction of field to be sorted is descending
            let sortDirection; // applicable sort direction

            // If field is previosuly sorted by ascending order then now it should sorted in descending order
            if (sortByAscending == true && sortByDescending == false) {
                sortByAscending = false;
                sortByDescending = true;
                sortDirection = DESCENDING_ORDER;

                // If field is previosuly sorted by descending order then now it should sorted in ascending order
            } else if (sortByAscending == false && sortByDescending == true) {
                sortByAscending = true;
                sortByDescending = false;
                sortDirection = ASCENDING_ORDER;

                // If field is previosuly not sorted then initially sortinng it in ascending order
            } else if (sortByAscending == false && sortByDescending == false) {
                sortByAscending = true;
                sortByDescending = false;
                sortDirection = ASCENDING_ORDER;
            }
            this._pageNumber = FIRST_PAGE;
            const cloneData = [...this._configurationDataCollection];

            // Invoking sortBy function from b2b_utils and providing sortable field and sorting direction
            cloneData.sort(sortBy(sortableField, sortDirection == ASCENDING_ORDER ? 1 : -1));

            // Iterating over columns collection and setting the sort attributes of sortable field
            parsedColumnsCollection.forEach((data) => {
                if (data.name == sortableField) {
                    data.isAscending = sortByAscending;
                    data.isDescending = sortByDescending;
                }
            });
            this._applicableColumnsCollection = parsedColumnsCollection;
            this._configurationDataCollection = cloneData;
            this._isLoading = false;
        }
    }

    /**
     * This method is used to rectify the configurator records that are matching the filter options selected by user on UI
     * BS-978
     */
    handleFilterSelection(event) {
        if (
            event.target != null &&
            event.target != undefined &&
            event.target.name != null &&
            event.target.name != undefined &&
            event.target.value != null &&
            event.target.value != undefined
        ) {
            this._isLoading = true;
            let filterName = event.target.name; // Name of field of filter
            let filterValue = event.target.value; // Value selected by user as filte option
            this._pageNumber = FIRST_PAGE;

            if (filterName == ORDER_TYPE_FIELD) {
                this._selectedOrderType = filterValue;
            } else if (filterName == STATUS_FIELD) {
                this._selectedStatus = filterValue;
            } else if (filterName == PERIOD_FIELD) {
                this._selectedTimeFrame = filterValue;
            } else if (filterName == SEARCH_FIELD) {
                this._searchKeyword = filterValue;
            }
            // If field is or type keyword search then iterating over configurator records and checking whether collection contains the records that matches the keyword
            if (filterName == SEARCH_FIELD) {
                let parsedConfigurationData = JSON.parse(JSON.stringify(this._globalConfigurationDataCollection));
                let resultedConfigurationDataCollection = [];
                this._configurationDataCollection = [];
                parsedConfigurationData.forEach((record) => {
                    if (
                        //BS-997 : Added null and empty checks
                        (record.customerName != null &&
                            record.customerName != undefined &&
                            record.customerName.toLowerCase().includes(this._searchKeyword.toLowerCase())) ||
                        (record.collectionNameAndNumber != null &&
                            record.collectionNameAndNumber != undefined &&
                            record.collectionNameAndNumber.toLowerCase().includes(this._searchKeyword.toLowerCase())) ||
                        (record.lensName != null && record.lensName != undefined && record.lensName.toLowerCase().includes(this._searchKeyword.toLowerCase()))
                    ) {
                        resultedConfigurationDataCollection.push(record);
                    }
                });
                if (
                    resultedConfigurationDataCollection != null &&
                    resultedConfigurationDataCollection != undefined &&
                    resultedConfigurationDataCollection.length > 0
                ) {
                    this._isDataAvaialble = true;
                    this._totalItemCount = resultedConfigurationDataCollection.length;
                    this._configurationDataCollection = resultedConfigurationDataCollection;
                    this._initialLoadComplete = true;
                    this._isLoading = false;
                } else {
                    this._totalItemCount = 0;
                    this._isDataAvaialble = false;
                    this._isLoading = false;
                }
            } else {
                this.getConfigurationData();
            }
        }
    }

    /**
     * This method is used to clear out all the selected filters and reset it to initial state
     * BS-978
     */
    handleClearAll(event) {
        //Resetting the filters with default values as clear all button is clicked by user and invoking getConfigurationData();
        this._isLoading = true;
        this._pageNumber = FIRST_PAGE;
        this._selectedOrderType = DEFAULT_ORDER_TYPE;
        this._selectedStatus = DEFAULT_STATUS;
        this._selectedTimeFrame = DEFAULT_TIME_FRAME;
        this._searchKeyword = DEFAULT_SEARCH_KEYWORD;
        this.getConfigurationData();
    }

    /**
     * This method is used to show the popup for deletion of configurator record on click of delete button
     * BS-979
     */
    handleShowPopup(event) {
        this._recordIdToBeDeleted = event.target.dataset.id;
        this._showPopUpForDelete = true;
    }

    /**
     * This method is used to close the popup either on click of cancel button or cross icon present on popup screen
     * BS-979
     */
    closePopup() {
        this._showPopUpForDelete = false;
        this._showPopUpForEdit = false;
    }

    /**
     * This method is used to delete the selected configurator record from database through apex
     * BS-979
     */
    handleDeleteRecord(event) {
        this._isLoading = true;
        deleteConfiguratorRecord({ recordId: this._recordIdToBeDeleted })
            .then((data) => {
                this.getConfigurationData();
                this._showPopUpForDelete = false;
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
            });
    }

    /**
     * This method is will handle the redirection of the users
     * to the summary page of RX
     * BS-1094
     */
    navigateToVsRxSummaryPage(event) {
        let lensConfiguratorId = event.target.dataset.id;
        this[NavigationMixin.GenerateUrl]({
            type: NAVIGATION_DESTINATION,
            attributes: {
                name: VS_RX_SUMMARY_PAGE
            },
            state: {
                recordId: lensConfiguratorId,
                brand: this._applicableBrand
            }
        }).then((url) => {
            window.open(url, '_blank');
        });
    }

    /**
     * This method is used to handle edit record functionality when user clicks on edit icon on UI
     * BS-997
     */
    handleEditButtonClick(event) {
        this._showPopUpForEdit = true;
        if (
            event.target != null &&
            event.target != undefined &&
            event.target.dataset != null &&
            event.target.dataset != undefined &&
            event.target.dataset.id != null &&
            event.target.dataset.id != undefined
        ) {
            this._recordIdToBeEdited = event.target.dataset.id;
        }
    }

    /**
     * This method is used to edit the selected configurator record
     * BS-997
     */
    handleEditAction(event) {
        this._isLoading = true;
        if (this._recordIdToBeEdited != null && this._recordIdToBeEdited != undefined && this._recordIdToBeEdited != '') {
            this.getLensConfiguratorData(this._recordIdToBeEdited);
        }
    }

    /**
     * BS-997
     * this methods fetchs all fields data needed for the summary screen
     * from the lens configurator object
     */
    async getLensConfiguratorData(lensConfiguratorRecordId) {
        await getLensConfiguratorData({
            lensConfiguratorId: lensConfiguratorRecordId,
            isReadOnlyPage: false
        })
            .then(async (data) => {
                let lensConfiguratorInformationCollection = JSON.parse(JSON.stringify(data));
                let lensConfiguratorInformation = lensConfiguratorInformationCollection[0];
                // Capturing the data fetched from backend the Constructing and Restructing the data into object format that needs to pass to VS-RX Configurator
                let lensConfiguratorObject = {};
                lensConfiguratorObject.accountId =
                    lensConfiguratorInformation.B2B_Account__c != null &&
                    lensConfiguratorInformation.B2B_Account__c != undefined &&
                    lensConfiguratorInformation.B2B_Account__c != ''
                        ? lensConfiguratorInformation.B2B_Account__c
                        : null; //Populating custom field :B2B_Account__c
                lensConfiguratorObject.collectionDesignFamily =
                    lensConfiguratorInformation.B2B_Frame_Collection__c != null &&
                    lensConfiguratorInformation.B2B_Frame_Collection__c != undefined &&
                    lensConfiguratorInformation.B2B_Frame_Collection__c != ''
                        ? lensConfiguratorInformation.B2B_Frame_Collection__c
                        : null; //Populating custom field :B2B_Frame_Collection__c
                lensConfiguratorObject.selectedFrameSKU =
                    lensConfiguratorInformation.B2B_Selected_Frame__c != null &&
                    lensConfiguratorInformation.B2B_Selected_Frame__c != undefined &&
                    lensConfiguratorInformation.B2B_Selected_Frame__c != ''
                        ? lensConfiguratorInformation.B2B_Selected_Frame__c
                        : null; //Populating custom field :B2B_Selected_Frame__c
                lensConfiguratorObject.frameColor = null; // Frame
                lensConfiguratorObject.frameColorDescription = null; // Frame
                lensConfiguratorObject.bridgeSize =
                    lensConfiguratorInformation.B2B_Bridge__c != null &&
                    lensConfiguratorInformation.B2B_Bridge__c != undefined &&
                    lensConfiguratorInformation.B2B_Bridge__c != ''
                        ? lensConfiguratorInformation.B2B_Bridge__c
                        : null; //Populating custom field :B2B_Bridge__c
                lensConfiguratorObject.templeLength =
                    lensConfiguratorInformation.B2B_Temple__c != null &&
                    lensConfiguratorInformation.B2B_Temple__c != undefined &&
                    lensConfiguratorInformation.B2B_Temple__c != ''
                        ? lensConfiguratorInformation.B2B_Temple__c
                        : null; //Populating custom field :B2B_Temple__c
                lensConfiguratorObject.lensSize =
                    lensConfiguratorInformation.B2B_Lens_Size__c != null &&
                    lensConfiguratorInformation.B2B_Lens_Size__c != undefined &&
                    lensConfiguratorInformation.B2B_Lens_Size__c != ''
                        ? lensConfiguratorInformation.B2B_Lens_Size__c.toString()
                        : null; //Populating custom field :B2B_Lens_Size__c
                lensConfiguratorObject.eeSize = null;
                lensConfiguratorObject.status =
                    lensConfiguratorInformation.B2B_Status__c != null &&
                    lensConfiguratorInformation.B2B_Status__c != undefined &&
                    lensConfiguratorInformation.B2B_Status__c != ''
                        ? lensConfiguratorInformation.B2B_Status__c
                        : null; //Populating custom field :B2B_Status__c
                lensConfiguratorObject.customerName =
                    lensConfiguratorInformation.B2B_Customer_Name__c != null &&
                    lensConfiguratorInformation.B2B_Customer_Name__c != undefined &&
                    lensConfiguratorInformation.B2B_Customer_Name__c != ''
                        ? lensConfiguratorInformation.B2B_Customer_Name__c
                        : null; //Populating custom field :B2B_Customer_Name__c
                lensConfiguratorObject.clerk =
                    lensConfiguratorInformation.B2B_Clerk__c != null &&
                    lensConfiguratorInformation.B2B_Clerk__c != undefined &&
                    lensConfiguratorInformation.B2B_Clerk__c != ''
                        ? lensConfiguratorInformation.B2B_Clerk__c
                        : null; //Populating custom field :B2B_Clerk__c
                lensConfiguratorObject.orderType =
                    lensConfiguratorInformation.B2B_Order_Type__c != null &&
                    lensConfiguratorInformation.B2B_Order_Type__c != undefined &&
                    lensConfiguratorInformation.B2B_Order_Type__c != ''
                        ? lensConfiguratorInformation.B2B_Order_Type__c
                        : null; //Populating custom field :B2B_Order_Type__c
                lensConfiguratorObject.frameType =
                    lensConfiguratorInformation.B2B_Frame_Type__c != null &&
                    lensConfiguratorInformation.B2B_Frame_Type__c != undefined &&
                    lensConfiguratorInformation.B2B_Frame_Type__c != ''
                        ? lensConfiguratorInformation.B2B_Frame_Type__c
                        : null; //Populating custom field :B2B_Frame_Type__c
                lensConfiguratorObject.applicableBrand =
                    lensConfiguratorInformation.B2B_Type__c != null &&
                    lensConfiguratorInformation.B2B_Type__c != undefined &&
                    lensConfiguratorInformation.B2B_Type__c != ''
                        ? lensConfiguratorInformation.B2B_Type__c
                        : null; //Populating custom field :B2B_Type__c
                lensConfiguratorObject.lensConfiguratorID = lensConfiguratorRecordId;
                lensConfiguratorObject.lensType =
                    lensConfiguratorInformation.B2B_Lens_Type__c != null &&
                    lensConfiguratorInformation.B2B_Lens_Type__c != undefined &&
                    lensConfiguratorInformation.B2B_Lens_Type__c != ''
                        ? lensConfiguratorInformation.B2B_Lens_Type__c
                        : null; //Populating custom field :B2B_Lens_Type__c
                lensConfiguratorObject.lensIndex =
                    lensConfiguratorInformation.B2B_Lens_Index__c != null &&
                    lensConfiguratorInformation.B2B_Lens_Index__c != undefined &&
                    lensConfiguratorInformation.B2B_Lens_Index__c != ''
                        ? lensConfiguratorInformation.B2B_Lens_Index__c
                        : null; //Populating custom field :B2B_Lens_Index__c
                lensConfiguratorObject.antireflectionSKU =
                    lensConfiguratorInformation.B2B_Antireflection_SKU__c != null &&
                    lensConfiguratorInformation.B2B_Antireflection_SKU__c != undefined &&
                    lensConfiguratorInformation.B2B_Antireflection_SKU__c != ''
                        ? lensConfiguratorInformation.B2B_Antireflection_SKU__c
                        : null; //Populating custom field :B2B_Antireflection_SKU__c
                lensConfiguratorObject.productMaterial = null; //
                lensConfiguratorObject.withEvilEyeEdge =
                    lensConfiguratorInformation.B2B_Evil_Eye_Edge__c != null &&
                    lensConfiguratorInformation.B2B_Evil_Eye_Edge__c != undefined &&
                    lensConfiguratorInformation.B2B_Evil_Eye_Edge__c != ''
                        ? lensConfiguratorInformation.B2B_Evil_Eye_Edge__c
                        : false; //Populating custom field :B2B_Evil_Eye_Edge__c
                lensConfiguratorObject.selectedRXSolution =
                    lensConfiguratorInformation.B2B_RX_Solution__c != null &&
                    lensConfiguratorInformation.B2B_RX_Solution__c != undefined &&
                    lensConfiguratorInformation.B2B_RX_Solution__c != ''
                        ? lensConfiguratorInformation.B2B_RX_Solution__c
                        : null; //Populating custom field :B2B_RX_Solution__c
                lensConfiguratorObject.rxType =
                    lensConfiguratorInformation.B2B_RX_Type__c != null &&
                    lensConfiguratorInformation.B2B_RX_Type__c != undefined &&
                    lensConfiguratorInformation.B2B_RX_Type__c != ''
                        ? lensConfiguratorInformation.B2B_RX_Type__c
                        : null; //Populating custom field :B2B_RX_Type__c
                lensConfiguratorObject.selectedRXSolutionSKU =
                    lensConfiguratorInformation.B2B_Selected_RX_Solution_SKU__c != null &&
                    lensConfiguratorInformation.B2B_Selected_RX_Solution_SKU__c != undefined &&
                    lensConfiguratorInformation.B2B_Selected_RX_Solution_SKU__c != ''
                        ? lensConfiguratorInformation.B2B_Selected_RX_Solution_SKU__c
                        : null; //Populating custom field :B2B_Selected_RX_Solution_SKU__c
                lensConfiguratorObject.selectedRxTypeColor =
                    lensConfiguratorInformation.B2B_Selected_RX_Solution_Color__c != null &&
                    lensConfiguratorInformation.B2B_Selected_RX_Solution_Color__c != undefined &&
                    lensConfiguratorInformation.B2B_Selected_RX_Solution_Color__c != ''
                        ? lensConfiguratorInformation.B2B_Selected_RX_Solution_Color__c
                        : null; //Populating custom field :B2B_Selected_RX_Solution_Color__c
                lensConfiguratorObject.selectedFrameVariantShape =
                    lensConfiguratorInformation.B2B_Variant_Shape__c != null &&
                    lensConfiguratorInformation.B2B_Variant_Shape__c != undefined &&
                    lensConfiguratorInformation.B2B_Variant_Shape__c != ''
                        ? lensConfiguratorInformation.B2B_Variant_Shape__c
                        : null; //Populating custom field :B2B_Variant_Shape__c
                lensConfiguratorObject.selectedFrameBridgeSize =
                    lensConfiguratorInformation.B2B_Bridge__c != null &&
                    lensConfiguratorInformation.B2B_Bridge__c != undefined &&
                    lensConfiguratorInformation.B2B_Bridge__c != ''
                        ? lensConfiguratorInformation.B2B_Bridge__c
                        : null; //Populating custom field :B2B_Bridge__c
                lensConfiguratorObject.selectedFrameLensSize =
                    lensConfiguratorInformation.B2B_Lens_Size__c != null &&
                    lensConfiguratorInformation.B2B_Lens_Size__c != undefined &&
                    lensConfiguratorInformation.B2B_Lens_Size__c != ''
                        ? lensConfiguratorInformation.B2B_Lens_Size__c.toString()
                        : null; //Populating custom field :B2B_Lens_Size__c
                lensConfiguratorObject.selectedFrameBaseCurve =
                    lensConfiguratorInformation.B2B_Base_Curve__c != null &&
                    lensConfiguratorInformation.B2B_Base_Curve__c != undefined &&
                    lensConfiguratorInformation.B2B_Base_Curve__c != ''
                        ? lensConfiguratorInformation.B2B_Base_Curve__c
                        : null; //Populating custom field :B2B_Base_Curve__c
                lensConfiguratorObject.selectedFrameColorNumber =
                    lensConfiguratorInformation.B2B_Color_Number__c != null &&
                    lensConfiguratorInformation.B2B_Color_Number__c != undefined &&
                    lensConfiguratorInformation.B2B_Color_Number__c != ''
                        ? lensConfiguratorInformation.B2B_Color_Number__c
                        : null; //Populating custom field :B2B_Color_Number__c
                lensConfiguratorObject.selectedFrameTempleLength =
                    lensConfiguratorInformation.B2B_Temple__c != null &&
                    lensConfiguratorInformation.B2B_Temple__c != undefined &&
                    lensConfiguratorInformation.B2B_Temple__c != ''
                        ? lensConfiguratorInformation.B2B_Temple__c
                        : null; //Populating custom field :B2B_Temple__c
                lensConfiguratorObject.withoutClipIn =
                    lensConfiguratorInformation.B2B_without_clipin__c != null &&
                    lensConfiguratorInformation.B2B_without_clipin__c != undefined &&
                    lensConfiguratorInformation.B2B_without_clipin__c != ''
                        ? lensConfiguratorInformation.B2B_without_clipin__c
                        : false; //Populating custom field :B2B_without_clipin__c
                lensConfiguratorObject.lensSKU =
                    lensConfiguratorInformation.B2B_Selected_Lens_SKU__c != null &&
                    lensConfiguratorInformation.B2B_Selected_Lens_SKU__c != undefined &&
                    lensConfiguratorInformation.B2B_Selected_Lens_SKU__c != ''
                        ? lensConfiguratorInformation.B2B_Selected_Lens_SKU__c
                        : null; //Populating custom field :B2B_Selected_Lens_SKU__c
                lensConfiguratorObject.eyeSide =
                    lensConfiguratorInformation.B2B_Eye_Side__c != null &&
                    lensConfiguratorInformation.B2B_Eye_Side__c != undefined &&
                    lensConfiguratorInformation.B2B_Eye_Side__c != ''
                        ? lensConfiguratorInformation.B2B_Eye_Side__c
                        : null; //Populating custom field :B2B_Eye_Side__c
                lensConfiguratorObject.baseValue =
                    lensConfiguratorInformation.B2B_Base_Values__c != null &&
                    lensConfiguratorInformation.B2B_Base_Values__c != undefined &&
                    lensConfiguratorInformation.B2B_Base_Values__c != ''
                        ? lensConfiguratorInformation.B2B_Base_Values__c
                        : null; //Populating custom field :B2B_Base_Values__c
                lensConfiguratorObject.rightsphere =
                    lensConfiguratorInformation.B2B_Sphere_Right__c != null &&
                    lensConfiguratorInformation.B2B_Sphere_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Sphere_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Sphere_Right__c + ''
                        : null; //Populating custom field :B2B_Sphere_Right__c
                lensConfiguratorObject.rightaxis =
                    lensConfiguratorInformation.B2B_Axis_Right__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Right__c + ''
                        : null; //Populating custom field :B2B_Axis_Right__c
                lensConfiguratorObject.rightaddition =
                    lensConfiguratorInformation.B2B_Addition_Right__c != null &&
                    lensConfiguratorInformation.B2B_Addition_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Addition_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Addition_Right__c + ''
                        : null; //Populating custom field :B2B_Addition_Right__c
                lensConfiguratorObject.rightprism1 =
                    lensConfiguratorInformation.B2B_Prism_1_Right__c != null &&
                    lensConfiguratorInformation.B2B_Prism_1_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Prism_1_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Prism_1_Right__c + ''
                        : null; //Populating custom field :B2B_Prism_1_Right__c
                lensConfiguratorObject.rightcylinder =
                    lensConfiguratorInformation.B2B_Cylinder_Right__c != null &&
                    lensConfiguratorInformation.B2B_Cylinder_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Cylinder_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Cylinder_Right__c + ''
                        : null; //Populating custom field :B2B_Cylinder_Right__c
                lensConfiguratorObject.leftsphere =
                    lensConfiguratorInformation.B2B_Sphere_Left__c != null &&
                    lensConfiguratorInformation.B2B_Sphere_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_Sphere_Left__c != ''
                        ? lensConfiguratorInformation.B2B_Sphere_Left__c + ''
                        : null; //Populating custom field :B2B_Sphere_Left__c
                lensConfiguratorObject.leftcylinder =
                    lensConfiguratorInformation.B2B_Cylinder_Left__c != null &&
                    lensConfiguratorInformation.B2B_Cylinder_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_Cylinder_Left__c != ''
                        ? lensConfiguratorInformation.B2B_Cylinder_Left__c + ''
                        : null; //Populating custom field :B2B_Cylinder_Left__c
                lensConfiguratorObject.leftaxis =
                    lensConfiguratorInformation.B2B_Axis_Left__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Left__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Left__c + ''
                        : null; //Populating custom field :B2B_Axis_Left__c
                lensConfiguratorObject.leftaddition =
                    lensConfiguratorInformation.B2B_Addition_Left__c != null &&
                    lensConfiguratorInformation.B2B_Addition_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_Addition_Left__c != ''
                        ? lensConfiguratorInformation.B2B_Addition_Left__c + ''
                        : null; //Populating custom field :B2B_Addition_Left__c
                lensConfiguratorObject.leftprism1 =
                    lensConfiguratorInformation.B2B_Prism_1_Left__c != null &&
                    lensConfiguratorInformation.B2B_Prism_1_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_Prism_1_Left__c != ''
                        ? lensConfiguratorInformation.B2B_Prism_1_Left__c + ''
                        : null; //Populating custom field :B2B_Prism_1_Left__c
                lensConfiguratorObject.leftprismbase1 =
                    lensConfiguratorInformation.B2B_PB1_Left__c != null &&
                    lensConfiguratorInformation.B2B_PB1_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_PB1_Left__c != ''
                        ? lensConfiguratorInformation.B2B_PB1_Left__c + ''
                        : null; //Populating custom field :B2B_PB1_Left__c
                lensConfiguratorObject.pupilDistanceRightEye =
                    lensConfiguratorInformation.B2B_Pupil_Distance_Right_Eye__c != null &&
                    lensConfiguratorInformation.B2B_Pupil_Distance_Right_Eye__c != undefined &&
                    lensConfiguratorInformation.B2B_Pupil_Distance_Right_Eye__c != ''
                        ? lensConfiguratorInformation.B2B_Pupil_Distance_Right_Eye__c.toString()
                        : null; //Populating custom field :B2B_Pupil_Distance_Right_Eye__c
                lensConfiguratorObject.pupilDistanceLeftEye =
                    lensConfiguratorInformation.B2B_Pupil_Distance_Left_Eye__c != null &&
                    lensConfiguratorInformation.B2B_Pupil_Distance_Left_Eye__c != undefined &&
                    lensConfiguratorInformation.B2B_Pupil_Distance_Left_Eye__c != ''
                        ? lensConfiguratorInformation.B2B_Pupil_Distance_Left_Eye__c.toString()
                        : null; //Populating custom field :B2B_Pupil_Distance_Left_Eye__c
                lensConfiguratorObject.fittingHeightRightEye =
                    lensConfiguratorInformation.B2B_Fitting_height_Right_Eye__c != null &&
                    lensConfiguratorInformation.B2B_Fitting_height_Right_Eye__c != undefined &&
                    lensConfiguratorInformation.B2B_Fitting_height_Right_Eye__c != ''
                        ? lensConfiguratorInformation.B2B_Fitting_height_Right_Eye__c.toString()
                        : null; //Populating custom field : B2B_Fitting_height_Right_Eye__c
                lensConfiguratorObject.fittingHeightLeftEye =
                    lensConfiguratorInformation.B2B_Fitting_height_Left_Eye__c != null &&
                    lensConfiguratorInformation.B2B_Fitting_height_Left_Eye__c != undefined &&
                    lensConfiguratorInformation.B2B_Fitting_height_Left_Eye__c != ''
                        ? lensConfiguratorInformation.B2B_Fitting_height_Left_Eye__c.toString()
                        : null; //Populating custom field : B2B_Fitting_height_Left_Eye__c
                lensConfiguratorObject.pantascopicTilt =
                    lensConfiguratorInformation.B2B_Pantoscopic_tilt__c != null &&
                    lensConfiguratorInformation.B2B_Pantoscopic_tilt__c != undefined &&
                    lensConfiguratorInformation.B2B_Pantoscopic_tilt__c != ''
                        ? lensConfiguratorInformation.B2B_Pantoscopic_tilt__c.toString()
                        : null; //Populating custom field :B2B_Pantoscopic_tilt__c
                lensConfiguratorObject.bvdWorn =
                    lensConfiguratorInformation.B2B_BVD_worn__c != null &&
                    lensConfiguratorInformation.B2B_BVD_worn__c != undefined &&
                    lensConfiguratorInformation.B2B_BVD_worn__c != ''
                        ? lensConfiguratorInformation.B2B_BVD_worn__c.toString()
                        : null; //Populating custom field :B2B_BVD_worn__c
                lensConfiguratorObject.bvdReffracted =
                    lensConfiguratorInformation.B2B_BVD_refracted__c != null &&
                    lensConfiguratorInformation.B2B_BVD_refracted__c != undefined &&
                    lensConfiguratorInformation.B2B_BVD_refracted__c != ''
                        ? lensConfiguratorInformation.B2B_BVD_refracted__c.toString()
                        : null; //Populating custom field :B2B_BVD_refracted__c
                lensConfiguratorObject.radioValue =
                    lensConfiguratorInformation.B2B_Measurement_System__c != null &&
                    lensConfiguratorInformation.B2B_Measurement_System__c != undefined &&
                    lensConfiguratorInformation.B2B_Measurement_System__c != ''
                        ? lensConfiguratorInformation.B2B_Measurement_System__c.toString()
                        : null; //Populating custom field :B2B_Measurement_System__c
                //BS-1244 - Start
                lensConfiguratorObject.userInputForSpecialHandlingField =
                    lensConfiguratorInformation.B2B_Special_Handling__c != null &&
                    lensConfiguratorInformation.B2B_Special_Handling__c != undefined &&
                    lensConfiguratorInformation.B2B_Special_Handling__c != ''
                        ? lensConfiguratorInformation.B2B_Special_Handling__c.toString()
                        : null; //B2B_Special_Handling__c
                lensConfiguratorObject.userInputForNotesField =
                    lensConfiguratorInformation.B2B_Note__c != null &&
                    lensConfiguratorInformation.B2B_Note__c != undefined &&
                    lensConfiguratorInformation.B2B_Note__c != ''
                        ? lensConfiguratorInformation.B2B_Note__c.toString()
                        : null; //Populating custom field :B2B_Note__c
                lensConfiguratorObject.customerServicePrefernceChoice =
                    lensConfiguratorInformation.B2B_Customer_Service_Preference__c != null &&
                    lensConfiguratorInformation.B2B_Customer_Service_Preference__c != undefined &&
                    lensConfiguratorInformation.B2B_Customer_Service_Preference__c != ''
                        ? lensConfiguratorInformation.B2B_Customer_Service_Preference__c
                        : null; //Populating custom field :B2B_Customer_Service_Preference__c

                lensConfiguratorObject.thicknessMatchingCalculatorLeftValue =
                    lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Left__c != null &&
                    lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Left__c != ''
                        ? lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Left__c.toString()
                        : null; //Populating custom field :B2B_Thickness_Matching_Calculator_Left__c

                lensConfiguratorObject.thicknessMatchingCalculatorRightValue =
                    lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Right__c != null &&
                    lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Right__c.toString()
                        : null; //Populating custom field :B2B_Thickness_Matching_Calculator_Right__c

                lensConfiguratorObject.weightOfLeftLens =
                    lensConfiguratorInformation.B2B_Weight_Left_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Weight_Left_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Weight_Left_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Weight_Left_Lens__c.toString()
                        : null; //Populating custom field :B2B_Weight_Left_Lens__c

                lensConfiguratorObject.weightOfLeftLensAdjusted =
                    lensConfiguratorInformation.B2B_Weight_Left_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Weight_Left_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Weight_Left_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Weight_Left_Lens_Adjusted__c.toString()
                        : null; //Populating custom field :B2B_Weight_Left_Lens_Adjusted__c

                lensConfiguratorObject.weightOfRightLens =
                    lensConfiguratorInformation.B2B_Weight_Right__c != null &&
                    lensConfiguratorInformation.B2B_Weight_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Weight_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Weight_Right__c.toString()
                        : null; //Populating custom field :B2B_Weight_Right__c

                lensConfiguratorObject.weightOfRightLensAdjusted =
                    lensConfiguratorInformation.B2B_Weight_Right_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Weight_Right_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Weight_Right_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Weight_Right_Lens_Adjusted__c.toString()
                        : null; //Populating custom field :B2B_Weight_Right_Lens_Adjusted__c

                lensConfiguratorObject.axisMinimumOfLeftLens =
                    lensConfiguratorInformation.B2B_Axis_Min_Left_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Min_Left_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Min_Left_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Min_Left_Lens__c.toString()
                        : null; //Populating custom field :B2B_Axis_Min_Left_Lens__c

                lensConfiguratorObject.axisMinimumOfOfLeftLensAdjusted =
                    lensConfiguratorInformation.B2B_Axis_Min_Left_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Min_Left_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Min_Left_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Min_Left_Lens_Adjusted__c.toString()
                        : null; //Populating custom field :B2B_Axis_Min_Left_Lens_Adjusted__c

                lensConfiguratorObject.axisMinimumOfRightLens =
                    lensConfiguratorInformation.B2B_Axis_Min_Right_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Min_Right_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Min_Right_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Min_Right_Lens__c.toString()
                        : null; //Populating custom field :B2B_Axis_Min_Right_Lens__c

                lensConfiguratorObject.axisMinimumOfRightLensAdjusted =
                    lensConfiguratorInformation.B2B_Axis_Minimum_Right_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Minimum_Right_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Minimum_Right_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Minimum_Right_Lens_Adjusted__c.toString()
                        : null; //Populating custom field :B2B_Axis_Minimum_Right_Lens_Adjusted__c

                lensConfiguratorObject.axisMaximumOfLeftLens =
                    lensConfiguratorInformation.B2B_Axis_Max_Left_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Max_Left_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Max_Left_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Max_Left_Lens__c.toString()
                        : null; //Populating custom field :B2B_Axis_Max_Left_Lens__c

                lensConfiguratorObject.axisMaximumOfOfLeftLensAdjusted =
                    lensConfiguratorInformation.B2B_Axis_Max_Left_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Max_Left_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Max_Left_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Max_Left_Lens_Adjusted__c.toString()
                        : null; //Populating custom field :B2B_Axis_Max_Left_Lens_Adjusted__c

                lensConfiguratorObject.axisMaximumOfRightLens =
                    lensConfiguratorInformation.B2B_Axis_Max_Right_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Max_Right_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Max_Right_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Max_Right_Lens__c.toString()
                        : null; //Populating custom field :B2B_Axis_Max_Right_Lens__c

                lensConfiguratorObject.axisMaximumOfRightLensAdjusted =
                    lensConfiguratorInformation.B2B_Axis_Max_Right_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Max_Right_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Max_Right_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Max_Right_Lens_Adjusted__c.toString()
                        : null; //Populating custom field :B2B_Axis_Max_Right_Lens_Adjusted__c

                lensConfiguratorObject.centerThicknessOfLeftLens =
                    lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens__c.toString()
                        : null; //Populating custom field :B2B_Center_Thickness_Left_Lens__c

                lensConfiguratorObject.centerThicknessOfOfLeftLensAdjusted =
                    lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens_Adjusted__c.toString()
                        : null; //Populating custom field :B2B_Center_Thickness_Left_Lens_Adjusted__c

                lensConfiguratorObject.centerThicknessOfRightLens =
                    lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens__c.toString()
                        : null; //Populating custom field :B2B_Center_Thickness_Right_Lens__c

                lensConfiguratorObject.centerThicknessOfRightLensAdjusted =
                    lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens_Adjusted__c.toString()
                        : null; //Populating custom field :B2B_Center_Thickness_Right_Lens_Adjusted__c

                lensConfiguratorObject.borderMaximumThicknessOfLeftLens =
                    lensConfiguratorInformation.B2B_Max_Border_Thickess_Left_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickess_Left_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickess_Left_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Max_Border_Thickess_Left_Lens__c.toString()
                        : null; //Populating custom field :B2B_Max_Border_Thickess_Left_Lens__c

                lensConfiguratorObject.borderMaximumThicknessOfLeftLensAdjusted =
                    lensConfiguratorInformation.B2B_Max_Border_Thickness_Left_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickness_Left_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickness_Left_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Max_Border_Thickness_Left_Adjusted__c.toString()
                        : null; //Populating custom field :B2B_Max_Border_Thickness_Left_Adjusted__c

                lensConfiguratorObject.borderMaximumThicknessOfRightLens =
                    lensConfiguratorInformation.B2B_Max_Border_Thickess_Right_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickess_Right_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickess_Right_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Max_Border_Thickess_Right_Lens__c.toString()
                        : null; //Populating custom field :B2B_Max_Border_Thickess_Right_Lens__c

                lensConfiguratorObject.borderMaximumThicknessOfRightLensAdjusted =
                    lensConfiguratorInformation.B2B_Max_Border_Thickness_Right_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickness_Right_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickness_Right_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Max_Border_Thickness_Right_Adjusted__c.toString()
                        : null; //Populating custom field :B2B_Max_Border_Thickness_Right_Adjusted__c

                lensConfiguratorObject.borderMinimumThicknessOfLeftLens =
                    lensConfiguratorInformation.B2B_Min_thickness_border_Left_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Left_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Left_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Min_thickness_border_Left_Lens__c.toString()
                        : null; //Populating custom field :B2B_Min_thickness_border_Left_Lens__c

                lensConfiguratorObject.borderMinimumThicknessOfOfLeftLensAdjusted =
                    lensConfiguratorInformation.B2B_Min_thickness_border_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Min_thickness_border_Lens_Adjusted__c.toString()
                        : null; //Populating custom field :B2B_Min_thickness_border_Lens_Adjusted__c

                lensConfiguratorObject.borderMinimumThicknessOfRightLens =
                    lensConfiguratorInformation.B2B_Min_thickness_border_Right_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Right_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Right_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Min_thickness_border_Right_Lens__c.toString()
                        : null; //Populating custom field :B2B_Min_thickness_border_Right_Lens__c

                lensConfiguratorObject.borderMinimumThicknessOfRightLensAdjusted =
                    lensConfiguratorInformation.B2B_Min_thickness_border_Right_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Right_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Right_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Min_thickness_border_Right_Adjusted__c.toString()
                        : null; //Populating custom field :B2B_Min_thickness_border_Right_Adjusted__c

                lensConfiguratorObject.isLensCalculated = true;

                lensConfiguratorObject.leftImageSRC =
                    lensConfiguratorInformation.B2B_Left_Lens_Image_SRC__c != null &&
                    lensConfiguratorInformation.B2B_Left_Lens_Image_SRC__c != undefined &&
                    lensConfiguratorInformation.B2B_Left_Lens_Image_SRC__c != ''
                        ? lensConfiguratorInformation.B2B_Left_Lens_Image_SRC__c
                        : null; //Populating custom field :B2B_Left_Lens_Image_SRC__c

                lensConfiguratorObject.rightImageSRC =
                    lensConfiguratorInformation.B2B_Right_Lens_Image_SRC__c != null &&
                    lensConfiguratorInformation.B2B_Right_Lens_Image_SRC__c != undefined &&
                    lensConfiguratorInformation.B2B_Right_Lens_Image_SRC__c != ''
                        ? lensConfiguratorInformation.B2B_Right_Lens_Image_SRC__c
                        : null; //Populating custom field :B2B_Right_Lens_Image_SRC__c
                //BS-1244 - End

                //BS-1129 START
                lensConfiguratorObject.rightprismbase1radio =
                    lensConfiguratorInformation.B2B_PB1Placement_Right__c != null &&
                    lensConfiguratorInformation.B2B_PB1Placement_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_PB1Placement_Right__c != ''
                        ? lensConfiguratorInformation.B2B_PB1Placement_Right__c
                        : null; //Populating custom field :B2B_PB1Placement_Right__c

                lensConfiguratorObject.leftprismbase1radio =
                    lensConfiguratorInformation.B2B_PB1Placement_Left__c != null &&
                    lensConfiguratorInformation.B2B_PB1Placement_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_PB1Placement_Left__c != ''
                        ? lensConfiguratorInformation.B2B_PB1Placement_Left__c
                        : null; //Populating custom field :B2B_PB1Placement_Left__c
                lensConfiguratorObject.leftprism2 =
                    lensConfiguratorInformation.B2B_Prism2_Left__c != null &&
                    lensConfiguratorInformation.B2B_Prism2_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_Prism2_Left__c != ''
                        ? lensConfiguratorInformation.B2B_Prism2_Left__c + ''
                        : null; //Populating custom field :B2B_Prism2_Left__c
                lensConfiguratorObject.leftprismbase2 =
                    lensConfiguratorInformation.B2B_Prism_base2_Left__c != null &&
                    lensConfiguratorInformation.B2B_Prism_base2_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_Prism_base2_Left__c != ''
                        ? lensConfiguratorInformation.B2B_Prism_base2_Left__c + ''
                        : null; //Populating custom field :B2B_Prism_base2_Left__c
                lensConfiguratorObject.rightprismbase1 =
                    lensConfiguratorInformation.B2B_PB1_Right__c != null &&
                    lensConfiguratorInformation.B2B_PB1_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_PB1_Right__c != ''
                        ? lensConfiguratorInformation.B2B_PB1_Right__c + ''
                        : null; //Populating custom field :B2B_PB1_Right__c
                lensConfiguratorObject.rightprism2 =
                    lensConfiguratorInformation.B2B_Prism2_Right__c != null &&
                    lensConfiguratorInformation.B2B_Prism2_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Prism2_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Prism2_Right__c + ''
                        : null; //Populating custom field :B2B_Prism2_Right__c

                lensConfiguratorObject.rightprismbase2 =
                    lensConfiguratorInformation.B2B_Prism_base2_Right__c != null &&
                    lensConfiguratorInformation.B2B_Prism_base2_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Prism_base2_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Prism_base2_Right__c + ''
                        : null; //Populating custom field :B2B_Prism_base2_Right__c

                lensConfiguratorObject.rightprismbase2radio =
                    lensConfiguratorInformation.B2B_PB2Placement_Right__c != null &&
                    lensConfiguratorInformation.B2B_PB2Placement_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_PB2Placement_Right__c != ''
                        ? lensConfiguratorInformation.B2B_PB2Placement_Right__c
                        : null; //Populating custom field :B2B_PB2Placement_Right__c

                lensConfiguratorObject.leftprismbase2radio =
                    lensConfiguratorInformation.B2B_PB2Placement_Left__c != null &&
                    lensConfiguratorInformation.B2B_PB2Placement_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_PB2Placement_Left__c != ''
                        ? lensConfiguratorInformation.B2B_PB2Placement_Left__c
                        : null; //Populating custom field :B2B_PB2Placement_Left__c
                //BS-1129 END
                //BS-1417 start
                lensConfiguratorObject.lensColor =
                    lensConfiguratorInformation.B2B_Lens_Color__c != undefined &&
                    lensConfiguratorInformation.B2B_Lens_Color__c != null &&
                    lensConfiguratorInformation.B2B_Lens_Color__c != ''
                        ? lensConfiguratorInformation.B2B_Lens_Color__c
                        : null;

                lensConfiguratorObject.isCheckedAdapterAgreement =
                    lensConfiguratorInformation.B2B_Agreement_To_Adapter__c != undefined &&
                    lensConfiguratorInformation.B2B_Agreement_To_Adapter__c != null &&
                    lensConfiguratorInformation.B2B_Agreement_To_Adapter__c != ''
                        ? lensConfiguratorInformation.B2B_Agreement_To_Adapter__c
                        : null;

                lensConfiguratorObject.isCheckedDirectGlazingAgreement =
                    lensConfiguratorInformation.B2B_Agreement_To_Direct_Glazing__c != undefined &&
                    lensConfiguratorInformation.B2B_Agreement_To_Direct_Glazing__c != null &&
                    lensConfiguratorInformation.B2B_Agreement_To_Direct_Glazing__c != ''
                        ? lensConfiguratorInformation.B2B_Agreement_To_Direct_Glazing__c
                        : null;
                lensConfiguratorObject.workingDistance =
                    lensConfiguratorInformation.B2B_Working_Distance__c != undefined &&
                    lensConfiguratorInformation.B2B_Working_Distance__c != null &&
                    lensConfiguratorInformation.B2B_Working_Distance__c != ''
                        ? lensConfiguratorInformation.B2B_Working_Distance__c
                        : null;
                lensConfiguratorObject.lensEdge =
                    lensConfiguratorInformation.B2B_Lens_Edge__c != undefined && lensConfiguratorInformation.B2B_Lens_Edge__c != null
                        ? lensConfiguratorInformation.B2B_Lens_Edge__c
                        : null; // BS-1845
                lensConfiguratorObject.sGravingValue =
                    lensConfiguratorInformation.B2B_S_Graving__c != undefined && lensConfiguratorInformation.B2B_S_Graving__c != null
                        ? lensConfiguratorInformation.B2B_S_Graving__c
                        : false; // BS-1796
                lensConfiguratorObject.optimisedFacetCutValue =
                    lensConfiguratorInformation.B2B_Optimized_Facet_Cut__c != undefined && lensConfiguratorInformation.B2B_Optimized_Facet_Cut__c != null
                        ? lensConfiguratorInformation.B2B_Optimized_Facet_Cut__c
                        : false; // BS-1963
                lensConfiguratorObject.variantShape =
                    lensConfiguratorInformation.B2B_Variant_Shape__c != null &&
                    lensConfiguratorInformation.B2B_Variant_Shape__c != undefined &&
                    lensConfiguratorInformation.B2B_Variant_Shape__c != ''
                        ? lensConfiguratorInformation.B2B_Variant_Shape__c
                        : null; //BS-1916-Populating custom field :B2B_Variant_Shape__c
                lensConfiguratorObject.shapeSize =
                    lensConfiguratorInformation.B2B_Lens_Size__c != null &&
                    lensConfiguratorInformation.B2B_Lens_Size__c != undefined &&
                    lensConfiguratorInformation.B2B_Lens_Size__c != ''
                        ? lensConfiguratorInformation.B2B_Lens_Size__c.toString()
                        : null; //BS-1916-Populating custom field :B2B_Lens_Size__c

                lensConfiguratorObject.rimlessVariant = null;
                lensConfiguratorObject.lensShape =
                    lensConfiguratorInformation.B2B_Selected_Lens_Shape__c != null &&
                    lensConfiguratorInformation.B2B_Selected_Lens_Shape__c != undefined &&
                    lensConfiguratorInformation.B2B_Selected_Lens_Shape__c != ''
                        ? lensConfiguratorInformation.B2B_Selected_Lens_Shape__c
                        : null; //BS-1888-Populating custom field :B2B_Selected_Lens_Shape__c
                lensConfiguratorObject.completedStep =
                    lensConfiguratorInformation.B2B_Last_Completed_Step__c !== undefined && lensConfiguratorInformation.B2B_Last_Completed_Step__c !== null
                        ? lensConfiguratorInformation.B2B_Last_Completed_Step__c
                        : null; //BS-1775-Populating custom field :B2B_Last_Completed_Step__c

                this._completeStepForNavigation = lensConfiguratorObject.completedStep;

                if (lensConfiguratorObject.completedStep != null && lensConfiguratorObject.completedStep > 5) {
                    await getShapeSelectionScreenData({ recordId: this._recordIdToBeEdited }).then(async (result) => {
                        let parsedData = {};
                        let originalParsedData = {};
                        if (result !== undefined && result !== null) {
                            if (result.omaSuccessResponseWrapper) {
                                originalParsedData.allowedScaling = result.omaSuccessResponseWrapper.originalAllowedScaling
                                    ? JSON.parse(result.omaSuccessResponseWrapper.originalAllowedScaling)
                                    : result.omaSuccessResponseWrapper.allowedScaling
                                    ? JSON.parse(result.omaSuccessResponseWrapper.allowedScaling)
                                    : null;
                                originalParsedData.coordinates = result.omaSuccessResponseWrapper.originalCoordinates
                                    ? JSON.parse(result.omaSuccessResponseWrapper.originalCoordinates)
                                    : result.omaSuccessResponseWrapper.coordinates
                                    ? JSON.parse(result.omaSuccessResponseWrapper.coordinates)
                                    : null;
                                originalParsedData.drills =
                                    result.lensConfiguratorObj && result.lensConfiguratorObj.B2B_Original_Drills__c
                                        ? JSON.parse(result.lensConfiguratorObj.B2B_Original_Drills__c.replace(/ends/g, 'end'))
                                        : result.lensConfiguratorObj && result.lensConfiguratorObj.B2B_Drills__c
                                        ? JSON.parse(result.lensConfiguratorObj.B2B_Drills__c.replace(/ends/g, 'end'))
                                        : null;
                                originalParsedData.hasDrills = result.omaSuccessResponseWrapper.originalHasDrills
                                    ? result.omaSuccessResponseWrapper.originalHasDrills
                                    : result.omaSuccessResponseWrapper.hasDrills
                                    ? result.omaSuccessResponseWrapper.hasDrills
                                    : false;
                                originalParsedData.height = result.omaSuccessResponseWrapper.originalHeight
                                    ? JSON.parse(result.omaSuccessResponseWrapper.originalHeight)
                                    : result.omaSuccessResponseWrapper.height
                                    ? JSON.parse(result.omaSuccessResponseWrapper.height)
                                    : null;
                                originalParsedData.oma = result.omaSuccessResponseWrapper.originalOma
                                    ? result.omaSuccessResponseWrapper.originalOma
                                    : result.omaSuccessResponseWrapper.oma
                                    ? result.omaSuccessResponseWrapper.oma
                                    : null;
                                originalParsedData.width = result.omaSuccessResponseWrapper.originalWidth
                                    ? JSON.parse(result.omaSuccessResponseWrapper.originalWidth)
                                    : result.omaSuccessResponseWrapper.width
                                    ? JSON.parse(result.omaSuccessResponseWrapper.width)
                                    : null;
                                this._readOnlyOriginalParsedData = { data: originalParsedData };

                                parsedData.allowedScaling = result.omaSuccessResponseWrapper.allowedScaling
                                    ? JSON.parse(result.omaSuccessResponseWrapper.allowedScaling)
                                    : null;
                                parsedData.coordinates = result.omaSuccessResponseWrapper.coordinates
                                    ? JSON.parse(result.omaSuccessResponseWrapper.coordinates)
                                    : null;
                                parsedData.drills =
                                    result.lensConfiguratorObj && result.lensConfiguratorObj.B2B_Drills__c
                                        ? JSON.parse(result.lensConfiguratorObj.B2B_Drills__c.replace(/ends/g, 'end'))
                                        : null;
                                parsedData.hasDrills = result.omaSuccessResponseWrapper.hasDrills ? result.omaSuccessResponseWrapper.hasDrills : false;
                                parsedData.height = result.omaSuccessResponseWrapper.height ? JSON.parse(result.omaSuccessResponseWrapper.height) : null;
                                parsedData.oma = result.omaSuccessResponseWrapper.oma ? result.omaSuccessResponseWrapper.oma : null;
                                parsedData.width = result.omaSuccessResponseWrapper.width ? JSON.parse(result.omaSuccessResponseWrapper.width) : null;
                                this._readOnlyParsedData = { data: parsedData };
                            }
                            let lensConfiguratorObj = result.lensConfiguratorObj;
                            let lensShapeRecordId;
                            if (lensConfiguratorObj !== undefined && lensConfiguratorObj !== null) {
                                this._isOrderTypeLensOnly = lensConfiguratorObj.B2B_Order_Type__c == LENS_ONLY ? true : false;
                                lensShapeRecordId = lensConfiguratorObj.B2B_Selected_Lens_Shape__c ? lensConfiguratorObj.B2B_Selected_Lens_Shape__c : '';
                            }

                            this._shapeSelectionCollection = {};
                            this._shapeSelectionCollection.lensShape =
                                lensConfiguratorObj.B2B_Lens_Shape__c !== undefined && lensConfiguratorObj.B2B_Lens_Shape__c !== null
                                    ? lensConfiguratorObj.B2B_Lens_Shape__c
                                    : null;
                            this._shapeSelectionCollection.lensSize =
                                lensConfiguratorObj.B2B_Lens_Size__c !== undefined && lensConfiguratorObj.B2B_Lens_Size__c !== null
                                    ? lensConfiguratorObj.B2B_Lens_Size__c + ''
                                    : null;
                            this._shapeSelectionCollection.showAllShapes =
                                lensConfiguratorObj.B2B_Show_All_Shapes__c !== undefined && lensConfiguratorObj.B2B_Show_All_Shapes__c !== null
                                    ? lensConfiguratorObj.B2B_Show_All_Shapes__c
                                    : false;
                            this._shapeSelectionCollection.a = lensConfiguratorObj.B2B_a__c ? lensConfiguratorObj.B2B_a__c : 0;
                            this._shapeSelectionCollection.b1 = lensConfiguratorObj.B2B_b1__c ? lensConfiguratorObj.B2B_b1__c : 0;
                            this._shapeSelectionCollection.b = lensConfiguratorObj.B2B_b__c ? lensConfiguratorObj.B2B_b__c : 0;
                            this._shapeSelectionCollection.b2 = lensConfiguratorObj.B2B_b2__c ? lensConfiguratorObj.B2B_b2__c : 0;
                            this._shapeSelectionCollection.sf = lensConfiguratorObj.B2B_SF__c ? lensConfiguratorObj.B2B_SF__c : 0;
                            this._shapeSelectionCollection.blp = lensConfiguratorObj.B2B_blp__c ? lensConfiguratorObj.B2B_blp__c : 0;
                            this._shapeSelectionCollection.height = lensConfiguratorObj.B2B_OMA_Height__c
                                ? this.trimUptoTwoDecimalPlaces(lensConfiguratorObj.B2B_OMA_Height__c)
                                : '';
                            this._shapeSelectionCollection.width = lensConfiguratorObj.B2B_Width__c
                                ? this.trimUptoTwoDecimalPlaces(lensConfiguratorObj.B2B_Width__c)
                                : '';
                            lensConfiguratorObject.selectedLensShapeId = lensShapeRecordId;
                            await getLensShapeDataByShapeName({
                                shapeName: this._shapeSelectionCollection.lensShape,
                                size: this._shapeSelectionCollection.lensSize,
                                recordId: lensShapeRecordId
                            })
                                .then((data) => {
                                    if (data !== undefined && data !== null) {
                                        let lensShapeObject = data[0];
                                        if (
                                            (lensShapeObject.B2B_Default_Features__c &&
                                                lensShapeObject.B2B_Default_Features__c.includes(WITH_ACCENT_RING_VALUE) == true) ||
                                            (lensShapeObject.B2B_Available_features__c &&
                                                lensShapeObject.B2B_Available_features__c.includes(WITH_ACCENT_RING_VALUE) == true)
                                        ) {
                                            this._shapeSelectionCollection.showWithAccentRing = true;
                                            this._shapeSelectionCollection.withAccentRingValue = lensConfiguratorObj.B2B_Accent_Ring__c
                                                ? lensConfiguratorObj.B2B_Accent_Ring__c
                                                : false;
                                            this._shapeSelectionCollection.showAccentRingColor = true;
                                            let colorHexCode =
                                                lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r &&
                                                lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c
                                                    ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c
                                                    : HEX_ACCENT_RING_CONST_PRODUCT;
                                            let frameColorDescription =
                                                lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r &&
                                                lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c
                                                    ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c
                                                    : '';
                                            let colorNumber =
                                                lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r &&
                                                lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Color_Number__c
                                                    ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Color_Number__c
                                                    : '';
                                            let selectedColorProperties = {};
                                            selectedColorProperties.label = colorNumber + ' ' + frameColorDescription;
                                            selectedColorProperties.styling = STYLING_BACKGROUND_COLOR + colorHexCode;
                                            this._selectedAccentRingColor = selectedColorProperties;
                                            this._shapeSelectionCollection.accentRingColorStyling = this._selectedAccentRingColor.styling;
                                            this._shapeSelectionCollection.accentRingColorLabel = this._selectedAccentRingColor.label;
                                            this._shapeSelectionCollection.accentRingImage = lensConfiguratorObj.B2B_Selected_Accent_Ring_Image__c
                                                ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Image__c
                                                : null;
                                            this._shapeSelectionCollection.showAccentRingImage =
                                                this._shapeSelectionCollection.accentRingImage !== undefined &&
                                                this._shapeSelectionCollection.accentRingImage !== null
                                                    ? true
                                                    : false;
                                            this._shapeSelectionCollection.removeGrooveValue =
                                                lensConfiguratorObj.B2B_Remove_Groove__c !== undefined && lensConfiguratorObj.B2B_Remove_Groove__c !== null
                                                    ? lensConfiguratorObj.B2B_Remove_Groove__c
                                                    : false;
                                        }
                                        if (
                                            (lensShapeObject.B2B_Default_Features__c &&
                                                lensShapeObject.B2B_Default_Features__c.includes(WITH_COLORED_GROOVE) == true) ||
                                            (lensShapeObject.B2B_Available_features__c &&
                                                lensShapeObject.B2B_Available_features__c.includes(WITH_COLORED_GROOVE) == true) ||
                                            (lensShapeObject.B2B_Default_Features__c &&
                                                lensShapeObject.B2B_Default_Features__c.includes(PARTIAL_GROOVE_VALUE) == true) ||
                                            (lensShapeObject.B2B_Available_features__c &&
                                                lensShapeObject.B2B_Available_features__c.includes(PARTIAL_GROOVE_VALUE) == true)
                                        ) {
                                            this._shapeSelectionCollection.showWithColorGroove = true;
                                            this._shapeSelectionCollection.withColorGrooveValue = lensConfiguratorObj.B2B_With_Color_Groove__c
                                                ? lensConfiguratorObj.B2B_With_Color_Groove__c
                                                : false;
                                            this._shapeSelectionCollection.withPartialColorGroove = lensConfiguratorObj.B2B_With_Partial_Color_Groove__c
                                                ? lensConfiguratorObj.B2B_With_Partial_Color_Groove__c
                                                : false;
                                            if (this._shapeSelectionCollection.withColorGrooveValue == true) {
                                                this._shapeSelectionCollection.showColorGrooveColor = true;
                                            } else {
                                                this._shapeSelectionCollection.showColorGrooveColor = false;
                                            }

                                            let colorHexCode =
                                                lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r &&
                                                lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c
                                                    ? lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c
                                                    : HEX_ACCENT_RING_CONST_PRODUCT;
                                            const selectedColorProperties = {};
                                            selectedColorProperties.label =
                                                lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r &&
                                                lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.Name
                                                    ? lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.Name
                                                    : '';
                                            selectedColorProperties.styling = STYLING_BACKGROUND_COLOR + colorHexCode;
                                            this._selectedColoredGrooveColor = selectedColorProperties;
                                            this._isColoredGrooveColorSelected = true;
                                            this._shapeSelectionCollection.colorGrooveColorStyling = this._selectedColoredGrooveColor.styling;
                                            this._shapeSelectionCollection.colorGrooveColorLabel = this._selectedColoredGrooveColor.label;
                                        } else {
                                            this._showColoredGrooveSection = false;
                                        }
                                        if (
                                            this._isOrderTypeLensOnly == true &&
                                            lensShapeObject.B2B_Lens_Only_Available__c &&
                                            lensShapeObject.B2B_Lens_Only_Available__c.includes(REMOVE_DRILLS_VALUE) === true
                                        ) {
                                            this._shapeSelectionCollection.showRemoveDrill = true;
                                            this._shapeSelectionCollection.removeDrills = lensConfiguratorObj.B2B_Remove_Drills__c
                                                ? lensConfiguratorObj.B2B_Remove_Drills__c
                                                : false;
                                        } else {
                                            this._shapeSelectionCollection.showRemoveDrill = false;
                                            this._shapeSelectionCollection.removeDrills = false;
                                        }
                                    }
                                    this._initialLoadComplete = true;
                                    lensConfiguratorObject.shapeSelectionData = this._shapeSelectionCollection;
                                })
                                .catch((error) => {
                                    this._initialLoadComplete = true;
                                });
                        }
                    });
                }

                if (lensConfiguratorObject.antireflectionSKU !== undefined && lensConfiguratorObject.antireflectionSKU !== null) {
                    //BS-1355
                    lensConfiguratorObject.isAntireflectionHardcoating = true;
                } else {
                    lensConfiguratorObject.isAntireflectionHardcoating = false;
                }
                //BS-1153 starts
                let applicableKeyForSpecialHandlingOption;
                let applicableKeyForUserNote;
                let applicableKeyForCustomerServicePreference;
                if (this._applicableBrand == VS_BRAND) {
                    applicableKeyForSpecialHandlingOption = KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_VS;
                    applicableKeyForCustomerServicePreference = KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_VS;
                    applicableKeyForUserNote = KEY_FOR_USER_NOTE_ENTERED_FOR_VS;
                } else {
                    applicableKeyForSpecialHandlingOption = KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX;
                    applicableKeyForCustomerServicePreference = KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX;
                    applicableKeyForUserNote = KEY_FOR_USER_NOTE_ENTERED_FOR_RX;
                }
                if (lensConfiguratorInformation.B2B_Note__c != undefined && lensConfiguratorInformation.B2B_Note__c != null) {
                    localStorage.setItem(applicableKeyForUserNote, lensConfiguratorInformation.B2B_Note__c);
                } else {
                    localStorage.removeItem(applicableKeyForUserNote);
                }
                if (
                    lensConfiguratorInformation.B2B_Customer_Service_Preference__c != undefined &&
                    lensConfiguratorInformation.B2B_Customer_Service_Preference__c != null
                ) {
                    localStorage.setItem(applicableKeyForCustomerServicePreference, lensConfiguratorInformation.B2B_Customer_Service_Preference__c);
                } else {
                    localStorage.removeItem(applicableKeyForCustomerServicePreference);
                }
                if (lensConfiguratorInformation.B2B_Special_Handling__c != undefined && lensConfiguratorInformation.B2B_Special_Handling__c != null) {
                    localStorage.setItem(applicableKeyForSpecialHandlingOption, lensConfiguratorInformation.B2B_Special_Handling__c);
                } else {
                    localStorage.removeItem(applicableKeyForSpecialHandlingOption);
                } //BS-1153 end
                this.lensConfiguratorCollectionData = JSON.parse(JSON.stringify(lensConfiguratorObject));
                if (lensConfiguratorObject && lensConfiguratorObject.selectedFrameSKU != undefined && lensConfiguratorObject.selectedFrameSKU != null) {
                    this.createFrameInformationCollection(lensConfiguratorObject.selectedFrameSKU);
                }
            })
            .catch((execptionInstance) => {
                this._isLoading = false;
                console.error(execptionInstance);
            });
    }

    createFrameInformationCollection(selectedFrameSku) {
        getFrameImage({ selectedFrameSKU: selectedFrameSku })
            .then((image) => {
                if (image != undefined && image != null && image[0]) {
                    let imageObj = JSON.parse(JSON.stringify(image[0]));
                    this._frameInformationCollection.image =
                        imageObj.B2B_Picture_Link__c != undefined && imageObj.B2B_Picture_Link__c != null ? imageObj.B2B_Picture_Link__c : '';
                } else {
                    this._isLoading = false;
                }
            })
            .then(() => {
                getFrameProductValues({ selectedFrameSKU: selectedFrameSku })
                    .then((result) => {
                        let productId;
                        if (result != undefined && result != null) {
                            let frameProductData = JSON.parse(JSON.stringify(result[0]));
                            if (frameProductData != undefined && frameProductData != null) {
                                this._frameInformationCollection.bridgeSize =
                                    frameProductData.B2B_Bridge_Size__c != undefined && frameProductData.B2B_Bridge_Size__c != null
                                        ? frameProductData.B2B_Bridge_Size__c
                                        : '';
                                this._frameInformationCollection.collectionDesignFamily =
                                    frameProductData.B2B_Design_Family__c != undefined && frameProductData.B2B_Design_Family__c != null
                                        ? frameProductData.B2B_Design_Family__c
                                        : '';
                                this._frameInformationCollection.frameColor =
                                    frameProductData.StockKeepingUnit != undefined && frameProductData.StockKeepingUnit != null
                                        ? frameProductData.StockKeepingUnit.substring(7, 11)
                                        : '';
                                this._frameInformationCollection.frameColorDescription =
                                    frameProductData.B2B_Frame_Color_Description__c != undefined && frameProductData.B2B_Frame_Color_Description__c != null
                                        ? frameProductData.B2B_Frame_Color_Description__c
                                        : '';
                                this._frameInformationCollection.frameType =
                                    frameProductData.B2B_Frame_type__c != undefined && frameProductData.B2B_Frame_type__c != null
                                        ? frameProductData.B2B_Frame_type__c
                                        : '';
                                this._frameInformationCollection.model =
                                    frameProductData.B2B_Model__c != undefined && frameProductData.B2B_Model__c != null ? frameProductData.B2B_Model__c : '';
                                this._frameInformationCollection.lensSize =
                                    frameProductData.B2B_Lens_Size__c != undefined && frameProductData.B2B_Lens_Size__c != null
                                        ? frameProductData.B2B_Lens_Size__c
                                        : '';
                                this._frameInformationCollection.productIdPDP =
                                    frameProductData.Id != undefined && frameProductData.Id != null ? frameProductData.Id : '';
                                this._frameInformationCollection.selectedFrameSKU =
                                    selectedFrameSku != undefined && selectedFrameSku != null ? selectedFrameSku : '';
                                this._frameInformationCollection.size =
                                    frameProductData.B2B_EE_Size__c != undefined && frameProductData.B2B_EE_Size__c != null
                                        ? frameProductData.B2B_EE_Size__c
                                        : '';
                                this._frameInformationCollection.templeLength =
                                    frameProductData.B2B_Temple_Length__c != undefined && frameProductData.B2B_Temple_Length__c != null
                                        ? frameProductData.B2B_Temple_Length__c
                                        : '';
                                //BS-1916 - Start
                                this._frameInformationCollection.variantShape =
                                    frameProductData.B2B_Variant_Shape__c != undefined && frameProductData.B2B_Variant_Shape__c != null
                                        ? frameProductData.B2B_Variant_Shape__c
                                        : '';
                                this._frameInformationCollection.shapeSize =
                                    frameProductData.B2B_Shape_Size__c != undefined && frameProductData.B2B_Shape_Size__c != null
                                        ? frameProductData.B2B_Shape_Size__c
                                        : '';
                                //BS-1916 end
                                this._frameInformationCollection.rimlessVariant =
                                    frameProductData.B2B_Rimless_Variant__c != undefined && frameProductData.B2B_Rimless_Variant__c != null
                                        ? frameProductData.B2B_Rimless_Variant__c
                                        : ''; //BS-1888
                                //BS-1701 - Start
                                this._frameInformationCollection.modelNameNumber =
                                    frameProductData.Name != undefined && frameProductData.Name != null ? frameProductData.Name : '';
                                this._frameInformationCollection.modelNameNumber +=
                                    frameProductData.B2B_Model__c != undefined && frameProductData.B2B_Model__c != null
                                        ? ' ' + frameProductData.B2B_Model__c
                                        : '';
                                //BS-1701 - End
                                productId = frameProductData.B2B_Product__c;
                                /* Start : BS-2158/BS-2174 */
                                this._frameInformationCollection.hexcode = frameProductData.B2B_Hexcode__c;
                                this._frameInformationCollection.hexcodeAccent = frameProductData.B2B_Hexcode_Accent__c;
                                /* End : BS-2158/BS-2174 */
                            }
                            if (this._frameInformationCollection) {
                                let targetPage;
                                if (this._applicableBrand != null && this._applicableBrand != undefined && this._applicableBrand != '') {
                                    targetPage =
                                        this._applicableBrand == VS_BRAND
                                            ? VISION_SENSATION_SITE_PAGE
                                            : this._applicableBrand == RX_BRAND
                                            ? RX_GLAZING_SITE_PAGE
                                            : null;
                                }

                                this[NavigationMixin.Navigate]({
                                    type: STANDARD_NAMED_PAGE,
                                    attributes: {
                                        name: targetPage
                                    },
                                    state: {
                                        pageSource: MY_VS_RX_PAGE_SOURCE_IDENTIFIER,
                                        lensConfiguratorCollection: JSON.stringify(this.lensConfiguratorCollectionData),
                                        productData: JSON.stringify(this._frameInformationCollection),
                                        productId: productId,
                                        currentStep: this._completeStepForNavigation //BS-1775
                                    }
                                });
                            }
                        } else {
                            this._isLoading = false;
                        }
                    })
                    .catch((execptionInstance) => {
                        console.error(execptionInstance);
                        this._isLoading = false;
                    });
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                this._isLoading = false;
            });
    }

    /**
     * BS-1415
     * this methods fetchs account data
     */
    async getAccountData() {
        await getAccountData()
            .then((result) => {
                if (result !== undefined && result !== null) {
                    this._countryCode = result.k_ARIS_Account_ID__c ? result.k_ARIS_Account_ID__c.substring(0, 4) : '';
                    this._effectiveAccountId = result.Id;
                    this.getCountrySpecificDateFormatData(); //BS-2142
                }
            })
            .catch((error) => {});
    }
    /* Start of BS-2142 */
    async getCountrySpecificDateFormatData() {
        if (this._countryCode != null && this._countryCode != undefined) {
            await getCountryDateFormat({
                countryCode: this._countryCode
            })
                .then((result) => {
                    this.dateFormat = result;
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }
    /* End of BS-2142 */

    /**
     * BS-1716
     * This method is used to check eligibility of current user for VS or RX Tab
     *
     * @type {Category[]}
     */
    checkEligibilityForVisionSensationEvilEyeRX() {
        checkVSRXEligibilityFromAccount({ accountId: this._effectiveAccountId })
            .then((result) => {
                if (result != null && result != undefined) {
                    this._isEligibleForVS = result.isEligibleForVS;
                    this._isEligibleForRX = result.isEligibleForRX;
                    if (this._isEligibleForVS == true) {
                        this._applicableBrand = VS_BRAND;
                    } else if (this._isEligibleForRX == true) {
                        this._applicableBrand = RX_BRAND;
                    }

                    this.getOrderTypeValues();
                }
            })
            .catch((exceptionInstance) => {
                console.error('Error:', exceptionInstance);
            });
    }

    trimUptoTwoDecimalPlaces(number) {
        let clonedNumber = number + '';
        if (clonedNumber.includes('.')) {
            clonedNumber = clonedNumber.split('.');
            let numberBeforeDecimal = clonedNumber[0];
            let numberAfterDecimal = clonedNumber[1];
            if (numberAfterDecimal.length >= 2) {
                numberAfterDecimal = numberAfterDecimal.slice(0, 2);
            }
            clonedNumber = numberBeforeDecimal + '.' + numberAfterDecimal;
        }
        return clonedNumber;
    }
    /**
     * Adding character limit to the field values
     * BS-2217
     */
    addFieldValueCharacterLimit(dataset, fieldsList, characterLimit) {
        characterLimit = characterLimit == undefined ? 20 : characterLimit;
        if (dataset != undefined && dataset != null) {
            if (fieldsList != undefined && fieldsList != null) {
                dataset.forEach((element) => {
                    fieldsList.forEach((fieldName) => {
                        element[fieldName] =
                            element[fieldName] == undefined
                                ? undefined
                                : element[fieldName].length > characterLimit
                                ? element[fieldName].slice(0, characterLimit) + '...'
                                : element[fieldName];
                    });
                });
            }
        }
        return dataset;
    }
}
