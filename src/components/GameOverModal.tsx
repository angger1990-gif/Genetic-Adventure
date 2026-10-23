import React from 'react';
import { Skull, RotateCcw, Home } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GameOverModalProps {
  onRetry: () => void;
  onReturnToHub: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRetry, onReturnToHub }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-rose-600/60 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col items-center text-center">
        <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-rose-500 mb-3 animate-pulse">
          <Skull className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-black text-rose-400">STABILITAS SEL HANCUR!</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Energi kehidupan peneliti telah habis akibat paparan mutasi tak terkontrol di arena pertempuran.
        </p>

        <div className="my-4 p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 leading-relaxed text-left">
          <strong className="text-sky-300">💡 Tips Riset:</strong> Gunakan{' '}
          <strong className="text-cyan-300">Genetic Shield</strong> untuk menolak serangan boss atau beli{' '}
          <strong className="text-rose-300">Life Cell</strong> di inventaris sebelum memulai pertarungan!
        </div>

        <div className="flex flex-col gap-2 w-full mt-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onRetry();
            }}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 font-bold text-sm text-white rounded-xl shadow-lg transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Coba Lagi (Pulihkan HP)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onReturnToHub();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Hub</span>
          </button>
        </div>
      </div>
    </div>
  );
};
