import { LightningElement, track, api, wire } from 'lwc';
import communityId from '@salesforce/community/Id';
import communityPath from '@salesforce/community/basePath';
import login from '@salesforce/apex/B2B_LoginController.login';
import setUserLanguage from '@salesforce/apex/B2B_LanguageSwitcherController.setUserLanguage'; // Added as a part of BS-397
import LANG from '@salesforce/i18n/lang'; // Added as a part of BS-397
import isGuest from '@salesforce/user/isGuest'; // Added as a part of BS-397
import { redirectToPage, pageManager } from 'c/b2b_utils'; //BS-2004
import { CurrentPageReference } from 'lightning/navigation'; //BS-2239

//LABELS
import LoginHintLine1 from '@salesforce/label/c.B2B_LOGIN_Hint_Line_1';
import LOGIN_HINT_LINE_NB from '@salesforce/label/c.B2B_LOGIN_Hint_Line_1_NB';
import LoginHintLine2 from '@salesforce/label/c.B2B_LOGIN_Hint_Line_2';
import Username from '@salesforce/label/c.B2B_LOGIN_Username';
import Password from '@salesforce/label/c.B2B_LOGIN_Password';
import RememberMe from '@salesforce/label/c.B2B_LOGIN_Remember_Me';
import LogIn from '@salesforce/label/c.B2B_LOGIN_Log_In';
import ForgotPassword from '@salesforce/label/c.B2B_LOGIN_Forgot_Password';
import B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE from '@salesforce/label/c.B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE'; //BS-1662
import B2B_Partner_Portal_Username_Input_Field_Helptext from '@salesforce/label/c.B2B_Partner_Portal_Username_Input_Field_Helptext'; //BS-1859
import LOGIN_PAGE_NOT_REGISTERED_YET_LABEL from '@salesforce/label/c.B2B_LOGIN_PAGE_NOT_REGISTERED_YET_LABEL'; //BS-2004
import SEE_COUNTRY_CODE from '@salesforce/label/c.B2B_See_Country_Code_Label';
import B2B_NB_PARTNER_PORTAL_USERNAME_INPUT_FIELD_HELPTEXT from '@salesforce/label/c.B2B_NB_PARTNER_PORTAL_USERNAME_INPUT_FIELD_HELPTEXT'; //BS-2097

const USER_SHOW_SELECTION = 'userShowMoreSelection'; //Added as part of BS-357
const FILTER_KEY = 'selectedFilters'; //BS-227
const SHOP_LANGUAGE_LOGIN_PAGE = 'shopLanguageLoginPage'; // Added as a part of BS-397
const SHOP_LANGUAGE_LOGOUT_PAGE = 'shopLanguageLogoutPage'; // Added as a part of BS-397
const RENDER_OPEN_FILTER_KEY_VS_RX = 'isOpenFilterAccordionvsrx'; // Added as a part of BS-841
const RENDER_OPEN_FILTER_KEY = 'isOpenFilterAccordion'; // Added as a part of BS-841
const FILTER_GLOBAL_KEY = 'selectedFiltersGlobal'; //Added as part of BS-1084
const FILTER_GLOBAL_SEARCH_TERM = 'searchterm'; //Added as part of BS-1084
const TYPE_KEY = 'typekey'; //Added as part of BS-930
const VS_RX_TYPE_KEY = 'vsrxtypekey'; //Added as part of BS-930
const LOCK_KEY = 'locked'; //Added as part of BS-963
const USER_LOCK_FLAG = 'clickclosed'; //Added as part of BS-963
const TOTAL_PRICE_KEY = 'pricekey'; //Added as a part of BS-1521
const SURVEY_VISBILITY_FLAG = 'homepagesurveyflag'; //Added as part of BS-1509
const USER_CLOSE_FLAG = 'surveyclosed'; //Added as part of BS-1509
const FALSE = 'false'; //BS-1662
const SHOW_POP_UP = 'ShowPopUp'; //BS-1663
const PASSWORD = 'password'; //BS-1855
const TEXT = 'text'; //BS-1855
const PREVIEW_ICON = 'utility:preview'; // BS-1855
const HIDE_ICON = 'utility:hide'; //BS-1855
const ENGLISH_LANG = 'en-US'; //BS-2095
const POPOVER_CLASS = 'country-code-popover'; //BS-2095
const POPOVER_CLASS_LARGE = 'country-code-popover-large'; //BS-2095
const SPECIAL_VARIATION_KEY = 'variationkey'; //BS-2032
const MEDIA_HUB_URL = 'mediaHubURL'; //BS-2239

// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';
export default class B2b_loginForm extends LightningElement {
    @track accountNumber;
    @track showTooltip = false;
    password;
    @track error;
    @track errorMessage;
    _initialRender = true;
    @api isSilhouetteStore;
    passwordFieldType = PASSWORD; //BS-1855
    visibilityControllerIcon = HIDE_ICON; //BS-1855

