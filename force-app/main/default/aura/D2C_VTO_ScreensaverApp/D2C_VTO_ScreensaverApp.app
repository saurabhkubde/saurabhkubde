<!--
 * @author Saurabh Kubde
 * @email  saurabh.kubde@theblueflamelabs.com
 * @desc   This Aura app embeds the LWC component "D2C_VTO_Screensaver" and will be used by the VF page "D2C_VTO_ScreensaverPage".
 **/
-->
<aura:application extends="ltng:outApp" implements="ltng:allowGuestAccess" access="GLOBAL">
    <!-- DVM20-9 : Creation of screen saver page for VTO/POS : Start -->
    <aura:dependency resource="d2C_VTO_Screensaver" />
    <!-- DVM20-9 : Creation of screen saver page for VTO/POS : End -->
</aura:application>