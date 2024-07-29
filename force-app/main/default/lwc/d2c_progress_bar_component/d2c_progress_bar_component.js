import { api, track, LightningElement } from 'lwc';

// GET LABELS
import CLICK_AND_COLLECT_STEPS from '@salesforce/label/c.D2C_NB_ClickAndCollectCheckoutSteps'; // NBD2C-95 Labels of Steps applicable for Click and Collect
import ONLINE_PURCHASE_STEPS from '@salesforce/label/c.D2C_NB_OnlinePurchaseCheckoutSteps'; // NBD2C-95 Labels of Steps applicable for Online Purchase

// NBD2C-95 - CONSTANTS - START
const CURRENT = 'current';
const COMPLETED = 'completed';
const DATA_STEP = 'data-step';
const LINE_CLASS = '.line';
const ONLINE_PURCHASE = 'onlinePurchase';
const CLICK_AND_COLLECT = 'clickAndCollect';
const PROGRESS_BAR_STEPS_COMPLETE = 'progressbarstepscomplete';
const SEMI_COLON = ';';
const STEP_CLASS = '.step';
const STEP_COMPLETED = 'line-completed';
// NBD2C-95 - CONSTANTS - END

export default class D2C_Progress_Bar_Component extends LightningElement {
    /**
     * NBD2C-95
     * This collection is used to save the JSON related to each step and then send it to the parent component.
     * @type {Array}
     */
    @track
    _progressBarStepsCollection = [];

    /**
     * NBD2C-95
     * This is used to check if the current process is "Click&Collect" or "Online Purchase".
     * True if "Click&Collect".
     * @type {Boolean}
     */
    _isSourceClickAndCollect = false;

    /**
     * NBD2C-95
     * This variable is used to toggle the sections Click&Collect(true) or Online Purchase(false) based on its value
     * @type {Boolean}
     */
    _showClickAndCollect = false;

    /**
     * NBD2C-95
     * This variable is used to save the page source from the parent component
     * @type {String}
     */
    @api
    pageSource;

    /**
     * NBD2C-95
     * This is a getter method to retrieve the latest selected retailer information
     */
    get fillStepsForProgressBar() {
        // Setting up values of _isSourceClickAndCollect from the page source received from parent component 'c/d2c_proceed_to_cart_parent'
        if (this.pageSource != null && this.pageSource != undefined) {
            if (this.pageSource == CLICK_AND_COLLECT) {
                this._isSourceClickAndCollect = true;
            } else if (this.pageSource == ONLINE_PURCHASE) {
                this._isSourceClickAndCollect = false;
            }
        }

        // Filling up the collection of steps of progress bar from the steps added in custom labels
        let parseStepsCollection = [];
        if (this._isSourceClickAndCollect != null && this._isSourceClickAndCollect != undefined && this._isSourceClickAndCollect == true) {
            // Splitting the comma-separated labels of steps for 'CC' from custom label 'CLICK_AND_COLLECT_STEPS' and setting up progress bar steps collection
            for (let index = 0; index < CLICK_AND_COLLECT_STEPS.split(SEMI_COLON).length; index++) {
                const step = {};
                step.stepNumber = index + 1; // stepNumber: Property of _progressBarStepsCollection to indicate the number of step
                step.stepName = CLICK_AND_COLLECT_STEPS.split(SEMI_COLON)[index]; // stepName: Property of _progressBarStepsCollection to indicate name of step
                parseStepsCollection.push(step);
            }
        } else if (this._isSourceClickAndCollect != null && this._isSourceClickAndCollect != undefined && this._isSourceClickAndCollect == false) {
            // Splitting the comma-separated labels of steps for 'OP' from custom label 'ONLINE_PURCHASE_STEPS' and setting up progress bar steps collection
            for (let index = 0; index < ONLINE_PURCHASE_STEPS.split(SEMI_COLON).length; index++) {
                const step = {};
                step.stepNumber = index + 1;
                step.stepName = ONLINE_PURCHASE_STEPS.split(SEMI_COLON)[index];
                parseStepsCollection.push(step);
            }
        }
        // Returning the progress bar steps collection
        return parseStepsCollection;
    }

    /**
     * NBD2C-95
     * Here we first call the fillStepsForProgressBar method to fill the steps of the progress bar component
     * then we call the recursiveSetTimeOut method to retrieve and design the HTML for progress bar
     */
    connectedCallback() {
        // Setting up Progress bar steps collection as soon as this component is inserted into DOM
        this._progressBarStepsCollection = this.fillStepsForProgressBar;

        // Firing an event to parent 'c/d2c_proceed_to_cart_parent' through fireProgressBarStepsCollection method
        // and indicating that progress bar steps collection is successfully set-up and supplying this collection to parent
        if (this._progressBarStepsCollection != null && this._progressBarStepsCollection != undefined) {
            this.fireProgressBarStepsCollection(this._progressBarStepsCollection);
        }
    }

    /**
     * NBD2C-95
     * This method is used to send data to the parent through a custom event.
     */
    fireProgressBarStepsCollection(progressBarStepsCollection) {
        // Dispatching the event along with collection of steps of progress bar for further use
        this.dispatchEvent(
            new CustomEvent(PROGRESS_BAR_STEPS_COMPLETE, {
                bubbles: true,
                composed: true,
                cancelable: false,
                detail: {
                    progressBarStepsCollection: progressBarStepsCollection
                }
            })
        );
    }

    /**
     * NBD2C-95
     * This API method is triggered by the parent when the user moves further or back within the process, which calls updateProgress
     * to handle the operations past user actions (NEXT / BACK).
     */
    @api
    handleProgressBarStepsUpdate(currentStepNumber) {
        this.updateProgress(currentStepNumber);
    }

    /**
     * NBD2C-95
     * This method updates the CSS for the progress bar by toggling the class names within classList of the components
     */
    updateProgress(currentStepNumber) {
        const steps = this.template.querySelectorAll(STEP_CLASS);
        //NBD2C-96 :
        const lines = this.template.querySelectorAll(LINE_CLASS);
        // If current step is greater then 1 then updated the color of line joining the step
        if (currentStepNumber > 1) {
            lines.forEach((line) => {
                const stepNumber = parseInt(line.getAttribute(DATA_STEP));
                if (stepNumber <= currentStepNumber) {
                    line.classList.add(STEP_COMPLETED);
                } else {
                    line.classList.remove(STEP_COMPLETED);
                }
            });
        } else {
            lines.forEach((line) => {
                line.classList.remove(STEP_COMPLETED);
            });
        }
        steps.forEach((step) => {
            const stepNumber = parseInt(step.getAttribute(DATA_STEP));
            if (stepNumber < currentStepNumber) {
                step.classList.add(COMPLETED);
            } else if (stepNumber === currentStepNumber) {
                step.classList.add(CURRENT);
            } else {
                step.classList.remove(CURRENT);
                step.classList.remove(COMPLETED);
            }
        });
    }
}
