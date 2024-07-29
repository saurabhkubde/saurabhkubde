import { LightningElement, api, track } from 'lwc';

import getContactPointAddresses from '@salesforce/apex/B2B_CPAController.getContactPointAddresses';
import getAccountAddressChange from '@salesforce/apex/B2B_CPAController.getAccountAddressChange';
import handleAddressChangeRequest from '@salesforce/apex/B2B_CPAController.handleAddressChangeRequest';
import sendMailForAddressChangeRequest from '@salesforce/apex/B2B_Utils.sendMailForAddressChangeRequest'; //Added as part of BS-866s
import Id from '@salesforce/user/Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//labels
import headline from '@salesforce/label/c.B2B_ACC_CPA_Headline';
import name from '@salesforce/label/c.B2B_ACC_CPA_Name';
import addresstype from '@salesforce/label/c.B2B_ACC_CPA_Address_Type';
import defaultaddress from '@salesforce/label/c.B2B_ACC_CPA_Address_Default';
import address from '@salesforce/label/c.B2B_ACC_CPA_Address';
import city from '@salesforce/label/c.B2B_ACC_CPA_City';
import state from '@salesforce/label/c.B2B_ACC_CPA_State';
import zip from '@salesforce/label/c.B2B_ACC_CPA_Zip';
import country from '@salesforce/label/c.B2B_ACC_CPA_Country';
import changerequest from '@salesforce/label/c.B2B_ACC_CPA_Request_Change';
import addaddress from '@salesforce/label/c.B2B_ACC_CPA_Add_Address';
import noaddress from '@salesforce/label/c.B2B_ACC_CPA_No_Address';
import openchange from '@salesforce/label/c.B2B_ACC_CPA_Open_Change';
import close from '@salesforce/label/c.B2B_ACC_OH_Close_Modal';
import requestShippingAddress from '@salesforce/label/c.B2B_Request_To_Add_Shipping_Address';
import shippingName from '@salesforce/label/c.B2B_Shipping_Name';
import shippingStreet from '@salesforce/label/c.B2B_Shipping_Street';
import shippingZipCode from '@salesforce/label/c.B2B_Shipping_Zip_Code';
import shippingCity from '@salesforce/label/c.B2B_Shipping_City';
import shippingState from '@salesforce/label/c.B2B_Shipping_StateOrProvince';
import shippingCountry from '@salesforce/label/c.B2B_Shipping_Country';
import comment from '@salesforce/label/c.B2B_Comment';
import sendRequestButtonLabel from '@salesforce/label/c.B2B_Send_Change_Request';
import changeRequestConfirmationMessage from '@salesforce/label/c.B2B_Change_Request_Confirmation_Text';
import billingAddressChangeHeader from '@salesforce/label/c.B2B_Billing_Address_Change_Header';
import billingAddressChangeOptionLabel from '@salesforce/label/c.B2B_Billing_Address_Change_Option_Label';
import addAddressOption from '@salesforce/label/c.B2B_Billing_Address_Change_Add';
import editAddressOption from '@salesforce/label/c.B2B_Billing_Address_Change_Edit';
import deleteAddressOption from '@salesforce/label/c.B2B_Billing_Address_Change_Delete';
import addressChangeRequestReason from '@salesforce/label/c.B2B_Billing_Address_Change_Reason_Label';
import changeAddressConfirmation from '@salesforce/label/c.B2B_Edit_Address_Confirmation_Message';
import deletOrEditShippingAddressHeader from '@salesforce/label/c.B2B_Delete_Or_Edit_Option_Label';
import deleteShippingAddressHeader from '@salesforce/label/c.B2B_Delete_Address_Form_Header';
import deleteShippingAddressButtonLabel from '@salesforce/label/c.B2B_Delete_Address_Button_Label';
import editShippingAddressHeader from '@salesforce/label/c.B2B_Request_Edit_Shipping_Address';
import tooShortTextError from '@salesforce/label/c.B2B_Minimum_TextBox_Length_Error';
import onlyWhiteSpaceError from '@salesforce/label/c.B2B_Textbox_White_Space_Error';
import errorMessageLabel from '@salesforce/label/c.B2B_Something_Went_Wrong';
import B2B_WARNING_LABEL from '@salesforce/label/c.B2B_warning_label'; // BS-688
import shipping from '@salesforce/label/c.B2B_ACC_CPA_SHIPPING'; //Added as a part of BS-1459
import billing from '@salesforce/label/c.B2B_ACC_CPA_BILLING'; //BS-1459
// STYLING IMPORT
import STORE_STYLING from '@salesforce/resourceUrl/B2B_StoreStyling'; //BS-688

