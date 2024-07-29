import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { FlowAttributeChangeEvent, FlowNavigationNextEvent } from 'lightning/flowSupport';

import COMMUNITYID from '@salesforce/community/Id';

import fetchInitValues from '@salesforce/apex/B2B_CheckoutController.fetchInitValues';

// LABELS
import nextButton from '@salesforce/label/c.B2B_CO_Next_Button';
import processingErrorTitle from '@salesforce/label/c.B2B_CO_Processing_Error';
import altPleaseWait from '@salesforce/label/c.B2B_CO_Please_Wait';

export default class B2bCheckoutSinglePage extends LightningElement {
    @api cartId;
    @api effectiveAccountId;

    // User entered
    @api billingContactPointAddressId;
    @api hideCardExpirationMonth = false;
    @api hideCardHolderName = false;
    @api hideCardType = false;
    @api hideCreditCardBillingAddress = false;
    @api hideCVV = false;
    @api hideExpirationYear = false;
    @api hidePurchaseOrderBillingAddress = false;
    @api paymentGatewayId;
    @api purchaseOrderNumber;
    @api requireCardExpirationMonth;
    @api requireCardExpirationYear;
    @api requireCardType;
    @api requireCardholderName;
    @api requireCreditCardBillingAddress;
    @api requireCVV;
    @api requirePurchaseOrderBillingAddress;
    @api paymentType;
    @api makeComponentReadOnly;

    @api shippingContactPointAddressId;
    @api shippingInstructions;

    // Component display options
    @api hideShipToSection = false;
    @api hideDeliveryMethodSelection = false; // Use the no-charge option when true
    @api hidePaymentMethodSection = false;
    @api hideCartSummarySection = false;

    // Ship To options
    @api hideDeliveryInstructions = false;
    @api hideShippingAddressSelection = false;
    @api hideShippingAddressManualEntry = false;

    // Payment options as determined by the admin
    @api hidePurchaseOrderPaymentOption = false;
    @api hideCreditCardPaymentOption = false;

    // FFEIX[03/11/22] : Add flow output value for Card
    @api nameOnCard;
    @api cardType;
    @api cardNumber;
    @api cvv;
    @api expiryMonth;
    @api expiryYear;
    // FFEIX:END

    @api useDefaultDeliveryMethod = false;
    @api useDefaultTaxRate = false;

    @api autoLaunchEditShipToAddressDialog = false;

    @api
    availableActions = [];

    communityId = COMMUNITYID;

    @api webstoreId;

    // Used to determine if/when the cart summary may be loaded
    isShipToLocationSet = false;
    isDeliveryMethodSet = false;

    @track showLoadingSpinner = false;

    // Custom Labels
    labels = {
        toast: {
            processingErrorTitle: processingErrorTitle
        },
        component: {
            nextButton: nextButton,
            altPleaseWait: altPleaseWait
        }
    };

    constructor() {
        super();

        this.template.addEventListener('loadingspinner', this.handleSpinnerEvent.bind(this));

        this.template.addEventListener('reloadsummary', this.handleReloadSummaryEvent.bind(this));
    }

    connectedCallback() {
        this.doInit();
    }

