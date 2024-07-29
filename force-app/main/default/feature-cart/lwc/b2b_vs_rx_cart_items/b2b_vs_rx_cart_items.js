import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/b2b_pubsub';
// CONTROLLER METHODS
import getCartItemData from '@salesforce/apex/B2B_CartController.getCartItemData';
import updateCartItemData from '@salesforce/apex/B2B_CartController.updateCartItemData';
import getProductDetails from '@salesforce/apex/B2B_CartController.getProductDetails';
import getColorsMetadata from '@salesforce/apex/B2B_SearchController.getColorsMetadata';
import getTotalPriceForCartItem from '@salesforce/apex/B2B_CartController.getTotalPriceForCartItem'; //BS-1094

// UTILITY METHODS
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

import B2B_VS_RX_PRESCRIPTION_VALUE from '@salesforce/label/c.B2B_VS_RX_PRESCRIPTION_VALUE';
import B2B_VS_RX_EYE_SIDE from '@salesforce/label/c.B2B_VS_RX_EYE_SIDE';
import B2B_VS_RX_BASE_VALUE from '@salesforce/label/c.B2B_VS_RX_BASE_VALUE';
import B2B_VS_RX_RIGHT_EYE from '@salesforce/label/c.B2B_VS_RX_RIGHT_EYE';
import B2B_VS_RX_LEFT_EYE from '@salesforce/label/c.B2B_VS_RX_LEFT_EYE';
import B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS from '@salesforce/label/c.B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS';
import B2B_VS_RX_MEASUREMENT_UNIT from '@salesforce/label/c.B2B_VS_RX_MEASUREMENT_UNIT';
import B2B_VS_RX_EMPTY_INPUT_ERROR from '@salesforce/label/c.B2B_VS_RX_EMPTY_INPUT_ERROR';
import B2B_VS_RX_CENTERING_DATA from '@salesforce/label/c.B2B_VS_RX_CENTERING_DATA';
import B2B_VS_RX_CENTERING_INPUT_FIELD from '@salesforce/label/c.B2B_VS_RX_CENTERING_INPUT_FIELD';
import B2B_RX_Solution_Header_Labels from '@salesforce/label/c.B2B_RX_Solution_Header';
import B2B_RX_Solution_Type_Labels from '@salesforce/label/c.B2B_RX_Solution_Type';
import LENS_SELECTION_LABELS from '@salesforce/label/c.B2B_Lens_Selection_Labels';
import B2B_EE_RX_CART_LABELS from '@salesforce/label/c.B2B_EE_RX_Cart_Labels';
import B2B_VS_RX_CENTERING_INFO_TEXT_FIELD from '@salesforce/label/c.B2B_VS_RX_CENTERING_INFO_TEXT_FIELD';
import B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS from '@salesforce/label/c.B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS';
import B2B_VS_RX_CHECKOUT_SHOW_MORE_LESS from '@salesforce/label/c.B2B_PDP_Additional_Attribute_Label';
import B2B_Lens_Only_For_Clip_In from '@salesforce/label/c.B2B_Lens_Only_For_Clip_In'; //BS-1311
import B2B_YES_BUTTON_LABEL from '@salesforce/label/c.B2B_YES_BUTTON_LABEL'; //BS-1311
import B2B_PLP_ColorFilter_Columns from '@salesforce/label/c.B2B_PLP_ColorFilter_Columns'; //BS-1334
import B2B_lenses_without_adapter from '@salesforce/label/c.B2B_lenses_without_adapter'; //BS-1340
import B2B_SH_EE_LENS_SHAPE from '@salesforce/label/c.B2B_SH_EE_LENS_SHAPE'; //BS-1150
import B2B_VS_GLAZING from '@salesforce/label/c.B2B_VS_GLAZING'; //BS-1466
import B2B_VS_LENS_SELECTION from '@salesforce/label/c.B2B_VS_LENS_SELECTION'; //BS-1466
import B2B_VS_SGRAVING_LABEL from '@salesforce/label/c.B2B_VS_SGRAVING_LABEL'; //BS-1796
import CUSTOMER_NAME_LABEL from '@salesforce/label/c.B2B_VS_RX_ORDER_CUSTOMER_NAME'; //BS-1836
import CLERK_LABEL from '@salesforce/label/c.B2B_CLERK_INPUT_LABEL'; //BS-1836
import VS_RX_ORDER_REFERENCE_LABEL from '@salesforce/label/c.B2B_VS_RX_Order_Reference_Labels'; //BS-1836
import B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS from '@salesforce/label/c.B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS'; //BS-1958
import BRIDGE_TEMPLE_LABEL from '@salesforce/label/c.B2B_VS_Product_Fields'; //BS-2158
import SHAPE_SELECTION_SCREEN_LABELS from '@salesforce/label/c.B2B_VS_SHAPE_SELECTION_SCREEN_LABELS'; //BS-2158
import B2B_NO_BUTTON_LABEL from '@salesforce/label/c.B2B_NO_BUTTON_LABEL'; //BS-2158
import B2B_FACET_CUT_LABEL from '@salesforce/label/c.B2B_FACET_CUT_LABEL'; //BS-2158
import WITH_PARTIAL_COLOR_GROOVE_LABEL from '@salesforce/label/c.B2B_PARTIAL_COLOR_GROOVE_LABEL'; //BS-2137
import B2B_VS_RX_REORDER_LABEL from '@salesforce/label/c.B2B_VS_RX_REORDER_LABEL'; //BS-1064

