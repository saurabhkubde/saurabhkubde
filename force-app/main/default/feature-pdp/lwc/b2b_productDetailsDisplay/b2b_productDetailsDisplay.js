import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { transformData, handleNavigationToClipOnsHandler } from './dataNormalizer';
import { sortBy, getDeliveryTime, getApplicableAvailabilityStatusIcon, checkProductAvailability, pageManager } from 'c/b2b_utils'; //BS-644

import getCurrencyCode from '@salesforce/apex/B2B_CartController.getCurrencyCode'; //BS-1245

import communityId from '@salesforce/community/Id';
import productSearch from '@salesforce/apex/B2B_ProductDetailsController.productSearch';
import getSourceTargetStatus from '@salesforce/apex/B2B_ProductDetailsController.getSourceTargetStatus';
import getProductMedia from '@salesforce/apex/B2B_ProductDetailsController.getProductMedia';
import checkEvilEyeFrame from '@salesforce/apex/B2B_ProductDetailsController.checkEvilEyeFrame'; //Added as part of BS-578
import checkEligibilityForVSRX from '@salesforce/apex/B2B_ProductDetailsController.checkEligibilityForVSRX'; //BS-787
import getColorsMetadata from '@salesforce/apex/B2B_SearchController.getColorsMetadata'; //Added as part of BS-357
import getSelectedProductDetail from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getSelectedProductDetail';
import { fireEvent } from 'c/b2b_pubsub'; //Added as part of BS-656
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import CODE_FIELD from '@salesforce/schema/Account.k_ARIS_Account_ID__c';
import SHIPPING_FIELD from '@salesforce/schema/Product2.B2B_Shipping_Status__c';
import PRODUCT_OBJECT from '@salesforce/schema/Product2';
import HIDE_PRICES_FIELD from '@salesforce/schema/Account.B2B_Hide_Prices__c';
//Labels
import PDP_LABELS from '@salesforce/label/c.B2B_PDP_InfoLabels';
import PDP_PARTS from '@salesforce/label/c.B2B_PDP_SpareParts';
import PDP_INFO from '@salesforce/label/c.B2B_PDP_FurtherInfo';
import PDP_SHADES from '@salesforce/label/c.B2B_PDP_StyleShade';
import PAGE_SIZE_VALUE from '@salesforce/label/c.B2B_Pagination_Display_Size';
import additionalLensesHeaderLabel from '@salesforce/label/c.B2B_Additional_Lenses_Header'; //Bs-579

import EVIL_EYE_PRODUCT_CATALOGUE_LINK from '@salesforce/label/c.B2B_Evil_Eye_Product_Catalogue'; //Added as part of BS-578
import DEALER_CATALOGUE from '@salesforce/label/c.B2B_Evil_Eye_Dealer_Catalogue_Value'; //Added as part of BS-578
import productAttributeShowLabel from '@salesforce/label/c.B2B_PDP_Additional_Attribute_Label'; //Added as part of BS-357
import productAttributeUnits from '@salesforce/label/c.B2B_PDP_Additional_Attribute_Units'; //Added as part of BS-357
import SEE_CHASSIS_LABEL from '@salesforce/label/c.B2B_See_Chassis_Button_Label'; //Added as part of BS-582
import SEE_CLIP_ON_LABEL from '@salesforce/label/c.B2B_See_Clip_On_Button_Label'; //Added as part of BS-2249
import READ_MORE_LABEL from '@salesforce/label/c.B2B_Read_More_Label'; //Added as part of BS-582
import B2B_VS_RX_ORDER_REFERENCE_LABELS from '@salesforce/label/c.B2B_VS_RX_Order_Reference_Labels'; //BS-787
import B2B_VS_ELIGIBLE_CATEGORIES from '@salesforce/label/c.B2B_VS_ELIGIBLE_CATEGORIES'; //BS-787
import B2B_SEE_GLAZED_BUTTON_LABEL_EE from '@salesforce/label/c.B2B_See_Glazed_Button_Label'; //BS-1500
import COLOR_DESCRIPTION from '@salesforce/label/c.B2B_COLOR_DESCRIPTION_LABEL'; //BS-1369
import DETAILS_LABEL from '@salesforce/label/c.B2B_PRODUCT_DETAIL_HEADER'; //BS-1622
import B2B_Availability_Status_Labels from '@salesforce/label/c.B2B_Availability_Status_Labels'; //BS-1568
import SILHOUETTE_SPARE_PART_ONLY_FRAME_CATEGORY from '@salesforce/label/c.B2B_SILHOUETTE_SPARE_PART_ONLY_FRAME_CATEGORY_AND_TRANSLATIONS'; //BS-1568
import EVIL_EYE_SPARE_PART_ONLY_FRAME_CATEGORY from '@salesforce/label/c.B2B_EVIL_EYE_SPARE_PART_ONLY_FRAME_CATEGORY_AND_TRANSLATIONS'; //BS-1568
import NEUBAU_FRAME_CATEGORIES from '@salesforce/label/c.B2B_NEUBAU_SPARE_PART_ONLY_FRAME_CATEGORY_AND_TRANSLATIONS'; //BS-1568
import LENS_ONLY_AND_FRAME_PROVIDED_EXCLUDED_COUNTRY_CODES from '@salesforce/label/c.B2B_VS_RX_LENS_ONLY_AND_FRAME_PROVIDED_EXCLUDED_COUNTRY_CODES'; //BS-1415
import B2B_MISSING_PRICE_LABELS from '@salesforce/label/c.B2B_MISSING_PRICE_LABELS'; //BS-2002
import ORDER_REMARK_FIELD_HELPTEXT from '@salesforce/label/c.B2B_ORDER_REMARK_FIELD_HELPTEXT'; //BS-2437
import CONSUMER_REFERENCE_FIELD_HELPTEXT from '@salesforce/label/c.B2B_CONSUMER_REFERENCE_FIELD_HELPTEXT'; //BS-2437

// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //Styling icons --> BS-463

import getPicklistData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFieldPicklistValues'; //BS-787
import B2B_VS_RX_LABELS from '@salesforce/label/c.B2B_VS_RX_Labels'; //BS-787

//Colors custom label BS-1005
import BLACK_COLOR from '@salesforce/label/c.B2B_Color_Black';
import CREAM_COLOR from '@salesforce/label/c.B2B_Color_Creme';
import GOLD_COLOR from '@salesforce/label/c.B2B_Color_Gold';
import SLIVER_COLOR from '@salesforce/label/c.B2B_Color_Silver';
import GREY_COLOR from '@salesforce/label/c.B2B_Color_Grey';
import BROWN_COLOR from '@salesforce/label/c.B2B_Color_Brown';
import GREEN_COLOR from '@salesforce/label/c.B2B_Color_Green';
import PETROL_COLOR from '@salesforce/label/c.B2B_Color_Petrol';
import BLUE_COLOR from '@salesforce/label/c.B2B_Color_Blue';
import VIOLET_COLOR from '@salesforce/label/c.B2B_Color_Violet';
import ROSE_COLOR from '@salesforce/label/c.B2B_Color_Rose';
import RED_COLOR from '@salesforce/label/c.B2B_Color_Red';
import ORANGE_COLOR from '@salesforce/label/c.B2B_Color_Orange';
import YELLOW_COLOR from '@salesforce/label/c.B2B_Color_Yellow';
import WHITE_COLOR from '@salesforce/label/c.B2B_Color_White';
import TRANSPARENT_COLOR from '@salesforce/label/c.B2B_Color_transparent';
import BICOLOR_COLOR from '@salesforce/label/c.B2B_Color_Bicolor';
import WITHOUT_MIRROR_COLOR from '@salesforce/label/c.B2B_Color_Without_Mirror';
import PURPLE_COLOR from '@salesforce/label/c.B2B_Color_Purple';
import ROSEGOLD_COLOR from '@salesforce/label/c.B2B_Color_Rosegold';
import BRASS_COLOR from '@salesforce/label/c.B2B_Color_Brass'; //BS-1005
import ACCENT_COLOR from '@salesforce/label/c.B2B_ACCENT_COLOR_LABEL'; //BS-1579
import HIDE_PURCHASE_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Purchase_Price__c'; //BS-2273
import HIDE_SUGGESTED_RETAIL_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Suggested_Retail_Price__c'; //BS-2273

import B2B_DEFAULT_CURRENCY_ISO_CODE from '@salesforce/label/c.B2B_DEFAULT_CURRENCY_ISO_CODE'; //Added as part of BS-1245

// A fixed entry for the home page.
const homePage = {
    name: 'Home',
    type: 'standard__namedPage',
    attributes: {
        pageName: 'home'
    }
};

const fields = [HIDE_PRICES_FIELD, CODE_FIELD, HIDE_PURCHASE_PRICE_FIELD, HIDE_SUGGESTED_RETAIL_PRICE_FIELD];
const EE_BRAND = 'evil eye'; //BS-579, BS-740
const SH_STORE = 'silhouette'; //BS-579
const SUN_PROTECTION_SPARE_PART_TYPE = 'Sun protection lens'; //BS-740
const SUN_PROTECTION_SPARE_PART_TYPE_GERMAN = 'Sonnenschutzglas'; //BS-740
const LENSE_CATEGORY = 'Lenses'; //BS-740
const LENSE_CATEGORY_GERMAN = 'Gläser'; //BS-740

//Added as part of BS-357
const BRIDGE_SIZE_FIELD = 'B2B_Bridge_Size__c';
const SHAPE_SIZE_FIELD = 'B2B_Shape_Size__c';
const LENS_SIZE_FIELD = 'B2B_Lens_Size__c'; // Added as Part of BS-838
const TEMPLE_LENGTH_FIELD = 'B2B_Temple_Length__c';
const WEIGHT_FIELD = 'B2B_Weight__c';
const FRAME_WIDTH_FIELD = 'B2B_Frame_Width__c';
const FRAME_SHAPE_HEIGHT_FIELD = 'B2B_Shape_Height__c';
const SHAPE_AREA_FIELD = 'B2B_Shape_Area__c';
const LENS_COLOR = 'B2B_Lens_Color__c';
const MIRROR_COLOR = 'B2B_Mirror_Color__c';
const STYLE_DISPLAY_NONE = 'display: none';
const TRANSPARENT = 'transparent';
const URI1 =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxwYXR0ZXJuIGlkPSJiIiBwYXR0ZXJuVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PHVzZSB4bGluazpocmVmPSIjYSIgdHJhbnNmb3JtPSJzY2FsZSguNSkiLz48L3BhdHRlcm4+PGltYWdlIGlkPSJhIiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0NBWUFBQUJYQXZtSEFBQUVHV2xEUTFCclEwZERiMnh2Y2xOd1lXTmxSMlZ1WlhKcFkxSkhRZ0FBT0kyTlZWMW9IRlVVUHJ0elp5TWt6bE5zTklWMHFEOE5KUTJUVmpTaHRMcC8zZDAyYnBaSk50b2k2R1QyN3M2WXljNDRNN3Y5b1U5RlVId3g2cHNVeEwrM2dDQW85US9iUHJRdmxRb2wydFFnS0Q2MCtJTlE2SXVtNjVrN001bHB1ckhlWmU1ODg1M3ZubnZ1dVdmdkJlaTVxbGlXa1JRQkZwcXVMUmN5NG5PSGo0ZzlLNUNFaDZBWEJxRlhVUjByWGFsTUFqWlBDM2UxVzk5RHdudGYyZFhkL3ArdHQwWWRGU0J4SDJLejVxZ0xpSThCOEtkVnkzWUJldnFSSHovcVdoNzJZdWkzTVVERUwzcTQ0V1BYdzNNK2ZvMXBadVFzNHRPSUJWVlRhb2lYRUkvTXhmaEdEUHN4c05aZm9FMXE2NnJvNWFKaW0zWGRvTEZ3NzJIK24yM0JhSVh6YmNPbno1bWZQb1R2WVZ6N0t6VWw1K0ZSeEV1cWtwOUcvQWppYTIxOXRoemcyNWFia1JFL0JwRGMzcHF2cGhIdlJGeXMyd2VxdnAra3JiV0tJWDduaERiekxPSXRpTTgzNThwVHdkaXJxcFBGbk1GMnhMYzFXdkx5T3dUQWlicGJtdkhIY3Z0dFU1N3k1K1hxTlpyTGUzbEUvUHE4ZVVqMmZYS2ZPZTNwZk9qemhKWXRCL3lsbDVTREZjU0RpSCtoUmtIMjUrTCtzZHhLRUFNWmFocmxTWDh1a3FNT1d5L2pYVzJtNk05TERCYzMxQjlMRnV2NmdWS2cvMFN6aTNLQXIxa0dxMUdNalUvYUxibnE2L2xSeGM0WGZKOThoVGFyZ1grK0RiTUpCU2lZTUllOUNrMVlBeEZrS0VBRzN4YllhS21ERGdZeUZLMFVHWXBmb1dZWEcrZkFQUEk2dEpuTndiN0NsUDdJeUYrRCtiak90Q3BraHo2Q0ZySWEvSTZzRnRObDhhdUZYR01UUDM0c053SS9KaGtnRXRtRHoxNHlTZmFSY1RJQklubUtQRTMya3h5eUUyVHYrdGhLYkVWZVBEZlcvYnlNTTFLbW0wWGRPYlM3b0dEL015cE1YRlBYckN3T3RvWWp5eW43QlYyOS9NWmZzVnpwTERkUnR1SVpuYnBYenZsZitldjhNdllyL0dxazRIL2tWL0czY3NkYXpMdXlUTVBzYkZoemQxVWFiUWJqRnZEUm1jV0p4UjN6Y2ZIa1Z3OUdmcGJKbWVldjlGMDhXVzh1RGthc2x3WDZhdmxXR1U2TlJLejBnL1NIdEN5OUozMG8vY2E5elgzS2ZjMTl6bjNCWFFLUk84dWQ0NzdoTG5BZmMxL0c5bXJ6R2xyZmV4WjVHTGRuNlpacnJFb2hJMndWSGhaeXdqYmhVV0V5OGljTUNHTkNVZGlCbHEzcit4YWZMNTQ5SFE1akgrYW4rMXkrTGxZQmlmdXhBdlJOL2xWVlZPbHdsQ2tkVm05Tk9MNUJFNHdrUTJTTWxEWlU5N2hYODZFaWxVL2xVbWtRVXp0VEU2bXgxRUVQaDdPbWRxQnRBdnY4SGRXcGJySlM2dEpqM24wQ1dkTTZidXNOelJWM1M5S1RZaHF2TmlxV211cm9pS2dZaHNoTWptaFRoOXB0V2hzRjc5NzBqL1NiTXJzUEUxc3VSNXo3RE1DK1AvSHMreTdpanJRQWxoeUFnY2NqYmhqUHlnZmVCVGp6aE5xeTI4RWRrVWg4QytEVTkrejJ2L295ZUg3OTFPbmN4SE9zNXkyQXRUYzduYi9mNzNUV1BrRC9xd0Jualg4Qm9KOThWUU5jQys4QUFBQ3pTVVJCVkdnRjdaaEJDc013REFUanZzYi9mNDEvMDlM';
const URI2 =
    'akhzV1FiUU9UbThDUzRoa0xqTmZlKzMwTnZuUE9HaXkvN3E3L212ek1QNjUxQTcrMm9nRU5RQUllSVFnUXAyc0FJNFFGSG05Z2RLLzV3cnI3YmpPdC8zZ0RiZ0RPSUU3WEFFWUlDMmdBQXNUcEdzQUlZUUVOUUlBNGZVM3ZIcjRMWWVaWndCbElIdjFJQTMzbTJWRUR5YU1mYWFEUFBEdHFJSG4wSTkrRitzeXpvek9RUFBxUkJ2ck1zNk1Ha2tjLzBrQ2ZlWGJVUVBMb1J4K1lPeHRMdG4wd2lBQUFBQUJKUlU1RXJrSmdnZz09Ii8+PC9kZWZzPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9InVybCgjYikiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iLjEiLz48L3N2Zz4=';
