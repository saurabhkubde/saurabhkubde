import { LightningElement, api } from 'lwc';
import NoPartner from '@salesforce/label/c.B2B_LOGIN_NoPartner_Hint1';
import BecomePartner from '@salesforce/label/c.B2B_LOGIN_NoPartner_Hint2';
import RegisterPartner from '@salesforce/label/c.B2B_LOGIN_NoPartner_Link';
import REGISTER_PARTNER_NB from '@salesforce/label/c.B2B_LOGIN_NoPartner_Link_NB';
import CustomerContact from '@salesforce/label/c.B2B_LOGIN_CustomerContact'; //BS-2005
import SilhouetteAG from '@salesforce/label/c.B2B_LOGIN_SilhouetteInternational'; //BS-2005
import SH_EE_Become_Partner_LABEL from '@salesforce/label/c.B2B_SH_EE_BECOME_PARTNER_LABEL'; //BS-2005
import LANG from '@salesforce/i18n/lang'; //Added as a part of BS 1414
import { redirectToPage } from 'c/b2b_utils';

const LOGIN_PAGE_LANGUAGE = 'loginPageLanguage'; //Added as a part of BS 1414

export default class B2B_NoExistingPartner extends LightningElement {
    @api isSilhouetteLogin;
    label = {
        NoPartner,
        BecomePartner,
        RegisterPartner,
        REGISTER_PARTNER_NB,
        CustomerContact, //BS-2005
        SilhouetteAG, //BS-2005
        SH_EE_Become_Partner_LABEL //BS-2005
    };
    redirectUrl;
    _contactCustomerServiceRedirectUrl; //BS-2005

    connectedCallback() {
        localStorage.setItem(LOGIN_PAGE_LANGUAGE, LANG); //Added as a part of BS 1414
        this.redirectUrl = redirectToPage('partner-registration');
        this._contactCustomerServiceRedirectUrl = redirectToPage('contact-customer-service'); //BS-2005
    }
}
