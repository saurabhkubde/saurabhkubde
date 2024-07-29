import getLensConfiguratorData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensConfiguratorData'; //BS-1958
import getShapeSelectionScreenData from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getShapeSelectionScreenData';
import getLensShapeDataByShapeName from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getLensShapeDataByShapeName';
//CONSTANTS
const VS_BRAND = 'Vision Sensation'; //BS-1958
const RX_BRAND = 'RX Glazing'; //BS-1958
const KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_VS = 'selectedSpecialHandlingOptionForVS';
const KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX = 'selectedSpecialHandlingOptionForRX';
const KEY_FOR_USER_NOTE_ENTERED_FOR_VS = 'userNoteForVS';
const KEY_FOR_USER_NOTE_ENTERED_FOR_RX = 'userNoteForRX';
const KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_VS = 'customerServicePreferenceForVS';
const KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX = 'customerServicePreferenceForRX';
//BS-2137
const VISION_SENSATION = 'Vision Sensation';
const WITH_COLORED_GROOVE = 'with Colored grooves';
const REMOVE_DRILLS_VALUE = 'remove drills';
const WITH_ACCENT_RING_VALUE = 'with Accent Rings';
const STYLING_BACKGROUND_COLOR = 'background-color:';
const LENS_ONLY = 'Lens Only';
const HEX_ACCENT_RING_CONST_PRODUCT = '#3f242900;';
const PARTIAL_GROOVE_VALUE = 'With Partial Color Groove';
export async function getVSRXCartItemConfigurationData(lensConfiguratorRecordId, applicableBrand) {
    let lensConfiguratorObject = {};
    await getLensConfiguratorData({
        lensConfiguratorId: lensConfiguratorRecordId,
        isReadOnlyPage: false
    })
        .then(async (data) => {
            let lensConfiguratorInformationCollection = JSON.parse(JSON.stringify(data));
            let lensConfiguratorInformation = lensConfiguratorInformationCollection[0];
            // Capturing the data fetched from backend the Constructing and Restructing the data into object format that needs to pass to VS-RX Configurator
            lensConfiguratorObject.accountId =
                lensConfiguratorInformation.B2B_Account__c != null &&
                lensConfiguratorInformation.B2B_Account__c != undefined &&
                lensConfiguratorInformation.B2B_Account__c != ''
                    ? lensConfiguratorInformation.B2B_Account__c
                    : null; //Populating custom field :B2B_Account__c
            lensConfiguratorObject.collectionDesignFamily =
                lensConfiguratorInformation.B2B_Frame_Collection__c != null &&
                lensConfiguratorInformation.B2B_Frame_Collection__c != undefined &&
                lensConfiguratorInformation.B2B_Frame_Collection__c != ''
                    ? lensConfiguratorInformation.B2B_Frame_Collection__c
                    : null; //Populating custom field :B2B_Frame_Collection__c
            lensConfiguratorObject.selectedFrameSKU =
                lensConfiguratorInformation.B2B_Selected_Frame__c != null &&
                lensConfiguratorInformation.B2B_Selected_Frame__c != undefined &&
                lensConfiguratorInformation.B2B_Selected_Frame__c != ''
                    ? lensConfiguratorInformation.B2B_Selected_Frame__c
                    : null; //Populating custom field :B2B_Selected_Frame__c
            lensConfiguratorObject.frameColor = null; // Frame
            lensConfiguratorObject.frameColorDescription = null; // Frame
            lensConfiguratorObject.bridgeSize =
                lensConfiguratorInformation.B2B_Bridge__c != null &&
                lensConfiguratorInformation.B2B_Bridge__c != undefined &&
                lensConfiguratorInformation.B2B_Bridge__c != ''
                    ? lensConfiguratorInformation.B2B_Bridge__c
                    : null; //Populating custom field :B2B_Bridge__c
            lensConfiguratorObject.templeLength =
                lensConfiguratorInformation.B2B_Temple__c != null &&
                lensConfiguratorInformation.B2B_Temple__c != undefined &&
                lensConfiguratorInformation.B2B_Temple__c != ''
                    ? lensConfiguratorInformation.B2B_Temple__c
                    : null; //Populating custom field :B2B_Temple__c
            lensConfiguratorObject.lensSize =
                lensConfiguratorInformation.B2B_Lens_Size__c != null &&
                lensConfiguratorInformation.B2B_Lens_Size__c != undefined &&
                lensConfiguratorInformation.B2B_Lens_Size__c != ''
                    ? lensConfiguratorInformation.B2B_Lens_Size__c.toString()
                    : null; //Populating custom field :B2B_Lens_Size__c
            lensConfiguratorObject.eeSize = null;
            lensConfiguratorObject.status =
                lensConfiguratorInformation.B2B_Status__c != null &&
                lensConfiguratorInformation.B2B_Status__c != undefined &&
                lensConfiguratorInformation.B2B_Status__c != ''
                    ? lensConfiguratorInformation.B2B_Status__c
                    : null; //Populating custom field :B2B_Status__c
            lensConfiguratorObject.customerName =
                lensConfiguratorInformation.B2B_Customer_Name__c != null &&
                lensConfiguratorInformation.B2B_Customer_Name__c != undefined &&
                lensConfiguratorInformation.B2B_Customer_Name__c != ''
                    ? lensConfiguratorInformation.B2B_Customer_Name__c
                    : null; //Populating custom field :B2B_Customer_Name__c
            lensConfiguratorObject.clerk =
                lensConfiguratorInformation.B2B_Clerk__c != null &&
                lensConfiguratorInformation.B2B_Clerk__c != undefined &&
                lensConfiguratorInformation.B2B_Clerk__c != ''
                    ? lensConfiguratorInformation.B2B_Clerk__c
                    : null; //Populating custom field :B2B_Clerk__c
            lensConfiguratorObject.orderType =
                lensConfiguratorInformation.B2B_Order_Type__c != null &&
                lensConfiguratorInformation.B2B_Order_Type__c != undefined &&
                lensConfiguratorInformation.B2B_Order_Type__c != ''
                    ? lensConfiguratorInformation.B2B_Order_Type__c
                    : null; //Populating custom field :B2B_Order_Type__c
            lensConfiguratorObject.frameType =
                lensConfiguratorInformation.B2B_Frame_Type__c != null &&
                lensConfiguratorInformation.B2B_Frame_Type__c != undefined &&
                lensConfiguratorInformation.B2B_Frame_Type__c != ''
                    ? lensConfiguratorInformation.B2B_Frame_Type__c
                    : null; //Populating custom field :B2B_Frame_Type__c
            lensConfiguratorObject.applicableBrand =
                lensConfiguratorInformation.B2B_Type__c != null &&
                lensConfiguratorInformation.B2B_Type__c != undefined &&
                lensConfiguratorInformation.B2B_Type__c != ''
                    ? lensConfiguratorInformation.B2B_Type__c
                    : null; //Populating custom field :B2B_Type__c
            lensConfiguratorObject.lensConfiguratorID = lensConfiguratorRecordId;
            lensConfiguratorObject.lensType =
                lensConfiguratorInformation.B2B_Lens_Type__c != null &&
                lensConfiguratorInformation.B2B_Lens_Type__c != undefined &&
                lensConfiguratorInformation.B2B_Lens_Type__c != ''
                    ? lensConfiguratorInformation.B2B_Lens_Type__c
                    : null; //Populating custom field :B2B_Lens_Type__c
            lensConfiguratorObject.lensColor = null; //Lens color
            lensConfiguratorObject.lensIndex =
                lensConfiguratorInformation.B2B_Lens_Index__c != null &&
                lensConfiguratorInformation.B2B_Lens_Index__c != undefined &&
                lensConfiguratorInformation.B2B_Lens_Index__c != ''
                    ? lensConfiguratorInformation.B2B_Lens_Index__c
                    : null; //Populating custom field :B2B_Lens_Index__c
            lensConfiguratorObject.antireflectionSKU =
                lensConfiguratorInformation.B2B_Antireflection_SKU__c != null &&
                lensConfiguratorInformation.B2B_Antireflection_SKU__c != undefined &&
                lensConfiguratorInformation.B2B_Antireflection_SKU__c != ''
                    ? lensConfiguratorInformation.B2B_Antireflection_SKU__c
                    : null; //Populating custom field :B2B_Antireflection_SKU__c
            lensConfiguratorObject.productMaterial = null; //
            lensConfiguratorObject.withEvilEyeEdge =
                lensConfiguratorInformation.B2B_Evil_Eye_Edge__c != null &&
                lensConfiguratorInformation.B2B_Evil_Eye_Edge__c != undefined &&
                lensConfiguratorInformation.B2B_Evil_Eye_Edge__c != ''
                    ? lensConfiguratorInformation.B2B_Evil_Eye_Edge__c
                    : false; //Populating custom field :B2B_Evil_Eye_Edge__c
            lensConfiguratorObject.selectedRXSolution =
                lensConfiguratorInformation.B2B_RX_Solution__c != null &&
                lensConfiguratorInformation.B2B_RX_Solution__c != undefined &&
                lensConfiguratorInformation.B2B_RX_Solution__c != ''
                    ? lensConfiguratorInformation.B2B_RX_Solution__c
                    : null; //Populating custom field :B2B_RX_Solution__c
            lensConfiguratorObject.rxType =
                lensConfiguratorInformation.B2B_RX_Type__c != null &&
                lensConfiguratorInformation.B2B_RX_Type__c != undefined &&
                lensConfiguratorInformation.B2B_RX_Type__c != ''
                    ? lensConfiguratorInformation.B2B_RX_Type__c
                    : null; //Populating custom field :B2B_RX_Type__c
            lensConfiguratorObject.selectedRXSolutionSKU =
                lensConfiguratorInformation.B2B_Selected_RX_Solution_SKU__c != null &&
                lensConfiguratorInformation.B2B_Selected_RX_Solution_SKU__c != undefined &&
                lensConfiguratorInformation.B2B_Selected_RX_Solution_SKU__c != ''
                    ? lensConfiguratorInformation.B2B_Selected_RX_Solution_SKU__c
                    : null; //Populating custom field :B2B_Selected_RX_Solution_SKU__c
            lensConfiguratorObject.selectedRxTypeColor =
                lensConfiguratorInformation.B2B_Selected_RX_Solution_Color__c != null &&
                lensConfiguratorInformation.B2B_Selected_RX_Solution_Color__c != undefined &&
                lensConfiguratorInformation.B2B_Selected_RX_Solution_Color__c != ''
                    ? lensConfiguratorInformation.B2B_Selected_RX_Solution_Color__c
                    : null; //Populating custom field :B2B_Selected_RX_Solution_Color__c
            lensConfiguratorObject.selectedFrameVariantShape =
                lensConfiguratorInformation.B2B_Variant_Shape__c != null &&
                lensConfiguratorInformation.B2B_Variant_Shape__c != undefined &&
                lensConfiguratorInformation.B2B_Variant_Shape__c != ''
                    ? lensConfiguratorInformation.B2B_Variant_Shape__c
                    : null; //Populating custom field :B2B_Variant_Shape__c
            lensConfiguratorObject.selectedFrameBridgeSize =
                lensConfiguratorInformation.B2B_Bridge__c != null &&
                lensConfiguratorInformation.B2B_Bridge__c != undefined &&
                lensConfiguratorInformation.B2B_Bridge__c != ''
                    ? lensConfiguratorInformation.B2B_Bridge__c
                    : null; //Populating custom field :B2B_Bridge__c
            lensConfiguratorObject.selectedFrameLensSize =
                lensConfiguratorInformation.B2B_Lens_Size__c != null &&
                lensConfiguratorInformation.B2B_Lens_Size__c != undefined &&
                lensConfiguratorInformation.B2B_Lens_Size__c != ''
                    ? lensConfiguratorInformation.B2B_Lens_Size__c.toString()
                    : null; //Populating custom field :B2B_Lens_Size__c
            lensConfiguratorObject.selectedFrameBaseCurve =
                lensConfiguratorInformation.B2B_Base_Curve__c != null &&
                lensConfiguratorInformation.B2B_Base_Curve__c != undefined &&
                lensConfiguratorInformation.B2B_Base_Curve__c != ''
                    ? lensConfiguratorInformation.B2B_Base_Curve__c
                    : null; //Populating custom field :B2B_Base_Curve__c
            lensConfiguratorObject.selectedFrameColorNumber =
                lensConfiguratorInformation.B2B_Color_Number__c != null &&
                lensConfiguratorInformation.B2B_Color_Number__c != undefined &&
                lensConfiguratorInformation.B2B_Color_Number__c != ''
                    ? lensConfiguratorInformation.B2B_Color_Number__c
                    : null; //Populating custom field :B2B_Color_Number__c
            lensConfiguratorObject.selectedFrameTempleLength =
                lensConfiguratorInformation.B2B_Temple__c != null &&
                lensConfiguratorInformation.B2B_Temple__c != undefined &&
                lensConfiguratorInformation.B2B_Temple__c != ''
                    ? lensConfiguratorInformation.B2B_Temple__c
                    : null; //Populating custom field :B2B_Temple__c
            lensConfiguratorObject.withoutClipIn =
                lensConfiguratorInformation.B2B_without_clipin__c != null &&
                lensConfiguratorInformation.B2B_without_clipin__c != undefined &&
                lensConfiguratorInformation.B2B_without_clipin__c != ''
                    ? lensConfiguratorInformation.B2B_without_clipin__c
                    : false; //Populating custom field :B2B_without_clipin__c
            lensConfiguratorObject.lensSKU =
                lensConfiguratorInformation.B2B_Selected_Lens_SKU__c != null &&
                lensConfiguratorInformation.B2B_Selected_Lens_SKU__c != undefined &&
                lensConfiguratorInformation.B2B_Selected_Lens_SKU__c != ''
                    ? lensConfiguratorInformation.B2B_Selected_Lens_SKU__c
                    : null; //Populating custom field :B2B_Selected_Lens_SKU__c
            lensConfiguratorObject.eyeSide =
                lensConfiguratorInformation.B2B_Eye_Side__c != null &&
                lensConfiguratorInformation.B2B_Eye_Side__c != undefined &&
                lensConfiguratorInformation.B2B_Eye_Side__c != ''
                    ? lensConfiguratorInformation.B2B_Eye_Side__c
                    : null; //Populating custom field :B2B_Eye_Side__c
            lensConfiguratorObject.baseValue =
                lensConfiguratorInformation.B2B_Base_Values__c != null &&
                lensConfiguratorInformation.B2B_Base_Values__c != undefined &&
                lensConfiguratorInformation.B2B_Base_Values__c != ''
                    ? lensConfiguratorInformation.B2B_Base_Values__c
                    : null; //Populating custom field :B2B_Base_Values__c
            lensConfiguratorObject.rightsphere =
                lensConfiguratorInformation.B2B_Sphere_Right__c != null &&
                lensConfiguratorInformation.B2B_Sphere_Right__c != undefined &&
                lensConfiguratorInformation.B2B_Sphere_Right__c != ''
                    ? lensConfiguratorInformation.B2B_Sphere_Right__c + ''
                    : null; //Populating custom field :B2B_Sphere_Right__c
            lensConfiguratorObject.rightaxis =
                lensConfiguratorInformation.B2B_Axis_Right__c != null &&
                lensConfiguratorInformation.B2B_Axis_Right__c != undefined &&
                lensConfiguratorInformation.B2B_Axis_Right__c != ''
                    ? lensConfiguratorInformation.B2B_Axis_Right__c + ''
                    : null; //Populating custom field :B2B_Axis_Right__c
            lensConfiguratorObject.rightaddition =
                lensConfiguratorInformation.B2B_Addition_Right__c != null &&
                lensConfiguratorInformation.B2B_Addition_Right__c != undefined &&
                lensConfiguratorInformation.B2B_Addition_Right__c != ''
                    ? lensConfiguratorInformation.B2B_Addition_Right__c + ''
                    : null; //Populating custom field :B2B_Addition_Right__c
            lensConfiguratorObject.rightprism1 =
                lensConfiguratorInformation.B2B_Prism_1_Right__c != null &&
                lensConfiguratorInformation.B2B_Prism_1_Right__c != undefined &&
                lensConfiguratorInformation.B2B_Prism_1_Right__c != ''
                    ? lensConfiguratorInformation.B2B_Prism_1_Right__c + ''
                    : null; //Populating custom field :B2B_Prism_1_Right__c
            lensConfiguratorObject.rightcylinder =
                lensConfiguratorInformation.B2B_Cylinder_Right__c != null &&
                lensConfiguratorInformation.B2B_Cylinder_Right__c != undefined &&
                lensConfiguratorInformation.B2B_Cylinder_Right__c != ''
                    ? lensConfiguratorInformation.B2B_Cylinder_Right__c + ''
                    : null; //Populating custom field :B2B_Cylinder_Right__c
            lensConfiguratorObject.leftsphere =
                lensConfiguratorInformation.B2B_Sphere_Left__c != null &&
                lensConfiguratorInformation.B2B_Sphere_Left__c != undefined &&
                lensConfiguratorInformation.B2B_Sphere_Left__c != ''
                    ? lensConfiguratorInformation.B2B_Sphere_Left__c + ''
                    : null; //Populating custom field :B2B_Sphere_Left__c
            lensConfiguratorObject.leftcylinder =
                lensConfiguratorInformation.B2B_Cylinder_Left__c != null &&
                lensConfiguratorInformation.B2B_Cylinder_Left__c != undefined &&
                lensConfiguratorInformation.B2B_Cylinder_Left__c != ''
                    ? lensConfiguratorInformation.B2B_Cylinder_Left__c + ''
                    : null; //Populating custom field :B2B_Cylinder_Left__c
            lensConfiguratorObject.leftaxis =
                lensConfiguratorInformation.B2B_Axis_Left__c != null &&
                lensConfiguratorInformation.B2B_Axis_Left__c != undefined &&
                lensConfiguratorInformation.B2B_Axis_Left__c != ''
                    ? lensConfiguratorInformation.B2B_Axis_Left__c + ''
                    : null; //Populating custom field :B2B_Axis_Left__c
            lensConfiguratorObject.leftaddition =
                lensConfiguratorInformation.B2B_Addition_Left__c != null &&
                lensConfiguratorInformation.B2B_Addition_Left__c != undefined &&
                lensConfiguratorInformation.B2B_Addition_Left__c != ''
                    ? lensConfiguratorInformation.B2B_Addition_Left__c + ''
                    : null; //Populating custom field :B2B_Addition_Left__c
            lensConfiguratorObject.leftprism1 =
                lensConfiguratorInformation.B2B_Prism_1_Left__c != null &&
                lensConfiguratorInformation.B2B_Prism_1_Left__c != undefined &&
                lensConfiguratorInformation.B2B_Prism_1_Left__c != ''
                    ? lensConfiguratorInformation.B2B_Prism_1_Left__c + ''
                    : null; //Populating custom field :B2B_Prism_1_Left__c
            lensConfiguratorObject.leftprismbase1 =
                lensConfiguratorInformation.B2B_PB1_Left__c != null &&
                lensConfiguratorInformation.B2B_PB1_Left__c != undefined &&
                lensConfiguratorInformation.B2B_PB1_Left__c != ''
                    ? lensConfiguratorInformation.B2B_PB1_Left__c + ''
                    : null; //Populating custom field :B2B_PB1_Left__c
            lensConfiguratorObject.pupilDistanceRightEye =
                lensConfiguratorInformation.B2B_Pupil_Distance_Right_Eye__c != null &&
                lensConfiguratorInformation.B2B_Pupil_Distance_Right_Eye__c != undefined &&
                lensConfiguratorInformation.B2B_Pupil_Distance_Right_Eye__c != ''
                    ? lensConfiguratorInformation.B2B_Pupil_Distance_Right_Eye__c.toString()
                    : null; //Populating custom field :B2B_Pupil_Distance_Right_Eye__c
            lensConfiguratorObject.pupilDistanceLeftEye =
                lensConfiguratorInformation.B2B_Pupil_Distance_Left_Eye__c != null &&
                lensConfiguratorInformation.B2B_Pupil_Distance_Left_Eye__c != undefined &&
                lensConfiguratorInformation.B2B_Pupil_Distance_Left_Eye__c != ''
                    ? lensConfiguratorInformation.B2B_Pupil_Distance_Left_Eye__c.toString()
                    : null; //Populating custom field :B2B_Pupil_Distance_Left_Eye__c
            lensConfiguratorObject.fittingHeightRightEye =
                lensConfiguratorInformation.B2B_Fitting_height_Right_Eye__c != null &&
                lensConfiguratorInformation.B2B_Fitting_height_Right_Eye__c != undefined &&
                lensConfiguratorInformation.B2B_Fitting_height_Right_Eye__c != ''
                    ? lensConfiguratorInformation.B2B_Fitting_height_Right_Eye__c.toString()
                    : null; //Populating custom field : B2B_Fitting_height_Right_Eye__c
            lensConfiguratorObject.fittingHeightLeftEye =
                lensConfiguratorInformation.B2B_Fitting_height_Left_Eye__c != null &&
                lensConfiguratorInformation.B2B_Fitting_height_Left_Eye__c != undefined &&
                lensConfiguratorInformation.B2B_Fitting_height_Left_Eye__c != ''
                    ? lensConfiguratorInformation.B2B_Fitting_height_Left_Eye__c.toString()
                    : null; //Populating custom field : B2B_Fitting_height_Left_Eye__c
            lensConfiguratorObject.pantascopicTilt =
                lensConfiguratorInformation.B2B_Pantoscopic_tilt__c != null &&
                lensConfiguratorInformation.B2B_Pantoscopic_tilt__c != undefined &&
                lensConfiguratorInformation.B2B_Pantoscopic_tilt__c != ''
                    ? lensConfiguratorInformation.B2B_Pantoscopic_tilt__c.toString()
                    : null; //Populating custom field :B2B_Pantoscopic_tilt__c
            lensConfiguratorObject.bvdWorn =
                lensConfiguratorInformation.B2B_BVD_worn__c != null &&
                lensConfiguratorInformation.B2B_BVD_worn__c != undefined &&
                lensConfiguratorInformation.B2B_BVD_worn__c != ''
                    ? lensConfiguratorInformation.B2B_BVD_worn__c.toString()
                    : null; //Populating custom field :B2B_BVD_worn__c
            lensConfiguratorObject.bvdReffracted =
                lensConfiguratorInformation.B2B_BVD_refracted__c != null &&
                lensConfiguratorInformation.B2B_BVD_refracted__c != undefined &&
                lensConfiguratorInformation.B2B_BVD_refracted__c != ''
                    ? lensConfiguratorInformation.B2B_BVD_refracted__c.toString()
                    : null; //Populating custom field :B2B_BVD_refracted__c
            lensConfiguratorObject.radioValue =
                lensConfiguratorInformation.B2B_Measurement_System__c != null &&
                lensConfiguratorInformation.B2B_Measurement_System__c != undefined &&
                lensConfiguratorInformation.B2B_Measurement_System__c != ''
                    ? lensConfiguratorInformation.B2B_Measurement_System__c.toString()
                    : null; //Populating custom field :B2B_Measurement_System__c
            //BS-1244 - Start
            lensConfiguratorObject.userInputForSpecialHandlingField =
                lensConfiguratorInformation.B2B_Special_Handling__c != null &&
                lensConfiguratorInformation.B2B_Special_Handling__c != undefined &&
                lensConfiguratorInformation.B2B_Special_Handling__c != ''
                    ? lensConfiguratorInformation.B2B_Special_Handling__c.toString()
                    : null; //B2B_Special_Handling__c
            lensConfiguratorObject.userInputForNotesField =
                lensConfiguratorInformation.B2B_Note__c != null &&
                lensConfiguratorInformation.B2B_Note__c != undefined &&
                lensConfiguratorInformation.B2B_Note__c != ''
                    ? lensConfiguratorInformation.B2B_Note__c.toString()
                    : null; //Populating custom field :B2B_Note__c
            lensConfiguratorObject.customerServicePrefernceChoice =
                lensConfiguratorInformation.B2B_Customer_Service_Preference__c != null &&
                lensConfiguratorInformation.B2B_Customer_Service_Preference__c != undefined &&
                lensConfiguratorInformation.B2B_Customer_Service_Preference__c != ''
                    ? lensConfiguratorInformation.B2B_Customer_Service_Preference__c
                    : null; //Populating custom field :B2B_Customer_Service_Preference__c

            lensConfiguratorObject.thicknessMatchingCalculatorLeftValue =
                lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Left__c != null &&
                lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Left__c != undefined &&
                lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Left__c != ''
                    ? lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Left__c.toString()
                    : null; //Populating custom field :B2B_Thickness_Matching_Calculator_Left__c

            lensConfiguratorObject.thicknessMatchingCalculatorRightValue =
                lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Right__c != null &&
                lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Right__c != undefined &&
                lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Right__c != ''
                    ? lensConfiguratorInformation.B2B_Thickness_Matching_Calculator_Right__c.toString()
                    : null; //Populating custom field :B2B_Thickness_Matching_Calculator_Right__c

            lensConfiguratorObject.weightOfLeftLens =
                lensConfiguratorInformation.B2B_Weight_Left_Lens__c != null &&
                lensConfiguratorInformation.B2B_Weight_Left_Lens__c != undefined &&
                lensConfiguratorInformation.B2B_Weight_Left_Lens__c != ''
                    ? lensConfiguratorInformation.B2B_Weight_Left_Lens__c.toString()
                    : null; //Populating custom field :B2B_Weight_Left_Lens__c

            lensConfiguratorObject.weightOfLeftLensAdjusted =
                lensConfiguratorInformation.B2B_Weight_Left_Lens_Adjusted__c != null &&
                lensConfiguratorInformation.B2B_Weight_Left_Lens_Adjusted__c != undefined &&
                lensConfiguratorInformation.B2B_Weight_Left_Lens_Adjusted__c != ''
                    ? lensConfiguratorInformation.B2B_Weight_Left_Lens_Adjusted__c.toString()
                    : null; //Populating custom field :B2B_Weight_Left_Lens_Adjusted__c

            lensConfiguratorObject.weightOfRightLens =
                lensConfiguratorInformation.B2B_Weight_Right__c != null &&
                lensConfiguratorInformation.B2B_Weight_Right__c != undefined &&
                lensConfiguratorInformation.B2B_Weight_Right__c != ''
                    ? lensConfiguratorInformation.B2B_Weight_Right__c.toString()
                    : null; //Populating custom field :B2B_Weight_Right__c

            lensConfiguratorObject.weightOfRightLensAdjusted =
                lensConfiguratorInformation.B2B_Weight_Right_Lens_Adjusted__c != null &&
                lensConfiguratorInformation.B2B_Weight_Right_Lens_Adjusted__c != undefined &&
                lensConfiguratorInformation.B2B_Weight_Right_Lens_Adjusted__c != ''
                    ? lensConfiguratorInformation.B2B_Weight_Right_Lens_Adjusted__c.toString()
                    : null; //Populating custom field :B2B_Weight_Right_Lens_Adjusted__c

            lensConfiguratorObject.axisMinimumOfLeftLens =
                lensConfiguratorInformation.B2B_Axis_Min_Left_Lens__c != null &&
                lensConfiguratorInformation.B2B_Axis_Min_Left_Lens__c != undefined &&
                lensConfiguratorInformation.B2B_Axis_Min_Left_Lens__c != ''
                    ? lensConfiguratorInformation.B2B_Axis_Min_Left_Lens__c.toString()
                    : null; //Populating custom field :B2B_Axis_Min_Left_Lens__c

            lensConfiguratorObject.axisMinimumOfOfLeftLensAdjusted =
                lensConfiguratorInformation.B2B_Axis_Min_Left_Lens_Adjusted__c != null &&
                lensConfiguratorInformation.B2B_Axis_Min_Left_Lens_Adjusted__c != undefined &&
                lensConfiguratorInformation.B2B_Axis_Min_Left_Lens_Adjusted__c != ''
                    ? lensConfiguratorInformation.B2B_Axis_Min_Left_Lens_Adjusted__c.toString()
                    : null; //Populating custom field :B2B_Axis_Min_Left_Lens_Adjusted__c

            lensConfiguratorObject.axisMinimumOfRightLens =
                lensConfiguratorInformation.B2B_Axis_Min_Right_Lens__c != null &&
                lensConfiguratorInformation.B2B_Axis_Min_Right_Lens__c != undefined &&
                lensConfiguratorInformation.B2B_Axis_Min_Right_Lens__c != ''
                    ? lensConfiguratorInformation.B2B_Axis_Min_Right_Lens__c.toString()
                    : null; //Populating custom field :B2B_Axis_Min_Right_Lens__c

            lensConfiguratorObject.axisMinimumOfRightLensAdjusted =
                lensConfiguratorInformation.B2B_Axis_Minimum_Right_Lens_Adjusted__c != null &&
                lensConfiguratorInformation.B2B_Axis_Minimum_Right_Lens_Adjusted__c != undefined &&
                lensConfiguratorInformation.B2B_Axis_Minimum_Right_Lens_Adjusted__c != ''
                    ? lensConfiguratorInformation.B2B_Axis_Minimum_Right_Lens_Adjusted__c.toString()
                    : null; //Populating custom field :B2B_Axis_Minimum_Right_Lens_Adjusted__c

            lensConfiguratorObject.axisMaximumOfLeftLens =
                lensConfiguratorInformation.B2B_Axis_Max_Left_Lens__c != null &&
                lensConfiguratorInformation.B2B_Axis_Max_Left_Lens__c != undefined &&
                lensConfiguratorInformation.B2B_Axis_Max_Left_Lens__c != ''
                    ? lensConfiguratorInformation.B2B_Axis_Max_Left_Lens__c.toString()
                    : null; //Populating custom field :B2B_Axis_Max_Left_Lens__c

            lensConfiguratorObject.axisMaximumOfOfLeftLensAdjusted =
                lensConfiguratorInformation.B2B_Axis_Max_Left_Lens_Adjusted__c != null &&
                lensConfiguratorInformation.B2B_Axis_Max_Left_Lens_Adjusted__c != undefined &&
                lensConfiguratorInformation.B2B_Axis_Max_Left_Lens_Adjusted__c != ''
                    ? lensConfiguratorInformation.B2B_Axis_Max_Left_Lens_Adjusted__c.toString()
                    : null; //Populating custom field :B2B_Axis_Max_Left_Lens_Adjusted__c

            lensConfiguratorObject.axisMaximumOfRightLens =
                lensConfiguratorInformation.B2B_Axis_Max_Right_Lens__c != null &&
                lensConfiguratorInformation.B2B_Axis_Max_Right_Lens__c != undefined &&
                lensConfiguratorInformation.B2B_Axis_Max_Right_Lens__c != ''
                    ? lensConfiguratorInformation.B2B_Axis_Max_Right_Lens__c.toString()
                    : null; //Populating custom field :B2B_Axis_Max_Right_Lens__c

            lensConfiguratorObject.axisMaximumOfRightLensAdjusted =
                lensConfiguratorInformation.B2B_Axis_Max_Right_Lens_Adjusted__c != null &&
                lensConfiguratorInformation.B2B_Axis_Max_Right_Lens_Adjusted__c != undefined &&
                lensConfiguratorInformation.B2B_Axis_Max_Right_Lens_Adjusted__c != ''
                    ? lensConfiguratorInformation.B2B_Axis_Max_Right_Lens_Adjusted__c.toString()
                    : null; //Populating custom field :B2B_Axis_Max_Right_Lens_Adjusted__c

            lensConfiguratorObject.centerThicknessOfLeftLens =
                lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens__c != null &&
                lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens__c != undefined &&
                lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens__c != ''
                    ? lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens__c.toString()
                    : null; //Populating custom field :B2B_Center_Thickness_Left_Lens__c

            lensConfiguratorObject.centerThicknessOfOfLeftLensAdjusted =
                lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens_Adjusted__c != null &&
                lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens_Adjusted__c != undefined &&
                lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens_Adjusted__c != ''
                    ? lensConfiguratorInformation.B2B_Center_Thickness_Left_Lens_Adjusted__c.toString()
                    : null; //Populating custom field :B2B_Center_Thickness_Left_Lens_Adjusted__c

            lensConfiguratorObject.centerThicknessOfRightLens =
                lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens__c != null &&
                lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens__c != undefined &&
                lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens__c != ''
                    ? lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens__c.toString()
                    : null; //Populating custom field :B2B_Center_Thickness_Right_Lens__c

            lensConfiguratorObject.centerThicknessOfRightLensAdjusted =
                lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens_Adjusted__c != null &&
                lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens_Adjusted__c != undefined &&
                lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens_Adjusted__c != ''
                    ? lensConfiguratorInformation.B2B_Center_Thickness_Right_Lens_Adjusted__c.toString()
                    : null; //Populating custom field :B2B_Center_Thickness_Right_Lens_Adjusted__c

            lensConfiguratorObject.borderMaximumThicknessOfLeftLens =
                lensConfiguratorInformation.B2B_Max_Border_Thickess_Left_Lens__c != null &&
                lensConfiguratorInformation.B2B_Max_Border_Thickess_Left_Lens__c != undefined &&
                lensConfiguratorInformation.B2B_Max_Border_Thickess_Left_Lens__c != ''
                    ? lensConfiguratorInformation.B2B_Max_Border_Thickess_Left_Lens__c.toString()
                    : null; //Populating custom field :B2B_Max_Border_Thickess_Left_Lens__c

            lensConfiguratorObject.borderMaximumThicknessOfLeftLensAdjusted =
                lensConfiguratorInformation.B2B_Max_Border_Thickness_Left_Adjusted__c != null &&
                lensConfiguratorInformation.B2B_Max_Border_Thickness_Left_Adjusted__c != undefined &&
                lensConfiguratorInformation.B2B_Max_Border_Thickness_Left_Adjusted__c != ''
                    ? lensConfiguratorInformation.B2B_Max_Border_Thickness_Left_Adjusted__c.toString()
                    : null; //Populating custom field :B2B_Max_Border_Thickness_Left_Adjusted__c

            lensConfiguratorObject.borderMaximumThicknessOfRightLens =
                lensConfiguratorInformation.B2B_Max_Border_Thickess_Right_Lens__c != null &&
                lensConfiguratorInformation.B2B_Max_Border_Thickess_Right_Lens__c != undefined &&
                lensConfiguratorInformation.B2B_Max_Border_Thickess_Right_Lens__c != ''
                    ? lensConfiguratorInformation.B2B_Max_Border_Thickess_Right_Lens__c.toString()
                    : null; //Populating custom field :B2B_Max_Border_Thickess_Right_Lens__c

            lensConfiguratorObject.borderMaximumThicknessOfRightLensAdjusted =
                lensConfiguratorInformation.B2B_Max_Border_Thickness_Right_Adjusted__c != null &&
                lensConfiguratorInformation.B2B_Max_Border_Thickness_Right_Adjusted__c != undefined &&
                lensConfiguratorInformation.B2B_Max_Border_Thickness_Right_Adjusted__c != ''
                    ? lensConfiguratorInformation.B2B_Max_Border_Thickness_Right_Adjusted__c.toString()
                    : null; //Populating custom field :B2B_Max_Border_Thickness_Right_Adjusted__c

            lensConfiguratorObject.borderMinimumThicknessOfLeftLens =
                lensConfiguratorInformation.B2B_Min_thickness_border_Left_Lens__c != null &&
                lensConfiguratorInformation.B2B_Min_thickness_border_Left_Lens__c != undefined &&
                lensConfiguratorInformation.B2B_Min_thickness_border_Left_Lens__c != ''
                    ? lensConfiguratorInformation.B2B_Min_thickness_border_Left_Lens__c.toString()
                    : null; //Populating custom field :B2B_Min_thickness_border_Left_Lens__c

            lensConfiguratorObject.borderMinimumThicknessOfOfLeftLensAdjusted =
                lensConfiguratorInformation.B2B_Min_thickness_border_Lens_Adjusted__c != null &&
                lensConfiguratorInformation.B2B_Min_thickness_border_Lens_Adjusted__c != undefined &&
                lensConfiguratorInformation.B2B_Min_thickness_border_Lens_Adjusted__c != ''
                    ? lensConfiguratorInformation.B2B_Min_thickness_border_Lens_Adjusted__c.toString()
                    : null; //Populating custom field :B2B_Min_thickness_border_Lens_Adjusted__c

            lensConfiguratorObject.borderMinimumThicknessOfRightLens =
                lensConfiguratorInformation.B2B_Min_thickness_border_Right_Lens__c != null &&
                lensConfiguratorInformation.B2B_Min_thickness_border_Right_Lens__c != undefined &&
                lensConfiguratorInformation.B2B_Min_thickness_border_Right_Lens__c != ''
                    ? lensConfiguratorInformation.B2B_Min_thickness_border_Right_Lens__c.toString()
                    : null; //Populating custom field :B2B_Min_thickness_border_Right_Lens__c

            lensConfiguratorObject.borderMinimumThicknessOfRightLensAdjusted =
                lensConfiguratorInformation.B2B_Min_thickness_border_Right_Adjusted__c != null &&
                lensConfiguratorInformation.B2B_Min_thickness_border_Right_Adjusted__c != undefined &&
                lensConfiguratorInformation.B2B_Min_thickness_border_Right_Adjusted__c != ''
                    ? lensConfiguratorInformation.B2B_Min_thickness_border_Right_Adjusted__c.toString()
                    : null; //Populating custom field :B2B_Min_thickness_border_Right_Adjusted__c

            lensConfiguratorObject.isLensCalculated = true;

            lensConfiguratorObject.leftImageSRC =
                lensConfiguratorInformation.B2B_Left_Lens_Image_SRC__c != null &&
                lensConfiguratorInformation.B2B_Left_Lens_Image_SRC__c != undefined &&
                lensConfiguratorInformation.B2B_Left_Lens_Image_SRC__c != ''
                    ? lensConfiguratorInformation.B2B_Left_Lens_Image_SRC__c
                    : null; //Populating custom field :B2B_Left_Lens_Image_SRC__c

            lensConfiguratorObject.rightImageSRC =
                lensConfiguratorInformation.B2B_Right_Lens_Image_SRC__c != null &&
                lensConfiguratorInformation.B2B_Right_Lens_Image_SRC__c != undefined &&
                lensConfiguratorInformation.B2B_Right_Lens_Image_SRC__c != ''
                    ? lensConfiguratorInformation.B2B_Right_Lens_Image_SRC__c
                    : null; //Populating custom field :B2B_Right_Lens_Image_SRC__c
            //BS-1244 - End

            //BS-1129 START
            lensConfiguratorObject.rightprismbase1radio =
                lensConfiguratorInformation.B2B_PB1Placement_Right__c != null &&
                lensConfiguratorInformation.B2B_PB1Placement_Right__c != undefined &&
                lensConfiguratorInformation.B2B_PB1Placement_Right__c != ''
                    ? lensConfiguratorInformation.B2B_PB1Placement_Right__c
                    : null; //Populating custom field :B2B_PB1Placement_Right__c

            lensConfiguratorObject.leftprismbase1radio =
                lensConfiguratorInformation.B2B_PB1Placement_Left__c != null &&
                lensConfiguratorInformation.B2B_PB1Placement_Left__c != undefined &&
                lensConfiguratorInformation.B2B_PB1Placement_Left__c != ''
                    ? lensConfiguratorInformation.B2B_PB1Placement_Left__c
                    : null; //Populating custom field :B2B_PB1Placement_Left__c
            lensConfiguratorObject.leftprism2 =
                lensConfiguratorInformation.B2B_Prism2_Left__c != null &&
                lensConfiguratorInformation.B2B_Prism2_Left__c != undefined &&
                lensConfiguratorInformation.B2B_Prism2_Left__c != ''
                    ? lensConfiguratorInformation.B2B_Prism2_Left__c + ''
                    : null; //Populating custom field :B2B_Prism2_Left__c
            lensConfiguratorObject.leftprismbase2 =
                lensConfiguratorInformation.B2B_Prism_base2_Left__c != null &&
                lensConfiguratorInformation.B2B_Prism_base2_Left__c != undefined &&
                lensConfiguratorInformation.B2B_Prism_base2_Left__c != ''
                    ? lensConfiguratorInformation.B2B_Prism_base2_Left__c + ''
                    : null; //Populating custom field :B2B_Prism_base2_Left__c
            lensConfiguratorObject.rightprismbase1 =
                lensConfiguratorInformation.B2B_PB1_Right__c != null &&
                lensConfiguratorInformation.B2B_PB1_Right__c != undefined &&
                lensConfiguratorInformation.B2B_PB1_Right__c != ''
                    ? lensConfiguratorInformation.B2B_PB1_Right__c + ''
                    : null; //Populating custom field :B2B_PB1_Right__c
            lensConfiguratorObject.rightprism2 =
                lensConfiguratorInformation.B2B_Prism2_Right__c != null &&
                lensConfiguratorInformation.B2B_Prism2_Right__c != undefined &&
                lensConfiguratorInformation.B2B_Prism2_Right__c != ''
                    ? lensConfiguratorInformation.B2B_Prism2_Right__c + ''
                    : null; //Populating custom field :B2B_Prism2_Right__c

            lensConfiguratorObject.rightprismbase2 =
                lensConfiguratorInformation.B2B_Prism_base2_Right__c != null &&
                lensConfiguratorInformation.B2B_Prism_base2_Right__c != undefined &&
                lensConfiguratorInformation.B2B_Prism_base2_Right__c != ''
                    ? lensConfiguratorInformation.B2B_Prism_base2_Right__c + ''
                    : null; //Populating custom field :B2B_Prism_base2_Right__c

            lensConfiguratorObject.rightprismbase2radio =
                lensConfiguratorInformation.B2B_PB2Placement_Right__c != null &&
                lensConfiguratorInformation.B2B_PB2Placement_Right__c != undefined &&
                lensConfiguratorInformation.B2B_PB2Placement_Right__c != ''
                    ? lensConfiguratorInformation.B2B_PB2Placement_Right__c
                    : null; //Populating custom field :B2B_PB2Placement_Right__c

            lensConfiguratorObject.leftprismbase2radio =
                lensConfiguratorInformation.B2B_PB2Placement_Left__c != null &&
                lensConfiguratorInformation.B2B_PB2Placement_Left__c != undefined &&
                lensConfiguratorInformation.B2B_PB2Placement_Left__c != ''
                    ? lensConfiguratorInformation.B2B_PB2Placement_Left__c
                    : null; //Populating custom field :B2B_PB2Placement_Left__c
            //BS-1129 END
            //BS-1417 start
            lensConfiguratorObject.lensColor =
                lensConfiguratorInformation.B2B_Lens_Color__c != undefined &&
                lensConfiguratorInformation.B2B_Lens_Color__c != null &&
                lensConfiguratorInformation.B2B_Lens_Color__c != ''
                    ? lensConfiguratorInformation.B2B_Lens_Color__c
                    : null;

            lensConfiguratorObject.isCheckedAdapterAgreement =
                lensConfiguratorInformation.B2B_Agreement_To_Adapter__c != undefined &&
                lensConfiguratorInformation.B2B_Agreement_To_Adapter__c != null &&
                lensConfiguratorInformation.B2B_Agreement_To_Adapter__c != ''
                    ? lensConfiguratorInformation.B2B_Agreement_To_Adapter__c
                    : null;

            lensConfiguratorObject.isCheckedDirectGlazingAgreement =
                lensConfiguratorInformation.B2B_Agreement_To_Direct_Glazing__c != undefined &&
                lensConfiguratorInformation.B2B_Agreement_To_Direct_Glazing__c != null &&
                lensConfiguratorInformation.B2B_Agreement_To_Direct_Glazing__c != ''
                    ? lensConfiguratorInformation.B2B_Agreement_To_Direct_Glazing__c
                    : null;
            lensConfiguratorObject.workingDistance =
                lensConfiguratorInformation.B2B_Working_Distance__c != undefined &&
                lensConfiguratorInformation.B2B_Working_Distance__c != null &&
                lensConfiguratorInformation.B2B_Working_Distance__c != ''
                    ? lensConfiguratorInformation.B2B_Working_Distance__c
                    : null;
            lensConfiguratorObject.lensEdge =
                lensConfiguratorInformation.B2B_Lens_Edge__c != undefined && lensConfiguratorInformation.B2B_Lens_Edge__c != null
                    ? lensConfiguratorInformation.B2B_Lens_Edge__c
                    : null; // BS-1845
            lensConfiguratorObject.sGravingValue =
                lensConfiguratorInformation.B2B_S_Graving__c != undefined && lensConfiguratorInformation.B2B_S_Graving__c != null
                    ? lensConfiguratorInformation.B2B_S_Graving__c
                    : false; // BS-1796
            lensConfiguratorObject.optimisedFacetCutValue =
                lensConfiguratorInformation.B2B_Optimized_Facet_Cut__c != undefined && lensConfiguratorInformation.B2B_Optimized_Facet_Cut__c != null
                    ? lensConfiguratorInformation.B2B_Optimized_Facet_Cut__c
                    : false; // BS-1963
            lensConfiguratorObject.variantShape =
                lensConfiguratorInformation.B2B_Variant_Shape__c != null &&
                lensConfiguratorInformation.B2B_Variant_Shape__c != undefined &&
                lensConfiguratorInformation.B2B_Variant_Shape__c != ''
                    ? lensConfiguratorInformation.B2B_Variant_Shape__c
                    : null; //BS-1916-Populating custom field :B2B_Variant_Shape__c
            lensConfiguratorObject.shapeSize =
                lensConfiguratorInformation.B2B_Lens_Size__c != null &&
                lensConfiguratorInformation.B2B_Lens_Size__c != undefined &&
                lensConfiguratorInformation.B2B_Lens_Size__c != ''
                    ? lensConfiguratorInformation.B2B_Lens_Size__c.toString()
                    : null; //BS-1916-Populating custom field :B2B_Lens_Size__c

            lensConfiguratorObject.rimlessVariant = null;
            lensConfiguratorObject.lensShape =
                lensConfiguratorInformation.B2B_Selected_Lens_Shape__c != null &&
                lensConfiguratorInformation.B2B_Selected_Lens_Shape__c != undefined &&
                lensConfiguratorInformation.B2B_Selected_Lens_Shape__c != ''
                    ? lensConfiguratorInformation.B2B_Selected_Lens_Shape__c
                    : null; //BS-1888-Populating custom field :B2B_Selected_Lens_Shape__c
            if (lensConfiguratorInformation.B2B_Type__c == VISION_SENSATION) {
                await getShapeSelectionScreenData({ recordId: lensConfiguratorRecordId }).then(async (result) => {
                    let parsedData = {};
                    let originalParsedData = {};
                    if (result !== undefined && result !== null) {
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

                            parsedData.allowedScaling = result.omaSuccessResponseWrapper.allowedScaling
                                ? JSON.parse(result.omaSuccessResponseWrapper.allowedScaling)
                                : null;
                            parsedData.coordinates = result.omaSuccessResponseWrapper.coordinates
                                ? JSON.parse(result.omaSuccessResponseWrapper.coordinates)
                                : null;
                            parsedData.drills =
                                result.lensConfiguratorObj && result.lensConfiguratorObj.B2B_Drills__c
                                    ? JSON.parse(result.lensConfiguratorObj.B2B_Drills__c.replace(/ends/g, 'end'))
                                    : null;
                            parsedData.hasDrills = result.omaSuccessResponseWrapper.hasDrills ? result.omaSuccessResponseWrapper.hasDrills : false;
                            parsedData.height = result.omaSuccessResponseWrapper.height ? JSON.parse(result.omaSuccessResponseWrapper.height) : null;
                            parsedData.oma = result.omaSuccessResponseWrapper.oma ? result.omaSuccessResponseWrapper.oma : null;
                            parsedData.width = result.omaSuccessResponseWrapper.width ? JSON.parse(result.omaSuccessResponseWrapper.width) : null;
                        }
                        let lensConfiguratorObj = result.lensConfiguratorObj;
                        let lensShapeRecordId;
                        let isOrderTypeLensOnly;
                        if (lensConfiguratorObj !== undefined && lensConfiguratorObj !== null) {
                            isOrderTypeLensOnly = lensConfiguratorObj.B2B_Order_Type__c == LENS_ONLY ? true : false;
                            lensShapeRecordId = lensConfiguratorObj.B2B_Selected_Lens_Shape__c ? lensConfiguratorObj.B2B_Selected_Lens_Shape__c : '';
                        }

                        let shapeSelectionCollection = {};
                        shapeSelectionCollection.lensShape =
                            lensConfiguratorObj.B2B_Lens_Shape__c !== undefined && lensConfiguratorObj.B2B_Lens_Shape__c !== null
                                ? lensConfiguratorObj.B2B_Lens_Shape__c
                                : null;
                        shapeSelectionCollection.lensSize =
                            lensConfiguratorObj.B2B_Lens_Size__c !== undefined && lensConfiguratorObj.B2B_Lens_Size__c !== null
                                ? lensConfiguratorObj.B2B_Lens_Size__c + ''
                                : null;
                        shapeSelectionCollection.showAllShapes =
                            lensConfiguratorObj.B2B_Show_All_Shapes__c !== undefined && lensConfiguratorObj.B2B_Show_All_Shapes__c !== null
                                ? lensConfiguratorObj.B2B_Show_All_Shapes__c
                                : false;
                        shapeSelectionCollection.a = lensConfiguratorObj.B2B_a__c ? lensConfiguratorObj.B2B_a__c : 0;
                        shapeSelectionCollection.b1 = lensConfiguratorObj.B2B_b1__c ? lensConfiguratorObj.B2B_b1__c : 0;
                        shapeSelectionCollection.b = lensConfiguratorObj.B2B_b__c ? lensConfiguratorObj.B2B_b__c : 0;
                        shapeSelectionCollection.b2 = lensConfiguratorObj.B2B_b2__c ? lensConfiguratorObj.B2B_b2__c : 0;
                        shapeSelectionCollection.sf = lensConfiguratorObj.B2B_SF__c ? lensConfiguratorObj.B2B_SF__c : 0;
                        shapeSelectionCollection.blp = lensConfiguratorObj.B2B_blp__c ? lensConfiguratorObj.B2B_blp__c : 0;
                        shapeSelectionCollection.height = lensConfiguratorObj.B2B_OMA_Height__c
                            ? trimUptoTwoDecimalPlaces(lensConfiguratorObj.B2B_OMA_Height__c)
                            : '';
                        shapeSelectionCollection.width = lensConfiguratorObj.B2B_Width__c ? trimUptoTwoDecimalPlaces(lensConfiguratorObj.B2B_Width__c) : '';
                        lensConfiguratorObject.selectedLensShapeId = lensShapeRecordId;
                        await getLensShapeDataByShapeName({
                            shapeName: shapeSelectionCollection.lensShape,
                            size: shapeSelectionCollection.lensSize,
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
                                        shapeSelectionCollection.showWithAccentRing = true;
                                        shapeSelectionCollection.withAccentRingValue = lensConfiguratorObj.B2B_Accent_Ring__c
                                            ? lensConfiguratorObj.B2B_Accent_Ring__c
                                            : false;
                                        shapeSelectionCollection.showAccentRingColor = true;
                                        let colorHexCode =
                                            lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r &&
                                            lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c
                                                ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c
                                                : HEX_ACCENT_RING_CONST_PRODUCT;
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
                                        selectedAccentRingColor = selectedColorProperties;
                                        shapeSelectionCollection.accentRingColorStyling = selectedAccentRingColor.styling;
                                        shapeSelectionCollection.accentRingColorLabel = selectedAccentRingColor.label;
                                        shapeSelectionCollection.accentRingImage = lensConfiguratorObj.B2B_Selected_Accent_Ring_Image__c
                                            ? lensConfiguratorObj.B2B_Selected_Accent_Ring_Image__c
                                            : null;
                                        shapeSelectionCollection.showAccentRingImage =
                                            shapeSelectionCollection.accentRingImage !== undefined && shapeSelectionCollection.accentRingImage !== null
                                                ? true
                                                : false;
                                        shapeSelectionCollection.removeGrooveValue =
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
                                        shapeSelectionCollection.showWithColorGroove = true;
                                        shapeSelectionCollection.withColorGrooveValue = lensConfiguratorObj.B2B_With_Color_Groove__c
                                            ? lensConfiguratorObj.B2B_With_Color_Groove__c
                                            : false;
                                        shapeSelectionCollection.withPartialColorGroove = lensConfiguratorObj.B2B_With_Partial_Color_Groove__c
                                            ? lensConfiguratorObj.B2B_With_Partial_Color_Groove__c
                                            : false;

                                        if (shapeSelectionCollection.withColorGrooveValue == true || shapeSelectionCollection.withPartialColorGroove) {
                                            shapeSelectionCollection.showColorGrooveColor = true;
                                        } else {
                                            shapeSelectionCollection.showColorGrooveColor = true;
                                        }
                                        let colorHexCode =
                                            lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r &&
                                            lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c
                                                ? lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c
                                                : HEX_ACCENT_RING_CONST_PRODUCT;
                                        const selectedColorProperties = {};
                                        selectedColorProperties.label =
                                            lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r &&
                                            lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.Name
                                                ? lensConfiguratorObj.B2B_Selected_Color_Groove_Product__r.Name
                                                : '';
                                        selectedColorProperties.styling = STYLING_BACKGROUND_COLOR + colorHexCode;
                                        let selectedColoredGrooveColor = selectedColorProperties;
                                        shapeSelectionCollection.colorGrooveColorStyling = selectedColoredGrooveColor.styling;
                                        shapeSelectionCollection.colorGrooveColorLabel = selectedColoredGrooveColor.label;
                                    }
                                    if (
                                        isOrderTypeLensOnly !== undefined &&
                                        isOrderTypeLensOnly !== null &&
                                        isOrderTypeLensOnly == true &&
                                        lensShapeObject.B2B_Lens_Only_Available__c &&
                                        lensShapeObject.B2B_Lens_Only_Available__c.includes(REMOVE_DRILLS_VALUE) === true
                                    ) {
                                        shapeSelectionCollection.showRemoveDrill = true;
                                        shapeSelectionCollection.removeDrills = lensConfiguratorObj.B2B_Remove_Drills__c
                                            ? lensConfiguratorObj.B2B_Remove_Drills__c
                                            : false;
                                    } else {
                                        shapeSelectionCollection.showRemoveDrill = false;
                                        shapeSelectionCollection.removeDrills = false;
                                    }
                                }
                                lensConfiguratorObject.shapeSelectionData = shapeSelectionCollection;
                            })
                            .catch((error) => {});
                    }
                });
            }
            lensConfiguratorObject.completedStep =
                lensConfiguratorInformation.B2B_Last_Completed_Step__c !== undefined && lensConfiguratorInformation.B2B_Last_Completed_Step__c !== null
                    ? lensConfiguratorInformation.B2B_Last_Completed_Step__c
                    : null; //BS-1775-Populating custom field :B2B_Last_Completed_Step__c

            lensConfiguratorObject.isFromCart = true; //BS-1775
            if (lensConfiguratorObject.antireflectionSKU != undefined && lensConfiguratorObject.antireflectionSKU != null) {
                //BS-1355
                lensConfiguratorObject.isAntireflectionHardcoating = true;
            } else {
                lensConfiguratorObject.isAntireflectionHardcoating = false;
            }
            //BS-1153 starts
            let applicableKeyForSpecialHandlingOption;
            let applicableKeyForUserNote;
            let applicableKeyForCustomerServicePreference;
            if (applicableBrand == VS_BRAND) {
                applicableKeyForSpecialHandlingOption = KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_VS;
                applicableKeyForCustomerServicePreference = KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_VS;
                applicableKeyForUserNote = KEY_FOR_USER_NOTE_ENTERED_FOR_VS;
            } else {
                applicableKeyForSpecialHandlingOption = KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX;
                applicableKeyForCustomerServicePreference = KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX;
                applicableKeyForUserNote = KEY_FOR_USER_NOTE_ENTERED_FOR_RX;
            }
            if (lensConfiguratorInformation.B2B_Note__c != undefined && lensConfiguratorInformation.B2B_Note__c != null) {
                localStorage.setItem(applicableKeyForUserNote, lensConfiguratorInformation.B2B_Note__c);
            } else {
                localStorage.removeItem(applicableKeyForUserNote);
            }
            if (
                lensConfiguratorInformation.B2B_Customer_Service_Preference__c != undefined &&
                lensConfiguratorInformation.B2B_Customer_Service_Preference__c != null
            ) {
                localStorage.setItem(applicableKeyForCustomerServicePreference, lensConfiguratorInformation.B2B_Customer_Service_Preference__c);
            } else {
                localStorage.removeItem(applicableKeyForCustomerServicePreference);
            }
            if (lensConfiguratorInformation.B2B_Special_Handling__c != undefined && lensConfiguratorInformation.B2B_Special_Handling__c != null) {
                localStorage.setItem(applicableKeyForSpecialHandlingOption, lensConfiguratorInformation.B2B_Special_Handling__c);
            } else {
                localStorage.removeItem(applicableKeyForSpecialHandlingOption);
            }
        })
        .catch((execptionInstance) => {
            console.error(execptionInstance);
        });
    return lensConfiguratorObject;
}

function trimUptoTwoDecimalPlaces(number) {
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
