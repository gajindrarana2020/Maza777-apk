/**
 * Firebase Cloud Function for 100% Platform Profit Lottery Draws
 * 
 * You can deploy this Cloud Function in your Firebase project (functions/index.js or functions/src/index.ts).
 * It automatically aggregates all bets for a period, determines the unbet / lowest-wagered numbers,
 * and records the winning result to maximize house profitability.
 */

export const FIREBASE_CLOUD_FUNCTION_SOURCE_CODE = `
const functions = require("firebase-functions");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Scheduled or Callable Cloud Function to settle lottery draws with 100% platform profit.
 * Selects zero-bet numbers first (0 payout), or the lowest wagered number if all numbers are bet.
 */
exports.calculateAndSetLotteryResult = functions.https.onCall(async (data, context) => {
  const { gameId, profitMode = 'max_profit' } = data;

  if (!gameId) {
    throw new functions.https.HttpsError('invalid-argument', 'gameId is required');
  }

  const gameRef = db.collection('games').doc(gameId);
  const gameDoc = await gameRef.get();

  if (!gameDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Game not found');
  }

  const game = gameDoc.data();
  const digits = game.digits || 3;
  const maxLimit = digits === 4 ? 10000 : 1000;
  const currentPeriod = game.period;
  const multiplier = game.payoutMultiplier || (digits === 4 ? 9000 : 900);

  // 1. Query all pending bets for this game and period
  const betsSnapshot = await db.collection('bets')
    .where('gameId', '==', gameId)
    .where('period', '==', currentPeriod)
    .where('status', '==', 'pending')
    .get();

  const betVolumeMap = new Map();
  const liabilityMap = new Map();
  let totalWager = 0;

  betsSnapshot.forEach(doc => {
    const bet = doc.data();
    const numbers = bet.numbers || [];
    const amountPerNum = bet.amountPerNumber || 0;
    const payoutPerMatch = amountPerNum * multiplier;

    numbers.forEach(num => {
      const formattedNum = String(num).padStart(digits, '0');
      totalWager += amountPerNum;
      betVolumeMap.set(formattedNum, (betVolumeMap.get(formattedNum) || 0) + amountPerNum);
      liabilityMap.set(formattedNum, (liabilityMap.get(formattedNum) || 0) + payoutPerMatch);
    });
  });

  let winningNumber = '';
  let zeroBetCount = 0;
  let minLiability = 0;

  // 2. Algorithm Step A: Find numbers with ZERO bets (100% Platform Profit)
  const unbetNumbers = [];
  for (let i = 0; i < maxLimit; i++) {
    const candidate = String(i).padStart(digits, '0');
    if (!betVolumeMap.has(candidate) || betVolumeMap.get(candidate) <= 0) {
      unbetNumbers.push(candidate);
    }
  }

  zeroBetCount = unbetNumbers.length;

  if (unbetNumbers.length > 0) {
    // Randomly pick one unbet number from zero-bet pool
    winningNumber = unbetNumbers[Math.floor(Math.random() * unbetNumbers.length)];
    minLiability = 0;
  } else {
    // Algorithm Step B: Fallback if all numbers are bet on (Select Lowest Liability / Minimum Bet)
    let lowestLiab = Infinity;
    let candidates = [];

    for (let i = 0; i < maxLimit; i++) {
      const candidate = String(i).padStart(digits, '0');
      const liab = liabilityMap.get(candidate) || 0;
      if (liab < lowestLiab) {
        lowestLiab = liab;
        candidates = [candidate];
      } else if (liab === lowestLiab) {
        candidates.push(candidate);
      }
    }

    winningNumber = candidates[Math.floor(Math.random() * candidates.length)] || '000';
    minLiability = lowestLiab;
  }

  // 3. Settle Bets in Batch
  const batch = db.batch();
  const nextPeriod = String((parseInt(currentPeriod.replace(/\\D/g, ''), 10) || 1000) + 1);

  // Update Game Document
  batch.update(gameRef, {
    result: winningNumber,
    period: nextPeriod,
    lastDrawTime: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active',
    lastZeroBetCount: zeroBetCount,
    lastPayoutLiability: minLiability,
    lastTotalWager: totalWager
  });

  // Settle each bet
  betsSnapshot.forEach(doc => {
    const bet = doc.data();
    const hasMatched = (bet.numbers || []).includes(winningNumber);
    const payoutWon = hasMatched ? (bet.amountPerNumber || 0) * multiplier : 0;

    batch.update(doc.ref, {
      status: hasMatched ? 'won' : 'lost',
      winningNumber: winningNumber,
      payoutWon: payoutWon,
      settledAt: admin.firestore.FieldValue.serverTimestamp()
    });

    if (hasMatched && payoutWon > 0) {
      const userRef = db.collection('users').doc(bet.userId);
      batch.update(userRef, {
        balance: admin.firestore.FieldValue.increment(payoutWon)
      });
    }
  });

  await batch.commit();

  return {
    success: true,
    gameId,
    period: currentPeriod,
    winningNumber,
    zeroBetCount,
    payoutLiability: minLiability,
    totalWager,
    profitMargin: totalWager > 0 ? ((totalWager - minLiability) / totalWager) * 100 : 100
  };
});
`;
