import { LightningElement, track, api } from 'lwc';

//NBD2C-96 : Import Labels
import APPOINTMENT_UTILITY_LABELS from '@salesforce/label/c.D2C_NB_Appointment_Section_Labels'; // NBD2C-96 Labels Appointment Section Container

// NBD2C-96 : Constants - Start
const LABELS = APPOINTMENT_UTILITY_LABELS.split(';');
const CALENDAR_MONTHS = LABELS[0].split(','); // "January, February, March, April, May, June, July, August, September, October, November, December"
const CALENDAR_WEEK_DAYS = LABELS[1].split(','); // "Monday, Tuesday, Wedesday, Thursday, Friday Saturday Sunday"
const DAYS_AFTER = 7;
const BACK = 'back';
const NEXT = 'next';
const NOT_ALLOWED = 'not allowed';
const NEXT_BUTTON_CLASS = '.nextButton';
const POINTER = 'pointer';
const CLASS = 'class';
const DAYS_UNTIL = 28;
const DISABLED = 'disabled';
const BRIGHT = 'bright';
const PREVIOUS_BUTTON_CLASS = '.previousButton';
const SELECTED_DATE = 'selecteddate';
const SELECTED = 'selected';
const SELECTED_CLASS = '.selected';
// NBD2C-96 : Constants - End

export default class D2C_CalendarComponent extends LightningElement {
    /**
     * NBD2C-96
     * This variable holds the days when the retailer is closed
     * @type {Array}
     */
    _closedDays = [];

    /**
     * NBD2C-96
     * This variable holds the date previously selected by user
     * @type {String}
     */
    @api
    selectedDateFromParent;

    /**
     * NBD2C-96
     * This variable holds the dates for the calendar
     * @type {String}
     */
    @track
    _calendarEntries = [];

    /**
     * NBD2C-96
     * This variable holds the value of the back button for month
     * @type {String}
     */
    _back = BACK;

    /**
     * NBD2C-96
     * This variable holds the value of the next button for month
     * @type {String}
     */
    _next = NEXT;

    /**
     * NBD2C-96
     * This variable holds the value for selected year by user
     * @type {String}
     */
    _calendarYear;

    /**
     * NBD2C-96
     * This variable holds the value for calendar month
     * @type {String}
     */
    _headerText;

    /**
     * NBD2C-96
     * This variable is used to toggle the visibility of Back button
     * @type {Boolean}
     */
    _disableBackButton = true;

    /**
     * NBD2C-96
     * This variable is used to toggle the visibility of Next button
     * @type {Boolean}
     */
    _disableNextButton = false;

    /**
     * NBD2C-96
     * This variable is used to store today's date
     * @type {Date}
     */
    _today = new Date();

    /**
     * NBD2C-96
     * This variable is used to store today's date for computing the total days to display (28 days)
     * @type {Boolean}
     */
    _totalDays = new Date();

    /**
     * NBD2C-96
     * This variable is used to set 7 days from today as selected date
     * @type {Date}
     */
    _dateSelected;

    /**
     * NBD2C-96
     * This variable is used to store the start date for the calendar
     * @type {Date}
     */
    _calendarStartDate;

    /**
     * NBD2C-96
     * This variable is used to store the start date for the retailer appointment selection
     * @type {Date}
     */
    _validRetailerAppointmentStartDate = new Date();

    /**
     * NBD2C-96
     * This method is used to calculate the Names for the week days (Mon, Tue,...)
     */
    get weekDays() {
        let weekDays = [];
        CALENDAR_WEEK_DAYS.forEach((weekDay) => {
            weekDays.push(weekDay.slice(0, 3));
        });
        return weekDays;
    }

    /**
     * NBD2C-96
     * This method is used to calculate the options for year
     */
    get calendarYearOptions() {
        this._calendarYear = this._today.getFullYear();
        let year = this._today.getFullYear();
        let data = [];
        let index = 0;

        // If current month is December then show current year and next year
        if (this._today.getMonth() == 11) {
            while (index < 2) {
                index++;
                data.push({
                    label: year.toString(),
                    value: year
                });
                year++;
            }
        } else {
            data.push({
                label: year.toString(),
                value: year
            });
        }
        return data;
    }

