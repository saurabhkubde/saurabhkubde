import { api, LightningElement, track, wire } from 'lwc';
import { transformDataWithConfiguration } from './d2c_VTO_SearchResultsUtils';
import { EVENT } from './constants';

//Apex
import D2C_VTO_PLP_Headline_Text from '@salesforce/label/c.D2C_VTO_PLP_Headline_Text';
import D2C_VTO_Categorywise_Filters from '@salesforce/label/c.D2C_VTO_Categorywise_Filters';
import D2C_VTO_PLP_Filters from '@salesforce/label/c.D2C_VTO_PLP_Filters';

const SET_INTERVAL_LIMIT = '100';
const MOUSE_CLICK = 'click';
const CATEGORY_NAV_CLASSES = '.headernav .slds-is-relative.slds-list__item a';
const BOLD_CLASS = 'font-weight-bold';

export default class D2C_VTO_SearchResults extends LightningElement {
    static renderMode = 'light';

    /**
     * Array used to store category result data.
     * DVM21-30
     */
    _categoryResultData = [];

    /**
     * Defaults to `'1'`
     * @type {string}
     * @private
     * DVM21-32
     */
    _currentPage = '1';

    /**
     * Defaults to `1`
     * @type {number}
     * @private
     * DVM21-32
     */
    _currentPageNumber = 1;

    /**
     * Results passed from the parent searchResults cmp
     * Transforms the data according to the card configuration.
     * @type {?ProductSearchResultSummary}
     * DVM21-32
     */
    @api
    set searchResults(value) {
        this._categoryResultData = value;
        this.handleCategoryContentVisibility();
        this.updateShowData();
    }

    /**
     * Getter for searchResults.
     * DVM21-30
     */
    get searchResults() {
        return this._categoryResultData;
    }

    /**
     * Setting headline text through Custom labels
     * @type {?string}
     * DVM21-32
     */
    _topHeadlineTextForSunglasses = D2C_VTO_PLP_Headline_Text.split('|')[4];
    _headlineTextForSunglasses = D2C_VTO_PLP_Headline_Text.split('|')[0];
    _headlineContentForSunglasses = D2C_VTO_PLP_Headline_Text.split('|')[1];
    _topHeadlineTextForOpticalEyewear = D2C_VTO_PLP_Headline_Text.split('|')[5];
    _headlineTextForOpticalEyewear = D2C_VTO_PLP_Headline_Text.split('|')[2];
    _headlineContentForOpticalEyewear = D2C_VTO_PLP_Headline_Text.split('|')[3];

    _SUNGLASSES = D2C_VTO_PLP_Headline_Text.split('|')[6];
    _OPTICALEYEWEAR = D2C_VTO_PLP_Headline_Text.split('|')[7];
    _results = D2C_VTO_PLP_Filters.split(',')[0];

    /**
     * Show headline text as per category selection
     * @type {?string}
     * DVM21-32
     */
    @track
    _isOpticalEyewear = false;

    /**
     * Show headline text as per category selection
     * @type {?string}
     * DVM21-32
     */
    @track
    _isSunglasses = false;

    @track
    _showData = false;

    /**
     * Map to store category.
     * DVM21-30
     */
    _categoryMap = new Map();

    /**
     * The product fields to display in the product card component.
     * @type {?CardContentMappingItem}
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
    set currentPage(newCurrentPage) {
        this._currentPage = newCurrentPage;
        const newPageAsNumber = parseInt(newCurrentPage, 10);
        if (!Number.isNaN(newPageAsNumber)) {
            this._currentPageNumber = newPageAsNumber;
        }
    }

    /**
     * Get current page
     * DVM21-32
     */
    get currentPage() {
        return this._currentPage;
    }

    /**
     * If an empty array - don't show any fields.
     * @type {CardContentMappingItem[]}
     * @private
     * @readonly
     * @default
     * DVM21-32
     */
    get _cardContentMapping() {
        return Array.isArray(this.cardContentMapping) ? this.cardContentMapping : [];
    }

    /**
     * Normalized search results
     * @type {ProductSearchResultSummary}
     * @readonly
     * @private
     * DVM21-32
     */
    get normalizedSearchResults() {
        return transformDataWithConfiguration(this.searchResults, this.cardConfiguration);
    }

    /**
     * Object containing the configuration settings for the card layout
     * @type {BuilderCardConfiguration}
     * @readonly
     * @private
     * DVM21-32
     */
    get cardConfiguration() {
        return {
            cardContentMapping: this._cardContentMapping
        };
    }

    /**
     * The size of the page as per the results, otherwise default to 20.
     * @type {number}
     * @readonly
     * @private
     * @default
     * DVM21-32
     */
    get pageSize() {
        return this.searchResults?.pageSize ?? 20;
    }

    /**
     * The total count of product items.
     * @type {number}
     * @readonly
     * @private
     * @default
     * DVM21-32
     */
    get totalItemCount() {
        return this.searchResults?.total ?? 0;
    }

    /**
     * Checks if this paging control is valid to show
     * @type {boolean}
     * @readonly
     * @private
     * DVM21-32
     */
    get showPagingControl() {
        const totalPages = Math.ceil(this.totalItemCount / this.pageSize);
        return totalPages > 1;
    }

