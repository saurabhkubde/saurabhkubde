import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import PLP_LABELS from '@salesforce/label/c.B2B_PLP_Product_Details';
import B2B_MISSING_PRICE_LABELS from '@salesforce/label/c.B2B_MISSING_PRICE_LABELS'; //BS-1951
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';
import { checkProductAvailability, getDeliveryTime, getApplicableAvailabilityStatusIcon } from 'c/b2b_utils'; //BS-588 //BS-644

// DEMO_VALUE VALUE
const DEMO_VALUE = 'Demo';
const PAGE_SOURCE_PLP = 'PLP'; // Added for BS-740
const PAGE_SOURCE_REORDER = 'Reorder'; //Added for reorder page source check --> BS-650
const SH_STORE = 'silhouette';
const SUN_PROTECTION_SPARE_PART_TYPE = 'Sun protection lens'; //BS-740
const SUN_PROTECTION_SPARE_PART_TYPE_GERMAN = 'Sonnenschutzglas'; //BS-740
const EVIL_EYE_BRAND_TYPE = 'evil eye'; //BS-740
const EVIL_EYE_URL = 'evil-eye/lenses'; // Added for BS-740
const SEPERATOR_STRING = ' | ';
const PRODUCT_SIZE = 'productSize'; //BS-1429
const RX_STORE = 'RX'; //BS-1429

//Added for reorder page source check --> BS-650
const DATE_FORMAT = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
};

/**
 * An organized display of a single product card.
 *
 * @fires SearchCard#calltoaction
 * @fires SearchCard#showdetail
 */

export default class B2b_vs_rx_search_card extends NavigationMixin(LightningElement) {
    /**
     * An event fired when the user clicked on the action button. Here in this
     *  this is an add to cart button.
     *
     * Properties:
     *   - Bubbles: true
     *   - Composed: true
     *   - Cancelable: false
     *
     * @event SearchLayout#calltoaction
     * @type {CustomEvent}
     *
     * @property {String} detail.productId
     *   The unique identifier of the product.
     *
     * @export
     */

    /**
     * An event fired when the user indicates a desire to view the details of a product.
     *
     * Properties:
     *   - Bubbles: true
     *   - Composed: true
     *   - Cancelable: false
     *
     * @event SearchLayout#showdetail
     * @type {CustomEvent}
     *
     * @property {String} detail.productId
     *   The unique identifier of the product.
     *
     * @export
     */

    /**
     * A result set to be displayed in a layout.
     * @typedef {object} Product
     *
     * @property {string} id
     *  The id of the product
     *
     * @property {string} name
     *  Product name
     *
     * @property {Image} image
     *  Product Image Representation
     *
     * @property {object.<string, object>} fields
     *  Map containing field name as the key and it's field value inside an object.
     *
     * @property {Prices} prices
     *  Negotiated and listed price info
     */

    /**
     * A product image.
     * @typedef {object} Image
     *
     * @property {string} url
     *  The URL of an image.
     *
     * @property {string} title
     *  The title of the image.
     *
     * @property {string} alternativeText
     *  The alternative display text of the image.
     */

    /**
     * Prices associated to a product.
     *
     * @typedef {Object} Pricing
     *
     * @property {string} listingPrice
     *  Original price for a product.
     *
     * @property {string} negotiatedPrice
     *  Final price for a product after all discounts and/or entitlements are applied
     *  Format is a raw string without currency symbol
     *
     * @property {string} currencyIsoCode
     *  The ISO 4217 currency code for the product card prices listed
     */

    /**
     * Card layout configuration.
     * @typedef {object} CardConfig
     *
     * @property {Boolean} showImage
     *  Whether or not to show the product image.
     *
     * @property {string} resultsLayout
     *  Products layout. This is the same property available in it's parent
     *  {@see LayoutConfig}
     *
     * @property {Boolean} actionDisabled
     *  Whether or not to disable the action button.
     */

