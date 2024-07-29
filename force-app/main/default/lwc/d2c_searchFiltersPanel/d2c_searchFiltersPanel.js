import { LightningElement, api } from 'lwc';
import { debounce } from 'experience/utils';
import { refinementsFromFacetsMap } from './dataConverter';
import { EVENT, OTHER_CONSTANTS } from './constants';

/**
 * @typedef {import('../searchResults/searchResults').SearchFacet} SearchFacet
 */

/**
 * @typedef {import('../searchResults/searchResults').FiltersPanelDetail} FiltersPanelDetail
 */

/**
 * @typedef {import('../searchResults/searchResults').CategoryInfoTree} CategoryInfoTree
 */

/**
 * @typedef {import('../searchFilters/searchFilters').ProductSearchRefinement} ProductSearchRefinement
 */

/**
 * @typedef {import('../searchFilters/searchFilters').SearchFacetValuesCheckMap} SearchFacetValuesCheckMap
 */

/**
 * An event fired when the facet value been updated.
 * @event SearchFiltersPanel#facetvalueupdate
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {SearchFacet} detail.mruFacet
 *   The most recent facet that the user has selected.
 * @property {ProductSearchRefinement[]} detail.refinements
 *   The selected filter id and it's values.
 */

/**
 * An event fired to clear all filters
 * @event SearchFiltersPanel#clearallfilters
 * @type {CustomEvent}
 */
/**
 * Representation for the Filters Panel which shows the category tree and facets
 * @fires SearchFiltersPanel#facetvalueupdate
 * @fires SearchFiltersPanel#clearallfilters
 */
export default class SearchFiltersPanel extends LightningElement {
    static renderMode = 'light';

    /**
     * Gets or sets the filters panel display-data.
     * @type {FiltersPanelDetail}
     * NBD2C-48
     * NBD2C-48
     */
    @api
    get displayData() {
        return this._displayData;
    }

    /**
     * Map to store the lens shape field values label and Api name
     * @type {Map}
     * NBD2C-48
     * NBD2C-48
     */
    shapelabelVsApiNameMap = new Map();

    /**
     * Boolean to determine device type
     * @type {Boolean}
     *  NBD2C-48
     * NBD2C-48
     */
    _isDesktopDevice = true;

    /**
     * setter for display data
     * @type {Array}
     *  NBD2C-48
     * NBD2C-48
     */
    set displayData(value) {
        this._displayData = value;
        const facets = value?.facets ?? [];
        this._facetsMap = this._createFacetMap(facets);
    }

    /**
     * Gets the normalized filters panel display-data.
     * @type {FiltersPanelDetail}
     * @private
     * NBD2C-48
     */
    get normalizedDisplayData() {
        const displayData = this.displayData;
        return {
            facets: displayData?.facets ?? [],
            categories: displayData?.categories
        };
    }

    /**
     * Gets the list of facets
     * @type {SearchFacet[]}
     * NBD2C-48
     * @private
     * NBD2C-48
     */
    get facets() {
        let returnList = [];

        this.normalizedDisplayData.facets.forEach((element) => {
            let tempObj = JSON.parse(JSON.stringify(element));
            let fieldNameList = tempObj.id.split(OTHER_CONSTANTS.COLON);
            let fieldName = '';
            if (fieldNameList.length > 0) {
                fieldName = fieldNameList[0];
            }
            if (fieldName === OTHER_CONSTANTS.FRAME_COLOR) {
                tempObj.isColorField = true;
                tempObj.isDesignField = false;
                tempObj.isOtherField = false;
            } else if (fieldName === OTHER_CONSTANTS.DESIGN_FAMILY) {
                tempObj.isColorField = false;
                tempObj.isDesignField = true;
                tempObj.isOtherField = false;
            } else {
                tempObj.isColorField = false;
                tempObj.isDesignField = false;
                tempObj.isOtherField = true;
            }
            returnList.push(tempObj);
        });

        return returnList;
    }

    /**
     * Gets the categories tree
     * @type {CategoryInfoTree}
     * @private
     * NBD2C-48
     */
    get categories() {
        return this.normalizedDisplayData.categories;
    }
    /**
     * The map of all SearchFacetValuesCheckMap and all their possible facet values, regardless of selection or not.
     * @type {Map<string | undefined, SearchFacetValuesCheckMap> | null}
     * NBD2C-48
     */
    _facetsMap;

