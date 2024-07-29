import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import communityId from '@salesforce/community/Id';
import getProductsColors from '@salesforce/apex/B2B_VS_RX_PDP_Controller.getProductsColors';
import getProductDetails from '@salesforce/apex/B2B_VS_RX_PDP_Controller.getProductDetails'; //BS-1713
import getAccountDetails from '@salesforce/apex/B2B_VS_RX_PDP_Controller.getAccountDetails'; //BS-1713
//BS-960 start
import getSpacialVariationParentData from '@salesforce/apex/B2B_VS_RX_PDP_Controller.getSpacialVariationParentData';
import getVariationParentData from '@salesforce/apex/B2B_VS_RX_PDP_Controller.getVariationParentData';
import getProduct from '@salesforce/apex/B2B_VS_RX_PDP_Controller.getProduct';
import B2B_VS_BRIDGE_TEMPLE_CHECKBOX from '@salesforce/label/c.B2B_VS_BRIDGE_TEMPLE_CHECKBOX';

import CODE_FIELD from '@salesforce/schema/Account.k_ARIS_Account_ID__c';
import HIDE_PRICES_FIELD from '@salesforce/schema/Account.B2B_Hide_Prices__c';
//BS-960 end
//import { getVariationAttributeLabel } from 'c/dataNormalizer';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';

const RECORD_ID_CHANGE = 'recordidchange'; //BS-709
const SELECTED_FRAME_VS = 'SelectedFrameVS'; //BS-709
const SELECTED_FRAME_RX = 'SelectedFrameRX'; //BS-709
const PAGE_SOURCE_VS = 'VS';
const PAGE_SOURCE_RX = 'RX';
const KEY_FOR_SPECIAL_VARIATION = 'specialVariation'; //BS-960
const TRUE = 'true'; //BS-960
const PRODUCT_SIZE = 'B2B_EE_Size__c'; //BS-960
const COMPLETE_EYEWEAR = 'Complete Eyewear'; //BS-1713
const COLOR_FIELD = 'B2B_Color__c'; //BS-1713
const EERX_SIZE_FIELD = 'B2B_EE_Size__c'; //BS-1713
const SIZE_SHAPE_CHANGED_VARIABLE = 'sizeShapeModified'; //BS-2185

export default class B2bProductDetailsVariations extends NavigationMixin(LightningElement) {
    _availableOptions = [];
    _cannonicalMap = new Map();
    _showSpecialVariation = false; //BS-960
    _isSpecialVariationSelected = false; //BS-960
    @track
    _variants;
    _shapeSizeIconImage = STORE_STYLING + '/icons/SH_ShapeSize.jpg';
    isInitialDataFetched = false; //BS-1304
    _isVsPdp = false;
    checkBoxLabel = B2B_VS_BRIDGE_TEMPLE_CHECKBOX;
    _variationProduct; //BS-960
    _specialProduct; //BS-960
    _VariationProductId; //BS-960
    _SpacialVariationProductId; //BS-960

    //BS-1713
    @track
    variationProductDetailsCollection;

    @track
    availableProductVariations = [];

    @track
    isVariationsLoadComplete = false;

    @track
    displaybleVariationCollection;

    @api
    orderType;

    @api
    orderInformationSummaryCollection;

    @api
    lensConfiguratorCollection;

    @track
    countryCode;

    @track
    selectedOrderType;

    @track
    disableProductVariationsForSelection = false;

    @api
    productData;

    @api
    pageSource;

    @api
    effectiveAccountId;

    @api
    productFields;

    formattedProductData; //Added for formatting of products

    //BS-1713

