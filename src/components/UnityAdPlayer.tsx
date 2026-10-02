import React, { useState, useEffect, useRef } from 'react';
import { Play, Volume2, VolumeX, Sparkles, CheckCircle2, ShieldCheck, Tv, Film, Loader2, X, FastForward, Database, ExternalLink, Download } from 'lucide-react';
import { sounds } from '../utils/audio';
import { UNITY_ADS_CONFIG, unityAds } from '../services/unityAds';

export { UNITY_ADS_CONFIG };

interface UnityAdPlayerProps {
  isOpen: boolean;
  onAdComplete: (skipped?: boolean) => void;
  onAdClose?: () => void;
  title?: string;
  subTitle?: string;
  gameName?: string;
  betNumbers?: string[];
  totalStake?: number;
}

export const UnityAdPlayer: React.FC<UnityAdPlayerProps> = ({
  isOpen,
  onAdComplete,
  onAdClose,
  gameName,
  betNumbers = [],
  totalStake = 10,
}) => {
  const [countdown, setCountdown] = useState<number>(UNITY_ADS_CONFIG.DURATION_SEC);
  const [progress, setProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [adVariant, setAdVariant] = useState<number>(0);
  const [isProcessingFirebase, setIsProcessingFirebase] = useState<boolean>(false);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoHasError, setVideoHasError] = useState<boolean>(false);
  const [showCancelWarning, setShowCancelWarning] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // High-definition Real Commercial Video Streams
  const adCreatives = [
    {
      sponsor: 'Royal Crown 3D & 4D Jackpots',
      tagline: "India's #1 Real-time Number Lottery & Daily Turbo Draws",
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      poster: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&auto=format&fit=crop&q=80',
      badge: 'SPONSORED',
      color: 'from-amber-600 via-purple-900 to-black',
      actionText: 'Install & Play Free',
      rating: '4.9 ★ (2.4M Downloads)',
    },
    {
      sponsor: 'Super 777 Turbo Spinner VIP',
      tagline: 'Instant Results every 4 hours with up to 90x Jackpots!',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      poster: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
      badge: 'FEATURED',
      color: 'from-emerald-700 via-teal-950 to-black',
      actionText: 'Claim Bonus Now',
      rating: '5.0 ★ (1.8M Downloads)',
    },
    {
      sponsor: 'Kerala & Kolkata Turbo Multi-User',
      tagline: 'Free Ad-Supported Entertainment & Instant UPI Rewards',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      poster: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=1200&auto=format&fit=crop&q=80',
      badge: 'POPULAR',
      color: 'from-red-600 via-rose-950 to-black',
      actionText: 'Play Free Now',
      rating: '4.8 ★ (950K Downloads)',
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCountdown(UNITY_ADS_CONFIG.DURATION_SEC);
      setProgress(0);
      setIsCompleted(false);
      setShowCancelWarning(false);
      setIsProcessingFirebase(false);
      setIsVideoLoading(false);
      setVideoHasError(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      return;
    }

    const selectedVariant = Math.floor(Math.random() * adCreatives.length);
    setAdVariant(selectedVariant);
    setCountdown(UNITY_ADS_CONFIG.DURATION_SEC);
    setProgress(0);
    setIsCompleted(false);
    setShowCancelWarning(false);
    setIsProcessingFirebase(false);
    setVideoHasError(false);

    sounds.playClick();

    // Call Native Unity Ads SDK on Android Phone APK
    try {
      unityAds.showRewardedAd({
        onStart: () => console.log('[Unity Ads SDK] Rewarded Ad Active'),
        onComplete: () => {
          setIsCompleted(true);
          setIsProcessingFirebase(true);
          onAdComplete(false);
        },
        onError: (err) => console.warn('[Unity Ads SDK] Native Ad Notice:', err),
      });
    } catch (e) {
      console.log('[Unity Ads SDK] Trigger error:', e);
    }

    // Play video element safely
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Fallback handled smoothly by poster and ad visuals
      });
    }

    const totalMs = UNITY_ADS_CONFIG.DURATION_SEC * 1000;
    const intervalMs = 100;
    let elapsedMs = 0;

    const timer = setInterval(() => {
      elapsedMs += intervalMs;
      const currentRemaining = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
      const currentProg = Math.min(100, (elapsedMs / totalMs) * 100);

      setCountdown(currentRemaining);
      setProgress(currentProg);

      if (elapsedMs >= totalMs) {
        clearInterval(timer);
        setIsCompleted(true);
        setIsProcessingFirebase(true);
        sounds.playWin?.();

        // Process in Firebase strictly after full non-skippable ad duration
        setTimeout(() => {
          onAdComplete(false);
        }, 800);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleCancelClick = () => {
    sounds.playClick();
    if (isCompleted || isProcessingFirebase) {
      return;
    }
    setShowCancelWarning(true);
  };

  const confirmCancelAd = () => {
    sounds.playClick();
    setShowCancelWarning(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    if (onAdClose) {
      onAdClose();
    }
  };

  const resumeAd = () => {
    sounds.playClick();
    setShowCancelWarning(false);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const toggleSound = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    if (videoRef.current) {
      videoRef.current.muted = newMute;
    }
  };

  const handleInstallClick = () => {
    sounds.playClick();
  };

  if (!isOpen) return null;

  const currentCreative = adCreatives[adVariant] || adCreatives[0];

  return (
    <div
      id="unity-ads-player-overlay"
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[999999] w-screen h-screen bg-black flex flex-col justify-between select-none overflow-hidden"
    >
      {/* Top Floating Fullscreen Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider bg-amber-400 text-zinc-950 px-2.5 py-1 rounded-md shadow-lg">
            {currentCreative.badge}
          </span>
          <span className="text-xs text-white/90 font-medium hidden sm:inline-block">
            Reward: ₹10 Free Bet
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Sound Mute Toggle */}
          <button
            onClick={toggleSound}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-lg active:scale-95"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Non-Skippable Countdown Timer */}
          {!isCompleted ? (
            <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-amber-400/60 rounded-full px-3.5 py-1.5 text-xs font-mono font-black text-amber-300 shadow-xl">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Ad: {countdown}s</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-950/90 backdrop-blur-md border border-emerald-500/80 rounded-full px-3.5 py-1.5 text-xs font-mono font-black text-emerald-400 shadow-xl">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reward Confirmed!</span>
            </div>
          )}

          {/* Close Button with Warning */}
          <button
            type="button"
            onClick={handleCancelClick}
            className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-all cursor-pointer shadow-lg active:scale-95"
            title="Close Ad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Fullscreen Video Ad Area */}
      <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
        {/* Cancel Confirmation Warning Modal */}
        {showCancelWarning && (
          <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-lg p-5 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3">
              <X className="w-7 h-7 text-rose-400" />
            </div>
            <h3 className="text-lg font-black text-white">Cancel Ad & Discard Bet?</h3>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-sm mt-1.5 mb-5 leading-relaxed">
              This is a full-length ad. You must watch the complete video to claim your <strong>₹10 Free Bet</strong> into the draw.
            </p>
            <div className="flex items-center gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={resumeAd}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-zinc-950 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-lg active:scale-95"
              >
                Keep Watching ({countdown}s)
              </button>
              <button
                type="button"
                onClick={confirmCancelAd}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs sm:text-sm transition-all cursor-pointer border border-zinc-700"
              >
                Quit Ad
              </button>
            </div>
          </div>
        )}

        {/* Real Video Element Fullscreen with robust fallbacks */}
        {!videoHasError && (
          <video
            ref={videoRef}
            src={currentCreative.videoUrl}
            poster={currentCreative.poster}
            playsInline
            webkit-playsinline="true"
            autoPlay
            muted={isMuted}
            preload="auto"
            onError={() => {
              console.warn('[UnityAdPlayer] Video failed, falling back to rich animated ad display.');
              setVideoHasError(true);
            }}
            onLoadedData={() => setIsVideoLoading(false)}
            onEnded={() => {
              setIsCompleted(true);
              setIsProcessingFirebase(true);
              onAdComplete(false);
            }}
            className="w-full h-full object-cover"
          />
        )}

        {/* Fallback Animated Poster Background if Video fails to stream or blocked by browser */}
        {videoHasError && (
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000 scale-105"
            style={{ backgroundImage: `url(${currentCreative.poster})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-amber-400/20 border-2 border-amber-400/60 flex items-center justify-center animate-pulse">
                <Tv className="w-10 h-10 text-amber-300" />
              </div>
            </div>
          </div>
        )}

        {/* Center Dynamic Brand & Sponsor Watermark */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none z-10">
          <div className="max-w-md space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              {currentCreative.sponsor}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-200 font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              {currentCreative.tagline}
            </p>
            <div className="pt-1">
              <span className="inline-block text-xs font-mono text-amber-300 font-bold bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/40 shadow-lg">
                {currentCreative.rating}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Bottom Progress Bar */}
      <div className="w-full bg-zinc-900 h-1.5 relative z-30">
        <div
          className={`h-full transition-all duration-100 ease-linear ${
            isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Bottom Floating Interactive Call to Action Bar */}
      <div className="relative z-30 p-3.5 sm:p-5 bg-gradient-to-t from-black via-black/95 to-black/80 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-left leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">{currentCreative.sponsor}</span>
              {betNumbers.length > 0 && (
                <span className="text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded">
                  #{betNumbers.join(', ')}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isProcessingFirebase || isCompleted
                ? '✅ Reward Unlocked! Placing your ₹10 bet in Firebase...'
                : `Watching Ad (${countdown}s). Free ₹10 bet auto-placed on completion.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-zinc-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>{currentCreative.actionText}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

