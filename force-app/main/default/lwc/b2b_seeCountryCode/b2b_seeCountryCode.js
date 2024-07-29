import { LightningElement } from 'lwc';
import B2B_SH_SEE_COUNTRY_CODE from '@salesforce/label/c.B2B_SH_See_Country_Code';
import B2B_SH_SEE_COUNTRY_CODE_HEADER from '@salesforce/label/c.B2B_SH_See_Country_Code_Header';
import B2B_SH_SEE_COUNTRY_CODE_CONTENT from '@salesforce/label/c.B2B_SH_See_Country_Code_Content';

const COUNTRY_CODE_ENDTAGS = '</ul></div>';
const COUNTRY_CODE_START_TAGS = '</div><div class="country-code-container"><ul>';
export default class B2b_seeCountryCode extends LightningElement {
    _countryCodeData = '';
    connectedCallback() {
        this._countryCodeData = '<div class="slds-m-top_medium">' + B2B_SH_SEE_COUNTRY_CODE_HEADER + COUNTRY_CODE_START_TAGS;
        let countryCodeList = B2B_SH_SEE_COUNTRY_CODE.split(',');
        let contentList = B2B_SH_SEE_COUNTRY_CODE_CONTENT.split('|');
        for (let index = 0; index < contentList.length; index++) {
            this._countryCodeData += '<li><span class="fnt-500">' + countryCodeList[index] + '</span> ' + contentList[index];
        }
        this._countryCodeData += COUNTRY_CODE_ENDTAGS;
    }
}
