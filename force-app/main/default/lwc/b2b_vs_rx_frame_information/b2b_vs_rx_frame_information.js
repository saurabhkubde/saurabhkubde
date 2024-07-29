import { LightningElement, track, api, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';

//LANGUAGE
import LANG from '@salesforce/i18n/lang';

//Apex method callouts
import saveInputData from '@salesforce/apex/B2B_VS_RX_PDP_Controller.saveLensConfiguratorData';
import getFrameTypeAndModelData from '@salesforce/apex/B2B_VS_RX_PDP_Controller.getFrameTypeAndModelData';
import updateLensConfiguratorData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.updateLensConfiguratorData';

//GET LABELS
import B2B_VS_RX_FRAME_REFERENCE_LABELS from '@salesforce/label/c.B2B_VS_RX_Frame_Reference_Labels';
import B2B_VS_PRODUCTS_FIELDS_LABELS from '@salesforce/label/c.B2B_VS_Product_Fields';
import B2B_RX_PRODUCTS_FIELDS_LABELS from '@salesforce/label/c.B2B_RX_Product_Fields';
import B2B_VS_RX_LABELS from '@salesforce/label/c.B2B_VS_RX_Labels';
import B2B_VS_RX_CONFIRM_MSG from '@salesforce/label/c.B2B_VS_RX_PopUp_Confirm_Message';

// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-788
const STANDARD_NAMED_PAGE = 'standard__namedPage';
const REDIRECT_TO_FRAME_PDP = 'redirecttoframepdp';
const HOME_PAGE = 'home';
const VS_PAGE = 'VS';
const RX_PAGE = 'RX';
const UPDATE_PROGRESS_BAR = 'updateprogressbar';
const SEND_INSERTED_LENS_CONFIGURATOR_DATA = 'sendinsertedlensconfiguratordata';
const OPEN_STATUS = 'Open';
const CUSTOMER_NAME = 'End-Consumer/Reference';
const CLERK = 'Order Remark';

const VISION_SENSATION = 'Vision Sensation'; //BS-1117
const RX_GLAZING = 'RX Glazing'; //BS-1117
const STANDARD_RECORD_PAGE = 'standard__recordPage'; //BS-1117
const PAGE_MODE_VIEW = 'view'; //BS-1117
const LANG_ENG = 'en_US';
const SEND_FRAME_TYPE_AND_MODEL = 'sendframetypeandmodel';
const STYLING_BACKGROUND_COLOR = 'background-color:'; //BS-2158

export default class B2b_vs_rx_frame_information extends NavigationMixin(LightningElement) {
    /**
     * Variable to represent open modal popup
     * BS-788
     * @type {Boolean}
     */
    @api
    openConfirmPopup;

    /**
     * Variable contain current pagesource
     * BS-788
     * @type {Boolean}
     */
    @api
    pageSource;

    /**
     * Variable to represent label of Frame Type Header Section
     * BS-788
     * @type {String}
     */
    _frameInforamtionHeaderLabel;

    /**
     * Variable to represent label of exit button
     * BS-788
     * @type {String}
     */
    _exitButtonLabel;

    /**
     * Variable to represent label of save and next button
     * BS-788
     * @type {String}
     */
    _saveAndExitButtonLabel;

    /**
     * Variable to store product data
     * BS-788
     * @type {object}
     */
    @api
    productData;

    @api
    orderInformationCollection;

    /**
     * Variable to store order frame data
     * BS-788
     * @type {object}
     */
    @api
    orderFrameData;

    /**
     * Variable to store account id of current user
     * BS-788
     * @type {id}
     */
    @api
    effectiveAccountId;

    /**
     * Variable to show selected product image
     * BS-788
     * @type {string}
     */
    showImage;

    /**
     * Collection of Customer Information entered by User on UI
     * BS-788
     * @type {Array}
     */
    @track
    _frameInformationSummaryCollection = [];

    /**
     * Collection of store lens configurator data
     * BS-788
     * @type {Array}
     */
    @track
    lensConfiguratorData = {};

    @api
    insertedLensConfigId;

    @api
    lensConfiguratorCollection;

    _productFrameType;
    _productModel;
    _variantShape; //BS-1916
    _shapeSize; //BS-1916
    _rimlessVariant; //BS-1888
    _bridgeSize; //BS-2015

    /**
     * This variable is used to indicate whether user has entered from other location than tiles or VS-RX URL (Such as from normal PDP)
     * Value of this variable is recieved from parent component 'c/b2b_vs_rx_container'
     * BS-1117
     * @type {Boolean}
     */
    @api
    isSourceFromOutsideConfigurator;

    /**
     * This variable is used to hold selected frame product Id
     * BS-1117
     * @type {Boolean}
     */
    @api
    recordId;

    /**
     * This method is used to set edit icon that is fetched from static resource 'B2B_StoreStyling'
     * BS-788
     * @return  rxIcon  :   icon for Edit
     */
    get editIcon() {
        let editIcon;
        editIcon = {
            icon: STORE_STYLING + '/icons/edit.png'
        };
        return editIcon;
    }

    /**
     * This method is used to set check icon that is fetched from static resource 'B2B_StoreStyling'
     * BS-788
     * @return  rxIcon  :   check
     */
    _checkIconWithCircle = STORE_STYLING + '/icons/checkwithcircle.svg';

    _frameColorBubbleData = {}; //BS-2158/BS-2174

    /**
     * This method is used to insert user input data into lens configurator data
     * BS-788
     *
     */
    @api
    async handleSaveInputData() {
        await saveInputData({
            fieldNameVsLensConfiguratorDataMap: this.lensConfiguratorData
        })
            .then((data) => {
                if (data.Id != null && data.Id != undefined) {
                    this.lensConfiguratorData.lensConfiguratorID = data.Id;
                } else {
                    this.lensConfiguratorData.lensConfiguratorID = data.Id;
                }
                this.lensConfiguratorData.productFrameType = this._productFrameType;
                this.lensConfiguratorData.productmodel = this._productModel;
                this.lensConfiguratorData.variantShape = this._variantShape; //BS-1916
                this.lensConfiguratorData.shapeSize = this._shapeSize; //BS-1916
                this.lensConfiguratorData.rimlessVariant = this._rimlessVariant; //BS-1888
                this.lensConfiguratorData.bridgeSize = this._bridgeSize; //BS-2015

                this.dispatchEvent(
                    new CustomEvent(SEND_INSERTED_LENS_CONFIGURATOR_DATA, {
                        detail: {
                            insertedData: data,
                            inputLensConfiguratorData: this.lensConfiguratorData
                        }
                    })
                );
            })
            .catch((error) => {
                console.log('error ', error);
            });
    }

    @api
    async handleUpdateInputData() {
        await updateLensConfiguratorData({
            lensConfiguratorId: this.lensConfiguratorCollection.lensConfiguratorID,
            fieldNameVsLensConfiguratorDataMap: this.lensConfiguratorData,
            language: LANG
        })
            .then((data) => {
                if (data != null && data != undefined) {
                    this.lensConfiguratorData.lensConfiguratorID = data;
                } else {
                    this.lensConfiguratorData.lensConfiguratorID = data;
                }
                this.lensConfiguratorData.productFrameType = this._productFrameType;
                this.lensConfiguratorData.productmodel = this._productModel;
                this.lensConfiguratorData.variantShape = this._variantShape; //BS-1916
                this.lensConfiguratorData.shapeSize = this._shapeSize; //BS-1916
                this.lensConfiguratorData.rimlessVariant = this._rimlessVariant; //BS-1888
                this.lensConfiguratorData.bridgeSize = this._bridgeSize; //BS-2015

                this.dispatchEvent(
                    new CustomEvent(SEND_INSERTED_LENS_CONFIGURATOR_DATA, {
                        detail: {
                            insertedData: data,
                            inputLensConfiguratorData: this.lensConfiguratorData
                        }
                    })
                );
            })
            .catch((error) => {
                console.error(error);
            });
    }

    //BS-788
    connectedCallback() {
        //BS-1117 - Capturing the current page source (VS / RX)
        if (this.pageSource != null && this.pageSource != undefined) {
            if (this.pageSource == VS_PAGE) {
                this.applicableBrand = VISION_SENSATION;
            } else if (this.pageSource == RX_PAGE) {
                this.applicableBrand = RX_GLAZING;
            }
        }
        //BS-1117 - End

        this.createLabels();
        if (this.pageSource == VS_PAGE && this.productData) {
            this.getFrameTypeAndModelData();
        }
        if (this.pageSource == RX_PAGE) {
            this.createLensConfiguratorData();
        }
        this.setValuesOfFrameInformation();
    } //end connectedCallback

    //BS-788 creating lens configurator data for insert
    @api
    createLensConfiguratorData() {
        this.lensConfiguratorData.accountId = this.effectiveAccountId;
        this.lensConfiguratorData.collectionDesignFamily = this.productData.collectionDesignFamily;
        this.lensConfiguratorData.selectedFrameSKU = this.productData.selectedFrameSKU;
        this.lensConfiguratorData.productIdPDP = this.productData.productId;
        this.lensConfiguratorData.frameColor = this.productData.frameColor;
        this.lensConfiguratorData.frameColorDescription = this.productData.frameColorDescription;
        this.lensConfiguratorData.bridgeSize = this.productData.bridgeSize;
        this.lensConfiguratorData.templeLength = this.productData.templeLength;
        this.lensConfiguratorData.lensSize = this.productData.lensSize;
        this.lensConfiguratorData.eeSize = this.productData.size;
        this.lensConfiguratorData.status = OPEN_STATUS;
        this.lensConfiguratorData.productFrameType = this._productFrameType;
        this.lensConfiguratorData.productmodel = this._productModel;
        this.lensConfiguratorData.variantShape = this._variantShape; //BS-1916
        this.lensConfiguratorData.shapeSize = this._shapeSize; //BS-1916
        this.lensConfiguratorData.rimlessVariant = this._rimlessVariant; //BS-1888
        for (let data in this.orderFrameData) {
            if (this.orderFrameData[data].fieldName == CUSTOMER_NAME) {
                this.lensConfiguratorData.customerName = this.orderFrameData[data].value;
            } else if (this.orderFrameData[data].fieldName == CLERK) {
                this.lensConfiguratorData.clerk = this.orderFrameData[data].value;
            } else if (this.orderFrameData[data].isFrameType == true && this.orderFrameData[data].isChecked == true) {
                this.lensConfiguratorData.frameType = this.orderFrameData[data].fieldName;
            } else if (this.orderFrameData[data].isOrderType && this.orderFrameData[data].isChecked == true) {
                this.lensConfiguratorData.orderType = this.orderFrameData[data].fieldName;
            }
        }

        //BS-1117
        if (this.applicableBrand != null && this.applicableBrand != undefined) {
            this.lensConfiguratorData.applicableBrand = this.applicableBrand;
        }
        //BS-1117
    } //end method

    /**
     * This method is used to set the label values from custom label
     * BS-788
     *
     */
    createLabels() {
        this._confirmMessage = B2B_VS_RX_CONFIRM_MSG;
        this._frameInforamtionHeaderLabel = B2B_VS_RX_FRAME_REFERENCE_LABELS.split(',')[0];
        this._exitButtonLabel = B2B_VS_RX_LABELS.split(',')[4].toUpperCase();
        this._saveAndExitButtonLabel = B2B_VS_RX_LABELS.split(',')[5].toUpperCase(); //BS-788
    }

    //BS-788 setting frame informations info
    setValuesOfFrameInformation() {
        this.showImage = this.productData ? this.productData.image : null;

        //for show VX page frame inforamtion
        if (this.pageSource == VS_PAGE && this.productData) {
            //Iterate over the custom label values and prepare the collection
            for (let i = 0; i < B2B_VS_PRODUCTS_FIELDS_LABELS.split(',').length; i++) {
                const setFieldsValues = {};
                if (i == 0) {
                    setFieldsValues.label = B2B_VS_PRODUCTS_FIELDS_LABELS.split(',')[i];
                    setFieldsValues.value = this.productData.modelNameNumber; //BS-1701
                } else if (i == 1) {
                    setFieldsValues.label = B2B_VS_PRODUCTS_FIELDS_LABELS.split(',')[i];
                    /* Start : BS-2158/BS-2174 */
                    setFieldsValues.value = this.productData.frameColor + ' ' + this.productData.frameColorDescription;
                    setFieldsValues.backgroundColorUpper =
                        this.productData.hexcode !== undefined && this.productData.hexcode !== null
                            ? STYLING_BACKGROUND_COLOR + this.productData.hexcode
                            : false;
                    setFieldsValues.backgroundColorLower =
                        this.productData.hexcodeAccent !== undefined && this.productData.hexcodeAccent !== null
                            ? STYLING_BACKGROUND_COLOR + this.productData.hexcodeAccent
                            : false;
                    if (setFieldsValues.backgroundColorLower === false && setFieldsValues.backgroundColorUpper !== undefined) {
                        setFieldsValues.backgroundColorLower = setFieldsValues.backgroundColorUpper;
                        setFieldsValues.showColorBubble = true;
                    }
                    if (setFieldsValues.backgroundColorUpper === false && setFieldsValues.backgroundColorLower !== undefined) {
                        setFieldsValues.backgroundColorUpper = setFieldsValues.backgroundColorLower;
                        setFieldsValues.showColorBubble = true;
                    } else if (setFieldsValues.backgroundColorUpper !== false && setFieldsValues.backgroundColorLower !== false) {
                        setFieldsValues.showColorBubble = true;
                    }
                    /* End : BS-2158/BS-2174 */
                } else if (i == 2) {
                    setFieldsValues.label = B2B_VS_PRODUCTS_FIELDS_LABELS.split(',')[i];
                    setFieldsValues.value = this.productData.bridgeSize + '/' + this.productData.templeLength;
                }

                this._frameInformationSummaryCollection.push(setFieldsValues);
            }
        } else if (this.productData) {
            //This is for RX solution page
            //Iterate over the custom label values and prepare the collection
            for (let i = 0; i < B2B_RX_PRODUCTS_FIELDS_LABELS.split(',').length; i++) {
                const setFieldsValues = {};
                if (i == 0) {
                    setFieldsValues.label = B2B_RX_PRODUCTS_FIELDS_LABELS.split(',')[i];
                    setFieldsValues.value = this.productData.modelNameNumber; //BS-1701
                    this._frameInformationSummaryCollection.push(setFieldsValues);
                } else if (i == 1) {
                    setFieldsValues.label = B2B_RX_PRODUCTS_FIELDS_LABELS.split(',')[i];
                    setFieldsValues.value = this.productData.frameColor + ' ' + this.productData.frameColorDescription;
                    /* Start : BS-2158/BS-2174 */
                    setFieldsValues.backgroundColorUpper =
                        this.productData.hexcode !== undefined && this.productData.hexcode !== null
                            ? STYLING_BACKGROUND_COLOR + this.productData.hexcode
                            : false;
                    setFieldsValues.backgroundColorLower =
                        this.productData.hexcodeAccent !== undefined && this.productData.hexcodeAccent !== null
                            ? STYLING_BACKGROUND_COLOR + this.productData.hexcodeAccent
                            : false;
                    if (setFieldsValues.backgroundColorLower === false && setFieldsValues.backgroundColorUpper !== undefined) {
                        setFieldsValues.backgroundColorLower = setFieldsValues.backgroundColorUpper;
                        setFieldsValues.showColorBubble = true;
                    }
                    if (setFieldsValues.backgroundColorUpper === false && setFieldsValues.backgroundColorLower !== undefined) {
                        setFieldsValues.backgroundColorUpper = setFieldsValues.backgroundColorLower;
                        setFieldsValues.showColorBubble = true;
                    } else if (setFieldsValues.backgroundColorUpper !== false && setFieldsValues.backgroundColorLower !== false) {
                        setFieldsValues.showColorBubble = true;
                    }
                    /* End : BS-2158/BS-2174 */
                    this._frameInformationSummaryCollection.push(setFieldsValues);
                } else if (i == 2) {
                    /**START OF BS-1142 - Remove len size and replace with product size*/
                    setFieldsValues.label = B2B_RX_PRODUCTS_FIELDS_LABELS.split(',')[i];
                    if (this.productData.size != null && this.productData.size != undefined) {
                        setFieldsValues.value = this.productData.size;
                    } else {
                        setFieldsValues.value = '';
                    }
                    this._frameInformationSummaryCollection.push(setFieldsValues);
                } /**END OF BS-1142 */
            }
        }
    } //end setValuesOfFrameInformation

    //BS-788 to close popup
    handleDialogClose() {
        this.openConfirmPopup = false;
    }

    getFrameTypeAndModelData() {
        getFrameTypeAndModelData({
            productId: this.productData.productIdPDP
        })
            .then((result) => {
                if (result) {
                    let productDataObj = JSON.parse(JSON.stringify(result));
                    this._productFrameType = productDataObj[0].B2B_Frame_type__c;
                    this._productModel = productDataObj[0].B2B_Model__c;
                    this._variantShape = productDataObj[0].B2B_Variant_Shape__c; //BS-1916
                    this._shapeSize = productDataObj[0].B2B_Shape_Size__c; //BS-1916
                    this._rimlessVariant = productDataObj[0].B2B_Rimless_Variant__c; //BS-1888
                    this._bridgeSize = productDataObj[0].B2B_Bridge_Size__c; //BS-2015
                    this._frameColorBubbleData = { hexcode: productDataObj[0].B2B_Hexcode__c, hexcodeAccent: productDataObj[0].B2B_Hexcode_Accent__c };
                    this.createLensConfiguratorData();
                }
            })
            .catch((error) => {});
    }

    //BS-788 redirect to home page
    redirectToHomePage() {
        //Navigate to home page
        this[NavigationMixin.Navigate]({
            type: STANDARD_NAMED_PAGE,
            attributes: {
                pageName: HOME_PAGE
            }
        });
    }

    //BS-788 will run when click on save and exit
    saveDataAndRedirectToHome() {
        //saving lens configurator data in backend
        this.handleSaveInputData(); //BS-788

        //Navigate to home page
        this[NavigationMixin.Navigate]({
            type: STANDARD_NAMED_PAGE,
            attributes: {
                pageName: HOME_PAGE
            }
        });
    } //end

    //BS-788 redirect to order page when click on edit icon
    handleFrameInformationEdit(event) {
        //BS-1117 Start
        if (this.isSourceFromOutsideConfigurator != null && this.isSourceFromOutsideConfigurator != undefined && this.isSourceFromOutsideConfigurator == true) {
            this[NavigationMixin.Navigate]({
                type: STANDARD_RECORD_PAGE,
                attributes: {
                    recordId: this.recordId,
                    actionName: PAGE_MODE_VIEW
                },
                state: {
                    fromVSRX: true, //This attribute is used to determine whether user has naviagyed from PDP page (True/False)
                    customerInformationSummaryCollectionFromVSRX: JSON.stringify(this.orderInformationCollection) // This collections contains the information of customer entered by user on UI
                }
            });
        } else {
            this.fireUpdateProgressBar(3, true, false);
        }
        //BS-1117 End
    }

    /**
     * This method is use to fire event: 'updateprogressbar' that updates the progress bar step of 'c/c/b2b_progressBar_Component' according to stepNumber provided
     * BS-788
     * @return   stepNumber     : Step Number that needs to be set as current active step (Number)
     *           activeStatus   : Step active status to determine whether above step is set to be active - (Boolean)
     *           successStatus  : Step success status to determine whether above step is set to be completed - (Boolean)
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
}