    /**
     * Gets or sets the display data for card.
     *
     * @type {Product}
     */
    @api
    displayData;

    /**
     * Gets or sets the card layout configurations.
     *
     * @type {CardConfig}
     */
    @api
    config;

    @api
    countryCode;

    @api
    shippingPicklistValues;

    @api
    hidePricesFromTiles;

    quantity = 1;
    unavailablePrice = PLP_LABELS.split(',')[0];
    priceUnavailableTitle = B2B_MISSING_PRICE_LABELS.split(',')[2]; //BS-1951
    originalPrice = PLP_LABELS.split(',')[1];
    cartLabel = PLP_LABELS.split(',')[2];
    skuLabel = PLP_LABELS.split(',')[3];

    @track _pageSourcePLP = false; //Added for BS-402

    @track
    deliveryInformationCollection; //BS-644
    _seperatorString = SEPERATOR_STRING;

    //BS-528
    @api
    demoVsChassisObjList;

    //BS-740
    @track
    _isLenses = false;

    @api
    showChassisButtons;

    @api pageSource;

    @track _showAdditionalInfoForEvilEye = false; //BS-740
    @track _additionalInfoForEvilEyeData = {}; //BS-740

    //Object for referring the proper icon to show availability of products on PDP.
    _availabilityIcons = {};
    _isSilhouetteStore = false;
    //Added as part of BS-675
    @track _productSize;
    @api isEvilEye;
    _productOneSize = 'One Size';

    //Added as part of BS-650
    @api effectiveAccountId;
    @api orderSource; // BS-650

    /**
     * Used to store the values of order source and last order date.
     * BS-650
     */
    @track _orderData = {};

    calenderIcon = STORE_STYLING + '/icons/calender.svg';
    isEEBrand; //BS-652

    @api
    applicableCurrencyCode; //BS-1245

    //BS-1431
    @api
    storeType;

    _isRXStore = false; //BS-1429
    /**
     * The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.
     */
    connectedCallback() {
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');
        let pageUrl = window.location.href;
        if (pageUrl.includes('evil-eye')) {
            //BS-652
            this.isEEBrand = true;
            this.template.host.style.setProperty('--card-box-shadow', '0 0 11px rgb(33 33 33 / 20%)');
            this.template.host.style.setProperty('--card-border-solid', 'none');
        } else {
            this.isEEBrand = false;
            this.template.host.style.setProperty('--card-border-solid', 'solid 1px #D8D8D8');
        }
        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }
        if (this.pageSource == PAGE_SOURCE_PLP) {
            this._pageSourcePLP = true;
        } else {
            this._pageSourcePLP = false;
        }

        //Added for BS-740
        let pageURL = window.location.href;
        if (pageURL.includes(EVIL_EYE_URL)) {
            this._isLenses = true;
        } else {
            this._isLenses = false;
        }

        if (
            this.displayData.fields[0]['brand'] == EVIL_EYE_BRAND_TYPE &&
            this.pageSource == PAGE_SOURCE_PLP &&
            (this.displayData.fields[0]['sparepartType'] == SUN_PROTECTION_SPARE_PART_TYPE ||
                this.displayData.fields[0]['sparepartType'] == SUN_PROTECTION_SPARE_PART_TYPE_GERMAN)
        ) {
            this._showAdditionalInfoForEvilEye = true;
            this._additionalInfoForEvilEyeData = this.displayData.fields;
        } else {
            this._showAdditionalInfoForEvilEye = false;
        }

