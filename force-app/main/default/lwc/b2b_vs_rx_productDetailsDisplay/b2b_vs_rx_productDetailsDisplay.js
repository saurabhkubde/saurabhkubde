import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { transformData } from './dataNormalizer';
import { sortBy, getDeliveryTime, getApplicableAvailabilityStatusIcon } from 'c/b2b_utils';

import communityId from '@salesforce/community/Id';
import productSearch from '@salesforce/apex/B2B_VS_RX_PDP_Controller.productSearch';
import getProductMedia from '@salesforce/apex/B2B_VS_RX_PDP_Controller.getProductMedia';
import checkEvilEyeFrame from '@salesforce/apex/B2B_VS_RX_PDP_Controller.checkEvilEyeFrame';
import getColorsMetadata from '@salesforce/apex/B2B_SearchController.getColorsMetadata';
import { fireEvent } from 'c/b2b_pubsub';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import CODE_FIELD from '@salesforce/schema/Account.k_ARIS_Account_ID__c';
import SHIPPING_FIELD from '@salesforce/schema/Product2.B2B_Shipping_Status__c';
import PRODUCT_OBJECT from '@salesforce/schema/Product2';
import HIDE_PRICES_FIELD from '@salesforce/schema/Account.B2B_Hide_Prices__c';
import HIDE_PURCHASE_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Purchase_Price__c'; //BS-2273
import HIDE_SUGGESTED_RETAIL_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Suggested_Retail_Price__c'; //BS-2273
//Labels
import PDP_LABELS from '@salesforce/label/c.B2B_PDP_InfoLabels';
import PDP_PARTS from '@salesforce/label/c.B2B_PDP_SpareParts';
import PDP_INFO from '@salesforce/label/c.B2B_PDP_FurtherInfo';
import PDP_SHADES from '@salesforce/label/c.B2B_PDP_StyleShade';
import PAGE_SIZE_VALUE from '@salesforce/label/c.B2B_Pagination_Display_Size';
import additionalLensesHeaderLabel from '@salesforce/label/c.B2B_Additional_Lenses_Header';

import EVIL_EYE_PRODUCT_CATALOGUE_LINK from '@salesforce/label/c.B2B_Evil_Eye_Product_Catalogue';
import DEALER_CATALOGUE from '@salesforce/label/c.B2B_Evil_Eye_Dealer_Catalogue_Value';
import productAttributeShowLabel from '@salesforce/label/c.B2B_PDP_Additional_Attribute_Label';
import productAttributeUnits from '@salesforce/label/c.B2B_PDP_Additional_Attribute_Units';
import READ_MORE_LABEL from '@salesforce/label/c.B2B_Read_More_Label';
import B2B_MISSING_PRICE_LABELS from '@salesforce/label/c.B2B_MISSING_PRICE_LABELS'; //BS-1951

// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';

// A fixed entry for the home page.
const homePage = {
    name: 'Home',
    type: 'standard__namedPage',
    attributes: {
        pageName: 'home'
    }
};

const fields = [HIDE_PRICES_FIELD, CODE_FIELD, HIDE_PURCHASE_PRICE_FIELD, HIDE_SUGGESTED_RETAIL_PRICE_FIELD];
const EE_BRAND = 'evil eye';
const SH_STORE = 'silhouette';
const SUN_PROTECTION_SPARE_PART_TYPE = 'Sun protection lens';
const SUN_PROTECTION_SPARE_PART_TYPE_GERMAN = 'Sonnenschutzglas';
const LENSE_CATEGORY = 'Lenses';
const LENSE_CATEGORY_GERMAN = 'Gläser';

const BRIDGE_SIZE_FIELD = 'B2B_Bridge_Size__c';
const LENS_SIZE_FIELD = 'B2B_Lens_Size__c';
const TEMPLE_LENGTH_FIELD = 'B2B_Temple_Length__c';
const WEIGHT_FIELD = 'B2B_Weight__c';
const FRAME_WIDTH_FIELD = 'B2B_Frame_Width__c';
const FRAME_SHAPE_HEIGHT_FIELD = 'B2B_Shape_Height__c';
const SHAPE_AREA_FIELD = 'B2B_Shape_Area__c';
const LENS_COLOR = 'B2B_Lens_Color__c';
const MIRROR_COLOR = 'B2B_Mirror_Color__c';
const STYLE_DISPLAY_NONE = 'display: none';
const TRANSPARENT = 'transparent';
const URI1 =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxwYXR0ZXJuIGlkPSJiIiBwYXR0ZXJuVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PHVzZSB4bGluazpocmVmPSIjYSIgdHJhbnNmb3JtPSJzY2FsZSguNSkiLz48L3BhdHRlcm4+PGltYWdlIGlkPSJhIiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0NBWUFBQUJYQXZtSEFBQUVHV2xEUTFCclEwZERiMnh2Y2xOd1lXTmxSMlZ1WlhKcFkxSkhRZ0FBT0kyTlZWMW9IRlVVUHJ0elp5TWt6bE5zTklWMHFEOE5KUTJUVmpTaHRMcC8zZDAyYnBaSk50b2k2R1QyN3M2WXljNDRNN3Y5b1U5RlVId3g2cHNVeEwrM2dDQW85US9iUHJRdmxRb2wydFFnS0Q2MCtJTlE2SXVtNjVrN001bHB1ckhlWmU1ODg1M3ZubnZ1dVdmdkJlaTVxbGlXa1JRQkZwcXVMUmN5NG5PSGo0ZzlLNUNFaDZBWEJxRlhVUjByWGFsTUFqWlBDM2UxVzk5RHdudGYyZFhkL3ArdHQwWWRGU0J4SDJLejVxZ0xpSThCOEtkVnkzWUJldnFSSHovcVdoNzJZdWkzTVVERUwzcTQ0V1BYdzNNK2ZvMXBadVFzNHRPSUJWVlRhb2lYRUkvTXhmaEdEUHN4c05aZm9FMXE2NnJvNWFKaW0zWGRvTEZ3NzJIK24yM0JhSVh6YmNPbno1bWZQb1R2WVZ6N0t6VWw1K0ZSeEV1cWtwOUcvQWppYTIxOXRoemcyNWFia1JFL0JwRGMzcHF2cGhIdlJGeXMyd2VxdnAra3JiV0tJWDduaERiekxPSXRpTTgzNThwVHdkaXJxcFBGbk1GMnhMYzFXdkx5T3dUQWlicGJtdkhIY3Z0dFU1N3k1K1hxTlpyTGUzbEUvUHE4ZVVqMmZYS2ZPZTNwZk9qemhKWXRCL3lsbDVTREZjU0RpSCtoUmtIMjUrTCtzZHhLRUFNWmFocmxTWDh1a3FNT1d5L2pYVzJtNk05TERCYzMxQjlMRnV2NmdWS2cvMFN6aTNLQXIxa0dxMUdNalUvYUxibnE2L2xSeGM0WGZKOThoVGFyZ1grK0RiTUpCU2lZTUllOUNrMVlBeEZrS0VBRzN4YllhS21ERGdZeUZLMFVHWXBmb1dZWEcrZkFQUEk2dEpuTndiN0NsUDdJeUYrRCtiak90Q3BraHo2Q0ZySWEvSTZzRnRObDhhdUZYR01UUDM0c053SS9KaGtnRXRtRHoxNHlTZmFSY1RJQklubUtQRTMya3h5eUUyVHYrdGhLYkVWZVBEZlcvYnlNTTFLbW0wWGRPYlM3b0dEL015cE1YRlBYckN3T3RvWWp5eW43QlYyOS9NWmZzVnpwTERkUnR1SVpuYnBYenZsZitldjhNdllyL0dxazRIL2tWL0czY3NkYXpMdXlUTVBzYkZoemQxVWFiUWJqRnZEUm1jV0p4UjN6Y2ZIa1Z3OUdmcGJKbWVldjlGMDhXVzh1RGthc2x3WDZhdmxXR1U2TlJLejBnL1NIdEN5OUozMG8vY2E5elgzS2ZjMTl6bjNCWFFLUk84dWQ0NzdoTG5BZmMxL0c5bXJ6R2xyZmV4WjVHTGRuNlpacnJFb2hJMndWSGhaeXdqYmhVV0V5OGljTUNHTkNVZGlCbHEzcit4YWZMNTQ5SFE1akgrYW4rMXkrTGxZQmlmdXhBdlJOL2xWVlZPbHdsQ2tkVm05Tk9MNUJFNHdrUTJTTWxEWlU5N2hYODZFaWxVL2xVbWtRVXp0VEU2bXgxRUVQaDdPbWRxQnRBdnY4SGRXcGJySlM2dEpqM24wQ1dkTTZidXNOelJWM1M5S1RZaHF2TmlxV211cm9pS2dZaHNoTWptaFRoOXB0V2hzRjc5NzBqL1NiTXJzUEUxc3VSNXo3RE1DK1AvSHMreTdpanJRQWxoeUFnY2NqYmhqUHlnZmVCVGp6aE5xeTI4RWRrVWg4QytEVTkrejJ2L295ZUg3OTFPbmN4SE9zNXkyQXRUYzduYi9mNzNUV1BrRC9xd0Jualg4Qm9KOThWUU5jQys4QUFBQ3pTVVJCVkdnRjdaaEJDc013REFUanZzYi9mNDEvMDlM';
const URI2 =
    'akhzV1FiUU9UbThDUzRoa0xqTmZlKzMwTnZuUE9HaXkvN3E3L212ek1QNjUxQTcrMm9nRU5RQUllSVFnUXAyc0FJNFFGSG05Z2RLLzV3cnI3YmpPdC8zZ0RiZ0RPSUU3WEFFWUlDMmdBQXNUcEdzQUlZUUVOUUlBNGZVM3ZIcjRMWWVaWndCbElIdjFJQTMzbTJWRUR5YU1mYWFEUFBEdHFJSG4wSTkrRitzeXpvek9RUFBxUkJ2ck1zNk1Ha2tjLzBrQ2ZlWGJVUVBMb1J4K1lPeHRMdG4wd2lBQUFBQUJKUlU1RXJrSmdnZz09Ii8+PC9kZWZzPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9InVybCgjYikiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iLjEiLz48L3N2Zz4=';
