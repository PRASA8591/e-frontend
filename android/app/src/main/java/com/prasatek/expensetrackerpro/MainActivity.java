package com.prasatek.expensetrackerpro;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {
    private static final int SMS_PERMISSION_CODE = 101;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SmsReceiver.mainActivityInstance = this;
        requestSmsPermissions();
    }

    private void requestSmsPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{
                Manifest.permission.RECEIVE_SMS,
                Manifest.permission.READ_SMS
            }, SMS_PERMISSION_CODE);
        }
    }

    public void onSmsReceived(String sender, String body) {
        try {
            JSONObject detail = new JSONObject();
            detail.put("sender", sender);
            detail.put("body", body);

            String js = "window.dispatchEvent(new CustomEvent('onSmsReceived', { detail: " + detail.toString() + " }));";
            runOnUiThread(() -> {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().evaluateJavascript(js, null);
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
