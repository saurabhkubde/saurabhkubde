/**
 * Transform product search API response data into display-data.
 *
 * @param {ConnectApi.ProductOverviewCollection} data
 * @param {string} cardContentMapping
 */

import B2B_COLLECTION_CATEGORY_NEUBAU from '@salesforce/label/c.B2B_NEW_COLLECTION_CATEGORY_NEUBAU'; //BS-1544
import B2B_COLLECTION_CATEGORY_SILHOUETTE from '@salesforce/label/c.B2B_NEW_COLLECTION_CATEGORY_SILHOUETTE'; //BS-1544
import B2B_COLLECTION_CATEGORY_EVIL_EYE from '@salesforce/label/c.B2B_NEW_COLLECTION_CATEGORY_EVIL_EYE'; //BS-1544
import NEW_COLLECTION_VALUE from '@salesforce/label/c.B2B_COLLECTION_STATUS_PICKLIST_NEW_VALUE'; //BS-1544
import NEUBAU_FRAME_CATEGORIES from '@salesforce/label/c.B2B_NEUBAU_FRAME_CATEGORY'; //BS-1568
import SILHOUETTE_SPARE_PART_ONLY_FRAME_CATEGORY from '@salesforce/label/c.B2B_SILHOUETTE_SPARE_PART_ONLY_FRAME_CATEGORY'; //BS-1568
import EVIL_EYE_SPARE_PART_ONLY_FRAME_CATEGORY from '@salesforce/label/c.B2B_EVIL_EYE_SPARE_PART_ONLY_FRAME_CATEGORY'; //BS-1568

const SH_BRAND = 'Silhouette'; //BS-1544
const EE_BRAND = 'evil eye'; //BS-1544
const NB_BRAND = 'NEUBAU'; //BS-1544
var categoriesList = []; //BS-1544

