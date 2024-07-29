import { LightningElement, api, wire } from 'lwc';
import { ProductPricingAdapter } from 'commerce/productApi';
import STORE_STYLING from '@salesforce/resourceUrl/D2C_NB_StoreStyling';
import D2C_NB_PDP_LABELS from '@salesforce/label/c.D2C_NB_PDP_LABELS';
import { createCartItemAddAction, dispatchAction } from 'commerce/actionApi';
import { fireEvent } from 'c/b2b_pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { navigate, NavigationContext } from 'lightning/navigation';
import updateCartRecord from '@salesforce/apex/D2C_CartController.updateCartRecord';
import { CartSummaryAdapter } from 'commerce/cartApi';
import CART_LABELS from '@salesforce/label/c.D2C_NB_CartLabels';
import MIX_CART_PREVENTION_MESSAGE from '@salesforce/label/c.D2C_NB_MIX_CART_PREVENTION_MESSAGE'; //NBD2C-74
import getPackagingImageUrl from '@salesforce/apex/D2C_ProductDetailsController.getPackagingImageUrl';
import FITTING_GUIDE_PAGE_URL from '@salesforce/label/c.D2C_NB_Fitting_Guide_Page_URL'; //NBD2C-71

const ADD_TO_CART_EVENT = 'addedtocart';
const CART_PAGE = {
    type: 'comm__namedPage',
    attributes: {
        name: 'Current_Cart'
    }
};

const FITTING_GUIDE_PAGE = {
    type: 'comm__namedPage',
    attributes: {
        name: FITTING_GUIDE_PAGE_URL
    }
};

const HANDLE_LOADER_EVENT = 'handleloader';
const ONLINE_PURCHASE = 'Online Purchase';
const CLICK_AND_COLLECT = 'Click and Collect';
const MIX_CART_PREVENTION_MESSAGE_STYLING = 'text-transform: none!important;'; //NBD2C-74
const CART_ITEM_QUANTITY_TO_BE_UPDATED = '1';

// DVM21-31 : CONSTANTS : Start
const SHOPCONTEXT = 'shopContext';
const VISIBILITY_HIDDEN = `visibility: hidden;`;
const VISIBILITY_VISIBLE = `visibility: visible;`;
// DVM21-31 : CONSTANTS : End

export default class D2C_productDetailsDisplay extends LightningElement {
    @api
    displayData;

    @api
    productId;

    /* START-NBD2C-49: PDP Icons */
    _questionIcon = STORE_STYLING + '/icons/Question-mark-logo.svg';
    _glassWidthIcon = STORE_STYLING + '/icons/glassWidth.svg';
    _bridgeIcon = STORE_STYLING + '/icons/bridge.svg';
    _templeLengthIcon = STORE_STYLING + '/icons/templeLength.svg';
    _deliverFreeIcon = STORE_STYLING + '/icons/deliverFree.svg';
    /* END- PDP Icons */

    @api
    variationProductIds;

    _activeSections = ['productDetails']; // NBD2C-49: This array is used to keep the product details accordian open on load of PDP
    _showModal = false; // NBD2C-49: This boolean variable is used to maintain the visibility of Size pop-up modal
    _pricingDetails = []; //NBD2C-49 : Stores the result from ProductPricingAdapter StorefrontAPI
    _suggestedRetailPrice; //NBD2C-49 : Stores the unit price of a product
    _currencyISOCode; //NBD2C-49 : Stores the currency ISO code of a product
    _productFeatures; //NBD2C-49 : Stores the Features that are retrieved from Product_Description__c field
    _productLensDetailsList = []; //NBD2C-49 : Stores the Lens details that are retrieved from B2B_Lens_Technology__c field
    _showLens = false; //NBD2C-49 : Boolean to handle the hide and show of Lens accordian

    /* START - PDP Custom Labels */

