/* eslint-disable no-shadow */
/* eslint-disable @lwc/lwc/no-async-operation */
/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class B2B_CustomToastEvent extends LightningElement {
    @api title = 'Sample Title';
    @api message = 'Sample Message';
    @api variant = 'error';
    @api autoCloseTime = 5000;
    @api autoClose = false;
    @api autoCloseErrorWarning = false;

    variantOptions = [
        { label: 'error', value: 'error' },
        { label: 'warning', value: 'warning' },
        { label: 'success', value: 'success' },
        { label: 'info', value: 'info' }
    ];

    titleChange(event) {
        this.title = event.target.value;
    }

    messageChange(event) {
        this.message = event.target.value;
    }

    variantChange(event) {
        this.variant = event.target.value;
    }
    showNotification() {
        if (ShowToastEvent) {
            const evt = new ShowToastEvent({
                title: this.title,
                message: this.message,
                variant: this.variant
            });

            this.dispatchEvent(evt);
        }
    }

    @api
    showCustomNotice() {
        const toastModel = this.template.querySelector('[data-id="toastModel"]');
        toastModel.className = 'slds-show';

        if (this.autoClose) {
            this.delayTimeout = setTimeout(() => {
                const toastModel = this.template.querySelector('[data-id="toastModel"]');
                toastModel.className = 'slds-hide';
            }, this.autoCloseTime);
        }
    }
    closeModel() {
        const toastModel = this.template.querySelector('[data-id="toastModel"]');
        toastModel.className = 'slds-hide';
    }

    get mainDivClass() {
        return 'slds-notify slds-notify_toast slds-theme_' + this.variant;
    }

    get messageDivClass() {
        return 'slds-icon_container slds-icon-utility-' + this.variant + ' slds-icon-utility-success slds-m-right_small slds-no-flex slds-align-top';
    }
    get iconName() {
        return 'utility:' + this.variant;
    }
}
