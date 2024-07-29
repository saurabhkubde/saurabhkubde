import { api, track, LightningElement } from 'lwc';

// EVENT NAME AND PROPERTIES CONSTANTS
const SLIDER_FILTER_SELECTION = 'sliderfilterselection';
const DOUBLE_HANDLE_SLIDER = 'Double Handle Slider';
const SINGLE_HANDLE_SLIDER = 'Single Handle Slider';
const DO_LOAD = 'loading';
const SLIDER = 'Slider';
const WIDTH = 'width:';
const LEFT = 'left:';
const RIGHT = 'right:';

export default class B2b_sliderComponent extends LightningElement {
    /**
     * Collection of details of slider type filter available for current store and category.
     * This collection is transfered from b2b_filterContainer component
     * BS-457
     * @type {Array}
     */
    @api
    filters;

    /**
     * Current filterName value recieved from b2b_filterContainer component
     * BS-457
     * @type {String}
     */
    @api
    fieldName;

    /**
     * Collection of all filters available
     * BS-457
     * @type {String}
     */
    @api
    allFilters;

    /**
     * Slider track styling attribute that is used to set appearance of track on UI from left side
     * BS-457
     * @type {String}
     */
    _inverseLeftStylingAttribute = '';

    /**
     * Slider track styling attribute that is used to set appearance of track on UI from right side
     * BS-457
     * @type {String}
     */
    _inverseRightStylingAttribute = '';

    /**
     * Slider range styling attribute that is used to set appearance of track on UI from left side
     * BS-457
     * @type {String}
     */
    _rangeLeftStylingAttribute = '';

    /**
     * Slider range styling attribute that is used to set appearance of track on UI from right side
     * BS-457
     * @type {String}
     */
    _rangeRightStylingAttribute = '';

    /**
     * Tooltip styling attribute that is used to set appearance of tooltip on UI for left side handle
     * BS-457
     * @type {String}
     */
    _thumbLeftStylingAttribute = '';

    /**
     * Tooltip styling attribute that is used to set appearance of tooltip on UI for right side handle
     * BS-457
     * @type {String}
     */
    _thumbRightStylingAttribute = '';

    /**
     * Tooltip hover styling attribute that is used to set appearance of tooltip on UI for left side handle when hovered
     * BS-457
     * @type {String}
     */
    _signLeftStylingAttribute = '';

    /**
     * Tooltip hover styling attribute that is used to set appearance of tooltip on UI for right side handle when hovered
     * BS-457
     * @type {String}
     */
    _signRightStylingAttribute = '';

    /**
     * Slider track styling attribute that is used to set appearance of tooltip on UI
     * BS-457
     * @type {String}
     */
    _rangeStylingAttribute;

    /**
     * Slider left handle styling attribute that is used to set appearance of left handle
     * BS-457
     * @type {String}
     */
    _sliderLeftHandleValue;

    /**
     * Slider right handle styling attribute that is used to set appearance of right handle
     * BS-457
     * @type {String}
     */
    _sliderRightHandleValue;

    /**
     * Slider left handle percentage from right. It is used for internal calculations for styling
     * BS-457
     * @type {String}
     */
    _sliderLeftHandlePercentage;

    /**
     * Slider right handle percentage from right. It is used for internal calculations for styling
     * BS-457
     * @type {String}
     */
    _sliderRightHandlePercentage;

    /**
     * Slider minimum allowed range value. This value is Fetched from filter Preference Setting
     * BS-457
     * @type {String}
     */
    _sliderMinimumRangeValue;

    /**
     * Slider maximum allowed range value. This value is Fetched from filter Preference Setting
     * BS-457
     * @type {String}
     */
    _sliderMaximumRangeValue;

    /**
     * Slider increment/step value. This value is Fetched from filter Preference Setting
     * BS-457
     * @type {String}
     */
    _sliderIncrementValue;

    /**
     * Source product field of slider type filter
     * BS-457
     * @type {String}
     */
    _sourceProductField;

    /**
     * This property is used to indicate whether second handle is applicable for slider
     * There are two types of slider: single handle slider and double handle slider
     * BS-457
     * @type {Boolean}
     */
    @track
    _secondHandle;

