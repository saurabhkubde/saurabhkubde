import { LightningElement, api, track } from 'lwc';
import getColorsMetadata from '@salesforce/apex/D2C_ProductCardController.getColorsMetadata';

/**
 * @typedef {import('../searchResults/searchResults').SearchFacet} SearchFacet
 */

/**
 * @typedef {import('../searchResults/searchResults').DistinctFacetValue} DistinctFacetValue
 */

/**
 * An event fired when a facet has been selected
 * @event SearchFacet#facetvaluetoggle
 * @type {CustomEvent}
 * @property {object} detail CustomEvent details
 * @property {string} detail.id
 *   ID or internal name of the facet value
 * @property {boolean} detail.checked
 *   Whether the value is selected.
 * @property {string} detail.facetId
 *   The selected facet id
 */
/**
 * General facet display component
 * @fires SearchFacet#facetvaluetoggle
 */

const FRAME_COLOR = 'B2B_Frame_Color__c';
const CHECKBOX = 'checkbox';
const HIDE_CLASS = 'slds-hide';
const FACET_VALUE_TOGGLE = 'facetvaluetoggle';

export default class SearchFacet extends LightningElement {
    static renderMode = 'light';

    /**
     * Determines whether we expand to show the facet's values or not
     * @type {boolean}
     *  NBD2C-48
     */
    _expanded = true;

    /**
     * Gets or sets the facet display-data.
     * @type {?SearchFacet}
     *  NBD2C-48
     */
    @api
    displayData;

    get normalizedDisplayData() {
        return {
            ...(this.displayData ?? {}),
            nameOrId: this.displayData?.nameOrId ?? '',
            displayType: this.displayData?.displayType ?? CHECKBOX,
            values: this.displayData?.values ?? []
        };
    }

    /**
     * Color Filters values from custom metadata
     * @type {Map}
     *  NBD2C-48
     */
    _colorMetadata = new Map();

    /**
     * Boolean value to decide if data it loaded
     * @type {Boolean}
     *  NBD2C-48
     */
    _metadataNotLoaded = true;

    /**
     * Gets the type of facet being displayed.
     * Types supported: 'checkbox', 'radio', 'range', 'datetime'
     * @type {?string}
     * @private
     * @readonly
     *  NBD2C-48
     */
    get type() {
        return this.normalizedDisplayData.displayType;
    }

    /**
     * Gets the display name of facet to be displayed.
     * @type {?string}
     * @private
     * @readonly
     *  NBD2C-48
     */
    get name() {
        return this.normalizedDisplayData.displayName.toUpperCase();
    }

    /**
     * Gets the values of the facet
     * @type {DistinctFacetValue[]}
     * @private
     * @readonly
     *  NBD2C-48
     */
    get values() {
        return this.normalizedDisplayData.values;
    }

    /**
     * The minimum value count for the facet, if it is a slider
     * @type {?number}
     * @private
     * @readonly
     *  NBD2C-48
     */
    get minValue() {
        return this.values[0].productCount;
    }

    /**
     * The maximum value count for the facet, if it is a slider
     * @type {?number}
     * @private
     * @readonly
     *  NBD2C-48
     */
    get maxValue() {
        return this.values[1].productCount;
    }

    /**
     * The CSS classes for the facet toggle button
     * @type {string}
     * @private
     * @readonly
     *  NBD2C-48
     */
    get facetDisplayClasses() {
        return this._expanded ? '' : HIDE_CLASS;
    }

    handleFacetHeaderToggle() {
        this._expanded = !this._expanded;
    }

    async connectedCallback() {
        if (this.normalizedDisplayData.nameOrId == FRAME_COLOR) {
            let result = await getColorsMetadata({});
            if (result !== undefined && result !== null) {
                let customMetadataColors = new Map(Object.entries(JSON.parse(result)));
                for (let element of customMetadataColors.values()) {
                    let value = {
                        colorName: element.Label,
                        colorHex: element.B2B_Color_code__c,
                        colorLabel: element.B2B_Color_name__c
                    };
                    this._colorMetadata.set(element.Label, value);
                }
                this._metadataNotLoaded = false;
            }
        } else {
            this._metadataNotLoaded = false;
        }
    }

    /**
     * Handle the 'click' event fired from the facet body
     * @param {CustomEvent} event The event object
     * @fires SearchFacet#facetvaluetoggle
     *  NBD2C-48
     */
    handleFacetToggle(event) {
        event.stopImmediatePropagation();
        this.dispatchEvent(
            new CustomEvent(FACET_VALUE_TOGGLE, {
                bubbles: true,
                composed: true,
                cancelable: true,
                detail: {
                    ...event.detail,
                    facetId: this.normalizedDisplayData.id
                }
            })
        );
    }
}
