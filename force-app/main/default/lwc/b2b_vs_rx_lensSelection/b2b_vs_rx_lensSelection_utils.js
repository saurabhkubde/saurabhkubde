import getLensShapeData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensShapeRecord'; //BS-1845
import LENS_SELECTION_LABELS from '@salesforce/label/c.B2B_Lens_Selection_Labels'; //BS-1019
import B2B_VS_RX_ORDER_REFERENCE_LABELS from '@salesforce/label/c.B2B_VS_RX_Order_Reference_Labels'; //BS-1019
import B2B_LINKOUT_AVALIBILITY_CHECK_LENSCOLORS from '@salesforce/label/c.B2B_VS_RX_LENS_SELECTION_LINKOUT_LABEL'; //BS-1018
import B2B_AVAILABILITY_CHECK_LENSCOLORS_DOCUMENT from '@salesforce/label/c.B2B_VS_RX_AVAILABILITY_LENSCOLORS_LINK'; //BS-1018
import B2B_VS_GLAZING from '@salesforce/label/c.B2B_VS_GLAZING'; //BS-1466
import B2B_VS_LENS_TYPE from '@salesforce/label/c.B2B_VS_LENS_TYPE'; //BS-1466
import B2B_VS_LENS_SELECTION from '@salesforce/label/c.B2B_VS_LENS_SELECTION'; //BS-1466
import B2B_FACET_CUT_LENS_HELP_TEXT from '@salesforce/label/c.B2B_Facet_Cut_Lens_Help_Text'; //BS-793
import B2B_FACET_CUT_LABEL from '@salesforce/label/c.B2B_FACET_CUT_LABEL'; //BS-793
import B2B_FACET_CUT_IMAGE_TITLE from '@salesforce/label/c.B2B_FACET_CUT_IMAGE_TITLE'; //BS-793
import VISION_ZONE_ANALYSIS_SURVEY_ANSWER_URL from '@salesforce/label/c.B2B_VISION_ZONE_ANALYSIS_SURVEY_START_URL'; //BS-967
import RESPONSE_MESSAGE from '@salesforce/label/c.B2B_Something_Went_Wrong'; //BS-967
import VISION_ZONE_SURVEY_ERROR_MESSAGE from '@salesforce/label/c.B2B_VISION_ZONE_SURVEY_ERROR_MESSAGE'; //BS-1612
import B2B_VISUAL_PREFERENCE_VALUES from '@salesforce/label/c.B2B_VISUAL_PREFERENCE_VALUES'; //BS-1612
import B2B_VS_PROGRESSION_LENGTH_HELP_TEXT from '@salesforce/label/c.B2B_VS_PROGRESSION_LENGTH_HELP_TEXT'; //BS-1637
import B2B_VS_SGRAVING_LABEL from '@salesforce/label/c.B2B_VS_SGRAVING_LABEL'; //BS-1796
import B2B_VS_SGRAVING_SKU from '@salesforce/label/c.B2B_VS_SGRAVING_SKU'; //BS-1796
import VISION_ZONE_WRONG_CODE_ERROR_MESSAGE from '@salesforce/label/c.VISION_ZONE_WRONG_CODE_ERROR_MESSAGE'; //BS-1815
import VISION_ZONE_CALLOUT_ERROR_MESSAGE from '@salesforce/label/c.VISION_ZONE_CALLOUT_ERROR_MESSAGE';
import VS_RX_LENS_TYPE_LABELS from '@salesforce/label/c.B2B_VS_RX_LENS_TYPE_LABELS';
import YES_LABEL from '@salesforce/label/c.B2B_YES_BUTTON_LABEL';

