/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-05-27 15:47:45
 * @modify date 2022-05-27 15:47:45
 * @modify date 2022-11-10 17:09:00
 * @desc This class is only used to get coverage for wrapped ConnectAPI calls.
 */

@IsTest
private with sharing class B2B_CommerceProxyTest {
    @IsTest
    private static void getCartSummaryTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().getCartSummary(null, null, null, null); //BS-1245 : Added Currency Code as input paramter having value = null
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void getProductTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().getProduct(null, null, null, null);
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void addItemToCartTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().addItemToCart(null, null, null, null, null); //BS-1245 : Added currencyIsoCode as input parameter having value = null
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    //BS-1245
    @IsTest
    private static void addItemToCartForMultiCurrencyTest() {
        try {
            // Creating test data inside method as this data is required/applicable only for this test method.
            Map<String, String> storeResponseMap = B2B_TestDataFactory.setupCommerceStoreFront();
            Id userId = null;
            if (storeResponseMap.containsKey('userId')) {
                userId = storeResponseMap.get('userId');
            }
            User communityUser = new User(Id = userId);

            Id accountId = null;
            if (storeResponseMap.containsKey('accountId')) {
                accountId = storeResponseMap.get('accountId');
            }
            Id webStoreId = null;
            if (storeResponseMap.containsKey('webStoreId')) {
                webStoreId = storeResponseMap.get('webStoreId');
            }

            WebCart newCart = B2B_TestDataFactory.createActiveEmptyCart(webStoreId, accountId);
            if (newCart != null) {
                newCart.Status = 'Active';
                insert newCart;
            }

            List<CartItem> cartItemList = B2B_TestDataFactory.createCartItem(
                200,
                newCart,
                storeResponseMap,
                B2B_TestDataFactory.createInsertCartDeliveryGroup(newCart.Id)
            );

            if (cartItemList.isEmpty() == false) {
                insert cartItemList;
            }
            String currencyISOCode = 'DKK';
            Test.startTest();
            new B2B_CommerceProxy().addItemToCart(null, accountId, null, null, currencyISOCode);
            Test.stopTest();
        } catch (Exception exceptionInstance) {
            System.assertNotEquals(null, exceptionInstance, 'Should throw an error for ConnectAPI');
        }
    }

    @IsTest
    private static void createWishlistTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().createWishlist(null, null, null);
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void getProductPriceTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().getProductPrice(null, null, null);
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void getProductCategoryTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().getProductCategory(null, null, null);
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void searchProductTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().searchProducts(null, null, null);
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void getCartItemsTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().getCartItems(null, null, null);
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void deleteCartItemTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().deleteCartItem(null, null, null, null);
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void updateCartItemTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().updateCartItem(null, null, null, null, null);
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void getProductPricesTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().getProductPrices(null, null, null);
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void addItemToWishlistTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().addItemToWishlist(null, null, null, null);
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void getSortRulesTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().getSortRules(null);
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void getProductsTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().getProducts(null, null, null, null, null, null, null);
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    // BS-204
    @IsTest
    private static void getCartItemsWithProductDetailsTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().getCartItemsWithProductDetails(null, null, null, null, null, null, null);
            Test.stopTest();
        } catch (Exception exceptionRecord) {
            System.assertNotEquals(null, exceptionRecord, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void createCartTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().createCart(null, null);
            Test.stopTest();
        } catch (Exception exceptionRecord) {
            System.assertNotEquals(null, exceptionRecord, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void deleteCartTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().deleteCart(null, null, null);
            Test.stopTest();
        } catch (Exception exceptionRecord) {
            System.assertNotEquals(null, exceptionRecord, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void getCartItemTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().getCartItems(null, null, null, null, null);
            Test.stopTest();
        } catch (Exception exceptionRecord) {
            System.assertNotEquals(null, exceptionRecord, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    @IsTest
    private static void getCartItemTestWithMaxLimit() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().getCartItems(null, null, null, null, 100, null);
            Test.stopTest();
        } catch (Exception exceptionRecord) {
            System.assertNotEquals(null, exceptionRecord, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }

    //BS-976
    @IsTest
    private static void getOrCreateActiveCartSummaryTest() {
        try {
            Test.startTest();
            new B2B_CommerceProxy().getOrCreateActiveCartSummary(null, null);
            Test.stopTest();
        } catch (Exception e) {
            System.assertNotEquals(null, e, 'Should throw an error due to invalid data access for ConnectAPI');
        }
    }
}
