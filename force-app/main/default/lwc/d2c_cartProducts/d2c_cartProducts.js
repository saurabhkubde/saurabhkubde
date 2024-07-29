import { LightningElement, api, wire } from 'lwc';
import { updateItemInCart, deleteItemFromCart } from 'commerce/cartApi'; //NBD2C-78
import CartLogo from '@salesforce/resourceUrl/D2C_StoreStyling';
import { fireEvent } from 'c/b2b_pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import CART_LABELS from '@salesforce/label/c.D2C_NB_CartLabels';
import ICONS from '@salesforce/resourceUrl/D2C_NB_StoreStyling'; //NBD2C-78 : Updated the reference of static resource to D2C_NB_StoreStyling

const QUANTITY_CHANGED_EVT = 'quantitychanged';
const HANDLE_LOADER_EVENT = 'handleloader';
const ADD_TO_CART_EVENT = 'addedtocart';
const PLUS = '+';
const ROUND_BRACKET_LEFT = ' (';
const ROUND_BRACKET_RIGHT = ')';
const MOBILE_DEVICE_DIMENSIONS = '(max-width: 767px)';
const CART_ITEM_REMOVAL_EVENT = 'cartitemremoval'; //NBD2C-78

export default class D2c_cartProducts extends LightningElement {
    /**
     * Data of all the Products added to Cart
     * NBD2C-75
     * @type {Array}
     */
    @api
    products = [];

    /**
     * Boolean that determine if the Order type is Online Purchase
     * NBD2C-75
     * @type {Boolean}
     */
    @api
    isOnlinePurchase;

    /**
     * Boolean that determine if the Order type is Click And Collect
     * NBD2C-77
     * @type {Boolean}
     */
    @api
    isClickAndCollect;

    /**
     * Total number of products present in cart
     * NBD2C-75
     * @type {Number}
     */
    @api
    totalProductCount;

    /**
     * This variable stores the location of cart icon black color.
     * NBD2C-75
     * @type {String}
     */
    _cartHeading;

    /**
     * This variable stores the location of cart icon black color.
     * NBD2C-75
     * @type {String}
     */
    _cartBlackLogo = CartLogo + '/icons/Cart-black.svg';

    /**
     * This variable indicates whether the current device is desktop
     * NBD2C-75
     * @type {Boolean}
     */
    _isMobileDevice = false;

    /**
     * Current Page referance
     * NBD2C-75
     * @type {Boolean}
     */
    _pageRef;

    /**
     * Wishlist Icon Color Black
     * @type {String}
     * NBD2C-75
     */
    _wishlistIconBlack = ICONS + '/icons/Wishlist-black.svg';

    /**
     * Delete icon to remove product
     * @type {String}
     * NBD2C-75
     */
    _deleteIcon = ICONS + '/icons/delete-icon.svg';

    /**
     * Boolean to show max items modal
     * @type {String}
     * NBD2C-72
     */
    _showModal = false;

    _frameColorLabel; // NBD2C-75
    _sizeLabel; // NBD2C-75
    _sizeLabel; // NBD2C-75
    _wishListLabel; // NBD2C-75
    _removeLabel; // NBD2C-75
    _closeButtonLabel; // NBD2C-72
    _continueButtonLabel; // NBD2C-72
    _maxproductsLabel; // NBD2C-72
    _SRPLabel; //NBD2C-77

    /**
     * An object with the current PageReference.
     * This is needed for the pubsub library.
     * NBD2C-75
     * @type {PageReference}
     */
    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        this._pageRef = pageRef;
    }

    /**
     * An object with the current PageReference.
     * NBD2C-75
     * @type {PageReference}
     */
    get cartHeading() {
        return this._cartHeading + ROUND_BRACKET_LEFT + Math.round(this.totalProductCount) + ROUND_BRACKET_RIGHT;
    }

    connectedCallback() {
        this.createLabels();
        this.detectDeviceType();
    }

    /**
     * Custom labels to be displayed on the UI
     * NBD2C-75
     */
    createLabels() {
        this._cartHeading = this.isOnlinePurchase ? CART_LABELS.split(',')[2] : CART_LABELS.split(',')[3];
        this._cartHeading = this.isClickAndCollect ? CART_LABELS.split(',')[3] : CART_LABELS.split(',')[2]; //NBD2C-77
        this._frameColorLabel = CART_LABELS.split(',')[4];
        this._sizeLabel = CART_LABELS.split(',')[5];
        this._quantityLabel = CART_LABELS.split(',')[6];
        this._wishListLabel = CART_LABELS.split(',')[7];
        this._removeLabel = CART_LABELS.split(',')[8];
        this._closeButtonLabel = CART_LABELS.split(',')[9];
        this._continueButtonLabel = CART_LABELS.split(',')[10];
        this._maxproductsLabel = CART_LABELS.split(',')[11];
        this._SRPLabel = CART_LABELS.split(',')[16];
    }

    /**
     * NBD2C-75
     * This method detects the device type and setup the component accordingly
     */
    detectDeviceType = () => {
        const isMobile = window.matchMedia(MOBILE_DEVICE_DIMENSIONS).matches;
        this._isMobileDevice = isMobile ? true : false;
    };

    /**
     * NBD2C-75
     * Change the quantity of the Cart Items
     */
    manipulateQuantity(event) {
        let cartQuantity = event.target.dataset.quantity;
        const productId = event.target.dataset.productId;

        if (this.totalProductCount >= 3 && event.target.value === PLUS) {
            this._showModal = true;
        } else {
            this.handleLoader(true);
            let quantity = 0;
            if (event.target.value === PLUS) {
                cartQuantity++;
                quantity = 1;
            } else {
                cartQuantity--;
                quantity = -1;
            }
            let productObj = this.products.find((obj) => obj.productId === productId);
            let itemId = productObj.Id;

            updateItemInCart(itemId, cartQuantity)
                .then((result) => {
                    let totalPrice = result?.totalPrice ?? null;
                    let cartItemId = result?.cartItemId ?? null;
                    fireEvent(this._pageRef, ADD_TO_CART_EVENT);
                    this.dispatchEvent(
                        new CustomEvent(QUANTITY_CHANGED_EVT, {
                            detail: {
                                itemId: cartItemId,
                                totalPrice: totalPrice,
                                quantity: quantity
                            }
                        })
                    );
                })
                .catch((error) => {
                    console.error(error);
                });
        }
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
     * Handler to show or hide modal
     */
    handleModalCloseAction() {
        this._showModal = false;
    }

    /**
     * NBD2C-78
     * This method gets invoked onclick of remove button on UI and performs cart item removal operation
     */
    handleRemoveCartItem(event) {
        this.handleLoader(true);
        let cartId = event && event.target && event.target.dataset && event.target.dataset.cartId ? event.target.dataset.cartId : null;
        if (cartId) {
            deleteItemFromCart(cartId)
                .then((result) => {
                    this.dispatchEvent(new CustomEvent(CART_ITEM_REMOVAL_EVENT, { detail: {} }));
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            this.handleLoader(false);
        }
    }
}
