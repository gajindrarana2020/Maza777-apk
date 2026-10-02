import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Lock, Mail, ArrowRight, UserCheck, Tv, FileText, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { TermsModal } from '../components/TermsModal';

export const AuthScreen: React.FC = () => {
  const { login, continueAsGuest, showToast } = useApp();

  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass.trim()) {
      showToast('Please enter your Gmail / Email ID and Password', 'error');
      return;
    }
    login(loginUser, loginPass);
  };

  return (
    <div className="min-h-screen bg-[#0f1015] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-[#16171d] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 mx-auto shadow-lg shadow-amber-500/25">
            <div className="w-full h-full bg-[#121212] rounded-[14px] flex items-center justify-center font-black text-2xl text-amber-400 tracking-tighter">
              777
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
            MAZA777
          </h1>
          <p className="text-xs text-zinc-400">
            India's Premier 3D & 4D Lottery & Turbo Gaming Hub
          </p>
        </div>

        {/* 100% Free Ads-Based Platform Notice Banner */}
        <div className="bg-[#121318] border border-amber-500/30 rounded-2xl p-3 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[11px]">
            <Tv className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>100% Free Ads-Based Platform</span>
          </div>
          <p className="text-[10.5px] text-zinc-400 leading-tight">
            Koi bhi registration form bharne ki jarurat nahi hai. New users ke liye auto Guest ID create ho jata hai.
          </p>
        </div>

        {/* Header Label */}
        <div className="text-center">
          <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
            <Mail className="w-4 h-4 text-amber-400" />
            <span>Login with Gmail / Email ID</span>
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Agar aapne pehle se Gmail/Email & Password save kiya hai to yahan login karein.
          </p>
        </div>

        {/* LOGIN FORM */}
        <form id="loginScreen" onSubmit={handleLogin} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Gmail / Email ID / User ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                id="loginUser"
                type="text"
                required
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full bg-[#101116] border border-zinc-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                id="loginPass"
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#101116] border border-zinc-700 focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Login to Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-[#16171d] px-3 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
            OR
          </span>
          <div className="border-t border-zinc-800 w-full" />
        </div>

        {/* Instant Guest Mode Button */}
        <button
          type="button"
          onClick={continueAsGuest}
          className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-amber-500/30 text-amber-300 font-extrabold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
        >
          <UserCheck className="w-4 h-4 text-amber-400" />
          <span>Play as Guest (Instant Auto Guest ID)</span>
        </button>

        <p className="text-[10px] text-zinc-400 text-center leading-tight">
          💡 Guest ID hi aapka User ID hai. Profile menu me jaakar ya Withdrawal ke time apna Gmail aur Password kabhi bhi save kar sakte hain.
        </p>

        {/* Trust Badges & Direct Terms Button */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Free Ads-Based
          </span>
          <button
            type="button"
            onClick={() => { sounds.playClick(); setIsTermsModalOpen(true); }}
            className="text-amber-400/80 hover:text-amber-300 underline text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3 h-3" />
            <span>18+ Policy & Terms</span>
          </button>
        </div>
      </div>

      {/* 18+ Terms & Conditions Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  );
};
