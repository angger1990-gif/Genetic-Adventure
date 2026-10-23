import React from 'react';
import { Award, Star, Coins, Zap, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface LevelCompleteModalProps {
  levelId: number;
  levelName: string;
  stars: number;
  xpEarned: number;
  coinsEarned: number;
  energyEarned: number;
  crystalId?: number;
  scorePercent: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onReturnToHub: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  levelId,
  levelName,
  stars,
  xpEarned,
  coinsEarned,
  energyEarned,
  crystalId,
  scorePercent,
  onNextLevel,
  onReplay,
  onReturnToHub,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-sky-500/50 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col items-center text-center">
        <div className="inline-flex p-3 rounded-2xl bg-sky-500/20 border border-sky-400/40 text-sky-400 mb-2">
          <Award className="w-8 h-8 animate-bounce" />
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
          LEVEL {levelId} SELESAI
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 mt-0.5">{levelName}</h2>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`w-8 h-8 transition-transform duration-500 ${
                s <= stars
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] scale-110'
                  : 'text-slate-700'
              }`}
            />
          ))}
        </div>

        <div className="text-xs text-slate-300 mb-4">
          Skor Pemahaman:{' '}
          <strong className="text-sky-400 font-mono text-sm">{scorePercent}%</strong>
        </div>

        {/* Rewards */}
        <div className="grid grid-cols-3 gap-2 w-full p-3 bg-slate-950/70 rounded-2xl border border-slate-800 mb-5">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">XP</span>
            <span className="font-mono font-bold text-sm text-sky-300">+{xpEarned}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">DNA Koin</span>
            <div className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono font-bold text-sm text-emerald-300">+{coinsEarned}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-medium">Energi</span>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-bold text-sm text-amber-300">+{energyEarned}</span>
            </div>
          </div>
        </div>

        {crystalId && (
          <div className="p-3 bg-gradient-to-r from-cyan-950 to-indigo-950 border border-cyan-500/50 rounded-2xl w-full text-xs text-cyan-200 mb-5 flex items-center justify-center gap-2">
            <span className="text-xl">💎</span>
            <span>Kristal Genetik {crystalId} berhasil dipulihkan!</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-2 w-full">
          {levelId < 6 ? (
            <button
              onClick={() => {
                soundManager.playClick();
                onNextLevel();
              }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 font-bold text-sm text-white rounded-xl shadow-lg transition cursor-pointer"
            >
              <span>Lanjut ke Level {levelId + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                soundManager.playFanfare();
                onNextLevel();
              }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 font-bold text-sm text-white rounded-xl shadow-lg transition cursor-pointer"
            >
              <span>Lihat Rapor Mendel Master</span>
              <Award className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => {
                soundManager.playClick();
                onReplay();
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Main Ulang</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onReturnToHub();
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Kembali ke Hub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
