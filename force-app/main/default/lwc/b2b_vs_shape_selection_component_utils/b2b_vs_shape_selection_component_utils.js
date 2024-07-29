import B2B_VS_SHAPE_SELECTION_SCREEN_LABELS from '@salesforce/label/c.B2B_VS_SHAPE_SELECTION_SCREEN_LABELS';
import SHAPE_SELECTION_LABELS from '@salesforce/label/c.B2B_VS_SHAPE_SELECTION_SCREEN_LABELS';
const ANGULAR_BRACKET_START = ' (';
const HYPHEN = ' — ';
const ANGULAR_BRACKET_END = ')';
const ADJUSTMENT_ATTRIBUTE_BLP = 'blp';
const YES = 'Yes';
const NO = 'No';
export function updateShapeEditorCollection(parsedData, lensConfiguratorObject, _shapeEditorCollection) {
    let parsedShapeEditorCollection = JSON.parse(JSON.stringify(_shapeEditorCollection));
    //Iterating over the shape editor collection and setting up range of min - max allowed values along with help text through allowed scaling obtained from callout
    parsedShapeEditorCollection.forEach((item) => {
        if (parsedData && parsedData.allowedScaling && Object.keys(parsedData.allowedScaling).length > 0) {
            if (item.label == B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[12]) {
                //for shape adjustment attribute : a
                if (parsedData.allowedScaling.a) {
                    item.maximumAllowedValue =
                        parsedData.allowedScaling.a && parsedData.allowedScaling.a.max && parsedData.allowedScaling.a.max != 0
                            ? parsedData.allowedScaling.a.max
                            : item.maximumAllowedValue;
                    item.minimumAllowedValue =
                        parsedData.allowedScaling.a && parsedData.allowedScaling.a.min && parsedData.allowedScaling.a.min != 0
                            ? parsedData.allowedScaling.a.min
                            : item.minimumAllowedValue;
                    item.isAdjustable =
                        parsedData.allowedScaling.a &&
                        ((parsedData.allowedScaling.a.min && parsedData.allowedScaling.a.min != 0) ||
                            (parsedData.allowedScaling.a.max && parsedData.allowedScaling.a.max != 0))
                            ? true
                            : false;
                    item.helpText =
                        parsedData.allowedScaling.a && (parsedData.allowedScaling.a.max || parsedData.allowedScaling.a.min)
                            ? item.baseHelpText +
                              ANGULAR_BRACKET_START +
                              parsedData.allowedScaling.a.min +
                              HYPHEN +
                              parsedData.allowedScaling.a.max +
                              ANGULAR_BRACKET_END
                            : item.helpText;
                    item.modifiedValue = lensConfiguratorObject && lensConfiguratorObject.B2B_a__c ? lensConfiguratorObject.B2B_a__c : 0;
                }
            } else if (item.label == B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[13]) {
                //for shape adjustment attribute : b
                if (parsedData.allowedScaling.b) {
                    item.maximumAllowedValue =
                        parsedData.allowedScaling.b && parsedData.allowedScaling.b.max && parsedData.allowedScaling.b.max != 0
                            ? parsedData.allowedScaling.b.max
                            : item.maximumAllowedValue;
                    item.minimumAllowedValue =
                        parsedData.allowedScaling.b && parsedData.allowedScaling.b.min && parsedData.allowedScaling.b.min != 0
                            ? parsedData.allowedScaling.b.min
                            : item.minimumAllowedValue;
                    item.isAdjustable =
                        parsedData.allowedScaling.b &&
                        ((parsedData.allowedScaling.b.min && parsedData.allowedScaling.b.min != 0) ||
                            (parsedData.allowedScaling.b.max && parsedData.allowedScaling.b.max != 0))
                            ? true
                            : false;
                    item.helpText =
                        parsedData.allowedScaling.b && (parsedData.allowedScaling.b.max || parsedData.allowedScaling.b.min)
                            ? item.baseHelpText +
                              ANGULAR_BRACKET_START +
                              parsedData.allowedScaling.b.min +
                              HYPHEN +
                              parsedData.allowedScaling.b.max +
                              ANGULAR_BRACKET_END
                            : item.helpText;
                    item.modifiedValue = lensConfiguratorObject && lensConfiguratorObject.B2B_b__c ? lensConfiguratorObject.B2B_b__c : 0;
                }
            } else if (item.label == B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[14]) {
                //for shape adjustment attribute : sf
                if (parsedData.allowedScaling.sf) {
                    item.maximumAllowedValue =
                        parsedData.allowedScaling.sf && parsedData.allowedScaling.sf.max && parsedData.allowedScaling.sf.max != 0
                            ? parsedData.allowedScaling.sf.max
                            : item.maximumAllowedValue;
                    item.minimumAllowedValue =
                        parsedData.allowedScaling.sf && parsedData.allowedScaling.sf.min && parsedData.allowedScaling.sf.min != 0
                            ? parsedData.allowedScaling.sf.min
                            : item.minimumAllowedValue;
                    item.isAdjustable =
                        parsedData.allowedScaling.sf &&
                        ((parsedData.allowedScaling.sf.min && parsedData.allowedScaling.sf.min != 0) ||
                            (parsedData.allowedScaling.sf.max && parsedData.allowedScaling.sf.max != 0))
                            ? true
                            : false;
                    item.helpText =
                        parsedData.allowedScaling.sf && (parsedData.allowedScaling.sf.max || parsedData.allowedScaling.sf.min)
                            ? item.baseHelpText +
                              ANGULAR_BRACKET_START +
                              parsedData.allowedScaling.sf.min +
                              HYPHEN +
                              parsedData.allowedScaling.sf.max +
                              ANGULAR_BRACKET_END
                            : item.helpText;

                    item.modifiedValue = lensConfiguratorObject && lensConfiguratorObject.B2B_SF__c ? lensConfiguratorObject.B2B_SF__c : 0;
                }
            } else if (item.label == B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[15]) {
                //for shape adjustment attribute : b1
                if (parsedData.allowedScaling.b1) {
                    item.maximumAllowedValue =
                        parsedData.allowedScaling.b1 && parsedData.allowedScaling.b1.max && parsedData.allowedScaling.b1.max != 0
                            ? parsedData.allowedScaling.b1.max
                            : item.maximumAllowedValue;
                    item.minimumAllowedValue =
                        parsedData.allowedScaling.b1 && parsedData.allowedScaling.b1.min && parsedData.allowedScaling.b1.min != 0
                            ? parsedData.allowedScaling.b1.min
                            : item.minimumAllowedValue;
                    item.isAdjustable =
                        parsedData.allowedScaling.b1 &&
                        ((parsedData.allowedScaling.b1.min && parsedData.allowedScaling.b1.min != 0) ||
                            (parsedData.allowedScaling.b1.max && parsedData.allowedScaling.b1.max != 0))
                            ? true
                            : false;
                    item.helpText =
                        parsedData.allowedScaling.b1 && (parsedData.allowedScaling.b1.max || parsedData.allowedScaling.b1.min)
                            ? item.baseHelpText +
                              ANGULAR_BRACKET_START +
                              parsedData.allowedScaling.b1.min +
                              HYPHEN +
                              parsedData.allowedScaling.b1.max +
                              ANGULAR_BRACKET_END
                            : item.helpText;

                    item.modifiedValue = lensConfiguratorObject && lensConfiguratorObject.B2B_b1__c ? lensConfiguratorObject.B2B_b1__c : 0;
                }
            } else if (item.label == B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[16]) {
                //for shape adjustment attribute : b2
                if (parsedData.allowedScaling.b2) {
                    item.maximumAllowedValue =
                        parsedData.allowedScaling.b2 && parsedData.allowedScaling.b2.max && parsedData.allowedScaling.b2.max != 0
                            ? parsedData.allowedScaling.b2.max
                            : item.maximumAllowedValue;
                    item.minimumAllowedValue =
                        parsedData.allowedScaling.b2 && parsedData.allowedScaling.b2.min && parsedData.allowedScaling.b2.min != 0
                            ? parsedData.allowedScaling.b2.min
                            : item.minimumAllowedValue;
                    item.isAdjustable =
                        parsedData.allowedScaling.b2 &&
                        ((parsedData.allowedScaling.b2.min && parsedData.allowedScaling.b2.min != 0) ||
                            (parsedData.allowedScaling.b2.max && parsedData.allowedScaling.b2.max != 0))
                            ? true
                            : false;
                    item.helpText =
                        parsedData.allowedScaling.b2 && (parsedData.allowedScaling.b2.max || parsedData.allowedScaling.b2.min)
                            ? item.baseHelpText +
                              ANGULAR_BRACKET_START +
                              parsedData.allowedScaling.b2.min +
                              HYPHEN +
                              parsedData.allowedScaling.b2.max +
                              ANGULAR_BRACKET_END
                            : item.helpText;
                }
                item.modifiedValue = lensConfiguratorObject && lensConfiguratorObject.B2B_b2__c ? lensConfiguratorObject.B2B_b2__c : 0;
            } else if (item.label == B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[17] || (item.label && item.label == ADJUSTMENT_ATTRIBUTE_BLP)) {
                //for shape adjustment attribute : blp/dhp
                if (parsedData.allowedScaling.blp) {
                    item.maximumAllowedValue =
                        parsedData.allowedScaling.blp && parsedData.allowedScaling.blp.max && parsedData.allowedScaling.blp.max != 0
                            ? parsedData.allowedScaling.blp.max
                            : item.maximumAllowedValue;
                    item.minimumAllowedValue =
                        parsedData.allowedScaling.blp && parsedData.allowedScaling.blp.min && parsedData.allowedScaling.blp.min != 0
                            ? parsedData.allowedScaling.blp.min
                            : item.minimumAllowedValue;
                    item.isAdjustable =
                        parsedData.allowedScaling.blp &&
                        ((parsedData.allowedScaling.blp.min && parsedData.allowedScaling.blp.min != 0) ||
                            (parsedData.allowedScaling.blp.max && parsedData.allowedScaling.blp.max != 0))
                            ? true
                            : false;
                    item.helpText =
                        parsedData.allowedScaling.blp && (parsedData.allowedScaling.blp.max || parsedData.allowedScaling.blp.min)
                            ? item.baseHelpText +
                              ANGULAR_BRACKET_START +
                              parsedData.allowedScaling.blp.min +
                              HYPHEN +
                              parsedData.allowedScaling.blp.max +
                              ANGULAR_BRACKET_END
                            : item.helpText;
                    item.modifiedValue = lensConfiguratorObject && lensConfiguratorObject.B2B_blp__c ? lensConfiguratorObject.B2B_blp__c : 0;
                }
            }
        } else {
            item.isAdjustable = false;
        }
    });

    return parsedShapeEditorCollection;
}

