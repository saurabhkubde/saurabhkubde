import { LightningElement, track, wire, api } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation'; //BS-1691
import createOrder from '@salesforce/apex/B2B_CheckoutController.createOrder';
import orderSummary from '@salesforce/label/c.B2B_Checkout_Order_Summary';
import shippingPayment from '@salesforce/label/c.B2B_Checkout_Shipping_Payment';
import partialDelevery from '@salesforce/label/c.B2B_Checkout_Partial_Delevery';
import orderConfirmation from '@salesforce/label/c.B2B_Checkout_Order_Confirmation';
import sendOrder from '@salesforce/label/c.B2B_Checkout_Send_Order';
import communityId from '@salesforce/community/Id';
import proceedToOrder from '@salesforce/label/c.B2B_Checkout_Proceed_To_Order_Summary';
import partialDeleveryAllowed from '@salesforce/label/c.B2B_Checkout_Partial_Shipping_Allowed';
import partialDeleveryNotAllowed from '@salesforce/label/c.B2B_Checkout_Partial_Shipping_Not_Allowed';
import shippingAddresses from '@salesforce/label/c.B2B_Checkout_Shipping_Addresses';
import billingAccount from '@salesforce/label/c.B2B_Checkout_Billing_Account';
import billingMethod from '@salesforce/label/c.B2B_Checkout_Billing_Method';
import backButton from '@salesforce/label/c.B2B_Checkout_Back_Button'; //BS-1691
import internalPONumber from '@salesforce/label/c.B2B_Checkout_Internal_PO_Number';
import orderHeader from '@salesforce/label/c.B2B_ACC_OH_Order_Detail_Button';
import total from '@salesforce/label/c.B2B_CO_Checkout_Total';
import errorMessageLabel from '@salesforce/label/c.B2B_Something_Went_Wrong';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import HIDE_PURCHASE_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Purchase_Price__c'; //BS-2273

//CONSTANTS
const fields = [HIDE_PURCHASE_PRICE_FIELD];
const CHECKOUT_PAGE = 'Checkout Page';
const PAGE_SIZE = 100;
const CART_CHANGED_EVT = 'cartchanged';
const SH_STORE = 'silhouette'; //BS-1127
const TOTAL_PRICE_KEY = 'pricekey'; //Added as a part of BS-1521

export default class B2b_checkoutOrderSummary extends NavigationMixin(LightningElement) {
    //BS-1691 Added Navigation Mixin
    @api effectiveAccountId;
    @api accountRecord;
    @api selectedAddress;
    @api selectedAddressLabel;
    @api recordId;
    @api pageSource = CHECKOUT_PAGE;
    @api comId;
    @api prices;
    @api poNumber;
    _isSilhouetteStore; //BS-1127

    /**
     * Fetching account data from apex via wire call
     *  @type {object}
     */
    @wire(getRecord, { recordId: '$effectiveAccountId', fields })
    account;

    /**
     * BS-1245
     * This variable holds the cart summary object recieved from parent component 'c/b2b_checkoutContainer'
     *
     */
    @api
    cartSummary;

    /**
     * BS-1245
     * This variable holds the currency-Iso-code value
     * Converted to a getter as fix for BS-2308
     */
    get _applicableCurrencyIsoCode() {
        if (this.cartSummary && this.cartSummary.currencyIsoCode) {
            return this.cartSummary.currencyIsoCode;
        }
        return null;
    }

    checkoutStepsList = [
        { label: orderSummary, active: true },
        { label: orderConfirmation, active: false }
    ];

    @track
    _isSilhouetteStore = false;

    //Labels used to show on UIs
    labels = {
        proceedToOrder: proceedToOrder,
        partialDeleveryAllowed: partialDeleveryAllowed,
        partialDeleveryNotAllowed: partialDeleveryNotAllowed,
        partialDelevery: partialDelevery,
        shippingAddresses: shippingAddresses,
        billingAccount: billingAccount,
        billingMethod: billingMethod,
        backButton: backButton,
        internalPONumber: internalPONumber,
        sendOrder: sendOrder,
        orderHeader: orderHeader.split(',')[2],
        total: total,
        errorMessageLabel: errorMessageLabel
    };

    /**
     * get HIDE_PURCHASE_PRICE_FIELD value on account
     */
    get hidePurchasePriceField() {
        if (this.account && this.account.data) {
            return getFieldValue(this.account.data, HIDE_PURCHASE_PRICE_FIELD);
        }
        return true;
    }

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

