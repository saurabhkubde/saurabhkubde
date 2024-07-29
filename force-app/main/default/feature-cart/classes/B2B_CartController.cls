/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-07-22 15:16:37
 * @modify date 2022-07-22 15:16:37
 * @modify date 2022-11-10 17:13:00
 * @desc cart controller class
 */
public with sharing class B2B_CartController {
    @TestVisible
    private static B2B_CommerceProxy commerceProxy = new B2B_CommerceProxy();

    /**
     * BS-1036
     * This variable will be set to decide if we are deleting the lens configurator
     *
     */
    private static Boolean updateLensConfig = false;

    /**
     * @description addToCart method to add a product to the cart
     * @author Matthias Lindner
     * @param  communityId        communityId contains the current communityId
     * @param  productId          productId product id which needs to be added to the cart
     * @param  quantity           quantity quantity of the product
     * @param  effectiveAccountId effectiveAccountId of the logged in user
     * @param  currencyIsoCode    applicable Currency Code (Added as part of BS-1245)
     * @return                    return the according cart item
     */
    @AuraEnabled
    public static ConnectApi.CartItem addToCart(String communityId, String productId, String quantity, String effectiveAccountId, String currencyIsoCode) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        ConnectApi.CartItemInput cartInput = new ConnectApi.CartItemInput();
        cartInput.productId = productId;
        cartInput.quantity = quantity;
        cartInput.type = ConnectApi.CartItemType.PRODUCT;
        String activeCartOrId = 'current'; // Removed hardcoading of 'current' and created variable

        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm#apex_ConnectAPI_CommerceCart_static_methods
        //BS-2355 start
        ConnectApi.CartItem cartItemObj = commerceProxy.addItemToCart(webstoreId, effectiveAccountId, activeCartOrId, cartInput, currencyIsoCode); //  BS-1245 : Added currencyIsoCode as input parameter
        if (
            cartItemObj != null &&
            ((cartItemObj.unitAdjustedPrice != null && Decimal.valueOf(cartItemObj.unitAdjustedPrice) < 0) ||
            (cartItemObj.totalPrice != null &&
            Decimal.valueOf(cartItemObj.totalPrice) < 0))
        ) {
            CartItem createdCartItem = new CartItem();
            createdCartItem.Id = cartItemObj.cartItemId;
            createdCartItem.TotalPrice = 0;
            createdCartItem.TotalPriceAfterAllAdjustments = 0;
            createdCartItem.UnitAdjustedPrice = 0;
            createdCartItem.NetUnitPrice = 0;
            createdCartItem.SalesPrice = 0;
            createdCartItem.GrossUnitPrice = 0;
            update createdCartItem;
        }
        //BS-2355 end
        return cartItemObj;
    }

    /**
     * @description This method is use to return summary of Cart for respective account
     * @author Matthias Lindner
     * @param  communityId        communityId contains the current communityId
     * @param  effectiveAccountId effectiveAccountId of the logged in user
     * @param  currencyIsoCode    applicable Currency Code (Added as part of BS-1245)
     * @return                    return the according cart summary
     */
    @AuraEnabled
    public static ConnectApi.CartSummary getCartSummary(String communityId, String effectiveAccountId, String currencyIsoCode) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        //'current' is available in version 50.0 and later and indicates a cart with a status that isn’t Closed or PendingDelete
        //This is important for the product detail page since we are using the cart summary to check if the status is "Processing" or "Checkout"
        String activeCartOrId = 'current';

        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        return commerceProxy.getCartSummary(webstoreId, effectiveAccountId, activeCartOrId, currencyIsoCode); // BS-1245 : Added currencyIsoCode as input parameter
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
    @AuraEnabled
    public static ConnectApi.CartItemCollection getCartItems(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId,
        String pageParam,
        Integer pageSize,
        String sortParam
    ) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        // Get the ConnectApi.CartItemSortOrder enum value from string.
        // For the list of possible values, see:
        // see https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/connectAPI_enums.htm#cartItemSortOrderEnum
        ConnectApi.CartItemSortOrder resolvedSortParam = B2B_Utils.resolveSortParam(sortParam);

        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm

        return commerceProxy.getCartItems(webstoreId, effectiveAccountId, activeCartOrId, pageParam, pageSize, resolvedSortParam);
    }

    /**
     * @description This method is use to get cart item details with product fields
     * BS-204
     * @param communityId The Id of the community from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @param activeCartOrId ID of the cart, active, or current.
     * @param pageParam Specifies the page token to be used to view a page of information.
     * @param pageSize Specifies the number of items per page.
     * @param sortParam Sort order for items in a cart.
     * @return CartItemCollection A collection of cart items
     */
    @AuraEnabled
    public static ConnectApi.CartItemCollection getCartItemsWithProductDetails(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId,
        String pageParam,
        Integer pageSize,
        String sortParam
    ) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        // Below are the fields for which the information is obtained from Connect API. Maximum Field Limit is 5 as per the documentation.
        // see https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_ConnectAPI_CommerceCart_static_methods.htm#apex_ConnectAPI_CommerceCart_getCartItems_6
        String productFields = 'B2B_Availability_JSON__c,B2B_Picture_Link__c,B2B_Hexcode__c,B2B_Hexcode_Accent__c,ProductClass';

        // Get the ConnectApi.CartItemSortOrder enum value from string.
        // For the list of possible values, see:
        // see https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/connectAPI_enums.htm#cartItemSortOrderEnum
        ConnectApi.CartItemSortOrder resolvedSortParam = B2B_Utils.resolveSortParam(sortParam);

        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        return commerceProxy.getCartItemsWithProductDetails(
            webstoreId,
            effectiveAccountId,
            activeCartOrId,
            productFields,
            pageParam,
            pageSize,
            resolvedSortParam
        );
    }

    /**
     * @description Demonstrates how to call ConnectApi.CommerceCart.updateCartItem
     * @param  communityId The Id of the community from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @param activeCartOrId ID of the cart, active, or current.
     * @param cartItemId ID of the cart item to be updated.
     * @return CartItem The updated cart item
     */
    @AuraEnabled
    public static ConnectApi.CartItem updateCartItem(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId,
        String cartItemId,
        ConnectApi.CartItemInput cartItem
    ) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        ConnectApi.CartItem cartItemObj = commerceProxy.updateCartItem(webstoreId, effectiveAccountId, activeCartOrId, cartItemId, cartItem); //  BS-1245 : Added currencyIsoCode as input parameter
        //BS-2355 start
        if (
            cartItemObj != null &&
            ((cartItemObj.unitAdjustedPrice != null && Decimal.valueOf(cartItemObj.unitAdjustedPrice) < 0) ||
            (cartItemObj.totalPrice != null &&
            Decimal.valueOf(cartItemObj.totalPrice) < 0))
        ) {
            CartItem createdCartItem = new CartItem();
            createdCartItem.Id = cartItemObj.cartItemId;
            createdCartItem.TotalPrice = 0;
            createdCartItem.TotalPriceAfterAllAdjustments = 0;
            createdCartItem.UnitAdjustedPrice = 0;
            createdCartItem.NetUnitPrice = 0;
            createdCartItem.SalesPrice = 0;
            createdCartItem.GrossUnitPrice = 0;
            update createdCartItem;
        }
        //BS-2355 end
        return cartItemObj;
    }

    /**
     * @description Demonstrates how to call ConnectApi.CommerceCart.deleteCartItem
     * @param  communityId The Id of the community from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @param activeCartOrId ID of the cart, active, or current.
     * @param cartItemId ID of the cart item to be deleted.
     */
    @AuraEnabled
    public static void deleteCartItem(String communityId, String effectiveAccountId, String activeCartOrId, String cartItemId) {
        if (String.isBlank(cartItemId) == false) {
            deleteVsRxCartItems(cartItemId);
        }
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        commerceProxy.deleteCartItem(webstoreId, effectiveAccountId, activeCartOrId, cartItemId);
    }

    /**
     * @description Demonstrates how to call ConnectApi.CommerceCart.deleteCartItem
     * @param  communityId The Id of the community from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @param activeCartOrId ID of the cart, active, or current.
     * @param cartItemId ID of the cart item to be deleted.
     * @param updateLensConfigurator sets if lens configurator is to be updated or deleted
     */
    @AuraEnabled
    public static void saveToMyWishList(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId,
        String cartItemId,
        Boolean updateLensConfigurator
    ) {
        if (updateLensConfigurator != null && updateLensConfigurator == true) {
            B2B_CartController.updateLensConfig = true;
        }
        if (String.isBlank(cartItemId) == false) {
            deleteVsRxCartItems(cartItemId);
        }
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        commerceProxy.deleteCartItem(webstoreId, effectiveAccountId, activeCartOrId, cartItemId);
    }
    /**
     * @description Demonstrates how to call ConnectApi.CommerceCart.createCart
     * @param  communityId The Id of the community from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     */
    @AuraEnabled
    public static ConnectApi.CartSummary createCart(String communityId, String effectiveAccountId) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        ConnectApi.CartInput cartInput = new ConnectApi.CartInput();
        cartInput.effectiveAccountId = effectiveAccountId;

        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        return commerceProxy.createCart(webstoreId, cartInput);
    }

    /**
     * @description Demonstrates how to call ConnectApi.CommerceCart.deleteCart
     * @param  communityId The Id of the community from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @param activeCartOrId ID of the cart, active, or current.
     */
    @AuraEnabled
    public static void deleteCart(String communityId, String effectiveAccountId, String activeCartOrId) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        commerceProxy.deleteCart(webstoreId, effectiveAccountId, activeCartOrId);
    }

    /**
     * @description Method to fetch the product details with fields as per the Product Ids
     * BS-204
     * @param productIdList List of product Ids recieved from JS for fetching related product data
     * @return productIdVsProductMap  Map containing product Id and related product record
     */
    @AuraEnabled
    public static Map<Id, Product2> getProductDetails(List<String> productIdList) {
        Map<Id, Product2> productIdVsProductMap = new Map<Id, Product2>();

        // Query and fetch the Product data as per the Product Ids
        if (productIdList.isEmpty() == false) {
            //Updated as part of BS-530
            for (
                Product2 product : [
                    SELECT
                        Id,
                        toLabel(Name),
                        B2B_Shipping_Status_JSON__c,
                        toLabel(B2B_Sparepart_Type__c),
                        B2B_Shape_Size__c,
                        B2B_Lens_Size__c, //Added as Part Of BS-838
                        toLabel(B2B_EE_Size__c),
                        B2B_Frame_Color__c,
                        B2B_Frame_Color_Description__c,
                        B2B_Finish__c,
                        B2B_Lens_Color__c,
                        B2B_Lens_Color_Description__c,
                        B2B_Temple_Length__c,
                        B2B_Bridge_Size__c,
                        B2B_Brand__c,
                        B2B_Model__c,
                        StockKeepingUnit,
                        B2B_Design_Family__c, //Added as part of BS-882
                        B2B_Product_Type__c, //Added as part of BS-882
                        B2B_Shape_Height__c, //Added as part of BS-1431
                        B2B_Variant_Shape__c //BS-2174
                    FROM Product2
                    WHERE Id IN :productIdList
                ]
            ) {
                productIdVsProductMap.put(product.Id, product);
            }
        }

        if (productIdVsProductMap.isEmpty() == false) {
            return productIdVsProductMap;
        } else {
            return null;
        }
    }

    /**
     * @description Method to fetch the CartItem data
     * BS-204
     * @param cartItemIdList List of CartItem Id's for fethching values from fields associated.
     * @return cartItemIdVsCartItemMap Map of CartItem Id and CartItem object
     */
    @AuraEnabled
    public static Map<Id, CartItem> getCartItemData(List<String> cartItemIdList) {
        List<CartItem> cartItemDetailsList = new List<cartItem>();
        Map<Id, CartItem> cartItemIdVsCartItemMap = new Map<Id, CartItem>();

        if (cartItemIdList.isEmpty() == false) {
            for (CartItem cartItem : [
                SELECT Id, Customer_Reference__c, Entered_By__c, ListPrice, B2B_Type__C, TotalLineAmount
                FROM CartItem
                WHERE Id IN :cartItemIdList
            ]) {
                cartItemIdVsCartItemMap.put(cartItem.Id, cartItem);
            }
        }

        if (cartItemIdVsCartItemMap.isEmpty() == false) {
            return cartItemIdVsCartItemMap;
        } else {
            return null;
        }
    }

    /**
     * @description Method to update CartItem fields
     * BS-204
     * @param cartItemId Id of the CartItem to be updated.
     * @param customerReference Value recieved via markup that needs to be associated with Customer_Reference__c
     * @param enteredBy Value recieved via markup that needs to be associated with Entered_By__c
     * @param mode Value recieved via markup that shall let us know which field to update
     * @return cartItemToUpdateList List of updated CartItem records
     */
    @AuraEnabled
    public static List<CartItem> updateCartItemData(String cartItemId, String customerReference, String enteredBy) {
        List<CartItem> cartItemToUpdateList = new List<CartItem>();
        CartItem cartItem = new CartItem(Id = cartItemId);
        //BS-2031
        if (customerReference != B2B_Constants.UNDEFINED && customerReference != null) {
            cartItem.Customer_Reference__c = customerReference;
        }
        if (enteredBy != B2B_Constants.UNDEFINED && enteredBy != null) {
            cartItem.Entered_By__c = enteredBy;
        }

        cartItemToUpdateList.add(cartItem);
        update cartItemToUpdateList;
        return cartItemToUpdateList;
    }

    @AuraEnabled
    public static List<CartItem> getCartItemType(List<String> cartItemIdList) {
        List<CartItem> cartItemList = [SELECT Id, B2B_Type__c FROM CartItem WHERE Id IN :cartItemIdList];
        return cartItemList.isEmpty() == false ? cartItemList : null;
    }

    /**
     * @description Method to fetch the LensConfigurator details with fields as per the cartItem Ids
     * BS-976
     * @param cartItemIdList List of cartItem Ids recieved from JS for fetching related LensConfigurator data
     * @return cartItemIdVsLensConfiguratorMap  Map containing cartItem Id and related LensConfigurator record
     */
    @AuraEnabled
    public static Map<Id, B2B_Lens_Configurator__c> getCartItemDetails(List<String> cartItemIdList) {
        Map<Id, B2B_Lens_Configurator__c> cartItemIdVsLensConfiguratorMap = new Map<Id, B2B_Lens_Configurator__c>();

        // Query and fetch the LensConfigurator data as per the Product Ids
        if (cartItemIdList.isEmpty() == false) {
            //Updated as part of BS-530
            for (
                B2B_Lens_Configurator__c lensConfigurator : [
                    SELECT
                        Id,
                        B2B_Cart_Item__c,
                        toLabel(B2B_RX_Solution__c),
                        B2B_Selected_RX_Solution_SKU__c,
                        B2B_RX_Type__c,
                        toLabel(B2B_Lens_Type__c),
                        B2B_Lens_Index__c,
                        B2B_Addition_Right__c,
                        B2B_Addition_Left__c,
                        B2B_Axis_Right__c,
                        B2B_Axis_Left__c,
                        B2B_Cylinder_Right__c,
                        B2B_Cylinder_Left__c,
                        B2B_Fitting_height_Right_Eye__c,
                        B2B_Fitting_height_Left_Eye__c,
                        B2B_PB1_Right__c,
                        B2B_PB1_Left__c,
                        B2B_Prism_base2_Right__c,
                        B2B_Prism_base2_Left__c,
                        B2B_Prism_1_Right__c,
                        B2B_Prism_1_Left__c,
                        B2B_Prism2_Right__c,
                        B2B_Prism2_Left__c,
                        B2B_Pupil_Distance_Right_Eye__c,
                        B2B_Pupil_Distance_Left_Eye__c,
                        B2B_Sphere_Right__c,
                        B2B_Sphere_Left__c,
                        B2B_BVD_refracted__c,
                        B2B_BVD_worn__c,
                        B2B_Pantoscopic_tilt__c,
                        B2B_Antireflection_SKU__c,
                        B2B_Hard_Coating_SKU__c,
                        B2B_Note__c,
                        B2B_Selected_Lens_SKU__c,
                        B2B_Working_Distance__c,
                        B2B_Customer_Service_Preference__c,
                        B2B_without_clipin__c,
                        toLabel(B2B_Special_Handling__c),
                        toLabel(B2B_PB2Placement_Left__c),
                        toLabel(B2B_PB2Placement_Right__c),
                        toLabel(B2B_PB1Placement_Right__c),
                        toLabel(B2B_PB1Placement_Left__c),
                        B2B_Lens_Color__c, //BS-1334
                        B2B_Lenses_without_Adapter__c, //BS-1340
                        B2B_Antireflection_Product__r.Description, //BS-1150
                        B2B_Hard_Coating_Product__r.Description,
                        toLabel(B2B_Glazing_Type__c),
                        B2B_Progression_Length__c,
                        toLabel(B2B_Lens_Edge__c),
                        B2B_Lens_Distance__c,
                        B2B_Photo_Sensation__r.Description,
                        B2B_Blue_Sensation__r.Description,
                        toLabel(B2B_Visual_Preference__c),
                        toLabel(B2B_Measurement_System__c),
                        B2B_S_Graving__c,
                        B2B_Customer_Name__c, //BS-1836
                        B2B_Clerk__c, //BS-1836
                        toLabel(B2B_Order_Type__c),
                        toLabel(B2B_Frame_Type__c),
                        B2B_Evil_Eye_Edge__c, //BS-1836,
                        B2B_Lens_Shape__c, //BS-2158
                        B2B_Lens_Size__c, //BS-2158
                        B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c, //BS-2158
                        B2B_Selected_Color_Groove_Product__r.Name, //BS-2158
                        B2B_With_Color_Groove__c, //BS-2158
                        B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c, //BS-2158
                        B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c, //BS-2158
                        B2B_Accent_Ring__c, //BS-2158
                        B2B_a__c, //BS-2158
                        B2B_b__c, //BS-2158
                        B2B_b1__c, //BS-2158
                        B2B_b2__c, //BS-2158
                        B2B_SF__c, //BS-2158
                        B2B_DHP__c, //BS-2158
                        B2B_Optimized_Facet_Cut__c,
                        B2B_With_Partial_Color_Groove__c, //BS-2137
                        B2B_Related_Order_Number__c //BS-1064
                    FROM B2B_Lens_Configurator__c
                    WHERE B2B_Cart_Item__c IN :cartItemIdList
                ]
            ) {
                if (String.isNotBlank(lensConfigurator.B2B_Cart_Item__c)) {
                    cartItemIdVsLensConfiguratorMap.put(lensConfigurator.B2B_Cart_Item__c, lensConfigurator);
                }
            }
        }

        if (cartItemIdVsLensConfiguratorMap.isEmpty() == false) {
            return cartItemIdVsLensConfiguratorMap;
        } else {
            return null;
        }
    }

    /**
     * @description Method to fetch the vs/rx cart items to show the price of the complete configuration
     * BS-1094
     * @param cartItemsIdList List of cartItem Ids recieved from JS for fetching related vs/rx cart items
     */
    @AuraEnabled(cacheable=false)
    public static Map<Id, List<B2B_CartItems__c>> getTotalPriceForCartItem(List<String> cartItemsIdList) {
        Map<Id, List<B2B_CartItems__c>> cartItemIdVsCustomCartItemListMap = new Map<Id, List<B2B_CartItems__c>>();
        List<B2B_CartItems__c> customCartItemList = [
            SELECT Id, Name, B2B_Parent_Cart_Item__c, B2B_List_Price__c, B2B_Cart__c
            FROM B2B_CartItems__c
            WHERE B2B_Parent_Cart_Item__c IN :cartItemsIdList AND B2B_List_Price__c != NULL
        ];
        if (customCartItemList.isEmpty() == false) {
            for (B2B_CartItems__c customCartItemObj : customCartItemList) {
                if (
                    (customCartItemObj.B2B_Parent_Cart_Item__c != null) &&
                    cartItemIdVsCustomCartItemListMap.containsKey(customCartItemObj.B2B_Parent_Cart_Item__c)
                ) {
                    cartItemIdVsCustomCartItemListMap.get(customCartItemObj.B2B_Parent_Cart_Item__c).add(customCartItemObj);
                } else {
                    cartItemIdVsCustomCartItemListMap.put(customCartItemObj.B2B_Parent_Cart_Item__c, new List<B2B_CartItems__c>{ customCartItemObj });
                }
            }
        }
        if (cartItemIdVsCustomCartItemListMap.isEmpty() == false) {
            return cartItemIdVsCustomCartItemListMap;
        }
        return null;
    }

    /**
     * BS-976
     * @auther : Vishalsingh Gaur
     * @description This private method is used to check whether the account of currently logged in user is entitled with VS-RX entitlement policy
     * @param  accountId            :   Account Id of currently logged in user
     * @return isEligibleForVSRX    :   Whether the account is entitled with VS-RX entitlement policy (True / False)
     */
    @AuraEnabled(cacheable=false)
    public static B2B_EntitlementWrapper checkEligibilityForVSRX(String accountId) {
        B2B_EntitlementWrapper entitlementObj = new B2B_EntitlementWrapper();
        if (String.isNotBlank(accountId)) {
            B2B_FetchDataInSystemContext contextInstance = new B2B_FetchDataInSystemContext();
            entitlementObj = contextInstance.getEligibilityForVSRX(accountId);
        }
        return entitlementObj;
    }

    /**
     * BS-1716
     * @auther : Vishalsingh Gaur
     * @description This private method is used to check whether the account of currently logged in user is entitled with VS-RX entitlement policy
     * @param  accountId            :   Account Id of currently logged in user
     * @return isEligibleForVSRX    :   Whether the account is entitled with VS-RX entitlement policy (True / False)
     */
    @AuraEnabled(cacheable=false)
    public static B2B_EntitlementWrapper checkVSRXEligibilityFromAccount(String accountId) {
        B2B_EntitlementWrapper entitlementObj = new B2B_EntitlementWrapper();
        if (String.isNotBlank(accountId)) {
            List<Account> accountList = [SELECT Id, k_Account_Status_SVS__c, k_EERX_Account_Status__c FROM Account WHERE Id = :accountId];
            if (accountList.isEmpty() == false) {
                entitlementObj.isEligibleForVS = String.isNotBlank(accountList[0].k_Account_Status_SVS__c) &&
                    accountList[0].k_Account_Status_SVS__c.equals(B2B_Constants.ACTIVE_STATUS)
                    ? true
                    : false;
                entitlementObj.isEligibleForRX = String.isNotBlank(accountList[0].k_EERX_Account_Status__c) &&
                    accountList[0].k_EERX_Account_Status__c.equals(B2B_Constants.ACTIVE_STATUS)
                    ? true
                    : false;
            }
        }
        return entitlementObj;
    }

    /**
     * BS-1127
     * @auther : Soumyakant Pandya
     * @description This method is used to fetch Lens Material and RX solution color from products based on SKUs in Lens Configurator
     * @param  cartItemIdVsLensConfiguratorMap  Map containing cartItem Id and related LensConfigurator record
     * @return List<B2B_CartGlassDetailsWrapper>   :   Wrapper with details of data fetched for cartItem
     */
    @AuraEnabled(cacheable=false)
    public static List<B2B_CartGlassDetailsWrapper> getGlassDetails(Map<Id, B2B_Lens_Configurator__c> cartItemIdVsLensConfiguratorMap) {
        Set<String> productSKUSet = new Set<String>();
        Map<String, Product2> skuVSProductMap = new Map<String, Product2>();
        B2B_CartGlassDetailsWrapper productLensAndMaterialDetailWrapperObj;
        List<B2B_CartGlassDetailsWrapper> productDetailWrapper = new List<B2B_CartGlassDetailsWrapper>();

        for (String cartItemId : cartItemIdVsLensConfiguratorMap.keySet()) {
            if (cartItemIdVsLensConfiguratorMap.get(cartItemId) != null) {
                productSKUSet.add(cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_RX_Solution_SKU__c);
                productSKUSet.add(cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_Lens_SKU__c);
            }
        }

        for (Product2 productObj : new B2B_FetchDataInSystemContext().getCartItemsProductDetails(productSKUSet)) {
            if (!skuVSProductMap.containsKey(productObj.StockKeepingUnit)) {
                skuVSProductMap.put(productObj.StockKeepingUnit, productObj);
            }
        }
        for (String cartItemId : cartItemIdVsLensConfiguratorMap.keySet()) {
            productLensAndMaterialDetailWrapperObj = new B2B_CartGlassDetailsWrapper();
            if (cartItemIdVsLensConfiguratorMap.get(cartItemId) != null) {
                productLensAndMaterialDetailWrapperObj.cartItemId = cartItemId;
                productLensAndMaterialDetailWrapperObj.lensMaterial = skuVSProductMap.containsKey(
                        cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_Lens_SKU__c
                    )
                    ? skuVSProductMap.get(cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_Lens_SKU__c).B2B_Material__c != null
                          ? skuVSProductMap.get(cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_Lens_SKU__c).B2B_Material__c
                          : null
                    : null;
                productLensAndMaterialDetailWrapperObj.rxSolutionColor = skuVSProductMap.containsKey(
                        cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_RX_Solution_SKU__c
                    )
                    ? skuVSProductMap.get(cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_RX_Solution_SKU__c).Description != null
                          ? skuVSProductMap.get(cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_RX_Solution_SKU__c).Description
                          : null
                    : null;
                //BS-1269 Start
                productLensAndMaterialDetailWrapperObj.rxSolutionImage = skuVSProductMap.containsKey(
                        cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_RX_Solution_SKU__c
                    )
                    ? skuVSProductMap.get(cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_RX_Solution_SKU__c).B2B_Picture_Link__c != null
                          ? skuVSProductMap.get(cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_RX_Solution_SKU__c).B2B_Picture_Link__c
                          : null
                    : null;
                productLensAndMaterialDetailWrapperObj.lensImage = skuVSProductMap.containsKey(
                        cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_Lens_SKU__c
                    )
                    ? skuVSProductMap.get(cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_Lens_SKU__c).B2B_Picture_Link__c != null
                          ? skuVSProductMap.get(cartItemIdVsLensConfiguratorMap.get(cartItemId).B2B_Selected_Lens_SKU__c).B2B_Picture_Link__c
                          : null
                    : null;
                productDetailWrapper.add(productLensAndMaterialDetailWrapperObj); //BS-1269 end
            }
        }
        return productDetailWrapper;
    }

    /**
     * @description Method to fetch the product details with fields as per the Product Ids for NB store
     * BS-1663
     * @param productIdList List of product Ids recieved from JS for fetching related product data
     * @return productIdVsProductMap  Map containing product Id and related product record
     */
    @AuraEnabled
    public static Map<Id, B2B_ProductDataWrapper> getProductDetailsNB(List<String> productIdList) {
        Map<Id, B2B_ProductDataWrapper> productIdVsProductMap = new Map<Id, B2B_ProductDataWrapper>();

        // Query and fetch the Product data as per the Product Ids
        if (productIdList.isEmpty() == false) {
            Integer remainingQueryRowLimit = Limits.getLimitQueryRows() - Limits.getQueryRows();
            List<String> catalogNameList = (System.Label.B2B_STORE_CATALOG_NAME).split(',');
            String applicableCatalogue = catalogNameList[1];

            Map<Id, Id> productCategoryIdVsParentCategoryIdMap = new Map<Id, Id>();
            Map<Id, String> productCategoryIdVsProductCategoryNameMap = new Map<Id, String>();

            for (ProductCategory productCategoryObj : new B2B_FetchDataInSystemContext().getProductCategory(applicableCatalogue, remainingQueryRowLimit)) {
                if (productCategoryIdVsParentCategoryIdMap.containsKey(productCategoryObj.Id) == false) {
                    productCategoryIdVsParentCategoryIdMap.put(productCategoryObj.Id, productCategoryObj.ParentCategoryId);
                }

                if (productCategoryIdVsProductCategoryNameMap.containsKey(productCategoryObj.Id) == false) {
                    productCategoryIdVsProductCategoryNameMap.put(productCategoryObj.Id, productCategoryObj.Name);
                }
            }
            for (
                ProductCategoryProduct productCategoryProductObj : new B2B_FetchDataInSystemContext()
                    .getProductCategoryProduct(productIdList, applicableCatalogue)
            ) {
                B2B_ProductDataWrapper productDataWrapperObj = new B2B_ProductDataWrapper();
                Product2 cartProductObj = new Product2(
                    Id = productCategoryProductObj.Product.Id,
                    Name = productCategoryProductObj.Product.Name,
                    B2B_Sparepart_Type__c = productCategoryProductObj.Product.B2B_Sparepart_Type__c,
                    B2B_Shipping_Status_JSON__c = productCategoryProductObj.Product.B2B_Shipping_Status_JSON__c,
                    B2B_Shape_Size__c = productCategoryProductObj.Product.B2B_Shape_Size__c,
                    B2B_Lens_Size__c = productCategoryProductObj.Product.B2B_Lens_Size__c,
                    B2B_EE_Size__c = productCategoryProductObj.Product.B2B_EE_Size__c,
                    B2B_Frame_Color__c = productCategoryProductObj.Product.B2B_Frame_Color__c,
                    B2B_Frame_Color_Description__c = productCategoryProductObj.Product.B2B_Frame_Color_Description__c,
                    B2B_Finish__c = productCategoryProductObj.Product.B2B_Finish__c,
                    B2B_Lens_Color__c = productCategoryProductObj.Product.B2B_Lens_Color__c,
                    B2B_Lens_Color_Description__c = productCategoryProductObj.Product.B2B_Lens_Color_Description__c,
                    B2B_Temple_Length__c = productCategoryProductObj.Product.B2B_Temple_Length__c,
                    B2B_Bridge_Size__c = productCategoryProductObj.Product.B2B_Bridge_Size__c,
                    B2B_Brand__c = productCategoryProductObj.Product.B2B_Brand__c,
                    B2B_Model__c = productCategoryProductObj.Product.B2B_Model__c,
                    StockKeepingUnit = productCategoryProductObj.Product.StockKeepingUnit,
                    B2B_Design_Family__c = productCategoryProductObj.Product.B2B_Design_Family__c,
                    B2B_Product_Type__c = productCategoryProductObj.Product.B2B_Product_Type__c,
                    B2B_Shape_Height__c = productCategoryProductObj.Product.B2B_Shape_Height__c,
                    B2B_Variant_Shape__c = productCategoryProductObj.Product.B2B_Variant_Shape__c
                );

                Boolean isFrameProduct = false;
                Id masterParentCategoryId = getMasterParentCategory(productCategoryProductObj.ProductCategoryId, productCategoryIdVsParentCategoryIdMap);
                if (
                    String.isNotBlank(masterParentCategoryId) &&
                    productCategoryIdVsProductCategoryNameMap.containsKey(masterParentCategoryId) &&
                    System.Label.B2B_NEUBAU_FRAME_CATEGORY.split(',').contains(productCategoryIdVsProductCategoryNameMap.get(masterParentCategoryId))
                ) {
                    isFrameProduct = true;
                }

                productDataWrapperObj.productObj = cartProductObj;
                productDataWrapperObj.isFrame = isFrameProduct;
                productDataWrapperObj.productCategory = productCategoryProductObj.ProductCategory.Name; //BS-1568
                productIdVsProductMap.put(productCategoryProductObj.Product.Id, productDataWrapperObj);
            }
        }
        if (productIdVsProductMap.isEmpty() == false) {
            return productIdVsProductMap;
        } else {
            return null;
        }
    }

    @TestVisible
    private static Id getMasterParentCategory(Id categoryId, Map<Id, Id> productCategoryIdVsParentCategoryIdMap) {
        Id parentCategoryId;
        if (productCategoryIdVsParentCategoryIdMap.containsKey(categoryId) && productCategoryIdVsParentCategoryIdMap.get(categoryId) != null) {
            parentCategoryId = getMasterParentCategory(productCategoryIdVsParentCategoryIdMap.get(categoryId), productCategoryIdVsParentCategoryIdMap);
        } else if (productCategoryIdVsParentCategoryIdMap.containsKey(categoryId)) {
            parentCategoryId = categoryId;
        }
        return parentCategoryId;
    }

    /**
     * @description Method to the B2B type of the products
     * BS-1137
     * @param productIdList List of product Ids recieved from JS for fetching related product data
     */
    @AuraEnabled
    public static Map<Id, String> getProductType(List<String> productIdList) {
        Map<Id, String> productIdVsProductTypeMap = new Map<Id, String>();
        if (productIdList.isEmpty() == false) {
            for (B2B_Commerce_Product_Link__c productLink : [
                SELECT Id, B2B_Target_Product__c, B2B_Type__c
                FROM B2B_Commerce_Product_Link__c
                WHERE B2B_Target_Product__c IN :productIdList
            ]) {
                productIdVsProductTypeMap.put(productLink.B2B_Target_Product__c, productLink.B2B_Type__c);
            }
        }

        if (productIdVsProductTypeMap.isEmpty() == false) {
            return productIdVsProductTypeMap;
        } else {
            return null;
        }
    }

    /**
     * @description Method to delete vs rx cart items
     * BS-1036
     * @param parentCartItemId Id of the standard cart item
     */
    @AuraEnabled
    public static void deleteVsRxCartItems(String parentCartItemId) {
        if (String.isBlank(parentCartItemId) == false) {
            List<B2B_CartItems__c> vsRxCartItemsList = [SELECT ID FROM B2B_CartItems__c WHERE B2B_Parent_Cart_Item__c = :parentCartItemId];
            if (vsRxCartItemsList.isEmpty() == false) {
                delete vsRxCartItemsList;
            }
            if (B2B_CartController.updateLensConfig == true) {
                updateLensConfiguratorStatus(parentCartItemId);
            } else {
                deleteLensConfigurator(parentCartItemId);
            }
        }
    }

    /**
     * @description Method to delete the lens configurator
     * BS-1036
     * @param cartItemId Id of the standard cart item
     */
    @AuraEnabled
    public static void deleteLensConfigurator(String cartItemId) {
        if (String.isBlank(cartItemId) == false) {
            List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT ID FROM B2B_Lens_Configurator__c WHERE B2B_Cart_Item__c = :cartItemId];
            if (lensConfiguratorList.isEmpty() == false) {
                delete lensConfiguratorList;
            }
        }
    }

    /**
     * @description Method to update the status of the lens configurator
     * BS-1036
     * @param cartItemId Id of the standard cart item
     */
    @AuraEnabled
    public static void updateLensConfiguratorStatus(String cartItemId) {
        if (String.isBlank(cartItemId) == false) {
            List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT ID FROM B2B_Lens_Configurator__c WHERE B2B_Cart_Item__c = :cartItemId];
            if (lensConfiguratorList.isEmpty() == false) {
                lensConfiguratorList[0].B2B_Status__c = B2B_Constants.LENS_CONFIGURATOR_STATUS_OPEN;
                update lensConfiguratorList;
            }
        }
    }

    /**
     * @description This method is used to fetch currencyIsoCode for provided pricebookEntry
     * BS-1245
     *
     * @author Chirag L
     * @param  pricebookEntryIdList     :   List containing pricebook entries
     * @return currencyISOCodeList      :   List containing currency ISO Codes
     */
    @AuraEnabled
    public static List<String> getCurrencyCode(List<String> pricebookEntryIdList) {
        List<String> currencyISOCodeList = new List<String>();
        try {
            if (pricebookEntryIdList.isEmpty() == false) {
                for (PricebookEntry pricebookEntryInstance : [SELECT Id, CurrencyIsoCode FROM Pricebookentry WHERE Id IN :pricebookEntryIdList]) {
                    currencyISOCodeList.add(String.isNotBlank(pricebookEntryInstance.CurrencyIsoCode) ? pricebookEntryInstance.CurrencyIsoCode : null);
                }
            }
            return currencyISOCodeList;
        } catch (Exception exceptionInstance) {
            throw new AuraHandledException(exceptionInstance.getMessage());
        }
    }

    /**
     * @description This method is used to get the products related to policy.
     * BS-1090
     * @author Vishalsingh G
     * @return                 returns products under the policy.
     */
    @AuraEnabled(cacheable=false)
    public static List<String> getEntitledSHProducts(String effectiveAccountId) {
        Set<String> productIdSet = new Set<String>();
        set<String> buyGrpIdSet = new Set<String>();
        set<String> policyIdSet = new Set<String>();
        List<BuyerGroupMember> buyGrpMemberList = new B2B_FetchDataInSystemContext().getBuyerGroupMember(effectiveAccountId);
        for (BuyerGroupMember bgMember : buyGrpMemberList) {
            buyGrpIdSet.add(bgMember.BuyerGroupId);
        }
        List<CommerceEntitlementBuyerGroup> comEntBuyGrpList = new B2B_FetchDataInSystemContext().getCommerceEntitlementBuyerGroup(buyGrpIdSet);
        for (CommerceEntitlementBuyerGroup comEntBuyGrpObject : comEntBuyGrpList) {
            policyIdSet.add(comEntBuyGrpObject.PolicyId);
        }

        List<String> policyIdList = new List<String>(policyIdSet);
        List<CommerceEntitlementProduct> comEntProductList = new B2B_FetchDataInSystemContext().getCommerceEntitlementProduct(policyIdList);
        for (CommerceEntitlementProduct comEntProductObj : comEntProductList) {
            productIdSet.add(comEntProductObj.ProductId);
        }

        List<String> productIdList = new List<String>(productIdSet);
        return productIdList;
    }

    /**
     * @description Method to delete multiple cart items
     * BS-1090
     * @param parentCartItemId Id of the standard cart item
     */
    @AuraEnabled
    public static void deleteMultipleCartItems(List<String> productIdList) {
        String cartStatus = B2B_Constants.WEB_CART_STATUS_ACTIVE;
        if (!productIdList.isEmpty()) {
            List<CartItem> multipleCartItemsList = [
                SELECT Id, Product2.Id, B2B_Type__c, Cart.Status
                FROM CartItem
                WHERE Product2.Id IN :productIdList AND B2B_Type__c = NULL AND Cart.Status = :cartStatus
            ];
            if (multipleCartItemsList.isEmpty() == false) {
                delete multipleCartItemsList;
            }
        }
    }

    /**
     * @author Vishalsingh Gaur
     * BS-1339
     * @description Demonstrates how to call ConnectApi.CommerceCart.deleteCart
     * @param  communityId The Id of the community from which the call originated
     * @param effectiveAccountId ID of the account for which the request is made. If null, defaults to the account ID for the context user.
     * @param activeCartOrId ID of the cart, active, or current.
     * @param pageParam Specifies the page token to be used to view a page of information.
     * @param pageSize Specifies the number of items per page.
     * @param sortParam Sort order for items in a cart.
     */
    @AuraEnabled
    public static void deleteSilhouetteStoreCart(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId,
        String pageParam,
        Integer pageSize,
        String sortParam
    ) {
        // Lookup the webstore ID associated with the community
        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);
        List<B2B_Lens_Configurator__c> lensConfiguratorToDeleteList;
        List<B2B_CartItems__c> customCartItemToDeleteList;
        ConnectApi.CartItemCollection cartItemCollection = B2B_CartController.getCartItems(
            communityId,
            effectiveAccountId,
            activeCartOrId,
            pageParam,
            pageSize,
            sortParam
        );

        List<ConnectApi.CartItemResult> cartItemsList = cartItemCollection.cartItems;
        ConnectApi.AbstractCartItem cartItem;

        Set<String> cartItemIdSet = new Set<String>(); //List used to fetch information related to the cartItem
        for (ConnectApi.CartItemResult cartItemResult : cartItemsList) {
            cartItemIdSet.add(cartItemResult.cartItem.cartItemId);
        }

        if (cartItemIdSet.isEmpty() == false) {
            lensConfiguratorToDeleteList = [SELECT Id FROM B2B_Lens_Configurator__c WHERE B2B_Cart_Item__c IN :cartItemIdSet];
            customCartItemToDeleteList = [SELECT Id FROM B2B_CartItems__c WHERE B2B_Parent_Cart_Item__c IN :cartItemIdSet];
        }

        if (lensConfiguratorToDeleteList.isEmpty() == false) {
            delete lensConfiguratorToDeleteList;
        }

        if (customCartItemToDeleteList.isEmpty() == false) {
            delete customCartItemToDeleteList;
        }
        // For more details, see:
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_ConnectAPI_CommerceCart_static_methods.htm
        commerceProxy.deleteCart(webstoreId, effectiveAccountId, activeCartOrId);
    }

    /**
     * @description Method to fetch the product category and product data as per the Product Ids
     * BS-1568
     * @param productIdList         List of product Ids recieved from JS for fetching related product category data
     *        isSilhouetteStore     Flag to check if is invoked from Silhouette store
     * @return productIdVsIsFrameProductMap  Map containing product Id and isFrame flag
     */
    @AuraEnabled
    public static Map<Id, Boolean> checkSparePartsOnlyFrames(List<String> productIdList, Boolean isSilhouetteStore) {
        Map<Id, Boolean> productIdVsIsFrameProductMap = new Map<Id, Boolean>();
        // Query and fetch the Product Category data as per the Product Ids
        if (productIdList.isEmpty() == false) {
            Integer remainingQueryRowLimit = Limits.getLimitQueryRows() - Limits.getQueryRows();
            Map<Id, Id> productCategoryIdVsParentCategoryIdMap = new Map<Id, Id>();
            Map<Id, String> productCategoryIdVsProductCategoryNameMap = new Map<Id, String>();
            Set<String> sparePartsOnlyFrameCategoryList = new Set<String>();
            List<String> catalogNameList = (System.Label.B2B_STORE_CATALOG_NAME).split(',');
            String applicableCatalogue;

            if (catalogNameList.isEmpty() == false && catalogNameList[0] != null && isSilhouetteStore) {
                applicableCatalogue = catalogNameList[0];
            } else if (catalogNameList.isEmpty() == false && catalogNameList[1] != null) {
                applicableCatalogue = catalogNameList[1];
            }

            for (ProductCategory productCategoryObj : new B2B_FetchDataInSystemContext().getProductCategory(applicableCatalogue, remainingQueryRowLimit)) {
                if (productCategoryIdVsParentCategoryIdMap.containsKey(productCategoryObj.Id) == false) {
                    productCategoryIdVsParentCategoryIdMap.put(productCategoryObj.Id, productCategoryObj.ParentCategoryId);
                }

                if (productCategoryIdVsProductCategoryNameMap.containsKey(productCategoryObj.Id) == false) {
                    productCategoryIdVsProductCategoryNameMap.put(productCategoryObj.Id, productCategoryObj.Name);
                }
            }

            for (
                ProductCategoryProduct productCategoryProductObj : new B2B_FetchDataInSystemContext()
                    .getProductCategoryProduct(productIdList, applicableCatalogue)
            ) {
                Boolean isSparePartOnlyFrameFlag = false;
                if (isSilhouetteStore) {
                    sparePartsOnlyFrameCategoryList.addAll(System.Label.B2B_SILHOUETTE_SPARE_PART_ONLY_FRAME_CATEGORY.split(','));
                    sparePartsOnlyFrameCategoryList.addAll(System.Label.B2B_EVIL_EYE_SPARE_PART_ONLY_FRAME_CATEGORY.split(','));
                } else {
                    sparePartsOnlyFrameCategoryList.addAll(System.Label.B2B_NEUBAU_FRAME_CATEGORY.split(','));
                }

                for (
                    String productCategoryName : getParentCategory(
                        productCategoryProductObj.ProductCategoryId,
                        productCategoryIdVsParentCategoryIdMap,
                        productCategoryIdVsProductCategoryNameMap
                    )
                ) {
                    if (sparePartsOnlyFrameCategoryList.contains(productCategoryName)) {
                        isSparePartOnlyFrameFlag = true;
                        break;
                    }
                }
                productIdVsIsFrameProductMap.put(productCategoryProductObj.ProductId, isSparePartOnlyFrameFlag);
            }
        }
        return productIdVsIsFrameProductMap;
    }

    /**
     * @description Method to fetch the all product category as per the category Id
     * BS-1568
     * @param   categoryId        category Id of product
     *          productCategoryIdVsParentCategoryIdMap        Map containing category Id and parent category Id
     *          productCategoryIdVsProductCategoryNameMap     Map containing category Id and category name
     * @return productCategoryIdVsParentCategoryIdMap       Set containing all parent category names
     *
     */
    public static Set<String> getParentCategory(
        Id categoryId,
        Map<Id, Id> productCategoryIdVsParentCategoryIdMap,
        Map<Id, String> productCategoryIdVsProductCategoryNameMap
    ) {
        Set<String> parentCategorySet = new Set<String>();

        if (productCategoryIdVsParentCategoryIdMap.containsKey(categoryId) && productCategoryIdVsParentCategoryIdMap.get(categoryId) != null) {
            parentCategorySet.addAll(
                getParentCategory(
                    productCategoryIdVsParentCategoryIdMap.get(categoryId),
                    productCategoryIdVsParentCategoryIdMap,
                    productCategoryIdVsProductCategoryNameMap
                )
            );
            parentCategorySet.add(productCategoryIdVsProductCategoryNameMap.get(categoryId));
        } else if (productCategoryIdVsParentCategoryIdMap.containsKey(categoryId)) {
            parentCategorySet.add(productCategoryIdVsProductCategoryNameMap.get(categoryId));
        }
        return parentCategorySet;
    }

    @TestVisible
    private static Set<String> getCategoryPath(
        Id categoryId,
        Map<Id, Id> productCategoryIdVsParentCategoryIdMap,
        Map<Id, String> productCategoryIdVsProductCategoryNameMap,
        Set<String> frameCategoryPathSet
    ) {
        if (String.isNotBlank(categoryId) && productCategoryIdVsProductCategoryNameMap.containsKey(categoryId)) {
            frameCategoryPathSet.add(productCategoryIdVsProductCategoryNameMap.get(categoryId));
        }
        if (productCategoryIdVsParentCategoryIdMap.containsKey(categoryId) && productCategoryIdVsParentCategoryIdMap.get(categoryId) != null) {
            Set<String> parentCategorySet = getCategoryPath(
                productCategoryIdVsParentCategoryIdMap.get(categoryId),
                productCategoryIdVsParentCategoryIdMap,
                productCategoryIdVsProductCategoryNameMap,
                frameCategoryPathSet
            );
        }
        return frameCategoryPathSet;
    }

    /**
     * @description Method to identify if cart items consists of frame
     * BS-1714
     * @param productIdList List of product Ids recieved from JS for fetching related product data
     * @param accountId Current logged in account Id to identify whether the CCS flag on account is closed
     * @return productDataWrapperObj  object containing boolean to stop checkout is SH and EE frames exists
     */
    @AuraEnabled(cacheable=false)
    public static B2B_CcsFlagWrapper getBrandWiseCCSFlag(Id cartId, Id accountId) {
        B2B_CcsFlagWrapper ccsFlagWrapperObj = new B2B_CcsFlagWrapper();

        Boolean hasSilhouetteFrame = false;
        Boolean hasEvilEyeFrame = false;

        //Identify if the CCS flag for Silhouette on account is Yes
        Boolean silhouetteAccountClosed = B2B_Utils.checkAccountClosedForSH(accountId);
        //Identify if the CCS flag for Evil Eye on account is Yes
        Boolean evilEyeAccountClosed = B2B_Utils.checkAccountClosedForEE(accountId);

        List<CartItem> productIdList = [SELECT Product2Id FROM CartItem WHERE CartId = :cartId];
        List<String> productIdsList = new List<String>();

        if (productIdList.isEmpty() == false) {
            for (CartItem cartItem : productIdList) {
                productIdsList.add(cartItem.Product2Id);
            }
        }

        if (productIdsList.isEmpty() == false) {
            Integer remainingQueryRowLimit = Limits.getLimitQueryRows() - Limits.getQueryRows();
            Map<Id, Id> productCategoryIdVsParentCategoryIdMap = new Map<Id, Id>();
            Map<Id, String> productCategoryIdVsProductCategoryNameMap = new Map<Id, String>();
            String applicableCatalogue;
            List<String> catalogNameList = (System.Label.B2B_STORE_CATALOG_NAME).split(',');
            applicableCatalogue = catalogNameList[0];

            for (ProductCategory productCategoryObj : new B2B_FetchDataInSystemContext().getProductCategory(applicableCatalogue, remainingQueryRowLimit)) {
                if (productCategoryIdVsParentCategoryIdMap.containsKey(productCategoryObj.Id) == false) {
                    productCategoryIdVsParentCategoryIdMap.put(productCategoryObj.Id, productCategoryObj.ParentCategoryId);
                }

                if (productCategoryIdVsProductCategoryNameMap.containsKey(productCategoryObj.Id) == false) {
                    productCategoryIdVsProductCategoryNameMap.put(productCategoryObj.Id, productCategoryObj.Name);
                }
            }
            for (
                ProductCategoryProduct productCategoryProductObj : new B2B_FetchDataInSystemContext()
                    .getProductCategoryProduct(productIdsList, applicableCatalogue)
            ) {
                Set<String> frameCategoryPathSet = new Set<String>();
                List<String> frameCategoryPathList = new List<String>();

                frameCategoryPathSet = getCategoryPath(
                    productCategoryProductObj.ProductCategoryId,
                    productCategoryIdVsParentCategoryIdMap,
                    productCategoryIdVsProductCategoryNameMap,
                    frameCategoryPathSet
                );
                if (productCategoryProductObj.Product.B2B_Brand__c == B2B_Constants.B2B_SH_BRAND_API_NAME_01) {
                    frameCategoryPathList = System.Label.B2B_SILHOUETTE_CCS_FRAMES.split(',');
                } else if (productCategoryProductObj.Product.B2B_Brand__c == B2B_Constants.B2B_EE_BRAND_API_NAME_05) {
                    frameCategoryPathList = System.Label.B2B_EVIL_EYE_CCS_FRAMES.split(',');
                }
                for (String category : frameCategoryPathList) {
                    if (productCategoryProductObj.Product.B2B_Brand__c == B2B_Constants.B2B_SH_BRAND_API_NAME_01) {
                        if (frameCategoryPathSet.contains(category) && silhouetteAccountClosed) {
                            hasSilhouetteFrame = true;
                        }
                    }
                    if (productCategoryProductObj.Product.B2B_Brand__c == B2B_Constants.B2B_EE_BRAND_API_NAME_05) {
                        if (frameCategoryPathSet.contains(category) && evilEyeAccountClosed) {
                            hasEvilEyeFrame = true;
                        }
                    }
                }
            }
        }

        ccsFlagWrapperObj.evilEyeCCSFlag = hasEvilEyeFrame;
        ccsFlagWrapperObj.silhouetteCCSFlag = hasSilhouetteFrame;

        return ccsFlagWrapperObj;
    }

    @TestVisible
    private without sharing class B2B_FetchDataInSystemContext {
        /**
         * BS-976
         * @auther : Vishalsingh Gaur
         * @description This private method is used to check whether the account of currently logged in user is entitled with VS-RX entitlement policy
         * @param  accountId            :   Account Id of currently logged in user
         * @return isEligibleForVSRX    :   Whether the account is entitled with VS-RX entitlement policy (True / False)
         */
        @TestVisible
        private B2B_EntitlementWrapper getEligibilityForVSRX(String accountId) {
            B2B_EntitlementWrapper entitlementObj = new B2B_EntitlementWrapper();
            try {
                Boolean isEligibleForVSRX = false;
                Set<Id> buyerGroupIdSet = new Set<Id>();
                for (BuyerGroupMember buyerGroupMemeber : [SELECT Id, Name, BuyerGroupId, BuyerId FROM BuyerGroupMember WHERE Buyer.Id = :accountId]) {
                    buyerGroupIdSet.add(buyerGroupMemeber.BuyerGroupId);
                }
                for (CommerceEntitlementBuyerGroup commerceEntitlementBuyerGroup : [
                    SELECT Id, Policy.name
                    FROM CommerceEntitlementBuyerGroup
                    WHERE BuyerGroupId IN :buyerGroupIdSet
                ]) {
                    if (
                        String.isNotBlank(commerceEntitlementBuyerGroup.policy.name) &&
                        commerceEntitlementBuyerGroup.policy.name.equalsIgnoreCase(B2B_Constants.GLOBAL_ENTITLEMENT_VS)
                    ) {
                        entitlementObj.isEligibleForVS = true;
                    } else if (
                        String.isNotBlank(commerceEntitlementBuyerGroup.policy.name) &&
                        commerceEntitlementBuyerGroup.policy.name.equalsIgnoreCase(B2B_Constants.GLOBAL_ENTITLEMENT_RX)
                    ) {
                        entitlementObj.isEligibleForRX = true;
                    }
                }
                return entitlementObj;
            } catch (Exception exceptionInstance) {
                // Throwing custom exception in case of any errors
                B2B_LogUtils.createInfoLog(exceptionInstance.getMessage(), 'B2B_ProductDetailsController', 'Account Id: ' + accountId);
                throw new AuraHandledException('Error while checking eligibility for VS RX');
            }
        }

        @TestVisible
        private List<Product2> getCartItemsProductDetails(Set<String> productSKUSet) {
            return [
                SELECT Id, Name, StockKeepingUnit, toLabel(B2B_Material__c), Description, B2B_Picture_Link__c
                FROM Product2
                WHERE StockKeepingUnit IN :productSKUSet
            ];
        }

        //Start BS-1090
        @TestVisible
        private List<BuyerGroupMember> getBuyerGroupMember(String effectiveAccountId) {
            return [SELECT Id, Name, BuyerGroupId, BuyerId FROM BuyerGroupMember WHERE BuyerId = :effectiveAccountId];
        }

        @TestVisible
        private List<CommerceEntitlementBuyerGroup> getCommerceEntitlementBuyerGroup(Set<String> buyGrpIdSet) {
            String globalVisionSensation = B2B_Constants.GLOBAL_ENTITLEMENT_VS;
            String globalRxSolution = B2B_Constants.GLOBAL_ENTITLEMENT_RX;
            return [
                SELECT Id, Name, PolicyId, Policy.Name, BuyerGroupId
                FROM CommerceEntitlementBuyerGroup
                WHERE BuyerGroupId IN :buyGrpIdSet AND Policy.Name != :globalVisionSensation AND Policy.Name != :globalRxSolution
            ];
        }

        @TestVisible
        private List<CommerceEntitlementProduct> getCommerceEntitlementProduct(List<String> policyIdList) {
            return [SELECT Id, PolicyId, ProductId FROM CommerceEntitlementProduct WHERE PolicyId IN :policyIdList];
        }

        @TestVisible
        private List<ProductCategoryProduct> getProductCategoryProduct(List<Id> productIdList, String applicableCatalogue) {
            return [
                SELECT
                    Product.Id,
                    toLabel(Product.Name),
                    toLabel(Product.B2B_Sparepart_Type__c),
                    Product.B2B_Shipping_Status_JSON__c,
                    Product.B2B_Shape_Size__c,
                    Product.B2B_Lens_Size__c,
                    Product.B2B_EE_Size__c,
                    Product.B2B_Frame_Color__c,
                    Product.B2B_Frame_Color_Description__c,
                    Product.B2B_Finish__c,
                    Product.B2B_Lens_Color__c,
                    Product.B2B_Lens_Color_Description__c,
                    Product.B2B_Temple_Length__c,
                    Product.B2B_Bridge_Size__c,
                    Product.B2B_Brand__c,
                    Product.B2B_Model__c,
                    Product.StockKeepingUnit,
                    Product.B2B_Design_Family__c,
                    Product.B2B_Product_Type__c,
                    Product.B2B_Shape_Height__c,
                    Product.B2B_Variant_Shape__c,
                    ProductCategoryId,
                    ProductCategory.Name,
                    ProductCategory.ParentCategoryId
                FROM ProductCategoryProduct
                WHERE
                    ProductId IN :productIdList
                    AND ProductCategory.Catalog.Name = :applicableCatalogue
                    AND ProductCategory.Name != :B2B_Constants.FEATURED_PRODUCTS_HOMEPAGE
            ];
        }

        @TestVisible
        private List<ProductCategory> getProductCategory(String applicableCatalogue, Integer remainingQueryRowLimit) {
            return [SELECT Id, Name, ParentCategoryId FROM ProductCategory WHERE Catalog.Name = :applicableCatalogue LIMIT :remainingQueryRowLimit];
        }
    }

    /**
     * @desc Wrapper to store the booleans for entitlement of VSRX.
     * Added as part of BS-976
     */
    public class B2B_EntitlementWrapper {
        @AuraEnabled
        public Boolean isEligibleForVS;

        @AuraEnabled
        public Boolean isEligibleForRX;
    }

    /**
     * @desc Wrapper to store the glass details for VS/RX cartItems shown on Cart Page.
     * Added as part of BS-976
     */
    public class B2B_CartGlassDetailsWrapper {
        @AuraEnabled
        public Id cartItemId;

        @AuraEnabled
        public String rxSolutionColor;

        @AuraEnabled
        public String lensMaterial;

        //BS-1269 Start
        @AuraEnabled
        public String rxSolutionImage;

        @AuraEnabled
        public String lensImage;
        //BS-1269 end
    }

    public class B2B_ProductDataWrapper {
        @AuraEnabled
        public Product2 productObj;

        @AuraEnabled
        public Boolean isFrame;

        @AuraEnabled
        public String productCategory; //BS-1568
    }

    public class B2B_CcsFlagWrapper {
        @AuraEnabled
        public Boolean silhouetteCCSFlag; //BS-1714

        @AuraEnabled
        public Boolean evilEyeCCSFlag; //BS-1714
    }
}
