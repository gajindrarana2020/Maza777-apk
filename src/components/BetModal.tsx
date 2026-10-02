import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShieldAlert, CheckCircle2, Flame, Dices, Clock, Tv, Film, Play, Zap, Info, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { AdsterraSmartlinkModal } from './AdsterraSmartlinkModal';

export const BetModal: React.FC = () => {
  const { betModalGame, closeBetModal, placeBets, user, showToast } = useApp();
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showAdsterraModal, setShowAdsterraModal] = useState<boolean>(false);

  // 10:1 Ratio: 1 Adsterra Smartlink Ad = 1 Number Bet with ₹10 fixed stake
  const FIXED_STAKE = 10;

  useEffect(() => {
    if (!betModalGame) {
      setSelectedNumber('');
      return;
    }

    // Auto-populate with a random lucky number so user can immediately play
    const maxVal = betModalGame.digits === 4 ? 10000 : 1000;
    const defaultLucky = String(Math.floor(Math.random() * maxVal)).padStart(betModalGame.digits, '0');
    setSelectedNumber(defaultLucky);

    const updateTime = () => {
      if (betModalGame.nextActionLabel) {
        setTimeLeft(betModalGame.nextActionLabel);
      } else {
        const elapsed = Date.now() - betModalGame.lastDrawTime;
        const remaining = Math.max(0, betModalGame.durationMs - elapsed);
        const hours = Math.floor(remaining / (3600 * 1000));
        const minutes = Math.floor((remaining % (3600 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
        setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [betModalGame]);

  if (!betModalGame) return null;

  const digits = betModalGame.digits;
  const multiplier = betModalGame.payoutMultiplier;
  const potentialWin = FIXED_STAKE * multiplier;
  // 100% Free Ads-Supported: 1 Rewarded Ad fulfills the ₹10 bet value (10:1 Ratio)
  const hasEnoughBalance = true;

  const handleQuickLucky = () => {
    sounds.playClick();
    const maxVal = digits === 4 ? 10000 : 1000;
    const randomNum = String(Math.floor(Math.random() * maxVal)).padStart(digits, '0');
    setSelectedNumber(randomNum);
  };

  const handleQuickPreset = (preset: string) => {
    sounds.playClick();
    const num = preset.padStart(digits, '0').slice(-digits);
    setSelectedNumber(num);
  };

  const handleNumberInput = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, digits);
    setSelectedNumber(cleaned);
  };

  /**
   * Integrated function that triggers Adsterra Smartlink Ad when user clicks 'Bet Now'
   * 20s required watch time with invalidation if user returns early (Works for Guest & Registered)
   */
  const triggerAdsterraRewardedBet = () => {
    if (!selectedNumber || selectedNumber.length !== digits) {
      showToast(`Please enter a valid ${digits}-digit number (e.g. ${digits === 3 ? '777 or 042' : '7777 or 0421'}) to play.`, 'error');
      return;
    }

    sounds.playClick();
    setShowAdsterraModal(true);
  };

  /**
   * Processes the bet in database ONLY after 20 seconds ad watch time is completed
   */
  const handleAdCompleted = () => {
    setShowAdsterraModal(false);
    // Process the bet with 10:1 ratio (1 ad = 1 bet of ₹10)
    placeBets(betModalGame.id, [selectedNumber], FIXED_STAKE);
  };

  const handleAdCancelled = () => {
    setShowAdsterraModal(false);
  };

  const popular3D = ['777', '888', '007', '123', '999', '555', '369', '100', '420', '312'];
  const popular4D = ['7777', '8888', '1234', '9999', '2026', '5555', '1111', '0000', '7860', '9876'];

  return (
    <div
      id="betModal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={closeBetModal}
    >
      <div
        id="betModal-container"
        className="bg-[#181920] border border-amber-500/40 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600/30 via-zinc-900 to-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {betModalGame.imageUrl ? (
              <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-amber-400/50 shadow-md relative bg-zinc-900">
                <img
                  src={betModalGame.imageUrl}
                  alt={betModalGame.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/85 text-[9px] font-black text-amber-300 text-center font-mono">
                  {betModalGame.digits}D
                </span>
              </div>
            ) : (
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-md"
                style={{ backgroundColor: betModalGame.iconColor }}
              >
                {betModalGame.digits}D
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">{betModalGame.name}</h3>
                <span className="bg-amber-400/20 text-amber-300 font-black text-[11px] px-2 py-0.5 rounded border border-amber-400/30">
                  {multiplier}x PAYOUT
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <span className="font-mono text-zinc-300">Period: {betModalGame.period}</span>
                <span>•</span>
                <span className="text-amber-400 font-mono flex items-center gap-1 font-bold">
                  <Clock className="w-3 h-3" /> {timeLeft || '4:00:00'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={closeBetModal}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Automatic 10:1 Ratio Stake Banner */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black text-sm shrink-0 shadow">
                ₹10
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-white">Automatic ₹10 Bet</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                    10:1 Ratio
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">1 Rewarded Ad = 1 Number Bet</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Potential Win</span>
              <div className="text-emerald-400 font-black text-sm">₹{potentialWin.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {/* Single Number Input */}
          <div className="bg-[#20222a] p-4 rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200">
                Type Your {digits}-Digit Number:
              </label>
              <span className="text-[11px] text-amber-400 font-mono font-semibold">
                Range: 000-{digits === 3 ? '999' : '9999'}
              </span>
            </div>

            <div className="flex gap-2">
              <input
                id="betNumberInput"
                type="text"
                maxLength={digits}
                value={selectedNumber}
                onChange={(e) => handleNumberInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && triggerAdsterraRewardedBet()}
                placeholder={digits === 3 ? 'e.g. 777' : 'e.g. 7777'}
                className="flex-1 bg-[#14151b] border-2 border-amber-500/40 focus:border-amber-400 rounded-2xl px-4 py-3 text-amber-300 font-mono text-2xl font-black text-center tracking-widest outline-none transition-colors shadow-inner"
              />
              <button
                type="button"
                onClick={handleQuickLucky}
                className="bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-bold px-3.5 py-3 rounded-2xl flex flex-col items-center justify-center text-[10px] gap-0.5 transition-all cursor-pointer active:scale-95 shrink-0"
                title="Pick Random Lucky Number"
              >
                <Dices className="w-5 h-5 text-purple-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Lucky</span>
              </button>
            </div>

            {/* Popular Numbers Quick Selection */}
            <div>
              <div className="text-[11px] text-zinc-400 font-medium mb-1.5 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Hot Pick Presets (Tap to select):
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(digits === 3 ? popular3D : popular4D).map((num) => {
                  const isCur = selectedNumber === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleQuickPreset(num)}
                      className={`px-2.5 py-1 text-xs font-mono font-black rounded-lg border transition-all cursor-pointer ${
                        isCur
                          ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md shadow-amber-400/30 scale-105'
                          : 'bg-[#15161c] hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Free Bet via Adsterra Smartlink Ad Banner */}
          <div className="bg-[#121319] border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div className="text-zinc-300 leading-tight">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>Adsterra Sponsored Free Bet</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                    20s Ad
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Adsterra smartlink ad 20 sec tak open rahega &rarr; ₹10 Free Bet automatic confirm hoga.
                </p>
              </div>
            </div>
          </div>

          {/* Balance Preview */}
          <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
            <span>Your Wallet Balance:</span>
            <span className={`font-mono font-bold ${hasEnoughBalance ? 'text-zinc-200' : 'text-red-400'}`}>
              ₹{(user?.balance || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#14151b] border-t border-zinc-800 flex gap-3">
          <button
            onClick={closeBetModal}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs sm:text-sm rounded-2xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="confirmBetBtn"
            onClick={triggerAdsterraRewardedBet}
            disabled={!selectedNumber || selectedNumber.length !== digits || !hasEnoughBalance}
            className={`flex-2 py-3.5 font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedNumber && selectedNumber.length === digits && hasEnoughBalance
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 shadow-lg shadow-amber-500/30 active:scale-95'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {selectedNumber && selectedNumber.length === digits
                ? `Watch 20s Ad & Bet (#${selectedNumber} • ₹10)`
                : `Enter ${digits} Digits to Bet`}
            </span>
          </button>
        </div>
      </div>

      {/* Adsterra Smartlink 20-Second Verification Modal */}
      <AdsterraSmartlinkModal
        isOpen={showAdsterraModal}
        gameName={betModalGame.name}
        gameDigits={betModalGame.digits}
        betNumber={selectedNumber}
        stake={FIXED_STAKE}
        potentialWin={potentialWin}
        onBetConfirmed={handleAdCompleted}
        onCancel={handleAdCancelled}
      />
    </div>
  );
};
