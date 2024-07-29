import { api, wire, track, LightningElement } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/b2b_pubsub';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi'; //BS-2273
import HIDE_PURCHASE_PRICE_FIELD from '@salesforce/schema/Account.B2B_Hide_Purchase_Price__c'; //BS-2273
import { NavigationMixin } from 'lightning/navigation';

// CONTROLLER METHODS
import getCartSummary from '@salesforce/apex/B2B_CartController.getCartSummary';
import checkAccountOrderLock from '@salesforce/apex/B2B_Utils.checkAccountOrderLock'; //963

// STORE OBJECT AND FIELD INSTANCES
import communityId from '@salesforce/community/Id';
import { getLabelForOriginalPrice, displayOriginalPrice, showToastMessage } from 'c/b2b_cartUtils'; //BS-205

// GET LABEL
import CART_SUMMARY_LABELS from '@salesforce/label/c.B2B_CartContents_And_CartItems'; //BS-205
import TERMS_CONDITIONS_LINKOUT from '@salesforce/label/c.B2B_FOOTER_SIL_TermsLink'; //BS-205
import NB_TERMS_CONDITIONS_LINKOUT from '@salesforce/label/c.B2B_NB_TermsLink'; //BS-520
import CONTINUE_SHOPPING_LABEL from '@salesforce/label/c.B2B_GEN_ContinueShopping'; //Added as part of BS-563
import B2B_NB_Account_Closed_Warning_on_Cart from '@salesforce/label/c.B2B_NB_Account_Closed_Warning_on_Cart'; //Added as part of BS-1663
import B2B_SH_ACCOUNT_CLOSED_POPUP_CART from '@salesforce/label/c.B2B_SH_ACCOUNT_CLOSED_POPUP_CART'; //BS-1714
import B2B_EE_ACCOUNT_CLOSED_POPUP_CART from '@salesforce/label/c.B2B_EE_ACCOUNT_CLOSED_POPUP_CART'; //BS-1714
import B2B_SH_AND_EE_ACCOUNT_CLOSED from '@salesforce/label/c.B2B_SH_AND_EE_ACCOUNT_CLOSED'; //BS-1714

import B2B_DEFAULT_CURRENCY_ISO_CODE from '@salesforce/label/c.B2B_DEFAULT_CURRENCY_ISO_CODE'; //Added as part of BS-1245

import getCountrySpecificDetails from '@salesforce/apex/B2B_Utils.getCountrySpecificDetails'; //Added as part of BS-1278
import Id from '@salesforce/user/Id'; //Added as part of BS-1278
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-1663

// EVENT NAME CONSTANTS
const UPDATE_CART_TOTAL_PRICE = 'updatetotalcartprice'; //BS-1094
const SEND_CART_ITEMS_DATA = 'sendCartItemsData'; //BS-2031
const UPDATE_CART_INFORMATION = 'updateCartInformation'; //BS-2031

const fields = [HIDE_PURCHASE_PRICE_FIELD];
const CART_ITEMS_UPDATED_EVT = 'cartitemsupdated'; //BS-205
const DISABLED_CHECKOUT_BUTTON = 'disabledproceedcheckoutbutton'; // Added as Part Of BS-897
const LOADING_STATUS = 'loadingstatus'; //BS-205
const TOAST_VARIENT = 'error'; //BS-205
const TOAST_MODE = 'dismissable'; //BS-205
const CHECKOUT_PAGE = 'Checkout_Process__c'; //BS-205
const NAVIGATION_DESTINATION = 'comm__namedPage'; //BS-205
const NEUBAU_STORE = 'neubau'; //BS-520
const DELETE_ADITIONAL_PRICE = 'deleteadditionalprice'; //BS-1036
const UNENTITLED_PRODUCTS = 'unentitledproducts'; //BS-1090
const LOCK_KEY = 'locked'; //Added as a part of BS-963
const TOTAL_PRICE_KEY = 'pricekey'; //Added as a part of BS-1521
const CCS_EVENT = 'ccsevent'; //BS-1714

