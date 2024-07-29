import { LightningElement, api, track, wire } from 'lwc';
import { ProductSearchAdapter } from 'commerce/productApi';
import getProductMedia from '@salesforce/apex/D2C_UtilityController.getProductMedia';
import { NavigationMixin } from 'lightning/navigation';
import d2c_Resources from '@salesforce/resourceUrl/D2C_NB_StoreStyling';
import D2C_PRODUCT_CARD_LABELS from '@salesforce/label/c.D2C_Reusable_Product_Card_Labels';
import D2C_NB_PDP_LABELS from '@salesforce/label/c.D2C_NB_PDP_LABELS';

// NBD2C-29 : Constants used for functionality : Start
const VISIBLE_DISPLAY_STYLING = 'visibleDisplayStyling';
const HIDDEN_DISPLAY_STYLING = 'hiddenDisplayStyling';
const PRODUCT_CARD_VISIBLE_DISPLAY_STYLING = 'fade slds-show';
const PRODUCT_CARD_HIDDEN_DISPLAY_STYLING = 'fade slds-hide';
const INACTIVE_COLOR_BUBBLE_STYLING = 'dot';
const ACTIVE_COLOR_BUBBLE_STYLING = 'dot active moreActive';
const UPPER_COLOR_BUBBLE_STYLING = 'background-image: linear-gradient(to bottom, ';
const UPPER_COLOR_BUBBLE_PERCENTAGE_STYLING = ' 50%, ';
const LOWER_COLOR_BUBBLE_PERCENTAGE_STYLING = ' 50%)';
const STANDARD_RECORD_PAGE = 'standard__recordPage';
const PRODUCT_OBJECT_API_NAME = 'Product2';
const VIEW_TYPE_ACTION_FOR_NAVIGATION = 'view';
const NAVIGATION_TARGET_TYPE = '_self';
const MOBILE_DEVICE_DIMENSIONS = '(max-width: 767px)';
const TABLET_DEVICE_DIMENSIONS = '(min-width: 768px) and (max-width: 1024px)';
const RESIZE_EVENT = 'resize';
const MODEL_IMAGE = 'Model Image';
const D2C_VALUE = 'D2C';
const IMAGE_WITHOUT_SLIDING_EFFECT_STYLING = 'imageContainer';
const IMAGE_WITH_SLIDING_EFFECT_STYLING = 'imageContainer slide';
// NBD2C-29 : Constants used for functionality : End
export default class D2C_Dynamic_Product_Card extends NavigationMixin(LightningElement) {
    /**
     * NBD2C-29
     * This public variable holds the product SKUs entered by User from builder
     * @type {String}
     */
    @api
    productSKUs;

    /**
     * NBD2C-29
     * This collection variable holds the consolidated product details including all necessary data that needs to be shown on the UI
     * @type {Array}
     */
    @track
    _productDetailsCollection = {};

    /**
     * NBD2C-29
     * This collection variable holds the product information fetched from API Callout
     * @type {Array}
     */
    @track
    _productInformationCollection;

    /**
     * NBD2C-29
     * This boolean variable indicates whether the component is ready to be shown on UI
     * @type {Boolean}
     */
    _initialLoadComplete = false;

    /**
     * NBD2C-29
     * This variable hold the value of maximum decimal points that needs to be displayed
     * @type {Integer}
     */
    _maximumDisplaybleDecimals = 5;

    /**
     * NBD2C-29
     * This variable holds the source URL of virtual try on logo in black color
     * @type {String}
     */
    _virtualTryOnLogoBlack = d2c_Resources + '/icons/VirtualTryOnBlack.svg';

    /**
     * NBD2C-29
     * This variable holds the source URL of virtual try on logo in white color
     * @type {String}
     */
    _virtualTryOnLogoWhite = d2c_Resources + '/icons/VirtualTryOnWhite.svg';

    /**
     * NBD2C-29
     * This variable holds the styling class for product container card
     * @type {String}
     */
    _productImageContainerStyling = VISIBLE_DISPLAY_STYLING;

    /**
     * NBD2C-29
     * This variable holds the styling class for product model image container card
     * @type {String}
     */
    _productModelImageContainerStyling = HIDDEN_DISPLAY_STYLING;

    /**
     * NBD2C-29
     * This variable holds the default placeholder image of product that needs to be shown on UI
     * @type {String}
     */
    _productDefaultImage = d2c_Resources + '/icons/defaultProductIcon.png';

