import { LightningElement, api } from 'lwc';

export default class B2b_searchLensShape extends LightningElement {
    @api displayData;
    _sections;

    handleShapeClick(event) {
        this.dispatchEvent(
            new CustomEvent('shapeupdate', {
                bubbles: true,
                composed: true,
                detail: event.currentTarget.dataset.id
            })
        );
    }

    get activeSections() {
        return this._sections ? this._sections : ['lensShape'];
    }

    handleSectionToggle(event) {
        this._sections = event.detail.openSections;
    }
}
