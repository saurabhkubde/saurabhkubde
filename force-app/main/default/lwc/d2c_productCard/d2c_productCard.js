import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import PLP_LABELS from '@salesforce/label/c.D2C_PLP_Labels';
import { EVENT, DEFAULTS, OTHER_CONSTANTS } from './constants';
import ICONS from '@salesforce/resourceUrl/D2C_NB_StoreStyling';

export default class ProductCard extends NavigationMixin(LightningElement) {
    /**
     * Whether to display the negotiated price
     * @type {boolean}
     * NBD2C-39
     */
    @api
    showNegotiatedPrice;

    /**
     * Whether to display the original price
     * @type {boolean}
     */
    @api
    showOriginalPrice = false;

    /**
     * The ISO 4217 currency code for the product detail page
     * @type {?string}
     */
    @api
    currencyCode;

    /**
     * ppoduct prices
     * @type {object}
     * NBD2C-39
     */
    @api
    prices;

    /**
     * Image URL for the hover Image
     * @type {String}
     * NBD2C-39
     */
    @api
    modelImage;

    /**
     * Map of color value vs Color code
     * @type {Map}
     * NBD2C-39
     */
    @api
    customMetadataColorsMap;

    /**
     * Data in slides of the products being displayed as a card
     * @type {Array}
     * NBD2C-39
     */
    @track
    slides = [];

    /**
     * Current index of the variation product being displayed
     * @type {Number}
     * NBD2C-39
     */
    _slideIndex = 1;

    /**
     * Wishlist Icon Color Black
     * @type {String}
     * NBD2C-39
     */
    _wishlistIconBlack = ICONS + DEFAULTS.BLACK_ICON;

    /**
     * Wishlist Icon Color White
     * @type {String}
     * NBD2C-39
     */
    _wishlistIconWhite = ICONS + DEFAULTS.WHITE_ICON;

    /**
     * Next button Icon
     * @type {String}
     * NBD2C-39
     */
    _nextButton = ICONS + DEFAULTS.RIGHT;

    /**
     * Previous button Icon
     * @type {String}
     * NBD2C-39
     */
    _previousButton = ICONS + DEFAULTS.LEFT;

    /**
     * Label for explore more button
     * @type {String}
     * NBD2C-39
     */
    _exploreMoreLabel = DEFAULTS.EXPLORE_MORE;

    /**
     * NBD2C-39
     * This variable indicates whether the current device is desktop
     * @type {Boolean}
     */
    _isDesktopDevice = true;

    /**
     * NBD2C-48
     * This variable indicates the slide for which the color filter is selected
     * @type {Boolean}
     */
    _slideIndexForColorFilter;

    /**
     * NBD2C-48
     * Boolean to determin weather the color filter was selected
     * @type {Boolean}
     */
    _isFilterCalled = false;

    /**
     * NBD2C-48
     * Value of the selected filter field
     * @type {String}
     */
    _selectedfieldValue;

    /**
     * Pricing Info
     * @type {Object}
     * NBD2C-39
     */
    get pricingInfo() {
        const prices = this.prices;
        return {
            negotiatedPrice: prices?.negotiatedPrice ?? '',
            listingPrice: prices?.listingPrice ?? '',
            currencyIsoCode: prices?.currencyIsoCode ?? '',
            showPrice: prices?.negotiatedPrice ?? '',
            isLoading: !!prices?.isLoading
        };
    }

    /**
     * Getter for the slides
     * NBD2C-39
     */
    @api
    get slidesData() {
        return this.slides;
    }

    /**
     * Getter for Model Image
     * NBD2C-39
     */
    get overlayPoster() {
        return this.modelImage ? this.modelImage : '';
    }

    /**
     * Setter for Slides
     * Sets the first Variation in the slides as active
     * NBD2C-39
     */
    set slidesData(data) {
        let flagForFirstProduct = 0;
        this.slides = data.map((slide, index) => {
            let frameColor = '';
            let frameAccentColor = '';
            let slidesLength = data.length;

            if (slide.frameColor !== undefined && slide.frameColor !== null && slide.frameColor !== '') {
                frameColor = slide.frameColor;
            }
            if (slide.frameAccentColor !== undefined && slide.frameAccentColor !== null && slide.frameAccentColor !== '') {
                frameAccentColor = slide.frameAccentColor;
            }

            if (!frameColor && frameAccentColor) {
                frameColor = slide.frameAccentColor;
            }

            if (!frameAccentColor && frameColor) {
                frameAccentColor = slide.frameColor;
            }
            if (flagForFirstProduct === 0) {
                flagForFirstProduct += 1;
                let showNextButton = true;
                if (slidesLength === 1) {
                    showNextButton = false;
                }
                return {
                    ...slide,
                    index: index + 1,
                    name: slide.name ? slide.name : slide.title,
                    slideClass: OTHER_CONSTANTS.FADE_SHOW_CLASS + ' ' + OTHER_CONSTANTS.IMAGE_CONTAINER_CLASS,
                    dotClass: OTHER_CONSTANTS.DOT_ACTIVE_CLASS,
                    showNextButton: showNextButton,
                    showPreviousButton: false,
                    colorBubble:
                        OTHER_CONSTANTS.UPPER_COLOR_BUBBLE_STYLING +
                        frameColor +
                        OTHER_CONSTANTS.UPPER_COLOR_BUBBLE_PERCENTAGE_STYLING +
                        frameAccentColor +
                        OTHER_CONSTANTS.LOWER_COLOR_BUBBLE_PERCENTAGE_STYLING
                };
            }
            flagForFirstProduct += 1;
            if (flagForFirstProduct === slidesLength) {
                return {
                    ...slide,
                    index: index + 1,
                    slideClass: OTHER_CONSTANTS.FADE_HIDE_CLASS + ' ' + OTHER_CONSTANTS.IMAGE_CONTAINER_CLASS,
                    dotClass: OTHER_CONSTANTS.DOT_CLASS,
                    showNextButton: false,
                    showPreviousButton: true,
                    colorBubble:
                        EVENT.UPPER_COLOR_BUBBLE_STYLING +
                        frameColor +
                        OTHER_CONSTANTS.UPPER_COLOR_BUBBLE_PERCENTAGE_STYLING +
                        frameAccentColor +
                        OTHER_CONSTANTS.LOWER_COLOR_BUBBLE_PERCENTAGE_STYLING
                };
            }

            return {
                ...slide,
                index: index + 1,
                slideClass: OTHER_CONSTANTS.FADE_HIDE_CLASS + ' ' + OTHER_CONSTANTS.IMAGE_CONTAINER_CLASS,
                dotClass: OTHER_CONSTANTS.DOT_CLASS,
                showNextButton: true,
                showPreviousButton: true,
                colorBubble:
                    OTHER_CONSTANTS.UPPER_COLOR_BUBBLE_STYLING +
                    frameColor +
                    OTHER_CONSTANTS.UPPER_COLOR_BUBBLE_PERCENTAGE_STYLING +
                    frameAccentColor +
                    OTHER_CONSTANTS.LOWER_COLOR_BUBBLE_PERCENTAGE_STYLING
            };
        });
        if (this._selectedfieldValue) {
            this.handleColorFilterSelection(this._selectedfieldValue);
        }
        this._isFilterCalled = true;
    }

