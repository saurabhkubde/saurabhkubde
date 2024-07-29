import { LightningElement } from 'lwc';
import resetLensConfiguratorDataExceptPrescription from '@salesforce/apex/B2B_VisionSensation_RX_Controller.resetLensConfiguratorDataExceptPrescription';

const FIELDS_NOT_TO_RESET = ['lensConfiguratorID', 'accountId', 'customerName', 'clerk', 'baseValue', 'eyeSide', 'status', 'applicableBrand'];
const RIGHT_ADDITION = 'rightaddition';
const LEFT_ADDITION = 'leftaddition';
const PAGE_SOURCE_VS = 'VS'; //BS-655
const PAGE_SOURCE_RX = 'RX'; //BS-655
const LOCAL_LENS_CONFIGURATOR_DATA_KEY_VS = 'lensConfiguratorCollectionVS'; //BS-1213
const LOCAL_LENS_CONFIGURATOR_DATA_KEY_RX = 'lensConfiguratorCollectionRX'; //BS-1213
const INPUT_CELL_DISABLED = 'input-cell disabled'; //BS-968
const PANORAMA_SINGLE_VISION = 'Panorama Single Vision'; //BS-968
const PANORAMA_RELAX = 'Panorama Relax'; //BS-2291
const RIGHT_AND_LEFT_LENS_SIDE = 'right and left lens side';
const RIGHT_LENS = 'Right lens';
const LEFT_LENS = 'Left lens';
/**
 * This constant is used to handle the enabling and disabling of the input fields depending on the selection of
 * eye-side and base value on load of the page.
 * BS-1054
 */
const setOnloadInputFieldAttributes = (
    inputFieldsNameList,
    lensConfiguratorCollection,
    _prismBase1RightSelected,
    _prismBase2RightSelected,
    _prismBase1LeftSelected,
    _prismBase2LeftSelected,
    prismBase1Values,
    prismBase1LeftValues,
    prismBase2Values,
    lensTypeValue
) => {
    let _globalSelectionArray = [];
    inputFieldsNameList.forEach((inputName) => {
        let inputFieldObj = {};
        if (inputName == 'rightsphere') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.inputClass = 'input-border rightsphere1';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value = lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.rightsphere : null;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
        if (inputName == 'rightcylinder') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.inputClass = 'input-border rightcylinder1';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value =
                lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.rightcylinder : null;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = 1; //BS-1412
        }
        if (inputName == 'rightaxis') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.inputClass = 'input-border rightaxis1';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value = lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.rightaxis : null;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = 2; //BS-1412
        }
        if (inputName == RIGHT_ADDITION) {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.value = null;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                //BS-2291
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.value =
                    lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.relaxVersion : null;
                inputFieldObj.tabIndex = -1;
            } else {
                inputFieldObj.tdClass = 'input-cell';
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = false;
                inputFieldObj.value =
                    lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.rightaddition : null;
                inputFieldObj.tabIndex = 3; //BS-1412
            }
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.options = null;
        }
        if (inputName == 'rightprism1') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value = lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.rightprism1 : null;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputName == 'rightprismbase1') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value =
                lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.rightprismbase1 : null;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputName == 'rightprismbase1radio') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = 'radio';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value = null;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.disabled = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputName == 'rightprism2') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value = lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.rightprism2 : null;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputName == 'rightprismbase2') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value =
                lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.rightprismbase2 : null;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputName == 'rightprismbase2radio') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = 'radio';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value = null;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.disabled = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputName == 'leftsphere') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.inputClass = 'input-border leftsphere1';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value = lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.leftsphere : null;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = 8; //BS-1412
        }
        if (inputName == 'leftcylinder') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.inputClass = 'input-border leftcylinder1';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value =
                lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.leftcylinder : null;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = 9; //BS-1412
        }
        if (inputName == 'leftaxis') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.inputClass = 'input-border leftaxis1';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value = lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.leftaxis : null;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = 10; //BS-1412
        }
        if (inputName == LEFT_ADDITION) {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.value = null;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                //BS-2291
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.value =
                    lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.relaxVersion : null;
                inputFieldObj.tabIndex = -1;
            } else {
                inputFieldObj.tdClass = 'input-cell';
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = false;
                inputFieldObj.value =
                    lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.leftaddition : null;
                inputFieldObj.tabIndex = 11; //BS-1412
            }
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.options = null;
        }
        if (inputName == 'leftprism1') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value = lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.leftprism1 : null;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputName == 'leftprismbase1') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value =
                lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.leftprismbase1 : null;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1LeftValues;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputName == 'leftprismbase1radio') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = 'radio';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value = null;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1LeftValues;
            inputFieldObj.disabled = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputName == 'leftprism2') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value = lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.leftprism2 : null;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputName == 'leftprismbase2') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value =
                lensConfiguratorCollection != null || lensConfiguratorCollection != undefined ? lensConfiguratorCollection.leftprismbase2 : null;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputName == 'leftprismbase2radio') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = 'radio';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputName;
            inputFieldObj.value = null;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.disabled = false;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        _globalSelectionArray.push(inputFieldObj);
    });

    return _globalSelectionArray;
};

/**
 * This constant is used to set the attributes of the input fields when the eyeside is 'right and left lens side'
 * and base value is 'No Prism'
 * BS-1054
 */
const setDefaultInputFieldAttributes = (
    _globalSelectionArray,
    lensConfiguratorCollection,
    _prismBase1RightSelected,
    _prismBase2RightSelected,
    _prismBase1LeftSelected,
    _prismBase2LeftSelected,
    prismBase1Values,
    prismBase1LeftValues,
    prismBase2Values,
    lensTypeValue
) => {
    let parsedArray = JSON.parse(JSON.stringify(_globalSelectionArray));
    parsedArray.forEach((inputFieldObj) => {
        if (inputFieldObj.name == 'rightsphere') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.inputClass = 'input-border rightsphere1';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
        if (inputFieldObj.name == 'rightcylinder') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.inputClass = 'input-border rightcylinder1';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = 1; //BS-1412
        }
        if (inputFieldObj.name == 'rightaxis') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.inputClass = 'input-border rightaxis1';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = 2; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_ADDITION) {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                //BS-2291
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1;
                if (inputFieldObj.value == null) {
                    inputFieldObj.value = lensConfiguratorCollection.relaxVersion;
                }
            } else {
                inputFieldObj.tdClass = 'input-cell';
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = false;
                inputFieldObj.tabIndex = 3; //BS-1412
            }
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.options = null;
        }
        if (inputFieldObj.name == 'rightprism1') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1radio') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = 'radio';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.disabled = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprism2') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2radio') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = 'radio';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.disabled = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftsphere') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.inputClass = 'input-border leftsphere1';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = 8; //BS-1412
        }
        if (inputFieldObj.name == 'leftcylinder') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.inputClass = 'input-border leftcylinder1';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = 9; //BS-1412
        }
        if (inputFieldObj.name == 'leftaxis') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.inputClass = 'input-border leftaxis1';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = 10; //BS-1412
        }
        if (inputFieldObj.name == LEFT_ADDITION) {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                //BS-2291
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1;
                if (inputFieldObj.value == null) {
                    inputFieldObj.value = lensConfiguratorCollection.relaxVersion;
                }
            } else {
                inputFieldObj.tdClass = 'input-cell';
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = false;
                inputFieldObj.tabIndex = 11; //BS-1412
            }
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.options = null;
        }
        if (inputFieldObj.name == 'leftprism1') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1LeftValues;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1radio') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = 'radio';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1LeftValues;
            inputFieldObj.disabled = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprism2') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = null;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.type = 'text';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2radio') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = 'radio';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.disabled = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
    });
    return parsedArray;
};

