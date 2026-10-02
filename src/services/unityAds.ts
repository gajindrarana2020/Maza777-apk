import { getAppConfig } from '../config/appConfig';

/**
 * Unity Ads SDK Integration Service
 * Dynamic configuration from appConfig
 */

export const getUnityConfig = () => {
  const config = getAppConfig();
  return {
    GAME_ID: config.unityAdsGameId || '800360831',
    REWARDED_PLACEMENT_ID: config.unityRewardedPlacement || 'Rewarded_Android',
    BANNER_PLACEMENT_ID: config.unityBannerPlacement || 'Banner_Android',
    TEST_MODE: config.unityTestMode || false,
    AD_TYPE: 'Unity Ads Monetization Network',
    RATIO: '10:1',
    DURATION_SEC: 15,
    NON_SKIPPABLE: true,
  };
};

export const UNITY_ADS_CONFIG = {
  get GAME_ID() { return getUnityConfig().GAME_ID; },
  get REWARDED_PLACEMENT_ID() { return getUnityConfig().REWARDED_PLACEMENT_ID; },
  get BANNER_PLACEMENT_ID() { return getUnityConfig().BANNER_PLACEMENT_ID; },
  get TEST_MODE() { return getUnityConfig().TEST_MODE; },
  AD_TYPE: 'Unity Ads Monetization Network',
  RATIO: '10:1',
  DURATION_SEC: 15,
  NON_SKIPPABLE: true,
};

// Global Android Native Bridge Types
declare global {
  interface Window {
    UnityAds?: {
      initialize?: (gameId: string, testMode: boolean, callback?: () => void) => void;
      show?: (placementId: string, listener?: any) => void;
      load?: (placementId: string, listener?: any) => void;
      isReady?: (placementId: string) => boolean;
      showBanner?: (placementId: string, position?: string) => void;
      hideBanner?: (placementId?: string) => void;
      destroyBanner?: (placementId?: string) => void;
    };
    AndroidUnityAds?: {
      init?: (gameId: string, testMode: boolean) => void;
      showRewarded?: (placementId: string) => void;
      showBanner?: (placementId: string) => void;
      hideBanner?: () => void;
      isRewardedLoaded?: (placementId: string) => boolean;
    };
    unityBridge?: {
      showRewardedAd?: (placementId: string) => void;
      showBannerAd?: (placementId: string) => void;
      hideBannerAd?: () => void;
    };
    onUnityRewardedComplete?: (placementId: string) => void;
    onUnityRewardedFailed?: (placementId: string, error: string) => void;
  }
}

class UnityAdsService {
  private isInitialized = false;
  private isRewardedReady = true;
  private isBannerLoaded = false;
  private onRewardedCompleteCallback: (() => void) | null = null;
  private onRewardedFailCallback: ((err: string) => void) | null = null;

  constructor() {
    this.init();
  }

  public init() {
    if (this.isInitialized) return;

    try {
      // 1. Check Native Android Bridge
      if (typeof window !== 'undefined') {
        if (window.AndroidUnityAds) {
          window.AndroidUnityAds.init(UNITY_ADS_CONFIG.GAME_ID, UNITY_ADS_CONFIG.TEST_MODE);
          console.log(`[UnityAds SDK] Native Android Bridge Initialized with Game ID: ${UNITY_ADS_CONFIG.GAME_ID}`);
        } else if (window.UnityAds && typeof window.UnityAds.initialize === 'function') {
          window.UnityAds.initialize(UNITY_ADS_CONFIG.GAME_ID, UNITY_ADS_CONFIG.TEST_MODE, () => {
            console.log(`[UnityAds SDK] UnityAds JS Initialized with Game ID: ${UNITY_ADS_CONFIG.GAME_ID}`);
            this.isInitialized = true;
          });
        }

        // Setup global callbacks for Android Native App
        window.onUnityRewardedComplete = (placementId: string) => {
          console.log(`[UnityAds SDK] Native Rewarded Completed: ${placementId}`);
          if (this.onRewardedCompleteCallback) {
            this.onRewardedCompleteCallback();
            this.onRewardedCompleteCallback = null;
          }
        };

        window.onUnityRewardedFailed = (placementId: string, error: string) => {
          console.warn(`[UnityAds SDK] Native Rewarded Failed: ${placementId} - ${error}`);
          if (this.onRewardedFailCallback) {
            this.onRewardedFailCallback(error);
            this.onRewardedFailCallback = null;
          }
        };
      }

      this.isInitialized = true;
      console.log(`[UnityAds SDK] Ready: Game ID ${UNITY_ADS_CONFIG.GAME_ID} | Rewarded: ${UNITY_ADS_CONFIG.REWARDED_PLACEMENT_ID} | Banner: ${UNITY_ADS_CONFIG.BANNER_PLACEMENT_ID}`);
    } catch (e) {
      console.error('[UnityAds SDK] Init error:', e);
      this.isInitialized = true;
    }
  }

  /**
   * Shows the Rewarded Ad for Game ID 800360831 (Placement: Rewarded_Android)
   */
  public showRewardedAd(options?: {
    onStart?: () => void;
    onComplete?: () => void;
    onError?: (err: string) => void;
  }) {
    if (options?.onStart) options.onStart();

    // Check if Native Android SDK exists in WebView/APK
    if (typeof window !== 'undefined') {
      if (window.AndroidUnityAds && typeof window.AndroidUnityAds.showRewarded === 'function') {
        this.onRewardedCompleteCallback = options?.onComplete || null;
        this.onRewardedFailCallback = options?.onError || null;
        window.AndroidUnityAds.showRewarded(UNITY_ADS_CONFIG.REWARDED_PLACEMENT_ID);
        return;
      } else if (window.unityBridge && typeof window.unityBridge.showRewardedAd === 'function') {
        this.onRewardedCompleteCallback = options?.onComplete || null;
        window.unityBridge.showRewardedAd(UNITY_ADS_CONFIG.REWARDED_PLACEMENT_ID);
        return;
      }
    }

    // Default web/interactive flow handled by UnityAdPlayer component
    if (options?.onComplete) {
      this.onRewardedCompleteCallback = options.onComplete;
    }
  }

  /**
   * Loads Banner Ad for Game ID 800360831 (Placement: Banner_Android)
   */
  public loadBannerAd() {
    if (typeof window !== 'undefined') {
      if (window.AndroidUnityAds && typeof window.AndroidUnityAds.showBanner === 'function') {
        window.AndroidUnityAds.showBanner(UNITY_ADS_CONFIG.BANNER_PLACEMENT_ID);
      } else if (window.UnityAds && typeof window.UnityAds.showBanner === 'function') {
        window.UnityAds.showBanner(UNITY_ADS_CONFIG.BANNER_PLACEMENT_ID, 'top');
      }
    }
    this.isBannerLoaded = true;
  }

  /**
   * Hides Banner Ad
   */
  public hideBannerAd() {
    if (typeof window !== 'undefined') {
      if (window.AndroidUnityAds && typeof window.AndroidUnityAds.hideBanner === 'function') {
        window.AndroidUnityAds.hideBanner();
      } else if (window.UnityAds && typeof window.UnityAds.hideBanner === 'function') {
        window.UnityAds.hideBanner(UNITY_ADS_CONFIG.BANNER_PLACEMENT_ID);
      }
    }
    this.isBannerLoaded = false;
  }
}

export const unityAds = new UnityAdsService();