    /**
     * Method is used to set slider attributes from the recieved Filter Preference Settings data once component is loaded
     * BS-457
     */
    renderedCallback() {
        // Setting up the slider attributes from recieved Filter Preference Settings if available
        // Filters data is passed from b2b_filterContainer
        if (this.filters) {
            this._sliderMinimumRangeValue = this.filters.availableFilters.sliderMinimumValue;
            this._sliderMaximumRangeValue = this.filters.availableFilters.sliderMaximumValue;
            this._sliderIncrementValue = this.filters.availableFilters.sliderIncrementValue;

            // Here slider is identified as single handle slider or double handle slider by checking the specified values present in Filter Preference Setting
            if (this.filters.availableFilters.sliderType == DOUBLE_HANDLE_SLIDER) {
                this._secondHandle = true; // This property is set to true if there are more than one values present in Filter Preference Setting
            } else if (this.filters.availableFilters.sliderType == SINGLE_HANDLE_SLIDER) {
                // If there is only one value present in specified values in Filter Preference Setting then _secondHandle is set to false
                // This indicated that slider is of double handle type
                this._secondHandle = false;
            }

            //If slider is already loaded then handle values are assigned from preserved values from slider filter collection
            if (
                this.filters.availableFilters.sliderSelectedLeftValue != null &&
                this.filters.availableFilters.sliderSelectedLeftValue != undefined &&
                this.filters.availableFilters.sliderSelectedRightValue != null &&
                this.filters.availableFilters.sliderSelectedRightValue != undefined
            ) {
                this._sliderLeftHandleValue = this.filters.availableFilters.sliderSelectedLeftValue;
                this._sliderRightHandleValue = this.filters.availableFilters.sliderSelectedRightValue;
            } else {
                this._sliderLeftHandleValue = this._sliderMinimumRangeValue;
                this._sliderRightHandleValue = this._sliderMaximumRangeValue;
            }
            this._sourceProductField = this.filters.availableFilters.sourceProductField;
        }

        // If slider is of double handle type, setting up respective slider styling attributes
        if (this._secondHandle != null && this._secondHandle) {
            let sliderRangeValueDifference = this._sliderMaximumRangeValue - this._sliderMinimumRangeValue;
            let leftSliderValueDifference = this._sliderLeftHandleValue - this._sliderMinimumRangeValue;
            let rightSliderValueDifference = this._sliderRightHandleValue - this._sliderMinimumRangeValue;

            this._sliderLeftHandlePercentage = (leftSliderValueDifference / sliderRangeValueDifference) * 100;
            this._sliderRightHandlePercentage = (rightSliderValueDifference / sliderRangeValueDifference) * 100;

            this._inverseLeftStylingAttribute = WIDTH + this._sliderLeftHandlePercentage + '%;';
            this._inverseRightStylingAttribute = WIDTH + (100 - this._sliderRightHandlePercentage) + '%;';

            this._rangeLeftStylingAttribute = LEFT + this._sliderLeftHandlePercentage + '%;';
            this._rangeRightStylingAttribute = RIGHT + (100 - this._sliderRightHandlePercentage) + '%;';

            this._rangeStylingAttribute = this._rangeLeftStylingAttribute + this._rangeRightStylingAttribute;

            this._thumbLeftStylingAttribute = LEFT + this._sliderLeftHandlePercentage + '%;';
            this._thumbRightStylingAttribute = LEFT + this._sliderRightHandlePercentage + '%;';

            this._signLeftStylingAttribute = LEFT + this._sliderLeftHandlePercentage + '%;';
            this._signRightStylingAttribute = LEFT + this._sliderRightHandlePercentage + '%;';
        } else {
            // If slider is of single handle type, setting up respective slider styling attributes
            let sliderRangeValueDifference = this._sliderMaximumRangeValue - this._sliderMinimumRangeValue;
            let leftSliderValueDifference = this._sliderLeftHandleValue - this._sliderMinimumRangeValue;
            let rightSliderValueDifference = this._sliderRightHandleValue - this._sliderMinimumRangeValue;

            this._sliderLeftHandlePercentage = (leftSliderValueDifference / sliderRangeValueDifference) * 100;
            this._sliderRightHandlePercentage = (rightSliderValueDifference / sliderRangeValueDifference) * 100;

            this._inverseLeftStylingAttribute = WIDTH + this._sliderLeftHandlePercentage + '%;';
            this._inverseRightStylingAttribute = WIDTH + (100 - this._sliderRightHandlePercentage) + '%;';

            this._rangeLeftStylingAttribute = LEFT + this._sliderLeftHandlePercentage + '%;';
            this._rangeRightStylingAttribute = RIGHT + (100 - this._sliderRightHandlePercentage) + '%;';

            this._rangeStylingAttribute = this._rangeLeftStylingAttribute + this._rangeRightStylingAttribute;

            this._thumbLeftStylingAttribute = LEFT + this._sliderLeftHandlePercentage + '%;';
            this._thumbRightStylingAttribute = LEFT + this._sliderRightHandlePercentage + '%;';

            this._signLeftStylingAttribute = LEFT + this._sliderLeftHandlePercentage + '%;';
            this._signRightStylingAttribute = LEFT + this._sliderRightHandlePercentage + '%;';
        }
    }