/**
 * This constant is used to set the attributes of the input fields when the eyeside is 'right lens'
 * and base value is 'No Prism'
 * BS-1054
 */
const setRightLensNoPrismInputFieldAttributes = (
    _globalSelectionArray,
    lensConfiguratorCollection,
    _prismBase1RightSelected,
    _prismBase2RightSelected,
    _prismBase1LeftSelected,
    _prismBase2LeftSelected,
    prismBase1Values,
    prismBase1LeftValues,
    prismBase2Values,
    lensTypeValue
) => {
    let parsedArray = JSON.parse(JSON.stringify(_globalSelectionArray));
    parsedArray.forEach((inputFieldObj) => {
        if (inputFieldObj.name == 'rightsphere') {
            inputFieldObj.inputClass = 'input-border rightsphere2';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
        if (inputFieldObj.name == 'rightcylinder') {
            inputFieldObj.inputClass = 'input-border rightcylinder2';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 1; //BS-1412
        }
        if (inputFieldObj.name == 'rightaxis') {
            inputFieldObj.inputClass = 'input-border rightaxis2';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 2; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_ADDITION) {
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                //BS-2291
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1;
                if (inputFieldObj.value == null) {
                    inputFieldObj.value = lensConfiguratorCollection.relaxVersion;
                }
            } else {
                inputFieldObj.tdClass = 'input-cell';
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = false;
                inputFieldObj.tabIndex = 3; //BS-1412
            }
        }
        if (inputFieldObj.name == 'rightprism1') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase1Values;
        }
        if (inputFieldObj.name == 'rightprism2') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase2Values;
        }
        if (inputFieldObj.name == 'leftsphere') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftcylinder') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftaxis') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == LEFT_ADDITION) {
            inputFieldObj.inputClass = 'input-border leftaddition';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
            if (lensTypeValue == PANORAMA_RELAX) {
                inputFieldObj.value = null;
            }
        }
        if (inputFieldObj.name == 'leftprism1') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1LeftValues;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase1LeftValues;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprism2') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
    });
    return parsedArray;
};

/**
 * This constant is used to set the attributes of the input fields when the eyeside is 'left lens'
 * and base value is 'No Prism'
 * BS-1054
 */
const setLeftLensNoPrismInputFieldAttributes = (
    _globalSelectionArray,
    lensConfiguratorCollection,
    _prismBase1RightSelected,
    _prismBase2RightSelected,
    _prismBase1LeftSelected,
    _prismBase2LeftSelected,
    prismBase1Values,
    prismBase1LeftValues,
    prismBase2Values,
    lensTypeValue
) => {
    let parsedArray = JSON.parse(JSON.stringify(_globalSelectionArray));
    parsedArray.forEach((inputFieldObj) => {
        if (inputFieldObj.name == 'rightsphere') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightcylinder') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightaxis') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_ADDITION) {
            inputFieldObj.inputClass = 'input-border rightaddition';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
            if (lensTypeValue == PANORAMA_RELAX) {
                inputFieldObj.value = null;
            }
        }
        if (inputFieldObj.name == 'rightprism1') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase1Values;
        }
        if (inputFieldObj.name == 'rightprism2') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase2Values;
        }
        if (inputFieldObj.name == 'leftsphere') {
            inputFieldObj.inputClass = 'input-border leftsphere3';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 8; //BS-1412
        }
        if (inputFieldObj.name == 'leftcylinder') {
            inputFieldObj.inputClass = 'input-border leftcylinder3';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 9; //BS-1412
        }
        if (inputFieldObj.name == 'leftaxis') {
            inputFieldObj.inputClass = 'input-border leftaxis3';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 10; //BS-1412
        }
        if (inputFieldObj.name == LEFT_ADDITION) {
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                //BS-2291
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = 0;
                if (inputFieldObj.value == null) {
                    inputFieldObj.value = lensConfiguratorCollection.relaxVersion;
                }
            } else {
                inputFieldObj.tdClass = 'input-cell';
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = false;
                inputFieldObj.tabIndex = 11; //BS-1412
            }
        }
        if (inputFieldObj.name == 'leftprism1') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1LeftValues;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase1LeftValues;
        }
        if (inputFieldObj.name == 'leftprism2') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase2Values;
        }
    });
    return parsedArray;
};

/**
 * This constant is used to set the attributes of the input fields when the eyeside is 'right and left lens side'
 * and base value is 'In Degrees'
 * BS-1054
 */
const setRightLeftLensInDegreesInputFieldAttributes = (
    _globalSelectionArray,
    _prescriptionData,
    lensConfiguratorCollection,
    _prismBase1RightSelected,
    _prismBase2RightSelected,
    _prismBase1LeftSelected,
    _prismBase2LeftSelected,
    prismBase1Values,
    prismBase1LeftValues,
    prismBase2Values,
    lensTypeValue
) => {
    let parsedArray = JSON.parse(JSON.stringify(_globalSelectionArray));
    parsedArray.forEach((inputFieldObj) => {
        if (inputFieldObj.name == 'rightsphere') {
            inputFieldObj.inputClass = 'input-border rightsphere4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
        if (inputFieldObj.name == 'rightcylinder') {
            inputFieldObj.inputClass = 'input-border rightcylinder4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 1; //BS-1412
        }
        if (inputFieldObj.name == 'rightaxis') {
            inputFieldObj.inputClass = 'input-border rightaxis4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 2; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_ADDITION) {
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                //BS-2291
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = 0;
                if (inputFieldObj.value == null) {
                    inputFieldObj.value = lensConfiguratorCollection.relaxVersion;
                }
            } else {
                inputFieldObj.tdClass = 'input-cell';
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = false;
                inputFieldObj.tabIndex = 3; //BS-1412
            }
        }
        if (inputFieldObj.name == 'rightprism1') {
            inputFieldObj.inputClass = 'input-border rightprism1-4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 4; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border rightprismbase1-4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            if (_prescriptionData['rightprismbase1'] != undefined) {
                inputFieldObj.value = _prescriptionData['rightprismbase1'];
            }
            inputFieldObj.tabIndex = 5; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase1Values;
        }
        if (inputFieldObj.name == 'rightprism2') {
            inputFieldObj.inputClass = 'input-border rightprism2-4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 6; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border rightprismbase2-4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            if (_prescriptionData['rightprismbase2'] != undefined) {
                inputFieldObj.value = _prescriptionData['rightprismbase2'];
            }
            inputFieldObj.tabIndex = 7; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase2Values;
        }
        if (inputFieldObj.name == 'leftsphere') {
            inputFieldObj.inputClass = 'input-border leftsphere4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 8; //BS-1412
        }
        if (inputFieldObj.name == 'leftcylinder') {
            inputFieldObj.inputClass = 'input-border leftcylinder4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 9; //BS-1412
        }
        if (inputFieldObj.name == 'leftaxis') {
            inputFieldObj.inputClass = 'input-border leftaxis4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 10; //BS-1412
        }
        if (inputFieldObj.name == LEFT_ADDITION) {
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                //BS-2291
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = 0;
                if (inputFieldObj.value == null) {
                    inputFieldObj.value = lensConfiguratorCollection.relaxVersion;
                }
            } else {
                inputFieldObj.tdClass = 'input-cell';
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = false;
                inputFieldObj.tabIndex = 11; //BS-1412
            }
        }
        if (inputFieldObj.name == 'leftprism1') {
            inputFieldObj.inputClass = 'input-border leftprism1-4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 12; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.options = prismBase1LeftValues;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border leftprismbase1-4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            if (_prescriptionData['leftprismbase1'] != undefined) {
                inputFieldObj.value = _prescriptionData['leftprismbase1'];
            }
            inputFieldObj.tabIndex = 13; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase1LeftValues;
        }
        if (inputFieldObj.name == 'leftprism2') {
            inputFieldObj.inputClass = 'input-border leftprism2-4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 14; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border leftprismbase2-4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            if (_prescriptionData['leftprismbase2'] != undefined) {
                inputFieldObj.value = _prescriptionData['leftprismbase2'];
            }
            inputFieldObj.tabIndex = 15; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase2Values;
        }
    });
    return parsedArray;
};

