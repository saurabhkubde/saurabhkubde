import { api, track, wire, LightningElement } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //692
// CONTROLLER METHODS
import getCategoryDetails from '@salesforce/apex/B2B_SearchController.getCategoryDetails';
import getFilters from '@salesforce/apex/B2B_SearchController.getFilters';
import getColorsMetadata from '@salesforce/apex/B2B_SearchController.getColorsMetadata';
import getReorderFilters from '@salesforce/apex/B2B_SearchController.getReorderFilters';

//CUSTOM LABELS
import FILTER_LABELS from '@salesforce/label/c.B2B_PLP_Filters';
import COLOR_FILTER from '@salesforce/label/c.B2B_PLP_ColorFilter_Columns';
import BRAND_LABEL from '@salesforce/label/c.B2B_Brand_Label';
//Colors custom label BS-681
import BLACK_COLOR from '@salesforce/label/c.B2B_Color_Black';
import CREAM_COLOR from '@salesforce/label/c.B2B_Color_Creme';
import GOLD_COLOR from '@salesforce/label/c.B2B_Color_Gold';
import SLIVER_COLOR from '@salesforce/label/c.B2B_Color_Silver';
import GREY_COLOR from '@salesforce/label/c.B2B_Color_Grey';
import BROWN_COLOR from '@salesforce/label/c.B2B_Color_Brown';
import GREEN_COLOR from '@salesforce/label/c.B2B_Color_Green';
import PETROL_COLOR from '@salesforce/label/c.B2B_Color_Petrol';
import BLUE_COLOR from '@salesforce/label/c.B2B_Color_Blue';
import VIOLET_COLOR from '@salesforce/label/c.B2B_Color_Violet';
import ROSE_COLOR from '@salesforce/label/c.B2B_Color_Rose';
import RED_COLOR from '@salesforce/label/c.B2B_Color_Red';
import ORANGE_COLOR from '@salesforce/label/c.B2B_Color_Orange';
import YELLOW_COLOR from '@salesforce/label/c.B2B_Color_Yellow';
import WHITE_COLOR from '@salesforce/label/c.B2B_Color_White';
import TRANSPARENT_COLOR from '@salesforce/label/c.B2B_Color_transparent';
import BICOLOR_COLOR from '@salesforce/label/c.B2B_Color_Bicolor';
import WITHOUT_MIRROR_COLOR from '@salesforce/label/c.B2B_Color_Without_Mirror';
import PURPLE_COLOR from '@salesforce/label/c.B2B_Color_Purple';
import ROSEGOLD_COLOR from '@salesforce/label/c.B2B_Color_Rosegold';
import BRASS_COLOR from '@salesforce/label/c.B2B_Color_Brass'; //BS-681
import EXPAND_COLLAPSE_LABELS from '@salesforce/label/c.B2B_EXPAND_COLLAPSE_LABELS'; //BS-841

// EVENT NAME CONSTANTS
const CLEAR_ALL = 'clearall';
const CATEGORY_SELECTION = 'categoryselection';
const FILTERPRODUCTS = 'filterproductsearch';

//CONSTANTS
const REORDER_PAGE_SOURCE = 'Reorder';
const PLP_PAGE_SOURCE = 'PLP';
const BOTH_SH_EE_BRAND = 'both SH EE';
const EVIL_EYE_FULL = 'evil eye';
const SILHOUETTE_FULL = 'Silhouette';
const SILHOUETTE_BRAND = 'SH';
const NEUBAU_BRAND = 'NB';
const EVIL_EYE_BRAND = 'EE';
const RADIO_BUTTON = 'Radio Button';
const COLOR_RADIO_BUTTON = 'Color Radio Button';
const SLIDER = 'Slider'; //BS-457
const LOADING_EVENT = 'loading';
const SILHOUETTE_STORE = 'silhouette';
const EVIL_EYE_STORE = 'evil-eye';
const NEUBAU_STORE = 'Neubau';
const BOTH_VALUE = 'both';
const URI1 =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxwYXR0ZXJuIGlkPSJiIiBwYXR0ZXJuVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PHVzZSB4bGluazpocmVmPSIjYSIgdHJhbnNmb3JtPSJzY2FsZSguNSkiLz48L3BhdHRlcm4+PGltYWdlIGlkPSJhIiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0NBWUFBQUJYQXZtSEFBQUVHV2xEUTFCclEwZERiMnh2Y2xOd1lXTmxSMlZ1WlhKcFkxSkhRZ0FBT0kyTlZWMW9IRlVVUHJ0elp5TWt6bE5zTklWMHFEOE5KUTJUVmpTaHRMcC8zZDAyYnBaSk50b2k2R1QyN3M2WXljNDRNN3Y5b1U5RlVId3g2cHNVeEwrM2dDQW85US9iUHJRdmxRb2wydFFnS0Q2MCtJTlE2SXVtNjVrN001bHB1ckhlWmU1ODg1M3ZubnZ1dVdmdkJlaTVxbGlXa1JRQkZwcXVMUmN5NG5PSGo0ZzlLNUNFaDZBWEJxRlhVUjByWGFsTUFqWlBDM2UxVzk5RHdudGYyZFhkL3ArdHQwWWRGU0J4SDJLejVxZ0xpSThCOEtkVnkzWUJldnFSSHovcVdoNzJZdWkzTVVERUwzcTQ0V1BYdzNNK2ZvMXBadVFzNHRPSUJWVlRhb2lYRUkvTXhmaEdEUHN4c05aZm9FMXE2NnJvNWFKaW0zWGRvTEZ3NzJIK24yM0JhSVh6YmNPbno1bWZQb1R2WVZ6N0t6VWw1K0ZSeEV1cWtwOUcvQWppYTIxOXRoemcyNWFia1JFL0JwRGMzcHF2cGhIdlJGeXMyd2VxdnAra3JiV0tJWDduaERiekxPSXRpTTgzNThwVHdkaXJxcFBGbk1GMnhMYzFXdkx5T3dUQWlicGJtdkhIY3Z0dFU1N3k1K1hxTlpyTGUzbEUvUHE4ZVVqMmZYS2ZPZTNwZk9qemhKWXRCL3lsbDVTREZjU0RpSCtoUmtIMjUrTCtzZHhLRUFNWmFocmxTWDh1a3FNT1d5L2pYVzJtNk05TERCYzMxQjlMRnV2NmdWS2cvMFN6aTNLQXIxa0dxMUdNalUvYUxibnE2L2xSeGM0WGZKOThoVGFyZ1grK0RiTUpCU2lZTUllOUNrMVlBeEZrS0VBRzN4YllhS21ERGdZeUZLMFVHWXBmb1dZWEcrZkFQUEk2dEpuTndiN0NsUDdJeUYrRCtiak90Q3BraHo2Q0ZySWEvSTZzRnRObDhhdUZYR01UUDM0c053SS9KaGtnRXRtRHoxNHlTZmFSY1RJQklubUtQRTMya3h5eUUyVHYrdGhLYkVWZVBEZlcvYnlNTTFLbW0wWGRPYlM3b0dEL015cE1YRlBYckN3T3RvWWp5eW43QlYyOS9NWmZzVnpwTERkUnR1SVpuYnBYenZsZitldjhNdllyL0dxazRIL2tWL0czY3NkYXpMdXlUTVBzYkZoemQxVWFiUWJqRnZEUm1jV0p4UjN6Y2ZIa1Z3OUdmcGJKbWVldjlGMDhXVzh1RGthc2x3WDZhdmxXR1U2TlJLejBnL1NIdEN5OUozMG8vY2E5elgzS2ZjMTl6bjNCWFFLUk84dWQ0NzdoTG5BZmMxL0c5bXJ6R2xyZmV4WjVHTGRuNlpacnJFb2hJMndWSGhaeXdqYmhVV0V5OGljTUNHTkNVZGlCbHEzcit4YWZMNTQ5SFE1akgrYW4rMXkrTGxZQmlmdXhBdlJOL2xWVlZPbHdsQ2tkVm05Tk9MNUJFNHdrUTJTTWxEWlU5N2hYODZFaWxVL2xVbWtRVXp0VEU2bXgxRUVQaDdPbWRxQnRBdnY4SGRXcGJySlM2dEpqM24wQ1dkTTZidXNOelJWM1M5S1RZaHF2TmlxV211cm9pS2dZaHNoTWptaFRoOXB0V2hzRjc5NzBqL1NiTXJzUEUxc3VSNXo3RE1DK1AvSHMreTdpanJRQWxoeUFnY2NqYmhqUHlnZmVCVGp6aE5xeTI4RWRrVWg4QytEVTkrejJ2L295ZUg3OTFPbmN4SE9zNXkyQXRUYzduYi9mNzNUV1BrRC9xd0Jualg4Qm9KOThWUU5jQys4QUFBQ3pTVVJCVkdnRjdaaEJDc013REFUanZzYi9mNDEvMDlM';
const URI2 =
    'akhzV1FiUU9UbThDUzRoa0xqTmZlKzMwTnZuUE9HaXkvN3E3L212ek1QNjUxQTcrMm9nRU5RQUllSVFnUXAyc0FJNFFGSG05Z2RLLzV3cnI3YmpPdC8zZ0RiZ0RPSUU3WEFFWUlDMmdBQXNUcEdzQUlZUUVOUUlBNGZVM3ZIcjRMWWVaWndCbElIdjFJQTMzbTJWRUR5YU1mYWFEUFBEdHFJSG4wSTkrRitzeXpvek9RUFBxUkJ2ck1zNk1Ha2tjLzBrQ2ZlWGJVUVBMb1J4K1lPeHRMdG4wd2lBQUFBQUJKUlU1RXJrSmdnZz09Ii8+PC9kZWZzPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9InVybCgjYikiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iLjEiLz48L3N2Zz4=';

// for BS-444
const FRAME_COLOR = 'B2B_Frame_Color__c';
const LENS_COLOR = 'B2B_Lens_Color__c';
const MIRROR_COLOR = 'B2B_Mirror_Color__c';
const STYLE_DISPLAY_NONE = 'display: none';
const TRANSPARENT = 'transparent';
const FILTER_KEY = 'selectedFilters'; //BS-227
const URI3 =
    "data:image/svg+xml;charset=utf-8,%3Csvg width='9' height='7' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.438 6.743L.248 4.492A.894.894 0 01.25 3.254a.838.838 0 011.201.002L3.04 4.887 7.55.253a.838.838 0 011.2.002.893.893 0 010 1.238l-5.108 5.25A.84.84 0 013.04 7a.844.844 0 01-.602-.257z'/%3E%3C/svg%3E";
const SH_STORE = 'silhouette'; //BS-692
const RENDER_OPEN_FILTER_KEY = 'isOpenFilterAccordion'; //Added as part of BS-841
const FILTER_GLOBAL_KEY = 'selectedFiltersGlobal'; //BS-1084
const FILTER_FETCH_EVENT = 'filterfetched'; //Added as part of BS-930
const TYPE_KEY = 'typekey'; //Added as part of BS-930
const SELECTED_BORDER = 'border-color: #494949;'; //BS-1529
const BACKGROUND_SIZE = 'background-size:100% !important;'; //BS-1529

export default class B2b_filterContainer extends LightningElement {
    /**
     * Property to decide whether radio button should be visible
     * BS-442
     * @type {string}
     */
    @track
    _showRadioButton = true;

