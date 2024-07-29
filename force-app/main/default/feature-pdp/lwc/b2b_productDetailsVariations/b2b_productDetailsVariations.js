import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import communityId from '@salesforce/community/Id';
import getProductsColors from '@salesforce/apex/B2B_ProductDetailsController.getProductsColors';
import checkEligibilityForVSRX from '@salesforce/apex/B2B_ProductDetailsController.checkEligibilityForVSRX'; //BS-2032
import getSpacialVariationParentData from '@salesforce/apex/B2B_VS_RX_PDP_Controller.getSpacialVariationParentData'; //BS-2032
import getVariationParentData from '@salesforce/apex/B2B_VS_RX_PDP_Controller.getVariationParentData'; //BS-2032
import getProduct from '@salesforce/apex/B2B_VS_RX_PDP_Controller.getProduct'; //BS-2032
//import { getVariationAttributeLabel } from 'c/dataNormalizer';
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling';
import B2B_VS_BRIDGE_TEMPLE_CHECKBOX from '@salesforce/label/c.B2B_VS_BRIDGE_TEMPLE_CHECKBOX';
import PDP_LABELS from '@salesforce/label/c.B2B_PDP_InfoLabels';
import CHASSIS_LABEL from '@salesforce/label/c.B2B_CHASSIS_PICKLIST_VALUE';
import B2B_SPCIAL_PRODUCT_INFO from '@salesforce/label/c.B2B_SPCIAL_PRODUCT_INFO'; //BS-2197
import filterInvalidVariationProducts from '@salesforce/apex/B2B_ProductDetailsController.filterInvalidVariationProducts'; //BS-2488
const SH_STORE = 'silhouette'; //BS-1622
const PRODUCT_SIZE = 'B2B_EE_Size__c'; //BS-2032
const RIMLESS_VARIANT_FIELD = 'B2B_Rimless_Variant__c'; //BS-2032
const FRAME_TYPE_FIELD = 'B2B_Frame_type__c'; //BS-2032
const RIMLESS = PDP_LABELS.split(',')[8]; //BS-2032
const US_COUNTRY_CODE = 'USUS'; //BS-2032
const SPECIAL_VARIATION_KEY = 'variationkey'; //BS-2032
const SPECIAL_PRODUCT_SELECTION = 'specialproductselection'; //BS-2197
const TRUE_VALUE = 'true';
const B2B_COLOR_FIELD = 'B2B_Color__c'; //BS-2488
const B2B_SHAPE_SIZE_FIELD = 'B2B_Shape_Size__c'; //BS-2488

