import { LightningElement, track, api, wire } from 'lwc';
import LANG from '@salesforce/i18n/lang';

import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';
import {
    setOnloadInputFieldAttributes,
    setDefaultInputFieldAttributes,
    setRightLensNoPrismInputFieldAttributes,
    setLeftLensNoPrismInputFieldAttributes,
    setRightLeftLensInDegreesInputFieldAttributes,
    setRightLensInDegreesInputFieldAttributes,
    setLeftLensInDegreesInputFieldAttributes,
    setRightLeftLensHorVertInputFieldAttributes
} from 'c/b2b_vs_rx_utils';
import {
    decimalAppendedPrescriptionValues,
    setLeftLensHorizontalVerticalInputFieldAttributes, //BS-1412
    setRightLensHorizontalVerticalInputFieldAttributes //BS-1412
} from 'c/b2b_vsrxPrescriptionValues_utils';
import { validateRightLeftNoPrismConditionValues } from 'c/b2b_vsrxPrescriptionValues_utils'; //Added as a part of BS-1458
import { validateRightNoPrismConditionValues } from 'c/b2b_vsrxPrescriptionValues_utils'; //Added as a part of BS-1458
import { validateLefttNoPrismConditionValues } from 'c/b2b_vsrxPrescriptionValues_utils'; //Added as a part of BS-1458
import { validateRightLeftDegreeConditionValues } from 'c/b2b_vsrxPrescriptionValues_utils'; //Added as a part of BS-1458
import { validateRightLeftHorizontalVerticalConditionValues } from 'c/b2b_vsrxPrescriptionValues_utils'; //Added as a part of BS-1458
import { validateRightDegreeConditionValues } from 'c/b2b_vsrxPrescriptionValues_utils'; //Added as a part of BS-1458
import { validateRightHorizontalVerticalConditionValues } from 'c/b2b_vsrxPrescriptionValues_utils'; //Added as a part of BS-1458
import { validateLeftDegreeConditionValues } from 'c/b2b_vsrxPrescriptionValues_utils'; //Added as a part of BS-1458
import { validateLeftHorizontalVerticalConditionValues } from 'c/b2b_vsrxPrescriptionValues_utils'; //Added as a part of BS-1458

//Apex methods
import getPrescriptionValues from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getPrescriptionValues';
import savePrescriptionData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.savePrescriptionData';
import getPicklistValuesForVSRX from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFieldPicklistValues'; //BS-1054

//Object and field info
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import LENS_CONFIGURATOR from '@salesforce/schema/B2B_Lens_Configurator__c';
import EYE_SIDE_FIELD from '@salesforce/schema/B2B_Lens_Configurator__c.B2B_Eye_Side__c';
import BASE_VALUE_FIELD from '@salesforce/schema/B2B_Lens_Configurator__c.B2B_Base_Values__c';
import PRISM_BASE2_FIELD from '@salesforce/schema/B2B_Lens_Configurator__c.B2B_PB2Placement_Right__c';
import PRISM_BASE1_FIELD from '@salesforce/schema/B2B_Lens_Configurator__c.B2B_PB1Placement_Right__c';

//custom labels
import B2B_VS_RX_PRESCRIPTION_VALUE from '@salesforce/label/c.B2B_VS_RX_PRESCRIPTION_VALUE';
import B2B_VS_RX_EYE_SIDE from '@salesforce/label/c.B2B_VS_RX_EYE_SIDE';
import B2B_VS_RX_BASE_VALUE from '@salesforce/label/c.B2B_VS_RX_BASE_VALUE';
import B2B_VS_RX_RIGHT_EYE from '@salesforce/label/c.B2B_VS_RX_RIGHT_EYE';
import B2B_VS_RX_LEFT_EYE from '@salesforce/label/c.B2B_VS_RX_LEFT_EYE';
import B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS from '@salesforce/label/c.B2B_VS_RX_PRESCRIPTION_VALUE_FIELDS';
import B2B_VS_RX_MEASUREMENT_UNIT from '@salesforce/label/c.B2B_VS_RX_MEASUREMENT_UNIT';
import B2B_VS_RX_EMPTY_INPUT_ERROR from '@salesforce/label/c.B2B_VS_RX_EMPTY_INPUT_ERROR';
import B2B_VS_RX_PRESCRIPTION_VALUE_INPUT_FIELDS_NAME from '@salesforce/label/c.B2B_VS_RX_Prescription_Value_Input_Fields_Name'; //BS-1054
import B2B_VS_RX_CENTERING_DATA_ERROR from '@salesforce/label/c.B2B_VS_RX_CENTERING_DATA_ERROR'; //BS-1242
import B2B_PRESCRIPTION_POWER_RANGE_LABEL from '@salesforce/label/c.B2B_PRESCRIPTION_POWER_RANGE_LABEL'; //BS-1242
import B2B_PRESCRIPTION_POWER_RANGE_LINK from '@salesforce/label/c.B2B_PRESCRIPTION_POWER_RANGE_LINK'; //BS-1242
import B2B_VS_RX_STRONGEST_MAINCUT_ERROR from '@salesforce/label/c.B2B_VS_RX_STRONGEST_MAINCUT_ERROR'; //BS-2139

const EYE_SIDE = 'eyeSide';
const BASE_VALUE = 'baseValue';
const PRESCRIPTION_VALUE_UPDATE = 'addprescriptionvalue';
const READ_ONLY_MODE = 'read'; //BS-1054
const EDIT_MODE = 'edit'; //BS-1054
const UPDATE_PROGRESS_BAR = 'updateprogressbar'; //BS-1054
const RIGHT_LEFT_EYESIDE = 'right and left lens side'; //BS-1054
const RIGHT_EYESIDE = 'Right lens'; //BS-1054
const LEFT_EYESIDE = 'Left lens'; //BS-1054
const NO_PRISM_BASEVALUE = 'No Prism'; //BS-1054
const IN_DEGREE_BASEVALUE = 'In Degrees'; //BS-1054
const HOR_VERT_BASEVALUE = 'Horizontal / Vertical'; //BS-1054
const RIGHT_PB1FIELD = 'B2B_PB1Placement_Right__c'; //BS-1129
const LEFT_PB1FIELD = 'B2B_PB1Placement_Left__c'; //BS-1129
const PB2FIELD = 'B2B_PB2Placement_Right__c'; //BS-1054
const PRESCRIPTION_UPDATED = 'prescriptionUpdated'; //BS-1244
const PANORMA_SINGLE_VISION = 'Panorama Single Vision';
const LANG_ENG = 'en_US';
const PAGE_SOURCE_VS = 'VS'; //BS-968
const PAGE_SOURCE_RX = 'RX'; //BS-968
const COMPLETE_EYEWEAR = 'Complete Eyewear'; //BS-1634
//BS-1632 - start
const PRESCRIPTION_DATA = 'fromContainer';
const RIGHT_LEFT_NO_PRISM_VALUES = 'rightsphere;rightcylinder;rightaxis;rightaddition;leftsphere;leftcylinder;leftaxis;leftaddition';
const RIGHT_NO_PRISM_VALUES = 'rightsphere;rightcylinder;rightaxis;rightaddition';
const LEFT_NO_PRISM_VALUES = 'leftsphere;leftcylinder;leftaxis;leftaddition';
const RIGHT_LEFT_DEGREE_VALUES =
    'rightsphere;rightcylinder;rightaxis;rightaddition;rightprism1;rightprismbase1;rightprism2;rightprismbase2;leftsphere;leftcylinder;leftaxis;leftaddition;leftprism1;leftprismbase1;leftprism2;leftprismbase2';
