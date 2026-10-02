import React from 'react';
import { Trophy, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastBanner: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const isWin = toast.type === 'win';
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      id="alertBox"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] animate-slide-down"
    >
      <div
        className={`p-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
          isWin
            ? 'bg-gradient-to-r from-amber-500/90 to-yellow-600/90 text-zinc-950 border-yellow-300 font-extrabold shadow-amber-500/40'
            : isSuccess
            ? 'bg-[#15251d]/95 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20'
            : isError
            ? 'bg-[#291515]/95 text-red-300 border-red-500/50 shadow-red-500/20'
            : 'bg-[#181922]/95 text-zinc-200 border-zinc-700 shadow-zinc-950/50'
        }`}
      >
        <div className="shrink-0">
          {isWin ? (
            <Trophy className="w-6 h-6 text-zinc-950 animate-bounce" />
          ) : isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-red-400" />
          ) : (
            <Info className="w-5 h-5 text-amber-400" />
          )}
        </div>
        <div className="text-xs sm:text-sm font-bold flex-1 leading-snug">
          {toast.message}
        </div>
      </div>
    </div>
  );
};
