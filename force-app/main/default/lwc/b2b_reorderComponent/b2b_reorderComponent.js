import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation'; //BS-525
import { getRecord, getFieldValue } from 'lightning/uiRecordApi'; //BS-2142
//Importing normalizer
import { transformData } from './dataNormalizer';

//Importing community id
import communityId from '@salesforce/community/Id';

//Importing apex methods
import getOrderedProductsId from '@salesforce/apex/B2B_ReorderComponentController.getOrderedProductsId';
import getOrderedProductData from '@salesforce/apex/B2B_ReorderComponentController.getOrderedProductData';
import getChassisProducts from '@salesforce/apex/B2B_ReorderComponentController.getChassisProducts';

import getCartSummary from '@salesforce/apex/B2B_CartController.getCartSummary';
import getSortedProductsIds from '@salesforce/apex/B2B_ReorderComponentController.getSortedProductsIds';
import addToCart from '@salesforce/apex/B2B_CartController.addToCart';
import getColorsMetadata from '@salesforce/apex/B2B_SearchController.getColorsMetadata'; //Added as part of BS-730
import getAllPicklistValues from '@salesforce/apex/B2B_SearchController.getPicklistValues'; //BS-821

import getCurrencyCode from '@salesforce/apex/B2B_CartController.getCurrencyCode'; //BS-1245
import getAttributeFieldData from '@salesforce/apex/B2B_SearchController.getAttributeFieldData'; //Added as part of BS-1179
import checkSparePartsOnlyFrames from '@salesforce/apex/B2B_CartController.checkSparePartsOnlyFrames'; //BS-1568
import getCountryDateFormat from '@salesforce/apex/B2B_OrderHistoryController.getCountryDateFormat'; //BS-2142

//Importing objects and field values
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import SOURCE_FIELD from '@salesforce/schema/Order.Order_Source__c';
import ORDER_OBJECT from '@salesforce/schema/Order';
import PRODUCT_OBJECT from '@salesforce/schema/Product2'; //Added as part of BS-730
import ARIS_ID_FIELD from '@salesforce/schema/Account.k_ARIS_Account_ID__c'; // BS-2142

//Store Styling
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //692

//Importing custom labels
import lastMonthLabel from '@salesforce/label/c.B2B_Period_Last_Month';
import last3MonthsLabel from '@salesforce/label/c.B2B_Period_Last_3_Months';
import last6MonthsLabel from '@salesforce/label/c.B2B_Period_Last_6_Months';
import last12MonthsLabel from '@salesforce/label/c.B2B_Period_Last_12_Months';
import last24MonthsLabel from '@salesforce/label/c.B2B_Period_Last_24_Months';
import productNameAscending from '@salesforce/label/c.B2B_Product_Name_Ascending';
import productNameDescending from '@salesforce/label/c.B2B_Product_Name_Descending';
import productSkuAscending from '@salesforce/label/c.B2B_Product_SKU_Ascending';
import productSkuDescending from '@salesforce/label/c.B2B_Product_SKU_Descending';
import orderDateOldtoNew from '@salesforce/label/c.B2B_Order_Date_Old_To_New';
import orderDateNewtoOld from '@salesforce/label/c.B2B_Order_Date_New_To_Old';
import periodLabel from '@salesforce/label/c.B2B_Reorder_Period_Label';
import sourceLabel from '@salesforce/label/c.B2B_Reorder_Source_Label';
import sortByLabel from '@salesforce/label/c.B2B_Reorder_Sort_By_Label';
import selectedOrderNumberLabel from '@salesforce/label/c.B2B_Selected_Order_Number_Label';
import allOptionForSource from '@salesforce/label/c.B2B_Source_Value_All_Label'; //Added as a part of BS-643
import ALL_CATEGORY from '@salesforce/label/c.B2B_All_Category'; //BS-730
import FILTER_LABELS from '@salesforce/label/c.B2B_PLP_Filters'; // BS-692
import PROCESSING_ORDER_NUMBER from '@salesforce/label/c.B2B_ACC_OH_Processing'; // BS-940
import B2B_DEFAULT_CURRENCY_ISO_CODE from '@salesforce/label/c.B2B_DEFAULT_CURRENCY_ISO_CODE'; //Added as part of BS-1245
import BICOLOR_COLOR from '@salesforce/label/c.B2B_Color_Bicolor'; //BS-1529

import { pageManager } from 'c/b2b_utils';

// PERIOD VALUE CONSTANTS
const LAST_MONTH_PERIOD_VALUE = '1';
const LAST_THREE_MONTH_PERIOD_VALUE = '3';
const LAST_SIX_MONTH_PERIOD_VALUE = '6';
const LAST_TWELVE_MONTH_PERIOD_VALUE = '12';
const LAST_TWENTY_FOUR_MONTH_PERIOD_VALUE = '24';

//SORT BY VALUE CONSTANTS
const PRODUCT_NAME_VALUE_ASC = 'Product2.Name ASC';
const PRODUCT_NAME_VALUE_DESC = 'Product2.Name DESC';
const PRODUCT_SKU_VALUE_ASC = 'Product2.StockKeepingUnit ASC';
const PRODUCT_SKU_VALUE_DESC = 'Product2.StockKeepingUnit DESC';
const ORDER_DATE_VALUE_OLD_TO_NEW = 'Order.OrderedDate ASC';
const ORDER_DATE_VALUE_NEW_TO_OLD = 'Order.OrderedDate DESC';

//STORE NAME VALUE CONSTANTS
const SILHOUETTE_STORE_FULL_NAME = 'Silhouette';
const SILHOUETTE_STORE_SHORT_NAME = 'SH';
const NEUBAU_STORE_FULL_NAME = 'Neubau';
const NEUBAU_STORE_SHORT_NAME = 'NB';
const REORDER_PAGE_SOURCE = 'Reorder';
const SH_STORE = 'silhouette'; //BS-692

