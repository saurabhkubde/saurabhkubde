import { LightningElement, track, api, wire } from 'lwc';

import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';
import saveCenteringData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.saveCenteringData';
import getPrescriptionValues from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getPrescriptionValues';
import getSelectedFrameModalSize from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getSelectedFrameModalSize';

import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

import LENS_CONFIGURATOR from '@salesforce/schema/B2B_Lens_Configurator__c';
import MEASUREMENT_SYSTEM from '@salesforce/schema/B2B_Lens_Configurator__c.B2B_Measurement_System__c';

//Labels
import B2B_VS_RX_CENTERING_MSG_ADAPTER from '@salesforce/label/c.B2B_VS_RX_CENTERING_DATA_MSG_ADAPTER'; //BS-1065
import B2B_VS_RX_CENTERING_MSG_DIRECT_GLAZING from '@salesforce/label/c.B2B_VS_RX_CENTERING_DATA_MSG_DIRECT_GLAZING'; //BS-1065
import B2B_VS_RX_MODAL_FOR_DIRECTGLAZING from '@salesforce/label/c.B2B_VS_RX_CHECK_MODAL_FOR_DIRECTGLAZING_ON_CENTERING_DATA'; //BS-1065
import B2B_VS_RX_EESIZE_FOR_DIRECTGLAZING from '@salesforce/label/c.B2B_VS_RX_CHECK_EESIZE_FOR_DIRECTGLAZING_ON_CENTERING_DATA'; //BS-1065
import B2B_VS_RX_CENTERING_RADIO_BUTTON from '@salesforce/label/c.B2B_VS_RX_CENTERING_RADIO_BUTTON';
import B2B_VS_RX_CENTERING_INFO_TEXT from '@salesforce/label/c.B2B_VS_RX_CENTERING_INFO_TEXT';
import B2B_VS_RX_CENTERING_INFO_TEXT_FIELD from '@salesforce/label/c.B2B_VS_RX_CENTERING_INFO_TEXT_FIELD';
import B2B_VS_RX_CENTERING_INPUT_FIELD from '@salesforce/label/c.B2B_VS_RX_CENTERING_INPUT_FIELD';
import B2B_VS_RX_CENTERING_DATA from '@salesforce/label/c.B2B_VS_RX_CENTERING_DATA';
import B2B_VS_RX_RIGHT_EYE from '@salesforce/label/c.B2B_VS_RX_RIGHT_EYE';
import B2B_VS_RX_LEFT_EYE from '@salesforce/label/c.B2B_VS_RX_LEFT_EYE';
import B2B_VS_RX_CENTERING_DATA_ERROR from '@salesforce/label/c.B2B_VS_RX_CENTERING_DATA_ERROR';
import B2B_VS_RX_PRESCRIPTION_VALUE from '@salesforce/label/c.B2B_VS_RX_PRESCRIPTION_VALUE';
import B2B_VS_RX_EYE_SIDE from '@salesforce/label/c.B2B_VS_RX_EYE_SIDE';
import B2B_VS_RX_BASE_VALUE from '@salesforce/label/c.B2B_VS_RX_BASE_VALUE';
import B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS from '@salesforce/label/c.B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS';
import B2B_VS_RX_EMPTY_INPUT_ERROR from '@salesforce/label/c.B2B_VS_RX_EMPTY_INPUT_ERROR';
import LENS_SELECTION_LABELS from '@salesforce/label/c.B2B_Lens_Selection_Labels'; //BS-1117
import LANG from '@salesforce/i18n/lang'; //BS-1055
import B2B_VS_RX_CENTERING_DATA_FIT_HEIGHT_ERROR from '@salesforce/label/c.B2B_VS_RX_CENTERING_DATA_FIT_HEIGHT_ERROR'; //BS-1249
import B2B_FITTING_HEIGHT_VALIDATION_MESSAGE from '@salesforce/label/c.B2B_FITTING_HEIGHT_VALIDATION_MESSAGE'; //BS-1425
import B2B_VS_LENS_TYPE from '@salesforce/label/c.B2B_VS_LENS_TYPE';
//BS-1548
import B2B_VS_RX_MINIMUM_APPLICABLE_FITTING_HEIGHT_GREATER_THAN_10_MM from '@salesforce/label/c.B2B_VS_RX_MINIMUM_APPLICABLE_FITTING_HEIGHT_GREATER_THAN_10_MM';
import B2B_VS_RX_MINIMUM_APPLICABLE_FITTING_HEIGHT_GREATER_THAN_18_MM from '@salesforce/label/c.B2B_VS_RX_MINIMUM_APPLICABLE_FITTING_HEIGHT_GREATER_THAN_18_MM';
//Bs-1548
const CENTERING_DATA_UPDATE = 'addceneteringdata';

const LENS_TYPE_PANORAMA_SINGLE_VISION = LENS_SELECTION_LABELS.split(',')[1]; //BS-1117
const LENS_TYPE_PANORAMA_PROGRESSIVE = LENS_SELECTION_LABELS.split(',')[2]; //BS-1425
const PANORAMA_OFFICE_ROOM_DESK = B2B_VS_LENS_TYPE.split(',')[1];
const VISION_SENSATION = 'Vision Sensation'; //BS-1117
const RX_GLAZING = 'RX Glazing'; //BS-1117
const WORKING_DISTANCE_VALUE_FOR_RX = '40'; //BS-1117
const READ_ONLY_MODE = 'read'; //BS-1055
const EDIT_MODE = 'edit'; //BS-1055
const UPDATE_PROGRESS_BAR = 'updateprogressbarcentering'; //BS-1055
const BOXING_SYSTEM = 'Boxing System'; //BS-1055
const MEASUREMENT_LINE_SYSTEM = 'Measurement Line System'; //BS-1055
const GERMAN_LANGUAGE = 'de'; //BS-1055
const ADAPTER = 'Adapter'; //BS-1065
const DIRECT_GLAZING = 'Direct Glazing'; //BS-1065
/**START OF BS-1266 */
const RIGHT_LENS = 'Right lens';
const LEFT_LENS = 'Left lens';
const LEFT_RIGHT_LENS = 'right and left lens side';
const FITTING_HEIGHT_LEFT_EYE = 'fittingHeightLeftEye';
const PUPIL_DISTANCE_LEFT_EYE = 'pupilDistanceLeftEye';
const FITTING_HEIGHT_RIGHT_EYE = 'fittingHeightRightEye';
const PUPIL_DISTANCE_RIGHT_EYE = 'pupilDistanceRightEye';
/**END OF BS-1266 */

const CENTERING_DATA_UPDATED = 'centeringUpdated'; //BS-1244
const PANORAMA_PROGRESSIVE_ONE = 'Panorama Progressiv ONE'; //BS-1443
const PAGE_SOURCE_RX = 'RX'; //BS-1548
const PAGE_SOURCE_VS = 'VS'; //BS-1548
const WORKING_DISTANCE_DEFAULT_VALUE_VS = '40'; //BS-1774
const PANORAMA_RELAX = 'Panorama Relax'; //BS-2291

export default class B2b_vsrxCenteringData extends LightningElement {
    centeringDataImage = STORE_STYLING + '/icons/centeringData1.jpg';
    centeringDataImage2 = STORE_STYLING + '/icons/centeringData2.png';
    imgForAdapter = STORE_STYLING + '/icons/ImgForAdapter.png'; //BS-1065
    imgForDirectGlazing = STORE_STYLING + '/icons/ImgForDirectGlazing.png'; //BS-1065

    infoSVG = STORE_STYLING + '/icons/INFO.svg';
    _showValidationForMeasurementSystem = false;

    @track _isAdapter = false; //BS-1065
    @track _isDirectGlazing = false; //BS-1065
    @track _isCheckBoxChecked = false; //BS-1065
    modalsForDirectGlazing = []; //BS-1065
    sizesForDirectGlazing = []; //BS-1065
    @track isCheckedAdapterAgreement = false; //BS-1065
    @track isCheckedDirectGlazingAgreement = false; //BS-1065
    @track _boxingSystem = false;
    @track _measurementLineSystem = false;
    @track _centeringData = {};
    @track _measurementFieldData;
    @track _boxingSystemLabel;
    @track _measurementLineSystemLabel;
    @track _boxingSystemValue;
    @track _measurementLineSystemValue;

