import { LightningElement, api } from 'lwc';
import checkIfSurveyApplicable from '@salesforce/apex/B2B_SurveyController.checkIfSurveyApplicable'; //Added as part of BS-1509
import USERID from '@salesforce/user/Id';
import checkAccountClosedForNB from '@salesforce/apex/B2B_Utils.checkAccountClosedForNB'; // Added as a part of BS-1663
import checkHideAccountClosurePopup from '@salesforce/apex/B2B_Utils.checkHideAccountClosurePopup'; //BS-1953
import updateMyB2BShopPreference from '@salesforce/apex/B2B_Utils.updateMyB2BShopPreference'; //BS-1953
import SHOW_ACCOUNT_CLOSED_LABEL from '@salesforce/label/c.B2B_ACCOUNT_CLOSED_FOR_NB';
import B2B_DO_NOT_SHOW_LABEL from '@salesforce/label/c.B2B_DO_NOT_SHOW_LABEL';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-1663

//START: BS-1714
import checkAccountClosedForSH from '@salesforce/apex/B2B_Utils.checkAccountClosedForSH'; //BS-1714
import checkAccountClosedForEE from '@salesforce/apex/B2B_Utils.checkAccountClosedForEE'; //BS-1714
import B2B_ACCOUNT_CLOSED_FOR_SILHOUETTE from '@salesforce/label/c.B2B_ACCOUNT_CLOSED_FOR_SILHOUETTE'; //BS-1714
import B2B_ACCOUNT_CLOSED_FOR_EVIL_EYE from '@salesforce/label/c.B2B_ACCOUNT_CLOSED_FOR_EVIL_EYE'; //BS-1714
import B2B_ACCOUNT_CLOSED_FOR_SILHOUETTE_AND_EVIL_EYE from '@salesforce/label/c.B2B_ACCOUNT_CLOSED_FOR_SILHOUETTE_AND_EVIL_EYE'; //BS-1714
//END: BS-1714

const SURVEY_VISBILITY_FLAG = 'homepagesurveyflag';
const USER_CLOSE_FLAG = 'surveyclosed';
const SILHOUETTE = 'silhouette'; //BS-1663
const HOME_PAGE_SOURCE = 'Home Page'; //BS-1663
const SHOW_POP_UP = 'ShowPopUp'; //BS-1663
const ACCOUNT_BLANK = '000000000000000'; //BS-1663

export default class B2b_homePagePopupContainer extends LightningElement {
    @api
    effectiveAccountId;

    @api
    pageSource;

    _showModal = true;

    _showAccountLock = true;

    _showSurvey = false;

    _error;
    _isSilhouetteStore; //BS-1663
    _showNBAccountClosed = false; //BS-1663
    _showAccountClosedLabel = SHOW_ACCOUNT_CLOSED_LABEL; //BS-1663
    _closeIcon = STORE_STYLING + '/icons/cross.svg'; //BS-1663
    modalHideLabel = B2B_DO_NOT_SHOW_LABEL;

    @api
    userId = USERID;

    /* Start : BS-1714 */
    _showSHAccountClosed = false;
    _showEEAccountClosed = false;
    _showSilhouetteEvilEyeAccountClosed = false;
    _showCCSModal = false;
    _labelSilhouetteAccountClosed = B2B_ACCOUNT_CLOSED_FOR_SILHOUETTE;
    _labelEvilEyeAccountClosed = B2B_ACCOUNT_CLOSED_FOR_EVIL_EYE;
    _labelSilhouetteEvilEyeAccountClosed = B2B_ACCOUNT_CLOSED_FOR_SILHOUETTE_AND_EVIL_EYE;
    _ccsCloseLabel;
    _hidePopup = false; //BS-1953
    /* End : BS-1714 */

    connectedCallback() {
        this.currentPageReference(); //BS-1663
        this.checkHideAccountClosurePopup(); //BS-1953
    }

    get showModalSHEE() {
        return this._showCCSModal && !this._hidePopup;
    } //BS-1953
    //Added as a part of BS-1663
    currentPageReference() {
        let currentPageURL = window.location.href.split('/s/');
        let currentStore = currentPageURL[0].split('/');
        currentStore.includes(SILHOUETTE) == true ? (this._isSilhouetteStore = true) : (this._isSilhouetteStore = false);
        if (this.pageSource == HOME_PAGE_SOURCE && localStorage.getItem(SHOW_POP_UP)) {
            this.checkAccountClosedForNB();
        }
        if (this._isSilhouetteStore && this.pageSource == HOME_PAGE_SOURCE && localStorage.getItem(SHOW_POP_UP)) {
            this.checkAccountClosedForSH();
        }
    }
    //Added as a part of BS-1663
    checkAccountClosedForNB() {
        if (!this._isSilhouetteStore && this.effectiveAccountId != null && this.effectiveAccountId.length > 0 && this.effectiveAccountId !== ACCOUNT_BLANK) {
            checkAccountClosedForNB({ accountId: this.effectiveAccountId })
                .then((result) => {
                    if (result == true) {
                        this._showNBAccountClosed = true;
                    } else if (result == false) {
                        this._showNBAccountClosed = false;
                    }
                })
                .catch((errorInstance) => {
                    console.error(errorInstance);
                });
        }
    }
    //Added as a part of BS-1663
    handleCloseModal() {
        this._showNBAccountClosed = false;
        //START: BS-1714
        if (this._showSHAccountClosed || this._showEEAccountClosed || this._showSilhouetteEvilEyeAccountClosed) {
            this._showCCSModal = false;
        }
        //END:BS-1714
        localStorage.removeItem(SHOW_POP_UP);
    }

