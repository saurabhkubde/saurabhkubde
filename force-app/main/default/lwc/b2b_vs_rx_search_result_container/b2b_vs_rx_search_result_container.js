import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { sortBy, pageManager } from 'c/b2b_utils';
import { transformData } from './dataNormalizer';
import communityId from '@salesforce/community/Id';
import LANG from '@salesforce/i18n/lang';
import HIDE_PRICES_FIELD from '@salesforce/schema/Account.B2B_Hide_Prices__c';
import COUNTRY_FIELD from '@salesforce/schema/Account.Store_Country__c';
import COUNTRY_CODE_FIELD from '@salesforce/schema/Account.Country_Code__c';
import CODE_FIELD from '@salesforce/schema/Account.k_ARIS_Account_ID__c';
import HIDE_PURCHASE_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Purchase_Price__c'; //BS-2273

//APEX METHODS
import getEntitlementProducts from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getEntitlementProducts';
import getCategoriesDataForVSRX from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getCategoriesDataForVSRX';
import productsSearch from '@salesforce/apex/B2B_VisionSensation_RX_Controller.productsSearch';
import getSortRules from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getSortRules';
import getCategoryData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getCategoryData';
import getCategoryTranslations from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getCategoryTranslations'; // BS-762
import performInitialSetupOfSearchResultContainer from '@salesforce/apex/B2B_VisionSensation_RX_Controller.performInitialSetupOfSearchResultContainer'; //BS-1525

import getCurrencyCode from '@salesforce/apex/B2B_CartController.getCurrencyCode'; //BS-1245

import PRODUCT_OBJECT from '@salesforce/schema/Product2'; //BS-762
import { getObjectInfo } from 'lightning/uiObjectInfoApi'; //BS-762

//LABELS
import FILTER_LABELS from '@salesforce/label/c.B2B_VS_RX_PLP_Filters';
import ALL_CATEGORY from '@salesforce/label/c.B2B_All_Category'; //BS-762
import APPLICABLE_CATEGORIES_FOR_VS from '@salesforce/label/c.B2B_VS_applicable_categories';
import APPLICABLE_CATEGORIES_FOR_RX from '@salesforce/label/c.B2B_RX_applicable_categories';
import HEADLINE_LABELS from '@salesforce/label/c.B2B_PLP_Headline';
import B2B_VS_RX_ORDER_REFERENCE_LABELS from '@salesforce/label/c.B2B_VS_RX_Order_Reference_Labels'; //BS-762
import BICOLOR_COLOR from '@salesforce/label/c.B2B_Color_Bicolor'; //BS-1529

// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-762

import { fireEvent } from 'c/b2b_pubsub'; //BS-762
import { CurrentPageReference } from 'lightning/navigation'; //BS-762
import { checkProductAvailability } from 'c/b2b_utils';

//CONSTANTS
const fields = [HIDE_PRICES_FIELD, COUNTRY_FIELD, COUNTRY_CODE_FIELD, CODE_FIELD, HIDE_PURCHASE_PRICE_FIELD];

const ASCENDING_ORDER = 'Ascending';
const VS_PAGE_SOURCE = 'VS';
const RX_PAGE_SOURCE = 'RX';
const SH_STORE = 'SH';
const EE_STORE = 'EE';
const CATEGORY_OPTICAL_EYEWEAR = 'Optical Eyewear';
const CATEGORY_SUNGLASSES = 'Sunglasses';
const CATEGORY_FRAMES = 'Frames';
const ORDER_TYPE_COMPLETE_EYEWEAR = 'Complete Eyewear';
const FRAME_SEARCH_DONE = 'framesearchdone';
const SEARCH_LAYOUT_COMPONENT = 'c-b2b_vs_rx_search-layout';
const FILTER_CONTAINER_COMPONENT = 'c-b2b_vs_rx_filter_container';
const BREADCRUMB_COMPONENT = 'c-b2b_vs_rx_breadcrumb_component'; // BS-762
const OPERATE_LOADER = 'operateloader';
const FILTER_KEY = 'selectedFiltersForVS'; //BS-762
const FILTER_KEY_FOR_VS = 'selectedFiltersForVS'; // BS-762
const FILTER_KEY_FOR_RX = 'SelectedFiltersForRX'; // BS-762
const SMOOTH_SCROLLING = 'smooth';
const GRID_STYLING = 'grid';
const VISION_SENSATION = 'Vision Sensation';
const RX_GLAZING = 'RX';

const LANGUAGE_ENGLISH = 'en-US'; //BS-762

//BS-762 Start
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
const URI1 =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxwYXR0ZXJuIGlkPSJiIiBwYXR0ZXJuVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PHVzZSB4bGluazpocmVmPSIjYSIgdHJhbnNmb3JtPSJzY2FsZSguNSkiLz48L3BhdHRlcm4+PGltYWdlIGlkPSJhIiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0NBWUFBQUJYQXZtSEFBQUVHV2xEUTFCclEwZERiMnh2Y2xOd1lXTmxSMlZ1WlhKcFkxSkhRZ0FBT0kyTlZWMW9IRlVVUHJ0elp5TWt6bE5zTklWMHFEOE5KUTJUVmpTaHRMcC8zZDAyYnBaSk50b2k2R1QyN3M2WXljNDRNN3Y5b1U5RlVId3g2cHNVeEwrM2dDQW85US9iUHJRdmxRb2wydFFnS0Q2MCtJTlE2SXVtNjVrN001bHB1ckhlWmU1ODg1M3ZubnZ1dVdmdkJlaTVxbGlXa1JRQkZwcXVMUmN5NG5PSGo0ZzlLNUNFaDZBWEJxRlhVUjByWGFsTUFqWlBDM2UxVzk5RHdudGYyZFhkL3ArdHQwWWRGU0J4SDJLejVxZ0xpSThCOEtkVnkzWUJldnFSSHovcVdoNzJZdWkzTVVERUwzcTQ0V1BYdzNNK2ZvMXBadVFzNHRPSUJWVlRhb2lYRUkvTXhmaEdEUHN4c05aZm9FMXE2NnJvNWFKaW0zWGRvTEZ3NzJIK24yM0JhSVh6YmNPbno1bWZQb1R2WVZ6N0t6VWw1K0ZSeEV1cWtwOUcvQWppYTIxOXRoemcyNWFia1JFL0JwRGMzcHF2cGhIdlJGeXMyd2VxdnAra3JiV0tJWDduaERiekxPSXRpTTgzNThwVHdkaXJxcFBGbk1GMnhMYzFXdkx5T3dUQWlicGJtdkhIY3Z0dFU1N3k1K1hxTlpyTGUzbEUvUHE4ZVVqMmZYS2ZPZTNwZk9qemhKWXRCL3lsbDVTREZjU0RpSCtoUmtIMjUrTCtzZHhLRUFNWmFocmxTWDh1a3FNT1d5L2pYVzJtNk05TERCYzMxQjlMRnV2NmdWS2cvMFN6aTNLQXIxa0dxMUdNalUvYUxibnE2L2xSeGM0WGZKOThoVGFyZ1grK0RiTUpCU2lZTUllOUNrMVlBeEZrS0VBRzN4YllhS21ERGdZeUZLMFVHWXBmb1dZWEcrZkFQUEk2dEpuTndiN0NsUDdJeUYrRCtiak90Q3BraHo2Q0ZySWEvSTZzRnRObDhhdUZYR01UUDM0c053SS9KaGtnRXRtRHoxNHlTZmFSY1RJQklubUtQRTMya3h5eUUyVHYrdGhLYkVWZVBEZlcvYnlNTTFLbW0wWGRPYlM3b0dEL015cE1YRlBYckN3T3RvWWp5eW43QlYyOS9NWmZzVnpwTERkUnR1SVpuYnBYenZsZitldjhNdllyL0dxazRIL2tWL0czY3NkYXpMdXlUTVBzYkZoemQxVWFiUWJqRnZEUm1jV0p4UjN6Y2ZIa1Z3OUdmcGJKbWVldjlGMDhXVzh1RGthc2x3WDZhdmxXR1U2TlJLejBnL1NIdEN5OUozMG8vY2E5elgzS2ZjMTl6bjNCWFFLUk84dWQ0NzdoTG5BZmMxL0c5bXJ6R2xyZmV4WjVHTGRuNlpacnJFb2hJMndWSGhaeXdqYmhVV0V5OGljTUNHTkNVZGlCbHEzcit4YWZMNTQ5SFE1akgrYW4rMXkrTGxZQmlmdXhBdlJOL2xWVlZPbHdsQ2tkVm05Tk9MNUJFNHdrUTJTTWxEWlU5N2hYODZFaWxVL2xVbWtRVXp0VEU2bXgxRUVQaDdPbWRxQnRBdnY4SGRXcGJySlM2dEpqM24wQ1dkTTZidXNOelJWM1M5S1RZaHF2TmlxV211cm9pS2dZaHNoTWptaFRoOXB0V2hzRjc5NzBqL1NiTXJzUEUxc3VSNXo3RE1DK1AvSHMreTdpanJRQWxoeUFnY2NqYmhqUHlnZmVCVGp6aE5xeTI4RWRrVWg4QyteventkrejJ2L295ZUg3OTFPbmN4SE9zNXkyQXRUYzduYi9mNzNUV1BrRC9xd0Jualg4Qm9KOThWUU5jQys4QUFBQ3pTVVJCVkdnRjdaaEJDc013REFUanZzYi9mNDEvMDlM';
const URI2 =
    'akhzV1FiUU9UbThDUzRoa0xqTmZlKzMwTnZuUE9HaXkvN3E3L212ek1QNjUxQTcrMm9nRU5RQUllSVFnUXAyc0FJNFFGSG05Z2RLLzV3cnI3YmpPdC8zZ0RiZ0RPSUU3WEFFWUlDMmdBQXNUcEdzQUlZUUVOUUlBNGZVM3ZIcjRMWWVaWndCbElIdjFJQTMzbTJWRUR5YU1mYWFEUFBEdHFJSG4wSTkrRitzeXpvek9RUFBxUkJ2ck1zNk1Ha2tjLzBrQ2ZlWGJVUVBMb1J4K1lPeHRMdG4wd2lBQUFBQUJKUlU1RXJrSmdnZz09Ii8+PC9kZWZzPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9InVybCgjYikiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iLjEiLz48L3N2Zz4=';
