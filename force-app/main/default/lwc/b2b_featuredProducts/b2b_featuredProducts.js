import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { resolve } from 'c/b2b_cmsResourceResolver';
import { registerListener, unregisterAllListeners } from 'c/b2b_pubsub';
import { CurrentPageReference } from 'lightning/navigation';

//using JS utils method to check product availability
import { checkProductAvailability } from 'c/b2b_utils'; //BS-588

// CONTROLLER METHODS
import getProductsByCategoryId from '@salesforce/apex/B2B_FeaturedProductsController.getProductsByCategoryId';
import getProductsByLinkType from '@salesforce/apex/B2B_FeaturedProductsController.getProductsByLinkyType';

import getCurrencyCode from '@salesforce/apex/B2B_CartController.getCurrencyCode'; //BS-1245

// STORE IDS
import USERID from '@salesforce/user/Id';
import communityId from '@salesforce/community/Id';
import CURRENCY_CODE from '@salesforce/i18n/currency';
import BASE_PATH from '@salesforce/community/basePath';

// LABELS
import searchErrorTitle from '@salesforce/label/c.B2B_FP_Search_Error_Title';
import altPleaseWait from '@salesforce/label/c.B2B_FP_Alt_Text_Please_Wait';
import noProducts from '@salesforce/label/c.B2B_FP_No_Products';
import buttonLabel from '@salesforce/label/c.B2B_FP_BTNLabel';
import featureSpareProductsHeading from '@salesforce/label/c.B2B_FP_Featured_Spare_Parts';
import B2B_MISSING_PRICE_LABELS from '@salesforce/label/c.B2B_MISSING_PRICE_LABELS'; //BS-1951

import getCartSummary from '@salesforce/apex/B2B_CartController.getCartSummary';
import addToCart from '@salesforce/apex/B2B_CartController.addToCart';
import PLP_LABELS from '@salesforce/label/c.B2B_PLP_Product_Details';
import { getEffectiveAccountId } from 'c/b2b_utils';
import CODE_FIELD from '@salesforce/schema/Account.k_ARIS_Account_ID__c';
import HIDE_PURCHASE_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Purchase_Price__c'; //BS-2273
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import PRODUCT_OBJECT from '@salesforce/schema/Product2';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';

const fields = [CODE_FIELD, HIDE_PURCHASE_PRICE_FIELD];
const CART_ITEM_REMOVED = 'cartitemsremoved';
const CART_CLEARED = 'cartcleared';
const CART_PAGE = 'Cart Page';
const HIDE_FEATURE_SPARE_PARTS = 'hidefeaturespareparts';

//Added as part of BS-882
const SUN_PROTECTION_SPARE_PART_TYPE = 'Sun protection lens';
const SUN_PROTECTION_SPARE_PART_TYPE_GERMAN = 'Sonnenschutzglas';
const LENSES_EN = 'Lenses';
const LENSES_DE = 'GLAESER';
const B2B_EE_BRAND = 'evil eye';
const VS_PAGE_SOURCE = 'VS';
const RX_PAGE_SOURCE = 'RX';

//Added as part of BS-755
const TEMPLE_SPARE_PART_DE = 'Bügel';
const TEMPLE_SPARE_PART_EN = 'Temple';

//Added as part of BS-830
const HOME_PAGE_ATTRIBUTE_NAME = 'Home';

export default class b2b_featuredProducts extends LightningElement {
    labels = {
        toast: {
            searchErrorTitle: searchErrorTitle
        },
        component: {
            altPleaseWait: altPleaseWait,
            noProducts: noProducts,
            buttonLabel: buttonLabel
        }
    };

    products = [];
    hasProducts = false;

    // These properties are set within experience builder and passed to the component
    @api recordId;

    @api featuredProductStyle;

    @api showHeading;
    @api featuredProductsHeading;
    @api featuredProductsHeadingSize;
    @api featuredProductsHeadingAlignment = 'Center';
    @api pageSource;

