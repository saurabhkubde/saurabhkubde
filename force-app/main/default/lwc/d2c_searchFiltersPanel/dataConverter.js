/**
 * @typedef {import('../searchFilters/searchFilters').ProductSearchRefinement} ProductSearchRefinement
 */

/**
 * @typedef {import('../searchFilters/searchFilters').SearchFacetValuesCheckMap} SearchFacetValuesCheckMap
 */
/**
 * Convert the mapping of facets to refinements. Only add the selected facet
 * values to refinement values and remove client-generated ids.
 * @param {Map<string, SearchFacetValuesCheckMap>} facetsMap
 *  A map of {@see SearchFacetValuesCheckMap} with facet id as the key.
 * @returns {ProductSearchRefinement[]}
 *  The list of product search refinements.
 */
export function refinementsFromFacetsMap(facetsMap) {
    const facetMapValues = facetsMap ? Array.from(facetsMap.values()) : [];
    return facetMapValues
        .map(({ searchFacet, valuesCheckMap }) => {
            const { nameOrId, facetType: type, attributeType } = searchFacet;
            const values = Array.from(valuesCheckMap.entries())
                .filter(([, checked]) => checked)
                .map(([facetValueId]) => facetValueId);
            return {
                nameOrId,
                type: type ?? '',
                attributeType: attributeType ?? '',
                values: values
            };
        })
        .filter((mapItem) => mapItem.values.length);
}
