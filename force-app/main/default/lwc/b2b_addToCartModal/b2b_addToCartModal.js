import { LightningElement, api, wire, track } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import cartChanged from '@salesforce/messageChannel/lightning__commerce_cartChanged';
import continueShopping from '@salesforce/label/c.B2B_GEN_ContinueShopping';
import viewCart from '@salesforce/label/c.B2B_GEN_ViewCart';
import SAVE_BUTTON_LABEL from '@salesforce/label/c.B2B_SAVE_BUTTON'; //BS-1562
import CUSTOMER_NAME_INPUT_LABEL from '@salesforce/label/c.B2B_CUSTOMER_NAME_INPUT_LABEL'; //BS-1562
import CLERK_INPUT_LABEL from '@salesforce/label/c.B2B_CLERK_INPUT_LABEL'; //BS-1562
import B2B_VS_RX_ORDER_REFERENCE_LABELS from '@salesforce/label/c.B2B_VS_RX_Order_Reference_Labels'; //BS-1562
import addToCartHeader from '@salesforce/label/c.B2B_GEN_ItemWasAddedToCart';
import error from '@salesforce/label/c.B2B_LOGIN_Generic_Error';
import itemCartError from '@salesforce/label/c.B2B_Item_Not_Added_Into_Cart_ConnectedAPI'; //Added as part of BS_902
import responseErrorMessage from '@salesforce/label/c.B2B_ConnectedAPI_Response_Error_Message'; //Added as part of BS_902
import B2B_BEST_PRICE_NOT_AVAILABLE from '@salesforce/label/c.B2B_BEST_PRICE_NOT_AVAILABLE'; //BS-2002
import B2B_CURRENCY_CODE_ERROR from '@salesforce/label/c.B2B_CURRENCY_CODE_ERROR'; //BS-2002
import { NavigationMixin } from 'lightning/navigation';
import updateCartItem from '@salesforce/apex/B2B_SearchController.updateCartItem'; //BS-1562
import getCartItemDetails from '@salesforce/apex/B2B_SearchController.getCartItemDetails'; //BS-1562
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-2085
import ORDER_REMARK_FIELD_HELPTEXT from '@salesforce/label/c.B2B_ORDER_REMARK_FIELD_HELPTEXT'; //BS-2085
import CONSUMER_REFERENCE_FIELD_HELPTEXT from '@salesforce/label/c.B2B_CONSUMER_REFERENCE_FIELD_HELPTEXT'; //BS-2437

const APPLICABLE_STYLING = 'max-width: 561px!important;min-height: 435px;margin: auto;'; //Updated as a part of BS-1315
const ERROR_MESSAGE_LABEL = B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[10] ? B2B_VS_RX_ORDER_REFERENCE_LABELS.split(',')[10] : ''; //BS-1562

export default class B2b_addToCartModal extends NavigationMixin(LightningElement) {
    label = {
        continueShopping,
        viewCart,
        error,
        itemCartError, // Added as part of BS_902
        SAVE_BUTTON_LABEL, //BS-1562
        ERROR_MESSAGE_LABEL, //BS-1562
        ORDER_REMARK_FIELD_HELPTEXT, //BS-2085
        CONSUMER_REFERENCE_FIELD_HELPTEXT //BS-2437
    };

    /*START OF BS-1562*/
    @track
    customerInputFields = [
        { label: CUSTOMER_NAME_INPUT_LABEL, value: '', fieldAPIName: 'Customer_Reference__c' },
        { label: CLERK_INPUT_LABEL, value: '', fieldAPIName: 'Entered_By__c' }
    ];

    @track _customerInputFields = {};
    /*END OF BS-1562*/

    showModal = false;
    _header;
    _isLoading = false; //BS-1562
    _infoSVG = STORE_STYLING + '/icons/INFO.svg'; //BS-2085
    _saveStart = false; //BS-2287
    _characterLimit = 50; //BS-2339
    /**
     * Needed for usage of lightning-message-service.
     *
     * @see https://developer.salesforce.com/docs/component-library/bundle/lightning-message-service/documentation
     */
    @wire(MessageContext) messageContext;

    @api
    cartid;

    @api
    cartItemId; //BS-1562

    @api
    error;

    /**
     * Flag to check for price unavailable
     * Added as part of BS-902
     * type {Boolean}
     */
    @track
    _showAddCartErrorMessage = false;

