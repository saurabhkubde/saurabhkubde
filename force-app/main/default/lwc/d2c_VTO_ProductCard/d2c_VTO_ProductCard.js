import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { EVENT, DEFAULTS, OTHER_CONSTANTS } from './constants';

import ICONS from '@salesforce/resourceUrl/D2C_VTO_SH_StoreStyling';

export default class D2C_VTO_ProductCard extends NavigationMixin(LightningElement) {
    /**
     * Map of color value vs Color code
     * @type {Map}
     * DVM21-32
     */
    @api
    customMetadataColorsMap;

    /**
     * Data in slides of the products being displayed as a card
     * @type {Array}
     * DVM21-32
     */
    @track
    _slides = [];

    /**
     * Current index of the variation product being displayed
     * @type {Number}
     * DVM21-32
     */
    _slideIndex = 1;

    /**
     * Next button Icon
     * @type {String}
     * DVM21-32
     */
    _nextButton = ICONS + DEFAULTS.right;

    /**
     * Previous button Icon
     * @type {String}
     * DVM21-32
     */
    _previousButton = ICONS + DEFAULTS.left;

    /**
     * Stores the slides to be displayed on the product card
     * DVM21-32
     */
    @track
    _displayedSlides = [];

    /**
     * Stores the color bubbles to be displayed
     * DVM21-32
     */
    @track
    _displayedColorBubbles = [];

    /**
     * Tracks the current slide index
     * DVM21-32
     */
    @track
    _currentSlideIndex = 0;

    /**
     * Number of bubbles to display per page
     * DVM21-32
     */
    _bubblesPerPage = 6;

    /**
     * Getter for the slides data
     * DVM21-32
     */
    @api
    get slidesData() {
        return this._slides;
    }

    /**
     * Checks if the previous button should be shown
     * DVM21-32
     */
    get showPreviousButton() {
        return this._currentSlideIndex > 0;
    }

    /**
     * Checks if the next button should be shown
     * DVM21-32
     */
    get showNextButton() {
        return this._currentSlideIndex + this._bubblesPerPage < this._slides.length;
    }

    /**
     * Setter for slides data, initializes and updates slides and bubbles
     * Sets the first Variation in the slides as active
     * DVM21-32
     */
    set slidesData(data) {
        let flagForFirstProduct = 0;
        let indexOnLoad = 0;
        this._slides = data.map((slide, index) => {
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
                        OTHER_CONSTANTS.UPPER_COLOR_BUBBLE_STYLING +
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

        this.updateDisplayedSlides(indexOnLoad);
        this.updateDisplayedColorBubbles(indexOnLoad);
    }

    /**
     * Updates the slides to be displayed based on the current slide index
     * DVM21-32
     */
    updateDisplayedSlides(_currentSlideIndex) {
        let startIndex = _currentSlideIndex;
        let endIndex = startIndex + this._bubblesPerPage;

        // Ensure that the endIndex does not exceed the length of the _slides array
        if (endIndex > this._slides.length) {
            startIndex = this._slides.length - this._bubblesPerPage;
            startIndex = startIndex < 0 ? 0 : startIndex;
            endIndex = this._slides.length;
        }

        this._displayedSlides = this._slides.slice(startIndex, endIndex);
    }

    /**
     * Handles the selection of a color bubble and updates the active slide
     * DVM21-32
     */
    selectColorBubble(event) {
        const _slideIndex = Number(event.target.dataset.id);
        this.handleSlideSelection(_slideIndex);
    }

    /**
     * Sets the selected slide as active based on the provided index
     * DVM21-32
     */
    handleSlideSelection(index) {
        if (index > this._slides.length) {
            this._slideIndex = 1;
        } else if (index < 1) {
            this._slideIndex = this._slides.length;
        } else {
            this._slideIndex = index;
        }

        if (this._slides !== undefined && this._slides !== null) {
            this._slides = this._slides.map((slide) => {
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
                    dotClass: OTHER_CONSTANTS.DOT_CLASS
                };
            });
        }
        this.updateDisplayedSlides(this._currentSlideIndex);
        this.updateDisplayedColorBubbles(this._currentSlideIndex);
    }

    /**
     * Updates the color bubbles to be displayed based on the current index
     * DVM21-32
     */
    updateDisplayedColorBubbles(index) {
        let startIndex = index;
        let endIndex = startIndex + this._bubblesPerPage;

        if (endIndex > this._slides.length) {
            startIndex = this._slides.length - this._bubblesPerPage;
            startIndex = startIndex < 0 ? 0 : startIndex;
            endIndex = this._slides.length;
        }

        this._displayedColorBubbles = this._slides.slice(startIndex, endIndex);
    }

    /**
     * Moves the color bubbles backward by one
     * DVM21-32
     */
    moveColorBubblesBackward() {
        if (this._currentSlideIndex > 0) {
            this._currentSlideIndex--;
            this.updateDisplayedColorBubbles(this._currentSlideIndex);
        }
    }

    /**
     * Moves the color bubbles forward by one
     * DVM21-32
     */
    moveColorBubblesForward() {
        if (this._currentSlideIndex + this._bubblesPerPage < this._slides.length) {
            this._currentSlideIndex++;
            this.updateDisplayedColorBubbles(this._currentSlideIndex);
        }
    }

    /**
     * Redirect to PDP page on click of the product card
     * DVM21-32
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
}
