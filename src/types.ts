export type GameCategory = 'all' | 'turbo' | 'kerala' | 'nagaland' | 'international' | '4d';

export interface Game {
  id: string;
  name: string;
  category: 'turbo' | 'kerala' | 'nagaland' | 'international';
  digits: 3 | 4;
  period: string;
  result: string;
  lastDrawTime: number;
  durationMs: number; // in milliseconds
  iconColor: string;
  imageUrl?: string;
  badge?: string;
  status: 'active' | 'upcoming' | 'drawing' | 'closed';
  payoutMultiplier: number;
  description?: string;
  startHour?: number;  // e.g. 13 for 1 PM
  endHour?: number;    // e.g. 17 for 5 PM
  startMinute?: number;
  endMinute?: number;
  scheduleLabel?: string;
  remainingSeconds?: number;
  nextActionLabel?: string;
  serverNow?: number;
}

export interface UserBet {
  id: string;
  userId: string;
  gameId: string;
  gameName: string;
  digits: 3 | 4;
  period: string;
  numbers: string[]; // selected numbers e.g. ["777", "042"]
  amountPerNumber: number;
  totalAmount: number;
  payoutMultiplier: number;
  timestamp: number;
  status: 'pending' | 'won' | 'lost';
  winningNumber?: string;
  payoutWon?: number;
  adRewarded?: boolean;
  adToBetRatio?: string; // "10:1"
  unityAdId?: string; // "800360831"
  adsterraSmartlinkId?: string; // e.g. "31012744"
  adNetwork?: 'Adsterra Smartlink' | 'Unity Ads';
  firebaseSynced?: boolean;
}

export interface InboxMessage {
  id: string;
  userId: string;
  gameName: string;
  period: string;
  drawNumber?: string;
  number: string;
  status: 'WIN' | 'LOSE' | 'SYSTEM' | 'BET_SUCCESS';
  amount: number;
  timestamp: number;
  expiresAt?: number;
  read: boolean;
  title: string;
  details?: string;
}

export interface BankCard {
  id: string;
  userId?: string;
  type?: 'bank' | 'upi';
  realName: string;
  accountNumber: string;
  bankName: string;
  ifscCode?: string;
  upiId?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  amount: number;
  type?: 'bank' | 'upi';
  bankCardId?: string;
  bankName: string;
  accountNumber: string;
  realName?: string;
  ifscCode?: string;
  upiId?: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  timestamp: number;
  referenceId: string;
  utrNumber?: string;
  adminNote?: string;
  processedAt?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone: string;
  displayName: string;
  whatsapp: string;
  facebook: string;
  telegram: string;
  balance: number;
  referralCode: string;
  referredBy?: string;
  totalReferrals: number;
  referralEarnings: number;
  vipLevel: number;
  isCredentialsUpdated?: boolean;
}

export type ActiveScreen =
  | 'home'
  | 'inbox'
  | 'withdraw'
  | 'withdrawRecord'
  | 'profile'
  | 'profileEdit'
  | 'invite'
  | 'betRecord'
  | 'admin';

