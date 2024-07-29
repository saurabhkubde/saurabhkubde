import { LightningElement, track, api, wire } from 'lwc';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //Added for BS-692

// CUSTOM FIELD AND OBJECT
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import BRAND_FIELD from '@salesforce/schema/Product2.B2B_Brand__c';
import PRODUCT from '@salesforce/schema/Product2';

const FILTER_SELECTION_BRAND = 'filterselectionbrand';
const RADIO_BUTTON = 'Radio Button';
const BOTH_BRAND = 'both';
const SILHOUETTE_BRAND = 'Silhouette';
const EVIL_EYE_BRAND = 'evil eye';
const SH_STORE = 'silhouette'; //BS-692

export default class B2b_brandRadioButtonComponent extends LightningElement {
    @track _brandOptions = [];
    @track _gloablBrandOptions = [];
    previousSelected;
    @api isSelected;
    @wire(getObjectInfo, { objectApiName: PRODUCT })
    productInfo;
    @api selectedBrandValue;
    _isSilhouetteStore = false; //BS-692

    /**
     * Flag to control visibility of brand radio button
     * BS-955
     * @type {Boolean}
     */
    @api
    showBrandButton;

    /**
     * Flag to control visibility of silhouette brand radio button
     * BS-955
     * @type {Boolean}
     */
    @api
    showSilhouetteButton;

    /**
     * Flag to control visibility of evil eye brand radio button
     * BS-955
     * @type {Boolean}
     */
    @api
    showEvilEyeButton;

    /**
     * BS-692
     * Get the checked icon for radio button
     *
     */
    get radioButtonIcon() {
        let radioIcon;
        radioIcon = {
            icon: STORE_STYLING + '/icons/check.svg'
        };
        return radioIcon;
    }

    connectedCallback() {
        let currentUrl = window.location.href.split('/s/'); //BS-692
        let currentStore = currentUrl[0].split('/');

        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }
    }

    renderedCallback() {
        this.template.host.style.setProperty('--background-image-url', `url(${this.radioButtonIcon.icon})`);
    }

    /**
     * BS-443
     * This method sets the brand options on the reorder page.
     *
     */
    @wire(getPicklistValues, { recordTypeId: '$productInfo.data.defaultRecordTypeId', fieldApiName: BRAND_FIELD })
    brandValue({ error, data }) {
        if (data) {
            data.values.forEach((item) => {
                if (this.showBrandButton && (item.label === SILHOUETTE_BRAND || item.label == EVIL_EYE_BRAND)) {
                    /*
                     * Start BS-955
                     * Updated block to push evil eye in brand options only if order products have evil eye product in it.
                     */
                    if (this.showEvilEyeButton && item.label === EVIL_EYE_BRAND) {
                        this._brandOptions.push({
                            label: item.label,
                            field: 'B2B_Brand__c',
                            value: item.label,
                            checked: false
                        });
                    } else if (this.showSilhouetteButton && item.label === SILHOUETTE_BRAND) {
                        this._brandOptions.push({
                            label: item.label,
                            field: 'B2B_Brand__c',
                            value: item.label,
                            checked: false
                        });
                    }
                }
                this._gloablBrandOptions = JSON.parse(JSON.stringify(this._brandOptions));
                /* End BS-955 */
            });
        } else if (error) {
            console.log(error);
        }
    }

    /**
     * BS-443
     * This method fires an event when user selects any filter options/values
     *
     */
    handleSelection(event) {
        const field = event.target.dataset.name;
        let selectedValue = event.target.value;
        var isChecked = event.target.checked;

        let optionToShowList = [];
        this._brandOptions.forEach((brand) => {
            if (brand.label == selectedValue) {
                brand.checked = !brand.checked;
                optionToShowList.push(brand);
            } else {
                brand.checked = false;
            }
        });

        this._brandOptions = optionToShowList;

        if (this.previousSelected == selectedValue) {
            selectedValue = BOTH_BRAND;
            this.previousSelected = BOTH_BRAND;
        } else {
            this.previousSelected = selectedValue;
        }

        this.selectedBrandValue = selectedValue;

        this.dispatchEvent(
            new CustomEvent(FILTER_SELECTION_BRAND, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    field: field,
                    value: selectedValue,
                    filterType: RADIO_BUTTON,
                    checked: isChecked
                }
            })
        );
    }

    @api
    persistBrandSelection() {
        this._brandOptions.forEach((brand) => {
            if (brand.label == this.selectedBrandValue && this.previousSelected != this.selectedBrandValue) {
                brand.checked = !brand.checked;
                this.template.querySelector(`[value="${this.selectedBrandValue}"]`).setAttribute('checked', true);
                this.previousSelected = this.selectedBrandValue;
            }
        });
    }
    @api
    clearBrandFilters() {
        this._isSilhouetteStore = false;
        this._brandOptions = this._gloablBrandOptions;
        this._brandOptions.forEach((brand) => {
            brand.checked = false;
        });
        this.previousSelected = BOTH_BRAND;
        this._isSilhouetteStore = true;
    }
}
