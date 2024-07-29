import { LightningElement, api, track } from 'lwc';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';

// EVENT NAME CONSTANTS
const FILTER_SELECTION = 'filterselection';
const RADIO_BUTTON = 'Radio Button';
const LOADING_EVENT = 'loading';
const FILTERS_ENABLE_SEARCH_OPTIONS_LIMIT = 8;
import SEARCH from '@salesforce/label/c.B2B_SEARCH';

export default class B2b_vs_rx_radio_button_component extends LightningElement {
    /**
     * Property to store open sections of accordian
     * BS-708
     * @type {Array}
     */
    _sections;

    /**
     * Name of filters having open sections of accordian
     * BS-708
     * @type {String}
     */
    @track
    openSectionFilterName;

    /**
     * Collection of filters to be displayed on UI
     * This collection is transfered from b2b_filterContainer component
     * BS-708
     * @type {Array}
     */
    @api
    filters;

    /**
     * Collection of all filter preference setting records
     * BS-708
     * @type {Array}
     */
    @api
    globalFilters;

    /**
     * Collection to store the selections
     * BS-930
     * @type {Array}
     */
    @track
    _selectedFilters;

    @track
    _filterOptions = {};

    @track
    searchTerm = '';

    isSearchableFilter = false;
    searchLabel = SEARCH;

