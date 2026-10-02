import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, ShieldCheck, Zap, Volume2, Trophy, Flame, Smartphone } from 'lucide-react';
import { UNITY_ADS_CONFIG, unityAds } from '../services/unityAds';
import { sounds } from '../utils/audio';

export const UnityBannerAd: React.FC = () => {
  const [creativeIndex, setCreativeIndex] = useState(0);

  const bannerCreatives = [
    {
      id: 'cr-1',
      title: 'Royal Crown 3D Jackpots',
      subtitle: 'Win up to 90x instantly! 100% Free Daily Scheduled Draws.',
      cta: 'Play Now Free',
      accent: 'from-amber-500/25 via-[#1a1728] to-purple-600/25',
      border: 'border-amber-500/40 hover:border-amber-400',
      badge: 'SPONSORED AD',
      badgeColor: 'bg-amber-400 text-zinc-950',
      icon: Trophy,
      iconBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      rating: '4.9 ★',
    },
    {
      id: 'cr-2',
      title: 'Super 777 Turbo Spinner VIP',
      subtitle: 'Instant Payouts via UPI & Bank IMPS. 24/7 Verified Support.',
      cta: 'Explore VIP Club',
      accent: 'from-purple-600/25 via-[#181924] to-indigo-600/25',
      border: 'border-purple-500/40 hover:border-purple-400',
      badge: 'FEATURED APP',
      badgeColor: 'bg-purple-400 text-zinc-950',
      icon: Flame,
      iconBg: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
      rating: '5.0 ★',
    },
    {
      id: 'cr-3',
      title: 'Kerala & Kolkata Turbo 4D',
      subtitle: 'Synchronized live result draws every 4 hours. Play & Win!',
      cta: 'Claim Bonus',
      accent: 'from-emerald-600/25 via-[#141b18] to-teal-600/25',
      border: 'border-emerald-500/40 hover:border-emerald-400',
      badge: 'TRENDING #1',
      badgeColor: 'bg-emerald-400 text-zinc-950',
      icon: Zap,
      iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      rating: '4.8 ★',
    },
  ];

  useEffect(() => {
    // Notify Unity Ads service to load Banner_Android
    unityAds.loadBannerAd();

    // Auto rotate creatives every 9 seconds
    const interval = setInterval(() => {
      setCreativeIndex((prev) => (prev + 1) % bannerCreatives.length);
    }, 9000);

    return () => {
      clearInterval(interval);
      unityAds.hideBannerAd();
    };
  }, []);

  const current = bannerCreatives[creativeIndex];
  const IconComponent = current.icon;

  const handleBannerClick = () => {
    sounds.playClick();
    console.log(`[UnityAds Banner] Clicked: Game ID ${UNITY_ADS_CONFIG.GAME_ID}, Placement: ${UNITY_ADS_CONFIG.BANNER_PLACEMENT_ID}`);
  };

  return (
    <div
      id="unity-banner-ad-container"
      data-game-id={UNITY_ADS_CONFIG.GAME_ID}
      data-placement-id={UNITY_ADS_CONFIG.BANNER_PLACEMENT_ID}
      onClick={handleBannerClick}
      className={`w-full bg-gradient-to-r ${current.accent} bg-[#121318] border ${current.border} rounded-2xl p-3 sm:p-4 shadow-xl relative overflow-hidden transition-all duration-500 cursor-pointer group`}
    >
      {/* Top Sponsored Identification Bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded font-mono shadow-sm ${current.badgeColor}`}>
            {current.badge}
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">
            Sponsored Partner
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span className="font-mono text-emerald-400 font-bold">Verified</span>
        </div>
      </div>

      {/* Main Banner Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl ${current.iconBg} border flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
            <IconComponent className="w-6 h-6 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-white text-sm sm:text-base truncate group-hover:text-amber-300 transition-colors">
                {current.title}
              </h4>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded font-bold">
                {current.rating}
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-medium mt-0.5 line-clamp-1">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
          <button
            type="button"
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-zinc-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 group-hover:shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap"
          >
            <span>{current.cta}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress ticker dots for rotation */}
      <div className="flex items-center justify-center gap-1 mt-2.5 pt-2 border-t border-zinc-800/60">
        {bannerCreatives.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded-full transition-all duration-300 ${
              idx === creativeIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-zinc-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
