import { LightningElement, track, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

const TOTAL_PRICE_KEY = 'pricekey'; //Added as a part of BS-1521

export default class B2b_checkoutContainer extends LightningElement {
    @api effectiveAccountId;
    @api cartId;
    @api recordId;
    @api accountRecord;
    @api selectedAddress;
    @api selectedAddressLabel;
    @api prices;
    @api poNumber;

    @track checkoutStepsList;
    @track isPaymentAndShipping = true;
    @track isOrderSummary = false;
    @track isOrderConfirmation = false;

    /**
     * BS-1245
     * This variable is used to store cart summary response
     * @type {Object}
     */
    cartSummary;

    /**
     * Variable to store current url path
     * BS-1094
     * @type {String}
     */
    _urlPath;

    /**
     * Variable to store updated total price of cart
     * BS-1094
     * @type {String}
     */
    _updatedTotalPrice;

    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        this._urlPath = pageRef;

        /* Start : BS-1521 */
        if (localStorage.getItem(TOTAL_PRICE_KEY)) {
            this._updatedTotalPrice = decodeURIComponent(escape(atob(localStorage.getItem(TOTAL_PRICE_KEY))));
        }
        /* End : BS-1521 */
    }

    //get list of steps in checkout process
    get checkoutSteps() {
        return this.checkoutStepsList;
    }

    //load breadcrumbs
    loadBreadcrumbs(event) {
        this.checkoutStepsList = event.detail.checkoutSteps;
    }

    //load the checkout step
    loadStep(event) {
        if (event.detail.isOrderSummary) {
            this.isOrderSummary = true;
            this.isPaymentAndShipping = true; //Bs-1691
            this.isOrderConfirmation = false;
            this.accountRecord = event.detail.accountRecord;
            this.selectedAddress = event.detail.selectedAddress;
            this.selectedAddressLabel = event.detail.selectedAddressLabel;
            this.recordId = event.detail.cartId;
            this.prices = event.detail.prices;
            this.poNumber = event.detail.poNumber;
        } else if (event.detail.isOrderConfirmation) {
            this.isOrderSummary = false;
            this.isPaymentAndShipping = false;
            this.isOrderConfirmation = true;
        }
    }
    //load shipping and payment after clicking back from Order Summary
    loadShippingAndPayment(event) {
        this.isOrderSummary = false;
        this.isPaymentAndShipping = true;
        this.isOrderConfirmation = false;
        this.poNumber = event.detail.poNumber;
    }

    /**
     * BS-1245
     * This method is used to handle event 'cartsummaryloaded' dispatched from 'c/b2b_checkoutShippingAndPayment'
     *
     */
    handleCartSummaryUpdate(event) {
        if (event && event.detail) {
            this.cartSummary = event && event.detail && event.detail.cartSummary ? event.detail.cartSummary : null;
        }
    }

    /**
     * BS-1691
     * This method is used to handle validation of shipping address radio input field
     *
     */
    handleaAdressNotSelected() {
        this.template.querySelector('c-b2b_checkout-shipping-and-payment').handleShippingAdressValidation();
    }
}
