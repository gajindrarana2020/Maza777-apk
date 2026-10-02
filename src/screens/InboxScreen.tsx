import React, { useState } from 'react';
import { Inbox, Trophy, Bell, Trash2, CheckCheck, ArrowLeft, Clock, ShieldAlert } from 'lucide-react';
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

  const [filter, setFilter] = useState<'all' | 'win' | 'system'>('all');

  const filteredMessages = inboxMessages.filter((msg) => {
    if (filter === 'win') return msg.status === 'WIN';
    if (filter === 'system') return msg.status === 'SYSTEM' || msg.status === 'LOSE';
    return true;
  });

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div id="inboxScreen" className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Notifications & Results</h2>
            <p className="text-xs text-zinc-400">Winning alerts, draw outcomes & account notices</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {inboxMessages.length > 0 && (
            <>
              <button
                onClick={markAllMessagesAsRead}
                className="text-xs text-amber-400 hover:text-amber-300 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Read All</span>
              </button>
              <button
                onClick={clearAllMessages}
                className="text-xs text-red-400 hover:text-red-300 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Clear all messages"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => { sounds.playClick(); setFilter('all'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-amber-400 text-zinc-950 shadow-sm'
              : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All ({inboxMessages.length})
        </button>
        <button
          onClick={() => { sounds.playClick(); setFilter('win'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
            filter === 'win'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-zinc-800/80 text-zinc-400 hover:text-emerald-400'
          }`}
        >
          <Trophy className="w-3 h-3" />
          Wins Only ({inboxMessages.filter((m) => m.status === 'WIN').length})
        </button>
        <button
          onClick={() => { sounds.playClick(); setFilter('system'); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            filter === 'system'
              ? 'bg-zinc-600 text-white'
              : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
          }`}
        >
          System & Draws
        </button>
      </div>

      {/* Messages List */}
      <div id="inboxMessagesList" className="space-y-2.5">
        {filteredMessages.length === 0 ? (
          <div className="bg-[#181920] border border-zinc-800 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-800 mx-auto flex items-center justify-center text-zinc-500">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-zinc-300 text-sm">No notifications found</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Draw results and win payouts will automatically appear in your inbox as games finish.
            </p>
            <button
              onClick={() => navigateTo('home')}
              className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Play Games Now
            </button>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isWin = msg.status === 'WIN';
            const isSystem = msg.status === 'SYSTEM';

            return (
              <div
                key={msg.id}
                onClick={() => markMessageAsRead(msg.id)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer relative ${
                  !msg.read
                    ? 'bg-[#1e2028] border-amber-500/40 shadow-md shadow-amber-500/5'
                    : 'bg-[#181920] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Unread dot */}
                {!msg.read && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}

                <div className="flex items-start gap-3">
                  {/* Status Badge Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      isWin
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isSystem
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {isWin ? <Trophy className="w-5 h-5" /> : isSystem ? <Bell className="w-5 h-5" /> : '🎰'}
                  </div>

                  {/* Message details */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          isWin
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isSystem
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {msg.status}
                      </span>
                      <span className="text-xs font-bold text-zinc-200">{msg.gameName}</span>
                      {msg.period && (
                        <span className="text-[11px] text-zinc-500 font-mono">({msg.period})</span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-white mb-1">{msg.title}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">{msg.details}</p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTimeAgo(msg.timestamp)}
                      </span>

                      {isWin && (
                        <span className="text-emerald-400 font-mono font-black text-xs">
                          +₹{msg.amount.toFixed(2)} Credited
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMessage(msg.id);
                        }}
                        className="text-zinc-500 hover:text-red-400 p-1"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