    /**
     * The most recent facet that the user has selected
     * @type {SearchFacet}
     * @private
     * NBD2C-48
     */
    _mruFacet = {};

    /**
     * The ID of the most recent facet that the user has selected
     * @type {string}
     * @private
     * NBD2C-48
     */
    _mruFacetId;

    /**
     * The filters panel display-data.
     * @type {FiltersPanelDetail}
     * @private
     * NBD2C-48
     */
    _displayData;

    /**
     * Handler for the 'onfacetvaluetoggle' event fired from inputFacet
     * @param {CustomEvent} evt the event object
     * NBD2C-48
     */

    connectedCallback() {
        this.detectDeviceType();
    }

    /**
     * This method detects the device type and setup the component accordingly
     * NBD2C-48
     */
    detectDeviceType = () => {
        const isMobile = window.matchMedia(OTHER_CONSTANTS.MOBILE_DEVICE_DIMENSIONS).matches;
        const isTablet = window.matchMedia(OTHER_CONSTANTS.TABLET_DEVICE_DIMENSIONS).matches;
        this._isDesktopDevice = isMobile || isTablet ? false : true;
    };

    /**
     * This method is a handler for facet value toggle
     * NBD2C-48
     */
    handleFacetValueToggle(evt) {
        if (evt.target instanceof HTMLElement) {
            this._mruFacetId = evt.detail.facetId;
            const facetValueId = evt.detail.id;
            const checked = evt.detail.checked;
            this.dispatchEvent(
                new CustomEvent(EVENT.FILTER_VALUE_SELECTION, {
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                    detail: {
                        facetValueId: facetValueId,
                        facetId: this._mruFacetId
                    }
                })
            );
            if (this._mruFacetId && this._facetsMap?.get(this._mruFacetId)) {
                this._facetsMap.get(this._mruFacetId)?.valuesCheckMap.set(facetValueId, checked);
            }
            this._facetValueUpdated();
        }
    }

    /**
     * This method returns the facet map
     * NBD2C-48
     */
    _createFacetMap(facets) {
        return facets?.reduce((facetAccumulator, searchFacet) => {
            return facetAccumulator.set(searchFacet.id, {
                searchFacet,
                valuesCheckMap: new Map(searchFacet.values?.map((facetValue) => [facetValue.id, facetValue.checked]))
            });
        }, new Map());
    }

    /**
     * The function called when we update the facets in the search
     * @type {Function}
     * @private
     * @fires SearchFiltersPanel#facetvalueupdate
     * NBD2C-48
     */
    _facetValueUpdated = debounce(() => {
        const mruFacetList = this.facets?.filter((facet) => facet.id === this._mruFacetId);
        if (mruFacetList && mruFacetList.length === 1) {
            this._mruFacet = mruFacetList[0];
        }
        const updatedMruFacet = Object.assign({}, this._mruFacet);
        updatedMruFacet.values = updatedMruFacet.values.map((item) => {
            return {
                ...item,
                checked: this._facetsMap?.get(this._mruFacetId)?.valuesCheckMap.get(item.id)
            };
        });
        this._mruFacet = updatedMruFacet;
        const refinements = refinementsFromFacetsMap(this._facetsMap);
        this.dispatchEvent(
            new CustomEvent(EVENT.FACETVALUE_UPDATE_EVT, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    mruFacet: this._mruFacet,
                    refinements
                }
            })
        );
    }, 300);

    /**
     * Handler for the 'click' event fired from the Clear All button
     * Resets the facetsMap and triggers the 'clearallfilters' event
     * @param {CustomEvent} evt the event object
     * @fires SearchFiltersPanel#clearallfilters
     * NBD2C-48
     */
    @api
    handleClearAll(evt) {
        evt.preventDefault();
        if (this._facetsMap) {
            this._facetsMap.clear();
            this._facetsMap = null;
        }
        this.dispatchEvent(
            new CustomEvent(EVENT.CLEAR_ALL_FILTERS_EVT, {
                bubbles: true,
                composed: true
            })
        );
    }
}
