import { LightningElement, track, api, wire } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import getCartSummary from '@salesforce/apex/B2B_CartController.getCartSummary';
import communityId from '@salesforce/community/Id';
import orderSummary from '@salesforce/label/c.B2B_Checkout_Order_Summary';
import shippingPayment from '@salesforce/label/c.B2B_Checkout_Shipping_Payment';
import orderConfirmation from '@salesforce/label/c.B2B_Checkout_Order_Confirmation';
import proceedToOrder from '@salesforce/label/c.B2B_Checkout_Proceed_To_Order_Summary';
import partialDeleveryAllowed from '@salesforce/label/c.B2B_Checkout_Partial_Shipping_Allowed';
import partialDeleveryNotAllowed from '@salesforce/label/c.B2B_Checkout_Partial_Shipping_Not_Allowed';
import getAccountInfos from '@salesforce/apex/B2B_CheckoutController.getAccountInfos';
import getAddressInfo from '@salesforce/apex/B2B_CheckoutController.getAddressInfo';
import partialDelevery from '@salesforce/label/c.B2B_Checkout_Partial_Delevery';
import shippingAddresses from '@salesforce/label/c.B2B_Checkout_Shipping_Addresses';
import shipTo from '@salesforce/label/c.B2B_Checkout_Ship_To';
import billingAccount from '@salesforce/label/c.B2B_Checkout_Billing_Account';
import billingMethod from '@salesforce/label/c.B2B_Checkout_Billing_Method';
import backButton from '@salesforce/label/c.B2B_Checkout_Back_Button';
import internalPONumber from '@salesforce/label/c.B2B_Checkout_Internal_PO_Number';
import INTERNAL_PO_NUMBER_HELP_TEXT from '@salesforce/label/c.B2B_PO_Number_HelpText'; //BS-488
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-488
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import B2B_DEFAULT_CURRENCY_ISO_CODE from '@salesforce/label/c.B2B_DEFAULT_CURRENCY_ISO_CODE'; //Added as part of BS-1245

//Constant
const CART = 'Active';
const CURRENCYCODE = 'USD';
const ZERO_PRODUCT = '0';
const CART_SUMMARY_EVENT = 'cartsummaryloaded'; //BS-1245

export default class B2b_checkoutShippingAndPayment extends NavigationMixin(LightningElement) {
    @api effectiveAccountId;
    @api cartId;
    @api addressInputType;
    @api prices;
    @api poNumber;

    @track
    checkoutStepsList = [
        { label: orderSummary, active: true }, //BS-1691
        { label: orderConfirmation, active: false }
    ];

    @track accountRecord;
    @track addressIdVsAddressMap;
    @track cartSummary;
    @track oldPoNumber;

    infoSVG = STORE_STYLING + '/icons/INFO.svg'; //added as a part of BS-488

    /**
     * BS-1094
     * variable to store the updated total price.
     *  @type {number}
     */
    @api
    updatedTotalPrice; //BS-1094
    /**
     * BS-496
     * Input parameter to stop lightning spinner
     *  @type {boolean}
     */
    _stopLoading;

    @track billingAddress;
    defaultAddress;
    selectedAddress;

    // To be displayed in a radio button group
    addresses = [];

    /**
     * Variable holds the default currency ISO Code
     * BS-1245
     *  @type {String}
     */
    _defaultCurrencyIsoCode = B2B_DEFAULT_CURRENCY_ISO_CODE;

    //Labels
    labels = {
        proceedToOrder: proceedToOrder,
        partialDeleveryAllowed: partialDeleveryAllowed,
        partialDeleveryNotAllowed: partialDeleveryNotAllowed,
        partialDelevery: partialDelevery,
        shippingAddresses: shippingAddresses,
        shipTo: shipTo,
        billingAccount: billingAccount,
        billingMethod: billingMethod,
        backButton: backButton,
        internalPONumber: internalPONumber,
        internalPONumberHelpText: INTERNAL_PO_NUMBER_HELP_TEXT // BS-488
    };

