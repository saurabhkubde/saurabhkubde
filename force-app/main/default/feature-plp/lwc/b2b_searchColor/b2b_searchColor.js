import { LightningElement, api } from 'lwc';
import COLOR_FILTER from '@salesforce/label/c.B2B_PLP_ColorFilter_Columns';

export default class B2b_searchColor extends LightningElement {
    @api
    displayData;
    colorLabel = COLOR_FILTER.split(',')[3];
    _sections;

    handleColorClick(event) {
        let colorObj = { colorCode: event.target.dataset.item, colorType: event.target.dataset.name };
        this.dispatchEvent(
            new CustomEvent('colorupdate', {
                bubbles: true,
                composed: true,
                detail: colorObj
            })
        );
    }

    get activeSections() {
        return this._sections ? this._sections : ['color'];
    }

    handleSectionToggle(event) {
        this._sections = event.detail.openSections;
    }
}
