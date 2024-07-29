// standard imports
import { LightningElement, track, wire } from 'lwc';
import basePath from '@salesforce/community/basePath';
import LANG from '@salesforce/i18n/lang';
import { deleteRecord } from 'lightning/uiRecordApi';
import { subscribe, unsubscribe, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';

// custom imports
import NEUBAU_LOGO_IMAGE from '@salesforce/resourceUrl/D2C_VTO_SH_StoreStyling';
import HOME_PAGE_BACKGROUND_IMAGE from '@salesforce/resourceUrl/D2C_VTO_NB_Home_Page_Image';
import HOME_PAGE_TEXT from '@salesforce/label/c.D2C_VTO_Home_Page_Text';
import HOME_PAGE_BACKGROUND_IMAGE_URL from '@salesforce/label/c.D2C_VTO_Home_Page_Potrait_Image_URL';
import qrcode from './d2C_VTO_qrcode.js';
import getCategoryId from '@salesforce/apex/D2C_VTO_SessionController.getCategoryId';
import vtoMessageChannel from '@salesforce/messageChannel/d2c_VTO_MessageChannel__c';

// constants
const NB_D2C_CATALOG_NAME = 'Neubau D2C Catalog';
const OPTICAL_EYEWEAR_CATEGORY = 'Optical Eyewear';

export default class D2C_VTO_SH_Home extends LightningElement {
    _vtoMessageChannelSubscription;
    _sessionId;

    // Set background image URL
    @track _backgroundImageURL = HOME_PAGE_BACKGROUND_IMAGE_URL;

    // Set background image
    @track __backgroundImage = HOME_PAGE_BACKGROUND_IMAGE;

    // Store background image URL or background image
    @track _homePageBackgroundImage;

    // Neubau logo image
    @track _neubauLogo = NEUBAU_LOGO_IMAGE + '/icons/D2C_VTO_NeubauLogo.svg';

    // Text for scanning QR code
    @track _scanQRcodetext;

    // Text for 'or' separator
    @track _ortext;

    // Text for continuing with POS screen
    @track _continueWithPosScreentext;

    // Home page text
    @track _text = HOME_PAGE_TEXT;

    // List of text components
    @track _textList = [];

    // Element to apply styles
    @track _styleElement;

    // Interval ID for setInterval
    @track _intervalId;

    // Check device type for dynamic styling
    @track _deviceType;

    @wire(MessageContext)
    messageContext;

    async connectedCallback() {
        let _homePageImageList = this._backgroundImageURL.split(',');
        let _ImageUrlList = _homePageImageList[1].split(':-');
        if (_ImageUrlList[1] == 'false') {
            this._homePageBackgroundImage = HOME_PAGE_BACKGROUND_IMAGE;
        } else {
            this._homePageBackgroundImage = _ImageUrlList[1];
        }
        this._textList = this._text.split(',');
        this._scanQRcodeText = this._textList[4];
        this._orText = this._textList[1];
        this._continueWithPosScreenText = this._textList[2];

        this.setTimeOutForBackgroundImage();
        // DVM21-7: get categoryId for redirectionUrl
        this._categoryId = await getCategoryId({ catalogName: NB_D2C_CATALOG_NAME, categoryName: OPTICAL_EYEWEAR_CATEGORY });
        // DVM21-7: read sessionId from message channel
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeFromMessageChannel();
    }

    /**
     * DVM21-7
     * subscribes to message channel
     *
     */
    subscribeToMessageChannel() {
        if (!this._vtoMessageChannelSubscription) {
            this._vtoMessageChannelSubscription = subscribe(this.messageContext, vtoMessageChannel, (message) => this.handleMessage(message), {
                scope: APPLICATION_SCOPE
            });
        }
    }

    /**
     * DVM21-7
     * message handler for the message channel
     * when message is received sets _sessionId
     * and generates qrCode using _sessionId
     */
    handleMessage(message) {
        this._sessionId = message.sessionId;
        this.generateQRCode();
    }

    /**
     * DVM21-7
     * unsubscribes from message channel
     *
     */
    unsubscribeFromMessageChannel() {
        unsubscribe(this._vtoMessageChannelSubscription);
        this._vtoMessageChannelSubscription = null;
    }

    /**
     * DVM21-15
     * this method is used to get the plpRedirectionUrl
     * @returns {string}
     */
    get plpRedirectionUrl() {
        let origin = new URL(window.location.href).origin;
        let plpUrl = `${origin}${basePath}/category/${this._categoryId}`;
        let plpUrlWithLanguage = plpUrl;
        if (!plpUrl.includes(`/${LANG}/`)) {
            plpUrlWithLanguage = plpUrl.replace(`${basePath}/`, `${basePath}/${LANG}/`);
        }
        return plpUrlWithLanguage;
    }

    /**
     * DVM21-5
     * appends sessionId parameter to the URL
     * @param {string} url - URL to be appended
     * @param {string} sessionId - session record Id
     * @returns {string} - URL with sessionId parameter
     */
    appendSessionIdParameterToUrl(url, sessionId) {
        let newUrl = new URL(url);
        newUrl.searchParams.append('sessionId', sessionId);
        return newUrl.href;
    }

    /**
     * DVM20-15: Creation of home page for VTO/POS for SH and NB Store
     * This method is used to generate the QR code.
     */
    generateQRCode() {
        const qrCodeGenerated = new qrcode(0, 'H');
        qrCodeGenerated.addData(this.appendSessionIdParameterToUrl(this.plpRedirectionUrl, this._sessionId));
        qrCodeGenerated.make();
        let element = this.template.querySelector('.qrcode2');
        element.innerHTML = qrCodeGenerated.createSvgTag({});
    }
    /**
     * DVM20-15: Creation of home page for VTO/POS for SH and NB Store
     * Method to set timeout for background image.
     */
    setTimeOutForBackgroundImage() {
        setTimeout(() => {
            this.setStyleForBackgroundImage(document.querySelector('.backgroundImageStyle'));
        }, 500);
    }
    /**
     * DVM20-15: Creation of home page for VTO/POS for SH and NB Store
     * Method to set style for background image.
     */
    setStyleForBackgroundImage(data) {
        if (data) {
            data.style.backgroundSize = '100% 100%';
            data.style.width = '100%';
            data.style.height = '100vh';

            data.style.backgroundImage = `url(${this._homePageBackgroundImage})`;
        } else {
            this.setTimeOutForBackgroundImage();
        }
    }

    /**
     * DVM20-15: Creation of home page for VTO/POS for SH and NB Store
     * This method is used to handle the continue action and redirect to the POS screen.
     */
    handleContinue() {
        if (this._sessionId) {
            // DVM21-5: delete session record on continue with pos so as to prevent qrScan in future
            deleteRecord(this._sessionId);
        }
        window.location.assign(this.plpRedirectionUrl);
    }
}
