import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCw,
  Search,
  Landmark,
  Smartphone,
  Copy,
  Check,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  PlusCircle,
  HelpCircle,
  Receipt,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { WithdrawalRecord } from '../types';

export const WithdrawRecordScreen: React.FC = () => {
  const { user, withdrawals, navigateTo, showToast } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    sounds.playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter withdrawals
  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesStatus = filterStatus === 'all' ? true : w.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      w.referenceId.toLowerCase().includes(q) ||
      (w.utrNumber && w.utrNumber.toLowerCase().includes(q)) ||
      w.bankName.toLowerCase().includes(q) ||
      w.accountNumber.toLowerCase().includes(q) ||
      (w.upiId && w.upiId.toLowerCase().includes(q)) ||
      (w.realName && w.realName.toLowerCase().includes(q)) ||
      String(w.amount).includes(q);

    return matchesStatus && matchesSearch;
  });

  // Calculate quick stats
  const totalWithdrawnSuccess = withdrawals
    .filter((w) => w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0);

  const totalInQueue = withdrawals
    .filter((w) => w.status === 'pending' || w.status === 'processing')
    .reduce((sum, w) => sum + w.amount, 0);

  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length;
  const processingCount = withdrawals.filter((w) => w.status === 'processing').length;
  const successCount = withdrawals.filter((w) => w.status === 'approved').length;
  const rejectedCount = withdrawals.filter((w) => w.status === 'rejected').length;

  return (
    <div id="withdrawRecordScreen" className="max-w-md w-full mx-auto px-3 py-3.5 space-y-3.5">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('profile')}
            className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Back to Account"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              <span>Withdrawal Records</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Live records of your payout requests
            </p>
          </div>
        </div>

        <button
          onClick={() => navigateTo('withdraw')}
          className="px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden xs:inline">New Withdrawal</span>
          <span className="xs:hidden">Withdraw</span>
        </button>
      </div>

      {/* Summary Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-[#181920] border border-zinc-800 rounded-xl p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Transferred</span>
          <span className="text-base sm:text-lg font-black font-mono text-emerald-400 mt-0.5 block">
            ₹{totalWithdrawnSuccess.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-emerald-500/90 font-semibold">{successCount} Successful</span>
        </div>

        <div className="bg-[#181920] border border-zinc-800 rounded-xl p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">In Verification</span>
          <span className="text-base sm:text-lg font-black font-mono text-amber-400 mt-0.5 block">
            ₹{totalInQueue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-amber-500/90 font-semibold">{pendingCount + processingCount} Queue</span>
        </div>

        <div className="bg-[#181920] border border-zinc-800 rounded-xl p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Winnings Wallet</span>
          <span className="text-base sm:text-lg font-black font-mono text-white mt-0.5 block">
            ₹{(user?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-zinc-400">Available to Withdraw</span>
        </div>

        <div className="bg-[#181920] border border-zinc-800 rounded-xl p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Total Requests</span>
          <span className="text-base sm:text-lg font-black font-mono text-amber-300 mt-0.5 block">
            {withdrawals.length}
          </span>
          <span className="text-[10px] text-zinc-400">All-time Records</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Ref ID, Bank, UPI ID, or Amount..."
            className="w-full bg-[#181920] border border-zinc-800 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none placeholder-zinc-500 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 text-xs px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="grid grid-cols-5 gap-1 bg-[#14151b] p-1 rounded-xl border border-zinc-800">
          {[
            { id: 'all', label: 'All', count: withdrawals.length },
            { id: 'pending', label: 'Pending', count: pendingCount, color: 'text-amber-400' },
            { id: 'processing', label: 'Processing', count: processingCount, color: 'text-sky-400' },
            { id: 'approved', label: 'Success', count: successCount, color: 'text-emerald-400' },
            { id: 'rejected', label: 'Rejected', count: rejectedCount, color: 'text-red-400' },
          ].map((tab) => {
            const isActive = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setFilterStatus(tab.id as any);
                }}
                className={`py-2 rounded-lg text-[11px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-md font-black'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1 rounded font-mono ${
                    isActive ? 'bg-zinc-950/30 text-zinc-950 font-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Withdrawal Records List */}
      <div className="space-y-3">
        {filteredWithdrawals.length === 0 ? (
          <div className="bg-[#181920] border border-zinc-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">No Withdrawal Records Found</h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {filterStatus === 'all'
                  ? "You haven't requested any withdrawals yet. Play free draws to win real cash!"
                  : `No records found with status "${filterStatus}".`}
              </p>
            </div>
            <button
              onClick={() => navigateTo('withdraw')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-black cursor-pointer shadow-md"
            >
              Go to Withdraw Screen
            </button>
          </div>
        ) : (
          filteredWithdrawals.map((w) => {
            const isPending = w.status === 'pending';
            const isProcessing = w.status === 'processing';
            const isSuccess = w.status === 'approved';
            const isRejected = w.status === 'rejected';
            const isUpi = w.type === 'upi' || w.upiId || w.bankName === 'UPI Direct';

            return (
              <div
                key={w.id}
                id={`record-${w.id}`}
                className={`bg-[#181920] border rounded-2xl p-4 sm:p-5 space-y-3 transition-all shadow-lg ${
                  isPending
                    ? 'border-amber-500/50 hover:border-amber-400'
                    : isProcessing
                    ? 'border-sky-500/50 hover:border-sky-400 bg-gradient-to-br from-sky-950/20 via-[#181920] to-[#181920]'
                    : isSuccess
                    ? 'border-emerald-500/40 hover:border-emerald-400/60'
                    : 'border-red-500/40 hover:border-red-400/60'
                }`}
              >
                {/* Header: Payment Mode & Amount */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                        isUpi
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {isUpi ? <Smartphone className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-sm sm:text-base">{w.bankName}</span>
                        <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-mono border border-zinc-700">
                          {isUpi ? 'UPI DIRECT' : 'BANK TRANSFER'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>A/C: <strong className="text-zinc-200">{isUpi ? w.upiId || w.accountNumber : w.accountNumber}</strong></span>
                        {w.realName && (
                          <>
                            <span>•</span>
                            <span>{w.realName}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Payout Amount */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Payout Amount</span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                      ₹{w.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Status Badges Banner */}
                <div className="bg-[#121318] border border-zinc-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 font-bold text-[11px]">Payout Status:</span>
                    <span
                      className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : isProcessing
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse'
                          : isSuccess
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {isPending && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                      {isProcessing && <RotateCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />}
                      {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {isRejected && <XCircle className="w-3.5 h-3.5 text-red-400" />}

                      <span>
                        {isPending
                          ? '⏳ PENDING'
                          : isProcessing
                          ? '🔄 PROCESSING'
                          : isSuccess
                          ? '✅ SUCCESS'
                          : '❌ REJECTED'}
                      </span>
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-zinc-400">
                    Ref ID: <strong className="text-white">{w.referenceId}</strong>
                  </div>
                </div>

                {isSuccess && (
                  <div className="bg-emerald-950/25 border border-emerald-500/30 rounded-xl p-3 text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Funds Transferred via IMPS / UPI</span>
                      </span>
                      {w.utrNumber && (
                        <div className="flex items-center gap-1.5 bg-zinc-900/90 px-2 py-1 rounded-lg border border-emerald-500/40">
                          <span className="text-[10px] text-zinc-400 font-mono">Bank UTR / Ref:</span>
                          <span className="text-xs font-mono font-black text-emerald-300">{w.utrNumber}</span>
                          <button
                            onClick={() => handleCopy(w.utrNumber || '', `utr_${w.id}`)}
                            className="text-zinc-400 hover:text-emerald-300 p-0.5"
                            title="Copy UTR"
                          >
                            {copiedKey === `utr_${w.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    {w.adminNote && (
                      <p className="text-[11px] text-zinc-300 pt-1 border-t border-emerald-500/20 font-mono">
                        Memo / Note: {w.adminNote}
                      </p>
                    )}
                  </div>
                )}

                {isRejected && (
                  <div className="bg-red-950/25 border border-red-500/30 rounded-xl p-3 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-red-300 font-bold">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span>Request Rejected & Refunded</span>
                    </div>
                    {w.adminNote && (
                      <p className="text-[11px] text-zinc-300">
                        Reason: <strong className="text-white">{w.adminNote}</strong>
                      </p>
                    )}
                    <p className="text-[10px] text-emerald-400 font-bold pt-1 border-t border-red-500/20">
                      ₹{w.amount.toFixed(2)} was automatically refunded back to your Winnings Wallet.
                    </p>
                  </div>
                )}

                {/* Footer Timestamps */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-mono">
                  <span>Submitted: {new Date(w.timestamp).toLocaleString('en-IN')}</span>
                  {w.processedAt && (
                    <span>Last Updated: {new Date(w.processedAt).toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 24/7 Official Telegram Customer Support Footer */}
      <div className="bg-gradient-to-r from-sky-950/40 via-[#181920] to-sky-950/30 border border-sky-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-white text-sm">Need Help with Withdrawal Status?</h4>
              <span className="text-[10px] bg-sky-400 text-zinc-950 font-black px-1.5 py-0.2 rounded uppercase">
                Telegram
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Contact our 24/7 official Telegram support agent: @maza777com
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
    </div>
  );
};