/**
 * This conatnt is used to set the attributes of the input fields when the eyeside is 'right lens'
 * and base value is 'In Degrees'
 * BS-1054
 */
const setRightLensInDegreesInputFieldAttributes = (
    _globalSelectionArray,
    _prescriptionData,
    lensConfiguratorCollection,
    _prismBase1RightSelected,
    _prismBase2RightSelected,
    _prismBase1LeftSelected,
    _prismBase2LeftSelected,
    prismBase1Values,
    prismBase1LeftValues,
    prismBase2Values,
    lensTypeValue
) => {
    let parsedArray = JSON.parse(JSON.stringify(_globalSelectionArray));
    parsedArray.forEach((inputFieldObj) => {
        if (inputFieldObj.name == 'rightsphere') {
            inputFieldObj.inputClass = 'input-border rightsphere6';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
        if (inputFieldObj.name == 'rightcylinder') {
            inputFieldObj.inputClass = 'input-border rightcylinder6';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 1; //BS-1412
        }
        if (inputFieldObj.name == 'rightaxis') {
            inputFieldObj.inputClass = 'input-border rightaxis6';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 2; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_ADDITION) {
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                //BS-2291
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = 0;
                if (inputFieldObj.value == null) {
                    inputFieldObj.value = lensConfiguratorCollection.relaxVersion;
                }
            } else {
                inputFieldObj.tdClass = 'input-cell';
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = false;
                inputFieldObj.tabIndex = 3; //BS-1412
            }
        }
        if (inputFieldObj.name == 'rightprism1') {
            inputFieldObj.inputClass = 'input-border rightprism1-6';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 4; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border rightprismbase1-6';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            if (_prescriptionData['rightprismbase1'] != undefined) {
                inputFieldObj.value = _prescriptionData['rightprismbase1'];
            }
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.tabIndex = 5; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            //   inputFieldObj.value = null;
            inputFieldObj.options = prismBase1Values;
        }
        if (inputFieldObj.name == 'rightprism2') {
            inputFieldObj.inputClass = 'input-border rightprism2-6';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 6; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border rightprismbase2-6';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            if (_prescriptionData['rightprismbase2'] != undefined) {
                inputFieldObj.value = _prescriptionData['rightprismbase2'];
            }
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = 7; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase2Values;
        }
        if (inputFieldObj.name == 'leftsphere') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftcylinder') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftaxis') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == LEFT_ADDITION) {
            inputFieldObj.inputClass = 'input-border leftaddition';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
            if (lensTypeValue == PANORAMA_RELAX) {
                inputFieldObj.value = null;
            }
        }
        if (inputFieldObj.name == 'leftprism1') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1LeftValues;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase1LeftValues;
        }
        if (inputFieldObj.name == 'leftprism2') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase2Values;
        }
    });
    return parsedArray;
};

/**
 * This constant is used to set the attributes of the input fields when the eyeside is 'left lens'
 * and base value is 'In Degrees'
 * BS-1054
 */
const setLeftLensInDegreesInputFieldAttributes = (
    _globalSelectionArray,
    _prescriptionData,
    lensConfiguratorCollection,
    _prismBase1RightSelected,
    _prismBase2RightSelected,
    _prismBase1LeftSelected,
    _prismBase2LeftSelected,
    prismBase1Values,
    prismBase1LeftValues,
    prismBase2Values,
    lensTypeValue
) => {
    let parsedArray = JSON.parse(JSON.stringify(_globalSelectionArray));
    parsedArray.forEach((inputFieldObj) => {
        if (inputFieldObj.name == 'rightsphere') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightcylinder') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightaxis') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_ADDITION) {
            inputFieldObj.inputClass = 'input-border rightaddition';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
            if (lensTypeValue == PANORAMA_RELAX) {
                inputFieldObj.value = null;
            }
        }
        if (inputFieldObj.name == 'rightprism1') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase1Values;
        }
        if (inputFieldObj.name == 'rightprism2') {
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border';
            inputFieldObj.tdClass = INPUT_CELL_DISABLED;
            inputFieldObj.readOnly = true;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = -1; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase2Values;
        }
        if (inputFieldObj.name == 'leftsphere') {
            inputFieldObj.inputClass = 'input-border leftsphere8';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 8; //BS-1412
        }
        if (inputFieldObj.name == 'leftcylinder') {
            inputFieldObj.inputClass = 'input-border leftcylinder8';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 9; //BS-1412
        }
        if (inputFieldObj.name == 'leftaxis') {
            inputFieldObj.inputClass = 'input-border leftaxis8';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 10; //BS-1412
        }
        if (inputFieldObj.name == LEFT_ADDITION) {
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                //BS-2291
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = 0;
                if (inputFieldObj.value == null) {
                    inputFieldObj.value = lensConfiguratorCollection.relaxVersion;
                }
            } else {
                inputFieldObj.tdClass = 'input-cell';
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = false;
                inputFieldObj.tabIndex = 11; //BS-1412
            }
        }
        if (inputFieldObj.name == 'leftprism1') {
            inputFieldObj.inputClass = 'input-border leftprism1-8';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 12; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border leftprismbase1-8';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            if (_prescriptionData['leftprismbase1'] != undefined) {
                inputFieldObj.value = _prescriptionData['leftprismbase1'];
            }
            inputFieldObj.options = prismBase1LeftValues;
            inputFieldObj.tabIndex = 13; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase1LeftValues;
        }
        if (inputFieldObj.name == 'leftprism2') {
            inputFieldObj.inputClass = 'input-border leftprism2-8';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 14; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = true;
            inputFieldObj.inputClass = 'input-border leftprismbase2-8';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            if (_prescriptionData['leftprismbase2'] != undefined) {
                inputFieldObj.value = _prescriptionData['leftprismbase2'];
            }
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = 15; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2radio') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.options = prismBase2Values;
        }
    });
    return parsedArray;
};