    /**
     * NBD2C-29
     * This variable controls the auto-scrolling/sliding of product cards on UI
     * @type {Boolean}
     */
    _autoScroll = true;

    /**
     * NBD2C-29
     * This variable controls the visibility of navigational buttons on UI
     * @type {Boolean}
     */
    _showNavigationButtons = false;

    /**
     * NBD2C-29
     * This variable controls the visibility of navigational bubbles on UI
     * @type {Boolean}
     */
    _hideNavigationDots = false;

    /**
     * NBD2C-29
     * This variable holds the value of auto-scroll/sliding duration
     * @type {Integer}
     */
    _scrollDuration = 2500;

    /**
     * NBD2C-29
     * This variable holds the index number of product card(Starting with 1)
     * @type {Integer}
     */
    _slideIndex = 1;

    /**
     * NBD2C-29
     * This variable holds the value of timing to invoke a function to handle auto-scrolling automatically
     * @type {Integer}
     */
    _timer;

    /**
     * NBD2C-29
     * This variable holds the value of currency code
     * @type {String}
     */
    _currencyISOCode = '';

    /**
     * NBD2C-29
     * This variable indicates whether the current device is desktop
     * @type {Boolean}
     */
    _isDesktopDevice = true;

    /**
     * NBD2C-29
     * This variable holds the value of source URL of model image
     * @type {Boolean}
     */
    _modelImageSourceURL;

    /**
     * NBD2C-29
     * This variable holds the value of source URL of model image
     * @type {String}
     */
    _applicableImageStyling;

    /**
     * NBD2C-29
     * This variable is used to toggle the loader
     * @type {Boolean}
     */
    _dataLoaded = false;

    /**
     * NBD2C-82
     * This variable is used hold the value of alternative-text on loader component
     * @type {String}
     */
    _loadingLabel = D2C_NB_PDP_LABELS.split(',')[24];

    /**
     * NBD2C-29
     * This getter method returns the request body that is needed for the API Callout
     * Have kept this request body hard-coded as the request parameters except 'searchTerm' should not be kept dynamic and configurable
     */
    get requestBody() {
        if (this.productSKUs) {
            return {
                searchTerm: this.productSKUs && this.productSKUs.replaceAll(';', ' '), // Replacing the product SKUs by empty spacing from semi-colon as in the callout, products SKUs should be space seperated
                fields: [
                    'Name',
                    'Description',
                    'StockKeepingUnit',
                    'B2B_Design_Family__c',
                    'B2B_Picture_Link__c',
                    'B2B_Hexcode__c',
                    'B2B_Hexcode_Accent__c',
                    'B2B_Collection_Flag__c'
                ],
                includePrices: true,
                page: 0,
                grouping: {
                    groupingOption: 'NoGrouping'
                },
                pageSize: 25
            };
        } else {
            this._dataLoaded = true;
            return null;
        }
    }

    /**
     * NBD2C-29
     * This getter method returns the labels to be shown on UI
     */
    get labels() {
        return {
            exploreMoreButtonLabel: D2C_PRODUCT_CARD_LABELS.split(',')[0]
        };
    }

    connectedCallback() {
        this.detectDeviceType(); // Detecting device type on load of the component in order to set the component mode
        window.addEventListener(RESIZE_EVENT, this.detectDeviceType);
        // Setting up _timer to invoke auto-sliding method with interval
        if (this._autoScroll) {
            this._timer = window.setInterval(() => {
                this.handleSlideSelection(this._slideIndex + 1);
            }, Number(this._scrollDuration));
            this.showCards = true;
        }
    }

    disconnectedCallback() {
        if (this._autoScroll) {
            window.clearInterval(this._timer);
        }
    }

    /**
     * NBD2C-29
     * This method detects the device type and setup the component accordingly
     */
    detectDeviceType = () => {
        const isMobile = window.matchMedia(MOBILE_DEVICE_DIMENSIONS).matches;
        const isTablet = window.matchMedia(TABLET_DEVICE_DIMENSIONS).matches;
        this._isDesktopDevice = isMobile || isTablet ? false : true;
    };

    /**
     * NBD2C-29
     * This wire method makes the API Call : ProductSearchAdapter with the provided request body
     */
    @wire(ProductSearchAdapter, {
        searchQuery: '$requestBody'
    })