/**
 * BS-1781
 * Method was added to validate the input for VS shape Selection screen
 */
export const validateInput = async (inputObject) => {
    let _isValid = true;
    if (inputObject._selectedLensShape == null || inputObject._selectedLensShape == undefined) {
        inputObject._isLensShapeInValid = true;
        _isValid = false;
    } else if (inputObject._selectedLensShape !== null || inputObject._selectedLensShape !== undefined) {
        inputObject._isLensShapeInValid = false;
        _isValid = true;
    }
    if (inputObject._showLensOptions == true && (inputObject._selectedLensSize == null || inputObject._selectedLensSize == undefined)) {
        if (inputObject._showLensOptions === true) {
            //BS-1781
            inputObject._isLensSizeInValid = true;
        } //BS-1781
        _isValid = false;
    } else if (inputObject._showLensOptions == false) {
        _isValid = false; //BS-1648 start
    } else if (inputObject._selectedLensSize !== null || inputObject._selectedLensSize !== undefined) {
        inputObject._isLensSizeInValid = false;
        _isValid = true;
    }
    if (inputObject._withAccentRingValue == true) {
        _isValid = false;
        if (inputObject._selectedAccentRingColorProductId == null || inputObject._selectedLensShape == undefined) {
            inputObject._isAccentRingColorInvalid = true;
            _isValid = false;
        } else if (inputObject._selectedAccentRingColorProductId !== null || inputObject._selectedAccentRingColorProductId !== undefined) {
            inputObject._isAccentRingColorInvalid = false;
            _isValid = true;
        }
    }
    if (inputObject._withColoredGrooveValue == true) {
        _isValid = false;
        if (inputObject._selectedColorGrooveColorProductId == null || inputObject._selectedColorGrooveColorProductId == undefined) {
            inputObject._isColoredGrooveColorInvalid = true;
            _isValid = false;
        } else if (inputObject._selectedAccentRingColorProductId !== null || inputObject._selectedAccentRingColorProductId !== undefined) {
            inputObject._isColoredGrooveColorInvalid = false;
            _isValid = true;
        }
    }
    if (inputObject._withColoredGrooveValue == true && inputObject._withAccentRingValue == true) {
        _isValid = false;
        inputObject._isColoredGrooveColorInvalid = false;
        inputObject._isAccentRingColorInvalid = false;
        if (
            inputObject._selectedColorGrooveColorProductId == null ||
            inputObject._selectedColorGrooveColorProductId == undefined ||
            inputObject._selectedAccentRingColorProductId == null ||
            inputObject._selectedAccentRingColorProductId == undefined
        ) {
            _isValid = false;
            if (inputObject._selectedColorGrooveColorProductId == null || inputObject._selectedColorGrooveColorProductId == undefined) {
                inputObject._isColoredGrooveColorInvalid = true;
            }
            if (inputObject._selectedAccentRingColorProductId == null || inputObject._selectedLensShape == undefined) {
                inputObject._isAccentRingColorInvalid = true;
            }
        } else if (
            inputObject._selectedColorGrooveColorProductId !== null &&
            inputObject._selectedColorGrooveColorProductId !== undefined &&
            inputObject._selectedAccentRingColorProductId !== null &&
            inputObject._selectedAccentRingColorProductId !== undefined
        ) {
            _isValid = true;
        }
    }
    if (inputObject._omaCalloutFailed === true) {
        _isValid = false;
        /* Start : BS-1781 */
    }
    if (inputObject._isLensSizeInValid === true) {
        _isValid = false;
    }
    if (inputObject._isLensShapeInValid === true) {
        _isValid = false;
        /* End : BS-1781 */
    }
    inputObject._isValid = _isValid;
    return inputObject;
};

