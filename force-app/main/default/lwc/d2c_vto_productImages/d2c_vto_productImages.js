import { LightningElement, api, track } from 'lwc';
import STORE_STYLING from '@salesforce/resourceUrl/D2C_VTO_SH_StoreStyling';
import { DEFAULTS } from './constants';

export default class D2C_productImages extends LightningElement {
    @api
    productImages;

    @track _imageIndex = [];
    _minIndex;
    _maxIndex;

    @track
    _mainImage;

    _leftArrowIcon = STORE_STYLING + '/icons/leftArrow.svg';

    _rightArrowIcon = STORE_STYLING + '/icons/rightArrow.svg';

    _currentImageIndex = 0;

    _showDefaultImage = false;

    _displayArrows = true;

    get showOpacity() {
        return this.productDisabled ? DEFAULTS.OPACITY_50 : '';
    }

    get showOpacityMainImage() {
        return this.productDisabled ? DEFAULTS.MAIN_IMAGE_OPACITY : '';
    }

    connectedCallback() {
        if (this.productImages !== undefined && this._mainImage !== null && this.productImages.length > 0) {
            if (this.productImages.length == 1) {
                this._displayArrows = false;
            }
            this._mainImage = JSON.parse(JSON.stringify(this.productImages[0]));
            if (this.productImages.length > 1) {
                this.productImages.forEach((index) => {
                    this._imageIndex.push(index.imageOrder);
                });
                this._minIndex = Math.min.apply(null, this._imageIndex);
                this._maxIndex = Math.max.apply(null, this._imageIndex);
            }
        } else {
            this._showDefaultImage = false;
        }
    }

    renderedCallback() {
        this.disableArrowButton();
        this.addFigureBorder();
    }

    /**
     * This method is used to select the image on the click of the image bubble ob the carousel
     */
    clickOnChildImage(event) {
        let figureOrder = event.currentTarget.dataset.id;
        this.productImages.forEach((element) => {
            if (element.imageOrder == figureOrder) {
                this._mainImage = element;
                this._currentImageIndex = element.imageOrder - 1;
            }
        });
        this.disableArrowButton();
    }

    /**
     * This method is used to handle the change of image on click of left arrow
     */
    leftArrowClick() {
        let currentIndex = this._mainImage.imageOrder;
        for (let index = 0; index < this.productImages.length; index++) {
            if (this.productImages[index].imageOrder == currentIndex && currentIndex > this.productImages[0].imageOrder) {
                this._mainImage = this.productImages[index - 1];
                this._currentImageIndex = index - 1;
            }
        }
        this.disableArrowButton();
    }

    /**
     * This method is used to handle the change of image on click of right arrow
     */
    rightArrowClick() {
        let currentIndex = this._mainImage.imageOrder;
        for (let index = 0; index < this.productImages.length; index++) {
            if (this.productImages[index].imageOrder == currentIndex && currentIndex < this.productImages[this.productImages.length - 1].imageOrder) {
                this._mainImage = this.productImages[index + 1];
                this._currentImageIndex = index + 1;
            }
        }
        this.disableArrowButton();
    }

    /**
     * This method is used to handle the styling of image bubble on the carousel
     */
    addFigureBorder() {
        try {
            let figures = this.template.querySelectorAll(`.image-figure`);
            let figureIndex = 0;
            figures.forEach((element) => {
                if (figureIndex == this._currentImageIndex) {
                    element.classList.add(DEFAULTS.FIGURE_BORDER);
                } else {
                    element.classList.remove(DEFAULTS.FIGURE_BORDER);
                }
                figureIndex++;
            });
        } catch (error) {
            console.error(error);
        }
    }

    /**
     *
     * This method is used to handle the visibility of right and left arrow buttons
     */
    disableArrowButton() {
        if (this._mainImage && this.productImages.length > 1 && this._mainImage.imageOrder != undefined) {
            if (this._mainImage.imageOrder === this._minIndex) {
                this.template.querySelector('.left-arrow').classList.add(DEFAULTS.DISABLED_ICON);
            }
            if (this._mainImage.imageOrder === this._maxIndex) {
                this.template.querySelector('.right-arrow').classList.add(DEFAULTS.DISABLED_ICON);
            }
            if (this._mainImage.imageOrder !== this._minIndex) {
                this.template.querySelector('.left-arrow').classList.remove(DEFAULTS.DISABLED_ICON);
            }
            if (this._mainImage.imageOrder !== this._maxIndex) {
                this.template.querySelector('.right-arrow').classList.remove(DEFAULTS.DISABLED_ICON);
            }
        }
    }
}
