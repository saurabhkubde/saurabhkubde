import { LightningElement, api, wire, track } from 'lwc';
import { CartSummaryAdapter } from 'commerce/cartApi'; // NBD2C-98
import getCartItemData from '@salesforce/apex/D2C_CartController.getCartItemData'; //NBD2C-98

//NBD2C-98 - Start
const LOADING_EVENT = 'loadingcontrolevent';
//NBD2C-98 - End
export default class D2C_orderSummary extends LightningElement {
    /**
     * Details of the current Cart
     * @type {Object}
     * NBD2C-98
     */
    @track
    _cartSummaryData;

    /**
     * Data of the products to display as Order Items
     * @type {Array}
     * NBD2C-98
     */
    @track
    _orderSummaryData = [];

    /**
     * Boolean that controls component visibility
     * @type {Boolean}
     * NBD2C-98
     */
    _showData = false;

    /**
     * Currency code of the current cart and session on user
     * @type {String}
     * NBD2C-98
     */
    _currencyISOCode;

    /**
     * Total number of Products present in the Cart
     * @type {Number}
     * NBD2C-98
     */
    _totalProductCount = 0;

    /**
     * This variable determines if the data is fetched sucessfully
     * @type {Boolean}
     * NBD2C-98
     */
    _isDataFetched = false;

    /**
     * Boolean of the Loader
     * @type {Boolean}
     * NBD2C-98
     */
    _isLoading = true;

    /**
     * This variable holds the total price value of the cart
     * @type {String}
     * NBD2C-98
     */
    _totalPrice;

    /**
     * NBD2C-98
     * This collection variable contains all of the labels that needs to be shown on UI
     * @type {String}
     */
    @api
    labels;

    /**
     * Total number of order items
     * @type {Number}
     * NBD2C-98
     */
    _orderItemsCount;

    /**
     * Fetch the details of the current Cart
     * NBD2C-98
     */
    @wire(CartSummaryAdapter)
    cartSummary({ error, data }) {
        if (data) {
            this._cartSummaryData = data;
            if (this._cartSummaryData !== undefined && this._cartSummaryData !== null) {
                this._totalPrice = this._cartSummaryData?.totalProductAmountAfterAdjustments ?? '';
                this._currencyISOCode = this._cartSummaryData?.currencyIsoCode ?? '';
                this._totalProductCount = this._cartSummaryData?.totalProductCount ?? null;
                if (this._totalProductCount) {
                    this._orderItemsCount = ' (' + parseInt(this._totalProductCount) + ')';
                }
                if (this._isDataFetched === false) {
                    this.getDataForOrderItem();
                }
            } else {
                this._isLoading = false;
                this.fireOperateLoader(false, true);
            }
        } else if (error) {
            this._isLoading = false;
            this.fireOperateLoader(false, true);
            console.error(error);
        }
    }

    /*
     * Fetching the additional product data from server
     * NBD2C-98
     */
    getDataForOrderItem() {
        if (this._cartSummaryData) {
            let cartId = this._cartSummaryData.cartId ? this._cartSummaryData.cartId : '';
            getCartItemData({
                cartId: cartId
            })
                .then((result) => {
                    if (result != undefined && result != null) {
                        this._orderSummaryData = [];

                        result.forEach((element) => {
                            let productObject = {};
                            productObject.pictureLink = element?.Product2?.B2B_Picture_Link__c ?? '';
                            productObject.frameColorDescription = element?.Product2?.B2B_Frame_Color_Description__c ?? '';
                            productObject.frameColorDescription =
                                productObject.frameColorDescription + ' ' + (element?.Product2?.StockKeepingUnit?.substring(7, 11) ?? '');
                            productObject.bridgeSize = element?.Product2?.B2B_Bridge_Size__c ?? '';
                            productObject.templeLength = element?.Product2?.B2B_Temple_Length__c ?? '';
                            productObject.modelName = element?.Product2?.B2B_Model__c ?? '';
                            productObject.shapeSize = element?.Product2?.B2B_Shape_Size__c ?? '';
                            productObject.sku = element?.Product2?.StockKeepingUnit ?? '';
                            productObject.productId = element?.Product2?.Id ?? '';
                            productObject.name = element?.Product2?.Name ?? '';
                            productObject.totalPrice = element?.TotalPrice ?? '';
                            productObject.quantity = element?.Quantity ?? '';
                            productObject.currencyIsoCode = element?.CurrencyIsoCode ?? '';
                            productObject.Id = element?.Id ?? '';
                            productObject.pricingHelpText = this.labels && this.labels.priceHelpTextLabel ? this.labels.priceHelpTextLabel : null;

                            this._orderSummaryData.push(productObject);
                        });

                        if (this._orderSummaryData.length > 0) {
                            this._showData = true;
                            this._isLoading = false;
                            this.fireOperateLoader(false, true);
                        }
                    } else {
                        this._isLoading = false;
                        this.fireOperateLoader(false, true);
                    }
                })
                .catch((error) => {
                    console.error(error);
                    this._isLoading = false;
                    this.fireOperateLoader(false, true);
                });
        } else {
            this.fireOperateLoader(false, true);
        }
    }

    /*
     * This method is used to operate the loading spinner present on 'd2c_order_summary-component' through custom event
     * NBD2C-98
     */
    fireOperateLoader(doLoading, isReady) {
        this.dispatchEvent(
            new CustomEvent(LOADING_EVENT, {
                detail: {
                    performLoading: doLoading,
                    isComponentReady: isReady
                }
            })
        );
    }
}
