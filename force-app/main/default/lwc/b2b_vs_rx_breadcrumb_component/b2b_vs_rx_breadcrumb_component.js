import { api, LightningElement, track, wire } from 'lwc'; //BS-941
import { registerListener, unregisterAllListeners } from 'c/b2b_pubsub'; //BS-941
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation'; //BS-941
import getCategoriesDataForVS_RX from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getCategoriesDataForVSRX'; //BS-941
import LANG from '@salesforce/i18n/lang';

//CUSTOM LABELS
import backButton from '@salesforce/label/c.B2B_Breadcrumb_Back_Button';

//CONSTANTS
const EE_BRAND = 'EE'; //BS-941
const SH_BRAND = 'SH'; //BS-941
const SILHOUETTE = 'Silhouette'; // BS-941
const EVIL_EYE = 'evil eye'; // BS-941
const BRAND_NAME = 'brand'; //BS-941
const CATEGORY_UPDATE_EVENT = 'categoryupdate'; // BS-941
const LANGUAGE_ENGLISH = 'en-US'; //BS-941

export default class B2b_vs_rx_breadcrumb_component extends NavigationMixin(LightningElement) {
    /**
     * product data count
     * BS-227
     * @type {List}
     */
    @api
    isDisplaydata;

    /**
     * List of breadcrumb categories through filter.
     * BS-941
     * @type {List}
     */
    @track
    _breadcrumbCategories = [];

    /**
     * List of breadcrumb categories through filter.
     * BS-941
     * @type {List}
     */
    @track
    _navigationCategories = [];

    /**
     * Current Page reference.
     * BS-941
     * @type {List}
     */
    pageRef;

    /**
     * Update the path for change in URL.
     * BS-941
     * @type {String}
     */
    _changedCategoryPath;

    /**
     * Map containing Information about categories.
     * BS-941
     * @type {Map}
     */
    _categoryIdVsNameMap;

    /**
     * Record Id of current category.
     * BS-941
     * @type {String}
     */
    _navigationId;

    /**
     * Label containing values to be shown on UI
     * BS-941
     * @type {String}
     */
    labels = {
        backButton
    };

    /**
     * This property is used to indicate whether current store is evil eye
     * BS-941
     * @type {Boolean}
     */
    _isEvilEyeStore = false; //BS-941

    /**
     * This collecction is used to store parent category data
     * This collection is fetched from c/b2b_vs_rx_search_result_container
     * BS-941
     * @type {Array}
     */
    @api
    parentCategoryData;

    /**
     * This collecction is used to store applicable categories data
     * BS-941
     * @type {Array}
     */
    @track
    _applicableCategoriesCollection = [];

    /**
     * This collection is used to store frame type values selected by user on UI
     * This collection is fetched from c/b2b_vs_rx_search_result_container
     * BS-941
     * @type {Array}
     */
    @api
    frameType;

    /**
     * This property is used to indicate current page source (VS/RX)
     * BS-941
     * @type {String}
     */
    @api
    pageSource;

    /**
     * This Collection holds category data fetched from local storage and it is recieved from c/b2b_vs_rx_search_result_container
     * BS-941
     * @type {String}
     */
    @api
    categoryDetailsFromLocalStorage;

    /**
     * This Collection holds category translations and it is recieved from c/b2b_vs_rx_search_result_container
     * BS-941
     * @type {String}
     */
    @api
    translatedCategoriesCollection;

    /**
     * This Collection holds category details and it is recieved from c/b2b_vs_rx_search_result_container
     * BS-941
     * @type {String}
     */
    @api
    categoryDetailsCollection;

