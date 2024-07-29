import { LightningElement, api } from 'lwc';
import LANG from '@salesforce/i18n/lang';
import { NavigationMixin } from 'lightning/navigation';
import getCollectionCardDetailsForPDP from '@salesforce/apex/D2C_UtilityController.getCollectionCardDetailsForPDP';
import D2C_NB_PDP_LABELS from '@salesforce/label/c.D2C_NB_PDP_LABELS';

// NBD2C-82 Constants - Start
const COLLECTION_SUMMARY_SECTION = 'Collection Summary Section';
const STANDARD_WEBPAGE = 'standard__webPage';
// NBD2C-82 Constants - End

export default class D2C_Dynamic_Collection_Card extends NavigationMixin(LightningElement) {
    /**
     * NBD2C-82
     * This variable holds the current productId
     * @type {String}
     */
    @api
    recordId;

    /**
     * NBD2C-82
     * This variable is used to toggle the display based on the presence of data.
     * @type {Boolean}
     */
    _initialLoadComplete;

    /**
     * NBD2C-82
     * This variable is used to toggle the loader
     * @type {Boolean}
     */
    _dataLoaded = false;

    /**
     * NBD2C-82
     * This collection is used to store the retrieved data and later iterate in the HTML section to display on UI.
     * @type {Array}
     */
    _sectionContentCollection = [];

    /**
     * NBD2C-82
     * This variable holds the section header title.
     * @type {String}
     */
    _headerValue;

    /**
     * NBD2C-82
     * This variable holds the alternative-text for loader.
     * @type {String}
     */
    _loadingLabel = D2C_NB_PDP_LABELS.split(',')[24];

    /**
     * NBD2C-82
     * This method is used to invoke fetchSectionContentData method in presence of recordId.
     */
    connectedCallback() {
        if (this.recordId) {
            this.fetchSectionContentData();
            this._dataLoaded = true;
        }
    }

    /**
     * NBD2C-82
     * This method is used to invoke the getCollectionCardDetailsForPDP method imperatively &
     * retrieve the required data using the current page product Id and language.
     */
    fetchSectionContentData() {
        getCollectionCardDetailsForPDP({ productIdList: [this.recordId], language: LANG.toLowerCase(), sectionType: COLLECTION_SUMMARY_SECTION })
            .then((result) => {
                if (result) {
                    let sectionContentData = JSON.parse(JSON.stringify(result));

                    // Used to store the collection section data
                    let parsedCollection = {};
                    parsedCollection.collectionData = [];

                    // Sort the data in ascending order based on the sortOrder field
                    sectionContentData.sort((record1, record2) => record1.sortOrder - record2.sortOrder);

                    sectionContentData.forEach((element) => {
                        let sectionContent = {};

                        // Check if the currently record type is Collection Summary Section and populate sectionContent object
                        if (element.type == COLLECTION_SUMMARY_SECTION) {
                            sectionContent.active = element.active != null ? element.active : null;
                            sectionContent.brand = element.brand != null ? element.brand : null;
                            sectionContent.header = element.header != null ? element.header : null;
                            sectionContent.title = element.title != null ? element.title : null;
                            sectionContent.subtitle = element.subtitle != null ? element.subtitle : null;
                            sectionContent.buttonLabel = element.buttonLabel != null ? element.buttonLabel : null;
                            sectionContent.buttonLink = element.buttonLink != null ? element.buttonLink : null;
                            sectionContent.imageLink = element.imageLink != null ? element.imageLink : null;
                            sectionContent.imageAlternateText = element.imageAlternateText != null ? element.imageAlternateText : null;
                            sectionContent.sortOrder = element.sortOrder != null ? element.sortOrder : null;
                            if (this._headerValue == undefined || this._headerValue == null) {
                                this._headerValue = sectionContent.header;
                            }

                            // If the current element is even then it will be represented in reverse order (content-image), check for the even number
                            if (
                                parsedCollection.collectionData &&
                                parsedCollection.collectionData.length > 0 &&
                                (parsedCollection.collectionData.length + 1) % 2 == 0
                            ) {
                                sectionContent.isInverseStylingApplicable = true;
                            } else {
                                sectionContent.isInverseStylingApplicable = false;
                            }

                            // Store the records into parsedCollection records
                            if (parsedCollection.collectionData.length < 2) {
                                parsedCollection.collectionData.push(sectionContent);
                            }
                        }
                    });

                    this._sectionContentCollection = JSON.parse(JSON.stringify(parsedCollection));

                    // Display the component as the data is retrieved and ready
                    this._initialLoadComplete = true;
                } else {
                    this._initialLoadComplete = false;
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    /**
     * NBD2C-82
     * This method is used to redirect the user to the particular collection's page when the button on the card is clicked.
     */
    handleRedirection(event) {
        let navigationalLink = event.target.dataset.link;
        this[NavigationMixin.Navigate]({
            type: STANDARD_WEBPAGE,
            attributes: {
                url: navigationalLink
            }
        });
    }
}
