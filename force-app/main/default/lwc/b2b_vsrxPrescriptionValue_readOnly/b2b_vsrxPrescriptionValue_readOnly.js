import { LightningElement, api, track } from 'lwc';
import LANG from '@salesforce/i18n/lang';

import getPicklistValuesForVSRX from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFieldPicklistValues'; //BS-1054

const RIGHT_PB1FIELD = 'B2B_PB1Placement_Right__c'; // BS-1054
const LEFT_PB1FIELD = 'B2B_PB1Placement_Left__c'; //BS-1129
const PB2FIELD = 'B2B_PB2Placement_Right__c'; // BS-1054
const RIGHT_ADDITION = 'rightaddition';
const LEFT_ADDITION = 'leftaddition';
const PB1_PLACEMENT_IN = 'In'; //BS-1129
const PB1_PLACEMENT_OUT = 'Out'; //BS-1129

export default class B2b_vs_rx_prescriptionValue_readOnly extends LightningElement {
    @api
    labels;
    @api
    selectedEyeSideValue;
    @api
    selectedBaseValue;
    @api
    prescriptionData;
    @api
    prescriptionFieldData;
    @api
    allColumnsNameList;
    @track
    prescriptionFieldReadOnlyData = {};
    @track
    prescriptionFieldReadOnlyDataClone = {};
    @track
    prismBaseRadioValueVsLabelMap = new Map();

    /**
     * Connected call back to invoke the methods
     * BS-1054
     */
    connectedCallback() {
        this.getPrismBase1Values();
    }

