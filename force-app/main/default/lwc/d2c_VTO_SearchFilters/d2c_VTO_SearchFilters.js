import { LightningElement, api, track } from 'lwc';
import STORE_STYLING from '@salesforce/resourceUrl/D2C_VTO_SH_StoreStyling';
//Apex
import getColorsMetadata from '@salesforce/apex/D2C_VTO_ProductCardController.getColorsMetadata';
import getPicklistValues from '@salesforce/apex/D2C_VTO_ProductCardController.getPicklistValues';

//Object
import PRODUCT_OBJECT from '@salesforce/schema/Product2';

//Custom label
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
import D2C_VTO_PLP_Filters from '@salesforce/label/c.D2C_VTO_PLP_Filters';

const URI3 =
    "data:image/svg+xml;charset=utf-8,%3Csvg width='9' height='7' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.438 6.743L.248 4.492A.894.894 0 01.25 3.254a.838.838 0 011.201.002L3.04 4.887 7.55.253a.838.838 0 011.2.002.893.893 0 010 1.238l-5.108 5.25A.84.84 0 013.04 7a.844.844 0 01-.602-.257z'/%3E%3C/svg%3E";

const SELECTED_BORDER = 'border-color: #494949;';
const BACKGROUND_SIZE = 'background-size:65% !important;';
const FRAME_COLOR = 'B2B_Frame_Color__c';
const LENS_COLOR = 'B2B_Lens_Color__c';
const FRAME_COLOR_ID = 'B2B_Frame_Color__c:Custom';
const LENS_COLOR_ID = 'B2B_Lens_Color__c:Custom';
const LENS_SHAPE = 'B2B_Lens_Shape__c';
const FACE_SHAPE = 'B2B_Face_Shape__c';
const FRAME_TYPE = 'B2B_Frame_type__c';
const TRANSPARENT = 'transparent';
const STYLE_DISPLAY_NONE = 'display: none';
const STYLE_DISPLAY = 'background-color: ';
const IMPORTANT = '!important;';
const MOBILE_DEVICE_DIMENSIONS = '(max-width: 767px)';
const SHOWHIDEPRODUCTS = 'showhideproducts';
const CLEARALLFILTERS = 'clearallfilters';
const SHOWLOADER = 'showloader';
const FACETVALUEUPDATE = 'facetvalueupdate';
const D2C_VTO_COLOR_RADIO_BUTTON = 'c-d2c_-v-t-o_-color-radio-button';
const BACKGROUND_IMAGE_URL = '--background-image-url';
const SVG = '.svg';
const TRUE = 'true';
const LIGHTNING_ACCORDION_SECTION = 'lightning-accordion-section';

export default class D2c_VTO_SearchFilters extends LightningElement {
    /**
     * Stores the URL for the refresh icon.
     * DVM21-30
     */
    _refreshIcon = STORE_STYLING + '/icons/refresh_icon.svg';

    /**
     * Stores the URL for the filter icon used in mobile view.
     * DVM21-30
     */
    _filterIconForMobile = STORE_STYLING + '/icons/filters.svg';

    /**
     * Base URL for shape icons.
     * DVM21-30
     */
    _shapeIcons = STORE_STYLING + '/icons/';

    /**
     * Array to display data.
     * DVM21-30
     */
    _displayData = [];

    /**
     * Array to store facets.
     * DVM21-30
     */
    _facets = [];

    /**
     * Most recently used facet.
     * DVM21-30
     */
    _mruFacet;

    /**
     * Stores the sections in the UI.
     * DVM21-30
     */
    _sections;

    /**
     * Name of the current category.
     * DVM21-30
     */
    _categoryName;

    /**
     * Map to store refinement values.
     * DVM21-30
     */
    _refinementMap = new Map();

    /**
     * Map to store custom metadata colors.
     * DVM21-30
     */
    _customMetadataColorsMap = new Map();

    /**
     * Map to store custom metadata colors.
     * DVM21-30
     */
    _customMetadataColors = new Map();

    /**
     * Map to store color versus color label mappings.
     * DVM21-30
     */
    _colorVsColorLabelMap = new Map();

    /**
     * Object to store various labels used in the UI.
     * DVM21-30
     */
    labels = {
        filters: D2C_VTO_PLP_Filters.split(',')[1],
        showMore: D2C_VTO_PLP_Filters.split(',')[2],
        showless: D2C_VTO_PLP_Filters.split(',')[3],
        resetFilters: D2C_VTO_PLP_Filters.split(',')[4]
    };

