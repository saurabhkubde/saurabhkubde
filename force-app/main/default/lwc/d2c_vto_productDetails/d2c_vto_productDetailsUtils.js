import getColorsMetadata from '@salesforce/apex/D2C_VTO_ProductDetailsController.getColorsMetadata';
import getProductImages from '@salesforce/apex/D2C_VTO_ProductDetailsController.getProductImages';

import D2C_VTO_SILHOUETTE_CATEGORY from '@salesforce/label/c.D2C_VTO_SILHOUETTE_CATEGORY';

const BACKGROUND_ATTRIBUTE = 'background: ';
const BACKGROUND_URL_ATTRIBUTE = 'background: url(';
const BACKGROUND_STYLE_CLOSING_TAG = ')';
const MM_UNIT = 'mm';

export const normalizeData = async (productData) => {
    let sunglassCategory = D2C_VTO_SILHOUETTE_CATEGORY.split(',')[0];
    let opticalEyeWearCategory = D2C_VTO_SILHOUETTE_CATEGORY.split(',')[1];

    let displayData = {};

    if (productData !== undefined && productData !== null && productData.data !== undefined && productData.data !== null) {
        /* Start : Block to identify category */
        let categoryPathMap = productData.data.primaryProductCategoryPath.path.map((category) => ({
            id: category.id,
            name: category.name
        }));

        let categoryList = [];

        if (categoryPathMap !== undefined && categoryPathMap !== null && categoryPathMap.length > 0) {
            categoryPathMap.forEach((element) => {
                categoryList.push(element.name);
            });
        }

        let isSunglassProduct = categoryList.includes(sunglassCategory);
        let isOpticalEyewearProduct = categoryList.includes(opticalEyeWearCategory);
        /* End : Block to identify category */

        let fields = productData.data.fields;
        let productImageList = [];
        let customMetadataColorsMap = new Map();

        let colorResult = await getColorsMetadata({});
        if (colorResult !== null && colorResult !== undefined) {
            let customMetadataColors = new Map(Object.entries(JSON.parse(colorResult)));
            for (let [key, value] of customMetadataColors.entries()) {
                customMetadataColorsMap.set(value.Label, value);
            }
        }

        /* Start : Block to identify product colors and hex codes */
        if (fields !== undefined && fields !== null) {
            let frameColorData = {};
            let lensColorData = {};

            if (fields.B2B_Frame_Color__c !== undefined && fields.B2B_Frame_Color__c !== null && customMetadataColorsMap.has(fields.B2B_Frame_Color__c)) {
                let frameColorMetadata = customMetadataColorsMap.get(fields.B2B_Frame_Color__c);
                if (frameColorMetadata.transparent == true) {
                    frameColorData = {
                        colorStyle: BACKGROUND_URL_ATTRIBUTE + this.transparentUri + BACKGROUND_STYLE_CLOSING_TAG,
                        description: fields['StockKeepingUnit'].substring(7, 11) + ' ' + fields['B2B_Frame_Color_Description__c']
                    };
                } else {
                    frameColorData = {
                        colorStyle: BACKGROUND_ATTRIBUTE + frameColorMetadata.B2B_Color_code__c,
                        description: fields['StockKeepingUnit'].substring(7, 11) + ' ' + fields['B2B_Frame_Color_Description__c']
                    };
                }
                displayData = { ...displayData, frameColorData };
            } else {
                frameColorData = false;
                displayData = { ...displayData, frameColorData };
            }

            if (fields.B2B_Lens_Color__c !== undefined && fields.B2B_Lens_Color__c !== null && customMetadataColorsMap.has(fields.B2B_Lens_Color__c)) {
                let lensColorMetadata = customMetadataColorsMap.get(fields.B2B_Lens_Color__c);
                if (lensColorMetadata.transparent == true) {
                    lensColorData = {
                        colorStyle: BACKGROUND_URL_ATTRIBUTE + this.transparentUri + BACKGROUND_STYLE_CLOSING_TAG,
                        description: fields['B2B_Lens_Color_Description__c']
                    };
                } else {
                    lensColorData = {
                        colorStyle: BACKGROUND_ATTRIBUTE + lensColorMetadata.B2B_Color_code__c,
                        description: fields['B2B_Lens_Color_Description__c']
                    };
                }
                displayData = { ...displayData, lensColorData };
            } else {
                lensColorData = false;
                displayData = { ...displayData, frameColorData };
            }
        }
        /* End : Block to identify product colors and hex codes */

        /* Start : Call to Server to get Product Images */
        await getProductImages({ productId: productData.data.id })
            .then((result) => {
                productImageList = JSON.parse(JSON.stringify(result));
                if (productImageList !== undefined && productImageList !== null && productImageList.length > 0) {
                    productImageList[productImageList.length - 1].lastImage = true;
                }
            })
            .catch((error) => {
                console.error(error);
            });
        /* End : Call to Server to get Product Images */

        let modalSizeData = '';
        if (fields['B2B_Shape_Size__c'] !== undefined && fields['B2B_Shape_Size__c'] !== null) {
            modalSizeData += fields['B2B_Shape_Size__c'];
        }
        if (fields['B2B_Bridge_Size__c'] !== undefined && fields['B2B_Bridge_Size__c'] !== null) {
            modalSizeData += ' / ' + fields['B2B_Bridge_Size__c'];
        }
        if (fields['B2B_Temple_Length__c'] !== undefined && fields['B2B_Temple_Length__c'] !== null) {
            modalSizeData += ' / ' + fields['B2B_Temple_Length__c'] + ' ' + MM_UNIT;
        }
        /* Start : Creating data JSON, used to show data on UI */
        displayData = {
            ...displayData,
            ...{
                id: productData.data.id,
                name: fields['Name'],
                sku: fields['StockKeepingUnit'],
                description: fields['Description'],
                frameAccentColor: fields['B2B_Frame_Accent_Color__c'],
                frameAccentName: fields['B2B_Frame_Accent_Color_Description__c'],
                frameColorDescription:
                    fields['StockKeepingUnit'] !== undefined &&
                    fields['StockKeepingUnit'] !== null &&
                    fields['B2B_Frame_Color_Description__c'] !== undefined &&
                    fields['B2B_Frame_Color_Description__c'] !== null
                        ? fields['StockKeepingUnit'].substring(7, 11) + ' ' + fields['B2B_Frame_Color_Description__c']
                        : false,
                lensDescription: fields['B2B_Lens_Color_Description__c'],
                collectionDesignFamily: fields['B2B_Design_Family__c'],
                shapeImageLink: fields['D2C_VTO_Lens_Shape_Icon__c'],
                features: fields['Product_Description__c'],
                lensTechnology:
                    fields['B2B_Lens_Technology__c'] !== undefined && fields['B2B_Lens_Technology__c'] !== null
                        ? fields['B2B_Lens_Technology__c'].split(';')
                        : false,
                model: fields['B2B_Model_Name__c'],
                shapeSize: fields['B2B_Shape_Size__c'],
                bridgeSize: fields['B2B_Bridge_Size__c'],
                templeLength: fields['B2B_Temple_Length__c'],
                variantShape: fields['B2B_Variant_Shape__c'],
                designFamily: fields['B2B_Design_Family__c'],
                material: fields['B2C_Material__c'] !== undefined && fields['B2C_Material__c'] !== null ? fields['B2C_Material__c'].split(';') : false,
                included: fields['D2C_Packaging__c'] !== undefined && fields['D2C_Packaging__c'] !== null ? fields['D2C_Packaging__c'].split(';') : false,
                images: productImageList,
                categoryPathMap: categoryPathMap,
                isSunglassProduct: isSunglassProduct,
                isOpticalEyewearProduct: isOpticalEyewearProduct,
                modalSizeData: modalSizeData
            }
        };
        /* End : Creating data JSON, used to show data on UI */
    }
    return displayData;
};