    /**
     * Method is used to handle the scenario: When the user drags the slider's left handle then,
     *              slider's left handle should be reflected on UI according to value selected
     * This method does not filters out the products
     * BS-457
     */
    handleSliderLeftValueChange(event) {
        let value = event.target.value;
        if (this._sliderLeftHandleValue != value) {
            this._sliderLeftHandleValue = value; // Assigning value selected by user on UI to left handle of slider
            if (this._secondHandle) {
                //Validation to check whether left slider is trying to cross right handle slider
                //Applicable only if slider is of double handle type
                if (this._secondHandle && this._sliderRightHandleValue - this._sliderLeftHandleValue < this._sliderIncrementValue) {
                    //If left handle is trying to cross right handle slider, prevent it and set it to previous valid value
                    this._sliderLeftHandleValue = parseInt(this._sliderRightHandleValue) - parseInt(this._sliderIncrementValue);
                }
            }

            //Setting up slider stryling attributes according to slider value selected by user on UI
            let sliderRangeValueDifference = this._sliderMaximumRangeValue - this._sliderMinimumRangeValue;
            let leftSliderValueDifference = this._sliderLeftHandleValue - this._sliderMinimumRangeValue;
            let rightSliderValueDifference = this._sliderRightHandleValue - this._sliderMinimumRangeValue;

            this._sliderLeftHandlePercentage = (leftSliderValueDifference / sliderRangeValueDifference) * 100;
            this._sliderRightHandlePercentage = (rightSliderValueDifference / sliderRangeValueDifference) * 100;

            this._inverseLeftStylingAttribute = WIDTH + this._sliderLeftHandlePercentage + '%;';
            this._rangeLeftStylingAttribute = LEFT + this._sliderLeftHandlePercentage + '%;';

            this._rangeRightStylingAttribute = RIGHT + (100 - this._sliderRightHandlePercentage) + '%;';
            this._rangeStylingAttribute = this._rangeLeftStylingAttribute + this._rangeRightStylingAttribute;

            this._thumbLeftStylingAttribute = LEFT + this._sliderLeftHandlePercentage + '%;';
            this._signLeftStylingAttribute = LEFT + this._sliderLeftHandlePercentage + '%;';

            //Capturing slider values and putting into collection
            const sliderValues = {};
            sliderValues.sliderOneValue = this._sliderLeftHandleValue;
            sliderValues.sliderTwoValue = this._sliderRightHandleValue;

            //Invoking fireFilterSelection with above collection of slider values that is used to preserve the values in filters collection
            //Currently input parameter : doProductSearch is set to false as there is no need to filter out the products because user not released the mouse or touch yet
            this.fireFilterSelection(sliderValues, false);
        }
    }

