import { LightningElement, wire, track, api } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { setConfiguratorValues, setConfiguratorValuesForDifferentBrand } from 'c/b2b_vs_rx_edit_utils'; //BS-1064

import LANG from '@salesforce/i18n/lang';

import ORDER_OBJECT from '@salesforce/schema/Order';
import ORDERSTATUS_FIELD from '@salesforce/schema/Order.Status';

import searchProducts from '@salesforce/apex/B2B_SearchController.searchProducts';

import getOrderDetails from '@salesforce/apex/B2B_OrderHistoryController.getOrderDetails';
import getOrderItemDetails from '@salesforce/apex/B2B_OrderHistoryController.getOrderItemDetails';
import getOrderReferenceList from '@salesforce/apex/B2B_OrderHistoryController.getOrderReferencesById';
import createOrderDocumentRequest from '@salesforce/apex/B2B_OrderHistoryController.createOrderDocumentRequest';
import getLensConfigId from '@salesforce/apex/B2B_OrderHistoryController.getLensConfigId'; //BS-2343
import getColorsMetadata from '@salesforce/apex/B2B_SearchController.getColorsMetadata'; //BS-998
import getLensSelectionScreenData from '@salesforce/apex/B2B_OrderHistoryController.getLensSelectionScreenData'; //BS-998
import createCloneConfiguratorForVSRX from '@salesforce/apex/B2B_OrderHistoryController.createCloneConfiguratorForVSRX'; //BS-1064
import getFrameProductValues from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFrameProductValues'; //BS-1064
import getFrameImage from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFrameImage'; //BS-1064
import checkVSRXEligibilityFromAccount from '@salesforce/apex/B2B_CartController.checkVSRXEligibilityFromAccount'; //BS-1064
import getCountryDateFormat from '@salesforce/apex/B2B_OrderHistoryController.getCountryDateFormat'; //BS-2296
import getAccountDetail from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getAccountDetail'; //BS-2296
// LABELS
import errorMessageOnOrderDetails from '@salesforce/label/c.B2B_Product_Not_Available';
import nolinks from '@salesforce/label/c.B2B_ACC_OH_No_Links_Found';
import close from '@salesforce/label/c.B2B_ACC_OH_Close_Modal';
import source from '@salesforce/label/c.B2B_ACC_OH_Source';
import status from '@salesforce/label/c.B2B_ACC_OH_Status';
import ordernumber from '@salesforce/label/c.B2B_ACC_OH_Order_Number';
import orderdate from '@salesforce/label/c.B2B_ACC_OH_Order_Date';
import orderresetfilters from '@salesforce/label/c.B2B_ACC_OH_Reset_Filters';
import furtherinfos from '@salesforce/label/c.B2B_ACC_OH_Further_Order_Infos';
import deliverylinks from '@salesforce/label/c.B2B_ACC_OH_Delivery_Links';
import invoicelinks from '@salesforce/label/c.B2B_ACC_OH_Invoice_Link';
import sendorderconfirmation from '@salesforce/label/c.B2B_ACC_OH_Send_Order_Confirmation';
import senddelivery from '@salesforce/label/c.B2B_ACC_OH_Send_Delivery';
import sendinvoice from '@salesforce/label/c.B2B_ACC_OH_Send_Invoice';
import orderconfirmationlinks from '@salesforce/label/c.B2B_ACC_OH_Order_Confirmation_Links';
import trackinglinks from '@salesforce/label/c.B2B_ACC_OH_Tracking_Links';
import successMessage from '@salesforce/label/c.B2B_ACC_OH_Success_Message';
import errorMessage from '@salesforce/label/c.B2B_LOGIN_Generic_Error';
import requestDocument from '@salesforce/label/c.B2B_Order_History_Request_Document';
import otherAction from '@salesforce/label/c.B2B_Order_History_Other_Action';
import orderDetails from '@salesforce/label/c.B2B_Order_History_Order_Details';
import orderConfirmationMessage from '@salesforce/label/c.B2B_Order_History_Order_Conf_Message';
import deliveryNoteMessage from '@salesforce/label/c.B2B_Order_History_Delivery_Note_Message';
import invoiceMessage from '@salesforce/label/c.B2B_Order_Send_Invoice_Message';
import shippingAddress from '@salesforce/label/c.B2B_Order_Detail_Shipping_Address';
import address from '@salesforce/label/c.B2B_Order_Detail_Address'; //BS-733
import overview from '@salesforce/label/c.B2B_Order_Detail_Overview';
import billingAddress from '@salesforce/label/c.B2B_CO_Billing_Address';
import sku from '@salesforce/label/c.B2B_Order_Detail_SKU';
import quantity from '@salesforce/label/c.B2B_Order_Detail_Quantity';
import patiantsName from '@salesforce/label/c.B2B_Order_Detail_Patients_Name';
import account from '@salesforce/label/c.B2B_Order_Detail_Account';
import B2B_VS_Product_Fields from '@salesforce/label/c.B2B_VS_Product_Fields'; // Frame Reference Labels
import reorder from '@salesforce/label/c.B2B_Order_History_Reorder'; //BS-1064
import cancel from '@salesforce/label/c.B2B_ACC_Cancel'; //BS-1064
import B2B_VS_RX_REORDER_LABEL from '@salesforce/label/c.B2B_VS_RX_REORDER_LABEL'; //BS-1064
import PROCESSING_ORDER_NUMBER from '@salesforce/label/c.B2B_ACC_OH_Processing'; // BS-2277
//BS-998 Start
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
import PDP_LABELS from '@salesforce/label/c.B2B_PDP_InfoLabels';
import customerName from '@salesforce/label/c.B2B_VS_RX_ORDER_CUSTOMER_NAME'; //BS-1096
import B2B_CartContents_And_CartItems from '@salesforce/label/c.B2B_CartContents_And_CartItems';
import WITH_PARTIAL_COLOR_GROOVE_LABEL from '@salesforce/label/c.B2B_PARTIAL_COLOR_GROOVE_LABEL'; //BS-2137
//BS-998 End
import B2B_Lens_Only_For_Clip_In from '@salesforce/label/c.B2B_Lens_Only_For_Clip_In'; //BS-1311
import B2B_YES_BUTTON_LABEL from '@salesforce/label/c.B2B_YES_BUTTON_LABEL'; //BS-1311
import B2B_PLP_ColorFilter_Columns from '@salesforce/label/c.B2B_PLP_ColorFilter_Columns'; //BS-1334
import B2B_lenses_without_adapter from '@salesforce/label/c.B2B_lenses_without_adapter'; //BS-1340
import B2B_ORDER_SENT_AND_SUBMITTED_STATUS_VALUE from '@salesforce/label/c.B2B_ORDER_SENT_AND_SUBMITTED_STATUS_VALUE'; //BS-1096

import B2B_LINKOUT_AVALIBILITY_CHECK_LENSCOLORS from '@salesforce/label/c.B2B_VS_RX_LENS_SELECTION_LINKOUT_LABEL'; //BS-1018
import B2B_AVALIBILITY_CHECK_LENSCOLORS_EN_DOCUMENT from '@salesforce/label/c.B2B_VS_RX_AVAILABILITY_LENSCOLORS_LINK_EN'; //BS-1018
import B2B_AVALIBILITY_CHECK_LENSCOLORS_DE_DOCUMENT from '@salesforce/label/c.B2B_VS_RX_AVAILABILITY_LENSCOLORS_LINK_DE'; //BS-1018
import B2B_VS_GLAZING from '@salesforce/label/c.B2B_VS_GLAZING'; //BS-1466
import B2B_VS_LENS_TYPE from '@salesforce/label/c.B2B_VS_LENS_TYPE'; //BS-1466
import B2B_VS_LENS_SELECTION from '@salesforce/label/c.B2B_VS_LENS_SELECTION'; //BS-1466
import B2B_SH_EE_LENS_SHAPE from '@salesforce/label/c.B2B_SH_EE_LENS_SHAPE'; //BS-1802
import CLERK_LABEL from '@salesforce/label/c.B2B_CLERK_INPUT_LABEL'; //BS-1802
import VS_RX_ORDER_REFERENCE_LABEL from '@salesforce/label/c.B2B_VS_RX_Order_Reference_Labels'; //BS-1802
import VS_SGRAVING_LABEL from '@salesforce/label/c.B2B_VS_SGRAVING_LABEL'; //BS-1801
import BRIDGE_TEMPLE_LABEL from '@salesforce/label/c.B2B_VS_Product_Fields'; //BS-2158
import SHAPE_SELECTION_SCREEN_LABELS from '@salesforce/label/c.B2B_VS_SHAPE_SELECTION_SCREEN_LABELS'; //BS-2158
import B2B_NO_BUTTON_LABEL from '@salesforce/label/c.B2B_NO_BUTTON_LABEL'; //BS-2158
import B2B_FACET_CUT_LABEL from '@salesforce/label/c.B2B_FACET_CUT_LABEL'; //BS-2158
import B2B_ACC_OH_Processing from '@salesforce/label/c.B2B_ACC_OH_Processing'; //BS-2274
//STORE STYLING
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';

