/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-06-27 14:44:45
 * @modify date 2022-06-27 14:44:45
 * @desc used for related product component
 */

public class B2B_FeaturedProductTypes extends VisualEditor.DynamicPickList {
    public override VisualEditor.DataRow getDefaultValue() {
        Schema.DescribeFieldResult fieldResult = B2B_Commerce_Product_Link__c.B2B_Type__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        VisualEditor.DataRow defaultValue = new VisualEditor.DataRow(ple[0].getLabel(), ple[0].getValue());
        return defaultValue;
    }

    public override VisualEditor.DynamicPickListRows getValues() {
        VisualEditor.DynamicPickListRows availableRelationTypes = new VisualEditor.DynamicPickListRows();
        Schema.DescribeFieldResult fieldResult = B2B_Commerce_Product_Link__c.B2B_Type__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        for (Schema.PicklistEntry pickListVal : ple) {
            availableRelationTypes.addRow(new VisualEditor.DataRow(pickListVal.getLabel(), pickListVal.getValue()));
        }
        return availableRelationTypes;
    }
}
