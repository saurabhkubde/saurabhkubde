import { LightningElement, api, track } from 'lwc';
import { DEFAULTS } from './constants';

export default class D2C_productDetailsVariations extends LightningElement {
    @api
    variationProductIds;

    @api
    colorFilter;

    @api
    productId;

    @track _productVariationsCollection = []; // NBD2C-49: This collection array is used to store all the product variations information
    _selectedColorName; // NBD2C-49: This variable store the current vatiation color name

    connectedCallback() {
        this.getProductVariationColors();
    }

    /**
     * NBD2C-49
     * This method is used to construct the variation color bubble and set the color name to the bubble
     */
    getProductVariationColors() {
        if (this.colorFilter != undefined && this.colorFilter != null) {
            for (let index = 0; index < this.colorFilter.length; index++) {
                let productObj = {};
                productObj.Id = this.colorFilter[index].Id;
                productObj.hexCode = this.colorFilter[index].hexCode;
                productObj.hexCodeAccent = this.colorFilter[index].hexCodeAccent;
                productObj.colorName = this.colorFilter[index].colorName;
                productObj.colorBubble =
                    DEFAULTS.UPPER_COLOR_BUBBLE_STYLING +
                    (productObj.hexCode ? productObj.hexCode : productObj.hexCodeAccent ? productObj.hexCodeAccent : null) +
                    DEFAULTS.UPPER_COLOR_BUBBLE_PERCENTAGE_STYLING +
                    (productObj.hexCodeAccent ? productObj.hexCodeAccent : productObj.hexCode ? productObj.hexCode : null) +
                    DEFAULTS.LOWER_COLOR_BUBBLE_PERCENTAGE_STYLING;

                this._productVariationsCollection.push(productObj);
            }
            this.setColorBubbleStyling();
        }
    }

    /**
     * NBD2C-49
     * This Method is used to set the styling of the variation color bubble
     */
    setColorBubbleStyling() {
        this._productVariationsCollection = this._productVariationsCollection.map((item) => {
            if (item.Id === this.productId) {
                this._selectedColorName = item.colorName;
                return {
                    ...item,
                    colorBubbleClass: DEFAULTS.ACTIVE_COLOR_BUBBLE_STYLING
                };
            }
            return {
                ...item,
                colorBubbleClass: DEFAULTS.INACTIVE_COLOR_BUBBLE_STYLING
            };
        });
    }

    /**
     * NBD2C-49
     * This method is used to handle the selection of variation color bubble on PDP
     */
    handleColorBubbleSelection(event) {
        let selectedProductId;
        if (event && event.target && event.target.dataset && event.target.dataset.id) {
            selectedProductId = event.target.dataset.id;
            this._productVariationsCollection = this._productVariationsCollection.map((item) => {
                if (item.Id === selectedProductId) {
                    this._selectedColorName = item.colorName;
                    return {
                        ...item,
                        colorBubbleClass: DEFAULTS.ACTIVE_COLOR_BUBBLE_STYLING
                    };
                }
                return {
                    ...item,
                    colorBubbleClass: DEFAULTS.INACTIVE_COLOR_BUBBLE_STYLING
                };
            });
        }
        if (selectedProductId != this.productId) {
            const customEvent = new CustomEvent(DEFAULTS.SELECTED_PRODUCT_ID, {
                detail: {
                    selectedProductVariationId: selectedProductId
                },
                bubbles: true,
                composed: true
            });
            this.dispatchEvent(customEvent);
        }
    }
}