    /**
     * This variable is used to indicate whether to hide left eye.
     * BS-1266
     *
     * @type {Boolean}
     */
    @track
    _hideLeftEye = false;

    /**
     * This variable is used to indicate whether to hide right eye.
     * BS-1266
     *
     * @type {Boolean}
     */
    @track
    _hideRightEye = false;

    @api
    lensConfiguratorCollection;

    @track
    lensConfiguratorId;

    @track
    lensProductSKU;

    /**
     * This variable is used to indicate whether working distance field is to be shown on UI
     * BS-1117
     *
     * @type {Boolean}
     */
    @track
    _isWorkingDistanceFieldApplicable = true;

    /**
     * This variable is used to store value entered by user for working disatnce field
     * BS-1117
     *
     * @type {String}
     */
    @track
    _workingDistanceApplicableValue;

    /**
     * This variable is used to indicate whether working distance field's appearance is enabled or disabled on UI
     * BS-1117
     *
     * @type {Boolean}
     */
    @track
    _isWorkingDistanceFieldDisabled = false;

    /**
     * Mode in which the component renders
     * BS-1055
     * @type {String}
     */
    @api
    componentRenderingMode;

    /**
     * Flag to identify the mode of rendering
     * BS-1055
     * @type {Boolean}
     */
    @track
    _isReadOnly = false;

    /**
     * Variable to store and persist the value of pantascopicTilt
     * BS-1055
     * @type {String}
     */
    _pantascopicTilt = '8';

    /**
     * Variable to store and persist the value of bvdWor
     * BS-1055
     * @type {String}
     */
    _bvdWorn = '14';

    /**
     * Variable to store and persist the value of bvdReffracted
     * BS-1055
     * @type {String}
     */
    _bvdReffracted = '14';

    /**
     * Variable to store and persist the value of pupilDistanceRightEye
     * BS-1055
     * @type {String}
     */
    _pupilDistanceRightEye;

    /**
     * Variable to store and persist the value of pupilDistanceLeftEye
     * BS-1055
     * @type {String}
     */
    _pupilDistanceLeftEye;

    /**
     * Variable to store and persist the value of fittingHeightRightEye
     * BS-1055
     * @type {String}
     */
    _fittingHeightRightEye;

    /**
     * Variable to store and persist the value of fittingHeightLeftEye
     * BS-1055
     * @type {String}
     */
    _fittingHeightLeftEye;

    /**
     * Flag to identify the mode of rendering for fitting height if
     * BS-1249
     * @type {Boolean}
     */
    @track
    _fittingHeightDifferenceError = false;

    /**
     * This variable is used to control the activation of the validation message on UI regarding fitting height
     * BS-1425
     * @type {Boolean}
     */
    _showValidationForFittingHeight = false;

    /*
     * BS-1600 : Used to identify if the grinding height in right is less that progressive length
     */
    _rightFittingHeightErrorFlag = false;

    /*
     * BS-1600 : Used to identify if the grinding height in left is less that progressive length
     */
    _leftFittingHeightErrorFlag = false;

    /*
     * BS-1548 : This variable holds the label of minimum applicable fitting height based on type of lens selected by user
     */
    _minimumApplicableFittingHeightLabel;

    /*
     * BS-1548 : This variable holds the value of minimum applicable fitting height based on type of lens selected by user
     */
    _minimumApplicableFittingHeight;

    /*
     * BS-1548 : This variable holds the value of page source
     */
    @api
    pageSource;

    //Custom labels object
    labels = {
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
        rightEye: B2B_VS_RX_RIGHT_EYE,
        leftEye: B2B_VS_RX_LEFT_EYE,
        message: B2B_VS_RX_CENTERING_DATA_ERROR,
        priscriptionValue: B2B_VS_RX_PRESCRIPTION_VALUE,
        eyeSide: B2B_VS_RX_EYE_SIDE,
        baseValue: B2B_VS_RX_BASE_VALUE,
        sphere: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[0],
        cylinder: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[1],
        axis: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[2],
        prism1: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[3],
        prismBase1: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[4],
        prism2: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[5],
        prismBase2: B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS.split(',')[6],
        errorMessage: B2B_VS_RX_EMPTY_INPUT_ERROR.split(',')[0],
        workingDistanceFieldLabel: B2B_VS_RX_CENTERING_INFO_TEXT_FIELD.split(',')[3], //BS-1117 : Label for Working Disatance field
        workingDistanceFieldHelpTextLabel: B2B_VS_RX_CENTERING_INFO_TEXT_FIELD.split(',')[4], //BS-1117 : Label for tool tip of Working Distance field
        msgForAdapter: B2B_VS_RX_CENTERING_MSG_ADAPTER, //BS-1065
        msgForDirectGlazing: B2B_VS_RX_CENTERING_MSG_DIRECT_GLAZING, //BS-1065
        msgForFittingHeightDifference: B2B_VS_RX_CENTERING_DATA_FIT_HEIGHT_ERROR, //BS-1249 : This Label is rendered on Centering Data screen in Fitting Height validation error message
        fittingHeightValidationMessageForMismatch: B2B_FITTING_HEIGHT_VALIDATION_MESSAGE //BS-1425 : This label is rendered on UI if the fitting height of Right/Left eye is less than progression length (18 mm)
    };

    /**
     * This method is used to set edit icon that is fetched from static resource 'B2B_StoreStyling'
     * BS-788
     * @return  rxIcon  :   icon for Edit
     */
    get editIcon() {
        let editIcon;
        editIcon = {
            icon: STORE_STYLING + '/icons/edit.png'
        };
        return editIcon;
    }

