import { LightningElement, api } from 'lwc';
import { generatePagesForRange } from './d2c_pagingControlHelper';
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
export default class D2C_SearchPagingControl extends LightningElement {
    static renderMode = 'light';

    /**
     * Current page number.
     * @type {?number}
     * NBD2C-39
     */
    @api
    currentPageNumber;

    /**
     * Current page number.
     * @type {?number}
     * NBD2C-39
     */
    @api
    currentPageNumberSPC;

    /**
     * Number of items per page.
     * @type {?number}
     * NBD2C-39
     */
    @api
    pageSize;

    /**
     * Total number of items.
     * @type {?number}
     * NBD2C-39
     */
    @api
    totalItemCount;

    /**
     * The maximum quantity of numbered pages displayed to the user.
     * This includes numbers and range symbol.
     * @type {?number}
     * NBD2C-39
     */
    @api
    maximumPagesDisplayed;

    /**
     * Gets the required i18n labels
     * @readonly
     * @private
     * NBD2C-39
     */
    label = {
        previous,
        next,
        resultsLimitHitText
    };

    get normalizedPageNumber() {
        return isNumber(this.currentPageNumber, 1) ? this.currentPageNumber : 1;
    }
    get normalizedPageSize() {
        return isNumber(this.pageSize, 1) ? this.pageSize : 1;
    }
    get normalizedItemCount() {
        return isNumber(this.totalItemCount, 0) ? this.totalItemCount : 0;
    }

    /**
     * Getter for styling of previous button on paginator
     * @type {String}
     * NBD2C-39
     */
    get previousButtonStyling() {
        return this.normalizedPageNumber && this.normalizedPageNumber === 1 ? DISABLED_BUTTON_STYLING : ENABLED_BUTTON_STYLING;
    }

    /**
     * Getter for styling of next button on paginator
     * @type {boolean}
     * @readonly
     * @private
     * NBD2C-39
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
     * NBD2C-39
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
     * NBD2C-39
     */
    get totalPages() {
        return Math.ceil(this.normalizedItemCount / this.normalizedPageSize);
    }

    /**
     * Gets page numbers as an array of objects.
     * @type {PageItem[]}
     * @readonly
     * @private
     * NBD2C-39
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
     * NBD2C-39
     */
    get rangeSymbol() {
        return PAGING_RANGE_SYMBOL;
    }

    /**
     * Handler for the 'click' event from the previous button.
     * @fires SearchPagingControl#pageprevious
     * NBD2C-39
     */
    handlePaginationPrevious() {
        if (this.normalizedPageNumber && this.normalizedPageNumber > 1) {
            this.dispatchEvent(new CustomEvent(EVENT.PAGE_CHANGE_PREVIOUS_EVT));
        }
    }

    /**
     * Handler for the 'click' event from the next button.
     * @fires SearchPagingControl#pagenext
     * NBD2C-39
     */
    handlePaginationNext() {
        if (this.normalizedPageNumber && this.totalPages && this.normalizedPageNumber < this.totalPages) {
            this.dispatchEvent(new CustomEvent(EVENT.PAGE_CHANGE_NEXT_EVT));
        }
    }

    @api
    handlepageNumberUpdate(newNumber) {
        this.currentPageNumber = newNumber;
    }
    /**
     * Handler for the 'click' event from the page number button.
     * @param {Event} event The event object
     * @fires SearchPagingControl#pagegoto
     * NBD2C-39
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