    connectedCallback() {
        const storedData = localStorage.getItem('colorFilter');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData != undefined && parsedData != null) {
                this._selectedfieldValue = parsedData.filterValue;
                this.handleColorFilterSelection(this._selectedfieldValue);
            }
        }
        this.detectDeviceType();
        this.createLabels();
    }

    /**
     * NBD2C-39
     * This method detects the device type and setup the component accordingly
     */
    detectDeviceType = () => {
        const isMobile = window.matchMedia(OTHER_CONSTANTS.MOBILE_DEVICE_DIMENSIONS).matches;
        const isTablet = window.matchMedia(OTHER_CONSTANTS.TABLET_DEVICE_DIMENSIONS).matches;
        this._isDesktopDevice = isMobile || isTablet ? false : true;
    };

    /**
     * Labels used in Product Card
     * NBD2C-39
     */
    createLabels() {
        this._exploreMoreLabel = PLP_LABELS.split(',')[0];
    }

    handleColorFilterSelection(event) {
        this._isFilterCalled = true;

        let selectedproduct;
        if (event && this.slides) {
            selectedproduct = this.slides.find((item) => item.frameColor == this.customMetadataColorsMap.get(event));
        }
        if (selectedproduct !== undefined && selectedproduct !== null && selectedproduct.index !== undefined && selectedproduct.index !== null) {
            this.handleSlideSelection(selectedproduct.index);
            this._slideIndexForColorFilter = selectedproduct.index;
        }
    }

    /**
     * Redirect to PDP page on click of the product card
     * NBD2C-39
     */
    handleProductDetailPageNavigation(event) {
        event.preventDefault();
        const productId = event.target.dataset.id;
        const productName = event.target.dataset.name;
        if (productId && productName) {
            this.dispatchEvent(
                new CustomEvent(EVENT.SHOW_PRODUCT_EVT, {
                    detail: {
                        productId,
                        productName
                    }
                })
            );
        }
    }

    /**
     * Handle whenever the slide is changed with the click of color bubble
     * NBD2C-39
     */
    showSlide(event) {
        const _slideIndex = Number(event.target.dataset.id);
        this.handleSlideSelection(_slideIndex);
    }

    /**
     * Set the selected Slide as active
     * NBD2C-39
     */
    handleSlideSelection(index) {
        if (index > this.slides.length) {
            this._slideIndex = 1;
        } else if (index < 1) {
            this._slideIndex = this.slides.length;
        } else {
            this._slideIndex = index;
        }

        if (this.slides !== undefined && this.slides !== null) {
            this.slides = this.slides.map((slide) => {
                if (this._slideIndex === slide.index) {
                    return {
                        ...slide,
                        slideClass: OTHER_CONSTANTS.FADE_SHOW_CLASS,
                        dotClass: OTHER_CONSTANTS.DOT_ACTIVE_CLASS
                    };
                }
                return {
                    ...slide,
                    slideClass: OTHER_CONSTANTS.FADE_HIDE_CLASS,
                    dotClass: OTHER_CONSTANTS.DOT_CLASS,
                    showProduct: true
                };
            });
        }
    }

    slideBackward() {
        const slideIndex = this._slideIndex - 1;
        this.handleSlideSelection(slideIndex);
    }

    slideForward() {
        const slideIndex = this._slideIndex + 1;
        this.handleSlideSelection(slideIndex);
    }

    /**
     * Redirect to PDP page on click of the Explore more button
     * NBD2C-62
     */
    handleExploreMore(event) {
        if (event && event.target && event.target.dataset && event.target.dataset.id) {
            let selectedProductId = event.target.dataset.id;
            this[NavigationMixin.GenerateUrl]({
                type: DEFAULTS.STANDARD_RECORD_PAGE,
                attributes: {
                    recordId: selectedProductId,
                    objectApiName: DEFAULTS.PRODUCT,
                    actionName: DEFAULTS.VIEW
                }
            }).then((url) => {
                window.open(url, DEFAULTS.SELF);
            });
        }
    }
}