export default class B2bProductDetailsVariations extends NavigationMixin(LightningElement) {
    _availableOptions = [];
    _cannonicalMap = new Map();
    _variants;
    _shapeSizeIconImage = STORE_STYLING + '/icons/SH_ShapeSize.jpg';
    _infoIcon = STORE_STYLING + '/icons/INFO.svg';
    _infoLabel = B2B_SPCIAL_PRODUCT_INFO; //BS-2197
    isInitialDataFetched = false; //BS-1304
    _isSilhouetteStore = false;
    /* Start :BS-2032 */
    @api
    effectiveAccountId;
    @api
    productFields;
    @api
    productCategoriesCollection;
    @api
    categoryPath;
    @api
    countryCode;
    _eligibleForVS = false;
    _showSpecialVariationSection = false;
    _showSpecialVariation = false;
    _isSpecialVariationSelected = false;
    _checkBoxLabel = B2B_VS_BRIDGE_TEMPLE_CHECKBOX;
    _normalizedVariantsList = [];
    _variationProductId;
    _variationProduct;
    _specialProduct;
    _showSpecialInfo = false; //BS-2197
    /* End :BS-2032 */
    validVariationIds = []; //BS-2488
    alloswedVariationValues = []; //BS-2488
    /**
     * Initialize maps
     */
    async connectedCallback() {
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');

        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }
        this.getColorAttributes();
        //BS-2488: Start
        this.buildValidProductIdVsVariationMap();
        await filterInvalidVariationProducts({ effectiveAccountId: this.effectiveAccountId })
            .then((result) => {
                this.validVariationIds = result;
                this.removeInvalidVariations();
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
        //BS-2488: End
        /* Start : BS-2032 */
        await checkEligibilityForVSRX({ accountId: this.effectiveAccountId })
            .then((result) => {
                if (result != null && result != undefined) {
                    if (result.isEligibleForVS && result.isEligibleForVS == true) {
                        this._eligibleForVS = true;
                    }
                }
            })
            .catch((exceptionInstance) => {
                console.error('Error:', exceptionInstance);
            });

        let countryCodeValue;
        if (this.countryCode !== undefined && this.countryCode !== null) {
            countryCodeValue = this.countryCode.substring(0, 4);
        }
        if (
            (countryCodeValue !== undefined) & (countryCodeValue !== null) &&
            countryCodeValue === US_COUNTRY_CODE &&
            this.productFields !== undefined &&
            this.productFields !== null
        ) {
            if (this.productFields[RIMLESS_VARIANT_FIELD] === CHASSIS_LABEL && this.productFields[FRAME_TYPE_FIELD] === RIMLESS) {
                this.getSpecialVariationParent();
            }

            if (
                this.productFields.B2B_Is_Special__c !== undefined &&
                this.productFields.B2B_Is_Special__c !== null &&
                this.productFields.B2B_Is_Special__c == TRUE_VALUE
            ) {
                this._showSpecialVariation = true;
                this._isSpecialVariationSelected = true;
                localStorage.setItem(SPECIAL_VARIATION_KEY, this._showSpecialVariation);
                this.getVariationParent();
            } else {
                this._isSpecialVariationSelected = false;
            }
        } else if (this.productFields !== undefined && this.productFields !== null && this._eligibleForVS == true) {
            this._showSpecialInfo = true;
            if (this.productFields[FRAME_TYPE_FIELD] != undefined && this.productFields[FRAME_TYPE_FIELD] === RIMLESS) {
                this.getSpecialVariationParent();
            }

            if (
                this.productFields.B2B_Is_Special__c !== undefined &&
                this.productFields.B2B_Is_Special__c !== null &&
                this.productFields.B2B_Is_Special__c == TRUE_VALUE
            ) {
                this._showSpecialVariation = true;
                this._isSpecialVariationSelected = true;
                localStorage.setItem(SPECIAL_VARIATION_KEY, this._showSpecialVariation);
                this.dispatchEvent(
                    new CustomEvent(SPECIAL_PRODUCT_SELECTION, {
                        bubbles: true,
                        composed: true,
                        cancelable: false,
                        detail: {
                            isSpecial: true
                        }
                    })
                );
                this.getVariationParent();
            } else {
                this._isSpecialVariationSelected = false;
            } //BS-2197 - to show special veriations to other countries
        }
        /* End : BS-2032 */
    }
    /**BS-1304
     * @Author : Aman
     * Set the value of isInitialDataFetched to true post the execution of ConnectedCallback method.
     */
    renderedCallback() {
        this.isInitialDataFetched = true; //BS-1304
    }
    /**
     * BS-2488
     * construct map of product ids in the entitlement policy Vs their lists of their colors and sizes
     */
    buildValidProductIdVsVariationMap() {
        let prodIdVsVariationKeyMap = new Map();
        let allValidColorsList = [];
        let allValidSizesList = [];
        this.attributeMappings.forEach((element) => {
            prodIdVsVariationKeyMap.set(element.productId, element.canonicalKey);
            allValidColorsList.push(element.canonicalKey.split('_')[0]);
            allValidSizesList.push(element.canonicalKey.split('_')[1]);
        });
        this.validProductIdVsVariationMap = prodIdVsVariationKeyMap;
        this.removeInvalidVariations();
    }

    /**
     * BS-2488
     * Remove color and size combination for invalid products i.e. (product not in entitlement policy ignoring global entitlement policy)
     * get all the valid color values for already selected size
     * get all the valid size values for already selected color
     */
    removeInvalidVariations() {
        if (
            this.validProductIdVsVariationMap != null &&
            this.validProductIdVsVariationMap.size > 0 &&
            this.validVariationIds != null &&
            this.validVariationIds.length > 0
        ) {
            this.alloswedVariationValues = { colors: [], sizes: [] };
            this.validProductIdVsVariationMap.keys().forEach((productId) => {
                if (this.validVariationIds.includes(productId)) {
                    if (this.validProductIdVsVariationMap.get(productId).split('_')[0] == this.variationAttributeSet.attributes[B2B_COLOR_FIELD]) {
                        this.alloswedVariationValues.sizes.push(this.validProductIdVsVariationMap.get(productId).split('_')[1]);
                    }
                    if (this.validProductIdVsVariationMap.get(productId).split('_')[1] == this.variationAttributeSet.attributes[PRODUCT_SIZE]) {
                        this.alloswedVariationValues.colors.push(this.validProductIdVsVariationMap.get(productId).split('_')[0]);
                    }
                }
            });
            this.transformVariantOptions();
        }
    }
    /**
     * Improve performance by building map once
     */
    buildCanonicalMap() {
        this.attributeMappings.forEach((variant) => {
            this._cannonicalMap.set(variant.canonicalKey, variant.productId);
        });
    }

    @api
    productData;

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
        this._normalizedVariantsList = JSON.parse(JSON.stringify(this.normalizedVariants));
        if (this._normalizedVariantsList !== undefined && this._normalizedVariantsList !== null) {
            this.isInitialDataFetched = true;
        }
    }

