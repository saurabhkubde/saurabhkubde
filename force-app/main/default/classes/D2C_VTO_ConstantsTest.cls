/*************************************************************************************************************
 * This class Tests D2C_VTO_Constants class
 *
 * @author – Shrikant Dangi
 ***************************************************************************************************************/
@IsTest
private class D2C_VTO_ConstantsTest {
    /**
     * @description checks if the constants object can be created;
     */
    @IsTest
    static void testD2CVTOConstants() {
        D2C_VTO_Constants constantsObject = new D2C_VTO_Constants();
        System.assertNotEquals(null, constantsObject, 'Should not be null');
    }
}