    /**
     * Wire call to get the details about Lens configurator object
     * BS-726
     * @type {object}
     */
    @wire(getObjectInfo, { objectApiName: LENS_CONFIGURATOR })
    lensConfiguratorInfo;

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
     * Connected callback to set the data
     * BS-726
     */
    connectedCallback() {
        /* START : Block to persist the entered values on centering data screen */

        //BS-1117 Identifying the value of applicable brand and lens type selected by user on lens seletion screen.
        if (this.lensConfiguratorCollection != null && this.lensConfiguratorCollection != undefined) {
            //BS-1548

            /*START: BS-1774 */
            if (
                this.pageSource &&
                this.pageSource == PAGE_SOURCE_VS &&
                (this.lensConfiguratorCollection.lensType == LENS_TYPE_PANORAMA_PROGRESSIVE ||
                    this.lensConfiguratorCollection.lensType == PANORAMA_PROGRESSIVE_ONE)
            ) {
                if (this.lensConfiguratorCollection.workingDistance != undefined || this.lensConfiguratorCollection.workingDistance != null) {
                    this._isWorkingDistanceFieldApplicable = true;
                    if (LANG === GERMAN_LANGUAGE) {
                        this._workingDistanceApplicableValue = this.lensConfiguratorCollection.workingDistance.replace('.', ',');
                    } else {
                        this._workingDistanceApplicableValue = this.lensConfiguratorCollection.workingDistance;
                    }
                    this._centeringData.workingDistance = this.lensConfiguratorCollection.workingDistance;
                } else {
                    this._isWorkingDistanceFieldApplicable = true;
                    this._centeringData.workingDistance = WORKING_DISTANCE_DEFAULT_VALUE_VS;
                    this._workingDistanceApplicableValue = WORKING_DISTANCE_DEFAULT_VALUE_VS;
                }
            }
            /*END: BS-1774 */

            if (
                this.lensConfiguratorCollection.lensType != undefined &&
                this.lensConfiguratorCollection.lensType != null &&
                this.lensConfiguratorCollection.lensType == LENS_TYPE_PANORAMA_SINGLE_VISION
            ) {
                this._minimumApplicableFittingHeightLabel = B2B_VS_RX_MINIMUM_APPLICABLE_FITTING_HEIGHT_GREATER_THAN_10_MM;
                this._minimumApplicableFittingHeight = 10;
            } else if (
                this.pageSource &&
                this.pageSource == PAGE_SOURCE_RX &&
                this.lensConfiguratorCollection.lensType != undefined &&
                this.lensConfiguratorCollection.lensType != null &&
                this.lensConfiguratorCollection.lensType == LENS_TYPE_PANORAMA_PROGRESSIVE
            ) {
                this._minimumApplicableFittingHeightLabel = B2B_VS_RX_MINIMUM_APPLICABLE_FITTING_HEIGHT_GREATER_THAN_10_MM;
                this._minimumApplicableFittingHeight = 10;
            } else if (
                this.pageSource &&
                this.pageSource == PAGE_SOURCE_VS &&
                this.lensConfiguratorCollection.lensType != undefined &&
                this.lensConfiguratorCollection.lensType != null &&
                this.lensConfiguratorCollection.lensType == LENS_TYPE_PANORAMA_PROGRESSIVE
            ) {
                this._minimumApplicableFittingHeightLabel = B2B_VS_RX_MINIMUM_APPLICABLE_FITTING_HEIGHT_GREATER_THAN_18_MM;
                this._minimumApplicableFittingHeight = 18;
            }
            //BS-1548

            //getting modal number and size of frame BS-1065
            if (this.lensConfiguratorCollection.selectedRXSolution == DIRECT_GLAZING) {
                for (let i = 0; i < B2B_VS_RX_MODAL_FOR_DIRECTGLAZING.split(',').length; i++) {
                    this.modalsForDirectGlazing.push(B2B_VS_RX_MODAL_FOR_DIRECTGLAZING.split(',')[i]);
                }

                for (let i = 0; i < B2B_VS_RX_EESIZE_FOR_DIRECTGLAZING.split(',').length; i++) {
                    this.sizesForDirectGlazing.push(B2B_VS_RX_EESIZE_FOR_DIRECTGLAZING.split(',')[i]);
                }

                if (
                    this.lensConfiguratorCollection.isCheckedDirectGlazingAgreement != null &&
                    this.lensConfiguratorCollection.isCheckedDirectGlazingAgreement != undefined
                ) {
                    this.isCheckedDirectGlazingAgreement = this.lensConfiguratorCollection.isCheckedDirectGlazingAgreement;
                } //end inner if

                this.getModalSizeOfSelectedFrame();
            } else if (this.lensConfiguratorCollection.selectedRXSolution == ADAPTER) {
                //BS-1065
                this._isAdapter = true;

                if (
                    this.lensConfiguratorCollection.isCheckedAdapterAgreement != undefined &&
                    this.lensConfiguratorCollection.isCheckedAdapterAgreement != null
                ) {
                    this.isCheckedAdapterAgreement = this.lensConfiguratorCollection.isCheckedAdapterAgreement;
                } //end inner if
            } else {
                this._centeringData.isCheckedDirectGlazingAgreement = false;
                this._centeringData.isCheckedAdapterAgreement = false;
            } //end else if

            // If the Brand is RX Glazing and lens type is Panorama Single Vision then hiding the Working distance input field on UI
            if (
                this.lensConfiguratorCollection.lensType == LENS_TYPE_PANORAMA_SINGLE_VISION ||
                this.lensConfiguratorCollection.lensType == PANORAMA_OFFICE_ROOM_DESK ||
                this.lensConfiguratorCollection.lensType == PANORAMA_RELAX
            ) {
                this._isWorkingDistanceFieldApplicable = false;
            } else if (
                this.lensConfiguratorCollection.lensType != LENS_TYPE_PANORAMA_SINGLE_VISION &&
                this.lensConfiguratorCollection.lensType != PANORAMA_OFFICE_ROOM_DESK
            ) {
                //If the brand is RX and lens type is other than Panorama Single Vision then setting the value to 40 and disabling it on UI
                if (this.lensConfiguratorCollection.applicableBrand == RX_GLAZING) {
                    this._isWorkingDistanceFieldApplicable = true;
                    this._workingDistanceApplicableValue = WORKING_DISTANCE_VALUE_FOR_RX;
                    this._isWorkingDistanceFieldDisabled = true;
                    this._centeringData['workingDistance'] = WORKING_DISTANCE_VALUE_FOR_RX;
                } else {
                    this._isWorkingDistanceFieldApplicable = true;
                }
            }

            if (
                this.lensConfiguratorCollection.applicableBrand != RX_GLAZING &&
                this.lensConfiguratorCollection.lensType != LENS_TYPE_PANORAMA_SINGLE_VISION &&
                this.lensConfiguratorCollection.lensType != PANORAMA_OFFICE_ROOM_DESK
            ) {
                if (this.lensConfiguratorCollection.workingDistance !== undefined && this.lensConfiguratorCollection.workingDistance !== null) {
                    if (LANG === GERMAN_LANGUAGE) {
                        this._workingDistanceApplicableValue = this.lensConfiguratorCollection.workingDistance.replace('.', ',');
                    } else {
                        this._workingDistanceApplicableValue = this.lensConfiguratorCollection.workingDistance;
                    }
                    this._centeringData['workingDistance'] = this.lensConfiguratorCollection.workingDistance;
                }
            }

            if (this.lensConfiguratorCollection.radioValue !== undefined && this.lensConfiguratorCollection.radioValue !== null) {
                if (this.lensConfiguratorCollection.radioValue === BOXING_SYSTEM) {
                    this._measurementLineSystem = false;
                    this._boxingSystem = true;
                    this._centeringData['radioValue'] = this.lensConfiguratorCollection.radioValue;
                } else if (this.lensConfiguratorCollection.radioValue === MEASUREMENT_LINE_SYSTEM) {
                    this._boxingSystem = false;
                    this._measurementLineSystem = true;
                    this._centeringData['radioValue'] = this.lensConfiguratorCollection.radioValue;
                }
            }

            if (this.lensConfiguratorCollection.pantascopicTilt !== undefined && this.lensConfiguratorCollection.pantascopicTilt !== null) {
                if (LANG === GERMAN_LANGUAGE) {
                    this._pantascopicTilt = this.lensConfiguratorCollection.pantascopicTilt.replace('.', ',');
                } else {
                    this._pantascopicTilt = this.lensConfiguratorCollection.pantascopicTilt;
                }
                this._centeringData['pantascopicTilt'] = this.lensConfiguratorCollection.pantascopicTilt;
            } else {
                this._centeringData['pantascopicTilt'] = '8';
            }

            if (this.lensConfiguratorCollection.bvdWorn !== undefined && this.lensConfiguratorCollection.bvdWorn !== null) {
                if (LANG === GERMAN_LANGUAGE) {
                    this._bvdWorn = this.lensConfiguratorCollection.bvdWorn.replace('.', ',');
                } else {
                    this._bvdWorn = this.lensConfiguratorCollection.bvdWorn;
                }
                this._centeringData['bvdWorn'] = this.lensConfiguratorCollection.bvdWorn;
            } else {
                this._centeringData['bvdWorn'] = '14';
            }

            if (this.lensConfiguratorCollection.bvdReffracted !== undefined && this.lensConfiguratorCollection.bvdReffracted !== null) {
                if (LANG === GERMAN_LANGUAGE) {
                    this._bvdReffracted = this.lensConfiguratorCollection.bvdReffracted.replace('.', ',');
                } else {
                    this._bvdReffracted = this.lensConfiguratorCollection.bvdReffracted;
                }
                this._centeringData['bvdReffracted'] = this.lensConfiguratorCollection.bvdReffracted;
            } else {
                this._centeringData['bvdReffracted'] = '14';
            }

            if (this.lensConfiguratorCollection.pupilDistanceRightEye !== undefined && this.lensConfiguratorCollection.pupilDistanceRightEye !== null) {
                if (LANG === GERMAN_LANGUAGE) {
                    this._pupilDistanceRightEye = this.lensConfiguratorCollection.pupilDistanceRightEye.replace('.', ',');
                } else {
                    this._pupilDistanceRightEye = this.lensConfiguratorCollection.pupilDistanceRightEye;
                }
                this._centeringData['pupilDistanceRightEye'] = this.lensConfiguratorCollection.pupilDistanceRightEye;
            }
            if (this.lensConfiguratorCollection.pupilDistanceLeftEye !== undefined && this.lensConfiguratorCollection.pupilDistanceLeftEye !== null) {
                if (LANG === GERMAN_LANGUAGE) {
                    this._pupilDistanceLeftEye = this.lensConfiguratorCollection.pupilDistanceLeftEye.replace('.', ',');
                } else {
                    this._pupilDistanceLeftEye = this.lensConfiguratorCollection.pupilDistanceLeftEye;
                }
                this._centeringData['pupilDistanceLeftEye'] = this.lensConfiguratorCollection.pupilDistanceLeftEye;
            }
            if (this.lensConfiguratorCollection.fittingHeightRightEye !== undefined && this.lensConfiguratorCollection.fittingHeightRightEye !== null) {
                if (LANG === GERMAN_LANGUAGE) {
                    this._fittingHeightRightEye = this.lensConfiguratorCollection.fittingHeightRightEye.replace('.', ',');
                } else {
                    this._fittingHeightRightEye = this.lensConfiguratorCollection.fittingHeightRightEye;
                }
                this._centeringData['fittingHeightRightEye'] = this.lensConfiguratorCollection.fittingHeightRightEye;
            }
            if (this.lensConfiguratorCollection.fittingHeightLeftEye !== undefined && this.lensConfiguratorCollection.fittingHeightLeftEye !== null) {
                if (LANG === GERMAN_LANGUAGE) {
                    this._fittingHeightLeftEye = this.lensConfiguratorCollection.fittingHeightLeftEye.replace('.', ',');
                } else {
                    this._fittingHeightLeftEye = this.lensConfiguratorCollection.fittingHeightLeftEye;
                }
                this._centeringData['fittingHeightLeftEye'] = this.lensConfiguratorCollection.fittingHeightLeftEye;
            }
            /* END : Block to persist the entered values on centering data screen */
            /*START OF BS-1266*/
            switch (this.lensConfiguratorCollection.eyeSide) {
                case RIGHT_LENS:
                    this._hideLeftEye = true;
                    this._fittingHeightLeftEye = null;
                    this._pupilDistanceLeftEye = null;
                    this._centeringData[FITTING_HEIGHT_LEFT_EYE] = null;
                    this._centeringData[PUPIL_DISTANCE_LEFT_EYE] = null;
                    break;
                case LEFT_LENS:
                    this._hideRightEye = true;
                    this._fittingHeightRightEye = null;
                    this._pupilDistanceRightEye = null;
                    this._centeringData[FITTING_HEIGHT_RIGHT_EYE] = null;
                    this._centeringData[PUPIL_DISTANCE_RIGHT_EYE] = null;
                    break;
            }
            /*END OF BS-1266 */
        }
        //BS-1117 - End

        // BS-2076 - Start
        if (
            this._centeringData[FITTING_HEIGHT_RIGHT_EYE] !== undefined &&
            this._centeringData[FITTING_HEIGHT_RIGHT_EYE] !== null &&
            this._centeringData[FITTING_HEIGHT_LEFT_EYE] !== undefined &&
            this._centeringData[FITTING_HEIGHT_LEFT_EYE] !== null &&
            (Number(this._centeringData[FITTING_HEIGHT_RIGHT_EYE]) - Number(this._centeringData[FITTING_HEIGHT_LEFT_EYE]) > 2 ||
                Number(this._centeringData[FITTING_HEIGHT_RIGHT_EYE]) - Number(this._centeringData[FITTING_HEIGHT_LEFT_EYE]) < -2)
        ) {
            this._fittingHeightDifferenceError = true;
        } else {
            this._fittingHeightDifferenceError = false;
        }
        //BS-2076 - End

        this.lensConfiguratorId = this.lensConfiguratorCollection.lensConfiguratorID;
        this.lensProductSKU = this.lensConfiguratorCollection.lensSKU;
        this.getPrescriptionFieldsData();
    }

