import React from 'react';
import { ShieldCheck, X, AlertTriangle, Tv, CheckCircle2, DollarSign, Award } from 'lucide-react';
import { sounds } from '../utils/audio';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  const handleAcceptAndClose = () => {
    sounds.playClick();
    if (onAccept) {
      onAccept();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#16171d] border border-amber-500/40 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-[#1b1c24]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Terms & Gambling Policy</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-black uppercase">
                  18+ ONLY
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Ads-Based Free Entertainment Platform</p>
            </div>
          </div>
          <button
            onClick={() => { sounds.playClick(); onClose(); }}
            className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with Scrollable Rules */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-zinc-300 leading-relaxed">
          {/* Highlight Key Takeaway Box */}
          <div className="bg-gradient-to-r from-amber-500/15 via-[#181920] to-emerald-500/15 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <Tv className="w-4 h-4 text-amber-400 shrink-0" />
              <span>100% Free Ads-Based Platform — Zero Payment Required</span>
            </div>
            <p className="text-[11px] text-zinc-300">
              यह प्लेटफॉर्म पूरी तरह से <strong className="text-amber-300">Ads-Supported (विज्ञापन आधारित)</strong> है। किसी भी यूजर को कोई भी असली पैसे या पेमेंट जमा (Deposit / Add Money) करने की आवश्यकता <strong>नहीं</strong> है।
            </p>
          </div>

          {/* Rule Section 1: 18+ Age Restriction */}
          <div className="space-y-1.5 bg-[#121318] p-3.5 rounded-2xl border border-zinc-800/90">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>1. Strict 18+ Age Requirement (18+ आयु सीमा)</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              You must be at least 18 years of age or the age of legal majority in your jurisdiction to register, log in, or participate in any lottery and number draw games on this platform. Persons under 18 years are strictly prohibited.
            </p>
          </div>

          {/* Rule Section 2: Zero Payment & Ads Model */}
          <div className="space-y-1.5 bg-[#121318] p-3.5 rounded-2xl border border-zinc-800/90">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <DollarSign className="w-4 h-4 shrink-0" />
              <span>2. No Real-Money Deposit Needed (कोई शुल्क नहीं)</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              MAZA777 operates on a free-to-play advertisement monetization model. All game balances, bonus coins, and test credits are sponsored through ad impressions and engagement. You are never obligated to add real money to participate.
            </p>
          </div>

          {/* Rule Section 3: Gambling Rules & Number Draws */}
          <div className="space-y-1.5 bg-[#121318] p-3.5 rounded-2xl border border-zinc-800/90">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Award className="w-4 h-4 shrink-0" />
              <span>3. Simulated Gaming & Lottery Draw Rules</span>
            </div>
            <ul className="list-disc list-inside text-zinc-400 text-[11px] space-y-1 pl-1">
              <li>All 3D and 4D lottery draws are executed based on algorithmic and scheduled draw cycles.</li>
              <li>Virtual credits earned from bonuses or ads can be utilized for number selections and interactive entertainment.</li>
              <li>Game results and multiplier payouts are determined by system draw algorithms.</li>
            </ul>
          </div>

          {/* Rule Section 4: Responsible Gaming */}
          <div className="space-y-1.5 bg-[#121318] p-3.5 rounded-2xl border border-zinc-800/90">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>4. Responsible Gaming & Fair Play</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              This platform is designed for recreational fun. Multiple accounts, automated bots, or fraudulent exploits of the ads/bonus system are strictly prohibited and will lead to account suspension.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-[#14151b] flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>By proceeding, you certify that you are 18+</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleAcceptAndClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              I Understand & Agree (18+)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
