import { LightningElement, api } from 'lwc';
import B2B_NO_PRODUCTS_TO_SHOW from '@salesforce/label/c.B2B_NO_PRODUCTS_TO_SHOW';
import B2B_NO_RESULTS_FOUND from '@salesforce/label/c.B2B_NO_RESULTS_FOUND';
import B2B_NO_FILTERED_PRODUCTS from '@salesforce/label/c.B2B_NO_FILTERED_PRODUCTS'; //Added as part of BS-930
export default class B2b_vs_rx_no_product_to_show_component extends LightningElement {
    /**
     * attribute to show or hide message on UI
     * BS-642
     * @type {Array}
     */
    @api
    noProducts;

    /**
     * attribute to show or hide message no search result message
     * BS-625
     * @type {Array}
     */
    @api
    noSearchResults;

    labels = {
        noFilteredProducts: B2B_NO_FILTERED_PRODUCTS, //Added as part of BS-930
        noProducts: B2B_NO_PRODUCTS_TO_SHOW,
        noSearchProducts: B2B_NO_RESULTS_FOUND
    };
}
