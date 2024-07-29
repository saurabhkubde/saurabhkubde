import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CurrentPageReference } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import communityId from '@salesforce/community/Id';
import getPolicy from '@salesforce/apex/B2B_SearchController.getPolicy';
import searchProducts from '@salesforce/apex/B2B_SearchController.searchProducts';
import getAllProducts from '@salesforce/apex/B2B_SearchController.getAllProducts';
import productsSearch from '@salesforce/apex/B2B_SearchController.productsSearch';
import productSearch from '@salesforce/apex/B2B_SearchController.productSearch';
import getSearchedProducts from '@salesforce/apex/B2B_SearchController.getSearchedProducts';
import getCurrencyCode from '@salesforce/apex/B2B_CartController.getCurrencyCode'; //BS-1245
import CODE_FIELD from '@salesforce/schema/Account.k_ARIS_Account_ID__c'; //BS-848
import HIDE_PURCHASE_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Purchase_Price__c'; //BS-2273
import HIDE_SUGGESTED_RETAIL_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Suggested_Retail_Price__c'; //BS-2273
import getColorCountAndSizeforProduct from '@salesforce/apex/B2B_SearchController.getColorCountAndSizeforProduct'; //BS-2226
import getBridgeTempleCountforProduct from '@salesforce/apex/B2B_SearchController.getBridgeTempleCountforProduct'; //BS-2226
import B2B_COMPACT_CATEGORY_UTILITY_LABEL from '@salesforce/label/c.B2B_COMPACT_CATEGORY_UTILITY_LABEL'; //BS-2226

import { sortBy, pageManager } from 'c/b2b_utils';

import getSortRules from '@salesforce/apex/B2B_SearchController.getSortRules';
import addToCart from '@salesforce/apex/B2B_CartController.addToCart';
import getCategoryData from '@salesforce/apex/B2B_SearchController.getCategoryData';
import getCartSummary from '@salesforce/apex/B2B_CartController.getCartSummary';
import getColorsMetadata from '@salesforce/apex/B2B_SearchController.getColorsMetadata'; //BS-730
import getPicklistValues from '@salesforce/apex/B2B_SearchController.getPicklistValues'; //BS-821
import getAttributeFieldData from '@salesforce/apex/B2B_SearchController.getAttributeFieldData'; //Added as part of BS-1179

import { transformData } from './dataNormalizer';

import PRODUCT_OBJECT from '@salesforce/schema/Product2'; //BS-730
import { getObjectInfo } from 'lightning/uiObjectInfoApi'; //BS-730

import FILTER_LABELS from '@salesforce/label/c.B2B_PLP_Filters';
import HEADLINE_LABELS from '@salesforce/label/c.B2B_PLP_Headline';
import HIDE_PRICES_FIELD from '@salesforce/schema/Account.B2B_Hide_Prices__c';
import ALL_CATEGORY from '@salesforce/label/c.B2B_All_Category'; //BS-730
import LANG from '@salesforce/i18n/lang';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //652
import B2B_CATEGORIES_TO_EXCLUDE_FROM_GLOBAL_SEARCH from '@salesforce/label/c.B2B_CATEGORIES_TO_EXCLUDE_FROM_GLOBAL_SEARCH'; //BS-1676
import BICOLOR_COLOR from '@salesforce/label/c.B2B_Color_Bicolor'; //BS-1529
import SORT_BY_OPTION_READY_TO_SHIP from '@salesforce/label/c.B2B_SORT_BY_READY_TO_SHIP_OPTION'; //BS-848
import SKU_SEQUENCE from '@salesforce/label/c.B2B_SKU_SEQUENCE'; //BS-2394

const fields = [HIDE_PRICES_FIELD, CODE_FIELD, HIDE_PURCHASE_PRICE_FIELD, HIDE_SUGGESTED_RETAIL_PRICE_FIELD];
const ASCENDING_ORDER = 'Ascending';
const SEARCH_KEYWORD = 'search';
const FILTER_KEY = 'selectedFilters'; //BS-227
//BS-730 Start
const RADIO_BUTTON = 'Radio Button';
const COLOR_RADIO_BUTTON = 'Color Radio Button';
const CATEGORY = 'Category';
const SLIDER = 'Slider';
const SILHOUETTE_SHORTFORM = 'SH';
const FRAME_COLOR = 'B2B_Frame_Color__c';
const LENS_COLOR = 'B2B_Lens_Color__c';
const MIRROR_COLOR = 'B2B_Mirror_Color__c';
const X_CHAR = 'X';
const M_CHAR = 'M';
const ENGLISH_LANGUAGE = 'en_US'; //BS-1595
const URI1 =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxwYXR0ZXJuIGlkPSJiIiBwYXR0ZXJuVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PHVzZSB4bGluazpocmVmPSIjYSIgdHJhbnNmb3JtPSJzY2FsZSguNSkiLz48L3BhdHRlcm4+PGltYWdlIGlkPSJhIiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0NBWUFBQUJYQXZtSEFBQUVHV2xEUTFCclEwZERiMnh2Y2xOd1lXTmxSMlZ1WlhKcFkxSkhRZ0FBT0kyTlZWMW9IRlVVUHJ0elp5TWt6bE5zTklWMHFEOE5KUTJUVmpTaHRMcC8zZDAyYnBaSk50b2k2R1QyN3M2WXljNDRNN3Y5b1U5RlVId3g2cHNVeEwrM2dDQW85US9iUHJRdmxRb2wydFFnS0Q2MCtJTlE2SXVtNjVrN001bHB1ckhlWmU1ODg1M3ZubnZ1dVdmdkJlaTVxbGlXa1JRQkZwcXVMUmN5NG5PSGo0ZzlLNUNFaDZBWEJxRlhVUjByWGFsTUFqWlBDM2UxVzk5RHdudGYyZFhkL3ArdHQwWWRGU0J4SDJLejVxZ0xpSThCOEtkVnkzWUJldnFSSHovcVdoNzJZdWkzTVVERUwzcTQ0V1BYdzNNK2ZvMXBadVFzNHRPSUJWVlRhb2lYRUkvTXhmaEdEUHN4c05aZm9FMXE2NnJvNWFKaW0zWGRvTEZ3NzJIK24yM0JhSVh6YmNPbno1bWZQb1R2WVZ6N0t6VWw1K0ZSeEV1cWtwOUcvQWppYTIxOXRoemcyNWFia1JFL0JwRGMzcHF2cGhIdlJGeXMyd2VxdnAra3JiV0tJWDduaERiekxPSXRpTTgzNThwVHdkaXJxcFBGbk1GMnhMYzFXdkx5T3dUQWlicGJtdkhIY3Z0dFU1N3k1K1hxTlpyTGUzbEUvUHE4ZVVqMmZYS2ZPZTNwZk9qemhKWXRCL3lsbDVTREZjU0RpSCtoUmtIMjUrTCtzZHhLRUFNWmFocmxTWDh1a3FNT1d5L2pYVzJtNk05TERCYzMxQjlMRnV2NmdWS2cvMFN6aTNLQXIxa0dxMUdNalUvYUxibnE2L2xSeGM0WGZKOThoVGFyZ1grK0RiTUpCU2lZTUllOUNrMVlBeEZrS0VBRzN4YllhS21ERGdZeUZLMFVHWXBmb1dZWEcrZkFQUEk2dEpuTndiN0NsUDdJeUYrRCtiak90Q3BraHo2Q0ZySWEvSTZzRnRObDhhdUZYR01UUDM0c053SS9KaGtnRXRtRHoxNHlTZmFSY1RJQklubUtQRTMya3h5eUUyVHYrdGhLYkVWZVBEZlcvYnlNTTFLbW0wWGRPYlM3b0dEL015cE1YRlBYckN3T3RvWWp5eW43QlYyOS9NWmZzVnpwTERkUnR1SVpuYnBYenZsZitldjhNdllyL0dxazRIL2tWL0czY3NkYXpMdXlUTVBzYkZoemQxVWFiUWJqRnZEUm1jV0p4UjN6Y2ZIa1Z3OUdmcGJKbWVldjlGMDhXVzh1RGthc2x3WDZhdmxXR1U2TlJLejBnL1NIdEN5OUozMG8vY2E5elgzS2ZjMTl6bjNCWFFLUk84dWQ0NzdoTG5BZmMxL0c5bXJ6R2xyZmV4WjVHTGRuNlpacnJFb2hJMndWSGhaeXdqYmhVV0V5OGljTUNHTkNVZGlCbHEzcit4YWZMNTQ5SFE1akgrYW4rMXkrTGxZQmlmdXhBdlJOL2xWVlZPbHdsQ2tkVm05Tk9MNUJFNHdrUTJTTWxEWlU5N2hYODZFaWxVL2xVbWtRVXp0VEU2bXgxRUVQaDdPbWRxQnRBdnY4SGRXcGJySlM2dEpqM24wQ1dkTTZidXNOelJWM1M5S1RZaHF2TmlxV211cm9pS2dZaHNoTWptaFRoOXB0V2hzRjc5NzBqL1NiTXJzUEUxc3VSNXo3RE1DK1AvSHMreTdpanJRQWxoeUFnY2NqYmhqUHlnZmVCVGp6aE5xeTI4RWRrVWg4QytEVTkrejJ2L295ZUg3OTFPbmN4SE9zNXkyQXRUYzduYi9mNzNUV1BrRC9xd0Jualg4Qm9KOThWUU5jQys4QUFBQ3pTVVJCVkdnRjdaaEJDc013REFUanZzYi9mNDEvMDlM';
const URI2 =
    'akhzV1FiUU9UbThDUzRoa0xqTmZlKzMwTnZuUE9HaXkvN3E3L212ek1QNjUxQTcrMm9nRU5RQUllSVFnUXAyc0FJNFFGSG05Z2RLLzV3cnI3YmpPdC8zZ0RiZ0RPSUU3WEFFWUlDMmdBQXNUcEdzQUlZUUVOUUlBNGZVM3ZIcjRMWWVaWndCbElIdjFJQTMzbTJWRUR5YU1mYWFEUFBEdHFJSG4wSTkrRitzeXpvek9RUFBxUkJ2ck1zNk1Ha2tjLzBrQ2ZlWGJVUVBMb1J4K1lPeHRMdG4wd2lBQUFBQUJKUlU1RXJrSmdnZz09Ii8+PC9kZWZzPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9InVybCgjYikiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iLjEiLz48L3N2Zz4=';