    doInit() {
        this.showLoadingSpinner = true;

        fetchInitValues({
            communityId: this.communityId,
            effectiveAccountId: this.effectiveAccountId
        })
            .then((result) => {
                this.showLoadingSpinner = false;

                if (result) {
                    if (result.webstoreId) {
                        this.webstoreId = result.webstoreId;
                    }

                    if (result.effectiveAccountId) {
                        this.effectiveAccountId = result.effectiveAccountId;
                    }

                    if (result.cartId) {
                        this.cartId = result.cartId;

                        // Does the initial retrieve of the cart summary.
                        // A custom event will be thrown whenever the ship to or carrier is changed to reload the cart summary.

                        const comp = this.template.querySelector('c-b2b_checkout-cart-summary');
                        if (comp) {
                            comp.setProperties(this.webstoreId, this.effectiveAccountId, this.cartId);
                            comp.loadCartSummary(true);
                        } else {
                            console.log('child component not found (c-b2b_checkout-cart-summary)!');
                        }

                        // The cart summary will be loaded after the ship to addresses are loaded and a default address is applied (or not)

                        const comp2 = this.template.querySelector('c-b2b_checkout-delivery-method-selection');
                        if (comp2) {
                            comp2.setProperties(this.webstoreId, this.effectiveAccountId, this.cartId);
                            comp2.loadDeliveryMethods();
                        } else {
                            console.log('child component not found (c-b2b_checkout-delivery-method-selection)!');
                        }

                        // Set the default ship to address, so that tax will be displayed when a default ship to is designated
                        // if the ship to address is not already set, the method will send an event to reload the cart summary
                        // const comp3 = this.template.querySelector('c-b2b_checkout-ship-to-input');
                        // if(comp3) {
                        //     comp3.setCartDeliveryGroupDefaultAddress();
                        // }
                        // else {
                        //     console.log('child component not found (c-b2b_checkout-ship-to-input)!');
                        // }
                    }
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

    handleSpinnerEvent(event) {
        this.showLoadingSpinner = event.detail;
    }

    handleReloadSummaryEvent(event) {
        if (this.isShipToLocationSet && this.isDeliveryMethodSet) {
            const comp = this.template.querySelector('c-b2b_checkout-cart-summary');
            if (comp) {
                comp.setProperties(this.webstoreId, this.effectiveAccountId, this.cartId);
                comp.loadCartSummary(true);
            } else {
                console.log('child component not found (c-b2b_checkout-cart-summary)!');
            }
        } else {
            console.log('isShipToLocationSet and isDeliveryMethodSet are not both true');
        }
    }

    // Drives the reload of the cart summary
    handleShippingAddressChange(event) {
        this.shippingContactPointAddressId = event.detail;
        this.isShipToLocationSet = true;

        this.handleReloadSummaryEvent(null);
    }

    // Drives the reload of the cart summary
    handleDeliveryMethodChange(event) {
        this.isDeliveryMethodSet = true;

        this.handleReloadSummaryEvent(null);
    }

    handleShippingInstructionsChange(event) {
        this.shippingInstructions = event.detail;
    }

    handlePaymentTypeChange(event) {
        this.paymentType = event.detail;
    }

    handlePoChange(event) {
        this.purchaseOrderNumber = event.detail;
    }

    // Probably don't need these

    handleNameChange(event) {
        this.nameOnCard = event.detail;
    }

    handleCardTypeChange(event) {
        this.cardType = event.detail;
    }

    handleCardNumberChange(event) {
        this.cardNumber = event.detail;
    }

    handleCVVChange(event) {
        this.cvv = event.detail;
    }

    handleExpiryMonthChange(event) {
        this.expiryMonth = event.detail;
    }

    handleExpiryYearChange(event) {
        this.expiryYear = event.detail;
    }

    handleBillingAddressChange(event) {
        const selectedAddress = event.detail;

        this.billingContactPointAddressId = selectedAddress;
    }

    handleGoNext() {
        // var attributeChangeEvent = new FlowAttributeChangeEvent('newStreet', this.newStreet);
        // this.dispatchEvent(attributeChangeEvent);

        // attributeChangeEvent = new FlowAttributeChangeEvent('newCity', this.newCity);
        // this.dispatchEvent(attributeChangeEvent);

        // attributeChangeEvent = new FlowAttributeChangeEvent('newState', this.newState);
        // this.dispatchEvent(attributeChangeEvent);

        // attributeChangeEvent = new FlowAttributeChangeEvent('newPostalCode', this.newPostalCode);
        // this.dispatchEvent(attributeChangeEvent);

        // attributeChangeEvent = new FlowAttributeChangeEvent('newCountry', this.newCountry);
        // this.dispatchEvent(attributeChangeEvent);

        // attributeChangeEvent = new FlowAttributeChangeEvent('newPhone', this.newPhone);
        // this.dispatchEvent(attributeChangeEvent);

        // attributeChangeEvent = new FlowAttributeChangeEvent('newFax', this.newFax);
        // this.dispatchEvent(attributeChangeEvent);

        const comp1 = this.template.querySelector('c-b2b_checkout-ship-to-input');
        if (comp1) {
            let isValid = comp1.validateAddressSelection();
            if (isValid === false) {
                return;
            }
        }

        const comp2 = this.template.querySelector('c-b2b_checkout-delivery-method-selection');
        if (comp2) {
            let isValid = comp2.validateDeliveryMethodSelection();
            if (isValid === false) {
                return;
            }
        }

        if (this.hidePaymentMethodSection == false) {
            const comp3 = this.template.querySelector('c-b2b_checkout-payment');
            if (comp3) {
                let isValid = comp3.validateAddressSelection();
                if (isValid === false) {
                    return;
                }
            }
        }

        // check if NEXT is allowed on this screen
        if (this.availableActions.find((action) => action === 'NEXT')) {
            // navigate to the next screen
            const navigateNextEvent2 = new FlowNavigationNextEvent();

            this.dispatchEvent(navigateNextEvent2);
        }
    }
}
