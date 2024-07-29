import { LightningElement, api } from 'lwc';
import getCollectionCardInformationForPDP from '@salesforce/apex/D2C_UtilityController.getCollectionCardDetailsForPDP';
import LANG from '@salesforce/i18n/lang';
import STORE_STYLING from '@salesforce/resourceUrl/D2C_NB_StoreStyling';

// NBD2C-50 : Constants Start
const NORMAL = 'opacity: 1';
const DISABLE = 'opacity: 0.2;cursor: not-allowed';
const MOBILE_DEVICE_DIMENSIONS = '(max-width: 767px)';
const TABLET_DEVICE_DIMENSIONS = '(min-width: 768px) and (max-width: 1024px)';
const SMOOTH = 'smooth';
const DYNAMIC_IMAGE_CAROUSEL_RECORD_TYPE = 'Dynamic Image Carousel';
const IMAGES_TO_BE_SHOWN = 3;
const MAXIMUM_NUMBER_OF_IMAGES_TO_BE_SHOWN = 6;
const GRABBING = 'grabbing';
const GRAB = 'grab';
const LIST = '.list';
const ITEM = '.item';
const SLIDER = '.slider';
const SCROLL = 'scroll';
// NBD2C-50 : Constants End

export default class D2C_DynamicImageCarousel extends LightningElement {
    /**
     * NBD2C-50
     * This variable holds the productId
     * @type {String}
     */
    @api
    recordId;

    /**
     * NBD2C-50
     * This variable is used to toggle the display based on the presence of data.
     * @type {Boolean}
     */
    _initialLoadComplete = false;

    /**
     * NBD2C-50
     * This collection is used to store the image carousel data
     * @type {Array}
     */
    _sectionContentCollection = [];

    /**
     * NBD2C-50
     * This variable stores the starting position for the drag action
     * @type {String}
     */
    _startPosition;

    /**
     * NBD2C-50
     * This variable is used to indicate if the mouse is clicked (for dragging)
     * @type {Boolean}
     */
    _clicked = false;

    /**
     * NBD2C-50
     * This variable stores the scroll position of the list before the drag action
     * @type {String}
     */
    _scrollLeft;

    /**
     * NBD2C-50
     * This variable stores the CSS styling for the left arrow button
     * @type {String}
     */
    _leftStyling = NORMAL;

    /**
     * NBD2C-50
     * This variable stores the CSS styling for the right arrow button
     * @type {String}
     */
    _rightStyling = NORMAL;

    /**
     * NBD2C-50
     * This variable indicates if the left arrow button should be disabled
     * @type {Boolean}
     */
    _hideLeftArrow = true;

    /**
     * NBD2C-50
     * This variable indicates if the right arrow button should be disabled
     * @type {Boolean}
     */
    _hideRightArrow = false;

    /**
     * NBD2C-50
     * This variable stores the left arrow icon for the carousel
     * @type {String}
     */
    _leftArrowIcon = STORE_STYLING + '/icons/imageCarouselLeftArrow.svg';

    /**
     * NBD2C-50
     * This variable stores the right arrow icon for the carousel
     * @type {String}
     */
    _rightArrowIcon = STORE_STYLING + '/icons/imageCarouselRightArrow.svg';

    /**
     * NBD2C-50
     * This is a boolean variable to check for desktop device
     * @type {Boolean}
     */
    _isDesktopDevice;

    /**
     * NBD2C-50
     * This is a boolean variable to check for mobile device
     * @type {Boolean}
     */
    _isMobileDevice;

    /**
     * NBD2C-50
     * This is a boolean variable to check for tablet device
     * @type {Boolean}
     */
    _isTabletDevice;

    /**
     * NBD2C-50
     * This method is used to invoke fetchSectionContentData method in presence of recordId.
     */
    connectedCallback() {
        if (this.recordId) {
            this.detectDeviceType();
            this.fetchSectionContentData();
            this._leftStyling = DISABLE;
        }
    }

    /**
     * NBD2C-50
     * Adds a scroll event listener to the list element, ensuring it is added only once.
     */
    renderedCallback() {
        if (this._initialLoadComplete) {
            const list = this.template.querySelector(LIST);
            if (list && !list.hasScrollEventListener) {
                list.addEventListener(
                    SCROLL,
                    this.debounce(() => {
                        this.updateArrowVisibility();
                    }, 150)
                );
                list.hasScrollEventListener = true; // Mark the element to avoid adding the event listener multiple times
            }
        }
    }

