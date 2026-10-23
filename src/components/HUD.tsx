import React from 'react';
import { Heart, Zap, Coins, Award, Shield, Package, Pause, FlaskConical, Swords, Lock, Sparkles } from 'lucide-react';
import { PlayerStats } from '../types/game';

interface HUDProps {
  stats: PlayerStats;
  currentLevelId: number;
  currentLevelName: string;
  isBossReady: boolean;
  tasksCompleted: number;
  totalTasks: number;
  onPause: () => void;
  onOpenInventory: () => void;
  onOpenPracticum: () => void;
  onOpenMissions: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  currentLevelId,
  currentLevelName,
  isBossReady,
  tasksCompleted,
  totalTasks,
  onPause,
  onOpenInventory,
  onOpenPracticum,
  onOpenMissions,
}) => {
  const currentXpInLevel = stats.xp % 1000;
  const xpPercent = Math.min(100, Math.round((currentXpInLevel / 1000) * 100));
  const isPracticumDone = !!stats.practicumCompleted?.[currentLevelId];

  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-2 sm:p-4 pointer-events-none select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Player Info & Health */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/95 border border-sky-500/30 rounded-2xl px-3.5 py-2 pointer-events-auto shadow-xl shadow-slate-950/50">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-slate-100 tracking-wide">
                {stats.name || 'Peneliti Muda'}
              </span>
              <span className="text-[10px] sm:text-xs bg-sky-500/20 text-sky-300 font-semibold px-2 py-0.5 rounded-lg border border-sky-500/30">
                Lv. {currentLevelId}
              </span>
              {stats.activeShield && (
                <span className="flex items-center text-[10px] text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-lg border border-cyan-400/50">
                  <Shield className="w-3 h-3 mr-1" /> Shield
                </span>
              )}
            </div>

            {/* Health Hearts */}
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: stats.maxHp }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                    i < stats.hp
                      ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* XP Bar */}
          <div className="hidden md:flex flex-col w-28 pl-3 border-l border-slate-700/80">
            <div className="flex justify-between text-[10px] text-slate-300 font-mono">
              <span>XP</span>
              <span>{currentXpInLevel}/1000</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Level Title & Combo */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-2 pointer-events-auto shadow-md">
          <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">{currentLevelName}</span>
          {stats.combo >= 2 && (
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded-full text-xs font-bold animate-bounce">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{stats.combo}x COMBO!</span>
            </div>
          )}
        </div>

        {/* Right: Resources, Boss Readiness, Inventory & Pause */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Energy */}
          <div
            className="flex items-center gap-1.5 bg-slate-900/95 border border-amber-500/40 rounded-xl px-2.5 py-1.5 shadow-md"
            title="Energi Genetik untuk Sinar Laser"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-mono font-bold text-xs sm:text-sm text-amber-300">{stats.energy}</span>
          </div>

          {/* DNA Coins */}
          <div
            className="flex items-center gap-1.5 bg-slate-900/95 border border-emerald-500/40 rounded-xl px-2.5 py-1.5 shadow-md"
            title="DNA Koin untuk beli item"
          >
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-bold text-xs sm:text-sm text-emerald-300">{stats.coins}</span>
          </div>

          {/* Crystals */}
          <div
            className="hidden lg:flex items-center gap-1.5 bg-slate-900/95 border border-indigo-500/40 rounded-xl px-2.5 py-1.5 shadow-md"
            title="Kristal Genetik Mendel yang telah dipulihkan"
          >
            <Award className="w-4 h-4 text-indigo-400" />
            <span className="font-mono font-bold text-xs text-indigo-300">{stats.crystals.length}/6</span>
          </div>

          {/* Missions / Boss Portal Status */}
          <button
            onClick={onOpenMissions}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition active:scale-95 cursor-pointer shadow ${
              isBossReady
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 border-amber-400 text-white shadow-amber-500/30'
                : 'bg-slate-900/95 hover:bg-slate-800 border-rose-500/40 text-slate-200'
            }`}
            title="Daftar Misi & Syarat Melawan Boss"
          >
            {isBossReady ? (
              <>
                <Swords className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Boss Siap!</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">
                  Misi Boss: {tasksCompleted}/{totalTasks}
                </span>
              </>
            )}
          </button>

          {/* Practicum Button */}
          <button
            onClick={onOpenPracticum}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition active:scale-95 cursor-pointer shadow ${
              isPracticumDone
                ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/50 text-emerald-300'
                : 'bg-sky-900/90 hover:bg-sky-800 border-sky-400 text-sky-200'
            }`}
            title="Praktikum Virtual Laboratorium (Wajib)"
          >
            <FlaskConical className="w-4 h-4 text-sky-300" />
            <span className="hidden sm:inline">{isPracticumDone ? 'Praktikum ✓' : 'Praktikum (Wajib)'}</span>
          </button>

          {/* Inventory Button */}
          <button
            onClick={onOpenInventory}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 rounded-xl text-slate-200 transition cursor-pointer shadow"
            title="Buka Inventaris Item"
          >
            <Package className="w-4 h-4" />
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 rounded-xl text-slate-200 transition cursor-pointer shadow"
            title="Jeda Petualangan (Esc)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
