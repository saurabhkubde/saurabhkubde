import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { sortBy } from 'c/b2b_utils';

import ORDER_OBJECT from '@salesforce/schema/Order';
import ORDERSTATUS_FIELD from '@salesforce/schema/Order.Status';
import ORDERSOURCE_FIELD from '@salesforce/schema/Order.Order_Source__c';

import getOrderHistoryList from '@salesforce/apex/B2B_OrderHistoryController.getOrderHistoryList';
import getOrderReferenceList from '@salesforce/apex/B2B_OrderHistoryController.getOrderReferencesById';
import createOrderDocumentRequest from '@salesforce/apex/B2B_OrderHistoryController.createOrderDocumentRequest';
import getAccountEmail from '@salesforce/apex/B2B_OrderHistoryController.getAccountEmail'; //BS-437

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
import B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS from '@salesforce/label/c.B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS'; //BS-2207
//BS-437
import orderConfirmationMessage from '@salesforce/label/c.B2B_Order_History_Order_Conf_Message';
import deliveryNoteMessage from '@salesforce/label/c.B2B_Order_History_Delivery_Note_Message';
import invoiceMessage from '@salesforce/label/c.B2B_Order_Send_Invoice_Message';
import CONTINUE_SHOPPING_LABEL from '@salesforce/label/c.B2B_GEN_ContinueShopping';
import B2B_ORDER_SENT_AND_SUBMITTED_STATUS_VALUE from '@salesforce/label/c.B2B_ORDER_SENT_AND_SUBMITTED_STATUS_VALUE'; //BS-1096
import B2B_APPLICABLE_ORDER_SOURCES_FOR_ORDER_DETAILS from '@salesforce/label/c.B2B_APPLICABLE_ORDER_SOURCES_FOR_ORDER_DETAILS'; //BS-1831
import allOptionForStatus from '@salesforce/label/c.B2B_Source_Value_All_Label'; //BS-1909
import B2B_VS_RX_ORDER_HISTORY_FILTERS from '@salesforce/label/c.B2B_VS_RX_ORDER_HISTORY_FILTERS'; //BS-2088

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
const DOC_REQ_DISABLED_STATUS_LIST = ['Draft', '10', '15', '20', '25', '99', 'Activated']; //BS-437
const REQUEST_DOCUMENT_ENABLED_CLASS = 'document-enabled actionicon slds-m-right_small';
const REQUEST_DOCUMENT_DISABLED_CLASS = 'document-disabled actionicon slds-m-right_small';
const ORDER_INVOICE = '60';
const ORDER_SHIPPED = '40';
const ORDER_IN_PRODUCTION = '30';
const DATE_FORMAT = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}; //Added for BS-650

const SH_STORE = 'silhouette'; //Added as part of BS-687
const REQUEST_DOCUMENT_ENABLED_CLASS_NB = 'request-document-enabled'; //Added as part of BS-687
const REQUEST_DOCUMENT_DISABLED_CLASS_NB = 'request-document-disabled'; //Added as part of BS-687
const DEFAULT_SEARCH_KEYWORD = ''; //BS-2088
const ORDER_HISTORY = 'OrderHistory'; //BS-2207

export default class B2b_orderHistory extends NavigationMixin(LightningElement) {
    initialRecords;
    filteredResults = [];

    showModal = false;
    isLoading = false;

    selectedTimeframe = '90';
    selectedStatus = ''; //BS-1909
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

    @track _orderStatus;
    @track _orderSource;

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
    refreshIcon = STORE_STYLING + '/icons/refresh_icon.svg'; //BS-2175

    //page number for pagination component
    _pageNumber = FIRST_PAGE;
    _applicableOrderSources = []; // Added as a part of BS-1831
    _searchKeyword = DEFAULT_SEARCH_KEYWORD; //BS-2088
    enterKeyword = B2B_VS_RX_ORDER_HISTORY_FILTERS.split(',')[3]; //BS-2088
    printLabel = B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[6]; //BS-2207

    /**
     * The number of items on a page.
     *
     * @type {Number}
     */
    @track _pageSize;

    /**
     * The total number of items in the list.
     *
     * @type {Number}
     */
    @track _totalItemCount;

    //this will get the current page number of pagination component
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

