import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
import registerAsBuyer from '@salesforce/apex/B2B_Registration.registerAsBuyer';
import { CurrentPageReference } from 'lightning/navigation';
import REGISTER_AS_BUYER_SUCCESS_MESSAGE from '@salesforce/label/c.B2B_REGISTER_AS_BUYER_SUCCESS_MESSAGE';

const TRUE_STRING = 'true';

export default class B2B_RegisterAsBuyer extends LightningElement {
    @api recordId;

    // Capturing current page reference to fetch th record Id
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.recordId =
                currentPageReference && currentPageReference.state && currentPageReference.state.recordId ? currentPageReference.state.recordId : null;
        }
    }

    async connectedCallback() {
        if (this.recordId) {
            await registerAsBuyer({ accountId: this.recordId })
                .then((result) => {
                    if (result == TRUE_STRING) {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Success',
                                message: REGISTER_AS_BUYER_SUCCESS_MESSAGE,
                                variant: 'success'
                            })
                        );
                    } else {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error',
                                message: result,
                                variant: 'error'
                            })
                        );
                    }
                    this.closeScreenAction();
                })
                .catch((error) => {
                    console.error(error);
                    this.closeScreenAction();
                });
        } else {
            this.closeScreenAction();
        }
    }

    closeScreenAction() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}
