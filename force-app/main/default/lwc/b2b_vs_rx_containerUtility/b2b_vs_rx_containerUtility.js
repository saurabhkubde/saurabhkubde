//GET LABELS
import B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS from '@salesforce/label/c.B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS';
import B2B_VS_RX_LABELS from '@salesforce/label/c.B2B_VS_RX_Labels'; //BS-655 Labels needed for VS/RX Component
import B2B_VS_RX_ORDER_REFERENCE_LABELS from '@salesforce/label/c.B2B_VS_RX_Order_Reference_Labels';
import B2B_CONNECT_API_ERROR_FOR_CURRENCY_MISMATCH from '@salesforce/label/c.B2B_CONNECT_API_ERROR_FOR_CURRENCY_MISMATCH'; //BS-1245
import B2B_VS_RX_PRESCRIPTION_VALUE_INPUT_FIELDS_NAME from '@salesforce/label/c.B2B_VS_RX_Prescription_Value_Input_Fields_Name'; //BS-1054
import checkVisionZoneAnalysisResult from '@salesforce/apex/B2B_VisionZoneAnalysisCalloutUtility.checkVisionZoneAnalysisResult'; //BS-1622
import updateLensConfiguratorRecordForLensEdge from '@salesforce/apex/B2B_VisionSensation_RX_Controller.updateLensConfiguratorRecordForLensEdge'; //BS-1845

const NEXT_ACTION = 'Next'; //BS-655
const BACK_ACTION = 'Back'; //BS-655
const SAVE_NEXT_ACTION = 'SaveAndNext'; //BS-788
const PROGRESS_BAR_COMPONENT = 'c-b2b_progress-bar-component'; //BS-655
const EDIT_MODE = 'edit'; //BS-654
const READ_ONLY_MODE = 'read'; //BS-654
const PAGE_SOURCE_VS = 'VS'; //BS-655
const PAGE_SOURCE_RX = 'RX'; //BS-655
const RX_CENTERING_DATA_COMPONENT = 'c-b2b_vsrxCenteringData'; // Added as part of BS-1055
const ORDER_REFERENCE_COMPONENT = 'c-b2b_vs_rx_order_reference_component'; //BS-654
const RX_SOLUTION_COMPONENT = 'c-b2b_rx_solution'; // BS-1051
const LENS_SELECTION_COMPONENT = 'c-b2b_vs_rx_lens-selection'; //BS-961
const PRESCRIPTION_VALUE_COMPONENT = 'c-b2b_vsrx-prescription-value';
const CHECK_AND_ADD_TO_CART_BUTTON_LABEL = 'Check and add to cart'; // BS-728
const STANDARD_NAMED_PAGE = 'standard__namedPage'; //BS-655
const HOME_PAGE = 'home'; //BS-655
const KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_VS = 'selectedSpecialHandlingOptionForVS';
const KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX = 'selectedSpecialHandlingOptionForRX';
const KEY_FOR_USER_NOTE_ENTERED_FOR_VS = 'userNoteForVS';
const KEY_FOR_USER_NOTE_ENTERED_FOR_RX = 'userNoteForRX';
const KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_VS = 'customerServicePreferenceForVS';
const KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX = 'customerServicePreferenceForRX';
const LOCAL_LENS_CONFIGURATOR_DATA_KEY_VS = 'lensConfiguratorCollectionVS'; //BS-724
const LOCAL_LENS_CONFIGURATOR_DATA_KEY_RX = 'lensConfiguratorCollectionRX'; //BS-724
const MY_VS_RX_PAGE = 'My_Vision_Sensation_RX_glazing__c'; //BS-997
const SHAPE_SELECTION_SCREEN = 'c-b2b_vs_shape_selection_component';
const ERROR_503 = 'Error_503'; //BS-1815

/**
 * This method is used to operate progress bar section according to action (Next, Previous) and step number
 * Below Mentioned are the three valid scenarios for successful operation :
 *      1. NEXT         :   On click of 'NEXT' button on UI by user, invoke method: "handleProgressBarStepsUpdate" of 'b2b_progressBarComponent' and increment the progress bar step
 *      2. BACK         :   On click of 'BACK' button on UI by user, invoke method: "handleProgressBarStepsUpdate" of 'b2b_progressBarComponent' and decrement the progress bar step
 * BS-655
 * @param   selectedAction :   Selected Action by User (Next, Back,Save and Next)
 * @param   currentActiveStep : The step number to which the progressbar needs to be updated.
 * @param   isCurrentActiveStepFetchedFromLocalStorage : Boolean to control
 * @param   template : Reference to the template node of the DOM.
 */