    renderedCallback() {
        this.setupComponentMode(this.componentRenderingMode); //BS-1055
    }

    /**
     * To capture the entered inputs
     * BS-726
     */
    handleInputChange(event) {
        // Replacing ',' by '.' if present in the value entered by user on UI as part of BS-726
        if (event.target.value != '' && event.target.value != '') {
            this._centeringData[event.target.name] = event.target.value.replace(/,/g, '.');
        } else {
            this._centeringData[event.target.name] = null;
        }
        this._centeringData[CENTERING_DATA_UPDATED] = true; //BS-1244
    }

    /**
     * This method will work when user selects radio button.
     * BS-726
     */
    handleRadioButtonChange(event) {
        this._centeringData['radioValue'] = event.target.dataset.value;
        if (event.target.dataset.name == 'boxingSystem') {
            this._boxingSystem = true;
            this._measurementLineSystem = false;
        } else if (event.target.dataset.name == 'measurementLineSystem') {
            this._boxingSystem = false;
            this._measurementLineSystem = true;
        }
    }

    /**
     * Method to handle validations
     * BS-726
     */
    @api
    validateInput(event) {
        let isValid = true;
        /**START OF BS-1266 */
        /** BS-1443 : Removed the redundant code and referenced the methods */
        if (this._hideLeftEye === true) {
            //BS-1245 : Checking whether the value of fitting height Right eye is present and it's value should not be less than Progression length (18mm)
            isValid = this.validateFittingHeightRightProgressive(isValid);
            isValid = this.validateFittingHeightRightForSingleVision(isValid); //BS-1548
            //BS-1245 - End
            isValid = this.validatePupilDistanceRightEye(null, isValid);
            isValid = this.validateFittingHeightRightEye(null, isValid);
        } else if (this._hideRightEye == true) {
            isValid = this.validateFittingHeightLeftProgressive(isValid);
            isValid = this.validateFittingHeightLeftForSingleVision(isValid); //BS-1548
            //BS-1245
            isValid = this.validatePupilDistanceLeftEye(null, isValid);
            isValid = this.validateFittingHeightLeftEye(null, isValid);
        } else if (this._hideLeftEye !== true && this._hideRightEye !== true) {
            //BS-1245 : Checking whether the value of fitting height Right eye and Left eye is present and it's value should not be less than Progression length (18mm)
            isValid = this.validateFittingHeightRightProgressive(isValid);
            isValid = this.validateFittingHeightRightForSingleVision(isValid); //BS-1548
            isValid = this.validateFittingHeightLeftProgressive(isValid);
            isValid = this.validateFittingHeightLeftForSingleVision(isValid); //BS-1548
            //BS-1245
            isValid = this.validatePupilDistanceRightEye(null, isValid);
            isValid = this.validateFittingHeightRightEye(null, isValid);
            //BS-1249-Checks if the Fitting height difference is not more then 2mm in left and right eye
            isValid = this.validateFittingHeightDifference(isValid);
            isValid = this.validatePupilDistanceLeftEye(null, isValid);
            isValid = this.validateFittingHeightLeftEye(null, isValid);
            //BS-1249-Checks if the Fitting height difference is not more then 2mm in left and right eye
            isValid = this.validateFittingHeightDifference(isValid);
        }
        /**END OF BS-1266 */
        isValid = this.validatePantascopicTilt(null, isValid);
        isValid = this.bvdWornValidation(null, isValid);
        isValid = this.bvdReffractedValidation(null, isValid);
        //BS-1117 - Start
        // If working distance field is applicable on UI and user does not entered any input value then showing validation to user
        if (
            this._isWorkingDistanceFieldApplicable != null &&
            this._isWorkingDistanceFieldApplicable != undefined &&
            this._isWorkingDistanceFieldApplicable == true &&
            this._isWorkingDistanceFieldDisabled != null &&
            this._isWorkingDistanceFieldDisabled != undefined &&
            this._isWorkingDistanceFieldDisabled == false
        ) {
            isValid = this.validateWorkingDistance(null, isValid);
        }
        //BS-1117 - End

        if (this._centeringData['radioValue'] == undefined || this._centeringData['radioValue'] == null) {
            this._showValidationForMeasurementSystem = true;
            isValid = false;
        } else {
            this._showValidationForMeasurementSystem = false;
        }

        //BS-1065 check for agreement for adapter and direct glazing
        if (
            (this._isAdapter == true || this._isDirectGlazing == true) &&
            this.isCheckedAdapterAgreement == false &&
            this.isCheckedDirectGlazingAgreement == false
        ) {
            this._isCheckBoxChecked = true;
            isValid = false;
        } else {
            this._isCheckBoxChecked = false;
        } //end if else
        return isValid;
    }

