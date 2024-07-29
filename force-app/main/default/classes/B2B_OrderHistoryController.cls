/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-08-09 10:51:30
 * @modify date 2022-08-09 10:51:30
 * @desc class for retrieving orders and the according order reference links
 */

public without sharing class B2B_OrderHistoryController {
    @SuppressWarnings('PMD.apexsoqlinjection')
    @AuraEnabled(Cacheable=false)
    /**
     * @description gets all orders based on the timeframe, status and source
     * @author Matthias Lindner
     * @param  selectedTimeframe selectedTimeframe in days
     * @param  status            status from the order
     * @param  source            source from the order
     * @param  orderType         orderType from the order
     * @return                   return description
     */
    public static List<Order> getOrderHistoryList(String selectedTimeframe, String status, String source, String orderType, String configurationType) {
        Id accountId = B2B_Utils.getAccountIdByCurrentUser();
        List<Order> orderList = new List<Order>();
        String query;
        status = String.isNotEmpty(status) && status.equalsIgnoreCase(B2B_Constants.ORDER_SUBMITTED_STATUS_VALUE)
            ? status + B2B_Constants.ORDER_SENT_STATUS_VALUE
            : status;
        try {
            //Added the field OrderNumber as part of BS-523
            //Added if condition as part of BS-1096
            //Added B2B_Special_Handling__c as a part of BS-1955
            query = 'SELECT Id, Account.B2B_No_Invoice_Request__c, B2B_ERP_Order_Id__c,toLabel(B2B_Order_Type__c), OrderNumber, toLabel(Status), OrderedDate,';
            if (orderType.equalsIgnoreCase(B2B_Constants.RX_GLAZING) || orderType.equalsIgnoreCase(B2B_Constants.VISION_SENSATION)) {
                query =
                    query +
                    ' toLabel(B2B_Configuration_Type__c), B2B_Customer_Name__c, B2B_Clerk__c,toLabel(B2B_Special_Handling__c), toLabel(Order_Source__c) FROM Order WHERE AccountId = \'';
            } else {
                query = query + ' toLabel(Order_Source__c) FROM Order WHERE AccountId = \'';
            }
            query =
                query +
                accountId +
                '\' AND EffectiveDate > ' +
                DateTime.now().addDays(-Integer.valueOf(String.escapeSingleQuotes(selectedTimeframe))).format('yyyy-MM-dd');
            query = (String.isNotEmpty(status)) ? query + ' AND Status IN (\'' + status + '\')' : query + '';
            if (
                (orderType.equalsIgnoreCase(B2B_Constants.RX_GLAZING) || orderType.equalsIgnoreCase(B2B_Constants.VISION_SENSATION)) &&
                configurationType.equalsIgnoreCase(B2B_Constants.ALL) == false
            ) {
                query = query + ' AND B2B_Configuration_Type__c = \'' + String.escapeSingleQuotes(configurationType) + '\'';
            }
            query = (String.isNotEmpty(source)) ? query + ' AND Order_Source__c = \'' + String.escapeSingleQuotes(source) + '\'' : query + '';
            query = query + ' AND B2B_Order_Type__c = \'' + String.escapeSingleQuotes(orderType) + '\''; //BS-1023
            query = query + ' AND Status IN (\'10\',\'15\',\'20\',\'25\',\'30\',\'40\',\'60\',\'99\')'; // BS-1101 > BS-846 Showing order history data for mentioned status only
            query = query + ' ORDER BY OrderedDate DESC';
            orderList = Database.query(query);
            for (Order orderObj : orderList) {
                if (orderObj.B2B_ERP_Order_Id__c == null) {
                    orderObj.B2B_ERP_Order_Id__c = System.Label.B2B_ACC_OH_Processing;
                }
            }
            return orderList;
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_OrderHistoryController', 'Query: ' + query);
            throw new AuraHandledException(System.Label.B2B_LOGIN_Generic_Error);
        }
    }

    @AuraEnabled(Cacheable=false)
    /**
     * @description retrieves all order reference links based on the order
     * @author Matthias Lindner
     * @param  orderId orderId
     * @return         return
     */
    public static List<B2B_Order_Reference__c> getOrderReferencesById(Id orderId) {
        Id accountId = B2B_Utils.getAccountIdByCurrentUser();
        List<B2B_Order_Reference__c> orderReferenceList = new List<B2B_Order_Reference__c>();

        if (accountId != null) {
            orderReferenceList = [
                SELECT B2B_Order_Reference_Link__c, B2B_Order_Reference_Type__c
                FROM B2B_Order_Reference__c
                WHERE B2B_Order__c = :orderId AND B2B_Order__r.AccountId = :accountId
            ];
        } //end if

        return orderReferenceList;
    }

    @AuraEnabled(Cacheable=false)
    /**
     * @description create Order Document Request Record.
     * @author Vishalsingh Gaur
     * @param  orderId orderId, @param requestType requestType
     * @return         return
     */
    public static void createOrderDocumentRequest(String orderId, String requestType) {
        try {
            B2B_Order_Document_Request__c orderDocumentRequest = new B2B_Order_Document_Request__c();
            orderDocumentRequest.B2B_Document_Request_Type__c = requestType;
            orderDocumentRequest.B2b_Order__c = orderId;

            insert orderDocumentRequest;
        } catch (Exception e) {
            B2B_LogUtils.createInfoLog(e.getMessage(), 'B2B_OrderHistoryController', System.Label.B2B_LOGIN_Generic_Error);
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(Cacheable=true)
    /**
     * @description create Order Document Request Record. BS-437
     * @author Vishalsingh Gaur
     * @param  None
     * @return String
     */
    public static String getAccountEmail() {
        Id accountId = B2B_Utils.getAccountIdByCurrentUser();
        List<Account> accountList = new List<Account>();
        if (accountId != null) {
            accountList = [SELECT k_Email__c FROM Account WHERE Id = :accountId];
        }

        return accountList.isEmpty() ? null : accountList[0].k_Email__c;
    }

    @AuraEnabled(Cacheable=false)
    /**
     * @description fetch the order details from Order Id. BS-96
     * @author Vishalsingh Gaur
     * @param  String orderId
     * @return Order
     */
    public static Order getOrderDetails(String orderId) {
        List<Order> orderList = [
            SELECT
                B2B_ERP_Order_Id__c,
                toLabel(Status),
                OrderedDate,
                toLabel(
                Order_Source__c //BS-1954
            ),
                Account.Name,
                Account.k_Email__c,
                Account.k_Billing_City__c,
                Account.k_Billing_Country__c,
                Account.k_Billing_Name__c,
                Account.k_Billing_Postal_Code__c,
                Account.k_Billing_Street__c,
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
                B2B_Note__c,
                B2B_Working_Distance__c,
                B2B_Customer_Service_Preference__c,
                toLabel(B2B_RX_Solution__c),
                B2B_RX_Type__c,
                toLabel(B2B_Lens_Type__c),
                B2B_Lens_Index__c,
                B2B_Antireflection_SKU__c,
                B2B_Hard_Coating_SKU__c,
                B2B_RX_Solution_Description__c,
                toLabel(B2B_Lens_Material__c),
                toLabel(B2B_Measurement_System__c),
                toLabel(B2B_Special_Handling__c),
                toLabel(B2B_PB2Placement_Left__c),
                toLabel(B2B_PB2Placement_Right__c),
                toLabel(B2B_PB1Placement_Right__c),
                toLabel(B2B_PB1Placement_Left__c),
                B2B_RX_Picture_Link__c, //BS-1270
                B2B_Lens_Picture_Link__c, //BS-1270
                B2B_without_clipin__c, //BS-1311
                B2B_Lens_Color__c, //BS- 1334
                B2B_Lenses_without_Adapter__c, //BS- 1340
                toLabel(B2B_Configuration_Type__c),
                B2B_Customer_Name__c, //BS-1801
                B2B_Clerk__c, //BS-1801
                B2B_Evil_Eye_Edge__c, //BS-1801
                B2B_S_Graving__c, //BS-1801
                toLabel(B2B_Frame_Type__c),
                B2B_Progression_Length__c, //BS-1938
                B2B_Order_Type__c //BS-1064
            //BS-1801
            FROM Order
            WHERE Id = :orderId
        ];

        return orderList.isEmpty() ? null : orderList[0];
    }

    @AuraEnabled(Cacheable=false)
    /**
     * @description fetch the order items from Order Id. BS-96
     * @author Vishalsingh Gaur
     * @param  String orderId
     * @return List<OrderItem>
     */
    public static List<OrderItem> getOrderItemDetails(String orderId) {
        List<OrderItem> orderItemList = [
            SELECT
                Quantity,
                Product2.StockKeepingUnit,
                toLabel(Product2.B2B_Sparepart_Type__c),
                Product2.B2B_Picture_Link__c,
                toLabel(Product2.Name),
                Product2.DisplayUrl,
                B2B_Ship_to_ID__r.Address,
                B2B_Ship_to_ID__r.Name,
                B2B_Customer_Reference__c,
                B2B_Employee_Name__c, //Added as part of BS-1802
                Product2.B2B_Model__c, //Added as part of BS-882
                Product2.B2B_Brand__c, //Added as part of BS-882
                Product2.B2B_Product_Type__c, //Added as part of BS-882
                Product2.B2B_Design_Family__c, //Added as part of BS-882
                Product2.B2B_Frame_Color_Description__c, //Added as part of BS-882
                B2B_Type__c, //Added as part of BS-998
                B2B_ParentOrderItem__c, //Added as part of BS-998
                Product2.B2B_Frame_Color__c, //Added as part of BS-998
                Order.B2B_Customer_Name__c, //Added as part of BS-998
                Product2.B2B_Temple_Length__c, //Added as part of BS-998
                Product2.B2B_Lens_Size__c, //Added as part of BS-998
                Product2.B2B_Bridge_Size__c, //Added as part of BS-1311
                Product2.B2B_Shape_Size__c, //Added as part of BS-1802
                Product2.B2B_Shape_Height__c, //Added as part of BS-1802
                toLabel(Product2.B2B_EE_Size__c),
                Product2.B2B_Hexcode_Accent__c, //Added as part of BS-1802
                Product2.B2B_Hexcode__c, //Added as part of BS-1802
                Product2.B2B_Variant_Shape__c //BS-2174
            FROM OrderItem
            WHERE OrderId = :orderId
        ];

        return orderItemList.isEmpty() ? null : orderItemList;
    }

    /**
     * BS-1584
     * @description this method will fetch the lens selection screen data to show on read only screen
     *
     */
    @AuraEnabled
    public static Order getLensSelectionScreenData(String recordId) {
        List<Order> orderList = new List<Order>();
        if (String.isNotBlank(recordId) == true) {
            orderList = [
                SELECT
                    Id,
                    toLabel(B2B_Lens_Type__c),
                    B2B_Lens_Index__c,
                    toLabel(B2B_Lens_Material__c),
                    B2B_Lens_Color_Id__c,
                    B2B_Photo_Sensation__r.Id,
                    B2B_Blue_Sensation__r.Id,
                    B2B_Lens_Distance__c,
                    toLabel(B2B_Visual_Preference__c),
                    toLabel(B2B_Lens_Edge__c),
                    toLabel(B2B_Glazing_Type__c),
                    B2B_Antireflection_Product__r.Id,
                    B2B_Hard_Coating_Product__r.Id,
                    B2B_Progression_Length__c,
                    B2B_Lens_Color__c,
                    toLabel(B2B_Lens_Color_Id__r.Description),
                    toLabel(B2B_Photo_Sensation__r.Description),
                    toLabel(B2B_Blue_Sensation__r.Description),
                    toLabel(B2B_Antireflection_Product__r.Description),
                    toLabel(B2B_Hard_Coating_Product__r.Description),
                    B2B_Lens_Shape__c,
                    B2B_Lens_Size__c,
                    B2B_Optimized_Facet_Cut__c,
                    B2B_With_Color_Groove__c, //BS-2158
                    B2B_Selected_Color_Groove_Product__r.B2B_Hexcode__c, //BS-2158
                    B2B_Selected_Color_Groove_Product__r.Name, //BS-2158
                    B2B_with_Accent_Ring__c, //BS-2158
                    B2B_Selected_Accent_Ring_Product__r.B2B_Hexcode__c, //BS-2158
                    B2B_Selected_Accent_Ring_Product__r.B2B_Frame_Color_Description__c, //BS-2158
                    B2B_a__c, //BS-2158
                    B2B_b__c, //BS-2158
                    B2B_b1__c, //BS-2158
                    B2B_b2__c, //BS-2158
                    B2B_SF__c, //BS-2158
                    B2B_DHP__c, //BS-2158
                    B2B_With_Partial_Color_Groove__c //BS-2137
                FROM Order
                WHERE Id = :recordId
                LIMIT 1
            ];
        }
        return orderList.isEmpty() == false ? orderList[0] : null;
    }
    /**
     * BS-2142
     * @description this method will fetch the date format value according to country code
     *
     */
    @AuraEnabled(cacheable=false)
    public static string getCountryDateFormat(String countryCode) {
        List<B2B_Country_Specific_Date_Format_Setting__mdt> dateFormatList = new List<B2B_Country_Specific_Date_Format_Setting__mdt>();
        if (String.isNotBlank(countryCode)) {
            dateFormatList = [
                SELECT id, Date_Format__c, Country_Code__c
                FROM B2B_Country_Specific_Date_Format_Setting__mdt
                WHERE Country_Code__c = :countryCode
                LIMIT 1
            ];
        }
        return dateFormatList.isEmpty() ? null : String.valueOf(dateFormatList[0].Date_Format__c);
    }

    @SuppressWarnings('PMD.apexsoqlinjection')
    @AuraEnabled(Cacheable=false)
    /**
     * @description BS-1064 create clone configurator related to order.
     * @author Vishalsingh Gaur
     * @param  orderId orderId, @param requestType requestType
     * @return  return
     */
    public static B2B_Lens_Configurator__c createCloneConfiguratorForVSRX(String orderId, Boolean isSameBrand, String type) {
        if (String.isNotBlank(orderId)) {
            Set<String> lensConfiguratorFieldSet = new Set<String>();

            List<B2B_Lens_Configurator__c> lensConfiguratorDataList = new List<B2B_Lens_Configurator__c>();
            if (isSameBrand == true) {
                for (Schema.FieldSetMember fieldSetInstance : SObjectType.B2B_Lens_Configurator__c.FieldSets.VS_RX_Configurator_fieldset.getFields()) {
                    lensConfiguratorFieldSet.add(fieldSetInstance.getFieldPath());
                }
            } else {
                for (Schema.FieldSetMember fieldSetInstance : SObjectType.B2B_Lens_Configurator__c.FieldSets.B2B_VS_RX_Reorder_Field_Set.getFields()) {
                    lensConfiguratorFieldSet.add(fieldSetInstance.getFieldPath());
                }
            }

            String query = 'SELECT ';
            for (String fields : lensConfiguratorFieldSet) {
                if (fields.equalsIgnoreCase('B2B_Account__c') == false) {
                    query += fields + ',';
                }
            }
            query +=
                ' B2B_Account__c, B2B_Order__r.B2B_ERP_Order_Id__c FROM B2B_Lens_Configurator__c WHERE B2B_Order__c = \'' +
                String.escapeSingleQuotes(orderId) +
                '\'';
            lensConfiguratorDataList = Database.query(query);
            if (lensConfiguratorDataList.isEmpty() == false && lensConfiguratorDataList.size() == 1) {
                String relatedOrderNumber = lensConfiguratorDataList[0].B2B_Order__r.B2B_ERP_Order_Id__c;
                B2B_Lens_Configurator__c lensConfiguratorCopy = lensConfiguratorDataList[0].clone(false, true, false, false);
                insert lensConfiguratorCopy;
                lensConfiguratorCopy.B2B_Order__c = null;
                lensConfiguratorCopy.B2B_Cart_Item__c = null;
                lensConfiguratorCopy.B2B_Status__c = B2B_Constants.LENS_CONFIGURATOR_STATUS_OPEN;
                lensConfiguratorCopy.B2B_Final_PreCalcGuid__c = null;
                lensConfiguratorCopy.B2B_Type__c = type;
                lensConfiguratorCopy.B2B_Related_Order_Number__c = relatedOrderNumber;
                update lensConfiguratorCopy;

                return lensConfiguratorCopy;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    /**
     * BS-2342
     * @description this method will get the lens configurator record from order Id
     *
     */
    @AuraEnabled(cacheable=false)
    public static Id getLensConfigId(Id orderId) {
        List<B2B_Lens_Configurator__c> lensConfiguratorList = [SELECT Id FROM B2B_Lens_Configurator__c WHERE B2B_Order__c = :orderId];
        return lensConfiguratorList.isEmpty() ? null : lensConfiguratorList[0].Id;
    }
}
