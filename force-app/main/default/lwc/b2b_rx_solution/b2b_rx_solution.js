import { LightningElement, track, api } from 'lwc';

//LANGUAGE
import LANG from '@salesforce/i18n/lang';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-655
//Apex methods Callouts
import getRXSolutionDataOfSelectedFrame from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getSelectedFrameRelatedRXSolutionData';
import getRXTypesForSelectedSolution from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getRXTypesForSelectedSolution';
import updateLensConfiguratorData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.updateLensConfiguratorData';
import getCategoryTranslations from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getCategoryTranslations';

//GET LABELS
import B2B_RX_Solution_Type_Labels from '@salesforce/label/c.B2B_RX_Solution_Type';
import B2B_RX_Solution_Header_Labels from '@salesforce/label/c.B2B_RX_Solution_Header';
import B2B_Error_Message_Label from '@salesforce/label/c.B2B_VS_RX_Error_Message';
import B2B_Color_Value_For_Clip_In from '@salesforce/label/c.B2B_RX_Solution_Color_Value_For_ClipIn'; //BS-1116
import B2B_Lens_Only_For_ClipIn from '@salesforce/label/c.B2B_Lens_Only_For_Clip_In'; //BS-1093
import B2B_lenses_without_adapter from '@salesforce/label/c.B2B_lenses_without_adapter'; //BS-1340

const POPULATE_RX_SOLUTION_DATA = 'populaterxsolutiondata';
const LANGUAGE_ENGLISH = 'en-US';
const DIRECT_GLAZING = 'Direct Glazing';
const READ_ONLY_MODE = 'read'; //BS-1051
const EDIT_MODE = 'edit'; //BS-1051
const UPDATE_PROGRESS_BAR = 'updateprogressbar'; //BS-1051

//BS-1019 Start
const ANTIREFLECTION_AND_HARDCOATING_SELECTION_KEY_FOR_RX = 'userSelectableOptionsForRX';
const ANTIREFLECTION_AND_HARDCOATING_SELECTION_KEY_FOR_VS = 'userSelectableOptionsForVS';
const PAGE_SOURCE_VS = 'VS';
const PAGE_SOURCE_RX = 'RX';
//BS-1019 End
const LENS_ONLY = 'Lens Only'; //BS-1093

//Added as a part of BS-1356
const ADAPTER = 'adapter';
const CLIPIN = 'clipIn';
const DIRECTGLAZING = 'directGlazing';
const CHINESE_LANG_BY_DEFAULT = 'zh-Hans-CN'; //BS-2320
const CHINESE_ORIGINAL_LANG = 'zh_CN'; //BS-2320
const PORTUGUESE_LANG_DEFAULT = 'pt-BR'; //BS-2320
const PORTUGUESE_LANG_ORIGINAL = 'pt_BR'; //BS-2320

export default class B2b_rx_solution extends LightningElement {
    @api
    pageSource; // BS-1019

    @track
    _applicableKeyPreservingUserSelectableOptions; // BS-1019

    @track
    rxTypeProductOptions = [];

    @track
    colorProductOptions = [];

    @track
    _hideRXTypeColor = false;

    @track
    _errorMessage;

    @track
    _isRxSolution = false;

    @track
    _isRXSolutionInValid = false;

    @track
    _isRXTypeInValid = false;

    @track
    _isRXColorInValid = false;

    @track
    _hideColor = false;

    @track
    _defaultSelectedRXType;

    @track
    _defaultSelectedColor;

    //BS-1093
    @track
    _hideLensOnlyCheckbox = false;

    //BS-1093
    @track
    isLensOnlyChecked;

    //BS-1093
    _lensOnlyForClipInLabel;
    //BS-1340 start
    @track
    _hideLensesWithoutAdapter = false;

    @track
    isLensesWithoutAdapterChecked;

    _lensesWithoutAdpaterLabel;
    //BS-1340 end

    @track
    _showTransparentColor = false;

    @track
    _transparentProductId;
    @track
    _transparentProductSku;

    @api
    selectedProductData;

    @api
    lensConfiguratorCollection;

    // BS-1051 this variable is used to show and hide read only screen
    @api
    rxSolutionComponentMode;

    _rxSolutionHeaderLabel;

    @track _rxSolutionSummaryCollection = [];

    _selectedRXTypeProduct;
    _selectedColorProduct;
    _selectedRXSolution;
    _selectedRXSolutionValue; //BS-1051
    _isRxPage = true; //BS-968

    @track
    _rxSolutionData = {};

    @track
    relatedCommerceProductData = [];

    @track
    _productIdVsSKUMap = new Map();

    @track
    colorSelected;

    @track
    selectedProductDataPDP;

    /**
     * Variable to set current mode of component
     * BS-1051
     * @type {Boolean}
     */
    @track
    _isReadOnly = false;

    /**
     * getter to get pencil icon
     * BS-1051
     */
    get editIcon() {
        let editIcon;
        editIcon = {
            icon: STORE_STYLING + '/icons/edit.png'
        };
        return editIcon;
    }

