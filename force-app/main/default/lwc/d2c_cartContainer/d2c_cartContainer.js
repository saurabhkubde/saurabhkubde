import { wire, track, LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { CartSummaryAdapter, refreshCartSummary, deleteCurrentCart } from 'commerce/cartApi'; // NBD2C-78
import getCartItemData from '@salesforce/apex/D2C_CartController.getCartItemData';
import D2C_NB_PDP_LABELS from '@salesforce/label/c.D2C_NB_PDP_LABELS';
import CART_LABELS from '@salesforce/label/c.D2C_NB_CartLabels'; //NBD2C-78
import cartLogos from '@salesforce/resourceUrl/D2C_NB_StoreStyling'; //NBD2C-78
import { navigate, NavigationContext } from 'lightning/navigation'; //NBD2C-78

const ONLINE_PURCHASE = 'Online Purchase';
const SLASH = '/';
const CLICK_AND_COLLECT = 'Click and Collect';
const HOME_PAGE = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Home'
    }
}; //NBD2C-78

export default class D2C_cartContainer extends NavigationMixin(LightningElement) {
    /**
     * Details of the current Cart
     * @type {Object}
     * NBD2C-75
     */
    @track
    _cartSummaryData;

    /**
     * Data of the products to display as Cart Items
     * @type {Object}
     * NBD2C-75
     */
    @track
    _produtsData = [];

    /**
     * Boolean that determines if the data is loaded
     * @type {Boolean}
     * NBD2C-75
     */
    _showData = false;

    /**
     * Currency code of the current active Country
     * @type {String}
     * NBD2C-75
     */
    _currencyISOCode;

    /**
     * Total number of Products Added to Cart
     * @type {Number}
     * NBD2C-75
     */
    _totalProductCount = 0;

    /**
     * Boolean to that shows if the order type is Online Purchase
     * @type {Boolean}
     * NBD2C-75
     */
    _isOnlinePurchase = false;

    /**
     * Boolean of the Loader
     * @type {Boolean}
     * NBD2C-75
     */
    _isLoading = true;

    /**
     * Boolean to that shows if the order type is Click and collect
     * @type {Boolean}
     * NBD2C-77
     */
    _isClickAndCollect = false;

    /**
     * This veriable determines if there is a change in price so that the loader can be stopped
     * @type {Number}
     * NBD2C-75
     */
    _initialTotalPrice;

    /**
     * This veriable determines if the data is fetched sucessfully
     * @type {Boolean}
     * NBD2C-75
     */
    _isDataFetched = false;

    /**
     * Label for the loader
     * @type {String}
     * NBD2C-75
     */
    _loadingLabel = D2C_NB_PDP_LABELS.split(',')[24];

    /**
     * Label to represent empty cart message
     * @type {String}
     * NBD2C-78
     */
    _emptyCartMessage = CART_LABELS.split(',')[14];

    /**
     * Label to represent continue shopping button
     * @type {String}
     * NBD2C-78
     */
    _continueShoppingLabel = CART_LABELS.split(',')[15];

    /**
     * This variable indicates whether the cart is empty
     * @type {Boolean}
     * NBD2C-78
     */
    _showEmptyCartScreen = false;

    /**
     * This variable holds the cart-logo image src
     * @type {String}
     * NBD2C-78
     */
    @track
    _cartBlackLogo = cartLogos + '/icons/Cart-black.svg';

    /**
     * This wire adapter fetches the navigation-context
     * NBD2C-78
     */
    @wire(NavigationContext)
    navigationalContext;

    /**
     * Fetch the details of the current Cart
     * NBD2C-75
     */
    @wire(CartSummaryAdapter)
    cartSummary({ error, data }) {
        if (data) {
            this._cartSummaryData = data;
            if (this._cartSummaryData !== undefined && this._cartSummaryData !== null) {
                this._totalPrice = this._cartSummaryData?.totalProductAmountAfterAdjustments ?? '';
                this._currencyISOCode = this._cartSummaryData?.currencyIsoCode ?? '';
                this._totalProductCount = this._cartSummaryData?.totalProductCount ?? null;
                //NBD2C-78 - Start
                this._showEmptyCartScreen =
                    this._totalProductCount == undefined || this._totalProductCount == null || this._totalProductCount == '' || this._totalProductCount == 0
                        ? true
                        : false; //NBD2C-78
                if (this._showEmptyCartScreen) {
                    this.handleEmptyCart();
                }
                //NBD2C-78 - End
                if (this._isDataFetched === false) {
                    this.getDataForCartItem();
                }
            }
        } else if (error) {
            this._showEmptyCartScreen =
                this._totalProductCount == undefined || this._totalProductCount == null || this._totalProductCount == '' || this._totalProductCount == 0
                    ? true
                    : false; //NBD2C-78
            this._isLoading = false;
            console.error(error);
        }
    }

