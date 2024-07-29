import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import updateMyB2BShopPreference from '@salesforce/apex/B2B_ProductDetailsController.updateMyB2BShopPreference';
import getShowRecommendedRetailPrice from '@salesforce/apex/B2B_ProductDetailsController.getShowRecommendedRetailPrice';

import HIDE_SUGGESTED_RETAIL_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Suggested_Retail_Price__c'; //BS-2273

//LABELS
import RRP_LABEL from '@salesforce/label/c.B2B_Show_RRP_Label'; //Added as part of BS-575

// constants
const ACCOUNT_FIELDS = [HIDE_SUGGESTED_RETAIL_PRICE_FIELD];

export default class B2b_myAccountSettings extends LightningElement {
    @api isSilhouetteSite;
    isFooterLocated = false;

    //Added as part of BS-575
    @api effectiveAccountId;

    @wire(getRecord, { recordId: '$effectiveAccountId', fields: ACCOUNT_FIELDS })
    account;

    /**
     * get HIDE_SUGGESTED_RETAIL_PRICE_FIELD value on account
     * BS-2273
     */
    get hideSuggestedRetailPriceField() {
        if (this.account && this.account.data) {
            return getFieldValue(this.account.data, HIDE_SUGGESTED_RETAIL_PRICE_FIELD);
        }
        return true;
    }

    _recomendedRetailPriceLabel = RRP_LABEL;
    _isToggleClicked;
    _isLoading = false;

    get _isSilhouetteSite() {
        return this.isSilhouetteSite;
    }

    get resolvedEffectiveAccountId() {
        const effectiveAccountId = this.effectiveAccountId || '';
        let resolved = null;
        if (effectiveAccountId.length > 0 && effectiveAccountId !== '000000000000000') {
            resolved = effectiveAccountId;
        }
        return resolved;
    }

    async connectedCallback() {
        let result = await getShowRecommendedRetailPrice({
            accountId: this.resolvedEffectiveAccountId
        });
        if (result !== null) {
            this._isToggleClicked = result;
        }
    }

    async handleToggle() {
        this._isLoading = true;
        this._isToggleClicked = !this._isToggleClicked;
        await updateMyB2BShopPreference({ accountId: this.resolvedEffectiveAccountId, showRRP: this._isToggleClicked });
        this._isLoading = false;
    }
}