//BS-730 End
const GLOBAL_SEARCH_URL = 'global-search'; //Added as part of BS-1084
const FILTER_GLOBAL_KEY = 'selectedFiltersGlobal'; //Added as part of BS-1084
const FILTER_GLOBAL_SEARCH_TERM = 'searchterm'; //Added as part of BS-1084
const TYPE_KEY = 'typekey'; //Added as part of BS-930
const NB_BRAND = 'NB'; //BS-1544
const SH_BRAND = 'SH'; //BS-1544
const SH_STORE = 'silhouette'; //BS-1544
const AVAILABLE_AS_OF_CODE = 2; //BS-848
const ASSIGN = 'Assign';
const CHINESE_LANG_BY_DEFAULT = 'zh_Hans-CN'; //BS-2314
const CHINESE_ORIGINAL_LANG = 'zh_CN'; //BS-2314
const DISCONTINUED_PRODUCT_IDS = 'disContinuedProductsIds'; //BS-2434
const CATEGORY_PRODUCT_IDS = 'currentCategoryProductIds'; //BS-2434
const COMPACT = B2B_COMPACT_CATEGORY_UTILITY_LABEL.split(',')[0]; //BS-2226
const COMPACT_ES = 'vista-r%C3%A1pida'; //BS-2226
/**
 * A search results component that shows results of a product search or
 * category browsing.This component handles data retrieval and management, as
 * well as projection for internal display components.
 * When deployed, it is available in the Builder under Custom Components as
 * 'B2B Custom Search Results'
 */
export default class SearchResults extends NavigationMixin(LightningElement) {
    /** Start : BS-1179 */
    constructor() {
        super();
        this.getAttributeFieldData();
    }
    /** End : BS-1179 */
    /**
     * BS-442
     * The pageSource used to determine current page details
     *
     * @type {string}
     */
    @api
    pageSource;

