import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable CORS for mobile WebViews, APKs, and external requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// In-Memory Multi-User Real-time Database Store
export interface ServerGameState {
  id: string;
  name: string;
  category: 'turbo' | 'kerala' | 'nagaland' | 'international';
  digits: 3 | 4;
  period: string;
  result: string;
  startHour: number; // 0-23
  endHour: number;   // 0-24
  startMinute: number;
  endMinute: number;
  payoutMultiplier: number;
  lastDrawTime: number;
  status: 'active' | 'upcoming' | 'drawing' | 'closed';
  badge: string;
  description: string;
}

// Scheduled Real-time Games covering multiple distinct real-world time slots throughout the day
let serverGames: ServerGameState[] = [
  {
    id: 'morning-express-3d',
    name: 'Morning Express 3D',
    category: 'turbo',
    digits: 3,
    period: 'ME-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '482',
    startHour: 9,  // 09:00 AM
    endHour: 13,   // 01:00 PM
    startMinute: 0,
    endMinute: 0,
    payoutMultiplier: 25,
    lastDrawTime: Date.now(),
    status: 'active',
    badge: '9:00 AM - 1:00 PM',
    description: 'Daily Morning Real-time 3D Draw running 9:00 AM to 1:00 PM with 25x Payout.',
  },
  {
    id: 'kerala-win-win-3d',
    name: 'Kerala Win-Win 3D',
    category: 'kerala',
    digits: 3,
    period: 'KW-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '539',
    startHour: 10, // 10:00 AM
    endHour: 14,   // 02:00 PM
    startMinute: 0,
    endMinute: 0,
    payoutMultiplier: 25,
    lastDrawTime: Date.now(),
    status: 'active',
    badge: '10:00 AM - 2:00 PM',
    description: 'Official Kerala State Series 3-Digit draw running 10:00 AM to 2:00 PM.',
  },
  {
    id: 'nagaland-dear-dwarka-3d',
    name: 'Nagaland Dear Dwarka 3D',
    category: 'nagaland',
    digits: 3,
    period: 'ND-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '185',
    startHour: 11, // 11:00 AM
    endHour: 15,   // 03:00 PM
    startMinute: 0,
    endMinute: 0,
    payoutMultiplier: 25,
    lastDrawTime: Date.now(),
    status: 'active',
    badge: '11:00 AM - 3:00 PM',
    description: 'Nagaland State Dear Dwarka 3-Digit draw running 11:00 AM to 3:00 PM.',
  },
  {
    id: 'afternoon-golden-3d',
    name: 'Afternoon Golden 3D',
    category: 'turbo',
    digits: 3,
    period: 'AG-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '777',
    startHour: 13, // 01:00 PM
    endHour: 17,   // 05:00 PM
    startMinute: 0,
    endMinute: 0,
    payoutMultiplier: 25,
    lastDrawTime: Date.now(),
    status: 'active',
    badge: '1:00 PM - 5:00 PM',
    description: 'Afternoon Prime Real-time 3D Draw running 1:00 PM to 5:00 PM with 25x Payout.',
  },
  {
    id: 'royal-jackpot-4d',
    name: 'Royal Jackpot 4D',
    category: 'turbo',
    digits: 4,
    period: 'RJ-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '7777',
    startHour: 14, // 02:00 PM
    endHour: 18,   // 06:00 PM
    startMinute: 0,
    endMinute: 0,
    payoutMultiplier: 90,
    lastDrawTime: Date.now(),
    status: 'active',
    badge: '2:00 PM - 6:00 PM',
    description: 'Daily Synchronized 2:00 PM to 6:00 PM 4D Mega Jackpot Draw with 90x Payout.',
  },
  {
    id: 'kerala-monsoon-bumper-4d',
    name: 'Kerala Monsoon Bumper 4D',
    category: 'kerala',
    digits: 4,
    period: 'KM-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '7391',
    startHour: 15, // 03:00 PM
    endHour: 19,   // 07:00 PM
    startMinute: 0,
    endMinute: 0,
    payoutMultiplier: 90,
    lastDrawTime: Date.now(),
    status: 'active',
    badge: '3:00 PM - 7:00 PM',
    description: 'Kerala Mega Bumper 4-Digit jackpot running 3:00 PM to 7:00 PM.',
  },
  {
    id: 'nagaland-dear-blitzen-4d',
    name: 'Nagaland Dear Blitzen 4D',
    category: 'nagaland',
    digits: 4,
    period: 'NB-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '6031',
    startHour: 16, // 04:00 PM
    endHour: 20,   // 08:00 PM
    startMinute: 0,
    endMinute: 0,
    payoutMultiplier: 90,
    lastDrawTime: Date.now(),
    status: 'active',
    badge: '4:00 PM - 8:00 PM',
    description: 'Nagaland Dear Blitzen 4-digit bumper draw running 4:00 PM to 8:00 PM.',
  },
  {
    id: 'evening-delight-3d',
    name: 'Evening Delight 3D',
    category: 'turbo',
    digits: 3,
    period: 'ED-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '924',
    startHour: 17, // 05:00 PM
    endHour: 21,   // 09:00 PM
    startMinute: 0,
    endMinute: 0,
    payoutMultiplier: 25,
    lastDrawTime: Date.now(),
    status: 'active',
    badge: '5:00 PM - 9:00 PM',
    description: 'Evening Prime 3D Live Draw running 5:00 PM to 9:00 PM with 25x Payout.',
  },
  {
    id: 'night-star-4d',
    name: 'Night Star 4D Jackpot',
    category: 'turbo',
    digits: 4,
    period: 'NS-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '8024',
    startHour: 18, // 06:00 PM
    endHour: 22,   // 10:00 PM
    startMinute: 0,
    endMinute: 0,
    payoutMultiplier: 90,
    lastDrawTime: Date.now(),
    status: 'active',
    badge: '6:00 PM - 10:00 PM',
    description: 'Night Star High Stakes 4D Jackpot running 6:00 PM to 10:00 PM with 90x Payout.',
  },
  {
    id: 'midnight-dhamaka-3d',
    name: 'Midnight Dhamaka 3D',
    category: 'turbo',
    digits: 3,
    period: 'MD-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '369',
    startHour: 20, // 08:00 PM
    endHour: 24,   // 12:00 AM Midnight
    startMinute: 0,
    endMinute: 0,
    payoutMultiplier: 25,
    lastDrawTime: Date.now(),
    status: 'active',
    badge: '8:00 PM - 12:00 AM',
    description: 'Grand Midnight 3D Finale Draw running 8:00 PM to 12:00 Midnight with 25x Payout.',
  },
  {
    id: 'taiwan-bingo',
    name: 'Taiwan Bingo 3D',
    category: 'international',
    digits: 3,
    period: 'TB-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '888',
    startHour: 7,  // 07:00 AM
    endHour: 11,   // 11:00 AM
    startMinute: 0,
    endMinute: 0,
    payoutMultiplier: 25,
    lastDrawTime: Date.now(),
    status: 'active',
    badge: '7:00 AM - 11:00 AM',
    description: 'Taiwan official bingo 3-digit live draw running 7:00 AM to 11:00 AM.',
  },
  {
    id: 'canada-wclc-4d',
    name: 'Canada WCLC 4D',
    category: 'international',
    digits: 4,
    period: 'CW-' + new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    result: '4190',
    startHour: 12, // 12:00 PM
    endHour: 16,   // 04:00 PM
    startMinute: 0,
    endMinute: 0,
    payoutMultiplier: 90,
    lastDrawTime: Date.now(),
    status: 'active',
    badge: '12:00 PM - 4:00 PM',
    description: 'Western Canada Lottery Corporation 4D draw running 12:00 PM to 4:00 PM.',
  },
];