const SELECTED_VS_CATEGORY_KEY = 'selectedVSCategory';
const SELECTED_RX_CATEGORY_KEY = 'selectedRXCategory';

const B2B_LENS_CONFIGURATOR_OBJECT_API_NAME = 'B2B_Lens_Configurator__c';
const B2B_FRAME_TYPE = 'B2B_Frame_Type__c';
const VS_RX_TYPE_KEY = 'vsrxtypekey'; //Added as part of BS-930
const REMOVE_ALL = 'Remove_All'; //BS-1442
const DEFAULT_VS_FILTER = { key: 'B2B_Rimless_Variant__c', value: 'Chassis' }; //BS-1442
const RIMLES_VARIANT = 'B2B_Rimless_Variant__c';
const RADIO_BUTTON_TYPE = 'Radio Button';
const CLEAR_ALL_FILTER = 'clearAllFilter'; //BS-2185
const CHINESE_LANG_BY_DEFAULT = 'zh-Hans-CN'; //BS-2342
const CHINESE_ORIGINAL_LANG = 'zh_CN'; //BS-2342
const PORTUGUESE_LANG_DEFAULT = 'pt-BR'; //BS-2342
const PORTUGUESE_LANG_ORIGINAL = 'pt_BR'; //BS-2342

//BS-762 End

export default class B2b_vs_rx_search_result_container extends NavigationMixin(LightningElement) {
    /**
     * Sequence of operation for fetching applicable products that needs to be shown on UI is as follows:
     * 1. connectedCallBack() : Here according to page reference, store/brand is identified Whether it is VS or RX.c/b2b_addToCartModal
     *
     * 2. setupApplicableCategories()   :   Invoked from connectedCallBack(). This method sets up the categories according to input given by user
     *                                      Following are the valid scenarios:
     *                                          A. Page Source : Vision Sensation (VS)
     *                                                  1. Frame Type : Optical Eyewear then applicable categories are --> Fullrim, Nylor, Rimless
     *                                                  2. Frame Type : Sunglasses then then applicable categories are --> Sunglasses
     *                                          B. Page Source : RX Glazing (RX)
     *                                                  1. Frame Type : In this case user has no option for selection of frame type as,
     *                                                                  frame type is Frames and applicable categories are--> Active, Performance, Goggles
     *
     * 3. getCategoryDetails()  :   Invoked from setupApplicableCategories(). Once categories has been setup then fetching the details of the applicable categories
     *                              From backend via Apex Call such as Id, child categories, parent category details (Id, Name) etc.
     *                              From this, getCategoriesDataForVSRX() method of B2B_VisionSensation_RX_Controller gets invoked that needs following parameters:
     *                                  1. CategoryList : List containing applicable category names.
     *                              Fetched information is then get stored into parentCategotyDetails collection and childCategoryDetails collection by iterating over
     *                              the fetched result. Then according to order type selection by user, is global entitlement policy applicable is decided as follows :
     *                              1. Order Type : Complete Eyewear --> Global Entitlement is not applicable as product needs to be shown country wise.
     *                              2. Order Type : Lens Only/ Lens Only + Frame is Provided : Global Entitlement is applicable as all products needs to be shown.
     *
     * 4. triggerGetSortRules() :   Invoked from getCategoryDetails(). This method fetches sorting rules applicable for current store through community Id.
     *
     * 5. fetchAllProducts()    :   Invoked from triggerGetSortRules(). This method fetches all the applicable products for the current user from backend via
     *                              Apex call. From this, getEntitlementProducts() method of B2B_VisionSensation_RX_Controller gets invoked that needs following parameters:
     *                                  1. effectiveAccountId: Account Id of currently logged in user
                                        2. storeName: Type of store according to page reference (Vision Sensation/RX Glazing)
                                        3. globalEntitlementApplicable: Whether global entitlement policy is applicable (True/False)
                                        4. categoryIdList: Child categories collction that fetched from getCategoryDetails().
     *
     * 6. handleSort()  :   Invoked from fetchAllProducts(). This method fetches sorts the obtained product data according to sorting rules fetched in triggerGetSortRules().
     *
     * 7. getChunk()    :   Invoked from handleSort(). This method breaks down the obtained product data into smaller chunks according to maximum products needs to be displayed on screen
     *
     * 8. getDisplayProducts()    :   Invoked from getChunk(). This method fetches all the product details according to chunk size by taking product Ids of products that needs to be shown
     *                                on UI from backend via Apex call. From this, productsSearch() method of B2B_VisionSensation_RX_Controller gets invoked.
     *
     * 9. handleDisplaySort()   :   Invoked from getDisplayProducts(). This method gives the recieved product data to dataNormalizer that results into structured data.
     */

    /**
     * Gets the effective account - if any - of the user viewing the product.
     * BS-708
     * @type {string}
     */
    @api
    get effectiveAccountId() {
        return this._effectiveAccountId;
    }

    /**
     * Sets the effective account - if any - of the user viewing the product
     * and fetches updated cart information
     * BS-708
     */
    set effectiveAccountId(newId) {
        this._effectiveAccountId = newId;
        if (newId && this.term) {
            this.triggerGetSortRules();
        }
    }

    /**
     * Gets or sets the unique identifier of a category.
     * BS-708
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
     * Gets or sets the search term.
     * BS-708
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
     * Gets or sets fields to show on a card.
     * BS-708
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
     * BS-708
     * The pageSource used to determine current page details
     *
     * @type {string}
     */
    @api
    pageSource;

    /**
     * Store name on which this component is currently embedded (e.g. SH/NB)
     * BS-708
     * @type {String}
     */
    @api
    storeName;

    /**
     * Variable that indicates whether the display data is present
     * BS-708
     * @type {Boolean}
     */
    @api
    isDisplaydata;

    /**
     * BS-708
     * Property to store order type value selected by user on UI
     * This value is obtained from c/c/b2b_vs_rx_container
     *
     * @type {string}
     */
    @api
    orderType;

    /**
     * BS-708
     * Property to store current page reference
     * This value is obtained from c/b2b_vs_rx_container
     *
     * @type {string}
     */
    @api
    pageReference;

    /**
     * BS-708
     * Collection that contains details of frame type values selected by user on 1st screen
     *
     * @type {Array}
     */
    @api
    frameTypeCollection;

    /**
     * BS-708
     * This collection is used to store all products data\
     *
     * @type {Array}
     */
    @track
    _allProductsData;

    /**
     * BS-708
     * This collection is used to data fetched from backend
     *
     * @type {Array}
     */
    @track
    _dataFetched;

    /**
     * BS-708
     * This collection is used to store data of products that needs to be shown on UI
     *
     * @type {Array}
     */
    @track
    _productsToShow = [];

    /**
     * BS-708
     * This variable indicates whether filters to be loaded
     *
     * @type {Boolean}
     */
    _loadFilters = false;

