import { LightningElement, api } from 'lwc';
import ExistingPartner from '@salesforce/label/c.B2B_LOGIN_ExstingPartner';
import EXISTING_PARTNER_NB from '@salesforce/label/c.B2B_LOGIN_ExstingPartner_NB';
import AccessBtn from '@salesforce/label/c.B2B_LOGIN_GET_ACCESS';
import { redirectToPage } from 'c/b2b_utils';

export default class B2B_ExistingPartner extends LightningElement {
    @api isSilhouetteLogin;
    label = {
        ExistingPartnerH1: ExistingPartner.split(',')[0],
        ExistingPartnerH2: ExistingPartner.split(',')[1],
        AccessBtn: AccessBtn,
        existingPartnerNBH1: EXISTING_PARTNER_NB.split(',')[0],
        existingPartnerNBH2: EXISTING_PARTNER_NB.split(',')[1]
    };

    registerRedirect() {
        window.location.href = redirectToPage('register-existing-customer');
    }
}