    applicableStyling = APPLICABLE_STYLING;

    @track modalHeader;
    _isValid = true; //BS-1562

    set header(value) {
        this._header = value;
    }

    @api
    get header() {
        return this._header;
    }

    _showInputFields = false;

    @api async show() {
        /* Start : BS-1562 */
        this.customerInputFields = [
            { label: CUSTOMER_NAME_INPUT_LABEL, value: '', fieldAPIName: 'Customer_Reference__c', isInvalid: false, isOrderRemarkField: false },
            { label: CLERK_INPUT_LABEL, value: '', fieldAPIName: 'Entered_By__c', isInvalid: false, isOrderRemarkField: true }
        ];
        if (this.cartItemId !== undefined && this.cartItemId !== null) {
            await getCartItemDetails({ cartItemId: this.cartItemId }).then((result) => {
                this._isLoading = true;
                let fieldValueList = [];
                let customerReferenceField = this.customerInputFields.find((item) => item.fieldAPIName === 'Customer_Reference__c');
                let enteredByField = this.customerInputFields.find((item) => item.fieldAPIName === 'Entered_By__c');

                if (result.Customer_Reference__c !== undefined && result.Customer_Reference__c !== null) {
                    customerReferenceField.value = result.Customer_Reference__c;
                }
                if (result.Entered_By__c !== undefined && result.Entered_By__c !== null) {
                    enteredByField.value = result.Entered_By__c;
                }

                fieldValueList.push(customerReferenceField);
                fieldValueList.push(enteredByField);

                this._customerInputFields = JSON.parse(JSON.stringify(fieldValueList));
                this._showInputFields = true;
                this._isLoading = false;
            });
        }
        /* End : BS-1562 */
        this.showModal = true;
        this.handleShowModal();
        //this.notifyCartChanged();
    }

    @api hide() {
        this.showModal = false;
        this.handleCloseModal();
    }

    get hasErrors() {
        return this.error === undefined ? false : true;
    }

    handleShowModal() {
        if (this.error === undefined) {
            this.modalHeader = addToCartHeader.split(',')[0];
            this._showAddCartErrorMessage = false;
        } else {
            this.modalHeader = addToCartHeader.split(',')[1];
            /* START BS-902 */
            if (
                this.error.body.message == responseErrorMessage ||
                this.error.body.message == B2B_BEST_PRICE_NOT_AVAILABLE ||
                this.error.body.message.includes(B2B_CURRENCY_CODE_ERROR)
            ) {
                this._showAddCartErrorMessage = true;
            } //BS-2002
            /* END BS-902 */
        }
        const modal = this.template.querySelector('c-b2b_modal');
        modal.show();
        this.notifyCartChanged();
    }

    handleCancelModal() {
        const modal = this.template.querySelector('c-b2b_modal');
        modal.hide();
    }

    handleCloseModal() {
        this.handleSave(); //BS-2287
        if (this._saveStart == false) {
            const modal = this.template.querySelector('c-b2b_modal');
            modal.hide();
        }
    }

    handleViewCart() {
        this.handleSave(); //BS-2287
        if (this._saveStart == false) {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.cartid,
                    objectApiName: 'WebCart',
                    actionName: 'view'
                }
            });
        }
    }

    notifyCartChanged() {
        publish(this.messageContext, cartChanged, null);
    }

    /**
     * BS-1562
     * method to update card item when clicked on save button
     */
    handleSave(event) {
        this._saveStart = true;
        let customerInputs = JSON.stringify(this._customerInputFields);
        this._isLoading = true;
        this.updateDataInCartItem(customerInputs);
        this._saveStart = false;
    }

    /**
     * BS-1562
     * method to handle customer input fields
     */
    handleUserInput(event) {
        const field = event.target.dataset.field;
        const value = event.target.value;

        for (let input in this._customerInputFields) {
            //Iteration over the collection of customer information and setting up the entered value by user for that particuler field
            if (this._customerInputFields[input].label === field) {
                this._customerInputFields[input].value = value;
            }
        }
    }

    /**
     * BS-1562
     * method to server call to save data to CartItem
     */
    async updateDataInCartItem(customerInputs) {
        await updateCartItem({
            cartItemId: this.cartItemId,
            customerInputs: customerInputs
        })
            .then((result) => {
                this._isLoading = false;
            })
            .catch((error) => {
                this._isLoading = false;
                console.error(error);
            });
    }
}