/**
 * This constant is used to set the attributes of the input fields when the eyeside is 'right and left lens side'
 * and base value is 'Horizontal / Vertical'
 * BS-1054
 */
const setRightLeftLensHorVertInputFieldAttributes = (
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
        if (inputFieldObj.name == 'rightsphere') {
            inputFieldObj.inputClass = 'input-border rightsphere5';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
        if (inputFieldObj.name == 'rightcylinder') {
            inputFieldObj.inputClass = 'input-border rightcylinder5';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 1; //BS-1412
        }
        if (inputFieldObj.name == 'rightaxis') {
            inputFieldObj.inputClass = 'input-border rightaxis5';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 2; //BS-1412
        }
        if (inputFieldObj.name == RIGHT_ADDITION) {
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                //BS-2291
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = 0;
                if (inputFieldObj.value == null) {
                    inputFieldObj.value = lensConfiguratorCollection.relaxVersion;
                }
            } else {
                inputFieldObj.tdClass = 'input-cell';
                inputFieldObj.inputClass = 'input-border rightaddition';
                inputFieldObj.readOnly = false;
                inputFieldObj.tabIndex = 3; //BS-1412
            }
        }
        if (inputFieldObj.name == 'rightprism1') {
            inputFieldObj.inputClass = 'input-border rightprism1-5';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 4; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.inputClass = 'input-border rightprismbase1-4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.tabIndex = 5; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase1radio') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = true;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = 'radio';
            inputFieldObj.tdClass = 'input-cell td-radio-width';
            inputFieldObj.inputClass = 'black-color';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.value = _prismBase1RightSelected;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase1Values;
            inputFieldObj.disabled = false;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
        if (inputFieldObj.name == 'rightprism2') {
            inputFieldObj.inputClass = 'input-border rightprism2-5';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 6; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.inputClass = 'input-border rightprismbase2-4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = 7; //BS-1412
        }
        if (inputFieldObj.name == 'rightprismbase2radio') {
            inputFieldObj.isRightEye = true;
            inputFieldObj.isLeftEye = false;
            inputFieldObj.isRadioType = true;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = 'radio';
            inputFieldObj.tdClass = 'input-cell td-radio-width';
            inputFieldObj.inputClass = 'black-color';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.value = _prismBase2RightSelected;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.disabled = false;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
        if (inputFieldObj.name == 'leftsphere') {
            inputFieldObj.inputClass = 'input-border leftsphere5';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 8; //BS-1412
        }
        if (inputFieldObj.name == 'leftcylinder') {
            inputFieldObj.inputClass = 'input-border leftcylinder5';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 9; //BS-1412
        }
        if (inputFieldObj.name == 'leftaxis') {
            inputFieldObj.inputClass = 'input-border leftaxis5';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 10; //BS-1412
        }
        if (inputFieldObj.name == LEFT_ADDITION) {
            if (lensTypeValue == PANORAMA_SINGLE_VISION) {
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = -1; //BS-1412
            } else if (lensTypeValue == PANORAMA_RELAX) {
                //BS-2291
                inputFieldObj.tdClass = INPUT_CELL_DISABLED;
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = true;
                inputFieldObj.tabIndex = 0;
                if (inputFieldObj.value == null) {
                    inputFieldObj.value = lensConfiguratorCollection.relaxVersion;
                }
            } else {
                inputFieldObj.tdClass = 'input-cell';
                inputFieldObj.inputClass = 'input-border leftaddition';
                inputFieldObj.readOnly = false;
                inputFieldObj.tabIndex = 11; //BS-1412
            }
        }
        if (inputFieldObj.name == 'leftprism1') {
            inputFieldObj.inputClass = 'input-border leftprism1-5';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 12; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.inputClass = 'input-border leftprismbase1-5';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase1LeftValues; //BS-1129
            inputFieldObj.tabIndex = 13; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase1radio') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = true;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = 'radio';
            inputFieldObj.tdClass = 'input-cell td-radio-width';
            inputFieldObj.inputClass = 'black-color';
            inputFieldObj.variant = 'label-hidden';
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.value = _prismBase1LeftSelected;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = JSON.parse(JSON.stringify(prismBase1LeftValues)); //BS-1129
            inputFieldObj.disabled = false;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
        if (inputFieldObj.name == 'leftprism2') {
            inputFieldObj.inputClass = 'input-border leftprism2-5';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.tabIndex = 14; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2') {
            inputFieldObj.isRadioType = false;
            inputFieldObj.isTextType = false;
            inputFieldObj.inputClass = 'input-border leftprismbase2-4';
            inputFieldObj.tdClass = 'input-cell';
            inputFieldObj.readOnly = false;
            inputFieldObj.options = prismBase2Values;
            inputFieldObj.tabIndex = 15; //BS-1412
        }
        if (inputFieldObj.name == 'leftprismbase2radio') {
            inputFieldObj.isRightEye = false;
            inputFieldObj.isLeftEye = true;
            inputFieldObj.isRadioType = true;
            inputFieldObj.isTextType = false;
            inputFieldObj.type = 'radio';
            inputFieldObj.tdClass = 'input-cell td-radio-width';
            inputFieldObj.inputClass = 'black-color';
            inputFieldObj.variant = 'label-hidden'; //BS-1129
            inputFieldObj.name = inputFieldObj.name;
            inputFieldObj.value = _prismBase2LeftSelected;
            inputFieldObj.readOnly = false;
            inputFieldObj.options = JSON.parse(JSON.stringify(prismBase2Values));
            inputFieldObj.disabled = false;
            inputFieldObj.tabIndex = 0; //BS-1412
        }
    });
    return parsedArray;
};