const INITIAL_LOADING_EVENT = 'initialloadevent'; //Improvement
// EVENT NAME CONSTANTS
const UPDATE_CART_TOTAL_PRICE = 'updatetotalcartprice'; //BS-1094
const QUANTITY_CHANGED_EVT = 'quantitychanged';
const LOADING_EVENT = 'loadevent';
const UPDATE_CART_HEADER_COUNT = 'updatecartheadercount';
const POPUP_FOR_DELETE = 'popupfordelete';
const POPUP_FOR_EDIT = 'popupforedit'; //BS-1958
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

const ANTIREFLECTION_TYPE = 'Anti Reflection';
const HARDCOATING_TYPE = 'Hard Coating';
const PRODUCT_DETAILS_PAGE = 'Product_Detail';
const LENS_SHAPE_ICON = '/icons/lens_shape.svg'; //BS-1150
const STYLING_BACKGROUND_COLOR = 'background-color:'; //BS-2158
const PARTIAL_GROOVE_VALUE = 'With Partial Color Groove'; //BS-2137
/**
 * A non-exposed component to display cart items.
 *
 * @fires Items#quantitychanged
 * @fires Items#singlecartitemdelete
 */
export default class B2b_vs_rx_cart_items extends NavigationMixin(LightningElement) {
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

    // BS-2273
    @api
    hidePurchasePriceFieldValue;

    get hidePurchasePriceField() {
        if (this.hidePurchasePriceFieldValue != undefined) {
            return this.hidePurchasePriceFieldValue;
        }
        return true;
    }

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
     * Variable to store the standard cart items in VS/Rx
     * BS-1094
     * @type {String}
     */

    @api
    cartItemIds;
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
     * this variable holds the total price of the custom cart items in the cart
     * @type {number}
     *  BS-1094
     */
    _totalAdditionalCartPriceRX = 0;

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

    @api
    cartItemData; //BS-1409

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
    _deleteIcon = STORE_STYLING + '/icons/remove-from-cart.svg';
    _removeProductLabel = REMOVE_LABEL.split(',')[1];
    _showLess;
    _showMore;
    _additionalAttributeLabel;
    _renderCartItems = false;
    _showCheckoutLess;
    _showCheckoutMore;
    _instructionsLabel = B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[3]; //BS-976
    _lensShapeLabel; //BS-1150

    /**
     * This variable hold the label value of text for edit icon
     * BS-1958
     * @type {String}
     */
    _editIconLabel = B2B_VS_RX_ORDER_HISTORY_UTILITY_LABELS.split(',')[5];

    /* Start BS-2158 */
    _bridgeTempleLabel = BRIDGE_TEMPLE_LABEL.split(',')[2];
    _vsLensSizeLabel = SHAPE_SELECTION_SCREEN_LABELS.split(',')[3];
    _vsLensShapeLabel = SHAPE_SELECTION_SCREEN_LABELS.split(',')[2];
    _colorGrooveColorLabel = SHAPE_SELECTION_SCREEN_LABELS.split(',')[39];
    _accentRingColorLabel = SHAPE_SELECTION_SCREEN_LABELS.split(',')[35];
    _vsShapeAdjusted = SHAPE_SELECTION_SCREEN_LABELS.split(',')[41];

