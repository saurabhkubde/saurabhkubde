import { api, LightningElement, track, wire } from 'lwc';
import { generateStyleProperties } from 'experience/styling';
import { EVENT, KEY_CODE } from './constants';
import getProductImages from '@salesforce/apex/D2C_ProductCardController.getProductImages';
import { AppContextAdapter } from 'commerce/contextApi';
import getColorsMetadata from '@salesforce/apex/D2C_ProductCardController.getColorsMetadata'; //NBD2C-48

/**
 * @typedef {import('../d2c_searchProductCard/d2c_searchProductCard').ProductCardConfiguration} ProductCardConfiguration
 */

/**
 * @typedef {import('../d2c_searchProductCard/d2c_searchProductCard').ProductCardData} ProductCardData
 */

/**
 * Generates an SLDS CSS class representing margin of a given spacing.
 * @param {string} spacing The defined spacing
 * @param {('vertical' | 'horizontal')} direction The direction to use
 * @returns {string} The margin class
 */
function generateClassForSpacing(spacing, direction) {
    return ['none', 'small', 'medium', 'large'].includes(spacing) ? `slds-m-${direction}_${spacing}` : '';
}

/**
 * An event fired when the add to cart button is clicked.
 * @event SearchProductGrid#addproducttocart
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {string} detail.productId
 *   The unique identifier of the product to be added to the cart.
 * @property {number} detail.quantity
 *   The quantity of the product to be added to the cart.
 */

/**
 * An event fired when the user indicates a desire to view the details of a product.
 * @event SearchProductGrid#showproduct
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {string} detail.productId
 *   The unique identifier of the product.
 * @property {string} detail.productName
 *   The name of the product.
 */

/**
 * The layout UI configuration.
 * @typedef {object} ProductGridConfiguration
 * @property {string} layout
 *  The layout for the card collection.
 *  Supported (case-sensitive) values are:
 *  - "grid"
 *      The products will be displayed in grid column layout.
 *      The property gridMaxColumnsDisplayed defines the max no. of columns.
 *  - "list"
 *      The products will be displayed as a list.
 * @property {number} gridMaxColumnsDisplayed
 *  The maximum columns to be displayed in the grid.
 * @property {ProductCardConfiguration} cardConfiguration
 *  The card layout configuration.
 */

/**
 * Representation of Builder Field Item
 * @typedef {object} BuilderFieldItem
 * @property {string} name
 *  The name of the field.
 * @property {string} fontSize
 *  The font size of the field.
 *  Accepted values are: "small", "medium", and "large"
 * @property {string} fontColor
 *  Font color for the field, as 'rgb', 'rgba' or 'hex' CSS value.
 */

/**
 * @fires SearchProductGrid#showproduct
 * @fires SearchProductGrid#addproducttocart
 */

const PRODUCT_CARD_CONTAINER_CLASS = ' product-card-container';
export default class SearchProductGrid extends LightningElement {
    static renderMode = 'light';

    /**
     * Gets or sets the product layout configuration.
     * @type {?ProductGridConfiguration}
     * NBD2C-39
     */
    @api
    configuration;

    /**
     * Gets or sets the card collection display-data.
     * @type {?ProductCardData[]}
     * NBD2C-39
     */
    @api
    displayData;

    /**
     * Gets or sets the card collection display-data.
     * @type {?ProductCardData[]}
     * NBD2C-39
     */
    @track
    dataArray = [];

    /**
     * Sets true when the data is successfully fetched.
     * @type {Boolean}
     * NBD2C-39
     */
    _dataLoaded = false;

    /**
     * Map of Parent ids vs variation ids.
     * @type {Map}
     * NBD2C-39
     */
    @track
    _parentVsVariationMap = new Map();

    /**
     * Map of Parent value vs colorcodes.
     * @type {Map}
     * NBD2C-48
     */
    _customMetadataColorsMap = new Map();

    /**
     * Stores the productd Ids to check if there's a change in data
     * @type {Map}
     * NBD2C-93
     */
    @track
    _tempProductIdList = [];
    /**
     * Gets the normalized card collection display-data.
     * @type {ProductCardData[]}
     * @readonly
     * @private
     * NBD2C-39
     */
    get normalizedDisplayData() {
        return this.displayData ?? [];
    }

    /**
     * Gets the normalized card collection display-data.
     * @type {ProductCardData[]}
     * @readonly
     * @private
     * NBD2C-39
     */
    get updatedCardCollection() {
        return 'f';
    }

