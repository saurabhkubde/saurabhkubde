/**
 * @author Sachin V
 * @email  Sachin.vispute@theblueflamelabs.com
 * @desc   This utility/service class contains all the reusable methods
 * NBD2C-29 : Created as part of NBD2C-29
 **/
//Suppressing PMD as there are multiple if-else nested structures, multiple fields, multiple public variables
@SuppressWarnings('PMD')
public without sharing class D2C_UtilityController {
    /**
     * NBD2C-29
     * @description This method is used to fetch product images from database for provided inputs
     * @author Sachin V
     * @param productIdsList    :   Collection(List type) contianing Ids of products for which the images to be fetched
     * @param productImageType  :   Type of image that needs to be fetched
     *                              Example : 1. Model Image
     *                                        2. Product Image
     * @param availableIn       :   Value of Store Type.
     *                              Example : D2C/B2B
     * @param activeValue       :   Status of Image that needs to be fetched (Active/Inactive)
     * @return productImageIdVSProductImagesMap    : Output Collection of type map having product Id as key and product images as value
     */
    @AuraEnabled(Cacheable=false)
    public static Map<Id, List<B2B_Product_Image__c>> getProductMedia(
        List<Id> productIdsList,
        String productImageType,
        String availableIn,
        Boolean activeValue
    ) {
        // Checking whether all input parameters are valid */
        if (productIdsList.isEmpty() == false && String.isNotBlank(productImageType) && String.isNotBlank(availableIn)) {
            Map<Id, List<B2B_Product_Image__c>> productImageIdVSProductImagesMap = new Map<Id, List<B2B_Product_Image__c>>();
            List<B2B_Product_Image__c> productMediaList = [
                SELECT
                    Id,
                    Name,
                    B2B_External_Id__c,
                    B2B_Image_Alt_Text__c,
                    B2B_Image_Order__c,
                    B2B_Image_Title__c,
                    B2B_Image_URL__c,
                    B2B_Product__c,
                    D2C_Active__c,
                    D2C_Available_In__c,
                    D2C_Product_Image_Type__c
                FROM B2B_Product_Image__c
                WHERE
                    D2C_Product_Image_Type__c = :productImageType
                    AND D2C_Available_In__c = :availableIn
                    AND D2C_Active__c = :activeValue
                    AND B2B_Product__c IN :productIdsList
            ];

            for (B2B_Product_Image__c productImage : productMediaList) {
                if (productImage != null && productImage.B2B_Product__c != null) {
                    if (productImageIdVSProductImagesMap.containsKey(productImage.B2B_Product__c)) {
                        productImageIdVSProductImagesMap.get(productImage.B2B_Product__c).add(productImage);
                    } else {
                        productImageIdVSProductImagesMap.put(productImage.B2B_Product__c, new List<B2B_Product_Image__c>{ productImage });
                    }
                }
            }
            if (productImageIdVSProductImagesMap.isEmpty() == false) {
                return productImageIdVSProductImagesMap;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     * @author Sachin V
     * @email  Sachin.vispute@theblueflamelabs.com
     * @description Retrieves records of Bfl_Country_to_Country_Code_Mapping__mdt type.
     * @return String Serialized JSON of Bfl_Country_to_Country_Code_Mapping__mdt records.
     * @throws AuraHandledException if an error occurs during record retrieval.
     * @NBD2C-65 Created as part of NBD2C-65
     **/
    @AuraEnabled(cacheable=true)
    public static String getCountryCodeMetadata() {
        try {
            Map<String, Bfl_Country_to_Country_Code_Mapping__mdt> countryCodeMetadataMap = Bfl_Country_to_Country_Code_Mapping__mdt.getAll();
            return JSON.serialize(countryCodeMetadataMap);
        } catch (Exception exceptionInstance) {
            throw new AuraHandledException(exceptionInstance.getMessage());
        }
    }

    /**
     * NBD2C-50
     * @description This method is used to fetch Section Content and Section Content Translation data based on language of store and matching with currently selected products model & salesconcept values
     * @author Sachin V
     * @param productIdsList    :   Collection(List type) containing productIds for which the section content records to be fetched
     * @param language          :   String representing the current language
     * @param sectionType       :   NBD2C-82 - String indicating the record type for records to be retireve from section content object
     * @return sectionContentForProvidedParentProductWrapperList    :  Returns a formatted collection of Section Content records
     */
    @AuraEnabled(Cacheable=false)
    public static List<D2C_SectionContentWrapper> getCollectionCardDetailsForPDP(List<Id> productIdList, String language, String sectionType) {
        // NBD2C-82 : Added additional check for sectionType
        if (productIdList.isEmpty() == false && String.isNotEmpty(sectionType)) {
            List<Product2> productList = [SELECT Id, B2B_Salesconcept__c, B2B_Model__c FROM Product2 WHERE Id IN :productIdList LIMIT 1];
            if (productList.isEmpty() == false && String.isNotBlank(productList[0].B2B_Salesconcept__c) && String.isNotBlank(productList[0].B2B_Model__c)) {
                List<D2C_SectionContentWrapper> sectionContentForProvidedParentProductWrapperList = new List<D2C_SectionContentWrapper>();
                String applicableLanguage;
                String applicableCountry;

                if (language.split('-').size() > 1) {
                    applicableLanguage = language.split('-')[0];
                    applicableCountry = language.split('-')[1];
                } else {
                    applicableLanguage = language.split('-')[0];
                    applicableCountry = language.split('-')[0];
                }

                List<D2C_SectionTranslations__c> sectionContentTranslationList = [
                    SELECT
                        Id,
                        D2C_IsActive__c,
                        D2C_Content__c,
                        D2C_TR_Language__c,
                        D2C_Country__c,
                        D2C_Brand__c,
                        D2C_TR_SectionHeader__c,
                        D2C_TR_Title__c,
                        D2C_TR_SubTitle__c,
                        D2C_TR_ButtonLabel__c,
                        D2C_TR_ButtonLink__c,
                        D2C_TR_ImageAltText__c,
                        D2C_Content__r.D2C_ImageUrl__c,
                        D2C_Content__r.D2C_SortOrder__c,
                        D2C_Content__r.RecordType.Name,
                        D2C_Content__r.D2C_SalesConcept__c,
                        D2C_Content__r.D2C_Model__c
                    FROM D2C_SectionTranslations__c
                    WHERE
                        D2C_IsActive__c = TRUE
                        AND D2C_Brand__c = :D2C_Constants.NEUBAU
                        AND D2C_TR_Language__c = :applicableLanguage
                        AND D2C_Country__c = :applicableCountry
                        AND D2C_Content__r.D2C_Model__c INCLUDES (:productList[0].B2B_Model__c)
                        AND D2C_Content__r.D2C_SalesConcept__c INCLUDES (:productList[0].B2B_Salesconcept__c)
                        AND D2C_Content__r.RecordType.Name = :sectionType //NBD2C-82
                    ORDER BY D2C_Content__r.D2C_SortOrder__c
                ];

                if (
                    sectionContentTranslationList.isEmpty() == false &&
                    sectionContentTranslationList[0].D2C_Content__c != null &&
                    String.isNotBlank(sectionContentTranslationList[0].D2C_Content__r.D2C_SalesConcept__c) &&
                    String.isNotBlank(sectionContentTranslationList[0].D2C_Content__r.D2C_Model__c)
                ) {
                    for (D2C_SectionTranslations__c sectionTranslation : sectionContentTranslationList) {
                        D2C_SectionContentWrapper sectionContentWrapper = new D2C_SectionContentWrapper();

                        sectionContentWrapper = generateSectionContentWrapper(
                            sectionTranslation.Id,
                            sectionTranslation.D2C_IsActive__c,
                            sectionTranslation.D2C_Brand__c,
                            sectionTranslation.D2C_TR_ImageAltText__c,
                            sectionTranslation.D2C_Content__r.D2C_ImageUrl__c,
                            sectionTranslation.D2C_TR_ButtonLabel__c,
                            sectionTranslation.D2C_TR_ButtonLink__c,
                            sectionTranslation.D2C_TR_SectionHeader__c,
                            sectionTranslation.D2C_TR_Title__c,
                            sectionTranslation.D2C_TR_SubTitle__c,
                            sectionTranslation.D2C_Content__r.D2C_SortOrder__c,
                            sectionTranslation.D2C_Content__r.RecordType.Name,
                            sectionTranslation.D2C_Content__r.D2C_Model__c,
                            sectionTranslation.D2C_Content__r.D2C_SalesConcept__c,
                            sectionTranslation.D2C_TR_Language__c,
                            sectionTranslation.D2C_Country__c
                        );

                        sectionContentForProvidedParentProductWrapperList.add(sectionContentWrapper);
                    }
                    if (sectionContentForProvidedParentProductWrapperList.isEmpty() == false) {
                        return sectionContentForProvidedParentProductWrapperList;
                    } else {
                        return null;
                    }
                } else {
                    List<D2C_SectionContent__c> sectionContentList = [
                        SELECT
                            Id,
                            D2C_Active__c,
                            D2C_Brand__c,
                            D2C_ButtonLabel__c,
                            D2C_ButtonLink__c,
                            D2C_ImageAltText__c,
                            D2C_ImageUrl__c,
                            D2C_SectionHeader__c,
                            D2C_SortOrder__c,
                            D2C_SubTitle__c,
                            D2C_Title__c,
                            RecordType.Name,
                            D2C_Model__c,
                            D2C_SalesConcept__c
                        FROM D2C_SectionContent__c
                        WHERE
                            D2C_Active__c = TRUE
                            AND D2C_Model__c INCLUDES (:productList[0].B2B_Model__c)
                            AND D2C_SalesConcept__c INCLUDES (:productList[0].B2B_Salesconcept__c)
                            AND D2C_Brand__c = :D2C_Constants.NEUBAU
                            AND RecordType.Name = :sectionType //NBD2C-82
                        ORDER BY D2C_SortOrder__c
                    ];
                    for (D2C_SectionContent__c sectionContent : sectionContentList) {
                        D2C_SectionContentWrapper sectionContentWrapper = new D2C_SectionContentWrapper();

                        sectionContentWrapper = generateSectionContentWrapper(
                            sectionContent.Id,
                            sectionContent.D2C_Active__c,
                            sectionContent.D2C_Brand__c,
                            sectionContent.D2C_ImageAltText__c,
                            sectionContent.D2C_ImageUrl__c,
                            sectionContent.D2C_ButtonLabel__c,
                            sectionContent.D2C_ButtonLink__c,
                            sectionContent.D2C_SectionHeader__c,
                            sectionContent.D2C_Title__c,
                            sectionContent.D2C_SubTitle__c,
                            sectionContent.D2C_SortOrder__c,
                            sectionContent.RecordType.Name,
                            sectionContent.D2C_Model__c,
                            sectionContent.D2C_SalesConcept__c,
                            null,
                            null
                        );

                        sectionContentForProvidedParentProductWrapperList.add(sectionContentWrapper);
                    }
                    if (sectionContentForProvidedParentProductWrapperList.isEmpty() == false) {
                        return sectionContentForProvidedParentProductWrapperList;
                    } else {
                        return null;
                    }
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     * NBD2C-50
     * @description This is a consolidated method that returns a wrapper of Section Content/Section Content Translation
     * @author Sachin V
     * @param recordId          : Section Content/Section Content Translation record Id
     * @param active            : Boolean to denote whether the record is active
     * @param brand             : String used to identify the D2C brand
     * @param imageAlternateText : String to display alternate text if the image is absent
     * @param imageLink         : String that holds the url of image
     * @param buttonLabel       : String that holds the label of button
     * @param buttonLink        : String that holds the link of redirection on the click of button
     * @param header            : String that stores the heading of card
     * @param title             : String that stores the title of card
     * @param subtitle          : String representing the subtitle of card
     * @param sortOrder         : Decimal that holds the sort order of records
     * @param type              : String that holds the recordType Name
     * @param model             : String that holds the model information
     * @param salesConcept      : String representing the salesConcept value
     * @param translationLanguage : String representing the language
     * @param applicableCountry : String to represent the applicable Country
     * @return SectionContentDataWrapper    :  Returns a formatted collection of Section Content records
     */
    public static D2C_SectionContentWrapper generateSectionContentWrapper(
        Id recordId,
        Boolean active,
        String brand,
        String imageAlternateText,
        String imageLink,
        String buttonLabel,
        String buttonLink,
        String header,
        String title,
        String subtitle,
        Decimal sortOrder,
        String type,
        String model,
        String salesConcept,
        String translationLanguage,
        String applicableCountry
    ) {
        D2C_SectionContentWrapper sectionContentDataWrapper = new D2C_SectionContentWrapper();

        sectionContentDataWrapper.recordId = recordId != null ? recordId : null;
        sectionContentDataWrapper.active = active ? active : false;
        sectionContentDataWrapper.brand = String.isNotBlank(brand) ? brand : null;
        sectionContentDataWrapper.imageAlternateText = String.isNotBlank(imageAlternateText) ? imageAlternateText : null;
        sectionContentDataWrapper.imageLink = String.isNotBlank(imageLink) ? imageLink : null;
        sectionContentDataWrapper.buttonLabel = String.isNotBlank(buttonLabel) ? buttonLabel : null;
        sectionContentDataWrapper.buttonLink = String.isNotBlank(buttonLink) ? buttonLink : null;
        sectionContentDataWrapper.header = String.isNotBlank(header) ? header : null;
        sectionContentDataWrapper.title = String.isNotBlank(title) ? title : null;
        sectionContentDataWrapper.subtitle = String.isNotBlank(subtitle) ? subtitle : null;
        sectionContentDataWrapper.sortOrder = sortOrder != null ? Integer.valueOf(sortOrder) : null;
        sectionContentDataWrapper.type = String.isNotBlank(type) ? type : null;
        sectionContentDataWrapper.model = String.isNotBlank(model) ? model : null;
        sectionContentDataWrapper.salesConcept = String.isNotBlank(salesConcept) ? salesConcept : null;
        sectionContentDataWrapper.translationLanguage = String.isNotBlank(translationLanguage) ? translationLanguage : null;
        sectionContentDataWrapper.applicableCountry = String.isNotBlank(applicableCountry) ? applicableCountry : null;

        return sectionContentDataWrapper;
    }

    /**
     * NBD2C-32
     * @author Shrihari Kendre
     * @description This method inserts/updates the contact and Account records based on the user inputs.
     **/
    @AuraEnabled(Cacheable=false)
    public static void handleEmailSubscription(String userInputValues, String currentBrand) {
        try {
            if (String.isNotBlank(userInputValues)) {
                Map<String, Object> userInputMap = (Map<String, Object>) JSON.deserializeUntyped(userInputValues);
                // Fetch the RecordType Id dynamically
                List<RecordType> b2cRecordTypeList = [
                    SELECT Id
                    FROM RecordType
                    WHERE DeveloperName = :D2C_Constants.B2C_CONSUMER_RECORD_TYPE AND SObjectType = :D2C_Constants.ACCOUNT_OBJECT
                    LIMIT 1
                ];
                Id b2cRecordTypeId = b2cRecordTypeList.isEmpty() == false ? b2cRecordTypeList[0].Id : null;
                // Step 2: Retrieve contact information from Salesforce
                List<Contact> contactList = [
                    SELECT Id, AccountId, B2C_Brand_Source__c, B2C_Brand_Interest__c, B2C_Marketing_Consent__c, B2C_Communication_Language__c
                    FROM Contact
                    WHERE Email = :(String) userInputMap.get(D2C_Constants.EMAIL) AND B2C_Is_B2C_Contact__c = TRUE
                ];
                if (contactList.isEmpty() == false) {
                    // Step 3.1: Check if a contact with the specified email already exists
                    Contact contact = contactList[0];
                    // Get and Update Brand Interest
                    String currentBrandInterest = String.isNotBlank(contact.B2C_Brand_Interest__c) ? contact.B2C_Brand_Interest__c : '';
                    String brandInterestToAdd = currentBrand == D2C_Constants.SH ? D2C_Constants.SILHOUETTE : D2C_Constants.NEUBAU;
                    String newBrandInterest = currentBrandInterest;

                    // Check if 'Neubau' is not in B2C_Brand_Interest__c
                    if (currentBrandInterest.contains(brandInterestToAdd) == false) {
                        if (String.isEmpty(currentBrandInterest)) {
                            newBrandInterest = brandInterestToAdd;
                        } else {
                            newBrandInterest = currentBrandInterest + ';' + brandInterestToAdd;
                        }
                    }

                    // Update the contact fields
                    contact.B2C_Brand_Interest__c = newBrandInterest;
                    contact.B2C_Marketing_Consent__c = true;

                    if (currentBrand == D2C_Constants.SH) {
                        contact.B2C_Preference_News_Announcements__c = true;
                        contact.B2C_Preference_Promotions_Product_Of__c = true;
                        contact.B2C_Is_Marketing_Cloud_Synced_Contact__c = true;
                        contact.B2C_Is_SH_B2C_newsletter_subscribed__c = true;
                        contact.B2C_Marketing_Consent_Date__c = System.now();
                        contact.B2C_SignIn_Type__c = 'POSShopCreated-SIL-NewsletterForm';
                        contact.B2C_SignIn_Date__c = System.now();
                        contact.B2C_Communication_Language__c = (String) userInputMap.get(D2C_Constants.LANGUAGE);
                    }

                    update contact;
                } else {
                    // Step 3.2.1: Create a new account with fetched record type
                    Account newAccount = new Account();
                    newAccount.RecordTypeId = b2cRecordTypeId;
                    newAccount.Name = (String) userInputMap.get(D2C_Constants.FIRST_NAME) + ' ' + (String) userInputMap.get(D2C_Constants.LAST_NAME);
                    insert newAccount;

                    // Step 3.2.2: Create a new contact with the data from the form and the supplied email
                    Contact newContact = new Contact();
                    newContact.Email = (String) userInputMap.get(D2C_Constants.EMAIL);
                    newContact.FirstName = (String) userInputMap.get(D2C_Constants.FIRST_NAME);
                    newContact.LastName = (String) userInputMap.get(D2C_Constants.LAST_NAME);
                    newContact.Salutation = (String) userInputMap.get(D2C_Constants.SALUTATION);
                    newContact.AccountId = newAccount.Id;
                    newContact.B2C_Marketing_Consent__c = true;
                    newContact.B2C_Communication_Language__c = (String) userInputMap.get(D2C_Constants.LANGUAGE);
                    newContact.B2C_Brand_Source__c = currentBrand == D2C_Constants.SH ? D2C_Constants.SILHOUETTE : D2C_Constants.NEUBAU;
                    newContact.B2C_Brand_Interest__c = currentBrand == D2C_Constants.SH ? D2C_Constants.SILHOUETTE : D2C_Constants.NEUBAU;
                    newContact.B2C_Country_Code__c = (String) userInputMap.get(D2C_Constants.COUNTRY);

                    if (currentBrand == D2C_Constants.SH) {
                        newContact.B2C_Preference_News_Announcements__c = true;
                        newContact.B2C_Preference_Promotions_Product_Of__c = true;
                        newContact.B2C_Is_Marketing_Cloud_Synced_Contact__c = true;
                        newContact.B2C_Is_SH_B2C_newsletter_subscribed__c = true;
                        newContact.B2C_Marketing_Consent_Date__c = System.now();
                        newContact.B2C_Email_Double_Opt_In_Status__c = 'pending';
                        newContact.B2C_SignIn_Type__c = 'POSShopCreated-SIL-NewsletterForm';
                        newContact.B2C_SignIn_Date__c = System.now();
                    }

                    insert newContact;
                }
            }
        } catch (Exception exceptionInstance) {
            throw new AuraHandledException(exceptionInstance.getMessage());
        }
    }

    /**
     * NBD2C-32
     * @author Shrihari Kendre
     *  @description This method is used to fetch the names of active countries from the Custom metadata
     */
    @AuraEnabled(cacheable=true)
    public static List<D2C_Supported_Newsletter_Countries__mdt> getSupportedCountries(String currentBrand) {
        return [
            SELECT toLabel(Country_Name__c), Country_Code__c, IsActive__c, IsPersonalDetails__c
            FROM D2C_Supported_Newsletter_Countries__mdt
            WHERE IsActive__c = TRUE AND Brand__c = :currentBrand
        ];
    }

    /**
     * NBD2C-32
     * @author Shrihari Kendre
     *  @description This method is used to fetch the names of active languages from the Custom metadata
     */
    @AuraEnabled(cacheable=true)
    public static List<D2C_Supported_Newsletter_Languages__mdt> getSupportedLanguages(String currentBrand) {
        return [
            SELECT toLabel(Language__c), Language_Code__c, IsActive__c
            FROM D2C_Supported_Newsletter_Languages__mdt
            WHERE IsActive__c = TRUE AND Brand__c = :currentBrand
        ];
    }

    /**
     * NBD2C-50
     * @author Sachin V
     * @desc   This wrapper holds the formatted Section Content Data.
     **/
    public class D2C_SectionContentWrapper {
        @AuraEnabled
        public Id recordId;

        @AuraEnabled
        public Boolean active;

        @AuraEnabled
        public String brand;

        @AuraEnabled
        public String imageAlternateText;

        @AuraEnabled
        public String imageLink;

        @AuraEnabled
        public String buttonLabel;

        @AuraEnabled
        public String buttonLink;

        @AuraEnabled
        public String header;

        @AuraEnabled
        public String title;

        @AuraEnabled
        public String subtitle;

        @AuraEnabled
        public Integer sortOrder;

        @AuraEnabled
        public String type;

        @AuraEnabled
        public String translationLanguage;

        @AuraEnabled
        public String applicableCountry;

        @AuraEnabled
        public String model;

        @AuraEnabled
        public String salesConcept;
    }
}