export default class CartSummary extends NavigationMixin(LightningElement) {
    /**
     * An event fired when the cart items change.
     * This event is a short term resolution to update any sibling component that may want to update their state based
     * on updates in the cart items.
     *
     * In future, if LMS channels are supported on communities, the LMS should be the preferred solution over pub-sub implementation of this example.
     * For more details, please see: https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_message_channel_considerations
     *
     * @event CartContents#cartitemsupdated
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * The pricing information for the cart summary's total.
     *
     * @typedef {Object} Prices
     *
     * @property {String} [originalPrice]
     *  The  list price aka "strikethrough" price (i.e. MSRP) of the cart.
     *  If the value is null, undefined, or empty, the list price will not be displayed.
     *
     * @property {String} finalPrice
     *   The final price of the cart.
     */

    /**
     * The recordId provided by the cart detail flexipage.
     *
     * @type {string}
     */
    @api
    recordId;

    /**
     * The effectiveAccountId provided by the cart detail flexipage.
     *
     * @type {string}
     */
    @api
    effectiveAccountId;

    /**
     * The boolean value to show the Proceed To Checkout
     * BS-205
     * @type {Boolean}
     */
    @track
    _isProceedToCheckoutValid = false;

    /**
     * The boolean value to show the Proceed To Checkout
     * BS-897
     * @type {Boolean}
     */
    @track
    isDisabledCheckoutButton = false;

    @track
    _passedCartItemsData = []; //BS-2031

    @track
    _requiredFieldsFilled = true; //BS-2031

    _isEndConsumerEmpty; //BS-2031
    _isOrderRemarkEmpty; //BS-2031

    /**
     * Input parameter for lightning spinner
     * BS-205
     *  @type {boolean}
     */
    @track
    _isLoading = false;

    //BS-1090
    @track
    _unEntitledCartProductsIdList = [];

    /**
     * Input parameter for controlling visibility of component
     * BS-205
     *  @type {boolean}
     */
    _isComponentVisible = false;
    _accountClosedLabel = B2B_NB_Account_Closed_Warning_on_Cart; //BS-1663

    /**
     * Variable for checking the store name.
     * BS-520
     *  @type {boolean}
     */
    _isStoreNB = false;

    /**
     * Variable for storing continue shopping label.
     * BS-653
     *  @type {String}
     */
    _continueShoppingButtonLabel = CONTINUE_SHOPPING_LABEL;

    /**
     * Variable for storing updated price.
     * BS-1094
     *  @type {String}
     */
    _updatedPrice = null;

    /**
     * Variable for storing updated total price.
     * BS-1094
     *  @type {String}
     */
    _updatedTotalPrice = null;

    /**
     * Variable for storing extra price.
     * BS-1036
     *  @type {String}
     */
    extraPrice = 0;

    /**
     * Variable holds the default currency ISO Code
     * BS-1245
     *  @type {String}
     */
    _defaultCurrencyIsoCode = B2B_DEFAULT_CURRENCY_ISO_CODE;

    /**
     * Variable to check whether account is lock or not.
     * BS-963
     *  @type {Boolean}
     */
    _accountLockFlag = false;

    /**
     * Variable holds page source name.
     * BS-963
     *  @type {String}
     */
    _pageSource = 'Cart Page';
    _closeIcon = STORE_STYLING + '/icons/cross.svg'; //BS-1663
    _showNBAccountClosed = false; //BS-1663
    _noFramesAllowedLabel = B2B_NB_Account_Closed_Warning_on_Cart; //BS-1663

    /**
     * BS-1278
     * Id of the current logged in user;
     */
    _currentLoggedInUserId = Id;

    /**
     * BS-1278
     * Id of the current logged in user;
     */
    @track
    _countrySpecificContent = {};

    /* Start : BS-1714 */
    _showEEAccountClosed = false;
    _showSHAccountClosed = false;
    _showSHAndEEAccountClosed = false;
    _labelSilhouetteAccountClosed = B2B_SH_ACCOUNT_CLOSED_POPUP_CART;
    _labelEvilEyeAccountClosed = B2B_EE_ACCOUNT_CLOSED_POPUP_CART;
    _labelSHAndEEAccountClosed = B2B_SH_AND_EE_ACCOUNT_CLOSED;
    _showCCSFlag = false;
    _accountCCSClosedLabel;
    /* End : BS-1714 */

