import { LightningElement, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import StoreNameLogo from '@salesforce/resourceUrl/D2C_NB_StoreStyling';

// DVM21-31 : Custom label import : Start
import UNWANTED_HEADER_NAVIGATION from '@salesforce/label/c.D2C_VTO_Unwanted_Header_Navigation';
import UNWANTED_FOOTER_NAVIGATION from '@salesforce/label/c.D2C_VTO_Unwanted_Footer_Navigation';
// DVM21-31 : Custom label import : End

// NBD2C-24 CONSTANTS START
const BACKGROUND_WHITE = 'background-white';
const BLACK_LOGO = '/icons/NEUBAU-BLACK-LOGO.svg';
const BODY = 'body';
const BORDER_BOTTOM_BLACK = 'border-bottom-black';
const BORDER_BOTTOM_NONE = 'border-bottom-none';
const BORDER_BOTTOM_WHITE = 'border-bottom-white';
const CLICK = 'click';
const COLOR_BLACK = 'color-black';
const COLOR_WHITE = 'color-white';
const CURRENT_SCROLL_LENGTH = 300;
const CUSTOM_HEADER_CSS = '.customHeaderCSS';
const FILL_BLACK = 'fill-black';
const FILL_WHITE = 'fill-white';
const HEADER_NAVIGATION = '.header-navigation';
const HEADER_NAVIGATION_BUTTON = '.header-navigation button';
const HEADER_NAVIGATION_BUTTON_SVG = '.header-navigation button svg';
const HEADER_NAVIGATION_CLOSE_BUTTON = '.header-navigation .close-button';
const HOME = 'Home';
const INPUT_ICON_CONTAINER = '.input-icon-container';
const INPUT_WRAPPER_SVG = '.input-wrapper svg';
const MAX_TABLET_DEVICE_WIDTH = 767;
const MOUSE_OUT = 'mouseout';
const MOUSE_OVER = 'mouseover';
const NAV_A = 'header nav a';
const NAVIGATION_BLACK = 'navigation-black';
const NAVIGATION_WHITE = 'navigation-white';
const OVERFLOW_Y_HIDDEN = 'overflow-y-hidden';
const RESIZE = 'resize';
const SCROLLING_EVENT = 'scroll';
const SEARCH_BOTTOM_BLACK = 'search-bottom';
const SEARCH_INPUT_BUTTON = '.search-input-with-button'; //NBD2C-101
const INPUT_SEARCH_BUTTON = '.input-search-button'; //NBD2C-101
const INPUT_SEARCH_BUTTON_SVG = '.input-search-button svg'; //NBD2C-101
const PAGE_SHOW = 'pageshow'; //NBD2C-101
const SET_TIMEOUT_LIMIT = '500';
const TEXT_UPPERCASE = 'text-uppercase';
const TYPE = 'comm__namedPage';
const WHITE_LOGO = '/icons/NEUBAU-WHITE-LOGO.svg';
// NBD2C-24 CONSTANTS END

// DVM21-31 : CONSTANTS : Start
const HEADER_NAVIGATION_LIST = 'header li';
const HEADER_NAV_A = 'a';
const SHOPCONTEXT = 'shopContext';
const HEADER_NAVIGATION_BUTTON_LIST = 'header li button';
// DVM21-31 : CONSTANTS : End

export default class D2C_Store_Logo extends NavigationMixin(LightningElement) {
    /**
     * This variable holds the location of store logo (white).
     * NBD2C-24
     * @type {String}
     */
    _siteLogoBlack = StoreNameLogo + BLACK_LOGO;

    /**
     * This variable holds the location of store logo (black).
     * NBD2C-24
     * @type {String}
     */
    _siteLogoWhite = StoreNameLogo + WHITE_LOGO;

    /**
     * This variable stores the current store logo.
     * NBD2C-24
     * @type {String}
     */
    _siteLogo = '';

    /**
     * This variable indicates if component has completed the necessary computation and is now ready to display result.
     * NBD2C-24
     * @type {Boolean}
     */
    _isReady = false;

    /**
     * This variable holds the _pageReference.
     * NBD2C-24
     * @type {_pageReference}
     */
    _pageReference;

    /**
     * This variable indicates that current page is home page or not and weather to apply dynamic styling respectivly.
     * NBD2C-24
     * @type {Boolean}
     */
    _applyDynamicStyling = false;

    /**
     * This variable stores CSS selectors for unwanted footer navigation elements
     * DVM21-31
     * @type {Array}
     * @description Used in fetchUnwantedFooterNavigationTitleList method to iterate and hide footer navigation elements.
     */
    _unwantedFooterNavigationList;

    /**
     * This variable stores titles of unwanted header navigation elements
     * DVM21-31
     * @type {Array}
     * @description Used in setTimeOutToGetUnwantedHeaderNavigationTitle method to check and hide specific header navigation elements.
     */
    _unwantedHeaderNavigationList;

    /**
     * This variable stores the number of categories retrieved from the header navigation
     * DVM21-31
     * @type {Integer}
     * @description Used in fetchUnwantedHeaderNavigationTitleList method to determine the range of header navigation elements to process.
     */
    _numberOfCategories;

    /**
     * This variable captures the window event.
     * NBD2C-101
     * @type {Boolean}
     */
    _windowEvent;

    /**
     * NBD2C-24
     * @author : Sachin V
     * @param {String} element : It is the current html element to whoem styling is to be applied
     * @param {List[String]} currentValues : It is a list of class names that are to be accomodated within the classList of the element
     * @param {List[String]} previousValues : It is a list of class names that are to be removed from the classList of the element
     * This method is used to set the new class names and remove the previous class names from a HTML tag.
     */
    toggleClassOfHTMLElement(element, currentValues, previousValues) {
        if (element) {
            if (currentValues && currentValues.length > 0) {
                currentValues.forEach((currentValue) => {
                    if (element && element.classList && !element.classList.contains(currentValue)) {
                        element.classList.add(currentValue);
                    }
                });
            }

            if (previousValues && previousValues.length > 0) {
                previousValues.forEach((previousValue) => {
                    if (element && element.classList && element.classList.contains(previousValue)) {
                        element.classList.remove(previousValue);
                    }
                });
            }
        }
    }
    /**
     * NBD2C-24
     * @author : Sachin V
     * @param {String} navigationBarHeadings : HTML of navigation bar headings
     * @param {String} navigationBarMoreButton : HTML of navigation bar More button
     * @param {String} navigationBarIcon : HTML of navigation bar search icon
     * @param {String} searchText : HTML of navigation bar input text
     * @param {String} searchButton : HTML of navigation search button
     * @param {String} searchButtonSvg : HTML of navigation search button icon
     * @param {String} inputIconContainer : HTML of navigation bar input tag
     * @param {String} searchBarInputWrapper : HTML of navigation bar svg icon
     * @param {String} header : HTML of header component
     * @param {String} navigationBar HTML : of navigation bar a header component
     * This method is used to set the colors and styling of HTML components as white.
     */
    applyStylingAsWhite(
        navigationBarHeadings,
        navigationBarMoreButton,
        navigationBarIcon,
        searchText,
        searchButton,
        searchButtonSvg,
        inputIconContainer,
        searchBarInputWrapper,
        header,
        navigationBar
    ) {
        if (window.outerWidth > MAX_TABLET_DEVICE_WIDTH) {
            if (navigationBarHeadings && navigationBarHeadings.length) {
                for (let index = 0; index < navigationBarHeadings.length; index++) {
                    if (navigationBarHeadings[index]) {
                        this.toggleClassOfHTMLElement(navigationBarHeadings[index], [COLOR_WHITE, TEXT_UPPERCASE], [COLOR_BLACK]);

                        //On mouse over set border
                        navigationBarHeadings[index].addEventListener(MOUSE_OVER, () => {
                            this.toggleClassOfHTMLElement(navigationBarHeadings[index], [BORDER_BOTTOM_WHITE], [BORDER_BOTTOM_BLACK, BORDER_BOTTOM_NONE]);
                        });

                        //On mouse out remove border
                        navigationBarHeadings[index].addEventListener(MOUSE_OUT, () => {
                            this.toggleClassOfHTMLElement(navigationBarHeadings[index], [BORDER_BOTTOM_NONE], [BORDER_BOTTOM_WHITE, BORDER_BOTTOM_BLACK]);
                        });
                    }
                }
            }

            if (navigationBarMoreButton && navigationBarMoreButton.length) {
                for (let index = 0; index < navigationBarMoreButton.length; index++) {
                    if (navigationBarMoreButton[index]) {
                        this.toggleClassOfHTMLElement(navigationBarMoreButton[index], [COLOR_WHITE, TEXT_UPPERCASE], [COLOR_BLACK]);

                        //On mouse over set border
                        navigationBarMoreButton[index].addEventListener(MOUSE_OVER, () => {
                            this.toggleClassOfHTMLElement(navigationBarMoreButton[index], [BORDER_BOTTOM_WHITE], [BORDER_BOTTOM_BLACK, BORDER_BOTTOM_NONE]);
                        });

                        //On mouse over remove border
                        navigationBarMoreButton[index].addEventListener(MOUSE_OUT, () => {
                            this.toggleClassOfHTMLElement(navigationBarMoreButton[index], [BORDER_BOTTOM_NONE], [BORDER_BOTTOM_WHITE, BORDER_BOTTOM_BLACK]);
                        });
                    }
                }
            }
        }

        if (navigationBarMoreButton && navigationBarMoreButton.length) {
            for (let index = 0; index < navigationBarMoreButton.length; index++) {
                if (navigationBarMoreButton[index]) {
                    this.toggleClassOfHTMLElement(navigationBarMoreButton[index], [TEXT_UPPERCASE], []);

                    //On mouse over set border
                    navigationBarMoreButton[index].addEventListener(MOUSE_OVER, () => {
                        this.toggleClassOfHTMLElement(navigationBarMoreButton[index], [BORDER_BOTTOM_WHITE], [BORDER_BOTTOM_BLACK, BORDER_BOTTOM_NONE]);
                    });

                    //On mouse over remove border
                    navigationBarMoreButton[index].addEventListener(MOUSE_OUT, () => {
                        this.toggleClassOfHTMLElement(navigationBarMoreButton[index], [BORDER_BOTTOM_NONE], [BORDER_BOTTOM_WHITE, BORDER_BOTTOM_BLACK]);
                    });
                }
            }
        }

        if (navigationBarIcon) {
            this.toggleClassOfHTMLElement(navigationBarIcon, [FILL_WHITE], [FILL_BLACK]);
        }

        //if header Search component is present then add border to bottom with 1px height and white color
        if (searchText) {
            this.toggleClassOfHTMLElement(searchText, [BORDER_BOTTOM_WHITE, COLOR_WHITE], [SEARCH_BOTTOM_BLACK, COLOR_BLACK]);
        }

        if (searchButton) {
            this.toggleClassOfHTMLElement(searchButton, [BORDER_BOTTOM_WHITE, COLOR_WHITE], [SEARCH_BOTTOM_BLACK, COLOR_BLACK]);
        }

        if (searchButtonSvg) {
            this.toggleClassOfHTMLElement(searchButtonSvg, [FILL_WHITE], [FILL_BLACK]);
        }

        //if wishlist cart container component is present then add border to bottom with 1px height and white color
        if (inputIconContainer) {
            this.toggleClassOfHTMLElement(inputIconContainer, [BORDER_BOTTOM_WHITE], [BORDER_BOTTOM_BLACK]);
        }

        //if header Search icon is present then add white color to it and align it to right
        if (searchBarInputWrapper) {
            this.toggleClassOfHTMLElement(searchBarInputWrapper, [FILL_WHITE], [FILL_BLACK]);
        }

        //For home page there will be no background until a certain scroll is reached
        if (header) {
            this.toggleClassOfHTMLElement(header, [], [BACKGROUND_WHITE]);
        }

        if (navigationBar) {
            //If close button is present on the screen set the overflow-y for body as hidden else scroll
            const body = document.querySelector(BODY);
            if (document.querySelector(HEADER_NAVIGATION_CLOSE_BUTTON) && body && navigationBar) {
                this.toggleClassOfHTMLElement(body, [OVERFLOW_Y_HIDDEN], []);
                this.toggleClassOfHTMLElement(navigationBar, [NAVIGATION_BLACK], [NAVIGATION_WHITE]);
            } else if (window.scrollY > CURRENT_SCROLL_LENGTH && body && navigationBar) {
                this.toggleClassOfHTMLElement(body, [], [OVERFLOW_Y_HIDDEN]);
                this.toggleClassOfHTMLElement(navigationBar, [NAVIGATION_BLACK], [NAVIGATION_WHITE]);
            } else {
                this.toggleClassOfHTMLElement(body, [], [OVERFLOW_Y_HIDDEN]);
                this.toggleClassOfHTMLElement(navigationBar, [NAVIGATION_WHITE], [NAVIGATION_BLACK]);
            }

            //On click on button if back button is present add padding to it
            navigationBar.addEventListener(CLICK, () => {
                //Add overflow-y to hidden when cross button present else remove it
                const body = document.querySelector(BODY);
                if (document.querySelector(HEADER_NAVIGATION_CLOSE_BUTTON) && body && navigationBar) {
                    this.toggleClassOfHTMLElement(body, [OVERFLOW_Y_HIDDEN], []);
                    this.toggleClassOfHTMLElement(navigationBar, [NAVIGATION_BLACK], [NAVIGATION_WHITE]);
                } else if (window.scrollY > CURRENT_SCROLL_LENGTH && body && navigationBar) {
                    this.toggleClassOfHTMLElement(body, [], [OVERFLOW_Y_HIDDEN]);
                    this.toggleClassOfHTMLElement(navigationBar, [NAVIGATION_BLACK], [NAVIGATION_WHITE]);
                } else {
                    this.toggleClassOfHTMLElement(body, [], [OVERFLOW_Y_HIDDEN]);
                    this.toggleClassOfHTMLElement(navigationBar, [NAVIGATION_WHITE], [NAVIGATION_BLACK]);
                }
            });
        }
    }

    /**
     * NBD2C-24
     * @author : Sachin V
     * @param {String} navigationBarHeadings : HTML of navigation bar headings
     * @param {String} navigationBarMoreButton : HTML of navigation bar More button
     * @param {String} navigationBarIcon : HTML of navigation bar search icon
     * @param {String} searchText : HTML of navigation bar input text
     * @param {String} searchButton : HTML of navigation search button
     * @param {String} searchButtonSvg : HTML of navigation search button icon
     * @param {String} inputIconContainer : HTML of navigation bar input tag
     * @param {String} searchBarInputWrapper : HTML of navigation bar svg icon
     * @param {String} header : HTML of header component
     * @param {String} navigationBar HTML : of navigation bar a header component
     * This method is used to set the colors and styling of HTML components to black.
     */
    applyStylingAsBlack(
        navigationBarHeadings,
        navigationBarMoreButton,
        navigationBarIcon,
        searchText,
        searchButton,
        searchButtonSvg,
        inputIconContainer,
        searchBarInputWrapper,
        header,
        navigationBar
    ) {
        //Set the color to balck and also transform the text to uppercase
        if (navigationBarHeadings && navigationBarHeadings.length) {
            for (let index = 0; index < navigationBarHeadings.length; index++) {
                if (navigationBarHeadings[index]) {
                    this.toggleClassOfHTMLElement(navigationBarHeadings[index], [COLOR_BLACK, TEXT_UPPERCASE], [COLOR_WHITE]);

                    //On mouse over set border
                    navigationBarHeadings[index].addEventListener(MOUSE_OVER, () => {
                        this.toggleClassOfHTMLElement(navigationBarHeadings[index], [BORDER_BOTTOM_BLACK], [BORDER_BOTTOM_WHITE, BORDER_BOTTOM_NONE]);
                    });

                    //On mouse out remove border
                    navigationBarHeadings[index].addEventListener(MOUSE_OUT, () => {
                        this.toggleClassOfHTMLElement(navigationBarHeadings[index], [BORDER_BOTTOM_NONE], [BORDER_BOTTOM_WHITE, BORDER_BOTTOM_BLACK]);
                    });
                }
            }
        }

        //navbar more button set their text color to black and tranform text to uppercase
        if (navigationBarMoreButton && navigationBarMoreButton.length) {
            for (let index = 0; index < navigationBarMoreButton.length; index++) {
                if (navigationBarMoreButton[index]) {
                    this.toggleClassOfHTMLElement(navigationBarMoreButton[index], [COLOR_BLACK, TEXT_UPPERCASE], [COLOR_WHITE]);

                    //On mouse over set border bottom black
                    navigationBarMoreButton[index].addEventListener(MOUSE_OVER, () => {
                        this.toggleClassOfHTMLElement(navigationBarMoreButton[index], [BORDER_BOTTOM_BLACK], [BORDER_BOTTOM_WHITE, BORDER_BOTTOM_NONE]);
                    });

                    //On mouse over remove border bottom
                    navigationBarMoreButton[index].addEventListener(MOUSE_OUT, () => {
                        this.toggleClassOfHTMLElement(navigationBarMoreButton[index], [BORDER_BOTTOM_NONE], [BORDER_BOTTOM_WHITE, BORDER_BOTTOM_BLACK]);
                    });
                }
            }
        }

        // Search bar icon color toggle
        if (navigationBarIcon) {
            this.toggleClassOfHTMLElement(navigationBarIcon, [FILL_BLACK], [FILL_WHITE]);
        }

        //if search input component exists then add a border and color to it
        if (searchText) {
            this.toggleClassOfHTMLElement(searchText, [SEARCH_BOTTOM_BLACK, COLOR_BLACK], [BORDER_BOTTOM_WHITE, COLOR_WHITE]);
        }

        if (searchButton) {
            this.toggleClassOfHTMLElement(searchButton, [SEARCH_BOTTOM_BLACK, COLOR_BLACK], [BORDER_BOTTOM_WHITE, COLOR_WHITE]);
        }

        if (searchButtonSvg) {
            this.toggleClassOfHTMLElement(searchButtonSvg, [FILL_BLACK], [FILL_WHITE]);
        }

        //if wishlist cart container component is present then add border to bottom with 1px height and balck color
        if (inputIconContainer) {
            this.toggleClassOfHTMLElement(inputIconContainer, [BORDER_BOTTOM_BLACK], [BORDER_BOTTOM_WHITE]);
        }

        //if header Search icon is present then add black color to it and align it to right
        if (searchBarInputWrapper) {
            this.toggleClassOfHTMLElement(searchBarInputWrapper, [FILL_BLACK], [FILL_WHITE]);
        }

        // Set header background to black
        if (header) {
            this.toggleClassOfHTMLElement(header, [BACKGROUND_WHITE], []);
        }

        if (navigationBar) {
            //If the close button is present set the overflow-y of body to hidden else scroll
            const body = document.querySelector(BODY);
            if (document.querySelector(HEADER_NAVIGATION_CLOSE_BUTTON) && body && navigationBar) {
                this.toggleClassOfHTMLElement(body, [OVERFLOW_Y_HIDDEN], []);
                this.toggleClassOfHTMLElement(navigationBar, [NAVIGATION_BLACK], [NAVIGATION_WHITE]);
            } else {
                this.toggleClassOfHTMLElement(body, [], [OVERFLOW_Y_HIDDEN]);
                this.toggleClassOfHTMLElement(navigationBar, [NAVIGATION_BLACK], [NAVIGATION_WHITE]);
            }

            //If the close button is present set the overflow-y of body to hidden else scroll
            navigationBar.addEventListener(CLICK, () => {
                const body = document.querySelector(BODY);
                if (document.querySelector(HEADER_NAVIGATION_CLOSE_BUTTON && body && navigationBar)) {
                    this.toggleClassOfHTMLElement(body, [OVERFLOW_Y_HIDDEN], []);
                    this.toggleClassOfHTMLElement(navigationBar, [NAVIGATION_BLACK], [NAVIGATION_WHITE]);
                } else if (window.scrollY > CURRENT_SCROLL_LENGTH) {
                    this.toggleClassOfHTMLElement(body, [], [OVERFLOW_Y_HIDDEN]);
                    this.toggleClassOfHTMLElement(navigationBar, [NAVIGATION_BLACK], [NAVIGATION_WHITE]);
                } else {
                    this.toggleClassOfHTMLElement(body, [], [OVERFLOW_Y_HIDDEN]);
                    this.toggleClassOfHTMLElement(navigationBar, [NAVIGATION_WHITE], [NAVIGATION_BLACK]);
                }
            });
        }
    }

    /**
     * NBD2C-24
     * @author : Sachin V
     * This method is used to fetch component and then send it further to applyStylingAsWhite or applyStylingAsBlack based on current page location and scroll-Y.
     */
    async applyCustomCSS() {
        setTimeout(() => {
            this.setStyles();
        }, SET_TIMEOUT_LIMIT);
    }

    async setStyles() {
        const searchText = document.querySelector(SEARCH_INPUT_BUTTON);
        const searchButton = document.querySelector(INPUT_SEARCH_BUTTON);
        const searchButtonSvg = document.querySelector(INPUT_SEARCH_BUTTON_SVG);
        const inputIconContainer = document.querySelector(INPUT_ICON_CONTAINER);
        const searchBarInputWrapper = document.querySelector(INPUT_WRAPPER_SVG);
        const navigationBarHeadings = document.querySelectorAll(NAV_A);
        const navigationBarMoreButton = document.querySelectorAll(HEADER_NAVIGATION_BUTTON);
        const navigationBarIcon = document.querySelector(HEADER_NAVIGATION_BUTTON_SVG);
        const header = document.querySelector(CUSTOM_HEADER_CSS);
        const navigationBar = document.querySelector(HEADER_NAVIGATION);

        if (!searchText || !inputIconContainer || !searchBarInputWrapper) {
            this.applyCustomCSS();
            return;
        }

        //Applying the styling for tablet devices
        if (window.outerWidth > 765) {
            if (!navigationBarHeadings.length || !navigationBarMoreButton.length) {
                this.applyCustomCSS();
                return;
            }
            if (this._applyDynamicStyling) {
                this.applyStylingAsWhite(
                    navigationBarHeadings,
                    navigationBarMoreButton,
                    navigationBarIcon,
                    searchText,
                    searchButton,
                    searchButtonSvg,
                    inputIconContainer,
                    searchBarInputWrapper,
                    header,
                    navigationBar
                );
            } else {
                this.applyStylingAsBlack(
                    navigationBarHeadings,
                    navigationBarMoreButton,
                    navigationBarIcon,
                    searchText,
                    searchButton,
                    searchButtonSvg,
                    inputIconContainer,
                    searchBarInputWrapper,
                    header,
                    navigationBar
                );
            }
        } else {
            if (this._applyDynamicStyling) {
                this.applyStylingAsWhite(
                    navigationBarHeadings,
                    navigationBarMoreButton,
                    navigationBarIcon,
                    searchText,
                    searchButton,
                    searchButtonSvg,
                    inputIconContainer,
                    searchBarInputWrapper,
                    header,
                    navigationBar
                );
            } else {
                this.applyStylingAsBlack(
                    navigationBarHeadings,
                    navigationBarMoreButton,
                    navigationBarIcon,
                    searchText,
                    searchButton,
                    searchButtonSvg,
                    inputIconContainer,
                    searchBarInputWrapper,
                    header,
                    navigationBar
                );
            }
        }
    }

    /**
     * NBD2C-24
     * @author : Sachin V
     * This wire method is used to fetch the current page reference and if its home page then set the color "White" before CURRENT_SCROLL_LENGTH scroll lenght else "Black" for various components
     */
    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        this._pageReference = pageRef;
        if (this._pageReference) {
            this._applyDynamicStyling =
                this._pageReference && this._pageReference.attributes && this._pageReference.attributes.name && this._pageReference.attributes.name == HOME
                    ? true
                    : false;
        }
        this._applyDynamicStyling ? (this._siteLogo = this._siteLogoWhite) : (this._siteLogo = this._siteLogoBlack);
        this.applyCustomCSS();
    }

    /**
     * NBD2C-24
     * @author : Sachin V
     * This method is used to toggle the color of header section based on users current page and scroll level
     */
    connectedCallback() {
        window.addEventListener(SCROLLING_EVENT, (event) => {
            this.resizeAndScrollEventHandler(event);
        });

        window.addEventListener(RESIZE, (event) => {
            this.resizeAndScrollEventHandler(event);
        });

        //NBD2C-101
        window.addEventListener(PAGE_SHOW, (event) => {
            this._windowEvent = event;
            this.resizeAndScrollEventHandler(event);
        });
        this._isReady = true;

        // DVM21-31 : Hide certain UI aspects from NBD2C Store when opened in VTO/POS mode : Start
        let shopContext = JSON.parse(sessionStorage.getItem(SHOPCONTEXT));
        if (shopContext.comingFromVTOPOSUrl == true) {
            this._isReady = false;
            this._unwantedHeaderNavigationList = UNWANTED_HEADER_NAVIGATION.split(',');

            if (this._unwantedHeaderNavigationList) {
                this.setTimeOutToGetTotalCategoryCount();
                this.setTimeOutToGetUnwantedHeaderNavigation();
            }

            this._unwantedFooterNavigationList = UNWANTED_FOOTER_NAVIGATION.split(',').map((selector) => '.' + selector);
            if (this._unwantedFooterNavigationList) {
                this.fetchUnwantedFooterNavigationTitleList();
            }
        }
        // DVM21-31 : Hide certain UI aspects from NBD2C Store when opened in VTO/POS mode : End
    }

    /**
     * DVM21-31: Hide certain UI aspects from NBD2C Store when opened in VTO/POS mode
     * @author : Saurabh Kubde
     * @desc : This method is used to set timeout for getting total category count.
     */
    setTimeOutToGetTotalCategoryCount() {
        setTimeout(() => {
            let categoryCount = document.querySelectorAll(HEADER_NAVIGATION_BUTTON_LIST).length;
            console.log(categoryCount);
            if (!categoryCount) {
                this.setTimeOutToGetTotalCategoryCount();
            } else {
                this._numberOfCategories = categoryCount;
            }
        }, 500);
    }

    /**
     * DVM21-31: Hide certain UI aspects from NBD2C Store when opened in VTO/POS mode
     * @author : Saurabh Kubde
     * @desc : This method is used to fetch unwanted footer navigation title list and hide them.
     */
    fetchUnwantedFooterNavigationTitleList() {
        this._unwantedFooterNavigationList.forEach((selector) => {
            this.setTimeOutToGetUnwantedFooterNavigation(selector.trim());
        });
    }

    /**
     * DVM21-31: Hide certain UI aspects from NBD2C Store when opened in VTO/POS mode
     * @author : Saurabh Kubde
     * @desc : This method is used to set timeout for getting and hiding unwanted footer navigation elements.
     * @param {string} selector - CSS selector for the unwanted footer navigation element.
     */
    setTimeOutToGetUnwantedFooterNavigation(selector) {
        setTimeout(() => {
            let element = document.querySelector(selector);
            if (!element) {
                this.setTimeOutToGetUnwantedFooterNavigation(selector);
            } else {
                element.style.display = 'none';
            }
        }, 500);
    }

    /**
     * DVM21-31: Hide certain UI aspects from NBD2C Store when opened in VTO/POS mode
     * @author : Saurabh Kubde
     * @desc : This method is used to set timeout for getting unwanted header navigation.
     */
    setTimeOutToGetUnwantedHeaderNavigation() {
        setTimeout(() => {
            this.fetchUnwantedHeaderNavigationTitleList(document.querySelectorAll(HEADER_NAVIGATION_LIST).length);
        }, 500);
    }

    /**
     * DVM21-31: Hide certain UI aspects from NBD2C Store when opened in VTO/POS mode
     * @author : Saurabh Kubde
     * @desc : This method is used to set timeout for getting and hiding unwanted header navigation title based on index.
     * @param {number} index - Index of the header navigation element to process.
     */
    setTimeOutToGetUnwantedHeaderNavigationTitle(index) {
        setTimeout(() => {
            let element = document.querySelectorAll(HEADER_NAVIGATION_LIST)[index].querySelector(HEADER_NAV_A);
            let title = element.title;
            if (!title) {
                this.setTimeOutToGetUnwantedHeaderNavigationTitle(index);
            } else {
                if (this._unwantedHeaderNavigationList.includes(title)) {
                    element.style.display = 'none';
                }
            }
        }, 500);
    }

    /**
     * DVM21-31: Hide certain UI aspects from NBD2C Store when opened in VTO/POS mode
     * @author : Saurabh Kubde
     * @desc : This method is used to fetch unwanted header navigation titles list based on the number of categories.
     * @param {number} unwantedHeaderNavigationClassListLength - Length of the header navigation class list.
     */
    fetchUnwantedHeaderNavigationTitleList(unwantedHeaderNavigationClassListLength) {
        if (unwantedHeaderNavigationClassListLength > 0) {
            for (let index = this._numberOfCategories; index < unwantedHeaderNavigationClassListLength; index++) {
                this.setTimeOutToGetUnwantedHeaderNavigationTitle(index);
            }
        } else {
            this.setTimeOutToGetUnwantedHeaderNavigation();
        }
    }

    renderedCallback() {
        //NBD2C-101
        if (this._windowEvent) {
            this.resizeAndScrollEventHandler(this._windowEvent);
        }
    }

    resizeAndScrollEventHandler(event) {
        const searchText = document.querySelector(SEARCH_INPUT_BUTTON);
        const searchButton = document.querySelector(INPUT_SEARCH_BUTTON);
        const searchButtonSvg = document.querySelector(INPUT_SEARCH_BUTTON_SVG);
        const inputIconContainer = document.querySelector(INPUT_ICON_CONTAINER);
        const searchBarInputWrapper = document.querySelector(INPUT_WRAPPER_SVG);
        const navigationBarHeadings = document.querySelectorAll(NAV_A);
        const navigationBarMoreButton = document.querySelectorAll(HEADER_NAVIGATION_BUTTON);
        const navigationBarIcon = document.querySelector(HEADER_NAVIGATION_BUTTON_SVG);
        const header = document.querySelector(CUSTOM_HEADER_CSS);
        const navigationBar = document.querySelector(HEADER_NAVIGATION);

        //Check if current page is home page true -> home page
        if (this._applyDynamicStyling == true) {
            //If scroll is greater then CURRENT_SCROLL_LENGTH set the color of header contents to Black
            if (
                event &&
                event.target &&
                event.target.scrollingElement &&
                event.target.scrollingElement.scrollTop &&
                event.target.scrollingElement.scrollTop > CURRENT_SCROLL_LENGTH
            ) {
                this._siteLogo = this._siteLogoBlack;
                this.applyStylingAsBlack(
                    navigationBarHeadings,
                    navigationBarMoreButton,
                    navigationBarIcon,
                    searchText,
                    searchButton,
                    searchButtonSvg,
                    inputIconContainer,
                    searchBarInputWrapper,
                    header,
                    navigationBar
                );
            }

            //If scroll is less then CURRENT_SCROLL_LENGTH set the color of header contents to White
            else {
                this._siteLogo = this._siteLogoWhite;
                this.applyStylingAsWhite(
                    navigationBarHeadings,
                    navigationBarMoreButton,
                    navigationBarIcon,
                    searchText,
                    searchButton,
                    searchButtonSvg,
                    inputIconContainer,
                    searchBarInputWrapper,
                    header,
                    navigationBar
                );
            }
        } else {
            this._siteLogo = this._siteLogoBlack;
            this.applyStylingAsBlack(
                navigationBarHeadings,
                navigationBarMoreButton,
                navigationBarIcon,
                searchText,
                searchButton,
                searchButtonSvg,
                inputIconContainer,
                searchBarInputWrapper,
                header,
                navigationBar
            );
        }
    }

    /**
     * NBD2C-24
     * @author : Sachin V
     * This method is used to redirect users to home page on click of Neubau Store icon
     */
    handleClick(event) {
        event.preventDefault();
        this[NavigationMixin.Navigate]({
            type: TYPE,
            attributes: {
                name: HOME
            }
        });
    }
}
