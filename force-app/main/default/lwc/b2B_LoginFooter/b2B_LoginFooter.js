import { LightningElement, api } from 'lwc';
import CustomerContact from '@salesforce/label/c.B2B_LOGIN_CustomerContact';
import SilhouetteAG from '@salesforce/label/c.B2B_LOGIN_SilhouetteInternational';

import { redirectToPage } from 'c/b2b_utils';

export default class B2B_LoginFooter extends LightningElement {
    @api isSilhouetteStore;
    label = {
        CustomerContact,
        SilhouetteAG
    };

    redirectUrl;

    connectedCallback() {
        this.redirectUrl = redirectToPage('contact-customer-service');
    }
}