    /**
     * An object with the current PageReference.
     * This is needed for the pubsub library.
     *
     * @type {PageReference}
     */
    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        this.pageRef = pageRef;
    }

    //BS-2273
    @wire(getRecord, { recordId: '$effectiveAccountId', fields })
    account;

    /**
     * get HIDE_PURCHASE_PRICE_FIELD value on account
     * BS-2273
     */
    get hidePurchasePriceField() {
        if (this.account && this.account.data) {
            return getFieldValue(this.account.data, HIDE_PURCHASE_PRICE_FIELD);
        }
        return true;
    }

    /**
     * BS-1714
     * Get to check the visibility of label
     */
    get showCCSModal() {
        return this._showEEAccountClosed || this._showEEAccountClosed || this._showSHAndEEAccountClosed;
    }
    /**
     * This lifecycle hook fires when this component is inserted into the DOM.
     * We want to start listening for the 'cartitemsupdated'
     *
     * NOTE:
     * In future, if LMS channels are supported on communities, the LMS should be the preferred solution over pub-sub implementation of this example.
     * For more details, please see: https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_message_channel_considerations
     */
    async connectedCallback() {
        //Added for displaying correct information according to the store --> BS-520
        let pageURL = window.location.href;
        if (pageURL.includes(NEUBAU_STORE)) {
            this._isStoreNB = true;
        }

        /* Start : BS-1278 */
        if (this._currentLoggedInUserId !== undefined && this._currentLoggedInUserId !== null && this._isStoreNB == false) {
            await getCountrySpecificDetails({
                currentLoggedInUserId: this._currentLoggedInUserId
            })
                .then((result) => {
                    this._countrySpecificContent = result;
                })
                .catch((ExceptionInstance) => {
                    console.error(ExceptionInstance);
                });
        }
        /* End : BS-1278 */

        /**START OF BS-963 */
        await checkAccountOrderLock({ accountId: this.effectiveAccountId })
            .then((result) => {
                if (result == true) {
                    this._accountLockFlag = true;
                    localStorage.setItem(LOCK_KEY, this._accountLockFlag);
                } else if (result == false) {
                    this._accountLockFlag = false;
                    localStorage.setItem(LOCK_KEY, this._accountLockFlag);
                }
            })
            .catch((errorInstance) => {
                console.error(errorInstance);
            });
        /**END OF BS-963 */
        registerListener(DISABLED_CHECKOUT_BUTTON, this.handlePrcoeedToCheckoutButtonVisibility, this); // Added as Part Of BS-897
        registerListener(CART_ITEMS_UPDATED_EVT, this.getUpdatedCartSummary, this);
        registerListener(LOADING_STATUS, this.handleComponentVisibility, this);
        registerListener(UPDATE_CART_TOTAL_PRICE, this.handleCartPriceUpdate, this); //BS-1094
        registerListener(DELETE_ADITIONAL_PRICE, this.deleteAdditionalPrice, this); //BS-1094
        registerListener(UNENTITLED_PRODUCTS, this.handleUnEntitledProducts, this); //BS-1090
        registerListener(CCS_EVENT, this.populateCCSFlags, this); //BS-1714
        registerListener(SEND_CART_ITEMS_DATA, this.handleCartItemsData, this); //BS-2031
        this.getUpdatedCartSummary();
    }

    //BS-2031
    handleCartItemsData(cartItemsData) {
        this._requiredFieldsFilled = true;
        this._passedCartItemsData = cartItemsData;
        this._passedCartItemsData.forEach((item) => {
            this._isEndConsumerEmpty =
                item.Customer_Reference__c !== undefined && item.Customer_Reference__c !== null && item.Customer_Reference__c !== '' ? false : true;
            this._isOrderRemarkEmpty = item.Entered_By__c !== undefined && item.Entered_By__c !== null && item.Entered_By__c !== '' ? false : true;
            if (this._isEndConsumerEmpty == true || this._isOrderRemarkEmpty == true) {
                this._requiredFieldsFilled = false;
            }
        });
    } //end BS-2031

    //Added as a part of BS-1663
    handleCloseModal() {
        this._showNBAccountClosed = false;
    }

    /**
     * BS-1094
     * Handler for the updated cart price called from the registerListener
     * to update cart total price
     */
    handleCartPriceUpdate(totalPrice) {
        //BS-1409
        if (this._updatedPrice == null || this._updatedPrice == 0 || this._updatedPrice != totalPrice) {
            this._updatedPrice = totalPrice;
        }
        //BS-1409
    }

    /**
     * BS-1036
     * Handler for the updated cart price called from the registerListener
     * to remove the extra cart total price
     */
    deleteAdditionalPrice(extraPrice) {
        this.extraPrice = extraPrice;
    }
    /**
     * This lifecycle hook fires when this component is loaded into the DOM.
     */

    renderedCallback() {
        registerListener(LOADING_STATUS, this.handleComponentVisibility, this);
        registerListener(CCS_EVENT, this.populateCCSFlags, this); //BS-1714
    }

    /**
     * This lifecycle hook fires when this component is removed from the DOM.
     */
    disconnectedCallback() {
        unregisterAllListeners(this);
        this._isComponentVisible = false;
    }

    get isCartEmpty() {
        return Boolean(this._cartSummary && Number(this._cartSummary.totalProductCount)) == false;
    }

    /**
     * BS-205
     * This method is use to control component visibility
     */
    handleComponentVisibility(payload) {
        this._showSHAccountClosed = false;
        this._showEEAccountClosed = false;
        this._showSHAndEEAccountClosed = false;

        //Added as a part of BS-1663
        if (payload.accountCssFlag !== undefined && payload.accountCssFlag !== null && this._isStoreNB) {
            this.isDisabledCheckoutButton = payload.accountCssFlag;
            this._showNBAccountClosed = payload.accountCssFlag;
            this._isComponentVisible = payload.loading;
        } else if (this._isStoreNB === false && this._evilEyeCCSFlag === true && this._silhouetteCCSFlag === true) {
            this.isDisabledCheckoutButton = true;
            this._showSHAndEEAccountClosed = true;
            this._accountCCSClosedLabel = this._labelSHAndEEAccountClosed;
            this._isComponentVisible = true;
        } else if (this._isStoreNB === false && this._evilEyeCCSFlag === true) {
            this.isDisabledCheckoutButton = true;
            this._showEEAccountClosed = true;
            this._accountCCSClosedLabel = this._labelEvilEyeAccountClosed;
            this._isComponentVisible = true;
        } else if (this._isStoreNB === false && this._silhouetteCCSFlag === true) {
            this.isDisabledCheckoutButton = true;
            this._showSHAccountClosed = true;
            this._accountCCSClosedLabel = this._labelSilhouetteAccountClosed;
            this._isComponentVisible = true;
        } else {
            this._isComponentVisible = payload;
            this.isDisabledCheckoutButton = false;
        }
        this._showCCSFlag = this._showSHAccountClosed || this._showEEAccountClosed || this._showSHAndEEAccountClosed;
    }

    /**
     * Get The labels used in the template.
     * BS-205
     * @type {Object}
     */
    get label() {
        return {
            cartTotalHeaderLabel: CART_SUMMARY_LABELS.split(',')[24],
            cartTotalLabel: CART_SUMMARY_LABELS.split(',')[25],
            termsAndConditionsHeaderLabel: CART_SUMMARY_LABELS.split(',')[26],
            termsAndConditionsValidationLabel: CART_SUMMARY_LABELS.split(',')[27],
            proceedToCheckoutHeaderLabel: CART_SUMMARY_LABELS.split(',')[28].toUpperCase(),
            termsAndConditionsLinkoutLabel: TERMS_CONDITIONS_LINKOUT,
            termsAndConditionsLinkoutLabelNB: NB_TERMS_CONDITIONS_LINKOUT //BS-520
        };
    }

    /**
     * Gets the normalized effective account of the user.
     * BS-205
     * @type {string}
     */
    get resolvedEffectiveAccountId() {
        const effectiveAccountId = this.effectiveAccountId || '';
        let resolved = null;
        if (effectiveAccountId.length > 0 && effectiveAccountId !== '000000000000000') {
            resolved = effectiveAccountId;
        }
        return resolved;
    }

    /**
     * The pricing information to be displayed in the summary
     * BS-205
     * @type {Prices}
     */
    get prices() {
        return {
            originalPrice: this._cartSummary && this._cartSummary.totalListPrice,
            finalPrice: this._cartSummary && this._cartSummary.totalProductAmount
        };
    }

    /**
     * The ISO 4217 currency code for the cart page
     *
     * @type {String}
     */
    get currencyCode() {
        //BS-1245
        return this._cartSummary && this._cartSummary.currencyIsoCode ? this._cartSummary && this._cartSummary.currencyIsoCode : this._defaultCurrencyIsoCode;
        // old : return (this._cartSummary && this._cartSummary.currencyIsoCode) || 'USD';
    }

    /**
     * Representation for Cart Summary
     *
     * @type {object}
     */
    _cartSummary;

    /**
     * Get cart summary from the server via imperative apex call
     * BS-205
     */
    getUpdatedCartSummary() {
        getCartSummary({
            communityId: communityId,
            activeCartOrId: this.recordId,
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
            .then((cartSummary) => {
                this._cartSummary = cartSummary;
                this._updatedTotalPrice = Number(this._cartSummary.totalProductAmount) + Number(this._updatedPrice); //BS-1094
                this._cartSummary.totalProductAmount = this._updatedTotalPrice; //BS-1094

                let cartSummaryCloned = JSON.parse(JSON.stringify(this._cartSummary));
                cartSummaryCloned.totalProductAmount = Number(cartSummaryCloned.totalProductAmount) - Number(this.extraPrice); //BS-1094
                this.extraPrice = 0; //BS-1409
                this._updatedTotalPrice = cartSummaryCloned.totalProductAmount;
                this._cartSummary = JSON.parse(JSON.stringify(cartSummaryCloned));
                /* Start : BS-1521 */
                localStorage.setItem(TOTAL_PRICE_KEY, btoa(unescape(encodeURIComponent(this._updatedTotalPrice))));
                /* End : BS-1521 */
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    /**
     * Handler for event fired on change of terms and conditions checkbox.
     * BS-205
     */
    handleTermsAndConditions(event) {
        this._isProceedToCheckoutValid = event.target.checked ? event.target.checked : false;
    }

    //Added as a part of BS-1090
    handleUnEntitledProducts(unEntitledProductList) {
        this._unEntitledCartProductsIdList = [...unEntitledProductList];
    }
    /**
     * Handler for event fired on click of 'Proceed To Checkout' button.
     * BS-205
     */
    handleProceedToCheckout() {
        if (this._isProceedToCheckoutValid) {
            if (this._requiredFieldsFilled == true) {
                if (this._unEntitledCartProductsIdList.length == 0) {
                    this.handleNavigation();
                } else if (this._unEntitledCartProductsIdList.length > 0) {
                    fireEvent(this.pageRef, 'entitlementerror', true);
                }
            } else {
                fireEvent(this.pageRef, UPDATE_CART_INFORMATION, this._requiredFieldsFilled); //BS-2031
            }
        } else {
            showToastMessage(this, this.label.termsAndConditionsValidationLabel, TOAST_VARIENT, TOAST_MODE, null);
        }
    }

    // Added as Part Of BS-897
    handlePrcoeedToCheckoutButtonVisibility(loaddata) {
        this.isDisabledCheckoutButton = loaddata;
    }

    handleNavigation() {
        this[NavigationMixin.Navigate]({
            type: NAVIGATION_DESTINATION,
            attributes: {
                name: CHECKOUT_PAGE
            }
        });
    }

    //Added for BS-928 - bugfix
    handleRedirectToHome() {
        this[NavigationMixin.GenerateUrl]({
            type: NAVIGATION_DESTINATION,
            attributes: {
                name: 'Home'
            }
        }).then((url) => {
            window.open(url, '_self');
        });
    }

    //BS-1714 : Callback handler for CCS flags population
    populateCCSFlags(payload) {
        this._silhouetteCCSFlag = payload.silhouetteCCSFlag;
        this._evilEyeCCSFlag = payload.evilEyeCCSFlag;
    }

    /**
     * Should the original price be shown
     * @returns {boolean} true, if we want to show the original (strikethrough) price
     */
    get showOriginal() {
        return displayOriginalPrice(true, true, this.prices.finalPrice, this.prices.originalPrice);
    }

    /**
     * Gets the dynamically generated aria label for the original price element
     * @returns {string} aria label for original price
     */
    get ariaLabelForOriginalPrice() {
        return getLabelForOriginalPrice(this.currencyCode, this.prices.originalPrice);
    }

    handleCloseModalCCS() {
        this._showCCSFlag = false;
    }
}