const SHOW_MORE_SELECTION = 'userShowMoreSelection';

const RIMLESS_VARIANT_FIELD = 'B2B_Rimless_Variant__c';
const PICKLIST_VALUE_DEMO = 'Demo';

const FRAME_TYPE_FIELD = 'B2B_Frame_type__c';
const RIMLESS = PDP_LABELS.split(',')[8];
const HEXCODE = 'B2B_Hexcode__c';
const HEX_CODE_ACCENT = 'B2B_Hexcode_Accent__c';
const FRAME_COLOR_DESCRIPTION = 'B2B_Frame_Color_Description__c';
const STOCK_KEEPING_UNIT_FIELD = 'StockKeepingUnit';
const BRAND_TYPE_EVT = 'brandTypeEVT';
const RECORD_ID_CHANGE = 'recordidchange';
const SEND_SELECTED_PRODUCT_DATA = 'sendselectedproductdata'; //788
const EXTERNAL_LINK_ICON = '/icons/externalLink.svg'; //BS-1398

//BS-1255
const FRAME_ACCENT_COLOR = 'B2B_Frame_Accent_Color__c';
const DATE_FORMAT = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
};
//Colors custom label BS-1005
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
import BRASS_COLOR from '@salesforce/label/c.B2B_Color_Brass'; //BS-1005
import ACCENT_COLOR from '@salesforce/label/c.B2B_ACCENT_COLOR_LABEL'; //BS-1579

/**
 * An organized display of product information.
 *
 * @fires ProductDetailsDisplay#addtocart
 * @fires ProductDetailsDisplay#createandaddtolist
 */
export default class ProductDetailsDisplay extends NavigationMixin(LightningElement) {
    /**
     * An event fired when the user indicates the product should be added to their cart.
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *   - Cancelable: false
     *
     * @event ProductDetailsDisplay#addtocart
     * @type {CustomEvent}
     *
     * @property {string} detail.quantity
     *  The number of items to add to cart.
     *
     * @export
     */

    /**
     * An event fired when the user indicates the product should be added to a new wishlist
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *   - Cancelable: false
     *
     * @event ProductDetailsDisplay#createandaddtolist
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * A product image.
     * @typedef {object} Image
     *
     * @property {string} url
     *  The URL of an image.
     *
     * @property {string} alternativeText
     *  The alternative display text of the image.
     */

    /**
     * A product category.
     * @typedef {object} Category
     *
     * @property {string} id
     *  The unique identifier of a category.
     *
     * @property {string} name
     *  The localized display name of a category.
     */

    /**
     * A product price.
     * @typedef {object} Price
     *
     * @property {string} negotiated
     *  The negotiated price of a product.
     *
     * @property {string} currency
     *  The ISO 4217 currency code of the price.
     */

    /**
     * A product field.
     * @typedef {object} CustomField
     *
     * @property {string} name
     *  The name of the custom field.
     *
     * @property {string} value
     *  The value of the custom field.
     */

    /**
     * An iterable Field for display.
     * @typedef {CustomField} IterableField
     *
     * @property {number} id
     *  A unique identifier for the field.
     */

    /**
     * Gets or sets which custom fields should be displayed (if supplied).
     *
     * @type {CustomField[]}
     */
    @api
    customFields;

    /**
     * List to hold all the field that needs to be shown in Additional Attributes on UI passed from b2b_productDetails
     * BS-1255
     * @type {List}
     */
    @api
    additionalAttributeFieldAndLabelList;

    /**
     * Map to hold color and color label
     * BS-1255
     * @type {List}
     */
    _colorVsColorLabelMap = new Map();

    _additionalAttributeObjectList = [];
    _additionalAttributeWithMultipleValuesObjectList = [];
    _additionalAttributeObjectListCopy = [];
    /**
     * Gets or sets whether the cart is locked
     *
     * @type {boolean}
     */
    @api
    cartLocked;

    /**
     * Gets or sets the name of the product.
     *
     * @type {string}
     */
    @api
    description;

    /**
     * Gets or sets the product image.
     *
     * @type {Image}
     */
    @api
    image;

