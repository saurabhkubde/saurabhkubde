const HTTPS = 'https://';
const SILHOUETTE_APP_BASE_URL = 'silhouette/s';
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
                        brand: fields['B2B_Brand__c'], //Added as part BS-882
                        sparepartType: fields['B2B_Sparepart_Type__c'], //Added as part BS-882
                        productName: fields['Name'], //Added as part BS-882
                        model: fields['B2B_Model__c'], //Added as part BS-882
                        frameColorDescription: fields['B2B_Frame_Color_Description__c'], //Added as part BS-882
                        collectionDesignFamily: fields['B2B_Design_Family__c'], //Added as part BS-882
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
                    currencyIsoCode: fields['CurrencyIsoCode'],
                    pricebookEntry: prices['pricebookEntryId'] //Added as part of BS-880
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
//BS-2249
export function handleNavigationToClipOnsHandler(clipOnURL) {
    let urlToRedirect = clipOnURL;
    while (urlToRedirect.startsWith('/')) {
        urlToRedirect = urlToRedirect.slice(1);
    }
    if (clipOnURL.includes(HTTPS) == false) {
        let domainName = window.location.origin.split('//')[1];
        if (clipOnURL.includes(domainName) == false) {
            if (clipOnURL.includes(SILHOUETTE_APP_BASE_URL) == false) {
                urlToRedirect = HTTPS + domainName + '/' + SILHOUETTE_APP_BASE_URL + '/' + urlToRedirect;
            } else {
                urlToRedirect = HTTPS + domainName + '/' + urlToRedirect;
            }
        } else {
            urlToRedirect = HTTPS + urlToRedirect;
        }
    }
    Object.assign(document.createElement('a'), {
        target: '_blank',
        rel: 'noopener',
        href: urlToRedirect
    }).click();
}
