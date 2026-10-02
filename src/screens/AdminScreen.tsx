import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Landmark,
  Copy,
  Check,
  Search,
  DollarSign,
  TrendingUp,
  Users,
  Dices,
  RefreshCw,
  Sparkles,
  AlertCircle,
  FileText,
  Send,
  Smartphone,
  PlusCircle,
  MinusCircle,
  LogOut,
  Sliders,
  Settings,
  Code2,
  Download,
  Terminal,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useApp, ADMIN_AUTH_CONFIG } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { FIREBASE_CLOUD_FUNCTION_SOURCE_CODE } from '../utils/firebaseCloudFunctions';
import { getAppConfig, saveAppConfig, resetAppConfig, AppConfig } from '../config/appConfig';

export const AdminScreen: React.FC = () => {
  const {
    user,
    games,
    bets,
    withdrawals,
    isAdminLoggedIn,
    adminLogin,
    adminLogout,
    processWithdrawal,
    approveWithdrawal,
    rejectWithdrawal,
    adminAdjustBalance,
    adminSetGameResult,
    triggerManualDraw,
    profitMode,
    setProfitMode,
    analyzeGameRisk,
    navigateTo,
    showToast,
  } = useApp();

  // Login Form States
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Admin Navigation Tabs
  const [adminTab, setAdminTab] = useState<'withdrawals' | 'games' | 'users' | 'bets' | 'stats' | 'appSettings'>('withdrawals');

  // App Customizer & Embed State
  const [configState, setConfigState] = useState<AppConfig>(() => getAppConfig());
  const [selectedSnippetTab, setSelectedSnippetTab] = useState<'capacitor' | 'java' | 'gradle' | 'manifest' | 'flutter' | 'reactnative'>('capacitor');

  // Withdrawal Filter & Search
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'processing' | 'approved' | 'rejected'>('pending');
  const [withdrawalSearch, setWithdrawalSearch] = useState('');

  // Per-withdrawal inline transfer states (UTR & Note)
  const [utrInputs, setUtrInputs] = useState<{ [key: string]: string }>({});
  const [noteInputs, setNoteInputs] = useState<{ [key: string]: string }>({});
  const [rejectReasonInputs, setRejectReasonInputs] = useState<{ [key: string]: string }>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Expanded risk inspection per game
  const [expandedRiskGameId, setExpandedRiskGameId] = useState<string | null>(null);

  // Copied feedback states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Game Result Overrides
  const [gameCustomNumbers, setGameCustomNumbers] = useState<{ [key: string]: string }>({});
  const [gameSearch, setGameSearch] = useState('');

  // User Balance Adjustment
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');

  const handleCopy = (text: string, key: string) => {
    sounds.playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied: ${text}`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = adminLogin(adminIdInput, adminPassInput);
    if (success) {
      setAdminIdInput('');
      setAdminPassInput('');
    }
  };

  const fillQuickCredentials = () => {
    sounds.playClick();
    setAdminIdInput(ADMIN_AUTH_CONFIG.DEFAULT_ID);
    setAdminPassInput(ADMIN_AUTH_CONFIG.DEFAULT_PASS);
    showToast('Credentials filled. Click Sign In.', 'info');
  };

  // Financial Calculations
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const processingWithdrawals = withdrawals.filter((w) => w.status === 'processing');
  const approvedWithdrawals = withdrawals.filter((w) => w.status === 'approved');
  const rejectedWithdrawals = withdrawals.filter((w) => w.status === 'rejected');

  const totalPendingAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalProcessingAmount = processingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalApprovedAmount = approvedWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalBetVolume = bets.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalWonPayouts = bets.filter((b) => b.status === 'won').reduce((sum, b) => sum + (b.payoutWon || 0), 0);

  // Filtered withdrawals list
  const filteredWithdrawals = withdrawals.filter((w) => {
    if (withdrawalFilter !== 'all' && w.status !== withdrawalFilter) return false;
    if (withdrawalSearch.trim()) {
      const q = withdrawalSearch.toLowerCase();
      const matchName = (w.userName || '').toLowerCase().includes(q);
      const matchRef = w.referenceId.toLowerCase().includes(q);
      const matchBank = w.bankName.toLowerCase().includes(q);
      const matchAcc = w.accountNumber.includes(q);
      const matchIfsc = (w.ifscCode || '').toLowerCase().includes(q);
      return matchName || matchRef || matchBank || matchAcc || matchIfsc;
    }
    return true;
  });

  // Filtered games list
  const filteredGames = games.filter((g) => {
    if (gameSearch.trim()) {
      return g.name.toLowerCase().includes(gameSearch.toLowerCase()) || g.period.includes(gameSearch);
    }
    return true;
  });

  // --- 1. ADMIN LOGIN GATE (WHEN LOGGED OUT) ---
  const currentOrigin = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?admin=true` : '?admin=true';

  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 mx-auto shadow-xl shadow-amber-500/20">
            <div className="w-full h-full bg-[#14151b] rounded-[14px] flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Admin & Finance Portal</h2>
          <p className="text-xs text-zinc-400">
            Encrypted master access for withdrawal approval, payout transfer, and platform controls.
          </p>
        </div>

        {/* Private Direct Link Banner */}
        <div className="bg-[#14151b] border border-amber-500/30 rounded-2xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-amber-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Direct Admin Link (Hidden from App):</span>
            </span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-black">
              SECRET URL
            </span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Normal players cannot see any Admin buttons in the app. Use and bookmark this secret link to access:
          </p>
          <div className="flex items-center gap-2 bg-[#101115] border border-zinc-800 rounded-xl p-2 font-mono text-[11px] text-amber-300">
            <span className="truncate flex-1">{currentOrigin}</span>
            <button
              type="button"
              onClick={() => handleCopy(currentOrigin, 'admin_direct_link_login')}
              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-lg font-bold text-[10px] flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
            >
              {copiedKey === 'admin_direct_link_login' ? (
                <>
                  <Check className="w-3 h-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleAdminAuthSubmit} className="bg-[#181920] border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 text-xs text-amber-400 font-bold">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Authorized Management Only</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Admin Identifier / User ID</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="text"
                value={adminIdInput}
                onChange={(e) => setAdminIdInput(e.target.value)}
                placeholder="e.g. maza777_superadmin"
                className="w-full bg-[#121318] border border-zinc-700 focus:border-amber-400 rounded-xl pl-10 pr-3 py-2.5 text-white font-mono text-sm outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Security Master Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-[#121318] border border-zinc-700 focus:border-amber-400 rounded-xl pl-10 pr-10 py-2.5 text-white font-mono text-sm outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Sign In to Admin Panel
          </button>

          {/* Quick Credential Helper */}
          <div className="pt-3 border-t border-zinc-800 space-y-2">
            <div className="bg-[#121318] p-2.5 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1 font-mono">
              <div className="text-amber-400 font-bold flex items-center justify-between">
                <span>Default Secure Credentials:</span>
                <button
                  type="button"
                  onClick={fillQuickCredentials}
                  className="text-[10px] bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
                >
                  ⚡ Auto-Fill
                </button>
              </div>
              <p>ID: <span className="text-zinc-200">{ADMIN_AUTH_CONFIG.DEFAULT_ID}</span></p>
              <p>Pass: <span className="text-zinc-200">{ADMIN_AUTH_CONFIG.DEFAULT_PASS}</span></p>
            </div>
          </div>
        </form>

        <button
          onClick={() => navigateTo('home')}
          className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Player App
        </button>
      </div>
    );
  }

  // --- 2. ADMIN DASHBOARD (LOGGED IN) ---
  return (
    <div id="adminPanelScreen" className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Top Admin Status Header */}
      <div className="bg-gradient-to-br from-[#20222c] to-[#14151b] border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">MAZA777 Admin Control</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <span>🔥 Firebase Cloud</span>
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Logged in as: <span className="text-amber-400 font-bold">{ADMIN_AUTH_CONFIG.DEFAULT_ID}</span> • <span className="text-zinc-500">Users & Withdrawals saved in Firebase Cloud</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('home')}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Player View
            </button>
            <button
              onClick={adminLogout}
              className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout Admin
            </button>
          </div>
        </div>

        {/* Private Direct Admin Link Pill */}
        <div className="mt-3.5 pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-[#121318]/90 p-2.5 rounded-xl border border-amber-500/20 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-amber-300">Your Private Admin Link:</span>
            <span className="font-mono text-zinc-400 text-[11px] truncate max-w-xs hidden sm:inline">{currentOrigin}</span>
          </div>
          <button
            onClick={() => handleCopy(currentOrigin, 'admin_direct_link_dash')}
            className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
          >
            {copiedKey === 'admin_direct_link_dash' ? (
              <>
                <Check className="w-3 h-3" /> Link Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copy Admin Link
              </>
            )}
          </button>
        </div>

        {/* Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-zinc-800 text-center">
          <div className="bg-[#121318] p-2.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> Pending Payouts
            </span>
            <div className="text-amber-400 font-mono font-black text-base sm:text-lg mt-0.5">
              ₹{totalPendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-400">{pendingWithdrawals.length} Requests Pending</span>
          </div>

          <div className="bg-[#121318] p-2.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Paid Payouts
            </span>
            <div className="text-emerald-400 font-mono font-black text-base sm:text-lg mt-0.5">
              ₹{totalApprovedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-400">{approvedWithdrawals.length} Settled</span>
          </div>

          <div className="bg-[#121318] p-2.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-blue-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" /> Betting Volume
            </span>
            <div className="text-blue-400 font-mono font-black text-base sm:text-lg mt-0.5">
              ₹{totalBetVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-400">{bets.length} Total Tickets</span>
          </div>

          <div className="bg-[#121318] p-2.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center justify-center gap-1">
              <Users className="w-3 h-3" /> User Balances
            </span>
            <div className="text-purple-400 font-mono font-black text-base sm:text-lg mt-0.5">
              ₹{(user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-400">Live Active User</span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 bg-[#14151b] p-1.5 rounded-2xl border border-zinc-800">
        <button
          onClick={() => {
            sounds.playClick();
            setAdminTab('withdrawals');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            adminTab === 'withdrawals'
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Withdrawals</span>
          {pendingWithdrawals.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              adminTab === 'withdrawals' ? 'bg-zinc-950 text-amber-400' : 'bg-red-500 text-white'
            }`}>
              {pendingWithdrawals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setAdminTab('games');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            adminTab === 'games'
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Dices className="w-3.5 h-3.5" />
          <span>Lottery Control</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setAdminTab('users');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            adminTab === 'users'
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Wallets</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setAdminTab('bets');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            adminTab === 'bets'
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Betting Audit</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setAdminTab('stats');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            adminTab === 'stats'
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>P&L Report</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setAdminTab('appSettings');
          }}
          className={`py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            adminTab === 'appSettings'
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-amber-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>App / APK Setup</span>
        </button>
      </div>

      {/* --- TAB 1: WITHDRAWALS MANAGEMENT (CRITICAL USER REQUEST) --- */}
      {adminTab === 'withdrawals' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-[#181920] border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'pending', label: 'Pending', count: pendingWithdrawals.length, color: 'text-amber-400' },
                  { id: 'processing', label: 'Processing', count: processingWithdrawals.length, color: 'text-sky-400' },
                  { id: 'approved', label: 'Approved', count: approvedWithdrawals.length, color: 'text-emerald-400' },
                  { id: 'rejected', label: 'Rejected', count: rejectedWithdrawals.length, color: 'text-red-400' },
                  { id: 'all', label: 'All Records', count: withdrawals.length, color: 'text-zinc-300' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sounds.playClick();
                      setWithdrawalFilter(tab.id as any);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      withdrawalFilter === tab.id
                        ? 'bg-zinc-800 text-white border border-amber-400/50 shadow-sm'
                        : 'bg-[#121318] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-zinc-900 ${tab.color}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                <input
                  type="text"
                  value={withdrawalSearch}
                  onChange={(e) => setWithdrawalSearch(e.target.value)}
                  placeholder="Search user, ref, bank..."
                  className="w-full bg-[#121318] border border-zinc-700 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Withdrawals List */}
          {filteredWithdrawals.length === 0 ? (
            <div className="bg-[#181920] border border-zinc-800 rounded-2xl p-8 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
              <h4 className="font-bold text-white text-sm">No {withdrawalFilter} withdrawals found</h4>
              <p className="text-xs text-zinc-400">All user payout requests have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWithdrawals.map((item) => {
                const isPending = item.status === 'pending';
                const isProcessing = item.status === 'processing';
                const isActionable = isPending || isProcessing;
                const currentUtr = utrInputs[item.id] || '';
                const currentNote = noteInputs[item.id] || '';
                const currentRejectReason = rejectReasonInputs[item.id] || '';
                const isRejectOpen = rejectingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-[#181920] border rounded-2xl p-4 sm:p-5 space-y-3 transition-all ${
                      isPending
                        ? 'border-amber-500/50 shadow-lg shadow-amber-500/5'
                        : isProcessing
                        ? 'border-sky-500/50 shadow-lg shadow-sky-500/5 bg-[#141824]'
                        : item.status === 'approved'
                        ? 'border-emerald-500/30'
                        : 'border-red-500/30'
                    }`}
                  >
                    {/* Top Row: User details & Amount */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-base">{item.userName || 'Player'}</span>
                          <span className="text-xs text-zinc-400 font-mono">({item.userId})</span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              item.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : isProcessing
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse'
                                : item.status === 'rejected'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            }`}
                          >
                            {isPending
                              ? '⏳ PENDING REVIEW'
                              : isProcessing
                              ? '🔄 PROCESSING IN BANK QUEUE'
                              : item.status === 'approved'
                              ? '✅ TRANSFERRED (SUCCESS)'
                              : '❌ REJECTED & REFUNDED'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">
                          Ref: <span className="text-zinc-300 font-bold">{item.referenceId}</span> •{' '}
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>

                      {/* Prominent Amount */}
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Withdrawal Amount</span>
                        <span className="text-2xl font-black font-mono text-amber-400">
                          ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Bank or UPI Details Card (Highlighted for Admin transfer) */}
                    {item.type === 'upi' || item.upiId || item.bankName === 'UPI Direct' ? (
                      <div className="bg-[#121318] border border-purple-500/30 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Payment Mode</span>
                          <span className="font-bold text-purple-300 flex items-center gap-1.5 mt-0.5">
                            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                            UPI Instant Transfer
                          </span>
                          {item.realName && (
                            <span className="text-[11px] text-zinc-400 block mt-0.5">Name: {item.realName}</span>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <span className="text-zinc-500 block text-[10px] uppercase font-semibold">UPI ID (VPA)</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-bold text-amber-300 text-sm bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                              {item.upiId || item.accountNumber}
                            </span>
                            <button
                              onClick={() => handleCopy(item.upiId || item.accountNumber, `upi_${item.id}`)}
                              className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Copy UPI ID"
                            >
                              {copiedKey === `upi_${item.id}` ? (
                                <>
                                  <Check className="w-3 h-3" /> Copied UPI
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" /> Copy UPI
                                </>
                              )}
                            </button>
                          </div>
                          {item.userPhone && (
                            <span className="text-[10px] text-zinc-500 font-mono block mt-1">
                              Phone: {item.userPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#121318] border border-zinc-800 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Bank Name</span>
                          <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                            <Landmark className="w-3.5 h-3.5 text-amber-400" />
                            {item.bankName}
                          </span>
                          {item.realName && (
                            <span className="text-[11px] text-zinc-400 block mt-0.5">A/C Holder: {item.realName}</span>
                          )}
                        </div>

                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Account Number</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-bold text-white bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                              {item.accountNumber}
                            </span>
                            <button
                              onClick={() => handleCopy(item.accountNumber, `acc_${item.id}`)}
                              className="text-zinc-400 hover:text-amber-400 p-1"
                              title="Copy Account Number"
                            >
                              {copiedKey === `acc_${item.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-zinc-500 block text-[10px] uppercase font-semibold">IFSC Code</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-bold text-amber-300 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {item.ifscCode || 'SBIN0004921'}
                            </span>
                            <button
                              onClick={() => handleCopy(item.ifscCode || 'SBIN0004921', `ifsc_${item.id}`)}
                              className="text-zinc-400 hover:text-amber-400 p-1"
                              title="Copy IFSC Code"
                            >
                              {copiedKey === `ifsc_${item.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pending & Processing Action Controls for Admin */}
                    {isActionable && (
                      <div className="pt-2 border-t border-zinc-800 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                              IMPS / UTR Transaction Ref (Optional / Auto)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. UTR982347192834"
                              value={currentUtr}
                              onChange={(e) => setUtrInputs({ ...utrInputs, [item.id]: e.target.value })}
                              className="w-full bg-[#121318] border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                              Admin Note / Payout Memo
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Transferred via HDFC Corporate IMPS"
                              value={currentNote}
                              onChange={(e) => setNoteInputs({ ...noteInputs, [item.id]: e.target.value })}
                              className="w-full bg-[#121318] border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                            />
                          </div>
                        </div>

                        {/* Rejection Form Dropdown */}
                        {isRejectOpen && (
                          <div className="bg-red-950/30 border border-red-500/40 rounded-xl p-3 space-y-2">
                            <label className="text-xs font-bold text-red-300 block">
                              Reason for Rejection (Amount will be refunded to user):
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Incorrect IFSC code, Name mismatch in bank"
                              value={currentRejectReason}
                              onChange={(e) => setRejectReasonInputs({ ...rejectReasonInputs, [item.id]: e.target.value })}
                              className="w-full bg-[#121318] border border-red-700/60 focus:border-red-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setRejectingId(null)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  rejectWithdrawal(item.id, currentRejectReason);
                                  setRejectingId(null);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                              >
                                Confirm Rejection & Refund
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {!isRejectOpen && (
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div>
                              {isPending && (
                                <button
                                  onClick={() => processWithdrawal(item.id)}
                                  className="px-3.5 py-2 rounded-xl bg-sky-950/70 hover:bg-sky-900 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                                  <span>Move to Processing</span>
                                </button>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => setRejectingId(item.id)}
                                className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                              >
                                <XCircle className="w-4 h-4" /> Reject & Refund
                              </button>

                              <button
                                onClick={() => approveWithdrawal(item.id, currentUtr, currentNote)}
                                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-zinc-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5 cursor-pointer transition-all"
                              >
                                <CheckCircle2 className="w-4 h-4" /> Transfer Sent & Mark Successful
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Settled Details (Approved / Rejected) */}
                    {!isActionable && (
                      <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-2">
                        {item.utrNumber && (
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-zinc-500">UTR / Ref:</span>
                            <span className="text-emerald-400 font-bold">{item.utrNumber}</span>
                          </div>
                        )}
                        {item.adminNote && (
                          <div className="text-zinc-300">
                            <span className="text-zinc-500">Note: </span>
                            <span>{item.adminNote}</span>
                          </div>
                        )}
                        {item.processedAt && (
                          <div className="text-zinc-500 text-[11px]">
                            Processed: {new Date(item.processedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: LOTTERY RESULTS & 100% PROFIT ENGINE --- */}
      {adminTab === 'games' && (
        <div className="space-y-4">
          {/* Algorithm Strategy Banner */}
          <div className="bg-gradient-to-r from-amber-500/15 via-[#181920] to-emerald-500/15 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm flex items-center gap-2">
                    <span>100% Platform Profit Result Algorithm</span>
                    <span className="text-[10px] bg-emerald-500 text-zinc-950 px-2 py-0.5 rounded-full font-black uppercase">
                      ACTIVE
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Automatic winning number selection based on zero-bet numbers and lowest bet volume.
                  </p>
                </div>
              </div>

              {/* Profit Mode Selector */}
              <div className="flex items-center gap-1.5 bg-[#121318] p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setProfitMode('max_profit')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    profitMode === 'max_profit'
                      ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🛡️ 100% Zero-Bet Profit
                </button>
                <button
                  onClick={() => setProfitMode('lowest_liability')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    profitMode === 'lowest_liability'
                      ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  ⚖️ Lowest Liability
                </button>
                <button
                  onClick={() => setProfitMode('random')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    profitMode === 'random'
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🎲 Random
                </button>
              </div>
            </div>

            <div className="bg-[#121318]/90 border border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-300 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>How the Automated Profit Engine Operates:</span>
              </div>
              <ul className="list-disc list-inside text-zinc-400 space-y-0.5 pl-1">
                <li>
                  <strong className="text-zinc-200">Rule 1 (Zero-Bet Numbers):</strong> If players did not place bets on all numbers, the draw automatically chooses an unbet number from the zero-bet pool (<span className="text-emerald-400 font-bold">₹0.00 Payout / 100% Platform Profit</span>).
                </li>
                <li>
                  <strong className="text-zinc-200">Rule 2 (Lowest Bet Volume):</strong> If players covered all numbers, the draw automatically calculates and selects the number with the lowest wagered amount (<span className="text-amber-400 font-bold">Minimum Payout Liability</span>).
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-[#181920] border border-zinc-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-extrabold text-white text-sm">4-Hour Lottery Draws & Result Manager</h4>
              <p className="text-xs text-zinc-400">Monitor active wager pools, live unbet numbers & trigger automated draws</p>
            </div>
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                value={gameSearch}
                onChange={(e) => setGameSearch(e.target.value)}
                placeholder="Search lottery..."
                className="w-full bg-[#121318] border border-zinc-700 focus:border-amber-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredGames.map((g) => {
              const customVal = gameCustomNumbers[g.id] || '';
              const risk = analyzeGameRisk(g.id);
              const isExpanded = expandedRiskGameId === g.id;
              const totalPossible = g.digits === 4 ? 10000 : 1000;

              return (
                <div key={g.id} className="bg-[#181920] border border-zinc-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{g.name}</span>
                        <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                          {g.digits}D ({g.payoutMultiplier}x)
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">
                        Period: <span className="text-zinc-200 font-bold">{g.period}</span> • Last Result:{' '}
                        <span className="text-amber-400 font-bold">{g.result}</span>
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <span className="text-zinc-500 block text-[10px]">Active Bets Pool</span>
                      <span className="font-mono font-bold text-amber-400">
                        ₹{(risk?.totalWagerAmount || 0).toFixed(2)} ({risk?.totalBets || 0} bets)
                      </span>
                    </div>
                  </div>

                  {/* Auto Calculated Outcome Stats */}
                  <div className="bg-[#121318] p-3 rounded-xl border border-zinc-800/90 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Zero-Bet Numbers</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {risk ? `${risk.zeroBetPoolCount} / ${totalPossible}` : `${totalPossible} / ${totalPossible}`}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {risk && risk.zeroBetPoolCount > 0 ? '100% Platform Profit Pool' : 'Covered Pool'}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Projected Auto Result</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-black text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 text-sm">
                          {risk?.projectedWinningNumber || '000'}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          ₹{risk?.projectedPayoutLiability.toFixed(2) || '0.00'} liab
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action: Draw with Auto Profit Result */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => triggerManualDraw(g.id)}
                      className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-zinc-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Draw with Auto Profit Number ({risk?.projectedWinningNumber || 'Auto'})</span>
                    </button>

                    <button
                      onClick={() => setExpandedRiskGameId(isExpanded ? null : g.id)}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                      title="View bet breakdown"
                    >
                      {isExpanded ? 'Hide Stats' : 'Stats'}
                    </button>
                  </div>

                  {/* Expandable Heatmap & Bet Number Breakdown */}
                  {isExpanded && risk && (
                    <div className="bg-[#14151b] p-3 rounded-xl border border-zinc-800 space-y-2 text-xs animate-fadeIn">
                      <div className="flex justify-between items-center text-[11px] font-bold text-zinc-300">
                        <span>Highest Bet Numbers (Risk to Avoid):</span>
                        <span className="text-zinc-500">{risk.betNumbersCount} total numbers wagered</span>
                      </div>

                      {risk.highestWageredNumbers.length > 0 ? (
                        <div className="space-y-1 font-mono">
                          {risk.highestWageredNumbers.map((item) => (
                            <div key={item.number} className="flex justify-between items-center bg-[#181920] px-2.5 py-1 rounded border border-zinc-800 text-[11px]">
                              <span className="font-bold text-amber-400">Number {item.number}</span>
                              <span className="text-zinc-400">₹{item.volume.toFixed(2)} staked ({item.betCount}x)</span>
                              <span className="text-red-400 font-bold">Payout: ₹{item.liability.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-zinc-500 text-center py-2 text-[11px]">
                          No bets placed on this round yet. All {totalPossible} numbers have ₹0 wagered.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Admin Custom Number Override Form */}
                  <div className="bg-[#121318] p-2.5 rounded-xl border border-zinc-800 space-y-2">
                    <div className="text-[11px] font-bold text-zinc-400">Manual Override Result (Optional):</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={g.digits}
                        placeholder={`Enter ${g.digits} digits (e.g. ${g.digits === 3 ? '777' : '9842'})`}
                        value={customVal}
                        onChange={(e) => setGameCustomNumbers({ ...gameCustomNumbers, [g.id]: e.target.value })}
                        className="flex-1 bg-[#181920] border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white font-mono font-bold outline-none"
                      />
                      <button
                        onClick={() => {
                          if (!customVal) {
                            showToast(`Please enter a ${g.digits}-digit number`, 'error');
                            return;
                          }
                          adminSetGameResult(g.id, customVal);
                          setGameCustomNumbers({ ...gameCustomNumbers, [g.id]: '' });
                        }}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs rounded-xl cursor-pointer transition-colors whitespace-nowrap"
                      >
                        Set & Draw
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 3: USERS & WALLET BALANCE CONTROL --- */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-[#181920] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h4 className="font-extrabold text-white text-sm">Active Player Account & Wallet</h4>

            {user ? (
              <div className="bg-[#121318] border border-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-white text-base">{user.displayName || user.username}</h3>
                      <span className="text-[10px] bg-amber-400 text-zinc-950 font-black px-1.5 py-0.2 rounded">
                        VIP {user.vipLevel}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono">
                      ID: <span className="text-zinc-200">{user.id}</span> • Phone: {user.phone} • Email: {user.email}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Current Wallet Balance</span>
                    <span className="text-2xl font-black font-mono text-amber-400">
                      ₹{user.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Adjust User Balance Form */}
                <div className="pt-3 border-t border-zinc-800 space-y-3">
                  <span className="text-xs font-bold text-zinc-300 block">Admin Manual Balance Adjustment:</span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="flex rounded-xl bg-[#181920] p-1 border border-zinc-700">
                      <button
                        type="button"
                        onClick={() => setAdjustType('credit')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                          adjustType === 'credit' ? 'bg-emerald-500 text-white' : 'text-zinc-400'
                        }`}
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add Money
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdjustType('debit')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                          adjustType === 'debit' ? 'bg-red-500 text-white' : 'text-zinc-400'
                        }`}
                      >
                        <MinusCircle className="w-3.5 h-3.5" /> Deduct
                      </button>
                    </div>

                    <input
                      type="number"
                      placeholder="Amount in ₹"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className="bg-[#181920] border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                    />

                    <input
                      type="text"
                      placeholder="Note (e.g. Promotional Bonus)"
                      value={adjustNote}
                      onChange={(e) => setAdjustNote(e.target.value)}
                      className="bg-[#181920] border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const num = parseFloat(adjustAmount);
                      if (!num || num <= 0) {
                        showToast('Please enter a valid amount', 'error');
                        return;
                      }
                      const finalAmt = adjustType === 'credit' ? num : -num;
                      adminAdjustBalance(user.id, finalAmt, adjustNote);
                      setAdjustAmount('');
                      setAdjustNote('');
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Apply Balance Adjustment
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">No active user logged in.</p>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: BETTING AUDIT LOGS --- */}
      {adminTab === 'bets' && (
        <div className="space-y-4">
          <div className="bg-[#181920] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-white text-sm">Platform Bet History & Wagers</h4>
              <span className="text-xs text-zinc-400 font-mono">{bets.length} Total Tickets</span>
            </div>

            {bets.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">No bets placed yet.</p>
            ) : (
              <div className="space-y-2">
                {bets.map((b) => (
                  <div
                    key={b.id}
                    className="bg-[#121318] border border-zinc-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{b.gameName}</span>
                        <span className="text-zinc-500 font-mono">Period: {b.period}</span>
                        <span
                          className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded ${
                            b.status === 'won'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : b.status === 'lost'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <div className="text-zinc-400 font-mono mt-0.5">
                        Selected: <span className="text-amber-300 font-bold">{b.numbers.join(', ')}</span> •{' '}
                        {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-zinc-400">Wager: ₹{b.totalAmount.toFixed(2)}</div>
                      {b.status === 'won' && (
                        <div className="text-emerald-400 font-black">+₹{b.payoutWon?.toFixed(2)} Won</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 5: P&L & FIREBASE BACKEND FUNCTIONS --- */}
      {adminTab === 'stats' && (
        <div className="space-y-4">
          <div className="bg-[#181920] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-extrabold text-white text-sm">Financial Profit & House Revenue Summary</h4>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                Gross Profit Margin: {totalBetVolume > 0 ? (((totalBetVolume - totalWonPayouts) / totalBetVolume) * 100).toFixed(1) : '100.0'}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#121318] p-4 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400">Total Wager Staked (GGR)</span>
                <div className="text-xl font-black font-mono text-white">₹{totalBetVolume.toFixed(2)}</div>
              </div>

              <div className="bg-[#121318] p-4 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400">Total Player Winning Payouts</span>
                <div className="text-xl font-black font-mono text-emerald-400">₹{totalWonPayouts.toFixed(2)}</div>
              </div>

              <div className="bg-[#121318] p-4 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400">Pending Withdrawal Liabilities</span>
                <div className="text-xl font-black font-mono text-amber-400">₹{totalPendingAmount.toFixed(2)}</div>
              </div>

              <div className="bg-[#121318] p-4 rounded-xl border border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-400">Settled Approved Withdrawals</span>
                <div className="text-xl font-black font-mono text-blue-400">₹{totalApprovedAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Firebase Cloud Function Integration Module */}
          <div className="bg-[#181920] border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Firebase Backend Cloud Function Script</span>
                </h4>
                <p className="text-xs text-zinc-400">
                  Ready-to-deploy Node.js Cloud Function for Firestore backend automated draws
                </p>
              </div>
              <button
                onClick={() => handleCopy(FIREBASE_CLOUD_FUNCTION_SOURCE_CODE, 'firebase_fn_code')}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedKey === 'firebase_fn_code' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied Script!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Cloud Function
                  </>
                )}
              </button>
            </div>

            <div className="bg-[#121318] p-3 rounded-xl border border-zinc-800 font-mono text-[11px] text-zinc-300 max-h-60 overflow-y-auto">
              <pre className="whitespace-pre">{FIREBASE_CLOUD_FUNCTION_SOURCE_CODE.trim()}</pre>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 6: APP REPLACEMENT & MOBILE APK INTEGRATION --- */}
      {adminTab === 'appSettings' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Header Description */}
          <div className="bg-gradient-to-r from-amber-500/20 via-[#181920] to-[#181920] border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-black text-base">
              <Smartphone className="w-5 h-5" />
              <span>Custom App Details & Mobile Embed Generator</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Yahan aap apne app ke naam, Unity Ads IDs, Telegram support links, aur Android package name ko customize karke instant replace kar sakte hain. Niche diye gaye code snippets automatically update ho jayenge jise aap apne Android Studio, Capacitor, ya Flutter app me direct paste kar sakte hain.
            </p>
          </div>

          {/* Form: App Customization Fields */}
          <div className="bg-[#14151b] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h4 className="font-extrabold text-white text-sm flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Settings className="w-4 h-4 text-amber-400" />
              <span>1. Replace App Branding & IDs</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1">App Display Name</label>
                <input
                  type="text"
                  value={configState.appName}
                  onChange={(e) => setConfigState({ ...configState, appName: e.target.value })}
                  placeholder="e.g. MAZA777"
                  className="w-full bg-[#0d0e12] border border-zinc-700 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Short Name / Logo Text</label>
                <input
                  type="text"
                  value={configState.appShortName}
                  onChange={(e) => setConfigState({ ...configState, appShortName: e.target.value })}
                  placeholder="e.g. 777"
                  className="w-full bg-[#0d0e12] border border-zinc-700 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Android Package Name</label>
                <input
                  type="text"
                  value={configState.packageName}
                  onChange={(e) => setConfigState({ ...configState, packageName: e.target.value })}
                  placeholder="e.g. com.maza777"
                  className="w-full bg-[#0d0e12] border border-zinc-700 rounded-xl px-3 py-2 text-amber-300 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Unity Ads Game ID</label>
                <input
                  type="text"
                  value={configState.unityAdsGameId}
                  onChange={(e) => setConfigState({ ...configState, unityAdsGameId: e.target.value })}
                  placeholder="e.g. 800360831"
                  className="w-full bg-[#0d0e12] border border-zinc-700 rounded-xl px-3 py-2 text-emerald-300 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Unity Rewarded Placement</label>
                <input
                  type="text"
                  value={configState.unityRewardedPlacement}
                  onChange={(e) => setConfigState({ ...configState, unityRewardedPlacement: e.target.value })}
                  placeholder="Rewarded_Android"
                  className="w-full bg-[#0d0e12] border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Unity Banner Placement</label>
                <input
                  type="text"
                  value={configState.unityBannerPlacement}
                  onChange={(e) => setConfigState({ ...configState, unityBannerPlacement: e.target.value })}
                  placeholder="Banner_Android"
                  className="w-full bg-[#0d0e12] border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Telegram Support Link</label>
                <input
                  type="text"
                  value={configState.telegramSupportUrl}
                  onChange={(e) => setConfigState({ ...configState, telegramSupportUrl: e.target.value })}
                  placeholder="https://t.me/maza777com"
                  className="w-full bg-[#0d0e12] border border-zinc-700 rounded-xl px-3 py-2 text-sky-300 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Telegram Handle</label>
                <input
                  type="text"
                  value={configState.telegramUsername}
                  onChange={(e) => setConfigState({ ...configState, telegramUsername: e.target.value })}
                  placeholder="@maza777com"
                  className="w-full bg-[#0d0e12] border border-zinc-700 rounded-xl px-3 py-2 text-sky-300 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">WhatsApp Support Number</label>
                <input
                  type="text"
                  value={configState.whatsappSupportNumber}
                  onChange={(e) => setConfigState({ ...configState, whatsappSupportNumber: e.target.value })}
                  placeholder="+91 90000 00000"
                  className="w-full bg-[#0d0e12] border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={configState.currencySymbol}
                  onChange={(e) => setConfigState({ ...configState, currencySymbol: e.target.value })}
                  placeholder="₹"
                  className="w-full bg-[#0d0e12] border border-zinc-700 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  const reset = resetAppConfig();
                  setConfigState(reset);
                  showToast('App configuration reset to default!', 'info');
                }}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playWin();
                  saveAppConfig(configState);
                  showToast('✅ App Configuration Saved & Applied Everywhere!', 'success');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4 stroke-[3]" />
                <span>Save & Replace All</span>
              </button>
            </div>
          </div>

          {/* Section 2: Ready-to-use Mobile Code Snippets */}
          <div className="bg-[#14151b] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span>2. Ready-to-Copy Source Code for Your Apps</span>
              </h4>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded border border-purple-500/30">
                Auto-Customized for: {configState.packageName}
              </span>
            </div>

            {/* Snippet Tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-[#0d0e12] p-1.5 rounded-xl text-xs font-bold">
              <button
                onClick={() => { sounds.playClick(); setSelectedSnippetTab('capacitor'); }}
                className={`py-1.5 px-2 rounded-lg text-center cursor-pointer transition-all ${
                  selectedSnippetTab === 'capacitor' ? 'bg-amber-400 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                1. Capacitor
              </button>
              <button
                onClick={() => { sounds.playClick(); setSelectedSnippetTab('java'); }}
                className={`py-1.5 px-2 rounded-lg text-center cursor-pointer transition-all ${
                  selectedSnippetTab === 'java' ? 'bg-amber-400 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                2. MainActivity
              </button>
              <button
                onClick={() => { sounds.playClick(); setSelectedSnippetTab('gradle'); }}
                className={`py-1.5 px-2 rounded-lg text-center cursor-pointer transition-all ${
                  selectedSnippetTab === 'gradle' ? 'bg-amber-400 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                3. build.gradle
              </button>
              <button
                onClick={() => { sounds.playClick(); setSelectedSnippetTab('manifest'); }}
                className={`py-1.5 px-2 rounded-lg text-center cursor-pointer transition-all ${
                  selectedSnippetTab === 'manifest' ? 'bg-amber-400 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                4. Manifest
              </button>
              <button
                onClick={() => { sounds.playClick(); setSelectedSnippetTab('flutter'); }}
                className={`py-1.5 px-2 rounded-lg text-center cursor-pointer transition-all ${
                  selectedSnippetTab === 'flutter' ? 'bg-amber-400 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                5. Flutter
              </button>
              <button
                onClick={() => { sounds.playClick(); setSelectedSnippetTab('reactnative'); }}
                className={`py-1.5 px-2 rounded-lg text-center cursor-pointer transition-all ${
                  selectedSnippetTab === 'reactnative' ? 'bg-amber-400 text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                6. React Native
              </button>
            </div>

            {/* Snippet Content Display */}
            <div className="space-y-2">
              {selectedSnippetTab === 'capacitor' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-bold">Automated Capacitor Setup Commands:</span>
                    <button
                      onClick={() => handleCopy(
                        `npm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "${configState.appName}" "${configState.packageName}" --web-dir dist\nnpm run build\nnpx cap add android\nnpx cap copy\nnpx cap open android`,
                        'snippet_cap'
                      )}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedKey === 'snippet_cap' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'snippet_cap' ? 'Copied!' : 'Copy Commands'}</span>
                    </button>
                  </div>
                  <div className="bg-[#0b0c10] border border-zinc-800 rounded-xl p-3 font-mono text-[11px] text-amber-300/90 space-y-1">
                    <p className="text-zinc-500"># 1. Install Capacitor in your project</p>
                    <p>npm install @capacitor/core @capacitor/cli @capacitor/android</p>
                    <p className="text-zinc-500 pt-1"># 2. Initialize with your configured package name</p>
                    <p>npx cap init "{configState.appName}" "{configState.packageName}" --web-dir dist</p>
                    <p className="text-zinc-500 pt-1"># 3. Build & bundle web assets into Android project</p>
                    <p>npm run build</p>
                    <p>npx cap add android</p>
                    <p>npx cap copy</p>
                    <p className="text-zinc-500 pt-1"># 4. Open in Android Studio & click 'Generate Signed APK'</p>
                    <p>npx cap open android</p>
                  </div>
                </div>
              )}

              {selectedSnippetTab === 'java' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-bold">MainActivity.java (With Unity Ads {configState.unityAdsGameId} Bridge):</span>
                    <button
                      onClick={() => handleCopy(
`package ${configState.packageName};

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;

public class MainActivity extends AppCompatActivity {
    private static final String UNITY_GAME_ID = "${configState.unityAdsGameId}";
    private static final String REWARDED_PLACEMENT = "${configState.unityRewardedPlacement}";
    private static final boolean TEST_MODE = ${configState.unityTestMode};
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // 1. Initialize Unity Ads Native SDK
        UnityAds.initialize(getApplicationContext(), UNITY_GAME_ID, TEST_MODE, new IUnityAdsInitializationListener() {
            @Override
            public void onInitializationComplete() {}
            @Override
            public void onInitializationFailed(UnityAds.UnityAdsInitializationError error, String message) {}
        });

        // 2. Fullscreen WebView Configuration
        webView = findViewById(R.id.webview);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // 3. Unity Ads JavaScript Bridge
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void showRewardedAd() {
                runOnUiThread(() -> {
                    UnityAds.show(MainActivity.this, REWARDED_PLACEMENT, new UnityAdsShowOptions(), new IUnityAdsShowListener() {
                        @Override
                        public void onUnityAdsShowComplete(String placementId, UnityAds.UnityAdsShowCompletionState state) {
                            if (state == UnityAds.UnityAdsShowCompletionState.COMPLETED) {
                                webView.post(() -> webView.evaluateJavascript("window.onUnityRewardedComplete && window.onUnityRewardedComplete('${configState.unityRewardedPlacement}');", null));
                            }
                        }
                        @Override public void onUnityAdsShowFailure(String placementId, UnityAds.UnityAdsShowError error, String message) {}
                        @Override public void onUnityAdsShowStart(String placementId) {}
                        @Override public void onUnityAdsShowClick(String placementId) {}
                    });
                });
            }
        }, "AndroidUnityAds");

        webView.setWebViewClient(new WebViewClient());
        // Load bundled offline web assets
        webView.loadUrl("file:///android_asset/index.html");
    }
}`,
                        'snippet_java'
                      )}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedKey === 'snippet_java' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'snippet_java' ? 'Copied!' : 'Copy MainActivity.java'}</span>
                    </button>
                  </div>
                  <div className="bg-[#0b0c10] border border-zinc-800 rounded-xl p-3 font-mono text-[10.5px] text-blue-300 max-h-56 overflow-y-auto">
                    <pre className="whitespace-pre">{`package ${configState.packageName};

import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;

public class MainActivity extends AppCompatActivity {
    private static final String UNITY_GAME_ID = "${configState.unityAdsGameId}";
    private static final String REWARDED_PLACEMENT = "${configState.unityRewardedPlacement}";
    private static final boolean TEST_MODE = ${configState.unityTestMode};
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // 1. Initialize Unity Ads Native SDK
        UnityAds.initialize(getApplicationContext(), UNITY_GAME_ID, TEST_MODE, new IUnityAdsInitializationListener() {
            @Override
            public void onInitializationComplete() {}
            @Override
            public void onInitializationFailed(UnityAds.UnityAdsInitializationError error, String message) {}
        });

        // 2. Fullscreen WebView Configuration
        webView = findViewById(R.id.webview);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        // 3. Unity Ads JavaScript Bridge
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void showRewardedAd() {
                runOnUiThread(() -> {
                    UnityAds.show(MainActivity.this, REWARDED_PLACEMENT, new UnityAdsShowOptions(), new IUnityAdsShowListener() {
                        @Override
                        public void onUnityAdsShowComplete(String placementId, UnityAds.UnityAdsShowCompletionState state) {
                            if (state == UnityAds.UnityAdsShowCompletionState.COMPLETED) {
                                webView.post(() -> webView.evaluateJavascript("window.onUnityRewardedComplete && window.onUnityRewardedComplete('${configState.unityRewardedPlacement}');", null));
                            }
                        }
                        @Override public void onUnityAdsShowFailure(String placementId, UnityAds.UnityAdsShowError error, String message) {}
                        @Override public void onUnityAdsShowStart(String placementId) {}
                        @Override public void onUnityAdsShowClick(String placementId) {}
                    });
                });
            }
        }, "AndroidUnityAds");

        webView.setWebViewClient(new WebViewClient());
        // Load bundled offline web assets
        webView.loadUrl("file:///android_asset/index.html");
    }
}`}</pre>
                  </div>
                </div>
              )}

              {selectedSnippetTab === 'gradle' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-bold">app/build.gradle:</span>
                    <button
                      onClick={() => handleCopy(
`android {
    namespace "${configState.packageName}"
    compileSdkVersion 34

    defaultConfig {
        applicationId "${configState.packageName}"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "${configState.appVersion}"
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.webkit:webkit:1.10.0'
    // Unity Ads Monetization SDK
    implementation 'com.unity3d.ads:unity-ads:4.9.2'
}`,
                        'snippet_gradle'
                      )}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedKey === 'snippet_gradle' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'snippet_gradle' ? 'Copied!' : 'Copy build.gradle'}</span>
                    </button>
                  </div>
                  <div className="bg-[#0b0c10] border border-zinc-800 rounded-xl p-3 font-mono text-[10.5px] text-emerald-300 max-h-56 overflow-y-auto">
                    <pre className="whitespace-pre">{`android {
    namespace "${configState.packageName}"
    compileSdkVersion 34

    defaultConfig {
        applicationId "${configState.packageName}"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "${configState.appVersion}"
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.webkit:webkit:1.10.0'
    // Unity Ads Monetization SDK
    implementation 'com.unity3d.ads:unity-ads:4.9.2'
}`}</pre>
                  </div>
                </div>
              )}

              {selectedSnippetTab === 'manifest' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-bold">AndroidManifest.xml:</span>
                    <button
                      onClick={() => handleCopy(
`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${configState.packageName}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:label="${configState.appName}"
        android:theme="@style/Theme.AppCompat.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
                        'snippet_manifest'
                      )}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedKey === 'snippet_manifest' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'snippet_manifest' ? 'Copied!' : 'Copy AndroidManifest.xml'}</span>
                    </button>
                  </div>
                  <div className="bg-[#0b0c10] border border-zinc-800 rounded-xl p-3 font-mono text-[10.5px] text-amber-200 max-h-56 overflow-y-auto">
                    <pre className="whitespace-pre">{`<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${configState.packageName}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:label="${configState.appName}"
        android:theme="@style/Theme.AppCompat.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`}</pre>
                  </div>
                </div>
              )}

              {selectedSnippetTab === 'flutter' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-bold">Flutter (lib/main.dart):</span>
                    <button
                      onClick={() => handleCopy(
`import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${configState.appName}',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: const WebViewApp(),
    );
  }
}

class WebViewApp extends StatefulWidget {
  const WebViewApp({super.key});
  @override
  State<WebViewApp> createState() => _WebViewAppState();
}

class _WebViewAppState extends State<WebViewApp> {
  late final WebViewController controller;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0E0F13))
      ..loadFlutterAsset('assets/index.html');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: WebViewWidget(controller: controller),
      ),
    );
  }
}`,
                        'snippet_flutter'
                      )}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedKey === 'snippet_flutter' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'snippet_flutter' ? 'Copied!' : 'Copy Flutter code'}</span>
                    </button>
                  </div>
                  <div className="bg-[#0b0c10] border border-zinc-800 rounded-xl p-3 font-mono text-[10.5px] text-cyan-300 max-h-56 overflow-y-auto">
                    <pre className="whitespace-pre">{`import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${configState.appName}',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: const WebViewApp(),
    );
  }
}

class WebViewApp extends StatefulWidget {
  const WebViewApp({super.key});
  @override
  State<WebViewApp> createState() => _WebViewAppState();
}

class _WebViewAppState extends State<WebViewApp> {
  late final WebViewController controller;

  @override
  void initState() {
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF0E0F13))
      ..loadFlutterAsset('assets/index.html');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: WebViewWidget(controller: controller),
      ),
    );
  }
}`}</pre>
                  </div>
                </div>
              )}

              {selectedSnippetTab === 'reactnative' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-bold">React Native (App.tsx):</span>
                    <button
                      onClick={() => handleCopy(
`import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0F13" />
      <WebView
        source={{ uri: 'file:///android_asset/index.html' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E0F13' },
  webview: { flex: 1, backgroundColor: '#0E0F13' },
});`,
                        'snippet_rn'
                      )}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedKey === 'snippet_rn' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'snippet_rn' ? 'Copied!' : 'Copy React Native code'}</span>
                    </button>
                  </div>
                  <div className="bg-[#0b0c10] border border-zinc-800 rounded-xl p-3 font-mono text-[10.5px] text-pink-300 max-h-56 overflow-y-auto">
                    <pre className="whitespace-pre">{`import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0F13" />
      <WebView
        source={{ uri: 'file:///android_asset/index.html' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E0F13' },
  webview: { flex: 1, backgroundColor: '#0E0F13' },
});`}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