import LANG from '@salesforce/i18n/lang'; //BS-866

const EDIT_ADDRESS_OPTION_LABEL = editAddressOption.toUpperCase(); //BS-688
const DELETE_ADDRESS_OPTION_LABEL = deleteAddressOption.toUpperCase(); //BS-688
const SEND_REQUEST_BUTTON_LABEL = sendRequestButtonLabel.toUpperCase(); //BS-688
const ADD_ADDRESS_BUTTON_LABEL = addaddress.toUpperCase(); //BS-688

const OPEN_CHANGE_LABEL = openchange.split(';')[0]; //BS-688
const THANK_YOU_LABEL = openchange.split(';')[1]; //BS-688
const OPEN_CHANGE_INSTRUCTION_LABEL = openchange.split(';')[2]; //BS-688
const GET_BACK_TO_YOU_LABEL = openchange.split(';')[3]; //BS-688
const THANK_YOU_AND_OPEN_CHANGE_INSTRUCTION_LABEL = THANK_YOU_LABEL + ' ' + OPEN_CHANGE_INSTRUCTION_LABEL; //BS-688
const DELETE_SHIPPING_ADDRESS_BUTTON_LABEL = deleteShippingAddressButtonLabel.toUpperCase(); //BS-688

const columns = [
    { label: name, fieldName: 'Name', cellAttributes: { alignment: 'left', style: 'padding: 0px' }, sortable: true, hideDefaultActions: 'true' },
    {
        label: addresstype,
        fieldName: 'AddressType',
        type: 'text',
        cellAttributes: { alignment: 'left', style: 'padding: 0px' },
        sortable: true,
        hideDefaultActions: 'true'
    },
    {
        label: defaultaddress,
        fieldName: 'IsDefault',
        type: 'boolean',
        cellAttributes: { alignment: 'left', style: 'padding: 0px' },
        sortable: true,
        hideDefaultActions: 'true'
    },
    {
        label: address,
        fieldName: 'Street',
        type: 'text',
        cellAttributes: { alignment: 'left', style: 'padding: 0px' },
        sortable: true,
        hideDefaultActions: 'true'
    },
    { label: city, fieldName: 'City', type: 'text', cellAttributes: { alignment: 'left', style: 'padding: 0px' }, sortable: true, hideDefaultActions: 'true' },
    {
        label: state,
        fieldName: 'State',
        type: 'text',
        cellAttributes: { alignment: 'left', style: 'padding: 0px' },
        sortable: true,
        hideDefaultActions: 'true'
    },
    {
        label: zip,
        fieldName: 'PostalCode',
        type: 'text',
        cellAttributes: { alignment: 'left', style: 'padding: 0px' },
        sortable: true,
        hideDefaultActions: 'true'
    },
    {
        label: country,
        fieldName: 'Country',
        type: 'text',
        cellAttributes: { alignment: 'left', style: 'padding: 0px' },
        sortable: true,
        hideDefaultActions: 'true'
    },
    {
        type: 'button',
        label: changerequest,
        typeAttributes: {
            label: changerequest,
            name: 'View',
            disabled: false,
            value: 'view',
            iconPosition: 'left',
            class: 'data-table-button',
            variant: 'brand'
        },
        cellAttributes: {
            style: 'padding: 0px;font-weight: 300!important'
        }
    }
];

export default class B2b_contactPointAddresses extends LightningElement {
    columns = columns;
    isLoading = false;
    @track addressChangeRequestParameter = {};
    showAddAddressModal = false;
    showAddAddressConfirmationMessage = false;
    hasAddressChange = false;
    showEditAddressModal = false;
    addresses = [];
    showBillingAddressModal = false;
    showAddressChangeConfirmationMessage = false;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;
    disableAddAddressProceedButton = true;
    disableEditBillingAddressProceedButton = true;
    disableEditShippingAddressProceedButton = true;
    showShippingAddressEditOrDeleteButton = false;
    showDeleteShippingAddressModal = false;
    showPrePopulatedShippingAddressModal = false;
    currentLoggedInUserId = Id;
    @api isSilhouetteLogin;
    disableDeleteShippingAddressProceedButton = true;

