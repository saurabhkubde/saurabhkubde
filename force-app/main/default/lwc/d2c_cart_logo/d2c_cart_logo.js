import { LightningElement, track, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';
import { CartSummaryAdapter, refreshCartSummary } from 'commerce/cartApi';
import CartLogos from '@salesforce/resourceUrl/D2C_NB_StoreStyling';
import { registerListener } from 'c/b2b_pubsub';

// NBD2C-24 - CONSTANTS Start
const ADD_TO_CART_EVENT = 'addedtocart';
const CART = 'cart';
const CART_CHANGED_EVENT = 'cartchanged';
const CART_PAGE = '/cart';
const CURRENT_SCROLL_LENGTH = 300;
const HOME = 'Home';
const MAX_CART_ITEMS = 99;
const PLUS_SIGN = '+';
const SCROLL = 'scroll';
const STANDARD_WEBPAGE = 'standard__webPage';
// NBD2C-24 - CONSTANTS End

export default class D2C_Cart_Logo extends NavigationMixin(LightningElement) {
    /**
     * This variable holds the value of label for cart icon.
     * NBD2C-24
     * @type {String}
     */
    iconAssistiveText = CART;

    /**
     * This variable indicates the count of cart-items present into cart
     * NBD2C-24
     * @type {Integer}
     */
    badgeItemsCount = 0;

    /**
     * This variable stores the page reference for Navigation purpose.
     * NBD2C-24
     * @type {pageRef}
     */
    pageRef;

    /**
     * This variable stores the location of cart page.
     * NBD2C-24
     * @type {String}
     */
    cartURL = basePath + CART_PAGE;

    /**
     * This variable stores the current cart logo location.
     * NBD2C-24
     * @type {String}
     */
    @track
    _cartLogo = '';

    /**
     * This variable is used to toggle the visibility of cart icon.
     * NBD2C-24
     * @type {Boolean}
     */
    @track
    _isReady = false;

    /**
     * This variable stores the location of cart icon white color.
     * NBD2C-24
     * @type {String}
     */
    @track
    _cartWhiteLogo = CartLogos + '/icons/Cart-white.svg';

    /**
     * This variable stores the location of cart icon black color.
     * NBD2C-24
     * @type {String}
     */
    @track
    _cartBlackLogo = CartLogos + '/icons/Cart-black.svg';

    /**
     * This variable indicates if current page is home page or not.
     * NBD2C-24
     * @type {Boolean}
     */
    @track
    _applyDynamicStyling = false;

    /**
     * This variable indicates maximum allowed digits after decimal point.
     * NBD2C-24
     * @type {Integer}
     */
    _maximumFractionDigits = 0;

    /**
     * NBD2C-24
     * @author : Sachin V
     * This wire method is used to fetch summary information of cart and cart-items on initial load
     */
    @wire(CartSummaryAdapter)
    cartSummaryHandler(response) {
        if (response) {
            if (response.data && response.data.totalProductCount) {
                this.badgeItemsCount = response.data.totalProductCount;
                if (this.badgeItemsCount > MAX_CART_ITEMS) {
                    this.badgeItemsCount = MAX_CART_ITEMS + PLUS_SIGN;
                }
            } else if (response.error) {
                this.badgeItemsCount = 0;
            }
        }
    }

    /**
     * NBD2C-24
     * @author : Sachin V
     * This wire method is used to fetch current page reference and check if current page is home and toggle the value of _applyDynamicStyling variable to true in case its home page.
     */
    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        this.pageRef = pageRef;
        registerListener(ADD_TO_CART_EVENT, this.doRefreshCartSummary, this);
        if (this.pageRef) {
            // Below logic identifies whether the current page is Home page and set the variable (_applyDynamicStyling) accordingly.
            this._applyDynamicStyling =
                this.pageRef && this.pageRef.attributes && this.pageRef.attributes.name && this.pageRef.attributes.name == HOME ? true : false;
        }
        this._applyDynamicStyling ? (this._cartLogo = this._cartWhiteLogo) : (this._cartLogo = this._cartBlackLogo);
    }

    /**
     * NBD2C-24
     * @author : Sachin V
     * This listner is used to toggle the current visible icon (white / black) based on scroll length.
     */
    connectedCallback() {
        window.addEventListener(SCROLL, (event) => {
            if (this._applyDynamicStyling == true) {
                if (event && event.target && event.target.scrollingElement) {
                    // If current scroll is  greater then 50 then logo is black else white
                    event.target.scrollingElement.scrollTop > CURRENT_SCROLL_LENGTH
                        ? (this._cartLogo = this._cartBlackLogo)
                        : (this._cartLogo = this._cartWhiteLogo);
                }
            } else {
                // Default logo black for other pages besides "Home"
                this._cartLogo = this._cartBlackLogo;
            }
        });
        this.template.addEventListener(CART_CHANGED_EVENT, this.doRefreshCartSummary);

        this._isReady = true;
    }

    /**
     * NBD2C-24
     * @author : Sachin V
     * Used to refresh the content of the cart on actions such as "Add to Cart"
     */
    doRefreshCartSummary(event) {
        refreshCartSummary().then(() => {});
    }

    /**
     * NBD2C-24
     * @author : Sachin V
     * This method is used to navigate user to Cart on click of cart icon
     */
    navigateToCart(event) {
        event.preventDefault();
        this.pageRef = {
            type: STANDARD_WEBPAGE,
            attributes: {
                url: this.cartURL
            }
        };
        if (this.pageRef) {
            this[NavigationMixin.Navigate](this.pageRef);
        }
    }
}