const SEMI_MATT = 'semi-matte';
const POLISHED = 'Polished';
const SEMI_MATT_FEATURE = 'lens edge - semi-matte'; //BS-1845
const POLISHED_FEATURE = 'lens edge - polished'; //BS-1845
//START: BS-1845
export async function fetchLensShapeDataForLensEdge(lensConfiguratorCollection, label) {
    let lensShapeDataForLensEdgeCollection = {};
    await getLensShapeData({
        recordId: lensConfiguratorCollection.selectedLensShapeId
    })
        .then((result) => {
            if (result !== null && result[0] !== null) {
                let lensShapeRecord = result[0];
                if (
                    (lensShapeRecord.B2B_Default_Features__c != undefined &&
                        lensShapeRecord.B2B_Default_Features__c != null &&
                        (lensShapeRecord.B2B_Default_Features__c.includes(SEMI_MATT_FEATURE) == true ||
                            lensShapeRecord.B2B_Default_Features__c.includes(POLISHED_FEATURE) == true)) ||
                    (lensShapeRecord.B2B_Available_features__c != undefined &&
                        lensShapeRecord.B2B_Available_features__c != null &&
                        (lensShapeRecord.B2B_Available_features__c.includes(SEMI_MATT_FEATURE) == true ||
                            lensShapeRecord.B2B_Available_features__c.includes(POLISHED_FEATURE) == true))
                ) {
                    lensShapeDataForLensEdgeCollection.showLensEdgeData = true;
                    if (
                        lensShapeRecord.B2B_Default_Features__c &&
                        lensShapeRecord.B2B_Default_Features__c.includes(SEMI_MATT_FEATURE) == true &&
                        lensShapeRecord.B2B_Default_Features__c.includes(POLISHED_FEATURE) == true
                    ) {
                        lensShapeDataForLensEdgeCollection.lensEdgeOptions = [
                            { label: label.semiMatt, value: SEMI_MATT },
                            { label: label.polished, value: POLISHED }
                        ];

                        if (lensShapeDataForLensEdgeCollection.lensEdgeOptions) {
                            lensShapeDataForLensEdgeCollection.showErrorMessageLensEdge = false;
                            lensShapeDataForLensEdgeCollection.lensEdge = lensShapeDataForLensEdgeCollection.lensEdgeOptions[0].value;
                        }
                    } else if (
                        lensShapeRecord.B2B_Default_Features__c &&
                        lensShapeRecord.B2B_Default_Features__c.includes(SEMI_MATT_FEATURE) == true &&
                        lensShapeRecord.B2B_Available_features__c &&
                        lensShapeRecord.B2B_Available_features__c.includes(SEMI_MATT_FEATURE) == false &&
                        lensShapeRecord.B2B_Available_features__c.includes(POLISHED_FEATURE) == true
                    ) {
                        lensShapeDataForLensEdgeCollection.lensEdgeOptions = [
                            { label: label.semiMatt, value: SEMI_MATT },
                            { label: label.polished, value: POLISHED }
                        ];
                        if (lensShapeDataForLensEdgeCollection.lensEdgeOptions) {
                            lensShapeDataForLensEdgeCollection.showErrorMessageLensEdge = false;
                            lensShapeDataForLensEdgeCollection.lensEdge = lensShapeDataForLensEdgeCollection.lensEdgeOptions[0].value;
                        }
                    } else if (lensShapeRecord.B2B_Default_Features__c && lensShapeRecord.B2B_Default_Features__c.includes(SEMI_MATT_FEATURE) == true) {
                        lensShapeDataForLensEdgeCollection.lensEdgeOptions = [{ label: label.semiMatt, value: SEMI_MATT }];
                        if (lensShapeDataForLensEdgeCollection.lensEdgeOptions) {
                            lensShapeDataForLensEdgeCollection.showErrorMessageLensEdge = false;
                            lensShapeDataForLensEdgeCollection.lensEdge = lensShapeDataForLensEdgeCollection.lensEdgeOptions[0].value;
                        }
                    } else if (
                        lensShapeRecord.B2B_Default_Features__c &&
                        lensShapeRecord.B2B_Default_Features__c.includes(POLISHED_FEATURE) == true &&
                        lensShapeRecord.B2B_Available_features__c &&
                        lensShapeRecord.B2B_Available_features__c.includes(SEMI_MATT_FEATURE) == true &&
                        lensShapeRecord.B2B_Available_features__c.includes(POLISHED_FEATURE) == false
                    ) {
                        lensShapeDataForLensEdgeCollection.lensEdgeOptions = [
                            { label: label.polished, value: POLISHED },
                            { label: label.semiMatt, value: SEMI_MATT }
                        ];
                        if (lensShapeDataForLensEdgeCollection.lensEdgeOptions) {
                            lensShapeDataForLensEdgeCollection.showErrorMessageLensEdge = false;
                            lensShapeDataForLensEdgeCollection.lensEdge = lensShapeDataForLensEdgeCollection.lensEdgeOptions[0].value;
                        }
                    } else if (lensShapeRecord.B2B_Default_Features__c && lensShapeRecord.B2B_Default_Features__c.includes(POLISHED_FEATURE) == true) {
                        lensShapeDataForLensEdgeCollection.lensEdgeOptions = [{ label: label.polished, value: POLISHED }];
                        if (lensShapeDataForLensEdgeCollection.lensEdgeOptions) {
                            lensShapeDataForLensEdgeCollection.showErrorMessageLensEdge = false;
                            lensShapeDataForLensEdgeCollection.lensEdge = lensShapeDataForLensEdgeCollection.lensEdgeOptions[0].value;
                        }
                    } else if (
                        lensShapeRecord.B2B_Available_features__c &&
                        lensShapeRecord.B2B_Available_features__c.includes(SEMI_MATT_FEATURE) == true &&
                        lensShapeRecord.B2B_Available_features__c.includes(POLISHED_FEATURE) == true
                    ) {
                        lensShapeDataForLensEdgeCollection.lensEdgeOptions = [
                            { label: label.semiMatt, value: SEMI_MATT },
                            { label: label.polished, value: POLISHED }
                        ];
                        if (lensShapeDataForLensEdgeCollection.lensEdgeOptions) {
                            lensShapeDataForLensEdgeCollection.showErrorMessageLensEdge = false;
                        }
                    } else if (lensShapeRecord.B2B_Available_features__c && lensShapeRecord.B2B_Available_features__c.includes(SEMI_MATT_FEATURE) == true) {
                        lensShapeDataForLensEdgeCollection.lensEdgeOptions = [{ label: label.semiMatt, value: SEMI_MATT }];
                        if (lensShapeDataForLensEdgeCollection.lensEdgeOptions) {
                            lensShapeDataForLensEdgeCollection.showErrorMessageLensEdge = false;
                        }
                    } else if (lensShapeRecord.B2B_Available_features__c && lensShapeRecord.B2B_Available_features__c.includes(POLISHED_FEATURE) == true) {
                        lensShapeDataForLensEdgeCollection.lensEdgeOptions = [{ label: label.polished, value: POLISHED }];
                        if (lensShapeDataForLensEdgeCollection.lensEdgeOptions) {
                            lensShapeDataForLensEdgeCollection.showErrorMessageLensEdge = false;
                        }
                    }
                    if (lensConfiguratorCollection.lensEdge != null && lensConfiguratorCollection.lensEdge != undefined) {
                        lensShapeDataForLensEdgeCollection.showLensEdgeData = true;
                        lensShapeDataForLensEdgeCollection.lensEdge = lensConfiguratorCollection.lensEdge;
                    }
                } else {
                    lensShapeDataForLensEdgeCollection.showLensEdgeData = false;
                }
            }
        })
        .catch((error) => {
            console.error(error);
        });
    return lensShapeDataForLensEdgeCollection;
}
//END: BS-1845
export const LABELS = {
    lensType: LENS_SELECTION_LABELS.split(',')[0],
    panoramaSingleVision: LENS_SELECTION_LABELS.split(',')[1],
    panoramaProgressive: LENS_SELECTION_LABELS.split(',')[2],
    material: LENS_SELECTION_LABELS.split(',')[3],
    lensDetails: LENS_SELECTION_LABELS.split(',')[4],
    lensIndex: LENS_SELECTION_LABELS.split(',')[5],
    lensColor: LENS_SELECTION_LABELS.split(',')[6],
    progressionLength: LENS_SELECTION_LABELS.split(',')[7],
    lensSelection: LENS_SELECTION_LABELS.split(',')[8],
    antireflectionLabel: LENS_SELECTION_LABELS.split(',')[9], //BS-1019
    hardCoatingLabel: LENS_SELECTION_LABELS.split(',')[10], //BS-1019
    yesOptionLabel: LENS_SELECTION_LABELS.split(',')[11], //BS-1019
    noOptionLabel: LENS_SELECTION_LABELS.split(',')[12], //BS-1019
    evilEyeEdgeLabel: LENS_SELECTION_LABELS.split(',')[13],
    lensColorAvailabilityCheck: B2B_LINKOUT_AVALIBILITY_CHECK_LENSCOLORS, //BS-1466 start
    glazing: B2B_VS_GLAZING.split(',')[0],
    opticalGlazing: B2B_VS_GLAZING.split(',')[1],
    opticalSunGlazing: B2B_VS_GLAZING.split(',')[2],
    panoramaProgressiveOne: B2B_VS_LENS_TYPE.split(',')[0],
    panoramaProgressiveRoom: B2B_VS_LENS_TYPE.split(',')[1],
    lensDistance: B2B_VS_LENS_SELECTION.split(',')[0],
    photoSensation: B2B_VS_LENS_SELECTION.split(',')[1],
    blueSensation: B2B_VS_LENS_SELECTION.split(',')[2],
    lensEdge: B2B_VS_LENS_SELECTION.split(',')[3],
    visualPreferences: B2B_VS_LENS_SELECTION.split(',')[4],
    longDistance: B2B_VS_LENS_SELECTION.split(',')[5],
    longDistanceBallance: B2B_VS_LENS_SELECTION.split(',')[6],
    middleDistance: B2B_VS_LENS_SELECTION.split(',')[7],
    closeRange: B2B_VS_LENS_SELECTION.split(',')[8],
    semiMatt: B2B_VS_LENS_SELECTION.split(',')[9],
    polished: B2B_VS_LENS_SELECTION.split(',')[10],
    open: B2B_VS_LENS_SELECTION.split(',')[11], //BS-1466 end
    progressionHelpText: B2B_VS_PROGRESSION_LENGTH_HELP_TEXT.split(',')[0], //BS-1637
    progressionValidation: B2B_VS_PROGRESSION_LENGTH_HELP_TEXT.split(',')[1], //BS-1881
    panoramaSingleVisionLabel: VS_RX_LENS_TYPE_LABELS.split(',')[0],
    panoramaProgressiveLabel: VS_RX_LENS_TYPE_LABELS.split(',')[1],
    panoramaProgressiveOneLabel: VS_RX_LENS_TYPE_LABELS.split(',')[2],
    panoramaOfficeRoomDeskLabel: VS_RX_LENS_TYPE_LABELS.split(',')[3],
    yes: YES_LABEL,
    panoramaRelaxLabel: VS_RX_LENS_TYPE_LABELS.split(',')[4],
    relaxVersion: LENS_SELECTION_LABELS.split(',')[14]
};