const SHOW_MORE_SELECTION = 'userShowMoreSelection';
const SPAREPART_TYPE = 'B2B_Sparepart_Type__c'; //Added as part of BS-755
const RIMLESS_VARIANT_FIELD = 'B2B_Rimless_Variant__c'; //Added as part of BS-582
const DEMO_TO_CHASSIS_PICKLIST = 'Demo to Chassis'; //Added as part of BS-582
const PICKLIST_VALUE_DEMO = 'Demo';
const PICKLIST_VALUE_DEMO_LANGUAGE_SPECIFIC = PDP_LABELS.split(',')[14]; //BS-2254

const FRAME_TYPE_FIELD = 'B2B_Frame_type__c'; //Added as part of BS-567
const RIMLESS = PDP_LABELS.split(',')[8]; //Added as part of BS-567
const HEXCODE = 'B2B_Hexcode__c'; //Added as part of BS-567
const HEX_CODE_ACCENT = 'B2B_Hexcode_Accent__c'; //Added as part of BS-567
const FRAME_COLOR_FIELD = 'B2B_Frame_Color__c'; //Added as part of BS-567
const FRAME_COLOR_DESCRIPTION = 'B2B_Frame_Color_Description__c'; //Added as part of BS-567
const STOCK_KEEPING_UNIT_FIELD = 'StockKeepingUnit'; // Added as part of BS-567
const BRAND_TYPE_EVT = 'brandTypeEVT';

//Added as a part of BS-702
const RRP_PRICE_SH = 'rrp-price';
const RRP_PRICE_NB = 'rrp-price-nb';

//Added as a part of BS-755
const TEMPLE_SPARE_PART_DE = 'Bügel';
const TEMPLE_SPARE_PART_EN = 'Temple';

//BS-787 Start
const LENS_CONFIGURATOR_OBJECT_API_NAME = 'B2B_Lens_Configurator__c';
const REGULAR_CONDITION_STYLING = 'custom slds-p-top_small';
const ERROR_CONDITION_STYLING = 'error slds-p-top_small';
const EMPTY = '';
const B2B_ORDER_TYPE = 'B2B_Order_Type__c';
const B2B_FRAME_TYPE = 'B2B_Frame_Type__c';
const CUSTOMER_NAME_FIELD = 'End-Consumer/Reference';
const CLERK_FIELD = 'Order Remark';
const OPTICAL_EYEWEAR_FIELD = 'Optical Eyewear';
const SUNGLASSES_FIELD = 'Sunglasses';
const COMPLETE_EYEWEAR_FIELD = 'Complete Eyewear';
const LENS_ONLY_FIELD = 'Lens Only';
const LENS_ONLY_AND_FRAME_PROVIDED_FIELD = 'Lens Only + frame provided';
const FRAME_CATEGORY_LABEL = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[11];
const VISION_SENSATION = 'VS';
const RX_GLAZING = 'RX';
const VISION_SENSATION_SITE_PAGE = 'VS__c';
const RX_GLAZING_SITE_PAGE = 'RX__c';
const STANDARD_NAMED_PAGE = 'comm__namedPage';
const FROM_PDP_PAGE = 'From PDP';
const VS_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE = 'orderInformationSummaryCollectionForVS';
const RX_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE = 'orderInformationSummaryCollectionForRX';
const COLOR_FIELD = 'B2B_Color__c';
const EE_SIZE_FIELD = 'B2B_EE_Size__c';
const ORDER_TYPE_FIELD = 'OrderType';
const FRAMES_TYPE_FIELD = 'FrameType';
//BS-787 End
//BS-1175
const FRAME_ACCENT_COLOR = 'B2B_Frame_Accent_Color__c';
const HEXCODE_LENS = 'B2B_Hexcode_Lens__c'; //BS-1400
const DATE_FORMAT = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
};

//BS-1245 Start
const TYPE_SPARE_PART = 'Spare Part';
const TYPE_STYLE_SHADES = 'Style Shades';
const TYPE_LENSES = 'Lenses';
const TYPE_DEMO = 'Demo';
const NAVIGATION_FROM_VS_RX_PAGE = 'fromVSRX';
const EXTERNAL_LINK_ICON = '/icons/externalLink.svg'; //BS-1398

const NEUBAU_SHAPE_SIZE_ICON = '/icons/NEUBAU_shape-size.png'; //BS-1326
const NEUBAU_TEMPLE_LENGTH_ICON = '/icons/NEUBAU_temple-length.png'; //BS-1326
const ITEM_UNAVAILABLE_LABEL = B2B_Availability_Status_Labels.split(',')[1]; //BS-1568
const ONLY_SPARE_PART_AVAILABLE_LABEL = B2B_Availability_Status_Labels.split(',')[3]; //BS-1568
const FRAME_TYPE = PDP_LABELS.split(',')[13]; //Added as part of BS-2009
const CART_BUTTON_ACTIVE = 'silButtonInverse capital'; //BS-2197
const CART_BUTTON_INACTIVE = 'silButtonInverse capital cart-disabled'; //BS-2197
const RELATED_CLIP_ONS = 'Related Clip-Ons'; //BS-2249

/**
 * An organized display of product information.
 *
 * @fires ProductDetailsDisplay#addtocart
 * @fires ProductDetailsDisplay#createandaddtolist
 */
export default class ProductDetailsDisplay extends NavigationMixin(LightningElement) {
    /**
     * BS-787
     * This variable is used to indiacte whether the current user's account is entitled for VS-RX
     *
     * @type {Boolean}
     */
    _eligibleForRX = false;

    _eligibleForVS = false;
    _isSunglasses = false;

    /**
     * BS-787
     * This variable is used to hold label for VS-RX button on UI
     *
     * @type {String}
     */
    _buttonForVSRXLabel = PDP_LABELS.split(',')[10];
    _silhouetteVSButton = PDP_LABELS.split(',')[12];
    _vsEligibleCategories = B2B_VS_ELIGIBLE_CATEGORIES.split(',');

    /**
     * BS-787
     * This variable is used to hold label for tooltip of button for VS-RX button on UI
     *
     * @type {String}
     */
    _buttonInformationForVSRXLabel = PDP_LABELS.split(',')[11];

    /**
     * BS-787
     * This variable is used to control the visibility of popup section that opens on click of RX Glazing button
     *
     * @type {Boolean}
     */
    _showPopUpForOrderInformation = false;

    /**
     * BS-787
     * This variable is used to hold label for title of custom information input section
     *
     * @type {String}
     */
    _customerInformationHeaderLabel = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[4];

    /**
     * BS-787
     * This collection holds the categories applicable for currently displaying product and is recieved from parent component
     *
     * @type {Array}
     */
    @api
    productCategoriesCollection;

    /**
     * BS-787
     * This collection holds the order type values that are allowed for selection for user on UI
     *
     * @type {Array}
     */
    @track
    orderTypeValues = [];

    /**
     * BS-787
     * This collection holds the frame type values that are allowed for selection for user on UI
     *
     * @type {Array}
     */
    @track
    frameTypeValuesCollection = [];

    /**
     * BS-787
     * This collection is of Customer Information entered by User on UI
     *
     * @type {Array}
     */
    @track
    _customerInformationSummaryCollection;

    /**
     * BS-787
     * This Variable is to represent label of Frame Type Header Section
     *
     * @type {String}
     */
    _frameTypeHeaderLabel;

    /**
     * BS-787
     * This Variable is to represent label of Order Type Header Section
     *
     * @type {String}
     */
    _orderTypeHeaderLabel = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[6] ? B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[6] : '';

    /**
     * BS-787
     * This Variable is to represent label of Order information title
     * @type {String}
     */
    _orderInformationHeaderLabel;

    /**
     * BS-787
     * Variable to represent label of instruction to be displayed on UI if user does not enter values in customer input fields
     *
     * @type {String}
     */
    _errorInstructionToEnterValue = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[10] ? B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[10] : '';

    /**
     * BS-787
     * Variable to represent label of instruction to be displayed on UI if user does not select values of Order Type/Frame Type fields
     *
     * @type {String}
     */
    _errorInstructionToSelectValue;

    /**
     * BS-787
     * Variable to indicate total fields that needs to be cheked while proceeding to next screen
     *  Valid Scenarios
     *      1. For VS : 4 Fields needs to be checked as follows:
     *                  1. Customer Name
     *                  2. Clerk
     *                  3. Order Type
     *                  4. Frame Type
     *
     *      2. For RX : 3 Fields needs to be checked as follows:
     *                  1. Customer Name
     *                  2. Clerk
     *                  3. Order Type
     *                  Note: As Frame Type selection is not applicable for RX so, no need to check Frame type
     *
     *
     * @type {Integer}
     */
    _totalFieldsToCheck;

    /**
     * BS-787
     * Variable to represent the applicable brand
     *
     * @type {String}
     */
    _applicableBrand;

    /**
     * BS-787
     * This collection holds the data of currently selected product
     *
     * @type {String}
     */
    @track
    finalProductData;

    /**
     * This variable hold the currency ISO Code applicable for style shades
     * BS-1245
     * @type {string}
     */
    _applicableCurrencyCodeForStyleShades; //BS-1245

    /**
     * This variable hold the currency ISO Code applicable for Spare parts
     * BS-1245
     * @type {string}
     */
    _applicableCurrencyCodeForSpareParts; //BS-1245

    /**
     * An event fired when the user indicates the product should be added to their cart.
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *   - Cancelable: false
     *
     * @event ProductDetailsDisplay#addtocart
     * @type {CustomEvent}
     *
     * @property {string} detail.quantity
     *  The number of items to add to cart.
     *
     * @export
     */

    /**
     * An event fired when the user indicates the product should be added to a new wishlist
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *   - Cancelable: false
     *
     * @event ProductDetailsDisplay#createandaddtolist
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * A product image.
     * @typedef {object} Image
     *
     * @property {string} url
     *  The URL of an image.
     *
     * @property {string} alternativeText
     *  The alternative display text of the image.
     */

    /**
     * A product category.
     * @typedef {object} Category
     *
     * @property {string} id
     *  The unique identifier of a category.
     *
     * @property {string} name
     *  The localized display name of a category.
     */

    /**
     * A product price.
     * @typedef {object} Price
     *
     * @property {string} negotiated
     *  The negotiated price of a product.
     *
     * @property {string} currency
     *  The ISO 4217 currency code of the price.
     */

    /**
     * A product field.
     * @typedef {object} CustomField
     *
     * @property {string} name
     *  The name of the custom field.
     *
     * @property {string} value
     *  The value of the custom field.
     */

    /**
     * An iterable Field for display.
     * @typedef {CustomField} IterableField
     *
     * @property {number} id
     *  A unique identifier for the field.
     */

    /**
     * Gets or sets which custom fields should be displayed (if supplied).
     *
     * @type {CustomField[]}
     */
    @api
    customFields;

    _additionalAttributeObjectList = []; //Added as part BS-357
    _additionalAttributeWithMultipleValuesObjectList = []; //Added as part BS-357
    _additionalAttributeObjectListCopy = []; //Added as part BS-357
    isTempleProduct = false; //Added as part BS-755
    /**
     * Gets or sets whether the cart is locked
     *
     * @type {boolean}
     */
    @api
    cartLocked;

    /**
     * Gets or sets the name of the product.
     *
     * @type {string}
     */
    @api
    description;

    /**
     * Gets or sets the product image.
     *
     * @type {Image}
     */
    @api
    image;

    /**
     * Gets or sets the name of the product.
     *
     * @type {string}
     */
    @api
    name;

    /**
     * brand value passed from the parent component
     * BS-579
     * @type {string}
     */
    @api
    brand;

    /**
     * frameColorDescription value passed from the parent component
     * BS-740
     */
    @api
    frameColorDescription;

    /**
     * collectionDesignFamily value passed from the parent component
     * BS-740
     */
    @api
    collectionDesignFamily;

    /**
     * sparepartType value passed from the parent component
     * BS-740
     */
    @api
    sparepartType;

    /**
     * Gets or sets the model of the product.
     *
     * @type {string}
     */
    @api
    model;

    /**
     * Gets or sets the price - if known - of the product.
     * If this property is specified as undefined, the price is shown as being unavailable.
     *
     * @type {Price}
     */
    @api
    price;

    /**
     * Gets or sets teh stock keeping unit (or SKU) of the product.
     *
     * @type {string}
     */
    @api
    sku;

    //384
    /**
     * Gets the description for the product.
     *
     * @type {CustomField[]}
     */
    @api
    productDescription;

    @api
    variations;

    @api
    hasVariations;

    @api
    productData;

    @api
    deliveryTime;

    @api
    deliveryStatusJ;

    @api
    disableProduct;

    @api
    displayDemoButton;

    @api
    images;

    @api
    effectiveAccountId;

    @api
    productId;

    @track
    _isDisabledProduct = false;

    @api
    config;

    @api
    cardContentMapping;

    @api
    hidePricesFromTile;

    _hideSilhouettePricesFromTile;

    //Added as part BS-357
    @api
    productFields;

    //Added as part of BS-582
    _relatedChassisProductId;

    _addToCartClass = CART_BUTTON_ACTIVE; //BS-2197

    //Added as part of BS-357
    _transparentURI;
    _customMetadataColors = new Map();

    _colorVsColorLabelMap = new Map(); //Added as a part of 1005

