import { LightningElement, api } from 'lwc';
import checkAccountOrderLock from '@salesforce/apex/B2B_Utils.checkAccountOrderLock';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';
import ORDER_LOCKED_MESSAGE from '@salesforce/label/c.B2B_ACCOUNT_ORDER_LOCKED_MESSAGE';
const HOME_PAGE_SOURCE = 'Home Page';
const LOCK_KEY = 'locked';
const USER_LOCK_FLAG = 'clickclosed';
const ACCOUNT_LOCK_EVENT = 'doshowpopup';

export default class B2b_accountLockPopup extends LightningElement {
    /**
     * Variable to check whether user click on close button or not.
     * BS-963
     *  @type {Boolean}
     */
    _clickclosed = false;

    /**
     * Variable to check whether account is lock or not.
     * BS-963
     *  @type {Boolean}
     */
    _accountLockFlag = false;

    /**
     * Variable to store close icon image information.
     * BS-963
     *  @type {Boolean}
     */
    _closeIcon = STORE_STYLING + '/icons/cross.svg';

    /**
     * Variable to store error message.
     * BS-963
     *  @type {Boolean}
     */
    _errorMessage = ORDER_LOCKED_MESSAGE;

    @api
    effectiveAccountId;

    @api
    pageSource;
    async connectedCallback() {
        if (this.pageSource == HOME_PAGE_SOURCE) {
            if (localStorage.getItem(USER_LOCK_FLAG) != null) {
                if (localStorage.getItem(USER_LOCK_FLAG) == 'true') {
                    this._accountLockFlag = false;
                } else if (localStorage.getItem(USER_LOCK_FLAG) == 'false') {
                    this._accountLockFlag = true;
                }
            } else if (this.effectiveAccountId != null && this.effectiveAccountId.length > 0 && this.effectiveAccountId !== '000000000000000') {
                await checkAccountOrderLock({ accountId: this.effectiveAccountId })
                    .then((result) => {
                        if (result == true) {
                            this._accountLockFlag = true;
                            localStorage.setItem(LOCK_KEY, this._accountLockFlag);
                        } else if (result == false) {
                            this._accountLockFlag = false;
                            localStorage.setItem(LOCK_KEY, this._accountLockFlag);
                        }
                    })
                    .catch((errorInstance) => {
                        console.error(errorInstance);
                    });
            }

            /* Start : BS-1509 */
            if (this.pageSource === HOME_PAGE_SOURCE) {
                this.dispatchEvent(
                    new CustomEvent(ACCOUNT_LOCK_EVENT, {
                        detail: {
                            lock: this._accountLockFlag
                        }
                    })
                );
            }
            /* End : BS-1509 */
        } else {
            if (localStorage.getItem(LOCK_KEY) !== null) {
                if (localStorage.getItem(LOCK_KEY) == 'true') {
                    this._accountLockFlag = true;
                } else if (localStorage.getItem(LOCK_KEY) == 'false') {
                    this._accountLockFlag = false;
                }
            }
        }
    }

    /**
     * BS-963
     * Handler to close error message dialog box.
     */
    handleDialogClose() {
        this._accountLockFlag = false;
        this._clickclosed = true;
        if (this.pageSource == HOME_PAGE_SOURCE) {
            localStorage.setItem(USER_LOCK_FLAG, this._clickclosed);
        }
        /* Start : BS-1509 */
        if (this.pageSource === HOME_PAGE_SOURCE) {
            this.dispatchEvent(
                new CustomEvent(ACCOUNT_LOCK_EVENT, {
                    detail: {
                        lock: this._accountLockFlag
                    }
                })
            );
        }
        /* End : BS-1509 */
    }
}
