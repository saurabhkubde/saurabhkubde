import { LightningElement, api, track } from 'lwc';
import getLensShapeData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensShapeData';
import saveShapeSelectionData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.saveShapeSelectionData';
import getLensShape from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensShape';
import getLensShapeDataByShapeName from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensShapeDataByShapeName';
import getAccentRingImage from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getAccentRingImage';
import getAccentRingColor from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getAccentRingColor';
import getShapeSelectionScreenData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getShapeSelectionScreenData';
import getColoredGrooveColor from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getColoredGrooveColor';
import getAccountInfo from '@salesforce/apex/B2B_VS_RX_LensSelectionController.getAccountInfo'; //BS-2063

import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';

import { DrawGlass, UpdateDrawGlass } from './externalLibrary';
import { showToastMessage } from 'c/b2b_cartUtils';
import { originalData, updatedData } from './dummyUpdatedDataForConvertMvc';
import { updateShapeEditorCollection, formShapeData, resetAdjustmentsAndRemoveDrills } from 'c/b2b_vs_shape_selection_component_utils'; //727
import { validateInput } from 'c/b2b_vs_shape_selection_component_utils'; //1781
import { checkProductAvailability } from 'c/b2b_utils'; //BS-2063

import B2B_Error_Message_Label from '@salesforce/label/c.B2B_VS_RX_Error_Message';
import SHAPE_SELECTION_LABELS from '@salesforce/label/c.B2B_VS_SHAPE_SELECTION_SCREEN_LABELS';
import RESPONSE_MESSAGE from '@salesforce/label/c.B2B_Something_Went_Wrong';
import B2B_SHOW_ALL_SHAPES_HELPTEXT from '@salesforce/label/c.B2B_SHOW_ALL_SHAPES_HELPTEXT';
import B2B_SHOW_ALL_SHAPES from '@salesforce/label/c.B2B_SHOW_ALL_SHAPES';
import B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE from '@salesforce/label/c.B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE'; //BS-999
import B2B_CALLOUT_RESPONSE_LABELS from '@salesforce/label/c.B2B_CALLOUT_RESPONSE_LABELS'; //BS-999
import WITH_PARTIAL_COLOR_GROOVE_LABEL from '@salesforce/label/c.B2B_PARTIAL_COLOR_GROOVE_LABEL'; //BS-2137

const CALLOUT_TYPE_OMA_SHAPE = 'getOMAShape';
const CALLOUT_TYPE_OMA_SCALE = 'postOMAScale'; // BS-791
const UPDATE_PROGRESS_BAR = 'updateprogressbar';
const POPULATE_SHAPE_SELECTION_DATA = 'updateshapeselectiondata';
const ERROR_TOAST_VARIENT = 'error';
const TOAST_MODE = 'dismissable';
const ANGULAR_BRACKET_START = ' (';
const HYPHEN = ' — ';
const ANGULAR_BRACKET_END = ')';
const ADJUSTMENT_ATTRIBUTE_BLP = 'blp';
const BUTTON_TYPE_PLUS = '+';
const BUTTON_TYPE_MINUS = '-';
const LENS_ONLY = 'Lens Only';
const REMOVE_DRILLS_VALUE = 'remove drills';
const YES = 'Yes';
const NO = 'No';
const TRUE = 'true';
const FALSE = 'false';
const STYLING_BACKGROUND_COLOR = 'background-color:';
const WITH_ACCENT_RING_VALUE = 'with Accent Rings';
const AR_PARAMETER = 'AR';
const GR_PARAMETER = 'GR'; //BS-2012
const WITH_COLORED_GROOVE = 'with Colored grooves';
const PARTIAL_GROOVE_VALUE = 'With Partial Color Groove'; //BS-2137
const READ_ONLY_MODE = 'read'; //BS-1492
const EDIT_MODE = 'edit'; //BS-1492
const RIMLESS = 'Rimless'; //BS-1636
const CHECKMARK = 'checkmark'; //BS-1636
const CHECKMARK_DISABLE = 'checkmark-disable'; //BS-1636
const LINE_BREAK_TAG = '<br>'; //BS-999
const SHAPE_FIELD = 'shapeInputField'; //BS-1635
const SET_VISIBILITY = 'set-visibility'; //BS-1635
const UNSET_VISIBILITY = 'unset-visibility'; //BS-1635
const SUNGLASSES = 'Sunglasses'; //BS-1916
const DEMO = 'Demo'; //BS-1888

export default class B2b_vs_shape_selection_component extends LightningElement {
    _infoSVG = STORE_STYLING + '/icons/INFO.svg';
    _fieldErrorMessage = B2B_Error_Message_Label;
    _shapeSelectionHeaderLabel = SHAPE_SELECTION_LABELS.split(',')[0];
    _glassLabel = SHAPE_SELECTION_LABELS.split(',')[1];
    _lensShapeLabel = SHAPE_SELECTION_LABELS.split(',')[2];
    _lensSizeLabel = SHAPE_SELECTION_LABELS.split(',')[3];
    _height;
    _width;
    _heightLabel = SHAPE_SELECTION_LABELS.split(',')[6];
    _widthLabel = SHAPE_SELECTION_LABELS.split(',')[7];
    _originalShapeLabel = SHAPE_SELECTION_LABELS.split(',')[4];
    _scaledShapeLabel = SHAPE_SELECTION_LABELS.split(',')[5];
    _measurementUnitLabel = SHAPE_SELECTION_LABELS.split(',')[8];
    _showAllShapesHelpText = B2B_SHOW_ALL_SHAPES_HELPTEXT;
    _showAllShapesLabel = B2B_SHOW_ALL_SHAPES;
    _aLabel = SHAPE_SELECTION_LABELS.split(',')[12];
    _bLabel = SHAPE_SELECTION_LABELS.split(',')[13];
    _sfLabel = SHAPE_SELECTION_LABELS.split(',')[14];
    _b1Label = SHAPE_SELECTION_LABELS.split(',')[15];
    _b2Label = SHAPE_SELECTION_LABELS.split(',')[16];
    _dhpLabel = SHAPE_SELECTION_LABELS.split(',')[17];

    @api effectiveAccountId;
    @track
    _initialSetupDone = false;
    @track
    _lensShapeData = {};
    @track
    _lensShapeOptions = [];

    @track
    _lensSizeOptions = [];
    _selectedLensShape;
    _selectedLensSize;
    _isLensShapeInValid;
    _isLensSizeInValid;
    _selectedLensShapeRecordId;
    _isLoading = false;
    _showLensShapeImage = false;
    _showAllValue = false;
    _showOmaShapeScreen = true;
    _omaCalloutFailed = false;
    _responseMessage;
    countryCode;

    @track
    _nonExclusiveLensShapeList = []; //BS-795

    @track
    _shapeSelectionData = {};

    @track
    _omaCalloutSuccessWrapperString = {};

    @api
    frameType;
    @api
    model;

    @api
    lensConfiguratorCollection;

    _parsedData;
    _isValid = false;

    @track
    _showLensSize = false;
    _showShapeEditor = false;
    _shapeEditorApplicable = false;
    _openShapeEditorButtonActive = false;
    _showValidationMessage = false;
    _visualizeShapeButtonDisable = false;
    _isAdjustmentsAllowed = true;
    _modifiedValidationMessage = null;

    //BS-791
    _shapeEditorReferenceImage = STORE_STYLING + '/icons/ShpeEditorReference.png';
    _shapeEditorEligibalFrameTypes = [SHAPE_SELECTION_LABELS.split(',')[9], SHAPE_SELECTION_LABELS.split(',')[10]];
    _genericValidationMessage = SHAPE_SELECTION_LABELS.split(',')[28];
    _openShapeEditorButtonLabel = SHAPE_SELECTION_LABELS.split(',')[11];
    _shapeEditorHeader = SHAPE_SELECTION_LABELS.split(',')[24];
    _shapeEditorSubHeader = SHAPE_SELECTION_LABELS.split(',')[25];
    _shapeEditorInstructionText = SHAPE_SELECTION_LABELS.split(',')[29] + ',';
    _shapeEditorInstructionSubText = SHAPE_SELECTION_LABELS.split(',')[30];
    _visualizeShapeButtonLabel = SHAPE_SELECTION_LABELS.split(',')[26];
    _restAdjustmentsButtonLabel = SHAPE_SELECTION_LABELS.split(',')[27];
    _removeDrillsLabel = SHAPE_SELECTION_LABELS.split(',')[31];
    _yesLabel = SHAPE_SELECTION_LABELS.split(',')[32];
    _noLabel = SHAPE_SELECTION_LABELS.split(',')[33];
    _withAccentRingLabel = SHAPE_SELECTION_LABELS.split(',')[34];
    _accentRingColorLabel = SHAPE_SELECTION_LABELS.split(',')[35];
    _removeGrooveLabel = SHAPE_SELECTION_LABELS.split(',')[36];
    _selectColorOptionLabel = SHAPE_SELECTION_LABELS.split(',')[37];
    _withColorGrooveLabel = SHAPE_SELECTION_LABELS.split(',')[38];
    _colorGrooveColorLabel = SHAPE_SELECTION_LABELS.split(',')[39];
    _selectColorGrooveColorHelpText = SHAPE_SELECTION_LABELS.split(',')[40];

    @track
    _validationAdjustementAttributesCollection = [];
    _preservedOriginalShapeEditorCollection;
    @track
    _shapeEditorCollection;
    _updatedParsedData;
    _updatedOmaCalloutSuccessWrapperString;
    _preservedOriginalParsedData;
    _preservedOriginalOmaCalloutSuccessWrapperString;

    @api
    masterShapeEditorCollection;

    @api
    componentVisibilityMode;

    @track
    _isOrderTypeLensOnly = false;

    @track
    _showRemoveDrills = false;

    @track
    _removeDrillsOptions = [
        { label: this._yesLabel, name: YES, value: true, isChecked: false },
        { label: this._noLabel, name: NO, value: false, isChecked: true }
    ];

    @track
    _callDrawGlass = false;

    @track
    _resetShapeEdiorValues = false;

    @track
    _showAccentRingSection = false;

    @track
    _withAccentRingOptions = [
        { label: this._yesLabel, name: YES, value: true, isChecked: false },
        { label: this._noLabel, name: NO, value: false, isChecked: false }
    ];

    @track
    _removeGrooveOptions = [
        { label: this._yesLabel, name: YES, value: true, isChecked: false },
        { label: this._noLabel, name: NO, value: false, isChecked: true }
    ];

    @track
    _withAccentRingValue = false;

    _accentRingImage;

    @track
    _accentRingColorOptions = [];

    @track
    _showColorOption = false;

    @track
    _colorOptions = [];

    @track
    _removeGrooveValue = false;

    @track
    _selectedAccentRingColor;
    @track
    _isAccentRingColorSelected = false;

    @track
    _showAccentRingColorOptions = false;

    _selectedAccentRingColorProductId;

    @track
    _showAccentRingImage = false;

    @track
    _isAccentRingColorInvalid = false;

    _mountingType;

    @track
    _showColoredGrooveSection = false;

    @track
    _withColoredGrooveOptions = [
        { label: this._yesLabel, name: YES, value: true, isChecked: false },
        { label: this._noLabel, name: NO, value: false, isChecked: false }
    ];

    @track
    _withColoredGrooveValue = false;

    @track
    _isColoredGrooveColorSelected = false;

    @track
    _selectedColoredGrooveColor;

    @track
    _showColoredGrooveColorOptions = false;

    @track
    _coloredGrooveColorOptions = [];

    @track
    _isColoredGrooveColorInvalid = false;

    @track
    _colorGrooveOptions = [];

    _selectedColorGrooveColorProductId;

    _omaShapeKeyValue;

    @track
    _readOnlyParsedData = {};
    _onLoad = false;
    _showLensOptions = false;
    _readOnlyOriginalParsedData = {};
    _fromLensShapeFilter = false;
    _shapeAdjusted = false;
    _isNotRimlessFrame = false; //BS-1636
    _checkboxStyle = CHECKMARK; //BS-1636
    _shapeFieldId = SHAPE_FIELD;
    _shapeVisible = true;
    _onFieldLoad = true;
    _searchTerm;
    searchResults;
    selectedSearchResult;
    _getAllDataCompleted = false; // Fix: flag recurssion in getLensShapeOptions
    _partialColorGroove = false;
    _stopDrawGlass = false; //BS-2380

    @api
    fromMyVsRx;

    /**
     * getter to get pencil icon
     * BS-1492
     */
    get editIcon() {
        let editIcon;
        editIcon = {
            icon: STORE_STYLING + '/icons/edit.png'
        };
        return editIcon;
    }

