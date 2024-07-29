import { LightningElement, api, track } from 'lwc';

//NBD2C-96 : Import Labels and Static Resource
import APPOINTMENT_UTILITY_LABELS from '@salesforce/label/c.D2C_NB_Appointment_Section_Labels'; // NBD2C-96 Labels for Appointment Section Content
import STORE_STYLING from '@salesforce/resourceUrl/D2C_NB_StoreStyling'; // NBD2C-96 : Down arrow for selector component, and calendar icon
import D2C_NB_PDP_LABELS from '@salesforce/label/c.D2C_NB_PDP_LABELS'; // NBD2C-96 : Label for the loader alternative text

// NBD2C-96 : Constants - Start
const LABELS = APPOINTMENT_UTILITY_LABELS.split(';');
const WEEK_DAYS = LABELS[1].split(',');
const BACKGROUND_URL_OPENINGHOURS = '--background-image-opening-hours-url';
const CALENDAR_ICON_LOCATION = '/icons/calendar.svg';
const CALENDER_COMPONENT = 'c-d2c_calendar-component';
const CAPITALIZE = 'capitalize';
const CLOSED = ' Closed';
const DATE_TIME_SELECTION_EVENT = 'dateandtimeselection';
const DISABLE_NEXT_BUTTON = 'disablenextbutton';
const DOWN_ARROW_LOCATION = '/icons/arrowIconDown.svg';
const LOWERCASE = 'lowercase';
const MINIMIZE = 'minimize';
const OPENING_HOURS_CONTAINER = '.openingHoursContainer';
const OPENING_HOURS_DATA_CONTAINER = '.openingHoursData';
const SELECTED = 'selected';
const SET_BACKGROUND_URL = '--background-image-url';
const TABLE = 'table';
const TD = 'td';
const THREE_PX = '3px';
const TIME_SLOT_COMPONENT_SELECTOR = '.timeSlotComponent';
const TR = 'tr';
const UP_ARROW_ICON_LOCATION = '/icons/upArrow.svg';
const ZERO = '0';
// NBD2C-96 : Constants - End

export default class D2C_AppointmentSection extends LightningElement {
    /**
     * NBD2C-96
     * This variable holds the value of the Appointment Section title
     * @type {String}
     */
    _appointmentTitle = LABELS[2]; // 'Please choose your preferred appointment date at your click & collect partner.'

    /**
     * NBD2C-96
     * This variable holds the Time Slot Section title
     * @type {String}
     */
    _timeSlotTitle = LABELS[5];

    /**
     * NBD2C-96
     * This variable holds the Opening Hours Section title
     * @type {String}
     */
    _openingHoursTitle = LABELS[3]; // 'Opening hours';

    /**
     * NBD2C-96
     * This variable holds the title for the section displaying the selected date and time by user
     * @type {String}
     */
    _appointmentDateTitle = LABELS[4]; // 'Your requested appointment date:';

    /**
     * NBD2C-96
     * This variable holds the value for the placeholder of Time Slot Section
     * @type {String}
     */
    _timeSlotPlaceHolder = LABELS[6];

    /**
     * NBD2C-96
     * This variable holds the value for Closed label
     * @type {String}
     */
    _closedLabel = LABELS[7];

    /**
     * NBD2C-96
     * This variable holds the Retailer Information received from parent component
     * @type {Object}
     */
    @api
    retailerData;

    /**
     * NBD2C-96
     * This variable holds the previously selected time and date by the user for a retailer
     * @type {String}
     */
    @api
    selectedDateTimeFromParent;

    /**
     * NBD2C-96
     * This variable holds the days when the retailer is closed based on the data received from parent
     * @type {Array}
     */
    _closedDays = [];

    /**
     * NBD2C-96
     * This variable holds the selected date by the user
     * @type {Date}
     */
    _selectedDate = '';

