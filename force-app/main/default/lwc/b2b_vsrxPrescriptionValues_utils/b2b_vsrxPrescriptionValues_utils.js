import { LightningElement } from 'lwc';

const TWO_ZERO_WITH_DOT = '.00';
const TWO_ZERO = '00';
const ONE_ZERO = '0';
const FIELDS_NOT_TO_APPEND_DECIMAL = ['rightaxis', 'leftaxis', 'rightprismbase1radio', 'leftprismbase1radio', 'rightprismbase2radio', 'leftprismbase2radio'];
const PANORAMA_PROGRESSIVE = 'Panorama Progressive'; //BS-1458
const PANORAMA_PROGRESSIVE_ONE = 'Panorama Progressiv ONE'; //BS-1458
const PANORAMA_OFFICE = 'Panorama Office Room / Desk'; //BS-1458
const RIGHT_ADDITION = 'rightaddition'; //BS-1412
const LEFT_ADDITION = 'leftaddition'; //BS-1412
const RIGHT_SPHERE = 'rightsphere'; //BS-1412
const RIGHT_CYLINDER = 'rightcylinder'; //BS-1412
const RIGHT_AXIS = 'rightaxis'; //BS-1412
const RIGHT_PRISM1 = 'rightprism1'; //BS-1412
const RIGHT_PRISMBASE1 = 'rightprismbase1'; //BS-1412
const RIGHT_PRISMBASE1_RADIO = 'rightprismbase1radio'; //BS-1412
const RIGHT_PRISM2 = 'rightprism2'; //BS-1412
const RIGHT_PRISMBASE2 = 'rightprismbase2'; //BS-1412
const RIGHT_PRISMBASE2_RADIO = 'rightprismbase2radio'; //BS-1412
const LEFT_SPHERE = 'leftsphere'; //BS-1412
const LEFT_CYLINDER = 'leftcylinder'; //BS-1412
const LEFT_AXIS = 'leftaxis'; //BS-1412
const LEFT_PRISM1 = 'leftprism1'; //BS-1412
const LEFT_PRISMBASE1 = 'leftprismbase1'; //BS-1412
const LEFT_PRISMBASE1_RADIO = 'leftprismbase1radio'; //BS-1412
const LEFT_PRISM2 = 'leftprism2'; //BS-1412
const LEFT_PRISMBASE2 = 'leftprismbase2'; //BS-1412
const LEFT_PRISMBASE2_RADIO = 'leftprismbase2radio'; //BS-1412
const PANORAMA_SINGLE_VISION = 'Panorama Single Vision'; //BS-1412
const INPUT_CELL_DISABLED = 'input-cell disabled'; //BS-1412
const INPUT_CELL = 'input-cell'; //BS-1412
const LABEL_HIDDEN = 'label-hidden'; //BS-1412
const INPUT_BORDER = 'input-border'; //BS-1412
const INPUT_CELL_RADIO_WIDTH = 'input-cell td-radio-width'; //BS-1412
const INPUT_BLACK_COLOR = 'black-color'; //BS-1412
const INPUT_VALIDATE_BLACK_COLOR = 'validate black-color'; //BS-1412
const TYPE_RADIO = 'radio'; //BS-1412
const INPUT_CELL_DISABLED_RADIO_WIDTH = 'input-cell disabled td-radio-width'; //BS-1412
const INPUT_BORDER_RIGHT_ADDITION = 'input-border rightaddition'; //BS-1412
const INPUT_BORDER_LEFT_ADDITION = 'input-border leftaddition'; //BS-1412
const INPUT_RIGHT_SPHERE_7 = 'input-border rightsphere7'; //BS-1412
const INPUT_RIGHT_CYLINDER_7 = 'input-border rightcylinder7'; //BS-1412
const INPUT_RIGHT_AXIS_7 = 'input-border rightaxis7'; //BS-1412
const INPUT_RIGHT_PRISM1_7 = 'input-border rightprism1-7'; //BS-1412
const INPUT_RIGHT_PRISM_BASE1_4 = 'input-border rightprismbase1-4'; //BS-1412
const INPUT_RIGHT_PRISM2_7 = 'input-border rightprism2-7'; //BS-1412
const INPUT_RIGHT_PRISM_BASE2_4 = 'input-border rightprismbase2-4'; //BS-1412
const INPUT_LEFT_PRISM_BASE1_5 = 'input-border leftprismbase1-5'; //BS-1412
const INPUT_LEFT_SPHERE_9 = 'input-border leftsphere9'; //BS-1412
const INPUT_LEFT_CYLINDER_9 = 'input-border leftcylinder9'; //BS-1412
const INPUT_LEFT_AXIS_9 = 'input-border leftaxis9'; //BS-1412
const INPUT_LEFT_PRISM1_9 = 'input-border leftprism1-9'; //BS-1412
const INPUT_LEFT_PRISM_BASE1_8 = 'input-border leftprismbase1-8'; //BS-1412
const INPUT_LEFT_PRISM2_9 = 'input-border leftprism2-9'; //BS-1412
const INPUT_LEFT_BASE2_8 = 'input-border leftprismbase2-8'; //BS-1412
const PANORAMA_RELAX = 'Panorama Relax'; //BS-2508

//BS-1443 : Genric method to remove validation.
const removeValidation = (template, className) => {
    const templateToUpdate = template.querySelector(className);
    templateToUpdate.setCustomValidity('');
    templateToUpdate.reportValidity();
};

//BS-1224
const decimalAppendedPrescriptionValues = (lensConfiguratorCollection, allInputFields) => {
    let parsedCollection = JSON.parse(JSON.stringify(lensConfiguratorCollection));
    allInputFields.forEach((enteredInput) => {
        if (FIELDS_NOT_TO_APPEND_DECIMAL.includes(enteredInput) == false) {
            if (parsedCollection[enteredInput] != null && parsedCollection[enteredInput] != undefined) {
                if (parsedCollection[enteredInput] && parsedCollection[enteredInput].includes('.') == false) {
                    parsedCollection[enteredInput] = parsedCollection[enteredInput] + TWO_ZERO_WITH_DOT;
                } else if (parsedCollection[enteredInput].includes('.') == true) {
                    let totalDecimalEntered = parsedCollection[enteredInput].split('.')[1].length;
                    if (totalDecimalEntered != null && totalDecimalEntered != undefined && totalDecimalEntered > 0 && totalDecimalEntered < 3) {
                        if (totalDecimalEntered == 2) {
                            parsedCollection[enteredInput] = parsedCollection[enteredInput];
                        } else if (totalDecimalEntered == 1) {
                            parsedCollection[enteredInput] = parsedCollection[enteredInput] + ONE_ZERO;
                        }
                    } else if (totalDecimalEntered != null && totalDecimalEntered != undefined && totalDecimalEntered == 0) {
                        parsedCollection[enteredInput] = parsedCollection[enteredInput] + TWO_ZERO;
                    } else if (totalDecimalEntered >= 3) {
                        let beforeDecimal = parsedCollection[enteredInput].split('.')[0];
                        let enteredDecimal = parsedCollection[enteredInput].split('.')[1];
                        enteredDecimal = enteredDecimal.slice(0, 2);
                        parsedCollection[enteredInput] = beforeDecimal + '.' + enteredDecimal;
                    }
                }
            }
        }
    });
    return parsedCollection;
};

//Added as a part of BS-1458
// Prescription Validations