    /*
     * Refresh the Cart Summary Data when the Quantity is changed
     * NBD2C-75
     */
    handleQuantityChange(event) {
        this._isDataFetched = true;
        let tempItemList = [];
        let tempItem = {};
        this._produtsData.forEach((element) => {
            if (element.Id === event.detail.itemId) {
                tempItem = element;
                tempItem.totalPrice = event.detail.totalPrice ? event.detail.totalPrice : element.totalPrice;
                tempItem.totalPrice = event.detail.totalPrice ? event.detail.totalPrice : element.totalPrice;
                tempItem.quantity = event.detail.quantity ? tempItem.quantity + event.detail.quantity : tempItem.quantity;
                if (tempItem.quantity == 1) {
                    tempItem.disableMinusButton = true;
                } else {
                    tempItem.disableMinusButton = false;
                }
                tempItemList.push(tempItem);
            } else {
                tempItemList.push(element);
            }
        });
        this._produtsData = JSON.parse(JSON.stringify(tempItemList));

        // The following method recalls the cartSummary method to get updated Cart Summary Data
        refreshCartSummary()
            .then(() => {})
            .catch((error) => {
                console.error(error);
            });
    }

    /*
     * Get the Cart Items data for the current active Cart
     * NBD2C-75
     */
    getDataForCartItem() {
        if (this._cartSummaryData) {
            this._isLoading = true;
            this._showData = false;
            let cartId = this._cartSummaryData.cartId ? this._cartSummaryData.cartId : '';
            getCartItemData({
                cartId: cartId
            })
                .then((result) => {
                    if (result != undefined && result != null) {
                        this._produtsData = [];
                        let shapeSize;
                        let bridgeSize;
                        let templeLength;

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

                            shapeSize = element?.Product2?.B2B_Shape_Size__c ?? '';
                            bridgeSize = element?.Product2?.B2B_Bridge_Size__c ?? '';
                            templeLength = element?.Product2?.B2B_Temple_Length__c ?? '';

                            productObject.size = '';
                            if (shapeSize) {
                                productObject.size = shapeSize + SLASH;
                            }

                            if (bridgeSize) {
                                productObject.size = productObject.size + bridgeSize + SLASH;
                            }

                            if (templeLength) {
                                productObject.size = productObject.size + templeLength;
                            }

                            productObject.size = productObject.size.replace(/\/$/, '');
                            if (element.Quantity == 1) {
                                productObject.disableMinusButton = true;
                            } else {
                                productObject.disableMinusButton = false;
                            }

                            if (element.Quantity == 3) {
                                productObject.disablePlusButton = true;
                            } else {
                                productObject.disablePlusButton = false;
                            }

                            this._produtsData.push(productObject);

                            if (element.Cart && element.Cart.D2C_Order_Type__c && element.Cart.D2C_Order_Type__c === ONLINE_PURCHASE) {
                                this._isOnlinePurchase = true;
                            } else if (element.Cart && element.Cart.D2C_Order_Type__c && element.Cart.D2C_Order_Type__c === CLICK_AND_COLLECT) {
                                this._isClickAndCollect = true;
                            }
                        });

                        if (this._produtsData.length > 0) {
                            this._showData = true;
                        }

                        this._isDataFetched = true;
                        if (this._initialTotalPrice && this._totalPrice && this._initialTotalPrice !== this._totalPrice) {
                            this._initialTotalPrice = this._totalPrice;
                        }
                    } else {
                        this._isLoading = false;
                    }
                })
                .catch((error) => {
                    console.error('error ', error);
                    this._isLoading = false;
                });
        }
    }

    /*
     * Handler method to Control the loader
     * NBD2C-75
     */
    handleLoaderAction(event) {
        this._isLoading = event.detail.showLoader;
    }

    /**
     * This method handles the empty cart scenario.
     * Whenever user removes items from cart in such a way that now, there are no more cart items exists, then deleting the current cart.
     * NBD2C-78
     */
    handleEmptyCart() {
        deleteCurrentCart()
            .then(() => {
                refreshCartSummary()
                    .then(() => {})
                    .catch((error) => {
                        console.error(error);
                    });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /*
     * This method is used to handle event fired on removal of cart item from cart
     * NBD2C-78
     */
    handleCartItemRemoval() {
        this._isDataFetched = false;
        // refreshCartSummary invokes the cartSummary method to fetch updated Cart Summary Data
        refreshCartSummary()
            .then(() => {})
            .catch((error) => {
                this._isLoading = false;
                console.error(error);
            });
    }

    /*
     * This method is used to redirect the user to home page
     * NBD2C-78
     */
    handleRedirectToHome() {
        this._isLoading = true;
        navigate(this.navigationalContext, HOME_PAGE);
    }
}
