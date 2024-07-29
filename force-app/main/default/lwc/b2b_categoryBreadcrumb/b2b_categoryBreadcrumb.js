import { api, LightningElement, track, wire } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/b2b_pubsub';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';

// CONTROLLER METHODS
import getCategories from '@salesforce/apex/B2B_SearchController.getCategories';

//CUSTOM LABELS
import backButton from '@salesforce/label/c.B2B_Breadcrumb_Back_Button';
import allCategory from '@salesforce/label/c.B2B_All_Category';

//CONSTANTS
const URL = 'url';
const SEARCH_KEYWORD = 'search';
const EE_BRAND = 'evil-eye'; //BS-652
const SH_STORE = 'silhouette'; //BS-652
export default class MyComponentName extends NavigationMixin(LightningElement) {
    /**
     * product data count
     * BS-227
     * @type {List}
     */
    @api
    isDisplaydata;

    /**
     * List of breadcrumb categories through filter.
     * BS-393
     * @type {List}
     */
    @track
    _breadcrumbCategories = [];

    /**
     * List of breadcrumb categories through filter.
     * BS-393
     * @type {List}
     */
    @track
    _navigationCategories = [];

    /**
     * Current Page reference.
     * BS-393
     * @type {List}
     */
    pageRef;

    /**
     * Update the path for change in URL.
     * BS-393
     * @type {String}
     */
    _changedCategoryPath;

    /**
     * Map containing Information about categories.
     * BS-393
     * @type {Map}
     */
    _categoryIdVsNameMap;

    /**
     * Record Id of current category.
     * BS-393
     * @type {String}
     */
    _navigationId;

    labels = {
        backButton
    };

    _isEvilEyeStore = false; //BS-652
    _isSilhouetteStore = false; //BS-652