    featureHeaderLabel;

    @api featuredProductsBodySize;
    @api featuredProductsBodyAlignment;

    @api showSKU;
    @api showModelNumber; // Added as a part of BS-645
    @api showDescription;
    @api includePrices;
    @api showMoreButton;

    @api featuredProductsBackgroundColor;
    @api featuredProductsBorderColor;
    @api featuredProductsHeadingColor;
    @api featuredProductsSkuColor;
    @api featuredProductsDescriptionColor;
    @api featuredProductsPriceColor;

    @api productSource;
    @api maxNumberOfProducts;
    @api categoryId;
    @api linkType;
    @api effectiveAccountId;
    @api showAddtoCartButton;
    @api isSilhouetteStore;
    showLoadingSpinner = false;
    templateWidth;
    templateSize;
    tileWidth;
    tileHeight;
    _ShowFeaturerdProducts = true;

    currencyCode = CURRENCY_CODE;
    userId = USERID;
    webstoreId;
    skuListFormatted;

    initialLoad = false;
    isTiled = false;
    isStacked = false;

    unavailablePrice = PLP_LABELS.split(',')[0];
    priceUnavailableTitle = B2B_MISSING_PRICE_LABELS.split(',')[2]; //BS-2002
    originalPrice = PLP_LABELS.split(',')[1];
    cartLabel = PLP_LABELS.split(',')[2];
    skuLabel = PLP_LABELS.split(',')[3];

    quantity = 1;

    cartPage = false;
    _enableAddToCart = false;
    _cartItemId; //BS-1562
    freeOfChargeLabel = B2B_MISSING_PRICE_LABELS.split(',')[3]; //BS-2355

    /**
     * This variable hold the currency ISO Code applicable
     * BS-1245
     * @type {string}
     */
    _applicableCurrencyCode; //BS-1245