    //Will get the communityId
    get comId() {
        return communityId;
    }

    /**
     * Sort order for items in a cart.
     * The default sortOrder is 'CreatedDateDesc'
     *    - CreatedDateAsc—Sorts by oldest creation date
     *    - CreatedDateDesc—Sorts by most recent creation date.
     *    - NameAsc—Sorts by name in ascending alphabetical order (A–Z).
     *    - NameDesc—Sorts by name in descending alphabetical order (Z–A).
     * @type {string}
     */
    sortParam = 'CreatedDateDesc';

    /**
     * Specifies the page token to be used to view a page of cart information.
     * If the pageParam is null, the first page is returned.
     * @type {null|string}
     */
    pageParam = null;

    //Load active breadcrumb for current step
    connectedCallback() {
        //BS-1245
        if (this.cartSummary && this.cartSummary.currencyIsoCode) {
            this._applicableCurrencyIsoCode = this.cartSummary.currencyIsoCode;
        }
        //BS-1245
        // BS-1127
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');
        currentStore.includes(SH_STORE) == true ? (this._isSilhouetteStore = true) : (this._isSilhouetteStore = false);

        let checkoutSteps = this.checkoutStepsList;
        this.dispatchEvent(
            new CustomEvent('load', {
                detail: {
                    checkoutSteps
                }
            })
        );
    }

    //Order Confirmation and Order creation
    orderConfirmation() {
        let isOrderConfirmation = true;
        /*Start : BS-1691*/
        if (this.selectedAddress == undefined || this.selectedAddress == null) {
            this.dispatchEvent(
                new CustomEvent('handleadressnotselected', {
                    bubbles: true,
                    composed: true,
                    cancelable: false
                })
            );
        } else {
            /*End : BS-1691*/
            createOrder({
                communityId: this.comId,
                effectiveAccountId: this.resolvedEffectiveAccountId,
                activeCartOrId: this.recordId,
                pageParam: history.pageParam,
                pageSize: PAGE_SIZE, // The maximum one can provide is 100 as per https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_ConnectAPI_CommerceCart_static_methods.htm#apex_ConnectAPI_CommerceCart_getCartItems_6
                sortParam: this.sortParam,
                selectedAddress: this.selectedAddress,
                poNumber: this.poNumber,
                isShStore: this._isSilhouetteStore,
                currencyIsoCode: this._applicableCurrencyIsoCode //BS-1245
            })
                .then((result) => {
                    /* Start : BS-1521 */
                    if (localStorage.getItem(TOTAL_PRICE_KEY)) {
                        localStorage.removeItem(TOTAL_PRICE_KEY);
                    }
                    /* End : BS-1521 */

                    this.handleCartUpdate();
                    this.dispatchEvent(
                        new CustomEvent('loadorderconfirmation', {
                            detail: {
                                isOrderConfirmation
                            }
                        })
                    );
                })
                .catch((error) => {
                    const toastEvent = new ShowToastEvent({
                        message: this.labels.errorMessageLabel,
                        variant: 'error',
                        mode: 'sticky'
                    });
                });
        } //BS-1691
    }

    //Navigate to Previous step
    navigateBack() {
        let selectedAddress = this.selectedAddress;
        let poNumber = this.poNumber;
        this.dispatchEvent(
            new CustomEvent('back', {
                detail: {
                    selectedAddress,
                    poNumber
                }
            })
        );
    }

    /**
     * BS-1691
     * This method is used to handle navigation back to cart
     */
    backToCart(event) {
        this.navigateToCart(this.recordId);
    }

    /**
     * BS-1691
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

    //Will return if partial delevery is allowed or not for the Current Account
    get isPartialDeleveryAllowed() {
        let isAllowed;
        if (this.accountRecord.k_Partial_Delivery__c == '1') {
            isAllowed = true;
        } else {
            isAllowed = false;
        }
        return isAllowed;
    }

    handleCartUpdate() {
        // Update Cart Badge
        this.dispatchEvent(
            new CustomEvent(CART_CHANGED_EVT, {
                bubbles: true,
                composed: true
            })
        );
    }
    handleTotalPrice(event) {
        let freeProductCount = event.detail.count;
        this.prices = { ...this.prices };
        this.prices.finalPrice = Number(this.prices.finalPrice) + Number(freeProductCount);
    }
}
