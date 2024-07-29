import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import COMMUNITYID from '@salesforce/community/Id';

import fetchInitValues from '@salesforce/apex/B2B_CheckoutController.fetchInitValues';
import getAddressInfo from '@salesforce/apex/B2B_CheckoutController.getAddressInfo';
import setCartDeliveryGroupShipToAddress from '@salesforce/apex/B2B_CheckoutController.setCartDeliveryGroupShipToAddress';
import fetchCartDeliveryGroupAddress from '@salesforce/apex/B2B_CheckoutController.fetchCartDeliveryGroupAddress';

// LABELS
import shipToSectionHeader from '@salesforce/label/c.B2B_CO_Ship_To_Section_Header';
import shipToDeliveryInstructions from '@salesforce/label/c.B2B_CO_Delivery_Instructions';
import shipToRequestedDate from '@salesforce/label/c.B2B_CO_Requested_Date';
import requestedDatePlaceholder from '@salesforce/label/c.B2B_CO_Requested_Date_Placeholder';
import deliveryInstructionsPlaceholder from '@salesforce/label/c.B2B_CO_Delivery_Instructions_Placeholder';
import enterAddress from '@salesforce/label/c.B2B_CO_Ship_To_Enter_Address_Button';
import cancelAddressDialog from '@salesforce/label/c.B2B_CO_Cancel';
import saveAddressDialog from '@salesforce/label/c.B2B_CO_Save';
import addressBookOption from '@salesforce/label/c.B2B_CO_Ship_To_Address_book_option';
import manualEntryOption from '@salesforce/label/c.B2B_CO_Ship_To_Manual_Entry_option';
import addressNotSelected from '@salesforce/label/c.B2B_CO_Ship_To_Address_not_defined';
import enterRequiredFields from '@salesforce/label/c.B2B_CO_Ship_To_Enter_Required_Fields';
import selectAddress from '@salesforce/label/c.B2B_CO_Ship_To_Select_Address';
import requiredInformationMissing from '@salesforce/label/c.B2B_CO_Required_Information_Missing';
import processingErrorTitle from '@salesforce/label/c.B2B_CO_Processing_Error';
import altPleaseWait from '@salesforce/label/c.B2B_CO_Please_Wait';

export default class B2bCheckoutShipToInput extends LightningElement {
    // Custom Labels
    labels = {
        toast: {
            processingErrorTitle: processingErrorTitle,
            addressNotSelected: addressNotSelected,
            requiredInformationMissing: requiredInformationMissing,
            selectAddress: selectAddress,
            enterRequiredFields: enterRequiredFields
        },
        component: {
            shipToSectionHeader: shipToSectionHeader,
            shipToDeliveryInstructions: shipToDeliveryInstructions,
            shipToRequestedDate: shipToRequestedDate,
            requestedDatePlaceholder: requestedDatePlaceholder,
            deliveryInstructionsPlaceholder: deliveryInstructionsPlaceholder,
            enterAddress: enterAddress,
            addressBookOption: addressBookOption,
            manualEntryOption: manualEntryOption,
            altPleaseWait: altPleaseWait,
            cancelAddressDialog: cancelAddressDialog,
            saveAddressDialog: saveAddressDialog
        }
    };

    @api effectiveAccountId;
    @api cartId;
    @api webstoreId;

    // User entered
    @api shippingContactPointAddressId;
    @api shippingInstructions;

    @api addressInputType;

    @api makeComponentReadOnly;

    // To be displayed in a radio button group
    addresses = [];
    defaultAddress;
    selectedAddress;

    // address manual entry fields
    @api companyName;
    @api streetAddress1;
    @api country;
    @api city;
    @api stateProvince;
    @api postalCode;

    // Component display options
    @api hideShipToSection;
    @api hideDeliveryInstructions;
    @api hideShippingAddressSelection;
    @api hideShippingAddressManualEntry;

    @api autoLaunchEditShipToAddressDialog;

    @api requestedDeliveryDate;

    communityId = COMMUNITYID;

    connectedCallback() {
        // We need the cartId so that when we default the address on the cart delivery group, tax can be calculated.
        this.doInit();
    }