    /**
     * Method is used to handle the scenario: When the user drags the slider's right handle then,
     *              slider's right handle should be reflected on UI according to value selected
     * This method does not filters out the products
     * BS-457
     */
    handleSliderRightValueChange(event) {
        let value = event.target.value;
        if (this._sliderRightHandleValue != value) {
            this._sliderRightHandleValue = value; //Assigning value selected by user on UI to left handle of slider

            //Validation to check whether right slider is trying to cross left handle slider.
            //Applicable only if slider is of double handle type
            if (this._secondHandle) {
                if (this._sliderRightHandleValue - this._sliderLeftHandleValue < this._sliderIncrementValue) {
                    //If right handle is trying to cross left handle slider, prevent it and set it to previous valid value
                    this._sliderRightHandleValue = parseInt(this._sliderLeftHandleValue) + parseInt(this._sliderIncrementValue);
                }
            }

            //Setting up slider stryling attributes according to slider value selected by user on UI
            let sliderRangeValueDifference = this._sliderMaximumRangeValue - this._sliderMinimumRangeValue;
            let leftSliderValueDifference = this._sliderLeftHandleValue - this._sliderMinimumRangeValue;
            let rightSliderValueDifference = this._sliderRightHandleValue - this._sliderMinimumRangeValue;

            this._sliderLeftHandlePercentage = (leftSliderValueDifference / sliderRangeValueDifference) * 100;
            this._sliderRightHandlePercentage = (rightSliderValueDifference / sliderRangeValueDifference) * 100;

            this._inverseRightStylingAttribute = WIDTH + (100 - this._sliderRightHandlePercentage) + '%;';

            this._rangeLeftStylingAttribute = LEFT + this._sliderLeftHandlePercentage + '%;';
            this._rangeRightStylingAttribute = RIGHT + (100 - this._sliderRightHandlePercentage) + '%;';
            this._rangeStylingAttribute = this._rangeLeftStylingAttribute + this._rangeRightStylingAttribute;

            this._thumbRightStylingAttribute = LEFT + this._sliderRightHandlePercentage + '%;';
            this._signRightStylingAttribute = LEFT + this._sliderRightHandlePercentage + '%;';

            //Capturing slider values and putting into collection
            const sliderValues = {};
            sliderValues.sliderOneValue = this._sliderLeftHandleValue;
            sliderValues.sliderTwoValue = this._sliderRightHandleValue;

            //Invoking fireFilterSelection with above collection of slider values that is used to preserve the values in filters collection
            //Currently input parameter : doProductSearch is set to false as there is no need to filter out the products because user not released the mouse or touch yet
            this.fireFilterSelection(sliderValues, false);
        }
    }

    /**
     * Method is used to handle the scenario: When the user drags the slider handle and releases mouse click or touch
     * This method does not filters out the products
     * BS-457
     */
    handleSearchProductOnSliderValueSelection(event) {
        //Capturing slider values and putting into collection
        const sliderValues = {};
        sliderValues.sliderOneValue = parseInt(this._sliderLeftHandleValue);
        sliderValues.sliderTwoValue = parseInt(this._sliderRightHandleValue);

        //Invoking fireFilterSelection with above collection of slider values that is used to filter out the products according to slider values selected by user on UI
        //Currently input parameter : doProductSearch is set to true as there is need to filter out the products because user released the mouse or touch
        this.fireFilterSelection(sliderValues, true);
    }

    /**
     * Method is used to fire event with below parameters
     *        field             :   Selected Slider's source product field name
     *        value             :   Selected Slider values collection (Left and Right handle value)
     *        filterType        :   Type of filter selected by user (Slider)
     *        doProductSearch   :   Whether to filter out product or not
     * @param sliderValues      :   Collection of slider values selected by user
     * @param doProductSearch   :   Boolean value for determining product search according to slider values
     *
     * Below two are the scenarios that determines values of doProductSearch:
     *  Scenario 1  :   doProductSearch=> false : When the user drags the slider then, slider handles should be reflected on UI according to selected values
     *                           This should not filter out products hence, doProductSearch is set to false
     *  Scenario 2  :   doProductSearch=> true  : When the user drags the slider and releases the mouse(on laptop/ desktop) or releases the finger (on mobile/i-pad),
     *                           slider handles should be reflected on UI according to values selected along with filtering out the products that matches the filter criteria.
     * BS-457
     */
    fireFilterSelection(sliderValues, doProductSearch) {
        this.dispatchEvent(
            new CustomEvent(SLIDER_FILTER_SELECTION, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    field: this._sourceProductField,
                    value: sliderValues,
                    filterType: SLIDER,
                    doProductSearch: doProductSearch,
                    fieldName: this._sourceProductField // Added as part of BS-841
                }
            })
        );
    }
}
