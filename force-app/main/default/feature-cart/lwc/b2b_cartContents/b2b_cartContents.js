import { api, wire, track, LightningElement } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi'; // BS-204
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi'; //BS-204
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/b2b_pubsub';
import { isCartClosed } from 'c/b2b_cartUtils';

// CONTROLLER METHODS
import getCartItemsWithProductDetails from '@salesforce/apex/B2B_CartController.getCartItemsWithProductDetails'; //BS-204
import updateCartItem from '@salesforce/apex/B2B_CartController.updateCartItem'; //BS-204
import deleteCartItem from '@salesforce/apex/B2B_CartController.deleteCartItem'; //BS-249
import deleteCart from '@salesforce/apex/B2B_CartController.deleteCart'; //BS-249
import createCart from '@salesforce/apex/B2B_CartController.createCart'; //BS-249

// STORE OBJECT AND FIELD INSTANCES
import PRODUCT_OBJECT from '@salesforce/schema/Product2'; //BS-204
import SHIPPING_FIELD from '@salesforce/schema/Product2.B2B_Shipping_Status__c'; //BS-204
import communityId from '@salesforce/community/Id';
import CODE_FIELD from '@salesforce/schema/Account.k_ARIS_Account_ID__c'; // BS-204

// GET LABEL
import CART_CONTENTS_LABELS from '@salesforce/label/c.B2B_CartContents_And_CartItems'; //BS-204
import WARNING_LABEL from '@salesforce/label/c.B2B_warning_label'; //BS-653
import REMOVE_LABEL from '@salesforce/label/c.B2B_CART_REMOVE_LABEL'; //Added as part of BS-653
import CONTINUE_SHOPPING_LABEL from '@salesforce/label/c.B2B_GEN_ContinueShopping'; //Added as part of BS-653
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //Added for BS-653
import CART_ITEMS_WARNING_LABEL from '@salesforce/label/c.B2B_Cart_Items_Warning_Message'; //BS-1554

// EVENT NAME CONSTANTS
const CART_CHANGED_EVT = 'cartchanged';
const CART_ITEMS_UPDATED_EVT = 'cartitemsupdated';
const fields = [CODE_FIELD]; //BS-204
const CART_ITEMS_REMOVED_EVT = 'cartitemsremoved'; //BS-249
const CART_CLEARED_EVT = 'cartcleared'; //BS-249
const LOADING_STATUS = 'loadingstatus'; //BS-205

//CONSTANTS
const CART_PAGE = 'Cart Page'; //BS-204
const CHECKOUT_PAGE = 'Checkout Page'; //BS-204

// LOCKED CART STATUSES
const LOCKED_CART_STATUSES = new Set(['Processing', 'Checkout']);
const NAVIGATION_DESTINATION = 'comm__namedPage';

/**
 * A sample cart contents component.
 * This component shows the contents of a buyer's cart on a cart detail page.
 * When deployed, it is available in the Builder under Custom Components as
 * 'B2B Sample Cart Contents Component'
 *
 * @fires CartContents#cartchanged
 * @fires CartContents#cartitemsupdated
 */

export default class CartContents extends NavigationMixin(LightningElement) {
    /**
     * An event fired when the cart changes.
     * This event is a short term resolution to update the cart badge based on updates to the cart.
     *
     * @event CartContents#cartchanged
     *
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * An event fired when the cart items change.
     * This event is a short term resolution to update any sibling component that may want to update their state based
     * on updates in the cart items.
     *
     * In future, if LMS channels are supported on communities, the LMS should be the preferred solution over pub-sub implementation of this example.
     * For more details, please see: https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_message_channel_considerations
     *
     * @event CartContents#cartitemsupdated
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * A cart line item.
     *
     * @typedef {Object} CartItem
     *
     * @property {number} quantity
     *   The quantity of the cart item.
     *
     * @property {string} originalPrice
     *   The original price of a cart item.
     *
     * @property {string} salesPrice
     *   The sales price of a cart item.
     *
     * @property {string} totalPrice
     *   The total sales price of a cart item, without tax (if any).
     *
     * @property {string} totalListPrice
     *   The total original (list) price of a cart item.
     */

    /**
     * Details for a product containing product information
     *
     * @property {string} productId
     *   The unique identifier of the item.
     *
     * @property {string} sku
     *  Product SKU number.
     *
     * @property {string} name
     *   The name of the item.
     *
     * @property {ThumbnailImage} thumbnailImage
     *   The quantity of the item.
     */

