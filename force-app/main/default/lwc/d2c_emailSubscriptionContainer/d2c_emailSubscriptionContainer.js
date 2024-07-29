import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

//Custom Labels
import NEWSLETTER_FORM_LABELS from '@salesforce/label/c.D2C_NB_Newsletter_Form_Labels';
import NEWSLETTER_FORM_PAGE_URL from '@salesforce/label/c.D2C_NB_Newsletter_Form_URL_and_Success_Page_URL';

const COMM_NAMED_PAGE = 'comm__namedPage';
const SH = 'SH';
const NB = 'NB';

export default class D2C_EmailSubscriptionContainer extends NavigationMixin(LightningElement) {
    @api
    selectedBrand; //DVM21-48

    @track
    _isSHBrand = false; //DVM21-48

    @track
    _isNBBrand = false; //DVM21-48

    connectedCallback() {
        //DVM21-48
        if (this.selectedBrand == NB) {
            this._isSHBrand = false;
            this._isNBBrand = true;
        } else if (this.selectedBrand == SH) {
            this._isNBBrand = false;
            this._isSHBrand = true;
        }
    }

    @track _email = '';
    @track _showError = false;

    /* NBD2C-32: Custom Labels: START */

    _emailAddressPlaceholder = NEWSLETTER_FORM_LABELS.split(',')[2];
    _validationMessage = NEWSLETTER_FORM_LABELS.split(',')[0];
    _subscribeButton = NEWSLETTER_FORM_LABELS.split(',')[3];
    _subscriptionMessageLabel = NEWSLETTER_FORM_LABELS.split(',')[1];
    _newsletterFormPageURL = NEWSLETTER_FORM_PAGE_URL.split(',')[0];
    _shNewsletterFormPageURL = NEWSLETTER_FORM_PAGE_URL.split(',')[2]; //DVM21-48
    _shNewsLetterHeadline = NEWSLETTER_FORM_LABELS.split(',')[19]; //DVM21-48
    _shSubscribeButton = NEWSLETTER_FORM_LABELS.split(',')[20]; //DVM21-48

    /* NBD2C-32: Custom Labels: START */

    /**
     * NBD2C-32
     * @description: Handles input change event.
     * @param {Event} event - The event object.
     */
    handleInputChange(event) {
        this._email = event.target.value;
        this._showError = false; // Reset error message when user starts typing
    }

    /**
     * NBD2C-32
     * @description: Subscribes user with entered email.
     */
    handleSubscribe() {
        if (this.validateEmail(this._email)) {
            let emailAddress = this._email;
            this[NavigationMixin.Navigate]({
                type: COMM_NAMED_PAGE,
                attributes: {
                    name: this._isNBBrand == true ? this._newsletterFormPageURL : this._shNewsletterFormPageURL
                },
                state: {
                    email: emailAddress
                }
            });
        } else {
            this._showError = true; // Display error message if email is invalid
        }
    }

    /**
     * NBD2C-32
     * @description: Validates the email address.
     * @param {string} email - The email address to validate.
     * @returns {boolean} - Indicates whether the email is valid or not.
     */
    validateEmail(email) {
        const regex =
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(email);
    }
}