    //BS-1662
    isNBInactive = false;
    initialNBInactiveErrorResponseMessage =
        B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE.split(',')[0] + B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE.split(',')[1];
    customerServiceLabel = B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE.split(',')[2];
    linkForNBInactiveErrorResponseMessage = B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE.split(',')[3];
    endNBInactiveErrorResponseMessage = B2B_NEUBAU_ACCOUNT_INACTIVE_VALIDATION_MESSAGE.split(',')[4];
    //BS-1662
    _popoverClass = 'country-code-popover'; //BS-2095
    label = {
        LoginHintLine1,
        LoginHintLine2,
        LOGIN_HINT_LINE_NB,
        Username,
        Password,
        RememberMe,
        LogIn,
        ForgotPassword,
        B2B_Partner_Portal_Username_Input_Field_Helptext,
        notRegisteredYet: LOGIN_PAGE_NOT_REGISTERED_YET_LABEL.split(',')[0], //BS-2004
        registerHere: LOGIN_PAGE_NOT_REGISTERED_YET_LABEL.split(',')[1], //BS-2004
        SEE_COUNTRY_CODE, //BS-2095
        nbUsernameHelpText: B2B_NB_PARTNER_PORTAL_USERNAME_INPUT_FIELD_HELPTEXT //BS-2097
    };

    //BS-1859
    get alertIcon() {
        return STORE_STYLING + '/icons/INFO.svg';
    }

    //BS-2095
    get globeIcon() {
        return STORE_STYLING + '/icons/globe.svg';
    }
    //BS-2239
    @wire(CurrentPageReference)
    currentPageReference;

    toggleTooltip() {
        this.showTooltip = !this.showTooltip;
    }

    closeTooltip() {
        this.showTooltip = false;
    }

    renderedCallback() {
        if (this._initialRender) {
            this.prefillFormWhenCookieIsSet();
        }
    }

    /**
     * BS-397
     * connected callback sets the language of the login page into localStorage
     */
    connectedCallback() {
        /* Start : BS-2095 */
        if (LANG !== ENGLISH_LANG) {
            this._popoverClass = POPOVER_CLASS_LARGE;
        } else {
            this._popoverClass = POPOVER_CLASS;
        }
        /* End : BS-2095 */
        if (
            localStorage.getItem(SHOP_LANGUAGE_LOGIN_PAGE) &&
            LANG &&
            localStorage.getItem(SHOP_LANGUAGE_LOGIN_PAGE) !== LANG &&
            localStorage.getItem(SHOP_LANGUAGE_LOGIN_PAGE) !== LANG.toString().replace('-', '_')
        ) {
            this.handleLanguageChangeOnLoad(localStorage.getItem(SHOP_LANGUAGE_LOGIN_PAGE));
            localStorage.removeItem(SHOP_LANGUAGE_LOGIN_PAGE);
        } else {
            this.selectedLang = LANG;
            localStorage.removeItem(SHOP_LANGUAGE_LOGIN_PAGE);
        }
        localStorage.setItem(SHOP_LANGUAGE_LOGOUT_PAGE, LANG);
        localStorage.setItem(SHOW_POP_UP, true); //BS-1663

        //BS-2239
        localStorage.setItem(MEDIA_HUB_URL, undefined);
        if (
            `${this.currentPageReference}` !== undefined &&
            `${this.currentPageReference.state}` !== undefined &&
            `${this.currentPageReference.state.startURL}` !== undefined
        ) {
            localStorage.setItem(MEDIA_HUB_URL, `${this.currentPageReference.state.startURL}`);
        }
    }

    set _accountNumber(value) {
        this.accountNumber = value;
    }

    get forgotPasswordLink() {
        return communityPath + '/ForgotPassword';
    }

    get cookiePrefix() {
        return this.isSilhouetteStore !== false ? 'sil_' : 'nb_';
    }

    get forgotPasswordIcon() {
        return STORE_STYLING + '/icons/Forgotpassword.svg';
    }

    handleAccountNumberChange(event) {
        this.accountNumber = event.target.value;
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
    }
    /**
     * BS-1885
     * Desc : this method handles preview icon click beside the password input field.
     * On click , it shows the typed password in text format until clicked back.
     */
    handlePreviewClick() {
        if (this.passwordFieldType === PASSWORD) {
            this.passwordFieldType = TEXT;
            this.visibilityControllerIcon = PREVIEW_ICON;
        } else {
            this.passwordFieldType = PASSWORD;
            this.visibilityControllerIcon = HIDE_ICON;
        }
    }