    /**
     * NBD2C-29
     * This method processes the response received from the callout
     */
    handleProductSearch(output) {
        if (output && output.data && output.data.productsPage && output.data.productsPage.products) {
            this._productInformationCollection = JSON.parse(JSON.stringify(output.data.productsPage.products));
            this._currencyISOCode =
                output && output.data && output.data.productsPage && output.data.productsPage.currencyIsoCode ? output.data.productsPage.currencyIsoCode : '';
            this.handleProductsProcessing();
        }
    }

    /**
     * NBD2C-29
     * This method processes the product data and extracts the product Ids
     */
    handleProductsProcessing() {
        if (this._productInformationCollection) {
            let productIdsCollection = [];
            this._productInformationCollection.forEach((productRecord) => {
                if (productRecord && productRecord.id) {
                    productIdsCollection.push(productRecord.id);
                }
            });
            if (productIdsCollection && productIdsCollection.length && productIdsCollection.length > 0) {
                this.fetchProductMedia(productIdsCollection);
            } else {
                this._dataLoaded = true;
            }
        } else {
            this._dataLoaded = true;
        }
    }

    /**
     * NBD2C-29
     * This method fetches the product media images from server for the provided provided product Ids
     */
    fetchProductMedia(productIdsCollection) {
        getProductMedia({
            productIdsList: productIdsCollection,
            productImageType: MODEL_IMAGE,
            availableIn: D2C_VALUE,
            activeValue: true
        })
            .then((result) => {
                if (result) {
                    let productMediaCollection = JSON.parse(JSON.stringify(result));
                    const productIdVSProductMediaCollection = new Map(Object.entries(productMediaCollection)); // storing the response received from server into map.
                    this.performPostProcessing(productIdVSProductMediaCollection);
                } else {
                    this.performPostProcessing(null);
                    this._dataLoaded = true;
                }
            })
            .catch((error) => {
                console.error(error);
                this.performPostProcessing(null);
                this._dataLoaded = true;
            });
    }

