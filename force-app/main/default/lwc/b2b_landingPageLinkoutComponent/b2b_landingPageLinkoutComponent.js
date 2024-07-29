import { LightningElement, track, wire, api } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi'; //BS-2289

import checkCurrentUserCountryActive from '@salesforce/apex/B2B_AcademyIntegrationController.checkCurrentUserCountryActive'; //BS-2289
import fetchContactsAssociatedWithAccount from '@salesforce/apex/B2B_AcademyIntegrationController.fetchContactsAssociatedWithAccount'; //BS-2289

import STORE_COUNTRY from '@salesforce/schema/Account.Store_Country__c'; //BS-2289

import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';
import WRAP_AROUND_CALCULATOR_LABEL from '@salesforce/label/c.B2B_Wrap_Around_Calculator_Label';
import WRAP_AROUND_CALCULATOR_LINK from '@salesforce/label/c.B2B_WrapAroundCalcultor_Link_For_SH';
import SERVICE_AREA_LABEL from '@salesforce/label/c.B2B_Service_Area_Label';
import SERVICE_AREA_LINK from '@salesforce/label/c.B2B_ServiceArea_Link_For_SH';
import MEDIAHUB_LABEL from '@salesforce/label/c.B2B_Mediahub_Label'; //BS-1820
import MEDIAHUB_LINK from '@salesforce/label/c.B2B_Mediahub_Linkout_URL'; //BS-1820
import ACADEMY_LABEL from '@salesforce/label/c.B2B_ACADEMY_LINKOUT_LABEL'; //BS-2289
import ACADEMY_URL from '@salesforce/label/c.B2B_ACADEMY_LINKOUT_URL'; //BS-2289

const fields = [STORE_COUNTRY]; //BS-204
const ACADEMY_ACCESS = 'academy-access';
const LANGUAGE = '?language='; //BS-2237

export default class B2b_landingPageLinkoutComponent extends LightningElement {
    _wrapAroundCalculatorLabel = WRAP_AROUND_CALCULATOR_LABEL;
    _serviceAreaLabel = SERVICE_AREA_LABEL;
    _mediaHubLabel = MEDIAHUB_LABEL; //BS-1820
    _academyLabel = ACADEMY_LABEL; //BS-2289
    linkoutImg = STORE_STYLING + '/icons/externalLink.svg';

    @api accountId; //BS-2289
    @track isShowAcademy = false; //BS-2289
    @track _academyLink; //BS-2289
    storeCountry; //BS-2289

    //BS-2289
    get resolvedEffectiveAccountId() {
        const effectiveAcocuntId = this.accountId || '';
        let resolved = null;

        if (effectiveAcocuntId.length > 0 && effectiveAcocuntId !== '000000000000000') {
            resolved = effectiveAcocuntId;
        }
        return resolved;
    }

    /**
     * BS-468
     * This variable is used to store link of wrap around calculator for SH
     *
     * @type {String}
     */
    _wrapAroundCalculatorLink = WRAP_AROUND_CALCULATOR_LINK;

    /**
     * BS-468
     * This variable is used to store link of service area for SH
     *
     * @type {String}
     */
    _serviceAreaLink = SERVICE_AREA_LINK;

    /**
     * BS-1820
     * This variable is used to store link of Mediahub for SH
     *
     * @type {String}
     */
    _mediaHubLink = MEDIAHUB_LINK;

    /**
     * This wire method is use to fetch account fields through effective account id of currently logged in user
     * BS-2289
     */
    @wire(getRecord, { recordId: '$resolvedEffectiveAccountId', fields })
    account({ data }) {
        if (data) {
            this.checkCurrentUserCountryIsActiveOrNot(data);
        }
    }

    connectedCallback() {}

    checkCurrentUserCountryIsActiveOrNot(accountData) {
        if (JSON.stringify(accountData) != undefined && JSON.stringify(accountData) != null) {
            this.storeCountry = getFieldValue(accountData, STORE_COUNTRY);

            if (this.storeCountry != undefined && this.storeCountry != null) {
                checkCurrentUserCountryActive({ countryName: this.storeCountry })
                    .then((result) => {
                        if (result != null && result != undefined && result == true) {
                            this.isShowAcademy = true;
                            this.evaluateAcademyUsecases();
                        } //end if
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } //end outer if
        } //end
    }

    //BS-2289 Case 1
    evaluateAcademyUsecases() {
        fetchContactsAssociatedWithAccount({ accountId: this.resolvedEffectiveAccountId })
            .then((result) => {
                if (result != null && result != undefined) {
                    if (result.length == 1) {
                        if (
                            result[0].B2B_Enabled_for_Partner_Portal__c == true &&
                            result[0].LMS_Is_LMS_Contact__c == true &&
                            result[0].LMS_Is_Active__c == true
                        ) {
                            this._academyLink = ACADEMY_URL;
                        } else if (
                            result[0].B2B_Enabled_for_Partner_Portal__c == true &&
                            result[0].LMS_Is_LMS_Contact__c == false &&
                            result[0].LMS_Is_Active__c == false
                        ) {
                            let hrefLocation = window.location.href.split(LANGUAGE)[0];
                            this._academyLink = hrefLocation + ACADEMY_ACCESS;
                        }
                    } else {
                        //BS-2237
                        let hrefLocation = window.location.href.split(LANGUAGE)[0];
                        this._academyLink = hrefLocation + ACADEMY_ACCESS;
                    }
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }
}
