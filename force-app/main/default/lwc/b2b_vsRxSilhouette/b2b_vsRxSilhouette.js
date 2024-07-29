import { LightningElement } from 'lwc';
import VSRXSILHOUETTEPART1 from '@salesforce/label/c.B2B_SH_VS_RX_PART1';
import VSRXSILHOUETTEPART2 from '@salesforce/label/c.B2B_SH_VS_RX_PART2';
import BACK_TO_PARTNER_PORTAL from '@salesforce/label/c.B2B_Back_To_Partner_Portal';
import OLDSHSHOPLINK from '@salesforce/label/c.B2B_SH_Old_Shop_Link';

import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //Added for BS-824
import { redirectToPage } from 'c/b2b_utils';

export default class B2b_vsRxSilhouette extends LightningElement {
    label = {
        sH1: VSRXSILHOUETTEPART1,
        sH2: VSRXSILHOUETTEPART2,
        backToPartnerPortal: BACK_TO_PARTNER_PORTAL,
        oldSHShopLink: OLDSHSHOPLINK
    };

    get icon() {
        return STORE_STYLING + '/icons/UnderConstruction.png';
    }

    get SHBrandIcon() {
        return STORE_STYLING + '/icons/SHVsRxLogo.jpg';
    }

    goBack() {
        window.location.href = redirectToPage('');
    }
}
