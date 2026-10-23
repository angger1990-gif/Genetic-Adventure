import React from 'react';
import { ArrowLeft, BookOpen, Trophy, UserCheck, Package, Play, Lock, Star } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { LEVELS } from '../data/gameData';
import { soundManager } from '../audio/soundManager';

interface HubMenuProps {
  stats: PlayerStats;
  onEnterLevel: (levelId: number) => void;
  onOpenAchievements: () => void;
  onOpenInventory: () => void;
  onOpenLibrary: () => void;
  onOpenProfile: () => void;
  onBackToMenu: () => void;
  onEditStudent?: () => void;
}

export const HubMenu: React.FC<HubMenuProps> = ({
  stats,
  onEnterLevel,
  onOpenAchievements,
  onOpenInventory,
  onOpenLibrary,
  onOpenProfile,
  onBackToMenu,
  onEditStudent,
}) => {
  return (
    <div className="relative w-full h-full min-h-[540px] flex flex-col justify-between p-4 sm:p-6 bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onBackToMenu();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Menu Utama</span>
          </button>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">
              GENETIC HUB 3D
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-400">Pilih Portal Laboratorium Penelitian Sifat</p>
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-sky-500/30 rounded-lg px-2 py-0.5 text-[11px]">
                <span className="text-slate-400">Siswa:</span>
                <span className="font-bold text-sky-300">{stats.name || 'Peneliti'}</span>
                {stats.schoolClass && (
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1 rounded">
                    {stats.schoolClass}
                  </span>
                )}
                {onEditStudent && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onEditStudent();
                    }}
                    className="text-[10px] text-sky-400 hover:text-sky-200 underline cursor-pointer ml-1"
                  >
                    Ganti
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenLibrary();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-medium text-sky-300 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Perpustakaan</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAchievements();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-medium text-amber-300 transition cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prestasi</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenProfile();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-medium text-emerald-300 transition cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rapor Belajar</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenInventory();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900/60 hover:bg-indigo-800/70 border border-indigo-500/40 rounded-xl text-xs font-medium text-indigo-200 transition cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inventaris</span>
          </button>
        </div>
      </div>

      {/* Level Portals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 my-4">
        {LEVELS.map((level) => {
          const isUnlocked = stats.unlockedLevels.includes(level.id);
          const isCompleted = stats.completedLevels.includes(level.id);
          const stars = stats.levelStars[level.id] || 0;
          const hasCrystal = stats.crystals.includes(level.crystalId);
          const isPracticumDone = !!stats.practicumCompleted?.[level.id];

          return (
            <div
              key={level.id}
              className={`relative flex flex-col justify-between p-4 rounded-3xl border transition-all duration-300 ${
                isUnlocked
                  ? 'bg-slate-900/90 border-sky-500/30 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-950/50'
                  : 'bg-slate-950/60 border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold bg-sky-950/80 px-2 py-0.5 rounded-lg border border-sky-800/50">
                    LEVEL {level.id}
                  </span>

                  {isCompleted && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>{level.name}</span>
                  {hasCrystal && (
                    <span className="text-xs text-cyan-300 bg-cyan-950 border border-cyan-500/40 px-1.5 py-0.5 rounded font-mono">
                      💎 Crystal {level.crystalId}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-sky-300/80 font-medium">{level.subtitle}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{level.description}</p>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  {isPracticumDone ? (
                    <span className="text-emerald-300 font-medium flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                      🔬 Praktikum ✓
                    </span>
                  ) : (
                    <span className="text-amber-300 font-medium flex items-center gap-1 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                      🔬 Praktikum (Wajib)
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-500">Boss:</span>{' '}
                  <span className="text-rose-400 font-semibold">{level.bossName}</span>
                </div>

                {isUnlocked ? (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onEnterLevel(level.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/30 active:scale-95 transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isCompleted ? 'Masuk Lab 3D' : 'Jelajahi 3D'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Terkunci (Selesaikan Lv {level.id - 1})</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>
            Pemain: <strong className="text-slate-200">{stats.name || 'Siswa'}</strong>
          </span>
          <span>
            Kristal Genetik:{' '}
            <strong className="text-cyan-400 font-mono">{stats.crystals.length}/6</strong>
          </span>
          <span>
            Level Selesai:{' '}
            <strong className="text-sky-400 font-mono">{stats.completedLevels.length}/6</strong>
          </span>
        </div>

        <div className="text-slate-500 text-[11px]">
          Karya: Reni Istiningrum — Guru IPA SMPN 1 Pagu
        </div>
      </div>
    </div>
  );
};