    /**
     * Initialize maps
     */
    connectedCallback() {
        //Added as quick fix for VS Products
        if (this.productData) {
            this.formattedProductData = JSON.parse(JSON.stringify(this.productData));
        }
        //Added as quick fix for VS Products
        //BS-1713 - Start
        if (this.orderType != undefined && this.orderType != null) {
            this.selectedOrderType = this.orderType;
        } else if (this.orderInformationSummaryCollection != undefined && this.orderInformationSummaryCollection != null) {
            for (var orderInformation in this.orderInformationSummaryCollection) {
                // Below block is use to get order type and frame type selected by user on 1st screen
                if (
                    this.orderInformationSummaryCollection[orderInformation].isOrderType == true &&
                    this.orderInformationSummaryCollection[orderInformation].isChecked == true
                ) {
                    this.selectedOrderType = this.orderInformationSummaryCollection[orderInformation].fieldName;
                }
            }
        } else if (this.lensConfiguratorCollection != undefined && this.lensConfiguratorCollection != null) {
            if (this.lensConfiguratorCollection && this.lensConfiguratorCollection.orderType) {
                this.selectedOrderType = this.lensConfiguratorCollection.orderType;
            }
        }
        //BS-1781 : Added Additional check for checking Page source is RX
        if (this.selectedOrderType && this.selectedOrderType == COMPLETE_EYEWEAR && this.pageSource && this.pageSource === PAGE_SOURCE_RX) {
            this.disableProductVariationsForSelection = true;
        }
        this.getColorAttributes();
        //BS-1713 - End
    }

