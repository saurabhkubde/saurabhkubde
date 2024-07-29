import { LightningElement, api, track, wire } from 'lwc';
import { ProductAdapter } from 'commerce/productApi';
import getProductImages from '@salesforce/apex/D2C_ProductDetailsController.getProductImages';
import { NavigationMixin } from 'lightning/navigation';
import getProductVariationDetails from '@salesforce/apex/D2C_ProductDetailsController.getProductVariationDetails';
import D2C_NB_PDP_LABELS from '@salesforce/label/c.D2C_NB_PDP_LABELS';
import { DEFAULTS } from './constants';

export default class D2C_ProductDetails extends NavigationMixin(LightningElement) {
    /**
     * NBD2C-49
     * Gets or sets the unique identifier of a product.
     *
     * @type {string}
     */
    @api
    recordId;

    _productImageDataReceived = false; // NBD2C-49: Variable used to confirm if the initial data is loaded to display the product Images

    _selectedProductVariationId; //NBD2C-49: Variable used to store the selected Variation Product Id

    _hasVariations = false; //NBD2C-49: variable to identify if the product is of type variation

    _showSpinner = false; // NBD2C-49: variable used to show the spinner

    _displayDetailsData = false; // NBD2C-49: Variable used to confirm if the initial data is loaded to display the product details

    _sunglassesCategoryLabel = D2C_NB_PDP_LABELS.split(',')[18]; // NBD2C-49

    _loadingLabel = D2C_NB_PDP_LABELS.split(',')[24]; // NBD2C-49

    _opticalEyewearLabel = D2C_NB_PDP_LABELS.split(',')[25]; //NBD2C-77

    @track
    _product = {}; // NBD2C-49: Object to store all the data related to a product

    @track
    _variationProdustIds = []; // NBD2C-49: Array List to store the variation Product Ids

    @track
    _displayData = {}; // NBD2C-49: Object to store all the product related details

    @track
    _colorFilter = []; // NBD2C-49: Stores the variation color bubble details

    @track
    _productVariationDetails = []; // NBD2C-49: Stores the variation product data

    @track
    _productImages = []; // NBD2C-49: Stores the variation product Images

    connectedCallback() {
        this._showSpinner = true;
    }

    /**
     * NBD2C-49
     * Wire call used to fetch the product related data from ProductAdapter StorefrontAPI
     */
    @wire(ProductAdapter, { productId: '$recordId' })
    productAdapter({ error, data }) {
        if (data) {
            this._product = { data: data };
            this.getNormalizedDisplayableDetails();
            if (this._product && this._product.data && this._product.data.variationInfo) {
                this.getProductVariationIds();
            }
        } else if (error) {
            console.error(error);
        }
    }

    /**
     * NBD2C-49
     * Method used to fetch the Product Images of a product
     */
    async getProductImageDetails() {
        await getProductImages({
            productId: this.recordId
        })
            .then((result) => {
                this._productImages = JSON.parse(JSON.stringify(result));
                this._productImageDataReceived = this._productImages.length > 0 ? true : false;
                if (this._productImageDataReceived === true) {
                    this._productImages[this._productImages.length - 1].lastImage = true;
                }
                this._showSpinner = false;
            })
            .catch((error) => {
                this._showSpinner = false;
                console.error(error);
            });
    }

    /**
     * NBD2C-49
     * This method is responsible to extract all the Variation product Ids from the result of StorefrontAPI ProductAdapter
     */
    getProductVariationIds() {
        if (this._product && this._product.data && this._product.data.variationInfo && this._product.data.variationInfo.attributesToProductMappings) {
            this._product.data.variationInfo.attributesToProductMappings.forEach((variant) => {
                this._variationProdustIds.push(variant.productId);
            });
            this.getProductVariationsData();
        }
    }