export function operateProgressBarCollection(selectedAction, currentActiveStep, isCurrentActiveStepFetchedFromLocalStorage, template) {
    let currentStepNumber = currentActiveStep.stepNumber; //Capturing current Active stepNumber
    const progressBarComponent = template.querySelector(PROGRESS_BAR_COMPONENT); //Capturing 'c-b2b_progress-bar-component' component
    if (selectedAction != null && selectedAction != undefined) {
        // Invoking method: 'handleProgressBarStepsUpdate' of 'c-b2b_progress-bar-component' according to action selected by user
        if (progressBarComponent != null && progressBarComponent != undefined && selectedAction == NEXT_ACTION) {
            isCurrentActiveStepFetchedFromLocalStorage = false;
            // If the 'NEXT' button is pressed, invkong above mentioned method and passing action parameter as 'NEXT_ACTION' along with current Step Number
            progressBarComponent.handleProgressBarStepsUpdate(NEXT_ACTION, currentStepNumber);
        } else if (progressBarComponent != null && progressBarComponent != undefined && selectedAction == BACK_ACTION) {
            // If the 'BACK' button is pressed, invkong above mentioned method and passing action parameter as 'BACK_ACTION' along with current Step Number
            isCurrentActiveStepFetchedFromLocalStorage = false;
            progressBarComponent.handleProgressBarStepsUpdate(BACK_ACTION, currentStepNumber);
        } else if (progressBarComponent != null && progressBarComponent != undefined && selectedAction == SAVE_NEXT_ACTION) {
            // If the 'BACK' button is pressed, invkong above mentioned method and passing action parameter as 'BACK_ACTION' along with current Step Number
            isCurrentActiveStepFetchedFromLocalStorage = false;
            progressBarComponent.handleProgressBarStepsUpdate(NEXT_ACTION, currentStepNumber);
        }
    }
    return isCurrentActiveStepFetchedFromLocalStorage;
}

