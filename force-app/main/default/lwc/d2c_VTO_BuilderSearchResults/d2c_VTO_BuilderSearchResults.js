import { LightningElement, api, track, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { createSearchFiltersClearAction, createSearchFiltersUpdateAction, dispatchAction } from 'commerce/actionApi';

const STANDARD_RECORD_PAGE = 'standard__recordPage';
const VIEW = 'view';
const PRODUCT_OBJECT = 'Product2';
const DEFAULT_SEARCH_FILTER_PAGE = 1;

export default class D2C_VTO_BuilderSearchResults extends LightningElement {
    static renderMode = 'light';

    @wire(NavigationContext)
    navContext;

    /**
     * Tracks the loader visibility.
     * DVM21-30
     */
    @track
    _showLoader = true;

    /**
     * Results returned from the Search Data Provider
     * @type {?ProductSearchResultSummary}
     * DVM21-32
     */
    @api
    searchResults;

    /**
     * Default field to show in results
     * @type {?string}
     * DVM21-32
     */
    @api
    searchResultsFields;

    /**
     * The product fields which used in productCard cmp.
     * @type {string}
     * DVM21-32
     */
    @api
    cardContentMapping;

    /**
     * The current page number of the results.
     * @type {?string}
     * DVM21-32
     */
    @api
    currentPage;

    /**
     * @type {CardContentMappingItem[]}
     * @readonly
     * @private
     * DVM21-32
     */
    get normalizedCardContentMapping() {
        return JSON.parse(this.cardContentMapping ?? '[]');
    }

    /**
     * Trigger an update of the page number at the closest `SearchDataProvider`
     * DVM21-32
     */
    handleUpdateCurrentPage(event) {
        this._showLoader = true;
        event.stopPropagation();
        if (event.detail.newPageNumber !== undefined && event.detail.newPageNumber !== null) {
            dispatchAction(this, createSearchFiltersUpdateAction({ page: event.detail.newPageNumber }));
        }
    }

    /**
     * Handles navigating to the product detail page from the search results page.
     * DVM21-32
     */
    handleNavigateToProductPage(event) {
        event.stopPropagation();
        if (event.detail.productName !== undefined && event.detail.productName !== null) {
            this.navContext &&
                navigate(this.navContext, {
                    type: STANDARD_RECORD_PAGE,
                    attributes: {
                        objectApiName: PRODUCT_OBJECT,
                        recordId: event.detail.productId,
                        actionName: VIEW
                    },
                    state: {
                        recordName: event.detail.productName
                    }
                });
        }
    }

    /**
     * Handles the facet value update event and dispatches an action to update search filters.
     * DVM21-30
     */
    handleFacetValueUpdate(event) {
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
     *  DVM21-30
     */
    handleClearAllFiltersEvent(event) {
        event.stopPropagation();

        dispatchAction(this, createSearchFiltersClearAction(), {
            onSuccess: () => {},
            onError: (error) => {
                console.error(error);
            }
        });
    }

    /**
     * handles the loader visibility.
     * DVM21-30
     */
    handleShowLoader(event) {
        this._showLoader = event.detail;
    }
}
