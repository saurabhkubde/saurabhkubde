import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import communityId from '@salesforce/community/Id';
import productSearch from '@salesforce/apex/B2B_SearchController.productSearch';
import getCartSummary from '@salesforce/apex/B2B_CartController.getCartSummary';
import addToCart from '@salesforce/apex/B2B_CartController.addToCart';
import getColorsMetadata from '@salesforce/apex/B2B_SearchController.getColorsMetadata';
import getFieldPicklistValues from '@salesforce/apex/B2B_SearchController.getFieldPicklistValues';
import getSortRules from '@salesforce/apex/B2B_SearchController.getSortRules';

import { transformData } from './dataNormalizer';

import COLOR_FILTER from '@salesforce/label/c.B2B_PLP_ColorFilter_Columns';
import FILTER_LABELS from '@salesforce/label/c.B2B_PLP_Filters';
import HEADLINE_LABELS from '@salesforce/label/c.B2B_PLP_Headline';
import HIDE_PRICES_FIELD from '@salesforce/schema/Account.B2B_Hide_Prices__c';

const fields = [HIDE_PRICES_FIELD];

/**
 * A search resutls component that shows results of a product search or
 * category browsing.This component handles data retrieval and management, as
 * well as projection for internal display components.
 * When deployed, it is available in the Builder under Custom Components as
 * 'B2B Custom Search Results'
 */
export default class SearchResults extends NavigationMixin(LightningElement) {
    /**
     * Gets the effective account - if any - of the user viewing the product.
     *
     * @type {string}
     */
    @api
    get effectiveAccountId() {
        return this._effectiveAccountId;
    }

    /**
     * BS-402
     * The pageSource used to determine current page details
     *
     * @type {string}
     */
    @api
    pageSource;

    /**
     * Sets the effective account - if any - of the user viewing the product
     * and fetches updated cart information
     */
    set effectiveAccountId(newId) {
        this._effectiveAccountId = newId;
        this.updateCartInformation();
    }

    /**
     *  Gets or sets the unique identifier of a category.
     *
     * @type {string}
     */
    @api
    get recordId() {
        return this._recordId;
    }
    set recordId(value) {
        this._recordId = value;
        this._landingRecordId = value;
        this.triggerProductSearch();
    }

    /**
     *  Gets or sets the search term.
     *
     * @type {string}
     */
    @api
    get term() {
        return this._term;
    }
    set term(value) {
        this._term = value;
        if (value) {
            this.triggerProductSearch();
        }
    }

    /**
     *  Gets or sets fields to show on a card.
     *
     * @type {string}
     */
    @api
    get cardContentMapping() {
        return this._cardContentMapping;
    }
    set cardContentMapping(value) {
        this._cardContentMapping = value;
    }

    /**
     *  Gets and sets options to be displayed in combobox.
     *
     * @type {string}
     */
    get sortingOptions() {
        return this._sortingOptions;
    }

    set sortingOptions(value) {
        this._sortingOptions = [];
        value.sortRules.forEach((element) => {
            this._sortingOptions.push({ label: element.label, value: element.sortRuleId }); //element.nameOrId + '-' + element.direction
        });
    }

    /**
     *  Gets or sets the layout of this component. Possible values are: grid, list.
     *
     * @type {string}
     */
    @api
    resultsLayout;

    /**
     *  Gets or sets whether the product image to be shown on the cards.
     *
     * @type {string}
     */
    @api
    showProductImage;

    @wire(getRecord, { recordId: '$effectiveAccountId', fields })
    account;

    _hidePricesFromTiles;

    get hidePrice() {
        this._hidePricesFromTiles = !!getFieldValue(this.account.data, HIDE_PRICES_FIELD);
        return getFieldValue(this.account.data, HIDE_PRICES_FIELD);
    }

    get hidePricesFromTiles() {
        return this._hidePricesFromTiles;
    }

    handleHidePriceSection() {
        this.template.querySelector('c-b2b_search-layout').hidePricesFromTiles = true;
    }

    handleShowPriceSection() {
        this.template.querySelector('c-b2b_search-layout').hidePricesFromTiles = false;
    }

