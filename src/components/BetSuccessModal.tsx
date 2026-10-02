import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  Trophy, 
  Clock, 
  Sparkles, 
  Inbox, 
  FileText, 
  X, 
  ShieldCheck, 
  Flame,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';

export interface BetSuccessData {
  gameName: string;
  period: string;
  numbers: string[];
  stake: number;
  potentialWin: number;
  timestamp: number;
}

interface BetSuccessModalProps {
  data: BetSuccessData | null;
  onClose: () => void;
  onViewRecords: () => void;
  onViewInbox: () => void;
}

export const BetSuccessModal: React.FC<BetSuccessModalProps> = ({
  data,
  onClose,
  onViewRecords,
  onViewInbox,
}) => {
  useEffect(() => {
    if (!data) return;

    sounds.playWin();

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'],
      });
    } catch {
      // Ignore
    }
  }, [data]);

  if (!data) return null;

  return (
    <div 
      className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none"
      onClick={onClose}
    >
      <div 
        className="bg-[#14161f] border-2 border-emerald-500/60 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative text-white animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/60 via-[#181a24] to-zinc-900 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Verified Ad Completion
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Icon & Headline */}
        <div className="p-6 text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12 animate-bounce" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs">
              <Sparkles className="w-3.5 h-3.5" /> 20s Ad Watched Successfully!
            </div>
            <h3 className="text-2xl font-black text-white tracking-wide">
              YOUR BET IS SUCCESSFUL!
            </h3>
            <p className="text-xs text-zinc-300 font-medium">
              Aapka bet lottery draw me confirm ho gaya hai! 🎉
            </p>
          </div>

          {/* Ticket Information Card */}
          <div className="bg-[#191b26] border border-zinc-800 rounded-2xl p-4 text-left space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <div>
                <span className="text-[11px] text-zinc-400 block">Lottery Name</span>
                <span className="text-base font-black text-amber-400">{data.gameName}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-zinc-400 block">Draw Number</span>
                <span className="text-sm font-mono font-bold text-zinc-200">#{data.period}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
              <div>
                <span className="text-[11px] text-zinc-400 block">Selected Pick</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {data.numbers.map((n, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-zinc-950 font-black font-mono text-sm shadow"
                    >
                      #{n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-zinc-400 block">Stake Value</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  ₹{data.stake} (Free via Ad)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-xs text-zinc-300 font-bold flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-400" /> Potential Payout:
              </span>
              <span className="text-lg font-black text-amber-300 font-mono">
                ₹{data.potentialWin.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* 24-Hour Inbox Auto-Delete Notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2.5 text-left text-xs text-amber-200">
            <Inbox className="w-5 h-5 shrink-0 text-amber-400" />
            <p className="leading-snug">
              Confirmation message aapke <strong>Inbox</strong> me bhej diya gaya hai. 
              <span className="block text-[11px] text-amber-300/80 font-mono mt-0.5">
                ⏱️ Notice: Messages 24 ghante me automatically delete ho jate hain.
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onClose();
                  onViewRecords();
                }}
                className="py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Bet Record</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onClose();
                  onViewInbox();
                }}
                className="py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
              >
                <Inbox className="w-4 h-4 text-emerald-400" />
                <span>Inbox Messages</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-zinc-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Play Next Lottery</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
