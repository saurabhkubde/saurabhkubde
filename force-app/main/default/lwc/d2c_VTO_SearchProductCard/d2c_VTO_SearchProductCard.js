import { LightningElement, api, wire } from 'lwc';
import { AppContextAdapter } from 'commerce/contextApi';
import { EVENT, PRODUCT_CLASS } from './constants';

export default class D2C_VTO_SearchProductCard extends LightningElement {
    static renderMode = PRODUCT_CLASS.LIGHT; // DVM21-32

    /**
     * Product card data that is to be  displayed.
     * @type {?Object}
     * DVM21-32
     */
    _displayData;

    /**
     * Custom metadata for the Colors
     * @type {?Map}
     * DVM21-32
     */
    @api
    customMetadataColorsMap = new Map();

    @wire(AppContextAdapter)
    appContext; //DVM21-32

    /**
     * Gets or sets the card display-data.
     * @type {?ProductCardData}
     * DVM21-32
     */
    @api
    set displayData(data) {
        this._displayData = data;
    }

    /**
     * Card display-data
     * DVM21-32
     */
    get displayData() {
        return this._displayData;
    }

    /**
     * Gets a value merged representations of BuilderFieldItem.
     * @type {ProductField[]}}
     * @readonly
     * @private
     * DVM21-32
     */
    get variations() {
        let currentCountryCode = this.appContext?.data?.country ?? '';
        if (this.displayData) {
            let fields = this.displayData?.value.fields ?? null;

            let variatons;
            if (fields) {
                fields.forEach((field) => {
                    if (field.name == PRODUCT_CLASS.VARIATION_DETAILS) {
                        variatons = field.value;
                    }
                });
            }
            let childData;
            let variationsData;
            try {
                variationsData = JSON.parse(variatons);
            } catch (exceptionInstance) {
                variationsData = null;
            }
            if (variationsData) {
                variationsData.forEach((element) => {
                    let countryCode = element?.tenant ?? null;

                    if (
                        countryCode !== undefined &&
                        countryCode !== null &&
                        countryCode !== '' &&
                        countryCode.substring(0, 2).toUpperCase() === currentCountryCode.toUpperCase()
                    ) {
                        childData = element;
                    }
                });
            }

            let childrenArray = [];
            if (childData) {
                try {
                    childrenArray = childData.variationProducts;
                    childrenArray.forEach((child) => {
                        child.title = this.displayData.value.name;
                    });
                    return {
                        child: childrenArray ? childrenArray : []
                    };
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            } else {
                let fields = this.displayData?.value.fields ?? null;
                let imageLink = '';
                let frameColor = '';
                let frameAccentColor = '';

                if (fields) {
                    fields.forEach((field) => {
                        if (field.name === PRODUCT_CLASS.PICTURE_LINK) {
                            imageLink = field.value ? field.value : '';
                        }

                        if (field.name === PRODUCT_CLASS.HEXCODE) {
                            frameColor = field.value ? field.value : '';
                        }

                        if (field.name === PRODUCT_CLASS.HEXCODE_ACCENT) {
                            frameAccentColor = field.value ? field.value : '';
                        }
                    });
                }

                if (frameAccentColor === '' && frameColor !== '') {
                    frameAccentColor = frameColor;
                } else if (frameColor === '' && frameAccentColor !== '') {
                    frameColor = frameAccentColor;
                }

                return {
                    child: [
                        {
                            name: this.displayData.value.name,
                            image: imageLink ? imageLink : this.displayData.value.image.url,
                            frameColor: frameColor,
                            frameAccentColor: frameAccentColor,
                            id: this.displayData.value.id
                        }
                    ]
                };
            }
        }
    }

    /**
     * Click event handler for product card which navigates to the product detail page
     * @param {MouseEvent | KeyboardEvent} event The mouse event on click
     * @private
     * @fires SearchProductCard#showproduct
     * DVM21-32
     */
    handleProductDetailPageNavigation(event) {
        event.preventDefault();
        this.dispatchEvent(
            new CustomEvent(EVENT.SHOW_PRODUCT_EVT, {
                detail: event.detail
            })
        );
    }
}
