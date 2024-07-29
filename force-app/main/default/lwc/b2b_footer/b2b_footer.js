import { wire, api, LightningElement, track } from 'lwc';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/b2b_pubsub'; //Added as part of BS-656
import { redirectToPage, pageManager } from 'c/b2b_utils'; //Added as part of BS-839
import getCountrySpecificDetails from '@salesforce/apex/B2B_Utils.getCountrySpecificDetails'; //Added as part of BS-1278
import Id from '@salesforce/user/Id'; //Added as part of BS-1278

//labels neubau
import nb_headline from '@salesforce/label/c.B2B_FOOTER_NB_Headline';
import nb_companyname from '@salesforce/label/c.B2B_FOOTER_NB_CompanyName';
import nb_companyaddress from '@salesforce/label/c.B2B_FOOTER_NB_CompanyAddress';
import nb_companyphone from '@salesforce/label/c.B2B_FOOTER_NB_CompanyPhone';
import nb_companyopenings from '@salesforce/label/c.B2B_FOOTER_NB_CompanyOpenings';
import nb_contactus from '@salesforce/label/c.B2B_FOOTER_NB_ContactUs';
import nb_contactsupport from '@salesforce/label/c.B2B_FOOTER_NB_ContactSupport';
import nb_findus from '@salesforce/label/c.B2B_FOOTER_NB_FindUs';
import nb_linkedin from '@salesforce/label/c.B2B_FOOTER_NB_LinkedIn';
import nb_linkedinlink from '@salesforce/label/c.B2B_FOOTER_NB_LinkedInLink';
import nb_instagram from '@salesforce/label/c.B2B_FOOTER_NB_Instagram';
import nb_instagramlink from '@salesforce/label/c.B2B_FOOTER_NB_InstagramLink';
import nb_facebook from '@salesforce/label/c.B2B_FOOTER_NB_Facebook';
import nb_facebooklink from '@salesforce/label/c.B2B_FOOTER_NB_FacebookLink';
import NB_YOUTUBE from '@salesforce/label/c.B2B_FOOTER_NB_Youtube';
import NB_YOUTUBE_LINK from '@salesforce/label/c.B2B_NB_YOUTUBE_LINK';
import nb_information from '@salesforce/label/c.B2B_FOOTER_NB_Information';
import nb_aboutus from '@salesforce/label/c.B2B_FOOTER_NB_AboutUs';
import nb_aboutuslink from '@salesforce/label/c.B2B_FOOTER_NB_AboutUsLink';
import nb_sustainability from '@salesforce/label/c.B2B_FOOTER_NB_Sustainability';
import nb_sustainabilitylink from '@salesforce/label/c.B2B_FOOTER_NB_SustainabilityLink';
import nb_faqs from '@salesforce/label/c.B2B_FOOTER_NB_FAQs';
import nb_faqslink from '@salesforce/label/c.B2B_FOOTER_NB_FAQsLink';
import nb_imprint from '@salesforce/label/c.B2B_FOOTER_NB_Imprint';
import nb_imprintlink from '@salesforce/label/c.B2B_FOOTER_NB_ImprintLink';
import nb_privacypolicy from '@salesforce/label/c.B2B_FOOTER_NB_PrivacyPolicy';
import nb_privacypolicylink from '@salesforce/label/c.B2B_FOOTER_NB_PrivacyPolicyLink';
import NB_LANGUAGE_LABEL from '@salesforce/label/c.B2B_NB_LANGUAGE_LABEL';
import NB_COMPANY_LABEL from '@salesforce/label/c.B2B_NB_COMPANY';
import NB_FOOTER_ALL_RIGHTS_LABEL from '@salesforce/label/c.B2B_NB_FOOTER_ALL_RIGHTS_LABEL';
import NB_FIND_US_LABEL from '@salesforce/label/c.B2B_NB_FIND_US_LABEL';

