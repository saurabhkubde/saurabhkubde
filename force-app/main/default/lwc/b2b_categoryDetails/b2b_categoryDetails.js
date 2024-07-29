import { LightningElement, api, wire, track } from 'lwc';
import CATEGORY from '@salesforce/label/c.B2B_PLP_Category';
import { fireEvent } from 'c/b2b_pubsub'; //BS-393
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation'; //BS-393
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //Added for BS-652
import SEARCH from '@salesforce/label/c.B2B_SEARCH';

//Constants
const SH_STORE = 'silhouette'; //BS-652
const RENDER_OPEN_FILTER_KEY = 'isOpenFilterAccordion'; //Added as part of BS-841
const FILTERS_ENABLE_SEARCH_OPTIONS_LIMIT = 8;

export default class B2b_categoryDetails extends LightningElement {
    @api
    displayData;

    @api
    parentCategory;

    /*
     * BS-841
     */
    @api
    activeCategoryLabel = 'category';

    /**
     * BS-393
     * An object with the current PageReference.
     * This is needed for the pubsub library.
     *
     * @type {PageReference}
     */
    @wire(CurrentPageReference)
    pageRef;

    _isSilhouetteStore = false; //BS-652

    @track
    _categoryOptions = {};

    isSearchableFilter = false;
    searchTerm = '';
    searchLabel = SEARCH;

    categoryLabel = CATEGORY;
    //Gets parent category name
    get category() {
        let category = { parentCategory: false };
        return (this.displayData || {})[0] || category;
    }

    //gets the child categories
    get children() {
        return this.displayData || [] || [];
    }

    /**
     * BS-652
     * Get the checked icon for radio button
     *
     */
    get radioButtonIcon() {
        let radioIcon;
        radioIcon = {
            icon: STORE_STYLING + '/icons/check.svg'
        };
        return radioIcon;
    }

    connectedCallback() {
        this._categoryOptions = this.children;
        this.isSearchableFilter = this.displayData != null && this.displayData.length > FILTERS_ENABLE_SEARCH_OPTIONS_LIMIT ? true : false;

        let currentUrl = window.location.href.split('/s/'); //BS-652
        let currentStore = currentUrl[0].split('/');

        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }
    }

    renderedCallback() {
        this.template.host.style.setProperty('--background-image-url', `url(${this.radioButtonIcon.icon})`);
    }

    /**
     * Custom event to update category in breadcrumb.
     *
     * @fires SearchCategory#categoryupdate
     * @private
     */
    notifyCategorySelection(evt) {
        const categoryId = evt.target.dataset.categoryId;
        const categoryName = evt.target.value; //BS-730
        const parentCategoryName = evt.target.dataset.parentCategoryName; //BS-730
        const categoryDetails = { categoryId: evt.target.dataset.categoryId, categoryName: evt.target.value };
        fireEvent(this.pageRef, 'categorySelection', categoryDetails); //BS-393
        this.dispatchEvent(
            new CustomEvent('categoryupdate', {
                bubbles: true,
                composed: true,
                detail: { categoryId: categoryId, categoryName: categoryName, parentCategoryName: parentCategoryName } //BS-730 added categoryName and parentCategoryName
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
                    searchedValue != null &&
                    searchedValue != undefined &&
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
        this._categoryOptions = JSON.parse(JSON.stringify(categoryOptionsToDisplay));
    }
}