const DOC_REQ_Enabled_STATUS_LIST = [
    'Order in production',
    'Auftrag in Arbeit',
    'Order invoiced',
    'Auftrag in Rechung gestellt',
    'Order shipped',
    'Auftrag geliefert'
]; //BS-96
const REQUEST_DOCUMENT_ENABLED_CLASS = 'document-enabled';
const REQUEST_DOCUMENT_DISABLED_CLASS = 'document-disabled';
const ORDER_INVOICE = '60';
const ORDER_SHIPPED = '40';
const ORDER_IN_PRODUCTION = '30';
const GRAY_OUT_CSS = 'grayscale slds-m-horizontal_xx-small search-card slds-col slds-size_1-of-1 slds-grid slds-wrap'; //BS-590
const NOT_GRAY_OUT_CSS = 'slds-m-horizontal_xx-small search-card slds-col slds-size_1-of-1 slds-grid slds-wrap'; //BS-590
const BG_COLOR = 'background-color: '; //BS-1800

//to sync date format in all pages BS-772
const DATE_FORMAT = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
    hour12: true,
    timeZoneName: 'shortOffset'
};

//Added as part of Bs-882
const SUN_PROTECTION_SPARE_PART_TYPE = 'Sun protection lens';
const SUN_PROTECTION_SPARE_PART_TYPE_GERMAN = 'Sonnenschutzglas';
const LENSES_EN = 'Lenses';
const LENSES_DE = 'GLAESER';
const B2B_EE_BRAND_API_NAME_05 = '05';

//BS-998 Start
const ANTIREFLECTION_TYPE = 'Anti Reflection';
const HARDCOATING_TYPE = 'Hard Coating';
const FRAME_COLOR = 'B2B_Frame_Color__c';
const STYLE_DISPLAY_NONE = 'display: none';
const TRANSPARENT = 'transparent';
const RX_SOLUTION = 'RX Solution';
const SELECTED_LENS = 'Selected Lens';
const RX_GlAZING = 'RX Glazing';
//BS-998 End
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
const VISION_SENSATION = 'Vision Sensation';

const OPTICAL_GLAZING = 'Optical Glazing';
const OPTICAL_SUN_GLAZING = 'Optical Sun Glazing';
const SH_STORE = 'silhouette'; //BS-1802
const STYLING_BACKGROUND_COLOR = 'background-color:'; //BS-2158
const CLIP_IN = 'Clip-in'; //BS-2174
//BS-1064 start
const RX_GLAZING_SITE_PAGE = 'RX__c';
const VISION_SENSATION_SITE_PAGE = 'VS__c';
const MY_VS_RX_PAGE_SOURCE_IDENTIFIER = 'fromMyVSRX';
const VS_BRAND = 'Vision Sensation';
const RX_BRAND = 'RX Glazing';
const STANDARD_NAMED_PAGE = 'standard__namedPage'; //BS-1064 end
const ORDER_HISTORY = 'OrderHistory'; //BS-2207
const NAVIGATION_DESTINATION = 'comm__namedPage'; //BS-2277
const REORDER_PAGE = 'Reorder__c'; //BS-2277

export default class B2b_orderDetails extends NavigationMixin(LightningElement) {
    orderId;

    @track
    orderData; //BS-2322 : decorated track

    @track
    orderItems; //BS-2322 : decorated track

    orderErpNumber;
    orderDate;
    orderSource;
    orderStatus;
    orderStatuses;
    accountName;
    accountEmail;
    _policyIdList = [];
    _productIdList = [];
    shippingAddress = [];
    billingAddress = [];
    trackingReferences = [];
    orderStatusApiVsLabelMap = new Map();
    orderReferences;
    showModal = false;
    selectedOrderId;
    selectedOrderNumber;
    isOrderConfirmation = false;
    isDeleveryNote = false;
    isOrderInvoice = false;
    isOrderConfirmationSent = false;
    isDeleveryNoteSent = false;
    isOrderInvoiceSent = false;
    showTrackingNumber = false;
    documentRequestDisabled;
    isLoading;
    //BS-998 Start
    showMoreModal = false;
    _instructionsLabel = B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[3]; //BS-998
    //BS-1064 start
    _reorderMessage = B2B_VS_RX_REORDER_LABEL.split('|')[0];
    _reorderMessageFirstPart = this._reorderMessage.split(',')[0];
    _reorderMessageSecondPart = this._reorderMessage.split(',')[1];
    _reorderForVS = B2B_VS_RX_REORDER_LABEL.split('|')[1];
    _reorderForRX = B2B_VS_RX_REORDER_LABEL.split('|')[2];
    //BS-1064 end
    _customMetadataColors;
    _attributeColorMap = new Map();
    _productIdVsColorDetailsMap = new Map();
    _productIdVsSKUTypeMap = new Map();
    _frameColorLabel;
    //BS-998 End
    _isComment = false;

    _isRxItem = false;
    _lensSelectionReadOnlySetupDone = false;
    _isVsScreen = false;

    currentUrl = window.location.href.split('/s/');
    currentStore = this.currentUrl[0].split('/');
    dummyImage = '/' + this.currentStore[this.currentStore.length - 1] + '/img/b2b/default-product-image.svg';
    infoSVG = STORE_STYLING + '/icons/INFO.svg';
    addressSVG = STORE_STYLING + '/icons/address.svg';
    overviewSVG = STORE_STYLING + '/icons/cart.svg';
    orderDetailSVG = STORE_STYLING + '/icons/document.svg';
    lensShapeSVG = STORE_STYLING + '/icons/lens_shape.svg'; //BS-1802
    bridgeSizeSVG = STORE_STYLING + '/icons/SH_BridgeSize.jpg'; //BS-1802
    templeLengthSVG = STORE_STYLING + '/icons/SH_TempleLength.jpg'; //BS-1802
    reorderIcon = STORE_STYLING + '/icons/reorder-image-icon.png'; //BS-1064
    /*BS-1947 start */
    printSVG = STORE_STYLING + '/icons/print.svg';
    printLabel = B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[6];
    /*BS-1947 end */
    _isSilhouetteStore;
    _fromOrderHistory = ''; //BS-2207

    labels = {
        errorMessageOnOrderDetails,
        nolinks,
        close,
        source,
        status,
        orderresetfilters,
        furtherinfos,
        deliverylinks,
        orderconfirmationlinks,
        trackinglinks,
        invoicelinks,
        sendorderconfirmation,
        senddelivery,
        sendinvoice,
        successMessage,
        errorMessage,
        ordernumber,
        orderdate,
        otherAction,
        requestDocument,
        orderDetails,
        orderConfirmationMessage,
        deliveryNoteMessage,
        invoiceMessage,
        shippingAddress,
        overview,
        billingAddress,
        sku,
        quantity,
        patiantsName,
        account,
        address,
        customerName,
        reorder,
        cancel
    };