//BS-1396: Utility for updateProgressBarToCustomStep method which sets the visibility and mode of the components to be shown based on the steps.
export function setComponentVisibility(currentStepNumber, template, pageSource) {
    let componentVisibilityObject = {};

    // If Current active stepNumber is 1 then, showing 'c/b2b_vs_order_reference_component' on UI
    if (currentStepNumber == 1) {
        //this._showOrderReferenceComponent = true;
        //If the current active step is stepNumber: 1 then, making back button as inactive,
        //as user cannot go to previous step as user can click cancel to navigate back to previous screen
        componentVisibilityObject._showCalculateLensComponent = false; //BS-727
        componentVisibilityObject._backButtonActive = false;
        componentVisibilityObject._cancelButtonActive = true;
        componentVisibilityObject._nextButtonActive = true;
        componentVisibilityObject._saveAndNextButtonActive = false;
        componentVisibilityObject._previewAndNextButtonActive = false;
        componentVisibilityObject._showFrameSearchComponent = false;
        componentVisibilityObject._showFrameSelectionComponent = false;
        componentVisibilityObject._showFrameDetailsComponent = false;
        componentVisibilityObject._showRXSolutionComponent = false;
        componentVisibilityObject._lensSelectionComponent = false;
        componentVisibilityObject._showCenteringComponent = false;
        componentVisibilityObject._prescriptionValueComponent = false; //BS-725
        componentVisibilityObject._addToCartButtonActive = false; // 728
        componentVisibilityObject._showAddToCartComponent = false; // 728
        //Setting up component mode of 'c/c/b2b_vs_order_reference_component' to Edit mode as current active step is 1
        componentVisibilityObject._orderReferenceComponentMode = EDIT_MODE;
        componentVisibilityObject._showOrderReferenceComponent = true;
        // Invoking 'setupComponentMode' function on 'c/c/b2b_vs_order_reference_component' to setup opearting mode
        const orderReferenceComponent = template.querySelector(ORDER_REFERENCE_COMPONENT);
        if (orderReferenceComponent != null && orderReferenceComponent != undefined) {
            orderReferenceComponent.setupComponentMode(componentVisibilityObject._orderReferenceComponentMode);
        }
    } else if (currentStepNumber == 2) {
        componentVisibilityObject._showCalculateLensComponent = false; //BS-727
        // If Current active stepNumber is 2 then, showing 'c/c/b2b_vs_rx_search_result_container' on UI - BS-708
        componentVisibilityObject._backButtonActive = true;
        componentVisibilityObject._cancelButtonActive = false;
        componentVisibilityObject._nextButtonActive = false;
        componentVisibilityObject._saveAndNextButtonActive = false;
        componentVisibilityObject._previewAndNextButtonActive = false;
        componentVisibilityObject._showRXSolutionComponent = false;
        componentVisibilityObject._orderReferenceComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._showOrderReferenceComponent = false;
        componentVisibilityObject._showFrameSelectionComponent = false;
        componentVisibilityObject._showFrameDetailsComponent = false;
        componentVisibilityObject._showCenteringComponent = false;
        componentVisibilityObject._prescriptionValueComponent = false; //BS-725
        componentVisibilityObject._addToCartButtonActive = false; // 728
        componentVisibilityObject._showAddToCartComponent = false; // 728
        componentVisibilityObject._lensSelectionComponent = false;
    } else if (currentStepNumber == 3) {
        componentVisibilityObject._showCalculateLensComponent = false; //BS-727
        // If Current active stepNumber is 3 then, showing 'c/b2b_vs_rx_product_details_component' on UI - BS-708
        componentVisibilityObject._showOrderReferenceComponent = false;
        componentVisibilityObject._showFrameSearchComponent = false;
        componentVisibilityObject._showRXSolutionComponent = false;
        componentVisibilityObject._orderReferenceComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._showFrameDetailsComponent = false;
        componentVisibilityObject._backButtonActive = true;
        componentVisibilityObject._cancelButtonActive = true;
        componentVisibilityObject._nextButtonActive = true;
        componentVisibilityObject._saveAndNextButtonActive = false;
        componentVisibilityObject._previewAndNextButtonActive = false;
        componentVisibilityObject._showFrameSelectionComponent = true;
        componentVisibilityObject._prescriptionValueComponent = false; //BS-725
        componentVisibilityObject._showCenteringComponent = false; //BS-726
        componentVisibilityObject._lensSelectionComponent = false; //BS-723
        componentVisibilityObject._addToCartButtonActive = false; // 728
        componentVisibilityObject._showAddToCartComponent = false; // 728
    } else if (currentStepNumber == 4) {
        componentVisibilityObject._showCalculateLensComponent = false; //BS-727
        //If Current active stepNumber is 4 then, showing 'c/b2b_vs_rx_frame_information' on UI - BS-788
        componentVisibilityObject._showFrameSelectionComponent = false;
        componentVisibilityObject._showOrderReferenceComponent = true;
        componentVisibilityObject._showFrameSearchComponent = false;
        componentVisibilityObject._showRXSolutionComponent = false;
        componentVisibilityObject._orderReferenceComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._backButtonActive = true;
        componentVisibilityObject._cancelButtonActive = true;
        componentVisibilityObject._nextButtonActive = false;
        componentVisibilityObject._saveAndNextButtonActive = true; //BS-788
        componentVisibilityObject._previewAndNextButtonActive = false;
        componentVisibilityObject._showFrameDetailsComponent = true; //BS-788
        componentVisibilityObject._lensSelectionComponent = false; //BS-723
        componentVisibilityObject._prescriptionValueComponent = false; //BS-725
        componentVisibilityObject._showCenteringComponent = false; //BS-726
        componentVisibilityObject._addToCartButtonActive = false; // 728
        componentVisibilityObject._showAddToCartComponent = false; // 728
    } else if (currentStepNumber == 5) {
        //this is for RX Solution next screen BS-724
        if (pageSource == PAGE_SOURCE_RX) {
            componentVisibilityObject._showOrderReferenceComponent = true;
            componentVisibilityObject._showFrameSearchComponent = false;
            componentVisibilityObject._orderReferenceComponentMode = READ_ONLY_MODE;
            componentVisibilityObject._backButtonActive = true;
            componentVisibilityObject._cancelButtonActive = true;
            componentVisibilityObject._nextButtonActive = false;
            componentVisibilityObject._saveAndNextButtonActive = true;
            componentVisibilityObject._previewAndNextButtonActive = false;
            componentVisibilityObject._showFrameSelectionComponent = false;
            componentVisibilityObject._showRXSolutionComponent = true;
            componentVisibilityObject._showShapeSelectionComponent = false;
            componentVisibilityObject._showFrameDetailsComponent = true;
            componentVisibilityObject._prescriptionValueComponent = false; //BS-725
            componentVisibilityObject._lensSelectionComponent = false; //BS-723
            componentVisibilityObject._showCenteringComponent = false; //BS-726
            componentVisibilityObject._addToCartButtonActive = false; // 728
            componentVisibilityObject._showAddToCartComponent = false; // 728

            //Setting up component mode of 'c/c/b2b_rx_solution' to Edit mode as current active step is 5
            componentVisibilityObject._rxSolutionComponentMode = EDIT_MODE;
            // Invoking 'setupComponentMode' function on 'c/c/b2b_rx_solution' to setup opearting mode
            const rxSolutionComponent = template.querySelector(RX_SOLUTION_COMPONENT);
            if (rxSolutionComponent != null && rxSolutionComponent != undefined) {
                rxSolutionComponent.setupComponentMode(componentVisibilityObject._rxSolutionComponentMode);
            }
        } else if (pageSource == PAGE_SOURCE_VS) {
            componentVisibilityObject._showOrderReferenceComponent = true;
            componentVisibilityObject._showFrameSearchComponent = false;
            componentVisibilityObject._orderReferenceComponentMode = READ_ONLY_MODE;
            componentVisibilityObject._backButtonActive = true;
            componentVisibilityObject._cancelButtonActive = true;
            componentVisibilityObject._nextButtonActive = false;
            componentVisibilityObject._saveAndNextButtonActive = true;
            componentVisibilityObject._previewAndNextButtonActive = false;
            componentVisibilityObject._showFrameSelectionComponent = false;
            componentVisibilityObject._showFrameDetailsComponent = true;
            componentVisibilityObject._showRXSolutionComponent = false;
            componentVisibilityObject._showShapeSelectionComponent = true;
            componentVisibilityObject._shapeSelectionVisibilityMode = EDIT_MODE;
            const shapeSelectionComponent = template.querySelector(SHAPE_SELECTION_SCREEN);
            if (shapeSelectionComponent != null && shapeSelectionComponent != undefined) {
                shapeSelectionComponent.setupComponentMode(componentVisibilityObject._shapeSelectionVisibilityMode);
            }
            componentVisibilityObject._prescriptionValueComponent = false; //BS-725
            componentVisibilityObject._showCenteringComponent = false; //BS-726
            componentVisibilityObject._lensSelectionComponent = false; //BS-723
            componentVisibilityObject._addToCartButtonActive = false; // 728
            componentVisibilityObject._showAddToCartComponent = false; // 728
        }
    } else if (currentStepNumber == 6) {
        //setting read only mode for Rx solution on step 6
        componentVisibilityObject._showFrameDetailsComponent = true;
        if (pageSource === PAGE_SOURCE_RX) {
            componentVisibilityObject._showRXSolutionComponent = true;
            componentVisibilityObject._rxSolutionComponentMode = READ_ONLY_MODE;
            const rxSolutionComponent = template.querySelector(RX_SOLUTION_COMPONENT);
            if (rxSolutionComponent != null && rxSolutionComponent != undefined) {
                rxSolutionComponent.setupComponentMode(componentVisibilityObject._rxSolutionComponentMode);
            }
            //BS-724
        } else if (pageSource == PAGE_SOURCE_VS) {
            componentVisibilityObject._showShapeSelectionComponent = true;
            componentVisibilityObject._shapeSelectionVisibilityMode = READ_ONLY_MODE;
            const shapeSelectionComponent = template.querySelector(SHAPE_SELECTION_SCREEN);
            if (shapeSelectionComponent != null && shapeSelectionComponent != undefined) {
                shapeSelectionComponent.setupComponentMode(componentVisibilityObject._shapeSelectionVisibilityMode);
            }
        }

        componentVisibilityObject._lensSelectionComponentMode = EDIT_MODE; //BS-961

        // Invoking 'setupComponentMode' function on 'c/c/b2b_lens_selection' to setup opearting mode
        const lensSolutionComponent = template.querySelector(LENS_SELECTION_COMPONENT);
        if (lensSolutionComponent != null && lensSolutionComponent != undefined) {
            lensSolutionComponent.setupComponentMode(componentVisibilityObject._lensSelectionComponentMode);
        }

        componentVisibilityObject._showOrderReferenceComponent = true;
        componentVisibilityObject._showFrameSearchComponent = false;
        componentVisibilityObject._orderReferenceComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._backButtonActive = true;
        componentVisibilityObject._cancelButtonActive = true;
        componentVisibilityObject._nextButtonActive = false;
        componentVisibilityObject._saveAndNextButtonActive = true;
        componentVisibilityObject._previewAndNextButtonActive = false;
        componentVisibilityObject._showFrameSelectionComponent = false;
        componentVisibilityObject._prescriptionValueComponent = false; //BS-725
        componentVisibilityObject._showCenteringComponent = false; //BS-726
        componentVisibilityObject._lensSelectionComponent = true; //BS-723
        componentVisibilityObject._addToCartButtonActive = false; // 728
        componentVisibilityObject._showAddToCartComponent = false; // 728
    } else if (currentStepNumber == 7) {
        if (pageSource == PAGE_SOURCE_VS) {
            componentVisibilityObject._shapeSelectionVisibilityMode = READ_ONLY_MODE;
            componentVisibilityObject._showShapeSelectionComponent = true;
        }
        componentVisibilityObject._showCalculateLensComponent = false; //BS-727
        componentVisibilityObject._showOrderReferenceComponent = true;
        componentVisibilityObject._showFrameSearchComponent = false;
        componentVisibilityObject._orderReferenceComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._lensSelectionComponentMode = READ_ONLY_MODE; //BS-961
        // Invoking 'setupComponentMode' function on 'c/c/b2b_lens_selection' to setup opearting mode
        const lensSolutionComponent = template.querySelector(LENS_SELECTION_COMPONENT);
        if (lensSolutionComponent != null && lensSolutionComponent != undefined) {
            lensSolutionComponent.setupComponentMode(componentVisibilityObject._lensSelectionComponentMode);
        }
        componentVisibilityObject._backButtonActive = true;
        componentVisibilityObject._cancelButtonActive = true;
        componentVisibilityObject._nextButtonActive = false;
        componentVisibilityObject._saveAndNextButtonActive = true;
        componentVisibilityObject._previewAndNextButtonActive = false;
        componentVisibilityObject._showFrameDetailsComponent = true; //BS-788
        componentVisibilityObject._showRXSolutionComponent = true;
        componentVisibilityObject._rxSolutionComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._prescriptionValueComponent = true; //BS-725
        componentVisibilityObject._prescriptionValueComponentMode = EDIT_MODE;
        const prescriptionValueComponent = template.querySelector(PRESCRIPTION_VALUE_COMPONENT);
        if (prescriptionValueComponent != null && prescriptionValueComponent != undefined) {
            prescriptionValueComponent.setupComponentMode(componentVisibilityObject._prescriptionValueComponentMode);
        }
        componentVisibilityObject._showCenteringComponent = false; //BS-726
        componentVisibilityObject._lensSelectionComponent = true;
        componentVisibilityObject._addToCartButtonActive = false; // 728
        componentVisibilityObject._showAddToCartComponent = false; // 728
    } else if (currentStepNumber == 8) {
        componentVisibilityObject._showCalculateLensComponent = false; //BS-727
        componentVisibilityObject._showOrderReferenceComponent = true;
        componentVisibilityObject._showFrameSearchComponent = false;
        componentVisibilityObject._orderReferenceComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._lensSelectionComponentMode = READ_ONLY_MODE; //BS-961
        componentVisibilityObject._backButtonActive = true;
        componentVisibilityObject._cancelButtonActive = true;
        componentVisibilityObject._nextButtonActive = true;
        componentVisibilityObject._saveAndNextButtonActive = false;
        componentVisibilityObject._previewAndNextButtonActive = true;
        componentVisibilityObject._showFrameDetailsComponent = true; //BS-788
        componentVisibilityObject._showRXSolutionComponent = true;
        if (pageSource == PAGE_SOURCE_VS) {
            componentVisibilityObject._shapeSelectionVisibilityMode = READ_ONLY_MODE;
            componentVisibilityObject._showShapeSelectionComponent = true;
        }
        componentVisibilityObject._rxSolutionComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._prescriptionValueComponent = true; //BS-1054
        componentVisibilityObject._prescriptionValueComponentMode = READ_ONLY_MODE;
        const prescriptionValueComponent = template.querySelector(PRESCRIPTION_VALUE_COMPONENT);
        if (prescriptionValueComponent != null && prescriptionValueComponent != undefined) {
            prescriptionValueComponent.setupComponentMode(componentVisibilityObject._prescriptionValueComponentMode);
        }

        componentVisibilityObject._showCenteringComponent = true; //BS-726

        //BS-1055 : Setting up component mode of 'c/c/b2b_vsrxCenteringData' to Edit mode as current active step is 5
        componentVisibilityObject._centeringDataComponentMode = EDIT_MODE;
        //BS-1055 :  Invoking 'setupComponentMode' function on 'c/c/b2b_vsrxCenteringData' to setup opearting mode
        const rxcenteringdataComponent = template.querySelector(RX_CENTERING_DATA_COMPONENT);
        if (rxcenteringdataComponent != null && rxcenteringdataComponent != undefined) {
            rxcenteringdataComponent.setupComponentMode(componentVisibilityObject._centeringDataComponentMode);
        }
        componentVisibilityObject._lensSelectionComponent = true;
        componentVisibilityObject._addToCartButtonActive = false; // 728
        componentVisibilityObject._showAddToCartComponent = false; // 728
    } else if (currentStepNumber == 9) {
        componentVisibilityObject._calculateLensComponentMode = EDIT_MODE;
        //BS-727
        componentVisibilityObject._centeringDataComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._lensSelectionComponentMode = READ_ONLY_MODE; //BS-1248
        componentVisibilityObject._showOrderReferenceComponent = true;
        componentVisibilityObject._showFrameSearchComponent = false;
        componentVisibilityObject._orderReferenceComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._backButtonActive = true;
        componentVisibilityObject._cancelButtonActive = true;
        componentVisibilityObject._nextButtonActive = false;
        componentVisibilityObject._saveAndNextButtonActive = false; //BS-1244
        componentVisibilityObject._previewAndNextButtonActive = false;
        componentVisibilityObject._showFrameDetailsComponent = true; //BS-788
        componentVisibilityObject._showRXSolutionComponent = true;
        if (pageSource == PAGE_SOURCE_VS) {
            componentVisibilityObject._shapeSelectionVisibilityMode = READ_ONLY_MODE;
            componentVisibilityObject._showShapeSelectionComponent = true;
        }
        componentVisibilityObject._showCenteringComponent = true; //BS-726
        componentVisibilityObject._rxSolutionComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._prescriptionValueComponent = true; //BS-1054
        componentVisibilityObject._prescriptionValueComponentMode = READ_ONLY_MODE; //BS-1054
        componentVisibilityObject._showCalculateLensComponent = true;
        componentVisibilityObject._lensSelectionComponent = true; //BS-1248
        componentVisibilityObject._addToCartButtonActive = true; //BS-1244
        componentVisibilityObject._showAddToCartComponent = true; //BS-1244

        /**
         * Added as part of BS-1055 : Start
         * Block to update the mode in which the component renders on UI
         */
        const rxcenteringdataComponent = template.querySelector(RX_CENTERING_DATA_COMPONENT);
        if (rxcenteringdataComponent != null && rxcenteringdataComponent != undefined) {
            rxcenteringdataComponent.setupComponentMode(componentVisibilityObject._centeringDataComponentMode);
        }
        /* End BS-1055 */
    } else if (currentStepNumber == 10) {
        componentVisibilityObject._showCalculateLensComponent = false; //BS-1244
        componentVisibilityObject._rxSolutionComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._lensSelectionComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._centeringDataComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._orderReferenceComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._showOrderReferenceComponent = true;
        componentVisibilityObject._showFrameSearchComponent = false;
        componentVisibilityObject._backButtonActive = true;
        componentVisibilityObject._cancelButtonActive = true;
        componentVisibilityObject._previewAndNextButtonActive = false;
        componentVisibilityObject._nextButtonActive = false;
        componentVisibilityObject._saveAndNextButtonActive = false;
        componentVisibilityObject._showFrameDetailsComponent = true;
        componentVisibilityObject._showRXSolutionComponent = true;
        if (pageSource == PAGE_SOURCE_VS) {
            componentVisibilityObject._shapeSelectionVisibilityMode = READ_ONLY_MODE;
            componentVisibilityObject._showShapeSelectionComponent = true;
        }
        componentVisibilityObject._lensSelectionComponent = true;
        componentVisibilityObject._prescriptionValueComponent = true;
        componentVisibilityObject._prescriptionValueComponentMode = READ_ONLY_MODE; //BS-1054
        componentVisibilityObject._showCenteringComponent = true;
        componentVisibilityObject._addToCartButtonActive = true;
        componentVisibilityObject._showAddToCartComponent = true;
    } else if (currentStepNumber == 'final') {
        componentVisibilityObject._showCalculateLensComponent = false; //BS-727
        componentVisibilityObject._showOrderReferenceComponent = true;
        componentVisibilityObject._showFrameSearchComponent = false;
        componentVisibilityObject._orderReferenceComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._rxSolutionComponentMode = READ_ONLY_MODE;
        componentVisibilityObject._lensSelectionComponentMode = READ_ONLY_MODE; //BS-961
        componentVisibilityObject._showFrameDetailsComponent = true; //BS-788
        componentVisibilityObject._showRXSolutionComponent = true;
        if (pageSource == PAGE_SOURCE_VS) {
            componentVisibilityObject._shapeSelectionVisibilityMode = READ_ONLY_MODE;
            componentVisibilityObject._showShapeSelectionComponent = true;
        }
        componentVisibilityObject._backButtonActive = true;
        componentVisibilityObject._cancelButtonActive = true;
        componentVisibilityObject._nextButtonActive = false;
        componentVisibilityObject._previewAndNextButtonActive = false;
        componentVisibilityObject._saveAndNextButtonActive = true;
        componentVisibilityObject._prescriptionValueComponent = true; //BS-1054
        componentVisibilityObject._prescriptionValueComponentMode = READ_ONLY_MODE; //BS-1054
        componentVisibilityObject._showCenteringComponent = false; //BS-726
        componentVisibilityObject._lensSelectionComponent = true;
        componentVisibilityObject._addToCartButtonActive = false; // 728
        componentVisibilityObject._showAddToCartComponent = false; // 728
    }
    return componentVisibilityObject;
}

