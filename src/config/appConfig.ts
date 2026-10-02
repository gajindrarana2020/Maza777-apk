/**
 * Centralized App Configuration & Branding
 * 
 * You can replace any of the values below with your own custom app details,
 * Unity Ads IDs, Telegram / WhatsApp support links, and Android Package details.
 * These settings can also be dynamically modified in the Admin Panel.
 */

export interface AppConfig {
  appName: string;
  appTagline: string;
  appShortName: string;
  packageName: string;
  appVersion: string;
  telegramSupportUrl: string;
  telegramUsername: string;
  whatsappSupportNumber: string;
  unityAdsGameId: string;
  unityRewardedPlacement: string;
  unityBannerPlacement: string;
  unityTestMode: boolean;
  minWithdrawal: number;
  currencySymbol: string;
  adminId: string;
  adminPass: string;
  apiUrl: string;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  appName: 'MAZA777',
  appTagline: 'Live 3D & 4D Lottery Platform',
  appShortName: '777',
  packageName: 'com.maza777',
  appVersion: '1.2.0',
  telegramSupportUrl: 'https://t.me/maza777com',
  telegramUsername: '@maza777com',
  whatsappSupportNumber: '+91 90000 00000',
  unityAdsGameId: '800360831',
  unityRewardedPlacement: 'Rewarded_Android',
  unityBannerPlacement: 'Banner_Android',
  unityTestMode: false,
  minWithdrawal: 100,
  currencySymbol: '₹',
  adminId: 'maza777_superadmin',
  adminPass: 'MazaAdmin@777#2026$Secure',
  apiUrl: '',
};

const CONFIG_STORAGE_KEY = 'maza777_app_custom_config_v1';

export function getAppConfig(): AppConfig {
  if (typeof window === 'undefined') return DEFAULT_APP_CONFIG;
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_APP_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_APP_CONFIG;
}

export function saveAppConfig(newConfig: Partial<AppConfig>): AppConfig {
  const current = getAppConfig();
  const updated = { ...current, ...newConfig };
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return updated;
}

export function resetAppConfig(): AppConfig {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  } catch {
    // Ignore
  }
  return DEFAULT_APP_CONFIG;
}