    connectedCallback() {
        if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
            //BS-1019
            if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_VS) {
                this._applicableKeyPreservingUserSelectableOptions = ANTIREFLECTION_AND_HARDCOATING_SELECTION_KEY_FOR_VS;
            } else if (this.pageSource != null && this.pageSource != undefined && this.pageSource == PAGE_SOURCE_RX) {
                this._applicableKeyPreservingUserSelectableOptions = ANTIREFLECTION_AND_HARDCOATING_SELECTION_KEY_FOR_RX;
            }
            //BS-1019
            this.createLabels();
            this.fetchRXSolutionForSelectedProduct();
            if (
                this.lensConfiguratorCollection != undefined &&
                this.lensConfiguratorCollection != null &&
                this.lensConfiguratorCollection.selectedRXSolution &&
                this.lensConfiguratorCollection.selectedRXSolution == B2B_RX_Solution_Type_Labels.split(',')[2]
            ) {
                this._showTransparentColor = true;
                this.colorSelected = this.lensConfiguratorCollection.selectedRxTypeColor;
                this._hideColor = false;
            }
            this.setupComponentMode(this.rxSolutionComponentMode); //BS-1051
        } else {
            this._isRxPage = false;
        }
    } //end connected callback

    createLabels() {
        this._rxSolutionHeaderLabel = B2B_RX_Solution_Header_Labels.split(',')[0];
        this._RXTypeLabel = B2B_RX_Solution_Type_Labels.split(',')[3];
        this._colorLabel = B2B_RX_Solution_Type_Labels.split(',')[4];
        this._fieldErrorMessage = B2B_Error_Message_Label;
        this._lensOnlyForClipInLabel = B2B_Lens_Only_For_ClipIn; //BS-1093
        this._lensesWithoutAdpaterLabel = B2B_lenses_without_adapter; //BS-1340
    }

    formatName(categoryName) {
        return categoryName
            .toLowerCase()
            .replace(/(?:^|[\s-/])\w/g, function (match) {
                return match.toLowerCase();
            })
            .replace('-', '')
            .replace(' ', '');
    }

    /**
     * This method is used to call the server method to fetch the RX Solutions applicable for this product.
     * BS-724
     */
    async fetchRXSolutionForSelectedProduct() {
        let currentLanguage = this.handleLanguage();
        let categoryTranslationsList = await getCategoryTranslations({ language: currentLanguage });
        //Call to server method
        await getRXSolutionDataOfSelectedFrame({
            selectedProductId: this.selectedProductData.productIdPDP
        })
            .then(async (data) => {
                this.selectedProductDataPDP = JSON.parse(JSON.stringify(data));
                //Added as a part of BS-1356
                let relatedProductData = [];
                let sortedRelatedCommerceProductData = [];
                relatedProductData = this.selectedProductDataPDP[0].B2B_RX_Solution__c.split(';');
                if (relatedProductData.includes(B2B_RX_Solution_Type_Labels.split(',')[0])) {
                    sortedRelatedCommerceProductData.push(B2B_RX_Solution_Type_Labels.split(',')[0]);
                }
                if (relatedProductData.includes(B2B_RX_Solution_Type_Labels.split(',')[1])) {
                    sortedRelatedCommerceProductData.push(B2B_RX_Solution_Type_Labels.split(',')[1]);
                }
                if (relatedProductData.includes(B2B_RX_Solution_Type_Labels.split(',')[2])) {
                    sortedRelatedCommerceProductData.push(B2B_RX_Solution_Type_Labels.split(',')[2]);
                }
                this.relatedCommerceProductData = [...sortedRelatedCommerceProductData];
                //End BS-1356
                if (Object.keys(this.relatedCommerceProductData).length !== 0) {
                    this.relatedCommerceProductData.forEach((key) => {
                        const rxSolutionInformationCollection = {};
                        if (this.formatName(key) === this.formatName(B2B_RX_Solution_Type_Labels.split(',')[0])) {
                            rxSolutionInformationCollection.label = B2B_RX_Solution_Type_Labels.split(',')[0]; //label: Collection element to hold label that needs to be displayed on UI
                            rxSolutionInformationCollection.value = ''; //value : Collection element to hold value that is entered by user on UI
                            rxSolutionInformationCollection.isChecked = false; //isChecked : Collection element to indicate whether the value is selected by user from UI (Used for radio button type inputs)
                            rxSolutionInformationCollection.isVisible = true;
                        }

                        if (this.formatName(key) === this.formatName(B2B_RX_Solution_Type_Labels.split(',')[1])) {
                            rxSolutionInformationCollection.label = B2B_RX_Solution_Type_Labels.split(',')[1]; //label: Collection element to hold label that needs to be displayed on UI
                            rxSolutionInformationCollection.value = ''; //value : Collection element to hold value that is entered by user on UI
                            rxSolutionInformationCollection.isChecked = false; //isChecked : Collection element to indicate whether the value is selected by user from UI (Used for radio button type inputs)
                            rxSolutionInformationCollection.isVisible = true;
                        }

                        if (this.formatName(key) === this.formatName(B2B_RX_Solution_Type_Labels.split(',')[2])) {
                            rxSolutionInformationCollection.label = B2B_RX_Solution_Type_Labels.split(',')[2]; //label: Collection element to hold label that needs to be displayed on UI
                            rxSolutionInformationCollection.value = ''; //value : Collection element to hold value that is entered by user on UI
                            rxSolutionInformationCollection.isChecked = false; //isChecked : Collection element to indicate whether the value is selected by user from UI (Used for radio button type inputs)
                            rxSolutionInformationCollection.isVisible = true;
                        }
                        this._rxSolutionSummaryCollection.push(rxSolutionInformationCollection);
                    });
                }
            })
            .catch((error) => {
                console.error(error);
            });

        if (this.lensConfiguratorCollection != undefined && this.lensConfiguratorCollection != null) {
            //BS-727
            if (
                (this.lensConfiguratorCollection.selectedRXSolution != undefined &&
                    this.lensConfiguratorCollection.selectedRXSolution != null &&
                    this.lensConfiguratorCollection.selectedRXSolution === DIRECT_GLAZING) ||
                (this.lensConfiguratorCollection.selectedRXSolution != undefined &&
                    this.lensConfiguratorCollection.selectedRXSolution != null &&
                    this.lensConfiguratorCollection.rxType != undefined &&
                    this.lensConfiguratorCollection.rxType != null &&
                    this.lensConfiguratorCollection.selectedRXSolutionSKU != undefined &&
                    this.lensConfiguratorCollection.selectedRXSolutionSKU != null)
            ) {
                this._selectedRXSolution = this.lensConfiguratorCollection.selectedRXSolution;
                let selectedSolution;

                if (this.lensConfiguratorCollection.selectedRXSolution === DIRECT_GLAZING) {
                    selectedSolution = B2B_RX_Solution_Type_Labels.split(',')[0];
                    this._selectedRXSolutionValue = selectedSolution; // BS-1051
                    this.colorSelected = ''; // BS-1051
                } else if (this.lensConfiguratorCollection.selectedRXSolution === B2B_RX_Solution_Type_Labels.split(',')[2]) {
                    selectedSolution = this.lensConfiguratorCollection.selectedRXSolution;
                    this._selectedRXSolutionValue = selectedSolution; // BS-1051
                    this._hideColor = false;
                    this.colorSelected = B2B_Color_Value_For_Clip_In; // BS-1051
                } else {
                    selectedSolution = this.lensConfiguratorCollection.selectedRXSolution;
                    this._selectedRXSolutionValue = selectedSolution; // BS-1051
                    if (
                        (this.rxTypeProductOptions && this.rxTypeProductOptions.length != 1) ||
                        this._selectedRXSolutionValue !== B2B_RX_Solution_Type_Labels.split(',')[2]
                    ) {
                        this._hideColor = true;
                    }
                    this.colorSelected = this.lensConfiguratorCollection.selectedRxTypeColor; // BS-1051
                }

                for (var input in this._rxSolutionSummaryCollection) {
                    //Iteration over the collection of customer information summary and setting up the entered value by user for that particuler field.
                    if (this._rxSolutionSummaryCollection[input].label === selectedSolution) {
                        this._rxSolutionSummaryCollection[input].isChecked = true;
                    }
                } //end for

                if (this.lensConfiguratorCollection.selectedRXSolution != DIRECT_GLAZING) {
                    //BS-1093 showing lens only checkbox value from collection when page get refreshed
                    if (this.lensConfiguratorCollection.orderType != undefined && this.lensConfiguratorCollection.orderType != null) {
                        if (
                            this.lensConfiguratorCollection.orderType == LENS_ONLY &&
                            this.lensConfiguratorCollection.selectedRXSolution == B2B_RX_Solution_Type_Labels.split(',')[2]
                        ) {
                            this._hideLensOnlyCheckbox = true;
                            this.isLensOnlyChecked = this.lensConfiguratorCollection.withoutClipIn;
                            this._hideLensesWithoutAdapter = false;
                            this.isLensesWithoutAdapterChecked = false;
                            this._rxSolutionData.lensesWithoutAdapter = this.isLensesWithoutAdapterChecked;
                        } else if (
                            this.lensConfiguratorCollection.orderType == LENS_ONLY &&
                            this.lensConfiguratorCollection.selectedRXSolution == B2B_RX_Solution_Type_Labels.split(',')[1]
                        ) {
                            this._hideLensesWithoutAdapter = true;
                            this.isLensesWithoutAdapterChecked = this.lensConfiguratorCollection.withoutAdapter;
                            this._hideLensOnlyCheckbox = false;
                            this.isLensOnlyChecked = false;
                            this._rxSolutionData.lensOnlyForClipIn = this.isLensOnlyChecked;
                        } else {
                            this._hideLensOnlyCheckbox = false;
                            this.isLensOnlyChecked = false;
                            this._hideLensesWithoutAdapter = false;
                            this.isLensesWithoutAdapterChecked = false;
                            this._rxSolutionData.lensesWithoutAdapter = this.isLensesWithoutAdapterChecked;
                            this._rxSolutionData.lensOnlyForClipIn = this.isLensOnlyChecked;
                        }
                    } //end outer if

                    this.getSelectedRXTypeForSelectedSolution(this.lensConfiguratorCollection.selectedRXSolution);
                    if (Object.keys(this.relatedCommerceProductData).length === 0) {
                        this._hideRXTypeColor = false;
                    } else {
                        this._hideRXTypeColor = true;
                    }
                }
            } else {
                this._hideRXTypeColor = false;
                localStorage.removeItem(this._applicableKeyPreservingUserSelectableOptions); //BS-1019
                this._rxSolutionSummaryCollection.forEach((option) => {
                    if (option.label == B2B_RX_Solution_Type_Labels.split(',')[0]) {
                        const value = B2B_RX_Solution_Type_Labels.split(',')[0];
                        this._selectedRXSolution = value;
                        this._selectedRXSolutionValue = value;
                        this._isRXTypeInValid = false;
                        this._isRXColorInValid = false;
                        this._showTransparentColor = false;
                        if (LANG !== LANGUAGE_ENGLISH) {
                            if (this._selectedRXSolution === B2B_RX_Solution_Type_Labels.split(',')[0]) {
                                if (categoryTranslationsList !== null && categoryTranslationsList !== undefined) {
                                    try {
                                        this._selectedRXSolution = categoryTranslationsList.find((itr) => itr.Name === value).Parent.Name;
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }
                            }
                        }
                        if (value === B2B_RX_Solution_Type_Labels.split(',')[0]) {
                            this._rxSolutionData = {
                                B2B_RX_Solution__c: this._selectedRXSolution,
                                B2B_RX_Type__c: '',
                                B2B_Selected_RX_Solution_SKU__c: '',
                                selectedRxTypeColor: '', // sending selected color to vs rx container
                                B2B_Mounting_Type__c: this.selectedProductDataPDP[0].B2B_Mounting_Type__c,
                                B2B_Variant_Shape__c: this.selectedProductDataPDP[0].B2B_Variant_Shape__c,
                                B2B_Bridge_Size__c: this.selectedProductDataPDP[0].B2B_Bridge_Size__c,
                                B2B_Schneider_SKU__c: this.selectedProductDataPDP[0].B2B_Schneider_SKU__c,
                                B2B_Lens_Size__c: this.selectedProductDataPDP[0].B2B_Lens_Size__c,
                                B2B_Frame_Base_Curve__c: this.selectedProductDataPDP[0].B2B_Frame_Base_Curve__c, //BS-1201 Field update
                                B2B_Color_Number__c: this.selectedProductDataPDP[0].B2B_Color_Number__c,
                                B2B_Temple_Length__c: this.selectedProductDataPDP[0].B2B_Temple_Length__c,
                                lensOnlyForClipIn: false,
                                lensesWithoutAdapter: false
                            };
                            this._hideRXTypeColor = false;
                            this._selectedColorProduct = null;
                            this._selectedRXTypeProduct = null;
                            this._hideLensOnlyCheckbox = false;
                            this._hideLensesWithoutAdapter = false;
                        }
                        for (var input in this._rxSolutionSummaryCollection) {
                            //Iteration over the collection of customer information summary and setting up the entered value by user for that particuler field.
                            if (this._rxSolutionSummaryCollection[input].label === value) {
                                this.rxTypeProductOptions = [];
                                this.colorProductOptions = [];

                                this._rxSolutionSummaryCollection[input].isChecked = true;
                                this._selectedColorProduct = null;
                                this._selectedRXTypeProduct = null;
                            } else {
                                this._rxSolutionSummaryCollection[input].isChecked = false;
                            }
                        }
                    }
                });
            } //BS-1887 - added the logic to check direct glazing by default.
        } //end inner if
    }

    /**
     * 1. This method is used to call the server method to fetch the details of the products under selected RX solution.
     * 2. Based on the data fetched it created the JSON for the dropdowns.
     * BS-724
     * @param {text}  selectedRXSolution : Category for which product details needs to be fetched.
     */
    async getSelectedRXTypeForSelectedSolution(selectedRXSolution) {
        //BS-2376
        let currentLanguage = this.handleLanguage();
        await getRXTypesForSelectedSolution({
            selectedSolution: selectedRXSolution,
            language: currentLanguage,
            selectedProductId: this.selectedProductData.productIdPDP
        })
            .then((data) => {
                let rxTypeProductsData = data;
                let optionsForRXType = [];
                rxTypeProductsData.forEach((item) => {
                    this._productIdVsSKUMap.set(item.B2B_Target_Product__c, item.B2B_Target_Product__r.StockKeepingUnit);
                    if (selectedRXSolution === B2B_RX_Solution_Type_Labels.split(',')[2]) {
                        this._transparentProductId = item.B2B_Target_Product__c;
                        this._selectedColorProduct = item.B2B_Target_Product__c;
                        this._transparentProductSku = item.B2B_Target_Product__r.StockKeepingUnit;
                    }
                    if (!optionsForRXType.find((object) => object.label === item.B2B_Target_Product__r.Name)) {
                        optionsForRXType.push({
                            label: item.B2B_Target_Product__r.Name,
                            value: item.B2B_Target_Product__r.Name,
                            productIdList: [item.B2B_Target_Product__c],
                            colorList: [
                                {
                                    label:
                                        selectedRXSolution === B2B_RX_Solution_Type_Labels.split(',')[2]
                                            ? B2B_Color_Value_For_Clip_In
                                            : item.B2B_Target_Product__r.Description, //BS-1116 for clip in showing transparent others have description
                                    value: item.B2B_Target_Product__c,
                                    sku: item.B2B_Target_Product__r.StockKeepingUnit
                                }
                            ]
                        });
                    } else {
                        let obj = optionsForRXType.find((iterator, index) => {
                            if (iterator.label === item.B2B_Target_Product__r.Name) {
                                return true; // stop searching
                            }
                        });
                        obj.productIdList = [...obj.productIdList, item.B2B_Target_Product__c];
                        obj.colorList = [
                            ...obj.colorList,
                            {
                                label:
                                    selectedRXSolution === B2B_RX_Solution_Type_Labels.split(',')[2]
                                        ? B2B_Color_Value_For_Clip_In
                                        : item.B2B_Target_Product__r.Description, //BS-1116 for clip in showing transparent others have description
                                value: item.B2B_Target_Product__c,
                                sku: item.B2B_Target_Product__r.StockKeepingUnit
                            }
                        ];
                    }
                });
                this.rxTypeProductOptions = optionsForRXType;
                /**START OF BS-1250 - Show by default value for RX type*/
                if (this.rxTypeProductOptions && this.rxTypeProductOptions.length == 1) {
                    this._selectedRXTypeProduct =
                        this.rxTypeProductOptions[0].value != undefined && this.rxTypeProductOptions[0].value != null
                            ? this.rxTypeProductOptions[0].value
                            : null;
                    if (this._selectedRXTypeProduct != null && this._selectedRXTypeProduct != undefined) {
                        if (selectedRXSolution == B2B_RX_Solution_Type_Labels.split(',')[2]) {
                            this._hideColor = false;
                            this._showTransparentColor = true;
                            this._selectedColorProduct = this._transparentProductId;
                            this.colorSelected = B2B_Color_Value_For_Clip_In;
                        }
                    }
                    this.colorProductOptions =
                        this.rxTypeProductOptions[0].colorList != undefined && this.rxTypeProductOptions[0].colorList != null
                            ? this.rxTypeProductOptions[0].colorList
                            : null;
                    this._hideRXTypeColor = true;
                    if (selectedRXSolution === B2B_RX_Solution_Type_Labels.split(',')[2]) {
                        this._hideColor = false;
                        //BS-2230 start
                        this._selectedColorProduct = this.colorProductOptions[0].value;
                        let selectedProductSKU = this._productIdVsSKUMap.has(this._selectedColorProduct)
                            ? this._productIdVsSKUMap.get(this._selectedColorProduct)
                            : null;
                        this.colorSelected = B2B_Color_Value_For_Clip_In;
                        this._rxSolutionData = {
                            B2B_RX_Solution__c: this._selectedRXSolution,
                            B2B_RX_Type__c: this._selectedRXTypeProduct,
                            B2B_Selected_RX_Solution_SKU__c: selectedProductSKU,
                            selectedRxTypeColor: this.colorSelected, // sending selected color to vs rx container
                            B2B_Mounting_Type__c: this.selectedProductDataPDP[0].B2B_Mounting_Type__c,
                            B2B_Variant_Shape__c: this.selectedProductDataPDP[0].B2B_Variant_Shape__c,
                            B2B_Bridge_Size__c: this.selectedProductDataPDP[0].B2B_Bridge_Size__c,
                            B2B_Schneider_SKU__c: this.selectedProductDataPDP[0].B2B_Schneider_SKU__c,
                            B2B_Lens_Size__c: this.selectedProductDataPDP[0].B2B_Lens_Size__c,
                            B2B_Frame_Base_Curve__c: this.selectedProductDataPDP[0].B2B_Frame_Base_Curve__c, // BS-1201 field update
                            B2B_Color_Number__c: this.selectedProductDataPDP[0].B2B_Color_Number__c,
                            B2B_Temple_Length__c: this.selectedProductDataPDP[0].B2B_Temple_Length__c,
                            lensOnlyForClipIn: this.isLensOnlyChecked,
                            lensesWithoutAdapter: this.isLensesWithoutAdapterChecked
                        }; //BS-2230 end
                    } else {
                        this._hideColor = true;
                        //BS-1648 start
                        if (this.colorProductOptions && this.colorProductOptions.length == 1) {
                            this._selectedColorProduct = this.colorProductOptions[0].value;
                            let selectedProductSKU = this._productIdVsSKUMap.has(this._selectedColorProduct)
                                ? this._productIdVsSKUMap.get(this._selectedColorProduct)
                                : null;

                            //BS-1051 Setting the selected color
                            let obj = this.colorProductOptions.find((iterator, index) => {
                                if (iterator.sku === selectedProductSKU) {
                                    return true; // stop searching
                                }
                            });
                            this.colorSelected = obj.label; //Setting the selected color
                            this._rxSolutionData = {
                                B2B_RX_Solution__c: this._selectedRXSolution,
                                B2B_RX_Type__c: this._selectedRXTypeProduct,
                                B2B_Selected_RX_Solution_SKU__c: selectedProductSKU,
                                selectedRxTypeColor: this.colorSelected, // sending selected color to vs rx container
                                B2B_Mounting_Type__c: this.selectedProductDataPDP[0].B2B_Mounting_Type__c,
                                B2B_Variant_Shape__c: this.selectedProductDataPDP[0].B2B_Variant_Shape__c,
                                B2B_Bridge_Size__c: this.selectedProductDataPDP[0].B2B_Bridge_Size__c,
                                B2B_Schneider_SKU__c: this.selectedProductDataPDP[0].B2B_Schneider_SKU__c,
                                B2B_Lens_Size__c: this.selectedProductDataPDP[0].B2B_Lens_Size__c,
                                B2B_Frame_Base_Curve__c: this.selectedProductDataPDP[0].B2B_Frame_Base_Curve__c, // BS-1201 field update
                                B2B_Color_Number__c: this.selectedProductDataPDP[0].B2B_Color_Number__c,
                                B2B_Temple_Length__c: this.selectedProductDataPDP[0].B2B_Temple_Length__c,
                                lensOnlyForClipIn: this.isLensOnlyChecked,
                                lensesWithoutAdapter: this.isLensesWithoutAdapterChecked
                            };
                        } //BS-1648 end
                    }
                } else if (this.rxTypeProductOptions && this.rxTypeProductOptions.length > 1) {
                    this._hideRXTypeColor = true;
                } else {
                    this._hideRXTypeColor = true;
                }
                /**END OF BS-1250 */
            })
            .catch((error) => {
                console.error(error);
            });

        if (
            this.lensConfiguratorCollection.selectedRXSolution != undefined &&
            this.lensConfiguratorCollection.selectedRXSolution != null &&
            this.lensConfiguratorCollection.rxType != undefined &&
            this.lensConfiguratorCollection.rxType != null &&
            this.lensConfiguratorCollection.selectedRXSolutionSKU != undefined &&
            this.lensConfiguratorCollection.selectedRXSolutionSKU != null
        ) {
            if (selectedRXSolution == this.lensConfiguratorCollection.selectedRXSolution) {
                if (selectedRXSolution == B2B_RX_Solution_Type_Labels.split(',')[2]) {
                    this._hideColor = false;
                } else {
                    this._hideColor = true;
                }
                this._selectedRXTypeProduct = this.lensConfiguratorCollection.rxType;
                this.colorSelected = this.lensConfiguratorCollection.selectedRxTypeColor; // BS-1051
                let obj = this.rxTypeProductOptions.find((iterator, index) => {
                    if (iterator.label === this._selectedRXTypeProduct) {
                        return true; // stop searching
                    }
                });
                if (obj.colorList !== undefined && obj.colorList !== null) {
                    this.colorProductOptions = obj.colorList;
                    this._selectedColorProduct = this.getByValue(this._productIdVsSKUMap, this.lensConfiguratorCollection.selectedRXSolutionSKU);
                }
            }
        }
    } //end

    /**
     * 1. This method is used to updated the selected RX solution's selection.
     * 2. This triggers the fetching of product details.
     * BS-724
     * @param   event : Event fired on select radio button for available RX solutions.
     */
    async handleSelection(event) {
        localStorage.removeItem(this._applicableKeyPreservingUserSelectableOptions); //BS-1019
        const value = event.target.value;
        this._selectedRXSolution = value;
        this._selectedRXSolutionValue = value;
        this._isRXTypeInValid = false;
        this._isRXColorInValid = false;
        this._showTransparentColor = false;
        //BS-1051 setting selected color empty when direct glazing.
        if (this._selectedRXSolution === B2B_RX_Solution_Type_Labels.split(',')[0]) {
            this.colorSelected = '';
        }
        if (LANG !== LANGUAGE_ENGLISH) {
            //BS-2376
            let currentLanguage = this.handleLanguage();
            if (this._selectedRXSolution === B2B_RX_Solution_Type_Labels.split(',')[0]) {
                let result = await getCategoryTranslations({ language: currentLanguage });
                if (result !== null && result !== undefined) {
                    try {
                        this._selectedRXSolution = result.find((itr) => itr.Name === value).Parent.Name;
                    } catch (error) {}
                }
            }
        }

        for (var input in this._rxSolutionSummaryCollection) {
            //Iteration over the collection of customer information summary and setting up the entered value by user for that particuler field.
            if (this._rxSolutionSummaryCollection[input].label === value) {
                this.rxTypeProductOptions = [];
                this.colorProductOptions = [];

                this._rxSolutionSummaryCollection[input].isChecked = true;
                this._selectedColorProduct = null;
                this._selectedRXTypeProduct = null;
            } else {
                this._rxSolutionSummaryCollection[input].isChecked = false;
            }
        }

        if (value === B2B_RX_Solution_Type_Labels.split(',')[0]) {
            this._rxSolutionData = {
                B2B_RX_Solution__c: this._selectedRXSolution,
                B2B_RX_Type__c: '',
                B2B_Selected_RX_Solution_SKU__c: '',
                selectedRxTypeColor: '', // sending selected color to vs rx container
                B2B_Mounting_Type__c: this.selectedProductDataPDP[0].B2B_Mounting_Type__c,
                B2B_Variant_Shape__c: this.selectedProductDataPDP[0].B2B_Variant_Shape__c,
                B2B_Bridge_Size__c: this.selectedProductDataPDP[0].B2B_Bridge_Size__c,
                B2B_Schneider_SKU__c: this.selectedProductDataPDP[0].B2B_Schneider_SKU__c,
                B2B_Lens_Size__c: this.selectedProductDataPDP[0].B2B_Lens_Size__c,
                B2B_Frame_Base_Curve__c: this.selectedProductDataPDP[0].B2B_Frame_Base_Curve__c, //BS-1201 Field update
                B2B_Color_Number__c: this.selectedProductDataPDP[0].B2B_Color_Number__c,
                B2B_Temple_Length__c: this.selectedProductDataPDP[0].B2B_Temple_Length__c,
                lensOnlyForClipIn: false,
                lensesWithoutAdapter: false
            };
            this._hideRXTypeColor = false;
            this._selectedColorProduct = null;
            this._selectedRXTypeProduct = null;
            this._hideLensOnlyCheckbox = false;
            this._hideLensesWithoutAdapter = false;
        } else {
            //BS-1093
            if (this.lensConfiguratorCollection != undefined && this.lensConfiguratorCollection != null) {
                if (this._selectedRXSolution == B2B_RX_Solution_Type_Labels.split(',')[2]) {
                    this._hideColor = false;
                    this._selectedColorProduct = this._transparentProductId;
                    this.colorSelected = B2B_Color_Value_For_Clip_In;
                    this._showTransparentColor = true;
                }
                if (this.lensConfiguratorCollection.orderType == LENS_ONLY && this._selectedRXSolution == B2B_RX_Solution_Type_Labels.split(',')[2]) {
                    this._hideLensOnlyCheckbox = true;
                } else {
                    this._hideLensOnlyCheckbox = false;
                    this.isLensOnlyChecked = false;
                } //end inner if
            } //end outer if

            //BS-1340
            if (this.lensConfiguratorCollection != undefined && this.lensConfiguratorCollection != null) {
                if (this.lensConfiguratorCollection.orderType == LENS_ONLY && this._selectedRXSolution == B2B_RX_Solution_Type_Labels.split(',')[1]) {
                    this._hideLensesWithoutAdapter = true;
                } else {
                    this._hideLensesWithoutAdapter = false;
                    this.isLensesWithoutAdapterChecked = false;
                } //end inner if
            } //end outer if

            this._hideColor = false;
            this.getSelectedRXTypeForSelectedSolution(this._selectedRXSolution);
        }

        this._isRXSolutionInValid = false;
    } //end handleSelection

    /**
     * This method is used to updated populate and handle of change/selection of color.
     * BS-724
     * @param   event : Event fired on select of RX Type dropdown.
     */
    handleRXTypeOptionsSelection(event) {
        this._selectedRXTypeProduct = event.target.value;
        let obj = this.rxTypeProductOptions.find((iterator, index) => {
            if (iterator.label === event.target.value) {
                return true; // stop searching
            }
        });
        this.colorProductOptions = obj.colorList;
        this._selectedColorProduct = null; //BS-1116
        if (this._selectedRXSolution == B2B_RX_Solution_Type_Labels.split(',')[2]) {
            this._hideColor = false;
            this._showTransparentColor = true;
            this._isRXColorInValid = false;
            this._selectedColorProduct = this.colorProductOptions && this.colorProductOptions[0].value ? this.colorProductOptions[0].value : null; //BS-1989
            let selectedProductSKU = this.colorProductOptions && this.colorProductOptions[0].sku ? this.colorProductOptions[0].sku : null; //BS-1989
            this._rxSolutionData = {
                B2B_RX_Solution__c: this._selectedRXSolution,
                B2B_RX_Type__c: this._selectedRXTypeProduct,
                B2B_Selected_RX_Solution_SKU__c: selectedProductSKU,
                selectedRxTypeColor: this.colorSelected, // sending selected color to vs rx container
                B2B_Mounting_Type__c: this.selectedProductDataPDP[0].B2B_Mounting_Type__c,
                B2B_Variant_Shape__c: this.selectedProductDataPDP[0].B2B_Variant_Shape__c,
                B2B_Bridge_Size__c: this.selectedProductDataPDP[0].B2B_Bridge_Size__c,
                B2B_Schneider_SKU__c: this.selectedProductDataPDP[0].B2B_Schneider_SKU__c,
                B2B_Lens_Size__c: this.selectedProductDataPDP[0].B2B_Lens_Size__c,
                B2B_Frame_Base_Curve__c: this.selectedProductDataPDP[0].B2B_Frame_Base_Curve__c, // BS-1201 field update
                B2B_Color_Number__c: this.selectedProductDataPDP[0].B2B_Color_Number__c,
                B2B_Temple_Length__c: this.selectedProductDataPDP[0].B2B_Temple_Length__c,
                lensOnlyForClipIn: this.isLensOnlyChecked,
                lensesWithoutAdapter: this.isLensesWithoutAdapterChecked
            };
        } else {
            this._hideColor = true;
            /* Start : BS-1648 */
            if (this.colorProductOptions && this.colorProductOptions.length === 1) {
                this._selectedColorProduct = this.colorProductOptions[0].value;
                let selectedProductSKU = this._productIdVsSKUMap.has(this._selectedColorProduct)
                    ? this._productIdVsSKUMap.get(this._selectedColorProduct)
                    : null;

                //BS-1051 Setting the selected color
                let obj = this.colorProductOptions.find((iterator, index) => {
                    if (iterator.sku === selectedProductSKU) {
                        return true; // stop searching
                    }
                });
                this.colorSelected = obj.label; //Setting the selected color
                this._rxSolutionData = {
                    B2B_RX_Solution__c: this._selectedRXSolution,
                    B2B_RX_Type__c: this._selectedRXTypeProduct,
                    B2B_Selected_RX_Solution_SKU__c: selectedProductSKU,
                    selectedRxTypeColor: this.colorSelected, // sending selected color to vs rx container
                    B2B_Mounting_Type__c: this.selectedProductDataPDP[0].B2B_Mounting_Type__c,
                    B2B_Variant_Shape__c: this.selectedProductDataPDP[0].B2B_Variant_Shape__c,
                    B2B_Bridge_Size__c: this.selectedProductDataPDP[0].B2B_Bridge_Size__c,
                    B2B_Schneider_SKU__c: this.selectedProductDataPDP[0].B2B_Schneider_SKU__c,
                    B2B_Lens_Size__c: this.selectedProductDataPDP[0].B2B_Lens_Size__c,
                    B2B_Frame_Base_Curve__c: this.selectedProductDataPDP[0].B2B_Frame_Base_Curve__c, // BS-1201 field update
                    B2B_Color_Number__c: this.selectedProductDataPDP[0].B2B_Color_Number__c,
                    B2B_Temple_Length__c: this.selectedProductDataPDP[0].B2B_Temple_Length__c,
                    lensOnlyForClipIn: this.isLensOnlyChecked,
                    lensesWithoutAdapter: this.isLensesWithoutAdapterChecked
                };
            }
            /* End : BS-1648 */
            this._showTransparentColor = false;
        }
    }

    /**
     * 1. This method is used to updated populate and handle of change/selection of color.
     * 2. This method fire an event to update/populate the user selection on top level parent component.
     * BS-724
     * @param   event : Event fired on select of color dropdown.
     */
    handleColorOptionsSelection(event) {
        this._selectedColorProduct = event.target.value;
        let selectedProductSKU = this._productIdVsSKUMap.has(this._selectedColorProduct) ? this._productIdVsSKUMap.get(this._selectedColorProduct) : null;

        //BS-1051 Setting the selected color
        let obj = this.colorProductOptions.find((iterator, index) => {
            if (iterator.sku === selectedProductSKU) {
                return true; // stop searching
            }
        });
        this.colorSelected = obj.label; //Setting the selected color
        this._rxSolutionData = {
            B2B_RX_Solution__c: this._selectedRXSolution,
            B2B_RX_Type__c: this._selectedRXTypeProduct,
            B2B_Selected_RX_Solution_SKU__c: selectedProductSKU,
            selectedRxTypeColor: this.colorSelected, // sending selected color to vs rx container
            B2B_Mounting_Type__c: this.selectedProductDataPDP[0].B2B_Mounting_Type__c,
            B2B_Variant_Shape__c: this.selectedProductDataPDP[0].B2B_Variant_Shape__c,
            B2B_Bridge_Size__c: this.selectedProductDataPDP[0].B2B_Bridge_Size__c,
            B2B_Schneider_SKU__c: this.selectedProductDataPDP[0].B2B_Schneider_SKU__c,
            B2B_Lens_Size__c: this.selectedProductDataPDP[0].B2B_Lens_Size__c,
            B2B_Frame_Base_Curve__c: this.selectedProductDataPDP[0].B2B_Frame_Base_Curve__c, // BS-1201 field update
            B2B_Color_Number__c: this.selectedProductDataPDP[0].B2B_Color_Number__c,
            B2B_Temple_Length__c: this.selectedProductDataPDP[0].B2B_Temple_Length__c,
            lensOnlyForClipIn: this.isLensOnlyChecked,
            lensesWithoutAdapter: this.isLensesWithoutAdapterChecked
        };
    }

    //BS-1093 handle clip in checkbox action
    handleLensClipInCheckbox(event) {
        if (event.target.checked) {
            this.isLensOnlyChecked = true;
        } else {
            this.isLensOnlyChecked = false;
        }

        this._rxSolutionData.lensOnlyForClipIn = this.isLensOnlyChecked;
    } //end

    //BS-1340 handle adapter checkbox action
    handleLensAdapterCheckbox(event) {
        if (event.target.checked) {
            this.isLensesWithoutAdapterChecked = true;
        } else {
            this.isLensesWithoutAdapterChecked = false;
        }

        this._rxSolutionData.lensesWithoutAdapter = this.isLensesWithoutAdapterChecked;
    } //end

    @api
    async updateRXSolutionData() {
        this._rxSolutionData.selectedFrameSKU =
            this.lensConfiguratorCollection.selectedFrameSKU != undefined ? this.lensConfiguratorCollection.selectedFrameSKU : null; //BS-1121
        //BS-2376
        let currentLanguage = this.handleLanguage();
        await updateLensConfiguratorData({
            lensConfiguratorId: this.lensConfiguratorCollection.lensConfiguratorID,
            fieldNameVsLensConfiguratorDataMap: this._rxSolutionData,
            language: currentLanguage
        })
            .then((data) => {
                if (this._selectedRXSolution === B2B_RX_Solution_Type_Labels.split(',')[0]) {
                    //Fire event to update this screen's data at top level parent to be used further in next screens.
                    try {
                        this.dispatchEvent(new CustomEvent(POPULATE_RX_SOLUTION_DATA, { detail: this._rxSolutionData }));
                    } catch (error) {
                        console.error(error);
                    }
                } else {
                    //Fire event to update this screen's data at top level parent to be used further in next screens.
                    try {
                        this.dispatchEvent(new CustomEvent(POPULATE_RX_SOLUTION_DATA, { detail: this._rxSolutionData }));
                    } catch (error) {
                        console.error(error);
                    }
                } //end if else
            })
            .catch((error) => {
                console.error(error);
            });
    } //end update

    @api
    handleValidityCheck() {
        let isValid = false;

        if (this.relatedCommerceProductData == null || Object.keys(this.relatedCommerceProductData).length === 0) {
            this._isRXSolutionInValid = false;
        } else {
            if (this._selectedRXSolution != null && this._selectedRXSolution != undefined) {
                this._isRXSolutionInValid = false;
                if (this._selectedRXSolution == DIRECT_GLAZING) {
                    isValid = true;
                } else if (this._selectedRXTypeProduct != null && this._selectedRXTypeProduct != undefined) {
                    this._isRXColorInValid = false;
                    this._isRXTypeInValid = false;

                    if (this._selectedColorProduct != null && this._selectedColorProduct != undefined) {
                        this._isRXColorInValid = false;
                        this._isRXTypeInValid = false;
                        isValid = true;
                    } else {
                        this._isRXColorInValid = true;
                    }
                } else {
                    this._isRXTypeInValid = true;
                    this._isRXColorInValid = false;
                }
            } else {
                this._isRXSolutionInValid = true;
            } //end inner if
        } //end outer if
        return isValid;
    } //end handleValidityCheck

    getByValue(map, searchValue) {
        for (let [key, value] of map.entries()) {
            if (value === searchValue) return key;
        }
    }

    /**
     * This Method is used to set the component read only or edit visibility mode
     * BS-1051
     *
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
     * This Method is used to handle event fired on click of edit icon by user on UI
     * BS-1051
     *
     */
    handleRxSolutionEdit(event) {
        if (this._isReadOnly == true) {
            this._isReadOnly = false;
            this.fireUpdateProgressBar(5, true, false);
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
    //BS-2376: For handling Language code handling
    handleLanguage() {
        if (LANG == CHINESE_LANG_BY_DEFAULT) {
            return CHINESE_ORIGINAL_LANG;
        } else if (LANG == PORTUGUESE_LANG_DEFAULT) {
            return PORTUGUESE_LANG_ORIGINAL;
        }
        return LANG;
    }
}
