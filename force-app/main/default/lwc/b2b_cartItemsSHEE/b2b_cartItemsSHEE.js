import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener } from 'c/b2b_pubsub';
// CONTROLLER METHODS
import getCartItemData from '@salesforce/apex/B2B_CartController.getCartItemData';
import updateCartItemData from '@salesforce/apex/B2B_CartController.updateCartItemData';
import getProductDetails from '@salesforce/apex/B2B_CartController.getProductDetails';
import getProductType from '@salesforce/apex/B2B_CartController.getProductType'; // BS-1137
import getColorsMetadata from '@salesforce/apex/B2B_SearchController.getColorsMetadata';
import getTotalPriceForCartItem from '@salesforce/apex/B2B_CartController.getTotalPriceForCartItem'; //BS-1094
import getEntitledProducts from '@salesforce/apex/B2B_CartController.getEntitledSHProducts'; //BS-1090
import deleteCartItem from '@salesforce/apex/B2B_CartController.deleteMultipleCartItems'; //BS-1090
import checkSparePartsOnlyFrames from '@salesforce/apex/B2B_CartController.checkSparePartsOnlyFrames'; //BS-1568
import B2B_Availability_Status_Labels from '@salesforce/label/c.B2B_Availability_Status_Labels'; //BS-1568
import B2B_MISSING_PRICE_LABELS from '@salesforce/label/c.B2B_MISSING_PRICE_LABELS'; //BS-1951
import B2B_REQUIRED_END_CONSUMER_ORDER_REMARK_CART from '@salesforce/label/c.B2B_REQUIRED_END_CONSUMER_ORDER_REMARK_CART'; //BS-2031
import B2B_Textbox_White_Space_Error from '@salesforce/label/c.B2B_Textbox_White_Space_Error'; //BS-2031

// UTLITY METHODS
import { getDeliveryTime, getApplicableAvailabilityStatusIcon } from 'c/b2b_utils';
import { getLabelForOriginalPrice, displayOriginalPrice } from 'c/b2b_cartUtils';
import { resolve } from 'c/b2b_cmsResourceResolver';

// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';

// GET LABELS
import CART_ITEM_LABELS from '@salesforce/label/c.B2B_CartContents_And_CartItems';
import PDP_LABELS from '@salesforce/label/c.B2B_PDP_InfoLabels';
import FINISH_LABEL from '@salesforce/label/c.B2B_Finish_Label';
import COLOR_LABEL from '@salesforce/label/c.B2B_PLP_ColorFilter_Columns';
import REMOVE_LABEL from '@salesforce/label/c.B2B_CART_REMOVE_LABEL';
import LENS_SIZE from '@salesforce/label/c.B2B_Lens_Size_Label';
import B2B_EE_RX_CART_LABELS from '@salesforce/label/c.B2B_EE_RX_Cart_Labels';
import CART_CONTENTS_LABELS from '@salesforce/label/c.B2B_CartContents_And_CartItems'; //BS-1090
import UNENTITLED_WARNING_LABEL from '@salesforce/label/c.B2B_Entitlement_Error_Message'; //BS-1090
import B2B_SH_EE_LENS_SHAPE from '@salesforce/label/c.B2B_SH_EE_LENS_SHAPE'; //BS-1431
import PLP_LABELS from '@salesforce/label/c.B2B_PLP_Product_Details'; //BS-1951
import ORDER_REMARK_FIELD_HELPTEXT from '@salesforce/label/c.B2B_ORDER_REMARK_FIELD_HELPTEXT'; //BS-2437
import CONSUMER_REFERENCE_FIELD_HELPTEXT from '@salesforce/label/c.B2B_CONSUMER_REFERENCE_FIELD_HELPTEXT'; //BS-2437

// EVENT NAME CONSTANTS
const UPDATE_CART_TOTAL_PRICE = 'updatetotalcartprice'; //BS-1094
const QUANTITY_CHANGED_EVT = 'quantitychanged';
const LOADING_EVENT = 'loadevent';
const INITIAL_LOADING_EVENT = 'initialloadevent'; //BS-1409
const UPDATE_CART_HEADER_COUNT = 'updatecartheadercount';
const POPUP_FOR_DELETE = 'popupfordelete';
const LOADING_STATUS = 'loadingstatus';
const DISABLED_CHECKOUT_BUTTON = 'disabledproceedcheckoutbutton';

//CONSTANTS
const CUSTOMER_REFERENCE_VALUE = 'Customer Reference';
const ENTERED_BY_VALUE = 'Entered By';
const SIMPLE_PRODUCT_CLASS = 'Simple';
const MAX_QUANTITY_ALLOWED = 9999;
const MIN_QUANTITY_ALLOWED = 1;
const B2B_EE_BRAND_API_NAME_05 = '05';

