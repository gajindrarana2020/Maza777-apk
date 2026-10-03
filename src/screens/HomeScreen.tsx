import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Flame, Clock, Search, Zap, Trophy, HelpCircle, Send, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GameCategory, Game } from '../types';
import { AdsterraBannerAd } from '../components/AdsterraBannerAd';

export const HomeScreen: React.FC = () => {
  const { games, openBetModal, user, navigateTo } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tickerIndex, setTickerIndex] = useState(0);

  // Live real-time multiplayer winners ticker
  const recentWinners = [
    { user: 'Player_9821', game: 'Morning Express 3D', amount: '₹1,250.00', number: '482' },
    { user: 'LuckyStar_88', game: 'Royal Jackpot 4D', amount: '₹9,000.00', number: '7777' },
    { user: 'KeralaKing', game: 'Kerala Win-Win 3D', amount: '₹2,500.00', number: '539' },
    { user: 'DelhiWinner', game: 'Afternoon Golden 3D', amount: '₹3,750.00', number: '777' },
    { user: 'NagalandRider', game: 'Nagaland Dear 3D', amount: '₹1,500.00', number: '185' },
    { user: 'RoyalJackpot', game: 'Kerala Monsoon Bumper 4D', amount: '₹18,000.00', number: '7391' },
    { user: 'KolkataWinner', game: 'Evening Delight 3D', amount: '₹2,500.00', number: '924' },
    { user: 'NightStriker', game: 'Night Star 4D', amount: '₹14,500.00', number: '8024' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % recentWinners.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [recentWinners.length]);

  const categories: { id: GameCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'All Real-time Draws', icon: '🎰' },
    { id: 'turbo', label: 'Live Scheduled', icon: '⚡' },
    { id: 'kerala', label: 'Kerala Series', icon: '🌴' },
    { id: 'nagaland', label: 'Nagaland State', icon: '🎯' },
    { id: 'international', label: 'International', icon: '🌍' },
    { id: '4d', label: '4D Mega Jackpots', icon: '💎' },
  ];

  const filteredGames = games.filter((game) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === '4d'
        ? game.digits === 4
        : game.category === selectedCategory;

    const matchesSearch =
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.period.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (game.badge && game.badge.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (game.scheduleLabel && game.scheduleLabel.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div id="homeScreen" className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Live Wins Marquee Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-zinc-900 to-amber-500/15 border border-amber-500/30 rounded-xl px-3.5 py-2 flex items-center justify-between shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 shrink-0">
          <Trophy className="w-4 h-4 text-yellow-400 shrink-0 animate-bounce" />
          <span className="uppercase tracking-wider text-[11px] text-amber-400/90 font-black">Live Draw Results:</span>
        </div>
        <div className="text-xs text-zinc-200 font-medium truncate ml-2 flex items-center gap-1.5">
          <span className="text-zinc-400">{recentWinners[tickerIndex].user}</span>
          <span className="text-zinc-500">•</span>
          <span className="text-amber-200 font-bold">{recentWinners[tickerIndex].game}</span>
          <span className="text-emerald-400 font-mono font-black">{recentWinners[tickerIndex].amount}</span>
          <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
            Win #{recentWinners[tickerIndex].number}
          </span>
        </div>
      </div>

      {/* Dedicated HighRevenue / Adsterra 320x50 Ads Banner Slot */}
      <div id="home-ads-banner-slot" className="w-full">
        <AdsterraBannerAd />
      </div>

      {/* Quick Watch Ad for Free Credits Bar */}
      <div className="bg-gradient-to-r from-amber-500/20 via-[#181920] to-purple-600/20 border border-amber-500/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-white text-sm">Adsterra Smartlinks (Free ₹10 Bet)</h4>
              <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                20s Ad Active
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-0.5">
              Smartlink ad 20s tak open rakhna zaroori hai. 20s se pehle wapas aane par bet invalid hoga aur reopen karna hoga!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (filteredGames.length > 0) {
              openBetModal(filteredGames[0]);
            }
          }}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Watch Ad & Play Game</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lotteries by name, time, or period (e.g. Kerala, 4D, 1:00 PM)..."
              className="w-full bg-[#181920] border border-zinc-800 focus:border-amber-400/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-2 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer text-center ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                  : 'bg-[#181920] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span className="truncate">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Games List Grid */}
      <div id="gamesList" className="space-y-2.5">
        {filteredGames.length === 0 ? (
          <div className="bg-[#181920] border border-zinc-800 rounded-xl p-8 text-center text-zinc-400 text-sm">
            No games found matching "{searchQuery}".
          </div>
        ) : (
          filteredGames.map((game) => {
            const isDrawing = game.status === 'drawing';

            return (
              <div
                key={game.id}
                id={`game-row-${game.id}`}
                className="bg-[#181920] hover:bg-[#1c1e27] border border-zinc-800/90 hover:border-amber-500/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all shadow-lg group relative overflow-hidden"
              >
                {/* Colored accent stripe */}
                <div
                  className="absolute top-0 left-0 w-1.5 h-full"
                  style={{ backgroundColor: game.iconColor }}
                />

                {/* Left: Thumbnail Image + Game Info */}
                <div className="flex items-center gap-3.5">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-700/80 shadow-md group-hover:border-amber-400/50 transition-all bg-zinc-900">
                    {game.imageUrl ? (
                      <img
                        src={game.imageUrl}
                        alt={game.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent py-0.5 px-1 text-center">
                      <span className="text-[10px] font-black text-amber-300 font-mono tracking-tighter">
                        {game.digits}D
                      </span>
                    </div>

                    <div
                      className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full ring-1 ring-black"
                      style={{ backgroundColor: game.iconColor }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="font-extrabold text-white text-sm sm:text-base group-hover:text-amber-300 transition-colors truncate">
                        {game.name}
                      </h3>
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {game.payoutMultiplier}x
                      </span>
                      {game.scheduleLabel && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 hidden xs:inline border border-zinc-700/50">
                          {game.scheduleLabel}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-zinc-400 mt-1">
                      <span>
                        Period: <strong className="text-zinc-300 font-mono">{game.period}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        Result:{' '}
                        <strong className="text-amber-400 font-mono font-extrabold tracking-wider bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                          {game.result}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Timer & Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
                  {/* Countdown Timer & Schedule */}
                  <div className="text-left sm:text-right min-w-[125px]">
                    <div className="text-[10px] uppercase font-semibold text-zinc-400 flex items-center sm:justify-end gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {game.scheduleLabel ? game.scheduleLabel : 'Auto Draw'}
                    </div>
                    <div
                      id={`timer_${game.period}`}
                      className={`font-mono font-black text-xs sm:text-sm tracking-wide ${
                        isDrawing ? 'text-red-400 animate-pulse' : 'text-amber-400'
                      }`}
                    >
                      {isDrawing ? 'DRAWING...' : game.nextActionLabel || 'Synchronized'}
                    </div>
                  </div>

                  {/* Place Bet Button */}
                  <button
                    id={`bet_${game.period}`}
                    onClick={() => openBetModal(game)}
                    disabled={isDrawing}
                    className={`px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-95 cursor-pointer min-w-[115px] text-center flex items-center justify-center gap-1.5 ${
                      isDrawing
                        ? 'bg-red-600/40 text-red-300 border border-red-500/50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 shadow-amber-500/20'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isDrawing ? 'Drawing' : 'Play Ad & Bet'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* About Us & Platform Rules Card (Styled as per User's Reference Image) */}
      <div className="relative rounded-3xl overflow-hidden border border-blue-500/40 shadow-2xl bg-gradient-to-b from-[#101d4a] via-[#0c1638] to-[#080d24] text-white">
        {/* Ambient starry glow & sparkles overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-4 right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-4 left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative p-5 sm:p-7 space-y-6">
          {/* Top 4 Circular Badges / Social Channels */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 pt-1">
            {/* 18+ Age Restriction Badge */}
            <div 
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30 flex items-center justify-center font-black text-white text-sm sm:text-base border-2 border-white/20 select-none transition-transform hover:scale-105"
              title="18+ Strictly for Adults"
            >
              18+
            </div>

            {/* Telegram Channel */}
            <a
              href="https://t.me/maza777com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg shadow-sky-500/30 flex items-center justify-center text-white border-2 border-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
              title="Join Official Telegram"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6 -translate-x-0.5 translate-y-0.5" />
            </a>

            {/* Facebook Channel */}
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/30 flex items-center justify-center text-white font-serif font-black text-xl sm:text-2xl border-2 border-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer leading-none"
              title="Official Facebook Page"
            >
              f
            </a>

            {/* WhatsApp Support */}
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-green-500/30 flex items-center justify-center text-white border-2 border-white/20 transition-all hover:scale-110 active:scale-95 cursor-pointer"
              title="WhatsApp Customer Care"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.067-1.118-.069-.265-.086-.607-.202-1.042-.391-1.848-.802-3.048-2.67-3.14-2.793-.093-.124-.752-.998-.752-1.905 0-.907.477-1.353.646-1.538.169-.185.37-.231.493-.231.124 0 .247.002.355.007.114.005.267-.044.417.318.155.373.53 1.295.576 1.389.046.094.077.204.015.328-.061.124-.092.202-.185.31-.092.109-.196.242-.279.325-.094.094-.191.196-.082.383.109.187.483.799 1.037 1.292.713.636 1.314.833 1.501.926.187.093.298.077.408-.047.11-.124.471-.548.596-.736.124-.187.248-.156.417-.093.169.062 1.077.508 1.262.601.185.093.308.139.354.216.046.077.046.45-.098.855z" />
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.892.525 3.662 1.438 5.176L2 22l4.981-1.408C8.423 21.494 10.154 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.15-.494-4.414-1.341l-.316-.212-3.284.929.932-3.208-.232-.338C3.784 14.73 3.3 13.411 3.3 12c0-4.797 3.903-8.7 8.7-8.7 4.797 0 8.7 3.903 8.7 8.7 0 4.797-3.903 8.7-8.7 8.7z" />
              </svg>
            </a>
          </div>

          {/* About Us Heading */}
          <div className="text-center space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              About Us
            </h3>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto rounded-full" />
          </div>

          {/* About Us Three Paragraphs (Tailored for MAZA777 - 100% Free with No Deposit) */}
          <div className="space-y-4 text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal text-left sm:text-justify max-w-2xl mx-auto">
            <p>
              MAZA777 is an online entertainment service platform focused on providing genuine, fair, and stable operations. The platform employs multiple security mechanisms to comprehensively protect user data and funds, ensuring every winning payout is secure and controllable.
            </p>

            <p>
              During winning prize withdrawals, MAZA777 utilizes encrypted channels and efficient processing procedures to provide maximum security and rapid response, making fund transfers smoother and the experience more reassuring without requiring any deposit.
            </p>

            <p>
              We are committed to transparent operations and long-term service, creating a safe, reliable, efficient, and trustworthy platform environment for all our users.
            </p>
          </div>

          {/* Platform Rules Section (Rules Bhi Rahega) */}
          <div className="pt-4 border-t border-blue-500/30">
            <div className="bg-[#0b122c]/90 border border-blue-400/25 rounded-2xl p-4 sm:p-5 space-y-3 shadow-inner">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs sm:text-sm">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Maza777 Official Platform Rules & Draw Guidelines:</span>
              </div>

              <div className="space-y-2 text-[11px] sm:text-xs text-zinc-300 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    <strong className="text-white">Scheduled Live Draws:</strong> All 3D & 4D lottery draws operate on synchronized server schedules with transparent draw periods and real-time live timers.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    <strong className="text-white">Live Results & Instant Settling:</strong> Results are automatically finalized at draw completion, and prize winnings are instantly transferred to your Winnings Balance.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    <strong className="text-white">100% Free Sponsored Entry:</strong> No need any deposit to withdraw money and play games. Complete 100% free ad-sponsored gaming with direct real money bank and UPI withdrawals.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    4
                  </span>
                  <p>
                    <strong className="text-white">18+ Age Policy:</strong> Strictly intended for adults aged 18 and older. Please play responsibly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 24/7 Official Telegram Support Banner */}
      <a 
        href="https://t.me/maza777com"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gradient-to-r from-sky-950/40 via-[#15161d] to-sky-950/30 border border-sky-500/40 hover:border-sky-400 rounded-2xl p-4 flex items-center justify-between transition-all hover:scale-[1.01] shadow-lg group cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-white text-sm">24/7 Customer Support</h4>
              <span className="text-[10px] bg-sky-400 text-zinc-950 font-black px-1.5 py-0.2 rounded uppercase">Telegram</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Direct official chat link: https://t.me/maza777com</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-zinc-950 px-3.5 py-2 rounded-xl text-xs font-black shadow-md transition-colors shrink-0">
          <span>Contact Us</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </a>
    </div>
  );
};