//labels silhoueette
import sil_companyname from '@salesforce/label/c.B2B_FOOTER_SIL_CompanyName';
import sil_companyphone from '@salesforce/label/c.B2B_FOOTER_SIL_CompanyPhone';
import sil_companyopenings from '@salesforce/label/c.B2B_FOOTER_SIL_CompanyOpenings';
import sil_international from '@salesforce/label/c.B2B_LOGIN_SilhouetteInternational';
import sil_contactsupport from '@salesforce/label/c.B2B_FOOTER_SIL_ContactSupport';
import sil_home from '@salesforce/label/c.B2B_FOOTER_SIL_Home';
import sil_homelink from '@salesforce/label/c.B2B_FOOTER_SIL_HomeLink';
import sil_website from '@salesforce/label/c.B2B_FOOTER_SIL_Website';
import sil_websitelink from '@salesforce/label/c.B2B_FOOTER_SIL_WebsiteLink';
import sil_evileye from '@salesforce/label/c.B2B_FOOTER_SIL_EvilEye';
import sil_evileyelink from '@salesforce/label/c.B2B_FOOTER_SIL_EvilEyeLink';
import sil_certificates from '@salesforce/label/c.B2B_FOOTER_SIL_Certificates';
import sil_certificateslink from '@salesforce/label/c.B2B_FOOTER_SIL_CertificatesLink';
import sil_terms from '@salesforce/label/c.B2B_FOOTER_SIL_Terms';
import sil_termslink from '@salesforce/label/c.B2B_FOOTER_SIL_TermsLink';
import sil_imprint from '@salesforce/label/c.B2B_FOOTER_SIL_Imprint';
import sil_imprintlink from '@salesforce/label/c.B2B_FOOTER_SIL_ImprintLink';
import sil_dataprotection from '@salesforce/label/c.B2B_FOOTER_SIL_DataProtection';
import sil_dataprotectionlink from '@salesforce/label/c.B2B_FOOTER_SIL_DataProtectionLink';
import sil_explore from '@salesforce/label/c.B2B_FOOTER_SIL_Explore';
import nb_explore from '@salesforce/label/c.B2B_FOOTER_NB_Explore'; // Added as part of BS-827
import sil_explorelink from '@salesforce/label/c.B2B_FOOTER_SIL_ExploreLink';
import sil_BackToTop from '@salesforce/label/c.B2B_BACK_TO_TOP'; // BS-867
import B2B_SHOP_PAGES from '@salesforce/label/c.B2B_SHOP_ALL_PAGES'; // Added as part of BS-886
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //Added as a part of BS-867

const BRAND_TYPE_EVT = 'brandTypeEVT';
const EVIL_EYE_BRAND = 'evil-eye';
const SCROLL = 'scroll'; //BS-867
const PLP_PAGES_USING_PAGINATOR_MEMORY = /\b(product|category|vs|rx|reorder|global-search)\b/;

export default class B2b_footer extends NavigationMixin(LightningElement) {
    @api
    isSilhouetteFooter = false;
    isFooterLocated = true;
    isTopButtonVisible = false; //BS-867
    topArrowImg = STORE_STYLING + '/icons/toparrow.svg'; //BS-867

    label = {
        nb_headline,
        nb_companyname,
        nb_companyaddress,
        nb_companyphone,
        nb_companyopenings,
        nb_contactus,
        nb_contactsupport,
        nb_findus,
        nb_linkedin,
        nb_linkedinlink,
        nb_instagram,
        nb_instagramlink,
        nb_facebook,
        nb_facebooklink,
        nb_information,
        nb_aboutus,
        nb_aboutuslink,
        nb_sustainability,
        nb_sustainabilitylink,
        nb_faqs,
        nb_faqslink,
        nb_imprint,
        nb_imprintlink,
        nb_privacypolicy,
        nb_privacypolicylink,
        NB_YOUTUBE, // BS-694
        NB_YOUTUBE_LINK, // BS-694
        NB_FOOTER_ALL_RIGHTS_LABEL, // BS-694
        NB_COMPANY_LABEL, // BS-694
        NB_LANGUAGE_LABEL, // BS-694
        NB_FIND_US_LABEL, // BS-694
        sil_companyname,
        sil_companyphone,
        sil_companyopenings,
        sil_contactsupport,
        sil_home,
        sil_homelink,
        sil_website,
        sil_websitelink,
        sil_evileye,
        sil_evileyelink,
        sil_certificates,
        sil_certificateslink,
        sil_terms,
        sil_termslink,
        sil_imprint,
        sil_imprintlink,
        sil_dataprotection,
        sil_dataprotectionlink,
        sil_explore,
        nb_explore, // Added as part of BS-827
        sil_explorelink,
        sil_international,
        sil_BackToTop // BS-867
    };

