// standard imports
import { CurrentPageReference } from 'lightning/navigation';
import { LightningElement, wire, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ProductAdapter } from 'commerce/productApi';
import { publish, MessageContext } from 'lightning/messageService';

// custom imports
import checkIfActivityRecordExists from '@salesforce/apex/D2C_VTO_SessionController.checkIfActivityRecordExists';
import createSessionActivity from '@salesforce/apex/D2C_VTO_SessionController.createSessionActivity';
import createSessionActivityIfNotExists from '@salesforce/apex/D2C_VTO_SessionController.createSessionActivityIfNotExists';
import createSessionRecord from '@salesforce/apex/D2C_VTO_SessionController.createSessionRecord';
import pollingInterval from '@salesforce/label/c.D2C_VTO_Polling_Interval';
import updateSessionStatus from '@salesforce/apex/D2C_VTO_SessionController.updateSessionStatus';
import vtoMessageChannel from '@salesforce/messageChannel/d2c_VTO_MessageChannel__c';

// constants
const COMMAND_QR_CODE_SCANNED = 'QR Code scanned';
const COMMUNITY_NAMED_PAGE = 'comm__namedPage';
const DEVICE_FACTOR = { POS: 'POS', REMOTE: 'Remote' };
const PAGE_SOURCE = { PLP: 'plp', PDP: 'pdp', HOME: 'home' };
const POLLING_INTERVAL = Number(pollingInterval);
const SA_COMMAND_OPEN_VTO_SESSION = 'Open VTO session';
const SA_COMMAND_QR_CODE_SCANNED = 'QR Code scanned';
const SESSION_STATUS_IN_PROGRESS = 'In Progress';
const SESSION_STATUS_OPEN = 'Open';
const SHOP_CONTEXT = 'shopContext';
const VTO_EXPERIENCE_PAGE_API_NAME = 'virtual_try_on_page__c';

export default class D2c_VTO_Session_Manager extends NavigationMixin(LightningElement) {
    _sessionId;
    _pageSource;

    @api
    recordId;

    @api
    get pageSource() {
        return this._pageSource;
    }

    /**
     * DVM21-7
     * Sets _page_source to value from PAGE_SOURCE.PDP or PAGE_SOURCE.PLP or PAGE_SOURCE.HOME
     */
    set pageSource(value) {
        // eslint-disable-next-line default-case
        switch (value.toLowerCase()) {
            case PAGE_SOURCE.PDP: {
                this._pageSource = PAGE_SOURCE.PDP;
                break;
            }
            case PAGE_SOURCE.PLP: {
                this._pageSource = PAGE_SOURCE.PLP;
                break;
            }
            case PAGE_SOURCE.HOME: {
                this._pageSource = PAGE_SOURCE.HOME;
                break;
            }
        }
    }

    /**
     * DVM21-7
     * get sessionId from storage if not available in _sessionId
     */
    get sessionId() {
        if (this._sessionId) {
            return this._sessionId;
        }
        if (this.ShopContext) {
            return this.ShopContext.sessionRecordId;
        }
        return null;
    }

    /**
     * DVM21-7
     * if storage deviceFactor is REMOTE returns true
     * else false
     */
    get isRemote() {
        if (this.ShopContext && this.ShopContext.deviceFactor === DEVICE_FACTOR.REMOTE) {
            return true;
        }
        return false;
    }

    /**
     * DVM21-7
     * if pdp is opened the following adapter executes successfully
     * and sets _productSku
     * else fails silently
     */
    @wire(ProductAdapter, { productId: '$recordId', fields: [] })
    async productAdapter({ data }) {
        if (data && data.fields.D2C_VTO_Is_VTO_Available__c) {
            this._productSku = data.fields.B2B_UPC_Code__c;
            await this.performPageSourceActions();
        }
    }

    @wire(MessageContext)
    messageContext;

