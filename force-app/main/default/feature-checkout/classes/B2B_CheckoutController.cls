public with sharing class B2B_CheckoutController {
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> getAddressInfo(String effectiveAccountId, Boolean isShipping, Boolean isBilling) {
        Map<String, Object> responseMap = new Map<String, Object>();

        List<ContactPointAddress> addresses = new List<ContactPointAddress>();
        List<ContactPointAddress> selectAddresses = new List<ContactPointAddress>();
        String defaultAddress = null;

        List<B2B_CheckoutUtil.Message> messages = new List<B2B_CheckoutUtil.Message>();
        responseMap.put('messages', messages);

        try {
            addresses = [SELECT Address, AddressType, Name, City, Country, IsDefault, IsPrimary FROM ContactPointAddress WHERE ParentId = :effectiveAccountId];

            for (ContactPointAddress addr : addresses) {
                if (isShipping && addr.AddressType == 'Shipping') {
                    selectAddresses.add(addr);

                    if (addr.IsDefault) {
                        defaultAddress = addr.Id;
                    }
                } else if (isBilling && addr.AddressType == 'Billing') {
                    selectAddresses.add(addr);

                    if (addr.IsDefault) {
                        defaultAddress = addr.Id;
                    }
                }
            }

            if (selectAddresses.size() <= 0) {
                String message = null;

                if (isShipping) {
                    message = 'No shipping addresses defined for the account';
                }

                if (isBilling) {
                    message = 'No billing addresses defined for the account';
                }

                throw new CustomException(message);
            }
        } catch (CustomException e) {
            B2B_CheckoutUtil.addMessage(new B2B_CheckoutUtil.Message('Error', e.getMessage(), B2B_CheckoutUtil.ERROR), 0, responseMap);
        } catch (Exception err) {
            System.debug('Processing error' + ': ' + err.getMessage());
            System.debug('Line #: ' + err.getLineNumber());
            System.debug(err.getStackTraceString());
        }

        responseMap.put('addresses', selectAddresses);

        responseMap.put('defaultAddress', defaultAddress);

        List<B2B_CheckoutUtil.Message> retMessages = (List<B2B_CheckoutUtil.Message>) responseMap.get('messages');

        String messagesJson = JSON.serialize(retMessages);

        responseMap.put('messagesJson', messagesJson);
        return responseMap;
    }

    @AuraEnabled
    public static Map<String, String> fetchInitValues(String communityId, String effectiveAccountId, String cartId) {
        Map<String, String> responseMap = new Map<String, String>();

        String webstoreId = B2B_Utils.resolveWebstoreId(communityId);

        responseMap.put('webstoreId', webstoreId);

        //responseMap.put('effectiveAccountId', effectiveAccountId);

        if (cartId == null && effectiveAccountId != '000000000000000') {
            ConnectApi.CartSummary cs = null;
            if (Test.isRunningTest() == false) {
                cs = ConnectApi.CommerceCart.getOrCreateActiveCartSummary(webstoreId, effectiveAccountId, 'active');
            } else {
                cs = new ConnectApi.CartSummary();
                cs.cartId = cartId;
                cs.accountId = effectiveAccountId;
            }

            responseMap.put('cartId', cs.cartId);

            responseMap.put('effectiveAccountId', cs.accountId);
        } else {
            responseMap.put('cartId', cartId);
        }

        return responseMap;
    }

    @AuraEnabled(cacheable=false)
    public static Map<String, String> getCartSummary(
        String effectiveAccountId,
        String webstoreId,
        String activeOrCartId,
        Boolean recalculateTax,
        Boolean useDefaultRate
    ) {
        Map<String, String> responseMap = new Map<String, String>();

        ConnectApi.CartSummary cs = null;

        try {
            // Update the tax
            if (recalculateTax) {
                //B2B_SPC_TaxSample.updateCartTax(activeOrCartId, useDefaultRate);
            }

            if (Test.isRunningTest() == false) {
                cs = ConnectApi.CommerceCart.getCartSummary(webstoreId, effectiveAccountId, activeOrCartId);
            } else {
                cs = new ConnectApi.CartSummary();
                cs.grandTotalAmount = '1000';
                cs.totalTaxAmount = '10';
                cs.totalProductAmount = '990';
                // FFEIX[03/11/22] : Add Promotion
                cs.totalPromotionalAdjustmentAmount = '-9';
                // FFEIX:END
            }

            responseMap.put('grandTotalAmount', cs.grandTotalAmount);
            responseMap.put('totalTaxAmount', cs.totalTaxAmount);
            responseMap.put('totalProductAmount', cs.totalProductAmount);
            // FFEIX[03/11/22] : Add Promotion
            responseMap.put('totalPromotionalAdjustmentAmount', cs.totalPromotionalAdjustmentAmount);
            // FFEIX:END

            // Get the shipping fee

            // Get the cart item records

            List<CartItem> cartItemObjects = [
                SELECT Id, CartDeliveryGroupId, CartDeliveryGroup.DeliveryMethodId
                FROM CartItem
                WHERE CartId = :activeOrCartId AND CartDeliveryGroupId != NULL
            ];

            if (cartItemObjects.size() > 0) {
                CartItem cartItemObj = cartItemObjects.get(0);

                String cartDeliveryGroupId = cartItemObj.CartDeliveryGroupId;
                String deliveryMethodId = cartItemObj.CartDeliveryGroup.DeliveryMethodId;

                List<CartDeliveryGroupMethod> cdgmList = [
                    SELECT Id, CartDeliveryGroupId, DeliveryMethodId, DeliveryMethod.Name, DeliveryMethod.Carrier, ExternalProvider, Name, ShippingFee
                    FROM CartDeliveryGroupMethod
                    WHERE CartDeliveryGroupId = :cartDeliveryGroupId AND DeliveryMethodId = :deliveryMethodId
                ];

                if (cdgmList.size() > 0) {
                    CartDeliveryGroupMethod cdgm = cdgmList.get(0);

                    responseMap.put('shippingFee', cdgm.ShippingFee.format());
                } else {
                    responseMap.put('shippingFee', '0');
                }
            } else {
                responseMap.put('shippingFee', '0');
            }
        } catch (Exception err) {
            System.debug('Processing error' + ': ' + err.getMessage());
            System.debug('Line #: ' + err.getLineNumber());
            System.debug(err.getStackTraceString());

            throw new AuraHandledException(err.getMessage());
        }

        return responseMap;
    }

    /*
        Returns
            a list of CartDeliveryGroupMethod records
            the Id of the selected OrderDeliveryMethod record as the selected option.

        Piggybacks off of the open-source B2BPrepareDeliveryMethodSelections.cls
        from https://github.com/forcedotcom/b2b-commerce-on-lightning-quickstart

        In the LWC, the user will select the Delivery method, and the CartDeliveryGroupMethod Id will be sent for processing.
    */
    @AuraEnabled
    public static Map<String, Object> fetchDeliveryMethods(String cartId) {
        Map<String, Object> responseMap = new Map<String, Object>();

        List<ID> cartIds = new List<ID>();
        cartIds.add(cartId);

        try {
            // Use the open source class to get the shipping options and create the CartDeliveryGroupMethods for the cart
            B2B_CheckoutDeliveryMethods.prepDeliveryMethodsInternal(cartIds);

            // Retrieve the CartDeliveryGroupMethods and return them as a List
            List<CartDeliveryGroupMethod> cdgmList = [
                SELECT Id, CartDeliveryGroupId, DeliveryMethodId, DeliveryMethod.Name, DeliveryMethod.Carrier, ExternalProvider, Name, ShippingFee
                FROM CartDeliveryGroupMethod
                WHERE WebCartId = :cartId
            ];

            if (cdgmList.size() > 0) {
                responseMap.put('cartDeliveryGroupMethods', cdgmList);
            }

            /*
                If the user has previously selected a delivery method for the cart,
                return that Id as the selected option.
            */
            List<CartItem> cartItemObjs = [
                SELECT Id, Name, Type, CartDeliveryGroupId, CartDeliveryGroup.DeliveryMethodId
                FROM CartItem
                WHERE CartId = :cartId AND CartDeliveryGroupId != NULL
            ];

            String deliveryMethodId = null;

            if (cartItemObjs.size() > 0) {
                CartItem cartItem = cartItemObjs.get(0);
                deliveryMethodId = cartItem.CartDeliveryGroup.DeliveryMethodId;
            }

            if (deliveryMethodId != null) {
                responseMap.put('selectedDeliveryMethodId', deliveryMethodId);
            }
        } catch (Exception e) {
            System.debug('Processing error' + ': ' + e.getMessage());
            System.debug('Line #: ' + e.getLineNumber());
            System.debug(e.getStackTraceString());

            throw new AuraHandledException(e.getMessage());
        }

        return responseMap;
    }

    /*
        Creates a CartItem "Charge" record for the selected delivery method.
        The selected order delivery method is assigned to the cart delivery group record.
    */
    @AuraEnabled
    public static Map<String, Object> setCartItemDeliveryGroup(String cartDeliveryGroupMethodId, String deliveryMethodId, String cartId) {
        Map<String, Object> responseMap = new Map<String, Object>();

        try {
            // Get the selected OrderDeliveryMethod record
            // This has the Product record Id needed for the CartItem

            OrderDeliveryMethod deliveryMethod = null;

            List<OrderDeliveryMethod> dmList = [SELECT Id, Name, Carrier, ProductId FROM OrderDeliveryMethod WHERE Id = :deliveryMethodId];

            if (dmList.size() > 0) {
                deliveryMethod = dmList.get(0);
            } else {
                throw new CustomException('OrderDeliveryMethod not found');
            }

            // Get the CartDeliveryGroupMethod record
            // This has the ShippingFee

            CartDeliveryGroupMethod cdgm = null;

            List<CartDeliveryGroupMethod> cdgmList = [
                SELECT Id, CartDeliveryGroupId, ShippingFee
                FROM CartDeliveryGroupMethod
                WHERE Id = :cartDeliveryGroupMethodId AND WebCartId = :cartId
            ];

            if (cdgmList.size() > 0) {
                cdgm = cdgmList.get(0);
            } else {
                throw new CustomException('CartDeliveryGroupMethod not found');
            }

            // Get the ID of the CartDeliveryGroup.
            // There is one CartDeliveryGroup per cart, and it is associated with every CartItem in the Cart.
            Id cartDeliveryGroupId = [SELECT CartDeliveryGroupId FROM CartItem WHERE CartId = :cartId][0].CartDeliveryGroupId;

            // Get the existing CartItem record for the delivery charge
            List<CartItem> cartItemObjs = [SELECT Id FROM CartItem WHERE CartId = :cartId AND Type = 'Charge'];

            CartItem cartItemCharge = null;

            if (cartItemObjs.size() > 0) {
                cartItemCharge = cartItemObjs.get(0);
            } else {
                cartItemCharge = new CartItem(
                    Type = 'Charge',
                    Product2Id = deliveryMethod.ProductId,
                    Quantity = 1.0,
                    AdjustmentAmount = 0.0,
                    CartId = cartId,
                    CartDeliveryGroupId = cartDeliveryGroupId,
                    Name = 'Shipping Cost'
                );
            }

            cartItemCharge.TotalPrice = cdgm.ShippingFee;
            cartItemCharge.ListPrice = cdgm.ShippingFee;
            cartItemCharge.TotalListPrice = cdgm.ShippingFee;
            cartItemCharge.TotalLineAmount = cdgm.ShippingFee;

            upsert cartItemCharge;

            // A delivery method has to be associated to the cart delivery group.
            addOrderDeliveryMethodToCartDeliveryGroup(deliveryMethod.Id, cartDeliveryGroupId);
        } catch (Exception e) {
            System.debug('Processing error' + ': ' + e.getMessage());
            System.debug('Line #: ' + e.getLineNumber());
            System.debug(e.getStackTraceString());

            B2B_CheckoutUtil.addMessage(new B2B_CheckoutUtil.Message('Error', e.getMessage(), B2B_CheckoutUtil.ERROR), 0, responseMap);

            //throw new AuraHandledException(err.getMessage());
        }

        List<B2B_CheckoutUtil.Message> retMessages = (List<B2B_CheckoutUtil.Message>) responseMap.get('messages');

        String messagesJson = JSON.serialize(retMessages);
        responseMap.put('messagesJson', messagesJson);

        return responseMap;
    }

    private static void addOrderDeliveryMethodToCartDeliveryGroup(Id someOrderDeliveryMethodId, Id someCartDeliveryGroupId) {
        // The OrderDeliveryMethod is added to the CartDeliveryGroup for the order to be properly created during checkout.
        CartDeliveryGroup cartDeliveryGroup = [SELECT Id, DeliveryMethodId FROM CartDeliveryGroup WHERE Id = :someCartDeliveryGroupId][0];
        cartDeliveryGroup.DeliveryMethodId = someOrderDeliveryMethodId;
        update cartDeliveryGroup;
    }

    @AuraEnabled
    public static Map<String, Object> setCartDeliveryGroupShipToAddress(String contactPointAddress, String cartId) {
        Map<String, Object> responseMap = new Map<String, Object>();
        List<B2B_CheckoutUtil.Message> messages = new List<B2B_CheckoutUtil.Message>();
        responseMap.put('messages', messages);

        try {
            // Get the CartDeliveryGroup record
            CartDeliveryGroup deliveryGroup = null;

            List<CartDeliveryGroup> deliveryGroups = [SELECT Id FROM CartDeliveryGroup WHERE CartId = :cartId];

            if (deliveryGroups.size() > 0) {
                deliveryGroup = deliveryGroups.get(0);
            }

            // Get the ContactPointAddress record

            ContactPointAddress pointAddress = null;

            List<ContactPointAddress> addresses = [SELECT Id, Name, Address FROM ContactPointAddress WHERE Id = :contactPointAddress];

            if (addresses.size() > 0) {
                pointAddress = addresses.get(0);
            }

            // Update the CartDeliveryGroup with the ContactPointAddress info
            Address theAddress = (Address) pointAddress.Address;
            deliveryGroup.DeliverToCity = theAddress.getCity();
            deliveryGroup.DeliverToCountry = theAddress.getCountry();
            deliveryGroup.DeliverToGeocodeAccuracy = theAddress.getGeocodeAccuracy();
            deliveryGroup.DeliverToLatitude = theAddress.getLatitude();
            deliveryGroup.DeliverToLongitude = theAddress.getLongitude();
            deliveryGroup.DeliverToName = pointAddress.Name;
            deliveryGroup.DeliverToPostalCode = theAddress.getPostalCode();
            deliveryGroup.DeliverToState = theAddress.getState();
            deliveryGroup.DeliverToStreet = theAddress.getStreet();

            upsert deliveryGroup;
        } catch (Exception e) {
            System.debug('Processing error' + ': ' + e.getMessage());
            System.debug('Line #: ' + e.getLineNumber());
            System.debug(e.getStackTraceString());

            B2B_CheckoutUtil.addMessage(new B2B_CheckoutUtil.Message('Error', e.getMessage(), B2B_CheckoutUtil.ERROR), 0, responseMap);
        }

        List<B2B_CheckoutUtil.Message> retMessages = (List<B2B_CheckoutUtil.Message>) responseMap.get('messages');

        String messagesJson = JSON.serialize(retMessages);
        responseMap.put('messagesJson', messagesJson);

        return responseMap;
    }

    public class CustomException extends Exception {
    }

    /*
        Returns 
            a list of CartDeliveryGroupMethod records
            the Id of the selected OrderDeliveryMethod record as the selected option.

        Piggybacks off of the open-source B2BPrepareDeliveryMethodSelections.cls
        from https://github.com/forcedotcom/b2b-commerce-on-lightning-quickstart

        In the LWC, the user will select the Delivery method, and the CartDeliveryGroupMethod Id will be sent for processing.
    */
    @AuraEnabled
    public static Map<String, Object> fetchDefaultDeliveryMethod(String cartId) {
        Map<String, Object> responseMap = new Map<String, Object>();

        List<B2B_CheckoutUtil.Message> messages = new List<B2B_CheckoutUtil.Message>();
        responseMap.put('messages', messages);

        List<ID> cartIds = new List<ID>();
        cartIds.add(cartId);

        try {
            // Use the open source class to get the shipping options and create the CartDeliveryGroupMethods for the cart
            B2B_CheckoutDeliveryMethods.prepDefaultDeliveryMethodInternal(cartIds);

            // Retrieve the CartDeliveryGroupMethods and return them as a List
            List<CartDeliveryGroupMethod> cdgmList = [
                SELECT Id, CartDeliveryGroupId, DeliveryMethodId, DeliveryMethod.Name, DeliveryMethod.Carrier, ExternalProvider, Name, ShippingFee
                FROM CartDeliveryGroupMethod
                WHERE WebCartId = :cartId
            ];

            if (cdgmList.size() > 0) {
                responseMap.put('cartDeliveryGroupMethods', cdgmList);
            } else {
                throw new CustomException('No-Charge Shipping option not found');
            }

            CartDeliveryGroupMethod cdgm = cdgmList.get(0);

            // Pass the Id of the default back to the component
            //responseMap.put('defaultDeliveryMethodId', cdgm.DeliveryMethodId);

            // Set the CartDeliveryGroup to the default CartDeliveryGroupMethod and (Order)DeliveryMethod
            updateCartItemDeliveryGroup(cdgm.Id, cdgm.DeliveryMethodId, cartId);

            //B2B_CheckoutUtil.addMessage(new B2B_CheckoutUtil.Message('Processing Message', 'No-charge delivery method applied', B2B_CheckoutUtil.INFO), 0, responseMap);

            /* 
                Get the delivery method assigned to the CartItem records
                The list will be be empty if the user has not yet selected a delivery method.
            */
            List<CartItem> cartItemObjs = [
                SELECT Id, Name, Type, CartDeliveryGroupId, CartDeliveryGroup.DeliveryMethodId
                FROM CartItem
                WHERE CartId = :cartId AND CartDeliveryGroupId != NULL
            ];

            String deliveryMethodId = null;

            /*
                If the user has previously selected a delivery method for the cart,
                return that Id as the selected option.
            */
            if (cartItemObjs.size() > 0) {
                CartItem cartItem = cartItemObjs.get(0);
                deliveryMethodId = cartItem.CartDeliveryGroup.DeliveryMethodId;
            }

            if (deliveryMethodId != null) {
                responseMap.put('selectedDeliveryMethodId', deliveryMethodId);
            }
        } catch (Exception e) {
            System.debug('Processing error' + ': ' + e.getMessage());
            System.debug('Line #: ' + e.getLineNumber());
            System.debug(e.getStackTraceString());
        }

        List<B2B_CheckoutUtil.Message> retMessages = (List<B2B_CheckoutUtil.Message>) responseMap.get('messages');

        String messagesJson = JSON.serialize(retMessages);
        responseMap.put('messagesJson', messagesJson);

        return responseMap;
    }

    @TestVisible
    private static void updateCartItemDeliveryGroup(String cartDeliveryGroupMethodId, String deliveryMethodId, String cartId) {
        // Get the selected OrderDeliveryMethod record
        // This has the Product record Id needed for the CartItem

        OrderDeliveryMethod deliveryMethod = null;

        List<OrderDeliveryMethod> dmList = [SELECT Id, Name, Carrier, ProductId FROM OrderDeliveryMethod WHERE Id = :deliveryMethodId];

        if (dmList.size() > 0) {
            deliveryMethod = dmList.get(0);
        } else {
            throw new CustomException('OrderDeliveryMethod not found');
        }

        // Get the CartDeliveryGroupMethod record
        // This has the ShippingFee

        CartDeliveryGroupMethod cdgm = null;

        List<CartDeliveryGroupMethod> cdgmList = [
            SELECT Id, CartDeliveryGroupId, ShippingFee
            FROM CartDeliveryGroupMethod
            WHERE Id = :cartDeliveryGroupMethodId AND WebCartId = :cartId
        ];

        if (cdgmList.size() > 0) {
            cdgm = cdgmList.get(0);
        } else {
            throw new CustomException('CartDeliveryGroupMethod not found');
        }

        // Get the ID of the CartDeliveryGroup.
        // There is one CartDeliveryGroup per cart, and it is associated with every CartItem in the Cart.
        Id cartDeliveryGroupId = [SELECT CartDeliveryGroupId FROM CartItem WHERE CartId = :cartId][0].CartDeliveryGroupId;

        // Get the existing CartItem record for the delivery charge
        List<CartItem> cartItemObjs = [SELECT Id FROM CartItem WHERE CartId = :cartId AND Type = 'Charge'];

        CartItem cartItemCharge = null;

        if (cartItemObjs.size() > 0) {
            cartItemCharge = cartItemObjs.get(0);
        } else {
            cartItemCharge = new CartItem(
                Type = 'Charge',
                Product2Id = deliveryMethod.ProductId,
                Quantity = 1.0,
                AdjustmentAmount = 0.0,
                CartId = cartId,
                CartDeliveryGroupId = cartDeliveryGroupId,
                Name = 'Shipping Cost'
            );
        }

        cartItemCharge.TotalPrice = cdgm.ShippingFee;
        cartItemCharge.ListPrice = cdgm.ShippingFee;
        cartItemCharge.SalesPrice = cdgm.ShippingFee;
        cartItemCharge.TotalListPrice = cdgm.ShippingFee;
        cartItemCharge.TotalLineAmount = cdgm.ShippingFee;

        upsert cartItemCharge;

        // A delivery method has to be associated to the cart delivery group.
        addOrderDeliveryMethodToCartDeliveryGroup(deliveryMethod.Id, cartDeliveryGroupId);
    }

    @AuraEnabled(cacheable=false)
    public static Map<String, Object> fetchCartDeliveryGroupAddress(String cartId) {
        Map<String, Object> responseMap = new Map<String, Object>();

        List<CartDeliveryGroup> cdgList = [
            SELECT Id, Name, DeliverToName, DeliverToStreet, DeliverToCity, DeliverToState, DeliverToPostalCode, DeliverToCountry
            FROM CartDeliveryGroup
            WHERE CartId = :cartId
        ];

        CartDeliveryGroup cdg = null;

        if (cdgList.size() > 0) {
            cdg = cdgList.get(0);
        }

        responseMap.put('cartDeliveryGroup', cdg);

        return responseMap;
    }
    @AuraEnabled(cacheable=true)
    /**
     * @description create Order Document Request Record.
     * @author Vishalsingh Gaur
     * @param  effectiveAccountId effectiveAccountId
     * @return Account
     */
    public static Account getAccountInfos(String effectiveAccountId) {
        String query = 'SELECT Id, k_Billing_Name__c, toLabel(Monthly_Billing__c), k_Partial_Delivery__c, k_Billing_City__c, k_Billing_Country__c, k_Billing_Postal_Code__c, k_Billing_Street__c FROM Account WHERE Id =:effectiveAccountId';
        List<Account> accountList = Database.query(query);
        return !accountList.isEmpty() ? accountList[0] : null;
    }

    @AuraEnabled(Cacheable=false)
    /**
     * @description create Order Record and call a method to create orderItem record. //BS-303
     * @author Vishalsingh Gaur
     * @param  communityId communityId, @param effectiveAccountId effectiveAccountId
     * @param  activeCartOrId activeCartOrId, @param pageParam pageParam
     * @param  pageSize pageSize, @param sortParam sortParam
     * @param  selectedAddress selectedAddress, @param poNumber poNumber
     * @return void
     */
    public static void createOrder(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId,
        String pageParam,
        Integer pageSize,
        String sortParam,
        String selectedAddress,
        String poNumber,
        Boolean isShStore,
        String currencyIsoCode //BS-1245 : Added currencyIsoCode as input parameter
    ) {
        if (isShStore == false) {
            //Block to create order for NB shop
            try {
                Id orderRecordTypeId = Schema.SObjectType.Order.getRecordTypeInfosByName().get(Bfl_Constant.B2B_ORDER_RECORDTYPE).getRecordTypeId();
                OrderTriggerHelper.isOrderFromB2BCheckout = true; //BS-587
                Order orderObject = new Order();

                orderObject.AccountId = effectiveAccountId;
                orderObject.Status = Bfl_Constant.ORDER_STATUS_ORDER_SENT;
                orderObject.OrderedDate = Datetime.now();
                orderObject.EffectiveDate = Date.today();
                orderObject.B2B_PO_Number__c = poNumber;
                orderObject.RecordTypeId = orderRecordTypeId;
                orderObject.Order_Source__c = Bfl_Constant.ORDER_SOURCE_B2B_SHOP;

                //BS-1245 : Added currencyIsoCode field mapping
                if (String.isNotBlank(currencyIsoCode)) {
                    orderObject.CurrencyIsoCode = currencyIsoCode;
                }
                //BS-1245
                insert orderObject;
                //Create for orderItems for NB shop
                createOrderItems(communityId, effectiveAccountId, activeCartOrId, pageParam, pageSize, sortParam, selectedAddress, poNumber, orderObject);
            } catch (Exception e) {
                OrderTriggerHelper.isOrderFromB2BCheckout = false; //BS-587
                B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_CheckoutController', 'AccountId: ' + effectiveAccountId);
                throw new AuraHandledException(e.getMessage());
            }
        } else {
            //Block to create order for SH shop
            createShOrders(communityId, effectiveAccountId, activeCartOrId, pageParam, pageSize, sortParam, selectedAddress, poNumber, currencyIsoCode); // BS-1245 : Added currencyIsoCode as input parameter
        }
    }

    /**
     * @description create OrderItms record from cart items.
     * @author Vishalsingh Gaur
     * @param  communityId communityId, @param effectiveAccountId effectiveAccountId
     * @param  activeCartOrId activeCartOrId, @param pageParam pageParam
     * @param  pageSize pageSize, @param sortParam sortParam
     * @param  selectedAddress selectedAddress, @param poNumber poNumber
     * @param orderObject orderObject
     * @return  Void
     */
    public static void createOrderItems(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId,
        String pageParam,
        Integer pageSize,
        String sortParam,
        String selectedAddress,
        String poNumber,
        Order orderObject
    ) {
        try {
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
            List<OrderItem> orderItemList = new List<OrderItem>();
            OrderItem orderItem;
            List<String> orderItemIdList = new List<String>();
            for (ConnectApi.CartItemResult cartItemResult : cartItemsList) {
                orderItemIdList.add(cartItemResult.cartItem.cartItemId);
            }
            Map<Id, CartItem> cartItemIdVsCartItemMap = B2B_CartController.getCartItemData(orderItemIdList);
            for (ConnectApi.CartItemResult cartItemResult : cartItemsList) {
                cartItem = cartItemResult.cartItem;
                orderItem = new OrderItem();
                orderItem.OrderId = orderObject.Id;
                orderItem.B2B_Customer_Reference__c = cartItemIdVsCartItemMap.get(cartItem.cartItemId).Customer_Reference__c != null
                    ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).Customer_Reference__c
                    : null;
                orderItem.B2B_Employee_Name__c = cartItemIdVsCartItemMap.get(cartItem.cartItemId).Entered_By__c != null
                    ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).Entered_By__c
                    : null;
                orderItem.B2B_Ship_to_ID__c = selectedAddress;
                orderItem.Quantity = Integer.valueOf(cartItem.quantity);
                orderItem.Product2Id = cartItem.productId;
                orderItem.ListPrice = cartItemIdVsCartItemMap.get(cartItem.cartItemId).ListPrice != null
                    ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).ListPrice
                    : 0;
                orderItem.TotalLineAmount = cartItemIdVsCartItemMap.get(cartItem.cartItemId).TotalLineAmount != null
                    ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).TotalLineAmount
                    : 0;
                orderItemList.add(orderItem);
            }
            insert orderItemList;

            WebCart currentCart = new WebCart(Id = cartItemCollection.cartSummary.cartId);
            currentCart.status = Bfl_Constant.CART_STATUS_CLOSED;
            update currentCart;
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_CheckoutController', 'OrderId: ' + orderObject.Id);
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * @description create OrderItms record from cart items.
     * @author Vishalsingh Gaur
     * @param  communityId communityId, @param effectiveAccountId effectiveAccountId
     * @param  activeCartOrId activeCartOrId, @param pageParam pageParam
     * @param  pageSize pageSize, @param sortParam sortParam
     * @param  selectedAddress selectedAddress, @param poNumber poNumber
     * @param orderObject orderObject
     * @return  Void
     */
    public static void createShOrders(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId,
        String pageParam,
        Integer pageSize,
        String sortParam,
        String selectedAddress,
        String poNumber,
        String currencyIsoCode //BS-1245 : Added currencyIsoCode as input parameter
    ) {
        ConnectApi.CartItemCollection cartItemCollection = B2B_CartController.getCartItems(
            communityId,
            effectiveAccountId,
            activeCartOrId,
            pageParam,
            pageSize,
            sortParam
        );
        Id orderRecordTypeId = Schema.SObjectType.Order.getRecordTypeInfosByName().get(Bfl_Constant.B2B_ORDER_RECORDTYPE).getRecordTypeId();

        List<ConnectApi.CartItemResult> cartItemsList = cartItemCollection.cartItems;
        ConnectApi.AbstractCartItem cartItem;
        List<OrderItem> orderItemList = new List<OrderItem>();
        OrderItem orderItem;
        Boolean isOrderCreated = false;
        Map<String, Order> orderItemVsOrderMap = new Map<String, Order>(); //cartItemVsOrderObject
        Order orderObject;
        //Map<String,List<CartItem>> itemTypeVsCartItemMap = new Map<String,List<CartItem>>();
        List<String> cartItemIdList = new List<String>(); //List used to fetch information related to the cartItem
        Map<String, B2B_Lens_Configurator__c> cartItemIdVsLensConfigMap = new Map<String, B2B_Lens_Configurator__c>();

        for (ConnectApi.CartItemResult cartItemResult : cartItemsList) {
            cartItemIdList.add(cartItemResult.cartItem.cartItemId);
        }
        //BS-1302 creating a query to fetch the data of lens configurator
        String lensConfigListQuery = 'SELECT ';
        for (Schema.FieldSetMember fieldSetInstance : SObjectType.B2B_Lens_Configurator__c.FieldSets.B2B_Order_Mapping_Fieldset.getFields()) {
            lensConfigListQuery += ' ' + fieldSetInstance.getFieldPath() + ',';
        }
        lensConfigListQuery = lensConfigListQuery.removeEnd(',');
        lensConfigListQuery += ' FROM B2B_Lens_Configurator__c WHERE B2B_Cart_Item__c IN :cartItemIdList';

        List<B2B_Lens_Configurator__c> lensConfiguratorList = Database.query(lensConfigListQuery);
        if (lensConfiguratorList.isEmpty() == false) {
            for (B2B_Lens_Configurator__c lensConfigObj : lensConfiguratorList) {
                cartItemIdVsLensConfigMap.put(lensConfigObj.B2B_Cart_Item__c, lensConfigObj);
            }
        }

        Map<Id, CartItem> cartItemIdVsCartItemMap = B2B_CartController.getCartItemData(cartItemIdList);
        for (CartItem cartItemObj : cartItemIdVsCartItemMap.values()) {
            // Created one order for all normal shop orders
            if (cartItemObj.B2B_Type__C == null) {
                if (isOrderCreated == false) {
                    orderObject = new Order();

                    orderObject.AccountId = effectiveAccountId;
                    orderObject.Status = Bfl_Constant.ORDER_STATUS_ORDER_SENT;
                    orderObject.OrderedDate = Datetime.now();
                    orderObject.EffectiveDate = Date.today();
                    orderObject.B2B_PO_Number__c = poNumber;
                    orderObject.RecordTypeId = orderRecordTypeId;
                    orderObject.Order_Source__c = Bfl_Constant.ORDER_SOURCE_B2B_SHOP;

                    //BS-1245 : Added currencyIsoCode field mapping
                    if (String.isNotBlank(currencyIsoCode)) {
                        orderObject.CurrencyIsoCode = currencyIsoCode;
                    }
                    //BS-1245

                    orderItemVsOrderMap.put(B2B_Constants.NORMAL_SHOP_ORDER_KEY, orderObject);
                    isOrderCreated = true;
                }
            } else {
                // Created one order for each individual VS/RX orders

                orderObject = new Order();
                orderObject.AccountId = effectiveAccountId;
                orderObject.Status = Bfl_Constant.ORDER_STATUS_ORDER_SENT;
                orderObject.OrderedDate = Datetime.now();
                orderObject.EffectiveDate = Date.today();
                orderObject.B2B_PO_Number__c = poNumber;
                orderObject.RecordTypeId = orderRecordTypeId;
                orderObject.Order_Source__c = Bfl_Constant.ORDER_SOURCE_B2B_SHOP;

                //BS-1245 : Added currencyIsoCode field mapping
                if (String.isNotBlank(currencyIsoCode)) {
                    orderObject.CurrencyIsoCode = currencyIsoCode;
                }
                //BS-1245

                //BS-1302 populating fields value on order fetched from lens configurator
                if (cartItemIdVsLensConfigMap.containsKey(cartItemObj.Id)) {
                    orderObject.B2B_Order_Type__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Type__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Type__c
                        : null;
                    orderObject.B2B_Customer_Name__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Customer_Name__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Customer_Name__c
                        : null;
                    orderObject.B2B_Configuration_Type__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Order_Type__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Order_Type__c
                        : null;
                    orderObject.B2B_Clerk__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Clerk__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Clerk__c
                        : null;
                    orderObject.B2B_without_clipin__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_without_clipin__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_without_clipin__c
                        : null;
                    orderObject.B2B_Addition_Left__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Addition_Left__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Addition_Left__c
                        : null;
                    orderObject.B2B_Addition_Right__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Addition_Right__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Addition_Right__c
                        : null;
                    orderObject.B2B_Axis_Left__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Axis_Left__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Axis_Left__c
                        : null;
                    orderObject.B2B_Axis_Right__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Axis_Right__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Axis_Right__c
                        : null;
                    orderObject.B2B_Cylinder_Left__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Cylinder_Left__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Cylinder_Left__c
                        : null;
                    orderObject.B2B_Cylinder_Right__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Cylinder_Right__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Cylinder_Right__c
                        : null;
                    orderObject.B2B_Prism_1_Left__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Prism_1_Left__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Prism_1_Left__c
                        : null;
                    orderObject.B2B_Prism_1_Right__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Prism_1_Right__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Prism_1_Right__c
                        : null;
                    orderObject.B2B_Prism2_Left__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Prism2_Left__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Prism2_Left__c
                        : null;
                    orderObject.B2B_Prism2_Right__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Prism2_Right__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Prism2_Right__c
                        : null;
                    orderObject.B2B_Prism_base2_Left__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Prism_base2_Left__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Prism_base2_Left__c
                        : null;
                    orderObject.B2B_Prism_base2_Right__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Prism_base2_Right__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Prism_base2_Right__c
                        : null;
                    orderObject.B2B_Sphere_Right__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Sphere_Right__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Sphere_Right__c
                        : null;
                    orderObject.B2B_PB1Placement_Left__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_PB1Placement_Left__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_PB1Placement_Left__c
                        : null;
                    orderObject.B2B_PB1_Left__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_PB1_Left__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_PB1_Left__c
                        : null;
                    orderObject.B2B_PB1_Right__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_PB1_Right__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_PB1_Right__c
                        : null;
                    orderObject.B2B_PB1Placement_Right__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_PB1Placement_Right__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_PB1Placement_Right__c
                        : null;
                    orderObject.B2B_PB2Placement_Right__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_PB2Placement_Right__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_PB2Placement_Right__c
                        : null;
                    orderObject.B2B_PB2Placement_Left__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_PB2Placement_Left__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_PB2Placement_Left__c
                        : null;
                    orderObject.B2B_Sphere_Left__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Sphere_Left__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Sphere_Left__c
                        : null;
                    orderObject.B2B_Eye_Side__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Eye_Side__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Eye_Side__c
                        : null;
                    orderObject.B2B_Base_Values__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Base_Values__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Base_Values__c
                        : null;
                    orderObject.B2B_BVD_refracted__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_BVD_refracted__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_BVD_refracted__c
                        : null;
                    orderObject.B2B_BVD_worn__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_BVD_worn__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_BVD_worn__c
                        : null;
                    orderObject.B2B_Fitting_height_Left_Eye__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Fitting_height_Left_Eye__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Fitting_height_Left_Eye__c
                        : null;
                    orderObject.B2B_Fitting_height_Right_Eye__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Fitting_height_Right_Eye__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Fitting_height_Right_Eye__c
                        : null;
                    orderObject.B2B_Pantoscopic_tilt__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Pantoscopic_tilt__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Pantoscopic_tilt__c
                        : null;
                    orderObject.B2B_Pupil_Distance_Left_Eye__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Pupil_Distance_Left_Eye__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Pupil_Distance_Left_Eye__c
                        : null;
                    orderObject.B2B_Pupil_Distance_Right_Eye__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Pupil_Distance_Right_Eye__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Pupil_Distance_Right_Eye__c
                        : null;
                    orderObject.B2B_Measurement_System__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Measurement_System__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Measurement_System__c
                        : null;
                    orderObject.B2B_Working_Distance__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Working_Distance__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Working_Distance__c
                        : null;
                    orderObject.B2B_Thickness_Matching_Calculator_Left__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id)
                            .B2B_Thickness_Matching_Calculator_Left__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Thickness_Matching_Calculator_Left__c
                        : null;
                    orderObject.B2B_Thickness_Matching_Calculator_Right__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id)
                            .B2B_Thickness_Matching_Calculator_Right__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Thickness_Matching_Calculator_Right__c
                        : null;
                    orderObject.B2B_Special_Handling__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Special_Handling__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Special_Handling__c
                        : null;
                    orderObject.B2B_Note__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Note__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Note__c
                        : null;
                    orderObject.B2B_Customer_Service_Preference__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Customer_Service_Preference__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Customer_Service_Preference__c
                        : null;
                    orderObject.B2B_RX_Solution__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_RX_Solution__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_RX_Solution__c
                        : null;
                    orderObject.B2B_RX_Type__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_RX_Type__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_RX_Type__c
                        : null;
                    orderObject.B2B_Lens_Type__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Type__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Type__c
                        : null;
                    orderObject.B2B_Lens_Index__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Index__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Index__c
                        : null;
                    orderObject.B2B_Antireflection_SKU__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Antireflection_SKU__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Antireflection_SKU__c
                        : null;
                    orderObject.B2B_Hard_Coating_SKU__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Hard_Coating_SKU__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Hard_Coating_SKU__c
                        : null;
                    orderObject.B2B_RX_Solution_Description__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_RX_Solution_Description__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_RX_Solution_Description__c
                        : null;
                    orderObject.B2B_Lens_Material__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Material__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Material__c
                        : null;
                    //BS- 1270 start
                    orderObject.B2B_Lens_Picture_Link__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Picture_Link__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Picture_Link__c
                        : null;
                    orderObject.B2B_RX_Picture_Link__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_RX_Picture_Link__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_RX_Picture_Link__c
                        : null;
                    //BS- 1270 end
                    //BS- 1334 start
                    orderObject.B2B_Lens_Color__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Color__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Color__c
                        : null;
                    //BS- 1334 end
                    //BS- 1340 start
                    orderObject.B2B_Lenses_without_Adapter__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lenses_without_Adapter__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lenses_without_Adapter__c
                        : null;
                    //BS- 1340 end
                    //BS- 1439 start
                    orderObject.B2B_Final_PreCalcGuid__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Final_PreCalcGuid__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Final_PreCalcGuid__c
                        : null;
                    //BS- 1439 end

                    //BS-1148 Start
                    orderObject.B2B_a__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_a__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_a__c
                        : null;
                    orderObject.B2B_b__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_b__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_b__c
                        : null;
                    orderObject.B2B_b1__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_b1__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_b1__c
                        : null;
                    orderObject.B2B_b2__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_b2__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_b2__c
                        : null;
                    orderObject.B2B_SF__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_SF__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_SF__c
                        : null;
                    orderObject.B2B_blp__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_blp__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_blp__c
                        : null;
                    orderObject.B2B_DHP__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_DHP__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_DHP__c
                        : null;
                    orderObject.B2B_Lens_Shape__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Shape__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Shape__c
                        : null;
                    orderObject.B2B_Lens_Size__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Size__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Size__c
                        : null;
                    orderObject.B2B_with_Accent_Ring__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Accent_Ring__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Accent_Ring__c
                        : false;
                    orderObject.B2B_Selected_Accent_Ring_Product__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Selected_Accent_Ring_Product__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Selected_Accent_Ring_Product__c
                        : null;
                    orderObject.B2B_Selected_Accent_Ring_Image__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Selected_Accent_Ring_Image__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Selected_Accent_Ring_Image__c
                        : null;
                    orderObject.B2B_Remove_Drills__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Remove_Drills__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Remove_Drills__c
                        : false;
                    orderObject.B2B_Remove_Groove__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Remove_Groove__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Remove_Groove__c
                        : false;
                    orderObject.B2B_With_Color_Groove__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_With_Color_Groove__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_With_Color_Groove__c
                        : false;
                    orderObject.B2B_Selected_Color_Groove_Product__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Selected_Color_Groove_Product__c !=
                        null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Selected_Color_Groove_Product__c
                        : null;
                    orderObject.B2B_Coordinates__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Coordinates__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Coordinates__c
                        : null;
                    orderObject.B2B_OMA_Height__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_OMA_Height__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_OMA_Height__c
                        : null;
                    orderObject.B2B_Width__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Width__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Width__c
                        : null;
                    orderObject.B2B_Drills__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Drills__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Drills__c
                        : null;
                    orderObject.B2B_OMA__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_OMA__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_OMA__c
                        : null;
                    orderObject.B2B_has_Drills__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_hasDrills__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_hasDrills__c
                        : null;
                    orderObject.B2B_allowedScaling__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_allowedScaling__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_allowedScaling__c
                        : null;
                    orderObject.B2B_Antireflection_Product__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Antireflection_Product__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Antireflection_Product__c
                        : null;
                    orderObject.B2B_Hard_Coating_Product__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Hard_Coating_Product__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Hard_Coating_Product__c
                        : null;
                    orderObject.B2B_Lens_Color_Id__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Color_Id__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Color_Id__c
                        : null;
                    orderObject.B2B_Photo_Sensation__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Photo_Sensation__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Photo_Sensation__c
                        : null;
                    orderObject.B2B_Blue_Sensation__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Blue_Sensation__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Blue_Sensation__c
                        : null;
                    orderObject.B2B_Visual_Preference__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Visual_Preference__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Visual_Preference__c
                        : null;
                    orderObject.B2B_Lens_Distance__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Distance__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Distance__c
                        : null;
                    orderObject.B2B_Lens_Edge__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Edge__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Lens_Edge__c
                        : null;
                    orderObject.B2B_Glazing_Type__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Glazing_Type__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Glazing_Type__c
                        : null;
                    //BS-1148 End
                    /* Start : BS-1800 */
                    orderObject.B2B_Evil_Eye_Edge__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Evil_Eye_Edge__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Evil_Eye_Edge__c
                        : null;
                    /* End : BS-1800 */
                    /* Start : BS-1801 */
                    orderObject.B2B_Frame_Type__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Frame_Type__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Frame_Type__c
                        : null;
                    orderObject.B2B_S_Graving__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_S_Graving__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_S_Graving__c
                        : null;
                    orderObject.B2B_Progression_Length__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Progression_Length__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Progression_Length__c
                        : null;
                    /* End : BS-1801 */
                    orderObject.B2B_Optimized_Facet_Cut__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Optimized_Facet_Cut__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_Optimized_Facet_Cut__c
                        : null;
                    /* Start : BS-2137 */
                    orderObject.B2B_With_Partial_Color_Groove__c = cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_With_Partial_Color_Groove__c != null
                        ? cartItemIdVsLensConfigMap.get(cartItemObj.Id).B2B_With_Partial_Color_Groove__c
                        : false;
                    /* End : BS-2137 */
                }
                orderItemVsOrderMap.put(cartItemObj.Id, orderObject);
            }
        }
        insert orderItemVsOrderMap.values();
        for (String cartItemId : cartItemIdVsLensConfigMap.keySet()) {
            if (orderItemVsOrderMap.containsKey(cartItemId) == true) {
                cartItemIdVsLensConfigMap.get(cartItemId).B2B_Order__c = orderItemVsOrderMap.get(cartItemId).Id;
            }
        }
        update cartItemIdVsLensConfigMap.values();
        //BS-1724 start
        B2B_Lens_Configurator__c lensConfigRecordToUpdate;
        List<B2B_Lens_Configurator__c> lensConfiguratorToUpdateList = new List<B2B_Lens_Configurator__c>();
        if (lensConfiguratorList.isEmpty() == false) {
            for (B2B_Lens_Configurator__c lensConfigObj : lensConfiguratorList) {
                lensConfigRecordToUpdate = new B2B_Lens_Configurator__c(Id = lensConfigObj.Id);
                lensConfigRecordToUpdate.B2B_Status__c = B2B_Constants.STATUS_CLOSED;
                lensConfiguratorToUpdateList.add(lensConfigRecordToUpdate);
            }
            update lensConfiguratorToUpdateList;
        } //BS-1724 end
        //Call the method to create orderItems based on the cart and cartItems.
        createShOrderItems(
            communityId,
            effectiveAccountId,
            activeCartOrId,
            pageParam,
            pageSize,
            sortParam,
            selectedAddress,
            poNumber,
            orderItemVsOrderMap,
            cartItemIdVsCartItemMap
        );
    }

    /**
     * @description create OrderItms record from cart items.
     * @author Vishalsingh Gaur
     * @param  communityId communityId, @param effectiveAccountId effectiveAccountId
     * @param  activeCartOrId activeCartOrId, @param pageParam pageParam
     * @param  pageSize pageSize, @param sortParam sortParam
     * @param  selectedAddress selectedAddress, @param poNumber poNumber
     * @param orderObject orderObject
     * @return  Void
     */
    public static void createShOrderItems(
        String communityId,
        String effectiveAccountId,
        String activeCartOrId,
        String pageParam,
        Integer pageSize,
        String sortParam,
        String selectedAddress,
        String poNumber,
        Map<String, Order> orderItemVsOrderMap,
        Map<Id, CartItem> cartItemIdVsCartItemMap
    ) {
        try {
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
            Map<Id, List<B2B_CartItems__c>> parentCartItemVsCustCartItemMap = new Map<Id, List<B2B_CartItems__c>>(); //Map to store the parent cart item and its related all the custom cart items created
            Map<Id, OrderItem> orderIdVsOrderItemMap = new Map<Id, OrderItem>();
            Set<String> cartItemIdSet = new Set<String>(); //Set to store the reference of parent cart items of VS/RX
            List<OrderItem> orderItemList = new List<OrderItem>(); //A consolidated (SH/EE/NB/VS/RX) List to store all the orderItems created
            List<OrderItem> customCartOrderItemList = new List<OrderItem>(); // A list to store the order item which has ParentOrderItem
            OrderItem orderItem;
            for (String cartItemId : orderItemVsOrderMap.keySet()) {
                if (cartItemId != B2B_Constants.NORMAL_SHOP_ORDER_KEY) {
                    cartItemIdSet.add(cartItemId);
                }
            }
            /* Fetch All the custom cart items created for this order's parent cartItem */
            List<B2B_CartItems__c> customCartItemList = [
                SELECT B2B_Parent_Cart_Item__c, B2B_Type__c, B2B_List_Price__c, B2B_Unit_Price__c, B2B_Quantity__c, B2B_Product__c
                FROM B2B_CartItems__c
                WHERE B2B_Parent_Cart_Item__c IN :cartItemIdSet
            ];
            if (customCartItemList.isEmpty() == false) {
                for (B2B_CartItems__c customCartItem : customCartItemList) {
                    if (!parentCartItemVsCustCartItemMap.containsKey(customCartItem.B2B_Parent_Cart_Item__c)) {
                        parentCartItemVsCustCartItemMap.put(customCartItem.B2B_Parent_Cart_Item__c, new List<B2B_CartItems__c>{ customCartItem });
                    } else {
                        parentCartItemVsCustCartItemMap.get(customCartItem.B2B_Parent_Cart_Item__c).add(customCartItem);
                    }
                }
            }
            for (ConnectApi.CartItemResult cartItemResult : cartItemsList) {
                //Logic to handle creation orderItems of For normal shop orders (SH/?EE/NB)
                cartItem = cartItemResult.cartItem;
                if (cartItemIdVsCartItemMap.containsKey(cartItem.cartItemId) && String.isBlank(cartItemIdVsCartItemMap.get(cartItem.cartItemId).B2B_Type__C)) {
                    orderItem = new OrderItem();
                    if (cartItemIdSet.contains(cartItem.cartItemId) == false) {
                        orderItem.OrderId = orderItemVsOrderMap.get(B2B_Constants.NORMAL_SHOP_ORDER_KEY).Id;
                    }
                    orderItem.B2B_Customer_Reference__c = cartItemIdVsCartItemMap.get(cartItem.cartItemId).Customer_Reference__c != null
                        ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).Customer_Reference__c
                        : null;
                    orderItem.B2B_Employee_Name__c = cartItemIdVsCartItemMap.get(cartItem.cartItemId).Entered_By__c != null
                        ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).Entered_By__c
                        : null;
                    orderItem.B2B_Ship_to_ID__c = selectedAddress;
                    orderItem.Quantity = Integer.valueOf(cartItem.quantity);
                    orderItem.Product2Id = cartItem.productId;
                    orderItem.ListPrice = cartItemIdVsCartItemMap.get(cartItem.cartItemId).ListPrice != null
                        ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).ListPrice
                        : 0;
                    orderItem.TotalLineAmount = cartItemIdVsCartItemMap.get(cartItem.cartItemId).TotalLineAmount != null
                        ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).TotalLineAmount
                        : 0;
                    orderItemList.add(orderItem);
                } else if (parentCartItemVsCustCartItemMap.containsKey(cartItem.cartItemId)) {
                    // Logic to create VS/RX cart Items
                    orderItem = new OrderItem();
                    //Create orderItem for the parent cartItem of VS/RX from cartItems record.
                    orderItem.OrderId = orderItemVsOrderMap.get(cartItem.cartItemId).Id;
                    orderItem.B2B_Customer_Reference__c = cartItemIdVsCartItemMap.get(cartItem.cartItemId).Customer_Reference__c != null
                        ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).Customer_Reference__c
                        : null;
                    orderItem.B2B_Employee_Name__c = cartItemIdVsCartItemMap.get(cartItem.cartItemId).Entered_By__c != null
                        ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).Entered_By__c
                        : null;
                    orderItem.B2B_Ship_to_ID__c = selectedAddress;
                    orderItem.Quantity = Integer.valueOf(cartItem.quantity);
                    orderItem.Product2Id = cartItem.productId;
                    orderItem.ListPrice = cartItemIdVsCartItemMap.get(cartItem.cartItemId).ListPrice != null
                        ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).ListPrice
                        : 0;
                    orderItem.TotalLineAmount = cartItemIdVsCartItemMap.get(cartItem.cartItemId).TotalLineAmount != null
                        ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).TotalLineAmount
                        : 0;
                    orderItem.B2B_Type__C = cartItemIdVsCartItemMap.get(cartItem.cartItemId).B2B_Type__C != null
                        ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).B2B_Type__C
                        : null;

                    orderItemList.add(orderItem);
                }
            }
            insert orderItemList;
            for (OrderItem orderItemObj : orderItemList) {
                orderIdVsOrderItemMap.put(orderItemObj.OrderId, orderItemObj);
            }
            for (ConnectApi.CartItemResult cartItemResult : cartItemsList) {
                //Logic to handle creation orderItems of For normal shop orders (SH/?EE/NB)
                cartItem = cartItemResult.cartItem;
                if (parentCartItemVsCustCartItemMap.containsKey(cartItem.cartItemId)) {
                    //Create related orderItems for the parent cartItem from custom cart items for VS/RX
                    for (B2B_CartItems__c customCartItemObj : parentCartItemVsCustCartItemMap.get(cartItem.cartItemId)) {
                        orderItem = new OrderItem();
                        orderItem.OrderId = orderItemVsOrderMap.containsKey(cartItem.cartItemId)
                            ? orderItemVsOrderMap.get(cartItem.cartItemId).Id != null ? orderItemVsOrderMap.get(cartItem.cartItemId).Id : null
                            : null;
                        orderItem.B2B_Customer_Reference__c = cartItemIdVsCartItemMap.get(cartItem.cartItemId).Customer_Reference__c != null
                            ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).Customer_Reference__c
                            : null;
                        orderItem.B2B_Employee_Name__c = cartItemIdVsCartItemMap.get(cartItem.cartItemId).Entered_By__c != null
                            ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).Entered_By__c
                            : null;
                        orderItem.B2B_Ship_to_ID__c = selectedAddress;
                        orderItem.Quantity = customCartItemObj.B2B_Quantity__c;
                        orderItem.Product2Id = customCartItemObj.B2B_Product__c;
                        orderItem.ListPrice = customCartItemObj.B2B_List_Price__c;
                        orderItem.B2B_ParentOrderItem__c = orderIdVsOrderItemMap.containsKey(orderItem.OrderId)
                            ? orderIdVsOrderItemMap.get(orderItem.OrderId).Id != null ? orderIdVsOrderItemMap.get(orderItem.OrderId).Id : null
                            : null;
                        orderItem.TotalLineAmount = (customCartItemObj.B2B_Quantity__c != null &&
                            customCartItemObj.B2B_List_Price__c != null)
                            ? customCartItemObj.B2B_List_Price__c
                            : null; //BS-1522
                        orderItem.B2B_Type__C = cartItemIdVsCartItemMap.get(cartItem.cartItemId).B2B_Type__C != null
                            ? cartItemIdVsCartItemMap.get(cartItem.cartItemId).B2B_Type__C
                            : null;
                        customCartOrderItemList.add(orderItem);
                    }
                }
            }
            insert customCartOrderItemList;

            WebCart currentCart = new WebCart(Id = cartItemCollection.cartSummary.cartId);
            currentCart.status = Bfl_Constant.CART_STATUS_CLOSED;
            update currentCart;
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_CheckoutController', 'AccountId: ' + effectiveAccountId + ' || Time: ' + System.now());
            throw new AuraHandledException(e.getMessage());
        }
    }
}