    /**
     * This method fills the columns with the data as stored in the lens configurator.
     * BS-1054
     */
    setReadOnlyDataForPrescriptionValue() {
        this.prescriptionFieldReadOnlyDataClone = JSON.parse(JSON.stringify(this.prescriptionData));
        this.allColumnsNameList.forEach((columnName) => {
            //BS-1799 Removed hardcoded language checks
            if (LANG == 'de') {
                if (this.prescriptionFieldReadOnlyDataClone[columnName] != undefined && this.prescriptionFieldReadOnlyDataClone[columnName] != null) {
                    this.prescriptionFieldReadOnlyDataClone[columnName] = this.prescriptionFieldReadOnlyDataClone[columnName]
                        ? this.prescriptionFieldReadOnlyDataClone[columnName].toString().replace('.', ',')
                        : ''; //BS-1129
                }
            } else {
                this.prescriptionFieldReadOnlyDataClone[columnName] = this.prescriptionFieldReadOnlyDataClone[columnName]
                    ? this.prescriptionFieldReadOnlyDataClone[columnName].toString().replace(',', '.')
                    : ''; //BS-1129
            }

            if (columnName == 'rightsphere') {
                this.prescriptionFieldReadOnlyData.rightSphereValue =
                    this.prescriptionData.rightsphere != null && this.prescriptionData.rightsphere != undefined ? this.prescriptionData.rightsphere : '';
            } else if (columnName == 'rightcylinder') {
                this.prescriptionFieldReadOnlyData.rightCylinderValue =
                    this.prescriptionData.rightcylinder != null && this.prescriptionData.rightcylinder != undefined ? this.prescriptionData.rightcylinder : '';
            } else if (columnName == 'rightaxis') {
                this.prescriptionFieldReadOnlyData.rightAxisValue =
                    this.prescriptionData.rightaxis != null && this.prescriptionData.rightaxis != undefined ? this.prescriptionData.rightaxis : '';
            } else if (columnName == RIGHT_ADDITION) {
                this.prescriptionFieldReadOnlyData.rightaddition =
                    this.prescriptionData.rightaddition != null && this.prescriptionData.rightaddition != undefined ? this.prescriptionData.rightaddition : '';
            } else if (columnName == 'rightprism1') {
                this.prescriptionFieldReadOnlyData.rightPrism1Value =
                    this.prescriptionData.rightprism1 != null && this.prescriptionData.rightprism1 != undefined ? this.prescriptionData.rightprism1 : '';
            } else if (
                columnName == 'rightprismbase1' &&
                (this.prescriptionData.rightprismbase1radio == null ||
                    this.prescriptionData.rightprismbase1radio == undefined ||
                    this.prescriptionData.rightprismbase1radio == '')
            ) {
                this.prescriptionFieldReadOnlyData.showRightPrismBase1Value = true;
                this.prescriptionFieldReadOnlyData.rightPrismBase1Value =
                    this.prescriptionData.rightprismbase1 != null && this.prescriptionData.rightprismbase1 != undefined
                        ? this.prescriptionData.rightprismbase1
                        : '';
            } else if (
                columnName == 'rightprismbase1radio' &&
                (this.prescriptionData.rightprismbase1 == null ||
                    this.prescriptionData.rightprismbase1 == undefined ||
                    this.prescriptionData.rightprismbase1 == '')
            ) {
                // BS-1129 START
                this.prescriptionFieldReadOnlyData.showRightPrismBase1Value =
                    this.prescriptionData.rightprismbase1radio != null && this.prescriptionData.rightprismbase1radio != undefined ? false : true;

                if (this.prescriptionData.rightprismbase1radio != undefined && this.prescriptionData.rightprismbase1radio != null) {
                    if (this.prescriptionData.rightprismbase1radio == PB1_PLACEMENT_IN) {
                        this.prescriptionFieldReadOnlyDataClone.rightprismbase1radio = this.prismBase1LabelValues[0];
                    } else if (this.prescriptionData.rightprismbase1radio == PB1_PLACEMENT_OUT) {
                        this.prescriptionFieldReadOnlyDataClone.rightprismbase1radio = this.prismBase1LabelValues[1];
                    } //BS-1129 END
                }
            } else if (columnName == 'rightprism2') {
                this.prescriptionFieldReadOnlyData.rightPrism2Value =
                    this.prescriptionData.rightprism2 != null && this.prescriptionData.rightprism2 != undefined ? this.prescriptionData.rightprism2 : '';
            } else if (
                columnName == 'rightprismbase2' &&
                (this.prescriptionData.rightprismbase2radio == null ||
                    this.prescriptionData.rightprismbase2radio == undefined ||
                    this.prescriptionData.rightprismbase2radio == '')
            ) {
                this.prescriptionFieldReadOnlyData.showRightPrismBse2Value = true;
                this.prescriptionFieldReadOnlyData.rightPrismBse2Value =
                    this.prescriptionData.rightprismbase2 != null && this.prescriptionData.rightprismbase2 != undefined
                        ? this.prescriptionData.rightprismbase2
                        : '';
            }
            if (
                columnName == 'rightprismbase2radio' &&
                (this.prescriptionData.rightprismbase2 == null ||
                    this.prescriptionData.rightprismbase2 == undefined ||
                    this.prescriptionData.rightprismbase2 == '')
            ) {
                if (this.prismBaseRadioValueVsLabelMap.has(this.prescriptionData.rightprismbase2radio)) {
                    this.prescriptionFieldReadOnlyData.showRightPrismBse2Value =
                        this.prescriptionData.rightprismbase2radio != null && this.prescriptionData.rightprismbase2radio != undefined ? false : true;
                    this.prescriptionFieldReadOnlyDataClone.rightprismbase2radio =
                        this.prescriptionData.rightprismbase2radio != null && this.prescriptionData.rightprismbase2radio != undefined
                            ? this.prismBaseRadioValueVsLabelMap.get(this.prescriptionData.rightprismbase2radio)
                            : '';
                }
            } else if (columnName == 'leftsphere') {
                this.prescriptionFieldReadOnlyData.leftSphereValue =
                    this.prescriptionData.leftsphere != null && this.prescriptionData.leftsphere != undefined ? this.prescriptionData.leftsphere : '';
            }
            if (columnName == 'leftcylinder') {
                this.prescriptionFieldReadOnlyData.leftCylinderValue =
                    this.prescriptionData.leftcylinder != null && this.prescriptionData.leftcylinder != undefined ? this.prescriptionData.leftcylinder : '';
            } else if (columnName == 'leftaxis') {
                this.prescriptionFieldReadOnlyData.leftAxisValue =
                    this.prescriptionData.leftaxis != null && this.prescriptionData.leftaxis != undefined ? this.prescriptionData.leftaxis : '';
            } else if (columnName == LEFT_ADDITION) {
                this.prescriptionFieldReadOnlyData.leftaddition =
                    this.prescriptionData.leftaddition != null && this.prescriptionData.leftaddition != undefined ? this.prescriptionData.leftaddition : '';
            } else if (columnName == 'leftprism1') {
                this.prescriptionFieldReadOnlyData.leftPrism1Value =
                    this.prescriptionData.leftprism1 != null && this.prescriptionData.leftprism1 != undefined ? this.prescriptionData.leftprism1 : '';
            } else if (
                columnName == 'leftprismbase1' &&
                (this.prescriptionData.leftprismbase1radio == null ||
                    this.prescriptionData.leftprismbase1radio == undefined ||
                    this.prescriptionData.leftprismbase1radio == '')
            ) {
                this.prescriptionFieldReadOnlyData.showLeftPrismBase1Value = true;
                this.prescriptionFieldReadOnlyData.leftPrismBase1Value =
                    this.prescriptionData.leftprismbase1 != null && this.prescriptionData.leftprismbase1 != undefined
                        ? this.prescriptionData.leftprismbase1
                        : '';
            } else if (
                columnName == 'leftprismbase1radio' &&
                (this.prescriptionData.leftprismbase1 == null ||
                    this.prescriptionData.leftprismbase1 == undefined ||
                    this.prescriptionData.leftprismbase1 == '')
            ) {
                if (this.prismBaseRadioValueVsLabelMap.has(this.prescriptionData.leftprismbase1radio)) {
                    this.prescriptionFieldReadOnlyData.showLeftPrismBase1Value =
                        this.prescriptionData.leftprismbase1radio != null && this.prescriptionData.leftprismbase1radio != undefined ? false : true;
                    this.prescriptionFieldReadOnlyData.showLeftPrismBase1RadioValue = true;
                    this.prescriptionFieldReadOnlyDataClone.leftprismbase1radio =
                        this.prescriptionData.leftprismbase1radio != null && this.prescriptionData.leftprismbase1radio != undefined
                            ? this.prismBaseRadioValueVsLabelMap.get(this.prescriptionData.leftprismbase1radio)
                            : '';
                }
            } else if (columnName == 'leftprism2') {
                this.prescriptionFieldReadOnlyData.leftPrism2Value =
                    this.prescriptionData.leftprism2 != null && this.prescriptionData.leftprism2 != undefined ? this.prescriptionData.leftprism2 : '';
            } else if (
                columnName == 'leftprismbase2' &&
                (this.prescriptionData.leftprismbase2radio == null ||
                    this.prescriptionData.leftprismbase2radio == undefined ||
                    this.prescriptionData.leftprismbase2radio == '')
            ) {
                this.prescriptionFieldReadOnlyData.showLeftPrismBase2Value = true;
                this.prescriptionFieldReadOnlyData.showLeftPrismBase2RadioValue = false;
                this.prescriptionFieldReadOnlyData.leftPrismBase2Value =
                    this.prescriptionData.leftprismbase2 != null && this.prescriptionData.leftprismbase2 != undefined
                        ? this.prescriptionData.leftprismbase2
                        : '';
            }
            if (
                columnName == 'leftprismbase2radio' &&
                (this.prescriptionData.leftprismbase2 == null ||
                    this.prescriptionData.leftprismbase2 == undefined ||
                    this.prescriptionData.leftprismbase2 == '')
            ) {
                if (this.prismBaseRadioValueVsLabelMap.has(this.prescriptionData.leftprismbase2radio)) {
                    this.prescriptionFieldReadOnlyData.showLeftPrismBase2Value =
                        this.prescriptionData.leftprismbase2radio != null && this.prescriptionData.leftprismbase2radio != undefined ? false : true;
                    this.prescriptionFieldReadOnlyData.showLeftPrismBase2RadioValue = true;
                    this.prescriptionFieldReadOnlyDataClone.leftprismbase2radio =
                        this.prescriptionData.leftprismbase2radio != null && this.prescriptionData.leftprismbase2radio != undefined
                            ? this.prismBaseRadioValueVsLabelMap.get(this.prescriptionData.leftprismbase2radio)
                            : '';
                }
            }
        });
    }

