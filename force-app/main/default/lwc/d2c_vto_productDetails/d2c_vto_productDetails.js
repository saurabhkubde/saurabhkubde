import { LightningElement, wire, api } from 'lwc';
import { ProductAdapter } from 'commerce/productApi';
import { normalizeData } from './d2c_vto_productDetailsUtils.js';

//Static Resource for Store Styling
import D2C_VTO_STORE_STYLING from '@salesforce/resourceUrl/D2C_VTO_SH_StoreStyling';

//Custom Label Imports
import PDP_LABELS from '@salesforce/label/c.D2C_VTO_PDP_LABELS';
import READ_MORE_LABEL from '@salesforce/label/c.D2C_VTO_READ_MORE';
import DESCRIPTION_LENGTH from '@salesforce/label/c.D2C_VTO_PDP_DESCRIPTION_LENGTH';
import SILHOUETTE_CATEGORY from '@salesforce/label/c.D2C_VTO_SILHOUETTE_CATEGORY';

//Constants
const MOBILE_DEVICE_DIMENSIONS = '(max-width: 767px)';
const TABLET_DEVICE_DIMENSIONS = '(min-width: 768px) and (max-width: 1024px)';
const URI1 =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxwYXR0ZXJuIGlkPSJiIiBwYXR0ZXJuVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PHVzZSB4bGluazpocmVmPSIjYSIgdHJhbnNmb3JtPSJzY2FsZSguNSkiLz48L3BhdHRlcm4+PGltYWdlIGlkPSJhIiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0NBWUFBQUJYQXZtSEFBQUVHV2xEUTFCclEwZERiMnh2Y2xOd1lXTmxSMlZ1WlhKcFkxSkhRZ0FBT0kyTlZWMW9IRlVVUHJ0elp5TWt6bE5zTklWMHFEOE5KUTJUVmpTaHRMcC8zZDAyYnBaSk50b2k2R1QyN3M2WXljNDRNN3Y5b1U5RlVId3g2cHNVeEwrM2dDQW85US9iUHJRdmxRb2wydFFnS0Q2MCtJTlE2SXVtNjVrN001bHB1ckhlWmU1ODg1M3ZubnZ1dVdmdkJlaTVxbGlXa1JRQkZwcXVMUmN5NG5PSGo0ZzlLNUNFaDZBWEJxRlhVUjByWGFsTUFqWlBDM2UxVzk5RHdudGYyZFhkL3ArdHQwWWRGU0J4SDJLejVxZ0xpSThCOEtkVnkzWUJldnFSSHovcVdoNzJZdWkzTVVERUwzcTQ0V1BYdzNNK2ZvMXBadVFzNHRPSUJWVlRhb2lYRUkvTXhmaEdEUHN4c05aZm9FMXE2NnJvNWFKaW0zWGRvTEZ3NzJIK24yM0JhSVh6YmNPbno1bWZQb1R2WVZ6N0t6VWw1K0ZSeEV1cWtwOUcvQWppYTIxOXRoemcyNWFia1JFL0JwRGMzcHF2cGhIdlJGeXMyd2VxdnAra3JiV0tJWDduaERiekxPSXRpTTgzNThwVHdkaXJxcFBGbk1GMnhMYzFXdkx5T3dUQWlicGJtdkhIY3Z0dFU1N3k1K1hxTlpyTGUzbEUvUHE4ZVVqMmZYS2ZPZTNwZk9qemhKWXRCL3lsbDVTREZjU0RpSCtoUmtIMjUrTCtzZHhLRUFNWmFocmxTWDh1a3FNT1d5L2pYVzJtNk05TERCYzMxQjlMRnV2NmdWS2cvMFN6aTNLQXIxa0dxMUdNalUvYUxibnE2L2xSeGM0WGZKOThoVGFyZ1grK0RiTUpCU2lZTUllOUNrMVlBeEZrS0VBRzN4YllhS21ERGdZeUZLMFVHWXBmb1dZWEcrZkFQUEk2dEpuTndiN0NsUDdJeUYrRCtiak90Q3BraHo2Q0ZySWEvSTZzRnRObDhhdUZYR01UUDM0c053SS9KaGtnRXRtRHoxNHlTZmFSY1RJQklubUtQRTMya3h5eUUyVHYrdGhLYkVWZVBEZlcvYnlNTTFLbW0wWGRPYlM3b0dEL015cE1YRlBYckN3T3RvWWp5eW43QlYyOS9NWmZzVnpwTERkUnR1SVpuYnBYenZsZitldjhNdllyL0dxazRIL2tWL0czY3NkYXpMdXlUTVBzYkZoemQxVWFiUWJqRnZEUm1jV0p4UjN6Y2ZIa1Z3OUdmcGJKbWVldjlGMDhXVzh1RGthc2x3WDZhdmxXR1U2TlJLejBnL1NIdEN5OUozMG8vY2E5elgzS2ZjMTl6bjNCWFFLUk84dWQ0NzdoTG5BZmMxL0c5bXJ6R2xyZmV4WjVHTGRuNlpacnJFb2hJMndWSGhaeXdqYmhVV0V5OGljTUNHTkNVZGlCbHEzcit4YWZMNTQ5SFE1akgrYW4rMXkrTGxZQmlmdXhBdlJOL2xWVlZPbHdsQ2tkVm05Tk9MNUJFNHdrUTJTTWxEWlU5N2hYODZFaWxVL2xVbWtRVXp0VEU2bXgxRUVQaDdPbWRxQnRBdnY4SGRXcGJySlM2dEpqM24wQ1dkTTZidXNOelJWM1M5S1RZaHF2TmlxV211cm9pS2dZaHNoTWptaFRoOXB0V2hzRjc5NzBqL1NiTXJzUEUxc3VSNXo3RE1DK1AvSHMreTdpanJRQWxoeUFnY2NqYmhqUHlnZmVCVGp6aE5xeTI4RWRrVWg4QytEVTkrejJ2L295ZUg3OTFPbmN4SE9zNXkyQXRUYzduYi9mNzNUV1BrRC9xd0Jualg4Qm9KOThWUU5jQys4QUFBQ3pTVVJCVkdnRjdaaEJDc013REFUanZzYi9mNDEvMDlM';
const URI2 =
    'akhzV1FiUU9UbThDUzRoa0xqTmZlKzMwTnZuUE9HaXkvN3E3L212ek1QNjUxQTcrMm9nRU5RQUllSVFnUXAyc0FJNFFGSG05Z2RLLzV3cnI3YmpPdC8zZ0RiZ0RPSUU3WEFFWUlDMmdBQXNUcEdzQUlZUUVOUUlBNGZVM3ZIcjRMWWVaWndCbElIdjFJQTMzbTJWRUR5YU1mYWFEUFBEdHFJSG4wSTkrRitzeXpvek9RUFBxUkJ2ck1zNk1Ha2tjLzBrQ2ZlWGJVUVBMb1J4K1lPeHRMdG4wd2lBQUFBQUJKUlU1RXJrSmdnZz09Ii8+PC9kZWZzPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9InVybCgjYikiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iLjEiLz48L3N2Zz4=';