    handleAccountLockPopup(event) {
        this._showAccountLock = event.detail.lock;
        if (this._showAccountLock == false) {
            if (localStorage.getItem(SURVEY_VISBILITY_FLAG) !== undefined && localStorage.getItem(SURVEY_VISBILITY_FLAG) !== null) {
                if (localStorage.getItem(SURVEY_VISBILITY_FLAG) == 'false') {
                    this._showSurvey = false;
                    this._showModal = false;
                }
            } else if (localStorage.getItem(USER_CLOSE_FLAG) != null) {
                if (localStorage.getItem(USER_CLOSE_FLAG) != 'true') {
                    this._showSurvey = false;
                    this._showModal = false;
                }
            } else {
                this.checkSurveyVisibility();
            }
        } else if (this._showAccountLock == true) {
            this._showSurvey = false;
        }
    }

    async checkSurveyVisibility() {
        await checkIfSurveyApplicable({ userId: this.userId, effectiveAccountId: this.effectiveAccountId, isHomePage: true })
            .then((result) => {
                this._showSurvey = result;
                if (this._showSurvey == false) {
                    this._showModal = false;
                }
                this._error = undefined;
            })
            .catch((errorInstance) => {
                this._error = errorInstance;
                this._showModal = false;
            });
    }

    /**
     * BS-1714
     * Method to fetch the account lock status for Silhouette brand
     */
    async checkAccountClosedForSH() {
        if (this._isSilhouetteStore && this.effectiveAccountId != null && this.effectiveAccountId.length > 0 && this.effectiveAccountId !== ACCOUNT_BLANK) {
            await checkAccountClosedForSH({ accountId: this.effectiveAccountId })
                .then((result) => {
                    if (result === true) {
                        this._showSHAccountClosed = true;
                        this._ccsCloseLabel = this._labelSilhouetteAccountClosed;
                    }
                    this.checkAccountClosedForEE();
                })
                .catch((errorInstance) => {
                    console.error(errorInstance);
                });
        }
    }

    /**
     * BS-1714
     * Method to fetch the account lock status for evil eye brand
     */
    async checkAccountClosedForEE() {
        if (this._isSilhouetteStore && this.effectiveAccountId != null && this.effectiveAccountId.length > 0 && this.effectiveAccountId !== ACCOUNT_BLANK) {
            await checkAccountClosedForEE({ accountId: this.effectiveAccountId })
                .then((result) => {
                    if (result === true) {
                        this._showEEAccountClosed = true;
                        this._ccsCloseLabel = this._labelEvilEyeAccountClosed;
                    }
                    if (this._showEEAccountClosed === true && this._showSHAccountClosed === true) {
                        this._showSilhouetteEvilEyeAccountClosed = true;
                        this._ccsCloseLabel = this._labelSilhouetteEvilEyeAccountClosed;
                    }
                    this._showCCSModal = this._showSHAccountClosed || this._showEEAccountClosed || this._showSilhouetteEvilEyeAccountClosed;
                })
                .catch((errorInstance) => {
                    console.error(errorInstance);
                });
        }
    }

    /**
     * BS-1953
     * Method to fetch the B2B_Hide_Account_Closure_Popup__c value
     */
    checkHideAccountClosurePopup() {
        checkHideAccountClosurePopup({ accountId: this.effectiveAccountId })
            .then((result) => {
                if (result.B2B_Hide_Account_Closure_Popup__c != undefined && result.B2B_Hide_Account_Closure_Popup__c == true) {
                    this._hidePopup = true;
                } else {
                    this._hidePopup = false;
                }
            })
            .catch((errorInstance) => {
                console.error(errorInstance);
            });
    }

    handleCheckboxChange() {
        this._showNBAccountClosed = false;
        //START: BS-1714
        if (this._showSHAccountClosed || this._showEEAccountClosed || this._showSilhouetteEvilEyeAccountClosed) {
            this._showCCSModal = false;
        }
        //END:BS-1714
        updateMyB2BShopPreference({ accountId: this.effectiveAccountId });
        localStorage.removeItem(SHOW_POP_UP);
    }
}