//BS-728
const handlePrescriptionValueUpdateIntoConfigurator = (event, lensConfiguratorCollection) => {
    //BS-1244 : Added Null Checks
    if (event != null && event != undefined && event.detail != null && event.detail != undefined) {
        //BS-1244
        if (
            event.detail.prescriptionSelectionCollection.prescriptionUpdated !== undefined &&
            event.detail.prescriptionSelectionCollection.prescriptionUpdated !== null
        ) {
            lensConfiguratorCollection.prescriptionUpdated = event.detail.prescriptionSelectionCollection.prescriptionUpdated;
        }
        //BS-1244

        if (event.detail.eyeSide !== undefined && event.detail.eyeSide !== null) {
            lensConfiguratorCollection.eyeSide = event.detail.eyeSide;
        }
        if (event.detail.baseValue !== undefined && event.detail.baseValue !== null) {
            lensConfiguratorCollection.baseValue = event.detail.baseValue;
        }
        if (event.detail.prescriptionSelectionCollection.rightsphere !== undefined && event.detail.prescriptionSelectionCollection.rightsphere !== null) {
            lensConfiguratorCollection.rightsphere = event.detail.prescriptionSelectionCollection.rightsphere;
        } else if (event.detail.prescriptionSelectionCollection.rightsphere == undefined && event.detail.prescriptionSelectionCollection.rightsphere == null) {
            lensConfiguratorCollection.rightsphere = null;
        }
        if (
            event.detail.prescriptionSelectionCollection.rightprismbase2radio !== undefined &&
            event.detail.prescriptionSelectionCollection.rightprismbase2radio !== null
        ) {
            lensConfiguratorCollection.rightprismbase2radio = event.detail.prescriptionSelectionCollection.rightprismbase2radio;
        } else if (
            event.detail.prescriptionSelectionCollection.rightprismbase2radio == undefined &&
            event.detail.prescriptionSelectionCollection.rightprismbase2radio == null
        ) {
            lensConfiguratorCollection.rightprismbase2radio = null;
        }
        if (event.detail.prescriptionSelectionCollection.rightprism2 !== undefined && event.detail.prescriptionSelectionCollection.rightprism2 !== null) {
            lensConfiguratorCollection.rightprism2 = event.detail.prescriptionSelectionCollection.rightprism2;
        } else if (event.detail.prescriptionSelectionCollection.rightprism2 == undefined && event.detail.prescriptionSelectionCollection.rightprism2 == null) {
            lensConfiguratorCollection.rightprism2 = null;
        }
        if (
            event.detail.prescriptionSelectionCollection.rightprismbase1radio !== undefined &&
            event.detail.prescriptionSelectionCollection.rightprismbase1radio !== null
        ) {
            lensConfiguratorCollection.rightprismbase1radio = event.detail.prescriptionSelectionCollection.rightprismbase1radio;
        } else if (
            event.detail.prescriptionSelectionCollection.rightprismbase1radio == undefined &&
            event.detail.prescriptionSelectionCollection.rightprismbase1radio == null
        ) {
            lensConfiguratorCollection.rightprismbase1radio = null;
        }
        if (event.detail.prescriptionSelectionCollection.rightprism1 !== undefined && event.detail.prescriptionSelectionCollection.rightprism1 !== null) {
            lensConfiguratorCollection.rightprism1 = event.detail.prescriptionSelectionCollection.rightprism1;
        } else if (event.detail.prescriptionSelectionCollection.rightprism1 == undefined && event.detail.prescriptionSelectionCollection.rightprism1 == null) {
            lensConfiguratorCollection.rightprism1 = null;
        }
        if (event.detail.prescriptionSelectionCollection.rightaxis !== undefined && event.detail.prescriptionSelectionCollection.rightaxis !== null) {
            lensConfiguratorCollection.rightaxis = event.detail.prescriptionSelectionCollection.rightaxis;
        } else if (event.detail.prescriptionSelectionCollection.rightaxis == undefined && event.detail.prescriptionSelectionCollection.rightaxis == null) {
            lensConfiguratorCollection.rightaxis = null;
        }
        if (event.detail.prescriptionSelectionCollection.rightaddition !== undefined && event.detail.prescriptionSelectionCollection.rightaddition !== null) {
            lensConfiguratorCollection.rightaddition = event.detail.prescriptionSelectionCollection.rightaddition;
        } else if (
            event.detail.prescriptionSelectionCollection.rightaddition == undefined &&
            event.detail.prescriptionSelectionCollection.rightaddition == null
        ) {
            if (
                lensConfiguratorCollection.relaxVersion != undefined &&
                lensConfiguratorCollection.relaxVersion != null &&
                lensConfiguratorCollection.lensType == PANORAMA_RELAX
            ) {
                if (lensConfiguratorCollection.eyeSide == RIGHT_AND_LEFT_LENS_SIDE || lensConfiguratorCollection.eyeSide == RIGHT_LENS) {
                    lensConfiguratorCollection.rightaddition = lensConfiguratorCollection.relaxVersion;
                } else {
                    lensConfiguratorCollection.rightaddition = null;
                }
            } else {
                lensConfiguratorCollection.rightaddition = null;
            }
        }
        if (event.detail.prescriptionSelectionCollection.rightcylinder !== undefined && event.detail.prescriptionSelectionCollection.rightcylinder !== null) {
            lensConfiguratorCollection.rightcylinder = event.detail.prescriptionSelectionCollection.rightcylinder;
        } else if (
            event.detail.prescriptionSelectionCollection.rightcylinder == undefined &&
            event.detail.prescriptionSelectionCollection.rightcylinder == null
        ) {
            lensConfiguratorCollection.rightcylinder = null;
        }
        if (event.detail.prescriptionSelectionCollection.leftsphere !== undefined && event.detail.prescriptionSelectionCollection.leftsphere !== null) {
            lensConfiguratorCollection.leftsphere = event.detail.prescriptionSelectionCollection.leftsphere;
        } else if (event.detail.prescriptionSelectionCollection.leftsphere == undefined && event.detail.prescriptionSelectionCollection.leftsphere == null) {
            lensConfiguratorCollection.leftsphere = null;
        }
        if (event.detail.prescriptionSelectionCollection.leftcylinder !== undefined && event.detail.prescriptionSelectionCollection.leftcylinder !== null) {
            lensConfiguratorCollection.leftcylinder = event.detail.prescriptionSelectionCollection.leftcylinder;
        } else if (
            event.detail.prescriptionSelectionCollection.leftcylinder == undefined &&
            event.detail.prescriptionSelectionCollection.leftcylinder == null
        ) {
            lensConfiguratorCollection.leftcylinder = null;
        }
        if (event.detail.prescriptionSelectionCollection.leftaxis !== undefined && event.detail.prescriptionSelectionCollection.leftaxis !== null) {
            lensConfiguratorCollection.leftaxis = event.detail.prescriptionSelectionCollection.leftaxis;
        } else if (event.detail.prescriptionSelectionCollection.leftaxis == undefined && event.detail.prescriptionSelectionCollection.leftaxis == null) {
            lensConfiguratorCollection.leftaxis = null;
        }
        if (event.detail.prescriptionSelectionCollection.leftaddition !== undefined && event.detail.prescriptionSelectionCollection.leftaddition !== null) {
            lensConfiguratorCollection.leftaddition = event.detail.prescriptionSelectionCollection.leftaddition;
        } else if (
            event.detail.prescriptionSelectionCollection.leftaddition == undefined &&
            event.detail.prescriptionSelectionCollection.leftaddition == null
        ) {
            if (
                lensConfiguratorCollection.relaxVersion != undefined &&
                lensConfiguratorCollection.relaxVersion != null &&
                lensConfiguratorCollection.lensType == PANORAMA_RELAX
            ) {
                if (lensConfiguratorCollection.eyeSide == RIGHT_AND_LEFT_LENS_SIDE || lensConfiguratorCollection.eyeSide == LEFT_LENS) {
                    lensConfiguratorCollection.leftaddition = lensConfiguratorCollection.relaxVersion;
                } else {
                    lensConfiguratorCollection.leftaddition = null;
                }
            } else {
                lensConfiguratorCollection.leftaddition = null;
            }
        }
        if (event.detail.prescriptionSelectionCollection.leftprism1 !== undefined && event.detail.prescriptionSelectionCollection.leftprism1 !== null) {
            lensConfiguratorCollection.leftprism1 = event.detail.prescriptionSelectionCollection.leftprism1;
        } else if (event.detail.prescriptionSelectionCollection.leftprism1 == undefined && event.detail.prescriptionSelectionCollection.leftprism1 == null) {
            lensConfiguratorCollection.leftprism1 = null;
        }
        if (
            event.detail.prescriptionSelectionCollection.leftprismbase1radio !== undefined &&
            event.detail.prescriptionSelectionCollection.leftprismbase1radio !== null
        ) {
            lensConfiguratorCollection.leftprismbase1radio = event.detail.prescriptionSelectionCollection.leftprismbase1radio;
        } else if (
            event.detail.prescriptionSelectionCollection.leftprismbase1radio == undefined &&
            event.detail.prescriptionSelectionCollection.leftprismbase1radio == null
        ) {
            lensConfiguratorCollection.leftprismbase1radio = null;
        }
        if (event.detail.prescriptionSelectionCollection.leftprism2 !== undefined && event.detail.prescriptionSelectionCollection.leftprism2 !== null) {
            lensConfiguratorCollection.leftprism2 = event.detail.prescriptionSelectionCollection.leftprism2;
        } else if (event.detail.prescriptionSelectionCollection.leftprism2 == undefined && event.detail.prescriptionSelectionCollection.leftprism2 == null) {
            lensConfiguratorCollection.leftprism2 = null;
        }
        if (
            event.detail.prescriptionSelectionCollection.leftprismbase2radio !== undefined &&
            event.detail.prescriptionSelectionCollection.leftprismbase2radio !== null
        ) {
            lensConfiguratorCollection.leftprismbase2radio = event.detail.prescriptionSelectionCollection.leftprismbase2radio;
        }
        if (
            event.detail.prescriptionSelectionCollection.leftprismbase2radio == undefined &&
            event.detail.prescriptionSelectionCollection.leftprismbase2radio == null
        ) {
            lensConfiguratorCollection.leftprismbase2radio = null;
        }
        if (event.detail.prescriptionSelectionCollection.leftprismbase2 !== undefined && event.detail.prescriptionSelectionCollection.leftprismbase2 !== null) {
            lensConfiguratorCollection.leftprismbase2 = event.detail.prescriptionSelectionCollection.leftprismbase2;
        } else if (
            event.detail.prescriptionSelectionCollection.leftprismbase2 == undefined &&
            event.detail.prescriptionSelectionCollection.leftprismbase2 == null
        ) {
            lensConfiguratorCollection.leftprismbase2 = null;
        }
        if (event.detail.prescriptionSelectionCollection.leftprismbase1 !== undefined && event.detail.prescriptionSelectionCollection.leftprismbase1 !== null) {
            lensConfiguratorCollection.leftprismbase1 = event.detail.prescriptionSelectionCollection.leftprismbase1;
        } else if (
            event.detail.prescriptionSelectionCollection.leftprismbase1 == undefined &&
            event.detail.prescriptionSelectionCollection.leftprismbase1 == null
        ) {
            lensConfiguratorCollection.leftprismbase1 = null;
        }
        if (
            event.detail.prescriptionSelectionCollection.rightprismbase2 !== undefined &&
            event.detail.prescriptionSelectionCollection.rightprismbase2 !== null
        ) {
            lensConfiguratorCollection.rightprismbase2 = event.detail.prescriptionSelectionCollection.rightprismbase2;
        } else if (
            event.detail.prescriptionSelectionCollection.rightprismbase2 == undefined &&
            event.detail.prescriptionSelectionCollection.rightprismbase2 == null
        ) {
            lensConfiguratorCollection.rightprismbase2 = null;
        }
        if (
            event.detail.prescriptionSelectionCollection.rightprismbase1 !== undefined &&
            event.detail.prescriptionSelectionCollection.rightprismbase1 !== null
        ) {
            lensConfiguratorCollection.rightprismbase1 = event.detail.prescriptionSelectionCollection.rightprismbase1;
        } else if (
            event.detail.prescriptionSelectionCollection.rightprismbase1 == undefined &&
            event.detail.prescriptionSelectionCollection.rightprismbase1 == null
        ) {
            lensConfiguratorCollection.rightprismbase1 = null;
        }
    }
    return lensConfiguratorCollection;
};

