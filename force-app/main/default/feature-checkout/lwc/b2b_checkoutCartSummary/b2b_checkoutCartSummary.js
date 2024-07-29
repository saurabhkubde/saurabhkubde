import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import COMMUNITYID from '@salesforce/community/Id';
import CURRENCY from '@salesforce/i18n/currency';

import fetchInitValues from '@salesforce/apex/B2B_CheckoutController.fetchInitValues';
import getCartSummary from '@salesforce/apex/B2B_CheckoutController.getCartSummary';

// LABELS
import checkoutSummary from '@salesforce/label/c.B2B_CO_Checkout_Summary_Header';
import subtotal from '@salesforce/label/c.B2B_CO_Checkout_Subtotal';
import estimatedShipping from '@salesforce/label/c.B2B_CO_Checkout_Estimated_Shipping';
import estimatedTax from '@salesforce/label/c.B2B_CO_Checkout_Estimated_Tax';
import total from '@salesforce/label/c.B2B_CO_Checkout_Total';
import processingErrorTitle from '@salesforce/label/c.B2B_CO_Processing_Error';
import altPleaseWait from '@salesforce/label/c.B2B_CO_Please_Wait';

// FFEIX[03/11/22] : Add Promotion
import promotion from '@salesforce/label/c.B2B_CO_Promotion';
// FFEIX:END

export default class B2bCheckoutCartSummary extends LightningElement {
    // Custom Labels
    labels = {
        toast: {
            processingErrorTitle: processingErrorTitle
        },
        component: {
            checkoutSummary: checkoutSummary,
            subtotal: subtotal,
            estimatedTax: estimatedTax,
            estimatedShipping: estimatedShipping,
            total: total,
            altPleaseWait: altPleaseWait,
            // FFEIX[03/11/22] : Add Promotion
            promotion: promotion
            // FFEIX:END
        }
    };

    communityId = COMMUNITYID;
    currency = CURRENCY;

    @api effectiveAccountId;
    @api cartId;
    @api webstoreId;
    @api useDefaultTaxRate;
    @api hideCartSummarySection;

    @track subtotal = 0.0;
    // FFEIX[03/11/22] : Add Promotion
    @track promotion = 0.0;
    // FFEIX:END
    @track estShipping = 0.0;
    @track estTax = 0.0;
    @track total = 0.0;

    @track showLoadingSpinner = false;

    connectedCallback() {
        //this.loadCartSummary();
        //this.doInit();
    }

    doInit() {
        fetchInitValues({
            communityId: this.communityId,
            effectiveAccountId: this.effectiveAccountId,
            cartId: null
        })
            .then((result) => {
                if (result) {
                    this.webstoreId = result.webstoreId;
                    this.effectiveAccountId = result.effectiveAccountId;
                    this.cartId = result.cartId;

                    this.loadCartSummary(false);
                }
            })
            .catch((error) => {
                this.showLoadingSpinner = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: this.labels.toast.processingErrorTitle,
                        message: error.message,
                        variant: 'error'
                    })
                );
            });
    }

    @api
    setProperties(webstoreId, effectiveAccountId, cartId) {
        this.webstoreId = webstoreId;
        this.effectiveAccountId = effectiveAccountId;
        this.cartId = cartId;
    }

    @api
    loadCartSummary(recalculateTax) {
        const customEvent = new CustomEvent('loadingspinner', {
            detail: true,
            bubbles: true
        });

        this.dispatchEvent(customEvent);

        getCartSummary({
            effectiveAccountId: this.effectiveAccountId,
            webstoreId: this.webstoreId,
            activeOrCartId: this.cartId,
            recalculateTax: recalculateTax,
            useDefaultRate: this.useDefaultTaxRate
        })
            .then((result) => {
                this.processResult(result);
            })
            .catch((error) => {
                this.processError(error);
            });
    }

    processResult(result) {
        //this.showLoadingSpinner = false;

        const customEvent = new CustomEvent('loadingspinner', {
            detail: false,
            bubbles: true
        });

        this.dispatchEvent(customEvent);

        if (result) {
            this.processResults(result);
        }

        this.processMessages(result);
    }

    processResults(result) {
        this.total = result.grandTotalAmount;
        this.estTax = result.totalTaxAmount;
        this.subtotal = result.totalProductAmount;

        // FFEIX[03/11/22] : Add Promotion
        this.promotion = result.totalPromotionalAdjustmentAmount;
        // FFEIX:END

        // FFEIX[03/11/22] : Convert String to Integer
        //this.estShipping = result.shippingFee;
        this.estShipping = result.shippingFee.replace(',', '.');
        // FFEIX:END
    }

    processError(error) {
        let message = error.body ? error.body.message : error;

        //this.showLoadingSpinner = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: this.labels.toast.processingErrorTitle,
                message: message,
                variant: 'error'
            })
        );
    }

    processMessages(result) {
        if (result.messagesJson) {
            let messages = JSON.parse(result.messagesJson);

            // Process messages returned
            // Display toasts when applicable
            // Create content for the details section

            for (var i = 0; i < messages.length; i++) {
                var message = messages[i];

                if (message.toast === true) {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: message.title,
                            message: message.message,
                            variant: message.severity
                        })
                    );
                }
            }
        }
    }
}