    //Calling apex method to fetch selected frame size and modal BS-1065
    async getModalSizeOfSelectedFrame() {
        await getSelectedFrameModalSize({
            selectedFrameSku: this.lensConfiguratorCollection.selectedFrameSKU
        }).then((result) => {
            if (result != null && result != undefined) {
                //BS-1065
                if (this.modalsForDirectGlazing.includes(result[0].B2B_Model__c) && this.sizesForDirectGlazing.includes(result[0].B2B_EE_Size__c)) {
                    this._isDirectGlazing = true;
                } //end inner if
            } //end if
        });
    }

    /**
     * Method to save data into the database.
     * BS-726
     */
    @api
    async saveCenteringDataValues() {
        let isSuccess = false;
        await saveCenteringData({
            customerInputMap: this._centeringData,
            lensConfiguratorId: this.lensConfiguratorId
        }).then((result) => {
            isSuccess = true;
            this.dispatchEvent(
                new CustomEvent(CENTERING_DATA_UPDATE, {
                    detail: {
                        centeringSelectionCollection: this._centeringData
                    }
                })
            );
        });
        return isSuccess;
    }

    /**
     * Method to get the field values from product
     * BS-726
     * @type {object}
     */
    getPrescriptionFieldsData() {
        getPrescriptionValues({ lensProductSKU: this.lensProductSKU })
            .then((result) => {
                this._prescriptionFieldsData = result;
            })
            .catch((execptionInstance) => {});
    }

    /**
     * This Method is used to set the component read only or edit visibility mode
     * BS-1055
     */
    @api
    setupComponentMode(componentMode) {
        if (componentMode != null && componentMode != undefined) {
            if (componentMode == EDIT_MODE) {
                this._isReadOnly = false; //If component mode is Edit mode, setting up property: _isReadOnly to false
                /**START OF BS-1266 */
                switch (this.lensConfiguratorCollection.eyeSide) {
                    case RIGHT_LENS:
                        this._hideLeftEye = true;
                        this._hideRightEye = false;
                        break;
                    case LEFT_LENS:
                        this._hideRightEye = true;
                        this._hideLeftEye = false;
                        break;
                    case LEFT_RIGHT_LENS:
                        this._hideLeftEye = false;
                        this._hideRightEye = false;
                        break;
                }
                /**END OF BS-1266 */
            } else if (componentMode == READ_ONLY_MODE) {
                this._isReadOnly = true; //If component mode is Read only mode, setting up property: _isReadOnly to true
                this._isWorkingDistanceFieldDisabled = true;
                /**START OF BS-1266 */
                this._hideLeftEye = true;
                this._hideRightEye = true;
                /**END OF BS-1266 */
            }
        }
    }

    //BS-1055 redirect to centering page when click on edit icon
    handleFrameInformationEdit(event) {
        this.fireUpdateProgressBar(8, true, false);
    }

    //BS-1065 Handle agreement checkbox for adapter
    handleAgreementAdapterCheckbox(event) {
        this.isCheckedAdapterAgreement = event.target.checked;
        this._centeringData.isCheckedAdapterAgreement = this.isCheckedAdapterAgreement;
        this._centeringData.isCheckedDirectGlazingAgreement = this.isCheckedDirectGlazingAgreement;
    }

    //BS-1065 Handle agreement checkbox for direct glazing
    handleAgreementDirectGlazingCheckbox(event) {
        this.isCheckedDirectGlazingAgreement = event.target.checked;
        this._centeringData.isCheckedDirectGlazingAgreement = this.isCheckedDirectGlazingAgreement;
        this._centeringData.isCheckedAdapterAgreement = this.isCheckedAdapterAgreement;
    }

    /**
     * This method is use to fire event: 'updateprogressbar' that updates the progress bar step of 'c/c/b2b_progressBar_Component' according to stepNumber provided
     * BS-1055
     * @return   stepNumber     : Step Number that needs to be set as current active step (Number)
     *           activeStatus   : Step active status to determine whether above step is set to be active - (Boolean)
     *           successStatus  : Step success status to determine whether above step is set to be completed - (Boolean)
     */
    fireUpdateProgressBar(stepNumber, activeStatus, successStatus) {
        if (stepNumber != null && stepNumber != undefined) {
            this.dispatchEvent(
                new CustomEvent(UPDATE_PROGRESS_BAR, {
                    bubbles: true,
                    composed: true,
                    cancelable: false,
                    detail: {
                        stepNumberToJump: stepNumber,
                        activeStatus: activeStatus,
                        successStatus: successStatus
                    }
                })
            );
        }
    }

    /**
     * BS-1443
     * @description : Validates the data entered in pupilDistanceRightEye
     * @param {*} event : Event object
     * @param {*} isValid : Previous state of validation boolean
     * @returns Boolean validCheck : Defines if the data entered is valid
     */
    validatePupilDistanceRightEye(event, isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        if (
            this._centeringData[PUPIL_DISTANCE_RIGHT_EYE] != undefined &&
            this._centeringData[PUPIL_DISTANCE_RIGHT_EYE] != null &&
            (Number(this._centeringData[PUPIL_DISTANCE_RIGHT_EYE]) < 26 ||
                Number(this._centeringData[PUPIL_DISTANCE_RIGHT_EYE]) > 40 ||
                isNaN(this._centeringData[PUPIL_DISTANCE_RIGHT_EYE]) ||
                isNaN(parseInt(this._centeringData[PUPIL_DISTANCE_RIGHT_EYE])))
        ) {
            const pupilDistanceRightEye = this.template.querySelector('.pupilDistanceRightEye');
            pupilDistanceRightEye.setCustomValidity(this.labels.message);
            pupilDistanceRightEye.reportValidity();
            validCheck = false;
        } else {
            const pupilDistanceRightEye = this.template.querySelector('.pupilDistanceRightEye');
            pupilDistanceRightEye.setCustomValidity('');
            pupilDistanceRightEye.reportValidity();
        }
        if (this.lensConfiguratorCollection.rightsphere !== null || this.lensConfiguratorCollection.rightcylinder !== null) {
            if (this._centeringData[PUPIL_DISTANCE_RIGHT_EYE] == undefined || this._centeringData[PUPIL_DISTANCE_RIGHT_EYE] == null) {
                const pupilDistanceRightEye = this.template.querySelector('.pupilDistanceRightEye');
                pupilDistanceRightEye.setCustomValidity(this.labels.message);
                pupilDistanceRightEye.reportValidity();
                validCheck = false;
            } else if (
                this._centeringData[PUPIL_DISTANCE_RIGHT_EYE] != undefined &&
                this._centeringData[PUPIL_DISTANCE_RIGHT_EYE] != null &&
                (Number(this._centeringData[PUPIL_DISTANCE_RIGHT_EYE]) < 26 ||
                    Number(this._centeringData[PUPIL_DISTANCE_RIGHT_EYE]) > 40 ||
                    isNaN(this._centeringData[PUPIL_DISTANCE_RIGHT_EYE]) ||
                    isNaN(parseInt(this._centeringData[PUPIL_DISTANCE_RIGHT_EYE])))
            ) {
                const pupilDistanceRightEye = this.template.querySelector('.pupilDistanceRightEye');
                pupilDistanceRightEye.setCustomValidity(this.labels.message);
                pupilDistanceRightEye.reportValidity();
                validCheck = false;
            } else {
                const pupilDistanceRightEye = this.template.querySelector('.pupilDistanceRightEye');
                pupilDistanceRightEye.setCustomValidity('');
                pupilDistanceRightEye.reportValidity();
            }
        }
        return validCheck;
    }

