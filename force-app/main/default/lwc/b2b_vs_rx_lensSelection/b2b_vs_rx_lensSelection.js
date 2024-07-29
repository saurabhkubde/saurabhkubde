import { LightningElement, track, api } from 'lwc';
import { checkProductAvailability } from 'c/b2b_utils'; //BS-1647
import getAvailableLensProducts from '@salesforce/apex/B2B_VS_RX_LensSelectionController.getAvailableLensProducts';
import getApplicableTargetProductDetails from '@salesforce/apex/B2B_VS_RX_LensSelectionController.getApplicableTargetProductDetails'; //BS-1019
import updateAntireflectionSKU from '@salesforce/apex/B2B_VS_RX_LensSelectionController.updateAntireflectionSKU'; //BS-1524
import getAccountInfo from '@salesforce/apex/B2B_VS_RX_LensSelectionController.getAccountInfo'; //BS-1647
import updateLensConfiguratorData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.updateLensConfiguratorData';
import getCategoryTranslations from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getCategoryTranslations';
import getLensShapeData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensShapeRecord';
import getLensSelectionScreenData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensSelectionScreenData'; //BS-1584
import getLensRelatedProducts from '@salesforce/apex/B2B_VS_RX_LensSelectionController.getLensRelatedProducts'; //BS-1466
import getVisionZoneAnalysisId from '@salesforce/apex/B2B_VisionZoneAnalysisCalloutUtility.getVisionZoneAnalysisId'; //BS-967
import checkProductEntitlement from '@salesforce/apex/B2B_VS_RX_LensSelectionController.checkProductEntitlement'; //BS-1796
import { fetchLensShapeDataForLensEdge, populateReadOnlyDataUtils } from './b2b_vs_rx_lensSelection_utils'; //BS-1845
import { LABELS } from './b2b_vs_rx_lensSelection_utils';

//Labels
import B2B_VS_RX_ORDER_REFERENCE_LABELS from '@salesforce/label/c.B2B_VS_RX_Order_Reference_Labels'; //BS-1019
import B2B_AVAILABILITY_CHECK_LENSCOLORS_DOCUMENT from '@salesforce/label/c.B2B_VS_RX_AVAILABILITY_LENSCOLORS_LINK'; //BS-1018
import B2B_FACET_CUT_LENS_HELP_TEXT from '@salesforce/label/c.B2B_Facet_Cut_Lens_Help_Text'; //BS-793
import B2B_FACET_CUT_LABEL from '@salesforce/label/c.B2B_FACET_CUT_LABEL'; //BS-793
import B2B_FACET_CUT_IMAGE_TITLE from '@salesforce/label/c.B2B_FACET_CUT_IMAGE_TITLE'; //BS-793
import VISION_ZONE_ANALYSIS_SURVEY_ANSWER_URL from '@salesforce/label/c.B2B_VISION_ZONE_ANALYSIS_SURVEY_START_URL'; //BS-967
import RESPONSE_MESSAGE from '@salesforce/label/c.B2B_Something_Went_Wrong'; //BS-967
import VISION_ZONE_SURVEY_ERROR_MESSAGE from '@salesforce/label/c.B2B_VISION_ZONE_SURVEY_ERROR_MESSAGE'; //BS-1612
import B2B_VISUAL_PREFERENCE_VALUES from '@salesforce/label/c.B2B_VISUAL_PREFERENCE_VALUES'; //BS-1612
import B2B_VS_SGRAVING_LABEL from '@salesforce/label/c.B2B_VS_SGRAVING_LABEL'; //BS-1796
import B2B_VS_SGRAVING_SKU from '@salesforce/label/c.B2B_VS_SGRAVING_SKU'; //BS-1796
import VISION_ZONE_WRONG_CODE_ERROR_MESSAGE from '@salesforce/label/c.VISION_ZONE_WRONG_CODE_ERROR_MESSAGE'; //BS-1815
import VISION_ZONE_CALLOUT_ERROR_MESSAGE from '@salesforce/label/c.VISION_ZONE_CALLOUT_ERROR_MESSAGE';
import B2B_RX_Solution_Type from '@salesforce/label/c.B2B_RX_Solution_Type';

// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-1019
//utility methods
import { showToastMessage } from 'c/b2b_cartUtils'; //BS-967
import { getVisionZoneAnalysisStatus } from 'c/b2b_vs_rx_containerUtility'; //BS-1612

import LANG from '@salesforce/i18n/lang';
const LANGUAGE_ENGLISH = 'en-US';
const ADAPTER = 'Adapter';
const DIRECT_GLAZING = 'Direct Glazing';

//BS-1019 - Start
const CLIPIN = 'Clip - in';
const CONFIGURATOR_UPDATE = 'updatelensconfiguratorcollection';
const USER_SELECTION_YES = 'Yes';
const USER_SELECTION_NO = 'No';
const ANTIREFLECTION_TYPE = 'Anti Reflection';
const HARDCOATING_TYPE = 'Hard Coating';
const ANTIREFLECTION_AND_HARDCOATING_SELECTION_KEY_FOR_RX = 'userSelectableOptionsForRX';
const ANTIREFLECTION_AND_HARDCOATING_SELECTION_KEY_FOR_VS = 'userSelectableOptionsForVS';
const PAGE_SOURCE_VS = 'VS';
const PAGE_SOURCE_RX = 'RX';
//BS-1019 - End
const READ_ONLY_MODE = 'read'; //BS-961
const EDIT_MODE = 'edit'; //BS-961
const UPDATE_PROGRESS_BAR = 'updateprogressbar'; //BS-961
const PROGRESSION_LENGTH_VALUE = '18'; //BS-1118
//BS-1466 start
const OPTICAL_GLAZING = 'Optical Glazing';
const OPTICAL_SUN_GLAZING = 'Optical Sun Glazing';
const LONG_DISTANCE = 'Long-distance';
const LONG_DISTANCE_BALANCED = 'long-distance balanced';
const MIDDLE_DISTANCE = 'middle-distance';
const CLOSE_RANGE = 'close-range';
const CUSTOM = 'custom';
const LENS_COLOR = 'Lens Color';
const PHOTO_SENSATION = 'Photo Sensation';
const BLUE_SENSATION = 'Blue Sensation/ UV Plus';
const BLUE_SENSATION_RELATION = 'Blue Sensation'; //BS-1466 end
const RIMLESS = 'Rimless';
const FACET_CUT_VALUE = 'facet cut';
const INDEX_SIXTY_SEVEN = '1,67';
const PANORAMA_SINGLE_VISION = 'Panorama Single Vision'; //BS-1466
const CONTAINER_CLASS = 'container';
const CONTAINER_ADDITIONAL_STYLING = 'container checkbox-disabled';
const ERROR_TOAST_VARIENT = 'error'; //BS-967
const TOAST_MODE = 'dismissable'; //BS-967
const S_GRAVING = 'S Graving'; //BS-1796
const OPTICAL_EYEWEAR = 'Optical Eyewear'; //BS-1796
const GERMAN_LANGUAGE = 'de'; //BS-1881
const SUNGLASSES = 'Sunglasses'; //BS-2013

export default class MyComponent extends LightningElement {
    @api effectiveAccountId; //BS-1647
    @track showLensIndex = false;
    @track showLensColor = false;
    @track showProgressiveLength = false;
    @track productMaterial;

    @track
    lensSelectionCollection = {};

    @track
    _isLoading = true;

    @track
    lensProductDetails;
    //BS-1466
    @track
    lensTypeOptions = [
        { label: this.label.panoramaSingleVisionLabel, value: this.label.panoramaSingleVision, checked: false },
        { label: this.label.panoramaProgressiveLabel, value: this.label.panoramaProgressive, checked: false }
    ];

    //BS-1466 start
    @track
    glazingOptions = [];

    @track
    additionalOptions = [];

    @track
    visualPreferences = [
        { label: this.label.longDistance, value: LONG_DISTANCE, checked: false },
        { label: this.label.longDistanceBallance, value: LONG_DISTANCE_BALANCED, checked: false },
        { label: this.label.middleDistance, value: MIDDLE_DISTANCE, checked: false },
        { label: this.label.closeRange, value: CLOSE_RANGE, checked: false },
        { label: null, value: CUSTOM, checked: false }
    ];

    lensDistanceOptions = [
        { label: '2', value: '2' },
        { label: '4', value: '4' }
    ];

    lensEdgeOptions = [];
    //BS-1466 end

    @track
    lensIndexOptions = [];

    //BS-2014
    @track
    sunGlazingLensIndexOptions = [];

    @track
    sunGlazingLensIndexOptionsToShow = [];

    @track
    sunGlazingLensColorOptions = [];

    @track
    lensColorOptions = [];

    @track
    lensColorOptionsToShow = [];

    @track
    productsResult;

    @track
    _isReadOnly = false; //BS-961

    @api
    lensSelectionComponentMode; //BS-961

    @track
    antireflectionCoatingValue; //BS-961

    @track
    availablityCheckLensColorDocument; //BS-1018

    @track
    showErrorMessageLensType = false;

    fromConnectedCallback = false;

    showErrorMessageLensIndex = false;
    showErrorMessageLensProgLength = false;
    showErrorMessageLensColor = false;
    showErrorMessageGlazing = false;
    showErrorMessageAdditionalOption = false;
    showErrorMessagePhotoSensation = false;
    showErrorMessageBlueSensation = false;
    showErrorMessageLensEdge = false;
    showErrorMessageVisualPreference = false;
    showErrorMessageLensDistance = false;
    _errorInstructionToEnterValue;
    _showVisionZoneIdError = false;
    showErrorMessageProgressionLength = false; //BS-1881
    showErrorMessageRelaxVersion = false; //BS-2291

    lensConfiguratorId;
    selectedLensType;
    selectedColor;
    selectedSKU;
    selectedIndex;
    @track lensIndex;
    @track lensColor;
    progressiveLength;
    linkoutImg; //BS-1018

    @track
    categoryName;

    @track
    countryCode; //BS-1647

    @track
    formatProgressiveLength = null;

    @api
    lensConfiguratorCollection;

    @track
    _isTypeClipIn = false; //BS-1279

    //BS-1466 start
    @track
    _showLensType = true;
    _isVsScreen = false;
    _isOpticalGlazing = false;
    _selectedGlazing;
    _showAdditionalOptions = false;
    _showVsLensColor = false;
    _showPhotoSensation = false;
    _showBlueSensation = false;
    _showVisualPreferences = false;
    _isPanoramaProgressiveOne = false;
    _showLensDetails = false;
    _showLensDistance = false;
    _selectedAdditionalOption;
    _blueSensationOptionsToShow = [];
    _photoSensationOptionsToShow = [];
    _blueSensation;
    _photoSensation;
    _photoSensationId;
    _blueSensationId;
    _lensColorId;
    _lensDistance;
    _vsAntiReflectionOrHardCoating;
    _showLensEdge = false;
    _glassProductSku;
    _blankCoatingSku;
    _lensProductId;
    _vsHardcoatingId;
    _vsAntireflectionId;
    _showAntireflectionHardCoatingSelectionVs = false;
    _selectedVisualPreference;
    _frameCategoryName;
    //BS-1466 end
    _lensSchneiderSku; //BS-1710
    showLensEdgeData = false; //BS-1845

    @track
    _showFacetCutImage = false;

    @track
    _facetCutChecked = false;

    @track
    _isFacetCutDisabled = false;

    @track
    _sGravingChecked = false; //BS-1796

    @track
    _showSgravingImage = false; //BS-1796

    @track
    _shapeMethodCall = false; //BS-1796

    @track
    _isEntitledForSgraving = false; //BS-1796

    _facetCutHelpText = B2B_FACET_CUT_LENS_HELP_TEXT; //BS-793
    _sGravingHelpText = B2B_VS_SGRAVING_LABEL.split(',')[1]; //BS-1796
    _facetCutLabel = B2B_FACET_CUT_LABEL;
    _sGravingLabel = B2B_VS_SGRAVING_LABEL.split(',')[0]; //BS-1796
    _facetCutImageTitle = B2B_FACET_CUT_IMAGE_TITLE;

    _facetCutImage = STORE_STYLING + '/icons/facetCutImage.png'; // BS-793
    _sGraving = STORE_STYLING + '/icons/Foto_S_Gravur.jpg'; // BS-1796

    _infoSVG = STORE_STYLING + '/icons/INFO.svg'; // BS-793

    _checkBoxStyling = CONTAINER_CLASS;
    _sGravingStyling = CONTAINER_CLASS; //BS-1935
    _sGravingFeatureAvailable = false; //BS-1935
    clip_in = B2B_RX_Solution_Type.split(',')[2];
    /* BS-2291 */
    _showRelaxVersion = false;
    @track
    relaxVersionOptions = [
        { label: '0.50', value: '0.50' },
        { label: '0.75', value: '0.75' },
        { label: '1.0', value: '1.0' }
    ];
    _selectedRelaxVersion;

    /**
     * Collection to hold selectable options for Antireflection and Hardcoating
     * BS-1019
     * @type {Array}
     */
    @track
    userSelectableOptions;

    /**
     * Label for Antireflection and Hardcoating section
     * BS-1019
     * @type {String}
     */
    _labelForAntireflectionHardCoating;

    /**
     * This variable indicates whether the antireflection SKU is applicable
     * BS-1019
     * @type {Boolean}
     */
    isAntrireflectionSKUApplicable = false;

    /**
     * This variable indicates whether the hard coating SKU is applicable
     * BS-1019
     * @type {Boolean}
     */
    isHardcoatingSKUApplicable = false;

    /**
     * This variable indicates whether the antireflection SKU is applicable
     * BS-1019
     * @type {Boolean}
     */
    applicableAntiReflectionSKU;
    applicableAntiReflectionProduct; // BS-1522

    /**
     * This variable indicates whether the hard coating SKU is applicable
     * BS-1019
     * @type {Boolean}
     */
    appllicableHardCoatingSKU;
    appllicableHardCoatingProduct; //BS-1522