const SET_INTERVAL_LIMIT = '100';
const CATEGORY_NAV_CLASSES = '.headernav .slds-is-relative.slds-list__item a';
const BOLD_CLASS = 'font-weight-bold';

export default class D2c_vto_productDetails extends LightningElement {
    _sunglassCategory = SILHOUETTE_CATEGORY.split(',')[0];
    _opticalEyeWearCategory = SILHOUETTE_CATEGORY.split(',')[1];

    @api
    recordId;

    _currentCategoryName;

    _productData;

    _isDesktopDevice;

    _isLoading = true;

    labels = {};

    _displayData = {};

    _backButtonArrow = D2C_VTO_STORE_STYLING + '/icons/leftArrow.svg';

    _virtualTryOnIcon = D2C_VTO_STORE_STYLING + '/icons/VirtualTryOnBlack.svg';

    _wishlistIcon = D2C_VTO_STORE_STYLING + '/icons/Wishlist-black.svg';

    _infoIcon = D2C_VTO_STORE_STYLING + '/icons/INFO.svg';

    _closeIcon = D2C_VTO_STORE_STYLING + '/icons/cross.svg';

    _sizeIcon = D2C_VTO_STORE_STYLING + '/icons/size-icon-d2c.svg';

    _bridgeIcon = D2C_VTO_STORE_STYLING + '/icons/bridge-icon-d2c.svg';

    _earpieceLengthIcon = D2C_VTO_STORE_STYLING + '/icons/earpiece-length-icon-d2c.svg';

    _transparentURI = URI1 + URI2;

    _readMore = READ_MORE_LABEL.split(',')[0];

    _readLess = READ_MORE_LABEL.split(',')[1];

    _productDescriptionClass = 'justify-text descriptionreadmore';

    _readButtonClass = 'description-container read-more-button readButton';

    _showLessButton = false;

    _showMoreButton = false;

    _showSizeInformationModal = false;

    _discriptionLength = DESCRIPTION_LENGTH;

    _showProductDetailThirdColumn = true;

    _showProductDetailSecondColumn = true;

    _showProductDetailFirstColumn = true;

