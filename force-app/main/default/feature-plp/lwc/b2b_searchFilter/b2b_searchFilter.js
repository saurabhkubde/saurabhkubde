import { LightningElement, api } from 'lwc';

/**
 * An organized display of facets and filters.
 *
 * @fires SearchFilter#facetvalueupdate
 */
export default class SearchFilter extends LightningElement {
    /**
     * An event fired when the user checks/unchecks a filter item.
     *
     * Properties:
     *   - Bubbles: true
     *   - Composed: true
     *
     * @event SearchLayout#showdetail
     * @type {CustomEvent}
     *
     * @property {ConnectApi.DistinctValueRefinementInput} refinements
     *   The unique identifier of the product.
     *
     * @export
     */

    /**
     * Gets or sets the display data for filters.
     *
     * @type {ConnectApi.DistinctValueSearchFacet[]}
     * @private
     */
    @api
    get displayData() {
        return this._displayData;
    }
    set displayData(value) {
        this._displayData = value;
        this.facets = value || [];
    }

    @api
    clearAll() {
        this._refinementMap.clear();
        this._facets = [];
        this._mruFacet = undefined;
    }

    /**
     * Gets or sets the normalized facets for display.
     *
     * @private
     */
    @api
    get facets() {
        return this._facets || [];
    }
    set facets(value) {
        this._facets = value
            .map((facet) => this.mergeFacetIfMatch(this._mruFacet, facet))
            .map((facet) => ({
                ...facet,
                values: facet.values.map((val) => ({
                    ...val,
                    displayLabel: `${val.displayName} (${val.productCount})`
                }))
            }));

        if (this._facets.length === 0 && this._mruFacet) {
            this._facets = [this._mruFacet];
        }
    }

    /**
     * Gets the active sections to show those as expanded in accordion.
     *
     * @type {string[]}
     */
    get activeSections() {
        return this._sections ? this._sections : (this.facets || []).map((facet) => facet.id);
    }

    /**
     * Merge the most recently used facet with the facet that received from
     * the search resutls. This is required since the API would only return
     * the selected filters (the refinements) when we supply the refinements
     * along with the search.
     * @param {*} mruFacet
     * @param {*} facet
     */
    mergeFacetIfMatch(mruFacet, facet) {
        let resultFacet;
        if (mruFacet && mruFacet.id === facet.id) {
            const mruValues = (mruFacet || {}).values || [];
            const facetValues = (facet || {}).values || [];

            const mergedMap = [...mruValues, ...facetValues].reduce((map, value) => {
                map.set(value.nameOrId, { ...value });
                return map;
            }, new Map());

            resultFacet = {
                ...facet,
                values: Array.from(mergedMap.values())
            };
        } else {
            resultFacet = { ...facet };
        }

        return resultFacet;
    }

    /**
     * Emits a notification that the user checks/unchecks a filter item.
     *
     * @fires Filter#facetvalueupdate
     * @private
     */
    handleInputChange(evt) {
        const facets = this.facets;
        let filterId = this.replaceHtmlEncoding(evt.currentTarget.dataset.id);
        let facetId = evt.currentTarget.dataset.name.split(':')[0];

        this.dispatchEvent(
            new CustomEvent('facetvalueupdate', {
                bubbles: true,
                composed: true,
                detail: { nameOrId: facetId, value: filterId }
            })
        );
    }

    replaceHtmlEncoding(value) {
        if (value) {
            value = value.replace('&lt;', '<');
            value = value.replace('&gt;', '>');
            value = value.replace('&quot;', '"');
            value = value.replace('&#39;', "'");
            value = value.replace('&#92;', '\\');
            value = value.replace('&amp;', '&');
        }
        return value;
    }

    handleSectionToggle(event) {
        this._sections = event.detail.openSections;
    }

    _displayData;
    _facets = [];
    _mruFacet;
    _refinementMap = new Map();
    _sections;
}