let globalDrawHistory: any[] = [];
let multiUserBets: any[] = [];

// Helper: Calculate Real-time dynamic game status and countdown based on server real-time clock
function computeServerGameDynamicState(game: ServerGameState, now: Date) {
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentSecs = now.getSeconds();
  const totalSecondsToday = currentHours * 3600 + currentMinutes * 60 + currentSecs;

  const startSecs = game.startHour * 3600 + (game.startMinute || 0) * 60;
  const endSecs = game.endHour * 3600 + (game.endMinute || 0) * 60;

  let status: 'active' | 'upcoming' | 'drawing' | 'closed' = 'active';
  let remainingSeconds = 0;
  let nextActionLabel = '';

  if (totalSecondsToday < startSecs) {
    status = 'upcoming';
    remainingSeconds = startSecs - totalSecondsToday;
    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;
    nextActionLabel = `Starts in ${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
  } else if (totalSecondsToday >= startSecs && totalSecondsToday < endSecs) {
    status = 'active';
    remainingSeconds = endSecs - totalSecondsToday;
    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;
    nextActionLabel = `Auto Draw in ${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
  } else {
    // Closed for today, will auto restart tomorrow
    status = 'closed';
    remainingSeconds = (24 * 3600 - totalSecondsToday) + startSecs;
    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;
    const formattedHour = game.startHour % 12 || 12;
    const ampm = game.startHour >= 12 ? 'PM' : 'AM';
    nextActionLabel = `Next: Tomorrow ${formattedHour}:00 ${ampm} (in ${h}h ${m}m)`;
  }

  return {
    ...game,
    status,
    remainingSeconds,
    nextActionLabel,
    serverNow: now.getTime(),
  };
}

// API 1: Real-time Authoritative Server Time Synchronization
app.get('/api/time', (req, res) => {
  const now = new Date();
  res.json({
    serverTimestamp: now.getTime(),
    serverIso: now.toISOString(),
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
  });
});

// API 2: Real-time Multi-User Game States synchronized with real time
app.get('/api/games', (req, res) => {
  const now = new Date();
  const dynamicGames = serverGames.map((game) => computeServerGameDynamicState(game, now));

  res.json({
    games: dynamicGames,
    serverTime: now.getTime(),
  });
});

// API 3: Place Multi-User Bet in Real-time DB
app.post('/api/bets', (req, res) => {
  const { bet } = req.body;
  if (!bet || !bet.gameId) {
    return res.status(400).json({ error: 'Invalid bet payload' });
  }

  const storedBet = {
    ...bet,
    id: bet.id || 'bet_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
    serverTimestamp: Date.now(),
    status: 'pending',
  };

  multiUserBets.unshift(storedBet);
  if (multiUserBets.length > 500) {
    multiUserBets = multiUserBets.slice(0, 500);
  }

  res.json({ success: true, bet: storedBet });
});

// Helper: Compute winning number following strict Zero-Bet priority & Min-Bet fallback
function computeServerWinningNumber(game: ServerGameState, bets: any[]): string {
  const digits = game.digits;
  const maxLimit = Math.pow(10, digits);
  const currentPeriod = game.period;

  const activeBets = bets.filter(
    (b) => b.gameId === game.id && b.period === currentPeriod && b.status === 'pending'
  );

  const betVolumeMap = new Map<string, number>();

  for (const bet of activeBets) {
    if (Array.isArray(bet.numbers)) {
      for (const num of bet.numbers) {
        const formattedNum = String(num).trim().padStart(digits, '0');
        const wagerAmt = bet.amountPerNumber || 10;
        betVolumeMap.set(formattedNum, (betVolumeMap.get(formattedNum) || 0) + wagerAmt);
      }
    }
  }

  // 1. Jis number par koi bhi bet nahi hua ho -> wahi result aayega
  const unbetNumbers: string[] = [];
  for (let i = 0; i < maxLimit; i++) {
    const candidate = String(i).padStart(digits, '0');
    if (!betVolumeMap.has(candidate) || (betVolumeMap.get(candidate) || 0) <= 0) {
      unbetNumbers.push(candidate);
    }
  }

  if (unbetNumbers.length > 0) {
    return unbetNumbers[Math.floor(Math.random() * unbetNumbers.length)];
  }

  // 2. Agar all numbers par bet hua ho -> kam se kam bet kiya hua number win hoga
  let minWager = Infinity;
  let minCandidates: string[] = [];

  for (let i = 0; i < maxLimit; i++) {
    const candidate = String(i).padStart(digits, '0');
    const wager = betVolumeMap.get(candidate) || 0;
    if (wager < minWager) {
      minWager = wager;
      minCandidates = [candidate];
    } else if (wager === minWager) {
      minCandidates.push(candidate);
    }
  }

  return minCandidates[Math.floor(Math.random() * minCandidates.length)] || '000';
}

// API 4: Real-time Multi-User Live Draw Execution
app.post('/api/draws/execute', (req, res) => {
  const { gameId, winningNumber } = req.body;
  const gameIndex = serverGames.findIndex((g) => g.id === gameId);

  if (gameIndex === -1) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const game = serverGames[gameIndex];
  const digits = game.digits;
  const finalWinNum = winningNumber 
    ? String(winningNumber).padStart(digits, '0')
    : computeServerWinningNumber(game, multiUserBets);

  // Update Game result
  game.result = finalWinNum;
  game.lastDrawTime = Date.now();
  
  // Format clean next period
  const prefix = game.period.includes('-') ? game.period.split('-')[0] + '-' : 'G-';
  const nextPeriodNum = (parseInt(game.period.replace(/\D/g, ''), 10) || 100) + 1;
  game.period = prefix + nextPeriodNum;

  // Settle all active multi-user bets
  let totalWonAmount = 0;
  const winners: any[] = [];

  multiUserBets = multiUserBets.map((bet) => {
    if (bet.gameId === gameId && bet.status === 'pending') {
      const isWinner = Array.isArray(bet.numbers) && bet.numbers.includes(finalWinNum);
      const payout = isWinner ? bet.amountPerNumber * (bet.payoutMultiplier || game.payoutMultiplier) : 0;
      if (isWinner) {
        totalWonAmount += payout;
        winners.push({
          userId: bet.userId,
          payout,
          winningNumber: finalWinNum,
        });
      }
      return {
        ...bet,
        status: isWinner ? 'won' : 'lost',
        winningNumber: finalWinNum,
        payoutWon: payout,
      };
    }
    return bet;
  });

  const drawRecord = {
    id: 'draw_' + Date.now(),
    gameId: game.id,
    gameName: game.name,
    period: game.period,
    winningNumber: finalWinNum,
    timestamp: Date.now(),
    totalWinners: winners.length,
    totalWonAmount,
  };

  globalDrawHistory.unshift(drawRecord);
  if (globalDrawHistory.length > 100) {
    globalDrawHistory = globalDrawHistory.slice(0, 100);
  }

  const now = new Date();
  const updatedDynamicGame = computeServerGameDynamicState(game, now);

  res.json({
    success: true,
    draw: drawRecord,
    updatedGame: updatedDynamicGame,
    winners,
  });
});

// API 5: Fetch Draw Results History
app.get('/api/draws', (req, res) => {
  res.json({
    draws: globalDrawHistory,
    latest: globalDrawHistory[0] || null,
  });
});

// API 6: Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Guaranteed SPA entry point in dev mode
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const templatePath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maza777 Real-time Lottery Server running on port ${PORT}`);
  });
}

startServer();