//BS-728
const handleCenteringDataUpdateIntoConfigurator = (event, lensConfiguratorCollection) => {
    //BS-1244 : Added Null Checks
    if (event != null && event != undefined && event.detail != null && event.detail != undefined) {
        //BS-1244
        if (event.detail.centeringSelectionCollection.centeringUpdated !== undefined && event.detail.centeringSelectionCollection.centeringUpdated !== null) {
            lensConfiguratorCollection.centeringUpdated = event.detail.centeringSelectionCollection.centeringUpdated;
        }
        //BS-1244
        if (
            event.detail.centeringSelectionCollection.pupilDistanceRightEye !== undefined &&
            event.detail.centeringSelectionCollection.pupilDistanceRightEye !== null
        ) {
            lensConfiguratorCollection.pupilDistanceRightEye = event.detail.centeringSelectionCollection.pupilDistanceRightEye;
        } else {
            //BS-1244 : Added null
            lensConfiguratorCollection.pupilDistanceRightEye = null;
        }
        if (
            event.detail.centeringSelectionCollection.pupilDistanceLeftEye !== undefined &&
            event.detail.centeringSelectionCollection.pupilDistanceLeftEye !== null
        ) {
            lensConfiguratorCollection.pupilDistanceLeftEye = event.detail.centeringSelectionCollection.pupilDistanceLeftEye;
        } else {
            lensConfiguratorCollection.pupilDistanceLeftEye = null;
        }
        if (
            event.detail.centeringSelectionCollection.fittingHeightRightEye !== undefined &&
            event.detail.centeringSelectionCollection.fittingHeightRightEye !== null
        ) {
            lensConfiguratorCollection.fittingHeightRightEye = event.detail.centeringSelectionCollection.fittingHeightRightEye;
        } else {
            lensConfiguratorCollection.fittingHeightRightEye = null;
        }
        if (
            event.detail.centeringSelectionCollection.fittingHeightLeftEye !== undefined &&
            event.detail.centeringSelectionCollection.fittingHeightLeftEye !== null
        ) {
            lensConfiguratorCollection.fittingHeightLeftEye = event.detail.centeringSelectionCollection.fittingHeightLeftEye;
        } else {
            lensConfiguratorCollection.fittingHeightLeftEye = null;
        }
        if (event.detail.centeringSelectionCollection.pantascopicTilt !== undefined && event.detail.centeringSelectionCollection.pantascopicTilt !== null) {
            lensConfiguratorCollection.pantascopicTilt = event.detail.centeringSelectionCollection.pantascopicTilt;
        } else {
            lensConfiguratorCollection.pantascopicTilt = null;
        }
        if (event.detail.centeringSelectionCollection.bvdWorn !== undefined && event.detail.centeringSelectionCollection.bvdWorn !== null) {
            lensConfiguratorCollection.bvdWorn = event.detail.centeringSelectionCollection.bvdWorn;
        } else {
            lensConfiguratorCollection.bvdWorn = null;
        }
        if (event.detail.centeringSelectionCollection.bvdReffracted !== undefined && event.detail.centeringSelectionCollection.bvdReffracted !== null) {
            lensConfiguratorCollection.bvdReffracted = event.detail.centeringSelectionCollection.bvdReffracted;
        } else {
            lensConfiguratorCollection.bvdReffracted = null;
        }
        if (event.detail.centeringSelectionCollection.radioValue !== undefined && event.detail.centeringSelectionCollection.radioValue !== null) {
            lensConfiguratorCollection.radioValue = event.detail.centeringSelectionCollection.radioValue;
        } else {
            lensConfiguratorCollection.radioValue = null;
        }

        //BS-1117 : Extracting Working Distance field from recieved centering data collection and adding it to lens configurator collection
        if (event.detail.centeringSelectionCollection.workingDistance !== undefined && event.detail.centeringSelectionCollection.workingDistance !== null) {
            lensConfiguratorCollection.workingDistance = event.detail.centeringSelectionCollection.workingDistance;
        }
        //BS-1117 : End
        if (
            event.detail.centeringSelectionCollection.isCheckedAdapterAgreement !== undefined &&
            event.detail.centeringSelectionCollection.isCheckedAdapterAgreement !== null
        ) {
            lensConfiguratorCollection.isCheckedAdapterAgreement = event.detail.centeringSelectionCollection.isCheckedAdapterAgreement;
        }
        if (
            event.detail.centeringSelectionCollection.isCheckedDirectGlazingAgreement !== undefined &&
            event.detail.centeringSelectionCollection.isCheckedDirectGlazingAgreement !== null
        ) {
            lensConfiguratorCollection.isCheckedDirectGlazingAgreement = event.detail.centeringSelectionCollection.isCheckedDirectGlazingAgreement;
        }
    }
    return lensConfiguratorCollection;
};

