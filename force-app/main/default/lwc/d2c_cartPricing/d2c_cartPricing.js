import { LightningElement, api, wire } from 'lwc';
import CART_LABELS from '@salesforce/label/c.D2C_NB_CartLabels';
import { navigate, NavigationContext } from 'lightning/navigation';
import CART_PRICE_CONFIRMATION_LABEL from '@salesforce/label/c.D2C_NB_Cart_Price_Confirmation_Text';

// NBD2C-75 - CONSTANTS - Start
const CURRENT_CHECKOUT = 'Current_Checkout'; // NBD2C-95
const HANDLE_LOADER_EVENT = 'handleloader';
const ONLINE_PURCHASE = 'onlinePurchase'; // NBD2C-95
const CLICK_AND_COLLECT = 'clickAndCollect'; // NBD2C-95

// NBD2C-75 - CONSTANTS - End

export default class D2C_cartPricing extends LightningElement {
    /**
     * Total Price of the current active Cart
     * @type {Number}
     * NBD2C-75
     */
    @api
    totalPrice;

    /**
     * Boolean to that shows if the order type is "Online Purchase"
     * @type {Boolean}
     * NBD2C-95
     */
    @api
    isOnlinePurchase;

    /**
     * Boolean to that shows if the order type is "Click And Collect"
     * @type {Boolean}
     * NBD2C-77
     */
    @api
    isClickAndCollect;

    /**
     * Currency code of the current active Country
     * @type {String}
     * NBD2C-75
     */
    @api
    currencyIsoCode;

    /**
     * Cart Total
     * @type {String}
     * NBD2C-75
     */
    _cartTotalLabel;

    /**
     * This label stores the text that is displayed above the 'Proceed to Checkout' button for Click and Collect
     * @type {String}
     * NBD2C-75
     */
    _clickAndCollectPriceConfirmationText;

    /**
     * Proceed To checkout
     * @type {String}
     * NBD2C-75
     */
    _checkoutButtonLabel;

    @wire(NavigationContext)
    navContext;

    connectedCallback() {
        this.createLabels();
    }

    renderedCallback() {
        this.handleLoader(false);
    }
    /**
     * Custom labels to be displayed on the UI
     * NBD2C-75
     */
    createLabels() {
        this._cartTotalLabel = CART_LABELS.split(',')[0];
        this._checkoutButtonLabel = CART_LABELS.split(',')[1];
        this._clickAndCollectPriceConfirmationText = CART_PRICE_CONFIRMATION_LABEL;
    }

    /**
     * NBD2C-75
     * Handler to show or hide the loader
     */
    handleLoader(showLoader) {
        this.dispatchEvent(
            new CustomEvent(HANDLE_LOADER_EVENT, {
                bubbles: true,
                composed: true,
                detail: {
                    showLoader: showLoader
                }
            })
        );
    }

    /**
     * NBD2C-72
     * Handler to navigate to proceed to checkout
     */
    handleProcceedToCheckout() {
        // NBD2C-95 : Passed cart type information to checkout page
        let cartType = this.isOnlinePurchase ? ONLINE_PURCHASE : this.isClickAndCollect ? CLICK_AND_COLLECT : '';
        navigate(this.navContext, {
            type: 'comm__namedPage',
            attributes: {
                name: CURRENT_CHECKOUT
            },
            state: {
                cartType: cartType
            }
        });
    }
}
