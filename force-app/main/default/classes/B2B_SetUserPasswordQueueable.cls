/**
 * @author      : Sachin Vispute
 * @email       : Sachin.vispute@theblueflamelabs.com
 * @description : This is QueueableClass used to Set the provided password for the provided User record
 * BS-1849
 */
public with sharing class B2B_SetUserPasswordQueueable implements System.Queueable, Database.AllowsCallouts {
    private String userId;
    private String password;

    public B2B_SetUserPasswordQueueable(String userId, String password) {
        this.userId = userId;
        this.password = password;
    }

    public void execute(System.QueueableContext context) {
        if (String.isNotBlank(userId) && String.isNotBlank(password)) {
            System.setPassword(userId, password);
        }
    }
}
