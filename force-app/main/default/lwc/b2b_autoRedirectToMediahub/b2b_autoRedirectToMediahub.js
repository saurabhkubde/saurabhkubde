import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import ISBUYER from '@salesforce/schema/Account.IsBuyer';

// GET LABEL
import MEDIAHUB_FORWARD_LINK from '@salesforce/label/c.B2B_Mediahub_User_Redirect_Linkout';

const fields = [ISBUYER];
const MEDIA_HUB_URL = 'mediaHubURL'; //BS-2239
const HTTPS = 'https://'; //BS-2239

export default class B2b_autoRedirectToMediahub extends NavigationMixin(LightningElement) {
    @api effectiveAccountId;
    @track _isLoading = true;

    /**
     * Gets the normalized effective account of the user.
     * @type {string}
     */
    get resolvedEffectiveAccountId() {
        const effectiveAccountId = this.effectiveAccountId || '';
        let resolved = null;
        if (effectiveAccountId.length > 0 && effectiveAccountId !== '000000000000000') {
            resolved = effectiveAccountId;
        } else {
            this._isLoading = false;
        }
        return resolved;
    }

    /**
     * Fetching account data from apex via wire call
     *  @type {object}
     */
    @wire(getRecord, { recordId: '$resolvedEffectiveAccountId', fields })
    account({ data }) {
        if (data) {
            this.forwardToMediahub(data);
        }
    }

    forwardToMediahub(accountData) {
        if (JSON.stringify(accountData) != undefined && JSON.stringify(accountData) != null) {
            let isBuyer = getFieldValue(accountData, ISBUYER);

            if (isBuyer === false) {
                //BS-2239 start
                let linkToRedirect = localStorage.getItem(MEDIA_HUB_URL) != undefined ? localStorage.getItem(MEDIA_HUB_URL) : MEDIAHUB_FORWARD_LINK;
                if (!linkToRedirect.includes(HTTPS)) {
                    linkToRedirect = window.location.origin + linkToRedirect;
                }
                Object.assign(document.createElement('a'), {
                    target: '_self',
                    rel: 'noopener',
                    href: linkToRedirect
                }).click();
                //BS-2239 end
            }

            this._isLoading = false;
        }
    }
}
