import { api, track, LightningElement } from 'lwc';
import order_summary_labels from '@salesforce/label/c.D2C_NB_ORDER_SUMMARY_LABELS'; //NBD2C-98
import storeResource from '@salesforce/resourceUrl/D2C_NB_StoreStyling'; //NBD2C-98

export default class D2C_order_summary_container extends LightningElement {
    /**
     * NBD2C-98
     * This is collection received from 'd2c_order_summary_container' that holds all the user information captured during checkout
     * @type {Array}
     */
    @api
    customerSummary;

    /**
     * NBD2C-98
     * This variable is used to control loading spinner
     * @type {Boolean}
     */
    _isLoading = true;

    /**
     * NBD2C-98
     * This variable is used to control visibility of order summary
     * @type {Boolean}
     */
    _showOrderSummary = false;

    /**
     * NBD2C-98
     * This variable holds the calender icon
     * @type {String}
     */
    _calenderLogo = storeResource + '/icons/calendar.svg';

    /**
     * NBD2C-98
     * This variable holds the location icon
     * @type {String}
     */
    _locationLogo = storeResource + '/icons/retailerLogo.svg';

    /**
     * NBD2C-98
     * This variable is used to control the component visibility
     * @type {String}
     */
    _showComponent = false;

    /**
     * NBD2C-98
     * This collection variable contains all of the labels that needs to be shown on UI
     * @type {Object}
     */
    @track
    _labels = {
        retailerHeaderLabel: order_summary_labels.split(';')[0],
        personalDetailsLabel: order_summary_labels.split(';')[1],
        nameFieldLabel: order_summary_labels.split(';')[2],
        emailFieldLabel: order_summary_labels.split(';')[3],
        phoneFieldLabel: order_summary_labels.split(';')[4],
        appointmentFieldLabel: order_summary_labels.split(';')[5],
        orderSummaryHeaderLabel: order_summary_labels.split(';')[6],
        frameColorFieldLabel: order_summary_labels.split(';')[7],
        quantityFieldLabel: order_summary_labels.split(';')[8],
        priceFieldLabel: order_summary_labels.split(';')[9],
        totalPriceLabel: order_summary_labels.split(';')[10],
        priceHelpTextLabel: order_summary_labels.split(';')[11],
        loadingSpinnerAlternateText: order_summary_labels.split(';')[12]
    };

    connectedCallback() {
        //If checkoutSummary collection and labels are ready, rendering the 'd2c_order-summary' component
        if (this.customerSummary && this._labels) {
            this._showOrderSummary = true;
        }
    }

    /**
     * NBD2C-98
     * This is an event handler method that handles event of loading and operates loading spinner on UI
     */
    handleLoading(event) {
        if (
            event &&
            event.detail &&
            event.detail.performLoading != null &&
            event.detail.performLoading != undefined &&
            event.detail.isComponentReady != null &&
            event.detail.isComponentReady != undefined
        ) {
            this._isLoading = event.detail.performLoading;
            this._showComponent = event.detail.isComponentReady;
        }
    }
}
