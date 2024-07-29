import { LightningElement, wire, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import LANG from '@salesforce/i18n/lang';
import { decimalAppendedPrescriptionValues } from 'c/b2b_vsrxPrescriptionValues_utils';
import { DrawGlass, UpdateDrawGlass } from './externalLibrary';
//Apex methods
import getLensConfiguratorData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensConfiguratorData';
import getPrescriptionValues from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getPrescriptionValues';
import getFrameProductValues from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFrameProductValues';
import getFrameImage from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFrameImage';
import getRxSolutionValues from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getRxSolutionValues';
import getShapeSelectionScreenData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getShapeSelectionScreenData';
import getLensShapeDataByShapeName from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensShapeDataByShapeName';
import getLensShapeData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensShapeRecord';
import getLensSelectionScreenData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensSelectionScreenData';
import getLensSelectionValues from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensSelectionValues';
import B2B_AVAILABILITY_CHECK_LENSCOLORS_DOCUMENT from '@salesforce/label/c.B2B_VS_RX_AVAILABILITY_LENSCOLORS_LINK';
import WITH_PARTIAL_COLOR_GROOVE_LABEL from '@salesforce/label/c.B2B_PARTIAL_COLOR_GROOVE_LABEL'; //BS-2137
import B2B_VS_GLAZING from '@salesforce/label/c.B2B_VS_GLAZING';
import B2B_RX_Solution_Type_Labels from '@salesforce/label/c.B2B_RX_Solution_Type';
//Objects and Custom Fields
import LENS_CONFIGURATOR from '@salesforce/schema/B2B_Lens_Configurator__c';
import MEASUREMENT_SYSTEM from '@salesforce/schema/B2B_Lens_Configurator__c.B2B_Measurement_System__c';

//Static resource
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';
//custom labels
import B2B_VS_RX_ORDER_REFERENCE_LABELS from '@salesforce/label/c.B2B_VS_RX_Order_Reference_Labels'; // Order Information Labels
import B2B_RX_Product_Fields from '@salesforce/label/c.B2B_RX_Product_Fields'; // Frame Reference Labels
import B2B_VS_Product_Fields from '@salesforce/label/c.B2B_VS_Product_Fields'; // Frame Reference Labels
import B2B_RX_Solution_Type from '@salesforce/label/c.B2B_RX_Solution_Type'; // RX Solution Labels
import B2B_RX_STEPS from '@salesforce/label/c.B2B_RX_SUMMARY_PAGE_ALL_STEPS'; //BS-655 Labels of Steps applicable for RX
import B2B_VS_STEPS from '@salesforce/label/c.B2B_VS_SUMMARY_PAGE_ALL_STEPS'; //BS-655 Labels of Steps applicable for RX
import B2B_VS_RX_PRESCRIPTION_VALUE from '@salesforce/label/c.B2B_VS_RX_PRESCRIPTION_VALUE';
import B2B_VS_RX_EYE_SIDE from '@salesforce/label/c.B2B_VS_RX_EYE_SIDE';
import B2B_VS_RX_BASE_VALUE from '@salesforce/label/c.B2B_VS_RX_BASE_VALUE';
import B2B_VS_RX_RIGHT_EYE from '@salesforce/label/c.B2B_VS_RX_RIGHT_EYE';
import B2B_VS_RX_LEFT_EYE from '@salesforce/label/c.B2B_VS_RX_LEFT_EYE';
import B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS from '@salesforce/label/c.B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS';
import B2B_VS_RX_MEASUREMENT_UNIT from '@salesforce/label/c.B2B_VS_RX_MEASUREMENT_UNIT';
import B2B_VS_RX_EMPTY_INPUT_ERROR from '@salesforce/label/c.B2B_VS_RX_EMPTY_INPUT_ERROR';
import B2B_VS_RX_PRESCRIPTION_VALUE_INPUT_FIELDS_NAME from '@salesforce/label/c.B2B_VS_RX_Prescription_Value_Input_Fields_Name'; //BS-1151
import B2B_VS_RX_CENTERING_RADIO_BUTTON from '@salesforce/label/c.B2B_VS_RX_CENTERING_RADIO_BUTTON';
import B2B_VS_RX_CENTERING_INFO_TEXT from '@salesforce/label/c.B2B_VS_RX_CENTERING_INFO_TEXT';
import B2B_VS_RX_CENTERING_INFO_TEXT_FIELD from '@salesforce/label/c.B2B_VS_RX_CENTERING_INFO_TEXT_FIELD';
import B2B_VS_RX_CENTERING_INPUT_FIELD from '@salesforce/label/c.B2B_VS_RX_CENTERING_INPUT_FIELD';
import B2B_VS_RX_CENTERING_DATA from '@salesforce/label/c.B2B_VS_RX_CENTERING_DATA';
import B2B_VS_RX_CENTERING_DATA_ERROR from '@salesforce/label/c.B2B_VS_RX_CENTERING_DATA_ERROR';
import LENS_SELECTION_LABELS from '@salesforce/label/c.B2B_Lens_Selection_Labels';
import B2B_VS_RX_MODAL_FOR_DIRECTGLAZING from '@salesforce/label/c.B2B_VS_RX_CHECK_MODAL_FOR_DIRECTGLAZING_ON_CENTERING_DATA'; //BS-1151
import B2B_VS_RX_CENTERING_MSG_ADAPTER from '@salesforce/label/c.B2B_VS_RX_CENTERING_DATA_MSG_ADAPTER'; //BS-1151
import B2B_VS_RX_CENTERING_MSG_DIRECT_GLAZING from '@salesforce/label/c.B2B_VS_RX_CENTERING_DATA_MSG_DIRECT_GLAZING'; //BS-1151
import B2B_VS_RX_LENS_SELECTION_LINKOUT_LABEL from '@salesforce/label/c.B2B_VS_RX_LENS_SELECTION_LINKOUT_LABEL'; //BS-1151
import B2B_Lens_Only_For_Clip_In from '@salesforce/label/c.B2B_Lens_Only_For_Clip_In'; //BS-1311
import B2B_YES_BUTTON_LABEL from '@salesforce/label/c.B2B_YES_BUTTON_LABEL'; //BS-1311
import CART_ITEM_LABELS from '@salesforce/label/c.B2B_CartContents_And_CartItems'; //BS-1311
import B2B_PLP_ColorFilter_Columns from '@salesforce/label/c.B2B_PLP_ColorFilter_Columns'; //BS-1334
import B2B_lenses_without_adapter from '@salesforce/label/c.B2B_lenses_without_adapter'; //BS-1340

import B2B_VS_SHAPE_SELECTION_SCREEN_LABELS from '@salesforce/label/c.B2B_VS_SHAPE_SELECTION_SCREEN_LABELS';
import B2B_SHOW_ALL_SHAPES_HELPTEXT from '@salesforce/label/c.B2B_SHOW_ALL_SHAPES_HELPTEXT';
import B2B_SHOW_ALL_SHAPES from '@salesforce/label/c.B2B_SHOW_ALL_SHAPES';
import B2B_VS_LENS_TYPE from '@salesforce/label/c.B2B_VS_LENS_TYPE';
import B2B_VS_LENS_SELECTION from '@salesforce/label/c.B2B_VS_LENS_SELECTION'; //BS-1466
import B2B_FACET_CUT_LABEL from '@salesforce/label/c.B2B_FACET_CUT_LABEL'; //BS-793
import B2B_FACET_CUT_IMAGE_TITLE from '@salesforce/label/c.B2B_FACET_CUT_IMAGE_TITLE'; //BS-793
import B2B_VS_SGRAVING_LABEL from '@salesforce/label/c.B2B_VS_SGRAVING_LABEL'; //BS-1796

const RX_GLAZING = 'RX Glazing';
const BOXING_SYSTEM = 'Boxing System';
const MEASUREMENT_LINE_SYSTEM = 'Measurement Line System';
const CLIP_IN = 'Clip - in';
const TRANSPARENT = 'transparent';
const DIRECT_GLAZING_ENGLISH = 'Direct Glazing';
const DIRECT_GLAZING_GERMAN = 'Direkt Verglasung';
const ADAPTER = 'Adapter';
const LANGUAGE_ENGLISH = 'en-US';

const MY_VS_RX_PAGE = 'My_VS_RX'; //BS_1244
const LENS_TYPE_PANORAMA_SINGLE_VISION = LENS_SELECTION_LABELS.split(',')[1]; //BS-1342
const VISION_SENSATION = 'Vision Sensation';
const WITH_COLORED_GROOVE = 'with Colored grooves';
const REMOVE_DRILLS_VALUE = 'remove drills';
const WITH_ACCENT_RING_VALUE = 'with Accent Rings';
const STYLING_BACKGROUND_COLOR = 'background-color:';
const LENS_ONLY = 'Lens Only';
const OPTICAL_GLAZING = 'Optical Glazing';
const OPTICAL_SUN_GLAZING = 'Optical Sun Glazing';
const FACET_CUT_VALUE = 'facet cut';
const S_GRAVING = 'S Graving'; //BS-1796
const PARTIAL_GROOVE_VALUE = 'With Partial Color Groove'; //BS-2137

export default class B2b_vs_rx_summary_component extends LightningElement {
    linkoutImg = STORE_STYLING + '/icons/externalLink.svg'; //BS-1151
    infoSVG = STORE_STYLING + '/icons/INFO.svg'; //BS-1151
    centeringDataImage = STORE_STYLING + '/icons/centeringData1.jpg'; //BS-1151
    centeringDataImage2 = STORE_STYLING + '/icons/centeringData2.png'; //BS-1151
    evilEyeEdgeIcon = STORE_STYLING + '/icons/evil_eye_edge1.png'; //BS-1151
    imgForAdapter = STORE_STYLING + '/icons/ImgForAdapter.png'; //BS-1151
    imgForDirectGlazing = STORE_STYLING + '/icons/ImgForDirectGlazing.png'; //BS-1151
    _facetCutImage = STORE_STYLING + '/icons/facetCutImage.png'; // BS-793
    _sGraving = STORE_STYLING + '/icons/Foto_S_Gravur.jpg'; // BS-1796
    clip_in_label = B2B_RX_Solution_Type.split(',')[2]; //BS-2389

    /**
     * Variable to store current url path
     * BS-1094
     * @type {String}
     */
    _urlPath;

    _isLoading;
    _result;
    _lensConfiguratorId;
    _currentBrand;
    lensProductSKU;
    _frameInformationData;
    _rxSolutionData;
    _lensSelectionData;
    _fittingHeightRightEye;
    _fittingHeightLeftEye;
    _pupilDistanceLeftEye;
    _pupilDistanceRightEye;
    _measurementSystemChecked = false;
    _boxingSystemChecked = false;

    /**
     * Variable to store prescription value data to
     * pass the child component
     * BS-1151
     */
    _prescriptionValueCollection = {};
    _selectedBaseValue;
    _selectedEyeSideValue;
    _isEvilEyeEdgeSelected;
    _isReadOnly = true;
    _readOnlyOriginalParsedData = {};
    _readOnlyParsedData = {};
    _selectedAccentRingColor = {};
    _accentRingImage;
    _showAccentRingImage = false;
    _withAccentRingValue = false;
    _selectedColoredGrooveColor = {};
    _isOrderTypeLensOnly = false;
    _facetCutLabel = B2B_FACET_CUT_LABEL;
    _facetCutImageTitle = B2B_FACET_CUT_IMAGE_TITLE;
    _readOnlySetupDone = false;
    _lensShapeRecordId;
    _showFacetCutImage = false;
    _showSgravingImage = false; //BS-1796
    _sGravingLabel = B2B_VS_SGRAVING_LABEL.split(',')[0]; //BS-1796

    /**
     * Variable to store all steps data attributes to
     * control the iterations in Html
     * BS-1151
     */
    @track
    _allStepsDataCollection = [];

    /**
     * Variable to store prescription value data to
     * queried depending on the lens sku from product object
     * BS-1151
     */
    @track
    _prescriptionFieldsData = [];

    @track
    availablityCheckLensColorDocument;

    _boxingSystemLabel;
    _measurementFieldData;
    _measurementLineSystemLabel;
    _boxingSystemValue;
    _measurementLineSystemValue;
    _frameInformationImage;
    _glassLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[1];
    _lensShapeLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[2];
    _lensSizeLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[3];
    _heightLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[6];
    _widthLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[7];
    _originalShapeLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[4];
    _scaledShapeLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[5];
    _measurementUnitLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[8];
    _showAllShapesHelpText = B2B_SHOW_ALL_SHAPES_HELPTEXT;
    _showAllShapesLabel = B2B_SHOW_ALL_SHAPES;
    _aLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[12];
    _bLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[13];
    _sfLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[14];
    _b1Label = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[15];
    _b2Label = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[16];
    _dhpLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[17];
    _shapeEditorHeader = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[24];
    _shapeEditorSubHeader = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[25];
    _removeDrillsLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[31];
    _yesLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[32];
    _noLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[33];
    _withAccentRingLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[34];
    _accentRingColorLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[35];
    _removeGrooveLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[36];
    _selectColorOptionLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[37];
    _withColorGrooveLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[38];
    _colorGrooveColorLabel = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[39];
    /**
     * This collection is used to hold the lens configuration collection fetched from database
     * BS-1244
     * @type {Array}
     */
    @track
    _lensConfigurationCollection;

    /**
     * Get The labels used in the template.
     * BS-723
     * @type {Object}
     */
    get label() {
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
            opticalGlazing: B2B_VS_GLAZING.split(',')[1],
            opticalSunGlazing: B2B_VS_GLAZING.split(',')[2],
            glazing: B2B_VS_GLAZING.split(',')[0],
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
     * This variable is used to hold the page source
     * BS-1244
     * @type {String}
     */
    @track
    pageSource = MY_VS_RX_PAGE;

    _headerLabelForAntireflectionAndHardCoatingSelection = this.label.hardCoatingLabel; //BS-2190

    /**
     * This variable is used to control the visibility of calculate lens component
     * BS-1244
     * @type {Boolean}
     */
    _showCalculateLensComponent = false;

    /**
     * This variable is used to control the visibility of summary page
     * BS-1244
     * @type {Boolean}
     */
    _initialLoadComplete = false;

    /**
     * Custom labels used on UI
     * BS-1151
     * @type {object}
     */
    labels = {
        customerNameLabel: B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[0],
        clerkLabel: B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[1],
        orderTypeLabel: B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[2],
        frameTypeLabel: B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[3],
        conceptCollectionLabel: B2B_RX_Product_Fields.split(',')[0],
        colorLabel: B2B_RX_Product_Fields.split(',')[1],
        bridgeTempleLabel: B2B_VS_Product_Fields.split(',')[2],
        sizeLabel: B2B_RX_Product_Fields.split(',')[2] /**Updated as a part of BS-1142 */,
        rxTypeLabel: B2B_RX_Solution_Type.split(',')[3],
        lensTypeLabel: LENS_SELECTION_LABELS.split(',')[0],
        lensIndexLabel: LENS_SELECTION_LABELS.split(',')[5],
        lensSelectionLinkoutLabel: B2B_VS_RX_LENS_SELECTION_LINKOUT_LABEL,
        antiReflectionLabel: LENS_SELECTION_LABELS.split(',')[9],
        hardCoatingLabel: LENS_SELECTION_LABELS.split(',')[10],
        lensDetailLabel: LENS_SELECTION_LABELS.split(',')[4],
        materialLabel: LENS_SELECTION_LABELS.split(',')[3],
        evilEyeEdgeLabel: LENS_SELECTION_LABELS.split(',')[13], //BS-1019
        modelsForDirectGlazing: B2B_VS_RX_MODAL_FOR_DIRECTGLAZING.split(','),
        msgForAdapter: B2B_VS_RX_CENTERING_MSG_ADAPTER, //BS-1065
        msgForDirectGlazing: B2B_VS_RX_CENTERING_MSG_DIRECT_GLAZING, //BS-1065
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
        centeringData: B2B_VS_RX_CENTERING_DATA,
        pupilDistance: B2B_VS_RX_CENTERING_INPUT_FIELD.split(',')[0],
        fittingHeight: B2B_VS_RX_CENTERING_INPUT_FIELD.split(',')[1],
        pantascopicTilt: B2B_VS_RX_CENTERING_INFO_TEXT_FIELD.split(',')[0],
        bvdWorn: B2B_VS_RX_CENTERING_INFO_TEXT_FIELD.split(',')[1],
        bvdReffracted: B2B_VS_RX_CENTERING_INFO_TEXT_FIELD.split(',')[2],
        defaultMeasurementDegree: B2B_VS_RX_CENTERING_INFO_TEXT.split(',')[0],
        defaultMeasurementMM: B2B_VS_RX_CENTERING_INFO_TEXT.split(',')[1],
        boxingSystem: B2B_VS_RX_CENTERING_RADIO_BUTTON.split(',')[0],
        measurementLineSystem: B2B_VS_RX_CENTERING_RADIO_BUTTON.split(',')[1],
        message: B2B_VS_RX_CENTERING_DATA_ERROR,
        workingDistanceFieldLabel: B2B_VS_RX_CENTERING_INFO_TEXT_FIELD.split(',')[3],
        workingDistanceFieldHelpTextLabel: B2B_VS_RX_CENTERING_INFO_TEXT_FIELD.split(',')[4],
        lensOnlyForClipIn: B2B_Lens_Only_For_Clip_In,
        yes: B2B_YES_BUTTON_LABEL,
        productSize: CART_ITEM_LABELS.split(',')[7],
        lensColor: B2B_PLP_ColorFilter_Columns.split(',')[1],
        lensesWithoutAdapter: B2B_lenses_without_adapter
    };

    /**
     * Wire call to get the details about Lens configurator object
     * BS-726
     * @type {object}
     */
    @wire(getObjectInfo, { objectApiName: LENS_CONFIGURATOR })
    lensConfiguratorInfo;

    @track
    _shapeSelectionCollection;

    lensSelectionReadOnlyCollection;

    /**
     * Wire call to get the measurement picklist field value data.
     * BS-726
     * @type {object}
     */
    @wire(getPicklistValues, { recordTypeId: '$lensConfiguratorInfo.data.defaultRecordTypeId', fieldApiName: MEASUREMENT_SYSTEM })
    getEyeSideValues({ error, data }) {
        if (data) {
            this._measurementFieldData = data.values;
            this._boxingSystemLabel = this._measurementFieldData[0].label;
            this._measurementLineSystemLabel = this._measurementFieldData[1].label;
            this._boxingSystemValue = this._measurementFieldData[0].value;
            this._measurementLineSystemValue = this._measurementFieldData[1].value;
        } else if (error) {
            console.log(error);
        }
    }

    /**
     * BS-1151
     * Custom Label which will hold the list of possible user imputs name for prescription values screen.
     */
    inputFieldsNameList = B2B_VS_RX_PRESCRIPTION_VALUE_INPUT_FIELDS_NAME.split(',');

    /**
     * BS-1151
     * getting the lens configurator Id and brand from the url
     * passed from the order history page
     */
    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        this._urlPath = pageRef;

        // Checking if url state contains parameters
        if (this._urlPath != null && this._urlPath != undefined && this._urlPath.state != null && this._urlPath.state != undefined && this._urlPath.state) {
            let stateAttributes = Object.keys(this._urlPath.state);
            if (stateAttributes != null && stateAttributes != undefined && stateAttributes.includes('recordId')) {
                this._lensConfiguratorId = this._urlPath.state.recordId;
            }
            if (stateAttributes != null && stateAttributes != undefined && stateAttributes.includes('brand')) {
                this._currentBrand = this._urlPath.state.brand;
            }
        }
    }

    /**
     * BS-1151
     * Connected callback sets the all possible screens in the screen and
     * gets the complete data from the lens configurator object
     */
    connectedCallback() {
        this._isLoading = true;
        if (this._currentBrand == RX_GLAZING) {
            this._allSteps = B2B_RX_STEPS.split(',');
        } else if (this._currentBrand == VISION_SENSATION) {
            this._allSteps = B2B_VS_STEPS.split(',');
        }
        this.getLensConfiguratorData();

        //BS-1799 Removed hardcoded language checks
        this.availablityCheckLensColorDocument = B2B_AVAILABILITY_CHECK_LENSCOLORS_DOCUMENT;
    }

    /**
     * BS-1151
     * this methods fetchs all fields data needed for the summary screen
     * from the lens configurator object
     */
    getLensConfiguratorData() {
        getLensConfiguratorData({
            lensConfiguratorId: this._lensConfiguratorId,
            isReadOnlyPage: true
        })
            .then((data) => {
                this._result = JSON.parse(JSON.stringify(data));
                if (this._result && this._result[0]) {
                    this.getFrameInformationValues(this._result[0].B2B_Selected_Frame__c);
                    this._pupilDistanceRightEye = this._result[0].B2B_Pupil_Distance_Right_Eye__c;
                    this._pupilDistanceLeftEye = this._result[0].B2B_Pupil_Distance_Left_Eye__c;
                    this._fittingHeightLeftEye = this._result[0].B2B_Fitting_height_Left_Eye__c;
                    this._fittingHeightRightEye = this._result[0].B2B_Fitting_height_Right_Eye__c;
                    this.lensProductSKU = this._result[0].B2B_Selected_Lens_SKU__c;
                    this._isEvilEyeEdgeSelected = this._result[0].B2B_Evil_Eye_Edge__c;
                    if (this._result[0].B2B_Measurement_System__c != null && this._result[0].B2B_Measurement_System__c != undefined) {
                        if (this._result[0].B2B_Measurement_System__c.toLowerCase() === BOXING_SYSTEM.toLowerCase()) {
                            this._boxingSystemChecked = true;
                        } else if (this._result[0].B2B_Measurement_System__c.toLowerCase() === MEASUREMENT_LINE_SYSTEM.toLowerCase()) {
                            this._measurementSystemChecked = true;
                        }
                    }
                }

                //BS-1244 - Start
                let lensConfiguratorInformationCollection = JSON.parse(JSON.stringify(data));
                let lensConfiguratorInformation = lensConfiguratorInformationCollection[0];
                // Capturing the data fetched from backend the Constructing and Restructing the data into object format that needs to pass to VS-RX Configurator
                let lensConfiguratorObject = {};
                lensConfiguratorObject.accountId =
                    lensConfiguratorInformation.B2B_Account__c != null &&
                    lensConfiguratorInformation.B2B_Account__c != undefined &&
                    lensConfiguratorInformation.B2B_Account__c != ''
                        ? lensConfiguratorInformation.B2B_Account__c
                        : null; //B2B_Account__c
                lensConfiguratorObject.collectionDesignFamily =
                    lensConfiguratorInformation.B2B_Frame_Collection__c != null &&
                    lensConfiguratorInformation.B2B_Frame_Collection__c != undefined &&
                    lensConfiguratorInformation.B2B_Frame_Collection__c != ''
                        ? lensConfiguratorInformation.B2B_Frame_Collection__c
                        : null; //B2B_Frame_Collection__c
                lensConfiguratorObject.selectedFrameSKU =
                    lensConfiguratorInformation.B2B_Selected_Frame__c != null &&
                    lensConfiguratorInformation.B2B_Selected_Frame__c != undefined &&
                    lensConfiguratorInformation.B2B_Selected_Frame__c != ''
                        ? lensConfiguratorInformation.B2B_Selected_Frame__c
                        : null; //B2B_Selected_Frame__c
                lensConfiguratorObject.frameColor = null; // Frame
                lensConfiguratorObject.frameColorDescription = null; // Frame
                lensConfiguratorObject.bridgeSize =
                    lensConfiguratorInformation.B2B_Bridge__c != null &&
                    lensConfiguratorInformation.B2B_Bridge__c != undefined &&
                    lensConfiguratorInformation.B2B_Bridge__c != ''
                        ? lensConfiguratorInformation.B2B_Bridge__c
                        : null; //B2B_Bridge__c
                lensConfiguratorObject.templeLength =
                    lensConfiguratorInformation.B2B_Temple__c != null &&
                    lensConfiguratorInformation.B2B_Temple__c != undefined &&
                    lensConfiguratorInformation.B2B_Temple__c != ''
                        ? lensConfiguratorInformation.B2B_Temple__c
                        : null; //B2B_Temple__c
                lensConfiguratorObject.lensSize =
                    lensConfiguratorInformation.B2B_Lens_Size__c != null &&
                    lensConfiguratorInformation.B2B_Lens_Size__c != undefined &&
                    lensConfiguratorInformation.B2B_Lens_Size__c != ''
                        ? lensConfiguratorInformation.B2B_Lens_Size__c.toString()
                        : null; //B2B_Lens_Size__c
                lensConfiguratorObject.eeSize = null;
                lensConfiguratorObject.status =
                    lensConfiguratorInformation.B2B_Status__c != null &&
                    lensConfiguratorInformation.B2B_Status__c != undefined &&
                    lensConfiguratorInformation.B2B_Status__c != ''
                        ? lensConfiguratorInformation.B2B_Status__c
                        : null; //B2B_Status__c
                lensConfiguratorObject.customerName =
                    lensConfiguratorInformation.B2B_Customer_Name__c != null &&
                    lensConfiguratorInformation.B2B_Customer_Name__c != undefined &&
                    lensConfiguratorInformation.B2B_Customer_Name__c != ''
                        ? lensConfiguratorInformation.B2B_Customer_Name__c
                        : null; //B2B_Customer_Name__c
                lensConfiguratorObject.clerk =
                    lensConfiguratorInformation.B2B_Clerk__c != null &&
                    lensConfiguratorInformation.B2B_Clerk__c != undefined &&
                    lensConfiguratorInformation.B2B_Clerk__c != ''
                        ? lensConfiguratorInformation.B2B_Clerk__c
                        : null; //B2B_Clerk__c
                lensConfiguratorObject.orderType =
                    lensConfiguratorInformation.B2B_Order_Type__c != null &&
                    lensConfiguratorInformation.B2B_Order_Type__c != undefined &&
                    lensConfiguratorInformation.B2B_Order_Type__c != ''
                        ? lensConfiguratorInformation.B2B_Order_Type__c
                        : null; //B2B_Order_Type__c
                lensConfiguratorObject.applicableBrand =
                    lensConfiguratorInformation.B2B_Type__c != null &&
                    lensConfiguratorInformation.B2B_Type__c != undefined &&
                    lensConfiguratorInformation.B2B_Type__c != ''
                        ? lensConfiguratorInformation.B2B_Type__c
                        : null; //B2B_Type__c
                lensConfiguratorObject.lensConfiguratorID = this._lensConfiguratorId;
                lensConfiguratorObject.lensType =
                    lensConfiguratorInformation.B2B_Lens_Type__c != null &&
                    lensConfiguratorInformation.B2B_Lens_Type__c != undefined &&
                    lensConfiguratorInformation.B2B_Lens_Type__c != ''
                        ? lensConfiguratorInformation.B2B_Lens_Type__c
                        : null; //B2B_Lens_Type__c
                lensConfiguratorObject.lensColor = null; //Lens color
                lensConfiguratorObject.lensIndex =
                    lensConfiguratorInformation.B2B_Lens_Index__c != null &&
                    lensConfiguratorInformation.B2B_Lens_Index__c != undefined &&
                    lensConfiguratorInformation.B2B_Lens_Index__c != ''
                        ? lensConfiguratorInformation.B2B_Lens_Index__c
                        : null; //B2B_Lens_Index__c
                lensConfiguratorObject.antireflectionSKU =
                    lensConfiguratorInformation.B2B_Antireflection_SKU__c != null &&
                    lensConfiguratorInformation.B2B_Antireflection_SKU__c != undefined &&
                    lensConfiguratorInformation.B2B_Antireflection_SKU__c != ''
                        ? lensConfiguratorInformation.B2B_Antireflection_SKU__c
                        : null; //B2B_Antireflection_SKU__c
                lensConfiguratorObject.productMaterial = null; //
                lensConfiguratorObject.withEvilEyeEdge =
                    lensConfiguratorInformation.B2B_Evil_Eye_Edge__c != null &&
                    lensConfiguratorInformation.B2B_Evil_Eye_Edge__c != undefined &&
                    lensConfiguratorInformation.B2B_Evil_Eye_Edge__c != ''
                        ? lensConfiguratorInformation.B2B_Evil_Eye_Edge__c
                        : false; //B2B_Evil_Eye_Edge__c
                lensConfiguratorObject.selectedRXSolution =
                    lensConfiguratorInformation.B2B_RX_Solution__c != null &&
                    lensConfiguratorInformation.B2B_RX_Solution__c != undefined &&
                    lensConfiguratorInformation.B2B_RX_Solution__c != ''
                        ? lensConfiguratorInformation.B2B_RX_Solution__c
                        : null; //B2B_RX_Solution__c
                lensConfiguratorObject.rxType =
                    lensConfiguratorInformation.B2B_RX_Type__c != null &&
                    lensConfiguratorInformation.B2B_RX_Type__c != undefined &&
                    lensConfiguratorInformation.B2B_RX_Type__c != ''
                        ? lensConfiguratorInformation.B2B_RX_Type__c
                        : null; //B2B_RX_Type__c
                lensConfiguratorObject.selectedRXSolutionSKU =
                    lensConfiguratorInformation.B2B_Selected_RX_Solution_SKU__c != null &&
                    lensConfiguratorInformation.B2B_Selected_RX_Solution_SKU__c != undefined &&
                    lensConfiguratorInformation.B2B_Selected_RX_Solution_SKU__c != ''
                        ? lensConfiguratorInformation.B2B_Selected_RX_Solution_SKU__c
                        : null; //B2B_Selected_RX_Solution_SKU__c
                lensConfiguratorObject.selectedFrameVariantShape =
                    lensConfiguratorInformation.B2B_Variant_Shape__c != null &&
                    lensConfiguratorInformation.B2B_Variant_Shape__c != undefined &&
                    lensConfiguratorInformation.B2B_Variant_Shape__c != ''
                        ? lensConfiguratorInformation.B2B_Variant_Shape__c
                        : null; //B2B_Variant_Shape__c
                lensConfiguratorObject.selectedFrameBridgeSize =
                    lensConfiguratorInformation.B2B_Bridge__c != null &&
                    lensConfiguratorInformation.B2B_Bridge__c != undefined &&
                    lensConfiguratorInformation.B2B_Bridge__c != ''
                        ? lensConfiguratorInformation.B2B_Bridge__c
                        : null; //B2B_Bridge__c
                lensConfiguratorObject.selectedFrameLensSize =
                    lensConfiguratorInformation.B2B_Lens_Size__c != null &&
                    lensConfiguratorInformation.B2B_Lens_Size__c != undefined &&
                    lensConfiguratorInformation.B2B_Lens_Size__c != ''
                        ? lensConfiguratorInformation.B2B_Lens_Size__c.toString()
                        : null; //B2B_Lens_Size__c
                lensConfiguratorObject.selectedFrameBaseCurve =
                    lensConfiguratorInformation.B2B_Base_Curve__c != null &&
                    lensConfiguratorInformation.B2B_Base_Curve__c != undefined &&
                    lensConfiguratorInformation.B2B_Base_Curve__c != ''
                        ? lensConfiguratorInformation.B2B_Base_Curve__c
                        : null; //B2B_Base_Curve__c
                lensConfiguratorObject.selectedFrameColorNumber =
                    lensConfiguratorInformation.B2B_Color_Number__c != null &&
                    lensConfiguratorInformation.B2B_Color_Number__c != undefined &&
                    lensConfiguratorInformation.B2B_Color_Number__c != ''
                        ? lensConfiguratorInformation.B2B_Color_Number__c
                        : null; //B2B_Color_Number__c
                lensConfiguratorObject.selectedFrameTempleLength =
                    lensConfiguratorInformation.B2B_Temple__c != null &&
                    lensConfiguratorInformation.B2B_Temple__c != undefined &&
                    lensConfiguratorInformation.B2B_Temple__c != ''
                        ? lensConfiguratorInformation.B2B_Temple__c
                        : null; //B2B_Temple__c
                lensConfiguratorObject.withoutClipIn =
                    lensConfiguratorInformation.B2B_without_clipin__c != null &&
                    lensConfiguratorInformation.B2B_without_clipin__c != undefined &&
                    lensConfiguratorInformation.B2B_without_clipin__c != ''
                        ? lensConfiguratorInformation.B2B_without_clipin__c
                        : false; //B2B_without_clipin__c
                lensConfiguratorObject.lensSKU =
                    lensConfiguratorInformation.B2B_Selected_Lens_SKU__c != null &&
                    lensConfiguratorInformation.B2B_Selected_Lens_SKU__c != undefined &&
                    lensConfiguratorInformation.B2B_Selected_Lens_SKU__c != ''
                        ? lensConfiguratorInformation.B2B_Selected_Lens_SKU__c
                        : null; //B2B_Selected_Lens_SKU__c
                lensConfiguratorObject.eyeSide =
                    lensConfiguratorInformation.B2B_Eye_Side__c != null &&
                    lensConfiguratorInformation.B2B_Eye_Side__c != undefined &&
                    lensConfiguratorInformation.B2B_Eye_Side__c != ''
                        ? lensConfiguratorInformation.B2B_Eye_Side__c
                        : null; //B2B_Eye_Side__c
                lensConfiguratorObject.baseValue =
                    lensConfiguratorInformation.B2B_Base_Values__c != null &&
                    lensConfiguratorInformation.B2B_Base_Values__c != undefined &&
                    lensConfiguratorInformation.B2B_Base_Values__c != ''
                        ? lensConfiguratorInformation.B2B_Base_Values__c
                        : null; //B2B_Base_Values__c
                lensConfiguratorObject.rightsphere =
                    lensConfiguratorInformation.B2B_Sphere_Right__c != null &&
                    lensConfiguratorInformation.B2B_Sphere_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Sphere_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Sphere_Right__c
                        : null; //B2B_Sphere_Right__c
                lensConfiguratorObject.rightaxis =
                    lensConfiguratorInformation.B2B_Axis_Right__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Right__c.toString()
                        : null; //B2B_Axis_Right__c
                lensConfiguratorObject.rightcylinder =
                    lensConfiguratorInformation.B2B_Cylinder_Right__c != null &&
                    lensConfiguratorInformation.B2B_Cylinder_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Cylinder_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Cylinder_Right__c.toString()
                        : null; //B2B_Cylinder_Right__c
                lensConfiguratorObject.leftsphere =
                    lensConfiguratorInformation.B2B_Sphere_Left__c != null &&
                    lensConfiguratorInformation.B2B_Sphere_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_Sphere_Left__c != ''
                        ? lensConfiguratorInformation.B2B_Sphere_Left__c
                        : null; //B2B_Sphere_Left__c
                lensConfiguratorObject.leftcylinder =
                    lensConfiguratorInformation.B2B_Cylinder_Left__c != null &&
                    lensConfiguratorInformation.B2B_Cylinder_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_Cylinder_Left__c != ''
                        ? lensConfiguratorInformation.B2B_Cylinder_Left__c.toString()
                        : null; //B2B_Cylinder_Left__c
                lensConfiguratorObject.leftaxis =
                    lensConfiguratorInformation.B2B_Axis_Left__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Left__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Left__c.toString()
                        : null; //B2B_Axis_Left__c
                lensConfiguratorObject.pupilDistanceRightEye =
                    lensConfiguratorInformation.B2B_Pupil_Distance_Right_Eye__c != null &&
                    lensConfiguratorInformation.B2B_Pupil_Distance_Right_Eye__c != undefined &&
                    lensConfiguratorInformation.B2B_Pupil_Distance_Right_Eye__c != ''
                        ? lensConfiguratorInformation.B2B_Pupil_Distance_Right_Eye__c.toString()
                        : null; //B2B_Pupil_Distance_Right_Eye__c
                lensConfiguratorObject.pupilDistanceLeftEye =
                    lensConfiguratorInformation.B2B_Pupil_Distance_Left_Eye__c != null &&
                    lensConfiguratorInformation.B2B_Pupil_Distance_Left_Eye__c != undefined &&
                    lensConfiguratorInformation.B2B_Pupil_Distance_Left_Eye__c != ''
                        ? lensConfiguratorInformation.B2B_Pupil_Distance_Left_Eye__c.toString()
                        : null; //B2B_Pupil_Distance_Left_Eye__c
                lensConfiguratorObject.fittingHeightRightEye =
                    lensConfiguratorInformation.B2B_Fitting_height_Right_Eye__c != null &&
                    lensConfiguratorInformation.B2B_Fitting_height_Right_Eye__c != undefined &&
                    lensConfiguratorInformation.B2B_Fitting_height_Right_Eye__c != ''
                        ? lensConfiguratorInformation.B2B_Fitting_height_Right_Eye__c.toString()
                        : null; // B2B_Fitting_height_Right_Eye__c
                lensConfiguratorObject.fittingHeightLeftEye =
                    lensConfiguratorInformation.B2B_Fitting_height_Left_Eye__c != null &&
                    lensConfiguratorInformation.B2B_Fitting_height_Left_Eye__c != undefined &&
                    lensConfiguratorInformation.B2B_Fitting_height_Left_Eye__c != ''
                        ? lensConfiguratorInformation.B2B_Fitting_height_Left_Eye__c.toString()
                        : null; // B2B_Fitting_height_Left_Eye__c
                lensConfiguratorObject.pantascopicTilt =
                    lensConfiguratorInformation.B2B_Pantoscopic_tilt__c != null &&
                    lensConfiguratorInformation.B2B_Pantoscopic_tilt__c != undefined &&
                    lensConfiguratorInformation.B2B_Pantoscopic_tilt__c != ''
                        ? lensConfiguratorInformation.B2B_Pantoscopic_tilt__c.toString()
                        : null; //B2B_Pantoscopic_tilt__c
                lensConfiguratorObject.bvdWorn =
                    lensConfiguratorInformation.B2B_BVD_worn__c != null &&
                    lensConfiguratorInformation.B2B_BVD_worn__c != undefined &&
                    lensConfiguratorInformation.B2B_BVD_worn__c != ''
                        ? lensConfiguratorInformation.B2B_BVD_worn__c.toString()
                        : null; //B2B_BVD_worn__c
                lensConfiguratorObject.bvdReffracted =
                    lensConfiguratorInformation.B2B_BVD_refracted__c != null &&
                    lensConfiguratorInformation.B2B_BVD_refracted__c != undefined &&
                    lensConfiguratorInformation.B2B_BVD_refracted__c != ''
                        ? lensConfiguratorInformation.B2B_BVD_refracted__c.toString()
                        : null; //B2B_BVD_refracted__c
                lensConfiguratorObject.radioValue =
                    lensConfiguratorInformation.B2B_Measurement_System__c != null &&
                    lensConfiguratorInformation.B2B_Measurement_System__c != undefined &&
                    lensConfiguratorInformation.B2B_Measurement_System__c != ''
                        ? lensConfiguratorInformation.B2B_Measurement_System__c.toString()
                        : null; //B2B_Measurement_System__c

                lensConfiguratorObject.thicknessMatchingCalculatorLeftValue =
                    lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Left__c != null &&
                    lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Left__c != undefined &&
                    lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Left__c != ''
                        ? lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Left__c.toString()
                        : null; //B2B_Thickness_Matching_Calculator_Left__c

                lensConfiguratorObject.thicknessMatchingCalculatorRightValue =
                    lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Right__c != null &&
                    lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Right__c.toString()
                        : null; //B2B_Thickness_Matching_Calculator_Right__c

                lensConfiguratorObject.weightOfLeftLens =
                    lensConfiguratorInformation.B2B_Weight_Left_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Weight_Left_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Weight_Left_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Weight_Left_Lens__c.toString()
                        : null; //B2B_Weight_Left_Lens__c

                lensConfiguratorObject.weightOfLeftLensAdjusted =
                    lensConfiguratorInformation.B2B_Weight_Left_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Weight_Left_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Weight_Left_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Weight_Left_Lens_Adjusted__c.toString()
                        : null; //B2B_Weight_Left_Lens_Adjusted__c

                lensConfiguratorObject.weightOfRightLens =
                    lensConfiguratorInformation.B2B_Weight_Right__c != null &&
                    lensConfiguratorInformation.B2B_Weight_Right__c != undefined &&
                    lensConfiguratorInformation.B2B_Weight_Right__c != ''
                        ? lensConfiguratorInformation.B2B_Weight_Right__c.toString()
                        : null; //B2B_Weight_Right__c

                lensConfiguratorObject.weightOfRightLensAdjusted =
                    lensConfiguratorInformation.B2B_Weight_Right_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Weight_Right_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Weight_Right_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Weight_Right_Lens_Adjusted__c.toString()
                        : null; //B2B_Weight_Right_Lens_Adjusted__c

                lensConfiguratorObject.axisMinimumOfLeftLens =
                    lensConfiguratorInformation.B2B_Axis_Min_Left_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Min_Left_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Min_Left_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Min_Left_Lens__c.toString()
                        : null; //B2B_Axis_Min_Left_Lens__c

                lensConfiguratorObject.axisMinimumOfOfLeftLensAdjusted =
                    lensConfiguratorInformation.B2B_Axis_Min_Left_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Min_Left_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Min_Left_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Min_Left_Lens_Adjusted__c.toString()
                        : null; //B2B_Axis_Min_Left_Lens_Adjusted__c

                lensConfiguratorObject.axisMinimumOfRightLens =
                    lensConfiguratorInformation.B2B_Axis_Min_Right_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Min_Right_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Min_Right_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Min_Right_Lens__c.toString()
                        : null; //B2B_Axis_Min_Right_Lens__c

                lensConfiguratorObject.axisMinimumOfRightLensAdjusted =
                    lensConfiguratorInformation.B2B_Axis_Minimum_Right_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Minimum_Right_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Minimum_Right_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Minimum_Right_Lens_Adjusted__c.toString()
                        : null; //B2B_Axis_Minimum_Right_Lens_Adjusted__c

                lensConfiguratorObject.axisMaximumOfLeftLens =
                    lensConfiguratorInformation.B2B_Axis_Max_Left_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Max_Left_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Max_Left_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Max_Left_Lens__c.toString()
                        : null; //B2B_Axis_Max_Left_Lens__c

                lensConfiguratorObject.axisMaximumOfOfLeftLensAdjusted =
                    lensConfiguratorInformation.B2B_Axis_Max_Left_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Max_Left_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Max_Left_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Max_Left_Lens_Adjusted__c.toString()
                        : null; //B2B_Axis_Max_Left_Lens_Adjusted__c

                lensConfiguratorObject.axisMaximumOfRightLens =
                    lensConfiguratorInformation.B2B_Axis_Max_Right_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Max_Right_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Max_Right_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Max_Right_Lens__c.toString()
                        : null; //B2B_Axis_Max_Right_Lens__c

                lensConfiguratorObject.axisMaximumOfRightLensAdjusted =
                    lensConfiguratorInformation.B2B_Axis_Max_Right_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Axis_Max_Right_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Axis_Max_Right_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Axis_Max_Right_Lens_Adjusted__c.toString()
                        : null; //B2B_Axis_Max_Right_Lens_Adjusted__c

                lensConfiguratorObject.centerThicknessOfLeftLens =
                    lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens__c.toString()
                        : null; //B2B_Center_Thickness_Left_Lens__c

                lensConfiguratorObject.centerThicknessOfOfLeftLensAdjusted =
                    lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens_Adjusted__c.toString()
                        : null; //B2B_Center_Thickness_Left_Lens_Adjusted__c

                lensConfiguratorObject.centerThicknessOfRightLens =
                    lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens__c.toString()
                        : null; //B2B_Center_Thickness_Right_Lens__c

                lensConfiguratorObject.centerThicknessOfRightLensAdjusted =
                    lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens_Adjusted__c.toString()
                        : null; //B2B_Center_Thickness_Right_Lens_Adjusted__c

                lensConfiguratorObject.borderMaximumThicknessOfLeftLens =
                    lensConfiguratorInformation.B2B_Max_Border_Thickess_Left_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickess_Left_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickess_Left_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Max_Border_Thickess_Left_Lens__c.toString()
                        : null; //B2B_Max_Border_Thickess_Left_Lens__c

                lensConfiguratorObject.borderMaximumThicknessOfLeftLensAdjusted =
                    lensConfiguratorInformation.B2B_Max_Border_Thickness_Left_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickness_Left_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickness_Left_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Max_Border_Thickness_Left_Adjusted__c.toString()
                        : null; //B2B_Max_Border_Thickness_Left_Adjusted__c

                lensConfiguratorObject.borderMaximumThicknessOfRightLens =
                    lensConfiguratorInformation.B2B_Max_Border_Thickess_Right_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickess_Right_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickess_Right_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Max_Border_Thickess_Right_Lens__c.toString()
                        : null; //B2B_Max_Border_Thickess_Right_Lens__c

                lensConfiguratorObject.borderMaximumThicknessOfRightLensAdjusted =
                    lensConfiguratorInformation.B2B_Max_Border_Thickness_Right_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickness_Right_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Max_Border_Thickness_Right_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Max_Border_Thickness_Right_Adjusted__c.toString()
                        : null; //B2B_Max_Border_Thickness_Right_Adjusted__c

                lensConfiguratorObject.borderMinimumThicknessOfLeftLens =
                    lensConfiguratorInformation.B2B_Min_thickness_border_Left_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Left_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Left_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Min_thickness_border_Left_Lens__c.toString()
                        : null; //B2B_Min_thickness_border_Left_Lens__c

                lensConfiguratorObject.borderMinimumThicknessOfOfLeftLensAdjusted =
                    lensConfiguratorInformation.B2B_Min_thickness_border_Lens_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Lens_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Lens_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Min_thickness_border_Lens_Adjusted__c.toString()
                        : null; //B2B_Min_thickness_border_Lens_Adjusted__c

                lensConfiguratorObject.borderMinimumThicknessOfRightLens =
                    lensConfiguratorInformation.B2B_Min_thickness_border_Right_Lens__c != null &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Right_Lens__c != undefined &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Right_Lens__c != ''
                        ? lensConfiguratorInformation.B2B_Min_thickness_border_Right_Lens__c.toString()
                        : null; //B2B_Min_thickness_border_Right_Lens__c

                lensConfiguratorObject.borderMinimumThicknessOfRightLensAdjusted =
                    lensConfiguratorInformation.B2B_Min_thickness_border_Right_Adjusted__c != null &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Right_Adjusted__c != undefined &&
                    lensConfiguratorInformation.B2B_Min_thickness_border_Right_Adjusted__c != ''
                        ? lensConfiguratorInformation.B2B_Min_thickness_border_Right_Adjusted__c.toString()
                        : null; //B2B_Min_thickness_border_Right_Adjusted__c

                lensConfiguratorObject.isLensCalculated = true;

                lensConfiguratorObject.leftImageSRC =
                    lensConfiguratorInformation.B2B_Left_Lens_Image_SRC__c != null &&
                    lensConfiguratorInformation.B2B_Left_Lens_Image_SRC__c != undefined &&
                    lensConfiguratorInformation.B2B_Left_Lens_Image_SRC__c != ''
                        ? lensConfiguratorInformation.B2B_Left_Lens_Image_SRC__c
                        : null; //B2B_Left_Lens_Image_SRC__c

                lensConfiguratorObject.rightImageSRC =
                    lensConfiguratorInformation.B2B_Right_Lens_Image_SRC__c != null &&
                    lensConfiguratorInformation.B2B_Right_Lens_Image_SRC__c != undefined &&
                    lensConfiguratorInformation.B2B_Right_Lens_Image_SRC__c != ''
                        ? lensConfiguratorInformation.B2B_Right_Lens_Image_SRC__c
                        : null; //B2B_Right_Lens_Image_SRC__c

                this._lensConfigurationCollection = lensConfiguratorObject;

                if (
                    (this._lensConfigurationCollection.weightOfRightLens != null && this._lensConfigurationCollection.weightOfRightLens != undefined) ||
                    (this._lensConfigurationCollection.weightOfLeftLens != null && this._lensConfigurationCollection.weightOfLeftLens != undefined)
                ) {
                    this._showCalculateLensComponent = true;
                }
                this._initialLoadComplete = true;
                //BS-1244 End
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                this._isLoading = false;
            });
    }

    /**
     * this method will fetch prescription screen range from a product record
     * depending upon the lens sku
     * BS-1151
     */
    getPrescriptionFieldsData() {
        getPrescriptionValues({ lensProductSKU: this.lensProductSKU })
            .then((result) => {
                //BS-1708
                if (result) {
                    if (
                        this._lensConfigurationCollection &&
                        this._lensConfigurationCollection.withEvilEyeEdge &&
                        this._lensConfigurationCollection.withEvilEyeEdge == true
                    ) {
                        result.forEach((item) => {
                            item.B2B_Sphere_Min__c =
                                item.B2B_WithEE_Sphere_Min__c != undefined && item.B2B_WithEE_Sphere_Min__c != null ? item.B2B_WithEE_Sphere_Min__c : 0;
                            item.B2B_Sphere_Max__c =
                                item.B2B_WithEE_Sphere_Max__c != undefined && item.B2B_WithEE_Sphere_Max__c != null ? item.B2B_WithEE_Sphere_Max__c : 0;
                            item.B2B_Sphere_Min_Allowed__c =
                                item.B2B_WithEE_Sphere_Min__c != undefined && item.B2B_WithEE_Sphere_Min__c != null ? item.B2B_WithEE_Sphere_Min__c : 0;
                            item.B2B_Sphere_Max_Allowed__c =
                                item.B2B_WithEE_Sphere_Max__c != undefined && item.B2B_WithEE_Sphere_Max__c != null ? item.B2B_WithEE_Sphere_Max__c : 0;
                        });
                    }
                    this._prescriptionFieldsData = result;
                } else {
                    this._isLoading = false;
                }
                //BS-1708
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                this._isLoading = false;
            });
    }

    /**
     * this method will product data to be shown on the frame information
     * screen including the image url depending on the frame sku
     * BS-1151
     */
    getFrameInformationValues(selectedFrameSKU) {
        getFrameProductValues({ selectedFrameSKU: selectedFrameSKU })
            .then((result) => {
                this._frameInformationData = result;
                if (this._frameInformationData != null) {
                    getFrameImage({ selectedFrameSKU: selectedFrameSKU })
                        .then((image) => {
                            if (image != undefined && image != null && image[0]) {
                                this._frameInformationImage = image[0].B2B_Picture_Link__c;
                            }
                        })
                        .catch((execptionInstance) => {
                            console.error(execptionInstance);
                            this._isLoading = false;
                        });
                    this.getLensSelectionValues(this._result[0].B2B_Selected_Lens_SKU__c, this._result[0].B2B_Lens_Index__c);
                    this.getPrescriptionFieldsData();
                } else {
                    this._isLoading = false;
                }
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                this._isLoading = false;
            });
    }

    /**
     * this method will product data to be shown on the Lens Selection Screen
     * BS-1151
     */
    getLensSelectionValues(selectedLensSKU, lensIndex) {
        getLensSelectionValues({
            selectedLensSKU: selectedLensSKU,
            lensIndex: lensIndex
        })
            .then((result) => {
                this._lensSelectionData = result;
                this.createCollectionToShowData();
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                this._isLoading = false;
            });
    }

    /**
     * this method will fill the data into the collection
     * which will handle the iteration in the html
     * BS-1151
     */
    createCollectionToShowData() {
        this._allStepsDataCollection = [];
        for (let step = 1; step <= this._allSteps.length; step++) {
            let currentStepObj = {};
            currentStepObj.parentStyling = 'slds-grid slds-wrap ';
            currentStepObj.header = this._allSteps[step - 1];
            currentStepObj.inputStyling = 'custom-border-none';
            currentStepObj.isFrameInformationStep = false;
            currentStepObj.isShapeSelectionScreen = false;
            currentStepObj.isVsLensSelectionScreen = false;

            if (step == 1) {
                currentStepObj.inputStyling = 'custom slds-p-top_small';
                currentStepObj.currentStepAllFields = [];
                currentStepObj.currentStepAllFields.push(
                    {
                        isInputField: true,
                        applicableStyling: 'slds-medium-size_3-of-12 slds-large-size_6-of-12',
                        label: this.labels.customerNameLabel,
                        value: this._result[0].B2B_Customer_Name__c ? this._result[0].B2B_Customer_Name__c : ''
                    },
                    {
                        isInputField: true,
                        label: this.labels.clerkLabel,
                        applicableStyling: 'slds-medium-size_3-of-12 slds-large-size_6-of-12',
                        value: this._result[0].B2B_Clerk__c ? this._result[0].B2B_Clerk__c : ''
                    }
                );
            } else if (step == 2) {
                currentStepObj.currentStepAllFields = [];
                currentStepObj.currentStepAllFields.push(
                    {
                        isInputField: true,
                        label: this.labels.orderTypeLabel,
                        applicableStyling: 'slds-medium-size_3-of-12 slds-large-size_3-of-12  ',
                        value: this._result[0].B2B_Order_Type__c ? this._result[0].B2B_Order_Type__c : ''
                    },
                    {
                        isInputField: this._currentBrand == VISION_SENSATION ? true : false,
                        label: this.labels.frameTypeLabel,
                        applicableStyling: 'slds-medium-size_3-of-12 slds-large-size_3-of-12  ',
                        value: this._result[0].B2B_Frame_Type__c ? this._result[0].B2B_Frame_Type__c : ''
                    }
                );
            } else if (step == 3) {
                currentStepObj.currentStepAllFields = [];
                currentStepObj.isFrameInformationStep = true;
                currentStepObj.parentStyling = '';
                let colorNumberValue =
                    this._frameInformationData[0] && this._frameInformationData[0].StockKeepingUnit
                        ? this._frameInformationData[0].StockKeepingUnit.substring(7, 11)
                        : '';
                currentStepObj.currentStepAllFields.push(
                    {
                        isInputField: true,
                        label: this.labels.conceptCollectionLabel,
                        applicableStyling: 'frame-details-container',
                        value:
                            this._frameInformationData[0] && this._frameInformationData[0].Name && this._frameInformationData[0].B2B_Model__c
                                ? this._frameInformationData[0].Name + ' ' + this._frameInformationData[0].B2B_Model__c
                                : '' //BS-1701
                    },
                    {
                        isInputField: true,
                        label: this.labels.colorLabel,
                        applicableStyling: 'frame-details-container',
                        value: this._frameInformationData[0].B2B_Frame_Color_Description__c
                            ? colorNumberValue + ' ' + this._frameInformationData[0].B2B_Frame_Color_Description__c
                            : ''
                    },
                    /** START OF BS-1142 - Remove len size and replace with product size*/
                    {
                        isInputField: this._currentBrand == RX_GLAZING ? true : false,
                        label: this.labels.sizeLabel,
                        applicableStyling: 'frame-details-container',
                        value: this._frameInformationData[0].B2B_EE_Size__c ? this._frameInformationData[0].B2B_EE_Size__c : ''
                    },
                    /** END OF BS-1142 */
                    //BS-1311 start
                    {
                        isInputField:
                            this._result[0].B2B_Bridge__c != undefined &&
                            this._result[0].B2B_Bridge__c != null &&
                            this._result[0].B2B_Temple__c != undefined &&
                            this._result[0].B2B_Temple__c != null
                                ? true
                                : false,
                        label: this._currentBrand == RX_GLAZING ? this.labels.productSize : this.labels.bridgeTempleLabel,
                        applicableStyling: 'frame-details-container',
                        value: this._result[0].B2B_Bridge__c + '/' + this._result[0].B2B_Temple__c
                    } //BS-1311 end
                );
            } else if (step == 4) {
                currentStepObj.currentStepAllFields = [];
                if (this._currentBrand == VISION_SENSATION) {
                    this._initialLoadComplete = false;
                    currentStepObj.isShapeSelectionScreen = true;
                    getShapeSelectionScreenData({ recordId: this._lensConfiguratorId })
                        .then(async (result) => {
                            let parsedData = {};
                            let originalParsedData = {};
                            if (result != undefined && result != null) {
                                if (result.omaSuccessResponseWrapper) {
                                    originalParsedData.allowedScaling = result.omaSuccessResponseWrapper.originalAllowedScaling
                                        ? JSON.parse(result.omaSuccessResponseWrapper.originalAllowedScaling)
                                        : result.omaSuccessResponseWrapper.allowedScaling
                                        ? JSON.parse(result.omaSuccessResponseWrapper.allowedScaling)
                                        : null;
                                    originalParsedData.coordinates = result.omaSuccessResponseWrapper.originalCoordinates
                                        ? JSON.parse(result.omaSuccessResponseWrapper.originalCoordinates)
                                        : result.omaSuccessResponseWrapper.coordinates
                                        ? JSON.parse(result.omaSuccessResponseWrapper.coordinates)
                                        : null;
                                    originalParsedData.drills =
                                        result.lensConfiguratorObj && result.lensConfiguratorObj.B2B_Original_Drills__c
                                            ? JSON.parse(result.lensConfiguratorObj.B2B_Original_Drills__c.replace(/ends/g, 'end'))
                                            : result.lensConfiguratorObj && result.lensConfiguratorObj.B2B_Drills__c
                                            ? JSON.parse(result.lensConfiguratorObj.B2B_Drills__c.replace(/ends/g, 'end'))
                                            : null;
                                    originalParsedData.hasDrills = result.omaSuccessResponseWrapper.originalHasDrills
                                        ? result.omaSuccessResponseWrapper.originalHasDrills
                                        : result.omaSuccessResponseWrapper.hasDrills
                                        ? result.omaSuccessResponseWrapper.hasDrills
                                        : false;
                                    originalParsedData.height = result.omaSuccessResponseWrapper.originalHeight
                                        ? JSON.parse(result.omaSuccessResponseWrapper.originalHeight)
                                        : result.omaSuccessResponseWrapper.height
                                        ? JSON.parse(result.omaSuccessResponseWrapper.height)
                                        : null;
                                    originalParsedData.oma = result.omaSuccessResponseWrapper.originalOma
                                        ? result.omaSuccessResponseWrapper.originalOma
                                        : result.omaSuccessResponseWrapper.oma
                                        ? result.omaSuccessResponseWrapper.oma
                                        : null;
                                    originalParsedData.width = result.omaSuccessResponseWrapper.originalWidth
                                        ? JSON.parse(result.omaSuccessResponseWrapper.originalWidth)
                                        : result.omaSuccessResponseWrapper.width
                                        ? JSON.parse(result.omaSuccessResponseWrapper.width)
                                        : null;
                                    this._readOnlyOriginalParsedData = { data: originalParsedData };

                                    parsedData.allowedScaling = result.omaSuccessResponseWrapper.allowedScaling
                                        ? JSON.parse(result.omaSuccessResponseWrapper.allowedScaling)
                                        : null;
                                    parsedData.coordinates = result.omaSuccessResponseWrapper.coordinates
                                        ? JSON.parse(result.omaSuccessResponseWrapper.coordinates)
                                        : null;
                                    parsedData.drills =
                                        result.lensConfiguratorObj && result.lensConfiguratorObj.B2B_Drills__c
                                            ? JSON.parse(result.lensConfiguratorObj.B2B_Drills__c.replace(/ends/g, 'end'))
                                            : null;
                                    parsedData.hasDrills = result.omaSuccessResponseWrapper.hasDrills ? result.omaSuccessResponseWrapper.hasDrills : false;
                                    parsedData.height = result.omaSuccessResponseWrapper.height ? JSON.parse(result.omaSuccessResponseWrapper.height) : null;
                                    parsedData.oma = result.omaSuccessResponseWrapper.oma ? result.omaSuccessResponseWrapper.oma : null;
                                    parsedData.width = result.omaSuccessResponseWrapper.width ? JSON.parse(result.omaSuccessResponseWrapper.width) : null;
                                    this._readOnlyParsedData = { data: parsedData };
                                }
                                let lensConfiguratorObj = result.lensConfiguratorObj;
                                let lensShapeRecordId;
                                if (lensConfiguratorObj !== undefined && lensConfiguratorObj !== null) {
                                    this._isOrderTypeLensOnly = lensConfiguratorObj.B2B_Order_Type__c == LENS_ONLY ? true : false;
                                    lensShapeRecordId = lensConfiguratorObj.B2B_Selected_Lens_Shape__c ? lensConfiguratorObj.B2B_Selected_Lens_Shape__c : '';
                                }
                                this._shapeSelectionCollection = {};
                                this._shapeSelectionCollection.lensShape =
                                    lensConfiguratorObj.B2B_Lens_Shape__c !== undefined && lensConfiguratorObj.B2B_Lens_Shape__c !== null
                                        ? lensConfiguratorObj.B2B_Lens_Shape__c
                                        : null;
                                this._shapeSelectionCollection.lensSize =
                                    lensConfiguratorObj.B2B_Lens_Size__c !== undefined && lensConfiguratorObj.B2B_Lens_Size__c !== null
                                        ? lensConfiguratorObj.B2B_Lens_Size__c + ''
                                        : null;
                                this._shapeSelectionCollection.showAllShapes =
                                    lensConfiguratorObj.B2B_Show_All_Shapes__c !== undefined && lensConfiguratorObj.B2B_Show_All_Shapes__c !== null
                                        ? lensConfiguratorObj.B2B_Show_All_Shapes__c
                                        : false;
                                this._shapeSelectionCollection.a = lensConfiguratorObj.B2B_a__c ? lensConfiguratorObj.B2B_a__c : 0;
                                this._shapeSelectionCollection.b1 = lensConfiguratorObj.B2B_b1__c ? lensConfiguratorObj.B2B_b1__c : 0;
                                this._shapeSelectionCollection.b = lensConfiguratorObj.B2B_b__c ? lensConfiguratorObj.B2B_b__c : 0;
                                this._shapeSelectionCollection.b2 = lensConfiguratorObj.B2B_b2__c ? lensConfiguratorObj.B2B_b2__c : 0;
                                this._shapeSelectionCollection.sf = lensConfiguratorObj.B2B_SF__c ? lensConfiguratorObj.B2B_SF__c : 0;
                                this._shapeSelectionCollection.blp = lensConfiguratorObj.B2B_blp__c ? lensConfiguratorObj.B2B_blp__c : 0;
                                this._shapeSelectionCollection.height = lensConfiguratorObj.B2B_OMA_Height__c
                                    ? this.trimUptoTwoDecimalPlaces(lensConfiguratorObj.B2B_OMA_Height__c)
                                    : '';
                                this._shapeSelectionCollection.width = lensConfiguratorObj.B2B_Width__c
                                    ? this.trimUptoTwoDecimalPlaces(lensConfiguratorObj.B2B_Width__c)
                                    : '';
                                await getLensShapeDataByShapeName({
                                    shapeName: this._shapeSelectionCollection.lensShape,
                                    size: this._shapeSelectionCollection.lensSize,
                                    recordId: lensShapeRecordId
                                })
                                    .then((data) => {
                                        if (data !== undefined && data !== null) {
                                            let lensShapeObject = data[0];
                                            if (
                                                (lensShapeObject.B2B_Default_Features__c &&
                                                    lensShapeObject.B2B_Default_Features__c.includes(WITH_ACCENT_RING_VALUE) == true) ||
                                                (lensShapeObject.B2B_Available_features__c &&
                                                    lensShapeObject.B2B_Available_features__c.includes(WITH_ACCENT_RING_VALUE) == true)
                                            ) {
                                                this._shapeSelectionCollection.showWithAccentRing = true;
                                                this._shapeSelectionCollection.withAccentRingValue = lensConfiguratorObj.B2B_Accent_Ring__c
                                                    ? lensConfiguratorObj.B2B_Accent_Ring__c
                                                    : false;
                                                this._shapeSelectionCollection.showAccentRingColor = true;
                                                let colorHexCode =
                                                    lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r &&
                                                    lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c
                                                        ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c
                                                        : '#3f242900;';
                                                let frameColorDescription =
                                                    lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r &&
                                                    lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c
                                                        ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c
                                                        : '';
                                                let colorNumber =
                                                    lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r &&
                                                    lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Color_Number__c
                                                        ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Color_Number__c
                                                        : '';
                                                let selectedColorProperties = {};
                                                selectedColorProperties.label = colorNumber + ' ' + frameColorDescription;
                                                selectedColorProperties.styling = STYLING_BACKGROUND_COLOR + colorHexCode;
                                                this._selectedAccentRingColor = selectedColorProperties;
                                                this._shapeSelectionCollection.accentRingColorStyling = this._selectedAccentRingColor.styling;
                                                this._shapeSelectionCollection.accentRingColorLabel = this._selectedAccentRingColor.label;
                                                this._shapeSelectionCollection.accentRingImage = lensConfiguratorObj.B2B_Selected_Accent_Ring_Image__c
                                                    ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Image__c
                                                    : null;
                                                this._shapeSelectionCollection.showAccentRingImage =
                                                    this._shapeSelectionCollection.accentRingImage !== undefined &&
                                                    this._shapeSelectionCollection.accentRingImage !== null
                                                        ? true
                                                        : false;
                                                this._shapeSelectionCollection.removeGrooveValue =
                                                    lensConfiguratorObj.B2B_Remove_Groove__c !== undefined && lensConfiguratorObj.B2B_Remove_Groove__c !== null
                                                        ? lensConfiguratorObj.B2B_Remove_Groove__c
                                                        : false;
                                            }
                                            if (
                                                (lensShapeObject.B2B_Default_Features__c &&
                                                    lensShapeObject.B2B_Default_Features__c.includes(WITH_COLORED_GROOVE) == true) ||
                                                (lensShapeObject.B2B_Available_features__c &&
                                                    lensShapeObject.B2B_Available_features__c.includes(WITH_COLORED_GROOVE) == true) ||
                                                (lensShapeObject.B2B_Default_Features__c &&
                                                    lensShapeObject.B2B_Default_Features__c.includes(PARTIAL_GROOVE_VALUE) == true) ||
                                                (lensShapeObject.B2B_Available_features__c &&
                                                    lensShapeObject.B2B_Available_features__c.includes(PARTIAL_GROOVE_VALUE) == true)
                                            ) {
                                                this._shapeSelectionCollection.showWithColorGroove = true;

                                                this._shapeSelectionCollection.withColorGrooveValue =
                                                    lensConfiguratorObj.B2B_With_Color_Groove__c !== undefined
                                                        ? lensConfiguratorObj.B2B_With_Color_Groove__c == true
                                                            ? true
                                                            : false
                                                        : false;
                                                if (
                                                    lensConfiguratorObj.B2B_With_Partial_Color_Groove__c !== undefined &&
                                                    lensConfiguratorObj.B2B_With_Partial_Color_Groove__c !== null &&
                                                    lensConfiguratorObj.B2B_With_Partial_Color_Groove__c == true
                                                ) {
                                                    this._withColorGrooveLabel = WITH_PARTIAL_COLOR_GROOVE_LABEL.split(',')[0];
                                                }
                                                this._shapeSelectionCollection.withPartialColorGroove =
                                                    lensConfiguratorObj.B2B_With_Partial_Color_Groove__c !== undefined
                                                        ? lensConfiguratorObj.B2B_With_Partial_Color_Groove__c == true
                                                            ? true
                                                            : false
                                                        : false;
                                                if (
                                                    lensConfiguratorObj.B2B_With_Partial_Color_Groove__c !== undefined &&
                                                    lensConfiguratorObj.B2B_With_Partial_Color_Groove__c !== null &&
                                                    lensConfiguratorObj.B2B_With_Partial_Color_Groove__c == true
                                                ) {
                                                    this._withColorGrooveLabel = WITH_PARTIAL_COLOR_GROOVE_LABEL.split(',')[0];
                                                }
                                                if (this._shapeSelectionCollection.withColorGrooveValue == true) {
                                                    this._shapeSelectionCollection.showColorGrooveColor = true;
                                                } else {
                                                    this._shapeSelectionCollection.showColorGrooveColor = false;
                                                }
                                                let colorHexCode =
                                                    lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r &&
                                                    lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c
                                                        ? lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c
                                                        : '#3f242900;';
                                                const selectedColorProperties = {};
                                                selectedColorProperties.label =
                                                    lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r &&
                                                    lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.Name
                                                        ? lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.Name
                                                        : '';
                                                selectedColorProperties.styling = STYLING_BACKGROUND_COLOR + colorHexCode;
                                                this._selectedColoredGrooveColor = selectedColorProperties;
                                                this._isColoredGrooveColorSelected = true;
                                                this._shapeSelectionCollection.colorGrooveColorStyling = this._selectedColoredGrooveColor.styling;
                                                this._shapeSelectionCollection.colorGrooveColorLabel = this._selectedColoredGrooveColor.label;
                                            } else {
                                                this._showColoredGrooveSection = false;
                                            }
                                            if (
                                                this._isOrderTypeLensOnly == true &&
                                                lensShapeObject.B2B_Lens_Only_Available__c &&
                                                lensShapeObject.B2B_Lens_Only_Available__c.includes(REMOVE_DRILLS_VALUE) === true
                                            ) {
                                                this._shapeSelectionCollection.showRemoveDrill = true;
                                                this._shapeSelectionCollection.removeDrills = lensConfiguratorObj.B2B_Remove_Drills__c
                                                    ? lensConfiguratorObj.B2B_Remove_Drills__c
                                                    : false;
                                            } else {
                                                this._shapeSelectionCollection.showRemoveDrill = false;
                                                this._shapeSelectionCollection.removeDrills = false;
                                            }
                                        }
                                        this._initialLoadComplete = true;
                                    })
                                    .catch((error) => {
                                        this._initialLoadComplete = true;
                                    });
                            }
                        })
                        .then(() => {
                            const canvasElement = this.template.querySelector('[data-id="c"]');
                            if (canvasElement !== undefined && canvasElement !== null) {
                                if (
                                    this._shapeSelectionCollection.a == 0 &&
                                    this._shapeSelectionCollection.b == 0 &&
                                    this._shapeSelectionCollection.sf == 0 &&
                                    this._shapeSelectionCollection.b1 == 0 &&
                                    this._shapeSelectionCollection.b2 == 0 &&
                                    this._shapeSelectionCollection.blp == 0
                                ) {
                                    DrawGlass(this._readOnlyOriginalParsedData, canvasElement);
                                } else {
                                    DrawGlass(this._readOnlyOriginalParsedData, canvasElement);
                                    UpdateDrawGlass(this._readOnlyOriginalParsedData, this._readOnlyParsedData.data, canvasElement);
                                }
                            }
                            this._initialLoadComplete = true;
                        })
                        .catch((error) => {
                            this._initialLoadComplete = true;
                        });
                }
                if (this._currentBrand == RX_GLAZING) {
                    let rxSolutionColor = '';
                    let rxSolutionValue = this._result && this._result[0].B2B_RX_Solution__c ? this._result[0].B2B_RX_Solution__c : '';
                    //BS-1799 Removed hardcoded language checks
                    if (rxSolutionValue == DIRECT_GLAZING_ENGLISH) {
                        rxSolutionValue = B2B_RX_Solution_Type_Labels.split(',')[0];
                    }

                    if (this._result[0].B2B_RX_Solution__c == CLIP_IN || this._result[0].B2B_RX_Solution__c == this.clip_in_label) {
                        rxSolutionColor = TRANSPARENT;
                    } else {
                        rxSolutionColor =
                            this._result && this._result[0] && this._result[0].B2B_Selected_RX_Solution_Color__c
                                ? this._result[0].B2B_Selected_RX_Solution_Color__c
                                : '';
                    }
                    currentStepObj.currentStepAllFields.push(
                        {
                            isInputField: false,
                            isRadioButton: this._result[0].B2B_RX_Solution__c ? true : false,
                            label: '',
                            applicableStyling: 'slds-col slds-size_1-of-1 ',
                            value: rxSolutionValue
                        },
                        {
                            isInputField:
                                this._result[0].B2B_RX_Solution__c == DIRECT_GLAZING_ENGLISH || this._result[0].B2B_RX_Solution__c == DIRECT_GLAZING_GERMAN
                                    ? false
                                    : true,
                            label: this.labels.rxTypeLabel,
                            applicableStyling: 'slds-medium-size_3-of-12 slds-large-size_3-of-12  ',
                            value: this._result[0].B2B_RX_Type__c ? this._result[0].B2B_RX_Type__c : ''
                        },
                        {
                            isInputField:
                                this._result[0].B2B_RX_Solution__c == DIRECT_GLAZING_ENGLISH || this._result[0].B2B_RX_Solution__c == DIRECT_GLAZING_GERMAN
                                    ? false
                                    : true,
                            label: this.labels.colorLabel,
                            applicableStyling: 'slds-medium-size_3-of-12 slds-large-size_3-of-12  ',
                            value: rxSolutionColor
                        }, //BS-1311 start
                        {
                            isInputField: this._result[0].B2B_without_clipin__c == true ? true : false,
                            label: this.labels.lensOnlyForClipIn,
                            applicableStyling: 'slds-medium-size_3-of-12 slds-large-size_3-of-12  ',
                            value: this.labels.yes
                        }, //BS-1311 end
                        {
                            //BS-1340 start
                            isInputField: this._result[0].B2B_Lenses_without_Adapter__c == true ? true : false,
                            label: this.labels.lensesWithoutAdapter,
                            applicableStyling: 'slds-medium-size_3-of-12 slds-large-size_3-of-12  ',
                            value: this.labels.yes
                        } //BS-1340 ends
                    );
                }
            } else if (step == 5) {
                currentStepObj.currentStepAllFields = [];
                if (this._currentBrand == VISION_SENSATION) {
                    currentStepObj.isVsLensSelectionScreen = true;
                    getLensSelectionScreenData({ recordId: this._lensConfiguratorId })
                        .then((result) => {
                            this._lensShapeRecordId =
                                result !== undefined &&
                                result !== null &&
                                result.B2B_Selected_Lens_Shape__c !== undefined &&
                                result.B2B_Selected_Lens_Shape__c !== null
                                    ? result.B2B_Selected_Lens_Shape__c
                                    : '';
                            this.populateReadOnlyData(result);
                        })
                        .catch((error) => {
                            this._isLoading = false;
                        });
                }
                if (this._currentBrand == RX_GLAZING) {
                    currentStepObj.currentStepAllFields.push(
                        {
                            applicableStyling: 'slds-col slds-size_1-of-1',
                            isInputField: false,
                            isRadioButton: false,
                            showLinkOut: true,
                            linkoutImage: this.linkoutImg,
                            linkLabel: this.labels.lensSelectionLinkoutLabel
                        },
                        {
                            isInputField: true,
                            applicableStyling: 'slds-medium-size_3-of-12 slds-large-size_3-of-12  ',
                            label: this.labels.lensTypeLabel,
                            value: this._result[0].B2B_Lens_Type__c ? this._result[0].B2B_Lens_Type__c : ''
                        },
                        {
                            isInputField: true,
                            applicableStyling: 'slds-medium-size_3-of-12 slds-large-size_3-of-12  ',
                            label: this.labels.lensIndexLabel,
                            value: this._result[0].B2B_Lens_Index__c ? this._result[0].B2B_Lens_Index__c : ''
                        },
                        {
                            isInputField: true,
                            applicableStyling: 'slds-medium-size_2-of-12 slds-large-size_2-of-12  ',
                            label: this.labels.antiReflectionLabel,
                            value: this._result[0].B2B_Antireflection_SKU__c ? this._result[0].B2B_Antireflection_SKU__c : ''
                        },
                        {
                            isInputField: true,
                            label: this.labels.hardCoatingLabel,
                            applicableStyling: 'slds-medium-size_2-of-12 slds-large-size_2-of-12  ',
                            value: this._result[0].B2B_Hard_Coating_SKU__c ? this._result[0].B2B_Hard_Coating_SKU__c : ''
                        },
                        {
                            isInputField: this._result[0].B2B_Lens_Color__c ? true : false,
                            label: this.labels.lensColor,
                            applicableStyling: 'slds-medium-size_2-of-12 slds-large-size_2-of-12  ',
                            value: this._result[0].B2B_Lens_Color__c ? this._result[0].B2B_Lens_Color__c : ''
                        },
                        {
                            isInputField: false,
                            showLensDetail: true,
                            label: this.labels.lensDetailLabel,
                            applicableStyling: 'slds-col slds-size_1-of-1  ',
                            value: ''
                        },
                        {
                            isInputField: true,
                            label: this.labels.materialLabel,
                            applicableStyling: 'slds-medium-size_3-of-12 slds-large-size_3-of-12  ',
                            value: this._lensSelectionData && this._lensSelectionData[0].B2B_Material__c ? this._lensSelectionData[0].B2B_Material__c : ''
                        },
                        {
                            showEvilEyeEdge:
                                this._result[0].B2B_RX_Solution__c == null ||
                                this._result[0].B2B_RX_Solution__c == undefined ||
                                this._result[0].B2B_RX_Solution__c == CLIP_IN ||
                                this._result[0].B2B_RX_Solution__c == this.clip_in_label
                                    ? false
                                    : true,
                            label: this.labels.materialLabel,
                            applicableStyling: 'slds-medium-size_3-of-12 slds-large-size_3-of-12  ',
                            value: this._lensSelectionData && this._lensSelectionData[0].B2B_Material__c ? this._lensSelectionData[0].B2B_Material__c : ''
                        }
                    );
                }
            } else if (step == 6) {
                this.createPrescriptionValueCollection();
                currentStepObj.isPrescriptionValueStep = true;
            } else if (step == 7) {
                currentStepObj.isCentringDataStep = true;
                currentStepObj.showAdapterMessage = false;
                currentStepObj.showDirectGlazingMessage = false;
                if (
                    this.labels.modelsForDirectGlazing.includes(this._frameInformationData[0].B2B_Model__c) &&
                    (this._result[0].B2B_RX_Solution__c == DIRECT_GLAZING_ENGLISH || this._result[0].B2B_RX_Solution__c == DIRECT_GLAZING_GERMAN)
                ) {
                    currentStepObj.showDirectGlazingMessage = true;
                    currentStepObj.showDirectGlazingImage = true;
                }
                if (this._result[0].B2B_RX_Solution__c == ADAPTER) {
                    currentStepObj.showAdapterMessage = true;
                    currentStepObj.showAdapterImage = true;
                }
                currentStepObj.currentStepAllFields = [];
                currentStepObj.currentStepAllFields.push(
                    {
                        isCentringInputField: true,
                        label: this.labels.pantascopicTilt,
                        helpText: this.labels.defaultMeasurementDegree,
                        value: this._result[0].B2B_Pantoscopic_tilt__c ? this._result[0].B2B_Pantoscopic_tilt__c : ''
                    },
                    {
                        isCentringInputField: true,
                        label: this.labels.bvdWorn,
                        helpText: this.labels.defaultMeasurementMM,
                        value: this._result[0].B2B_BVD_worn__c ? this._result[0].B2B_BVD_worn__c : ''
                    },
                    {
                        isCentringInputField: true,
                        label: this.labels.bvdReffracted,
                        helpText: this.labels.defaultMeasurementMM,
                        value: this._result[0].B2B_BVD_refracted__c ? this._result[0].B2B_BVD_refracted__c : ''
                    },
                    {
                        isCentringInputField: this._result[0].B2B_Lens_Type__c == LENS_TYPE_PANORAMA_SINGLE_VISION ? false : true,
                        label: this.labels.workingDistanceFieldLabel,
                        helpText: this.labels.workingDistanceFieldHelpTextLabel,
                        value: this._result[0].B2B_Working_Distance__c ? this._result[0].B2B_Working_Distance__c : ''
                    }
                );
            }
            this._allStepsDataCollection.push(currentStepObj);
        }
        this._isLoading = false;
    }

    /**
     * BS-1151
     * This method will create the collection to be passed to the
     * prescription values readonly screen
     */
    createPrescriptionValueCollection() {
        if (this._result[0]) {
            if (this._result[0].B2B_Base_Values__c) {
                this._selectedBaseValue = this._result[0].B2B_Base_Values__c;
            }
            if (this._result[0].B2B_Eye_Side__c) {
                this._selectedEyeSideValue = this._result[0].B2B_Eye_Side__c;
            }
            if (this._result[0].B2B_Sphere_Right__c) {
                this._prescriptionValueCollection.rightsphere = this._result[0].B2B_Sphere_Right__c + '';
            }
            if (this._result[0].B2B_Cylinder_Right__c) {
                this._prescriptionValueCollection.rightcylinder = this._result[0].B2B_Cylinder_Right__c + '';
            }
            if (this._result[0].B2B_Axis_Right__c) {
                this._prescriptionValueCollection.rightaxis = this._result[0].B2B_Axis_Right__c + '';
            }
            if (this._result[0].B2B_Prism_1_Right__c) {
                this._prescriptionValueCollection.rightprism1 = this._result[0].B2B_Prism_1_Right__c + '';
            }
            if (this._result[0].B2B_PB1_Right__c) {
                this._prescriptionValueCollection.rightprismbase1 = this._result[0].B2B_PB1_Right__c + '';
            }
            if (this._result[0].B2B_PB1Placement_Right__c) {
                this._prescriptionValueCollection.rightprismbase1radio = this._result[0].B2B_PB1Placement_Right__c + '';
            }
            if (this._result[0].B2B_Prism2_Right__c) {
                this._prescriptionValueCollection.rightprism2 = this._result[0].B2B_Prism2_Right__c + '';
            }
            if (this._result[0].B2B_Prism_base2_Right__c) {
                this._prescriptionValueCollection.rightprismbase2 = this._result[0].B2B_Prism_base2_Right__c + '';
            }
            if (this._result[0].B2B_PB2Placement_Right__c) {
                this._prescriptionValueCollection.rightprismbase2radio = this._result[0].B2B_PB2Placement_Right__c + '';
            }
            if (this._result[0].B2B_Sphere_Left__c) {
                this._prescriptionValueCollection.leftsphere = this._result[0].B2B_Sphere_Left__c + '';
            }
            if (this._result[0].B2B_Cylinder_Left__c) {
                this._prescriptionValueCollection.leftcylinder = this._result[0].B2B_Cylinder_Left__c + '';
            }
            if (this._result[0].B2B_Axis_Left__c) {
                this._prescriptionValueCollection.leftaxis = this._result[0].B2B_Axis_Left__c + '';
            }
            if (this._result[0].B2B_Prism_1_Left__c) {
                this._prescriptionValueCollection.leftprism1 = this._result[0].B2B_Prism_1_Left__c + '';
            }
            if (this._result[0].B2B_PB1_Left__c) {
                this._prescriptionValueCollection.leftprismbase1 = this._result[0].B2B_PB1_Left__c + '';
            }
            if (this._result[0].B2B_PB1Placement_Left__c) {
                this._prescriptionValueCollection.leftprismbase1radio = this._result[0].B2B_PB1Placement_Left__c;
            }
            if (this._result[0].B2B_Prism2_Left__c) {
                this._prescriptionValueCollection.leftprism2 = this._result[0].B2B_Prism2_Left__c + '';
            }
            if (this._result[0].B2B_Prism_base2_Left__c) {
                this._prescriptionValueCollection.leftprismbase2 = this._result[0].B2B_Prism_base2_Left__c + '';
            }
            if (this._result[0].B2B_PB2Placement_Left__c) {
                this._prescriptionValueCollection.leftprismbase2radio = this._result[0].B2B_PB2Placement_Left__c + '';
            }
            if (this._result[0].B2B_Addition_Left__c) {
                this._prescriptionValueCollection.leftaddition = this._result[0].B2B_Addition_Left__c + '';
            }
            if (this._result[0].B2B_Addition_Right__c) {
                this._prescriptionValueCollection.rightaddition = this._result[0].B2B_Addition_Right__c + '';
            }
            let updatedCollection = decimalAppendedPrescriptionValues(this._prescriptionValueCollection, this.inputFieldsNameList);
            this._prescriptionValueCollection = JSON.parse(JSON.stringify(updatedCollection));
        }
    }

    trimUptoTwoDecimalPlaces(number) {
        let clonedNumber = number + '';
        if (clonedNumber.includes('.')) {
            clonedNumber = clonedNumber.split('.');
            let numberBeforeDecimal = clonedNumber[0];
            let numberAfterDecimal = clonedNumber[1];
            if (numberAfterDecimal.length >= 2) {
                numberAfterDecimal = numberAfterDecimal.slice(0, 2);
            }
            clonedNumber = numberBeforeDecimal + '.' + numberAfterDecimal;
        }
        return clonedNumber;
    }

    populateReadOnlyData(result) {
        if (result !== undefined && result !== null) {
            let lensConfigObj = result;
            this.lensSelectionReadOnlyCollection = {};
            this.lensSelectionReadOnlyCollection.glazingValue =
                lensConfigObj.B2B_Glazing_Type__c && lensConfigObj.B2B_Glazing_Type__c === OPTICAL_GLAZING
                    ? this.label.opticalGlazing
                    : lensConfigObj.B2B_Glazing_Type__c === OPTICAL_SUN_GLAZING
                    ? this.label.opticalSunGlazing
                    : false;
            if (
                this.lensSelectionReadOnlyCollection.glazingValue !== false &&
                this.lensSelectionReadOnlyCollection.glazingValue === this.label.opticalGlazing
            ) {
                this.lensSelectionReadOnlyCollection.isOpticalGlazing = true;
            } else if (this.lensSelectionReadOnlyCollection.glazingValue !== false) {
                this.lensSelectionReadOnlyCollection.isOpticalGlazing = false;
            } else {
                this.lensSelectionReadOnlyCollection.isOpticalGlazing = true;
            } //BS-2014
            this.lensSelectionReadOnlyCollection.lensType =
                lensConfigObj.B2B_Lens_Type__c && lensConfigObj.B2B_Lens_Type__c === this.label.panoramaSingleVision
                    ? this.label.panoramaSingleVision
                    : lensConfigObj.B2B_Lens_Type__c === this.label.panoramaProgressive
                    ? this.label.panoramaProgressive
                    : lensConfigObj.B2B_Lens_Type__c === this.label.panoramaProgressiveOne
                    ? this.label.panoramaProgressiveOne
                    : lensConfigObj.B2B_Lens_Type__c === this.label.panoramaProgressiveRoom
                    ? this.label.panoramaProgressiveRoom
                    : false;
            this.lensSelectionReadOnlyCollection.lensIndex =
                lensConfigObj.B2B_Lens_Index__c !== undefined && lensConfigObj.B2B_Lens_Index__c !== null ? lensConfigObj.B2B_Lens_Index__c : false;
            this.lensSelectionReadOnlyCollection.progressionLength =
                lensConfigObj.B2B_Progression_Length__c !== undefined && lensConfigObj.B2B_Progression_Length__c !== null
                    ? lensConfigObj.B2B_Progression_Length__c
                    : false;
            if (this.lensSelectionReadOnlyCollection.isOpticalGlazing == true) {
                this.lensSelectionReadOnlyCollection.lensColor =
                    lensConfigObj.B2B_Lens_Color_Id__r !== undefined &&
                    lensConfigObj.B2B_Lens_Color_Id__r !== null &&
                    lensConfigObj.B2B_Lens_Color_Id__r.Description !== undefined &&
                    lensConfigObj.B2B_Lens_Color_Id__r.Description !== null
                        ? lensConfigObj.B2B_Lens_Color_Id__r.Description
                        : false;
            } else {
                this.lensSelectionReadOnlyCollection.lensColor =
                    lensConfigObj.B2B_Lens_Color__c !== undefined && lensConfigObj.B2B_Lens_Color__c !== null ? lensConfigObj.B2B_Lens_Color__c : false;
            } //BS-2014
            this.lensSelectionReadOnlyCollection.photoSensation =
                lensConfigObj.B2B_Photo_Sensation__r !== undefined &&
                lensConfigObj.B2B_Photo_Sensation__r.Description !== null &&
                lensConfigObj.B2B_Photo_Sensation__r.Description !== undefined &&
                lensConfigObj.B2B_Photo_Sensation__r.Description !== null
                    ? lensConfigObj.B2B_Photo_Sensation__r.Description
                    : false;
            this.lensSelectionReadOnlyCollection.blueSensation =
                lensConfigObj.B2B_Blue_Sensation__r !== undefined &&
                lensConfigObj.B2B_Blue_Sensation__r !== null &&
                lensConfigObj.B2B_Blue_Sensation__r.Description !== undefined &&
                lensConfigObj.B2B_Blue_Sensation__r.Description !== null
                    ? lensConfigObj.B2B_Blue_Sensation__r.Description
                    : false;
            this.lensSelectionReadOnlyCollection.lensDistance =
                lensConfigObj.B2B_Lens_Type__c !== undefined &&
                lensConfigObj.B2B_Lens_Type__c === this.label.panoramaProgressiveRoom &&
                lensConfigObj.B2B_Lens_Distance__c !== undefined &&
                lensConfigObj.B2B_Lens_Distance__c !== null
                    ? lensConfigObj.B2B_Lens_Distance__c
                    : false;
            this.lensSelectionReadOnlyCollection.productMaterial =
                lensConfigObj.B2B_Lens_Material__c !== undefined && lensConfigObj.B2B_Lens_Material__c !== null ? lensConfigObj.B2B_Lens_Material__c : false;
            this.lensSelectionReadOnlyCollection.lensEdge =
                lensConfigObj.B2B_Lens_Edge__c !== undefined && lensConfigObj.B2B_Lens_Edge__c !== null ? lensConfigObj.B2B_Lens_Edge__c : false;
            this.lensSelectionReadOnlyCollection.visualPreferences =
                lensConfigObj.B2B_Lens_Type__c !== undefined &&
                lensConfigObj.B2B_Lens_Type__c !== null &&
                lensConfigObj.B2B_Lens_Type__c === this.label.panoramaProgressiveOne &&
                lensConfigObj.B2B_Visual_Preference__c !== undefined &&
                lensConfigObj.B2B_Visual_Preference__c !== null
                    ? lensConfigObj.B2B_Visual_Preference__c
                    : false;
            /* Start : BS-967 */
            this.lensSelectionReadOnlyCollection.visionZoneAnalysisId =
                lensConfigObj.B2B_Vision_Zone_Analysis_Code__c !== undefined && lensConfigObj.B2B_Vision_Zone_Analysis_Code__c !== null
                    ? lensConfigObj.B2B_Vision_Zone_Analysis_Code__c
                    : false;
            if (
                this.lensSelectionReadOnlyCollection.visualPreferences !== undefined &&
                this.lensSelectionReadOnlyCollection.visualPreferences !== null &&
                lensConfigObj.B2B_Vision_Zone_Analysis_Code__c !== undefined &&
                lensConfigObj.B2B_Vision_Zone_Analysis_Code__c !== null
            ) {
                this.lensSelectionReadOnlyCollection.visualPreferencesValue = lensConfigObj.B2B_Vision_Zone_Analysis_Code__c;
            } else if (
                this.lensSelectionReadOnlyCollection.visualPreferences !== undefined &&
                this.lensSelectionReadOnlyCollection.visualPreferences !== null &&
                (lensConfigObj.B2B_Vision_Zone_Analysis_Code__c === undefined || lensConfigObj.B2B_Vision_Zone_Analysis_Code__c === null)
            ) {
                this.lensSelectionReadOnlyCollection.visualPreferencesValue = this.lensSelectionReadOnlyCollection.visualPreferences;
            }
            /* End : BS-967 */
            this.lensSelectionReadOnlyCollection.antireflectionCoatingValue =
                lensConfigObj.B2B_Antireflection_Product__r !== undefined &&
                lensConfigObj.B2B_Antireflection_Product__r !== null &&
                lensConfigObj.B2B_Antireflection_Product__r.Description !== undefined &&
                lensConfigObj.B2B_Antireflection_Product__r.Description !== null
                    ? lensConfigObj.B2B_Antireflection_Product__r.Description
                    : lensConfigObj.B2B_Hard_Coating_Product__r !== undefined &&
                      lensConfigObj.B2B_Hard_Coating_Product__r !== null &&
                      lensConfigObj.B2B_Hard_Coating_Product__r.Description !== undefined &&
                      lensConfigObj.B2B_Hard_Coating_Product__r.Description !== null
                    ? lensConfigObj.B2B_Hard_Coating_Product__r.Description
                    : false;
            this.lensSelectionReadOnlyCollection.facetCutValue =
                lensConfigObj.B2B_Optimized_Facet_Cut__c !== undefined && lensConfigObj.B2B_Optimized_Facet_Cut__c !== null
                    ? lensConfigObj.B2B_Optimized_Facet_Cut__c
                    : false;

            this.lensSelectionReadOnlyCollection.sGravingValue =
                lensConfigObj.B2B_S_Graving__c !== undefined && lensConfigObj.B2B_S_Graving__c !== null ? lensConfigObj.B2B_S_Graving__c : false; //BS-1796

            this.getLensShapeData();
            this._readOnlySetupDone = true;
        }
    }

    /**
     * BS-980
     * This method controls the show , hide , enabling and disabling of the facet cut
     * image and checkbox.
     */
    getLensShapeData() {
        getLensShapeData({
            recordId: this._lensShapeRecordId
        })
            .then((result) => {
                if (result !== null && result[0] !== null) {
                    let lensShapeRecord = result[0];
                    if (
                        (lensShapeRecord.B2B_Default_Features__c && lensShapeRecord.B2B_Default_Features__c.includes(FACET_CUT_VALUE) == true) ||
                        (lensShapeRecord.B2B_Available_features__c && lensShapeRecord.B2B_Available_features__c.includes(FACET_CUT_VALUE) == true)
                    ) {
                        this._showFacetCutImage = true;
                    } else {
                        this._showFacetCutImage = false;
                    }
                    if (
                        (lensShapeRecord.B2B_Default_Features__c && lensShapeRecord.B2B_Default_Features__c.includes(S_GRAVING) == true) ||
                        (lensShapeRecord.B2B_Available_features__c && lensShapeRecord.B2B_Available_features__c.includes(S_GRAVING) == true)
                    ) {
                        this._showSgravingImage = true;
                    } else {
                        this._showSgravingImage = false;
                    } //BS-1796
                }
            })
            .catch((error) => {});
    }
}
