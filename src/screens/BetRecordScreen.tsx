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
  Calendar,
  Zap,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

export const BetRecordScreen: React.FC = () => {
  const { bets, user, navigateTo, triggerManualDraw } = useApp();
  const [activeTab, setActiveTab] = useState<'records' | 'report'>('records');
  const [statusFilter, setStatusFilter] = useState<'all' | 'won' | 'lost' | 'pending'>('all');
  const [settlingGameId, setSettlingGameId] = useState<string | null>(null);

  const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
  const now = Date.now();

  // Strictly filter bets to the active user's own bets from the last 48 hours
  const user48HourBets = bets.filter((b) => {
    const isUser = user ? (b.userId === user.id || b.userId === user.username) : true;
    const isWithin48h = (now - (b.timestamp || 0)) <= FORTY_EIGHT_HOURS_MS;
    return isUser && isWithin48h;
  });

  const filteredBets = user48HourBets.filter((b) => {
    if (statusFilter === 'won') return b.status === 'won';
    if (statusFilter === 'lost') return b.status === 'lost';
    if (statusFilter === 'pending') return b.status === 'pending';
    return true;
  });

  // Report calculations based on this user's 48h bets
  const totalTurnover = user48HourBets.reduce((acc, b) => acc + b.totalAmount, 0);
  const totalWon = user48HourBets
    .filter((b) => b.status === 'won')
    .reduce((acc, b) => acc + (b.payoutWon || 0), 0);
  const netProfit = totalWon - totalTurnover;
  const wonCount = user48HourBets.filter((b) => b.status === 'won').length;
  const lostCount = user48HourBets.filter((b) => b.status === 'lost').length;
  const pendingCount = user48HourBets.filter((b) => b.status === 'pending').length;
  const winRate = user48HourBets.length > 0 ? ((wonCount / user48HourBets.length) * 100).toFixed(1) : '0.0';

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

  const handleSettleNow = (gameId: string) => {
    sounds.playClick();
    setSettlingGameId(gameId);
    triggerManualDraw(gameId);
    setTimeout(() => {
      setSettlingGameId(null);
    }, 1500);
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
            <p className="text-xs text-zinc-400">Statement history & win/loss analytics (48 Hours)</p>
          </div>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            navigateTo('home');
          }}
          className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md"
        >
          + Bet Now
        </button>
      </div>

      {/* 48-Hour Retention Indicator Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs shadow-inner">
        <div className="flex items-center gap-2 text-amber-300 font-medium">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>48-Hour Statement:</strong> Sabhi bet tickets aur win/lose results 48 ghante tak save rehte hain.
          </span>
        </div>
        <span className="font-mono text-[10px] text-zinc-300 bg-zinc-900/90 px-2 py-1 rounded-lg border border-zinc-700 font-bold shrink-0 ml-2">
          {user?.id || 'Guest'}
        </span>
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
          <FileText className="w-4 h-4" /> Bet Records ({user48HourBets.length})
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
            {[
              { id: 'all', label: `All (${user48HourBets.length})` },
              { id: 'won', label: `Won 🏆 (${wonCount})` },
              { id: 'lost', label: `Lost 💔 (${lostCount})` },
              { id: 'pending', label: `Pending ⏳ (${pendingCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  sounds.playClick();
                  setStatusFilter(f.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === f.id
                    ? 'bg-zinc-200 text-zinc-950 font-black shadow-sm'
                    : 'bg-[#181920] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {f.label}
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
                <p className="font-bold text-zinc-300">No bet records found in this 48-hour window.</p>
                <button
                  onClick={() => navigateTo('home')}
                  className="bg-amber-400 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Place a Free Bet Now
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
                                  ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-zinc-950 font-black ring-2 ring-emerald-400'
                                  : 'bg-zinc-800 text-zinc-200'
                              }`}
                            >
                              #{num}
                            </span>
                          );
                        })}
                      </div>

                      {bet.winningNumber ? (
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                            Drawn Result
                          </span>
                          <span className="text-xs font-mono font-black text-amber-400">
                            #{bet.winningNumber}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-amber-400/90 font-mono italic">
                            ⏳ Waiting for draw
                          </span>
                          {/* Instant settle button for testing */}
                          <button
                            type="button"
                            onClick={() => handleSettleNow(bet.gameId)}
                            disabled={settlingGameId === bet.gameId}
                            className="text-[10px] bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm cursor-pointer transition-all active:scale-95"
                          >
                            <Zap className="w-3 h-3 fill-current" />
                            <span>{settlingGameId === bet.gameId ? 'Settling...' : 'Settle Now'}</span>
                          </button>
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
                          <span className="text-zinc-500 font-mono text-xs">-₹{bet.totalAmount.toFixed(2)} LOST</span>
                        ) : (
                          <span className="text-amber-400 text-[11px] font-bold">Draw in Progress</span>
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
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>48-Hour Turnover & Profit Statement</span>
            </h4>

            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-[#121319] p-3 rounded-2xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Total Turnover
                </span>
                <span className="text-sm font-black font-mono text-white">
                  ₹{totalTurnover.toFixed(2)}
                </span>
              </div>

              <div className="bg-[#121319] p-3 rounded-2xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Total Won
                </span>
                <span className="text-sm font-black font-mono text-emerald-400">
                  ₹{totalWon.toFixed(2)}
                </span>
              </div>

              <div className="bg-[#121319] p-3 rounded-2xl border border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Net Profit
                </span>
                <span
                  className={`text-sm font-black font-mono ${
                    netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {netProfit >= 0 ? `+₹${netProfit.toFixed(2)}` : `-₹${Math.abs(netProfit).toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Performance Bar */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-400" /> Win Rate
                </span>
                <span className="font-mono font-black text-amber-300">{winRate}%</span>
              </div>

              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${user48HourBets.length ? (wonCount / user48HourBets.length) * 100 : 0}%` }}
                />
                <div
                  className="bg-red-500 h-full transition-all duration-500"
                  style={{ width: `${user48HourBets.length ? (lostCount / user48HourBets.length) * 100 : 0}%` }}
                />
                <div
                  className="bg-amber-400/40 h-full transition-all duration-500"
                  style={{ width: `${user48HourBets.length ? (pendingCount / user48HourBets.length) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span className="text-emerald-400 font-bold">🏆 Won: {wonCount}</span>
                <span className="text-red-400 font-bold">💔 Lost: {lostCount}</span>
                <span className="text-amber-400 font-bold">⏳ Pending: {pendingCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