    /**
     * BS-1443
     * @description : Validates the data entered in fittingHeightRightEye
     * @param {*} event : Event object
     * @param {*} isValid : Previous state of validation boolean
     * @returns : Boolean validCheck : Defines if the data entered is valid
     */
    validateFittingHeightRightEye(event, isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        //BS-1548
        if (
            this._centeringData[FITTING_HEIGHT_RIGHT_EYE] != undefined &&
            this._centeringData[FITTING_HEIGHT_RIGHT_EYE] != null &&
            (Number(this._centeringData[FITTING_HEIGHT_RIGHT_EYE]) < this._minimumApplicableFittingHeight ||
                isNaN(this._centeringData[FITTING_HEIGHT_RIGHT_EYE]) ||
                isNaN(parseInt(this._centeringData[FITTING_HEIGHT_RIGHT_EYE])))
        ) {
            const fittingHeightRightEye = this.template.querySelector('.fittingHeightRightEye');
            fittingHeightRightEye.setCustomValidity(this.labels.message);
            fittingHeightRightEye.reportValidity();
            validCheck = false;
        } else {
            const fittingHeightRightEye = this.template.querySelector('.fittingHeightRightEye');
            fittingHeightRightEye.setCustomValidity('');
            fittingHeightRightEye.reportValidity();
        }
        if (this.lensConfiguratorCollection.rightsphere !== null || this.lensConfiguratorCollection.rightcylinder !== null) {
            if (this._centeringData[FITTING_HEIGHT_RIGHT_EYE] == undefined || this._centeringData[FITTING_HEIGHT_RIGHT_EYE] == null) {
                const fittingHeightRightEye = this.template.querySelector('.fittingHeightRightEye');
                fittingHeightRightEye.setCustomValidity(this.labels.message);
                fittingHeightRightEye.reportValidity();
                validCheck = false;
            } else if (
                this._centeringData[FITTING_HEIGHT_RIGHT_EYE] != undefined &&
                this._centeringData[FITTING_HEIGHT_RIGHT_EYE] != null &&
                (Number(this._centeringData[FITTING_HEIGHT_RIGHT_EYE]) < this._minimumApplicableFittingHeight ||
                    isNaN(this._centeringData[FITTING_HEIGHT_RIGHT_EYE]) ||
                    isNaN(parseInt(this._centeringData[FITTING_HEIGHT_RIGHT_EYE])))
            ) {
                const fittingHeightRightEye = this.template.querySelector('.fittingHeightRightEye');
                fittingHeightRightEye.setCustomValidity(this.labels.message);
                fittingHeightRightEye.reportValidity();
                validCheck = false;
            } else {
                const fittingHeightRightEye = this.template.querySelector('.fittingHeightRightEye');
                fittingHeightRightEye.setCustomValidity('');
                fittingHeightRightEye.reportValidity();
            }
        }

        if (
            this._centeringData[FITTING_HEIGHT_RIGHT_EYE] !== undefined &&
            this._centeringData[FITTING_HEIGHT_RIGHT_EYE] !== null &&
            this._centeringData[FITTING_HEIGHT_LEFT_EYE] !== undefined &&
            this._centeringData[FITTING_HEIGHT_LEFT_EYE] !== null
        ) {
            validCheck = this.validateFittingHeightDifference(validCheck);
        }

        validCheck = this.validateFittingHeightRightProgressive(validCheck);
        validCheck = this.validateFittingHeightRightForSingleVision(validCheck); //BS-1548
        validCheck = this.checkFittingHeight(validCheck); //BS-1548

        return validCheck;
    }

    /**
     * BS-1443
     * @description : Validates the data entered in fittingHeightRightEye
     * @param {*} event : Event object
     * @param {*} isValid : Previous state of validation boolean
     * @returns : Boolean validCheck : Defines if the data entered is valid
     */
    validatePupilDistanceLeftEye(event, isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        if (
            this._centeringData[PUPIL_DISTANCE_LEFT_EYE] != undefined &&
            this._centeringData[PUPIL_DISTANCE_LEFT_EYE] != null &&
            (Number(this._centeringData[PUPIL_DISTANCE_LEFT_EYE]) < 26 ||
                Number(this._centeringData[PUPIL_DISTANCE_LEFT_EYE]) > 40 ||
                isNaN(this._centeringData[PUPIL_DISTANCE_LEFT_EYE]) ||
                isNaN(parseInt(this._centeringData[PUPIL_DISTANCE_LEFT_EYE])))
        ) {
            const pupilDistanceLeftEye = this.template.querySelector('.pupilDistanceLeftEye');
            pupilDistanceLeftEye.setCustomValidity(this.labels.message);
            pupilDistanceLeftEye.reportValidity();
            validCheck = false;
        } else {
            const pupilDistanceLeftEye = this.template.querySelector('.pupilDistanceLeftEye');
            pupilDistanceLeftEye.setCustomValidity('');
            pupilDistanceLeftEye.reportValidity();
        }

        if (this.lensConfiguratorCollection.leftsphere !== null || this.lensConfiguratorCollection.leftcylinder !== null) {
            if (this._centeringData[PUPIL_DISTANCE_LEFT_EYE] == undefined || this._centeringData[PUPIL_DISTANCE_LEFT_EYE] == null) {
                const pupilDistanceLeftEye = this.template.querySelector('.pupilDistanceLeftEye');
                pupilDistanceLeftEye.setCustomValidity(this.labels.message);
                pupilDistanceLeftEye.reportValidity();
                validCheck = false;
            } else if (
                this._centeringData[PUPIL_DISTANCE_LEFT_EYE] != undefined &&
                this._centeringData[PUPIL_DISTANCE_LEFT_EYE] != null &&
                (Number(this._centeringData[PUPIL_DISTANCE_LEFT_EYE]) < 26 ||
                    Number(this._centeringData[PUPIL_DISTANCE_LEFT_EYE]) > 40 ||
                    isNaN(this._centeringData[PUPIL_DISTANCE_LEFT_EYE]) ||
                    isNaN(parseInt(this._centeringData[PUPIL_DISTANCE_LEFT_EYE])))
            ) {
                const pupilDistanceLeftEye = this.template.querySelector('.pupilDistanceLeftEye');
                pupilDistanceLeftEye.setCustomValidity(this.labels.message);
                pupilDistanceLeftEye.reportValidity();
                validCheck = false;
            } else {
                const pupilDistanceLeftEye = this.template.querySelector('.pupilDistanceLeftEye');
                pupilDistanceLeftEye.setCustomValidity('');
                pupilDistanceLeftEye.reportValidity();
            }
        }
        return validCheck;
    }

    /**
     * BS-1443
     * @description : Validates the data entered in fittingHeightLeftEye
     * @param {*} event : Event object
     * @param {*} isValid : Previous state of validation boolean
     * @returns : Boolean validCheck : Defines if the data entered is valid
     */
    validateFittingHeightLeftEye(event, isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        //BS-1548 : Updated Validation check
        if (
            this._centeringData[FITTING_HEIGHT_LEFT_EYE] != undefined &&
            this._centeringData[FITTING_HEIGHT_LEFT_EYE] != null &&
            (Number(this._centeringData[FITTING_HEIGHT_LEFT_EYE]) < this._minimumApplicableFittingHeight ||
                isNaN(this._centeringData[FITTING_HEIGHT_LEFT_EYE]) ||
                isNaN(parseInt(this._centeringData[FITTING_HEIGHT_LEFT_EYE])))
        ) {
            const fittingHeightLeftEye = this.template.querySelector('.fittingHeightLeftEye');
            fittingHeightLeftEye.setCustomValidity(this.labels.message);
            fittingHeightLeftEye.reportValidity();
            validCheck = false;
        } else {
            const fittingHeightLeftEye = this.template.querySelector('.fittingHeightLeftEye');
            fittingHeightLeftEye.setCustomValidity('');
            fittingHeightLeftEye.reportValidity();
        }

        if (this.lensConfiguratorCollection.leftsphere !== null || this.lensConfiguratorCollection.leftcylinder !== null) {
            if (this._centeringData[FITTING_HEIGHT_LEFT_EYE] == undefined || this._centeringData[FITTING_HEIGHT_LEFT_EYE] == null) {
                const fittingHeightLeftEye = this.template.querySelector('.fittingHeightLeftEye');
                fittingHeightLeftEye.setCustomValidity(this.labels.message);
                fittingHeightLeftEye.reportValidity();
                validCheck = false;
            } else if (
                this._centeringData[FITTING_HEIGHT_LEFT_EYE] != undefined &&
                this._centeringData[FITTING_HEIGHT_LEFT_EYE] != null &&
                (Number(this._centeringData[FITTING_HEIGHT_LEFT_EYE]) < this._minimumApplicableFittingHeight ||
                    isNaN(this._centeringData[FITTING_HEIGHT_LEFT_EYE]) ||
                    isNaN(parseInt(this._centeringData[FITTING_HEIGHT_LEFT_EYE])))
            ) {
                const fittingHeightLeftEye = this.template.querySelector('.fittingHeightLeftEye');
                fittingHeightLeftEye.setCustomValidity(this.labels.message);
                fittingHeightLeftEye.reportValidity();
                validCheck = false;
            } else {
                const fittingHeightLeftEye = this.template.querySelector('.fittingHeightLeftEye');
                fittingHeightLeftEye.setCustomValidity('');
                fittingHeightLeftEye.reportValidity();
            }
        }
        if (
            this._centeringData[FITTING_HEIGHT_RIGHT_EYE] !== undefined &&
            this._centeringData[FITTING_HEIGHT_RIGHT_EYE] !== null &&
            this._centeringData[FITTING_HEIGHT_LEFT_EYE] !== undefined &&
            this._centeringData[FITTING_HEIGHT_LEFT_EYE] !== null
        ) {
            validCheck = this.validateFittingHeightDifference(validCheck);
        }
        validCheck = this.validateFittingHeightLeftProgressive(validCheck);
        validCheck = this.validateFittingHeightLeftForSingleVision(validCheck); //BS-1548
        validCheck = this.checkFittingHeight(validCheck); //BS-1548

        return validCheck;
    }

