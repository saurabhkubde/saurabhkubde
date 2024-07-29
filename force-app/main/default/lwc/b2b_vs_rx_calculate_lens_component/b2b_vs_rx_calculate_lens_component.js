import { LightningElement, api, wire, track } from 'lwc';
import getPicklistValuesForVSRX from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFieldPicklistValues'; //BS-572

//BS-727 - Start
import performSchneiderCallout from '@salesforce/apex/B2B_VisionSensation_RX_Controller.performSchneiderCallout';
import updateLensConfiguratorData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.updateLensConfiguratorData';
import B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS from '@salesforce/label/c.B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS';
import B2B_INPUT_FIELD_ERROR_LABEL from '@salesforce/label/c.B2B_Textbox_White_Space_Error';
import B2B_SCHNEIDER_CALLOUT_BEHAVE_CODES from '@salesforce/label/c.B2B_SCHNEIDER_CALLOUT_BEHAVE_CODES'; //BS-1034
import B2B_CALLOUT_RESPONSE_LABELS from '@salesforce/label/c.B2B_CALLOUT_RESPONSE_LABELS'; //BS-1034
import B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE from '@salesforce/label/c.B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE'; //BS-1248
import VISION_ZONE_CALLOUT_ERROR_MESSAGE from '@salesforce/label/c.VISION_ZONE_CALLOUT_ERROR_MESSAGE'; //BS-1914
import LANG from '@salesforce/i18n/lang';

import { setupLensCalculationsIntoCollection } from 'c/b2b_vs_rx_calculate_lens_component_utility'; //BS-572

import { showToastMessage } from 'c/b2b_cartUtils'; //BS-1244
import RESPONSE_MESSAGE from '@salesforce/label/c.B2B_Something_Went_Wrong'; //BS-1244

// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';

const BASE64_IMAGE_ENCODING_FORMAT = 'data:image/jpeg;base64';
const RIGHT_LENS = 'rightLens';
const LEFT_LENS = 'leftLens';
const ADJUST_BUTTON = 'adjust';
const RESET_BUTTON = 'reset';
const OPERATE_LOADER = 'operateloader';
const NAVIGATE_TO_PREVIOUS_SCREEN = 'navigatetopreviousscreen';
const LEFT_LENS_SELECTOR = '.leftLensInput';
const RIGHT_LENS_SELECTOR = '.rightLensInput';
const UPDATE_PROGRESS_BAR = 'updateprogressbar';
const LENS_CALCULATION_KEY_FOR_VS = 'lensCalculationKeyForVS';
const LENS_CALCULATION_KEY_FOR_RX = 'lensCalculationKeyForRX';
const PAGE_SOURCE_VS = 'VS';
const PAGE_SOURCE_RX = 'RX';
const READ_MODE = 'read';
const LENS_CALCULATION_COMPLETE_EVENT = 'lenscalculationdataupdate';

const RIGHT_AND_LEFT_EYE = 'right and left lens side';
const RIGHT_EYE = 'Right lens';
const LEFT_EYE = 'Left lens';

const MY_VS_RX_PAGE = 'My_VS_RX'; //BS_1244
const GERMAN_LANGUAGE = 'de'; //BS-1244

const SEND_THICKNESS_MATCHING_VALUES = 'sendthicknessmatchingvalues'; //BS-1244
const ERROR_TOAST_VARIENT = 'error'; //BS-1244
const TOAST_MODE = 'dismissable'; //BS-1244
const SCHNEIDER_CALLOUT_COMPLETE = 'schneidercalloutcomplete'; //BS-1034
const LINE_BREAK_TAG = '<br>'; //BS-1034

const WITH_EVIL_EYE_EDGE_BUTTON = 'evileyeEdge'; //BS-572
const EYE_SIDE = 'B2B_Eye_Side__c'; //BS-572
const B2B_LENS_CONFIGURATOR_OBJECT_API_NAME = 'B2B_Lens_Configurator__c'; //BS-1248

const CLIP_IN = 'Clip-in';
const CLIPIN = 'Clip - in';

//BS-727 - End

export default class B2b_vs_rx_calculate_lens_component extends LightningElement {
    /**
     * This cariable is used to indicate the loading status of component
     * BS-727
     * @type {Boolean}
     */
    _isLoading = false;

    /**
     * This collection is used to hold lens calculations data
     * BS-727
     * @type {Array}
     */
    @track
    _calculateLensFieldsCollection;

    /**
     * This variable is used to indicate whether initial loading is completed and component is ready to be shown on UI
     * BS-727
     * @type {Boolean}
     */
    @track
    _initialLoadComplete = false;

    /**
     * This Collection holds the lens configurator data recieved from vs-rx-container
     * BS-727
     * @type {Array}
     */
    @api
    lensConfiguratorCollection;

    /**
     * This Collection is used to hold response recieved from Schneider callout
     * BS-727
     * @type {Array}
     */
    @track
    _lensCalculationCollection;

    /**
     * Api property recieved from the parent 'b2b_visionSensation_RX_cotainer' that indicates the source of Page
     * BS-727
     * @type {String}
     */
    @api
    pageSource;

    /**
     * This variable is used to hold the src of left lens image that is to be shown on UI
     * BS-727
     * @type {String}
     */
    _leftImageSRC;

    /**
     * This variable is used to hold the src of right lens image that is to be shown on UI
     * BS-727
     * @type {String}
     */
    _rightImageSRC;

    /**
     * This variable is used to hold the label of header text
     * BS-727
     * @type {String}
     */
    _headerLabel = B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS.split(',')[0];

    /**
     * This variable is used to hold the label of warning message
     * BS-727
     * @type {String}
     */
    _imageInstructionLabel = B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS.split(',')[14];

    /**
     * This variable is used to hold the value entered by user for thickness matching calculator for Left lens field
     * BS-727
     * @type {String}
     */
    _thicknessMatchingCalculatorLeftValue = null;

    /**
     * This variable is used to hold the value entered by user for thickness matching calculator for Right lens field
     * BS-727
     * @type {String}
     */
    _thicknessMatchingCalculatorRightValue = null;

    /**
     * This variable is used to indicate whether the user has clicked 'Adjust' button on UI
     * BS-727
     * @type {Boolean}
     */
    _isAdjusted = false;

    /**
     * This variable is used to indicate whether the user is naviagted from MY VS RX Tab
     * BS-727
     * @type {Boolean}
     */
    @api
    sourceFromMyVSRX;

    /**
     * This variable is used to hold the attributes in URL path
     * BS-727
     * @type {String}
     */
    _urlPath;

    /**
     * This variable is used to indiate whether the component is in read only mode
     * BS-727
     * @type {Boolean}
     */
    _isReadOnly = false;

    /**
     * This variable is used to control the component mode
     * BS-727
     * @type {String}
     */
    @api
    componentMode;

    /**
     * This collections holds the preserved collection of lens calculation data from local storage
     * BS-727
     * @type {Array}
     */
    @track
    _preservedCollection;

    /**
     * This variable hold the applicable key for storing data into local storage
     * BS-727
     * @type {String}
     */
    _applicableKeyForLensCalculation = LENS_CALCULATION_KEY_FOR_VS;

    /**
     * This variable is used to hold the attributes in URL path
     * BS-727
     * @type {String}
     */
    @api
    _lensConfiguratorId;

    /**
     * This variable idicates whether the left lens is applicable
     * BS-727
     * @type {String}
     */
    _isLeftLensApplicable;

    /**
     * This variable idicates whether the right lens is applicable
     * BS-727
     * @type {String}
     */
    _isRightLensApplicable;

    /**
     * This collection holds the response of Schneider callout performed on load of page
     * BS-1244
     * @type {String}
     */
    @track
    _globalLensCalculationCollection; //BS-1244

    //BS-572
    /**
     * This variable is used indicate that the evil eye edge is already selected by user
     * BS-572
     * @type {Boolean}
     */
    @track
    _isEvilEyeEdgePreSelected = false;

    /**
     * This variable holds the label for 'With Evil Eye Edge' button
     * BS-572
     * @type {String}
     */
    _withEvilEyeEdgeButtonLabel = B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS.split(',')[15]; //BS-572

    /**
     * This variable is used indicate that the evil eye edge is applicable for user
     * BS-572
     * @type {Boolean}
     */
    _isEvilEdgeApplicable = false;

    /**
     * This variable is used for left lens image after evil eye edge selection
     * BS-572
     * @type {Boolean}
     */
    _evilEyeEdgeLeftImageSRC = false;

