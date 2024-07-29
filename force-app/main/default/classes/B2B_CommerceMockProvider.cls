/**
 * @author Matthias Lindner
 * @email mlindner@salesforce.com
 * @create date 2022-05-27 15:57:40
 * @modify date 2022-05-27 15:57:40
 * @desc Commerce Mock provider used to mock CommerceApi
 */

@SuppressWarnings('PMD.AvoidDebugStatements, PMD.ExcessiveParameterList, PMD.classnamingconventions')
@isTest
public with sharing class B2B_CommerceMockProvider implements System.StubProvider {
    @TestVisible
    private Map<String, Object> mockedResponseByMethod = new Map<String, Object>();

    public Object handleMethodCall(
        Object stubbedObject,
        String stubbedMethodName,
        Type returnType,
        List<Type> listOfParamTypes,
        List<String> listOfParamNames,
        List<Object> listOfArgs
    ) {
        System.debug(LoggingLevel.Info, 'Name of stubbed method: ' + stubbedMethodName);
        System.debug(LoggingLevel.Info, 'Return type of stubbed method: ' + returnType.getName());

        for (integer i = 0; i < listOfParamNames.size(); i++) {
            System.debug(LoggingLevel.Info, 'parameter name: ' + listOfParamNames.get(i));
            System.debug(LoggingLevel.Info, '  parameter type: ' + listOfParamTypes.get(i).getName());
        }

        System.debug(LoggingLevel.Info, 'number of parameters passed into the mocked call: ' + listOfArgs.size());
        System.debug(LoggingLevel.Info, 'parameter(s) sent into the mocked call: ' + listOfArgs);

        Object response = mockedResponseByMethod.get(stubbedMethodName);
        if (response == null) {
            System.debug(LoggingLevel.Info, 'No mock found');
        }
        return response;
    }
}
