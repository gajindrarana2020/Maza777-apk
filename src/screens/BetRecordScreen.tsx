import React, { useState } from 'react';
import { ArrowLeft, Trophy, Clock, FileText, BarChart3, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

export const BetRecordScreen: React.FC = () => {
  const { bets, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<'records' | 'report'>('records');
  const [statusFilter, setStatusFilter] = useState<'all' | 'won' | 'lost' | 'pending'>('all');

  const filteredBets = bets.filter((b) => {
    if (statusFilter === 'won') return b.status === 'won';
    if (statusFilter === 'lost') return b.status === 'lost';
    if (statusFilter === 'pending') return b.status === 'pending';
    return true;
  });

  // Report calculations
  const totalTurnover = bets.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalWon = bets
    .filter((b) => b.status === 'won')
    .reduce((acc, b) => acc + (b.payoutWon || 0), 0);
  const netProfit = totalWon - totalTurnover;
  const wonCount = bets.filter((b) => b.status === 'won').length;
  const lostCount = bets.filter((b) => b.status === 'lost').length;
  const pendingCount = bets.filter((b) => b.status === 'pending').length;
  const winRate = bets.length > 0 ? ((wonCount / bets.length) * 100).toFixed(1) : '0.0';

  return (
    <div id="betRecordScreen" className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('profile')}
            className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-black text-white">Bet Record & Reports</h2>
            <p className="text-xs text-zinc-400">Statement history and performance analytics</p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-[#181920] p-1.5 rounded-xl border border-zinc-800 grid grid-cols-2 gap-1.5">
        <button
          onClick={() => { sounds.playClick(); setActiveTab('records'); }}
          className={`py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'records'
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Bet Record
        </button>
        <button
          onClick={() => { sounds.playClick(); setActiveTab('report'); }}
          className={`py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'report'
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" /> Analytics Report
        </button>
      </div>

      {activeTab === 'records' ? (
        <div className="space-y-3">
          {/* Sub Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(['all', 'won', 'lost', 'pending'] as const).map((st) => (
              <button
                key={st}
                onClick={() => { sounds.playClick(); setStatusFilter(st); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-zinc-700 text-white'
                    : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {st} ({bets.filter((b) => (st === 'all' ? true : b.status === st)).length})
              </button>
            ))}
          </div>

          {/* List of Bet Tickets */}
          <div id="betHistoryList" className="space-y-2.5">
            {filteredBets.length === 0 ? (
              <div className="bg-[#181920] border border-zinc-800 rounded-2xl p-8 text-center space-y-2 text-zinc-400 text-xs">
                <p>No bet records found for this filter.</p>
                <button
                  onClick={() => navigateTo('home')}
                  className="bg-amber-400 text-zinc-950 font-bold px-3 py-1.5 rounded-lg text-xs"
                >
                  Place a Bet
                </button>
              </div>
            ) : (
              filteredBets.map((bet) => {
                const isWon = bet.status === 'won';
                const isLost = bet.status === 'lost';
                const isPending = bet.status === 'pending';

                return (
                  <div
                    key={bet.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isWon
                        ? 'bg-[#18231c] border-emerald-500/40 shadow-sm'
                        : 'bg-[#181920] border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{bet.gameName}</span>
                        <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-mono">
                          {bet.digits}D
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">#{bet.period}</span>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          isWon
                            ? 'bg-emerald-500 text-zinc-950'
                            : isLost
                            ? 'bg-zinc-800 text-zinc-400'
                            : 'bg-amber-500/20 text-amber-300 animate-pulse'
                        }`}
                      >
                        {bet.status}
                      </span>
                    </div>

                    {/* Numbers selected */}
                    <div className="bg-[#14151b] p-2 rounded-lg border border-zinc-800/80 flex flex-wrap items-center gap-1.5 mb-2">
                      <span className="text-[11px] text-zinc-400 mr-1">Picks:</span>
                      {bet.numbers.map((num, i) => {
                        const isMatch = bet.winningNumber && bet.winningNumber === num;
                        return (
                          <span
                            key={i}
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              isMatch
                                ? 'bg-emerald-500 text-zinc-950 font-black'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {num}
                          </span>
                        );
                      })}
                    </div>

                    {/* Result and Stakes */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/60 text-zinc-400">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>Stake: </span>
                        <strong className="text-white font-mono font-bold">₹{bet.totalAmount.toFixed(2)}</strong>
                        <span className="text-[9.5px] bg-amber-400/10 text-amber-300 border border-amber-400/20 px-1.5 py-0.2 rounded font-mono font-bold">
                          {bet.adToBetRatio || '10:1'} Rewarded Ad
                        </span>
                        {bet.winningNumber && (
                          <span className="ml-1">
                            • Draw: <strong className="text-amber-400 font-mono font-bold">{bet.winningNumber}</strong>
                          </span>
                        )}
                      </div>

                      <div>
                        {isWon ? (
                          <span className="text-emerald-400 font-black font-mono text-sm">
                            +₹{(bet.payoutWon || 0).toFixed(2)}
                          </span>
                        ) : isLost ? (
                          <span className="text-zinc-500 font-mono">-₹{bet.totalAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-amber-400 text-[11px] font-semibold">Waiting for Draw</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Analytics / Financial Statement Tab */
        <div className="space-y-4">
          <div className="bg-[#181920] border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" /> Lifetime Account Financials
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#14151b] p-3.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Turnover</span>
                <span className="text-lg font-black text-white font-mono">₹{totalTurnover.toFixed(2)}</span>
              </div>
              <div className="bg-[#14151b] p-3.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Payouts Won</span>
                <span className="text-lg font-black text-emerald-400 font-mono">₹{totalWon.toFixed(2)}</span>
              </div>
              <div className="bg-[#14151b] p-3.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Net P&L</span>
                <span
                  className={`text-lg font-black font-mono ${
                    netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {netProfit >= 0 ? '+' : ''}₹{netProfit.toFixed(2)}
                </span>
              </div>
              <div className="bg-[#14151b] p-3.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Win Rate</span>
                <span className="text-lg font-black text-amber-400 font-mono">{winRate}%</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Winning Tickets:
                </span>
                <span className="font-bold font-mono">{wonCount}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="flex items-center gap-1 text-zinc-500">
                  <XCircle className="w-3.5 h-3.5" /> Settled Losses:
                </span>
                <span className="font-bold font-mono">{lostCount}</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="flex items-center gap-1 text-amber-400">
                  <Clock className="w-3.5 h-3.5" /> In-Play / Pending:
                </span>
                <span className="font-bold font-mono">{pendingCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back to Profile Button */}
      <button
        onClick={() => navigateTo('profile')}
        className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-400/30 font-bold text-sm rounded-xl transition-colors cursor-pointer"
      >
        Back to Profile
      </button>
    </div>
  );
};
