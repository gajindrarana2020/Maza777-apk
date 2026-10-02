import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Share2, 
  X, 
  Terminal, 
  Layers, 
  Globe, 
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'instant' | 'online' | 'source'>('instant');

  const appUrl = window.location.origin;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstallPwa = async () => {
    sounds.playClick();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback instruction for browser
      alert('To install directly: Tap your mobile browser menu (⋮ or Share icon) -> Select "Install App" or "Add to Home Screen"');
    }
  };

  return (
    <div 
      id="apk-download-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="apk-download-modal-card"
        className="bg-[#14151b] border border-amber-500/50 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-amber-600/30 via-zinc-900 to-zinc-900 p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-amber-400 p-0.5 shadow-lg shadow-amber-500/20 bg-[#16171d]">
              <img src="/maza777_logo.png" alt="Maza 777 Logo" className="w-full h-full object-cover rounded-[12px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Download Android App / APK</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-black px-2 py-0.5 rounded border border-emerald-500/30">
                  Ready
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">MAZA777 Live 3D & 4D Lottery</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 bg-[#0d0e12] p-1.5 border-b border-zinc-800 text-xs font-bold">
          <button
            onClick={() => { setActiveTab('instant'); sounds.playClick(); }}
            className={`py-2 px-1 rounded-xl transition-all text-center cursor-pointer ${
              activeTab === 'instant'
                ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            1. Direct Install
          </button>
          <button
            onClick={() => { setActiveTab('online'); sounds.playClick(); }}
            className={`py-2 px-1 rounded-xl transition-all text-center cursor-pointer ${
              activeTab === 'online'
                ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            2. Online APK
          </button>
          <button
            onClick={() => { setActiveTab('source'); sounds.playClick(); }}
            className={`py-2 px-1 rounded-xl transition-all text-center cursor-pointer ${
              activeTab === 'source'
                ? 'bg-amber-400 text-zinc-950 shadow-md font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            3. Android Studio
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: INSTANT DIRECT INSTALL */}
          {activeTab === 'instant' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Instant 1-Click Phone App Installation</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Yeh app <strong>PWA (Progressive Web App)</strong> format me configured hai. Aap bina kisi complex software ke ise direct apne Android phone me install kar sakte hain.
                </p>

                <button
                  id="install-pwa-btn"
                  onClick={handleInstallPwa}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4 stroke-[3]" />
                  <span>{isInstalled ? 'App Already Installed on Device' : 'Install App to Phone Now'}</span>
                </button>
              </div>

              {/* Step by step manual instruction */}
              <div className="bg-[#181922] border border-zinc-800 rounded-2xl p-3.5 space-y-2 text-xs">
                <h4 className="font-extrabold text-white text-xs flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  Chrome Browser me Manual Steps:
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-300 text-[11.5px] pl-1">
                  <li>Apne phone me is link ko Google Chrome me open karein.</li>
                  <li>Right top corner me <strong className="text-white">3 dots (⋮)</strong> menu par tap karein.</li>
                  <li><strong className="text-amber-300">"Install app"</strong> ya <strong className="text-amber-300">"Add to Home screen"</strong> par click karein.</li>
                  <li>Phone screen par real app icon aa jayega aur bina browser ke fullscreen chalega!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: ONLINE 1-CLICK APK GENERATOR */}
          {activeTab === 'online' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#181922] border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Globe className="w-4 h-4" />
                  <span>Free Online .APK File Generator</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Agar aapko direct <strong>.apk file</strong> download karni hai, to aap niche diye gaye free generator tools me app link daal kar instant APK download kar sakte hain:
                </p>

                {/* App URL Copy Box */}
                <div className="bg-[#0e0f14] border border-zinc-700 rounded-xl p-2.5 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-zinc-300 truncate select-all">{appUrl}</span>
                  <button
                    onClick={handleCopyUrl}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                {/* Direct Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-xl flex items-center justify-between text-xs text-white group"
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span className="font-bold">PWABuilder.com</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-300" />
                  </a>

                  <a
                    href="https://websitetoapk.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-xl flex items-center justify-between text-xs text-white group"
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold">Web2APK Tool</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-300" />
                  </a>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 bg-black/40 p-3 rounded-xl border border-zinc-800/80">
                💡 <strong>Tip:</strong> Link copy karein, PWABuilder par paste karein aur <strong>"Generate Android Package / APK"</strong> par click karein.
              </div>
            </div>
          )}

          {/* TAB 3: SOURCE CODE & ANDROID STUDIO */}
          {activeTab === 'source' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-[#181922] border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Terminal className="w-4 h-4" />
                    <span>Android Studio Configuration</span>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono font-bold px-2 py-0.5 rounded border border-purple-500/30">
                    pkg: com.maza777
                  </span>
                </div>
                <p className="text-xs text-zinc-300">
                  Android Studio me package <strong>com.maza777</strong> ke sath complete Native APK build karne ke liye ready-to-use code files:
                </p>

                {/* 1. Quick Terminal Commands */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                    <span>1. Capacitor Method (Automated Asset Bundling):</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('npm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "Maza 777" "com.maza777" --web-dir dist\nnpm run build\nnpx cap add android\nnpx cap copy\nnpx cap open android');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Commands</span>
                    </button>
                  </div>
                  <div className="bg-[#0b0c10] border border-zinc-800 rounded-xl p-3 font-mono text-[11px] text-amber-300/90 space-y-1 overflow-x-auto">
                    <p className="text-zinc-500"># Step A: Install Capacitor</p>
                    <p>npm install @capacitor/core @capacitor/cli @capacitor/android</p>
                    <p className="text-zinc-500 pt-1"># Step B: Initialize com.maza777</p>
                    <p>npx cap init "Maza 777" "com.maza777" --web-dir dist</p>
                    <p className="text-zinc-500 pt-1"># Step C: Build & Copy Assets (Fixes Page Not Found)</p>
                    <p>npm run build</p>
                    <p>npx cap add android</p>
                    <p>npx cap copy</p>
                    <p>npx cap open android</p>
                  </div>
                </div>

                {/* 2. build.gradle (Module: app) */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                    <span>2. app/build.gradle (Dependencies & Package):</span>
                    <button
                      onClick={() => {
                        const gradleCode = `android {
    namespace "com.maza777"
    compileSdkVersion 34

    defaultConfig {
        applicationId "com.maza777"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.webkit:webkit:1.10.0'
    implementation 'com.unity3d.ads:unity-ads:4.9.2'
}`;
                        navigator.clipboard.writeText(gradleCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy build.gradle</span>
                    </button>
                  </div>
                  <div className="bg-[#0b0c10] border border-zinc-800 rounded-xl p-3 font-mono text-[10.5px] text-emerald-300/90 max-h-36 overflow-y-auto">
                    <pre className="whitespace-pre">{`android {
    namespace "com.maza777"
    compileSdkVersion 34

    defaultConfig {
        applicationId "com.maza777"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.webkit:webkit:1.10.0'
    // Unity Ads SDK 4.9.2
    implementation 'com.unity3d.ads:unity-ads:4.9.2'
}`}</pre>
                  </div>
                </div>

                {/* 3. MainActivity.java */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                    <span>3. MainActivity.java (Unity Ads + Fullscreen WebView):</span>
                    <button
                      onClick={() => {
                        const javaCode = `package com.maza777;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;

public class MainActivity extends AppCompatActivity {
    private static final String UNITY_GAME_ID = "800360831";
    private static final String REWARDED_PLACEMENT = "Rewarded_Android";
    private static final boolean TEST_MODE = false;
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize Unity Ads SDK
        UnityAds.initialize(getApplicationContext(), UNITY_GAME_ID, TEST_MODE, new IUnityAdsInitializationListener() {
            @Override
            public void onInitializationComplete() {
                // Unity Ads ready
            }
            @Override
            public void onInitializationFailed(UnityAds.UnityAdsInitializationError error, String message) {
            }
        });

        // Fullscreen WebView Setup
        webView = findViewById(R.id.webview);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // Native JS Bridge for Unity Ads
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void showRewardedAd() {
                runOnUiThread(() -> {
                    UnityAds.show(MainActivity.this, REWARDED_PLACEMENT, new UnityAdsShowOptions(), new IUnityAdsShowListener() {
                        @Override
                        public void onUnityAdsShowComplete(String placementId, UnityAds.UnityAdsShowCompletionState state) {
                            if (state == UnityAds.UnityAdsShowCompletionState.COMPLETED) {
                                webView.post(() -> webView.evaluateJavascript("window.onUnityRewardedAdFinished && window.onUnityRewardedAdFinished(true);", null));
                            }
                        }
                        @Override public void onUnityAdsShowFailure(String placementId, UnityAds.UnityAdsShowError error, String message) {}
                        @Override public void onUnityAdsShowStart(String placementId) {}
                        @Override public void onUnityAdsShowClick(String placementId) {}
                    });
                });
            }
        }, "AndroidUnityAds");

        webView.setWebViewClient(new WebViewClient());
        // Load local bundled assets (never gives 404 Page Not Found)
        webView.loadUrl("file:///android_asset/index.html");
    }
}`;
                        navigator.clipboard.writeText(javaCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy MainActivity.java</span>
                    </button>
                  </div>
                  <div className="bg-[#0b0c10] border border-zinc-800 rounded-xl p-3 font-mono text-[10.5px] text-blue-300/90 max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre">{`package com.maza777;

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;

public class MainActivity extends AppCompatActivity {
    private static final String UNITY_GAME_ID = "800360831";
    private static final String REWARDED_PLACEMENT = "Rewarded_Android";
    private static final boolean TEST_MODE = false;
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // 1. Initialize Unity Ads Native SDK
        UnityAds.initialize(getApplicationContext(), UNITY_GAME_ID, TEST_MODE, new IUnityAdsInitializationListener() {
            @Override
            public void onInitializationComplete() {}
            @Override
            public void onInitializationFailed(UnityAds.UnityAdsInitializationError error, String message) {}
        });

        // 2. Setup WebView
        webView = findViewById(R.id.webview);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // 3. Android JS Bridge
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void showRewardedAd() {
                runOnUiThread(() -> {
                    UnityAds.show(MainActivity.this, REWARDED_PLACEMENT, new UnityAdsShowOptions(), new IUnityAdsShowListener() {
                        @Override
                        public void onUnityAdsShowComplete(String placementId, UnityAds.UnityAdsShowCompletionState state) {
                            if (state == UnityAds.UnityAdsShowCompletionState.COMPLETED) {
                                webView.post(() -> webView.evaluateJavascript("window.onUnityRewardedAdFinished && window.onUnityRewardedAdFinished(true);", null));
                            }
                        }
                        @Override public void onUnityAdsShowFailure(String placementId, UnityAds.UnityAdsShowError error, String message) {}
                        @Override public void onUnityAdsShowStart(String placementId) {}
                        @Override public void onUnityAdsShowClick(String placementId) {}
                    });
                });
            }
        }, "AndroidUnityAds");

        webView.setWebViewClient(new WebViewClient());
        // Load Local Bundled Assets (100% Offline & Never Page Not Found)
        webView.loadUrl("file:///android_asset/index.html");
    }
}`}</pre>
                  </div>
                </div>

                {/* 4. AndroidManifest.xml */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
                    <span>4. AndroidManifest.xml:</span>
                    <button
                      onClick={() => {
                        const manifestCode = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.maza777">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <application
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:icon="@mipmap/ic_launcher"
        android:label="MAZA 777"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.NoActionBar"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:theme="@style/Theme.AppCompat.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
                        navigator.clipboard.writeText(manifestCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy AndroidManifest.xml</span>
                    </button>
                  </div>
                  <div className="bg-[#0b0c10] border border-zinc-800 rounded-xl p-3 font-mono text-[10.5px] text-amber-200/90 max-h-36 overflow-y-auto">
                    <pre className="whitespace-pre">{`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.maza777">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:label="MAZA 777"
        android:theme="@style/Theme.AppCompat.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security & Verification Banner */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>100% Safe, Secure & Ad-Supported Platform with Unity Monetization.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0e0f14] border-t border-zinc-800 flex justify-between items-center">
          <span className="text-[11px] text-zinc-500 font-mono">v1.2.0 • Android 8.0+ Ready</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