    /**
     * Gets the normalized effective account of the user.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get resolvedEffectiveAccountId() {
        const effectiveAccountId = this.effectiveAccountId || '';
        let resolved = null;
        if (effectiveAccountId.length > 0 && effectiveAccountId !== '000000000000000') {
            resolved = effectiveAccountId;
        }
        return resolved;
    }

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    accountInfo({ data, error }) {
        if (data) {
            this.billingAddress = {
                k_Billing_Name__c: data.fields.k_Billing_Name__c.label,
                k_Billing_Street__c: data.fields.k_Billing_Street__c.label,
                k_Billing_Postal_Code__c: data.fields.k_Billing_Postal_Code__c.label,
                k_Billing_City__c: data.fields.k_Billing_City__c.label,
                k_Billing_Country__c: data.fields.k_Billing_Country__c.label
            };
        }
    }

    //This method gets the contact point addresses
    loadAddresses() {
        getAddressInfo({
            effectiveAccountId: this.effectiveAccountId,
            isShipping: true,
            isBilling: false
        })
            .then((result) => {
                this.processResult(result);
                this._stopLoading = true; //Bs-496
            })
            .catch((error) => {
                this.processError(error);
                this._stopLoading = true; //Bs-496
            });
    }

    //This method will store the address results
    processResult(result) {
        if (result) {
            if (result.addresses && result.addresses.length > 0) {
                this.addresses = result.addresses;
            }
        }
        this.processMessages(result);
        this.navigateToOrderSummary(); //BS-1691
    }

    //To get the formated address options
    get options() {
        let addressOptions = [];
        let aaddressIdVsAddressMap = new Map();
        let isDefaultAvailable = false; //BS-2131
        //fix checkout
        if (this.addresses !== undefined && this.addresses !== null) {
            this.addresses.forEach((address) => {
                const addr = address;
                let opt = {};
                let label = '';
                if (addr != undefined && addr !== null && addr.Address !== undefined && addr.Address !== null) {
                    if (addr.Address.street != undefined) {
                        label = label + addr.Address.street + ', ';
                    }
                    if (addr.Address.city != undefined) {
                        label += addr.Address.city + ', ';
                    }
                    if (addr.Address.state != undefined) {
                        label += addr.Address.state + ', ';
                    }
                    if (addr.Address.postalCode != undefined) {
                        label += addr.Address.postalCode + ', ';
                    }
                    if (addr.Address.country != undefined) {
                        label += addr.Address.country;
                    }

                    opt.label = label.replace(/,*$/, ' ');
                    opt.value = addr.Id;
                    aaddressIdVsAddressMap.set(opt.value, opt.label);
                    if (address.IsDefault) {
                        isDefaultAvailable = true;
                        addressOptions.unshift(opt);
                    } else {
                        addressOptions.push(opt);
                    } //BS-2131
                }
            });
        }

        this.addressIdVsAddressMap = aaddressIdVsAddressMap;
        /** If only one shipping address is available, the radio button should be preselected.
         * @author: Aman Kumar
         BS-1173*/
        if (addressOptions.length === 1 && (this.selectedAddress == null || this.selectedAddress == undefined)) {
            this.addressInputType = addressOptions[0].value;
            this.navigateToOrderSummary(); //BS-1691
        } else if (addressOptions.length > 1 && isDefaultAvailable == true && (this.selectedAddress == null || this.selectedAddress == undefined)) {
            this.addressInputType = addressOptions[0].value;
            this.navigateToOrderSummary();
        } //BS-2131
        return addressOptions;
    }

    //Will get the total price
    get prices() {
        //BS-1094 updated the logic to show the price on the checkout.
        let updatedPrice = this.cartSummary && this.cartSummary.totalProductAmount ? this.cartSummary.totalProductAmount : 0;
        if (this.updatedTotalPrice != null && this.updatedTotalPrice != undefined) {
            updatedPrice = this.updatedTotalPrice;
        }

        return {
            originalPrice: this.cartSummary && this.cartSummary.totalListPrice,
            finalPrice: updatedPrice,
            currencyIsoCode:
                this.cartSummary && this.cartSummary.currencyIsoCode ? this.cartSummary && this.cartSummary.currencyIsoCode : this._defaultCurrencyIsoCode //BS-1245
        };
    }

    //Will show the error On UI if No Address is selected
    processError(error) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: this.labels.toast.processingErrorTitle,
                message: error.body.message,
                variant: 'error'
            })
        );
    }

    //Will show the messages on UI
    processMessages(result) {
        if (result.messagesJson) {
            let messages = JSON.parse(result.messagesJson);
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

    //It will load the breadcrumbs component, Addresses, cart
    connectedCallback() {
        let checkoutSteps = this.checkoutStepsList;
        this.dispatchEvent(
            new CustomEvent('load', {
                detail: {
                    checkoutSteps
                }
            })
        );
        this.oldPoNumber = this.poNumber;
        this.getUpdatedCartSummary();
        this.loadAddresses();
    }

    //Will set the selected address
    handleAddressInputTypeChange(event) {
        const value = event.detail.value;
        this.addressInputType = value;
        this.selectedAddress = event.detail.value;
        this.navigateToOrderSummary(); //BS-1691
    }

    //will return purchase order number
    get purchaseOrderNumber() {
        return this.poNumber;
    }

    //Nevigate to order summary with collected input
    navigateToOrderSummary() {
        let isOrderSummary = true;
        let selectedAddress = this.addressInputType;
        let accountRecord = this.accountRecord;
        let selectedAddressLabel = this.addressIdVsAddressMap.get(this.addressInputType);
        let cartId = this.cartId;
        let prices = this.prices;
        let poNumber = this.purchaseOrderNumber;
        this.dispatchEvent(
            new CustomEvent('loadordersummary', {
                detail: {
                    isOrderSummary,
                    selectedAddress,
                    accountRecord,
                    selectedAddressLabel,
                    cartId,
                    prices,
                    poNumber
                }
            })
        );
    }

    @wire(getAccountInfos, { effectiveAccountId: '$resolvedEffectiveAccountId' })
    wiredRecord({ error, data }) {
        if (data) {
            this.accountRecord = data;
            if (this.accountRecord.k_Partial_Delivery__c == '1') {
                this.isPartialDeleveryAllowed = true;
            } else {
                this.isPartialDeleveryAllowed = false;
            }
        }
    }

    /**
     * BS-1691
     * Handle Shipping address validation
     */
    @api
    handleShippingAdressValidation() {
        this.isInputValid();
    }

    get _account() {
        return { id: this.account.data.Id, shipping: this.account.data.k_Partial_Delivery__c };
    }

    backToCart(event) {
        this.navigateToCart(this.cartId);
    }

    /**
     * Given a cart id, navigate to the record page
     *
     * @private
     * @param{string} cartId - The id of the cart we want to navigate to
     */
    navigateToCart(cartId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: cartId,
                objectApiName: 'WebCart',
                actionName: 'view'
            }
        });
    }

    /**
     * Get cart summary from the server via imperative apex call
     */
    getUpdatedCartSummary() {
        getCartSummary({
            communityId: communityId,
            activeCartOrId: CART,
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
            .then((cartSummary) => {
                this.cartId = cartSummary.cartId;
                if (cartSummary.totalProductCount == ZERO_PRODUCT) {
                    this.backToCart();
                }
                this.cartSummary = cartSummary;
                this.fireSendUpdatedCartSummary(); //BS-1245
            })
            .catch((error) => {});
    }

    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach((inputField) => {
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }

    //To store the inputed PO Number value
    genericOnChange(event) {
        this.poNumber = event.target.value;
        this.navigateToOrderSummary(); //Bs-1691
    }

    /**
     * BS-1245
     * This method is used to fire event 'cartsummaryloaded' to parent component for sending cart-summary object.
     *
     */
    fireSendUpdatedCartSummary() {
        this.dispatchEvent(
            new CustomEvent(CART_SUMMARY_EVENT, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    cartSummary: this.cartSummary
                }
            })
        );
    }
}