    performPostProcessing(productIdVSProductMediaCollection) {
        this._productDetailsCollection = {};
        this._productDetailsCollection.products = [];
        // Iterating over the product information and constructing a collection that holds the consolidated information of products
        for (let index = 0; index < this._productInformationCollection.length; index++) {
            if (
                (this._productInformationCollection[index] &&
                    this._productInformationCollection[index].fields &&
                    this._productInformationCollection[index].fields.B2B_Hexcode__c &&
                    this._productInformationCollection[index].fields.B2B_Hexcode__c.value) ||
                (this._productInformationCollection[index].fields &&
                    this._productInformationCollection[index].fields.B2B_Hexcode_Accent__c &&
                    this._productInformationCollection[index].fields.B2B_Hexcode_Accent__c.value)
            ) {
                let product = {};
                product.index = index + 1;
                product.id =
                    this._productInformationCollection[index] && this._productInformationCollection[index].id
                        ? this._productInformationCollection[index].id
                        : null;
                product.title =
                    this._productInformationCollection[index] &&
                    this._productInformationCollection[index].fields &&
                    this._productInformationCollection[index].fields.Name &&
                    this._productInformationCollection[index].fields.Name.value
                        ? this._productInformationCollection[index].fields.Name.value
                        : null;
                product.subtitle =
                    this._productInformationCollection[index] &&
                    this._productInformationCollection[index].fields &&
                    this._productInformationCollection[index].fields.B2B_Collection_Flag__c &&
                    this._productInformationCollection[index].fields.B2B_Collection_Flag__c.value
                        ? this._productInformationCollection[index].fields.B2B_Collection_Flag__c.value
                        : null;
                product.image =
                    this._productInformationCollection[index] &&
                    this._productInformationCollection[index].fields &&
                    this._productInformationCollection[index].fields.B2B_Picture_Link__c &&
                    this._productInformationCollection[index].fields.B2B_Picture_Link__c.value
                        ? this._productInformationCollection[index] &&
                          this._productInformationCollection[index].fields &&
                          this._productInformationCollection[index].fields.B2B_Picture_Link__c &&
                          this._productInformationCollection[index].fields.B2B_Picture_Link__c.value
                        : this._productDefaultImage
                        ? this._productDefaultImage
                        : null; // If product image is absent then using a default image placeholder as thumbnail
                product.hexCode =
                    this._productInformationCollection[index] &&
                    this._productInformationCollection[index].fields &&
                    this._productInformationCollection[index].fields.B2B_Hexcode__c &&
                    this._productInformationCollection[index].fields.B2B_Hexcode__c.value
                        ? this._productInformationCollection[index].fields.B2B_Hexcode__c.value
                        : null;
                product.hexAccentCode =
                    this._productInformationCollection[index].fields &&
                    this._productInformationCollection[index].fields.B2B_Hexcode_Accent__c &&
                    this._productInformationCollection[index].fields.B2B_Hexcode_Accent__c.value
                        ? this._productInformationCollection[index].fields.B2B_Hexcode_Accent__c.value
                        : null;
                product.colorBubble =
                    UPPER_COLOR_BUBBLE_STYLING +
                    (product.hexCode ? product.hexCode : product.hexAccentCode ? product.hexAccentCode : null) +
                    UPPER_COLOR_BUBBLE_PERCENTAGE_STYLING +
                    (product.hexAccentCode ? product.hexAccentCode : product.hexCode ? product.hexCode : null) +
                    LOWER_COLOR_BUBBLE_PERCENTAGE_STYLING; // Constructing a color bubble with Hex and Hex Accent code. If either of one is present then using it fully otherwise keeping it empty and showing nothing on UI
                product.applicablePrice =
                    this._productInformationCollection[index] &&
                    this._productInformationCollection[index].prices &&
                    this._productInformationCollection[index].prices.listPrice
                        ? this._productInformationCollection[index] &&
                          this._productInformationCollection[index].prices &&
                          this._productInformationCollection[index].prices.listPrice
                        : this._productInformationCollection[index] &&
                          this._productInformationCollection[index].prices &&
                          this._productInformationCollection[index].prices.unitPrice
                        ? this._productInformationCollection[index] &&
                          this._productInformationCollection[index].prices &&
                          this._productInformationCollection[index].prices.unitPrice
                        : null;
                product.modelImageCollection =
                    productIdVSProductMediaCollection &&
                    this._productInformationCollection[index].id &&
                    productIdVSProductMediaCollection.get(this._productInformationCollection[index]) &&
                    productIdVSProductMediaCollection.get(this._productInformationCollection[index].id)
                        ? productIdVSProductMediaCollection.get(this._productInformationCollection[index].id)
                        : null;
                if (this._modelImageSourceURL == null || this._modelImageSourceURL == undefined || this._modelImageSourceURL == '') {
                    // As per the requirement, the model image should come from any of the variation product. Hence capturing the model image in 1st iteration
                    this._modelImageSourceURL =
                        productIdVSProductMediaCollection &&
                        productIdVSProductMediaCollection.get(this._productInformationCollection[index].id) &&
                        productIdVSProductMediaCollection.get(this._productInformationCollection[index].id)[0].B2B_Image_URL__c;
                }

                // For the first variation product, setting the styling in such a way that, 1st variation will be active and visible while others will be invisible and color bubbles will not be active
                if (index == 0) {
                    product.stylingClass = PRODUCT_CARD_VISIBLE_DISPLAY_STYLING;
                    product.colorBubbleClass = ACTIVE_COLOR_BUBBLE_STYLING;
                    product.showProduct = true;
                } else {
                    // For rest of the variation products, setting the styling in such a way that, they will be invisible and color bubbles will be in deactivate mode
                    product.stylingClass = PRODUCT_CARD_HIDDEN_DISPLAY_STYLING;
                    product.colorBubbleClass = INACTIVE_COLOR_BUBBLE_STYLING;
                    product.showProduct = false;
                }
                this._productDetailsCollection.products.push(product);
            }
        }

        // If the collection contains only one product then disabling auto scroll functionality and setting up the product styling in activated and visible mode
        if (
            this._productDetailsCollection &&
            this._productDetailsCollection.products &&
            this._productDetailsCollection.products.length &&
            this._productDetailsCollection.products.length == 1
        ) {
            this._autoScroll = false;
            this._productDetailsCollection.products.forEach((currentProduct) => {
                currentProduct.stylingClass = PRODUCT_CARD_VISIBLE_DISPLAY_STYLING;
                currentProduct.colorBubbleClass = ACTIVE_COLOR_BUBBLE_STYLING;
                currentProduct.showProduct = true;
            });
            this._applicableImageStyling = IMAGE_WITHOUT_SLIDING_EFFECT_STYLING;
        } else {
            this._autoScroll = true;
            this._applicableImageStyling = IMAGE_WITH_SLIDING_EFFECT_STYLING;
        }
        this._initialLoadComplete = true;
        this._dataLoaded = true;
    }

    /**
     * NBD2C-29
     * This method displays the product card accoridng to variation color bubble clicked by user on UI
     */
    showSlide(event) {
        if (event && event.target && event.target.dataset && event.target.dataset.id) {
            const slideIndex = Number(event.target.dataset.id);
            this.handleSlideSelection(slideIndex);
        }
    }

