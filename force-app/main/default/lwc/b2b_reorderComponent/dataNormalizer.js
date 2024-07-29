/**
 * Transform product search API response data into display-data.
 *
 * @param {ConnectApi.ProductOverviewCollection} data
 * @param {string} cardContentMapping
 */
export function transformData(data, cardContentMapping, fieldWrapper, productIdVsIsFrameMap) {
    /** Start : BS-1179 */
    let attributeFieldList = [];
    if (fieldWrapper !== undefined && fieldWrapper !== null) {
        attributeFieldList = JSON.parse(JSON.stringify(fieldWrapper));
    }
    /** End : BS-1179 */
    const { currencyIsoCode = '', total = 0, products = [] } = data || {};

    let currentUrl = window.location.href.split('/s/');
    let currentStore = currentUrl[0].split('/');
    let dummyImage = '/' + currentStore[currentStore.length - 1] + '/img/b2b/default-product-image.svg';
    return {
        /* Product list normalization */
        layoutData: products.map(({ id, defaultImage, fields, prices }) => {
            let isSparePartOnlyFrameFlag = false; //BS-1568
            defaultImage = fields['B2B_Picture_Link__c'] ? fields['B2B_Picture_Link__c'] : dummyImage;
            const { unitPrice: negotiatedPrice, listPrice: listingPrice } = prices || {};
            isSparePartOnlyFrameFlag = productIdVsIsFrameMap[id]; //BS-1568
            /**
             * Start BS-1179
             */
            let productAttributeList = [];
            for (let index = 0; index < attributeFieldList.length; index++) {
                productAttributeList.push({ ...attributeFieldList[index], fieldValue: fields[attributeFieldList[index].fieldApiName] });
            }
            /** End : BS-1179 */
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
                        model: fields['B2B_Model__c'],
                        sparepartType: fields['B2B_Sparepart_Type__c'], //Added as part of BS-530
                        rimLessVariant: fields['B2B_Rimless_Variant__c'],
                        productName: fields['Name'], //Added as part of BS-882
                        frameColorDescription: fields['B2B_Frame_Color_Description__c'], //Added as part of BS-882
                        collectionDesignFamily: fields['B2B_Design_Family__c'], //Added as part of BS-882
                        brand: fields['B2B_Brand__c'], //Added as part of BS-882
                        productType: fields['B2B_Product_Type__c'], //Added as part BS-882
                        productSize: fields['B2B_EE_Size__c'] //Added as part of BS-1507
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
                attributeDataList: productAttributeList,
                isSparePartOnlyFrame: isSparePartOnlyFrameFlag //BS-1568
            };
        })
    };
}

/**
 * Gets the normalized card content mapping fields.
 * @param {string} cardContentMapping comma separated fields
 * @returns {string[]}
 */
export function normalizedCardContentMapping(cardContentMapping) {
    return (cardContentMapping || 'Name').split(',');
}
