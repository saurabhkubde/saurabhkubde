import { LightningElement, api, wire, track } from 'lwc';
import CATEGORY from '@salesforce/label/c.B2B_PLP_Category';
import { fireEvent } from 'c/b2b_pubsub'; //BS-393
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation'; //BS-393
import SEARCH from '@salesforce/label/c.B2B_SEARCH';

//Constants
const CATEGORY_UPDATE = 'categoryupdate';
const RENDER_OPEN_FILTER_KEY = 'isOpenFilterAccordion'; //Added as part of BS-841
const FILTERS_ENABLE_SEARCH_OPTIONS_LIMIT = 8;

export default class B2b_vs_rx_category_details_component extends LightningElement {
    /**
     * BS-708
     * Collection to hold product data obtained from search result container
     *
     * @type {Array}
     */
    @api
    displayData;

    /**
     * BS-708
     * Collection to hold details of parent category of currently select category
     *
     * @type {Array}
     */
    @api
    parentCategory;

    @track
    _categoryOptions = {};

    isSearchableFilter = false;
    searchTerm = '';
    searchLabel = SEARCH;

    /*
     * BS-841
     */
    @api
    activeCategoryLabel = 'category';

    /**
     * BS-708
     * Property that holds source of page
     *
     * @type {String}
     */
    @api
    pageSource; //708

    /**
     * BS-708
     * Collection to hold details of currently select category
     *
     * @type {Array}
     */
    @api
    applicableCategoriesData;

    @api
    frameTypeCollection;

    /**
     * BS-393
     * An object with the current PageReference.
     * This is needed for the pubsub library.
     *
     * @type {PageReference}
     */
    @wire(CurrentPageReference)
    pageRef;

    /**
     * BS-708
     * An object with the current PageReference.
     * This is needed for the pubsub library.
     *
     * @type {PageReference}
     */
    @wire(CurrentPageReference)
    pageRef;

    categoryLabel = CATEGORY;

    _isSilhouetteStore = false; //BS-652

    //Gets parent category name
    get category() {
        let category = { parentCategory: false };
        return (this.displayData || {})[0] || category;
    }

    //gets the child categories
    get children() {
        let displayData = this.displayData;
        let applicableCategoriesData = this.applicableCategoriesData;
        let parsedCategoriesData = [];
        if (displayData != null && displayData != undefined) {
            displayData.forEach((categoryData) => {
                applicableCategoriesData.forEach((childCategory) => {
                    if (categoryData.categoryId == childCategory.Id || categoryData.parentCategory == childCategory.Name) {
                        parsedCategoriesData.push(categoryData);
                    }
                });
            });
        }
        return parsedCategoriesData || [] || [];
    }
    connectedCallback() {
        this._categoryOptions = this.children;
        this.isSearchableFilter = this.displayData != null && this.displayData.length > FILTERS_ENABLE_SEARCH_OPTIONS_LIMIT ? true : false;
    }
    /**
     * BS-708
     * Custom event to update category based on user selection
     *
     * @fires SearchCategory#categoryupdate
     * @private
     */
    notifyCategorySelection(event) {
        const categoryId = event.target.dataset.categoryId;
        const categoryName = event.target.value; //BS-941
        const categoryDetails = { categoryId: event.target.dataset.categoryId, categoryName: event.target.value };
        const parentCategoryName = event.target.dataset.parentCategoryName; //BS-941
        fireEvent(this.pageRef, 'categorySelection', categoryDetails); //BS-941
        this.dispatchEvent(
            new CustomEvent(CATEGORY_UPDATE, {
                bubbles: true,
                composed: true,
                detail: {
                    categoryId: categoryId,
                    categoryName: categoryName,
                    categoryDetails: categoryDetails,
                    parentCategoryName: parentCategoryName
                }
            })
        );
    }
    handleSearch(event) {
        let searchedValue = String(event.target.value).toLowerCase();
        let categoriesList = JSON.parse(JSON.stringify(this.children));
        let categoryOptionsToDisplay = [];
        this.searchTerm = String(event.target.value);
        let filterOptionSearchIndexMap = new Map();
        if (categoriesList != null && categoriesList != undefined) {
            categoriesList.forEach((categoryPicklistOption) => {
                if (
                    categoryPicklistOption != null &&
                    categoryPicklistOption != undefined &&
                    categoryPicklistOption.categoryName != null &&
                    categoryPicklistOption.categoryName != undefined &&
                    String(categoryPicklistOption.categoryName).toLowerCase().includes(searchedValue)
                ) {
                    let appearenceIndex = String(categoryPicklistOption.categoryName).toLowerCase().indexOf(searchedValue);
                    if (filterOptionSearchIndexMap.has(appearenceIndex)) {
                        filterOptionSearchIndexMap.get(appearenceIndex).push(categoryPicklistOption);
                    } else {
                        filterOptionSearchIndexMap.set(appearenceIndex, [categoryPicklistOption]);
                    }
                }
            });
        }
        if (filterOptionSearchIndexMap.size > 0) {
            categoryOptionsToDisplay = [];
            let appearenceIndexSet = filterOptionSearchIndexMap.keys();
            let appearenceIndexListToSort = Array.from(appearenceIndexSet);
            appearenceIndexListToSort.sort(function (firstIndex, secondIndex) {
                return firstIndex - secondIndex;
            });
            appearenceIndexListToSort.forEach((index) => {
                if (filterOptionSearchIndexMap.has(index)) {
                    categoryOptionsToDisplay = categoryOptionsToDisplay.concat(filterOptionSearchIndexMap.get(index));
                }
            });
        }

        this._categoryOptions = {};
        this._categoryOptions = categoryOptionsToDisplay;
    }
}
