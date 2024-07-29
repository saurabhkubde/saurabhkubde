import { LightningElement, api, track } from 'lwc';
import orderSummary from '@salesforce/label/c.B2B_Checkout_Order_Summary';
import shippingPayment from '@salesforce/label/c.B2B_Checkout_Shipping_Payment';
import orderConfirmation from '@salesforce/label/c.B2B_Checkout_Order_Confirmation';
import continueShopping from '@salesforce/label/c.B2B_GEN_ContinueShopping';
import thanksForShopping from '@salesforce/label/c.B2B_Checkout_Thanks_For_Shopping';
import goToOrderHistory from '@salesforce/label/c.B2B_CHECKOUT_GO_TO_ORDER_HISTORY'; //BS-2207
import { redirectToPage } from 'c/b2b_utils';
import USERID from '@salesforce/user/Id'; //Added as part of BS-498
import checkIfSurveyApplicable from '@salesforce/apex/B2B_SurveyController.checkIfSurveyApplicable'; //Added as part of BS-498

import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //Added as part of BS-653

const SURVEY_VISBILITY_FLAG = 'homepagesurveyflag'; //Added as part of BS-1509
const ORDER_HISTORY_PAGE_URL = 'OrderSummary/OrderSummary/Default'; //BS-2207
export default class B2b_checkoutOrderConfirmation extends LightningElement {
    @api
    effectiveAccountId;

    _successIcon = STORE_STYLING + '/icons/success.svg';
    @track
    checkoutStepsList = [
        { label: orderSummary, active: false },
        { label: orderConfirmation, active: true }
    ];
    _error;
    _userId = USERID;
    _showModal;
    labels = {
        continueShopping: continueShopping,
        thanksForShopping: thanksForShopping,
        goToOrderHistory: goToOrderHistory //BS-2207
    };

    _checkoutPageSource = 'checkout';

    /**
     * BS-1509
     * Input parameter to stop lightning spinner
     *  @type {boolean}
     */
    _showLoader = true;

    async connectedCallback() {
        this._showLoader = true;
        await checkIfSurveyApplicable({ userId: this._userId, effectiveAccountId: this.effectiveAccountId, isHomePage: false })
            .then((result) => {
                this._showModal = result;
                /* Start : BS-1509 */
                if (this._showModal == true) {
                    localStorage.setItem(SURVEY_VISBILITY_FLAG, false);
                } else {
                    this._showLoader = false;
                }
                /* End : BS-1509 */
                this._error = undefined;
            })
            .catch((errorInstance) => {
                this._showLoader = false;
                this._error = errorInstance;
            });
        let checkoutSteps = this.checkoutStepsList;
        this.dispatchEvent(
            new CustomEvent('load', {
                detail: {
                    checkoutSteps
                }
            })
        );
    }

    redirectToHome(event) {
        window.location.href = redirectToPage('');
    }
    /* Start of BS-2207 */
    redirectToOrderHistory(event) {
        window.location.href = redirectToPage(ORDER_HISTORY_PAGE_URL);
    }
    /* End of BS-2207 */

    handleSurveyLoading(event) {
        this._showModal = true;
        this._showLoader = false;
    }

    handleSurveyClosing(event) {
        this._showModal = false;
        this._showLoader = false;
    }
}
