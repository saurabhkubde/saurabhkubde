import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import LANG from '@salesforce/i18n/lang';

const NORMAL = 'opacity: 1';
const DISABLE = 'opacity: 0.2;cursor: not-allowed';
const MOBILE_DEVICE_DIMENSIONS = '(max-width: 767px)';
const TABLET_DEVICE_DIMENSIONS = '(min-width: 768px) and (max-width: 1024px)';
const SMOOTH = 'smooth';
const MINIMUM_IMAGES_TO_BE_SHOWN = 3;
const GRABBING = 'grabbing';
const GRAB = 'grab';
const LIST = '.list';
const ITEM = '.item';
const SLIDER = '.slider';
const SCROLL = 'scroll';
const NAMED_PAGE = 'comm__namedPage';

export default class D2C_CollectionsCarouselContainer extends NavigationMixin(LightningElement) {
    /**
     * NBD2C-31
     * This variable stores the starting position for the drag action
     * @type {String}
     */
    _startPosition;

    /**
     * NBD2C-31
     * This variable is used to indicate if the mouse is clicked (for dragging)
     * @type {Boolean}
     */
    _clicked = false;

    /**
     * NBD2C-31
     * This variable stores the scroll position of the list before the drag action
     * @type {String}
     */
    _scrollLeft;

    /**
     * NBD2C-31
     * This variable stores the CSS styling for the left arrow button
     * @type {String}
     */
    _leftStyling = NORMAL;

    /**
     * NBD2C-31
     * This variable stores the CSS styling for the right arrow button
     * @type {String}
     */
    _rightStyling = NORMAL;

    /**
     * NBD2C-31
     * This variable indicates if the left arrow button should be disabled
     * @type {Boolean}
     */
    _hideLeftArrow = true;

    /**
     * NBD2C-31
     * This variable indicates if the right arrow button should be disabled
     * @type {Boolean}
     */
    _hideRightArrow = false;

    /**
     * NBD2C-31
     * This is a boolean variable to check for desktop device
     * @type {Boolean}
     */
    _isDesktopDevice;

    /**
     * NBD2C-31
     * This is a boolean variable to check for mobile device
     * @type {Boolean}
     */
    _isMobileDevice;

    /**
     * NBD2C-31
     * This is a boolean variable to check for tablet device
     * @type {Boolean}
     */
    _isTabletDevice;

    /**
     * NBD2C-31
     * This variable is used to toggle the display based on the presence of data.
     * @type {Boolean}
     */
    _initialLoadComplete = false;

    /**
     * NBD2C-31
     * This variable is used to count the number of images to display in the carousel.
     * @type {Integer}
     */
    _counter = 0;

    /**
     * NBD2C-31
     * This list is used to store the formatted carousel data.
     */
    @track _displayableCarouselImageList = [];

    /**
     * NBD2C-31
     * This object is used to store the user inputs for image URL, Collection heading and link to the Collection page
     * @type {Object}
     */
    @track _displayData = {};

    /**
     * NBD2C-31
     * This variable stores the language of the store
     * @type {String}
     */
    _applicableLanguage = LANG.split('-')[0];

    // NBD2C-31: Collection Carousel Images
    @api carouselImageLink1;
    @api carouselImageLink2;
    @api carouselImageLink3;
    @api carouselImageLink4;
    @api carouselImageLink5;
    @api carouselImageLink6;

    //NBD2C-31: Collections Carousel image headings
    @api heading1;
    @api heading2;
    @api heading3;
    @api heading4;
    @api heading5;
    @api heading6;

    //NBD2C-31: Collection Page Navigation Links
    @api carouselImageNavigationLink1;
    @api carouselImageNavigationLink2;
    @api carouselImageNavigationLink3;
    @api carouselImageNavigationLink4;
    @api carouselImageNavigationLink5;
    @api carouselImageNavigationLink6;

    //NBD2C-31: Collections Carousel image heading Translations
    @api heading1Translation;
    @api heading2Translation;
    @api heading3Translation;
    @api heading4Translation;
    @api heading5Translation;
    @api heading6Translation;

    connectedCallback() {
        this._leftStyling = DISABLE;
        this.detectDeviceType();
        this.setCarouselImageDetails();
    }