export function transformData(data, cardContentMapping, fieldWrapper, productSearchList, productCategoryVsParentCategoryIdMap) {
    /** Start : BS-1179 */
    let attributeFieldList = [];
    if (fieldWrapper !== undefined && fieldWrapper !== null) {
        attributeFieldList = JSON.parse(JSON.stringify(fieldWrapper));
    }
    /** End : BS-1179 */
    const DEFAULT_PAGE_SIZE = 20;
    const { currencyIsoCode = '', total = 0, products = [], pageSize = DEFAULT_PAGE_SIZE } = data || {};

    let currentUrl = window.location.href.split('/s/');
    let currentStore = currentUrl[0].split('/');
    let dummyImage = '/' + currentStore[currentStore.length - 1] + '/img/b2b/default-product-image.svg';

    /* Start BS-1544 */

    const brandCategoryObject = {
        [SH_BRAND]: B2B_COLLECTION_CATEGORY_SILHOUETTE.split(','),
        [EE_BRAND]: B2B_COLLECTION_CATEGORY_EVIL_EYE.split(','),
        [NB_BRAND]: B2B_COLLECTION_CATEGORY_NEUBAU.split(',')
    };
    /*Start : BS-1568*/
    const brandSparePartOnlyCategoryObject = {
        [SH_BRAND]: SILHOUETTE_SPARE_PART_ONLY_FRAME_CATEGORY.split(','),
        [EE_BRAND]: EVIL_EYE_SPARE_PART_ONLY_FRAME_CATEGORY.split(','),
        [NB_BRAND]: NEUBAU_FRAME_CATEGORIES.split(',')
    };
    /*End : BS-1568*/

    let brandWiseNewCollectionCategoryMap = new Map(Object.entries(brandCategoryObject));
    let brandWiseSparePartOnlyCategoryMap = new Map(Object.entries(brandSparePartOnlyCategoryObject)); //BS-1568
    let productCategoryVsParentCategoryIdMapCopy = new Map();
    if (productCategoryVsParentCategoryIdMap !== undefined && productCategoryVsParentCategoryIdMap !== null) {
        productCategoryVsParentCategoryIdMapCopy = new Map(Object.entries(productCategoryVsParentCategoryIdMap));
    }

    /* End BS-1544 */

    return {
        /* Product list normalization */
        layoutData: products.map(({ id, defaultImage, fields, prices }) => {
            defaultImage = fields['B2B_Picture_Link__c'] ? fields['B2B_Picture_Link__c'] : dummyImage;
            const { unitPrice: negotiatedPrice, listPrice: listingPrice } = prices || {};
            /** Start : BS-1179 */
            let productAttributeList = [];
            for (let index = 0; index < attributeFieldList.length; index++) {
                productAttributeList.push({ ...attributeFieldList[index], fieldValue: fields[attributeFieldList[index].fieldApiName] });
            }
            /** End : 1179 */

            /* Start BS-1544 */

            categoriesList = [];
            let newCollectionFlag = false;
            let isSparePartOnlyFrameFlag = false; //BS-1568
            if (
                productSearchList !== undefined &&
                productSearchList !== null &&
                productCategoryVsParentCategoryIdMapCopy !== undefined &&
                productCategoryVsParentCategoryIdMapCopy !== null
            ) {
                let productObj = productSearchList.find((productObject) => productObject.ProductId === id);
                if (productObj !== undefined && productObj !== null && productObj.ProductCategoryId !== undefined && productObj.ProductCategoryId !== null) {
                    let masterParentCategoryObj = getMasterParentId(productObj.ProductCategoryId, productCategoryVsParentCategoryIdMapCopy);
                    categoriesList.push(productCategoryVsParentCategoryIdMapCopy.get(productObj.ProductCategoryId).categoryName);
                    /** Check if Product's category is in the defined category and its collection status is new */
                    if (
                        categoriesList !== undefined &&
                        categoriesList !== null &&
                        categoriesList.length > 0 &&
                        fields['B2B_Collection_Flag__c'] === NEW_COLLECTION_VALUE
                    ) {
                        if (
                            fields['B2B_Brand__c'] !== undefined &&
                            fields['B2B_Brand__c'] !== null &&
                            brandWiseNewCollectionCategoryMap.has(fields['B2B_Brand__c'])
                        ) {
                            let brandWiseCategoryList = brandWiseNewCollectionCategoryMap.get(fields['B2B_Brand__c']);
                            for (var index = 0; index < brandWiseCategoryList.length; index++) {
                                if (categoriesList.includes(brandWiseCategoryList[index])) {
                                    newCollectionFlag = true;
                                    break;
                                }
                            }
                        }
                    }
                    /*Start : BS-1568*/
                    if (categoriesList !== undefined && categoriesList !== null && categoriesList.length > 0) {
                        if (
                            fields['B2B_Brand__c'] !== undefined &&
                            fields['B2B_Brand__c'] !== null &&
                            brandWiseSparePartOnlyCategoryMap.has(fields['B2B_Brand__c'])
                        ) {
                            let brandWiseCategoryList = brandWiseSparePartOnlyCategoryMap.get(fields['B2B_Brand__c']);
                            for (var index = 0; index < brandWiseCategoryList.length; index++) {
                                if (categoriesList.includes(brandWiseCategoryList[index])) {
                                    isSparePartOnlyFrameFlag = true;
                                    break;
                                }
                            }
                        }
                    }
                    /*End : BS-1568*/
                }
            }
            /* End BS-1544 */

            return {
                id,
                name: fields['Name'],
                fields: normalizedCardContentMapping(cardContentMapping)
                    .map((mapFieldName) => ({
                        name: mapFieldName,
                        value: fields[mapFieldName] || '',
                        deliveryTimeJSON: fields['B2B_Shipping_Status_JSON__c'],
                        deliveryStatusJSON: fields['B2B_Availability_JSON__c'],
                        sku: fields['StockKeepingUnit'],
                        disableProduct: fields['B2B_Disable_Product__c'],
                        frameColor: fields['B2B_Frame_Color__c'],
                        frameColorName: fields['B2B_Frame_Color_Description__c'],
                        frameAccentColor: fields['B2B_Frame_Accent_Color__c'],
                        frameAccentName: fields['B2B_Frame_Accent_Color_Description__c'],
                        hexCode: fields['B2B_Hexcode__c'],
                        hexAccentCode: fields['B2B_Hexcode_Accent__c'],
                        sparepartType: fields['B2B_Sparepart_Type__c'], //Added as part of BS-530
                        model: fields['B2B_Model__c'],
                        productSize: fields['B2B_EE_Size__c'], //Added as part of BS-675
                        deliveryStatus: '', //Added as part of BS-644
                        productName: fields['Name'], //BS-740
                        frameColorDescription: fields['B2B_Frame_Color_Description__c'], //BS-740
                        collectionDesignFamily: fields['B2B_Design_Family__c'], //BS-740
                        brand: fields['B2B_Brand__c'], //BS-740
                        productType: fields['B2B_Product_Type__c'], // Added as part of BS-882
                        collectionStatus: fields['B2B_Collection_Flag__c'] //Added as part of BS-1544
                    }))
                    .filter(({ value }) => !!value),
                image: {
                    url: defaultImage,
                    title: defaultImage.title || '',
                    alternateText: defaultImage.alternateText || ''
                },
                prices: {
                    listingPrice,
                    negotiatedPrice,
                    currencyIsoCode: fields['CurrencyIsoCode']
                },
                attributeDataList: productAttributeList, //Added as part of BS-1179
                isNewCollection: newCollectionFlag, //Added as part of BS-1544
                isSparePartOnlyFrame: isSparePartOnlyFrameFlag //BS-1568
            };
        })
    };
}

/**
 * @description : This method find the current product's parent most category.
 * @param {*} categoryId : The current products's categoryId
 * @param {*} productCategoryVsParentCategoryIdMap : Map having details of all the categories.
 * @returns Object having details of top most parent category.s
 */
const getMasterParentId = (categoryId, productCategoryVsParentCategoryIdMap) => {
    let masterParentCategory = {};
    if (productCategoryVsParentCategoryIdMap.has(categoryId)) {
        categoriesList.push(productCategoryVsParentCategoryIdMap.get(categoryId).categoryName);
        if (
            productCategoryVsParentCategoryIdMap.get(categoryId).parentCategoryId !== undefined &&
            productCategoryVsParentCategoryIdMap.get(categoryId).parentCategoryId !== null
        ) {
            masterParentCategory = getMasterParentId(
                productCategoryVsParentCategoryIdMap.get(categoryId).parentCategoryId,
                productCategoryVsParentCategoryIdMap
            );
        } else if (
            productCategoryVsParentCategoryIdMap.get(categoryId).parentCategoryId === undefined &&
            productCategoryVsParentCategoryIdMap.get(categoryId).categoryName !== undefined &&
            productCategoryVsParentCategoryIdMap.get(categoryId).categoryName !== null
        ) {
            masterParentCategory = productCategoryVsParentCategoryIdMap.get(categoryId);
        }
    }
    return masterParentCategory;
};

/**
 * Gets the normalized card content mapping fields.
 * @param {string} cardContentMapping comma separated fields
 * @returns {string[]}
 */
export function normalizedCardContentMapping(cardContentMapping) {
    return (cardContentMapping || 'Name').split(',');
}
