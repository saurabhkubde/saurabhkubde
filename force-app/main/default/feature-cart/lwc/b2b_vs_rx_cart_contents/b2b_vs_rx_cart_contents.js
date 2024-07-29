import { api, wire, track, LightningElement } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/b2b_pubsub';
import { isCartClosed } from 'c/b2b_cartUtils';

// CONTROLLER METHODS
import getCartItemsWithProductDetails from '@salesforce/apex/B2B_CartController.getCartItemsWithProductDetails';
import getCartItemDetails from '@salesforce/apex/B2B_CartController.getCartItemDetails';
import updateCartItem from '@salesforce/apex/B2B_CartController.updateCartItem';
import deleteCartItem from '@salesforce/apex/B2B_CartController.deleteCartItem';
import saveToMyWishList from '@salesforce/apex/B2B_CartController.saveToMyWishList'; //BS-1036
import deleteSilhouetteStoreCart from '@salesforce/apex/B2B_CartController.deleteSilhouetteStoreCart';
import createCart from '@salesforce/apex/B2B_CartController.createCart';
import getCartItemType from '@salesforce/apex/B2B_CartController.getCartItemType';
import checkVSRXEligibilityFromAccount from '@salesforce/apex/B2B_CartController.checkVSRXEligibilityFromAccount'; //BS-2300
import getGlassDetails from '@salesforce/apex/B2B_CartController.getGlassDetails'; //BS-1127
import getTotalPriceForCartItem from '@salesforce/apex/B2B_CartController.getTotalPriceForCartItem'; //BS-1036
import getBrandWiseCCSFlag from '@salesforce/apex/B2B_CartController.getBrandWiseCCSFlag'; //BS-1714
import LANG from '@salesforce/i18n/lang';
import getFrameProductValues from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFrameProductValues'; //BS-1958
import getFrameImage from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFrameImage'; //BS-1958
import { getVSRXCartItemConfigurationData } from './b2b_vs_rx_cart_contents_utils'; //BS-1958

// STORE OBJECT AND FIELD INSTANCES
import PRODUCT_OBJECT from '@salesforce/schema/Product2';
import SHIPPING_FIELD from '@salesforce/schema/Product2.B2B_Shipping_Status__c';
import communityId from '@salesforce/community/Id';
import CODE_FIELD from '@salesforce/schema/Account.k_ARIS_Account_ID__c';
import HIDE_PURCHASE_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Purchase_Price__c'; //BS-2273

// GET LABEL
import CART_CONTENTS_LABELS from '@salesforce/label/c.B2B_CartContents_And_CartItems';
import WARNING_LABEL from '@salesforce/label/c.B2B_warning_label';
import REMOVE_LABEL from '@salesforce/label/c.B2B_CART_REMOVE_LABEL';
import CONTINUE_SHOPPING_LABEL from '@salesforce/label/c.B2B_GEN_ContinueShopping';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';
import B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS from '@salesforce/label/c.B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS';
import B2B_VS_RX_CART_ITEM_DELETE_MESSAGE from '@salesforce/label/c.B2B_VS_RX_CART_ITEM_DELETE_MESSAGE'; //BS-1036
import B2B_VS_RX_DELETE_LABEL from '@salesforce/label/c.B2B_VS_RX_DELETE_LABEL'; //BS-1036
import B2B_VS_RX_SAVE_TO_MY_WISHLIST_LABEL from '@salesforce/label/c.B2B_VS_RX_SAVE_TO_MY_WISHLIST_LABEL'; //BS-1036
import CLEAR_CART_WARNING from '@salesforce/label/c.B2B_Clear_Cart_Warning'; //BS-1339
import CLEAR_CART_WARNING_HEADER from '@salesforce/label/c.B2B_Clear_Cart_Warning_Header';
import CART_ITEMS_WARNING_LABEL from '@salesforce/label/c.B2B_Cart_Items_Warning_Message'; //BS-1554
import B2B_VS_RX_VALIDATION_LABELS from '@salesforce/label/c.B2B_VS_RX_VALIDATION_LABELS'; //BS-1958

// EVENT NAME CONSTANTS
const CART_CHANGED_EVT = 'cartchanged';
const CART_ITEMS_UPDATED_EVT = 'cartitemsupdated';
const CART_ITEMS_REMOVED_EVT = 'cartitemsremoved';
const CART_CLEARED_EVT = 'cartcleared';
const LOADING_STATUS = 'loadingstatus';
const HIDE_FEATURE_SPARE_PARTS = 'hidefeaturespareparts';

//CONSTANTS
const fields = [CODE_FIELD, HIDE_PURCHASE_PRICE_FIELD];
const CART_PAGE = 'Cart Page';
const CHECKOUT_PAGE = 'Checkout Page';
const SILHOUETTE_EVIL_EYE = 'Silhouette / evil eye';
const ACTIVE_TAB = 'active-tab';
const INACTIVE_TAB = 'in-active-tab';
const ACTIVE_COUNT = 'active-count';
const INACTIVE_COUNT = 'in-active-count';
const DE_LANG = 'de'; //BS-976

// LOCKED CART STATUSES
const LOCKED_CART_STATUSES = new Set(['Processing', 'Checkout']);
const NAVIGATION_DESTINATION = 'comm__namedPage';
const CLIP_IN_COLOR = 'Transparent';
const CLIP_IN_LABEL = 'Clip-in';
const ADAPTER = 'Adapter'; //BS-1269
const DIRECT_GLAZING = 'Direct Glazing'; //BS-1269

const DELETE_ADITIONAL_PRICE = 'deleteadditionalprice'; //BS-1036
const PRESCRIPTION_VALUE_FIELD_TO_APPEND_DECIMAL = [
    'B2B_Sphere_Right__c',
    'B2B_Sphere_Left__c',
    'B2B_Cylinder_Right__c',
    'B2B_Cylinder_Left__c',
    'B2B_Addition_Right__c',
    'B2B_Addition_Left__c',
    'B2B_Prism_1_Right__c',
    'B2B_Prism2_Right__c',
    'B2B_Prism2_Left__c',
    'B2B_Prism_1_Left__c',
    'B2B_PB1_Right__c',
    'B2B_PB1_Left__c',
    'B2B_Prism_base2_Right__c',
    'B2B_Prism_base2_Left__c'
];

const TWO_ZERO_WITH_DOT = '.00';
const TWO_ZERO = '00';
const ONE_ZERO = '0';
const UPDATE_CART_TOTAL_PRICE = 'updatetotalcartprice'; //BS-1409
const RX_GLAZING = 'RX Glazing'; //BS-1471

const PAGE_SOURCE_VS = 'VS'; //BS-1667
const PAGE_SOURCE_RX = 'RX'; //BS-1667
const CCS_EVENT = 'ccsevent'; //BS-1714
/* Start: BS-1958 */
const VS_BRAND = 'Vision Sensation';
const RX_BRAND = 'RX Glazing';
const STANDARD_NAMED_PAGE = 'standard__namedPage';
const RX_GLAZING_SITE_PAGE = 'RX__c';
const VISION_SENSATION_SITE_PAGE = 'VS__c';
const MY_VS_RX_PAGE_SOURCE_IDENTIFIER = 'fromMyVSRX';
/* End: BS-1958 */

/**
 * A sample cart contents component.
 * This component shows the contents of a buyer's cart on a cart detail page.
 * When deployed, it is available in the Builder under Custom Components as
 * 'B2B Sample Cart Contents Component'
 *
 * @fires CartContents#cartchanged
 * @fires CartContents#cartitemsupdated
 */
export default class B2b_vs_rx_cart_contents extends NavigationMixin(LightningElement) {
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
     * Input parameter for lightning spinner
     *  @type {boolean}
     */
    @track
    _isLoading = false;