//BS-2014
export const populateReadOnlyDataUtils = (lensConfigObj, OPTICAL_SUN_GLAZING, OPTICAL_GLAZING, LANG, GERMAN_LANGUAGE, label) => {
    let lensSelectionReadOnlyCollection = {};
    lensSelectionReadOnlyCollection.glazingValue =
        lensConfigObj.B2B_Glazing_Type__c && lensConfigObj.B2B_Glazing_Type__c === OPTICAL_GLAZING
            ? label.opticalGlazing
            : lensConfigObj.B2B_Glazing_Type__c === OPTICAL_SUN_GLAZING
            ? label.opticalSunGlazing
            : false;
    if (lensSelectionReadOnlyCollection.glazingValue !== false && lensSelectionReadOnlyCollection.glazingValue === label.opticalGlazing) {
        lensSelectionReadOnlyCollection.isOpticalGlazing = true;
    } else if (lensSelectionReadOnlyCollection.glazingValue !== false) {
        lensSelectionReadOnlyCollection.isOpticalGlazing = false;
    } else {
        lensSelectionReadOnlyCollection.isOpticalGlazing = true;
    }
    if (lensConfigObj.B2B_Lens_Type__c) {
        switch (lensConfigObj.B2B_Lens_Type__c) {
            case label.panoramaSingleVision:
                lensSelectionReadOnlyCollection.lensType = label.panoramaSingleVision;
                break;
            case label.panoramaProgressive:
                lensSelectionReadOnlyCollection.lensType = label.panoramaProgressive;
                break;
            case label.panoramaProgressiveOneLabel:
                lensSelectionReadOnlyCollection.lensType = label.panoramaProgressiveOneLabel;
                break;
            case label.panoramaProgressiveRoom:
                lensSelectionReadOnlyCollection.lensType = label.panoramaSingleVision;
                break;
            case label.panoramaRelaxLabel:
                lensSelectionReadOnlyCollection.lensType = label.panoramaRelaxLabel;
                break;
            default:
                lensSelectionReadOnlyCollection.lensType = false;
        }
    }
    lensSelectionReadOnlyCollection.lensIndex =
        lensConfigObj.B2B_Lens_Index__c !== undefined && lensConfigObj.B2B_Lens_Index__c !== null ? lensConfigObj.B2B_Lens_Index__c : false;
    //BS-1881
    if (LANG == GERMAN_LANGUAGE) {
        lensSelectionReadOnlyCollection.progressionLength =
            lensConfigObj.B2B_Progression_Length__c !== undefined && lensConfigObj.B2B_Progression_Length__c !== null
                ? lensConfigObj.B2B_Progression_Length__c.toString().replace('.', ',')
                : false;
    } else {
        lensSelectionReadOnlyCollection.progressionLength =
            lensConfigObj.B2B_Progression_Length__c !== undefined && lensConfigObj.B2B_Progression_Length__c !== null
                ? lensConfigObj.B2B_Progression_Length__c
                : false;
    }
    if (lensSelectionReadOnlyCollection.isOpticalGlazing == true) {
        lensSelectionReadOnlyCollection.lensColor =
            lensConfigObj.B2B_Lens_Color_Id__r !== undefined &&
            lensConfigObj.B2B_Lens_Color_Id__r !== null &&
            lensConfigObj.B2B_Lens_Color_Id__r.Description !== undefined &&
            lensConfigObj.B2B_Lens_Color_Id__r.Description !== null
                ? lensConfigObj.B2B_Lens_Color_Id__r.Description
                : false;
    } else {
        lensSelectionReadOnlyCollection.lensColor =
            lensConfigObj.B2B_Lens_Color__c !== undefined && lensConfigObj.B2B_Lens_Color__c !== null ? lensConfigObj.B2B_Lens_Color__c : false;
    }
    lensSelectionReadOnlyCollection.photoSensation =
        lensConfigObj.B2B_Photo_Sensation__r !== undefined &&
        lensConfigObj.B2B_Photo_Sensation__r.Description !== null &&
        lensConfigObj.B2B_Photo_Sensation__r.Description !== undefined &&
        lensConfigObj.B2B_Photo_Sensation__r.Description !== null
            ? lensConfigObj.B2B_Photo_Sensation__r.Description
            : false;
    lensSelectionReadOnlyCollection.blueSensation =
        lensConfigObj.B2B_Blue_Sensation__r !== undefined &&
        lensConfigObj.B2B_Blue_Sensation__r !== null &&
        lensConfigObj.B2B_Blue_Sensation__r.Description !== undefined &&
        lensConfigObj.B2B_Blue_Sensation__r.Description !== null
            ? lensConfigObj.B2B_Blue_Sensation__r.Description
            : false;
    lensSelectionReadOnlyCollection.lensDistance =
        lensConfigObj.B2B_Lens_Type__c !== undefined &&
        lensConfigObj.B2B_Lens_Type__c === label.panoramaProgressiveRoom &&
        lensConfigObj.B2B_Lens_Distance__c !== undefined &&
        lensConfigObj.B2B_Lens_Distance__c !== null
            ? lensConfigObj.B2B_Lens_Distance__c
            : false;
    lensSelectionReadOnlyCollection.productMaterial =
        lensConfigObj.B2B_Lens_Material__c !== undefined && lensConfigObj.B2B_Lens_Material__c !== null ? lensConfigObj.B2B_Lens_Material__c : false;
    lensSelectionReadOnlyCollection.lensEdge =
        lensConfigObj.B2B_Lens_Edge__c !== undefined && lensConfigObj.B2B_Lens_Edge__c !== null ? lensConfigObj.B2B_Lens_Edge__c : false;
    lensSelectionReadOnlyCollection.visualPreferences =
        lensConfigObj.B2B_Lens_Type__c !== undefined &&
        lensConfigObj.B2B_Lens_Type__c !== null &&
        lensConfigObj.B2B_Lens_Type__c === label.panoramaProgressiveOne &&
        lensConfigObj.B2B_Visual_Preference__c !== undefined &&
        lensConfigObj.B2B_Visual_Preference__c !== null
            ? lensConfigObj.B2B_Visual_Preference__c
            : false;
    lensSelectionReadOnlyCollection.antireflectionCoatingValue =
        lensConfigObj.B2B_Antireflection_Product__r !== undefined &&
        lensConfigObj.B2B_Antireflection_Product__r !== null &&
        lensConfigObj.B2B_Antireflection_Product__r.Description !== undefined &&
        lensConfigObj.B2B_Antireflection_Product__r.Description !== null
            ? lensConfigObj.B2B_Antireflection_Product__r.Description
            : lensConfigObj.B2B_Hard_Coating_Product__r !== undefined &&
              lensConfigObj.B2B_Hard_Coating_Product__r !== null &&
              lensConfigObj.B2B_Hard_Coating_Product__r.Description !== undefined &&
              lensConfigObj.B2B_Hard_Coating_Product__r.Description !== null
            ? lensConfigObj.B2B_Hard_Coating_Product__r.Description
            : false;
    lensSelectionReadOnlyCollection.facetCutValue =
        lensConfigObj.B2B_Optimized_Facet_Cut__c !== undefined && lensConfigObj.B2B_Optimized_Facet_Cut__c !== null
            ? lensConfigObj.B2B_Optimized_Facet_Cut__c
            : false;
    /* Start : BS-967 */
    lensSelectionReadOnlyCollection.visionZoneAnalysisId =
        lensConfigObj.B2B_Vision_Zone_Analysis_Code__c !== undefined && lensConfigObj.B2B_Vision_Zone_Analysis_Code__c !== null
            ? lensConfigObj.B2B_Vision_Zone_Analysis_Code__c
            : false;
    if (
        lensSelectionReadOnlyCollection.visualPreferences !== undefined &&
        lensSelectionReadOnlyCollection.visualPreferences !== null &&
        lensConfigObj.B2B_Vision_Zone_Analysis_Code__c !== undefined &&
        lensConfigObj.B2B_Vision_Zone_Analysis_Code__c !== null
    ) {
        lensSelectionReadOnlyCollection.visualPreferencesValue = lensConfigObj.B2B_Vision_Zone_Analysis_Code__c;
    } else if (
        lensSelectionReadOnlyCollection.visualPreferences !== undefined &&
        lensSelectionReadOnlyCollection.visualPreferences !== null &&
        (lensConfigObj.B2B_Vision_Zone_Analysis_Code__c === undefined || lensConfigObj.B2B_Vision_Zone_Analysis_Code__c === null)
    ) {
        lensSelectionReadOnlyCollection.visualPreferencesValue = lensSelectionReadOnlyCollection.visualPreferences;
    }
    /* End : BS-967 */
    //BS-1796 start
    lensSelectionReadOnlyCollection.sGravingValue =
        lensConfigObj.B2B_S_Graving__c !== undefined && lensConfigObj.B2B_S_Graving__c !== null ? lensConfigObj.B2B_S_Graving__c : false;
    lensSelectionReadOnlyCollection.lensProduct =
        lensConfigObj.B2B_Selected_Lens_SKU__c !== undefined && lensConfigObj.B2B_Selected_Lens_SKU__c !== null
            ? lensConfigObj.B2B_Selected_Lens_SKU__c
            : false; //BS-2385
    return lensSelectionReadOnlyCollection;
};
