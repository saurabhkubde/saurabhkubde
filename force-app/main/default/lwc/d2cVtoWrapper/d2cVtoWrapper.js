// standard imports
import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import LANG from '@salesforce/i18n/lang';
import basePath from '@salesforce/community/basePath';

// custom imports
import forceSiteUrl from '@salesforce/label/c.D2C_VTO_Store_Forcesite_Url';
import pollingInterval from '@salesforce/label/c.D2C_VTO_Polling_Interval';
import getActivityRecords from '@salesforce/apex/D2C_VTO_SessionController.getActivityRecords';

// constants
const VTO_VFPAGE = 'D2C_VTO_VirtualTryOnPage';
const SILHOUETTE = 'silhouette';
const SH_FORCE_SITE = forceSiteUrl.split(',')[0];
const NB_FORCE_SITE = forceSiteUrl.split(',')[1];
const SHOP_CONTEXT = 'shopContext';
const POLLING_INTERVAL = Number(pollingInterval);
const SA_COMMAND_OPEN_VTO_SESSION = 'Open VTO session';
const FRAME_SKU_URL_PARAM = 'frameSKU';

/**
 * following lightning element loads vto
 * and performs vto with frameSku from url
 * developed as part of DVM21-6
 */
export default class d2C_VTO_Wrapper extends LightningElement {
    @wire(CurrentPageReference)
    pageRef;

    /**
     * DVM21-7
     * polls for product selected from pdp
     */
    async connectedCallback() {
        // poll for product sku
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._intervalIdForProductSelectionCheck = setInterval(async () => {
            await this.isProductSelected();
        }, POLLING_INTERVAL);
    }

    /**
     * Gets the frameSKU parameter from url if available
     * else returns null
     *
     * @type {string}
     * @readonly
     */
    get frameSkuUrlParam() {
        if (this.pageRef && this.pageRef.state && this.pageRef.state.frameSKU) {
            return this.pageRef.state.frameSKU;
        }
        return null;
    }

    /**
     * returns language as expected by fittingbox
     *
     * @type {string}
     * @readonly
     */
    get language() {
        if (LANG.includes('-')) {
            return LANG.split('-')[0];
        }
        return LANG;
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
     * sets the frameSKU parameter in url
     * deletes the existing frameSKU and adds new frameSKU
     * refreshes the page with new params
     *
     * @param {string} value - frameSKU
     * @type {string}
     */
    set frameSkuUrlParam(value) {
        // DVM21-7: refresh the page only if value is not null
        if (value) {
            let currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete(FRAME_SKU_URL_PARAM);
            currentUrl.searchParams.append(FRAME_SKU_URL_PARAM, value);
            window.location.assign(currentUrl.href);
        }
    }

    /**
     * returns the url of vto vfpage
     *
     * @type {string}
     * @readonly
     */
    get vfPageUrl() {
        let params = new URLSearchParams();
        if (this.frameSkuUrlParam) {
            params.append('frameSKU', this.frameSkuUrlParam);
        }
        params.append('language', this.language);

        let baseForcePath = basePath.toLowerCase().includes(SILHOUETTE) ? SH_FORCE_SITE : NB_FORCE_SITE;
        return baseForcePath + `/${VTO_VFPAGE}?${params.toString()}`;
    }

    /**
     * DVM21-7
     * polls for product selected from pdp
     * updates pages's frameSKU if found
     *
     * @type {string}
     * @readonly
     */
    async isProductSelected() {
        if (this.ShopContext) {
            // this if block should execute on pos device
            let selectedProductRecords = await getActivityRecords({
                sessionId: this.ShopContext.sessionRecordId,
                command: SA_COMMAND_OPEN_VTO_SESSION
            });
            if (selectedProductRecords && selectedProductRecords.length && this.frameSkuUrlParam !== selectedProductRecords[0].D2C_VTO_Product_SKU__c) {
                this.frameSkuUrlParam = selectedProductRecords[0].D2C_VTO_Product_SKU__c;
            }
        }
    }
}
