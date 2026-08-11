package com.prasatek.expensetrackerpro;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

public class SmsReceiver extends BroadcastReceiver {
    private static final String TAG = "SmsReceiver";
    public static MainActivity mainActivityInstance = null;

    @Override
    public void onReceive(Context context, Intent intent) {
        if ("android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {
            Bundle bundle = intent.getExtras();
            if (bundle != null) {
                Object[] pdus = (Object[]) bundle.get("pdus");
                String format = bundle.getString("format");
                if (pdus != null) {
                    StringBuilder fullBody = new StringBuilder();
                    String sender = "";
                    for (Object pdu : pdus) {
                        SmsMessage message;
                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                            message = SmsMessage.createFromPdu((byte[]) pdu, format);
                        } else {
                            message = SmsMessage.createFromPdu((byte[]) pdu);
                        }
                        if (message != null) {
                            sender = message.getDisplayOriginatingAddress();
                            fullBody.append(message.getMessageBody());
                        }
                    }

                    String smsBody = fullBody.toString();
                    Log.d(TAG, "Incoming SMS from " + sender + ": " + smsBody);

                    if (mainActivityInstance != null) {
                        mainActivityInstance.onSmsReceived(sender, smsBody);
                    }
                }
            }
        }
    }
}
