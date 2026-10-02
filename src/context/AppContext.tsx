import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Game, UserBet, InboxMessage, BankCard, WithdrawalRecord, UserProfile, ActiveScreen } from '../types';
import { INITIAL_GAMES } from '../data/games';
import { sounds } from '../utils/audio';
import { calculateOptimalWinningNumber, analyzePeriodRisk, PeriodRiskAnalysis } from '../utils/lotteryAlgorithm';
import { 
  syncUserToFirebase, 
  authenticateFirebaseUser, 
  updateFirebaseBalance, 
  createFirebaseWithdrawal, 
  updateFirebaseWithdrawalStatus,
  db,
  WITHDRAWALS_COLLECTION,
  FirebaseWithdrawalData
} from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export interface RegisteredUserAccount {
  id: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  displayName: string;
  balance: number;
  referralCode: string;
  totalReferrals: number;
  referralEarnings: number;
  vipLevel: number;
  createdAt: number;
}

interface AppContextType {
  user: UserProfile | null;
  activeScreen: ActiveScreen;
  games: Game[];
  bets: UserBet[];
  inboxMessages: InboxMessage[];
  unreadInboxCount: number;
  bankCards: BankCard[];
  withdrawals: WithdrawalRecord[];
  betModalGame: Game | null;
  showBankModal: boolean;
  toast: { message: string; type: 'success' | 'win' | 'info' | 'error'; id: number } | null;
  isMuted: boolean;
  isAdminLoggedIn: boolean;
  profitMode: 'max_profit' | 'lowest_liability' | 'random';
  serverTimeOffset: number;
  serverTimeStr: string;
  
  // Actions
  navigateTo: (screen: ActiveScreen) => void;
  openBetModal: (game: Game) => void;
  closeBetModal: () => void;
  openBankModal: () => void;
  closeBankModal: () => void;
  toggleAudioMute: () => void;
  setProfitMode: (mode: 'max_profit' | 'lowest_liability' | 'random') => void;
  analyzeGameRisk: (gameId: string) => PeriodRiskAnalysis | null;
  
  login: (identifier: string, pass: string) => boolean;
  register: (username: string, email: string, phone: string, pass: string) => boolean;
  guestLogin: () => void;
  continueAsGuest: () => void;
  saveUserCredentials: (email: string, pass: string, phone?: string) => Promise<boolean>;
  claimReferralEarnings: () => boolean;
  logout: () => void;

  // Admin Actions
  adminLogin: (adminId: string, adminPass: string) => boolean;
  adminLogout: () => void;
  processWithdrawal: (withdrawalId: string) => boolean;
  approveWithdrawal: (withdrawalId: string, utrNumber?: string, note?: string) => boolean;
  rejectWithdrawal: (withdrawalId: string, reason: string) => boolean;
  adminAdjustBalance: (targetUserId: string, amount: number, note: string) => boolean;
  adminSetGameResult: (gameId: string, customWinningNumber: string) => boolean;
  
  requestWithdrawal: (
    paramOrAmount: number | {
      amount: number;
      type: 'bank' | 'upi';
      realName: string;
      accountNumber: string;
      bankName: string;
      ifscCode?: string;
      upiId?: string;
      phone?: string;
      saveMethod?: boolean;
    },
    legacyCardId?: string
  ) => boolean;
  addBankCard: (card: Omit<BankCard, 'id' | 'userId'>) => boolean;
  deleteBankCard: (id: string) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  
  placeBets: (gameId: string, numbers: string[], amountPerNumber: number) => boolean;
  triggerManualDraw: (gameId: string) => void;
  
