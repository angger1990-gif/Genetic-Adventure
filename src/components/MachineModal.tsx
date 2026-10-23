import React, { useState } from 'react';
import { Settings, Zap, Split, GitMerge, CheckCircle2, Sparkles, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface MachineModalProps {
  machineType: 'segregasi' | 'asortasi';
  onCompleted: (earnedXp: number, earnedEnergy: number) => void;
  onClose: () => void;
}

export const MachineModal: React.FC<MachineModalProps> = ({
  machineType,
  onCompleted,
  onClose,
}) => {
  const [segParent] = useState('Aa');
  const [segCompleted, setSegCompleted] = useState(false);
  const [segPulling, setSegPulling] = useState(false);

  const [asortParent] = useState('AaBb');
  const [asortGametes, setAsortGametes] = useState<string[]>([]);
  const [asortCompleted, setAsortCompleted] = useState(false);

  const handlePullSegregasiLever = () => {
    soundManager.playLaserShoot();
    setSegPulling(true);
    setTimeout(() => {
      setSegCompleted(true);
      soundManager.playFanfare();
      onCompleted(300, 3);
    }, 600);
  };

  const handleSpinAsortasi = () => {
    soundManager.playLaserShoot();
    const a1 = asortParent[0];
    const a2 = asortParent[1];
    const b1 = asortParent[2];
    const b2 = asortParent[3];
    const list = [`${a1}${b1}`, `${a1}${b2}`, `${a2}${b1}`, `${a2}${b2}`];
    setAsortGametes(list);
    setAsortCompleted(true);
    soundManager.playFanfare();
    onCompleted(400, 4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/50 rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400 animate-spin" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-indigo-300">
                {machineType === 'segregasi'
                  ? 'MESIN I — REAKTOR HUKUM SEGREGASI (MENDEL I)'
                  : 'MESIN II — DISTRIBUTOR ASORTASI BEBAS (MENDEL II)'}
              </h3>
              <p className="text-xs text-slate-400">
                {machineType === 'segregasi'
                  ? 'Pemisahan Pasangan Alel Secara Bebas Pada Pembentukan Gamet'
                  : 'Pengelompokan Bebas Gen-Gen yang Berada Pada Kromosom Berbeda'}
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

        {/* Machine 1: Segregasi */}
        {machineType === 'segregasi' && (
          <div className="flex flex-col items-center my-3">
            <p className="text-xs text-slate-300 text-center max-w-lg mb-4 leading-relaxed">
              "Pada pembentukan sel gamet (meiosis), pasangan alel dari suatu gen akan mengalami{' '}
              <strong className="text-sky-300">pemisahan (segregasi)</strong> secara bebas, sehingga setiap sel gamet hanya membawa satu alel dari pasangannya."
            </p>

            <div className="relative w-full max-w-md p-6 bg-slate-950 rounded-2xl border border-sky-500/40 flex flex-col items-center">
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-400 mb-1">Sel Induk Diploid (2n)</span>
                <div className="flex items-center justify-center gap-3 p-3 bg-slate-800 rounded-2xl border border-sky-400 shadow-lg">
                  <span className="text-3xl font-black font-mono text-sky-400">{segParent[0]}</span>
                  <div className="w-0.5 h-8 bg-slate-600" />
                  <span className="text-3xl font-black font-mono text-amber-400">{segParent[1]}</span>
                </div>
              </div>

              <div className="my-4 flex flex-col items-center">
                <div className={`w-1 h-8 bg-sky-500 transition-all ${segPulling ? 'scale-y-125' : ''}`} />
                <Split className="w-6 h-6 text-sky-400 my-1 animate-pulse" />
                <div className={`w-1 h-8 bg-sky-500 transition-all ${segPulling ? 'scale-y-125' : ''}`} />
              </div>

              <div className="flex items-center justify-center gap-8 w-full">
                <div
                  className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-500 ${
                    segCompleted ? 'bg-sky-950/60 border-sky-500 shadow-lg scale-105' : 'bg-slate-900 border-slate-700 opacity-40'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 mb-1">Gamet 1 (n)</span>
                  <span className="text-3xl font-black font-mono text-sky-300">
                    {segCompleted ? segParent[0] : '?'}
                  </span>
                  <span className="text-[10px] text-sky-400 mt-1 font-mono">Peluang: 50%</span>
                </div>

                <div
                  className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-500 ${
                    segCompleted ? 'bg-amber-950/60 border-amber-500 shadow-lg scale-105' : 'bg-slate-900 border-slate-700 opacity-40'
                  }`}
                >
                  <span className="text-[10px] text-slate-400 mb-1">Gamet 2 (n)</span>
                  <span className="text-3xl font-black font-mono text-amber-300">
                    {segCompleted ? segParent[1] : '?'}
                  </span>
                  <span className="text-[10px] text-amber-400 mt-1 font-mono">Peluang: 50%</span>
                </div>
              </div>
            </div>

            {segCompleted ? (
              <div className="mt-4 flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Hukum Mendel I Terbukti Berhasil! +300 XP</span>
              </div>
            ) : (
              <button
                onClick={handlePullSegregasiLever}
                disabled={segPulling}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Tarik Tuas Segregasi Meiosis</span>
              </button>
            )}
          </div>
        )}

        {/* Machine 2: Asortasi */}
        {machineType === 'asortasi' && (
          <div className="flex flex-col items-center my-3">
            <p className="text-xs text-slate-300 text-center max-w-lg mb-4 leading-relaxed">
              "Bila dua individu berbeda dalam dua pasang sifat atau lebih, maka pewarisan dari setiap pasangan gen{' '}
              <strong className="text-amber-300">tidak saling bergantung (asortasi bebas)</strong> pada pewarisan pasangan gen lainnya."
            </p>

            <div className="relative w-full max-w-lg p-6 bg-slate-950 rounded-2xl border border-indigo-500/40 flex flex-col items-center">
              <div className="flex flex-col items-center mb-4">
                <span className="text-xs text-slate-400 mb-1">Genotip Induk Dihibrid (Heterozigot Sempurna)</span>
                <div className="p-3 bg-slate-800 rounded-xl border border-indigo-400 font-mono text-2xl font-black tracking-widest text-indigo-300">
                  {asortParent}
                </div>
              </div>

              <div className="my-2 text-indigo-400 flex items-center gap-2">
                <GitMerge className="w-5 h-5 animate-bounce" />
                <span className="text-xs font-semibold">4 Jalur Kombinasi Independen:</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mt-2">
                {['AB', 'Ab', 'aB', 'ab'].map((g, idx) => {
                  const isReady = asortCompleted && asortGametes.includes(g);
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center p-3 rounded-xl border transition-all duration-300 ${
                        isReady ? 'bg-indigo-950/70 border-indigo-400 shadow-md' : 'bg-slate-900 border-slate-800 opacity-40'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400">Gamet {idx + 1}</span>
                      <span className="text-2xl font-black font-mono text-cyan-300 my-1">
                        {isReady ? g : '??'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">1/4 (25%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {asortCompleted ? (
              <div className="mt-4 flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Hukum Mendel II Terkonfirmasi! +400 XP</span>
              </div>
            ) : (
              <button
                onClick={handleSpinAsortasi}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Putar Distributor Asortasi Bebas</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
