import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LOGO_SILHOUETTE from '@salesforce/contentAssetUrl/SilhouetteLogoGroup2022blackv2png';
import LOGO_NEUBAU from '@salesforce/contentAssetUrl/neubau_logo_crop1';
import B2B_Availability_Status_Labels from '@salesforce/label/c.B2B_Availability_Status_Labels'; //Added for BS-644
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //Added for BS-644

const ITEM_AVAILABLE_LABEL = B2B_Availability_Status_Labels.split(',')[0]; //Added for BS-644
const ITEM_UNAVAILABLE_LABEL = B2B_Availability_Status_Labels.split(',')[1]; //Added for BS-644
const ITEM_AVAILABLE_AS_OF_LABEL = B2B_Availability_Status_Labels.split(',')[2]; //Added for BS-644
const ONLY_SPARE_PART_AVAILABLE_LABEL = B2B_Availability_Status_Labels.split(',')[3]; //Added for BS-1568
const SINGLE_DAY_DELIVERY_AVAILABLE_LABEL = B2B_Availability_Status_Labels.split(',')[4]; //BS-2354
const TYPE_STRING = 'string'; //BS-644
const PAGINATOR = 'paginator';

/**
 * Gets the normalized effective account of the user.
 *
 * @type {string}
 */
const getEffectiveAccountId = (effAccId) => {
    let effectiveAccountId = effAccId || '';
    let resolved = null;

    if (effectiveAccountId.length > 0 && effectiveAccountId !== '000000000000000') {
        resolved = effectiveAccountId;
    }
    return resolved;
};

/**
 * Checking availability of product and returning boolean varaible true/false
 *
 * @param {String} availabilityJson Product availability Json field
 * @param {String} currentUserCountryCode current user country code
 * @returns {Boolean} true/false according to country code present in availability JSON or not
 */
const checkProductAvailability = (availabilityJson, currentUserCountryCode) => {
    return availabilityJson != null && currentUserCountryCode != null
        ? JSON.parse(availabilityJson.replace(/&quot;/g, '"'))[currentUserCountryCode] != undefined
            ? JSON.parse(availabilityJson.replace(/&quot;/g, '"'))[currentUserCountryCode] <= 0
            : true
        : true;
};

const decodeHtml = (html) => {
    var txt = document.createElement('textarea');
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    txt.innerHTML = html;
    return txt.value;
};

const showToastMessage = (parent, message, variant, messageData) => {
    parent.dispatchEvent(
        new ShowToastEvent({
            message: message,
            variant: variant,
            mode: 'dismissable',
            messageData: messageData
        })
    );
};

const redirectToPage = (pageName) => {
    let currentUrl = window.location.href.split('/s/');
    let returnedUrl = currentUrl[0] + '/s/' + pageName;
    return returnedUrl;
};

const getSiteLogo = () => {
    let currentUrl = window.location.href.split('/s/');
    let splittedUrl = currentUrl[0].split('/');
    let imageLogo;
    if (splittedUrl[splittedUrl.length - 1] === 'neubau') {
        imageLogo = LOGO_NEUBAU;
    } else if (splittedUrl[splittedUrl.length - 1] === 'silhouette') {
        imageLogo = LOGO_SILHOUETTE;
    }
    return imageLogo;
};

const sortBy = (field, reverse, primer) => {
    const key = primer
        ? function (x) {
              return primer(x[field]);
          }
        : function (x) {
              return x[field];
          };

    return function (a, b) {
        a = key(a);
        b = key(b);
        return reverse * ((a > b) - (b > a));
    };
};