/**
 * BS-1213
 * This method returns the updated lens configurator with rx solution data
 */
const handleRxSolutionDataUpdateIntoConfigurator = (event, lensConfiguratorCollection, pageSource) => {
    if (lensConfiguratorCollection != null && lensConfiguratorCollection != undefined) {
        if (event.detail.B2B_RX_Solution__c != undefined && event.detail.B2B_RX_Solution__c != null) {
            if (lensConfiguratorCollection.selectedRXSolution != event.detail.B2B_RX_Solution__c) {
                lensConfiguratorCollection.lensType = null;
                lensConfiguratorCollection.lensColor = null;
                lensConfiguratorCollection.lensIndex = null;
                lensConfiguratorCollection.antireflectionSKU = null;
                lensConfiguratorCollection.productMaterial = null;
                lensConfiguratorCollection.withEvilEyeEdge = false;
                lensConfiguratorCollection.isCheckedAdapterAgreement = false; //BS-1065
                lensConfiguratorCollection.isCheckedDirectGlazingAgreement = false; //BS-1065

                //Setting up product data into local storage as soon as updated (BS-788)
                lensConfiguratorCollection = JSON.parse(JSON.stringify(lensConfiguratorCollection));
                let encodedFormattedCollection = btoa(unescape(encodeURIComponent(JSON.stringify(lensConfiguratorCollection))));

                if (pageSource != null && pageSource != undefined && pageSource == PAGE_SOURCE_VS) {
                    localStorage.setItem(LOCAL_LENS_CONFIGURATOR_DATA_KEY_VS, encodedFormattedCollection);
                } else if (pageSource != null && pageSource != undefined && pageSource == PAGE_SOURCE_RX) {
                    localStorage.setItem(LOCAL_LENS_CONFIGURATOR_DATA_KEY_RX, encodedFormattedCollection);
                }
            } //end if
        } //end middle if
    } //end outer if

    lensConfiguratorCollection.selectedRXSolution =
        event.detail.B2B_RX_Solution__c !== undefined && event.detail.B2B_RX_Solution__c !== null ? event.detail.B2B_RX_Solution__c : null;

    lensConfiguratorCollection.rxType = event.detail.B2B_RX_Type__c !== undefined && event.detail.B2B_RX_Type__c !== null ? event.detail.B2B_RX_Type__c : null;
    lensConfiguratorCollection.selectedRXSolutionSKU =
        event.detail.B2B_Selected_RX_Solution_SKU__c !== undefined && event.detail.B2B_Selected_RX_Solution_SKU__c !== null
            ? event.detail.B2B_Selected_RX_Solution_SKU__c
            : null;
    lensConfiguratorCollection.selectedRxTypeColor =
        event.detail.selectedRxTypeColor !== undefined && event.detail.selectedRxTypeColor !== null ? event.detail.selectedRxTypeColor : null;
    lensConfiguratorCollection.selectedFrameMountingType =
        event.detail.B2B_Mounting_Type__c !== undefined && event.detail.B2B_Mounting_Type__c !== null ? event.detail.B2B_Mounting_Type__c : null;
    lensConfiguratorCollection.selectedFrameVariantShape =
        event.detail.B2B_Variant_Shape__c !== undefined && event.detail.B2B_Variant_Shape__c !== null ? event.detail.B2B_Variant_Shape__c : null;
    lensConfiguratorCollection.selectedFrameBridgeSize =
        event.detail.B2B_Bridge_Size__c !== undefined && event.detail.B2B_Bridge_Size__c !== null ? event.detail.B2B_Bridge_Size__c : null;
    lensConfiguratorCollection.selectedFrameSchneiderSKU =
        event.detail.B2B_Schneider_SKU__c !== undefined && event.detail.B2B_Schneider_SKU__c !== null ? event.detail.B2B_Schneider_SKU__c : null;
    lensConfiguratorCollection.selectedFrameLensSize =
        event.detail.B2B_Lens_Size__c !== undefined && event.detail.B2B_Lens_Size__c !== null ? event.detail.B2B_Lens_Size__c : null;
    //BS-1201
    lensConfiguratorCollection.selectedFrameBaseCurve =
        event.detail.B2B_Frame_Base_Curve__c !== undefined && event.detail.B2B_Frame_Base_Curve__c !== null ? event.detail.B2B_Frame_Base_Curve__c : null;
    lensConfiguratorCollection.selectedFrameColorNumber =
        event.detail.B2B_Color_Number__c !== undefined && event.detail.B2B_Color_Number__c !== null ? event.detail.B2B_Color_Number__c : null;
    lensConfiguratorCollection.selectedFrameTempleLength =
        event.detail.B2B_Temple_Length__c !== undefined && event.detail.B2B_Temple_Length__c !== null ? event.detail.B2B_Temple_Length__c : null;
    lensConfiguratorCollection.withoutClipIn =
        event.detail.lensOnlyForClipIn !== undefined && event.detail.lensOnlyForClipIn !== null ? event.detail.lensOnlyForClipIn : null;
    //BS-1340 start
    lensConfiguratorCollection.withoutAdapter =
        event.detail.lensesWithoutAdapter !== undefined && event.detail.lensesWithoutAdapter !== null ? event.detail.lensesWithoutAdapter : null;
    //end
    return lensConfiguratorCollection;
};

/**
 * BS-1213
 * This method returns the updated lens configurator with lens selection  data
 */