const RIGHT_DEGREE_VALUES = 'rightsphere;rightcylinder;rightaxis;rightaddition;rightprism1;rightprismbase1;rightprism2;rightprismbase2';
const LEFT_DEGREE_VALUES = 'leftsphere;leftcylinder;leftaxis;leftaddition;leftprism1;leftprismbase1;leftprism2;leftprismbase2';
const RIGHT_LEFT_HORIZONTAL_VERTICAL_VALUES =
    'rightsphere;rightcylinder;rightaxis;rightaddition;rightprism1;rightprism2;rightprismbase2radio;rightprismbase1radio;leftsphere;leftcylinder;leftaxis;leftaddition;leftprism1;leftprism2;leftprismbase2radio;leftprismbase1radio';
const RIGHT_HORIZONTAL_VERTICAL_VALUES = 'rightsphere;rightcylinder;rightaxis;rightaddition;rightprism1;rightprism2;rightprismbase2radio;rightprismbase1radio';
const LEFT_HORIZONTAL_VERTICAL_VALUES = 'leftsphere;leftcylinder;leftaxis;leftaddition;leftprism1;leftprism2;leftprismbase2radio;leftprismbase1radio';
//BS-1632 - end
//BS-2139 start
const RIGHT_SPHERE = 'rightsphere';
const RIGHT_CYLINDER = 'rightcylinder';
const LEFT_SPHERE = 'leftsphere';
const LEFT_CYLINDER = 'leftcylinder';
//BS-2139 end
const PANORAMA_RELAX = 'Panorama Relax'; //BS-2508

export default class B2b_vsrxPrescriptionValue extends LightningElement {
    externalLink = STORE_STYLING + '/icons/externalLink.svg';
    infoSVG = STORE_STYLING + '/icons/INFO.svg';

    @track _eyeSideValues;
    @track _baseValues;
    @track _selectedEyeSideValue;
    @track _selectedEyeSideValueForReadOnly;
    @track _selectedBaseValue;
    @track _selectedBaseValueForReadOnly;
    @track _prismBase1Values = []; //BS-1054
    @track _prismBase1LeftValues = []; //BS-1129
    @track _prismBase2Values = []; //BS-1054
    @track _prismBase1Selected;
    @track _prismBase2Selected;
    @track _defaultSelection = true;
    @track _rightLensNoPrism = false;
    @track _leftLensNoPrism = false;
    @track _rightLeftLensInDegrees = false;
    @track _rightLensInDegrees = false;
    @track _leftLensInDegrees = false;
    @track _rightLeftLensHorVert = false;
    @track _rightLensHorVert = false;
    @track _leftLensHorVert = false;
    @track _prismBase1RightSelected;
    @track _prismBase2RightSelected;
    @track _prismBase1LeftSelected;
    @track _prismBase2LeftSelected;
    @track _prescriptionFieldsData = [];
    @track _prescriptionData = {};
    @track _isSuccess = false;
    //BS-2139 start
    @track _showRightStrongestMaincut = false;
    @track _showLeftStrongestMaincut = false;
    @track _showStrongestMaincut = false;
    //BS-2139 end
    disableEyeSideOptions = false; //BS-1634

    /**
     * BS-1054
     * This variable will be used to control the read only or edit mode of the component.
     */
    @api
    prescriptionValueComponentMode;

    @api
    pageSource; //BS-968

    /**
     * Variable to set current mode of component
     * BS-1054
     * @type {Boolean}
     */
    @track
    _isReadOnly;

    /**
     * This variable will contain all the CSS classes and type of the user input
     * depending upon the selected eyeside and base value
     */
    @track
    _globalSelectionArray = [];

    @api
    lensConfiguratorCollection;

    @track
    lensConfiguratorId;

    @track
    lensProductSKU;

    @track
    _lensTypeValue;

    @track
    _isVsScreen = false;

    _powerRangeLabel = B2B_PRESCRIPTION_POWER_RANGE_LABEL;
    _powerRangeLink = B2B_PRESCRIPTION_POWER_RANGE_LINK;

    /**
     * Gets the eye side values
     * BS-825
     * @type {string array}
     */
    get eyeSideValues() {
        return this._eyeSideValues;
    }

    /**
     * Gets the eye base values
     * BS-825
     * @type {string array}
     */
    get baseValues() {
        return this._baseValues;
    }

    /**
     * Gets the prism base1 values
     * BS-825
     * @type {string array}
     */
    get prismBase1Values() {
        return this._prismBase1Values;
    }

    /**
     * BS-1129
     */
    get prismBase1LeftValues() {
        return this._prismBase1LeftValues;
    }
    /**
     * Gets the prism base2 values
     * BS-825
     * @type {string array}
     */
    get prismBase2Values() {
        return this._prismBase2Values;
    }

    /**
     * getter to get pencil icon
     * BS-1054
     */
    get editIcon() {
        let editIcon;
        editIcon = {
            icon: STORE_STYLING + '/icons/edit.png'
        };
        return editIcon;
    }

    /**
     * Custom labels used on UI
     * BS-825
     * @type {object}
     */
    labels = {
        prescriptionValue: B2B_VS_RX_PRESCRIPTION_VALUE,
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
        message: B2B_VS_RX_CENTERING_DATA_ERROR,
        emptyAdditionErrorMessage: B2B_VS_RX_EMPTY_INPUT_ERROR.split(',')[1],
        rightStrongestMaincut: B2B_VS_RX_STRONGEST_MAINCUT_ERROR.split(',')[0],
        leftStrongestMaincut: B2B_VS_RX_STRONGEST_MAINCUT_ERROR.split(',')[1]
    };

    /**
     * BS-1054
     * Custom Label which will hold the list of possible user imputs name.
     */
    inputFieldsNameList = B2B_VS_RX_PRESCRIPTION_VALUE_INPUT_FIELDS_NAME.split(',');

    /**
     * Wire call to get the info about the Lens Configurator Object
     * BS-825
     * @type {object}
     */
    @wire(getObjectInfo, { objectApiName: LENS_CONFIGURATOR })
    lensConfiguratorInfo;

    /**
     * Wire call to get the eye side picklist field values
     * BS-825
     * @type {object}
     */
    @wire(getPicklistValues, { recordTypeId: '$lensConfiguratorInfo.data.defaultRecordTypeId', fieldApiName: EYE_SIDE_FIELD })
    getEyeSideValues({ error, data }) {
        if (data) {
            this._eyeSideValues = data.values;
            if (
                this.lensConfiguratorCollection != null &&
                this.lensConfiguratorCollection != undefined &&
                this.lensConfiguratorCollection.eyeSide != null &&
                this.lensConfiguratorCollection.eyeSide != undefined
            ) {
                if (LANG !== LANG_ENG) {
                    for (let i = 0; i < this._eyeSideValues.length; i++) {
                        if (this.lensConfiguratorCollection.eyeSide === this._eyeSideValues[i].value) {
                            this._selectedEyeSideValueForReadOnly = this._eyeSideValues[i].label;
                        } //end inner if
                        //Added as a part of BS-1634
                        if (
                            this.lensConfiguratorCollection != null &&
                            this.lensConfiguratorCollection != undefined &&
                            this._eyeSideValues[i].value == RIGHT_LEFT_EYESIDE &&
                            this.lensConfiguratorCollection.orderType == COMPLETE_EYEWEAR
                        ) {
                            this._selectedEyeSideValue = this._eyeSideValues[i].value;
                        }
                    } //end for
                } else {
                    this._selectedEyeSideValueForReadOnly = this.lensConfiguratorCollection.eyeSide;
                } //end if else
                this._selectedEyeSideValue = this.lensConfiguratorCollection.eyeSide;
            } else {
                this._selectedEyeSideValue = this._eyeSideValues[0].value;
                this._selectedEyeSideValueForReadOnly = this._eyeSideValues[0].label;
            }
        } else if (error) {
            console.error(error);
        }
    }