    /**
     * BS-708
     * This variable indicates whether filters to be loaded
     *
     * @type {Array}
     */
    @track
    _categoryData = [];

    /**
     * BS-708
     * This collection is used to store product Ids
     *
     * @type {Array}
     */
    @track
    _filteredProductIds = [];

    /**
     * BS-708
     * Property to store country of currently logged in user
     *
     * @type {string}
     */
    @track
    _countryName;

    /**
     * BS-708
     * Property used to store entitlement policy of currently logged in user
     *
     * @type {string}
     */
    @track
    _applicableEntitlementPolicy;

    /**
     * BS-708
     * Collection that holds category data selected by user on UI
     *
     * @type {string}
     */
    @track
    _applicableCategoriesCollection = [];

    /**
     * BS-708
     * Collection that holds the data of parent category of currently selected category by user on UI
     *
     * @type {Array}
     */
    @track
    _parent_categoryDetailsCollection = [];

    /**
     * BS-708
     * Property to hold current store name
     *
     * @type {String}
     */
    @track
    _currentStore;

    /**
     * BS-708
     * Collection that holds Ids of child categories of currently selected category by user on UI
     *
     * @type {Array}
     */
    _childCategoriesIdCollection = [];

    /**
     * BS-708
     * Collection that holds data of child categories of currently selected category by user on UI
     *
     * @type {Array}
     */
    _childCategoriesDataCollection = [];

    /**
     * BS-708
     * This collection is used to store products recieved from backend
     *
     * @type {Array}
     */
    _recievedFilters;

    /**
     * BS-708
     * This collection is used to store all prodcuts data
     *
     * @type {Array}
     */
    _displayData;

    /**
     * BS-708
     * This variable is used to control loader
     *
     * @type {Boolean}
     */
    _isLoading = false;

    /**
     * BS-708
     * BS-2128
     * This variable is used to hold value of starting page number
     *
     * @type {String}
     */
    _pageNumber = 1;

    /**
     * BS-708
     * This variable is used to hold value of products page number
     *
     * @type {Array}
     */
    _productPageNumber = 1;

    _refinements = [];

    /**
     * BS-708
     * This variable is used to hold value of search term
     *
     * @type {String}
     */
    _term;

    /**
     * BS-708
     * This variable is used to hold value of category Id
     *
     * @type {String}
     */
    _recordId;

    /**
     * BS-708
     * This variable is used to hold value of current category Id
     *
     * @type {String}
     */
    _landingRecordId;

    /**
     * BS-708
     * This variable is used to hold value of search card content mapping
     *
     * @type {String}
     */
    _cardContentMapping;

    /**
     * BS-708
     * This variable is used to hold value of current users account Id
     *
     * @type {String}
     */
    _effectiveAccountId;

    /**
     * BS-762
     * This collection is used to store colors fetched from custom metadata
     *
     * @type {Array}
     */
    @track
    _customMetadataColors;

    /**
     * BS-708
     * This variable is used to hold Id of category selected by user on UI
     *
     * @type {String}
     */
    _currentCategoryId;

    /**
     * BS-708
     * This Collection is used to store data of all products fetched from database
     *
     * @type {Array}
     */
    _globalProductData;

    /**
     * BS-708
     * This variable is used to hold value of counter
     *
     * @type {String}
     */
    _counter = 0;

    /**
     * BS-708
     * This variable is used to hold page size
     *
     * @type {String}
     */
    _pageSizeForPopUp = 15;

    /**
     * BS-708
     * This variable is used to store status of hide prices component
     *
     * @type {Boolean}
     */
    _hidePricesFromTiles;

    /**
     * BS-708
     * This variable is used to store total products count
     *
     * @type {String}
     */
    _totalProducts;

    /**
     * BS-708
     * This variable is used to store value on basis of which the sorting should takes place
     *
     * @type {String}
     */
    _sortingValue;

    /**
     * BS-708
     * This variable is used to indicate whether products obtained from database
     *
     * @type {Boolean}
     */
    _hasProducts = false;

    /**
     * BS-708
     * This variable is used to hold value of sorting parameter
     *
     * @type {String}
     */
    _sortName;

    /**
     * BS-708
     * This variable is used to hold value of sorting direction
     *
     * @type {String}
     */
    _sortDerection;

    /**
     * BS-708
     * This collection is used to hold summary of cart
     *
     * @type {String}
     */
    _cartSummary;

    /**
     * BS-708
     * This variable is used to indicate whether user changs the category through  category filter
     *
     * @type {String}
     */
    _isCategoryChange = false;

    /**
     * Gets or sets the layout of this component. Possible values are: grid, list.
     * BS-708
     * @type {string}
     */
    resultsLayout = GRID_STYLING;

    /**
     * Gets or sets whether the product image to be shown on the cards.
     * BS-708
     * @type {Boolean}
     */
    _showProductImage = true;

    /**
     * BS-708
     * Property to hold value of label 'sort by'
     *
     * @type {String}
     */
    _sortByLabel = FILTER_LABELS.split(',')[2];

    /**
     * BS-708
     * Property to indicate no products available
     *
     * @type {Boolean}
     */
    _noProducts = false;

    /**
     * BS-708
     * Property to indicate no products available
     *
     * @type {Boolean}
     */
    _noResultFound = false;

    /**
     * BS-708
     * Property to hold store type value (Vision Sensation/RX Glazing) depeding upon page reference
     *
     * @type {String}
     */
    _storeType;

    /**
     * BS-708
     * Property to indicate whether global entitlement policy needs to be applicable
     *
     * @type {Boolean}
     */
    _globalEntitlementPolicyApplicable = false;

    /**
     * BS-762
     * Property to store transparent color bubble value
     *
     * @type {String}
     */
    _transparentUri;

    /**
     * BS-762
     * Collection to store product data fetched from database
     *
     * @type {Array}
     */
    _productObjectData;

    /**
     * BS-762
     * This map is use to store filters selected by user that needs to be shown on UI
     *
     * @type {Map}
     */
    @track
    _selectedFiltersMap = new Map();

    /**
     * BS-762
     * This collection is use to store filters selected by user that needs to be shown on UI
     *
     * @type {Array}
     */
    @track
    _selectedFilters = [];

    /**
     * BS-762
     * This collection is use to store picklist values api name and label
     *
     * @type {Map}
     */
    _picklistApiNameVsLabelMap = new Map(); //BS-762

    /**
     * BS-762
     * This variable is use to activate/deactive breadcrumb component
     *
     * @type {Boolean}
     */
    _isBreadCrumbsActive = false;

    /**
     * BS-762
     * This Property holds the src/link of refresh icon stored in static resources
     *
     * @type {String}
     */
    _refreshIcon = STORE_STYLING + '/icons/refresh_icon.svg'; //BS-652

    /**
     * BS-762
     * This Property holds the label value for clear all button
     *
     * @type {String}
     */
    _clearAllLabel = FILTER_LABELS.split(',')[1];

    /**
     * BS-762
     * This Property is used to indicate whether category is fetched from local storage
     *
     * @type {Array}
     */
    _categoryFetchedFromLocalStorage = false;

    /**
     * BS-762
     * This collection holds the details of category fetched from local storage
     *
     * @type {Array}
     */
    @track
    _categoryDetailsFromLocalStorage;

    /**
     * BS-762
     * This collection holds the translations of category
     *
     * @type {Array}
     */
    @track
    _translatedCategoriesCollection; // BS-762

    /**
     * BS-762
     * This collection holds the details of categories fetched from database
     *
     * @type {Array}
     */
    @track
    _categoryDetailsCollection;

    /**
     *  Map to store filter field and its filterType
     * BS-930
     * @type {string}
     */
    _filterSourceFieldVsFilterType = new Map();

    /**
     * This variable hold the currency ISO Code applicable
     * BS-1245
     * @type {string}
     */
    _applicableCurrencyCode; //BS-1245

    //BS-1529
    _bicolorImage = STORE_STYLING + '/icons/color-wheel.svg';

    /**
     * BS-393
     * An object with the current PageReference.
     * This is needed for the pubsub library.
     *
     * @type {PageReference}
     */
    @wire(CurrentPageReference)
    pageRef;

    /**
     * BS-708
     * This wire method is use to get account data through effectiveAccountId
     *
     * @type {string}
     */
    @wire(getRecord, { recordId: '$effectiveAccountId', fields })
    account;

    /**
     *  Gets and sets options to be displayed in combobox.
     *
     * @type {string}
     */
    get sortingOptions() {
        return this._sortingOptions;
    }