    /**
     * Gets the SLDS classes to apply the spacing for the product layout.
     * @type {string}
     * @readonly
     * @private
     * NBD2C-39
     */
    get layoutSpacingClasses() {
        const list = this?.querySelector('ul');
        const spacingRow = list && getComputedStyle(list).getPropertyValue('--ref-c-d2c_search-product-grid-spacing-row');
        const spacingCol = list && getComputedStyle(list).getPropertyValue('--ref-c-d2c_search-product-grid-spacing-column');
        const row = generateClassForSpacing(spacingRow || '', 'vertical');
        const col = generateClassForSpacing(spacingCol || '', 'horizontal');
        return `${row} ${col}`.trim() + PRODUCT_CARD_CONTAINER_CLASS;
    }

    /**
     * Gets the custom styles to apply to the elements of the product layout.
     * @type {string}
     * @readonly
     * @private
     * NBD2C-39
     */
    get layoutCustomStyles() {
        const gridMaxColumnsDisplayed = this.configuration?.gridMaxColumnsDisplayed || 4;
        const cardBasis = gridMaxColumnsDisplayed > 0 ? 100 / gridMaxColumnsDisplayed : 25;
        return generateStyleProperties({
            '--ref-c-d2c_search-product-grid-container-basis': `${Math.round(cardBasis * 100) / 100}%`
        });
    }

    /**
     * Gets the grid specific class for the un-ordered list container if the
     * layout is 'grid', otherwise it returns empty string.
     * @type {string}
     * @readonly
     * @private
     * NBD2C-39
     */
    get layoutContainerClass() {
        return this.isGridLayout ? 'product-grid-container' : '';
    }

    /**
     * Gets whether the layout is grid or not.
     * @type {boolean}
     * @readonly
     * @private
     * NBD2C-39
     */
    get isGridLayout() {
        return this.configuration?.layout === 'grid';
    }

    /**
     * Product card configuration.
     * @type {?ProductCardConfiguration}
     * @readonly
     * @private
     * NBD2C-39
     */
    get cardConfiguration() {
        return this.configuration?.cardConfiguration;
    }

    @wire(AppContextAdapter)
    appContext; // NBD2C-48

    async connectedCallback() {
        let result = await getColorsMetadata({}); //NBD2C-48
        if (result !== null && result !== undefined) {
            let customMetadataColors = new Map(Object.entries(JSON.parse(result)));
            for (let element of customMetadataColors.values()) {
                this._customMetadataColorsMap.set(element.Label, element.B2B_Color_code__c);
            }

            if (this.displayData != undefined && this.displayData != null && Object.keys(this.displayData).length != 0) {
                this.handleModelImageUpdate();
            }
        }
    }

    renderedCallback() {
        if (this._tempProductIdList.length > 0 && this.displayData.length > 0) {
            let displayDataIdList = [];

            this.displayData.forEach((element) => {
                displayDataIdList.push(element.id);
            });
            if (!(JSON.stringify(this._tempProductIdList) == JSON.stringify(displayDataIdList))) {
                this.handleModelImageUpdate();
            }
        }
        this.updatePricesData();
    }