    /**
     * This variable is used for right lens image after evil eye edge selection
     * BS-572
     * @type {Boolean}
     */
    _evilEyeEdgeRightImageSRC = false;

    /**
     * This variable is used for right lens image SRC to be saved in database after evil eye edge selection
     * BS-572
     * @type {String}
     */
    _evilEyeEdgeRightImageSRCToBeSaved;

    /**
     * This variable is used for left lens image SRC to be saved in database after evil eye edge selection
     * BS-572
     * @type {String}
     */
    _evilEyeEdgeLeftImageSRCToBeSaved;

    /**
     * This variable is used for label of evil eye edge checkbox
     * @type {String}
     */
    _evilEyeEdgeCheckboxLabel = B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS.split(',')[18]; //BS-572

    /**
     * This collection holds the lens calculation collection after adjustements made by user
     * BS-572
     * @type {array}
     */
    @track
    _preservedLensCalculationCollectionWithAdjustments;

    /**
     * This collection holds the lens calculation collection without any adjustements made by user
     * BS-572
     * @type {array}
     */
    @track
    _preservedLensCalculationCollectionWithoutAdjustments;

    /**
     * This collection holds the lens calculation collection
     * BS-572
     * @type {array}
     */
    @track
    _latestLensCalculationCollectionAfterAdjustments;

    /**
     * This variable is used for preserving right lens image SRC without adjustments
     * BS-572
     * @type {String}
     */
    _preservedRightImageSRCWithoutAdjustments;

    /**
     * This variable is used for preserving right lens image SRC without any adjustments to be saved in database after evil eye edge selection
     * BS-572
     * @type {String}
     */
    _preservedRightImageSRCWithoutAdjustmentsToBeSaved;

    /**
     * This variable is used for preserving left lens image SRC without adjustments
     * BS-572
     * @type {String}
     */
    _preservedLeftImageSRCWithoutAdjustments;

    /**
     * This variable is used for left lens image SRC without any adjustments to be saved in database after evil eye edge selection
     * BS-572
     * @type {String}
     */
    _preservedLeftImageSRCWithoutAdjustmentsToBeSaved;

    _preCalcGuid; //BS-1439

    /**
     * This method is used to get evil eye edge icon
     * BS-572
     *
     */
    get evilEyeEdgeIcon() {
        return STORE_STYLING + '/icons/evil_eye_edge1.png';
    }

    /**
     * This variable holds the non base 64 image SRC of left lens that needs to saved into database
     * BS-727
     * @type {String}
     */
    _leftImageSRCToBeSaved;

    /**
     * This variable holds the non base 64 image SRC of right lens that needs to saved into database
     * BS-727
     * @type {String}
     */
    _rightImageSRCToBeSaved;

    /**
     * This variable indicates whether user is navigated otherthan VS-RX Wizard
     * BS-1244
     * @type {Boolean}
     */
    @api
    fromDifferentSource;

    /**
     * This variable indicates whether schneiderCallout is failed
     * BS-1034
     * @type {Boolean}
     */
    schneiderCalloutFailed = false;

    /**
     * This variable holds the user friendly response message that needs to be shown on UI
     * BS-1034
     * @type {Boolean}
     */
    responseMessage;

    /**
     * This variable indicates whether there are any errors on scrren on inial loading (before adjustments)
     * BS-1248
     * @type {Boolean}
     */
    _firstScreenValidated = false;

    //BS-572 - Start
    eyeSideValues = [];
    isBothSidesApplicable = false;
    leftEyeSide = false;
    rightEyeSide = false;
    showEvilEyeEdgeButton = true;
    //BS-572 - End

    /**
     * getter to get pencil icon
     * BS-727
     */
    get editIcon() {
        let editIcon;
        editIcon = {
            icon: STORE_STYLING + '/icons/edit.png'
        };
        return editIcon;
    }

    connectedCallback() {
        this.getEyeSideValues();
    }

    //BS-1034 : Added disconnectCallback()
    disconnectedCallback() {
        this.fireSendSchneiderCalloutStatus(false);
    }