    /**
     * Store name on which this component is currently embedded (e.g. SH/NB)
     * BS-442
     * @type {String}
     */
    @api
    storeName;

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
        if (newId && this.term) {
            this.triggerGetSortRules();
        }
        //this.updateCartInformation();
    }

    /**
     *  Gets or sets the unique identifier of a category.
     *
     * @type {string}
     */
    @api
    get recordId() {
        return this._recordId;
    }
    set recordId(value) {
        this._recordId = value;
        this._landingRecordId = value;
    }

    /**
     *  Gets or sets the search term.
     *
     * @type {string}
     */
    @api
    get term() {
        return this._term;
    }
    set term(value) {
        this._term = value;
    }

    /**
     *  Gets or sets fields to show on a card.
     *
     * @type {string}
     */
    @api
    get cardContentMapping() {
        return this._cardContentMapping;
    }
    set cardContentMapping(value) {
        this._cardContentMapping = value;
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

    /**
     * This variable is used to store applicable currency code
     * BS-1245
     * @type {string}
     */
    _applicableCurrencyCode; //BS-1245

    //Added as a part of BS-1595
    _categoryLabelAvailable = false;

    @track
    categoriesToExcludeFromGlobalSearchCollection; //BS-1676

    /**
     *  Gets and sets options to be displayed in combobox.
     *
     * @type {string}
     */
    get sortingOptions() {
        return this._sortingOptions;
    }

    set sortingOptions(value) {
        if (value[1] == ASSIGN) {
            this._sortingOptions = value[0];
        } else {
            value = value[0];
            this._sortingOptions = [];
            value.sortRules.forEach((element) => {
                this._sortingOptions.push({
                    label: element.label,
                    value: element.sortRuleId,
                    name: element.nameOrId,
                    direction: element.direction
                });
            });
            if (this._isGlobalSearchPLP === false) {
                this._sortingOptions.splice(2, 0, {
                    label: SORT_BY_OPTION_READY_TO_SHIP,
                    value: SORT_BY_OPTION_READY_TO_SHIP,
                    name: SORT_BY_OPTION_READY_TO_SHIP,
                    direction: 'default'
                });
            }
        }
    }

    @track
    _allProductsData;
    @track
    _dataFetched;
    @track
    _productsToShow = [];
    _loadFilters = false;

    @track
    _categoryData = [];

    _filteredProductIds = [];

    _recievedFilters;
    _startingRecord = 1;
    _endingRecord = 0;
    _displayData;
    _isLoading = false;
    _pageNumber = 1;
    _productPageNumber = 1;
    _refinements = [];
    _term;
    _recordId;
    _landingRecordId;
    _cardContentMapping;
    _effectiveAccountId;
    _currentCategoryId;
    _globalProductData;
    _duplicateData;
    _counter = 0;
    _pageSizeForPopUp = 15;
    _hidePricesFromTiles;
    totalProducts;
    sortingValue;
    _hasProducts = false;
    _sortName;
    _sortDerection;
    _cartSummary;
    _isCategoryChange = false;
    _noProducts = false;
    _noResultFound = false;
    //BS-730 start
    _transparentUri;
    _productObjectData;
    _isGlobalSearch = false; //BS-2394
    @track
    _selectedFiltersMap = new Map();

    @track
    _selectedFilters = [];

    @track
    _customMetadataColors;
    //BS-730 end
    _picklistApiNameVsLabelMap = new Map(); //BS-821

    @api
    isEEBrand; //Added as part of BS-675

    @api
    isDisplaydata; //BS-227

    refreshIcon = STORE_STYLING + '/icons/refresh_icon.svg'; //BS-652

    /**
     * Flag to identify global search
     * BS-1084
     * @type {Boolean}
     */
    _isGlobalSearchPLP = false;

    /**
     *  Map to store filter field and its filterType
     *
     * @type {string}
     */
    _filterSourceFieldVsFilterType = new Map();

    categoryVsProductListMap = new Map(); //BS-951
    categoryVsProductListMapGlobalSearch = new Map(); //BS-951
    productCategoryList; //BS-951
    orderedCategoryList = []; // BS-951
    productCategoryVsParentCategoryIdMap = new Map(); //BS-951

    //Added as part of BS-1179
    @track
    _fieldWrapper;

    _storeBrand;
    _productSearchList;
    _cartItemId; //BS-1562

    //BS-1529
    _bicolorImage = STORE_STYLING + '/icons/color-wheel.svg';

    @wire(getRecord, { recordId: '$effectiveAccountId', fields })
    account;
    @track
    _productIdVsColourCountAndSize = []; //BS-2226
    @track
    _productIdVsBridgeTempleCount = []; //BS-2226
    _isCompact = false; //BS-2226

    /**
     * get and set the variable value to hide or show price on UI
     */
    get hidePrice() {
        this._hidePricesFromTiles = !!getFieldValue(this.account.data, HIDE_PRICES_FIELD);
        return getFieldValue(this.account.data, HIDE_PRICES_FIELD);
    }

    /**
     * get HIDE_PURCHASE_PRICE_FIELD value on account
     */
    get hidePurchasePriceField() {
        if (this.account && this.account.data) {
            return getFieldValue(this.account.data, HIDE_PURCHASE_PRICE_FIELD);
        }
        return true;
    }

    /**
     * This method is use to get country code associated with the account //BS-848
     *  @type {String}
     */
    get countryCode() {
        if (this.account.data) {
            return getFieldValue(this.account.data, CODE_FIELD).substring(0, 4);
        } else {
            return null;
        }
    }
    get hidePricesFromTiles() {
        return this._hidePricesFromTiles;
    }

    handleHidePriceSection() {
        this.template.querySelector('c-b2b_search-layout').hidePricesFromTiles = true;
    }

    handleShowPriceSection() {
        this.template.querySelector('c-b2b_search-layout').hidePricesFromTiles = false;
    }

    /**
     * Gets the header text which shows the search results details.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get headerText() {
        let ofLabel = HEADLINE_LABELS.split(',')[0];
        let itemsLabel = HEADLINE_LABELS.split(',')[1];
        let oneResultLabel = HEADLINE_LABELS.split(',')[2];
        let text = '';
        const totalItemCount = this._productsToShow.length;
        const pageSize = this._pageSizeForPopUp;

        if (totalItemCount > 1) {
            const startIndex = (this._pageNumber - 1) * pageSize + 1;

            const endIndex = Math.min(startIndex + pageSize - 1, totalItemCount);

            text = text + startIndex + ' - ' + endIndex + ' ' + ofLabel + ' ' + totalItemCount + ' ' + itemsLabel;
        } else if (totalItemCount === 1) {
            text = oneResultLabel;
        }

        return text;
    }

    //Filter labels
    filterLabel = FILTER_LABELS.split(',')[0];
    clearAllLabel = FILTER_LABELS.split(',')[1];
    sortByLabel = FILTER_LABELS.split(',')[2];

    /**
     * Gets whether results has more than 1 page.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get hasMorePages() {
        return this.totalProducts > this._pageSizeForPopUp;
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
     * Gets or sets the normalized, displayable results for use by the display components.
     *
     * @private
     */
    get displayData() {
        return this._allProductsData || {};
    }
    set displayData(data) {
        /* Start BS-1544 */
        if (
            this._fieldWrapper !== undefined &&
            this._fieldWrapper !== null &&
            this._productSearchList !== undefined &&
            this._productSearchList !== null &&
            this._productSearchList.length > 0 &&
            this.productCategoryVsParentCategoryIdMap !== undefined &&
            this.productCategoryVsParentCategoryIdMap !== null
        ) {
            this._allProductsData = transformData(
                data,
                this._cardContentMapping,
                this._fieldWrapper,
                this._productSearchList,
                this.productCategoryVsParentCategoryIdMap
            );
            /* End BS-1544 */
        }
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
     * returns true if the current store is SH store
     *
     * @type {boolean}
     * @readonly
     * @private
     */
    get isSilhouetteStore() {
        let silhouetteStore;
        if (this.storeName === SILHOUETTE_SHORTFORM) {
            silhouetteStore = true;
        } else {
            silhouetteStore = false;
        }
        return silhouetteStore;
    }

    /**
     * BS-521
     * Method is used to get current page reference and URL parameters
     */
    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        try {
            this._currentCategoryId = pageRef.attributes.recordId;
            //this._categoryPath = pageRef.state.categoryPath;
            // BS-2226
            if (
                pageRef.state.categoryPath != null &&
                pageRef.state.categoryPath != undefined &&
                (JSON.stringify(pageRef.state.categoryPath).includes(COMPACT) || JSON.stringify(pageRef.state.categoryPath).includes(COMPACT_ES))
            ) {
                this._isCompact = true;
            }
            if (this._currentCategoryId) {
                this.recordId = this._currentCategoryId;
                this._categoryName = '';
                this.currentStore = '';
                this.triggerGetSortRules();
            }
        } catch (exceptionInstance) {
            console.error(exceptionInstance);
        }
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
     * BS-444
     *
     * this method is used to call  the child components method
     */
    showProducts() {
        this._isLoading = false;
        let categoryId;
        let filters;
        /* BS-227 the below if block is used to set the filter data in local storage
         *  this data will be used to persist the filter and product data when user gets back to same page.
         */
        if (this._recievedFilters != null) {
            const arr = Array.from(this._recievedFilters, ([key, value]) => {
                return { key: key, value: value };
            });
            /* Start BS-1084 */
            if (this._isGlobalSearchPLP === false) {
                categoryId = this._currentCategoryId;
                filters = {};
                filters[categoryId] = arr;
                localStorage.setItem(FILTER_KEY, JSON.stringify(filters)); //setting the local storage with filter data
            } else if (this._isGlobalSearchPLP === true) {
                filters = {};
                filters.globalSearchKey = arr;
                localStorage.setItem(FILTER_GLOBAL_KEY, JSON.stringify(filters)); //setting the local storage with filter data
            }
            /* End BS-1084 */
        }
        if (this._productsToShow.length > 0) {
            this._noProducts = false;
            if (this._loadFilters == false) {
                this._loadFilters = true;
            } else if (this._isCategoryChange == true) {
                this._isCategoryChange = false;
                const filterContainer = this.template.querySelector('c-b2b_filter-container');
                filterContainer.getAvailableCategoryDetails(this.recordId);
            } else {
                const filterContainer = this.template.querySelector('c-b2b_filter-container');
                filterContainer.updateFilters();
            }
        } else {
            this._noProducts = true; //BS-642-the variable gets set and the no products to show component gets rendered
            this.displayData = null;
            const filterContainer = this.template.querySelector('c-b2b_filter-container');
            filterContainer.updateRadioButtonFilter();
            filterContainer.updateFilters(); // Added as part of BS-930
            this.isDisplaydata = 0;
        }
    }

    /**
     * BS-444
     *
     * this method will intiate the product search to fetch the policy ids
     */
    triggerProductSearch() {
        this._isLoading = true;
        this.triggerMetadataRetrieve(); //BS-730 to retrieve color metadata.
        this.getPolicyProducts();
    }

    /**
     * BS-444
     *
     * this method will get the products based on Policy ids
     */
    getPolicyProducts() {
        searchProducts({
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
            .then((result) => {
                if (result != null) {
                    this._productIdList = result;
                    if (this.recordId == undefined && this.term != null) {
                        this.fetchedSearchedProducts();
                    } else {
                        this.fetchAllProducts();
                    }
                }
            })
            .catch((error) => {
                this._isLoading = false;
                console.error('error:', error);
            });
    }

    /**
     * BS-444
     *
     * this method will get the products based on  category
     */
    fetchAllProducts() {
        let categoryList = [];
        if (this.productCategoryVsParentCategoryIdMap) {
            let currentCategory = this.recordId;
            let categoriesList = Object.keys(this.productCategoryVsParentCategoryIdMap);
            categoryList.push(currentCategory);
            categoriesList.forEach((item) => {
                currentCategory = item;
                while (currentCategory != null && currentCategory != undefined) {
                    if (this.productCategoryVsParentCategoryIdMap[currentCategory].parentCategoryId == this.recordId) {
                        if (categoryList.includes(currentCategory) == false) {
                            categoryList.push(currentCategory);
                        }
                    }
                    currentCategory = this.productCategoryVsParentCategoryIdMap[currentCategory].parentCategoryId;
                }
            });
        }
        getAllProducts({
            productIdList: this._productIdList,
            categoryName: this.recordId,
            categoryList: categoryList
        })
            .then((result) => {
                if (result != null) {
                    this.productCategoryList = result.productCategoryList;
                    let productSearchList = result.productList;
                    this._productSearchList = productSearchList; //Added as part of BS-1544
                    let productListTemp = [];
                    let categoryList = [];
                    if (productSearchList !== undefined && productSearchList !== null && productSearchList.length > 0) {
                        productSearchList.forEach((product) => {
                            let prod = product.Product;
                            prod.productCategoryId = product.ProductCategoryId;
                            if (categoryList.includes(product.ProductCategoryId) == false) {
                                categoryList.push(product.ProductCategoryId);
                            }
                            productListTemp.push(prod);
                        });
                        this.orderedCategoryList = [];
                        if (this.productCategoryList !== undefined && this.productCategoryList !== null && this.productCategoryList.length > 0) {
                            this.productCategoryList.forEach((productCategory) => {
                                if (categoryList.includes(productCategory.Id)) {
                                    if (this.orderedCategoryList.includes(productCategory.Id) == false) {
                                        this.orderedCategoryList.push(productCategory.Id);
                                    }
                                }
                            });
                        }

                        this._hasProducts = true;
                        this._globalProductData = productListTemp;
                        this._productsToShow = JSON.parse(JSON.stringify(this._globalProductData));
                        this.totalProducts = productListTemp.length;
                        //BS-227 start
                        let filtersMap = new Map();
                        let filtersData = JSON.parse(localStorage.getItem(FILTER_KEY)); //this will get the filters from local storage
                        if (filtersData != null) {
                            let filtersList = filtersData[this._currentCategoryId];
                            //the below block will be used to prepare a filters map from the local storage data
                            if (filtersList != undefined && filtersList != null) {
                                filtersList.forEach((item) => {
                                    filtersMap.set(item.key, item.value);
                                });
                                this._recievedFilters = filtersMap;
                            } else {
                                /* BS-227 if there is no filters for the current category this will remove
                                    the existing filters
                                */
                                localStorage.removeItem(FILTER_KEY);
                                this._recievedFilters = filtersMap;
                            }
                        }
                        localStorage.removeItem(FILTER_KEY); //BS-227 end
                        if (this._recievedFilters != null) {
                            this.handleFilterProductSearch(this._recievedFilters);
                        } else {
                            this._productsToShow.forEach((product) => {
                                this._filteredProductIds.push(product.Id);
                            });
                            //BS-2320: New Label issue added else block
                            if (this._filteredProductIds.length > 0) {
                                this.fetchCategoryData();
                            } else {
                                this.handleSort(true);
                            }
                        }
                    } else {
                        this._noResultFound = true;
                        this._noProducts = true;
                        this._isLoading = false;
                    }
                } else {
                    this._noResultFound = true;
                    this._noProducts = true;
                    this._isLoading = false;
                }
            })
            .catch((error) => {
                this._isLoading = false;
                console.error('error: here', error);
            });
    }

    /**
     * BS-571
     *
     * this method will get the products based on the search term provided
     */
    fetchedSearchedProducts() {
        this._isGlobalSearch = !isNaN(this.term.replace(/\s+/g, '')); //BS-2394

        getSearchedProducts({
            productIdList: this._productIdList,
            searchTerm: this.term,
            storeName: this.storeName
        })
            .then((result) => {
                this.categoryVsProductListMapGlobalSearch.clear();
                if (result != null && result != undefined) {
                    this.productCategoryList = result.productCategoryList;
                    let productSearchList = result.productList;
                    // BS-951
                    if (productSearchList.length > 0) {
                        this._productSearchList = productSearchList; //Added as part of BS-1544
                        let tempList = [];
                        productSearchList.forEach((item) => {
                            tempList.push(item.Product);
                        });
                        // Loop through each product in the data
                        productSearchList.forEach((product) => {
                            // Get the category name
                            let categoryId = product.ProductCategoryId;
                            // Check if the category name already exists in the map
                            if (this.categoryVsProductListMapGlobalSearch.has(categoryId)) {
                                // Category exists, add the product to the existing list
                                let productList = this.categoryVsProductListMapGlobalSearch.get(categoryId);
                                let prod = product.Product;
                                prod.productCategoryId = product.ProductCategoryId;
                                productList.push(prod);
                            } else {
                                // Category doesn't exist, create a new list with the product
                                let prod = product.Product;
                                prod.productCategoryId = product.ProductCategoryId;
                                this.categoryVsProductListMapGlobalSearch.set(categoryId, [prod]);
                            }
                        });

                        let keys = [...this.categoryVsProductListMapGlobalSearch.keys()];
                        this.productCategoryList.forEach((productCategory) => {
                            if (keys.includes(productCategory.Id)) {
                                if (this.orderedCategoryList.includes(productCategory.Id) == false) {
                                    this.orderedCategoryList.push(productCategory.Id);
                                }
                            }
                        });

                        this._hasProducts = true;
                        this._globalProductData = tempList;
                        this._productsToShow = JSON.parse(JSON.stringify(this._globalProductData));
                        this.totalProducts = tempList.length;

                        /* Start BS-1084 */
                        let filtersMap = new Map();
                        let filtersData = JSON.parse(localStorage.getItem(FILTER_GLOBAL_KEY)); //this will get the filters from local storage
                        if (filtersData != null) {
                            let filtersList = filtersData.globalSearchKey;
                            //the below block will be used to prepare a filters map from the local storage data
                            if (filtersList != undefined && filtersList != null) {
                                filtersList.forEach((item) => {
                                    filtersMap.set(item.key, item.value);
                                });
                                this._recievedFilters = filtersMap;
                            } else {
                                localStorage.removeItem(FILTER_GLOBAL_KEY);
                                this._recievedFilters = filtersMap;
                            }
                        }
                        /* End BS-1084 */

                        if (this._recievedFilters != null) {
                            this.handleFilterProductSearch(this._recievedFilters);
                        } else {
                            this._productsToShow.forEach((product) => {
                                this._filteredProductIds.push(product.Id);
                            });
                            //BS-2320: New Label issue added else block
                            if (this._filteredProductIds.length > 0) {
                                this._productIdList = this._filteredProductIds;
                                this.fetchCategoryData();
                            } else {
                                this.handleSort(true);
                            }
                        }
                        this.updateSearchTerm();
                    } else {
                        this._isLoading = false;
                        this._noResultFound = true;
                        this._noProducts = true;
                        this.updateSearchTerm();
                    }
                } else {
                    this._isLoading = false;
                    this._noResultFound = true;
                    this._noProducts = true;
                    this.updateSearchTerm();
                }
            })
            .catch((error) => {
                this._isLoading = false;
                console.error('error: here', error);
            });
    }

    /**
     * BS-444
     *
     * this method will get the displayable products using connect API call
     */
    getDisplayProducts(products) {
        productsSearch({
            communityId: communityId,
            effectiveAccountId: this.resolvedEffectiveAccountId,
            productIdList: products
        }).then((result) => {
            //BS-1245
            let pricebookEntryIdCollection = [];
            if (result) {
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
            this._dataFetched = result;
            this.displayData = this._dataFetched;
            this.isDisplaydata = this.displayData.layoutData.length; //BS-227
            this.handleDisplaySort(products);
            this._isLoading = false;
        });
    }

    /**
     * BS-1245
     * This method is used to get the applicable currency ISO Code from pricebookEntry
     *
     */
    getApplicableCurrencyCode(pricebookEntryIdCollection) {
        getCurrencyCode({ pricebookEntryIdList: pricebookEntryIdCollection })
            .then((result) => {
                this._applicableCurrencyCode = result[0];
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /**
     * BS-444
     * handler for filter product search event fired from b2b_filterContainer component
     */
    handleFilterProductSearch(event) {
        this._pageNumber = event.target ? 1 : pageManager.getPreviouslyVisitedPageIfFromPDPOrFirst(this._currentCategoryId);
        this._isLoading = true;
        if (event.detail) {
            this._recievedFilters = event.detail.productsFilterMap;
        }
        const arr = Array.from(this._recievedFilters, ([key, value]) => {
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
                /**
                 * BS-930
                 * Updated block to have multiselect selected filters on PLP
                 */
                for (let filter of this._selectedFiltersMap.values()) {
                    if (filter.filterType !== undefined && filter.filterType === CATEGORY) {
                        this._selectedFilters.push(filter);
                    } else if (
                        filter[0].fieldName !== undefined &&
                        this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                        this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType !== SLIDER
                    ) {
                        for (let selectedValue of filter) {
                            this._selectedFilters.push(selectedValue);
                        }
                    } else if (
                        filter[0].fieldName !== undefined &&
                        this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                        this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType === SLIDER
                    ) {
                        this._selectedFilters.push(filter[0]);
                    }
                } //BS-730 End
            }
            this._productsToShow = JSON.parse(JSON.stringify(this._globalProductData));
            this.totalProducts = this._productsToShow.length;
            this._productsToShow.forEach((product) => {
                this._filteredProductIds.push(product.Id);
            });
            //BS-2320: New Label issue added else block
            if (this._filteredProductIds.length > 0) {
                this.fetchCategoryData();
            } else {
                this.handleSort(true);
            }
        }
    }

    /**
     * BS-444
     * Method to segregate products matching filter criteria for filters selected by user on UI
     */
    filterProducts(filterObj) {
        var totalFilterApplied = filterObj.length;
        let filteredProducts = [];
        let data = {};
        let colorStyleData;
        if (totalFilterApplied > 0) {
            // BS-730 The below block of code will create a data to show the selected filters
            /**
             * BS-930
             * Updated the block to identify and created selected filter objects to be shown on UI
             */
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
                            isMultiselect: this._filterSourceFieldVsFilterType.has(filterKey.key)
                                ? this._filterSourceFieldVsFilterType.get(filterKey.key).isMultiselect
                                : false,
                            isColor: false,
                            previousCategoryId: null,
                            previousCategoryName: null
                        };
                        /* Start BS-930 */
                        let filterValueList = [];
                        filterValueList.push(data);
                        this._selectedFiltersMap.set(filterKey.key, filterValueList);
                        /* End BS-930 */
                    } else if (filterKey.key == FRAME_COLOR || filterKey.key == LENS_COLOR || filterKey.key == MIRROR_COLOR) {
                        //for color radio button filter
                        let colorList = filterKey.value.split(';');

                        for (let colorIndex = 0; colorIndex < colorList.length; colorIndex++) {
                            if (this._customMetadataColors.has(colorList[colorIndex])) {
                                /* Start : BS-1529 */
                                if (this._customMetadataColors.get(colorList[colorIndex]).B2B_Color_name__c === BICOLOR_COLOR.split(',')[0]) {
                                    colorStyleData = 'background: url(' + this._bicolorImage + ')';
                                } else {
                                    if (this._customMetadataColors.get(colorList[colorIndex]).B2B_Color_name__c == 'transparent') {
                                        colorStyleData = 'background: url(' + this._transparentUri + ')';
                                    } else {
                                        colorStyleData = 'background: ' + this._customMetadataColors.get(colorList[colorIndex]).B2B_Color_code__c;
                                    }
                                }
                                /* End : BS-1529 */
                                data = {
                                    fieldName: filterKey.key,
                                    fieldValue: colorList[colorIndex],
                                    filterType: COLOR_RADIO_BUTTON,
                                    isMultiselect: this._filterSourceFieldVsFilterType.has(filterKey.key)
                                        ? this._filterSourceFieldVsFilterType.get(filterKey.key).isMultiselect
                                        : false,
                                    colorStyle: colorStyleData,
                                    isColor: true,
                                    previousCategoryId: null,
                                    previousCategoryName: null
                                };
                                if (this._selectedFiltersMap.has(filterKey.key)) {
                                    this._selectedFiltersMap.get(filterKey.key).push(data);
                                } else {
                                    this._selectedFiltersMap.set(filterKey.key, [data]);
                                }
                                data = {};
                            }
                        }
                    } else {
                        //for radio button filter
                        for (let index = 0; index < filterKey.value.split(';').length; index++) {
                            data = {
                                fieldName: filterKey.key,
                                displayFilter: this._picklistApiNameVsLabelMap.has(filterKey.key + '_' + filterKey.value.split(';')[index]) //BS-1022
                                    ? this._picklistApiNameVsLabelMap.get(filterKey.key + '_' + filterKey.value.split(';')[index])
                                    : filterKey.value.split(';')[index], //BS-821
                                fieldValue: filterKey.value.split(';')[index],
                                filterType: this._filterSourceFieldVsFilterType.has(filterKey.key)
                                    ? this._filterSourceFieldVsFilterType.get(filterKey.key).filterType
                                    : null,
                                isMultiselect: this._filterSourceFieldVsFilterType.has(filterKey.key)
                                    ? this._filterSourceFieldVsFilterType.get(filterKey.key).isMultiselect
                                    : false,
                                isColor: false,
                                previousCategoryId: null,
                                previousCategoryName: null
                            };
                            if (this._selectedFiltersMap.has(filterKey.key)) {
                                this._selectedFiltersMap.get(filterKey.key).push(data);
                            } else {
                                let selectedFilterData = [];
                                selectedFilterData.push(data);
                                this._selectedFiltersMap.set(filterKey.key, selectedFilterData);
                            }
                            data = {};
                        }
                    }
                }
            });
            this._selectedFilters = [];
            /**
             * BS-930
             * Added additional iterations to identify and fill the _selectedFilters list for radio button and color filters
             */
            for (let filter of this._selectedFiltersMap.values()) {
                if (filter.filterType !== undefined && filter.filterType === CATEGORY) {
                    this._selectedFilters.push(filter);
                } else if (
                    filter[0].fieldName !== undefined &&
                    this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                    this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType !== SLIDER
                ) {
                    for (let selectedValue of filter) {
                        this._selectedFilters.push(selectedValue);
                    }
                } else if (
                    filter[0].fieldName !== undefined &&
                    this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                    this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType === SLIDER
                ) {
                    this._selectedFilters.push(filter[0]);
                }
            } //BS-730 End
            this._globalProductData.forEach((product) => {
                let selectedFilterValues = [];
                filterObj.forEach((filterKey) => {
                    /* Start BS-930 */
                    let isMultiSelectPicklist = false;
                    /* This block idenfies if the current filter is not a silder filter
                     * If new filter is introduced this excludes that filter also
                     */
                    if (filterKey.value.sliderOneValue === undefined && filterKey.value.sliderTwoValue === undefined) {
                        selectedFilterValues = filterKey.value.split(';');
                        if (product[filterKey.key] !== undefined && product[filterKey.key].includes(';') === true) {
                            isMultiSelectPicklist = true;
                        }
                    }
                    if (
                        product[filterKey.key] !== undefined &&
                        isMultiSelectPicklist === false &&
                        (selectedFilterValues.includes(product[filterKey.key]) ||
                            (product[filterKey.key] >= filterKey.value.sliderOneValue && //BS-457
                                product[filterKey.key] <= filterKey.value.sliderTwoValue))
                    ) {
                        //BS-457
                        this._counter += 1;
                    } else if (product[filterKey.key] !== undefined && isMultiSelectPicklist === true) {
                        let multiSelectOptions = product[filterKey.key].split(';');
                        let filteredBoolean = false;
                        for (let index = 0; index < selectedFilterValues.length; index++) {
                            if (multiSelectOptions.length > 0 && multiSelectOptions.includes(selectedFilterValues[index])) {
                                filteredBoolean = true;
                            }
                        }
                        if (
                            filteredBoolean === true ||
                            (product[filterKey.key] >= filterKey.value.sliderOneValue && //BS-457
                                product[filterKey.key] <= filterKey.value.sliderTwoValue)
                        ) {
                            this._counter += 1;
                        }
                    }
                    /* End BS-930 */
                });
                if (this._counter == totalFilterApplied) {
                    filteredProducts.push(product);
                    this._filteredProductIds.push(product.Id);
                }
                this._counter = 0;
            });

            this._productsToShow = filteredProducts;
            this.totalProducts = this._productsToShow.length;
            if (this._productsToShow.length > 0) {
                this._productsToShow.forEach((product) => {
                    this._filteredProductIds.push(product.Id);
                });
                this.fetchCategoryData();
            } else {
                this.showProducts(); //BS-457
            }
        }
    }

    /**
     * Gets the sort rules based on community id.
     *
     * @private
     */
    triggerGetSortRules() {
        getSortRules({
            communityId: communityId
        })
            .then((result) => {
                this.sortingOptions = [result, ''];
                this.sortingValue = this.sortingOptions[0].value;
                this._sortName = this.sortingOptions[0].name;
                this._sortDerection = this.sortingOptions[0].direction;
                this.triggerProductSearch();
            })
            .catch((error) => {
                this.error = error;
                console.error('Error: ' + JSON.stringify(error));
            });
    }

    /**
     * Helper function for updating pageNumber and localStorage as per BS-2128.
     *
     * @private
     */
    setPageNumberInLocalStorage(toPageNumber) {
        this._pageNumber = toPageNumber;
        pageManager.setCategoryPageNumber(this._currentCategoryId, toPageNumber);
    }

    /**
     * Helper function for displaying products.
     *
     * @private
     */
    setProductsDisplay(forPageNumber) {
        this._isLoading = true;
        this.setPageNumberInLocalStorage(forPageNumber);
        let start = this._pageNumber - 1;
        let products = [];
        let counter = 0;
        for (let index = start * this._pageSizeForPopUp; index < this._productsToShow.length; index++) {
            products.push(this._productsToShow[index].Id);
            counter++;
            if (counter === this._pageSizeForPopUp) {
                break;
            }
        }
        // BS-2226
        if (this._isCompact && this._isCompact == true) {
            this.getColourCountAndSize(products);
            this.getBridgeTempleCount(products);
        }
        this.getDisplayProducts(products);
        this.topFunction();
    }

    /**
     * Handles a user request to navigate to previous page results page.
     *
     * @private
     */
    handlePreviousPage(evt) {
        this.setProductsDisplay(this._pageNumber - 1);
    }

    /**
     * Handles a user request to navigate to next page results page.
     *
     * @private
     */

    handleNextPage(evt) {
        this.setProductsDisplay(this._pageNumber + 1);
    }

    /**
     * Handles page jump event as per BS-2128.
     *
     * @private
     */
    handlePageJump(event) {
        this.setProductsDisplay(event.detail);
    }

    /**
     * function will take the control on top of page.
     */
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
     * Will fire trigger product search when user clicks on category.
     */
    handleCategoryUpdate(evt) {
        this._pageNumber = 1;
        this._isCategoryChange = true;
        this._isLoading = true;
        if (evt.detail.categoryId === SEARCH_KEYWORD) {
            this._productPageNumber = 1;
            this._globalProductData = null;
            this.recordId = null;
            //BS-730 : to remove category filters when parent most category gets clicked
            this._selectedFilters.forEach((filter) => {
                if (filter.filterType == CATEGORY) {
                    this._selectedFiltersMap.delete(filter.fieldName);
                }
            });
            this._selectedFilters = [];
            /**
             * BS-930
             * Added additional iterations to identify and fill the _selectedFilters list for radio button and color filters
             */
            for (let filter of this._selectedFiltersMap.values()) {
                if (filter.filterType !== undefined && filter.filterType === CATEGORY) {
                    this._selectedFilters.push(filter);
                } else if (
                    filter[0].fieldName !== undefined &&
                    this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                    this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType !== SLIDER
                ) {
                    for (let selectedValue of filter) {
                        this._selectedFilters.push(selectedValue);
                    }
                } else if (
                    filter[0].fieldName !== undefined &&
                    this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                    this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType === SLIDER
                ) {
                    this._selectedFilters.push(filter[0]);
                }
            } //BS-730 End
            this.fetchedSearchedProducts();
        } else {
            //BS-730
            let data = {};
            if (evt.detail.isBreadcrumbClicked == undefined || evt.detail.isBreadcrumbClicked == null) {
                //this will push the category filters to show on UI
                if (this._selectedFiltersMap.has(evt.detail.categoryName) == false) {
                    let previousId = this.recordId;
                    //BS-1595: Added this to send the Translated data for Category
                    let parentCategoryName;
                    const currentLanguage = LANG.includes('-') ? LANG.replace('-', '_') : LANG;

                    if (
                        previousId != undefined &&
                        previousId != null &&
                        this.productCategoryVsParentCategoryIdMap[previousId].categoryLabel &&
                        currentLanguage !== ENGLISH_LANGUAGE
                    ) {
                        parentCategoryName = this.productCategoryVsParentCategoryIdMap[previousId].categoryLabel;
                    } else {
                        parentCategoryName = evt.detail.parentCategoryName;
                    }
                    //BS-1595: End
                    this.recordId = evt.detail.categoryId;
                    data = {
                        fieldName: evt.detail.categoryName,
                        displayFilter: evt.detail.categoryName,
                        fieldValue: evt.detail.categoryId,
                        filterType: CATEGORY,
                        isColor: false,
                        previousCategoryId: previousId,
                        previousCategoryName: parentCategoryName // Added as a part of BS-1595
                    };
                    this._selectedFiltersMap.set(evt.detail.categoryName, data);
                    this._selectedFilters = [];
                    /**
                     * BS-930
                     * Added additional iterations to identify and fill the _selectedFilters list for radio button and color filters
                     */
                    for (let filter of this._selectedFiltersMap.values()) {
                        if (filter.filterType !== undefined && filter.filterType === CATEGORY) {
                            this._selectedFilters.push(filter);
                        } else if (
                            filter[0].fieldName !== undefined &&
                            this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                            this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType !== SLIDER
                        ) {
                            for (let selectedValue of filter) {
                                this._selectedFilters.push(selectedValue);
                            }
                        } else if (
                            filter[0].fieldName !== undefined &&
                            this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                            this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType === SLIDER
                        ) {
                            this._selectedFilters.push(filter[0]);
                        }
                    }
                }
            } else {
                //logic to remove category filters based a category clicked on breadcrumb or On selected filters section
                if (this._selectedFiltersMap.has(evt.detail.categoryName) == false) {
                    this.recordId = evt.detail.categoryId;
                    this._selectedFilters.forEach((filter) => {
                        if (filter.filterType == CATEGORY) {
                            this._selectedFiltersMap.delete(filter.fieldName);
                        }
                    });
                    this._selectedFilters = [];
                    /**
                     * BS-930
                     * Added additional iterations to identify and fill the _selectedFilters list for radio button and color filters
                     */
                    for (let filter of this._selectedFiltersMap.values()) {
                        if (filter.filterType !== undefined && filter.filterType === CATEGORY) {
                            this._selectedFilters.push(filter);
                        } else if (
                            filter[0].fieldName !== undefined &&
                            this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                            this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType !== SLIDER
                        ) {
                            for (let selectedValue of filter) {
                                this._selectedFilters.push(selectedValue);
                            }
                        } else if (
                            filter[0].fieldName !== undefined &&
                            this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                            this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType === SLIDER
                        ) {
                            this._selectedFilters.push(filter[0]);
                        }
                    }
                } else {
                    this.recordId = evt.detail.categoryId;
                    let categoriesToRemove = [];
                    categoriesToRemove.push(evt.detail.categoryId);
                    this._selectedFilters.forEach((filter) => {
                        if (filter.filterType == CATEGORY) {
                            if (categoriesToRemove.includes(filter.previousCategoryId)) {
                                this._selectedFiltersMap.delete(filter.fieldName);
                                categoriesToRemove.push(filter.fieldValue);
                            }
                        }
                    });
                    this._selectedFilters = [];
                    /**
                     * BS-930
                     * Added additional iterations to identify and fill the _selectedFilters list for radio button and color filters
                     */
                    for (let filter of this._selectedFiltersMap.values()) {
                        if (filter.filterType !== undefined && filter.filterType === CATEGORY) {
                            this._selectedFilters.push(filter);
                        } else if (
                            filter[0].fieldName !== undefined &&
                            this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                            this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType !== SLIDER
                        ) {
                            for (let selectedValue of filter) {
                                this._selectedFilters.push(selectedValue);
                            }
                        } else if (
                            filter[0].fieldName !== undefined &&
                            this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                            this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType === SLIDER
                        ) {
                            this._selectedFilters.push(filter[0]);
                        }
                    }
                }
            } //BS-730 End
            this._productPageNumber = 1;
            this._globalProductData = null;
            this.fetchAllProducts();
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
                //Updated as part of BS-900
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
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
            .then((result) => {
                this._cartSummary = result;
            })
            .catch((e) => {
                // Handle cart summary error properly
                // For this sample, we can just log the error
                console.log(e);
            });
    }

    /**
     * Handles a user request to select a specific sorting option.
     *
     * @private
     */
    handleSortingUpdate(event) {
        this._isLoading = true;
        this._pageNumber = 1;
        if (this.sortingValue == SKU_SEQUENCE) {
            this.sortingOptions = [this._sortingOptions.slice(1), ASSIGN];
        }
        this.sortingValue = event.detail.value;
        this.sortingOptions.forEach((sort) => {
            if (sort.value == this.sortingValue) {
                this._sortName = sort.name;
                this._sortDerection = sort.direction;
            }
        });
        this.handleSort(false);
    }

    /**
     * BS-1253
     *
     * this method will fetch the category information and product count for the category
     */
    //BS-2320: Added async await
    async fetchCategoryData() {
        let categoryList = [];

        let categoryObj = {};
        const currentLanguage = LANG.includes('-') ? LANG.replace('-', '_') : LANG; //BS-1595
        let pageLanguage = currentLanguage;
        if (currentLanguage == CHINESE_LANG_BY_DEFAULT) {
            pageLanguage = CHINESE_ORIGINAL_LANG;
        }
        await getCategoryData({
            productIdList: this._filteredProductIds,
            categoryId: this.recordId,
            //BS-2314
            language: pageLanguage, //Added as part of BS-1595
            storeName: this._storeBrand //Added as part of BS-1544
        }).then((result) => {
            if (result != null && result != undefined) {
                let categoryProductCountList = result.categoryProductCountList;
                this.productCategoryVsParentCategoryIdMap = result.productCategoryVsParentCategoryIdMap;
                //BS-2320: New Label issue : Added method call
                this.handleSort(true);
                if (this.recordId != null && this.recordId != undefined) {
                    let tempCategoryProductCountList = JSON.parse(JSON.stringify(categoryProductCountList));
                    let currentCategory;
                    let tempCategoryObj = {};
                    categoryProductCountList.forEach((item) => {
                        currentCategory = item.categoryId;
                        while (currentCategory != null && currentCategory != undefined) {
                            if (this.productCategoryVsParentCategoryIdMap[currentCategory].parentCategoryId == this.recordId) {
                                categoryObj = categoryList.find((itr) => itr.categoryId === currentCategory);
                                if (categoryObj == null || categoryObj == undefined) {
                                    tempCategoryObj.categoryId = currentCategory;
                                    //Start: BS-1595
                                    this._categoryLabelAvailable = this.productCategoryVsParentCategoryIdMap[currentCategory].categoryLabel ? true : false;
                                    if (this._categoryLabelAvailable == true && currentLanguage != ENGLISH_LANGUAGE) {
                                        tempCategoryObj.categoryName = this.productCategoryVsParentCategoryIdMap[currentCategory].categoryLabel;
                                    } else {
                                        tempCategoryObj.categoryName = this.productCategoryVsParentCategoryIdMap[currentCategory].categoryName;
                                    }
                                    //End: BS-1595
                                    //Start: BS-1596
                                    if (currentLanguage != ENGLISH_LANGUAGE && this.productCategoryVsParentCategoryIdMap[this.recordId].categoryLabel) {
                                        tempCategoryObj.parentCategory = this.productCategoryVsParentCategoryIdMap[this.recordId].categoryLabel;
                                    } else {
                                        tempCategoryObj.parentCategory = this.productCategoryVsParentCategoryIdMap[this.recordId].categoryName;
                                    }
                                    //End: BS-1596
                                    categoryObj = tempCategoryProductCountList.find((itr) => itr.categoryId === currentCategory);
                                    if (categoryObj != null && categoryObj != undefined) {
                                        tempCategoryObj.productCount = categoryObj.productCount;
                                    }
                                    categoryList.push(tempCategoryObj);
                                }
                                tempCategoryObj = {};
                            }
                            currentCategory = this.productCategoryVsParentCategoryIdMap[currentCategory].parentCategoryId;
                        }
                    });
                } else {
                    let globalParentCategoryList = [];
                    let currentCategory;
                    let tempCategoryProductCountList = JSON.parse(JSON.stringify(categoryProductCountList));
                    let tempCategoryObj = {};
                    categoryProductCountList.forEach((item) => {
                        currentCategory = item.categoryId;
                        while (currentCategory != null && currentCategory != undefined) {
                            if (
                                this.productCategoryVsParentCategoryIdMap[currentCategory].parentCategoryId == null ||
                                this.productCategoryVsParentCategoryIdMap[currentCategory].parentCategoryId == undefined
                            ) {
                                if (!globalParentCategoryList.includes(currentCategory)) {
                                    globalParentCategoryList.push(currentCategory);

                                    categoryObj = tempCategoryProductCountList.find((itr) => itr.categoryId === currentCategory);
                                    if (categoryObj != null && categoryObj != undefined) {
                                        tempCategoryObj.productCount = categoryObj.productCount;
                                    }
                                    tempCategoryObj.categoryId = currentCategory;
                                    //Start: BS-1595 - Add translated data in Category filters of Global Search
                                    if (this.productCategoryVsParentCategoryIdMap[currentCategory].categoryLabel && LANG != 'en-US') {
                                        tempCategoryObj.categoryName = this.productCategoryVsParentCategoryIdMap[currentCategory].categoryLabel;
                                    } else {
                                        tempCategoryObj.categoryName = this.productCategoryVsParentCategoryIdMap[currentCategory].categoryName;
                                    }
                                    //End: BS-1595
                                    tempCategoryObj.parentCategory = ALL_CATEGORY;
                                    //BS-1676 - Start
                                    let categoryToBeExcluded = false;
                                    if (this.categoriesToExcludeFromGlobalSearchCollection && tempCategoryObj && tempCategoryObj.categoryName) {
                                        for (let i = 0; i < this.categoriesToExcludeFromGlobalSearchCollection.length; i++) {
                                            if (this.categoriesToExcludeFromGlobalSearchCollection[i] == tempCategoryObj.categoryName) {
                                                categoryToBeExcluded = true;
                                                break;
                                            }
                                        }
                                    }
                                    if (categoryToBeExcluded == false) {
                                        categoryList.push(tempCategoryObj);
                                    }
                                    //BS-1676 - End
                                    tempCategoryObj = {};
                                }
                            }
                            currentCategory = this.productCategoryVsParentCategoryIdMap[currentCategory].parentCategoryId;
                        }
                    });
                }
                let categoryChildList;
                let categoryProductCountObj;
                categoryList.forEach((item) => {
                    categoryChildList = this.updateCategoryCount(item.categoryId, this.productCategoryVsParentCategoryIdMap);

                    if (categoryChildList.length > 0) {
                        item.productCount = 0;
                    }
                    categoryChildList.forEach((categoryId) => {
                        categoryProductCountObj = categoryProductCountList.find((itr) => itr.categoryId === categoryId);
                        if (categoryProductCountObj != null && categoryProductCountObj != undefined) {
                            item.productCount += categoryProductCountObj.productCount;
                        }
                    });
                });
            }

            this._filteredProductIds = [];
            this._categoryData = categoryList;
            this.showProducts();
        });
    }

    updateCategoryCount(categoryIdMain, productCategoryVsParentCategoryIdMap) {
        let tempList = [];
        let currentCategory;
        let keySet = Object.keys(productCategoryVsParentCategoryIdMap);
        keySet.forEach((key) => {
            currentCategory = key;
            while (
                productCategoryVsParentCategoryIdMap[currentCategory].parentCategoryId != null &&
                productCategoryVsParentCategoryIdMap[currentCategory].parentCategoryId != undefined
            ) {
                if (productCategoryVsParentCategoryIdMap[currentCategory].parentCategoryId == categoryIdMain) {
                    tempList.push(key);
                }
                currentCategory = productCategoryVsParentCategoryIdMap[currentCategory].parentCategoryId;
            }
        });
        return tempList;
    }

    /**
     * BS-444
     *
     * this method will get the chunk of products to pass the the connect api method
     */
    getChunk() {
        let products = [];

        let start = this._pageSizeForPopUp * (this._pageNumber - 1);
        let end = this._pageSizeForPopUp * this._pageNumber;

        products = this._productsToShow.slice(start, end).map((item) => {
            return item.Id;
        });

        if (products.length > 0) {
            if (this._isCompact && this._isCompact == true) {
                this.getColourCountAndSize(products);
                this.getBridgeTempleCount(products);
            }
            this.getDisplayProducts(products);
        }
    }

    /**
     * BS-444
     *
     * this method will sort all the products from the response
     */
    handleSort(isNewFilter) {
        this.categoryVsProductListMap.clear();
        if (this._productsToShow.length > 0) {
            this._productsToShow.forEach((product) => {
                // Get the category name
                let categoryId = product.productCategoryId;
                // Check if the category name already exists in the map
                if (categoryId != null && categoryId != undefined) {
                    if (this.categoryVsProductListMap.has(categoryId)) {
                        // Category exists, add the product to the existing list
                        let productList = this.categoryVsProductListMap.get(categoryId);
                        productList.push(product);
                    } else {
                        // Category doesn't exist, create a new list with the product
                        this.categoryVsProductListMap.set(categoryId, [product]);
                    }
                }
            });
        }
        // BS-951
        if (this._isGlobalSearch && this._isGlobalSearchPLP === true && isNewFilter) {
            this.sortingOptions = [[{ value: SKU_SEQUENCE, label: SKU_SEQUENCE, name: SKU_SEQUENCE, direction: '' }].concat(this.sortingOptions), ASSIGN];
            this.sortingValue = SKU_SEQUENCE;
            this._sortName = this.sortingOptions[0].name;
            this._sortDerection = this.sortingOptions[0].direction;

            let sortedPorductsList = [];
            //searchTermIndexVsProductMap: will store the occurrence of the searchTerm in the SKU of a product vs a List of products where the searchTerm occurs on the same index
            let searchTermIndexVsProductMap = new Map();
            this._productsToShow.forEach((product) => {
                let searchTermIndex = String(product.StockKeepingUnit).indexOf(this.term);
                searchTermIndex = searchTermIndex != -1 ? searchTermIndex : 9999;
                if (searchTermIndexVsProductMap.has(searchTermIndex)) {
                    searchTermIndexVsProductMap.get(searchTermIndex).push(product);
                } else {
                    searchTermIndexVsProductMap.set(searchTermIndex, [product]);
                }
            });
            this._productsToShow = [];
            //searchTermIndexSet: will store all the indexes at which the searchterm in the SKU for all the products
            let searchTermIndexSet = searchTermIndexVsProductMap.keys();
            //searchTermIndexSortedList: to store all the indexes from searchTermIndexSet sorted in ascending order
            let searchTermIndexSortedList = Array.from(searchTermIndexSet);
            searchTermIndexSortedList.sort(function (index1, index2) {
                return index1 - index2;
            });
            let categoryIdVsProductIdsMap = new Map();
            this.orderedCategoryList.forEach((category) => {
                let cloneData = [];
                cloneData = this.categoryVsProductListMap.get(category);
                let disContinuedProductsIds = [];
                let currentCategoryProductIds = [];
                if (cloneData != undefined && cloneData.length > 0) {
                    cloneData.sort(sortBy(this._sortName, this._sortDerection === ASCENDING_ORDER ? 1 : -1));
                    for (let index = 0; index < cloneData.length; index++) {
                        if (cloneData[index].B2B_Collection_Flag__c == 2) {
                            disContinuedProductsIds.push(cloneData[index].Id);
                        } else {
                            currentCategoryProductIds.push(cloneData[index].Id);
                        }
                    }
                }
                categoryIdVsProductIdsMap.set(category, {
                    DISCONTINUED_PRODUCT_IDS: disContinuedProductsIds,
                    CATEGORY_PRODUCT_IDS: currentCategoryProductIds
                });
            });

            //will append the product list in the order of occurrence of searchTerm in the product SKU
            for (let index = 0; index < searchTermIndexSortedList.length; index++) {
                sortedPorductsList = searchTermIndexVsProductMap.get(searchTermIndexSortedList[index]);
                this.orderedCategoryList.forEach((category) => {
                    if (categoryIdVsProductIdsMap.has(category)) {
                        let categoryProducts = [];
                        let discontinuedProducts = [];
                        for (let index = 0; index < sortedPorductsList.length; index++) {
                            if (categoryIdVsProductIdsMap.get(category)[CATEGORY_PRODUCT_IDS].includes(sortedPorductsList[index].Id)) {
                                categoryProducts.push(sortedPorductsList[index]);
                            } else if (categoryIdVsProductIdsMap.get(category)[DISCONTINUED_PRODUCT_IDS].includes(sortedPorductsList[index].Id)) {
                                discontinuedProducts.push(sortedPorductsList[index]);
                            }
                        }
                        categoryProducts.sort(sortBy(this._sortName, this._sortDerection === ASCENDING_ORDER ? 1 : -1));
                        discontinuedProducts.sort(sortBy(this._sortName, this._sortDerection === ASCENDING_ORDER ? 1 : -1));
                        this._productsToShow = this._productsToShow.concat(categoryProducts);
                        this._productsToShow = this._productsToShow.concat(discontinuedProducts);
                    }
                });
            }
        } else if (this.categoryVsProductListMap.size > 0 && this._isGlobalSearchPLP === true) {
            this._productsToShow = [];
            this.orderedCategoryList.forEach((category) => {
                /** Start : BS-1179 */
                let cloneData = [];
                cloneData = this.categoryVsProductListMap.get(category);
                const disContinuedProducts = [];
                if (cloneData != undefined && cloneData.length > 0) {
                    cloneData.sort(sortBy(this._sortName, this._sortDerection === ASCENDING_ORDER ? 1 : -1));
                    for (let index = 0; index < cloneData.length; index++) {
                        if (cloneData[index].B2B_Collection_Flag__c == 2) {
                            disContinuedProducts.push(cloneData[index]);
                        } else {
                            this._productsToShow.push(cloneData[index]);
                        }
                    }
                }
                /** End : BS-1179 */
                cloneData = [];
                if (disContinuedProducts.length !== 0) {
                    this._productsToShow = this._productsToShow.concat(disContinuedProducts);
                }
            });
        } else {
            this._productsToShow = [];
            //BS-676 Updated Logic.
            this.orderedCategoryList.forEach((category) => {
                let productsInOrderList = [];
                let disContinuedProducts = [];
                /** Start : BS-1179 */
                let cloneData = [];
                cloneData = this.categoryVsProductListMap.get(category);
                if (this._sortName == SORT_BY_OPTION_READY_TO_SHIP) {
                    // Sorting based on the value of country code key in the JSON code
                    cloneData.sort((firstProductToSort, secondProductToSort) => {
                        let firstProductResult = this.getCountrySpecificDeliveryCode(this.countryCode, firstProductToSort.B2B_Shipping_Status_JSON__c); //BS-848
                        let secondProductResult = this.getCountrySpecificDeliveryCode(this.countryCode, secondProductToSort.B2B_Shipping_Status_JSON__c); //BS-848
                        return firstProductResult - secondProductResult;
                    });
                } else {
                    cloneData.sort(sortBy(this._sortName, this._sortDerection === ASCENDING_ORDER ? 1 : -1));
                }
                for (let index = 0; index < cloneData.length; index++) {
                    if (cloneData[index].B2B_Collection_Flag__c == 2) {
                        disContinuedProducts.push(cloneData[index]);
                    } else {
                        productsInOrderList.push(cloneData[index]);
                    }
                    this._productsToShow = this._productsToShow.concat(productsInOrderList);
                    this._productsToShow = this._productsToShow.concat(disContinuedProducts);
                }
            });
        }
        this.getChunk();
    }

    /**
     * BS-444
     *
     * this method will sort the products from connect API response
     */
    handleDisplaySort(products) {
        let sortedData = [];
        products.forEach((id) => {
            this.displayData.layoutData.forEach((data) => {
                if (id == data.id) {
                    sortedData.push(data);
                }
            });
        });
        this.displayData.layoutData = sortedData;
        this.isDisplaydata = this.displayData.layoutData.length;
    }

    /**
     * BS-571
     *
     * this method will used to update the search term based
     */
    updateSearchTerm() {
        const searchQuery = JSON.stringify({
            searchTerm: this.term,
            categoryId: null,
            refinements: null,
            page: this._pageNumber - 1,
            includePrices: false,
            sortRuleId: this.sortingValue
        });
        productSearch({
            communityId: communityId,
            searchQuery: searchQuery,
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
            .then((result) => {})
            .catch((error) => {
                this.error = error;
                this._isLoading = false;
                console.error('Error: ' + JSON.stringify(error));
            });
    }

    /**
     * BS-730
     *
     * This method handles the filters when users remove it from selected filters
     */
    handleRemoveFilter(event) {
        let filterData; //BS-930
        let field = event.target.dataset.fieldName;
        let selectedValue = event.target.dataset.fieldValue;
        let filterType = event.target.dataset.fieldType;
        let multiselectEnabled = event.target.dataset.isMultiselect; //Added as part of BS-930
        let preCategoryId;
        let preCategoryName;
        /**
         * Start BS-930
         */
        let previousFilterSelection;
        let updatedFiltersString = '';
        let updatedFilters;

        if (filterType !== CATEGORY) {
            filterData = Array.from(this._recievedFilters, ([key, value]) => {
                return { key: key, value: value };
            });
        }
        if ((filterType == RADIO_BUTTON || filterType == COLOR_RADIO_BUTTON) && multiselectEnabled == 'true') {
            for (let index = 0; index < filterData.length; index++) {
                if (filterData[index].key === field) {
                    previousFilterSelection = filterData[index].value;
                }
            }
            updatedFilters = previousFilterSelection.replace(selectedValue, '');
            let updatedFilterList = updatedFilters.split(';');
            if (updatedFilterList.length === 1) {
                updatedFiltersString = updatedFilterList[0];
            } else {
                for (let index = 0; index < updatedFilterList.length; index += 2) {
                    if (
                        index <= updatedFilterList.length - 2 ||
                        (updatedFilterList.length === 2 &&
                            updatedFilterList[index] !== undefined &&
                            updatedFilterList[index] !== null &&
                            updatedFilterList[index] !== '')
                    ) {
                        if (updatedFiltersString !== '') {
                            updatedFiltersString += ';';
                        }
                        updatedFiltersString += updatedFilterList[index];

                        if (updatedFilterList[index + 1] !== undefined && updatedFilterList[index + 1] !== null && updatedFilterList[index + 1] !== '') {
                            if (updatedFilterList[index] !== '') {
                                updatedFiltersString += ';';
                            }
                            updatedFiltersString += updatedFilterList[index + 1];
                        }
                    } else if (index === updatedFilterList.length - 1 && updatedFilterList[index] !== '') {
                        updatedFiltersString += ';' + updatedFilterList[index];
                    }
                }
            }
        }
        if (event.target.dataset.preCategoryId != null) {
            //to set the variables when user removes the category from selected filter
            preCategoryId = event.target.dataset.preCategoryId;
            preCategoryName = event.target.dataset.preCategoryName;
        }
        let filterEvent;
        if (filterType == SLIDER) {
            filterEvent = {
                detail: {
                    field: field,
                    value: selectedValue,
                    filterType: filterType,
                    doProductSearch: false,
                    removeFilter: true
                }
            };
        } else if ((filterType == RADIO_BUTTON || filterType == COLOR_RADIO_BUTTON) && multiselectEnabled == 'false') {
            filterEvent = {
                detail: {
                    field: field,
                    value: selectedValue,
                    filterType: filterType,
                    checked: true
                }
            };
        } else if ((filterType == RADIO_BUTTON || filterType == COLOR_RADIO_BUTTON) && multiselectEnabled == 'true') {
            filterEvent = {
                detail: {
                    field: field,
                    value: updatedFiltersString,
                    filterType: filterType,
                    checked: true
                }
            };
        } else {
            filterEvent = {
                detail: {
                    field: field,
                    value: selectedValue,
                    filterType: filterType,
                    checked: true
                }
            };
        }
        //to remove the filter when its not a category filter
        if (this._selectedFiltersMap.has(field) == true && filterType != CATEGORY) {
            this._selectedFiltersMap.delete(field);
            this._selectedFilters = [];
            /**
             * BS-930
             * Added additional iterations to identify and fill the _selectedFilters list for radio button and color filters
             */
            for (let filter of this._selectedFiltersMap.values()) {
                if (filter.filterType !== undefined && filter.filterType === CATEGORY) {
                    this._selectedFilters.push(filter);
                } else if (
                    filter[0].fieldName !== undefined &&
                    this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                    this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType !== SLIDER
                ) {
                    for (let selectedValue of filter) {
                        this._selectedFilters.push(selectedValue);
                    }
                } else if (
                    filter[0].fieldName !== undefined &&
                    this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                    this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType === SLIDER
                ) {
                    this._selectedFilters.push(filter[0]);
                }
            }
        }
        if (filterType != CATEGORY) {
            //to fire a event to uncheck the filter from filter container
            const filterContainer = this.template.querySelector('c-b2b_filter-container');
            filterContainer.handleSelection(filterEvent);
        } else {
            //to fire a event to sync the category on breadcrumb and to fetch the products based on previous category
            let breadcrumbEvent;
            if (preCategoryName == undefined && preCategoryId == undefined) {
                breadcrumbEvent = {
                    target: { name: SEARCH_KEYWORD, dataset: { label: ALL_CATEGORY } }
                };
            } else {
                breadcrumbEvent = {
                    target: { name: preCategoryId, dataset: { label: preCategoryName } }
                };
            }
            const breadcrumbComponent = this.template.querySelector('c-b2b_category-breadcrumb');
            breadcrumbComponent.handleBreadcrumbCategorySelection(breadcrumbEvent);
        }
    }

    /**
     * Gets the colors used into the color filter from the custom metadata records.
     * BS-730
     * @private
     */
    async triggerMetadataRetrieve() {
        await getColorsMetadata({})
            .then((result) => {
                this._transparentUri = URI1 + URI2;
                this._customMetadataColors = new Map();
                let customMetadataMap = new Map(Object.entries(JSON.parse(result)));
                for (let [key, value] of customMetadataMap.entries()) {
                    this._customMetadataColors.set(value.Label, value);
                }
            })
            .catch((error) => {
                this.error = error;
                console.error('Error:' + JSON.stringify(error));
            });
    }

    /**
     * to get the information about the fields and other details of the Product object
     * BS-730
     * @private
     */
    @wire(getObjectInfo, { objectApiName: PRODUCT_OBJECT })
    productInfo({ data, error }) {
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
    handleClearAll(event) {
        this._isLoading = true;
        localStorage.removeItem(FILTER_KEY); //BS-227 removes the filter data from local storage
        localStorage.removeItem(FILTER_GLOBAL_KEY); //BS-1084 removes the gloabl filter data from local storage
        this.doRender = true;
        this._isLoading = false;
    }

    connectedCallback() {
        this._pageNumber = pageManager.getPreviouslyVisitedPageIfFromPDPOrFirst(this._currentCategoryId);
        this.categoriesToExcludeFromGlobalSearchCollection = B2B_CATEGORIES_TO_EXCLUDE_FROM_GLOBAL_SEARCH.split(','); //BS-1676
        /*
         *Start BS-930
         * Block to fill the map which identifies filter type based on field
         */
        if (localStorage.getItem(TYPE_KEY)) {
            let decodedFormattedFilterData = decodeURIComponent(escape(atob(localStorage.getItem(TYPE_KEY))));
            let filterTypeList = JSON.parse(decodedFormattedFilterData);

            for (let filterIndex = 0; filterIndex < filterTypeList.length; filterIndex++) {
                this._filterSourceFieldVsFilterType.set(filterTypeList[filterIndex].key, {
                    filterType: filterTypeList[filterIndex].filterType,
                    isMultiselect: filterTypeList[filterIndex].isMultiselect
                });
            }
        }
        /* End BS-930 */
        /* Start BS-1544 */
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');
        currentStore.includes(SH_STORE) == true ? (this._storeBrand = SH_BRAND) : (this._storeBrand = NB_BRAND);
        /* Start BS-1544 */
        this._isLoading = true; //BS-821
        let pageUrl = window.location.href;
        if (pageUrl.includes('evil-eye')) {
            this.isEEBrand = true;
            this.template.host.style.setProperty('--ee-sh-card-flex', '1 0 21%');
            this.template.host.style.setProperty('--ee-sh-card-box-shadow', '12px 0px 10px -4px rgb(30 30 30 / 5%)');
            this.template.host.style.setProperty('--ee-sh-card-padding-right', '1%');
            this.template.host.style.setProperty('--ee-sh-card--webkit-box-shadow', '12px 0px 10px -4px rgb(30 30 30 / 5%)');
            this.template.host.style.setProperty('--ee-sh-card--margin-left', '4%');
        } else {
            this.isEEBrand = false;
            this.template.host.style.setProperty('--ee-sh-card-flex', '1 0 20%');
            this.template.host.style.setProperty('--ee-sh-card-box-shadow', 'none');
            this.template.host.style.setProperty('--ee-sh-card-padding-right', '0%');
        }
        /* Start BS-1084 */
        if (localStorage.getItem(FILTER_GLOBAL_KEY) && localStorage.getItem(FILTER_GLOBAL_SEARCH_TERM)) {
            if (this.term !== undefined && this.term != null && this._term && this.term != localStorage.getItem(FILTER_GLOBAL_SEARCH_TERM)) {
                localStorage.removeItem(FILTER_GLOBAL_KEY);
            }
            localStorage.setItem(FILTER_GLOBAL_SEARCH_TERM, this.term);
        } else {
            localStorage.setItem(FILTER_GLOBAL_SEARCH_TERM, this.term);
        }

        if (pageUrl.includes(GLOBAL_SEARCH_URL)) {
            this._isGlobalSearchPLP = true;
        } else {
            this._isGlobalSearchPLP = false;
            localStorage.removeItem(FILTER_GLOBAL_KEY);
        }
        /* End BS-1084 */

        this.getAllPicklistValues(); //BS-821
    }

    /**
     * Gets the picklist values and Prepare a Map of picklist API name vs Label
     * BS-821
     * @private
     */
    getAllPicklistValues() {
        getPicklistValues({})
            .then((result) => {
                let key; //BS-1022
                result.forEach((value) => {
                    key = value.fieldApiName + '_' + value.picklistApiName;
                    this._picklistApiNameVsLabelMap.set(key, value.picklistValue);
                });
            })
            .catch((error) => {
                this._isLoading = false;
                this.error = error;
                console.error('Error:' + JSON.stringify(error));
            });
    }

    /*
     * Start BS-930
     * Method which  fill the map which identifies filter type based on field.
     * Event handler for filterContainer's event which send data once it is fetched from server.
     */
    populateFiltersMetadata(event) {
        for (let index = 0; index < event.detail.resultArray.length; index++) {
            let filterTypeValue = event.detail.resultArray[index].availableFilters.filterType;
            let isMultiselectValue = event.detail.resultArray[index].availableFilters.isMultiselect;
            this._filterSourceFieldVsFilterType.set(event.detail.resultArray[index].availableFilters.sourceProductField, {
                filterType: filterTypeValue,
                isMultiselect: isMultiselectValue
            });
        }
    }

    async getAttributeFieldData() {
        await getAttributeFieldData()
            .then((result) => {
                this._fieldWrapper = result;
            })
            .catch((errorInstance) => {
                console.error(errorInstance);
            });
    }

    //BS-848
    getCountrySpecificDeliveryCode(countryCode, deliveryTime) {
        let applicableDeliveryStatusCode;
        let isAvailableAsOf;
        let applicableCountryCode;

        if (countryCode && deliveryTime) {
            let formattedDeliveryTimeJSON = deliveryTime.replace(/&quot;/g, '"');
            if (formattedDeliveryTimeJSON != null && formattedDeliveryTimeJSON != undefined && formattedDeliveryTimeJSON.includes('/')) {
                isAvailableAsOf = true;
            } else {
                isAvailableAsOf = false;
            }
            let parsedDeliveryTimeJSON;
            if (isAvailableAsOf != null && isAvailableAsOf != undefined && isAvailableAsOf == true) {
                formattedDeliveryTimeJSON = formattedDeliveryTimeJSON.replace(/{/g, '');
                formattedDeliveryTimeJSON = formattedDeliveryTimeJSON.replace(/}/g, '');
                formattedDeliveryTimeJSON = '{' + formattedDeliveryTimeJSON + '}';
                parsedDeliveryTimeJSON = formattedDeliveryTimeJSON;
            } else {
                parsedDeliveryTimeJSON = formattedDeliveryTimeJSON;
            }
            const deliveryTimeJSONCollection = parsedDeliveryTimeJSON.split(',');
            let countryWiseDeliveryTimeMap = new Map();
            deliveryTimeJSONCollection.forEach((deliveryItem) => {
                let formattedDeliveryItem = deliveryItem.replace(/{/g, '');
                formattedDeliveryItem = formattedDeliveryItem.replace(/['"]+/g, '');
                formattedDeliveryItem = formattedDeliveryItem.replace(/}/g, '');
                formattedDeliveryItem = formattedDeliveryItem.replace(/\s/g, '');
                const parsedDeliveryTimeCollection = formattedDeliveryItem.split(':');
                countryWiseDeliveryTimeMap.set(parsedDeliveryTimeCollection[0], parsedDeliveryTimeCollection[1]);
            });

            if (countryCode != null && countryCode != undefined) {
                applicableCountryCode = countryCode.substring(0, 4);
            }
            if (countryWiseDeliveryTimeMap != null && countryWiseDeliveryTimeMap != undefined && countryWiseDeliveryTimeMap.has(applicableCountryCode)) {
                applicableDeliveryStatusCode = countryWiseDeliveryTimeMap.get(applicableCountryCode);
                if (applicableDeliveryStatusCode.includes('/')) {
                    applicableDeliveryStatusCode = AVAILABLE_AS_OF_CODE;
                }
            }
        }

        return applicableDeliveryStatusCode;
    } //End getCountrySpecificDeliveryCode

    // Added as a part of BS-2226
    async getColourCountAndSize(products) {
        await getColorCountAndSizeforProduct({
            productIdList: products
        })
            .then((result) => {
                if (result != null && result != undefined) {
                    this._productIdVsColourCountAndSize = result;
                }
            })
            .catch((errorInstance) => {
                console.error(errorInstance);
            });
    }

    async getBridgeTempleCount(products) {
        await getBridgeTempleCountforProduct({
            productIdList: products
        })
            .then((result) => {
                if (result != null && result != undefined) {
                    this._productIdVsBridgeTempleCount = result;
                }
            })
            .catch((errorInstance) => {
                console.error(errorInstance);
            });
    }
}