const handleLensConfiguratorByLensCollectionUpdateData = (event, lensConfiguratorCollection) => {
    lensConfiguratorCollection.lensType =
        event.detail.lensSelectionCollection.lensType !== undefined && event.detail.lensSelectionCollection.lensType !== null
            ? event.detail.lensSelectionCollection.lensType
            : null;
    lensConfiguratorCollection.lensIndex =
        event.detail.lensSelectionCollection.lensIndex !== undefined && event.detail.lensSelectionCollection.lensIndex !== null
            ? event.detail.lensSelectionCollection.lensIndex
            : null;
    lensConfiguratorCollection.progressionLengthLens =
        event.detail.lensSelectionCollection.progressionLengthLens !== undefined && event.detail.lensSelectionCollection.progressionLengthLens !== null
            ? event.detail.lensSelectionCollection.progressionLengthLens
            : null;
    lensConfiguratorCollection.lensColor =
        event.detail.lensSelectionCollection.lensColor !== undefined && event.detail.lensSelectionCollection.lensColor !== null
            ? event.detail.lensSelectionCollection.lensColor
            : null;
    lensConfiguratorCollection.lensSKU =
        event.detail.lensSelectionCollection.lensSKU !== undefined && event.detail.lensSelectionCollection.lensSKU !== null
            ? event.detail.lensSelectionCollection.lensSKU
            : null;
    lensConfiguratorCollection.antireflectionSKU =
        event.detail.lensSelectionCollection.antireflectionSKU !== undefined && event.detail.lensSelectionCollection.antireflectionSKU !== null
            ? event.detail.lensSelectionCollection.antireflectionSKU
            : null;
    lensConfiguratorCollection.hardCoatingSKU =
        event.detail.lensSelectionCollection.hardCoatingSKU !== undefined && event.detail.lensSelectionCollection.hardCoatingSKU !== null
            ? event.detail.lensSelectionCollection.hardCoatingSKU
            : null;

    lensConfiguratorCollection.withEvilEyeEdge =
        event.detail.lensSelectionCollection.withEvilEyeEdge !== undefined && event.detail.lensSelectionCollection.withEvilEyeEdge !== null
            ? event.detail.lensSelectionCollection.withEvilEyeEdge
            : false;

    lensConfiguratorCollection.productMaterial =
        event.detail.lensSelectionCollection.productMaterial !== undefined && event.detail.lensSelectionCollection.productMaterial !== null
            ? event.detail.lensSelectionCollection.productMaterial
            : null;
    //BS-1355
    lensConfiguratorCollection.isAntireflectionHardcoating =
        event.detail.lensSelectionCollection.isAntireflectionHardcoating !== undefined &&
        event.detail.lensSelectionCollection.isAntireflectionHardcoating !== null
            ? event.detail.lensSelectionCollection.isAntireflectionHardcoating
            : false;
    //BS-1466 start
    lensConfiguratorCollection.lensColorId =
        event.detail.lensSelectionCollection.lensColorId !== undefined && event.detail.lensSelectionCollection.lensColorId !== null
            ? event.detail.lensSelectionCollection.lensColorId
            : null;
    lensConfiguratorCollection.photoSensationId =
        event.detail.lensSelectionCollection.photoSensationId !== undefined && event.detail.lensSelectionCollection.photoSensationId !== null
            ? event.detail.lensSelectionCollection.photoSensationId
            : null;
    lensConfiguratorCollection.blueSensationId =
        event.detail.lensSelectionCollection.blueSensationId !== undefined && event.detail.lensSelectionCollection.blueSensationId !== null
            ? event.detail.lensSelectionCollection.blueSensationId
            : null;
    lensConfiguratorCollection.lensDistance =
        event.detail.lensSelectionCollection.lensDistance !== undefined && event.detail.lensSelectionCollection.lensDistance !== null
            ? event.detail.lensSelectionCollection.lensDistance
            : null;
    lensConfiguratorCollection.visualPreferences =
        event.detail.lensSelectionCollection.visualPreferences !== undefined && event.detail.lensSelectionCollection.visualPreferences !== null
            ? event.detail.lensSelectionCollection.visualPreferences
            : null;
    lensConfiguratorCollection.lensEdge =
        event.detail.lensSelectionCollection.lensEdge !== undefined && event.detail.lensSelectionCollection.lensEdge !== null
            ? event.detail.lensSelectionCollection.lensEdge
            : null;
    lensConfiguratorCollection.glazing =
        event.detail.lensSelectionCollection.glazing !== undefined && event.detail.lensSelectionCollection.glazing !== null
            ? event.detail.lensSelectionCollection.glazing
            : null;
    lensConfiguratorCollection.glassProduct =
        event.detail.lensSelectionCollection.glassProduct !== undefined && event.detail.lensSelectionCollection.glassProduct !== null
            ? event.detail.lensSelectionCollection.glassProduct
            : null;
    lensConfiguratorCollection.blankCoating =
        event.detail.lensSelectionCollection.blankCoating !== undefined && event.detail.lensSelectionCollection.blankCoating !== null
            ? event.detail.lensSelectionCollection.blankCoating
            : null;
    lensConfiguratorCollection.antireflectionId =
        event.detail.lensSelectionCollection.antireflectionId !== undefined && event.detail.lensSelectionCollection.antireflectionId !== null
            ? event.detail.lensSelectionCollection.antireflectionId
            : null;
    lensConfiguratorCollection.hardCoatingId =
        event.detail.lensSelectionCollection.hardCoatingId !== undefined && event.detail.lensSelectionCollection.hardCoatingId !== null
            ? event.detail.lensSelectionCollection.hardCoatingId
            : null;
    //BS-1466 end
    lensConfiguratorCollection.relaxVersion =
        event.detail.lensSelectionCollection.relaxVersion !== undefined && event.detail.lensSelectionCollection.relaxVersion !== null
            ? event.detail.lensSelectionCollection.relaxVersion
            : null;
    //BS-2291 end
    return lensConfiguratorCollection;
};

/**
 * BS-1213
 * This method returns the updated lens configurator after resetting all the fields on order type change.
 */
const resetLensConfiguratorCollectionExceptPrescription = (lensConfiguratorCollection, _prescriptionValueFields) => {
    let parsedLensConfiguratorCollection;
    if (
        lensConfiguratorCollection != undefined &&
        lensConfiguratorCollection != null &&
        _prescriptionValueFields != undefined &&
        _prescriptionValueFields != null
    ) {
        parsedLensConfiguratorCollection = JSON.parse(JSON.stringify(lensConfiguratorCollection));
        Object.keys(parsedLensConfiguratorCollection).forEach((lensConfiguratorCollectionField) => {
            if (
                _prescriptionValueFields.includes(lensConfiguratorCollectionField) == false &&
                FIELDS_NOT_TO_RESET.includes(lensConfiguratorCollectionField) == false
            ) {
                parsedLensConfiguratorCollection[lensConfiguratorCollectionField] = null;
            }
        });
    }
    return parsedLensConfiguratorCollection;
};

export {
    setOnloadInputFieldAttributes,
    setDefaultInputFieldAttributes,
    setRightLensNoPrismInputFieldAttributes,
    setLeftLensNoPrismInputFieldAttributes,
    setRightLeftLensInDegreesInputFieldAttributes,
    setRightLensInDegreesInputFieldAttributes,
    setLeftLensInDegreesInputFieldAttributes,
    setRightLeftLensHorVertInputFieldAttributes,
    handlePrescriptionValueUpdateIntoConfigurator, //BS-728
    handleCenteringDataUpdateIntoConfigurator, // BS-728
    handleRxSolutionDataUpdateIntoConfigurator,
    handleLensConfiguratorByLensCollectionUpdateData,
    resetLensConfiguratorCollectionExceptPrescription
};
