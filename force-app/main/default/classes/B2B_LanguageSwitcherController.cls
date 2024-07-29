/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-07-14 17:09:09
 * @modify date 2022-07-14 17:09:09
 * @desc this class will handle the language change for commerce users
 */
public with sharing class B2B_LanguageSwitcherController {
    /**
     * @description getAvailableLanguages for the current webstore/community
     * @param String communityOrWebstoreId
     **/
    @AuraEnabled
    public static List<B2B_LanguageWrapper> getAvailableLanguages(String communityOrWebstoreId) {
        try {
            List<String> supportedlanguageCodes = B2B_Utils.getAvailableWebstoreLanguages(communityOrWebstoreId).split(';');
            List<B2B_LanguageWrapper> languages = new List<B2B_LanguageWrapper>();
            for (Schema.PicklistEntry pickListVal : User.LanguageLocaleKey.getDescribe().getPicklistValues()) {
                if (!supportedlanguageCodes.contains(pickListVal.getValue())) {
                    continue;
                }
                languages.add(new B2B_LanguageWrapper(pickListVal.getLabel(), pickListVal.getValue()));
            }
            return languages;
        } catch (Exception ex) {
            B2B_LogUtils.createInfoLog(ex.getMessage(), 'B2B_LanguageSwitcherController.getAvailableLanguages', communityOrWebstoreId);
            throw new AuraHandledException(System.Label.B2B_LOGIN_Generic_Error);
        }
    }

    /**
     * @description sets the commerce user language to the selected language
     * @author Matthias Lindner
     * @param  languageCode languageCode to be set on the user object
     */
    @AuraEnabled
    public static void setUserLanguage(String languageCode) {
        try {
            if (!UserInfo.getUserType().equalsIgnoreCase('Guest') && String.isNotBlank(languageCode)) {
                User currentUser = new User(Id = UserInfo.getUserId());
                currentUser.LanguageLocaleKey = languageCode;
                update currentUser;
            }
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_LanguageSwitcherController.setUserLanguage', languageCode);
            throw new AuraHandledException(System.Label.B2B_LOGIN_Generic_Error);
        }
    }

    /**
     * wrapper class to send the available languages into the frontend
     */
    public class B2B_LanguageWrapper {
        public B2B_LanguageWrapper(String label, String value) {
            this.label = label;
            this.value = value;
        }
        @AuraEnabled
        public String label { get; set; }
        @AuraEnabled
        public String value { get; set; }
    }
}
