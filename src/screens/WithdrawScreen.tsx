import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  Smartphone,
  ExternalLink,
  Receipt,
  Trash2,
  PlusCircle,
  AlertTriangle,
  RotateCw,
  XCircle,
  Building,
  User,
  Hash,
  KeyRound,
  Lock,
  Mail,
  Phone,
  X,
  Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

export const WithdrawScreen: React.FC = () => {
  const {
    user,
    bankCards,
    withdrawals,
    requestWithdrawal,
    saveUserCredentials,
    deleteBankCard,
    navigateTo,
    openBankModal,
    showToast,
  } = useApp();

  // Selected saved payout card ID
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Required Credentials Prompt State (when email/password not yet set)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credEmail, setCredEmail] = useState(user?.email || '');
  const [credPass, setCredPass] = useState('');
  const [credPhone, setCredPhone] = useState(user?.phone || '');
  const [isSavingCreds, setIsSavingCreds] = useState(false);

  // Filter tab for accounts: 'all' | 'bank' | 'upi'
  const [accountFilter, setAccountFilter] = useState<'all' | 'bank' | 'upi'>('all');

  // Withdrawal Amount
  const [amount, setAmount] = useState<string>('');

  // Auto-select first saved account if none selected or if selected account was deleted
  useEffect(() => {
    if (bankCards.length > 0) {
      if (!selectedCardId || !bankCards.some((c) => c.id === selectedCardId)) {
        setSelectedCardId(bankCards[0].id);
      }
    } else {
      setSelectedCardId(null);
    }
  }, [bankCards, selectedCardId]);

  const savedBankAccounts = bankCards.filter((c) => !c.type || c.type === 'bank');
  const savedUpiAccounts = bankCards.filter((c) => c.type === 'upi');

  const filteredCards =
    accountFilter === 'bank'
      ? savedBankAccounts
      : accountFilter === 'upi'
      ? savedUpiAccounts
      : bankCards;

  const selectedCard = bankCards.find((c) => c.id === selectedCardId);

  const handleQuickPercent = (pct: number) => {
    sounds.playClick();
    if (!user) return;
    const calc = Math.floor(user.balance * pct);
    setAmount(calc >= 100 ? String(calc) : calc > 0 ? String(calc) : '');
  };

  const doExecuteWithdrawal = (amt: number, card: any) => {
    const isBank = !card.type || card.type === 'bank';
    const success = requestWithdrawal({
      amount: amt,
      type: isBank ? 'bank' : 'upi',
      realName: card.realName || user?.displayName || 'Player',
      accountNumber: card.accountNumber,
      bankName: card.bankName || (isBank ? 'Bank Account' : 'UPI Direct'),
      ifscCode: card.ifscCode,
      upiId: card.upiId || card.accountNumber,
      phone: card.phone || user?.phone,
      saveMethod: false,
    });

    if (success) {
      setAmount('');
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();

    if (!user) {
      showToast('Please login to request a withdrawal.', 'error');
      navigateTo('auth');
      return;
    }

    if (bankCards.length === 0 || !selectedCard) {
      showToast('Please add and select a Bank Account or UPI ID first.', 'error');
      openBankModal();
      return;
    }

    const numAmt = parseFloat(amount);
    if (!numAmt || numAmt <= 0) {
      showToast('Please enter a valid withdrawal amount.', 'error');
      return;
    }

    if (numAmt < 100) {
      showToast('Minimum withdrawal amount is ₹100.', 'error');
      return;
    }

    if (numAmt > (user?.balance || 0)) {
      showToast(
        `Insufficient balance! Current winning balance is ₹${(user?.balance || 0).toFixed(2)}.`,
        'error'
      );
      return;
    }

    // CHECK: User must set Gmail/Email and Password before requesting withdrawal!
    const isEmailLinked = Boolean(user.email && user.email.includes('@'));
    if (!isEmailLinked) {
      sounds.playClick();
      setCredEmail(user.email || '');
      setCredPhone(user.phone || '');
      setShowCredentialsModal(true);
      return;
    }

    doExecuteWithdrawal(numAmt, selectedCard);
  };

  const handleSaveCredentialsAndWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credEmail || !credEmail.includes('@')) {
      showToast('Please enter a valid Gmail / Email address', 'error');
      return;
    }
    if (!credPass || credPass.length < 4) {
      showToast('Password must be at least 4 characters', 'error');
      return;
    }

    setIsSavingCreds(true);
    sounds.playClick();
    const ok = await saveUserCredentials(credEmail, credPass, credPhone);
    setIsSavingCreds(false);

    if (ok) {
      setShowCredentialsModal(false);
      const numAmt = parseFloat(amount);
      if (numAmt && selectedCard) {
        doExecuteWithdrawal(numAmt, selectedCard);
      }
    }
  };

  return (
    <div id="withdrawScreen" className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header Balance Banner */}
      <div className="bg-gradient-to-br from-amber-600/30 via-[#181920] to-[#121318] border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-zinc-400 flex items-center gap-1.5">
              <span>Winnings Wallet Available</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                100% Real Cash
              </span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">
              ₹<span id="withdrawBalance">{(user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Only winnings from winning lottery draws can be withdrawn.
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
            <ArrowUpRight className="w-7 h-7 stroke-[2.5]" />
          </div>
        </div>

        {/* 24/7 Telegram Support Bar & Record Quick Link */}
        <div className="mt-3 pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <button
            onClick={() => navigateTo('withdrawRecord')}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[11px]"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Withdrawal Record ({withdrawals.length})</span>
          </button>
          <a
            href="https://t.me/maza777com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold bg-sky-500/10 border border-sky-500/30 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-[11px]"
          >
            <Send className="w-3 h-3 text-sky-400" />
            <span>24/7 Support: @maza777com</span>
          </a>
        </div>
      </div>

      {/* SAVED PAYOUT ACCOUNTS SELECTION SECTION */}
      <div className="bg-[#181920] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-white text-sm sm:text-base">Select Payout Account</h4>
              <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded">
                {bankCards.length}/5 Saved
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tap your saved Bank Account or UPI ID to withdraw funds directly.
            </p>
          </div>

          <button
            type="button"
            onClick={openBankModal}
            disabled={bankCards.length >= 5}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md ${
              bankCards.length >= 5
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 shadow-amber-500/20 active:scale-95'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Account</span>
          </button>
        </div>

        {/* Filter Pills if user has multiple accounts */}
        {bankCards.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 bg-[#121318] rounded-xl border border-zinc-800/80 text-xs">
            <button
              type="button"
              onClick={() => setAccountFilter('all')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
                accountFilter === 'all'
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All ({bankCards.length})
            </button>
            <button
              type="button"
              onClick={() => setAccountFilter('bank')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 ${
                accountFilter === 'bank'
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Landmark className="w-3 h-3" />
              <span>Banks ({savedBankAccounts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountFilter('upi')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 ${
                accountFilter === 'upi'
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>UPI ({savedUpiAccounts.length})</span>
            </button>
          </div>
        )}

        {/* Empty State: No Accounts Saved */}
        {bankCards.length === 0 ? (
          <div className="bg-[#14151b] border-2 border-dashed border-amber-500/30 hover:border-amber-400/50 rounded-2xl p-6 text-center space-y-3 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-inner">
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <h5 className="font-extrabold text-white text-sm sm:text-base">No Payout Account Linked</h5>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Add your Bank Account or UPI ID to receive instant winning withdrawals. You can save up to 5 unique accounts.
              </p>
            </div>
            <button
              type="button"
              onClick={openBankModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Link Bank Account or UPI ID</span>
            </button>
          </div>
        ) : (
          /* Cards List: User simply selects one of their saved accounts */
          <div className="space-y-2.5">
            {filteredCards.map((card) => {
              const isSelected = card.id === selectedCardId;
              const isUpi = card.type === 'upi';

              return (
                <div
                  key={card.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedCardId(card.id);
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-2 border-amber-400 bg-gradient-to-r from-amber-500/15 via-[#1c1d26] to-amber-500/5 shadow-lg shadow-amber-500/10'
                      : 'border-zinc-800 bg-[#121318] hover:bg-[#16171f] hover:border-zinc-700'
                  }`}
                >
                  {/* Left: Radio checkmark + Icon + Account Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Radio Button Selector */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400 text-zinc-950'
                          : 'border-zinc-600 bg-zinc-900'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-zinc-950" />}
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isUpi
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {isUpi ? <Smartphone className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm truncate">
                          {isUpi ? 'UPI Direct (Instant)' : card.bankName}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded font-mono ${
                            isUpi
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {isUpi ? 'UPI ID' : 'Bank A/C'}
                        </span>
                      </div>

                      <div className="text-xs text-zinc-300 font-mono font-bold mt-0.5 truncate">
                        {isUpi ? card.upiId || card.accountNumber : `A/C: ${card.accountNumber}`}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-400 mt-0.5">
                        <span>Holder: <strong className="text-zinc-300">{card.realName}</strong></span>
                        {card.ifscCode && (
                          <span>• IFSC: <strong className="text-amber-300 font-mono">{card.ifscCode}</strong></span>
                        )}
                        {card.phone && (
                          <span>• Phone: <strong className="text-zinc-300 font-mono">{card.phone}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Delete action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playClick();
                        deleteBankCard(card.id);
                      }}
                      className="w-8 h-8 rounded-xl bg-zinc-800/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-700/60 hover:border-red-500/40 flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* WITHDRAWAL AMOUNT & SUBMIT FORM */}
      <form onSubmit={handleWithdrawSubmit} className="bg-[#181920] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-white text-sm sm:text-base">Enter Withdrawal Amount</h4>
          <span className="text-[11px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            Min ₹100
          </span>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <span className="absolute left-4 top-3 text-amber-400 font-bold text-lg font-mono">₹</span>
            <input
              type="number"
              min="100"
              placeholder="Enter amount to withdraw (e.g. 500)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#121318] border border-zinc-700 focus:border-amber-400 rounded-xl pl-9 pr-4 py-3 text-white font-mono text-lg font-bold outline-none shadow-inner"
            />
          </div>

          {/* Quick Percentages */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '25%', val: 0.25 },
              { label: '50%', val: 0.5 },
              { label: '75%', val: 0.75 },
              { label: '100% (All)', val: 1.0 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleQuickPercent(p.val)}
                className="py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer active:scale-95"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Withdrawal Info Box with Exact User Notice */}
        <div className="bg-[#121318] p-3.5 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Withdrawal Transfer Fee:</span>
            <span className="text-emerald-400 font-bold">₹0.00 (100% Free)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Initial Payout Status:</span>
            <span className="text-amber-400 font-black flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 animate-pulse" /> PENDING (Admin Review & IMPS/UPI Transfer)
            </span>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 space-y-1.5 leading-relaxed">
            <div className="flex items-start gap-2 text-amber-300 font-bold text-xs bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Note : Withdrawal may processing 24 hours. Beware of withdrawal with 100% rate of our withdrawal system, please be patient.
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              When you submit a withdrawal request, its status is initially marked as <strong className="text-amber-400">Pending</strong>. Our verification team processes payouts with a 100% success rate within 24 hours via direct IMPS or UPI. You can track status changes (<strong className="text-amber-400">Pending</strong> &rarr; <strong className="text-sky-400">Processing</strong> &rarr; <strong className="text-emerald-400">Success</strong>) in the <strong>Withdrawal Record</strong> section in your Account menu.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            bankCards.length === 0 ||
            !selectedCard ||
            !amount ||
            parseFloat(amount) < 100 ||
            (user?.balance || 0) < parseFloat(amount)
          }
          className={`w-full py-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
            bankCards.length > 0 &&
            selectedCard &&
            amount &&
            parseFloat(amount) >= 100 &&
            (user?.balance || 0) >= parseFloat(amount)
              ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 shadow-amber-500/30 active:scale-95'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {bankCards.length === 0
              ? 'Please Add a Bank Account or UPI ID First'
              : !selectedCard
              ? 'Please Select a Saved Payout Account'
              : !amount || parseFloat(amount) < 100
              ? 'Enter Amount (Min ₹100) to Withdraw'
              : (user?.balance || 0) < parseFloat(amount)
              ? 'Insufficient Winnings Wallet Balance'
              : `Withdraw ₹${parseFloat(amount).toLocaleString('en-IN')} to ${
                  selectedCard.type === 'upi' ? 'UPI' : selectedCard.bankName
                } (${selectedCard.realName})`}
          </span>
        </button>
      </form>

      {/* 24/7 Official Telegram Support Link Card */}
      <div className="bg-gradient-to-r from-sky-950/40 via-[#181920] to-sky-950/30 border border-sky-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-white text-sm">Need Help with Withdrawal?</h4>
              <span className="text-[10px] bg-sky-400 text-zinc-950 font-black px-1.5 py-0.2 rounded uppercase">
                Online 24/7
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Contact our official Telegram Support agent for instant payout verification
            </p>
          </div>
        </div>
        <a
          href="https://t.me/maza777com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 px-3.5 py-2 rounded-xl text-xs font-black shadow-md transition-colors shrink-0 cursor-pointer"
        >
          <span>Support</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* WITHDRAWAL TRANSACTION HISTORY */}
      {withdrawals.length > 0 && (
        <div className="bg-[#181920] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Withdrawal Records & Live Status</span>
            </h4>
            <button
              onClick={() => navigateTo('withdrawRecord')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All ({withdrawals.length})</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {withdrawals.slice(0, 5).map((w) => {
              const isPending = w.status === 'pending';
              const isProcessing = w.status === 'processing';
              const isApproved = w.status === 'approved';
              const isRejected = w.status === 'rejected';
              const isUpi = w.type === 'upi' || w.upiId || w.bankName === 'UPI Direct';

              return (
                <div
                  key={w.id}
                  className={`bg-[#121318] border rounded-xl p-3.5 space-y-2.5 text-xs transition-all ${
                    isPending
                      ? 'border-amber-500/50 shadow-sm'
                      : isProcessing
                      ? 'border-sky-500/50 shadow-sm bg-sky-950/10'
                      : isApproved
                      ? 'border-emerald-500/30'
                      : 'border-red-500/30'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isUpi
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {isUpi ? <Smartphone className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm">{w.bankName}</span>
                          <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-mono">
                            {isUpi ? 'UPI' : 'BANK'}
                          </span>
                        </div>
                        <span className="text-zinc-400 font-mono text-[11px] block mt-0.5">
                          {isUpi ? w.upiId || w.accountNumber : `A/C: ${w.accountNumber}`}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Amount</span>
                      <span className="text-base font-black font-mono text-amber-400">
                        ₹{w.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge & Notification Banner */}
                  <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isProcessing
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse'
                            : isRejected
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {isPending && <Clock className="w-3 h-3 text-amber-400" />}
                        {isProcessing && <RotateCw className="w-3 h-3 text-sky-400 animate-spin" />}
                        {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        {isRejected && <XCircle className="w-3 h-3 text-red-400" />}
                        <span>
                          {isPending
                            ? '⏳ PENDING'
                            : isProcessing
                            ? '🔄 PROCESSING'
                            : isApproved
                            ? '✅ SUCCESS'
                            : '❌ REJECTED'}
                        </span>
                      </span>
                    </div>

                    <div className="text-zinc-500 font-mono text-[10px]">
                      Ref: <strong className="text-zinc-400">{w.referenceId}</strong> •{' '}
                      {new Date(w.timestamp).toLocaleString()}
                    </div>
                  </div>

                  {/* Admin Settlement Details */}
                  {isApproved && w.utrNumber && (
                    <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-2 text-[11px] text-emerald-300 font-mono flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Bank UTR / Ref Number:</span>
                        <strong className="text-white">{w.utrNumber}</strong>
                      </span>
                      {w.adminNote && (
                        <span className="text-zinc-400 text-[10px]">Note: {w.adminNote}</span>
                      )}
                    </div>
                  )}

                  {isRejected && w.adminNote && (
                    <div className="bg-red-950/30 border border-red-500/30 rounded-lg p-2 text-[11px] text-red-300 space-y-1">
                      <div className="flex items-center gap-1 font-bold">
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                        <span>Rejection Reason:</span>
                      </div>
                      <p className="text-zinc-300">{w.adminNote}</p>
                      <p className="text-[10px] text-emerald-400 font-bold">
                        ₹{w.amount.toFixed(2)} has been refunded back to your Winnings Wallet.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REQUIRED CREDENTIALS MODAL BEFORE WITHDRAWAL */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181920] border border-amber-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowCredentialsModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/10">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">Set Gmail/Email & Password to Withdraw</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Withdrawal request karne ke liye apna Gmail/Email ID aur Password set karein taaki aapka payout aur account secure rahe.
              </p>
            </div>

            <form onSubmit={handleSaveCredentialsAndWithdraw} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Gmail / Email ID *</span>
                </label>
                <input
                  type="email"
                  required
                  value={credEmail}
                  onChange={(e) => setCredEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-[#121318] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Set Password *</span>
                </label>
                <input
                  type="password"
                  required
                  value={credPass}
                  onChange={(e) => setCredPass(e.target.value)}
                  placeholder="Set 4+ character password"
                  className="w-full bg-[#121318] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mobile Number (Optional)</span>
                </label>
                <input
                  type="tel"
                  value={credPhone}
                  onChange={(e) => setCredPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#121318] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCredentialsModal(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCreds}
                  className="flex-2 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingCreds ? 'Saving...' : 'Save & Continue Withdraw'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