    /**
     * NBD2C-96
     * This method is used to save the day's when retailer is closed, and call's fillCalendarEntries method [0,1,2,3,4,5,6]
     */
    @api
    handleClosedDays(closedDays) {
        closedDays ? (this._closedDays = closedDays) : [];

        const date = new Date();
        date.setDate(date.getDate() + DAYS_AFTER); // update date to 7 days since today
        this._validRetailerAppointmentStartDate = date;

        /**
         * In case of sunday we get 0 from getDay() method and appointment represents sunday as 6, i.e.
         * If getDay() - 1 == -1 (SUNDAY) then set day as 6
         * else, set day as getDay() - 1
         */
        let day = this._validRetailerAppointmentStartDate.getDay() - 1 == -1 ? 6 : this._validRetailerAppointmentStartDate.getDay() - 1;
        while (this._closedDays.indexOf(day) != -1) {
            this._validRetailerAppointmentStartDate.setDate(this._validRetailerAppointmentStartDate.getDate() + 1);
            day = this._validRetailerAppointmentStartDate.getDay() - 1 == -1 ? 6 : this._validRetailerAppointmentStartDate.getDay() - 1;
        }
        this.fillCalendarEntries();
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
     * This method to preform pre-computations to display the calendar component
     */
    async connectedCallback() {
        this._today.setDate(this._today.getDate() + DAYS_AFTER); //update the value for today to 7 days from today
        this._calendarStartDate = this._today; // set the date to _calendarStartDate later to display the calender
        this._totalDays.setDate(this._totalDays.getDate() + DAYS_AFTER + DAYS_UNTIL); // set the last day until which user can select an appointment date

        // Check if previously selected date is there
        if (this.selectedDateFromParent) {
            // Split the date e.g. Tuesday, 16.07.2024, 15:00 - 16:00
            this.selectedDateFromParent = this.selectedDateFromParent.split(',');

            //remove the time from the list
            this.selectedDateFromParent.pop();

            //calculate the month as months are 0 indexed eg. January(0), February(1),...
            let month = parseInt(this.selectedDateFromParent[1].split('.')[1]) - 1;

            // check if the month is less the 9 if yes append a '0'
            month = month < 10 ? '0' + month : month.toString();

            // update the selectedDateFromParent for further computations
            this.selectedDateFromParent = `${this.selectedDateFromParent[0]}, ${this.selectedDateFromParent[1].split('.')[0]}.${month}.${
                this.selectedDateFromParent[1].split('.')[2]
            }`;

            // check if the month of selected date of user is of next month if yes set the calender start month to +1
            if (month > parseInt(this._calendarStartDate.getMonth())) {
                // set the value of month start to next month as user has selected a date from next month
                this._calendarStartDate.setMonth(this._calendarStartDate.getMonth() + 1);

                // retrieve next and previous button
                let nextButtonContainer = await this.retrieveComponent(NEXT_BUTTON_CLASS);
                let backButtonContainer = await this.retrieveComponent(PREVIOUS_BUTTON_CLASS);

                // disable the next button and enable the back button
                nextButtonContainer.style.opacity = 0.2;
                nextButtonContainer.style.cursor = NOT_ALLOWED;
                backButtonContainer.style.opacity = 1;
                backButtonContainer.style.cursor = POINTER;
                this._disableNextButton = true;
                this._disableBackButton = false;
            }
        }

        this.fillCalendarEntries();
    }

    /**
     * NBD2C-96
     * This method is used to set the Month name for calendar
     */
    setCalendarMonthName() {
        let calendarMonth = this._calendarStartDate.getMonth();
        let calendarMonthName = CALENDAR_MONTHS[calendarMonth];
        this._headerText = `${calendarMonthName}`;
    }

    /**
     * NBD2C-96
     * This method is used to generate the dates of the calendar
     * @param forMonth : The month to generate the dates for
     * @param forYear : The year to generate the dates for
     */
    generateDatesWithTails(forMonth, forYear) {
        let dates = [];
        let tailLeft = []; // Any previous month values
        let tailRight = []; // Any next month values
        let newDate = new Date(); // Todays date
        newDate.setDate(newDate.getDate() + DAYS_AFTER); // Add 7 days to today's date

        // Create a date object for the first day of the given month and year
        const firstOfMonth = new Date(forYear, forMonth, 1);
        let currentDate = new Date(forYear, forMonth, 1);

        // Responsible for setting the styling to the date
        let dateObject = (dateValue) => {
            let dates = {};
            dates.date = dateValue.getDate();
            dates.value = dateValue.getDate();
            dates.key = dateValue.toString();
            dates.day = CALENDAR_WEEK_DAYS[dateValue.getDay()].slice(0, 3);
            dates.fullDate = dateValue.toString();

            // If date is less then the start date (7 days from today) or greater then the end date(7 + 28) days from today set it disabled styling
            if (dateValue.valueOf() < newDate || dateValue.valueOf() > this._totalDays.valueOf()) {
                dates.classString = DISABLED;
            }
            // else styling indicating its selectable
            else {
                dates.classString = BRIGHT;
            }

            // Separate the date and time values from the previous selected date by user
            let previouslySelectedDateByUser = this.selectedDateFromParent ? this.selectedDateFromParent.split(', ')[1] : '';
            let date, year, month;

            // Set the date, year and month values
            if (previouslySelectedDateByUser) {
                date = previouslySelectedDateByUser.split('.')[0];
                month = previouslySelectedDateByUser.split('.')[1][1];
                year = previouslySelectedDateByUser.split('.')[2];
            }

            // If currently user selected date a date then set it as active
            if (this._dateSelected && this._dateSelected == dates.fullDate) {
                dates.classString = BRIGHT + ' ' + SELECTED;
            }
            // If previously selected date is not present then set the valid start date as selected
            else if (
                (this.selectedDateFromParent == '' || this.selectedDateFromParent == null || this.selectedDateFromParent == undefined) &&
                this._validRetailerAppointmentStartDate.getDate() == dateValue.getDate() &&
                this._validRetailerAppointmentStartDate.getMonth() == dateValue.getMonth() &&
                this._validRetailerAppointmentStartDate.getFullYear() == dateValue.getFullYear()
            ) {
                dates.classString = SELECTED + ' ' + BRIGHT;
                this.sendSelectedDateToParent(dateValue);
            }

            // If user previously selected a date then set it as active date
            else if (date == dateValue.getDate() && month == dateValue.getMonth() && year == dateValue.getFullYear()) {
                dates.classString = SELECTED + ' ' + BRIGHT;
            }
            return dates;
        };

        // populate the dates for previous month
        while (currentDate.getDay() - 1) {
            currentDate.setDate(currentDate.getDate() - 1);
            tailLeft.unshift(dateObject(currentDate));
        }

        // Populate the dates for the current month
        currentDate = firstOfMonth;
        while (currentDate.getMonth() === forMonth) {
            dates.push(dateObject(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Populate the dates for next month
        while (currentDate.getDay()) {
            tailRight.push(dateObject(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        tailRight.push(dateObject(currentDate));

        return [...tailLeft, ...dates, ...tailRight];
    }

    /**
     * NBD2C-96
     * This method is used to call the generateDatesWithTails and update the closed dates for the selected retailer
     */
    fillCalendarEntries() {
        this._calendarEntries = this.generateDatesWithTails(this._calendarStartDate.getMonth(), this._calendarStartDate.getFullYear());

        // Check for days retailer is closed and set style to those days accordingly
        this._closedDays
            ? this._closedDays.forEach((day) => {
                  day = day + 1; // As our week starts from Monday and standard week from Sunday so we increase day by 1
                  this._calendarEntries.forEach((entry, index) => {
                      index += 1;
                      if (index % day == 0) {
                          entry.classString = DISABLED;
                          day += 7;
                      }
                  });
              })
            : '';
        this.setCalendarMonthName();
    }

    /**
     * NBD2C-96
     * This method is used to set the styling for the currently selected date by user
     * @param toElement : Element to which styling is to be applied
     */
    updateUserSelectedDateStyling(toElement) {
        if (toElement && toElement.getAttribute(CLASS) && !toElement.getAttribute(CLASS).includes(DISABLED)) {
            let previousSelection = this.template.querySelectorAll(SELECTED_CLASS);

            // If previously selected date is there then remove its styling
            if (previousSelection && previousSelection.length && previousSelection.length > 0) {
                previousSelection.forEach((element) => {
                    element.classList = BRIGHT;
                });
            }
            if (!toElement.getAttribute(CLASS).includes(SELECTED)) {
                toElement.classList.add(SELECTED);
            }
        }
    }

    /**
     * NBD2C-96
     * This method is used to call updateUserSelectedDateStyling method when user selects a date from calendar and then sends the selected date to parent
     */
    handleCalendarEntryClick(event) {
        if (
            event &&
            event.target &&
            event.target.dataset &&
            event.target.dataset.date &&
            event.target.getAttribute(CLASS) &&
            event.target.getAttribute(CLASS) != DISABLED
        ) {
            this._dateSelected = new Date(event.target.dataset.date);
            this.sendSelectedDateToParent(this._dateSelected);
            this.updateUserSelectedDateStyling(event.target);
            return;
        }
        this.fillCalendarEntries();
    }

    /**
     * NBD2C-96
     * This method is used to send the data to parent
     * @param data : Data to be sent to parent
     */
    sendSelectedDateToParent(date) {
        this.dispatchEvent(
            new CustomEvent(SELECTED_DATE, {
                detail: {
                    selectedDate: date
                }
            })
        );
    }

    /**
     * NBD2C-96
     * This method is used to handle operations when user clicks the left button within month toggle section
     */
    handleLeftButtonClick(event) {
        if (this._disableBackButton == false) {
            // Set back button styling
            event.target.style.opacity = 0.2;
            event.target.style.cursor = NOT_ALLOWED;

            // Retrieve next button and set its styling
            let nextButton = this.template.querySelector(NEXT_BUTTON_CLASS);
            nextButton.style.opacity = 1;
            nextButton.style.cursor = POINTER;
            this._disableNextButton = false;
            this._disableBackButton = true;
            this._calendarStartDate.setMonth(this._calendarStartDate.getMonth() - 1);
            this.fillCalendarEntries();
        }
    }

    /**
     * NBD2C-96
     * This method is used to handle operations when user clicks the right button within month toggle section
     */
    handleRightButtonClick(event) {
        if (this._disableNextButton == false) {
            // Set next button styling
            event.target.style.opacity = 0.2;
            event.target.style.cursor = NOT_ALLOWED;

            // Retrieve back button and set its styling
            let previousButton = this.template.querySelector(PREVIOUS_BUTTON_CLASS);
            previousButton.style.opacity = 1;
            previousButton.style.cursor = POINTER;
            this._disableBackButton = false;
            this._disableNextButton = true;
            this._calendarStartDate.setMonth(this._calendarStartDate.getMonth() + 1);
            this.fillCalendarEntries();
        }
    }
}
