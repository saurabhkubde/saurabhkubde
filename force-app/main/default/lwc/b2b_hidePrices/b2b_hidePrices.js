import { LightningElement, api } from 'lwc';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import hidePrices from '@salesforce/apex/B2B_HidePriceController.updateHidePriceOnAccount';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';
export default class B2b_hidePrices extends LightningElement {
    @api
    setHidePrice;

    _setHidePrice;

    isLoading = false;

    get isPriceHidden() {
        if (this._setHidePrice === undefined || this._setHidePrice === null) {
            //BS-1362 - Fix for hide price eye icon status on PDP
            this._setHidePrice = this.setHidePrice;
        }
        return this._setHidePrice;
    }

    get showPriceIcon() {
        return STORE_STYLING + '/hideshowpricepdp/show.svg';
    }

    get hidePriceIcon() {
        return STORE_STYLING + '/hideshowpricepdp/hide.svg';
    }
    set isPriceHidden(value) {
        this._setHidePrice = value;
    }

    hidePrices() {
        this.isLoading = true;
        this.isPriceHidden = true;
        this.triggerHidePrices(true);
        this.dispatchEvent(
            new CustomEvent('hidepricesection', {
                bubbles: true,
                composed: true
            })
        );
    }

    showPrices() {
        this.isLoading = true;
        this.isPriceHidden = false;
        this.triggerHidePrices(false);
        this.dispatchEvent(
            new CustomEvent('showpricesection', {
                bubbles: true,
                composed: true
            })
        );
    }

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
