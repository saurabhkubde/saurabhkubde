import { LightningElement, api } from 'lwc';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import hidePrices from '@salesforce/apex/B2B_VisionSensation_RX_Controller.updateHidePriceOnAccount';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';

const HIDE_PRICE = 'hidepricesection';
const SHOW_PRICE = 'showpricesection';

export default class B2b_vs_rx_hide_prices_component extends LightningElement {
    /**
     * BS-708
     * Variable that contains value of hide price status
     * This variable is obtained from c/b2b_vs_rx_search_result_container
     *
     * @type {Boolean}
     */
    @api
    setHidePrice;

    /**
     * BS-708
     * Variable that holds the value of hide price status
     *
     * @type {Boolean}
     */
    _setHidePrice;

    /**
     * BS-708
     * Variable to operate loader]
     *
     * @type {Boolean}
     */
    isLoading = false;

    /**
     * BS-708
     * This getter method is use to assign value to '_setHidePrice' variable
     *
     */
    get isPriceHidden() {
        if (this._setHidePrice === undefined || this._setHidePrice === null) {
            //BS-1362 - Fix for hide price eye icon status on PDP
            this._setHidePrice = this.setHidePrice;
        }
        return this._setHidePrice;
    }

    /**
     * BS-708
     * This getter method is use set show price icon
     *
     */
    get showPriceIcon() {
        return STORE_STYLING + '/hideshowpricepdp/show.png';
    }

    /**
     * BS-708
     * This getter method is use set hide price icon
     *
     */
    get hidePriceIcon() {
        return STORE_STYLING + '/hideshowpricepdp/hide.png';
    }
    set isPriceHidden(value) {
        this._setHidePrice = value;
    }

    /**
     * BS-708
     * This method is invoked on click of hide price icon on UI
     *
     */
    hidePrices() {
        this.isLoading = true;
        this.isPriceHidden = true;
        this.triggerHidePrices(true);
        this.dispatchEvent(
            new CustomEvent(HIDE_PRICE, {
                bubbles: true,
                composed: true
            })
        );
    }

    /**
     * BS-708
     * This method is invoked on click of show price icon on UI
     *
     */
    showPrices() {
        this.isLoading = true;
        this.isPriceHidden = false;
        this.triggerHidePrices(false);
        this.dispatchEvent(
            new CustomEvent(SHOW_PRICE, {
                bubbles: true,
                composed: true
            })
        );
    }

    /**
     * BS-708
     * This method is used to update field:'B2B_Hide_Prices__c' on Account object
     *
     */
    triggerHidePrices(hide) {
        hidePrices({ hidePrices: hide })
            .then((result) => {
                getRecordNotifyChange([{ recordId: result }]);
            })
            .catch((error) => {
                console.log('Error: ' + JSON.stringify(error));
            })
            .finally(() => {
                this.isLoading = false;
            });
    }
}