    handleLogin(event) {
        this.validateInput();
        this.setCookies();
        if (this.accountNumber && this.password) {
            event.preventDefault();
            const currentLanguage = LANG.includes('-') ? LANG.replace('-', '_') : LANG; //BS-1625
            login({ accountNumber: this.accountNumber, password: this.password, communityId: communityId, language: currentLanguage })
                .then((result) => {
                    //BS-1662 : Checking whether the account status is active for NB shop. If not then showing validation message
                    if (result != undefined && result != null && result == FALSE) {
                        this.error = true;
                        this.isNBInactive = true;
                        //BS-1662 : End
                    } else {
                        localStorage.removeItem(USER_SHOW_SELECTION); //Added as part of BS-357
                        localStorage.removeItem(FILTER_KEY); // BS-227
                        localStorage.removeItem(RENDER_OPEN_FILTER_KEY); //Added as part of BS-841
                        localStorage.removeItem(RENDER_OPEN_FILTER_KEY_VS_RX); //Added as part of BS-841
                        localStorage.removeItem(FILTER_GLOBAL_KEY); //Added as part of BS-1084
                        localStorage.removeItem(FILTER_GLOBAL_SEARCH_TERM); //Added as part of BS-1084
                        localStorage.removeItem(TYPE_KEY); //Added as part of BS-930
                        localStorage.removeItem(VS_RX_TYPE_KEY); //Added as part of BS-930
                        localStorage.removeItem(LOCK_KEY); //Added as part of BS-963
                        localStorage.removeItem(USER_LOCK_FLAG); //Added as part of BS-963
                        localStorage.removeItem(TOTAL_PRICE_KEY); //Added as part of BS-1521
                        localStorage.removeItem(SURVEY_VISBILITY_FLAG); //Added as part of BS-1509
                        localStorage.removeItem(USER_CLOSE_FLAG); //Added as part of BS-1509
                        localStorage.removeItem(SPECIAL_VARIATION_KEY); //Added as part of BS-2032
                        pageManager.clear(); // BS-2128
                        window.location.href = result;
                    }
                })
                .catch((error) => {
                    this.error = true;
                    this.errorMessage = error.body.message;
                });
        }
    }

    validateInput() {
        this.template.querySelectorAll('lightning-input').forEach((element) => {
            element.reportValidity();
        });
    }

    handleRememberMe() {
        this.setCookies();
    }

    createCookie(name, value, days) {
        let expires;
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = '; expires=' + date.toGMTString();
        } else {
            expires = '';
        }
        document.cookie = name + '=' + escape(value) + expires + '; path=/';
    }

    setCookies() {
        if (this.template.querySelector('[data-id="rememberMeCheckbox"]').checked === true && this.accountNumber !== undefined) {
            this.createCookie(this.cookiePrefix + 'shop_username', this.accountNumber, 60);
        } else {
            this.clearCookies(this.cookiePrefix + 'shop_username');
        }
    }

    clearCookies(name) {
        this.createCookie(name, '', null);
    }

    getCookie(name) {
        var cookieString = '; ' + document.cookie;
        var parts = cookieString.split('; ' + name + '=');
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }

    prefillFormWhenCookieIsSet() {
        let accNumber = this.getCookie(this.cookiePrefix + 'shop_username');
        this._initialRender = false;
        if (accNumber) {
            this._accountNumber = accNumber;
            let element = this.template.querySelector('[data-id="rememberMeCheckbox"]');
            element.checked = true;
        }
    }

    /**
     * Added as part ofBS-397
     * This method sets the language of the store according to the language of the logged in user language
     */
    handleLanguageChangeOnLoad(param) {
        let selectedLang = param;
        const currentLang = LANG.includes('-') ? LANG.replace('-', '_') : LANG;
        selectedLang = selectedLang.includes('-') ? selectedLang.replace('-', '_') : selectedLang;
        let pageURL = window.location.href;
        if (!pageURL.includes('?language=')) {
            if (pageURL.includes('?')) {
                pageURL += '&language=' + selectedLang;
            } else {
                pageURL += '?language=' + selectedLang;
            }
        } else if (!pageURL.includes('?language=' + selectedLang)) {
            pageURL = pageURL.replace('language=' + currentLang, 'language=' + selectedLang);
        }
        if (isGuest) {
            window.location.replace(pageURL);
        } else {
            this.isLoading = true;
            setUserLanguage({ languageCode: selectedLang })
                .then(() => {
                    window.location.replace(pageURL);
                })
                .catch((error) => {
                    this.isLoading = false;
                    console.error(error);
                });
        }

        this.isLoading = true;
        setUserLanguage({ languageCode: selectedLang })
            .then(() => {})
            .catch((error) => {
                this.isLoading = false;
                console.error(error);
            });
    }

    /**
     * Added as part of BS-1512
     * This method checks whether the "Enter" button is pressed or not for login.
     */
    handleKeyInput(event) {
        let input_number = event.keyCode;
        if (input_number === 13) {
            this.handleLogin(event);
        }
    }

    /**
     * Added as part of BS-2004
     * This method redirects to get access page.
     */
    registerRedirect() {
        window.location.href = redirectToPage('register-existing-customer');
    }
}