    //gets the Current Page Reference
    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        this.pageRef = pageRef;
        if (this.pageRef) {
            registerListener('categorySelection', this.handlecategorySelection, this);
        }
    }

    connectedCallback() {
        if (this.pageRef.state.categoryPath && this.pageRef.state.categoryPath.includes('/')) {
            this.handle_navigationCategories();
        } else if (this.pageRef.attributes.recordId) {
            //add parent category
            this._breadcrumbCategories.push({
                label: this.pageRef.state.categoryPath,
                displayLabel: this.formatName(this.pageRef.state.categoryPath),
                id: this.pageRef.attributes.recordId
            });
        } else {
            this._breadcrumbCategories.push({
                label: allCategory,
                displayLabel: this.formatName(allCategory),
                id: SEARCH_KEYWORD
            });
        }
        let currentUrl = window.location.href.split('/s/'); // BS-652
        let currentStore = currentUrl[0].split('/');
        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true; // BS-652
        }
        if (this.pageRef.state.categoryPath != undefined && this.pageRef.state.categoryPath.includes(EE_BRAND)) {
            this._isEvilEyeStore = true; // BS-652
        }
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    //gets the new Page Reference.
    get newPageReference() {
        return Object.assign({}, this.pageRef, {
            attributes: Object.assign({}, this.pageRef.attributes, this.newPageReferenceUrlParamsRecordId)
        });
    }

    //gets the Url parameters new Page Reference.
    get newPageReferenceUrlParams() {
        return {
            categoryPath: this._changedCategoryPath
        };
    }

    //gets the Url parameters new Page Reference.
    get newPageReferenceUrlParamsRecordId() {
        return {
            actionName: 'view',
            recordId: this._navigationId
        };
    }

    /**
     * BS-393
     *
     * Handle the categories When navigated through Navigation menu.
     */
    handle_navigationCategories() {
        getCategories({ categoryId: this.pageRef.attributes.recordId })
            .then((data) => {
                this._categoryIdVsNameMap = data;
                this._navigationCategories = this.pageRef.state.categoryPath.split('/');
                this._breadcrumbCategories = [];
                this._navigationCategories.forEach((element) => {
                    //add nav category
                    this._breadcrumbCategories.push({
                        label: element,
                        displayLabel: this.getDisplayCategoryName(this._categoryIdVsNameMap, element, this.pageRef.attributes.recordId),
                        id: this.getKeyByValue(this._categoryIdVsNameMap, element),
                        type: URL
                    });
                });
            })
            .catch((exceptionInstance) => {
                console.error(exceptionInstance);
            });
    }

    /**
     * BS-393
     * BS-1595 : Updated the method to cover category Navigation as well as category filter selection
     * Handle the categories when navigated through filters.
     */
    async handlecategorySelection(event) {
        await getCategories({ categoryId: event.categoryId }).then((result) => {
            this._categoryIdVsNameMap = result;
            let categoryExists = false;
            this._breadcrumbCategories.forEach((category) => {
                if (category.label === event.categoryName) {
                    categoryExists = true;
                }
            });

            if (event.categoryName != null && categoryExists === false && this.isDisplaydata > 0) {
                //add child category
                if (this._breadcrumbCategories.includes(event.categoryName) == false) {
                    this._breadcrumbCategories.push({
                        label: event.categoryName,
                        displayLabel: this.getDisplayCategoryName(this._categoryIdVsNameMap, null, event.categoryId),
                        id: event.categoryId
                    });
                }
            }
        });
    }

    /**
     * BS-393
     *
     * Handle the categories when navigated through breadcrumb.
     */
    @api //BS-730
    handleBreadcrumbCategorySelection(event) {
        let categoryId = event.target.name;
        let categoryIndex = this._breadcrumbCategories.length;
        this._breadcrumbCategories.forEach((element) => {
            if (this.formatName(element.label).toLowerCase() === this.formatName(event.target.dataset.label).toLowerCase()) {
                //Updated as part of BS-776
                //BS-730
                this._breadcrumbCategories.length = this._breadcrumbCategories.indexOf(element) + 1;
            }
        });

        if (this._breadcrumbCategories.length !== categoryIndex) {
            const categoryData = { detail: { categoryId: categoryId, categoryName: event.target.dataset.label } }; //BS-730
            this.handleCustomEvent(categoryData);
        }

        if (event.target.dataset.type === URL) {
            let path = this.pageRef.state.categoryPath.split(event.target.dataset.label.toLowerCase());
            this._navigationId = categoryId;
            this._changedCategoryPath = path[0] + event.target.dataset.label.toLowerCase();
            this.navigateToNewPage();
        }
    }

    /**
     * BS-393
     *
     * Handle redirection to new page based on category change.
     */
    navigateToNewPage() {
        this[NavigationMixin.Navigate](this.newPageReference, true);
    }

    /**
     * BS-393
     *
     * Handle the categories on click of back button in the breadcrumb.
     */
    handleBack() {
        let categoryId = this._breadcrumbCategories[this._breadcrumbCategories.length - 2].id;
        let categoryLabel = this._breadcrumbCategories[this._breadcrumbCategories.length - 2].label.toLowerCase();
        let categoryType = this._breadcrumbCategories[this._breadcrumbCategories.length - 2].type;
        this._breadcrumbCategories.length = this._breadcrumbCategories.length - 1;
        if (this._breadcrumbCategories.length >= 1 && categoryType === URL) {
            let path = this.pageRef.state.categoryPath.split(categoryLabel);
            this._navigationId = categoryId;
            this._changedCategoryPath = path[0] + categoryLabel;
            this.navigateToNewPage();
        }
        this.handleCustomEvent(categoryId);
    }

    /**
     * BS-393
     *
     * Custom event to handle category update recieved in b2b_searchResultContainer.
     */
    handleCustomEvent(categoryData) {
        this.dispatchEvent(
            new CustomEvent('categoryupdate', {
                bubbles: true,
                composed: true,
                detail: { categoryId: categoryData.detail.categoryId, categoryName: categoryData.detail.categoryName, isBreadcrumbClicked: true } //BS-730
            })
        );
    }

    /**
     * BS-393
     *
     * Format the category name to Title case.
     */
    formatName(categoryName) {
        if (categoryName == EE_BRAND) {
            return EE_BRAND.replace('-', ' ');
        } else {
            return categoryName.toLowerCase().replace(/(?:^|[\s-/])\w/g, function (match) {
                return (match[0].toUpperCase() + match.slice(1)).replace('-', ' ');
            });
        }
    }

    /**
     * BS-393
     *
     * Returns key based on value.
     */
    getKeyByValue(object, value) {
        return Object.keys(object).find((key) => object[key].split('*****')[0] === value);
    }

    /**
     * BS-1595
     * Updated the method to return the category Name based on updated conditions.
     * Returns name of the category selected.
     */
    getDisplayCategoryName(object, value, currentCategoryId) {
        let displayCategory = '';
        Object.entries(object).forEach(([key, data]) => {
            // Added as a part of BS-1518
            if (data.includes('(') && data.includes(')')) {
                data = data.replace('(', '');
                data = data.replace(')', '');
            }

            if ((value !== undefined && value !== null && data.includes(value) === true) || currentCategoryId === key) {
                displayCategory = data.split('*****')[1];
            }
        });
        return displayCategory;
    }
}
