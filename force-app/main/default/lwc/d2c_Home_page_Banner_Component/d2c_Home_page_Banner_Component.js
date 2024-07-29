import { LightningElement, api } from 'lwc';
import BannerMultiMediaResource from '@salesforce/resourceUrl/D2C_Home_Page_Banner';

// NBD2C-34 : Constants - Start
const IMAGE = 'Image';
// NBD2C-34 : Constants - Start

export default class D2C_Home_Page_Banner_Component extends LightningElement {
    /**
     * This variable holds the choice of user (Video/Image).
     * NBD2C-34
     * @type {String}
     */
    @api
    multimediaType;

    /**
     * This variable is used to toggle visibility of component based on the readiness of data.
     * NBD2C-34
     * @type {Boolean}
     */
    _initialLoadComplete = false;

    /**
     * This variable is used to toggle between Video tag and Image tag.
     * NBD2C-34
     * @type {Boolean}
     */
    _showMediaAsImage = false;

    /**
     * This variable stores the location of the media
     * NBD2C-34
     * @type {String}
     */
    _bannerMultiMediaResource = BannerMultiMediaResource;

    /**
     * NBD2C-34
     * @author : Sachin V
     * This method is used to toggle Video and Image as home page banner based on user choice.
     *
     */
    connectedCallback() {
        //NBD2C-34 : Home Page Banner - Start
        if (this.multimediaType) {
            this._showMediaAsImage = this.multimediaType && this.multimediaType == IMAGE ? true : false;
            this._initialLoadComplete = true;
        } else {
            this._showMediaAsImage = false;
            this._initialLoadComplete = false;
        }
        //NBD2C-34 : Home Page Banner - End
    }
}
