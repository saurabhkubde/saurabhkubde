import { LightningElement, track, api } from 'lwc';
import orderSummary from '@salesforce/label/c.B2B_Checkout_Order_Summary';
import shippingPayment from '@salesforce/label/c.B2B_Checkout_Shipping_Payment';
import orderConfirmation from '@salesforce/label/c.B2B_Checkout_Order_Confirmation';

export default class B2b_checkoutBreadcrumbs extends LightningElement {
    /* this property accepts key value array in the form [{lable:value,active:value}] */
    @api
    checkoutStepsList;
}