    /**
     * Id of category selected by the user.
     * BS-442
     * @type {string}
     */
    @track
    _selectedCategoryId;

    /**
     * Collection of slider filters to be removed if No matching products avaible.
     * BS-457
     * @type {Array}
     */
    @track
    _sliderFiltersToBeRemoved = [];

    /**
     * Property to indicate whether products are available after filter selection by user on UI
     * BS-457
     * @type {Boolean}
     */
    @track
    _productsAvailable = true;

    /**
     * Collection of products available for current store and category.
     * This collection of products is transfered from b2b_searchResults component
     * BS-442
     * @type {Array}
     */
    @api
    productData;

    /**
     * Page name on which this component is currently embedded (e.g. PLP/Reorder)
     * This page source is transfered from b2b_searchResults component
     * BS-442
     * @type {String}
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

    @api
    categoryData;

    /**
     * Store the colors data for color radio button from custom metadata
     * BS-521
     * @type {String}
     */
    @track
    productColorsList = [];

    /**
     * Stores the product data
     * BS-444
     * @type {String}
     */
    @api
    displayData;

    /**
     * Collection of products available for current store and category.
     * This collection of products is transfered from b2b_searchResultsContainer component
     * BS-442
     * @type {Array}
     */
    @api
    allProductData;

    @api
    previouslySelectedFilter;
    //Custom Labels BS-521
    label = COLOR_FILTER;
    colorLabel = COLOR_FILTER.split(',')[3];
    refreshIcon = STORE_STYLING + '/icons/refresh_icon.svg';
    _isSilhouetteStore = false; //BS-692

    /**
     * Property used to determine whether sub categories of selected category are present
     * BS-442
     * @type {Boolean}
     */
    @track
    _isSubcategoryPresent;

    /**
     * Property used to control component loading spinner
     * BS-442
     * @type {Boolean}
     */
    @track
    _isLoading = false;

    /**
     * Collection of filters to be displayed on UI
     * BS-442
     * @type {Array}
     */
    @track
    _filters = [];

    /**
     * Collection of total filters which are fetched for current category
     * BS-444
     * @type {Array}
     */
    @track
    _totalFilters = [];

    /**
     * Collection of color filters to be displayed on UI
     * BS-521
     * @type {Array}
     */
    @track
    _colorFilters;

    /**
     * Collection of filters vs filter options/values selected by user from UI.
     * This map will further used to segragate the products which are matching filter options/values selected by user
     * BS-442
     * @type {Map}
     */
    @api
    dynamicProductSearch = new Map();

    /**
     * Collection of category data
     * BS-442
     * @type {Array}
     */
    _categoryDetails = [];

    /**
     * Property to store current webStore name
     * BS-442
     * @type {String}
     */
    _currentStore;

    /**
     * Collection of all filter preference setting records
     * BS-442
     * @type {Array}
     */
    _globalFilters = [];

    /**
     * Utility Collection to  store processed filters information
     * BS-442
     * @type {Array}
     */
    _currentFilters = [];

    /**
     * Property to store name of category selected by user
     * BS-442
     * @type {String}
     */
    _categoryName;

    /**
     * Property to store Id of category selected by user
     * BS-442
     * @type {String}
     */
    _currentCategoryId;

    /**
     * Property to store current category path
     * BS-442
     * @type {Array}
     */
    @track
    _categoryPath;

    /**
     * Property to store open sections of accordian
     * BS-442
     * @type {Array}
     */
    _sections;

    /**
     * Name of filters having open sections of accordian
     * BS-442
     * @type {String}
     */
    @track
    _openSectionFilterName;

    /**
     * Collection of all filters Name to be displayed on UI
     * BS-521
     * @type {Array}
     */
    @track
    _showAllAccordionOpen = [];

    /**
     * Collection of all filters Name to be displayed on UI
     * BS-227 to persist filter on load
     */
    _doPersistFilterOnLoad = false;

    doRender = false;

    //To show or hide color radio button on UI
    _showColorRadioButton = false;

    // Color filter transparent image
    transparentUri;
    customMetadataColors = new Map();
    showBrandPicklist = false;
    @track reorderFiltersArray = [];
    @track reorderSHArray = [];
    @track reorderEEArray = [];
    @track currentStore;
    iterator = 1;
    previousSelectedBrandValue;
    brandLabel = BRAND_LABEL;
    @track reorderPageSelectedBrand;
    _colorVsColorLabelMap = new Map(); //BS-681

    /**
     * Property to set if color filter accordion should be open or collapsed
     * BS-841
     * @type {Boolean}
     */
    _openFilterAccordions = true;

    /**
     * Label to control the collapse of Color filters
     * BS-841
     * @type {String}
     */
    activeColorLabel = COLOR_FILTER.split(',')[3];

    /**
     * Name of the Icon to show for expand and collapse.
     * By default on load of PLP show collapse icon unless user clicks on it.
     * BS-841
     * @type {String}
     */
    _filterIcon;

    /**
     * Label to show for expand and collapse.
     * BS-841
     * @type {String}
     */
    _filterExpandCollapseLabel = EXPAND_COLLAPSE_LABELS.split(',')[0];

    /**
     * List of radio button to open once all filters have been collapsed and then opened to select filters
     * BS-841
     * @type {List}
     */
    @track
    _filtersToOpenList = [];

    /**
     * Boolean to control the open of Color Filters
     * BS-841
     * @type {Boolean}
     */
    _expandColorFilter = false;

    /**
     * Boolean to control the open of Category Filters
     * BS-841
     * @type {Boolean}
     */
    _expandCategoryFilter = false;

    /**
     * Flag to switch visibility of brand filter option
     * BS-955
     * @type {Boolean}
     */
    @api
    renderBrandFilters;

    /**
     * Flag to switch visibility of evil eye brand filter option
     * BS-955
     * @type {Boolean}
     */
    @api
    renderSilhouetteBrandFilter;

    /**
     * Flag to switch visibility of silhouette brand filter option
     * BS-955
     * @type {Boolean}
     */
    @api
    renderEvilEyeBrandFilter;

    /**
     * Static resource URL for collapse icon
     * BS-841
     * @type {URL}
     */
    get expandedIcon() {
        return STORE_STYLING + '/icons/up-arrow-icon.svg';
    }

    /**
     * Static resource URL for expand icon
     * BS-841
     * @type {URL}
     */
    get collapsedIcon() {
        return STORE_STYLING + '/icons/down-arrow-icon.svg';
    }

    /**
     * Boolean to control the open of Silter Filters
     * BS-841
     * @type {Boolean}
     */
    _showSliderButton = false;

    /**
     * Collection of slider filters to be removed if No matching products avaible.
     * BS-930
     * @type {Array}
     */
    @track
    _multiSelectFilterFields = [];

    /**
     * Collection of products available for current store and category.
     * This collection of products is transfered from b2b_searchResultsContainer component
     * BS-442
     * @type {Array}
     */
    @api
    globalProductData;

    /**
     *  Map to store filter field and its filterType
     *
     * @type {string}
     */
    _filterSourceFieldVsFilterType = new Map();

    /**
     * Collection of filters vs filter options/values selected by user from UI to filter global products.
     * BS-930
     * @type {Map}
     */
    @track
    _globalDynamicProductSearch = new Map();

    /**
     * Variable to store count to filter the products
     * BS-930
     * @type {Integer}
     */
    _counter = 0;