//BS-644
const getDeliveryTime = (deliveryTime, availableShippingPicklistValues, countryCode) => {
    let returnLabel = '';
    let isAvailableAsOf;
    let applicableDeliveryStatusCode;

    if (
        deliveryTime != null &&
        deliveryTime != undefined &&
        availableShippingPicklistValues != null &&
        availableShippingPicklistValues != undefined &&
        countryCode != null &&
        countryCode != undefined
    ) {
        if (typeof deliveryTime != TYPE_STRING) {
            deliveryTime = JSON.stringify(deliveryTime);
        }
        if (JSON.stringify(availableShippingPicklistValues) !== '{}' && countryCode && deliveryTime) {
            let formattedDeliveryTimeJSON = deliveryTime.replace(/&quot;/g, '"');
            if (formattedDeliveryTimeJSON != null && formattedDeliveryTimeJSON != undefined && formattedDeliveryTimeJSON.includes('/')) {
                isAvailableAsOf = true;
            } else {
                isAvailableAsOf = false;
            }
            let parsedDeliveryTimeJSON;
            if (isAvailableAsOf != null && isAvailableAsOf != undefined && isAvailableAsOf == true) {
                formattedDeliveryTimeJSON = formattedDeliveryTimeJSON.replace(/{/g, '');
                formattedDeliveryTimeJSON = formattedDeliveryTimeJSON.replace(/}/g, '');
                formattedDeliveryTimeJSON = '{' + formattedDeliveryTimeJSON + '}';
                parsedDeliveryTimeJSON = formattedDeliveryTimeJSON;
            } else {
                parsedDeliveryTimeJSON = formattedDeliveryTimeJSON;
            }
            const deliveryTimeJSONCollection = parsedDeliveryTimeJSON.split(',');
            let countryWiseDeliveryTimeMap = new Map();
            deliveryTimeJSONCollection.forEach((deliveryItem) => {
                let formattedDeliveryItem = deliveryItem.replace(/{/g, '');
                formattedDeliveryItem = formattedDeliveryItem.replace(/['"]+/g, '');
                formattedDeliveryItem = formattedDeliveryItem.replace(/}/g, '');
                formattedDeliveryItem = formattedDeliveryItem.replace(/\s/g, '');
                const parsedDeliveryTimeCollection = formattedDeliveryItem.split(':');
                countryWiseDeliveryTimeMap.set(parsedDeliveryTimeCollection[0], parsedDeliveryTimeCollection[1]);
            });
            let applicableCountryCode;
            if (countryCode != null && countryCode != undefined) {
                applicableCountryCode = countryCode.substring(0, 4);
            }
            if (countryWiseDeliveryTimeMap != null && countryWiseDeliveryTimeMap != undefined && countryWiseDeliveryTimeMap.has(applicableCountryCode)) {
                applicableDeliveryStatusCode = countryWiseDeliveryTimeMap.get(applicableCountryCode);
            }
            if (applicableDeliveryStatusCode != null && applicableDeliveryStatusCode != undefined && applicableDeliveryStatusCode.includes('/')) {
                isAvailableAsOf = true;
            } else {
                isAvailableAsOf = false;
            }
            availableShippingPicklistValues.data.values.forEach((element) => {
                if (isAvailableAsOf != null && isAvailableAsOf != undefined && isAvailableAsOf == false) {
                    if (element.value == applicableDeliveryStatusCode) {
                        returnLabel = element.label;
                    }
                } else if (isAvailableAsOf != null && isAvailableAsOf != undefined && isAvailableAsOf == true) {
                    if (element.value == '2') {
                        returnLabel = element.label;
                        returnLabel += ' ' + applicableDeliveryStatusCode;
                    }
                }
            });
        }
    }
    return returnLabel;
};

//BS-644
const getApplicableAvailabilityStatusIcon = (deliveryStatus) => {
    let applicableAvailabilityStatusIcon;
    if (deliveryStatus != null && deliveryStatus != undefined) {
        if (deliveryStatus == ITEM_AVAILABLE_LABEL || deliveryStatus == SINGLE_DAY_DELIVERY_AVAILABLE_LABEL) {
            applicableAvailabilityStatusIcon = STORE_STYLING + '/icons/ReadyToShip.svg';
        } else if (deliveryStatus == ITEM_UNAVAILABLE_LABEL) {
            applicableAvailabilityStatusIcon = STORE_STYLING + '/icons/Unavailable.svg';
        } else if (deliveryStatus.includes(ITEM_AVAILABLE_AS_OF_LABEL)) {
            applicableAvailabilityStatusIcon = STORE_STYLING + '/icons/available-within.svg';
        } else if (deliveryStatus == ONLY_SPARE_PART_AVAILABLE_LABEL) {
            applicableAvailabilityStatusIcon = STORE_STYLING + '/icons/OnlySpareParts.svg'; //Added for BS-1568
        }
    }
    return applicableAvailabilityStatusIcon;
};

const pageManager = {
    getPreviouslyVisitedPageIfFromPDPOrFirst: function (forCategoryName) {
        let localItem = localStorage.getItem(PAGINATOR) && JSON.parse(localStorage.getItem(PAGINATOR));
        if (localItem && localItem.category === forCategoryName && localItem.isFromPdp) {
            return Number(localItem.pageNumber);
        }
        if (localItem) {
            localStorage.setItem(PAGINATOR, JSON.stringify({ ...localItem, isFromPdp: false }));
        }
        return 1;
    },

    setCategoryPageNumber: function (forCategoryName, toPageNumber) {
        localStorage.setItem(PAGINATOR, JSON.stringify({ category: forCategoryName, pageNumber: toPageNumber, isFromPdp: false }));
    },

    setFromPdp: function () {
        let localItem = localStorage.getItem(PAGINATOR) && JSON.parse(localStorage.getItem(PAGINATOR));
        if (localItem) {
            localStorage.setItem(PAGINATOR, JSON.stringify({ ...localItem, isFromPdp: true }));
        }
    },

    clear: function () {
        localStorage.removeItem(PAGINATOR);
    }
};

export {
    getApplicableAvailabilityStatusIcon,
    getDeliveryTime,
    getEffectiveAccountId,
    checkProductAvailability,
    getSiteLogo,
    decodeHtml,
    showToastMessage,
    redirectToPage,
    sortBy,
    pageManager
};
