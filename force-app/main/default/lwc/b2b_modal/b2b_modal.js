import { LightningElement, api } from 'lwc';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-907

const CSS_CLASS = 'modal-hidden';

export default class b2b_modal extends LightningElement {
    showModal = false;
    sectionClasses = 'slds-modal slds-fade-in-open';
    closeIcon = STORE_STYLING + '/icons/cross.svg'; //BS-907

    @api
    applicableStyling; //BS-652

    @api
    set header(value) {
        this.hasHeaderString = value !== '';
        this._header = value;
    }
    get header() {
        return this._header;
    }

    hasHeaderString = false;
    _header;

    @api show() {
        this.showModal = true;
    }

    @api hide() {
        this.showModal = false;
    }

    @api setWidth(width) {
        this.sectionClasses += ' ' + width;
    }

    handleDialogClose() {
        const closedialog = new CustomEvent('closedialog');
        this.dispatchEvent(closedialog);
        this.hide();
    }

    handleSlotTaglineChange() {
        if (this.showModal === false) {
            return;
        }
        const taglineEl = this.template.querySelector('p');
        taglineEl.classList.remove(CSS_CLASS);
    }

    handleSlotFooterChange() {
        if (this.showModal === false) {
            return;
        }
        const footerEl = this.template.querySelector('footer');
        footerEl.classList.remove(CSS_CLASS);
    }
}