    /**
     * The variable to determine whether the component is available
     *
     * @type {boolean}
     */
    _isComponentAvailable = false;

    /**
     * Input parameter to stop lightning spinner
     * This boolean is used to display the  loader on page load and should not be used in any other way.
     *  @type {boolean}
     */
    _initialPageLoader = false; //BS-1409

    _urlPath; // BS-1667
    _pageSourceForVSRX; // BS-1667

    @track
    _isSHEEitem = true;

    @track
    _isVSitem = false;

    @track
    _isEERXitem = false;

    @track
    _isShEeActive = ACTIVE_TAB;

    @track
    _isVsActive = INACTIVE_TAB;

    @track
    _isEErxActive = INACTIVE_TAB;

    @track
    _isShEeActiveCount = ACTIVE_COUNT;

    @track
    _isVsActiveCount = INACTIVE_COUNT;

    @track
    _isEErxActiveCount = INACTIVE_COUNT;

    @track
    cartItemIdListVSRX = []; //BS-1150

    @track
    cartItemIDetailsList = []; //BS-1150
    //BS-1090 start
    showEntitlementErrorPopup = false;
    entitlementErrorCSS = false;
    @track
    unentitledproductsId = [];
    isUnEntitled = false;
    //BS-1090 end

    /**
     * Fetching account data from apex via wire call
     *  @type {object}
     */
    @wire(getRecord, { recordId: '$effectiveAccountId', fields })
    account;

    /**
     * get HIDE_PURCHASE_PRICE_FIELD value on account
     * BS-2273
     */
    get hidePurchasePriceField() {
        if (this.account && this.account.data) {
            return getFieldValue(this.account.data, HIDE_PURCHASE_PRICE_FIELD);
        }
        return true;
    }

    /**
     * Input parameter needed for delivery time
     *  @type {String}
     */
    shippingField;

    /**
     * BS-1036
     * This map holds the total price of the custom cart items
     * related to the standard cart item
     */
    cartItemVsTotalPriceMap = new Map();
    /**
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
     * Input parameter for component to run in cart mode
     *
     * @type {boolean}
     */
    isCartPage = true;

    /**
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

    @track
    _SHEECartItems; //BS-1409

    _cartItemsLoaded = false; //BS-1409

    @track
    _EERXCartItems = [];

    @track
    _SHVSCartItems = []; //BS-1150

    @track
    _itemIdVsItemType = new Map();

    @track
    _EeRxProductCount = 0;

    @track
    _ShVsProductCount = 0; //BS-1150

    @track
    _ShEeProductCount = 0;

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
     * Boolean to identify whether we want to open the popup
     * @type {boolean}
     */
    _isCartCloseClicked = false; //added
    _isRxCartCloseClicked = false;

    /**
     * Identify if the popup is for clear Cart
     * @type {boolean}
     */
    _clearCart = false;

    /**
     * Identify if the popup is for clear Item
     * @type {boolean}
     */
    _clearItem = false;

    /**
     * Id for the Cart Item
     * @type {string}
     */
    _cartItemId;
    _removeLabel = REMOVE_LABEL.split(',')[0];
    _additionalStyling = '';
    isEligibleForVS = false;
    isEligibleForRX = false;
    _showWarningMessage = false; //BS-1554

