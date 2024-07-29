/**
 * @author Sachin V
 * @email Sachin.vispute@theblueflamelabs.com
 * @description This controller class of Retailer Search Page is used for server-side functions for Retailer Search Functionality
 * NBD2C-65: Created as part of NBD2C-65
 **/
public without sharing class D2C_Retailer_Search_Controller {
    private static List<D2C_RetailerInformationWrapper> retailerInformationList { get; set; } // Collection that holds information of retailers
    public static String retailerInformation { get; set; } // Consolidated retailer information in stringified format

    /**
     * NBD2C-65
     * @author Sachin V
     * This constructor is used to fetch retailer information from the server
     */
    public D2C_Retailer_Search_Controller() {
        retailerInformationList = new List<D2C_RetailerInformationWrapper>();
        List<String> countryCodesList = System.Label.D2C_RetailerCountryCodes.split(',');
        List<String> partnerProgramList = System.Label.D2C_PartnerProgramValues.split(',');
        Integer counter = 0;
        if (!countryCodesList.isEmpty() && !partnerProgramList.isEmpty()) {
            for (Account account : [
                SELECT
                    Name,
                    BillingCountry,
                    BillingLatitude,
                    BillingLongitude,
                    Country_Code__c,
                    BillingState,
                    BillingCity,
                    BillingStreet,
                    BillingPostalCode,
                    k_Partner_Program_NB__c,
                    Website,
                    Phone
                FROM Account
                WHERE
                    k_Partner_Program_NB__c IN :partnerProgramList
                    AND Country_Code__c IN :countryCodesList
                    AND k_Stage__c = :D2C_Constants.ACCOUNT
                    AND BillingLongitude != NULL
                    AND BillingLatitude != NULL
            ]) {
                D2C_Location retailerLocation = new D2C_Location();
                retailerLocation.lat = account.BillingLatitude; // Keeping it as 'lat' as it's required by Google Maps for latitude
                retailerLocation.lng = account.BillingLongitude; // Keeping it as 'lng' as it's required by Google Maps for longitude

                D2C_RetailerInformationWrapper retailerInformationWrapper = new D2C_RetailerInformationWrapper();
                retailerInformationWrapper.location = retailerLocation;
                retailerInformationWrapper.value = counter;
                retailerInformationWrapper.title = String.isNotBlank(account.Name) ? account.Name : '';
                retailerInformationWrapper.website = String.isNotBlank(account.Website) ? account.Website : '';
                retailerInformationWrapper.description =
                    (String.isNotBlank(account.BillingStreet) ? account.BillingStreet + ' ' : '') +
                    (String.isNotBlank(account.BillingCity) ? account.BillingCity + ' ' : '') +
                    (String.isNotBlank(account.BillingPostalCode) ? account.BillingPostalCode + ' ' : '') +
                    (String.isNotBlank(account.BillingState) ? account.BillingState + ' ' : '');
                retailerInformationWrapper.phone = account.Phone != null && account.Phone.length() > 0 ? account.Phone : '';
                retailerInformationWrapper.premium = account.k_Partner_Program_NB__c != null
                    ? account.k_Partner_Program_NB__c == D2C_Constants.PREMIUM
                          ? true
                          : account.k_Partner_Program_NB__c == D2C_Constants.LIGHTHOUSE ? true : false
                    : false;
                retailerInformationList.add(retailerInformationWrapper);
                counter += 1;
            }
        }

        // Convert the wrapper into a string and save it as retailerInformation to be accessed by the VF page
        retailerInformation = JSON.serialize(retailerInformationList);
    }

    /**
     * NBD2C-65
     * @author Sachin V
     * This class is used as a wrapper for storing Location.
     */
    class D2C_Location {
        private Decimal lat { get; set; } // Required by Google Maps to display latitude
        private Decimal lng { get; set; } // Required by Google Maps to display longitude
    }

    /**
     * NBD2C-65
     * @author Sachin V
     * This class is used as a wrapper for structuring the data to be sent back to the VF page for displaying the retailer information
     */
    class D2C_RetailerInformationWrapper {
        private D2C_Location location { get; set; }
        private Integer value { get; set; }
        private String title { get; set; }
        private String website { get; set; }
        private String description { get; set; }
        private String phone { get; set; }
        private Boolean premium { get; set; }
    }
}