/**
 * This method is used to set the label values from custom label
 * BS-1396
 */
export function createLabels() {
    let labelObject = {};
    labelObject._nextButtonLabel = B2B_VS_RX_LABELS.split(',')[0].toUpperCase();
    labelObject._backButtonLabel = B2B_VS_RX_LABELS.split(',')[1].toUpperCase();
    labelObject._cancelButtonLabel = B2B_VS_RX_LABELS.split(',')[2].toUpperCase();
    labelObject._saveAndNextButtonLabel = B2B_VS_RX_LABELS.split(',')[3].toUpperCase(); //BS-788
    labelObject._previewAndNextButtonLabel = B2B_VS_RX_LABELS.split(',')[6].toUpperCase(); //BS-726
    labelObject._prescriptionValueFields = [];
    labelObject._prescriptionValueFields = B2B_VS_RX_PRESCRIPTION_VALUE_INPUT_FIELDS_NAME.split(',');
    labelObject._addToCartSuccessMessage = B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[4];
    labelObject._addToCartFailueMessage = B2B_VS_RX_ADD_TO_CART_UTILITY_LABELS.split(',')[5];
    labelObject._frameCategoryLabel = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[11];
    labelObject._opticalEyewearCategory = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[12];
    labelObject._currencyMismatchError = B2B_CONNECT_API_ERROR_FOR_CURRENCY_MISMATCH;
    labelObject._CancelButtonLabel = 'Cancel';
    labelObject._viewCartButtonLabel = 'View Cart';
    labelObject._checkAndAddToCartLabel = CHECK_AND_ADD_TO_CART_BUTTON_LABEL.toUpperCase(); //728
    labelObject._checkAndAddToCartButtonLabel = B2B_VS_RX_LABELS.split(',')[7].toUpperCase(); //BS-1034
    return labelObject;
}

