/*************************************************************************************************************
 * This class will have all the constants needed at various places for D2C
 *
 * @author – Shrikant Dangi
 ***************************************************************************************************************/
public with sharing class D2C_VTO_Constants {
    // These constants have values from field: D2C_VTO_POS_Session__c.D2C_VTO_Status__c
    public static final String SESSION_STATUS_OPEN = 'Open';
    public static final String SESSION_STATUS_IN_PROGRESS = 'In Progress';
    public static final String SESSION_STATUS_CLOSED = 'Closed';

    // These constants have values from field: D2C_VTO_POS_Session_Activity__c.D2C_VTO_Command__c
    public static final String SA_COMMAND_QR_CODE_SCANNED = 'QR Code scanned';
    public static final String SA_COMMAND_OPEN_VTO_SESSION = 'Open VTO session';
    public static final String SA_COMMAND_CLOSE_VTO_SESSION = 'Close VTO session';

    /* Start : DVM21-45 */
    public static final String PRODUCT_IMAGE = 'Product Image';
    public static final String VTO_VALUE = 'VTO';
    /* End : DVM21-45 */
}
