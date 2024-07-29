/*************************************************************************************************************
 * Controller class for NBD2C Store Cart page
 *  @author – Shrihari Kendre
 *  @email shrihari.kendre@theblueflamelabs.com
 *  @create date 2024-05-12 16:18:32
 ***************************************************************************************************************/
public without sharing class D2C_CartController {
    /**
     * @description Get the cart Item information
     * @author Shrihari Kendre
     * @param  cartId  Id of current active cart
     * @return   List<CartItem>
     */
    @AuraEnabled
    public static List<CartItem> getCartItemData(String cartId) {
        List<CartItem> cartItemDetailsList = new List<cartItem>();

        cartItemDetailsList = [
            SELECT
                Id,
                Quantity,
                UnitAdjustedPrice,
                TotalPrice,
                TotalPriceAfterAllAdjustments,
                CurrencyIsoCode,
                Product2Id,
                Product2.B2B_Picture_Link__c,
                Product2.Name,
                Product2.B2B_Model__c,
                Product2.B2B_Shape_Size__c,
                Product2.B2B_Bridge_Size__c,
                Product2.B2B_Temple_Length__c,
                Product2.B2B_Frame_Color_Description__c,
                Product2.StockKeepingUnit,
                Cart.D2C_Order_Type__c
            FROM CartItem
            WHERE CartId = :cartId
        ];

        return cartItemDetailsList;
    }

    /**
     * @description Update the D2C_Order_Type__c field on the current Cart
     * @author Shrihari Kendre
     * @param  cartId  Id of current active cart
     * @param  orderType  type of order
     */
    @AuraEnabled
    public static void updateCartRecord(String cartId, String orderType) {
        if (String.isEmpty(cartId) == false && String.isEmpty(orderType) == false) {
            try {
                WebCart cart = new WebCart();
                cart.Id = cartId;
                cart.D2C_Order_Type__c = orderType;
                update cart;
            } catch (Exception exceptionInstance) {
                throw new AuraHandledException(exceptionInstance.getMessage());
            }
        }
    }
}