    @wire(ProductAdapter, { productId: '$recordId', fields: [] })
    async productAdapter({ error, data }) {
        if (data) {
            this._productData = { data: data };
            //Check device type
            this.detectDeviceType();
            await normalizeData(this._productData)
                .then((result) => {
                    this._displayData = JSON.parse(JSON.stringify(result));

                    if (this._displayData.features == null && this._displayData.lensTechnology == null) {
                        this._showProductDetailFirstColumn = false;
                    }
                    if (
                        this._displayData.lensDescription == null &&
                        this._displayData.frameColorDescription == null &&
                        this._displayData.shapeSize == null &&
                        this._displayData.model == null &&
                        this._displayData.collectionDesignFamily == null
                    ) {
                        this._showProductDetailSecondColumn = false;
                    }
                    if (this._displayData.material == null && this._displayData.shapeSize == null && this._displayData.included == null) {
                        this._showProductDetailThirdColumn = false;
                    }

                    // Apply custom CSS when the component is inserted into the DOM
                    this.applyCustomCSS();
                })
                .catch((errorInstance) => {
                    console.error(errorInstance);
                });
        } else if (error) {
            console.error(error);
        }
    }

    connectedCallback() {
        let labelList = PDP_LABELS.split(',');

        if (labelList !== undefined && labelList !== null) {
            this.labels = {
                shape: labelList[0],
                frameColor: labelList[1],
                lensColor: labelList[2],
                backToOverview: labelList[3],
                virtualTryOn: labelList[4],
                productDetails: labelList[5],
                featureLabel: labelList[6],
                lensLabel: labelList[7],
                collectionLabel: labelList[8],
                modelLabel: labelList[9],
                materialLabel: labelList[10],
                sizeLabel: labelList[11],
                includedLabel: labelList[12],
                modelHeaderLabel: labelList[13],
                lensWidthLabel: labelList[14],
                bridgeLabel: labelList[15],
                earpieceLengthLabel: labelList[16],
                modalDetailHeader: labelList[14] + ' / ' + labelList[15] + ' / ' + labelList[16],
                addToFavoritesLabel: labelList[17]
            };
        }
    }

    detectDeviceType() {
        const isMobileDevice = window.matchMedia(MOBILE_DEVICE_DIMENSIONS).matches;
        const isTabletDevice = window.matchMedia(TABLET_DEVICE_DIMENSIONS).matches;
        this._isDesktopDevice = !isMobileDevice && !isTabletDevice;
    }

    /**
     * Periodically attempts to apply custom CSS until successful
     * DVM21-32
     */
    async applyCustomCSS() {
        const intervalId = setInterval(() => {
            if (this.setStyles()) {
                clearInterval(intervalId); // Stop the interval once setStyles succeeds
            }
        }, SET_INTERVAL_LIMIT);
    }

    /**
     * Adds styles to category links and attaches click event listeners
     * DVM21-32
     */
    setStyles() {
        const categoryLinks = document.querySelectorAll(CATEGORY_NAV_CLASSES);
        if (categoryLinks.length > 0) {
            categoryLinks.forEach((link) => {
                if (link.title == this._sunglassCategory && this._displayData.isSunglassProduct == true) {
                    link.classList.add(BOLD_CLASS);
                } else if (link.title == this._opticalEyeWearCategory && this._displayData.isOpticalEyewearProduct == true) {
                    link.classList.add(BOLD_CLASS);
                }
            });
            this._isLoading = false;
            return true; // Indicate that the elements were found and event listeners were added
        } else {
            this._isLoading = false;
            return false; // Indicate that the elements were not found
        }
    }

    /**
     * Return the Product Description.
     */
    get productDescriptionValue() {
        let productDescriptionValueText = this.decodeHTMLEntities(this._displayData.description);
        if (
            productDescriptionValueText != null &&
            productDescriptionValueText != undefined &&
            productDescriptionValueText.length != undefined &&
            productDescriptionValueText.length > this._discriptionLength
        ) {
            this._showMoreButton = true;
        }

        return this.decodeHTMLEntities(this._displayData.description);
    }

    /**
     * Decode the string from HTML Entities to String.
     *
     * @type {String}
     */
    decodeHTMLEntities(text) {
        var entities = [
            ['amp', '&'],
            ['apos', "'"],
            ['#x27', "'"],
            ['#x2F', '/'],
            ['#39', "'"],
            ['#47', '/'],
            ['lt', '<'],
            ['gt', '>'],
            ['nbsp', ' '],
            ['quot', '"']
        ];
        if (text) {
            entities.forEach((item) => {
                text = text.replace(new RegExp('&' + item[0] + ';', 'g'), item[1]);
            });
            return text;
        }
    }

    showCompleteDescription() {
        this._productDescriptionClass = 'slds-m-top_x-small justify-text descriptionreadless';
        this._readButtonClass = 'description-container read-less-button readButton';
        this._showLessButton = true;
    }

    hideDescription() {
        this._productDescriptionClass = 'slds-m-top_x-small justify-text descriptionreadmore';
        this._readButtonClass = 'description-container read-more-button readButton';
        this._showLessButton = false;
    }

    handleBackToOverview() {
        window.history.back();
    }

    handleAddToWishlist() {}

    handleVirtualTryOn() {}

    showSizeModal() {
        this._showSizeInformationModal = true;
    }

    handleDialogClose() {
        this._showSizeInformationModal = false;
    }
}