    /**
     * Variable to decide whether no chassis available message to be displayed on UI
     * BS-754
     * @type {Boolean}
     */
    _noChassisAvailable = false;
    _isUnglazed = false; //BS-1500
    _isGlazed = false; //BS-1500
    _isShowClipOns = false; //BS-2249

    /**
     * Variable to hold message that needs to be displayed on UI in case of no chassis available for related demo product
     * BS-754
     * @type {String}
     */
    _noChassisAvailableMessageLabel = PDP_LABELS.split(',')[9];

    /**
     * List to hold all the field that needs to be shown in Additional Attributes on UI passed from b2b_productDetails
     * BS-1255
     * @type {List}
     */
    @api
    additionalAttributeFieldAndLabelList;

    pageSourcePDP = true;
    /**
     * BS-357
     * getter for bridge size icon
     *
     */
    externalLinkIcon = STORE_STYLING + EXTERNAL_LINK_ICON; //BS-1398
    get bridgeSize() {
        let auxBridge;
        auxBridge = {
            icon: STORE_STYLING + '/additionalattributeicons/SH_BridgeSize.png'
        };
        return auxBridge;
    }

    /**
     * get HIDE_PURCHASE_PRICE_FIELD value on account BS-2273
     */
    get hidePurchasePriceField() {
        if (this.account && this.account.data) {
            return getFieldValue(this.account.data, HIDE_PURCHASE_PRICE_FIELD);
        }
        return true;
    }

    /**
     * get HIDE_SUGGESTED_RETAIL_PRICE_FIELD value on account BS-2273
     */
    get hideSuggestedRetailPriceField() {
        if (this.account && this.account.data) {
            return getFieldValue(this.account.data, HIDE_SUGGESTED_RETAIL_PRICE_FIELD);
        }
        return true;
    }

    /**
     * BS-734
     * This variable holds the value of hide price field obtained from account
     *
     */
    @track
    _hidePriceStatus = false;

    /**
     * BS-1245
     * This variable holds the  default value of currency code
     *
     */
    _defaultCurrencyIsoCode = B2B_DEFAULT_CURRENCY_ISO_CODE; //BS-1245

    /**
     * BS-656
     * getter for bridge size icon
     *
     */
    get hidePrice() {
        let hidePriceStatus = getFieldValue(this.account.data, HIDE_PRICES_FIELD); //BS-734
        this._hideSilhouettePricesFromTile = !!getFieldValue(this.account.data, HIDE_PRICES_FIELD);
        if (hidePriceStatus != null && hidePriceStatus != undefined) {
            //BS-734
            this._hidePriceStatus = hidePriceStatus; //BS-734
            return hidePriceStatus;
        } else {
            return null;
        }
    }

    @api
    isToggleClicked; //Added as part of BS-575

    /**
     * BS-357
     * getter for lens size icon
     * updated as Part Of BS-838
     *
     */
    get lensSize() {
        let auxLens;
        auxLens = {
            icon: STORE_STYLING + '/additionalattributeicons/SH_LensSize.png'
        };
        return auxLens;
    }
    //Added as a part of BS-1326
    get shapeSize() {
        let auxShapeSize;
        auxShapeSize = {
            icon: STORE_STYLING + NEUBAU_SHAPE_SIZE_ICON
        };
        return auxShapeSize;
    }

    /**
     * BS-357
     * getter for bridge size icon
     *
     */

    //Added as a part of BS-1326
    get templeLength() {
        let auxTemple;
        if (this._isSilhouetteStore == true) {
            auxTemple = {
                icon: STORE_STYLING + '/additionalattributeicons/SH_TempleLength.png'
            };
        } else {
            auxTemple = {
                icon: STORE_STYLING + NEUBAU_TEMPLE_LENGTH_ICON
            };
        }
        return auxTemple;
    }

    get addToCartIcon() {
        return STORE_STYLING + '/icons/add-to-cart-pdp.svg';
    }

    /**
     * BS-2009
     */
    get disabledProduct() {
        return this.disableProduct;
    }

    _invalidQuantity = false;
    _quantityFieldValue = 1;
    _categoryPath;
    _resolvedCategoryPath = [];
    skuLabel = PDP_LABELS.split(',')[0];
    descriptionLabel = PDP_LABELS.split(',')[1];
    priceLabel = PDP_LABELS.split(',')[2];
    articalOnly = B2B_MISSING_PRICE_LABELS.split(',')[0]; //BS-2002
    articalOnlyTitle = B2B_MISSING_PRICE_LABELS.split(',')[1]; //BS-2002
    priceUnavailableTitle = B2B_MISSING_PRICE_LABELS.split(',')[2]; //BS-1951
    freeOfChargeLabel = B2B_MISSING_PRICE_LABELS.split(',')[3]; //BS-2355
    cartButtonLabel = PDP_LABELS.split(',')[3];
    listButtonLabel = PDP_LABELS.split(',')[4];
    productDisabledLabel = PDP_LABELS.split(',')[5];
    _recommendedPrice = PDP_LABELS.split(',')[6] + ':' + ' ';

    sparePartsButton = PDP_PARTS.split(',')[0];
    demoButton = PDP_PARTS.split(',')[1];
    sparePartsHeader = PDP_PARTS.split(',')[2];
    demoHeader = PDP_PARTS.split(',')[3];
    sparePartResults;
    demoResults;
    furtherInfoHeader = PDP_INFO;
    sectionHeader = PDP_SHADES;
    _evilEyeProductCatalogueLink = EVIL_EYE_PRODUCT_CATALOGUE_LINK;
    _dealerCatalogue = DEALER_CATALOGUE;
    showModal = false;
    modalHeader;
    _showSpare;
    _showDemo;
    _totalProducts;

    @track
    _displayData;
    productMedias;
    pageSize = 4;
    _sectionIndex = 0;
    displayArrows = false;
    _totalSpareProducts = 0;
    _totalDemoProducts = 0;
    pageSizeForPopUp = parseInt(PAGE_SIZE_VALUE);
    _pageNumber = 1;
    _spareProducts = [];
    _demoProducts = [];
    _styleShades = [];
    @track _startingRecord = 1;
    @track _endingRecord = 0;
    _showLeftArrow = false;
    _showRightArrow = true;
    _sparePartIdList = [];
    _styleShadeIdList = [];
    _demoProdcuctIdList = [];
    @track _lensesProductIdList = []; //BS-579
    @track _lensesProducts = []; //BS-579
    @track _isLenses = false; //BS-740
    @track _showAdditionalInfoForEvilEye = false; //BS-740
    @track _additionalInfoForEvilEyeData = {}; //BS-740
    _showDescription; //Added as part of BS-939

    /**
     * Property to hold frame color description value
     * BS-567
     * @type {String}
     */
    _frameColorDescription;

    /**
     * Property to hold frame color value
     * BS-567
     * @type {String}
     */
    _frameColor;

    /**
     * Property to hold frame color label value
     * BS-567
     * @type {String}
     */
    _frameColorLabel;

    /**
     * Property to hold hex color value
     * BS-567
     * @type {String}
     */
    _backgroundColorUpper;

    /**
     * Property to hold hex accent color value
     * BS-567
     * @type {String}
     */
    _backgroundColorLower;

    _showMoreBoolean = false;

    _showMore = productAttributeShowLabel.split(',')[0];
    _showLess = productAttributeShowLabel.split(',')[1];

    _additionalAttributeLabel = productAttributeShowLabel.split(',')[0];

    _isSilhouetteStore = false;

    _isEvilEyeProduct = false;

    _isEvilEyeFrameProduct = false; //BS-578
    _resolveConnected;
    _connected = new Promise((resolve) => {
        this._resolveConnected = resolve;
    });

    /**
     * Property to decide whether frame color should be displayed on PDP screen
     * BS-567
     * @type {Boolean}
     */
    _seeFrameColor = false; //Added as part of BS-567

    _seeChassisButton = false; //Added as part of BS-582

    cassisButtonLabel = SEE_CHASSIS_LABEL; //Added as part of BS-582
    seeClipOnsLabel = SEE_CLIP_ON_LABEL; //BS-2249
    seeGlazedButtonLabel = B2B_SEE_GLAZED_BUTTON_LABEL_EE; //Added as part of BS-1500
    _isFrameColorDescriptionValue = false; //BS-1369
    _isClipOnLayout = true;

    //Added as part of BS-656
    _readMore = READ_MORE_LABEL.split(',')[0];
    _readLess = READ_MORE_LABEL.split(',')[1];
    _productDescriptionClass = 'slds-m-top_x-small justify-text descriptionreadmore';
    _readButtonClass = 'description-container read-more-button readButton';
    _showLessButton = false;
    _showMoreButton = false;

    _urlPath;
    _fromVsRx = false;

    //BS-1622
    _detailsHeader = DETAILS_LABEL;
    _clipOnURL = undefined; //BS-2249
    _characterLimit = 50; //BS-2437
    _orderRemarkHelpText = ORDER_REMARK_FIELD_HELPTEXT; //BS-2437
    _infoSVG = STORE_STYLING + '/icons/INFO.svg'; //BS-2437
    __consumerReferenceHelpText = CONSUMER_REFERENCE_FIELD_HELPTEXT; //BS-2437

    @wire(getRecord, { recordId: '$effectiveAccountId', fields })
    account;

    get countryCode() {
        return getFieldValue(this.account.data, CODE_FIELD);
    }

    get rrpPriceClass() {
        //Added as a part of BS-702
        if (this._isSilhouetteStore === true) {
            return RRP_PRICE_SH;
        } else {
            return RRP_PRICE_NB;
        }
    }

