@IsTest
public with sharing class B2B_LanguageSwitcherControllerTest {
    @IsTest
    public static void getAvailableLanguagesTest() {
        WebStore testStore = new WebStore(Name = 'TestStore', supportedLanguages = 'en_US;de');
        insert testStore;
        try {
            B2B_LanguageSwitcherController.getAvailableLanguages(null);
        } catch (Exception e) {
            //Coverage only
        }
        List<B2B_LanguageSwitcherController.B2B_LanguageWrapper> languages = B2B_LanguageSwitcherController.getAvailableLanguages(testStore.Id);
        System.assertEquals(false, languages.isEmpty(), ' No language found');
        System.assertEquals(2, languages.size(), ' No language found');
    }

    @IsTest
    public static void setLanguageTest() {
        User testUser = B2B_TestDataFactory.createInsertCommerceUser();
        User testUserBeforeChange = [SELECT Id, LanguageLocaleKey FROM User WHERE Id = :testUser.Id];
        System.assertEquals('en_US', testUserBeforeChange.LanguageLocaleKey, 'User language should be en_US before');
        Test.startTest();
        System.runAs(testUser) {
            B2B_LanguageSwitcherController.setUserLanguage('de');
        }
        User testUserAfterChange = [SELECT Id, LanguageLocaleKey FROM User WHERE Id = :testUser.Id];
        System.assertEquals('de', testUserAfterChange.LanguageLocaleKey, 'User language should be changed');
    }
}