    set sortingOptions(value) {
        this._sortingOptions = [];
        value.sortRules.forEach((element) => {
            this._sortingOptions.push({ label: element.label, value: element.sortRuleId, name: element.nameOrId, direction: element.direction }); //element.nameOrId + '-' + element.direction
        });
    }

    get country() {
        this._countryName = getFieldValue(this.account.data, COUNTRY_FIELD);
        return getFieldValue(this.account.data, COUNTRY_FIELD);
    }

    get countryCode() {
        if (this.account.data) {
            return getFieldValue(this.account.data, CODE_FIELD).substring(0, 4);
        } else {
            return null;
        }
    }

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

    get hidePricesFromTiles() {
        return this._hidePricesFromTiles;
    }

    /**
     * BS-708
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
        const totalItemCount = this._productsToShow !== undefined && this._productsToShow !== null ? this._productsToShow.length : 0;
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

    /**
     * Gets whether results has more than 1 page.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get hasMorePages() {
        return this._totalProducts > this._pageSizeForPopUp;
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
        this._allProductsData = transformData(data, this._cardContentMapping);
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
                    showImage: this._showProductImage,
                    resultsLayout: this.resultsLayout,
                    actionDisabled: this.isCartLocked
                }
            }
        };
    }

    parsedFrameTypeValuesCollection;

    connectedCallback() {
        /*
         *Start BS-930
         * Block to fill the map which identifies filter type based on field
         */
        if (localStorage.getItem(VS_RX_TYPE_KEY)) {
            let decodedFormattedFilterData = decodeURIComponent(escape(atob(localStorage.getItem(VS_RX_TYPE_KEY))));
            let filterTypeList = JSON.parse(decodedFormattedFilterData);

            for (let filterIndex = 0; filterIndex < filterTypeList.length; filterIndex++) {
                this._filterSourceFieldVsFilterType.set(filterTypeList[filterIndex].key, {
                    filterType: filterTypeList[filterIndex].filterType,
                    isMultiselect: filterTypeList[filterIndex].isMultiselect
                });
            }
        }
        this.doInitialSetup();

        /* End BS-930 */
        // Setting up current store according to page source
        if (this.pageReference == VS_PAGE_SOURCE) {
            this._currentStore = SH_STORE;
            this._storeType = VISION_SENSATION;
        } else if (this.pageReference == RX_PAGE_SOURCE) {
            this._currentStore = EE_STORE;
            this._storeType = RX_GLAZING;
        }

        this._pageNumber = pageManager.getPreviouslyVisitedPageIfFromPDPOrFirst(this.pageReference);