    /**
     * This variable is use to store the key needed for local storage
     * BS-1019
     * @type {String}
     */
    applicableKeyPreservingUserSelectableOptions;

    /**
     * This variable indicates whether the evil eye edge is selected by user on UI
     * BS-1019
     * @type {Boolean}
     */
    isEvilEyeEdgeSelected = false;

    /**
     * This variable holds the page source
     * BS-1019
     * @type {String}
     */
    @api
    pageSource;

    /**
     * This variable indicates whether antireflection and hardcoatinf options to be shown on UI
     * BS-1019
     * @type {Boolean}
     */
    @track
    _showAntireflectionHardCoatingSelection = false;

    @track
    showErrorMessageForAntireflectionOrHardcoatingOptions = false; //BS-1019

    @track
    lensSelectionReadOnlyCollection;

    @track
    _readOnlySetupDone = false;
    //BS-1019 End'

    @track
    _lensSelectionReadOnlyObject;

    _showVisionZoneId = true; //BS-967 : use to rerender the fields

    _isVisionZoneAnalysisDisabled = false; //BS-967

    _isVisionZoneSurveyPopulated = true; //BS-1612

    //BS-1612
    _showVisionZoneAnalysisSurveyCompletionError = false;
    _showVisionZoneAnalysisCodeInvalidError = false; //BS-1815
    _showVisionZoneAnalysisCallOutError = false; //BS-1815

    _visionZoneAnalysisDataWrapper = {};

    _visionZoneError = VISION_ZONE_SURVEY_ERROR_MESSAGE;
    _visionZoneInvlidCodeError = VISION_ZONE_WRONG_CODE_ERROR_MESSAGE; //BS-1815
    _visionZoneCallOutError = VISION_ZONE_CALLOUT_ERROR_MESSAGE; //BS-1815

    _visionZoneResult;
    //BS-1612

    //BS-1845
    lensShapeDataForLensEdgeCollection = {};

    /**
     * This variable is used to indicate whether the progression length is disabled on UI
     * BS-1118
     * @type {Boolean}
     */
    @track
    isProgressiveLengthDisabled = false;

    get alertIcon() {
        return STORE_STYLING + '/icons/INFO.svg';
    }

    /**
     * This method is used to get evil eye edge icon
     * BS-1019
     *
     */
    get evilEyeEdgeIcon() {
        return STORE_STYLING + '/icons/evil_eye_edge1.png';
    }

    /**
     * getter to get pencil icon
     * BS-961
     */
    get editIcon() {
        let editIcon;
        editIcon = {
            icon: STORE_STYLING + '/icons/edit.png'
        };
        return editIcon;
    }

    get isSgraving() {
        return this._showSgravingImage && this._sGravingFeatureAvailable;
    }

    /**
     * Get The labels used in the template.
     * BS-723
     * @type {Object}
     */
    get label() {
        //Lens selection Labels
        return LABELS;
    }

    async connectedCallback() {
        //BS-1018
        if (this.pageSource && this.pageSource == PAGE_SOURCE_VS) {
            this._isVsScreen = true;
            this._showLensType = false;
            if (this.lensConfiguratorCollection.frameType !== SUNGLASSES) {
                this.glazingOptions = [
                    { label: this.label.opticalGlazing, value: OPTICAL_GLAZING, checked: false },
                    { label: this.label.opticalSunGlazing, value: OPTICAL_SUN_GLAZING, checked: false }
                ];
            } else {
                this.glazingOptions = [{ label: this.label.opticalSunGlazing, value: OPTICAL_SUN_GLAZING, checked: false }];
            } //BS-2013
            // BS-2291
            if (this.lensConfiguratorCollection && this.lensConfiguratorCollection.lensType == this.label.panoramaRelaxLabel) {
                this._showRelaxVersion = true;
                this._selectedRelaxVersion = this.lensConfiguratorCollection.relaxVersion ? this.lensConfiguratorCollection.relaxVersion : null;
            }
            let result = await checkProductEntitlement({ effectiveAccountId: this.effectiveAccountId, productSku: B2B_VS_SGRAVING_SKU });
            if (result !== undefined && result !== null && result == true) {
                this._isEntitledForSgraving = true;
            } else {
                this._isEntitledForSgraving = false;
            } //BS-1796
            if (
                this.lensConfiguratorCollection &&
                this.lensConfiguratorCollection.productFrameType &&
                this.lensConfiguratorCollection.productFrameType == RIMLESS &&
                this.lensConfiguratorCollection.selectedLensShapeId
            ) {
                this._shapeMethodCall = true; //BS-1796
                this.getLensShapeData();
            }
            if (
                this._shapeMethodCall == false &&
                this.lensConfiguratorCollection &&
                this.lensConfiguratorCollection.frameType &&
                this.lensConfiguratorCollection.frameType == OPTICAL_EYEWEAR &&
                this.lensConfiguratorCollection.selectedLensShapeId
            ) {
                this.getLensShapeData();
            } //BS-1796
            //BS-1845
            if (this.lensConfiguratorCollection) {
                if (this.lensConfiguratorCollection.lensEdge) {
                    this.showLensEdgeData = true;
                    this._lensEdge = this.lensConfiguratorCollection.lensEdge;
                } else {
                    this.getLensShapeDataForLensEdge(); //BS-1845
                }
            }
            if (this.lensConfiguratorCollection && this.lensConfiguratorCollection.lensConfiguratorID) {
                this._isLoading = true;
                await getLensSelectionScreenData({ recordId: this.lensConfiguratorCollection.lensConfiguratorID })
                    .then((result) => {
                        this.populateReadOnlyData(result);
                    })
                    .catch((error) => {
                        this._isLoading = false;
                    });
            }
        } // BS-1466

        this.linkoutImg = STORE_STYLING + '/icons/externalLink.svg';
        //BS-1799
        this.availablityCheckLensColorDocument = B2B_AVAILABILITY_CHECK_LENSCOLORS_DOCUMENT;

        if (this._isVsScreen == false) {
            if (this.lensConfiguratorCollection.selectedRXSolution === this.clip_in || this.lensConfiguratorCollection.selectedRXSolution === CLIPIN) {
                this.categoryName = this.clip_in;
                this._isTypeClipIn = true;
            } else {
                this.categoryName = this.lensConfiguratorCollection.selectedRXSolution;
            }
        }

        if (this.lensConfiguratorCollection.withEvilEyeEdge) {
            this.isEvilEyeEdgeSelected = this.lensConfiguratorCollection.withEvilEyeEdge;
        }

        if (this.pageSource && this.pageSource == PAGE_SOURCE_VS) {
            this.applicableKeyPreservingUserSelectableOptions = ANTIREFLECTION_AND_HARDCOATING_SELECTION_KEY_FOR_VS;
        } else if (this.pageSource && this.pageSource == PAGE_SOURCE_RX) {
            this.applicableKeyPreservingUserSelectableOptions = ANTIREFLECTION_AND_HARDCOATING_SELECTION_KEY_FOR_RX;
        }

        this._labelForAntireflectionHardCoating = this.label.antireflectionLabel; //BS-1688 - Modified Header
        //BS-1019 - End
        let result = await getAccountInfo({ accountId: this.effectiveAccountId });
        if (result !== null && result !== undefined) {
            this.countryCode = result.substring(0, 4);
        } //BS-1647 end
        this.fromConnectedCallback = true;
        if (this._isVsScreen == false) {
            //BS-1647 start
            this.getLensProducts();
        } //BS-1466
        this.setupComponentMode(this.lensSelectionComponentMode); //BS-961 setting lens info ready only or edit only
        this._errorInstructionToEnterValue = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[10];
        if (LANG !== LANGUAGE_ENGLISH) {
            let result = await getCategoryTranslations({ language: LANG });
            if (result !== null && result !== undefined) {
                try {
                    this.categoryName = result.find((iterator) => iterator.Name === this.categoryName).Parent.Name;
                } catch (error) {}
            }
        }
        if (this._isVsScreen == false) {
            this.setupAntireflectionHardCoatingSelectionMode();
        } //BS-1466
        this._isLoading = false;
    }

    handleFacetCutChange(event) {
        let facetCutValue = event.target.checked;
        this._facetCutChecked = facetCutValue;
    }

    /**
     * BS-1796
     */
    handleSgravingChange(event) {
        let sGravingValue = event.target.checked;
        this._sGravingChecked = sGravingValue;
    }

