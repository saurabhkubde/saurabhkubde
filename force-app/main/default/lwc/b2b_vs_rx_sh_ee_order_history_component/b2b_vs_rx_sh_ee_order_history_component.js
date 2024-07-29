import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { redirectToPage, sortBy } from 'c/b2b_utils'; //BS-2150
import { setConfiguratorValues, setConfiguratorValuesForDifferentBrand } from 'c/b2b_vs_rx_edit_utils'; //BS-1064

import ORDER_OBJECT from '@salesforce/schema/Order';
import ORDERSTATUS_FIELD from '@salesforce/schema/Order.Status';
import ORDERSOURCE_FIELD from '@salesforce/schema/Order.Order_Source__c';

import getOrderHistoryList from '@salesforce/apex/B2B_OrderHistoryController.getOrderHistoryList';
import getOrderReferenceList from '@salesforce/apex/B2B_OrderHistoryController.getOrderReferencesById';
import createOrderDocumentRequest from '@salesforce/apex/B2B_OrderHistoryController.createOrderDocumentRequest';
import getAccountEmail from '@salesforce/apex/B2B_OrderHistoryController.getAccountEmail'; //BS-437
import checkVSRXEligibilityFromAccount from '@salesforce/apex/B2B_CartController.checkVSRXEligibilityFromAccount'; //BS-1023
import accountIdByCurrentUser from '@salesforce/apex/B2B_Utils.getAccountIdByCurrentUser'; //BS-1023
import getAccountDetail from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getAccountDetail'; //BS-1415
import getCountryDateFormat from '@salesforce/apex/B2B_OrderHistoryController.getCountryDateFormat'; //BS-2142
import createCloneConfiguratorForVSRX from '@salesforce/apex/B2B_OrderHistoryController.createCloneConfiguratorForVSRX'; //BS-1064
import getFrameProductValues from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFrameProductValues'; //BS-1064
import getFrameImage from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFrameImage'; //BS-1064

// LABELS
import nolinks from '@salesforce/label/c.B2B_ACC_OH_No_Links_Found';
import close from '@salesforce/label/c.B2B_ACC_OH_Close_Modal';
import orderhistory from '@salesforce/label/c.B2B_ACC_OH_Order_History';
import source from '@salesforce/label/c.B2B_ACC_OH_Source';
import selectsource from '@salesforce/label/c.B2B_ACC_OH_Select_Source';
import status from '@salesforce/label/c.B2B_ACC_OH_Status';
import selectstatus from '@salesforce/label/c.B2B_ACC_OH_Select_Status';
import timeframe from '@salesforce/label/c.B2B_ACC_OH_Timeframe';
import ordernumber from '@salesforce/label/c.B2B_ACC_OH_Order_Number';
import orderdate from '@salesforce/label/c.B2B_ACC_OH_Order_Date';
import orderresetfilters from '@salesforce/label/c.B2B_ACC_OH_Reset_Filters';
import furtherinfos from '@salesforce/label/c.B2B_ACC_OH_Further_Order_Infos';
import deliverylinks from '@salesforce/label/c.B2B_ACC_OH_Delivery_Links';
import invoicelinks from '@salesforce/label/c.B2B_ACC_OH_Invoice_Link';
import sendorderconfirmation from '@salesforce/label/c.B2B_ACC_OH_Send_Order_Confirmation';
import senddelivery from '@salesforce/label/c.B2B_ACC_OH_Send_Delivery';
import sendinvoice from '@salesforce/label/c.B2B_ACC_OH_Send_Invoice';
import disableSendInvoice from '@salesforce/label/c.B2B_ACC_OH_Send_Invoice_Disabled_Message'; //BS-1146
import orderconfirmationlinks from '@salesforce/label/c.B2B_ACC_OH_Order_Confirmation_Links';
import trackinglinks from '@salesforce/label/c.B2B_ACC_OH_Tracking_Links';
import noorders from '@salesforce/label/c.B2B_ACC_OH_No_Orders';
import LAST_MONTH from '@salesforce/label/c.B2B_ACC_OH_Delivery_Last_Month';
import LAST_3_MONTHS from '@salesforce/label/c.B2B_ACC_OH_Delivery_Last_3Months';
import LAST_6_MONTHS from '@salesforce/label/c.B2B_ACC_OH_Delivery_Last_6Months';
import LAST_12_MONTHS from '@salesforce/label/c.B2B_ACC_OH_Delivery_Last_12Months';
import LAST_24_MONTHS from '@salesforce/label/c.B2B_ACC_OH_Delivery_Last_24Months';
import successMessage from '@salesforce/label/c.B2B_ACC_OH_Success_Message';
import errorMessage from '@salesforce/label/c.B2B_LOGIN_Generic_Error';
import otherAction from '@salesforce/label/c.B2B_Order_History_Other_Action';
import requestDocument from '@salesforce/label/c.B2B_Order_History_Request_Document';
import orderDetails from '@salesforce/label/c.B2B_Order_History_Order_Details';
import reorder from '@salesforce/label/c.B2B_Order_History_Reorder'; //BS-523
import orderSourceB2BTypeValues from '@salesforce/label/c.B2B_Order_Source_Values'; //BS-523
import STATUS_VALUE_ALL from '@salesforce/label/c.B2B_Source_Value_All_Label'; //BS-1096
import customerName from '@salesforce/label/c.B2B_VS_RX_ORDER_CUSTOMER_NAME'; //BS-1096
import clerkName from '@salesforce/label/c.B2B_CLERK_NAME'; //BS-1726
import HIDE_SEND_DELIVERY_BUTTON_COUNTRY_CODES from '@salesforce/label/c.B2B_HIDE_SEND_DELIVERY_BUTTON_COUNTRY_CODES'; //BS-1748
import VS_RX_ORDER_HISTORY_SOURCE_HELPTEXT from '@salesforce/label/c.B2B_VS_RX_ORDER_HISTORY_SOURCE_HELPTEXT'; //BS-2150
import cancel from '@salesforce/label/c.B2B_ACC_Cancel'; //BS-1064
import B2B_VS_RX_REORDER_LABEL from '@salesforce/label/c.B2B_VS_RX_REORDER_LABEL'; //BS-1064
import orderDetailLinks from '@salesforce/label/c.B2B_ACC_OH_Order_Details_Links'; //BS-2447
import requestOrderDetails from '@salesforce/label/c.B2B_ACC_OH_Request_Order_Details'; //BS-2447

//BS-437
import orderConfirmationMessage from '@salesforce/label/c.B2B_Order_History_Order_Conf_Message';
import deliveryNoteMessage from '@salesforce/label/c.B2B_Order_History_Delivery_Note_Message';
import invoiceMessage from '@salesforce/label/c.B2B_Order_Send_Invoice_Message';
import CONTINUE_SHOPPING_LABEL from '@salesforce/label/c.B2B_GEN_ContinueShopping';
import B2B_VS_RX_ORDER_HISTORY_LABELS from '@salesforce/label/c.B2B_VS_RX_Order_History_Labels'; //BS-1023
import B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS from '@salesforce/label/c.B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS'; //BS-1149
import B2B_VS_RX_ORDER_HISTORY_FILTERS from '@salesforce/label/c.B2B_VS_RX_ORDER_HISTORY_FILTERS'; //BS-1096
import B2B_ORDER_SENT_AND_SUBMITTED_STATUS_VALUE from '@salesforce/label/c.B2B_ORDER_SENT_AND_SUBMITTED_STATUS_VALUE'; //BS-1096
import LENS_ONLY_AND_FRAME_PROVIDED_EXCLUDED_COUNTRY_CODES from '@salesforce/label/c.B2B_VS_RX_LENS_ONLY_AND_FRAME_PROVIDED_EXCLUDED_COUNTRY_CODES'; //BS-1415
import B2B_APPLICABLE_ORDER_SOURCES_FOR_ORDER_DETAILS from '@salesforce/label/c.B2B_APPLICABLE_ORDER_SOURCES_FOR_ORDER_DETAILS'; //BS-1831
import B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS from '@salesforce/label/c.B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS'; //BS-2207
//Object and field info
import LENS_CONFIGURATOR from '@salesforce/schema/B2B_Lens_Configurator__c';
import ORDER_TYPE from '@salesforce/schema/Order.B2B_Configuration_Type__c';