    /* End BS-2158 */

    /**
     * This getter method is used to get icon for 'edit' button
     * BS-1958
     */
    get editIcon() {
        return STORE_STYLING + '/icons/pencil.svg';
    }

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
        this._showMore = B2B_EE_RX_CART_LABELS.split(',')[1];
        this._additionalAttributeLabel = B2B_EE_RX_CART_LABELS.split(',')[1];
        this._showLess = B2B_EE_RX_CART_LABELS.split(',')[2];
        this._showCheckoutMore = B2B_VS_RX_CHECKOUT_SHOW_MORE_LESS.split(',')[0];
        this._showCheckoutLess = B2B_VS_RX_CHECKOUT_SHOW_MORE_LESS.split(',')[1];
        this._lensShapeLabel = B2B_SH_EE_LENS_SHAPE;
    }

    /**
     * Custom labels used on UI
     * BS-976
     * @type {object}
     */
    labels = {
        priscriptionValue: B2B_VS_RX_PRESCRIPTION_VALUE,
        eyeSide: B2B_VS_RX_EYE_SIDE,
        baseValue: B2B_VS_RX_BASE_VALUE,
        rightEye: B2B_VS_RX_RIGHT_EYE,
        leftEye: B2B_VS_RX_LEFT_EYE,
        sphere: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[0],
        cylinder: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[1],
        axis: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[2],
        prism1: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[3],
        prismBase1: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[4],
        prism2: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[5],
        prismBase2: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[6],
        addition: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[7],
        dioptre: B2B_VS_RX_MEASUREMENT_UNIT.split(',')[0],
        degree: B2B_VS_RX_MEASUREMENT_UNIT.split(',')[1],
        errorMessage: B2B_VS_RX_EMPTY_INPUT_ERROR.split(',')[0],
        centringData: B2B_VS_RX_CENTERING_DATA,
        pupilDistance: B2B_VS_RX_CENTERING_INPUT_FIELD.split(',')[0],
        fittingHeight: B2B_VS_RX_CENTERING_INPUT_FIELD.split(',')[1],
        _rxSolutionHeaderLabel: B2B_RX_Solution_Header_Labels.split(',')[0],
        _RXTypeLabel: B2B_RX_Solution_Type_Labels.split(',')[3],
        _colorLabel: B2B_RX_Solution_Type_Labels.split(',')[4],
        lensType: LENS_SELECTION_LABELS.split(',')[0],
        lensSelection: LENS_SELECTION_LABELS.split(',')[8],
        lensIndex: LENS_SELECTION_LABELS.split(',')[5],
        material: LENS_SELECTION_LABELS.split(',')[3],
        antireflectionLabel: LENS_SELECTION_LABELS.split(',')[9],
        hardCoatingLabel: LENS_SELECTION_LABELS.split(',')[10],
        measurementSystem: B2B_EE_RX_CART_LABELS.split(',')[3],
        boxingSystem: B2B_EE_RX_CART_LABELS.split(',')[4],
        pantascopicTilt: B2B_VS_RX_CENTERING_INFO_TEXT_FIELD.split(',')[0],
        bvdWorn: B2B_VS_RX_CENTERING_INFO_TEXT_FIELD.split(',')[1],
        bvdReffracted: B2B_VS_RX_CENTERING_INFO_TEXT_FIELD.split(',')[2],
        antireflection: LENS_SELECTION_LABELS.split(',')[9],
        hardCoating: LENS_SELECTION_LABELS.split(',')[10],
        commentLabel: B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[0],
        noteLabel: B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[2],
        productSize: B2B_EE_RX_CART_LABELS.split(',')[5],
        workingDistanceFieldLabel: B2B_VS_RX_CENTERING_INFO_TEXT_FIELD.split(',')[3],
        lensOnlyForClipIn: B2B_Lens_Only_For_Clip_In,
        yes: B2B_YES_BUTTON_LABEL,
        lensColor: B2B_PLP_ColorFilter_Columns.split(',')[1],
        lensesWithoutAdapter: B2B_lenses_without_adapter,
        glazing: B2B_VS_GLAZING.split(',')[0],
        progressionLength: LENS_SELECTION_LABELS.split(',')[7],
        lensDistance: B2B_VS_LENS_SELECTION.split(',')[0],
        photoSensation: B2B_VS_LENS_SELECTION.split(',')[1],
        blueSensation: B2B_VS_LENS_SELECTION.split(',')[2],
        lensEdge: B2B_VS_LENS_SELECTION.split(',')[3],
        visualPreferences: B2B_VS_LENS_SELECTION.split(',')[4],
        sGraving: B2B_VS_SGRAVING_LABEL.split(',')[0], //BS-1796
        orderType: VS_RX_ORDER_REFERENCE_LABEL.split(',')[2], //BS-1836
        frameType: VS_RX_ORDER_REFERENCE_LABEL.split(',')[3], //BS-1836
        clerk: CLERK_LABEL, //BS-1836
        customerName: CUSTOMER_NAME_LABEL, //BS-1836
        evileyeEdge: LENS_SELECTION_LABELS.split(',')[13], //BS-1836,
        no: B2B_NO_BUTTON_LABEL, //BS-2158
        facetCutLabel: B2B_FACET_CUT_LABEL, //BS-2158
        relatedOrder: B2B_VS_RX_REORDER_LABEL.split('|')[3] //BS-1064
    };

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
     * BS-1150 getter for lensSize icon
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
     * setter for _cartInformation through cart item details recieved from c/b2b_cartContents
     *
     */
    set cartItems(items) {
        this.fireDoLoad(true);
        let loadComplete = false;
        const generatedUrls = [];
        let parsedCartItems = [];
        let cartItemIds = [];
        let productIds = [];
    }

    getDeliveryInformation(deliveryTimeJSON) {
        if (deliveryTimeJSON != null && deliveryTimeJSON != undefined && deliveryTimeJSON != '') {
            const deliveryInformationCollection = {};
            deliveryInformationCollection.status = getDeliveryTime(deliveryTimeJSON, this.shippingPicklistValues, this.countryCode);
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
        //BS-1409
        if (this.cartItemData && Object.keys(this.cartItemData).length > 0) {
            this.getProductDeatilsFromCart(this.cartItemData);
        } else {
            this.fireInitialLoadComplete(true);
            this.fireDoLoad(false);
        }
        //BS-1409
    }

    /**
     * This lifecycle hook fires after a component has finished the rendering phase.
     */
    renderedCallback() {}

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
     * BS-1958
     * Method to open a modal for confirmation to edit the vs/rx cart item
     */
    openModalToEdit(event) {
        if (event.target.dataset.cartitemid) {
            let cartItemId = event.target.dataset.cartitemid;
            this.dispatchEvent(
                new CustomEvent(POPUP_FOR_EDIT, {
                    bubbles: true,
                    composed: true,
                    cancelable: false,
                    detail: {
                        cartItemId
                    }
                })
            );
        }
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
                    oldCartItem.totalListPrice = cartItemUpdatedDetails.totalListPrice;
                    oldCartItem.totalPrice = cartItemUpdatedDetails.totalPrice;

                    if (this._cartItemDataToUpdate.has(item.cartItem.cartItemId)) {
                        updatedItem.Customer_Reference__c = this._cartItemDataToUpdate.get(item.cartItem.cartItemId).customerReference;
                        updatedItem.Entered_By__c = this._cartItemDataToUpdate.get(item.cartItem.cartItemId).enteredBy;
                    }
                    updatedItem.cartItem = oldCartItem;
                }
                return updatedItem;
            });
            this._cartInformation = updatedCartItems;

            let count = 0;
            this._cartInformation.forEach((item) => {
                count += Number(item.cartItem.quantity);
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
            await getCartItemData({ cartItemIdList: cartItemIds }).then((result) => {
                this.updatedCartItemDetails = JSON.parse(JSON.stringify(result));
                getProductDetails({ productIdList: productIds })
                    .then((result) => {
                        this._productData = JSON.parse(JSON.stringify(result));
                        this.getColorMetadata();
                        items.forEach((item) => {
                            const newItem = { ...item };
                            newItem.productImageUrl = resolve(item.cartItem.productDetails.thumbnailImage.url);
                            newItem.productImageAlternativeText = item.cartItem.productDetails.thumbnailImage.alternateText || '';
                            newItem.stockAvailable = false;

                            newItem.BridgeSize =
                                item.cartItem.productDetails.variationAttributes.B2B_Bridge_Size__c != null
                                    ? item.cartItem.productDetails.variationAttributes.B2B_Bridge_Size__c.value
                                    : null;
                            newItem.TempleLength =
                                item.cartItem.productDetails.variationAttributes.B2B_Temple_Length__c != null
                                    ? item.cartItem.productDetails.variationAttributes.B2B_Temple_Length__c.value
                                    : null;
                            newItem.BridgeSize_TempleLength =
                                item.cartItem.productDetails.variationAttributes.B2B_Temple_Length__c != null &&
                                item.cartItem.productDetails.variationAttributes.B2B_Bridge_Size__c != null
                                    ? item.cartItem.productDetails.variationAttributes.B2B_Bridge_Size__c.value +
                                      '/' +
                                      item.cartItem.productDetails.variationAttributes.B2B_Temple_Length__c.value
                                    : null;
                            newItem.ShapeSize =
                                item.cartItem.productDetails.variationAttributes.B2B_Shape_Size__c != null
                                    ? item.cartItem.productDetails.variationAttributes.B2B_Shape_Size__c.value
                                    : null;
                            newItem.productSize =
                                item.cartItem.productDetails.variationAttributes.B2B_EE_Size__c != null
                                    ? item.cartItem.productDetails.variationAttributes.B2B_EE_Size__c.value
                                    : null;
                            newItem.backgroundColorUpper =
                                item.cartItem.productDetails.fields.B2B_Hexcode__c != null
                                    ? 'background-color: ' + item.cartItem.productDetails.fields.B2B_Hexcode__c
                                    : false;
                            newItem.backgroundColorLower =
                                item.cartItem.productDetails.fields.B2B_Hexcode_Accent__c != null
                                    ? 'background-color: ' + item.cartItem.productDetails.fields.B2B_Hexcode_Accent__c
                                    : item.cartItem.productDetails.fields.B2B_Hexcode_Accent__c != null
                                    ? 'background-color: ' + item.cartItem.productDetails.fields.B2B_Hexcode_Accent__c
                                    : false;
                            newItem.disableDecreaseQuantity = item.cartItem.quantity == 1 || this.isCheckoutPage ? true : false;

                            if (newItem.backgroundColorLower === false && newItem.backgroundColorUpper) {
                                newItem.backgroundColorLower = newItem.backgroundColorUpper;
                            }
                            if (newItem.backgroundColorUpper === false && newItem.backgroundColorLower) {
                                newItem.backgroundColorUpper = newItem.backgroundColorLower;
                            }
                            newItem.showMoreBoolean = false; // Boolean to show additioonal section on cart item of Cart page
                            // Label of additioonal section on cart item of Cart page
                            if (this.isCheckoutPage === true) {
                                newItem.additionalAttributeLabel = this._showCheckoutMore;
                            } else {
                                newItem.additionalAttributeLabel = this._showMore;
                            }
                            newItem.productLink =
                                item.cartItem.productDetails.fields.B2B_Picture_Link__c != null
                                    ? item.cartItem.productDetails.fields.B2B_Picture_Link__c
                                    : item.cartItem.productImageUrl;

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
                            /* Start : BS-2158/BS-2174 */
                            newItem.colorGrooveData =
                                item.additionalInfo !== undefined &&
                                item.additionalInfo !== null &&
                                item.additionalInfo.B2B_With_Color_Groove__c !== undefined &&
                                item.additionalInfo.B2B_With_Color_Groove__c !== null &&
                                item.additionalInfo.B2B_With_Color_Groove__c == true
                                    ? item.additionalInfo.B2B_Selected_Color_Groove_Product__r !== undefined &&
                                      item.additionalInfo.B2B_Selected_Color_Groove_Product__r !== null &&
                                      item.additionalInfo.B2B_Selected_Color_Groove_Product__r.Name !== undefined &&
                                      item.additionalInfo.B2B_Selected_Color_Groove_Product__r.Name !== null &&
                                      item.additionalInfo.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c !== undefined &&
                                      item.additionalInfo.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c !== null
                                        ? {
                                              label: item.additionalInfo.B2B_Selected_Color_Groove_Product__r.Name,
                                              styling: STYLING_BACKGROUND_COLOR + item.additionalInfo.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c
                                          }
                                        : false
                                    : false;

                            newItem.accentRingData =
                                item.additionalInfo !== undefined &&
                                item.additionalInfo !== null &&
                                item.additionalInfo.B2B_Accent_Ring__c !== undefined &&
                                item.additionalInfo.B2B_Accent_Ring__c !== null &&
                                item.additionalInfo.B2B_Accent_Ring__c == true
                                    ? item.additionalInfo.B2B_Selected_Accent_Ring_Product__r !== undefined &&
                                      item.additionalInfo.B2B_Selected_Accent_Ring_Product__r !== null &&
                                      item.additionalInfo.B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c !== undefined &&
                                      item.additionalInfo.B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c !== null &&
                                      item.additionalInfo.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c !== undefined &&
                                      item.additionalInfo.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c !== null
                                        ? {
                                              label: item.additionalInfo.B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c,
                                              styling: STYLING_BACKGROUND_COLOR + item.additionalInfo.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c
                                          }
                                        : false
                                    : false;

                            newItem.showFacetCut =
                                item.additionalInfo !== undefined &&
                                item.additionalInfo !== null &&
                                item.additionalInfo.B2B_Optimized_Facet_Cut__c !== undefined &&
                                item.additionalInfo.B2B_Optimized_Facet_Cut__c !== null
                                    ? true
                                    : false;

                            newItem.withFacetCut =
                                item.additionalInfo !== undefined &&
                                item.additionalInfo !== null &&
                                item.additionalInfo.B2B_Optimized_Facet_Cut__c !== undefined &&
                                item.additionalInfo.B2B_Optimized_Facet_Cut__c !== null
                                    ? item.additionalInfo.B2B_Optimized_Facet_Cut__c
                                    : false;

                            if (
                                (item.additionalInfo.B2B_a__c !== undefined && item.additionalInfo.B2B_a__c !== null && item.additionalInfo.B2B_a__c != 0) ||
                                (item.additionalInfo.B2B_b__c !== undefined && item.additionalInfo.B2B_b__c !== null && item.additionalInfo.B2B_b__c != 0) ||
                                (item.additionalInfo.B2B_b1__c !== undefined && item.additionalInfo.B2B_b1__c !== null && item.additionalInfo.B2B_b1__c != 0) ||
                                (item.additionalInfo.B2B_b2__c !== undefined && item.additionalInfo.B2B_b2__c !== null && item.additionalInfo.B2B_b2__c != 0) ||
                                (item.additionalInfo.B2B_SF__c !== undefined && item.additionalInfo.B2B_SF__c !== null && item.additionalInfo.B2B_SF__c != 0) ||
                                (item.additionalInfo.B2B_DHP__c !== undefined && item.additionalInfo.B2B_DHP__c !== null && item.additionalInfo.B2B_DHP__c != 0)
                            ) {
                                newItem.shapeAdjusted = true;
                            } else {
                                newItem.shapeAdjusted = false;
                            }
                            /* End : BS-2158/BS-2174 */
                            /* Start : BS-2137 */
                            if (
                                item.additionalInfo !== undefined &&
                                item.additionalInfo !== undefined &&
                                item.additionalInfo.B2B_With_Partial_Color_Groove__c !== undefined &&
                                item.additionalInfo.B2B_With_Partial_Color_Groove__c !== null &&
                                item.additionalInfo.B2B_With_Partial_Color_Groove__c == true
                            ) {
                                newItem.grooveColorLabel = WITH_PARTIAL_COLOR_GROOVE_LABEL.split(',')[1];
                            } else {
                                newItem.grooveColorLabel = this._colorGrooveColorLabel;
                            }
                            /* End : BS-2137 */
                            for (var productKey in this._productData) {
                                if (productKey == item.cartItem.productDetails.productId) {
                                    newItem.deliveryTimeJSON =
                                        this._productData[productKey].B2B_Shipping_Status_JSON__c != null
                                            ? this.getDeliveryInformation(this._productData[productKey].B2B_Shipping_Status_JSON__c)
                                            : null;
                                    if (
                                        this._productData[productKey].B2B_Sparepart_Type__c != null &&
                                        this._productData[productKey].B2B_Product_Type__c != null &&
                                        this._productData[productKey].B2B_Brand__c != null &&
                                        !(
                                            (this._productData[productKey].B2B_Sparepart_Type__c === SUN_PROTECTION_SPARE_PART_TYPE ||
                                                this._productData[productKey].B2B_Sparepart_Type__c === SUN_PROTECTION_SPARE_PART_TYPE_GERMAN) &&
                                            (this._productData[productKey].B2B_Product_Type__c === LENSES_DE ||
                                                this._productData[productKey].B2B_Product_Type__c === LENSES_EN)
                                        )
                                    ) {
                                        newItem.displayName = this._productData[productKey].B2B_Sparepart_Type__c + ' ' + this._productData[productKey].Name;
                                    } else {
                                        newItem.displayName = this._productData[productKey].Name;
                                    }
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
                                    /* Start : BS-2158/BS-2174 */
                                    if (this._productData[productKey].B2B_Variant_Shape__c != null) {
                                        newItem.variantShape = this._productData[productKey].B2B_Variant_Shape__c;
                                    }
                                    /* End : BS-2158/BS-2174 */
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
                            parsedCartItems.push(newItem);
                        });
                        this._cartInformation = parsedCartItems;
                        this.fireInitialLoadComplete(true); //BS-1409
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
        fireEvent(this.pageRef, LOADING_STATUS, loadCompleteBoolean);
        Promise.all(generatedUrls).then(() => {
            this._items = Array.from(this._items);
        });
        this._renderCartItems = true;
    }

    // BS-976
    updateShowMore(event) {
        try {
            this._renderCartItems = false;
            let showMoreCartId = event.target.dataset.id;

            for (let index = 0; index < this._cartInformation.length; index++) {
                if (
                    this._cartInformation[index].showMoreBoolean !== undefined &&
                    this._cartInformation[index].showMoreBoolean !== null &&
                    this._cartInformation[index].cartItem.cartItemId === showMoreCartId
                ) {
                    if (this._cartInformation[index].showMoreBoolean === false) {
                        if (this.isCheckoutPage === true) {
                            this._cartInformation[index].additionalAttributeLabel = this._showCheckoutLess;
                        } else {
                            this._cartInformation[index].additionalAttributeLabel = this._showLess;
                        }
                        this._cartInformation[index].showMoreBoolean = true;
                    } else {
                        if (this.isCheckoutPage === true) {
                            this._cartInformation[index].additionalAttributeLabel = this._showCheckoutMore;
                        } else {
                            this._cartInformation[index].additionalAttributeLabel = this._showMore;
                        }
                        this._cartInformation[index].showMoreBoolean = false;
                    }
                }
            }
            this._renderCartItems = true;
        } catch (error) {
            console.error('error-->', error);
        }
    }

    /**
     * BS-1094
     * This method updated the total price of the cart items in the
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
                    this._totalAdditionalCartPriceRX = 0;
                    let standardCartItemsIdsArray = Object.keys(cartItemVsCustomCartItemObjMap);
                    let cartInfoClone = JSON.parse(JSON.stringify(this._cartInformation));
                    for (let index = 0; index < cartItemIds.length; index++) {
                        if (cartInfoClone && cartInfoClone[index] && standardCartItemsIdsArray.includes(cartInfoClone[index].cartItem.cartItemId)) {
                            this._totalAdditionalCartPriceRX =
                                Number(this._totalAdditionalCartPriceRX) + Number(cartItemVsTotalPriceMap.get(cartInfoClone[index].cartItem.cartItemId));
                            cartInfoClone[index].cartItem.totalPrice =
                                Number(cartInfoClone[index].cartItem.totalPrice) +
                                Number(cartItemVsTotalPriceMap.get(cartInfoClone[index].cartItem.cartItemId));
                        }
                    }
                    this._cartInformation = JSON.parse(JSON.stringify(cartInfoClone));
                    this.fireDoLoad(false);
                }
            })
            .then(() => {
                fireEvent(this.pageRef, UPDATE_CART_TOTAL_PRICE, this._totalAdditionalCartPriceRX);
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    /**
     * Fires an event to stop the loader as initial setup of component is completed
     * @param {event}
     * @fires Items#loadevent
     * BS-1409
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
}
