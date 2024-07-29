import { LightningElement, api, track } from 'lwc';
const URI3 =
    "data:image/svg+xml;charset=utf-8,%3Csvg width='9' height='7' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.438 6.743L.248 4.492A.894.894 0 01.25 3.254a.838.838 0 011.201.002L3.04 4.887 7.55.253a.838.838 0 011.2.002.893.893 0 010 1.238l-5.108 5.25A.84.84 0 013.04 7a.844.844 0 01-.602-.257z'/%3E%3C/svg%3E";

const SELECTED_BORDER = 'border-color: #494949;';
const BACKGROUND_SIZE = 'background-size:65% !important;';
const STYLE_DISPLAY_NONE = 'display: none';
const IMPORTANT = '!important;';
const UPDATECOLORSELECTION = 'updatecolorselection';
const TRUE = 'true';

export default class D2c_VTO_ColorRadioButton extends LightningElement {
    /**
     * The color data to be used in the radio buttons, passed from parent component
     * DVM21-30
     */
    @api
    colorRadioButtonData;

    /**
     * Tracks the currently selected colors for each field
     * DVM21-30
     */
    @track
    _selectedColorList = {};

    /**
     * Resets the selected color list to an empty object. This can be called from a parent component to clear all selected colors.
     * DVM21-30
     */
    @api
    resetSelectedColorList() {
        this._selectedColorList = {};
    }

    /**
     * Handles the color radio button selection.
     * Updates the _selectedColorList and colorRadioButtonData based on user interaction.
     * Dispatches a custom event to notify parent components of the selection change.
     * DVM21-30
     */
    handleColorRadioSelection(event) {
        const field = event.target.dataset.name;
        const item = event.target.dataset.item;
        let colorClickedValue = event.target.dataset.checked;

        // Update _selectedColorList based on the checked status
        if (colorClickedValue === TRUE) {
            if (this._selectedColorList[field]) {
                this._selectedColorList[field] = this._selectedColorList[field].filter((color) => color !== item);
                if (this._selectedColorList[field].length === 0) {
                    delete this._selectedColorList[field]; // Remove the field if no colors are selected
                }
            }
            this.dispatchEvent(
                new CustomEvent(UPDATECOLORSELECTION, {
                    bubbles: true,
                    composed: true,
                    detail: {
                        facetId: field,
                        filterId: item,
                        isChecked: false
                    }
                })
            );
        } else {
            if (!this._selectedColorList[field]) {
                this._selectedColorList[field] = [];
            }
            this._selectedColorList[field].push(item);
            this.dispatchEvent(
                new CustomEvent(UPDATECOLORSELECTION, {
                    bubbles: true,
                    composed: true,
                    detail: {
                        facetId: field,
                        filterId: item,
                        isChecked: true
                    }
                })
            );
        }

        this.colorRadioButtonData = this.colorRadioButtonData.map((element) => {
            if (field === element.fieldName) {
                return {
                    ...element,
                    colorsList: element.colorsList.map((color) => {
                        if (this._selectedColorList[field] && this._selectedColorList[field].includes(color.colorName)) {
                            return {
                                ...color,
                                colorStyle: color.colorStyle + ' background: url("' + URI3 + '");' + SELECTED_BORDER + BACKGROUND_SIZE,
                                colorClicked: true
                            };
                        } else {
                            return {
                                ...color,
                                colorStyle: color.colorStyle == STYLE_DISPLAY_NONE ? color.colorStyle : 'background-color: ' + color.colorHex + IMPORTANT,
                                colorClicked: false
                            };
                        }
                    })
                };
            } else {
                return element;
            }
        });
    }
}