    connectedCallback() {
        // Apply custom CSS when the component is inserted into the DOM
        this.applyCustomCSS();
        this.updateShowData();
    }

    /**
     * Periodically attempts to apply custom CSS until successful
     * DVM21-32
     */
    async applyCustomCSS() {
        const intervalId = setInterval(() => {
            if (this.setStyles()) {
                clearInterval(intervalId); // Stop the interval once setStyles succeeds
            }
        }, SET_INTERVAL_LIMIT);
    }

    /**
     * Adds styles to category links and attaches click event listeners
     * DVM21-32
     */
    setStyles() {
        const categoryLinks = document.querySelectorAll(CATEGORY_NAV_CLASSES);
        if (categoryLinks.length > 0) {
            categoryLinks.forEach((link) => {
                if (this.searchResults && this.searchResults.categoryName && link.title == this.searchResults.categoryName.toUpperCase()) {
                    link.classList.add(BOLD_CLASS);
                }
                link.addEventListener(MOUSE_CLICK, this.handleCategoryClick.bind(this));
            });
            return true; // Indicate that the elements were found and event listeners were added
        } else {
            return false; // Indicate that the elements were not found
        }
    }

    /**
     * Handles the category click event to toggle bold styling
     * DVM21-32
     */
    handleCategoryClick(event) {
        event.preventDefault();
        const clickedCategory = event.currentTarget;

        // Remove 'font-weight-bold' class from all category links
        const categoryLinks = document.querySelectorAll(CATEGORY_NAV_CLASSES);
        categoryLinks.forEach((link) => {
            link.classList.remove(BOLD_CLASS);
        });

        // Add 'font-weight-bold' class to the clicked category
        clickedCategory.classList.add(BOLD_CLASS);
    }

    /**
     * Handles the category content visibility as per selected category
     * DVM21-32
     */
    handleCategoryContentVisibility() {
        // Split the input string by '|' to get individual category data
        let categories = D2C_VTO_Categorywise_Filters.split('|');

        // Iterate over each category data
        for (let category of categories) {
            // Split the category data by ':' to get the key and values
            let [key, values] = category.split(':');

            // Split the values by ',' to get an array of items
            let items = values.split(',');

            // Push the key-value pair into the map
            this._categoryMap.set(key, items);
        }

        if (this.searchResults.categoryName === this._SUNGLASSES) {
            this._isOpticalEyewear = false;
            this._isSunglasses = true;
        } else if (this.searchResults.categoryName === this._OPTICALEYEWEAR) {
            this._isSunglasses = false;
            this._isOpticalEyewear = true;
        }
    }

    /**
     * Handles the `pageprevious` event.
     * @param {CustomEvent} event A 'pageprevious' received from a paging control
     * @private
     * @fires SearchResults#updatecurrentpage
     * DVM21-32
     */
    handlePreviousPageEvent(event) {
        event.stopPropagation();
        const previousPageNumber = this._currentPageNumber - 1;
        this.dispatchUpdateCurrentPageEvent(previousPageNumber);
    }

    /**
     * Handles the `pagenext` event which
     * @param {CustomEvent} event A 'pagenext' received from a paging control
     * @private
     * @fires SearchResults#updatecurrentpage
     * DVM21-32
     */
    handleNextPageEvent(event) {
        event.stopPropagation();
        const nextPageNumber = this._currentPageNumber + 1;
        this.dispatchUpdateCurrentPageEvent(nextPageNumber);
    }

    /**
     * Handles the `pagegoto` event which
     * @param {CustomEvent} event A 'pagegoto' received from a paging control
     * @private
     * @fires SearchResults#updatecurrentpage
     * DVM21-32
     */
    handleGotoPageEvent(event) {
        event.stopPropagation();
        const pageNumber = event.detail.pageNumber;
        this.dispatchUpdateCurrentPageEvent(pageNumber);
    }

    /**
     * Handles the `updatecurrentpage` Which updates the current page
     * DVM21-32
     */
    dispatchUpdateCurrentPageEvent(newPageNumber) {
        this.dispatchEvent(
            new CustomEvent(EVENT.UPDATE_CURRENT_PAGE_EVT, {
                detail: {
                    newPageNumber
                }
            })
        );
    }

    /**
     * Handles the `showproduct` event which navigates to a product detail page.
     * @param {CustomEvent} event A 'showproduct' received from a product grid
     * @private
     * @fires SearchResults#showproduct
     * DVM21-32
     */
    handleNavigateToProductPage(event) {
        event.stopPropagation();
        this.dispatchEvent(
            new CustomEvent(EVENT.SHOW_PRODUCT_EVT, {
                detail: event.detail
            })
        );
    }

    /**
     * Handles the visibility of product data based on the event detail.
     * DVM21-30
     */
    handleProductsDataVisibility(event) {
        this._showData = event.detail;
    }

    /**
     * API method to update the visibility of product data based on the total number of category results.
     * DVM21-30
     */
    @api
    updateShowData() {
        this._showData = this._categoryResultData.total > 0;
    }
}
