import { LightningElement, api, track } from 'lwc';
import getShapeSelectionScreenData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getShapeSelectionScreenData';
import getLensShapeDataByShapeName from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensShapeDataByShapeName';
import { DrawGlass, UpdateDrawGlass } from './externalLibrary';
import SHAPE_SELECTION_LABELS from '@salesforce/label/c.B2B_VS_SHAPE_SELECTION_SCREEN_LABELS';
import SHAPE_SELECTION_SCREEN_LABELS from '@salesforce/label/c.B2B_VS_SHAPE_SELECTION_SCREEN_LABELS';

const LENS_ONLY = 'Lens Only';

export default class B2b_vs_shape_display_component extends LightningElement {
    @api
    lensConfiguratorId;

    _initialLoadComplete = false;
    _readOnlyOriginalParsedData = {};
    _readOnlyParsedData = {};
    _selectedAccentRingColor = {};
    _accentRingImage;
    _showAccentRingImage = false;
    _withAccentRingValue = false;
    _selectedColoredGrooveColor = {};
    _isOrderTypeLensOnly = false;
    _isLoading = false;

    @track
    _shapeSelectionCollection;

    _originalShapeLabel = SHAPE_SELECTION_LABELS.split(',')[4];
    _scaledShapeLabel = SHAPE_SELECTION_LABELS.split(',')[5];
    _heightLabel = SHAPE_SELECTION_LABELS.split(',')[6];
    _measurementUnitLabel = SHAPE_SELECTION_LABELS.split(',')[8];
    _widthLabel = SHAPE_SELECTION_LABELS.split(',')[7];
    _shapeEditorHeader = SHAPE_SELECTION_LABELS.split(',')[24];
    _shapeEditorSubHeader = SHAPE_SELECTION_LABELS.split(',')[25];
    _aLabel = SHAPE_SELECTION_LABELS.split(',')[12];
    _bLabel = SHAPE_SELECTION_LABELS.split(',')[13];
    _sfLabel = SHAPE_SELECTION_LABELS.split(',')[14];
    _b1Label = SHAPE_SELECTION_LABELS.split(',')[15];
    _b2Label = SHAPE_SELECTION_LABELS.split(',')[16];
    _dhpLabel = SHAPE_SELECTION_LABELS.split(',')[17];
    _vsShapeAdjusted = SHAPE_SELECTION_SCREEN_LABELS.split(',')[41];

    connectedCallback() {
        this._isLoading = true;
        this.getShapeData();
    }
    getShapeData() {
        getShapeSelectionScreenData({ recordId: this.lensConfiguratorId })
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
                        parsedData.coordinates = result.omaSuccessResponseWrapper.coordinates ? JSON.parse(result.omaSuccessResponseWrapper.coordinates) : null;
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
                                        this._shapeSelectionCollection.accentRingImage !== undefined && this._shapeSelectionCollection.accentRingImage !== null
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
                            this._isLoading = false;
                        })
                        .catch((error) => {
                            this._initialLoadComplete = true;
                            this._isLoading = false;
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
                this._isLoading = false;
            })
            .catch((error) => {
                this._initialLoadComplete = true;
                this._isLoading = false;
            });
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
}
