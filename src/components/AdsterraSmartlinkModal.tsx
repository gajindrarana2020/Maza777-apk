import React, { useState, useEffect, useRef } from 'react';
import { 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Flame,
  Tv,
  ArrowRight
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { 
  ADSTERRA_SMARTLINKS, 
  ADSTERRA_CONFIG, 
  getNextAdsterraSmartlink, 
  openAdsterraSmartlink, 
  AdsterraSmartlink 
} from '../services/adsterraSmartlinks';

interface AdsterraSmartlinkModalProps {
  isOpen: boolean;
  gameName: string;
  gameDigits: number;
  betNumber: string;
  stake: number;
  potentialWin: number;
  onBetConfirmed: () => void;
  onCancel: () => void;
}

export const AdsterraSmartlinkModal: React.FC<AdsterraSmartlinkModalProps> = ({
  isOpen,
  gameName,
  gameDigits,
  betNumber,
  stake,
  potentialWin,
  onBetConfirmed,
  onCancel,
}) => {
  const [currentSmartlink, setCurrentSmartlink] = useState<AdsterraSmartlink>(ADSTERRA_SMARTLINKS[0]);
  const [status, setStatus] = useState<'active' | 'invalid' | 'completed'>('active');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(ADSTERRA_CONFIG.MIN_REQUIRED_SECONDS);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [hasOpenedAd, setHasOpenedAd] = useState<boolean>(false);
  const [isProcessingBet, setIsProcessingBet] = useState<boolean>(false);

  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);
  const hasConfirmedRef = useRef<boolean>(false);
  const launchTimestampRef = useRef<number>(0);
  const hasLeftAppRef = useRef<boolean>(false);

  const triggerBetCompletion = () => {
    if (hasConfirmedRef.current) return;
    hasConfirmedRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('completed');
    setIsProcessingBet(true);
    sounds.playWin?.();

    setTimeout(() => {
      onBetConfirmed();
    }, 400);
  };

  // Called when user returns or focuses back onto the app
  const handleAppReturn = () => {
    if (!startTimeRef.current || hasConfirmedRef.current || status === 'completed') return;

    // Ignore immediate click jitter (< 600ms from launch)
    if (Date.now() - launchTimestampRef.current < 600) return;

    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setElapsedSeconds(elapsed);
    const remaining = Math.max(0, ADSTERRA_CONFIG.MIN_REQUIRED_SECONDS - elapsed);
    setSecondsRemaining(remaining);

    if (elapsed >= ADSTERRA_CONFIG.MIN_REQUIRED_SECONDS) {
      // 20s completed! Confirm the bet immediately!
      triggerBetCompletion();
    } else {
      // User returned before 20 seconds! SHOW RE-OPEN AD REMINDER!
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus('invalid');
      sounds.playLose?.();
    }
  };

  // Start / Reset Ad Verification Flow
  const launchAdVerification = (smartlinkToUse?: AdsterraSmartlink) => {
    hasConfirmedRef.current = false;
    hasLeftAppRef.current = false;
    const link = smartlinkToUse || getNextAdsterraSmartlink();
    setCurrentSmartlink(link);
    setStatus('active');
    setSecondsRemaining(ADSTERRA_CONFIG.MIN_REQUIRED_SECONDS);
    setElapsedSeconds(0);
    setIsProcessingBet(false);
    
    const now = Date.now();
    startTimeRef.current = now;
    launchTimestampRef.current = now;

    // Open Adsterra Smartlink
    openAdsterraSmartlink(link.url);
    setHasOpenedAd(true);
    sounds.playClick();

    // Clear old timer if any
    if (timerRef.current) clearInterval(timerRef.current);

    // 20-second active countdown interval
    timerRef.current = setInterval(() => {
      if (!startTimeRef.current || hasConfirmedRef.current) return;

      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);
      const remaining = Math.max(0, ADSTERRA_CONFIG.MIN_REQUIRED_SECONDS - elapsed);
      setSecondsRemaining(remaining);

      // If user stayed or 20s finished naturally
      if (remaining <= 0) {
        triggerBetCompletion();
      }
    }, 250);
  };

  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus('active');
      setHasOpenedAd(false);
      startTimeRef.current = null;
      hasConfirmedRef.current = false;
      return;
    }

    launchAdVerification();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleAppReturn();
      } else {
        hasLeftAppRef.current = true;
      }
    };

    const handleWindowFocus = () => {
      handleAppReturn();
    };

    const handleWindowBlur = () => {
      hasLeftAppRef.current = true;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReopenAd = () => {
    sounds.playClick();
    const nextLink = getNextAdsterraSmartlink();
    launchAdVerification(nextLink);
  };

  const handleManualOpenAd = () => {
    sounds.playClick();
    const nextLink = getNextAdsterraSmartlink();
    launchAdVerification(nextLink);
  };

  const percentProgress = Math.min(
    100,
    ((ADSTERRA_CONFIG.MIN_REQUIRED_SECONDS - secondsRemaining) / ADSTERRA_CONFIG.MIN_REQUIRED_SECONDS) * 100
  );

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-[#14151b] border-2 border-amber-500/50 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative text-white">
        {/* Glow Effects */}
        <div className="absolute -top-14 -right-14 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-14 -left-14 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-zinc-900 via-[#181a24] to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black text-sm shadow-md">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm text-white">Adsterra Smartlink Ad</h3>
                <span className="text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded font-mono">
                  20s Compulsory
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">1 Ad = 1 Free ₹10 Bet Entry</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onCancel();
            }}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cancel Bet"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bet Ticket Preview Summary */}
        <div className="p-4 bg-[#101116] border-b border-zinc-800/80">
          <div className="bg-[#181922] border border-zinc-700/60 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-zinc-950 font-black text-base flex items-center justify-center shadow">
                #{betNumber}
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-white">{gameName}</h4>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                  <span>Stake: <strong className="text-emerald-400 font-mono">₹{stake} (Free)</strong></span>
                  <span>•</span>
                  <span>Win: <strong className="text-amber-400 font-mono">₹{potentialWin.toLocaleString('en-IN')}</strong></span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">Placement</span>
              <span className="text-[11px] font-mono text-zinc-300 font-semibold">{currentSmartlink.name}</span>
            </div>
          </div>
        </div>

        {/* Dynamic State Display */}
        <div className="p-5 text-center space-y-4">
          {/* STATE 1: ACTIVE (Counting down 20s) */}
          {status === 'active' && (
            <div className="space-y-4">
              {/* Circular Progress & Countdown */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-zinc-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    className="stroke-amber-400 transition-all duration-300 ease-linear"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={264}
                    strokeDashoffset={264 - (264 * percentProgress) / 100}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white font-mono tracking-tight">
                    {secondsRemaining}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                    SECONDS
                  </span>
                </div>
              </div>

              {/* Status explanation */}
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Watching Adsterra Ad...</span>
                </h4>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Ad open rahega. 20 second poore hote hi aapka free bet automatic confirm ho jayega!
                </p>
              </div>

              {/* If user reached 0s, show direct confirm button */}
              {secondsRemaining <= 0 ? (
                <button
                  type="button"
                  onClick={triggerBetCompletion}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-zinc-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 animate-bounce cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>🎉 20s Verified! Confirm Bet Now</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleManualOpenAd}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer pt-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ad window open nahi hui? Click here</span>
                </button>
              )}
            </div>
          )}

          {/* STATE 2: INVALID (Returned before 20s - Re-open Ad Reminder Screen) */}
          {status === 'invalid' && (
            <div className="space-y-4 animate-shake">
              <div className="w-16 h-16 rounded-3xl bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center mx-auto text-red-400 shadow-xl shadow-red-500/20 animate-pulse">
                <AlertTriangle className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <div className="inline-block bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
                  ⚠️ 20s Se Pehle Return Aa Gaye!
                </div>
                <h4 className="text-xl font-black text-white">20 Second Pura Nahi Hua!</h4>
                <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-3.5 text-xs text-zinc-200 text-left space-y-2">
                  <p className="flex items-center gap-1.5 font-bold text-amber-300">
                    <span>⏱️ Watch Time:</span> 
                    <span className="font-mono bg-zinc-900 px-2 py-0.5 rounded text-white border border-zinc-700">
                      {elapsedSeconds}s / 20s
                    </span>
                  </p>
                  <p className="text-zinc-300">
                    Aap sirf <strong>{elapsedSeconds} second</strong> baad wapas aa gaye. Free Bet confirm karne ke liye ad ko <strong>poora 20 second</strong> tak open rakhna anivarya hai!
                  </p>
                </div>
              </div>

              {/* Prominent Re-open Ad Button */}
              <button
                type="button"
                onClick={handleReopenAd}
                className="w-full py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/40 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 border border-yellow-300 animate-pulse"
              >
                <RotateCcw className="w-5 h-5 stroke-[3]" />
                <span className="text-base tracking-wide">Re-Open Ad & Watch Full 20s</span>
              </button>
            </div>
          )}

          {/* STATE 3: COMPLETED (Full 20s watched) */}
          {status === 'completed' && (
            <div className="space-y-3.5 animate-scaleIn">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-block bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  ✅ 20s Verified!
                </div>
                <h4 className="text-lg font-black text-white">Bet Successfully Confirmed!</h4>
                <p className="text-xs text-zinc-300">
                  Aapka ₹10 ka Free Bet draw list me place kar diya gaya hai. Best of luck! 🎉
                </p>
              </div>

              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-400 animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0f1015] border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Adsterra High CPM Verified</span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onCancel();
            }}
            className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