    get normalizedVariants() {
        let categoryList;
        let isEvilEyeProduct = false;
        if (this.categoryPath !== undefined && this.categoryPath !== null) {
            categoryList = JSON.parse(JSON.stringify(this.categoryPath));
        }
        if (categoryList !== undefined && categoryList !== null) {
            categoryList.forEach((item) => {
                if (item.name === 'evil eye') {
                    isEvilEyeProduct = true;
                }
            });
        }
        return (this._variants || []).map((variant) => {
            return {
                id: variant.id,
                field: variant.field,
                label: variant.label,
                value: variant.value,
                shapeSizeIcon: variant.field == B2B_SHAPE_SIZE_FIELD ? true : false,
                isColorFilter: variant.field == B2B_COLOR_FIELD ? true : false,
                isEESize: isEvilEyeProduct === true && variant.field === PRODUCT_SIZE ? true : false,
                renderInTwoColumn: variant.field === B2B_COLOR_FIELD || variant.field === B2B_SHAPE_SIZE_FIELD || variant.field === PRODUCT_SIZE ? false : true,
                isProductSize: isEvilEyeProduct === false && variant.field === PRODUCT_SIZE ? true : false, //BS-2032
                options: variant.options.map((option) => {
                    return {
                        label:
                            variant.field == B2B_COLOR_FIELD
                                ? this.colorFilter != undefined
                                    ? this.colorFilter[option.value].colorName
                                    : option.label
                                : option.label,
                        value: option.value,
                        hexFrame:
                            variant.field == B2B_COLOR_FIELD
                                ? this.colorFilter != undefined
                                    ? 'background-color: ' + this.colorFilter[option.value].hexCodeFrame
                                    : null
                                : null,
                        hexAccent:
                            variant.field == B2B_COLOR_FIELD
                                ? this.colorFilter != undefined
                                    ? this.colorFilter[option.value].hexCodeAccent != null
                                        ? 'background-color: ' + this.colorFilter[option.value].hexCodeAccent
                                        : 'background-color: ' + this.colorFilter[option.value].hexCodeFrame
                                    : null
                                : null,
                        disabledOpacity: !this.isOptionAvailable(option.value, variant.field) ? 'opacity: 0.5' : '',
                        selected: this.isOptionSelected(option.value, variant.field),
                        disabled: !this.isOptionAvailable(option.value, variant.field),
                        isProductValid: this.isValidOption(option.value, variant.field)
                    };
                })
            };
        });
    }
    /**
     * BS-2488: Will return if the variation option value is valid or not
     */
    isValidOption(value, field) {
        if (this.alloswedVariationValues == null || this.alloswedVariationValues == undefined) {
            return false;
        }
        if (field == B2B_COLOR_FIELD) {
            if (this.alloswedVariationValues.colors == null || this.alloswedVariationValues.colors == undefined) {
                return false;
            }
            return this.alloswedVariationValues.colors.includes(value);
        } else if (field == PRODUCT_SIZE) {
            if (this.alloswedVariationValues.sizes == null || this.alloswedVariationValues.sizes == undefined) {
                return false;
            }
            return this.alloswedVariationValues.sizes.includes(value);
        } else {
            return true;
        }
    }
    isOptionSelected(value, field) {
        return this.variationAttributeSet?.attributes && this.variationAttributeSet.attributes[field] === value;
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
        if (this._selectedAttributeField === selectedAttribute) {
            return;
        }
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
    }