    /**
     * Wire call to get the base value picklist field values
     * BS-825
     * @type {object}
     */
    @wire(getPicklistValues, { recordTypeId: '$lensConfiguratorInfo.data.defaultRecordTypeId', fieldApiName: BASE_VALUE_FIELD })
    getBaseValues({ error, data }) {
        if (data) {
            this._baseValues = data.values;
            if (
                this.lensConfiguratorCollection != null &&
                this.lensConfiguratorCollection != undefined &&
                this.lensConfiguratorCollection.baseValue != null &&
                this.lensConfiguratorCollection.baseValue != undefined
            ) {
                if (LANG !== LANG_ENG) {
                    for (let i = 0; i < this._baseValues.length; i++) {
                        if (this.lensConfiguratorCollection.baseValue === this._baseValues[i].value) {
                            this._selectedBaseValueForReadOnly = this._baseValues[i].label;
                        } //end inner if
                    } //end for
                } else {
                    this._selectedBaseValueForReadOnly = this.lensConfiguratorCollection.baseValue;
                } //end if else

                this._selectedBaseValue = this.lensConfiguratorCollection.baseValue;
            } else {
                this._selectedBaseValue = this._baseValues[0].value;
                this._selectedBaseValueForReadOnly = this._baseValues[0].label;
            }
        } else if (error) {
            console.error(error);
        }
    }

    /**
     * Connected call back to invoke the methods
     * BS-725
     */
    async connectedCallback() {
        await this.getPrismBase1Values();
        this.setupComponentMode(this.prescriptionValueComponentMode);
        //BS-968
        if (this.pageSource !== undefined && this.pageSource !== null && this.pageSource == PAGE_SOURCE_VS) {
            this._isVsScreen = true;
        }
        this._isSuccess = false;
        if (this.lensConfiguratorCollection) {
            this.lensConfiguratorCollection = decimalAppendedPrescriptionValues(this.lensConfiguratorCollection, this.inputFieldsNameList);
        }
        //BS-572
        if (
            this.lensConfiguratorCollection != null &&
            this.lensConfiguratorCollection != undefined &&
            this.lensConfiguratorCollection.eyeSide != null &&
            this.lensConfiguratorCollection.eyeSide != undefined
        ) {
            //Added as a part of BS-1634
            if (this.lensConfiguratorCollection.orderType == COMPLETE_EYEWEAR) {
                this._selectedEyeSideValue = RIGHT_LEFT_EYESIDE;
                this.lensConfiguratorCollection.eyeSide = RIGHT_LEFT_EYESIDE;
            } else {
                this._selectedEyeSideValue = this.lensConfiguratorCollection.eyeSide;
            }
        } else {
            if (this._eyeSideValues && this._eyeSideValues[0]) {
                this._selectedEyeSideValue = this._eyeSideValues[0].value;
            }
        }
        //Added as a part of BS-1634
        if (
            this.lensConfiguratorCollection != null &&
            this.lensConfiguratorCollection != undefined &&
            this.lensConfiguratorCollection.orderType == COMPLETE_EYEWEAR
        ) {
            this.disableEyeSideOptions = true;
        }

        //BS-572
        this.lensProductSKU = this.lensConfiguratorCollection.lensSKU;
        this.lensConfiguratorId = this.lensConfiguratorCollection.lensConfiguratorID;
        this._lensTypeValue = this.lensConfiguratorCollection.lensType;
        this.getPrescriptionFieldsData();
    }

    /**
     * rendered call back to invoke the methods
     * BS-1054
     */
    renderedCallback() {
        this.setCommaToDot();
    }
    /**
     * BS-1129
     */
    getPrismBase1Values() {
        getPicklistValuesForVSRX({ objectApiName: 'B2B_Lens_Configurator__c', picklistField: RIGHT_PB1FIELD })
            .then((data) => {
                data.picklistValues.forEach((item) => {
                    let object = {
                        label: item.picklistValue,
                        value: item.apiName
                    };
                    this._prismBase1Values.push(object);
                });
                if (
                    this.lensConfiguratorCollection != null &&
                    this.lensConfiguratorCollection != undefined &&
                    this.lensConfiguratorCollection.rightprismbase1radio != null &&
                    this.lensConfiguratorCollection.rightprismbase1radio != undefined
                ) {
                    this._prismBase1RightSelected = this.lensConfiguratorCollection.rightprismbase1radio;
                } else if (
                    this.lensConfiguratorCollection != null &&
                    this.lensConfiguratorCollection != undefined &&
                    this.lensConfiguratorCollection.rightprismbase1radio == null &&
                    this.lensConfiguratorCollection.rightprismbase1radio == undefined
                ) {
                    this._prismBase1RightSelected = this._prismBase1Values[0].value;
                } else if (this._isReadOnly == false) {
                    this._prismBase1RightSelected = this._prismBase1Values[0].value;
                }
                this.getPrismBase1LeftValues();
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
            });
    }
    /**
     * BS-1129
     */
    getPrismBase1LeftValues() {
        getPicklistValuesForVSRX({ objectApiName: 'B2B_Lens_Configurator__c', picklistField: LEFT_PB1FIELD })
            .then((data) => {
                data.picklistValues.forEach((item) => {
                    let object = {
                        label: item.picklistValue,
                        value: item.apiName
                    };
                    this._prismBase1LeftValues.push(object);
                });
                if (
                    this.lensConfiguratorCollection != null &&
                    this.lensConfiguratorCollection != undefined &&
                    this.lensConfiguratorCollection.leftprismbase1radio != null &&
                    this.lensConfiguratorCollection.leftprismbase1radio != undefined
                ) {
                    this._prismBase1LeftSelected = this.lensConfiguratorCollection.leftprismbase1radio;
                } else if (
                    this.lensConfiguratorCollection != null &&
                    this.lensConfiguratorCollection != undefined &&
                    this.lensConfiguratorCollection.leftprismbase1radio == null &&
                    this.lensConfiguratorCollection.leftprismbase1radio == undefined
                ) {
                    this._prismBase1LeftSelected = this._prismBase1LeftValues[1].value;
                } else if (this._isReadOnly == false) {
                    this._prismBase1LeftSelected = this._prismBase1LeftValues[1].value;
                }
                this.getPrismBase2Values();
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
                // Firing event to stop the loader/spinner
            });
    }
    getPrismBase2Values() {
        getPicklistValuesForVSRX({ objectApiName: 'B2B_Lens_Configurator__c', picklistField: PB2FIELD })
            .then((data) => {
                data.picklistValues.forEach((item) => {
                    let object = {
                        label: item.picklistValue,
                        value: item.apiName
                    };
                    this._prismBase2Values.push(object);
                });
                if (
                    this.lensConfiguratorCollection != null &&
                    this.lensConfiguratorCollection != undefined &&
                    this.lensConfiguratorCollection.rightprismbase2radio != null &&
                    this.lensConfiguratorCollection.rightprismbase2radio != undefined
                ) {
                    this._prismBase2RightSelected = this.lensConfiguratorCollection.rightprismbase2radio;
                } else if (
                    this.lensConfiguratorCollection != null &&
                    this.lensConfiguratorCollection != undefined &&
                    this.lensConfiguratorCollection.rightprismbase2radio == null &&
                    this.lensConfiguratorCollection.rightprismbase2radio == undefined
                ) {
                    this._prismBase2RightSelected = this._prismBase2Values[0].value;
                }
                if (
                    this.lensConfiguratorCollection != null &&
                    this.lensConfiguratorCollection != undefined &&
                    this.lensConfiguratorCollection.leftprismbase2radio != null &&
                    this.lensConfiguratorCollection.leftprismbase2radio != undefined
                ) {
                    this._prismBase2LeftSelected = this.lensConfiguratorCollection.leftprismbase2radio;
                } else if (
                    this.lensConfiguratorCollection != null &&
                    this.lensConfiguratorCollection != undefined &&
                    this.lensConfiguratorCollection.leftprismbase2radio == null &&
                    this.lensConfiguratorCollection.leftprismbase2radio == undefined
                ) {
                    this._prismBase2LeftSelected = this._prismBase2Values[1].value;
                } else if (this._isReadOnly == false) {
                    this._prismBase2RightSelected = this._prismBase2Values[0].value;
                    this._prismBase2LeftSelected = this._prismBase2Values[1].value;
                }

                this.setOnloadInputFieldAttributes();
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
            });
    }

