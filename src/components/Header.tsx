import React, { useRef } from 'react';
import { Volume2, VolumeX, Send, Clock, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getAppConfig } from '../config/appConfig';

export const Header: React.FC = () => {
  const { user, toggleAudioMute, isMuted, navigateTo, showToast, serverTimeStr } = useApp();
  const config = getAppConfig();

  // Secret 10-tap logo gesture to open admin gateway
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<any>(null);

  const handleLogoClick = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 10) {
      tapCountRef.current = 0;
      showToast('🛡️ Admin Portal Activated! Please enter Admin credentials.', 'success');
      navigateTo('admin');
      return;
    }

    if (tapCountRef.current >= 6) {
      showToast(`🛡️ Tap ${10 - tapCountRef.current} more times for Admin Portal`, 'info');
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 3500);

    navigateTo('home');
  };

  return (
    <header id="maza-header" className="sticky top-0 z-40 bg-[#15161A]/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
        {/* Brand Logo (Secret 10-Tap Gateway for Admin) */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-2 cursor-pointer group select-none"
          id="brand-logo-btn"
          title={config.appName}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400/60 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform bg-[#121212]">
            <img src="/maza777_logo.png" alt="Maza 777 Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                {config.appName}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 font-bold uppercase rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                VIP {user?.vipLevel || 1}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium tracking-wide flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              <span className="font-mono text-emerald-400 font-bold">{serverTimeStr || 'Real-time'}</span>
              <span className="text-zinc-500">•</span>
              <span>Live Multiplayer</span>
            </p>
          </div>
        </div>

        {/* Right Action: Real-time Winnings Wallet + APK + Audio */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            /* Winnings Wallet Pill (Clicking navigates to Withdraw) */
            <div 
              id="header-wallet-pill"
              onClick={() => navigateTo('withdraw')}
              className="bg-[#1e2026] hover:bg-[#252830] border border-amber-500/30 hover:border-amber-400/60 rounded-xl px-2.5 sm:px-3 py-1.5 flex items-center gap-2 cursor-pointer transition-all shadow-inner group"
              title="Your Winnings Balance - Click to Withdraw"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 font-black text-xs group-hover:scale-110 transition-transform">
                {config.currencySymbol || '₹'}
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase text-zinc-400 font-bold block leading-none">
                  Winnings
                </span>
                <span className="text-emerald-400 font-extrabold text-sm tracking-tight font-mono">
                  {config.currencySymbol || '₹'}{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ) : null}

          {/* Telegram Support Link Button */}
          <a
            id="header-support-btn"
            href={config.telegramSupportUrl || 'https://t.me/maza777com'}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-sky-600/30 to-blue-700/30 hover:from-sky-600/50 hover:to-blue-700/50 border border-sky-500/40 text-sky-300 font-bold text-xs px-2.5 sm:px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            title={`24/7 Support on Telegram: ${config.telegramUsername}`}
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xs:inline sm:inline">Support</span>
          </a>

          {/* Sound Mute Toggle */}
          <button
            id="header-sound-btn"
            onClick={toggleAudioMute}
            className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 flex items-center justify-center transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
