import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

//Store Styling
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';

import { checkProductAvailability, getDeliveryTime, getApplicableAvailabilityStatusIcon } from 'c/b2b_utils'; //BS-588 //BS-644

import getOrderAdditionalInformation from '@salesforce/apex/B2B_ReorderComponentController.getOrderAdditionalInformation';
import getRecommendedRetailPrice from '@salesforce/apex/B2B_ProductDetailsController.getRecommendedRetailPrice'; //Added as part of BS-880
import getShowRecommendedRetailPrice from '@salesforce/apex/B2B_ProductDetailsController.getShowRecommendedRetailPrice'; // Added as part of BS-880

//LABELS
import PLP_LABELS from '@salesforce/label/c.B2B_PLP_Product_Details';
import seeChassisButtonLabel from '@salesforce/label/c.B2B_See_Chassis_Button_Label';
import PDP_LABELS from '@salesforce/label/c.B2B_PDP_InfoLabels';
import NEW_BADGE from '@salesforce/label/c.B2B_NEW_COLLECTION_EXPRESSION'; //BS-1544
import B2B_AVAILABILITY_STATUS_LABEL from '@salesforce/label/c.B2B_Availability_Status_Labels'; //BS-1568
import B2B_MISSING_PRICE_LABELS from '@salesforce/label/c.B2B_MISSING_PRICE_LABELS'; //BS-2002
import B2B_COMPACT_CATEGORY_UTILITY_LABEL from '@salesforce/label/c.B2B_COMPACT_CATEGORY_UTILITY_LABEL'; //BS-2226

// DEMO_VALUE VALUE
const DEMO_VALUE = 'Demo';
const PAGE_SOURCE_PLP = 'PLP'; // Added for BS-740
const PAGE_SOURCE_REORDER = 'Reorder'; //Added for reorder page source check --> BS-650
const SH_STORE = 'silhouette';
const SUN_PROTECTION_SPARE_PART_TYPE = 'Sun protection lens'; //BS-740
const SUN_PROTECTION_SPARE_PART_TYPE_GERMAN = 'Sonnenschutzglas'; //BS-740
const EVIL_EYE_BRAND_TYPE = 'evil eye'; //BS-740
const EVIL_EYE_URL = 'evil-eye/lenses'; // Added for BS-740
const EVIL_EYE_URL_GERMAN = 'evil-eye/gl%C3%A4ser'; // Added for BS-740
const SEPERATOR_STRING = ' | ';
const RRP_FIELD = 'B2B_RRP__c'; //Added as part of BS-880
const PRODUCT_STRING = 'product'; //Added as part of BS-880
const LENSES_EN = 'Lenses'; //Added as part of BS-882
const LENSES_DE = 'GLAESER'; //Added as part of BS-882
const TEMPLE_SPARE_PART_DE = 'Bügel'; //Added as part of BS-755
const TEMPLE_SPARE_PART_EN = 'Temple'; //Added as part of BS-755
const SPARE_PART_TYPE = 'sparepartType'; //Added as part of BS-1233
const ITEM_UNAVAILABLE_LABEL = B2B_AVAILABILITY_STATUS_LABEL.split(',')[1]; //BS-1568
const ONLY_SPARE_PART_AVAILABLE_LABEL = B2B_AVAILABILITY_STATUS_LABEL.split(',')[3]; //BS-1568
// Added as part of BS-2226
const COMPACT = B2B_COMPACT_CATEGORY_UTILITY_LABEL.split(',')[0];
const DEMO = B2B_COMPACT_CATEGORY_UTILITY_LABEL.split(',')[1];
const FRAME = B2B_COMPACT_CATEGORY_UTILITY_LABEL.split(',')[2];
const PERFORMANCE_SPORT = B2B_COMPACT_CATEGORY_UTILITY_LABEL.split(',')[3];
const PERFORMANCE_SPORT_RX = B2B_COMPACT_CATEGORY_UTILITY_LABEL.split(',')[4];
const COMPACT_ES = 'vista-r%C3%A1pida'; // Added as a part of BS-2226 to identify the compact category in ES from URL
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
export default class SearchCard extends NavigationMixin(LightningElement) {
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