    handleAttributeSelect() {
        this.recordPageRef = {
            type: 'standard__recordPage',
            attributes: {
                recordId: this.selectedProductId,
                actionName: 'view'
            }
        };

        this[NavigationMixin.Navigate](this.recordPageRef);
    }

    colorFilter;

    async getColorAttributes() {
        if (this.attributeMappings) {
            let productsMap = new Map();
            this.attributeMappings.forEach((element) => {
                element.selectedAttributes.forEach((attribute) => {
                    if (attribute.apiName == B2B_COLOR_FIELD) {
                        productsMap[element.productId] = attribute.value;
                    }
                });
            });

            await getProductsColors({
                productIds: Object.keys(productsMap)
            })
                .then((result) => {
                    let tempMap = new Map();
                    result.forEach((element) => {
                        element.colorName = productsMap[element.productId] + ' ' + element.colorName;
                        tempMap[productsMap[element.productId]] = element;
                    });
                    this.colorFilter = tempMap;
                    this.buildCanonicalMap();
                    this.transformVariantOptions();
                })
                .catch((error) => {});
        }
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
        let elements = this.template.querySelectorAll('.selectedOption');
        if (elements !== undefined && elements !== null) {
            elements.forEach((element) => {
                if (element.dataset.field == event.currentTarget.dataset.field && event.currentTarget.dataset.disabled == 'false') {
                    // BS-1913
                    element.dataset.value = event.currentTarget.dataset.value;
                }
            });
            this.handleAttributeSelect();
        }
    }

    toggleBlur() {
        setTimeout(() => {
            let elements = this.template.querySelectorAll('.slds-dropdown-trigger_click');
            elements.forEach((dropdown) => {
                if (dropdown.classList.contains('slds-is-open')) {
                    dropdown.classList.remove('slds-is-open');
                }
            });
        }, '100');
    }