//BS-730 Start
const RADIO_BUTTON = 'Radio Button';
const COLOR_RADIO_BUTTON = 'Color Radio Button';
const CATEGORY = 'Category';
const SLIDER = 'Slider';
const SH_SHORT = 'SH';
const FRAME_COLOR = 'B2B_Frame_Color__c';
const LENS_COLOR = 'B2B_Lens_Color__c';
const MIRROR_COLOR = 'B2B_Mirror_Color__c';
const X_CHAR = 'X';
const URI1 =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxwYXR0ZXJuIGlkPSJiIiBwYXR0ZXJuVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PHVzZSB4bGluazpocmVmPSIjYSIgdHJhbnNmb3JtPSJzY2FsZSguNSkiLz48L3BhdHRlcm4+PGltYWdlIGlkPSJhIiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0NBWUFBQUJYQXZtSEFBQUVHV2xEUTFCclEwZERiMnh2Y2xOd1lXTmxSMlZ1WlhKcFkxSkhRZ0FBT0kyTlZWMW9IRlVVUHJ0elp5TWt6bE5zTklWMHFEOE5KUTJUVmpTaHRMcC8zZDAyYnBaSk50b2k2R1QyN3M2WXljNDRNN3Y5b1U5RlVId3g2cHNVeEwrM2dDQW85US9iUHJRdmxRb2wydFFnS0Q2MCtJTlE2SXVtNjVrN001bHB1ckhlWmU1ODg1M3ZubnZ1dVdmdkJlaTVxbGlXa1JRQkZwcXVMUmN5NG5PSGo0ZzlLNUNFaDZBWEJxRlhVUjByWGFsTUFqWlBDM2UxVzk5RHdudGYyZFhkL3ArdHQwWWRGU0J4SDJLejVxZ0xpSThCOEtkVnkzWUJldnFSSHovcVdoNzJZdWkzTVVERUwzcTQ0V1BYdzNNK2ZvMXBadVFzNHRPSUJWVlRhb2lYRUkvTXhmaEdEUHN4c05aZm9FMXE2NnJvNWFKaW0zWGRvTEZ3NzJIK24yM0JhSVh6YmNPbno1bWZQb1R2WVZ6N0t6VWw1K0ZSeEV1cWtwOUcvQWppYTIxOXRoemcyNWFia1JFL0JwRGMzcHF2cGhIdlJGeXMyd2VxdnAra3JiV0tJWDduaERiekxPSXRpTTgzNThwVHdkaXJxcFBGbk1GMnhMYzFXdkx5T3dUQWlicGJtdkhIY3Z0dFU1N3k1K1hxTlpyTGUzbEUvUHE4ZVVqMmZYS2ZPZTNwZk9qemhKWXRCL3lsbDVTREZjU0RpSCtoUmtIMjUrTCtzZHhLRUFNWmFocmxTWDh1a3FNT1d5L2pYVzJtNk05TERCYzMxQjlMRnV2NmdWS2cvMFN6aTNLQXIxa0dxMUdNalUvYUxibnE2L2xSeGM0WGZKOThoVGFyZ1grK0RiTUpCU2lZTUllOUNrMVlBeEZrS0VBRzN4YllhS21ERGdZeUZLMFVHWXBmb1dZWEcrZkFQUEk2dEpuTndiN0NsUDdJeUYrRCtiak90Q3BraHo2Q0ZySWEvSTZzRnRObDhhdUZYR01UUDM0c053SS9KaGtnRXRtRHoxNHlTZmFSY1RJQklubUtQRTMya3h5eUUyVHYrdGhLYkVWZVBEZlcvYnlNTTFLbW0wWGRPYlM3b0dEL015cE1YRlBYckN3T3RvWWp5eW43QlYyOS9NWmZzVnpwTERkUnR1SVpuYnBYenZsZitldjhNdllyL0dxazRIL2tWL0czY3NkYXpMdXlUTVBzYkZoemQxVWFiUWJqRnZEUm1jV0p4UjN6Y2ZIa1Z3OUdmcGJKbWVldjlGMDhXVzh1RGthc2x3WDZhdmxXR1U2TlJLejBnL1NIdEN5OUozMG8vY2E5elgzS2ZjMTl6bjNCWFFLUk84dWQ0NzdoTG5BZmMxL0c5bXJ6R2xyZmV4WjVHTGRuNlpacnJFb2hJMndWSGhaeXdqYmhVV0V5OGljTUNHTkNVZGlCbHEzcit4YWZMNTQ5SFE1akgrYW4rMXkrTGxZQmlmdXhBdlJOL2xWVlZPbHdsQ2tkVm05Tk9MNUJFNHdrUTJTTWxEWlU5N2hYODZFaWxVL2xVbWtRVXp0VEU2bXgxRUVQaDdPbWRxQnRBdnY4SGRXcGJySlM2dEpqM24wQ1dkTTZidXNOelJWM1M5S1RZaHF2TmlxV211cm9pS2dZaHNoTWptaFRoOXB0V2hzRjc5NzBqL1NiTXJzUEUxc3VSNXo3RE1DK1AvSHMreTdpanJRQWxoeUFnY2NqYmhqUHlnZmVCVGp6aE5xeTI4RWRrVWg4QytEVTkrejJ2L295ZUg3OTFPbmN4SE9zNXkyQXRUYzduYi9mNzNUV1BrRC9xd0Jualg4Qm9KOThWUU5jQys4QUFBQ3pTVVJCVkdnRjdaaEJDc013REFUanZzYi9mNDEvMDlM';
const URI2 =
    'akhzV1FiUU9UbThDUzRoa0xqTmZlKzMwTnZuUE9HaXkvN3E3L212ek1QNjUxQTcrMm9nRU5RQUllSVFnUXAyc0FJNFFGSG05Z2RLLzV3cnI3YmpPdC8zZ0RiZ0RPSUU3WEFFWUlDMmdBQXNUcEdzQUlZUUVOUUlBNGZVM3ZIcjRMWWVaWndCbElIdjFJQTMzbTJWRUR5YU1mYWFEUFBEdHFJSG4wSTkrRitzeXpvek9RUFBxUkJ2ck1zNk1Ha2tjLzBrQ2ZlWGJVUVBMb1J4K1lPeHRMdG4wd2lBQUFBQUJKUlU1RXJrSmdnZz09Ii8+PC9kZWZzPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9InVybCgjYikiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iLjEiLz48L3N2Zz4=';
//BS-730 End

//BS-940 start
const PROCESSING_GERMAN = 'Verarbeitung läuft';
const PROCESSING_ENGLISH = 'processing';
// BS-940 end

const M_CHAR = 'M'; //BS-907
const TRANSPARENT = 'transparent'; //BS-907
const EVIL_EYE_LABEL = 'evil eye'; // Added as part of BS-955
const SILHOUETTE_LABEL = 'Silhouette'; // Added as part of BS-955
const BRAND_RADIO_BUTTON_COMPONENT = 'c-b2b_brand-radio-button-component'; // Added as part of BS-955
const FILTER_CONTAINER_COMPONENT = 'c-b2b_filter-container'; // Added as part of BS-955
const fields = [ARIS_ID_FIELD]; //BS-2142