    /**
     * NBD2C-31
     * This method detects the device type and setup the component accordingly
     */
    detectDeviceType = () => {
        this._isMobileDevice = window.matchMedia(MOBILE_DEVICE_DIMENSIONS).matches;
        this._isTabletDevice = window.matchMedia(TABLET_DEVICE_DIMENSIONS).matches;
        this._isDesktopDevice = this._isMobileDevice || this._isTabletDevice ? false : true;
    };

    /**
     * NBD2C-31
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
     * NBD2C-31
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
     * NBD2C-31
     *  This method sets the translated text as the heading if it is available; otherwise, the default value is used as the heading
     * @param {String} translatedHeading - The translated text
     * @param {String} defaultHeading - The default text
     */
    setCarouselTileHeading(translatedHeading, defaultHeading) {
        let title = defaultHeading ? defaultHeading : '';

        if (translatedHeading) {
            const translations = translatedHeading.split(';');
            translations.forEach((translation) => {
                if (translation) {
                    const [key, text] = translation.split('=');
                    if (key != undefined && key != null && text != undefined && text != null && text != '' && key.trim() == this._applicableLanguage) {
                        title = text.trim();
                    }
                }
            });
        }
        return title;
    }

    /**
     * NBD2C-31
     * This method fetchs the data that user enters from the experience builder and transforms it in a displayable content.
     */
    setCarouselImageDetails() {
        this._displayData = {
            1: {
                image: this.carouselImageLink1,
                link: this.carouselImageNavigationLink1,
                title: this.setCarouselTileHeading(this.heading1Translation, this.heading1)
            },
            2: {
                image: this.carouselImageLink2,
                link: this.carouselImageNavigationLink2,
                title: this.setCarouselTileHeading(this.heading2Translation, this.heading2)
            },
            3: {
                image: this.carouselImageLink3,
                link: this.carouselImageNavigationLink3,
                title: this.setCarouselTileHeading(this.heading3Translation, this.heading3)
            },
            4: {
                image: this.carouselImageLink4,
                link: this.carouselImageNavigationLink4,
                title: this.setCarouselTileHeading(this.heading4Translation, this.heading4)
            },
            5: {
                image: this.carouselImageLink5,
                link: this.carouselImageNavigationLink5,
                title: this.setCarouselTileHeading(this.heading5Translation, this.heading5)
            },
            6: {
                image: this.carouselImageLink6,
                link: this.carouselImageNavigationLink6,
                title: this.setCarouselTileHeading(this.heading6Translation, this.heading6)
            }
        };

        for (var index in this._displayData) {
            if (this._displayData[index].image && this._displayData[index].link && this._displayData[index].title) {
                this._counter++;
                this._displayableCarouselImageList.push(this._displayData[index]);
            }
        }
        if (this._counter >= MINIMUM_IMAGES_TO_BE_SHOWN) {
            if (this._counter == MINIMUM_IMAGES_TO_BE_SHOWN && (this._isDesktopDevice || this._isTabletDevice)) {
                this._rightStyling = DISABLE;
                this._initialLoadComplete = true;
            } else {
                this._initialLoadComplete = true;
                this.updateArrowVisibility();
            }
        } else {
            this._initialLoadComplete = false;
        }
    }

    /**
     * NBD2C-31
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
     * NBD2C-31
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
     * NBD2C-31
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
     * NBD2C-31
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
     * NBD2C-31
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
     * NBD2C-31
     * Handles the mouse up event to end the drag action.
     */
    handleMouseUp() {
        this._clicked = false;
        this.template.querySelector(SLIDER).style.cursor = GRAB;
        this.updateArrowVisibility();
    }

    /**
     * NBD2C-31
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
     * NBD2C-31
     * Handles the mouse enter event to change the cursor style.
     */
    handleMouseEnter() {
        this.template.querySelector(SLIDER).style.cursor = GRAB;
    }

    /**
     * NBD2C-31
     * Handles the navigation to respective Collection Page.
     * @param {ClickEvent} event - The click event.
     */
    handleNavigation(event) {
        if (event && event.target && event.target.dataset && event.target.dataset.linkUrl) {
            let link = event.target.dataset.linkUrl;
            this[NavigationMixin.Navigate]({
                type: NAMED_PAGE,
                attributes: {
                    name: link
                }
            });
        }
    }
}
