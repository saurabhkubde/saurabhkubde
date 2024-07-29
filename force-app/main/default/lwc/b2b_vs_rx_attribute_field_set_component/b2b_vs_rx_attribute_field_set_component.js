import { LightningElement, api, track } from 'lwc';

import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';
import getProductData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getProductData';
const PLP_STYLING = 'card-value-div-img slds-m-right_xx-small';
const PDP_STYLING = 'pdp-value-div-img slds-m-right_xx-small';
const BORDER_RIGHT_STYLE = '';
const NO_BORDER_STYLE = 'border: none';
const CONTAINER_PLP_STYLING = 'slds-text-align_center sku-div slds-p-top_xxx-small slds-align_absolute-center iterator';
const CONTAINER_PDP_STYLING = 'sku-div slds-p-top_xxx-small borderClass iterator';
const PDP_CONTAINER = 'slds-grid slds-m-top_x-small slds-p-right_small fieldsetContainer';
const PLP_CONTAINER = 'slds-grid slds-text-align_center slds-m-top_x-small slds-p-left_small slds-p-right_small fieldsetContainer';
const PDP_ATTRIBUTE_VALUE = 'vertical-align-middle';
const SEND_SELECTED_PRODUCT_SIZR_DATA = 'sendselectedproductsizedata'; //BS-788
//BS-1431 start
const SHAPE_SIZE = 'B2B_Shape_Size__c';
const SHAPE_HEIGHT = 'B2B_Shape_Height__c';
const CROSS_SIGN = ' x ';
const LENS_SHAPE_ICON = '/icons/lens_shape.svg';
const BRIDGE_SIZE = 'B2B_Bridge_Size__c';
const BRIDGE_SIZE_ICON = '/icons/SH_BridgeSize.jpg';
const LENS_SIZE = 'B2B_Lens_Size__c';
const LENS_SIZE_ICON = '/icons/SH_LensSize.jpg';
const TEMPLE_LENGTH = 'B2B_Temple_Length__c';
const TEMPLE_LENGTH_ICON = '/icons/SH_TempleLength.jpg';
const X_CHAR = 'x';
const VS_STORE = 'Vision Sensation';
const VS_STORE_SHORT = 'VS';
//BS-1431 end

export default class B2b_attributeFieldSetComponent extends LightningElement {
    /**
     *  Gets the product fied set data to be shown on the cards.
     *
     * @type {string}
     */
    @api
    displayData;

    @api
    pageSourceProductDetailsPage;

    //BS-1431
    @api
    storeType;

    /**
     * Stores the product details, icon and tooltip to show on product card
     */
    @track _productArray = [];

    /**
     * Used to store the wrapper of product field api name, label and values.
     */
    @track _productFieldSetData;

    @track
    productId;
    @track
    isPageSourcePDP = false;
    @track
    applicableStyling = PLP_STYLING;
    @track
    applicableBorderStyling = NO_BORDER_STYLE;
    @track
    containerStyling = CONTAINER_PLP_STYLING;
    @track
    mainContainer = PLP_CONTAINER;
    _verticalAlignMiddle = '';

    /**
     * The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.
     */
    connectedCallback() {
        if (this.pageSourceProductDetailsPage != null && this.pageSourceProductDetailsPage != undefined && this.pageSourceProductDetailsPage == true) {
            this.productId = this.displayData;
            this.containerStyling = CONTAINER_PDP_STYLING;
            this.applicableStyling = PDP_STYLING;
            this._verticalAlignMiddle = '';
            this.mainContainer = PDP_CONTAINER;
            this.applicableBorderStyling = BORDER_RIGHT_STYLE;
            this.isPageSourcePDP = true;
        } else {
            this.productId = this.displayData.id;

            this.applicableStyling = PLP_STYLING;
            this.applicableBorderStyling = NO_BORDER_STYLE;
            this.containerStyling = CONTAINER_PLP_STYLING;
            this.mainContainer = PLP_CONTAINER;
            this._verticalAlignMiddle = '';
            this.isPageSourcePDP = false;
        }
        this.getProductData();
    }

    /**
     * This method stores the wrapper of product
     * field api name, label and values into an array for displaying on product card.
     */
    getProductData() {
        getProductData({
            productId: this.displayData.id
        }).then((result) => {
            this._productFieldSetData = result;
            //BS-1431 start
            let lensSizeObject = {};
            lensSizeObject.name = null;
            lensSizeObject.label = null;
            lensSizeObject.value = null;
            this._productFieldSetData.forEach((product) => {
                if (product.fieldValue != null && (product.fieldApiName == SHAPE_SIZE || product.fieldApiName == SHAPE_HEIGHT)) {
                    if (product.fieldApiName == SHAPE_SIZE && lensSizeObject.name == null) {
                        lensSizeObject.name = product.fieldApiName;
                        lensSizeObject.label = product.fieldLabel;
                        lensSizeObject.value = product.fieldValue;
                    } else if (product.fieldApiName == SHAPE_SIZE && lensSizeObject.name != null) {
                        lensSizeObject.name = product.fieldApiName + CROSS_SIGN + lensSizeObject.name;
                        lensSizeObject.label = product.fieldLabel + CROSS_SIGN + lensSizeObject.label;
                        lensSizeObject.value = product.fieldValue + CROSS_SIGN + lensSizeObject.value;
                    }
                    if (product.fieldApiName == SHAPE_HEIGHT && lensSizeObject.name != null) {
                        lensSizeObject.name = lensSizeObject.name + CROSS_SIGN + product.fieldApiName;
                        lensSizeObject.label = lensSizeObject.label + CROSS_SIGN + product.fieldLabel;
                        lensSizeObject.value = lensSizeObject.value + CROSS_SIGN + product.fieldValue;
                    } else if (product.fieldApiName == SHAPE_HEIGHT && lensSizeObject.name == null) {
                        lensSizeObject.name = product.fieldApiName;
                        lensSizeObject.label = product.fieldLabel;
                        lensSizeObject.value = product.fieldValue;
                    }
                } else {
                    let productObj = {};
                    productObj.name = product.fieldApiName;
                    productObj.label = product.fieldLabel;
                    productObj.value = product.fieldValue;

                    //Setting the icons for respective fields.
                    if (product.fieldApiName === BRIDGE_SIZE) {
                        productObj.icon = STORE_STYLING + BRIDGE_SIZE_ICON;
                    } else if (product.fieldApiName === LENS_SIZE) {
                        productObj.icon = STORE_STYLING + LENS_SIZE_ICON;
                    } else if (product.fieldApiName === TEMPLE_LENGTH) {
                        productObj.icon = STORE_STYLING + TEMPLE_LENGTH_ICON;
                    }

                    //Adding the to object for displaying on the product card.
                    this._productArray.push(productObj);
                }
            });
            if (
                lensSizeObject.name != undefined &&
                lensSizeObject.name != null &&
                lensSizeObject.name.includes(X_CHAR) &&
                (this.storeType == VS_STORE || this.storeType == VS_STORE_SHORT)
            ) {
                lensSizeObject.icon = STORE_STYLING + LENS_SHAPE_ICON;
                this._productArray.splice(0, 0, lensSizeObject);
            }
            //BS-1431 end
            //sending selected frame size data BS-788
            this.dispatchEvent(
                new CustomEvent(SEND_SELECTED_PRODUCT_SIZR_DATA, {
                    detail: {
                        data: this._productArray
                    }
                })
            );
        });
    }
}