export default class B2b_reorderComponent extends NavigationMixin(LightningElement) {
    /**
     * Gets the effective account - if any - of the user viewing the product.
     *
     * @type {string}
     */
    @api
    get effectiveAccountId() {
        return this._effectiveAccountId;
    }

    /**
     * Sets the effective account - if any - of the user viewing the product
     * and fetches updated cart information
     */
    set effectiveAccountId(newId) {
        this._effectiveAccountId = newId;
    }
    /* Start of BS-2142 */
    @wire(getRecord, { recordId: '$effectiveAccountId', fields })
    getAccountDetails({ error, data }) {
        if (data) {
            let countryCodeValue = getFieldValue(data, ARIS_ID_FIELD).substring(0, 4);
            this.countryCode = countryCodeValue;
            this.getCountrySpecificDateFormatData();
        } else {
            console.error(error);
        }
    }
    async getCountrySpecificDateFormatData() {
        if (this.countryCode != null && this.countryCode != undefined) {
            await getCountryDateFormat({
                countryCode: this.countryCode
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
     *  Gets or sets the search term.
     *
     * @type {string}
     */
    @api
    get term() {
        return this._term;
    }
    /**
     * BS-692
     *
     * Get The labels used in the template.
     */
    get labels() {
        return {
            clearAllLabel: FILTER_LABELS.split(',')[1]
        };
    }

    noFilterProducts = false;
    @track _updatedGlobalProductListForFilterContainer;
    callUpdateFilterOnLoadBoolean = true;
    @track _onLoadGlobalProductListForFilterContainer;
    showReorderComp = false;
    reorderPeriodLabel = periodLabel;
    reorderSourceLabel = sourceLabel;
    reorderSortByLabel = sortByLabel;
    selectedOrderNumberLabel = selectedOrderNumberLabel;
    @api storeName;
    @track _displayableProductDataList;
    @track _startingRecord = 1;
    @track _endingRecord = 0;
    @track _displayData;
    _term;
    @track _isLoading = false;
    _effectiveAccountId;
    @track _pageNumber = 1;
    totalProducts;
    pageSizePaginator = 15;
    @track _sourceOptions;
    @track periodValue = LAST_TWENTY_FOUR_MONTH_PERIOD_VALUE;
    _sourceValue = '';
    sourceValueForAll = allOptionForSource; //Added as a part of BS-643
    sortByValue = ORDER_DATE_VALUE_NEW_TO_OLD;
    @track _showPaginator = false;
    @track b2bOrderRecordTypeId;
    @api storeNameShortForm;
    @api pageSource;
    @track _counter = 0;
    @track _loadFilters = false;
    recievedProducts;
    @track
    _globalProductListForFilterContainer;
    @track dataList = [];
    @track localProductsListObj;
    startingProductIndex = 1;
    endingProductIndex = 0;
    calloutCount = 1;
    updateFilter = false;
    handleClearAllCalled = false;
    //BS-528
    @track chassisProductsList = [];
    @track demoProductVsChassisProductMap = new Map();
    @track demoVsChassisObj = {};
    _showChassisButton = false;
    filteredProductListId = [];
    _isSilhouetteStore = false; //BS-692
    refreshIcon = STORE_STYLING + '/icons/refresh_icon.svg'; //BS-692
    processingOrderNumber = PROCESSING_ORDER_NUMBER; //Added as part of BS-940
    orderNumber; //Added as part of BS-525
    orderId; //Added as part of BS-940
    resetFilters = false;

    _noProducts = false; // Added as Part Of BS-934
    dateformat; //BS-2142
    countryCode; //BS-2142
    /**
     * The cart summary information
     * @type {ConnectApi.CartSummary}
     */
    _cartSummary;
    _selectedSourceValue = allOptionForSource; //Added as part of BS-643
    //BS-730 start
    _transparentUri;
    _productObjectData;
    @track
    _selectedFiltersMap = new Map();

    @track
    _selectedFilters = [];

    @track
    _customMetadataColors;
    //BS-730 end
    _picklistApiNameVsLabelMap = new Map(); //BS-821

    /**
     * Flag if the reorder contains evil eye products
     * BS-955
     * @type {Boolean}
     */
    _containsEvilEyeProduct = false;

    /**
     * Flag if the reorder contains silhouette products
     * BS-955
     * @type {Boolean}
     */
    _containsSilhouetteProduct = false;

    /**
     * Flag to control the rendering the brand filter
     * BS-955
     * @type {Boolean}
     */
    _renderBrandFilter = false;

    /**
     * This variable holds the value of applicable currency code
     * BS-1245
     * @type {String}
     */
    _applicableCurrencyCode; //BS-1245

    /**
     * This variable holds the default currency code
     * BS-1245
     * @type {String}
     */
    _defaultCurrencyIsoCode = B2B_DEFAULT_CURRENCY_ISO_CODE; //BS-1245

    //Added as part of BS-1179
    @track
    _fieldWrapper;
    _productIdVsIsFrameMap; //BS-1568
    _cartItemId; //BS-1562

    /**
     * Helper function for updating pageNumber and localStorage as per BS-2128.
     *
     * @private
     */
    setPageNumberInLocalStorage(toPageNumber) {
        this._pageNumber = toPageNumber;
        pageManager.setCategoryPageNumber(REORDER_PAGE_SOURCE, toPageNumber);
    }

    /**
     * Gets whether the cart is currently locked
     *
     * Returns true if the cart status is set to either processing or checkout (the two locked states)
     *
     * @readonly
     */
    get isCartLocked() {
        const cartStatus = (this._cartSummary || {}).status;
        return cartStatus === 'Processing' || cartStatus === 'Checkout';
    }

    /**
     * Gets the normalized effective account of the user.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get resolvedEffectiveAccountId() {
        const effectiveAcocuntId = this.effectiveAccountId || '';
        let resolved = null;

        if (effectiveAcocuntId.length > 0 && effectiveAcocuntId !== '000000000000000') {
            resolved = effectiveAcocuntId;
        }
        return resolved;
    }

    /**
     * Gets all the values for Period Picklist.
     *
     */
    get periodOptions() {
        let optionList = [
            { label: lastMonthLabel, value: LAST_MONTH_PERIOD_VALUE },
            { label: last3MonthsLabel, value: LAST_THREE_MONTH_PERIOD_VALUE },
            { label: last6MonthsLabel, value: LAST_SIX_MONTH_PERIOD_VALUE },
            { label: last12MonthsLabel, value: LAST_TWELVE_MONTH_PERIOD_VALUE },
            { label: last24MonthsLabel, value: LAST_TWENTY_FOUR_MONTH_PERIOD_VALUE }
        ];
        return optionList;
    }

    /**
     * Gets all the values for sortBy Picklist.
     *
     */
    get sortByOptions() {
        let optionList = [
            { label: productNameAscending, value: PRODUCT_NAME_VALUE_ASC },
            { label: productNameDescending, value: PRODUCT_NAME_VALUE_DESC },
            { label: productSkuAscending, value: PRODUCT_SKU_VALUE_ASC },
            { label: productSkuDescending, value: PRODUCT_SKU_VALUE_DESC },
            { label: orderDateOldtoNew, value: ORDER_DATE_VALUE_OLD_TO_NEW },
            { label: orderDateNewtoOld, value: ORDER_DATE_VALUE_NEW_TO_OLD }
        ];
        return optionList;
    }

    //Added as part of BS-525
    get isPeriodDisabled() {
        if (this.orderNumber === '' || this.orderNumber === null || this.orderNumber === undefined) {
            return false;
        } else {
            return true;
        }
    }
    get isSourceDisabled() {
        if (this.orderNumber === '' || this.orderNumber === null || this.orderNumber === undefined) {
            return false;
        } else {
            return true;
        }
    }
    /**
     *  Gets or sets the layout of this component. Possible values are: grid, list.
     *
     * @type {string}
     */
    @api
    resultsLayout;

    /**
     *  Gets or sets whether the product image to be shown on the cards.
     *
     * @type {string}
     */
    @api
    showProductImage;

    //BS-1529
    _bicolorImage = STORE_STYLING + '/icons/color-wheel.svg';

    /**
     * Gets or sets the normalized, displayable results for use by the display components.
     *
     * @private
     */
    get displayData() {
        return this._displayData || {};
    }

    /**
     * Sets the Display Data
     */
    set displayData(data) {
        getAttributeFieldData()
            .then((result) => {
                this._fieldWrapper = result;
            })
            .catch((errorInstance) => {
                console.error(errorInstance);
            });
        if (this._fieldWrapper) {
            this._displayData = transformData(data, this._cardContentMapping, this._fieldWrapper, this._productIdVsIsFrameMap); //Updated as part of BS-1568
        }
    }

    /**
     * Gets the normalized component configuration that can be passed down to
     *  the inner components.
     *
     * @type {object}
     * @readonly
     * @private
     */
    get config() {
        return {
            layoutConfig: {
                resultsLayout: this.resultsLayout,
                cardConfig: {
                    showImage: this.showProductImage,
                    resultsLayout: this.resultsLayout,
                    actionDisabled: this.isCartLocked
                }
            }
        };
    }

    /**
     * Gets all the Product result data List
     *
     */
    get allProductResultDataList() {
        return this._productSearchResultDataList;
    }

    /**
     * Gets the current page number.
     *
     * @type {Number}
     * @readonly
     * @private
     */
    get pageNumber() {
        return this._pageNumber;
    }

    /**
     * Sets page number.
     *
     */
    set pageNumber(data) {
        this._pageNumber = data;
    }

    /**
     * getter for order Number Value to be shown on the reorder header
     *
     */
    get orderNumberValue() {
        let orderERPValue;
        if (this.orderNumber === PROCESSING_GERMAN || this.orderNumber === PROCESSING_ENGLISH) {
            orderERPValue = this.processingOrderNumber;
        } else {
            orderERPValue = this.orderNumber;
        }
        return orderERPValue;
    }

    /**
     * Gets order informaation.
     *
     */
    @wire(getObjectInfo, { objectApiName: ORDER_OBJECT })
    orderInfo({ error, data }) {
        if (data) {
            const recordTypeIds = data.recordTypeInfos;
            this.b2bOrderRecordTypeId = Object.keys(recordTypeIds).find((recordTypeId) => recordTypeIds[recordTypeId].name === 'B2B Order');
        } else if (error) {
            console.error(error);
        }
    }

    /**
     * Gets order source values.
     *
     */
    @wire(getPicklistValues, {
        recordTypeId: '$b2bOrderRecordTypeId',
        fieldApiName: SOURCE_FIELD
    })
    orderSourceValues({ error, data }) {
        if (data) {
            this._sourceOptions = [...data.values];
            let allOption = { label: this.sourceValueForAll, value: this.sourceValueForAll }; //Added as a part of BS-643
            this._sourceOptions.splice(0, 0, allOption);
        } else if (error) {
            console.error(error);
        }
    }
    //gets the Current Page Reference BS-525
    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        this.pageRef = pageRef;
    }
    /**
     * Handle change in Period picklist.
     *
     */
    handlePeriodChange(event) {
        /* Start BS-955 */
        this._containsEvilEyeProduct = false;
        this._containsSilhouetteProduct = false;
        this._renderBrandFilter = false;
        /* End BS-955 */

        //BS-906
        this.clearFilters();
        // End
        this._pageNumber = 1;
        this.recievedProducts = null;
        if (event.target.value) {
            this.periodValue = event.target.value;
        }
        const filterComp = this.template.querySelector('c-b2b_filter-container');
        if (filterComp != null) {
            filterComp.dynamicProductSearch = new Map();
        }
        this.triggerGetOrderedProductIdsOverview();
    }

    /**
     * Handle change in source picklist.
     *
     */
    handleSourceChange(event) {
        /* Start BS-955 */
        this._containsEvilEyeProduct = false;
        this._containsSilhouetteProduct = false;
        this._renderBrandFilter = false;
        /* End BS-955 */
        //BS-906
        this.clearFilters();
        // End
        this._pageNumber = 1;
        this.recievedProducts = null;
        if (event.target.value) {
            this._sourceValue = event.target.value;
        }
        if (event.target.value == this.sourceValueForAll) {
            //Added as a part of BS-643
            this._sourceValue = '';
        }
        const filterComp = this.template.querySelector('c-b2b_filter-container');
        if (filterComp != null) {
            filterComp.dynamicProductSearch = new Map();
        }
        this.triggerGetOrderedProductIdsOverview();
    }

    /**
     * Handle change in sortby picklist.
     *
     */
    handleSortingUpdate(event) {
        this._pageNumber = 1;
        this.sortByValue = event.target.value;
        if (this.recievedProducts == null) {
            this.triggerGetOrderedProductIdsOverview();
        } else {
            this.getFilterProductData();
        }
    }

    /**
     * Triggers to Get sorted product Ids.
     *
     */
    @track productIdVsProductMap;

    /**
     * The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.
     */
    onLoadBoolean = false;
    async connectedCallback() {
        /**
         * BS-1179 : Start
         */
        await getChassisProducts()
            .then((result) => {
                this.chassisProductsList = result;
                this.error = undefined;
            })
            .catch((error) => {
                this.error = error;
                this.chassisProductsList = undefined;
            });
        /**
         * BS-1179 : End
         */
        this.getAllPicklistValues(); //BS-821
        //BS-528
        if (this.pageSource == REORDER_PAGE_SOURCE && this.storeName === SILHOUETTE_STORE_FULL_NAME) {
            this._showChassisButton = true;
        }
        if (this.storeName === SILHOUETTE_STORE_FULL_NAME) {
            this.storeNameShortForm = SILHOUETTE_STORE_SHORT_NAME;
        } else if (this.storeName === NEUBAU_STORE_FULL_NAME) {
            this.storeNameShortForm = NEUBAU_STORE_SHORT_NAME;
        }
        this.onLoadBoolean = true;
        this._isLoading = true;
        this.orderNumber = this.pageRef.state.orderNumber; //BS-525
        this.orderId = this.pageRef.state.orderId; //BS-940
        this.triggerGetOrderedProductIdsOverview();
        let currentUrl = window.location.href.split('/s/'); //BS-692
        let currentStore = currentUrl[0].split('/');
        this._pageNumber = pageManager.getPreviouslyVisitedPageIfFromPDPOrFirst(REORDER_PAGE_SOURCE);

        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }
    }

    /**
     * Handles a user request to add the product to their active cart.
     *
     * @private
     */
    handleAction(evt) {
        evt.stopPropagation();
        this._isLoading = true;
        addToCart({
            communityId: communityId,
            productId: evt.detail.productId,
            quantity: evt.detail.quantity,
            effectiveAccountId: this.resolvedEffectiveAccountId,
            currencyIsoCode: this._applicableCurrencyCode //BS-1245
        })
            .then((result) => {
                this._cartItemId = result.cartItemId; //BS-1562
                this.dispatchEvent(
                    new CustomEvent('cartchanged', {
                        bubbles: true,
                        composed: true
                    })
                );
                const addToCartModal = this.template.querySelector('c-b2b_add-to-cart-modal');
                addToCartModal.cartid = result.cartId;
                addToCartModal.cartItemId = result.cartItemId; //BS-1562
                addToCartModal.error = undefined; // Added as a part of BS-1315
                addToCartModal.show();
                this._isLoading = false;
            })
            .catch((error) => {
                const addToCartModal = this.template.querySelector('c-b2b_add-to-cart-modal');
                //Updated as Part Of BS-1315
                getCartSummary({
                    communityId: communityId,
                    effectiveAccountId: this.resolvedEffectiveAccountId
                }).then((result) => {
                    addToCartModal.cartid = result.cartId;
                });
                addToCartModal.error = error;
                addToCartModal.show();
                this._isLoading = false;
            });
    }

    /**
     * Ensures cart information is up to date
     */
    updateCartInformation() {
        getCartSummary({
            communityId: communityId,
            effectiveAccountId: this.resolvedEffectiveAccountId,
            currencyIsoCode: this._applicableCurrencyCode //BS-1245
        })
            .then((result) => {
                this._cartSummary = result;
            })
            .catch((error) => {
                this.error = error;
                this._isLoading = false;
            });
    }

    /**
     * Ensures cart information is visible
     */
    updateVisibleProducts() {
        //BS-528 filling the map of demo product vs chassis product.
        if (this._showChassisButton && this.localProductsListObj.products) {
            this.localProductsListObj.products.forEach((products) => {
                this.chassisProductsList.forEach((chassisProdObj) => {
                    if (products.id === chassisProdObj.B2B_Source_Product__c) {
                        this.demoProductVsChassisProductMap.set(chassisProdObj.B2B_Source_Product__c, chassisProdObj.B2B_Target_Product__c);
                    }
                });
            });
            let arr = Array.from(this.demoProductVsChassisProductMap, ([key, value]) => {
                return { key: key, value: value };
            });
            this.demoVsChassisObj = JSON.parse(JSON.stringify(arr));
        }
        this.displayData = this.localProductsListObj;
        if (this.totalProducts === 0) {
            this._noProducts = true;
        }
        if ((this.recievedProducts !== null || this.recievedProducts !== undefined) && this.totalProducts > 15) {
            this._showPaginator = true;
        } else {
            this._showPaginator = false;
        }
        this._loadFilters = true;
        this.showReorderComp = true;
        if (this.callUpdateFilterOnLoadBoolean != true) {
            const objChild = this.template.querySelector('c-b2b_filter-container');
            if (objChild !== null) {
                objChild.updateFilters();
            }
        }
        this._isLoading = false;
        this.callUpdateFilterOnLoadBoolean = false;
    }

    /**
     * Gets whether results has more than 1 page.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get hasMorePages() {
        return this.displayData.total > this.displayData.pageSize;
    }
    /**
     * Handles a user request to navigate to previous page results page.
     *
     * @private
     */
    handlePreviousPage(evt) {
        evt.stopPropagation();
        this._isLoading = true;
        this.setPageNumberInLocalStorage(this._pageNumber - 1);
        if (this.recievedProducts == null) {
            this.triggerGetOrderedProductIdsOverview();
        } else {
            this.getFilterProductData();
        }
        this.topFunction();
    }

    /**
     * Handles a user request to navigate to selected page as per BS-2128.
     *
     * @private
     */
    handlePageJump(evt) {
        evt.stopPropagation();
        this._isLoading = true;
        this.setPageNumberInLocalStorage(evt.detail);

        if (this.recievedProducts == null) {
            this.triggerGetOrderedProductIdsOverview();
        } else {
            this.getFilterProductData();
        }
        this.topFunction();
    }

    /**
     * Handles a user request to navigate to next page results page.
     *
     * @private
     */
    handleNextPage(evt) {
        evt.stopPropagation();
        this._isLoading = true;
        this.setPageNumberInLocalStorage(this._pageNumber + 1);
        if (this.recievedProducts == null) {
            this.triggerGetOrderedProductIdsOverview();
        } else {
            this.getFilterProductData();
        }
        this.topFunction();
    }
    //Added as part of BS-525
    resetProductsToAllOrders() {
        this.orderNumber = '';
        this.orderId = '';
        this.triggerGetOrderedProductIdsOverview();
    }
    topFunction() {
        const scrollOptions = {
            left: 0,
            top: 0,
            behavior: 'smooth'
        };
        window.scrollTo(scrollOptions);
    }

    /**
     * Handles a user request to navigate to the product detail page.
     *
     * @private
     */
    handleShowDetail(evt) {
        evt.stopPropagation();

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: evt.detail.productId,
                actionName: 'view'
            }
        });
    }

    /**
     * handler for filter product search event fired from filterContainer
     */
    handleFilterProductSearch(event) {
        this.pageNumber = 1;
        if (event != null || event != undefined) {
            if (event.detail) {
                this.recievedProducts = event.detail.productsFilterMap;
            }
        }
        const arr = Array.from(this.recievedProducts, ([key, value]) => {
            return { key: key, value: value };
        });
        if (arr.length > 0) {
            this._isLoading = true;
            //BS-730 the below block will remove filters other than category
            this._selectedFilters.forEach((filter) => {
                if (filter.filterType != CATEGORY) {
                    this._selectedFiltersMap.delete(filter.fieldName);
                }
            }); //BS-730 End
            this._displayableProductDataList = Array.from(this._updatedGlobalProductListForFilterContainer.products);
            this.filterProducts(arr);
        } else {
            if (this._selectedFilters.length > 0) {
                //BS-730 the below line of code will remove selected filters from UI and Keep the category filters
                this._selectedFilters.forEach((filter) => {
                    if (filter.filterType != CATEGORY) {
                        this._selectedFiltersMap.delete(filter.fieldName);
                    }
                });
                this._selectedFilters = [];
                for (let filter of this._selectedFiltersMap.values()) {
                    this._selectedFilters.push(filter);
                }
            } //BS-730 End
            this._displayableProductDataList = this._onLoadGlobalProductListForFilterContainer.products;
            this.totalProducts = this._displayableProductDataList.length;
            this.filteredProductListId = [];
            this.recievedProducts = null;
            this.triggerGetOrderedProductIdsOverview();
        }
    }

    /**
     * Method to segregate products matching filter criteria for filters selected by user on UI
     */
    filterProducts(filterObj) {
        this.filteredProductListId = [];
        var totalFilterApplied = filterObj.length;
        let filteredProducts = [];
        let data = {};
        let colorStyleData;
        if (totalFilterApplied > 0 && this._displayableProductDataList) {
            // BS-730 The below block of code will create a data to show the selected filters
            filterObj.forEach((filterKey) => {
                if (this._selectedFiltersMap.has(filterKey.key) == false) {
                    if (filterKey.value.sliderOneValue != undefined && filterKey.value.sliderTwoValue != undefined) {
                        //for slider type of filter
                        let filter =
                            this._productObjectData.fields[filterKey.key].label + ' : ' + filterKey.value.sliderOneValue + '-' + filterKey.value.sliderTwoValue;
                        data = {
                            fieldName: filterKey.key,
                            displayFilter: filter,
                            fieldValue: filterKey.value,
                            filterType: SLIDER,
                            isColor: false,
                            previousCategoryId: null,
                            previousCategoryName: null
                        };
                        this._selectedFiltersMap.set(filterKey.key, data);
                    } else if (filterKey.key == FRAME_COLOR || filterKey.key == LENS_COLOR || filterKey.key == MIRROR_COLOR) {
                        //for color radio button filter
                        // BS-907 start
                        if (this._customMetadataColors.has(filterKey.value)) {
                            /* Start : BS-1529 */
                            if (this._customMetadataColors.get(filterKey.value).B2B_Color_name__c === BICOLOR_COLOR.split(',')[0]) {
                                colorStyleData = 'background: url(' + this._bicolorImage + ')';
                            } else {
                                if (this._customMetadataColors.get(filterKey.value).B2B_Color_name__c == TRANSPARENT) {
                                    colorStyleData = 'background: url(' + this._transparentUri + ')';
                                } else {
                                    colorStyleData = 'background: ' + this._customMetadataColors.get(filterKey.value).B2B_Color_code__c;
                                }
                            }
                            /* End : BS-1529 */
                            data = {
                                fieldName: filterKey.key,
                                fieldValue: filterKey.value,
                                filterType: COLOR_RADIO_BUTTON,
                                colorStyle: colorStyleData,
                                isColor: true,
                                previousCategoryId: null,
                                previousCategoryName: null
                            };
                            this._selectedFiltersMap.set(filterKey.key, data);
                        }
                    } else {
                        //for radio button filter
                        data = {
                            fieldName: filterKey.key,
                            displayFilter: this._picklistApiNameVsLabelMap.has(filterKey.key + '_' + filterKey.value) //BS-1022
                                ? this._picklistApiNameVsLabelMap.get(filterKey.key + '_' + filterKey.value)
                                : filterKey.value, //BS-821
                            fieldValue: filterKey.value,
                            filterType: RADIO_BUTTON,
                            isColor: false,
                            previousCategoryId: null,
                            previousCategoryName: null
                        };
                        this._selectedFiltersMap.set(filterKey.key, data);
                    }
                }
            });
            this._selectedFilters = [];
            for (let filter of this._selectedFiltersMap.values()) {
                this._selectedFilters.push(filter);
            } //BS-730 End
            this._displayableProductDataList.forEach((product) => {
                filterObj.forEach((filterKey) => {
                    if (product[filterKey.key] !== undefined && product[filterKey.key].split(';').includes(filterKey.value)) {
                        this._counter += 1;
                    }
                });
                if (this._counter == totalFilterApplied) {
                    filteredProducts.push(product);
                }
                this._counter = 0;
            });
            if (filteredProducts.length == 0) {
                this.showReorderComp = false;
                this.noFilterProducts = true;
                this.totalProducts = 0; //Added as part BS-905
                this._noProducts = true; // Added as Part Of BS-934
                this._globalProductListForFilterContainer = null;
                this.localProductsListObj = { products: [] };
                this.updateVisibleProducts();
            } else {
                this.noFilterProducts = false;
                this._noProducts = false; // Added as Part Of BS-934
                this.updateFilter = false;
                this._globalProductListForFilterContainer = {
                    products: filteredProducts
                };

                this.totalProducts = filteredProducts.length;
                filteredProducts.forEach((item) => {
                    this.filteredProductListId.push(item.Id);
                });
                if (this.filteredProductListId.length <= 15) {
                    this._showPaginator = false;
                } else {
                    this._showPaginator = true;
                }
                this.getFilterProductData();
            }
        } else if (totalFilterApplied == 0) {
            this.triggerGetOrderedProductIdsOverview();
        }
    }

    /**
     * Method to fetch, sort the ordered products
     */
    async triggerGetOrderedProductIdsOverview() {
        this._isLoading = true;
        this.displayData = null;
        this._globalProductListForFilterContainer = null;
        this._updatedGlobalProductListForFilterContainer = null;
        this.triggerMetadataRetrieve(); // BS-730
        //Fetch the products data for the ordered products for the current user's account based on the period and source in selected sort by order.
        let result = await getOrderedProductsId({
            periodValue: this.periodValue,
            sourceValue: this._sourceValue,
            sortByValue: this.sortByValue,
            effectiveAccountId: this.resolvedEffectiveAccountId,
            orderId: this.orderId
        });
        if (result == null || result == undefined || result.productList === null) {
            this.displayData = null;
            this.showReorderComp = false;
            this._noProducts = true; // Added as Part Of BS-934
            this.dataList = [];
            this._isLoading = false;
        } else {
            this.totalProducts = result.productList.length;
            this._noProducts = true; // Added as Part Of BS-934
            if (this.onLoadBoolean == true) {
                this._onLoadGlobalProductListForFilterContainer = { products: result.productList };
                this.onLoadBoolean = false;
            }
            //Populate the list from which the filters for ordered products are identified
            this._globalProductListForFilterContainer = { products: result['productList'] };

            /*
             * Start BS-955
             * Block to identify if fetched products contains evil eye products
             */
            for (let index = 0; index < this._globalProductListForFilterContainer.products.length; index++) {
                if (this._globalProductListForFilterContainer.products[index].B2B_Brand__c === EVIL_EYE_LABEL) {
                    this._containsEvilEyeProduct = true;
                } else if (this._globalProductListForFilterContainer.products[index].B2B_Brand__c === SILHOUETTE_LABEL) {
                    this._containsSilhouetteProduct = true;
                }
            }

            if (this._containsSilhouetteProduct === true && this._containsEvilEyeProduct === true) {
                this._renderBrandFilter = true;
            }
            /* End BS-955 */

            this._updatedGlobalProductListForFilterContainer = { products: result['productList'] };
            if (result.orderSource !== null && result.orderSource !== undefined) {
                this._sourceValue = result.orderSource;
                this._selectedSourceValue = result.orderSource; // Added as part of BS-643
            }

            let productRecordList = [];
            let tempProductList = [];
            productRecordList = JSON.parse(JSON.stringify(this._globalProductListForFilterContainer.products));
            let allProductIdList = [];
            this.productIdVsProductMap = new Map();
            productRecordList.forEach((item) => {
                this.productIdVsProductMap.set(item.Id, JSON.parse(JSON.stringify(item)));
                allProductIdList.push(item.Id);
            });
            /*Start : BS-1568*/
            await checkSparePartsOnlyFrames({
                productIdList: allProductIdList,
                isSilhouetteStore: this._isSilhouetteStore
            })
                .then((result) => {
                    this._productIdVsIsFrameMap = result;
                })
                .catch((error) => {
                    console.error(error);
                });
            /*End : BS-1568*/
            //Based on the sort by selected sort the fetched the ordered products
            result = await getSortedProductsIds({
                productList: allProductIdList,
                fieldName: this.sortByValue,
                effectiveAccountId: this.effectiveAccountId
            });
            if (result) {
                result.forEach((id) => {
                    if (this.productIdVsProductMap.has(id)) {
                        tempProductList.push(this.productIdVsProductMap.get(id));
                    }
                });
                this._globalProductListForFilterContainer = null;
                //Update the list to sorted products.
                this._globalProductListForFilterContainer = {
                    products: tempProductList
                };

                /*
                 * Start BS-955
                 * Block to identify if fetched products contains evil eye products
                 */
                for (let index = 0; index < this._globalProductListForFilterContainer.products.length; index++) {
                    if (this._globalProductListForFilterContainer.products[index].B2B_Brand__c === EVIL_EYE_LABEL) {
                        this._containsEvilEyeProduct = true;
                    } else if (this._globalProductListForFilterContainer.products[index].B2B_Brand__c === SILHOUETTE_LABEL) {
                        this._containsSilhouetteProduct = true;
                    }
                }
                if (this._containsSilhouetteProduct === true && this._containsEvilEyeProduct === true) {
                    this._renderBrandFilter = true;
                }
                /* End BS-955 */

                let tempProductIdList = [];

                this._globalProductListForFilterContainer.products.forEach((product) => {
                    tempProductIdList.push(product.Id);
                });

                //Creating a shard of 20 products based on the page number to be provided to ConnectApi's getProducts method.
                let tempArrayList = Array.from(tempProductIdList);
                this.startingProductIndex = (this.pageNumber - 1) * 15;
                this.endingProductIndex = this.pageNumber * 15;
                tempArrayList = tempArrayList.slice(this.startingProductIndex, this.endingProductIndex);
                if (this.recievedProducts == null) {
                    result = await getOrderedProductData({
                        communityId: communityId,
                        effectiveAccountId: this.resolvedEffectiveAccountId,
                        productIds: tempArrayList
                    });
                    if (result) {
                        //BS-1245
                        if (result) {
                            let pricebookEntryIdCollection = [];
                            result.products.forEach((product) => {
                                if (
                                    product != null &&
                                    product != undefined &&
                                    product.prices != null &&
                                    product.prices != undefined &&
                                    product.prices.pricebookEntryId != null &&
                                    product.prices.pricebookEntryId != undefined
                                ) {
                                    pricebookEntryIdCollection.push(product.prices.pricebookEntryId);
                                }
                            });
                            this.getApplicableCurrencyCode(pricebookEntryIdCollection);
                        }
                        //BS-1245
                        //Sort the connectApi response based on the getSortedProductsIds's response
                        this.dataList = [];
                        this.localProductsListObj = null;
                        this.showReorderComp = true;
                        this._noProducts = false; // Added as Part Of BS-934
                        for (let index = 0; index < tempProductIdList.length; index++) {
                            for (let productIndex = 0; productIndex < result.products.length; productIndex++) {
                                if (tempProductIdList[index] == result.products[productIndex].id) {
                                    this.dataList.push(result.products[productIndex]);
                                }
                            }
                        }
                        //If no filters are applied show the products and update the filters based on the shown products
                        this.localProductsListObj = { products: this.dataList };
                        this.updateVisibleProducts();
                    }
                }
                //If there are existing filters applied, call the handleFilterProductSearch for applying filter logic
                if (this.recievedProducts != null) {
                    this.showReorderComp = true;
                    this._noProducts = false; // Added as Part Of BS-934
                    this.handleFilterProductSearch();
                }
            }
        }
        if (this.handleClearAllCalled === true) {
            const filterContainer = this.template.querySelector('c-b2b_filter-container');
            filterContainer.updateProductColor();
            this.handleClearAllCalled = false;
        }
    }

    /**
     * BS-1245
     * This method is used to get the applicable currency ISO Code from pricebookEntry
     *
     */
    getApplicableCurrencyCode(pricebookEntryIdCollection) {
        getCurrencyCode({ pricebookEntryIdList: pricebookEntryIdCollection })
            .then((result) => {
                this._applicableCurrencyCode = result[0] != null && result[0] != undefined ? result[0] : this._defaultCurrencyIsoCode;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    handleClearAll() {
        this._containsEvilEyeProduct = false; // Added as part of BS-955
        this._isLoading = false;
        this.recievedProducts = null;
        this._selectedFiltersMap.clear(); //BS-692
        this._selectedFilters = []; //BS-692
        this.displayData = null;
        this.onLoadBoolean = true;
        this._globalProductListForFilterContainer = null;
        this._onLoadGlobalProductListForFilterContainer = null;
        this._updatedGlobalProductListForFilterContainer = null;
        this.handleClearAllCalled = true;
        this.triggerGetOrderedProductIdsOverview();
    }

    async getFilterProductData() {
        this._isLoading = true;
        if (this.filteredProductListId.length > 0) {
            let result = await getSortedProductsIds({
                productList: this.filteredProductListId,
                fieldName: this.sortByValue,
                effectiveAccountId: this.effectiveAccountId
            });
            if (result) {
                let tempArrayList = Array.from(result);
                this.startingProductIndex = (this.pageNumber - 1) * 15;
                this.endingProductIndex = this.pageNumber * 15;
                tempArrayList = tempArrayList.slice(this.startingProductIndex, this.endingProductIndex);
                result = await getOrderedProductData({
                    communityId: communityId,
                    effectiveAccountId: this.resolvedEffectiveAccountId,
                    productIds: tempArrayList
                });
                if (result) {
                    this.dataList = [];
                    this.localProductsListObj = null;
                    this.showReorderComp = true;
                    this._noProducts = false; // Added as Part Of BS-934
                    for (let index = 0; index < tempArrayList.length; index++) {
                        for (let productIndex = 0; productIndex < result.products.length; productIndex++) {
                            if (tempArrayList[index] == result.products[productIndex].id) {
                                this.dataList.push(result.products[productIndex]);
                            }
                        }
                    }
                    this.localProductsListObj = { products: this.dataList };
                    this.updateVisibleProducts();
                }
            }
        } else {
            this.localProductsListObj = {};
            this.updateVisibleProducts();
        }
    }

    /**
     * Gets the colors used into the color filter from the custom metadata records.
     * BS-730
     * @private
     */
    triggerMetadataRetrieve() {
        getColorsMetadata({})
            .then((result) => {
                this._transparentUri = URI1 + URI2;
                /* Start : BS-1529 */
                this._customMetadataColors = new Map();
                let customMetadataMap = new Map(Object.entries(JSON.parse(result)));
                for (let [key, value] of customMetadataMap.entries()) {
                    this._customMetadataColors.set(value.Label, value);
                }
                /* End : BS-1529 */
            })
            .catch((error) => {
                this.error = error;
                console.error('Error:' + JSON.stringify(error));
            });
    }

    /**
     * BS-730
     *
     * this method will used to handle the filters when users remove it from selected filters
     */
    handleRemoveFilter(event) {
        let field = event.target.dataset.fieldName;
        let selectedValue = event.target.dataset.fieldValue;
        let filterType = event.target.dataset.fieldType;
        let filterEvent;
        if (field == 'B2B_Brand__c') {
            selectedValue = 'both';
        }

        if (filterType == SLIDER) {
            filterEvent = { detail: { field: field, value: selectedValue, filterType: filterType, doProductSearch: false, removeFilter: true } };
        } else {
            filterEvent = { detail: { field: field, value: '', filterType: filterType, checked: false } }; //BS-1529
        }
        //to remove the filter when its not a category filter
        if (this._selectedFiltersMap.has(field) == true && filterType != CATEGORY) {
            this._selectedFiltersMap.delete(field);
            this._selectedFilters = [];
            for (let filter of this._selectedFiltersMap.values()) {
                this._selectedFilters.push(filter);
            }
        }

        if (filterType != CATEGORY) {
            //to fire a event to uncheck the filter from filter container
            const filterContainer = this.template.querySelector('c-b2b_filter-container');
            filterContainer.handleSelection(filterEvent);
        }
    }

    /**
     * to get the information about the fields and other details of the Product object
     * BS-730
     * @private
     */
    @wire(getObjectInfo, { objectApiName: PRODUCT_OBJECT })
    oppInfo({ data, error }) {
        if (data) {
            this._productObjectData = data;
        } else if (error) {
            this.error = error;
            console.error('Error:' + JSON.stringify(error));
        }
    }

    /**
     * BS-730
     *
     * handler for event fired when user clicks on 'Clear All' on UI
     */
    handleClearReorder(event) {
        this.template.querySelector('c-b2b_filter-container').handleClear(event);
    }

    /**
     * Gets the picklist values and Prepare a Map of picklist API name vs Label
     * BS-821
     * @private
     */
    getAllPicklistValues() {
        getAllPicklistValues({})
            .then((result) => {
                let key;
                result.forEach((value) => {
                    key = value.fieldApiName + '_' + value.picklistApiName; //BS-1022
                    this._picklistApiNameVsLabelMap.set(key, value.picklistValue);
                });
            })
            .catch((error) => {
                this._isLoading = false;
                this.error = error;
                console.error('Error:' + JSON.stringify(error));
            });
    }

    /**
     * BS-906
     * This method will clear the filters from both filter container and from the top selection
     */
    clearFilters() {
        this.recievedProducts = null;
        this._selectedFiltersMap.clear(); //BS-692
        this._selectedFilters = []; //BS-692
        this.displayData = null;
        this.onLoadBoolean = true;
        this._globalProductListForFilterContainer = null;
        this._onLoadGlobalProductListForFilterContainer = null;
        this._updatedGlobalProductListForFilterContainer = null;
        const filterContainer = this.template.querySelector('c-b2b_filter-container');
        if (filterContainer) {
            filterContainer.resetColorRadioButton();
        }
    }
}
