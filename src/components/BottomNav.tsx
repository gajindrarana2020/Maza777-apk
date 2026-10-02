import React from 'react';
import { Home, Inbox, ArrowUpRight, User, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveScreen } from '../types';

export const BottomNav: React.FC = () => {
  const { activeScreen, navigateTo, unreadInboxCount } = useApp();

  const navItems: { id: ActiveScreen; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'invite', label: 'Invite', icon: Share2 },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // If in a subscreen like profileEdit or betRecord, still highlight profile
  const isProfileActive = ['profile', 'profileEdit', 'betRecord'].includes(activeScreen);

  return (
    <nav
      id="maza-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#16171C]/95 backdrop-blur-lg border-t border-zinc-800/80 shadow-2xl safe-area-bottom"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 px-1.5 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === 'profile' ? isProfileActive : activeScreen === item.id;

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => navigateTo(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {item.id === 'inbox' && unreadInboxCount > 0 && (
                  <span
                    id="inbox-unread-badge"
                    className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-[#16171C] animate-pulse"
                  >
                    {unreadInboxCount > 99 ? '99+' : unreadInboxCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-medium mt-1 tracking-tight ${isActive ? 'font-bold text-amber-400' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1.5 w-6 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