    //BS-2032 : method to get the id of variation parent
    async getSpecialVariationParent() {
        await getSpacialVariationParentData({ productId: this.productData.variationParentId })
            .then((result) => {
                this._variationProductId = result;
                if (this._variationProductId != null) {
                    this.getSpecialParentDetails();
                }
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    //BS-2032 : method to get the details of variation product
    async getSpecialParentDetails() {
        await getProduct({
            communityId: communityId,
            productId: this._variationProductId,
            effectiveAccountId: this.effectiveAccountId
        })
            .then((result) => {
                this._specialProduct = result;
                this._showSpecialVariationSection = true;
                if (localStorage.getItem(SPECIAL_VARIATION_KEY) !== undefined && localStorage.getItem(SPECIAL_VARIATION_KEY) !== null) {
                    if (localStorage.getItem(SPECIAL_VARIATION_KEY) == TRUE_VALUE) {
                        this._showSpecialVariation = true;
                    } else {
                        this._showSpecialVariation = false;
                    }
                }
                if (this._showSpecialVariation == true) {
                    this.addSpecialVariation();
                }
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    //BS-2032 : method to add the data of Normal variation on UI.
    addSpecialVariation() {
        if (
            this._specialProduct !== undefined &&
            this._specialProduct !== null &&
            this._specialProduct.variationInfo !== undefined &&
            this._specialProduct.variationInfo !== null
        ) {
            if (
                this._specialProduct.variationInfo.attributesToProductMappings !== undefined &&
                this._specialProduct.variationInfo.attributesToProductMappings !== null
            ) {
                this._specialProduct.variationInfo.attributesToProductMappings.forEach((variant) => {
                    this._cannonicalMap.set(variant.canonicalKey, variant.productId);
                });
            }
            if (this._specialProduct.variationInfo.variationAttributeInfo !== undefined && this._specialProduct.variationInfo.variationAttributeInfo !== null) {
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
                    if (this._variants !== undefined && this._variants !== null) {
                        this._variants.forEach((variant) => {
                            if (element.field == variant.field && element.field == PRODUCT_SIZE) {
                                const temp = variant.options.concat(element.options);
                                variant.options = temp;
                            }
                        });
                    }
                });

                this._normalizedVariantsList = JSON.parse(JSON.stringify(this.normalizedVariants));
            }
        }
    }

    showSpecialVariants(event) {
        if (event.target.checked) {
            this._showSpecialVariation = true;
            localStorage.setItem(SPECIAL_VARIATION_KEY, this._showSpecialVariation);
            this.addSpecialVariation();
        } else {
            this._showSpecialVariation = false;
            localStorage.setItem(SPECIAL_VARIATION_KEY, this._showSpecialVariation);
            this.buildCanonicalMap();
            this.transformVariantOptions();
        }
    } //end

    async getVariationParent() {
        await getVariationParentData({ productId: this.productData.variationParentId })
            .then((result) => {
                this._variationProductId = result;
                if (this._variationProductId != null) {
                    this.getVariationParentDetails();
                }
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    async getVariationParentDetails() {
        await getProduct({
            communityId: communityId,
            productId: this._variationProductId,
            effectiveAccountId: this.effectiveAccountId
        }).then((result) => {
            this._variationProduct = result;
            this._showSpecialVariationSection = true;
            this.addNormalVariations();
        });
    }

    addNormalVariations() {
        if (
            this._variationProduct !== undefined &&
            this._variationProduct !== null &&
            this._variationProduct.variationInfo !== undefined &&
            this._variationProduct.variationInfo !== null
        ) {
            if (
                this._variationProduct.variationInfo.attributesToProductMappings !== undefined &&
                this._variationProduct.variationInfo.attributesToProductMappings !== null
            ) {
                this._variationProduct.variationInfo.attributesToProductMappings.forEach((variant) => {
                    this._cannonicalMap.set(variant.canonicalKey, variant.productId);
                });
            }

            if (
                this._variationProduct.variationInfo.variationAttributeInfo !== undefined &&
                this._variationProduct.variationInfo.variationAttributeInfo !== null
            ) {
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

                if (attributesList !== undefined && attributesList !== null) {
                    attributesList.forEach((element) => {
                        if (this._variants !== undefined && this._variants !== null) {
                            this._variants.forEach((variant) => {
                                if (element.field == variant.field && element.field == PRODUCT_SIZE) {
                                    variant.options.forEach((option) => {
                                        option.label = '*' + option.label;
                                    });
                                    const temp = element.options.concat(variant.options);
                                    variant.options = temp;
                                }
                            });
                        }
                    });

                    //Added as a part of BS-1885
                    this._normalizedVariantsList = JSON.parse(JSON.stringify(this.normalizedVariants));
                }
            }
        }
    }

    handleAdditionalSizeValues(event) {
        this.handleFocus(event);
    }
}