    LENS_COLOR_LABEL = D2C_VTO_PLP_Filters.split(',')[5];
    MAIN_COLOR_LABEL = D2C_VTO_PLP_Filters.split(',')[6];

    /**
     * Tracks if the device is mobile.
     * DVM21-30
     */
    @track
    _isMobile = false;

    /**
     * Tracks if the filter panel should be shown.
     * DVM21-30
     */
    @track
    _isShowFilters = false;

    /**
     * Tracks if the modal is open.
     * DVM21-30
     */
    @track
    _openModal = false;

    /**
     * Array to store frame type picklist values.
     * DVM21-30
     */
    @track
    _frameTypePicklistValues = [];

    /**
     * Array to store lens shape picklist values.
     * DVM21-30
     */
    @track
    _lensShapePicklistValues = [];

    /**
     * Array to store face shape picklist values.
     * DVM21-30
     */
    @track
    _faceShapePicklistValues = [];

    /**
     * Excluded category map, passed from parent component.
     * DVM21-30
     */
    @api
    excludedCategoryMap;

    /**
     * Name of the current category, passed from parent component.
     * DVM21-30
     */
    @api
    currentCategoryName;

    /**
     * Setter for facets data, updates _displayData and _facets.
     * DVM21-30
     */
    @api
    set facetsData(value) {
        this._displayData = value;
        this.facets = value || [];
    }

    /**
     * Getter for facets data.
     * DVM21-30
     */
    get facetsData() {
        return this._displayData;
    }

    /**
     * Handles clearing of all selected filters.
     * Dispatches events to notify parent components.
     * DVM21-30
     */
    @api
    handleClearAll() {
        if (this._isMobile) {
            this.dispatchEvent(
                new CustomEvent(SHOWHIDEPRODUCTS, {
                    bubbles: true,
                    composed: true,
                    detail: true
                })
            );
        }

        this.dispatchEvent(
            new CustomEvent(SHOWLOADER, {
                bubbles: true,
                composed: true,
                detail: true
            })
        );

        this._refinementMap.clear();
        this._mruFacet = undefined;

        this.dispatchEvent(
            new CustomEvent(CLEARALLFILTERS, {
                bubbles: true,
                composed: true
            })
        );
    }

    /**
     * Returns the icon URL for radio button checked state.
     * DVM21-30
     */
    get radioButtonIcon() {
        let radioIcon;
        radioIcon = {
            icon: STORE_STYLING + '/icons/check.svg'
        };
        return radioIcon;
    }

    /**
     * Getter for facets.
     * Returns _facets or an empty array if _facets is undefined.
     * DVM21-30
     */
    get facets() {
        return this._facets || [];
    }

    /**
     * Setter for facets.
     * Uses an async method to set facets after loading picklist values.
     * DVM21-30
     */
    set facets(value) {
        this.loadPicklistValues(value);
    }

