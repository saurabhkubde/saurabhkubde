import { LightningElement, api, track } from 'lwc';

// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //Styling icons added as part of BS-656
const SH_STORE = 'silhouette';
export default class B2b_productImages extends LightningElement {
    @api
    productImages;

    @track _imageIndex = [];
    _minIndex;
    _maxIndex;
    @api
    productDisabled;

    defaultImage;

    @track
    mainImage;

    @track
    imageList = [];

    showModal = false;
    showDefaultImage = false;
    displayArrows = true;
    _isSilhouetteStore = false;

    get showOpacity() {
        return this.productDisabled ? 'opacity50' : '';
    }

    get showOpacityMainImage() {
        return this.productDisabled ? 'main-image opacity50' : '';
    }

    get closeIcon() {
        return STORE_STYLING + '/icons/cross.svg';
    }

    renderedCallback() {
        this.disableArrowButton();
    }

    connectedCallback() {
        let currentUrl = window.location.href.split('/s/');
        let currentStore = currentUrl[0].split('/');
        if (currentStore.includes(SH_STORE)) {
            this._isSilhouetteStore = true;
        }
        this.defaultImage = { url: '/' + currentStore[currentStore.length - 1] + '/img/b2b/default-product-image.svg' };

        if (this.productImages && this.productImages.length > 0) {
            if (this.productImages.length == 1) {
                this.displayArrows = false;
            }
            this.mainImage = this.productImages[0];
            if (this.productImages.length > 1) {
                this.productImages.forEach((index) => {
                    this._imageIndex.push(index.imageOrder);
                });
                this._minIndex = Math.min.apply(null, this._imageIndex);
                this._maxIndex = Math.max.apply(null, this._imageIndex);
            }
            setTimeout(() => {
                let figures = this.template.querySelectorAll(`.image-figure`);
                figures[0].classList.add('figure-border');
            }, '100');
        } else {
            this.showDefaultImage = true;
        }
    }

    clickOnMainImage() {
        this.showModal = true;
        setTimeout(() => {
            let figures = this.template.querySelectorAll(`.image-figure`);
            for (let index = 0; index < figures.length; index++) {
                if (figures[index].classList.contains('figure-border')) {
                    let size = figures.length / 2;
                    figures[index + size].classList.add('figure-border');
                }
            }
        }, '100');
    }

    closeModal() {
        this.showModal = false;
    }

    clickOnChildImage(event) {
        let figureOrder = event.currentTarget.dataset.id;
        this.productImages.forEach((element) => {
            if (element.imageOrder == figureOrder) {
                this.mainImage = element;
            }
        });
        this.addFigureBorder(figureOrder);
        this.disableArrowButton();
    }

    leftArrowClick() {
        let currentIndex = this.mainImage.imageOrder;
        for (let index = 0; index < this.productImages.length; index++) {
            if (this.productImages[index].imageOrder == currentIndex && currentIndex > this.productImages[0].imageOrder) {
                this.mainImage = this.productImages[index - 1];
                this.addFigureBorder(this.productImages[index - 1].imageOrder);
            }
        }
        this.disableArrowButton();
    }

    rightArrowClick() {
        let currentIndex = this.mainImage.imageOrder;
        for (let index = 0; index < this.productImages.length; index++) {
            if (this.productImages[index].imageOrder == currentIndex && currentIndex < this.productImages[this.productImages.length - 1].imageOrder) {
                this.mainImage = this.productImages[index + 1];
                this.addFigureBorder(this.productImages[index + 1].imageOrder);
            }
        }
        this.disableArrowButton();
    }

    addFigureBorder(index) {
        let figures = this.template.querySelectorAll(`.image-figure`);
        let figure = this.template.querySelectorAll('[data-id="' + index + '"]');
        figures.forEach((element) => {
            if (element == figure[0] || element == figure[1]) {
                element.classList.add('figure-border');
            } else {
                element.classList.remove('figure-border');
            }
        });
    }

    disableArrowButton() {
        if (this.mainImage && this.productImages.length > 1 && this.mainImage.imageOrder != undefined) {
            if (this.mainImage.imageOrder === this._minIndex) {
                this.template.querySelector('.left-arrow').classList.add('disabled-Icon');
            }
            if (this.mainImage.imageOrder === this._maxIndex) {
                this.template.querySelector('.right-arrow').classList.add('disabled-Icon');
            }
            if (this.mainImage.imageOrder !== this._minIndex) {
                this.template.querySelector('.left-arrow').classList.remove('disabled-Icon');
            }
            if (this.mainImage.imageOrder !== this._maxIndex) {
                this.template.querySelector('.right-arrow').classList.remove('disabled-Icon');
            }
        }
    }
}