const FRAME_COLOR_DESCRIPTION = 'B2B_Frame_Color_Description__c';
const LENS_COLOR_DESCRIPTION = 'B2B_Lens_Color_Description__c';
const FRAME_COLOR = 'B2B_Frame_Color__c';
const LENS_COLOR = 'B2B_Lens_Color__c';
const STYLE_DISPLAY_NONE = 'display: none';
const TRANSPARENT = 'transparent';
const URI1 =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxwYXR0ZXJuIGlkPSJiIiBwYXR0ZXJuVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PHVzZSB4bGluazpocmVmPSIjYSIgdHJhbnNmb3JtPSJzY2FsZSguNSkiLz48L3BhdHRlcm4+PGltYWdlIGlkPSJhIiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0NBWUFBQUJYQXZtSEFBQUVHV2xEUTFCclEwZERiMnh2Y2xOd1lXTmxSMlZ1WlhKcFkxSkhRZ0FBT0kyTlZWMW9IRlVVUHJ0elp5TWt6bE5zTklWMHFEOE5KUTJUVmpTaHRMcC8zZDAyYnBaSk50b2k2R1QyN3M2WXljNDRNN3Y5b1U5RlVId3g2cHNVeEwrM2dDQW85US9iUHJRdmxRb2wydFFnS0Q2MCtJTlE2SXVtNjVrN001bHB1ckhlWmU1ODg1M3ZubnZ1dVdmdkJlaTVxbGlXa1JRQkZwcXVMUmN5NG5PSGo0ZzlLNUNFaDZBWEJxRlhVUjByWGFsTUFqWlBDM2UxVzk5RHdudGYyZFhkL3ArdHQwWWRGU0J4SDJLejVxZ0xpSThCOEtkVnkzWUJldnFSSHovcVdoNzJZdWkzTVVERUwzcTQ0V1BYdzNNK2ZvMXBadVFzNHRPSUJWVlRhb2lYRUkvTXhmaEdEUHN4c05aZm9FMXE2NnJvNWFKaW0zWGRvTEZ3NzJIK24yM0JhSVh6YmNPbno1bWZQb1R2WVZ6N0t6VWw1K0ZSeEV1cWtwOUcvQWppYTIxOXRoemcyNWFia1JFL0JwRGMzcHF2cGhIdlJGeXMyd2VxdnAra3JiV0tJWDduaERiekxPSXRpTTgzNThwVHdkaXJxcFBGbk1GMnhMYzFXdkx5T3dUQWlicGJtdkhIY3Z0dFU1N3k1K1hxTlpyTGUzbEUvUHE4ZVVqMmZYS2ZPZTNwZk9qemhKWXRCL3lsbDVTREZjU0RpSCtoUmtIMjUrTCtzZHhLRUFNWmFocmxTWDh1a3FNT1d5L2pYVzJtNk05TERCYzMxQjlMRnV2NmdWS2cvMFN6aTNLQXIxa0dxMUdNalUvYUxibnE2L2xSeGM0WGZKOThoVGFyZ1grK0RiTUpCU2lZTUllOUNrMVlBeEZrS0VBRzN4YllhS21ERGdZeUZLMFVHWXBmb1dZWEcrZkFQUEk2dEpuTndiN0NsUDdJeUYrRCtiak90Q3BraHo2Q0ZySWEvSTZzRnRObDhhdUZYR01UUDM0c053SS9KaGtnRXRtRHoxNHlTZmFSY1RJQklubUtQRTMya3h5eUUyVHYrdGhLYkVWZVBEZlcvYnlNTTFLbW0wWGRPYlM3b0dEL015cE1YRlBYckN3T3RvWWp5eW43QlYyOS9NWmZzVnpwTERkUnR1SVpuYnBYenZsZitldjhNdllyL0dxazRIL2tWL0czY3NkYXpMdXlUTVBzYkZoemQxVWFiUWJqRnZEUm1jV0p4UjN6Y2ZIa1Z3OUdmcGJKbWVldjlGMDhXVzh1RGthc2x3WDZhdmxXR1U2TlJLejBnL1NIdEN5OUozMG8vY2E5elgzS2ZjMTl6bjNCWFFLUk84dWQ0NzdoTG5BZmMxL0c5bXJ6R2xyZmV4WjVHTGRuNlpacnJFb2hJMndWSGhaeXdqYmhVV0V5OGljTUNHTkNVZGlCbHEzcit4YWZMNTQ5SFE1akgrYW4rMXkrTGxZQmlmdXhBdlJOL2xWVlZPbHdsQ2tkVm05Tk9MNUJFNHdrUTJTTWxEWlU5N2hYODZFaWxVL2xVbWtRVXp0VEU2bXgxRUVQaDdPbWRxQnRBdnY4SGRXcGJySlM2dEpqM24wQ1dkTTZidXNOelJWM1M5S1RZaHF2TmlxV211cm9pS2dZaHNoTWptaFRoOXB0V2hzRjc5NzBqL1NiTXJzUEUxc3VSNXo3RE1DK1AvSHMreTdpanJRQWxoeUFnY2NqYmhqUHlnZmVCVGp6aE5xeTI4RWRrVWg4QytEVTkrejJ2L295ZUg3OTFPbmN4SE9zNXkyQXRUYzduYi9mNzNUV1BrRC9xd0Jualg4Qm9KOThWUU5jQys4QUFBQ3pTVVJCVkdnRjdaaEJDc013REFUanZzYi9mNDEvMDlM';
const URI2 =
    'akhzV1FiUU9UbThDUzRoa0xqTmZlKzMwTnZuUE9HaXkvN3E3L212ek1QNjUxQTcrMm9nRU5RQUllSVFnUXAyc0FJNFFGSG05Z2RLLzV3cnI3YmpPdC8zZ0RiZ0RPSUU3WEFFWUlDMmdBQXNUcEdzQUlZUUVOUUlBNGZVM3ZIcjRMWWVaWndCbElIdjFJQTMzbTJWRUR5YU1mYWFEUFBEdHFJSG4wSTkrRitzeXpvek9RUFBxUkJ2ck1zNk1Ha2tjLzBrQ2ZlWGJVUVBMb1J4K1lPeHRMdG4wd2lBQUFBQUJKUlU1RXJrSmdnZz09Ii8+PC9kZWZzPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9InVybCgjYikiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iLjEiLz48L3N2Zz4=';

const NAVIGATION_DESTINATION = 'comm__namedPage';

const BORDER_RIGHT_NONE = 'border-left: 0px !important;';
const BORDER_RIGHT = 'border-left: solid 1px #d8d8d8 !important;';

const SUN_PROTECTION_SPARE_PART_TYPE = 'Sun protection lens';
const SUN_PROTECTION_SPARE_PART_TYPE_GERMAN = 'Sonnenschutzglas';
const SEPERATOR_STRING = ' | ';
const LENSES_EN = 'Lenses';
const LENSES_DE = 'GLAESER';
const ENTITLEMENT_ERROR = 'entitlementerror';
const SEND_CART_ITEMS_DATA = 'sendCartItemsData'; //BS-2031
const UPDATE_CART_INFORMATION = 'updateCartInformation'; //BS-2031
const ICON_CONTAINER_UNENTITLED = 'icon-container-unentitled';
const BORDER_REQUIRED_FIELDS = 'required-field-highlight'; //BS-2031
const ICON_CONTAINER = 'icon-container';
const UNENTITLEPRODUCTS = 'unentitledproducts';
const BG_COLOR = 'background-color: ';
const LENS_SHAPE_ICON = '/icons/lens_shape.svg';
const ITEM_UNAVAILABLE_LABEL = B2B_Availability_Status_Labels.split(',')[1]; //BS-1568
const ONLY_SPARE_PART_AVAILABLE_LABEL = B2B_Availability_Status_Labels.split(',')[3]; //BS-1568
const FREE_PRODUCTS_COUNT_EVENT = 'freeproductscount';
const TEXTAREA_STYLING = 'textarea_styling'; //BS-2339
/**
 * A non-exposed component to display cart items.
 *
 * @fires Items#quantitychanged
 * @fires Items#singlecartitemdelete
 */
export default class Items extends NavigationMixin(LightningElement) {
    /**
     * An event fired when the quantity of an item has been changed.
     *
     * Properties:
     *   - Bubbles: true
     *   - Cancelable: false
     *   - Composed: true
     *
     * @event Items#quantitychanged
     * @type {CustomEvent}
     *
     * @property {string} detail.itemId
     *   The unique identifier of an item.
     *
     * @property {number} detail.quantity
     *   The new quantity of the item.
     *
     * @export
     */

    /**
     * An event fired when the user triggers the removal of an item from the cart.
     *
     * Properties:
     *   - Bubbles: true
     *   - Cancelable: false
     *   - Composed: true
     *
     * @event Items#singlecartitemdelete
     * @type {CustomEvent}
     *
     * @property {string} detail.cartItemId
     *   The unique identifier of the item to remove from the cart.
     *
     * @export
     */

    /**
     * A cart line item.
     *
     * @typedef {Object} CartItem
     *
     * @property {ProductDetails} productDetails
     *   Representation of the product details.
     *
     * @property {string} originalPrice
     *   The original price of a cart item.
     *
     * @property {number} quantity
     *   The quantity of the cart item.
     *
     * @property {string} totalPrice
     *   The total sales price of a cart item.
     *
     * @property {string} totalListPrice
     *   The total original (list) price of a cart item.
     *
     * @property {string} unitAdjustedPrice
     *   The cart item price per unit based on tiered adjustments.
     */

    /**
     * Details for a product containing product information
     *
     * @typedef {Object} ProductDetails
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
     *   The image of the cart line item
     *
     */

    /**
     * Image information for a product.
     *
     * @typedef {Object} ThumbnailImage
     *
     * @property {string} alternateText
     *  Alternate text for an image.
     *
     * @property {string} title
     *   The title of the image.
     *
     * @property {string} url
     *   The url of the image.
     */

    /**
     * The ISO 4217 currency code for the cart page
     *
     * @type {string}
     */
    @api
    currencyCode;

    /**
     * Country code recieved from b2b_c/b2b_cartContents associated with respective account
     *
     * @type {boolean}
     */
    @api
    countryCode;

    /**
     * Whether or not the cart is in a locked state
     *
     * @type {Boolean}
     */
    @api
    isCartDisabled = false;

    /**
     * Input parameter for component to run in cart mode
     *
     * @type {boolean}
     */
    @api
    isCartPage;

    /**
     * Input parameter for component to run in checkout mode
     *
     * @type {boolean}
     */
    @api
    isCheckoutPage;

    /**
     * A list of CartItems
     *
     * @type {CartItem[]}
     */
    @api
    get cartItems() {
        return this._providedItems;
    }