    /**
     * BS-793
     * This method controls hide and show facet cut
     * image and checkbox.
     */
    getLensShapeData() {
        this._checkBoxStyling = CONTAINER_CLASS;
        getLensShapeData({
            recordId: this.lensConfiguratorCollection.selectedLensShapeId
        })
            .then((result) => {
                if (result !== null && result[0] !== null) {
                    let lensShapeRecord = result[0];
                    if (
                        (lensShapeRecord.B2B_Default_Features__c && lensShapeRecord.B2B_Default_Features__c.includes(FACET_CUT_VALUE) == true) ||
                        (lensShapeRecord.B2B_Available_features__c && lensShapeRecord.B2B_Available_features__c.includes(FACET_CUT_VALUE) == true)
                    ) {
                        this._showFacetCutImage = true;
                        if (this.lensConfiguratorCollection && this.lensConfiguratorCollection.shapeSelectionData) {
                            //BS-1963
                            if (
                                this.lensConfiguratorCollection.shapeSelectionData.withAccentRingValue &&
                                this.lensConfiguratorCollection.shapeSelectionData.withAccentRingValue == false &&
                                this.lensConfiguratorCollection.shapeSelectionData.withColoredGroove != null &&
                                this.lensConfiguratorCollection.shapeSelectionData.withColoredGroove == false
                            ) {
                                if (lensShapeRecord.B2B_Default_Features__c && lensShapeRecord.B2B_Default_Features__c.includes(FACET_CUT_VALUE) == true) {
                                    if (this.lensSelectionReadOnlyCollection === undefined || this.lensSelectionReadOnlyCollection.lensType == false) {
                                        this._facetCutChecked = true;
                                        this._isFacetCutDisabled = false;
                                    }
                                } else if (
                                    lensShapeRecord.B2B_Available_features__c &&
                                    lensShapeRecord.B2B_Available_features__c.includes(FACET_CUT_VALUE) == true
                                ) {
                                    if (this.lensSelectionReadOnlyCollection === undefined || this.lensSelectionReadOnlyCollection.lensType == false) {
                                        this._facetCutChecked = false;
                                        this._isFacetCutDisabled = false;
                                    }
                                }
                            } else if (
                                (this.lensConfiguratorCollection.shapeSelectionData.withAccentRingValue &&
                                    this.lensConfiguratorCollection.shapeSelectionData.withAccentRingValue === true) ||
                                (this.lensConfiguratorCollection.shapeSelectionData.withColoredGroove &&
                                    this.lensConfiguratorCollection.shapeSelectionData.withColoredGroove === true)
                            ) {
                                this._facetCutChecked = false;
                                this._isFacetCutDisabled = true;
                                this._checkBoxStyling = CONTAINER_ADDITIONAL_STYLING;
                            }
                        } else {
                            this._facetCutChecked = false;
                            this._isFacetCutDisabled = false;
                        }
                    } else {
                        this._showFacetCutImage = false;
                        this._facetCutChecked = false;
                    }
                    //BS-1796 start
                    if (
                        this._isEntitledForSgraving == true &&
                        ((lensShapeRecord.B2B_Default_Features__c && lensShapeRecord.B2B_Default_Features__c.includes(S_GRAVING) == true) ||
                            (lensShapeRecord.B2B_Available_features__c && lensShapeRecord.B2B_Available_features__c.includes(S_GRAVING) == true))
                    ) {
                        this._showSgravingImage = true;
                        //BS-2381
                        if (lensShapeRecord.B2B_Default_Features__c && lensShapeRecord.B2B_Default_Features__c.includes(S_GRAVING) == true) {
                            if (
                                this.lensSelectionReadOnlyCollection === undefined ||
                                this.lensSelectionReadOnlyCollection.lensType == undefined ||
                                this.lensSelectionReadOnlyCollection.lensType == false
                            ) {
                                this._sGravingChecked = true;
                            }
                        } else if (lensShapeRecord.B2B_Available_features__c && lensShapeRecord.B2B_Available_features__c.includes(S_GRAVING) == true) {
                            if (
                                this.lensSelectionReadOnlyCollection === undefined ||
                                this.lensSelectionReadOnlyCollection.lensType == undefined ||
                                this.lensSelectionReadOnlyCollection.lensType == false
                            ) {
                                this._sGravingChecked = false;
                            }
                        }
                    } else {
                        this._showSgravingImage = false;
                    } //BS-1796 end
                }
            })
            .catch((error) => {});
    }
    //Added as a part of BS-1845
    async getLensShapeDataForLensEdge() {
        await fetchLensShapeDataForLensEdge(this.lensConfiguratorCollection, this.label)
            .then((result) => {
                this.lensShapeDataForLensEdgeCollection = JSON.parse(JSON.stringify(result));
                if (this.lensShapeDataForLensEdgeCollection) {
                    this.showLensEdgeData = this.lensShapeDataForLensEdgeCollection.showLensEdgeData;
                    this.lensEdgeOptions =
                        this.lensShapeDataForLensEdgeCollection.lensEdgeOptions != undefined ? this.lensShapeDataForLensEdgeCollection.lensEdgeOptions : null;
                    this.showErrorMessageLensEdge = this.lensShapeDataForLensEdgeCollection.showErrorMessageLensEdge;
                    this._lensEdge = this.lensShapeDataForLensEdgeCollection.lensEdge;
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /**
     * This method is used to setup applicable options for antireflection and hard coating options collection
     * BS-1019
     *
     */
    setupAntireflectionHardCoatingSelectionMode() {
        let userSelectableOptions = [];
        const yesOptionForUserSelection = {};
        yesOptionForUserSelection.label = this.label.yesOptionLabel;
        yesOptionForUserSelection.value = USER_SELECTION_YES;
        yesOptionForUserSelection.checked = true; //BS-1355
        yesOptionForUserSelection.disabled = false;
        userSelectableOptions.push(yesOptionForUserSelection);

        const noOptionForUserSelection = {};
        noOptionForUserSelection.label = this.label.noOptionLabel;
        noOptionForUserSelection.value = USER_SELECTION_NO;
        noOptionForUserSelection.checked = false;
        noOptionForUserSelection.disabled = false;

        userSelectableOptions.push(noOptionForUserSelection);
        if (this.categoryName) {
            userSelectableOptions.forEach((option) => {
                if (this.categoryName == this.clip_in || this.lensConfiguratorCollection.selectedRXSolution === CLIPIN) {
                    if (option.value == USER_SELECTION_YES) {
                        option.checked = true;
                        this.antireflectionCoatingValue = this.label.yesOptionLabel;
                    } else {
                        option.checked = false;
                    }
                    option.disabled = true;
                    this.isAntrireflectionSKUApplicable = true;
                    this.isHardcoatingSKUApplicable = true;
                } else if (option.value == USER_SELECTION_YES) {
                    option.disabled = false;
                    option.checked = true;
                    this.antireflectionCoatingValue = this.label.yesOptionLabel;
                    this.isAntrireflectionSKUApplicable = true;
                    this.isHardcoatingSKUApplicable = true;
                } else {
                    option.disabled = false;
                    option.checked = false;
                }
            });
        }
        this.antireflectionCoatingValue = this.label.yesOptionLabel;
        userSelectableOptions.forEach((nonPreservedSelectableOption) => {
            if (nonPreservedSelectableOption.value == USER_SELECTION_YES) {
                if (
                    this.lensConfiguratorCollection.isAntireflectionHardcoating != null &&
                    this.lensConfiguratorCollection.isAntireflectionHardcoating != undefined &&
                    this.lensConfiguratorCollection.isAntireflectionHardcoating == false
                ) {
                    nonPreservedSelectableOption.checked = false;
                    this.antireflectionCoatingValue = this.label.noOptionLabel;
                    this.isAntrireflectionSKUApplicable = false;
                    this.isHardcoatingSKUApplicable = false;
                }
            } else if (nonPreservedSelectableOption.value == USER_SELECTION_NO) {
                if (
                    this.lensConfiguratorCollection.isAntireflectionHardcoating != null &&
                    this.lensConfiguratorCollection.isAntireflectionHardcoating != undefined &&
                    this.lensConfiguratorCollection.isAntireflectionHardcoating == false
                ) {
                    nonPreservedSelectableOption.checked = true;
                    this.antireflectionCoatingValue = this.label.noOptionLabel;
                }
            }
        }); //BS-1355

        this.userSelectableOptions = userSelectableOptions;
    }

    /**
     * This method is used to handle selection for Antireflection and hard coating
     * BS-1019
     *
     */
    handleUserSelection(event) {
        let selectedOption = event.target.value;
        this.applicableAntiReflectionSKU = null;
        this.appllicableHardCoatingSKU = null;
        //BS-1522
        this.applicableAntiReflectionProduct = null;
        this.appllicableHardCoatingProduct = null;
        //BS-1522
        this.userSelectableOptions.forEach((option) => {
            if (option.value == selectedOption) {
                option.checked = true;
            } else {
                option.checked = false;
            }
        });

        if (selectedOption) {
            if (selectedOption == USER_SELECTION_YES) {
                this.antireflectionCoatingValue = this.label.yesOptionLabel;
                this.isAntrireflectionSKUApplicable = true;
                this.isHardcoatingSKUApplicable = true;
            } else if (selectedOption == USER_SELECTION_NO) {
                this.antireflectionCoatingValue = this.label.noOptionLabel;
                this.isAntrireflectionSKUApplicable = false;
                this.isHardcoatingSKUApplicable = true; //BS-1688 : hard coating will always be applicable
            }
        }
    }

    /**
     * This method is used to handle selection for evil eye Edge
     * BS-1019
     */
    handleEvilEyeEdgeSelection(event) {
        this.isEvilEyeEdgeSelected = event.target.checked;
    }

    /**
     * This method is used to fetch SchneiderSKU from commerce product link for selected lens
     * BS-1019
     */
    async fetchSchneiderSKU(lensSelectionCollection) {
        this.applicableAntiReflectionSKU = null;
        this.appllicableHardCoatingSKU = null;
        //BS-1522
        this.applicableAntiReflectionProduct = null;
        this.appllicableHardCoatingProduct = null;
        //BS-1522
        if (this._isVsScreen == false) {
            await getApplicableTargetProductDetails({
                isAntireflectionSKUApplicable: this.isAntrireflectionSKUApplicable,
                isHardCoatingApplicable: true, //BS-1688
                sourceProductSKU: this.selectedSKU
            })
                .then(async (result) => {
                    if (result != null && result != undefined && result.length > 0) {
                        let commerceProductLinkData = JSON.parse(JSON.stringify(result));
                        commerceProductLinkData.forEach((record) => {
                            if (record.B2B_Type__c) {
                                if (record.B2B_Type__c == ANTIREFLECTION_TYPE) {
                                    if (record.B2B_Target_Product__r) {
                                        //BS-1522
                                        this.applicableAntiReflectionProduct = record.B2B_Target_Product__r.B2B_Schneider_SKU__c
                                            ? record.B2B_Target_Product__c
                                            : null;
                                        //BS-1522
                                        this.applicableAntiReflectionSKU = record.B2B_Target_Product__r.B2B_Schneider_SKU__c
                                            ? record.B2B_Target_Product__r.B2B_Schneider_SKU__c
                                            : null;
                                    }
                                } else if (record.B2B_Type__c == HARDCOATING_TYPE) {
                                    // Getting schneider SKU of target product if hard coating is applicable
                                    if (record.B2B_Target_Product__r) {
                                        //BS-1522
                                        this.appllicableHardCoatingProduct = record.B2B_Target_Product__r.B2B_Schneider_SKU__c
                                            ? record.B2B_Target_Product__c
                                            : null;
                                        //BS-1522
                                        this.appllicableHardCoatingSKU = record.B2B_Target_Product__r.B2B_Schneider_SKU__c
                                            ? record.B2B_Target_Product__r.B2B_Schneider_SKU__c
                                            : null;
                                    }
                                }
                            }
                        });
                    }
                    lensSelectionCollection.antireflectionSKU = this.applicableAntiReflectionSKU; // B2B_AntireflectionSKU__c
                    lensSelectionCollection.antireflectionProduct = this.applicableAntiReflectionProduct; // BS-1522
                    lensSelectionCollection.hardCoatingSKU = this.appllicableHardCoatingSKU; // B2B_HardCoatingSKU__c
                    lensSelectionCollection.hardCoatingProduct = this.appllicableHardCoatingProduct; // BS-1522
                    lensSelectionCollection.withEvilEyeEdge = this.isEvilEyeEdgeSelected;

                    //BS-898 - Start
                    let lensConfiguratorCollection = JSON.parse(JSON.stringify(this.lensConfiguratorCollection));
                    lensConfiguratorCollection.antireflectionSKU = this.applicableAntiReflectionSKU; // B2B_AntireflectionSKU__c
                    lensConfiguratorCollection.antireflectionProduct = this.applicableAntiReflectionProduct; // BS-1522
                    lensConfiguratorCollection.hardCoatingSKU = this.appllicableHardCoatingSKU; // B2B_HardCoatingSKU__c
                    lensConfiguratorCollection.hardCoatingProduct = this.appllicableHardCoatingProduct; // BS-1522
                    lensConfiguratorCollection.withEvilEyeEdge = this.isEvilEyeEdgeSelected;

                    lensConfiguratorCollection.lensType = this.selectedLensType; //B2B_Lens_Type__c
                    lensConfiguratorCollection.lensIndex = this.selectedIndex; //B2B_Lens_Index__c
                    lensConfiguratorCollection.lensSKU = this.selectedSKU; //B2B_Selected_Lens_SKU__c
                    lensConfiguratorCollection.productMaterial = this.productMaterial;

                    if (this.progressiveLength) {
                        lensConfiguratorCollection.progressionLengthLens = this.progressiveLength; //B2B_Progression_Length__c
                    } else if (this.showProgressiveLength === false) {
                        lensConfiguratorCollection.progressionLengthLens = null; //B2B_Progression_Length__c
                    }
                    lensConfiguratorCollection.lensColor = this.selectedColor;
                    //BS-1524
                    if (this.isAntireflectionSKUApplicable && this.isAntireflectionSKUApplicable == false) {
                        updateAntireflectionSKU({ lensConfiguratorId: this.lensConfiguratorId });
                    }
                    //BS-1524
                    await updateLensConfiguratorData({
                        lensConfiguratorId: this.lensConfiguratorId,
                        fieldNameVsLensConfiguratorDataMap: lensConfiguratorCollection,
                        language: LANG
                    });
                    //BS-898 - End
                    this._isLoading = false;
                    this.dispatchEvent(
                        new CustomEvent(CONFIGURATOR_UPDATE, {
                            detail: {
                                lensSelectionCollection: this.lensSelectionCollection
                            }
                        })
                    );
                })
                .catch((exceptionInstance) => {
                    console.error(exceptionInstance);
                });
        } else {
            //BS-1466 this block will set data for vs configurations.
            let lensConfiguratorCollection = JSON.parse(JSON.stringify(this.lensConfiguratorCollection));

            lensConfiguratorCollection.lensType = this.selectedLensType; //B2B_Lens_Type__c
            lensConfiguratorCollection.lensIndex = this.selectedIndex; //B2B_Lens_Index__c
            lensConfiguratorCollection.lensSKU = this.selectedSKU; //B2B_Selected_Lens_SKU__c
            lensConfiguratorCollection.productMaterial = this.productMaterial;
            lensConfiguratorCollection.lensColorId = this._lensColorId;
            lensConfiguratorCollection.photoSensationId = this._photoSensationId;
            lensConfiguratorCollection.blueSensationId = this._blueSensationId;
            lensConfiguratorCollection.lensDistance = this._lensDistance;
            lensConfiguratorCollection.relaxVersion = this._selectedRelaxVersion; //BS-2291
            lensConfiguratorCollection.visualPreferences = this._selectedVisualPreference;
            lensConfiguratorCollection.lensEdge = this._lensEdge;
            lensConfiguratorCollection.glazing = this._selectedGlazing;
            if (this._selectedAdditionalOption == null) {
                lensConfiguratorCollection.glassProduct = this._lensSchneiderSku;
            } else {
                lensConfiguratorCollection.glassProduct = this._glassProductSku;
            } //BS-1710
            lensConfiguratorCollection.blankCoating = this._blankCoatingSku;
            lensConfiguratorCollection.lensProductId = this._lensProductId;
            lensConfiguratorCollection.antireflectionId = this._vsAntireflectionId;
            lensConfiguratorCollection.hardCoatingId = this._vsHardcoatingId;
            lensConfiguratorCollection.optimisedFacetCutValue = this._facetCutChecked;
            if (this.isSgraving == true) {
                lensConfiguratorCollection.sGravingValue = this._sGravingChecked;
            } else {
                lensConfiguratorCollection.sGravingValue = false;
            } //BS-1796
            lensConfiguratorCollection.visionZoneAnalysisId = this._customValue; //BS-967
            lensConfiguratorCollection.hardCoatingSKU = this.appllicableHardCoatingSKU;
            lensConfiguratorCollection.antireflectionSKU = this.applicableAntiReflectionSKU;
            lensConfiguratorCollection.antireflectionProduct = this.applicableAntiReflectionProduct;
            lensConfiguratorCollection.hardCoatingProduct = this.appllicableHardCoatingProduct;
            lensConfiguratorCollection.withEvilEyeEdge = false;

            /* Start : BS-1612 */
            if (this._visionZoneResult) {
                lensConfiguratorCollection.visionZoneAnalysisResult = this._visionZoneResult;
            }

            lensConfiguratorCollection.visionZoneAnalysisResultData =
                this._visionZoneAnalysisDataWrapper !== undefined &&
                this._visionZoneAnalysisDataWrapper !== null &&
                this._visionZoneAnalysisDataWrapper.data !== undefined &&
                this._visionZoneAnalysisDataWrapper.data !== null
                    ? this._visionZoneAnalysisDataWrapper.data
                    : null;
            /* End : BS-1612 */

            if (this.progressiveLength) {
                lensConfiguratorCollection.progressionLengthLens = this.progressiveLength; //B2B_Progression_Length__c
            } else if (this.showProgressiveLength === false) {
                lensConfiguratorCollection.progressionLengthLens = null; //B2B_Progression_Length__c
            }
            lensConfiguratorCollection.lensColor = this.selectedColor;
            await updateLensConfiguratorData({
                lensConfiguratorId: this.lensConfiguratorId,
                fieldNameVsLensConfiguratorDataMap: lensConfiguratorCollection,
                language: LANG
            });
            this._isLoading = false;
            this.dispatchEvent(
                new CustomEvent(CONFIGURATOR_UPDATE, {
                    detail: {
                        lensSelectionCollection: this.lensSelectionCollection
                    }
                })
            );
        }
    }

    /**
     * This method is used to reset the collection of antireflection and hardcoating options
     * BS-1019
     *
     */
    resetUserSelectableOptionsCollection() {
        let parsedUserSelectableOptions = JSON.parse(JSON.stringify(this.userSelectableOptions));
        parsedUserSelectableOptions.forEach((option) => {
            if (this.categoryName == this.clip_in || this.lensConfiguratorCollection.selectedRXSolution === CLIPIN) {
                if (option.value == USER_SELECTION_YES) {
                    option.checked = true;
                } else {
                    option.checked = false;
                }
                option.disabled = true;
                this.isAntrireflectionSKUApplicable = true;
                this.isHardcoatingSKUApplicable = true;
                //BS-1355
            } else if (option.value == USER_SELECTION_YES) {
                option.disabled = false;
                option.checked = true;
                this.antireflectionCoatingValue = this.label.yesOptionLabel;
                this.isAntrireflectionSKUApplicable = true;
                this.isHardcoatingSKUApplicable = true;
            } else {
                option.disabled = false;
                option.checked = false;
            }
        });
        this.userSelectableOptions = [];
        this.userSelectableOptions = parsedUserSelectableOptions;
    }

    /**
     * Handles the change in Lens Type radio buttons.
     * BS-723
     */
    lensTypeChange(event) {
        if (this.selectedLensType !== event.target.value) {
            this.setCommonVariables(); //BS-2291
            this._selectedRelaxVersion = null;
            this._isVisionZoneAnalysisDisabled = false; //BS-967
            this.selectedLensType = event.target.value;
            this._showVisualPreferences = false;
            this._isPanoramaProgressiveOne = false;
            this._showAdditionalOptions = false;
            this._isLoading = true;
            if (this._isVsScreen == false) {
                this.resetUserSelectableOptionsCollection();
            }
            this.lensColorOptionsToShow = [];
            this.selectedIndex = null;
            this.selectedColor = null;
            this._showAntireflectionHardCoatingSelectionVs = false;
            this.progressiveLength = null;
            this._lensEdge = null;
            this._selectedVisualPreference = null;
            this.showLensColor = false; //BS-1648
            this._selectedVisualPreference = null; //BS-1780
            this.formatProducts();
            this.progressiveLength = null;
            if (this._isVsScreen == true && this._isOpticalGlazing == false) {
                this._showVsLensColor = true;
                this.showLensIndex = false;
            } else {
                this.showLensIndex = true;
            } //BS-2014
            this.showErrorMessageLensType = false;
            if (event.target.value === this.lensTypeOptions[0].value) {
                if (this.lensTypeOptions[0].checked === false) {
                    this.lensTypeOptions[0].checked = true;
                    this.lensTypeOptions[1].checked = false;
                    this.lensTypeOptions[2].checked = false;
                    this._showRelaxVersion = false;
                    if (this._isOpticalGlazing == true) {
                        this.lensTypeOptions[3].checked = false;
                        this.lensTypeOptions[4].checked = false;
                    }
                }
            } else if (event.target.value === this.lensTypeOptions[1].value) {
                if (this.lensTypeOptions[1].checked === false) {
                    this.lensTypeOptions[0].checked = false;
                    this.lensTypeOptions[1].checked = true;
                    this.lensTypeOptions[2].checked = false;
                    this._showRelaxVersion = true;
                    if (this._isOpticalGlazing == true) {
                        this.lensTypeOptions[3].checked = false;
                        this.lensTypeOptions[4].checked = false;
                    }
                }
            } else if (event.target.value === this.lensTypeOptions[2].value) {
                if (this.lensTypeOptions[2].checked === false) {
                    this.lensTypeOptions[0].checked = false;
                    this.lensTypeOptions[1].checked = false;
                    this.lensTypeOptions[2].checked = true;
                    this._showRelaxVersion = false;
                    if (this._isOpticalGlazing == true) {
                        this.lensTypeOptions[3].checked = false;
                        this.lensTypeOptions[4].checked = false;
                    }
                }
            } else if (this._isVsScreen == true && this._isOpticalGlazing == true && event.target.value === this.lensTypeOptions[3].value) {
                if (this.lensTypeOptions[3].checked === false) {
                    this.lensTypeOptions[0].checked = false;
                    this.lensTypeOptions[1].checked = false;
                    this.lensTypeOptions[3].checked = true;
                    this.lensTypeOptions[2].checked = false;
                    this.lensTypeOptions[4].checked = false;
                    this._showVisualPreferences = true;
                    this._isPanoramaProgressiveOne = true;
                    this._showRelaxVersion = false;
                }
            } else if (this._isVsScreen == true && this._isOpticalGlazing == true && event.target.value === this.lensTypeOptions[4].value) {
                if (this.lensTypeOptions[4].checked === false) {
                    this.lensTypeOptions[0].checked = false;
                    this.lensTypeOptions[1].checked = false;
                    this.lensTypeOptions[2].checked = false;
                    this.lensTypeOptions[3].checked = false;
                    this.lensTypeOptions[4].checked = true;
                    this._showLensDistance = true;
                    this._showRelaxVersion = false;
                }
            }

            if (this.label.panoramaProgressive === event.target.value || this._isPanoramaProgressiveOne == true) {
                this.isProgressiveLengthDisabled = true; //BS-1118
                this.showProgressiveLength = true; //BS-1118
                if (this._isVsScreen == false) {
                    this.progressiveLength = PROGRESSION_LENGTH_VALUE; //BS-1118
                    this.formatProgressiveLength = PROGRESSION_LENGTH_VALUE; //BS-1118
                }
            } else {
                this.showProgressiveLength = false; //BS-1118
                this.progressiveLength = null; //BS-1118
                this.isProgressiveLengthDisabled = false; //BS-1118
                this.formatProgressiveLength = null;
            }
            this.selectedLensType = event.target.value;
            this._isLoading = false;
        }
    }

    /**
     * Handles the change in Glazing radio buttons.
     * BS-1466
     */
    glazingChange(event) {
        if (this._selectedGlazing !== event.target.value) {
            this.setCommonVariables(); //BS_2291
            this.selectedLensType = null;
            this.showLensIndex = false;
            this._isLoading = true;
            this._showAdditionalOptions = false;
            this._showLensType = true;
            this.progressiveLength = null;
            this.selectedColor = null;
            this.selectedIndex = null;
            this._lensEdge = null;
            this._vsHardcoatingId = null;
            this._vsAntiReflectionOrHardCoating = null;
            this._vsAntireflectionId = null;
            this._showAntireflectionHardCoatingSelectionVs = false;
            this._showVisualPreferences = false;
            this.showErrorMessageLensType = false;
            this.showErrorMessageGlazing = false;
            this.showErrorMessageLensColor = false;
            this._selectedRelaxVersion = null;
            if (event.target.value === this.glazingOptions[0].value) {
                if (this.glazingOptions[0].checked === false) {
                    this.glazingOptions[0].checked = true;
                    this._selectedGlazing = this.glazingOptions[0].value;
                    this.glazingOptions[1].checked = false;
                    this._isOpticalGlazing = true;
                    this.categoryName = OPTICAL_GLAZING;
                    let lensType = [
                        { label: this.label.panoramaSingleVisionLabel, value: this.label.panoramaSingleVision, checked: false },
                        { label: this.label.panoramaRelaxLabel, value: this.label.panoramaRelaxLabel, checked: false },
                        { label: this.label.panoramaProgressiveLabel, value: this.label.panoramaProgressive, checked: false },
                        { label: this.label.panoramaProgressiveOneLabel, value: this.label.panoramaProgressiveOne, checked: false },
                        { label: this.label.panoramaOfficeRoomDeskLabel, value: this.label.panoramaProgressiveRoom, checked: false }
                    ];
                    this.lensTypeOptions = lensType;
                    this._sGravingFeatureAvailable = true; //BS-1935
                }
            } else {
                if (this.glazingOptions[1].checked === false) {
                    this.glazingOptions[0].checked = false;
                    this.glazingOptions[1].checked = true;
                    this._selectedGlazing = this.glazingOptions[1].value;
                    this._isOpticalGlazing = false;
                    this.categoryName = OPTICAL_SUN_GLAZING;
                    let lensType = [
                        { label: this.label.panoramaSingleVisionLabel, value: this.label.panoramaSingleVision, checked: false },
                        { label: this.label.panoramaProgressiveLabel, value: this.label.panoramaProgressive, checked: false }
                    ];
                    this.lensTypeOptions = lensType;
                    this._sGravingFeatureAvailable = false; //BS-1935
                }
            }
            this._isLoading = false;
            this.getLensProducts();
        }
    }
    setCommonVariables() {
        this.fromConnectedCallback = false;
        this._showLensDetails = false;
        this.showProgressiveLength = false;
        this._showVsLensColor = false;
        this._showBlueSensation = false;
        this._showPhotoSensation = false;
        this._showLensDistance = false;
        this._showLensEdge = false;
        this._showAntireflectionHardCoatingSelection = false;
        this.lensIndex = null;
        this.lensColor = null;
        this._lensEdge = null;
        this.productSku = null;
        this.productMaterial = null;
        this._photoSensation = null;
        this._blueSensation = null;
        this._photoSensationId = null;
        this._blueSensationId = null;
        this._blankCoatingSku = null;
        this._glassProductSku = null;
        this._lensColorId = null;
        this.formatProgressiveLength = null;
        this._customValue = null;
        this._showVisionZoneAnalysisSurveyCompletionError = false; //BS-1612
        this._showVisionZoneAnalysisCodeInvalidError = false; //BS-1815
        this._showVisionZoneAnalysisCallOutError = false; //BS-1815
        this._lensDistance = null;
        this._lensSchneiderSku = null; //BS-1710
        this._selectedAdditionalOption = null; //BS-1710
        this.visualPreferences.forEach((option) => {
            option.checked = false;
        }); //BS-1780
        this.template.querySelectorAll('lightning-combobox').forEach((each) => {
            each.value = undefined;
        });
        this.showErrorMessageLensIndex = false;
        this.showErrorMessageAdditionalOption = false;
        this.showErrorMessagePhotoSensation = false;
        this.showErrorMessageBlueSensation = false;
        this.showErrorMessageLensEdge = false;
        this.showErrorMessageVisualPreference = false;
        this.showErrorMessageLensDistance = false;
        this.showErrorMessageLensProgLength = false;
        this.showErrorMessageProgressionLength = false; //BS-1881
        this.showErrorMessageRelaxVersion = false; //BS-2291
    }

    /**
     * Handles the change in additional options radio buttons.
     * BS-1466
     */
    additionalOptionChange(event) {
        if (this._selectedAdditionalOption !== event.target.value) {
            this._selectedAdditionalOption = event.target.value;
            this._photoSensation = null;
            this._blueSensation = null;
            this._photoSensationId = null;
            this._blueSensationId = null;
            this._blankCoatingSku = null;
            this._glassProductSku = null;
            this._lensColorId = null;
            this.lensColor = null;
            this.selectedColor = null;
            this.showErrorMessageAdditionalOption = false;
            this.showErrorMessageLensColor = false;
            this.showErrorMessagePhotoSensation = false;
            this.showErrorMessageBlueSensation = false;
            this.additionalOptions.forEach((option) => {
                if (option.value == event.target.value) {
                    option.checked = true;
                } else {
                    option.checked = false;
                }
            });
            if (event.target.value === LENS_COLOR) {
                this._showVsLensColor = true;
                this._showPhotoSensation = false;
                this._showBlueSensation = false;
                //BS-1648 start
                if (this.lensColorOptionsToShow && this.lensColorOptionsToShow.length == 1) {
                    this.lensColor = this.lensColorOptionsToShow[0].value;
                    this.showErrorMessageLensColor = false;
                    this.selectedColor = this.lensColorOptionsToShow[0].label;
                    this._lensColorId = this.lensColorOptionsToShow[0].value;
                    this._glassProductSku =
                        this.lensColorOptionsToShow[0].lensSchneiderSku != undefined ? this.lensColorOptionsToShow[0].lensSchneiderSku : null;
                    this._blankCoatingSku = this.lensColorOptionsToShow[0].schneiderSku != undefined ? this.lensColorOptionsToShow[0].schneiderSku : null;
                } //BS-1648 end
            }
            if (event.target.value === PHOTO_SENSATION) {
                this._showVsLensColor = false;
                this._showPhotoSensation = true;
                this._showBlueSensation = false;
                //BS-1648 start
                if (this._photoSensationOptionsToShow && this._photoSensationOptionsToShow.length == 1) {
                    this._photoSensation = this._photoSensationOptionsToShow[0].value;
                    this._photoSensationId = this._photoSensationOptionsToShow[0].value;
                    this.showErrorMessagePhotoSensation = false;
                    this._glassProductSku =
                        this._photoSensationOptionsToShow[0].schneiderSku != undefined ? this._photoSensationOptionsToShow[0].schneiderSku : null;
                } //BS-1648 end
            }

            if (event.target.value === BLUE_SENSATION) {
                this._showVsLensColor = false;
                this._showPhotoSensation = false;
                this._showBlueSensation = true;
                //BS-1648 start
                if (this._blueSensationOptionsToShow && this._blueSensationOptionsToShow.length == 1) {
                    this.showErrorMessageBlueSensation = false;
                    this._blueSensation = this._blueSensationOptionsToShow[0].value;
                    this._blueSensationId = this._blueSensationOptionsToShow[0].value;
                    this._glassProductSku =
                        this._blueSensationOptionsToShow[0].schneiderSku != undefined ? this._blueSensationOptionsToShow[0].schneiderSku : null;
                } //BS-1648 end
            }
        } else {
            this.additionalOptions.forEach((option) => {
                option.checked = false;
            });
            this._showVsLensColor = false;
            this._showPhotoSensation = false;
            this._showBlueSensation = false;
            this._selectedAdditionalOption = null;
            this._photoSensation = null;
            this._blueSensation = null;
            this._photoSensationId = null;
            this._blueSensationId = null;
            this._blankCoatingSku = null;
            this._glassProductSku = null;
            this._lensColorId = null;
            this.lensColor = null;
            this.selectedColor = null;
            this.showErrorMessageAdditionalOption = false;
            this.showErrorMessageLensColor = false;
            this.showErrorMessagePhotoSensation = false;
            this.showErrorMessageBlueSensation = false;
        } //BS-1710 added else block to unselect option.
    }

    /**
     * Handles the change in visual Preferences radio buttons.
     * BS-1466
     */
    visualPreferencesChange(event) {
        this._showVisionZoneId = false; //BS-967
        this._showVisionZoneIdError = false; //BS-967
        if (this._selectedVisualPreference !== event.target.value) {
            this.showErrorMessageVisualPreference = false;
            this._visionZoneResult = null;
            this._selectedVisualPreference = event.target.value;
            if (event.target.value === this.visualPreferences[0].value) {
                this._isVisionZoneAnalysisDisabled = true; //BS-967
                this._customValue = null; //BS-967
                this._visionZoneResult = B2B_VISUAL_PREFERENCE_VALUES.split(',')[0];
                this._showVisionZoneAnalysisSurveyCompletionError = false; //BS-1612
                this._showVisionZoneAnalysisCodeInvalidError = false; //BS-1815
                this._showVisionZoneAnalysisCallOutError = false; //BS-1815
                this.visualPreferences[0].checked = true;
                this.visualPreferences[1].checked = false;
                this.visualPreferences[2].checked = false;
                this.visualPreferences[3].checked = false;
                this.visualPreferences[4].checked = false;
            } else if (event.target.value === this.visualPreferences[1].value) {
                this._isVisionZoneAnalysisDisabled = true; //BS-967
                this._customValue = null; //BS-967
                this._visionZoneResult = B2B_VISUAL_PREFERENCE_VALUES.split(',')[1];
                this._showVisionZoneAnalysisSurveyCompletionError = false; //BS-1612
                this._showVisionZoneAnalysisCodeInvalidError = false; //BS-1815
                this._showVisionZoneAnalysisCallOutError = false; //BS-1815
                this.visualPreferences[0].checked = false;
                this.visualPreferences[1].checked = true;
                this.visualPreferences[2].checked = false;
                this.visualPreferences[3].checked = false;
                this.visualPreferences[4].checked = false;
            } else if (event.target.value === this.visualPreferences[2].value) {
                this._isVisionZoneAnalysisDisabled = true; //BS-967
                this._customValue = null; //BS-967
                this._visionZoneResult = B2B_VISUAL_PREFERENCE_VALUES.split(',')[2];
                this._showVisionZoneAnalysisSurveyCompletionError = false; //BS-1612
                this._showVisionZoneAnalysisCodeInvalidError = false; //BS-1815
                this._showVisionZoneAnalysisCallOutError = false; //BS-1815
                this.visualPreferences[0].checked = false;
                this.visualPreferences[1].checked = false;
                this.visualPreferences[2].checked = true;
                this.visualPreferences[3].checked = false;
                this.visualPreferences[4].checked = false;
            } else if (event.target.value === this.visualPreferences[3].value) {
                this._isVisionZoneAnalysisDisabled = true; //BS-967
                this._customValue = null; //BS-967
                this._visionZoneResult = B2B_VISUAL_PREFERENCE_VALUES.split(',')[3];
                this._showVisionZoneAnalysisSurveyCompletionError = false; //BS-1612
                this._showVisionZoneAnalysisCodeInvalidError = false; //BS-1815
                this._showVisionZoneAnalysisCallOutError = false; //BS-1815
                this.visualPreferences[0].checked = false;
                this.visualPreferences[1].checked = false;
                this.visualPreferences[2].checked = false;
                this.visualPreferences[3].checked = true;
                this.visualPreferences[4].checked = false;
            } else if (event.target.value === this.visualPreferences[4].value) {
                this._isVisionZoneAnalysisDisabled = false; //BS-967
                this.visualPreferences[0].checked = false;
                this.visualPreferences[1].checked = false;
                this.visualPreferences[2].checked = false;
                this.visualPreferences[3].checked = false;
                this.visualPreferences[4].checked = true;
            }
        }
        this._showVisionZoneId = true; //BS-967
    }

    /**
     * Handles the change in Lens Index dropdown.
     * BS-723
     */
    handleIndexOptionsChange(event) {
        //Added some checks as part of BS-1466
        this.fromConnectedCallback = false; //BS-1584
        this.showErrorMessageAdditionalOption = false;
        this.showErrorMessagePhotoSensation = false;
        this.showErrorMessageBlueSensation = false;
        this.showErrorMessageLensEdge = false;
        this.showErrorMessageLensColor = false;
        this.showErrorMessageLensIndex = false;
        if (this._isVsScreen == false) {
            this.resetUserSelectableOptionsCollection();
        }
        if (this._isVsScreen == false) {
            if ((this.categoryName == ADAPTER || this.categoryName == DIRECT_GLAZING) && this.lensColorOptionsToShow) {
                this.showLensColor = true;
            } else {
                this.showLensColor = false;
            }

            this.lensColor = null;
            this.selectedColor = null;
            this.showErrorMessageForAntireflectionOrHardcoatingOptions = false;
            this._isLoading = true;
            this.lensIndex = event.target.value;
            this.selectedIndex = event.target.options.find((iterator) => iterator.value === event.detail.value).label;
            this.lensColorOptionsToShow = this.lensIndexOptions.find((iterator) => iterator.label === this.selectedIndex).color;

            if (this.categoryName == this.clip_in || this.lensConfiguratorCollection.selectedRXSolution === CLIPIN) {
                this._showAntireflectionHardCoatingSelection = true;
                this.selectedSKU = event.target.options.find((iterator) => iterator.value === event.detail.value).value;
                this.productMaterial = this.lensIndexOptions.find((opt) => opt.label === this.selectedIndex).material;
            } else {
                this._showAntireflectionHardCoatingSelection = false;
                this.selectedSKU = null;
                this.productMaterial = null;
            }
            this._isLoading = false;
        } else if (this._isOpticalGlazing == true) {
            this._isLoading = true;
            this._showVsLensColor = false;
            this._showPhotoSensation = false;
            this._showBlueSensation = false;
            this.selectedIndex = event.target.options.find((iterator) => iterator.value === event.detail.value).label;
            this.selectedSKU = event.target.options.find((iterator) => iterator.value === event.detail.value).value;
            this.productMaterial = this.lensIndexOptions.find((opt) => opt.label === this.selectedIndex).material;
            this._lensSchneiderSku = this.lensIndexOptions.find((opt) => opt.label === this.selectedIndex).schneiderSku; //BS-1710
            if (this.selectedSKU) {
                this.getCommerceLinkData();
            }
            if (this.productMaterial) {
                this._showLensDetails = true;
            }
        } else {
            this.selectedIndex = event.target.options.find((iterator) => iterator.value === event.detail.value).label;
            this.selectedSKU = event.target.options.find((iterator) => iterator.value === event.detail.value).value;
            this.productMaterial = this.sunGlazingLensIndexOptionsToShow.find((opt) => opt.label === this.selectedIndex).material;
            this._lensSchneiderSku = this.sunGlazingLensIndexOptionsToShow.find((opt) => opt.label === this.selectedIndex).schneiderSku; //BS-1710
            if (this.productMaterial) {
                this._showLensDetails = true;
            }
        } //BS-2014
    }

    /**
     * Handles the change in Lens Color dropdown.
     * BS-723
     */
    handleColorOptionsChange(event) {
        if (this._isVsScreen == false) {
            this.resetUserSelectableOptionsCollection();
        }
        this.showErrorMessageForAntireflectionOrHardcoatingOptions = false;
        this._showAntireflectionHardCoatingSelection = true;
        this.lensColor = event.detail.value;
        this.showErrorMessageLensColor = false;
        this.selectedColor = event.target.options.find((iterator) => iterator.value === event.detail.value).label;
        if (this._isVsScreen == true) {
            if (this._isOpticalGlazing == true) {
                //BS-1466
                this._lensColorId = event.target.value;
                this._glassProductSku =
                    event.target.options.find((iterator) => iterator.value === event.detail.value).lensSchneiderSku != undefined
                        ? event.target.options.find((iterator) => iterator.value === event.detail.value).lensSchneiderSku
                        : null;
                this._blankCoatingSku =
                    event.target.options.find((iterator) => iterator.value === event.detail.value).schneiderSku != undefined
                        ? event.target.options.find((iterator) => iterator.value === event.detail.value).schneiderSku
                        : null;
            } else {
                this._showLensDetails = false;
                this.showLensIndex = true;
                this.sunGlazingLensIndexOptionsToShow = this.sunGlazingLensColorOptions.find((iterator) => iterator.label === this.selectedColor).index;
                if (this.sunGlazingLensIndexOptionsToShow != null && this.sunGlazingLensIndexOptionsToShow.length === 1) {
                    this.selectedIndex = this.sunGlazingLensIndexOptionsToShow[0].label;
                    this.lensIndex = this.sunGlazingLensIndexOptionsToShow.find((iterator) => iterator.label === this.selectedIndex).value;
                    this.showLensIndex = true;
                    this._lensSchneiderSku = this.sunGlazingLensIndexOptionsToShow.find((iterator) => iterator.label === this.selectedIndex).schneiderSku;
                    this.selectedSKU = this.lensIndex;
                    this.productMaterial = this.sunGlazingLensIndexOptionsToShow.find((opt) => opt.label === this.selectedIndex).material;
                    if (this.productMaterial) {
                        this._showLensDetails = true;
                    }
                }
            } //BS-2014
        } else {
            this.selectedSKU = event.target.value;
            this.productMaterial = event.target.options.find((iterator) => iterator.value === event.detail.value).material;
        }
    }

    /**
     * Handles the change in Lens edge dropdown.
     * BS-1466
     */
    handleLensEdgeChange(event) {
        this.showErrorMessageLensEdge = false;
        this._lensEdge = event.detail.value;
    }

    /**
     * Handles the change in photo sensation dropdown.
     * BS-1466
     */
    handlePhotoSensationChange(event) {
        this._photoSensation = event.detail.value;
        this._photoSensationId = event.target.value;
        this.showErrorMessagePhotoSensation = false;
        this._glassProductSku =
            event.target.options.find((iterator) => iterator.value === event.detail.value).schneiderSku != undefined
                ? event.target.options.find((iterator) => iterator.value === event.detail.value).schneiderSku
                : null;
    }

    /**
     * Handles the change in blue sensation dropdown.
     * BS-1466
     */
    handleblueSensationChange(event) {
        this.showErrorMessageBlueSensation = false;
        this._blueSensation = event.detail.value;
        this._blueSensationId = event.target.value;
        this._glassProductSku =
            event.target.options.find((iterator) => iterator.value === event.detail.value).schneiderSku != undefined
                ? event.target.options.find((iterator) => iterator.value === event.detail.value).schneiderSku
                : null;
    }

    /**
     * Handles the change in lens distance dropdown.
     * BS-1466
     */
    handleLensDistanceChange(event) {
        this.showErrorMessageLensDistance = false;
        this._lensDistance = event.detail.value;
    }

    /**
     * Handles the change in custom input value.
     * BS-1466
     */
    handleCustomInputValue(event) {
        this._showVisionZoneId = true; //BS-1780 start
        this._showVisionZoneIdError = false;
        this.showErrorMessageVisualPreference = false;
        this._visionZoneResult = null;
        this._selectedVisualPreference = this.visualPreferences[4].value;
        this._isVisionZoneAnalysisDisabled = false;
        this.visualPreferences[0].checked = false;
        this.visualPreferences[1].checked = false;
        this.visualPreferences[2].checked = false;
        this.visualPreferences[3].checked = false;
        this.visualPreferences[4].checked = true; //BS-1780 end
        this._customValue = event.detail.value;
    }

    /**
     * Handles the change in Lens progressive Length iput field.
     * BS-723
     */
    handleProgressionLengthInputChange(event) {
        this.showErrorMessageLensProgLength = false;
        this.formatProgressiveLength = event.target.value;

        // Validate the input to ensure it's a valid decimal number
        if (/^[0-9]*([.,][0-9]*)?$/.test(this.formatProgressiveLength)) {
            this.progressiveLength = this.formatProgressiveLength;
        } else {
            // If the input is not valid, reset the input value to the previous value
            this.formatProgressiveLength = null;
            event.target.value = null;
        }
        if (this.formatProgressiveLength == '') {
            this.formatProgressiveLength = null;
        } //BS-1881
    }

    //BS-1881 added validation on Progression length field
    progressionValidation(event) {
        if (
            this.formatProgressiveLength != null &&
            (this.formatProgressiveLength.replace(',', '.') < 14 || this.formatProgressiveLength.replace(',', '.') > 18)
        ) {
            this.showErrorMessageProgressionLength = true;
        } else {
            this.showErrorMessageProgressionLength = false;
        }
    }

    /**
     * Updates the data in Lens Configurator record and is invoked from the b2b_vs_rx_container.
     * BS-723
     */
    @api
    async handleLensSelectionDataUpdate() {
        this._isLoading = true;
        let saveData = false;
        this.lensSelectionCollection.lensType = this.selectedLensType; //B2B_Lens_Type__c
        this.lensSelectionCollection.lensIndex = this.selectedIndex; //B2B_Lens_Index__c
        this.lensSelectionCollection.lensSKU = this.selectedSKU; //B2B_Selected_Lens_SKU__c
        this.lensSelectionCollection.productMaterial = this.productMaterial;
        if (this._isVsScreen == true) {
            this.lensSelectionCollection.lensColorId = this._lensColorId;
            this.lensSelectionCollection.photoSensationId = this._photoSensationId;
            this.lensSelectionCollection.blueSensationId = this._blueSensationId;
            this.lensSelectionCollection.lensDistance = this._lensDistance;
            this.lensSelectionCollection.relaxVersion = this._selectedRelaxVersion;
            this.lensSelectionCollection.visualPreferences = this._selectedVisualPreference;
            this.lensSelectionCollection.lensEdge = this._lensEdge;
            this.lensSelectionCollection.glazing = this._selectedGlazing;
            this.lensSelectionCollection.glassProduct = this._glassProductSku;
            this.lensSelectionCollection.blankCoating = this._blankCoatingSku;
            this.lensSelectionCollection.lensProductId = this._lensProductId;
            this.lensSelectionCollection.antireflectionId = this._vsAntireflectionId;
            this.lensSelectionCollection.hardCoatingId = this._vsHardcoatingId;
            this.lensSelectionCollection.optimisedFacetCutValue = this._facetCutChecked;
            if (this.isSgraving == true) {
                this.lensSelectionCollection.sGravingValue = this._sGravingChecked;
            } else {
                this.lensSelectionCollection.sGravingValue = false;
            } //BS-1796
        }

        if (this.progressiveLength !== null && this.progressiveLength !== undefined) {
            this.lensSelectionCollection.progressionLengthLens = this.progressiveLength; //B2B_Progression_Length__c
        } else if (this.showProgressiveLength === false) {
            this.lensSelectionCollection.progressionLengthLens = null; //B2B_Progression_Length__c
        }
        this.lensSelectionCollection.lensColor = this.selectedColor; //B2B_Progression_Length__c
        //BS-1355
        if (this.isAntrireflectionSKUApplicable == true && this.isHardcoatingSKUApplicable == true) {
            this.lensSelectionCollection.isAntireflectionHardcoating = true;
        } else {
            this.lensSelectionCollection.isAntireflectionHardcoating = false;
        }

        //BS-1019
        let isAntireflectionOrHardcoatingOptionSelected = false;
        if (this._isVsScreen == false) {
            this.userSelectableOptions.forEach((option) => {
                if (option.checked != null && option.checked != undefined && option.checked == true) {
                    isAntireflectionOrHardcoatingOptionSelected = true;
                }
            });
        }
        let whiteSpaceOnlyRegex = /^\s*$/;

        /* Start : BS-1612 */
        if (
            this._isVsScreen === true &&
            this._showVisualPreferences === true &&
            this._selectedVisualPreference !== undefined &&
            this._selectedVisualPreference !== null &&
            this._selectedVisualPreference === CUSTOM &&
            this._customValue !== undefined &&
            this._customValue !== null &&
            whiteSpaceOnlyRegex.test(this._customValue) === false
        ) {
            await getVisionZoneAnalysisStatus(this._customValue, this.effectiveAccountId, this.lensConfiguratorId)
                .then((wrapperData) => {
                    if (wrapperData !== undefined && wrapperData !== null) {
                        this._visionZoneAnalysisDataWrapper = JSON.parse(JSON.stringify(wrapperData));
                        this._visionZoneResult = wrapperData.result;
                        if (wrapperData.showError == true && wrapperData.isSurveyIncomplete == true) {
                            this._showVisionZoneAnalysisSurveyCompletionError = wrapperData.showError;
                            this._showVisionZoneAnalysisCodeInvalidError = false;
                            this._showVisionZoneAnalysisCallOutError = false;
                        } else if (wrapperData.showError == true && wrapperData.invalidCode == true) {
                            this._showVisionZoneAnalysisCodeInvalidError = wrapperData.showError;
                            this._showVisionZoneAnalysisSurveyCompletionError = false;
                            this._showVisionZoneAnalysisCallOutError = false;
                        } else if (wrapperData.showError == true && wrapperData.calloutError == true) {
                            this._showVisionZoneAnalysisCallOutError = true;
                            this._showVisionZoneAnalysisCodeInvalidError = false;
                            this._showVisionZoneAnalysisSurveyCompletionError = false;
                        } else {
                            this._showVisionZoneAnalysisCodeInvalidError = false;
                            this._showVisionZoneAnalysisSurveyCompletionError = false;
                            this._showVisionZoneAnalysisCallOutError = false;
                        } //BS-1815
                    } else if (wrapperData !== undefined || wrapperData !== null) {
                        showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
                    }
                })
                .catch((errorInstance) => {
                    showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
                    this._isVisionZoneSurveyPopulated = false;
                });
        }
        /* End : BS-1612 */

        //BS-1466
        if (this._isVsScreen == false) {
            if (
                isAntireflectionOrHardcoatingOptionSelected == true &&
                this.selectedLensType !== undefined &&
                this.selectedLensType !== null &&
                (this.showLensIndex === false || (this.lensIndex !== undefined && this.lensIndex !== null)) &&
                (this.lensColor != null ||
                    this.lensColor != undefined ||
                    this.categoryName == this.clip_in ||
                    this.lensConfiguratorCollection.selectedRXSolution === CLIPIN) &&
                (this.showProgressiveLength === false ||
                    (this.formatProgressiveLength !== undefined && this.formatProgressiveLength !== null && this.formatProgressiveLength !== null))
            ) {
                this.fetchSchneiderSKU(this.lensSelectionCollection); // BS-1019
                this.showErrorMessageLensType = false;
                this.showErrorMessageForAntireflectionOrHardcoatingOptions = false;
                this.showErrorMessageLensIndex = false;
                this.showErrorMessageLensProgLength = false;
                this.showErrorMessageLensColor = false;

                saveData = true;
            }
        } else if (
            this._isVsScreen == true &&
            this._selectedGlazing != null &&
            this._showLensType === true &&
            this.selectedLensType &&
            this.showLensIndex === true &&
            this.selectedIndex &&
            /*Start : BS-967 */
            (this._showVisualPreferences === false || (this._selectedVisualPreference !== undefined && this._selectedVisualPreference !== null)) &&
            (this._showVisualPreferences === false ||
                (this._selectedVisualPreference !== undefined &&
                    this._selectedVisualPreference !== null &&
                    ((this._selectedVisualPreference === CUSTOM &&
                        this._customValue !== undefined &&
                        this._customValue !== null &&
                        whiteSpaceOnlyRegex.test(this._customValue) === false) ||
                        this._selectedVisualPreference !== CUSTOM))) &&
            /*End : BS-967 */
            this._showVisionZoneAnalysisSurveyCompletionError === false &&
            this._showVisionZoneAnalysisCodeInvalidError === false &&
            this._showVisionZoneAnalysisCallOutError === false &&
            this._isVisionZoneSurveyPopulated === true &&
            (this.showProgressiveLength === false ||
                (this.formatProgressiveLength !== undefined &&
                    this.formatProgressiveLength !== null &&
                    this.formatProgressiveLength.replace(',', '.') >= 14 &&
                    this.formatProgressiveLength.replace(',', '.') <= 18)) &&
            (this._showVsLensColor === false || this.selectedColor) &&
            (this._showPhotoSensation === false || this._photoSensation) &&
            (this._showBlueSensation === false || this._blueSensation) &&
            (this._showLensDistance === false || this._lensDistance) &&
            (this._showRelaxVersion === false || this._selectedRelaxVersion)
        ) {
            this.fetchSchneiderSKU(this.lensSelectionCollection);
            this.showErrorMessageLensType = false;
            this.showErrorMessageForAntireflectionOrHardcoatingOptions = false;
            this.showErrorMessageLensIndex = false;
            this.showErrorMessageLensProgLength = false;
            this.showErrorMessageProgressionLength = false; //BS-1881
            this.showErrorMessageLensColor = false;
            this.showErrorMessageGlazing = false;
            this.showErrorMessageAdditionalOption = false;
            this.showErrorMessagePhotoSensation = false;
            this.showErrorMessageBlueSensation = false;
            this.showErrorMessageLensEdge = false;
            this.showErrorMessageVisualPreference = false;
            this.showErrorMessageLensDistance = false;
            this.showErrorMessageRelaxVersion = false;

            saveData = true;
        }

        if (saveData == false) {
            if (this.selectedLensType === undefined || this.selectedLensType === null) {
                this.showErrorMessageLensType = true;
            } else {
                this.showErrorMessageLensType = false;
            }

            if (this.selectedIndex === undefined || this.selectedIndex === null) {
                this.showErrorMessageLensIndex = true;
            } else {
                this.showErrorMessageLensIndex = false;
            }
            if (this._selectedRelaxVersion === undefined || this._selectedRelaxVersion === null) {
                this.showErrorMessageRelaxVersion = true;
            } else {
                this.showErrorMessageRelaxVersion = false;
            }
            if (this._isVsScreen == false) {
                if (this.showLensColor == true && (this.lensColor === undefined || this.lensColor === null || this.lensColor === null)) {
                    this.showErrorMessageLensColor = true;
                } else {
                    this.showErrorMessageLensColor = false;
                }

                if (this.formatProgressiveLength === undefined || this.formatProgressiveLength === null || this.formatProgressiveLength == null) {
                    this.showErrorMessageLensProgLength = true;
                } else {
                    this.showErrorMessageLensProgLength = false;
                }
                this._isLoading = false;
            } else if (this._isVsScreen == true) {
                if (this.formatProgressiveLength === undefined || this.formatProgressiveLength === null) {
                    this.showErrorMessageLensProgLength = true;
                } else {
                    this.showErrorMessageLensProgLength = false;
                }
                if (
                    this.formatProgressiveLength != null &&
                    (this.formatProgressiveLength.replace(',', '.') < 14 || this.formatProgressiveLength.replace(',', '.') > 18)
                ) {
                    this.showErrorMessageProgressionLength = true;
                } else {
                    this.showErrorMessageProgressionLength = false;
                } //BS-1881
                if (this._selectedGlazing === undefined || this._selectedGlazing === null) {
                    this.showErrorMessageGlazing = true;
                } else {
                    this.showErrorMessageGlazing = false;
                }
                if (this.selectedColor === undefined || this.selectedColor === null) {
                    this.showErrorMessageLensColor = true;
                } else {
                    this.showErrorMessageLensColor = false;
                }
                if (this._photoSensation === undefined || this._photoSensation === null) {
                    this.showErrorMessagePhotoSensation = true;
                } else {
                    this.showErrorMessagePhotoSensation = false;
                }
                if (this._blueSensation === undefined || this._blueSensation === null) {
                    this.showErrorMessageBlueSensation = true;
                } else {
                    this.showErrorMessageBlueSensation = false;
                }
                if (this._lensEdge === undefined || this._lensEdge === null) {
                    this.showErrorMessageLensEdge = true;
                } else {
                    this.showErrorMessageLensEdge = false;
                }
                if (this._selectedVisualPreference === undefined || this._selectedVisualPreference === null) {
                    this.showErrorMessageVisualPreference = true;
                } else {
                    this.showErrorMessageVisualPreference = false;
                }
                if (this._lensDistance === undefined || this._lensDistance === null) {
                    this.showErrorMessageLensDistance = true;
                } else {
                    this.showErrorMessageLensDistance = false;
                }
                /* Start : BS-967 */
                if (
                    this._showVisualPreferences === true &&
                    this._selectedVisualPreference &&
                    this._selectedVisualPreference === CUSTOM &&
                    (this._customValue === undefined || this._customValue === null || whiteSpaceOnlyRegex.test(this._customValue) === true)
                ) {
                    this._showVisionZoneIdError = true;
                } else {
                    this._showVisionZoneIdError = false;
                }
                /* End : BS-967 */
                this._isLoading = false;
            }
            //BS-1019
            if (isAntireflectionOrHardcoatingOptionSelected != null && isAntireflectionOrHardcoatingOptionSelected != undefined) {
                this.showErrorMessageForAntireflectionOrHardcoatingOptions = true;
            } else {
                this.showErrorMessageForAntireflectionOrHardcoatingOptions = false;
            }
            //BS-1019
        }
        return saveData;
    }

    /**
     * Gets the products(lens) related to the given category.
     * BS-723
     */
    async getLensProducts() {
        //BS-1132
        let selectedFrameSKU = null;
        if (
            this.categoryName != null &&
            this.categoryName != undefined &&
            (this.categoryName == ADAPTER ||
                this.categoryName == DIRECT_GLAZING ||
                this.categoryName == OPTICAL_SUN_GLAZING ||
                this.categoryName == OPTICAL_GLAZING)
        ) {
            selectedFrameSKU =
                this.lensConfiguratorCollection.selectedFrameSKU != null && this.lensConfiguratorCollection.selectedFrameSKU != undefined
                    ? this.lensConfiguratorCollection.selectedFrameSKU
                    : null;
        } else {
            selectedFrameSKU = null;
        }
        //BS-1132
        this.productsResult = await getAvailableLensProducts({
            categoryName: this.categoryName,
            selectedFrameSKU: selectedFrameSKU,
            pageSource: this.pageSource
        });
        this.formatProducts();
    }

    /* BS-723*/
    formatProducts() {
        this.lensIndexOptions = [];
        this.lensColorOptions = [];
        this.lensColorOptionsToShow = [];
        this.productMaterial = null;
        this.lensIndex = null;
        this.lensColor = null;
        this.selectedSKU = null;
        this.showLensColor = false;
        this.sunGlazingLensColorOptions = [];
        this.sunGlazingLensIndexOptions = [];
        this.sunGlazingLensIndexOptionsToShow = [];

        if (this._isVsScreen !== true && this.lensConfiguratorCollection.lensType && this.fromConnectedCallback === true) {
            this.selectedLensType = this.lensConfiguratorCollection.lensType;
        }

        if (this.productsResult && this.selectedLensType) {
            this.lensProductDetails = this.productsResult;
            let addToLensIndexOptions = true;
            let addToLensColorOptions = true;
            this.lensProductDetails.forEach((element) => {
                if (
                    element.Product.B2B_Availability_JSON__c !== undefined &&
                    checkProductAvailability(element.Product.B2B_Availability_JSON__c, this.countryCode) == false
                ) {
                    if (this._isVsScreen == true && this._isOpticalGlazing == false) {
                        if (element.Product.Description && element.Product.B2B_Lens_Type__c === this.selectedLensType) {
                            addToLensColorOptions = true;
                            this.sunGlazingLensColorOptions.forEach((record) => {
                                if (record.label == element.Product.Description) {
                                    addToLensColorOptions = false;
                                }
                            });

                            if (addToLensColorOptions == true) {
                                this.sunGlazingLensColorOptions = [
                                    ...this.sunGlazingLensColorOptions,
                                    {
                                        label: element.Product.Description,
                                        value: element.Product.StockKeepingUnit,
                                        material: element.Product.B2B_Material__c,
                                        index: []
                                    }
                                ];
                            }
                        }
                        if (element.Product.B2B_Lens_Index__c && element.Product.B2B_Lens_Type__c === this.selectedLensType) {
                            this.sunGlazingLensIndexOptions = [
                                ...this.sunGlazingLensIndexOptions,
                                {
                                    label: element.Product.B2B_Lens_Index__c,
                                    value: element.Product.StockKeepingUnit,
                                    material: element.Product.B2B_Material__c,
                                    schneiderSku: element.Product.B2B_Schneider_SKU__c,
                                    color: element.Product.Description
                                }
                            ];
                        } //BS-2014
                    } else {
                        if (element.Product.B2B_Lens_Index__c && element.Product.B2B_Lens_Type__c === this.selectedLensType) {
                            addToLensIndexOptions = true;

                            this.lensIndexOptions.forEach((record) => {
                                if (record.label == element.Product.B2B_Lens_Index__c) {
                                    addToLensIndexOptions = false;
                                }
                            });

                            if (addToLensIndexOptions == true) {
                                this.lensIndexOptions = [
                                    ...this.lensIndexOptions,
                                    {
                                        label: element.Product.B2B_Lens_Index__c,
                                        value: element.Product.StockKeepingUnit,
                                        material: element.Product.B2B_Material__c,
                                        schneiderSku: element.Product.B2B_Schneider_SKU__c,
                                        color: []
                                    }
                                ];
                            }
                        }
                        if (element.Product.Description && element.Product.B2B_Lens_Type__c === this.selectedLensType) {
                            this.lensColorOptions = [
                                ...this.lensColorOptions,
                                {
                                    label: element.Product.Description,
                                    value: element.Product.StockKeepingUnit,
                                    index: element.Product.B2B_Lens_Index__c,
                                    material: element.Product.B2B_Material__c
                                }
                            ];
                        }
                    }
                }
            });
            //BS-1845
            if (this.showLensEdgeData) {
                this._showLensEdge = true;
                this.showErrorMessageLensEdge = false;
                this.getLensShapeDataForLensEdge();
            } else {
                this._showLensEdge = false;
            }
        }
        //BS-2014
        if (this._isVsScreen == true && this._isOpticalGlazing == false && this.sunGlazingLensIndexOptions) {
            this.sunGlazingLensIndexOptions.forEach((record) => {
                if (this.sunGlazingLensColorOptions.find((iterator) => iterator.label === record.color).index !== undefined) {
                    this.sunGlazingLensColorOptions.find((iterator) => iterator.label === record.color).index = [
                        ...this.sunGlazingLensColorOptions.find((iterator) => iterator.label === record.color).index,
                        { label: record.label, value: record.value, material: record.material, schneiderSku: record.schneiderSku }
                    ];
                }
            });
        } else if (this.lensColorOptions) {
            this.lensColorOptions.forEach((record) => {
                if (this.lensIndexOptions.find((iterator) => iterator.label === record.index).color !== undefined) {
                    this.lensIndexOptions.find((iterator) => iterator.label === record.index).color = [
                        ...this.lensIndexOptions.find((iterator) => iterator.label === record.index).color,
                        { label: record.label, value: record.value, material: record.material }
                    ];
                }
            });
        }
        //BS-1648 start
        if (this.fromConnectedCallback != true && this._isOpticalGlazing == true && this.lensIndexOptions && this.lensIndexOptions.length == 1) {
            if (this._isVsScreen == false) {
                this.lensIndex = this.lensIndexOptions[0].value;
                this.selectedIndex = this.lensIndexOptions[0].label;
                if ((this.categoryName == ADAPTER || this.categoryName == DIRECT_GLAZING) && this.lensColorOptionsToShow) {
                    this.showLensColor = true;
                } else {
                    this.showLensColor = false;
                }

                this.lensColor = null;
                this.selectedColor = null;
                this.showErrorMessageForAntireflectionOrHardcoatingOptions = false;
                this.lensColorOptionsToShow = this.lensIndexOptions.find((iterator) => iterator.label === this.selectedIndex).color;
                if (this.categoryName == this.clip_in || this.lensConfiguratorCollection.selectedRXSolution === CLIPIN) {
                    this._showAntireflectionHardCoatingSelection = true;
                    this.selectedSKU = this.lensIndexOptions[0].value;
                    this.productMaterial = this.lensIndexOptions.find((opt) => opt.label === this.selectedIndex).material;
                } else {
                    this._showAntireflectionHardCoatingSelection = false;
                    this.selectedSKU = null;
                    this.productMaterial = null;
                }
                //color
                if (this.lensColorOptionsToShow && this.lensColorOptionsToShow.length == 1) {
                    this.showErrorMessageForAntireflectionOrHardcoatingOptions = false;
                    this._showAntireflectionHardCoatingSelection = true;
                    this.lensColor = this.lensColorOptionsToShow[0].value;
                    this.showErrorMessageLensColor = false;
                    this.selectedColor = this.lensColorOptionsToShow[0].label;
                    this.selectedSKU = this.lensColorOptionsToShow[0].value;
                    this.productMaterial = this.lensColorOptionsToShow[0].material;
                }
            } else {
                this._isLoading = true;
                this._showVsLensColor = false;
                this._showPhotoSensation = false;
                this._showBlueSensation = false;
                this.lensIndex = this.lensIndexOptions[0].value;
                this.selectedIndex = this.lensIndexOptions[0].label;
                this.selectedSKU = this.lensIndexOptions[0].value;
                this.productMaterial = this.lensIndexOptions[0].material;
                this._lensSchneiderSku = this.lensIndexOptions[0].schneiderSku; //BS-1710
                if (this.selectedSKU != undefined && this.selectedSKU != null) {
                    this.getCommerceLinkData();
                }
                if (this.productMaterial != undefined && this.productMaterial != null) {
                    this._showLensDetails = true;
                }
            }
        } //BS-1648 end
        this.lensConfiguratorId = this.lensConfiguratorCollection.lensConfiguratorID;
        this._isLoading = false;
        if (this._isVsScreen == false && this.fromConnectedCallback == true) {
            if (this.lensConfiguratorCollection.lensType != undefined && this.lensConfiguratorCollection.lensType != null) {
                this.showLensIndex = true;
                if (this.label.panoramaProgressive === this.lensConfiguratorCollection.lensType) {
                    this.isProgressiveLengthDisabled = true; //BS-1118
                    this.showProgressiveLength = true; //BS-1118
                    this.progressiveLength = PROGRESSION_LENGTH_VALUE; //BS-1118
                    this.formatProgressiveLength = PROGRESSION_LENGTH_VALUE; //BS-1118
                } else {
                    this.showProgressiveLength = false; //BS-1118
                    this.progressiveLength = null; //BS-1118
                    this.isProgressiveLengthDisabled = false; //BS-1118
                }
                if ((this.categoryName == ADAPTER || this.categoryName == DIRECT_GLAZING) && this.lensColorOptionsToShow) {
                    this.showLensColor = true;
                } else {
                    this.showLensColor = false;
                    //this._showAntireflectionHardCoatingSelection = true;
                }
                if (this.lensConfiguratorCollection.lensType === this.lensTypeOptions[0].value && this.fromConnectedCallback === true) {
                    this.lensTypeOptions[0].checked = true;
                    this.fromConnectedCallback = false;
                } else if (this.lensConfiguratorCollection.lensType === this.lensTypeOptions[1].value && this.fromConnectedCallback === true) {
                    this.lensTypeOptions[1].checked = true;
                    this.fromConnectedCallback = false;
                } else if (this.lensConfiguratorCollection.lensType === this.lensTypeOptions[2].value && this.fromConnectedCallback === true) {
                    this.lensTypeOptions[2].checked = true;
                    this.fromConnectedCallback = false;
                }
            } else {
                this.showLensColor = false;
                this.showLensIndex = false;
                this._showAntireflectionHardCoatingSelection = false;
            }

            if (this.lensConfiguratorCollection.lensIndex) {
                this.selectedIndex = this.lensConfiguratorCollection.lensIndex;

                let colorOption = this.lensIndexOptions.find((iterator) => iterator.label === this.selectedIndex);
                if (colorOption != undefined) {
                    this.lensIndex = colorOption.value;
                }

                if (colorOption != undefined) {
                    if (colorOption.color != undefined) {
                        this.lensColorOptionsToShow = JSON.parse(JSON.stringify(colorOption.color));
                    }
                }
                this.lensColor = this.lensConfiguratorCollection.lensSKU;
                this.selectedSKU = this.lensConfiguratorCollection.lensSKU;
                this.selectedColor = this.lensConfiguratorCollection.lensColor;
                this.productMaterial = this.lensConfiguratorCollection.productMaterial;

                this._showAntireflectionHardCoatingSelection = true;
            }
            if (this.lensConfiguratorCollection.progressionLengthLens !== undefined && this.lensConfiguratorCollection.progressionLengthLens !== null) {
                this.formatProgressiveLength = this.lensConfiguratorCollection.progressionLengthLens;
            }
        } else if (this.fromConnectedCallback === true && this.lensSelectionReadOnlyCollection != undefined && this.lensSelectionReadOnlyCollection != null) {
            //BS-1584 added this block for data persistance
            if (this.lensSelectionReadOnlyCollection.lensIndex && this.lensSelectionReadOnlyCollection.lensIndex != false) {
                if (this.lensSelectionReadOnlyCollection.progressionLength && this.lensSelectionReadOnlyCollection.progressionLength != false) {
                    this.showProgressiveLength = true;
                    //BS-1881
                    if (LANG == GERMAN_LANGUAGE) {
                        this.progressiveLength = this.lensSelectionReadOnlyCollection.progressionLength.toString().replace('.', ',');
                        this.formatProgressiveLength = this.lensSelectionReadOnlyCollection.progressionLength.toString().replace('.', ',');
                    } else {
                        this.progressiveLength = this.lensSelectionReadOnlyCollection.progressionLength.toString();
                        this.formatProgressiveLength = this.lensSelectionReadOnlyCollection.progressionLength.toString();
                    }
                }
                if (this.lensSelectionReadOnlyCollection.productMaterial && this.lensSelectionReadOnlyCollection.productMaterial != false) {
                    this.productMaterial = this.lensSelectionReadOnlyCollection.productMaterial;
                    this._showLensDetails = true;
                }
                if (this.lensSelectionReadOnlyCollection.lensEdge && this.lensSelectionReadOnlyCollection.lensEdge != false) {
                    this._lensEdge = this.lensSelectionReadOnlyCollection.lensEdge;
                } else {
                    this._lensEdge = null;
                }
                if (this._isOpticalGlazing == true) {
                    this.selectedIndex = this.lensSelectionReadOnlyCollection.lensIndex;
                    this.lensIndex = this.lensIndexOptions.find((iterator) => iterator.label === this.selectedIndex).value;
                    this.showLensIndex = true;
                    this._lensSchneiderSku = this.lensIndexOptions.find((iterator) => iterator.label === this.selectedIndex).schneiderSku;
                    this.selectedSKU = this.lensIndex;
                    if (this.lensSelectionReadOnlyCollection.lensDistance && this.lensSelectionReadOnlyCollection.lensDistance != false) {
                        this._showLensDistance = true;
                        this._lensDistance = this.lensSelectionReadOnlyCollection.lensDistance.toString();
                    } else {
                        this._lensDistance = null;
                    }
                    if (this.lensSelectionReadOnlyCollection.lensType != this.label.panoramaRelaxLabel) {
                        this._selectedRelaxVersion = null;
                    }
                    if (this.lensSelectionReadOnlyCollection.visualPreferences && this.lensSelectionReadOnlyCollection.visualPreferences != false) {
                        this._showVisualPreferences = true;
                        this._isPanoramaProgressiveOne = true;
                        this.visualPreferences.forEach((option) => {
                            if (option.value == this.lensSelectionReadOnlyCollection.visualPreferences) {
                                this._selectedVisualPreference = option.value;
                                option.checked = true;
                            }
                        });
                    }
                    this.getCommerceLinkData();
                } else {
                    this._vsHardcoatingId = null;
                    this._vsAntireflectionId = null;
                    let lensProductSku =
                        this.lensSelectionReadOnlyCollection && this.lensSelectionReadOnlyCollection.lensProduct
                            ? this.lensSelectionReadOnlyCollection.lensProduct
                            : null;
                    this.selectedColor = this.sunGlazingLensColorOptions.find((iterator) => iterator.value === lensProductSku).label; //BS-2385
                    this.lensColor = this.sunGlazingLensColorOptions.find((iterator) => iterator.label === this.selectedColor).value;
                    this._showVsLensColor = true;
                    this.sunGlazingLensIndexOptionsToShow = this.sunGlazingLensColorOptions.find((iterator) => iterator.label === this.selectedColor).index;
                    this.selectedIndex = this.lensSelectionReadOnlyCollection.lensIndex;
                    this.lensIndex = this.sunGlazingLensIndexOptionsToShow.find((iterator) => iterator.label === this.selectedIndex).value;
                    this.showLensIndex = true;
                    this._lensSchneiderSku = this.sunGlazingLensIndexOptionsToShow.find((iterator) => iterator.label === this.selectedIndex).schneiderSku;
                    this.selectedSKU = this.lensIndex;
                }
            }
        }
    } //end

    /**
     * This Method is used to set the component read only or edit visibility mode
     * BS-941
     */
    @api
    setupComponentMode(componentMode) {
        if (componentMode != null && componentMode != undefined) {
            if (componentMode == EDIT_MODE) {
                this._isReadOnly = false;
            } else if (componentMode == READ_ONLY_MODE) {
                this._isReadOnly = true;
            }
        }
    }

    /**
     * This Method is used to handle event fired on click of edit icon by user on UI
     * BS-1051
     *
     */
    handleLensSelectionEdit(event) {
        if (this._isReadOnly == true) {
            this._isReadOnly = false;
            this.fireUpdateProgressBar(6, true, false);
        }
    }

    /**
     * This Method is used to fire event to update the progress bar on UI
     * BS-1051
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
     * Method to fetch commerce link products for provided source product
     * BS-1466
     */
    async getCommerceLinkData() {
        this._isLoading = true;
        this.lensColorOptionsToShow = [];
        this._photoSensationOptionsToShow = [];
        this._blueSensationOptionsToShow = [];
        this.additionalOptions = [];
        this._selectedAdditionalOption = null;
        this._vsAntiReflectionOrHardCoating = null;
        this._vsHardcoatingId = null;
        this._vsAntireflectionId = null;
        this._showAntireflectionHardCoatingSelectionVs = false;
        await getLensRelatedProducts({ productSKU: this.selectedSKU })
            .then((result) => {
                //BS-1918 : Start
                if (result) {
                    this._lensProductId = result[0] && result[0].B2B_Source_Product__r.Id ? result[0].B2B_Source_Product__r.Id : null;
                    let antireflectionDescription = null;
                    let hardCoatingProductDescription = null;
                    result.forEach((record) => {
                        //2208
                        if (
                            record.B2B_Target_Product__r &&
                            record.B2B_Target_Product__r.B2B_Availability_JSON__c !== undefined &&
                            checkProductAvailability(record.B2B_Target_Product__r.B2B_Availability_JSON__c, this.countryCode) == false
                        ) {
                            let option = {
                                label: record.B2B_Target_Product__r.Description,
                                value: record.B2B_Target_Product__r.Id,
                                schneiderSku: record.B2B_Schneider_SKU__c,
                                lensSchneiderSku: record.B2B_Source_Product__r.B2B_Schneider_SKU__c
                            };
                            if (record && record.B2B_Type__c) {
                                if (record.B2B_Type__c == LENS_COLOR) {
                                    this.lensColorOptionsToShow.push(option);
                                } else if (record.B2B_Type__c == PHOTO_SENSATION) {
                                    this._photoSensationOptionsToShow.push(option);
                                } else if (record.B2B_Type__c == BLUE_SENSATION_RELATION) {
                                    this._blueSensationOptionsToShow.push(option);
                                }
                            }
                        }
                        if (record.B2B_Type__c == ANTIREFLECTION_TYPE) {
                            this._vsAntireflectionId = record.B2B_Target_Product__r.Id;
                            this._showAntireflectionHardCoatingSelectionVs = true;
                            antireflectionDescription = record.B2B_Target_Product__r.Description;
                        } else if (record.B2B_Type__c == HARDCOATING_TYPE) {
                            this._vsHardcoatingId = record.B2B_Target_Product__r.Id;
                            hardCoatingProductDescription = record.B2B_Target_Product__r.Description;
                        }
                    });
                    this._vsAntiReflectionOrHardCoating = antireflectionDescription
                        ? antireflectionDescription
                        : hardCoatingProductDescription
                        ? hardCoatingProductDescription
                        : null;
                    //BS-1918 : End
                }
                if (this.lensColorOptionsToShow.length > 0) {
                    if (this.selectedLensType != PANORAMA_SINGLE_VISION || this.selectedIndex != INDEX_SIXTY_SEVEN) {
                        let colorOption = { label: this.label.lensColor, value: LENS_COLOR, checked: false };
                        this.additionalOptions.push(colorOption);
                    } else if (this._isOpticalGlazing == false) {
                        let colorOption = { label: this.label.lensColor, value: LENS_COLOR, checked: false };
                        this.additionalOptions.push(colorOption);
                    }
                    //BS-1584
                    if (
                        this.fromConnectedCallback === true &&
                        this.lensSelectionReadOnlyCollection &&
                        this.lensSelectionReadOnlyCollection.lensColor &&
                        this.lensSelectionReadOnlyCollection.lensColor != false
                    ) {
                        this.lensColorOptionsToShow.forEach((option) => {
                            if (option.label != undefined && option.label != null && option.label == this.lensSelectionReadOnlyCollection.lensColor) {
                                this._lensColorId = option.value;
                                this.lensColor = option.value;
                                this.selectedColor = option.label;
                                this._showVsLensColor = true;
                                this._selectedAdditionalOption = LENS_COLOR;
                            }
                        });
                    } else {
                        this.selectedColor = null;
                    }
                }
                if (this._photoSensationOptionsToShow.length > 0) {
                    let photoSensationOption = { label: this.label.photoSensation, value: PHOTO_SENSATION, checked: false };
                    this.additionalOptions.push(photoSensationOption);
                    //BS-1584
                    if (
                        this.fromConnectedCallback === true &&
                        this.lensSelectionReadOnlyCollection != undefined &&
                        this.lensSelectionReadOnlyCollection != null &&
                        this.lensSelectionReadOnlyCollection.photoSensation != undefined &&
                        this.lensSelectionReadOnlyCollection.photoSensation != null &&
                        this.lensSelectionReadOnlyCollection.photoSensation != false
                    ) {
                        this._photoSensationOptionsToShow.forEach((option) => {
                            if (option.label != undefined && option.label != null && option.label == this.lensSelectionReadOnlyCollection.photoSensation) {
                                this._photoSensationId = option.value;
                                this._photoSensation = option.value;
                                this._showPhotoSensation = true;
                                this._selectedAdditionalOption = PHOTO_SENSATION;
                            }
                        });
                    }
                }
                if (this._blueSensationOptionsToShow.length > 0) {
                    let blueSensationOption = { label: this.label.blueSensation, value: BLUE_SENSATION, checked: false };
                    this.additionalOptions.push(blueSensationOption);
                    //BS-1584
                    if (
                        this.fromConnectedCallback === true &&
                        this.lensSelectionReadOnlyCollection != undefined &&
                        this.lensSelectionReadOnlyCollection != null &&
                        this.lensSelectionReadOnlyCollection.blueSensation != undefined &&
                        this.lensSelectionReadOnlyCollection.blueSensation != null &&
                        this.lensSelectionReadOnlyCollection.blueSensation != false
                    ) {
                        this._blueSensationOptionsToShow.forEach((option) => {
                            if (option.label != undefined && option.label != null && option.label == this.lensSelectionReadOnlyCollection.blueSensation) {
                                this._blueSensationId = option.value;
                                this._blueSensation = option.value;
                                this._showBlueSensation = true;
                                this._selectedAdditionalOption = BLUE_SENSATION;
                            }
                        });
                    }
                }
                if (
                    this._isOpticalGlazing == true &&
                    (this.lensColorOptionsToShow != null || this._photoSensationOptionsToShow != null || this._blueSensationOptionsToShow != null)
                ) {
                    this._showAdditionalOptions = true;
                    if (this.fromConnectedCallback === true) {
                        this.additionalOptions.forEach((option) => {
                            if (
                                this._selectedAdditionalOption != undefined &&
                                this._selectedAdditionalOption != null &&
                                this._selectedAdditionalOption == option.value
                            ) {
                                option.checked = true;
                            }
                        });
                    }
                } else if (this._isOpticalGlazing == false) {
                    this._showVsLensColor = true;
                    if (this.lensColorOptionsToShow && this.lensColorOptionsToShow.length == 1) {
                        this.lensColor = this.lensColorOptionsToShow[0].value;
                        this.showErrorMessageLensColor = false;
                        this.selectedColor = this.lensColorOptionsToShow[0].label;
                        this._lensColorId = this.lensColorOptionsToShow[0].value;
                        this._glassProductSku =
                            this.lensColorOptionsToShow[0].lensSchneiderSku != undefined ? this.lensColorOptionsToShow[0].lensSchneiderSku : null;
                        this._blankCoatingSku = this.lensColorOptionsToShow[0].schneiderSku != undefined ? this.lensColorOptionsToShow[0].schneiderSku : null;
                    } //BS-1648 added if block
                }
                this._isLoading = false;
            })
            .catch((exceptionInstance) => {
                this._isLoading = false;
                console.error(exceptionInstance);
            });
    }
    async populateReadOnlyData(result) {
        if (result !== undefined && result !== null) {
            let lensConfigObj = result;

            let resultObj = populateReadOnlyDataUtils(lensConfigObj, OPTICAL_SUN_GLAZING, OPTICAL_GLAZING, LANG, GERMAN_LANGUAGE, this.label);
            this.lensSelectionReadOnlyCollection = JSON.parse(JSON.stringify({ ...resultObj, ...this.lensSelectionReadOnlyCollection }));

            //BS-1963
            if (lensConfigObj.B2B_Glazing_Type__c != undefined && lensConfigObj.B2B_Glazing_Type__c != null) {
                this._facetCutChecked = this.lensSelectionReadOnlyCollection.facetCutValue;
            }
            if (lensConfigObj.B2B_Glazing_Type__c && lensConfigObj.B2B_Glazing_Type__c == OPTICAL_GLAZING) {
                this._sGravingChecked = this.lensSelectionReadOnlyCollection.sGravingValue;
            } //BS-1796 end
            this._readOnlySetupDone = true;
            if (lensConfigObj.B2B_Glazing_Type__c != undefined && lensConfigObj.B2B_Glazing_Type__c != null) {
                this.categoryName = lensConfigObj.B2B_Glazing_Type__c;
                this.glazingOptions.forEach((option) => {
                    if (option.label == this.categoryName) {
                        option.checked = true;
                        this._selectedGlazing = option.value;
                    }
                });
                if (this._selectedGlazing != undefined && this._selectedGlazing != null && this._selectedGlazing == OPTICAL_GLAZING) {
                    this._isOpticalGlazing = true;
                    let lensType = [
                        { label: this.label.panoramaSingleVisionLabel, value: this.label.panoramaSingleVision, checked: false },
                        { label: this.label.panoramaRelaxLabel, value: this.label.panoramaRelaxLabel, checked: false },
                        { label: this.label.panoramaProgressiveLabel, value: this.label.panoramaProgressive, checked: false },
                        { label: this.label.panoramaProgressiveOneLabel, value: this.label.panoramaProgressiveOne, checked: false },
                        { label: this.label.panoramaOfficeRoomDeskLabel, value: this.label.panoramaProgressiveRoom, checked: false }
                    ];
                    this.lensTypeOptions = lensType;
                    this._sGravingFeatureAvailable = true; //BS-1935
                } else {
                    this._sGravingFeatureAvailable = false; //BS-1935
                }
                this._showLensType = true;
                this.lensTypeOptions.forEach((option) => {
                    if (lensConfigObj.B2B_Lens_Type__c && option.value == lensConfigObj.B2B_Lens_Type__c) {
                        option.checked = true;
                        this.selectedLensType = option.value;
                    }
                });
                /* Start : BS-967 */
                if (lensConfigObj.B2B_Vision_Zone_Analysis_Code__c !== undefined && lensConfigObj.B2B_Vision_Zone_Analysis_Code__c !== null) {
                    this._customValue = lensConfigObj.B2B_Vision_Zone_Analysis_Code__c;
                } else {
                    this._customValue = null;
                }
                if (this.lensSelectionReadOnlyCollection.visualPreferences !== CUSTOM) {
                    this._isVisionZoneAnalysisDisabled = true;
                }
                /* End : BS-967 */
                this.getLensProducts();
            } else {
                if (this.lensConfiguratorCollection.frameType == SUNGLASSES) {
                    this.categoryName = OPTICAL_SUN_GLAZING;
                } else {
                    this.categoryName = OPTICAL_GLAZING;
                } //BS-2013
                this.glazingOptions.forEach((option) => {
                    if (option.value == this.categoryName) {
                        option.checked = true;
                        this._selectedGlazing = this.categoryName;
                    }
                });
                if (this._selectedGlazing != undefined && this._selectedGlazing != null && this._selectedGlazing == OPTICAL_GLAZING) {
                    this._isOpticalGlazing = true;
                    let lensType = [
                        { label: this.label.panoramaSingleVisionLabel, value: this.label.panoramaSingleVision, checked: false },
                        { label: this.label.panoramaRelaxLabel, value: this.label.panoramaRelaxLabel, checked: false },
                        { label: this.label.panoramaProgressiveLabel, value: this.label.panoramaProgressive, checked: false },
                        { label: this.label.panoramaProgressiveOneLabel, value: this.label.panoramaProgressiveOne, checked: false },
                        { label: this.label.panoramaOfficeRoomDeskLabel, value: this.label.panoramaProgressiveRoom, checked: false }
                    ];
                    this.lensTypeOptions = lensType;
                    this._sGravingFeatureAvailable = true; //BS-1935
                }
                this._showLensType = true;
                this.getLensProducts();
            } //BS-1887
        }
    }

    /**
     * BS-967
     * @description : Method used to handle the click of link out for vision zone analysis
     */
    handleVisionZoneAnalysisNavigation() {
        this._showVisionZoneId = true; //BS-1780 start
        this._showVisionZoneIdError = false;
        this.showErrorMessageVisualPreference = false;
        this._visionZoneResult = null;
        this._selectedVisualPreference = this.visualPreferences[4].value;
        this._isVisionZoneAnalysisDisabled = false;
        this.visualPreferences[0].checked = false;
        this.visualPreferences[1].checked = false;
        this.visualPreferences[2].checked = false;
        this.visualPreferences[3].checked = false;
        this.visualPreferences[4].checked = true; //BS-1780 end
        this.fetchVisionZoneAnalysisId().then((url) => {
            if (url !== undefined && url !== null) {
                window.open(url, '_blank');
            }
        });
    }

    /**
     * BS-967
     * @description : Method used to fetch Vision zone analysis Id
     */
    async fetchVisionZoneAnalysisId() {
        let visionZoneId;
        let whiteSpaceOnlyRegex = /^\s*$/;
        if (this._customValue === null || whiteSpaceOnlyRegex.test(this._customValue) === true) {
            this._showVisionZoneId = false;
            await getVisionZoneAnalysisId({ accountId: this.effectiveAccountId, lensConfiguratorId: this.lensConfiguratorId })
                .then((result) => {
                    if (result !== undefined && result !== null) {
                        visionZoneId = result.id;
                        this._customValue = visionZoneId;
                        this._showVisionZoneId = true;
                    } else {
                        this._showVisionZoneAnalysisCallOutError = true; //BS-1815
                        this._showVisionZoneId = true;
                    }
                })
                .catch((errorInstance) => {
                    this._showVisionZoneId = true;
                    showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
                });
        } else {
            visionZoneId = this._customValue;
        }

        let surveyNavigationURL;
        if (visionZoneId !== undefined && visionZoneId !== null) {
            surveyNavigationURL = VISION_ZONE_ANALYSIS_SURVEY_ANSWER_URL + visionZoneId;
        }
        return surveyNavigationURL;
    }
    handleRelaxOptionsChange(event) {
        this.showErrorMessageRelaxVersion = false;
        this._selectedRelaxVersion = event.detail.value;
    }
}