    _silhouetteCCSFlag = false;
    _evileyeCCSFlag = false;
    /* Start: BS-1958 */
    _editIcon = STORE_STYLING + '/icons/pencil.svg';
    _editCartItem = false;
    _applicableBrand = VS_BRAND;
    _isEditAction = false;
    @track
    _lensConfiguratorCollectionData = {};
    @track
    _frameInformationCollection = {};
    /* End: BS-1958 */

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
            labelForSHEE: SILHOUETTE_EVIL_EYE,
            labelForVS: B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[1],
            labelForRX: B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[2],
            vsRxCartItemDeleteMessage: B2B_VS_RX_CART_ITEM_DELETE_MESSAGE,
            saveToMyWishlistLabel: B2B_VS_RX_SAVE_TO_MY_WISHLIST_LABEL,
            deleteLabel: B2B_VS_RX_DELETE_LABEL,
            important: CLEAR_CART_WARNING_HEADER,
            clearCartWarningMessage: CLEAR_CART_WARNING,
            _cartQuantityWarningMessageLabel: CART_ITEMS_WARNING_LABEL, //BS-1554
            editIconLabel: B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[5], //BS-1958
            warningMessageForEdit: B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[9] + ', ' + B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[10] //BS-1958
        };
    }

    /**
     * Gets the cart header along with the current number of cart items
     * @type {string}
     * Example 'Cart (3)'
     */
    get cartHeaderLabel() {
        return `${this.label.cartHeaderLabel} (${this._cartItemCount})`;
    }

    //Added as a part of BS-1554
    handleCloseModal() {
        this._showWarningMessage = false;
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

    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        // Added as a part of BS-1667
        this._urlPath = pageRef;

        if (this._urlPath != null && this._urlPath != undefined && this._urlPath.state != null && this._urlPath.state != undefined && this._urlPath.state) {
            this._pageSourceForVSRX = this._urlPath.state.pageSource;
        }
    }

    /**
     * This lifecycle hook fires when this component is inserted into the DOM.
     */
    connectedCallback() {
        this.fetchSilhouetteEvilEyeLockFlag();
        this._isLoading = true;
        this.shippingField = SHIPPING_FIELD;
        this.setComponentMode();
        this.getCartItems();
        this.checkEligibilityForVisionSensationRXGlazing();

        //Added as a part of BS-1667 - Start
        if (this._pageSourceForVSRX != null && this._pageSourceForVSRX != undefined && this._pageSourceForVSRX == PAGE_SOURCE_VS) {
            this._isSHEEitem = false;
            this._isVSitem = true;
            this._isEERXitem = false;
            this._isShEeActive = INACTIVE_TAB;
            this._isVsActive = ACTIVE_TAB;
            this._isEErxActive = INACTIVE_TAB;
            this._isShEeActiveCount = INACTIVE_COUNT;
            this._isVsActiveCount = ACTIVE_COUNT;
            this._isEErxActiveCount = INACTIVE_COUNT;
            this._applicableBrand = VS_BRAND; //BS-1958
            fireEvent(this.pageRef, HIDE_FEATURE_SPARE_PARTS, true);
            this._isLoading = false;
        } else if (this._pageSourceForVSRX != null && this._pageSourceForVSRX != undefined && this._pageSourceForVSRX == PAGE_SOURCE_RX) {
            this._isSHEEitem = false;
            this._isVSitem = false;
            this._isEERXitem = true;
            this._isShEeActive = INACTIVE_TAB;
            this._isVsActive = INACTIVE_TAB;
            this._isEErxActive = ACTIVE_TAB;
            this._isShEeActiveCount = INACTIVE_COUNT;
            this._isVsActiveCount = INACTIVE_COUNT;
            this._isEErxActiveCount = ACTIVE_COUNT;
            this.showEntitlementErrorPopup = false;
            this.entitlementErrorCSS = false;
            this._applicableBrand = RX_BRAND; //BS-1958
            fireEvent(this.pageRef, HIDE_FEATURE_SPARE_PARTS, true);
            this._isLoading = false;
            this._initialPageLoader = false;
        } else {
            this._isSHEEitem = true;
            this._isVSitem = false;
            this._isEERXitem = false;
            this._isShEeActive = ACTIVE_TAB;
            this._isVsActive = INACTIVE_TAB;
            this._isEErxActive = INACTIVE_TAB;
            this._isShEeActiveCount = ACTIVE_COUNT;
            this._isVsActiveCount = INACTIVE_COUNT;
            this._isEErxActiveCount = INACTIVE_COUNT;
            fireEvent(this.pageRef, HIDE_FEATURE_SPARE_PARTS, false);
            this._isLoading = false;
        }
        //Added changes of BS-1667 - End
    }

    /**
     * Event Handler for the 'singlecartitemdelete'event which is fired from cartItems component.
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
                if (this.cartItemVsTotalPriceMap != null && this.cartItemVsTotalPriceMap.has(cartItemId)) {
                    fireEvent(this.pageRef, DELETE_ADITIONAL_PRICE, this.cartItemVsTotalPriceMap.get(cartItemId));
                }
                this.fetchSilhouetteEvilEyeLockFlag();
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
        this.handleCartUpdate();
        this.getCartItems();
    }

    /**
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

    /**
     * Get a list of cart items from the server via imperative apex call
     */
    async getCartItems() {
        //this._cartItemsLoaded = false;
        this._SHEECartItems = [];
        this._cartItemsLoaded = false;
        // Call the 'getCartItemsWithProductDetails' apex method imperatively
        this._isLoading = true;
        await getCartItemsWithProductDetails({
            communityId: this.comId,
            effectiveAccountId: this.resolvedEffectiveAccountId,
            activeCartOrId: this.recordId,
            pageParam: this.pageParam,
            pageSize: 100, // The maximum one can provide is 100 as per https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_ConnectAPI_CommerceCart_static_methods.htm#apex_ConnectAPI_CommerceCart_getCartItems_6
            sortParam: this.sortParam
        })
            .then((result) => {
                this.cartItems = result.cartItems;
                let cartItemIdList = [];
                this.cartItems.forEach((item) => {
                    cartItemIdList.push(item.cartItem.cartItemId);
                });
                this._cartItemCount = Number(result.cartSummary.totalProductCount);

                if (this.cartItems.length === 0) {
                    this._additionalStyling = 'width:100% !important;';
                    this._initialPageLoader = true;
                    fireEvent(this.pageRef, LOADING_STATUS, false);
                } else {
                    fireEvent(this.pageRef, LOADING_STATUS, true);
                    this._additionalStyling = '';
                }

                this.currencyCode = result.cartSummary.currencyIsoCode;
                this.isCartDisabled = LOCKED_CART_STATUSES.has(result.cartSummary.status);
                this._isLoading = false;
                this._isComponentAvailable = true;
                if (cartItemIdList.length > 0) {
                    this.getTypeOfCartItem(cartItemIdList);
                }
            })
            .catch((error) => {
                if (error.body !== undefined && error.body.message !== undefined) {
                    const errorMessage = error.body.message;
                    this.cartItems = undefined;
                    this.isCartClosed = isCartClosed(errorMessage);
                }
                this._isComponentAvailable = true;
                this._isLoading = false;
            });
        //BS-1554
        if (this._cartItemCount > 999 && this.pageSource == CART_PAGE) {
            this._showWarningMessage = true;
        } else {
            this._showWarningMessage = false;
        }
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
                this.cartItems.forEach((item) => {
                    if (item.cartItem.cartItemId == cartItemId) {
                        item.cartItem.quantity = Number(quantity);
                    }
                });
                this._ShEeProductCount = 0;
                this._cartItemCount = 0;
                this.cartItems.forEach((item) => {
                    if (this._itemIdVsItemType.get(item.cartItem.cartItemId) == 'SH/EE') {
                        this._ShEeProductCount = this._ShEeProductCount + Number(item.cartItem.quantity);
                    }
                    this._cartItemCount = this._cartItemCount + Number(item.cartItem.quantity);
                });
                //BS-1554
                if (this._cartItemCount > 999 && this.pageSource == CART_PAGE) {
                    this._showWarningMessage = true;
                } else {
                    this._showWarningMessage = false;
                }
                this._isLoading = false;
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }
    /**
     * Event Handler for the event fired from click of 'Clear Cart' button
     */
    handleClearCartButtonClicked() {
        // Step 1: Delete the current cart
        deleteSilhouetteStoreCart({
            communityId,
            effectiveAccountId: this.effectiveAccountId,
            activeCartOrId: this.recordId,
            pageParam: this.pageParam,
            pageSize: 100, // The maximum one can provide is 100 as per https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_ConnectAPI_CommerceCart_static_methods.htm#apex_ConnectAPI_CommerceCart_getCartItems_6
            sortParam: this.sortParam
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
     * @private
     * @param{CartItem} cartItem - An updated cart item
     */
    updateCartItemInformation(cartItem) {
        let cartItemUpdatedDetails = [];
        cartItemUpdatedDetails.cartItemId = cartItem.cartItemId;
        cartItemUpdatedDetails.quantity = cartItem.quantity;
        cartItemUpdatedDetails.totalListPrice = cartItem.totalListPrice;
        cartItemUpdatedDetails.totalPrice = cartItem.totalPrice;
        if (this._isEERXitem === true) {
            this.template.querySelector('c-b2b_vs_rx_cart_items').updateCartItem(cartItemUpdatedDetails);
        } else if (this._isSHEEitem === true) {
            this.template.querySelector('c-b2b_cart-items-s-h-e-e').updateCartItem(cartItemUpdatedDetails);
        }
        this.handleCartUpdate();
    }

    /**
     * Handler for the 'loadevent' event fired from B2B_cartItems component.
     * @param {Event} evt
     *  A 'loadevent' event fired from the B2B_cartItems component
     */
    handleLoadEvent(evt) {
        this._isLoading = evt.detail.isLoading;
    }

    /**
     * Handler for the 'initialloadevent' event fired from B2B_cartItems component.
     * @param {Event} event
     * A 'initialloadevent' event fired from the B2B_cartItems component
     * BS-1409
     */
    handleInitialLoadEvent(event) {
        if (event && event.detail && event.detail.isLoadingComplete != undefined && event.detail.isLoadingComplete != null) {
            this._initialPageLoader = event.detail.isLoadingComplete;
        }
    }

    /**
     * Handler for the 'updatecartheadercount' event fired from cartItems component.
     * @param {Event} event
     *  A 'updatecartheadercount' event fire from the Cart Items component
     */
    handleUpdateCartHeaderCount(event) {
        this._cartItemCount = event.detail.totalCount;
    }

    /**
     * Handler to delete Cart Item
     */
    closePopupAndClearCartItem() {
        this._isCartCloseClicked = false;
        this._isRxCartCloseClicked = false;
        this._isLoading = true;
        this.handleCartItemDelete(this._cartItemId);
    }

    /**
     * Handler to show popup on CartItem
     * @param {Event} event
     */
    showPopupForCartItem(event) {
        this._cartItemId = event.detail.cartItemId;
        this._clearCart = false;
        this._clearItem = true;
        this._clearRxItem = false;
        this._isCartCloseClicked = true;
    }

    /**
     * BS-1958
     * Handler to show popup on CartItem
     * @param {Event} event
     */
    showPopupForCartItemEdit(event) {
        this._editCartItem = true;
        this._isCartCloseClicked = true;
        this._cartItemId = event.detail.cartItemId;
    }

    /**
     * Handler to show popup on RX CartItem
     * @param {Event} event
     */
    showPopupForRxCartItem(event) {
        this._cartItemId = event.detail.cartItemId;
        this._clearRxItem = true;
        this._clearCart = false;
        this._clearItem = false;
        this._isCartCloseClicked = false;
        this._isRxCartCloseClicked = true;
    }
    /**
     * Handler to show popup on Clear Cart
     */
    showPopupForClearCart() {
        this._clearItem = false;
        this._clearCart = true;
        this._isCartCloseClicked = true;
        this._isRxCartCloseClicked = false;
    }
    /**
     * Handler to close popup
     */
    closePopup() {
        this._isCartCloseClicked = false;
        this._isRxCartCloseClicked = false;
    }

    /**
     * Handler to Delete/Clear Cart
     */
    closePopupAndClearCart() {
        this._isCartCloseClicked = false;
        this._isLoading = true;
        this.handleClearCartButtonClicked();
    }

    handleDialogClose() {
        this._isCartCloseClicked = false;
        this._isRxCartCloseClicked = false;
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

    handleEntitlementError(event) {
        this._isSHEEitem = true;
        this._isVSitem = false;
        this._isEERXitem = false;
        this._isShEeActive = ACTIVE_TAB;
        this._isVsActive = INACTIVE_TAB;
        this._isEErxActive = INACTIVE_TAB;
        this._isShEeActiveCount = ACTIVE_COUNT;
        this._isVsActiveCount = INACTIVE_COUNT;
        this._isEErxActiveCount = INACTIVE_COUNT;
        this.showEntitlementErrorPopup = true;
        this.entitlementErrorCSS = true;
        this.unentitledproductsId = event.detail.unentitledproductsList;
        this.getCartItems();
        fireEvent(this.pageRef, HIDE_FEATURE_SPARE_PARTS, false);
    }

    /**
     * This method is used to handle tab selection event on UI
     */
    handleTabSelection(event) {
        this._isLoading = true;
        if (event.target.dataset.tab != null && event.target.dataset.tab != undefined) {
            //this._isLoading = true; // Turning on loading spinner
            let applicableBrand = event.target.dataset.tab; //Getting value of current active tab

            //Checking whether switched tab is VS
            if (applicableBrand == this.label.labelForSHEE) {
                this._isSHEEitem = true;
                this._isVSitem = false;
                this._isEERXitem = false;
                this._isShEeActive = ACTIVE_TAB;
                this._isVsActive = INACTIVE_TAB;
                this._isEErxActive = INACTIVE_TAB;
                this._isShEeActiveCount = ACTIVE_COUNT;
                this._isVsActiveCount = INACTIVE_COUNT;
                this._isEErxActiveCount = INACTIVE_COUNT;
                fireEvent(this.pageRef, HIDE_FEATURE_SPARE_PARTS, false);
                this._isLoading = false;
            } else if (applicableBrand == this.label.labelForVS) {
                // If switched tab is VS then setting it as applicable brand and fetching configurator records that are of VS type
                this._isSHEEitem = false;
                this._isVSitem = true;
                this._isEERXitem = false;
                this._isShEeActive = INACTIVE_TAB;
                this._isVsActive = ACTIVE_TAB;
                this._isEErxActive = INACTIVE_TAB;
                this._isShEeActiveCount = INACTIVE_COUNT;
                this._isVsActiveCount = ACTIVE_COUNT;
                this._isEErxActiveCount = INACTIVE_COUNT;
                this._applicableBrand = VS_BRAND; //BS-1958
                fireEvent(this.pageRef, HIDE_FEATURE_SPARE_PARTS, true);
                this._isLoading = false;
            } else if (applicableBrand == this.label.labelForRX) {
                // Else switched tab is RX then setting it as applicable brand and fetching configurator records that are of RX type
                this._isSHEEitem = false;
                this._isVSitem = false;
                this._isEERXitem = true;
                this._isShEeActive = INACTIVE_TAB;
                this._isVsActive = INACTIVE_TAB;
                this._isEErxActive = ACTIVE_TAB;
                this._isShEeActiveCount = INACTIVE_COUNT;
                this._isVsActiveCount = INACTIVE_COUNT;
                this._isEErxActiveCount = ACTIVE_COUNT;
                this.showEntitlementErrorPopup = false;
                this.entitlementErrorCSS = false;
                this._applicableBrand = RX_BRAND; //BS-1958
                fireEvent(this.pageRef, HIDE_FEATURE_SPARE_PARTS, true);
                this._isLoading = false;
                this._initialPageLoader = false;
            }
        }
        // On switch of tab, redirect user to 1st page
        this._pageNumber = FIRST_PAGE;
    }

    //Method get the cart item type
    getTypeOfCartItem(cartItemIdList) {
        getCartItemType({
            cartItemIdList: cartItemIdList
        })
            .then(async (result) => {
                result.forEach((item) => {
                    this._ShEeProductCount = 0;
                    this._EeRxProductCount = 0;
                    this._ShVsProductCount = 0; //BS-1150
                    this._SHEECartItems = [];
                    this._EERXCartItems = [];
                    this._SHVSCartItems = []; //BS-1150
                    if (item.B2B_Type__c != undefined && item.B2B_Type__c != null) {
                        this._itemIdVsItemType.set(item.Id, item.B2B_Type__c);
                    } else {
                        this._itemIdVsItemType.set(item.Id, 'SH/EE');
                    }
                });
                this.cartItems.forEach((item) => {
                    cartItemIdList.push(item.cartItem.cartItemId);
                    if (this._itemIdVsItemType.get(item.cartItem.cartItemId) == 'SH/EE') {
                        this._SHEECartItems.push(item);
                        this._ShEeProductCount = this._ShEeProductCount + Number(item.cartItem.quantity);
                    } else if (this._itemIdVsItemType.get(item.cartItem.cartItemId) == RX_GLAZING) {
                        this._EERXCartItems.push(item);
                        this._EeRxProductCount = this._EeRxProductCount + Number(item.cartItem.quantity);
                    } else {
                        this._SHVSCartItems.push(item);
                        this._ShVsProductCount = this._ShVsProductCount + Number(item.cartItem.quantity);
                    }
                });
                if (this._SHEECartItems.length === 0) {
                    fireEvent(this.pageRef, HIDE_FEATURE_SPARE_PARTS, true);
                }
                this._EERXCartItems.forEach((item) => {
                    //BS-1150- Updated the variable name
                    if (
                        this.cartItemIdListVSRX != null &&
                        this.cartItemIdListVSRX != undefined &&
                        this.cartItemIdListVSRX.includes(item.cartItem.cartItemId) == false
                    ) {
                        this.cartItemIdListVSRX.push(item.cartItem.cartItemId);
                    }
                });

                //BS-1150- Added this block to add the data for 100% Sh tab
                this._SHVSCartItems.forEach((item) => {
                    if (
                        this.cartItemIdListVSRX != null &&
                        this.cartItemIdListVSRX != undefined &&
                        this.cartItemIdListVSRX.includes(item.cartItem.cartItemId) == false
                    ) {
                        this.cartItemIdListVSRX.push(item.cartItem.cartItemId);
                    }
                });

                //BS-1409
                if (this.cartItemIdListVSRX) {
                    this.getTotalPriceForCartItem(this.cartItemIdListVSRX);
                }
                //BS-1409

                let data = await getCartItemDetails({ cartItemIdList: this.cartItemIdListVSRX });
                this.cartItemIDetailsList = JSON.parse(JSON.stringify(data));
                if (data !== null && data !== undefined) {
                    const keys = Object.keys(this.cartItemIDetailsList);
                    this._EERXCartItems.forEach((item) => {
                        let cartItemId = item.cartItem.cartItemId;
                        if (keys.includes(cartItemId)) {
                            item.additionalInfo = this.cartItemIDetailsList[cartItemId];
                            let itemKey = Object.keys(item.additionalInfo);
                            itemKey.forEach((element) => {
                                let updatedValue;
                                if (PRESCRIPTION_VALUE_FIELD_TO_APPEND_DECIMAL.includes(element) == true) {
                                    let enteredInput = item.additionalInfo[element] + '';
                                    if (enteredInput != null && enteredInput != undefined) {
                                        if (enteredInput.includes('.') == false) {
                                            updatedValue = enteredInput + TWO_ZERO_WITH_DOT;
                                        } else if (enteredInput.includes('.') == true) {
                                            let totalDecimalEntered = enteredInput.split('.')[1].length;
                                            if (
                                                totalDecimalEntered != null &&
                                                totalDecimalEntered != undefined &&
                                                totalDecimalEntered > 0 &&
                                                totalDecimalEntered < 3
                                            ) {
                                                if (totalDecimalEntered == 2) {
                                                    updatedValue = enteredInput;
                                                } else if (totalDecimalEntered == 1) {
                                                    updatedValue = enteredInput + ONE_ZERO;
                                                }
                                            } else if (totalDecimalEntered != null && totalDecimalEntered != undefined && totalDecimalEntered == 0) {
                                                updatedValue = enteredInput + TWO_ZERO;
                                            } else if (totalDecimalEntered >= 3) {
                                                let beforeDecimal = enteredInput.split('.')[0];
                                                let enteredDecimal = enteredInput.split('.')[1];
                                                enteredDecimal.slice(0, 2);
                                                updatedValue = beforeDecimal + '.' + enteredDecimal;
                                            }
                                        }
                                    }
                                    item.additionalInfo[element] = updatedValue;
                                }
                            });
                        }
                        item.additionalInfo = this.setCommaToDot(item.additionalInfo);
                    });
                    //BS-1150 : this block will add the cart Item data for VS tab
                    this._SHVSCartItems.forEach((item) => {
                        let cartItemId = item.cartItem.cartItemId;
                        if (keys.includes(cartItemId)) {
                            item.additionalInfo = this.cartItemIDetailsList[cartItemId];
                            let itemKey = Object.keys(item.additionalInfo);
                            itemKey.forEach((element) => {
                                let updatedValue;
                                if (PRESCRIPTION_VALUE_FIELD_TO_APPEND_DECIMAL.includes(element) == true) {
                                    let enteredInput = item.additionalInfo[element] + '';
                                    if (enteredInput != null && enteredInput != undefined) {
                                        if (enteredInput.includes('.') == false) {
                                            updatedValue = enteredInput + TWO_ZERO_WITH_DOT;
                                        } else if (enteredInput.includes('.') == true) {
                                            let totalDecimalEntered = enteredInput.split('.')[1].length;
                                            if (
                                                totalDecimalEntered != null &&
                                                totalDecimalEntered != undefined &&
                                                totalDecimalEntered > 0 &&
                                                totalDecimalEntered < 3
                                            ) {
                                                if (totalDecimalEntered == 2) {
                                                    updatedValue = enteredInput;
                                                } else if (totalDecimalEntered == 1) {
                                                    updatedValue = enteredInput + ONE_ZERO;
                                                }
                                            } else if (totalDecimalEntered != null && totalDecimalEntered != undefined && totalDecimalEntered == 0) {
                                                updatedValue = enteredInput + TWO_ZERO;
                                            } else if (totalDecimalEntered >= 3) {
                                                let beforeDecimal = enteredInput.split('.')[0];
                                                let enteredDecimal = enteredInput.split('.')[1];
                                                enteredDecimal.slice(0, 2);
                                                updatedValue = beforeDecimal + '.' + enteredDecimal;
                                            }
                                        }
                                    }
                                    item.additionalInfo[element] = updatedValue;
                                }
                            });
                        }
                        item.additionalInfo = this.setCommaToDot(item.additionalInfo);
                    });
                }
                //Query to fetch the glass details for RX products
                if (this.cartItemIDetailsList != null && this.cartItemIDetailsList != undefined) {
                    //BS-1137
                    await getGlassDetails({ cartItemIdVsLensConfiguratorMap: this.cartItemIDetailsList }).then((result) => {
                        for (let cartIndex = 0; cartIndex < this._EERXCartItems.length; cartIndex++) {
                            for (let resultIndex = 0; resultIndex < result.length; resultIndex++) {
                                if (this._EERXCartItems[cartIndex].cartItem.cartItemId === result[resultIndex].cartItemId) {
                                    if (
                                        this._EERXCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c !== undefined &&
                                        this._EERXCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c !== null &&
                                        this._EERXCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c === CLIP_IN_LABEL
                                    ) {
                                        //BS-1269 Start
                                        this._EERXCartItems[cartIndex].selectedRxSolutionColor = CLIP_IN_COLOR;
                                        this._EERXCartItems[cartIndex].additionalInfo.selectedLensImage = false;
                                        this._EERXCartItems[cartIndex].additionalInfo.isClipIn = true;
                                        this._EERXCartItems[cartIndex].additionalInfo.isAdapter = false;
                                        this._EERXCartItems[cartIndex].additionalInfo.isDirectGlazing = false;
                                        this._EERXCartItems[cartIndex].additionalInfo.selectedRxSolutionImage = false;
                                    } else if (
                                        this._EERXCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c !== undefined &&
                                        this._EERXCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c !== null &&
                                        this._EERXCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c === ADAPTER
                                    ) {
                                        this._EERXCartItems[cartIndex].additionalInfo.isDirectGlazing = false;
                                        this._EERXCartItems[cartIndex].additionalInfo.isAdapter = true;
                                        this._EERXCartItems[cartIndex].additionalInfo.isClipIn = false;
                                        this._EERXCartItems[cartIndex].additionalInfo.selectedRxSolutionImage =
                                            result[resultIndex].rxSolutionImage !== undefined && result[resultIndex].rxSolutionImage !== null
                                                ? result[resultIndex].rxSolutionImage
                                                : null;
                                        this._EERXCartItems[cartIndex].additionalInfo.selectedLensImage =
                                            result[resultIndex].lensImage !== undefined && result[resultIndex].lensImage !== null
                                                ? result[resultIndex].lensImage
                                                : null;
                                        this._EERXCartItems[cartIndex].selectedRxSolutionColor =
                                            result[resultIndex].rxSolutionColor !== undefined && result[resultIndex].rxSolutionColor !== null
                                                ? result[resultIndex].rxSolutionColor
                                                : null;
                                    } else if (
                                        this._EERXCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c !== undefined &&
                                        this._EERXCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c !== null &&
                                        this._EERXCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c === DIRECT_GLAZING
                                    ) {
                                        this._EERXCartItems[cartIndex].additionalInfo.isDirectGlazing = true;
                                        this._EERXCartItems[cartIndex].additionalInfo.isAdapter = false;
                                        this._EERXCartItems[cartIndex].additionalInfo.isClipIn = false;
                                        this._EERXCartItems[cartIndex].additionalInfo.selectedRxSolutionImage = false;
                                        this._EERXCartItems[cartIndex].additionalInfo.selectedLensImage =
                                            result[resultIndex].lensImage !== undefined && result[resultIndex].lensImage !== null
                                                ? result[resultIndex].lensImage
                                                : null;
                                    } else {
                                        this._EERXCartItems[cartIndex].additionalInfo.selectedLensImage = false;
                                        this._EERXCartItems[cartIndex].additionalInfo.isDirectGlazing = false;
                                        this._EERXCartItems[cartIndex].additionalInfo.isClipIn = false;
                                        this._EERXCartItems[cartIndex].additionalInfo.isAdapter = false;
                                        this._EERXCartItems[cartIndex].additionalInfo.selectedRxSolutionImage = false;
                                        this._EERXCartItems[cartIndex].selectedRxSolutionColor =
                                            result[resultIndex].rxSolutionColor !== undefined && result[resultIndex].rxSolutionColor !== null
                                                ? result[resultIndex].rxSolutionColor
                                                : null;
                                    } //BS-1269 end
                                    //BS-1311 start
                                    if (
                                        (this._EERXCartItems[cartIndex].additionalInfo.B2B_Special_Handling__c !== undefined &&
                                            this._EERXCartItems[cartIndex].additionalInfo.B2B_Special_Handling__c !== null) ||
                                        (this._EERXCartItems[cartIndex].additionalInfo.B2B_Customer_Service_Preference__c !== undefined &&
                                            this._EERXCartItems[cartIndex].additionalInfo.B2B_Customer_Service_Preference__c !== false) ||
                                        (this._EERXCartItems[cartIndex].additionalInfo.B2B_Note__c !== undefined &&
                                            this._EERXCartItems[cartIndex].additionalInfo.B2B_Note__c !== null) ||
                                        this._EERXCartItems[cartIndex].additionalInfo.B2B_Related_Order_Number__c
                                    ) {
                                        this._EERXCartItems[cartIndex].additionalInfo.isComment = true;
                                    } else {
                                        this._EERXCartItems[cartIndex].additionalInfo.isComment = false;
                                    } //BS-1311 end
                                    this._EERXCartItems[cartIndex].additionalInfo.isVsItem = false;
                                    this._EERXCartItems[cartIndex].selectedLensMaterial =
                                        result[resultIndex].lensMaterial !== undefined && result[resultIndex].lensMaterial !== null
                                            ? result[resultIndex].lensMaterial
                                            : null;
                                }
                            }
                        }
                        for (let cartIndex = 0; cartIndex < this._SHVSCartItems.length; cartIndex++) {
                            for (let resultIndex = 0; resultIndex < result.length; resultIndex++) {
                                if (this._SHVSCartItems[cartIndex].cartItem.cartItemId === result[resultIndex].cartItemId) {
                                    if (
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c !== undefined &&
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c !== null &&
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c === CLIP_IN_LABEL
                                    ) {
                                        //BS-1269 Start
                                        this._SHVSCartItems[cartIndex].selectedRxSolutionColor = CLIP_IN_COLOR;
                                        this._SHVSCartItems[cartIndex].additionalInfo.selectedLensImage = false;
                                        this._SHVSCartItems[cartIndex].additionalInfo.isClipIn = true;
                                        this._SHVSCartItems[cartIndex].additionalInfo.isAdapter = false;
                                        this._SHVSCartItems[cartIndex].additionalInfo.isDirectGlazing = false;
                                        this._SHVSCartItems[cartIndex].additionalInfo.selectedRxSolutionImage = false;
                                    } else if (
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c !== undefined &&
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c !== null &&
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c === ADAPTER
                                    ) {
                                        this._SHVSCartItems[cartIndex].additionalInfo.isDirectGlazing = false;
                                        this._SHVSCartItems[cartIndex].additionalInfo.isAdapter = true;
                                        this._SHVSCartItems[cartIndex].additionalInfo.isClipIn = false;
                                        this._SHVSCartItems[cartIndex].additionalInfo.selectedRxSolutionImage =
                                            result[resultIndex].rxSolutionImage !== undefined && result[resultIndex].rxSolutionImage !== null
                                                ? result[resultIndex].rxSolutionImage
                                                : null;
                                        this._SHVSCartItems[cartIndex].additionalInfo.selectedLensImage =
                                            result[resultIndex].lensImage !== undefined && result[resultIndex].lensImage !== null
                                                ? result[resultIndex].lensImage
                                                : null;
                                    } else if (
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c !== undefined &&
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c !== null &&
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_RX_Solution__c === DIRECT_GLAZING
                                    ) {
                                        this._SHVSCartItems[cartIndex].additionalInfo.isDirectGlazing = true;
                                        this._SHVSCartItems[cartIndex].additionalInfo.isAdapter = false;
                                        this._SHVSCartItems[cartIndex].additionalInfo.isClipIn = false;
                                        this._SHVSCartItems[cartIndex].additionalInfo.selectedRxSolutionImage = false;
                                        this._SHVSCartItems[cartIndex].additionalInfo.selectedLensImage =
                                            result[resultIndex].lensImage !== undefined && result[resultIndex].lensImage !== null
                                                ? result[resultIndex].lensImage
                                                : null;
                                    } else {
                                        this._SHVSCartItems[cartIndex].additionalInfo.selectedLensImage = false;
                                        this._SHVSCartItems[cartIndex].additionalInfo.isDirectGlazing = false;
                                        this._SHVSCartItems[cartIndex].additionalInfo.isClipIn = false;
                                        this._SHVSCartItems[cartIndex].additionalInfo.isAdapter = false;
                                        this._SHVSCartItems[cartIndex].additionalInfo.selectedRxSolutionImage = false;
                                        this._SHVSCartItems[cartIndex].selectedRxSolutionColor =
                                            result[resultIndex].rxSolutionColor !== undefined && result[resultIndex].rxSolutionColor !== null
                                                ? result[resultIndex].rxSolutionColor
                                                : null;
                                    } //BS-1269 end
                                    //BS-1311 start
                                    if (
                                        (this._SHVSCartItems[cartIndex].additionalInfo.B2B_Special_Handling__c !== undefined &&
                                            this._SHVSCartItems[cartIndex].additionalInfo.B2B_Special_Handling__c !== null) ||
                                        (this._SHVSCartItems[cartIndex].additionalInfo.B2B_Customer_Service_Preference__c !== undefined &&
                                            this._SHVSCartItems[cartIndex].additionalInfo.B2B_Customer_Service_Preference__c !== false) ||
                                        (this._SHVSCartItems[cartIndex].additionalInfo.B2B_Note__c !== undefined &&
                                            this._SHVSCartItems[cartIndex].additionalInfo.B2B_Note__c !== null)
                                    ) {
                                        this._SHVSCartItems[cartIndex].additionalInfo.isComment = true;
                                    } else {
                                        this._SHVSCartItems[cartIndex].additionalInfo.isComment = false;
                                    } //BS-1311 end
                                    this._SHVSCartItems[cartIndex].selectedLensMaterial =
                                        result[resultIndex].lensMaterial !== undefined && result[resultIndex].lensMaterial !== null
                                            ? result[resultIndex].lensMaterial
                                            : null;
                                    this._SHVSCartItems[cartIndex].additionalInfo.isVsItem = true;
                                    if (
                                        (this._SHVSCartItems[cartIndex].additionalInfo.B2B_Antireflection_Product__r !== undefined &&
                                            this._SHVSCartItems[cartIndex].additionalInfo.B2B_Antireflection_Product__r !== null) ||
                                        (this._SHVSCartItems[cartIndex].additionalInfo.B2B_Hard_Coating_Product__r !== undefined &&
                                            this._SHVSCartItems[cartIndex].additionalInfo.B2B_Hard_Coating_Product__r !== null)
                                    ) {
                                        if (
                                            this._SHVSCartItems[cartIndex].additionalInfo.B2B_Antireflection_Product__r !== undefined &&
                                            this._SHVSCartItems[cartIndex].additionalInfo.B2B_Antireflection_Product__r.Description != undefined &&
                                            this._SHVSCartItems[cartIndex].additionalInfo.B2B_Antireflection_Product__r.Description !== null
                                        ) {
                                            this._SHVSCartItems[cartIndex].additionalInfo.antireflectionHardCoating =
                                                this._SHVSCartItems[cartIndex].additionalInfo.B2B_Antireflection_Product__r.Description;
                                        } else if (
                                            this._SHVSCartItems[cartIndex].additionalInfo.B2B_Hard_Coating_Product__r !== undefined &&
                                            this._SHVSCartItems[cartIndex].additionalInfo.B2B_Hard_Coating_Product__r.Description !== undefined &&
                                            this._SHVSCartItems[cartIndex].additionalInfo.B2B_Hard_Coating_Product__r.Description !== null
                                        ) {
                                            this._SHVSCartItems[cartIndex].additionalInfo.antireflectionHardCoating =
                                                this._SHVSCartItems[cartIndex].additionalInfo.B2B_Hard_Coating_Product__r.Description;
                                        }
                                    } else {
                                        this._SHVSCartItems[cartIndex].additionalInfo.antireflectionHardCoating = false;
                                    }
                                    if (
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_Photo_Sensation__r !== undefined &&
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_Photo_Sensation__r !== null &&
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_Photo_Sensation__r.Description != undefined &&
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_Photo_Sensation__r.Description !== null
                                    ) {
                                        this._SHVSCartItems[cartIndex].additionalInfo.photoSensation =
                                            this._SHVSCartItems[cartIndex].additionalInfo.B2B_Photo_Sensation__r.Description;
                                    }
                                    if (
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_Blue_Sensation__r !== undefined &&
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_Blue_Sensation__r !== null &&
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_Blue_Sensation__r.Description != undefined &&
                                        this._SHVSCartItems[cartIndex].additionalInfo.B2B_Blue_Sensation__r.Description !== null
                                    ) {
                                        this._SHVSCartItems[cartIndex].additionalInfo.blueSensation =
                                            this._SHVSCartItems[cartIndex].additionalInfo.B2B_Blue_Sensation__r.Description;
                                    }
                                }
                            }
                        }
                    });
                }
            })
            .then(() => {
                this._cartItemsLoaded = true; //BS-1409
            })
            .error((error) => {
                console.error('error', error);
            });
    }

    /**
     * BS-976
     * This method is used to check eligibility of current product for VS-RX
     *
     * @type {Category[]}
     */
    // Updated method : BS-2300
    checkEligibilityForVisionSensationRXGlazing() {
        checkVSRXEligibilityFromAccount({ accountId: this.effectiveAccountId })
            .then((result) => {
                if (result != null && result != undefined) {
                    this.isEligibleForVS = result.isEligibleForVS;
                    this.isEligibleForRX = result.isEligibleForRX;
                }
            })
            .catch((exceptionInstance) => {
                console.error('Error:', exceptionInstance);
            });
    }

    /**
     * BS-976
     * this method handles the formating of the comma to dot and dot to comma as per the current language of the user.
     */
    setCommaToDot(additonalInfoArray) {
        if (additonalInfoArray !== undefined && additonalInfoArray !== null) {
            let keys = Object.keys(additonalInfoArray);
            if (keys !== undefined && keys !== null && keys.length > 0) {
                keys.forEach((key) => {
                    if (/^[a-zA-Z]/.test(additonalInfoArray[key]) === false && key.includes('__r') == false) {
                        if (LANG == DE_LANG) {
                            additonalInfoArray[key] = additonalInfoArray[key].toString().replace('.', ',');
                        }
                    }
                });
                return additonalInfoArray;
            }
        }
    }

    /**
     * BS-1036
     * This method updates the total price of the cart items in the
     * evil eye tab
     * @param {String} cartItemIds
     */
    getTotalPriceForCartItem(cartItemIds) {
        getTotalPriceForCartItem({
            cartItemsIdList: cartItemIds
        })
            .then((result) => {
                let cartItemVsCustomCartItemObjMap = JSON.parse(JSON.stringify(result));
                if (cartItemVsCustomCartItemObjMap != null && cartItemVsCustomCartItemObjMap != undefined) {
                    this.cartItemVsTotalPriceMap = new Map();

                    let customCartItemObj = {};
                    customCartItemObj.totalPrice = 0;
                    if (Object.values(cartItemVsCustomCartItemObjMap)) {
                        Object.values(cartItemVsCustomCartItemObjMap).forEach((item) => {
                            item.forEach((currentCartItem) => {
                                cartItemIds.forEach((standardCartItemId) => {
                                    if (standardCartItemId == currentCartItem.B2B_Parent_Cart_Item__c) {
                                        if (this.cartItemVsTotalPriceMap.has(currentCartItem.B2B_Parent_Cart_Item__c)) {
                                            let totalPrice =
                                                Number(this.cartItemVsTotalPriceMap.get(currentCartItem.B2B_Parent_Cart_Item__c)) +
                                                Number(currentCartItem.B2B_List_Price__c);
                                            this.cartItemVsTotalPriceMap.set(currentCartItem.B2B_Parent_Cart_Item__c, totalPrice);
                                        } else {
                                            this.cartItemVsTotalPriceMap.set(
                                                currentCartItem.B2B_Parent_Cart_Item__c,
                                                Number(currentCartItem.B2B_List_Price__c)
                                            );
                                        }
                                    }
                                });
                            });
                        });
                    }
                }
                //BS-1409
                this._totalAdditionalCartPriceRX = 0;
                if (
                    this.cartItemVsTotalPriceMap != undefined &&
                    this.cartItemVsTotalPriceMap != null &&
                    this.cartItemVsTotalPriceMap.values() != null &&
                    this.cartItemVsTotalPriceMap.values() != null
                ) {
                    let listOfAllAdditionalPrice = Array.from(this.cartItemVsTotalPriceMap.values());
                    if (listOfAllAdditionalPrice.length > 0) {
                        listOfAllAdditionalPrice.forEach((cartItemPrice) => {
                            this._totalAdditionalCartPriceRX = Number(this._totalAdditionalCartPriceRX) + Number(cartItemPrice);
                        });
                    }
                }
                //BS-1409
            })
            .then(() => {
                fireEvent(this.pageRef, UPDATE_CART_TOTAL_PRICE, this._totalAdditionalCartPriceRX);
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    /**
     * BS-1036
     * this is a handler for the event on click of the button
     * save to my wishlist.
     */
    handleSaveToMyWishList(event) {
        this._isCartCloseClicked = false;
        this._isRxCartCloseClicked = false;
        this._isLoading = true;
        this.saveToMyWishlist(this._cartItemId);
    }

    /**
     * BS-1036
     * this method deletes the standard and the custom cart items
     */
    saveToMyWishlist(cartItemId) {
        saveToMyWishList({
            communityId,
            effectiveAccountId: this.effectiveAccountId,
            activeCartOrId: this.recordId,
            cartItemId,
            updateLensConfigurator: true
        })
            .then(() => {
                fireEvent(this.pageRef, CART_ITEMS_REMOVED_EVT);
                if (this.cartItemVsTotalPriceMap != null && this.cartItemVsTotalPriceMap.has(cartItemId)) {
                    fireEvent(this.pageRef, DELETE_ADITIONAL_PRICE, this.cartItemVsTotalPriceMap.get(cartItemId));
                }
                this.fetchSilhouetteEvilEyeLockFlag();
                if (this._isEditAction) {
                    this.redirectToVSRXConfiguratorPage(cartItemId);
                }
            })
            .catch((exceptionInstance) => {
                // Handle cart item delete error properly
                // For this sample, we can just log the  error
                console.error(exceptionInstance);
                this._isCartCloseClicked = false;
                this._isEditAction = false;
                this._isLoading = false;
            });
    }

    async fetchSilhouetteEvilEyeLockFlag() {
        this._silhouetteCCSFlag = false;
        this._evileyeCCSFlag = false;
        await getBrandWiseCCSFlag({ cartId: this.recordId, accountId: this.effectiveAccountId }).then((result) => {
            if (
                result != undefined &&
                result !== null &&
                result.silhouetteCCSFlag !== undefined &&
                result.silhouetteCCSFlag !== null &&
                result.evilEyeCCSFlag !== undefined &&
                result.evilEyeCCSFlag !== null
            ) {
                this._silhouetteCCSFlag = result.silhouetteCCSFlag;
                this._evileyeCCSFlag = result.evilEyeCCSFlag;
            }
            fireEvent(this.pageRef, CCS_EVENT, { silhouetteCCSFlag: this._silhouetteCCSFlag, evilEyeCCSFlag: this._evileyeCCSFlag });
        });
    }

    /**
     * BS-1958
     * Handler to edit Cart Item
     */
    handleCartItemEdit(event) {
        this._isCartCloseClicked = false;
        this._isLoading = true;
        this._isEditAction = true;
        this.saveToMyWishlist(this._cartItemId);
    }

    /**
     * BS-1958
     * Method to get lens configuration data of the cart item to be edited
     */
    async redirectToVSRXConfiguratorPage(cartItemId) {
        await getVSRXCartItemConfigurationData(this.cartItemIDetailsList[this._cartItemId].Id, this._applicableBrand)
            .then((result) => {
                this._lensConfiguratorCollectionData = JSON.parse(JSON.stringify(result));
                if (
                    this._lensConfiguratorCollectionData &&
                    this._lensConfiguratorCollectionData.selectedFrameSKU != undefined &&
                    this._lensConfiguratorCollectionData.selectedFrameSKU != null
                ) {
                    this.createFrameInformationCollection(this._lensConfiguratorCollectionData.selectedFrameSKU, cartItemId);
                }
            })
            .catch((error) => {
                console.error(error);
                this._isLoading = false;
            });
    }

    /**
     * BS-1958
     *
     */
    createFrameInformationCollection(selectedFrameSku, cartItemId) {
        getFrameImage({ selectedFrameSKU: selectedFrameSku })
            .then((image) => {
                if (image != undefined && image != null && image[0]) {
                    let imageObj = JSON.parse(JSON.stringify(image[0]));
                    this._frameInformationCollection.image =
                        imageObj.B2B_Picture_Link__c != undefined && imageObj.B2B_Picture_Link__c != null ? imageObj.B2B_Picture_Link__c : '';
                } else {
                    this._isLoading = false;
                }
            })
            .then(() => {
                getFrameProductValues({ selectedFrameSKU: selectedFrameSku })
                    .then((result) => {
                        let productId;
                        if (result != undefined && result != null) {
                            let frameProductData = JSON.parse(JSON.stringify(result[0]));
                            if (frameProductData != undefined && frameProductData != null) {
                                this._frameInformationCollection.bridgeSize =
                                    frameProductData.B2B_Bridge_Size__c != undefined && frameProductData.B2B_Bridge_Size__c != null
                                        ? frameProductData.B2B_Bridge_Size__c
                                        : '';
                                this._frameInformationCollection.collectionDesignFamily =
                                    frameProductData.B2B_Design_Family__c != undefined && frameProductData.B2B_Design_Family__c != null
                                        ? frameProductData.B2B_Design_Family__c
                                        : '';
                                this._frameInformationCollection.frameColor =
                                    frameProductData.StockKeepingUnit != undefined && frameProductData.StockKeepingUnit != null
                                        ? frameProductData.StockKeepingUnit.substring(7, 11)
                                        : '';
                                this._frameInformationCollection.frameColorDescription =
                                    frameProductData.B2B_Frame_Color_Description__c != undefined && frameProductData.B2B_Frame_Color_Description__c != null
                                        ? frameProductData.B2B_Frame_Color_Description__c
                                        : '';
                                this._frameInformationCollection.frameType =
                                    frameProductData.B2B_Frame_type__c != undefined && frameProductData.B2B_Frame_type__c != null
                                        ? frameProductData.B2B_Frame_type__c
                                        : '';
                                this._frameInformationCollection.model =
                                    frameProductData.B2B_Model__c != undefined && frameProductData.B2B_Model__c != null ? frameProductData.B2B_Model__c : '';
                                this._frameInformationCollection.lensSize =
                                    frameProductData.B2B_Lens_Size__c != undefined && frameProductData.B2B_Lens_Size__c != null
                                        ? frameProductData.B2B_Lens_Size__c
                                        : '';
                                this._frameInformationCollection.productIdPDP =
                                    frameProductData.Id != undefined && frameProductData.Id != null ? frameProductData.Id : '';
                                this._frameInformationCollection.selectedFrameSKU =
                                    selectedFrameSku != undefined && selectedFrameSku != null ? selectedFrameSku : '';
                                this._frameInformationCollection.size =
                                    frameProductData.B2B_EE_Size__c != undefined && frameProductData.B2B_EE_Size__c != null
                                        ? frameProductData.B2B_EE_Size__c
                                        : '';
                                this._frameInformationCollection.templeLength =
                                    frameProductData.B2B_Temple_Length__c != undefined && frameProductData.B2B_Temple_Length__c != null
                                        ? frameProductData.B2B_Temple_Length__c
                                        : '';
                                //BS-1916 - Start
                                this._frameInformationCollection.variantShape =
                                    frameProductData.B2B_Variant_Shape__c != undefined && frameProductData.B2B_Variant_Shape__c != null
                                        ? frameProductData.B2B_Variant_Shape__c
                                        : '';
                                this._frameInformationCollection.shapeSize =
                                    frameProductData.B2B_Shape_Size__c != undefined && frameProductData.B2B_Shape_Size__c != null
                                        ? frameProductData.B2B_Shape_Size__c
                                        : '';
                                //BS-1916 end
                                this._frameInformationCollection.rimlessVariant =
                                    frameProductData.B2B_Rimless_Variant__c != undefined && frameProductData.B2B_Rimless_Variant__c != null
                                        ? frameProductData.B2B_Rimless_Variant__c
                                        : ''; //BS-1888
                                //BS-1701 - Start
                                this._frameInformationCollection.modelNameNumber =
                                    frameProductData.Name != undefined && frameProductData.Name != null ? frameProductData.Name : '';
                                this._frameInformationCollection.modelNameNumber +=
                                    frameProductData.B2B_Model__c != undefined && frameProductData.B2B_Model__c != null
                                        ? ' ' + frameProductData.B2B_Model__c
                                        : '';
                                //BS-1701 - End
                                this._frameInformationCollection.hexcode = frameProductData.B2B_Hexcode__c ? frameProductData.B2B_Hexcode__c : null;
                                this._frameInformationCollection.hexcodeAccent = frameProductData.B2B_Hexcode_Accent__c
                                    ? frameProductData.B2B_Hexcode_Accent__c
                                    : null;
                                productId = frameProductData.B2B_Product__c;
                            }
                            if (this._frameInformationCollection) {
                                let targetPage;
                                if (this._applicableBrand != null && this._applicableBrand != undefined && this._applicableBrand != '') {
                                    // Setting up target page according to the applicable brand
                                    targetPage =
                                        this._applicableBrand == VS_BRAND
                                            ? VISION_SENSATION_SITE_PAGE
                                            : this._applicableBrand == RX_BRAND
                                            ? RX_GLAZING_SITE_PAGE
                                            : null;
                                }
                                //Navigating to VS-RX page
                                this.removeCartItem(cartItemId);
                                this[NavigationMixin.Navigate]({
                                    type: STANDARD_NAMED_PAGE,
                                    attributes: {
                                        name: targetPage
                                    },
                                    state: {
                                        pageSource: MY_VS_RX_PAGE_SOURCE_IDENTIFIER,
                                        lensConfiguratorCollection: JSON.stringify(this._lensConfiguratorCollectionData),
                                        productData: JSON.stringify(this._frameInformationCollection),
                                        productId: productId
                                    }
                                });
                            }
                        } else {
                            this._isLoading = false;
                        }
                    })
                    .catch((execptionInstance) => {
                        console.error(execptionInstance);
                        this._isLoading = false;
                    });
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                this._isLoading = false;
            });
    }
}
