import { LightningElement, api } from 'lwc';
import LANG from '@salesforce/i18n/lang';
import getCountryCodeMetadata from '@salesforce/apex/D2C_UtilityController.getCountryCodeMetadata';
import MAP_URL from '@salesforce/label/c.D2C_RetailerSearchPageSourceURL';

//NBD2C-95: Constants - Start
const GERMANY_COUNTRY = 'Germany';
const MESSAGE_EVENT = 'message';
const RETAILER_DATA_EVENT = 'retailerinformation';
//NBD2C-95: Constants - End

export default class D2C_Retailer_Search_Component extends LightningElement {
    /**
     * NBD2C-65
     * This variable holds the link of the retailer search page
     * @type {String}
     */
    _retailerSearchPageSRC;

    /**
     * NBD2C-65
     * This variable holds the country of the user
     * @type {String}
     */
    _userCountry;

    /**
     * NBD2C-65
     * This variable is used to control rendering of the component
     * @type {Boolean}
     */
    _isReady = false;

    /**
     * NBD2C-65
     * This collection variable contains the countries and country codes
     * @type {Map}
     */
    _countryAndCountryCodesCollection;

    /**
     * NBD2C-65
     * This variable is used to toggle the loading spinner on UI
     * @type {Boolean}
     */
    _isLoadingComplete;

    /**
     * NBD2C-95
     * This variable holds the retailer information received from the 'D2C_RetailerSearchPage' page
     * @type {String}
     */
    _retailerData;

    /**
     * NBD2C-95
     * This variable is used to check if the current cart type is online purchase or not
     * @type {Boolean}
     */
    @api
    isCheckout = false;

    /**
     * NBD2C-95
     * This variable is used to store the selected retailer information received from the parent component
     * @type {Object}
     */
    @api
    retailerDataFromParent;

    /**
     * NBD2C-95
     * This is a getter method to retrieve the latest selected retailer information
     */
    @api
    get retailerDataValue() {
        return this._retailerData;
    }

    /**
     * NBD2C-95
     * This is a setter method to set the value to the _retailerData variable
     */
    set retailerDataValue(data) {
        this._retailerData = data;
    }

    /**
     * NBD2C-95
     * This connected callback is used to call setCountryForRetailerMap method.
     * Also, an event is appended to the window so when child sends any data, it is handled within the handleDataFromPage method.
     */
    connectedCallback() {
        this.setCountryForRetailerMap();
        window.addEventListener(MESSAGE_EVENT, this.handleDataFromPage.bind(this));
    }

    /**
     * NBD2C-95
     * This handler method is invoked immediately after the retailerinformation event is fired from the 'D2C_RetailerSearchPage' page.
     */
    handleDataOfRetailer(data) {
        this._retailerData = data ? JSON.parse(data) : '';
        let retailerData;
        retailerData = this._retailerData ? this.encodeString(JSON.stringify(this._retailerData)) : '';
        sessionStorage.setItem(RETAILER_DATA_EVENT, retailerData); //NBD2C-112

        this.dispatchEvent(new CustomEvent(RETAILER_DATA_EVENT, { detail: this._retailerData }));
    }

    /*
     * This method is used to encode the string stored in session storage
     * NBD2C-112
     */
    encodeString(stringValue) {
        const encoder = new TextEncoder();
        const data = encoder.encode(stringValue);
        return window.btoa(String.fromCharCode.apply(null, data));
    }

    /**
     * NBD2C-65
     * This handler method is invoked as soon as any message is sent from 'D2C_RetailerSearchPage'.
     */
    handleDataFromPage(event) {
        // If the data is from the Retailer Search page then call handleDataOfRetailer method to handle the data.
        event && event.data && event.data.data ? this.handleDataOfRetailer(event.data.data.retailerData) : '';

        // If the data signifies the completed loading of the retailer search, then toggle of the loader.
        this._isLoadingComplete = event && event.data ? event.data : false;
    }

    /**
     * NBD2C-65
     * This method fetches the current country code of the store and sets up the country value that is essential for the retailer search page.
     */
    setCountryForRetailerMap() {
        // Fetching the country and country code mapping from the server (Custom Metadata).
        getCountryCodeMetadata({})
            .then((result) => {
                if (result) {
                    // Storing the countryCodeWiseCountries data obtained from the server into a collection.
                    this._countryAndCountryCodesCollection = new Map(Object.entries(JSON.parse(result)));

                    // Extracting the site's current language and country and performing formatting.
                    let currentLanguage = LANG ? JSON.stringify(LANG.toUpperCase()).split('-') : null;

                    let country = currentLanguage && currentLanguage.length > 1 ? currentLanguage[1].replace('"', '') : currentLanguage[0].replaceAll('"', '');
                    this._countryAndCountryCodesCollection.forEach((countryRecord) => {
                        if (countryRecord && countryRecord.Country_Code__c && country && countryRecord.Country_Code__c == country) {
                            this._userCountry = countryRecord.MasterLabel ? countryRecord.MasterLabel : GERMANY_COUNTRY;
                        }
                    });
                    this._userCountry = this._userCountry ? this._userCountry : GERMANY_COUNTRY;
                } else {
                    this._userCountry = GERMANY_COUNTRY;
                }

                // NBD2C-95: Check if the parent component has sent any retailer data.
                // If yes, then pass the same to 'D2C_RetailerSearchPage' page.
                // Else, check if retailer data is present and send it to 'D2C_RetailerSearchPage' page.
                // In case of the absence of both values, send a null value.
                let selectedRetailer = this.retailerDataFromParent
                    ? JSON.stringify(this.retailerDataFromParent)
                    : this._retailerData
                    ? this._retailerData
                    : null;

                this._retailerSearchPageSRC = MAP_URL
                    ? `${MAP_URL}?country=${this._userCountry}&language=${LANG}&isCheckout=${this.isCheckout}&retailerData=${selectedRetailer}` //NBD2C-95 : &isCheckout=${this.isCheckout}&retailerData=${selectedRetailer}
                    : '';
                this._isReady = true;
            })
            .catch((error) => {
                console.error(error);
                this._isReady = false;
            });
    }
}