    @api
    applicableCurrencyCode; //BS-1245

    quantity = 1;
    unavailablePrice = PLP_LABELS.split(',')[0];
    articalOnly = B2B_MISSING_PRICE_LABELS.split(',')[0]; //BS-2002
    articalOnlyTitle = B2B_MISSING_PRICE_LABELS.split(',')[1]; //BS-2002
    priceUnavailableTitle = B2B_MISSING_PRICE_LABELS.split(',')[2]; //BS-1951
    freeOfChargeLabel = B2B_MISSING_PRICE_LABELS.split(',')[3]; //BS-2355
    originalPrice = PLP_LABELS.split(',')[1];
    cartLabel = PLP_LABELS.split(',')[2];
    skuLabel = PLP_LABELS.split(',')[3];

    @track _pageSourcePLP = false; //Added for BS-402
    @track _pageSourceReorder = false; //Added for BS-650

    @track
    deliveryInformationCollection; //BS-644
    _seperatorString = SEPERATOR_STRING;

    //BS-528
    @api
    demoVsChassisObjList;

    //BS-1544
    _collectionStatus = NEW_BADGE;

    //BS-740
    @track
    _isLenses = false;

    @api
    showChassisButtons;
    chassisButtonLabel = seeChassisButtonLabel;

    @api pageSource;

    @track _showAdditionalInfoForEvilEye = false; //BS-740
    @track _additionalInfoForEvilEyeData = {}; //BS-740

    //Object for referring the proper icon to show availability of products on PDP.
    _availabilityIcons = {};
    _isSilhouetteStore = false;
    @api isEvilEye;
    _productOneSize = B2B_COMPACT_CATEGORY_UTILITY_LABEL.split(',')[5];

    //Added as part of BS-650
    @api effectiveAccountId;
    @api orderSource; // BS-650

    /**
     * Used to store the values of order source and last order date.
     * BS-650
     */
    @track _orderData = {};

    calenderIcon = STORE_STYLING + '/icons/calender.svg';
    _colorWheelSVG = STORE_STYLING + '/icons/color-wheel.svg'; //BS-2226
    _bridgeSizeSVG = STORE_STYLING + '/icons/SH_BridgeSize.jpg'; //BS-2226
    _templeLengthSVG = STORE_STYLING + '/icons/SH_TempleLength.jpg'; //BS-2226
    isEEBrand; //BS-652
    _recommendedRetailPrice; //BS-880