    /**
     * Custom labels used on UI
     * BS-998
     * @type {object}
     */
    label = {
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
        antireflection: ANTIREFLECTION_TYPE,
        hardCoating: HARDCOATING_TYPE,
        commentLabel: B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[0],
        noteLabel: B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[2],
        productSize: B2B_EE_RX_CART_LABELS.split(',')[5],
        workingDistanceFieldLabel: B2B_VS_RX_CENTERING_INFO_TEXT_FIELD.split(',')[3],
        additionalAttributeLabel: B2B_EE_RX_CART_LABELS.split(',')[6],
        size: B2B_CartContents_And_CartItems.split(',')[7],
        lensOnlyForClipIn: B2B_Lens_Only_For_Clip_In,
        yes: B2B_YES_BUTTON_LABEL,
        lensColor: B2B_PLP_ColorFilter_Columns.split(',')[1], //BS-1334
        lensesWithoutAdapter: B2B_lenses_without_adapter,
        bridgeTempleLabel: B2B_VS_Product_Fields.split(',')[2],
        orderType: VS_RX_ORDER_REFERENCE_LABEL.split(',')[2],
        bridgeTempleLabelValue: BRIDGE_TEMPLE_LABEL.split(',')[2], //BS-2158
        vsLensSizeLabel: SHAPE_SELECTION_SCREEN_LABELS.split(',')[3], //BS-2158/2174
        vsLensShapeLabel: SHAPE_SELECTION_SCREEN_LABELS.split(',')[2], //BS-2158/2174
        colorGrooveColorLabel: SHAPE_SELECTION_SCREEN_LABELS.split(',')[39], //BS-2158/2174
        accentRingColorLabel: SHAPE_SELECTION_SCREEN_LABELS.split(',')[35], //BS-2158/2174
        vsShapeAdjusted: SHAPE_SELECTION_SCREEN_LABELS.split(',')[41], //BS-2158/2174
        no: B2B_NO_BUTTON_LABEL,
        facetCutLabel: B2B_FACET_CUT_LABEL
    };

    //BS-1802
    productLabel = {
        shapeSize: B2B_CartContents_And_CartItems.split(',')[16],
        sizeHeightLabel: B2B_SH_EE_LENS_SHAPE,
        bridgeSize: B2B_CartContents_And_CartItems.split(',')[17],
        templeLength: B2B_CartContents_And_CartItems.split(',')[18],
        clerk: CLERK_LABEL
    };

    _dateFormat; //BS-2296
    _countryCode; //BS-2296

    //BS-1801 : VS sgravingLabel
    get silhouetteGravingLabel() {
        let gravingLabel = VS_SGRAVING_LABEL.split(',')[0];
        let gravingLabelList = gravingLabel.split(' ');
        for (let i = 0; i < gravingLabelList.length; i++) {
            let element = gravingLabelList[i];
            let updatedString = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
            gravingLabelList[i] = updatedString;
        }
        return gravingLabelList.join(' ');
    }

    _frameTypeHeaderLabel = VS_RX_ORDER_REFERENCE_LABEL.split(',')[3];

    /**
     * Get The labels used in the template.
     * BS-723
     * @type {Object}
     */
    get lensSelectionLabel() {
        //Lens Type,Panorama Single Vison,Panorama ,Material,Lens Details,Lens Index,Lens Colour,Progression Length
        return {
            lensType: LENS_SELECTION_LABELS.split(',')[0],
            panoramaSingleVision: LENS_SELECTION_LABELS.split(',')[1],
            panoramaProgressive: LENS_SELECTION_LABELS.split(',')[2],
            material: LENS_SELECTION_LABELS.split(',')[3],
            lensDetails: LENS_SELECTION_LABELS.split(',')[4],
            lensIndex: LENS_SELECTION_LABELS.split(',')[5],
            lensColor: LENS_SELECTION_LABELS.split(',')[6],
            progressionLength: LENS_SELECTION_LABELS.split(',')[7],
            lensSelection: LENS_SELECTION_LABELS.split(',')[8],
            antireflectionLabel: LENS_SELECTION_LABELS.split(',')[9], //BS-1019
            hardCoatingLabel: LENS_SELECTION_LABELS.split(',')[10], //BS-1019
            yesOptionLabel: LENS_SELECTION_LABELS.split(',')[11], //BS-1019
            noOptionLabel: LENS_SELECTION_LABELS.split(',')[12], //BS-1019
            evilEyeEdgeLabel: LENS_SELECTION_LABELS.split(',')[13],
            lensColorAvailabilityCheck: B2B_LINKOUT_AVALIBILITY_CHECK_LENSCOLORS, //BS-1466 start
            glazing: B2B_VS_GLAZING.split(',')[0],
            opticalGlazing: B2B_VS_GLAZING.split(',')[1],
            opticalSunGlazing: B2B_VS_GLAZING.split(',')[2],
            panoramaProgressiveOne: B2B_VS_LENS_TYPE.split(',')[0],
            panoramaProgressiveRoom: B2B_VS_LENS_TYPE.split(',')[1],
            lensDistance: B2B_VS_LENS_SELECTION.split(',')[0],
            photoSensation: B2B_VS_LENS_SELECTION.split(',')[1],
            blueSensation: B2B_VS_LENS_SELECTION.split(',')[2],
            lensEdge: B2B_VS_LENS_SELECTION.split(',')[3],
            visualPreferences: B2B_VS_LENS_SELECTION.split(',')[4],
            longDistance: B2B_VS_LENS_SELECTION.split(',')[5],
            longDistanceBallance: B2B_VS_LENS_SELECTION.split(',')[6],
            middleDistance: B2B_VS_LENS_SELECTION.split(',')[7],
            closeRange: B2B_VS_LENS_SELECTION.split(',')[8],
            semiMatt: B2B_VS_LENS_SELECTION.split(',')[9],
            polished: B2B_VS_LENS_SELECTION.split(',')[10],
            open: B2B_VS_LENS_SELECTION.split(',')[11] //BS-1466 end
        };
    }

    /**
     * Gets the effective account - if any - of the user viewing the product.
     * BS-590
     * @type {string}
     */
    @api effectiveAccountId;

    _orderItemsList = [];
    _isSHEEOrder = false;

    //BS-1938
    _showProgressiveLength = false;

    //BS-1064 start
    _showReorderModal = false;
    _orderToCopyId;
    _completeStepForNavigation;
    _applicableBrand;
    _isVSRXorder = false;
    selectedOrderType;
    isEligibleForVS;
    isEligibleForRX;
    _isLoading = true;

    @track
    _frameInformationCollection = {};

    @track
    lensConfiguratorCollectionData = {}; //BS-1064 end

    /**
     * Gets the normalized effective account of the user.
     * BS-590
     * @type {string}
     * @readonly
     * @private
     */
    get resolvedEffectiveAccountId() {
        const effectiveAcocuntId = this.effectiveAccountId || '';
        let resolved = null;

        if (effectiveAcocuntId.length > 0 && effectiveAcocuntId !== '000000000000000') {
            resolved = effectiveAcocuntId;
        }
        return resolved;
    }

    //this will call the methods to get the data to show on UI
    async connectedCallback() {
        this.currentStore.includes(SH_STORE) == true ? (this._isSilhouetteStore = true) : (this._isSilhouetteStore = false); //BS-1802
        this.isLoading = true;
        //BS-998 Start
        this._frameColorLabel = PDP_LABELS.split(',')[7];
        let result = await getColorsMetadata({});
        if (result !== null && result !== undefined) {
            this._customMetadataColors = new Map(Object.entries(JSON.parse(result)));
        }
        //BS-998 end
        this.checkEligibilityForVisionSensationEvilEyeRX(); //BS-1064
        /*
         * Start : BS-2296
         * Updated for BS-2322
         */
        if (this._isSilhouetteStore == false) {
            this.getOrderData(this.orderId);
        }
        /* End : BS-2296 */
        this.getPolicyProducts(); //BS-590
        this.getLensConfiguratorId(); //BS-2343
    }

    //this will get order objects Information
    @wire(getObjectInfo, { objectApiName: ORDER_OBJECT })
    orderInfo;

