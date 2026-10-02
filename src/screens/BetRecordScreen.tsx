import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  FileText, 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Percent,
  Calendar
} from 'lucide-react';
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

  const formatDateTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div id="betRecordScreen" className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              navigateTo('profile');
            }}
            className="w-10 h-10 rounded-2xl bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer border border-zinc-700 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-black text-white">Bet Records & Reports</h2>
            <p className="text-xs text-zinc-400">Statement history & win/loss analytics</p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="bg-[#181920] p-1.5 rounded-2xl border border-zinc-800 grid grid-cols-2 gap-1.5 shadow-sm">
        <button
          onClick={() => { sounds.playClick(); setActiveTab('records'); }}
          className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'records'
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Bet Records ({bets.length})
        </button>
        <button
          onClick={() => { sounds.playClick(); setActiveTab('report'); }}
          className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'report'
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Win/Loss Report
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
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? st === 'won'
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : st === 'lost'
                      ? 'bg-red-500 text-white shadow-sm'
                      : st === 'pending'
                      ? 'bg-amber-400 text-zinc-950 shadow-sm'
                      : 'bg-zinc-700 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {st === 'won' ? '🏆 Won' : st === 'lost' ? '💔 Lost' : st === 'pending' ? '⏳ Pending' : 'All'} (
                {bets.filter((b) => (st === 'all' ? true : b.status === st)).length})
              </button>
            ))}
          </div>

          {/* List of Bet Tickets */}
          <div id="betHistoryList" className="space-y-2.5">
            {filteredBets.length === 0 ? (
              <div className="bg-[#181920] border border-zinc-800 rounded-3xl p-10 text-center space-y-3 text-zinc-400 text-xs">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 mx-auto flex items-center justify-center text-zinc-500">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="font-bold text-zinc-300">No bet records found in this filter.</p>
                <button
                  onClick={() => navigateTo('home')}
                  className="bg-amber-400 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Place a Free Bet
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
                    className={`p-4 rounded-2xl border transition-all shadow-md ${
                      isWon
                        ? 'bg-gradient-to-r from-emerald-950/40 via-[#16201a] to-[#14151b] border-emerald-500/50'
                        : isLost
                        ? 'bg-gradient-to-r from-red-950/20 via-[#1a171c] to-[#14151b] border-red-500/30'
                        : 'bg-[#181920] border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-amber-400 text-sm">🎰 {bet.gameName}</span>
                        <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md font-mono">
                          {bet.digits}D
                        </span>
                        <span className="text-xs text-zinc-400 font-mono font-bold bg-zinc-800/80 px-2 py-0.5 rounded-md">
                          Draw #{bet.period}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isWon
                            ? 'bg-emerald-500 text-zinc-950 font-mono shadow-sm'
                            : isLost
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        }`}
                      >
                        {isWon ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> WON
                          </>
                        ) : isLost ? (
                          <>
                            <XCircle className="w-3 h-3" /> LOST
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> PENDING
                          </>
                        )}
                      </span>
                    </div>

                    {/* Numbers selected */}
                    <div className="bg-[#121319] p-2.5 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-zinc-400 font-bold">Your Picks:</span>
                        {bet.numbers.map((num, i) => {
                          const isMatch = bet.winningNumber && bet.winningNumber === num;
                          return (
                            <span
                              key={i}
                              className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-lg shadow-sm ${
                                isMatch
                                  ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-zinc-950 font-black'
                                  : 'bg-zinc-800 text-zinc-200'
                              }`}
                            >
                              #{num}
                            </span>
                          );
                        })}
                      </div>

                      {bet.winningNumber && (
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                            Drawn Result
                          </span>
                          <span className="text-xs font-mono font-black text-amber-400">
                            #{bet.winningNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Result and Stakes */}
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-zinc-800/80 text-zinc-400 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>Stake:</span>
                        <strong className="text-white font-mono font-bold">₹{bet.totalAmount.toFixed(2)}</strong>
                        <span className="text-[9.5px] bg-amber-400/10 text-amber-300 border border-amber-400/20 px-1.5 py-0.5 rounded font-mono font-bold">
                          {bet.adToBetRatio || '10:1'} Ad
                        </span>
                        <span className="text-[10.5px] text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-600" />
                          {formatDateTime(bet.timestamp)}
                        </span>
                      </div>

                      <div>
                        {isWon ? (
                          <span className="text-emerald-400 font-black font-mono text-sm bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                            +₹{(bet.payoutWon || 0).toFixed(2)} WON
                          </span>
                        ) : isLost ? (
                          <span className="text-zinc-500 font-mono text-xs">-₹{bet.totalAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-amber-400 text-[11px] font-bold">Waiting for Draw</span>
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
          <div className="bg-[#181920] border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-lg">
            <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" /> Lifetime Performance & Win/Loss Summary
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#14151b] p-3.5 rounded-2xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Bets Count</span>
                <span className="text-lg font-black text-white font-mono">{bets.length}</span>
              </div>
              <div className="bg-[#14151b] p-3.5 rounded-2xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Payouts Won</span>
                <span className="text-lg font-black text-emerald-400 font-mono">₹{totalWon.toFixed(2)}</span>
              </div>
              <div className="bg-[#14151b] p-3.5 rounded-2xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Net P&L</span>
                <span
                  className={`text-lg font-black font-mono ${
                    netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {netProfit >= 0 ? '+' : ''}₹{netProfit.toFixed(2)}
                </span>
              </div>
              <div className="bg-[#14151b] p-3.5 rounded-2xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Win Rate</span>
                <span className="text-lg font-black text-amber-400 font-mono">{winRate}%</span>
              </div>
            </div>

            {/* Win vs Loss Breakdown */}
            <div className="bg-[#14151b] p-4 rounded-2xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Wins: {wonCount}
                </span>
                <span className="text-red-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Losses: {lostCount}
                </span>
                <span className="text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Pending: {pendingCount}
                </span>
              </div>

              {/* Progress visual bar */}
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full transition-all" 
                  style={{ width: `${bets.length ? (wonCount / bets.length) * 100 : 0}%` }} 
                />
                <div 
                  className="bg-red-500 h-full transition-all" 
                  style={{ width: `${bets.length ? (lostCount / bets.length) * 100 : 0}%` }} 
                />
                <div 
                  className="bg-amber-400 h-full transition-all" 
                  style={{ width: `${bets.length ? (pendingCount / bets.length) * 100 : 0}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
