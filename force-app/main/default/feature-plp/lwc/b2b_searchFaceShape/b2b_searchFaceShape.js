import { LightningElement, api } from 'lwc';

export default class B2b_searchFaceShape extends LightningElement {
    @api displayData;

    handleShapeClick(event) {
        this.dispatchEvent(
            new CustomEvent('faceupdate', {
                bubbles: true,
                composed: true,
                detail: event.currentTarget.dataset.id
            })
        );
    }

    get activeSections() {
        return this._sections ? this._sections : ['faceShape'];
    }

    handleSectionToggle(event) {
        this._sections = event.detail.openSections;
    }
}