    /**
     * NBD2C-29
     * This method switches the slide/product card in forward direction/next card
     */
    slideForward() {
        if (this._slideIndex) {
            const slideIndex = this._slideIndex + 1;
            this.handleSlideSelection(slideIndex);
        }
    }

    /**
     * NBD2C-29
     * This method switches the slide/product card in backward direction/previous card
     */
    slideBackward() {
        if (this._slideIndex) {
            const slideIndex = this._slideIndex - 1;
            this.handleSlideSelection(slideIndex);
        }
    }

    /**
     * NBD2C-29
     * This method handles the hover-in effect on product card.
     * While in desktop view, model image gets visible on hover of the product card with the help of this method
     */
    handleMouseOver(event) {
        if (this._isDesktopDevice) {
            this._productImageContainerStyling = HIDDEN_DISPLAY_STYLING;
            this._productModelImageContainerStyling = VISIBLE_DISPLAY_STYLING;
            this._hideNavigationDots = true;
            this._autoScroll = false;
        }
    }

    /**
     * NBD2C-29
     * This method handles the hover-out effect on product card.
     * While in desktop view, model image gets deactivated and normal image gets visible on hover-out of the product card with the help of this method
     */
    handleMouseOut(event) {
        if (this._isDesktopDevice) {
            this._scrollDuration = 2500;
            this._autoScroll =
                this._productDetailsCollection &&
                this._productDetailsCollection.products &&
                this._productDetailsCollection.products.length &&
                this._productDetailsCollection.products.length == 1
                    ? false
                    : true;
            this._applicableImageStyling =
                this._productDetailsCollection &&
                this._productDetailsCollection.products &&
                this._productDetailsCollection.products.length &&
                this._productDetailsCollection.products.length == 1
                    ? IMAGE_WITHOUT_SLIDING_EFFECT_STYLING
                    : IMAGE_WITH_SLIDING_EFFECT_STYLING;
            this._productImageContainerStyling = VISIBLE_DISPLAY_STYLING;
            this._productModelImageContainerStyling = HIDDEN_DISPLAY_STYLING;
            this._hideNavigationDots = false;
        }
    }

    /**
     * NBD2C-29
     * This method handles the displaying the selected slide. Making the currently selected slide visible while deactivating other slides.
     * Also this method get's auto invoked accoridng to timer/scroll duration set and it switches the product card styling as active and deactive accordingly.
     */
    handleSlideSelection(index) {
        if (this._autoScroll == true) {
            if (
                index &&
                this._productDetailsCollection &&
                this._productDetailsCollection.products &&
                this._productDetailsCollection.products.length &&
                index > this._productDetailsCollection.products.length
            ) {
                this._slideIndex = 1;
            } else if (index < 1) {
                this._slideIndex = this._productDetailsCollection.products.length;
            } else {
                this._slideIndex = index;
            }

            if (this._productDetailsCollection.products !== undefined && this._productDetailsCollection.products !== null) {
                this._productDetailsCollection.products = this._productDetailsCollection.products.map((slide) => {
                    if (this._slideIndex === slide.index) {
                        return {
                            ...slide,
                            stylingClass: PRODUCT_CARD_VISIBLE_DISPLAY_STYLING,
                            showPrices: true,
                            colorBubbleClass: ACTIVE_COLOR_BUBBLE_STYLING,
                            showProduct: true
                        };
                    } else {
                        return {
                            ...slide,
                            stylingClass: PRODUCT_CARD_HIDDEN_DISPLAY_STYLING,
                            colorBubbleClass: INACTIVE_COLOR_BUBBLE_STYLING,
                            showPrices: false,
                            showProduct: false
                        };
                    }
                });
            }
        }
    }

    /**
     * NBD2C-29
     * This method captures the product Id selected product card by user on UI and navigating to PDP
     */
    handleExploreMore(event) {
        if (event && event.target && event.target.dataset && event.target.dataset.id) {
            let selectedProductId = event.target.dataset.id;
            this[NavigationMixin.GenerateUrl]({
                type: STANDARD_RECORD_PAGE,
                attributes: {
                    recordId: selectedProductId,
                    objectApiName: PRODUCT_OBJECT_API_NAME,
                    actionName: VIEW_TYPE_ACTION_FOR_NAVIGATION
                }
            }).then((url) => {
                window.open(url, NAVIGATION_TARGET_TYPE);
            });
        }
    }
}