    _sizeLabel = D2C_NB_PDP_LABELS.split(',')[0];
    _materialLabel = D2C_NB_PDP_LABELS.split(',')[1];
    _colorLabel = D2C_NB_PDP_LABELS.split(',')[2];
    _modelLabel = D2C_NB_PDP_LABELS.split(',')[3];
    _includedLabel = D2C_NB_PDP_LABELS.split(',')[4];
    _hardcaseCleaningClothLabel = D2C_NB_PDP_LABELS.split(',')[5];
    _whatDoTheseNumbersMeanLabel = D2C_NB_PDP_LABELS.split(',')[6];
    _mmLabel = D2C_NB_PDP_LABELS.split(',')[7];
    _glassWidthBridgeTempleLengthLabel = D2C_NB_PDP_LABELS.split(',')[8];
    _glassWidthLabel = D2C_NB_PDP_LABELS.split(',')[9];
    _bridgeLabel = D2C_NB_PDP_LABELS.split(',')[10];
    _templeLengthLabel = D2C_NB_PDP_LABELS.split(',')[11];
    _fittingHeightGuideLabel = D2C_NB_PDP_LABELS.split(',')[12];
    _opticalGlazingAndAssociatedCostLabel = D2C_NB_PDP_LABELS.split(',')[13];
    _addToCartButtonLabel = D2C_NB_PDP_LABELS.split(',')[14];
    _tryOnButtonLabel = D2C_NB_PDP_LABELS.split(',')[15];
    _deliveryFreeOfChargeTextLabel = D2C_NB_PDP_LABELS.split(',')[16];
    _learnMoreLabel = D2C_NB_PDP_LABELS.split(',')[17];
    _freeDeliveryAndReturnsLabel = D2C_NB_PDP_LABELS.split(',')[19];
    _productDetailsLabel = D2C_NB_PDP_LABELS.split(',')[20];
    _featuresLabel = D2C_NB_PDP_LABELS.split(',')[21];
    _lensLabel = D2C_NB_PDP_LABELS.split(',')[22];
    _closeButtonLabel = CART_LABELS.split(',')[9]; // NBD2C-72
    _continueButtonLabel = CART_LABELS.split(',')[10]; // NBD2C-72
    _maxproductsLabel = CART_LABELS.split(',')[11]; // NBD2C-72

    /*END - PDP Custom Labels*/

    @wire(NavigationContext)
    navContext;

    /**
     * NBD2C-75
     *  Variable that stores the cart related data
     */
    _cartSummaryData;

    /**
     * NBD2C-75
     * Variable that stores the reference of current page
     */
    _pageRef;

    /**
     * NBD2C-72
     * Variable that stores the reference of current page
     */
    _totalProductCount;

    /**
     * NBD2C-72
     * Boolean to determine if the add to cart button is enabled
     */
    _addtoCartDisabled = false;

    /**
     * Boolean to show max items modal
     * @type {String}
     * NBD2C-72
     */
    _showModalMaxItems = false;

    /**
     * NBD2C-74
     * Boolean to control visibility of 'Add to Cart' button on UI
     * @type {Boolean}
     */
    _showAddToCartButton = true;

    /**
     * NBD2C-74
     * Boolean to control visibility of 'Try on at your optician' button on UI
     * @type {Boolean}
     */
    _showTryOnAtYourOptician = true;

    /**
     * NBD2C-74
     * Boolean to control visibility of mix cart prevention popup on UI
     * @type {Boolean}
     */
    _showInfoPopupForClickAndCollectOrder = false;

    /**
     * NBD2C-74
     * This variable holds the message that needs to be shown inside the mix cart prevention popup
     * @type {String}
     */
    _infoMessageForClickAndCollectOrder = MIX_CART_PREVENTION_MESSAGE;

    /**
     * NBD2C-74
     * This variable holds the label for cancel button
     * @type {String}
     */
    _cancelButtonLabel = CART_LABELS.split(',')[12];

    /**
     * NBD2C-74
     * This variable holds the label for approved(Ok) button
     * @type {String}
     */
    _approvedButtonLabel = CART_LABELS.split(',')[13];

    /**
     * NBD2C-74
     * This variable holds the styling of popup message
     * @type {String}
     */
    _headerTextStylingForPopup = '';

    /**
     * NBD2C-73
     * This variable holds the packaging values to display
     * @type {array}
     */
    _packagingValues;

    /**
     * NBD2C-73
     * This variable holds the URL of the packaging image
     * @type {String}
     */
    _packagingImageURL;

    /**
     * NBD2C-73
     * This variable controls the rendering of the packaging pop-up on PDP
     * @type {Boolean}
     */
    _isPackagingModalOpen = false;