import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';

const PAGE_SIZE = 10;
const FIRST_PAGE = 1;
const ORDER_DETAILS_PAGE = 'Order_Details__c';
const NAVIGATION_DESTINATION = 'comm__namedPage';
const REORDER_PAGE = 'Reorder__c'; //Added as part of BS-523
const ASCENDING_ORDER = 'asc';
const DESCENDING_ORDER = 'desc';
const ORDER_NUMBER = 'B2B_ERP_Order_Id__c';
const ORDERED_DATE = 'OrderedDate';
const STATUS = 'Status';
const SOURCE = 'Order_Source__c';
const ORDER_SOURCE_B2B_SHOP = 'Partner Portal';
const ORDER_SOURCE_B2B_SHOP_OLD = orderSourceB2BTypeValues.split(',')[1]; //BS-2447
const DOC_REQ_DISABLED_STATUS_LIST = ['Draft', '10', '15', '20', '25', '99', 'Activated']; //BS-437
const REQUEST_DOCUMENT_ENABLED_CLASS = 'document-enabled actionicon slds-m-right_small';
const REQUEST_DOCUMENT_DISABLED_CLASS = 'document-disabled actionicon slds-m-right_small';
const ORDER_INVOICE = '60';
const ORDER_SHIPPED = '40';
const ORDER_IN_PRODUCTION = '30';

const ORDER_CONFIRMATION = 'Order Confirmation';
const DELIVERY_NOTE = 'Delivery Note';
const INVOICE = 'Invoice';
//BS-1064 start
const RX_GLAZING_SITE_PAGE = 'RX__c';
const VISION_SENSATION_SITE_PAGE = 'VS__c';
const MY_VS_RX_PAGE_SOURCE_IDENTIFIER = 'fromMyVSRX';
const VS_BRAND = 'Vision Sensation';
const RX_BRAND = 'RX Glazing';
const STANDARD_NAMED_PAGE = 'standard__namedPage'; //BS-1064 end

const DATE_FORMAT = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}; //Added for BS-650

const SH_STORE = 'silhouette'; //Added as part of BS-687
const REQUEST_DOCUMENT_ENABLED_CLASS_NB = 'request-document-enabled'; //Added as part of BS-687
const REQUEST_DOCUMENT_DISABLED_CLASS_NB = 'request-document-disabled'; //Added as part of BS-687

const SH_EE = B2B_VS_RX_ORDER_HISTORY_LABELS.split(',')[0]; //BS-1023
const EE_RX = B2B_VS_RX_ORDER_HISTORY_LABELS.split(',')[1]; //BS-1023
const SH_VS = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[1]; //BS-1149
const VS_TAB = 'Vision Sensation'; //Added for future development
const RX_TAB = 'RX Glazing'; //BS-1023
const IN_CART_STATUS = 'In Cart'; //BS-1096
const DEFAULT_SEARCH_KEYWORD = ''; //BS-1096
const ALL = 'All'; //BS-1096
const VS_RX_TIME_FRAME = '180'; //BS-1161
const SH_EE_TIME_FRAME = '90'; //BS-1161
const LENS_ONLY_AND_FRAME_PROVIDED_ORDER_TYPE_VALUE = 'Lens Only + frame provided'; //BS-1415
const LENS_ONLY_AND_FRAMES_PROVIDED_COUNTRY_CODE_LIST = LENS_ONLY_AND_FRAME_PROVIDED_EXCLUDED_COUNTRY_CODES.split(','); //BS-1415
const CLERK_NAME = 'ClerkName'; //BS-1726
const SPECIAL_HANDLING = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[11]; //BS-1955
const NO_SELECTION = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[12]; //BS-1955
const CUSTOMER_SERVICE_LINK = 'CUSTOMER_SERVICE_LINK'; //BS-2150
const FALSE_VALUE = 'false'; //BS-2150
const SLDS_OPEN = 'slds-is-open'; //BS-2150
const SLDS_DROPDOWN_TRIGGER_CLICK = '.slds-dropdown-trigger_click'; //BS-2150
const CONTACT_CUSTOMER_SERVICE_PAGE_NAME = 'contact-customer-service'; //BS-2150
const VERTICAL_BAR_SYMBOL = '|'; //BS-2150
const FIELDS_TO_LIMIT_CHARACTERS = ['B2B_Configuration_Type__c', 'B2B_Customer_Name__c', 'B2B_Clerk__c', 'B2B_Special_Handling__c']; //BS-2217
const CHARACTERS_LIMIT = 20; //BS-2217
const ORDER_HISTORY = 'OrderHistory'; //BS-2207

export default class B2b_vs_rx_sh_ee_order_history_component extends NavigationMixin(LightningElement) {
    initialRecords;
    filteredResults = [];
    @track
    _orderSourcesVs = []; //BS-2150
    @track
    _orderSourcesRx = []; //BS-2150

    showModal = false;
    isLoading = false;
    isNoInvoiceRequested = false; //BS-1146

    selectedTimeframe = SH_EE_TIME_FRAME; ////BS-1161
    selectedTimeframeRx = VS_RX_TIME_FRAME; //BS-1096
    selectedTimeframeVs = VS_RX_TIME_FRAME; //BS-1161
    selectedStatus = ''; //BS-1909
    selectedStatusRx = ''; //BS-1909
    selectedStatusVs = ''; //BS-1909
    statusValueForAll = STATUS_VALUE_ALL; //BS-1909
    selectedSource = '';

    orderSources;
    orderStatuses;
    orderReferences;
    selectedOrderNumber;
    isOrderConfirmation = false;
    isDeleveryNote = false;
    isOrderInvoice = false;
    isOrderStatusSent;
    selectedOrderId;
    orderStatusApiVsLabelMap = new Map();
    trackingReferences = [];
    deliveryNoteReferences = [];
    orderInformationReferences = [];
    isOrderConfirmationSent = false;
    isDeleveryNoteSent = false;
    isOrderInvoiceSent = false;
    showTrackingNumber = false;
    accountEmail;
    printSVG = STORE_STYLING + '/icons/print.svg'; //BS-2207
    printLabel = B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[6]; //BS-2207

    @track _orderStatus;
    @track _orderSource;
    @track selectedOrderType;
    //BS-1096 start
    @track _orderType = [];
    @track _configurationTypeRx;
    @track _configurationTypeVs; //BS-1161
    @track _orderStatus2 = [];
    @track _selectedOrderStatus;
    //BS-1096 end

    @track b2bOrderRecordTypeId; //Added for BS-716

    //For Sorting
    sortedColumn;
    sortDirection;
    orderNumberAsc;
    orderNumberDesc;
    orderDateAsc;
    orderDateDesc;
    statusDesc;
    statusAsc;
    sourceAsc;
    sourceDesc;
    _isLoading;
    _continueShoppingButtonLabel = CONTINUE_SHOPPING_LABEL;
    clerkNameDesc; //BS-1726
    clerkNameAsc; //BS-1726
    //for VS and RX
    isEligibleForVS = false;
    isEligibleForRX = false;
    _selectedVSRX = false; //BS-1149
    _showFiltersForRX = false; //BS-1149
    _showFiltersForVS = false; //BS-1161
    dateFormat; //BS-2142

    //page number for pagination component
    _pageNumber = FIRST_PAGE;
    _applicableOrderSources = []; // Added as a part of BS-1831