    /**
     * BS-1443
     * @description : Validates the difference of 2mm between fitting heights
     * @param {*} isValid : Previous state of validation boolean
     * @returns : Boolean validCheck : Defines if the data entered is valid
     */
    validateFittingHeightDifference(isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        //BS-1249-Checks if the Fitting height difference is not more then 2mm in left and right eye
        if (
            this._centeringData[FITTING_HEIGHT_RIGHT_EYE] !== undefined &&
            this._centeringData[FITTING_HEIGHT_RIGHT_EYE] !== null &&
            this._centeringData[FITTING_HEIGHT_LEFT_EYE] !== undefined &&
            this._centeringData[FITTING_HEIGHT_LEFT_EYE] !== null &&
            (Number(this._centeringData[FITTING_HEIGHT_RIGHT_EYE]) - Number(this._centeringData[FITTING_HEIGHT_LEFT_EYE]) > 2 ||
                Number(this._centeringData[FITTING_HEIGHT_RIGHT_EYE]) - Number(this._centeringData[FITTING_HEIGHT_LEFT_EYE]) < -2)
        ) {
            this._fittingHeightDifferenceError = true;
        } else {
            this._fittingHeightDifferenceError = false;
        }
        return validCheck;
    }

    /**
     * BS-1443
     * @description : Validates if the fitting hight in right eye shoud not be less than progression length
     * @param {*} isValid : Previous state of validation boolean
     * @returns : Boolean validCheck : Defines if the data entered is valid
     */
    validateFittingHeightRightProgressive(isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        //BS-1245 : Checking whether the value of fitting height Right eye is present and it's value should not be less than Progression length (18mm)
        if (
            this.lensConfiguratorCollection &&
            this.lensConfiguratorCollection.lensType &&
            this.lensConfiguratorCollection.progressionLengthLens !== undefined &&
            this.lensConfiguratorCollection.progressionLengthLens !== null &&
            (this.lensConfiguratorCollection.lensType == LENS_TYPE_PANORAMA_PROGRESSIVE || this.lensConfiguratorCollection.lensType == PANORAMA_PROGRESSIVE_ONE)
        ) {
            //BS-1548
            if (
                this.pageSource &&
                this.pageSource != PAGE_SOURCE_RX &&
                this._centeringData[FITTING_HEIGHT_RIGHT_EYE] != undefined &&
                this._centeringData[FITTING_HEIGHT_RIGHT_EYE] != null &&
                Number(this._centeringData[FITTING_HEIGHT_RIGHT_EYE]) < this.lensConfiguratorCollection.progressionLengthLens
            ) {
                this._showValidationForFittingHeight = true;
                this._rightFittingHeightErrorFlag = true;
                validCheck = false;
            } else if (
                this.pageSource &&
                this.pageSource == PAGE_SOURCE_RX &&
                this._centeringData[FITTING_HEIGHT_RIGHT_EYE] != undefined &&
                this._centeringData[FITTING_HEIGHT_RIGHT_EYE] != null &&
                Number(this._centeringData[FITTING_HEIGHT_RIGHT_EYE]) < this._minimumApplicableFittingHeight
            ) {
                this._showValidationForFittingHeight = true;
                this._rightFittingHeightErrorFlag = true;
                validCheck = false;
            } else if (this._leftFittingHeightErrorFlag === false) {
                this._rightFittingHeightErrorFlag = false;
                this._showValidationForFittingHeight = false;
            }
            //BS-1548
        }
        return validCheck;
    }

    /**
     * BS-1548
     * @description : Validates if the fitting hight in right eye shoud not be less than progression length
     * @param {*} isValid : Previous state of validation boolean
     * @returns : Boolean validCheck : Defines if the data entered is valid
     */
    validateFittingHeightRightForSingleVision(isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        //BS-1245 : Checking whether the value of fitting height Right eye is present and it's value should not be less than Progression length (18mm)
        if (
            this.lensConfiguratorCollection &&
            this.lensConfiguratorCollection.lensType &&
            this.lensConfiguratorCollection.progressionLengthLens !== undefined &&
            this.lensConfiguratorCollection.progressionLengthLens !== null &&
            this.lensConfiguratorCollection.lensType == LENS_TYPE_PANORAMA_SINGLE_VISION
        ) {
            if (
                this._centeringData[FITTING_HEIGHT_RIGHT_EYE] != undefined &&
                this._centeringData[FITTING_HEIGHT_RIGHT_EYE] != null &&
                Number(this._centeringData[FITTING_HEIGHT_RIGHT_EYE]) < this._minimumApplicableFittingHeight
            ) {
                this._showValidationForFittingHeight = true;
                this._rightFittingHeightErrorFlag = true;
                validCheck = false;
            } else if (this._leftFittingHeightErrorFlag === false) {
                this._rightFittingHeightErrorFlag = false;
                this._showValidationForFittingHeight = false;
            }
        }
        return validCheck;
    }

    /**
     * BS-1443
     * @description : Validates if the fitting hight in left eye shoud not be less than progression length
     * @param {*} isValid : Previous state of validation boolean
     * @returns : Boolean validCheck : Defines if the data entered is valid
     */
    validateFittingHeightLeftProgressive(isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        if (
            this.lensConfiguratorCollection &&
            this.lensConfiguratorCollection.lensType &&
            this.lensConfiguratorCollection.progressionLengthLens !== undefined &&
            this.lensConfiguratorCollection.progressionLengthLens !== null &&
            (this.lensConfiguratorCollection.lensType === LENS_TYPE_PANORAMA_PROGRESSIVE ||
                this.lensConfiguratorCollection.lensType === PANORAMA_PROGRESSIVE_ONE)
        ) {
            //BS-1548
            if (
                this.pageSource &&
                this.pageSource != PAGE_SOURCE_RX &&
                this._centeringData[FITTING_HEIGHT_LEFT_EYE] != undefined &&
                this._centeringData[FITTING_HEIGHT_LEFT_EYE] != null &&
                Number(this._centeringData[FITTING_HEIGHT_LEFT_EYE]) < this.lensConfiguratorCollection.progressionLengthLens
            ) {
                this._showValidationForFittingHeight = true;
                this._leftFittingHeightErrorFlag = true;
                validCheck = false;
            } else if (
                //BS-1548
                this.pageSource &&
                this.pageSource == PAGE_SOURCE_RX &&
                this._centeringData[FITTING_HEIGHT_LEFT_EYE] != undefined &&
                this._centeringData[FITTING_HEIGHT_LEFT_EYE] != null &&
                Number(this._centeringData[FITTING_HEIGHT_LEFT_EYE]) < this._minimumApplicableFittingHeight
            ) {
                this._showValidationForFittingHeight = true;
                this._rightFittingHeightErrorFlag = true;
                validCheck = false;
                //BS-1548
            } else if (this._rightFittingHeightErrorFlag === false) {
                this._leftFittingHeightErrorFlag = false;
                this._showValidationForFittingHeight = false;
            }
            //BS-1548
        }
        return validCheck;
    }

