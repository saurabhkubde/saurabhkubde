import { api, LightningElement, wire } from 'lwc';
import { NUM_FACETVALUES_ALWAYS_DISPLAYED, FACETVALUE_SHOW_MORE_LIMIT, CONSTANTS } from './constants';
import LENS_SHAPE from '@salesforce/schema/Product2.B2B_Lens_Shape__c';
import STORE_STYLING from '@salesforce/resourceUrl/D2C_NB_StoreStyling';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

//Colors custom label NBD2C-48
import BLACK_COLOR from '@salesforce/label/c.B2B_Color_Black';
import CREAM_COLOR from '@salesforce/label/c.B2B_Color_Creme';
import GOLD_COLOR from '@salesforce/label/c.B2B_Color_Gold';
import SLIVER_COLOR from '@salesforce/label/c.B2B_Color_Silver';
import GREY_COLOR from '@salesforce/label/c.B2B_Color_Grey';
import BROWN_COLOR from '@salesforce/label/c.B2B_Color_Brown';
import GREEN_COLOR from '@salesforce/label/c.B2B_Color_Green';
import PETROL_COLOR from '@salesforce/label/c.B2B_Color_Petrol';
import BLUE_COLOR from '@salesforce/label/c.B2B_Color_Blue';
import VIOLET_COLOR from '@salesforce/label/c.B2B_Color_Violet';
import ROSE_COLOR from '@salesforce/label/c.B2B_Color_Rose';
import RED_COLOR from '@salesforce/label/c.B2B_Color_Red';
import ORANGE_COLOR from '@salesforce/label/c.B2B_Color_Orange';
import YELLOW_COLOR from '@salesforce/label/c.B2B_Color_Yellow';
import WHITE_COLOR from '@salesforce/label/c.B2B_Color_White';
import TRANSPARENT_COLOR from '@salesforce/label/c.B2B_Color_transparent';
import BICOLOR_COLOR from '@salesforce/label/c.B2B_Color_Bicolor';
import WITHOUT_MIRROR_COLOR from '@salesforce/label/c.B2B_Color_Without_Mirror';
import PURPLE_COLOR from '@salesforce/label/c.B2B_Color_Purple';
import ROSEGOLD_COLOR from '@salesforce/label/c.B2B_Color_Rosegold';
import BRASS_COLOR from '@salesforce/label/c.B2B_Color_Brass';

/**
 * @typedef {import('../searchResults/searchResults').DistinctFacetValue} DistinctFacetValue
 */
export default class SearchInputFacet extends LightningElement {
    static renderMode = 'light';

    /**
     * The values of the facet
     * @type {?DistinctFacetValue[]}
     *  NBD2C-48
     */
    @api
    values;

    /**
     * Gets the defaulted / normalized sequence of facet values to display.
     * @type {DistinctFacetValue[]}
     *  NBD2C-48
     */
    get normalizedValues() {
        return this.values || [];
    }

    /**
     * The type of facet being displayed
     * @type {?string}
     *  NBD2C-48
     */
    @api
    type;

    /**
     * Color metadata for frame color
     * @type {?string}
     *  NBD2C-48
     */
    @api
    colorMetadata = new Map();

    /**
     * Filter field Name
     * @type {?string}
     *  NBD2C-48
     */
    @api
    fieldName;

    /**
     * values for Lens Shape field
     * @type {?string}
     *  NBD2C-48
     */
    @api
    shapeFieldValues = new Map();

    /**
     * Determines whether we show all the facet's values or not
     * @type {boolean}
     * @private
     *  NBD2C-48
     */
    _expanded = false;

    /**
     * Color metadata map for value and label
     * @type {Map}
     * @private
     *  NBD2C-48
     */
    _colorVsColorLabelMap = new Map();

    /**
     * Url For the shape icons
     * @type {String}
     * @private
     *  NBD2C-48
     */
    _shapeIcon = STORE_STYLING + '/icons/';

    /**
     * Picklist value for lens shape field
     *  NBD2C-48
     */
    @wire(getPicklistValues, {
        recordTypeId: CONSTANTS.NULL_ID,
        fieldApiName: LENS_SHAPE
    })
    lensShapePicklistValues;

    get filterclass() {
        return this.fieldName == CONSTANTS.FRAME_COLOR ? CONSTANTS.FILTER_WRAPPER_MULTIPLE : CONSTANTS.FILTER_WRAPPER;
    }

