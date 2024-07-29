import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import COMMUNITYID from '@salesforce/community/Id';
import CURRENCY from '@salesforce/i18n/currency';

import fetchDeliveryMethods from '@salesforce/apex/B2B_CheckoutController.fetchDeliveryMethods';
import setCartItemDeliveryGroup from '@salesforce/apex/B2B_CheckoutController.setCartItemDeliveryGroup';
import fetchDefaultDeliveryMethod from '@salesforce/apex/B2B_CheckoutController.fetchDefaultDeliveryMethod';

// LABELS
import deliveryMethodSectionHeader from '@salesforce/label/c.B2B_CO_Delivery_Method_Section_Header';
import deliveryMethodNotSelected from '@salesforce/label/c.B2B_CO_Delivery_Method_Not_Selected';
import processingErrorTitle from '@salesforce/label/c.B2B_CO_Processing_Error';
import altPleaseWait from '@salesforce/label/c.B2B_CO_Please_Wait';

export default class B2bCheckoutDeliveryMethod extends LightningElement {
    // Custom Labels
    labels = {
        toast: {
            processingErrorTitle: processingErrorTitle,
            deliveryMethodNotSelected: deliveryMethodNotSelected
        },
        component: {
            deliveryMethodSectionHeader: deliveryMethodSectionHeader,
            altPleaseWait: altPleaseWait
        }
    };

    communityId = COMMUNITYID;
    currency = CURRENCY;

    effectiveAccountId;
    cartId;
    webstoreId;

    // To be displayed in a radio button group
    carrierOptions = [];
    defaultCarrierOption;
    selectedCarrierOption;

    cartDeliveryGroupMethodId;

    @api hideDeliveryMethodSelection;
    @api useDefaultDeliveryMethod;

    @api
    setProperties(webstoreId, effectiveAccountId, cartId) {
        this.webstoreId = webstoreId;
        this.effectiveAccountId = effectiveAccountId;
        this.cartId = cartId;
    }

    @api
    loadDeliveryMethods() {
        if (this.useDefaultDeliveryMethod === false) {
            fetchDeliveryMethods({
                cartId: this.cartId
            })
                .then((result) => {
                    this.processResult(result);
                })
                .catch((error) => {
                    this.processError(error);
                });
        }
        // 2021-02-05  msobczak: added
        else {
            fetchDefaultDeliveryMethod({
                cartId: this.cartId
            })
                .then((result) => {
                    this.processResult(result);
                })
                .catch((error) => {
                    this.processError(error);
                });
        }
    }

    processResult(result) {
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
        if (result.selectedDeliveryMethodId) {
            const id = result.selectedDeliveryMethodId;

            this.defaultCarrierOption = id;
            this.selectedCarrierOption = id;

            const customEvent = new CustomEvent('deliverymethodchange', {
                detail: true,
                bubbles: true
            });

            this.dispatchEvent(customEvent);
        }

        if (result.cartDeliveryGroupMethods) {
            const methods = result.cartDeliveryGroupMethods;

            let carriers = [];

            // Get Carriers from Methods' DeliveryMethod
            for (const method of methods) {
                carriers.push({
                    Name: method.DeliveryMethod.Carrier
                });
            }

            // Remove Duplicate Carrier entries
            const filteredCarriers = carriers.reduce((acc, current) => {
                const x = acc.find((item) => item.Name === current.Name);
                if (!x) {
                    return acc.concat([current]);
                } else {
                    return acc;
                }
            }, []);

            // Push Delivery Methods into new Carrier parent objects
            for (let carrier of filteredCarriers) {
                carrier.DeliveryMethods = [];

                for (const method of methods) {
                    let defaultVal = false;

                    if (method.DeliveryMethodId === this.defaultCarrierOption) {
                        defaultVal = true;
                    }

                    if (method.DeliveryMethod.Carrier === carrier.Name) {
                        carrier.DeliveryMethods.push({
                            Id: method.DeliveryMethodId,
                            CartDeliveryGroupMethodId: method.Id,
                            CartDeliveryGroupId: method.CartDeliveryGroupId,
                            ExternalProvider: method.ExternalProvider,
                            Name: method.Name,
                            ShippingFee: method.ShippingFee,
                            isDefault: defaultVal
                        });
                    }
                }
            }

            this.carrierOptions = filteredCarriers;
        }
    }

    handleCarrierSelectionChange(event) {
        const customEvent = new CustomEvent('loadingspinner', {
            detail: true,
            bubbles: true
        });

        this.dispatchEvent(customEvent);

        this.selectedCarrierOption = event.target.value;

        // Set the CartDeliveryGroupMethodId
        for (const option of this.carrierOptions) {
            for (const method of option.DeliveryMethods) {
                if (method.Id === this.selectedCarrierOption) {
                    this.cartDeliveryGroupMethodId = method.CartDeliveryGroupMethodId;
                    break;
                }
            }
        }

        setCartItemDeliveryGroup({
            cartDeliveryGroupMethodId: this.cartDeliveryGroupMethodId,
            deliveryMethodId: this.selectedCarrierOption,
            cartId: this.cartId
        })
            .then((result) => {
                const customEvent = new CustomEvent('deliverymethodchange', {
                    detail: true,
                    bubbles: true
                });

                this.dispatchEvent(customEvent);
            })
            .catch((error) => {
                this.processError(error);
            });
    }

    processError(error) {
        //this.showLoadingSpinner = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: this.labels.toast.processingErrorTitle,
                message: error.body.message,
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

            this.showProcessLog = true;
        }
    }

    @api
    validateDeliveryMethodSelection() {
        if (this.selectedCarrierOption === undefined || this.selectedCarrierOption === null) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: this.labels.toast.deliveryMethodNotSelected,
                    //message: error.body.message,
                    variant: 'error'
                })
            );

            return false;
        } else {
            return true;
        }
    }

    get displayDeliveryMethodSelection() {
        if (this.hideDeliveryMethodSelection !== undefined) {
            if (this.hideDeliveryMethodSelection === true) {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
}