export function validateRightLeftNoPrismConditionValues(prescriptionDataValue, prescriptionFieldData, template, labels, lensType, inputBoxName) {
    let isValid = true;
    if (prescriptionDataValue['rightsphere'] != null) {
        if (
            isNaN(prescriptionDataValue['rightsphere']) ||
            prescriptionFieldData[0].B2B_Sphere_Min_Allowed__c > prescriptionDataValue['rightsphere'] ||
            prescriptionFieldData[0].B2B_Sphere_Max_Allowed__c < prescriptionDataValue['rightsphere']
        ) {
            const templateToUpdate = template.querySelector('.rightsphere1');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightsphere1');
        }
    } else {
        removeValidation(template, '.rightsphere1');
    }
    if (prescriptionDataValue['rightcylinder'] != null) {
        if (
            isNaN(prescriptionDataValue['rightcylinder']) ||
            prescriptionFieldData[0].B2B_Cylinder_Min_Allowed__c > prescriptionDataValue['rightcylinder'] ||
            prescriptionFieldData[0].B2B_Cylinder_Max_Allowed__c < prescriptionDataValue['rightcylinder']
        ) {
            const templateToUpdate = template.querySelector('.rightcylinder1');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightcylinder1');
        }
    } else {
        removeValidation(template, '.rightcylinder1');
    }
    if (prescriptionDataValue['rightaxis'] != null) {
        if (
            isNaN(prescriptionDataValue['rightaxis']) ||
            prescriptionFieldData[0].B2B_Axis_Min_Allowed__c > prescriptionDataValue['rightaxis'] ||
            prescriptionFieldData[0].B2B_Axis_Max_Allowed__c < prescriptionDataValue['rightaxis']
        ) {
            const templateToUpdate = template.querySelector('.rightaxis1');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightaxis1');
        }
    } else {
        removeValidation(template, '.rightaxis1');
    }

    if (prescriptionDataValue['leftsphere'] != null) {
        if (
            isNaN(prescriptionDataValue['leftsphere']) ||
            prescriptionFieldData[0].B2B_Sphere_Min_Allowed__c > prescriptionDataValue['leftsphere'] ||
            prescriptionFieldData[0].B2B_Sphere_Max_Allowed__c < prescriptionDataValue['leftsphere']
        ) {
            const templateToUpdate = template.querySelector('.leftsphere1');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftsphere1');
        }
    } else {
        removeValidation(template, '.leftsphere1');
    }
    if (prescriptionDataValue['leftcylinder'] != null) {
        if (
            isNaN(prescriptionDataValue['leftcylinder']) ||
            prescriptionFieldData[0].B2B_Cylinder_Min_Allowed__c > prescriptionDataValue['leftcylinder'] ||
            prescriptionFieldData[0].B2B_Cylinder_Max_Allowed__c < prescriptionDataValue['leftcylinder']
        ) {
            const templateToUpdate = template.querySelector('.leftcylinder1');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftcylinder1');
        }
    } else {
        removeValidation(template, '.leftcylinder1');
    }
    if (prescriptionDataValue['leftaxis'] != null) {
        if (
            isNaN(prescriptionDataValue['leftaxis']) ||
            prescriptionFieldData[0].B2B_Axis_Min_Allowed__c > prescriptionDataValue['leftaxis'] ||
            prescriptionFieldData[0].B2B_Axis_Max_Allowed__c < prescriptionDataValue['leftaxis']
        ) {
            const templateToUpdate = template.querySelector('.leftaxis1');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftaxis1');
        }
    } else {
        removeValidation(template, '.leftaxis1');
    }
    //Added as a part of BS-1458
    if (
        (lensType == PANORAMA_PROGRESSIVE || lensType == PANORAMA_PROGRESSIVE_ONE || lensType == PANORAMA_OFFICE) &&
        (inputBoxName == 'rightaddition' || inputBoxName == 'fromContainer')
    ) {
        if (prescriptionDataValue['rightaddition'] == undefined || prescriptionDataValue['rightaddition'] == null) {
            const templateToUpdate = template.querySelector('.rightaddition');
            templateToUpdate.setCustomValidity(labels.emptyAdditionErrorMessage);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (prescriptionDataValue['rightaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['rightaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
            ) {
                const templateToUpdate = template.querySelector('.rightaddition');
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            } else {
                const templateToUpdate = template.querySelector('.rightaddition');
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    } else {
        if (prescriptionDataValue['rightaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['rightaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
            ) {
                const templateToUpdate = template.querySelector('.rightaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity(labels.message);
                    templateToUpdate.reportValidity();
                    isValid = false;
                }
            } else {
                const templateToUpdate = template.querySelector('.rightaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity('');
                    templateToUpdate.reportValidity();
                }
            }
        }
    }
    //Added as a part of BS-1458
    if (
        (lensType == PANORAMA_PROGRESSIVE || lensType == PANORAMA_PROGRESSIVE_ONE || lensType == PANORAMA_OFFICE) &&
        (inputBoxName == 'leftaddition' || inputBoxName == 'fromContainer')
    ) {
        if (prescriptionDataValue['leftaddition'] == undefined || prescriptionDataValue['leftaddition'] == null) {
            const templateToUpdate = template.querySelector('.leftaddition');
            templateToUpdate.setCustomValidity(labels.emptyAdditionErrorMessage);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (prescriptionDataValue['leftaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['leftaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
            ) {
                const templateToUpdate = template.querySelector('.leftaddition');
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            } else {
                const templateToUpdate = template.querySelector('.leftaddition');
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    } else {
        if (prescriptionDataValue['leftaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['leftaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
            ) {
                const templateToUpdate = template.querySelector('.leftaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity(labels.message);
                    templateToUpdate.reportValidity();
                    isValid = false;
                }
            } else {
                const templateToUpdate = template.querySelector('.leftaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity('');
                    templateToUpdate.reportValidity();
                }
            }
        }
    }
    return isValid;
}

export function validateRightNoPrismConditionValues(prescriptionDataValue, prescriptionFieldData, template, labels, lensType, inputBoxName) {
    let isValid = true;
    if (prescriptionDataValue['rightsphere'] != null) {
        if (
            isNaN(prescriptionDataValue['rightsphere']) ||
            prescriptionFieldData[0].B2B_Sphere_Min_Allowed__c > prescriptionDataValue['rightsphere'] ||
            prescriptionFieldData[0].B2B_Sphere_Max_Allowed__c < prescriptionDataValue['rightsphere']
        ) {
            const templateToUpdate = template.querySelector('.rightsphere2');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightsphere2');
        }
    } else {
        removeValidation(template, '.rightsphere2');
    }
    if (prescriptionDataValue['rightcylinder'] != null) {
        if (
            isNaN(prescriptionDataValue['rightcylinder']) ||
            prescriptionFieldData[0].B2B_Cylinder_Min_Allowed__c > prescriptionDataValue['rightcylinder'] ||
            prescriptionFieldData[0].B2B_Cylinder_Max_Allowed__c < prescriptionDataValue['rightcylinder']
        ) {
            const templateToUpdate = template.querySelector('.rightcylinder2');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightcylinder2');
        }
    } else {
        removeValidation(template, '.rightcylinder2');
    }
    if (prescriptionDataValue['rightaxis'] != null) {
        if (
            isNaN(prescriptionDataValue['rightaxis']) ||
            prescriptionFieldData[0].B2B_Axis_Min_Allowed__c > prescriptionDataValue['rightaxis'] ||
            prescriptionFieldData[0].B2B_Axis_Max_Allowed__c < prescriptionDataValue['rightaxis']
        ) {
            const templateToUpdate = template.querySelector('.rightaxis2');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightaxis2');
        }
    } else {
        removeValidation(template, '.rightaxis2');
    }

    //Added as a part of BS-1458
    if (
        (lensType == PANORAMA_PROGRESSIVE || lensType == PANORAMA_PROGRESSIVE_ONE || lensType == PANORAMA_OFFICE) &&
        (inputBoxName == 'rightaddition' || inputBoxName == 'fromContainer')
    ) {
        if (prescriptionDataValue['rightaddition'] == undefined || prescriptionDataValue['rightaddition'] == null) {
            const templateToUpdate = template.querySelector('.rightaddition');
            templateToUpdate.setCustomValidity(labels.emptyAdditionErrorMessage);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (prescriptionDataValue['rightaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['rightaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
            ) {
                const templateToUpdate = template.querySelector('.rightaddition');
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            } else {
                const templateToUpdate = template.querySelector('.rightaddition');
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    } else {
        if (prescriptionDataValue['rightaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['rightaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
            ) {
                const templateToUpdate = template.querySelector('.rightaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity(labels.message);
                    templateToUpdate.reportValidity();
                    isValid = false;
                }
            } else {
                const templateToUpdate = template.querySelector('.rightaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity('');
                    templateToUpdate.reportValidity();
                }
            }
        }
    }
    if (prescriptionDataValue['leftaddition'] != null) {
        if (
            isNaN(prescriptionDataValue['leftaddition']) ||
            prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
            prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
        ) {
            const templateToUpdate = template.querySelector('.leftaddition');
            if (templateToUpdate) {
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            }
        } else {
            const templateToUpdate = template.querySelector('.leftaddition');
            if (templateToUpdate) {
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    }
    return isValid;
}

export function validateLefttNoPrismConditionValues(prescriptionDataValue, prescriptionFieldData, template, labels, lensType, inputBoxName) {
    let isValid = true;
    if (prescriptionDataValue['leftsphere'] != null) {
        if (
            isNaN(prescriptionDataValue['leftsphere']) ||
            prescriptionFieldData[0].B2B_Sphere_Min_Allowed__c > prescriptionDataValue['leftsphere'] ||
            prescriptionFieldData[0].B2B_Sphere_Max_Allowed__c < prescriptionDataValue['leftsphere']
        ) {
            const templateToUpdate = template.querySelector('.leftsphere3');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftsphere3');
        }
    } else {
        removeValidation(template, '.leftsphere3');
    }
    if (prescriptionDataValue['leftcylinder'] != null) {
        if (
            isNaN(prescriptionDataValue['leftcylinder']) ||
            prescriptionFieldData[0].B2B_Cylinder_Min_Allowed__c > prescriptionDataValue['leftcylinder'] ||
            prescriptionFieldData[0].B2B_Cylinder_Max_Allowed__c < prescriptionDataValue['leftcylinder']
        ) {
            const templateToUpdate = template.querySelector('.leftcylinder3');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftcylinder3');
        }
    } else {
        removeValidation(template, '.leftcylinder3');
    }
    if (prescriptionDataValue['leftaxis'] != null) {
        if (
            isNaN(prescriptionDataValue['leftaxis']) ||
            prescriptionFieldData[0].B2B_Axis_Min_Allowed__c > prescriptionDataValue['leftaxis'] ||
            prescriptionFieldData[0].B2B_Axis_Max_Allowed__c < prescriptionDataValue['leftaxis']
        ) {
            const templateToUpdate = template.querySelector('.leftaxis3');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftaxis3');
        }
    } else {
        removeValidation(template, '.leftaxis3');
    }
    if (prescriptionDataValue['rightaddition'] != null) {
        if (
            isNaN(prescriptionDataValue['rightaddition']) ||
            prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
            prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
        ) {
            const templateToUpdate = template.querySelector('.rightaddition');
            if (templateToUpdate) {
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            }
        } else {
            const templateToUpdate = template.querySelector('.rightaddition');
            if (templateToUpdate) {
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    }
    //Added as a part of BS-1458
    if (
        (lensType == PANORAMA_PROGRESSIVE || lensType == PANORAMA_PROGRESSIVE_ONE || lensType == PANORAMA_OFFICE) &&
        (inputBoxName == 'leftaddition' || inputBoxName == 'fromContainer')
    ) {
        if (prescriptionDataValue['leftaddition'] == undefined || prescriptionDataValue['leftaddition'] == null) {
            const templateToUpdate = template.querySelector('.leftaddition');
            templateToUpdate.setCustomValidity(labels.emptyAdditionErrorMessage);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (prescriptionDataValue['leftaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['leftaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
            ) {
                const templateToUpdate = template.querySelector('.leftaddition');
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            } else {
                const templateToUpdate = template.querySelector('.leftaddition');
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    } else {
        if (prescriptionDataValue['leftaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['leftaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
            ) {
                const templateToUpdate = template.querySelector('.leftaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity(labels.message);
                    templateToUpdate.reportValidity();
                    isValid = false;
                }
            } else {
                const templateToUpdate = template.querySelector('.leftaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity('');
                    templateToUpdate.reportValidity();
                }
            }
        }
    }
    return isValid;
}

export function validateRightLeftDegreeConditionValues(prescriptionDataValue, prescriptionFieldData, template, labels, lensType, inputBoxName) {
    let isValid = true;
    if (prescriptionDataValue['rightsphere'] != null) {
        if (
            isNaN(prescriptionDataValue['rightsphere']) ||
            prescriptionFieldData[0].B2B_Sphere_Min_Allowed__c > prescriptionDataValue['rightsphere'] ||
            prescriptionFieldData[0].B2B_Sphere_Max_Allowed__c < prescriptionDataValue['rightsphere']
        ) {
            const templateToUpdate = template.querySelector('.rightsphere4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightsphere4');
        }
    } else {
        removeValidation(template, '.rightsphere4');
    }
    if (prescriptionDataValue['rightcylinder'] != null) {
        if (
            isNaN(prescriptionDataValue['rightcylinder']) ||
            prescriptionFieldData[0].B2B_Cylinder_Min_Allowed__c > prescriptionDataValue['rightcylinder'] ||
            prescriptionFieldData[0].B2B_Cylinder_Max_Allowed__c < prescriptionDataValue['rightcylinder']
        ) {
            const templateToUpdate = template.querySelector('.rightcylinder4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightcylinder4');
        }
    } else {
        removeValidation(template, '.rightcylinder4');
    }
    if (prescriptionDataValue['rightaxis'] != null) {
        if (
            isNaN(prescriptionDataValue['rightaxis']) ||
            prescriptionFieldData[0].B2B_Axis_Min_Allowed__c > prescriptionDataValue['rightaxis'] ||
            prescriptionFieldData[0].B2B_Axis_Max_Allowed__c < prescriptionDataValue['rightaxis']
        ) {
            const templateToUpdate = template.querySelector('.rightaxis4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightaxis4');
        }
    } else {
        removeValidation(template, '.rightaxis4');
    }
    if (prescriptionDataValue['rightprism1'] != null) {
        if (
            isNaN(prescriptionDataValue['rightprism1']) ||
            prescriptionFieldData[0].B2B_Prism_1_Min_Allowed__c > prescriptionDataValue['rightprism1'] ||
            prescriptionFieldData[0].B2B_Prism_1_Max_Allowed__c < prescriptionDataValue['rightprism1']
        ) {
            const templateToUpdate = template.querySelector('.rightprism1-4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightprism1-4');
        }
    } else {
        removeValidation(template, '.rightprism1-4');
    }
    if (prescriptionDataValue['rightprismbase1'] != null) {
        if (
            isNaN(prescriptionDataValue['rightprismbase1']) ||
            prescriptionFieldData[0].B2B_Prism_base_1_Min_Allowed__c > prescriptionDataValue['rightprismbase1'] ||
            prescriptionFieldData[0].B2B_Prism_base_1_Max_Allowed__c < prescriptionDataValue['rightprismbase1']
        ) {
            const templateToUpdate = template.querySelector('.rightprismbase1-4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightprismbase1-4');
        }
    } else {
        removeValidation(template, '.rightprismbase1-4');
    }
    if (prescriptionDataValue['rightprism2'] != null) {
        if (
            isNaN(prescriptionDataValue['rightprism2']) ||
            prescriptionFieldData[0].B2B_Prism_2_Min_Allowed__c > prescriptionDataValue['rightprism2'] ||
            prescriptionFieldData[0].B2B_Prism_2_Max_Allowed__c < prescriptionDataValue['rightprism2']
        ) {
            const templateToUpdate = template.querySelector('.rightprism2-4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightprism2-4');
        }
    } else {
        removeValidation(template, '.rightprism2-4');
    }
    if (prescriptionDataValue['rightprismbase2'] != null) {
        if (
            isNaN(prescriptionDataValue['rightprismbase2']) ||
            prescriptionFieldData[0].B2B_Prism_base_2_Min_Allowed__c > prescriptionDataValue['rightprismbase2'] ||
            prescriptionFieldData[0].B2B_Prism_base_2_Max_Allowed__c < prescriptionDataValue['rightprismbase2']
        ) {
            const templateToUpdate = template.querySelector('.rightprismbase2-4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightprismbase2-4');
        }
    } else {
        removeValidation(template, '.rightprismbase2-4');
    }
    if (prescriptionDataValue['leftsphere'] != null) {
        if (
            isNaN(prescriptionDataValue['leftsphere']) ||
            prescriptionFieldData[0].B2B_Sphere_Min_Allowed__c > prescriptionDataValue['leftsphere'] ||
            prescriptionFieldData[0].B2B_Sphere_Max_Allowed__c < prescriptionDataValue['leftsphere']
        ) {
            const templateToUpdate = template.querySelector('.leftsphere4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftsphere4');
        }
    } else {
        removeValidation(template, '.leftsphere4');
    }
    if (prescriptionDataValue['leftcylinder'] != null) {
        if (
            isNaN(prescriptionDataValue['leftcylinder']) ||
            prescriptionFieldData[0].B2B_Cylinder_Min_Allowed__c > prescriptionDataValue['leftcylinder'] ||
            prescriptionFieldData[0].B2B_Cylinder_Max_Allowed__c < prescriptionDataValue['leftcylinder']
        ) {
            const templateToUpdate = template.querySelector('.leftcylinder4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftcylinder4');
        }
    } else {
        removeValidation(template, '.leftcylinder4');
    }
    if (prescriptionDataValue['leftaxis'] != null) {
        if (
            isNaN(prescriptionDataValue['leftaxis']) ||
            prescriptionFieldData[0].B2B_Axis_Min_Allowed__c > prescriptionDataValue['leftaxis'] ||
            prescriptionFieldData[0].B2B_Axis_Max_Allowed__c < prescriptionDataValue['leftaxis']
        ) {
            const templateToUpdate = template.querySelector('.leftaxis4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftaxis4');
        }
    } else {
        removeValidation(template, '.leftaxis4');
    }
    if (prescriptionDataValue['leftprism1'] != null) {
        if (
            isNaN(prescriptionDataValue['leftprism1']) ||
            prescriptionFieldData[0].B2B_Prism_1_Min_Allowed__c > prescriptionDataValue['leftprism1'] ||
            prescriptionFieldData[0].B2B_Prism_1_Max_Allowed__c < prescriptionDataValue['leftprism1']
        ) {
            const templateToUpdate = template.querySelector('.leftprism1-4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftprism1-4');
        }
    } else {
        removeValidation(template, '.leftprism1-4');
    }
    if (prescriptionDataValue['leftprismbase1'] != null) {
        if (
            isNaN(prescriptionDataValue['leftprismbase1']) ||
            prescriptionFieldData[0].B2B_Prism_base_1_Min_Allowed__c > prescriptionDataValue['leftprismbase1'] ||
            prescriptionFieldData[0].B2B_Prism_base_1_Max_Allowed__c < prescriptionDataValue['leftprismbase1']
        ) {
            const templateToUpdate = template.querySelector('.leftprismbase1-4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftprismbase1-4');
        }
    } else {
        removeValidation(template, '.leftprismbase1-4');
    }
    if (prescriptionDataValue['leftprism2'] != null) {
        if (
            isNaN(prescriptionDataValue['leftprism2']) ||
            prescriptionFieldData[0].B2B_Prism_2_Min_Allowed__c > prescriptionDataValue['leftprism2'] ||
            prescriptionFieldData[0].B2B_Prism_2_Max_Allowed__c < prescriptionDataValue['leftprism2']
        ) {
            const templateToUpdate = template.querySelector('.leftprism2-4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftprism2-4');
        }
    } else {
        removeValidation(template, '.leftprism2-4');
    }
    if (prescriptionDataValue['leftprismbase2'] != null) {
        if (
            isNaN(prescriptionDataValue['leftprismbase2']) ||
            prescriptionFieldData[0].B2B_Prism_base_2_Min_Allowed__c > prescriptionDataValue['leftprismbase2'] ||
            prescriptionFieldData[0].B2B_Prism_base_2_Max_Allowed__c < prescriptionDataValue['leftprismbase2']
        ) {
            const templateToUpdate = template.querySelector('.leftprismbase2-4');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftprismbase2-4');
        }
    } else {
        removeValidation(template, '.leftprismbase2-4');
    }
    //Added as a part of BS-1458
    if (
        (lensType == PANORAMA_PROGRESSIVE || lensType == PANORAMA_PROGRESSIVE_ONE || lensType == PANORAMA_OFFICE) &&
        (inputBoxName == 'rightaddition' || inputBoxName == 'fromContainer')
    ) {
        if (prescriptionDataValue['rightaddition'] == undefined || prescriptionDataValue['rightaddition'] == null) {
            const templateToUpdate = template.querySelector('.rightaddition');
            templateToUpdate.setCustomValidity(labels.emptyAdditionErrorMessage);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (prescriptionDataValue['rightaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['rightaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
            ) {
                const templateToUpdate = template.querySelector('.rightaddition');
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            } else {
                const templateToUpdate = template.querySelector('.rightaddition');
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    } else {
        if (prescriptionDataValue['rightaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['rightaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
            ) {
                const templateToUpdate = template.querySelector('.rightaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity(labels.message);
                    templateToUpdate.reportValidity();
                    isValid = false;
                }
            } else {
                const templateToUpdate = template.querySelector('.rightaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity('');
                    templateToUpdate.reportValidity();
                }
            }
        }
    }
    //Added as a part of BS-1458
    if (
        (lensType == PANORAMA_PROGRESSIVE || lensType == PANORAMA_PROGRESSIVE_ONE || lensType == PANORAMA_OFFICE) &&
        (inputBoxName == 'leftaddition' || inputBoxName == 'fromContainer')
    ) {
        if (prescriptionDataValue['leftaddition'] == undefined || prescriptionDataValue['leftaddition'] == null) {
            const templateToUpdate = template.querySelector('.leftaddition');
            templateToUpdate.setCustomValidity(labels.emptyAdditionErrorMessage);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (prescriptionDataValue['leftaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['leftaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
            ) {
                const templateToUpdate = template.querySelector('.leftaddition');
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            } else {
                const templateToUpdate = template.querySelector('.leftaddition');
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    } else {
        if (prescriptionDataValue['leftaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['leftaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
            ) {
                const templateToUpdate = template.querySelector('.leftaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity(labels.message);
                    templateToUpdate.reportValidity();
                    isValid = false;
                }
            } else {
                const templateToUpdate = template.querySelector('.leftaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity('');
                    templateToUpdate.reportValidity();
                }
            }
        }
    }
    return isValid;
}

export function validateRightLeftHorizontalVerticalConditionValues(prescriptionDataValue, prescriptionFieldData, template, labels, lensType, inputBoxName) {
    let isValid = true;
    if (prescriptionDataValue['rightsphere'] != null) {
        if (
            isNaN(prescriptionDataValue['rightsphere']) ||
            prescriptionFieldData[0].B2B_Sphere_Min_Allowed__c > prescriptionDataValue['rightsphere'] ||
            prescriptionFieldData[0].B2B_Sphere_Max_Allowed__c < prescriptionDataValue['rightsphere']
        ) {
            const templateToUpdate = template.querySelector('.rightsphere5');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightsphere5');
        }
    } else {
        removeValidation(template, '.rightsphere5');
    }
    if (prescriptionDataValue['rightcylinder'] != null) {
        if (
            isNaN(prescriptionDataValue['rightcylinder']) ||
            prescriptionFieldData[0].B2B_Cylinder_Min_Allowed__c > prescriptionDataValue['rightcylinder'] ||
            prescriptionFieldData[0].B2B_Cylinder_Max_Allowed__c < prescriptionDataValue['rightcylinder']
        ) {
            const templateToUpdate = template.querySelector('.rightcylinder5');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightcylinder5');
        }
    } else {
        removeValidation(template, '.rightcylinder5');
    }
    if (prescriptionDataValue['rightaxis'] != null) {
        if (
            isNaN(prescriptionDataValue['rightaxis']) ||
            prescriptionFieldData[0].B2B_Axis_Min_Allowed__c > prescriptionDataValue['rightaxis'] ||
            prescriptionFieldData[0].B2B_Axis_Max_Allowed__c < prescriptionDataValue['rightaxis']
        ) {
            const templateToUpdate = template.querySelector('.rightaxis5');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightaxis5');
        }
    } else {
        removeValidation(template, '.rightaxis5');
    }
    if (prescriptionDataValue['rightprism1'] != null) {
        if (
            isNaN(prescriptionDataValue['rightprism1']) ||
            prescriptionFieldData[0].B2B_Prism_1_Min_Allowed__c > prescriptionDataValue['rightprism1'] ||
            prescriptionFieldData[0].B2B_Prism_1_Max_Allowed__c < prescriptionDataValue['rightprism1']
        ) {
            const templateToUpdate = template.querySelector('.rightprism1-5');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightprism1-5');
        }
    } else {
        removeValidation(template, '.rightprism1-5');
    }
    if (prescriptionDataValue['rightprism2'] != null) {
        if (
            isNaN(prescriptionDataValue['rightprism2']) ||
            prescriptionFieldData[0].B2B_Prism_2_Min_Allowed__c > prescriptionDataValue['rightprism2'] ||
            prescriptionFieldData[0].B2B_Prism_2_Max_Allowed__c < prescriptionDataValue['rightprism2']
        ) {
            const templateToUpdate = template.querySelector('.rightprism2-5');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightprism2-5');
        }
    } else {
        removeValidation(template, '.rightprism2-5');
    }
    if (prescriptionDataValue['leftsphere'] != null) {
        if (
            isNaN(prescriptionDataValue['leftsphere']) ||
            prescriptionFieldData[0].B2B_Sphere_Min_Allowed__c > prescriptionDataValue['leftsphere'] ||
            prescriptionFieldData[0].B2B_Sphere_Max_Allowed__c < prescriptionDataValue['leftsphere']
        ) {
            const templateToUpdate = template.querySelector('.leftsphere5');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftsphere5');
        }
    } else {
        removeValidation(template, '.leftsphere5');
    }
    if (prescriptionDataValue['leftcylinder'] != null) {
        if (
            isNaN(prescriptionDataValue['leftcylinder']) ||
            prescriptionFieldData[0].B2B_Cylinder_Min_Allowed__c > prescriptionDataValue['leftcylinder'] ||
            prescriptionFieldData[0].B2B_Cylinder_Max_Allowed__c < prescriptionDataValue['leftcylinder']
        ) {
            const templateToUpdate = template.querySelector('.leftcylinder5');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftcylinder5');
        }
    } else {
        removeValidation(template, '.leftcylinder5');
    }
    if (prescriptionDataValue['leftaxis'] != null) {
        if (
            isNaN(prescriptionDataValue['leftaxis']) ||
            prescriptionFieldData[0].B2B_Axis_Min_Allowed__c > prescriptionDataValue['leftaxis'] ||
            prescriptionFieldData[0].B2B_Axis_Max_Allowed__c < prescriptionDataValue['leftaxis']
        ) {
            const templateToUpdate = template.querySelector('.leftaxis5');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftaxis5');
        }
    } else {
        removeValidation(template, '.leftaxis5');
    }
    if (prescriptionDataValue['leftprism1'] != null) {
        if (
            isNaN(prescriptionDataValue['leftprism1']) ||
            prescriptionFieldData[0].B2B_Prism_1_Min_Allowed__c > prescriptionDataValue['leftprism1'] ||
            prescriptionFieldData[0].B2B_Prism_1_Max_Allowed__c < prescriptionDataValue['leftprism1']
        ) {
            const templateToUpdate = template.querySelector('.leftprism1-5');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftprism1-5');
        }
    } else {
        removeValidation(template, '.leftprism1-5');
    }
    if (prescriptionDataValue['leftprism2'] != null) {
        if (
            isNaN(prescriptionDataValue['leftprism2']) ||
            prescriptionFieldData[0].B2B_Prism_2_Min_Allowed__c > prescriptionDataValue['leftprism2'] ||
            prescriptionFieldData[0].B2B_Prism_2_Max_Allowed__c < prescriptionDataValue['leftprism2']
        ) {
            const templateToUpdate = template.querySelector('.leftprism2-5');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftprism2-5');
        }
    } else {
        removeValidation(template, '.leftprism2-5');
    }
    //Added as a part of BS-1458
    if (
        (lensType == PANORAMA_PROGRESSIVE || lensType == PANORAMA_PROGRESSIVE_ONE || lensType == PANORAMA_OFFICE) &&
        (inputBoxName == 'rightaddition' || inputBoxName == 'fromContainer')
    ) {
        if (prescriptionDataValue['rightaddition'] == undefined || prescriptionDataValue['rightaddition'] == null) {
            const templateToUpdate = template.querySelector('.rightaddition');
            templateToUpdate.setCustomValidity(labels.emptyAdditionErrorMessage);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (prescriptionDataValue['rightaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['rightaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
            ) {
                const templateToUpdate = template.querySelector('.rightaddition');
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            } else {
                const templateToUpdate = template.querySelector('.rightaddition');
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    } else {
        if (prescriptionDataValue['rightaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['rightaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
            ) {
                const templateToUpdate = template.querySelector('.rightaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity(labels.message);
                    templateToUpdate.reportValidity();
                    isValid = false;
                }
            } else {
                const templateToUpdate = template.querySelector('.rightaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity('');
                    templateToUpdate.reportValidity();
                }
            }
        }
    }
    //Added as a part of BS-1458
    if (
        (lensType == PANORAMA_PROGRESSIVE || lensType == PANORAMA_PROGRESSIVE_ONE || lensType == PANORAMA_OFFICE) &&
        (inputBoxName == 'leftaddition' || inputBoxName == 'fromContainer')
    ) {
        if (prescriptionDataValue['leftaddition'] == undefined || prescriptionDataValue['leftaddition'] == null) {
            const templateToUpdate = template.querySelector('.leftaddition');
            templateToUpdate.setCustomValidity(labels.emptyAdditionErrorMessage);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (prescriptionDataValue['leftaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['leftaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
            ) {
                const templateToUpdate = template.querySelector('.leftaddition');
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            } else {
                const templateToUpdate = template.querySelector('.leftaddition');
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    } else {
        if (prescriptionDataValue['leftaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['leftaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
            ) {
                const templateToUpdate = template.querySelector('.leftaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity(labels.message);
                    templateToUpdate.reportValidity();
                    isValid = false;
                }
            } else {
                const templateToUpdate = template.querySelector('.leftaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity('');
                    templateToUpdate.reportValidity();
                }
            }
        }
    }
    return isValid;
}

export function validateRightDegreeConditionValues(prescriptionDataValue, prescriptionFieldData, template, labels, lensType, inputBoxName) {
    let isValid = true;
    if (prescriptionDataValue['rightsphere'] != null) {
        if (
            isNaN(prescriptionDataValue['rightsphere']) ||
            prescriptionFieldData[0].B2B_Sphere_Min_Allowed__c > prescriptionDataValue['rightsphere'] ||
            prescriptionFieldData[0].B2B_Sphere_Max_Allowed__c < prescriptionDataValue['rightsphere']
        ) {
            const templateToUpdate = template.querySelector('.rightsphere6');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightsphere6');
        }
    } else {
        removeValidation(template, '.rightsphere6');
    }
    if (prescriptionDataValue['rightcylinder'] != null) {
        if (
            isNaN(prescriptionDataValue['rightcylinder']) ||
            prescriptionFieldData[0].B2B_Cylinder_Min_Allowed__c > prescriptionDataValue['rightcylinder'] ||
            prescriptionFieldData[0].B2B_Cylinder_Max_Allowed__c < prescriptionDataValue['rightcylinder']
        ) {
            const templateToUpdate = template.querySelector('.rightcylinder6');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightcylinder6');
        }
    } else {
        removeValidation(template, '.rightcylinder6');
    }
    if (prescriptionDataValue['rightaxis'] != null) {
        if (
            isNaN(prescriptionDataValue['rightaxis']) ||
            prescriptionFieldData[0].B2B_Axis_Min_Allowed__c > prescriptionDataValue['rightaxis'] ||
            prescriptionFieldData[0].B2B_Axis_Max_Allowed__c < prescriptionDataValue['rightaxis']
        ) {
            const templateToUpdate = template.querySelector('.rightaxis6');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightaxis6');
        }
    } else {
        removeValidation(template, '.rightaxis6');
    }
    if (prescriptionDataValue['rightprism1'] != null) {
        if (
            isNaN(prescriptionDataValue['rightprism1']) ||
            prescriptionFieldData[0].B2B_Prism_1_Min_Allowed__c > prescriptionDataValue['rightprism1'] ||
            prescriptionFieldData[0].B2B_Prism_1_Max_Allowed__c < prescriptionDataValue['rightprism1']
        ) {
            const templateToUpdate = template.querySelector('.rightprism1-6');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightprism1-6');
        }
    } else {
        removeValidation(template, '.rightprism1-6');
    }
    if (prescriptionDataValue['rightprismbase1'] != null) {
        if (
            isNaN(prescriptionDataValue['rightprismbase1']) ||
            prescriptionFieldData[0].B2B_Prism_base_1_Min_Allowed__c > prescriptionDataValue['rightprismbase1'] ||
            prescriptionFieldData[0].B2B_Prism_base_1_Max_Allowed__c < prescriptionDataValue['rightprismbase1']
        ) {
            const templateToUpdate = template.querySelector('.rightprismbase1-6');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightprismbase1-6');
        }
    } else {
        removeValidation(template, '.rightprismbase1-6');
    }
    if (prescriptionDataValue['rightprism2'] != null) {
        if (
            isNaN(prescriptionDataValue['rightprism2']) ||
            prescriptionFieldData[0].B2B_Prism_2_Min_Allowed__c > prescriptionDataValue['rightprism2'] ||
            prescriptionFieldData[0].B2B_Prism_2_Max_Allowed__c < prescriptionDataValue['rightprism2']
        ) {
            const templateToUpdate = template.querySelector('.rightprism2-6');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightprism2-6');
        }
    } else {
        removeValidation(template, '.rightprism2-6');
    }
    if (prescriptionDataValue['rightprismbase2'] != null) {
        if (
            isNaN(prescriptionDataValue['rightprismbase2']) ||
            prescriptionFieldData[0].B2B_Prism_base_2_Min_Allowed__c > prescriptionDataValue['rightprismbase2'] ||
            prescriptionFieldData[0].B2B_Prism_base_2_Max_Allowed__c < prescriptionDataValue['rightprismbase2']
        ) {
            const templateToUpdate = template.querySelector('.rightprismbase2-6');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightprismbase2-6');
        }
    } else {
        removeValidation(template, '.rightprismbase2-6');
    }
    //Added as a part of BS-1458
    if (
        (lensType == PANORAMA_PROGRESSIVE || lensType == PANORAMA_PROGRESSIVE_ONE || lensType == PANORAMA_OFFICE) &&
        (inputBoxName == 'rightaddition' || inputBoxName == 'fromContainer')
    ) {
        if (prescriptionDataValue['rightaddition'] == undefined || prescriptionDataValue['rightaddition'] == null) {
            const templateToUpdate = template.querySelector('.rightaddition');
            templateToUpdate.setCustomValidity(labels.emptyAdditionErrorMessage);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (prescriptionDataValue['rightaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['rightaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
            ) {
                const templateToUpdate = template.querySelector('.rightaddition');
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            } else {
                const templateToUpdate = template.querySelector('.rightaddition');
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    } else {
        if (prescriptionDataValue['rightaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['rightaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
            ) {
                const templateToUpdate = template.querySelector('.rightaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity(labels.message);
                    templateToUpdate.reportValidity();
                    isValid = false;
                }
            } else {
                const templateToUpdate = template.querySelector('.rightaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity('');
                    templateToUpdate.reportValidity();
                }
            }
        }
    }
    if (prescriptionDataValue['leftaddition'] != null) {
        if (
            isNaN(prescriptionDataValue['leftaddition']) ||
            prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
            prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
        ) {
            const templateToUpdate = template.querySelector('.leftaddition');
            if (templateToUpdate) {
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            }
        } else {
            const templateToUpdate = template.querySelector('.leftaddition');
            if (templateToUpdate) {
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    }
    return isValid;
}

export function validateRightHorizontalVerticalConditionValues(prescriptionDataValue, prescriptionFieldData, template, labels, lensType, inputBoxName) {
    let isValid = true;
    if (prescriptionDataValue['rightsphere'] != null) {
        if (
            isNaN(prescriptionDataValue['rightsphere']) ||
            prescriptionFieldData[0].B2B_Sphere_Min_Allowed__c > prescriptionDataValue['rightsphere'] ||
            prescriptionFieldData[0].B2B_Sphere_Max_Allowed__c < prescriptionDataValue['rightsphere']
        ) {
            const templateToUpdate = template.querySelector('.rightsphere7');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightsphere7');
        }
    } else {
        removeValidation(template, '.rightsphere7');
    }
    if (prescriptionDataValue['rightcylinder'] != null) {
        if (
            isNaN(prescriptionDataValue['rightcylinder']) ||
            prescriptionFieldData[0].B2B_Cylinder_Min_Allowed__c > prescriptionDataValue['rightcylinder'] ||
            prescriptionFieldData[0].B2B_Cylinder_Max_Allowed__c < prescriptionDataValue['rightcylinder']
        ) {
            const templateToUpdate = template.querySelector('.rightcylinder7');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightcylinder7');
        }
    } else {
        removeValidation(template, '.rightcylinder7');
    }
    if (prescriptionDataValue['rightaxis'] != null) {
        if (
            isNaN(prescriptionDataValue['rightaxis']) ||
            prescriptionFieldData[0].B2B_Axis_Min_Allowed__c > prescriptionDataValue['rightaxis'] ||
            prescriptionFieldData[0].B2B_Axis_Max_Allowed__c < prescriptionDataValue['rightaxis']
        ) {
            const templateToUpdate = template.querySelector('.rightaxis7');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightaxis7');
        }
    } else {
        removeValidation(template, '.rightaxis7');
    }
    if (prescriptionDataValue['rightprism1'] != null) {
        if (
            isNaN(prescriptionDataValue['rightprism1']) ||
            prescriptionFieldData[0].B2B_Prism_1_Min_Allowed__c > prescriptionDataValue['rightprism1'] ||
            prescriptionFieldData[0].B2B_Prism_1_Max_Allowed__c < prescriptionDataValue['rightprism1']
        ) {
            const templateToUpdate = template.querySelector('.rightprism1-7');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightprism1-7');
        }
    } else {
        removeValidation(template, '.rightprism1-7');
    }
    if (prescriptionDataValue['rightprism2'] != null) {
        if (
            isNaN(prescriptionDataValue['rightprism2']) ||
            prescriptionFieldData[0].B2B_Prism_2_Min_Allowed__c > prescriptionDataValue['rightprism2'] ||
            prescriptionFieldData[0].B2B_Prism_2_Max_Allowed__c < prescriptionDataValue['rightprism2']
        ) {
            const templateToUpdate = template.querySelector('.rightprism2-7');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.rightprism2-7');
        }
    } else {
        removeValidation(template, '.rightprism2-7');
    }
    //Added as a part of BS-1458
    if (
        (lensType == PANORAMA_PROGRESSIVE || lensType == PANORAMA_PROGRESSIVE_ONE || lensType == PANORAMA_OFFICE) &&
        (inputBoxName == 'rightaddition' || inputBoxName == 'fromContainer')
    ) {
        if (prescriptionDataValue['rightaddition'] == undefined || prescriptionDataValue['rightaddition'] == null) {
            const templateToUpdate = template.querySelector('.rightaddition');
            templateToUpdate.setCustomValidity(labels.emptyAdditionErrorMessage);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (prescriptionDataValue['rightaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['rightaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
            ) {
                const templateToUpdate = template.querySelector('.rightaddition');
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            } else {
                const templateToUpdate = template.querySelector('.rightaddition');
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    } else {
        if (prescriptionDataValue['rightaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['rightaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
            ) {
                const templateToUpdate = template.querySelector('.rightaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity(labels.message);
                    templateToUpdate.reportValidity();
                    isValid = false;
                }
            } else {
                const templateToUpdate = template.querySelector('.rightaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity('');
                    templateToUpdate.reportValidity();
                }
            }
        }
    }
    if (prescriptionDataValue['leftaddition'] != null) {
        if (
            isNaN(prescriptionDataValue['leftaddition']) ||
            prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
            prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
        ) {
            const templateToUpdate = template.querySelector('.leftaddition');
            if (templateToUpdate) {
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            }
        } else {
            const templateToUpdate = template.querySelector('.leftaddition');
            if (templateToUpdate) {
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    }
    return isValid;
}

export function validateLeftDegreeConditionValues(prescriptionDataValue, prescriptionFieldData, template, labels, lensType, inputBoxName) {
    let isValid = true;
    if (prescriptionDataValue['leftsphere'] != null) {
        if (
            isNaN(prescriptionDataValue['leftsphere']) ||
            prescriptionFieldData[0].B2B_Sphere_Min_Allowed__c > prescriptionDataValue['leftsphere'] ||
            prescriptionFieldData[0].B2B_Sphere_Max_Allowed__c < prescriptionDataValue['leftsphere']
        ) {
            const templateToUpdate = template.querySelector('.leftsphere8');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftsphere8');
        }
    } else {
        removeValidation(template, '.leftsphere8');
    }
    if (prescriptionDataValue['leftcylinder'] != null) {
        if (
            isNaN(prescriptionDataValue['leftcylinder']) ||
            prescriptionFieldData[0].B2B_Cylinder_Min_Allowed__c > prescriptionDataValue['leftcylinder'] ||
            prescriptionFieldData[0].B2B_Cylinder_Max_Allowed__c < prescriptionDataValue['leftcylinder']
        ) {
            const templateToUpdate = template.querySelector('.leftcylinder8');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftcylinder8');
        }
    } else {
        removeValidation(template, '.leftcylinder8');
    }
    if (prescriptionDataValue['leftaxis'] != null) {
        if (
            isNaN(prescriptionDataValue['leftaxis']) ||
            prescriptionFieldData[0].B2B_Axis_Min_Allowed__c > prescriptionDataValue['leftaxis'] ||
            prescriptionFieldData[0].B2B_Axis_Max_Allowed__c < prescriptionDataValue['leftaxis']
        ) {
            const templateToUpdate = template.querySelector('.leftaxis8');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftaxis8');
        }
    } else {
        removeValidation(template, '.leftaxis8');
    }
    if (prescriptionDataValue['leftprism1'] != null) {
        if (
            isNaN(prescriptionDataValue['leftprism1']) ||
            prescriptionFieldData[0].B2B_Prism_1_Min_Allowed__c > prescriptionDataValue['leftprism1'] ||
            prescriptionFieldData[0].B2B_Prism_1_Max_Allowed__c < prescriptionDataValue['leftprism1']
        ) {
            const templateToUpdate = template.querySelector('.leftprism1-8');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftprism1-8');
        }
    } else {
        removeValidation(template, '.leftprism1-8');
    }
    if (prescriptionDataValue['leftprismbase1'] != null) {
        if (
            isNaN(prescriptionDataValue['leftprismbase1']) ||
            prescriptionFieldData[0].B2B_Prism_base_1_Min_Allowed__c > prescriptionDataValue['leftprismbase1'] ||
            prescriptionFieldData[0].B2B_Prism_base_1_Max_Allowed__c < prescriptionDataValue['leftprismbase1']
        ) {
            const templateToUpdate = template.querySelector('.leftprismbase1-8');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftprismbase1-8');
        }
    } else {
        removeValidation(template, '.leftprismbase1-8');
    }
    if (prescriptionDataValue['leftprism2'] != null) {
        if (
            isNaN(prescriptionDataValue['leftprism2']) ||
            prescriptionFieldData[0].B2B_Prism_2_Min_Allowed__c > prescriptionDataValue['leftprism2'] ||
            prescriptionFieldData[0].B2B_Prism_2_Max_Allowed__c < prescriptionDataValue['leftprism2']
        ) {
            const templateToUpdate = template.querySelector('.leftprism2-8');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftprism2-8');
        }
    } else {
        removeValidation(template, '.leftprism2-8');
    }
    if (prescriptionDataValue['leftprismbase2'] != null) {
        if (
            isNaN(prescriptionDataValue['leftprismbase2']) ||
            prescriptionFieldData[0].B2B_Prism_base_2_Min_Allowed__c > prescriptionDataValue['leftprismbase2'] ||
            prescriptionFieldData[0].B2B_Prism_base_2_Max_Allowed__c < prescriptionDataValue['leftprismbase2']
        ) {
            const templateToUpdate = template.querySelector('.leftprismbase2-8');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftprismbase2-8');
        }
    } else {
        removeValidation(template, '.leftprismbase2-8');
    }
    if (prescriptionDataValue['rightaddition'] != null) {
        if (
            isNaN(prescriptionDataValue['rightaddition']) ||
            prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
            prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
        ) {
            const templateToUpdate = template.querySelector('.rightaddition');
            if (templateToUpdate) {
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            }
        } else {
            const templateToUpdate = template.querySelector('.rightaddition');
            if (templateToUpdate) {
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    }
    //Added as a part of BS-1458
    if (
        (lensType == PANORAMA_PROGRESSIVE || lensType == PANORAMA_PROGRESSIVE_ONE || lensType == PANORAMA_OFFICE) &&
        (inputBoxName == 'leftaddition' || inputBoxName == 'fromContainer')
    ) {
        if (prescriptionDataValue['leftaddition'] == undefined || prescriptionDataValue['leftaddition'] == null) {
            const templateToUpdate = template.querySelector('.leftaddition');
            templateToUpdate.setCustomValidity(labels.emptyAdditionErrorMessage);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (prescriptionDataValue['leftaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['leftaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
            ) {
                const templateToUpdate = template.querySelector('.leftaddition');
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            } else {
                const templateToUpdate = template.querySelector('.leftaddition');
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    } else {
        if (prescriptionDataValue['leftaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['leftaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
            ) {
                const templateToUpdate = template.querySelector('.leftaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity(labels.message);
                    templateToUpdate.reportValidity();
                    isValid = false;
                }
            } else {
                const templateToUpdate = template.querySelector('.leftaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity('');
                    templateToUpdate.reportValidity();
                }
            }
        }
    }
    return isValid;
}

export function validateLeftHorizontalVerticalConditionValues(prescriptionDataValue, prescriptionFieldData, template, labels, lensType, inputBoxName) {
    let isValid = true;
    if (prescriptionDataValue['leftsphere'] != null) {
        if (
            isNaN(prescriptionDataValue['leftsphere']) ||
            prescriptionFieldData[0].B2B_Sphere_Min_Allowed__c > prescriptionDataValue['leftsphere'] ||
            prescriptionFieldData[0].B2B_Sphere_Max_Allowed__c < prescriptionDataValue['leftsphere']
        ) {
            const templateToUpdate = template.querySelector('.leftsphere9');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftsphere9');
        }
    } else {
        removeValidation(template, '.leftsphere9');
    }
    if (prescriptionDataValue['leftcylinder'] != null) {
        if (
            isNaN(prescriptionDataValue['leftcylinder']) ||
            prescriptionFieldData[0].B2B_Cylinder_Min_Allowed__c > prescriptionDataValue['leftcylinder'] ||
            prescriptionFieldData[0].B2B_Cylinder_Max_Allowed__c < prescriptionDataValue['leftcylinder']
        ) {
            const templateToUpdate = template.querySelector('.leftcylinder9');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftcylinder9');
        }
    } else {
        removeValidation(template, '.leftcylinder9');
    }
    if (prescriptionDataValue['leftaxis'] != null) {
        if (
            isNaN(prescriptionDataValue['leftaxis']) ||
            prescriptionFieldData[0].B2B_Axis_Min_Allowed__c > prescriptionDataValue['leftaxis'] ||
            prescriptionFieldData[0].B2B_Axis_Max_Allowed__c < prescriptionDataValue['leftaxis']
        ) {
            const templateToUpdate = template.querySelector('.leftaxis9');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftaxis9');
        }
    } else {
        removeValidation(template, '.leftaxis9');
    }
    if (prescriptionDataValue['leftprism1'] != null) {
        if (
            isNaN(prescriptionDataValue['leftprism1']) ||
            prescriptionFieldData[0].B2B_Prism_1_Min_Allowed__c > prescriptionDataValue['leftprism1'] ||
            prescriptionFieldData[0].B2B_Prism_1_Max_Allowed__c < prescriptionDataValue['leftprism1']
        ) {
            const templateToUpdate = template.querySelector('.leftprism1-9');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftprism1-9');
        }
    } else {
        removeValidation(template, '.leftprism1-9');
    }
    if (prescriptionDataValue['leftprism2'] != null) {
        if (
            isNaN(prescriptionDataValue['leftprism2']) ||
            prescriptionFieldData[0].B2B_Prism_2_Min_Allowed__c > prescriptionDataValue['leftprism2'] ||
            prescriptionFieldData[0].B2B_Prism_2_Max_Allowed__c < prescriptionDataValue['leftprism2']
        ) {
            const templateToUpdate = template.querySelector('.leftprism2-9');
            templateToUpdate.setCustomValidity(labels.message);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (isValid === true) {
            removeValidation(template, '.leftprism2-9');
        }
    } else {
        removeValidation(template, '.leftprism2-9');
    }
    if (prescriptionDataValue['rightaddition'] != null) {
        if (
            isNaN(prescriptionDataValue['rightaddition']) ||
            prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['rightaddition'] ||
            prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['rightaddition']
        ) {
            const templateToUpdate = template.querySelector('.rightaddition');
            if (templateToUpdate) {
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            }
        } else {
            const templateToUpdate = template.querySelector('.rightaddition');
            if (templateToUpdate) {
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    }
    //Added as a part of BS-1458
    /*
     * BS-1443
     * The check for inputBoxName are directly added rather moving them into constants as moving them to constant would take up more characters.
     */
    if (
        (lensType == PANORAMA_PROGRESSIVE || lensType == PANORAMA_PROGRESSIVE_ONE || lensType == PANORAMA_OFFICE) &&
        (inputBoxName == 'leftaddition' || inputBoxName == 'fromContainer')
    ) {
        if (prescriptionDataValue['leftaddition'] == undefined || prescriptionDataValue['leftaddition'] == null) {
            const templateToUpdate = template.querySelector('.leftaddition');
            templateToUpdate.setCustomValidity(labels.emptyAdditionErrorMessage);
            templateToUpdate.reportValidity();
            isValid = false;
        } else if (prescriptionDataValue['leftaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['leftaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
            ) {
                const templateToUpdate = template.querySelector('.leftaddition');
                templateToUpdate.setCustomValidity(labels.message);
                templateToUpdate.reportValidity();
                isValid = false;
            } else {
                const templateToUpdate = template.querySelector('.leftaddition');
                templateToUpdate.setCustomValidity('');
                templateToUpdate.reportValidity();
            }
        }
    } else {
        if (prescriptionDataValue['leftaddition'] != null) {
            if (
                isNaN(prescriptionDataValue['leftaddition']) ||
                prescriptionFieldData[0].B2B_Addition_Min_Allowed__c > prescriptionDataValue['leftaddition'] ||
                prescriptionFieldData[0].B2B_Addition_Max_Allowed__c < prescriptionDataValue['leftaddition']
            ) {
                const templateToUpdate = template.querySelector('.leftaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity(labels.message);
                    templateToUpdate.reportValidity();
                    isValid = false;
                }
            } else {
                const templateToUpdate = template.querySelector('.leftaddition');
                if (templateToUpdate) {
                    templateToUpdate.setCustomValidity('');
                    templateToUpdate.reportValidity();
                }
            }
        }
    }
    return isValid;
}

/**
 * This constant is used to set the attributes of the input fields when the eyeside is 'right lens'
 * and base value is 'Horizontal / Vertical'
 * BS-1054
 */
const setRightLensHorizontalVerticalInputFieldAttributes = (
    _globalSelectionArray,
    lensConfiguratorCollection,
    _prismBase1RightSelected,
    _prismBase2RightSelected,
    _prismBase1LeftSelected,
    _prismBase2LeftSelected,
    prismBase1Values,
    prismBase1LeftValues, //BS-1129
    prismBase2Values,
    lensTypeValue
) => {
    let parsedArray = JSON.parse(JSON.stringify(_globalSelectionArray));
    parsedArray.forEach((inputFieldObj) => {
        if (inputFieldObj.name == RIGHT_SPHERE) {
            inputFieldObj.inputClass = INPUT_RIGHT_SPHERE_7;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_CYLINDER) {
            inputFieldObj.inputClass = INPUT_RIGHT_CYLINDER_7;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 1; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_AXIS) {
            inputFieldObj.inputClass = INPUT_RIGHT_AXIS_7;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 2; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_ADDITION) {
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = INPUT_BORDER;
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = INPUT_BORDER;
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1;
                if (inputFieldObj.value == null) {
                    inputFieldObj.value = lensConfiguratorCollection.relaxVersion;
                }
            } else {
                inputFieldObj.tdClass = INPUT_CELL;
                inputFieldObj.inputClass = INPUT_BORDER_RIGHT_ADDITION;
                inputFieldObj.readOnly = false;
                inputFieldObj.tabIndex = 3; //BS-1412
            }
        }
        if (inputFieldObj.name == RIGHT_PRISM1) {
            inputFieldObj.inputClass = INPUT_RIGHT_PRISM1_7;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 4; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_PRISMBASE1) {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.inputClass = INPUT_RIGHT_PRISM_BASE1_4;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.tabIndex = 5; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_PRISMBASE1_RADIO) {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = true;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = TYPE_RADIO;
            inputFieldObj.tdClass = INPUT_CELL_RADIO_WIDTH;
            inputFieldObj.inputClass = INPUT_VALIDATE_BLACK_COLOR;
            inputFieldObj.variant = LABEL_HIDDEN;
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.value = _prismBase1RightSelected;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.disabled = false;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_PRISM2) {
            inputFieldObj.inputClass = INPUT_RIGHT_PRISM2_7;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 6; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_PRISMBASE2) {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.inputClass = INPUT_RIGHT_PRISM_BASE2_4;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = 7; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_PRISMBASE2_RADIO) {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = true;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = TYPE_RADIO;
            inputFieldObj.tdClass = INPUT_CELL_RADIO_WIDTH;
            inputFieldObj.inputClass = INPUT_VALIDATE_BLACK_COLOR;
            inputFieldObj.variant = LABEL_HIDDEN;
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.value = _prismBase2RightSelected;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.disabled = false;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
        if (inputFieldObj.name == LEFT_SPHERE) {
            inputFieldObj.inputClass = INPUT_BORDER;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == LEFT_CYLINDER) {
            inputFieldObj.inputClass = INPUT_BORDER;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == LEFT_AXIS) {
            inputFieldObj.inputClass = INPUT_BORDER;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == LEFT_ADDITION) {
            inputFieldObj.inputClass = INPUT_BORDER_LEFT_ADDITION;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
            if (lensTypeValue == PANORAMA_RELAX) {
                inputFieldObj.value = null;
            }
        }
        if (inputFieldObj.name == LEFT_PRISM1) {
            inputFieldObj.inputClass = INPUT_BORDER;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == LEFT_PRISMBASE1) {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.inputClass = INPUT_LEFT_PRISM_BASE1_5;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase1LeftValues; //BS-1129
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == LEFT_PRISMBASE1_RADIO) {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = true;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = TYPE_RADIO;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED_RADIO_WIDTH;
            inputFieldObj.inputClass = INPUT_BLACK_COLOR;
            inputFieldObj.variant = LABEL_HIDDEN;
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase1LeftValues; //BS-1129
            inputFieldObj.disabled = true;
        }
        if (inputFieldObj.name == LEFT_PRISM2) {
            inputFieldObj.inputClass = INPUT_BORDER;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == LEFT_PRISMBASE2) {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.inputClass = INPUT_BORDER;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == LEFT_PRISMBASE2_RADIO) {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = true;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = TYPE_RADIO;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED_RADIO_WIDTH;
            inputFieldObj.inputClass = INPUT_BLACK_COLOR;
            inputFieldObj.variant = LABEL_HIDDEN;
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.disabled = true;
            inputFieldObj.value = null;
        }
    });
    return parsedArray;
};

/**
 * This constant is used to set the attributes of the input fields when the eyeside is 'left lens'
 * and base value is 'Horizontal / Vertical'
 * BS-1054
 */
const setLeftLensHorizontalVerticalInputFieldAttributes = (
    _globalSelectionArray,
    lensConfiguratorCollection,
    _prismBase1RightSelected,
    _prismBase2RightSelected,
    _prismBase1LeftSelected,
    _prismBase2LeftSelected,
    prismBase1Values,
    prismBase1LeftValues, //BS-1129
    prismBase2Values,
    lensTypeValue
) => {
    let parsedArray = JSON.parse(JSON.stringify(_globalSelectionArray));
    parsedArray.forEach((inputFieldObj) => {
        if (inputFieldObj.name == RIGHT_SPHERE) {
            inputFieldObj.inputClass = INPUT_BORDER;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_CYLINDER) {
            inputFieldObj.inputClass = INPUT_BORDER;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_AXIS) {
            inputFieldObj.inputClass = INPUT_BORDER;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_ADDITION) {
            inputFieldObj.inputClass = INPUT_BORDER_RIGHT_ADDITION;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
            if (lensTypeValue == PANORAMA_RELAX) {
                inputFieldObj.value = null;
            }
        }
        if (inputFieldObj.name == RIGHT_PRISM1) {
            inputFieldObj.inputClass = INPUT_BORDER;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_PRISMBASE1) {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.inputClass = INPUT_BORDER;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_PRISMBASE1_RADIO) {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = true;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = TYPE_RADIO;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED_RADIO_WIDTH;
            inputFieldObj.inputClass = INPUT_BLACK_COLOR;
            inputFieldObj.variant = LABEL_HIDDEN;
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.disabled = true;
        }
        if (inputFieldObj.name == RIGHT_PRISM2) {
            inputFieldObj.inputClass = INPUT_BORDER;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_PRISMBASE2) {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.inputClass = INPUT_BORDER;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_PRISMBASE2_RADIO) {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = true;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = TYPE_RADIO;
            inputFieldObj.tdClass = INPUT_CELL_DISABLED_RADIO_WIDTH;
            inputFieldObj.inputClass = INPUT_BLACK_COLOR;
            inputFieldObj.variant = LABEL_HIDDEN;
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.disabled = true;
        }
        if (inputFieldObj.name == LEFT_SPHERE) {
            inputFieldObj.inputClass = INPUT_LEFT_SPHERE_9;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 8; //BS-1412
        }
        if (inputFieldObj.name == LEFT_CYLINDER) {
            inputFieldObj.inputClass = INPUT_LEFT_CYLINDER_9;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 9; //BS-1412
        }
        if (inputFieldObj.name == LEFT_AXIS) {
            inputFieldObj.inputClass = INPUT_LEFT_AXIS_9;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 10; //BS-1412
        }
        if (inputFieldObj.name == LEFT_ADDITION) {
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = INPUT_BORDER_LEFT_ADDITION;
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = INPUT_BORDER_LEFT_ADDITION;
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1;
                if (inputFieldObj.value == null) {
                    inputFieldObj.value = lensConfiguratorCollection.relaxVersion;
                }
            } else {
                inputFieldObj.tdClass = INPUT_CELL;
                inputFieldObj.inputClass = INPUT_BORDER_LEFT_ADDITION;
                inputFieldObj.readOnly = false;
                inputFieldObj.tabIndex = 11; //BS-1412
            }
        }
        if (inputFieldObj.name == LEFT_PRISM1) {
            inputFieldObj.inputClass = INPUT_LEFT_PRISM1_9;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 12; //BS-1412
        }
        if (inputFieldObj.name == LEFT_PRISMBASE1) {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.inputClass = INPUT_LEFT_PRISM_BASE1_8;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase1LeftValues; //BS-1129
            inputFieldObj.tabIndex = 13; //BS-1412
        }
        if (inputFieldObj.name == LEFT_PRISMBASE1_RADIO) {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = true;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = TYPE_RADIO;
            inputFieldObj.tdClass = INPUT_CELL_RADIO_WIDTH;
            inputFieldObj.inputClass = INPUT_BLACK_COLOR;
            inputFieldObj.variant = LABEL_HIDDEN;
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.value = _prismBase1LeftSelected;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase1LeftValues; //BS-1129
            inputFieldObj.disabled = false;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
        if (inputFieldObj.name == LEFT_PRISM2) {
            inputFieldObj.inputClass = INPUT_LEFT_PRISM2_9;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 14; //BS-1412
        }
        if (inputFieldObj.name == LEFT_PRISMBASE2) {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.inputClass = INPUT_LEFT_BASE2_8;
            inputFieldObj.tdClass = INPUT_CELL;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = 15; //BS-1412
        }
        if (inputFieldObj.name == LEFT_PRISMBASE2_RADIO) {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = true;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = TYPE_RADIO;
            inputFieldObj.tdClass = INPUT_CELL_RADIO_WIDTH;
            inputFieldObj.inputClass = INPUT_BLACK_COLOR;
            inputFieldObj.variant = LABEL_HIDDEN;
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.value = _prismBase2LeftSelected;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.disabled = false;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
    });
    return parsedArray;
};

export {
    decimalAppendedPrescriptionValues,
    setLeftLensHorizontalVerticalInputFieldAttributes, //BS-1412
    setRightLensHorizontalVerticalInputFieldAttributes //BS-1412
};