    /**
     * BS-1473
     * this method is used to open and close the accent ring color dropdown.
     */
    toggleAccentRingDropdownOptions() {
        if (this._colorOptions && this._colorOptions.length > 0) {
            this._showAccentRingColorOptions = !this._showAccentRingColorOptions;
        }
    }

    handleColorOptionClick(event) {
        const selectedColorProperties = {};
        if (event.currentTarget && event.currentTarget.dataset.color) {
            selectedColorProperties.label = event.currentTarget.dataset.color;
            selectedColorProperties.styling = event.currentTarget.dataset.style;
            selectedColorProperties.sku = event.currentTarget.dataset.sku;
            selectedColorProperties.productId = event.currentTarget.dataset.productid;
            this._selectedAccentRingColorProductId = selectedColorProperties.productId;
        }
        this._showAccentRingColorOptions = false;
        this._selectedAccentRingColor = selectedColorProperties;
        this._isAccentRingColorSelected = true;
        this.getAccentRingImage();
    }

    toggleColoredGrooveColorOptions() {
        this._showColoredGrooveColorOptions = !this._showColoredGrooveColorOptions;
    }

    /**
     * BS-1493
     * selection of color groove colors
     */
    handleColoredGooveColorSelection(event) {
        const selectedColorProperties = {};
        if (event.currentTarget && event.currentTarget.dataset.color) {
            selectedColorProperties.label = event.currentTarget.dataset.color;
            selectedColorProperties.styling = event.currentTarget.dataset.style;
            selectedColorProperties.sku = event.currentTarget.dataset.sku;
            selectedColorProperties.productId = event.currentTarget.dataset.productid;
            this._selectedColorGrooveColorProductId = selectedColorProperties.productId;
        }
        this._showColoredGrooveColorOptions = false;
        this._selectedColoredGrooveColor = selectedColorProperties;
        this._isColoredGrooveColorSelected = true;
    }

    async connectedCallback() {
        this._isLoading = true;
        if (this.frameType && this.model) {
            this._initialSetupDone = false;
            if (this.frameType !== RIMLESS || this.lensConfiguratorCollection.frameType == SUNGLASSES) {
                this._isNotRimlessFrame = true;
                this._checkboxStyle = CHECKMARK_DISABLE;
            }
            this.setupComponentMode(this.componentVisibilityMode); //BS-1493
            if (
                this.lensConfiguratorCollection !== undefined &&
                this.lensConfiguratorCollection !== null &&
                this.lensConfiguratorCollection.shapeSelectionData !== undefined &&
                this.lensConfiguratorCollection.shapeSelectionData !== null &&
                this.lensConfiguratorCollection.shapeSelectionData.showAllShapes !== undefined &&
                this.lensConfiguratorCollection.shapeSelectionData.showAllShapes !== null
            ) {
                this._showAllValue = this.lensConfiguratorCollection.shapeSelectionData.showAllShapes;
            }
            this.getLensShapeOptions();
            this.doInitialSetup();
            //BS-791
            if (
                this.lensConfiguratorCollection !== undefined &&
                this.lensConfiguratorCollection !== null &&
                this.lensConfiguratorCollection.orderType !== undefined &&
                this.lensConfiguratorCollection.orderType !== null &&
                this.lensConfiguratorCollection.orderType == LENS_ONLY
            ) {
                this._isOrderTypeLensOnly = true;
            }

            this._shapeEditorApplicable =
                this.frameType && this._shapeEditorEligibalFrameTypes && this._shapeEditorEligibalFrameTypes.includes(this.frameType) ? true : false;
            this._openShapeEditorButtonActive = this._shapeEditorApplicable;
        }
        let result = await getAccountInfo({ accountId: this.effectiveAccountId });
        if (result !== null && result !== undefined) {
            this.countryCode = result.substring(0, 4);
        } //BS-2063
        this._isLoading = false;
        /** This line is commented : to test in vase server is down,
         * this._showLensShapeImage = true;
         * */
    }

    /**
     * BS-791
     * This method is use to perform initial setup to form shape editor attributes collection
     */
    doInitialSetup() {
        this._shapeEditorCollection = formShapeData(this.masterShapeEditorCollection);
        this._preservedOriginalShapeEditorCollection = JSON.parse(JSON.stringify(this._shapeEditorCollection)); //Preserving the collection that will need in case of reset
    }

    //START: BS-1635
    get selectedValue() {
        return this.selectedSearchResult ? this.selectedSearchResult.label : null;
    }

    searchLensShapeAccordingToSearchTerm(event) {
        this._searchTerm = event.detail.value;
        if (this._searchTerm === '') {
            this._selectedLensShape = null;
            this._selectedLensSize = null;
            this._showLensOptions = false;
            this.setDataToDefaultValues();
            this._mountingType = null;
            this._colorOptions = [];
            this._selectedLensSize = null;
            this._omaCalloutFailed = false;
            this._showLensSize = false;
            this.resetShapeEditorContents(); //BS-791
        }
        const input = this._searchTerm.toUpperCase();
        const result = this._lensShapeOptions.filter((picklistOption) => picklistOption.label.includes(input));
        let shapeField = this.template.querySelector(`[data-id="${SHAPE_FIELD}"]`);
        if (result.length === 0) {
            this.resetShapeEditorContents(); //BS-791
            this.setDataToDefaultValues();
            this._mountingType = null;
            this._colorOptions = [];
            this._selectedLensSize = null;
            this._omaCalloutFailed = false;
            this._selectedLensShape = null;
            shapeField.classList.remove(SET_VISIBILITY);
            shapeField.classList.add(UNSET_VISIBILITY);
            this._showLensOptions = false;
        } else if (result.length === 1) {
            const resultOptions = this._lensShapeOptions.filter((picklistOption) => picklistOption.label === input);
            if (resultOptions !== undefined && resultOptions !== null && resultOptions.length === 1) {
                let eventObj = {};
                eventObj.currentTarget = { dataset: { value: this._searchTerm.toUpperCase() } };
                this.handleLensShapeSelection(eventObj);
            }
        } else if (result.length > 1) {
            shapeField.classList.remove(UNSET_VISIBILITY);
            shapeField.classList.add(SET_VISIBILITY);
        }
        this.searchResults = result;
    }

    clearSearchResults() {
        this.searchResults = null;
    }
    showLensShapeOptions() {
        if (!this.searchResults) {
            this.searchResults = this._lensShapeOptions;
        }
    }
    //END: BS-1635
    /**
     * BS-722
     * This method will handle the onclick event of the lens shape
     * combobox
     */
    handleLensShapeSelection(event) {
        //START:BS-1635
        this._onFieldLoad = false;
        this._shapeVisible = false;
        let lensShapeSelectedValue = event.currentTarget.dataset.value;
        this.selectedSearchResult = this._lensShapeOptions.find((picklistOption) => picklistOption.value === lensShapeSelectedValue);

        this.clearSearchResults();
        //END: BS-1635
        this.resetShapeEditorContents(); //BS-791
        this.setDataToDefaultValues();
        this._mountingType = null;
        this._colorOptions = [];
        this._selectedLensSize = null;
        this._omaCalloutFailed = false;
        this._selectedLensShape = lensShapeSelectedValue;
        this._searchTerm = lensShapeSelectedValue;
        this._lensSizeOptions = [];
        if (lensShapeSelectedValue && this._lensShapeData) {
            this._isLensShapeInValid = false;
            let lensSizeLabel = [];
            this._lensShapeData.forEach((item) => {
                if (item.B2B_Shape_Name__c === lensShapeSelectedValue && lensSizeLabel.includes(item.B2B_Size__c) == false) {
                    let lensSizeObj = {};
                    lensSizeObj = {
                        label: item.B2B_Size__c,
                        value: item.B2B_Size__c
                    };
                    if (!this._lensSizeOptions.find((option) => option.value === lensSizeObj.value)) {
                        this._lensSizeOptions.push(lensSizeObj);
                        lensSizeLabel.push(item.B2B_Size__c);
                    }
                    this._showLensSize = true;
                }
            });
            if (this._lensSizeOptions && this._lensSizeOptions.length > 0) {
                this._showLensOptions = true;
            }
            if (this._lensSizeOptions && this._lensSizeOptions.length == 1) {
                this._selectedLensSize = this._lensSizeOptions[0].value;
                let evt = { target: { value: this._selectedLensSize } };
                this.handleLensSizeSelection(evt);
                this._isLoading = true;
            } //BS-1648 added if block to auto select lens size
        }
        const shapeField = this.template.querySelector(`[data-id="${SHAPE_FIELD}"]`);
        if (shapeField !== undefined && shapeField !== null) {
            this._initialSetupDone = false;
            shapeField.classList.remove(SET_VISIBILITY);
            shapeField.classList.add(UNSET_VISIBILITY);
            this._initialSetupDone = true;
        }
    }

    /**
     * BS-791
     * This method is use to reset the shape adjustments
     */
    resetShapeEditorContents() {
        if (this._shapeEditorApplicable) {
            this._showShapeEditor = false;
            this._openShapeEditorButtonActive = true;
            this._shapeEditorCollection = this._preservedOriginalShapeEditorCollection;
            this._validationAdjustementAttributesCollection = [];
            this._visualizeShapeButtonDisable = false;
        }
    }