    /**
     * NBD2C-49
     * This method is used to fetch all the Product Variation data based on list of variation product Ids
     */
    async getProductVariationsData() {
        await getProductVariationDetails({
            productIds: this._variationProdustIds
        })
            .then((result) => {
                this._productVariationDetails = JSON.parse(JSON.stringify(result));
                this.getProductVariationColorDetails();
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /**
     * NBD2C-49
     * Method used to create a consolidated data of product variations that is further used to render the variation color bubble
     */
    getProductVariationColorDetails() {
        this._productVariationDetails.forEach((element) => {
            let productObj = {};
            productObj.Id = element.productId;
            productObj.hexCode = element.hexcode;
            productObj.hexCodeAccent = element.hexAccentCode;
            productObj.colorName = element.colorName;

            this._colorFilter.push(productObj);
        });
        this._hasVariations = true;
    }

    /**
     * NBD2C-49
     * Method used to normalize all the product data required to render in the Product Details section in PDP
     */
    getNormalizedDisplayableDetails() {
        let size = '';
        const SLASH = '/';
        let frameColorValue;
        if (this._product && this._product.data && this._product.data.fields && this._product.data.id == this.recordId) {
            let productObj = {};
            productObj.id = this.recordId;
            productObj.name = this._product.data.fields.Name != null ? this._product.data.fields.Name : null;
            productObj.shapeSize = this._product.data.fields.B2B_Shape_Size__c != null ? this._product.data.fields.B2B_Shape_Size__c : null;
            productObj.bridgeSize = this._product.data.fields.B2B_Bridge_Size__c != null ? this._product.data.fields.B2B_Bridge_Size__c : null;
            productObj.templeLength = this._product.data.fields.B2B_Temple_Length__c != null ? this._product.data.fields.B2B_Temple_Length__c : null;
            productObj.features = this._product.data.fields.Product_Description__c != null ? this._product.data.fields.Product_Description__c : null;
            productObj.lensDetails =
                this._product.data.fields.B2B_Lens_Technology__c != null ? this._product.data.fields.B2B_Lens_Technology__c.split(';') : null;
            productObj.sku = this._product.data.fields.StockKeepingUnit != null ? this._product.data.fields.StockKeepingUnit : null;
            productObj.modelName = this._product.data.fields.B2B_Model_Name__c != null ? this._product.data.fields.B2B_Model_Name__c : null;
            productObj.material = this._product.data.fields.B2C_Material__c != null ? this._product.data.fields.B2C_Material__c : null;
            productObj.colorName =
                this._product.data.fields.B2B_Frame_Color_Description__c != null ? this._product.data.fields.B2B_Frame_Color_Description__c : null;
            productObj.ParentCategoryName =
                this._product.data.primaryProductCategoryPath.path[0].name != null ? this._product.data.primaryProductCategoryPath.path[0].name : null;
            productObj.packagingValues =
                this._product.data.fields.D2C_Packaging__c != null ? this._product.data.fields.D2C_Packaging__c.split(';').join(' / ') : '';
            productObj.showLensDetails = productObj.ParentCategoryName == this._sunglassesCategoryLabel ? true : false;
            productObj.showClickAndCollect = productObj.ParentCategoryName == this._opticalEyewearLabel ? true : false; //NBD2C-77
            frameColorValue = productObj.sku != null ? productObj.sku.substring(7, 11) : null;

            if (frameColorValue != null && frameColorValue != undefined && productObj.colorName) {
                productObj.colorNameWithFrameColorValue = productObj.colorName + ' ' + frameColorValue;
            }

            if (productObj.shapeSize) {
                size = productObj.shapeSize + SLASH;
            }

            if (productObj.bridgeSize) {
                size = size != '' ? size + productObj.bridgeSize + SLASH : productObj.bridgeSize + SLASH;
            }

            if (productObj.templeLength) {
                size = size != '' ? size + productObj.templeLength : productObj.templeLength;
            }

            productObj.size = size != '' ? size : null;
            this._displayData = JSON.parse(JSON.stringify(productObj));
        }
        this._displayDetailsData = Object.keys(this._displayData).length > 0 ? true : false;
        this.getProductImageDetails();
    }

    /**
     * NBD2C-49
     * Method used to get the selected product Variation Id and redirect the user to the selected Id
     */
    getVariationProductId(event) {
        this._selectedProductVariationId = event.detail.selectedProductVariationId;
        let selectedProductId = this._selectedProductVariationId;
        this[NavigationMixin.GenerateUrl]({
            type: DEFAULTS.STANDARD_RECORD_PAGE,
            attributes: {
                recordId: selectedProductId,
                objectApiName: DEFAULTS.PRODUCT_OBJECT_API_NAME,
                actionName: DEFAULTS.VIEW_TYPE_ACTION_FOR_NAVIGATION
            }
        }).then((url) => {
            window.open(url, DEFAULTS.NAVIGATION_TARGET_TYPE);
        });
    }

    /**
     * Handler method to show or hide the loader
     * NBD2C-75
     */
    handleLoaderAction(event) {
        this._showSpinner = event.detail.showLoader;
    }
}
