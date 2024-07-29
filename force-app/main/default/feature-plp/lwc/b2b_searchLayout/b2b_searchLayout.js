import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import CODE_FIELD from '@salesforce/schema/Account.k_ARIS_Account_ID__c';
import SHIPPING_FIELD from '@salesforce/schema/Product2.B2B_Shipping_Status__c';
import PRODUCT_OBJECT from '@salesforce/schema/Product2';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import HIDE_PURCHASE_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Purchase_Price__c'; //BS-2273
import HIDE_SUGGESTED_RETAIL_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Suggested_Retail_Price__c'; //BS-2273

/**
 * An organized display of product cards.
 *
 * @fires SearchLayout#calltoaction
 * @fires SearchLayout#showdetail
 */
const fields = [CODE_FIELD, HIDE_PURCHASE_PRICE_FIELD, HIDE_SUGGESTED_RETAIL_PRICE_FIELD];
const SH_STORE = 'silhouette';

export default class SearchLayout extends LightningElement {
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
     * Layout configuration.
     * @typedef {object} LayoutConfig
     *
     * @property {string} resultsLayout
     *  Products layout.
     *  Supported (case-sensitive) values are:
     *  - "grid"
     *      The products will be displayed in grid column layout.
     *      The property gridMaxColumnsDisplayed defines the max no. of columns.
     *  - "list"
     *      The products will be displayed as a list.
     *
     * @property {CardConfig} cardConfig
     *   Card layout configuration.
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
     */

    /**
     * Gets or sets the display data for layout.
     *
     * @type {Product[]}
     */
    @api
    displayData;

    /**
     * BS-402
     * The pageSource used to determine current page details
     *
     * @type {string}
     */
    @api
    pageSource;

    // BS-528
    @api
    demoVsChassisProductMap;

    // BS-528
    @api
    showChassisButton;
    _isSilhouetteStore = false;

    /**
     * Gets or sets the layout configurations.
     *
     * @type {LayoutConfig}
     */
    @api
    config;

    @api
    effectiveAccountId;

    @api
    hidePricesFromTiles;

    @api
    isEvilEye; //Added as part of BS-675

    @api orderSource; // BS-650

    @api
    clipOnLayout;

    @api
    applicableCurrencyCode; //BS-1245
    @api
    productIdVsColourCountAndSize; //BS-2226

    @api
    productIdVsBridgeTempleCount; //BS-2226

    @wire(getRecord, { recordId: '$effectiveAccountId', fields })
    account;

    get countryCode() {
        if (this.account.data) {
            return getFieldValue(this.account.data, CODE_FIELD).substring(0, 4);
        } else {
            return null;
        }
    }

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

    @api
    dateFormat; //BS-2142

    @wire(getObjectInfo, { objectApiName: PRODUCT_OBJECT })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: '$shippingField'
    })
    shippingPicklistValues;

    /**
     * Gets the container class which decide the innter element styles.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get layoutContainerClass() {
        return this.config.resultsLayout === 'grid' ? 'layout-grid' : 'layout-list';
    }

    shippingField;

    connectedCallback() {
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');

        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }
        this.shippingField = SHIPPING_FIELD;
    }
}