    /**
     * NBD2C-96
     * This variable is used to toggle the loader based on availability of data
     * @type {Boolean}
     */
    _isLoadingComplete = false;

    /**
     * NBD2C-96
     * This variable is used to toggle the up and down arrow for Opening Hours section
     * @type {Boolean}
     */
    _isUpArrow = false;

    /**
     * NBD2C-96
     * This variable holds the values of options for the time slot section
     * @type {Array}
     */
    _timeSlotOptions = [];

    /**
     * NBD2C-96
     * This variable holds the alternative text for loader component
     * @type {Array}
     */
    _loadingLabel = D2C_NB_PDP_LABELS.split(',')[24];

    /**
     * NBD2C-96
     * This variable holds the values of time slot options in object format
     * example : {label : '10:00 - 11:00', value : '10:00 - 11:00' }
     * @type {Array}
     */
    @track
    _timeSlots = [];

    /**
     * NBD2C-96
     * This variable holds the value of the selected time slot by user
     * @type {String}
     */
    @track
    _selectedTimeSlot = '';

    /**
     * NBD2C-96
     * This variable holds the value of the selected time and date by the user
     * @type {String}
     */
    @track
    _selectedDateTimeValue = '';

    /**
     * NBD2C-96
     * This variable holds the url of the dropdown icon down
     * @type {String}
     */
    _dropDownIcon = STORE_STYLING + DOWN_ARROW_LOCATION;

    /**
     * NBD2C-96
     * This variable holds the url of upward pointing arrow icon
     * @type {String}
     */
    _upArrowIcon = STORE_STYLING + UP_ARROW_ICON_LOCATION;

    /**
     * NBD2C-96
     * This variable holds the value of the calendar icon
     * @type {String}
     */
    _calendarIcon = STORE_STYLING + CALENDAR_ICON_LOCATION;

    /**
     * NBD2C-96
     * This method is used to retrieve the _closedDays array
     */
    get retailerClosedDays() {
        this._closedDays;
    }

    /**
     * NBD2C-96
     * This method is used to retrieve the time slots array
     */
    get timeSlots() {
        this._timeSlots = [];

        this._timeSlotOptions.forEach((timeSlot) => {
            this._timeSlots.push({
                label: timeSlot,
                value: timeSlot,
                selected: this._selectedTimeSlot && this._selectedTimeSlot == timeSlot ? SELECTED : ''
            });
        });
        return this._timeSlots;
    }

    /**
     * NBD2C-96
     * This method is used to retrieve the selected time slot value
     */
    get timeSlotValue() {
        return this._selectedTimeSlot;
    }

    /**
     * NBD2C-96
     * This method is used to set the selected time slot value
     */
    set timeSlotValue(value) {
        this._selectedTimeSlot = value;
    }