  markMessageAsRead: (id: string) => void;
  markAllMessagesAsRead: () => void;
  deleteMessage: (id: string) => void;
  clearAllMessages: () => void;
  showToast: (message: string, type?: 'success' | 'win' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const ADMIN_AUTH_CONFIG = {
  DEFAULT_ID: 'Gajindra759',
  DEFAULT_PASS: 'Temra@6600',
  BACKUP_ID: 'Gajindra759',
  BACKUP_PASS: 'Temra@6600',
};

const STORAGE_KEYS = {
  USER: 'maza777_user_v2',
  ALL_USERS: 'maza777_all_users_v2',
  GAMES: 'maza777_games_v2',
  BETS: 'maza777_bets_v2',
  INBOX: 'maza777_inbox_v2',
  CARDS: 'maza777_bank_cards_v2',
  WITHDRAWALS: 'maza777_withdrawals_v2',
  ADMIN_SESSION: 'maza777_admin_auth_v2',
};

// Helper: Calculate synchronized game schedule states based on synchronized real-world clock
export const computeSynchronizedGameState = (game: Game, currentTimeMs: number): Game => {
  const date = new Date(currentTimeMs);
  const curHours = date.getHours();
  const curMinutes = date.getMinutes();
  const curSeconds = date.getSeconds();
  const totalSecsToday = curHours * 3600 + curMinutes * 60 + curSeconds;

  if (game.startHour !== undefined && game.endHour !== undefined) {
    const startSecs = game.startHour * 3600 + (game.startMinute || 0) * 60;
    const endSecs = game.endHour * 3600 + (game.endMinute || 0) * 60;

    let status: 'active' | 'upcoming' | 'drawing' | 'closed' = 'active';
    let remainingSeconds = 0;
    let nextActionLabel = '';

    if (totalSecsToday < startSecs) {
      status = 'upcoming';
      remainingSeconds = startSecs - totalSecsToday;
      const h = Math.floor(remainingSeconds / 3600);
      const m = Math.floor((remainingSeconds % 3600) / 60);
      const s = remainingSeconds % 60;
      nextActionLabel = `Starts in ${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
    } else if (totalSecsToday >= startSecs && totalSecsToday < endSecs) {
      status = 'active';
      remainingSeconds = endSecs - totalSecsToday;
      const h = Math.floor(remainingSeconds / 3600);
      const m = Math.floor((remainingSeconds % 3600) / 60);
      const s = remainingSeconds % 60;
      nextActionLabel = `Auto Draw in ${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
    } else {
      status = 'closed';
      remainingSeconds = 24 * 3600 - totalSecsToday + startSecs;
      const h = Math.floor(remainingSeconds / 3600);
      const m = Math.floor((remainingSeconds % 3600) / 60);
      nextActionLabel = `Next Draw: Tomorrow ${game.startHour % 12 || 12}:00 ${game.startHour >= 12 ? 'PM' : 'AM'} (in ${h}h ${m}m)`;
    }

    return {
      ...game,
      status,
      remainingSeconds,
      nextActionLabel,
      serverNow: currentTimeMs,
    };
  }

  // Non-time-bounded continuous turbo games
  const elapsed = currentTimeMs - game.lastDrawTime;
  const remainingMs = Math.max(0, game.durationMs - elapsed);
  const remainingSeconds = Math.floor(remainingMs / 1000);
  const h = Math.floor(remainingSeconds / 3600);
  const m = Math.floor((remainingSeconds % 3600) / 60);
  const s = remainingSeconds % 60;

  return {
    ...game,
    status: remainingSeconds === 0 ? 'drawing' : 'active',
    remainingSeconds,
    nextActionLabel: `Draw in ${h > 0 ? `${h}h ` : ''}${m}m ${s}s`,
    serverNow: currentTimeMs,
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // All Registered Users Database (Strictly real registrations only - No demo accounts)
  const [allUsers, setAllUsers] = useState<RegisteredUserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out any legacy demo accounts
          return parsed.filter((u: any) => u.username !== 'maza_player' && u.id !== 'M777-100777');
        }
      } catch {
        // fallback
      }
    }
    return [];
  });

  const createNewGuestAccount = (): UserProfile => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const guestId = `M777-${randomNum}`;
    const newGuest: UserProfile = {
      id: guestId,
      username: guestId,
      displayName: `Guest_${randomNum}`,
      email: '',
      phone: '',
      balance: 0.0,
      referralCode: `MAZA${randomNum}`,
      totalReferrals: 0,
      referralEarnings: 0,
      vipLevel: 1,
      isCredentialsUpdated: false,
      whatsapp: '',
      facebook: '',
      telegram: '',
    };
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newGuest));
    } catch {
      // ignore
    }
    return newGuest;
  };

  // Current Logged In User (Auto Guest ID created if first time visitor)
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    // Automatically create a Guest Account (Guest ID is User ID)
    return createNewGuestAccount();
  });

  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);
  const [serverTimeStr, setServerTimeStr] = useState<string>('');

  const checkAdminInUrl = () => {
    try {
      const search = window.location.search;
      const urlParams = new URLSearchParams(search);
      const hash = (window.location.hash || '').toLowerCase();
      const pathname = (window.location.pathname || '').toLowerCase();
      return (
        urlParams.has('admin') ||
        urlParams.get('view') === 'admin' ||
        urlParams.get('page') === 'admin' ||
        urlParams.get('screen') === 'admin' ||
        hash === '#admin' ||
        hash === '#/admin' ||
        pathname.endsWith('/admin')
      );
    } catch {
      return false;
    }
  };

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(() => {
    return checkAdminInUrl() ? 'admin' : 'home';
  });

  useEffect(() => {
    const handleUrlChange = () => {
      if (checkAdminInUrl()) {
        setActiveScreen('admin');
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GAMES);
    if (saved) {
      try {
        const parsed: Game[] = JSON.parse(saved);
        if (parsed.length) {
          return INITIAL_GAMES.map((ig) => {
            const match = parsed.find((p) => p.id === ig.id);
            return match
              ? {
                  ...ig,
                  result: match.result || ig.result,
                  period: match.period || ig.period,
                  lastDrawTime: match.lastDrawTime || ig.lastDrawTime,
                  payoutMultiplier: ig.digits === 4 ? 100 : 50,
                }
              : ig;
          });
        }
      } catch {
        return INITIAL_GAMES;
      }
    }
    return INITIAL_GAMES;
  });

  const [bets, setBets] = useState<UserBet[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BETS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INBOX);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'msg_welcome',
        userId: 'system',
        gameName: 'Maza777 System',
        period: 'WELCOME',
        number: '777',
        status: 'SYSTEM',
        amount: 0,
        timestamp: Date.now(),
        read: false,
        title: '👋 Welcome to Maza777 Live Lottery!',
        details: '100% Free & Ads-Supported Platform. Watch Unity Rewarded Ads to place free bets in Game A (1 PM - 5 PM) & Game B (2 PM - 6 PM). All winning prizes credit directly to your Winnings Wallet!',
      },
    ];
  });

  // Global Bank Cards store (supporting multiple users)
  const [allBankCards, setAllBankCards] = useState<BankCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  });

  // User-specific bank cards (filtered by active user ID)
  const bankCards = user ? allBankCards.filter((c) => c.userId === user.id) : [];

  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    return saved === 'true';
  });

  const [betModalGame, setBetModalGame] = useState<Game | null>(null);
  const [showBankModal, setShowBankModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'win' | 'info' | 'error'; id: number } | null>(null);

  const [profitMode, setProfitModeState] = useState<'max_profit' | 'lowest_liability' | 'random'>(() => {
    const saved = localStorage.getItem('maza777_profit_mode');
    return (saved as any) || 'max_profit';
  });

  const setProfitMode = (mode: 'max_profit' | 'lowest_liability' | 'random') => {
    setProfitModeState(mode);
    localStorage.setItem('maza777_profit_mode', mode);
    showToast(
      mode === 'max_profit'
        ? '🛡️ Auto Profit Algorithm: Zero-Bet Priority'
        : mode === 'lowest_liability'
        ? '⚖️ Lowest Liability Active'
        : '🎲 Random Draw Active',
      'info'
    );
  };

  const betsRef = useRef(bets);
  useEffect(() => {
    betsRef.current = bets;
  }, [bets]);

  const profitModeRef = useRef(profitMode);
  useEffect(() => {
    profitModeRef.current = profitMode;
  }, [profitMode]);

  const analyzeGameRisk = useCallback((gameId: string) => {
    const target = games.find((g) => g.id === gameId);
    if (!target) return null;
    return analyzePeriodRisk(target, betsRef.current);
  }, [games]);

  // Sync to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(bets));
  }, [bets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INBOX, JSON.stringify(inboxMessages));
  }, [inboxMessages]);

  // 24-Hour Auto-Delete Mechanism for Inbox Messages
  useEffect(() => {
    const purgeExpiredMessages = () => {
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      setInboxMessages((prev) => {
        const valid = prev.filter((m) => {
          const expiryTime = m.expiresAt || (m.timestamp + 24 * 60 * 60 * 1000);
          return expiryTime > Date.now() && m.timestamp >= twentyFourHoursAgo;
        });
        return valid.length !== prev.length ? valid : prev;
      });
    };

    purgeExpiredMessages();
    const interval = setInterval(purgeExpiredMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(allBankCards));
  }, [allBankCards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));
  }, [withdrawals]);

  // Real-time Firebase Withdrawals Synchronizer
  useEffect(() => {
    try {
      const col = collection(db, WITHDRAWALS_COLLECTION);
      const unsubscribe = onSnapshot(col, (snapshot) => {
        if (!snapshot.empty) {
          const cloudWithdrawals: WithdrawalRecord[] = [];
          snapshot.forEach((docSnap) => {
            const d = docSnap.data();
            cloudWithdrawals.push({
              id: d.id || docSnap.id,
              userId: d.userId || '',
              userName: d.userName || '',
              userPhone: d.userPhone || '',
              amount: Number(d.amount) || 0,
              type: d.type || 'bank',
              accountNumber: d.accountNumber || '',
              bankName: d.bankName || '',
              ifscCode: d.ifscCode || '',
              realName: d.realName || '',
              upiId: d.upiId || '',
              status: d.status || 'pending',
              utrNumber: d.utrNumber,
              adminNote: d.adminNote,
              processedAt: d.processedAt,
              timestamp: d.timestamp || Date.now(),
              referenceId: d.referenceId || ('WDR' + (d.id || '').slice(-6)),
            });
          });
          cloudWithdrawals.sort((a, b) => b.timestamp - a.timestamp);
          setWithdrawals(cloudWithdrawals);
        }
      }, (err) => {
        console.warn('[Firebase] Withdrawals live sync note:', err.message);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('[Firebase] Listener error:', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, String(isAdminLoggedIn));
  }, [isAdminLoggedIn]);

  const showToast = useCallback((message: string, type: 'success' | 'win' | 'info' | 'error' = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((curr) => (curr && curr.message === message ? null : curr));
    }, 3800);
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF4500', '#00FF7F', '#1E90FF', '#8B5CF6'],
      });
    } catch {
      // Ignore
    }
  };

  const toggleAudioMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    showToast(muted ? 'Audio Muted 🔇' : 'Audio Enabled 🔊', 'info');
  };

  const unreadInboxCount = inboxMessages.filter((m) => !m.read).length;

  // Real-time Server Clock Synchronization ("savi user ko ek time dikhana chahiye")
  useEffect(() => {
    const syncServerTime = async () => {
      try {
        const start = Date.now();
        const res = await fetch('/api/time');
        if (res.ok) {
          const data = await res.json();
          const latency = Math.floor((Date.now() - start) / 2);
          const offset = (data.serverTimestamp + latency) - Date.now();
          setServerTimeOffset(offset);
        }
      } catch {
        // Fallback to local time
      }
    };

    syncServerTime();
    const syncInterval = setInterval(syncServerTime, 30000);
    return () => clearInterval(syncInterval);
  }, []);

  // Process Draw Logic
  const finalizeGameDraw = useCallback((gameId: string, forcedNumber?: string) => {
    setGames((prevGames) => {
      const targetIndex = prevGames.findIndex((g) => g.id === gameId);
      if (targetIndex === -1) return prevGames;

      const game = prevGames[targetIndex];
      const currentPeriod = game.period;

      let newWinningNumber: string;
      if (forcedNumber) {
        newWinningNumber = forcedNumber.padStart(game.digits, '0');
      } else {
        const optimal = calculateOptimalWinningNumber(game, betsRef.current, profitModeRef.current);
        newWinningNumber = optimal.winningNumber;
      }

      // Settle bets
      setBets((prevBets) => {
        let totalWonInThisDraw = 0;

        const updatedBets = prevBets.map((bet) => {
          if (bet.gameId === gameId && bet.period === currentPeriod && bet.status === 'pending') {
            const hasMatched = bet.numbers.includes(newWinningNumber);
            const payout = hasMatched ? bet.amountPerNumber * bet.payoutMultiplier : 0;
            if (hasMatched) {
              totalWonInThisDraw += payout;
            }
            return {
              ...bet,
              status: (hasMatched ? 'won' : 'lost') as 'won' | 'lost',
              winningNumber: newWinningNumber,
              payoutWon: payout,
            };
          }
          return bet;
        });

        const activeBetsForPeriod = prevBets.filter(
          (b) => b.gameId === gameId && b.period === currentPeriod && b.status === 'pending'
        );

        if (activeBetsForPeriod.length > 0) {
          if (totalWonInThisDraw > 0) {
            sounds.playWin();
            triggerConfetti();
            // Strictly credit to Winnings Wallet
            setUser((prevUser) => {
              if (!prevUser) return null;
              const newBal = prevUser.balance + totalWonInThisDraw;
              updateFirebaseBalance(prevUser.id, newBal).catch(() => {});
              return { ...prevUser, balance: newBal };
            });

            const winMsg: InboxMessage = {
              id: 'msg_win_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
              userId: user?.id || '',
              gameName: game.name,
              period: currentPeriod,
              drawNumber: currentPeriod,
              number: newWinningNumber,
              status: 'WIN',
              amount: totalWonInThisDraw,
              timestamp: Date.now(),
              expiresAt: Date.now() + 24 * 60 * 60 * 1000,
              read: false,
              title: `🏆 CONGRATULATIONS! You Won ₹${totalWonInThisDraw.toFixed(2)} in ${game.name}!`,
              details: `Lottery: ${game.name} | Draw No: #${currentPeriod} | Drawn Winning Result: ${newWinningNumber}. Your bet matched! Prize of ₹${totalWonInThisDraw.toFixed(2)} has been credited to your Winnings Wallet. (Auto-deletes in 24 hours)`,
            };
            setInboxMessages((msgs) => [winMsg, ...msgs]);
            showToast(`🏆 BIG WIN! ${game.name} Result: ${newWinningNumber}. You won ₹${totalWonInThisDraw.toFixed(2)}!`, 'win');
          } else {
            const loseMsg: InboxMessage = {
              id: 'msg_lose_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
              userId: user?.id || '',
              gameName: game.name,
              period: currentPeriod,
              drawNumber: currentPeriod,
              number: newWinningNumber,
              status: 'LOSE',
              amount: 0,
              timestamp: Date.now(),
              expiresAt: Date.now() + 24 * 60 * 60 * 1000,
              read: false,
              title: `💔 Result: ${game.name} (Draw #${currentPeriod}) - Better Luck Next Time`,
              details: `Lottery: ${game.name} | Draw No: #${currentPeriod} | Drawn Winning Result: ${newWinningNumber}. Your bet did not win this round. Keep playing and winning with Maza 777! (Auto-deletes in 24 hours)`,
            };
            setInboxMessages((msgs) => [loseMsg, ...msgs]);
            showToast(`${game.name} result is ${newWinningNumber}. Better luck next time!`, 'info');
          }
        }

        return updatedBets;
      });

      const periodNum = parseInt(currentPeriod.replace(/\D/g, ''), 10) || 1000;
      const prefix = game.id.startsWith('game-a') ? 'GA-' : game.id.startsWith('game-b') ? 'GB-' : 'G-';
      const nextPeriod = prefix + (periodNum + 1);

      const updatedGame: Game = {
        ...game,
        period: nextPeriod,
        result: newWinningNumber,
        lastDrawTime: Date.now(),
        status: 'active',
      };

      setBetModalGame((curr) => (curr && curr.id === gameId ? updatedGame : curr));

      const updatedList = [...prevGames];
      updatedList[targetIndex] = updatedGame;
      return updatedList;
    });
  }, [user?.id, showToast]);

  // Main real-time synchronized timer loop (updates every second for all users)
  useEffect(() => {
    const timer = setInterval(() => {
      const syncedNow = Date.now() + serverTimeOffset;
      const dateObj = new Date(syncedNow);
      setServerTimeStr(dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));

      setGames((prevGames) => {
        return prevGames.map((game) => {
          const computed = computeSynchronizedGameState(game, syncedNow);

          // If scheduled game (Game A or Game B) hit exact draw moment while active
          if (game.status === 'active' && computed.remainingSeconds <= 0 && (game.startHour !== undefined)) {
            sounds.playDraw?.();
            setTimeout(() => {
              finalizeGameDraw(game.id);
            }, 2500);
            return {
              ...computed,
              status: 'drawing',
            };
          }

          // If continuous rapid game completed its duration
          if (game.startHour === undefined && game.status === 'active' && computed.remainingSeconds <= 0) {
            sounds.playDraw?.();
            setTimeout(() => {
              finalizeGameDraw(game.id);
            }, 2500);
            return {
              ...computed,
              status: 'drawing',
            };
          }

          return computed;
        });
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [serverTimeOffset, finalizeGameDraw]);

  // Manual Trigger Draw for Instant Testing
  const triggerManualDraw = (gameId: string) => {
    sounds.playDraw();
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, status: 'drawing' as const } : g))
    );
    showToast('🎰 Drawing numbers now...', 'info');
    setTimeout(() => {
      finalizeGameDraw(gameId);
    }, 1800);
  };

  // Auth Operations
  const login = (identifier: string, pass: string): boolean => {
    sounds.playClick();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanId || !cleanPass) {
      showToast('Please enter your username/mobile and password', 'error');
      return false;
    }

    // Find in registered users list
    const foundUser = allUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        u.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '')
    );

    if (foundUser) {
      if (foundUser.password !== cleanPass) {
        showToast('❌ Incorrect password! Please try again.', 'error');
        return false;
      }

      const userProfile: UserProfile = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        phone: foundUser.phone,
        displayName: foundUser.displayName || foundUser.username,
        whatsapp: foundUser.phone,
        facebook: '',
        telegram: `@${foundUser.username}`,
        balance: foundUser.balance || 0.0,
        referralCode: foundUser.referralCode,
        totalReferrals: foundUser.totalReferrals || 0,
        referralEarnings: foundUser.referralEarnings || 0,
        vipLevel: foundUser.vipLevel || 1,
      };

      setUser(userProfile);
      setActiveScreen('home');
      showToast(`Welcome back, ${userProfile.displayName}! 🎮`, 'success');

      // Sync latest cloud balance from Firebase
      authenticateFirebaseUser(cleanId, cleanPass).then((fbUser) => {
        if (fbUser && fbUser.balance !== undefined) {
          setUser((curr) => curr && curr.id === fbUser.id ? { ...curr, balance: fbUser.balance } : curr);
        }
      }).catch(() => {});

      return true;
    }

    // Check Firebase directly if not cached in local phone memory
    authenticateFirebaseUser(cleanId, cleanPass).then((fbUser) => {
      if (fbUser) {
        const userProfile: UserProfile = {
          id: fbUser.id,
          username: fbUser.username,
          email: fbUser.email,
          phone: fbUser.phone,
          displayName: fbUser.username,
          whatsapp: fbUser.phone,
          facebook: '',
          telegram: `@${fbUser.username}`,
          balance: fbUser.balance || 0.0,
          referralCode: 'MAZA777',
          totalReferrals: 0,
          referralEarnings: 0,
          vipLevel: 1,
        };
        setUser(userProfile);
        setActiveScreen('home');
        showToast(`Welcome back, ${userProfile.displayName}! 🎮`, 'success');
      } else {
        showToast('❌ Account not found! Please register a new account to play.', 'error');
      }
    }).catch(() => {
      showToast('❌ Account not found! Please register a new account to play.', 'error');
    });

    return false;
  };

  const register = (username: string, email: string, phone: string, pass: string): boolean => {
    sounds.playClick();
    const cleanUser = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanPass = pass.trim();

    if (!cleanUser || !cleanEmail || !cleanPass) {
      showToast('Please complete all registration fields', 'error');
      return false;
    }

    if (cleanUser.length < 3) {
      showToast('Username must be at least 3 characters', 'error');
      return false;
    }

    if (cleanPass.length < 4) {
      showToast('Password must be at least 4 characters', 'error');
      return false;
    }

    // Check uniqueness across registered accounts
    const userExists = allUsers.some(
      (u) =>
        u.username.toLowerCase() === cleanUser.toLowerCase() ||
        u.email.toLowerCase() === cleanEmail ||
        (cleanPhone && u.phone.replace(/\D/g, '') === cleanPhone.replace(/\D/g, ''))
    );

    if (userExists) {
      showToast('⚠️ Username, Email, or Mobile is already registered! Please Login.', 'error');
      return false;
    }

    const newId = 'M777-' + Math.floor(100000 + Math.random() * 900000);
    const newRegistered: RegisteredUserAccount = {
      id: newId,
      username: cleanUser,
      email: cleanEmail,
      phone: cleanPhone || '+91 90000 00000',
      password: cleanPass,
      displayName: cleanUser,
      balance: 0.0,
      referralCode: 'MAZA' + Math.floor(1000 + Math.random() * 9000),
      totalReferrals: 0,
      referralEarnings: 0,
      vipLevel: 1,
      createdAt: Date.now(),
    };

    setAllUsers((prev) => [...prev, newRegistered]);

    // Save user credentials and initial balance to Firebase
    syncUserToFirebase({
      id: newId,
      username: cleanUser,
      email: cleanEmail,
      phone: cleanPhone || '+91 90000 00000',
      password: cleanPass,
      balance: 0.0,
      createdAt: Date.now(),
    }).catch((e) => console.warn('[Firebase] Register sync warning:', e));

    const userProfile: UserProfile = {
      id: newRegistered.id,
      username: newRegistered.username,
      email: newRegistered.email,
      phone: newRegistered.phone,
      displayName: newRegistered.displayName,
      whatsapp: newRegistered.phone,
      facebook: '',
      telegram: `@${newRegistered.username}`,
      balance: 0.0,
      referralCode: newRegistered.referralCode,
      totalReferrals: 0,
      referralEarnings: 0,
      vipLevel: 1,
      isCredentialsUpdated: true,
    };

    setUser(userProfile);
    setActiveScreen('home');

    const welcomeMsg: InboxMessage = {
      id: 'msg_' + Date.now(),
      userId: userProfile.id,
      gameName: 'Maza777 System',
      period: 'REGISTER',
      number: '777',
      status: 'SYSTEM',
      amount: 0,
      timestamp: Date.now(),
      read: false,
      title: '👋 Welcome to Maza777!',
      details: 'Account created successfully. Play 100% free by watching rewarded ads. All your lottery winning prizes will be credited directly to your Winnings Wallet!',
    };
    setInboxMessages((m) => [welcomeMsg, ...m]);
    showToast('🎉 Registration Successful! Welcome to Maza777', 'success');
    return true;
  };

  const continueAsGuest = () => {
    sounds.playClick();
    const guest = createNewGuestAccount();
    setUser(guest);
    setActiveScreen('home');
    showToast(`🎮 Playing as Guest ID: ${guest.id}`, 'info');
  };

  const guestLogin = () => {
    continueAsGuest();
  };

  const saveUserCredentials = async (email: string, pass: string, phone?: string): Promise<boolean> => {
    if (!user) return false;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();
    const cleanPhone = (phone || user.phone || '').trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      showToast('Please enter a valid Gmail / Email address', 'error');
      return false;
    }
    if (!cleanPass || cleanPass.length < 4) {
      showToast('Password must be at least 4 characters', 'error');
      return false;
    }

    const updatedProfile: UserProfile = {
      ...user,
      email: cleanEmail,
      phone: cleanPhone || user.phone,
      isCredentialsUpdated: true,
    };

    setUser(updatedProfile);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedProfile));
      localStorage.setItem(`maza777_creds_updated_${user.id}`, 'true');
    } catch {}

    // Update in allUsers array
    setAllUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === user.id);
      const userRecord: RegisteredUserAccount = {
        id: user.id,
        username: user.username,
        email: cleanEmail,
        phone: cleanPhone || user.phone,
        password: cleanPass,
        displayName: user.displayName,
        balance: user.balance,
        referralCode: user.referralCode,
        totalReferrals: user.totalReferrals,
        referralEarnings: user.referralEarnings,
        vipLevel: user.vipLevel,
        createdAt: Date.now(),
      };
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = userRecord;
        return copy;
      }
      return [...prev, userRecord];
    });

    // Save directly to Firebase
    try {
      await syncUserToFirebase({
        id: user.id,
        username: user.username,
        email: cleanEmail,
        phone: cleanPhone || user.phone,
        password: cleanPass,
        balance: user.balance,
        createdAt: Date.now(),
      });
    } catch (err) {
      console.warn('[Firebase] saveUserCredentials sync warning:', err);
    }

    showToast('✅ Gmail/Email & Password saved to Firebase successfully!', 'success');
    return true;
  };

  const claimReferralEarnings = (): boolean => {
    if (!user) return false;
    const earnings = user.referralEarnings || 0;
    if (earnings <= 0) {
      showToast('No referral commissions available to claim right now!', 'info');
      return false;
    }

    sounds.playWin();
    triggerConfetti();
    const newBal = user.balance + earnings;
    const updatedUser = {
      ...user,
      balance: newBal,
      referralEarnings: 0,
    };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    updateFirebaseBalance(user.id, newBal).catch(() => {});
    showToast(`🎉 ₹${earnings.toFixed(2)} Referral Commission claimed to your Winnings Wallet!`, 'success');
    return true;
  };

  const logout = () => {
    sounds.playClick();
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setActiveScreen('login');
    showToast('Logged out successfully. You can log in anytime with your Gmail / Email ID.', 'info');
  };

  // Place Bets (100% Free Ads-Supported - Works seamlessly for Guest ID and Registered Users)
  const placeBets = (gameId: string, numbers: string[], amountPerNumber: number): boolean => {
    let activeUser = user;
    if (!activeUser) {
      activeUser = createNewGuestAccount();
      setUser(activeUser);
    }

    if (numbers.length === 0) {
      showToast('Please select at least one number', 'error');
      return false;
    }

    const totalCost = numbers.length * amountPerNumber;
    const targetGame = games.find((g) => g.id === gameId);
    if (!targetGame) {
      showToast('Game not found', 'error');
      return false;
    }

    if (targetGame.status === 'drawing' || targetGame.status === 'closed') {
      showToast('Betting is closed for this draw period!', 'error');
      return false;
    }

    sounds.playChipBet();

    const multiplier = targetGame.digits === 4 ? 100 : 50;

    const newBet: UserBet = {
      id: 'bet_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      userId: activeUser.id,
      gameName: targetGame.name,
      gameId: targetGame.id,
      digits: targetGame.digits,
      period: targetGame.period,
      numbers: [...numbers],
      amountPerNumber: amountPerNumber,
      totalAmount: totalCost,
      payoutMultiplier: multiplier,
      timestamp: Date.now(),
      status: 'pending',
      adRewarded: true,
      adToBetRatio: '10:1',
      unityAdId: '800360831',
      adNetwork: 'Adsterra Smartlink',
      firebaseSynced: true,
    };

    setBets((prev) => [newBet, ...prev]);

    // Send instant inbox notification for successfully placed bet (auto-deletes in 24 hours)
    const betPlacedMsg: InboxMessage = {
      id: 'msg_bet_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      userId: activeUser.id,
      gameName: targetGame.name,
      period: targetGame.period,
      drawNumber: targetGame.period,
      number: numbers.join(', '),
      status: 'BET_SUCCESS',
      amount: totalCost,
      timestamp: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      read: false,
      title: `🎟️ Bet Placed: ${targetGame.name} (Draw #${targetGame.period})`,
      details: `Lottery: ${targetGame.name} | Draw No: #${targetGame.period} | Selected Pick: #${numbers.join(', ')}. Stake: ₹${totalCost} (Free via Ad). Potential Win: ₹${totalCost * multiplier}. Best of luck! (Auto-deletes in 24 hours)`,
    };
    setInboxMessages((msgs) => [betPlacedMsg, ...msgs]);

    // Also sync to server-side multi-user database
    try {
      fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bet: newBet }),
      }).catch(() => {});
    } catch {
      // Offline safe
    }

    showToast(`✅ Bet placed for #${numbers.join(', ')} (Rewarded Ad Verified)`, 'success');
    closeBetModal();
    return true;
  };

  // Admin Operations
  const adminLogin = (adminId: string, adminPass: string): boolean => {
    sounds.playClick();
    const idClean = adminId.trim();
    const passClean = adminPass.trim();

    if (
      (idClean === ADMIN_AUTH_CONFIG.DEFAULT_ID && passClean === ADMIN_AUTH_CONFIG.DEFAULT_PASS) ||
      (idClean === ADMIN_AUTH_CONFIG.BACKUP_ID && passClean === ADMIN_AUTH_CONFIG.BACKUP_PASS)
    ) {
      setIsAdminLoggedIn(true);
      showToast('🛡️ Super Admin Access Granted!', 'success');
      return true;
    }

    showToast('❌ Invalid Admin Credentials', 'error');
    return false;
  };

  const adminLogout = () => {
    sounds.playClick();
    setIsAdminLoggedIn(false);
    showToast('Admin session closed', 'info');
  };

  const processWithdrawal = (withdrawalId: string): boolean => {
    sounds.playClick();
    const target = withdrawals.find((item) => item.id === withdrawalId);
    if (!target) {
      showToast('Withdrawal record not found', 'error');
      return false;
    }
    if (target.status !== 'pending') {
      showToast(`This request is already ${target.status}`, 'info');
      return false;
    }

    const updatedRecord: WithdrawalRecord = {
      ...target,
      status: 'processing',
      adminNote: 'Admin is verifying bank credentials and processing payout transfer.',
      processedAt: Date.now(),
    };

    setWithdrawals((prev) => prev.map((item) => (item.id === withdrawalId ? updatedRecord : item)));

    const procMsg: InboxMessage = {
      id: 'msg_proc_' + Date.now(),
      userId: target.userId,
      gameName: 'Withdrawal In Process',
      period: target.referenceId,
      number: 'PROCESSING',
      status: 'SYSTEM',
      amount: target.amount,
      timestamp: Date.now(),
      read: false,
      title: `🔄 Withdrawal of ₹${target.amount.toFixed(2)} is Processing`,
      details: `Your withdrawal request #${target.referenceId} is now being processed by Admin. Payout will be sent directly via IMPS / UPI within 24 hours.`,
    };
    setInboxMessages((prev) => [procMsg, ...prev]);

    showToast(`Withdrawal #${target.referenceId} marked as Processing!`, 'info');
    return true;
  };

  const approveWithdrawal = (withdrawalId: string, utrNumber?: string, note?: string): boolean => {
    sounds.playWin();
    const target = withdrawals.find((item) => item.id === withdrawalId);
    if (!target) {
      showToast('Withdrawal record not found', 'error');
      return false;
    }
    if (target.status === 'approved' || target.status === 'rejected') {
      showToast(`This request is already marked as ${target.status}`, 'info');
      return false;
    }

    const processedUtr = utrNumber?.trim() || 'IMPS' + Math.floor(100000000000 + Math.random() * 900000000000);
    const adminNotes = note?.trim() || 'Transferred by Admin via Instant IMPS/NEFT';

    const updatedRecord: WithdrawalRecord = {
      ...target,
      status: 'approved',
      utrNumber: processedUtr,
      adminNote: adminNotes,
      processedAt: Date.now(),
    };

    setWithdrawals((prev) => prev.map((item) => (item.id === withdrawalId ? updatedRecord : item)));

    // Sync status to Firebase Cloud
    updateFirebaseWithdrawalStatus(withdrawalId, 'approved', processedUtr, adminNotes).catch((err) => {
      console.warn('[Firebase] approve sync:', err);
    });

    const successMsg: InboxMessage = {
      id: 'msg_appr_' + Date.now(),
      userId: target.userId,
      gameName: 'Withdrawal Approved',
      period: target.referenceId,
      number: 'SUCCESS',
      status: 'SYSTEM',
      amount: target.amount,
      timestamp: Date.now(),
      read: false,
      title: `✅ Withdrawal of ₹${target.amount.toFixed(2)} Transferred!`,
      details: `Admin has transferred ₹${target.amount.toFixed(2)} to ${target.bankName} (${target.accountNumber}). UTR: ${processedUtr}. Note: ${adminNotes}`,
    };
    setInboxMessages((prev) => [successMsg, ...prev]);

    showToast(`✅ Withdrawal #${target.referenceId} Approved! ₹${target.amount.toFixed(2)} transferred.`, 'success');
    return true;
  };

  const rejectWithdrawal = (withdrawalId: string, reason: string): boolean => {
    sounds.playClick();
    const target = withdrawals.find((item) => item.id === withdrawalId);
    if (!target) {
      showToast('Withdrawal record not found', 'error');
      return false;
    }
    if (target.status === 'approved' || target.status === 'rejected') {
      showToast(`This request is already ${target.status}`, 'info');
      return false;
    }

    const rejectReason = reason?.trim() || 'Account Verification Issue';
    const updatedRecord: WithdrawalRecord = {
      ...target,
      status: 'rejected',
      adminNote: rejectReason,
      processedAt: Date.now(),
    };

    setWithdrawals((prev) => prev.map((item) => (item.id === withdrawalId ? updatedRecord : item)));

    // Sync rejection status and refund balance to Firebase Cloud
    updateFirebaseWithdrawalStatus(withdrawalId, 'rejected', undefined, rejectReason).catch((err) => {
      console.warn('[Firebase] reject sync:', err);
    });
    if (target.userId) {
      const u = allUsers.find((x) => x.id === target.userId);
      const refundedBalance = (u?.balance || user?.balance || 0) + target.amount;
      updateFirebaseBalance(target.userId, refundedBalance).catch(() => {});
    }

    // Refund amount back to Winnings Wallet
    setUser((prev) => {
      if (prev && prev.id === target.userId) {
        return { ...prev, balance: prev.balance + target.amount };
      }
      return prev;
    });

    const rejectMsg: InboxMessage = {
      id: 'msg_rej_' + Date.now(),
      userId: target.userId,
      gameName: 'Withdrawal Rejected & Refunded',
      period: target.referenceId,
      number: 'REFUNDED',
      status: 'SYSTEM',
      amount: target.amount,
      timestamp: Date.now(),
      read: false,
      title: `❌ Withdrawal Rejected & ₹${target.amount.toFixed(2)} Refunded`,
      details: `Your withdrawal request #${target.referenceId} was rejected. Reason: ${rejectReason}. The amount has been refunded back to your Winnings Wallet.`,
    };
    setInboxMessages((prev) => [rejectMsg, ...prev]);

    showToast(`Withdrawal #${target.referenceId} rejected and refunded to wallet.`, 'info');
    return true;
  };

  const adminAdjustBalance = (targetUserId: string, amount: number, note: string): boolean => {
    sounds.playWin();
    setUser((prev) => {
      if (prev) {
        return { ...prev, balance: Math.max(0, prev.balance + amount) };
      }
      return prev;
    });

    const adjMsg: InboxMessage = {
      id: 'msg_adj_' + Date.now(),
      userId: targetUserId,
      gameName: 'Admin Wallet Adjustment',
      period: 'ADMIN',
      number: amount >= 0 ? `+₹${amount}` : `-₹${Math.abs(amount)}`,
      status: 'SYSTEM',
      amount: Math.abs(amount),
      timestamp: Date.now(),
      read: false,
      title: amount >= 0 ? `💰 Admin Added ₹${amount.toFixed(2)} to Winnings` : `⚠️ Admin Adjusted ₹${Math.abs(amount).toFixed(2)}`,
      details: `Admin note: ${note || 'Manual wallet adjustment by superadmin.'}`,
    };
    setInboxMessages((prev) => [adjMsg, ...prev]);
    showToast(`User balance adjusted by ₹${amount >= 0 ? '+' : ''}${amount.toFixed(2)}`, 'success');
    return true;
  };

  const adminSetGameResult = (gameId: string, customWinningNumber: string): boolean => {
    const targetGame = games.find((g) => g.id === gameId);
    if (!targetGame) return false;

    const cleaned = customWinningNumber.replace(/\D/g, '');
    if (cleaned.length !== targetGame.digits) {
      showToast(`Please enter a valid ${targetGame.digits}-digit number`, 'error');
      return false;
    }

    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, status: 'drawing' as const } : g))
    );
    showToast(`Admin triggering draw with winning number: ${cleaned}`, 'info');

    setTimeout(() => {
      finalizeGameDraw(gameId, cleaned);
    }, 1200);

    return true;
  };

  // Request Withdrawal from Winnings (Bank or UPI)
  const requestWithdrawal = (
    paramOrAmount: number | {
      amount: number;
      type: 'bank' | 'upi';
      realName: string;
      accountNumber: string;
      bankName: string;
      ifscCode?: string;
      upiId?: string;
      phone?: string;
      saveMethod?: boolean;
    },
    legacyCardId?: string
  ): boolean => {
    if (!user) return false;

    let amount = 0;
    let type: 'bank' | 'upi' = 'bank';
    let realName = user.displayName || user.username;
    let accountNumber = '';
    let bankName = '';
    let ifscCode = '';
    let upiId = '';
    let phone = user.phone || user.whatsapp || '';
    let saveMethod = false;

    if (typeof paramOrAmount === 'object') {
      amount = paramOrAmount.amount;
      type = paramOrAmount.type;
      realName = paramOrAmount.realName.trim() || user.displayName;
      accountNumber = paramOrAmount.accountNumber.trim();
      bankName = paramOrAmount.bankName.trim();
      ifscCode = paramOrAmount.ifscCode?.trim() || '';
      upiId = paramOrAmount.upiId?.trim() || '';
      phone = paramOrAmount.phone?.trim() || user.phone;
      saveMethod = !!paramOrAmount.saveMethod;
    } else {
      amount = paramOrAmount;
      const card = bankCards.find((c) => c.id === legacyCardId);
      if (!card) {
        showToast('Please provide valid bank or UPI withdrawal details', 'error');
        return false;
      }
      type = card.type || 'bank';
      realName = card.realName;
      accountNumber = card.accountNumber;
      bankName = card.bankName;
      ifscCode = card.ifscCode || '';
      upiId = card.upiId || '';
      phone = card.phone || user.phone;
    }

    if (amount <= 0) {
      showToast('Please enter a valid withdrawal amount', 'error');
      return false;
    }
    if (amount < 100) {
      showToast('Minimum withdrawal amount is ₹100', 'error');
      return false;
    }
    if (amount > user.balance) {
      showToast(`Cannot withdraw ₹${amount}. Exceeds winning balance ₹${user.balance.toFixed(2)}`, 'error');
      return false;
    }

    if (type === 'bank') {
      if (!accountNumber || accountNumber.length < 6) {
        showToast('Please enter a valid Bank Account Number', 'error');
        return false;
      }
      if (!bankName) {
        showToast('Please enter or select your Bank Name', 'error');
        return false;
      }
      if (!ifscCode || ifscCode.length < 5) {
        showToast('Please enter a valid Bank IFSC Code', 'error');
        return false;
      }
    } else {
      if (!upiId && !accountNumber) {
        showToast('Please enter your valid UPI ID (e.g. name@paytm, name@oksbi)', 'error');
        return false;
      }
      if (!accountNumber) accountNumber = upiId;
      if (!upiId) upiId = accountNumber;
      if (!bankName) bankName = 'UPI Direct';
    }

    sounds.playChipBet();
    setUser((prev) => (prev ? { ...prev, balance: prev.balance - amount } : null));

    const newWithdrawal: WithdrawalRecord = {
      id: 'w_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      userId: user.id,
      userName: user.displayName || user.username,
      userPhone: phone,
      amount: amount,
      type: type,
      bankName: bankName,
      accountNumber: accountNumber,
      realName: realName,
      ifscCode: ifscCode,
      upiId: upiId,
      status: 'pending', // Strictly starts in pending state awaiting manual admin review
      timestamp: Date.now(),
      referenceId: 'WDR' + Math.floor(10000000 + Math.random() * 90000000),
    };

    setWithdrawals((prev) => [newWithdrawal, ...prev]);

    // Save withdrawal request to Firebase Cloud
    createFirebaseWithdrawal({
      id: newWithdrawal.id,
      userId: user.id,
      userName: user.displayName || user.username,
      userEmail: user.email,
      userPhone: phone,
      amount: amount,
      type: type,
      bankName: bankName,
      accountNumber: accountNumber,
      realName: realName,
      ifscCode: ifscCode,
      upiId: upiId,
      status: 'pending',
      timestamp: Date.now(),
    }).catch((err) => console.warn('[Firebase] Withdrawal save error:', err));

    // Update wallet balance in Firebase Cloud
    updateFirebaseBalance(user.id, user.balance - amount).catch(() => {});

    // If requested to save method for future
    if (saveMethod) {
      const isBank = type === 'bank';
      const normAcc = accountNumber.trim().toLowerCase();
      const normUpi = (upiId || accountNumber).trim().toLowerCase();

      // Check cross-user conflict
      const usedByOther = allBankCards.some((c) => {
        if (!c.userId || c.userId === user.id) return false;
        if (isBank) {
          return (!c.type || c.type === 'bank') && c.accountNumber.trim().toLowerCase() === normAcc;
        } else {
          return c.type === 'upi' && (c.upiId || c.accountNumber).trim().toLowerCase() === normUpi;
        }
      });

      if (usedByOther) {
        showToast('❌ Yeh Bank Account / UPI ID pehle se kisi dusre user ke account me registered hai! Multiple users cannot use the same bank details.', 'error');
        // Revert user balance deduction
        setUser((prev) => (prev ? { ...prev, balance: prev.balance + amount } : null));
        setWithdrawals((prev) => prev.filter((w) => w.id !== newWithdrawal.id));
        return false;
      }

      const userCards = allBankCards.filter((c) => c.userId === user.id);
      const alreadySaved = userCards.some((c) => {
        if (isBank) {
          return (!c.type || c.type === 'bank') && c.accountNumber.trim().toLowerCase() === normAcc;
        } else {
          return c.type === 'upi' && (c.upiId || c.accountNumber).trim().toLowerCase() === normUpi;
        }
      });

      if (!alreadySaved && userCards.length < 5) {
        setAllBankCards((prev) => [
          ...prev,
          {
            id: 'method_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            userId: user.id,
            type,
            realName,
            accountNumber,
            bankName,
            ifscCode,
            upiId,
            phone,
            isDefault: userCards.length === 0,
          },
        ]);
      }
    }

    const pendingMsg: InboxMessage = {
      id: 'msg_w_' + Date.now(),
      userId: user.id,
      gameName: 'Withdrawal Pending Admin Transfer',
      period: newWithdrawal.referenceId,
      number: 'PENDING',
      status: 'SYSTEM',
      amount: amount,
      timestamp: Date.now(),
      read: false,
      title: `⏳ Withdrawal of ₹${amount.toFixed(2)} (${type === 'upi' ? 'UPI' : 'Bank'}) Pending`,
      details: `Your withdrawal request of ₹${amount.toFixed(2)} to ${type === 'upi' ? `UPI ID: ${upiId}` : `${bankName} (A/C: ${accountNumber})`} has been placed. Status is strictly PENDING. Admin will manually verify and transfer funds via IMPS/UPI. Ref: ${newWithdrawal.referenceId}. Contact support: https://t.me/maza777com`,
    };
    setInboxMessages((m) => [pendingMsg, ...m]);

    showToast(`Withdrawal of ₹${amount.toFixed(2)} placed! Status: Pending Admin Transfer`, 'info');
    return true;
  };

  const addBankCard = (cardData: Omit<BankCard, 'id' | 'userId'>): boolean => {
    if (!user) {
      showToast('🔒 Please Login first to add Bank Account or UPI ID', 'error');
      return false;
    }

    const isBank = (cardData.type || 'bank') === 'bank';
    const normAcc = cardData.accountNumber.trim().toLowerCase();
    const normUpi = (cardData.upiId || cardData.accountNumber).trim().toLowerCase();

    // 1. Max 5 Accounts Per User Limit
    const userCards = allBankCards.filter((c) => c.userId === user.id);
    if (userCards.length >= 5) {
      showToast('❌ Limit reached! One user can add up to 5 different bank accounts / UPI IDs only (5/5).', 'error');
      return false;
    }

    // 2. Duplicate Account for the same user
    const duplicateInUser = userCards.some((c) => {
      if (isBank) {
        return (!c.type || c.type === 'bank') && c.accountNumber.trim().toLowerCase() === normAcc;
      } else {
        return c.type === 'upi' && (c.upiId || c.accountNumber).trim().toLowerCase() === normUpi;
      }
    });

    if (duplicateInUser) {
      showToast(`⚠️ This ${isBank ? 'Bank Account' : 'UPI ID'} is already added in your account!`, 'error');
      return false;
    }

    // 3. Strict Cross-User Restriction: No other user can use the same bank account or UPI ID
    const usedByOtherUser = allBankCards.some((c) => {
      if (!c.userId || c.userId === user.id) return false;
      if (isBank) {
        return (!c.type || c.type === 'bank') && c.accountNumber.trim().toLowerCase() === normAcc;
      } else {
        return c.type === 'upi' && (c.upiId || c.accountNumber).trim().toLowerCase() === normUpi;
      }
    });

    if (usedByOtherUser) {
      showToast('❌ Yeh Bank Account / UPI ID pehle se kisi dusre user ke account me registered hai! Same account multiple users use nahi kar sakte.', 'error');
      return false;
    }

    sounds.playClick();
    const newCard: BankCard = {
      ...cardData,
      id: 'bank_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      userId: user.id,
      isDefault: userCards.length === 0,
    };

    setAllBankCards((prev) => [...prev, newCard]);
    closeBankModal();
    showToast(`✅ ${isBank ? cardData.bankName : 'UPI ID'} saved successfully! (${userCards.length + 1}/5 Accounts Saved)`, 'success');
    return true;
  };

  const deleteBankCard = (id: string) => {
    sounds.playClick();
    setAllBankCards((prev) => prev.filter((c) => c.id !== id));
    showToast('Bank / UPI account removed', 'info');
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    sounds.playClick();
    setUser((prev) => (prev ? { ...prev, ...data } : null));
    showToast('Profile updated successfully!', 'success');
  };

  const markMessageAsRead = (id: string) => {
    setInboxMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
  };

  const markAllMessagesAsRead = () => {
    sounds.playClick();
    setInboxMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  const deleteMessage = (id: string) => {
    setInboxMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const clearAllMessages = () => {
    sounds.playClick();
    setInboxMessages([]);
    showToast('Inbox cleared', 'info');
  };

  const navigateTo = (screen: ActiveScreen) => {
    sounds.playClick();
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      if (screen === 'admin') {
        const url = new URL(window.location.href);
        url.searchParams.set('admin', '1');
        window.history.pushState({}, '', url.pathname + url.search + url.hash);
      } else {
        const url = new URL(window.location.href);
        if (url.searchParams.has('admin') || url.searchParams.get('page') === 'admin' || url.searchParams.get('view') === 'admin') {
          url.searchParams.delete('admin');
          url.searchParams.delete('page');
          url.searchParams.delete('view');
          const cleanQuery = url.searchParams.toString();
          window.history.pushState({}, '', url.pathname + (cleanQuery ? `?${cleanQuery}` : '') + (url.hash && url.hash.includes('admin') ? '' : url.hash));
        }
      }
    } catch {
      // Ignore
    }
  };

  const openBetModal = (game: Game) => {
    if (!user) {
      showToast('🔒 Bina registration / login ke game play nahi kar sakte! Please Register or Login.', 'error');
      return;
    }
    sounds.playClick();
    setBetModalGame(game);
  };

  const closeBetModal = () => {
    setBetModalGame(null);
  };

  const openBankModal = () => {
    sounds.playClick();
    setShowBankModal(true);
  };

  const closeBankModal = () => {
    setShowBankModal(false);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeScreen,
        games,
        bets,
        inboxMessages,
        unreadInboxCount,
        bankCards,
        withdrawals,
        betModalGame,
        showBankModal,
        toast,
        isMuted,
        serverTimeOffset,
        serverTimeStr,
        navigateTo,
        openBetModal,
        closeBetModal,
        openBankModal,
        closeBankModal,
        toggleAudioMute,
        isAdminLoggedIn,
        profitMode,
        setProfitMode,
        analyzeGameRisk,
        login,
        register,
        guestLogin,
        continueAsGuest,
        saveUserCredentials,
        claimReferralEarnings,
        logout,
        adminLogin,
        adminLogout,
        processWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        adminAdjustBalance,
        adminSetGameResult,
        requestWithdrawal,
        addBankCard,
        deleteBankCard,
        updateProfile,
        placeBets,
        triggerManualDraw,
        markMessageAsRead,
        markAllMessagesAsRead,
        deleteMessage,
        clearAllMessages,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