    /**
     * Gets or sets the name of the product.
     *
     * @type {string}
     */
    @api
    name;

    /**
     * brand value passed from the parent component
     * BS-709
     * @type {string}
     */
    @api
    brand;

    /**
     * frameColorDescription value passed from the parent component
     * BS-709
     */
    @api
    frameColorDescription;

    /**
     * collectionDesignFamily value passed from the parent component
     * BS-709
     */
    @api
    collectionDesignFamily;

    @api
    modelNameNumber; //BS-1701

    /**
     * sparepartType value passed from the parent component
     * BS-709
     */
    @api
    sparepartType;

    /**
     * Gets or sets the model of the product.
     *
     * @type {string}
     */
    @api
    model;

    /**
     * Gets or sets the price - if known - of the product.
     * If this property is specified as undefined, the price is shown as being unavailable.
     *
     * @type {Price}
     */
    @api
    price;

    /**
     * Gets or sets teh stock keeping unit (or SKU) of the product.
     *
     * @type {string}
     */
    @api
    sku;

    //384
    /**
     * Gets the description for the product.
     *
     * @type {CustomField[]}
     */
    @api
    productDescription;

    @api
    variations;

    @api
    hasVariations;

    @api
    productData;

    @api
    deliveryTime;

    @api
    deliveryStatusJ;

    @api
    disableProduct;

    @api
    displayDemoButton;

    @api
    images;

    @api
    effectiveAccountId;

    @api
    productId;

    @api
    config;

    @api
    cardContentMapping;

    @api
    hidePricesFromTile;

    _hideSilhouettePricesFromTile;

    @api
    productFields;

    @api
    pageSource;
    externalLinkIcon = STORE_STYLING + EXTERNAL_LINK_ICON; //BS-1398
    _transparentURI;
    _customMetadataColors = new Map();

    pageSourcePDP = true;

    @api
    orderType; //BS-1713

    @api
    orderInformationSummaryCollection; //BS-1713

    @api
    lensConfiguratorCollection; //BS-1713

    /**
     * BS-709
     * getter for bridge size icon
     *
     */
    get bridgeSize() {
        let auxBridge;
        auxBridge = {
            icon: STORE_STYLING + '/additionalattributeicons/SH_BridgeSize.png'
        };
        return auxBridge;
    }

    /**
     * BS-709
     * This variable holds the value of hide price field obtained from account
     *
     */
    @track
    _hidePriceStatus = false;

    /**
     * BS-709
     * getter for bridge size icon
     *
     */
    get hidePrice() {
        let hidePriceStatus = getFieldValue(this.account.data, HIDE_PRICES_FIELD);
        this._hideSilhouettePricesFromTile = !!getFieldValue(this.account.data, HIDE_PRICES_FIELD);
        if (hidePriceStatus != null && hidePriceStatus != undefined) {
            this._hidePriceStatus = hidePriceStatus;
            return hidePriceStatus;
        } else {
            return null;
        }
    }

    /**
     * BS-709
     * getter for lens size icon
     *
     */
    get lensSize() {
        let auxLens;
        auxLens = {
            icon: STORE_STYLING + '/additionalattributeicons/SH_LensSize.png'
        };
        return auxLens;
    }

    /**
     * getter for bridge size icon
     *
     */
    get templeLength() {
        let auxTemple;
        auxTemple = {
            icon: STORE_STYLING + '/additionalattributeicons/SH_TempleLength.png'
        };
        return auxTemple;
    }

    get productIdArray() {
        let productIdArray = { id: this.productId };
        return productIdArray;
    }

    _categoryPath;
    _resolvedCategoryPath = [];
    skuLabel = PDP_LABELS.split(',')[0];
    descriptionLabel = PDP_LABELS.split(',')[1];
    priceLabel = PDP_LABELS.split(',')[2];
    priceUnavailableTitle = B2B_MISSING_PRICE_LABELS.split(',')[2]; //BS-1951
    freeOfChargeLabel = B2B_MISSING_PRICE_LABELS.split(',')[3]; //BS-2355
    cartButtonLabel = PDP_LABELS.split(',')[3];
    listButtonLabel = PDP_LABELS.split(',')[4];
    productDisabledLabel = PDP_LABELS.split(',')[5];

    sparePartsButton = PDP_PARTS.split(',')[0];
    demoButton = PDP_PARTS.split(',')[1];
    sparePartsHeader = PDP_PARTS.split(',')[2];
    demoHeader = PDP_PARTS.split(',')[3];
    sparePartResults;
    demoResults;
    furtherInfoHeader = PDP_INFO;
    sectionHeader = PDP_SHADES;
    _evilEyeProductCatalogueLink = EVIL_EYE_PRODUCT_CATALOGUE_LINK;
    _dealerCatalogue = DEALER_CATALOGUE;
    showModal = false;
    modalHeader;
    _showSpare;
    _showDemo;
    _totalProducts;

    @track
    _displayData;
    productMedias;
    pageSize = 4;
    _sectionIndex = 0;
    displayArrows = false;
    _totalSpareProducts = 0;
    _totalDemoProducts = 0;
    pageSizeForPopUp = parseInt(PAGE_SIZE_VALUE);
    _pageNumber = 1;
    _spareProducts = [];
    _demoProducts = [];
    _styleShades = [];
    @track _startingRecord = 1;
    @track _endingRecord = 0;
    _showLeftArrow = false;
    _showRightArrow = true;
    _sparePartIdList = [];
    _styleShadeIdList = [];
    _demoProdcuctIdList = [];
    @track _lensesProductIdList = [];
    @track _lensesProducts = [];
    @track _isLenses = false;
    @track _showAdditionalInfoForEvilEye = false;
    @track _additionalInfoForEvilEyeData = {};

    /**
     * Property to hold frame color description value
     * BS-709
     * @type {String}
     */
    _frameColorDescription;

    /**
     * Property to hold frame color value
     * BS-709
     * @type {String}
     */
    _frameColor;

    /**
     * Property to hold frame color label value
     * BS-709
     * @type {String}
     */
    _frameColorLabel;

    /**
     * Property to hold hex color value
     * BS-709
     * @type {String}
     */
    _backgroundColorUpper;

    /**
     * Property to hold hex accent color value
     * BS-709
     * @type {String}
     */
    _backgroundColorLower;

    _showMoreBoolean = false;

    _showMore = productAttributeShowLabel.split(',')[0];
    _showLess = productAttributeShowLabel.split(',')[1];

    _additionalAttributeLabel = productAttributeShowLabel.split(',')[0];

    _isSilhouetteStore = false;

    _isEvilEyeProduct = false;

    //Added as part of BS-709 to identify if the current product is of evil eye and type frame
    _isEvilEyeFrameProduct = false;

    // A bit of coordination logic so that we can resolve product URLs after the component is connected to the DOM,
    // which the NavigationMixin implicitly requires to function properly.
    _resolveConnected;
    _connected = new Promise((resolve) => {
        this._resolveConnected = resolve;
    });

    /**
     * Property to decide whether frame color should be displayed on PDP screen
     * BS-709
     * @type {Boolean}
     */
    _seeFrameColor = false;
    _isClipOnLayout = true;

