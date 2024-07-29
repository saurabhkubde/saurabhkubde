/**
 * A internal module with various cart related Utils
 */
import LANG from '@salesforce/i18n/lang'; //BS-205
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LOGO_SILHOUETTE from '@salesforce/contentAssetUrl/SilhouetteLogoGroup2022blackv2png';
import LOGO_NEUBAU from '@salesforce/contentAssetUrl/neubau_logo_crop1';

const ORIGINAL_PRICE_CROSSED_OUT_LABEL = 'Original price (crossed out):'; //BS-205
const CLOSED_CART_MESSAGE_REGEXP = new RegExp(/Cart Id: '\S+' is Deleted/, 'i'); //BS-205

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

const decodeHtml = (html) => {
    var txt = document.createElement('textarea');
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    txt.innerHTML = html;
    return txt.value;
};

const showToastMessage = (parent, message, variant, mode, messageData) => {
    parent.dispatchEvent(
        new ShowToastEvent({
            message: message,
            variant: variant,
            mode: mode,
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

/**
 * Determines whether the original (list) price should be displayed given available pricing information
 * BS-205
 * @param {Boolean} showNegotiatedPrice Whether negotiated price should be displayed
 * @param {Boolean} showOriginalPrice Whether original (list) price should be displayed
 * @param {string} negotiatedPrice The negotiated price of an item
 * @param {string} originalPrice The original (list) price of an item
 * @returns {Boolean} true if the original (list) price should be displayed, otherwise false
 */
export function displayOriginalPrice(showNegotiatedPrice, showOriginalPrice, negotiatedPrice, originalPrice) {
    const showBothNegotiatedPriceAndOriginalPrice = showOriginalPrice && showNegotiatedPrice;
    const originalPriceExists = originalPrice !== null && originalPrice !== undefined && Number(originalPrice) >= 0;
    const negotiatedPriceExists = negotiatedPrice !== null && negotiatedPrice !== undefined && negotiatedPrice >= 0;
    const originalPriceIsAvailableAndGreaterThanNegotiatedPrice =
        originalPriceExists && negotiatedPriceExists && Number(originalPrice) > Number(negotiatedPrice);

    // Display the original price if both the original and negotiated prices are available and need to be shown, and the original price is greater than the negotiated price (W-6847766)
    return showBothNegotiatedPriceAndOriginalPrice && originalPriceIsAvailableAndGreaterThanNegotiatedPrice;
}

/**
 * Constructs the label for the orginal (strike through) price of a product or for the cart summary.
 * Specifically, this label is intented to be used for screen readers.
 * Bs-205
 * @param {string} currencyCode an ISO 4217 representation of the currency code
 * @param {string} originalPrice the original price to add to the label
 * @returns {string} the label to assign to the original price of a product or cart summary.  Returns a
 *                   string in the form of: "Original price (crossed out): $240", or an empty string if
 *                   the currencyCode or originalPrice is invalid
 */
export function getLabelForOriginalPrice(currencyCode, originalPrice) {
    let result = '';
    if (!originalPrice) {
        return result;
    }

    try {
        const formattedCurrency = new Intl.NumberFormat(LANG, {
            style: 'currency',
            currency: currencyCode
        }).format(Number(originalPrice));
        result = `${ORIGINAL_PRICE_CROSSED_OUT_LABEL} ${formattedCurrency}`;
    } catch (execptionInstance) {
        console.error(execptionInstance);
    }
    return result;
}

/**
 * Parse error message string to check if cart is closed
 * This is not an ideal solution, but the error code (ILLEGAL_QUERY_PARAMETER_VALUE)
 * associated with a closed cart error is also used for other errors.
 * For now in order to know what the error is we have to look at the provided error message.
 * Currently the error message for a closed cart is of the form "Cart Id: '%s' is closed."
 * BS-205
 *
 * @param {String} errorMessage
 *  The error message string returned from cart service
 *
 * @returns {Boolean}
 *  True if the error message is for closed cart, false otherwise
 */
export function isCartClosed(errorMessage) {
    return CLOSED_CART_MESSAGE_REGEXP.test(errorMessage || '');
}

export { getEffectiveAccountId, getSiteLogo, decodeHtml, showToastMessage, redirectToPage, sortBy };
