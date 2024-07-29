// createUserFromFieldSet.js
import { LightningElement, track, wire } from 'lwc';
import createUser from '@salesforce/apex/B2B_IdentityUserCreationController.createUser';
import createAccountContact from '@salesforce/apex/B2B_IdentityUserCreationController.createAccountContact';
import rollbackAccountCreationOnFailure from '@salesforce/apex/B2B_IdentityUserCreationController.rollbackAccountCreationOnFailure';
import getFieldSetData from '@salesforce/apex/B2B_IdentityUserCreationController.getFieldSetData';
import getPicklistValues from '@salesforce/apex/B2B_VisionSensation_RX_Controller.getFieldPicklistValues';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import requiredFields from '@salesforce/label/c.B2B_Identity_User_Required_Fields';
import USER_FIELD_SET_NAME from '@salesforce/label/c.B2B_Identity_User_Field_Set_Name';
import userCreationErrorMessages from '@salesforce/label/c.B2B_Identity_User_Creation_Error_Message';
import somethingWentWrongError from '@salesforce/label/c.B2B_Something_Went_Wrong';
import federationHelpText from '@salesforce/label/c.B2B_Identity_User_Federation_Help_Text';
const WHITE_SPACE_ONLY_REGEX = /^\s*$/;
const PHONE_PATTERN = /^[0-9() -]*$/;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const FEDERATION_IDENTIFIER = 'FederationIdentifier';
const USER = 'User';
const ALIAS = 'Alias';
const USERNAME = 'Username';
const EMAIL = 'Email';
const PHONE = 'Phone';

export default class B2B_identityusercomponent extends NavigationMixin(LightningElement) {
    @track fields = []; // Holds field set fields and their values
    @track requiredIdentityFields = requiredFields.split(',');
    messageForRequiredField = userCreationErrorMessages.split(',')[6];
    helpTextMessage = federationHelpText;
    @track emptyFields = [];
    @track picklistFieldsMap = {};
    @track fieldsValid = true;
    @track contactId;
    @track _isLoading = false;
    _error;

    messageForMaxAliasLength = userCreationErrorMessages.split(',')[2];
    messageForIncorrectPhone = userCreationErrorMessages.split(',')[3];
    messageForIncorrectEmail = userCreationErrorMessages.split(',')[4];
    messageForIncorrectUsername = userCreationErrorMessages.split(',')[5];

    // Load field set data from the server
    @wire(getFieldSetData, { objectName: USER, fieldSetName: USER_FIELD_SET_NAME })
    async wiredFieldSet({ error, data }) {
        if (data) {
            this.fields = JSON.parse(JSON.stringify(data)).map((field) => ({
                fieldApiName: field.fieldApiName,
                fieldLabel: field.fieldLabel,
                fieldValue: field.fieldType == 'BOOLEAN' ? false : '',
                fieldType: field.fieldType,
                isRequired: this.requiredIdentityFields.includes(field.fieldApiName),
                isValid: true,
                isFederationIdentifier: field.fieldApiName == FEDERATION_IDENTIFIER ? true : false,
                isAliasMaxLength: false,
                isPhoneCorrect: true,
                isUserNameCorrect: true,
                isEmailCorrect: true,
                isPhone: field.fieldType == 'PHONE' ? true : false,
                isEmail: field.fieldType == 'EMAIL' ? true : false,
                isText: field.fieldType == 'STRING' ? true : false,
                isPicklist: field.fieldType == 'PICKLIST' ? true : false,
                isCheckbox: field.fieldType == 'BOOLEAN' ? true : false,
                picklistOptions: {}
            }));

            this.formatFields();
        } else if (error) {
            console.error('error-->', error);
            this._error = error;
        }
    }

    async formatFields() {
        let tempFields = JSON.parse(JSON.stringify(this.fields));

        for (let index = 0; index < tempFields.length; index++) {
            const item = tempFields[index];

            if (item.isPicklist) {
                const picklistOptions = await this.getPicklistValuesForFields(USER, item.fieldApiName);
                item.picklistOptions = picklistOptions;
            }
        }

        this.fields = JSON.parse(JSON.stringify(tempFields));
    }