    _readMore = READ_MORE_LABEL.split(',')[0];
    _readLess = READ_MORE_LABEL.split(',')[1];
    _productDescriptionClass = 'slds-m-top_x-small justify-text descriptionreadmore';
    _readButtonClass = 'framecolorbubble-container read-more-button readButton';
    _showLessButton = false;
    _showMoreButton = false;
    @wire(getRecord, { recordId: '$effectiveAccountId', fields })
    account;

    /**
     * get HIDE_PURCHASE_PRICE_FIELD value on account
     * BS-2273
     */
    get hidePurchasePriceField() {
        if (this.account && this.account.data) {
            return getFieldValue(this.account.data, HIDE_PURCHASE_PRICE_FIELD);
        }
        return true;
    }

    /**
     * get HIDE_SUGGESTED_RETAIL_PRICE_FIELD value on account
     * BS-2273
     */
    get hideSuggestedRetailPriceField() {
        if (this.account && this.account.data) {
            return getFieldValue(this.account.data, HIDE_SUGGESTED_RETAIL_PRICE_FIELD);
        }
        return true;
    }

    get countryCode() {
        return getFieldValue(this.account.data, CODE_FIELD);
    }

    @wire(getObjectInfo, { objectApiName: PRODUCT_OBJECT })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: '$shippingField'
    })
    shippingPicklistValues;

    @wire(CurrentPageReference)
    pageRef;

    @track
    deliveryInformationCollection;

    get deliveryTimeJSON() {
        if (JSON.stringify(this.shippingPicklistValues) !== '{}' && this.countryCode && this.deliveryTime) {
            this.deliveryInformationCollection = this.getDeliveryInformation(this.deliveryTime);
        }
        return this.deliveryInformationCollection;
    }

    shippingField;

    getDeliveryInformation(deliveryTime) {
        if (deliveryTime != null && deliveryTime != undefined && deliveryTime != '') {
            const deliveryInformationCollection = {};
            deliveryInformationCollection.status = getDeliveryTime(deliveryTime, this.shippingPicklistValues, this.countryCode);
            deliveryInformationCollection.styling = getApplicableAvailabilityStatusIcon(deliveryInformationCollection.status);
            return deliveryInformationCollection;
        } else {
            return null;
        }
    }

    async connectedCallback() {
        this.dispatchEvent(
            new CustomEvent('loadingproduct', {
                detail: {
                    loading: true
                }
            })
        );

        //Added as part of BS-709
        this._transparentURI = URI1 + URI2;
        if (localStorage.getItem(SHOW_MORE_SELECTION)) {
            if (localStorage.getItem(SHOW_MORE_SELECTION) == 'true') {
                this._showMoreBoolean = true;
                this._additionalAttributeLabel = this._showLess;
            } else {
                this._showMoreBoolean = false;
                this._additionalAttributeLabel = this._showMore;
            }
        } else {
            localStorage.setItem(SHOW_MORE_SELECTION, this._showMoreBoolean);
        }
        let colorResult = await getColorsMetadata({});

        if (colorResult !== null && colorResult !== undefined) {
            this._customMetadataColors = new Map(Object.entries(JSON.parse(colorResult)));
        }

        if (this.brand == EE_BRAND && (this.sparepartType == SUN_PROTECTION_SPARE_PART_TYPE || this.sparepartType == SUN_PROTECTION_SPARE_PART_TYPE_GERMAN)) {
            this._showAdditionalInfoForEvilEye = true;
        } else {
            this._showAdditionalInfoForEvilEye = false;
        }

        //BS-709 checking the current store using the url
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');

        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }
        this.shippingField = SHIPPING_FIELD;
        let result = await checkEvilEyeFrame({ productId: this.productId });
        if (result !== null) {
            this._isEvilEyeFrameProduct = result;
        }

        if (this.productFields[RIMLESS_VARIANT_FIELD] === PICKLIST_VALUE_DEMO && this.productFields[FRAME_TYPE_FIELD] === RIMLESS) {
            this._seeFrameColor = true;
        }

        //Added as part of BS-1255
        let categoryList = JSON.parse(JSON.stringify(this.categoryPath));
        let categoryNameList = [];
        for (let index = 0; index < categoryList.length; index++) {
            categoryNameList.push(categoryList[index].name);
        }
        let categoryBasedAdditionalAttributeList = [];
        if (this.additionalAttributeFieldAndLabelList !== undefined && this.additionalAttributeFieldAndLabelList !== null) {
            let attributeFieldList = JSON.parse(JSON.stringify(this.additionalAttributeFieldAndLabelList));
            for (let index = 0; index < attributeFieldList.length; index++) {
                let isApplicableField = false;
                for (let categoryIndex = 0; categoryIndex < categoryNameList.length; categoryIndex++) {
                    if (attributeFieldList[index].categoryList != null && attributeFieldList[index].categoryList.includes(categoryNameList[categoryIndex])) {
                        isApplicableField = true;
                        break;
                    }
                }
                if (isApplicableField === true) {
                    categoryBasedAdditionalAttributeList.push(attributeFieldList[index]);
                }
                this._additionalAttributeFieldAndLabelList = Array.from(categoryBasedAdditionalAttributeList);
            }
        }

        if (this.additionalAttributeFieldAndLabelList !== undefined && this.productFields !== null) {
            this._frameColorLabel = PDP_LABELS.split(',')[7];
            +' :'; // Fetching label for frame Color that needs to be displayed on UI
            this._frameColorDescription = this.productFields[FRAME_COLOR_DESCRIPTION]; // Fetching value of frame color description from product fields

            this._frameColor = this.productFields[STOCK_KEEPING_UNIT_FIELD] != null ? this.productFields[STOCK_KEEPING_UNIT_FIELD].substring(7, 11) : false;
            if (this.productFields[HEXCODE]) {
                this._backgroundColorUpper = 'background-color: ' + this.productFields[HEXCODE] + ';';
                // Fetching value of Hex accent code if available from product fields that needs to be used in upper color bubble
            } else {
                if (this.productFields[HEX_CODE_ACCENT]) {
                    this._backgroundColorUpper = 'background-color: ' + this.productFields[HEX_CODE_ACCENT] + ';';
                    // Fetching value of Hex code from product fields that needs to be used in upper color bubble
                } else {
                    this._backgroundColorUpper = false;
                }
            }
            if (this.productFields[HEX_CODE_ACCENT]) {
                this._backgroundColorLower = 'background-color: ' + this.productFields[HEX_CODE_ACCENT] + ';';
            } else {
                if (this.productFields[HEXCODE]) {
                    this._backgroundColorLower = 'background-color: ' + this.productFields[HEXCODE] + ';';
                } else {
                    this._backgroundColorLower = false;
                }
            }

            this.populateAdditionalAttribute();
        }
        this._resolveConnected();
        const sparePartPicklist = 'Spare Part';
        const styleShades = 'Style Shades';
        const lenses = 'Lenses';

        //BS-709 checking the brand and handling the calls for the related product links.
        if (this.brand !== EE_BRAND) {
            this.sectionHeader = PDP_SHADES;
            this.triggerProductSearch(styleShades, this._styleShadeIdList);
        }
        this.triggerProductSearch(sparePartPicklist, this._sparePartIdList);

        //BS-709 handling the call for lenses when store is SH and brand of the product is 'evil eye'
        if (currentStore.includes(SH_STORE) && this.brand === EE_BRAND) {
            this._isEvilEyeProduct = true;
            this.sectionHeader = additionalLensesHeaderLabel;
            this.triggerProductSearch(lenses, this._lensesProductIdList);
        }
        if (this.displayDemoButton) {
            this.triggerProductSearch(PICKLIST_VALUE_DEMO, this._demoProdcuctIdList);
        }
        fireEvent(this.pageRef, BRAND_TYPE_EVT, { checkEvilEye: this._isEvilEyeProduct });
        this.triggerGetProductMedia();
    }

    disconnectedCallback() {
        this._connected = new Promise((resolve) => {
            this._resolveConnected = resolve;
        });
    }

    /**
     * Gets or sets the ordered hierarchy of categories to which the product belongs, ordered from least to most specific.
     *
     * @type {Category[]}
     */
    @api
    get categoryPath() {
        return this._categoryPath;
    }

    set categoryPath(newPath) {
        this._categoryPath = newPath;
        this.resolveCategoryPath(newPath || []);
    }

    get hasPrice() {
        return ((this.price || {}).negotiated || '').length > 0;
    }

    get isPriceNotZeroOrFree() {
        return ((this.price || {}).negotiated || '').length > 0 && this.price.negotiated != 0 && this.price.negotiated != -1;
    }

    get isPriceZero() {
        return ((this.price || {}).negotiated || '').length > 0 && this.price.negotiated == 0;
    }

    get isProductFree() {
        return ((this.price || {}).negotiated || '').length > 0 && this.price.negotiated == -1;
    }
    /**
     * Gets whether add to cart button should be displabled
     *
     * Add to cart button should be disabled if quantity is invalid,
     * if the cart is locked, or if the product is not in stock
     */
    get _isAddToCartDisabled() {
        if (this._invalidQuantity || this.cartLocked || this.disableProduct) {
            return true;
        }
        return false;
    }

    //@ToDO: after the creation of the availability JSON field we need to check if the current account is still allowed to order the product - for now just check if the product is disabled
    get isProductDisabled() {
        return this.disableProduct;
    }

    get totalSpareProducts() {
        return this._totalSpareProducts;
    }

    /**
     * Emits a notification that the user wants to add the item to a new wishlist.
     *
     * @fires ProductDetailsDisplay#createandaddtolist
     * @private

    removed the add to list button for now, but only commented out to re-add it in a later phase
    notifyCreateAndAddToList() {
        this.dispatchEvent(new CustomEvent('createandaddtolist'));
    }
    */

    /**
     * Updates the breadcrumb path for the product, resolving the categories to URLs for use as breadcrumbs.
     *
     * @param {Category[]} newPath
     *  The new category "path" for the product.
     */
    resolveCategoryPath(newPath) {
        const path = [homePage].concat(
            newPath.map((level) => ({
                name: level.name,
                type: 'standard__recordPage',
                attributes: {
                    actionName: 'view',
                    recordId: level.id
                }
            }))
        );

        this._connected
            .then(() => {
                const levelsResolved = path.map((level) =>
                    this[NavigationMixin.GenerateUrl]({
                        type: level.type,
                        attributes: level.attributes
                    }).then((url) => ({
                        name: level.name,
                        url: url
                    }))
                );

                return Promise.all(levelsResolved);
            })
            .then((levels) => {
                this._resolvedCategoryPath = levels;
                if (
                    this._resolvedCategoryPath[this._resolvedCategoryPath.length - 1].name == LENSE_CATEGORY ||
                    this._resolvedCategoryPath[this._resolvedCategoryPath.length - 1].name == LENSE_CATEGORY_GERMAN
                ) {
                    this._isLenses = true;
                }
            });
    }

    /**
     * Gets the iterable fields.
     *
     * @returns {IterableField[]}
     *  The ordered sequence of fields for display.
     *
     * @private
     */
    get _displayableFields() {
        // Enhance the fields with a synthetic ID for iteration.
        return (this.customFields || []).map((field, index) => ({
            ...field,
            id: index
        }));
    }

    get displayFields() {
        return this._displayableFields.length > 0 ? true : false;
    }

    demoModal() {
        this.displayData = {};
        this._showDemo = true;
        this.modalHeader = this.demoHeader;

        let valueList = Array.from(this._demoProducts);

        this._startingRecord = (this._pageNumber - 1) * this.pageSizeForPopUp;
        this._endingRecord = this._pageNumber * this.pageSizeForPopUp;

        valueList = valueList.slice(this._startingRecord, this._endingRecord);

        this.demoResults.products = valueList;

        this._totalDemoProducts = this._demoProducts.length;
        this.totalProducts = this._totalDemoProducts;
        this.displayData = this.demoResults;
        this.show();
    }

    @api show() {
        this.showModal = true;
        this.handleShowModal();
    }

    @api hide() {
        this.showModal = false;
        this.handleCloseModal();
    }

    handleShowModal() {
        const modal = this.template.querySelector('c-b2b_modal');
        modal.setWidth('slds-modal_medium');
        modal.show();
    }

    handleCloseModal() {
        const modal = this.template.querySelector('c-b2b_modal');
        modal.hide();
    }

    /**
     * Gets or sets the normalized, displayable results for use by the display components.
     *
     * @private
     */
    get displayData() {
        return this._displayData || {};
    }
    set displayData(data) {
        this._displayData = transformData(data, this.cardContentMapping);
    }

    _shadesData;
    _sectionProductResult;
    _sectionProductData;

    /**
     * Gets or sets the normalized, displayable results for use by the display components.
     * BS-709
     * @private
     */
    get normalizedResultsData() {
        if (this._sectionProductData) {
            this._sectionProductData.layoutData = this._sectionProductData.layoutData.sort(sortBy('name', 1));
            if (this._sectionProductData.layoutData.length > this.pageSize) {
                this.displayArrows = true;
                let auxSectionData = { layoutData: [] };
                let sliceIndex = this.pageSize + this._sectionIndex;
                for (let index = this._sectionIndex; index < sliceIndex; index++) {
                    auxSectionData.layoutData.push(this._sectionProductData.layoutData[index]);
                }
                return auxSectionData;
            }
        }
        return this._sectionProductData;
    }

    set normalizedResultsData(data) {
        if (data != null) {
            this._sectionProductData = transformData(data, this.cardContentMapping);
        }
    }

    get shadesContainerClass() {
        return this.displayArrows == true ? 'slds-align_absolute-center' : 'style-shades-container';
    }

    /**
     * BS-709 - added the logic to hide and show the left arrow icon based on the _sectionIndex
     * updated the variable name
     */
    get leftArrowClass() {
        this._sectionIndex == 0 ? (this._showLeftArrow = false) : (this._showLeftArrow = true);
        return this._sectionIndex == 0 ? 'opacity50 default-cursor' : 'arrow';
    }

    /**
     * BS-709 - added the logic to hide and show the right arrow icon based on the _sectionIndex
     * updated the variable name
     */
    get rightArrowClass() {
        let sliceIndex = this.pageSize + this._sectionIndex;
        sliceIndex < this._sectionProductResult.products.length ? (this._showRightArrow = true) : (this._showRightArrow = false);
        return sliceIndex < this._sectionProductResult.products.length ? 'arrow' : 'opacity50 default-cursor';
    }

    get stockAvailabilityIcon() {
        let availabilityIcon;
        if (this.deliveryStatusJ && this.countryCode) {
            if (this.deliveryStatusJ[this.countryCode.substring(0, 4)] > 0) {
                return (availabilityIcon = STORE_STYLING + '/icons/Available.svg');
            } else {
                return (availabilityIcon = STORE_STYLING + '/icons/Not_Available.svg');
            }
        }
    }

    _pageNumber = 1;

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

    handleRecordIdValueChange(event) {
        let recordId = event.detail;
        this.dispatchEvent(
            new CustomEvent(RECORD_ID_CHANGE, {
                detail: recordId
            })
        );
    }

    triggerProductSearch(type, productIdList) {
        productSearch({
            communityId: communityId,
            effectiveAccountId: this.effectiveAccountId,
            productId: this.productId,
            relationType: type,
            relatedProductIdList: productIdList
        })
            .then((result) => {
                if (result != null) {
                    for (let index = 0; index < result.products.length; index++) {
                        if (result.products[index].error.errorCode != undefined) {
                            result.products.splice(index, 1);
                            index--;
                        }
                    }
                    if (result.products.length == 0) {
                        result = null;
                    }
                }

                if (type == 'Spare Part') {
                    if (result != null) {
                        this.sparePartResults = result;
                        this.sparePartResults.products.forEach((product) => {
                            if (this._sparePartIdList.includes(product.id) == false) {
                                this._sparePartIdList.push(product.id);
                            }
                        });
                        this._spareProducts = this._spareProducts.concat(this.sparePartResults.products);
                        this.triggerProductSearch(type, this._sparePartIdList);
                    } else if (this.sparePartResults == null) {
                        this.sparePartResults = false;
                    }
                } else if (type == 'Demo') {
                    if (result != null) {
                        this.demoResults = result;
                        this.demoResults.products.forEach((product) => {
                            if (this._demoProdcuctIdList.includes(product.id) == false) {
                                this._demoProdcuctIdList.push(product.id);
                            }
                        });
                        this._demoProducts = this._demoProducts.concat(this.demoResults.products);
                        this.triggerProductSearch(type, this._demoProdcuctIdList);
                    } else if (this._demoProducts == null) {
                        this.demoResults = false;
                    }
                } else if (type == 'Style Shades') {
                    if (result != null) {
                        let tempResults = result;
                        tempResults.products.forEach((product) => {
                            this._styleShadeIdList.push(product.id);
                        });
                        if (this._styleShades.length == 0) {
                            this._styleShades = result;
                        } else {
                            this._styleShades.products = this._styleShades.products.concat(result.products);
                            this._styleShades.total = this._styleShades.products.length;
                        }
                        this.triggerProductSearch(type, this._styleShadeIdList);
                        this.normalizedResultsData = this._styleShades;
                        this._sectionProductResult = this._styleShades;
                    } else if (this._styleShades == null) {
                        this.normalizedResultsData = null;
                    }
                } else if (type == 'Lenses') {
                    /**
                     * Checking if the type is lenses fetching the product links.
                     * Added as part of BS-709
                     */
                    if (result != null) {
                        let tempResults = result;
                        tempResults.products.forEach((product) => {
                            this._lensesProductIdList.push(product.id);
                        });
                        if (this._lensesProducts.length == 0) {
                            this._lensesProducts = result;
                        } else {
                            this._lensesProducts.products = this._lensesProducts.products.concat(result.products);
                            this._lensesProducts.total = this._lensesProducts.products.length;
                        }
                        this.triggerProductSearch(type, this._lensesProductIdList);
                        this.normalizedResultsData = this._lensesProducts;
                        this._sectionProductResult = this._lensesProducts;
                    } else if (this._lensesProducts == null) {
                        this.lensesProducts = null;
                    }
                }
                this.dispatchEvent(
                    new CustomEvent('loadingproduct', {
                        detail: {
                            loading: false
                        }
                    })
                );
            })
            .catch((error) => {
                console.log('Error: ' + JSON.stringify(error));
            });
    }

    //384
    /**
     * Return the Product Description.
     */
    get productDescriptionValue() {
        let productDescriptionValueText = this.decodeHTMLEntities(this.productDescription);
        if (
            this._isSilhouetteStore === true &&
            productDescriptionValueText != null &&
            productDescriptionValueText != undefined &&
            productDescriptionValueText.length != undefined &&
            productDescriptionValueText.length > 110
        ) {
            this._showMoreButton = true;
        } else if (
            this._isSilhouetteStore === false &&
            productDescriptionValueText != null &&
            productDescriptionValueText != undefined &&
            productDescriptionValueText.length != undefined &&
            productDescriptionValueText.length > 89
        ) {
            this._showMoreButton = true;
        }
        return this.decodeHTMLEntities(this.productDescription);
    }

    /**
     * Decode the string from HTML Entities to String.
     *
     * @type {String}
     */
    decodeHTMLEntities(text) {
        var entities = [
            ['amp', '&'],
            ['apos', "'"],
            ['#x27', "'"],
            ['#x2F', '/'],
            ['#39', "'"],
            ['#47', '/'],
            ['lt', '<'],
            ['gt', '>'],
            ['nbsp', ' '],
            ['quot', '"']
        ];
        if (text) {
            entities.forEach((item) => {
                text = text.replace(new RegExp('&' + item[0] + ';', 'g'), item[1]);
            });
            return text;
        }
    }

    triggerGetProductMedia() {
        getProductMedia({
            productId: this.productId
        })
            .then((result) => {
                if (result.length > 0) {
                    this.productMedias = JSON.parse(JSON.stringify(result));
                    //Added as part of BS-709 to add the linkout to dealer catalogue if product Medias are present for the product
                    if (this._isEvilEyeFrameProduct === true && this.productMedias !== null) {
                        let dealerCatalogueObj = {
                            mediaType: this._dealerCatalogue,
                            mediaUrl: this._evilEyeProductCatalogueLink
                        };
                        this.productMedias.push(dealerCatalogueObj);
                    }
                }

                //Added as part of BS-709 to add the linkout to dealer catalogue if no product Medias are present for the product
                else if (this._isEvilEyeFrameProduct === true) {
                    this.productMedias = [];
                    let dealerCatalogueObj = {
                        mediaType: this._dealerCatalogue,
                        mediaUrl: this._evilEyeProductCatalogueLink
                    };
                    this.productMedias.push(JSON.parse(JSON.stringify(dealerCatalogueObj)));
                } else {
                    this.productMedias = false;
                }
            })
            .catch((error) => {
                console.log('Error: ' + JSON.stringify(error));
            });
    }

    handlePreviousPage() {
        this._pageNumber = this._pageNumber - 1;
        if (this._showSpare) {
        }
        if (this._showDemo) {
            this.demoModal();
        }
    }

    handleNextPage() {
        this._pageNumber = this._pageNumber + 1;
        if (this._showSpare) {
        }
        if (this._showDemo) {
            this.demoModal();
        }
    }

    /**
     * Method which controls the visibility of additional attribute section and updated the labels accordingly.
     * BS-709
     */
    updateShowMore() {
        if (this._showMoreBoolean === false) {
            this._additionalAttributeLabel = this._showLess;
            this._showMoreBoolean = true;
            localStorage.setItem(SHOW_MORE_SELECTION, this._showMoreBoolean);
        } else {
            this._additionalAttributeLabel = this._showMore;
            this._showMoreBoolean = false;
            localStorage.setItem(SHOW_MORE_SELECTION, this._showMoreBoolean);
        }
    }

    handleHidePriceSection() {
        this._hideSilhouettePricesFromTile = true;
    }

    handleShowPriceSection() {
        this._hideSilhouettePricesFromTile = false;
    }
    showCompleteDescription() {
        this._productDescriptionClass = 'slds-m-top_x-small justify-text descriptionreadless';
        this._readButtonClass = 'framecolorbubble-container read-less-button readButton ';
        this._showLessButton = true;
    }
    hideDescription() {
        this._productDescriptionClass = 'slds-m-top_x-small justify-text descriptionreadmore';
        this._readButtonClass = 'framecolorbubble-container read-more-button readButton';
        this._showLessButton = false;
    }

    //BS-788 gets called from attribute field set component when custom event get fire
    setProductSizes(event) {
        this.sendSelectedProductInfoToParent(event.detail.data);
    }

    //BS-788
    /*This funtion is used to combine all selected product/frame data and sending to parent component
    container.
    @param productSizesData = having selected frame/product size data
    */
    @api
    sendSelectedProductInfoToParent(productSizesData) {
        const takenRequiredProductData = {};

        takenRequiredProductData.productIdPDP = this.productId;
        takenRequiredProductData.selectedFrameSKU = this.sku;

        if (this.collectionDesignFamily !== null && this.collectionDesignFamily !== undefined) {
            takenRequiredProductData.collectionDesignFamily = this.collectionDesignFamily;
        } else {
            takenRequiredProductData.collectionDesignFamily = '';
        }

        //BS-1701 - Start
        if (this.modelNameNumber !== null && this.modelNameNumber !== undefined) {
            takenRequiredProductData.modelNameNumber = this.modelNameNumber;
        } else {
            takenRequiredProductData.modelNameNumber = '';
        }
        //BS-1701 - End

        if (this.frameColorDescription !== null && this.frameColorDescription !== undefined) {
            takenRequiredProductData.frameColorDescription = this.frameColorDescription;
        } else {
            takenRequiredProductData.frameColorDescription = '';
        }

        if (this.productData) {
            takenRequiredProductData.frameType =
                this.productData.frameType != undefined && this.productData.frameType != null ? this.productData.frameType : '';
            takenRequiredProductData.model = this.productData.model != undefined && this.productData.model != null ? this.productData.model : '';
        }

        if (this.productData.variationAttributeSet !== null && this.productData.variationAttributeSet !== undefined) {
            if (this.productData.variationAttributeSet.attributes !== null && this.productData.variationAttributeSet.attributes !== undefined) {
                if (JSON.stringify(this.productData.variationAttributeSet.attributes).includes('B2B_Color__c')) {
                    takenRequiredProductData.frameColor = this.productData.variationAttributeSet.attributes.B2B_Color__c;
                } else {
                    if (this._seeFrameColor === true) {
                        takenRequiredProductData.frameColor =
                            this.productFields[STOCK_KEEPING_UNIT_FIELD] !== null ? this.productFields[STOCK_KEEPING_UNIT_FIELD].substring(7, 11) : '';
                    } else {
                        takenRequiredProductData.frameColor = '';
                    }
                }
                if (this.productFields.B2B_EE_Size__c !== undefined && this.productFields.B2B_EE_Size__c !== null) {
                    takenRequiredProductData.size = this.productFields.B2B_EE_Size__c;
                } else {
                    takenRequiredProductData.size = '';
                }
            } else {
                if (this._seeFrameColor === true) {
                    takenRequiredProductData.frameColor =
                        this.productFields[STOCK_KEEPING_UNIT_FIELD] != null ? this.productFields[STOCK_KEEPING_UNIT_FIELD].substring(7, 11) : '';
                } else {
                    takenRequiredProductData.frameColor = '';
                }
            }
        } else {
            if (this._seeFrameColor === true) {
                takenRequiredProductData.frameColor =
                    this.productFields[STOCK_KEEPING_UNIT_FIELD] != null ? this.productFields[STOCK_KEEPING_UNIT_FIELD].substring(7, 11) : '';
            } else {
                takenRequiredProductData.frameColor = '';
            }
        }

        if (this.productData.images.length == 0) {
            takenRequiredProductData.image = this.productData.image.url;
        } else {
            takenRequiredProductData.image = this.productData.images[0].imageUrl;
        }
        /* Start : BS-2158/BS-2174 */
        takenRequiredProductData.hexcode = this.productData.hexcode;
        takenRequiredProductData.hexcodeAccent = this.productData.hexcodeAccent;
        /* End : BS-2158/BS-2174 */
        //Assiging selected frame size data
        for (let sizeData in productSizesData) {
            if (productSizesData[sizeData].name == 'B2B_Bridge_Size__c') {
                takenRequiredProductData.bridgeSize = productSizesData[sizeData].value;
            } else if (productSizesData[sizeData].name == 'B2B_Lens_Size__c') {
                takenRequiredProductData.lensSize = productSizesData[sizeData].value;
            } else if (productSizesData[sizeData].name == 'B2B_Temple_Length__c') {
                takenRequiredProductData.templeLength = productSizesData[sizeData].value;
            }
        } //end for

        //Sending selected frame/product info to parent container
        this.dispatchEvent(
            new CustomEvent(SEND_SELECTED_PRODUCT_DATA, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    productData: takenRequiredProductData
                }
            })
        );
    }

    /**
     * BS-1255
     * Method to populate all the data in the object to be shown on additional attribute section on UI.
     */
    populateAdditionalAttribute() {
        let attributeColorMap = new Map();
        let colorLabelMap = new Map();
        let colorsMap = [
            { apiName: LENS_COLOR, colorsList: [] },
            { apiName: MIRROR_COLOR, colorsList: [] },
            { apiName: FRAME_ACCENT_COLOR, colorsList: [] }
        ];
        //BS-1005 color labels to show on UI
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
        this._colorVsColorLabelMap.set(BRASS_COLOR.split(',')[0], BRASS_COLOR.split(',')[1]); //BS-1005 end
        for (let element of this._customMetadataColors.values()) {
            let backgroundStyle = STYLE_DISPLAY_NONE;
            colorsMap.forEach((color) => {
                color.colorsList.push({
                    colorName: element.Label,
                    colorHex: element.B2B_Color_code__c,
                    colorNameTitle:
                        this._colorVsColorLabelMap.has(element.B2B_Color_name__c) == true ? this._colorVsColorLabelMap.get(element.B2B_Color_name__c) : '',
                    colorStyle: backgroundStyle,
                    transparent: element.B2B_Color_name__c == TRANSPARENT ? true : false
                });
            });
        }
        if (this.productFields[LENS_COLOR] != null) {
            colorsMap[0].colorsList.forEach((color) => {
                if (color.colorName == this.productFields[LENS_COLOR]) {
                    if (color.transparent) {
                        attributeColorMap.set(LENS_COLOR, 'background: url(' + this._transparentURI + ')');
                        colorLabelMap.set(LENS_COLOR, color.colorNameTitle);
                    } else {
                        attributeColorMap.set(LENS_COLOR, 'background: ' + color.colorHex);
                        colorLabelMap.set(LENS_COLOR, color.colorNameTitle);
                    }
                }
            });
        }
        if (this.productFields[MIRROR_COLOR] != null) {
            colorsMap[1].colorsList.forEach((color) => {
                if (color.colorName == this.productFields[MIRROR_COLOR]) {
                    if (color.transparent) {
                        attributeColorMap.set(MIRROR_COLOR, 'background: url(' + this._transparentURI + ')');
                        colorLabelMap.set(MIRROR_COLOR, color.colorNameTitle);
                    } else {
                        attributeColorMap.set(MIRROR_COLOR, 'background: ' + color.colorHex);
                        colorLabelMap.set(MIRROR_COLOR, color.colorNameTitle);
                    }
                }
            });
        }
        if (this.productFields[FRAME_ACCENT_COLOR] != null) {
            colorsMap[1].colorsList.forEach((color) => {
                if (color.colorName == this.productFields[FRAME_ACCENT_COLOR]) {
                    if (color.transparent) {
                        attributeColorMap.set(FRAME_ACCENT_COLOR, 'background: url(' + this._transparentURI + ')');
                        colorLabelMap.set(FRAME_ACCENT_COLOR, color.colorNameTitle);
                    } else {
                        attributeColorMap.set(FRAME_ACCENT_COLOR, 'background: ' + color.colorHex);
                        colorLabelMap.set(FRAME_ACCENT_COLOR, color.colorNameTitle);
                    }
                }
            });
        }

        const arr = Array.from(this.additionalAttributeFieldAndLabelList);
        let fieldValue;
        let hasMultipleValues;
        let fieldIcon;
        let labelValue;
        let isColorFieldValue;
        let bubbleColorValue;
        let bubbleColorName;
        arr.forEach((item) => {
            if (this.productFields[item.fieldName] !== null && parseInt(this.productFields[item.fieldName]) !== 0) {
                hasMultipleValues = false;
                //Handling Date fields.
                if (item.isDateField == true) {
                    let launchDate = new Date(this.productFields[item.fieldName]);
                    fieldValue = new Intl.DateTimeFormat('de-AT', DATE_FORMAT).format(launchDate);
                    hasMultipleValues = false;
                } else {
                    //Handling the multi select picklist values
                    if (this.productFields[item.fieldName] !== null && this.productFields[item.fieldName].includes(';')) {
                        let dataItemList = this.productFields[item.fieldName].split(';');
                        fieldValue = dataItemList;
                        hasMultipleValues = true;
                    } else {
                        fieldValue = this.productFields[item.fieldName];
                        hasMultipleValues = false;
                    }
                }
                //Populating the labels in the field data object
                if (item.fieldName === BRIDGE_SIZE_FIELD) {
                    fieldIcon = this.bridgeSize.icon;
                } else if (item.fieldName === LENS_SIZE_FIELD) {
                    //Added as Part Of BS-838
                    fieldIcon = this.lensSize.icon; //Added as Part Of BS-838
                } else if (item.fieldName === TEMPLE_LENGTH_FIELD) {
                    fieldIcon = this.templeLength.icon;
                } else {
                    fieldIcon = false;
                }
                //Showing unit of measurement
                if (item.fieldName === SHAPE_AREA_FIELD) {
                    labelValue = item.fieldLabel + ' ' + productAttributeUnits.split(',')[2];
                } else if (item.fieldName === FRAME_SHAPE_HEIGHT_FIELD) {
                    labelValue = item.fieldLabel + ' ' + productAttributeUnits.split(',')[0];
                } else if (item.fieldName === FRAME_WIDTH_FIELD) {
                    labelValue = item.fieldLabel + ' ' + productAttributeUnits.split(',')[0];
                } else if (item.fieldName === WEIGHT_FIELD) {
                    labelValue = item.fieldLabel + ' ' + productAttributeUnits.split(',')[1];
                } else {
                    labelValue = item.fieldLabel;
                }

                //Pouplating Color Values
                if (item.fieldName === LENS_COLOR) {
                    isColorFieldValue = true;
                    bubbleColorValue = attributeColorMap.has(LENS_COLOR) ? attributeColorMap.get(LENS_COLOR) : (isColorFieldValue = false);
                    bubbleColorName = colorLabelMap.has(LENS_COLOR) ? colorLabelMap.get(LENS_COLOR) : (isColorFieldValue = false);
                } else if (item.fieldName === MIRROR_COLOR) {
                    isColorFieldValue = true;
                    bubbleColorValue = attributeColorMap.has(MIRROR_COLOR) ? attributeColorMap.get(MIRROR_COLOR) : (isColorFieldValue = false);
                    bubbleColorName = colorLabelMap.has(MIRROR_COLOR) ? colorLabelMap.get(MIRROR_COLOR) : (isColorFieldValue = false);
                } else if (item.fieldName === FRAME_ACCENT_COLOR) {
                    labelValue = ACCENT_COLOR; //BS-1579
                    isColorFieldValue = true;
                    bubbleColorValue = attributeColorMap.has(FRAME_ACCENT_COLOR) ? attributeColorMap.get(FRAME_ACCENT_COLOR) : (isColorFieldValue = false);
                    bubbleColorName = colorLabelMap.has(FRAME_ACCENT_COLOR) ? colorLabelMap.get(FRAME_ACCENT_COLOR) : (isColorFieldValue = false);
                } else {
                    isColorFieldValue = false;
                    bubbleColorValue = null;
                    bubbleColorName = null;
                }

                let fieldValueObj = {
                    label: labelValue,
                    dataValue: fieldValue,
                    containsMultipleValues: hasMultipleValues,
                    icon: fieldIcon,
                    isColorField: isColorFieldValue,
                    bubbleColor: bubbleColorValue,
                    colorName: bubbleColorName
                };
                this._additionalAttributeObjectListCopy.push(fieldValueObj);
            }
        });

        //Block which identifies the fields with multiple values and pushed them to last
        let fieldWithUniqueValue = [];
        this._additionalAttributeObjectListCopy.forEach((item) => {
            if (item.containsMultipleValues == true) {
                this._additionalAttributeWithMultipleValuesObjectList.push(item);
            } else {
                fieldWithUniqueValue.push(item);
            }
        });
        this._additionalAttributeObjectListCopy = [];
        this._additionalAttributeObjectListCopy = fieldWithUniqueValue;

        if (this._additionalAttributeWithMultipleValuesObjectList.length > 0) {
            this._additionalAttributeObjectListCopy.push(...this._additionalAttributeWithMultipleValuesObjectList);
            this._additionalAttributeObjectList = Array.from(this._additionalAttributeObjectListCopy);
        } else {
            this._additionalAttributeObjectList = Array.from(this._additionalAttributeObjectListCopy);
        }
    }
}
