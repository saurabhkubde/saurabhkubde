// standard imports
import { LightningElement, api } from 'lwc';

// custom imports
import remoteConnectionNotificationLabel from '@salesforce/label/c.D2C_VTO_Notification';

// constants
const SHOP_CONTEXT = 'shopContext';
const DEVICE_FACTOR = {
    POS: 'POS',
    REMOTE: 'Remote'
};

// Class Element developed as part of DVM21-6
export default class D2cVtoNotifier extends LightningElement {
    _isRemote = false;
    _localStorageCheckIntervalId;

    @api
    localStorageMaxChecks = 5;

    @api
    localStorageChecksInterval = 1000;

    /**
     * Gets the notification text translation
     *
     * @type {string}
     * @readonly
     */
    get notificationText() {
        return remoteConnectionNotificationLabel;
    }

    get isRemote() {
        return this._isRemote;
    }

    connectedCallback() {
        this.setIntervalToCheckLocalStorage();
    }

    /**
     * DVM21-5
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
     * DVM21-5
     * gets the shop context from storage
     * checks storage with limited max checks
     * and sets isRemote to true
     * @returns {object} - shop context object
     *
     */
    setIntervalToCheckLocalStorage() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._localStorageCheckIntervalId = setInterval(() => {
            if (this.ShopContext && this.ShopContext.deviceFactor === DEVICE_FACTOR.REMOTE) {
                this._isRemote = true;
                clearInterval(this._localStorageCheckIntervalId);
            }
            if (this.localStorageMaxChecks <= 0) {
                clearInterval(this._localStorageCheckIntervalId);
            }
            this.localStorageMaxChecks--;
        }, this.localStorageChecksInterval);

        return false;
    }
}