    prismBase1LabelValues = []; //BS-1129

    /**
     * This method get the available values of the Prism base 1 (Right Eye) field and fills the map
     * with apiname as key and label as its value.
     * BS-1054
     */
    getPrismBase1Values() {
        getPicklistValuesForVSRX({ objectApiName: 'B2B_Lens_Configurator__c', picklistField: RIGHT_PB1FIELD })
            .then((data) => {
                data.picklistValues.forEach((item) => {
                    let object = {
                        label: item.picklistValue,
                        value: item.apiName
                    };
                    this.prismBase1LabelValues.push(item.picklistValue); //BS-1129
                    this.prismBaseRadioValueVsLabelMap.set(item.apiName, item.picklistValue);
                });
                this.getPrismBase1LeftValues();
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
            });
    }
    /**
     * This method get the available values of the Prism base 1 (Left Eye) field and fills the map
     * with apiname as key and label as its value.
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
                    this.prismBaseRadioValueVsLabelMap.set(item.apiName, item.picklistValue);
                });
                this.getPrismBase2Values();
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
            });
    }

    /**
     * This method get the available values of the Prism base 2 field and fills the map
     * with apiname as key and label as its value.
     * BS-1054
     */
    getPrismBase2Values() {
        getPicklistValuesForVSRX({ objectApiName: 'B2B_Lens_Configurator__c', picklistField: PB2FIELD })
            .then((data) => {
                data.picklistValues.forEach((item) => {
                    let object = {
                        label: item.picklistValue,
                        value: item.apiName
                    };
                    this.prismBaseRadioValueVsLabelMap.set(item.apiName, item.picklistValue);
                });
                this.setReadOnlyDataForPrescriptionValue();
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
            });
    }
}