    /**
     * Loads picklist values for frame type, lens shape, and face shape fields.
     * Once values are loaded, sets the facets.
     * DVM21-30
     */
    async loadPicklistValues(value) {
        try {
            const frameTypeValues = await getPicklistValues({ objectApiName: PRODUCT_OBJECT.objectApiName, fieldApiName: FRAME_TYPE });
            const lensShapeValues = await getPicklistValues({ objectApiName: PRODUCT_OBJECT.objectApiName, fieldApiName: LENS_SHAPE });
            const faceShapeValues = await getPicklistValues({ objectApiName: PRODUCT_OBJECT.objectApiName, fieldApiName: FACE_SHAPE });

            this._frameTypePicklistValues = frameTypeValues;
            this._lensShapePicklistValues = lensShapeValues;
            this._faceShapePicklistValues = faceShapeValues;

            // Once picklist values are loaded, call setFacets
            this.setFacets(value);
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Sets facets after processing the input value.
     * Updates _facets and handles color values mapping.
     * DVM21-30
     */
    async setFacets(value) {
        // Create a map for FRAME_COLOR and LENS_COLOR values
        const colorFieldVsValuesMap = new Map();

        // Extract FRAME_COLOR and LENS_COLOR values from the facets
        value.forEach((facet) => {
            if (facet.nameOrId === FRAME_COLOR) {
                colorFieldVsValuesMap.set(FRAME_COLOR, facet.values);
            } else if (facet.nameOrId === LENS_COLOR) {
                colorFieldVsValuesMap.set(LENS_COLOR, facet.values);
            }
        });

        const colorValues = await this.buildProductColorList(colorFieldVsValuesMap);
        this._facets = value.reduce((filterData, facet) => {
            if (this.isValuePresent(facet.nameOrId) == false) {
                // Check if the current facet is either FRAME_COLOR or LENS_COLOR
                if (facet.nameOrId === FRAME_COLOR || facet.nameOrId === LENS_COLOR) {
                    // Find the existing Color facet or create a new one
                    let colorFacet = filterData.find((filterValue) => filterValue.nameOrId === 'Color:Custom');
                    if (!colorFacet) {
                        colorFacet = {
                            attributeType: 'Custom',
                            displayName: 'Color',
                            displayRank: 4,
                            displayType: 'checkbox',
                            isColorFilter: true,
                            facetType: 'DistinctValue',
                            nameOrId: 'Color:Custom',
                            values: colorValues,
                            id: 'Color:Custom'
                        };
                        filterData.push(colorFacet);
                    }
                } else {
                    const displayValues = facet.values.slice(0, 4);
                    const showMoreButton = facet.values.length > 4;
                    const showLessButton = false;

                    filterData.push({
                        ...facet,
                        displayValues: displayValues.map((picklistValue) => ({
                            ...picklistValue,
                            displayLabel: `${picklistValue.name}`,
                            ...this.getAPINameOfFieldPicklistValue(facet.nameOrId, picklistValue.name)
                        })),
                        showMoreButton: showMoreButton,
                        showLessButton: showLessButton,
                        isColorFilter: false,
                        values: facet.values.map((picklistValue) => ({
                            ...picklistValue,
                            displayLabel: `${picklistValue.name}`,
                            ...this.getAPINameOfFieldPicklistValue(facet.nameOrId, picklistValue.name)
                        }))
                    });
                }
            }
            return filterData;
        }, []);

        if (this._facets) {
            this._sections = (this._facets || []).map((facet) => facet.id);
            this._isShowFilters = true;
            this.dispatchEvent(
                new CustomEvent(SHOWLOADER, {
                    bubbles: true,
                    composed: true,
                    detail: false
                })
            );
        }

        if (this._facets.length === 0 && this._mruFacet) {
            this._facets = [this._mruFacet];
        }

        const colorRadioButton = this.template.querySelector(D2C_VTO_COLOR_RADIO_BUTTON);
        if (colorRadioButton) {
            colorRadioButton.resetSelectedColorList();
        }

        this.detectDeviceType();
    }

    /**
     * Getter for activeSections.
     * DVM21-30
     */
    get activeSections() {
        return this._sections ? this._sections : (this.facets || []).map((facet) => facet.id);
    }

    connectedCallback() {
        this.dispatchEvent(
            new CustomEvent(CLEARALLFILTERS, {
                bubbles: true,
                composed: true
            })
        );
    }

    // Lifecycle method called after component has been rendered
    renderedCallback() {
        this.template.host.style.setProperty(BACKGROUND_IMAGE_URL, `url(${this.radioButtonIcon.icon})`);
        if (this.currentCategoryName !== this._categoryName) {
            this._categoryName = this.currentCategoryName;
            this._refinementMap.clear();
        }
    }

    /**
     * Builds the product color list based on provided field values map.
     * Returns a promise that resolves with the color list.
     * DVM21-30
     */
    async buildProductColorList(colorFieldVsValuesMap) {
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

        let result = await getColorsMetadata({});
        if (result !== null && result !== undefined) {
            this._customMetadataColors = new Map(Object.entries(JSON.parse(result)));
            for (let element of this._customMetadataColors.values()) {
                this._customMetadataColorsMap.set(element.Label, element.B2B_Color_code__c);
            }
        }
        let colorsMap = [{ fieldLabel: this.MAIN_COLOR_LABEL, fieldName: FRAME_COLOR, colorsList: [], filterClicked: false, displayColor: false }];

        if (this.isValuePresent(LENS_COLOR) == false) {
            colorsMap.push({ fieldLabel: this.LENS_COLOR_LABEL, fieldName: LENS_COLOR, colorsList: [], filterClicked: false, displayColor: false });
        }

        for (let element of this._customMetadataColors.values()) {
            let backgroundStyle = STYLE_DISPLAY_NONE;
            colorsMap.forEach((color) => {
                color.colorsList.push({
                    colorName: element.Label,
                    colorHex: element.B2B_Color_code__c,
                    colorStyle: this.checkValueInMap(color.fieldName, element.Label, colorFieldVsValuesMap)
                        ? this.checkValueCheckedStatusInMap(color.fieldName, element.Label, colorFieldVsValuesMap)
                            ? STYLE_DISPLAY + element.B2B_Color_code__c + IMPORTANT + ' background: url("' + URI3 + '");' + SELECTED_BORDER + BACKGROUND_SIZE
                            : STYLE_DISPLAY + element.B2B_Color_code__c + IMPORTANT
                        : backgroundStyle,
                    transparent: element.B2B_Color_name__c == TRANSPARENT ? true : false,
                    colorClicked: this.checkValueCheckedStatusInMap(color.fieldName, element.Label, colorFieldVsValuesMap),
                    colorLabel:
                        this._colorVsColorLabelMap.has(element.B2B_Color_name__c) == true ? this._colorVsColorLabelMap.get(element.B2B_Color_name__c) : ''
                });
            });
        }

        return colorsMap;
    }

    /**
     * Checks if a specific value is present in the color field values map for the given key.
     * DVM21-30
     */
    checkValueInMap(key, value, colorFieldVsValuesMap) {
        if (colorFieldVsValuesMap.has(key)) {
            return colorFieldVsValuesMap.get(key).some((val) => val.name === value);
        }
        return false;
    }

    /**
     * Checks if a specific value is checked in the color field values map for the given key.
     * DVM21-30
     */
    checkValueCheckedStatusInMap(key, value, colorFieldVsValuesMap) {
        if (colorFieldVsValuesMap.has(key)) {
            const matchingValue = colorFieldVsValuesMap.get(key).find((val) => val.name === value);
            if (matchingValue) {
                return matchingValue.checked;
            }
        }
        return false;
    }

    /**
     * Checks if a value is present in the excluded category map for the current category name.
     * DVM21-30
     */
    isValuePresent(value) {
        for (let [key, items] of this.excludedCategoryMap) {
            if (key == this.currentCategoryName && items.includes(value)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Detects the device type (mobile or desktop) based on screen dimensions
     * DVM21-30
     */
    detectDeviceType() {
        this._isMobile = window.matchMedia(MOBILE_DEVICE_DIMENSIONS).matches;
        if (this._isMobile) {
            this._isShowFilters = false;
        }
    }

    /**
     * Retrieves the API name of the picklist value for the given field.
     * DVM21-30
     */
    getAPINameOfFieldPicklistValue(nameOrId, value) {
        let picklistValues = [];
        switch (nameOrId) {
            case LENS_SHAPE:
                picklistValues = this._lensShapePicklistValues;
                break;
            case FACE_SHAPE:
                picklistValues = this._faceShapePicklistValues;
                break;
            case FRAME_TYPE:
                picklistValues = this._frameTypePicklistValues;
                break;
            default:
                picklistValues = [];
        }

        if (picklistValues !== undefined && picklistValues !== null && picklistValues.length !== 0) {
            const tempFacetValue = [];
            const picklistValue = picklistValues.find((item) => item.label === value);
            let facetValue = picklistValue ? picklistValue.value : null;
            if (facetValue !== undefined && facetValue !== null) {
                tempFacetValue.showIcon = true;
                tempFacetValue.urlValue = this._shapeIcons + facetValue + SVG;
            } else {
                tempFacetValue.showIcon = false;
                tempFacetValue.urlValue = '';
            }

            return tempFacetValue;
        }
        return { showIcon: false, urlValue: '' };
    }

    /**
     * Merges the given facet with the MRU facet if they match by ID.
     * DVM21-30
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
     * Gets the checked status of the selected filter.
     * DVM21-30
     */
    getCheckedStatusOfSelectedFilter(id, valueName) {
        const attribute = this._displayData.find((attr) => attr.id === id);
        if (attribute) {
            const value = attribute.values.find((val) => val.id === valueName);
            if (value) {
                return value.checked;
            }
        }
        return false;
    }

    /**
     * Handles updating the color selection based on the event details.
     * DVM21-30
     */
    handleUpdateColorSelection(event) {
        var facetId;
        if (event.detail.facetId == LENS_COLOR) {
            facetId = LENS_COLOR_ID;
        } else if (event.detail.facetId == FRAME_COLOR) {
            facetId = FRAME_COLOR_ID;
        }
        this.updateFilterValue(facetId, event.detail.filterId, event.detail.isChecked);
    }

    /**
     * Handles the change event for radio input and updates the filter value accordingly.
     * DVM21-30
     */
    handleRadioInputChange(evt) {
        const element = evt.target;
        const { filterId, facetId } = evt.target.dataset;
        let isFacetSelected = this.getCheckedStatusOfSelectedFilter(facetId, filterId);
        if (isFacetSelected == TRUE || isFacetSelected == true) {
            isFacetSelected = false;
        } else {
            isFacetSelected = true;
        }
        element.checked = isFacetSelected;
        this.updateFilterValue(facetId, filterId, element.checked);
    }

    /**
     * Updates the filter value in the refinement map and dispatches events accordingly.
     * DVM21-30
     */
    updateFilterValue(facetId, filterId, isChecked) {
        this.dispatchEvent(
            new CustomEvent(SHOWLOADER, {
                bubbles: true,
                composed: true,
                detail: true
            })
        );

        if (this._isMobile) {
            this.dispatchEvent(
                new CustomEvent(SHOWHIDEPRODUCTS, {
                    bubbles: true,
                    composed: true,
                    detail: true
                })
            );
        }

        const facets = this._displayData;
        // Update the refinement map
        if (this._refinementMap.has(facetId)) {
            const values = this._refinementMap.get(facetId);
            if (isChecked) {
                values.add(filterId);
            } else {
                values.delete(filterId);
            }
        } else {
            this._refinementMap.set(facetId, new Set([filterId]));
        }

        let updatedFacet = {};
        const updatedFacets = facets.map((facet) => {
            if (facet.id === facetId) {
                const updatedValues = facet.values
                    .map((value) => {
                        if (value.id === filterId) {
                            return { ...value, checked: isChecked };
                        }
                        return value;
                    })
                    .filter((value) => value !== null && value.checked === true); // Filter out null values and keep only checked:true

                updatedFacet = updatedValues;
                return { ...facet, values: updatedValues }; // Return the updated facet with filtered values
            }
            return facet;
        });

        this._mruFacet = updatedFacet;

        const refinements = updatedFacets.map(({ id, attributeType, nameOrId, facetType }) => ({
            nameOrId,
            type: facetType,
            attributeType,
            values: this._refinementMap.has(id) ? Array.from(this._refinementMap.get(id)) : []
        }));

        this.dispatchEvent(
            new CustomEvent(FACETVALUEUPDATE, {
                bubbles: true,
                composed: true,
                detail: {
                    mruFacet: this._mruFacet,
                    refinements
                }
            })
        );
    }

    /**
     * Handles section toggles.
     * DVM21-30
     */
    handleSectionToggle(event) {
        this._sections = event.detail.openSections;
    }

    /**
     * Displays more filter options.
     * DVM21-30
     */
    showMore(event) {
        const facetId = event.target.closest(LIGHTNING_ACCORDION_SECTION).name;
        this._facets = this._facets.map((facet) => {
            if (facet.id === facetId) {
                return {
                    ...facet,
                    displayValues: facet.values,
                    showMoreButton: false,
                    showLessButton: true
                };
            }
            return facet;
        });
    }

    /**
     * Displays less filter options.
     * DVM21-30
     */
    showLess(event) {
        const facetId = event.target.closest(LIGHTNING_ACCORDION_SECTION).name;
        this._facets = this._facets.map((facet) => {
            if (facet.id === facetId) {
                return {
                    ...facet,
                    displayValues: facet.values.slice(0, 4),
                    showMoreButton: true,
                    showLessButton: false
                };
            }
            return facet;
        });
    }

    /**
     * Open filter menu.
     * DVM21-30
     */
    openFiltersPopup() {
        this._isShowFilters = true;
        this.dispatchEvent(
            new CustomEvent(SHOWHIDEPRODUCTS, {
                bubbles: true,
                composed: true,
                detail: false
            })
        );
    }

    /**
     * Close filter menu.
     * DVM21-30
     */
    closeFiltersPopup() {
        this._isShowFilters = false;
        this.dispatchEvent(
            new CustomEvent(SHOWHIDEPRODUCTS, {
                bubbles: true,
                composed: true,
                detail: true
            })
        );
    }
}
