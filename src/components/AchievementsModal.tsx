import React from 'react';
import { Trophy, Dna, Flower, Grid3X3, Search, BarChart3, Award, Star, Shield, Zap, CheckCircle2, Lock, X } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { ACHIEVEMENTS, LEVELS } from '../data/gameData';
import { soundManager } from '../audio/soundManager';

interface AchievementsModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ stats, onClose }) => {
  const earned = new Set(stats.achievements || []);

  (stats.completedLevels || []).forEach((levelId) => {
    const levelInfo = LEVELS.find((l) => l.id === levelId);
    if (levelInfo && levelInfo.achievementId) earned.add(levelInfo.achievementId);
  });

  (stats.crystals || []).forEach((crystalId) => {
    const levelInfo = LEVELS.find((l) => l.crystalId === crystalId);
    if (levelInfo && levelInfo.achievementId) earned.add(levelInfo.achievementId);
  });

  if (earned.has('combo_master')) earned.add('ach_combo_master');
  if (earned.has('mendel_master')) earned.add('ach_mendel_master');

  const earnedCount = ACHIEVEMENTS.filter((item) => earned.has(item.id)).length;

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'dna':
        return <Dna className="w-5 h-5 text-sky-400" />;
      case 'flower':
        return <Flower className="w-5 h-5 text-emerald-400" />;
      case 'grid':
        return <Grid3X3 className="w-5 h-5 text-indigo-400" />;
      case 'search':
        return <Search className="w-5 h-5 text-purple-400" />;
      case 'bar-chart':
        return <BarChart3 className="w-5 h-5 text-amber-400" />;
      case 'award':
        return <Award className="w-5 h-5 text-yellow-400" />;
      case 'star':
        return <Star className="w-5 h-5 text-amber-400" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      default:
        return <Trophy className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                RUANG PRESTASI RISET GENETIKA 3D
              </h3>
              <p className="text-xs text-slate-400">
                Terbuka: <span className="text-amber-400 font-bold">{earnedCount}</span> dari{' '}
                {ACHIEVEMENTS.length} Gelar Prestasi
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2">
          {ACHIEVEMENTS.map((item) => {
            const isUnlocked = earned.has(item.id);
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-amber-950/30 border-amber-500/50 text-slate-100 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-500 opacity-60'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    isUnlocked ? 'bg-amber-500/20 border-amber-400/40' : 'bg-slate-900 border-slate-800 grayscale'
                  }`}
                >
                  {getAchievementIcon(item.icon)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-200">{item.title}</h4>
                    {isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                  <span className="text-[10px] font-mono text-amber-400/80 mt-1 inline-block">
                    {item.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
