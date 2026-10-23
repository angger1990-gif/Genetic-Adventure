import React from 'react';
import { Trophy, Sparkles, Award } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface VictoryScreenProps {
  onOpenReport: () => void;
  onReturnToHub: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({ onOpenReport, onReturnToHub }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/60 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 flex flex-col items-center text-center">
        <div className="p-4 bg-gradient-to-tr from-amber-500/20 to-yellow-500/30 border border-amber-400/50 rounded-3xl text-amber-400 mb-3 shadow-xl shadow-amber-950/50 animate-bounce">
          <Trophy className="w-12 h-12" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold tracking-widest uppercase mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MISI AGUNG TELAH SELESAI</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 mt-1">
          SELAMAT! KAMU RESMI MENJADI MENDEL MASTER 3D!
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          Mendel Chaos berhasil dinetralisir dan seluruh 6 Kristal Genetik telah menyatu sempurna di dalam reaktor 3D. Kini hukum pewarisan sifat Gregor Johann Mendel tegak abadi!
        </p>

        <div className="flex items-center justify-center gap-2 my-5 p-3 bg-slate-950 rounded-2xl border border-slate-800">
          {[1, 2, 3, 4, 5, 6].map((k) => (
            <div
              key={k}
              className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-xl shadow-md"
              title={`Kristal Genetik ${k}`}
            >
              💎
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={() => {
              soundManager.playFanfare();
              onOpenReport();
            }}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 font-bold text-sm text-slate-950 rounded-xl shadow-xl shadow-amber-500/30 transition active:scale-98 cursor-pointer"
          >
            <span>Buka Sertifikat & Rapor Belajar</span>
            <Award className="w-4 h-4 text-slate-950" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onReturnToHub();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <span>Kembali ke Genetic Hub</span>
          </button>
        </div>
      </div>
    </div>
  );
};
