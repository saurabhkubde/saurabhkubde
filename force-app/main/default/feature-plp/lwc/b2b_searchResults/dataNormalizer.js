/**
 * Transform product search API response data into display-data.
 *
 * @param {ConnectApi.ProductSummaryPage} data
 * @param {string} cardContentMapping
 */
export function transformData(data, cardContentMapping) {
    const DEFAULT_PAGE_SIZE = 20;
    const { productsPage = {}, categories = {}, facets = [], locale = '' } = data || {};
    const { currencyIsoCode = '', total = 0, products = [], pageSize = DEFAULT_PAGE_SIZE } = productsPage;

    let currentUrl = window.location.href.split('/s/');
    let currentStore = currentUrl[0].split('/');
    let dummyImage = '/' + currentStore[currentStore.length - 1] + '/img/b2b/default-product-image.svg';

    return {
        locale,
        total,
        pageSize,
        categoriesData: categories,
        facetsData: facets.map(({ nameOrId, attributeType, facetType: type, displayType, displayName, displayRank, values }) => {
            return {
                // include a unique identifier to avoid the collision
                // between Product2 and variant custom fields
                id: `${nameOrId}:${attributeType}`,
                nameOrId,
                attributeType,
                type,
                displayType,
                displayName,
                displayRank,
                values: values.map((v) => ({ ...v, checked: false }))
            };
        }),
        /* Product list normalization */
        layoutData: products.map(({ id, name, defaultImage, fields, prices, variationAttributeSet }) => {
            defaultImage = fields['B2B_Picture_Link__c'] && fields['B2B_Picture_Link__c'].value ? fields['B2B_Picture_Link__c'].value : dummyImage;
            const { unitPrice: negotiatedPrice, listPrice: listingPrice } = prices || {};

            return {
                id,
                name,
                fields: normalizedCardContentMapping(cardContentMapping)
                    .map((mapFieldName) => ({
                        name: mapFieldName,
                        value: (fields[mapFieldName] && fields[mapFieldName].value) || '',
                        deliveryTimeJSON: fields['B2B_Shipping_Status_JSON__c'].value,
                        deliveryStatusJSON: fields['B2B_Availability_JSON__c'].value,
                        sku: fields['StockKeepingUnit'].value,
                        disableProduct: fields['B2B_Disable_Product__c'].value,
                        frameColor: fields['B2B_Frame_Color__c'].value,
                        frameColorName: fields['B2B_Frame_Color_Description__c'].value,
                        frameAccentColor: fields['B2B_Frame_Accent_Color__c'].value,
                        frameAccentName: fields['B2B_Frame_Accent_Color_Description__c'].value,
                        hexCode: fields['B2B_Hexcode__c'].value,
                        hexAccentCode: fields['B2B_Hexcode_Accent__c'].value,
                        model: fields['B2B_Model__c'].value,
                        sparepartType: fields['B2B_Sparepart_Type__c'].value //Added as part of BS-530
                    }))
                    .filter(({ value }) => !!value),
                image: {
                    url: defaultImage,
                    title: name,
                    alternateText: name
                },
                prices: {
                    listingPrice,
                    negotiatedPrice,
                    currencyIsoCode
                },
                variationAttributeSet: variationAttributeSet
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