        // Invoking setupApplicableCategories to setup category selected by user on 1st screen
    }

    doInitialSetup() {
        performInitialSetupOfSearchResultContainer({ objectApiName: B2B_LENS_CONFIGURATOR_OBJECT_API_NAME, picklistField: B2B_FRAME_TYPE })
            .then((data) => {
                if (data != undefined && data != null) {
                    if (data.categoryDetailsList != undefined && data.categoryDetailsList != null) {
                        this._categoryDetailsCollection = JSON.parse(JSON.stringify(data.categoryDetailsList));
                    }
                    if (data.mapColorCodes != undefined && data.mapColorCodes != null) {
                        this._transparentUri = URI1 + URI2;
                        /* Start : BS-1529 */
                        this._customMetadataColors = new Map();
                        let customMetadataMap = new Map(Object.entries(JSON.parse(data.mapColorCodes)));
                        for (let [key, value] of customMetadataMap.entries()) {
                            this._customMetadataColors.set(value.Label, value);
                        }
                        /* End : BS-1529 */
                    }
                    if (data.productPicklistDataWrapper != undefined && data.productPicklistDataWrapper != null) {
                        data.productPicklistDataWrapper.forEach((value) => {
                            let key = value.fieldApiName + '_' + value.picklistApiName;
                            this._picklistApiNameVsLabelMap.set(key, value.picklistValue);
                        });
                    }
                    if (data.picklistWrapper != undefined && data.picklistWrapper != null) {
                        this.parsedFrameTypeValuesCollection = JSON.parse(JSON.stringify(data.picklistWrapper));
                        this.setupApplicableCategories();
                    }
                } else {
                    this.fireOperateLoader(false);
                }
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                this.fireOperateLoader(false); // Firing event to stop the loader/spinner
            });
    }

    /**
     * BS-708
     * This method is use to setup valid categories according to category selected by user on UI
     *
     * Valid Scenarios:
     *              1. for VS:
     *                      1. Selected Category is Optical Eyewear: Fullrim, Rimless, Nylor
     *                      2. Selected Category is Sunglasses: Sunglasses
     *              2. for RX:
     *                      For VS, applicable Category is Frames
     *                          Frames : Active, Performance and Goggles
     */
    setupApplicableCategories() {
        // If the component is loaded for first time and category is not selected through category filter by user then setting up category on basis of frame type value selected by user
        if (this._isCategoryChange != null && this._isCategoryChange != undefined && this._isCategoryChange == false) {
            //BS-762 Start
            let categoryKey;
            if (this._currentStore == SH_STORE) {
                categoryKey = SELECTED_VS_CATEGORY_KEY;
            } else if (this._currentStore == EE_STORE) {
                categoryKey = SELECTED_RX_CATEGORY_KEY;
            }

            // Fetching selected category from local storage and setting its applicable sub categories
            if (categoryKey != null && categoryKey != undefined && localStorage.getItem(categoryKey)) {
                let selectedCategoryDetails = JSON.parse(localStorage.getItem(categoryKey));
                let applicableCategoriesLabelSource;

                if (selectedCategoryDetails != null && selectedCategoryDetails != undefined) {
                    if (selectedCategoryDetails.fieldName == CATEGORY_OPTICAL_EYEWEAR) {
                        applicableCategoriesLabelSource = APPLICABLE_CATEGORIES_FOR_VS;
                    } else if (selectedCategoryDetails.fieldName == CATEGORY_FRAMES) {
                        applicableCategoriesLabelSource = APPLICABLE_CATEGORIES_FOR_RX;
                    }
                }

                let navigationalCategory;
                // If the current language is other than english, then iterating over the category transaltion collection and identifying the category to get it's translation
                if (this._translatedCategoriesCollection != null && this._translatedCategoriesCollection != undefined) {
                    this._translatedCategoriesCollection.forEach((category) => {
                        if (category.Parent.Name == selectedCategoryDetails.fieldName) {
                            navigationalCategory = category.Parent.Name;
                        }
                    });
                }

                // If language is english then changing the category labels to english language as user switched the language from language switcher
                if (LANG == LANGUAGE_ENGLISH) {
                    if (this._categoryDetailsCollection != null && this._categoryDetailsCollection != undefined) {
                        this._categoryDetailsCollection.forEach((category) => {
                            if (category.Id == selectedCategoryDetails.fieldValue) {
                                navigationalCategory = category.Name;
                            }
                        });
                    }
                }
                if (navigationalCategory != null && navigationalCategory != undefined) {
                    if (navigationalCategory == CATEGORY_OPTICAL_EYEWEAR) {
                        applicableCategoriesLabelSource = APPLICABLE_CATEGORIES_FOR_VS;
                    }
                } else if (navigationalCategory == CATEGORY_FRAMES) {
                    applicableCategoriesLabelSource = APPLICABLE_CATEGORIES_FOR_RX;
                } else if (navigationalCategory == CATEGORY_SUNGLASSES) {
                    this._applicableCategoriesCollection.push(CATEGORY_SUNGLASSES);
                }

                if (applicableCategoriesLabelSource != null && applicableCategoriesLabelSource != undefined) {
                    this._applicableCategoriesCollection = [];
                    for (let i = 0; i < applicableCategoriesLabelSource.split(',').length; i++) {
                        this._applicableCategoriesCollection.push(applicableCategoriesLabelSource.split(',')[i]);
                    }
                } else {
                    this._applicableCategoriesCollection.push(selectedCategoryDetails.fieldValue);
                }
                if (this._applicableCategoriesCollection != null && this._applicableCategoriesCollection != undefined) {
                    this._categoryFetchedFromLocalStorage = true;
                    this.getCategoryDetails();
                }
                //BS-762 End
            } else {
                this._categoryFetchedFromLocalStorage = false; //BS-762
                let applicableCategoriesLabelSource;
                if (this.frameTypeCollection.apiName == CATEGORY_OPTICAL_EYEWEAR) {
                    // If page source is VS and selected frame type is OPTICAL EYEWEAR,
                    // then applicable cateories are Fullrim, Rimless and Nylor as mentioned in BS-708
                    applicableCategoriesLabelSource = APPLICABLE_CATEGORIES_FOR_VS;
                } else if (this.frameTypeCollection.apiName == CATEGORY_SUNGLASSES) {
                    // If page source is VS and selected frame type is SUNGLASSES,
                    // then applicable category is Sunglasses
                    this._applicableCategoriesCollection.push(CATEGORY_SUNGLASSES);
                } else if (this.frameTypeCollection.apiName == CATEGORY_FRAMES) {
                    // If page source is RX then applicable parent category is 'Frames',
                    // and applicable child categories are Active, Performance and Goggles
                    applicableCategoriesLabelSource = APPLICABLE_CATEGORIES_FOR_RX;
                }
                if (applicableCategoriesLabelSource != null && applicableCategoriesLabelSource != undefined) {
                    for (let i = 0; i < applicableCategoriesLabelSource.split(',').length; i++) {
                        this._applicableCategoriesCollection.push(applicableCategoriesLabelSource.split(',')[i]);
                    }
                }
                if (this._applicableCategoriesCollection != null && this._applicableCategoriesCollection != undefined) {
                    this.getCategoryDetails();
                }
            }
        } else if (this._isCategoryChange != null && this._isCategoryChange != undefined && this._isCategoryChange == true) {
            let applicableCategoriesLabelSource;

            if (this._applicableCategoriesCollection != null && this._applicableCategoriesCollection != undefined) {
                if (this._applicableCategoriesCollection.includes(CATEGORY_OPTICAL_EYEWEAR)) {
                    applicableCategoriesLabelSource = APPLICABLE_CATEGORIES_FOR_VS;
                } else if (this._applicableCategoriesCollection.includes(CATEGORY_FRAMES)) {
                    applicableCategoriesLabelSource = APPLICABLE_CATEGORIES_FOR_RX;
                }
            }

            if (applicableCategoriesLabelSource != null && applicableCategoriesLabelSource != undefined) {
                this._applicableCategoriesCollection = [];
                for (let i = 0; i < applicableCategoriesLabelSource.split(',').length; i++) {
                    this._applicableCategoriesCollection.push(applicableCategoriesLabelSource.split(',')[i]);
                }
            }

            if (this._applicableCategoriesCollection != null && this._applicableCategoriesCollection != undefined) {
                this.getCategoryDetails();
            }
        }
    }

    /**
     * BS-708
     * This method is use to fetch category details by using _applicableCategoriesCollection through Apex
     *
     */
    getCategoryDetails() {
        // Fetching category details through category name from backend via apex call
        getCategoriesDataForVSRX({ categoriesList: this._applicableCategoriesCollection })
            .then((result) => {
                if (result != null && result != undefined) {
                    let _categoryDetailsCollection = JSON.parse(JSON.stringify(result));
                    this._childCategoriesDataCollection = [];
                    this._childCategoriesIdCollection = [];
                    this._parent_categoryDetailsCollection = [];
                    const parentCategoryData = {};
                    //Iterating over the category details collection obtained and extracting parent category data, child category data and storing it into respective collection
                    _categoryDetailsCollection.forEach((category) => {
                        if (category.childCategoriesList != null && category.childCategoriesList != undefined) {
                            category.childCategoriesList.forEach((childCategory) => {
                                this._childCategoriesDataCollection.push(childCategory);
                                this._childCategoriesIdCollection.push(childCategory.Id);

                                //If category selected by user is sunglasses then assigning its id to record id as sunglasses does not have any further child categories
                                if (this.frameTypeCollection.apiName == CATEGORY_SUNGLASSES) {
                                    if (this._isCategoryChange != null && this._isCategoryChange != undefined && this._isCategoryChange == false) {
                                        this._recordId = childCategory.Id;
                                    }
                                    parentCategoryData.parentCategoryId = childCategory.Id;
                                    parentCategoryData.parentCategoryName = childCategory.Name;
                                } else if (this.frameTypeCollection.apiName != CATEGORY_SUNGLASSES) {
                                    //If category selected by user is not then assigning its parent's id to record id
                                    if (this._isCategoryChange != null && this._isCategoryChange != undefined && this._isCategoryChange == false) {
                                        if (this._categoryFetchedFromLocalStorage == true) {
                                            this._recordId = childCategory.Id;
                                        } else {
                                            this._recordId = category.parentCategoryId;
                                        }
                                    }
                                    parentCategoryData.parentCategoryId = category.parentCategoryId;
                                    parentCategoryData.parentCategoryName = category.parentCategoryName;
                                }
                            });
                        }
                        this._parent_categoryDetailsCollection.push(parentCategoryData);
                    });
                    //BS-762 Start
                    //Fetching current category selected by user from local storage
                    let categoryKey;
                    if (this._currentStore == SH_STORE) {
                        categoryKey = SELECTED_VS_CATEGORY_KEY;
                    } else if (this._currentStore == EE_STORE) {
                        categoryKey = SELECTED_RX_CATEGORY_KEY;
                    }
                    if (categoryKey != null && categoryKey != undefined && localStorage.getItem(categoryKey)) {
                        let selectedCategoryDetails = JSON.parse(localStorage.getItem(categoryKey));
                        this._categoryDetailsFromLocalStorage = {
                            categoryId: selectedCategoryDetails.fieldValue,
                            categoryName: selectedCategoryDetails.fieldName
                        };
                    }
                    this._isBreadCrumbsActive = true;
                    // If order type selected by user is Complete Eyewear then applicable entitlement will be country wise entitlement
                    if (this.orderType == ORDER_TYPE_COMPLETE_EYEWEAR) {
                        this._globalEntitlementPolicyApplicable = false;
                        // If order type selected by user is other than complete Eyewear then applicable entitlement will be global entitlement
                    } else if (this.orderType != ORDER_TYPE_COMPLETE_EYEWEAR) {
                        this._globalEntitlementPolicyApplicable = true;
                    }
                    this.triggerGetSortRules();
                    //BS-762 End
                } else {
                    this._isLoading = false;
                    this.fireOperateLoader(false);
                }
            })
            .catch((execptionInstance) => {
                this._isLoading = false;
                this.fireOperateLoader(false);
                console.error(execptionInstance);
            });
    }

    /**
     * BS-708
     * this method is used to call  the child components method
     *
     */
    showProducts() {
        let categoryId;
        let filters;
        /* BS-227 the below if block is used to set the filter data in local storage
         *  this data will be used to persist the filter and product data when user gets back to same page.
         */
        if (this._recievedFilters != null) {
            const arr = Array.from(this._recievedFilters, ([key, value]) => {
                return { key: key, value: value };
            });
            categoryId = this._recordId;
            filters = {};
            filters[categoryId] = arr;

            let key;
            if (this._currentStore == SH_STORE) {
                key = FILTER_KEY_FOR_VS;
            } else if (this._currentStore == EE_STORE) {
                key = FILTER_KEY_FOR_RX;
            }
            if (key != null && key != undefined) {
                localStorage.setItem(key, JSON.stringify(filters)); //BS-762: setting the local storage with filter data
            }
        }
        if (this._productsToShow.length > 0) {
            this._noProducts = false;
            if (this._loadFilters == false) {
                this._loadFilters = true;
            } else if (this._isCategoryChange == true) {
                this._isCategoryChange = false;
                const filterContainer = this.template.querySelector(FILTER_CONTAINER_COMPONENT);
                filterContainer.getAvailableCategoryDetails(this._recordId);
            } else {
                const filterContainer = this.template.querySelector(FILTER_CONTAINER_COMPONENT);
                filterContainer.updateFilters();
            }
        } else {
            this._isLoading = false;
            this.fireOperateLoader(false);
            this._noProducts = true;
            this.displayData = null;
            const filterContainer = this.template.querySelector(FILTER_CONTAINER_COMPONENT);
            filterContainer.updateRadioButtonFilter();
            filterContainer.updateFilters(); // Added as part of BS-930
            this.isDisplaydata = 0;
            this._categoryData = null;
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
                this.sortingOptions = result;
                this._sortingValue = this.sortingOptions[0].value;
                this._sortName = this.sortingOptions[0].name;
                this._sortDerection = this.sortingOptions[0].direction;
                this.fetchAllProducts();
            })
            .catch((error) => {
                this._isLoading = false;
                this.fireOperateLoader(false);
                console.error('Error: ' + JSON.stringify(error));
            });
    }

    /**
     * BS-708
     * This method is use to operate loader on parent component
     *
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
     * BS-708
     * this method will get the products based on following parameter:
     *      1. effectiveAccountId: Account Id of currently logged in user
     *      2. storeName: Type of store according to page reference (Vision Sensation/RX Glazing)
     *      3. globalEntitlementApplicable: Whether global entitlement policy is applicable (True/False)
     *      4. categoryIdList: Child categories collction that fetched from getCategoryDetails().
     */
    fetchAllProducts() {
        getEntitlementProducts({
            effectiveAccountId: this.resolvedEffectiveAccountId,
            storeName: this._currentStore,
            globalEntitlementApplicable: this._globalEntitlementPolicyApplicable,
            categoryIdList: this._childCategoriesIdCollection
        })
            .then((result) => {
                if (result != null && result.length > 0) {
                    this._hasProducts = true;
                    this._globalProductData = result;
                    // Updated the check as a part of BS-2009
                    if (this.orderType === ORDER_TYPE_COMPLETE_EYEWEAR) {
                        let globalProductDataCloned = [];
                        for (let index = 0; index < this._globalProductData.length; index++) {
                            let product = {};
                            product = this._globalProductData[index];
                            if (
                                product !== undefined &&
                                product !== null &&
                                this.countryCode !== undefined &&
                                this.countryCode !== null &&
                                product.B2B_Availability_JSON__c !== undefined &&
                                product.B2B_Availability_JSON__c !== null &&
                                checkProductAvailability(product.B2B_Availability_JSON__c, this.countryCode) === false &&
                                product.B2B_RX_Able__c == true
                            ) {
                                globalProductDataCloned.push(product);
                            }
                        }
                        this._globalProductData = globalProductDataCloned;
                    }
                    this._productsToShow = JSON.parse(JSON.stringify(this._globalProductData));
                    this._totalProducts = this._globalProductData.length;

                    if (this._isCategoryChange != null && this._isCategoryChange != undefined && this._isCategoryChange == false) {
                        //BS-762 Start
                        // Fetching category details from local storage
                        let categoryKey;
                        if (this._currentStore == SH_STORE) {
                            categoryKey = SELECTED_VS_CATEGORY_KEY;
                        } else if (this._currentStore == EE_STORE) {
                            categoryKey = SELECTED_RX_CATEGORY_KEY;
                        }
                        if (localStorage.getItem(categoryKey) && this._isCategoryChange == false) {
                            let categoryData = JSON.parse(localStorage.getItem(categoryKey));

                            if (this._translatedCategoriesCollection != null && this._translatedCategoriesCollection != undefined) {
                                this._translatedCategoriesCollection.forEach((category) => {
                                    if (category.ParentId == categoryData.fieldValue) {
                                        categoryData.displayFilter = category.Name;
                                    }
                                });
                            }

                            // If language is english then changing the category labels to english language as user switched the language from language switcher
                            if (LANG == LANGUAGE_ENGLISH) {
                                if (this._categoryDetailsCollection != null && this._categoryDetailsCollection != undefined) {
                                    this._categoryDetailsCollection.forEach((category) => {
                                        if (category.Id == categoryData.fieldValue) {
                                            categoryData.displayFilter = category.Name;
                                        }
                                    });
                                }
                            }

                            //BS-762 Below block will set category filters into selected filters to show on UI
                            let data = {};
                            data = {
                                fieldName: categoryData.fieldName,
                                displayFilter: categoryData.displayFilter,
                                fieldValue: categoryData.fieldValue,
                                filterType: categoryData.filterType,
                                isColor: categoryData.isColor,
                                previousCategoryId: categoryData.previousCategoryId,
                                previousCategoryName: categoryData.previousCategoryName
                            };
                            if (this._selectedFiltersMap.has(categoryKey) == false) {
                                this._selectedFiltersMap.set(categoryData.fieldName, data);
                            }
                            for (let filter of this._selectedFiltersMap.values()) {
                                this._selectedFilters.push(filter);
                            }
                        }

                        // BS-762
                        // Fetching the filters selected by user on UI for respective stores
                        let key;
                        let clearAll; //BS-1442
                        if (this._currentStore == SH_STORE) {
                            key = FILTER_KEY_FOR_VS;
                            if (localStorage.getItem(REMOVE_ALL)) {
                                clearAll = localStorage.getItem(REMOVE_ALL);
                            } //BS-1442
                        } else if (this._currentStore == EE_STORE) {
                            key = FILTER_KEY_FOR_RX;
                        }
                        if (key != null && key != undefined && localStorage.getItem(key)) {
                            let filtersMap = new Map();
                            let filtersData = JSON.parse(localStorage.getItem(key)); //this will get the filters from local storage
                            if (filtersData != null) {
                                let filtersList;

                                if (filtersData != null) {
                                    filtersList = filtersData[this._recordId];
                                }

                                //the below block will be used to prepare a filters map from the local storage data
                                if (filtersList != undefined && filtersList != null && filtersList.length > 0) {
                                    filtersList.forEach((item) => {
                                        filtersMap.set(item.key, item.value);
                                    });
                                    this._recievedFilters = filtersMap;
                                    //BS-1767 Added category check of sunglasses.
                                } else if (
                                    this._currentStore == SH_STORE &&
                                    this.frameTypeCollection.apiName !== CATEGORY_SUNGLASSES &&
                                    clearAll != REMOVE_ALL
                                ) {
                                    let filter = [DEFAULT_VS_FILTER]; //BS-1442
                                    filtersData[this._recordId] = filter;
                                    filtersList = null;
                                    if (filtersData != null) {
                                        if (filtersData != null) {
                                            filtersList = filtersData[this._recordId];
                                        }

                                        //the below block will be used to prepare a filters map from the local storage data
                                        if (filtersList != undefined && filtersList != null) {
                                            filtersList.forEach((item) => {
                                                filtersMap.set(item.key, item.value);
                                            });
                                            this._recievedFilters = filtersMap;
                                        } else {
                                            /* BS-227 if there is no filters for the current category this will remove the existing filters */
                                            localStorage.removeItem(key);
                                            this._recievedFilters = filtersMap;
                                        }
                                    }
                                } else {
                                    /* BS-227 if there is no filters for the current category this will remove the existing filters */
                                    localStorage.removeItem(key);
                                    this._recievedFilters = filtersMap;
                                }
                                //BS-1767 Added category check of sunglasses.
                            } else if (this._currentStore == SH_STORE && this.frameTypeCollection.apiName !== CATEGORY_SUNGLASSES && clearAll != REMOVE_ALL) {
                                let filter = [DEFAULT_VS_FILTER];
                                filtersData[this._recordId] = filter;
                                if (filtersData != null) {
                                    let filtersList;

                                    if (filtersData != null) {
                                        filtersList = filtersData[this._recordId];
                                    }

                                    //the below block will be used to prepare a filters map from the local storage data
                                    if (filtersList != undefined && filtersList != null) {
                                        filtersList.forEach((item) => {
                                            filtersMap.set(item.key, item.value);
                                        });
                                        this._recievedFilters = filtersMap;
                                    } else {
                                        /* BS-227 if there is no filters for the current category this will remove the existing filters */
                                        localStorage.removeItem(key);
                                        this._recievedFilters = filtersMap;
                                    }
                                }
                            } //BS-1442
                            //BS-762 end
                            //BS-1767 Added category check of sunglasses.
                        } else if (this._currentStore == SH_STORE && this.frameTypeCollection.apiName !== CATEGORY_SUNGLASSES && clearAll != REMOVE_ALL) {
                            this._filterSourceFieldVsFilterType.set(RIMLES_VARIANT, {
                                filterType: RADIO_BUTTON_TYPE,
                                isMultiselect: false
                            }); //BS-1442
                            let filtersMap = new Map();
                            let filter = [DEFAULT_VS_FILTER];
                            let filtersData = {};
                            filtersData[this._recordId] = filter;
                            if (filtersData != null) {
                                let filtersList;

                                if (filtersData != null) {
                                    filtersList = filtersData[this._recordId];
                                }

                                if (filtersList != undefined && filtersList != null) {
                                    filtersList.forEach((item) => {
                                        filtersMap.set(item.key, item.value);
                                    });
                                    this._recievedFilters = filtersMap;
                                }
                            }
                        }
                    }
                    if (this._recievedFilters != null) {
                        this.handleFilterProductSearch(this._recievedFilters);
                    } else {
                        this.handleSort();
                        this.getChunk();
                        this._productsToShow.forEach((product) => {
                            this._filteredProductIds.push(product.Id);
                        });
                        if (this._filteredProductIds.length > 0) {
                            this.fetchCategoryData();
                        }
                    }
                } else {
                    this._isLoading = false;
                    this.fireOperateLoader(false);
                    this._noResultFound = true;
                    this._noProducts = true;
                    this.displayData = null;
                }
            })
            .catch((error) => {
                this._isLoading = false;
                this.fireOperateLoader(false);
                console.error('error: here', error);
            });
    }

    /**
     * BS-708
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
                if (result && result[0]) {
                    this._applicableCurrencyCode = result[0];
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /**
     * BS-708
     * handler for filter product search event fired from b2b_filterContainer component
     */
    handleFilterProductSearch(event) {
        this._pageNumber = event.target ? 1 : pageManager.getPreviouslyVisitedPageIfFromPDPOrFirst(this.pageReference);
        if (event.detail) {
            this._recievedFilters = event.detail.productsFilterMap;
        }
        const arr = Array.from(this._recievedFilters, ([key, value]) => {
            return { key: key, value: value };
        });
        if (arr.length > 0) {
            //BS-762 the below block will remove filters other than category
            this._selectedFilters.forEach((filter) => {
                if (filter.filterType != CATEGORY) {
                    this._selectedFiltersMap.delete(filter.fieldName);
                }
            }); //BS-762 End
            this.filterProducts(arr);
        } else {
            // BS-762 Start
            if (this._selectedFilters.length > 0) {
                //BS-762 the below line of code will remove selected filters from UI and Keep the category filters
                this._selectedFilters.forEach((filter) => {
                    if (filter.filterType != CATEGORY) {
                        this._selectedFiltersMap.delete(filter.fieldName);
                    }
                });
                this._selectedFilters = [];
                for (let filter of this._selectedFiltersMap.values()) {
                    if (filter.filterType !== undefined && filter.filterType === CATEGORY) {
                        this._selectedFilters.push(filter);
                    } else if (
                        filter[0].fieldName !== undefined &&
                        this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                        this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType !== SLIDER
                    ) {
                        for (let selectedFilterValue of filter) {
                            this._selectedFilters.push(selectedFilterValue);
                        }
                    } else if (
                        filter[0].fieldName !== undefined &&
                        this._filterSourceFieldVsFilterType.has(filter[0].fieldName) &&
                        this._filterSourceFieldVsFilterType.get(filter[0].fieldName).filterType === SLIDER
                    ) {
                        this._selectedFilters.push(filter[0]);
                    }
                }
            } //BS-762 End
            if (this._currentStore == SH_STORE) {
                localStorage.setItem(REMOVE_ALL, REMOVE_ALL); //BS-1442
            }
            this._productsToShow = JSON.parse(JSON.stringify(this._globalProductData));
            this._totalProducts = this._productsToShow.length;

            this.handleSort();
            this.getChunk();
            this._productsToShow.forEach((product) => {
                this._filteredProductIds.push(product.Id);
            });
            if (this._filteredProductIds.length > 0) {
                this.fetchCategoryData();
            }
        }
    }

    /**
     * BS-708
     * Method to segregate products matching filter criteria for filters selected by user on UI
     */
    filterProducts(filterObj) {
        var totalFilterApplied = filterObj.length;
        let filteredProducts = [];
        let data = {};
        let colorStyleData;

        if (totalFilterApplied > 0) {
            // BS-762 The below block of code will create a data to show the selected filters
            filterObj.forEach((filterKey) => {
                if (this._selectedFiltersMap.has(filterKey.key) == false) {
                    if (filterKey.value.sliderOneValue != undefined && filterKey.value.sliderTwoValue != undefined) {
                        // BS-762 for slider type of filter
                        let filter =
                            this._productObjectData.fields[filterKey.key].label + ' : ' + filterKey.value.sliderOneValue + '-' + filterKey.value.sliderTwoValue;
                        data = {
                            fieldName: filterKey.key,
                            displayFilter: filter,
                            fieldValue: filterKey.value,
                            filterType: SLIDER,
                            isMultiselect: this._filterSourceFieldVsFilterType.has(filterKey.key)
                                ? this._filterSourceFieldVsFilterType.get(filterKey.key).isMultiselect
                                : false, // Added as part of BS-930
                            isColor: false,
                            previousCategoryId: null,
                            previousCategoryName: null
                        };
                        let filterValueList = [];
                        filterValueList.push(data);
                        this._selectedFiltersMap.set(filterKey.key, filterValueList);
                    } else if (filterKey.key == FRAME_COLOR || filterKey.key == LENS_COLOR || filterKey.key == MIRROR_COLOR) {
                        // BS-762 for color radio button filter
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
                                        : false, // Added as part of BS-930
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
                        // BS-762 for radio button filter
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
            } //BS-762 End
            this._globalProductData.forEach((product) => {
                let selectedFilterValues = [];
                filterObj.forEach((filterKey) => {
                    /* Start BS-930 */
                    let isMultiSelectPicklist = false;
                    if (filterKey.value.sliderOneValue === undefined && filterKey.value.sliderTwoValue === undefined) {
                        selectedFilterValues = filterKey.value.split(';');
                    }
                    /* End BS-930 */
                    if (product[filterKey.key] !== undefined && product[filterKey.key].includes(';') === true) {
                        isMultiSelectPicklist = true;
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
                });
                if (this._counter == totalFilterApplied) {
                    filteredProducts.push(product);
                    this._filteredProductIds.push(product.Id);
                }
                this._counter = 0;
            });
            this._productsToShow = filteredProducts;
            this._totalProducts = this._productsToShow.length;
            if (this._productsToShow.length > 0) {
                this.handleSort();
                this.getChunk();
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
     * Helper function for updating pageNumber and localStorage as per BS-2128.
     *
     * @private
     */
    setPageNumberInLocalStorage(toPageNumber) {
        this._pageNumber = toPageNumber;
        pageManager.setCategoryPageNumber(this.pageReference, toPageNumber);
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
            if (counter == 15) {
                break;
            }
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
     * BS-708
     * Handler for event fired from c/c/b2b_hidePrices component
     *
     */
    handleHidePriceSection() {
        this.template.querySelector(SEARCH_LAYOUT_COMPONENT).hidePricesFromTiles = true;
    }

    /**
     * BS-708
     * Handler for event fired from c/c/b2b_hidePrices component
     *
     */
    handleShowPriceSection() {
        this.template.querySelector(SEARCH_LAYOUT_COMPONENT).hidePricesFromTiles = false;
    }

    /**
     * Handles a user request to navigate to next page results page.
     *
     */

    handleNextPage(evt) {
        this.setProductsDisplay(this._pageNumber + 1);
    }

    /**
     * Handles page jump event.
     *
     * @private
     */
    handlePageJump(event) {
        this.setProductsDisplay(event.detail);
    }

    /**
     * function will take the control on top of page.
     */
    scrollToTop() {
        const scrollOptions = {
            left: 0,
            top: 0,
            behavior: SMOOTH_SCROLLING
        };
        window.scrollTo(scrollOptions);
    }

    /**
     * BS-708
     * Handles a user request to navigate to frame selection screen
     *
     * @private
     */
    handleShowDetail(event) {
        event.stopPropagation();

        let selectedProductId = event.detail.productId;
        if (selectedProductId != null && selectedProductId != undefined) {
            this.dispatchEvent(
                new CustomEvent(FRAME_SEARCH_DONE, {
                    bubbles: true,
                    composed: true,
                    detail: {
                        productId: selectedProductId
                    }
                })
            );
        }
    }

    /**
     * Will fire trigger product search when user clicks on category.
     */
    handleCategoryUpdate(event) {
        if (event.detail != null && event.detail != undefined) {
            this._isLoading = true;
            event.stopPropagation();
            this._pageNumber = 1;
            this._isCategoryChange = true;
            this._isLoading = true;

            //BS-762 Start
            let data = {};
            if (event.detail.isBreadcrumbClicked == undefined || event.detail.isBreadcrumbClicked == null) {
                // This will push the category filters to show on UI
                if (this._selectedFiltersMap.has(event.detail.categoryName) == false) {
                    let previousId = this._recordId;
                    this._recordId = event.detail.categoryId;
                    data = {
                        fieldName: event.detail.categoryName,
                        displayFilter: event.detail.categoryName,
                        fieldValue: event.detail.categoryId,
                        filterType: CATEGORY,
                        isColor: false,
                        previousCategoryId: previousId,
                        previousCategoryName: event.detail.parentCategoryName
                    };

                    let categoryKey;
                    if (this._currentStore == SH_STORE) {
                        categoryKey = SELECTED_VS_CATEGORY_KEY;
                    } else if (this._currentStore == EE_STORE) {
                        categoryKey = SELECTED_RX_CATEGORY_KEY;
                    }
                    localStorage.setItem(categoryKey, JSON.stringify(data)); //730
                    if (this._selectedFiltersMap.has(event.detail.categoryName) == false) {
                        this._selectedFiltersMap.set(event.detail.categoryName, data);
                    }
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
                // BS-762 logic to remove category filters based a category clicked on breadcrumb or On selected filters section
                if (this._selectedFiltersMap.has(event.detail.categoryName) == false) {
                    this._recordId = event.detail.categoryId;
                    this._selectedFilters.forEach((filter) => {
                        if (filter.filterType == CATEGORY) {
                            this._selectedFiltersMap.delete(filter.fieldName);
                        }
                    });
                    let categoryKey;
                    if (this._currentStore == SH_STORE) {
                        categoryKey = SELECTED_VS_CATEGORY_KEY;
                    } else if (this._currentStore == EE_STORE) {
                        categoryKey = SELECTED_RX_CATEGORY_KEY;
                    }
                    localStorage.removeItem(categoryKey);
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
                    let categoryKey;
                    if (this._currentStore == SH_STORE) {
                        categoryKey = SELECTED_VS_CATEGORY_KEY;
                    } else if (this._currentStore == EE_STORE) {
                        categoryKey = SELECTED_RX_CATEGORY_KEY;
                    }
                    localStorage.removeItem(categoryKey);
                    this._recordId = event.detail.categoryId;
                    let categoriesToRemove = [];
                    categoriesToRemove.push(event.detail.categoryId);
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
            }
            let categoryData;
            if (event.detail.isBreadcrumbClicked != null && event.detail.isBreadcrumbClicked != undefined && event.detail.isBreadcrumbClicked == true) {
                categoryData = JSON.parse(JSON.stringify(event.detail));
            } else {
                categoryData = JSON.parse(JSON.stringify(event.detail.categoryDetails));
            }
            this._productPageNumber = 1;
            this._globalProductData = null;
            this._applicableCategoriesCollection = [];

            let applicableCategoriesLabelSource;
            let navigationalCategory;

            // If language is other than english then changing the category labels to respective language as user switched the language from language switcher
            if (this._translatedCategoriesCollection != null && this._translatedCategoriesCollection != undefined) {
                this._translatedCategoriesCollection.forEach((category) => {
                    if (category.ParentId == categoryData.categoryId) {
                        navigationalCategory = category.Parent.Name;
                    }
                });
            }

            // If language is english then changing the category labels to english language as user switched the language from language switcher
            if (LANG == LANGUAGE_ENGLISH) {
                if (this._categoryDetailsCollection != null && this._categoryDetailsCollection != undefined) {
                    this._categoryDetailsCollection.forEach((category) => {
                        if (category.Id == categoryData.categoryId) {
                            navigationalCategory = category.Name;
                        }
                    });
                }
            }
            if (navigationalCategory != null && navigationalCategory != undefined) {
                if (navigationalCategory == CATEGORY_OPTICAL_EYEWEAR) {
                    applicableCategoriesLabelSource = APPLICABLE_CATEGORIES_FOR_VS;
                } else if (navigationalCategory == CATEGORY_FRAMES) {
                    applicableCategoriesLabelSource = APPLICABLE_CATEGORIES_FOR_RX;
                } else if (navigationalCategory == CATEGORY_SUNGLASSES) {
                    this._applicableCategoriesCollection.push(CATEGORY_SUNGLASSES);
                }
            }
            if (applicableCategoriesLabelSource != null && applicableCategoriesLabelSource != undefined) {
                this._applicableCategoriesCollection = [];
                for (let i = 0; i < applicableCategoriesLabelSource.split(',').length; i++) {
                    this._applicableCategoriesCollection.push(applicableCategoriesLabelSource.split(',')[i]);
                }
            } else {
                this._applicableCategoriesCollection.push(categoryData.categoryId);
            }
            this.setupApplicableCategories();
            //BS-762 End
        }
    }

    /**
     * Handles a user request to select a specific sorting option.
     *
     * @private
     */
    handleSortingUpdate(event) {
        this._isLoading = true;
        this._pageNumber = 1;
        this._sortingValue = event.detail.value;
        this.sortingOptions.forEach((sort) => {
            if (sort.value == this._sortingValue) {
                this._sortName = sort.name;
                this._sortDerection = sort.direction;
            }
        });
        this.handleSort();
    }

    /**
     * BS-708
     *
     * This method will fetch the category information and product count for the category
     */
    fetchCategoryData() {
        //BS-2342
        let currentLanguage = LANG;
        if (currentLanguage == CHINESE_LANG_BY_DEFAULT) {
            currentLanguage = CHINESE_ORIGINAL_LANG;
        } else if (currentLanguage == PORTUGUESE_LANG_DEFAULT) {
            currentLanguage = PORTUGUESE_LANG_ORIGINAL;
        }
        getCategoryData({
            productIdList: this._filteredProductIds,
            categoryId: this.recordId,
            language: currentLanguage
        }).then((result) => {
            this._filteredProductIds = [];
            this._categoryData = result;
            this.showProducts();
        });
    }

    /**
     * BS-708
     *
     * This method will get the chunk of products to pass the the connect api method
     */
    getChunk() {
        let products = [];

        let start = this._pageSizeForPopUp * (this._pageNumber - 1);
        let end = this._pageSizeForPopUp * this._pageNumber;

        products = this._productsToShow.slice(start, end).map((item) => {
            return item.Id;
        });

        if (products.length > 0) {
            this.getDisplayProducts(products);
        }
    }

    /**
     * BS-708
     *
     * This method will sort all the products from the response
     */
    handleSort() {
        const cloneData = [...this._productsToShow];

        cloneData.sort(sortBy(this._sortName, this._sortDerection === ASCENDING_ORDER ? 1 : -1));
        this._productsToShow = cloneData;
        this.getChunk();
    }

    /**
     * BS-708
     *
     * This method will sort the products from connect API response
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
        this._isLoading = false;
        this.fireOperateLoader(false);
    }

    /**
     * BS-708
     *
     * This method is used to clear out all the selected filters
     */
    handleClearAll() {
        this._isLoading = true;
        let key;
        let categoryKey;
        localStorage.setItem(CLEAR_ALL_FILTER, 'true');
        if (this._currentStore == SH_STORE) {
            key = FILTER_KEY_FOR_VS;
            categoryKey = SELECTED_VS_CATEGORY_KEY;
            localStorage.setItem(REMOVE_ALL, REMOVE_ALL); //BS-1442
        } else if (this._currentStore == EE_STORE) {
            key = FILTER_KEY_FOR_RX;
            categoryKey = SELECTED_RX_CATEGORY_KEY;
        }
        if (key != null && key != undefined) {
            localStorage.removeItem(key); //BS-227 removes the filter data from local storage
        }
        if (categoryKey != null && categoryKey != undefined) {
            localStorage.removeItem(categoryKey);
        }
        this.doRender = true;
        this._productsToShow = [];
        this.triggerGetSortRules();
    }

    /**
     * BS-762
     * This method handles the filters when users remove it from selected filters
     *
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
                    for (let selectedFilterValue of filter) {
                        this._selectedFilters.push(selectedFilterValue);
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
            const filterContainer = this.template.querySelector(FILTER_CONTAINER_COMPONENT);
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
            const breadcrumbComponent = this.template.querySelector(BREADCRUMB_COMPONENT);
            breadcrumbComponent.handleBreadcrumbCategorySelection(breadcrumbEvent);
        }
    }

    /**
     * This method is used to get the information about the fields and other details of the Product object
     * BS-762
     * @private
     */
    @wire(getObjectInfo, { objectApiName: PRODUCT_OBJECT })
    productInfo({ data, error }) {
        if (LANG != LANGUAGE_ENGLISH) {
            this.getTranslationsForCategories();
        }
        if (data) {
            this._productObjectData = data;
        } else if (error) {
            this.error = error;
            console.error('Error:' + JSON.stringify(error));
        }
    }

    /**
     * This method is used to get category translations accoridng to language
     * BS-762
     * @private
     */
    getTranslationsForCategories() {
        //BS-2342
        let currentLanguage = LANG;
        if (currentLanguage == CHINESE_LANG_BY_DEFAULT) {
            currentLanguage = CHINESE_ORIGINAL_LANG;
        } else if (currentLanguage == PORTUGUESE_LANG_DEFAULT) {
            currentLanguage = PORTUGUESE_LANG_ORIGINAL;
        }
        getCategoryTranslations({ language: currentLanguage })
            .then((data) => {
                if (data != null && data != undefined) {
                    this._translatedCategoriesCollection = JSON.parse(JSON.stringify(data));
                }
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                this.fireOperateLoader(false); // Firing event to stop the loader/spinner
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
}