    async getPicklistValuesForFields(objectName, fieldName) {
        try {
            const result = await getPicklistValues({ objectApiName: objectName, picklistField: fieldName });

            if (result) {
                const picklistOptions = result.picklistValues.map((item) => ({
                    label: item.picklistValue,
                    value: item.apiName
                }));

                return picklistOptions;
            }
        } catch (errorMsg) {
            console.error('Error Message :', errorMsg);
        }
    }

    // Handle changes to input fields
    handleFieldChange(event) {
        const fieldLabel = event.target.label;
        const fieldValue = event.target.value;

        // Update field values
        this.fields = this.fields.map((field) => (field.fieldLabel === fieldLabel ? { ...field, fieldValue } : field));

        const foundField = this.fields.find((field) => field.fieldLabel === fieldLabel);

        if (
            (WHITE_SPACE_ONLY_REGEX.test(foundField.fieldValue) || foundField.fieldValue == '') &&
            this.requiredIdentityFields.includes(foundField.fieldApiName)
        ) {
            foundField.isValid = false;
        } else {
            foundField.isValid = true;
        }

        if (fieldLabel === ALIAS && fieldValue.length > 8) {
            foundField.isAliasMaxLength = true;
        } else {
            foundField.isAliasMaxLength = false;
        }

        if (fieldLabel === PHONE && PHONE_PATTERN.test(fieldValue) != true) {
            foundField.isPhoneCorrect = false;
        } else {
            foundField.isPhoneCorrect = true;
        }

        if (fieldLabel === EMAIL && EMAIL_PATTERN.test(fieldValue) != true && fieldValue != '') {
            foundField.isEmailCorrect = false;
        } else {
            foundField.isEmailCorrect = true;
        }

        if (fieldLabel === USERNAME && EMAIL_PATTERN.test(fieldValue) != true && fieldValue != '') {
            foundField.isUserNameCorrect = false;
        } else {
            foundField.isUserNameCorrect = true;
        }
    }

    handleCheckboxChange(event) {
        const fieldLabel = event.target.label;
        const fieldValue = event.target.checked;

        // Update field values
        this.fields = this.fields.map((field) => (field.fieldLabel === fieldLabel ? { ...field, fieldValue } : field));

        const foundField = this.fields.find((field) => field.fieldLabel === fieldLabel);

        if (
            (WHITE_SPACE_ONLY_REGEX.test(foundField.fieldValue) || foundField.fieldValue == '') &&
            this.requiredIdentityFields.includes(foundField.fieldApiName)
        ) {
            foundField.isValid = false;
        } else {
            foundField.isValid = true;
        }
    }

    handlePicklistFieldChange(event) {
        let fieldName = event.target.dataset.field;
        let fieldValue = event.detail.value;
        // Update field values
        this.fields = this.fields.map((field) => (field.fieldLabel === fieldName ? { ...field, fieldValue } : field));

        const foundField = this.fields.find((field) => field.fieldLabel === fieldName);

        if (
            (WHITE_SPACE_ONLY_REGEX.test(foundField.fieldValue) || foundField.fieldValue == '') &&
            this.requiredIdentityFields.includes(foundField.fieldApiName)
        ) {
            foundField.isValid = false;
        } else {
            foundField.isValid = true;
        }
    }

