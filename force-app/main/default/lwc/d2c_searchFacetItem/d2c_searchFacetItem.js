import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

/**
 * @typedef {import('../searchResults/searchResults').DistinctFacetValue} DistinctFacetValue
 */

/**
 * An event fired when the facet value has been toggled.
 * @event SearchFacetItem#facetvaluetoggle
 * @property {object} detail CustomEvent details
 * @property {string} detail.id
 *   The ID of the facet value
 * @property {boolean} detail.checked
 *   Whether the facet value has been checked or unchecked
 */
/**
 * Wrapper component for facet values
 * @fires SearchFacetItem#facetvaluetoggle
 */

const FACETVALUE_TOGGLE_EVT = 'facetvaluetoggle';
const LOADED_CONTENT = 'loadedcontent';
const COLOR_FILTER = 'colorFilter';
const FRAME_COLOR = 'B2B_Frame_Color__c';
const MOBILE_DEVICE_DIMENSIONS = '(max-width: 1200px)'; //NBD2C-93

export default class SearchFacetItem extends LightningElement {
    static renderMode = 'light';

    /**
     * Gets or sets the facet value
     * @type {?DistinctFacetValue}
     *  NBD2C-48
     */
    @api
    value;
    /**
     * Indicates whether we should focus on the facet value when it's first rendered
     * @type {boolean}
     *  NBD2C-48
     */
    @api
    focusOnInit = false;

    @api
    fieldName;

    /**
     * An object with the current PageReference.
     * This is needed for the pubsub library.
     *
     * @type {PageReference}
     *  NBD2C-48
     */
    @wire(CurrentPageReference)
    pageRef;

    /**
     * Whether the facet item has been rendered at least once.
     * @type {boolean}
     * @private
     *  NBD2C-48
     */
    _hasRenderedAtLeastOnce = false;

    /**
     * Whether the component has acquired focus when it was initially displayed.
     * @type {boolean}
     * @private
     *  NBD2C-48
     */
    _hasInitiallyFocused = false;

    /**
     * This variable indicates whether the current device is desktop
     * NBD2C-93
     * @type {Boolean}
     */
    _isMobileDevice = false;

    connectedCallback() {
        this.detectDeviceType();
    }
    /**
     * Focuses on the facet value on inital rendering if isFacetSelected is true
     * @private
     *  NBD2C-48
     */
    renderedCallback() {
        const lightningInputElement = this.querySelector('lightning-input');
        if (!this._hasRenderedAtLeastOnce && !this._hasInitiallyFocused && this.focusOnInit) {
            lightningInputElement?.focus();
            this._hasInitiallyFocused = true;
        }
        this._hasRenderedAtLeastOnce = true;

        this.dispatchEvent(
            new CustomEvent(LOADED_CONTENT, {
                bubbles: true,
                composed: true,
                cancelable: true
            })
        );
    }

    disconnectedCallback() {
        this._hasInitiallyFocused = false;
        this._hasRenderedAtLeastOnce = false;
    }

    /**
     * NBD2C-93
     * This method detects the device type and setup the component accordingly
     */
    detectDeviceType = () => {
        const isMobile = window.matchMedia(MOBILE_DEVICE_DIMENSIONS).matches;
        this._isMobileDevice = isMobile ? true : false;
    };

    /**
     * Handler for the 'keyup' event fired from facetItem
     * @param {CustomEvent} event The event object
     *  NBD2C-48
     */
    handleKeyPress(event) {
        if (event.code === 'Space') {
            this.handleFacetValueToggle(event);
        }
    }

    /**
     * Handler for the 'click' event fired from inputFacet
     * @param {CustomEvent} event The event object
     * @fires SearchFacetItem#facetvaluetoggle
     *  NBD2C-48
     */
    handleFacetValueToggle(event) {
        const element = event.target;
        if (!element.disabled) {
            event.preventDefault();
            let isFacetSelected = event.target.dataset.checked;
            if (isFacetSelected == 'true' || isFacetSelected == true) {
                isFacetSelected = false;
            } else {
                isFacetSelected = true;
            }

            element.checked = isFacetSelected;
            element.focus();
        }
        if (element.checked == true && element.dataset.id != undefined && element.dataset.id != null && this.fieldName == FRAME_COLOR) {
            const data = { filterValue: element.dataset.id };
            localStorage.setItem(COLOR_FILTER, JSON.stringify(data));
        }

        this.dispatchEvent(
            new CustomEvent(FACETVALUE_TOGGLE_EVT, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    id: element.dataset.id,
                    checked: element.checked
                }
            })
        );
    }
}