    //BS-1064 start
    _showReorderModal = false;
    _orderToCopyId;
    _completeStepForNavigation;
    _applicableBrand;
    _reorderMessage = B2B_VS_RX_REORDER_LABEL.split('|')[0];
    _reorderMessageFirstPart = this._reorderMessage.split(',')[0];
    _reorderMessageSecondPart = this._reorderMessage.split(',')[1];
    _reorderForVS = B2B_VS_RX_REORDER_LABEL.split('|')[1];
    _reorderForRX = B2B_VS_RX_REORDER_LABEL.split('|')[2];

    @track
    _frameInformationCollection = {};

    @track
    lensConfiguratorCollectionData = {}; //BS-1064 end
    /**
     * The number of items on a page.
     *
     *
     *  @type {Number}
     */
    @track _pageSize;

    /**
     * Current user Account ID
     */
    @track effectiveAccountId;

    /**
     * This variable is used to hold label value of Silhoutte that needs to be shown as Tab option
     * BS-1023
     * @type {String}
     */
    _labelForSHEE = SH_EE;

    /**
     * This variable is used to hold label value of Evil eye RX that needs to be shown as Tab option
     * BS-1023
     * @type {String}
     */
    _labelForEERX = EE_RX;

    /**
     * This variable is used to hold label value of 100% Silhouette that needs to be shown as Tab option
     * BS-1149
     * @type {String}
     */
    _labelForSHVS = SH_VS;

    /**
     * The total number of items in the list.
     *
     * @type {Number}
     */
    @track _totalItemCount;

    //this will get the current page number of pagination component

    /**
     * This variable is used to hold the value entered in text-input search field on UI of RX tab
     * BS-1096
     * @type {String}
     */
    _searchKeywordRx = DEFAULT_SEARCH_KEYWORD;

    /**
     * This variable is used to hold the value entered in text-input search field on UI of VS tab
     * //BS-1161
     * @type {String}
     */
    _searchKeywordVs = DEFAULT_SEARCH_KEYWORD;
    _searchKeyword = DEFAULT_SEARCH_KEYWORD;
    _countryCode; //BS-1415
    _selectedSourceVs = ORDER_SOURCE_B2B_SHOP;
    _selectedSourceRx = ORDER_SOURCE_B2B_SHOP;
    _contactCustomerServiceRedirectUrl; //BS-2150
    _SourceHelptextLabel; //BS-2150
    _sourceListVisibilityVS = ''; //BS-2150
    _sourceListVisibilityRX = ''; //BS-2150

    /**
     * This variable is used to handle onfocusout event on custom Source combobox
     * on UI of VS/RX tab
     * BS-2150
     * @type {Boolean}
     */
    _allowVsRxSourceListVisibilityToggle = true;

    get pageNumber() {
        return this._pageNumber;
    }

    get orderSource() {
        return this._orderSource;
    }

    get orderStatus() {
        return this._orderStatus;
    }

    /* Start BS-704 */
    get lastmonth() {
        let lastMonthArray = LAST_MONTH.split(' ');
        for (let i = 0; i < lastMonthArray.length; i++) {
            let element = lastMonthArray[i];
            let updatedString = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
            lastMonthArray[i] = updatedString;
        }
        return lastMonthArray.join(' ');
    }

    get last3months() {
        let lastMonthArray = LAST_3_MONTHS.split(' ');
        for (let i = 0; i < lastMonthArray.length; i++) {
            let element = lastMonthArray[i];
            let updatedString = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
            lastMonthArray[i] = updatedString;
        }
        return lastMonthArray.join(' ');
    }

    get last6months() {
        let lastMonthArray = LAST_6_MONTHS.split(' ');
        for (let i = 0; i < lastMonthArray.length; i++) {
            let element = lastMonthArray[i];
            let updatedString = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
            lastMonthArray[i] = updatedString;
        }
        return lastMonthArray.join(' ');
    }

    get last12months() {
        let lastMonthArray = LAST_12_MONTHS.split(' ');
        for (let i = 0; i < lastMonthArray.length; i++) {
            let element = lastMonthArray[i];
            let updatedString = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
            lastMonthArray[i] = updatedString;
        }
        return lastMonthArray.join(' ');
    }

    get last24months() {
        let lastMonthArray = LAST_24_MONTHS.split(' ');
        for (let i = 0; i < lastMonthArray.length; i++) {
            let element = lastMonthArray[i];
            let updatedString = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
            lastMonthArray[i] = updatedString;
        }
        return lastMonthArray.join(' ');
    }

    /* End BS-704 */

    get timeframeOptions() {
        return [
            { label: this.lastmonth, value: '30' },
            { label: this.last3months, value: '90' },
            { label: this.last6months, value: '180' },
            { label: this.last12months, value: '365' },
            { label: this.last24months, value: '730' }
        ];
    }

    /**
     * Wire call to get the info about the Lens Configurator Object
     * BS-1096
     * @type {object}
     */
    @wire(getObjectInfo, { objectApiName: LENS_CONFIGURATOR })
    lensConfiguratorInfo;

    /**
     * Wire call to get the order type field
     * BS-1096
     * @type {object}
     */
    @wire(getPicklistValues, { recordTypeId: '$b2bOrderRecordTypeId', fieldApiName: ORDER_TYPE })
    getOrderType({ error, data }) {
        if (data) {
            let orderType = JSON.parse(JSON.stringify(data.values));
            let item = { label: this.labels.STATUS_VALUE_ALL, value: ALL };
            this._orderType.push(item);
            orderType.forEach((field) => {
                //BS-1415 Start
                if (field.value === LENS_ONLY_AND_FRAME_PROVIDED_ORDER_TYPE_VALUE) {
                    if (LENS_ONLY_AND_FRAMES_PROVIDED_COUNTRY_CODE_LIST.includes(this._countryCode) === false) {
                        this._orderType.push(field);
                    }
                } else {
                    this._orderType.push(field);
                }
                //BS-1415 Start
            });
            this._configurationTypeVs = ALL;
            this._configurationTypeRx = ALL; //BS-1161
        } else if (error) {
            console.error(error);
        }
    }

    orderType = B2B_VS_RX_ORDER_HISTORY_FILTERS.split(',')[0]; //BS-1096
    enterKeyword = B2B_VS_RX_ORDER_HISTORY_FILTERS.split(',')[3]; //BS-1096

    //Added as part of BS-687
    infoSVG = STORE_STYLING + '/icons/INFO.svg';
    reorderIcon = STORE_STYLING + '/icons/reorder-image-icon.png';
    closeIcon = STORE_STYLING + '/icons/close.svg';
    externalLink = STORE_STYLING + '/icons/externalLink.svg';
    _isSilhouetteStore = false;
    refreshIcon = STORE_STYLING + '/icons/refresh_icon.svg'; //BS-2175
    endConsumerLabel = customerName.includes('/') ? customerName.split('/')[0] + '/' : customerName;
    referenceLabel = customerName.includes('/') ? customerName.split('/')[1] : null;

    labels = {
        nolinks,
        close,
        orderhistory,
        source,
        selectsource,
        status,
        selectstatus,
        timeframe,
        orderresetfilters,
        furtherinfos,
        deliverylinks,
        orderconfirmationlinks,
        trackinglinks,
        noorders,
        invoicelinks,
        sendorderconfirmation,
        senddelivery,
        sendinvoice,
        successMessage,
        errorMessage,
        ordernumber,
        orderdate,
        otherAction,
        requestDocument,
        orderDetails,
        orderConfirmationMessage,
        deliveryNoteMessage,
        invoiceMessage,
        reorder,
        STATUS_VALUE_ALL,
        customerName,
        disableSendInvoice, //BS-1146
        clerkName, //BS-1726
        SPECIAL_HANDLING, //BS-1955
        cancel,
        orderDetailLinks,
        requestOrderDetails
    };

