/**
 * Transform product search API response data into display-data.
 *
 * @param {ConnectApi.ProductOverviewCollection} data
 * @param {string} cardContentMapping
 */
export function transformData(data, cardContentMapping) {
    const DEFAULT_PAGE_SIZE = 20;
    const { currencyIsoCode = '', total = 0, products = [], pageSize = DEFAULT_PAGE_SIZE } = data || {};

    let currentUrl = window.location.href.split('/s/');
    let currentStore = currentUrl[0].split('/');
    let dummyImage = '/' + currentStore[currentStore.length - 1] + '/img/b2b/default-product-image.svg';

    return {
        /* Product list normalization */
        layoutData: products.map(({ id, defaultImage, fields, prices }) => {
            defaultImage = fields['B2B_Picture_Link__c'] ? fields['B2B_Picture_Link__c'] : dummyImage;
            const { unitPrice: negotiatedPrice, listPrice: listingPrice } = prices || {};

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
                        productSize: fields['B2B_EE_Size__c'], //Added as part of BS-1429
                        model: fields['B2B_Model__c'] //Added as part of BS-1429
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
                }
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
