import { Game, UserBet } from '../types';

export interface NumberLiability {
  number: string;
  volume: number;
  betCount: number;
  liability: number;
}

export interface PeriodRiskAnalysis {
  gameId: string;
  period: string;
  digits: 3 | 4;
  totalBets: number;
  totalWagerAmount: number;
  betNumbersCount: number;
  zeroBetPoolCount: number;
  lowestWageredNumbers: NumberLiability[];
  highestWageredNumbers: NumberLiability[];
  projectedWinningNumber: string;
  projectedPayoutLiability: number;
  profitMarginPercent: number;
}

/**
 * Strict Platform Profit & Unbet Number Selection Rule:
 * 1. Checks for numbers with ZERO bets (jis number par kisi user ne bet nahi kiya ho).
 *    Result ALWAYS selected from this zero-bet pool.
 * 2. If user bet on all numbers (zero-bet pool empty):
 *    Selects the number with the MINIMUM total bet / lowest payout (kam se kam bet kiya hua number).
 * 3. If no bets were placed at all in this draw period:
 *    Generates random number from full range.
 */
export function calculateOptimalWinningNumber(
  game: Game,
  allBets: UserBet[],
  mode: 'max_profit' | 'lowest_liability' | 'random' = 'max_profit'
): { winningNumber: string; zeroBetCount: number; minLiability: number; totalWager: number } {
  const digits = game.digits;
  const maxLimit = digits === 4 ? 10000 : 1000;
  const currentPeriod = game.period;

  // Filter active pending bets for this specific game & period
  const activeBets = allBets.filter(
    (b) => b.gameId === game.id && b.period === currentPeriod && b.status === 'pending'
  );

  let totalWager = 0;
  const betVolumeMap = new Map<string, number>();
  const liabilityMap = new Map<string, number>();
  const betCountMap = new Map<string, number>();

  for (const bet of activeBets) {
    for (const num of bet.numbers) {
      const formattedNum = num.trim().padStart(digits, '0');
      const wagerAmt = bet.amountPerNumber || 0;
      const payoutAmt = wagerAmt * (bet.payoutMultiplier || game.payoutMultiplier);

      totalWager += wagerAmt;
      betVolumeMap.set(formattedNum, (betVolumeMap.get(formattedNum) || 0) + wagerAmt);
      liabilityMap.set(formattedNum, (liabilityMap.get(formattedNum) || 0) + payoutAmt);
      betCountMap.set(formattedNum, (betCountMap.get(formattedNum) || 0) + 1);
    }
  }

  // If no bets were placed in this period at all, any random number is valid
  if (activeBets.length === 0 || betVolumeMap.size === 0) {
    const randomNum = String(Math.floor(Math.random() * maxLimit)).padStart(digits, '0');
    return {
      winningNumber: randomNum,
      zeroBetCount: maxLimit,
      minLiability: 0,
      totalWager: 0,
    };
  }

  // --- RULE 1: JIS NUMBER PAR KOI BHI BET NAHI HUA HO, WAHI RESULT AAYEGA ---
  const unbetNumbers: string[] = [];
  for (let i = 0; i < maxLimit; i++) {
    const candidate = String(i).padStart(digits, '0');
    if (!betVolumeMap.has(candidate) || (betVolumeMap.get(candidate) || 0) <= 0) {
      unbetNumbers.push(candidate);
    }
  }

  if (unbetNumbers.length > 0) {
    // Pick randomly from the pool of unbet (zero-bet) numbers so NO user wins
    const selected = unbetNumbers[Math.floor(Math.random() * unbetNumbers.length)];
    return {
      winningNumber: selected,
      zeroBetCount: unbetNumbers.length,
      minLiability: 0,
      totalWager,
    };
  }

  // --- RULE 2: AGAR ALL NUMBERS PAR BET HUA HO, TOH KAM SE KAM BET KIYA HUA NUMBER RESULT BANTA HAI ---
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

  const winningNumber = minCandidates[Math.floor(Math.random() * minCandidates.length)] || '000';
  const minLiab = liabilityMap.get(winningNumber) || 0;

  return {
    winningNumber,
    zeroBetCount: 0,
    minLiability: minLiab,
    totalWager,
  };
}

/**
 * Produces real-time risk breakdown for admin inspection
 */
export function analyzePeriodRisk(game: Game, allBets: UserBet[]): PeriodRiskAnalysis {
  const digits = game.digits;
  const maxLimit = digits === 4 ? 10000 : 1000;
  const currentPeriod = game.period;

  const activeBets = allBets.filter(
    (b) => b.gameId === game.id && b.period === currentPeriod && b.status === 'pending'
  );

  let totalWager = 0;
  const betVolumeMap = new Map<string, { volume: number; betCount: number; liability: number }>();

  for (const bet of activeBets) {
    for (const num of bet.numbers) {
      const formattedNum = num.trim().padStart(digits, '0');
      const wagerAmt = bet.amountPerNumber || 0;
      const payoutAmt = wagerAmt * (bet.payoutMultiplier || game.payoutMultiplier);

      totalWager += wagerAmt;
      const existing = betVolumeMap.get(formattedNum) || { volume: 0, betCount: 0, liability: 0 };
      betVolumeMap.set(formattedNum, {
        volume: existing.volume + wagerAmt,
        betCount: existing.betCount + 1,
        liability: existing.liability + payoutAmt,
      });
    }
  }

  const betEntries: NumberLiability[] = Array.from(betVolumeMap.entries()).map(([num, data]) => ({
    number: num,
    volume: data.volume,
    betCount: data.betCount,
    liability: data.liability,
  }));

  // Sort by volume
  betEntries.sort((a, b) => b.volume - a.volume);
  const highestWageredNumbers = betEntries.slice(0, 5);

  const lowestWageredSorted = [...betEntries].sort((a, b) => a.volume - b.volume);
  const lowestWageredNumbers = lowestWageredSorted.slice(0, 5);

  const optimal = calculateOptimalWinningNumber(game, allBets, 'max_profit');
  const zeroBetPoolCount = maxLimit - betVolumeMap.size;
  const profitMarginPercent = totalWager > 0 ? ((totalWager - optimal.minLiability) / totalWager) * 100 : 100;

  return {
    gameId: game.id,
    period: currentPeriod,
    digits,
    totalBets: activeBets.length,
    totalWagerAmount: totalWager,
    betNumbersCount: betVolumeMap.size,
    zeroBetPoolCount,
    lowestWageredNumbers,
    highestWageredNumbers,
    projectedWinningNumber: optimal.winningNumber,
    projectedPayoutLiability: optimal.minLiability,
    profitMarginPercent: Math.max(0, profitMarginPercent),
  };
}