    /**
     * this method will handle the input change event and will set the required
     * template to show on UI based on selected input.
     * BS-825
     */
    genericOnChange(event) {
        this.resetSelectedValues();
        let selectedValue = event.detail.value;
        let selectedField = event.target.dataset.name;
        if (selectedField == EYE_SIDE) {
            this._selectedEyeSideValue = selectedValue;
            for (let i = 0; i < this.eyeSideValues.length; i++) {
                if (this.eyeSideValues[i].value === selectedValue) {
                    this._selectedEyeSideValueForReadOnly = this.eyeSideValues[i].label;
                } //end if
            } //end for
        } else if (selectedField == BASE_VALUE) {
            this._selectedBaseValue = selectedValue;
            this._selectedBaseValueForReadOnly = event.target.label;
            for (let i = 0; i < this.baseValues.length; i++) {
                if (this.baseValues[i].value === selectedValue) {
                    this._selectedBaseValueForReadOnly = this.baseValues[i].label;
                } //end if
            } //end for
        }

        if (this._selectedEyeSideValue == this._eyeSideValues[0].value && this._selectedBaseValue == this._baseValues[0].value) {
            this._defaultSelection = true;
            this.setDefaultInputFieldAttributes();
            this._rightLensNoPrism = false;
            this._leftLensNoPrism = false;
            this._rightLeftLensInDegrees = false;
            this._rightLensInDegrees = false;
            this._leftLensInDegrees = false;
            this._rightLeftLensHorVert = false;
            this._rightLensHorVert = false;
            this._leftLensHorVert = false;
            if (this._lensTypeValue == PANORAMA_RELAX) {
                if (this._prescriptionData['leftaddition'] == undefined || this._prescriptionData['leftaddition'] == null) {
                    this._prescriptionData['leftaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
                if (this._prescriptionData['rightaddition'] == undefined || this._prescriptionData['rightaddition'] == null) {
                    this._prescriptionData['rightaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
            }
            this._prescriptionData[PRESCRIPTION_UPDATED] = true; //BS-1244
        } else if (this._selectedEyeSideValue == this._eyeSideValues[1].value && this._selectedBaseValue == this._baseValues[0].value) {
            this._defaultSelection = false;
            this._rightLensNoPrism = true;
            this.setRightLensNoPrismInputFieldAttributes();
            this._leftLensNoPrism = false;
            this._rightLeftLensInDegrees = false;
            this._rightLensInDegrees = false;
            this._leftLensInDegrees = false;
            this._rightLeftLensHorVert = false;
            this._rightLensHorVert = false;
            this._leftLensHorVert = false;
            this._prescriptionData[PRESCRIPTION_UPDATED] = true; //BS-1244
            if ((this._lensTypeValue = PANORAMA_RELAX)) {
                this._prescriptionData['leftaddition'] = null;
                if (this._prescriptionData['rightaddition'] == undefined || this._prescriptionData['rightaddition'] == null) {
                    this._prescriptionData['rightaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
            }
        } else if (this._selectedEyeSideValue == this._eyeSideValues[2].value && this._selectedBaseValue == this._baseValues[0].value) {
            this._defaultSelection = false;
            this._rightLensNoPrism = false;
            this._leftLensNoPrism = true;
            this.setLeftLensNoPrismInputFieldAttributes();
            this._rightLeftLensInDegrees = false;
            this._rightLensInDegrees = false;
            this._leftLensInDegrees = false;
            this._rightLeftLensHorVert = false;
            this._rightLensHorVert = false;
            this._leftLensHorVert = false;
            if ((this._lensTypeValue = PANORAMA_RELAX)) {
                this._prescriptionData['rightaddition'] = null;
                if (this._prescriptionData['leftaddition'] == undefined || this._prescriptionData['leftaddition'] == null) {
                    this._prescriptionData['leftaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
            }
            this._prescriptionData[PRESCRIPTION_UPDATED] = true; //BS-1244
        } else if (this._selectedEyeSideValue == this._eyeSideValues[0].value && this._selectedBaseValue == this._baseValues[1].value) {
            this._defaultSelection = false;
            this._rightLensNoPrism = false;
            this._leftLensNoPrism = false;
            this._rightLeftLensInDegrees = true;
            this.setRightLeftLensInDegreesInputFieldAttributes();
            this._rightLensInDegrees = false;
            this._leftLensInDegrees = false;
            this._rightLeftLensHorVert = false;
            this._rightLensHorVert = false;
            this._leftLensHorVert = false;
            if (this._lensTypeValue == PANORAMA_RELAX) {
                if (this._prescriptionData['leftaddition'] == undefined || this._prescriptionData['leftaddition'] == null) {
                    this._prescriptionData['leftaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
                if (this._prescriptionData['rightaddition'] == undefined || this._prescriptionData['rightaddition'] == null) {
                    this._prescriptionData['rightaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
            }
            this._prescriptionData[PRESCRIPTION_UPDATED] = true; //BS-1244
        } else if (this._selectedEyeSideValue == this._eyeSideValues[0].value && this._selectedBaseValue == this._baseValues[2].value) {
            this._defaultSelection = false;
            this._rightLensNoPrism = false;
            this._leftLensNoPrism = false;
            this._rightLeftLensInDegrees = false;
            this._rightLensInDegrees = false;
            this._leftLensInDegrees = false;
            this._rightLeftLensHorVert = true;
            this._rightLensHorVert = false;
            this._leftLensHorVert = false;
            this._prismBase1RightSelected = this._prismBase1RightSelected == null ? this.prismBase1Values[0].value : this._prismBase1RightSelected; //BS-1632
            this._prismBase2RightSelected = this._prismBase2RightSelected == null ? this.prismBase2Values[0].value : this._prismBase2RightSelected; //BS-1632
            this._prismBase1LeftSelected = this._prismBase1LeftSelected == null ? this.prismBase1Values[1].value : this._prismBase1LeftSelected; //BS-1632
            this._prismBase2LeftSelected = this._prismBase2LeftSelected == null ? this.prismBase2Values[1].value : this._prismBase2LeftSelected; //BS-1632
            this.setRightLeftLensHorVertInputFieldAttributes();
            this.setDefaultPrismBaseRadioValues();
            this._prescriptionData['rightprismbase2radio'] = this._prismBase2RightSelected;
            this._prescriptionData['rightprismbase1radio'] = this._prismBase1RightSelected;
            this._prescriptionData['leftprismbase1radio'] = this._prismBase1LeftSelected;
            this._prescriptionData['leftprismbase2radio'] = this._prismBase2LeftSelected;
            if (this._lensTypeValue == PANORAMA_RELAX) {
                if (this._prescriptionData['leftaddition'] == undefined || this._prescriptionData['leftaddition'] == null) {
                    this._prescriptionData['leftaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
                if (this._prescriptionData['rightaddition'] == undefined || this._prescriptionData['rightaddition'] == null) {
                    this._prescriptionData['rightaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
            }
            this._prescriptionData[PRESCRIPTION_UPDATED] = true; //BS-1244
        } else if (this._selectedEyeSideValue == this._eyeSideValues[1].value && this._selectedBaseValue == this._baseValues[1].value) {
            this._defaultSelection = false;
            this._rightLensNoPrism = false;
            this._leftLensNoPrism = false;
            this._rightLeftLensInDegrees = false;
            this._rightLensInDegrees = true;
            this.setRightLensInDegreesInputFieldAttributes();
            this._leftLensInDegrees = false;
            this._rightLeftLensHorVert = false;
            this._rightLensHorVert = false;
            this._leftLensHorVert = false;
            if ((this._lensTypeValue = PANORAMA_RELAX)) {
                this._prescriptionData['leftaddition'] = null;
                if (this._prescriptionData['rightaddition'] == undefined || this._prescriptionData['rightaddition'] == null) {
                    this._prescriptionData['rightaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
            }
            this._prescriptionData[PRESCRIPTION_UPDATED] = true; //BS-1244
        } else if (this._selectedEyeSideValue == this._eyeSideValues[1].value && this._selectedBaseValue == this._baseValues[2].value) {
            this._defaultSelection = false;
            this._rightLensNoPrism = false;
            this._leftLensNoPrism = false;
            this._rightLeftLensInDegrees = false;
            this._rightLensInDegrees = false;
            this._leftLensInDegrees = false;
            this._rightLeftLensHorVert = false;
            this._rightLensHorVert = true;
            this._leftLensHorVert = false;
            this._prismBase1RightSelected = this._prismBase1RightSelected == null ? this.prismBase1Values[0].value : this._prismBase1RightSelected; //BS-1632
            this._prismBase2RightSelected = this._prismBase2RightSelected == null ? this.prismBase2Values[0].value : this._prismBase2RightSelected; //BS-1632
            this._prismBase1LeftSelected = this._prismBase1LeftSelected == null ? this.prismBase1Values[1].value : this._prismBase1LeftSelected; //BS-1632
            this._prismBase2LeftSelected = this._prismBase2LeftSelected == null ? this.prismBase2Values[1].value : this._prismBase2LeftSelected; //BS-1632
            this.setRightLensHorizontalVerticalInputFieldAttributes();
            this.setDefaultPrismBaseRadioValues();
            this._prescriptionData['rightprismbase2radio'] = this._prismBase2RightSelected;
            this._prescriptionData['rightprismbase1radio'] = this._prismBase1RightSelected;
            this._prescriptionData[PRESCRIPTION_UPDATED] = true; //BS-1244
        } else if (this._selectedEyeSideValue == this._eyeSideValues[2].value && this._selectedBaseValue == this._baseValues[1].value) {
            this._defaultSelection = false;
            this._rightLensNoPrism = false;
            this._leftLensNoPrism = false;
            this._rightLeftLensInDegrees = false;
            this._rightLensInDegrees = false;
            this._leftLensInDegrees = true;
            this.setLeftLensInDegreesInputFieldAttributes();
            this._rightLeftLensHorVert = false;
            this._rightLensHorVert = false;
            this._leftLensHorVert = false;
            if ((this._lensTypeValue = PANORAMA_RELAX)) {
                this._prescriptionData['rightaddition'] = null;
                if (this._prescriptionData['leftaddition'] == undefined || this._prescriptionData['leftaddition'] == null) {
                    this._prescriptionData['leftaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
            }
            this._prescriptionData[PRESCRIPTION_UPDATED] = true; //BS-1244
        } else if (this._selectedEyeSideValue == this._eyeSideValues[2].value && this._selectedBaseValue == this._baseValues[2].value) {
            this._defaultSelection = false;
            this._rightLensNoPrism = false;
            this._leftLensNoPrism = false;
            this._rightLeftLensInDegrees = false;
            this._rightLensInDegrees = false;
            this._leftLensInDegrees = false;
            this._rightLeftLensHorVert = false;
            this._rightLensHorVert = false;
            this._leftLensHorVert = true;
            this._prismBase1RightSelected = this._prismBase1RightSelected == null ? this.prismBase1Values[0].value : this._prismBase1RightSelected; //BS-1632
            this._prismBase2RightSelected = this._prismBase2RightSelected == null ? this.prismBase2Values[0].value : this._prismBase2RightSelected; //BS-1632
            this._prismBase1LeftSelected = this._prismBase1LeftSelected == null ? this.prismBase1Values[1].value : this._prismBase1LeftSelected; //BS-1632
            this._prismBase2LeftSelected = this._prismBase2LeftSelected == null ? this.prismBase2Values[1].value : this._prismBase2LeftSelected; //BS-1632
            this.setLeftLensHorizontalVerticalInputFieldAttributes();
            this.setDefaultPrismBaseRadioValues();
            if ((this._lensTypeValue = PANORAMA_RELAX)) {
                this._prescriptionData['rightaddition'] = null;
                if (this._prescriptionData['leftaddition'] == undefined || this._prescriptionData['leftaddition'] == null) {
                    this._prescriptionData['leftaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
            }
            this._prescriptionData['leftprismbase1radio'] = this._prismBase1LeftSelected;
            this._prescriptionData['leftprismbase2radio'] = this._prismBase2LeftSelected;
            this._prescriptionData[PRESCRIPTION_UPDATED] = true; //BS-1244
        }
    }

    /**
     * this method will fetch required fields of a product record.
     * BS-825
     */
    getPrescriptionFieldsData() {
        getPrescriptionValues({ lensProductSKU: this.lensProductSKU })
            .then((result) => {
                //BS-1708
                if (result) {
                    if (
                        this.lensConfiguratorCollection &&
                        this.lensConfiguratorCollection.withEvilEyeEdge &&
                        this.lensConfiguratorCollection.withEvilEyeEdge == true
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
                }
                //BS-1708
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
            });
    }

    /**
     * this method will store the entered user input.
     * BS-825
     */
    handleInputChange(event) {
        if (event.target.value) {
            if (/^[-+]?[0-9]*([.,][0-9]*)?$/.test(event.target.value)) {
                this._prescriptionData[event.target.name] = event.target.value.replace(/,/g, '.');
            } else {
                this._prescriptionData[event.target.name] = event.target.value;
            }
            if (event.target.name == 'rightprismbase1radio') {
                this._prescriptionData[event.target.name] = event.target.value;
                this._prismBase1RightSelected = event.target.value;
            } else if (event.target.name == 'rightprismbase2radio') {
                this._prescriptionData[event.target.name] = event.target.value;
                this._prismBase2RightSelected = event.target.value;
            } else if (event.target.name == 'leftprismbase1radio') {
                this._prescriptionData[event.target.name] = event.target.value;
                this._prismBase1LeftSelected = event.target.value;
            } else if (event.target.name == 'leftprismbase2radio') {
                this._prescriptionData[event.target.name] = event.target.value;
                this._prismBase2LeftSelected = event.target.value;
            }
            this._prescriptionData[PRESCRIPTION_UPDATED] = true;
        } else {
            this._prescriptionData[event.target.name] = null;
        }
    }

    /**
     * this method will save the entered user input to database.
     * BS-725
     */
    @api
    async savePrescriptionValue() {
        this._prescriptionData = decimalAppendedPrescriptionValues(this._prescriptionData, this.inputFieldsNameList);
        if (this._lensTypeValue == PANORMA_SINGLE_VISION) {
            if (this._prescriptionData && this._prescriptionData['leftaddition']) {
                this._prescriptionData['leftaddition'] = null;
            }
            if (this._prescriptionData && this._prescriptionData['rightaddition']) {
                this._prescriptionData['rightaddition'] = null;
            }
        }
        // BS-2508
        else if (this._lensTypeValue == PANORAMA_RELAX) {
            if (this._selectedEyeSideValue == this._eyeSideValues[0].value) {
                if (this._prescriptionData && this._prescriptionData['leftaddition']) {
                    this._prescriptionData['leftaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
                if (this._prescriptionData && this._prescriptionData['rightaddition']) {
                    this._prescriptionData['rightaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
            } else if (this._selectedEyeSideValue == this._eyeSideValues[1].value) {
                if (this._prescriptionData && this._prescriptionData['leftaddition']) {
                    this._prescriptionData['leftaddition'] = null;
                }
                if (this._prescriptionData && this._prescriptionData['rightaddition']) {
                    this._prescriptionData['rightaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
            } else if (this._selectedEyeSideValue == this._eyeSideValues[2].value) {
                if (this._prescriptionData && this._prescriptionData['leftaddition']) {
                    this._prescriptionData['leftaddition'] = this.lensConfiguratorCollection.relaxVersion;
                }
                if (this._prescriptionData && this._prescriptionData['rightaddition']) {
                    this._prescriptionData['rightaddition'] = null;
                }
            }
        }
        let isSuccess = false;
        await savePrescriptionData({
            customerInputMap: this._prescriptionData,
            lensConfiguratorId: this.lensConfiguratorId,
            eyeSide: this._selectedEyeSideValue,
            baseValue: this._selectedBaseValue
        }).then((result) => {
            isSuccess = true;
            this.dispatchEvent(
                new CustomEvent(PRESCRIPTION_VALUE_UPDATE, {
                    detail: {
                        prescriptionSelectionCollection: this._prescriptionData,
                        eyeSide: this._selectedEyeSideValue,
                        baseValue: this._selectedBaseValue
                    }
                })
            );
        });
        return isSuccess;
    }

    @api
    validateInput(event) {
        /** BS-1443 : Added the currentInputBox and send the value to validation methods of utility */
        let currentInputBox;
        if (event !== undefined && event !== null && event.target.name !== undefined && event.target.name !== null) {
            currentInputBox = event.target.name;
        }
        let isValid = true;
        if (this._selectedEyeSideValue == this._eyeSideValues[0].value && this._selectedBaseValue == this._baseValues[0].value) {
            isValid = validateRightLeftNoPrismConditionValues(
                this._prescriptionData,
                this._prescriptionFieldsData,
                this.template,
                this.labels,
                this._lensTypeValue,
                currentInputBox
            );
            if (currentInputBox == PRESCRIPTION_DATA) {
                this._prescriptionData = this.setRequiredValuesToSave(RIGHT_LEFT_NO_PRISM_VALUES);
            } //BS-1632
        } else if (this._selectedEyeSideValue == this._eyeSideValues[1].value && this._selectedBaseValue == this._baseValues[0].value) {
            isValid = validateRightNoPrismConditionValues(
                this._prescriptionData,
                this._prescriptionFieldsData,
                this.template,
                this.labels,
                this._lensTypeValue,
                currentInputBox
            );
            if (currentInputBox == PRESCRIPTION_DATA) {
                this._prescriptionData = this.setRequiredValuesToSave(RIGHT_NO_PRISM_VALUES);
            } //BS-1632
        } else if (this._selectedEyeSideValue == this._eyeSideValues[2].value && this._selectedBaseValue == this._baseValues[0].value) {
            isValid = validateLefttNoPrismConditionValues(
                this._prescriptionData,
                this._prescriptionFieldsData,
                this.template,
                this.labels,
                this._lensTypeValue,
                currentInputBox
            );
            if (currentInputBox == PRESCRIPTION_DATA) {
                this._prescriptionData = this.setRequiredValuesToSave(LEFT_NO_PRISM_VALUES);
            } //BS-1632
        } else if (this._selectedEyeSideValue == this._eyeSideValues[0].value && this._selectedBaseValue == this._baseValues[1].value) {
            isValid = validateRightLeftDegreeConditionValues(
                this._prescriptionData,
                this._prescriptionFieldsData,
                this.template,
                this.labels,
                this._lensTypeValue,
                currentInputBox
            );
            if (currentInputBox == PRESCRIPTION_DATA) {
                this._prescriptionData = this.setRequiredValuesToSave(RIGHT_LEFT_DEGREE_VALUES);
            } //BS-1632
        } else if (this._selectedEyeSideValue == this._eyeSideValues[0].value && this._selectedBaseValue == this._baseValues[2].value) {
            isValid = validateRightLeftHorizontalVerticalConditionValues(
                this._prescriptionData,
                this._prescriptionFieldsData,
                this.template,
                this.labels,
                this._lensTypeValue,
                currentInputBox
            );
            if (currentInputBox == PRESCRIPTION_DATA) {
                this._prescriptionData = this.setRequiredValuesToSave(RIGHT_LEFT_HORIZONTAL_VERTICAL_VALUES);
            } //BS-1632
        } else if (this._selectedEyeSideValue == this._eyeSideValues[1].value && this._selectedBaseValue == this._baseValues[1].value) {
            isValid = validateRightDegreeConditionValues(
                this._prescriptionData,
                this._prescriptionFieldsData,
                this.template,
                this.labels,
                this._lensTypeValue,
                currentInputBox
            );
            if (currentInputBox == PRESCRIPTION_DATA) {
                this._prescriptionData = this.setRequiredValuesToSave(RIGHT_DEGREE_VALUES);
            } //BS-1632
        } else if (this._selectedEyeSideValue == this._eyeSideValues[1].value && this._selectedBaseValue == this._baseValues[2].value) {
            isValid = validateRightHorizontalVerticalConditionValues(
                this._prescriptionData,
                this._prescriptionFieldsData,
                this.template,
                this.labels,
                this._lensTypeValue,
                currentInputBox
            );
            if (currentInputBox == PRESCRIPTION_DATA) {
                this._prescriptionData = this.setRequiredValuesToSave(RIGHT_HORIZONTAL_VERTICAL_VALUES);
            } //BS-1632
        } else if (this._selectedEyeSideValue == this._eyeSideValues[2].value && this._selectedBaseValue == this._baseValues[1].value) {
            isValid = validateLeftDegreeConditionValues(
                this._prescriptionData,
                this._prescriptionFieldsData,
                this.template,
                this.labels,
                this._lensTypeValue,
                currentInputBox
            );
            if (currentInputBox == PRESCRIPTION_DATA) {
                this._prescriptionData = this.setRequiredValuesToSave(LEFT_DEGREE_VALUES);
            } //BS-1632
        } else if (this._selectedEyeSideValue == this._eyeSideValues[2].value && this._selectedBaseValue == this._baseValues[2].value) {
            isValid = validateLeftHorizontalVerticalConditionValues(
                this._prescriptionData,
                this._prescriptionFieldsData,
                this.template,
                this.labels,
                this._lensTypeValue,
                currentInputBox
            );
            if (currentInputBox == PRESCRIPTION_DATA) {
                this._prescriptionData = this.setRequiredValuesToSave(LEFT_HORIZONTAL_VERTICAL_VALUES);
            } //BS-1632
        }
        //BS-2139: for strongest maincut error
        if (currentInputBox == PRESCRIPTION_DATA) {
            this._showStrongestMaincut = false;
            if (
                (this._selectedEyeSideValue == this._eyeSideValues[0].value || this._selectedEyeSideValue == this._eyeSideValues[1].value) &&
                this._prescriptionData[RIGHT_SPHERE] != null &&
                this._prescriptionData[RIGHT_CYLINDER] != null
            ) {
                if (
                    this._prescriptionFieldsData[0].B2B_Sphere_Min_Allowed__c >
                        Number(this._prescriptionData[RIGHT_SPHERE]) + Number(this._prescriptionData[RIGHT_CYLINDER]) ||
                    this._prescriptionFieldsData[0].B2B_Sphere_Max_Allowed__c <
                        Number(this._prescriptionData[RIGHT_SPHERE]) + Number(this._prescriptionData[RIGHT_CYLINDER])
                ) {
                    isValid = false;
                    this._showStrongestMaincut = true;
                    this._showRightStrongestMaincut = true;
                } else {
                    this._showRightStrongestMaincut = false;
                }
            }
            if (
                (this._selectedEyeSideValue == this._eyeSideValues[0].value || this._selectedEyeSideValue == this._eyeSideValues[2].value) &&
                this._prescriptionData[LEFT_SPHERE] != null &&
                this._prescriptionData[LEFT_CYLINDER] != null
            ) {
                if (
                    this._prescriptionFieldsData[0].B2B_Sphere_Min_Allowed__c >
                        Number(this._prescriptionData[LEFT_SPHERE]) + Number(this._prescriptionData[LEFT_CYLINDER]) ||
                    this._prescriptionFieldsData[0].B2B_Sphere_Max_Allowed__c <
                        Number(this._prescriptionData[LEFT_SPHERE]) + Number(this._prescriptionData[LEFT_CYLINDER])
                ) {
                    isValid = false;
                    this._showLeftStrongestMaincut = true;
                    this._showStrongestMaincut = true;
                } else {
                    this._showLeftStrongestMaincut = false;
                }
            }
        } //BS-2139 end
        return isValid;
    }

    /**
     * This Method is used to handle event fired on click of edit icon by user on UI
     * BS-1054
     */
    @api
    async handlePrescriptionValueEdit(event) {
        if (this._isReadOnly == true) {
            this._isReadOnly = false;
            await this.setInputValuesOnPencilIconClick(this.lensConfiguratorCollection);
            this.fireUpdateProgressBar(7, true, false);
        }
    }

    /**
     * This Method is used to handle the mode of the component visibility
     * BS-1054
     */
    @api
    setupComponentMode(componentMode) {
        if (componentMode != null && componentMode != undefined) {
            if (componentMode == EDIT_MODE) {
                this._isReadOnly = false; //If component mode is Edit mode, setting up property: _isReadOnly to false
            } else if (componentMode == READ_ONLY_MODE) {
                this._isReadOnly = true; //If component mode is Read only mode, setting up property: _isReadOnly to true
            }
        }
    }

    /**
     * This Method is used to handle the custom event fired from child to container
     * BS-1054
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
     * This Method is used to handle the enabling and disabling of the input fields depending on the selection of
     * eye-side and base value.
     * BS-1054
     */
    @api
    async setOnloadInputFieldAttributes() {
        this._globalSelectionArray = await setOnloadInputFieldAttributes(
            this.inputFieldsNameList,
            this.lensConfiguratorCollection,
            this._prismBase1RightSelected,
            this._prismBase2RightSelected,
            this._prismBase1LeftSelected,
            this._prismBase2LeftSelected,
            this._prismBase1Values,
            this._prismBase1LeftValues,
            this._prismBase2Values,
            this._lensTypeValue
        );
        if (this._globalSelectionArray.length !== 0) {
            if (this.lensConfiguratorCollection) {
                if (this.lensConfiguratorCollection.eyeSide == RIGHT_LEFT_EYESIDE && this.lensConfiguratorCollection.baseValue == NO_PRISM_BASEVALUE) {
                    this.setDefaultInputFieldAttributes();
                    this._prescriptionData['rightprismbase2radio'] = null;
                    this._prescriptionData['rightprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase2radio'] = null;
                }
                if (this.lensConfiguratorCollection.eyeSide == RIGHT_EYESIDE && this.lensConfiguratorCollection.baseValue == NO_PRISM_BASEVALUE) {
                    this.setRightLensNoPrismInputFieldAttributes();
                    this._prescriptionData['rightprismbase2radio'] = null;
                    this._prescriptionData['rightprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase2radio'] = null;
                }
                if (this.lensConfiguratorCollection.eyeSide == LEFT_EYESIDE && this.lensConfiguratorCollection.baseValue == NO_PRISM_BASEVALUE) {
                    this.setLeftLensNoPrismInputFieldAttributes();
                    this._prescriptionData['rightprismbase2radio'] = null;
                    this._prescriptionData['rightprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase2radio'] = null;
                }
                if (this.lensConfiguratorCollection.eyeSide == RIGHT_LEFT_EYESIDE && this.lensConfiguratorCollection.baseValue == IN_DEGREE_BASEVALUE) {
                    this.setRightLeftLensInDegreesInputFieldAttributes();
                    this._prescriptionData['rightprismbase2radio'] = null;
                    this._prescriptionData['rightprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase2radio'] = null;
                }
                if (this.lensConfiguratorCollection.eyeSide == RIGHT_EYESIDE && this.lensConfiguratorCollection.baseValue == IN_DEGREE_BASEVALUE) {
                    this.setRightLensInDegreesInputFieldAttributes();
                    this._prescriptionData['rightprismbase2radio'] = null;
                    this._prescriptionData['rightprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase2radio'] = null;
                }
                if (this.lensConfiguratorCollection.eyeSide == LEFT_EYESIDE && this.lensConfiguratorCollection.baseValue == IN_DEGREE_BASEVALUE) {
                    this.setLeftLensInDegreesInputFieldAttributes();
                    this._prescriptionData['rightprismbase2radio'] = null;
                    this._prescriptionData['rightprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase2radio'] = null;
                }
                if (this.lensConfiguratorCollection.eyeSide == RIGHT_LEFT_EYESIDE && this.lensConfiguratorCollection.baseValue == HOR_VERT_BASEVALUE) {
                    this._prescriptionData['rightprismbase2radio'] = this._prismBase2RightSelected;
                    this._prescriptionData['rightprismbase1radio'] = this._prismBase1RightSelected;
                    this._prescriptionData['leftprismbase1radio'] = this._prismBase1LeftSelected;
                    this._prescriptionData['leftprismbase2radio'] = this._prismBase2LeftSelected;
                    this.setRightLeftLensHorVertInputFieldAttributes();
                }
                if (this.lensConfiguratorCollection.eyeSide == RIGHT_EYESIDE && this.lensConfiguratorCollection.baseValue == HOR_VERT_BASEVALUE) {
                    this._prescriptionData['rightprismbase2radio'] = this._prismBase2RightSelected;
                    this._prescriptionData['rightprismbase1radio'] = this._prismBase1RightSelected;
                    this._prescriptionData['leftprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase2radio'] = null;
                    this.setRightLensHorizontalVerticalInputFieldAttributes();
                }
                if (this.lensConfiguratorCollection.eyeSide == LEFT_EYESIDE && this.lensConfiguratorCollection.baseValue == HOR_VERT_BASEVALUE) {
                    this._prescriptionData['rightprismbase2radio'] = null;
                    this._prescriptionData['rightprismbase1radio'] = null;
                    this._prescriptionData['leftprismbase1radio'] = this._prismBase1LeftSelected;
                    this._prescriptionData['leftprismbase2radio'] = this._prismBase2LeftSelected;
                    this.setLeftLensHorizontalVerticalInputFieldAttributes();
                }
            }
            this.setPrescriptionData(this.lensConfiguratorCollection);
        }
    }

    /**
     * This Method is used to set the attributes of the input fields when the eyeside is 'right and left lens side'
     * and base value is 'No Prism'
     * BS-1054
     */
    setDefaultInputFieldAttributes() {
        let parsedArray = setDefaultInputFieldAttributes(
            this._globalSelectionArray,
            this.lensConfiguratorCollection,
            this._prismBase1RightSelected,
            this._prismBase2RightSelected,
            this._prismBase1LeftSelected,
            this._prismBase2LeftSelected,
            this._prismBase1Values,
            this._prismBase1LeftValues,
            this._prismBase2Values,
            this._lensTypeValue
        );
        this._globalSelectionArray = JSON.parse(JSON.stringify(parsedArray));
    }

    /**
     * This Method is used to set the attributes of the input fields when the eyeside is 'right lens'
     * and base value is 'No Prism'
     * BS-1054
     */
    setRightLensNoPrismInputFieldAttributes() {
        let parsedArray = setRightLensNoPrismInputFieldAttributes(
            this._globalSelectionArray,
            this.lensConfiguratorCollection,
            this._prismBase1RightSelected,
            this._prismBase2RightSelected,
            this._prismBase1LeftSelected,
            this._prismBase2LeftSelected,
            this._prismBase1Values,
            this._prismBase1LeftValues,
            this._prismBase2Values,
            this._lensTypeValue
        );
        this._globalSelectionArray = JSON.parse(JSON.stringify(parsedArray));
    }

    /**
     * This Method is used to set the attributes of the input fields when the eyeside is 'left lens'
     * and base value is 'No Prism'
     * BS-1054
     */
    setLeftLensNoPrismInputFieldAttributes() {
        let parsedArray = setLeftLensNoPrismInputFieldAttributes(
            this._globalSelectionArray,
            this.lensConfiguratorCollection,
            this._prismBase1RightSelected,
            this._prismBase2RightSelected,
            this._prismBase1LeftSelected,
            this._prismBase2LeftSelected,
            this._prismBase1Values,
            this._prismBase1LeftValues,
            this._prismBase2Values,
            this._lensTypeValue
        );
        this._globalSelectionArray = JSON.parse(JSON.stringify(parsedArray));
    }

    /**
     * This Method is used to set the attributes of the input fields when the eyeside is 'right and left lens side'
     * and base value is 'In Degrees'
     * BS-1054
     */
    setRightLeftLensInDegreesInputFieldAttributes() {
        let parsedArray = setRightLeftLensInDegreesInputFieldAttributes(
            this._globalSelectionArray,
            this._prescriptionData,
            this.lensConfiguratorCollection,
            this._prismBase1RightSelected,
            this._prismBase2RightSelected,
            this._prismBase1LeftSelected,
            this._prismBase2LeftSelected,
            this._prismBase1Values,
            this._prismBase1LeftValues,
            this._prismBase2Values,
            this._lensTypeValue
        );
        this._globalSelectionArray = JSON.parse(JSON.stringify(parsedArray));
    }

    /**
     * This Method is used to set the attributes of the input fields when the eyeside is 'right lens'
     * and base value is 'In Degrees'
     * BS-1054
     */
    setRightLensInDegreesInputFieldAttributes() {
        let parsedArray = setRightLensInDegreesInputFieldAttributes(
            this._globalSelectionArray,
            this._prescriptionData,
            this.lensConfiguratorCollection,
            this._prismBase1RightSelected,
            this._prismBase2RightSelected,
            this._prismBase1LeftSelected,
            this._prismBase2LeftSelected,
            this._prismBase1Values,
            this._prismBase1LeftValues,
            this._prismBase2Values,
            this._lensTypeValue
        );
        this._globalSelectionArray = JSON.parse(JSON.stringify(parsedArray));
    }

    /**
     * This Method is used to set the attributes of the input fields when the eyeside is 'left lens'
     * and base value is 'In Degrees'
     * BS-1054
     */
    setLeftLensInDegreesInputFieldAttributes() {
        let parsedArray = setLeftLensInDegreesInputFieldAttributes(
            this._globalSelectionArray,
            this._prescriptionData,
            this.lensConfiguratorCollection,
            this._prismBase1RightSelected,
            this._prismBase2RightSelected,
            this._prismBase1LeftSelected,
            this._prismBase2LeftSelected,
            this._prismBase1Values,
            this._prismBase1LeftValues,
            this._prismBase2Values,
            this._lensTypeValue
        );
        this._globalSelectionArray = JSON.parse(JSON.stringify(parsedArray));
    }

    /**
     * This Method is used to set the attributes of the input fields when the eyeside is 'right and left lens side'
     * and base value is 'Horizontal / Vertical'
     * BS-1054
     */
    setRightLeftLensHorVertInputFieldAttributes() {
        let parsedArray = setRightLeftLensHorVertInputFieldAttributes(
            this._globalSelectionArray,
            this.lensConfiguratorCollection,
            this._prismBase1RightSelected,
            this._prismBase2RightSelected,
            this._prismBase1LeftSelected,
            this._prismBase2LeftSelected,
            this.prismBase1Values,
            this._prismBase1LeftValues,
            this.prismBase2Values,
            this._lensTypeValue
        );
        this._globalSelectionArray = JSON.parse(JSON.stringify(parsedArray));
    }

    /**
     * This Method is used to set the attributes of the input fields when the eyeside is 'right lens'
     * and base value is 'Horizontal / Vertical'
     * BS-1054
     */
    setRightLensHorizontalVerticalInputFieldAttributes() {
        let parsedArray = setRightLensHorizontalVerticalInputFieldAttributes(
            this._globalSelectionArray,
            this.lensConfiguratorCollection,
            this._prismBase1RightSelected,
            this._prismBase2RightSelected,
            this._prismBase1LeftSelected,
            this._prismBase2LeftSelected,
            this._prismBase1Values,
            this._prismBase1LeftValues,
            this._prismBase2Values,
            this._lensTypeValue
        );
        this._globalSelectionArray = JSON.parse(JSON.stringify(parsedArray));
    }

    /**
     * This Method is used to set the attributes of the input fields when the eyeside is 'left lens'
     * and base value is 'Horizontal / Vertical'
     * BS-1054
     */
    setLeftLensHorizontalVerticalInputFieldAttributes() {
        let parsedArray = setLeftLensHorizontalVerticalInputFieldAttributes(
            this._globalSelectionArray,
            this.lensConfiguratorCollection,
            this._prismBase1RightSelected,
            this._prismBase2RightSelected,
            this._prismBase1LeftSelected,
            this._prismBase2LeftSelected,
            this._prismBase1Values,
            this._prismBase1LeftValues,
            this._prismBase2Values,
            this._lensTypeValue
        );
        this._globalSelectionArray = JSON.parse(JSON.stringify(parsedArray));
    }

    /**
     * This Method is used to reset the attributes of the input fields on change of the user selection of
     * eye side and base value
     * BS-1054
     */
    resetSelectedValues() {
        const userInputs = this.template.querySelectorAll('[data-type="user-input"]');
        if (userInputs.length != 0) {
            userInputs.forEach((input) => {
                input.setCustomValidity('');
                input.reportValidity();
            });
        }
    }

    /**
     * This Method is used to set the prescription data values on load of the component to persist the values in edit mode
     * fetched from the lens configurator object
     * BS-1054
     */
    setPrescriptionData(lensConfiguratorCollection) {
        if (lensConfiguratorCollection != null && lensConfiguratorCollection != undefined) {
            this.inputFieldsNameList.forEach((inputFieldName) => {
                if (lensConfiguratorCollection[inputFieldName]) {
                    this._prescriptionData[inputFieldName] = lensConfiguratorCollection[inputFieldName];
                }
            });
        }
        this.savePrescriptionValue();
    }

    /**
     * This Method is used to set the prescription data values on load of the component to persist the values in edit mode
     * fetched from the lens configurator object
     * BS-1054
     */
    setInputValuesOnPencilIconClick(event) {
        this.setOnloadInputFieldAttributes();
    }

    /**
     * this method handles the default selection of the prism base radio buttons.
     * BS-1054
     */
    setDefaultPrismBaseRadioValues() {
        const userInputs = this.template.querySelectorAll('[data-type="user-input"]');
        if (userInputs.length != 0) {
            userInputs.forEach((input) => {
                if (input.name == 'rightprismbase1radio') {
                    input.value = this._prismBase1RightSelected;
                } else if (input.name == 'rightprismbase2radio') {
                    input.value = this._prismBase2RightSelected;
                } else if (input.name == 'leftprismbase1radio') {
                    input.value = this._prismBase1LeftSelected;
                } else if (input.name == 'leftprismbase2radio') {
                    input.value = this._prismBase2LeftSelected;
                }
            });
        }
    }

    /**
     * this method handles the formating of the comma to dot and dot to comma as per the current language of the user.
     * BS-1054
     */
    setCommaToDot() {
        const userInputs = this.template.querySelectorAll('[data-type="user-input"]');
        if (userInputs.length != 0) {
            userInputs.forEach((input) => {
                //BS-1799 Removed hardcoded language checks
                if (LANG == 'de' && input.value) {
                    input.value = input.value.replace('.', ',');
                } else {
                    input.value = input.value.replace(/,/g, '.');
                }
            });
        }
    }
    /**
     * this method removes un-necessary values to save prescription values.
     * BS-1632
     */
    setRequiredValuesToSave(fields) {
        let requiredPrescriptionFields = fields.split(';');
        let requiredPrescriptionData = {};
        requiredPrescriptionFields.forEach((field) => {
            requiredPrescriptionData[field] =
                this._prescriptionData[field] != undefined && this._prescriptionData[field] != null ? this._prescriptionData[field] : null;
        });
        return requiredPrescriptionData;
    }
}