    connectedCallback() {
        window.addEventListener('resize', this.windowResize.bind(this));
        if (this.featuredProductStyle === 'Tiled') this.isTiled = true;
        if (this.featuredProductStyle === 'Stacked') this.isStacked = true;

        if (this.skuList) {
            this.skuListFormatted = this.skuList.replace(/\s*,\s*/g, ',');
            this.skuListFormatted = this.skuListFormatted.split(',');
        }
        if (this.pageSource === CART_PAGE) {
            this.cartPage = true;
            this.featureHeaderLabel = featureSpareProductsHeading;
            this.showLoadingSpinner = false;
        } else {
            this.featureHeaderLabel = this.featuredProductsHeading;
        }
        this.doProductLoad();
        registerListener(HIDE_FEATURE_SPARE_PARTS, this.showFeaturerdProducts, this);
    }

    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        this.pageRef = pageRef;
        if (this.pageRef) {
            if (
                (this.pageRef.state.pageSource !== undefined && this.pageRef.state.pageSource !== null && this.pageRef.state.pageSource === VS_PAGE_SOURCE) ||
                this.pageRef.state.pageSource === RX_PAGE_SOURCE
            ) {
                this._ShowFeaturerdProducts = false;
            }
            registerListener(CART_ITEM_REMOVED, this.doProductLoad, this);
            registerListener(CART_CLEARED, this.doProductLoad, this);
        }
    }
    renderedCallback() {
        registerListener(CART_ITEM_REMOVED, this.doProductLoad, this);
        registerListener(CART_CLEARED, this.doProductLoad, this);
        // ONLY RUN IF LAYOUT IS TILED
        if (this.hasProducts) {
            if (this.isTiled) {
                this.windowResize();
            }
        }
    }
    disconnectedCallback() {
        unregisterAllListeners(this);
    }

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

    get countryCode() {
        if (this.account.data) {
            return getFieldValue(this.account.data, CODE_FIELD).substring(0, 4);
        } else {
            return null;
        }
    }

    @wire(getObjectInfo, { objectApiName: PRODUCT_OBJECT })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: '$shippingField'
    })
    shippingPicklistValues;

    doProductLoad() {
        this.showLoadingSpinner = true;

        if (this.productSource === 'Category ID') {
            this.loadProductsByCategoryId();
        }

        if (this.productSource === 'Product Link') {
            this.loadProductsByLinkType();
        }
    }

    loadProductsByCategoryId() {
        getProductsByCategoryId({
            communityId: communityId,
            effectiveAccountId: getEffectiveAccountId(this.effectiveAccountId),
            categoryId: this.categoryId,
            includePrices: this.includePrices,
            maxNumberOfProducts: this.maxNumberOfProducts
        })
            .then((result) => {
                this.processResult(result);
            })
            .catch((error) => {
                this.processError(error);
            });
    }

    loadProductsByLinkType() {
        getProductsByLinkType({
            communityId: communityId,
            effectiveAccountId: getEffectiveAccountId(this.effectiveAccountId),
            recordId: this.recordId,
            linkType: this.linkType,
            includePrices: this.includePrices,
            maxNumberOfProducts: this.maxNumberOfProducts
        })
            .then((result) => {
                this.processResult(result);
            })
            .catch((error) => {
                this.processError(error);
            });
    }

    processResult(result) {
        this.showLoadingSpinner = false;
        this.hasProducts = false;
        this.products = [];
        if (result && result.data) {
            this.hasProducts = true;
            let productResults = JSON.parse(result.data);

            //BS-1245
            let pricebookEntryIdCollection = [];
            if (productResults) {
                productResults.forEach((product) => {
                    if (
                        product != null &&
                        product != undefined &&
                        product.prices != null &&
                        product.prices != undefined &&
                        product.prices.pricebookEntryId != null &&
                        product.prices.pricebookEntryId != undefined
                    ) {
                        if (product.prices.unitPrice != undefined && product.prices.unitPrice != null && product.prices.unitPrice == -1) {
                            product.prices.unitPrice = 0;
                            product.isFreeProduct = true;
                        } else {
                            product.isFreeProduct = false;
                        }
                        pricebookEntryIdCollection.push(product.prices.pricebookEntryId);
                    }
                });
                this.getApplicableCurrencyCode(pricebookEntryIdCollection);
            }
            //BS-1245

            this.processProductResults(productResults);
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
                if (result && result[0]) {
                    this._applicableCurrencyCode = result[0];
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    showFeaturerdProducts(event) {
        if (event === true) {
            this._ShowFeaturerdProducts = false;
        } else {
            this._ShowFeaturerdProducts = true;
        }
    }
    processProductResults(productResults) {
        for (const product of productResults) {
            //Added as part of BS-207
            product.defaultImage.url = product.fields.B2B_Picture_Link__c.value != null ? product.fields.B2B_Picture_Link__c.value : product.defaultImage.url;
            // format product link
            let prodLink = BASE_PATH + '/product/' + product.id;
            product.productLink = prodLink;

            //Commenting this logic as delivery status is not required on featured products page - BS-644
            /* product.deliveryTimeJSON =
                product.fields.B2B_Shipping_Status_JSON__c.value != null
                    ? this.getDeliveryTimeJ(JSON.parse(product.fields.B2B_Shipping_Status_JSON__c.value.replace(/&quot;/g, '"')))
                    : null;
            product.stockAvailable =
                product.fields.B2B_Availability_JSON__c.value != null
                    ? JSON.parse(product.fields.B2B_Availability_JSON__c.value.replace(/&quot;/g, '"'))[this.countryCode] > 0
                    : false; */
            /* Start BS-882*/
            product.isEvilEyeLens =
                (product.fields.B2B_Sparepart_Type__c.value == SUN_PROTECTION_SPARE_PART_TYPE ||
                    product.fields.B2B_Sparepart_Type__c.value == SUN_PROTECTION_SPARE_PART_TYPE_GERMAN) &&
                (product.fields.B2B_Product_Type__c.value == LENSES_DE || product.fields.B2B_Product_Type__c.value == LENSES_EN) &&
                product.fields.B2B_Brand__c.value == B2B_EE_BRAND;
            /* End BS-882*/

            /*Start BS-755*/
            if (
                (product.fields.B2B_Sparepart_Type__c.value == TEMPLE_SPARE_PART_DE || product.fields.B2B_Sparepart_Type__c.value == TEMPLE_SPARE_PART_EN) &&
                product.fields.B2B_Design_Family__c != null
            ) {
                product.b2bDesignFamily = product.fields.B2B_Design_Family__c.value;
            }
            /*End BS-755*/

            product.productDisable = checkProductAvailability(product.fields.B2B_Availability_JSON__c.value, this.countryCode);
            product.modelNumber = product.modelNumber != null ? product.modelNumber : ''; // Added as a Part of BS-645
            if (product.prices && (product.prices.unitPrice || product.prices.unitPrice == 0)) {
                product.priceAvailable = true;
            } else {
                product.priceAvailable = false;
            } //BS-1951

            this.products.push(product);
        }
    }

    processError(error) {
        this.showLoadingSpinner = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: this.labels.toast.searchErrorTitle,
                message: error.body != null ? error.body.message : 'Unknown exception',
                variant: 'error'
            })
        );
    }

    windowResize() {
        this.templateSize = null;

        const templateSelector = this.template.querySelector('.featuredProductsContainer');
        this.templateWidth = templateSelector?.getBoundingClientRect().width;

        // TEMPLATE WIDTH BREAKPOINTS
        // X-SMALL (< 480px)
        // SMALL (>= 480px)
        // MEDIUM (>=768px)
        // LARGE (>=1024px)

        const tiles = this.template.querySelectorAll('.tile-column');

        for (const tile of tiles) {
            this.tileWidth = this.template.querySelector('.featuredProdImage')?.getBoundingClientRect().width;

            tile.classList.remove('slds-size_1-of-1');
            tile.classList.remove('slds-size_1-of-2');
            tile.classList.remove('slds-size_1-of-3');
            tile.classList.remove('slds-size_1-of-4');

            // X-SMALL
            if (this.templateWidth < 480) {
                this.templateSize = 'x-small';
                tile.classList.add('slds-size_1-of-1');
            }

            // SMALL
            if (this.templateWidth >= 480 && this.templateWidth < 768) {
                this.templateSize = 'small';
                tile.classList.add('slds-size_1-of-2');
            }

            // MEDIUM
            if (this.templateWidth >= 768 && this.templateWidth < 1024) {
                this.templateSize = 'medium';
                tile.classList.add('slds-size_1-of-3');
            }

            // LARGE
            if (this.templateWidth >= 1024) {
                this.templateSize = 'large';
                tile.classList.add('slds-size_1-of-4');
            }
        }

        this.tileHeight = (this.tileWidth * 2) / 3;
    }

    // GETTERS & SETTERS
    get communityName() {
        let path = BASE_PATH;
        let pos = BASE_PATH.lastIndexOf('/s');
        if (pos >= 0) {
            path = BASE_PATH.substring(0, pos);
        }

        return path;
    }

    // SIZE GETTERS
    get imageContainerHeight() {
        let tileHeight = '';

        if (this.tileHeight) {
            tileHeight = this.tileHeight.toString();
        }

        return `height:${tileHeight}px;`;
    }

    get imageMaxHeight() {
        let imageMaxHeight = '';

        if (this.tileHeight) {
            imageMaxHeight = this.tileHeight.toString();
        }

        return `max-height:${imageMaxHeight}px;`;
    }

    get bodySize() {
        let sizeClass = 'slds-text-body_';
        if (this.featuredProductsBodySize) {
            sizeClass += this.featuredProductsBodySize.toLowerCase();
        }
        return sizeClass;
    }

    // ALIGNMENT GETTERS
    get headingAlignment() {
        let alignmentClass = 'slds-text-align_';
        if (this.featuredProductsHeadingAlignment) {
            alignmentClass += this.featuredProductsHeadingAlignment.toLowerCase();
        }
        return alignmentClass;
    }

    get bodyAlignment() {
        let alignmentClass = 'slds-text-align_';
        if (this.featuredProductsBodyAlignment) {
            alignmentClass += this.featuredProductsBodyAlignment.toLowerCase();
        }
        return alignmentClass;
    }

    // COLOR GETTERS
    get cardStyles() {
        /*Start of BS-830 */
        if (this.pageRef.attributes.name != null && this.pageRef.attributes.name == HOME_PAGE_ATTRIBUTE_NAME) {
            return `background-color:${this.featuredProductsBackgroundColor}; border-color:${this.featuredProductsBorderColor};min-height: 321px;`;
        } else {
            return `background-color:${this.featuredProductsBackgroundColor}; border-color:${this.featuredProductsBorderColor};min-height: 410px;`;
        }
        /*End of BS-830*/
    }

    get headingColor() {
        return `color:${this.featuredProductsHeadingColor};`;
    }

    get skuColor() {
        return `color:${this.featuredProductsSkuColor};`;
    }

    get descriptionColor() {
        return `color:${this.featuredProductsDescriptionColor};`;
    }

    get priceColor() {
        return `color:${this.featuredProductsPriceColor};`;
    }

    get resolvedEffectiveAccountId() {
        const effectiveAcocuntId = this.effectiveAccountId || '';
        let resolved = null;

        if (effectiveAcocuntId.length > 0 && effectiveAcocuntId !== '000000000000000') {
            resolved = effectiveAcocuntId;
        }
        return resolved;
    }

    quantityIncrease(event) {
        let qtyInput = this.template.querySelector(`[data-field="${event.target.dataset.id}"]`);
        let qtyValue = qtyInput.value;
        qtyInput.value++;
        if (qtyInput.validity.valid) {
            this.quantity = qtyInput.value;
        } else {
            qtyInput.value = qtyValue;
        }
    }

    quantityDecrease(event) {
        let qtyInput = this.template.querySelector(`[data-field="${event.target.dataset.id}"]`);
        let qtyValue = qtyInput.value;
        qtyInput.value--;
        if (qtyInput.validity.valid) {
            this.quantity = qtyInput.value;
        } else {
            qtyInput.value = qtyValue;
        }
    }

    handleQuantityChange(event) {
        if (event.target.validity.valid && event.target.value) {
            this.quantity = event.target.value;
        } else {
            event.target.reportValidity();
        }
    }

    async handleAction(event) {
        if (this._enableAddToCart == false) {
            this._enableAddToCart = true;
            this.showLoadingSpinner = true;
            let qtyInput = this.template.querySelector(`[data-field="${event.target.dataset.id}"]`);
            let qtyValue = qtyInput.value;
            try {
                let result = await addToCart({
                    communityId: communityId,
                    productId: event.target.dataset.id,
                    quantity: qtyValue,
                    effectiveAccountId: this.resolvedEffectiveAccountId
                });
                if (result !== null && result !== undefined) {
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
                    addToCartModal.error = undefined;
                    addToCartModal.show();
                    this.showLoadingSpinner = false;
                    this._enableAddToCart = false;
                }
            } catch (error) {
                const addToCartModal = this.template.querySelector('c-b2b_add-to-cart-modal');
                getCartSummary({
                    communityId: communityId,
                    effectiveAccountId: this.resolvedEffectiveAccountId
                }).then((result) => {
                    addToCartModal.cartid = result.cartId;
                });
                addToCartModal.error = error;
                addToCartModal.show();
                this.showLoadingSpinner = false;
                this._enableAddToCart = false;
            }
        }
    }

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

    isCartLocked() {
        const cartStatus = (this.cartSummary || {}).status;
        return cartStatus === 'Processing' || cartStatus === 'Checkout';
    }

    getDeliveryTimeJ(deliveryTime) {
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
}