    _isEvilEyeProductFooter = false;

    /**
     * BS-1278
     * Id of the current logged in user;
     */
    _currentLoggedInUserId = Id;

    /**
     * BS-1278
     * Id of the current logged in user;
     */
    @track
    _countrySpecificFooterContent = {};

    /**
     * BS-1278
     * Flag to show/hide SH/EE footer
     */
    _showSHEEFooter = false;

    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        this.pageRef = pageRef;
        if (this.pageRef.state.categoryPath != undefined) {
            if (this.pageRef.state.categoryPath.includes(EVIL_EYE_BRAND)) {
                this._isEvilEyeProductFooter = true;
            } else {
                this._isEvilEyeProductFooter = false;
            }
        } else {
            if (this.pageRef) {
                /**START OF BS-886 */
                let currentUrl = window.location.href.split('/s/');
                let currentPageNameInEnglish = currentUrl[1].split('/');
                let currentPageNameInGerman = currentUrl[1].split('?');
                if (B2B_SHOP_PAGES.includes(currentPageNameInEnglish[0]) || B2B_SHOP_PAGES.includes(currentPageNameInGerman[0])) {
                    this._isEvilEyeProductFooter = false;
                    registerListener(BRAND_TYPE_EVT, this.populateBrandValue, this);
                }
                /**END OF BS-886 */
            }
        }
    }

    async connectedCallback() {
        /* Start : BS-1278 */
        if (this._currentLoggedInUserId !== undefined && this._currentLoggedInUserId !== null && this.isSilhouetteFooter == true) {
            await getCountrySpecificDetails({
                currentLoggedInUserId: this._currentLoggedInUserId
            })
                .then((result) => {
                    this._countrySpecificFooterContent = result;
                    this._showSHEEFooter = true;
                })
                .catch((ExceptionInstance) => {
                    console.error(ExceptionInstance);
                    this._showSHEEFooter = false;
                });
        }
        /* End : BS-1278 */

        registerListener(BRAND_TYPE_EVT, this.populateBrandValue, this);
        window.addEventListener(SCROLL, (event) => this.handleScroll()); //BS-867
    }

    renderedCallback() {
        registerListener(BRAND_TYPE_EVT, this.populateBrandValue, this);
        // the following regex specifies all pages where plp is
        if (!PLP_PAGES_USING_PAGINATOR_MEMORY.test(window.location.pathname.toLowerCase())) {
            pageManager.clear();
        }
    }
    disconnectedCallback() {
        window.removeEventListener(SCROLL, (event) => this.handleScroll()); //BS-867
        this._isEvilEyeProductFooter = false;
        unregisterAllListeners(this);
    }

    navigateToContactForm() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Contact_Support'
            }
        });
    }
    populateBrandValue(event) {
        this._isEvilEyeProductFooter = event.checkEvilEye;
    }

    /*
    Added As part of BS-825
    This redirects the User to portal guide
    when clicket on the Portal Guide page.
    */
    navigateToPortalGuideSH() {
        this[NavigationMixin.GenerateUrl]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Portal_Guide_SH__c'
            }
        }).then((url) => {
            window.open(url, '_blank');
        });
    }

    navigateToPortalGuideNB() {
        this[NavigationMixin.GenerateUrl]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Portal_Guide_NB__c'
            }
        }).then((url) => {
            window.open(url, '_blank');
        });
    }

    //BS-867 START
    handleScroll() {
        const scrollTop = window.scrollY;
        if (scrollTop > 50) {
            this.isTopButtonVisible = true;
        } else {
            this.isTopButtonVisible = false;
        }
    }

    handleTopScroll(event) {
        this.topFunction();
    }

    topFunction() {
        const scrollOptions = {
            left: 0,
            top: 0,
            behavior: 'smooth'
        };
        window.scrollTo(scrollOptions);
    }
    //BS-867 END
}
