import React from 'react';
import { Play, RotateCcw, Map, Trophy, BookOpen, Settings, Users, Dna, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface MainMenuProps {
  hasSaveData: boolean;
  playerName: string;
  onStartNew: () => void;
  onContinue: () => void;
  onSelectLevel: () => void;
  onAchievements: () => void;
  onGuide: () => void;
  onSettings: () => void;
  onCredits: () => void;
  onRegisterPlayer: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  hasSaveData,
  playerName,
  onStartNew,
  onContinue,
  onSelectLevel,
  onAchievements,
  onGuide,
  onSettings,
  onCredits,
  onRegisterPlayer,
}) => {
  const trigger = (action: () => void) => {
    soundManager.playClick();
    action();
  };

  const handleStart = () => {
    trigger(!playerName ? onRegisterPlayer : onStartNew);
  };

  return (
    <div className="relative w-full h-full min-h-[540px] flex flex-col items-center justify-between p-4 sm:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 overflow-y-auto">
      {/* Background ambient blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-sky-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-600 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Title & Branding */}
      <div className="relative z-10 text-center mt-2 sm:mt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs font-semibold tracking-wider mb-2">
          <Dna className="w-4 h-4 animate-spin" />
          <span>GAME EDUKASI IPA SMP 3D — PEWARISAN SIFAT</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-200 to-indigo-300 drop-shadow-md">
          GENETIC ADVENTURE 3D
        </h1>

        <p className="text-sm sm:text-lg font-medium text-slate-300 tracking-wide mt-1 flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Misi Menjadi Mendel Master</span>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </p>

        <div className="mt-2 inline-block text-xs sm:text-sm text-slate-400 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700">
          Karya: <span className="text-sky-300 font-bold">Reni Istiningrum</span> — Guru IPA SMPN 1 Pagu
        </div>
      </div>

      {/* Main Buttons */}
      <div className="relative z-10 w-full max-w-sm flex flex-col gap-2.5 my-4">
        {/* Student Identity Card */}
        <div className="flex items-center justify-between p-2.5 bg-slate-900/95 border border-sky-500/30 rounded-2xl text-xs shadow">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-xl">
              👨‍🔬
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400">Identitas Siswa:</div>
              <div className="font-bold text-sky-200 truncate max-w-[170px]">
                {playerName || 'Belum Registrasi Nama'}
              </div>
            </div>
          </div>

          <button
            onClick={() => trigger(onRegisterPlayer)}
            className="text-xs font-semibold px-2.5 py-1 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/40 rounded-xl transition cursor-pointer"
          >
            {playerName ? 'Ganti Siswa' : 'Input Nama'}
          </button>
        </div>

        {/* Primary Play Button */}
        <button
          onClick={handleStart}
          className="group relative flex items-center justify-center gap-3 w-full py-3.5 px-6 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-sky-600/30 active:scale-98 transition cursor-pointer border border-sky-300/40"
        >
          <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
          <span>MULAI PETUALANGAN 3D</span>
        </button>

        {/* Continue Button */}
        <button
          onClick={() => trigger(onContinue)}
          disabled={!hasSaveData}
          className={`flex items-center justify-center gap-3 w-full py-3 px-6 font-bold text-sm sm:text-base rounded-2xl border transition cursor-pointer ${
            hasSaveData
              ? 'bg-slate-800/90 hover:bg-slate-700/90 text-sky-300 border-sky-500/40 active:scale-98 shadow'
              : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>LANJUTKAN PETUALANGAN</span>
        </button>

        {/* Sub-menu Grid */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={() => trigger(onSelectLevel)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 active:scale-98 transition cursor-pointer"
          >
            <Map className="w-4 h-4 text-sky-400" />
            <span>Pilih Level</span>
          </button>

          <button
            onClick={() => trigger(onAchievements)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 active:scale-98 transition cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Prestasi</span>
          </button>

          <button
            onClick={() => trigger(onGuide)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 active:scale-98 transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Panduan</span>
          </button>

          <button
            onClick={() => trigger(onSettings)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 active:scale-98 transition cursor-pointer"
          >
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Pengaturan</span>
          </button>
        </div>

        {/* Credits Button */}
        <button
          onClick={() => trigger(onCredits)}
          className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-900/60 hover:bg-slate-800/70 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-xl border border-slate-800 transition cursor-pointer mt-1"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Kredit Pengembang</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 text-center text-[11px] text-slate-500 pb-1">
        <p>Hukum Mendel I (Segregasi) & Hukum Mendel II (Asortasi Bebas) • 100% Offline</p>
        <p className="text-slate-600 mt-0.5">SMP Negeri 1 Pagu, Kediri</p>
      </div>
    </div>
  );
};
