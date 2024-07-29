import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { createSearchFiltersClearAction, createSearchFiltersUpdateAction, dispatchAction } from 'commerce/actionApi';
import CATEGORY_DESCRIPTION from '@salesforce/label/c.D2C_Category_Description';
import D2C_NB_PDP_LABELS from '@salesforce/label/c.D2C_NB_PDP_LABELS';

const DEFAULT_SEARCH_FILTER_PAGE = 1;

/**
 * @typedef {import('../searchResults/searchResults').SearchFacet} SearchFacet
 */

/**
 * @typedef {import('../searchResults/searchResults').ProductSearchRefinement} ProductSearchRefinement
 */

/**
 * @typedef {import('../searchResults/searchResults').ProductSearchResultSummary} ProductSearchResultSummary
 */

/**
 * Component that displays the category tree and facets for search filters
 */

const COLON_SEPARATOR = '::';
const SEPARATOR = '||';
export default class BuilderSearchFilters extends LightningElement {
    static renderMode = 'light';

    /**
     * Retrieves the search term, categoryId and refinements
     * to pass to the modal component so that it can apply correct filter to results
     *  NBD2C-48
     */
    @wire(CurrentPageReference)
    currentPageReference;

    /**
     * Results returned from the Search Data Provider
     * @type {ProductSearchResultSummary}
     *  NBD2C-48
     */
    @api
    searchResults;

    /**
     * Category Label to be displayed
     * @type {String}
     *  NBD2C-48
     */
    _categoryLabel = '';

    /**
     * Category Description to be displayed
     * @type {String}
     *  NBD2C-48
     */
    _categoryNameDescription = '';

    /**
     * Results returned from the Search Data Provider
     * @type {Boolean}
     *  NBD2C-48
     */
    _categoryDataUpdated = false;

    /**
     * Boolean to determine whether to show the spinner
     * @type {Boolean}
     *  NBD2C-48
     */
    _isLoading = true;

    _loadingLabel = D2C_NB_PDP_LABELS.split(',')[24];

    /**
     * Boolean to determine if there are products in the search result
     * @type {Boolean}
     *  NBD2C-101
     */
    _noProductsToShow = false;

    connectedCallback() {
        dispatchAction(this, createSearchFiltersClearAction(), {
            onSuccess: () => {},
            onError: (error) => {
                console.error(error);
            }
        });
    }

    renderedCallback() {
        if (this.searchResults && this.searchResults.total > 0) {
            this._noProductsToShow = false;
            let latestCategoryLabel = this.searchResults?.categoryName ?? ' ';
            if (this._categoryLabel.toUpperCase() !== latestCategoryLabel.toUpperCase()) {
                this._categoryDataUpdated = true;
            } else {
                this._categoryDataUpdated = false;
            }
            this._isLoading = false;
        } else if (this.searchResults && this.searchResults.total === 0) {
            this._isLoading = false;
            this._noProductsToShow = true;
        }

        if (this._categoryDataUpdated == true && this.searchResults) {
            this.setCategoryName();
        }
    }

    handleContentLoaded() {
        this._isLoading = false;
    }

    /**
     *  This method sets the values for category label and description
     *  NBD2C-48
     */
    setCategoryName() {
        let latestCategoryLabel = this.searchResults?.categoryName ?? ' ';
        let parentCategoryLabel = this.searchResults?.filtersPanel?.parentCategory?.categoryName ?? '';

        if (parentCategoryLabel == null || parentCategoryLabel == undefined || parentCategoryLabel == '') {
            parentCategoryLabel = latestCategoryLabel;
        }
        if (this._categoryLabel === '' || this._categoryLabel !== latestCategoryLabel) {
            this._categoryLabel = latestCategoryLabel;
            this._categoryLabel = this._categoryLabel.toUpperCase();

            let categoryDescription = CATEGORY_DESCRIPTION;

            if (categoryDescription && categoryDescription !== '' && parentCategoryLabel && parentCategoryLabel !== '') {
                let categoryDescriptionList = categoryDescription.split(SEPARATOR);

                let categoryDescriptionMap = new Map();
                categoryDescriptionList.forEach((element) => {
                    let descriptionList = element.split(COLON_SEPARATOR);
                    if (descriptionList.length > 1) {
                        categoryDescriptionMap.set(descriptionList[0].toUpperCase(), descriptionList[1]);
                    }
                });
                this._categoryNameDescription = categoryDescriptionMap.get(parentCategoryLabel.toUpperCase())
                    ? categoryDescriptionMap.get(parentCategoryLabel.toUpperCase())
                    : '';
                this._categoryDataUpdated = true;
                this._isLoading = false;
            }
        }
    }
    /**
     * Handles the category update event for category filtering.
     * @param {CustomEvent<{categoryId: string}>} event The event object
     *  NBD2C-48
     */
    handleCategoryUpdateEvent(event) {
        this._isLoading = true;
        event.stopPropagation();
        const categoryId = event.detail;

        const searchFiltersPayload = {
            page: DEFAULT_SEARCH_FILTER_PAGE, // Go back to the first page
            categoryId: categoryId
        };

        dispatchAction(this, createSearchFiltersUpdateAction(searchFiltersPayload));
    }

    /**
     * Handles the facet updated event for filtering search results by facets.
     * @param {CustomEvent<{refinements: ProductSearchRefinement; mruFacet: SearchFacet}>} event The event object
     *  NBD2C-48
     */
    handleFacetValueUpdateEvent(event) {
        this._isLoading = true;
        event.stopPropagation();
        const { mruFacet, refinements } = event.detail;

        const searchFiltersPayload = {
            page: DEFAULT_SEARCH_FILTER_PAGE, // Go back to the first page
            refinements,
            mruFacet
        };

        dispatchAction(this, createSearchFiltersUpdateAction(searchFiltersPayload));
    }

    /**
     * Handles the clear all filters event for resetting the search results.
     * @param {CustomEvent} event - the event object
     *  NBD2C-48
     */
    handleClearAllFiltersEvent(event) {
        event.stopPropagation();
        this._isLoading = true;

        dispatchAction(this, createSearchFiltersClearAction(), {
            onSuccess: () => {
                this._isLoading = false;
            },
            onError: (error) => {
                console.error('error ', error);
            }
        });
    }

    handleFilterValueSelection(event) {
        this._isLoading = true;
        if (event.target instanceof HTMLElement) {
            const mruFacetId = event.detail.facetId;
            const facetValueId = event.detail.id;
            this.dispatchEvent(
                new CustomEvent('valueselectionfilters', {
                    detail: {
                        facetValueId: facetValueId,
                        facetId: mruFacetId
                    }
                })
            );
        }
    }
}