/**
 * Utility for handleCancelButtonClick method sets the navgation or sets the boolean to show the pop-up message
 * BS-1396
 */
export function handleCancelButtonClickUtility(currentActiveStep, isNavigatedFromMyVSRX, template, pageSource) {
    if (currentActiveStep.stepNumber == 1 && isNavigatedFromMyVSRX != null && isNavigatedFromMyVSRX != undefined && isNavigatedFromMyVSRX == true) {
        const openModalPopup = template.querySelector(ORDER_REFERENCE_COMPONENT);
        openModalPopup.openCancelWarningPopup = true;
        return null;
    } else if (currentActiveStep.stepNumber == 1 && isNavigatedFromMyVSRX != null && isNavigatedFromMyVSRX != undefined && isNavigatedFromMyVSRX == false) {
        //BS-997
        //Navigate to home page
        return {
            type: STANDARD_NAMED_PAGE,
            attributes: {
                pageName: HOME_PAGE
            }
        };
    }
    //BS-788 opening data saved confirm popup from frame information component
    if (currentActiveStep.stepNumber == 4 && isNavigatedFromMyVSRX != null && isNavigatedFromMyVSRX != undefined && isNavigatedFromMyVSRX == false) {
        const openModalPopup = template.querySelector('c-b2b_vs_rx_frame_information');
        openModalPopup.openConfirmPopup = true;
        return null;
    }
    if (currentActiveStep.stepNumber !== 1 && isNavigatedFromMyVSRX != null && isNavigatedFromMyVSRX != undefined && isNavigatedFromMyVSRX == true) {
        return {
            type: STANDARD_NAMED_PAGE,
            attributes: {
                name: MY_VS_RX_PAGE
            },
            state: {
                pageSource: pageSource
            }
        };
    }
    if (currentActiveStep.stepNumber !== 1 && isNavigatedFromMyVSRX != null && isNavigatedFromMyVSRX != undefined && isNavigatedFromMyVSRX == false) {
        return {
            type: STANDARD_NAMED_PAGE,
            attributes: {
                pageName: HOME_PAGE
            }
        };
    }
}