    /**
     * DVM21-7
     * if pageSource is plp
     * Sets the storage shopContext
     * with remote device factor and sessionId
     * @readonly
     */
    @wire(CurrentPageReference)
    async updateIsRemoteState(pageRef) {
        // if sessionId is received in url set Remote in storage
        if (pageRef && pageRef.state && pageRef.state.sessionId && this.pageSource === PAGE_SOURCE.PLP) {
            this._sessionId = pageRef.state.sessionId;
            this.setShopContext(true, this._sessionId, DEVICE_FACTOR.REMOTE);
            await this.performPageSourceActions();
        }
    }

    /**
     * DVM21-7
     * gets the shop context from storage
     * @returns {object} - shop context object
     *
     */
    get ShopContext() {
        let shopContext = sessionStorage.getItem(SHOP_CONTEXT);
        if (shopContext) {
            return JSON.parse(shopContext);
        }
        return shopContext;
    }

    /**
     * DVM21-7
     * sets the shop context in storage
     * @param {boolean} comingFromVTOPOSUrl - true if the session is coming from VTO/POS URL
     * @param {string} sessionRecordId - session record Id
     * @param {string} deviceFactor -- POS or Remote
     *
     * @example
     * SessionManager.setShopContext(true, 'sessionId', DEVICE_FACTOR.POS);
     */
    setShopContext(comingFromVTOPOSUrl, sessionRecordId, deviceFactor) {
        sessionStorage.setItem(SHOP_CONTEXT, JSON.stringify({ comingFromVTOPOSUrl, sessionRecordId, deviceFactor }));
    }

    /**
     * DVM21-7
     * calls apex method to start new session
     * and starts a polling loop that checks for QR Code scan
     * and publishes the sessionId on message channel
     *
     */
    async startSessionAndPollForQrScan() {
        let currentDate = new Date();
        this._sessionId = await createSessionRecord({ status: SESSION_STATUS_OPEN, sessionOpenTimeStamp: currentDate.toISOString() });
        this.setShopContext(true, this._sessionId, DEVICE_FACTOR.POS);
        publish(this.messageContext, vtoMessageChannel, { sessionId: this.sessionId });
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._intervalIdForQrScan = setInterval(async () => {
            await this.isQrCodeScanned();
        }, POLLING_INTERVAL);
    }

    /**
     * DVM21-7
     * calls apex method to check for qr code scan status
     * and puts the sessionId received in storage
     *
     * @param {function} onScanCallback - callback function when QR Code scan is detected
     */
    async isQrCodeScanned() {
        let qrScanStatus = await checkIfActivityRecordExists({ sessionId: this.sessionId, command: COMMAND_QR_CODE_SCANNED });
        if (qrScanStatus) {
            clearInterval(this._intervalIdForQrScan);
            this.onQrScanRedirectToVto();
        }
    }

    /**
     * DVM21-7
     * this method is used to handle redirection to vtoVfPage when QR is scanned
     */
    onQrScanRedirectToVto() {
        this[NavigationMixin.Navigate]({
            type: COMMUNITY_NAMED_PAGE,
            attributes: {
                name: VTO_EXPERIENCE_PAGE_API_NAME
            }
        });
    }

    /**
     * DVM21-7
     * executes the methods depending on pageSource
     */
    async performPageSourceActions() {
        await Promise.resolve();
        // eslint-disable-next-line default-case
        switch (this._pageSource) {
            case PAGE_SOURCE.PLP: {
                if (this.isRemote) {
                    await createSessionActivityIfNotExists({ sessionId: this.sessionId, command: SA_COMMAND_QR_CODE_SCANNED });
                    await updateSessionStatus({ sessionId: this.sessionId, status: SESSION_STATUS_IN_PROGRESS });
                }
                break;
            }
            case PAGE_SOURCE.PDP: {
                if (this.isRemote && this._productSku) {
                    await createSessionActivity({
                        sessionId: this.sessionId,
                        command: SA_COMMAND_OPEN_VTO_SESSION,
                        productSku: this._productSku
                    });
                }
                break;
            }
            case PAGE_SOURCE.HOME: {
                await this.startSessionAndPollForQrScan();
                break;
            }
        }
    }

    async connectedCallback() {
        await this.performPageSourceActions();
    }
}
