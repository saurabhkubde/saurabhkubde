/*************************************************************************************************************
 * Controller class for SH VTO/POS Store PLP page
 *  @author – Saurabh Kubde
 *  @email saurabh.kubde@theblueflamelabs.com
 *  @create date 2024-06-06
 ***************************************************************************************************************/
public without sharing class D2C_VTO_ProductCardController {
    /**
     * @description Get metadata for the color values and hex codes
     * @author Saurabh Kubde
     * @return   Map of Color Metadata
     */
    @AuraEnabled(cacheable=true)
    public static String getColorsMetadata() {
        Map<String, B2B_Color_Filters__mdt> mapColorCodes = B2B_Color_Filters__mdt.getAll();
        return JSON.serialize(mapColorCodes);
    }

    /**
     * @description Get picklistvalues for the provided picklist field
     * @author Saurabh Kubde
     * @return List of picklist values
     */
    @AuraEnabled(cacheable=true)
    public static List<D2C_VTO_PicklistValue> getPicklistValues(String objectApiName, String fieldApiName) {
        // Initialize the list to store picklist values
        List<D2C_VTO_PicklistValue> picklistValues = new List<D2C_VTO_PicklistValue>();

        if (String.isEmpty(objectApiName) == false && String.isEmpty(fieldApiName) == false) {
            // Get the describe result for the specified field
            List<Schema.PicklistEntry> picklistEntries = Schema.getGlobalDescribe()
                .get(objectApiName)
                .getDescribe()
                .fields.getMap()
                .get(fieldApiName)
                .getDescribe()
                .getPicklistValues();

            for (Schema.PicklistEntry entry : picklistEntries) {
                D2C_VTO_PicklistValue picklistValue = new D2C_VTO_PicklistValue();
                picklistValue.label = entry.getLabel();
                picklistValue.value = entry.getValue();
                picklistValues.add(picklistValue);
            }
        }

        return picklistValues;
    }

    /**
     * @description Wrapper class of picklist values
     * @author Saurabh Kubde
     */
    public class D2C_VTO_PicklistValue {
        @AuraEnabled
        public String label { get; set; }
        @AuraEnabled
        public String value { get; set; }
    }
}