    /**
     * BS-572
     * This method is used to fetch eye side picklist values from database and setup the component
     *
     */
    getEyeSideValues() {
        getPicklistValuesForVSRX({ objectApiName: B2B_LENS_CONFIGURATOR_OBJECT_API_NAME, picklistField: EYE_SIDE })
            .then((data) => {
                data.picklistValues.forEach((item) => {
                    let object = {
                        label: item.picklistValue,
                        value: item.apiName
                    };
                    this.eyeSideValues.push(object);
                });
                //BS-572
                if (this.eyeSideValues && this.lensConfiguratorCollection && this.lensConfiguratorCollection.eyeSide) {
                    this.eyeSideValues.forEach((item) => {
                        if (
                            item.value == RIGHT_AND_LEFT_EYE &&
                            (item.label == this.lensConfiguratorCollection.eyeSide || this.lensConfiguratorCollection.eyeSide == RIGHT_AND_LEFT_EYE)
                        ) {
                            this.isBothSidesApplicable = true;
                        } else if (
                            item.value == LEFT_EYE &&
                            (item.label == this.lensConfiguratorCollection.eyeSide || this.lensConfiguratorCollection.eyeSide == LEFT_EYE)
                        ) {
                            this.leftEyeSide = true;
                        } else if (
                            item.value == RIGHT_EYE &&
                            (item.label == this.lensConfiguratorCollection.eyeSide || this.lensConfiguratorCollection.eyeSide == RIGHT_EYE)
                        ) {
                            this.rightEyeSide = true;
                        }
                    });
                }

                //BS-974 : Added condition to ensu below block should execute only for RX
                if (
                    this.pageSource != null &&
                    this.pageSource != undefined &&
                    this.pageSource == PAGE_SOURCE_RX &&
                    this.lensConfiguratorCollection != null &&
                    this.lensConfiguratorCollection != undefined &&
                    this.lensConfiguratorCollection.withEvilEyeEdge != null &&
                    this.lensConfiguratorCollection.withEvilEyeEdge != undefined
                ) {
                    this._isEvilEyeEdgePreSelected = this.lensConfiguratorCollection.withEvilEyeEdge == true ? true : false;
                    this._isEvilEdgeApplicable = this._isEvilEyeEdgePreSelected;
                }

                //BS-974 : Added condition to ensu below block should execute only for RX
                if (
                    (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) ||
                    (this.lensConfiguratorCollection.selectedRXSolution != undefined &&
                        this.lensConfiguratorCollection.selectedRXSolution != null &&
                        (this.lensConfiguratorCollection.selectedRXSolution == CLIPIN || this.lensConfiguratorCollection.selectedRXSolution == CLIP_IN))
                ) {
                    this.showEvilEyeEdgeButton = false;
                }
                //BS-572
                // Identifying the eye side selected by user on prescription value screen and setting up the component according to that
                if (
                    this.lensConfiguratorCollection != null &&
                    this.lensConfiguratorCollection != undefined &&
                    this.lensConfiguratorCollection.eyeSide != null &&
                    this.lensConfiguratorCollection.eyeSide != undefined
                ) {
                    this._isLeftLensApplicable = this.leftEyeSide == true || this.isBothSidesApplicable == true ? true : false; //BS-572
                    this._isRightLensApplicable = this.rightEyeSide == true || this.isBothSidesApplicable == true ? true : false; //BS-572
                }
                this._isLoading = true; // Turning on the loader

                // Setting up component mode as read only or edit mode
                if (this.componentMode != null && this.componentMode != undefined && this.componentMode == READ_MODE) {
                    this._isReadOnly = true;
                } else {
                    this._isReadOnly = false;
                }

                // Identifying the page source
                if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
                    this._applicableKeyForLensCalculation = LENS_CALCULATION_KEY_FOR_VS;
                } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                    this._applicableKeyForLensCalculation = LENS_CALCULATION_KEY_FOR_RX;
                }
                if (
                    (this.pageSource != null && this.pageSource != undefined && this.pageSource == MY_VS_RX_PAGE) ||
                    (this.fromDifferentSource != undefined && this.fromDifferentSource != null && this.fromDifferentSource == true)
                ) {
                    // If user is navigated from MY VS RX page, then setting up the component for disaplyed into summary mode
                    this.sourceFromMyVSRX = true;
                    if (this.fromDifferentSource != undefined && this.fromDifferentSource != null && this.fromDifferentSource == true) {
                        this._isReadOnly = false;
                        this.getCalculatedLensDetails();
                    } else {
                        this._isReadOnly = true;
                        this.doInitialSetup();
                    }
                } else {
                    if (this._isReadOnly != null && this._isReadOnly != undefined && this._isReadOnly == true) {
                        let decodedFormattedOrderInformationCollection = localStorage.getItem(this._applicableKeyForLensCalculation);
                        this._preservedCollection = JSON.parse(decodedFormattedOrderInformationCollection);
                        this.doInitialSetup();
                    } else {
                        this.getCalculatedLensDetails();
                    }
                }
            })
            .catch((exceptionInstance) => {
                if (this._isAdjusted != null && this._isAdjusted != undefined && this._isAdjusted == true) {
                    showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
                    this._isLoading = false;
                    this.fireOperateLoader(false);
                } else {
                    this.navigateToPreviousScreen();
                    console.error('error:', exceptionInstance);
                    this._isLoading = false;
                    this.fireOperateLoader(false);
                }
            });
    }

    /**
     * BS-727
     * This method is used to perform Schneider callout on load of the component
     *
     */
    async getCalculatedLensDetails() {
        if (this._isAdjusted == true) {
            this.sourceFromMyVSRX = false;
            this._isLoading = true;
        }
        this.sourceFromMyVSRX = false;

        //BS-1244
        let leftValue = null;
        if (this._thicknessMatchingCalculatorLeftValue != null && this._thicknessMatchingCalculatorLeftValue != undefined) {
            leftValue = this._thicknessMatchingCalculatorLeftValue.replace(/,/g, '.');
        }

        //BS-1244
        let rightValue = null;
        if (this._thicknessMatchingCalculatorRightValue != null && this._thicknessMatchingCalculatorRightValue != undefined) {
            rightValue = this._thicknessMatchingCalculatorRightValue.replace(/,/g, '.');
        }
        //BS-572
        let blending = false;
        if (this._isEvilEdgeApplicable != null && this._isEvilEdgeApplicable != undefined && this._isEvilEdgeApplicable == true) {
            blending = true;
            leftValue = null;
            rightValue = null;
        }

        //BS-572
        await performSchneiderCallout({
            recordId: this.lensConfiguratorCollection.lensConfiguratorID,
            applicableBrand: this.pageSource,
            applicableLanguage: LANG,
            leftValue: leftValue,
            rightValue: rightValue,
            blending: blending //BS-572
        })
            .then((data) => {
                if (data != null && data != undefined) {
                    //BS-1034 Start
                    let parsedResult = JSON.parse(JSON.stringify(data));
                    //BS-1248 - Start
                    if (parsedResult.statusCode == 200) {
                        let success =
                            parsedResult &&
                            parsedResult.schneiderSuccessResponseWrapper &&
                            parsedResult.schneiderSuccessResponseWrapper.success &&
                            String(parsedResult.schneiderSuccessResponseWrapper.success).toLowerCase() == 'false'
                                ? false
                                : true;
                        //BS-1914 - Start
                        if (
                            success == true &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData != undefined &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData != null &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData.preCalcGuid != undefined &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData.preCalcGuid != null &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData.preCalcGuid != ''
                        ) {
                            this.fireSendSchneiderCalloutStatus(false); //BS-1034
                            this.schneiderCalloutFailed = false; //BS-1034
                            this._lensCalculationCollection = JSON.parse(JSON.stringify(parsedResult.schneiderSuccessResponseWrapper));
                            //BS-572
                            if (
                                (this._isAdjusted != null && this._isAdjusted != undefined && this._isAdjusted == false) ||
                                (this._isEvilEdgeApplicable != null && this._isEvilEdgeApplicable != undefined && this._isEvilEdgeApplicable == false)
                            ) {
                                this._globalLensCalculationCollection = JSON.parse(JSON.stringify(data));
                            }
                            //BS-572
                            let encodedFormattedCollection = btoa(unescape(encodeURIComponent(JSON.stringify(this._lensCalculationCollection))));
                            this._firstScreenValidated = true;
                            localStorage.setItem(JSON.stringify(this.lensConfiguratorCollection.lensConfiguratorID), encodedFormattedCollection);

                            //BS-572
                            if (
                                (this._isAdjusted != null && this._isAdjusted != undefined && this._isAdjusted == true) ||
                                (this._isEvilEdgeApplicable != null && this._isEvilEdgeApplicable != undefined && this._isEvilEdgeApplicable == true)
                            ) {
                                if (
                                    this._isEvilEyeEdgePreSelected != null &&
                                    this._isEvilEyeEdgePreSelected != undefined &&
                                    this._isEvilEyeEdgePreSelected == true
                                ) {
                                    this.doInitialSetup();
                                } else {
                                    this._latestLensCalculationCollectionAfterAdjustments = JSON.parse(JSON.stringify(data));
                                    this.populateLensCalculationsIntoCollection();
                                }
                            } else {
                                this.doInitialSetup();
                            }
                            //BS-572
                        } else if (
                            success == true &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData != undefined &&
                            parsedResult.schneiderSuccessResponseWrapper.silhData != null &&
                            (parsedResult.schneiderSuccessResponseWrapper.silhData.preCalcGuid == undefined ||
                                parsedResult.schneiderSuccessResponseWrapper.silhData.preCalcGuid == null ||
                                parsedResult.schneiderSuccessResponseWrapper.silhData.preCalcGuid == '')
                        ) {
                            this.responseMessage = VISION_ZONE_CALLOUT_ERROR_MESSAGE;
                            this.schneiderCalloutFailed = true;
                            this._initialLoadComplete = true;
                            this._isLoading = false;
                            if (this._isAdjusted && this._isAdjusted == true) {
                                this._firstScreenValidated = true;
                            } else {
                                this._firstScreenValidated = false;
                            }
                            this.fireOperateLoader(false);
                            this.fireSendSchneiderCalloutStatus(true);
                            //BS-1914 - End
                        } else if (success == false) {
                            if (
                                parsedResult.schneiderSuccessResponseWrapper.silhData &&
                                parsedResult.schneiderSuccessResponseWrapper.errorCode &&
                                parsedResult.schneiderSuccessResponseWrapper.silhData.behav &&
                                parsedResult.schneiderSuccessResponseWrapper.silhData.behav == B2B_SCHNEIDER_CALLOUT_BEHAVE_CODES.split(',')[0]
                            ) {
                                this.responseMessage =
                                    parsedResult.schneiderSuccessResponseWrapper.silhData.infoText != undefined &&
                                    parsedResult.schneiderSuccessResponseWrapper.silhData.infoText != null
                                        ? parsedResult.schneiderSuccessResponseWrapper.silhData.infoText +
                                          LINE_BREAK_TAG +
                                          B2B_CALLOUT_RESPONSE_LABELS.split(',')[0]
                                        : '';
                            } else {
                                this.responseMessage = B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE + LINE_BREAK_TAG + B2B_CALLOUT_RESPONSE_LABELS.split(',')[0];
                                showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
                            }
                            this.schneiderCalloutFailed = true;
                            this._initialLoadComplete = true;
                            this._isLoading = false;
                            if (this._isAdjusted && this._isAdjusted == true) {
                                this._firstScreenValidated = true;
                            } else {
                                this._firstScreenValidated = false;
                            }
                            this.fireOperateLoader(false);
                            this.fireSendSchneiderCalloutStatus(true);
                        }
                    } else if (parsedResult.statusCode == 404) {
                        if (this._isAdjusted && this._isAdjusted == true) {
                            this._firstScreenValidated = true;
                        } else {
                            this._firstScreenValidated = false;
                        }
                        this.schneiderCalloutFailed = true;
                        this._initialLoadComplete = true;
                        this.responseMessage = B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE + LINE_BREAK_TAG + B2B_CALLOUT_RESPONSE_LABELS.split(',')[0];
                        this.fireSendSchneiderCalloutStatus(true);
                        this._isLoading = false;
                        this.fireOperateLoader(false);
                        /* Start : BS-1706 */
                    } else if (parsedResult.statusCode >= 500) {
                        /* End : BS-1706 */
                        if (this._isAdjusted && this._isAdjusted == true) {
                            this._firstScreenValidated = true;
                        } else {
                            this._firstScreenValidated = false;
                        }
                        this.schneiderCalloutFailed = true;
                        this._initialLoadComplete = true;
                        this.responseMessage = B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE + LINE_BREAK_TAG + B2B_CALLOUT_RESPONSE_LABELS.split(',')[0];
                        this.fireSendSchneiderCalloutStatus(true);
                        this._isLoading = false;
                        this.fireOperateLoader(false);
                    } else {
                        if (this._isAdjusted && this._isAdjusted == true) {
                            this._firstScreenValidated = true;
                        } else {
                            this._firstScreenValidated = false;
                        }
                        this.fireSendSchneiderCalloutStatus(true);
                        this.responseMessage = B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE + LINE_BREAK_TAG + B2B_CALLOUT_RESPONSE_LABELS.split(',')[0];
                        this.schneiderCalloutFailed = true;
                        this._initialLoadComplete = true;
                        showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
                        this._isLoading = false;
                        this.fireOperateLoader(false);
                    }
                    //BS-1248 : End
                } else {
                    if (this._isAdjusted != null && this._isAdjusted != undefined && this._isAdjusted == true) {
                        showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
                        this._isLoading = false;
                        this.fireOperateLoader(false);
                    } else {
                        this.navigateToPreviousScreen();
                    }
                }
            })
            .catch((exceptionInstance) => {
                if (this._isAdjusted != null && this._isAdjusted != undefined && this._isAdjusted == true) {
                    showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
                    this._isLoading = false;
                    this.fireOperateLoader(false);
                } else {
                    this.navigateToPreviousScreen();
                    console.error('error:', exceptionInstance);
                    this._isLoading = false;
                    this.fireOperateLoader(false);
                }
            });
    }

    /**
     * BS-727
     * This method is used to perform the initial setup of collection of fields, input boxes, buttons and data table contents to be shoen on UI
     *
     */
    doInitialSetup() {
        let calculateLensFieldsCollection = [];

        for (let i = 0; i < B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS.split(',').length; i++) {
            const calculateLensCollectionInstance = {};
            calculateLensCollectionInstance.isColumn = false; // This is used to indicate whether it is of column type
            calculateLensCollectionInstance.isLeftColumn = false; // This is used to indicate whether it is left column
            calculateLensCollectionInstance.isRightColumn = false; // This is used to indicate whether it is right column
            calculateLensCollectionInstance._isAdjustedLeftColumn = false; // This is used to indicate whether it is left adjusted column
            calculateLensCollectionInstance._isAdjustedRightColumn = false; // This is used to indicate whether it is right adjusted column
            calculateLensCollectionInstance.isUserInputType = false; // This is used to indicate whether the field is user input field
            calculateLensCollectionInstance.isButtonType = false; // This is used to indicate whether the field is of type button
            calculateLensCollectionInstance.isRow = false; // This is used to indicate whether it is of row type
            calculateLensCollectionInstance.isWeightType = false; // This is used to indicate whether it falls into weight row
            calculateLensCollectionInstance.isAxisMinimumType = false; // This is used to indicate whether it falls into axis minimum row
            calculateLensCollectionInstance.isAxisMaximumType = false; // This is used to indicate whether it falls into axis maximum row
            calculateLensCollectionInstance.isLensThicknessAtCenterType = false; // This is used to indicate whether it falls into thickness at center row
            calculateLensCollectionInstance.isLensThicknessAtBorderMinimumType = false; // This is used to indicate whether it falls into thickness at border minimum row
            calculateLensCollectionInstance.isLensThicknessAtBorderMaximumType = false; // This is used to indicate whether it falls into thickness at border maximum row
            calculateLensCollectionInstance.isThicknessMatchingCalculatorType = false; // This is used to indicate whether it falls into thickness matching calculator row
            calculateLensCollectionInstance.rightLensValue = null; // This is used to store value for right lens
            calculateLensCollectionInstance.leftLensValue = null; // This is used to store value for left lens
            calculateLensCollectionInstance.adjustedRightLensValue = null; // This is used to store value for right adjusted lens
            calculateLensCollectionInstance.adjustedLeftLensValue = null; // This is used to store value for left adjusted lens
            calculateLensCollectionInstance.isAdjustButton = false; // This is used to indicate whether it is adjust button
            calculateLensCollectionInstance.isResetButton = false; // This is used to indicate whether it is reset button
            calculateLensCollectionInstance.leftImageSRC = null; // This is used to hold the image SRC for left lens
            calculateLensCollectionInstance.rightImageSRC = null; //This is used to hold the image SRC for right lens
            calculateLensCollectionInstance.isNormalColumn = false; //BS-572
            calculateLensCollectionInstance.isAdjustedColumns = false; //BS-572
            calculateLensCollectionInstance.isWithEvilEyeEdgeColumns = false; //BS-572
            calculateLensCollectionInstance.isThicknessMatchingCalculatorRow = false; //BS-572
            calculateLensCollectionInstance.evilEyeEdgeLeftValue = null; //BS-572
            calculateLensCollectionInstance.evilEyeEdgeRightValue = null; //BS-572
            calculateLensCollectionInstance.evilEyeEdgeLeftImage = null; //BS-572
            calculateLensCollectionInstance.evilEyeEdgeRightImage = null; //BS-572

            if (i > 0 && i < 8) {
                if (i == 1) {
                    calculateLensCollectionInstance.isWeightType = true;
                }
                if (i == 2) {
                    calculateLensCollectionInstance.isAxisMinimumType = true;
                }
                if (i == 3) {
                    calculateLensCollectionInstance.isAxisMaximumType = true;
                }
                if (i == 4) {
                    calculateLensCollectionInstance.isLensThicknessAtCenterType = true;
                }
                if (i == 5) {
                    calculateLensCollectionInstance.isLensThicknessAtBorderMaximumType = true;
                }
                if (i == 6) {
                    calculateLensCollectionInstance.isLensThicknessAtBorderMinimumType = true;
                }
                if (i == 7 && this.isBothSidesApplicable == true) {
                    calculateLensCollectionInstance.isThicknessMatchingCalculatorType = true;
                    calculateLensCollectionInstance.isUserInputType = true;
                    calculateLensCollectionInstance.isButtonType = true;
                    calculateLensCollectionInstance.isAdjustButton = true;
                    calculateLensCollectionInstance.adjustButtonLabel = B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS.split(',')[12];
                    calculateLensCollectionInstance.isResetButton = true;
                    calculateLensCollectionInstance.isThicknessMatchingCalculatorRow = true;
                    calculateLensCollectionInstance.resetButtonLabel = B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS.split(',')[13];
                    calculateLensCollectionInstance.name = B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS.split(',')[i];
                    calculateLensCollectionInstance.isRow = true;
                }
                if (i != 7) {
                    calculateLensCollectionInstance.name = B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS.split(',')[i];
                    calculateLensCollectionInstance.isRow = true;
                }
            }
            if (i > 7 && i < 12) {
                //BS-572
                if (i == 8 || i == 9) {
                    calculateLensCollectionInstance.isNormalColumn = true;
                }
                if ((i == 10 || i == 11) && this.isBothSidesApplicable == true) {
                    //BS-572
                    calculateLensCollectionInstance.isAdjustedColumns = true;
                    calculateLensCollectionInstance.name = B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS.split(',')[i];
                    calculateLensCollectionInstance.isColumn = true;
                    if (i == 10) {
                        calculateLensCollectionInstance._isAdjustedRightColumn = true;
                    } else if (i == 11) {
                        calculateLensCollectionInstance._isAdjustedLeftColumn = true;
                    }
                } else if (i !== 10 && i !== 11) {
                    calculateLensCollectionInstance.name = B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS.split(',')[i];
                    calculateLensCollectionInstance.isColumn = true;
                }
                //BS-572
            }
            if (i > 11 && i < 14) {
                calculateLensCollectionInstance.name = B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS.split(',')[i];
                calculateLensCollectionInstance.isButtonType = true;

                if (i == 12) {
                    calculateLensCollectionInstance.isAdjustButton = true;
                }
                if (i == 13) {
                    calculateLensCollectionInstance.isResetButton = true;
                }
            }
            //BS-572
            if (i == 16 || i == 17) {
                calculateLensCollectionInstance.isWithEvilEyeEdgeColumns = true;
                calculateLensCollectionInstance.name = B2B_VS_RX_CALCULATE_LENS_UTILITY_LABELS.split(',')[i];
                calculateLensCollectionInstance.isColumn = true;
            }
            //BS-572
            calculateLensFieldsCollection.push(calculateLensCollectionInstance);
        }

        if (calculateLensFieldsCollection != null && calculateLensFieldsCollection != undefined) {
            this._calculateLensFieldsCollection = calculateLensFieldsCollection;
        }
        this.populateLensCalculationsIntoCollection();
    }

    /**
     * BS-727
     * This method is used to set the values obtained from Schneider callout
     *
     */
    populateLensCalculationsIntoCollection() {
        let parsedCalculationSummaryCollection = setupLensCalculationsIntoCollection(
            this._calculateLensFieldsCollection,
            this.lensConfiguratorCollection,
            this._lensCalculationCollection,
            this.sourceFromMyVSRX,
            LANG,
            this._thicknessMatchingCalculatorLeftValue,
            this._thicknessMatchingCalculatorRightValue,
            this._preservedCollection,
            this._isEvilEdgeApplicable,
            this._isEvilEyeEdgePreSelected,
            this._isLeftLensApplicable,
            this._isRightLensApplicable
        );

        this._calculateLensFieldsCollection = parsedCalculationSummaryCollection.calculateLensFieldsCollectionSummary;

        if (
            this._isAdjusted != null &&
            this._isAdjusted != undefined &&
            this._isAdjusted == false &&
            this._isEvilEdgeApplicable != undefined &&
            this._isEvilEdgeApplicable != null &&
            this._isEvilEdgeApplicable == false
        ) {
            this._preservedLensCalculationCollectionWithoutAdjustments = JSON.parse(JSON.stringify(this._calculateLensFieldsCollection));
            this._preservedRightImageSRCWithoutAdjustments = parsedCalculationSummaryCollection.rightImageSRC;
            this._preservedRightImageSRCWithoutAdjustmentsToBeSaved = parsedCalculationSummaryCollection.rightImageSRCToBeSaved;
            this._preservedLeftImageSRCWithoutAdjustments = parsedCalculationSummaryCollection.leftImageSRC;
            this._preservedLeftImageSRCWithoutAdjustmentsToBeSaved = parsedCalculationSummaryCollection.leftImageSRCToBeSaved;
        } else if (
            this._isAdjusted &&
            this._isAdjusted == true &&
            this._isEvilEdgeApplicable != undefined &&
            this._isEvilEdgeApplicable != null &&
            this._isEvilEdgeApplicable == false
        ) {
            this._preservedLensCalculationCollectionWithAdjustments = JSON.parse(JSON.stringify(this._calculateLensFieldsCollection));
        }

        if (
            parsedCalculationSummaryCollection.evilEyeEdgeLeftImageSRC &&
            this._evilEyeEdgeLeftImageSRC != parsedCalculationSummaryCollection.evilEyeEdgeLeftImageSRC
        ) {
            this._evilEyeEdgeLeftImageSRC = parsedCalculationSummaryCollection.evilEyeEdgeLeftImageSRC;
        }

        if (
            parsedCalculationSummaryCollection.evilEyeEdgeRightImageSRC &&
            this._evilEyeEdgeRightImageSRC != parsedCalculationSummaryCollection.evilEyeEdgeRightImageSRC
        ) {
            this._evilEyeEdgeRightImageSRC = parsedCalculationSummaryCollection.evilEyeEdgeRightImageSRC;
        }

        if (parsedCalculationSummaryCollection.leftImageSRC && this._leftImageSRC != parsedCalculationSummaryCollection.leftImageSRC) {
            this._leftImageSRC = parsedCalculationSummaryCollection.leftImageSRC;
        }

        if (parsedCalculationSummaryCollection.rightImageSRC && this._rightImageSRC != parsedCalculationSummaryCollection.rightImageSRC) {
            this._rightImageSRC = parsedCalculationSummaryCollection.rightImageSRC;
        }

        if (
            parsedCalculationSummaryCollection.leftImageSRCToBeSaved &&
            this._leftImageSRCToBeSaved != parsedCalculationSummaryCollection.leftImageSRCToBeSaved
        ) {
            this._leftImageSRCToBeSaved = parsedCalculationSummaryCollection.leftImageSRCToBeSaved;
        }

        if (
            parsedCalculationSummaryCollection.rightImageSRCToBeSaved &&
            this._rightImageSRCToBeSaved != parsedCalculationSummaryCollection.rightImageSRCToBeSaved
        ) {
            this._rightImageSRCToBeSaved = parsedCalculationSummaryCollection.rightImageSRCToBeSaved;
        }

        if (parsedCalculationSummaryCollection.isAdjusted && this._isAdjusted != parsedCalculationSummaryCollection.isAdjusted) {
            this._isAdjusted = parsedCalculationSummaryCollection.isAdjusted;
        }

        if (
            parsedCalculationSummaryCollection.thicknessMatchingCalculatorLeftValue &&
            this._thicknessMatchingCalculatorLeftValue != parsedCalculationSummaryCollection.thicknessMatchingCalculatorLeftValue
        ) {
            this._thicknessMatchingCalculatorLeftValue = parsedCalculationSummaryCollection.thicknessMatchingCalculatorLeftValue;
        }

        if (
            parsedCalculationSummaryCollection.thicknessMatchingCalculatorRightValue &&
            this._thicknessMatchingCalculatorRightValue != parsedCalculationSummaryCollection.thicknessMatchingCalculatorRightValue
        ) {
            this._thicknessMatchingCalculatorRightValue = parsedCalculationSummaryCollection.thicknessMatchingCalculatorRightValue;
        }

        if (
            parsedCalculationSummaryCollection.evilEyeEdgeLeftImageSRCToBeSaved &&
            this._evilEyeEdgeLeftImageSRCToBeSaved != parsedCalculationSummaryCollection.evilEyeEdgeLeftImageSRCToBeSaved
        ) {
            this._evilEyeEdgeLeftImageSRCToBeSaved = parsedCalculationSummaryCollection.evilEyeEdgeLeftImageSRCToBeSaved;
        }

        if (
            parsedCalculationSummaryCollection.evilEyeEdgeRightImageSRCToBeSaved &&
            this._evilEyeEdgeRightImageSRCToBeSaved != parsedCalculationSummaryCollection.evilEyeEdgeRightImageSRCToBeSaved
        ) {
            this._evilEyeEdgeRightImageSRCToBeSaved = parsedCalculationSummaryCollection.evilEyeEdgeRightImageSRCToBeSaved;
        }
        let encodedFormattedCollection = btoa(unescape(encodeURIComponent(JSON.stringify(this._calculateLensFieldsCollection))));
        localStorage.setItem(this._applicableKeyForLensCalculation, encodedFormattedCollection);
        //BS-572
        this._initialLoadComplete = true;
        this._isLoading = false;

        if (this._isReadOnly) {
            this._firstScreenValidated = true;
            this._isEvilEdgeApplicable = false;
        }

        if (this.sourceFromMyVSRX != null && this.sourceFromMyVSRX != undefined && this.sourceFromMyVSRX == true) {
            this._firstScreenValidated = true;
        }

        if (parsedCalculationSummaryCollection.preCalcGuid != undefined && parsedCalculationSummaryCollection.preCalcGuid != null) {
            this._preCalcGuid = parsedCalculationSummaryCollection.preCalcGuid;
        } //BS-1439

        this.fireOperateLoader(false);
    }

    /**
     * BS-727
     * This method is used to handle input entered by user on UI for text input fields
     *
     */
    handleUserInput(event) {
        if (event.target != null && event.target != undefined) {
            if (event.target.dataset.name != null && event.target.dataset.name != undefined) {
                if (event.target.dataset.name == RIGHT_LENS) {
                    if (/^[0-9]*([.,][0-9]*)?$/.test(event.target.value)) {
                        let userInput = event.target.value;
                        this._thicknessMatchingCalculatorRightValue = userInput;

                        const rightLens = this.template.querySelector(RIGHT_LENS_SELECTOR);
                        rightLens.setCustomValidity('');
                        rightLens.reportValidity();
                    } else {
                        this._thicknessMatchingCalculatorRightValue = null;
                    }
                }
            }
            if (event.target.dataset.name != null && event.target.dataset.name != undefined) {
                if (event.target.dataset.name == LEFT_LENS) {
                    if (/^[0-9]*([.,][0-9]*)?$/.test(event.target.value)) {
                        let userInput = event.target.value;
                        this._thicknessMatchingCalculatorLeftValue = userInput;
                        const leftLens = this.template.querySelector(LEFT_LENS_SELECTOR);
                        leftLens.setCustomValidity('');
                        leftLens.reportValidity();
                    } else {
                        this._thicknessMatchingCalculatorLeftValue = null;
                    }
                }
            }
        }
    }

    /**
     * BS-727
     * This method is used to handle 'Adjust' or 'Reset' button clicked by user on UI
     *
     */
    handleButtonClick(event) {
        if (event.target != null && event.target != undefined) {
            if (event.target.name != null && event.target.name != undefined) {
                if (event.target.name == ADJUST_BUTTON) {
                    if (
                        (this._isLeftLensApplicable == true &&
                            this._isRightLensApplicable == true &&
                            this._thicknessMatchingCalculatorLeftValue != null &&
                            this._thicknessMatchingCalculatorLeftValue != undefined &&
                            this._thicknessMatchingCalculatorLeftValue != '') ||
                        (this._thicknessMatchingCalculatorRightValue != null &&
                            this._thicknessMatchingCalculatorRightValue != undefined &&
                            this._thicknessMatchingCalculatorRightValue != '') ||
                        (this._isLeftLensApplicable == true &&
                            this._thicknessMatchingCalculatorLeftValue != null &&
                            this._thicknessMatchingCalculatorLeftValue != undefined &&
                            this._thicknessMatchingCalculatorLeftValue != '') ||
                        (this._isRightLensApplicable == true &&
                            this._thicknessMatchingCalculatorRightValue != null &&
                            this._thicknessMatchingCalculatorRightValue != undefined &&
                            this._thicknessMatchingCalculatorRightValue != '')
                    ) {
                        //BS-1244
                        this._isAdjusted = true;
                        const leftLens = this.template.querySelector(LEFT_LENS_SELECTOR);
                        if (leftLens != null && leftLens != undefined) {
                            leftLens.setCustomValidity('');
                            leftLens.reportValidity();
                        }
                        //BS-1244
                        const rightLens = this.template.querySelector(RIGHT_LENS_SELECTOR);
                        if (rightLens != null && rightLens != undefined) {
                            rightLens.setCustomValidity('');
                            rightLens.reportValidity();
                        }

                        if (this._preservedCollection != null && this._preservedCollection != undefined) {
                            this._preservedCollection = null;
                        }
                        this.fireSendThicknessMatchingCalculatorValues(); //BS-1244
                        this.getCalculatedLensDetails();
                    } else {
                        if (
                            this._isRightLensApplicable == true &&
                            this._isLeftLensApplicable == true &&
                            ((this._thicknessMatchingCalculatorLeftValue != null &&
                                this._thicknessMatchingCalculatorLeftValue != undefined &&
                                this._thicknessMatchingCalculatorLeftValue != '') ||
                                (this._thicknessMatchingCalculatorRightValue != null &&
                                    this._thicknessMatchingCalculatorRightValue != undefined &&
                                    this._thicknessMatchingCalculatorRightValue != ''))
                        ) {
                            const leftLens = this.template.querySelector(LEFT_LENS_SELECTOR);
                            leftLens.setCustomValidity('');
                            leftLens.reportValidity();

                            const rightLens = this.template.querySelector(RIGHT_LENS_SELECTOR);
                            rightLens.setCustomValidity('');
                            rightLens.reportValidity();
                            this._isAdjusted = true;
                            this.getCalculatedLensDetails();
                        } else {
                            if (
                                this._isLeftLensApplicable == true &&
                                this._isAdjusted == false &&
                                (this._thicknessMatchingCalculatorLeftValue == null ||
                                    this._thicknessMatchingCalculatorLeftValue == undefined ||
                                    this._thicknessMatchingCalculatorLeftValue == '')
                            ) {
                                const leftLens = this.template.querySelector(LEFT_LENS_SELECTOR);
                                leftLens.setCustomValidity(B2B_INPUT_FIELD_ERROR_LABEL);
                                leftLens.reportValidity();
                            } else {
                                const leftLens = this.template.querySelector(LEFT_LENS_SELECTOR);
                                leftLens.setCustomValidity('');
                                leftLens.reportValidity();
                                this._isAdjusted = true;
                                this.getCalculatedLensDetails();
                            }
                            if (
                                this._isRightLensApplicable == true &&
                                this._isAdjusted == false &&
                                (this._thicknessMatchingCalculatorLeftValue == null ||
                                    this._thicknessMatchingCalculatorLeftValue == undefined ||
                                    this._thicknessMatchingCalculatorLeftValue == '')
                            ) {
                                const rightLens = this.template.querySelector(RIGHT_LENS_SELECTOR);
                                rightLens.setCustomValidity(B2B_INPUT_FIELD_ERROR_LABEL);
                                rightLens.reportValidity();
                            } else {
                                const rightLens = this.template.querySelector(RIGHT_LENS_SELECTOR);
                                rightLens.setCustomValidity('');
                                rightLens.reportValidity();
                                this._isAdjusted = true;
                                this.fireSendThicknessMatchingCalculatorValues(); //BS-1244
                                this.getCalculatedLensDetails();
                            }
                        }
                    }
                } else if (event.target.name == RESET_BUTTON) {
                    this._isLoading = true;
                    //BS-572
                    if (this._isAdjusted != null && this._isAdjusted != undefined && this._isAdjusted == true) {
                        this._isAdjusted = false;
                        this._thicknessMatchingCalculatorLeftValue = null;
                        this._thicknessMatchingCalculatorRightValue = null;
                        this._preservedLensCalculationCollectionWithAdjustments = null;
                    }
                    //BS-572
                    this.schneiderCalloutFailed = false; //BS-1248
                    if (this._preservedCollection != null && this._preservedCollection != undefined) {
                        this._preservedCollection = null;
                    }
                    //BS-572
                    if (this._preservedLensCalculationCollectionWithoutAdjustments) {
                        this._calculateLensFieldsCollection = this._preservedLensCalculationCollectionWithoutAdjustments;
                        this._leftImageSRC = this._preservedLeftImageSRCWithoutAdjustments;
                        this._leftImageSRCToBeSaved = this._preservedLeftImageSRCWithoutAdjustmentsToBeSaved;
                        this._rightImageSRC = this._preservedRightImageSRCWithoutAdjustments;
                        this._rightImageSRCToBeSaved = this._preservedRightImageSRCWithoutAdjustmentsToBeSaved;
                        this._isLoading = false;
                    } else if (this._globalLensCalculationCollection != null && this._globalLensCalculationCollection != undefined) {
                        this._lensCalculationCollection = JSON.parse(JSON.stringify(this._globalLensCalculationCollection));
                        this.doInitialSetup();
                    } else {
                        this.fireSendThicknessMatchingCalculatorValues(); //BS-1244
                        this.getCalculatedLensDetails();
                    }
                    //BS-572
                }
                //BS-572
                else if (event.target.name == WITH_EVIL_EYE_EDGE_BUTTON) {
                    this._isLoading = true;
                    this._isEvilEdgeApplicable = true;
                    this.getCalculatedLensDetails();
                }
                //BS-572
            }
        }
    }

    /**
     * BS-727
     * This method is invoked by parent 'c/b2b_vs_rx_container' and it updates the lens configurator record
     *
     */
    @api
    async saveThicknessValuestoConfigurator(doSaveToBackend) {
        let configurationCollection = JSON.parse(JSON.stringify(this.lensConfiguratorCollection));

        configurationCollection.preCalcGuid = this._preCalcGuid; //BS-1439
        configurationCollection.thicknessMatchingCalculatorLeftValue =
            this._thicknessMatchingCalculatorLeftValue != null &&
            this._thicknessMatchingCalculatorLeftValue != undefined &&
            this._thicknessMatchingCalculatorLeftValue != '' &&
            this._isEvilEdgeApplicable != null &&
            this._isEvilEdgeApplicable != undefined &&
            this._isEvilEdgeApplicable == false
                ? this._thicknessMatchingCalculatorLeftValue.replace(/,/g, '.')
                : null; //BS-1244
        configurationCollection.thicknessMatchingCalculatorRightValue =
            this._thicknessMatchingCalculatorRightValue != null &&
            this._thicknessMatchingCalculatorRightValue != undefined &&
            this._thicknessMatchingCalculatorRightValue != '' &&
            this._isEvilEdgeApplicable != null &&
            this._isEvilEdgeApplicable != undefined &&
            this._isEvilEdgeApplicable == false
                ? this._thicknessMatchingCalculatorRightValue.replace(/,/g, '.')
                : null; //BS-1244

        let calculateLensFieldsCollection = JSON.parse(JSON.stringify(this._calculateLensFieldsCollection));

        //Below logic captures the data from collection and sets into map for storing the data into backend (Lens Configurator object)
        calculateLensFieldsCollection.forEach((instance) => {
            if (instance.isWeightType == true) {
                if (
                    this._isEvilEdgeApplicable &&
                    this._isEvilEyeEdgePreSelected != undefined &&
                    this._isEvilEyeEdgePreSelected != null &&
                    this._isEvilEyeEdgePreSelected == false
                ) {
                    configurationCollection.weightOfLeftLens =
                        instance.evilEyeEdgeLeftValue != undefined && instance.evilEyeEdgeLeftValue != null ? instance.evilEyeEdgeLeftValue : null;
                    configurationCollection.weightOfRightLens =
                        instance.evilEyeEdgeRightValue != undefined && instance.evilEyeEdgeRightValue != null ? instance.evilEyeEdgeRightValue : null;
                } else {
                    configurationCollection.weightOfLeftLens =
                        instance.leftLensValue != undefined && instance.leftLensValue != null ? instance.leftLensValue : null;
                    configurationCollection.weightOfRightLens =
                        instance.rightLensValue != undefined && instance.rightLensValue != null ? instance.rightLensValue : null;
                }
                configurationCollection.weightOfLeftLensAdjusted =
                    instance.adjustedLeftLensValue != null && instance.adjustedLeftLensValue != undefined ? instance.adjustedLeftLensValue : null;

                configurationCollection.weightOfRightLensAdjusted =
                    instance.adjustedRightLensValue != null && instance.adjustedRightLensValue != undefined ? instance.adjustedRightLensValue : null;
            }

            if (instance.isAxisMinimumType == true) {
                if (
                    this._isEvilEdgeApplicable &&
                    this._isEvilEyeEdgePreSelected != undefined &&
                    this._isEvilEyeEdgePreSelected != null &&
                    this._isEvilEyeEdgePreSelected == false
                ) {
                    configurationCollection.axisMinimumOfLeftLens =
                        instance.evilEyeEdgeLeftValue != undefined && instance.evilEyeEdgeLeftValue != null ? instance.evilEyeEdgeLeftValue : null;
                    configurationCollection.axisMinimumOfRightLens =
                        instance.evilEyeEdgeRightValue != undefined && instance.evilEyeEdgeRightValue != null ? instance.evilEyeEdgeRightValue : null;
                } else {
                    configurationCollection.axisMinimumOfLeftLens =
                        instance.leftLensValue != undefined && instance.leftLensValue != null ? instance.leftLensValue : null;
                    configurationCollection.axisMinimumOfRightLens =
                        instance.rightLensValue != undefined && instance.rightLensValue != null ? instance.rightLensValue : null;
                }
                configurationCollection.axisMinimumOfOfLeftLensAdjusted =
                    instance.adjustedLeftLensValue != undefined && instance.adjustedLeftLensValue != null ? instance.adjustedLeftLensValue : null;

                configurationCollection.axisMinimumOfRightLensAdjusted =
                    instance.adjustedRightLensValue != undefined && instance.adjustedRightLensValue != null ? instance.adjustedRightLensValue : null;
            }

            if (instance.isAxisMaximumType == true) {
                if (
                    this._isEvilEdgeApplicable &&
                    this._isEvilEyeEdgePreSelected != undefined &&
                    this._isEvilEyeEdgePreSelected != null &&
                    this._isEvilEyeEdgePreSelected == false
                ) {
                    configurationCollection.axisMaximumOfLeftLens =
                        instance.evilEyeEdgeLeftValue != undefined && instance.evilEyeEdgeLeftValue != null ? instance.evilEyeEdgeLeftValue : null;
                    configurationCollection.axisMaximumOfRightLens =
                        instance.evilEyeEdgeRightValue != undefined && instance.evilEyeEdgeRightValue != null ? instance.evilEyeEdgeRightValue : null;
                } else {
                    configurationCollection.axisMaximumOfLeftLens =
                        instance.leftLensValue != undefined && instance.leftLensValue != null ? instance.leftLensValue : null;
                    configurationCollection.axisMaximumOfRightLens =
                        instance.rightLensValue != undefined && instance.rightLensValue != null ? instance.rightLensValue : null;
                }
                configurationCollection.axisMaximumOfOfLeftLensAdjusted =
                    instance.adjustedLeftLensValue != undefined && instance.adjustedLeftLensValue != null ? instance.adjustedLeftLensValue : null;

                configurationCollection.axisMaximumOfRightLensAdjusted =
                    instance.adjustedRightLensValue != undefined && instance.adjustedRightLensValue != null ? instance.adjustedRightLensValue : null;
            }

            if (instance.isLensThicknessAtCenterType == true) {
                if (
                    this._isEvilEdgeApplicable &&
                    this._isEvilEyeEdgePreSelected != undefined &&
                    this._isEvilEyeEdgePreSelected != null &&
                    this._isEvilEyeEdgePreSelected == false
                ) {
                    configurationCollection.centerThicknessOfLeftLens =
                        instance.evilEyeEdgeLeftValue != undefined && instance.evilEyeEdgeLeftValue != null ? instance.evilEyeEdgeLeftValue : null;
                    configurationCollection.centerThicknessOfRightLens =
                        instance.evilEyeEdgeRightValue != undefined && instance.evilEyeEdgeRightValue != null ? instance.evilEyeEdgeRightValue : null;
                } else {
                    configurationCollection.centerThicknessOfLeftLens =
                        instance.leftLensValue != undefined && instance.leftLensValue != null ? instance.leftLensValue : null;
                    configurationCollection.centerThicknessOfRightLens =
                        instance.rightLensValue != undefined && instance.rightLensValue != null ? instance.rightLensValue : null;
                }
                configurationCollection.centerThicknessOfOfLeftLensAdjusted =
                    instance.adjustedLeftLensValue != undefined && instance.adjustedLeftLensValue != null ? instance.adjustedLeftLensValue : null;

                configurationCollection.centerThicknessOfRightLensAdjusted =
                    instance.adjustedRightLensValue != undefined && instance.adjustedRightLensValue != null ? instance.adjustedRightLensValue : null;
            }

            if (instance.isLensThicknessAtBorderMaximumType == true) {
                if (
                    this._isEvilEdgeApplicable &&
                    this._isEvilEyeEdgePreSelected != undefined &&
                    this._isEvilEyeEdgePreSelected != null &&
                    this._isEvilEyeEdgePreSelected == false
                ) {
                    configurationCollection.borderMaximumThicknessOfLeftLens =
                        instance.evilEyeEdgeLeftValue != undefined && instance.evilEyeEdgeLeftValue != null ? instance.evilEyeEdgeLeftValue : null;
                    configurationCollection.borderMaximumThicknessOfRightLens =
                        instance.evilEyeEdgeRightValue != undefined && instance.evilEyeEdgeRightValue != null ? instance.evilEyeEdgeRightValue : null;
                } else {
                    configurationCollection.borderMaximumThicknessOfLeftLens =
                        instance.leftLensValue != undefined && instance.leftLensValue != null ? instance.leftLensValue : null;
                    configurationCollection.borderMaximumThicknessOfRightLens =
                        instance.rightLensValue != undefined && instance.rightLensValue != null ? instance.rightLensValue : null;
                }

                configurationCollection.borderMaximumThicknessOfOfLeftLensAdjusted =
                    instance.adjustedLeftLensValue != undefined && instance.adjustedLeftLensValue != null ? instance.adjustedLeftLensValue : null;

                configurationCollection.borderMaximumThicknessOfRightLensAdjusted =
                    instance.adjustedRightLensValue != undefined && instance.adjustedRightLensValue != null ? instance.adjustedRightLensValue : null;
            }

            if (instance.isLensThicknessAtBorderMinimumType == true) {
                if (
                    this._isEvilEdgeApplicable &&
                    this._isEvilEyeEdgePreSelected != undefined &&
                    this._isEvilEyeEdgePreSelected != null &&
                    this._isEvilEyeEdgePreSelected == false
                ) {
                    configurationCollection.borderMinimumThicknessOfLeftLens =
                        instance.evilEyeEdgeLeftValue != undefined && instance.evilEyeEdgeLeftValue != null ? instance.evilEyeEdgeLeftValue : null;
                    configurationCollection.borderMinimumThicknessOfRightLens =
                        instance.evilEyeEdgeRightValue != undefined && instance.evilEyeEdgeRightValue != null ? instance.evilEyeEdgeRightValue : null;
                } else {
                    configurationCollection.borderMinimumThicknessOfLeftLens =
                        instance.leftLensValue != undefined && instance.leftLensValue != null ? instance.leftLensValue : null;
                    configurationCollection.borderMinimumThicknessOfRightLens =
                        instance.rightLensValue != undefined && instance.rightLensValue != null ? instance.rightLensValue : null;
                }

                configurationCollection.borderMinimumThicknessOfOfLeftLensAdjusted =
                    instance.adjustedLeftLensValue != undefined && instance.adjustedLeftLensValue != null ? instance.adjustedLeftLensValue : null;

                configurationCollection.borderMinimumThicknessOfRightLensAdjusted =
                    instance.adjustedRightLensValue != undefined && instance.adjustedRightLensValue != null ? instance.adjustedRightLensValue : null;
            }
            configurationCollection.isLensCalculated = true;
            configurationCollection.withEvilEyeEdge = this._isEvilEdgeApplicable; // BS-572
            if (doSaveToBackend != null && doSaveToBackend != undefined && doSaveToBackend == true) {
                if (
                    this._isEvilEdgeApplicable &&
                    this._isEvilEyeEdgePreSelected != undefined &&
                    this._isEvilEyeEdgePreSelected != null &&
                    this._isEvilEyeEdgePreSelected == false
                ) {
                    configurationCollection.leftImageSRC =
                        this._evilEyeEdgeLeftImageSRC != null && this._evilEyeEdgeLeftImageSRC != undefined ? this._evilEyeEdgeLeftImageSRC : null;
                    configurationCollection.rightImageSRC =
                        this._evilEyeEdgeRightImageSRC != null && this._evilEyeEdgeRightImageSRC != undefined ? this._evilEyeEdgeRightImageSRC : null;
                    configurationCollection.leftImageSRCToBeSaved =
                        this._evilEyeEdgeLeftImageSRCToBeSaved != null && this._evilEyeEdgeLeftImageSRCToBeSaved != undefined
                            ? this._evilEyeEdgeLeftImageSRCToBeSaved
                            : null;
                    configurationCollection.rightImageSRCToBeSaved =
                        this._evilEyeEdgeRightImageSRCToBeSaved != null && this._evilEyeEdgeRightImageSRCToBeSaved != undefined
                            ? this._evilEyeEdgeRightImageSRCToBeSaved
                            : null;
                } else {
                    configurationCollection.leftImageSRC = this._leftImageSRC != undefined && this._leftImageSRC != null ? this._leftImageSRC : null;
                    configurationCollection.rightImageSRC = this._rightImageSRC != null && this._rightImageSRC != undefined ? this._rightImageSRC : null;
                    configurationCollection.leftImageSRCToBeSaved =
                        this._leftImageSRCToBeSaved != null && this._leftImageSRCToBeSaved != undefined ? this._leftImageSRCToBeSaved : null;
                    configurationCollection.rightImageSRCToBeSaved =
                        this._rightImageSRCToBeSaved != null && this._rightImageSRCToBeSaved != undefined ? this._rightImageSRCToBeSaved : null;
                }
            } else {
                configurationCollection.leftImageSRC = null;
                configurationCollection.rightImageSRC = null;
                configurationCollection.leftImageSRCToBeSaved = null;
                configurationCollection.rightImageSRCToBeSaved = null;
            }
        });

        this.lensConfiguratorCollection = JSON.parse(JSON.stringify(configurationCollection));

        //Here the updated collcetion is dent to vs_rx_container to keep a copy
        this.fireSendCalculatedLensData();

        await updateLensConfiguratorData({
            lensConfiguratorId: this.lensConfiguratorCollection.lensConfiguratorID,
            fieldNameVsLensConfiguratorDataMap: configurationCollection,
            language: LANG
        })
            .then((data) => {
                return true;
            })
            .catch((error) => {
                console.error(error);
                return false;
            });
    }

    /**
     * BS-727
     * This method is used to save lens calculation data into configurator into backend whenever user click on Save and Next button
     *
     */
    @api
    async handleSaveAndNextButtonClick() {
        if (this._isLeftLensApplicable != null && this._isLeftLensApplicable != undefined && this._isLeftLensApplicable == true) {
            const leftLens = this.template.querySelector(LEFT_LENS_SELECTOR);
            if (leftLens) {
                leftLens.setCustomValidity('');
                leftLens.reportValidity();
            }
        }
        if (this._isRightLensApplicable != null && this._isRightLensApplicable != undefined && this._isRightLensApplicable == true) {
            const rightLens = this.template.querySelector(RIGHT_LENS_SELECTOR);
            if (rightLens) {
                rightLens.setCustomValidity('');
                rightLens.reportValidity();
            }
        }
        let status = await this.saveThicknessValuestoConfigurator(true);
        return status;
    }

    /**
     * BS-727
     * This method is used to fire custom event that tells the parent component to navigate back to previous screen (as Schneider call is failed)
     *
     */
    navigateToPreviousScreen() {
        this.dispatchEvent(
            new CustomEvent(NAVIGATE_TO_PREVIOUS_SCREEN, {
                bubbles: true,
                composed: true,
                cancelable: false
            })
        );
    }

    /**
     * BS-727
     * This method is used to setup component in read only mode
     *
     */
    @api
    setupReadOnlyMode(readOnlyMode) {
        this._isReadOnly = readOnlyMode;
        let decodedFormattedOrderInformationCollection = localStorage.getItem(this._applicableKeyForLensCalculation);
        this._preservedCollection = JSON.parse(decodedFormattedOrderInformationCollection);
        this.doInitialSetup();
    }

    /**
     * This Method is used to handle event fired on click of edit icon by user on UI
     * BS-727
     *
     */
    @api
    handleEditButton() {
        if (this._isReadOnly == true) {
            this._isReadOnly = false;
            this.fireUpdateProgressBar(9, true, false);
        }
    }

    /**
     * This Method is used to fire event to update the progress bar on UI
     * BS-727
     *
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
     * This Method is used to fire event to send lens calculation data to vs_rx_container component
     * BS-727
     *
     */
    fireSendCalculatedLensData() {
        this.dispatchEvent(
            new CustomEvent(LENS_CALCULATION_COMPLETE_EVENT, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    lensCalculationData: this.lensConfiguratorCollection
                }
            })
        );
    }

    /**
     * BS-727
     * This method is used to operate loader on parent component
     *
     */
    fireOperateLoader(loadingStatus) {
        this.dispatchEvent(
            new CustomEvent(OPERATE_LOADER, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    loadingStatus: loadingStatus
                }
            })
        );
    }

    /**
     * BS-1244
     * This method is used to send thickness Matching Calculator Values to container component
     *
     */
    fireSendThicknessMatchingCalculatorValues() {
        this.dispatchEvent(
            new CustomEvent(SEND_THICKNESS_MATCHING_VALUES, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    thicknessMatchingValueLeft: this._thicknessMatchingCalculatorLeftValue,
                    thicknessMatchingCalculatorRightValue: this._thicknessMatchingCalculatorRightValue
                }
            })
        );
    }

    /**
     * BS-1034
     * This method is used to send status of schneider callout to parent in order to control the check and add to cart button
     *
     */
    fireSendSchneiderCalloutStatus(schneiderCalloutFailed) {
        this.dispatchEvent(
            new CustomEvent(SCHNEIDER_CALLOUT_COMPLETE, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    schneiderCalloutFailed: schneiderCalloutFailed
                }
            })
        );
    }

    /**
     * BS-572
     * This method is invoked whenever user checks/unchecks the evil eye edge checkbox on UI
     *
     */
    handleEvilEyeEdgeSelection(event) {
        this._isEvilEdgeApplicable = false;
        if (this._preservedLensCalculationCollectionWithAdjustments != undefined && this._preservedLensCalculationCollectionWithAdjustments != null) {
            this._calculateLensFieldsCollection = this._preservedLensCalculationCollectionWithAdjustments;
        } else if (this._preservedLensCalculationCollectionWithoutAdjustments) {
            this._calculateLensFieldsCollection = JSON.parse(JSON.stringify(this._preservedLensCalculationCollectionWithoutAdjustments));
        }
    }
}
