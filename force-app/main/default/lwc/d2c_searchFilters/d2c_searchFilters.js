import { LightningElement, api, wire } from 'lwc';
import { getFormFactor } from 'experience/clientApi';
import PLP_LABELS from '@salesforce/label/c.D2C_PLP_Labels';

/**
 * @typedef {import('../searchResults/searchResults').SearchFacet} SearchFacet
 */

/**
 * @typedef {import('../searchResults/searchResults').FiltersPanelDetail} FiltersPanelDetail
 */

/**
 * @typedef {import('../searchResults/searchResults').ProductSearchResultSummary} ProductSearchResultSummary
 */

/**
 * The search facets values check map. This is to keep track of the facets
 *  values that has been checked to create refinements for the search query.
 * @typedef {object} SearchFacetValuesCheckMap
 * @property {SearchFacet} searchFacet
 *  The search facet display-data.
 * @property {Map<string, boolean>} valuesCheckMap
 *  A map of facet-value-id with its check/uncheck state.
 */

const MOBILE_DEVICE_DIMENSIONS = '(max-width: 767px)';
const TABLET_DEVICE_DIMENSIONS = '(min-width: 768px) and (max-width: 1024px)';
const FRAME_COLOR = 'B2B_Frame_Color__c';
const CLEAR_ALL_FILTERS = 'clearallfilters';

export default class SearchFilters extends LightningElement {
    static renderMode = 'light';
    @wire(getFormFactor)
    formFactor;
    get isDesktop() {
        return this.formFactor === 'Large';
    }

    /**
     * Filter Products button label
     * @type {string}
     * @readonly
     *  NBD2C-48
     */
    _showFiltersButton = 'Filter Products';

    /**
     * Reset button label
     * @type {string}
     * @readonly
     *  NBD2C-48
     */
    _resetButton = 'Reset';

    /**
     * Search Results data passed down by the wrapper component
     * @type {ProductSearchResultSummary}
     *  NBD2C-48
     */
    @api
    searchResults;

    /**
     * Boolean to determine the click of show filters button
     * @type {Boolean}
     *  NBD2C-48
     */
    _showFilterButton = true;

    /**
     * Category Label to display
     * @type {String}
     *  NBD2C-48
     */
    @api
    categoryNameLabel;

    /**
     * Category description to display
     * @type {String}
     *  NBD2C-48
     */
    @api
    categoryNameDescription;

    /**
     * Boolean to determine device type
     * @type {Boolean}
     *  NBD2C-48
     */
    _isDesktopDevice = false;

    /**
     * List of facets data
     * @type {Array}
     *  NBD2C-48
     */
    @api
    facets = [];

    /**
     * Ensure Search Results data has needed property
     * @type {FiltersPanelDetail}
     * @readonly
     * @private
     *  NBD2C-48
     */
    get normalizedSearchFilters() {
        return this.searchResults?.filtersPanel ?? {};
    }

    connectedCallback() {
        this.createLabels();
        this.detectDeviceType();
    }

    renderedCallback() {
        if (this.searchResults !== undefined && this.searchResults !== null) {
            this.facets = this.normalizedSearchFilters.facets;
        }
        if (this.facets !== undefined && this.facets !== null) {
            this.clearLocalStorage();
        }
    }
    /**
     * NBD2C-48
     * This method detects the device type and setup the component accordingly
     *  NBD2C-48
     */
    detectDeviceType = () => {
        const isMobile = window.matchMedia(MOBILE_DEVICE_DIMENSIONS).matches;
        const isTablet = window.matchMedia(TABLET_DEVICE_DIMENSIONS).matches;
        this._isDesktopDevice = isMobile || isTablet ? false : true;
    };

    /**
     * NBD2C-48
     * This method clears the local storage
     *  NBD2C-48
     */
    clearLocalStorage() {
        let colorFilterValues = [];
        let clearLocalStorage;
        this.facets.forEach((element) => {
            if (element.nameOrId == FRAME_COLOR) {
                colorFilterValues = element.values;
            }
        });
        if (colorFilterValues.length > 0) {
            clearLocalStorage = true;
            colorFilterValues.forEach((element) => {
                if (element.checked == true) {
                    clearLocalStorage = false;
                }
            });
        }

        if (clearLocalStorage === true) {
            localStorage.clear();
        }
    }

    /**
     * Labels used in Product Card
     * NBD2C-48
     */
    createLabels() {
        this._showFiltersButton = PLP_LABELS.split(',')[1];
        this._resetButton = PLP_LABELS.split(',')[2];
    }
    /**
     * Handles opening the filters modal while on mobile only
     * @param {CustomEvent} event click event
     * @fires SearchFilters#openmodal
     *  NBD2C-48
     */
    handleOpenSearchFiltersModal() {
        this._showFilterButton = !this._showFilterButton;
    }

    /**
     * Handler for the 'click' event fired from the Clear All button
     * Resets the facetsMap and triggers the 'clearallfilters' event
     * @param {CustomEvent} evt the event object
     * @fires SearchFiltersPanel#clearallfilters
     *  NBD2C-48
     */
    handleClearAll(evt) {
        this.dispatchEvent(
            new CustomEvent(CLEAR_ALL_FILTERS, {
                bubbles: true,
                composed: true
            })
        );
    }
}