    /**
     * This method is used to get current page reference
     * BS-941
     */
    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        this.pageRef = pageRef;
        if (this.pageRef) {
            registerListener('categorySelection', this.handlecategorySelection, this);
        }
    }

    connectedCallback() {
        if (this.pageSource != null && this.pageSource != undefined) {
            let currentUrl = window.location.href.split('/s/'); // BS-941
            let currentStore = currentUrl[0].split('/');
            if (this.pageSource == SH_BRAND) {
                this._isEvilEyeStore = false;
            } else if (this.pageSource == EE_BRAND) {
                this._isEvilEyeStore = true;
            }
            if (this.frameType != null && this.frameType != undefined) {
                this._applicableCategoriesCollection.push(this.frameType.apiName);
            }
            this.getCategoryDetails();
        }
    }

    /**
     * This method is used to get category details from database
     * BS-941
     */
    getCategoryDetails() {
        getCategoriesDataForVS_RX({ categoriesList: this._applicableCategoriesCollection })
            .then((result) => {
                let categoryDetailsCollection = JSON.parse(JSON.stringify(result));

                // Pushing brand name into 1st plcae in breadcrumbs
                if (this._isEvilEyeStore != null && this._isEvilEyeStore != undefined && this._isEvilEyeStore == false) {
                    this._breadcrumbCategories.push({
                        label: SILHOUETTE,
                        displayLabel: SILHOUETTE,
                        id: BRAND_NAME
                    });
                } else if (this._isEvilEyeStore != null && this._isEvilEyeStore != undefined && this._isEvilEyeStore == true) {
                    this._breadcrumbCategories.push({
                        label: EVIL_EYE,
                        displayLabel: EVIL_EYE,
                        id: EVIL_EYE
                    });
                }

                // Pushing categories and child categories into breadcrumbs
                categoryDetailsCollection.forEach((category) => {
                    if (category.childCategoriesList != null && category.childCategoriesList != undefined) {
                        category.childCategoriesList.forEach((childCategory) => {
                            this._breadcrumbCategories.push({
                                label: childCategory.Name,
                                displayLabel: childCategory.Name,
                                id: childCategory.Id
                            });
                        });
                    }
                });
                // If current language is other than english then replacing the ctageory labels with translated labels
                if (this.translatedCategoriesCollection != null && this.translatedCategoriesCollection != undefined) {
                    this._breadcrumbCategories.forEach((breadcrumbs) => {
                        this.translatedCategoriesCollection.forEach((category) => {
                            if (category.ParentId == breadcrumbs.id) {
                                breadcrumbs.displayLabel = category.Name;
                            }
                        });
                    });
                }

                // If language is english then changing the category labels to english language as user switched the language from language switcher
                if (LANG == LANGUAGE_ENGLISH) {
                    if (this.categoryDetailsCollection != null && this.categoryDetailsCollection != undefined) {
                        this._breadcrumbCategories.forEach((breadcrumbs) => {
                            this.categoryDetailsCollection.forEach((category) => {
                                if (category.Id == breadcrumbs.id) {
                                    breadcrumbs.displayLabel = category.Name;
                                }
                            });
                        });
                    }
                }

                if (this.categoryDetailsFromLocalStorage != null && this.categoryDetailsFromLocalStorage != undefined) {
                    this.handleCategoryFromLocalStorage();
                }
            })
            .catch((execptionInstance) => {
                console.error(execptionInstance);
            });
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    //Gets the new Page Reference.
    get newPageReference() {
        return Object.assign({}, this.pageRef, {
            attributes: Object.assign({}, this.pageRef.attributes, this.newPageReferenceUrlParamsRecordId)
        });
    }

    //Gets the Url parameters new Page Reference.
    get newPageReferenceUrlParams() {
        return {
            categoryPath: this._changedCategoryPath
        };
    }

    //Gets the Url parameters new Page Reference.
    get newPageReferenceUrlParamsRecordId() {
        return {
            actionName: 'view',
            recordId: this._navigationId
        };
    }

    /**
     * This method is used to setup breadcrumbs if categories are fetched from local storage
     * BS-941
     */
    handleCategoryFromLocalStorage() {
        let categoryExists = false;
        this._breadcrumbCategories.forEach((category) => {
            if (category.label === this.categoryDetailsFromLocalStorage.categoryName) {
                categoryExists = true;
            }
        });
        if (this.categoryDetailsFromLocalStorage.categoryName != null && categoryExists === false) {
            //add child category
            if (this._breadcrumbCategories.includes(this.categoryDetailsFromLocalStorage.categoryName) == false) {
                this._breadcrumbCategories.push({
                    label: this.categoryDetailsFromLocalStorage.categoryName,
                    displayLabel: this.formatName(this.categoryDetailsFromLocalStorage.categoryName),
                    id: this.categoryDetailsFromLocalStorage.categoryId
                });
            }

            // If language is other than english then changing the category labels to respective language as user switched the language from language switcher
            if (this.translatedCategoriesCollection != null && this.translatedCategoriesCollection != undefined) {
                this._breadcrumbCategories.forEach((breadcrumbs) => {
                    this.translatedCategoriesCollection.forEach((category) => {
                        if (category.ParentId == breadcrumbs.id) {
                            breadcrumbs.displayLabel = category.Name;
                        }
                    });
                });
            }

            // If language is english then changing the category labels to english language as user switched the language from language switcher
            if (LANG == LANGUAGE_ENGLISH) {
                if (this.categoryDetailsCollection != null && this.categoryDetailsCollection != undefined) {
                    this._breadcrumbCategories.forEach((breadcrumbs) => {
                        this.categoryDetailsCollection.forEach((category) => {
                            if (category.Id == breadcrumbs.id) {
                                breadcrumbs.displayLabel = category.Name;
                            }
                        });
                    });
                }
            }
        }
    }

    /**
     * Handle the categories when navigated through filters.
     * BS-941
     */
    @api
    handlecategorySelection(event) {
        let categoryExists = false;
        this._breadcrumbCategories.forEach((category) => {
            if (category.label === event.categoryName) {
                categoryExists = true;
            }
        });
        if (event.categoryName != null && categoryExists === false && this.isDisplaydata > 0) {
            //add child category
            if (this._breadcrumbCategories.includes(event.categoryName) == false) {
                this._breadcrumbCategories.push({ label: event.categoryName, displayLabel: this.formatName(event.categoryName), id: event.categoryId });
            }
        }
    }

    /**
     * BS-941
     *
     * Handle the categories when navigated through breadcrumb.
     */
    @api
    handleBreadcrumbCategorySelection(event) {
        if (event && event.target && event.target.name && event.target.name != BRAND_NAME && event.target.name != EVIL_EYE) {
            let categoryId = event.target.name;
            let categoryIndex = this._breadcrumbCategories.length;
            this._breadcrumbCategories.forEach((element) => {
                if (
                    this.formatName(element.label).toLowerCase() === event.target.dataset.label.toLowerCase() ||
                    this.formatName(element.displayLabel).toLowerCase() === event.target.dataset.label.toLowerCase()
                ) {
                    this._breadcrumbCategories.length = this._breadcrumbCategories.indexOf(element) + 1;
                }
            });

            const categoryData = { categoryId: categoryId, categoryName: event.target.dataset.label }; //BS-BS-941
            this.handleCustomEvent(categoryData);
        }
    }

    /**
     * BS-941
     *
     * Custom event to handle category update recieved in b2b_searchResultContainer.
     */
    handleCustomEvent(categoryData) {
        this.dispatchEvent(
            new CustomEvent(CATEGORY_UPDATE_EVENT, {
                bubbles: true,
                composed: true,
                detail: { categoryId: categoryData.categoryId, categoryName: categoryData.categoryName, isBreadcrumbClicked: true }
            })
        );
    }

    /**
     * BS-941
     *
     * Format the category name to Title case.
     */
    formatName(categoryName) {
        if (categoryName == EE_BRAND) {
            return EE_BRAND.replace('-', ' ');
        } else {
            return categoryName
                .toLowerCase()
                .replace(/(?:^|[\s-/])\w/g, function (match) {
                    return match.toUpperCase();
                })
                .replace('-', ' ');
        }
    }
}