    label = {
        headline,
        addaddress,
        noaddress,
        openchange,
        close,
        requestShippingAddress,
        shippingName,
        shippingStreet,
        shippingZipCode,
        shippingCity,
        shippingState,
        shippingCountry,
        comment,
        changeRequestConfirmationMessage,
        billingAddressChangeHeader,
        billingAddressChangeOptionLabel,
        addAddressOption,
        addressChangeRequestReason,
        changeAddressConfirmation,
        deletOrEditShippingAddressHeader,
        deleteShippingAddressHeader,
        deleteShippingAddressButtonLabel,
        editShippingAddressHeader,
        tooShortTextError,
        onlyWhiteSpaceError,
        errorMessageLabel,
        deleteAddressOption,
        editAddressOption,
        SEND_REQUEST_BUTTON_LABEL, //BS-688
        ADD_ADDRESS_BUTTON_LABEL, //BS-688
        EDIT_ADDRESS_OPTION_LABEL, //BS-688
        DELETE_ADDRESS_OPTION_LABEL, //BS-688
        B2B_WARNING_LABEL, //BS-688
        OPEN_CHANGE_LABEL, //BS-688
        THANK_YOU_LABEL, //BS-688
        OPEN_CHANGE_INSTRUCTION_LABEL, //BS-688
        GET_BACK_TO_YOU_LABEL, //BS-688
        THANK_YOU_AND_OPEN_CHANGE_INSTRUCTION_LABEL, //BS-688
        DELETE_SHIPPING_ADDRESS_BUTTON_LABEL, //BS-688
        shipping, //BS-1459
        billing //BS-1459
    };

    /**
     * This Method is use to fetch info icon for alerting
     * BS-688
     * @returns alertIcon
     */
    get alertIcon() {
        let alertIcon;
        alertIcon = {
            icon: STORE_STYLING + '/icons/INFO.svg'
        };
        return alertIcon;
    }

    /**
     * This Method is use to fetch delete icon
     * BS-688
     * @returns deleteIcon
     */
    get deleteIcon() {
        let deleteIcon;
        deleteIcon = {
            icon: STORE_STYLING + '/icons/delete.svg'
        };
        return deleteIcon;
    }

    get options() {
        let optionList = [
            { label: this.label.addAddressOption, value: 'addBillingAddress' },
            { label: this.label.editAddressOption, value: 'editBillingAddress' },
            { label: this.label.deleteAddressOption, value: 'deleteBillingAddress' }
        ];
        return optionList;
    }

    get hasCPAs() {
        return this.addresses.length > 0 ? true : false;
    }

    get hasOpenChangeRequest() {
        return this.hasAddressChange;
    }

    connectedCallback() {
        this.isLoading = true;
        this.getCPAData();
        this.getAddressChange();
    }

