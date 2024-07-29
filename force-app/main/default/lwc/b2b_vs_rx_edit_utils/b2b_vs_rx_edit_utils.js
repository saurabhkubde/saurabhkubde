import { LightningElement } from 'lwc';

const KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_VS = 'selectedSpecialHandlingOptionForVS';
const KEY_FOR_SELECTED_SPECIAL_HANDLING_OPTION_FOR_RX = 'selectedSpecialHandlingOptionForRX';
const KEY_FOR_USER_NOTE_ENTERED_FOR_VS = 'userNoteForVS';
const KEY_FOR_USER_NOTE_ENTERED_FOR_RX = 'userNoteForRX';
const KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_VS = 'customerServicePreferenceForVS';
const KEY_FOR_CUSTOMER_SERVICE_PREFERENCE_FOR_RX = 'customerServicePreferenceForRX';
const VS_BRAND = 'Vision Sensation';

//BS-1064
const setConfiguratorValues = (lensConfiguratorInformation, _applicableBrand) => {
    let lensConfiguratorObject = {};
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
        lensConfiguratorInformation.B2B_Type__c != null && lensConfiguratorInformation.B2B_Type__c != undefined && lensConfiguratorInformation.B2B_Type__c != ''
            ? lensConfiguratorInformation.B2B_Type__c
            : null; //Populating custom field :B2B_Type__c
    lensConfiguratorObject.lensConfiguratorID = lensConfiguratorInformation.Id;
    lensConfiguratorObject.lensType =
        lensConfiguratorInformation.B2B_Lens_Type__c != null &&
        lensConfiguratorInformation.B2B_Lens_Type__c != undefined &&
        lensConfiguratorInformation.B2B_Lens_Type__c != ''
            ? lensConfiguratorInformation.B2B_Lens_Type__c
            : null; //Populating custom field :B2B_Lens_Type__c
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
    lensConfiguratorObject.productMaterial = null;
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
        lensConfiguratorInformation.B2B_Note__c != null && lensConfiguratorInformation.B2B_Note__c != undefined && lensConfiguratorInformation.B2B_Note__c != ''
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

    lensConfiguratorObject.relatedOrderNumber =
        lensConfiguratorInformation.B2B_Related_Order_Number__c != undefined &&
        lensConfiguratorInformation.B2B_Related_Order_Number__c != null &&
        lensConfiguratorInformation.B2B_Related_Order_Number__c != ''
            ? lensConfiguratorInformation.B2B_Related_Order_Number__c
            : null;
    lensConfiguratorObject.completedStep = 4;

    if (lensConfiguratorObject.antireflectionSKU !== undefined && lensConfiguratorObject.antireflectionSKU !== null) {
        lensConfiguratorObject.isAntireflectionHardcoating = true;
    } else {
        lensConfiguratorObject.isAntireflectionHardcoating = false;
    }
    let applicableKeyForSpecialHandlingOption;
    let applicableKeyForUserNote;
    let applicableKeyForCustomerServicePreference;
    if (_applicableBrand == VS_BRAND) {
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
    if (lensConfiguratorInformation.B2B_Customer_Service_Preference__c != undefined && lensConfiguratorInformation.B2B_Customer_Service_Preference__c != null) {
        localStorage.setItem(applicableKeyForCustomerServicePreference, lensConfiguratorInformation.B2B_Customer_Service_Preference__c);
    } else {
        localStorage.removeItem(applicableKeyForCustomerServicePreference);
    }
    if (lensConfiguratorInformation.B2B_Special_Handling__c != undefined && lensConfiguratorInformation.B2B_Special_Handling__c != null) {
        localStorage.setItem(applicableKeyForSpecialHandlingOption, lensConfiguratorInformation.B2B_Special_Handling__c);
    } else {
        localStorage.removeItem(applicableKeyForSpecialHandlingOption);
    }
    return lensConfiguratorObject;
};

//BS-1064
const setConfiguratorValuesForDifferentBrand = (lensConfiguratorInformation, _applicableBrand) => {
    let lensConfiguratorObject = {};
    lensConfiguratorObject.accountId =
        lensConfiguratorInformation.B2B_Account__c != null &&
        lensConfiguratorInformation.B2B_Account__c != undefined &&
        lensConfiguratorInformation.B2B_Account__c != ''
            ? lensConfiguratorInformation.B2B_Account__c
            : null; //Populating custom field :B2B_Account__c
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
    lensConfiguratorObject.applicableBrand = _applicableBrand;
    lensConfiguratorObject.lensConfiguratorID = lensConfiguratorInformation.Id;
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
    lensConfiguratorObject.customerServicePrefernceChoice =
        lensConfiguratorInformation.B2B_Customer_Service_Preference__c != null &&
        lensConfiguratorInformation.B2B_Customer_Service_Preference__c != undefined &&
        lensConfiguratorInformation.B2B_Customer_Service_Preference__c != ''
            ? lensConfiguratorInformation.B2B_Customer_Service_Preference__c
            : null; //Populating custom field :B2B_Customer_Service_Preference__c

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

    lensConfiguratorObject.relatedOrderNumber =
        lensConfiguratorInformation.B2B_Related_Order_Number__c != undefined &&
        lensConfiguratorInformation.B2B_Related_Order_Number__c != null &&
        lensConfiguratorInformation.B2B_Related_Order_Number__c != ''
            ? lensConfiguratorInformation.B2B_Related_Order_Number__c
            : null;

    lensConfiguratorObject.completedStep = 1;
    return lensConfiguratorObject;
};

export { setConfiguratorValues, setConfiguratorValuesForDifferentBrand };
