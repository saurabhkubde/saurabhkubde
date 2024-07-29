/*************************************************************************************************************
 * This class will have all the constants needed at various places
 *
 *  @author – Bfl Dev – jayaraman.iyer@theblueflamelabs.com
 ***************************************************************************************************************/
public with sharing class B2B_Constants {
    /**
     * BS-442
     * Constants for BS-442 - Start
     */
    public static final String SILHOUETTE_CATEGORY = 'Silhouette';
    public static final String EVIL_EYE_CATEGORY = 'evil eye';
    public static final String SILHOUETTE_EVIL_EYE = 'Silhouette,evil eye';
    public static final String SILHOUETTE_BRAND = 'SH';
    public static final String EVIL_EYE_BRAND = 'EE';
    public static final String NEUBAU_BRAND = 'NB';
    public static final String FILTER_LABEL = 'filter';
    public static final String SHAPE_FILTER = 'shape';
    public static final String FRAME_TYPE_FILTER = 'sbRimType';
    public static final String FACE_FILTER = 'faceType';
    public static final String SHAPE_FIELD = 'B2B_Lens_Shape__c';
    public static final String FILTER_TYPE_FIELD = 'B2B_Frame_type__c';
    public static final String FACE_TYPE_FIELD = 'B2B_Face_Shape__c';
    public static final String RADIO_BUTTON_TYPE_FILTER = 'Radio Button';
    public static final String PRODUCT_OBJECT_API_NAME = 'Product2';
    //Constants for BS-442 - End
    public static final String COLOR_RADIO_BUTTON_TYPE_FILTER = 'Color Radio Button'; //BS-521
    public static final String SLIDER_TYPE_FILTER = 'Slider'; //BS-457
    public static final String SILHOUETTE_STORE = 'Silhouette'; //BS-524
    public static final String NEUBAU_STORE = 'Neubau'; //BS-524
    public static final String SILHOUETTE_CATALOG = 'Silhouette B2B Store Catalog'; //BS-524
    public static final String NEUBAU_CATALOG = 'Neubau B2B Store Catalog'; //BS-524
    public static final String B2B_ORDER_RECORDTYPE_DEVELOPERNAME = 'B2B_Order'; //BS-524
    public static final String BOTH_SH_EE_BRAND = 'both SH EE'; //BS-443
    public static final String DEMO_TO_CHASSIS_VALUE = 'Demo to Chassis'; //BS-528
    public static final String B2B_FIELD_FORMAT = 'B2B';
    public static final String CUSTOM_FIELD_FORMAT = '__c';
    public static final String LANGUAGE_DE = 'de';
    public static final String SUPER_PARENT_CATEGORY = 'superParent';
    public static final String SUPER_PARENT_CATEGORY_ID = 'superParentCategoryId';
    public static final String CATEGORY_ID = 'categoryId';
    public static final String CATEGORY_NAME = 'categoryName';
    public static final String PARENT_CATEGORY = 'parentCategory';
    public static final String PRODUCT_COUNT = 'productCount';
    public static final String PARENT_CATEGORY_ID = 'parentCategoryId';
    public static final String VARIATION_PARENT = 'VariationParent';
    public static final String FEATURED_PRODUCTS_HOMEPAGE = 'Featured Products Homepage'; //Updated as part of BS-1568
    // Added as part of BS-578
    public static final String FRAME_CATEGORY_EXT_ID = 'ee_frames';
    public static final String B2B_EE_BRAND_API_NAME_05 = '05';
    public static final String WRONG_USER_ERROR = 'Your login attempt has failed. Make sure the username and password are correct.';
    public static final String WRONG_USER_ERROR_GERMAN = 'Ihr Anmeldeversuch ist fehlgeschlagen. Stellen Sie sicher, dass Sie den richtigen Benutzernamen und das richtige Kennwort eingegeben haben.';
    public static final String ERROR_LABEL_NAME = 'B2B_WRONG_USER_OR_PASSWORD'; //BS-1625

    public static final String VISION_SENSATION = 'Vision Sensation'; //BS-708
    public static final String RX_GLAZING = 'RX Glazing'; //BS-708
    public static final String STATUS_IN_CART = 'In Cart'; //BS-978;

    //BS-724
    public static final String ADAPTER = 'Adapter'; //BS-724
    public static final String CLIPIN = 'Clip-in'; //BS-724
    public static final String CLIPIN_WITH_SPACE = 'Clip - in'; //BS-2376
    public static final String DIRECT_GLAZING = 'Direct Glazing'; //BS-924
    public static final String RX_SOLUTION = 'B2B_RX_Solution__c';
    public static final String RX_TYPE = 'B2B_RX_Type__c';
    public static final String SELECTED_RX_SOLUTION_SKU = 'B2B_Selected_RX_Solution_SKU__c';
    public static final String EN_US = 'en_US';
    public static final String WITHOUT_CLIPIN = 'lensOnlyForClipIn'; //BS-1093

    public static final String ACCOUNTID = 'accountId'; //BS-724
    public static final String COLLECTIONDESIGNFAMILY = 'collectionDesignFamily'; //BS-724
    public static final String CLERK = 'clerk'; //BS-924
    public static final String CUSTOMER_NAME = 'customerName';
    public static final String FRAME_TYPE = 'frameType';
    public static final String LENS_SIZE = 'lensSize';
    public static final String ORDER_TYPE = 'orderType';
    public static final String SELECTED_FRAME_SKU = 'selectedFrameSKU';
    public static final String STATUS = 'status';
    public static final String APPLICABLE_BRAND = 'applicableBrand'; //BS-1117

    public static final String LENS_TYPE = 'lensType'; //BS-723
    public static final String LENS_INDEX = 'lensIndex'; //BS-723
    public static final String LENS_SKU = 'lensSKU'; //BS-723
    public static final String PROGRESSION_LENGTH_LENS = 'progressionLengthLens'; //BS-723
    public static final String RELATION_TYPE_ANTIREFLECTION = 'Anti Reflection'; //BS-1019
    public static final String RELATION_TYPE_HARDCOATING = 'Hard Coating'; //BS-1019
    public static final String ANTIRELECTION_SKU = 'antireflectionSKU'; //BS-1019
    public static final String HARDCOATING_SKU = 'hardCoatingSKU'; //BS-1019
    public static final String WITH_EVIL_EYE_EDGE = 'withEvilEyeEdge'; //BS-1019

    public static final String GLOBAL_ENTITLEMENT_VS = 'Global - Vision Sensation'; //BS-787
    public static final String GLOBAL_ENTITLEMENT_RX = 'Global - RX Solution'; //BS-787

    public static final String BRAND_VS = 'VS'; //BS-728
    public static final String BRAND_RX = 'RX'; //BS-728
    public static final String BOXING_SYSTEM = 'Boxing System'; //BS-728
    public static final String MEASUREMENT_LINE_SYSTEM = 'Measurement Line System'; //BS-728
    public static final String KM = 'KM'; //BS-728
    public static final String ML = 'ML'; //BS-728
    public static final String ENGLISH_US = 'en-US'; //BS-728
    public static final String ENGLISH_LANGUAGE = 'en'; //BS-728

    public static final String NORMAL_SHOP_ORDER_KEY = 'SH_EE'; //BS-1016

    public static final String SELECTED_RX_SOLUTION = 'selectedRXSolution'; //BS-898
    public static final String SELECTED_RX_SOLUTION_SKU_KEY = 'selectedRXSolutionSKU'; //BS-898
    public static final String THICKNESS_VALUE_LEFT = 'thicknessMatchingCalculatorLeftValue'; //BS-898
    public static final String THICKNESS_VALUE_RIGHT = 'thicknessMatchingCalculatorRightValue'; //BS-898
    public static final String BOTH_EYE_SIDE = 'right and left lens side'; //BS-898
    public static final String RIGHT_EYE_SIDE = 'Right lens'; //BS-898
    public static final String LEFT_EYE_SIDE = 'Left lens'; //BS-898

    public static final String PRODUCT = 'Product'; //BS-976
    public static final String NAME = 'Name'; //BS-976

    public static final String WORKING_DISTANCE = 'workingDistance'; //BS-726
    public static final String PUPIL_DISTANCE_RIGHT_EYE = 'pupilDistanceRightEye'; //BS-726
    public static final String PUPIL_DISTANCE_LEFT_EYE = 'pupilDistanceLeftEye'; //BS-726
    public static final String FITTING_HEIGHT_RIGHT_EYE = 'fittingHeightRightEye'; //BS-726
    public static final String FITTING_HEIGHT_LEFT_EYE = 'fittingHeightLeftEye'; //BS-726
    public static final String PANTASCOPIC_TILT = 'pantascopicTilt'; //BS-726
    public static final String BVDWORN = 'bvdWorn'; //BS-726
    public static final String BVDREFFRACTED = 'bvdReffracted'; //BS-726
    public static final String RADIOVALUE = 'radioValue'; //BS-726
    public static final String CHECKED_DG_AGREEMENT = 'isCheckedDirectGlazingAgreement'; //BS-1065
    public static final String CHECKED_ADAPTER_AGREEMENT = 'isCheckedAdapterAgreement'; //Bs-1065
    public static final String ALL = 'All'; //BS-1096

    public static final String WEIGHT_LEFT_LENS = 'weightOfLeftLens'; //BS-727
    public static final String WEIGHT_RIGHT_LENS = 'weightOfRightLens'; //BS-727

    public static final String WEIGHT_LEFT_LENS_ADJUSTED = 'weightOfLeftLensAdjusted'; //BS-727
    public static final String WEIGHT_RIGHT_LENS_ADJUSTED = 'weightOfRightLensAdjusted'; //BS-727

    public static final String AXIS_MIN_LEFT_LENS = 'axisMinimumOfLeftLens'; //BS-727
    public static final String AXIS_MIN_RIGHT_LENS = 'axisMinimumOfRightLens'; //BS-727

    public static final String AXIS_MIN_LEFT_LENS_ADJUSTED = 'axisMinimumOfOfLeftLensAdjusted'; //BS-727
    public static final String AXIS_MIN_RIGHT_LENS_ADJUSTED = 'axisMinimumOfRightLensAdjusted'; //BS-727

    public static final String AXIS_MAX_LEFT_LENS = 'axisMaximumOfLeftLens'; //BS-727
    public static final String AXIS_MAX_RIGHT_LENS = 'axisMaximumOfRightLens'; //BS-727

    public static final String AXIS_MAX_LEFT_LENS_ADJUSTED = 'axisMaximumOfOfLeftLensAdjusted'; //BS-727
    public static final String AXIS_MAX_RIGHT_LENS_ADJUSTED = 'axisMaximumOfRightLensAdjusted'; //BS-727

    public static final String CENTER_THICKNESS_LEFT_LENS = 'centerThicknessOfLeftLens'; //BS-727
    public static final String CENTER_THICKNESS_RIGHT_LENS = 'centerThicknessOfRightLens'; //BS-727

    public static final String CENTER_THICKNESS_LEFT_LENS_ADJUSTED = 'centerThicknessOfOfLeftLensAdjusted'; //BS-727
    public static final String CENTER_THICKNESS_RIGHT_LENS_ADJUSTED = 'centerThicknessOfRightLensAdjusted'; //BS-727

    public static final String BORDER_MAX_THICKNESS_LEFT_LENS = 'borderMaximumThicknessOfLeftLens'; //BS-727
    public static final String BORDER_MAX_THICKNESS_RIGHT_LENS = 'borderMaximumThicknessOfRightLens'; //BS-727

    public static final String BORDER_MAX_THICKNESS_LEFT_LENS_ADJUSTED = 'borderMaximumThicknessOfOfLeftLensAdjusted'; //BS-727
    public static final String BORDER_MAX_THICKNESS_RIGHT_LENS_ADJUSTED = 'borderMaximumThicknessOfRightLensAdjusted'; //BS-727

    public static final String BORDER_MIN_THICKNESS_LEFT_LENS = 'borderMinimumThicknessOfLeftLens'; //BS-727
    public static final String BORDER_MIN_THICKNESS_RIGHT_LENS = 'borderMinimumThicknessOfRightLens'; //BS-727

    public static final String BORDER_MIN_THICKNESS_LEFT_LENS_ADJUSTED = 'borderMinimumThicknessOfOfLeftLensAdjusted'; //BS-727
    public static final String BORDER_MIN_THICKNESS_RIGHT_LENS_ADJUSTED = 'borderMinimumThicknessOfRightLensAdjusted'; //BS-727

    public static final String LEFT_IMAGE_SRC = 'leftImageSRC'; //BS-727
    public static final String RIGHT_IMAGE_SRC = 'rightImageSRC'; //BS-727
    public static final String LEFT_IMAGE_SRC_TO_BE_SAVED = 'leftImageSRCToBeSaved'; //BS-727
    public static final String RIGHT_IMAGE_SRC_TO_BE_SAVED = 'rightImageSRCToBeSaved'; //BS-727
    public static final String CONTENT_DOCUMENT_LOCATION = 'S'; //BS-727
    public static final String CALCULATED_LENS_IMAGE_FORMAT = 'png'; //BS-727
    public static final String BASE64_IMAGE_ENCODING_FORMAT = 'data:image/jpeg;base64'; //BS-727
    public static final String LEFT_LENS_IMAGE = 'Calculated lens - left'; //BS-1244
    public static final String RIGHT_LENS_IMAGE = 'Calculated lens - right'; //BS-1244
    public static final String VISIBILITY_SETTING_FOR_CONTENT_DOCUMENT_LINK = 'AllUsers'; //BS-727

    //BS-1242
    public static final String RIGHT_PRISM_BASE2_RADIO = 'rightprismbase2radio';
    public static final String RIGHT_PRISM2 = 'rightprism2';
    public static final String RIGHT_PRISM_BASE1_RADIO = 'rightprismbase1radio';
    public static final String RIGHT_PRISM1 = 'rightprism1';
    public static final String RIGHT_AXIS = 'rightaxis';
    public static final String RIGHT_CYLINDER = 'rightcylinder';
    public static final String RIGHT_SPHERE = 'rightsphere';
    public static final String LEFT_SPHERE = 'leftsphere';
    public static final String LEFT_CYLINDER = 'leftcylinder';
    public static final String LEFT_AXIS = 'leftaxis';
    public static final String LEFT_PRISM1 = 'leftprism1';
    public static final String LEFT_PRISM_BASE1_RADIO = 'leftprismbase1radio';
    public static final String LEFT_PRISM2 = 'leftprism2';
    public static final String LEFT_PRISM_BASE2_RADIO = 'leftprismbase2radio';
    public static final String LEFT_PRISM_BASE2 = 'leftprismbase2';
    public static final String LEFT_PRISM_BASE1 = 'leftprismbase1';
    public static final String RIGHT_PRISM_BASE2 = 'rightprismbase2';
    public static final String RIGHT_PRISM_BASE1 = 'rightprismbase1';
    public static final String RIGHT_ADDITION = 'rightaddition'; //BS-1219
    public static final String LEFT_ADDITION = 'leftaddition'; //BS-1219

    public static final String B2C_ORDER_RECORDTYPE_DEVELOPERNAME = 'B2C_Order'; //BS-587
    public static final String B2C_ORDER_SOURCE_VALUE = 'B2C Online Shop'; //BS-587

    //BS-1036
    public static final String LENS_CONFIGURATOR_STATUS_OPEN = 'Open';

    //BS-728
    public static final String TIMESTAMP_FIELD = 'Timestamp: ';
    public static final String FEATURES_MISSING = 'Features Missing';
    public static final String LENS_SIZE_MISSING = ', Lens size Missing ';
    public static final String VARIENT_SHAPE_MISSING = ', Varient Shape Missing';
    public static final String SCHNEIDER_SKU_MISSING = ', Schneider SKU Missing';
    public static final String SELECTED_FRAME = ', Selected Frame SKU = ';
    public static final String SELECTED_LENS = ', Selected Lens SKU = ';
    public static final String SELECTED_SOLUTION_RX = ', Selected RX Solution SKU = ';
    public static final String STRING_SEPERATOR_LABEL = '.  ';

    //BS-1092
    public static final String LENS_ONLY = 'Lens Only';
    public static final String LENS_ONLY_FRAME_PROVIDED = 'Lens Only + frame provided';

    //BS-1140
    public static final String BRAND_FIELD_API_NAME = 'B2B_Brand__c';

    public static final String PERFORMANCE_SPORT_RX_SOLUTION = 'performanceSportRXSolution'; //BS-1215

    /* Start : BS-1255 */
    public static final String PDP_METADATA_NEUBAU_CATEGORY_FIELD = 'B2B_Category_Neubau__c';
    public static final String PDP_METADATA_SILHOUETTE_CATEGORY_FIELD = 'B2B_Category_Silhouette__c';
    public static final String PDP_METADATA_EVIL_EYE_CATEGORY_FIELD = 'B2B_Category_Evil_Eye__c';
    public static final String PDP_METADATA_NB_ORDER_FIELD = 'B2B_Attribute_Display_Order__c';
    public static final String PDP_METADATA_SH_ORDER_FIELD = 'B2B_Attribute_Display_Order_Silhouette__c';
    public static final String PDP_METADATA_EE_ORDER_FIELD = 'B2B_Attribute_Display_Order_Evil_Eye__c';
    /* End : BS-1255 */

    public static final String GLAZED_TO_UNGLAZED = 'glazed to unglazed'; //BS-1121
    public static final String B2B_LENS_CONFIGURATOR_OBJECT = 'B2B_Lens_Configurator__c'; //BS-1213
    public static final String BOOLEAN_STRING = 'Boolean'; //BS-1213

    public static final String WEB_CART_STATUS_ACTIVE = 'Active'; //BS-1245

    public static final String SCHNEIDER_CALLOUT_FAILURE_RESPONSE_MESSAGE_HEADING = 'Schneider Callout Failure And Status: '; //BS-1034
    public static final String SCHNEIDER_CALLOUT_FAILURE_REQUEST_HEADING = 'Schneider Callout Request Sent: '; //BS-1034
    public static final String SCHNEIDER_CALLOUT_FAILURE_RESPONSE_HEADING = 'Schneider Callout Response Obtained: '; //BS-1034
    public static final String SCHNEIDER_CALLOUT_FAILURE_LENS_CONFIGURATOR_ID_HEADING = 'Lens Configurator ID: '; //BS-1034
    public static final String SCHNEIDER_CALLOUT_FAILURE_ARIS_ACCOUNT_ID_HEADING = 'ARIS Account ID: '; //BS-1034
    public static final String SCHNEIDER_CALLOUT_PROCESS = 'Schneider Callout'; //BS-1034
    public static final String ERROR_TYPE_LOGGING = 'Error'; //BS-1034
    public static final String INFO_TYPE_LOGGING = 'Info'; //BS-1034
    public static final String EMAIL_BODY_HEAD_FOR_SCHNEIDER_CALLOUT_CALCULATION_ERROR = 'Schneider Callout Response: '; //BS-1034
    public static final String SILHOUETTE_NO_REPLY_EMAIL_ADDRESS = 'noreply@silhouette-international.com'; //BS-1034
    public static final String B2B_ORDER_LOCKED_STATUS_PICKLIST_VALUE = '1'; //BS-963
    public static final String LENS_COLOR = 'lensColor'; //BS-1334

    public static final String WITHOUT_ADAPTER = 'lensesWithoutAdapter'; //BS-1340
    public static final String TRUE_VALUE = 'true';
    public static final String FALSE_VALUE = 'false';

    public static final String SCHNEIDER_CALLOUT_FAILURE_DUE_TO_OMA_DATA_RESPONSE_MESSAGE_HEADING = 'Schneider Callout Failure Due to OMA Data Not Found And Status: '; //BS-1248
    public static final String SCHNEIDER_CALLOUT_FAILURE_DUE_TO_SERVER_ERROR_RESPONSE_MESSAGE_HEADING = 'Schneider Callout Failure Due to Server Error And Status: '; //BS-1248
    public static final String FOOTER_PICKLIST = 'Footer Facts with T & C'; //Added as part of BS-1278
    public static final String SELECTED_RX_TYPE_COLOR = 'selectedRxTypeColor';
    public static final String PROSPECT_RECORD_TYPE_NAME = 'Prospect'; //BS-887
    public static final String PROSPECT_RECORD_TYPE_DEVELOPER_NAME = 'k_Prospect'; //BS-887
    public static final String PRECALCGUID = 'preCalcGuid'; //BS-1439

    //BS-895
    public static final String OMA_CALLOUT_QUERY_PARAMETER_FEATURES = 'features=';
    public static final String OMA_CALLOUT_QUERY_PARAMETER_OMASHAPE_KEY = 'omaShapeKey=';
    public static final String OMA_CALLOUT_QUERY_PARAMETER_REMOVE_DRILLS = 'removeDrills=';
    public static final String OMA_CALLOUT_QUERY_PARAMETER_OMA_ONLY = 'omaOnly=';
    public static final String OMA_CALLOUT_QUERY_PARAMETER_AND = '&';
    public static final String OMA_CALLOUT_QUERY_PARAMETER_FALSE = 'false';
    public static final String OMA_CALLOUT_QUERY_HEADER_PARAMETER_LOCATION = 'Location';
    public static final String OMA_CALLOUT_STARTING_QUERY_PARAMETER = '/oma?';
    public static final String OMA_SHAPE_CALLOUT_STARTING_QUERY_PARAMETER = '/oma/scale';
    public static final String OMA_CALLOUT_RESPONSE_SOURCE_TEXT_TO_BE_REPLACED_END = 'end';
    public static final String OMA_CALLOUT_RESPONSE_TARGET_TEXT_TO_BE_REPLACED_ENDS = 'ends';
    public static final String CALLOUT_TYPE_OMA_SHAPE = 'getOMAShape';
    public static final String CALLOUT_TYPE_OMA_SCALE = 'postOMAScale';
    public static final String CALLOUT_TYPE_GET = 'GET';
    public static final String CALLOUT_TYPE_POST = 'POST';
    public static final String OMA_CALLOUT_FAILURE_GENERIC_HEADER = 'OMA Callout Failure : Status '; //BS-999
    public static final String OMA_CALLOUT_FAILURE_REQUEST_HEADING = 'OMA Callout Request Sent: ';
    public static final String OMA_CALLOUT_FAILURE_RESPONSE_HEADING = 'OMA Callout Response Obtained: ';
    public static final String OMA_CALLOUT_PROCESS = 'OMA Callout';
    public static final String OMA_CALLOUT_FEATURES = 'features';
    public static final String OMA_CALLOUT_OMASHAPE_KEY = 'omaShapeKey';
    public static final String OMA_CALLOUT_REMOVE_DRILLS = 'removeDrills';
    public static final String OMA_CALLOUT_OMA_ONLY = 'omaOnly';
    public static final String OMA_CALLOUT_A = 'a';
    public static final String OMA_CALLOUT_B = 'b';
    public static final String OMA_CALLOUT_SF = 'sf';
    public static final String OMA_CALLOUT_B1 = 'b1';
    public static final String OMA_CALLOUT_B2 = 'b2';
    public static final String OMA_CALLOUT_BLP = 'blp';
    //BS-895
    public static final String CURRENCY_ISO_CODE_EURO = 'EUR'; //BS-1409

    //BS-710 start
    public static final String EE_SIZE = 'eeSize';
    public static final String FRAME_COLOR = 'frameColor';
    public static final String FRAME_COLOR_DESCRIPTION = 'frameColorDescription';
    public static final String TEMPLE_LENGTH = 'templeLength';
    public static final String BRIDGE_SIZE = 'bridgeSize';
    public static final String VARIANT_SHAPE = 'variantShape';
    //BS-710 end

    //BS-722
    public static final String LENS_SHAPE_IMAGE = 'lensShapeImage';
    public static final String LENS_SHAPE = 'lensShape';
    public static final String LENS_SHAPE_TITLE = 'LensShape';
    //BS-722

    //BS-795
    public static final String SHOW_ALL_SHAPES = 'showAllShapes';

    //BS-498
    public static final String SUCCESS = 'Success';
    public static final String LOGIN_COUNT = 'LoginCount';
    public static final String STATUS_STRING = 'Status';
    public static final String IN_PROGRESS = 'In Progress';
    public static final String COMPLETED = 'Completed';
    public static final String TEXT_PICKLIST = 'Text';
    public static final String OPTIONS_PICKLIST = 'Options';
    //BS-960
    public static final String SPECIAL_VARIATION_PARENT = 'Special Variation Parent';

    //BS-1494
    public static final String DEFAULT_CUSTOM_CART_ITEM_QUANTITY = '1';
    public static final String ACCENT_RINGS_SKU = 'accentRingSKU';
    public static final String LENS_HANDLING_SKU = 'lensHandlingSKU';
    //BS-1494
    //BS-1522 - start
    public static final String ANTIREFLECTION_PRODUCT = 'antireflectionProduct'; //BS-1522
    public static final String HARDCOATING_PRODUCT = 'hardCoatingProduct'; //BS-1522
    //BS-1522 - end
    //BS-1509
    public static final String SURVEY_NO_RESPONSE = 'No Response';
    public static final String SURVEY_OPEN_STATUS = 'Open';

    //BS-1473
    public static final String ACCENT_RING_VALUE_API_NAME = 'ACCENTRING';
    public static final String ACCENT_RING_IMAGE_URL = 'accentRingImageUrl';
    public static final String ACCENT_RING_IMAGE_TITLE = 'AccentRing';
    public static final String WITH_ACCENT_RING_VALUE = 'withAccentRingValue';
    public static final String REMOVE_GROOVE_VALUE = 'removeGrooveValue';
    public static final String ACCENT_RING_COLOR_SKU = 'accentRingColorSKU';
    public static final String ACCENT_RING_PRODUCT_ID = 'accentRingColorProductId';
    public static final String FEATURE_VALUE = 'featureValue';
    //BS-1473
    //BS-1466 start
    public static final String RELATION_TYPE_LENS_COLOR = 'Lens Color';
    public static final String RELATION_TYPE_PHOTO_SENSATION = 'Photo Sensation';
    public static final String RELATION_TYPE_BLUE_SENSATION = 'Blue Sensation';
    public static final String PHOTO_SENSATION_ID = 'photoSensationId';
    public static final String LENS_COLOR_ID = 'lensColorId';
    public static final String BLUE_SENSATION_ID = 'blueSensationId';
    public static final String LENS_DISTANCE = 'lensDistance';
    public static final String VISUAL_PREFERENCES = 'visualPreferences';
    public static final String LENS_EDGE = 'lensEdge';
    public static final String GLAZING = 'glazing';
    public static final String GLASS_PRODUCT = 'glassProduct';
    public static final String BLANK_COATING = 'blankCoating';
    public static final String LENS_PRODUCT_ID = 'lensProductId';
    public static final String ANTIREFLECTION_ID = 'antireflectionId';
    public static final String HARD_COATING_ID = 'hardCoatingId'; //BS-1466 end

    //BS-1493
    public static final String COLOR_GROOVE_CATEGORY = 'Color Groove';
    public static final String WITH_COLORED_GROOVE_VALUE = 'withColoredGroove';
    public static final String COLORED_GROOVE_COLOR_PRODUCT_ID = 'coloredGrooveColorProductId';
    public static final String FACET_CUT_VALUE = 'optimisedFacetCutValue';
    //BS-1493
    public static final String PRODUCT_MATERIAL = 'productMaterial'; //BS-1466
    public static final String TYPE_OR_FORM_APPLICABLE_VALUE_FOR_SCHNEIDER_CALLOUT = 'empty'; //BS-1483
    public static final String OMA_SHAPE_KEY_VALUE = 'omaShapeKeyValue'; //BS-1466
    public static final String ORDER_SUBMITTED_STATUS_VALUE = '20'; //BS-1652
    public static final String ORDER_SENT_STATUS_VALUE = '\',\'10'; //BS-1652
    public static final String SELECTED_LENS_SHAPE_ID = 'selectedLensShapeId'; //BS-1492
    public static final String TASK_B2B_PARTNER_PORTAL = 'B2B Partner Portal'; //BS-1645

    public static final String NEUBAU_ACCOUNT_STATUS_INACTIVE = 'inactive'; //BS-1662
    public static final String NEUBAU_ACCOUNT_STATUS_INACTIVE_API_NAME = '0'; //BS-1662
    public static final String OMA_CALLOUT_FAILURE_LENS_CONFIGURATOR_ID_HEADING = 'Lens Configurator ID: '; //BS-999
    public static final String OMA_CALLOUT_FAILURE_ARIS_ACCOUNT_ID_HEADING = 'ARIS Account ID: '; //BS-999
    public static final String EMAIL_BODY_HEAD_FOR_OMA_CALLOUT_CALCULATION_ERROR = 'OMA Callout Response: '; //BS-999

    /* Start : BS-967 */
    public static final String VISION_ZONE_ANALYSIS_ID = 'visionZoneAnalysisId';
    public static final String VISION_ZONE_CALLOUT_FAILURE_GENERIC_HEADER = 'Vision Zone Callout failed and Status: ';
    public static final String VISION_ZONE_CALLOUT_FAILURE_REQUEST_HEADING = 'Vision Zone Callout Request Sent: ';
    public static final String VISION_ZONE_CALLOUT_FAILURE_RESPONSE_HEADING = 'Vision Zone Callout Response Obtained: ';
    public static final String VISION_ZONE_CALLOUT_PROCESS = 'Vision Zone Analysis Callout';
    /* End : BS-967 */
    public static final String VISION_ZONE_CALLOUT_PROCESS_EMAIL_SUBJECT = 'Vision Zone Analysis Not Working'; //BS-1815
    public static final String VISION_ZONE_CALLOUT_ERROR_CODE = 'Error_503'; //BS-1815

    //BS-1699
    public static final String TIME_ZONE_KEY = 'Europe/Paris';
    public static final String EMAIL_ENCODING_KEY = 'UTF-8';

    /* Start : BS-1612 */
    public static final String VISION_ZONE_ANALYSIS_RESULT = 'visionZoneAnalysisResult';
    public static final String VISION_ZONE_ANALYSIS_RESULT_DATA = 'visionZoneAnalysisResultData';
    /* End : BS-1612 */
    public static final String STATUS_CLOSED = 'Closed'; //BS-1724
    public static final String ACCOUNT_STATUS_ACTIVE = 'active'; //BS-1740
    public static final String ACCOUNT_STATUS_ACTIVATED = '1'; //BS-1740
    public static final String CART_ITEM_CUSTOMER_REFERENCE_FIELD = 'Customer_Reference__c'; //BS-1562
    public static final String CART_ITEM_ENTERED_BY_FIELD = 'Entered_By__c'; //BS-1562
    public static final String B2B_SH_BRAND_API_NAME_01 = '01'; //BS-1714

    public static final String FRAME_CHANGE_TRIGGER_EVENT = 'frameChange'; //BS-1798
    public static final String ORDER_TYPE_OR_FRAME_TYPE_CHANGE_TRIGGER_EVENT = 'orderOrFrameTypeChange'; //BS-1798
    public static final String COUNTRY_NAME_USER_INPUT = 'countryName'; //BS-1823
    public static final String ACTIVE_COUNTRY_METADATA_BRAND_VALUE_SH_EE = 'SH/EE'; //BS-1823
    public static final String ACTIVE_COUNTRY_METADATA_BRAND_VALUE_NB = 'NB'; //BS-1823
    public static final String NOT_APPLICABLE_VALUE = 'N/A'; // BS-1862
    public static final String S_GRAVING_VALUE = 'sGravingValue'; //BS-1796
    public static final String LASTNAME = 'LastName'; //BS-1923
    public static final String FIRSTNAME = 'FirstName'; //BS-1923
    public static final String ACTIVE_STATUS = '1'; //BS-1923
    public static final String FEDERATIONIDENTIFIER = 'FederationIdentifier'; //BS-1923
    public static final String SALUTATION = 'N/A'; //BS-1923
    public static final String EMAIL = 'Email'; //BS-1923
    public static final String PROFILEID = 'ProfileId'; //BS-1923
    public static final String ALIAS = 'Alias'; //BS-1923
    public static final String PHONE = 'Phone'; //BS-1923
    public static final String LANGUAGRLOCALKEY = 'LanguageLocaleKey'; //BS-1923
    public static final String LOCALSIDKEY = 'LocaleSidKey'; //BS-1923
    public static final String TIMEZONESIDKEY = 'TimeZoneSidKey';
    public static final String EMAILENCODINGKEY = 'EmailEncodingKey'; //BS-1923
    public static final String ENABLEFILTERPREFERENCESETTING = 'Enable_Filter_Preference_Settings__c'; //BS-1923
    public static final String CONTACTID = 'contactId'; //BS-1923
    public static final String IDENTITY_USER_MEDIAHUB_ONLY = 'Identity User - Mediahub only'; //BS-1923
    public static final String SUBSEGMENT_ERROR = 'Subsegment Error'; //BS-2059
    public static final String SVS_BRAND_LABEL = 'SVS'; //BS-2055
    public static final String ACCOUNT_BLOCKED_FOR_REGISTRATION_ERROR = 'Account Blocked For Registration Error'; //BS-2057
    public static final String SILHOUETTE_B2B_STORE = 'Silhouette B2B Store'; //BS-836
    public static final String NEUBAU_B2B_STORE = 'Neubau B2B Store'; //BS-836
    public static final String SHARE_TYPE = 'V'; //BS-836
    public static final String UNDEFINED = 'undefined'; //BS-2031
    public static final String PARTIAL_GROOVE = 'partialGroove'; //BS-2137
    public static final String OPTICAL_SUN_GLAZING = 'Optical Sun Glazing'; //BS-2219

    public static final String TASK_STATUS = 'Open'; //BS-2290
    public static final String TASK_SUBTYPE = 'Task'; //BS-2290
    public static final String TASK_PRIORITY = 'High'; //BS-2290
    public static final String ACADEMY_REGISTRATION = 'Academy Registration'; //BS-2290
    public static final String ACADEMY_REGISTRATION_EMAIL_TEMPLATE_NAME = 'B2B_Academy_Registration_Form_Success_All_Languages'; //BS-2290
    public static final String ACADEMY_SALUTATION = 'salutation'; //BS-2290
    public static final String ACADEMY_FIRSTNAME = 'firstName'; //BS-2290
    public static final String ACADEMY_LASTNAME = 'lastName'; //BS-2290
    public static final String ACADEMY_EMAIL_ADDRESS = 'emailAddress'; //BS-2290
    public static final String ACADEMY_FUNCTION = 'function'; //BS-2290

    public static final String GENERIC_ERROR = 'Something went wrong'; //BS-2224
    public static final String PROFILE_NAME_NB = 'B2B Commerce User Neubau'; //BS-2224
    public static final String PROFILE_NAME_SH = 'B2B Commerce User Silhouette'; //BS-2224
    public static final String INSERT_FAILED = 'Insert User Failed'; //BS-2224
    public static final String TIME_ZONE_ID_KEY = 'Europe/Berlin'; //BS-2224

    public static final String CONTACT_NAME = 'contactName'; //BS-2362
    public static final String REQUEST = 'request'; //BS-2362
    public static final String CONTACT_EMAIL = 'contactEmail'; //BS-2362
    public static final String REQUEST_MESSAGE = 'requestMessage'; //BS-2362
    public static final String REQUEST_TYPE_PLACEHOLDER = '<requestTypePlaceHolder>'; //BS-2362
    public static final String CONTACT_NAME_PLACEHOLDER = '<ContactNamePlaceHolder>'; //BS-2362
    public static final String CONTACT_EMAIL_PLACEHOLDER = '<ContactEmailPlaceHolder>'; //BS-2362
    public static final String DESCRIPTION_PLACEHOLDER = '<descriptionPlaceHolder>'; //BS-2362
    public static final String ACCOUNT_BRAND = 'accountBrand';

    public static final String COMPACT = 'Compact';
    public static final String PRODUCT_IMAGE = 'Product Image';
}