/**
 * Utility for handleProgressBarExplicitely method this method is used to jump to specified step number.
 * BS-1396
 */
export function handleProgressBarChange(event, template) {
    if (event.detail != null && event.detail != undefined) {
        // capturing the details such as stepNumber to jup it's active status and success status
        let stepNumberToJump = event.detail.stepNumberToJump;
        let activeStatus = event.detail.activeStatus;
        let successStatus = event.detail.successStatus;
        const progressBarComponent = template.querySelector(PROGRESS_BAR_COMPONENT);

        //Invoking 'updateProgressBar' function on 'c/b2b_progressBar_Component' and supplying the details that will help to update progress bar steps accordingly
        progressBarComponent.updateProgressBar(stepNumberToJump, activeStatus, successStatus);
    }
}

/**
 * Utility to set user selection to local storage.
 * BS-1396
 */
export function setAddToCartStorage(userInputForNotesField, userInputForSpecialHandlingField, customerServicePrefernceChoice, pageSource) {
    if (pageSource != null && pageSource != undefined && pageSource == PAGE_SOURCE_VS) {
        localStorage.setItem(KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_VS, userInputForSpecialHandlingField);
        localStorage.setItem(KEY_FOR_USER_NOTE_ENTERED_FOR_VS, userInputForNotesField);
        localStorage.setItem(KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_VS, customerServicePrefernceChoice);
    } else if (pageSource != null && pageSource != undefined && pageSource == PAGE_SOURCE_RX) {
        localStorage.setItem(KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX, userInputForSpecialHandlingField);
        localStorage.setItem(KEY_FOR_USER_NOTE_ENTERED_FOR_RX, userInputForNotesField);
        localStorage.setItem(KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX, customerServicePrefernceChoice);
    }
}