    /**
     * BS-722
     * To fetch all the lens shape records with the specific frame type and model
     */
    async getLensShapeOptions() {
        this._isLoading = true;
        await getLensShapeData({
            frameType: this.frameType,
            modelNumber: this.model,
            showAll: this._showAllValue,
            bridgeSize: this.lensConfiguratorCollection.bridgeSize
        })
            .then(async (result) => {
                if (result) {
                    this._lensShapeData = JSON.parse(JSON.stringify(result));
                    let lensShapeLabels = [];
                    this._lensShapeData.forEach((item) => {
                        if (lensShapeLabels.includes(item.B2B_Shape_Name__c) == false) {
                            let lensShapeOptionObj = {
                                label: item.B2B_Shape_Name__c,
                                value: item.B2B_Shape_Name__c
                            };
                            if (this._lensShapeOptions.find((obj) => obj.label === lensShapeOptionObj.label) === undefined) {
                                this._lensShapeOptions.push(lensShapeOptionObj);
                            }
                            this._showAllValue == false ? this._nonExclusiveLensShapeList.push(item.B2B_Shape_Name__c) : null; //BS-795
                            lensShapeLabels.push(item.B2B_Shape_Name__c);
                            if (
                                this._isNotRimlessFrame == true &&
                                this.lensConfiguratorCollection != null &&
                                this.lensConfiguratorCollection.variantShape != undefined &&
                                this.lensConfiguratorCollection.variantShape == lensShapeOptionObj.label
                            ) {
                                //BS-1636 and BS-1916
                                this._selectedLensShape = lensShapeOptionObj.value;
                                this._searchTerm = lensShapeOptionObj.value;
                            } else if (
                                this.lensConfiguratorCollection &&
                                (this.lensConfiguratorCollection.lensShape == undefined || this.lensConfiguratorCollection.lensShape == null) &&
                                this.lensConfiguratorCollection.rimlessVariant &&
                                this.lensConfiguratorCollection.rimlessVariant == DEMO &&
                                this.lensConfiguratorCollection.variantShape != undefined &&
                                this.lensConfiguratorCollection.variantShape == lensShapeOptionObj.label
                            ) {
                                this._selectedLensShape = lensShapeOptionObj.value;
                                this._searchTerm = lensShapeOptionObj.value;
                            }
                        }
                    });
                    if (this._isNotRimlessFrame == false && this._lensShapeOptions.length == 1) {
                        this._selectedLensShape = this._lensShapeOptions[0].value;
                        this._searchTerm = this._lensShapeOptions[0].value;
                    } //BS-1648
                    let clonedLensShapeoptions = this._lensShapeOptions ? JSON.parse(JSON.stringify(this._lensShapeOptions)) : null;
                    this._lensShapeOptions = clonedLensShapeoptions ? JSON.parse(JSON.stringify(clonedLensShapeoptions)) : null;
                    //BS-1648 updated below condition
                    if (
                        this._isNotRimlessFrame == true ||
                        (this.lensConfiguratorCollection &&
                            this.lensConfiguratorCollection.rimlessVariant != undefined &&
                            this.lensConfiguratorCollection.rimlessVariant == DEMO) ||
                        this._lensShapeOptions.length == 1
                    ) {
                        //BS-1636 start
                        this._lensSizeOptions = [];
                        if (this._selectedLensShape && this._lensShapeData) {
                            this._isLensShapeInValid = false;
                            let lensSizeLabel = [];
                            this._lensShapeData.forEach((item) => {
                                if (item.B2B_Shape_Name__c === this._selectedLensShape && lensSizeLabel.includes(item.B2B_Size__c) == false) {
                                    let lensSizeObj = {};
                                    lensSizeObj = {
                                        label: item.B2B_Size__c,
                                        value: item.B2B_Size__c
                                    };
                                    if (!this._lensSizeOptions.find((option) => option.value === lensSizeObj.value)) {
                                        this._lensSizeOptions.push(lensSizeObj);
                                        lensSizeLabel.push(item.B2B_Size__c);
                                    }
                                    if (
                                        this.lensConfiguratorCollection != null &&
                                        this.lensConfiguratorCollection.shapeSize != undefined &&
                                        this.lensConfiguratorCollection.shapeSize == lensSizeObj.label
                                    ) {
                                        this._selectedLensSize = lensSizeObj.value;
                                        this._showLensSize = true;
                                    } //BS-1916
                                }
                            });
                            if (this._lensSizeOptions && this._lensSizeOptions.length > 0) {
                                this._showLensOptions = true;
                                let evt = { target: { value: this._selectedLensSize } };
                                this.handleLensSizeSelection(evt);
                                this._isLoading = true;
                            }
                        }
                    } //BS-1636 end

                    if (
                        this.lensConfiguratorCollection !== undefined &&
                        this.lensConfiguratorCollection !== null &&
                        this.lensConfiguratorCollection.lensConfiguratorID !== undefined &&
                        this.lensConfiguratorCollection.lensConfiguratorID !== null &&
                        this._fromLensShapeFilter == false
                    ) {
                        this._isLoading = true;
                        await getShapeSelectionScreenData({ recordId: this.lensConfiguratorCollection.lensConfiguratorID })
                            .then((result) => {
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
                                        this._parsedData = this._readOnlyOriginalParsedData;

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
                                        parsedData.height = result.omaSuccessResponseWrapper.height
                                            ? JSON.parse(result.omaSuccessResponseWrapper.height)
                                            : null;
                                        parsedData.oma = result.omaSuccessResponseWrapper.oma ? result.omaSuccessResponseWrapper.oma : null;
                                        parsedData.width = result.omaSuccessResponseWrapper.width ? JSON.parse(result.omaSuccessResponseWrapper.width) : null;
                                        /* Start : Fix for Lens shape and size when navigated from My Vs/RX */
                                        if (
                                            this.fromMyVsRx === true &&
                                            this._isNotRimlessFrame == false &&
                                            result.lensConfiguratorObj !== undefined &&
                                            result.lensConfiguratorObj !== null
                                        ) {
                                            this._showAllValue =
                                                result.lensConfiguratorObj.B2B_Show_All_Shapes__c !== undefined &&
                                                result.lensConfiguratorObj.B2B_Show_All_Shapes__c !== null
                                                    ? result.lensConfiguratorObj.B2B_Show_All_Shapes__c
                                                    : false;
                                            if (
                                                result.lensConfiguratorObj.B2B_Lens_Shape__c !== undefined &&
                                                result.lensConfiguratorObj.B2B_Lens_Shape__c !== null
                                            ) {
                                                this._selectedLensShape = result.lensConfiguratorObj.B2B_Lens_Shape__c;
                                                this._searchTerm = this._selectedLensShape;
                                            }
                                            if (
                                                result.lensConfiguratorObj.B2B_Lens_Size__c !== undefined &&
                                                result.lensConfiguratorObj.B2B_Lens_Size__c !== null
                                            ) {
                                                this._selectedLensSize = result.lensConfiguratorObj.B2B_Lens_Size__c.toString();
                                            }
                                            if (this._showAllValue === true && this._getAllDataCompleted === false) {
                                                this.getLensShapeOptions();
                                                this._getAllDataCompleted = true;
                                            }
                                        }
                                        /* End : Fix for Lens shape and size when navigated from My Vs/RX */
                                        let clonedOriginalParsedData = originalParsedData;
                                        this._omaCalloutSuccessWrapperString = JSON.stringify(clonedOriginalParsedData);
                                        this._omaCalloutSuccessWrapperString = this._omaCalloutSuccessWrapperString.replace(/end/g, 'ends');
                                        let clonedParsedData = parsedData;
                                        this._updatedOmaCalloutSuccessWrapperString = JSON.stringify(clonedParsedData);
                                        this._updatedOmaCalloutSuccessWrapperString = this._updatedOmaCalloutSuccessWrapperString.replace(/end/g, 'ends');
                                        this._readOnlyParsedData = { data: parsedData };
                                        this._parsedData = this._readOnlyOriginalParsedData;
                                        this._onLoad = true;
                                    }
                                    if (result.lensConfiguratorObj) {
                                        this._shapeEditorCollection = updateShapeEditorCollection(
                                            originalParsedData,
                                            result.lensConfiguratorObj,
                                            this._shapeEditorCollection
                                        );
                                        if (this._showOmaShapeScreen == true) {
                                            this.showShapeSelectionScreenFieldValuesOnLoad(result.lensConfiguratorObj);
                                        }
                                    }
                                }
                            })
                            .catch((errorInstance) => {});
                    }
                    this._initialSetupDone = true;
                    this._isLoading = false;
                } else {
                    this._initialSetupDone = true;
                    this._isLoading = false;
                }
            })
            .then(() => {
                const canvasElement = this.template.querySelector('[data-id="c"]');
                if (canvasElement !== undefined && canvasElement !== null && this._fromLensShapeFilter == false) {
                    if (
                        this._shapeSelectionData.a == 0 &&
                        this._shapeSelectionData.b == 0 &&
                        this._shapeSelectionData.sf == 0 &&
                        this._shapeSelectionData.b1 == 0 &&
                        this._shapeSelectionData.b2 == 0 &&
                        this._shapeSelectionData.blp == 0
                    ) {
                        DrawGlass(this._readOnlyOriginalParsedData, canvasElement);
                    } else {
                        this._stopDrawGlass = true; //BS-2380
                        DrawGlass(this._readOnlyOriginalParsedData, canvasElement);
                        UpdateDrawGlass(this._readOnlyOriginalParsedData, this._readOnlyParsedData.data, canvasElement);
                    }
                }
            })
            .catch((error) => {
                this._initialSetupDone = true;
                this._isLoading = false;
            });
    }

    handleLensShapeFiltering(event) {
        let showAllValue = event.target.checked;
        this._lensShapeOptions = [];
        this._lensShapeData = null;
        this._showAllValue = showAllValue;
        if (
            this._showAllValue == false &&
            this._nonExclusiveLensShapeList != undefined &&
            this._nonExclusiveLensShapeList != null &&
            this._nonExclusiveLensShapeList.includes(this._selectedLensShape) == false
        ) {
            this._showOmaShapeScreen = true;
            this._selectedLensShape = null;
            this._selectedLensSize = null;
            this._showLensSize = false;
            this._colorOptions = [];
            this.setDataToDefaultValues();
        }
        this._showOmaShapeScreen = false;
        this._fromLensShapeFilter = true;
        this.getLensShapeOptions();
    }

    /**
     * BS-722
     * This method handles the onclick of the lens size
     * combobox
     */
    handleLensSizeSelection(event) {
        this._selectedLensSize = event.target.value;
        this._onLoad = false;
        this._isLensSizeInValid = false;
        this._omaShapeKeyValue = null;
        this._mountingType = null;
        this.setDataToDefaultValues();

        this._isLoading = true;
        this.resetShapeEditorContents(); //BS-791
        this._lensShapeData.forEach((item) => {
            if (this._selectedLensShape === item.B2B_Shape_Name__c && this._selectedLensSize === item.B2B_Size__c) {
                this._selectedLensShapeRecordId = item.Id;
                this._omaShapeKeyValue = item.B2B_OMAShapeKey__c ? item.B2B_OMAShapeKey__c : null;
                this._mountingType = item.B2B_Mounting_Type__c ? item.B2B_Mounting_Type__c : '';
                //BS-1473 start

                if (this._withAccentRingOptions.length > 0) {
                    let withAccentRingOptions = JSON.parse(JSON.stringify(this._withAccentRingOptions));
                    withAccentRingOptions.forEach((option) => {
                        option.isChecked = false;
                        if (
                            (item.B2B_Default_Features__c && item.B2B_Default_Features__c.includes(WITH_ACCENT_RING_VALUE) == true) ||
                            (item.B2B_Available_features__c && item.B2B_Available_features__c.includes(WITH_ACCENT_RING_VALUE) == true)
                        ) {
                            if (item.B2B_Default_Features__c && item.B2B_Default_Features__c.includes(WITH_ACCENT_RING_VALUE) == true) {
                                if (option.name == YES) {
                                    option.isChecked = true;
                                    this._withAccentRingValue = true;
                                }
                            } else {
                                if (option.name == NO) {
                                    option.isChecked = true;
                                    this._withAccentRingValue = false;
                                }
                            }
                            this._showAccentRingSection = true;
                            this._accentRingImage = null;
                        } else {
                            this._showAccentRingSection = false;
                            this._withAccentRingValue = false;
                        }
                    });
                    this._withAccentRingOptions = JSON.parse(JSON.stringify(withAccentRingOptions));
                }

                if (this._withColoredGrooveOptions.length > 0) {
                    let withColoredGrooveOptions = JSON.parse(JSON.stringify(this._withColoredGrooveOptions));
                    withColoredGrooveOptions.forEach((option) => {
                        option.isChecked = false;
                        if (
                            (item.B2B_Default_Features__c && item.B2B_Default_Features__c.includes(WITH_COLORED_GROOVE) == true) ||
                            (item.B2B_Available_features__c && item.B2B_Available_features__c.includes(WITH_COLORED_GROOVE) == true) ||
                            (item.B2B_Default_Features__c && item.B2B_Default_Features__c.includes(PARTIAL_GROOVE_VALUE) == true) ||
                            (item.B2B_Available_features__c && item.B2B_Available_features__c.includes(PARTIAL_GROOVE_VALUE) == true)
                        ) {
                            if (
                                (item.B2B_Default_Features__c && item.B2B_Default_Features__c.includes(PARTIAL_GROOVE_VALUE) == true) ||
                                (item.B2B_Available_features__c && item.B2B_Available_features__c.includes(PARTIAL_GROOVE_VALUE) == true)
                            ) {
                                this._withColorGrooveLabel = WITH_PARTIAL_COLOR_GROOVE_LABEL.split(',')[0];
                                this._partialColorGroove = true;
                            }
                            if (
                                (item.B2B_Default_Features__c && item.B2B_Default_Features__c.includes(WITH_COLORED_GROOVE) == true) ||
                                (item.B2B_Default_Features__c && item.B2B_Default_Features__c.includes(PARTIAL_GROOVE_VALUE) == true)
                            ) {
                                if (option.name == YES) {
                                    option.isChecked = true;
                                    this._withColoredGrooveValue = true;
                                    this.getColoredGrooveColor();
                                }
                            } else {
                                if (option.name == NO) {
                                    option.isChecked = true;
                                    this._withColoredGrooveValue = false;
                                }
                            }
                            this._showColoredGrooveSection = true;
                        } else {
                            this._showColoredGrooveSection = false;
                            this._withColoredGrooveValue = false;
                        }
                    });
                    this._withColoredGrooveOptions = JSON.parse(JSON.stringify(withColoredGrooveOptions));
                }

                // BS-1473 end

                if (
                    this._isOrderTypeLensOnly == true &&
                    item.B2B_Lens_Only_Available__c &&
                    item.B2B_Lens_Only_Available__c.includes(REMOVE_DRILLS_VALUE) === true
                ) {
                    this._showRemoveDrills = true;
                    this._shapeSelectionData.removeDrills = false;
                } else {
                    this._showRemoveDrills = false;
                    this._shapeSelectionData.removeDrills = false;
                }
                this._shapeSelectionData.features = null;
                this._shapeSelectionData.lensShape = this._selectedLensShape;
                this._shapeSelectionData.lensSize = this._selectedLensSize;
                this._shapeSelectionData.selectedLensShapeId = this._selectedLensShapeRecordId;
                this._shapeSelectionData.a = 0;
                this._shapeSelectionData.b = 0;
                this._shapeSelectionData.sf = 0;
                this._shapeSelectionData.b1 = 0;
                this._shapeSelectionData.b2 = 0;
                this._shapeSelectionData.blp = 0;
                this.getOmaCalloutResponse();
                //Add commented code from utils component for testing purpose in case of OMA server down issue
            }
        });
    }

    /**
     * BS-1473
     * This is the handler for accent ring value selection.
     */
    handleWithAccentRingChange(event) {
        let withAccentRingValue = event.target.value;
        this._shapeSelectionData.withAccentRingValue = withAccentRingValue == TRUE ? true : false;
        this._removeGrooveOptions = [
            { label: this._yesLabel, name: YES, value: true, isChecked: false },
            { label: this._noLabel, name: NO, value: false, isChecked: true }
        ];
        this.resetAccenRingData();
        if (this._withAccentRingOptions.length > 0) {
            let withAccentRingOptions = JSON.parse(JSON.stringify(this._removeDrillsOptions));
            withAccentRingOptions.forEach((option) => {
                option.isChecked = false;
                if (withAccentRingValue == TRUE && option.name == YES) {
                    option.isChecked = true;
                    this.getAccentRingColor();
                    this._withAccentRingValue = true;
                } else if (withAccentRingValue == FALSE && option.name == NO) {
                    option.isChecked = true;
                    this._withAccentRingValue = false;
                }
            });
            this._withAccentRingOptions = JSON.parse(JSON.stringify(withAccentRingOptions));
        }
    }

    /**
     * BS-1493
     * handler of the with color groove change
     */
    handleWithColoredGrooveChange(event) {
        let withColoredGrooveValue = event.target.value;
        this._shapeSelectionData.withColoredGrooveValue = withColoredGrooveValue == TRUE ? true : false;
        this.resetColorGrooveData();
        if (this._withColoredGrooveOptions.length > 0) {
            let withColoredGrooveOption = JSON.parse(JSON.stringify(this._withColoredGrooveOptions));
            withColoredGrooveOption.forEach((option) => {
                option.isChecked = false;
                if (withColoredGrooveValue == TRUE && option.name == YES) {
                    option.isChecked = true;
                    this.getColoredGrooveColor();
                    this._withColoredGrooveValue = true;
                } else if (withColoredGrooveValue == FALSE && option.name == NO) {
                    option.isChecked = true;
                    this._withColoredGrooveValue = false;
                }
            });
            this._withColoredGrooveOptions = JSON.parse(JSON.stringify(withColoredGrooveOption));
        }
        this._isLoading = true;
        this._resetShapeEdiorValues = true;
        this._callDrawGlass = true;
        this.getScaleShapeFromOMACallout();
    }

    /**
     *Fetch accent ring color from product2 selected accent ring color selected
     */
    getAccentRingImage() {
        this._accentRingImage = null;
        this._showAccentRingImage = false;
        this._isLoading = true;
        getAccentRingImage({
            productId: this._selectedAccentRingColorProductId
        })
            .then((result) => {
                if (result !== undefined && result !== null) {
                    this._accentRingImage = result[0].B2B_Image_URL__c ? result[0].B2B_Image_URL__c : null;
                    this._showAccentRingImage = true;
                }
                this._isLoading = false;
            })
            .catch((error) => {
                this._isLoading = false;
            });
    }

    /**
     * BS-1473
     * Fetch accent ring color from product2 selected lens size and lens shape.
     */
    getAccentRingColor() {
        if (this._isLoading == false) {
            this._isLoading = true;
        }
        getAccentRingColor({
            lensShape: this._selectedLensShape,
            shapeSize: this._selectedLensSize,
            effectiveAccountId: this.effectiveAccountId
        })
            .then((result) => {
                if (result !== undefined && result !== null) {
                    this._accentRingColorOptions = [];
                    let resultObj = JSON.parse(JSON.stringify(result));
                    this._colorOptions = [];
                    resultObj.forEach((item) => {
                        let color = {};
                        //BS-2063
                        if (item.B2B_Availability_JSON__c != undefined && checkProductAvailability(item.B2B_Availability_JSON__c, this.countryCode) == false) {
                            if (item.B2B_Color_Number__c && this._colorOptions.includes(item.B2B_Color_Number__c) == false) {
                                let colorHexCode = item.B2B_Hexcode__c ? item.B2B_Hexcode__c + ';' : '#3f242900;';
                                let frameColorDescription = item.B2B_Frame_Color_Description__c ? item.B2B_Frame_Color_Description__c : '';
                                color = {
                                    label: item.B2B_Color_Number__c + ' ' + frameColorDescription,
                                    styling: STYLING_BACKGROUND_COLOR + colorHexCode,
                                    accentRingColorSku: item.StockKeepingUnit ? item.StockKeepingUnit : '',
                                    productId: item.Id ? item.Id : ''
                                };
                                this._accentRingColorOptions.push(color);
                                this._colorOptions.push(item.B2B_Color_Number__c);
                            }
                        }
                    });
                    this._showColorOption = true;
                }
                this._isLoading = false;
            })
            .catch((error) => {});
    }

    /**
     * BS-1493
     * To Fetch the color groove product.
     */
    getColoredGrooveColor() {
        getColoredGrooveColor({ effectiveAccountId: this.effectiveAccountId })
            .then((result) => {
                if (result !== undefined && result !== null) {
                    this._coloredGrooveColorOptions = [];
                    let resultObj = JSON.parse(JSON.stringify(result));
                    this._colorGrooveOptions = [];
                    resultObj.forEach((item) => {
                        let color = {};
                        //BS-2063
                        if (
                            item.Product.B2B_Availability_JSON__c != undefined &&
                            checkProductAvailability(item.Product.B2B_Availability_JSON__c, this.countryCode) == false
                        ) {
                            if (item.Product.Name && this._colorGrooveOptions.includes(item.Product.Name) == false) {
                                let colorHexCode = item.Product.B2B_Hexcode__c ? item.Product.B2B_Hexcode__c + ';' : '#3f242900;';
                                color = {
                                    label: item.Product.Name,
                                    styling: STYLING_BACKGROUND_COLOR + colorHexCode,
                                    accentRingColorSku: item.Product.StockKeepingUnit ? item.Product.StockKeepingUnit : '',
                                    productId: item.Product.Id ? item.Product.Id : ''
                                };
                                this._coloredGrooveColorOptions.push(color);
                                this._colorGrooveOptions.push(item.Product.B2B_Color_Number__c);
                            }
                        }
                    });
                }
            })
            .catch((error) => {
                this._isLoading = false;
            });
    }

    /**
     * BS-1473
     * This method is the handler for the remove groove selection.
     */
    handleRemoveGrooveSelection(event) {
        let removeGrooveValue = event.target.value;
        this._shapeSelectionData.withAccentRingValue = removeGrooveValue == TRUE ? true : false;
        if (this._removeGrooveOptions.length > 0) {
            let removeGrooveOptions = JSON.parse(JSON.stringify(this._removeDrillsOptions));
            removeGrooveOptions.forEach((option) => {
                option.isChecked = false;
                if (removeGrooveValue == TRUE && option.name == YES) {
                    option.isChecked = true;
                    this._removeGrooveValue = true;
                } else if (removeGrooveValue == FALSE && option.name == NO) {
                    option.isChecked = true;
                    this._removeGrooveValue = false;
                }
            });
            this._removeGrooveOptions = JSON.parse(JSON.stringify(removeGrooveOptions));
        }
    }
    /**
     * BS-792
     * This method handles the onchange of the remove drill
     * radio buttons
     */
    handleRemoveDrillsSelection(event) {
        let removeDrillsValue = event.target.value;
        this._shapeSelectionData.removeDrills = removeDrillsValue == TRUE ? true : false;
        if (this._removeDrillsOptions.length > 0) {
            let removeDrillsOption = JSON.parse(JSON.stringify(this._removeDrillsOptions));
            removeDrillsOption.forEach((option) => {
                option.isChecked = false;
                if (removeDrillsValue == TRUE && option.name == YES) {
                    option.isChecked = true;
                } else if (removeDrillsValue == FALSE && option.name == NO) {
                    option.isChecked = true;
                }
            });
            this._removeDrillsOptions = JSON.parse(JSON.stringify(removeDrillsOption));
        }
        this._isLoading = true;
        this._callDrawGlass = true;
        this._resetShapeEdiorValues = true;

        this.getScaleShapeFromOMACallout();
    }

    /**
     * BS-722
     * This method initiates the OMA Callout and, Draws the glass.
     */
    getOmaCalloutResponse() {
        this._isLoading = true;
        this._parsedData = null;
        getLensShape({
            lensConfiguratorId: this.lensConfiguratorCollection.lensConfiguratorID,
            lensShapeId: this._selectedLensShapeRecordId,
            selectedLensInformationMap: this._shapeSelectionData,
            calloutType: CALLOUT_TYPE_OMA_SHAPE
        })
            .then((response) => {
                this._parsedData = null;
                if (
                    response != undefined &&
                    response != null &&
                    response.omaSuccessResponseWrapper != undefined &&
                    response.omaSuccessResponseWrapper != null
                ) {
                    //BS-791 - Start
                    this._omaCalloutFailed = false;
                    let parsedShapeEditorCollection = JSON.parse(JSON.stringify(this._shapeEditorCollection));
                    parsedShapeEditorCollection.forEach((item) => {
                        if (
                            response.omaSuccessResponseWrapper &&
                            response.omaSuccessResponseWrapper.allowedScaling &&
                            Object.keys(response.omaSuccessResponseWrapper.allowedScaling).length > 0
                        ) {
                            if (item.label == SHAPE_SELECTION_LABELS.split(',')[12]) {
                                //for shape adjustment attribute : a
                                if (response.omaSuccessResponseWrapper.allowedScaling.a) {
                                    item.maximumAllowedValue =
                                        response.omaSuccessResponseWrapper.allowedScaling.a &&
                                        response.omaSuccessResponseWrapper.allowedScaling.a.max &&
                                        response.omaSuccessResponseWrapper.allowedScaling.a.max != 0
                                            ? response.omaSuccessResponseWrapper.allowedScaling.a.max
                                            : item.maximumAllowedValue;
                                    item.minimumAllowedValue =
                                        response.omaSuccessResponseWrapper.allowedScaling.a &&
                                        response.omaSuccessResponseWrapper.allowedScaling.a.min &&
                                        response.omaSuccessResponseWrapper.allowedScaling.a.min != 0
                                            ? response.omaSuccessResponseWrapper.allowedScaling.a.min
                                            : item.minimumAllowedValue;
                                    item.isAdjustable =
                                        response.omaSuccessResponseWrapper.allowedScaling.a &&
                                        ((response.omaSuccessResponseWrapper.allowedScaling.a.min &&
                                            response.omaSuccessResponseWrapper.allowedScaling.a.min != 0) ||
                                            (response.omaSuccessResponseWrapper.allowedScaling.a.max &&
                                                response.omaSuccessResponseWrapper.allowedScaling.a.max != 0))
                                            ? true
                                            : false;
                                    item.helpText =
                                        response.omaSuccessResponseWrapper.allowedScaling.a &&
                                        response.omaSuccessResponseWrapper.allowedScaling.a.max &&
                                        response.omaSuccessResponseWrapper.allowedScaling.a.min
                                            ? item.baseHelpText +
                                              ANGULAR_BRACKET_START +
                                              response.omaSuccessResponseWrapper.allowedScaling.a.min +
                                              HYPHEN +
                                              response.omaSuccessResponseWrapper.allowedScaling.a.max +
                                              ANGULAR_BRACKET_END
                                            : item.helpText;
                                }
                            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[13]) {
                                //for shape adjustment attribute : b
                                if (response.omaSuccessResponseWrapper.allowedScaling.b) {
                                    item.maximumAllowedValue =
                                        response.omaSuccessResponseWrapper.allowedScaling.b &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b.max &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b.max != 0
                                            ? response.omaSuccessResponseWrapper.allowedScaling.b.max
                                            : item.maximumAllowedValue;
                                    item.minimumAllowedValue =
                                        response.omaSuccessResponseWrapper.allowedScaling.b &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b.min &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b.min != 0
                                            ? response.omaSuccessResponseWrapper.allowedScaling.b.min
                                            : item.minimumAllowedValue;
                                    item.isAdjustable =
                                        response.omaSuccessResponseWrapper.allowedScaling.b &&
                                        ((response.omaSuccessResponseWrapper.allowedScaling.b.min &&
                                            response.omaSuccessResponseWrapper.allowedScaling.b.min != 0) ||
                                            (response.omaSuccessResponseWrapper.allowedScaling.b.max &&
                                                response.omaSuccessResponseWrapper.allowedScaling.b.max != 0))
                                            ? true
                                            : false;
                                    item.helpText =
                                        response.omaSuccessResponseWrapper.allowedScaling.b &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b.max &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b.min
                                            ? item.baseHelpText +
                                              ANGULAR_BRACKET_START +
                                              response.omaSuccessResponseWrapper.allowedScaling.b.min +
                                              HYPHEN +
                                              response.omaSuccessResponseWrapper.allowedScaling.b.max +
                                              ANGULAR_BRACKET_END
                                            : item.helpText;
                                }
                            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[14]) {
                                //for shape adjustment attribute : sf
                                if (response.omaSuccessResponseWrapper.allowedScaling.sf) {
                                    item.maximumAllowedValue =
                                        response.omaSuccessResponseWrapper.allowedScaling.sf &&
                                        response.omaSuccessResponseWrapper.allowedScaling.sf.max &&
                                        response.omaSuccessResponseWrapper.allowedScaling.sf.max != 0
                                            ? response.omaSuccessResponseWrapper.allowedScaling.sf.max
                                            : item.maximumAllowedValue;
                                    item.minimumAllowedValue =
                                        response.omaSuccessResponseWrapper.allowedScaling.sf &&
                                        response.omaSuccessResponseWrapper.allowedScaling.sf.min &&
                                        response.omaSuccessResponseWrapper.allowedScaling.sf.min != 0
                                            ? response.omaSuccessResponseWrapper.allowedScaling.sf.min
                                            : item.minimumAllowedValue;
                                    item.isAdjustable =
                                        response.omaSuccessResponseWrapper.allowedScaling.sf &&
                                        ((response.omaSuccessResponseWrapper.allowedScaling.sf.min &&
                                            response.omaSuccessResponseWrapper.allowedScaling.sf.min != 0) ||
                                            (response.omaSuccessResponseWrapper.allowedScaling.sf.max &&
                                                response.omaSuccessResponseWrapper.allowedScaling.sf.max != 0))
                                            ? true
                                            : false;
                                    item.helpText =
                                        response.omaSuccessResponseWrapper.allowedScaling.sf &&
                                        response.omaSuccessResponseWrapper.allowedScaling.sf.max &&
                                        response.omaSuccessResponseWrapper.allowedScaling.sf.min
                                            ? item.baseHelpText +
                                              ANGULAR_BRACKET_START +
                                              response.omaSuccessResponseWrapper.allowedScaling.sf.min +
                                              HYPHEN +
                                              response.omaSuccessResponseWrapper.allowedScaling.sf.max +
                                              ANGULAR_BRACKET_END
                                            : item.helpText;
                                }
                            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[15]) {
                                //for shape adjustment attribute : b1
                                if (response.omaSuccessResponseWrapper.allowedScaling.b1) {
                                    item.maximumAllowedValue =
                                        response.omaSuccessResponseWrapper.allowedScaling.b1 &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b1.max &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b1.max != 0
                                            ? response.omaSuccessResponseWrapper.allowedScaling.b1.max
                                            : item.maximumAllowedValue;
                                    item.minimumAllowedValue =
                                        response.omaSuccessResponseWrapper.allowedScaling.b1 &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b1.min &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b1.min != 0
                                            ? response.omaSuccessResponseWrapper.allowedScaling.b1.min
                                            : item.minimumAllowedValue;
                                    item.isAdjustable =
                                        response.omaSuccessResponseWrapper.allowedScaling.b1 &&
                                        ((response.omaSuccessResponseWrapper.allowedScaling.b1.min &&
                                            response.omaSuccessResponseWrapper.allowedScaling.b1.min != 0) ||
                                            (response.omaSuccessResponseWrapper.allowedScaling.b1.max &&
                                                response.omaSuccessResponseWrapper.allowedScaling.b1.max != 0))
                                            ? true
                                            : false;
                                    item.helpText =
                                        response.omaSuccessResponseWrapper.allowedScaling.b1 &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b1.max &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b1.min
                                            ? item.baseHelpText +
                                              ANGULAR_BRACKET_START +
                                              response.omaSuccessResponseWrapper.allowedScaling.b1.min +
                                              HYPHEN +
                                              response.omaSuccessResponseWrapper.allowedScaling.b1.max +
                                              ANGULAR_BRACKET_END
                                            : item.helpText;
                                }
                            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[16]) {
                                //for shape adjustment attribute : b2
                                if (response.omaSuccessResponseWrapper.allowedScaling.b2) {
                                    item.maximumAllowedValue =
                                        response.omaSuccessResponseWrapper.allowedScaling.b2 &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b2.max &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b2.max != 0
                                            ? response.omaSuccessResponseWrapper.allowedScaling.b2.max
                                            : item.maximumAllowedValue;
                                    item.minimumAllowedValue =
                                        response.omaSuccessResponseWrapper.allowedScaling.b2 &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b2.min &&
                                        response.omaSuccessResponseWrapper.allowedScaling.b2.min != 0
                                            ? response.omaSuccessResponseWrapper.allowedScaling.b2.min
                                            : item.minimumAllowedValue;
                                    item.isAdjustable =
                                        response.omaSuccessResponseWrapper.allowedScaling.b2 &&
                                        ((response.omaSuccessResponseWrapper.allowedScaling.b2.min &&
                                            response.omaSuccessResponseWrapper.allowedScaling.b2.min != 0) ||
                                            (response.omaSuccessResponseWrapper.allowedScaling.b2.max &&
                                                response.omaSuccessResponseWrapper.allowedScaling.b2.max != 0))
                                            ? true
                                            : false;
                                    item.helpText =
                                        response.omaSuccessResponseWrapper.allowedScaling.b2 &&
                                        (response.omaSuccessResponseWrapper.allowedScaling.b2.max || response.omaSuccessResponseWrapper.allowedScaling.b2.min)
                                            ? item.baseHelpText +
                                              ANGULAR_BRACKET_START +
                                              response.omaSuccessResponseWrapper.allowedScaling.b2.min +
                                              HYPHEN +
                                              response.omaSuccessResponseWrapper.allowedScaling.b2.max +
                                              ANGULAR_BRACKET_END
                                            : item.helpText;
                                }
                            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[17] || (item.label && item.label == ADJUSTMENT_ATTRIBUTE_BLP)) {
                                //for shape adjustment attribute : blp/dhp
                                if (response.omaSuccessResponseWrapper.allowedScaling.blp) {
                                    item.maximumAllowedValue =
                                        response.omaSuccessResponseWrapper.allowedScaling.blp &&
                                        response.omaSuccessResponseWrapper.allowedScaling.blp.max &&
                                        response.omaSuccessResponseWrapper.allowedScaling.blp.max != 0
                                            ? response.omaSuccessResponseWrapper.allowedScaling.blp.max
                                            : item.maximumAllowedValue;
                                    item.minimumAllowedValue =
                                        response.omaSuccessResponseWrapper.allowedScaling.blp &&
                                        response.omaSuccessResponseWrapper.allowedScaling.blp.min &&
                                        response.omaSuccessResponseWrapper.allowedScaling.blp.min != 0
                                            ? response.omaSuccessResponseWrapper.allowedScaling.blp.min
                                            : item.minimumAllowedValue;
                                    item.isAdjustable =
                                        response.omaSuccessResponseWrapper.allowedScaling.blp &&
                                        ((response.omaSuccessResponseWrapper.allowedScaling.blp.min &&
                                            response.omaSuccessResponseWrapper.allowedScaling.blp.min != 0) ||
                                            (response.omaSuccessResponseWrapper.allowedScaling.blp.max &&
                                                response.omaSuccessResponseWrapper.allowedScaling.blp.max != 0))
                                            ? true
                                            : false;
                                    item.helpText =
                                        response.omaSuccessResponseWrapper.allowedScaling.blp &&
                                        response.omaSuccessResponseWrapper.allowedScaling.blp.max &&
                                        response.omaSuccessResponseWrapper.allowedScaling.blp.min
                                            ? item.baseHelpText +
                                              ANGULAR_BRACKET_START +
                                              response.omaSuccessResponseWrapper.allowedScaling.blp.min +
                                              HYPHEN +
                                              response.omaSuccessResponseWrapper.allowedScaling.blp.max +
                                              ANGULAR_BRACKET_END
                                            : item.helpText;
                                }
                            }
                        } else {
                            item.isAdjustable = false;
                        }
                    });
                    this._shapeEditorCollection = parsedShapeEditorCollection;
                    let hideVisualizeAdjustedShapeButton = false;
                    this._shapeEditorCollection.forEach((shape) => {
                        if (shape.isAdjustable == false) {
                            hideVisualizeAdjustedShapeButton = true;
                        }
                    });
                    this._visualizeShapeButtonDisable = hideVisualizeAdjustedShapeButton == true ? true : false;
                    //BS-791 - End
                    this._omaCalloutSuccessWrapperString = JSON.stringify(response.omaSuccessResponseWrapper);
                    this._parsedData = { data: response.omaSuccessResponseWrapper };
                    this._preservedOriginalParsedData = JSON.parse(JSON.stringify(this._parsedData));
                    this._preservedOriginalOmaCalloutSuccessWrapperString = JSON.stringify(response.omaSuccessResponseWrapper);
                } else if (response.statusCode == 404) {
                    this._isValid = false;
                    this._omaCalloutFailed = true;
                    this._responseMessage = B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE + LINE_BREAK_TAG + B2B_CALLOUT_RESPONSE_LABELS.split(',')[0];
                    this._isLoading = false;
                    /* Start : BS-1706 */
                } else if (response.statusCode >= 500) {
                    /* End : BS-1706 */
                    this._isValid = false;
                    this._omaCalloutFailed = true;
                    this._responseMessage = B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE + LINE_BREAK_TAG + B2B_CALLOUT_RESPONSE_LABELS.split(',')[0];
                    this._isLoading = false;
                } else {
                    //BS-791
                    this._isValid = false;
                    showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
                    this._isLoading = false;
                    //BS-791
                }
                if (this._parsedData != null) {
                    this._showLensShapeImage = true;
                    var stringifiedResponse = JSON.stringify(this._parsedData);
                    stringifiedResponse = stringifiedResponse.replace(/ends/g, 'end');
                    this._parsedData = JSON.parse(stringifiedResponse);
                    this._shapeSelectionData.selectedShapeHeight = this._parsedData.height;
                    this._shapeSelectionData.selectedShapeWidth = this._parsedData.width;
                    this._width = this._parsedData.data.width;
                    this._height = this._parsedData.data.height;
                    this._width = this.trimUptoTwoDecimalPlaces(this._width);
                    this._height = this.trimUptoTwoDecimalPlaces(this._height);
                    this._shapeSelectionData.height = this._height;
                    this._shapeSelectionData.width = this._width;
                }
                if (this._showAccentRingSection == true) {
                    this.getAccentRingColor();
                }
                this._isLoading = false;
            })
            .then(() => {
                if (this._parsedData != null) {
                    const canvasElement = this.template.querySelector('[data-id="c"]');
                    //Added if block BS-2380
                    if (this._stopDrawGlass === false) {
                        DrawGlass(this._parsedData, canvasElement);
                        this._isLoading = false;
                        let lensShapeImageUrl = canvasElement.toDataURL('image/jpeg');
                        this._shapeSelectionData.lensShapeImageUrl = lensShapeImageUrl;
                        if (lensShapeImageUrl != null && lensShapeImageUrl != undefined) {
                            lensShapeImageUrl = lensShapeImageUrl.split(',')[1];
                            this._shapeSelectionData.lensShapeImage = lensShapeImageUrl;
                        }
                    }
                }
                this._stopDrawGlass = false; //BS-2380 end
            })
            .catch((error) => {
                this._isLoading = false;
                console.error(error);
                this._isValid = false;
                showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
                this._isLoading = false;
            });
    }

    /**
     * BS-791
     * This method initiates the OMA Callout with adjustments done by user on UI post success draws the updated glass
     */
    @api
    async getScaleShapeFromOMACallout() {
        this._isLoading = true;
        if (this._modifiedShapeValues != null && this._modifiedShapeValues != undefined && this._modifiedShapeValues == false) {
            return true;
        }
        let calloutResponse; //BS-2407
        this._shapeAdjusted = true;
        this._shapeEditorCollection.forEach((item) => {
            if (item.label == SHAPE_SELECTION_LABELS.split(',')[12]) {
                this._shapeSelectionData.a = item.modifiedValue;
            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[13]) {
                this._shapeSelectionData.b = item.modifiedValue;
            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[14]) {
                this._shapeSelectionData.sf = item.modifiedValue;
            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[15]) {
                this._shapeSelectionData.b1 = item.modifiedValue;
            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[16]) {
                this._shapeSelectionData.b2 = item.modifiedValue;
            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[17] || (item.label && item.label == ADJUSTMENT_ATTRIBUTE_BLP)) {
                this._shapeSelectionData.blp = item.modifiedValue;
            }
        });
        if (this._resetShapeEdiorValues == true) {
            this._showValidationMessage = false;
            this._validationAdjustementAttributesCollection = [];
            let shapeEditorCollection = JSON.parse(JSON.stringify(this._shapeEditorCollection));
            shapeEditorCollection.forEach((item) => {
                if (item.label == SHAPE_SELECTION_LABELS.split(',')[12]) {
                    this._shapeSelectionData.a = item.originalValue;
                    item.modifiedValue = item.originalValue;
                } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[13]) {
                    this._shapeSelectionData.b = item.originalValue;
                    item.modifiedValue = item.originalValue;
                } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[14]) {
                    this._shapeSelectionData.sf = item.originalValue;
                    item.modifiedValue = item.originalValue;
                } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[15]) {
                    this._shapeSelectionData.b1 = item.originalValue;
                    item.modifiedValue = item.originalValue;
                } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[16]) {
                    this._shapeSelectionData.b2 = item.originalValue;
                    item.modifiedValue = item.originalValue;
                } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[17] || (item.label && item.label == ADJUSTMENT_ATTRIBUTE_BLP)) {
                    this._shapeSelectionData.blp = item.originalValue;
                    item.modifiedValue = item.originalValue;
                }
            });
            this._shapeEditorCollection = JSON.parse(JSON.stringify(shapeEditorCollection));
        }
        this._resetShapeEdiorValues = false;
        await getLensShape({
            lensConfiguratorId: this.lensConfiguratorCollection.lensConfiguratorID,
            lensShapeId: this._selectedLensShapeRecordId,
            selectedLensInformationMap: this._shapeSelectionData,
            calloutType: CALLOUT_TYPE_OMA_SCALE
        })
            .then((wrapperResponse) => {
                if (wrapperResponse != undefined && wrapperResponse != null && wrapperResponse.omaSuccessResponseWrapper) {
                    this._updatedOmaCalloutSuccessWrapperString = JSON.stringify(wrapperResponse.omaSuccessResponseWrapper);
                    this._updatedParsedData = { data: wrapperResponse.omaSuccessResponseWrapper };
                } else if (wrapperResponse.statusCode == 404) {
                    this._isValid = false;
                    this._omaCalloutFailed = true;
                    this._responseMessage = B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE + LINE_BREAK_TAG + B2B_CALLOUT_RESPONSE_LABELS.split(',')[0];
                    this._isLoading = false;
                    /* Start : BS-1706 */
                } else if (wrapperResponse.statusCode >= 500) {
                    /* End : BS-1706 */
                    this._isValid = false;
                    this._omaCalloutFailed = true;
                    this._responseMessage = B2B_CALLOUT_ERROR_GENERAL_RESPONSE_MESSAGE + LINE_BREAK_TAG + B2B_CALLOUT_RESPONSE_LABELS.split(',')[0];
                    this._isLoading = false;
                } else {
                    //BS-791
                    this._isValid = false;
                    showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
                    this._isLoading = false;
                    //BS-791
                }
                if (this._updatedParsedData) {
                    var stringifiedResponse = JSON.stringify(this._updatedParsedData);
                    stringifiedResponse = stringifiedResponse.replace(/ends/g, 'end');
                    this._updatedParsedData = JSON.parse(stringifiedResponse);
                    this._shapeSelectionData.selectedShapeHeight = this._updatedParsedData.height;
                    this._shapeSelectionData.selectedShapeWidth = this._updatedParsedData.width;
                    this._width = this._updatedParsedData.data.width;
                    this._height = this._updatedParsedData.data.height;
                    this._width = this.trimUptoTwoDecimalPlaces(this._width);
                    this._height = this.trimUptoTwoDecimalPlaces(this._height);
                }
            })
            .then(() => {
                if (this._parsedData != undefined && this._parsedData != null && this._updatedParsedData != undefined && this._updatedParsedData != null) {
                    const canvasElement = this.template.querySelector('[data-id="c"]');
                    if (this._callDrawGlass == false) {
                        UpdateDrawGlass(this._parsedData, this._updatedParsedData.data, canvasElement);
                    } else if (this._callDrawGlass == true) {
                        DrawGlass(this._updatedParsedData, canvasElement);
                    }
                    this._callDrawGlass = false;
                    this._isLoading = false;
                    let lensShapeImageUrl = canvasElement.toDataURL('image/jpeg');
                    if (lensShapeImageUrl != null && lensShapeImageUrl != undefined) {
                        lensShapeImageUrl = lensShapeImageUrl.split(',')[1];
                        this._shapeSelectionData.lensShapeImage = lensShapeImageUrl;
                    }
                    calloutResponse = true;
                }
            })
            .catch((error) => {
                console.error(error);
                this._isValid = false;
                showToastMessage(this, RESPONSE_MESSAGE, ERROR_TOAST_VARIENT, TOAST_MODE, null);
                this._isLoading = false;
                calloutResponse = false;
            });
        return calloutResponse;
    }

    /**
     * BS-722
     * This method validates inputs
     */
    @api
    async handleValidityCheck() {
        const shapeField = this.template.querySelector(`[data-id="${SHAPE_FIELD}"]`);
        if (shapeField !== undefined && shapeField !== null) {
            shapeField.classList.remove(SET_VISIBILITY);
            shapeField.classList.add(UNSET_VISIBILITY);
        }

        this._isValid = true;
        let valid = true;
        let inputObject = {};
        inputObject._selectedLensShape = this._selectedLensShape;
        inputObject._showLensOptions = this._showLensOptions;
        inputObject._selectedLensSize = this._selectedLensSize;
        inputObject._withAccentRingValue = this._withAccentRingValue;
        inputObject._selectedAccentRingColorProductId = this._selectedAccentRingColorProductId;
        inputObject._withColoredGrooveValue = this._withColoredGrooveValue;
        inputObject._selectedColorGrooveColorProductId = this._selectedColorGrooveColorProductId;
        inputObject._omaCalloutFailed = this._omaCalloutFailed;
        let inputValidationObject;
        await validateInput(inputObject).then((result) => {
            if (result !== undefined && result !== null) {
                inputValidationObject = JSON.parse(JSON.stringify(result));
                this._isLensShapeInValid = inputValidationObject._isLensShapeInValid;
                this._isLensSizeInValid = inputValidationObject._isLensSizeInValid;
                this._isAccentRingColorInvalid = inputValidationObject._isAccentRingColorInvalid;
                this._isColoredGrooveColorInvalid = inputValidationObject._isColoredGrooveColorInvalid;
                this._isValid = inputValidationObject._isValid;
                valid = this._isValid;
            }
        });
        if (
            this._searchTerm !== undefined &&
            this._searchTerm !== null &&
            this._selectedLensShape !== undefined &&
            this._selectedLensShape !== null &&
            this._selectedLensShape.toUpperCase() !== this._searchTerm.toUpperCase()
        ) {
            this._onFieldLoad = false;
            this._shapeVisible = false;
            this._isLensShapeInValid = true;
            valid = false;
        } else {
            this._isLensShapeInValid = inputValidationObject._isLensShapeInValid;
        }

        if (valid === true) {
            if (shapeField !== undefined && shapeField !== null) {
                shapeField.classList.remove(SET_VISIBILITY);
                shapeField.classList.add(UNSET_VISIBILITY);
            }
        }
        return valid;
    }

    /**
     * This method saves the data to lens configurator object
     */
    @api
    updateShapeSelectionData() {
        this._shapeSelectionData.omaShapeKeyValue = this._omaShapeKeyValue;
        this._shapeSelectionData.showAllShapes = this._showAllValue;
        this._shapeSelectionData.withAccentRingValue = this._withAccentRingValue;
        this._shapeSelectionData.removeGrooveValue = this._removeGrooveValue;
        this._shapeSelectionData.accentRingImageUrl = this._accentRingImage;
        this._shapeSelectionData.accentRingColorSKU =
            this._selectedAccentRingColor && this._selectedAccentRingColor.sku ? this._selectedAccentRingColor.sku : '';
        this._shapeSelectionData.accentRingColorProductId = this._selectedAccentRingColorProductId ? this._selectedAccentRingColorProductId : null;
        if (this._mountingType && this._withAccentRingValue === true) {
            this._shapeSelectionData.featureValue = this._mountingType + ',' + AR_PARAMETER;
        } else if (this._mountingType && this._withColoredGrooveValue === true) {
            this._shapeSelectionData.featureValue = this._mountingType + ',' + GR_PARAMETER;
        } else if ((this._mountingType == undefined || this._mountingType == null || this._mountingType == '') && this._withAccentRingValue === true) {
            this._shapeSelectionData.featureValue = AR_PARAMETER;
        } else if ((this._mountingType == undefined || this._mountingType == null || this._mountingType == '') && this._withColoredGrooveValue === true) {
            this._shapeSelectionData.featureValue = GR_PARAMETER;
        } else {
            this._shapeSelectionData.featureValue = this._mountingType;
        } //BS-2012 logic for GR
        this._shapeSelectionData.withColoredGroove = this._withColoredGrooveValue;
        this._shapeSelectionData.coloredGrooveColorProductId = this._selectedColorGrooveColorProductId ? this._selectedColorGrooveColorProductId : null;
        this._isLoading = true;
        this._shapeSelectionData.showWithAccentRing = this._showAccentRingSection;
        this._shapeSelectionData.showAccentRingColor = this._withAccentRingValue;
        this._shapeSelectionData.withAccentRingValue = this._withAccentRingValue;
        this._shapeSelectionData.accentRingColorStyling =
            this._selectedAccentRingColor !== undefined &&
            this._selectedAccentRingColor !== null &&
            this._selectedAccentRingColor.styling !== undefined &&
            this._selectedAccentRingColor.styling !== null
                ? this._selectedAccentRingColor.styling
                : '#3f242900;';
        this._shapeSelectionData.accentRingColorLabel =
            this._selectedAccentRingColor !== undefined &&
            this._selectedAccentRingColor !== null &&
            this._selectedAccentRingColor.label !== undefined &&
            this._selectedAccentRingColor.label !== null
                ? this._selectedAccentRingColor.label
                : '';
        this._shapeSelectionData.accentRingImage = this._accentRingImage !== undefined && this._accentRingImage !== null ? this._accentRingImage : null;
        this._shapeSelectionData.showAccentRingImage = this._accentRingImage !== undefined && this._accentRingImage !== null ? true : false;
        this._shapeSelectionData.showRemoveGroove = this._withAccentRingValue;
        this._shapeSelectionData.showWithColorGroove = this._showColoredGrooveSection;
        this._shapeSelectionData.showColorGrooveColor = this._withColoredGrooveValue;
        this._shapeSelectionData.withColorGrooveValue = this._withColoredGrooveValue;
        if (this._shapeSelectionData.withPartialColorGroove == true) {
            this._withColorGrooveLabel = WITH_PARTIAL_COLOR_GROOVE_LABEL.split(',')[0];
        }
        this._shapeSelectionData.colorGrooveColorStyling =
            this._selectedColoredGrooveColor !== undefined &&
            this._selectedColoredGrooveColor !== null &&
            this._selectedColoredGrooveColor.styling !== undefined &&
            this._selectedColoredGrooveColor.styling !== null
                ? this._selectedColoredGrooveColor.styling
                : '#3f242900;';
        this._shapeSelectionData.colorGrooveColorLabel =
            this._selectedColoredGrooveColor !== undefined &&
            this._selectedColoredGrooveColor !== null &&
            this._selectedColoredGrooveColor.label !== undefined &&
            this._selectedColoredGrooveColor.label !== null
                ? this._selectedColoredGrooveColor.label
                : '';
        this._shapeSelectionData.showRemoveDrill = this._showRemoveDrills;
        this._shapeSelectionData.lensShape = this._selectedLensShape;
        this._shapeSelectionData.lensSize = this._selectedLensSize;
        this._shapeSelectionData.height = this._height;
        this._shapeSelectionData.width = this._width;
        if (this._shapeSelectionData.removeDrills == true) {
            this._omaCalloutSuccessWrapperString = this._omaCalloutSuccessWrapperString ? JSON.parse(this._omaCalloutSuccessWrapperString) : null;
            this._updatedOmaCalloutSuccessWrapperString = this._updatedOmaCalloutSuccessWrapperString
                ? JSON.parse(this._updatedOmaCalloutSuccessWrapperString)
                : null;
            if (this._updatedOmaCalloutSuccessWrapperString !== undefined && this._updatedOmaCalloutSuccessWrapperString !== null) {
                this._omaCalloutSuccessWrapperString.drills = this._updatedOmaCalloutSuccessWrapperString.drills
                    ? this._updatedOmaCalloutSuccessWrapperString.drills
                    : null;
            }
            this._omaCalloutSuccessWrapperString = JSON.stringify(this._omaCalloutSuccessWrapperString);
            this._updatedOmaCalloutSuccessWrapperString = JSON.stringify(this._updatedOmaCalloutSuccessWrapperString);
        }
        this._shapeSelectionData.partialGroove = this._partialColorGroove;

        this._shapeSelectionData.selectedLensShapeId = this._selectedLensShapeRecordId;
        let updatedOmaCalloutSuccessWrapperStringClone;
        if (this._shapeAdjusted === false) {
            updatedOmaCalloutSuccessWrapperStringClone = null;
        } else {
            updatedOmaCalloutSuccessWrapperStringClone = this._updatedOmaCalloutSuccessWrapperString;
        }
        saveShapeSelectionData({
            lensConfiguratorId: this.lensConfiguratorCollection.lensConfiguratorID,
            omaCalloutSuccessWrapper: this._omaCalloutSuccessWrapperString,
            omaCalloutSuccessUpdatedWrapper: updatedOmaCalloutSuccessWrapperStringClone,
            userInputMap: this._shapeSelectionData
        })
            .then((result) => {
                this._isLoading = false;
                if (result === true) {
                    this.dispatchEvent(new CustomEvent(POPULATE_SHAPE_SELECTION_DATA, { detail: this._shapeSelectionData }));
                    this.fireUpdateProgressBar(6, true, false);
                }
            })
            .catch((error) => {
                this._isLoading = false;
            });
    }

    /**
     * BS-1051 This Method handles event fired on click of edit icon by user on UI
     */
    handleShapeSelectionEdit(event) {
        if (this._isReadOnly == true) {
            this._isReadOnly = false;
            this.fireUpdateProgressBar(5, true, false);
        }
    }

    /**
     * BS-722
     * This method redirects the user on the next screen.
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
     * BS-722
     * Trims the height and width upto two decimal places
     */
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

    /**
     * BS-791
     * This method used to control shape editor screen through button click
     */
    handleShapeEditorButtonClick(event) {
        this._openShapeEditorButtonActive = false;
        this._showShapeEditor = true;
    }

    /**
     * BS-791
     * This method used to handle event to capture values entered by user
     */
    manipulateShapeAdjustmentValuesChangeOnBlur(event) {
        let editorCollection = JSON.parse(JSON.stringify(this._shapeEditorCollection));
        let performCallout = false;
        editorCollection.forEach((item) => {
            if (item.label == event.target.dataset.itemId) {
                if (parseInt(event.target.value) >= item.minimumAllowedValue && parseInt(event.target.value) <= item.maximumAllowedValue) {
                    item.modifiedValue = parseInt(event.target.value);
                    this._shapeSelectionData;
                    if (this._validationAdjustementAttributesCollection.length > 0) {
                        this._visualizeShapeButtonDisable = true;
                        let parsedValidationCollection = JSON.parse(JSON.stringify(this._validationAdjustementAttributesCollection));
                        let updatedValidationCollection = [];
                        parsedValidationCollection.forEach((validationObject) => {
                            if (validationObject.attributeName != event.target.dataset.itemId) {
                                updatedValidationCollection.push(validationObject);
                            }
                        });
                        this._validationAdjustementAttributesCollection = JSON.parse(JSON.stringify(updatedValidationCollection));
                        if (this._validationAdjustementAttributesCollection.length == 0) {
                            this._visualizeShapeButtonDisable = false;
                            performCallout = true;
                            this._showValidationMessage = false;
                            this._modifiedValidationMessage = null;
                        }
                    } else {
                        this._visualizeShapeButtonDisable = false;
                        performCallout = true;
                        this._showValidationMessage = false;
                        this._modifiedValidationMessage = null;
                    }
                } else {
                    let validationInformation = {};
                    item.modifiedValue = parseInt(event.target.value);
                    this._visualizeShapeButtonDisable = true;
                    validationInformation.attributeName = item.label;
                    validationInformation.validationMessage = item.label + this._genericValidationMessage;
                    if (this._validationAdjustementAttributesCollection.length > 0) {
                        let isAttributePresent = false;
                        this._validationAdjustementAttributesCollection.forEach((parsedObject) => {
                            if (parsedObject.attributeName == item.label) {
                                isAttributePresent = true;
                            }
                        });
                        if (isAttributePresent == false) {
                            this._validationAdjustementAttributesCollection.push(validationInformation);
                        }
                    } else {
                        this._validationAdjustementAttributesCollection.push(validationInformation);
                    }
                    this._showValidationMessage = true;
                }
            }
        });
        this._shapeEditorCollection = JSON.parse(JSON.stringify(editorCollection));
        if (performCallout == true) {
            this._isLoading = true;
            this.getScaleShapeFromOMACallout();
        } else {
            this._isLoading = false;
        }
    }

    /**
     * BS-791
     * This method used to handle event to capture values entered by user in shape editor fields whenever - / + button is clicked
     */
    manipulateShapeAdjustmentValuesChangeOnButtonClick(event) {
        let editorCollection = JSON.parse(JSON.stringify(this._shapeEditorCollection));
        let oldEditorCollection = editorCollection;
        editorCollection.forEach((item) => {
            if (item.label == event.target.dataset.itemId) {
                if (item.modifiedValue > item.maximumAllowedValue || item.modifiedValue < item.minimumAllowedValue) {
                    this._visualizeShapeButtonDisable = false;
                    if (event.target.value == BUTTON_TYPE_PLUS) {
                        item.modifiedValue = item.maximumAllowedValue;
                    } else if (event.target.value == BUTTON_TYPE_MINUS) {
                        item.modifiedValue = item.minimumAllowedValue;
                    }
                    if (this._validationAdjustementAttributesCollection.length > 0) {
                        this._visualizeShapeButtonDisable = true;
                        let parsedValidationCollection = JSON.parse(JSON.stringify(this._validationAdjustementAttributesCollection));
                        let updatedValidationCollection = [];
                        parsedValidationCollection.forEach((validationObject) => {
                            if (validationObject.attributeName != event.target.dataset.itemId) {
                                updatedValidationCollection.push(validationObject);
                            }
                        });
                        this._validationAdjustementAttributesCollection = JSON.parse(JSON.stringify(updatedValidationCollection));
                        if (this._validationAdjustementAttributesCollection.length == 0) {
                            this._visualizeShapeButtonDisable = false;
                            this._showValidationMessage = false;
                            this._modifiedValidationMessage = null;
                        }
                    } else {
                        this._visualizeShapeButtonDisable = false;
                        this._showValidationMessage = false;
                        this._modifiedValidationMessage = null;
                    }
                } else {
                    if (
                        event.target.value == BUTTON_TYPE_PLUS &&
                        item.modifiedValue + 1 >= item.minimumAllowedValue &&
                        item.modifiedValue + 1 <= item.maximumAllowedValue
                    ) {
                        if (this._validationAdjustementAttributesCollection.length > 0) {
                            this._visualizeShapeButtonDisable = true;
                            let parsedValidationCollection = JSON.parse(JSON.stringify(this._validationAdjustementAttributesCollection));
                            let updatedValidationCollection = [];
                            parsedValidationCollection.forEach((validationObject) => {
                                if (validationObject.attributeName != event.target.dataset.itemId) {
                                    updatedValidationCollection.push(validationObject);
                                }
                            });
                            this._validationAdjustementAttributesCollection = JSON.parse(JSON.stringify(updatedValidationCollection));
                            if (this._validationAdjustementAttributesCollection.length == 0) {
                                this._visualizeShapeButtonDisable = false;
                                this._showValidationMessage = false;
                                this._modifiedValidationMessage = null;
                            }
                        } else {
                            this._visualizeShapeButtonDisable = false;
                            this._showValidationMessage = false;
                            this._modifiedValidationMessage = null;
                        }
                        item.modifiedValue += 1;
                    } else if (
                        event.target.value == BUTTON_TYPE_MINUS &&
                        item.modifiedValue - 1 >= item.minimumAllowedValue &&
                        item.modifiedValue - 1 <= item.maximumAllowedValue
                    ) {
                        if (this._validationAdjustementAttributesCollection.length > 0) {
                            this._visualizeShapeButtonDisable = true;
                            let parsedValidationCollection = JSON.parse(JSON.stringify(this._validationAdjustementAttributesCollection));
                            let updatedValidationCollection = [];
                            parsedValidationCollection.forEach((validationObject) => {
                                if (validationObject.attributeName != event.target.dataset.itemId) {
                                    updatedValidationCollection.push(validationObject);
                                }
                            });
                            this._validationAdjustementAttributesCollection = JSON.parse(JSON.stringify(updatedValidationCollection));
                            if (this._validationAdjustementAttributesCollection.length == 0) {
                                this._visualizeShapeButtonDisable = false;
                                this._showValidationMessage = false;
                                this._modifiedValidationMessage = null;
                            }
                        } else {
                            this._visualizeShapeButtonDisable = false;
                            this._showValidationMessage = false;
                            this._modifiedValidationMessage = null;
                        }
                        item.modifiedValue -= 1;
                    }
                }
            }
        });
        let newEditorCollection = JSON.parse(JSON.stringify(editorCollection));
        if (oldEditorCollection != newEditorCollection) {
            this._modifiedShapeValues = true;
        }
        this._shapeEditorCollection = JSON.parse(JSON.stringify(editorCollection));
    }

    /**
     * BS-791
     * This method used to reset the adjustements done by user on shape editor section
     */
    handleResetAdjustments(event) {
        this._isLoading = true;
        this._shapeEditorCollection = this._preservedOriginalShapeEditorCollection;
        this._showValidationMessage = false;
        this._validationAdjustementAttributesCollection = [];

        let resetResults = resetAdjustmentsAndRemoveDrills(this._shapeEditorCollection, this._showRemoveDrills, this._removeDrillsOptions);
        this.getOmaCalloutResponse();
        if (resetResults != null) {
            this._shapeEditorCollection = resetResults['shapeEditorCollection'];
            if (resetResults['resetRemoveDrills']) {
                this.handleRemoveDrillsSelection({ target: { value: true } });
                this._removeDrillsOptions = resetResults['removeDrillsOptions'];
            }
        }
    }

    /**
     * BS-791
     * This method used to perform callout to get Lens shape with adjustment values entered by user through OMA
     */
    handleVisualiseAdjustedShapeButtonClick(event) {
        if (this._validationAdjustementAttributesCollection.length == 0) {
            this._isLoading = true;
            this.getScaleShapeFromOMACallout();
        }
    }

    /**
     * This Method is used to set the component read only or edit visibility mode
     * BS-1492
     *
     */
    @api
    setupComponentMode(componentMode) {
        if (componentMode != null && componentMode != undefined) {
            if (componentMode == EDIT_MODE) {
                this._isReadOnly = false; //Edit mode: _isReadOnly = false
            } else if (componentMode == READ_ONLY_MODE) {
                this._isReadOnly = true; //Read mode: _isReadOnly = true
            }
        }
    }

    async showShapeSelectionScreenFieldValuesOnLoad(lensConfiguratorObj) {
        this._initialSetupDone = false;
        if (lensConfiguratorObj !== undefined && lensConfiguratorObj !== null) {
            if (this._isNotRimlessFrame == false) {
                //BS-1636 added the check
                if (lensConfiguratorObj.B2B_Lens_Shape__c !== undefined && lensConfiguratorObj.B2B_Lens_Shape__c !== null) {
                    this._selectedLensShape =
                        lensConfiguratorObj.B2B_Lens_Shape__c !== undefined && lensConfiguratorObj.B2B_Lens_Shape__c !== null
                            ? lensConfiguratorObj.B2B_Lens_Shape__c
                            : null;
                    this._searchTerm = this._selectedLensShape; //BS-1635
                }
                if (this._selectedLensShape && this._lensShapeData !== null && this._lensShapeData.length > 0) {
                    this._isLensShapeInValid = false;
                    let lensSizeLabel = [];
                    this._lensShapeData.forEach((item) => {
                        if (item.B2B_Shape_Name__c === this._selectedLensShape && lensSizeLabel.includes(item.B2B_Size__c) == false) {
                            let lensSizeObj = {};
                            lensSizeObj = {
                                label: item.B2B_Size__c,
                                value: item.B2B_Size__c
                            };
                            if (!this._lensSizeOptions.find((option) => option.value === lensSizeObj.value)) {
                                this._lensSizeOptions.push(lensSizeObj);
                                lensSizeLabel.push(item.B2B_Size__c);
                            }
                        }
                    });
                    if (lensConfiguratorObj.B2B_Lens_Size__c !== undefined && lensConfiguratorObj.B2B_Lens_Size__c !== null) {
                        this._selectedLensSize =
                            lensConfiguratorObj.B2B_Lens_Size__c !== undefined && lensConfiguratorObj.B2B_Lens_Size__c !== null
                                ? lensConfiguratorObj.B2B_Lens_Size__c + ''
                                : null;
                        this._lensShapeData.forEach((item) => {
                            if (this._selectedLensShape === item.B2B_Shape_Name__c && this._selectedLensSize === item.B2B_Size__c) {
                                this._selectedLensShapeRecordId = item.Id;
                                this._omaShapeKeyValue = item.B2B_OMAShapeKey__c ? item.B2B_OMAShapeKey__c : null;
                                this._mountingType = item.B2B_Mounting_Type__c ? item.B2B_Mounting_Type__c : '';
                            }
                        }); //BS-2012
                    }
                }
            }
            if (this._selectedLensShapeRecordId == null) {
                this._selectedLensShapeRecordId =
                    lensConfiguratorObj.B2B_Selected_Lens_Shape__c !== undefined && lensConfiguratorObj.B2B_Selected_Lens_Shape__c !== null
                        ? lensConfiguratorObj.B2B_Selected_Lens_Shape__c + ''
                        : null;
            } //BS-1845
            this._height =
                lensConfiguratorObj.B2B_OMA_Height__c !== undefined && lensConfiguratorObj.B2B_OMA_Height__c !== null
                    ? lensConfiguratorObj.B2B_OMA_Height__c
                    : null;
            this._width = lensConfiguratorObj.B2B_Width__c !== undefined && lensConfiguratorObj.B2B_Width__c !== null ? lensConfiguratorObj.B2B_Width__c : null;
            this._width = this.trimUptoTwoDecimalPlaces(this._width);
            this._height = this.trimUptoTwoDecimalPlaces(this._height);
            if (this._selectedLensShape !== undefined && this._selectedLensShape !== null) {
                this._showLensShapeImage = true;
            }
            this._showLensSize = true;

            if (this._lensSizeOptions && this._lensSizeOptions.length > 0) {
                this._showLensOptions = true;
            }
            this._shapeSelectionData.a = lensConfiguratorObj.B2B_a__c ? lensConfiguratorObj.B2B_a__c : 0;
            this._shapeSelectionData.b1 = lensConfiguratorObj.B2B_b1__c ? lensConfiguratorObj.B2B_b1__c : 0;
            this._shapeSelectionData.b = lensConfiguratorObj.B2B_b__c ? lensConfiguratorObj.B2B_b__c : 0;
            this._shapeSelectionData.b2 = lensConfiguratorObj.B2B_b2__c ? lensConfiguratorObj.B2B_b2__c : 0;
            this._shapeSelectionData.sf = lensConfiguratorObj.B2B_SF__c ? lensConfiguratorObj.B2B_SF__c : 0;
            this._shapeSelectionData.blp = lensConfiguratorObj.B2B_blp__c ? lensConfiguratorObj.B2B_blp__c : 0;
            await getLensShapeDataByShapeName({
                shapeName: this._selectedLensShape,
                size: this._selectedLensSize,
                recordId: this._selectedLensShapeRecordId
            })
                .then((result) => {
                    if (result !== undefined && result !== null) {
                        let lensShapeObject = result[0];
                        this._selectedLensShapeRecordId = lensShapeObject.Id;
                        if (this._withAccentRingOptions.length > 0) {
                            let withAccentRingOptions = JSON.parse(JSON.stringify(this._withAccentRingOptions));
                            withAccentRingOptions.forEach((option) => {
                                option.isChecked = false;
                                if (
                                    (lensShapeObject.B2B_Default_Features__c &&
                                        lensShapeObject.B2B_Default_Features__c.includes(WITH_ACCENT_RING_VALUE) == true) ||
                                    (lensShapeObject.B2B_Available_features__c &&
                                        lensShapeObject.B2B_Available_features__c.includes(WITH_ACCENT_RING_VALUE) == true)
                                ) {
                                    this._withAccentRingValue = lensConfiguratorObj.B2B_Accent_Ring__c ? lensConfiguratorObj.B2B_Accent_Ring__c : false;
                                    if (this._withAccentRingValue == true) {
                                        if (option.name == YES) {
                                            option.isChecked = true;
                                            this._withAccentRingValue = true;
                                            let colorHexCode = lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c
                                                ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c
                                                : '#3f242900;';
                                            let frameColorDescription = lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c
                                                ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c
                                                : '';
                                            let colorNumber = lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Color_Number__c
                                                ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Color_Number__c
                                                : '';
                                            let selectedColorProperties = {};
                                            selectedColorProperties.label = colorNumber + ' ' + frameColorDescription;
                                            selectedColorProperties.styling = STYLING_BACKGROUND_COLOR + colorHexCode;
                                            selectedColorProperties.sku = lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.StockKeepingUnit
                                                ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.StockKeepingUnit
                                                : '';
                                            selectedColorProperties.productId = lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.Id
                                                ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.Id
                                                : null;
                                            this._selectedAccentRingColorProductId = selectedColorProperties.productId;
                                            this._showAccentRingColorOptions = false;
                                            this._selectedAccentRingColor = selectedColorProperties;
                                            this._isAccentRingColorSelected = true;
                                            this.getAccentRingColor();
                                            this._accentRingImage = lensConfiguratorObj.B2B_Selected_Accent_Ring_Image__c
                                                ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Image__c
                                                : false;
                                            this._showAccentRingImage = this._accentRingImage != undefined && this._accentRingImage != null ? true : false;
                                        }
                                    } else if (this._withAccentRingValue == false) {
                                        if (option.name == NO) {
                                            option.isChecked = true;
                                            this._withAccentRingValue = false;
                                            this._removeGrooveValue = lensConfiguratorObj.B2B_Remove_Groove__c
                                                ? lensConfiguratorObj.B2B_Remove_Groove__c
                                                : false;
                                        }
                                    }
                                    this._showAccentRingSection = true;
                                } else {
                                    this._showAccentRingSection = false;
                                    this._withAccentRingValue = false;
                                }
                            });
                            this._withAccentRingOptions = JSON.parse(JSON.stringify(withAccentRingOptions));
                        }

                        if (this._withColoredGrooveOptions.length > 0) {
                            let withColoredGrooveOptions = JSON.parse(JSON.stringify(this._withColoredGrooveOptions));
                            withColoredGrooveOptions.forEach((option) => {
                                option.isChecked = false;
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
                                    if (
                                        (lensShapeObject.B2B_Default_Features__c &&
                                            lensShapeObject.B2B_Default_Features__c.includes(PARTIAL_GROOVE_VALUE) == true) ||
                                        (lensShapeObject.B2B_Available_features__c &&
                                            lensShapeObject.B2B_Available_features__c.includes(PARTIAL_GROOVE_VALUE) == true)
                                    ) {
                                        this._withColorGrooveLabel = WITH_PARTIAL_COLOR_GROOVE_LABEL.split(',')[0];
                                        this._partialColorGroove = true;
                                    }
                                    this._withColoredGrooveValue = lensConfiguratorObj.B2B_With_Color_Groove__c
                                        ? lensConfiguratorObj.B2B_With_Color_Groove__c
                                        : false;
                                    if (this._withColoredGrooveValue == true) {
                                        if (option.name == YES) {
                                            option.isChecked = true;
                                            this._withColoredGrooveValue = true;
                                            this.getColoredGrooveColor();
                                            let colorHexCode = lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c
                                                ? lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c
                                                : '#3f242900;';
                                            const selectedColorProperties = {};
                                            selectedColorProperties.label = lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.Name
                                                ? lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.Name
                                                : '';
                                            selectedColorProperties.styling = STYLING_BACKGROUND_COLOR + colorHexCode;
                                            selectedColorProperties.sku = lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.StockKeepingUnit
                                                ? lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.StockKeepingUnit
                                                : '';
                                            selectedColorProperties.productId = lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.Id
                                                ? lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.Id
                                                : null;
                                            this._selectedColorGrooveColorProductId = selectedColorProperties.productId;
                                            this._showColoredGrooveColorOptions = false;
                                            this._selectedColoredGrooveColor = selectedColorProperties;
                                            this._isColoredGrooveColorSelected = true;
                                        }
                                    } else if (this._withColoredGrooveValue == false) {
                                        if (option.name == NO) {
                                            option.isChecked = true;
                                        }
                                    }
                                    this._showColoredGrooveSection = true;
                                } else {
                                    this._showColoredGrooveSection = false;
                                    this._withColoredGrooveValue = false;
                                }
                            });
                            this._withColoredGrooveOptions = JSON.parse(JSON.stringify(withColoredGrooveOptions));
                        }

                        if (
                            this._isOrderTypeLensOnly == true &&
                            lensShapeObject.B2B_Lens_Only_Available__c &&
                            lensShapeObject.B2B_Lens_Only_Available__c.includes(REMOVE_DRILLS_VALUE) === true
                        ) {
                            this._showRemoveDrills = true;
                            this._shapeSelectionData.removeDrills = lensConfiguratorObj.B2B_Remove_Drills__c ? lensConfiguratorObj.B2B_Remove_Drills__c : false;
                        } else {
                            this._showRemoveDrills = false;
                            this._shapeSelectionData.removeDrills = false;
                        }

                        if (this._removeDrillsOptions.length > 0) {
                            let removeDrillsOption = JSON.parse(JSON.stringify(this._removeDrillsOptions));
                            removeDrillsOption.forEach((option) => {
                                option.isChecked = false;
                                if (this._shapeSelectionData.removeDrills == true && option.name == YES) {
                                    option.isChecked = true;
                                } else if (this._shapeSelectionData.removeDrills == false && option.name == NO) {
                                    option.isChecked = true;
                                }
                            });
                            this._removeDrillsOptions = JSON.parse(JSON.stringify(removeDrillsOption));
                        }
                    }
                    this._initialSetupDone = true;
                    this._isLoading = false;
                })
                .catch((error) => {
                    this._initialSetupDone = true;
                });
        }
    }
    // START: BS-1635
    setVisibilityControl() {
        if (this._searchTerm !== undefined && this._searchTerm !== null && this._searchTerm !== '') {
            const input = this._searchTerm.toUpperCase();
            const result = this._lensShapeOptions.filter((picklistOption) => picklistOption.label.includes(input));
            if (result !== undefined && result !== null && result.length === 1) {
                this.searchResults = result;
            }
        }
    }

    setVisibility() {
        const shapeField = this.template.querySelector(`[data-id="${SHAPE_FIELD}"]`);

        if (this._onFieldLoad === false) {
            if (shapeField !== undefined && shapeField !== null) {
                if (this._shapeVisible === true) {
                    this._shapeVisible = false;
                    shapeField.classList.remove(SET_VISIBILITY);
                    shapeField.classList.add(UNSET_VISIBILITY);
                } else {
                    this._shapeVisible = true;
                    this.setVisibilityControl();
                    shapeField.classList.remove(UNSET_VISIBILITY);
                    shapeField.classList.add(SET_VISIBILITY);
                }
            }
        } else {
            this._onFieldLoad = false;
            this.setVisibilityControl();
        }
    }

    setDataToDefaultValues() {
        this._showLensShapeImage = false;
        this._showRemoveDrills = false;
        this._showAccentRingSection = false;
        this.resetAccenRingData();

        this._removeDrillsOptions = [
            { label: this._yesLabel, name: YES, value: true, isChecked: false },
            { label: this._noLabel, name: NO, value: false, isChecked: true }
        ];
        this._showColoredGrooveSection = false;
        this._withColoredGrooveValue = false;
        this.resetColorGrooveData();
    }

    resetAccenRingData() {
        this._removeGrooveValue = false;
        this._selectedAccentRingColor = null;
        this._accentRingColorOptions = [];
        this._isAccentRingColorSelected = false;
        this._showAccentRingColorOptions = false;
        this._accentRingImage = null;
        this._showAccentRingImage = false;
        this._selectedAccentRingColorProductId = null;
        this._isAccentRingColorInvalid = false;
    }

    resetColorGrooveData() {
        this._isColoredGrooveColorSelected = false;
        this._selectedColoredGrooveColor = null;
        this._showColoredGrooveColorOptions = false;
        this._coloredGrooveColorOptions = null;
        this._isColoredGrooveColorInvalid = false;
        this._colorGrooveOptions = null;
        this._selectedColorGrooveColorProductId = null;
    }
}
