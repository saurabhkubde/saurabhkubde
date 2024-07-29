import { api, LightningElement } from 'lwc';
import LANG from '@salesforce/i18n/lang';
import isGuest from '@salesforce/user/isGuest';
import communityId from '@salesforce/community/Id';

import setUserLanguage from '@salesforce/apex/B2B_LanguageSwitcherController.setUserLanguage';
import getAvailableWebstoreLanguages from '@salesforce/apex/B2B_LanguageSwitcherController.getAvailableLanguages';

import languageSwitcherPlaceholder from '@salesforce/label/c.B2B_ACC_Language_Switcher_Placeholder';

const SH_STORE = 'silhouette';
const CHINESE_LANG_BY_DEFAULT = 'zh_Hans-CN'; //BS-2234
const CHINESE_ORIGINAL_LANG = 'zh_CN'; //BS-2234
const SHOP_LANGUAGE_LOGOUT_PAGE = 'shopLanguageLogoutPage'; // Added as a part of BS-397
const SHOP_LANGUAGE_LOGIN_PAGE = 'shopLanguageLoginPage'; // Added as a part of BS-397
const LANGUAGE_CHANGED_VARIABLE = 'languageChanged'; //BS-2185
import LANGUAGE_SWITCHER_LABEL_SH from '@salesforce/label/c.B2B_ACC_Language_Switcher_Label_SH'; //BS-746
import LANGUAGE_SWITCHER_LABEL_NB from '@salesforce/label/c.B2B_ACC_Language_Switcher_Label_NB'; //BS-746
export default class B2b_languageSwitcher extends LightningElement {
    @api
    isFooterLocated;
    languages;
    isLoading = false;
    selectedLang; // Added as a part of BS-397
    @api
    isSilhouetteSite;

    label = {
        languageSwitcherPlaceholder,
        LANGUAGE_SWITCHER_LABEL_SH, // BS-746
        LANGUAGE_SWITCHER_LABEL_NB //  BS-746
    };

    _isSilhouetteStore = false;

    connectedCallback() {
        // Added as a part of BS-397 --- start
        if (localStorage.getItem(SHOP_LANGUAGE_LOGOUT_PAGE) && LANG != localStorage.getItem(SHOP_LANGUAGE_LOGOUT_PAGE)) {
            this.handleLanguageChangeOnLoad(localStorage.getItem(SHOP_LANGUAGE_LOGOUT_PAGE));
            this.selectedLang = localStorage.getItem(SHOP_LANGUAGE_LOGOUT_PAGE);
            localStorage.removeItem(SHOP_LANGUAGE_LOGOUT_PAGE);
        } else {
            this.selectedLang = LANG;
            localStorage.removeItem(SHOP_LANGUAGE_LOGOUT_PAGE);
        }
        //BS-397 --- end

        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');

        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }
        if (this.selectedLang.includes('-')) {
            this.selectedLang = this.selectedLang.replace('-', '_');
        }
        this.loadAvailableWebstoreLanguages();
        //Added as a part of BS-1414
        if (localStorage.getItem(SHOP_LANGUAGE_LOGIN_PAGE) == null) {
            localStorage.setItem(SHOP_LANGUAGE_LOGIN_PAGE, this.selectedLang);
        }
    }

    loadAvailableWebstoreLanguages() {
        getAvailableWebstoreLanguages({
            communityOrWebstoreId: communityId
        })
            .then((result) => {
                this.languages = result;
                this.isLoading = false;
            })
            .catch((error) => {
                console.log(error);
            });
    }

    get selectedLanguage() {
        if (LANG.includes('-')) {
            return LANG.split('-')[0].toUpperCase();
        }
        return LANG.toUpperCase();
    }

    handleChangeLanguage(event) {
        //BS-2185
        localStorage.setItem(LANGUAGE_CHANGED_VARIABLE, 'true');
        // BS-496 Called the loading variable when the actual language switch happens instead of calling it from onload. This is done to prevent
        // any additional loader on any page.
        this.isLoading = true;
        let currentLang = LANG.includes('-') ? LANG.replace('-', '_') : LANG;
        //This is only for chinese simplified language BS-2234
        if (currentLang == CHINESE_LANG_BY_DEFAULT) {
            currentLang = CHINESE_ORIGINAL_LANG;
        }
        let selectedLang = event.target.value;
        localStorage.setItem(SHOP_LANGUAGE_LOGIN_PAGE, selectedLang); // Added as a part of BS-397
        selectedLang = selectedLang.includes('-') ? selectedLang.replace('-', '_') : selectedLang;
        let pageURL = window.location.href;

        if (!pageURL.includes('language=')) {
            if (pageURL.includes('?')) {
                pageURL += '&language=' + selectedLang;
            } else {
                pageURL += '?language=' + selectedLang;
            }
        } else if (pageURL.includes('language=' + currentLang)) {
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
                    // eslint-disable-next-line no-console
                    console.log(error);
                });
        }

        this.isLoading = true;
        setUserLanguage({ languageCode: selectedLang })
            .then(() => {
                //window.location.replace(pageURL);
            })
            .catch((error) => {
                this.isLoading = false;
                // eslint-disable-next-line no-console
                console.log(error);
            });
    }

    /**
     * Added as part ofBS-397
     * This method sets the language of the store according to the language of the login page
     */
    handleLanguageChangeOnLoad(param) {
        let selectedLang = param;
        selectedLang = selectedLang.includes('-') ? selectedLang.replace('-', '_') : selectedLang;
        let pageURL = window.location.href;
        if (!pageURL.includes('language=')) {
            if (pageURL.includes('?')) {
                pageURL += '&language=' + selectedLang;
            } else {
                pageURL += '?language=' + selectedLang;
            }
        } else if (pageURL.includes('language=' + selectedLang)) {
            pageURL = pageURL;
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
}
