import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  Users,
  Trophy,
  Award,
  ExternalLink,
  Send,
  HelpCircle,
  Coins,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Gift,
  Flame,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

type InviteTab = 'rules' | 'rewards' | 'referrals' | 'leaderboard';

export const InviteScreen: React.FC = () => {
  const { user, claimReferralEarnings, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<InviteTab>('rules');
  const [copied, setCopied] = useState(false);

  // Sub-filters for Rewards & Referrals tabs
  const [rewardsFilter, setRewardsFilter] = useState<'total' | 'today'>('total');
  const [referralsSubTab, setReferralsSubTab] = useState<'my' | 'friends'>('my');

  // Exact referral link requested by user: Maza777.free.je
  const referralCode = user?.referralCode || user?.id || 'MAZA777';
  const referralLink = `https://Maza777.free.je/?code=${referralCode}`;

  // Live real-time refer bonus ticker items (matching reference image)
  const tickerItems = [
    { name: 'sak***kru', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', amount: 250, type: 'winning commission' },
    { name: 'man***noj', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', amount: 500, type: 'winning commission' },
    { name: 'roh***it9', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', amount: 120, type: 'winning commission' },
    { name: 'pri***ya7', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80', amount: 950, type: 'winning commission' },
    { name: 'kin***g77', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', amount: 1800, type: 'winning commission' },
  ];
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [tickerItems.length]);

  const handleCopyLink = () => {
    sounds.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
    }
    setCopied(true);
    showToast('✅ Referral link copied! Share with friends to earn 10% on every win.', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    sounds.playClick();
    const text = encodeURIComponent(
      `🎰 Maza777 Free 3D & 4D Lottery App!\nPlay 100% free without deposit & win real cash!\nJoin with my referral link: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTelegram = () => {
    sounds.playClick();
    const text = encodeURIComponent(
      `🎰 Play Maza777 3D & 4D Lotteries Free! Real cash prizes without deposit: ${referralLink}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    sounds.playClick();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const handleNativeShare = async () => {
    sounds.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Maza777 Refer & Earn',
          text: `Join Maza777 with my code ${referralCode} and play free 3D/4D lotteries to win real cash!`,
          url: referralLink,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // User's real referred friends list (strictly Nill by default until user invites someone)
  const [myReferrals] = useState<{ uid: string; date: string; wonAmount: number; myComm: number; status: string }[]>(() => {
    try {
      const saved = localStorage.getItem('maza777_my_referrals');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Leaderboard data
  const leaderboardUsers = [
    { rank: 1, uid: 'M777-902188', name: 'Raja_Master777', count: 184, earnings: 48500 },
    { rank: 2, uid: 'M777-449102', name: 'LuckyKing_Kolkata', count: 142, earnings: 36200 },
    { rank: 3, uid: 'M777-710492', name: 'KeralaWinner_VIP', count: 119, earnings: 29800 },
    { rank: 4, uid: 'M777-381903', name: 'DelhiStriker', count: 86, earnings: 21400 },
    { rank: 5, uid: 'M777-620194', name: 'TurboPro_007', count: 72, earnings: 17800 },
    { rank: 6, uid: 'M777-109284', name: 'NagalandRider', count: 64, earnings: 15300 },
    { rank: 7, uid: 'M777-854721', name: 'DiamondPlayer', count: 53, earnings: 12900 },
    { rank: 8, uid: 'M777-294810', name: 'GoldenDhamaka', count: 47, earnings: 11200 },
  ];

  const claimableEarnings = user?.referralEarnings || 0;

  return (
    <div id="inviteScreen" className="max-w-md w-full mx-auto px-3 py-3.5 space-y-3.5 pb-24">
      {/* 3D Segmented Pod Tabs (Matching user reference image 1, 2, 3) */}
      <div className="relative pt-1">
        {/* Pod canopy background */}
        <div className="bg-gradient-to-b from-[#242836] via-[#1a1d26] to-[#121318] border-2 border-amber-500/40 rounded-2xl p-1.5 shadow-2xl shadow-amber-500/10">
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'leaderboard', label: 'LEADER BOARD' },
              { id: 'rules', label: 'REFER RULES' },
              { id: 'rewards', label: 'MY REWARDS' },
              { id: 'referrals', label: 'MY REFERRALS' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab(tab.id as InviteTab);
                  }}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isActive
                      ? 'bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-500 text-zinc-950 font-black shadow-lg shadow-amber-500/30 scale-[1.02] border border-yellow-200'
                      : 'bg-[#151720] hover:bg-[#1f222d] text-zinc-300 font-extrabold border border-zinc-800'
                  }`}
                >
                  <span className="text-[10px] sm:text-xs tracking-tight uppercase leading-tight">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: REFER RULES (IMG_20261001_193520.jpg)                   */}
      {/* ============================================================== */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Visual Hierarchy Pyramid Tree */}
          <div className="bg-gradient-to-b from-[#1a1d28] via-[#14161f] to-[#0e1017] border border-amber-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden text-center">
            {/* Background Pyramid Steppes Graphic */}
            <div className="absolute inset-0 opacity-15 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-16 h-8 bg-amber-400/40 rounded-t-lg" />
              <div className="w-32 h-8 bg-amber-400/30 rounded-t-lg" />
              <div className="w-48 h-8 bg-amber-400/20 rounded-t-lg" />
              <div className="w-64 h-8 bg-amber-400/10 rounded-t-lg" />
              <div className="w-80 h-10 bg-amber-400/5 rounded-t-lg" />
            </div>

            <h3 className="text-sm font-black text-amber-300 uppercase tracking-widest mb-4">
              Referral Hierarchy Network
            </h3>

            {/* Tree Nodes */}
            <div className="relative z-10 space-y-4 max-w-sm mx-auto">
              {/* Level 0: You */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 border-2 border-white shadow-xl shadow-amber-500/40 flex flex-col items-center justify-center text-zinc-950 font-black text-sm">
                  <span>You</span>
                </div>
              </div>

              {/* Connecting lines */}
              <div className="w-0.5 h-3 bg-amber-400/80 mx-auto" />
              <div className="w-40 h-0.5 bg-amber-400/80 mx-auto" />

              {/* Level A: A1, A2 */}
              <div className="flex justify-around px-8">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-white/80 shadow-md flex items-center justify-center text-zinc-950 font-black text-xs">
                  A1
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-white/80 shadow-md flex items-center justify-center text-zinc-950 font-black text-xs">
                  A2
                </div>
              </div>

              {/* Level B: B1 to B4 */}
              <div className="flex justify-between px-2">
                {['B1', 'B2', 'B3', 'B4'].map((b) => (
                  <div
                    key={b}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 border border-white/80 shadow-sm flex items-center justify-center text-white font-black text-[11px]"
                  >
                    {b}
                  </div>
                ))}
              </div>

              {/* Level C: C1 to C8 */}
              <div className="flex justify-between gap-1 overflow-x-auto pt-1">
                {['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'].map((c) => (
                  <div
                    key={c}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 border border-white/70 shadow-xs flex items-center justify-center text-white font-bold text-[9px] shrink-0"
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Level Details Boxes (A, B, C Levels) */}
          <div className="space-y-3">
            {/* Level A Card */}
            <div className="bg-[#181920] border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg transition-all">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-12 h-12 rounded-full bg-amber-400 text-zinc-950 font-black text-lg flex items-center justify-center shadow-md">
                  A
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400" />
                <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 font-black text-xs flex items-center justify-center">
                  You
                </div>
              </div>
              <div className="text-xs space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span><strong>₹0</strong> on registration (100% Free Ads model)</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-emerald-400 text-sm font-black">10.0% of his winning prize directly to your Cash</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>Direct friend who uses your referral link</span>
                </div>
              </div>
            </div>

            {/* Level B Card */}
            <div className="bg-[#181920] border border-red-500/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-500 text-white font-black text-lg flex items-center justify-center shadow-md">
                  B
                </div>
                <ArrowRight className="w-4 h-4 text-red-400" />
                <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 font-black text-xs flex items-center justify-center">
                  You
                </div>
              </div>
              <div className="text-xs space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-red-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <span><strong>3.0%</strong> of his winning prize to your Cash</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-zinc-500 shrink-0" />
                  <span>Friends invited by your Level A friends</span>
                </div>
              </div>
            </div>

            {/* Level C Card */}
            <div className="bg-[#181920] border border-sky-500/40 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-12 h-12 rounded-full bg-sky-500 text-white font-black text-lg flex items-center justify-center shadow-md">
                  C
                </div>
                <ArrowRight className="w-4 h-4 text-sky-400" />
                <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/50 font-black text-xs flex items-center justify-center">
                  You
                </div>
              </div>
              <div className="text-xs space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 text-sky-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                  <span><strong>1.0%</strong> of his winning prize to your Cash</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-zinc-500 shrink-0" />
                  <span>Friends invited by Level B network</span>
                </div>
              </div>
            </div>
          </div>

          {/* All Refer & Earn Bonus Live Ticker Bar (Image 1 Red Ribbon) */}
          <div className="bg-gradient-to-r from-red-950/60 via-[#181920] to-red-950/60 border-2 border-red-500/40 rounded-2xl p-3 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[10px] px-3 py-1 rounded-full uppercase shadow-md flex items-center gap-1">
                <Flame className="w-3 h-3 fill-current" />
                <span>All Refer & Earn Bonus</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Live Winners Feed</span>
            </div>

            <div className="flex items-center gap-3 bg-[#121318] p-2.5 rounded-xl border border-zinc-800">
              <img
                src={tickerItems[tickerIndex].avatar}
                alt="Winner"
                className="w-8 h-8 rounded-full border border-amber-400/50 object-cover shrink-0"
              />
              <p className="text-xs text-zinc-200 truncate">
                Received <strong className="text-emerald-400 font-mono font-black text-sm">₹{tickerItems[tickerIndex].amount} Cash</strong> from player{' '}
                <span className="text-amber-300 font-mono font-bold">{tickerItems[tickerIndex].name}</span> {tickerItems[tickerIndex].type}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MY REWARDS (IMG_20261001_193503.jpg)                    */}
      {/* ============================================================== */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          {/* Total vs Today Filter Pills */}
          <div className="flex items-center gap-2 bg-[#14161f] p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setRewardsFilter('total')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                rewardsFilter === 'total'
                  ? 'bg-amber-400 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Total
            </button>
            <button
              onClick={() => setRewardsFilter('today')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                rewardsFilter === 'today'
                  ? 'bg-amber-400 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Today
            </button>
          </div>

          {/* Golden Luxury Cushion Card (Image 2) */}
          <div className="bg-gradient-to-br from-[#242735] via-[#1a1c26] to-[#121318] border-2 border-amber-400/60 rounded-3xl p-5 shadow-2xl relative space-y-4">
            {/* Top 2 Pill Columns: Cash & Bonus */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#121318] border border-amber-500/40 rounded-2xl p-3.5 text-center shadow-inner">
                <span className="text-xs font-extrabold text-amber-300 uppercase block">Cash</span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1 block">
                  ₹{claimableEarnings.toFixed(2)}
                </span>
                <span className="text-[10px] text-zinc-400">10% Winning Commission</span>
              </div>

              <div className="bg-[#121318] border border-amber-500/40 rounded-2xl p-3.5 text-center shadow-inner">
                <span className="text-xs font-extrabold text-amber-300 uppercase block">Bonus</span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-1 block">
                  ₹0.00
                </span>
                <span className="text-[10px] text-zinc-400">100% Free Ads Model</span>
              </div>
            </div>

            {/* 4 Sub-stats row */}
            <div className="grid grid-cols-4 gap-1.5 bg-[#121318] p-2 rounded-xl border border-zinc-800 text-center">
              <div>
                <span className="text-[9px] text-zinc-400 block leading-tight">Welcome</span>
                <span className="text-xs font-bold text-white font-mono">₹0</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-400 block leading-tight">Friend Wins</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  ₹{(claimableEarnings * 10).toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-400 block leading-tight">Rate</span>
                <span className="text-xs font-bold text-amber-300 font-mono">10%</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-400 block leading-tight">Tax Bonus</span>
                <span className="text-xs font-bold text-white font-mono">₹0</span>
              </div>
            </div>

            {/* Current Bonus Gold Ribbon Banner */}
            <div className="bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border-2 border-amber-400 rounded-xl px-4 py-2 flex items-center justify-between shadow-md">
              <span className="font-extrabold text-xs text-amber-300 uppercase">
                Current Commission:
              </span>
              <span className="font-black text-xl font-mono text-white">
                ₹{claimableEarnings.toFixed(2)}
              </span>
            </div>

            {/* 3D Claim Button (Image 2 style) */}
            <button
              onClick={claimReferralEarnings}
              disabled={claimableEarnings <= 0}
              className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                claimableEarnings > 0
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 shadow-amber-500/30 active:scale-95'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
              }`}
            >
              <Gift className="w-5 h-5" />
              <span>Claim to Winnings Wallet</span>
            </button>
          </div>

          {/* Rewards History Table */}
          <div className="bg-[#181920] border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-4 bg-[#121318] px-3 py-2.5 text-[10px] font-black uppercase text-amber-400 border-b border-zinc-800 text-center">
              <span>Date</span>
              <span>Total Cash</span>
              <span>Total Bonus</span>
              <span>Details</span>
            </div>

            {claimableEarnings > 0 ? (
              <div className="divide-y divide-zinc-800 text-xs text-center">
                <div className="grid grid-cols-4 px-3 py-3 items-center">
                  <span className="text-zinc-400 font-mono text-[11px]">Today</span>
                  <span className="text-emerald-400 font-mono font-bold">₹{claimableEarnings.toFixed(2)}</span>
                  <span className="text-zinc-500 font-mono">₹0.00</span>
                  <span className="text-amber-300 text-[11px] font-semibold">10% Win Comm</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
                  <Gift className="w-6 h-6" />
                </div>
                <p className="text-xs text-zinc-400">
                  No rewards claimed yet. Invite friends using your link to earn 10% commission on every winning lottery draw!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: MY REFERRALS (IMG_20261001_193446.jpg)                 */}
      {/* ============================================================== */}
      {activeTab === 'referrals' && (
        <div className="space-y-4">
          {/* Sub-pills: My Referrals vs Friends Referrals */}
          <div className="flex items-center gap-2 bg-[#14161f] p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setReferralsSubTab('my')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                referralsSubTab === 'my'
                  ? 'bg-amber-400 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              My Referrals
            </button>
            <button
              onClick={() => setReferralsSubTab('friends')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                referralsSubTab === 'friends'
                  ? 'bg-amber-400 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Friends Referrals
            </button>
          </div>

          {/* 2 Golden Framed Stat Boxes (Image 3) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#181920] border-2 border-amber-400/60 rounded-2xl p-4 text-center shadow-lg">
              <span className="text-xs font-extrabold text-amber-300 uppercase block">Total Referrals</span>
              <span className="text-3xl font-black font-mono text-white mt-1 block">
                {user?.totalReferrals || myReferrals.length || 0}
              </span>
              <span className="text-[10px] text-zinc-400">All Direct Refers</span>
            </div>

            <div className="bg-[#181920] border-2 border-amber-400/60 rounded-2xl p-4 text-center shadow-lg">
              <span className="text-xs font-extrabold text-amber-300 uppercase block">Today Referrals</span>
              <span className="text-3xl font-black font-mono text-emerald-400 mt-1 block">
                0
              </span>
              <span className="text-[10px] text-zinc-400">Joined in 24h</span>
            </div>
          </div>

          {/* Referrals Table (Image 3) */}
          <div className="bg-[#181920] border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="grid grid-cols-5 bg-[#121318] px-3 py-2.5 text-[10px] font-black uppercase text-amber-400 border-b border-zinc-800 text-center">
              <span>UID</span>
              <span>Refer Date</span>
              <span>Total Cash</span>
              <span>Total Bonus</span>
              <span>Details</span>
            </div>

            {myReferrals.length > 0 ? (
              <div className="divide-y divide-zinc-800 text-xs text-center">
                {myReferrals.map((r, i) => (
                  <div key={i} className="grid grid-cols-5 px-3 py-3 items-center">
                    <span className="font-mono text-amber-300 font-bold text-[11px] truncate">{r.uid}</span>
                    <span className="text-zinc-400 font-mono text-[10px]">{r.date}</span>
                    <span className="text-emerald-400 font-mono font-bold">₹{r.myComm.toFixed(2)}</span>
                    <span className="text-zinc-500 font-mono">₹0.00</span>
                    <span className="text-sky-400 text-[10px] font-bold">{r.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-zinc-800/80 border border-zinc-700 mx-auto flex items-center justify-center text-zinc-500">
                  <Users className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-zinc-300">Nill (No Referrals Yet)</p>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                    Aapne abhi tak kisi ko invite nahi kiya hai. Jab aap kisi ko invite karenge aur wo register karega to wo yahan show hoga.
                  </p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-zinc-950 font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md shadow-amber-500/20"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Maza777.free.je Link</span>
                </button>
              </div>
            )}

            {/* Pagination controls (Image 3 << 1/1 >>) */}
            <div className="flex items-center justify-center gap-4 py-2.5 bg-[#121318] border-t border-zinc-800 text-xs text-amber-400 font-bold">
              <button className="text-zinc-500 hover:text-white cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono">1 / 1</span>
              <button className="text-zinc-500 hover:text-white cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: LEADER BOARD                                            */}
      {/* ============================================================== */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500/20 via-[#181920] to-purple-600/20 border border-amber-500/40 rounded-2xl p-4 text-center space-y-1">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto animate-bounce" />
            <h4 className="font-black text-white text-base">Top Referral Champions</h4>
            <p className="text-xs text-zinc-400">Highest commission earners of the month</p>
          </div>

          <div className="bg-[#181920] border border-zinc-800 rounded-2xl overflow-hidden shadow-lg divide-y divide-zinc-800">
            {leaderboardUsers.map((lb) => {
              const isTop3 = lb.rank <= 3;
              return (
                <div
                  key={lb.rank}
                  className={`p-3 sm:p-3.5 flex items-center justify-between text-xs transition-colors ${
                    lb.rank === 1
                      ? 'bg-amber-500/10'
                      : lb.rank === 2
                      ? 'bg-zinc-700/10'
                      : lb.rank === 3
                      ? 'bg-amber-800/10'
                      : 'hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        lb.rank === 1
                          ? 'bg-amber-400 text-zinc-950 shadow-md'
                          : lb.rank === 2
                          ? 'bg-zinc-300 text-zinc-950'
                          : lb.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-zinc-800 text-zinc-400 font-mono'
                      }`}
                    >
                      {lb.rank === 1 ? '🥇' : lb.rank === 2 ? '🥈' : lb.rank === 3 ? '🥉' : lb.rank}
                    </div>

                    <div className="min-w-0">
                      <span className="font-extrabold text-white text-sm block truncate">{lb.name}</span>
                      <span className="text-zinc-500 font-mono text-[10px]">
                        UID: {lb.uid} • {lb.count} Friends
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">10% Earnings</span>
                    <span className="text-sm sm:text-base font-black font-mono text-emerald-400">
                      ₹{lb.earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BOTTOM STICKY SHARE BAR (Present in all 3 reference images)     */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-b from-[#1b1e2a] to-[#12131a] border-2 border-amber-500/40 rounded-3xl p-4 shadow-2xl space-y-3">
        <h4 className="text-xs font-black text-amber-300 text-center uppercase tracking-wide">
          Share your referral link & start earning
        </h4>

        {/* Link Input Bar with Copy Icon */}
        <div className="relative flex items-center">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-[#0d0f15] border-2 border-amber-400/60 rounded-2xl pl-3.5 pr-12 py-3 text-xs sm:text-sm font-mono text-white outline-none select-all shadow-inner"
          />
          <button
            onClick={handleCopyLink}
            className="absolute right-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-zinc-950 p-2 rounded-xl transition-all cursor-pointer active:scale-95 shadow-md"
            title="Copy Referral Link"
          >
            {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
          </button>
        </div>

        {/* 4 Social Share Icon Buttons (WhatsApp, Telegram, Facebook, Native) */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {/* WhatsApp */}
          <button
            onClick={handleShareWhatsApp}
            className="py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            title="Share on WhatsApp"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
          </button>

          {/* Telegram */}
          <button
            onClick={handleShareTelegram}
            className="py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 active:scale-95 transition-all cursor-pointer"
            title="Share on Telegram"
          >
            <Send className="w-5 h-5 fill-current" />
          </button>

          {/* Facebook */}
          <button
            onClick={handleShareFacebook}
            className="py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
            title="Share on Facebook"
          >
            <span className="font-black text-xl font-serif">f</span>
          </button>

          {/* Native Share */}
          <button
            onClick={handleNativeShare}
            className="py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            title="Share Link"
          >
            <Share2 className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Feedback Link */}
        <div className="text-center pt-1 text-[11px] text-zinc-400">
          <span>Referral link not working? </span>
          <a
            href="https://t.me/maza777com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
          >
            Feedback Now
          </a>
        </div>
      </div>
    </div>
  );
};