    /**
     * NBD2C-50
     * Utility function to handle a scroll event delay
     * @param {Function} debounceFunction - The function to debounce.
     * @param {number} delay - The delay in milliseconds.
     * @returns {Function} - The debounced function.
     */
    debounce(debounceFunction, delay) {
        let debounceTimer;
        return (...inputs) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => debounceFunction.apply(this, inputs), delay);
        };
    }

    /**
     * NBD2C-50
     * This method detects the device type and setup the component accordingly
     */
    detectDeviceType = () => {
        this._isMobileDevice = window.matchMedia(MOBILE_DEVICE_DIMENSIONS).matches;
        this._isTabletDevice = window.matchMedia(TABLET_DEVICE_DIMENSIONS).matches;
        this._isDesktopDevice = this._isMobileDevice || this._isTabletDevice ? false : true;
    };

    /**
     * NBD2C-50
     * This method fetches the section content data from the server.
     */
    fetchSectionContentData() {
        getCollectionCardInformationForPDP({ productIdList: [this.recordId], language: LANG.toLowerCase(), sectionType: DYNAMIC_IMAGE_CAROUSEL_RECORD_TYPE })
            .then((result) => {
                if (result) {
                    let sectionContentData = JSON.parse(JSON.stringify(result));
                    let parsedCollection = { carouselData: [] };
                    let counter = 0;
                    sectionContentData.forEach((element) => {
                        if (element && element.type && element.type === DYNAMIC_IMAGE_CAROUSEL_RECORD_TYPE && counter < MAXIMUM_NUMBER_OF_IMAGES_TO_BE_SHOWN) {
                            parsedCollection.carouselData.push({
                                active: element && element.active ? element.active : false,
                                brand: element.brand,
                                imageLink: element.imageLink,
                                imageAlternateText: element.imageAlternateText,
                                sortOrder: element.sortOrder
                            });
                            counter++;
                        }
                    });
                    parsedCollection.carouselData.sort((image1, image2) => image1.sortOrder - image2.sortOrder);
                    this._sectionContentCollection = parsedCollection;
                    if (this._sectionContentCollection.carouselData.length >= IMAGES_TO_BE_SHOWN) {
                        if ((this._isDesktopDevice || this._isTabletDevice) && this._sectionContentCollection.carouselData.length == IMAGES_TO_BE_SHOWN) {
                            this._rightStyling = DISABLE;
                            this._initialLoadComplete = true;
                        } else {
                            this._initialLoadComplete = true;
                            this.updateArrowVisibility();
                        }
                    }
                } else {
                    this._initialLoadComplete = false;
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /**
     * NBD2C-50
     * Updates the visibility of the navigation arrows based on the scroll position.
     */
    updateArrowVisibility() {
        if (this.template.querySelector(LIST) && this.template.querySelector(LIST).scrollWidth && this.template.querySelector(LIST).clientWidth) {
            const list = this.template.querySelector(LIST);
            if (this.template.querySelector(ITEM) && this.template.querySelector(ITEM).offsetWidth) {
                const itemWidth = this.template.querySelector(ITEM).offsetWidth;
                const maxScrollLeft = list.scrollWidth - list.clientWidth;

                this._hideLeftArrow = list.scrollLeft <= 0;
                this._leftStyling = this._hideLeftArrow ? DISABLE : NORMAL;

                this._hideRightArrow = list.scrollLeft >= maxScrollLeft - itemWidth;
                this._rightStyling = this._hideRightArrow ? DISABLE : NORMAL;
            }
        }
    }

    /**
     * NBD2C-50
     * Handles the click event on the previous button to scroll the list to the left.
     */
    handlePreviousButtonClick() {
        if (this.template.querySelector(LIST) && this.template.querySelector(ITEM) && this.template.querySelector(ITEM).offsetWidth) {
            const list = this.template.querySelector(LIST);
            const itemWidth = this.template.querySelector(ITEM).offsetWidth;
            list.scrollBy({ left: -itemWidth, behavior: SMOOTH });
            setTimeout(() => this.updateArrowVisibility(), 100);
        }
    }

    /**
     * NBD2C-50
     * Handles the click event on the next button to scroll the list to the right.
     */
    handleNextButtonClick() {
        if (this.template.querySelector(LIST) && this.template.querySelector(ITEM) && this.template.querySelector(ITEM).offsetWidth) {
            const list = this.template.querySelector(LIST);
            const itemWidth = this.template.querySelector(ITEM).offsetWidth;
            list.scrollBy({ left: itemWidth, behavior: SMOOTH });
            setTimeout(() => this.updateArrowVisibility(), 100);
        }
    }

    /**
     * NBD2C-50
     * Handles the mouse down event to start the drag action.
     * @param {MouseEvent} event - The mouse down event.
     */
    handleMouseDown(event) {
        this._clicked = true;
        this._startPosition = event.pageX - this.template.querySelector(LIST).offsetLeft;
        this._scrollLeft = this.template.querySelector(LIST).scrollLeft;
        this.template.querySelector(SLIDER).style.cursor = GRABBING;
    }

    /**
     * NBD2C-50
     * Handles the mouse move event to perform the drag action.
     * @param {MouseEvent} event - The mouse move event.
     */
    handleMouseMove(event) {
        if (!this._clicked) {
            return;
        }
        event.preventDefault();
        const position = event.pageX - this.template.querySelector(LIST).offsetLeft;
        const move = (position - this._startPosition) * 3; // Adjust the multiplier as needed
        this.template.querySelector(LIST).scrollLeft = this._scrollLeft - move;
    }

    /**
     * NBD2C-50
     * Handles the mouse up event to end the drag action.
     */
    handleMouseUp() {
        this._clicked = false;
        this.template.querySelector(SLIDER).style.cursor = GRAB;
        this.updateArrowVisibility();
    }

    /**
     * NBD2C-50
     * Handles the mouse leave event to end the drag action if the mouse leaves the list.
     */
    handleMouseLeave() {
        if (this._clicked) {
            this._clicked = false;
            this.template.querySelector(SLIDER).style.cursor = GRAB;
            this.updateArrowVisibility();
        }
    }

    /**
     * NBD2C-50
     * Handles the mouse enter event to change the cursor style.
     */
    handleMouseEnter() {
        this.template.querySelector(SLIDER).style.cursor = GRAB;
    }
}
