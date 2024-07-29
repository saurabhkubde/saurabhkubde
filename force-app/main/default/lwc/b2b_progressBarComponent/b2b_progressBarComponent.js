import { api, track, LightningElement } from 'lwc';

//GET LABELS
import B2B_VS_STEPS from '@salesforce/label/c.B2B_VS_Steps'; //BS-655 Labels of Steps applicable for VS
import B2B_RX_STEPS from '@salesforce/label/c.B2B_RX_Steps'; //BS-655 Labels of Steps applicable for RX

//CONSTANTS
const PROGRESS_BAR_STEPS_COMPLETE = 'progressbarstepscomplete'; //BS-655
const NEXT_ACTION = 'Next'; //BS-655
const PREVIOUS_ACTION = 'Back'; //BS-655
const FIRST_STEP = 1; //BS-655
const PAGE_SOURCE_VS = 'VS'; //BS-655
const PAGE_SOURCE_RX = 'RX'; //BS-655

export default class B2b_progressBarComponent extends LightningElement {
    /**
     * Collection of steps for progress bar (VS/RX)
     * BS-655
     * @type {Array}
     */
    @track
    _progressBarStepsCollection = [];

    /**
     * Variable to indicate whether the source is VS
     * BS-655
     * @type {Boolean}
     */
    _isSourceVS = true;

    /**
     * Variable to indicate whether the source is RX
     * BS-655
     * @type {Boolean}
     */
    _isSourceRX = false;

    /**
     * Api property recieved from the parent 'c/b2b_visionSensation_RX_cotainer' that indicates the source of Page
     * BS-655
     * @type {String}
     */
    @api
    pageSource;

    /**
     * This getter Method is used to fill the progress bar steps collection from labels
     * BS-655
     * @return parseStepsCollection : Collection of steps for progress bar (VS/RX)
     */
    get fillStepsForProgressBar() {
        //Setting up values of _isSourceVS & _isSourceRX from the page source recieved from parent component 'c/b2b_visionSensation_RX_cotainer'
        if (this.pageSource != null && this.pageSource != undefined) {
            if (this.pageSource == PAGE_SOURCE_VS) {
                this._isSourceVS = true;
                this._isSourceRX = false;
            } else if (this.pageSource == PAGE_SOURCE_RX) {
                this._isSourceVS = false;
                this._isSourceRX = true;
            }
        }

        //Filling up the collection of steps of progress bar from the steps added in custom labels
        let parseStepsCollection = [];
        if (this._isSourceVS != null && this._isSourceVS != undefined && this._isSourceVS == true && this._isSourceRX == false) {
            //Spliting the comma sepearted labels of steps for 'VS' from custom label 'B2B_VS_STEPS' and setting up progress bar steps collection
            for (let i = 0; i < B2B_VS_STEPS.split(',').length; i++) {
                const step = {};
                step.stepNumber = i + 1; // stepNumber: Property of _progressBarStepsCollection to indicate number of step
                step.stepName = B2B_VS_STEPS.split(',')[i]; // stepName: Property of _progressBarStepsCollection to indicate name of step
                step.isCompleted = false; // stepName: Property of _progressBarStepsCollection to indicate whether the step is completed
                if (i + 1 == FIRST_STEP) {
                    //Onload setting up 1st step as current active step
                    step.isActive = true; // stepName: Property of _progressBarStepsCollection to indicate whether the step is currently active
                } else {
                    step.isActive = false;
                }
                parseStepsCollection.push(step);
            }
        } else if (this._isSourceVS != null && this._isSourceVS != undefined && this._isSourceRX == true && this._isSourceVS == false) {
            //Spliting the comma sepearted labels of steps for 'RX' from custom label 'B2B_RX_STEPS' and setting up progress bar steps collection
            for (let i = 0; i < B2B_RX_STEPS.split(',').length; i++) {
                const step = {};
                step.stepNumber = i + 1;
                step.stepName = B2B_RX_STEPS.split(',')[i];
                step.isCompleted = false;
                if (i + 1 == FIRST_STEP) {
                    step.isActive = true;
                } else {
                    step.isActive = false;
                }
                parseStepsCollection.push(step);
            }
        }
        // Returning the progress bar steps collection
        return parseStepsCollection;
    }