    /**
     * An object with the current PageReference.
     * This is needed for the pubsub library.
     *
     * @type {PageReference}
     */

    /**
     * This variable determines the visibility of details based on the shop context.
     * DVM21-31
     * @type {string}
     */
    _detailVisibility;

    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        this._pageRef = pageRef;
    }

    /**
     * NBD2C-75
     * This wire method makes the API Call : CartSummaryAdapter with the provided product id
     */
    @wire(CartSummaryAdapter)
    cartSummary({ error, data }) {
        if (data) {
            this._cartSummaryData = data;
            this._totalProductCount = this._cartSummaryData?.totalProductCount ?? ''; //NBD2C-72
            this.setupCartTypeAccordingToCategory(this._cartSummaryData); //NBD2C-74
        } else if (error) {
            console.error(error); //NBD2C-74
            this.setupCartTypeAccordingToCategory(null); //NBD2C-74
        }
    }

    connectedCallback() {
        this._showLens = this.displayData.showLensDetails;
        this._productFeatures = this.displayData.features;
        this._productLensDetailsList = this.displayData.lensDetails;
        this._packagingValues = this.displayData.packagingValues;
        this.fetchPackagingImageURL();

        // DVM21-31 : Hide certain UI aspects from NBD2C Store when opened in VTO/POS mode : Start
        let shopContext = JSON.parse(sessionStorage.getItem(SHOPCONTEXT));
        if (shopContext && shopContext.comingFromVTOPOSUrl === true) {
            this._detailVisibility = VISIBILITY_HIDDEN;
        } else {
            this._detailVisibility = VISIBILITY_VISIBLE;
        }
        // DVM21-31 : Hide certain UI aspects from NBD2C Store when opened in VTO/POS mode : End
    }

    /**
     * NBD2C-49
     * This wire method makes the API Call : ProductPricingAdapter with the provided product id
     */
    @wire(ProductPricingAdapter, { productId: '$productId' })
    handlePricingData(output) {
        if (output.data != undefined && output.data != null) {
            this._pricingDetails = JSON.parse(JSON.stringify(output.data));
            this._suggestedRetailPrice = this._pricingDetails && this._pricingDetails.unitPrice ? this._pricingDetails.unitPrice : null;
            this._currencyISOCode = this._pricingDetails && this._pricingDetails.currencyIsoCode ? this._pricingDetails.currencyIsoCode : null;
        }

        if (this._suggestedRetailPrice !== undefined && this._suggestedRetailPrice !== null && this._suggestedRetailPrice !== '') {
            this._addtoCartDisabled = false;
        } else {
            this._addtoCartDisabled = true;
        }
    }

    /**
     * NBD2C-74
     * This method is used to setup the cart type according to category of product as well as existing cart items
     * Below mentioned are the possible scenarios:
     *      1. If Cart is Empty :
     *          a. On sunglass product page : Showing action button as 'Add to Cart'
     *          b. On optical eyewear product page : Showing action button as 'Try on at your optician'
     *      2. If Cart is already filled :
     *          a. Optical eyewear product is already present in cart :
     *              a. On sunglass product page : Showing action button as 'Try on at your optician' as optical eyewear can only be bought from store
     *              b. On optical eyewear product page : Showing action button as 'Try on at your optician'
     *          b. Sunglass product is already present in cart :
     *              a. On sunglass product page : Showing action button as 'Add to Cart'
     *              b. On optical eyewear product page : Showing action button as 'Try on at your optician' with a popup stating 'Attention: By adding a Click & Collect item, your entire order will be sent to the optician of your choice.'
     *
     */
    setupCartTypeAccordingToCategory(cartData) {
        //NBD2C-78 : Added a safety checks for reading the value of cart type
        if (cartData && cartData.customFields && cartData.customFields[0] && cartData.customFields[0].D2C_Order_Type__c) {
            if (cartData.customFields[0].D2C_Order_Type__c == ONLINE_PURCHASE) {
                this._showAddToCartButton = this.displayData?.showLensDetails ? true : false;
                this._showTryOnAtYourOptician = this.displayData?.showLensDetails == false ? true : false;
            } else if (cartData.customFields[0].D2C_Order_Type__c == CLICK_AND_COLLECT) {
                this._showAddToCartButton = false;
                this._showTryOnAtYourOptician = true;
            }
        } else {
            this._showAddToCartButton = this.displayData?.showLensDetails ? true : false;
            this._showTryOnAtYourOptician = this.displayData?.showLensDetails == false ? true : false;
        }
    }

    /**
     * NBD2C-73
     * This method is used to fetch the URL of packaging image related to the product
     */
    fetchPackagingImageURL() {
        getPackagingImageUrl({
            productId: this.productId
        })
            .then((result) => {
                if (result) {
                    this._packagingImageURL = result[0].imageURL;
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /**
     * NBD2C-49
     * This method is use to display the Size pop-up modal
     */
    handleSizeOpenModal() {
        this._showModal = true;
    }

    /**
     * NBD2C-49
     * This method is use to hide the Size pop-up modal
     */
    handleSizeCloseModal() {
        this._showModal = false;
    }

    /**
     * NBD2C-73
     * This method is use to display the packaging pop-up modal
     */
    handlePackagingModalOpen() {
        this._isPackagingModalOpen = true;
    }

    /**
     * NBD2C-73
     * This method is use to hide the packaging pop-up modal
     */
    handlePackagingModalClose() {
        this._isPackagingModalOpen = false;
    }

    /**
     * Handler method for add to cart button
     * NBD2C-75
     */
    async handleAddToCart() {
        if (this._totalProductCount >= 3) {
            this._showModalMaxItems = true;
        } else {
            //NBD2C-74 : Activating the popup of mix cart prevention if applicable
            if (
                this._cartSummaryData &&
                this.displayData &&
                this._cartSummaryData?.customFields[0]?.D2C_Order_Type__c == ONLINE_PURCHASE &&
                this.displayData?.showLensDetails == false
            ) {
                this._showInfoPopupForClickAndCollectOrder = true;
            } else {
                //NBD2C-74 : Deactivating the popup of mix cart prevention if applicable and proceding with add to cart operation
                this._showInfoPopupForClickAndCollectOrder = false;
                this.performAddToCart();
            }
        }
    }

    /**
     * NBD2C-74
     * This method is used to perform add to cart operation along with updating the cart type (Online Purchase / Click and Collect) according to type of product
     */
    performAddToCart() {
        this.handleLoader(true);
        dispatchAction(this, createCartItemAddAction(this.productId, CART_ITEM_QUANTITY_TO_BE_UPDATED), {
            onSuccess: async (result) => {
                let cartId = result?.cartId ?? null;
                let applicableOrderType =
                    cartId && this._showAddToCartButton == true ? ONLINE_PURCHASE : cartId && this._showTryOnAtYourOptician == true ? CLICK_AND_COLLECT : null;
                if (cartId && applicableOrderType) {
                    await updateCartRecord({ cartId: cartId, orderType: applicableOrderType });
                    fireEvent(this._pageRef, ADD_TO_CART_EVENT);
                }
                this.handleLoader(false);
                navigate(this.navContext, CART_PAGE);
            },
            onError: (error) => {
                console.error(error);
            }
        });
    }

    /**
     * Handler method to show or hide the loader
     * NBD2C-75
     */
    handleLoader(showLoader) {
        this.dispatchEvent(
            new CustomEvent(HANDLE_LOADER_EVENT, {
                bubbles: true,
                composed: true,
                detail: {
                    showLoader: showLoader
                }
            })
        );
    }

    /**
     * NBD2C-72
     * Handler to show or hide modal
     */
    handleModalCloseAction() {
        this._showModalMaxItems = false;
    }

    /**
     * NBD2C-74
     * This method is used to update the cart type and add items to the cart once the information popup is acknowledged and confirmed by the user on UI
     */
    handleUpdateMixCart() {
        this._showInfoPopupForClickAndCollectOrder = false;
        this.performAddToCart();
    }

    /**
     * NBD2C-74
     * This method is used to close the information popup once it is acknowledged and cancelled by the user on UI
     */
    handleCloseMixedCartPopup() {
        this._showInfoPopupForClickAndCollectOrder = false;
    }

    /**
     * NBD2C-71
     * This method is used to navigate the user to the fitting guide page
     */
    handleFittingGuideNavigation() {
        navigate(this.navContext, FITTING_GUIDE_PAGE);
    }
}