    /**
     * BS-1548
     * @description : Validates if the fitting hight in right eye shoud not be less than progression length
     * @param {*} isValid : Previous state of validation boolean
     * @returns : Boolean validCheck : Defines if the data entered is valid
     */
    validateFittingHeightLeftForSingleVision(isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        //BS-1245 : Checking whether the value of fitting height Right eye is present and it's value should not be less than Progression length (18mm)
        if (
            this.lensConfiguratorCollection &&
            this.lensConfiguratorCollection.lensType &&
            this.lensConfiguratorCollection.progressionLengthLens !== undefined &&
            this.lensConfiguratorCollection.progressionLengthLens !== null &&
            this.lensConfiguratorCollection.lensType == LENS_TYPE_PANORAMA_SINGLE_VISION
        ) {
            if (
                this._centeringData[FITTING_HEIGHT_LEFT_EYE] != undefined &&
                this._centeringData[FITTING_HEIGHT_LEFT_EYE] != null &&
                Number(this._centeringData[FITTING_HEIGHT_LEFT_EYE]) < this._minimumApplicableFittingHeight
            ) {
                this._showValidationForFittingHeight = true;
                this._leftFittingHeightErrorFlag = true;
                validCheck = false;
            } else if (this._leftFittingHeightErrorFlag === false) {
                this._leftFittingHeightErrorFlag = false;
                this._showValidationForFittingHeight = false;
            }
        }
        return validCheck;
    }

    //BS-1548
    checkFittingHeight(isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        if (
            this.lensConfiguratorCollection &&
            this.lensConfiguratorCollection.lensType &&
            this.lensConfiguratorCollection.progressionLengthLens !== undefined &&
            this.lensConfiguratorCollection.progressionLengthLens !== null &&
            this.lensConfiguratorCollection.lensType == LENS_TYPE_PANORAMA_SINGLE_VISION
        ) {
            if (
                this._centeringData[FITTING_HEIGHT_LEFT_EYE] != undefined &&
                this._centeringData[FITTING_HEIGHT_LEFT_EYE] != null &&
                Number(this._centeringData[FITTING_HEIGHT_LEFT_EYE]) < this._minimumApplicableFittingHeight
            ) {
                this._showValidationForFittingHeight = true;
                this._leftFittingHeightErrorFlag = true;
                validCheck = false;
            } else if (this._leftFittingHeightErrorFlag === false) {
                this._leftFittingHeightErrorFlag = false;
                this._showValidationForFittingHeight = false;
            }
        }
        if (
            this.lensConfiguratorCollection &&
            this.lensConfiguratorCollection.lensType &&
            this.lensConfiguratorCollection.progressionLengthLens !== undefined &&
            this.lensConfiguratorCollection.progressionLengthLens !== null &&
            this.lensConfiguratorCollection.lensType == LENS_TYPE_PANORAMA_SINGLE_VISION
        ) {
            if (
                this._centeringData[FITTING_HEIGHT_RIGHT_EYE] != undefined &&
                this._centeringData[FITTING_HEIGHT_RIGHT_EYE] != null &&
                Number(this._centeringData[FITTING_HEIGHT_RIGHT_EYE]) < this._minimumApplicableFittingHeight
            ) {
                this._showValidationForFittingHeight = true;
                this._rightFittingHeightErrorFlag = true;
                validCheck = false;
            } else if (this._leftFittingHeightErrorFlag === false) {
                this._rightFittingHeightErrorFlag = false;
                this._showValidationForFittingHeight = false;
            }
        }
        if (validCheck != undefined && validCheck != null && validCheck == true) {
            this._rightFittingHeightErrorFlag = false;
            this._showValidationForFittingHeight = false;
            this._leftFittingHeightErrorFlag = false;
            this._showValidationForFittingHeight = false;
        }
        return validCheck;
    }

    /**
     * BS-1443
     * @description : Validates the data entered in pantascopicTilt
     * @param {*} event : Event object
     * @param {*} isValid : Previous state of validation boolean
     * @returns : Boolean validCheck : Defines if the data entered is valid
     */
    validatePantascopicTilt(event, isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        if (
            this._centeringData['pantascopicTilt'] == undefined ||
            this._centeringData['pantascopicTilt'] == null ||
            Number(this._centeringData['pantascopicTilt']) < 0 ||
            Number(this._centeringData['pantascopicTilt']) > 25 ||
            isNaN(this._centeringData['pantascopicTilt']) ||
            isNaN(parseInt(this._centeringData['pantascopicTilt']))
        ) {
            const pantascopicTilt = this.template.querySelector('.pantascopicTilt');
            pantascopicTilt.setCustomValidity(this.labels.message);
            pantascopicTilt.reportValidity();
            validCheck = false;
        } else {
            const pantascopicTilt = this.template.querySelector('.pantascopicTilt');
            pantascopicTilt.setCustomValidity('');
            pantascopicTilt.reportValidity();
        }
        return validCheck;
    }

    /**
     * BS-1443
     * @description : Validates the data entered in bvdWorn
     * @param {*} event : Event object
     * @param {*} isValid : Previous state of validation boolean
     * @returns : Boolean validCheck : Defines if the data entered is valid
     */
    bvdWornValidation(event, isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        if (
            this._centeringData['bvdWorn'] == undefined ||
            this._centeringData['bvdWorn'] == null ||
            Number(this._centeringData['bvdWorn']) < 8 ||
            Number(this._centeringData['bvdWorn']) > 20 ||
            isNaN(this._centeringData['bvdWorn']) ||
            isNaN(parseInt(this._centeringData['bvdWorn']))
        ) {
            const bvdWorn = this.template.querySelector('.bvdWorn');
            bvdWorn.setCustomValidity(this.labels.message);
            bvdWorn.reportValidity();
            validCheck = false;
        } else {
            const bvdWorn = this.template.querySelector('.bvdWorn');
            bvdWorn.setCustomValidity('');
            bvdWorn.reportValidity();
        }
        return validCheck;
    }

    /**
     * BS-1443
     * @description : Validates the data entered in bvdReffracted
     * @param {*} event : Event object
     * @param {*} isValid : Previous state of validation boolean
     * @returns : Boolean validCheck : Defines if the data entered is valid
     */
    bvdReffractedValidation(event, isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        if (
            this._centeringData['bvdReffracted'] == undefined ||
            this._centeringData['bvdReffracted'] == null ||
            Number(this._centeringData['bvdReffracted']) < 8 ||
            Number(this._centeringData['bvdReffracted']) > 20 ||
            isNaN(this._centeringData['bvdReffracted']) ||
            isNaN(parseInt(this._centeringData['bvdReffracted']))
        ) {
            const bvdReffracted = this.template.querySelector('.bvdReffracted');
            bvdReffracted.setCustomValidity(this.labels.message);
            bvdReffracted.reportValidity();
            validCheck = false;
        } else {
            const bvdReffracted = this.template.querySelector('.bvdReffracted');
            bvdReffracted.setCustomValidity('');
            bvdReffracted.reportValidity();
        }
        return validCheck;
    }

    /**
     * BS-1443
     * @description : Validates the data entered in workingDistance
     * @param {*} event : Event object
     * @param {*} isValid : Previous state of validation boolean
     * @returns : Boolean validCheck : Defines if the data entered is valid
     */
    validateWorkingDistance(event, isValid) {
        let validCheck;
        if (isValid !== undefined && isValid !== null) {
            validCheck = isValid;
        } else {
            validCheck = true;
        }
        if (
            this._isWorkingDistanceFieldApplicable != null &&
            this._isWorkingDistanceFieldApplicable != undefined &&
            this._isWorkingDistanceFieldApplicable == true &&
            this._isWorkingDistanceFieldDisabled != null &&
            this._isWorkingDistanceFieldDisabled != undefined &&
            this._isWorkingDistanceFieldDisabled == false
        ) {
            if (
                this._centeringData['workingDistance'] == undefined ||
                this._centeringData['workingDistance'] == null ||
                Number(this._centeringData['workingDistance']) < 25 ||
                Number(this._centeringData['workingDistance']) > 60 ||
                isNaN(this._centeringData['workingDistance']) ||
                isNaN(parseInt(this._centeringData['workingDistance']))
            ) {
                const workingDistance = this.template.querySelector('.workingDistance');
                workingDistance.setCustomValidity(this.labels.message);
                workingDistance.reportValidity();
                validCheck = false;
            } else {
                const workingDistance = this.template.querySelector('.workingDistance');
                workingDistance.setCustomValidity('');
                workingDistance.reportValidity();
            }
        }
        return validCheck;
    }
}