    // Commented out for BS-716
    // @wire(getObjectInfo, { objectApiName: ORDER_OBJECT })
    // orderInfo

    //Added logic for BS-716
    @wire(getObjectInfo, { objectApiName: ORDER_OBJECT })
    orderInfo({ error, data }) {
        if (data) {
            const recordTypeIds = data.recordTypeInfos;
            this.b2bOrderRecordTypeId = Object.keys(recordTypeIds).find((recordTypeId) => recordTypeIds[recordTypeId].name === 'B2B Order');
        } else if (error) {
            console.error(error);
        }
    }

    connectedCallback() {
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');

        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }
        this.isLoading = true;

        this.getAccountInfo(); //BS-437 : to get the users Account Email ID
        this.getAccountIdOfCurrentUser(); //BS-1023
        this.getApplicableOrderSources(); //BS-1831
        //BS-2150
        this._contactCustomerServiceRedirectUrl = redirectToPage(CONTACT_CUSTOMER_SERVICE_PAGE_NAME);
        if (this._contactCustomerServiceRedirectUrl) {
            let customerServiceLinkTagValue =
                '<a href="' + this._contactCustomerServiceRedirectUrl + '">' + VS_RX_ORDER_HISTORY_SOURCE_HELPTEXT.split(VERTICAL_BAR_SYMBOL)[1] + '</a>';
            this._SourceHelptextLabel = VS_RX_ORDER_HISTORY_SOURCE_HELPTEXT.split(VERTICAL_BAR_SYMBOL)[0].replace(
                CUSTOMER_SERVICE_LINK,
                customerServiceLinkTagValue
            );
        }
    }

    /**
     * Author: Soumyakant Pandya
     * BS-1831 : This method will fetch STATUS_VALUE_ALL the Order Sources from the Custom Label and store it in an Array
     */
    getApplicableOrderSources() {
        for (let i = 0; i < B2B_APPLICABLE_ORDER_SOURCES_FOR_ORDER_DETAILS.split(',').length; i++) {
            this._applicableOrderSources.push(B2B_APPLICABLE_ORDER_SOURCES_FOR_ORDER_DETAILS.split(',')[i]);
        }
    }

    //Updated the value of parameter to pass 'B2B' record type Id --> BS-716
    @wire(getPicklistValues, { recordTypeId: '$b2bOrderRecordTypeId', fieldApiName: ORDERSOURCE_FIELD })
    sourceValues({ error, data }) {
        if (data) {
            this.orderSources = data.values;
            //BS-2150 Start
            this.orderSources.forEach((source) => {
                let orderSourceObj = {};
                orderSourceObj.label = source.label;
                orderSourceObj.value = source.value;
                orderSourceObj.disabled = false;
                orderSourceObj.selected = false;
                if (source.value === ORDER_SOURCE_B2B_SHOP) {
                    orderSourceObj.selected = true;
                }
                this._orderSourcesVs.push(orderSourceObj);
                this._orderSourcesRx.push(orderSourceObj);
            });
            //BS-2150 End
        } else if (error) {
            console.log(error);
        }
    }

    //Updated the value of parameter to pass 'B2B' record type Id --> BS-716
    @wire(getPicklistValues, { recordTypeId: '$b2bOrderRecordTypeId', fieldApiName: ORDERSTATUS_FIELD })
    statusValues({ error, data }) {
        if (data) {
            this.orderStatuses = data.values;

            let findIndex = data.values.findIndex((instance) => instance.value == 10);
            this.orderStatuses = JSON.parse(JSON.stringify(this.orderStatuses));
            let allOption = { label: this.statusValueForAll, value: '' }; //Added as a part of BS-1909
            // BS-1101
            if (findIndex !== -1) {
                this.orderStatuses.splice(0, 1, allOption);
            }
            this.orderStatuses.forEach((statusEntry) => {
                this.orderStatusApiVsLabelMap.set(statusEntry.value, statusEntry.label);
            });
        } else if (error) {
            console.log(error);
        }
    }

    /*
    BS-1023
    Getting account id of current user
    */
    getAccountIdOfCurrentUser() {
        accountIdByCurrentUser({})
            .then((result) => {
                this.effectiveAccountId = result;
                this.checkEligibilityForVisionSensationEvilEyeRX(); //Bs-1023
                //BS-1415 Start
                if (this.effectiveAccountId != null && this.effectiveAccountId != undefined) {
                    getAccountDetail({ recordId: this.effectiveAccountId })
                        .then((accounData) => {
                            if (accounData !== undefined && accounData !== null) {
                                this._countryCode = accounData.k_ARIS_Account_ID__c ? accounData.k_ARIS_Account_ID__c.substring(0, 4) : '';
                                if (
                                    LENS_ONLY_AND_FRAMES_PROVIDED_COUNTRY_CODE_LIST.includes(this._countryCode) === true &&
                                    this._orderType != undefined &&
                                    this._orderType != null
                                ) {
                                    let updatedOrderTypeList = [];
                                    this._orderType.forEach((field) => {
                                        if (field.value !== LENS_ONLY_AND_FRAME_PROVIDED_ORDER_TYPE_VALUE) {
                                            updatedOrderTypeList.push(field);
                                        }
                                    });
                                    this._orderType = updatedOrderTypeList;
                                }
                                this.getCountrySpecificDateFormatData(); //BS-2142
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                }
                //BS-1415 End
            })
            .catch((exceptionInstance) => {
                console.error('Error:', exceptionInstance);
            });
    } //end getAccountIdOfCurrentUser

    /* Start of BS-2142 */
    async getCountrySpecificDateFormatData() {
        if (this._countryCode != null && this._countryCode != undefined) {
            getCountryDateFormat({
                countryCode: this._countryCode
            })
                .then((result) => {
                    this.dateFormat = result;
                })
                .catch((error) => {
                    console.error(error);
                });
        }
        this.getOrderData();
    }
    /* End of BS-2142 */

    /**
     * BS-1023
     * This method is used to check eligibility of current user for order history evil eye tab
     *
     * @type {Category[]}
     */
    checkEligibilityForVisionSensationEvilEyeRX() {
        checkVSRXEligibilityFromAccount({ accountId: this.effectiveAccountId })
            .then((result) => {
                if (result != null && result != undefined) {
                    this.isEligibleForVS = result.isEligibleForVS;
                    this.isEligibleForRX = result.isEligibleForRX;
                }
            })
            .catch((exceptionInstance) => {
                console.error('Error:', exceptionInstance);
            });
    } //end checkEligibilityForVisionSensationEvilEyeRX method

    /**
     * This method is used to handle tab selection event on UI
     * BS-1023
     */
    handleTabSelection(event) {
        if (event.target.value != null && event.target.value != undefined) {
            this.filteredResults = [];
            this._isLoading = true; // Turning on loading spinner
            let applicableBrand = event.target.value; //Getting value of current active tab

            //Checking whether switched tab is RX
            if (applicableBrand == EE_RX) {
                this._selectedVSRX = true;
                this.selectedOrderType = RX_TAB;
                this._showFiltersForRX = true;
                this._showFiltersForVS = false; //BS-1161
                this._searchKeywordRx = '';
            } else if (applicableBrand == SH_VS) {
                //BS-1149
                this._selectedVSRX = true;
                this.selectedOrderType = VS_TAB;
                this._showFiltersForVS = true;
                this._showFiltersForRX = false; //BS-1161
                this._searchKeywordVs = '';
            } else if (applicableBrand === SH_EE) {
                this._selectedVSRX = false;
                this._showFiltersForVS = false;
                this._showFiltersForRX = false; //BS-1161
                this._searchKeyword = '';
                this.selectedOrderType = '';
            } else {
                this._selectedVSRX = false;
                this.selectedOrderType = '';
                this._showFiltersForVS = false;
                this._showFiltersForRX = false;
            }
            this.resetVSRXSource(); //BS-2150
            this.getOrderData();
        }
        // On switch of tab, redirect user to 1st page
        this._pageNumber = FIRST_PAGE;
    }

    getOrderData() {
        //BS-1096 start
        let timeFrame;
        let orderStatus;
        let orderConfigurationType; //BS-1161
        let orderSource; //BS-1161
        if (this.selectedOrderType == RX_TAB) {
            timeFrame = this.selectedTimeframeRx;
            orderStatus = this.selectedStatusRx;
            orderConfigurationType = this._configurationTypeRx; //BS-1161
            orderSource = this._selectedSourceRx;
        } else if (this.selectedOrderType == VS_TAB) {
            timeFrame = this.selectedTimeframeVs; //BS-1161
            orderStatus = this.selectedStatusVs; //BS-1161
            orderConfigurationType = this._configurationTypeVs;
            orderSource = this._selectedSourceVs;
        } else {
            timeFrame = this.selectedTimeframe;
            orderStatus = this.selectedStatus;
            orderConfigurationType = null;
            orderSource = this.selectedSource; //BS-1161
        }
        ////BS-1096 end
        getOrderHistoryList({
            selectedTimeframe: timeFrame,
            status: orderStatus,
            source: orderSource,
            orderType: this.selectedOrderType,
            configurationType: orderConfigurationType
        })
            .then((result) => {
                //Added as part of BS-650
                this.isNoInvoiceRequested = result && result[0] && result[0].Account && result[0].Account.B2B_No_Invoice_Request__c == true ? true : false; //BS-1146
                result.forEach((element) => {
                    //BS-2142
                    let lastOrderDateValue = new Date(element.OrderedDate);
                    element.displayableOrderedDate = new Intl.DateTimeFormat(this.dateFormat, DATE_FORMAT).format(lastOrderDateValue);
                    //BS-1726
                    if (element.B2B_Clerk__c) {
                        let clerkName = element.B2B_Clerk__c.toLowerCase();
                        element.ClerkName = clerkName;
                    }
                    //BS-1955
                    if (element.B2B_Special_Handling__c == NO_SELECTION) {
                        element.B2B_Special_Handling__c = null;
                    }
                });

                this.filteredResults = result;
                if (this.filteredResults.length > 0) {
                    let filteredResultsClone = this.filteredResults;
                    filteredResultsClone.forEach((element) => {
                        if (element.Status == B2B_ORDER_SENT_AND_SUBMITTED_STATUS_VALUE.split(',')[0]) {
                            element.Status = B2B_ORDER_SENT_AND_SUBMITTED_STATUS_VALUE.split(',')[1];
                        }
                    });
                    //BS-2217
                    this.filteredResults = this.addFieldValueCharacterLimit(filteredResultsClone, FIELDS_TO_LIMIT_CHARACTERS, CHARACTERS_LIMIT);
                }
                this.initialRecords = result;
                this._pageSize = PAGE_SIZE;
                this._totalItemCount = this.filteredResults.length;
                this.sortedColumn = ORDERED_DATE;
                this.onHandleSort();
                this.error = undefined;
                this._isLoading = false;
            })
            .catch((error) => {
                console.log(error);
                this.error = error;
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    getOrderReferenceData(orderId) {
        getOrderReferenceList({
            orderId: orderId
        })
            .then((result) => {
                this.orderReferences = result;

                for (let orderReference of this.orderReferences) {
                    if (orderReference.B2B_Order_Reference_Type__c === 'Tracking') {
                        this.trackingReferences.push(orderReference);
                    } else {
                        console.log('new link type provided');
                    }
                }

                this.showModal = true;
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    get hasTrackingLinks() {
        return this.trackingReferences.length > 0 ? true : false;
    }

    get hasOrders() {
        return this.filteredResults.length > 0 ? true : false;
    }

    handleTimeframeChange(event) {
        this.isLoading = true;
        this.initialRecords = [];
        this.filteredResults = [];
        this.selectedTimeframe = event.detail.value;
        this._searchKeyword = ''; //BS-2088
        this._pageNumber = FIRST_PAGE;
        this.getOrderData();
    }

    //BS-1096
    handleTimeframeChangeVsRx(event) {
        this.isLoading = true;
        this.initialRecords = [];
        this.filteredResults = [];
        if (this.selectedOrderType == VS_TAB) {
            //BS-1161
            this.selectedTimeframeVs = event.detail.value;
            this._searchKeywordVs = '';
        } else {
            this.selectedTimeframeRx = event.detail.value;
            this._searchKeywordRx = '';
        }
        this._pageNumber = FIRST_PAGE;
        this.getOrderData();
    }

    openModal(event) {
        //BS-1161
        if (event && event.target.dataset.disabled == REQUEST_DOCUMENT_ENABLED_CLASS) {
            let order = event.target.name;
            let orderDocumentRequestDisabled = event.target.dataset.orderDocumentRequestDisabled;
            let orderId = event.target.dataset.id;
            let erpOrder = event.target.dataset.erpOrder;
            let orderStatus = event.target.dataset.status;
            let orderSource = event.target.dataset.source;

            //BS-437 Added logic to enable and disable the buttons based on order status value
            if (orderDocumentRequestDisabled != REQUEST_DOCUMENT_DISABLED_CLASS) {
                if (this.orderStatusApiVsLabelMap.has(ORDER_INVOICE) && orderStatus == this.orderStatusApiVsLabelMap.get(ORDER_INVOICE)) {
                    this.isOrderInvoice = true;
                    // BS-1748 Hide delivery note button from US storefront users
                    if (HIDE_SEND_DELIVERY_BUTTON_COUNTRY_CODES.includes(this._countryCode) == false) {
                        this.isDeleveryNote = true;
                    }
                    this.isOrderConfirmation = true;
                    this.showTrackingNumber = true;
                } else if (this.orderStatusApiVsLabelMap.has(ORDER_SHIPPED) && orderStatus == this.orderStatusApiVsLabelMap.get(ORDER_SHIPPED)) {
                    // BS-1748 Hide delivery note button from US storefront users
                    if (HIDE_SEND_DELIVERY_BUTTON_COUNTRY_CODES.includes(this._countryCode) == false) {
                        this.isDeleveryNote = true;
                    }
                    this.isOrderConfirmation = true;
                    this.showTrackingNumber = true;
                } else if (this.orderStatusApiVsLabelMap.has(ORDER_IN_PRODUCTION) && orderStatus == this.orderStatusApiVsLabelMap.get(ORDER_IN_PRODUCTION)) {
                    this.isOrderConfirmation = true;
                }
                this.selectedOrderId = orderId;
                this.selectedOrderNumber = erpOrder;
                this.isLoading = true;
                this.getOrderReferenceData(orderId);
            }
        }
    }
    //reseting the variables on modal close
    closeModal() {
        this.isOrderConfirmation = false;
        this.isDeleveryNote = false;
        this.isOrderInvoice = false;
        this.isOrderConfirmationSent = false;
        this.isDeleveryNoteSent = false;
        this.isOrderInvoiceSent = false;
        this.showTrackingNumber = false;
        this.showModal = false;
        this.trackingReferences = [];
        this.orderInformationReferences = [];
        this.deliveryNoteReferences = [];
    }

    handleSourceChange(event) {
        this.isLoading = true;
        this.selectedSource = event.target.value;
        this._searchKeyword = ''; //BS-2088
        this._pageNumber = FIRST_PAGE;
        this.getOrderData();
    }

    handleStatusChange(event) {
        this.isLoading = true;
        this.selectedStatus = event.target.value;
        this._pageNumber = FIRST_PAGE;
        this._searchKeyword = ''; //BS-2088
        this.getOrderData();
    }

    //BS-1096
    handleStatusChangeVsRx(event) {
        this.isLoading = true;
        if (this.selectedOrderType == VS_TAB) {
            //BS-1161
            this.selectedStatusVs = event.target.value;
            this._searchKeywordVs = '';
        } else {
            this.selectedStatusRx = event.target.value;
            this._searchKeywordRx = '';
        }
        this._pageNumber = FIRST_PAGE;
        this.getOrderData();
    }

    //BS-2088
    handleSourceChangeVsRx(event) {
        this.isLoading = true;
        if (this.selectedOrderType == VS_TAB) {
            this._searchKeywordVs = '';
            if (this._orderSourcesVs !== undefined && this._orderSourcesVs !== null && this._orderSourcesVs.length > 0) {
                this._orderSourcesVs.forEach((sourceObj) => {
                    if (event.target.dataset.disabled === FALSE_VALUE && event.target.dataset.value === sourceObj.value) {
                        sourceObj.selected = true;
                        this._selectedSourceVs = sourceObj.value;
                    } else {
                        if (event.target.dataset.disabled === FALSE_VALUE) {
                            sourceObj.selected = false;
                        }
                    }
                });
            }
        } else {
            if (this._orderSourcesRx !== undefined && this._orderSourcesRx !== null && this._orderSourcesRx.length > 0) {
                this._orderSourcesRx.forEach((sourceObj) => {
                    if (event.target.dataset.disabled === FALSE_VALUE) {
                        if (event.target.dataset.value === sourceObj.value) {
                            sourceObj.selected = true;
                            this._selectedSourceRx = sourceObj.value;
                        } else {
                            sourceObj.selected = false;
                        }
                    }
                });
            }
            this._searchKeywordRx = '';
        }
        this._pageNumber = FIRST_PAGE;
        if (event.target.dataset.disabled === FALSE_VALUE) {
            this.getOrderData();
        } else {
            this.isLoading = false;
        }
        if (this.selectedOrderType == VS_TAB) {
            let element = this.template.querySelector('[data-id="VS-Source"]');
            if (element.classList.contains(SLDS_OPEN)) {
                element.classList.remove(SLDS_OPEN);
                this._allowVsRxSourceListVisibilityToggle = false;
            }
        } else {
            let element = this.template.querySelector('[data-id="RX-Source"]');
            if (element.classList.contains(SLDS_OPEN)) {
                element.classList.remove(SLDS_OPEN);
                this._allowVsRxSourceListVisibilityToggle = false;
            }
        }
    }

    //BS-1096
    handleOrderTypeChange(event) {
        this.isLoading = true;
        if (this.selectedOrderType == VS_TAB) {
            this._configurationTypeVs = event.target.value;
            this._searchKeywordVs = '';
        } else {
            this._configurationTypeRx = event.target.value;
            this._searchKeywordRx = '';
        }
        this._pageNumber = FIRST_PAGE;
        this.getOrderData();
    }

    handleResetFilters() {
        this.isLoading = true;
        if (this.selectedOrderType == VS_TAB) {
            //BS-1161
            this._configurationTypeVs = ALL;
            this.selectedTimeframeVs = VS_RX_TIME_FRAME;
            this.selectedStatusVs = ''; //BS-1909
            this._searchKeywordVs = ''; //BS-1096
            this._selectedSourceVs = ORDER_SOURCE_B2B_SHOP; //BS-2088
        } else if (this.selectedOrderType == RX_TAB) {
            this.selectedStatusRx = ''; //BS-1909
            this._configurationTypeRx = ALL;
            this._searchKeywordRx = ''; //BS-1096
            this.selectedTimeframeRx = VS_RX_TIME_FRAME;
            this._selectedSourceRx = ORDER_SOURCE_B2B_SHOP; //BS-2088
        } else {
            this.selectedStatus = ''; //BS-1909
            this.selectedSource = null;
            this._orderStatus = null;
            this._orderSource = null;
            this._searchKeyword = ''; //BS-2088
            this.selectedTimeframe = SH_EE_TIME_FRAME;
        }
        this.template.querySelectorAll('.clear-text').forEach((each) => {
            each.value = null;
        }); //BS-436 to clear values from lightning combobox
        this.resetVSRXSource(); //BS-2150
        this.filteredResults = [];
        this._pageNumber = FIRST_PAGE;
        this.getOrderData();
    }

    onHandleSort(event) {
        this._isLoading = true;
        this._pageNumber = FIRST_PAGE;
        this.orderNumberAsc = false;
        this.orderNumberDesc = false;
        this.clerkNameAsc = false; //BS-1726
        this.clerkNameDesc = false; //BS-1726
        this.orderDateAsc = false;
        this.orderDateDesc = false;
        this.statusDesc = false;
        this.statusAsc = false;
        this.sourceAsc = false;
        this.sourceDesc = false;
        let columnName = event ? event.target.name : undefined;
        //BS-1726 Start
        if (columnName && columnName === CLERK_NAME) {
            this.sortedColumn = CLERK_NAME;
        } else if (columnName && columnName === ORDERED_DATE) {
            this.sortedColumn = ORDERED_DATE;
        }
        //BS-1726 End
        if (this.sortedColumn === columnName) {
            this.sortDirection = this.sortDirection === ASCENDING_ORDER ? DESCENDING_ORDER : ASCENDING_ORDER;
        } else {
            this.sortDirection = DESCENDING_ORDER;
        }

        if (columnName) {
            this.sortedColumn = columnName;
        } else {
            columnName = this.sortedColumn;
        }

        switch (columnName) {
            case ORDER_NUMBER:
                if (this.sortDirection == ASCENDING_ORDER) this.orderNumberAsc = true;
                else this.orderNumberDesc = true;

                break;

            case ORDERED_DATE:
                if (this.sortDirection == ASCENDING_ORDER) this.orderDateAsc = true;
                else this.orderDateDesc = true;

                break;

            case STATUS:
                if (this.sortDirection == ASCENDING_ORDER) this.statusAsc = true;
                else this.statusDesc = true;

                break;

            case SOURCE:
                if (this.sortDirection == ASCENDING_ORDER) this.sourceAsc = true;
                else this.sourceDesc = true;

                break;
            //BS-1726
            case CLERK_NAME:
                if (this.sortDirection === ASCENDING_ORDER) this.clerkNameAsc = true;
                else this.clerkNameDesc = true;

                break;
        }

        const cloneData = [...this.initialRecords];

        cloneData.sort(sortBy(columnName, this.sortDirection === ASCENDING_ORDER ? 1 : -1));
        this._isLoading = false;
        //BS-2217
        this.filteredResults = this.addFieldValueCharacterLimit(cloneData, FIELDS_TO_LIMIT_CHARACTERS, CHARACTERS_LIMIT);
    }

    handleSend(event) {
        let requestButtonName = event.target.dataset.name;
        if (requestButtonName == ORDER_CONFIRMATION) {
            this.template.querySelector('[data-name="Order Confirmation"]').disabled = true;
            this.isOrderConfirmationSent = true;
        } else if (requestButtonName == DELIVERY_NOTE) {
            this.template.querySelector('[data-name="Delivery Note"]').disabled = true;
            this.isDeleveryNoteSent = true;
        } else if (requestButtonName == INVOICE) {
            this.template.querySelector('[data-name="Invoice"]').disabled = true;
            this.isOrderInvoiceSent = true;
        }
        this.createOrderDocumentRequestRecord(this.selectedOrderId, requestButtonName);
    }

    createOrderDocumentRequestRecord(orderId, requestType) {
        createOrderDocumentRequest({
            orderId: orderId,
            requestType: requestType
        })
            .then((result) => {
                const toastEvent = new ShowToastEvent({
                    message: this.labels.successMessage,
                    variant: 'success'
                });
                this.dispatchEvent(toastEvent);
            })
            .catch((error) => {
                const toastEvent = new ShowToastEvent({
                    message: this.labels.errorMessage,
                    variant: 'error'
                });
                this.dispatchEvent(toastEvent);
            });
    }

    // this will sort records in batch of 10
    get orderRecords() {
        let orderRecords = [];
        let counter = 0;
        this.filteredResults.forEach((element) => {
            if (counter >= this._pageNumber * 10 - 10 && counter < this._pageNumber * 10) {
                //Updated as a part of BS-1831
                if (this._applicableOrderSources.includes(element.Order_Source__c)) {
                    element.isFromB2bShop = true;
                } else {
                    element.isFromB2bShop = false;
                }

                if (DOC_REQ_DISABLED_STATUS_LIST.includes(this.getByValue(this.orderStatusApiVsLabelMap, element.Status))) {
                    element.documentRequestDisabled = REQUEST_DOCUMENT_DISABLED_CLASS;
                } else {
                    element.documentRequestDisabled = REQUEST_DOCUMENT_ENABLED_CLASS;
                }
                element.isFromOldShop = false;
                element.printDisabled = REQUEST_DOCUMENT_ENABLED_CLASS;
                element.reorderDisabled = REQUEST_DOCUMENT_ENABLED_CLASS;
                element.showOrderDetailDisabled = REQUEST_DOCUMENT_ENABLED_CLASS;
                if (element.B2B_Configuration_Type__c && element.Order_Source__c == ORDER_SOURCE_B2B_SHOP_OLD) {
                    element.isFromOldShop = true;
                    element.documentRequestDisabled = REQUEST_DOCUMENT_ENABLED_CLASS;
                    element.printDisabled = REQUEST_DOCUMENT_DISABLED_CLASS;
                    element.reorderDisabled = REQUEST_DOCUMENT_DISABLED_CLASS;
                    element.showOrderDetailDisabled = REQUEST_DOCUMENT_DISABLED_CLASS;
                }
                element.serialNumber = counter + 1;
                orderRecords.push(element);
            }
            counter = counter + 1;
        });
        return orderRecords;
    }

    //to jump on next page of a pagination component as per BS-2128
    handlePageJump(event) {
        this._pageNumber = event.detail;
    }

    //to jump on next page of a pagination component
    handleNextPage(evt) {
        this._pageNumber = this._pageNumber + 1;
    }

    //to jump on previous page of pagination component
    handlePreviousPage(evt) {
        this._pageNumber = this._pageNumber - 1;
    }

    showOrderDetail(event) {
        if (event && event.target.dataset.disabled == REQUEST_DOCUMENT_ENABLED_CLASS) {
            this[NavigationMixin.GenerateUrl]({
                type: NAVIGATION_DESTINATION,
                attributes: {
                    name: ORDER_DETAILS_PAGE
                },
                state: {
                    recordId: event.target.dataset.recordId
                }
            }).then((url) => {
                window.open(url, '_blank');
            });
        }
    }

    //This method will return Key from the value in map BS-437
    getByValue(map, searchValue) {
        for (let [key, value] of map.entries()) {
            if (value === searchValue) return key;
        }
    }

    handleRedirection(event) {
        if (this._selectedVSRX == false) {
            this[NavigationMixin.GenerateUrl]({
                type: NAVIGATION_DESTINATION,
                attributes: {
                    name: REORDER_PAGE
                },
                state: {
                    orderNumber: event.target.dataset.orderNumber,
                    orderId: event.target.dataset.recordId // Added as part of BS-940
                }
            }).then((url) => {
                window.open(url, '_blank');
            });
        } //end if
    }

    /* Start of BS-2207*/
    handlePrintClick(event) {
        if (event && event.target.dataset.disabled == REQUEST_DOCUMENT_ENABLED_CLASS) {
            this[NavigationMixin.GenerateUrl]({
                type: NAVIGATION_DESTINATION,
                attributes: {
                    name: ORDER_DETAILS_PAGE
                },
                state: {
                    recordId: event.target.dataset.recordId,
                    source: ORDER_HISTORY
                }
            }).then((url) => {
                window.open(url, '_blank');
            });
        }
    }
    /* End of BS-2207*/

    //This method will get the Accounts email Id of the current user BS-437
    getAccountInfo() {
        getAccountEmail()
            .then((result) => {
                this.accountEmail = result;
            })
            .catch((error) => {
                const toastEvent = new ShowToastEvent({
                    message: this.labels.errorMessage,
                    variant: 'error'
                });
                this.dispatchEvent(toastEvent);
            });
    }

    handleRedirectToHome() {
        this[NavigationMixin.GenerateUrl]({
            type: NAVIGATION_DESTINATION,
            attributes: {
                name: 'Home'
            }
        }).then((url) => {
            window.open(url, '_self');
        });
    }

    /**
     * This method is used to rectify the order records that are matching the keyword entered by user
     * BS-1096
     */
    handleSearch(event) {
        if (
            event.target != null &&
            event.target != undefined &&
            event.target.name != null &&
            event.target.name != undefined &&
            event.target.value != null &&
            event.target.value != undefined
        ) {
            this._isLoading = true;
            let filterValue = event.target.value; // Value selected by user as filter option
            this._pageNumber = FIRST_PAGE;
            if (this.selectedOrderType == VS_TAB) {
                //BS-1161
                this._searchKeywordVs = filterValue;
            } else if (this.selectedOrderType == RX_TAB) {
                this._searchKeywordRx = filterValue;
            } else {
                this._searchKeyword = filterValue;
            }
            let parsedOrders = JSON.parse(JSON.stringify(this.initialRecords));
            let resultedOrderData = [];
            this.filteredResults = [];
            parsedOrders.forEach((record) => {
                if (
                    (record.Status != undefined && record.Status.toLowerCase().includes(filterValue.toLowerCase())) ||
                    (record.B2B_Configuration_Type__c != undefined && record.B2B_Configuration_Type__c.toLowerCase().includes(filterValue.toLowerCase())) ||
                    (record.B2B_Customer_Name__c != undefined && record.B2B_Customer_Name__c.toLowerCase().includes(filterValue.toLowerCase())) ||
                    (record.B2B_Clerk__c != undefined && record.B2B_Clerk__c.toLowerCase().includes(filterValue.toLowerCase())) || //BS-1161
                    (record.B2B_Special_Handling__c != undefined && record.B2B_Special_Handling__c.toLowerCase().includes(filterValue.toLowerCase())) || //BS-1955
                    (record.B2B_ERP_Order_Id__c != undefined && record.B2B_ERP_Order_Id__c.toLowerCase().includes(filterValue.toLowerCase())) || //BS-2088
                    (record.displayableOrderedDate != undefined && record.displayableOrderedDate.toLowerCase().includes(filterValue.toLowerCase())) || //BS-2088
                    (record.Order_Source__c != undefined && record.Order_Source__c.toLowerCase().includes(filterValue.toLowerCase())) //BS-2088
                ) {
                    resultedOrderData.push(record);
                }
            });
            if (resultedOrderData != null && resultedOrderData != undefined && resultedOrderData.length > 0) {
                this._totalItemCount = resultedOrderData.length;
                //BS-2217
                this.filteredResults = this.addFieldValueCharacterLimit(resultedOrderData, FIELDS_TO_LIMIT_CHARACTERS, CHARACTERS_LIMIT);
                this._isLoading = false;
            } else {
                this._totalItemCount = 0;
                this._isLoading = false;
            }
        }
    }

    /**
     * This method handles toggle visibility of custom combobox on
     * source field on VS/RX tab.
     * BS-2150
     */
    toggleVisibility(event) {
        if (this._allowVsRxSourceListVisibilityToggle) {
            this._sourceListVisibilityVS = ''; //BS-2150
            //this.handleFocus(event);
            let element = this.template.querySelector('[data-id="' + event.currentTarget.dataset.id + '"]');
            if (element.classList.contains(SLDS_OPEN)) {
                element.classList.remove(SLDS_OPEN);
            } else {
                element.classList.add(SLDS_OPEN);
                let elements = this.template.querySelectorAll(SLDS_DROPDOWN_TRIGGER_CLICK);
                elements.forEach((dropdown) => {
                    if (dropdown.classList.contains(SLDS_OPEN) && dropdown != element) {
                        dropdown.classList.remove(SLDS_OPEN);
                    }
                });
            }
        } else {
            this._allowVsRxSourceListVisibilityToggle = true;
        }
    }

    /**
     * This method resets the Order Source values on VS/RX tab.
     * BS-2150
     */
    resetVSRXSource() {
        if (this.selectedOrderType == RX_TAB) {
            if (this._orderSourcesRx !== undefined && this._orderSourcesRx !== null && this._orderSourcesRx.length > 0) {
                this._orderSourcesRx.forEach((sourceObj) => {
                    if (sourceObj.value === ORDER_SOURCE_B2B_SHOP) {
                        sourceObj.selected = true;
                        this._selectedSourceRx = ORDER_SOURCE_B2B_SHOP;
                    } else {
                        sourceObj.selected = false;
                    }
                });
            }
        } else if (this.selectedOrderType == VS_TAB) {
            if (this._orderSourcesVs !== undefined && this._orderSourcesVs !== null && this._orderSourcesVs.length > 0) {
                this._orderSourcesVs.forEach((sourceObj) => {
                    if (sourceObj.value === ORDER_SOURCE_B2B_SHOP) {
                        sourceObj.selected = true;
                        this._selectedSourceVs = ORDER_SOURCE_B2B_SHOP;
                    } else {
                        sourceObj.selected = false;
                    }
                });
            }
        }
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

    //BS-1064
    handleOrderPopup(event) {
        if (event && event.target.dataset.disabled == REQUEST_DOCUMENT_ENABLED_CLASS) {
            this._showReorderModal = true;
            let orderId = event.target.dataset.recordId;
            this._orderToCopyId = orderId;
        }
    }

    //BS-1064
    closeReorderModal() {
        this._showReorderModal = false;
    }

    //BS-1064
    handleReorderForVS() {
        this._applicableBrand = VS_BRAND;
        if (this.selectedOrderType == VS_TAB) {
            this.createCloneConfiguratorForSameBrand(VS_BRAND);
        } else {
            this.createCloneConfiguratorForDifferentBrand(VS_BRAND);
        }
    }

    //BS-1064
    handleReorderForRX() {
        this._applicableBrand = RX_BRAND;
        if (this.selectedOrderType == RX_TAB) {
            this.createCloneConfiguratorForSameBrand(RX_BRAND);
        } else {
            this.createCloneConfiguratorForDifferentBrand(RX_BRAND);
        }
    }

    //BS-1064
    async createCloneConfiguratorForSameBrand(brand) {
        this._isLoading = true;
        this._showReorderModal = false;
        await createCloneConfiguratorForVSRX({
            orderId: this._orderToCopyId,
            isSameBrand: true,
            type: brand
        })
            .then(async (result) => {
                let lensConfiguratorInformationCollection = JSON.parse(JSON.stringify(result));
                let lensConfiguratorInformation = lensConfiguratorInformationCollection;
                // Capturing the data fetched from backend the Constructing and Restructing the data into object format that needs to pass to VS-RX Configurator
                let lensConfiguratorObject = {};
                lensConfiguratorObject = await setConfiguratorValues(lensConfiguratorInformation, this._applicableBrand);
                this._completeStepForNavigation = 4;
                this.lensConfiguratorCollectionData = JSON.parse(JSON.stringify(lensConfiguratorObject));
                if (lensConfiguratorObject && lensConfiguratorObject.selectedFrameSKU != undefined && lensConfiguratorObject.selectedFrameSKU != null) {
                    this.createFrameInformationCollection(lensConfiguratorObject.selectedFrameSKU);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    //BS-1064
    async createCloneConfiguratorForDifferentBrand(brand) {
        this._isLoading = true;
        this._showReorderModal = false;
        await createCloneConfiguratorForVSRX({
            orderId: this._orderToCopyId,
            isSameBrand: false,
            type: brand
        })
            .then(async (result) => {
                let lensConfiguratorInformationCollection = JSON.parse(JSON.stringify(result));
                let lensConfiguratorInformation = lensConfiguratorInformationCollection;
                // Capturing the data fetched from backend the Constructing and Restructing the data into object format that needs to pass to VS-RX Configurator
                let lensConfiguratorObject = {};
                lensConfiguratorObject = await setConfiguratorValuesForDifferentBrand(lensConfiguratorInformation, this._applicableBrand);
                this._completeStepForNavigation = 1;
                this.lensConfiguratorCollectionData = JSON.parse(JSON.stringify(lensConfiguratorObject));
                if (this.lensConfiguratorCollectionData) {
                    let targetPage;
                    if (this._applicableBrand != null && this._applicableBrand != undefined && this._applicableBrand != '') {
                        // Setting up target page according to the applicable brand
                        targetPage =
                            this._applicableBrand == VS_BRAND ? VISION_SENSATION_SITE_PAGE : this._applicableBrand == RX_BRAND ? RX_GLAZING_SITE_PAGE : null;
                    }

                    //Navigating to VS-RX page
                    this[NavigationMixin.Navigate]({
                        type: STANDARD_NAMED_PAGE,
                        attributes: {
                            name: targetPage
                        },
                        state: {
                            pageSource: MY_VS_RX_PAGE_SOURCE_IDENTIFIER,
                            lensConfiguratorCollection: JSON.stringify(this.lensConfiguratorCollectionData),
                            currentStep: this._completeStepForNavigation //BS-1775
                        }
                    });
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    //BS-1064
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
                                this._frameInformationCollection.variantShape =
                                    frameProductData.B2B_Variant_Shape__c != undefined && frameProductData.B2B_Variant_Shape__c != null
                                        ? frameProductData.B2B_Variant_Shape__c
                                        : '';
                                this._frameInformationCollection.shapeSize =
                                    frameProductData.B2B_Shape_Size__c != undefined && frameProductData.B2B_Shape_Size__c != null
                                        ? frameProductData.B2B_Shape_Size__c
                                        : '';
                                this._frameInformationCollection.rimlessVariant =
                                    frameProductData.B2B_Rimless_Variant__c != undefined && frameProductData.B2B_Rimless_Variant__c != null
                                        ? frameProductData.B2B_Rimless_Variant__c
                                        : '';
                                this._frameInformationCollection.modelNameNumber =
                                    frameProductData.Name != undefined && frameProductData.Name != null ? frameProductData.Name : '';
                                this._frameInformationCollection.modelNameNumber +=
                                    frameProductData.B2B_Model__c != undefined && frameProductData.B2B_Model__c != null
                                        ? ' ' + frameProductData.B2B_Model__c
                                        : '';
                                productId = frameProductData.B2B_Product__c;
                                this._frameInformationCollection.hexcode = frameProductData.B2B_Hexcode__c;
                                this._frameInformationCollection.hexcodeAccent = frameProductData.B2B_Hexcode_Accent__c;
                            }
                            if (this._frameInformationCollection) {
                                let targetPage;
                                if (this._applicableBrand != null && this._applicableBrand != undefined && this._applicableBrand != '') {
                                    // Setting up target page according to the applicable brand
                                    targetPage =
                                        this._applicableBrand == VS_BRAND
                                            ? VISION_SENSATION_SITE_PAGE
                                            : this._applicableBrand == RX_BRAND
                                            ? RX_GLAZING_SITE_PAGE
                                            : null;
                                }

                                //Navigating to VS-RX page
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
    handleOrderDetailSend(event) {}
}