    getCPAData() {
        getContactPointAddresses({})
            .then((result) => {
                this.addresses = result;
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    getAddressChange() {
        getAccountAddressChange({})
            .then((result) => {
                this.hasAddressChange = result;
            })
            .catch((error) => {
                console.log(error);
            });
    }

    openAddAddress() {
        this.addressChangeRequestParameter = {};
        this.showAddAddressModal = true;
        this.disableAddAddressProceedButton = true;
    }

    openEditAddress(event) {
        this.addressChangeRequestParameter = {};
        this.addressChangeRequestParameter.editAddressName = event.detail.row.Name;
        this.showEditAddressModal = true;
        let addType = event.detail.row.AddressType;
        if (addType === billing) {
            //BS-1459 : Removed hard coding
            this.disableEditBillingAddressProceedButton = true;
            this.showBillingAddressModal = true;
        } else if (addType === shipping) {
            //BS-1459 : Removed hard coding
            this.disableEditShippingAddressProceedButton = true;
            this.showShippingAddressEditOrDeleteButton = true;
            this.addressChangeRequestParameter.EditShippingAddress_Street = event.detail.row.Street;
            this.addressChangeRequestParameter.EditShippingAddress_PostalCode = event.detail.row.PostalCode;
            this.addressChangeRequestParameter.EditShippingAddress_City = event.detail.row.City;
            this.addressChangeRequestParameter.EditShippingAddress_Province = event.detail.row.State;
            this.addressChangeRequestParameter.EditShippingAddress_Country = event.detail.row.Country;
        }
    }

    closeModal() {
        this.showAddAddressModal = false;
        this.showAddAddressConfirmationMessage = false;
        this.showAddressChangeConfirmationMessage = false;
        this.showBillingAddressModal = false;
        this.showEditAddressModal = false;
        this.showShippingAddressEditOrDeleteButton = false;
        this.showDeleteShippingAddressModal = false;
        this.showPrePopulatedShippingAddressModal = false;
    }

    openEditShippingAddressModal() {
        this.showShippingAddressEditOrDeleteButton = false;
        this.showPrePopulatedShippingAddressModal = true;
    }

    openDeleteShippingAddressModal() {
        this.showShippingAddressEditOrDeleteButton = false;
        this.showDeleteShippingAddressModal = true;
        this.disableDeleteShippingAddressProceedButton = false;
    }

    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach((inputField) => {
            if (!inputField.checkValidity()) {
                isValid = false;
            }
            inputField.reportValidity();
        });
        return isValid;
    }

    openAddAddressConfirmationModal(event) {
        if (this.isInputValid()) {
            this.isLoading = true;
            this.addressChangeRequestParameter.requestType = event.target.name;
            this.processAddressChangeRequest();
            this.disableAddAddressProceedButton = true;
        }
    }

    openEditAddressConfirmationModal(event) {
        if (this.isInputValid()) {
            this.isLoading = true;
            this.addressChangeRequestParameter.requestType = event.target.name;
            this.processAddressChangeRequest();
            this.disableEditBillingAddressProceedButton = true;
            this.disableEditShippingAddressProceedButton = true;
            this.disableDeleteShippingAddressProceedButton = true;
        }
    }

    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    genericOnChange(event) {
        if (event.target.value) {
            event.target.setCustomValidity(event.target.value.trim().length < 3 ? this.label.tooShortTextError : '');
            this.addressChangeRequestParameter[event.target.name] = event.target.value;
            /* Start : BS-1520 */
        } else {
            event.target.setCustomValidity(event.target.value.trim().length != 0 && event.target.value.trim().length < 3 ? this.label.tooShortTextError : '');
            this.addressChangeRequestParameter[event.target.name] = event.target.value;
            /* End : BS-1520 */
        }
        let validityOfInput = this.isInputValid();
        this.disableEditBillingAddressProceedButton = !validityOfInput;
        this.disableEditShippingAddressProceedButton = !validityOfInput;
        this.disableAddAddressProceedButton = !validityOfInput;
    }

    onHandleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.addresses];
        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.addresses = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

    async processAddressChangeRequest() {
        await handleAddressChangeRequest({
            addressChangeInputMap: this.addressChangeRequestParameter,
            currentLoggedInUserId: this.currentLoggedInUserId,
            isSilhouetteLogin: this.isSilhouetteLogin
        })
            .then((result) => {
                if (result === 'Success') {
                    this.sendMailForAddressUpdate(); //Added as part of BS-866
                    if (this.addressChangeRequestParameter.requestType === 'addShippingAddress') {
                        this.showAddAddressConfirmationMessage = true;
                    } else {
                        this.showAddressChangeConfirmationMessage = true;
                        this.showBillingAddressModal = false;
                        this.showPrePopulatedShippingAddressModal = false;
                        this.showDeleteShippingAddressModal = false;
                        this.disableDeleteShippingAddressProceedButton = false;
                    }
                } else {
                    let toastEvent = new ShowToastEvent({
                        message: result,
                        variant: 'error',
                        mode: 'sticky'
                    });
                    this.dispatchEvent(toastEvent);
                }
            })
            .catch((error) => {
                let toastEvent = new ShowToastEvent({
                    message: this.label.errorMessageLabel,
                    variant: 'error',
                    mode: 'sticky'
                });
                this.dispatchEvent(toastEvent);
                console.log('error', error);
            })
            .finally(() => {
                this.isLoading = false;
                if (this.addressChangeRequestParameter.requestType === 'addShippingAddress') {
                    this.disableAddAddressProceedButton = false;
                } else {
                    this.disableEditBillingAddressProceedButton = false;
                    this.disableEditShippingAddressProceedButton = false;
                    this.disableDeleteShippingAddressProceedButton = false;
                }
            });
    }

    /**
     * This Method is used send the mail to user for change of address
     * BS-866
     */
    async sendMailForAddressUpdate() {
        await sendMailForAddressChangeRequest({
            language: LANG,
            isSilhouetteSite: this.isSilhouetteLogin
        }).catch((error) => {
            console.log(error);
        });
    }
}