/**
 * Utility to set lensConfiguratorCollectio to local storage.
 * BS-1396
 */
export function setLensConfiguratorCollection(lensConfiguratorCollection, pageSource) {
    let encodedFormattedCollection = btoa(unescape(encodeURIComponent(JSON.stringify(lensConfiguratorCollection))));

    if (pageSource != null && pageSource != undefined && pageSource == PAGE_SOURCE_VS) {
        localStorage.setItem(LOCAL_LENS_CONFIGURATOR_DATA_KEY_VS, encodedFormattedCollection);
    } else if (pageSource != null && pageSource != undefined && pageSource == PAGE_SOURCE_RX) {
        localStorage.setItem(LOCAL_LENS_CONFIGURATOR_DATA_KEY_RX, encodedFormattedCollection);
    } //end if
}

/**
 * This method is used to check from Prescription screen if user has redirected from My VS/RX
 * BS-1396
 */
export function checkFromMyVSRXPrescription(lensConfiguratorCollection) {
    if (
        lensConfiguratorCollection != undefined &&
        lensConfiguratorCollection != null &&
        lensConfiguratorCollection != '' &&
        lensConfiguratorCollection.prescriptionUpdated != undefined &&
        lensConfiguratorCollection.prescriptionUpdated != null &&
        lensConfiguratorCollection.prescriptionUpdated == true
    ) {
        return false;
    } else {
        return null;
    }
}

/**
 * This method is used to check from Centering screen if user has redirected from My VS/RX
 * BS-1396
 */
