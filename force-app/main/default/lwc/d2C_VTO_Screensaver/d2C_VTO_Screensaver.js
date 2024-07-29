import { LightningElement, track } from 'lwc';
import DYNAMIC_VIDEO_URL from '@salesforce/label/c.D2C_VTO_BrandVideoUrls';
import SILHOUETTE_LOGO_Image from '@salesforce/resourceUrl/D2C_VTO_SilhouetteLogo';
import EVIL_EYE_LOGO_Image from '@salesforce/resourceUrl/D2C_VTO_EvilEyeLogo';
import NEUBAU_LOGO_Image from '@salesforce/resourceUrl/D2C_VTO_NeubauLogo';
import HOME_PAGE_REDIRECTION_URL from '@salesforce/label/c.D2C_VTO_Home_Page_Redirection_Url';

// Constants for brand identifiers
const SILHOUETTE = 'SH';
const EVILEYE = 'EE';
const NEUBAU = 'NB';

// Constants for CSS styling
const FILTER_STYLE = 'filter: grayscale(100%);';
const OBJECT_FIT_STYLE = 'object-fit: fill';
const RESIZE_EVENT = 'resize';

export default class D2C_VTO_Screensaver extends LightningElement {
    @track
    // Dynamic video URL
    _dynamicVideoUrl = DYNAMIC_VIDEO_URL;

    // Logo images for different brands
    _silhouetteLogo = SILHOUETTE_LOGO_Image;
    _evilEyeLogo = EVIL_EYE_LOGO_Image;
    _neubauLogo = NEUBAU_LOGO_Image;

    // Array to hold video URLs and associated brand logos
    _brandUrlAndBrandNameList = [];

    // Count of video URLs
    _videoUrlCount = 0;

    // Flag to determine if single video being played
    _singleVideoToPlay = false;

    // Index of the current video being played
    _currentVideoIndex = 0;

    // URL of the current video being played
    _currentVideoUrl;

    // URL of the current video type being played
    _currentVideoType;

    // URL of the current brand redirection
    _currentRedirectionUrl;

    // Styles for video, logo, and image
    _imageStyle;
    _logoStyle;
    _videoStyleWithGreyScaled;
    _videoStyleWithoutGreyScaled;

    // Home page redirection url
    _homePageRedirection = HOME_PAGE_REDIRECTION_URL;

    // Types of video (e.g., 'video/mp4','video/ogg')
    _videoType = [];

    connectedCallback() {
        let videoUrl = [];
        let brandName = [];
        let videoType = [];
        let redirectionUrl = [];

        if (this._dynamicVideoUrl != null) {
            let videoUrlAndBrandNameList = this._dynamicVideoUrl.split('|');
            redirectionUrl = this._homePageRedirection.split(',');

            videoUrlAndBrandNameList.forEach((videoUrlAndBrandName) => {
                let videoUrlAndBrand = videoUrlAndBrandName.split(':-');
                brandName.push(videoUrlAndBrand[0]);
                videoUrl.push(videoUrlAndBrand[1]);
                videoType.push(videoUrlAndBrand[1].split('.')[videoUrlAndBrand[1].split('.').length - 1]);
            });
        } else {
            return;
        }

        this._videoUrlCount = videoUrl.length;
        if (this._videoUrlCount == 1) {
            if (brandName[0] == SILHOUETTE) {
                this._currentLogo = this._silhouetteLogo;
            } else if (brandName[0] == EVILEYE) {
                this._currentLogo = this._evilEyeLogo;
            } else if (brandName[0] == NEUBAU) {
                this._currentLogo = this._neubauLogo;
            }
            this._singleVideoToPlay = true;
            this._currentVideoUrl = videoUrl[0];
            this._currentVideoType = `video/${videoType[0]}`;
            this._currentRedirectionUrl = redirectionUrl[0];
            window.addEventListener(RESIZE_EVENT, this.setDynamicStyling.bind(this));
            this.setDynamicStyling();
            return;
        }

        for (let index = 0; index < this._videoUrlCount; index++) {
            let logo;
            if (brandName[index] == SILHOUETTE) {
                logo = this._silhouetteLogo;
            } else if (brandName[index] == EVILEYE) {
                logo = this._evilEyeLogo;
            } else if (brandName[index] == NEUBAU) {
                logo = this._neubauLogo;
            }
            if (index == 0) {
                this._brandUrlAndBrandNameList.push({
                    videoUrl: videoUrl[index],
                    brandLogo: logo,
                    index: index + 1,
                    link: redirectionUrl[index],
                    isPlaying: true,
                    videoType: `video/${videoType[index]}`
                });
            } else {
                this._brandUrlAndBrandNameList.push({
                    videoUrl: videoUrl[index],
                    brandLogo: logo,
                    index: index + 1,
                    link: redirectionUrl[index],
                    isPlaying: false,
                    videoType: `video/${videoType[index]}`
                });
            }
        }

        window.addEventListener(RESIZE_EVENT, this.setDynamicStyling.bind(this));
        this.setDynamicStyling();
    }

    /**
     * DVM21-14: Creation of screen saver page for VTO/POS.
     * This method is used to play the next video upon completion of the previous video.
     */

    playNextVideo(event) {
        if (event) {
            let currentVideoIndex = parseInt(event.target.dataset.index) + 1;
            if (currentVideoIndex > this._videoUrlCount) {
                currentVideoIndex = 1;
            }

            let parsedBrandUrlAndBrandNameList = JSON.parse(JSON.stringify(this._brandUrlAndBrandNameList));

            let newBrandUrlAndBrandNameList = [];
            parsedBrandUrlAndBrandNameList.forEach((brandUrlAndBrandName) => {
                if (brandUrlAndBrandName.index == currentVideoIndex) {
                    brandUrlAndBrandName.isPlaying = true;
                } else {
                    brandUrlAndBrandName.isPlaying = false;
                }
                newBrandUrlAndBrandNameList.push(brandUrlAndBrandName);
            });

            this._brandUrlAndBrandNameList = JSON.parse(JSON.stringify(newBrandUrlAndBrandNameList));
        }
    }

    /**
     * DVM21-14: Creation of screen saver page for VTO/POS.
     * This method applies dynamic styling to the screensaver page template.
     */

    setDynamicStyling() {
        const screenHeight = 90;
        const equalHeight = screenHeight / this._videoUrlCount;
        const equalwidth = 100.0 / this._videoUrlCount;

        this._videoStyleWithoutGreyScaled = `height:${equalHeight}vh; width: 100%; ${OBJECT_FIT_STYLE}; cursor: pointer;`;
        this._videoStyleWithGreyScaled = `height:${equalHeight}vh; width: 100%; ${FILTER_STYLE}; ${OBJECT_FIT_STYLE}; cursor: pointer;`;
        this._logoStyle = `display: flex; height: 10vh; align-items: center;`;
        this._imageStyle = `width: ${equalwidth}vw; display: flex; align-items: center; justify-content: center;`;
    }

    /**
     * DVM21-14: Creation of screen saver page for VTO/POS.
     * This method used to redirect to home page.
     */
    handleClick(event) {
        if (event) {
            let currentVideoUrl = JSON.parse(JSON.stringify(event.target.dataset.link));
            window.location.href = currentVideoUrl;
        }
    }

    disconnectedCallback() {
        window.removeEventListener(RESIZE_EVENT, this.setDynamicStyling.bind(this));
    }
}
