import { LightningElement, api } from 'lwc';

export default class B2b_vs_rx_additionalOrderDetails extends LightningElement {
    @api
    orderData;

    @api
    label;

    @api
    isRxItem;

    @api
    isVsItem;

    @api
    lensSelectionReadOnlyCollection;

    @api
    lensSelectionLabel;

    @api
    isComment;

    @api
    instructionsLabel;

    @api
    lensConfiguratorId; //BS-2343

    @api
    shapeAdjusted; //BS-2343
}
