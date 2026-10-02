/**
 * Adsterra / ProfitableRate Smartlinks Monetization Service
 * High-CPM Direct Smartlinks for Maza777
 * 
 * Rules:
 * 1. Users get one link at a time, rotating sequentially across all 7 smartlinks.
 * 2. Multi-link round-robin rotation stored persistently.
 * 3. Compulsory 20-second active watch time before free bet confirmation.
 */

export interface AdsterraSmartlink {
  id: string;
  name: string;
  zoneId: string;
  url: string;
}

export const ADSTERRA_SMARTLINKS: AdsterraSmartlink[] = [
  {
    id: 'link_1_meens61v',
    name: 'Smartlink 1',
    zoneId: 'cpm-meens61v',
    url: 'https://www.profitableratecpmnetwork.com/meens61v?key=316861d3af8bae3aef0be189793b36a8',
  },
  {
    id: 'link_2_rkfnt4t7v',
    name: 'Smartlink 2',
    zoneId: 'cpm-rkfnt4t7v',
    url: 'https://www.profitableratecpmnetwork.com/rkfnt4t7v?key=c9c1da34e2e7a6bfd07fe5e3ffab3337',
  },
  {
    id: 'link_3_kih76agt0',
    name: 'Smartlink 3',
    zoneId: 'cpm-kih76agt0',
    url: 'https://www.profitableratecpmnetwork.com/kih76agt0?key=11f2eef147d53297a252743d9478b956',
  },
  {
    id: 'link_4_eh7zpqee',
    name: 'Smartlink 4',
    zoneId: 'cpm-eh7zpqee',
    url: 'https://www.profitableratecpmnetwork.com/eh7zpqee?key=ea59333d9195fcc916fd8f414fd03ca4',
  },
  {
    id: 'link_5_ysbvd9vnz7',
    name: 'Smartlink 5',
    zoneId: 'cpm-ysbvd9vnz7',
    url: 'https://www.profitableratecpmnetwork.com/ysbvd9vnz7?key=b57fea94374595ff2f839d6e3699e41f',
  },
  {
    id: 'link_6_q3y95zahs8',
    name: 'Smartlink 6',
    zoneId: 'cpm-q3y95zahs8',
    url: 'https://www.profitableratecpmnetwork.com/q3y95zahs8?key=4c4e61e4f06445aa519c766f5d7fa590',
  },
  {
    id: 'link_7_scgykhx5tw',
    name: 'Smartlink 7',
    zoneId: 'cpm-scgykhx5tw',
    url: 'https://www.profitableratecpmnetwork.com/scgykhx5tw?key=1a9a1b8f681ded66768d353c04e12a62',
  },
];

export const ADSTERRA_CONFIG = {
  MIN_REQUIRED_SECONDS: 20,
  AUTO_OPEN_SMARTLINK: true,
  NETWORK_NAME: 'ProfitableRate Smartlink Network',
};

const STORAGE_KEY_CURSOR = 'maza777_smartlink_cursor';

/**
 * Returns a smartlink using persistent round-robin rotation:
 * Each user sees 1 link per session/bet, and successive bets use the next link in the cycle
 */
export function getNextAdsterraSmartlink(): AdsterraSmartlink {
  let currentIndex = 0;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CURSOR);
    if (saved !== null) {
      currentIndex = parseInt(saved, 10) || 0;
    }
  } catch {
    currentIndex = 0;
  }

  const selectedLink = ADSTERRA_SMARTLINKS[currentIndex % ADSTERRA_SMARTLINKS.length];
  
  // Advance cursor for next time so multiple links are used multiple times in sequence
  try {
    const nextIndex = (currentIndex + 1) % ADSTERRA_SMARTLINKS.length;
    localStorage.setItem(STORAGE_KEY_CURSOR, String(nextIndex));
  } catch {
    // Ignore storage errors
  }

  return selectedLink;
}

/**
 * Opens the Adsterra / ProfitableRate smartlink safely:
 * In Android APK, calls native AndroidBridge to open external Chrome browser.
 * In Web browser, opens via window.open.
 */
export function openAdsterraSmartlink(url: string): Window | null {
  try {
    if (typeof window !== 'undefined' && (window as any).AndroidBridge?.openExternalUrl) {
      (window as any).AndroidBridge.openExternalUrl(url);
      return null;
    }
    return window.open(url, '_blank', 'noopener,noreferrer');
  } catch (err) {
    console.warn('[Adsterra] Could not open ad in window.open:', err);
    return null;
  }
}
