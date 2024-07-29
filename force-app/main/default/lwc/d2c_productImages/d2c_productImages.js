import { LightningElement, api, track } from 'lwc';
import STORE_STYLING from '@salesforce/resourceUrl/D2C_NB_StoreStyling';
import D2C_NB_PDP_LABELS from '@salesforce/label/c.D2C_NB_PDP_LABELS';
import { DEFAULTS } from './constants';

export default class D2C_productImages extends LightningElement {
    @api
    productImages;

    @api
    displayData;

    @track _imageIndex = []; //NBD2C-49: This array is used to store the image order
    _minIndex; //NBD2C-49: This variable stores the lowest image index
    _maxIndex; //NBD2C-49: This variable stores the highest image index

    @track
    _mainImage; //NBD2C-49: Used to store the data of the image that is to be displayed on the image carousel

    /* Start - NBD2C-49 : Icons */
    _virtualTryOnIcon = STORE_STYLING + '/icons/VirtualTryOnBlack.svg';
    _leftArrowIcon = STORE_STYLING + '/icons/leftArrow.svg';
    _rightArrowIcon = STORE_STYLING + '/icons/rightArrow.svg';
    _virtualTryOnLabel = D2C_NB_PDP_LABELS.split(',')[23];
    /* End - NBD2C-49 : Icons */

    _currentImageIndex = 0; //NBD2C-49: This method stores the current image index
    _showDefaultImage = false; //NBD2C-49: This variable is used to handle the visibility of the image
    _displayArrows = true; //NBD2C-49: This variable hides the arrow buttons if only one image is present
    _productModelName; //NBD2C-49: This variable is used to store the product model name

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
        this._productModelName = this.displayData.name;
    }

    renderedCallback() {
        let index = 0;
        this.disableArrowButton();
        this.addFigureBorder(index);
    }

    /**
     * NBD2C-49
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
     * NBD2C-49
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
     * NBD2C-49
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
     * NBD2C-49
     * This method is used to handle the styling of image bubble on the carousel
     */
    addFigureBorder(index) {
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
     * NBD2C-49
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
