import React, { useState } from 'react';
import { 
  Inbox, 
  Trophy, 
  Bell, 
  Trash2, 
  CheckCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Ticket, 
  Timer, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

export const InboxScreen: React.FC = () => {
  const {
    inboxMessages,
    markMessageAsRead,
    markAllMessagesAsRead,
    clearAllMessages,
    deleteMessage,
    navigateTo,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'bets' | 'win' | 'lose'>('all');

  const filteredMessages = inboxMessages.filter((msg) => {
    if (filter === 'bets') return msg.status === 'BET_SUCCESS';
    if (filter === 'win') return msg.status === 'WIN';
    if (filter === 'lose') return msg.status === 'LOSE';
    return true;
  });

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getAutoDeleteRemaining = (timestamp: number, expiresAt?: number) => {
    const expiry = expiresAt || (timestamp + 24 * 60 * 60 * 1000);
    const diffMs = Math.max(0, expiry - Date.now());
    const hours = Math.floor(diffMs / (3600 * 1000));
    const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
    return `${hours}h ${mins}m left`;
  };

  return (
    <div id="inboxScreen" className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Inbox & Draw Notifications</h2>
            <p className="text-xs text-zinc-400">Bet slips, winning payouts & draw outcomes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {inboxMessages.length > 0 && (
            <>
              <button
                onClick={markAllMessagesAsRead}
                className="text-xs text-amber-400 hover:text-amber-300 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-zinc-700"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-bold">Read All</span>
              </button>
              <button
                onClick={clearAllMessages}
                className="text-xs text-red-400 hover:text-red-300 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-zinc-700"
                title="Clear all messages"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-bold">Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 24-Hour Auto-Delete Highlight Badge */}
      <div className="bg-gradient-to-r from-amber-500/15 via-[#181b24] to-zinc-900 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">24-Hour Auto-Delete Active</span>
            <span className="text-[11px] text-zinc-400">
              Sabhi bet slip aur draw result messages 24 ghante me automatically delete ho jate hain.
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-black uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30 shrink-0">
          Auto 24H
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => { sounds.playClick(); setFilter('all'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer shrink-0 ${
            filter === 'all'
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All ({inboxMessages.length})
        </button>

        <button
          onClick={() => { sounds.playClick(); setFilter('bets'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            filter === 'bets'
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'bg-zinc-800/80 text-zinc-400 hover:text-blue-300'
          }`}
        >
          <Ticket className="w-3 h-3" />
          Bets Placed ({inboxMessages.filter((m) => m.status === 'BET_SUCCESS').length})
        </button>

        <button
          onClick={() => { sounds.playClick(); setFilter('win'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            filter === 'win'
              ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
              : 'bg-zinc-800/80 text-zinc-400 hover:text-emerald-400'
          }`}
        >
          <Trophy className="w-3 h-3" />
          Wins ({inboxMessages.filter((m) => m.status === 'WIN').length})
        </button>

        <button
          onClick={() => { sounds.playClick(); setFilter('lose'); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            filter === 'lose'
              ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
              : 'bg-zinc-800/80 text-zinc-400 hover:text-red-300'
          }`}
        >
          <XCircle className="w-3 h-3" />
          Losses ({inboxMessages.filter((m) => m.status === 'LOSE').length})
        </button>
      </div>

      {/* Messages List */}
      <div id="inboxMessagesList" className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="bg-[#181920] border border-zinc-800 rounded-3xl p-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 mx-auto flex items-center justify-center text-zinc-500 shadow-inner">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-zinc-200 text-base">No messages in this filter</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Jab aap 20s ad watch karke bet lagayenge ya lottery draw complete hoga, to result messages yahan show honge.
            </p>
            <button
              onClick={() => navigateTo('home')}
              className="bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-zinc-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Play Lottery Now
            </button>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isWin = msg.status === 'WIN';
            const isLose = msg.status === 'LOSE';
            const isBetSuccess = msg.status === 'BET_SUCCESS';
            const isSystem = msg.status === 'SYSTEM';

            return (
              <div
                key={msg.id}
                onClick={() => markMessageAsRead(msg.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative shadow-lg ${
                  !msg.read
                    ? isWin
                      ? 'bg-gradient-to-r from-emerald-950/40 via-[#18201a] to-[#14151b] border-emerald-500/50 shadow-emerald-500/5'
                      : isBetSuccess
                      ? 'bg-gradient-to-r from-blue-950/40 via-[#161a25] to-[#14151b] border-blue-500/50 shadow-blue-500/5'
                      : 'bg-[#1b1c24] border-amber-500/40'
                    : 'bg-[#16171e] border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Unread indicator */}
                {!msg.read && (
                  <span className="absolute top-3.5 right-3.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                  </span>
                )}

                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-md ${
                      isWin
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isLose
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : isBetSuccess
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}
                  >
                    {isWin ? (
                      <Trophy className="w-5 h-5 animate-bounce" />
                    ) : isLose ? (
                      <XCircle className="w-5 h-5" />
                    ) : isBetSuccess ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    {/* Header Chips */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          isWin
                            ? 'bg-emerald-500 text-zinc-950 font-mono'
                            : isLose
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : isBetSuccess
                            ? 'bg-blue-500 text-white font-mono'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {isWin
                          ? '🏆 WIN'
                          : isLose
                          ? '💔 LOSE'
                          : isBetSuccess
                          ? '🎟️ BET PLACED'
                          : msg.status}
                      </span>

                      {/* Prominent Lottery Name & Draw No */}
                      <span className="text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
                        🎰 {msg.gameName}
                      </span>

                      {(msg.drawNumber || msg.period) && (
                        <span className="text-xs font-mono font-bold text-zinc-300 bg-zinc-800/80 px-2 py-0.5 rounded-md">
                          Draw #{msg.drawNumber || msg.period}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-white mb-1">{msg.title}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">{msg.details}</p>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Clock className="w-3 h-3 text-zinc-500" /> {formatTimeAgo(msg.timestamp)}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10.5px] text-amber-400/80 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                          <Timer className="w-3 h-3 text-amber-400" />
                          {getAutoDeleteRemaining(msg.timestamp, msg.expiresAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isWin && (
                          <span className="text-emerald-400 font-mono font-black text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            +₹{msg.amount.toFixed(2)} Credited
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sounds.playClick();
                            deleteMessage(msg.id);
                          }}
                          className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
