/*
 *  Author : Shrihari Kendre
 *  Dated : 08-04-2024
 *  Created as a Part of NBD2C-39
 *  NBD2C-39
 */
import { LightningElement, api, wire } from 'lwc';
import { navigate, NavigationContext } from 'lightning/navigation';
import { createSearchFiltersUpdateAction, dispatchAction } from 'commerce/actionApi';
import D2C_NB_PLP_LABELS from '@salesforce/label/c.D2C_PLP_Labels';

/**
 * @typedef {import('../searchResults/searchResults').ProductSearchResultSummary} ProductSearchResultSummary
 *  NBD2C-39
 */

/**
 * @typedef {import('../searchResults/searchResults').CardContentMappingItem} CardContentMappingItem
 *  NBD2C-39
 */

const STANDARD_RECORD_PAGE = 'standard__recordPage';
const VIEW = 'view';
const PRODUCT_OBJECT = 'Product2';
export default class BuilderSearchResults extends LightningElement {
    static renderMode = 'light';

    @wire(NavigationContext)
    navContext;

    /**
     * Results returned from the Search Data Provider
     * @type {?ProductSearchResultSummary}
     *  NBD2C-39
     */
    @api
    searchResults;

    /**
     * Default field to show in results
     * @type {?string}
     *  NBD2C-39
     */
    @api
    searchResultsFields;

    /**
     * The layout of the results tiles.
     * @type {?('grid' | 'list')}
     *  NBD2C-39
     */
    @api
    resultsLayout;

    /**
     * The size of the spacing between the grid columns.
     * @type {?('small' | 'medium' | 'large'| 'none')}
     *  NBD2C-39
     */
    @api
    gridColumnSpacing;

    /**
     * The size of the spacing between the grid rows.
     * @type {?('small' | 'medium' | 'large'| 'none')}
     *  NBD2C-39
     */
    @api
    gridRowSpacing;

    /**
     * The maximum number of grid columns to be displayed.
     * Accepted values are between 1 and 8.
     * @type {?number}
     *  NBD2C-39
     */
    @api
    gridMaxColumnsDisplayed;

    /**
     * The size of the spacing between the list rows.
     * @type {?('small' | 'medium' | 'large'| 'none')}
     *  NBD2C-39
     */
    @api
    listRowSpacing;

    /**
     * Font color for the card background field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     *  NBD2C-39
     */
    @api
    cardBackgroundColor;

    /**
     * The alignment of the results cards.
     * @type {?('right' | 'center' | 'left')}
     *  NBD2C-39
     */
    @api
    cardAlignment;

    /**
     * Font color for the card border field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     *  NBD2C-39
     */
    @api
    cardBorderColor;

    /**
     * The value of the border radius for the results card.
     * @type {?string}
     *  NBD2C-39
     */
    @api
    cardBorderRadius;

    /**
     * Font color for the card divider field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     *  NBD2C-39
     */
    @api
    cardDividerColor;

    /**
     * The font size of the negotiated price.
     * @type {?('small' | 'medium' | 'large')}
     *  NBD2C-39
     */
    @api
    negotiatedPriceTextSize;

    /**
     * Whether to display the negotiated price.
     * @type {boolean}
     * @default false
     *  NBD2C-39
     */
    @api
    showNegotiatedPrice = false;

    /**
     * Font color for the negotiated price text field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     *  NBD2C-39
     */
    @api
    negotiatedPriceTextColor;

    /**
     * Whether to display the original price.
     * @type {boolean}
     * @default false
     *  NBD2C-39
     */
    @api
    showOriginalPrice = false;

    /**
     * The font size of the original price.
     * @type {?('small' | 'medium' | 'large')}
     *  NBD2C-39
     */
    @api
    originalPriceTextSize;

    /**
     * Font color for the original price text field, as 'rgb', 'rgba' or 'hex' CSS value.
     * @type {?string}
     *  NBD2C-39
     */
    @api
    originalPriceTextColor;

    /**
     * Whether to display the product image.
     * @type {boolean}
     * @default false
     *  NBD2C-39
     */
    @api
    showProductImage = false;

    /**
     * The product fields to display in the productCard cmp.
     * @type {string}
     *  NBD2C-39
     */
    @api
    cardContentMapping;

    /**
     * Whether to display the action button.
     * @type {boolean}
     * @default false
     *  NBD2C-39
     */
    @api
    showCallToActionButton = false;

    /**
     * The text for the add to cart button
     * @type {?string}
     *  NBD2C-39
     */
    @api
    addToCartButtonText;

    /**
     * The button style for add to cart button
     * Accepted values primary, secondary, tertiary
     * @type {?('primary' | 'secondary' | 'tertiary')}
     *  NBD2C-39
     */
    @api
    addToCartButtonStyle;

    /**
     * The text for the add to cart button when cart is processing
     * @type {?string}
     *  NBD2C-39
     */
    @api
    addToCartButtonProcessingText;

    /**
     * The text for the view options button
     * @type {?string}
     *  NBD2C-39
     */
    @api
    viewOptionsButtonText;

    /**
     * The current page number of the results.
     * @type {?string}
     *  NBD2C-39
     */
    @api
    currentPage;

    _noResultLabel = D2C_NB_PLP_LABELS.split(',')[3]; //NBD2C-101

    /**
     * Boolean to determine if there are products in the search result
     * @type {Boolean}
     *  NBD2C-101
     */
    _noProductsToShow;

    renderedCallback() {
        if (this.searchResults && this.searchResults.total > 0) {
            this._noProductsToShow = false;
        } else if (this.searchResults && this.searchResults.total === 0) {
            this._noProductsToShow = true;
        }
    }

    /**
     * @type {CardContentMappingItem[]}
     * @readonly
     * @private
     *  NBD2C-39
     */
    get normalizedCardContentMapping() {
        return JSON.parse(this.cardContentMapping ?? '[]');
    }
    /**
     * Handles navigating to the product detail page from the search results page.
     * @param {CustomEvent<{productId: string; productName: string}>} event The event object
     *  NBD2C-39
     */
    handleNavigateToProductPage(event) {
        event.stopPropagation();
        const urlName = this.searchResults?.cardCollection.find((card) => card.id === event.detail.productId)?.urlName;
        if (event.detail.productName !== undefined && event.detail.productName !== null) {
            this.navContext &&
                navigate(this.navContext, {
                    type: STANDARD_RECORD_PAGE,
                    attributes: {
                        objectApiName: PRODUCT_OBJECT,
                        recordId: event.detail.productId,
                        actionName: VIEW,
                        urlName: urlName ?? undefined
                    },
                    state: {
                        recordName: event.detail.productName
                    }
                });
        }
    }

    /**
     * Trigger an update of the page number at the closest `SearchDataProvider`
     * @param {CustomEvent<{newPageNumber: number}>} event The event object
     * @private
     *  NBD2C-39
     */
    handleUpdateCurrentPage(event) {
        event.stopPropagation();
        if (event.detail.newPageNumber !== undefined && event.detail.newPageNumber !== null) {
            dispatchAction(this, createSearchFiltersUpdateAction({ page: event.detail.newPageNumber }));
        }
    }
}