export function formShapeData(masterShapeEditorCollection) {
    let shapeEditorCollection = [];
    for (let i = 12; i < 18; i++) {
        const shapeInformationCollection = {};
        shapeInformationCollection.label = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[i];
        shapeInformationCollection.fieldName = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[i];
        shapeInformationCollection.originalValue = 0;
        shapeInformationCollection.modifiedValue = 0;
        shapeInformationCollection.incrementalValue = 1;
        shapeInformationCollection.minimumAllowedValue = 0;
        shapeInformationCollection.maximumAllowedValue = 0;
        shapeInformationCollection.applicableStyling = null;
        shapeInformationCollection.baseHelpText = null;
        shapeInformationCollection.helpText = null;
        shapeInformationCollection.isFirstColumn = false;
        shapeInformationCollection.isSecondColumn = false;
        shapeInformationCollection.isAdjustable = true;
        if (i < 15) {
            shapeInformationCollection.isFirstColumn = true;
            shapeInformationCollection.isSecondColumn = false;
        } else if (i > 14) {
            shapeInformationCollection.isSecondColumn = true;
            shapeInformationCollection.isFirstColumn = false;
        }
        if (i == 12) {
            //shape editor attribute : a
            shapeInformationCollection.baseHelpText = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[18];
            shapeInformationCollection.helpText =
                B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[18] +
                ANGULAR_BRACKET_START +
                shapeInformationCollection.minimumAllowedValue +
                HYPHEN +
                shapeInformationCollection.maximumAllowedValue +
                ANGULAR_BRACKET_END;
        } else if (i == 13) {
            //shape editor attribute : b
            shapeInformationCollection.baseHelpText = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[19];
            shapeInformationCollection.helpText =
                B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[19] +
                ANGULAR_BRACKET_START +
                shapeInformationCollection.minimumAllowedValue +
                HYPHEN +
                shapeInformationCollection.maximumAllowedValue +
                ANGULAR_BRACKET_END;
        } else if (i == 14) {
            //shape editor attribute : sf
            shapeInformationCollection.baseHelpText = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[20];
            shapeInformationCollection.helpText =
                B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[20] +
                ANGULAR_BRACKET_START +
                shapeInformationCollection.minimumAllowedValue +
                HYPHEN +
                shapeInformationCollection.maximumAllowedValue +
                ANGULAR_BRACKET_END;
        } else if (i == 15) {
            //shape editor attribute : b1
            shapeInformationCollection.baseHelpText = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[21];
            shapeInformationCollection.helpText =
                B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[21] +
                ANGULAR_BRACKET_START +
                shapeInformationCollection.minimumAllowedValue +
                HYPHEN +
                shapeInformationCollection.maximumAllowedValue +
                ANGULAR_BRACKET_END;
        } else if (i == 16) {
            //shape editor attribute : b2
            shapeInformationCollection.baseHelpText = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[22];
            shapeInformationCollection.helpText =
                B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[22] +
                ANGULAR_BRACKET_START +
                shapeInformationCollection.minimumAllowedValue +
                HYPHEN +
                shapeInformationCollection.maximumAllowedValue +
                ANGULAR_BRACKET_END;
        } else if (i == 17) {
            //shape editor attribute : blp/dhp
            shapeInformationCollection.fieldName = ADJUSTMENT_ATTRIBUTE_BLP;
            shapeInformationCollection.baseHelpText = B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[23];
            shapeInformationCollection.helpText =
                B2B_VS_SHAPE_SELECTION_SCREEN_LABELS.split(',')[23] +
                ANGULAR_BRACKET_START +
                shapeInformationCollection.minimumAllowedValue +
                HYPHEN +
                shapeInformationCollection.maximumAllowedValue +
                ANGULAR_BRACKET_END;
        }
        shapeEditorCollection.push(shapeInformationCollection);
    }

    if (masterShapeEditorCollection != null && masterShapeEditorCollection != undefined && masterShapeEditorCollection.length > 0) {
        shapeEditorCollection.forEach((item) => {
            masterShapeEditorCollection.forEach((shape) => {
                if (item.label == shape.label || item.fieldName == shape.fieldName) {
                    item.modifiedValue = shape.modifiedValue;
                    if (item.modifiedValue == 0) {
                        shapeInformationCollection.isAdjustable = false;
                    }
                }
            });
        });
    }

    return shapeEditorCollection;

    /*BS-2063
    code for testing
    const canvasElement = this.template.querySelector('[data-id="c"]');
    this._omaCalloutSuccessWrapperString = JSON.stringify(originalData);
    DrawGlass(originalData, canvasElement);
    this._isLoading = false;
    let lensShapeImageUrl = canvasElement.toDataURL('image/jpeg');
    lensShapeImageUrl = lensShapeImageUrl.split(',')[1];
    this._shapeSelectionCollection.lensShapeImage = lensShapeImageUrl;*/
}

