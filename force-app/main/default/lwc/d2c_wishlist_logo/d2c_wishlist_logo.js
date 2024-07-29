import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import WhishlistLogo from '@salesforce/resourceUrl/D2C_NB_StoreStyling';

// NBD2C-24 CONSTANTS START
const CURRENT_SCROLL_LENGTH = 300;
const HOME = 'Home';
const SCROLL = 'scroll';
const WISHLIST = 'wishlist';
// NBD2C-24 CONSTANTS END

export default class D2C_Wishlist_Logo extends LightningElement {
    /**
     * This variable holds the value of label for wishlist icon.
     * NBD2C-24
     * @type {String}
     */
    iconAssistiveText = WISHLIST;

    /**
     * This variable holds the location of heart logo (black color).
     * NBD2C-24
     * @type {String}
     */
    @track
    _heartBlackLogo = WhishlistLogo + '/icons/Wishlist-black.svg';

    /**
     * This variable holds the location of heart logo (white color).
     * NBD2C-24
     * @type {String}
     */
    @track
    _heartWhiteLogo = WhishlistLogo + '/icons/Wishlist-white.svg';

    /**
     * This variable holds the location of current heart logo to be displayed.
     * NBD2C-24
     * @type {String}
     */
    @track
    _wishListLogo = '';

    /**
     * This variable indicates if component has completed the necessary computation and is now ready to display result.
     * NBD2C-24
     * @type {Boolean}
     */
    _isReady = false;

    /**
     * This variable holds the value of total number of items marked as favorite.
     * NBD2C-24
     * @type {Integer}
     */
    badgeItemsCount = 0;

    /**
     * This variable indicates that current page is home page or not and weather to apply dynamic styling respectivly.
     * NBD2C-24
     * @type {Boolean}
     */
    @track
    _applyDynamicStyling = false;

    /**
     * This variable holds the pageReference.
     * NBD2C-24
     * @type {pageReference}
     */
    _pageReference;

    /**
     * NBD2C-24
     * @author : Sachin V
     * This wire method is used to fetch the current page reference
     */
    @wire(CurrentPageReference)
    wiredPageRef(pageReference) {
        this._pageReference = pageReference;
        if (this._pageReference) {
            this._applyDynamicStyling =
                this._pageReference && this._pageReference.attributes && this._pageReference.attributes.name && this._pageReference.attributes.name == HOME
                    ? true
                    : false;
        }
        this._applyDynamicStyling ? (this._wishListLogo = this._heartWhiteLogo) : (this._wishListLogo = this._heartBlackLogo);
    }

    /**
     * NBD2C-24
     * @author : Sachin V
     * This method is used to identify the current page and toggle the _applyDynamicStyling accordingly (if home page -> true else false)
     */
    connectedCallback() {
        window.addEventListener(SCROLL, (event) => {
            if (this._applyDynamicStyling == true && event && event.target && event.target.scrollingElement) {
                event.target.scrollingElement.scrollTop > CURRENT_SCROLL_LENGTH
                    ? (this._wishListLogo = this._heartBlackLogo)
                    : (this._wishListLogo = this._heartWhiteLogo);
            } else {
                this._wishListLogo = this._heartBlackLogo;
            }
        });
        this._isReady = true;
    }
}
