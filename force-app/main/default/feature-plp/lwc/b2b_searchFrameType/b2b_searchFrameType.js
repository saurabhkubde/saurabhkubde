import { LightningElement, api } from 'lwc';

export default class B2b_searchFrameType extends LightningElement {
    @api displayData;
    _sections;

    handleFrameClick(event) {
        this.dispatchEvent(
            new CustomEvent('frameupdate', {
                bubbles: true,
                composed: true,
                detail: event.currentTarget.dataset.id
            })
        );
    }

    get activeSections() {
        return this._sections ? this._sections : ['frame'];
    }

    handleSectionToggle(event) {
        this._sections = event.detail.openSections;
    }
}