    // Create a new user
    handleSubmit() {
        const userFields = {};
        this.emptyFields = [];
        this.fieldsValid = true;
        //Handle required fields
        this.fields.forEach((field) => {
            userFields[field.fieldApiName] = field.fieldValue;
            if ((WHITE_SPACE_ONLY_REGEX.test(field.fieldValue) || field.fieldValue == '') && this.requiredIdentityFields.includes(field.fieldApiName)) {
                this.emptyFields.push({
                    fieldApiName: field.fieldApiName,
                    fieldLabel: field.fieldLabel,
                    fieldValue: field.fieldValue,
                    fieldType: field.fieldType,
                    isRequired: this.requiredIdentityFields.includes(field.fieldApiName),
                    isValid: false,
                    isFederationIdentifier: field.fieldApiName == FEDERATION_IDENTIFIER ? true : false,
                    isAliasMaxLength: field.isAliasMaxLength,
                    isPhoneCorrect: field.isPhoneCorrect,
                    isUserNameCorrect: field.isUserNameCorrect,
                    isEmailCorrect: field.isEmailCorrect,
                    isPhone: field.fieldType == 'PHONE' ? true : false,
                    isEmail: field.fieldType == 'EMAIL' ? true : false,
                    isText: field.fieldType == 'STRING' ? true : false,
                    isPicklist: field.fieldType == 'PICKLIST' ? true : false,
                    isCheckbox: field.fieldType == 'BOOLEAN' ? true : false,
                    picklistOptions: field.picklistOptions
                });
                this.fieldsValid = false;
            } else {
                this.emptyFields.push({
                    fieldApiName: field.fieldApiName,
                    fieldLabel: field.fieldLabel,
                    fieldValue: field.fieldValue,
                    fieldType: field.fieldType,
                    isRequired: this.requiredIdentityFields.includes(field.fieldApiName),
                    isValid: true,
                    isFederationIdentifier: field.fieldApiName == FEDERATION_IDENTIFIER ? true : false,
                    isAliasMaxLength: field.isAliasMaxLength,
                    isPhoneCorrect: field.isPhoneCorrect,
                    isUserNameCorrect: field.isUserNameCorrect,
                    isEmailCorrect: field.isEmailCorrect,
                    isPhone: field.fieldType == 'PHONE' ? true : false,
                    isEmail: field.fieldType == 'EMAIL' ? true : false,
                    isText: field.fieldType == 'STRING' ? true : false,
                    isPicklist: field.fieldType == 'PICKLIST' ? true : false,
                    isCheckbox: field.fieldType == 'BOOLEAN' ? true : false,
                    picklistOptions: field.picklistOptions
                });
            }
        });

        this.fields = this.emptyFields;

        this.fields.forEach((field) => {
            if (field.isAliasMaxLength === true || field.isPhoneCorrect === false || field.isEmailCorrect === false || field.isUserNameCorrect === false) {
                this.fieldsValid = false;

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error Occurred',
                        message: userCreationErrorMessages.split(',')[1],
                        variant: 'error'
                    })
                );
            }
        });

        if (this.fieldsValid) {
            this._isLoading = true;
            //BS-1923
            createAccountContact({ userFields })
                .then((result) => {
                    if (result != null && result != undefined) {
                        this.contactId = result;
                        this.handleCreateUser(userFields, this.contactId);
                    }
                })
                .catch((error) => {
                    console.error('Error while creating user : ', error);
                    //BS-1923
                    this._isLoading = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error Occurred',
                            message: somethingWentWrongError,
                            variant: 'error'
                        })
                    );
                });
        } //end if
    }

    performNavigation(result) {
        this[NavigationMixin.Navigate](
            {
                type: 'standard__recordPage',
                attributes: {
                    recordId: result,
                    actionName: 'view'
                }
            },
            {
                target: '_blank' // Opens in a new tab or window
            }
        );
    }

    handleCreateUser(userFields, contactId) {
        // Call Apex method to create the user
        createUser({ userFields, contactId })
            .then((result) => {
                // Handle success
                if (result != null && result != undefined) {
                    this._isLoading = false;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'User Created Successfully.',
                            variant: 'success'
                        })
                    );

                    this.performNavigation(result);
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                } //end if
            })
            .catch((error) => {
                this._isLoading = false;
                //BS-1923
                if (this.contactId != null && this.contactId != undefined) {
                    rollbackAccountCreationOnFailure({ contactId: this.contactId })
                        .then((result) => {})
                        .catch((innerError) => {
                            console.error('Error while creating user : ', innerError);
                        });
                }

                console.error('Error while creating user : ', error);

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error Occurred',
                        message: userCreationErrorMessages.split(',')[0],
                        variant: 'error'
                    })
                );
                this._error = error;
            });
    }
}