export function resetAdjustmentsAndRemoveDrills(shapeEditorCollection, showRemoveDrills, removeDrillsOptions) {
    if (shapeEditorCollection != null) {
        shapeEditorCollection.forEach((item) => {
            if (item.label == SHAPE_SELECTION_LABELS.split(',')[12]) {
                shapeEditorCollection.a = item.originalValue;
            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[13]) {
                shapeEditorCollection.b = item.originalValue;
            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[14]) {
                shapeEditorCollection.sf = item.originalValue;
            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[15]) {
                shapeEditorCollection.b1 = item.originalValue;
            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[16]) {
                shapeEditorCollection.b2 = item.originalValue;
            } else if (item.label == SHAPE_SELECTION_LABELS.split(',')[17] || (item.label && item.label == ADJUSTMENT_ATTRIBUTE_BLP)) {
                shapeEditorCollection.blp = item.originalValue;
            }
        });
    }
    let resetRemoveDrills = false;
    if (showRemoveDrills) {
        if (removeDrillsOptions != null && removeDrillsOptions.length > 0) {
            let removeDrillsOptionList = JSON.parse(JSON.stringify(removeDrillsOptions));
            removeDrillsOptionList.forEach((option) => {
                option.isChecked = false;
                if (option.name == YES) {
                    option.isChecked = false;
                } else if (option.name == NO) {
                    option.isChecked = true;
                }
            });
            removeDrillsOptions = JSON.parse(JSON.stringify(removeDrillsOptionList));
            resetRemoveDrills = true;
        }
    }
    if (!removeDrillsOptions) {
        removeDrillsOptions = null;
    }
    return { shapeEditorCollection: shapeEditorCollection, resetRemoveDrills: resetRemoveDrills, removeDrillsOptions: removeDrillsOptions };
}
