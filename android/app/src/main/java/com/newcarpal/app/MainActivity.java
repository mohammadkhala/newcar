package com.newcarpal.app;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.core.splashscreen.SplashScreen;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int SPLASH_MIN_DISPLAY_MS = 1000;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        ViewGroup root = findViewById(android.R.id.content);
        if (root == null) {
            return;
        }
        View overlay = LayoutInflater.from(this).inflate(R.layout.splash_overlay, root, false);
        root.addView(overlay);
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            try {
                root.removeView(overlay);
            } catch (Exception ignored) {
                // Activity may have been destroyed.
            }
        }, SPLASH_MIN_DISPLAY_MS);
    }
}
