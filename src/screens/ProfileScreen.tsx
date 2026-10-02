import React, { useState } from 'react';
import {
  User,
  Edit3,
  Share2,
  FileText,
  Landmark,
  LogOut,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Wallet,
  HelpCircle,
  Send,
  ExternalLink,
  Receipt,
  Clock,
  KeyRound,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { TermsModal } from '../components/TermsModal';

export const ProfileScreen: React.FC = () => {
  const { user, navigateTo, logout, bets, withdrawals, openBankModal, saveUserCredentials, showToast } = useApp();
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Profile Credentials Form State
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [passInput, setPassInput] = useState('');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const isCredentialsUpdated = Boolean(
    user?.isCredentialsUpdated ||
    (user?.email && user.email.includes('@') && user.email !== '') ||
    (user?.id && localStorage.getItem(`maza777_creds_updated_${user.id}`) === 'true')
  );

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      showToast('Please enter a valid Gmail / Email address', 'error');
      return;
    }
    if (!passInput || passInput.length < 4) {
      showToast('Password must be at least 4 characters', 'error');
      return;
    }

    setIsSaving(true);
    sounds.playClick();
    const success = await saveUserCredentials(emailInput, passInput, phoneInput);
    setIsSaving(false);
    if (success) {
      showToast('✅ Updated successfully!', 'success');
    }
  };

  const totalBetsCount = bets.length;
  const totalWonAmount = bets
    .filter((b) => b.status === 'won')
    .reduce((acc, b) => acc + (b.payoutWon || 0), 0);

  const pendingWithdrawalCount = withdrawals.filter((w) => w.status === 'pending' || w.status === 'processing').length;

  const menuItems = [
    {
      id: 'telegramSupport',
      label: '24/7 Telegram Customer Support',
      desc: 'Instant direct support: @maza777com',
      icon: Send,
      badge: '24/7 Live',
      isExternal: true,
      action: () => {
        sounds.playClick();
        window.open('https://t.me/maza777com', '_blank');
      },
    },
    {
      id: 'withdrawNow',
      label: 'Withdraw Winnings (Bank / UPI)',
      desc: 'Request payout to your Bank Account or UPI ID',
      icon: Wallet,
      badge: 'Payouts',
      action: () => navigateTo('withdraw'),
    },
    {
      id: 'withdrawRecord',
      label: 'Withdrawal Record',
      desc: 'Check live status: Pending, Processing, and Success payouts',
      icon: Receipt,
      badge: pendingWithdrawalCount > 0 ? `${pendingWithdrawalCount} In Queue` : withdrawals.length > 0 ? `${withdrawals.length} Records` : undefined,
      badgeColor: pendingWithdrawalCount > 0 ? 'bg-amber-400 text-zinc-950 animate-pulse' : undefined,
      action: () => navigateTo('withdrawRecord'),
    },
    {
      id: 'profileEdit',
      label: 'Profile Edit',
      desc: 'Change display name, WhatsApp & social handles',
      icon: Edit3,
      action: () => navigateTo('profileEdit'),
    },
    {
      id: 'invite',
      label: 'Invite Friends & Earn',
      desc: 'Share your referral link for commission rewards',
      icon: Share2,
      badge: '₹500 Bonus',
      action: () => navigateTo('invite'),
    },
    {
      id: 'betRecord',
      label: 'Bet Record & Reports',
      desc: 'View comprehensive game tickets & draw summaries',
      icon: FileText,
      action: () => navigateTo('betRecord'),
    },
    {
      id: 'terms',
      label: 'Terms, 18+ & Gambling Policy',
      desc: '100% Free Ads-Based Model & Platform Rules',
      icon: ShieldCheck,
      badge: '18+ Free',
      action: () => {
        sounds.playClick();
        setIsTermsOpen(true);
      },
    },
  ];

  return (
    <div id="profileScreen" className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Profile Card Header */}
      <div className="bg-gradient-to-br from-[#20222b] to-[#15161c] border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-[#16171d] rounded-[14px] flex items-center justify-center font-black text-2xl text-amber-400">
              {user?.displayName?.charAt(0) || 'M'}
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white truncate">{user?.displayName || user?.username}</h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                VIP {user?.vipLevel || 1}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              User ID (Guest ID): <span id="userId" className="text-amber-300 font-bold">{user?.id}</span>
            </p>
            {user?.email && (
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="truncate">{user.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-800 text-center">
          <div className="bg-[#14151b] p-2.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Winnings</span>
            <span className="text-emerald-400 font-extrabold font-mono text-sm">
              ₹{(user?.balance || 0).toFixed(2)}
            </span>
          </div>
          <div className="bg-[#14151b] p-2.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Bets</span>
            <span className="text-white font-extrabold font-mono text-sm">{totalBetsCount}</span>
          </div>
          <div className="bg-[#14151b] p-2.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Won</span>
            <span className="text-amber-400 font-extrabold font-mono text-sm">
              ₹{totalWonAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Professional Credentials Section */}
      <div className="bg-[#15161c] border border-zinc-800/90 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <form onSubmit={handleSaveCredentials} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email / Gmail Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email / Gmail</span>
                </span>
                {isCredentialsUpdated && (
                  <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                )}
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  required
                  disabled={isCredentialsUpdated}
                  value={isCredentialsUpdated ? (user?.email || emailInput) : emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@gmail.com"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none transition-all ${
                    isCredentialsUpdated
                      ? 'bg-[#0f1014] border border-zinc-800/80 text-zinc-300 font-mono cursor-not-allowed select-none'
                      : 'bg-[#1a1c24] border border-zinc-700/80 focus:border-amber-400 focus:bg-[#1f212b] text-white shadow-inner'
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password</span>
                </span>
                {isCredentialsUpdated && (
                  <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Locked
                  </span>
                )}
              </label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  required
                  disabled={isCredentialsUpdated}
                  value={isCredentialsUpdated ? '••••••••••••' : passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  placeholder="Set password (min 4 chars)"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none transition-all ${
                    isCredentialsUpdated
                      ? 'bg-[#0f1014] border border-zinc-800/80 text-zinc-400 tracking-widest cursor-not-allowed select-none'
                      : 'bg-[#1a1c24] border border-zinc-700/80 focus:border-amber-400 focus:bg-[#1f212b] text-white shadow-inner'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Under Email / Password: Only show "Update" button if not filled; once updated, show NO button */}
          {!isCredentialsUpdated ? (
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 mt-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{isSaving ? 'Updating...' : 'Update'}</span>
            </button>
          ) : null}
        </form>
      </div>

      {/* Action Buttons list */}
      <div className="bg-[#181920] border border-zinc-800 rounded-2xl p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full p-3 rounded-xl hover:bg-zinc-800/60 flex items-center justify-between text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  item.id === 'telegramSupport'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 group-hover:scale-105'
                    : 'bg-zinc-800 group-hover:bg-amber-500/20 group-hover:text-amber-400 text-zinc-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm transition-colors ${
                      item.id === 'telegramSupport' ? 'text-sky-300 group-hover:text-sky-200' : 'text-white group-hover:text-amber-300'
                    }`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                        item.badgeColor || (item.id === 'telegramSupport' ? 'bg-sky-400 text-zinc-950' : 'bg-amber-400 text-zinc-950')
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">{item.desc}</p>
                </div>
              </div>
              {item.isExternal ? (
                <ExternalLink className="w-4 h-4 text-sky-400 group-hover:text-sky-300 transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
              )}
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full py-3 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" /> Logout Account
      </button>

      {/* Terms & Gambling Policy Modal */}
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
};