        //Added for showing correct icons on PLP.
        this._availabilityIcons.availableIcon = STORE_STYLING + '/icons/Available.svg';
        this._availabilityIcons.unavailableIcon = STORE_STYLING + '/icons/Not_Available.svg';
        //Below if is added as part of BS-1429
        if (this.storeType == RX_STORE) {
            this._isRXStore = true;
        }
    }

    /**
     * Gets the product image.
     *
     * @type {Image}
     * @readonly
     * @private
     */
    get image() {
        return this.displayData.image || {};
    }

    /**
     * boolean field showing/hiding PurchasePriceField as per BS-2273.
     *
     * @type {boolean}
     */
    @api
    hidePurchasePriceFieldValue;

    get hidePurchasePriceField() {
        if (this.hidePurchasePriceFieldValue != undefined) {
            return this.hidePurchasePriceFieldValue;
        }
        return true;
    }

    /**
     * boolean field showing/hiding SuggestedRetailPriceField as per BS-2273.
     *
     * @type {boolean}
     */
    @api
    hideSuggestedRetailPriceFieldValue;

    get hideSuggestedRetailPriceField() {
        if (this.hideSuggestedRetailPriceFieldValue != undefined) {
            return this.hideSuggestedRetailPriceFieldValue;
        }
        return true;
    }

    /**
     * Gets the product fields.
     *
     * @type {object.<string, object>[]}
     * @readonly
     * @private
     */
    get fields() {
        //Added as part of BS-530
        let productName;
        let nameDescriptionValue;
        if (this.displayData.fields[0]['sparepartType'] != null) {
            productName = this.displayData.fields[0]['sparepartType'] + ' ' + this.displayData.fields[0]['value'];
        } else {
            productName = this.displayData.fields[0]['value'];
        }

        if (this.displayData.fields[0]['name'] === 'Name') {
            nameDescriptionValue = productName;
        } else if (this.displayData.fields[0]['name'] === 'Description') {
            nameDescriptionValue = this.displayData.fields[0]['value'];
        }

        return (this.displayData.fields || []).map(
            (
                {
                    name,
                    value,
                    deliveryTimeJSON,
                    deliveryStatusJSON,
                    sku,
                    disableProduct,
                    frameColor,
                    frameColorName,
                    frameAccentColor,
                    frameAccentName,
                    hexCode,
                    hexAccentCode,
                    model
                },
                id
            ) => ({
                id: id + 1,
                tabIndex: id === 0 ? 0 : -1,
                // making the first field bit larger
                class: id ? 'slds-truncate slds-text-heading_small' : 'slds-truncate slds-text-heading_medium',
                // making Name and Description shows up without label
                // Note that these fields are showing with apiName. When builder
                // can save custom JSON, there we can save the display name.
                value: name === 'Name' || name === 'Description' ? nameDescriptionValue : `${name}: ${value}`, //Added as part of BS-530
                deliveryTimeJSON: deliveryTimeJSON != null ? deliveryTimeJSON : null, //BS-644
                deliveryStatus: deliveryTimeJSON != null ? this.getDeliveryInformation(deliveryTimeJSON) : false, //BS-644
                stockAvailable: deliveryTimeJSON != null ? this.getDeliveryInformation(deliveryTimeJSON) : false, //BS-644
                sku: sku,
                model: model,
                disableProduct: checkProductAvailability(deliveryStatusJSON, this.countryCode),
                frameColor: frameColor != null ? frameColor : false,
                frameColorName: frameColorName != null ? frameColorName : '',
                frameAccentColor: frameAccentColor != null ? frameAccentColor : false,
                frameAccentName: frameAccentName != null ? frameAccentName : '',
                hexCode: hexCode != null ? hexCode : false,
                hexAccentCode: hexAccentCode != null ? hexAccentCode : false,
                backgroundColorUpper: hexCode != null ? 'background-color: ' + hexCode : false,
                backgroundColorLower: hexAccentCode != null ? 'background-color: ' + hexAccentCode : hexCode != null ? 'background-color: ' + hexCode : false
            })
        );
    }

    //BS-644
    getDeliveryInformation(deliveryTimeJSON) {
        if (deliveryTimeJSON != null && deliveryTimeJSON != undefined && deliveryTimeJSON != '') {
            const deliveryInformationCollection = {};
            deliveryInformationCollection.status = getDeliveryTime(deliveryTimeJSON, this.shippingPicklistValues, this.countryCode);
            deliveryInformationCollection.styling = getApplicableAvailabilityStatusIcon(deliveryInformationCollection.status);
            this.deliveryInformationCollection = deliveryInformationCollection;
            return deliveryInformationCollection;
        } else {
            return null;
        }
    }

    get colorBubble() {
        let auxBubble = {
            bubbleTitle: this.displayData.fields['frameColor'] != null ? this.displayData.fields['frameColor'] : null,
            backgroundColorUpper: this.fields[0].hexCode != null ? 'backroung-color: ' + this.fields[0].hexCode : false,
            backgroundColorLower:
                this.displayData.fields['hexAccentCode'] != null
                    ? 'backroung-color: ' + this.displayData.fields['hexAccentCode']
                    : this.displayData.fields['hexCode'] != null
                    ? 'backroung-color: ' + this.displayData.fields['hexCode']
                    : false
        };

        return auxBubble;
    }

    /**
     * Whether or not the product image to be shown on card.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get showImage() {
        return !!(this.config || {}).showImage;
    }

    /**
     * Whether or not disable the action button.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get actionDisabled() {
        if ((this.config || {}).actionDisabled || this.fields[0].disableProduct) {
            return true;
        }
        return false;
    }

    /**
     * Gets the product price.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get price() {
        const prices = this.displayData.prices;
        return prices.negotiatedPrice || prices.listingPrice;
    }

    /**
     * Whether or not the product has price.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get hasPrice() {
        return !!this.price; //BS-1951
    }

    get isPriceNotZeroOrFree() {
        return this.price && this.price != 0 && this.price != -1 ? true : false; //BS-1951
    }

    get isPriceZero() {
        return this.price && this.price == 0 ? true : false;
    }

    get isProductFree() {
        return this.price && this.price == -1 ? true : false;
    }

    /**
     * Gets the original price for a product, before any discounts or entitlements are applied.
     *
     * @type {string}
     */
    get listingPrice() {
        return this.displayData.prices.listingPrice;
    }

    /**
     * Gets whether or not the listing price can be shown
     * @returns {Boolean}
     * @private
     */
    get canShowListingPrice() {
        const prices = this.displayData.prices;

        return (
            prices.negotiatedPrice &&
            prices.listingPrice &&
            // don't show listing price if it's less than or equal to the negotiated price.
            Number(prices.listingPrice) > Number(prices.negotiatedPrice)
        );
    }

    /**
     * Gets the currency for the price to be displayed.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get currency() {
        //BS-1245
        return this.applicableCurrencyCode != undefined && this.applicableCurrencyCode != null
            ? this.applicableCurrencyCode
            : this.displayData.prices.currencyIsoCode;
    }

    /**
     * Gets the container class which decide the innter element styles.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get cardContainerClass() {
        return this.config.resultsLayout === 'grid' ? 'slds-box card-layout-grid' : 'card-layout-list';
    }

    get isProductDisabled() {
        return this.fields[0].disableProduct;
    }

    //@ToDO: after the creation of the availability JSON field we need to check if the current account is still allowed to order the product - for now just check if the product is disabled
    get showOpacity() {
        return this.fields[0].disableProduct ? 'opacity50' : '';
    }

    /**
     * Emits a notification that the user indicates a desire to view the details of a product.
     *
     * @fires SearchCard#showdetail
     * @private
     */
    notifyShowDetail(evt) {
        evt.preventDefault();
        this.dispatchEvent(
            new CustomEvent('showdetail', {
                bubbles: true,
                composed: true,
                detail: { productId: this.displayData.id }
            })
        );
    }

    //Added as part of BS-1429
    get productSize() {
        if (this.displayData.fields[0][PRODUCT_SIZE] != null && !this.displayData.fields[0][PRODUCT_SIZE].includes(this._productOneSize)) {
            return this.displayData.fields[0][PRODUCT_SIZE];
        } else {
            return null;
        }
    }
}