    /**
     * BS-708
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

    /**
     * BS-708
     *
     * Method to fire event for loading b2b_filterContainer component
     */
    fireDoLoad(isLoading) {
        this.dispatchEvent(
            new CustomEvent(LOADING_EVENT, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    isLoading
                }
            })
        );
    }

    /**
     * BS-708
     * This method fires an event when user selects any filter options/values
     *
     */
    connectedCallback() {
        this._filterOptions = JSON.parse(JSON.stringify(this.filters));
        let filtersList = JSON.parse(JSON.stringify(this.filters));
        if (this.isEligibleForSearching(this.filters.availableFilters.filterValues.picklistValues)) {
            this.isSearchableFilter = true;
        }
        this._filterOptions = filtersList;
    }
    handleSelection(event) {
        const field = event.target.dataset.name;
        const picklistApiName = event.target.dataset.apiName;
        let multiselectEnabled = false;
        /* Start BS-930 */
        let filterTypeValue;
        if (this.filters.availableFilters.filterType === RADIO_BUTTON && this.filters.availableFilters.isMultiselect === false) {
            filterTypeValue = RADIO_BUTTON;
            this._selectedFilters = picklistApiName;
        } else if (this.filters.availableFilters.filterType === RADIO_BUTTON && this.filters.availableFilters.isMultiselect === true) {
            let selectedValues = [];
            this._selectedFilters = '';
            multiselectEnabled = true;
            filterTypeValue = RADIO_BUTTON;
            for (let index = 0; index < this.filters.availableFilters.filterValues.picklistValues.length; index++) {
                if (
                    this.filters.availableFilters.filterValues.picklistValues[index].picklistValue !== undefined &&
                    this.filters.availableFilters.filterValues.picklistValues[index].isValueChecked === true &&
                    this.filters.availableFilters.filterValues.picklistValues[index].apiName !== picklistApiName
                ) {
                    selectedValues.push(this.filters.availableFilters.filterValues.picklistValues[index].apiName);
                } else if (
                    this.filters.availableFilters.filterValues.picklistValues[index].picklistValue !== undefined &&
                    this.filters.availableFilters.filterValues.picklistValues[index].isValueChecked === false &&
                    this.filters.availableFilters.filterValues.picklistValues[index].apiName === picklistApiName
                ) {
                    selectedValues.push(this.filters.availableFilters.filterValues.picklistValues[index].apiName);
                }
            }
            if (selectedValues.length === 1) {
                this._selectedFilters = selectedValues[0];
            } else {
                for (let index = 0; index < selectedValues.length; index += 2) {
                    if (index <= selectedValues.length - 2 || selectedValues.length === 2) {
                        if (this._selectedFilters !== '') {
                            this._selectedFilters += ';';
                        }
                        this._selectedFilters += selectedValues[index] + ';';
                        if (selectedValues[index + 1] !== undefined && selectedValues[index + 1] !== null && selectedValues[index + 1] !== '') {
                            this._selectedFilters += selectedValues[index + 1];
                        }
                    } else if (index === selectedValues.length - 1) {
                        this._selectedFilters += ';' + selectedValues[index];
                    }
                }
            }
        }
        /* End BS-930 */

        const isChecked = event.target.checked;
        this.dispatchEvent(
            new CustomEvent(FILTER_SELECTION, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    field: field,
                    value: this._selectedFilters,
                    filterType: filterTypeValue,
                    isMultiselect: multiselectEnabled,
                    checked: isChecked,
                    fieldName: this.filters.availableFilters.sourceProductField // Added as part of BS-841
                }
            })
        );
    }

    /**
     * BS-708
     * This method is used to handle event fired when user clicks on dropdown arrow of filter
     *
     */
    handleSectionToggle(event) {
        this._sections = event.detail.openSections;
    }

    renderedCallback() {
        this.template.host.style.setProperty('--background-image-url', `url(${this.radioButtonIcon.icon})`);
        if (this.filters) {
            this.fireDoLoad(false);
        }
    }

    isEligibleForSearching(filterOptionsList) {
        let validOptionsCount = 0;
        filterOptionsList.forEach((filterOption) => {
            validOptionsCount = filterOption.apiName != null && filterOption.picklistValue != null ? validOptionsCount + 1 : validOptionsCount;
        });
        return validOptionsCount > FILTERS_ENABLE_SEARCH_OPTIONS_LIMIT ? true : false;
    }

    handleSearch(event) {
        let searchedValue = String(event.target.value).toLowerCase();
        let filtersArray = JSON.parse(JSON.stringify(this.filters));
        let filtersOptionsToDisplay = [];
        this.searchTerm = String(event.target.value);
        let filterOptionSearchIndexMap = new Map();
        if (
            filtersArray != null &&
            filtersArray.availableFilters != null &&
            filtersArray.availableFilters.filterValues != null &&
            filtersArray.availableFilters.filterValues.picklistValues != null
        ) {
            filtersArray.availableFilters.filterValues.picklistValues.forEach((filterPicklistOption) => {
                if (
                    filterPicklistOption != null &&
                    filterPicklistOption != undefined &&
                    filterPicklistOption.picklistValue != null &&
                    filterPicklistOption.picklistValue != undefined &&
                    searchedValue != null &&
                    searchedValue != undefined &&
                    String(filterPicklistOption.picklistValue).toLowerCase().includes(searchedValue)
                ) {
                    let appearenceIndex = String(filterPicklistOption.picklistValue).toLowerCase().indexOf(searchedValue);
                    if (filterOptionSearchIndexMap.has(appearenceIndex)) {
                        filterOptionSearchIndexMap.get(appearenceIndex).push(filterPicklistOption);
                    } else {
                        filterOptionSearchIndexMap.set(appearenceIndex, [filterPicklistOption]);
                    }
                }
            });
        }
        if (filterOptionSearchIndexMap.size > 0) {
            filtersOptionsToDisplay = [];
            let appearenceIndexSet = filterOptionSearchIndexMap.keys();
            let appearenceIndexListToSort = Array.from(appearenceIndexSet);
            appearenceIndexListToSort.sort(function (firstIndex, secondIndex) {
                return firstIndex - secondIndex;
            });
            appearenceIndexListToSort.forEach((indexOfAppearence) => {
                if (filterOptionSearchIndexMap.has(indexOfAppearence)) {
                    filtersOptionsToDisplay = filtersOptionsToDisplay.concat(filterOptionSearchIndexMap.get(indexOfAppearence));
                }
            });
        }

        filtersArray.availableFilters.filterValues.picklistValues = filtersOptionsToDisplay;
        this._filterOptions = {};
        this._filterOptions = JSON.parse(JSON.stringify(filtersArray));
    }
}
