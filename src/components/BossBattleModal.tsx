import React, { useState, useEffect } from 'react';
import { Swords, Zap, Shield, Sparkles } from 'lucide-react';
import { BossInfo, Question, PlayerStats } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface BossBattleModalProps {
  boss: BossInfo;
  levelQuestions: Question[];
  stats: PlayerStats;
  onPlayerTakeDamage: () => void;
  onBossDefeated: (rewardXp: number, rewardCoins: number, crystalReward: number) => void;
  onClose: () => void;
  onUseItem?: (itemKey: 'geneticShield' | 'timeFreeze') => void;
  onConsumeEnergy?: (amount: number) => boolean;
}

export const BossBattleModal: React.FC<BossBattleModalProps> = ({
  boss,
  levelQuestions,
  stats,
  onPlayerTakeDamage,
  onBossDefeated,
  onUseItem,
  onConsumeEnergy,
}) => {
  const [bossHp, setBossHp] = useState(boss.hp);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [isFrozen, setIsFrozen] = useState(false);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [battleLog, setBattleLog] = useState<string>(
    `${boss.name} muncul dengan aura kekacauan genetik!`
  );
  const [isAttacking, setIsAttacking] = useState(false);
  const [lastDamage, setLastDamage] = useState<number | null>(null);

  const currentQ = levelQuestions[questionIdx % levelQuestions.length];

  // Turn timer
  useEffect(() => {
    if (bossHp <= 0 || isFrozen) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          triggerBossAttack();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [bossHp, isFrozen, stats.activeShield]);

  const triggerBossAttack = () => {
    if (stats.activeShield) {
      soundManager.playShieldBlock();
      setBattleLog(`🛡️ Genetic Shield menangkis serangan mematikan ${boss.name}!`);
      if (onUseItem) onUseItem('geneticShield');
    } else {
      soundManager.playBossAttack();
      setBattleLog(`💥 ${boss.name} melancarkan serangan mutasi! Kamu kehilangan 1 HP!`);
      onPlayerTakeDamage();
    }
  };

  const applyDamageToBoss = (damage: number) => {
    setIsAttacking(true);
    setLastDamage(damage);
    setTimeout(() => {
      setLastDamage(null);
      setIsAttacking(false);
    }, 800);

    const nextHp = Math.max(0, bossHp - damage);
    setBossHp(nextHp);

    // Multi-phase check for Mendel Chaos (Level 6)
    if (boss.name.includes('Mendel Chaos')) {
      if (nextHp <= 1000 && currentPhase === 1) {
        setCurrentPhase(2);
        setBattleLog('⚠️ FASE 2: Mendel Chaos berubah wujud! Mutasi semakin agresif!');
      } else if (nextHp <= 400 && currentPhase === 2) {
        setCurrentPhase(3);
        setBattleLog('🔥 FASE 3 PAMUNGKAS: Mendel Chaos mengamuk dalam rekombinasi total!');
      }
    }

    if (nextHp <= 0) {
      soundManager.playFanfare();
      setBattleLog(`🏆 ${boss.name} BERHASIL DIKALAHKAN! Kristal Genetik diperoleh!`);
      setTimeout(() => {
        onBossDefeated(boss.rewardXp, boss.rewardCoins, boss.crystalReward);
      }, 1200);
    }
  };

  const handleAnswerSubmit = () => {
    if (!selectedOption || isAttacking || !currentQ) return;

    if (selectedOption === currentQ.answer) {
      soundManager.playCorrect();
      const dmg = 180 + stats.combo * 20;
      applyDamageToBoss(dmg);
      setBattleLog(`✨ Jawaban tepat! Kamu meluncurkan Sinar Segregasi sebesar ${dmg} damage!`);
    } else {
      soundManager.playWrong();
      setBattleLog(`❌ Jawaban keliru! ${boss.name} memanfaatkan celah untuk menyerang!`);
      triggerBossAttack();
    }

    setSelectedOption(null);
    setQuestionIdx((prev) => prev + 1);
  };

  const handleUseEnergyBlast = () => {
    if (stats.energy < 3 || isAttacking) return;
    if (onConsumeEnergy && !onConsumeEnergy(3)) return;

    soundManager.playLaserShoot();
    applyDamageToBoss(320);
    setBattleLog('⚡ LEDAKAN ENERGI GENETIK! 320 damage telak ke Boss!');
  };

  const handleUseShield = () => {
    if (stats.items.geneticShield <= 0 || stats.activeShield) return;
    soundManager.playShieldBlock();
    if (onUseItem) onUseItem('geneticShield');
    setBattleLog('🛡️ Genetic Shield diaktifkan! Serangan boss berikutnya akan dinetralisir.');
  };

  const handleUseTimeFreeze = () => {
    if (stats.items.timeFreeze <= 0 || isFrozen) return;
    soundManager.playEnergyShimmer();
    if (onUseItem) onUseItem('timeFreeze');
    setIsFrozen(true);
    setBattleLog('❄️ Waktu dibekukan selama 10 detik!');
    setTimeout(() => {
      setIsFrozen(false);
      setBattleLog('⏱️ Efek pembekuan waktu telah habis.');
    }, 10000);
  };

  const hpPercent = Math.round((bossHp / boss.maxHp) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-rose-500/50 rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-rose-400">
                ARENA PERTARUNGAN GENETIKA 3D
              </h3>
              <p className="text-xs text-slate-400">Kalahkan Boss dengan Sains Pewarisan Sifat</p>
            </div>
          </div>

          {/* Turn Countdown */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-rose-900/50">
            <span className="text-xs text-slate-400 font-medium">Serangan Boss:</span>
            <span
              className={`font-mono font-bold text-sm ${
                isFrozen
                  ? 'text-sky-400'
                  : timerSeconds <= 5
                  ? 'text-rose-500 animate-pulse'
                  : 'text-amber-400'
              }`}
            >
              {isFrozen ? 'BEKU ❄️' : `${timerSeconds}s`}
            </span>
          </div>
        </div>

        {/* 3D Boss Stage Hologram */}
        <div className="relative flex flex-col items-center justify-center p-4 bg-gradient-to-b from-rose-950/20 to-slate-950 rounded-2xl border border-rose-950/60 my-2">
          {lastDamage !== null && (
            <div className="absolute top-4 font-black text-2xl sm:text-3xl text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-bounce z-20">
              -{lastDamage} DMG!
            </div>
          )}

          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-5xl shadow-2xl transition-transform duration-300 ${
              isAttacking
                ? 'bg-rose-600/30 border-2 border-rose-500 scale-95'
                : 'bg-rose-950/40 border-2 border-rose-700/60 scale-100'
            }`}
          >
            {boss.avatarEmoji}
          </div>

          <div className="text-center mt-3 w-full max-w-md">
            <div className="flex items-center justify-center gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-100">{boss.name}</span>
              {currentPhase > 1 && (
                <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-600 px-2 py-0.5 rounded-full font-bold uppercase">
                  Fase {currentPhase}
                </span>
              )}
            </div>

            {/* Boss HP Bar */}
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden mt-1.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-rose-600 to-red-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
              <span>HP Boss</span>
              <span>
                {bossHp} / {boss.maxHp} ({hpPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Battle Log Message */}
        <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono my-2 text-center">
          {battleLog}
        </div>

        {/* Question Challenge Card */}
        {bossHp > 0 && currentQ && (
          <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl my-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-400">
                Jawab Soal Genetika untuk Menyerang Boss:
              </span>
              <span className="text-xs font-mono text-amber-400">+180 Damage</span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-100 mb-3">{currentQ.question}</p>

            {currentQ.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedOption(opt);
                    }}
                    className={`text-left p-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                      selectedOption === opt
                        ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 flex justify-end">
              <button
                onClick={handleAnswerSubmit}
                disabled={!selectedOption || isAttacking}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:bg-slate-800 disabled:text-slate-600 font-bold text-xs sm:text-sm text-white rounded-xl shadow-lg transition cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>Serang dengan Jawaban</span>
              </button>
            </div>
          </div>
        )}

        {/* Combat Action Buttons & Items */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/60 rounded-2xl border border-slate-800 mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleUseEnergyBlast}
              disabled={stats.energy < 3 || isAttacking}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                stats.energy >= 3 ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md' : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
              title="Gunakan 3 Energi Genetik untuk Sinar Laser 320 Damage"
            >
              <Zap className="w-4 h-4" />
              <span>Sinar Genetik (3 ⚡)</span>
            </button>

            <button
              onClick={handleUseShield}
              disabled={stats.items.geneticShield <= 0 || stats.activeShield}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                stats.items.geneticShield > 0 && !stats.activeShield
                  ? 'bg-cyan-900 hover:bg-cyan-800 text-cyan-200 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Shield ({stats.items.geneticShield})</span>
            </button>

            <button
              onClick={handleUseTimeFreeze}
              disabled={stats.items.timeFreeze <= 0 || isFrozen}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                stats.items.timeFreeze > 0 && !isFrozen
                  ? 'bg-indigo-900 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Freeze 10s ({stats.items.timeFreeze})</span>
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Player HP:{' '}
            <span className="font-bold text-rose-400 font-mono text-sm">
              {stats.hp} / {stats.maxHp}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