    /**
     * Image information for a product.
     *
     * @typedef {Object} ThumbnailImage
     *
     * @property {string} alternateText
     *  Alternate text for an image.
     *
     * @property {string} id
     *  The image's id.
     *
     * @property {string} title
     *   The title of the image.
     *
     * @property {string} url
     *   The url of the image.
     */
    /**
     * Representation of a sort option.
     *
     * @typedef {Object} SortOption
     *
     * @property {string} value
     * The value for the sort option.
     *
     * @property {string} label
     * The label for the sort option.
     */

    /**
     * The recordId provided by the cart detail flexipage.
     *
     * @type {string}
     */
    @api
    recordId;

    @api comId;

    /**
     * The effectiveAccountId provided by the cart detail flexipage.
     *
     * @type {string}
     */
    @api
    effectiveAccountId;

    /**
     * BS-204
     * Input parameter for lightning spinner
     *  @type {boolean}
     */
    @track
    _isLoading = false;

    /**
     * BS-496
     * The variable to determine whether the component is available
     *
     * @type {boolean}
     */
    _isComponentAvailable = false;

    /**
     * BS-496
     * Input parameter to stop lightning spinner
     * This boolean is used to display the  loader on page load and should not be used in any other way.
     *  @type {boolean}
     */
    _initialPageLoader;

    /**
     * BS-204
     * Fetching account data from apex via wire call
     *  @type {object}
     */
    @wire(getRecord, { recordId: '$effectiveAccountId', fields })
    account;

    /**
     * BS-204
     * Input parameter needed for delivery time
     *  @type {String}
     */
    shippingField;

    /**
     * BS-204
     * This method is use to get country code associated with the account
     *  @type {String}
     */
    get countryCode() {
        if (this.account.data) {
            return getFieldValue(this.account.data, CODE_FIELD).substring(0, 4);
        } else {
            return null;
        }
    }

    //Gets community Id
    get comId() {
        let comId;
        if (communityId == undefined) {
            comId = this.comId;
        }
        comId = communityId;
        return comId;
    }

    get refreshIcon() {
        return STORE_STYLING + '/icons/refresh_icon.svg';
    }

    get refreshWarningIcon() {
        return STORE_STYLING + '/icons/clear-cart-modal-icon.svg';
    }

    _deleteIcon = STORE_STYLING + '/icons/delete.svg';
    closeIcon = STORE_STYLING + '/icons/cross.svg'; //BS-1554

    _warningLabel = WARNING_LABEL;
    _showWarningMessage = false; //BS-1554

    _continueShoppingButtonLabel = CONTINUE_SHOPPING_LABEL;
    /**
     * Method is use to fetch object information
     *@param objectApiName : Api name of the object whose details to be fetched
     * @type {string}
     */
    @wire(getObjectInfo, { objectApiName: PRODUCT_OBJECT })
    objectInfo;

