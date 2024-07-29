import { api } from 'lwc';
import LightningModal from 'lightning/modal';

const STRING = 'string';
const PRIMARY = 'primary';
const SECONDARY = 'secondary';

export default class CommonModal extends LightningModal {
    /**
     * Sets the modal's title and assistive device label.
     * @type {string}
     * NBD2C-72
     */
    @api
    label;

    /**
     * An optional message to display to the customer.
     * @type {string}
     * NBD2C-72
     */
    @api
    message;

    /**
     * The label for the primary action. If no label is provided, the action is omitted.
     * @type {string}
     * NBD2C-72
     */
    @api
    primaryActionLabel;

    /**
     * The label for the secondary action. If no label is provided, the action is omitted.
     * @type {string}
     * NBD2C-72
     */
    @api
    secondaryActionLabel;

    /**
     * NBD2C-74
     * This variable holds the additional styling to be applied on the label(popup message)
     * @type {String}
     */
    @api
    headerTextStyling = '';

    /**
     * Whether to show the primary action.
     * @type {boolean}
     * @readonly
     * @private
     * NBD2C-72
     */
    get hasPrimaryAction() {
        return Boolean(this.primaryActionLabel);
    }

    /**
     * Whether to show the secondary action.
     * @type {boolean}
     * @readonly
     * @private
     * NBD2C-72
     */
    get hasSecondaryAction() {
        return Boolean(this.secondaryActionLabel);
    }

    /**
     * Whether the modal has a message/body.
     * @type {boolean}
     * @readonly
     * @private
     * NBD2C-72
     */
    get hasMessageText() {
        return typeof this.message === STRING && this.message.trim().length > 0;
    }

    /**
     * Handles the click on the primary action.
     * @readonly
     * @private
     * NBD2C-72
     */
    handlePrimaryAction() {
        this.handleAction(PRIMARY);
    }

    /**
     * Handles the click on the secondary action.
     * @readonly
     * @private
     * NBD2C-72
     */
    handleSecondaryAction() {
        this.handleAction(SECONDARY);
    }

    /**
     * This method dispatches either the primary or secondary action click event,
     * and ensures that the modal automatically closes itself, unless the consumer
     * calls {@link CustomEvent.prototype.preventDefault}.
     * @param {('primary' | 'secondary')} eventType
     *   The type of the emitted event
     * @private
     * NBD2C-72
     */
    handleAction(eventType) {
        const event = new CustomEvent(`${eventType}actionclick`, {
            cancelable: true,
            detail: {
                close: (result) => {
                    event.preventDefault();
                    this.close(result);
                }
            }
        });
        this.dispatchEvent(event);
        if (!event.defaultPrevented) {
            this.close(eventType);
        }
    }
}