    doInit() {
        fetchInitValues({
            communityId: this.communityId,
            effectiveAccountId: this.effectiveAccountId,
            cartId: this.cartId
        })
            .then((result) => {
                if (result) {
                    if (result.webstoreId) {
                        this.webstoreId = result.webstoreId;
                    }

                    if (result.cartId) {
                        this.cartId = result.cartId;
                    }

                    if (result.effectiveAccountId) {
                        this.effectiveAccountId = result.effectiveAccountId;

                        this.loadAddresses();
                        this.getCartDeliveryGroupAddress();
                    }
                }
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: this.labels.toast.processingErrorTitle,
                        message: error.message,
                        variant: 'error'
                    })
                );
            });
    }

    loadAddresses() {
        getAddressInfo({
            effectiveAccountId: this.effectiveAccountId,
            isShipping: true,
            isBilling: false
        })
            .then((result) => {
                this.processResult(result);
            })
            .catch((error) => {
                this.processError(error);
            });
    }

    processResult(result) {
        if (result) {
            this.processResults(result);
        }

        this.processMessages(result);
    }

    processResults(result) {
        if (result.addresses && result.addresses.length > 0) {
            this.addresses = result.addresses;
        }

        let id;

        if (result.defaultAddress) {
            id = result.defaultAddress;
        } else {
            if (this.addresses.length > 0) {
                id = this.addresses[0].Id;
            }
        }

        this.defaultAddress = id;
        this.selectedAddress = id;

        // The account may have a default ContactPointAddress defined.
        // When that is the case, the user will see that address selected in the component.
        // That results in the user seeing no sales tax calculated.
        // An option would be for the parent component to call the child to set the default.
        // The other option would be to force an update to the CartDeliveryGroup upon component load.
        // Currently the Apex method does not identify what address has been selected before.
        // The workaround here is to force an update to the CartDeliveryGroup when the component is loaded.

        // This will ensure that the CartDeliveryGroup has an address from the beginning
        // and that sales tax will be a value other than zero.
        // This doesn't work because initially, this component doesn't have the cartId
        // Retrieving the addresses only requires the effectiveAccountId.
        // this.updateCartDeliveryGroupShipToAddress(id);

        this.setCartDeliveryGroupDefaultAddress();
    }

    get options() {
        let addressOptions = [];

        for (let i = 0; i < this.addresses.length; i++) {
            const addr = this.addresses[i];
            let opt = {};
            opt.label =
                addr.Address.street + ', ' + addr.Address.city + ', ' + addr.Address.state + ', ' + addr.Address.postalCode + ' ' + addr.Address.country;
            opt.value = addr.Id;

            addressOptions.push(opt);
        }

        return addressOptions;
    }

    processError(error) {
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

    handleAddressChange(event) {
        const selectedAddress = event.detail.value;

        this.selectedAddress = selectedAddress;
        this.shippingContactPointAddressId = selectedAddress;

        // Update the CartDeliveryGroup

        this.updateCartDeliveryGroupShipToAddress(selectedAddress);
    }

    // Called by the parent component
    setCartDeliveryGroupDefaultAddress() {
        if (this.shippingContactPointAddressId === undefined || this.shippingContactPointAddressId === null) {
            const defaultAddressId = this.defaultAddress;

            this.updateCartDeliveryGroupShipToAddress(defaultAddressId);
        } else {
            this.updateCartDeliveryGroupShipToAddress(this.shippingContactPointAddressId);
        }
    }

    // Update the CartDeliveryGroup record to have the address fields from the selected address.
    updateCartDeliveryGroupShipToAddress(contactPointAddressId) {
        setCartDeliveryGroupShipToAddress({
            contactPointAddress: contactPointAddressId,
            cartId: this.cartId
        })
            .then((result) => {
                this.processMessages(result);

                // Send the change to the containing component
                const customEvent2 = new CustomEvent('shippingaddresschange', {
                    detail: contactPointAddressId,
                    bubbles: true,
                    composed: true
                });

                this.dispatchEvent(customEvent2);
            })
            .catch((error) => {
                this.processError(error);
            });
    }

    get displayDeliveryInstructions() {
        if (this.hideDeliveryInstructions !== undefined) {
            if (this.hideDeliveryInstructions === true) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    get displayShippingAddressSelection() {
        if (this.hideShippingAddressSelection !== undefined) {
            if (this.hideShippingAddressSelection === true) {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    get addressInputMethods() {
        let theOptions = [];

        if (this.hideShippingAddressSelection === false) {
            theOptions.push({ label: this.labels.component.addressBookOption, value: 'select' });
        }

        // Default the selected option
        if (theOptions.length > 0) {
            if (this.addressInputType !== undefined) {
            } else {
                this.addressInputType = theOptions[0].value;
            }
        }

        return theOptions;
    }

    get isSelect() {
        if (this.addressInputType == 'select') {
            return true;
        } else {
            return false;
        }
    }

    get isManual() {
        if (this.addressInputType == 'manual') {
            return true;
        } else {
            return false;
        }
    }

    handleShippingInstructionsChange(event) {
        const value = event.detail.value;

        this.shippingInstructions = value;

        const selectedEvent = new CustomEvent('shippinginstructionschange', { detail: event.detail.value, bubbles: true, composed: true });

        this.dispatchEvent(selectedEvent);
    }

    handleRequestDate(event) {
        const value = event.detail;
        this.requestedDeliveryDate = value;
    }

    handleAddressInputTypeChange(event) {
        const value = event.detail.value;
        this.addressInputType = value;

        // const customEvent = new CustomEvent('shiptoentrytypechange', {
        //     detail : value, bubbles : true, composed: false
        // });

        // this.dispatchEvent(customEvent);
    }

    getCartDeliveryGroupAddress() {
        fetchCartDeliveryGroupAddress({
            cartId: this.cartId
        })
            .then((result) => {
                if (result && result.cartDeliveryGroup) {
                    const cdg = result.cartDeliveryGroup;

                    if (cdg.DeliverToName) {
                        this.companyName = cdg.DeliverToName;
                    }

                    if (cdg.DeliverToStreet) {
                        this.streetAddress1 = cdg.DeliverToStreet;
                    }

                    if (cdg.DeliverToCity) {
                        this.city = cdg.DeliverToCity;
                    }

                    if (cdg.DeliverToState) {
                        this.stateProvince = cdg.DeliverToState;
                    }

                    if (cdg.DeliverToPostalCode) {
                        this.postalCode = cdg.DeliverToPostalCode;
                    }

                    if (cdg.DeliverToCountry) {
                        this.country = cdg.DeliverToCountry;
                    }

                    // Automatically display the dialog after we retrieve the address info
                    if (this.autoLaunchEditShipToAddressDialog && this.hideShippingAddressManualEntry === false) {
                    }
                }
            })
            .catch((error) => {
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
    validateAddressSelection() {
        if (this.selectedAddress === undefined || this.selectedAddress === null) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: this.labels.toast.requiredInformationMissing,
                    message: this.labels.toast.selectAddress,
                    variant: 'error'
                })
            );

            return false;
        } else {
            return true;
        }
    }

    get displayShipToSection() {
        if (this.hideShipToSection === true) {
            return false;
        } else if (this.hideShippingAddressSelection === true && this.hideShippingAddressManualEntry === true) {
            return false;
        } else {
            return true;
        }
    }
}
