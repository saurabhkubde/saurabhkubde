import { LightningElement, track, api } from 'lwc';
import Advantages from '@salesforce/label/c.B2B_LOGIN_Advantages';

import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';
export default class B2B_LoginAdvantages extends LightningElement {
    @api isSilhouetteStore;
    label = Advantages.split('.').filter((element) => element);

    @track
    _iconNumberVsImageMap = new Map();

    get labelIcons() {
        let iconLabelsList = [];
        let iconLabel = {};
        let count = 1;
        this._iconNumberVsImageMap.set(1, STORE_STYLING + '/icons/placemarker.svg');
        this._iconNumberVsImageMap.set(2, STORE_STYLING + '/icons/reorder.svg');
        this._iconNumberVsImageMap.set(3, STORE_STYLING + '/icons/productsearch.svg');
        this._iconNumberVsImageMap.set(4, STORE_STYLING + '/icons/last24hours.svg');
        this._iconNumberVsImageMap.set(5, STORE_STYLING + '/icons/shipping.svg');
        this._iconNumberVsImageMap.set(6, STORE_STYLING + '/icons/transparent.svg');
        this.label.forEach((item) => {
            iconLabel = { Label: item, icon: this._iconNumberVsImageMap.get(count) };
            iconLabelsList.push(iconLabel);
            count++;
        });
        return iconLabelsList;
    }
}
