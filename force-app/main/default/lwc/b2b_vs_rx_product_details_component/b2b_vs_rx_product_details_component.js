import { LightningElement, wire, api, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import CODE_FIELD from '@salesforce/schema/Account.k_ARIS_Account_ID__c';
import { checkProductAvailability, pageManager } from 'c/b2b_utils';

import communityId from '@salesforce/community/Id';
import getProduct from '@salesforce/apex/B2B_VS_RX_PDP_Controller.getProduct';
import getProductImages from '@salesforce/apex/B2B_VS_RX_PDP_Controller.getProductImages';
import { resolve } from 'c/b2b_cmsResourceResolver';
import HIDE_PRICES_FIELD from '@salesforce/schema/Account.B2B_Hide_Prices__c';
import getProductPrice from '@salesforce/apex/B2B_ProductDetailsController.getProductPrice';
import getAdditionalAttributeFieldData from '@salesforce/apex/B2B_ProductDetailsController.getAdditionalAttributeFieldData'; //Added as part of BS-1255
import LANG from '@salesforce/i18n/lang'; //BS-1255

const fields = [HIDE_PRICES_FIELD, CODE_FIELD];
const SH_STORE = 'silhouette';
const SPARE_PART_TYPE = 'Sun protection lens';
const SPARE_PART_TYPE_GERMAN = 'Sonnenschutzglas';
const RX_STRING = 'rx';
const SH_BRAND = 'SH';
const EE_BRAND = 'EE';
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
     */
    set effectiveAccountId(newId) {
        this._effectiveAccountId = newId;
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

    @api
    pageReference;

    _productPrice;

    _recommendedRetailPrice;
    _isSilhouetteStore = true;

    isToggleClicked;

    @api
    orderType; //BS-1713

    @api
    orderInformationSummaryCollection; //BS-1713

    @api
    lensConfiguratorCollection; //BS-1713

    /**
     *  List to store the field Data to be shown on PDP
     * BS-1255
     * @type {List}
     */
    @track
    _additionalAttributeFieldAndLabelList;

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
    product;

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
        if (data) {
            this._productPrice = data;
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
        pageManager.setFromPdp();
        this._isLoading = true;
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');
        currentStore.includes(SH_STORE) == true ? (this._isSilhouetteStore = true) : (this._isSilhouetteStore = false);

        //BS-1255
        let metadataBrandValue;
        if (currentUrl.includes(RX_STRING)) {
            metadataBrandValue = EE_BRAND;
        } else {
            metadataBrandValue = SH_BRAND;
        }

        if (metadataBrandValue !== undefined && metadataBrandValue !== null) {
            await getAdditionalAttributeFieldData({ brand: metadataBrandValue, language: LANG }).then((result) => {
                this._additionalAttributeFieldAndLabelList = result;
            });
        }
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
        if (this.product.data) {
            let productName;
            if (
                this.product.data.fields.B2B_Sparepart_Type__c != null &&
                this.product.data.fields.B2B_Sparepart_Type__c != SPARE_PART_TYPE &&
                this.product.data.fields.B2B_Sparepart_Type__c != SPARE_PART_TYPE_GERMAN
            ) {
                productName = this.product.data.fields.B2B_Sparepart_Type__c + ' ' + this.product.data.fields.Name;
            } else {
                productName = this.product.data.fields.Name;
            }

            /*
             *checking the brand value
             */
            let brandValue;
            if (this.product.data.fields.B2B_Brand__c != null) {
                brandValue = this.product.data.fields.B2B_Brand__c;
            }
            let frameColorDescriptionValue;
            if (this.product.data.fields.B2B_Frame_Color_Description__c != null) {
                frameColorDescriptionValue = this.product.data.fields.B2B_Frame_Color_Description__c;
            }
            let collectionDesignFamilyValue;
            if (this.product.data.fields.B2B_Design_Family__c != null) {
                collectionDesignFamilyValue = this.product.data.fields.B2B_Design_Family__c;
            }

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

            //BS-1701 - Start
            let modelNameAndNumber;
            if (this.product.data.fields.Name) {
                modelNameAndNumber = this.product.data.fields.Name;
            }
            if (this.product.data.fields.B2B_Model__c) {
                modelNameAndNumber += ' ' + this.product.data.fields.B2B_Model__c;
            }
            //BS-1701 - End

            return {
                categoryPath: this.product.data.primaryProductCategoryPath.path.map((category) => ({
                    id: category.id,
                    name: category.name
                })),
                description: this.product.data.fields.Description,
                frameColorDescription: frameColorDescriptionValue,
                collectionDesignFamily: collectionDesignFamilyValue,
                sparepartType: sparepartTypeValue,
                frameType: frameTypeValue,
                model: modelValue,
                modelNameNumber: modelNameAndNumber, //BS-1701
                image: {
                    alternativeText: this.product.data.defaultImage.alternativeText,
                    url: resolve(this.product.data.defaultImage.url)
                },
                images: this.productImages.data,
                brand: brandValue,
                name: productName,
                model: this.product.data.fields.B2B_Model__c,
                variationAttributeInfo: this.product.data.variationInfo != undefined ? this.product.data.variationInfo.variationAttributeInfo || {} : null,
                attributeMappings: this.product.data.variationInfo != undefined ? this.product.data.variationInfo.attributesToProductMappings || {} : null,
                variationAttributeSet: this.product.data.variationInfo != undefined ? this.product.data.variationAttributeSet || {} : null,
                variationParentId: this.product.data.variationParentId || {},
                price: {
                    currency: (this._productPrice || {}).currencyIsoCode,
                    negotiated: (this._productPrice || {}).unitPrice
                },
                sku: this.product.data.fields.StockKeepingUnit,
                deliveryTimeJSON: this.product.data.fields.B2B_Shipping_Status_JSON__c != null ? this.product.data.fields.B2B_Shipping_Status_JSON__c : null,
                deliveryStatusJSON:
                    this.product.data.fields.B2B_Availability_JSON__c != null
                        ? JSON.parse(this.product.data.fields.B2B_Availability_JSON__c.replace(/&quot;/g, '"'))
                        : null,
                hexcode: this.product.data.fields.B2B_Hexcode__c, //BS-2158/BS-2174
                hexcodeAccent: this.product.data.fields.B2B_Hexcode_Accent__c, //BS-2158/BS-2174
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
                    resultsLayout: this.resultsLayout
                }
            }
        };
    }

    handleRecordIdValueChange(event) {
        this.recordId = event.detail;
    }
}
