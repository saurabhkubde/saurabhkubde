import { LightningElement, api, wire } from 'lwc';
import { generateUrl, NavigationContext } from 'lightning/navigation';
import { AppContextAdapter, SessionContextAdapter } from 'commerce/contextApi';
import { EVENT, PRODUCT_CLASS } from './constants';

export default class SearchProductCard extends LightningElement {
    static renderMode = PRODUCT_CLASS.LIGHT; // NBD2C-39

    /**
     * product card data that is to be  displayed.
     * @type {?Object}
     * NBD2C-39
     */
    _displayData; // NBD2C-39

    /**
     * Store the navigation context of the page.
     * @type {?Object}
     * NBD2C-39
     */
    _navigationContext; // NBD2C-39

    /**
     * URL for the PDP page.
     * @type {?String}
     * NBD2C-39
     */
    _productUrl; // NBD2C-39

    /**
     * Custom metadata for the Colors
     * @type {?Map}
     * NBD2C-39
     */
    @api
    customMetadataColorsMap = new Map(); // NBD2C-39

    @wire(NavigationContext) // NBD2C-39
    wiredNavigationContext(context) {
        this._navigationContext = context;
        this.updateCallToActionButtonUrl();
    }

    @wire(SessionContextAdapter)
    sessionContext; // NBD2C-39

    @wire(AppContextAdapter)
    appContext; // NBD2C-39

    /**
     * Gets or sets the card display-data.
     * @type {?ProductCardData}
     * NBD2C-39
     */
    @api
    set displayData(data) {
        this._displayData = data;
        this.updateCallToActionButtonUrl();
    }

    @api
    modelImageURL;

    get displayData() {
        return this._displayData;
    }

    /**
     * Gets or sets the card UI configuration.
     * @type {?ProductCardConfiguration}
     * NBD2C-39
     */
    @api
    configuration;

    @api
    focus() {
        if (this.configuration?.showCallToActionButton) {
            const focusTarget = this.querySelector(PRODUCT_CLASS.COMMON_LINK) || this.querySelector(PRODUCT_CLASS.COMMON_BUTTON);
            focusTarget?.focus();
        } else {
            const index = this.fields?.findIndex((field) => field.displayData.tabStoppable) || 0;
            const focusTarget = Array.from(this.querySelectorAll('c-search-product-field'))[index];
            focusTarget?.focus();
        }
    }

    /**
     * Gets the prices display-data.
     * @type {ProductSearchPricesData}
     * @readonly
     * @private
     * NBD2C-39
     */
    get pricingInfo() {
        const prices = this.displayData?.prices;
        return {
            negotiatedPrice: prices?.negotiatedPrice ?? '',
            listingPrice: prices?.listingPrice ?? '',
            currencyIsoCode: prices?.currencyIsoCode ?? '',
            isLoading: !!prices?.isLoading
        };
    }

    /**
     * Gets a value merged representations of BuilderFieldItem.
     * @type {ProductField[]}}
     * @readonly
     * @private
     * NBD2C-39
     */
    get variations() {
        let currentCountryCode = this.appContext?.data?.country ?? '';
        if (this.displayData) {
            let fields = this.displayData?.fields ?? null;
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
                        child.title = this.displayData.name;
                    });
                    return {
                        prices: this.displayData.prices,
                        child: childrenArray ? childrenArray : [],
                        modelImage: this.displayData.modelImage
                    };
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            } else {
                let fields = this.displayData?.fields ?? null;
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
                    prices: this.displayData.prices,
                    modelImage: this.displayData.modelImage,
                    child: [
                        {
                            id: this.displayData.id ? this.displayData.id : null,
                            title: this.displayData.name,
                            image: imageLink,
                            frameColor: frameColor,
                            frameAccentColor: frameAccentColor
                        }
                    ]
                };
            }
        }
    }

    /**
     * Gets the container class for the card. The container class will vary
     * depending upon the layout property.
     * @type {string}
     * @readonly
     * @private
     * NBD2C-39
     */
    get cardContainerClass() {
        return this.isGridLayout ? PRODUCT_CLASS.CARD_CONTAINER_GRID : PRODUCT_CLASS.CARD_CONTAINER_LIST;
    }

    /**
     * Gets whether the layout is grid or not.
     * @type {boolean}
     * @readonly
     * @private
     * NBD2C-39
     */
    get isGridLayout() {
        return this.configuration?.layout === PRODUCT_CLASS.GRID;
    }

    /**
     * Click event handler for product card which navigates to the product detail page
     * @param {MouseEvent | KeyboardEvent} event The mouse event on click
     * @private
     * @fires SearchProductCard#showproduct
     * NBD2C-39
     */
    handleProductDetailPageNavigation(event) {
        event.preventDefault();
        const productId = this.displayData?.id;
        const productName = this.displayData?.name;

        this.dispatchEvent(
            new CustomEvent(EVENT.SHOW_PRODUCT_EVT, {
                detail: {
                    productId,
                    productName
                }
            })
        );
    }

    /**
     * Whether to show price information.
     * Don't show price if both show listing and negotiated prices are disabled.
     * @type {boolean}
     * @readonly
     * @private
     * NBD2C-39
     */
    get showPrice() {
        const { showListingPrice, showNegotiatedPrice } = this.configuration?.priceConfiguration || {};
        return !!(showListingPrice || showNegotiatedPrice);
    }
    get showNegotiatedPrice() {
        return !!this.configuration?.priceConfiguration?.showNegotiatedPrice;
    }
    get showOriginalPrice() {
        return !!this.configuration?.priceConfiguration?.showListingPrice;
    }

    /**
     * Handle the keydown event from product image and name.
     * @param {KeyboardEvent} event the event object
     * @private
     * NBD2C-39
     */
    handleKeydown(event) {
        if (event.key === ENTER) {
            this.handleProductDetailPageNavigation(event);
        }
    }

    /**
     * Handler for Call To Action
     * which should redirect the user to the login page
     * @private
     * NBD2C-39
     */
    updateCallToActionButtonUrl() {
        if (this._navigationContext && this?._displayData?.id) {
            this._productUrl = generateUrl(this._navigationContext, {
                type: PRODUCT_CLASS.STANDARD_RECORD_PAGE,
                attributes: {
                    objectApiName: PRODUCT_CLASS.PRODUCT_OBJECT,
                    recordId: this._displayData.id,
                    actionName: PRODUCT_CLASS.VIEW
                }
            });
        }
    }
}
