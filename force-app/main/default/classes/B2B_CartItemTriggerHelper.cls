/**
 * @author Chirag L
 * @email  chirag.lapasia@theblueflamelabs.com
 * @desc   This class is a handler for CartItemTrigger and contains various methods to execute according to triggering conditions and functionality
 * BS-1409
 **/
@SuppressWarnings('PMD.avoiddeeplynestedifstmts')
public with sharing class B2B_CartItemTriggerHelper {
    /**
     * BS-1409
     * @description     This method is used to explicitely create/update SH/EE CartItem if VS-RX cartItem for same Product is already present in cart
     * @author Chirag L
     * @param oldCartItemMap    :   This Map contains the state of information of cartItem Id and CartItem object before the user has made changes
     * @param newCartItemMap    :   This Map contains the state of information of cartItem Id and CartItem object after the user has made changes
     */
    public static void createNormalCartItemForExistingVSRXCartItems(Map<Id, CartItem> oldCartItemMap, Map<Id, CartItem> newCartItemMap) {
        try {
            if (newCartItemMap.isEmpty() == false && oldCartItemMap.isEmpty() == false) {
                Map<String, CartItem> normalCartItemsToUpsertMap = new Map<String, CartItem>();
                Set<Id> activeCartIdSet = new Set<Id>();
                Set<String> activeCartItemProductSKUSet = new Set<String>();
                for (CartItem cartItem : newCartItemMap.values()) {
                    if (cartItem.B2B_Type__c != null && cartItem.Quantity != null && cartItem.Quantity > 1) {
                        cartItem.TotalPriceAfterAllAdjustments = oldCartItemMap.containsKey(cartItem.Id) &&
                            oldCartItemMap.get(cartItem.Id).TotalPriceAfterAllAdjustments != null
                            ? oldCartItemMap.get(cartItem.Id).TotalPriceAfterAllAdjustments
                            : 0;
                        cartItem.TotalLineAmount = oldCartItemMap.containsKey(cartItem.Id) && oldCartItemMap.get(cartItem.Id).TotalLineAmount != null
                            ? oldCartItemMap.get(cartItem.Id).TotalLineAmount
                            : 0;
                        cartItem.TotalPrice = oldCartItemMap.containsKey(cartItem.Id) && oldCartItemMap.get(cartItem.Id).TotalPrice != null
                            ? oldCartItemMap.get(cartItem.Id).TotalPrice
                            : 0;
                        cartItem.ListPrice = oldCartItemMap.containsKey(cartItem.Id) && oldCartItemMap.get(cartItem.Id).SalesPrice != null
                            ? oldCartItemMap.get(cartItem.Id).SalesPrice
                            : 0;
                        activeCartIdSet.add(cartItem.CartId);
                        if (cartItem.sku != null) {
                            activeCartItemProductSKUSet.add(cartItem.sku);
                        }
                        CartItem newCartItem = new CartItem();
                        newCartItem.Id = null;
                        newCartItem.B2B_Type__c = null;
                        newCartItem.Quantity = cartItem.Quantity != null ? cartItem.Quantity - 1 : 1;
                        newCartItem.CartId = cartItem.CartId != null ? cartItem.CartId : null;
                        newCartItem.CurrencyIsoCode = cartItem.CurrencyIsoCode != null ? cartItem.CurrencyIsoCode : B2B_Constants.CURRENCY_ISO_CODE_EURO;
                        newCartItem.CartDeliveryGroupId = cartItem.CartDeliveryGroupId != null ? cartItem.CartDeliveryGroupId : null;
                        newCartItem.ListPrice = cartItem.NetUnitPrice != null ? cartItem.NetUnitPrice : 0;
                        newCartItem.GrossUnitPrice = cartItem.GrossUnitPrice != null ? cartItem.GrossUnitPrice : 0;
                        newCartItem.NetUnitPrice = cartItem.GrossUnitPrice != null ? cartItem.NetUnitPrice : 0;
                        newCartItem.SalesPrice = cartItem.SalesPrice != null ? cartItem.SalesPrice : 0;
                        newCartItem.TotalLineAmount = (newCartItem.SalesPrice) * newCartItem.Quantity;
                        newCartItem.UnitAdjustedPrice = newCartItem.TotalLineAmount;
                        newCartItem.TotalPriceAfterAllAdjustments = newCartItem.TotalLineAmount;
                        newcartItem.TotalPrice = newCartItem.TotalLineAmount;
                        newCartItem.Sku = String.isNotBlank(cartItem.Sku) ? cartItem.Sku : '';
                        newCartItem.Name = String.isNotBlank(cartItem.Name) ? cartItem.Name : '';
                        newCartItem.Product2Id = cartItem.Product2Id != null ? cartItem.Product2Id : '';
                        newCartItem.Type = cartItem.Type;
                        normalCartItemsToUpsertMap.put(newCartItem.Sku, newCartItem);
                        cartItem.Quantity = 1;
                    }
                }
                if (normalCartItemsToUpsertMap.isEmpty() == false) {
                    String activeCartStatus = B2B_Constants.WEB_CART_STATUS_ACTIVE;
                    List<CartItem> existingnormalCartItemList = [
                        SELECT
                            Id,
                            Product2.StockKeepingUnit,
                            Quantity,
                            ListPrice,
                            TotalPrice,
                            TotalAdjustmentAmount,
                            TotalAmount,
                            Cart.Status,
                            B2B_Type__c,
                            CartId
                        FROM CartItem
                        WHERE
                            cartId IN :activeCartIdSet
                            AND Product2.StockKeepingUnit IN :activeCartItemProductSKUSet
                            AND Cart.Status = :activeCartStatus
                            AND B2B_Type__c = NULL
                    ];
                    if (existingnormalCartItemList.isEmpty() == false) {
                        for (CartItem existingCartItem : existingnormalCartItemList) {
                            existingCartItem.Quantity += normalCartItemsToUpsertMap.containsKey(existingCartItem.Product2.StockKeepingUnit) &&
                                normalCartItemsToUpsertMap.get(existingCartItem.Product2.StockKeepingUnit).Quantity != null
                                ? normalCartItemsToUpsertMap.get(existingCartItem.Product2.StockKeepingUnit).Quantity
                                : 0;
                            existingCartItem.TotalPrice += normalCartItemsToUpsertMap.containsKey(existingCartItem.Product2.StockKeepingUnit) &&
                                normalCartItemsToUpsertMap.get(existingCartItem.Product2.StockKeepingUnit).TotalPrice != null
                                ? normalCartItemsToUpsertMap.get(existingCartItem.Product2.StockKeepingUnit).TotalPrice
                                : 0;
                        }
                        update existingnormalCartItemList;
                    } else {
                        for (CartItem parsedCartItem : normalCartItemsToUpsertMap.values()) {
                            parsedCartItem.B2B_Type__c = null;
                            parsedCartItem.Id = null;
                        }

                        if (normalCartItemsToUpsertMap.isEmpty() == false) {
                            insert normalCartItemsToUpsertMap.values();
                        }
                    }
                }
            }
        } catch (Exception exceptionInstance) {
            throw new AuraHandledException('Error while performing DML -->' + exceptionInstance.getMessage());
        }
    }
}