    connectedCallback() {
        //Setting up Progress bar steps collection as soon as this component is inserted into DOM
        this._progressBarStepsCollection = this.fillStepsForProgressBar;

        // Firing an event to parent 'c/b2b_visionSensation_RX_cotainer' through fireProgressBarStepsCollection method and indicating that progress bar steps collection is succesully set-up
        // and supplying this collection to parent
        if (this._progressBarStepsCollection != null && this._progressBarStepsCollection != undefined) {
            this.fireProgressBarStepsCollection(this._progressBarStepsCollection);
        }
    }

    /**
     * This method used to fire event 'progressbarstepscomplete' to indicate parent component 'c/b2b_visionSensation_RX_cotainer' that,
     *          progress bar steps collection is complete and supply progress bar steps collection
     * BS-655
     * @param _progressBarStepsCollection : Collection of steps for progress bar (VS/RX)
     */
    fireProgressBarStepsCollection(progressBarStepsCollection) {
        //Dispatching the event along with collection of steps of progress bar for further use
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
     * This api method is invoked by parent 'c/b2b_visionSensation_RX_cotainer'
     * This method is used to operate progress bar section according to action (Next, Previous) and step number
     * Below Mentioned are the three valid scenarios for successful operation :
     *      1. NEXT         :   On click of 'NEXT' button on 'c/b2b_visionSensation_RX_cotainer', increment the progress bar step
     *      2. BACK         :   On click of 'BACK' button on 'c/b2b_visionSensation_RX_cotainer', decrement the progress bar step
     * BS-655
     * @param   action              : Name of action. Valid Values: 'NEXT' , 'BACK'
     * @param   currentStepNumber   : Current active step of progress bar
     */
    @api
    handleProgressBarStepsUpdate(action, currentStepNumber) {
        let parsedProgressBarStepsCollection = [];
        parsedProgressBarStepsCollection = JSON.parse(JSON.stringify(this._progressBarStepsCollection)); //Performing deep copy of progress bar steps collection
        let totalSteps = parsedProgressBarStepsCollection.length; //Total steps  indicates the total steps of progress bar steps
        for (var step in parsedProgressBarStepsCollection) {
            if (parsedProgressBarStepsCollection[step].stepNumber == currentStepNumber) {
                if (action == NEXT_ACTION) {
                    // If 'NEXT' button is pressed on UI by user, then finding out the current active step
                    // Marking current active step as completed and marking the next step as acurrent active step if the next step is not the last step of progress bar
                    if (parseInt(step) + 1 != totalSteps) {
                        //Identifying whether the next step is not the last step of progress bar
                        parsedProgressBarStepsCollection[step].isActive = false; // Marking current active step as active = false as it is completed
                        parsedProgressBarStepsCollection[step].isCompleted = true; // Marking current active step as completed = true as it is completed
                        parsedProgressBarStepsCollection[parseInt(step) + 1].isActive = true; // Marking next step as current active step as previous step is completed
                    } else {
                        //If the next step is the last step of progress bar then marking current active step as completed and active = false as there are no further steps exists
                        parsedProgressBarStepsCollection[step].isActive = false; // Marking current active step as active = false as it is completed
                        parsedProgressBarStepsCollection[step].isCompleted = true; // Marking current active step as completed = true as it is completed
                    }
                } else if (action == PREVIOUS_ACTION) {
                    // If 'BACK' button is pressed on UI by user, then finding out the current active step
                    // Marking current active step as active = false as progress bar is to be shifted to previous step,
                    // Marking the previous step as current active step and as incomplete step
                    if (parseInt(step) + 1 != totalSteps) {
                        //Identifying whether the next step is not the last step of progress bar
                        parsedProgressBarStepsCollection[step].isActive = false; // Marking current active step as inActive i.e., isActive = false
                        parsedProgressBarStepsCollection[parseInt(step) - 1].isActive = true; // Marking previous step as active i.e., isActive = true
                        parsedProgressBarStepsCollection[parseInt(step) - 1].isCompleted = false; // Marking previous step as incomplete i.e., isCompleted = false
                    } else {
                        //If the current step is last step of progress bar then marking it as incomplete and inactive along with that,
                        // Marking previous step as currently active step and as inComplete step.
                        parsedProgressBarStepsCollection[step].isActive = false; // Marking current active step as inactive as progress bar is to be shift to previous step
                        parsedProgressBarStepsCollection[step].isCompleted = false; // Marking current active step as incomplete as progress bar is to be shift to previous step
                        parsedProgressBarStepsCollection[parseInt(step) - 1].isCompleted = false; // Marking previous step as incomplete
                        parsedProgressBarStepsCollection[parseInt(step) - 1].isActive = true; // Marking previous step as currently active step
                    }
                }
            }
        }
        this._progressBarStepsCollection = []; // Making the progress bar steps collection as blank.
        this._progressBarStepsCollection = parsedProgressBarStepsCollection; // Setting up progress bar steps collection with latest status
        this.fireProgressBarStepsCollection(this._progressBarStepsCollection); // Firing the event to parent 'c/b2b_visionSensation_RX_cotainer' and supplying the latest collection of progress bar steps collection
    }

    /**
     * This api method is invoked by parent 'c/b2b_visionSensation_RX_cotainer'
     * This method is used to explicitely set/jump to any step and set that step as the current active step of progress bar
     * BS-655
     * @param   stepNumber          :   Number of step that needs to be set explicitely
     * @param   activeStatus        :   Step active status to determine whether above step is set to be active - (Boolean)
     * @param   successStatus       :   Step success status to determine whether above step is set to be completed - (Boolean)
     */
    @api
    updateProgressBar(stepNumber, activeStatus, successStatus) {
        let parsedProgressBarStepsCollection = [];
        parsedProgressBarStepsCollection = JSON.parse(JSON.stringify(this._progressBarStepsCollection)); //Performing deep copy of progress bar steps collection
        let totalSteps = parsedProgressBarStepsCollection.length; //Total steps  indicates the total steps of progress bar steps
        for (var step in parsedProgressBarStepsCollection) {
            // Iterating over the available collection of progress bar steps and finding out the steps that need to be worked according to supplied step number and status
            if (parsedProgressBarStepsCollection[step].stepNumber == stepNumber) {
                parsedProgressBarStepsCollection[step].isActive = activeStatus; // Setting up active status of supplied stepNumber according to supplied activeStatus
                parsedProgressBarStepsCollection[step].isCompleted = successStatus; // Setting up completion status of supplied stepNumber according to supplied successStatus
            }
            if (parsedProgressBarStepsCollection[step].stepNumber < stepNumber) {
                // Setting up all previous steps as completed and inactive
                parsedProgressBarStepsCollection[step].isActive = false; // Marking previous steps as inActive
                parsedProgressBarStepsCollection[step].isCompleted = true; // Marking previous steps as completed
            }
            if (parsedProgressBarStepsCollection[step].stepNumber > stepNumber) {
                // Setting up all proceeding  steps as inCompleted and inactive
                parsedProgressBarStepsCollection[step].isActive = false; // Marking proceeding  steps as inActive
                parsedProgressBarStepsCollection[step].isCompleted = false; // Marking proceeding  steps as in complete
            }
        }
        this._progressBarStepsCollection = []; // Making the progress bar steps collection as blank.
        this._progressBarStepsCollection = parsedProgressBarStepsCollection; // Setting up progress bar steps collection with latest status
        this.fireProgressBarStepsCollection(this._progressBarStepsCollection); // Firing the event to parent 'c/b2b_visionSensation_RX_cotainer' and supplying the latest collection of progress bar steps collection
    }
}