    /**
     * Update the display data with model Image
     * @type {?ProductCardConfiguration}
     * NBD2C-39
     */
    handleModelImageUpdate() {
        this._tempProductIdList = [];
        this.displayData.forEach((element) => {
            this._tempProductIdList.push(element.id);
        });
        let productVariationIdList = [];
        let currentCountryCode = this.appContext?.data?.country ?? '';
        this.displayData.forEach((element) => {
            let fields = element?.fields ?? null;
            let variationJSON;
            if (fields) {
                fields.forEach((field) => {
                    if (field.name == EVENT.VARIATION_DETAILS) {
                        variationJSON = field.value;
                    }
                });
            }
            let variationId;
            if (variationJSON != null) {
                try {
                    let variationsData = JSON.parse(variationJSON);
                    if (variationsData.length > 0) {
                        variationsData.forEach((variation) => {
                            let countryCode = variation?.tenant ?? null;
                            if (
                                countryCode !== undefined &&
                                countryCode !== null &&
                                countryCode !== '' &&
                                countryCode.substring(0, 2).toUpperCase() === currentCountryCode.toUpperCase()
                            ) {
                                if (variation.variationProducts) {
                                    variationId = variation.variationProducts[0]?.id ?? variationId;
                                }
                            }
                        });
                    }
                } catch (exceptionInstance) {
                    variationJSON = null;
                }
            }
            if (variationId != null) {
                productVariationIdList.push(variationId);
                this._parentVsVariationMap.set(element.id, variationId);
            } else {
                productVariationIdList.push(element.id);
                this._parentVsVariationMap.set(element.id, element.id);
            }
        });
        getProductImages({ productIds: productVariationIdList })
            .then((result) => {
                if (result !== undefined && result !== null) {
                    let tempObj = JSON.parse(JSON.stringify(this.displayData));
                    tempObj.forEach((element) => {
                        let productId = this._parentVsVariationMap.get(element.id);

                        let urlValue = '';
                        if (productId) {
                            let imageObj = result.find((obj) => obj.B2B_Product__c == productId);
                            if (imageObj) {
                                urlValue = imageObj.B2B_Image_URL__c;
                            }
                        }

                        element.modelImage = urlValue;
                    });

                    this.dataArray = JSON.parse(JSON.stringify(tempObj));
                }

                this._dataLoaded = true;
            })
            .catch((error) => {
                console.error('error ', error);
            });
    }

    /**
     * Update the display data with price values
     * @type {?ProductCardConfiguration}
     * NBD2C-39
     */
    updatePricesData() {
        if (
            this.displayData != undefined &&
            this.displayData != null &&
            Object.keys(this.displayData).length != 0 &&
            this.dataArray != undefined &&
            this.dataArray != null &&
            Object.keys(this.dataArray).length != 0
        ) {
            this.dataArray.forEach((element) => {
                let displayDataObj = this.displayData.find((obj) => obj.id == element.id);
                if (displayDataObj !== undefined && displayDataObj !== null) {
                    element.prices = displayDataObj.prices;
                }
            });
        }
    }

    /**
     * Handles the `showproduct` event which navigates to a product detail page.
     * @param {CustomEvent} event A "showproduct" received from a product card
     * @private
     * @fires SearchProductGrid#showproduct
     * NBD2C-39
     */
    handleNavigateToProductPage(event) {
        event.stopPropagation();
        this.dispatchEvent(
            new CustomEvent(EVENT.SHOW_PRODUCT_EVT, {
                detail: event.detail
            })
        );
    }

    /**
     * Handles key downs on the list.
     *
     * - Home moves focus to first item.
     * - End moves focus to last item.
     * - Up arrow moves focus to previous item.
     * - Down arrow moves focus to next item.
     *
     * When the Add to Cart button is present, user can navigate
     * the list using the Home, End, and Tab (default behavior) keys.
     *
     * When the Add to Cart button isn’t present, user can navigate
     * the list using the Home, End, Tab (default behavior), Up and Down keys.
     * @param {KeyboardEvent} event The keyboard event
     * @private
     * NBD2C-39
     */
    handleKeyDown(event) {
        const { code } = event;
        if (event.target instanceof HTMLElement) {
            const id = event.target.dataset.id;
            const index = this.normalizedDisplayData.findIndex((product) => product.id === id);
            const callToActionButtonEnabled = this.configuration?.cardConfiguration.showCallToActionButton;
            switch (code) {
                case KEY_CODE.ARROW_DOWN:
                    if (!callToActionButtonEnabled) {
                        event.preventDefault();
                        this.focusListItem(index, +1);
                    }
                    break;
                case KEY_CODE.ARROW_UP:
                    if (!callToActionButtonEnabled) {
                        event.preventDefault();
                        this.focusListItem(index, -1);
                    }
                    break;
                case KEY_CODE.HOME:
                    event.preventDefault();
                    this.focusListItem(0, 0);
                    break;
                case KEY_CODE.END:
                    event.preventDefault();
                    this.focusListItem(0, -1);
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * Focuses a list item.
     * @param {number} baseIndex The base index position.
     * @param {number} steps The number of steps from the baseIndex position.
     * @private
     * NBD2C-39
     */
    focusListItem(baseIndex, steps) {
        const itemCount = this.normalizedDisplayData.length;
        let newActiveIndex = (baseIndex + steps) % itemCount;

        if (newActiveIndex < 0) {
            newActiveIndex = itemCount - 1;
        }
        Array.from(this.querySelectorAll('c-d2c_search-product-card')).at(newActiveIndex)?.focus();
    }
}
