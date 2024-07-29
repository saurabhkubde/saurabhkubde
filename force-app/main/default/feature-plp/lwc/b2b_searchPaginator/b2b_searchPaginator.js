import { LightningElement, api } from 'lwc';

//Label
import PAGINATION_STRINGS from '@salesforce/label/c.B2B_Pagination_Text';

/**
 * A simple paginator UI control for any results pagination.
 *
 * @fires SearchPaginator#previous
 * @fires SearchPaginator#next
 */
const SH_STORE = 'silhouette'; //Added as part of BS-687

const BUTTONS_MAX_LEN = 7;
const PAGE_DOTS_LABEL = '...';

const EVENTS = {
    NEXT: 'next',
    PAGE_JUMP: 'pagejump',
    PREVIOUS: 'previous'
};

const CLASSES = {
    CURRENT_PAGE: 'current',
    PAGE_NUMBER: 'pagenumber'
};

export default class SearchPaginator extends LightningElement {
    get label() {
        return {
            itemString: PAGINATION_STRINGS.split(',')[0],
            pageOf: PAGINATION_STRINGS.split(',')[1]
        };
    }

    /**
     * An event fired when the user clicked on the previous page button.
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *   - Cancelable: false
     *
     * @event SearchPaginator#previous
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * An event fired when the user clicked on the next page button.
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *   - Cancelable: false
     *
     * @event SearchPaginator#next
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * An event fired when the user clicked on pagenumber buttons.
     *
     * Properties:
     *   - Bubbles: false
     *   - Composed: false
     *   - Cancelable: false
     *
     * @event SearchPaginator#pagejump
     * @type {CustomEvent}
     *
     * @export
     */

    /**
     * The current page number.
     *
     * @type {Number}
     */
    @api pageNumber;

    /**
     * The number of items on a page.
     *
     * @type {Number}
     */
    @api pageSize;

    /**
     * The total number of items in the list.
     *
     * @type {Number}
     */
    @api totalItemCount;

    /**
     * Boolean to identify SH/EE store.
     *
     * @type {Boolean}
     */
    _isSilhouetteStore = false;

    /**
     * Handles a user request to go to the previous page.
     *
     * @fires SearchPaginator#previous
     * @private
     */
    handlePrevious() {
        this.dispatchEvent(new CustomEvent(EVENTS.PREVIOUS));
        this.pageNumber = Math.max(this.pageNumber - 1, 1);
    }

    /**
     * Handles a user request to go to the next page.
     * @fires SearchPaginator#next
     * @private
     */
    handleNext() {
        this.dispatchEvent(new CustomEvent(EVENTS.NEXT));
        this.pageNumber = Math.min(this.pageNumber + 1, this.totalPages);
    }

    /**
     * Gets the current page number.
     *
     * @type {Number}
     * @readonly
     * @private
     */
    get currentPageNumber() {
        return this.totalItemCount === 0 ? 0 : this.pageNumber;
    }

    /**
     * Gets whether the current page is the first page.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get isFirstPage() {
        return this.pageNumber === 1;
    }

    /**
     * Gets whether the current page is the last page.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get isLastPage() {
        return this.pageNumber >= this.totalPages;
    }

    /**
     * Gets the total number of pages
     *
     * @type {Number}
     * @readonly
     * @private
     */
    get totalPages() {
        return Math.ceil(this.totalItemCount / this.pageSize);
    }

    connectedCallback() {
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');

        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }
    }

    /**
     * generates page jump buttons along with first and last page
     * added as part of BS-2128
     * @private
     */
    get paginatorButtons() {
        let newPaginatorButtons = [];
        let indexStart, indexEnd;

        if (this.currentPageNumber < BUTTONS_MAX_LEN) {
            // when near first page
            indexStart = 1;
            indexEnd = indexStart + BUTTONS_MAX_LEN;
        } else if (this.currentPageNumber + BUTTONS_MAX_LEN > this.totalPages) {
            // when near last page
            indexStart = this.totalPages - BUTTONS_MAX_LEN;
            indexEnd = indexStart + BUTTONS_MAX_LEN + 1;
        } else {
            indexStart = this.currentPageNumber - Math.floor(BUTTONS_MAX_LEN / 2);
            indexEnd = indexStart + BUTTONS_MAX_LEN;
        }
        indexEnd = Math.min(indexEnd, this.totalPages + 1);

        if (indexStart > 2) {
            newPaginatorButtons.push({
                key: 1,
                onclick: this.jumpPage,
                class: CLASSES.PAGE_NUMBER,
                label: 1
            });
            newPaginatorButtons.push({
                key: 'dotsfirst',
                class: CLASSES.PAGE_NUMBER,
                label: PAGE_DOTS_LABEL,
                onclick: () => {}
            });
        }

        for (let index = indexStart; index < indexEnd; index++) {
            newPaginatorButtons.push({
                key: index,
                onclick: this.jumpPage,
                class: index == this.currentPageNumber ? `${CLASSES.PAGE_NUMBER} ${CLASSES.CURRENT_PAGE}` : CLASSES.PAGE_NUMBER,
                label: index
            });
        }

        if (this.totalPages > indexEnd) {
            newPaginatorButtons.push({
                key: 'dotssecond',
                class: CLASSES.PAGE_NUMBER,
                label: PAGE_DOTS_LABEL,
                onclick: () => {}
            });
            newPaginatorButtons.push({
                key: this.totalPages,
                onclick: this.jumpPage,
                class: CLASSES.PAGE_NUMBER,
                label: this.totalPages
            });
        }

        return newPaginatorButtons;
    }

    /**
     * Handles a user request to jump to a page.
     * added as part of BS-2128
     * @fires SearchPaginator#pagejump
     * @private
     */
    jumpPage(event) {
        this.dispatchEvent(
            new CustomEvent(EVENTS.PAGE_JUMP, {
                detail: Number(event.target.innerText)
            })
        );
        this.pageNumber = Number(event.target.innerText);
    }
}