    _recommendedPrice = PDP_LABELS.split(',')[6] + ' ' + ' : '; //BS-880
    _priceLabel = ' ' + PDP_LABELS.split(',')[2]; //BS-880
    isToggleClicked = false;
    _displayProductSize; //BS-1507
    @api dateFormat; //BS-2142
    // Added as a part of BS-2226
    @api productIdVsColourCountAndSize;
    @api productIdVsBridgeTempleCount;
    _isCompact = false;
    _isCompactRimless = false;
    _isCompactEvilEye = false;
    _colorCount;
    _bridgeTempleCount;
    _productSizeForCompact;
    /**
     * The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.
     */
    async connectedCallback() {
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');
        let pageUrl = window.location.href;

        if (pageUrl.includes(PRODUCT_STRING)) {
            this._pageSourcePDP = true;
        }
        if (pageUrl.includes('evil-eye')) {
            //BS-652
            this.isEEBrand = true;
            this._displayProductSize = this.displayData.fields[0]['brand'] && this.displayData.fields[0]['brand'] == EVIL_EYE_BRAND_TYPE ? true : false; //BS-1507
            this.template.host.style.setProperty('--card-box-shadow', '0 0 11px rgb(33 33 33 / 20%)');
            this.template.host.style.setProperty('--card-border-solid', 'none');
        } else {
            this.isEEBrand = false;
            this._displayProductSize = this.displayData.fields[0]['brand'] && this.displayData.fields[0]['brand'] == EVIL_EYE_BRAND_TYPE ? true : false; //BS-1507
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
        this._pageSourceReorder = this.pageSource == PAGE_SOURCE_REORDER ? true : false; // Added as Part of BS-650

        //Added for BS-740
        let pageURL = window.location.href;
        //Start BS-882
        if (this.displayData.fields[0]['productType'] === LENSES_DE || this.displayData.fields[0]['productType'] === LENSES_EN) {
            this._isLenses = true;
        } else {
            this._isLenses = false;
        }
        //End BS-882
        if (
            this.displayData.fields[0]['brand'] == EVIL_EYE_BRAND_TYPE &&
            (this.displayData.fields[0]['sparepartType'] == SUN_PROTECTION_SPARE_PART_TYPE ||
                this.displayData.fields[0]['sparepartType'] == SUN_PROTECTION_SPARE_PART_TYPE_GERMAN)
        ) {
            this._showAdditionalInfoForEvilEye = true;
        } else {
            this._showAdditionalInfoForEvilEye = false;
        }
        // Added as part of BS-2226
        if (currentUrl[1] && (currentUrl[1].includes(COMPACT) || currentUrl[1].includes(COMPACT_ES))) {
            this._isCompact = true;
            if (this.displayData.fields[0]['productType'] == FRAME || this.displayData.fields[0]['productType'] == DEMO) {
                this._isCompactRimless = true;
            } else if (this.displayData.fields[0]['productType'] == PERFORMANCE_SPORT || this.displayData.fields[0]['productType'] == PERFORMANCE_SPORT_RX) {
                this._isCompactEvilEye = true;
                this._displayProductSize = true;
            }
            if (this.productIdVsColourCountAndSize && this.productIdVsBridgeTempleCount) {
                this.setCompactAttributes();
            }
        }

        /* Start BS-880 */
        if (this.displayData.prices.pricebookEntry != undefined && this.displayData.prices.pricebookEntry != null) {
            let recommendedRetailPriceResult = await getRecommendedRetailPrice({
                pricebookEntryId: this.displayData.prices.pricebookEntry
            });
            if (recommendedRetailPriceResult !== null && recommendedRetailPriceResult !== undefined) {
                //BS-1951
                if (
                    recommendedRetailPriceResult[RRP_FIELD] != undefined &&
                    recommendedRetailPriceResult[RRP_FIELD] != null &&
                    recommendedRetailPriceResult[RRP_FIELD] != 0
                ) {
                    this._recommendedRetailPrice = recommendedRetailPriceResult[RRP_FIELD];
                }
            } else {
                this._recommendedRetailPrice = false;
            }
        } else {
            this._recommendedRetailPrice = false;
        }

        if (this.effectiveAccountId && this.pageSource !== PAGE_SOURCE_REORDER && this.pageSource !== PAGE_SOURCE_PLP) {
            let result = await getShowRecommendedRetailPrice({
                accountId: this.effectiveAccountId
            });
            if (result !== null) {
                this.isToggleClicked = result;
            }
        }
        /* End BS-880 */

        //Added for showing correct icons on PLP.
        this._availabilityIcons.availableIcon = STORE_STYLING + '/icons/Available.svg';
        this._availabilityIcons.unavailableIcon = STORE_STYLING + '/icons/Not_Available.svg';
        if (this.pageSource == PAGE_SOURCE_REORDER) {
            this.getOrderAdditionalInformation();
        }
    }

    /**
     * This method stores the source and last order date in object to display on product card --> BS-650
     */
    getOrderAdditionalInformation() {
        getOrderAdditionalInformation({
            productId: this.displayData.id,
            effectiveAccountId: this.effectiveAccountId,
            orderSource: this.orderSource
        }).then((result) => {
            let orderObjArray = [];
            orderObjArray = result;
            if (orderObjArray) {
                orderObjArray.forEach((orderRec) => {
                    this._orderData.source = orderRec.Order.Order_Source__c;
                    //BS-772 Used Orderdate to match order history order date
                    this._orderData.lastOrderDate = orderRec.Order.OrderedDate;
                    let lastOrderDateValue = new Date(this._orderData.lastOrderDate);
                    this._orderData.lastOrderDate = new Intl.DateTimeFormat(this.dateFormat, DATE_FORMAT).format(lastOrderDateValue); //BS-2142
                });
            }
        });
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
     * Gets the product fields.
     *
     * @type {object.<string, object>[]}
     * @readonly
     * @private
     */
    get fields() {
        let isTempleProduct = false;

        /* Start BS-755 */
        if (this.displayData.fields[0]['sparepartType'] == TEMPLE_SPARE_PART_DE || this.displayData.fields[0]['sparepartType'] == TEMPLE_SPARE_PART_EN) {
            isTempleProduct = true;
        }
        /* End BS-755 */

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
                    model,
                    frameColorDescription,
                    collectionDesignFamily
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
                value: name === 'Name' || name === 'Description' ? value : `${name}: ${value}`, //BS-1401
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
                backgroundColorLower: hexAccentCode != null ? 'background-color: ' + hexAccentCode : hexCode != null ? 'background-color: ' + hexCode : false,
                frameColorDescription: frameColorDescription != null ? frameColorDescription : '',
                collectionDesignFamily: collectionDesignFamily != null ? collectionDesignFamily : '',
                checkTempleProduct: isTempleProduct
            })
        );
    }

    //Added as part of BS-675
    get productSize() {
        if (this.displayData.fields[0]['productSize'] != null && !this.displayData.fields[0]['productSize'].includes(this._productOneSize)) {
            return this.displayData.fields[0]['productSize'];
        } else {
            return null;
        }
    }

    //BS-644
    getDeliveryInformation(deliveryTimeJSON) {
        if (deliveryTimeJSON != null && deliveryTimeJSON != undefined && deliveryTimeJSON != '') {
            const deliveryInformationCollection = {};
            deliveryInformationCollection.status = getDeliveryTime(deliveryTimeJSON, this.shippingPicklistValues, this.countryCode);
            /*Start : BS-1568*/
            if (this.displayData.isSparePartOnlyFrame && deliveryInformationCollection.status === ITEM_UNAVAILABLE_LABEL) {
                deliveryInformationCollection.status = ONLY_SPARE_PART_AVAILABLE_LABEL;
            }
            /*End : BS-1568*/
            deliveryInformationCollection.styling = getApplicableAvailabilityStatusIcon(deliveryInformationCollection.status);
            this.deliveryInformationCollection = deliveryInformationCollection;
            return deliveryInformationCollection;
        } else {
            return null;
        }
    }

    //Commented this code logic as the values are being fetched from Product2 object directly. -> BS-528
    // get bridgeSize() {
    //     let auxBridge;
    //     this.displayData.variationAttributeSet.attributes.forEach((element) => {
    //         if (element.apiName == 'B2B_Bridge_Size__c') {
    //             auxBridge = {
    //                 label: element.label,
    //                 value: element.value,
    //                 icon: STORE_STYLING + '/icons/SH_BridgeSize.jpg'
    //             };
    //         }
    //     });
    //     if (auxBridge) {
    //         return auxBridge;
    //     } else {
    //         return false;
    //     }
    // }

    // get shapeSize() {
    //     let auxShape;
    //     this.displayData.variationAttributeSet.attributes.forEach((element) => {
    //         if (element.apiName == 'B2B_Shape_Size__c') {
    //             auxShape = {
    //                 label: element.label,
    //                 value: element.value,
    //                 icon: STORE_STYLING + '/icons/SH_ShapeSize.jpg'
    //             };
    //         }
    //     });
    //     if (auxShape) {
    //         return auxShape;
    //     } else {
    //         return false;
    //     }
    // }

    // get templeLength() {
    //     let auxTemple;
    //     this.displayData.variationAttributeSet.attributes.forEach((element) => {
    //         if (element.apiName == 'B2B_Temple_Length__c') {
    //             auxTemple = {
    //                 label: element.label,
    //                 value: element.value,
    //                 icon: STORE_STYLING + '/icons/SH_TempleLength.jpg'
    //             };
    //         }
    //     });
    //     if (auxTemple) {
    //         return auxTemple;
    //     } else {
    //         return false;
    //     }
    // }

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
     * getter to handle the 'See Chassis' button visibility
     * BS-528
     */
    get showChassisButton() {
        let chassisButtonVisible;
        if (this.showChassisButtons) {
            if (this.displayData && this.displayData.fields[0].rimLessVariant === DEMO_VALUE) {
                this.demoVsChassisObjList.forEach((chassisObj) => {
                    if (chassisObj.key == this.displayData.id && chassisObj.value != null) {
                        chassisButtonVisible = true;
                    }
                });
            }
        }
        return chassisButtonVisible;
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
        return !!this.price;
    } //BS-2002

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
     * Emits a notification that the user wants to add the item to their cart.
     *
     * @fires SearchCard#calltoaction
     * @private
     */
    notifyAction() {
        let qtyInput = this.template.querySelector(`[data-id="${this.displayData.id}"]`);
        if (!qtyInput.validity.valid) {
            qtyInput.reportValidity();
        } else {
            this.dispatchEvent(
                new CustomEvent('calltoaction', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        productId: this.displayData.id,
                        productName: this.displayData.name,
                        quantity: this.quantity
                    }
                })
            );
        }
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

    /**
     * Handles a user request to navigate to the chassis product detail page.
     *BS-529
     * @private
     */
    handleShowChassisDetail(event) {
        event.stopPropagation();
        let chassisProductId;
        this.demoVsChassisObjList.forEach((chassisObj) => {
            if (chassisObj.key === this.displayData.id && chassisObj.value != null) {
                chassisProductId = chassisObj.value;
            }
        });
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: chassisProductId,
                actionName: 'view'
            }
        }).then((url) => {
            window.open(url, '_blank');
        });
    }

    handleQuantityChange(event) {
        if (event.target.validity.valid && event.target.value) {
            this.quantity = event.target.value;
        } else {
            event.target.reportValidity();
        }
    }

    quantityIncrease() {
        let qtyInput = this.template.querySelector(`[data-id="${this.displayData.id}"]`);
        let qtyValue = qtyInput.value;
        qtyInput.value++;
        if (qtyInput.validity.valid) {
            this.quantity = qtyInput.value;
        } else {
            qtyInput.value = qtyValue;
        }
    }

    quantityDecrease() {
        let qtyInput = this.template.querySelector(`[data-id="${this.displayData.id}"]`);
        let qtyValue = qtyInput.value;
        qtyInput.value--;
        if (qtyInput.validity.valid) {
            this.quantity = qtyInput.value;
        } else {
            qtyInput.value = qtyValue;
        }
    }

    getDeliveryTime(deliveryTime) {
        var returnLabel = '';
        if (JSON.stringify(this.shippingPicklistValues) !== '{}' && this.countryCode && deliveryTime) {
            this.shippingPicklistValues.data.values.forEach((element) => {
                if (element.value == deliveryTime[this.countryCode.substring(0, 4)]) {
                    returnLabel = element.label;
                }
            });
        }
        return returnLabel;
    }

    // Added as a part of BS-2226
    setCompactAttributes() {
        let productId = this.displayData.id;
        if (this.productIdVsColourCountAndSize[productId]) {
            let colorCount = this.productIdVsColourCountAndSize[productId][0];
            this._colorCount = colorCount;
            let availableSizes = this.productIdVsColourCountAndSize[productId][1].split(',').sort(this.sizeSort).join(',');
            availableSizes = availableSizes.replace(',', ' / ');
            if (availableSizes == 'noSize') {
                this._productSizeForCompact = this._productOneSize;
            } else {
                this._productSizeForCompact = availableSizes;
            }
        }
        if (this.productIdVsColourCountAndSize[productId]) {
            this._bridgeTempleCount = this.productIdVsBridgeTempleCount[productId];
        }
    }

    sizeSort(a, b) {
        const sizeOrder = ['XS', 'S', 'L'];
        return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
    }
}
