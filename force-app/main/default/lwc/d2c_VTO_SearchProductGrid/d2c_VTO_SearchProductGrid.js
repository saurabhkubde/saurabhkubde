import { api, LightningElement, track, wire } from 'lwc';
import { EVENT, KEY_CODE } from './constants';
import { AppContextAdapter } from 'commerce/contextApi';

import getColorsMetadata from '@salesforce/apex/D2C_VTO_ProductCardController.getColorsMetadata';

export default class D2C_VTO_SearchProductGrid extends LightningElement {
    static renderMode = 'light';

    /**
     * Gets or sets the card collection display-data.
     * @type {?ProductCardData[]}
     * DVM21-32
     */
    @api
    displayData;

    /**
     * Map of Parent value vs colorcodes.
     * @type {Map}
     * DVM21-32
     */
    _customMetadataColorsMap = new Map();

    /**
     * Gets the normalized card collection display-data.
     * @type {ProductCardData[]}
     * @readonly
     * @private
     * DVM21-32
     */
    get normalizedDisplayData() {
        return this.displayData ?? [];
    }

    @wire(AppContextAdapter)
    appContext; // DVM21-32

    async connectedCallback() {
        let result = await getColorsMetadata({}); //DVM21-32
        if (result !== null && result !== undefined) {
            let customMetadataColors = new Map(Object.entries(JSON.parse(result)));
            for (let element of customMetadataColors.values()) {
                this._customMetadataColorsMap.set(element.Label, element.B2B_Color_code__c);
            }
        }
    }

    /**
     * Handles the `showproduct` event which navigates to a product detail page.
     * @param {CustomEvent} event A "showproduct" received from a product card
     * @private
     * @fires SearchProductGrid#showproduct
     * DVM21-32
     */
    handleNavigateToProductPage(event) {
        event.stopPropagation();
        this.dispatchEvent(
            new CustomEvent(EVENT.SHOW_PRODUCT_EVT, {
                detail: event.detail
            })
        );
    }
}
