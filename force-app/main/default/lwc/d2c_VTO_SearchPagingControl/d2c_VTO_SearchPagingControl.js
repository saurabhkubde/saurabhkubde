import { LightningElement, api } from 'lwc';
import { generatePagesForRange } from './d2c_VTO_SearchPagingControlHelper';
import { EVENT, PAGING_RANGE_SYMBOL, MAX_RESULTS_OFFSET, ENABLED_BUTTON_STYLING, DISABLED_BUTTON_STYLING } from './constants';
import { previous, next, resultsLimitHitText } from './labels';

/**
 * @param {*} value The value to check.
 * @param {number} min The minimum value that _`value`_ needs to have.
 * @returns {boolean} Whether the given _`value`_ is a number greater than _`min`_.
 */
function isNumber(value, min) {
    return typeof value === 'number' && !Number.isNaN(value) && value > min;
}

/**
 * An event fired when the user indicates a desire to go to the previous page.
 * @event SearchPagingControl#pageprevious
 * @type {CustomEvent}
 */

/**
 * An event fired when the user indicates a desire to go to the next page.
 * @event SearchPagingControl#pagenext
 * @type {CustomEvent}
 */

/**
 * An event fired when the user indicates a desire to go to a specific page.
 * @event SearchPagingControl#pagegoto
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {number} detail.pageNumber
 *  The specific page number the user desires to go to.
 */

/**
 * A page object to render the page item.
 * @typedef {object} PageItem
 * @property {number} id
 *  Identifier used as the key for the rendering element.
 * @property {?number} pageNumber
 *  Page number
 * @property {boolean} isCurrentPage
 *  Whether this page is the current page.
 * @property {boolean} isRange
 *  Whether this page is a range element.
 */

/**
 * A simple pagination UI control for any record visualization controls.
 * @fires SearchPagingControl#pageprevious
 * @fires SearchPagingControl#pagenext
 * @fires SearchPagingControl#pagegoto
 */
export default class D2C_VTO_SearchPagingControl extends LightningElement {
    static renderMode = 'light';

    /**
     * Current page number.
     * @type {?number}
     * DVM21-32
     */
    @api
    currentPageNumber;

    /**
     * Current page number.
     * @type {?number}
     * DVM21-32
     */
    @api
    currentPageNumberSPC;

    /**
     * Number of items per page.
     * @type {?number}
     * DVM21-32
     */
    @api
    pageSize;

    /**
     * Total number of items.
     * @type {?number}
     * DVM21-32
     */
    @api
    totalItemCount;

    /**
     * The maximum quantity of numbered pages displayed to the user.
     * This includes numbers and range symbol.
     * @type {?number}
     * DVM21-32
     */
    @api
    maximumPagesDisplayed;

    /**
     * Gets the required i18n labels
     * @readonly
     * @private
     * DVM21-32
     */
    label = {
        previous,
        next,
        resultsLimitHitText
    };

    /**
     * get current page number
     * DVM21-32
     */
    get normalizedPageNumber() {
        return isNumber(this.currentPageNumber, 1) ? this.currentPageNumber : 1;
    }

    /**
     * get page size
     * DVM21-32
     */
    get normalizedPageSize() {
        return isNumber(this.pageSize, 1) ? this.pageSize : 1;
    }

    /**
     * get item count
     * DVM21-32
     */
    get normalizedItemCount() {
        return isNumber(this.totalItemCount, 0) ? this.totalItemCount : 0;
    }

    /**
     * Getter for styling of previous button on paginator
     * @type {String}
     * DVM21-32
     */
    get previousButtonStyling() {
        return this.normalizedPageNumber && this.normalizedPageNumber === 1 ? DISABLED_BUTTON_STYLING : ENABLED_BUTTON_STYLING;
    }

    /**
     * Getter for styling of next button on paginator
     * @type {boolean}
     * @readonly
     * @private
     * DVM21-32
     */
    get nextButtonStyling() {
        return this.normalizedPageNumber && this.totalPages && this.normalizedPageNumber >= this.totalPages ? DISABLED_BUTTON_STYLING : ENABLED_BUTTON_STYLING;
    }

    /**
     * only show a message if this is the last page we could possibly show while there are more results due to API limitation:
     * true if totalItemCount > 5000 + pageSize and this is the last page (aNumber to 5000+pageSize)
     * @type {boolean}
     * @readonly
     * @private
     * DVM21-32
     */
    get showMessageForResultsLimit() {
        const pageSize = this.normalizedPageSize;
        return this.normalizedItemCount > MAX_RESULTS_OFFSET + pageSize && this.normalizedPageNumber >= Math.ceil((MAX_RESULTS_OFFSET + pageSize) / pageSize);
    }

    /**
     * Gets total number of pages.
     * @type {number}
     * @readonly
     * @private
     * DVM21-32
     */
    get totalPages() {
        return Math.ceil(this.normalizedItemCount / this.normalizedPageSize);
    }

    /**
     * Gets page numbers as an array of objects.
     * @type {PageItem[]}
     * @readonly
     * @private
     * DVM21-32
     */
    get pageNumbers() {
        const max = isNumber(this.maximumPagesDisplayed, 0) ? this.maximumPagesDisplayed : 5;
        return generatePagesForRange(this.normalizedPageNumber, this.totalPages, max);
    }

    /**
     * Gets the symbol for range symbol.
     * @type {string}
     * @readonly
     * @private
     * DVM21-32
     */
    get rangeSymbol() {
        return PAGING_RANGE_SYMBOL;
    }

    /**
     * Handler for the 'click' event from the previous button.
     * @fires SearchPagingControl#pageprevious
     * DVM21-32
     */
    handlePaginationPrevious() {
        if (this.normalizedPageNumber && this.normalizedPageNumber > 1) {
            this.dispatchEvent(new CustomEvent(EVENT.PAGE_CHANGE_PREVIOUS_EVT));
        }
    }

    /**
     * Handler for the 'click' event from the next button.
     * @fires SearchPagingControl#pagenext
     * DVM21-32
     */
    handlePaginationNext() {
        if (this.normalizedPageNumber && this.totalPages && this.normalizedPageNumber < this.totalPages) {
            this.dispatchEvent(new CustomEvent(EVENT.PAGE_CHANGE_NEXT_EVT));
        }
    }

    /**
     * Handles the updation of current page number
     * DVM21-32
     */
    @api
    handlepageNumberUpdate(newNumber) {
        this.currentPageNumber = newNumber;
    }

    /**
     * Handler for the 'click' event from the page number button.
     * @param {Event} event The event object
     * @fires SearchPagingControl#pagegoto
     * DVM21-32
     */
    handlePaginationPage(event) {
        this.dispatchEvent(
            new CustomEvent(EVENT.PAGE_CHANGE_GOTOPAGE_EVT, {
                detail: {
                    pageNumber: parseInt(event.target.value, 10)
                }
            })
        );
    }
}
