import { LightningElement, wire, api, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import CODE_FIELD from '@salesforce/schema/Account.k_ARIS_Account_ID__c';
import { checkProductAvailability } from 'c/b2b_utils'; //BS-589

import communityId from '@salesforce/community/Id';
import getProduct from '@salesforce/apex/B2B_ProductDetailsController.getProduct';
import getCartSummary from '@salesforce/apex/B2B_ProductDetailsController.getCartSummary';
import addToCart from '@salesforce/apex/B2B_ProductDetailsController.addToCart';
import createAndAddToList from '@salesforce/apex/B2B_ProductDetailsController.createAndAddToList';
import getProductPrice from '@salesforce/apex/B2B_ProductDetailsController.getProductPrice';
import getRecommendedRetailPrice from '@salesforce/apex/B2B_ProductDetailsController.getRecommendedRetailPrice'; //Added as part of BS-573
import getProductImages from '@salesforce/apex/B2B_ProductDetailsController.getProductImages';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { resolve } from 'c/b2b_cmsResourceResolver';
import addToCartHeader from '@salesforce/label/c.B2B_GEN_ItemWasAddedToCart';
import infoLabels from '@salesforce/label/c.B2B_PDP_InfoLabels';
import HIDE_PRICES_FIELD from '@salesforce/schema/Account.B2B_Hide_Prices__c';
import getShowRecommendedRetailPrice from '@salesforce/apex/B2B_ProductDetailsController.getShowRecommendedRetailPrice'; //Added as part of BS-575
import ADD_TO_CART_LABEL from '@salesforce/label/c.B2B_ADD_TO_CART_ERROR_LABEL'; //Added as part of BS-900
import getAdditionalAttributeFieldData from '@salesforce/apex/B2B_ProductDetailsController.getAdditionalAttributeFieldData'; //Added as part of BS-1175
import LANG from '@salesforce/i18n/lang'; //BS-1175
import B2B_DEFAULT_CURRENCY_ISO_CODE from '@salesforce/label/c.B2B_DEFAULT_CURRENCY_ISO_CODE'; //Added as part of BS-1245

const fields = [HIDE_PRICES_FIELD, CODE_FIELD];
const RRP_FIELD = 'B2B_RRP__c';
const SH_STORE = 'silhouette';
const SPARE_PART_TYPE = 'Sun protection lens'; //BS-740
const SPARE_PART_TYPE_GERMAN = 'Sonnenschutzglas'; //BS-740
const NB_BRAND = 'NB'; //BS-1175
const CHINESE_LANG_BY_DEFAULT = 'zh-Hans-CN'; //BS-2320
const CHINESE_ORIGINAL_LANG = 'zh_CN'; //BS-2320
const PORTUGUESE_LANG_DEFAULT = 'pt-BR'; //BS-2320
const PORTUGUESE_LANG_ORIGINAL = 'pt_BR'; //BS-2320

/* Start : BS-1255 */
const EE_BRAND_VALUE = 'evil eye';
const NB_BRAND_VALUE = 'NEUBAU';
const SH_BRAND_VALUE = 'Silhouette';
const SH_BRAND = 'SH';
const EE_BRAND = 'EE';
const BRAND_FIELD_NAME = 'B2B_Brand__c';
/* End : BS-1255 */

/**
 * A detailed display of a product.
 * This outer component layer handles data retrieval and management, as well as projection for internal display components.
 */
export default class ProductDetails extends LightningElement {
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
        //this.updateCartInformation();
    }

    /**
     * Gets or sets the unique identifier of a product.
     *
     * @type {string}
     */
    @api
    recordId;

    /**
     * Gets or sets the custom fields to display on the product
     * in a comma-separated list of field names
     *
     * @type {string}
     */
    @api
    customDisplayFields;

    /**
     * Gets or sets the buttons to display on the product
     *
     * @type {string}
     */
    @api
    displayDemoButton;

    /**
     * The cart summary information
     *
     * @type {ConnectApi.CartSummary}
     * @private
     */
    cartSummary;

    /**
     * The full product information retrieved.
     *
     * @type {ConnectApi.ProductDetail}
     * @private
     */

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

    @api
    cardContentMapping;

    //Added as part of BS-573
    _productPrice;

    _recommendedRetailPrice;
    _isSilhouetteStore = true;
    isToggleClicked; //Added as part of BS-575
    cartErrorLabel = ADD_TO_CART_LABEL; //Added as part of BS-900

    /**
     *  List to store the field Data to be shown on PDP
     * BS-1175
     * @type {List}
     */
    @track
    _additionalAttributeFieldAndLabelList;

    /**
     * This variable hold the value of default currency code
     * BS-1245
     * @type {String}
     */
    _defaultCurrencyIsoCode = B2B_DEFAULT_CURRENCY_ISO_CODE;

    /**
     * This variable hold the value of applicable currency code
     * BS-1245
     * @type {String}
     */
    _applicableCurrencyCode;

    @wire(getRecord, { recordId: '$effectiveAccountId', fields })
    account;

    //get current user country code
    get countryCode() {
        if (this.account.data) {
            return getFieldValue(this.account.data, CODE_FIELD).substring(0, 4);
        } else {
            return null;
        }
    }

    _hidePricesFromTile;

    /**
     *  Object to store all the data of product
     * BS-1255
     * @type {JSON object}
     */
    product;
    _cartItemId; //BS-1562

    get hidePrice() {
        this._hidePricesFromTile = !!getFieldValue(this.account.data, HIDE_PRICES_FIELD);
        return getFieldValue(this.account.data, HIDE_PRICES_FIELD);
    }

    get hidePricesFromTile() {
        return this._hidePricesFromTile;
    }

    handleHidePriceSection() {
        this.template.querySelector('c-b2b_product-details-display').hidePricesFromTile = true;
    }

    handleShowPriceSection() {
        this.template.querySelector('c-b2b_product-details-display').hidePricesFromTile = false;
    }

    @wire(getProduct, {
        communityId: communityId,
        productId: '$recordId',
        effectiveAccountId: '$resolvedEffectiveAccountId'
    })
    async getProductData({ error, data }) {
        if (data) {
            this._isLoading = true;
            this.product = { data: data };
            let productBrand = this.product.data.fields[BRAND_FIELD_NAME];
            let metadataBrandValue;
            if (productBrand === EE_BRAND_VALUE) {
                metadataBrandValue = EE_BRAND;
            } else if (productBrand === SH_BRAND_VALUE) {
                metadataBrandValue = SH_BRAND;
            } else if (productBrand === NB_BRAND_VALUE) {
                metadataBrandValue = NB_BRAND;
            }
            if (metadataBrandValue !== undefined && metadataBrandValue !== null) {
                //BS-2320
                let currentLanguage = LANG;
                if (currentLanguage == CHINESE_LANG_BY_DEFAULT) {
                    currentLanguage = CHINESE_ORIGINAL_LANG;
                } else if (currentLanguage == PORTUGUESE_LANG_DEFAULT) {
                    currentLanguage = PORTUGUESE_LANG_ORIGINAL;
                }
                await getAdditionalAttributeFieldData({ brand: metadataBrandValue, language: currentLanguage }).then((result) => {
                    this._additionalAttributeFieldAndLabelList = result;
                });
            }
        }
    }

    /**
     * The price of the product for the user, if any.
     *
     * @type {ConnectApi.ProductPrice}
     * @private
     */
    @wire(getProductPrice, {
        communityId: communityId,
        productId: '$recordId',
        effectiveAccountId: '$resolvedEffectiveAccountId'
    })
    async productPriceValue({ error, data }) {
        //Updated as part of BS-573
        if (data) {
            this._productPrice = data;
            let recommendedRetailPriceResult = await getRecommendedRetailPrice({
                pricebookEntryId: this._productPrice.pricebookEntryId
            });
            if (recommendedRetailPriceResult !== null && recommendedRetailPriceResult !== undefined) {
                this._recommendedRetailPrice = recommendedRetailPriceResult[RRP_FIELD];
            }
        } else if (error) {
            this._productPrice = undefined;
        }
    }

    /**
     * The images of the product for the user, if any.
     *
     * @type {B2B_ProductDetailsController.B2B_ProductImageWrapper}
     * @private
     */
    @wire(getProductImages, {
        productId: '$recordId'
    })
    productImages;

    /**
     * The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.
     */
    async connectedCallback() {
        this.updateCartInformation();
        //Added as part of BS-575
        let result = await getShowRecommendedRetailPrice({
            accountId: this._effectiveAccountId
        });
        if (result !== null) {
            this.isToggleClicked = result;
        }
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');

        currentStore.includes(SH_STORE) == true ? (this._isSilhouetteStore = true) : (this._isSilhouetteStore = false);
    }

    _isLoading = false;

    get isLoading() {
        return this._isLoading;
    }

    loadingProducts(event) {
        this._isLoading = event.detail.loading;
    }

    /**
     * Gets the normalized effective account of the user.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get resolvedEffectiveAccountId() {
        const effectiveAccountId = this.effectiveAccountId || '';
        let resolved = null;

        if (effectiveAccountId.length > 0 && effectiveAccountId !== '000000000000000') {
            resolved = effectiveAccountId;
        }
        return resolved;
    }

    /**
     * Gets whether product information has been retrieved for display.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get hasProduct() {
        return this.product && this.product.data !== undefined;
    }

    /**
     * Gets whether product has variation information retrieved for display.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get hasVariations() {
        return this.product.data.variationInfo != null;
    }

    //384
    /**
     * Get Description for the product.
     *
     */
    get productDescription() {
        let currentUrl = window.location.href.split('/s/');
        let splittedUrl = currentUrl[0].split('/');
        if (splittedUrl[splittedUrl.length - 1] === 'neubau' && this.product.data.fields.Product_Description__c) {
            return this.product.data.fields.Product_Description__c;
        } else if (splittedUrl[splittedUrl.length - 1] === 'silhouette' && this.product.data.fields.Description) {
            return this.product.data.fields.Description;
        }
    }

    /**
     * Gets the normalized, displayable product information for use by the display components.
     *
     * @readonly
     */
    get displayableProduct() {
        if (this.product !== undefined && this.product !== null && this.product.data !== undefined && this.product.data !== null && this.product.data) {
            /*Added as part of BS-579
             *checking the brand value
             */
            let brandValue;
            if (this.product.data.fields.B2B_Brand__c != null) {
                brandValue = this.product.data.fields.B2B_Brand__c;
            }

            //BS-740
            let frameColorDescriptionValue;
            if (this.product.data.fields.B2B_Frame_Color_Description__c != null) {
                frameColorDescriptionValue = this.product.data.fields.B2B_Frame_Color_Description__c;
            }
            //BS-740
            let collectionDesignFamilyValue;
            if (this.product.data.fields.B2B_Design_Family__c != null) {
                collectionDesignFamilyValue = this.product.data.fields.B2B_Design_Family__c;
            }

            //BS-740
            let sparepartTypeValue;
            if (this.product.data.fields.B2B_Sparepart_Type__c != null) {
                sparepartTypeValue = this.product.data.fields.B2B_Sparepart_Type__c;
            }

            let frameTypeValue;
            if (this.product.data.fields.B2B_Frame_type__c != null) {
                frameTypeValue = this.product.data.fields.B2B_Frame_type__c;
            }

            let modelValue;
            if (this.product.data.fields.B2B_Model__c != null) {
                modelValue = this.product.data.fields.B2B_Model__c;
            }
            return {
                categoryPath: this.product.data.primaryProductCategoryPath.path.map((category) => ({
                    id: category.id,
                    name: category.name
                })),
                description: this.product.data.fields.Description,
                frameColorDescription: frameColorDescriptionValue, //BS-740
                collectionDesignFamily: collectionDesignFamilyValue, //BS-740
                sparepartType: sparepartTypeValue, //BS-740
                model: modelValue,
                frameType: frameTypeValue,
                image: {
                    alternativeText: this.product.data.defaultImage.alternativeText,
                    url: resolve(this.product.data.defaultImage.url)
                },
                images: this.productImages.data,
                brand: brandValue, //BS-579
                name: this.product.data.fields.Name, //BS-1401 : Display Name of the Product on Product detail page
                model: this.product.data.fields.B2B_Model__c, //added as part of BS-360
                variationAttributeInfo: this.product.data.variationInfo != undefined ? this.product.data.variationInfo.variationAttributeInfo || {} : null,
                attributeMappings: this.product.data.variationInfo != undefined ? this.product.data.variationInfo.attributesToProductMappings || {} : null,
                variationAttributeSet: this.product.data.variationInfo != undefined ? this.product.data.variationAttributeSet || {} : null,
                variationParentId: this.product.data.variationParentId || {},
                price: {
                    currency: (this._productPrice || {}).currencyIsoCode,
                    negotiated: (this._productPrice || {}).unitPrice,
                    recommendedRetailPrice: this._recommendedRetailPrice //Added as part of BS-573
                },
                sku: this.product.data.fields.StockKeepingUnit,
                deliveryTimeJSON: this.product.data.fields.B2B_Shipping_Status_JSON__c != null ? this.product.data.fields.B2B_Shipping_Status_JSON__c : null, //BS-644
                deliveryStatusJSON:
                    this.product.data.fields.B2B_Availability_JSON__c != null
                        ? JSON.parse(this.product.data.fields.B2B_Availability_JSON__c.replace(/&quot;/g, '"'))
                        : null,
                disableProduct: checkProductAvailability(this.product.data.fields.B2B_Availability_JSON__c, this.countryCode),
                customFields: Object.entries(this.product.data.fields || Object.create(null))
                    .filter(([key]) => (this.customDisplayFields || '').includes(key))
                    .map(([key, value]) => ({ name: key, value }))
            };
        } else {
            return null;
        }
    }

    /**
     * Gets whether the cart is currently locked
     *
     * Returns true if the cart status is set to either processing or checkout (the two locked states)
     *
     * @readonly
     */
    get _isCartLocked() {
        const cartStatus = (this.cartSummary || {}).status;
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
                    actionDisabled: this._isCartLocked
                }
            }
        };
    }

    /**
     * Handles a user request to add the product to their active cart.
     * On success, a success toast is shown to let the user know the product was added to their cart
     * If there is an error, an error toast is shown with a message explaining that the product could not be added to the cart
     *
     * Toast documentation: https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_toast
     *
     * @private
     */
    addToCart(event) {
        this._isLoading = true;
        let productId;
        if (event.detail.isOverlay || event.detail.isStyleShade) {
            productId = event.detail.productId;
        } else {
            productId = this.recordId;
        }

        //BS-1245
        let currencyIsoCode =
            (this._productPrice || {}) != undefined &&
            (this._productPrice || {}) != null &&
            (this._productPrice || {}).currencyIsoCode != undefined &&
            (this._productPrice || {}).currencyIsoCode != null &&
            (this._productPrice || {}).currencyIsoCode != ''
                ? (this._productPrice || {}).currencyIsoCode
                : this._defaultCurrencyIsoCode;

        addToCart({
            communityId: communityId,
            productId: productId,
            quantity: event.detail.quantity,
            effectiveAccountId: this.resolvedEffectiveAccountId,
            currencyIsoCode: currencyIsoCode //BS-1245
        })
            .then((result) => {
                this._cartItemId = result.cartItemId; //BS-1562
                this.dispatchEvent(
                    new CustomEvent('cartchanged', {
                        bubbles: true,
                        composed: true
                    })
                );
                if (event.detail.isOverlay) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: infoLabels.split(',')[3],
                            message: addToCartHeader.split(',')[0],
                            variant: 'success'
                        })
                    );
                } else {
                    const addToCartModal = this.template.querySelector('c-b2b_add-to-cart-modal');
                    addToCartModal.cartid = result.cartId;
                    addToCartModal.cartItemId = result.cartItemId; //BS-1562
                    addToCartModal.error = undefined; // Added as a part of BS-1315
                    addToCartModal.show();
                }
                this._isLoading = false;
            })
            .catch((error) => {
                if (event.detail.isOverlay) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: infoLabels.split(',')[3],
                            message: this.cartErrorLabel, //Added as part of BS-900
                            variant: 'error'
                        })
                    );
                } else {
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
                }
                this._isLoading = false;
            });
    }

    /**
     * Handles a user request to add the product to a newly created wishlist.
     * On success, a success toast is shown to let the user know the product was added to a new list
     * If there is an error, an error toast is shown with a message explaining that the product could not be added to a new list
     *
     * Toast documentation: https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_toast
     *
     * @private
     */
    createAndAddToList() {
        let listname = this.product.data.primaryProductCategoryPath.path[0].name;
        createAndAddToList({
            communityId: communityId,
            productId: this.recordId,
            wishlistName: listname,
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
            .then(() => {
                this.dispatchEvent(new CustomEvent('createandaddtolist'));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: '{0} was added to a new list called "{1}"',
                        messageData: [this.displayableProduct.name, listname],
                        variant: 'success',
                        mode: 'dismissable'
                    })
                );
            })
            .catch(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: '{0} could not be added to a new list. Please make sure you have fewer than 10 lists or try again later',
                        messageData: [this.displayableProduct.name],
                        variant: 'error',
                        mode: 'dismissable'
                    })
                );
            });
    }

    /**
     * Ensures cart information is up to date
     */
    updateCartInformation() {
        //BS-1245
        let currencyIsoCode =
            (this._productPrice || {}) != undefined &&
            (this._productPrice || {}) != null &&
            (this._productPrice || {}).currencyIsoCode != undefined &&
            (this._productPrice || {}).currencyIsoCode != null &&
            (this._productPrice || {}).currencyIsoCode != ''
                ? (this._productPrice || {}).currencyIsoCode
                : this._defaultCurrencyIsoCode;

        getCartSummary({
            communityId: communityId,
            effectiveAccountId: this.resolvedEffectiveAccountId,
            currencyIsoCode: currencyIsoCode //BS-1245
        })
            .then((result) => {
                this.cartSummary = result;
            })
            .catch((e) => {
                // Handle cart summary error properly
                // For this sample, we can just log the error
                console.log(e);
            });
    }
}