    /**
     * BS-1713
     * @Author : Chirag L
     * Below logic fetches the country code based on account od currently logged in user
     */
    getAccountDetails() {
        getAccountDetails({ accountId: this.effectiveAccountId })
            .then((result) => {
                if (result && result.length > 0 && result[0].k_ARIS_Account_ID__c) {
                    this.countryCode = result[0].k_ARIS_Account_ID__c;
                }
                //BS-960 start
                if (this.pageSource != undefined && this.pageSource != null && this.pageSource == PAGE_SOURCE_VS) {
                    this._isVsPdp = true;
                } else {
                    this._isVsPdp = false;
                }
                if (
                    this._isVsPdp == true &&
                    localStorage.getItem(KEY_FOR_SPECIAL_VARIATION) != undefined &&
                    localStorage.getItem(KEY_FOR_SPECIAL_VARIATION) != null &&
                    localStorage.getItem(KEY_FOR_SPECIAL_VARIATION) == 'true'
                ) {
                    this._showSpecialVariation = true;
                }
                if (this._isVsPdp == true && this.productFields.B2B_Is_Special__c == TRUE) {
                    this._isSpecialVariationSelected = true;
                } else {
                    this._isSpecialVariationSelected = false;
                } //BS-960 end
                this.buildCanonicalMap();
                this.transformVariantOptions();
                //BS-1713 : Start
                let variationProductIds = [];
                // CHanged source to formattedProductData collection
                if (this.formattedProductData && this.formattedProductData.attributeMappings) {
                    this.formattedProductData.attributeMappings.forEach((item) => {
                        if (item && item.productId) {
                            variationProductIds.push(item.productId);
                        }
                    });
                }
                this.checkProductAvailabilityDetails(variationProductIds);
                //BS-960 start
                if (
                    this._isVsPdp == true &&
                    this.productData.variationParentId != undefined &&
                    this.productData.variationParentId != null &&
                    this._showSpecialVariation == false
                ) {
                    this.getSpacialVariationParent();
                } else if (
                    this._isVsPdp == true &&
                    this.productData.variationParentId != undefined &&
                    this.productData.variationParentId != null &&
                    this._showSpecialVariation == true &&
                    this._isSpecialVariationSelected == true
                ) {
                    this.getVariationParent();
                } else if (this._isVsPdp == true && this.productData.variationParentId != undefined && this.productData.variationParentId != null) {
                    this.getSpacialVariationParent();
                } //BS-960 end
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    /**BS-1304
     * @Author : Aman
     * Set the value of isInitialDataFetched to true post the execution of ConnectedCallback method.
     */
    renderedCallback() {
        this.isInitialDataFetched = true; //BS-1304
    }

    /**BS-1713
     * @Author : Chirag L
     * Logic to fetch variation product along with their availability JSON
     */
    checkProductAvailabilityDetails(variationProductIds) {
        getProductDetails({ productIdList: variationProductIds })
            .then((result) => {
                if (result) {
                    this.variationProductDetailsCollection = result;
                    this.variationProductDetailsCollection.forEach((item) => {
                        if (item.B2B_Availability_JSON__c) {
                            let availabilityJson = item.B2B_Availability_JSON__c;
                            let currentUserCountryCode = this.countryCode.substring(0, 4);
                            let isProductNotAvailable =
                                availabilityJson != null && currentUserCountryCode != null
                                    ? JSON.parse(availabilityJson.replace(/&quot;/g, '"'))[currentUserCountryCode] != undefined
                                        ? JSON.parse(availabilityJson.replace(/&quot;/g, '"'))[currentUserCountryCode] <= 0
                                        : true
                                    : true;
                            if (isProductNotAvailable == false) {
                                this.availableProductVariations.push(item);
                            }
                        }
                    });
                    this.checkAvailabilityOfProductVariations();
                }
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    /**
     * Improve performance by building map once
     */
    buildCanonicalMap() {
        this.attributeMappings.forEach((variant) => {
            this._cannonicalMap.set(variant.canonicalKey, variant.productId);
        });
    }

    get attributeMappings() {
        return this.productData.attributeMappings;
    }

    get variationAttributeInfo() {
        return this.productData.variationAttributeInfo;
    }

    get variationAttributeSet() {
        return this.productData.variationAttributeSet;
    }

    @api
    get selectedProductId() {
        const currentVariantSelectionsAsStr = this.currentlySelectedOptions.map((item) => item.value).join('_');
        return this._cannonicalMap.get(currentVariantSelectionsAsStr);
    }

    get currentlySelectedOptions() {
        const selectedOptions = [...this.template.querySelectorAll('.selectedOption')].map((item) => {
            return { field: item.dataset.field, value: item.dataset.value };
        });
        return selectedOptions;
    }

    /**
     * Transform Variant Attributes to a consumbable form
     * - ensure order as this is required for mapping canonical
     */
    transformVariantOptions() {
        const attributeInfo = this.variationAttributeInfo;
        var attributeKeys = Object.keys(attributeInfo);
        var attributesList = attributeKeys
            .map(function (key) {
                var attribute = attributeInfo[key] || {};
                var options = (attribute.availableValues || []).map(function (value) {
                    return {
                        label: value,
                        value: value
                    };
                });
                return {
                    id: attribute.fieldEnumOrId,
                    label: attribute.label,
                    field: attribute.apiName,
                    sequence: attribute.sequence,
                    options: options
                };
            })
            .sort(function (attribute1, attribute2) {
                return attribute1.sequence - attribute2.sequence;
            });
        this._variants = attributesList;

        //Added as a part of BS-1665
        this.displaybleVariationCollection = JSON.parse(JSON.stringify(this.normalizedVariants));
    }

    get normalizedVariants() {
        return (this._variants || []).map((variant) => {
            return {
                id: variant.id,
                field: variant.field,
                label: variant.label,
                value: variant.value,
                shapeSizeIcon: variant.field == 'B2B_Shape_Size__c' ? true : false,
                isColorFilter: variant.field == 'B2B_Color__c' ? true : false,
                renderInTwoColumn: variant.field === 'B2B_Color__c' || variant.field === 'B2B_Shape_Size__c' || variant.field === PRODUCT_SIZE ? false : true,
                isEESize:
                    this.pageSource !== null && this.pageSource !== undefined && this.pageSource === PAGE_SOURCE_RX && variant.field === PRODUCT_SIZE
                        ? true
                        : false, //BS-1646 : Added a check for RX to show product size dropdown
                isProductSize: variant.field === PRODUCT_SIZE ? true : false, //BS-960
                options: variant.options.map((option) => {
                    return {
                        label:
                            variant.field == 'B2B_Color__c'
                                ? this.colorFilter != undefined
                                    ? this.colorFilter[option.value].colorName
                                    : option.label
                                : option.label,
                        value: option.value,
                        hexFrame:
                            variant.field == 'B2B_Color__c'
                                ? this.colorFilter != undefined
                                    ? 'background-color: ' + this.colorFilter[option.value].hexCodeFrame
                                    : null
                                : null,
                        hexAccent:
                            variant.field == 'B2B_Color__c'
                                ? this.colorFilter != undefined
                                    ? this.colorFilter[option.value].hexCodeAccent != null
                                        ? 'background-color: ' + this.colorFilter[option.value].hexCodeAccent
                                        : 'background-color: ' + this.colorFilter[option.value].hexCodeFrame
                                    : null
                                : null,
                        disabledOpacity: !this.isOptionAvailable(option.value, variant.field) ? 'opacity: 0.5' : '',
                        selected: this.isOptionSelected(option.value, variant.field),
                        disabled: !this.isOptionAvailable(option.value, variant.field),
                        isProductAvailable:
                            this.disableProductVariationsForSelection != undefined &&
                            this.disableProductVariationsForSelection != null &&
                            this.disableProductVariationsForSelection == true
                                ? this.isProductAvailable(option.value)
                                : true //BS-1713
                    };
                })
            };
        });
    }

    /**BS-1713
     * @Author : Chirag L
     * Logic to check variation product availability based on availability JSON
     */
    isProductAvailable(value) {
        let productAvaialble = false;
        if (this.formattedProductData && this.formattedProductData.attributeMappings) {
            this.formattedProductData.attributeMappings.forEach((item) => {
                if (item && item.selectedAttributes) {
                    item.selectedAttributes.forEach((variationProduct) => {
                        if (variationProduct && variationProduct.value && variationProduct.value == value) {
                            this.availableProductVariations.forEach((availableVariation) => {
                                if (availableVariation && availableVariation.Id && availableVariation.Id == item.productId) {
                                    productAvaialble = true;
                                }
                            });
                        }
                    });
                }
            });
        }
        return productAvaialble;
    }

    /**BS-1713
     * @Author : Chirag L
     * Logic to check variation product availability based on availability JSON
     */
    checkAvailabilityOfProductVariations() {
        //Updated a logic for handling simple and variation products
        if (this.normalizedVariants) {
            let parsedNormalizedVariants = JSON.parse(JSON.stringify(this.normalizedVariants));
            let productVariationsToBeDisabled = [];
            parsedNormalizedVariants.forEach((item) => {
                if (item && item.field && item.field == COLOR_FIELD) {
                    if (item.options) {
                        item.options.forEach((colorVariation) => {
                            let variationKey = colorVariation.value ? colorVariation.value : null;
                            this.normalizedVariants.forEach((parsedItem) => {
                                if (parsedItem && parsedItem.field && parsedItem.field == EERX_SIZE_FIELD) {
                                    parsedItem.options.forEach((sizeVariations) => {
                                        if (sizeVariations && sizeVariations.selected == true) {
                                            variationKey = variationKey + '_' + sizeVariations.value;
                                            if (this.formattedProductData && this.formattedProductData.attributeMappings) {
                                                if (variationKey && this.isValueAvailable(this.formattedProductData.attributeMappings, variationKey) == true) {
                                                    this.formattedProductData.attributeMappings.forEach((product) => {
                                                        if (product && product.canonicalKey && product.canonicalKey == variationKey) {
                                                            let isProductAvailable = false;
                                                            if (this.availableProductVariations) {
                                                                this.availableProductVariations.forEach((availableVariation) => {
                                                                    if (
                                                                        availableVariation &&
                                                                        availableVariation.Id &&
                                                                        product.productId &&
                                                                        availableVariation.Id == product.productId
                                                                    ) {
                                                                        isProductAvailable = true;
                                                                    }
                                                                });
                                                                variationKey = colorVariation.value;

                                                                if (
                                                                    isProductAvailable == false &&
                                                                    this.disableProductVariationsForSelection != undefined &&
                                                                    this.disableProductVariationsForSelection != null &&
                                                                    this.disableProductVariationsForSelection == true
                                                                ) {
                                                                    colorVariation.isProductAvailable = false;
                                                                }
                                                                isProductAvailable = false;
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    // This block will handle the simple product removal from collection
                                                    if (
                                                        this.disableProductVariationsForSelection != undefined &&
                                                        this.disableProductVariationsForSelection != null &&
                                                        this.disableProductVariationsForSelection == true
                                                    ) {
                                                        colorVariation.isProductAvailable = false;
                                                        variationKey = colorVariation.value;
                                                    }
                                                }
                                            }
                                        } else if (sizeVariations && sizeVariations.selected == false && colorVariation.selected == true) {
                                            variationKey = variationKey + '_' + sizeVariations.value;
                                            if (this.formattedProductData && this.formattedProductData.attributeMappings) {
                                                if (variationKey && this.isValueAvailable(this.formattedProductData.attributeMappings, variationKey) == true) {
                                                    this.formattedProductData.attributeMappings.forEach((product) => {
                                                        if (product && product.canonicalKey && product.canonicalKey == variationKey) {
                                                            let isProductAvailable = false;
                                                            if (this.availableProductVariations) {
                                                                this.availableProductVariations.forEach((availableVariation) => {
                                                                    if (
                                                                        availableVariation &&
                                                                        availableVariation.Id &&
                                                                        product.productId &&
                                                                        availableVariation.Id == product.productId
                                                                    ) {
                                                                        isProductAvailable = true;
                                                                    }
                                                                });
                                                                variationKey = colorVariation.value;
                                                                if (
                                                                    isProductAvailable == false &&
                                                                    this.disableProductVariationsForSelection != undefined &&
                                                                    this.disableProductVariationsForSelection != null &&
                                                                    this.disableProductVariationsForSelection == true
                                                                ) {
                                                                    sizeVariations.isProductAvailable = false;
                                                                    productVariationsToBeDisabled.push(sizeVariations.value);
                                                                }
                                                                isProductAvailable = false;
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    // This block will handle the simple product removal from collection
                                                    if (
                                                        this.disableProductVariationsForSelection != undefined &&
                                                        this.disableProductVariationsForSelection != null &&
                                                        this.disableProductVariationsForSelection == true
                                                    ) {
                                                        sizeVariations.isProductAvailable = false;
                                                        productVariationsToBeDisabled.push(sizeVariations.value);
                                                        variationKey = colorVariation.value;
                                                    }
                                                }
                                            }
                                        }
                                    });
                                }
                            });
                        });
                    }
                }
            });

            if (productVariationsToBeDisabled && productVariationsToBeDisabled.length > 0) {
                parsedNormalizedVariants.forEach((variationProduct) => {
                    if (variationProduct && variationProduct.field && variationProduct.field == 'B2B_EE_Size__c') {
                        variationProduct.options.forEach((productSizeVariations) => {
                            productVariationsToBeDisabled.forEach((size) => {
                                if (size == productSizeVariations.value) {
                                    productSizeVariations.isProductAvailable = false;
                                }
                            });
                        });
                    }
                });
            }
            this.displaybleVariationCollection = JSON.parse(JSON.stringify(parsedNormalizedVariants));
        }
        this.isVariationsLoadComplete = true;
    }

    //Added this forchecking the specific valu in provided collection
    isValueAvailable(arr, searchString) {
        if (arr && Array.isArray(arr)) {
            return arr.some((obj) => {
                if (obj) {
                    if (obj.canonicalKey) {
                        return obj.canonicalKey.includes(searchString);
                    }
                }
                return false;
            });
        }
        return false;
    }

    isOptionSelected(value, field) {
        //Updated as part of BS-960
        if (this._showSpecialVariation == false) {
            return this.variationAttributeSet?.attributes && this.variationAttributeSet.attributes[field] === value;
        } else if (this._specialProduct != null && this._specialProduct.variationAttributeSet != undefined) {
            return (
                (this.variationAttributeSet?.attributes && this.variationAttributeSet.attributes[field] === value) ||
                (this._specialProduct.variationAttributeSet?.attributes && this._specialProduct.variationAttributeSet.attributes[field] === value)
            );
        } else if (this._variationProduct != null && this._variationProduct.variationAttributeSet != undefined) {
            return (
                (this.variationAttributeSet?.attributes && this.variationAttributeSet.attributes[field] === value) ||
                (this._variationProduct.variationAttributeSet?.attributes && this._variationProduct.variationAttributeSet.attributes[field] === value)
            );
        } else {
            return this.variationAttributeSet?.attributes && this.variationAttributeSet.attributes[field] === value;
        }
    }

    isOptionAvailable(value, field) {
        return !this._availableOptions.length || field !== this._selectedAttributeField || this._availableOptions.includes(value);
    }

    /**
     * Update available options based on selected dropdown
     */
    handleFocus(event) {
        const placeholder = '${selectedAttributePlaceholder}';
        const selectedAttribute = event.currentTarget?.dataset?.field;
        /*if (this._selectedAttributeField === selectedAttribute) {
            return;
        }*/
        this._availableOptions = [];
        this._selectedAttributeField = selectedAttribute;

        const variantCanonicalTemplateStr = this.currentlySelectedOptions
            .map((item) => {
                if (item.field !== this._selectedAttributeField) {
                    return item.value;
                }
                return placeholder;
            })
            .join('_');
        this.variationAttributeInfo[this._selectedAttributeField].availableValues.forEach((value) => {
            if (this._cannonicalMap.has(variantCanonicalTemplateStr.replace(placeholder, value))) {
                this._availableOptions.push(value);
            }
        });
        //BS-960 start
        if (this._showSpecialVariation == true && this._isVsPdp == true && this._specialProduct != null && this._specialProduct.variationInfo != undefined) {
            this._specialProduct.variationInfo.variationAttributeInfo[this._selectedAttributeField].availableValues.forEach((value) => {
                if (this._cannonicalMap.has(variantCanonicalTemplateStr.replace(placeholder, value))) {
                    this._availableOptions.push(value);
                }
            });
        }
        if (
            this._showSpecialVariation == true &&
            this._isVsPdp == true &&
            this._variationProduct != null &&
            this._variationProduct.variationInfo != undefined
        ) {
            this._variationProduct.variationInfo.variationAttributeInfo[this._selectedAttributeField].availableValues.forEach((value) => {
                if (this._cannonicalMap.has(variantCanonicalTemplateStr.replace(placeholder, value))) {
                    this._availableOptions.push(value);
                }
            });
        } //BS-960 end
    }

    // Added as part of BS-709
    handleAttributeSelect() {
        this.dispatchEvent(
            new CustomEvent(RECORD_ID_CHANGE, {
                detail: this.selectedProductId
            })
        );
        if (this.pageSource !== null && this.pageSource !== undefined && this.pageSource === PAGE_SOURCE_VS) {
            localStorage.setItem(SELECTED_FRAME_VS, this.selectedProductId);
        } else if (this.pageSource !== null && this.pageSource !== undefined && this.pageSource === PAGE_SOURCE_RX) {
            localStorage.setItem(SELECTED_FRAME_RX, this.selectedProductId);
        }
    }

    colorFilter;

    getColorAttributes() {
        if (this.attributeMappings) {
            let productsMap = new Map();
            this.attributeMappings.forEach((element) => {
                element.selectedAttributes.forEach((attribute) => {
                    if (attribute.apiName == 'B2B_Color__c') {
                        productsMap[element.productId] = attribute.value;
                    }
                });
            });

            getProductsColors({
                productIds: Object.keys(productsMap)
            })
                .then((result) => {
                    let tempMap = new Map();
                    result.forEach((element) => {
                        element.colorName = productsMap[element.productId] + ' ' + element.colorName;
                        tempMap[productsMap[element.productId]] = element;
                    });
                    this.colorFilter = tempMap;
                })
                .catch((error) => {});
        }
        this.getAccountDetails();
        this.isInitialDataFetched = true; //BS-1304
    }

    toggleVisibility(event) {
        this.handleFocus(event);
        let element = this.template.querySelector('[data-id="' + event.currentTarget.dataset.id + '"]');
        if (element.classList.contains('slds-is-open')) {
            element.classList.remove('slds-is-open');
        } else {
            element.classList.add('slds-is-open');
            let elements = this.template.querySelectorAll('.slds-dropdown-trigger_click');
            elements.forEach((dropdown) => {
                if (dropdown.classList.contains('slds-is-open') && dropdown != element) {
                    dropdown.classList.remove('slds-is-open');
                }
            });
        }
    }

    handleAttributeChange(event) {
        //BS-2185
        localStorage.setItem(SIZE_SHAPE_CHANGED_VARIABLE, 'true');
        location.reload(); //BS-709
        let elements = this.template.querySelectorAll('.selectedOption');
        elements.forEach((element) => {
            if (element.dataset.field == event.currentTarget.dataset.field) {
                element.dataset.value = event.currentTarget.dataset.value;
            }
        });
        this.handleAttributeSelect();
    }

    handleAdditionalSizeValues(event) {
        this.handleFocus(event);
    }

    //BS-960 : method to handle special variation checkbox.
    showSpecialVariants(event) {
        if (event.target.checked) {
            this._showSpecialVariation = true;
            localStorage.setItem(KEY_FOR_SPECIAL_VARIATION, this._showSpecialVariation);
            this.addSpecialVariation();
        } else {
            this._showSpecialVariation = false;
            localStorage.setItem(KEY_FOR_SPECIAL_VARIATION, this._showSpecialVariation);
            this.buildCanonicalMap();
            this.transformVariantOptions();
        }
    } //end

    //BS-960 : method to get the id of special variation Parent
    getSpacialVariationParent() {
        getSpacialVariationParentData({ productId: this.productData.variationParentId })
            .then((result) => {
                this._SpacialVariationProductId = result;
                if (this._SpacialVariationProductId != null) {
                    this.getSpecialParentDetails();
                }
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    //BS-960 : method to get the id of variation parent
    getVariationParent() {
        getVariationParentData({ productId: this.productData.variationParentId })
            .then((result) => {
                this._VariationProductId = result;
                if (this._VariationProductId != null) {
                    this.getVariationParentDetails();
                }
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }
    //BS-960 : method to get the details of special variation parent.
    //Reverted back the logic of disabling special variants on basic of availability JSON
    getSpecialParentDetails() {
        getProduct({
            communityId: communityId,
            productId: this._SpacialVariationProductId,
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
            .then((result) => {
                this._specialProduct = result;
                if (this._showSpecialVariation == true) {
                    this.addSpecialVariation();
                }
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    //BS-960 : method to get the details of variation product
    getVariationParentDetails() {
        getProduct({
            communityId: communityId,
            productId: this._VariationProductId,
            effectiveAccountId: this.resolvedEffectiveAccountId
        })
            .then((result) => {
                this._variationProduct = result;
                this.addNormalVariations();
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    //BS-960 : method to add the data of special variation on UI
    addSpecialVariation() {
        this._specialProduct.variationInfo.attributesToProductMappings.forEach((variant) => {
            this._cannonicalMap.set(variant.canonicalKey, variant.productId);
        });

        const attributeInfo = this._specialProduct.variationInfo.variationAttributeInfo;
        var attributeKeys = Object.keys(attributeInfo);
        var attributesList = attributeKeys
            .map(function (key) {
                var attribute = attributeInfo[key] || {};
                var options = (attribute.availableValues || []).map(function (value) {
                    return {
                        label: '*' + value,
                        value: value
                    };
                });
                return {
                    id: attribute.fieldEnumOrId,
                    label: attribute.label,
                    field: attribute.apiName,
                    sequence: attribute.sequence,
                    options: options
                };
            })
            .sort(function (attribute1, attribute2) {
                return attribute1.sequence - attribute2.sequence;
            });

        attributesList.forEach((element) => {
            this._variants.forEach((variant) => {
                if (element.field == variant.field && element.field == PRODUCT_SIZE) {
                    const temp = variant.options.concat(element.options);
                    variant.options = temp;
                }
            });
        });

        //Added as a part of BS-1665
        this.displaybleVariationCollection = JSON.parse(JSON.stringify(this.normalizedVariants));
    }

    //BS-960 : method to add the data of Normal variation on UI.
    addNormalVariations() {
        this._variationProduct.variationInfo.attributesToProductMappings.forEach((variant) => {
            this._cannonicalMap.set(variant.canonicalKey, variant.productId);
        });

        const attributeInfo = this._variationProduct.variationInfo.variationAttributeInfo;
        var attributeKeys = Object.keys(attributeInfo);
        var attributesList = attributeKeys
            .map(function (key) {
                var attribute = attributeInfo[key] || {};
                var options = (attribute.availableValues || []).map(function (value) {
                    return {
                        label: value,
                        value: value
                    };
                });
                return {
                    id: attribute.fieldEnumOrId,
                    label: attribute.label,
                    field: attribute.apiName,
                    sequence: attribute.sequence,
                    options: options
                };
            })
            .sort(function (attribute1, attribute2) {
                return attribute1.sequence - attribute2.sequence;
            });

        attributesList.forEach((element) => {
            this._variants.forEach((variant) => {
                if (element.field == variant.field && element.field == PRODUCT_SIZE) {
                    variant.options.forEach((option) => {
                        option.label = '*' + option.label;
                    });
                    const temp = element.options.concat(variant.options);
                    variant.options = temp;
                }
            });
        });

        //Added as a part of BS-1885
        this.displaybleVariationCollection = JSON.parse(JSON.stringify(this.normalizedVariants));
    }
}
