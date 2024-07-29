import { LightningElement } from 'lwc';

const GERMAN_LANGUAGE = 'de'; //BS-1244
const BASE64_IMAGE_ENCODING_FORMAT = 'data:image/jpeg;base64';

/**
 * BS-572
 * This method used to restructure the lens calculation collection from the lens calcualtion data obtained from schneider callout
 */
const setupLensCalculationsIntoCollection = (
    receivedCalculateLensFieldsCollection,
    lensConfiguratorCollection,
    lensCalculationCollection,
    sourceFromMyVSRX,
    LANG,
    thicknessMatchingCalculatorLeftValue,
    thicknessMatchingCalculatorRightValue,
    preservedCollection,
    isEvilEdgeApplicable,
    isEvilEyeEdgePreSelected,
    isLeftLensApplicable,
    isRightLensApplicable
) => {
    let calculationCollectionSummary = {};
    calculationCollectionSummary.calculateLensFieldsCollectionSummary = {};
    calculationCollectionSummary.evilEyeEdgeLeftImageSRC = null;
    calculationCollectionSummary.evilEyeEdgeRightImageSRC = null;
    calculationCollectionSummary.leftImageSRC = null;
    calculationCollectionSummary.rightImageSRC = null;
    calculationCollectionSummary.leftImageSRCToBeSaved = null;
    calculationCollectionSummary.rightImageSRCToBeSaved = null;
    calculationCollectionSummary.isAdjusted = false;
    calculationCollectionSummary.thicknessMatchingCalculatorLeftValue = null;
    calculationCollectionSummary.thicknessMatchingCalculatorRightValue = null;
    calculationCollectionSummary.evilEyeEdgeLeftImageSRCToBeSaved = null;
    calculationCollectionSummary.evilEyeEdgeRightImageSRCToBeSaved = null;
    calculationCollectionSummary.preCalcGuid = null; //BS-1439

    let calculateLensFieldsCollection = JSON.parse(JSON.stringify(receivedCalculateLensFieldsCollection));

    if (sourceFromMyVSRX != null && sourceFromMyVSRX != undefined && sourceFromMyVSRX == true) {
        calculateLensFieldsCollection.forEach((currentInstance) => {
            if (currentInstance.isWeightType == true) {
                currentInstance.leftLensValue =
                    lensConfiguratorCollection.weightOfLeftLens != null && lensConfiguratorCollection.weightOfLeftLens != undefined
                        ? lensConfiguratorCollection.weightOfLeftLens
                        : null;
                currentInstance.rightLensValue =
                    lensConfiguratorCollection.weightOfRightLens != null && lensConfiguratorCollection.weightOfRightLens != undefined
                        ? lensConfiguratorCollection.weightOfRightLens
                        : null;
                currentInstance.adjustedLeftLensValue =
                    lensConfiguratorCollection.weightOfLeftLensAdjusted != null && lensConfiguratorCollection.weightOfLeftLensAdjusted != undefined
                        ? lensConfiguratorCollection.weightOfLeftLensAdjusted
                        : null;
                currentInstance.adjustedRightLensValue =
                    lensConfiguratorCollection.weightOfRightLensAdjusted != null && lensConfiguratorCollection.weightOfRightLensAdjusted != undefined
                        ? lensConfiguratorCollection.weightOfRightLensAdjusted
                        : null;
                if (currentInstance.adjustedLeftLensValue != null || currentInstance.adjustedRightLensValue != null) {
                    calculationCollectionSummary.isAdjusted = true;
                }
            }

            if (currentInstance.isAxisMinimumType == true) {
                currentInstance.leftLensValue =
                    lensConfiguratorCollection.axisMinimumOfLeftLens != null && lensConfiguratorCollection.axisMinimumOfLeftLens != undefined
                        ? lensConfiguratorCollection.axisMinimumOfLeftLens
                        : null;
                currentInstance.rightLensValue =
                    lensConfiguratorCollection.axisMinimumOfRightLens != null && lensConfiguratorCollection.axisMinimumOfRightLens != undefined
                        ? lensConfiguratorCollection.axisMinimumOfRightLens
                        : null;
                currentInstance.adjustedLeftLensValue =
                    lensConfiguratorCollection.axisMinimumOfOfLeftLensAdjusted != null &&
                    lensConfiguratorCollection.axisMinimumOfOfLeftLensAdjusted != undefined
                        ? lensConfiguratorCollection.axisMinimumOfOfLeftLensAdjusted
                        : null;
                currentInstance.adjustedRightLensValue =
                    lensConfiguratorCollection.axisMinimumOfRightLensAdjusted != null && lensConfiguratorCollection.axisMinimumOfRightLensAdjusted != undefined
                        ? lensConfiguratorCollection.axisMinimumOfRightLensAdjusted
                        : null;
            }

            if (currentInstance.isAxisMaximumType == true) {
                currentInstance.leftLensValue =
                    lensConfiguratorCollection.axisMaximumOfLeftLens != null && lensConfiguratorCollection.axisMaximumOfLeftLens != undefined
                        ? lensConfiguratorCollection.axisMaximumOfLeftLens
                        : null;
                currentInstance.rightLensValue =
                    lensConfiguratorCollection.axisMaximumOfRightLens != null && lensConfiguratorCollection.axisMaximumOfRightLens != undefined
                        ? lensConfiguratorCollection.axisMaximumOfRightLens
                        : null;
                currentInstance.adjustedLeftLensValue =
                    lensConfiguratorCollection.axisMaximumOfOfLeftLensAdjusted != null &&
                    lensConfiguratorCollection.axisMaximumOfOfLeftLensAdjusted != undefined
                        ? lensConfiguratorCollection.axisMaximumOfOfLeftLensAdjusted
                        : null;
                currentInstance.adjustedRightLensValue =
                    lensConfiguratorCollection.axisMaximumOfRightLensAdjusted != null && lensConfiguratorCollection.axisMaximumOfRightLensAdjusted != undefined
                        ? lensConfiguratorCollection.axisMaximumOfRightLensAdjusted
                        : null;
            }

            if (currentInstance.isLensThicknessAtCenterType) {
                currentInstance.leftLensValue =
                    lensConfiguratorCollection.centerThicknessOfLeftLens != null && lensConfiguratorCollection.centerThicknessOfLeftLens != undefined
                        ? lensConfiguratorCollection.centerThicknessOfLeftLens
                        : null;
                currentInstance.rightLensValue =
                    lensConfiguratorCollection.centerThicknessOfRightLens != null && lensConfiguratorCollection.centerThicknessOfRightLens != undefined
                        ? lensConfiguratorCollection.centerThicknessOfRightLens
                        : null;
                currentInstance.adjustedLeftLensValue =
                    lensConfiguratorCollection.centerThicknessOfOfLeftLensAdjusted != null &&
                    lensConfiguratorCollection.centerThicknessOfOfLeftLensAdjusted != undefined
                        ? lensConfiguratorCollection.centerThicknessOfOfLeftLensAdjusted
                        : null;
                currentInstance.adjustedRightLensValue =
                    lensConfiguratorCollection.centerThicknessOfRightLensAdjusted != null &&
                    lensConfiguratorCollection.centerThicknessOfRightLensAdjusted != undefined
                        ? lensConfiguratorCollection.centerThicknessOfRightLensAdjusted
                        : null;
            }

            if (currentInstance.isLensThicknessAtBorderMaximumType == true) {
                currentInstance.leftLensValue =
                    lensConfiguratorCollection.borderMaximumThicknessOfLeftLens != null &&
                    lensConfiguratorCollection.borderMaximumThicknessOfLeftLens != undefined
                        ? lensConfiguratorCollection.borderMaximumThicknessOfLeftLens
                        : null;
                currentInstance.rightLensValue =
                    lensConfiguratorCollection.borderMaximumThicknessOfRightLens != null &&
                    lensConfiguratorCollection.borderMaximumThicknessOfRightLens != undefined
                        ? lensConfiguratorCollection.borderMaximumThicknessOfRightLens
                        : null;
                currentInstance.adjustedLeftLensValue =
                    lensConfiguratorCollection.borderMaximumThicknessOfLeftLensAdjusted != null &&
                    lensConfiguratorCollection.borderMaximumThicknessOfLeftLensAdjusted != undefined
                        ? lensConfiguratorCollection.borderMaximumThicknessOfLeftLensAdjusted
                        : null;
                currentInstance.adjustedRightLensValue =
                    lensConfiguratorCollection.borderMaximumThicknessOfRightLensAdjusted != null &&
                    lensConfiguratorCollection.borderMaximumThicknessOfRightLensAdjusted != undefined
                        ? lensConfiguratorCollection.borderMaximumThicknessOfRightLensAdjusted
                        : null;
            }

            if (currentInstance.isLensThicknessAtBorderMinimumType == true) {
                currentInstance.leftLensValue =
                    lensConfiguratorCollection.borderMinimumThicknessOfLeftLens != null &&
                    lensConfiguratorCollection.borderMinimumThicknessOfLeftLens != undefined
                        ? lensConfiguratorCollection.borderMinimumThicknessOfLeftLens
                        : null;
                currentInstance.rightLensValue =
                    lensConfiguratorCollection.borderMinimumThicknessOfRightLens != null &&
                    lensConfiguratorCollection.borderMinimumThicknessOfRightLens != undefined
                        ? lensConfiguratorCollection.borderMinimumThicknessOfRightLens
                        : null;
                currentInstance.adjustedLeftLensValue =
                    lensConfiguratorCollection.borderMinimumThicknessOfOfLeftLensAdjusted != null &&
                    lensConfiguratorCollection.borderMinimumThicknessOfOfLeftLensAdjusted != undefined
                        ? lensConfiguratorCollection.borderMinimumThicknessOfOfLeftLensAdjusted
                        : null;
                currentInstance.adjustedRightLensValue =
                    lensConfiguratorCollection.borderMinimumThicknessOfRightLensAdjusted != null &&
                    lensConfiguratorCollection.borderMinimumThicknessOfRightLensAdjusted != undefined
                        ? lensConfiguratorCollection.borderMinimumThicknessOfRightLensAdjusted
                        : null;
            }

            currentInstance.leftImageSRC =
                lensConfiguratorCollection.leftImageSRC != null && lensConfiguratorCollection.leftImageSRC != undefined
                    ? lensConfiguratorCollection.leftImageSRC
                    : null;
            currentInstance.rightImageSRC =
                lensConfiguratorCollection.rightImageSRC != null && lensConfiguratorCollection.rightImageSRC != undefined
                    ? lensConfiguratorCollection.rightImageSRC
                    : null;

            calculationCollectionSummary.leftImageSRC = currentInstance.leftImageSRC;
            calculationCollectionSummary.rightImageSRC = currentInstance.rightImageSRC;
        });

        calculationCollectionSummary.thicknessMatchingCalculatorLeftValue =
            lensConfiguratorCollection.thicknessMatchingCalculatorLeftValue != null &&
            lensConfiguratorCollection.thicknessMatchingCalculatorLeftValue != undefined
                ? lensConfiguratorCollection.thicknessMatchingCalculatorLeftValue
                : null;
        calculationCollectionSummary.thicknessMatchingCalculatorRightValue =
            lensConfiguratorCollection.thicknessMatchingCalculatorRightValue != null &&
            lensConfiguratorCollection.thicknessMatchingCalculatorRightValue != undefined
                ? lensConfiguratorCollection.thicknessMatchingCalculatorRightValue
                : null;
        //BS-1244
        if (LANG === GERMAN_LANGUAGE) {
            if (
                calculationCollectionSummary.thicknessMatchingCalculatorLeftValue != undefined &&
                calculationCollectionSummary.thicknessMatchingCalculatorLeftValue != null
            ) {
                calculationCollectionSummary.thicknessMatchingCalculatorLeftValue = calculationCollectionSummary.thicknessMatchingCalculatorLeftValue.replace(
                    '.',
                    ','
                );
            }
            if (
                calculationCollectionSummary.thicknessMatchingCalculatorRightValue != undefined &&
                calculationCollectionSummary.thicknessMatchingCalculatorRightValue != null
            ) {
                calculationCollectionSummary.thicknessMatchingCalculatorRightValue = calculationCollectionSummary.thicknessMatchingCalculatorRightValue.replace(
                    '.',
                    ','
                );
            }
        }
        //BS-1244
    } else if (
        (sourceFromMyVSRX == null || sourceFromMyVSRX == undefined || sourceFromMyVSRX == false) &&
        preservedCollection != null &&
        preservedCollection != undefined
    ) {
        calculateLensFieldsCollection.forEach((currentInstance) => {
            preservedCollection.forEach((lensInstance) => {
                if (lensInstance.isWeightType == true && currentInstance.isWeightType == true) {
                    currentInstance.leftLensValue =
                        lensInstance.leftLensValue != null && lensInstance.leftLensValue != undefined ? lensInstance.leftLensValue : null;
                    currentInstance.rightLensValue =
                        lensInstance.rightLensValue != null && lensInstance.rightLensValue != undefined ? lensInstance.rightLensValue : null;
                    currentInstance.adjustedLeftLensValue =
                        lensInstance.adjustedLeftLensValue != null && lensInstance.adjustedLeftLensValue != undefined
                            ? lensInstance.adjustedLeftLensValue
                            : null;
                    currentInstance.adjustedRightLensValue =
                        lensInstance.adjustedRightLensValue != null && lensInstance.adjustedRightLensValue != undefined
                            ? lensInstance.adjustedRightLensValue
                            : null;
                    if (currentInstance.adjustedLeftLensValue != null || currentInstance.adjustedRightLensValue != null) {
                        calculationCollectionSummary.isAdjusted = true;
                    }
                }
                if (lensInstance.isAxisMinimumType == true && currentInstance.isAxisMinimumType == true) {
                    currentInstance.leftLensValue =
                        lensInstance.leftLensValue != null && lensInstance.leftLensValue != undefined ? lensInstance.leftLensValue : null;
                    currentInstance.rightLensValue =
                        lensInstance.rightLensValue != null && lensInstance.rightLensValue != undefined ? lensInstance.rightLensValue : null;
                    currentInstance.adjustedLeftLensValue =
                        lensInstance.adjustedLeftLensValue != null && lensInstance.adjustedLeftLensValue != undefined
                            ? lensInstance.adjustedLeftLensValue
                            : null;
                    currentInstance.adjustedRightLensValue =
                        lensInstance.adjustedRightLensValue != null && lensInstance.adjustedRightLensValue != undefined
                            ? lensInstance.adjustedRightLensValue
                            : null;
                }

                if (lensInstance.isAxisMaximumType == true && currentInstance.isAxisMaximumType == true) {
                    currentInstance.leftLensValue =
                        lensInstance.leftLensValue != null && lensInstance.leftLensValue != undefined ? lensInstance.leftLensValue : null;
                    currentInstance.rightLensValue =
                        lensInstance.rightLensValue != null && lensInstance.rightLensValue != undefined ? lensInstance.rightLensValue : null;
                    currentInstance.adjustedLeftLensValue =
                        lensInstance.adjustedLeftLensValue != null && lensInstance.adjustedLeftLensValue != undefined
                            ? lensInstance.adjustedLeftLensValue
                            : null;
                    currentInstance.adjustedRightLensValue =
                        lensInstance.adjustedRightLensValue != null && lensInstance.adjustedRightLensValue != undefined
                            ? lensInstance.adjustedRightLensValue
                            : null;
                }

                if (lensInstance.isLensThicknessAtCenterType == true && currentInstance.isLensThicknessAtCenterType) {
                    currentInstance.leftLensValue =
                        lensInstance.leftLensValue != null && lensInstance.leftLensValue != undefined ? lensInstance.leftLensValue : null;
                    currentInstance.rightLensValue =
                        lensInstance.rightLensValue != null && lensInstance.rightLensValue != undefined ? lensInstance.rightLensValue : null;
                    currentInstance.adjustedLeftLensValue =
                        lensInstance.adjustedLeftLensValue != null && lensInstance.adjustedLeftLensValue != undefined
                            ? lensInstance.adjustedLeftLensValue
                            : null;
                    currentInstance.adjustedRightLensValue =
                        lensInstance.adjustedRightLensValue != null && lensInstance.adjustedRightLensValue != undefined
                            ? lensInstance.adjustedRightLensValue
                            : null;
                }

                if (lensInstance.isLensThicknessAtBorderMaximumType == true && currentInstance.isLensThicknessAtBorderMaximumType == true) {
                    currentInstance.leftLensValue =
                        lensInstance.leftLensValue != null && lensInstance.leftLensValue != undefined ? lensInstance.leftLensValue : null;
                    currentInstance.rightLensValue =
                        lensInstance.rightLensValue != null && lensInstance.rightLensValue != undefined ? lensInstance.rightLensValue : null;
                    currentInstance.adjustedLeftLensValue =
                        lensInstance.adjustedLeftLensValue != null && lensInstance.adjustedLeftLensValue != undefined
                            ? lensInstance.adjustedLeftLensValue
                            : null;
                    currentInstance.adjustedRightLensValue =
                        lensInstance.adjustedRightLensValue != null && lensInstance.adjustedRightLensValue != undefined
                            ? lensInstance.adjustedRightLensValue
                            : null;
                }

                if (lensInstance.isLensThicknessAtBorderMinimumType == true && currentInstance.isLensThicknessAtBorderMinimumType == true) {
                    currentInstance.leftLensValue =
                        lensInstance.leftLensValue != null && lensInstance.leftLensValue != undefined ? lensInstance.leftLensValue : null;
                    currentInstance.rightLensValue =
                        lensInstance.rightLensValue != null && lensInstance.rightLensValue != undefined ? lensInstance.rightLensValue : null;
                    currentInstance.adjustedLeftLensValue =
                        lensInstance.adjustedLeftLensValue != null && lensInstance.adjustedLeftLensValue != undefined
                            ? lensInstance.adjustedLeftLensValue
                            : null;
                    currentInstance.adjustedRightLensValue =
                        lensInstance.adjustedRightLensValue != null && lensInstance.adjustedRightLensValue != undefined
                            ? lensInstance.adjustedRightLensValue
                            : null;
                }

                currentInstance.leftImageSRC = lensInstance.leftImageSRC != null && lensInstance.leftImageSRC != undefined ? lensInstance.leftImageSRC : null;
                currentInstance.rightImageSRC =
                    lensInstance.rightImageSRC != null && lensInstance.rightImageSRC != undefined ? lensInstance.rightImageSRC : null;

                calculationCollectionSummary.leftImageSRC = currentInstance.leftImageSRC;
                calculationCollectionSummary.rightImageSRC = currentInstance.rightImageSRC;
            });
        });

        calculationCollectionSummary.thicknessMatchingCalculatorLeftValue =
            lensConfiguratorCollection.thicknessMatchingCalculatorLeftValue != null &&
            lensConfiguratorCollection.thicknessMatchingCalculatorLeftValue != undefined
                ? lensConfiguratorCollection.thicknessMatchingCalculatorLeftValue
                : null;
        calculationCollectionSummary.thicknessMatchingCalculatorRightValue =
            lensConfiguratorCollection.thicknessMatchingCalculatorRightValue != null &&
            lensConfiguratorCollection.thicknessMatchingCalculatorRightValue != undefined
                ? lensConfiguratorCollection.thicknessMatchingCalculatorRightValue
                : null;

        if (LANG === GERMAN_LANGUAGE) {
            calculationCollectionSummary.thicknessMatchingCalculatorLeftValue = calculationCollectionSummary.thicknessMatchingCalculatorLeftValue.replace(
                '.',
                ','
            );
            calculationCollectionSummary.thicknessMatchingCalculatorRightValue = calculationCollectionSummary.thicknessMatchingCalculatorRightValue.replace(
                '.',
                ','
            );
        }
    } else {
        if (isEvilEdgeApplicable != null && isEvilEdgeApplicable != undefined && isEvilEdgeApplicable == true) {
            calculateLensFieldsCollection.forEach((instance) => {
                if (instance.isWeightType == true) {
                    if (isEvilEdgeApplicable != null || isEvilEdgeApplicable != undefined || isEvilEdgeApplicable == true) {
                        if (isEvilEyeEdgePreSelected != null && isEvilEyeEdgePreSelected != undefined && isEvilEyeEdgePreSelected == false) {
                            instance.evilEyeEdgeLeftValue =
                                lensCalculationCollection.left != null &&
                                lensCalculationCollection.left != undefined &&
                                lensCalculationCollection.left.weight != null &&
                                lensCalculationCollection.left.weight != undefined
                                    ? lensCalculationCollection.left.weight
                                    : null;
                            instance.adjustedLeftLensValue = null;

                            instance.evilEyeEdgeRightValue =
                                lensCalculationCollection.right != null &&
                                lensCalculationCollection.right != undefined &&
                                lensCalculationCollection.right.weight != null &&
                                lensCalculationCollection.right.weight != undefined
                                    ? lensCalculationCollection.right.weight
                                    : null;
                            instance.adjustedRightLensValue = null;
                        } else {
                            instance.leftLensValue =
                                lensCalculationCollection.left != null &&
                                lensCalculationCollection.left != undefined &&
                                lensCalculationCollection.left.weight != null &&
                                lensCalculationCollection.left.weight != undefined
                                    ? lensCalculationCollection.left.weight
                                    : null;
                            instance.adjustedLeftLensValue = null;
                            instance.evilEyeEdgeLeftValue = null;

                            instance.rightLensValue =
                                lensCalculationCollection.right != null &&
                                lensCalculationCollection.right != undefined &&
                                lensCalculationCollection.right.weight != null &&
                                lensCalculationCollection.right.weight != undefined
                                    ? lensCalculationCollection.right.weight
                                    : null;
                            instance.adjustedRightLensValue = null;
                            instance.evilEyeEdgeRightValue = null;
                        }
                    }
                }

                if (instance.isAxisMinimumType == true) {
                    if (isEvilEdgeApplicable != null || isEvilEdgeApplicable != undefined || isEvilEdgeApplicable == true) {
                        if (isEvilEyeEdgePreSelected != null && isEvilEyeEdgePreSelected != undefined && isEvilEyeEdgePreSelected == false) {
                            instance.evilEyeEdgeLeftValue =
                                lensCalculationCollection.left != null &&
                                lensCalculationCollection.left != undefined &&
                                lensCalculationCollection.left.edge != null &&
                                lensCalculationCollection.left.edge != undefined &&
                                lensCalculationCollection.left.edge.axisMin != null &&
                                lensCalculationCollection.left.edge.axisMin != undefined
                                    ? lensCalculationCollection.left.edge.axisMin
                                    : null;
                            instance.adjustedLeftLensValue = null;

                            instance.evilEyeEdgeRightValue =
                                lensCalculationCollection.right != null &&
                                lensCalculationCollection.right != undefined &&
                                lensCalculationCollection.right.edge != null &&
                                lensCalculationCollection.right.edge != undefined &&
                                lensCalculationCollection.right.edge.axisMin != null &&
                                lensCalculationCollection.right.edge.axisMin != undefined
                                    ? lensCalculationCollection.right.edge.axisMin
                                    : null;
                            instance.adjustedRightLensValue = null;
                        } else {
                            instance.leftLensValue =
                                lensCalculationCollection.left != null &&
                                lensCalculationCollection.left != undefined &&
                                lensCalculationCollection.left.edge != null &&
                                lensCalculationCollection.left.edge != undefined &&
                                lensCalculationCollection.left.edge.axisMin != null &&
                                lensCalculationCollection.left.edge.axisMin != undefined
                                    ? lensCalculationCollection.left.edge.axisMin
                                    : null;
                            instance.adjustedLeftLensValue = null;
                            instance.evilEyeEdgeLeftValue = null;

                            instance.rightLensValue =
                                lensCalculationCollection.right != null &&
                                lensCalculationCollection.right != undefined &&
                                lensCalculationCollection.right.edge != null &&
                                lensCalculationCollection.right.edge != undefined &&
                                lensCalculationCollection.right.edge.axisMin != null &&
                                lensCalculationCollection.right.edge.axisMin != undefined
                                    ? lensCalculationCollection.right.edge.axisMin
                                    : null;
                            instance.adjustedRightLensValue = null;
                            instance.evilEyeEdgeRightValue = null;
                        }
                    }
                }

                if (instance.isAxisMaximumType == true) {
                    if (isEvilEdgeApplicable != null || isEvilEdgeApplicable != undefined || isEvilEdgeApplicable == true) {
                        if (isEvilEyeEdgePreSelected != null && isEvilEyeEdgePreSelected != undefined && isEvilEyeEdgePreSelected == false) {
                            instance.evilEyeEdgeLeftValue =
                                lensCalculationCollection.left != null &&
                                lensCalculationCollection.left != undefined &&
                                lensCalculationCollection.left.edge != null &&
                                lensCalculationCollection.left.edge != undefined &&
                                lensCalculationCollection.left.edge.axisMax != null &&
                                lensCalculationCollection.left.edge.axisMax != undefined
                                    ? lensCalculationCollection.left.edge.axisMax
                                    : null;
                            instance.adjustedLeftLensValue = null;

                            instance.evilEyeEdgeRightValue =
                                lensCalculationCollection.right != null &&
                                lensCalculationCollection.right != undefined &&
                                lensCalculationCollection.right.edge != null &&
                                lensCalculationCollection.right.edge != undefined &&
                                lensCalculationCollection.right.edge.axisMax != null &&
                                lensCalculationCollection.right.edge.axisMax != undefined
                                    ? lensCalculationCollection.right.edge.axisMax
                                    : null;
                            instance.adjustedRightLensValue = null;
                        } else {
                            instance.leftLensValue =
                                lensCalculationCollection.left != null &&
                                lensCalculationCollection.left != undefined &&
                                lensCalculationCollection.left.edge != null &&
                                lensCalculationCollection.left.edge != undefined &&
                                lensCalculationCollection.left.edge.axisMax != null &&
                                lensCalculationCollection.left.edge.axisMax != undefined
                                    ? lensCalculationCollection.left.edge.axisMax
                                    : null;
                            instance.adjustedLeftLensValue = null;
                            instance.evilEyeEdgeLeftValue = null;

                            instance.rightLensValue =
                                lensCalculationCollection.right != null &&
                                lensCalculationCollection.right != undefined &&
                                lensCalculationCollection.right.edge != null &&
                                lensCalculationCollection.right.edge != undefined &&
                                lensCalculationCollection.right.edge.axisMax != null &&
                                lensCalculationCollection.right.edge.axisMax != undefined
                                    ? lensCalculationCollection.right.edge.axisMax
                                    : null;
                            instance.rightValue = null;
                            instance.evilEyeEdgeRightValue = null;
                        }
                    }
                }

                if (instance.isLensThicknessAtCenterType == true) {
                    if (isEvilEdgeApplicable != null || isEvilEdgeApplicable != undefined || isEvilEdgeApplicable == true) {
                        if (isEvilEyeEdgePreSelected != null && isEvilEyeEdgePreSelected != undefined && isEvilEyeEdgePreSelected == false) {
                            instance.evilEyeEdgeLeftValue =
                                lensCalculationCollection.left != null &&
                                lensCalculationCollection.left != undefined &&
                                lensCalculationCollection.left.centerThickness != null &&
                                lensCalculationCollection.left.centerThickness != undefined
                                    ? lensCalculationCollection.left.centerThickness
                                    : null;
                            instance.adjustedLeftLensValue = null;

                            instance.evilEyeEdgeRightValue =
                                lensCalculationCollection.right != null &&
                                lensCalculationCollection.right != undefined &&
                                lensCalculationCollection.right.centerThickness != null &&
                                lensCalculationCollection.right.centerThickness != undefined
                                    ? lensCalculationCollection.right.centerThickness
                                    : null;
                            instance.adjustedRightLensValue = null;
                        } else {
                            instance.leftLensValue =
                                lensCalculationCollection.left != null &&
                                lensCalculationCollection.left != undefined &&
                                lensCalculationCollection.left.centerThickness != null &&
                                lensCalculationCollection.left.centerThickness != undefined
                                    ? lensCalculationCollection.left.centerThickness
                                    : null;
                            instance.adjustedLeftLensValue = null;
                            instance.evilEyeEdgeLeftValue = null;

                            instance.rightLensValue =
                                lensCalculationCollection.right != null &&
                                lensCalculationCollection.right != undefined &&
                                lensCalculationCollection.right.centerThickness != null &&
                                lensCalculationCollection.right.centerThickness != undefined
                                    ? lensCalculationCollection.right.centerThickness
                                    : null;
                            instance.adjustedRightLensValue = null;
                            instance.evilEyeEdgeRightValue = null;
                        }
                    }
                }

                if (instance.isLensThicknessAtBorderMaximumType == true) {
                    if (isEvilEdgeApplicable != null || isEvilEdgeApplicable != undefined || isEvilEdgeApplicable == true) {
                        if (isEvilEyeEdgePreSelected != null && isEvilEyeEdgePreSelected != undefined && isEvilEyeEdgePreSelected == false) {
                            instance.evilEyeEdgeLeftValue =
                                lensCalculationCollection.left != null &&
                                lensCalculationCollection.left != undefined &&
                                lensCalculationCollection.left.edge != null &&
                                lensCalculationCollection.left.edge != undefined &&
                                lensCalculationCollection.left.edge.rdMax != null &&
                                lensCalculationCollection.left.edge.rdMax != undefined
                                    ? lensCalculationCollection.left.edge.rdMax
                                    : null;
                            instance.adjustedLeftLensValue = null;

                            instance.evilEyeEdgeRightValue =
                                lensCalculationCollection.right != null &&
                                lensCalculationCollection.right != undefined &&
                                lensCalculationCollection.right.edge != null &&
                                lensCalculationCollection.right.edge != undefined &&
                                lensCalculationCollection.right.edge.rdMax != null &&
                                lensCalculationCollection.right.edge.rdMax != undefined
                                    ? lensCalculationCollection.right.edge.rdMax
                                    : null;
                            instance.adjustedRightLensValue = null;
                        } else {
                            instance.leftLensValue =
                                lensCalculationCollection.left != null &&
                                lensCalculationCollection.left != undefined &&
                                lensCalculationCollection.left.edge != null &&
                                lensCalculationCollection.left.edge != undefined &&
                                lensCalculationCollection.left.edge.rdMax != null &&
                                lensCalculationCollection.left.edge.rdMax != undefined
                                    ? lensCalculationCollection.left.edge.rdMax
                                    : null;
                            instance.adjustedLeftLensValue = null;
                            instance.evilEyeEdgeLeftValue = null;

                            instance.rightLensValue =
                                lensCalculationCollection.right != null &&
                                lensCalculationCollection.right != undefined &&
                                lensCalculationCollection.right.edge != null &&
                                lensCalculationCollection.right.edge != undefined &&
                                lensCalculationCollection.right.edge.rdMax != null &&
                                lensCalculationCollection.right.edge.rdMax != undefined
                                    ? lensCalculationCollection.right.edge.rdMax
                                    : null;
                            instance.adjustedRightLensValue = null;
                            instance.evilEyeEdgeRightValue = null;
                        }
                    }
                }

                if (instance.isLensThicknessAtBorderMinimumType == true) {
                    if (isEvilEdgeApplicable != null || isEvilEdgeApplicable != undefined || isEvilEdgeApplicable == true) {
                        if (isEvilEyeEdgePreSelected != null && isEvilEyeEdgePreSelected != undefined && isEvilEyeEdgePreSelected == false) {
                            instance.evilEyeEdgeLeftValue =
                                lensCalculationCollection.left != null &&
                                lensCalculationCollection.left != undefined &&
                                lensCalculationCollection.left.edge != null &&
                                lensCalculationCollection.left.edge != undefined &&
                                lensCalculationCollection.left.edge.rdMin != null &&
                                lensCalculationCollection.left.edge.rdMin != undefined
                                    ? lensCalculationCollection.left.edge.rdMin
                                    : null;
                            instance.adjustedLeftLensValue = null;

                            instance.evilEyeEdgeRightValue =
                                lensCalculationCollection.right != null &&
                                lensCalculationCollection.right != undefined &&
                                lensCalculationCollection.right.edge != null &&
                                lensCalculationCollection.right.edge != undefined &&
                                lensCalculationCollection.right.edge.rdMin != null &&
                                lensCalculationCollection.right.edge.rdMin != undefined
                                    ? lensCalculationCollection.right.edge.rdMin
                                    : null;
                            instance.adjustedRightLensValue = null;
                        } else {
                            instance.leftLensValue =
                                lensCalculationCollection.left != null &&
                                lensCalculationCollection.left != undefined &&
                                lensCalculationCollection.left.edge != null &&
                                lensCalculationCollection.left.edge != undefined &&
                                lensCalculationCollection.left.edge.rdMin != null &&
                                lensCalculationCollection.left.edge.rdMin != undefined
                                    ? lensCalculationCollection.left.edge.rdMin
                                    : null;
                            instance.adjustedLeftLensValue = null;
                            instance.evilEyeEdgeLeftValue = null;

                            instance.rightLensValue =
                                lensCalculationCollection.right != null &&
                                lensCalculationCollection.right != undefined &&
                                lensCalculationCollection.right.edge != null &&
                                lensCalculationCollection.right.edge != undefined &&
                                lensCalculationCollection.right.edge.rdMin != null &&
                                lensCalculationCollection.right.edge.rdMin != undefined
                                    ? lensCalculationCollection.right.edge.rdMin
                                    : null;
                            instance.adjustedRightLensValue = null;
                            instance.evilEyeEdgeRightValue = null;
                        }
                    }
                }

                instance.evilEyeEdgeLeftImage =
                    isLeftLensApplicable == true &&
                    lensCalculationCollection.left != null &&
                    lensCalculationCollection.left != undefined &&
                    lensCalculationCollection.left.images[0] != null &&
                    lensCalculationCollection.left.images[0] != undefined &&
                    lensCalculationCollection.left.images[0] != ''
                        ? BASE64_IMAGE_ENCODING_FORMAT + ',' + lensCalculationCollection.left.images[0]
                        : null;
                instance.evilEyeEdgeRightImage =
                    isRightLensApplicable == true &&
                    lensCalculationCollection.right != null &&
                    lensCalculationCollection.right != undefined &&
                    lensCalculationCollection.right.images[0] != null &&
                    lensCalculationCollection.right.images[0] != undefined &&
                    lensCalculationCollection.right.images[0] != ''
                        ? BASE64_IMAGE_ENCODING_FORMAT + ',' + lensCalculationCollection.right.images[0]
                        : null;
            });

            if (isEvilEyeEdgePreSelected != null && isEvilEyeEdgePreSelected != undefined && isEvilEyeEdgePreSelected == false) {
                calculationCollectionSummary.evilEyeEdgeLeftImageSRC =
                    isLeftLensApplicable == true &&
                    lensCalculationCollection.left != null &&
                    lensCalculationCollection.left != undefined &&
                    lensCalculationCollection.left.images[0] != null &&
                    lensCalculationCollection.left.images[0] != undefined &&
                    lensCalculationCollection.left.images[0] != ''
                        ? BASE64_IMAGE_ENCODING_FORMAT + ',' + lensCalculationCollection.left.images[0]
                        : null;
                calculationCollectionSummary.evilEyeEdgeRightImageSRC =
                    isRightLensApplicable == true &&
                    lensCalculationCollection.right != null &&
                    lensCalculationCollection.right != undefined &&
                    lensCalculationCollection.right.images[0] != null &&
                    lensCalculationCollection.right.images[0] != undefined &&
                    lensCalculationCollection.right.images[0] != ''
                        ? BASE64_IMAGE_ENCODING_FORMAT + ',' + lensCalculationCollection.right.images[0]
                        : null;

                //BS-572
                calculationCollectionSummary.evilEyeEdgeLeftImageSRCToBeSaved =
                    isLeftLensApplicable == true &&
                    lensCalculationCollection.left != null &&
                    lensCalculationCollection.left != undefined &&
                    lensCalculationCollection.left.images[0] != null &&
                    lensCalculationCollection.left.images[0] != undefined &&
                    lensCalculationCollection.left.images[0] != ''
                        ? lensCalculationCollection.left.images[0]
                        : null;

                ///BS-572
                calculationCollectionSummary.evilEyeEdgeRightImageSRCToBeSaved =
                    isRightLensApplicable == true &&
                    lensCalculationCollection.right != null &&
                    lensCalculationCollection.right != undefined &&
                    lensCalculationCollection.right.images[0] != null &&
                    lensCalculationCollection.right.images[0] != undefined &&
                    lensCalculationCollection.right.images[0] != ''
                        ? lensCalculationCollection.right.images[0]
                        : null;
            } else {
                calculationCollectionSummary.leftImageSRC =
                    isLeftLensApplicable == true &&
                    lensCalculationCollection.left != null &&
                    lensCalculationCollection.left != undefined &&
                    lensCalculationCollection.left.images[0] != null &&
                    lensCalculationCollection.left.images[0] != undefined &&
                    lensCalculationCollection.left.images[0] != ''
                        ? BASE64_IMAGE_ENCODING_FORMAT + ',' + lensCalculationCollection.left.images[0]
                        : null;
                calculationCollectionSummary.rightImageSRC =
                    isRightLensApplicable == true &&
                    lensCalculationCollection.right != null &&
                    lensCalculationCollection.right != undefined &&
                    lensCalculationCollection.right.images[0] != null &&
                    lensCalculationCollection.right.images[0] != undefined &&
                    lensCalculationCollection.right.images[0] != ''
                        ? BASE64_IMAGE_ENCODING_FORMAT + ',' + lensCalculationCollection.right.images[0]
                        : null;

                //BS-727
                calculationCollectionSummary.leftImageSRCToBeSaved =
                    isLeftLensApplicable == true &&
                    lensCalculationCollection.left != null &&
                    lensCalculationCollection.left != undefined &&
                    lensCalculationCollection.left.images[0] != null &&
                    lensCalculationCollection.left.images[0] != undefined &&
                    lensCalculationCollection.left.images[0] != ''
                        ? lensCalculationCollection.left.images[0]
                        : null;

                //BS-727
                calculationCollectionSummary.rightImageSRCToBeSaved =
                    isRightLensApplicable == true &&
                    lensCalculationCollection.right != null &&
                    lensCalculationCollection.right != undefined &&
                    lensCalculationCollection.right.images[0] != null &&
                    lensCalculationCollection.right.images[0] != undefined &&
                    lensCalculationCollection.right.images[0] != ''
                        ? lensCalculationCollection.right.images[0]
                        : null;
            }
        } else {
            calculateLensFieldsCollection.forEach((instance) => {
                if (instance.isWeightType == true) {
                    if (
                        thicknessMatchingCalculatorLeftValue == null ||
                        thicknessMatchingCalculatorLeftValue == undefined ||
                        thicknessMatchingCalculatorLeftValue == ''
                    ) {
                        instance.leftLensValue =
                            lensCalculationCollection.left != null &&
                            lensCalculationCollection.left != undefined &&
                            lensCalculationCollection.left.weight != null &&
                            lensCalculationCollection.left.weight != undefined
                                ? lensCalculationCollection.left.weight
                                : null;
                        instance.adjustedLeftLensValue = null;
                    } else if (
                        thicknessMatchingCalculatorLeftValue != null ||
                        thicknessMatchingCalculatorLeftValue != undefined ||
                        thicknessMatchingCalculatorLeftValue != ''
                    ) {
                        instance.adjustedLeftLensValue =
                            lensCalculationCollection.left != null &&
                            lensCalculationCollection.left != undefined &&
                            lensCalculationCollection.left.weight != null &&
                            lensCalculationCollection.left.weight != undefined
                                ? lensCalculationCollection.left.weight
                                : null;
                    }
                    if (
                        thicknessMatchingCalculatorRightValue == null ||
                        thicknessMatchingCalculatorRightValue == undefined ||
                        thicknessMatchingCalculatorRightValue == ''
                    ) {
                        instance.rightLensValue =
                            lensCalculationCollection.right != null &&
                            lensCalculationCollection.right != undefined &&
                            lensCalculationCollection.right.weight != null &&
                            lensCalculationCollection.right.weight != undefined
                                ? lensCalculationCollection.right.weight
                                : null;
                        instance.adjustedRightLensValue = null;
                    } else if (
                        thicknessMatchingCalculatorRightValue != null ||
                        thicknessMatchingCalculatorRightValue != undefined ||
                        thicknessMatchingCalculatorRightValue != ''
                    ) {
                        instance.adjustedRightLensValue =
                            lensCalculationCollection.right != null &&
                            lensCalculationCollection.right != undefined &&
                            lensCalculationCollection.right.weight != null &&
                            lensCalculationCollection.right.weight != undefined
                                ? lensCalculationCollection.right.weight
                                : null;
                    }
                }

                if (instance.isAxisMinimumType == true) {
                    if (
                        thicknessMatchingCalculatorLeftValue == null ||
                        thicknessMatchingCalculatorLeftValue == undefined ||
                        thicknessMatchingCalculatorLeftValue == ''
                    ) {
                        instance.leftLensValue =
                            lensCalculationCollection.left != null &&
                            lensCalculationCollection.left != undefined &&
                            lensCalculationCollection.left.edge != null &&
                            lensCalculationCollection.left.edge != undefined &&
                            lensCalculationCollection.left.edge.axisMin != null &&
                            lensCalculationCollection.left.edge.axisMin != undefined
                                ? lensCalculationCollection.left.edge.axisMin
                                : null;
                        instance.adjustedLeftLensValue = null;
                    } else if (
                        thicknessMatchingCalculatorLeftValue != null ||
                        thicknessMatchingCalculatorLeftValue != undefined ||
                        thicknessMatchingCalculatorLeftValue != ''
                    ) {
                        instance.adjustedLeftLensValue =
                            lensCalculationCollection.left != null &&
                            lensCalculationCollection.left != undefined &&
                            lensCalculationCollection.left.edge != null &&
                            lensCalculationCollection.left.edge != undefined &&
                            lensCalculationCollection.left.edge.axisMin != null &&
                            lensCalculationCollection.left.edge.axisMin != undefined
                                ? lensCalculationCollection.left.edge.axisMin
                                : null;
                    }
                    if (
                        thicknessMatchingCalculatorRightValue == null ||
                        thicknessMatchingCalculatorRightValue == undefined ||
                        thicknessMatchingCalculatorRightValue == ''
                    ) {
                        instance.rightLensValue =
                            lensCalculationCollection.right != null &&
                            lensCalculationCollection.right != undefined &&
                            lensCalculationCollection.right.edge != null &&
                            lensCalculationCollection.right.edge != undefined &&
                            lensCalculationCollection.right.edge.axisMin != null &&
                            lensCalculationCollection.right.edge.axisMin != undefined
                                ? lensCalculationCollection.right.edge.axisMin
                                : null;
                        instance.adjustedRightLensValue = null;
                    } else if (
                        thicknessMatchingCalculatorRightValue != null ||
                        thicknessMatchingCalculatorRightValue != undefined ||
                        thicknessMatchingCalculatorRightValue != ''
                    ) {
                        instance.adjustedRightLensValue =
                            lensCalculationCollection.right != null &&
                            lensCalculationCollection.right != undefined &&
                            lensCalculationCollection.right.edge != null &&
                            lensCalculationCollection.right.edge != undefined &&
                            lensCalculationCollection.right.edge.axisMin != null &&
                            lensCalculationCollection.right.edge.axisMin != undefined
                                ? lensCalculationCollection.right.edge.axisMin
                                : null;
                    }
                }

                if (instance.isAxisMaximumType == true) {
                    if (
                        thicknessMatchingCalculatorLeftValue == null ||
                        thicknessMatchingCalculatorLeftValue == undefined ||
                        thicknessMatchingCalculatorLeftValue == ''
                    ) {
                        instance.leftLensValue =
                            lensCalculationCollection.left != null &&
                            lensCalculationCollection.left != undefined &&
                            lensCalculationCollection.left.edge != null &&
                            lensCalculationCollection.left.edge != undefined &&
                            lensCalculationCollection.left.edge.axisMax != null &&
                            lensCalculationCollection.left.edge.axisMax != undefined
                                ? lensCalculationCollection.left.edge.axisMax
                                : null;
                        instance.adjustedLeftLensValue = null;
                    } else if (
                        thicknessMatchingCalculatorLeftValue != null ||
                        thicknessMatchingCalculatorLeftValue != undefined ||
                        thicknessMatchingCalculatorLeftValue != ''
                    ) {
                        instance.adjustedLeftLensValue =
                            lensCalculationCollection.left != null &&
                            lensCalculationCollection.left != undefined &&
                            lensCalculationCollection.left.edge != null &&
                            lensCalculationCollection.left.edge != undefined &&
                            lensCalculationCollection.left.edge.axisMax != null &&
                            lensCalculationCollection.left.edge.axisMax != undefined
                                ? lensCalculationCollection.left.edge.axisMax
                                : null;
                    }
                    if (
                        thicknessMatchingCalculatorRightValue == null ||
                        thicknessMatchingCalculatorRightValue == undefined ||
                        thicknessMatchingCalculatorRightValue == ''
                    ) {
                        instance.rightLensValue =
                            lensCalculationCollection.right != null &&
                            lensCalculationCollection.right != undefined &&
                            lensCalculationCollection.right.edge != null &&
                            lensCalculationCollection.right.edge != undefined &&
                            lensCalculationCollection.right.edge.axisMax != null &&
                            lensCalculationCollection.right.edge.axisMax != undefined
                                ? lensCalculationCollection.right.edge.axisMax
                                : null;
                        instance.adjustedRightLensValue = null;
                    } else if (
                        thicknessMatchingCalculatorRightValue != null ||
                        thicknessMatchingCalculatorRightValue != undefined ||
                        thicknessMatchingCalculatorRightValue != ''
                    ) {
                        instance.adjustedRightLensValue =
                            lensCalculationCollection.right != null &&
                            lensCalculationCollection.right != undefined &&
                            lensCalculationCollection.right.edge != null &&
                            lensCalculationCollection.right.edge != undefined &&
                            lensCalculationCollection.right.edge.axisMax != null &&
                            lensCalculationCollection.right.edge.axisMax != undefined
                                ? lensCalculationCollection.right.edge.axisMax
                                : null;
                    }
                }

                if (instance.isLensThicknessAtCenterType == true) {
                    if (
                        thicknessMatchingCalculatorLeftValue == null ||
                        thicknessMatchingCalculatorLeftValue == undefined ||
                        thicknessMatchingCalculatorLeftValue == ''
                    ) {
                        instance.leftLensValue =
                            lensCalculationCollection.left != null &&
                            lensCalculationCollection.left != undefined &&
                            lensCalculationCollection.left.centerThickness != null &&
                            lensCalculationCollection.left.centerThickness != undefined
                                ? lensCalculationCollection.left.centerThickness
                                : null;
                        instance.adjustedLeftLensValue = null;
                    } else if (
                        thicknessMatchingCalculatorLeftValue != null ||
                        thicknessMatchingCalculatorLeftValue != undefined ||
                        thicknessMatchingCalculatorLeftValue != ''
                    ) {
                        instance.adjustedLeftLensValue =
                            lensCalculationCollection.left != null &&
                            lensCalculationCollection.left != undefined &&
                            lensCalculationCollection.left.centerThickness != null &&
                            lensCalculationCollection.left.centerThickness != undefined
                                ? lensCalculationCollection.left.centerThickness
                                : null;
                    }
                    if (
                        thicknessMatchingCalculatorRightValue == null ||
                        thicknessMatchingCalculatorRightValue == undefined ||
                        thicknessMatchingCalculatorRightValue == ''
                    ) {
                        instance.rightLensValue =
                            lensCalculationCollection.right != null &&
                            lensCalculationCollection.right != undefined &&
                            lensCalculationCollection.right.centerThickness != null &&
                            lensCalculationCollection.right.centerThickness != undefined
                                ? lensCalculationCollection.right.centerThickness
                                : null;
                        instance.adjustedRightLensValue = null;
                    } else if (
                        thicknessMatchingCalculatorRightValue != null ||
                        thicknessMatchingCalculatorRightValue != undefined ||
                        thicknessMatchingCalculatorRightValue != ''
                    ) {
                        instance.adjustedRightLensValue =
                            lensCalculationCollection.right != null &&
                            lensCalculationCollection.right != undefined &&
                            lensCalculationCollection.right.centerThickness != null &&
                            lensCalculationCollection.right.centerThickness != undefined
                                ? lensCalculationCollection.right.centerThickness
                                : null;
                    }
                }

                if (instance.isLensThicknessAtBorderMaximumType == true) {
                    if (
                        thicknessMatchingCalculatorLeftValue == null ||
                        thicknessMatchingCalculatorLeftValue == undefined ||
                        thicknessMatchingCalculatorLeftValue == ''
                    ) {
                        instance.leftLensValue =
                            lensCalculationCollection.left != null &&
                            lensCalculationCollection.left != undefined &&
                            lensCalculationCollection.left.edge != null &&
                            lensCalculationCollection.left.edge != undefined &&
                            lensCalculationCollection.left.edge.rdMax != null &&
                            lensCalculationCollection.left.edge.rdMax != undefined
                                ? lensCalculationCollection.left.edge.rdMax
                                : null;
                        instance.adjustedLeftLensValue = null;
                    } else if (
                        thicknessMatchingCalculatorLeftValue != null ||
                        thicknessMatchingCalculatorLeftValue != undefined ||
                        thicknessMatchingCalculatorLeftValue != ''
                    ) {
                        instance.adjustedLeftLensValue =
                            lensCalculationCollection.left != null &&
                            lensCalculationCollection.left != undefined &&
                            lensCalculationCollection.left.edge != null &&
                            lensCalculationCollection.left.edge != undefined &&
                            lensCalculationCollection.left.edge.rdMax != null &&
                            lensCalculationCollection.left.edge.rdMax != undefined
                                ? lensCalculationCollection.left.edge.rdMax
                                : null;
                    }
                    if (
                        thicknessMatchingCalculatorRightValue == null ||
                        thicknessMatchingCalculatorRightValue == undefined ||
                        thicknessMatchingCalculatorRightValue == ''
                    ) {
                        instance.rightLensValue =
                            lensCalculationCollection.right != null &&
                            lensCalculationCollection.right != undefined &&
                            lensCalculationCollection.right.edge != null &&
                            lensCalculationCollection.right.edge != undefined &&
                            lensCalculationCollection.right.edge.rdMax != null &&
                            lensCalculationCollection.right.edge.rdMax != undefined
                                ? lensCalculationCollection.right.edge.rdMax
                                : null;
                        instance.adjustedRightLensValue = null;
                    } else if (
                        thicknessMatchingCalculatorRightValue != null ||
                        thicknessMatchingCalculatorRightValue != undefined ||
                        thicknessMatchingCalculatorRightValue != ''
                    ) {
                        instance.adjustedRightLensValue =
                            lensCalculationCollection.right != null &&
                            lensCalculationCollection.right != undefined &&
                            lensCalculationCollection.right.edge != null &&
                            lensCalculationCollection.right.edge != undefined &&
                            lensCalculationCollection.right.edge.rdMax != null &&
                            lensCalculationCollection.right.edge.rdMax != undefined
                                ? lensCalculationCollection.right.edge.rdMax
                                : null;
                    }
                }

                if (instance.isLensThicknessAtBorderMinimumType == true) {
                    if (
                        thicknessMatchingCalculatorLeftValue == null ||
                        thicknessMatchingCalculatorLeftValue == undefined ||
                        thicknessMatchingCalculatorLeftValue == ''
                    ) {
                        instance.leftLensValue =
                            lensCalculationCollection.left != null &&
                            lensCalculationCollection.left != undefined &&
                            lensCalculationCollection.left.edge != null &&
                            lensCalculationCollection.left.edge != undefined &&
                            lensCalculationCollection.left.edge.rdMin != null &&
                            lensCalculationCollection.left.edge.rdMin != undefined
                                ? lensCalculationCollection.left.edge.rdMin
                                : null;
                        instance.adjustedLeftLensValue = null;
                    } else if (
                        thicknessMatchingCalculatorLeftValue != null ||
                        thicknessMatchingCalculatorLeftValue != undefined ||
                        thicknessMatchingCalculatorLeftValue != ''
                    ) {
                        instance.adjustedLeftLensValue =
                            lensCalculationCollection.left != null &&
                            lensCalculationCollection.left != undefined &&
                            lensCalculationCollection.left.edge != null &&
                            lensCalculationCollection.left.edge != undefined &&
                            lensCalculationCollection.left.edge.rdMin != null &&
                            lensCalculationCollection.left.edge.rdMin != undefined
                                ? lensCalculationCollection.left.edge.rdMin
                                : null;
                    }
                    if (
                        thicknessMatchingCalculatorRightValue == null ||
                        thicknessMatchingCalculatorRightValue == undefined ||
                        thicknessMatchingCalculatorRightValue == ''
                    ) {
                        instance.rightLensValue =
                            lensCalculationCollection.right != null &&
                            lensCalculationCollection.right != undefined &&
                            lensCalculationCollection.right.edge != null &&
                            lensCalculationCollection.right.edge != undefined &&
                            lensCalculationCollection.right.edge.rdMin != null &&
                            lensCalculationCollection.right.edge.rdMin != undefined
                                ? lensCalculationCollection.right.edge.rdMin
                                : null;
                        instance.adjustedRightLensValue = null;
                    } else if (
                        thicknessMatchingCalculatorRightValue != null ||
                        thicknessMatchingCalculatorRightValue != undefined ||
                        thicknessMatchingCalculatorRightValue != ''
                    ) {
                        instance.adjustedRightLensValue =
                            lensCalculationCollection.right != null &&
                            lensCalculationCollection.right != undefined &&
                            lensCalculationCollection.right.edge != null &&
                            lensCalculationCollection.right.edge != undefined &&
                            lensCalculationCollection.right.edge.rdMin != null &&
                            lensCalculationCollection.right.edge.rdMin != undefined
                                ? lensCalculationCollection.right.edge.rdMin
                                : null;
                    }
                }

                instance.leftImageSRC =
                    isLeftLensApplicable == true &&
                    lensCalculationCollection.left != null &&
                    lensCalculationCollection.left != undefined &&
                    lensCalculationCollection.left.images[0] != null &&
                    lensCalculationCollection.left.images[0] != undefined &&
                    lensCalculationCollection.left.images[0] != ''
                        ? BASE64_IMAGE_ENCODING_FORMAT + ',' + lensCalculationCollection.left.images[0]
                        : null;
                instance.rightImageSRC =
                    isRightLensApplicable == true &&
                    lensCalculationCollection.right != null &&
                    lensCalculationCollection.right != undefined &&
                    lensCalculationCollection.right.images[0] != null &&
                    lensCalculationCollection.right.images[0] != undefined &&
                    lensCalculationCollection.right.images[0] != ''
                        ? BASE64_IMAGE_ENCODING_FORMAT + ',' + lensCalculationCollection.right.images[0]
                        : null;
            });

            calculationCollectionSummary.leftImageSRC =
                isLeftLensApplicable == true &&
                lensCalculationCollection.left != null &&
                lensCalculationCollection.left != undefined &&
                lensCalculationCollection.left.images[0] != null &&
                lensCalculationCollection.left.images[0] != undefined &&
                lensCalculationCollection.left.images[0] != ''
                    ? BASE64_IMAGE_ENCODING_FORMAT + ',' + lensCalculationCollection.left.images[0]
                    : null;
            calculationCollectionSummary.rightImageSRC =
                isRightLensApplicable == true &&
                lensCalculationCollection.right != null &&
                lensCalculationCollection.right != undefined &&
                lensCalculationCollection.right.images[0] != null &&
                lensCalculationCollection.right.images[0] != undefined &&
                lensCalculationCollection.right.images[0] != ''
                    ? BASE64_IMAGE_ENCODING_FORMAT + ',' + lensCalculationCollection.right.images[0]
                    : null;

            //BS-727
            calculationCollectionSummary.leftImageSRCToBeSaved =
                isLeftLensApplicable == true &&
                lensCalculationCollection.left != null &&
                lensCalculationCollection.left != undefined &&
                lensCalculationCollection.left.images[0] != null &&
                lensCalculationCollection.left.images[0] != undefined &&
                lensCalculationCollection.left.images[0] != ''
                    ? lensCalculationCollection.left.images[0]
                    : null;

            //BS-727
            calculationCollectionSummary.rightImageSRCToBeSaved =
                isRightLensApplicable == true &&
                lensCalculationCollection.right != null &&
                lensCalculationCollection.right != undefined &&
                lensCalculationCollection.right.images[0] != null &&
                lensCalculationCollection.right.images[0] != undefined &&
                lensCalculationCollection.right.images[0] != ''
                    ? lensCalculationCollection.right.images[0]
                    : null;
        }
    }

    calculationCollectionSummary.preCalcGuid =
        lensCalculationCollection != undefined &&
        lensCalculationCollection != null &&
        lensCalculationCollection.silhData != undefined &&
        lensCalculationCollection.silhData != null &&
        lensCalculationCollection.silhData.preCalcGuid != undefined &&
        lensCalculationCollection.silhData.preCalcGuid != null
            ? lensCalculationCollection.silhData.preCalcGuid
            : null;
    calculationCollectionSummary.calculateLensFieldsCollectionSummary = calculateLensFieldsCollection; //BS-1439

    return calculationCollectionSummary;
};

export { setupLensCalculationsIntoCollection };