    /**
     * Triggering the search query imperatively. We can do declarative way if
     *  '_isLoading` is not required. It would be something like this.
     *
     *  @wire(productSearch, {
     *      communityId: communityId,
     *      searchQuery: '$searchQuery',
     *      effectiveAccountId: '$resolvedEffectiveAccountId'
     *  })
     *  searchHandler(res) {
     *      if (res) {
     *          if (res.error) {
     *              this.error = res.error;
     *          } else if (res.data) {
     *              this.displayData = res.data;
     *          }
     *      }
     *  }
     *
     *  Note that setting the loading status while changing the parameter could
     *  work, but somtimes it gets into a weird cache state where no network
     *  call or callback (to your searchHandler where you can reset the load
     *  state) and you get into infinite UI spinning.
     *
     * @type {ConnectApi.ProductSummaryPage}
     * @private
     */
    triggerProductSearch() {
        const searchQuery = JSON.stringify({
            searchTerm: this.term,
            categoryId: this.recordId,
            refinements: this._refinements,
            // use fields for picking only specific fields
            // using ./dataNormalizer's normalizedCardContentMapping
            //fields: normalizedCardContentMapping(this._cardContentMapping),
            page: this._pageNumber - 1,
            includePrices: true,
            sortRuleId: this.sortingValue
        });

        this._isLoading = true;
        productSearch({
            communityId: communityId,
            searchQuery: searchQuery,
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
            .then((result) => {
                this.displayData = result;
                this.productFacets = result.facets;

                if (this._refinements.length == 0) {
                    this.triggerMetadataRetrieve();
                    this.triggerFrameFilterData();
                    this.triggerLensShapeData();
                    this.triggerFaceShapeData();
                    this.triggerFacetsData();
                } else {
                    let colorUpdate = false;
                    let frameUpdate = false;
                    let lensUpdate = false;
                    let faceUpdate = false;

                    this._refinements.forEach((element) => {
                        if (element.nameOrId == 'B2B_Frame_Color__c' || element.nameOrId == 'B2B_Lens_Color__c' || element.nameOrId == 'B2B_Mirror_Color__c') {
                            colorUpdate = true;
                        }
                        if (element.nameOrId == 'B2B_Frame_type__c') {
                            frameUpdate = true;
                        }
                        if (element.nameOrId == 'B2B_Lens_Shape__c') {
                            lensUpdate = true;
                        }
                        if (element.nameOrId == 'B2B_Face_Shape__c') {
                            faceUpdate = true;
                        }
                    });
                    if (colorUpdate) {
                        this.triggerColorFilterUpdate();
                    } else {
                        this.updateProductColor();
                    }
                    if (!frameUpdate) {
                        this.checkProductsFrame();
                    } else {
                        this.updateProductsFrame();
                    }
                    if (!lensUpdate) {
                        this.checkLensShape();
                    } else {
                        this.updateLensShape();
                    }
                    if (!faceUpdate) {
                        this.checkFaceShape();
                    } else {
                        this.updateFaceShape();
                    }
                    this.updateFacetsData();
                }

                this._isLoading = false;
            })
            .catch((error) => {
                this.error = error;
                this._isLoading = false;
                console.log('Error: ' + JSON.stringify(error));
            });
    }

    /**
     * Gets the sort rules based on community id.
     *
     * @private
     */
    triggerGetSortRules() {
        getSortRules({
            communityId: communityId
        })
            .then((result) => {
                this.sortingOptions = result;
                this.sortingValue = this.sortingOptions[0].value;
                this.triggerProductSearch();
            })
            .catch((error) => {
                this.error = error;
                console.log('Error: ' + JSON.stringify(error));
            });
    }

    /**
     * Gets the colors used into the color filter from the custom metadata records.
     *
     * @private
     */

    triggerMetadataRetrieve() {
        getColorsMetadata({})
            .then((result) => {
                this.customMetadataColors = new Map(Object.entries(JSON.parse(result)));
                this.updateProductColor();
            })
            .catch((error) => {
                this.error = error;
                console.log('Error: ' + JSON.stringify(error));
            });
    }

    /**
     * Updates the custom metadata results for use by the display component.
     *
     * @private
     */

    updateProductColor() {
        let colorsMap = [
            { Name: this.label.split(',')[0], apiName: 'B2B_Frame_Color__c', colorsList: [], filterClicked: false, displayColor: false },
            { Name: this.label.split(',')[1], apiName: 'B2B_Lens_Color__c', colorsList: [], filterClicked: false, displayColor: false },
            { Name: this.label.split(',')[2], apiName: 'B2B_Mirror_Color__c', colorsList: [], filterClicked: false, displayColor: false }
        ];

        for (let element of this.customMetadataColors.values()) {
            let backgroundStyle = 'display: none';
            colorsMap.forEach((color) => {
                color.colorsList.push({
                    colorName: element.Label,
                    colorHex: element.B2B_Color_code__c,
                    colorStyle: backgroundStyle,
                    transparent: element.B2B_Color_name__c == 'transparent' ? true : false,
                    colorClicked: false
                });
            });
        }
        let colorExists = false;

        this.productFacets.forEach((element) => {
            if (element.nameOrId == 'B2B_Frame_Color__c') {
                colorExists = true;
                colorsMap[0].displayColor = true;
                element.values.forEach((facet) => {
                    colorsMap[0].colorsList.forEach((color) => {
                        if (color.colorName == facet.displayName) {
                            if (color.transparent) {
                                color.colorStyle = 'background: url(' + this.transparentUri + ')';
                            } else {
                                color.colorStyle = 'background: ' + color.colorHex;
                            }
                        }
                    });
                });
            }

            if (element.nameOrId == 'B2B_Lens_Color__c') {
                colorExists = true;
                colorsMap[1].displayColor = true;
                element.values.forEach((facet) => {
                    colorsMap[1].colorsList.forEach((color) => {
                        if (color.colorName == facet.displayName) {
                            if (color.transparent) {
                                color.colorStyle = 'background: url(' + this.transparentUri + ')';
                            } else {
                                color.colorStyle = 'background: ' + color.colorHex;
                            }
                        }
                    });
                });
            }

            if (element.nameOrId == 'B2B_Mirror_Color__c') {
                colorExists = true;
                colorsMap[2].displayColor = true;
                element.values.forEach((facet) => {
                    colorsMap[2].colorsList.forEach((color) => {
                        if (color.colorName == facet.displayName) {
                            if (color.transparent) {
                                color.colorStyle = 'background: url(' + this.transparentUri + ')';
                            } else {
                                color.colorStyle = 'background: ' + color.colorHex;
                            }
                        }
                    });
                });
            }
        });

        if (colorExists) {
            this.productColorsMap = colorsMap;
        } else {
            this.productColorsMap = false;
        }

        this.template.querySelector('c-b2b_search-color').displayData = this.productColorsMap;
    }

    /**
     * Updates the colors filter map in order to highlight the available colors.
     *
     * @private
     */

    triggerColorFilterUpdate() {
        let mapFilterColor = [
            { apiName: 'B2B_Frame_Color__c', colorsList: [], displayColor: false },
            { apiName: 'B2B_Lens_Color__c', colorsList: [], displayColor: false },
            { apiName: 'B2B_Mirror_Color__c', colorsList: [], displayColor: false }
        ];

        this.productFacets.forEach((element) => {
            mapFilterColor.forEach((color) => {
                if (element.nameOrId == color.apiName) {
                    color.displayColor = true;
                    element.values.forEach((facetValue) => {
                        color.colorsList.push(facetValue.displayName);
                    });
                }
            });
        });

        mapFilterColor.forEach((filter) => {
            this.productColorsMap.forEach((element) => {
                if (element.apiName == filter.apiName) {
                    element.displayColor = filter.displayColor;
                    element.colorsList.forEach((color) => {
                        if (!filter.colorsList.includes(color.colorName)) {
                            color.colorStyle = 'display: none';
                        } else {
                            if (!color.colorClicked) {
                                if (color.transparent) {
                                    color.colorStyle = 'background: url(' + this.transparentUri + ')';
                                } else {
                                    color.colorStyle = 'background: ' + color.colorHex;
                                }
                            }
                        }
                    });
                }
            });
        });

        this.template.querySelector('c-b2b_search-color').displayData = this.productColorsMap;
    }

    /**
     * Gets the frame type picklist values for use into the display component.
     *
     * @private
     */

    triggerFrameFilterData() {
        getFieldPicklistValues({ picklistField: 'B2B_Frame_type__c' })
            .then((result) => {
                this.picklistMap = result;
                this.checkProductsFrame();
            })
            .catch((error) => {
                this.error = error;
                console.log('Error: ' + JSON.stringify(error));
            });
    }

    /**
     * Creates the frame type map which will be used to display the picklist values.
     *
     * @private
     */

    checkProductsFrame() {
        let frameValues = this.picklistMap.picklistValues;
        let fieldName = this.picklistMap.fieldName;

        this.rimTypeFilter = { fieldName: fieldName, frameData: [] };
        frameValues.forEach((element) => {
            let frameIcon = element.apiName.toLowerCase().replace(' ', '').replace('(', '-').replace(')', '');
            this.rimTypeFilter.frameData.push({
                frameName: element.picklistValue,
                frameIcon: 'filter-sbRimType-' + frameIcon,
                frameChecked: false,
                frameStyle: 'display: none',
                displayFrame: false
            });
        });

        let frameExists = false;

        this.productFacets.forEach((element) => {
            if (element.nameOrId == 'B2B_Frame_type__c') {
                element.values.forEach((facet) => {
                    this.rimTypeFilter.frameData.forEach((frame) => {
                        if (facet.displayName == frame.frameName) {
                            frame.frameStyle = 'cursor: pointer';
                            frame.displayFrame = true;
                            frameExists = true;
                        }
                    });
                });
            }
        });

        if (!frameExists) {
            this.rimTypeFilter = false;
        }
        this.template.querySelector('c-b2b_search-frame-type').displayData = this.rimTypeFilter;
    }

    /**
     * Updates the frame type map to grey out the unavailable values.
     *
     * @private
     */

    updateProductsFrame() {
        this.rimTypeFilter.frameData.forEach((element) => {
            if (!element.frameChecked) {
                element.frameStyle = 'display: none';
                element.displayFrame = false;
            }
        });
        this.template.querySelector('c-b2b_search-frame-type').displayData = this.rimTypeFilter;
    }

    /**
     * Gets the lens shape picklist values for use into the display component.
     *
     * @private
     */

    triggerLensShapeData() {
        getFieldPicklistValues({ picklistField: 'B2B_Lens_Shape__c' })
            .then((result) => {
                this.shapeLensMap = result;
                this.checkLensShape();
            })
            .catch((error) => {
                this.error = error;
                console.log('Error: ' + JSON.stringify(error));
            });
    }

    /**
     * Creates the lens shape map which will be used to display the picklist values.
     *
     * @private
     */

    checkLensShape() {
        let lensValues = this.shapeLensMap.picklistValues;
        let fieldName = this.shapeLensMap.fieldName;
        this.lensShapeFilter = {};

        this.lensShapeFilter = { fieldName: fieldName, lensData: [] };
        lensValues.forEach((element) => {
            let shapeIcon = element.apiName.toLowerCase();
            this.lensShapeFilter.lensData.push({
                shapeName: element.picklistValue,
                shapeIcon: 'filter-shape-' + shapeIcon,
                shapeChecked: false,
                shapeStyle: 'display: none',
                displayShape: false
            });
        });

        let shapeExists = false;

        this.productFacets.forEach((element) => {
            if (element.nameOrId == 'B2B_Lens_Shape__c') {
                element.values.forEach((facet) => {
                    this.lensShapeFilter.lensData.forEach((lens) => {
                        if (facet.displayName == lens.shapeName) {
                            lens.shapeStyle = 'cursor: pointer';
                            lens.displayShape = true;
                            shapeExists = true;
                        }
                    });
                });
            }
        });

        if (!shapeExists) {
            this.lensShapeFilter = false;
        }
        this.template.querySelector('c-b2b_search-lens-shape').displayData = this.lensShapeFilter;
    }

    /**
     * Updates the lens shape map to grey out the unavailable values.
     *
     * @private
     */

    updateLensShape() {
        this.lensShapeFilter.lensData.forEach((element) => {
            if (!element.shapeChecked) {
                element.shapeStyle = 'display: none';
                element.displayShape = false;
            }
        });
        this.template.querySelector('c-b2b_search-lens-shape').displayData = this.lensShapeFilter;
    }

    /**
     * Gets the face shape picklist values for use into the display component.
     *
     * @private
     */

    triggerFaceShapeData() {
        getFieldPicklistValues({ picklistField: 'B2B_Face_Shape__c' })
            .then((result) => {
                this.faceShapeMap = result;
                this.checkFaceShape();
            })
            .catch((error) => {
                this.error = error;
                console.log('Error: ' + JSON.stringify(error));
            });
    }

    /**
     * Creates the face shape map which will be used to display the picklist values.
     *
     * @private
     */

    checkFaceShape() {
        let faceValues = this.faceShapeMap.picklistValues;
        let fieldName = this.faceShapeMap.fieldName;
        this.faceShapeFilter = {};

        this.faceShapeFilter = { fieldName: fieldName, faceShapeData: [] };
        faceValues.forEach((element) => {
            this.faceShapeFilter.faceShapeData.push({
                shapeName: element.picklistValue,
                shapeIcon: 'filter-faceType-' + element.apiName.toLowerCase(),
                shapeChecked: false,
                shapeStyle: 'display: none',
                displayShape: false
            });
        });
        let shapeExists = false;

        this.productFacets.forEach((element) => {
            if (element.nameOrId == 'B2B_Face_Shape__c') {
                element.values.forEach((facet) => {
                    this.faceShapeFilter.faceShapeData.forEach((face) => {
                        if (facet.displayName == face.shapeName) {
                            face.shapeStyle = 'cursor: pointer';
                            face.displayShape = true;
                            shapeExists = true;
                        }
                    });
                });
            }
        });

        if (!shapeExists) {
            this.faceShapeFilter = false;
        }
        this.template.querySelector('c-b2b_search-face-shape').displayData = this.faceShapeFilter;
    }

    /**
     * Updates the face shape map to grey out the unavailable values.
     *
     * @private
     */

    updateFaceShape() {
        this.faceShapeFilter.faceShapeData.forEach((element) => {
            if (!element.shapeChecked) {
                element.shapeStyle = 'display: none';
                element.displayShape = false;
            }
        });
        this.template.querySelector('c-b2b_search-face-shape').displayData = this.faceShapeFilter;
    }

    triggerFacetsData() {
        if (this.displayData.facetsData) {
            this.facets = this.displayData.facetsData;
            for (let index = 0; index < this.facets.length; index++) {
                if (
                    this.facets[index].nameOrId == 'B2B_Frame_Color__c' ||
                    this.facets[index].nameOrId == 'B2B_Lens_Color__c' ||
                    this.facets[index].nameOrId == 'B2B_Mirror_Color__c' ||
                    this.facets[index].nameOrId == 'B2B_Frame_type__c' ||
                    this.facets[index].nameOrId == 'B2B_Lens_Shape__c' ||
                    this.facets[index].nameOrId == 'B2B_Face_Shape__c'
                ) {
                    this.facets.splice(index, 1);
                    index--;
                }
            }
            this.displayData.facetsData = this.facets;
        }
    }

    updateFacetsData() {
        this.facets.forEach((facet) => {
            this.displayData.facetsData.forEach((data) => {
                if (facet.nameOrId == data.nameOrId) {
                    facet.values.forEach((facetValue) => {
                        data.values.forEach((dataValue) => {
                            if (facetValue.nameOrId == dataValue.nameOrId) {
                                dataValue.checked = facetValue.checked;
                            }
                        });
                    });
                }
            });
        });
        this.triggerFacetsData();
    }

    /**
     * Gets the normalized component configuration that can be passed down to
     *  the inner components.
     *
     * @type {object}
     * @readonly
     * @private
     */
    get config() {
        return {
            layoutConfig: {
                resultsLayout: this.resultsLayout,
                cardConfig: {
                    showImage: this.showProductImage,
                    resultsLayout: this.resultsLayout,
                    actionDisabled: this.isCartLocked
                }
            }
        };
    }

    /**
     * Gets or sets the normalized, displayable results for use by the display components.
     *
     * @private
     */
    get displayData() {
        return this._displayData || {};
    }
    set displayData(data) {
        this._displayData = transformData(data, this._cardContentMapping);
    }

    /**
     * Gets or sets the custom metadata results for use by the display components.
     *
     * @private
     */
    get customMetadataColors() {
        return this._customMetadataColors || {};
    }
    set customMetadataColors(data) {
        this._customMetadataColors = data;
    }

    /**
     * Gets or sets the custom metadata results for use by the display components.
     *
     * @private
     */
    get productFacets() {
        return this._productFacets || {};
    }
    set productFacets(data) {
        this._productFacets = data;
    }

    /**
     * Gets whether product search is executing and waiting for result.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get isLoading() {
        return this._isLoading;
    }

    /**
     * Gets whether results has more than 1 page.
     *
     * @type {Boolean}
     * @readonly
     * @private
     */
    get hasMorePages() {
        return this.displayData.total > this.displayData.pageSize;
    }

    /**
     * Gets the current page number.
     *
     * @type {Number}
     * @readonly
     * @private
     */
    get pageNumber() {
        return this._pageNumber;
    }

    /**
     * Gets the header text which shows the search results details.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get headerText() {
        let ofLabel = HEADLINE_LABELS.split(',')[0];
        let itemsLabel = HEADLINE_LABELS.split(',')[1];
        let oneResultLabel = HEADLINE_LABELS.split(',')[2];
        let text = '';
        const totalItemCount = this.displayData.total;
        const pageSize = this.displayData.pageSize;

        if (totalItemCount > 1) {
            const startIndex = (this._pageNumber - 1) * pageSize + 1;

            const endIndex = Math.min(startIndex + pageSize - 1, totalItemCount);

            text = text + startIndex + ' - ' + endIndex + ' ' + ofLabel + ' ' + totalItemCount + ' ' + itemsLabel;
        } else if (totalItemCount === 1) {
            text = oneResultLabel;
        }

        return text;
    }

    /**
     * Gets the normalized effective account of the user.
     *
     * @type {string}
     * @readonly
     * @private
     */
    get resolvedEffectiveAccountId() {
        const effectiveAcocuntId = this.effectiveAccountId || '';
        let resolved = null;

        if (effectiveAcocuntId.length > 0 && effectiveAcocuntId !== '000000000000000') {
            resolved = effectiveAcocuntId;
        }
        return resolved;
    }

    /**
     * Gets whether the cart is currently locked
     *
     * Returns true if the cart status is set to either processing or checkout (the two locked states)
     *
     * @readonly
     */
    get isCartLocked() {
        const cartStatus = (this._cartSummary || {}).status;
        return cartStatus === 'Processing' || cartStatus === 'Checkout';
    }

    /**
     * The connectedCallback() lifecycle hook fires when a component is inserted into the DOM.
     */
    connectedCallback() {
        //this.updateCartInformation();
        this.transparentUri = this.uri1 + this.uri2;
        this.triggerGetSortRules();
    }

    /**
     * Handles a user request to add the product to their active cart.
     *
     * @private
     */
    handleAction(evt) {
        evt.stopPropagation();
        this._isLoading = true;
        addToCart({
            communityId: communityId,
            productId: evt.detail.productId,
            quantity: evt.detail.quantity,
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
            .then((result) => {
                this.dispatchEvent(
                    new CustomEvent('cartchanged', {
                        bubbles: true,
                        composed: true
                    })
                );
                const addToCartModal = this.template.querySelector('c-b2b_add-to-cart-modal');
                addToCartModal.cartid = result.cartId;
                addToCartModal.show();
                this._isLoading = false;
            })
            .catch(() => {
                const addToCartModal = this.template.querySelector('c-b2b_add-to-cart-modal');
                addToCartModal.error = error;
                addToCartModal.show();
                this._isLoading = false;
            });
    }

    /**
     * Handles a user request to clear all the filters.
     *
     * @private
     */
    handleClearAll(evt) {
        evt.preventDefault();
        this._refinements = [];
        this._recordId = this._landingRecordId;
        this._pageNumber = 1;
        //this.template.querySelector('c-filter').clearAll();
        this.triggerProductSearch();
    }

    /**
     * Handles a user request to navigate to the product detail page.
     *
     * @private
     */
    handleShowDetail(evt) {
        evt.stopPropagation();

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: evt.detail.productId,
                actionName: 'view'
            }
        });
    }

    /**
     * Handles a user request to navigate to previous page results page.
     *
     * @private
     */
    handlePreviousPage(evt) {
        evt.stopPropagation();

        this._pageNumber = this._pageNumber - 1;
        this.triggerProductSearch();
        this.topFunction();
    }

    /**
     * Handles a user request to navigate to next page results page.
     *
     * @private
     */
    handleNextPage(evt) {
        evt.stopPropagation();

        this._pageNumber = this._pageNumber + 1;
        this.triggerProductSearch();
        this.topFunction();
    }

    topFunction() {
        const scrollOptions = {
            left: 0,
            top: 0,
            behavior: 'smooth'
        };
        window.scrollTo(scrollOptions);
    }

    /**
     * Handles a user request to filter the results from facet section.
     *
     * @private
     */
    handleFacetValueUpdate(evt) {
        evt.stopPropagation();
        if (this.facets) {
            this.facets.forEach((element) => {
                if (element.nameOrId == evt.detail.nameOrId) {
                    element.values.forEach((facet) => {
                        if (facet.displayName == evt.detail.value) {
                            if (facet.checked) {
                                facet.checked = false;
                            } else {
                                facet.checked = true;
                            }
                        } else {
                            facet.checked = false;
                        }
                    });
                }
            });
        }

        let refinementAdded = false;
        this._refinements.forEach((refinement, index, arr) => {
            if (refinement.nameOrId == evt.detail.nameOrId) {
                if (refinement.values[0] == evt.detail.value) {
                    arr.splice(index, 1);
                } else {
                    refinement.values = [evt.detail.value];
                }
                refinementAdded = true;
            }
        });
        if (!refinementAdded) {
            this._refinements.push({
                attributeType: 'Custom',
                nameOrId: evt.detail.nameOrId,
                values: [evt.detail.value],
                type: 'DistinctValue'
            });
        }

        this._pageNumber = 1;
        this.triggerProductSearch();
    }

    /**
     * Handles a user request to show a selected category from facet section.
     *
     * @private
     */
    handleCategoryUpdate(evt) {
        evt.stopPropagation();

        this._recordId = evt.detail.categoryId;
        this._pageNumber = 1;
        this.triggerProductSearch();
    }

    /**
     * Handles a user request to show a selected color from filter section.
     *
     * @private
     */
    handleColorUpdate(evt) {
        this.productColorsMap.forEach((element) => {
            if (evt.detail.colorType == element.apiName) {
                element.filterClicked = !element.filterClicked;
                if (element.filterClicked) {
                    element.colorsList.forEach((color) => {
                        if (color.colorName == evt.detail.colorCode) {
                            let uri =
                                "data:image/svg+xml;charset=utf-8,%3Csvg width='9' height='7' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.438 6.743L.248 4.492A.894.894 0 01.25 3.254a.838.838 0 011.201.002L3.04 4.887 7.55.253a.838.838 0 011.2.002.893.893 0 010 1.238l-5.108 5.25A.84.84 0 013.04 7a.844.844 0 01-.602-.257z'/%3E%3C/svg%3E";
                            if (color.transparent) {
                                color.colorStyle += ', url("' + uri + '"); border-color: #494949';
                            } else {
                                color.colorStyle += ' url("' + uri + '"); border-color: #494949';
                            }
                            color.colorClicked = true;
                        }
                    });
                    this._refinements.push({
                        attributeType: 'Custom',
                        nameOrId: evt.detail.colorType,
                        values: [evt.detail.colorCode],
                        type: 'DistinctValue'
                    });
                } else {
                    element.colorsList.forEach((color) => {
                        if (color.colorName == evt.detail.colorCode) {
                            if (color.transparent) {
                                color.colorStyle = 'background: url(' + this.transparentUri + ')';
                            } else {
                                color.colorStyle = 'background: ' + color.colorHex;
                            }
                            color.colorClicked = false;
                        }
                    });
                    this._refinements.forEach((refinement, index, arr) => {
                        if (refinement.nameOrId == element.apiName) {
                            arr.splice(index, 1);
                        }
                    });
                }
            }
        });
        this.triggerProductSearch();
    }

    /**
     * Handles a user request to select a specific frame from filter section.
     *
     * @private
     */
    handleFrameUpdate(evt) {
        this.rimTypeFilter.frameData.forEach((element) => {
            if (element.frameName == evt.detail) {
                if (element.frameChecked) {
                    element.frameChecked = false;
                } else {
                    element.frameChecked = true;
                }
            } else {
                element.frameChecked = false;
            }
        });

        let refinementAdded = false;
        this._refinements.forEach((refinement, index, arr) => {
            if (refinement.nameOrId == 'B2B_Frame_type__c') {
                if (refinement.values[0] == evt.detail) {
                    arr.splice(index, 1);
                } else {
                    refinement.values = [evt.detail];
                }
                refinementAdded = true;
            }
        });
        if (!refinementAdded) {
            this._refinements.push({
                attributeType: 'Custom',
                nameOrId: 'B2B_Frame_type__c',
                values: [evt.detail],
                type: 'DistinctValue'
            });
        }
        this.triggerProductSearch();
    }

    /**
     * Handles a user request to select a specific lens shape from filter section.
     *
     * @private
     */
    handleShapeUpdate(evt) {
        this.lensShapeFilter.lensData.forEach((element) => {
            if (element.shapeName == evt.detail) {
                if (element.shapeChecked) {
                    element.shapeChecked = false;
                } else {
                    element.shapeChecked = true;
                }
            } else {
                element.shapeChecked = false;
            }
        });

        let refinementAdded = false;
        this._refinements.forEach((refinement, index, arr) => {
            if (refinement.nameOrId == 'B2B_Lens_Shape__c') {
                if (refinement.values[0] == evt.detail) {
                    arr.splice(index, 1);
                } else {
                    refinement.values = [evt.detail];
                }
                refinementAdded = true;
            }
        });
        if (!refinementAdded) {
            this._refinements.push({
                attributeType: 'Custom',
                nameOrId: 'B2B_Lens_Shape__c',
                values: [evt.detail],
                type: 'DistinctValue'
            });
        }
        this.triggerProductSearch();
    }

    /**
     * Handles a user request to select a specific face shape from filter section.
     *
     * @private
     */
    handleFaceShapeUpdate(evt) {
        this.faceShapeFilter.faceShapeData.forEach((element) => {
            if (element.shapeName == evt.detail) {
                if (element.shapeChecked) {
                    element.shapeChecked = false;
                } else {
                    element.shapeChecked = true;
                }
            } else {
                element.shapeChecked = false;
            }
        });

        let refinementAdded = false;
        this._refinements.forEach((refinement, index, arr) => {
            if (refinement.nameOrId == 'B2B_Face_Shape__c') {
                if (refinement.values[0] == evt.detail) {
                    arr.splice(index, 1);
                } else {
                    refinement.values = [evt.detail];
                }
                refinementAdded = true;
            }
        });
        if (!refinementAdded) {
            this._refinements.push({
                attributeType: 'Custom',
                nameOrId: 'B2B_Face_Shape__c',
                values: [evt.detail],
                type: 'DistinctValue'
            });
        }
        this.triggerProductSearch();
    }

    /**
     * Handles a user request to select a specific sorting option.
     *
     * @private
     */
    handleSortingUpdate(event) {
        this.sortingValue = event.detail.value;
        this.triggerProductSearch();
    }

    /**
     * Ensures cart information is up to date
     */
    updateCartInformation() {
        getCartSummary({
            communityId: communityId,
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
            .then((result) => {
                this._cartSummary = result;
            })
            .catch((e) => {
                // Handle cart summary error properly
                // For this sample, we can just log the error
                console.log(e);
            });
    }

    _displayData;
    _productFacets;
    _isLoading = false;
    _pageNumber = 1;
    _refinements = [];
    _term;
    _recordId;
    _landingRecordId;
    _cardContentMapping;
    _effectiveAccountId;
    _customMetadataColors;
    /**
     * The cart summary information
     * @type {ConnectApi.CartSummary}
     */
    _cartSummary;
    colorClicked = false;

    @api productColorsMap = [];
    label = COLOR_FILTER;
    filterLabel = FILTER_LABELS.split(',')[0];
    clearAllLabel = FILTER_LABELS.split(',')[1];
    sortByLabel = FILTER_LABELS.split(',')[2];

    // Color filter transparent image
    uri1 =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxwYXR0ZXJuIGlkPSJiIiBwYXR0ZXJuVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB4PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+PHVzZSB4bGluazpocmVmPSIjYSIgdHJhbnNmb3JtPSJzY2FsZSguNSkiLz48L3BhdHRlcm4+PGltYWdlIGlkPSJhIiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhsaW5rOmhyZWY9ImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0NBWUFBQUJYQXZtSEFBQUVHV2xEUTFCclEwZERiMnh2Y2xOd1lXTmxSMlZ1WlhKcFkxSkhRZ0FBT0kyTlZWMW9IRlVVUHJ0elp5TWt6bE5zTklWMHFEOE5KUTJUVmpTaHRMcC8zZDAyYnBaSk50b2k2R1QyN3M2WXljNDRNN3Y5b1U5RlVId3g2cHNVeEwrM2dDQW85US9iUHJRdmxRb2wydFFnS0Q2MCtJTlE2SXVtNjVrN001bHB1ckhlWmU1ODg1M3ZubnZ1dVdmdkJlaTVxbGlXa1JRQkZwcXVMUmN5NG5PSGo0ZzlLNUNFaDZBWEJxRlhVUjByWGFsTUFqWlBDM2UxVzk5RHdudGYyZFhkL3ArdHQwWWRGU0J4SDJLejVxZ0xpSThCOEtkVnkzWUJldnFSSHovcVdoNzJZdWkzTVVERUwzcTQ0V1BYdzNNK2ZvMXBadVFzNHRPSUJWVlRhb2lYRUkvTXhmaEdEUHN4c05aZm9FMXE2NnJvNWFKaW0zWGRvTEZ3NzJIK24yM0JhSVh6YmNPbno1bWZQb1R2WVZ6N0t6VWw1K0ZSeEV1cWtwOUcvQWppYTIxOXRoemcyNWFia1JFL0JwRGMzcHF2cGhIdlJGeXMyd2VxdnAra3JiV0tJWDduaERiekxPSXRpTTgzNThwVHdkaXJxcFBGbk1GMnhMYzFXdkx5T3dUQWlicGJtdkhIY3Z0dFU1N3k1K1hxTlpyTGUzbEUvUHE4ZVVqMmZYS2ZPZTNwZk9qemhKWXRCL3lsbDVTREZjU0RpSCtoUmtIMjUrTCtzZHhLRUFNWmFocmxTWDh1a3FNT1d5L2pYVzJtNk05TERCYzMxQjlMRnV2NmdWS2cvMFN6aTNLQXIxa0dxMUdNalUvYUxibnE2L2xSeGM0WGZKOThoVGFyZ1grK0RiTUpCU2lZTUllOUNrMVlBeEZrS0VBRzN4YllhS21ERGdZeUZLMFVHWXBmb1dZWEcrZkFQUEk2dEpuTndiN0NsUDdJeUYrRCtiak90Q3BraHo2Q0ZySWEvSTZzRnRObDhhdUZYR01UUDM0c053SS9KaGtnRXRtRHoxNHlTZmFSY1RJQklubUtQRTMya3h5eUUyVHYrdGhLYkVWZVBEZlcvYnlNTTFLbW0wWGRPYlM3b0dEL015cE1YRlBYckN3T3RvWWp5eW43QlYyOS9NWmZzVnpwTERkUnR1SVpuYnBYenZsZitldjhNdllyL0dxazRIL2tWL0czY3NkYXpMdXlUTVBzYkZoemQxVWFiUWJqRnZEUm1jV0p4UjN6Y2ZIa1Z3OUdmcGJKbWVldjlGMDhXVzh1RGthc2x3WDZhdmxXR1U2TlJLejBnL1NIdEN5OUozMG8vY2E5elgzS2ZjMTl6bjNCWFFLUk84dWQ0NzdoTG5BZmMxL0c5bXJ6R2xyZmV4WjVHTGRuNlpacnJFb2hJMndWSGhaeXdqYmhVV0V5OGljTUNHTkNVZGlCbHEzcit4YWZMNTQ5SFE1akgrYW4rMXkrTGxZQmlmdXhBdlJOL2xWVlZPbHdsQ2tkVm05Tk9MNUJFNHdrUTJTTWxEWlU5N2hYODZFaWxVL2xVbWtRVXp0VEU2bXgxRUVQaDdPbWRxQnRBdnY4SGRXcGJySlM2dEpqM24wQ1dkTTZidXNOelJWM1M5S1RZaHF2TmlxV211cm9pS2dZaHNoTWptaFRoOXB0V2hzRjc5NzBqL1NiTXJzUEUxc3VSNXo3RE1DK1AvSHMreTdpanJRQWxoeUFnY2NqYmhqUHlnZmVCVGp6aE5xeTI4RWRrVWg4QytEVTkrejJ2L295ZUg3OTFPbmN4SE9zNXkyQXRUYzduYi9mNzNUV1BrRC9xd0Jualg4Qm9KOThWUU5jQys4QUFBQ3pTVVJCVkdnRjdaaEJDc013REFUanZzYi9mNDEvMDlM';
    uri2 =
        'akhzV1FiUU9UbThDUzRoa0xqTmZlKzMwTnZuUE9HaXkvN3E3L212ek1QNjUxQTcrMm9nRU5RQUllSVFnUXAyc0FJNFFGSG05Z2RLLzV3cnI3YmpPdC8zZ0RiZ0RPSUU3WEFFWUlDMmdBQXNUcEdzQUlZUUVOUUlBNGZVM3ZIcjRMWWVaWndCbElIdjFJQTMzbTJWRUR5YU1mYWFEUFBEdHFJSG4wSTkrRitzeXpvek9RUFBxUkJ2ck1zNk1Ha2tjLzBrQ2ZlWGJVUVBMb1J4K1lPeHRMdG4wd2lBQUFBQUJKUlU1RXJrSmdnZz09Ii8+PC9kZWZzPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9InVybCgjYikiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iLjEiLz48L3N2Zz4=';
    transparentUri;
    @api rimTypeFilter = {};
    @api lensShapeFilter = {};
    @track picklistMap;
    @track shapeLensMap;
    @track faceShapeMap;
    @api faceShapeFilter = {};
    @track facets;

    _sortingOptions = [];
    sortingValue;
}
