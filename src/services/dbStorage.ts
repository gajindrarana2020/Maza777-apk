/**
 * Persistent Database Storage Engine for Maza 777
 * Supports:
 * 1. Native Android SharedPreferences (permanent physical disk storage on Android APK)
 * 2. HTML5 WebStorage (localStorage)
 * 3. Remote Server Database (/api/bets)
 * 4. 48-Hour statement window retention (har user ko apni bet record win/lose result 48 hours tak show karega)
 */

import { UserBet } from '../types';

export const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
const NATIVE_KEY_BETS = 'maza777_bets_v2';

/**
 * Filter out bets older than 48 hours
 */
export function filter48HourBets(bets: UserBet[]): UserBet[] {
  const cutoff = Date.now() - FORTY_EIGHT_HOURS_MS;
  return bets.filter((b) => (b.timestamp || 0) >= cutoff);
}

/**
 * Load bets from all available storage engines (Native SharedPreferences -> localStorage)
 */
export function loadPersistedBets(): UserBet[] {
  let loadedBets: UserBet[] = [];

  // 1. Try Native Android SharedPreferences (APK physical disk)
  try {
    if (typeof window !== 'undefined' && (window as any).AndroidBridge?.getFromNative) {
      const nativeRaw = (window as any).AndroidBridge.getFromNative(NATIVE_KEY_BETS);
      if (nativeRaw && typeof nativeRaw === 'string' && nativeRaw.trim().startsWith('[')) {
        const parsed = JSON.parse(nativeRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          loadedBets = parsed;
        }
      }
    }
  } catch (err) {
    console.warn('[DB] Native storage read error:', err);
  }

  // 2. If empty, load from localStorage
  if (loadedBets.length === 0) {
    try {
      const localRaw = localStorage.getItem('maza777_bets_v2');
      if (localRaw) {
        const parsed = JSON.parse(localRaw);
        if (Array.isArray(parsed)) {
          loadedBets = parsed;
        }
      }
    } catch (err) {
      console.warn('[DB] localStorage read error:', err);
    }
  }

  // Auto purge bets older than 48 hours
  const filtered = filter48HourBets(loadedBets);
  return filtered;
}

/**
 * Save bets across all available storage engines (Native Android SharedPreferences + localStorage + Server DB)
 */
export function persistBets(bets: UserBet[], activeUserId?: string): void {
  const filtered = filter48HourBets(bets);
  const serialized = JSON.stringify(filtered);

  // 1. Save to localStorage
  try {
    localStorage.setItem('maza777_bets_v2', serialized);
  } catch (err) {
    console.warn('[DB] localStorage write error:', err);
  }

  // 2. Save to Android Native SharedPreferences (permanent APK disk)
  try {
    if (typeof window !== 'undefined' && (window as any).AndroidBridge?.saveToNative) {
      (window as any).AndroidBridge.saveToNative(NATIVE_KEY_BETS, serialized);
    }
  } catch (err) {
    console.warn('[DB] Native storage write error:', err);
  }

  // 3. Sync to Server Database API (asynchronous)
  try {
    fetch('/api/bets/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bets: filtered, userId: activeUserId }),
    }).catch(() => {
      // Offline fallback is expected in standalone Android APK
    });
  } catch {
    // Offline safe
  }
}
