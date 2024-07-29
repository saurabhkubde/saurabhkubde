import { LightningElement, api, track } from 'lwc';
import COLOR_FILTER from '@salesforce/label/c.B2B_PLP_ColorFilter_Columns';

// EVENT NAME CONSTANTS
const FILTER_SELECTION = 'filterselection';
const COLOR_RADIO_BUTTON = 'Color Radio Button';

export default class B2b_vs_rx_color_radio_button_component extends LightningElement {
    /**
     * Collection of filters to be displayed on UI
     * This collection is transfered from b2b_filterContainer component
     * BS-521
     * @type {Array}
     */
    @api filters;

    colorLabel = COLOR_FILTER.split(',')[3];

    /**
     * Collection to store the selections
     * BS-930
     * @type {Array}
     */
    @track
    _selectedFilters;

    get activeSections() {
        return this._sections ? this._sections : ['color'];
    }

    /**
     * BS-521
     * This method fires an event when user selects any color filter options/values
     *
     */
    handleSelection(event) {
        const field = event.target.dataset.name;
        const selectedValue = event.target.dataset.item;

        /* Start BS-930 */
        let selectedValues = [];
        this._selectedFilters = '';
        for (let index = 0; index < this.filters.colorData.colorsList.length; index++) {
            if (
                this.filters.colorData.colorsList[index].colorName !== undefined &&
                this.filters.colorData.colorsList[index].colorClicked === true &&
                this.filters.colorData.colorsList[index].colorName !== selectedValue
            ) {
                selectedValues.push(this.filters.colorData.colorsList[index].colorName);
            } else if (
                this.filters.colorData.colorsList[index].colorName !== undefined &&
                this.filters.colorData.colorsList[index].colorClicked === false &&
                this.filters.colorData.colorsList[index].colorName === selectedValue
            ) {
                selectedValues.push(this.filters.colorData.colorsList[index].colorName);
            }
        }
        if (selectedValues.length === 1) {
            this._selectedFilters = selectedValues[0];
        } else {
            for (let index = 0; index < selectedValues.length; index += 2) {
                if (index <= selectedValues.length - 2 || selectedValues.length === 2) {
                    if (this._selectedFilters !== '') {
                        this._selectedFilters += ';';
                    }
                    this._selectedFilters += selectedValues[index] + ';';
                    if (selectedValues[index + 1] !== undefined && selectedValues[index + 1] !== null && selectedValues[index + 1] !== '') {
                        this._selectedFilters += selectedValues[index + 1];
                    }
                } else if (index === selectedValues.length - 1) {
                    this._selectedFilters += ';' + selectedValues[index];
                }
            }
        }
        /* End BS-930 */

        this.dispatchEvent(
            new CustomEvent(FILTER_SELECTION, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    field: field,
                    value: this._selectedFilters,
                    filterType: COLOR_RADIO_BUTTON
                }
            })
        );
    }
}