    /**
     * Shipping picklist field values fetched from Product2 Object received by c/b2b_cartContents
     *
     * @type {boolean}
     */
    @api
    shippingPicklistValues;

    /**
     * A list of cartItems with details
     *
     * @type {array[]}
     */
    @track
    _cartInformation = [];

    /**
     * A list of CartItem details returns after DML of Customer Reference and Entered By Value
     *
     * @type {array[]}
     */
    _latestCartItemData = [];

    /**
     * A list of Product details fetched via Apex for respective Product Id
     *
     * @type {array[]}
     */
    _productData = [];

    /**
     * A Map of Cart Item data with values entered by user via UI
     *
     * @type {Map}
     */
    _cartItemDataToUpdate = new Map();

    /**
     * A Boolean that states if the Cross button is clicked
     *
     * @type {Boolean}
     */
    _crossClicked = false;

    /**
     * A normalized collection of items suitable for display.
     *
     * @private
     */
    @track
    _items = [];

    @track
    _totalAdditionalCartPriceRX = 0;

    // Start BS-1090
    //Used for getting the entitled products for SH/EE Cart

    @api
    effectiveAccountId;

    @api
    isEntitlementErrorPopup = false;

    @api
    isEntitlementErrorCss;

    @track
    _entitledCartProductsIdList = [];

    @api
    unEntitledCartProductsIdList = [];

    // END BS-1090

    /**
     * variable that contains the list of standard cart items for rx
     * BS-1094
     */
    @api
    cartItemIds;

    /**
     * A list of provided cart items
     *
     * @private
     */
    _providedItems;

    /**
     * A Promise-resolver to invoke when the component is a part of the DOM.
     *
     * @type {Function}
     * @private
     */
    _connectedResolver;

    /**
     * A Promise that is resolved when the component is connected to the DOM.
     *
     * @type {Promise}
     * @private
     */
    _canResolveUrls = new Promise((resolved) => {
        this._connectedResolver = resolved;
    });

    _transparentURI;
    _customMetadataColors = new Map();
    _attributeColorMap = new Map();
    _frameColorLabel;
    _lensColorLabel = COLOR_LABEL.split(',')[1];
    _productIdVsColorDetailsMap = new Map();
    _finishLabel = FINISH_LABEL;
    _border = BORDER_RIGHT_NONE;

    _productTypeList; //BS-1137
    _productIdVsIsFrameMap; //BS-1568

    @track
    _isUSTenant = false; //BS-2031

    _isRequiredFieldValidationMsg; //BS-2031
    _isRequiredFieldValidation = false; //BS-2031