    @wire(getObjectInfo, { objectApiName: PRODUCT_OBJECT })
    objectInfo;

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: '$shippingField'
    })
    shippingPicklistValues;

    @wire(CurrentPageReference)
    pageRef;

    //BS-2279
    _disableCart = false;

    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        // Starting the loader
        this._urlPath = pageRef;

        // Checking if url state contains parameters
        if (this._urlPath && this._urlPath.state) {
            let stateAttributes = Object.keys(this._urlPath.state);

            if (stateAttributes && stateAttributes.includes(NAVIGATION_FROM_VS_RX_PAGE)) {
                this._showPopUpForOrderInformation = true;
                /* START: BS-2009 */
                if (this.disabledProduct == true) {
                    this._customerInformationSummaryCollection = JSON.parse(this._urlPath.state.customerInformationSummaryCollectionFromVSRX).filter(
                        (objectInformation) => objectInformation.label !== COMPLETE_EYEWEAR_FIELD
                    );
                } else {
                    this._customerInformationSummaryCollection = JSON.parse(this._urlPath.state.customerInformationSummaryCollectionFromVSRX);
                }
                /*END: BS-2009 */
                this._fromVsRx = true;
                window.history.replaceState({}, document.title, location.protocol + '//' + location.host + location.pathname);
            }
        }
    }

    @track
    deliveryInformationCollection; //BS-644

    //BS-644
    get deliveryTimeJSON() {
        if (JSON.stringify(this.shippingPicklistValues) !== '{}' && this.countryCode && this.deliveryTime) {
            this.deliveryInformationCollection = this.getDeliveryInformation(this.deliveryTime);
        }
        return this.deliveryInformationCollection;
    }

    shippingField;

    //BS-644
    getDeliveryInformation(deliveryTime) {
        if (deliveryTime != null && deliveryTime != undefined && deliveryTime != '') {
            let isSparePartOnlyFrameFlag = false; //BS-1568
            const deliveryInformationCollection = {};
            deliveryInformationCollection.status = getDeliveryTime(deliveryTime, this.shippingPicklistValues, this.countryCode);
            /*Start : BS-1568*/
            if (deliveryInformationCollection.status === ITEM_UNAVAILABLE_LABEL) {
                let frameCategoryList = [];

                if (this._isSilhouetteStore) {
                    frameCategoryList.push.apply(frameCategoryList, SILHOUETTE_SPARE_PART_ONLY_FRAME_CATEGORY.split(','));
                    frameCategoryList.push.apply(frameCategoryList, EVIL_EYE_SPARE_PART_ONLY_FRAME_CATEGORY.split(','));
                } else {
                    frameCategoryList = NEUBAU_FRAME_CATEGORIES.split(',');
                }

                for (let index = 0; index < this._categoryPath.length; index++) {
                    if (frameCategoryList.includes(this._categoryPath[index].name)) {
                        isSparePartOnlyFrameFlag = true;
                        break;
                    }
                }
            }
            if (isSparePartOnlyFrameFlag) {
                deliveryInformationCollection.status = ONLY_SPARE_PART_AVAILABLE_LABEL;
            }
            /*End : BS-1568*/
            deliveryInformationCollection.styling = getApplicableAvailabilityStatusIcon(deliveryInformationCollection.status);
            return deliveryInformationCollection;
        } else {
            return null;
        }
    }

    async connectedCallback() {
        pageManager.setFromPdp();
        this.dispatchEvent(
            new CustomEvent('loadingproduct', {
                detail: {
                    loading: true
                }
            })
        );
        //BS-787 - Start
        //Setting up applicable brand (VS/RX) and fields that needs to be checked
        if (this._isSilhouetteStore != null && this._isSilhouetteStore != undefined && this._isSilhouetteStore == false) {
            this._applicableBrand = RX_GLAZING;
            this._totalFieldsToCheck = 3; // If page source is RX, fields needs to be check : 3
        } else {
            this._applicableBrand = VISION_SENSATION;
            this._totalFieldsToCheck = 4; // If page source is RX, fields needs to be check : 4
        }
        this._cancelButtonLabel = B2B_VS_RX_LABELS.split(',')[2].toUpperCase(); //BS-787
        this._saveAndNextButtonLabel = B2B_VS_RX_LABELS.split(',')[3].toUpperCase(); //BS-787
        this.checkEligibilityForVisionSensationRXGlazing(); //BS-787
        //BS-787 - End

        this.getOrderTypeValues();
        //Added as part of BS-357
        this._transparentURI = URI1 + URI2;
        if (localStorage.getItem(SHOW_MORE_SELECTION)) {
            if (localStorage.getItem(SHOW_MORE_SELECTION) == 'true') {
                this._showMoreBoolean = true;
                this._additionalAttributeLabel = this._showLess;
            } else {
                this._showMoreBoolean = false;
                this._additionalAttributeLabel = this._showMore;
            }
        } else {
            localStorage.setItem(SHOW_MORE_SELECTION, this._showMoreBoolean);
        }
        //Added as part of BS-357
        let colorResult = await getColorsMetadata({});

        if (colorResult !== null && colorResult !== undefined) {
            this._customMetadataColors = new Map(Object.entries(JSON.parse(colorResult)));
        }

        //Added the check for BS-740
        if (this.brand == EE_BRAND && (this.sparepartType == SUN_PROTECTION_SPARE_PART_TYPE || this.sparepartType == SUN_PROTECTION_SPARE_PART_TYPE_GERMAN)) {
            this._showAdditionalInfoForEvilEye = true;
        } else {
            this._showAdditionalInfoForEvilEye = false;
        }

        //BS-579 checking the current store using the url
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');

        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }
        this.shippingField = SHIPPING_FIELD;
        let result = await checkEvilEyeFrame({ productId: this.productId });
        if (result !== null) {
            this._isEvilEyeFrameProduct = result;
        }

        //Added as part of BS-567
        if (this.productFields[RIMLESS_VARIANT_FIELD] === PICKLIST_VALUE_DEMO_LANGUAGE_SPECIFIC && this.productFields[FRAME_TYPE_FIELD] === RIMLESS) {
            this._seeFrameColor = true;
        }

        //Added as part of BS-755
        if (this.productFields[SPAREPART_TYPE] == TEMPLE_SPARE_PART_DE || this.productFields[SPAREPART_TYPE] == TEMPLE_SPARE_PART_EN) {
            this.isTempleProduct = true;
        }

        // Added as part of BS-357
        //Added as part of BS-1175
        let categoryList = JSON.parse(JSON.stringify(this.categoryPath));
        let categoryNameList = [];
        for (let index = 0; index < categoryList.length; index++) {
            categoryNameList.push(categoryList[index].name);
        }
        let categoryBasedAdditionalAttributeList = [];
        if (this.additionalAttributeFieldAndLabelList !== undefined && this.additionalAttributeFieldAndLabelList !== null) {
            let attributeFieldList = JSON.parse(JSON.stringify(this.additionalAttributeFieldAndLabelList));
            for (let index = 0; index < attributeFieldList.length; index++) {
                let isApplicableField = false;
                for (let categoryIndex = 0; categoryIndex < categoryNameList.length; categoryIndex++) {
                    if (attributeFieldList[index].categoryList != null && attributeFieldList[index].categoryList.includes(categoryNameList[categoryIndex])) {
                        isApplicableField = true;
                        break;
                    }
                }
                if (isApplicableField === true) {
                    categoryBasedAdditionalAttributeList.push(attributeFieldList[index]);
                }
                this.additionalAttributeFieldAndLabelList = Array.from(categoryBasedAdditionalAttributeList);
            }
        }

        if (this.additionalAttributeFieldAndLabelList !== undefined && this.productFields !== null) {
            // BS-567 Start
            this._frameColorLabel = PDP_LABELS.split(',')[7];
            +' :';
            this._frameColorDescription = this.productFields[FRAME_COLOR_DESCRIPTION];

            this._frameColor = this.productFields[STOCK_KEEPING_UNIT_FIELD] != null ? this.productFields[STOCK_KEEPING_UNIT_FIELD].substring(7, 11) : false;
            if (this.productFields[HEXCODE]) {
                this._backgroundColorUpper = 'background-color: ' + this.productFields[HEXCODE] + ';';
            } else {
                if (this.productFields[HEX_CODE_ACCENT]) {
                    this._backgroundColorUpper = 'background-color: ' + this.productFields[HEX_CODE_ACCENT] + ';';
                } else {
                    this._backgroundColorUpper = false;
                }
            }
            if (this.productFields[HEX_CODE_ACCENT]) {
                this._backgroundColorLower = 'background-color: ' + this.productFields[HEX_CODE_ACCENT] + ';';
            } else {
                if (this.productFields[HEXCODE]) {
                    this._backgroundColorLower = 'background-color: ' + this.productFields[HEXCODE] + ';';
                } else {
                    this._backgroundColorLower = false;
                }
            }
            //BS-567 End

            //Added as part of BS-582
            if (this.productFields[RIMLESS_VARIANT_FIELD] === PICKLIST_VALUE_DEMO_LANGUAGE_SPECIFIC && this._isSilhouetteStore === true) {
                let result = await productSearch({
                    communityId: communityId,
                    effectiveAccountId: this.effectiveAccountId,
                    productId: this.productId,
                    relationType: DEMO_TO_CHASSIS_PICKLIST,
                    relatedProductIdList: null
                });
                if (result !== null && result !== undefined) {
                    this._noChassisAvailable = false;
                    this._seeChassisButton = true; //BS-754
                    this._relatedChassisProductId = result.products[0].id;
                } else {
                    this._noChassisAvailable = true; //BS-754
                }
            } else {
                this._noChassisAvailable = false; //BS-754
            }
            //BS-2249
            if (this.productFields[FRAME_TYPE_FIELD] === RIMLESS && this.productFields[RIMLESS_VARIANT_FIELD] != PICKLIST_VALUE_DEMO_LANGUAGE_SPECIFIC) {
                this._isShowClipOns = true;
            }
            this.populateAdditionalAttribute();
        }
        this._resolveConnected();
        const sparePartPicklist = 'Spare Part';
        const styleShades = 'Style Shades';
        const lenses = 'Lenses'; //BS-579

        //BS-579 checking the brand and handling the calls for the related product links.
        if (this.brand !== EE_BRAND) {
            this.sectionHeader = PDP_SHADES;
            this.triggerProductSearch(styleShades, this._styleShadeIdList);
        }
        this.triggerProductSearch(sparePartPicklist, this._sparePartIdList);

        //BS-579 handling the call for lenses when store is SH and brand of the product is 'evil eye'
        if (currentStore.includes(SH_STORE) && this.brand === EE_BRAND) {
            this._isEvilEyeProduct = true;
            this.sectionHeader = additionalLensesHeaderLabel;
            this.triggerProductSearch(lenses, this._lensesProductIdList);
        }
        if (this.displayDemoButton) {
            this.triggerProductSearch(PICKLIST_VALUE_DEMO, this._demoProdcuctIdList);
        }
        //BS-1500 For Showing Chassis Button of Evil Eye
        if (this.brand == EE_BRAND) {
            await getSourceTargetStatus({ productId: this.productId })
                .then((result) => {
                    if (result.isUnglazed && result.isGlazed && result.relatedProductId) this._isUnglazed = result.isUnglazed;
                    this._isGlazed = result.isGlazed;
                    this._relatedChassisProductId = result.relatedProductId;
                })
                .catch((errorInstance) => {
                    console.error(errorInstance);
                });
        }
        fireEvent(this.pageRef, BRAND_TYPE_EVT, { checkEvilEye: this._isEvilEyeProduct });
        this.triggerGetProductMedia();
    }

    disconnectedCallback() {
        this._connected = new Promise((resolve) => {
            this._resolveConnected = resolve;
        });
    }

    /**
     * BS-1650
     * This method fetches the product record details.
     */
    async getProductAvailability() {
        await getSelectedProductDetail({ recordId: this.productId })
            .then((result) => {
                if (result !== undefined && result !== null) {
                    if (result.B2B_Availability_JSON__c !== undefined && result.B2B_Availability_JSON__c !== null) {
                        let countryCodeClone = this.countryCode;
                        countryCodeClone = countryCodeClone.substring(0, 4);
                        this._isDisabledProduct = checkProductAvailability(result.B2B_Availability_JSON__c, countryCodeClone);
                        this.getOrderTypeValues();
                    }
                }
                if (result.B2B_RX_Able__c != true) {
                    this._eligibleForRX = false;
                    this._eligibleForVS = false;
                }
            })
            .catch((error) => {});
    }

    /**
     * BS-787
     * This method is used to check eligibility of current product for VS-RX
     *
     * @type {Category[]}
     */
    checkEligibilityForVisionSensationRXGlazing() {
        checkEligibilityForVSRX({ accountId: this.effectiveAccountId })
            .then((result) => {
                if (result != null && result != undefined) {
                    if (result.isEligibleForRX && result.isEligibleForRX == true) {
                        if (this.productCategoriesCollection != null && this.productCategoriesCollection != undefined) {
                            this.productCategoriesCollection.forEach((category) => {
                                if (category.name == FRAME_CATEGORY_LABEL) {
                                    this._eligibleForRX = true;
                                    this.getProductAvailability();
                                }
                            });
                        }
                    }
                    if (result.isEligibleForVS && result.isEligibleForVS == true) {
                        if (this.productCategoriesCollection != null && this.productCategoriesCollection != undefined) {
                            this.productCategoriesCollection.forEach((category) => {
                                if (this._vsEligibleCategories.includes(category.name) == true) {
                                    this._eligibleForVS = true;
                                    this.getProductAvailability(); //BS-2009
                                    this._applicableBrand = VISION_SENSATION;
                                    if (category.name == this._vsEligibleCategories[3]) {
                                        this._isSunglasses = true;
                                        this.getProductAvailability(); //BS-2009
                                    }
                                }
                            });
                        }
                    }
                }
            })
            .catch((exceptionInstance) => {
                console.error('Error:', exceptionInstance);
            });
    }

    /**
     * Gets or sets the ordered hierarchy of categories to which the product belongs, ordered from least to most specific.
     *
     * @type {Category[]}
     */
    @api
    get categoryPath() {
        return this._categoryPath;
    }

    set categoryPath(newPath) {
        this._categoryPath = newPath;
        this.resolveCategoryPath(newPath || []);
    }

    get hasPrice() {
        return ((this.price || {}).negotiated || '').length > 0;
    } //BS-2002

    get isPriceNotZeroOrFree() {
        return ((this.price || {}).negotiated || '').length > 0 && this.price.negotiated != 0 && this.price.negotiated != -1;
    } //BS-1951

    get isPriceZero() {
        return ((this.price || {}).negotiated || '').length > 0 && this.price.negotiated == 0;
    }

    get isProductFree() {
        return ((this.price || {}).negotiated || '').length > 0 && this.price.negotiated == -1;
    }

    get hasRecommendedRetailPrice() {
        return (this.price || {}).recommendedRetailPrice && this.price.recommendedRetailPrice != 0;
    } //BS-1951

    //BS-1245
    get applicableCurrencyCode() {
        return (this.price || {}).currency != undefined && (this.price || {}).currency != null ? (this.price || {}).currency : this._defaultCurrencyIsoCode;
    }
    //BS-1245

    get _isAddToCartDisabled() {
        if (this._invalidQuantity || this.cartLocked || this.disableProduct) {
            return true;
        }
        return false;
    }

    get isProductDisabled() {
        return this.disableProduct;
    }

    get totalSpareProducts() {
        return this._totalSpareProducts;
    }

    handleQuantityChange(event) {
        if (event.target.validity.valid && event.target.value) {
            this._invalidQuantity = false;
            this._quantityFieldValue = event.target.value;
        } else {
            this._invalidQuantity = true;
            event.target.reportValidity();
        }
    }

    quantityIncrease() {
        let qtyInput = this.template.querySelector('.quantity-field');
        let qtyValue = qtyInput.value;
        qtyInput.value++;
        if (qtyInput.validity.valid) {
            this._quantityFieldValue = qtyInput.value;
            this._invalidQuantity = false;
        } else {
            qtyInput.value = qtyValue;
            if (!qtyInput.validity.valid) {
                this._invalidQuantity = true;
            }
        }
    }

    quantityDecrease() {
        let qtyInput = this.template.querySelector('.quantity-field');
        let qtyValue = qtyInput.value;
        qtyInput.value--;
        if (qtyInput.validity.valid) {
            this._quantityFieldValue = qtyInput.value;
            this._invalidQuantity = false;
        } else {
            qtyInput.value = qtyValue;
            if (!qtyInput.validity.valid) {
                this._invalidQuantity = true;
            }
        }
    }

    /**
     * Emits a notification that the user wants to add the item to their cart.
     *
     * @fires ProductDetailsDisplay#addtocart
     * @private
     */
    notifyAddToCart() {
        let quantity = this._quantityFieldValue;
        let isOverlay = false;
        if (this._disableCart == false) {
            this.dispatchEvent(
                new CustomEvent('addtocart', {
                    detail: {
                        quantity,
                        isOverlay
                    }
                })
            );
        }
    }

    /**
     * Emits a notification that the user wants to add the item to their cart from overlay.
     *
     * @fires ProductDetailsDisplay#addtocart
     * @private
     */
    notifyAddToCartModal(event) {
        let quantity = event.detail.quantity;
        let isOverlay = true;
        let productId = event.detail.productId;
        this.dispatchEvent(
            new CustomEvent('addtocart', {
                detail: {
                    quantity,
                    isOverlay,
                    productId
                }
            })
        );
    }

    /**
     * Emits a notification that the user wants to add the item to their cart from style shades.
     *
     * @fires ProductDetailsDisplay#addtocart
     * @private
     */
    notifyAddToCartShades(event) {
        let quantity = event.detail.quantity;
        let isOverlay = false;
        let isStyleShade = true;
        let productId = event.detail.productId;
        this.dispatchEvent(
            new CustomEvent('addtocart', {
                detail: {
                    quantity,
                    isOverlay,
                    productId,
                    isStyleShade
                }
            })
        );
    }

    /**
     * Updates the breadcrumb path for the product, resolving the categories to URLs for use as breadcrumbs.
     * @param {Category[]} newPath
     *  The new category "path" for the product.
     */
    resolveCategoryPath(newPath) {
        const path = [homePage].concat(
            newPath.map((level) => ({
                name: level.name,
                type: 'standard__recordPage',
                attributes: {
                    actionName: 'view',
                    recordId: level.id
                }
            }))
        );

        this._connected
            .then(() => {
                const levelsResolved = path.map((level) =>
                    this[NavigationMixin.GenerateUrl]({
                        type: level.type,
                        attributes: level.attributes
                    }).then((url) => ({
                        name: level.name,
                        url: url
                    }))
                );

                return Promise.all(levelsResolved);
            })
            .then((levels) => {
                this._resolvedCategoryPath = levels;
                //BS-740
                if (
                    this._resolvedCategoryPath[this._resolvedCategoryPath.length - 1].name == LENSE_CATEGORY ||
                    this._resolvedCategoryPath[this._resolvedCategoryPath.length - 1].name == LENSE_CATEGORY_GERMAN
                ) {
                    this._isLenses = true;
                }
            });
    }

    /**
     * Gets the iterable fields.
     *
     * @returns {IterableField[]}
     *  The ordered sequence of fields for display.
     * @private
     */
    get _displayableFields() {
        // Enhance the fields with a synthetic ID for iteration.
        return (this.customFields || []).map((field, index) => ({
            ...field,
            id: index
        }));
    }

    get displayFields() {
        return this._displayableFields.length > 0 ? true : false;
    }

    sparePartsModal() {
        this.displayData = {};
        this._showSpare = true;
        this.modalHeader = this.sparePartsHeader;

        let valueList = Array.from(this._spareProducts);

        this._startingRecord = (this._pageNumber - 1) * this.pageSizeForPopUp;
        this._endingRecord = this._pageNumber * this.pageSizeForPopUp;

        valueList = valueList.slice(this._startingRecord, this._endingRecord);

        this.sparePartResults.products = valueList;

        this._totalSpareProducts = this._spareProducts.length;
        this.totalProducts = this._totalSpareProducts;
        this.displayData = this.sparePartResults;
        this.show();
    }

    demoModal() {
        this.displayData = {};
        this._showDemo = true;
        this.modalHeader = this.demoHeader;

        let valueList = Array.from(this._demoProducts);

        this._startingRecord = (this._pageNumber - 1) * this.pageSizeForPopUp;
        this._endingRecord = this._pageNumber * this.pageSizeForPopUp;

        valueList = valueList.slice(this._startingRecord, this._endingRecord);

        this.demoResults.products = valueList;

        this._totalDemoProducts = this._demoProducts.length;
        this.totalProducts = this._totalDemoProducts;
        this.displayData = this.demoResults;
        this.show();
    }

    @api show() {
        this.showModal = true;
        this.handleShowModal();
    }

    @api hide() {
        this.showModal = false;
        this.handleCloseModal();
    }

    handleShowModal() {
        const modal = this.template.querySelector('c-b2b_modal');
        modal.setWidth('slds-modal_medium');
        modal.show();
    }

    handleCloseModal() {
        const modal = this.template.querySelector('c-b2b_modal');
        modal.hide();
    }

    /**
     * Gets or sets the normalized, displayable results for use by the display components.
     * @private
     */
    get displayData() {
        return this._displayData || {};
    }
    set displayData(data) {
        this._displayData = transformData(data, this.cardContentMapping);
    }

    _shadesData;
    _sectionProductResult; //BS-579
    _sectionProductData; //BS-579

    /**
     * Gets or sets the normalized, displayable results for use by the display components.
     * BS-579
     * @private
     */
    get normalizedResultsData() {
        if (this._sectionProductData) {
            this._sectionProductData.layoutData = this._sectionProductData.layoutData.sort(sortBy('name', 1));
            if (this._sectionProductData.layoutData.length > this.pageSize) {
                this.displayArrows = true;
                let auxSectionData = { layoutData: [] };
                let sliceIndex = this.pageSize + this._sectionIndex;
                for (let index = this._sectionIndex; index < sliceIndex; index++) {
                    auxSectionData.layoutData.push(this._sectionProductData.layoutData[index]);
                }
                return auxSectionData;
            }
        }
        return this._sectionProductData;
    }

    set normalizedResultsData(data) {
        if (data != null) {
            this._sectionProductData = transformData(data, this.cardContentMapping);
        }
    }

    get shadesContainerClass() {
        return this.displayArrows == true ? 'slds-align_absolute-center' : 'style-shades-container';
    }

    /**
     * BS-449 - added the logic to hide and show the left arrow icon based on the _sectionIndex
     * updated the variable name
     */
    get leftArrowClass() {
        this._sectionIndex == 0 ? (this._showLeftArrow = false) : (this._showLeftArrow = true);
        return this._sectionIndex == 0 ? 'opacity50 default-cursor' : 'arrow';
    }

    /**
     * BS-449 - added the logic to hide and show the right arrow icon based on the _sectionIndex
     * updated the variable name
     */
    get rightArrowClass() {
        let sliceIndex = this.pageSize + this._sectionIndex;
        sliceIndex < this._sectionProductResult.products.length ? (this._showRightArrow = true) : (this._showRightArrow = false);
        return sliceIndex < this._sectionProductResult.products.length ? 'arrow' : 'opacity50 default-cursor';
    }

    get stockAvailabilityIcon() {
        let availabilityIcon;
        if (this.deliveryStatusJ && this.countryCode) {
            if (this.deliveryStatusJ[this.countryCode.substring(0, 4)] > 0) {
                return (availabilityIcon = STORE_STYLING + '/icons/Available.svg');
            } else {
                return (availabilityIcon = STORE_STYLING + '/icons/Not_Available.svg');
            }
        }
    }

    _pageNumber = 1;

    /**
     * Gets the current page number.
     *
     * @type {Number}
     * @readonly
     * @private
     */
    get pageNumber() {
        return this._pageNumber;
    }

    triggerProductSearch(type, productIdList) {
        productSearch({
            communityId: communityId,
            effectiveAccountId: this.effectiveAccountId,
            productId: this.productId,
            relationType: type,
            relatedProductIdList: productIdList
        })
            .then((result) => {
                if (result != null) {
                    //BS-1245
                    let pricebookEntryIdCollection = [];
                    if (result) {
                        result.products.forEach((product) => {
                            if (
                                product != null &&
                                product != undefined &&
                                product.prices != null &&
                                product.prices != undefined &&
                                product.prices.pricebookEntryId != null &&
                                product.prices.pricebookEntryId != undefined
                            ) {
                                pricebookEntryIdCollection.push(product.prices.pricebookEntryId);
                            }
                        });
                        this.getApplicableCurrencyCode(pricebookEntryIdCollection, type);
                    }
                    //BS-1245

                    for (let index = 0; index < result.products.length; index++) {
                        if (result.products[index].error.errorCode != undefined) {
                            result.products.splice(index, 1);
                            index--;
                        }
                    }
                    if (result.products.length == 0) {
                        result = null;
                    }
                }

                if (type == 'Spare Part') {
                    if (result != null) {
                        this.sparePartResults = result;
                        this.sparePartResults.products.forEach((product) => {
                            if (this._sparePartIdList.includes(product.id) == false) {
                                this._sparePartIdList.push(product.id);
                            }
                        });
                        this._spareProducts = this._spareProducts.concat(this.sparePartResults.products);
                        this.triggerProductSearch(type, this._sparePartIdList);
                    } else if (this.sparePartResults == null) {
                        this.sparePartResults = false;
                    }
                } else if (type == 'Demo') {
                    if (result != null) {
                        this.demoResults = result;
                        this.demoResults.products.forEach((product) => {
                            if (this._demoProdcuctIdList.includes(product.id) == false) {
                                this._demoProdcuctIdList.push(product.id);
                            }
                        });
                        this._demoProducts = this._demoProducts.concat(this.demoResults.products);
                        this.triggerProductSearch(type, this._demoProdcuctIdList);
                    } else if (this._demoProducts == null) {
                        this.demoResults = false;
                    }
                } else if (type == 'Style Shades') {
                    if (result != null) {
                        let tempResults = result;
                        tempResults.products.forEach((product) => {
                            this._styleShadeIdList.push(product.id);
                        });
                        if (this._styleShades.length == 0) {
                            this._styleShades = result;
                        } else {
                            this._styleShades.products = this._styleShades.products.concat(result.products);
                            this._styleShades.total = this._styleShades.products.length;
                        }
                        this.triggerProductSearch(type, this._styleShadeIdList);
                        this.normalizedResultsData = this._styleShades; //BS-579
                        this._sectionProductResult = this._styleShades; //BS-579
                    } else if (this._styleShades == null) {
                        this.normalizedResultsData = null; //BS-579
                    }
                } else if (type == 'Lenses') {
                    /**
                     * Checking if the type is lenses fetching the product links.
                     * Added as part of BS-579
                     */
                    if (result != null) {
                        let tempResults = result;
                        tempResults.products.forEach((product) => {
                            this._lensesProductIdList.push(product.id);
                        });
                        if (this._lensesProducts.length == 0) {
                            this._lensesProducts = result;
                        } else {
                            this._lensesProducts.products = this._lensesProducts.products.concat(result.products);
                            this._lensesProducts.total = this._lensesProducts.products.length;
                        }
                        this.triggerProductSearch(type, this._lensesProductIdList);
                        this.normalizedResultsData = this._lensesProducts;
                        this._sectionProductResult = this._lensesProducts;
                    } else if (this._lensesProducts == null) {
                        this.lensesProducts = null;
                    }
                }
                this.dispatchEvent(
                    new CustomEvent('loadingproduct', {
                        detail: {
                            loading: false
                        }
                    })
                );
            })
            .catch((error) => {
                console.log('Error: ' + JSON.stringify(error));
            });
    }

    /**
     * BS-1245
     * This method is used to get the applicable currency ISO Code from pricebookEntry
     */
    getApplicableCurrencyCode(pricebookEntryIdCollection, type) {
        getCurrencyCode({ pricebookEntryIdList: pricebookEntryIdCollection })
            .then((result) => {
                if (type == TYPE_SPARE_PART) {
                    if (result[0]) {
                        this._applicableCurrencyCodeForSpareParts = result[0];
                    }
                } else if (type == TYPE_STYLE_SHADES || type == TYPE_LENSES || type == TYPE_DEMO) {
                    if (result[0]) {
                        this._applicableCurrencyCodeForStyleShades = result[0];
                    }
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /**
     * Handles a user request to navigate to the product detail page.
     * @private
     */
    handleShowDetail(evt) {
        evt.stopPropagation();

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: evt.detail.productId,
                actionName: 'view'
            }
        });
    }

    //384
    /**
     * Return the Product Description.
     */
    get productDescriptionValue() {
        let productDescriptionValueText = this.decodeHTMLEntities(this.productDescription);
        if (
            this._isSilhouetteStore === true &&
            productDescriptionValueText &&
            productDescriptionValueText.length != undefined &&
            productDescriptionValueText.length > 110
        ) {
            this._showMoreButton = true;
        } else if (
            this._isSilhouetteStore === false &&
            productDescriptionValueText &&
            productDescriptionValueText.length != undefined &&
            productDescriptionValueText.length > 89
        ) {
            this._showMoreButton = true;
        } else {
        }
        return this.decodeHTMLEntities(this.productDescription);
    }

    /**
     * Decode the string from HTML Entities to String.
     * @type {String}
     */
    decodeHTMLEntities(text) {
        var entities = [
            ['amp', '&'],
            ['apos', "'"],
            ['#x27', "'"],
            ['#x2F', '/'],
            ['#39', "'"],
            ['#47', '/'],
            ['lt', '<'],
            ['gt', '>'],
            ['nbsp', ' '],
            ['quot', '"']
        ];
        if (text) {
            entities.forEach((item) => {
                text = text.replace(new RegExp('&' + item[0] + ';', 'g'), item[1]);
            });
            return text;
        }
    }

    triggerGetProductMedia() {
        getProductMedia({
            productId: this.productId
        })
            .then((result) => {
                if (result.length > 0) {
                    //BS-2249
                    let isClipOn = false;
                    if (this._isShowClipOns) {
                        result.forEach((media) => {
                            if (media.mediaType == RELATED_CLIP_ONS && media.mediaUrl) {
                                this._clipOnURL = media.mediaUrl;
                                isClipOn = true;
                            }
                        });
                    }
                    if (isClipOn == false) {
                        this._isShowClipOns = false;
                        this._clipOnURL = null;
                    }
                    this.productMedias = [];
                    JSON.parse(JSON.stringify(result)).forEach((mediaRecord) => {
                        if (mediaRecord.mediaType != RELATED_CLIP_ONS) {
                            this.productMedias.push(mediaRecord);
                        }
                    });
                    if (this._isEvilEyeFrameProduct === true && this.productMedias !== null) {
                        let dealerCatalogueObj = {
                            mediaType: this._dealerCatalogue,
                            mediaUrl: this._evilEyeProductCatalogueLink
                        };
                        this.productMedias.push(dealerCatalogueObj);
                    }
                }

                //Added as part of BS-578
                else if (this._isEvilEyeFrameProduct === true) {
                    this.productMedias = [];
                    let dealerCatalogueObj = {
                        mediaType: this._dealerCatalogue,
                        mediaUrl: this._evilEyeProductCatalogueLink
                    };
                    this.productMedias.push(JSON.parse(JSON.stringify(dealerCatalogueObj)));
                } else {
                    this.productMedias = false;
                }
            })
            .catch((error) => {
                console.log('Error: ' + JSON.stringify(error));
            });
    }

    /**
     * BS-449 - added the logic to hide and show the left arrow icon based on the _sectionIndex
     * updated as part of BS-579
     */
    leftArrowClick() {
        if (this._sectionIndex > 0) {
            this._sectionIndex--;
            this._sectionIndex == 0 ? (this._showLeftArrow = false) : (this._showLeftArrow = true);
            let sliceIndex = this.pageSize + this._sectionIndex;
            sliceIndex < this._sectionProductResult.products.length ? (this._showRightArrow = true) : (this._showRightArrow = false);
        }
    }

    rightArrowClick() {
        let sliceIndex = this.pageSize + this._sectionIndex;
        if (sliceIndex < this._sectionProductResult.products.length) {
            this._sectionIndex++;
            let sliceIndex = this.pageSize + this._sectionIndex;
            sliceIndex < this._sectionProductResult.products.length ? (this._showRightArrow = true) : (this._showRightArrow = false);
            this._showLeftArrow = true;
        }
    }

    handlePreviousPage() {
        this._pageNumber = this._pageNumber - 1;
        if (this._showSpare) {
            this.sparePartsModal();
        }
        if (this._showDemo) {
            this.demoModal();
        }
    }

    handleNextPage() {
        this._pageNumber = this._pageNumber + 1;
        if (this._showSpare) {
            this.sparePartsModal();
        }
        if (this._showDemo) {
            this.demoModal();
        }
    }

    handleResetPage() {
        this._pageNumber = 1;
        this._startingRecord = 1;
        this._endingRecord = 0;
        this._totalProducts = 0;
        this.displayData = null;
        this._showSpare = false;
        this._showDemo = false;
    }

    /**
     * Method which controls the visibility of additional attribute section and updated the labels accordingly.
     * BS-357
     */
    updateShowMore() {
        if (this._showMoreBoolean === false) {
            this._additionalAttributeLabel = this._showLess;
            this._showMoreBoolean = true;
            localStorage.setItem(SHOW_MORE_SELECTION, this._showMoreBoolean);
        } else {
            this._additionalAttributeLabel = this._showMore;
            this._showMoreBoolean = false;
            localStorage.setItem(SHOW_MORE_SELECTION, this._showMoreBoolean);
        }
    }

    /**
     * Method triggers the navigation to the related chassis product's PDP
     * BS-582
     */
    handleNavigationToChassis() {
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this._relatedChassisProductId,
                actionName: 'view'
            }
        }).then((url) => {
            window.open(url, '_blank');
        });
    }

    /**
     * Method triggers the navigation to the related chassis and demo product's PDP
     * BS-1500
     */
    handleNavigationToChassisAndDemo() {
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this._relatedChassisProductId,
                actionName: 'view'
            }
        }).then((url) => {
            window.open(url, '_self');
        });
    }

    handleHidePriceSection() {
        this._hideSilhouettePricesFromTile = true;
    }

    handleShowPriceSection() {
        this._hideSilhouettePricesFromTile = false;
    }
    showCompleteDescription() {
        this._productDescriptionClass = 'slds-m-top_x-small justify-text descriptionreadless';
        this._readButtonClass = 'description-container read-less-button readButton'; //Classes updated as part of BS-1622
        this._showLessButton = true;
    }
    hideDescription() {
        this._productDescriptionClass = 'slds-m-top_x-small justify-text descriptionreadmore';
        this._readButtonClass = 'description-container read-more-button readButton'; //Classes updated as part of BS-1622
        this._showLessButton = false;
    }
    /**
     * BS-787
     * This method is used to handle the event fired on click of VS-RX button on PDP page
     *
     */
    handleVSRXButtonClick(event) {
        this._showPopUpForOrderInformation = true;
    }

    /**
     * BS-787
     * This method is used to close the popup screen that is used to enter customer information for VS RX
     *
     */
    closePopup() {
        this._showPopUpForOrderInformation = false;
    }

    /**
     * BS-787
     * This method is used to get order type picklist values from B2B_Lens_Configurator__c from database
     *
     */
    getOrderTypeValues() {
        getPicklistData({ objectApiName: LENS_CONFIGURATOR_OBJECT_API_NAME, picklistField: B2B_ORDER_TYPE })
            .then((data) => {
                this.orderTypeValues = JSON.parse(JSON.stringify(data));
                if (this._fromVsRx == false) {
                    this.getFrameTypeValues();
                }
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                //this.fireOperateLoader(false); // Firing event to stop the loader/spinner
            });
    }

    /**
     * BS-787
     * This method is used to get frame type picklist values from B2B_Lens_Configurator__c from database and to construct the customer information collection to be shown on UI for user inputs
     *
     */
    getFrameTypeValues() {
        getPicklistData({ objectApiName: LENS_CONFIGURATOR_OBJECT_API_NAME, picklistField: B2B_FRAME_TYPE })
            .then((data) => {
                this.frameTypeValuesCollection = JSON.parse(JSON.stringify(data));

                let parsedcustomerOrderInformationCollection = [];
                let preservedOrderInformationCollection;
                let orderInformationSummaryKey;
                let lensOnlyAndFramesProvidedCountryCodeList = LENS_ONLY_AND_FRAME_PROVIDED_EXCLUDED_COUNTRY_CODES.split(','); //BS-1415

                if (this._applicableBrand != null && this._applicableBrand != undefined && this._applicableBrand == VISION_SENSATION) {
                    orderInformationSummaryKey = VS_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE;
                } else if (this._applicableBrand != null && this._applicableBrand != undefined && this._applicableBrand == RX_GLAZING) {
                    orderInformationSummaryKey = RX_ORDER_INFORMATION_KEY_FOR_LOCAL_STORAGE;
                }

                // Currently commenting out this below code that makes use of local storage. Will encorporate this on demand
                /* if (orderInformationSummaryKey != null && orderInformationSummaryKey != undefined && localStorage.getItem(orderInformationSummaryKey) != null && localStorage.getItem(orderInformationSummaryKey) != undefined) {
                    // Fetching preserved details of order information summary stored for VS from local storage
                    let decodedFormattedOrderInformationCollection = atob(localStorage.getItem(orderInformationSummaryKey));
                    preservedOrderInformationCollection = JSON.parse(decodedFormattedOrderInformationCollection);
                } */

                for (let i = 0; i < B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',').length; i++) {
                    if (i < 4) {
                        const customerOrderInformationCollection = {};
                        customerOrderInformationCollection.label = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[i]; //label: Collection element to hold label that needs to be displayed on UI
                        customerOrderInformationCollection.value = ''; //value : Collection element to hold value that is entered by user on UI
                        customerOrderInformationCollection.isChecked = false; //isChecked : Collection element to indicate whether the value is selected by user from UI (Used for radio button type inputs)
                        customerOrderInformationCollection.isCustomerInput = false; //isCustomerInput : Collection element to indicate whether this is needed from user in form of input
                        customerOrderInformationCollection.isCustomerOutput = false; //isCustomerOutput : Collection element to indicate whether this is provided by user in form of output and these fields will be dispalyed on ready only screen
                        customerOrderInformationCollection.isOrderType = false; //isOrderType: Collection element to decide whether the field is of order type category
                        customerOrderInformationCollection.isFrameType = false; //isFrameType: Collection element to decide whether the field is of frame type category
                        customerOrderInformationCollection.isInvalid = false; //isInvalid: Collection element to decide whether the value entered by User on UI is vallid/Invalid
                        customerOrderInformationCollection.fieldName = ''; //fieldName: Collection element to hold fieldName
                        customerOrderInformationCollection.isOnFrameDetails = false; //BS-787 to identify frame type or order type
                        customerOrderInformationCollection.isOrderTypeLabel = false; //BS-787 to identify order type
                        customerOrderInformationCollection.isFrameTypeLabel = false; //BS-787 to identify frame type
                        customerOrderInformationCollection.isVsPage = false; //BS-787 to identify current page

                        //In Custom Labels, first 2 labels are used to represent customer input fields (Customer Name and Clerk)
                        if (i < 2) {
                            customerOrderInformationCollection.isCustomerInput = true; // As this fields needs input from customer, marking the element isCustomerInput as true
                            customerOrderInformationCollection.isCustomerOutput = true; // As this field needs to be displayed as output on ready only screen, marking element isCustomerOutput as true
                            customerOrderInformationCollection.applicableStyling = REGULAR_CONDITION_STYLING; // applicableStyling: Collection element to represent the styling class needs to be applied

                            if (i == 0) {
                                customerOrderInformationCollection.fieldName = CUSTOMER_NAME_FIELD; // BS-787 Setting up fieldName that needs to be used while fetching data from local storage
                            } else if (i == 1) {
                                customerOrderInformationCollection.fieldName = CLERK_FIELD; // BS-787 Setting up fieldName that needs to be used while fetching data from local storage
                            }
                            // Setting up applicableStyling as regular condition styling as input is not provided yet and validation checking is not performed
                        } else if (i >= 2 && i <= 3) {
                            //BS-787 setting values for new variables
                            if (i == 2) {
                                customerOrderInformationCollection.isVsPage = true;
                                customerOrderInformationCollection.fieldName = ORDER_TYPE_FIELD;
                                customerOrderInformationCollection.isOrderTypeLabel = true; //isOrderType: Collection element to decide whether the field is of order type category
                            } else if (i == 3) {
                                if (this.pageSource == 'VS') {
                                    customerOrderInformationCollection.isVsPage = true;
                                    customerOrderInformationCollection.fieldName = FRAMES_TYPE_FIELD;
                                    customerOrderInformationCollection.isFrameTypeLabel = true;
                                } else {
                                    customerOrderInformationCollection.isVsPage = false;
                                }
                            }

                            //In Custom Labels, from 2 to 3 position holds the labels that contains the fields labels that needs to be disaplyed as output on read only screen mode
                            customerOrderInformationCollection.isOnFrameDetails = true;
                        }
                        parsedcustomerOrderInformationCollection.push(customerOrderInformationCollection);
                    }
                }

                //Iterating over the obtained picklist values collection and preparing customer information summary collection
                this.orderTypeValues.picklistValues.forEach((value) => {
                    // Updated the check as a part of BS-2009
                    if (this._isDisabledProduct == true) {
                        if (value.apiName !== COMPLETE_EYEWEAR_FIELD) {
                            const customerOrderInformationCollection = {};
                            customerOrderInformationCollection.label = value.picklistValue; //label: Collection element to hold label that needs to be displayed on UI
                            customerOrderInformationCollection.value = ''; //value : Collection element to hold value that is entered by user on UI
                            customerOrderInformationCollection.isChecked = false; //isChecked : Collection element to indicate whether the value is selected by user from UI (Used for radio button type inputs)
                            customerOrderInformationCollection.isCustomerInput = false; //isCustomerInput : Collection element to indicate whether this is needed from user in form of input
                            customerOrderInformationCollection.isCustomerOutput = false; //isCustomerOutput : Collection element to indicate whether this is provided by user in form of output and these fields will be dispalyed on ready only screen
                            customerOrderInformationCollection.isOrderType = true; //isOrderType: Collection element to decide whether the field is of order type category
                            customerOrderInformationCollection.isFrameType = false; //isFrameType: Collection element to decide whether the field is of frame type category
                            customerOrderInformationCollection.isInvalid = false; //isInvalid: Collection element to decide whether the value entered by User on UI is vallid/Invalid
                            if (value.apiName == LENS_ONLY_FIELD) {
                                customerOrderInformationCollection.fieldName = LENS_ONLY_FIELD;
                            } else if (value.apiName == LENS_ONLY_AND_FRAME_PROVIDED_FIELD) {
                                customerOrderInformationCollection.fieldName = LENS_ONLY_AND_FRAME_PROVIDED_FIELD;
                            }
                            //Bs-1415 Start
                            if (value.apiName === LENS_ONLY_AND_FRAME_PROVIDED_FIELD) {
                                if (lensOnlyAndFramesProvidedCountryCodeList.includes(this.countryCode.slice(0, 4)) === false) {
                                    parsedcustomerOrderInformationCollection.push(customerOrderInformationCollection);
                                }
                            } else {
                                parsedcustomerOrderInformationCollection.push(customerOrderInformationCollection);
                            }
                            //Bs-1415 End
                        }
                    } else {
                        const customerOrderInformationCollection = {};
                        customerOrderInformationCollection.label = value.picklistValue; //label: Collection element to hold label that needs to be displayed on UI
                        customerOrderInformationCollection.value = ''; //value : Collection element to hold value that is entered by user on UI
                        customerOrderInformationCollection.isChecked = false; //isChecked : Collection element to indicate whether the value is selected by user from UI (Used for radio button type inputs)
                        customerOrderInformationCollection.isCustomerInput = false; //isCustomerInput : Collection element to indicate whether this is needed from user in form of input
                        customerOrderInformationCollection.isCustomerOutput = false; //isCustomerOutput : Collection element to indicate whether this is provided by user in form of output and these fields will be dispalyed on ready only screen
                        customerOrderInformationCollection.isOrderType = true; //isOrderType: Collection element to decide whether the field is of order type category
                        customerOrderInformationCollection.isFrameType = false; //isFrameType: Collection element to decide whether the field is of frame type category
                        customerOrderInformationCollection.isInvalid = false; //isInvalid: Collection element to decide whether the value entered by User on UI is vallid/Invalid
                        if (value.apiName == COMPLETE_EYEWEAR_FIELD) {
                            customerOrderInformationCollection.fieldName = COMPLETE_EYEWEAR_FIELD;
                        } else if (value.apiName == LENS_ONLY_FIELD) {
                            customerOrderInformationCollection.fieldName = LENS_ONLY_FIELD;
                        } else if (value.apiName == LENS_ONLY_AND_FRAME_PROVIDED_FIELD) {
                            customerOrderInformationCollection.fieldName = LENS_ONLY_AND_FRAME_PROVIDED_FIELD;
                        }
                        //Bs-1415 Start
                        if (value.apiName === LENS_ONLY_AND_FRAME_PROVIDED_FIELD) {
                            if (lensOnlyAndFramesProvidedCountryCodeList.includes(this.countryCode.slice(0, 4)) === false) {
                                parsedcustomerOrderInformationCollection.push(customerOrderInformationCollection);
                            }
                        } else {
                            parsedcustomerOrderInformationCollection.push(customerOrderInformationCollection);
                        }
                        //Bs-1415 End
                    }
                });

                this.frameTypeValuesCollection.picklistValues.forEach((frameValue) => {
                    const customerOrderInformationCollection = {};
                    customerOrderInformationCollection.label = frameValue.picklistValue; //label: Collection element to hold label that needs to be displayed on UI
                    customerOrderInformationCollection.value = ''; //value : Collection element to hold value that is entered by user on UI
                    customerOrderInformationCollection.isChecked = false; //isChecked : Collection element to indicate whether the value is selected by user from UI (Used for radio button type inputs)
                    customerOrderInformationCollection.isCustomerInput = false; //isCustomerInput : Collection element to indicate whether this is needed from user in form of input
                    customerOrderInformationCollection.isCustomerOutput = false; //isCustomerOutput : Collection element to indicate whether this is provided by user in form of output and these fields will be dispalyed on ready only screen
                    customerOrderInformationCollection.isOrderType = false; //isOrderType: Collection element to decide whether the field is of order type category
                    customerOrderInformationCollection.isFrameType = true; //isFrameType: Collection element to decide whether the field is of frame type category
                    customerOrderInformationCollection.isInvalid = false; //isInvalid: Collection element to decide whether the value entered by User on UI is vallid/Invalid
                    if (frameValue.apiName == OPTICAL_EYEWEAR_FIELD) {
                        customerOrderInformationCollection.fieldName = OPTICAL_EYEWEAR_FIELD;
                    } else if (frameValue.apiName == SUNGLASSES_FIELD) {
                        customerOrderInformationCollection.fieldName = SUNGLASSES_FIELD;
                    }
                    parsedcustomerOrderInformationCollection.push(customerOrderInformationCollection);
                });

                this._frameTypeHeaderLabel = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[3]; // Setting up frame type header section label
                this._customerInformationHeaderLabel = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[4]; // Setting up Customer information header section label
                this._orderInformationHeaderLabel = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[5]; // Setting up Order information header section label
                this._orderTypeHeaderLabel = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[6]; // Setting up order type header section label
                this._errorInstructionToEnterValue = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[10];
                this._errorInstructionToSelectValue = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[10];

                // If order information collection is preserved or user had already entered the values/data on UI then iterating over preserved collection and fetching the values from it
                if (preservedOrderInformationCollection != null && preservedOrderInformationCollection != undefined) {
                    let parsedCollection = JSON.parse(JSON.stringify(preservedOrderInformationCollection));
                    parsedcustomerOrderInformationCollection.forEach((orderInformation) => {
                        parsedCollection.forEach((parsedOrder) => {
                            if (orderInformation.fieldName == parsedOrder.fieldName) {
                                orderInformation.value = parsedOrder.value;
                                orderInformation.isChecked = parsedOrder.isChecked;
                                orderInformation.isOrderType = parsedOrder.isOrderType;
                            }
                        });
                    });
                } else {
                    parsedcustomerOrderInformationCollection.forEach((orderInformation) => {
                        if (orderInformation.fieldName == COMPLETE_EYEWEAR_FIELD) {
                            orderInformation.value = orderInformation.value;
                            orderInformation.isChecked = true;
                            orderInformation.isOrderType = true;
                        }
                    });
                } //BS-1887
                this._customerInformationSummaryCollection = parsedcustomerOrderInformationCollection;
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
            });
    }

    /**
     * BS-787
     * This method is used to handle event fired on click of save and next button clicked by user on UI
     *
     */
    handleSaveAndNextEvent(event) {
        let customerInformationSummaryCollection = JSON.parse(JSON.stringify(this._customerInformationSummaryCollection)); //BS-2009
        let validity = this.performValidityCheck();
        let targetPage;
        if (validity != null && validity != undefined && validity == true) {
            if (this._applicableBrand != null && this._applicableBrand != undefined && this._applicableBrand == VISION_SENSATION) {
                targetPage = VISION_SENSATION_SITE_PAGE;
            } else if (this._applicableBrand != null && this._applicableBrand != undefined && this._applicableBrand == RX_GLAZING) {
                targetPage = RX_GLAZING_SITE_PAGE;
            }
        }
        // Redirecting user to VS-RX Configurator page to complete further process
        if (targetPage != null && targetPage != undefined) {
            if (this._eligibleForVS) {
                if (this._isSunglasses == true) {
                    /* START : BS-2009 */
                    for (var input in customerInformationSummaryCollection) {
                        if (
                            customerInformationSummaryCollection &&
                            customerInformationSummaryCollection[input].isFrameType &&
                            customerInformationSummaryCollection[input].fieldName == SUNGLASSES_FIELD
                        ) {
                            customerInformationSummaryCollection[input].isChecked = true;
                        }
                        if (customerInformationSummaryCollection && customerInformationSummaryCollection[input].label == FRAME_TYPE) {
                            customerInformationSummaryCollection[input].isFrameTypeLabel = true;
                            customerInformationSummaryCollection[input].isFrameType = true;
                        }
                    }
                } else if (this._isSunglasses == false) {
                    for (var input in customerInformationSummaryCollection) {
                        if (
                            customerInformationSummaryCollection &&
                            customerInformationSummaryCollection[input].isFrameType &&
                            customerInformationSummaryCollection[input].fieldName == OPTICAL_EYEWEAR_FIELD
                        ) {
                            customerInformationSummaryCollection[input].isChecked = true;
                        }
                        if (customerInformationSummaryCollection && customerInformationSummaryCollection[input].label == FRAME_TYPE) {
                            customerInformationSummaryCollection[input].isFrameTypeLabel = true;
                            customerInformationSummaryCollection[input].isFrameType = true;
                        }
                    }
                }
                this._customerInformationSummaryCollection = customerInformationSummaryCollection;
                /* END: BS-2009 */
            }

            this[NavigationMixin.Navigate]({
                type: STANDARD_NAMED_PAGE,
                attributes: {
                    name: targetPage
                },
                state: {
                    pageSource: FROM_PDP_PAGE, //This attribute is used to determine whether user has naviagyed from PDP page (True/False)
                    customerInformationSummaryCollectionFromPDP: JSON.stringify(this._customerInformationSummaryCollection), // This collections contains the information of customer entered by user on UI
                    productData: JSON.stringify(this.finalProductData), // This collections contains the information of product selected by user on UI
                    productId: this.productId // This attribute contains the Id of selected product
                }
            });
        }
    }

    /**
     * BS-787
     * This method is used to perform validity check by checking the values in input felds
     * @return   isValid  : whether the values entered by user are valid
     */
    performValidityCheck() {
        let customerInformationSummaryCollection = JSON.parse(JSON.stringify(this._customerInformationSummaryCollection));
        let checkpointsPassed = 0;
        let isValid = false;
        let orderTypeisValid = false;
        let frameTypeisValid = false;
        let selectedOrderType; //BS-787
        let selectedFrameType; //BS-787
        for (var input in customerInformationSummaryCollection) {
            if (customerInformationSummaryCollection[input].isCustomerInput == true && customerInformationSummaryCollection[input].value != EMPTY) {
                checkpointsPassed++; // Incrementing the checkpointsPassed
                customerInformationSummaryCollection[input].isInvalid = false; // Setting up collection element isInvalid to false as checkpoint is pass
                customerInformationSummaryCollection[input].applicableStyling = REGULAR_CONDITION_STYLING; // Setting up collection element applicableStyling to regular styling
            } else if (customerInformationSummaryCollection[input].isCustomerInput == true && customerInformationSummaryCollection[input].value == EMPTY) {
                // If the input fields is empty, i.e., value is not present in the input field then check point fail
                if (customerInformationSummaryCollection[input].label == B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[0]) {
                    customerInformationSummaryCollection[input].isInvalid = true; // Setting up collection element isInvalid to true as checkpoint is pass for that particuler field
                    customerInformationSummaryCollection[input].applicableStyling = ERROR_CONDITION_STYLING; // Setting up collection element applicableStyling to error condition styling
                }
                if (customerInformationSummaryCollection[input].label == B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[1]) {
                    customerInformationSummaryCollection[input].isInvalid = true; // Setting up collection element isInvalid to true as checkpoint is pass for that particuler field
                    customerInformationSummaryCollection[input].applicableStyling = ERROR_CONDITION_STYLING; // Setting up collection element applicableStyling to error condition styling
                }
            }
            if (customerInformationSummaryCollection[input].isOrderType == true && customerInformationSummaryCollection[input].isChecked == true) {
                checkpointsPassed++; // Incrementing the checkpoint
                orderTypeisValid = true; //As user selected the value under order type section, orderTypeisValid is set to true
                selectedOrderType = customerInformationSummaryCollection[input].label; //BS-787 store selected order type
            }
            if (
                this._fromVsRx == false &&
                customerInformationSummaryCollection[input].isFrameType == true &&
                customerInformationSummaryCollection[input].isChecked == true
            ) {
                checkpointsPassed++; // Incrementing the checkpoint
                frameTypeisValid = true; //As user selected the value under frame type section, frameTypeisValid is set to true
                selectedFrameType = customerInformationSummaryCollection[input].label; //BS-787 store selected frame type
            }
        } //end for

        //BS-787 assignment of values to order type and frame type
        for (var input in customerInformationSummaryCollection) {
            if (customerInformationSummaryCollection[input].isOnFrameDetails == true && customerInformationSummaryCollection[input].isFrameTypeLabel == true) {
                customerInformationSummaryCollection[input].value = selectedFrameType;
            } else if (
                customerInformationSummaryCollection[input].isOnFrameDetails == true &&
                customerInformationSummaryCollection[input].isOrderTypeLabel == true
            ) {
                customerInformationSummaryCollection[input].value = selectedOrderType;
            }
        } //end for

        if (orderTypeisValid == false) {
            this._isOrderTypeInValid = true;
        } else if (orderTypeisValid == true) {
            this._isOrderTypeInValid = false;
        }

        if (frameTypeisValid == false) {
            this._isFrameTypeInValid = true;
        } else if (frameTypeisValid == true) {
            this._isFrameTypeInValid = false;
        }

        if (this._isSilhouetteStore == true && checkpointsPassed == this._totalFieldsToCheck) {
            isValid = true;
        } else if (this._isSilhouetteStore == false && checkpointsPassed == this._totalFieldsToCheck) {
            isValid = true;
        }

        this._customerInformationSummaryCollection = customerInformationSummaryCollection;

        return isValid;
    }

    /**
     * BS-787
     * This Method is used to handle event fired whenever user enters value in customer input fields
     */
    handleUserInput(event) {
        const field = event.target.dataset.field; // Field in which the user entered the value
        const value = event.target.value; // value entered by user on UI

        let orderInformationCollection = JSON.parse(JSON.stringify(this._customerInformationSummaryCollection));
        for (var input in orderInformationCollection) {
            //Iteration over the collection of customer information summary and setting up the entered value by user for that particuler field
            if (orderInformationCollection[input].label == field) {
                orderInformationCollection[input].value = value;
            }
        }

        this._customerInformationSummaryCollection = orderInformationCollection;
    }

    /**
     * BS-787
     * This Method is used to handle event fired whenever user selects values present under order type/ frame type section
     */
    handleSelection(event) {
        const field = event.target.dataset.field; // Field under which the user selected the value
        const value = event.target.value; //value selected by user on UI

        let orderInformationCollection = JSON.parse(JSON.stringify(this._customerInformationSummaryCollection));
        for (var input in orderInformationCollection) {
            // Iterating over the customer information summary collection and setting up isChecked property for that particuler field
            let typeValidity;
            if (field == this._orderTypeHeaderLabel) {
                typeValidity = orderInformationCollection[input].isOrderType;
            } else if (field == this._frameTypeHeaderLabel) {
                typeValidity = orderInformationCollection[input].isFrameType;
            }

            if (typeValidity == true && orderInformationCollection[input].label == value) {
                orderInformationCollection[input].isChecked = true; //setting up isChecked property for that particuler field
            } else if (typeValidity == true && orderInformationCollection[input].label != value) {
                orderInformationCollection[input].isChecked = false;
            }
        }

        this._customerInformationSummaryCollection = orderInformationCollection;
    }

    /**
     * BS-787
     * This Method is used to handle event fired attribute fiels set component
     */
    setProductSizes(event) {
        this.constructProductDataForSelectedProduct(event.detail.data);
    }

    //BS-2197 method to disable add to cart button
    disableAddToCart(event) {
        if (event.detail.isSpecial == true) {
            this._disableCart = true;
            this._addToCartClass = CART_BUTTON_INACTIVE;
        }
    }

    /**
     * BS-787
     * This Method is used to constuct the product data collection from the selected product on UI by user
     */
    @api
    constructProductDataForSelectedProduct(productSizesData) {
        const finalProductDataCollection = {};

        finalProductDataCollection.productIdPDP = this.productId;
        finalProductDataCollection.selectedFrameSKU = this.sku;

        if (this.collectionDesignFamily !== null && this.collectionDesignFamily !== undefined) {
            finalProductDataCollection.collectionDesignFamily = this.collectionDesignFamily;
        } else {
            finalProductDataCollection.collectionDesignFamily = '';
        }

        if (this.frameColorDescription !== null && this.frameColorDescription !== undefined) {
            finalProductDataCollection.frameColorDescription = this.frameColorDescription;
        } else {
            finalProductDataCollection.frameColorDescription = '';
        }

        if (this.productData) {
            finalProductDataCollection.frameType =
                this.productData.frameType != undefined && this.productData.frameType != null ? this.productData.frameType : '';
            finalProductDataCollection.model = this.productData.model != undefined && this.productData.model != null ? this.productData.model : '';
            finalProductDataCollection.modelNameNumber = this.productData.name != undefined && this.productData.name != null ? this.productData.name : ''; //BS-1701
            finalProductDataCollection.modelNameNumber +=
                this.productData.model != undefined && this.productData.model != null ? ' ' + this.productData.model : ''; //BS-1701
        }

        if (this.productData.variationAttributeSet !== null && this.productData.variationAttributeSet !== undefined) {
            if (this.productData.variationAttributeSet.attributes !== null && this.productData.variationAttributeSet.attributes !== undefined) {
                if (JSON.stringify(this.productData.variationAttributeSet.attributes).includes(COLOR_FIELD)) {
                    finalProductDataCollection.frameColor = this.productData.variationAttributeSet.attributes.B2B_Color__c;
                } else {
                    if (this._seeFrameColor === true) {
                        finalProductDataCollection.frameColor =
                            this.productFields[STOCK_KEEPING_UNIT_FIELD] !== null ? this.productFields[STOCK_KEEPING_UNIT_FIELD].substring(7, 11) : '';
                    } else {
                        finalProductDataCollection.frameColor = '';
                    }
                }
                if (JSON.stringify(this.productData.variationAttributeSet.attributes).includes(EE_SIZE_FIELD)) {
                    finalProductDataCollection.size = this.productData.variationAttributeSet.attributes.B2B_EE_Size__c;
                } else {
                    finalProductDataCollection.size = '';
                }
            } else {
                if (this._seeFrameColor === true) {
                    finalProductDataCollection.frameColor =
                        this.productFields[STOCK_KEEPING_UNIT_FIELD] != null ? this.productFields[STOCK_KEEPING_UNIT_FIELD].substring(7, 11) : '';
                } else {
                    finalProductDataCollection.frameColor = '';
                }
            }
        } else {
            if (this._seeFrameColor === true) {
                finalProductDataCollection.frameColor =
                    this.productFields[STOCK_KEEPING_UNIT_FIELD] != null ? this.productFields[STOCK_KEEPING_UNIT_FIELD].substring(7, 11) : '';
            } else {
                finalProductDataCollection.frameColor = '';
            }
        }
        /* Start : BS-2174 */
        if (
            this.productFields !== undefined &&
            this.productFields !== null &&
            this.productFields.B2B_EE_Size__c !== undefined &&
            this.productFields.B2B_EE_Size__c !== null
        ) {
            finalProductDataCollection.size = this.productFields.B2B_EE_Size__c;
        }
        /* Start : BS-2174 */

        if (this.productData.images.length == 0) {
            finalProductDataCollection.image = this.productData.image.url;
        } else {
            finalProductDataCollection.image = this.productData.images[0].imageUrl;
        }
        /* Start : BS-2174/BS-2158 */
        finalProductDataCollection.hexcode = this.productFields.B2B_Hexcode__c;
        finalProductDataCollection.hexcodeAccent = this.productFields.B2B_Hexcode_Accent__c;
        /* End : BS-2174/BS-2158 */
        for (let sizeData in productSizesData) {
            if (productSizesData[sizeData].name == BRIDGE_SIZE_FIELD) {
                finalProductDataCollection.bridgeSize = productSizesData[sizeData].value;
            } else if (productSizesData[sizeData].name == SHAPE_SIZE_FIELD) {
                //BS-1326
                finalProductDataCollection.shapeSize = productSizesData[sizeData].value;
            } else if (productSizesData[sizeData].name == TEMPLE_LENGTH_FIELD) {
                finalProductDataCollection.templeLength = productSizesData[sizeData].value;
            }
        }
        this.finalProductData = finalProductDataCollection;
    }

    /**
     * BS-1175
     * Method to populate all the data in the object to be shown on additional attribute section on UI.
     */
    populateAdditionalAttribute() {
        let attributeColorMap = new Map();
        let colorLabelMap = new Map();
        let colorsMap = [
            { apiName: LENS_COLOR, colorsList: [] },
            { apiName: MIRROR_COLOR, colorsList: [] },
            { apiName: FRAME_ACCENT_COLOR, colorsList: [] }
        ];
        //BS-1005 color labels to show on UI
        this._colorVsColorLabelMap.set(CREAM_COLOR.split(',')[0], CREAM_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(GOLD_COLOR.split(',')[0], GOLD_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(SLIVER_COLOR.split(',')[0], SLIVER_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(GREY_COLOR.split(',')[0], GREY_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(BROWN_COLOR.split(',')[0], BROWN_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(GREEN_COLOR.split(',')[0], GREEN_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(PETROL_COLOR.split(',')[0], PETROL_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(BLUE_COLOR.split(',')[0], BLUE_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(VIOLET_COLOR.split(',')[0], VIOLET_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(ROSE_COLOR.split(',')[0], ROSE_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(RED_COLOR.split(',')[0], RED_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(ORANGE_COLOR.split(',')[0], ORANGE_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(YELLOW_COLOR.split(',')[0], YELLOW_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(WHITE_COLOR.split(',')[0], WHITE_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(TRANSPARENT_COLOR.split(',')[0], TRANSPARENT_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(BLACK_COLOR.split(',')[0], BLACK_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(BICOLOR_COLOR.split(',')[0], BICOLOR_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(WITHOUT_MIRROR_COLOR.split(',')[0], WITHOUT_MIRROR_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(PURPLE_COLOR.split(',')[0], PURPLE_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(ROSEGOLD_COLOR.split(',')[0], ROSEGOLD_COLOR.split(',')[1]);
        this._colorVsColorLabelMap.set(BRASS_COLOR.split(',')[0], BRASS_COLOR.split(',')[1]); //BS-1005 end
        for (let element of this._customMetadataColors.values()) {
            let backgroundStyle = STYLE_DISPLAY_NONE;
            colorsMap.forEach((color) => {
                color.colorsList.push({
                    colorName: element.Label,
                    colorHex: element.B2B_Color_code__c,
                    colorNameTitle:
                        this._colorVsColorLabelMap.has(element.B2B_Color_name__c) == true ? this._colorVsColorLabelMap.get(element.B2B_Color_name__c) : '',
                    colorStyle: backgroundStyle,
                    transparent: element.B2B_Color_name__c == TRANSPARENT ? true : false
                });
            });
        }
        if (this.productFields[LENS_COLOR] != null) {
            colorsMap[0].colorsList.forEach((color) => {
                if (color.colorName == this.productFields[LENS_COLOR]) {
                    if (color.transparent) {
                        attributeColorMap.set(LENS_COLOR, 'background: url(' + this._transparentURI + ')');
                        colorLabelMap.set(LENS_COLOR, color.colorNameTitle);
                    } else {
                        attributeColorMap.set(LENS_COLOR, 'background: ' + color.colorHex);
                        colorLabelMap.set(LENS_COLOR, color.colorNameTitle);
                    }
                }
            });
        }
        if (this.productFields[MIRROR_COLOR] != null) {
            colorsMap[1].colorsList.forEach((color) => {
                if (color.colorName == this.productFields[MIRROR_COLOR]) {
                    if (color.transparent) {
                        attributeColorMap.set(MIRROR_COLOR, 'background: url(' + this._transparentURI + ')');
                        colorLabelMap.set(MIRROR_COLOR, color.colorNameTitle);
                    } else {
                        attributeColorMap.set(MIRROR_COLOR, 'background: ' + color.colorHex);
                        colorLabelMap.set(MIRROR_COLOR, color.colorNameTitle);
                    }
                }
            });
        }
        if (this.productFields[FRAME_ACCENT_COLOR] != null) {
            colorsMap[1].colorsList.forEach((color) => {
                if (color.colorName == this.productFields[FRAME_ACCENT_COLOR]) {
                    if (color.transparent) {
                        attributeColorMap.set(FRAME_ACCENT_COLOR, 'background: url(' + this._transparentURI + ')');
                        colorLabelMap.set(FRAME_ACCENT_COLOR, color.colorNameTitle);
                    } else {
                        attributeColorMap.set(FRAME_ACCENT_COLOR, 'background: ' + color.colorHex);
                        colorLabelMap.set(FRAME_ACCENT_COLOR, color.colorNameTitle);
                    }
                }
            });
        }
        const arr = Array.from(this.additionalAttributeFieldAndLabelList);
        let fieldValue;
        let hasMultipleValues;
        let fieldIcon;
        let labelValue;
        let isColorFieldValue;
        let bubbleColorValue;
        let bubbleColorName;
        let backgroundColorLower;
        let backgroundColorUpper;
        arr.forEach((item) => {
            this._isFrameColorDescriptionValue = false; //BS-1369
            if (this.productFields[item.fieldName] !== null && parseInt(this.productFields[item.fieldName]) !== 0) {
                hasMultipleValues = false;
                //Handling Date fields.
                if (item.isDateField == true) {
                    let launchDate = new Date(this.productFields[item.fieldName]);
                    fieldValue = new Intl.DateTimeFormat('de-AT', DATE_FORMAT).format(launchDate);
                    hasMultipleValues = false;
                } else {
                    //Handling the multi select picklist values
                    if (this.productFields[item.fieldName] !== null && this.productFields[item.fieldName].includes(';')) {
                        let dataItemList = this.productFields[item.fieldName].split(';');
                        fieldValue = dataItemList;
                        hasMultipleValues = true;
                    } else {
                        fieldValue = this.productFields[item.fieldName];
                        hasMultipleValues = false;
                    }
                }
                //Populating the labels in the field data object
                if (item.fieldName === BRIDGE_SIZE_FIELD) {
                    fieldIcon = this.bridgeSize.icon;
                } else if (!this._isSilhouetteStore && item.fieldName === SHAPE_SIZE_FIELD) {
                    //Added as Part Of BS-1326
                    fieldIcon = this.shapeSize.icon;
                } else if (item.fieldName === TEMPLE_LENGTH_FIELD) {
                    fieldIcon = this.templeLength.icon;
                } else if (item.fieldName === LENS_SIZE_FIELD) {
                    fieldIcon = this.lensSize.icon;
                } else {
                    fieldIcon = false;
                }
                //Showing unit of measurement
                if (item.fieldName === SHAPE_AREA_FIELD) {
                    labelValue = item.fieldLabel + ' ' + productAttributeUnits.split(',')[2];
                } else if (item.fieldName === FRAME_SHAPE_HEIGHT_FIELD) {
                    labelValue = item.fieldLabel + ' ' + productAttributeUnits.split(',')[0];
                } else if (item.fieldName === FRAME_WIDTH_FIELD) {
                    labelValue = item.fieldLabel + ' ' + productAttributeUnits.split(',')[0];
                } else if (item.fieldName === WEIGHT_FIELD) {
                    labelValue = item.fieldLabel + ' ' + productAttributeUnits.split(',')[1];
                } else {
                    labelValue = item.fieldLabel;
                }

                //Pouplating Color Values
                if (item.fieldName === LENS_COLOR) {
                    isColorFieldValue = true;
                    bubbleColorValue = this.productFields[HEXCODE_LENS]
                        ? 'background: ' + this.productFields[HEXCODE_LENS]
                        : attributeColorMap.has(LENS_COLOR)
                        ? attributeColorMap.get(LENS_COLOR)
                        : (isColorFieldValue = false); //BS-1400
                    bubbleColorName = this.productFields[HEXCODE_LENS]
                        ? this.productFields[HEXCODE_LENS]
                        : colorLabelMap.has(LENS_COLOR)
                        ? colorLabelMap.get(LENS_COLOR)
                        : (isColorFieldValue = false); //BS-1400
                } else if (item.fieldName === FRAME_COLOR_DESCRIPTION) {
                    isColorFieldValue = true;
                    labelValue = COLOR_DESCRIPTION; //BS-1369
                    this._isFrameColorDescriptionValue = true; //BS-1369

                    bubbleColorValue = this.productFields[HEXCODE]
                        ? 'background: ' + this.productFields[HEXCODE]
                        : attributeColorMap.has(FRAME_COLOR_DESCRIPTION)
                        ? attributeColorMap.get(FRAME_COLOR_DESCRIPTION)
                        : (isColorFieldValue = false); //BS-1369

                    bubbleColorName = this.productFields[FRAME_COLOR_DESCRIPTION]
                        ? this.productFields[FRAME_COLOR_DESCRIPTION]
                        : colorLabelMap.has(FRAME_COLOR_DESCRIPTION)
                        ? colorLabelMap.get(FRAME_COLOR_DESCRIPTION)
                        : (isColorFieldValue = false); //BS-1369

                    backgroundColorUpper = this.productFields[HEXCODE] != null ? 'background-color: ' + this.productFields[HEXCODE] : false; //BS-1369

                    backgroundColorLower =
                        this.productFields[HEX_CODE_ACCENT] != null
                            ? 'background-color: ' + this.productFields[HEX_CODE_ACCENT]
                            : this.productFields[HEX_CODE_ACCENT] != null
                            ? 'background-color: ' + this.productFields[HEX_CODE_ACCENT]
                            : false; //BS-1369

                    if (backgroundColorLower === false && backgroundColorUpper) {
                        backgroundColorLower = backgroundColorUpper; //BS-1369
                    }
                    if (backgroundColorUpper === false && backgroundColorLower) {
                        backgroundColorUpper = backgroundColorLower; //BS-1369
                    }
                } else if (item.fieldName === MIRROR_COLOR) {
                    isColorFieldValue = true;
                    bubbleColorValue = attributeColorMap.has(MIRROR_COLOR) ? attributeColorMap.get(MIRROR_COLOR) : (isColorFieldValue = false);
                    bubbleColorName = colorLabelMap.has(MIRROR_COLOR) ? colorLabelMap.get(MIRROR_COLOR) : (isColorFieldValue = false);
                } else if (item.fieldName === FRAME_ACCENT_COLOR) {
                    labelValue = ACCENT_COLOR; //BS-1579
                    isColorFieldValue = true;
                    bubbleColorValue = attributeColorMap.has(FRAME_ACCENT_COLOR) ? attributeColorMap.get(FRAME_ACCENT_COLOR) : (isColorFieldValue = false);
                    bubbleColorName = colorLabelMap.has(FRAME_ACCENT_COLOR) ? colorLabelMap.get(FRAME_ACCENT_COLOR) : (isColorFieldValue = false);
                } else {
                    isColorFieldValue = false;
                    bubbleColorValue = null;
                    bubbleColorName = null;
                }

                let fieldValueObj = {
                    label: labelValue,
                    dataValue: fieldValue,
                    containsMultipleValues: hasMultipleValues,
                    icon: fieldIcon,
                    isColorField: isColorFieldValue,
                    bubbleColor: bubbleColorValue,
                    colorName: bubbleColorName,
                    isFrameColorDescriptionValue: this._isFrameColorDescriptionValue,
                    backgroundColorUpper: backgroundColorUpper,
                    backgroundColorLower: backgroundColorLower
                };
                this._additionalAttributeObjectListCopy.push(fieldValueObj);
            } else if (item.fieldName === LENS_COLOR && this.productFields[HEXCODE_LENS] != undefined && this.productFields[HEXCODE_LENS] != null) {
                isColorFieldValue = true;
                bubbleColorValue = this.productFields[HEXCODE_LENS] ? 'background: ' + this.productFields[HEXCODE_LENS] : (isColorFieldValue = false);
                bubbleColorName = this.productFields[HEXCODE_LENS] ? this.productFields[HEXCODE_LENS] : (isColorFieldValue = false);

                let fieldValueObj = {
                    label: item.fieldLabel,
                    dataValue: fieldValue,
                    containsMultipleValues: hasMultipleValues,
                    icon: fieldIcon,
                    isColorField: isColorFieldValue,
                    bubbleColor: bubbleColorValue,
                    colorName: bubbleColorName
                };
                this._additionalAttributeObjectListCopy.push(fieldValueObj);
            } //BS-1400 added else condition
        });

        //Block which identifies the fields with multiple values and pushed them to last
        let fieldWithUniqueValue = [];
        this._additionalAttributeObjectListCopy.forEach((item) => {
            if (item.containsMultipleValues == true) {
                this._additionalAttributeWithMultipleValuesObjectList.push(item);
            } else {
                fieldWithUniqueValue.push(item);
            }
        });
        this._additionalAttributeObjectListCopy = [];
        this._additionalAttributeObjectListCopy = fieldWithUniqueValue;
        if (this._additionalAttributeWithMultipleValuesObjectList.length > 0) {
            this._additionalAttributeObjectListCopy.push(...this._additionalAttributeWithMultipleValuesObjectList);
            this._additionalAttributeObjectList = Array.from(this._additionalAttributeObjectListCopy);
        } else {
            this._additionalAttributeObjectList = Array.from(this._additionalAttributeObjectListCopy);
        }
    }

    /**
     * BS-1622
     * @description : Method that sets the visibility of Tabs and their styling
     * @param {*} event
     */
    handleDetailTabChange(event) {
        let currentActiveTab = event.target.dataset.name;
        let tabToHide;
        let tabToShow;
        if (currentActiveTab !== undefined && currentActiveTab !== null) {
            if (currentActiveTab === this._detailsHeader) {
                tabToHide = this.furtherInfoHeader;
                tabToShow = this._detailsHeader;
            } else if (currentActiveTab === this.furtherInfoHeader) {
                tabToHide = this._detailsHeader;
                tabToShow = this.furtherInfoHeader;
            }
            const templateToHide = this.template.querySelector(`[data-name="${tabToHide}"]`);
            if (templateToHide !== undefined && templateToHide !== null) {
                templateToHide.classList.add('remove-shadow');
                templateToHide.classList.remove('slds-is-active');
                templateToHide.classList.remove('show-shadow');
            }
            const tabViewComponentToHide = this.template.querySelector(`[data-id="${tabToHide}"]`);
            if (tabViewComponentToHide !== undefined && tabViewComponentToHide !== null) {
                if (tabViewComponentToHide.classList.contains('slds-show')) {
                    tabViewComponentToHide.classList.remove('slds-show');
                    tabViewComponentToHide.classList.add('slds-hide');
                }
            }
            const templateToShow = this.template.querySelector(`[data-name="${tabToShow}"]`);
            if (templateToShow !== undefined && templateToShow !== null) {
                if (templateToShow.classList.contains('remove-shadow')) {
                    templateToShow.classList.remove('remove-shadow');
                }
                templateToShow.classList.add('slds-is-active');
                templateToShow.classList.add('show-shadow');
            }
            const tabViewComponentToShow = this.template.querySelector(`[data-id="${tabToShow}"]`);
            if (tabViewComponentToShow !== undefined && tabViewComponentToShow !== null) {
                if (tabViewComponentToShow.classList.contains('slds-hide')) {
                    tabViewComponentToShow.classList.remove('slds-hide');
                    tabViewComponentToShow.classList.add('slds-show');
                }
            }
        }
    }
    //BS-2249
    handleNavigationToClipOns() {
        handleNavigationToClipOnsHandler(this._clipOnURL);
    }
}