    //this will get the order ID from URL
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            (this.orderId = currentPageReference.state?.recordId), (this.fromOrderHistory = currentPageReference.state?.source); //BS-2207
        }
    }

    //this will get order status picklist values
    @wire(getPicklistValues, { recordTypeId: '$orderInfo.data.defaultRecordTypeId', fieldApiName: ORDERSTATUS_FIELD })
    statusValues({ error, data }) {
        if (data) {
            this.orderStatuses = data.values;
            this.orderStatuses.forEach((statusEntry) => {
                this.orderStatusApiVsLabelMap.set(statusEntry.value, statusEntry.label);
            });
        } else if (error) {
            console.log(error);
        }
    }
    /**
     * Added as a part of BS-1947
     */
    generatePdf() {
        window.print();
    }
    /**
     * BS-590
     *
     * this method will get the products based on Policy ids
     * BS-2322 : Made asynchronous
     */
    async getPolicyProducts() {
        await searchProducts({
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
            .then((result) => {
                if (result != null) {
                    this._productIdList = result;
                    /* Start : BS-2322 */
                    if (this._isSilhouetteStore == true) {
                        this.getAccountSpecificData();
                    } else {
                        this.getOrderItemData(this.orderId);
                    }
                    /* End : BS-2322 */
                }
            })
            .catch((error) => {
                this._isLoading = false;
                console.error('error:', error);
            });
    }

    //BS-998 get the brand label for ee rx.
    get EEBrandIcon() {
        return STORE_STYLING + '/icons/EEVSRXLogo.jpg';
    }

    get silhouetteVsIcon() {
        return STORE_STYLING + '/icons/VS-logo.png';
    }

    //Imperative call to get get the orders details
    async getOrderData(orderId) {
        await getOrderDetails({
            orderId: orderId
        })
            .then((result) => {
                this.orderData = result;
                let itemKey = Object.keys(this.orderData);
                itemKey.forEach((element) => {
                    let updatedValue;
                    if (PRESCRIPTION_VALUE_FIELD_TO_APPEND_DECIMAL.includes(element) == true) {
                        let enteredInput = this.orderData[element] + '';
                        if (enteredInput != null && enteredInput != undefined) {
                            if (enteredInput.includes('.') == false) {
                                updatedValue = enteredInput + TWO_ZERO_WITH_DOT;
                            } else if (enteredInput.includes('.') == true) {
                                let totalDecimalEntered = enteredInput.split('.')[1].length;
                                if (totalDecimalEntered != null && totalDecimalEntered != undefined && totalDecimalEntered > 0 && totalDecimalEntered < 3) {
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
                        this.orderData[element] = updatedValue;
                        //BS-1799 Removed hardcoded language checks
                        if (LANG == 'de') {
                            if (this.orderData[element] != undefined && this.orderData[element] != null) {
                                this.orderData[element] = this.orderData[element].toString().replace('.', ','); //BS-1129
                            }
                        } else {
                            this.orderData[element] = this.orderData[element].toString().replace(',', '.'); //BS-1129
                        }
                    }
                });
                this.orderErpNumber = this.orderData.B2B_ERP_Order_Id__c == null ? B2B_ACC_OH_Processing : this.orderData.B2B_ERP_Order_Id__c; //BS-2274
                this.orderDate = this.orderData.OrderedDate;
                if (
                    (this.orderData.B2B_Note__c != undefined && this.orderData.B2B_Note__c != null) ||
                    (this.orderData.B2B_Special_Handling__c != undefined && this.orderData.B2B_Special_Handling__c != null) ||
                    this.orderData.B2B_Customer_Service_Preference__c == true
                ) {
                    this._isComment = true;
                }
                //BS-772 to sync date format in all pages
                let lastOrderDateValue = new Date(this.orderDate);
                this.orderDate = new Intl.DateTimeFormat(this._dateFormat, DATE_FORMAT).format(lastOrderDateValue);
                this.orderStatus =
                    this.orderData.Status == B2B_ORDER_SENT_AND_SUBMITTED_STATUS_VALUE.split(',')[0]
                        ? B2B_ORDER_SENT_AND_SUBMITTED_STATUS_VALUE.split(',')[1]
                        : this.orderData.Status;
                this.orderSource = this.orderData.Order_Source__c;
                this.accountName = this.orderData.Account.Name;
                this.accountEmail = this.orderData.Account.k_Email__c;
                /* Start : BS-1802 */
                if (this._isSilhouetteStore === false) {
                    this.billingAddress.push({ key: 'name', value: this.orderData.Account.k_Billing_Name__c });
                    this.billingAddress.push({ key: 'street', value: this.orderData.Account.k_Billing_Street__c });
                    this.billingAddress.push({ key: 'zipCode', value: this.orderData.Account.k_Billing_Postal_Code__c });
                    this.billingAddress.push({ key: 'city', value: this.orderData.Account.k_Billing_City__c });
                    this.billingAddress.push({ key: 'country', value: this.orderData.Account.k_Billing_Country__c });
                } else {
                    this.billingAddress.push({ key: 'name', value: this.orderData.Account.k_Billing_Name__c + ', ' });
                    this.billingAddress.push({ key: 'street', value: this.orderData.Account.k_Billing_Street__c + ', ' });
                    this.billingAddress.push({ key: 'zipCode', value: this.orderData.Account.k_Billing_Postal_Code__c + ', ' });
                    this.billingAddress.push({ key: 'city', value: this.orderData.Account.k_Billing_City__c + ', ' });
                    this.billingAddress.push({ key: 'country', value: this.orderData.Account.k_Billing_Country__c });
                }
                /* End : BS-1802 */
                if (DOC_REQ_Enabled_STATUS_LIST.includes(this.orderStatus)) {
                    this.documentRequestDisabled = REQUEST_DOCUMENT_ENABLED_CLASS;
                } else {
                    this.documentRequestDisabled = REQUEST_DOCUMENT_DISABLED_CLASS;
                }
                /* Start : BS-1800 */
                if (
                    this.orderData.B2B_Evil_Eye_Edge__c !== undefined &&
                    this.orderData.B2B_Evil_Eye_Edge__c !== null &&
                    this.orderData.B2B_Evil_Eye_Edge__c == true
                ) {
                    this.orderData.showEvilEyeEdge = true;
                } else {
                    this.orderData.showEvilEyeEdge = false;
                }
                /* Start : /BS-2174 */
                if (
                    this.orderData.B2B_RX_Solution__c !== undefined &&
                    this.orderData.B2B_RX_Solution__c !== null &&
                    this.orderData.B2B_RX_Solution__c == CLIP_IN
                ) {
                    this.orderData.isClipIn = true;
                } else {
                    this.orderData.isClipIn = false;
                }
                /* End : /BS-2174 */
                /* End : BS-1800 */
                /* Start : BS-1938 */
                if (
                    this.orderData.B2B_Lens_Type__c !== undefined &&
                    this.orderData.B2B_Lens_Type__c !== null &&
                    (this.orderData.B2B_Lens_Type__c === this.lensSelectionLabel.panoramaProgressive ||
                        this.orderData.B2B_Lens_Type__c === this.lensSelectionLabel.panoramaProgressiveOne ||
                        this.orderData.B2B_Lens_Type__c === this.lensSelectionLabel.panoramaProgressiveRoom) &&
                    this.orderData.B2B_Progression_Length__c !== undefined &&
                    this.orderData.B2B_Progression_Length__c !== null
                ) {
                    this._showProgressiveLength = true;
                }
                /* End : BS-1938 */
                if (this.orderData.B2B_Order_Type__c !== undefined && this.orderData.B2B_Order_Type__c !== null) {
                    this.selectedOrderType = this.orderData.B2B_Order_Type__c;
                    this._isVSRXorder = true;
                } else {
                    this._isVSRXorder = false;
                } //BS-1064
                /* Start : BS-2322 */
                if (this._isSilhouetteStore == true) {
                    this.getOrderItemData(this.orderId);
                } else {
                    this._isLoading = false;
                }
                /* End : BS-2322 */
            })
            .catch((error) => {
                this._isLoading = false;
                const toastEvent = new ShowToastEvent({
                    message: this.labels.errorMessage,
                    variant: 'error'
                });
                this.dispatchEvent(toastEvent);
            });
    }

    //Imparative call to get the order Items data
    async getOrderItemData(orderId) {
        await getOrderItemDetails({
            orderId: orderId
        })
            .then((result) => {
                this.orderItems = JSON.parse(JSON.stringify(result));
                this.getColorMetadata(); //BS-998
                if (this.orderItems !== undefined && this.orderItems !== null) {
                    this.orderItems.forEach(async (item) => {
                        //BS-2322 : Made asynchronous
                        if (
                            item.B2B_Type__c != undefined &&
                            item.B2B_Type__c != null &&
                            (item.B2B_Type__c == RX_GlAZING || item.B2B_Type__c == VISION_SENSATION)
                        ) {
                            item.isVsRxItem = true;
                            if (item.B2B_Type__c == RX_GlAZING) {
                                item.isRxItem = true;
                                this._isRxItem = true;
                                item.isVsItem = false;
                            } else if (item.B2B_Type__c == VISION_SENSATION) {
                                item.isRxItem = false;
                                this._isRxItem = false;
                                item.isVsItem = true;
                                await getLensSelectionScreenData({ recordId: orderId }) ////BS-2322 : added await
                                    .then((result) => {
                                        this.populateReadOnlyData(result);
                                    })
                                    .catch((error) => {});
                            }
                        } else {
                            item.isVsRxItem = false;
                            this._isSHEEOrder = true;
                        }
                        if (item.B2B_ParentOrderItem__c == undefined || item.B2B_ParentOrderItem__c == null) {
                            item.isParentProduct = true;
                        } else {
                            item.isParentProduct = false;
                        }
                        if (item.Product2.B2B_Frame_Color__c != null) {
                            item.frameColor = this._productIdVsColorDetailsMap.has(item.Id)
                                ? this._productIdVsColorDetailsMap.get(item.Id)[FRAME_COLOR] != undefined
                                    ? this._productIdVsColorDetailsMap.get(item.Id)[FRAME_COLOR]
                                    : false
                                : false;
                        }
                        item.colorNumber =
                            item.Product2.StockKeepingUnit !== undefined && item.Product2.StockKeepingUnit !== null
                                ? item.Product2.StockKeepingUnit.substring(7, 11)
                                : '';
                        /* Start : BS-1802 */
                        if (
                            item.Product2.B2B_Shape_Size__c != undefined &&
                            item.Product2.B2B_Shape_Size__c != null &&
                            item.Product2.B2B_Shape_Height__c != undefined &&
                            item.Product2.B2B_Shape_Height__c != null
                        ) {
                            item.shapeSizeHeight = item.Product2.B2B_Shape_Size__c + ' x ' + item.Product2.B2B_Shape_Height__c;
                        } else {
                            item.shapeSizeHeight = false;
                        }
                        let productFieldMap = new Map(Object.entries(item.Product2));
                        for (let productField of productFieldMap.keys()) {
                            if (productFieldMap.get(productField) == '0') {
                                item.Product2[productField] = false;
                            }
                        }
                        if (item.Product2.B2B_EE_Size__c === undefined || item.Product2.B2B_EE_Size__c === null) {
                            item.Product2.B2B_EE_Size__c = false;
                        }
                        /* End : BS-1802 */
                        /* Start BS-1800 */
                        item.backgroundColorUpper = item.Product2.B2B_Hexcode__c != null ? BG_COLOR + item.Product2.B2B_Hexcode__c : false;
                        item.backgroundColorLower =
                            item.Product2.B2B_Hexcode_Accent__c != null
                                ? BG_COLOR + item.Product2.B2B_Hexcode_Accent__c
                                : item.Product2.B2B_Hexcode_Accent__c != null
                                ? BG_COLOR + item.Product2.B2B_Hexcode_Accent__c
                                : false;

                        item.showColorBubble = false;

                        if (item.backgroundColorLower !== undefined && item.backgroundColorLower !== false) {
                            item.showColorBubble = true;
                        }
                        if (item.backgroundColorUpper !== undefined && item.backgroundColorUpper !== false) {
                            item.showColorBubble = true;
                        }
                        if (item.backgroundColorLower === false && item.backgroundColorUpper) {
                            item.backgroundColorLower = item.backgroundColorUpper;
                        }
                        if (item.backgroundColorUpper === false && item.backgroundColorLower) {
                            item.backgroundColorUpper = item.backgroundColorLower;
                        }
                        /* End BS-1800 */
                    });
                    //BS-998 End
                }

                let shipAddress = [];
                if (this.orderItems !== undefined && this.orderItems !== null && this.orderItems[0].B2B_Ship_to_ID__c) {
                    /* Start : BS-1802 */
                    if (this._isSilhouetteStore === false) {
                        shipAddress.push({ key: 'name', value: this.orderItems[0].B2B_Ship_to_ID__r.Name });
                        shipAddress.push({ key: 'street', value: this.orderItems[0].B2B_Ship_to_ID__r.Address.street });
                        shipAddress.push({ key: 'zipCode', value: this.orderItems[0].B2B_Ship_to_ID__r.Address.postalCode });
                        shipAddress.push({ key: 'city', value: this.orderItems[0].B2B_Ship_to_ID__r.Address.city });
                        shipAddress.push({ key: 'country', value: this.orderItems[0].B2B_Ship_to_ID__r.Address.country });
                    } else {
                        shipAddress.push({ key: 'name', value: this.orderItems[0].B2B_Ship_to_ID__r.Name + ', ' });
                        shipAddress.push({ key: 'street', value: this.orderItems[0].B2B_Ship_to_ID__r.Address.street + ', ' });
                        shipAddress.push({ key: 'zipCode', value: this.orderItems[0].B2B_Ship_to_ID__r.Address.postalCode + ', ' });
                        shipAddress.push({ key: 'city', value: this.orderItems[0].B2B_Ship_to_ID__r.Address.city + ', ' });
                        shipAddress.push({ key: 'country', value: this.orderItems[0].B2B_Ship_to_ID__r.Address.country });
                    }
                    /* End : BS-1802 */
                    this.shippingAddress = shipAddress;
                }
                //Added BS-590
                if (this.orderItems !== undefined && this.orderItems !== null) {
                    this.orderItems.forEach((item) => {
                        //BS-590 order product item which is not in entitlement policy made grayed out
                        //BS-590 Set error message on hover for product which are grayed out
                        if (this._productIdList.includes(item.Product2Id)) {
                            item.isGreyOut = NOT_GRAY_OUT_CSS;
                            item.errorMessage = '';
                            item.productTitle = item.Product2.Name;
                        } else {
                            item.isGreyOut = GRAY_OUT_CSS;
                            item.errorMessage = this.labels.errorMessageOnOrderDetails;
                            item.productTitle = this.labels.errorMessageOnOrderDetails;
                        }

                        if (
                            item.Product2.B2B_Sparepart_Type__c !== undefined &&
                            item.Product2.B2B_Brand__c !== undefined &&
                            item.Product2.B2B_Product_Type__c !== undefined &&
                            item.Product2.B2B_Sparepart_Type__c !== null &&
                            item.Product2.B2B_Brand__c !== null &&
                            item.Product2.B2B_Product_Type__c != null &&
                            (item.Product2.B2B_Sparepart_Type__c === SUN_PROTECTION_SPARE_PART_TYPE ||
                                item.Product2.B2B_Sparepart_Type__c === SUN_PROTECTION_SPARE_PART_TYPE_GERMAN) &&
                            (item.Product2.B2B_Product_Type__c === LENSES_DE || item.Product2.B2B_Product_Type__c === LENSES_EN) &&
                            item.Product2.B2B_Brand__c === B2B_EE_BRAND_API_NAME_05
                        ) {
                            item.isEvilEyeLens = true;
                        } else {
                            item.isEvilEyeLens = false;
                        }
                    });
                }
                /* Start of BS-2207 */
                setTimeout(() => {
                    if (this.fromOrderHistory == ORDER_HISTORY) {
                        this.generatePdf();
                        this.fromOrderHistory = '';
                    }
                }, 5000);
                /* Start : BS-2322 */
                if (this._isRxItem == true || this._isSHEEOrder == true) {
                    this._isLoading = false;
                }
                /* End : BS-2322 */
                /* End of BS-2207 */
            })
            .catch((error) => {
                this._isLoading = false;
                const toastEvent = new ShowToastEvent({
                    message: this.labels.errorMessage,
                    variant: 'error'
                });
                this.dispatchEvent(toastEvent);
            });
    }

    //this will open the modal and show the data as per status value
    openModal(event) {
        if (this.documentRequestDisabled != REQUEST_DOCUMENT_DISABLED_CLASS) {
            if (this.orderData.Status == this.orderStatusApiVsLabelMap.get(ORDER_INVOICE)) {
                this.isOrderInvoice = true;
                this.isDeleveryNote = true;
                this.isOrderConfirmation = true;
                this.showTrackingNumber = true;
            } else if (this.orderData.Status == this.orderStatusApiVsLabelMap.get(ORDER_SHIPPED)) {
                this.isDeleveryNote = true;
                this.isOrderConfirmation = true;
                this.showTrackingNumber = true;
            } else if (this.orderData.Status == this.orderStatusApiVsLabelMap.get(ORDER_IN_PRODUCTION)) {
                this.isOrderConfirmation = true;
            }
            this.selectedOrderId = this.orderData.Id;
            this.selectedOrderNumber = this.orderData.B2B_ERP_Order_Id__c;
            this.isLoading = true;
            this.getOrderReferenceData(this.orderData.Id);
        }
    }

    //reseting the variables on modal close
    closeModal() {
        this.isOrderConfirmation = false;
        this.isDeleveryNote = false;
        this.isOrderInvoice = false;
        this.isOrderConfirmationSent = false;
        this.isDeleveryNoteSent = false;
        this.isOrderInvoiceSent = false;
        this.showTrackingNumber = false;
        this.showModal = false;
        this.trackingReferences = [];
        this.orderInformationReferences = [];
        this.deliveryNoteReferences = [];
    }

    //this will get the order tracking information
    getOrderReferenceData(orderId) {
        getOrderReferenceList({
            orderId: orderId
        })
            .then((result) => {
                this.orderReferences = result;

                for (let orderReference of this.orderReferences) {
                    if (orderReference.B2B_Order_Reference_Type__c === 'Tracking') {
                        this.trackingReferences.push(orderReference);
                    }
                }

                this.showModal = true;
            })
            .catch((error) => {
                const toastEvent = new ShowToastEvent({
                    message: this.labels.errorMessage,
                    variant: 'error'
                });
                this.dispatchEvent(toastEvent);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    get hasTrackingLinks() {
        return this.trackingReferences.length > 0 ? true : false;
    }

    get hasOrders() {
        return this.filteredResults.length > 0 ? true : false;
    }

    //This will send the document request for creation
    handleSend(event) {
        let requestButtonName = event.target.dataset.name;
        if (requestButtonName == 'Order Confirmation') {
            this.template.querySelector('[data-name="Order Confirmation"]').disabled = true;
            this.isOrderConfirmationSent = true;
        } else if (requestButtonName == 'Delivery Note') {
            this.template.querySelector('[data-name="Delivery Note"]').disabled = true;
            this.isDeleveryNoteSent = true;
        } else if (requestButtonName == 'Invoice') {
            this.template.querySelector('[data-name="Invoice"]').disabled = true;
            this.isOrderInvoiceSent = true;
        }
        this.createOrderDocumentRequestRecord(this.selectedOrderId, requestButtonName);
    }

    //This will creats a document request
    createOrderDocumentRequestRecord(orderId, requestType) {
        createOrderDocumentRequest({
            orderId: orderId,
            requestType: requestType
        })
            .then((result) => {
                const toastEvent = new ShowToastEvent({
                    message: this.labels.successMessage,
                    variant: 'success'
                });
                this.dispatchEvent(toastEvent);
            })
            .catch((error) => {
                const toastEvent = new ShowToastEvent({
                    message: this.labels.errorMessage,
                    variant: 'error'
                });
                this.dispatchEvent(toastEvent);
            });
    }

    handleProductDetailNavigation(evt) {
        evt.preventDefault();

        //Bs-590 made product unclickbale which is not in entitlement policy
        if (this._productIdList.includes(evt.target.dataset.productid)) {
            const productId = evt.target.dataset.productid;
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: productId,
                    actionName: 'view'
                }
            });
        } //if
    } //end

    //BS-998 to show the additional Info modal
    @api show() {
        this.showMoreModal = true;
        this.handleShowModal();
    }

    //BS-998 to hide the additional Info modal
    @api hide() {
        this.showMoreModal = false;
        this.handleCloseModal();
    }

    //BS-998 to show the additional Info modal
    handleShowModal() {
        const modal = this.template.querySelector('c-b2b_modal');
        modal.setWidth('slds-modal_medium');
        modal.show();
    }

    //BS-998 to hide the additional Info modal
    handleCloseModal() {
        const modal = this.template.querySelector('c-b2b_modal');
        modal.hide();
    }

    /**
     * this method will get the colors metadata to show the color bubble on UI
     * BS-998
     * @type {object}
     */
    async getColorMetadata() {
        if (this.orderItems != null) {
            let colorsMap = [{ apiName: FRAME_COLOR, colorsList: [] }];
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
            for (var orderItem in this.orderItems) {
                let productColorDetailObj = {};
                if (this.orderItems[orderItem].Product2.B2B_Frame_Color__c != null) {
                    colorsMap[0].colorsList.forEach((color) => {
                        if (color.colorName == this.orderItems[orderItem].Product2.B2B_Frame_Color__c) {
                            if (color.transparent) {
                                this._attributeColorMap.set(FRAME_COLOR, 'background: url(' + this._transparentURI + ')');
                                productColorDetailObj = { ...productColorDetailObj, B2B_Frame_Color__c: 'background: url(' + this._transparentURI + ')' };
                            } else {
                                this._attributeColorMap.set(FRAME_COLOR, 'background: ' + color.colorHex);
                                productColorDetailObj = {
                                    ...productColorDetailObj,
                                    B2B_Frame_Color__c: 'background: ' + color.colorHex + '; background-color:' + color.colorHex + ' !important;'
                                };
                            }
                        }
                    });
                }
                this._productIdVsColorDetailsMap.set(this.orderItems[orderItem].Id, productColorDetailObj);
            }
        }
    }

    //BS-1584 added this method to handle read only screen
    populateReadOnlyData(result) {
        if (result !== undefined && result !== null) {
            let orderObj = result;
            this.lensSelectionReadOnlyCollection = {};
            this.lensSelectionReadOnlyCollection.glazingValue = orderObj.B2B_Glazing_Type__c ? orderObj.B2B_Glazing_Type__c : false; //BS-2331
            this.lensSelectionReadOnlyCollection.lensType = orderObj.B2B_Lens_Type__c ? orderObj.B2B_Lens_Type__c : false; //BS-2331
            this.lensSelectionReadOnlyCollection.lensIndex =
                orderObj.B2B_Lens_Index__c !== undefined && orderObj.B2B_Lens_Index__c !== null ? orderObj.B2B_Lens_Index__c : false;
            this.lensSelectionReadOnlyCollection.progressionLength =
                orderObj.B2B_Progression_Length__c !== undefined && orderObj.B2B_Progression_Length__c !== null ? orderObj.B2B_Progression_Length__c : false;

            /* Start : BS-2322 */
            this.lensSelectionReadOnlyCollection.selectedLensColor =
                orderObj !== undefined &&
                orderObj !== null &&
                orderObj.B2B_Lens_Color__c !== undefined &&
                orderObj.B2B_Lens_Color__c !== null &&
                orderObj.B2B_Glazing_Type__c !== undefined &&
                orderObj.B2B_Glazing_Type__c !== null &&
                orderObj.B2B_Glazing_Type__c === this.lensSelectionLabel.opticalSunGlazing
                    ? orderObj.B2B_Lens_Color__c
                    : false;
            /* End : BS-2322 */
            this.lensSelectionReadOnlyCollection.lensColor =
                orderObj.B2B_Glazing_Type__c !== undefined &&
                orderObj.B2B_Glazing_Type__c !== null &&
                orderObj.B2B_Glazing_Type__c !== this.lensSelectionLabel.opticalSunGlazing &&
                orderObj.B2B_Lens_Color_Id__r !== undefined &&
                orderObj.B2B_Lens_Color_Id__r !== null &&
                orderObj.B2B_Lens_Color_Id__r.Description !== undefined &&
                orderObj.B2B_Lens_Color_Id__r.Description !== null
                    ? orderObj.B2B_Lens_Color_Id__r.Description
                    : false;
            this.lensSelectionReadOnlyCollection.photoSensation =
                orderObj.B2B_Photo_Sensation__r !== undefined &&
                orderObj.B2B_Photo_Sensation__r.Description !== null &&
                orderObj.B2B_Photo_Sensation__r.Description !== undefined &&
                orderObj.B2B_Photo_Sensation__r.Description !== null
                    ? orderObj.B2B_Photo_Sensation__r.Description
                    : false;
            this.lensSelectionReadOnlyCollection.blueSensation =
                orderObj.B2B_Blue_Sensation__r !== undefined &&
                orderObj.B2B_Blue_Sensation__r !== null &&
                orderObj.B2B_Blue_Sensation__r.Description !== undefined &&
                orderObj.B2B_Blue_Sensation__r.Description !== null
                    ? orderObj.B2B_Blue_Sensation__r.Description
                    : false;
            //BS-2331
            this.lensSelectionReadOnlyCollection.lensDistance =
                orderObj.B2B_Lens_Distance__c !== undefined && orderObj.B2B_Lens_Distance__c !== null ? orderObj.B2B_Lens_Distance__c : false;
            this.lensSelectionReadOnlyCollection.productMaterial =
                orderObj.B2B_Lens_Material__c !== undefined && orderObj.B2B_Lens_Material__c !== null ? orderObj.B2B_Lens_Material__c : false;
            this.lensSelectionReadOnlyCollection.lensEdge =
                orderObj.B2B_Lens_Edge__c !== undefined && orderObj.B2B_Lens_Edge__c !== null ? orderObj.B2B_Lens_Edge__c : false;
            //BS-2331
            this.lensSelectionReadOnlyCollection.visualPreferences =
                orderObj.B2B_Visual_Preference__c !== undefined && orderObj.B2B_Visual_Preference__c !== null ? orderObj.B2B_Visual_Preference__c : false;
            this.lensSelectionReadOnlyCollection.antireflectionCoatingValue =
                orderObj.B2B_Antireflection_Product__r !== undefined &&
                orderObj.B2B_Antireflection_Product__r !== null &&
                orderObj.B2B_Antireflection_Product__r.Description !== undefined &&
                orderObj.B2B_Antireflection_Product__r.Description !== null
                    ? orderObj.B2B_Antireflection_Product__r.Description
                    : orderObj.B2B_Hard_Coating_Product__r !== undefined &&
                      orderObj.B2B_Hard_Coating_Product__r !== null &&
                      orderObj.B2B_Hard_Coating_Product__r.Description !== undefined &&
                      orderObj.B2B_Hard_Coating_Product__r.Description !== null
                    ? orderObj.B2B_Hard_Coating_Product__r.Description
                    : false;
            this.lensSelectionReadOnlyCollection.sGraving =
                this.orderData.B2B_S_Graving__c !== undefined && this.orderData.B2B_S_Graving__c !== null && this.orderData.B2B_S_Graving__c == true
                    ? true
                    : false;
            /* Start : BS-2158/BS-2174 */
            this.lensSelectionReadOnlyCollection.lensShape =
                orderObj.B2B_Lens_Shape__c !== undefined && orderObj.B2B_Lens_Shape__c !== null ? orderObj.B2B_Lens_Shape__c : false;
            this.lensSelectionReadOnlyCollection.lensSize =
                orderObj.B2B_Lens_Size__c !== undefined && orderObj.B2B_Lens_Size__c !== null ? orderObj.B2B_Lens_Size__c : false;

            this.lensSelectionReadOnlyCollection.colorGrooveData =
                orderObj !== undefined &&
                orderObj !== null &&
                orderObj.B2B_With_Color_Groove__c !== undefined &&
                orderObj.B2B_With_Color_Groove__c !== null &&
                orderObj.B2B_With_Color_Groove__c == true
                    ? orderObj.B2B_Selected_Color_Groove_Product__r !== undefined &&
                      orderObj.B2B_Selected_Color_Groove_Product__r !== null &&
                      orderObj.B2B_Selected_Color_Groove_Product__r.Name !== undefined &&
                      orderObj.B2B_Selected_Color_Groove_Product__r.Name !== null &&
                      orderObj.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c !== undefined &&
                      orderObj.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c !== null
                        ? {
                              label: orderObj.B2B_Selected_Color_Groove_Product__r.Name,
                              styling: STYLING_BACKGROUND_COLOR + orderObj.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c
                          }
                        : false
                    : false;

            this.lensSelectionReadOnlyCollection.accentRingData =
                orderObj !== undefined &&
                orderObj !== null &&
                orderObj.B2B_with_Accent_Ring__c !== undefined &&
                orderObj.B2B_with_Accent_Ring__c !== null &&
                orderObj.B2B_with_Accent_Ring__c == true
                    ? orderObj.B2B_Selected_Accent_Ring_Product__r !== undefined &&
                      orderObj.B2B_Selected_Accent_Ring_Product__r !== null &&
                      orderObj.B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c !== undefined &&
                      orderObj.B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c !== null &&
                      orderObj.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c !== undefined &&
                      orderObj.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c !== null
                        ? {
                              label: orderObj.B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c,
                              styling: STYLING_BACKGROUND_COLOR + orderObj.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c
                          }
                        : false
                    : false;

            /* Start : BS-2137 */
            if (
                orderObj !== undefined &&
                orderObj.B2B_With_Partial_Color_Groove__c !== undefined &&
                orderObj.B2B_With_Partial_Color_Groove__c !== null &&
                orderObj.B2B_With_Partial_Color_Groove__c == true
            ) {
                this.lensSelectionReadOnlyCollection.grooveColorLabel = WITH_PARTIAL_COLOR_GROOVE_LABEL.split(',')[1];
            } else {
                this.lensSelectionReadOnlyCollection.grooveColorLabel = this.label.colorGrooveColorLabel;
            }
            /* End : BS-2137 */

            this.lensSelectionReadOnlyCollection.showFacetCut =
                orderObj !== undefined && orderObj !== null && orderObj.B2B_Optimized_Facet_Cut__c !== undefined && orderObj.B2B_Optimized_Facet_Cut__c !== null
                    ? true
                    : false;

            this.lensSelectionReadOnlyCollection.withFacetCut =
                orderObj !== undefined && orderObj !== null && orderObj.B2B_Optimized_Facet_Cut__c !== undefined && orderObj.B2B_Optimized_Facet_Cut__c !== null
                    ? orderObj.B2B_Optimized_Facet_Cut__c
                    : false;

            if (
                (orderObj.B2B_a__c !== undefined && orderObj.B2B_a__c !== null && orderObj.B2B_a__c !== 0) ||
                (orderObj.B2B_b__c !== undefined && orderObj.B2B_b__c !== null && orderObj.B2B_b__c !== 0) ||
                (orderObj.B2B_b1__c !== undefined && orderObj.B2B_b1__c !== null && orderObj.B2B_b1__c !== 0) ||
                (orderObj.B2B_b2__c !== undefined && orderObj.B2B_b2__c !== null && orderObj.B2B_b2__c !== 0) ||
                (orderObj.B2B_SF__c !== undefined && orderObj.B2B_SF__c !== null && orderObj.B2B_SF__c !== 0) ||
                (orderObj.B2B_DHP__c !== undefined && orderObj.B2B_DHP__c !== null && orderObj.B2B_DHP__c !== 0)
            ) {
                this.lensSelectionReadOnlyCollection.shapeAdjusted = true;
            } else {
                this.lensSelectionReadOnlyCollection.shapeAdjusted = false;
            }
            /* Start : BS-2158/BS-2174 */
            this._isVsScreen = true;
            this._lensSelectionReadOnlySetupDone = true;
            this._isLoading = false; //BS-2322
        }
    }
    //BS-1064
    handleOrderPopup(event) {
        this._showReorderModal = true;
    }

    //BS-1064
    closeReorderModal() {
        this._showReorderModal = false;
    }

    //BS-1064
    handleReorderForVS() {
        this._applicableBrand = VS_BRAND;
        if (this.selectedOrderType == VISION_SENSATION) {
            this.createCloneConfiguratorForSameBrand(VS_BRAND);
        } else {
            this.createCloneConfiguratorForDifferentBrand(VS_BRAND);
        }
    }

    //BS-1064
    handleReorderForRX() {
        this._applicableBrand = RX_BRAND;
        if (this.selectedOrderType == RX_GlAZING) {
            this.createCloneConfiguratorForSameBrand(RX_BRAND);
        } else {
            this.createCloneConfiguratorForDifferentBrand(RX_BRAND);
        }
    }

    //BS-1064
    async createCloneConfiguratorForSameBrand(brand) {
        this._isLoading = true;
        this._showReorderModal = false;
        await createCloneConfiguratorForVSRX({
            orderId: this.orderId,
            isSameBrand: true,
            type: brand
        })
            .then(async (result) => {
                let lensConfiguratorInformationCollection = JSON.parse(JSON.stringify(result));
                let lensConfiguratorInformation = lensConfiguratorInformationCollection;
                // Capturing the data fetched from backend the Constructing and Restructing the data into object format that needs to pass to VS-RX Configurator
                let lensConfiguratorObject = {};
                lensConfiguratorObject = await setConfiguratorValues(lensConfiguratorInformation, this._applicableBrand);
                this._completeStepForNavigation = 4;
                this.lensConfiguratorCollectionData = JSON.parse(JSON.stringify(lensConfiguratorObject));
                if (lensConfiguratorObject && lensConfiguratorObject.selectedFrameSKU != undefined && lensConfiguratorObject.selectedFrameSKU != null) {
                    this.createFrameInformationCollection(lensConfiguratorObject.selectedFrameSKU);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    //BS-1064
    async createCloneConfiguratorForDifferentBrand(brand) {
        this._isLoading = true;
        this._showReorderModal = false;
        await createCloneConfiguratorForVSRX({
            orderId: this.orderId,
            isSameBrand: false,
            type: brand
        })
            .then(async (result) => {
                let lensConfiguratorInformationCollection = JSON.parse(JSON.stringify(result));
                let lensConfiguratorInformation = lensConfiguratorInformationCollection;
                // Capturing the data fetched from backend the Constructing and Restructing the data into object format that needs to pass to VS-RX Configurator
                let lensConfiguratorObject = {};
                lensConfiguratorObject = await setConfiguratorValuesForDifferentBrand(lensConfiguratorInformation, this._applicableBrand);
                this._completeStepForNavigation = 1;
                this.lensConfiguratorCollectionData = JSON.parse(JSON.stringify(lensConfiguratorObject));
                if (this.lensConfiguratorCollectionData) {
                    let targetPage;
                    if (this._applicableBrand != null && this._applicableBrand != undefined && this._applicableBrand != '') {
                        // Setting up target page according to the applicable brand
                        targetPage =
                            this._applicableBrand == VS_BRAND ? VISION_SENSATION_SITE_PAGE : this._applicableBrand == RX_BRAND ? RX_GLAZING_SITE_PAGE : null;
                    }

                    //Navigating to VS-RX page
                    this[NavigationMixin.Navigate]({
                        type: STANDARD_NAMED_PAGE,
                        attributes: {
                            name: targetPage
                        },
                        state: {
                            pageSource: MY_VS_RX_PAGE_SOURCE_IDENTIFIER,
                            lensConfiguratorCollection: JSON.stringify(this.lensConfiguratorCollectionData),
                            currentStep: this._completeStepForNavigation //BS-1775
                        }
                    });
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    //BS-1064
    createFrameInformationCollection(selectedFrameSku) {
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
                                this._frameInformationCollection.variantShape =
                                    frameProductData.B2B_Variant_Shape__c != undefined && frameProductData.B2B_Variant_Shape__c != null
                                        ? frameProductData.B2B_Variant_Shape__c
                                        : '';
                                this._frameInformationCollection.shapeSize =
                                    frameProductData.B2B_Shape_Size__c != undefined && frameProductData.B2B_Shape_Size__c != null
                                        ? frameProductData.B2B_Shape_Size__c
                                        : '';
                                this._frameInformationCollection.rimlessVariant =
                                    frameProductData.B2B_Rimless_Variant__c != undefined && frameProductData.B2B_Rimless_Variant__c != null
                                        ? frameProductData.B2B_Rimless_Variant__c
                                        : '';
                                this._frameInformationCollection.modelNameNumber =
                                    frameProductData.Name != undefined && frameProductData.Name != null ? frameProductData.Name : '';
                                this._frameInformationCollection.modelNameNumber +=
                                    frameProductData.B2B_Model__c != undefined && frameProductData.B2B_Model__c != null
                                        ? ' ' + frameProductData.B2B_Model__c
                                        : '';
                                productId = frameProductData.B2B_Product__c;
                                this._frameInformationCollection.hexcode = frameProductData.B2B_Hexcode__c;
                                this._frameInformationCollection.hexcodeAccent = frameProductData.B2B_Hexcode_Accent__c;
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
                                this[NavigationMixin.Navigate]({
                                    type: STANDARD_NAMED_PAGE,
                                    attributes: {
                                        name: targetPage
                                    },
                                    state: {
                                        pageSource: MY_VS_RX_PAGE_SOURCE_IDENTIFIER,
                                        lensConfiguratorCollection: JSON.stringify(this.lensConfiguratorCollectionData),
                                        productData: JSON.stringify(this._frameInformationCollection),
                                        productId: productId,
                                        currentStep: this._completeStepForNavigation //BS-1775
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

    checkEligibilityForVisionSensationEvilEyeRX() {
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
    /* Start of BS-2277 */
    handleRedirection() {
        if (this._isVSRXorder == false) {
            this[NavigationMixin.GenerateUrl]({
                type: NAVIGATION_DESTINATION,
                attributes: {
                    name: REORDER_PAGE
                },
                state: {
                    orderId: this.orderId,
                    orderNumber: this.orderErpNumber ? this.orderErpNumber : PROCESSING_ORDER_NUMBER
                }
            }).then((url) => {
                window.open(url, '_blank');
            });
        }
    }
    /* End of BS-2277 */

    /* Start of BS-2296 */
    async getAccountSpecificData() {
        await getAccountDetail({ recordId: this.effectiveAccountId })
            .then((accounData) => {
                if (accounData !== undefined && accounData !== null) {
                    this._countryCode = accounData.k_ARIS_Account_ID__c ? accounData.k_ARIS_Account_ID__c.substring(0, 4) : '';
                    this.getCountrySpecificDateFormatData();
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    async getCountrySpecificDateFormatData() {
        if (this._countryCode != null && this._countryCode != undefined) {
            await getCountryDateFormat({
                countryCode: this._countryCode
            })
                .then((result) => {
                    this._dateFormat = result;
                    this.getOrderData(this.orderId);
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

    /* End of BS-2296 */
    //BS-2343
    getLensConfiguratorId() {
        getLensConfigId({ orderId: this.orderId })
            .then((result) => {
                if (result != null) {
                    this.lensConfiguratorId = result;
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }
}