    /**
     * Gets the defaulted / normalized sequence of facet values to display.
     * Only show the first 6 values if
     * @type {DistinctFacetValue[]}
     * @readonly
     * @private
     *  NBD2C-48
     */
    get displayedValues() {
        let facetValues = Array.from(this.normalizedValues);
        facetValues = facetValues.map((facetValue, index) => ({
            ...facetValue,
            name: facetValue.id ? facetValue.id : facetValue.name
        }));
        if (this.displayShowMore && !this._expanded) {
            facetValues = facetValues.slice(0, NUM_FACETVALUES_ALWAYS_DISPLAYED);
        } else if (this.displayShowMore && this._expanded) {
            facetValues = facetValues.map((facetValue, index) => ({
                ...facetValue,
                focusOnInit: index === NUM_FACETVALUES_ALWAYS_DISPLAYED
            }));
        }
        if (this.fieldName == CONSTANTS.FRAME_COLOR) {
            this._colorVsColorLabelMap.set(CREAM_COLOR.split(',')[0], CREAM_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(GOLD_COLOR.split(',')[0], GOLD_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(SLIVER_COLOR.split(',')[0], SLIVER_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(GREY_COLOR.split(',')[0], GREY_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(BROWN_COLOR.split(',')[0], BROWN_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(GREEN_COLOR.split(',')[0], GREEN_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(PETROL_COLOR.split(',')[0], PETROL_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(BLUE_COLOR.split(',')[0], BLUE_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(VIOLET_COLOR.split(',')[0], VIOLET_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(ROSE_COLOR.split(',')[0], ROSE_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(RED_COLOR.split(',')[0], RED_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(ORANGE_COLOR.split(',')[0], ORANGE_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(YELLOW_COLOR.split(',')[0], YELLOW_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(WHITE_COLOR.split(',')[0], WHITE_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(TRANSPARENT_COLOR.split(',')[0], TRANSPARENT_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(BLACK_COLOR.split(',')[0], BLACK_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(BICOLOR_COLOR.split(',')[0], BICOLOR_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(WITHOUT_MIRROR_COLOR.split(',')[0], WITHOUT_MIRROR_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(PURPLE_COLOR.split(',')[0], PURPLE_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(ROSEGOLD_COLOR.split(',')[0], ROSEGOLD_COLOR.split(',')[1]);
            this._colorVsColorLabelMap.set(BRASS_COLOR.split(',')[0], BRASS_COLOR.split(',')[1]);

            let tempFacetValues = [];
            facetValues.forEach((element) => {
                let tempFacetValue = JSON.parse(JSON.stringify(element));
                tempFacetValue.showColor = this.colorMetadata.has(tempFacetValue.id) ? true : false;
                tempFacetValue.dotClass = CONSTANTS.DOT_ACTIVE_CLASS;
                tempFacetValue.colorBubble = this.colorBubleString(tempFacetValue.id);
                if (this.colorMetadata.has(tempFacetValue.id) && this.colorMetadata.get(tempFacetValue.id).colorLabel) {
                    tempFacetValue.name = this._colorVsColorLabelMap.get(this.colorMetadata.get(tempFacetValue.id).colorLabel)
                        ? this._colorVsColorLabelMap.get(this.colorMetadata.get(tempFacetValue.id)?.colorLabel)
                        : tempFacetValue.name;
                }
                tempFacetValues.push(tempFacetValue);
            });
            facetValues = JSON.parse(JSON.stringify(tempFacetValues));
        }

        if (this.fieldName == CONSTANTS.SHAPE_COLOR) {
            if (
                this.lensShapePicklistValues.data !== undefined &&
                this.lensShapePicklistValues.data !== null &&
                this.lensShapePicklistValues.data.values !== undefined &&
                this.lensShapePicklistValues.data.values !== null
            ) {
                let labelVsValueMap = new Map();
                this.lensShapePicklistValues.data.values.forEach((element) => {
                    labelVsValueMap.set(element.label, element.value);
                });

                let tempFacetValues = [];
                facetValues.forEach((element) => {
                    let tempFacetValue = JSON.parse(JSON.stringify(element));
                    let facetValue = labelVsValueMap.get(element.id);
                    tempFacetValue.showIcon = false;
                    if (facetValue !== undefined && facetValue !== null && facetValue.includes(CONSTANTS.STRING_N)) {
                        tempFacetValue.showIcon = true;
                        tempFacetValue.urlValue = this._shapeIcon + facetValue + CONSTANTS.SVG;
                    } else {
                        tempFacetValue.showIcon = false;
                    }
                    tempFacetValues.push(tempFacetValue);
                });
                facetValues = JSON.parse(JSON.stringify(tempFacetValues));
            }
        }
        return facetValues;
    }

    colorBubleString(facetValueId) {
        if (
            this.colorMetadata.get(facetValueId) &&
            this.colorMetadata.get(facetValueId).colorHex != undefined &&
            this.colorMetadata.get(facetValueId).colorHex != null
        ) {
            return (
                CONSTANTS.BACKGROUND_BOTTOM +
                this.colorMetadata.get(facetValueId).colorHex +
                CONSTANTS.UPPER_HALF +
                this.colorMetadata.get(facetValueId).colorHex +
                CONSTANTS.LOWER_HALF
            );
        }

        return '';
    }

    /**
     * Gets whether we should display a "Show More" button or not
     * @type {boolean}
     * @readonly
     * @private
     *  NBD2C-48
     */
    get displayShowMore() {
        return this.normalizedValues.length > FACETVALUE_SHOW_MORE_LIMIT;
    }

    /**
     * Gets the label for the 'Show More' or 'Show Less' button
     * @type {string}
     * @readonly
     * @private
     *  NBD2C-48
     */
    get showMoreOrLessLabel() {
        return this._expanded;
    }

    /**
     * Handle the 'click' event fired from the 'Show More' or 'Show Less' button
     * @private
     *  NBD2C-48
     */
    handleShowMoreOrLess() {
        this._expanded = !this._expanded;
    }
}