    /**
     * Method is use to fetch picklist values of related field of respective object
     *@param recordTypeId : Specifies the record type Id of respetive object
     *@param fieldApiName : Api name of the field whose values to be fetched
     * @type {string}
     */
    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: '$shippingField'
    })
    shippingPicklistValues;

    /**
     * BS-204
     * The pageSource provided from page details
     *
     * @type {string}
     */
    @api
    pageSource;

    /**
     * An object with the current PageReference.
     * This is needed for the pubsub library.
     *
     * @type {PageReference}
     */
    @wire(CurrentPageReference)
    pageRef;

    /**
     * BS-204
     * Input parameter for component to run in cart mode
     *
     * @type {boolean}
     */
    isCartPage = true;

    /**
     * BS-204
     * Input parameter for component to run in checkout mode
     * @type {boolean}
     */
    isCheckoutPage = false;

    /**
     * Total number of items in the cart
     * @private
     * @type {Number}
     */
    _cartItemCount = 0;

    /**
     * A list of cartItems.
     *
     * @type {CartItem[]}
     */
    cartItems;

    /**
     * Specifies the page token to be used to view a page of cart information.
     * If the pageParam is null, the first page is returned.
     * @type {null|string}
     */
    pageParam = null;

    /**
     * Sort order for items in a cart.
     * The default sortOrder is 'CreatedDateDesc'
     *    - CreatedDateAsc—Sorts by oldest creation date
     *    - CreatedDateDesc—Sorts by most recent creation date.
     *    - NameAsc—Sorts by name in ascending alphabetical order (A–Z).
     *    - NameDesc—Sorts by name in descending alphabetical order (Z–A).
     * @type {string}
     */
    sortParam = 'CreatedDateDesc';

    /**
     * Is the cart currently disabled.
     * This is useful to prevent any cart operation for certain cases -
     * For example when checkout is in progress.
     * @type {boolean}
     */
    isCartClosed = false;

    /**
     * The ISO 4217 currency code for the cart page
     *
     * @type {string}
     */
    currencyCode;

    /**
     * BS-249
     * Boolean to identify whether we want to open the popup
     * @type {boolean}
     */
    _isCartCloseClicked = false; //added

    /**
     * BS-249
     * Identify if the popup is for clear Cart
     * @type {boolean}
     */
    _clearCart = false;

    /**
     * BS-249
     * Identify if the popup is for clear Item
     * @type {boolean}
     */
    _clearItem = false;

    /**
     * BS-249
     * Id for the Cart Item
     * @type {string}
     */
    _cartItemId;
    _removeLabel = REMOVE_LABEL.split(',')[0];
    _additionalStyling = '';

    /**
     * Gets whether the cart item list is empty.
     *
     * @type {boolean}
     * @readonly
     */
    get isCartEmpty() {
        // If the items are an empty array (not undefined or null), we know we're empty.
        return Array.isArray(this.cartItems) && this.cartItems.length === 0;
    }

    /**
     * BS-204
     * Get The labels used in the template.
     *
     * @type {Object}
     */
    get label() {
        return {
            cartHeaderLabel: CART_CONTENTS_LABELS.split(',')[0],
            orderHeaderLabel: CART_CONTENTS_LABELS.split(',')[1],
            clearCartLabel: CART_CONTENTS_LABELS.split(',')[2],
            emptyCartLabelHeader: CART_CONTENTS_LABELS.split(',')[3],
            emptyCartLabelBody: CART_CONTENTS_LABELS.split(',')[4],
            clearCartPopupMessage: CART_CONTENTS_LABELS.split(',')[19],
            clearItemPopupMessage: CART_CONTENTS_LABELS.split(',')[20],
            clearCartPopupYes: CART_CONTENTS_LABELS.split(',')[21] + ', ' + CART_CONTENTS_LABELS.split(',')[23],
            clearItemPopupYes: CART_CONTENTS_LABELS.split(',')[21],
            clearCartPopupCancel: CART_CONTENTS_LABELS.split(',')[22],
            _cartQuantityWarningMessageLabel: CART_ITEMS_WARNING_LABEL
        };
    }

    /**
     * BS-204
     * Gets the cart header along with the current number of cart items
     * @type {string}
     * Example 'Cart (3)'
     */
    get cartHeaderLabel() {
        return `${this.label.cartHeaderLabel} (${this._cartItemCount})`;
    }

    /**
     * Gets the normalized effective account of the user.
     * @type {string}
     */
    get resolvedEffectiveAccountId() {
        const effectiveAccountId = this.effectiveAccountId || '';
        let resolved = null;
        if (effectiveAccountId.length > 0 && effectiveAccountId !== '000000000000000') {
            resolved = effectiveAccountId;
        }
        return resolved;
    }

    /**
     * This lifecycle hook fires when this component is inserted into the DOM.
     */
    connectedCallback() {
        this._isLoading = true;
        this.shippingField = SHIPPING_FIELD;
        this.setComponentMode();
        this.getCartItems();
    }

    /**
     * Event Handler for the 'singlecartitemdelete'event which is fired from cartItems component.
     * BS-249
     */
    handleCartItemDelete(cartItemId) {
        deleteCartItem({
            communityId,
            effectiveAccountId: this.effectiveAccountId,
            activeCartOrId: this.recordId,
            cartItemId
        })
            .then(() => {
                this.removeCartItem(cartItemId);
            })
            .then(() => {
                fireEvent(this.pageRef, CART_ITEMS_REMOVED_EVT);
            })
            .catch((exceptionInstance) => {
                // Handle cart item delete error properly
                // For this sample, we can just log the  error
                console.error(exceptionInstance);
                this._isCartCloseClicked = false;
                this._isLoading = false;
            });
    }

    /**
     * Given a cartItem id, remove it from the current list of cart items.
     *
     * @private
     * @param{string} cartItemId - The id of the cart we want to navigate to
     */
    removeCartItem(cartItemId) {
        this.handleCartUpdate(); // Moved the call up as Part Of BS-933
        this.getCartItems(); // Moved the call down as Part Of BS-933
    }

    /** BS-204
     * Sets the mode of component according to page source.
     * @type {Boolean}
     */
    setComponentMode() {
        if (this.pageSource === CART_PAGE) {
            this.isCheckoutPage = false;
            this.isCartPage = true;
        }

        if (this.pageSource === CHECKOUT_PAGE) {
            this.isCheckoutPage = true;
            this.isCartPage = false;
        }
    }

    //BS-1554
    handleCloseModal() {
        this._showWarningMessage = false;
    }

    /**
     * BS-204
     * Get a list of cart items from the server via imperative apex call
     */
    getCartItems() {
        // Call the 'getCartItemsWithProductDetails' apex method imperatively
        this._isLoading = true;
        getCartItemsWithProductDetails({
            communityId: this.comId,
            effectiveAccountId: this.resolvedEffectiveAccountId,
            activeCartOrId: this.recordId,
            pageParam: this.pageParam,
            pageSize: 100, // The maximum one can provide is 100 as per https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_ConnectAPI_CommerceCart_static_methods.htm#apex_ConnectAPI_CommerceCart_getCartItems_6
            sortParam: this.sortParam
        })
            .then((result) => {
                this.cartItems = result.cartItems;
                this._cartItemCount = Number(result.cartSummary.totalProductCount);
                if (this.cartItems.length === 0) {
                    this._additionalStyling = 'width:150% !important;';
                    fireEvent(this.pageRef, LOADING_STATUS, { loading: false });
                } else {
                    this._additionalStyling = '';
                }
                this.currencyCode = result.cartSummary.currencyIsoCode;
                this.isCartDisabled = LOCKED_CART_STATUSES.has(result.cartSummary.status);
                this._isLoading = false;
                this._isComponentAvailable = true;
                this._initialPageLoader = true;

                //BS-1554
                if (this._cartItemCount > 999 && this.pageSource == CART_PAGE) {
                    this._showWarningMessage = true;
                }
            })
            .catch((error) => {
                const errorMessage = error.body.message;
                this.cartItems = undefined;
                this.isCartClosed = isCartClosed(errorMessage);
                this._isComponentAvailable = true;
                this._isLoading = false;
                this._initialPageLoader = true;
            });
    }

    /**
     * Helper method to handle updates to cart contents by firing
     *  'cartchanged' - To update the cart badge
     *  'cartitemsupdated' - To notify any listeners for cart item updates (Eg. Cart Totals)
     *
     * As of the Winter 21 release, Lightning Message Service (LMS) is not available in B2B Commerce for Lightning.
     * These samples make use of the [pubsub module](https://github.com/developerforce/pubsub).
     * In the future, when LMS is supported in the B2B Commerce for Lightning, we will update these samples to make use of LMS.
     *
     * @fires CartContents#cartchanged
     * @fires CartContents#cartitemsupdated
     *
     * @private
     */
    handleCartUpdate() {
        // Update Cart Badge
        this.dispatchEvent(
            new CustomEvent(CART_CHANGED_EVT, {
                bubbles: true,
                composed: true
            })
        );

        // Notify any other listeners that the cart items have updated
        fireEvent(this.pageRef, CART_ITEMS_UPDATED_EVT);
    }

    /**
     * Handler for the 'quantitychanged' event fired from cartItems component.
     * This method will call apex to update Cart Item with latest quantity
     * @param {Event} evt
     *  A 'quanitychanged' event fire from the Cart Items component
     *
     * @private
     */
    handleQuantityChanged(evt) {
        const { cartItemId, quantity } = evt.detail;
        updateCartItem({
            communityId,
            effectiveAccountId: this.effectiveAccountId,
            activeCartOrId: this.recordId,
            cartItemId,
            cartItem: { quantity }
        })
            .then((cartItem) => {
                this.updateCartItemInformation(cartItem);
                this._isLoading = false;
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }
    /**
     * Event Handler for the event fired from click of 'Clear Cart' button
     * BS-249
     */
    handleClearCartButtonClicked() {
        // Step 1: Delete the current cart
        deleteCart({
            communityId,
            effectiveAccountId: this.effectiveAccountId,
            activeCartOrId: this.recordId
        })
            .then(() => {
                // Step 2: If the delete operation was successful,
                // set cartItems to undefined and update the cart header
                this.cartItems = undefined;
                this._cartItemCount = 0;
            })
            .then(() => {
                // Step 3: Create a new cart
                return createCart({
                    communityId,
                    effectiveAccountId: this.effectiveAccountId
                });
            })
            .then((result) => {
                // Step 4: If create cart was successful, navigate to the new cart
                this.navigateToCart(result.cartId);
                this.handleCartUpdate();
                this._isLoading = false;
            })
            .then(() => {
                fireEvent(this.pageRef, CART_CLEARED_EVT);
            })
            .catch((exceptionInstance) => {
                // Handle quantity any errors properly
                // For this sample, we can just log the error
                console.error(exceptionInstance);
                this._isCartCloseClicked = false;
                this._isLoading = false;
            });
    }

    /**
     * Given a cart id, navigate to the record page
     * BS-249
     * @param{string} cartId - The id of the cart we want to navigate to
     */
    navigateToCart(cartId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: cartId,
                objectApiName: 'WebCart',
                actionName: 'view'
            }
        });
    }

    /**
     * Pass the updated CartItem information to B2B_cartItems component
     * BS-204
     * @private
     * @param{CartItem} cartItem - An updated cart item
     */
    updateCartItemInformation(cartItem) {
        let cartItemUpdatedDetails = [];
        cartItemUpdatedDetails.cartItemId = cartItem.cartItemId;
        cartItemUpdatedDetails.quantity = cartItem.quantity;
        cartItemUpdatedDetails.totalListPrice = cartItem.totalListPrice;
        cartItemUpdatedDetails.totalPrice = cartItem.totalPrice;
        this.template.querySelector('c-b2b_cart-items').updateCartItem(cartItemUpdatedDetails);
        this.handleCartUpdate();
    }

    /**
     * BS-204
     * Handler for the 'loadevent' event fired from B2B_cartItems component.
     * @param {Event} evt
     *  A 'loadevent' event fired from the B2B_cartItems component
     */
    handleLoadEvent(evt) {
        this._isLoading = evt.detail.isLoading;
    }

    /**
     * BS-204
     * Handler for the 'updatecartheadercount' event fired from cartItems component.
     * @param {Event} event
     *  A 'updatecartheadercount' event fire from the Cart Items component
     */
    handleUpdateCartHeaderCount(event) {
        this._cartItemCount = event.detail.totalCount;
        //BS-1554
        if (this._cartItemCount > 999 && this.pageSource == CART_PAGE) {
            this._showWarningMessage = true;
        } else {
            this._showWarningMessage = false;
        }
    }

    /**
     * BS-249
     * Handler to delete Cart Item
     */
    closePopupAndClearCartItem() {
        this._isCartCloseClicked = false;
        this._isLoading = true;
        this.handleCartItemDelete(this._cartItemId);
    }

    /**
     * BS-249
     * Handler to show popup on CartItem
     * @param {Event} event
     */
    showPopupForCartItem(event) {
        this._cartItemId = event.detail.cartItemId;
        this._clearCart = false;
        this._clearItem = true;
        this._isCartCloseClicked = true;
    }
    /**
     * BS-249
     * Handler to show popup on Clear Cart
     */
    showPopupForClearCart() {
        this._clearItem = false;
        this._clearCart = true;
        this._isCartCloseClicked = true;
    }
    /**
     * BS-249
     * Handler to close popup
     */
    closePopup() {
        this._isCartCloseClicked = false;
    }

    /**
     * BS-249
     * Handler to Delete/Clear Cart
     */
    closePopupAndClearCart() {
        this._isCartCloseClicked = false;
        this._isLoading = true;
        this.handleClearCartButtonClicked();
    }

    handleDialogClose() {
        this._isCartCloseClicked = false;
    }

    handleRedirectToHome() {
        this[NavigationMixin.GenerateUrl]({
            type: NAVIGATION_DESTINATION,
            attributes: {
                name: 'Home'
            }
        }).then((url) => {
            window.open(url, '_self');
        });
    }
}