    /**
     * NBD2C-96
     * @description: Retrieves the component from markup as per the provided input
     * @param {String} componentName : Name of the component that is to be retrieved
     * @returns {Object} - Object representing the component that is to be retrieved
     */
    async retrieveComponent(componentName) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                const element = this.template.querySelector(componentName);
                if (element) {
                    clearInterval(interval);
                    resolve(element);
                }
            }, 100);
        });
    }

    /**
     * NBD2C-96
     * This method used to perform the following operations:
     * If retailer data is present, then display the opening hours for the selected retailer in previous set
     * If previous selected date and time is present, then preform the necessary calculations on it
     */
    connectedCallback() {
        if (this.retailerData) {
            this.getOpeningHoursContainer();
        }
        if (this.selectedDateTimeFromParent) {
            this._selectedDateTimeValue = this.selectedDateTimeFromParent;
            this._selectedDate = this.selectedDateTimeFromParent;
            this._selectedTimeSlot = this.selectedDateTimeFromParent.split(', ').pop();
            this.generateTimeSlotsForSelectedRetailer();
        }
    }

    /**
     * NBD2C-96
     * @description: Sets background image URL for dropdown on component render.
     */
    renderedCallback() {
        this.template.host.style.setProperty(SET_BACKGROUND_URL, `url(${this._dropDownIcon})`);
        this.template.host.style.setProperty(BACKGROUND_URL_OPENINGHOURS, `url(${this._dropDownIcon})`);
    }

    /**
     * NBD2C-96
     * This method is used to retrieve the opening hours div and calender component through
     * retrieveComponent method and passes them as parameter to displayOpeningHours method to display the opening hours section
     */
    async getOpeningHoursContainer() {
        const openingHoursContainer = await this.retrieveComponent(OPENING_HOURS_DATA_CONTAINER);
        const calenderElement = await this.retrieveComponent(CALENDER_COMPONENT);
        if (openingHoursContainer && calenderElement) {
            this.displayOpeningHours(openingHoursContainer, calenderElement);
        }
    }

    /**
     * NBD2C-96
     * This method is used to compute the data for the Opening Hours section
     */
    displayOpeningHours(openingHoursContainer, calenderElement) {
        let table = document.createElement(TABLE); // create a new table element

        // Check if the retailer data is available if yes then save it in object format
        this.retailerData =
            this.retailerData &&
            JSON.parse(JSON.stringify(this.retailerData)).openingHours &&
            JSON.parse(JSON.stringify(this.retailerData)).openingHours.weekday_text
                ? JSON.parse(JSON.stringify(this.retailerData))
                : '';
        let weekdayText = this.retailerData ? this.retailerData.openingHours.weekday_text : '';

        //Iterate over the opening hours data from Google API
        weekdayText
            ? weekdayText.forEach((weekday, index) => {
                  let weekdata = weekday ? weekday.split(':') : ''; // Monday: 9:00 AM – 6:30 PM
                  let weekName = weekdata && WEEK_DAYS && WEEK_DAYS[index] ? WEEK_DAYS[index] + ':' : ''; //from the custom get the week day name
                  let weekTime = weekdata.slice(1).join('.');

                  //If retailer is closed on certain days of week handle it seperately
                  if (weekTime == CLOSED) {
                      this._closedDays.push(index);
                      //Add week time closed translation
                      weekTime = this._closedLabel;
                  }

                  let tableRow = document.createElement(TR);
                  let weekNameCell = document.createElement(TD);
                  let weekTimeCell = document.createElement(TD);
                  weekNameCell.style.paddingTop = THREE_PX;
                  weekNameCell.style.paddingBottom = THREE_PX;
                  weekTimeCell.style.paddingTop = THREE_PX;
                  weekTimeCell.style.paddingTop = THREE_PX;

                  //If retailer is not closed then set the styling to the time section
                  weekTime != this._closedLabel ? (weekTimeCell.style.textTransform = LOWERCASE) : (weekTimeCell.style.textTransform = CAPITALIZE);
                  weekNameCell.innerHTML += weekName;
                  weekTimeCell.innerHTML += weekTime;
                  tableRow.appendChild(weekNameCell);
                  tableRow.appendChild(weekTimeCell);
                  table.appendChild(tableRow);
              })
            : '';
        openingHoursContainer.appendChild(table);
        // Call the api method of calender component and pass the days when the retailer is closed
        calenderElement ? calenderElement.handleClosedDays(this._closedDays) : '';
        this._isLoadingComplete = true;
    }

    /**
     * NBD2C-96
     * This method used to set the user selected date value from child within the _selectedDate variable
     */
    handleSelectedDate(event) {
        event.preventDefault();
        this._selectedDate = event && event.detail && event.detail.selectedDate ? event.detail.selectedDate : '';
        this.calculateSelectedDateTimeString(event);

        //If date was updated then generate new time slots accordingly and update the date at parent
        if (this._selectedTimeSlot) {
            this.disableParentNextButton();
        }

        this.selectedDateTimeFromParent = '';
        // Reset the time slot section if selected date is updated
        this._selectedTimeSlot = this._timeSlotPlaceHolder;
        const timeSlotComponent = this.template.querySelector(TIME_SLOT_COMPONENT_SELECTOR);
        if (timeSlotComponent) {
            timeSlotComponent.selectedIndex = 0;
            this._selectedTimeSlot = this._timeSlotPlaceHolder;
        }
        this.generateTimeSlotsForSelectedRetailer();
    }

    /**
     * NBD2C-96
     * This method is used to generate the selected date and time string in Tuesday, 11.06.2024, 10:00 - 11:00, i.e. {week day name}, {day}.{month}.{year}, {hours}:{minutes} - {hours}:{minutes} format
     */
    calculateSelectedDateTimeString(event) {
        if (event && event.detail && event.detail.selectedDate) {
            let selectedDay = event.detail.selectedDate.getDay();

            // If the standard selected day is 0(Sunday) but our label starts from Monday, so to set value of sunday we check if selectedDay - 1 < 0 then
            // we set the selectedDay as 6 which is last index of week day label (Sunday)
            selectedDay = selectedDay - 1 < 0 ? 6 : selectedDay - 1;
            let dayName = WEEK_DAYS[selectedDay];

            // If date or month are less then 10 then append a 0 at the start of the date
            let date = event.detail.selectedDate.getDate() < 10 ? ZERO + event.detail.selectedDate.getDate() : event.detail.selectedDate.getDate();
            let month = event.detail.selectedDate.getMonth() + 1;
            month = month < 10 ? ZERO + month : month;
            let year = event.detail.selectedDate.getFullYear();
            this._selectedDateTimeValue = `${dayName}, ${date}.${month}.${year}`;
        }
    }

    /**
     * NBD2C-96
     * This method is used to generate the time slot values with one hour gap
     */
    generateTimeSlotsForSelectedRetailer() {
        // If previously selected date and time are present then we retrieve the date and convert it back to date format from
        // using the parseFormattedDate method
        if (this.selectedDateTimeFromParent) {
            let currentDate = this.selectedDateTimeFromParent.split(', ');
            currentDate.pop();
            currentDate = currentDate.join(', ');
            this._selectedDate = this.parseFormattedDate(currentDate);
        }

        // This variable store the current day selected by the user (Sunday - 0, Monday - 1,...)
        let day = this._selectedDate.getDay() - 1 < 0 ? 0 : this._selectedDate.getDay() - 1;

        // This variable is used to store the working hours for the selected day (9:00 - 18:00)
        let workingHours = this.retailerData.openingHours.periods[day];

        let openTime = new Date();
        let closeTime = new Date();

        // Set open time value
        workingHours && workingHours.open && workingHours.open.time ? openTime.setHours(parseInt(workingHours.open.time.slice(0, 2))) : '';
        workingHours && workingHours.open && workingHours.open.time ? openTime.setMinutes(parseInt(workingHours.open.time.slice(2))) : '';

        // Set close time value
        workingHours && workingHours.close && workingHours.close.time ? closeTime.setHours(parseInt(workingHours.close.time.slice(0, 2))) : '';
        workingHours && workingHours.close && workingHours.close.time ? closeTime.setMinutes(parseInt(workingHours.close.time.slice(2))) : '';

        // Generate time slots with one hour gap from opening time till closing time for selected week day
        if (openTime && closeTime) {
            this._timeSlotOptions = [];
            while (openTime < closeTime) {
                let optionText = `${openTime.getHours()}:${(openTime.getMinutes() < 10 ? ZERO : '') + openTime.getMinutes()} - `;
                let nextHour = new Date(openTime);
                nextHour.setHours(nextHour.getHours() + 1);
                if (nextHour > closeTime) {
                    nextHour = closeTime;
                }
                optionText += `${nextHour.getHours()}:${(nextHour.getMinutes() < 10 ? ZERO : '') + nextHour.getMinutes()}`;
                this._timeSlotOptions.push(optionText);
                openTime = nextHour;
            }
        }
    }

    /**
     * NBD2C-96
     * This method is used to handle the event when user selects a time slot
     */
    handleTimeSelection(event) {
        if (event && event.target && event.target.value && event.target.value != this._timeSlotPlaceHolder) {
            // Check if previously selected date and time are available
            if (this.selectedDateTimeFromParent) {
                let currentValue = this.selectedDateTimeFromParent ? this.selectedDateTimeFromParent.split(', ') : '';
                // If time is also present then update it with current value
                if (currentValue && currentValue.length > 2) {
                    this._selectedTimeSlot = currentValue.pop();
                    this._selectedDateTimeValue = currentValue.join(',');
                    this._selectedDateTimeValue += ', ' + event.target.value;
                }
                // else append the newly selected time
                else {
                    this._selectedTimeSlot = event.target.value;
                    this._selectedDateTimeValue += ', ' + event.target.value;
                }
            } else {
                // If currently selected date is there then split it
                let currentValue = this._selectedDateTimeValue ? this._selectedDateTimeValue.split(',') : '';

                // If time is present then remove it and append newly selected time
                if (currentValue && currentValue.length > 2) {
                    currentValue.pop();
                    this._selectedDateTimeValue = currentValue.join(', ');
                    this._selectedDateTimeValue += ', ' + event.target.value;
                }
                // Append newly selected time
                else {
                    this._selectedDateTimeValue += ', ' + event.target.value;
                }
                this._selectedTimeSlot = event.target.value;
            }
            this.sendDateAndTimeToParent(this._selectedDateTimeValue);
        }
        // Reset the time slot value and disable the next button on parent
        else {
            let currentValue = this._selectedDateTimeValue ? this._selectedDateTimeValue.split(',') : '';
            if (currentValue && currentValue.length > 2) {
                currentValue.pop();
                this._selectedDateTimeValue = currentValue.join(', ');
            }
            this.disableParentNextButton();
        }
    }

    /**
     * NBD2C-96
     * This method is used to send an event to parent to disable the next button
     */
    disableParentNextButton() {
        this.dispatchEvent(new CustomEvent(DISABLE_NEXT_BUTTON));
    }

    /**
     * NBD2C-96
     * This method is used to send date and time selected by user to parent d2c_checkout_container
     */
    sendDateAndTimeToParent(data) {
        this.dispatchEvent(
            new CustomEvent(DATE_TIME_SELECTION_EVENT, {
                detail: data
            })
        );
    }

    /**
     * NBD2C-96
     * This method is used to create a Date object from the formatted date
     */
    parseFormattedDate(formattedDate) {
        // Split the formatted date string
        const parts = formattedDate.split(', ');

        // Extract day, month, and year from the parts
        const day = parseInt(parts[1].split('.')[0]);
        const month = parseInt(parts[1].split('.')[1]);
        const year = parseInt(parts[1].split('.')[2]);

        // Create a Date object using extracted values
        const originalDate = new Date(year, month - 1, day);

        return originalDate;
    }

    /**
     * NBD2C-96
     * This method is used to toggle the opening hours section height for mobile devices when user click on it
     */
    async openingHoursClicked(event) {
        let container = await this.retrieveComponent(OPENING_HOURS_CONTAINER);
        if (window.outerWidth < 767 && container) {
            container.classList.toggle(MINIMIZE);
            if (this._isUpArrow) {
                this._isUpArrow = !this._isUpArrow;
                this.template.host.style.setProperty(BACKGROUND_URL_OPENINGHOURS, `url(${this._dropDownIcon})`);
            } else {
                this._isUpArrow = !this._isUpArrow;
                this.template.host.style.setProperty(BACKGROUND_URL_OPENINGHOURS, `url(${this._upArrowIcon})`);
            }
        }
    }
}