    /* Start : BS-1529 */
    _bicolorImage = STORE_STYLING + '/icons/color-wheel.svg';
    _selectedBicolorImage = STORE_STYLING + '/icons/color-wheel-select.svg';
    /* End : BS-1529 */
    /**
     * BS-442
     * Method is used to get current page reference and URL parameters
     */
    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        try {
            if (this.pageSource === REORDER_PAGE_SOURCE) {
                this.triggerMetadataRetrieve();
                if (this.storeName === SILHOUETTE_BRAND) {
                    this.showBrandPicklist = true;
                    this.currentStore = BOTH_SH_EE_BRAND;
                } else if (this.storeName === NEUBAU_BRAND) {
                    this.currentStore = NEUBAU_BRAND;
                }
                this.triggerGetReorderFilters(); //method call to get the filters for re-order Component
            } else {
                this.doRender = false;
                this._currentCategoryId = pageRef.attributes.recordId;
                this._categoryPath = pageRef.state.categoryPath;
                //below if statement assign category id for global search results when products belongs to only one category
                if ((this._currentCategoryId == undefined || this._currentCategoryId == null) && this.categoryData.length == 1) {
                    this._currentCategoryId = this.categoryData[0].categoryId;
                }
                if (this._currentCategoryId) {
                    this._categoryName = '';
                    this.currentStore = '';
                    this.getAvailableCategoryDetails(this._currentCategoryId); //method call to get the category details based On categoryId
                } else {
                    //this block will get all the filters for PLP based on store irrespective of category
                    if (this.storeName === SILHOUETTE_BRAND) {
                        this.currentStore = BOTH_SH_EE_BRAND;
                    } else if (this.storeName === NEUBAU_BRAND) {
                        this.currentStore = NEUBAU_BRAND;
                    }
                    this.triggerMetadataRetrieve(); //method call to retrieve colors metadata
                    this.getAllPLPFilters(); //method call to retrieve all PLP filters
                }
            }
        } catch (exceptionInstance) {
            console.error(exceptionInstance);
        }
    }

    /**
     * BS-442
     * Method is used to fetch category information via apex imperative call
     * @param categoryId : Id of category selected by user
     */
    @api
    getAvailableCategoryDetails(currentCategoryId) {
        this._isLoading = true;
        getCategoryDetails({ categoryId: currentCategoryId })
            .then((data) => {
                this._categoryDetails = data;
                for (var category in this._categoryDetails) {
                    this._categoryName = this._categoryDetails[category].Name;
                }

                // to assign store name based on category path got from URL
                if (this._categoryPath) {
                    if (this.storeName == SILHOUETTE_BRAND && this._categoryPath.includes(EVIL_EYE_STORE)) {
                        this.currentStore = EVIL_EYE_BRAND;
                    } else if (this.storeName == SILHOUETTE_BRAND) {
                        this.currentStore = SILHOUETTE_BRAND;
                    } else if (this.storeName == NEUBAU_BRAND) {
                        this.currentStore = NEUBAU_BRAND;
                    }
                } else {
                    //to assign store name based on category name for global search
                    if (this.storeName == SILHOUETTE_BRAND && this._categoryName == SILHOUETTE_FULL) {
                        this.currentStore = SILHOUETTE_BRAND;
                    } else if (this._categoryName == EVIL_EYE_FULL) {
                        this.currentStore = EVIL_EYE_BRAND;
                    } else if (this.storeName == NEUBAU_BRAND) {
                        this.currentStore = NEUBAU_BRAND;
                    } else {
                        this.currentStore = SILHOUETTE_BRAND;
                    }
                }

                this.getAvailableFilters(); // method call to fetch the filters based on category name and store name
                this.triggerMetadataRetrieve(); // method call to get the color metadata
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    /**
     * BS-442
     * Method is used to fetch all filter preference setting records.
     * @param categoryName : Name of category selected by user
     * @param storeName : Name of web store in which user is currently logged in
     */
    getAvailableFilters() {
        getFilters({ categoryName: this._categoryName, storeName: this.currentStore })
            .then((data) => {
                this._isLoading = true;
                let resultArray = [];
                this._filters = [];
                this._globalFilters = [];
                let availableFilters = [];
                let availableColorFilters = [];
                if (data != null || data != undefined) {
                    let filterJSON = {}; //BS-930 : {key : fieldName, value : Filter Tye}
                    let filterJSONList = []; //BS-930 : List to store all filterJSON objects
                    resultArray = data;
                    this._globalFilters = data;

                    /*
                     * Dispatching the event to send data to parent component
                     * Storing the type in local storage in encoded format
                     * Start BS-930
                     */
                    this.dispatchEvent(
                        new CustomEvent(FILTER_FETCH_EVENT, {
                            detail: {
                                resultArray
                            }
                        })
                    );
                    for (let index = 0; index < resultArray.length; index++) {
                        this._filterSourceFieldVsFilterType.set(resultArray[index].availableFilters.sourceProductField, {
                            filterType: resultArray[index].availableFilters.filterType,
                            isMultiselect: resultArray[index].availableFilters.isMultiselect
                        });
                        let field = resultArray[index].availableFilters.sourceProductField;
                        let filterTypeValue = resultArray[index].availableFilters.filterType;
                        let multiselectBoolean = resultArray[index].availableFilters.isMultiselect;
                        filterJSON = { key: field, filterType: filterTypeValue, isMultiselect: multiselectBoolean };
                        filterJSONList.push(filterJSON);
                    }
                    /*
                     * Loop to populate List having all multiselect filter fields.
                     */
                    for (let index = 0; index < this._globalFilters.length; index++) {
                        if (
                            this._globalFilters[index].availableFilters !== undefined &&
                            this._globalFilters[index].availableFilters.filterType !== undefined &&
                            this._globalFilters[index].availableFilters.isMultiselect !== undefined &&
                            this._globalFilters[index].availableFilters.filterType === RADIO_BUTTON &&
                            this._globalFilters[index].availableFilters.isMultiselect === true
                        ) {
                            this._multiSelectFilterFields.push(this._globalFilters[index].availableFilters.sourceProductField);
                        }
                    }
                    localStorage.setItem(TYPE_KEY, btoa(unescape(encodeURIComponent(JSON.stringify(filterJSONList)))));
                    /* End BS-930 */

                    for (var filter in resultArray) {
                        if (this.pageSource === REORDER_PAGE_SOURCE && this._globalFilters[filter].availableFilters.sourceProductField) {
                            this._showRadioButton = false;
                            this._showSliderButton = false;
                            this._showAllAccordionOpen.push(this._globalFilters[filter].availableFilters.sourceProductField);
                        }
                        if (
                            resultArray[filter].placementList.includes(this.pageSource) &&
                            resultArray[filter].availableFilters.controllingParametersList.length < 1 &&
                            resultArray[filter].availableFilters.isColorRadioButtonType
                        ) {
                            availableColorFilters.push(resultArray[filter]);
                        } else if (
                            resultArray[filter].placementList.includes(this.pageSource) &&
                            resultArray[filter].availableFilters.controllingParametersList.length < 1
                        ) {
                            availableFilters.push(resultArray[filter]);
                        }
                    }

                    this._totalFilters = availableFilters; // this will store all the filters to show On UI for the category
                    if (availableColorFilters.length > 0) {
                        this._colorFilters = availableColorFilters; // this will store color filters to show on UI for the category
                    } else {
                        // when no color filters present these variables get set to false
                        this._colorFilters = false;
                        this._showColorRadioButton = false;
                    }
                    this.updateFilters(); //BS-444 : this will add product count for each filter value and remove the filters who do not have any related product present
                } else {
                    this._colorFilters = false;
                    this._showColorRadioButton = false;
                    this._isLoading = false;
                }
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    /**
     * BS-442
     *
     * Get The labels used in the template.
     */
    get labels() {
        return {
            filterLabel: FILTER_LABELS.split(',')[0],
            clearAllLabel: FILTER_LABELS.split(',')[1],
            brandLabel: BRAND_LABEL
        };
    }

    /**
     * BS-442
     *
     * handler for event fired when user clicks 'Clear All' on UI
     */
    handleClearAll(event) {
        this._filtersToOpenList = []; //Added as part of BS-841
        this._isLoading = true;
        let clearAll = true;
        localStorage.removeItem(FILTER_KEY); //BS-227 removes the filter data from local storage
        localStorage.removeItem(FILTER_GLOBAL_KEY); //BS-1084 removes the filter data from local storage
        this.doRender = true;
        this.dispatchEvent(
            new CustomEvent(CLEAR_ALL, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    clearAll
                }
            })
        );
        this._isLoading = false;
    }

    /**
     * Returns true if PLP page
     */
    get isPLPPage() {
        if (this.pageSource === PLP_PAGE_SOURCE) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * BS-442
     *
     * handler for event fired from child to control component loading
     */
    handleLoadEvent(evt) {
        this._isLoading = evt.detail.isLoading;
    }

    /**
     * BS-442
     *
     * This lifecycle hook fires when this component is loaded into the DOM
     */
    connectedCallback() {
        /* Start BS-841 */
        if (this.pageSource === PLP_PAGE_SOURCE) {
            if (localStorage.getItem(RENDER_OPEN_FILTER_KEY)) {
                if (localStorage.getItem(RENDER_OPEN_FILTER_KEY) == 'true') {
                    this._openFilterAccordions = true;
                    this._filterIcon = this.collapsedIcon;
                    this._filterExpandCollapseLabel = EXPAND_COLLAPSE_LABELS.split(',')[1];
                } else {
                    this._openFilterAccordions = false;
                    this._filterIcon = this.expandedIcon;
                    this._filterExpandCollapseLabel = EXPAND_COLLAPSE_LABELS.split(',')[0];
                }
            } else {
                this._filterIcon = this.collapsedIcon;
                localStorage.setItem(RENDER_OPEN_FILTER_KEY, this._openFilterAccordions);
            }
        }
        //BS-2353
        else {
            this._filterIcon = this.collapsedIcon;
        }
        /* End BS-841 */

        this._isLoading = true;
        this._doPersistFilterOnLoad = true; //BS-227
        this.transparentUri = URI1 + URI2;
        if (this.storeName == NEUBAU_BRAND) {
            this.reorderPageSelectedBrand = undefined;
        } else {
            this.reorderPageSelectedBrand = BOTH_VALUE;
        }
        //BS-227 to initialize the filter map when component gets loaded
        if (this.previouslySelectedFilter != undefined && this.previouslySelectedFilter != null) {
            this.dynamicProductSearch = this.previouslySelectedFilter;
        }
        let currentUrl = window.location.href.split('/s/'); //BS-692
        let currentStore = currentUrl[0].split('/');

        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }

        //BS-681 color labels to show on UI
        this._colorVsColorLabelMap.set(CREAM_COLOR.split(',')[0], CREAM_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(GOLD_COLOR.split(',')[0], GOLD_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(SLIVER_COLOR.split(',')[0], SLIVER_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(GREY_COLOR.split(',')[0], GREY_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(BROWN_COLOR.split(',')[0], BROWN_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(GREEN_COLOR.split(',')[0], GREEN_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(PETROL_COLOR.split(',')[0], PETROL_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(BLUE_COLOR.split(',')[0], BLUE_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(VIOLET_COLOR.split(',')[0], VIOLET_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(ROSE_COLOR.split(',')[0], ROSE_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(RED_COLOR.split(',')[0], RED_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(ORANGE_COLOR.split(',')[0], ORANGE_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(YELLOW_COLOR.split(',')[0], YELLOW_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(WHITE_COLOR.split(',')[0], WHITE_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(TRANSPARENT_COLOR.split(',')[0], TRANSPARENT_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(BLACK_COLOR.split(',')[0], BLACK_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(BICOLOR_COLOR.split(',')[0], BICOLOR_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(WITHOUT_MIRROR_COLOR.split(',')[0], WITHOUT_MIRROR_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(PURPLE_COLOR.split(',')[0], PURPLE_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(ROSEGOLD_COLOR.split(',')[0], ROSEGOLD_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(BRASS_COLOR.split(',')[0], BRASS_COLOR.split(',')[1]); //BS-681 end
    }

    /**
     * BS-444
     *
     * this will check if subcategories are present for loaded data
     */
    renderedCallback() {
        if (this.categoryData != null) {
            this._isSubcategoryPresent = true;
        } else {
            this._isSubcategoryPresent = false;
        }
    }

    /**
     * Gets the colors used into the color filter from the custom metadata records.
     * BS-521
     * @private
     */
    triggerMetadataRetrieve() {
        getColorsMetadata({})
            .then((result) => {
                this.customMetadataColors = new Map(Object.entries(JSON.parse(result)));
                this.updateProductColor(); //method call to keep or remove color filters based on product value
            })
            .catch((error) => {
                this.error = error;
                console.log('Error:' + JSON.stringify(error));
            });
    }

    /**
     * BS-444
     *
     * this method will keep or remove colors for filters based
     * on available product fields and field values.
     */
    @api
    updateProductColor() {
        let colorsMap = [
            { Name: this.label.split(',')[0], apiName: FRAME_COLOR, colorsList: [], filterClicked: false, displayColor: false },
            { Name: this.label.split(',')[1], apiName: LENS_COLOR, colorsList: [], filterClicked: false, displayColor: false },
            { Name: this.label.split(',')[2], apiName: MIRROR_COLOR, colorsList: [], filterClicked: false, displayColor: false }
        ];
        for (let element of this.customMetadataColors.values()) {
            let backgroundStyle = STYLE_DISPLAY_NONE;
            colorsMap.forEach((color) => {
                color.colorsList.push({
                    colorName: element.Label,
                    colorHex: element.B2B_Color_code__c,
                    colorStyle: backgroundStyle,
                    transparent: element.B2B_Color_name__c == TRANSPARENT ? true : false,
                    colorClicked: false,
                    colorLabel:
                        this._colorVsColorLabelMap.has(element.B2B_Color_name__c) == true ? this._colorVsColorLabelMap.get(element.B2B_Color_name__c) : '' //BS-681
                });
            });
        }
        let colorExists = false;

        //To handle filters on Reorder page added as part of BS-443
        if (this.pageSource == REORDER_PAGE_SOURCE) {
            if (this.allProductData != null) {
                this.allProductData.products.forEach((element) => {
                    if (element.B2B_Frame_Color__c != null) {
                        colorExists = true;
                        colorsMap[0].displayColor = true;
                        colorsMap[0].colorsList.forEach((color) => {
                            if (color.colorName == element.B2B_Frame_Color__c) {
                                /* Start : BS-1529 */
                                if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                                    color.colorStyle = 'background: url(' + this._bicolorImage + ')';
                                } else {
                                    if (color.transparent) {
                                        color.colorStyle = 'background: url(' + this.transparentUri + ')';
                                    } else {
                                        color.colorStyle = 'background: ' + color.colorHex;
                                    }
                                }
                                /* End : BS-1529 */
                            }
                        });
                    }
                    if (element.B2B_Lens_Color__c != null) {
                        colorExists = true;
                        colorsMap[1].displayColor = true;
                        colorsMap[1].colorsList.forEach((color) => {
                            if (color.colorName == element.B2B_Lens_Color__c) {
                                /* Start : BS-1529 */
                                if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                                    color.colorStyle = 'background: url(' + this._bicolorImage + ')';
                                } else {
                                    if (color.transparent) {
                                        color.colorStyle = 'background: url(' + this.transparentUri + ')';
                                    } else {
                                        color.colorStyle = 'background: ' + color.colorHex;
                                    }
                                }
                                /* End : BS-1529 */
                            }
                        });
                    }
                    if (element.B2B_Mirror_Color__c != null) {
                        colorExists = true;
                        colorsMap[2].displayColor = true;
                        colorsMap[2].colorsList.forEach((color) => {
                            if (color.colorName == element.B2B_Mirror_Color__c) {
                                /* Start : BS-1529 */
                                if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                                    color.colorStyle = 'background: url(' + this._bicolorImage + ')';
                                } else {
                                    if (color.transparent) {
                                        color.colorStyle = 'background: url(' + this.transparentUri + ')';
                                    } else {
                                        color.colorStyle = 'background: ' + color.colorHex;
                                    }
                                }
                                /* End : BS-1529 */
                            }
                        });
                    }
                });
            }
        } else if (this.pageSource == PLP_PAGE_SOURCE) {
            //this will refine the color metadata based on product field values
            this.allProductData.forEach((element) => {
                if (element.B2B_Frame_Color__c != null) {
                    colorExists = true;
                    colorsMap[0].displayColor = true;
                    colorsMap[0].colorsList.forEach((color) => {
                        if (color.colorName == element.B2B_Frame_Color__c) {
                            /* Start : BS-1529 */
                            if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                                color.colorStyle = 'background: url(' + this._bicolorImage + ')';
                            } else {
                                if (color.transparent) {
                                    color.colorStyle = 'background: url(' + this.transparentUri + ')';
                                } else {
                                    color.colorStyle = 'background: ' + color.colorHex;
                                }
                            }
                            /* End : BS-1529 */
                        }
                    });
                }

                if (element.B2B_Lens_Color__c != null) {
                    colorExists = true;
                    colorsMap[1].displayColor = true;
                    colorsMap[1].colorsList.forEach((color) => {
                        if (color.colorName == element.B2B_Lens_Color__c) {
                            /* Start : BS-1529 */
                            if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                                color.colorStyle = 'background: url(' + this._bicolorImage + ')';
                            } else {
                                if (color.transparent) {
                                    color.colorStyle = 'background: url(' + this.transparentUri + ')';
                                } else {
                                    color.colorStyle = 'background: ' + color.colorHex;
                                }
                            }
                            /* End : BS-1529 */
                        }
                    });
                }

                if (element.B2B_Mirror_Color__c != null) {
                    colorExists = true;
                    colorsMap[2].displayColor = true;
                    colorsMap[2].colorsList.forEach((color) => {
                        if (color.colorName == element.B2B_Mirror_Color__c) {
                            /* Start : BS-1529 */
                            if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                                color.colorStyle = 'background: url(' + this._bicolorImage + ')';
                            } else {
                                if (color.transparent) {
                                    color.colorStyle = 'background: url(' + this.transparentUri + ')';
                                } else {
                                    color.colorStyle = 'background: ' + color.colorHex;
                                }
                            }
                            /* End : BS-1529 */
                        }
                    });
                }
            });
        }
        if (colorExists && this.productColorsList.length == 0) {
            this.productColorsList = colorsMap;
        } else if (this.productColorsList.length == 0) {
            this.productColorsList = [];
        }
    }

    /**
     * BS-442
     *
     * handler for event fired from child when user selectes any filter value/option
     */
    @api //BS-730
    handleSelection(event) {
        /* Start BS-955 */
        if (this.pageSource === REORDER_PAGE_SOURCE) {
            this._showRadioButton = false;
            this._showSliderButton = false;
            this._isLoading = true;
        } else if (this.pageSource === PLP_PAGE_SOURCE) {
            this._showRadioButton = false;
            this._showColorRadioButton = false;
        }
        /* End BS-955 */
        let filterType = event.detail.filterType;
        let field = event.detail.field;
        let selectedValue = event.detail.value;
        let multiselectEnabled = event.detail.isMultiselect;
        /* Start BS-841 */
        if (this.pageSource === PLP_PAGE_SOURCE) {
            if (
                event.detail.fieldName !== undefined &&
                event.detail.fieldName !== null &&
                //BS-930 : Handling of opening and closing of filter accordions for multiselect filters as well
                (event.detail.filterType === RADIO_BUTTON || event.detail.filterType === SLIDER) &&
                this._filtersToOpenList.includes(event.detail.fieldName) === false
            ) {
                this._filtersToOpenList.push(event.detail.fieldName);
                if (event.detail.filterType === RADIO_BUTTON) {
                    this._showRadioButton = false;
                    this._showSliderButton = false;
                }
            } else if (event.detail.filterType === COLOR_RADIO_BUTTON) {
                this._expandColorFilter = true;
                this.activeColorLabel = COLOR_FILTER.split(',')[3];
            }
        }
        /* End BS-841 */

        this._isLoading = true;
        if (event.detail.value == BOTH_VALUE) {
            this.currentStore = BOTH_SH_EE_BRAND;
            this.triggerGetReorderFilters(); // when user uncheck the brand filter then this method will get called to get all Re-order filters
        }

        //BS-443
        if (this.pageSource == REORDER_PAGE_SOURCE && field == 'B2B_Brand__c') {
            this.dynamicProductSearch = new Map();
            //based on the selected brand the re-order filters get re-fetched
            if (selectedValue == EVIL_EYE_FULL) {
                this.currentStore = EVIL_EYE_BRAND;
                this.triggerGetReorderFilters();
            } else if (selectedValue == SILHOUETTE_FULL) {
                this.currentStore = SILHOUETTE_BRAND;
                this.triggerGetReorderFilters();
            }
            if (this.productColorsList) {
                this.productColorsList.forEach((element) => {
                    element.filterClicked = false;
                    element.colorsList.forEach((color) => {
                        /* Start : BS-1529 */
                        if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                            color.colorStyle = 'background: url(' + this._bicolorImage + ');';
                        } else {
                            if (color.transparent) {
                                color.colorStyle = 'background: url(' + this.transparentUri + ')';
                            } else {
                                color.colorStyle = 'display: none';
                            }
                        }
                        /* End : BS-1529 */
                        color.colorClicked = false;
                    });
                });
            }
        }

        if (filterType == SLIDER) {
            let availableFilters = [];
            let parsedFilters = JSON.parse(JSON.stringify(this._totalFilters));
            let doProductSearch = event.detail.doProductSearch;
            let removeFilter = false;
            if (event.detail.removeFilter != undefined) {
                //BS-730 when slider filters gets clicked from selected filter
                removeFilter = true;
            }
            if (removeFilter == false) {
                //Preparing map for filtering the products according to slider values and slider filter if doProductSearch is true
                if (doProductSearch != null && doProductSearch != undefined && doProductSearch == true) {
                    //Logic to include controlled filters if matching the controlling criteria
                    for (var filter in this._globalFilters) {
                        //Checking whether any controlled filter is present for current slider filter selected by comparing source product field
                        if (this._globalFilters[filter].availableFilters.controllingParametersList.includes(field)) {
                            //Checking whether any controlled filter's value is falling inside the sliders selected values range
                            this._globalFilters[filter].availableFilters.controllingParametersList.forEach((controllingValue) => {
                                if (
                                    controllingValue >= selectedValue.sliderOneValue &&
                                    controllingValue <= selectedValue.sliderTwoValue &&
                                    this._currentFilters.includes(this._globalFilters[filter]) == false
                                ) {
                                    //If controlled filter values are matching the criteria then pushing controlled filters in filter collection
                                    this._totalFilters.push(this._globalFilters[filter]);
                                    this._currentFilters.push(this._globalFilters[filter]);
                                }
                            });
                        }
                        //Checking whether any controlled filter that is currently displayed on UI that should be removed as its controlling filters values are changed
                        if (this._globalFilters[filter].availableFilters.controllingParametersList.includes(field)) {
                            this._globalFilters[filter].availableFilters.controllingParametersList.forEach((controllingValue) => {
                                if (
                                    controllingValue >= selectedValue.sliderOneValue &&
                                    controllingValue > selectedValue.sliderTwoValue &&
                                    this._currentFilters.includes(this._globalFilters[filter])
                                ) {
                                    if (this._sliderFiltersToBeRemoved.length > 0) {
                                        for (var removableFilter in this._sliderFiltersToBeRemoved) {
                                            if (
                                                this._sliderFiltersToBeRemoved[removableFilter].availableFilters.sourceProductField !=
                                                this._globalFilters[filter].availableFilters.sourceProductField
                                            ) {
                                                // If filter values are not matching the criteria then removing controlled filters from filter collection
                                                this._sliderFiltersToBeRemoved.push(this._globalFilters[filter]);
                                            }
                                        }
                                    } else {
                                        this._sliderFiltersToBeRemoved.push(this._globalFilters[filter]);
                                    }
                                }
                            });
                        }
                    }

                    //Removing the controlled filters if controlling filter value is not meeting the criteria
                    if (this._sliderFiltersToBeRemoved.length > 0) {
                        for (var filterOptions in parsedFilters) {
                            for (var removableFilter in this._sliderFiltersToBeRemoved) {
                                if (
                                    (parsedFilters[filterOptions].availableFilters.sourceProductField ==
                                        this._sliderFiltersToBeRemoved[removableFilter].availableFilters.sourceProductField) ==
                                    false
                                ) {
                                    availableFilters.push(parsedFilters[filterOptions]);
                                } else {
                                    this._currentFilters.splice(parsedFilters[filterOptions]);
                                    this._sliderFiltersToBeRemoved.splice(parsedFilters[filterOptions]);
                                }
                            }
                        }
                        this._totalFilters = availableFilters;
                    }
                    //Preparing the map with slider filter source product field and slider values
                    this.dynamicProductSearch.set(field, JSON.parse(JSON.stringify(selectedValue)));

                    //Invoking fireFilterProductSearch with above prepared collection that contains filter and filter values
                    this._isLoading = false;
                    this.fireFilterProductSearch(this.dynamicProductSearch);
                } else if (doProductSearch != null && doProductSearch != undefined && doProductSearch == false) {
                    // Preserving the slider values in filter collection if doProductSearch is false
                    let currentFilters = JSON.parse(JSON.stringify(this._filters));
                    //below code will update the selected slider bubble placement on UI
                    currentFilters.forEach((options) => {
                        if (options.availableFilters.sourceProductField == field) {
                            options.availableFilters.sliderSelectedLeftValue = selectedValue.sliderOneValue;
                            options.availableFilters.sliderSelectedRightValue = selectedValue.sliderTwoValue;
                        }
                    });
                    //below code will update the slider filter value for future reference
                    this._totalFilters.forEach((options) => {
                        if (options.availableFilters.sourceProductField == field) {
                            options.availableFilters.sliderSelectedLeftValue = selectedValue.sliderOneValue;
                            options.availableFilters.sliderSelectedRightValue = selectedValue.sliderTwoValue;
                        }
                    });
                    this._isLoading = false;
                    this._filters = currentFilters;
                }
            } else {
                //BS-730 logic to remove slider filter and adjust placement for the slider bubbles
                let leftValue;
                let rightValue;
                for (var filter in this._globalFilters) {
                    if (this._globalFilters[filter].availableFilters.sourceProductField == field) {
                        leftValue = this._globalFilters[filter].availableFilters.sliderMinimumValue;
                        rightValue = this._globalFilters[filter].availableFilters.sliderMaximumValue;
                    }
                }

                //below code will reset slider values to its previous position to reflect on UI
                this._filters.forEach((options) => {
                    if (options.availableFilters.sourceProductField == field) {
                        options.availableFilters.sliderSelectedLeftValue = leftValue;
                        options.availableFilters.sliderSelectedRightValue = rightValue;
                    }
                });
                //below code will reset slider values to its previous position for future reference
                this._totalFilters.forEach((options) => {
                    if (options.availableFilters.sourceProductField == field) {
                        options.availableFilters.sliderSelectedLeftValue = leftValue;
                        options.availableFilters.sliderSelectedRightValue = rightValue;
                    }
                });
                this.dynamicProductSearch.delete(field);
                this.fireFilterProductSearch(this.dynamicProductSearch);
            }

            //BS-457 - End
        } else if (filterType != SLIDER) {
            const checked = event.detail.checked != undefined ? event.detail.checked : null;
            const filterType = event.detail.filterType;
            let conditionalFilters = this._totalFilters;

            for (var filter in this._globalFilters) {
                //logic to add new filters based on controlling field parameters
                if (this._globalFilters[filter].availableFilters.sourceProductField == field) {
                    this._openSectionFilterName = this._globalFilters[filter].availableFilters.sourceProductField;
                }
                if (
                    this._globalFilters[filter].availableFilters.controllingParametersList.includes(field) &&
                    this._globalFilters[filter].availableFilters.controllingParametersList.includes(selectedValue)
                ) {
                    if (
                        this.pageSource !== REORDER_PAGE_SOURCE &&
                        conditionalFilters[filter].masterLabel !== this._globalFilters[filter].availableFilters.masterLabel &&
                        this._currentFilters.includes(this._globalFilters[filter]) == false
                    ) {
                        this._totalFilters.push(this._globalFilters[filter]);
                        this._currentFilters.push(this._globalFilters[filter]);

                        this._totalFilters.sort((firstFilter, secondFilter) => {
                            if (firstFilter.availableFilters.filterOrder === null || firstFilter.availableFilters.filterOrder === undefined) {
                                return 1;
                            }
                            if (secondFilter.availableFilters.filterOrder === null || secondFilter.availableFilters.filterOrder === undefined) {
                                return -1;
                            }
                            if (firstFilter === secondFilter) {
                                return 0;
                            }
                            return firstFilter.availableFilters.filterOrder < secondFilter.availableFilters.filterOrder ? -1 : 1;
                        });
                    }
                    if (this.pageSource === REORDER_PAGE_SOURCE && this._currentFilters.includes(this._globalFilters[filter]) == false) {
                        this._totalFilters.push(this._globalFilters[filter]);
                        this._currentFilters.push(this._globalFilters[filter]);

                        this._totalFilters.sort((firstFilter, secondFilter) => {
                            if (firstFilter.availableFilters.filterOrder === null || firstFilter.availableFilters.filterOrder === undefined) {
                                return 1;
                            }
                            if (secondFilter.availableFilters.filterOrder === null || secondFilter.availableFilters.filterOrder === undefined) {
                                return -1;
                            }
                            if (firstFilter === secondFilter) {
                                return 0;
                            }
                            return firstFilter.availableFilters.filterOrder < secondFilter.availableFilters.filterOrder ? -1 : 1;
                        });
                    }
                }
            }

            if (filterType == RADIO_BUTTON && multiselectEnabled === false) {
                if (checked) {
                    //logic to add new filters based on controlling field parameters for radio button
                    let availableFilters = [];
                    let parsedFilters = JSON.parse(JSON.stringify(this._totalFilters));
                    let filtersToRemove = [];
                    parsedFilters.forEach((options) => {
                        if (options.availableFilters.sourceProductField == field) {
                            options.availableFilters.filterValues.picklistValues.forEach((picklistSet) => {
                                if (picklistSet.apiName == selectedValue) {
                                    //BS-821
                                    if (picklistSet.isValueChecked === false) {
                                        picklistSet.isValueChecked = true;
                                        for (var filter in this._globalFilters) {
                                            if (
                                                this._globalFilters[filter].availableFilters.controllingParametersList.includes(field) &&
                                                this._globalFilters[filter].availableFilters.controllingParametersList.includes(selectedValue) == false
                                            ) {
                                                filtersToRemove.push(this._globalFilters[filter]);
                                            }
                                        }
                                    } else {
                                        picklistSet.isValueChecked = false;

                                        for (var filter in this._globalFilters) {
                                            if (
                                                this._globalFilters[filter].availableFilters.controllingParametersList.includes(field) &&
                                                this._globalFilters[filter].availableFilters.controllingParametersList.includes(selectedValue)
                                            ) {
                                                filtersToRemove.push(this._globalFilters[filter]);
                                                if (this.dynamicProductSearch.has(this._globalFilters[filter].availableFilters.sourceProductField)) {
                                                    this.dynamicProductSearch.delete(this._globalFilters[filter].availableFilters.sourceProductField);
                                                }
                                            } else if (
                                                this._globalFilters[filter].availableFilters.controllingParametersList.includes(field) &&
                                                this._globalFilters[filter].availableFilters.controllingParametersList.includes(selectedValue) == false
                                            ) {
                                                filtersToRemove.push(this._globalFilters[filter]);
                                            }
                                        }
                                    }
                                } else {
                                    picklistSet.isValueChecked = false;
                                }
                            });
                        }
                    });

                    //logic to remove filters if the controlling field filter is unchecked
                    if (filtersToRemove.length > 0) {
                        for (var filterOptions in parsedFilters) {
                            for (var removableFilter in filtersToRemove) {
                                if (
                                    (parsedFilters[filterOptions].availableFilters.sourceProductField ==
                                        filtersToRemove[removableFilter].availableFilters.sourceProductField) ==
                                    false
                                ) {
                                    availableFilters.push(parsedFilters[filterOptions]);
                                } else {
                                    this._currentFilters.splice(parsedFilters[filterOptions]);
                                }
                            }
                        }
                        this._totalFilters = availableFilters;
                        this._totalFilters.sort((firstFilter, secondFilter) => {
                            if (firstFilter.availableFilters.filterOrder === null || firstFilter.availableFilters.filterOrder === undefined) {
                                return 1;
                            }
                            if (secondFilter.availableFilters.filterOrder === null || secondFilter.availableFilters.filterOrder === undefined) {
                                return -1;
                            }
                            if (firstFilter === secondFilter) {
                                return 0;
                            }
                            return firstFilter.availableFilters.filterOrder < secondFilter.availableFilters.filterOrder ? -1 : 1;
                        });
                    } else {
                        this._totalFilters = parsedFilters;
                    }
                }
            }

            /**
             * BS-930 : Start
             * Block to update the count of multiselect filter options from the filtered products
             * Update only if currently they are not selected by user
             */
            if (filterType == RADIO_BUTTON && multiselectEnabled === true) {
                const arr = selectedValue.split(';');
                if (checked) {
                    //logic to add new filters based on controlling field parameters for radio button
                    let parsedFilters = JSON.parse(JSON.stringify(this._totalFilters));
                    parsedFilters.forEach((options) => {
                        if (options.availableFilters.sourceProductField == field) {
                            options.availableFilters.filterValues.picklistValues.forEach((picklistSet) => {
                                if (arr.includes(picklistSet.apiName) === true && picklistSet.isValueChecked === false) {
                                    picklistSet.isValueChecked = true;
                                } else if (arr.includes(picklistSet.apiName) !== true && picklistSet.isValueChecked === true) {
                                    picklistSet.isValueChecked = false;
                                }
                            });
                        }
                    });
                    this._totalFilters = parsedFilters;
                }
            }
            /* End BS-930 */

            //logic to check the color bubble when its get selected
            if (filterType == COLOR_RADIO_BUTTON) {
                if (this.productColorsList) {
                    const selectedValueList = selectedValue.split(';'); //Added as part of BS-1601
                    this.productColorsList.forEach((element) => {
                        if (field == element.apiName) {
                            /**
                             * BS-930
                             * Updated the block to have multiple selection on color filter
                             */
                            element.colorsList.forEach((color) => {
                                /* BS-1601 : Below if condition was updated */
                                if (selectedValueList.includes(color.colorName)) {
                                    /* Start : BS-1529 */
                                    if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                                        color.colorStyle = 'background: url(' + this._selectedBicolorImage + ');' + BACKGROUND_SIZE + SELECTED_BORDER;
                                    } else {
                                        if (color.transparent) {
                                            color.colorStyle += ', url("' + URI3 + '");' + SELECTED_BORDER;
                                        } else {
                                            color.colorStyle += ' url("' + URI3 + '");' + SELECTED_BORDER;
                                        }
                                    }
                                    /* End : BS-1529 */
                                    color.colorClicked = true;
                                } else {
                                    /* Start : BS-1529 */
                                    if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                                        color.colorStyle = 'background: url(' + this._bicolorImage + ')';
                                    } else {
                                        if (color.transparent) {
                                            color.colorStyle = 'background: url(' + this.transparentUri + ')';
                                        } else {
                                            color.colorStyle = 'background: ' + color.colorHex;
                                        }
                                    }
                                    /* End : BS-1529 */
                                    color.colorClicked = false;
                                }
                            });
                        }
                    });
                }
            }
            if (selectedValue != BOTH_VALUE) {
                if (this.dynamicProductSearch && this.dynamicProductSearch.has(field)) {
                    /* Start BS-930 */
                    if (this.dynamicProductSearch.get(field) == selectedValue) {
                        this.dynamicProductSearch.delete(field);
                    } else if (selectedValue.split(';')[0] !== '') {
                        this.dynamicProductSearch.set(field, selectedValue);
                    } else if (selectedValue.split(';')[0] === '') {
                        this.dynamicProductSearch.delete(field);
                    }
                } else {
                    this.dynamicProductSearch.set(field, selectedValue);
                }
            } else {
                this.dynamicProductSearch = new Map();
            }
            this._isLoading = false;
            this.fireFilterProductSearch(this.dynamicProductSearch); //method call to filter the products based on selected filter and value
        }
    }

    /**
     * BS-444
     * @param productsFilterMap map of filters selected
     * this will fire an event when user any select filter from UI
     */
    fireFilterProductSearch(productsFilterMap) {
        this.dispatchEvent(
            new CustomEvent(FILTERPRODUCTS, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    productsFilterMap
                }
            })
        );
    }

    /**
     * BS-443
     * this will get the required filters for re-order component
     */
    async triggerGetReorderFilters() {
        this._showAllAccordionOpen = [];
        this.dynamicProductSearch = new Map();
        let data = await getReorderFilters({ storeName: this.currentStore });
        if (data) {
            let resultArray = [];
            this._filters = [];
            this._globalFilters = [];
            let availableFilters = [];
            let availableColorFilters = [];
            if (data == null || data == undefined) {
                this._isLoading = false;
            }
            resultArray = data;
            this._globalFilters = data;
            for (var filter in resultArray) {
                if (this.pageSource === REORDER_PAGE_SOURCE && this._globalFilters[filter].availableFilters.sourceProductField) {
                    this._showAllAccordionOpen.push(this._globalFilters[filter].availableFilters.sourceProductField);
                }
                if (
                    resultArray[filter].placementList.includes(this.pageSource) &&
                    resultArray[filter].availableFilters.controllingParametersList.length < 1 &&
                    resultArray[filter].availableFilters.isColorRadioButtonType
                ) {
                    availableColorFilters.push(resultArray[filter]);
                } else if (
                    resultArray[filter].placementList.includes(this.pageSource) &&
                    resultArray[filter].availableFilters.controllingParametersList.length < 1
                ) {
                    availableFilters.push(resultArray[filter]);
                }
            }
            this._totalFilters = availableFilters;
            if (availableColorFilters.length > 0) {
                this._colorFilters = availableColorFilters;
            } else {
                this._colorFilters = false;
            }
            //BS-444 : this will add product count for each filter value
            this.updateFilters();
        }
    }

    /**
     * BS-457
     * This method is used to set value of property : _productsAvailable on basis of products availability after selection of filters
     * This method is invoked from b2b_searchResultContainer if there are no products left that are matching the filter criteria
     */
    @api
    handleEmptyProducts() {
        this._productsAvailable = false;
        this._showColorRadioButton = false;
    }

    /**
     * BS-444
     *
     * this method will filter the Filters to be shown on UI based on products field values.
     */
    @api
    updateFilters() {
        /*this below map will hold field name as key and map of values and
        there count appearance in products.
        */
        /* Start BS-841 */
        if (this.pageSource === PLP_PAGE_SOURCE) {
            this._showAllAccordionOpen = [];
            this._showRadioButton = false;
        }
        /* End BS-841 */
        if (
            this.pageSource == REORDER_PAGE_SOURCE &&
            this.dynamicProductSearch != null &&
            this.dynamicProductSearch.size == 0 &&
            this.storeName != NEUBAU_BRAND
        ) {
            this.reorderPageSelectedBrand = BOTH_VALUE;
            let brandComponentObj = this.template.querySelector('c-b2b_brand-radio-button-component');
            if (brandComponentObj !== null) {
                brandComponentObj.clearBrandFilters();
            }
        }
        this._filters = [];
        this._isLoading = true;
        this._showColorRadioButton = false;
        let fieldNameVsValuesMap = new Map();
        let fieldValueVsValueCountMap;
        let filtersToRemove = [];
        let count;
        let index = 0;
        let hasValue = false;
        let fieldValues;
        let mapFilterColor = [
            { apiName: FRAME_COLOR, colorsList: [], displayColor: false },
            { apiName: LENS_COLOR, colorsList: [], displayColor: false },
            { apiName: MIRROR_COLOR, colorsList: [], displayColor: false }
        ];

        let sliderTypeFiltersSourceProductFields = []; //list of slider fields
        /*BS-227 the below if block will be used to persist the previously selected filter values for
         * slider filter and color radio button filter on load of the component
         */
        if (this.pageSource == PLP_PAGE_SOURCE && this.dynamicProductSearch != null && this._doPersistFilterOnLoad === true) {
            this._totalFilters.forEach((options) => {
                if (options.filterType == SLIDER) {
                    if (this.dynamicProductSearch != null && this.dynamicProductSearch.has(options.availableFilters.sourceProductField)) {
                        options.availableFilters.sliderSelectedLeftValue = this.dynamicProductSearch.get(
                            options.availableFilters.sourceProductField
                        ).sliderOneValue;
                        options.availableFilters.sliderSelectedRightValue = this.dynamicProductSearch.get(
                            options.availableFilters.sourceProductField
                        ).sliderTwoValue;
                    }
                }
            });

            if (this.productColorsList) {
                this.productColorsList.forEach((element) => {
                    if (
                        this.dynamicProductSearch != null &&
                        this.dynamicProductSearch.has(element.apiName) &&
                        this._multiSelectFilterFields.includes(element.apiName) === true
                    ) {
                        element.filterClicked = !element.filterClicked;
                        if (element.filterClicked) {
                            element.colorsList.forEach((color) => {
                                //BS-930
                                if (this.dynamicProductSearch.get(element.apiName).includes(color.colorName)) {
                                    color.colorClicked = true;
                                }
                            });
                        }
                    } else if (
                        this.dynamicProductSearch != null &&
                        this.dynamicProductSearch.has(element.apiName) &&
                        this._multiSelectFilterFields.includes(element.apiName) === false
                    ) {
                        element.filterClicked = !element.filterClicked;
                        if (element.filterClicked) {
                            element.colorsList.forEach((color) => {
                                if (this.dynamicProductSearch.get(element.apiName).split(';').includes(color.colorName)) {
                                    /* Start : BS-1529 */
                                    if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                                        color.colorStyle = 'background: url(' + this._selectedBicolorImage + ');' + BACKGROUND_SIZE + SELECTED_BORDER;
                                    } else {
                                        if (color.transparent) {
                                            color.colorStyle += ', url("' + URI3 + '");' + SELECTED_BORDER;
                                        } else {
                                            color.colorStyle += ' url("' + URI3 + '");' + SELECTED_BORDER;
                                        }
                                    }
                                    /* End : BS-1529 */
                                    color.colorClicked = true;
                                }
                            });
                        }
                    }
                });
            }

            let conditionalFilters = this._totalFilters;
            for (var filter in this._globalFilters) {
                //logic to add new filters based on controlling field parameters
                if (this.dynamicProductSearch != null) {
                    for (let [key, value] of this.dynamicProductSearch) {
                        if (
                            this._globalFilters[filter].availableFilters.controllingParametersList.includes(key) &&
                            this._globalFilters[filter].availableFilters.controllingParametersList.includes(value)
                        ) {
                            if (
                                this.pageSource !== REORDER_PAGE_SOURCE &&
                                conditionalFilters[filter].masterLabel !== this._globalFilters[filter].availableFilters.masterLabel &&
                                this._currentFilters.includes(this._globalFilters[filter]) == false
                            ) {
                                this._totalFilters.push(this._globalFilters[filter]);
                                this._currentFilters.push(this._globalFilters[filter]);

                                this._totalFilters.sort((firstFilter, secondFilter) => {
                                    if (firstFilter.availableFilters.filterOrder === null || firstFilter.availableFilters.filterOrder === undefined) {
                                        return 1;
                                    }
                                    if (secondFilter.availableFilters.filterOrder === null || secondFilter.availableFilters.filterOrder === undefined) {
                                        return -1;
                                    }
                                    if (firstFilter === secondFilter) {
                                        return 0;
                                    }
                                    return firstFilter.availableFilters.filterOrder < secondFilter.availableFilters.filterOrder ? -1 : 1;
                                });
                            }
                        }
                    }
                }
            }
        } //end BS-227
        this._filters = JSON.parse(JSON.stringify(this._totalFilters)); //Initializing the filters to be shown for current product data.

        //If there are no products left that are matching filter criteria then making the filters collection as empty collection
        if (this.pageSource == PLP_PAGE_SOURCE) {
            if (this._productsAvailable == false) {
                this.allProductData = [];
                this._showColorRadioButton = false;
                this._showRadioButton = false;
                this._showSliderButton = false;
            } else {
                this._showRadioButton = true;
                this._showSliderButton = true;
            }
        } else if (
            this.pageSource == REORDER_PAGE_SOURCE &&
            this._showAllAccordionOpen.length !== undefined &&
            this._showAllAccordionOpen.length !== null &&
            this._showAllAccordionOpen.length > 0
        ) {
            this._showRadioButton = true;
            this._showSliderButton = true;
            this._isLoading = false;
        }

        for (let filter in this._filters) {
            fieldValueVsValueCountMap = new Map();
            //BS-457
            if (this._filters[filter].filterType == SLIDER) {
                // Preparing collection of slider permissible range values
                let sliderPermissibleRange = [];
                sliderPermissibleRange.push(this._filters[filter].availableFilters.sliderMinimumValue);
                sliderPermissibleRange.push(this._filters[filter].availableFilters.sliderMaximumValue);
                for (var value in sliderPermissibleRange) {
                    fieldValueVsValueCountMap.set(sliderPermissibleRange[value], 0);
                }
            } else {
                //initializing map with product field values and count to zero
                this._filters[filter].availableFilters.filterValues.picklistValues.forEach((value) => {
                    fieldValueVsValueCountMap.set(value.apiName, 0); //BS-821
                });
            }
            //initializing map with product field name and map of value vs count as value
            fieldNameVsValuesMap.set(this._filters[filter].availableFilters.sourceProductField, fieldValueVsValueCountMap);

            if (
                this._filters[filter].filterType == SLIDER &&
                sliderTypeFiltersSourceProductFields.includes(this._filters[filter].availableFilters.sourceProductField) == false
            ) {
                sliderTypeFiltersSourceProductFields.push(this._filters[filter].availableFilters.sourceProductField);
            }
        }

        if (this.pageSource == REORDER_PAGE_SOURCE) {
            if (this.allProductData != null) {
                this.allProductData.products.forEach((product) => {
                    //logic to keep the color values based on the products color fields values
                    mapFilterColor.forEach((color) => {
                        if (product.B2B_Frame_Color__c != null && color.apiName == FRAME_COLOR) {
                            color.displayColor = true;
                            color.colorsList.push(product.B2B_Frame_Color__c);
                        }
                        if (product.B2B_Lens_Color__c != null && color.apiName == LENS_COLOR) {
                            color.displayColor = true;
                            color.colorsList.push(product.B2B_Lens_Color__c);
                        }
                        if (product.B2B_Mirror_Color__c != null && color.apiName == MIRROR_COLOR) {
                            color.displayColor = true;
                            color.colorsList.push(product.B2B_Mirror_Color__c);
                        }
                    });
                    // logic to increment the filter value count based on product fields
                    for (let field of fieldNameVsValuesMap.keys()) {
                        if (product[field] != undefined && product[field] != null && sliderTypeFiltersSourceProductFields.includes(field) == false) {
                            fieldValueVsValueCountMap = fieldNameVsValuesMap.get(field);
                            fieldValues = [];
                            fieldValues = product[field].split(';');
                            for (let picklistValue of fieldValues) {
                                if (this.dynamicProductSearch.has(field)) {
                                    if (this.dynamicProductSearch.get(field) === picklistValue) {
                                        if (fieldValueVsValueCountMap.has(picklistValue)) {
                                            count = fieldValueVsValueCountMap.get(picklistValue);
                                            fieldValueVsValueCountMap.set(picklistValue, count + 1);
                                        }
                                    }
                                } else {
                                    if (fieldValueVsValueCountMap.has(picklistValue)) {
                                        count = fieldValueVsValueCountMap.get(picklistValue);
                                        fieldValueVsValueCountMap.set(picklistValue, count + 1);
                                    }
                                }
                            }
                        } else if (product[field] != undefined && product[field] != null && sliderTypeFiltersSourceProductFields.includes(field) == true) {
                            fieldValueVsValueCountMap = fieldNameVsValuesMap.get(field);
                            let sliderValueOne;
                            let sliderValueTwo;
                            let counter = 0;
                            for (let sliderValue of fieldValueVsValueCountMap.keys()) {
                                if (counter == 0) {
                                    sliderValueOne = sliderValue;
                                } else {
                                    sliderValueTwo = sliderValue;
                                }
                                counter++;
                            }
                            if (sliderValueTwo != null) {
                                if (product[field] >= sliderValueOne && product[field] <= sliderValueTwo) {
                                    count = fieldValueVsValueCountMap.get(sliderValueOne);
                                    fieldValueVsValueCountMap.set(sliderValueOne, count + 1);
                                    count = fieldValueVsValueCountMap.get(sliderValueTwo);
                                    fieldValueVsValueCountMap.set(sliderValueTwo, count + 1);
                                }
                            } else {
                                if (product[field] >= sliderValueOne) {
                                    count = fieldValueVsValueCountMap.get(sliderValueOne);
                                    fieldValueVsValueCountMap.set(sliderValueOne, count + 1);
                                }
                            }
                        }
                    }
                });
            }
        } else if (this.pageSource == PLP_PAGE_SOURCE && this.allProductData && this.globalProductData) {
            this.globalProductData.forEach((product) => {
                mapFilterColor.forEach((color) => {
                    if (product.B2B_Frame_Color__c != null && color.apiName == FRAME_COLOR) {
                        color.displayColor = true;
                        color.colorsList.push(product.B2B_Frame_Color__c);
                    }
                    if (product.B2B_Lens_Color__c != null && color.apiName == LENS_COLOR) {
                        color.displayColor = true;
                        color.colorsList.push(product.B2B_Lens_Color__c);
                    }
                    if (product.B2B_Mirror_Color__c != null && color.apiName == MIRROR_COLOR) {
                        color.displayColor = true;
                        color.colorsList.push(product.B2B_Mirror_Color__c);
                    }
                });

                // logic to increment the filter value count based on product fields
                for (let field of fieldNameVsValuesMap.keys()) {
                    if (product[field] != undefined && sliderTypeFiltersSourceProductFields.includes(field) == false) {
                        fieldValueVsValueCountMap = fieldNameVsValuesMap.get(field);
                        fieldValues = [];
                        fieldValues = product[field].split(';');
                        for (let picklistValue of fieldValues) {
                            if (fieldValueVsValueCountMap.has(picklistValue)) {
                                count = fieldValueVsValueCountMap.get(picklistValue);
                                fieldValueVsValueCountMap.set(picklistValue, count + 1);
                            }
                        }
                    } else if (product[field] != undefined && sliderTypeFiltersSourceProductFields.includes(field) == true) {
                        fieldValueVsValueCountMap = fieldNameVsValuesMap.get(field);
                        let sliderValueOne;
                        let sliderValueTwo;
                        let counter = 0;
                        for (let sliderValue of fieldValueVsValueCountMap.keys()) {
                            if (counter == 0) {
                                sliderValueOne = sliderValue;
                            } else {
                                sliderValueTwo = sliderValue;
                            }
                            counter++;
                        }
                        if (sliderValueTwo != null) {
                            if (product[field] >= sliderValueOne && product[field] <= sliderValueTwo) {
                                count = fieldValueVsValueCountMap.get(sliderValueOne);
                                fieldValueVsValueCountMap.set(sliderValueOne, count + 1);
                                count = fieldValueVsValueCountMap.get(sliderValueTwo);
                                fieldValueVsValueCountMap.set(sliderValueTwo, count + 1);
                            }
                        } else {
                            if (product[field] >= sliderValueOne) {
                                count = fieldValueVsValueCountMap.get(sliderValueOne);
                                fieldValueVsValueCountMap.set(sliderValueOne, count + 1);
                            }
                        }
                    }
                }
            });
        }

        //Logic to update filter values count from the map we field previously.
        for (let filter = 0; filter < this._filters.length; filter++) {
            index = 0;
            hasValue = false;
            if ((this._filters[filter].filterType == SLIDER) == false) {
                if (this._filters[filter].filterType === RADIO_BUTTON && this._filters[filter].availableFilters.isMultiselect === false) {
                    this._filters[filter].availableFilters.filterValues.picklistValues.forEach((value) => {
                        fieldValueVsValueCountMap = fieldNameVsValuesMap.get(this._filters[filter].availableFilters.sourceProductField);
                        if (fieldValueVsValueCountMap.has(value.apiName)) {
                            //BS-821
                            if (fieldValueVsValueCountMap.get(value.apiName) != 0) {
                                //BS-821
                                hasValue = true;
                                this._filters[filter].availableFilters.filterValues.picklistValues[index].picklistValue +=
                                    ' (' + fieldValueVsValueCountMap.get(value.apiName) + ')'; //BS-821
                                if (
                                    this.dynamicProductSearch != null &&
                                    this.dynamicProductSearch.has(this._filters[filter].availableFilters.sourceProductField) &&
                                    this.dynamicProductSearch
                                        .get(this._filters[filter].availableFilters.sourceProductField)
                                        .includes(this._filters[filter].availableFilters.filterValues.picklistValues[index].apiName)
                                    //BS-821
                                ) {
                                    this._filters[filter].availableFilters.filterValues.picklistValues[index].isValueChecked = true;
                                    this._totalFilters[filter].availableFilters.filterValues.picklistValues[index].isValueChecked = true;
                                } else {
                                    this._filters[filter].availableFilters.filterValues.picklistValues[index].isValueChecked = false;
                                    this._totalFilters[filter].availableFilters.filterValues.picklistValues[index].isValueChecked = false;
                                    if (
                                        this.pageSource == REORDER_PAGE_SOURCE &&
                                        this.dynamicProductSearch != null &&
                                        this.dynamicProductSearch.has(this._filters[filter].availableFilters.sourceProductField)
                                    ) {
                                        this.dynamicProductSearch.delete(this._filters[filter].availableFilters.sourceProductField);
                                    }
                                }
                            } else {
                                this._filters[filter].availableFilters.filterValues.picklistValues[index].picklistValue = undefined;
                            }
                        }
                        index++;
                    });
                } else if (this._filters[filter].filterType === RADIO_BUTTON && this._filters[filter].availableFilters.isMultiselect === true) {
                    this._filters[filter].availableFilters.filterValues.picklistValues.forEach((value) => {
                        fieldValueVsValueCountMap = fieldNameVsValuesMap.get(this._filters[filter].availableFilters.sourceProductField);
                        if (fieldValueVsValueCountMap.has(value.apiName)) {
                            //BS-821
                            if (fieldValueVsValueCountMap.get(value.apiName) != 0) {
                                //BS-821
                                hasValue = true;
                                this._filters[filter].availableFilters.filterValues.picklistValues[index].picklistValue +=
                                    ' (' + fieldValueVsValueCountMap.get(value.apiName) + ')'; //BS-821
                                if (
                                    /**
                                     * BS-930
                                     * Updated the condition to check for inclusion of selected values.
                                     */
                                    this.dynamicProductSearch != null &&
                                    this.dynamicProductSearch.has(this._filters[filter].availableFilters.sourceProductField) &&
                                    this.dynamicProductSearch
                                        .get(this._filters[filter].availableFilters.sourceProductField)
                                        .split(';')
                                        .includes(this._filters[filter].availableFilters.filterValues.picklistValues[index].apiName) &&
                                    this.dynamicProductSearch.get(this._filters[filter].availableFilters.sourceProductField).split(';')[0] !== ''
                                ) {
                                    //BS-821
                                    this._filters[filter].availableFilters.filterValues.picklistValues[index].isValueChecked = true;
                                    this._totalFilters[filter].availableFilters.filterValues.picklistValues[index].isValueChecked = true;
                                } else if (
                                    this.dynamicProductSearch != null &&
                                    this.dynamicProductSearch.has(this._filters[filter].availableFilters.sourceProductField) &&
                                    this.dynamicProductSearch.get(this._filters[filter].availableFilters.sourceProductField).split(';')[0] === ''
                                ) {
                                    this.dynamicProductSearch.delete(this._filters[filter].availableFilters.sourceProductField);
                                } else {
                                    this._filters[filter].availableFilters.filterValues.picklistValues[index].isValueChecked = false;
                                    this._totalFilters[filter].availableFilters.filterValues.picklistValues[index].isValueChecked = false;
                                }
                            } else {
                                this._filters[filter].availableFilters.filterValues.picklistValues[index].picklistValue = undefined;
                            }
                        }
                        index++;
                    });
                }
            } else {
                //logic for slider filters to make them availbale or remove
                fieldValueVsValueCountMap = fieldNameVsValuesMap.get(this._filters[filter].availableFilters.sourceProductField);
                if (
                    fieldValueVsValueCountMap.has(this._filters[filter].availableFilters.sliderMinimumValue) &&
                    fieldValueVsValueCountMap.has(this._filters[filter].availableFilters.sliderMaximumValue)
                ) {
                    if (
                        fieldValueVsValueCountMap.get(this._filters[filter].availableFilters.sliderMinimumValue) != 0 &&
                        fieldValueVsValueCountMap.get(this._filters[filter].availableFilters.sliderMaximumValue) != 0
                    ) {
                        hasValue = true;
                    }
                }
            }

            if (hasValue == false) {
                filtersToRemove.push(filter);
            }
        }

        //logic to remove the filters who does not match with the products data
        for (var filter = filtersToRemove.length - 1; filter >= 0; filter--) {
            this._filters.splice(filtersToRemove[filter], 1);
        }

        //this will filter out the color filters to show on UI based on products.
        if (this.productColorsList && mapFilterColor) {
            mapFilterColor.forEach((filter) => {
                this.productColorsList.forEach((element) => {
                    if (element.apiName == filter.apiName) {
                        element.displayColor = filter.displayColor;
                        element.colorsList.forEach((color) => {
                            if (!filter.colorsList.includes(color.colorName)) {
                                color.colorStyle = STYLE_DISPLAY_NONE;
                            } else {
                                if (!color.colorClicked) {
                                    /* Start : BS-1529 */
                                    if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                                        color.colorStyle = 'background: url(' + this._bicolorImage + ')';
                                    } else {
                                        if (color.transparent) {
                                            color.colorStyle = 'background: url(' + this.transparentUri + ')';
                                        } else {
                                            color.colorStyle = 'background: ' + color.colorHex;
                                        }
                                    }
                                    /* End : BS-1529 */
                                } else if (color.colorClicked) {
                                    /* Start : BS-1529 */
                                    if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                                        color.colorStyle = 'background: url(' + this._selectedBicolorImage + ');' + BACKGROUND_SIZE + SELECTED_BORDER;
                                    } else {
                                        if (color.transparent) {
                                            color.colorStyle += ', url("' + URI3 + '");' + SELECTED_BORDER;
                                        } else {
                                            color.colorStyle = 'background: ' + color.colorHex + ' url("' + URI3 + '");' + +SELECTED_BORDER;
                                        }
                                    }
                                    /* End : BS-1529 */
                                }
                            }
                        });
                    }
                });
            });
        }

        //this will assign the sorted filter values for color filters to show on UI
        if (this.productColorsList.length > 0 && this._colorFilters != false) {
            for (var filter = 0; filter < this._colorFilters.length; filter++) {
                this.productColorsList.forEach((element) => {
                    if (this._colorFilters[filter].availableFilters.sourceProductField == element.apiName && element.displayColor == true) {
                        this._colorFilters[filter].colorData = element;
                    } else if (this._colorFilters[filter].availableFilters.sourceProductField == element.apiName && element.displayColor == false) {
                        this._colorFilters[filter].colorData = element;
                    }
                });
                this._showColorRadioButton = true;
            }
        }
        if (this.pageSource === PLP_PAGE_SOURCE && this._filters.length > 0) {
            this._showAllAccordionOpen = [];
            for (let filterIndex = 0; filterIndex < this._filters.length; filterIndex++) {
                if (this._filters[filterIndex].availableFilters && this._filters[filterIndex].availableFilters.sourceProductField) {
                    this._showAllAccordionOpen.push(this._filters[filterIndex].availableFilters.sourceProductField);
                }
            }
        }
        if (this._openFilterAccordions === false && this.isPLPPage === true) {
            this.collapseFilterAccordions();
        }
        /* End BS-841 */
        this._productsAvailable = true;
        this._isLoading = false;
        this.doRender = true;
        this.doRender = false;
        this._doPersistFilterOnLoad = false; //BS-227
    }

    /**
     * BS-571
     * Method is used to get the all plp filters for all the brands based on storename
     * @param storeName : Name of web store in which user logged in currently
     */
    getAllPLPFilters() {
        getReorderFilters({ storeName: this.currentStore })
            .then((data) => {
                let filterJSON = {}; //BS-930 : {key : fieldName, value : Filter Tye}
                let filterJSONList = []; //BS-930 : List to store all filterJSON objects
                let resultArray = [];
                this._filters = [];
                this._globalFilters = [];
                let availableFilters = [];
                let availableColorFilters = [];
                if (data != null || data != undefined) {
                    resultArray = data;
                    this._globalFilters = data;

                    /*
                     * Dispatching the event to send data to parent component
                     * Storing the type in local storage in encoded format
                     * Start BS-930
                     */
                    this.dispatchEvent(
                        new CustomEvent(FILTER_FETCH_EVENT, {
                            detail: {
                                resultArray
                            }
                        })
                    );
                    for (let index = 0; index < resultArray.length; index++) {
                        this._filterSourceFieldVsFilterType.set(resultArray[index].availableFilters.sourceProductField, {
                            filterType: resultArray[index].availableFilters.filterType,
                            isMultiselect: resultArray[index].availableFilters.isMultiselect
                        });
                        let field = resultArray[index].availableFilters.sourceProductField;
                        let filterTypeValue = resultArray[index].availableFilters.filterType;
                        let multiselectBoolean = resultArray[index].availableFilters.isMultiselect;
                        filterJSON = { key: field, filterType: filterTypeValue, isMultiselect: multiselectBoolean };
                        filterJSONList.push(filterJSON);
                    }
                    localStorage.setItem(TYPE_KEY, btoa(unescape(encodeURIComponent(JSON.stringify(filterJSONList)))));

                    /*
                     * Loop to populate List having all multiselect filter fields.
                     */
                    for (let index = 0; index < this._globalFilters.length; index++) {
                        if (
                            this._globalFilters[index].availableFilters !== undefined &&
                            this._globalFilters[index].availableFilters.filterType !== undefined &&
                            this._globalFilters[index].availableFilters.isMultiselect !== undefined &&
                            this._globalFilters[index].availableFilters.filterType === RADIO_BUTTON &&
                            this._globalFilters[index].availableFilters.isMultiselect === true
                        ) {
                            this._multiSelectFilterFields.push(this._globalFilters[index].availableFilters.sourceProductField);
                        }
                    }

                    /* End BS-930 */
                    for (var filter in resultArray) {
                        if (this.pageSource === REORDER_PAGE_SOURCE && this._globalFilters[filter].availableFilters.sourceProductField) {
                            this._showAllAccordionOpen.push(this._globalFilters[filter].availableFilters.sourceProductField);
                        }
                        if (
                            resultArray[filter].placementList.includes(this.pageSource) &&
                            resultArray[filter].availableFilters.controllingParametersList.length < 1 &&
                            resultArray[filter].availableFilters.isColorRadioButtonType
                        ) {
                            availableColorFilters.push(resultArray[filter]);
                        } else if (
                            resultArray[filter].placementList.includes(this.pageSource) &&
                            resultArray[filter].availableFilters.controllingParametersList.length < 1
                        ) {
                            availableFilters.push(resultArray[filter]);
                        }
                    }
                    this._totalFilters = availableFilters;
                    if (availableColorFilters.length > 0) {
                        this._colorFilters = availableColorFilters;
                    } else {
                        this._colorFilters = false;
                    }
                    this.updateFilters(); //BS-444 : this will add product count for each filter value
                } else {
                    this._colorFilters = false;
                    this._showColorRadioButton = false;
                    this._isLoading = false;
                }
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    //method to fire an event when user clicks on clear all button for re-order page
    @api // BS-692
    handleClear(event) {
        this._isLoading = true;

        this.dynamicProductSearch = new Map();

        /* Start BS-908 */
        if (this.productColorsList) {
            this.productColorsList.forEach((element) => {
                element.filterClicked = false;
                element.colorsList.forEach((color) => {
                    /* Start : BS-1529 */
                    if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                        color.colorStyle = 'background: url(' + this._bicolorImage + ')';
                    } else {
                        if (color.transparent) {
                            color.colorStyle = 'background: url(' + this.transparentUri + ')';
                        } else {
                            color.colorStyle = 'display: none';
                        }
                    }
                    /* End : BS-1529 */
                    color.colorClicked = false;
                });
            });
        }
        /* End BS-908 */

        let currentCategoryId = this._currentCategoryId;
        this.doRender = true;
        this.dispatchEvent(
            new CustomEvent(CLEAR_ALL, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    currentCategoryId
                }
            })
        );
        this.triggerGetReorderFilters();
        this.triggerMetadataRetrieve();
        this._isLoading = false;
    }

    /**
     * BS-730
     * This method will be used to check or uncheck radio button filters and update the count of product
     * against each radio button filter.
     */
    @api
    updateRadioButtonFilter() {
        this._isLoading = true;
        let index = 0;
        //Logic to update filter values count to zero when there is no products to show.
        for (let filter = 0; filter < this._filters.length; filter++) {
            index = 0;

            if ((this._filters[filter].filterType == SLIDER) == false) {
                this._filters[filter].availableFilters.filterValues.picklistValues.forEach((value) => {
                    if (this._filters[filter].availableFilters.filterValues.picklistValues[index].picklistValue != undefined) {
                        this._filters[filter].availableFilters.filterValues.picklistValues[index].picklistValue =
                            this._filters[filter].availableFilters.filterValues.picklistValues[index].picklistValue.split('(')[0].trim() + ' (' + '0' + ')';
                        if (
                            this.dynamicProductSearch != null &&
                            this.dynamicProductSearch.has(this._filters[filter].availableFilters.sourceProductField) &&
                            this.dynamicProductSearch
                                .get(this._filters[filter].availableFilters.sourceProductField)
                                .split(';')
                                .includes(this._filters[filter].availableFilters.filterValues.picklistValues[index].apiName) //BS-821
                        ) {
                            this._filters[filter].availableFilters.filterValues.picklistValues[index].isValueChecked = true;
                        } else {
                            this._filters[filter].availableFilters.filterValues.picklistValues[index].isValueChecked = false;
                        }
                    }
                    index++;
                });
            }
        }
        this._isLoading = false;
    }
    /**
     * BS-906
     * this method unchecks the color filters on change of the source and period filter on reorder page.
     */
    @api
    resetColorRadioButton() {
        if (this.productColorsList !== null && this.productColorsList !== undefined) {
            this.productColorsList.forEach((element) => {
                element.filterClicked = false;
                element.colorsList.forEach((color) => {
                    /* Start : BS-1529 */
                    if (color.colorLabel === BICOLOR_COLOR.split(',')[0] || color.colorLabel === BICOLOR_COLOR.split(',')[1]) {
                        color.colorStyle = 'background: url(' + this._bicolorImage + ')';
                    } else {
                        if (color.transparent) {
                            color.colorStyle = 'background: url(' + this.transparentUri + ')';
                        } else {
                            color.colorStyle = 'display: none';
                        }
                    }
                    /* End : BS-1529 */
                    color.colorClicked = false;
                });
            });
        }
    }

    /**
     * Method that will set the flag to open and collapse all the filter accordions
     * BS-841
     */
    async handleFilterCollapse() {
        if (this._openFilterAccordions === true) {
            //Reset the previous selected filter post call of collapse all filter.
            this._filtersToOpenList = [];
            this.collapseFilterAccordions();

            //Update the icons and labeld to expand ones
            this._filterIcon = this.expandedIcon;
            this._filterExpandCollapseLabel = EXPAND_COLLAPSE_LABELS.split(',')[0];

            this._openFilterAccordions = false; //Boolean to controll opening and closing of accordions.

            //Update the local storage
            localStorage.setItem(RENDER_OPEN_FILTER_KEY, false);
            this._showRadioButton = true;
            this._showSliderButton = true;
        } else {
            /*Start : Logic to handle opening of category accordions */
            let categoryDetailsComponent = this.template.querySelector('c-b2b_category-details');
            if (categoryDetailsComponent !== null) {
                categoryDetailsComponent.activeCategoryLabel = 'category';
            }
            /* END : CATEGORY */

            /*Start : Logic to handle opening of color filter accordions */
            this.activeColorLabel = COLOR_FILTER.split(',')[3];
            this._expandColorFilter = false;
            /* END : COLOR Filters */

            /*Start : Logic to handle opening of rdio button filter accordions */
            this._showAllAccordionOpen = [];
            this._filtersToOpenList = [];

            for (let filter in this._filters) {
                if (
                    this._filters[filter] !== null &&
                    this._filters[filter].availableFilters.sourceProductField !== undefined &&
                    this._filters[filter].availableFilters.sourceProductField !== null
                ) {
                    this._showAllAccordionOpen.push(this._filters[filter].availableFilters.sourceProductField);
                }
            }
            /* END : Radio Filters */

            /* Upation of icon and labels*/
            this._filterIcon = this.collapsedIcon;
            this._filterExpandCollapseLabel = EXPAND_COLLAPSE_LABELS.split(',')[1];

            /* Upation of local storage */
            localStorage.setItem(RENDER_OPEN_FILTER_KEY, true);
            this._openFilterAccordions = true;
            this._showRadioButton = true;
            this._showSliderButton = true;
        }
    }

    collapseFilterAccordions() {
        /*Logic to handle opening of category accordions */
        if (this._expandCategoryFilter === true) {
            /*Start : Logic to handle opening of category accordions */
            let categoryDetailsComponent = this.template.querySelector('c-b2b_category-details');
            if (categoryDetailsComponent !== null) {
                categoryDetailsComponent.activeCategoryLabel = 'category'; // Added to handle the opening of filters post collapse all is called.
            }
        } else {
            /*Start : Logic to handle opening of category accordions */
            let categoryDetailsComponent = this.template.querySelector('c-b2b_category-details');
            if (categoryDetailsComponent !== null) {
                categoryDetailsComponent.activeCategoryLabel = null;
            }
        }

        /*Logic to handle opening/closing of color button accordion */
        if (this._expandColorFilter === true) {
            this.activeColorLabel = COLOR_FILTER.split(',')[3]; // Added to handle the opening of filters post collapse all is called.
        } else {
            this.activeColorLabel = null;
        }

        /*Logic to handle opening/closing of radio button accordion */
        if (this._filtersToOpenList.length > 0) {
            this._showAllAccordionOpen = JSON.parse(JSON.stringify(this._filtersToOpenList));
        } else {
            this._showAllAccordionOpen = [];
        }
        this._showRadioButton = true;
        this._showSliderButton = true;
    }

    handleCategoryExpandAndCollapse() {
        this._showRadioButton = false;
        this._showSliderButton = false;
        this._expandCategoryFilter = true;
    }
}
