import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';
//Importing labels
import B2B_ACC_Cancel from '@salesforce/label/c.B2B_ACC_Cancel';
import B2B_ACC_Save from '@salesforce/label/c.B2B_ACC_Save';
import B2B_CONTACT_SWAP_UTILITY_LABEL from '@salesforce/label/c.B2B_CONTACT_SWAP_UTILITY_LABEL';
import B2B_Something_Went_Wrong from '@salesforce/label/c.B2B_Something_Went_Wrong';
//Importing apex
import getContactsRelatedToAccount from '@salesforce/apex/B2B_ContactSwapHandler.getContactsRelatedToAccount';
import getContactDetails from '@salesforce/apex/B2B_ContactSwapHandler.getContactDetails';
import disableContactAsCustomerUser from '@salesforce/apex/B2B_ContactSwapHandler.disableContactAsCustomerUser';
import createUser from '@salesforce/apex/B2B_ContactSwapHandler.createUser';
import getFederationIdFromUser from '@salesforce/apex/B2B_ContactSwapHandler.getFederationIdFromUser';
export default class B2b_contactSwapComponent extends LightningElement {
    @api recordId;
    _contactList;
    _currentContactList;
    _selectedContactDetailList;
    _selectedContactId;
    _arisAccountId;
    _federationId;
    _showModal = false;
    _relatedContactsAvailable = false;
    _selectedContactLoaded = false;
    _isLoading = true;
    _swapButtonDisabled = true;
    _radioButtonDisabled = false;

    selectedContactDetailsLabel = B2B_CONTACT_SWAP_UTILITY_LABEL.split(',')[0];
    contactNameLabel = B2B_CONTACT_SWAP_UTILITY_LABEL.split(',')[1];
    contactEmailLabel = B2B_CONTACT_SWAP_UTILITY_LABEL.split(',')[2];
    contactsAvailableForSwapLabel = B2B_CONTACT_SWAP_UTILITY_LABEL.split(',')[3];
    noContactsForSwapLabel = B2B_CONTACT_SWAP_UTILITY_LABEL.split(',')[4];
    confirmSwapLabel = B2B_CONTACT_SWAP_UTILITY_LABEL.split(',')[5];
    cancelLabel = B2B_ACC_Cancel;
    saveLabel = B2B_ACC_Save;
    swapContactLabel = B2B_CONTACT_SWAP_UTILITY_LABEL.split(',')[6];
    somethingWentWrong = B2B_Something_Went_Wrong;
    contactSwapSuccessLabel = B2B_CONTACT_SWAP_UTILITY_LABEL.split(',')[7];

    @wire(getContactDetails, { contactId: '$recordId' })
    getCurrentContactDetails({ data, error }) {
        if (data) {
            this._isLoading = true;
            this._currentContactList = data;
            this._selectedContactLoaded = true;
            this.getRelatedContactDetails();
        } else {
            console.error(error);
        }
    }

    getRelatedContactDetails() {
        getContactsRelatedToAccount({
            contactId: this.recordId
        })
            .then((result) => {
                this._contactList = result;
                if (result != null) {
                    this._relatedContactsAvailable = true;
                }
                this._isLoading = false;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    handleContactSelection(event) {
        this._selectedContactId = event.target.dataset.id;
        this._swapButtonDisabled = false;
    }

    handleSwapClick() {
        if (this._selectedContactId != null && this._selectedContactId != undefined) {
            this._showModal = true;
            this._radioButtonDisabled = true;
            this._swapButtonDisabled = true;
        }
    }

    handleCloseModal() {
        this._showModal = false;
        this._radioButtonDisabled = false;
        this._swapButtonDisabled = false;
    }
    handleSaveClick() {
        getContactDetails({
            contactId: this._selectedContactId
        })
            .then((result) => {
                this._isLoading = true;
                this._selectedContactDetailList = result;
                if (this._selectedContactDetailList != null) {
                    this._arisAccountId = this._selectedContactDetailList[0].Account.k_ARIS_Account_ID__c;
                    this.disableContact();
                } else {
                    this._isLoading = false;
                    const toastEvent = new ShowToastEvent({
                        message: this.somethingWentWrong,
                        variant: 'error'
                    });
                    this.dispatchEvent(toastEvent);
                    this._showModal = false;
                    this.dispatchEvent(new CloseActionScreenEvent());
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }
    disableContact() {
        disableContactAsCustomerUser({
            swapFromContactId: this.recordId,
            swapToContactId: this._selectedContactId
        })
            .then((result) => {
                this.getFederationIdFromUserMethod();
            })
            .catch((error) => {
                console.error(error);
            });
    }
    getFederationIdFromUserMethod() {
        getFederationIdFromUser({
            swapFromContactId: this.recordId
        })
            .then((result) => {
                this._federationId = result;
                if (this._federationId != null) {
                    this.createNewUser();
                } else {
                    this._isLoading = false;
                    const toastEvent = new ShowToastEvent({
                        message: this.somethingWentWrong,
                        variant: 'error'
                    });
                    this.dispatchEvent(toastEvent);
                    this._showModal = false;
                    this.dispatchEvent(new CloseActionScreenEvent());
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    createNewUser() {
        if (this._selectedContactDetailList != null && this._selectedContactId != null && this._federationId != null) {
            createUser({
                existingCustomerArisAccountId: this._arisAccountId.toString(),
                existingCustomerName: this._selectedContactDetailList[0].LastName.toString(),
                contactId: this._selectedContactId.toString(),
                userEmail: this._selectedContactDetailList[0].Email.toString(),
                userNickname: this._federationId.toString()
            })
                .then((result) => {
                    if (result == 'Success') {
                        this._isLoading = false;
                        this._showModal = false;
                        const toastEvent = new ShowToastEvent({
                            message: this.contactSwapSuccessLabel,
                            variant: 'success'
                        });
                        this.dispatchEvent(toastEvent);
                        this.dispatchEvent(new CloseActionScreenEvent());
                    } else {
                        this._isLoading = false;
                        this._showModal = false;
                        const toastEvent = new ShowToastEvent({
                            message: this.somethingWentWrong,
                            variant: 'error'
                        });
                        this.dispatchEvent(toastEvent);
                        this.dispatchEvent(new CloseActionScreenEvent());
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }
}