    //Added as part of BS-687
    infoSVG = STORE_STYLING + '/icons/INFO.svg';
    reorderIcon = STORE_STYLING + '/icons/reorder-image-icon.png';
    closeIcon = STORE_STYLING + '/icons/close.svg';
    externalLink = STORE_STYLING + '/icons/externalLink.svg';
    _isSilhouetteStore = false;
    printSVG = STORE_STYLING + '/icons/print.svg'; //BS-2207

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
        reorder
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
        this.getOrderData();
        this.getAccountInfo(); //BS-437 : to get the users Account Email ID
        this.getApplicableOrderSources(); //BS-1831
    }

    /**
     * Author: Soumyakant Pandya
     * BS-1831 : This method will fetch all the Order Sources from the Custom Label and store it in an Array
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
        } else if (error) {
            console.log(error);
        }
    }

    //Updated the value of parameter to pass 'B2B' record type Id --> BS-716
    @wire(getPicklistValues, { recordTypeId: '$b2bOrderRecordTypeId', fieldApiName: ORDERSTATUS_FIELD })
    statusValues({ error, data }) {
        if (data) {
            this.orderStatuses = data.values;
            let allOption = { label: allOptionForStatus, value: '' }; //Added as a part of BS-1909
            let findIndex = data.values.findIndex((instance) => instance.value == 10);
            this.orderStatuses = JSON.parse(JSON.stringify(this.orderStatuses));
            // BS-1101
            if (findIndex !== -1) {
                this.orderStatuses.splice(0, 1, allOption); //BS-1909
            }
            this.orderStatuses.forEach((statusEntry) => {
                this.orderStatusApiVsLabelMap.set(statusEntry.value, statusEntry.label);
            });
        } else if (error) {
            console.log(error);
        }
    }

    getOrderData() {
        getOrderHistoryList({
            selectedTimeframe: this.selectedTimeframe,
            status: this.selectedStatus,
            source: this.selectedSource,
            orderType: '',
            configurationType: ''
        })
            .then((result) => {
                //Added as part of BS-650
                result.forEach((element) => {
                    let lastOrderDateValue = new Date(element.OrderedDate);
                    element.displayableOrderedDate = new Intl.DateTimeFormat('de-AT', DATE_FORMAT).format(lastOrderDateValue);
                });

                this.filteredResults = result;
                if (this.filteredResults.length > 0) {
                    let filteredResultsClone = this.filteredResults;
                    filteredResultsClone.forEach((element) => {
                        if (element.Status == B2B_ORDER_SENT_AND_SUBMITTED_STATUS_VALUE.split(',')[0]) {
                            element.Status = B2B_ORDER_SENT_AND_SUBMITTED_STATUS_VALUE.split(',')[1];
                        }
                    });
                    this.filteredResults = filteredResultsClone;
                }
                this.initialRecords = result;
                this._pageSize = PAGE_SIZE;
                this._totalItemCount = this.filteredResults.length;
                this.sortedColumn = ORDERED_DATE;
                this.onHandleSort();
                this.error = undefined;
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
        this._pageNumber = FIRST_PAGE;
        this.getOrderData();
    }

    openModal(event) {
        let order = event.target.name;
        let orderDocumentRequestDisabled = event.target.dataset.orderDocumentRequestDisabled;
        let orderId = event.target.dataset.id;
        let erpOrder = event.target.dataset.erpOrder;
        let orderStatus = event.target.dataset.status;

        //BS-437 Added logic to enable and disable the buttons based on order status value
        if (orderDocumentRequestDisabled != REQUEST_DOCUMENT_DISABLED_CLASS) {
            if (orderStatus == this.orderStatusApiVsLabelMap.get(ORDER_INVOICE)) {
                this.isOrderInvoice = true;
                this.isDeleveryNote = true;
                this.isOrderConfirmation = true;
                this.showTrackingNumber = true;
            } else if (orderStatus == this.orderStatusApiVsLabelMap.get(ORDER_SHIPPED)) {
                this.isDeleveryNote = true;
                this.isOrderConfirmation = true;
                this.showTrackingNumber = true;
            } else if (orderStatus == this.orderStatusApiVsLabelMap.get(ORDER_IN_PRODUCTION)) {
                this.isOrderConfirmation = true;
            }
            this.selectedOrderId = orderId;
            this.selectedOrderNumber = erpOrder;
            this.isLoading = true;
            this.getOrderReferenceData(orderId);
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
        this._pageNumber = FIRST_PAGE;
        this.getOrderData();
    }

    handleStatusChange(event) {
        this.isLoading = true;
        this.selectedStatus = event.target.value;
        this._pageNumber = FIRST_PAGE;
        this.getOrderData();
    }

    handleResetFilters() {
        this.isLoading = true;
        this.selectedStatus = ''; //BS-1909
        this.selectedSource = ''; //BS-1909
        this._orderStatus = null;
        this._orderSource = null;
        this._searchKeyword = DEFAULT_SEARCH_KEYWORD;
        this.template.querySelectorAll('.clear-text').forEach((each) => {
            each.value = null;
        }); //BS-436 to clear values from lightning combobox
        this.selectedTimeframe = '90';
        this.filteredResults = [];
        this._pageNumber = FIRST_PAGE;
        this.getOrderData();
    }

    onHandleSort(event) {
        this._isLoading = true;
        this._pageNumber = FIRST_PAGE;
        this.orderNumberAsc = false;
        this.orderNumberDesc = false;
        this.orderDateAsc = false;
        this.orderDateDesc = false;
        this.statusDesc = false;
        this.statusAsc = false;
        this.sourceAsc = false;
        this.sourceDesc = false;
        let columnName = event ? event.target.name : undefined;

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
        }

        const cloneData = [...this.initialRecords];

        cloneData.sort(sortBy(columnName, this.sortDirection === ASCENDING_ORDER ? 1 : -1));
        this._isLoading = false;
        this.filteredResults = cloneData;
    }

    handleSend(event) {
        let requestButtonName = event.target.dataset.name;
        if (requestButtonName == 'Order Confirmation') {
            this.template.querySelector('[data-name="Order Confirmation"]').disabled = true;
            this.isOrderConfirmationSent = true;
        } else if (requestButtonName == 'Delivery Note') {
            this.template.querySelector('[data-name="Delivery Note"]').disabled = true;
            this.isDeleveryNoteSent = true;
        } else if (requestButtonName == 'Invoice') {
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
        let orderSourceB2BTypeValuesList = orderSourceB2BTypeValues.split(','); //Added as part of BS-523
        this.filteredResults.forEach((element) => {
            if (counter >= this._pageNumber * 10 - 10 && counter < this._pageNumber * 10) {
                //Updated as a part of BS-1831
                if (this._applicableOrderSources.includes(element.Order_Source__c)) {
                    element.isFromB2bShop = true;
                } else {
                    element.isFromB2bShop = false;
                }

                //Added as part of BS-523
                if (orderSourceB2BTypeValuesList.includes(element.Order_Source__c)) {
                    element.isRelatedToB2B = true;
                } else {
                    element.isRelatedToB2B = false;
                }
                if (DOC_REQ_DISABLED_STATUS_LIST.includes(this.getByValue(this.orderStatusApiVsLabelMap, element.Status))) {
                    element.documentRequestDisabled = REQUEST_DOCUMENT_DISABLED_CLASS;
                } else {
                    element.documentRequestDisabled = REQUEST_DOCUMENT_ENABLED_CLASS;
                }
                element.serialNumber = counter + 1;
                orderRecords.push(element);
            }
            counter = counter + 1;
        });
        return orderRecords;
    }

    //to jump on next page of a pagination component
    handleNextPage(evt) {
        this._pageNumber = this._pageNumber + 1;
    }

    //to jump on previous page of pagination component
    handlePreviousPage(evt) {
        this._pageNumber = this._pageNumber - 1;
    }

    /**
     * handle pagejump as per BS-2128
     */
    handlePageJump(event) {
        this._pageNumber = event.detail;
    }

    showOrderDetail(event) {
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

    //This method will return Key from the value in map BS-437
    getByValue(map, searchValue) {
        for (let [key, value] of map.entries()) {
            if (value === searchValue) return key;
        }
    }

    handleRedirection(event) {
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
    }

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

    //BS-2088
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
            this._searchKeyword = filterValue;
            let parsedOrders = JSON.parse(JSON.stringify(this.initialRecords));
            let resultedOrderData = [];
            this.filteredResults = [];
            parsedOrders.forEach((record) => {
                if (
                    (record.Status != undefined && record.Status.toLowerCase().includes(filterValue.toLowerCase())) ||
                    (record.B2B_ERP_Order_Id__c != undefined && record.B2B_ERP_Order_Id__c.toLowerCase().includes(filterValue.toLowerCase())) ||
                    (record.displayableOrderedDate != undefined && record.displayableOrderedDate.toLowerCase().includes(filterValue.toLowerCase())) ||
                    (record.Order_Source__c != undefined && record.Order_Source__c.toLowerCase().includes(filterValue.toLowerCase()))
                ) {
                    resultedOrderData.push(record);
                }
            });
            if (resultedOrderData != null && resultedOrderData != undefined && resultedOrderData.length > 0) {
                this._totalItemCount = resultedOrderData.length;
                this.filteredResults = resultedOrderData;
                this._isLoading = false;
            } else {
                this._totalItemCount = 0;
                this._isLoading = false;
            }
        }
    }
    /* Start of BS-2207 */
    handlePrintClick(event) {
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
    /* End of BS-2207 */
}