export function checkFromMyVSRXCentering(lensConfiguratorCollection) {
    if (
        lensConfiguratorCollection != undefined &&
        lensConfiguratorCollection != null &&
        lensConfiguratorCollection != '' &&
        lensConfiguratorCollection.centeringUpdated != undefined &&
        lensConfiguratorCollection.centeringUpdated != null &&
        lensConfiguratorCollection.centeringUpdated == true
    ) {
        return false;
    } else {
        return null;
    }
}

export function updateShapeSelectionDataUpdate(event, lensConfiguratorCollection) {
    if (event.detail) {
        let shapeSelectionData = event.detail;
        if (lensConfiguratorCollection !== undefined && lensConfiguratorCollection !== null) {
            let parsedLensConfigurator = JSON.parse(JSON.stringify(lensConfiguratorCollection));
            //Added this check as a part of BS-1845
            if (
                parsedLensConfigurator &&
                parsedLensConfigurator.lensEdge &&
                parsedLensConfigurator.selectedLensShapeId &&
                shapeSelectionData.selectedLensShapeId &&
                parsedLensConfigurator.selectedLensShapeId != shapeSelectionData.selectedLensShapeId
            ) {
                parsedLensConfigurator.lensEdge = null;
            }
            let lensEdgeToBeSaved;
            if (parsedLensConfigurator && parsedLensConfigurator.lensEdge) {
                lensEdgeToBeSaved = parsedLensConfigurator.lensEdge;
            } else if (parsedLensConfigurator && (parsedLensConfigurator.lensEdge == null || parsedLensConfigurator.lensEdge == undefined)) {
                lensEdgeToBeSaved = null;
            }
            let updateLensConfiguratorRecordForLensEdgeField = updateLensConfiguratorRecordForLensEdge({
                lensConfiguratorId: parsedLensConfigurator.lensConfiguratorID,
                lensEdge: lensEdgeToBeSaved
            });
            //END: BS-1845
            parsedLensConfigurator.lensShape = shapeSelectionData.lensShape;
            parsedLensConfigurator.lensSize = shapeSelectionData.lensSize;
            parsedLensConfigurator.features = shapeSelectionData.features;
            parsedLensConfigurator.lensShapeImage = shapeSelectionData.lensShapeImage;
            parsedLensConfigurator.selectedLensShapeId = shapeSelectionData.selectedLensShapeId;
            parsedLensConfigurator.selectedShapeWidth = shapeSelectionData.selectedShapeWidth;
            parsedLensConfigurator.selectedShapeHeight = shapeSelectionData.selectedShapeHeight;
            parsedLensConfigurator.shapeSelectionData = shapeSelectionData;

            return parsedLensConfigurator;
        } else {
            return null;
        }
    }
}

/**
 * BS-1612
 * This method makes callout to fetch the status of the survey
 * @param {*} surveyId : The Id of the visonn zone analysis survey whose status needs to be fetched.
 * @param {*} accountId : Id of the account which making the request
 * @returns : JSON object containing details {Success/Data & Error}
 */
export const getVisionZoneAnalysisStatus = async (surveyId, accountId, lensConfiguratorId) => {
    let visionZoneAnalysisWrapper = {};
    await checkVisionZoneAnalysisResult({ id: surveyId, accountId: accountId, lensConfiguratorId: lensConfiguratorId })
        .then((result) => {
            if (
                result !== undefined &&
                result !== null &&
                result.totalQuestions !== undefined &&
                result.totalQuestions !== null &&
                result.totalAnswers !== undefined &&
                result.totalAnswers !== null &&
                result.result !== undefined &&
                result.result !== null &&
                result.totalQuestions === result.totalAnswers
            ) {
                visionZoneAnalysisWrapper = {
                    result: result.result,
                    data: result,
                    showError: false
                }; //BS-1815 updated the below if conditions to handle the error
            } else if (
                result !== undefined &&
                result !== null &&
                result.totalQuestions !== undefined &&
                result.totalQuestions !== null &&
                result.totalAnswers !== undefined &&
                result.totalAnswers !== null &&
                result.totalQuestions !== result.totalAnswers
            ) {
                visionZoneAnalysisWrapper = {
                    result: null,
                    data: null,
                    showError: true,
                    isSurveyIncomplete: true,
                    invalidCode: false,
                    calloutError: false
                };
            } else if (result !== undefined && result !== null && result.Error_503 !== undefined && result.Error_503 == ERROR_503) {
                visionZoneAnalysisWrapper = {
                    result: null,
                    data: null,
                    showError: true,
                    isSurveyIncomplete: false,
                    invalidCode: false,
                    calloutError: true
                };
            } else {
                visionZoneAnalysisWrapper = {
                    result: null,
                    data: null,
                    showError: true,
                    isSurveyIncomplete: false,
                    invalidCode: true,
                    calloutError: false
                };
            }
        })
        .catch((errorInstance) => {
            visionZoneAnalysisWrapper = {};
        });
    return visionZoneAnalysisWrapper;
};
