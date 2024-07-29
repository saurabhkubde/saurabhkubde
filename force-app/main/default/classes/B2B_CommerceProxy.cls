/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-05-27 15:42:34
 * @modify date 2022-05-27 15:42:34
 * @modify date 2022-11-10 17:09:00
 * @desc Proxy class for ConnectApi Commerce calls (to avoid @seeAllData)
 */

public with sharing class B2B_CommerceProxy {
    //BS-1245 : Added 'currencyCode' as input parameter
    public ConnectApi.CartSummary getCartSummary(String webstoreId, String effectiveAccountId, String activeCartOrId, String currencyCode) {
        return ConnectApi.CommerceCart.getCartSummary(webstoreId, effectiveAccountId, activeCartOrId, currencyCode);
    }
    public ConnectApi.CartItemCollection getCartItems(String webstoreId, String effectiveAccountId, String activeCartOrId) {
        return ConnectApi.CommerceCart.getCartItems(webstoreId, effectiveAccountId, activeCartOrId);
    }
    public ConnectApi.CartItem updateCartItem(
        String webstoreId,
        String effectiveAccountId,
        String activeCartOrId,
        String cartItemId,
        ConnectApi.CartItemInput cartItem
    ) {
        return ConnectApi.CommerceCart.updateCartItem(webstoreId, effectiveAccountId, activeCartOrId, cartItemId, cartItem);
    }

    public Void deleteCartItem(String webstoreId, String effectiveAccountId, String activeCartOrId, String cartItemId) {
        ConnectApi.CommerceCart.deleteCartItem(webstoreId, effectiveAccountId, activeCartOrId, cartItemId);
    }

    public ConnectApi.ProductDetail getProduct(String webstoreId, String productId, String effectiveAccountId, List<String> fields) {
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCatalog_static_methods.htm#apex_ConnectAPI_CommerceCatalog_static_methods
        return ConnectApi.CommerceCatalog.getProduct(webstoreId, productId, effectiveAccountID, fields, false, null, false, true, false);
    }
    public ConnectApi.ProductCategoryDetail getProductCategory(String webstoreId, String productCategoryId, String effectiveAccountId) {
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCatalog_static_methods.htm#apex_ConnectAPI_CommerceCatalog_static_methods
        return ConnectApi.CommerceCatalog.getProductCategory(webstoreId, productCategoryId, effectiveAccountID, null, false, null, false);
    }

    public ConnectApi.CartItem addItemToCart(
        String webstoreId,
        String effectiveAccountId,
        String activeCartOrId,
        ConnectApi.CartItemInput cartInput,
        String currencyCode
    ) {
        // BS-1245 : Added currencyIsoCode as input parameter
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm#apex_ConnectAPI_CommerceCart_static_methods

        //BS-1245 : Start
        // Here identifying the WebCart that is associated with accountId of currently logged in user that having currency mismatch and deleting the WebCart if present
        List<WebCart> webCartToDeleteList = new List<WebCart>();

        if (String.isNotBlank(currencyCode)) {
            for (WebCart webCart : [
                SELECT Id, Status, CurrencyIsoCode
                FROM webcart
                WHERE AccountId = :effectiveAccountId AND Status = :B2B_Constants.WEB_CART_STATUS_ACTIVE
            ]) {
                if (webCart.CurrencyIsoCode.equalsIgnoreCase(currencyCode) == false) {
                    webCartToDeleteList.add(webCart);
                }
            }
            if (webCartToDeleteList.isEmpty() == false) {
                delete webCartToDeleteList;
            }
        }
        //BS-1245 : End
        return ConnectApi.CommerceCart.addItemToCart(webstoreId, effectiveAccountId, activeCartOrId, cartInput, currencyCode); // BS-1245 : Added currencyIsoCode as input parameter
    }

    public ConnectApi.Wishlist createWishlist(String webstoreId, String effectiveAccountId, ConnectApi.WishlistInput wishlistInput) {
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceWishlist_static_methods.htm#apex_ConnectAPI_CommerceWishlist_static_methods
        return ConnectApi.CommerceWishlist.createWishlist(webstoreId, effectiveAccountId, wishlistInput);
    }

    public ConnectApi.ProductPrice getProductPrice(String webstoreId, String productId, String effectiveAccountId) {
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceStorePricing_static_methods.htm#apex_ConnectAPI_CommerceStorePricing_static_methods
        return ConnectApi.CommerceStorePricing.getProductPrice(webstoreId, productId, effectiveAccountId);
    }

    public ConnectApi.PricingResult getProductPrices(String webstoreId, String effectiveAccountId, ConnectApi.PricingInput pricingInput) {
        // https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_ConnectAPI_CommerceStorePricing_static_methods.htm#apex_ConnectAPI_CommerceStorePricing_static_methods
        return ConnectApi.CommerceStorePricing.getProductPrices(webstoreId, effectiveAccountId, pricingInput);
    }

    public ConnectApi.ProductSearchResults searchProducts(String webstoreId, String effectiveAccountId, ConnectApi.ProductSearchInput searchInput) {
        return ConnectApi.CommerceSearch.searchProducts(webstoreId, effectiveAccountId, searchInput);
    }

    public ConnectApi.SortRulesCollection getSortRules(String webstoreId) {
        return ConnectApi.CommerceSearch.getSortRules(webstoreId);
    }

    public ConnectApi.ProductOverviewCollection getProducts(
        String webstoreId,
        String effectiveAccountId,
        List<String> ids,
        List<String> skus,
        List<String> fields,
        Boolean excludeMedia,
        Boolean excludePrices
    ) {
        return ConnectApi.CommerceCatalog.getProducts(webstoreId, effectiveAccountId, ids, skus, fields, excludeMedia, excludePrices);
    }

    public ConnectApi.WishlistItem addItemToWishlist(
        String webstoreId,
        String effectiveAccountId,
        String wishlistId,
        ConnectApi.WishlistItemInput wishlistItemInput
    ) {
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceWishlist_static_methods.htm#apex_ConnectAPI_CommerceWishlist_static_methods
        return ConnectApi.CommerceWishlist.addItemToWishlist(webstoreId, effectiveAccountId, wishlistId, wishlistItemInput);
    }

    /**
     * @description Demonstrates how to call ConnectApi.CommerceCart.createCart
     * @param webstoreId The Id of the webstore from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     */
    public ConnectApi.CartSummary createCart(String webstoreId, ConnectApi.CartInput cartInput) {
        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        return ConnectApi.CommerceCart.createCart(webstoreId, cartInput);
    }

    /**
     * @description Demonstrates how to call ConnectApi.CommerceCart.deleteCart
     * @param webstoreId The Id of the webstore from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @param activeCartOrId ID of the cart, active, or current.
     */
    public void deleteCart(String webstoreId, String effectiveAccountId, String activeCartOrId) {
        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        ConnectApi.CommerceCart.deleteCart(webstoreId, effectiveAccountId, activeCartOrId);
    }

    /**
     * @description Demonstrates how to call ConnectApi.CommerceCart.getCartItems
     * @param  communityId The Id of the community from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @param activeCartOrId ID of the cart, active, or current.
     * @param pageParam Specifies the page token to be used to view a page of information.
     * @param sortParam Sort order for items in a cart.
     * @return CartItemCollection A collection of cart items
     */
    public ConnectApi.CartItemCollection getCartItems(
        String webstoreId,
        String effectiveAccountId,
        String activeCartOrId,
        String pageParam,
        ConnectApi.CartItemSortOrder resolvedSortParam
    ) {
        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        return ConnectApi.CommerceCart.getCartItems(webstoreId, effectiveAccountId, activeCartOrId, pageParam, resolvedSortParam);
    }

    /**
     * @description This method is use to get cart items with product fields
     * BS-204
     * @param webstoreId The Id of the webstore from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @param activeCartOrId ID of the cart, active, or current.
     * @param productFields Comma-separated list of up to five product fields.
     * @param pageParam Specifies the page token to be used to view a page of information.
     * @param pageSize Specifies the number of items per page.
     * @param sortParam Sort order for items in a cart.
     * @return CartItemCollection A collection of cart items
     */
    public ConnectApi.CartItemCollection getCartItemsWithProductDetails(
        String webstoreId,
        String effectiveAccountId,
        String activeCartOrId,
        String productFields,
        String pageParam,
        Integer pageSize,
        ConnectApi.CartItemSortOrder resolvedSortParam
    ) {
        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        return ConnectApi.CommerceCart.getCartItems(webstoreId, effectiveAccountId, activeCartOrId, productFields, pageParam, pageSize, resolvedSortParam);
    }

    /**
     * @description This method is use to get cart items with product fields
     * BS-808
     * @param webstoreId The Id of the webstore from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @param activeCartOrId ID of the cart, active, or current.
     * @param pageParam Specifies the page token to be used to view a page of information.
     * @param pageSize Specifies the number of items per page.
     * @param sortParam Sort order for items in a cart.
     * @return CartItemCollection A collection of cart items
     */
    public ConnectApi.CartItemCollection getCartItems(
        String webstoreId,
        String effectiveAccountId,
        String activeCartOrId,
        String pageParam,
        Integer pageSize,
        ConnectApi.CartItemSortOrder resolvedSortParam
    ) {
        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        return ConnectApi.CommerceCart.getCartItems(webstoreId, effectiveAccountId, activeCartOrId, pageParam, pageSize, resolvedSortParam);
    }

    /**
     * @description This method is use to get cart summary
     * BS-976
     * @param webstoreId The Id of the webstore from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @param activeCartOrId ID of the cart, active, or current.
     */
    public ConnectApi.CartSummary getOrCreateActiveCartSummary(String webstoreId, String effectiveAccountId) {
        return ConnectApi.CommerceCart.getOrCreateActiveCartSummary(webstoreId, effectiveAccountId, 'active');
    }
}