    /**
     * An object with the current PageReference.
     * This is needed for the pubsub library.
     *
     * @type {PageReference}
     */
    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        this.pageRef = pageRef;
    }

    @api
    hidePurchasePriceFieldValue;

    get hidePurchasePriceField() {
        if (this.hidePurchasePriceFieldValue != undefined) {
            return this.hidePurchasePriceFieldValue;
        }
        return true;
    }

    /**
     * Labels needed to be displayed on UI
     *
     */
    _prodcutSkuLabel;
    _productColorLabel;
    _productSizeLabel;
    _productPricePerUnitLabel;
    _quantityHeaderLabel;
    _totalPriceLabel;
    _deliveryTimeLabel;
    _customerReferenceLabel;
    _saveButtonLabel;
    _enteredByLabel;
    _readyToShipLabel;
    _shapeSizeLabel;
    _lensSizeLabel = LENS_SIZE;
    _bridgeSizeLabel;
    _templeLengthLabel;
    _pageSourcePDP = true;
    _deleteIcon = STORE_STYLING + '/icons/remove-from-cart.svg'; //BS-1456 Made SH/EE cart item delete icon as per RX cart item delete icon
    _deleteIconWarning = STORE_STYLING + '/icons/delete.svg';
    _removeProductLabel = REMOVE_LABEL.split(',')[1];
    _removeLabel = REMOVE_LABEL.split(',')[0];
    _subtotal = 0;
    _subtotalLabel;
    productSizeLabelEE;
    _clearCartPopupCancel; //BS-1090
    _warningLabel; //BS-1090
    _lensShapeLabel = B2B_SH_EE_LENS_SHAPE; //BS-1431
    _unAvailablePrice = PLP_LABELS.split(',')[0]; //BS-1951
    priceUnavailableTitle = B2B_MISSING_PRICE_LABELS.split(',')[2]; //BS-1951
    _characterLimit = 50; //BS-2339
    _orderRemarkHelpText = ORDER_REMARK_FIELD_HELPTEXT; //BS-2437
    _infoSVG = STORE_STYLING + '/icons/INFO.svg'; //BS-2437
    _consumerReferenceHelpText = CONSUMER_REFERENCE_FIELD_HELPTEXT; //BS-2437
    /**
     * Method is use to set the label values from custom label
     *
     */
    createLabels() {
        this._prodcutSkuLabel = CART_ITEM_LABELS.split(',')[5];
        this._productColorLabel = CART_ITEM_LABELS.split(',')[6];
        this._productSizeLabel = CART_ITEM_LABELS.split(',')[7];
        this._productPricePerUnitLabel = CART_ITEM_LABELS.split(',')[8];
        this._quantityHeaderLabel = CART_ITEM_LABELS.split(',')[9];
        this._totalPriceLabel = CART_ITEM_LABELS.split(',')[10];
        this._deliveryTimeLabel = CART_ITEM_LABELS.split(',')[11];
        this._customerReferenceLabel = CART_ITEM_LABELS.split(',')[12];
        this._saveButtonLabel = CART_ITEM_LABELS.split(',')[13];
        this._enteredByLabel = CART_ITEM_LABELS.split(',')[14];
        this._readyToShipLabel = CART_ITEM_LABELS.split(',')[15];
        this._shapeSizeLabel = CART_ITEM_LABELS.split(',')[16];
        this._bridgeSizeLabel = CART_ITEM_LABELS.split(',')[17];
        this._templeLengthLabel = CART_ITEM_LABELS.split(',')[18];
        this._subtotalLabel = B2B_EE_RX_CART_LABELS.split(',')[0];
        this.productSizeLabelEE = B2B_EE_RX_CART_LABELS.split(',')[5];
        this._clearCartPopupCancel = CART_CONTENTS_LABELS.split(',')[22]; //BS-1090
        this._warningLabel = UNENTITLED_WARNING_LABEL;
    }

    /**
     * getter for bridge size icon
     *
     */
    get bridgeSize() {
        let auxBridge;
        auxBridge = {
            icon: STORE_STYLING + '/icons/SH_BridgeSize.jpg'
        };
        return auxBridge;
    }

    get showSubtotal() {
        if (this._subtotalLabel > 0) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * getter for stock Available icon
     *
     */
    get stockAvailable() {
        let stockAvailableIcon;
        stockAvailableIcon = {
            icon: STORE_STYLING + '/icons/Available.svg'
        };
        return stockAvailableIcon;
    }

    /**
     * getter for stock Not Available icon
     *
     */
    get stockNotAvailable() {
        let stockNotAvailableIcon;
        stockNotAvailableIcon = {
            icon: STORE_STYLING + '/icons/Not_Available.svg'
        };
        return stockNotAvailableIcon;
    }

    /**
     * getter for lensSize icon
     *
     */
    get lensSize() {
        let auxLens;
        auxLens = {
            icon: STORE_STYLING + '/icons/SH_LensSize.jpg'
        };
        return auxLens;
    }

    /**
     * BS-1431 getter for lensSize icon
     *
     */
    get lensShape() {
        let auxLens;
        auxLens = {
            icon: STORE_STYLING + LENS_SHAPE_ICON
        };
        return auxLens;
    }

    /**
     * getter for temple Length icon
     *
     */
    get templeLength() {
        let auxTemple;
        auxTemple = {
            icon: STORE_STYLING + '/icons/SH_TempleLength.jpg'
        };
        return auxTemple;
    }

    /**
     * setter for _cartInformation through cart item details recieved from c/b2b_cartContents
     *
     */
    set cartItems(items) {
        // Commenting below function invocation as a performace improvement as part of BS-1409
        // Will uncomment this in future if needed
        //this.fireDoLoad(true);
        //this.getProductDeatilsFromCart(items);
    }

    @api
    cartItemData; //BS-1409

    getDeliveryInformation(deliveryTimeJSON, isSparePartOnlyFrameFlag) {
        if (deliveryTimeJSON != null && deliveryTimeJSON != undefined && deliveryTimeJSON != '') {
            const deliveryInformationCollection = {};
            deliveryInformationCollection.status = getDeliveryTime(deliveryTimeJSON, this.shippingPicklistValues, this.countryCode);
            /*Start : BS-1568*/
            if (isSparePartOnlyFrameFlag && deliveryInformationCollection.status === ITEM_UNAVAILABLE_LABEL) {
                deliveryInformationCollection.status = ONLY_SPARE_PART_AVAILABLE_LABEL;
            }
            /*End : BS-1568*/
            deliveryInformationCollection.styling = getApplicableAvailabilityStatusIcon(deliveryInformationCollection.status);
            return deliveryInformationCollection;
        } else {
            return null;
        }
    }

    /**
     * This lifecycle hook fires when this component is inserted into the DOM.
     */
    async connectedCallback() {
        this._isRequiredFieldValidationMsg = B2B_Textbox_White_Space_Error; //BS-2031
        if (B2B_REQUIRED_END_CONSUMER_ORDER_REMARK_CART.includes(this.countryCode)) {
            this._isUSTenant = true;
        }
        // Once connected, resolve the associated Promise.
        this._frameColorLabel = PDP_LABELS.split(',')[7];
        let result = await getColorsMetadata({});
        if (result !== null && result !== undefined) {
            this._customMetadataColors = new Map(Object.entries(JSON.parse(result)));
        }
        if (this.isCheckoutPage) {
            this._border = BORDER_RIGHT;
        }
        this._transparentURI = URI1 + URI2;
        this._connectedResolver();
        this.createLabels();
        registerListener(ENTITLEMENT_ERROR, this.handleEntitlementError, this); //BS-1090
        registerListener(UPDATE_CART_INFORMATION, this.handleCartItemsData, this); //BS-2031
        //BS-1409
        this.fireDoLoad(true);
        this.fireInitialLoadComplete(true);
        if (this.cartItemData && Object.keys(this.cartItemData).length == 0) {
            this.fireInitialLoadComplete(true);
            this.fireDoLoad(false);
        } else {
            this.getProductDeatilsFromCart(this.cartItemData);
        }
        //BS-1409
    }

    //BS-2031
    handleCartItemsData(updatedCartData) {
        this._cartInformation.forEach((item) => {
            item._isEndConsumerEmpty =
                item.Customer_Reference__c !== undefined && item.Customer_Reference__c !== null && item.Customer_Reference__c !== '' ? false : true;
            item._isOrderRemarkEmpty = item.Entered_By__c !== undefined && item.Entered_By__c !== null && item.Entered_By__c !== '' ? false : true;
            item._endConsumerCSS =
                item.Customer_Reference__c !== undefined && item.Customer_Reference__c !== null && item.Customer_Reference__c !== ''
                    ? ''
                    : BORDER_REQUIRED_FIELDS;
            item._orderRemarkCSS = item.Entered_By__c !== undefined && item.Entered_By__c !== null && item.Entered_By__c !== '' ? '' : BORDER_REQUIRED_FIELDS;
        });
    }

    /**
     * This lifecycle hook fires after a component has finished the rendering phase.
     */
    renderedCallback() {
        // Commenting below function invocation as a performace improvement as part of BS-1409
        // Will uncomment this in future if needed
        //this.fireDoLoad(false);
    }

    /**
     * This lifecycle hook fires when this component is removed from the DOM.
     */
    disconnectedCallback() {
        // We've beeen disconnected, so reset our Promise that reflects this state.
        this._canResolveUrls = new Promise((resolved) => {
            this._connectedResolver = resolved;
        });
    }

    /**
     * Handler for the 'click' event fired from 'contents'
     *
     * @param {Object} evt the event object
     */
    handleProductDetailNavigation(evt) {
        evt.preventDefault();
        const productId = evt.target.dataset.productid;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: productId,
                actionName: 'view'
            }
        });
    }

    /**
     * Fires an event to load a spinner
     * @param {event}
     * @fires Items#loadevent
     */
    fireDoLoad(isLoading) {
        this.dispatchEvent(
            new CustomEvent(LOADING_EVENT, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    isLoading
                }
            })
        );
    }

    /**
     * BS-1409
     * Fires an event to stop the loader as initial setup of component is completed
     * @param {event}
     * @fires Items#loadevent
     */
    fireInitialLoadComplete(isLoadingComplete) {
        this.dispatchEvent(
            new CustomEvent(INITIAL_LOADING_EVENT, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    isLoadingComplete
                }
            })
        );
    }

    /**
     * Fires an event to update cart header count
     * @param {event}
     * @fires Items#updatecartheadercount
     */
    fireUpdateCartHeaderCount(totalCount) {
        this.dispatchEvent(
            new CustomEvent(UPDATE_CART_HEADER_COUNT, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    totalCount
                }
            })
        );
    }
    //Added as a part of BS-1090
    handleEntitlementError(entitlementError) {
        this.fireDoLoad(true);
        this.isEntitlementErrorCss = entitlementError;
        this.isCartPage = false;
        this.isCartPage = true;
        if (this.unEntitledCartProductsIdList.length > 0) {
            this.isEntitlementErrorCss = true;
            this.isEntitlementErrorPopup = true;
            this.dispatchEvent(
                new CustomEvent('entitlementtaberror', {
                    detail: {
                        unentitledproductsList: this.unEntitledCartProductsIdList,
                        showenentitledpopupcss: true
                    }
                })
            );
        }
    }

    async handleDeleteUnentitledProducts() {
        this.fireDoLoad(true);
        await deleteCartItem({
            productIdList: this.unEntitledCartProductsIdList
        }).then((result) => {
            this.isEntitlementErrorPopup = false;
            this.isEntitlementErrorCss = false;
            window.location.reload();
            this.fireDoLoad(false);
        });
    }

    handleDialogClose() {
        this.fireDoLoad(true);
        this.isEntitlementErrorPopup = false;
        this.isEntitlementErrorCss = false;
        this.getProductDeatilsFromCart(this._cartInformation);
    }

    /**
     * Fires an event to delete a single cart item
     */
    openPopupForDelete(event) {
        const cartItemId = event.target.dataset.cartitemid;
        this.dispatchEvent(
            new CustomEvent(POPUP_FOR_DELETE, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    cartItemId
                }
            })
        );
    }

    /**
     * Fires an event to update the cart item quantity
     * @param {FocusEvent} blurEvent A blur event.
     * @fires Items#quantitychanged
     */
    handleQuantitySelectorBlur(blurEvent) {
        const cartItemId = blurEvent.target.dataset.itemId;
        let cartQuantity = blurEvent.target.value;
        let inputTagId = cartItemId + 'quantity';
        if (cartQuantity == 1) {
            this.template.querySelector(`[data-id="${inputTagId}"]`).disabled = true;
        } else {
            this.template.querySelector(`[data-id="${inputTagId}"]`).disabled = false;
        }

        blurEvent.stopPropagation();
        if (blurEvent.target.validity.valid && blurEvent.target.value) {
            const cartItemId = blurEvent.target.dataset.itemId;
            const quantity = blurEvent.target.value;
            this.fireDoLoad(true);
            this.dispatchEvent(
                new CustomEvent(QUANTITY_CHANGED_EVT, {
                    bubbles: true,
                    composed: true,
                    cancelable: false,
                    detail: {
                        cartItemId,
                        quantity
                    }
                })
            );
        } else {
            blurEvent.target.reportValidity();
        }
    }

    /**
     * Checking user input value if it is more than 10000 or less than 1
     * and firing an event to disable the proceed to checkout button accordingly.
     */
    handleSelectedQuantitychange(evt) {
        this.selectedQuantityCount = evt.target.value;
        if (this.selectedQuantityCount <= 0 || this.selectedQuantityCount >= 10000) {
            fireEvent(this.pageRef, DISABLED_CHECKOUT_BUTTON, true);
        } else {
            fireEvent(this.pageRef, DISABLED_CHECKOUT_BUTTON, false);
        }
    }

    /**
     * Fires an event to update the cart item quantity on click of button
     * @param {event}
     * @fires Items#quantitychanged
     */
    manipulateQuantity(event) {
        const cartItemId = event.target.dataset.itemId;
        let cartQuantity = event.target.dataset.quantity;
        let inputTagId = cartItemId + 'quantity';
        if (event.target.value == '+') {
            cartQuantity++;
            this.template.querySelector(`[data-id="${inputTagId}"]`).disabled = false;
        } else {
            cartQuantity--;
            if (cartQuantity == 1) {
                this.template.querySelector(`[data-id="${inputTagId}"]`).disabled = true;
            } else {
                this.template.querySelector(`[data-id="${inputTagId}"]`).disabled = false;
            }
        }

        const quantity = cartQuantity;
        if (quantity >= MIN_QUANTITY_ALLOWED && quantity <= MAX_QUANTITY_ALLOWED) {
            this.fireDoLoad(true);
            this.dispatchEvent(
                new CustomEvent(QUANTITY_CHANGED_EVT, {
                    bubbles: true,
                    composed: true,
                    cancelable: false,
                    detail: {
                        cartItemId,
                        quantity
                    }
                })
            );
        }
    }

    /**
     * Handler to capture and store value entered for Customer Reference and performing DML via apex
     * @param {event}
     */
    handleSaveCustomerReference(event) {
        const cartItemId = event.target.dataset.itemId;
        let customerReferenceValue;
        customerReferenceValue = this._cartItemDataToUpdate.get(cartItemId).customerReference;
        this.fireDoLoad(true);
        updateCartItemData({ cartItemId: cartItemId, customerReference: customerReferenceValue, enteredBy: null, mode: CUSTOMER_REFERENCE_VALUE })
            .then((result) => {
                this._latestCartItemData = JSON.parse(JSON.stringify(result));
                this.fireDoLoad(false);
            })
            .catch((error) => {
                this.error = error;
                this.fireDoLoad(false);
            });
    }

    /**
     * handler to store Customer Reference value entered
     * @param {event}
     */
    handleOnCustomerReferenceValueChange(event) {
        const cartItemId = event.target.dataset.itemId;
        let customerReferenceValue = event.target.value;
        if (this._cartItemDataToUpdate.has(cartItemId)) {
            this._cartItemDataToUpdate.get(cartItemId).customerReference = customerReferenceValue;
        } else {
            this._cartItemDataToUpdate.set(cartItemId, { customerReference: customerReferenceValue });
        }
    }

    /**
     * handler to store Entered By value entered
     * @param {event}
     */
    handleOnEnteredbyValueChange(event) {
        const cartItemId = event.target.dataset.itemId;
        let enteredbyValue = event.target.value;
        if (this._cartItemDataToUpdate.has(cartItemId)) {
            this._cartItemDataToUpdate.get(cartItemId).enteredBy = enteredbyValue;
        } else {
            this._cartItemDataToUpdate.set(cartItemId, { enteredBy: enteredbyValue });
        }
    }

    /**
     * Handler to capture and store value entered for Entered By and performing DML via apex
     * @param {event}
     */
    handleSaveCustomerInformation(event) {
        const cartItemId = event.target.dataset.itemId;
        let enteredByValue = this._cartItemDataToUpdate.get(cartItemId).enteredBy;
        let customerReferenceValue = this._cartItemDataToUpdate.get(cartItemId).customerReference;
        this.fireDoLoad(true);
        updateCartItemData({ cartItemId: cartItemId, customerReference: customerReferenceValue, enteredBy: enteredByValue })
            .then((result) => {
                this._latestCartItemData = JSON.parse(JSON.stringify(result));
                //BS-2031
                if (this._latestCartItemData && this._isUSTenant == true) {
                    this._cartInformation.forEach((item) => {
                        if (item.cartItem.cartItemId === this._latestCartItemData[0].Id) {
                            if (this._latestCartItemData[0].Customer_Reference__c !== undefined && this._latestCartItemData[0].Customer_Reference__c !== null) {
                                item._isEndConsumerEmpty =
                                    this._latestCartItemData[0].Customer_Reference__c !== undefined &&
                                    this._latestCartItemData[0].Customer_Reference__c !== null &&
                                    this._latestCartItemData[0].Customer_Reference__c !== ''
                                        ? false
                                        : true;
                                item.Customer_Reference__c = this._latestCartItemData[0].Customer_Reference__c;
                                item._endConsumerCSS =
                                    this._latestCartItemData[0].Customer_Reference__c !== undefined &&
                                    this._latestCartItemData[0].Customer_Reference__c !== null &&
                                    this._latestCartItemData[0].Customer_Reference__c !== ''
                                        ? ''
                                        : BORDER_REQUIRED_FIELDS + ' ' + TEXTAREA_STYLING;
                            }

                            if (this._latestCartItemData[0].Entered_By__c !== undefined && this._latestCartItemData[0].Entered_By__c !== null) {
                                item._isOrderRemarkEmpty =
                                    this._latestCartItemData[0].Entered_By__c !== undefined &&
                                    this._latestCartItemData[0].Entered_By__c !== null &&
                                    this._latestCartItemData[0].Entered_By__c !== ''
                                        ? false
                                        : true;
                                item.Entered_By__c = this._latestCartItemData[0].Entered_By__c;
                                item._orderRemarkCSS =
                                    this._latestCartItemData[0].Entered_By__c !== undefined &&
                                    this._latestCartItemData[0].Entered_By__c !== null &&
                                    this._latestCartItemData[0].Entered_By__c !== ''
                                        ? ''
                                        : BORDER_REQUIRED_FIELDS + ' ' + TEXTAREA_STYLING;
                            }
                        }
                    });
                    fireEvent(this.pageRef, SEND_CART_ITEMS_DATA, this._cartInformation);
                }

                this.fireDoLoad(false);
            })
            .catch((error) => {
                this.error = error;
                this.fireDoLoad(false);
            });
    }

    /**
     * This method gets invoked from c/b2b_cartContents for updating the Cart Item data after modification like quantity change
     * @param cartItemUpdatedDetailsevent : Cart Item details recieved from c/b2b_cartContents
     * @fires fireUpdateCartHeaderCount : Event is fire to update Cart header count
     */
    @api
    updateCartItem(cartItemUpdatedDetails) {
        if (this._cartInformation) {
            const updatedCartItems = (this._cartInformation || []).map((item) => {
                // Make a copy of the cart item so that we can mutate it
                let updatedItem = { ...item };

                if (item.cartItem.cartItemId == cartItemUpdatedDetails.cartItemId) {
                    let oldCartItem = { ...item.cartItem };
                    oldCartItem.quantity = cartItemUpdatedDetails.quantity;
                    if (Number(cartItemUpdatedDetails.totalPrice) < 0) {
                        oldCartItem.totalListPrice = 0;
                        oldCartItem.totalPrice = 0;
                    } else {
                        oldCartItem.totalListPrice = cartItemUpdatedDetails.totalListPrice;
                        oldCartItem.totalPrice = cartItemUpdatedDetails.totalPrice;
                    }

                    if (this._cartItemDataToUpdate.has(item.cartItem.cartItemId)) {
                        updatedItem.Customer_Reference__c = this._cartItemDataToUpdate.get(item.cartItem.cartItemId).customerReference;
                        updatedItem.Entered_By__c = this._cartItemDataToUpdate.get(item.cartItem.cartItemId).enteredBy;
                    }
                    updatedItem.cartItem = oldCartItem;
                }
                return updatedItem;
            });
            this._cartInformation = updatedCartItems;

            this._subtotal = 0;
            let count = 0;
            this._cartInformation.forEach((item) => {
                count += Number(item.cartItem.quantity);
                this._subtotal = Number(this._subtotal) + Number(item.cartItem.totalPrice);
            });
            this.fireUpdateCartHeaderCount(count);
        }
    }

    /**
     * This method use to get delivery time label from input JSON provided and gets invoked while setting data in _cartInformation[] wrapper
     * @param deliveryTime : JSON data contaning information of delivery time
     * @return returnLabel : Label contaning readable value of delivery time needed (Example:- Available withing 'x' working days)
     */
    getDeliveryTime(deliveryTime) {
        let returnLabel = '';
        if (JSON.stringify(this.shippingPicklistValues) !== '{}' && this.countryCode && deliveryTime) {
            this.shippingPicklistValues.data.values.forEach((element) => {
                if (element.value == deliveryTime[this.countryCode.substring(0, 4)]) {
                    returnLabel = element.label;
                }
            });
        }
        return returnLabel;
    }

    async getColorMetadata() {
        if (this._productData != null) {
            let colorsMap = [
                { apiName: LENS_COLOR, colorsList: [] },
                { apiName: FRAME_COLOR, colorsList: [] }
            ];
            for (let element of this._customMetadataColors.values()) {
                let backgroundStyle = STYLE_DISPLAY_NONE;
                colorsMap.forEach((color) => {
                    color.colorsList.push({
                        colorName: element.Label,
                        colorHex: element.B2B_Color_code__c,
                        colorStyle: backgroundStyle,
                        transparent: element.B2B_Color_name__c == TRANSPARENT ? true : false
                    });
                });
            }
            for (var productKey in this._productData) {
                let productColorDetailObj = {};
                if (this._productData[productKey].B2B_Lens_Color__c != null) {
                    colorsMap[0].colorsList.forEach((color) => {
                        if (color.colorName == this._productData[productKey].B2B_Lens_Color__c) {
                            if (color.transparent) {
                                this._attributeColorMap.set(LENS_COLOR, 'background: url(' + this._transparentURI + ')');
                                productColorDetailObj = { ...productColorDetailObj, B2B_Lens_Color__c: 'background: url(' + this._transparentURI + ')' };
                            } else {
                                this._attributeColorMap.set(LENS_COLOR, 'background: ' + color.colorHex);
                                productColorDetailObj = { ...productColorDetailObj, B2B_Lens_Color__c: 'background: ' + color.colorHex };
                            }
                        }
                    });
                }
                if (this._productData[productKey].B2B_Frame_Color__c != null) {
                    colorsMap[1].colorsList.forEach((color) => {
                        if (color.colorName == this._productData[productKey].B2B_Frame_Color__c) {
                            if (color.transparent) {
                                this._attributeColorMap.set(FRAME_COLOR, 'background: url(' + this._transparentURI + ')');
                                productColorDetailObj = { ...productColorDetailObj, B2B_Frame_Color__c: 'background: url(' + this._transparentURI + ')' };
                            } else {
                                this._attributeColorMap.set(FRAME_COLOR, 'background: ' + color.colorHex);
                                productColorDetailObj = { ...productColorDetailObj, B2B_Frame_Color__c: 'background: ' + color.colorHex };
                            }
                        }
                    });
                }
                this._productIdVsColorDetailsMap.set(this._productData[productKey].Id, productColorDetailObj);
            }
        }
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

    async getProductDeatilsFromCart(items) {
        const generatedUrls = [];
        let parsedCartItems = [];
        let cartItemIds = [];
        let productIds = [];
        if (items) {
            items.forEach((item) => {
                cartItemIds.push(item.cartItem.cartItemId);
                productIds.push(item.cartItem.productDetails.productId);
            });
            //Start BS-1090
            if (this.effectiveAccountId != undefined) {
                if (productIds.length != 0) {
                    await getEntitledProducts({
                        effectiveAccountId: this.effectiveAccountId
                    })
                        .then((result) => {
                            let entitledProductsIdList = result;
                            this.unEntitledCartProductsIdList = [];
                            this._entitledCartProductsIdList = [];
                            for (let iterator = 0; iterator < productIds.length; iterator++) {
                                if (entitledProductsIdList.includes(productIds[iterator])) {
                                    this._entitledCartProductsIdList.push(productIds[iterator]);
                                } else {
                                    this.unEntitledCartProductsIdList.push(productIds[iterator]);
                                }
                            }
                            if (this.unEntitledCartProductsIdList.length > 0) {
                                fireEvent(this.pageRef, UNENTITLEPRODUCTS, this.unEntitledCartProductsIdList);
                            } else {
                                fireEvent(this.pageRef, UNENTITLEPRODUCTS, this.unEntitledCartProductsIdList);
                            }
                        })
                        .catch((error) => {
                            this.error = error;
                        });
                }
            }
            //END BS-1090
            await getCartItemData({ cartItemIdList: cartItemIds }).then(async (result) => {
                this.updatedCartItemDetails = JSON.parse(JSON.stringify(result));
                await getProductDetails({ productIdList: productIds })
                    .then(async (result) => {
                        // BS-1137
                        await getProductType({ productIdList: productIds }).then((result) => {
                            if (result != null && result != undefined) {
                                this._productTypeList = result;
                            }
                        });
                        /*Start : BS-1568*/
                        await checkSparePartsOnlyFrames({ productIdList: productIds, isSilhouetteStore: true })
                            .then((result) => {
                                if (result != null && result != undefined) {
                                    this._productIdVsIsFrameMap = result;
                                }
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                        /*End : BS-1568*/
                        this._productData = JSON.parse(JSON.stringify(result));
                        this.getColorMetadata();
                        items.forEach((item) => {
                            let newItem = { ...item };
                            let oldCartItem = { ...item.cartItem };

                            newItem.productImageUrl = resolve(item.cartItem.productDetails.thumbnailImage.url);
                            newItem.productImageAlternativeText = item.cartItem.productDetails.thumbnailImage.alternateText || '';
                            newItem.stockAvailable = false;
                            newItem.LensSize =
                                item.cartItem.productDetails.variationAttributes.B2B_Lens_Size__c != null
                                    ? item.cartItem.productDetails.variationAttributes.B2B_Lens_Size__c.value
                                    : null;
                            newItem.BridgeSize =
                                item.cartItem.productDetails.variationAttributes.B2B_Bridge_Size__c != null
                                    ? item.cartItem.productDetails.variationAttributes.B2B_Bridge_Size__c.value
                                    : null;
                            newItem.TempleLength =
                                item.cartItem.productDetails.variationAttributes.B2B_Temple_Length__c != null
                                    ? item.cartItem.productDetails.variationAttributes.B2B_Temple_Length__c.value
                                    : null;
                            newItem.backgroundColorUpper =
                                item.cartItem.productDetails.fields.B2B_Hexcode__c != null
                                    ? BG_COLOR + item.cartItem.productDetails.fields.B2B_Hexcode__c
                                    : false;
                            newItem.backgroundColorLower =
                                item.cartItem.productDetails.fields.B2B_Hexcode_Accent__c != null
                                    ? BG_COLOR + item.cartItem.productDetails.fields.B2B_Hexcode_Accent__c
                                    : item.cartItem.productDetails.fields.B2B_Hexcode_Accent__c != null
                                    ? BG_COLOR + item.cartItem.productDetails.fields.B2B_Hexcode_Accent__c
                                    : false;
                            newItem.disableDecreaseQuantity = item.cartItem.quantity == 1 || this.isCheckoutPage ? true : false;

                            if (newItem.backgroundColorLower === false && newItem.backgroundColorUpper) {
                                newItem.backgroundColorLower = newItem.backgroundColorUpper;
                            }
                            if (newItem.backgroundColorUpper === false && newItem.backgroundColorLower) {
                                newItem.backgroundColorUpper = newItem.backgroundColorLower;
                            }
                            newItem.productLink =
                                item.cartItem.productDetails.fields.B2B_Picture_Link__c != null
                                    ? item.cartItem.productDetails.fields.B2B_Picture_Link__c
                                    : item.cartItem.productImageUrl;

                            if (item.cartItem.unitAdjustedPrice) {
                                newItem.priceAvailable = true;
                            } else {
                                newItem.priceAvailable = false;
                            } //BS-1951

                            if (item.cartItem.productDetails.fields.ProductClass) {
                                if (item.cartItem.productDetails.fields.ProductClass === SIMPLE_PRODUCT_CLASS) {
                                    newItem.productClass = false;
                                } else {
                                    newItem.productClass = item.cartItem.productDetails.fields.ProductClass;
                                }
                            }
                            if (item.cartItem.productDetails.sku) {
                                newItem.frameColorValue = item.cartItem.productDetails.sku != null ? item.cartItem.productDetails.sku.substring(7, 11) : false;
                            }
                            const urlGenerated = this._canResolveUrls
                                .then(() =>
                                    this[NavigationMixin.GenerateUrl]({
                                        type: 'standard__recordPage',
                                        attributes: {
                                            recordId: item.cartItem.productId,
                                            objectApiName: 'Product2',
                                            actionName: 'view'
                                        }
                                    })
                                )
                                .then((url) => {
                                    newItem.productUrl = url;
                                });

                            generatedUrls.push(urlGenerated);
                            newItem.showNegotiatedPrice = this.showNegotiatedPrice && (item.cartItem.totalPrice || '').length > 0;
                            newItem.showOriginalPrice = displayOriginalPrice(
                                this.showNegotiatedPrice,
                                this.showOriginalPrice,
                                item.cartItem.totalPrice,
                                item.cartItem.totalListPrice
                            );
                            for (var productKey in this._productData) {
                                if (productKey == item.cartItem.productDetails.productId) {
                                    newItem.deliveryTimeJSON =
                                        this._productData[productKey].B2B_Shipping_Status_JSON__c != null
                                            ? this.getDeliveryInformation(
                                                  this._productData[productKey].B2B_Shipping_Status_JSON__c,
                                                  this._productIdVsIsFrameMap[this._productData[productKey].Id]
                                              )
                                            : null; //Updated as part of BS-1568
                                    //BS-1401 Start
                                    if (this._productData[productKey].Name != null && this._productData[productKey].Name != undefined) {
                                        newItem.displayName = this._productData[productKey].Name;
                                    } else {
                                        newItem.displayName = this._productData[productKey].Name;
                                    }
                                    //BS-1401 End
                                    if (this._productData[productKey].B2B_Finish__c != null) {
                                        newItem.finish = this._productData[productKey].B2B_Finish__c;
                                    }
                                    if (this._productData[productKey].B2B_Temple_Length__c != null) {
                                        newItem.templeLength = this._productData[productKey].B2B_Temple_Length__c;
                                    }
                                    if (this._productData[productKey].B2B_Bridge_Size__c != null) {
                                        newItem.bridgeSize = this._productData[productKey].B2B_Bridge_Size__c;
                                    }
                                    if (this._productData[productKey].B2B_Lens_Size__c != null) {
                                        newItem.lensSize = this._productData[productKey].B2B_Lens_Size__c;
                                    }
                                    if (this._productData[productKey].B2B_EE_Size__c != null) {
                                        newItem.eeSize = this._productData[productKey].B2B_EE_Size__c;
                                    }
                                    if (
                                        this._productData[productKey].B2B_Brand__c != null &&
                                        this._productData[productKey].B2B_Brand__c === B2B_EE_BRAND_API_NAME_05
                                    ) {
                                        newItem.isEvilEyeProduct = true;
                                    } else {
                                        newItem.isEvilEyeProduct = false;
                                    }
                                    if (this._productData[productKey].B2B_Model__c != null) {
                                        newItem.model = this._productData[productKey].B2B_Model__c;
                                    }
                                    if (this._productData[productKey].B2B_Shape_Size__c != null) {
                                        newItem.shapeSize = this._productData[productKey].B2B_Shape_Size__c;
                                    }
                                    if (this._productData[productKey].B2B_Frame_Color_Description__c != null) {
                                        newItem.frameColorDescription = this._productData[productKey].B2B_Frame_Color_Description__c;
                                    }
                                    if (this._productData[productKey].B2B_Lens_Color_Description__c != null) {
                                        newItem.lensColorDescription = this._productData[productKey].B2B_Lens_Color_Description__c;
                                    }
                                    if (this._productData[productKey].B2B_Design_Family__c != null) {
                                        newItem.collectionDesignFamily = this._productData[productKey].B2B_Design_Family__c;
                                    }
                                    if (this._productData[productKey].B2B_Lens_Color__c != null) {
                                        newItem.lensColor = this._productIdVsColorDetailsMap.has(this._productData[productKey].Id)
                                            ? this._productIdVsColorDetailsMap.get(this._productData[productKey].Id)[LENS_COLOR] != undefined
                                                ? this._productIdVsColorDetailsMap.get(this._productData[productKey].Id)[LENS_COLOR]
                                                : false
                                            : false;
                                    }
                                    if (this._productData[productKey].B2B_Frame_Color__c != null) {
                                        newItem.frameColor = this._productIdVsColorDetailsMap.has(this._productData[productKey].Id)
                                            ? this._productIdVsColorDetailsMap.get(this._productData[productKey].Id)[FRAME_COLOR] != undefined
                                                ? this._productIdVsColorDetailsMap.get(this._productData[productKey].Id)[FRAME_COLOR]
                                                : false
                                            : false;
                                    }
                                    if (item.cartItem.cartItemId != null) {
                                        newItem.quantityInputId = item.cartItem.cartItemId + 'quantity';
                                    }
                                    if (
                                        this._productData[productKey].B2B_Lens_Color_Description__c == null &&
                                        this._productData[productKey].B2B_Lens_Color__c == null
                                    ) {
                                        newItem.noLensColorValues = true;
                                    } else {
                                        newItem.noLensColorValues = false;
                                    }

                                    if (
                                        this._productData[productKey].B2B_Sparepart_Type__c != undefined &&
                                        this._productData[productKey].B2B_Brand__c != undefined &&
                                        this._productData[productKey].B2B_Product_Type__c != undefined &&
                                        this._productData[productKey].B2B_Sparepart_Type__c != null &&
                                        this._productData[productKey].B2B_Brand__c != null &&
                                        this._productData[productKey].B2B_Product_Type__c != null &&
                                        (this._productData[productKey].B2B_Sparepart_Type__c == SUN_PROTECTION_SPARE_PART_TYPE ||
                                            this._productData[productKey].B2B_Sparepart_Type__c == SUN_PROTECTION_SPARE_PART_TYPE_GERMAN) &&
                                        this._productData[productKey].B2B_Brand__c == B2B_EE_BRAND_API_NAME_05 &&
                                        (this._productData[productKey].B2B_Product_Type__c == LENSES_DE ||
                                            this._productData[productKey].B2B_Product_Type__c == LENSES_EN)
                                    ) {
                                        newItem.showEvilEyeLensDeatils = true;
                                    } else {
                                        newItem.showEvilEyeLensDeatils = false;
                                    }

                                    //BS-1137
                                    if (
                                        this._productTypeList != undefined &&
                                        this._productTypeList != null &&
                                        this._productTypeList[this._productData[productKey].Id] != null &&
                                        this._productTypeList[this._productData[productKey].Id] != undefined &&
                                        this._productTypeList[this._productData[productKey].Id] == 'Spare Part'
                                    ) {
                                        newItem.isSparePart = true;
                                    } else {
                                        newItem.isSparePart = false;
                                    }

                                    //BS-1090
                                    if (this.isEntitlementErrorCss == true) {
                                        if (this.unEntitledCartProductsIdList.includes(this._productData[productKey].Id)) {
                                            newItem.entitledCSS = ICON_CONTAINER_UNENTITLED;
                                        }
                                    } else {
                                        newItem.entitledCSS = ICON_CONTAINER;
                                    }
                                    if (
                                        this._productData[productKey].B2B_Shape_Size__c != undefined &&
                                        this._productData[productKey].B2B_Shape_Size__c != null &&
                                        this._productData[productKey].B2B_Shape_Height__c != undefined &&
                                        this._productData[productKey].B2B_Shape_Height__c != null
                                    ) {
                                        newItem.shapeSizeHeight =
                                            this._productData[productKey].B2B_Shape_Size__c + ' x ' + this._productData[productKey].B2B_Shape_Height__c;
                                    } else {
                                        newItem.shapeSizeHeight = false;
                                    }
                                }
                            }

                            try {
                                for (var cartItemKey in this.updatedCartItemDetails) {
                                    if (cartItemKey == item.cartItem.cartItemId) {
                                        newItem.Customer_Reference__c = '';
                                        newItem.Entered_By__c = '';
                                        if (this.updatedCartItemDetails[cartItemKey].Customer_Reference__c) {
                                            newItem.Customer_Reference__c = this.updatedCartItemDetails[cartItemKey].Customer_Reference__c;
                                        }
                                        if (this.updatedCartItemDetails[cartItemKey].Entered_By__c) {
                                            newItem.Entered_By__c = this.updatedCartItemDetails[cartItemKey].Entered_By__c;
                                        }
                                    }
                                }
                            } catch (error) {
                                console.error(error);
                            }

                            newItem.originalPriceLabel = getLabelForOriginalPrice(this.currencyCode, item.cartItem.totalListPrice);
                            newItem._endConsumerCSS = TEXTAREA_STYLING; //BS-2031
                            newItem._orderRemarkCSS = TEXTAREA_STYLING; //BS-2031

                            let freeProductCount = 0;
                            if (oldCartItem.unitAdjustedPrice < 0) {
                                oldCartItem.unitAdjustedPrice = 0;
                                oldCartItem.totalPrice = 0;
                                freeProductCount = freeProductCount + oldCartItem.quantity;
                            }
                            this.dispatchEvent(
                                new CustomEvent(FREE_PRODUCTS_COUNT_EVENT, {
                                    bubbles: true,
                                    composed: true,
                                    cancelable: false,
                                    detail: {
                                        count: freeProductCount
                                    }
                                })
                            );
                            newItem.cartItem = oldCartItem;
                            // newItem.unitPrice = item.cartItem.unitAdjustedPrice == -1 ? 0 : item.cartItem.unitAdjustedPrice;
                            parsedCartItems.push(newItem);
                        });
                        this._cartInformation = parsedCartItems;
                        this._subtotal = 0;
                        this._cartInformation.forEach((item) => {
                            this._subtotal = Number(this._subtotal) + Number(item.cartItem.totalPrice);
                        });
                        // Commenting below function invocation as a performace improvement as part of BS-1409
                        // Will uncomment this in future if needed
                        //this.fireInitialLoadComplete(true);
                        if (this._cartInformation) {
                            this.getTotalPriceForCartItem(this.cartItemIds); //BS-1094
                        }
                    })
                    .catch((error) => {
                        this.error = error;
                    });
            });
        }

        let loadCompleteBoolean = true;
        if (this._cartInformation.length !== 0) {
            fireEvent(this.pageRef, LOADING_STATUS, loadCompleteBoolean);
            //BS-2031
            if (this._isUSTenant == true) {
                fireEvent(this.pageRef, SEND_CART_ITEMS_DATA, this._cartInformation);
            }
        }

        Promise.all(generatedUrls).then(() => {
            this._items = Array.from(this._items);
        });
    }

    /**
     * this method sets the total price of the cart items
     * and also updates the total price of the cart.
     * BS-1094
     * @param {Id} cartItemIds
     */
    getTotalPriceForCartItem(cartItemIds) {
        cartItemIds = JSON.parse(JSON.stringify(this.cartItemIds));
        getTotalPriceForCartItem({
            cartItemsIdList: cartItemIds
        })
            .then((result) => {
                let cartItemVsCustomCartItemObjMap = JSON.parse(JSON.stringify(result));
                if (cartItemVsCustomCartItemObjMap != null && cartItemVsCustomCartItemObjMap != undefined) {
                    let cartItemVsTotalPriceMap = new Map();

                    let customCartItemObj = {};
                    customCartItemObj.totalPrice = 0;
                    if (Object.values(cartItemVsCustomCartItemObjMap)) {
                        Object.values(cartItemVsCustomCartItemObjMap).forEach((item) => {
                            item.forEach((currentCartItem) => {
                                cartItemIds.forEach((standardCartItemId) => {
                                    if (standardCartItemId == currentCartItem.B2B_Parent_Cart_Item__c) {
                                        if (cartItemVsTotalPriceMap.has(currentCartItem.B2B_Parent_Cart_Item__c)) {
                                            let totalPrice =
                                                Number(cartItemVsTotalPriceMap.get(currentCartItem.B2B_Parent_Cart_Item__c)) +
                                                Number(currentCartItem.B2B_List_Price__c);
                                            cartItemVsTotalPriceMap.set(currentCartItem.B2B_Parent_Cart_Item__c, totalPrice);
                                        } else {
                                            cartItemVsTotalPriceMap.set(currentCartItem.B2B_Parent_Cart_Item__c, Number(currentCartItem.B2B_List_Price__c));
                                        }
                                    }
                                });
                            });
                        });
                    }

                    let standardCartItemsIdsArray = Object.keys(cartItemVsCustomCartItemObjMap);
                    this._totalAdditionalCartPriceRX = 0;
                    for (let index = 0; index < cartItemIds.length; index++) {
                        if (standardCartItemsIdsArray.includes(cartItemIds[index])) {
                            this._totalAdditionalCartPriceRX =
                                Number(this._totalAdditionalCartPriceRX) + Number(cartItemVsTotalPriceMap.get(cartItemIds[index]));
                        }
                    }
                }
                // Commenting below function invocation as a performace improvement as part of BS-1409
                // Will uncomment this in future if needed
                //this.fireInitialLoadComplete(true);
            })
            .then(() => {
                fireEvent(this.pageRef, UPDATE_CART_TOTAL_PRICE, this._totalAdditionalCartPriceRX);
                this.fireDoLoad(false);
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }
}
