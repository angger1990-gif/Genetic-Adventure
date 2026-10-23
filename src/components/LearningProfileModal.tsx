import React, { useRef } from 'react';
import { Award, Printer, Sparkles, X } from 'lucide-react';
import { PlayerStats, QuestionCategory } from '../types/game';
import { COMPETENCY_INFO } from '../data/gameData';
import { SaveSystem } from '../storage/saveSystem';
import { soundManager } from '../audio/soundManager';

interface LearningProfileModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

export const LearningProfileModal: React.FC<LearningProfileModalProps> = ({ stats, onClose }) => {
  const finalScore = SaveSystem.calculateLearningScore(stats);
  const printRef = useRef<HTMLDivElement>(null);

  const getRank = (score: number) => {
    if (score >= 90) return { label: 'MENDEL MASTER (SANGAT BAIK)', color: 'text-amber-400' };
    if (score >= 80) return { label: 'AHLI GENETIKA MUDA (BAIK)', color: 'text-emerald-400' };
    if (score >= 70) return { label: 'PENELITI BERKEMBANG (CUKUP)', color: 'text-sky-400' };
    return { label: 'PERLU PENDALAMAN MATERI', color: 'text-rose-400' };
  };

  const rank = getRank(finalScore);

  const handlePrint = () => {
    window.print();
  };

  const practicumDoneCount = Object.values(stats.practicumCompleted || {}).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm print:bg-white print:p-0">
      <div
        ref={printRef}
        className="relative w-full max-w-3xl bg-slate-900 border border-amber-500/50 rounded-3xl shadow-2xl p-5 sm:p-7 text-slate-100 flex flex-col max-h-[92vh] overflow-y-auto print:bg-white print:text-black print:border-none print:shadow-none print:max-h-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 print:border-black">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-base sm:text-xl font-black tracking-tight text-slate-100 print:text-black">
                RAPOR PROFIL BELAJAR & SERTIFIKAT MENDEL MASTER 3D
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Genetic Adventure 3D — Asesmen Kurikulum IPA SMP Pewarisan Sifat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Cetak / Simpan PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rapor</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-indigo-950/40 border border-amber-500/30 flex flex-col items-center text-center my-2 print:border-black print:bg-gray-50">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>SERTIFIKAT KELULUSAN RISET GENETIKA 3D</span>
            <Sparkles className="w-4 h-4" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-100 print:text-black mt-1">
            {stats.name || 'Siswa Peneliti'}
          </h3>

          <div className="text-xs text-slate-400 print:text-gray-700 mt-0.5 font-medium">
            {stats.schoolClass || 'Kelas IX-A'} • SMP Negeri 1 Pagu
          </div>

          <div className={`text-sm sm:text-base font-black mt-2 ${rank.color} print:text-black`}>
            Predikat: {rank.label}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-slate-300 print:text-black">
            <span>
              Skor Akhir: <strong className="text-amber-400 text-base font-mono">{finalScore}%</strong>
            </span>
            <span>
              Praktikum: <strong className="text-emerald-400 font-mono">{practicumDoneCount}/6 Lab Selesai</strong>
            </span>
            <span>
              Kristal Genetik: <strong className="text-cyan-400 font-mono">{stats.crystals.length}/6</strong>
            </span>
            <span>
              Highest Combo: <strong className="text-emerald-400 font-mono">{stats.highestCombo}x</strong>
            </span>
          </div>
        </div>

        {/* 7 Competency Breakdown */}
        <div className="my-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-3 print:text-black">
            Analisis Capaian 7 Kompetensi Inti Genetika (Bobot Kurikulum IPA SMP):
          </h4>

          <div className="flex flex-col gap-2.5">
            {(Object.keys(COMPETENCY_INFO) as QuestionCategory[]).map((cat) => {
              const info = COMPETENCY_INFO[cat];
              const total = stats.categoryTotal[cat] || 0;
              const correct = stats.categoryCorrect[cat] || 0;
              const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

              return (
                <div
                  key={cat}
                  className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 print:bg-gray-50 print:border-gray-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 text-xs mb-1">
                    <span className="font-semibold text-slate-200 print:text-black">
                      {info.name}{' '}
                      <span className="text-[10px] text-slate-400 font-mono">(Bobot: {info.weight}%)</span>
                    </span>
                    <span className="font-mono text-xs">
                      {correct} / {total} Soal ({pct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 print:border-gray-400">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Signature & Validation Footer */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 print:border-black print:text-black">
          <div>
            <p className="font-bold text-slate-300 print:text-black">SMP Negeri 1 Pagu — Laboratorium IPA</p>
            <p>Disahkan secara resmi sebagai instrumen asesmen pembelajaran.</p>
          </div>

          <div className="text-center sm:text-right">
            <p className="text-[11px] text-slate-500 print:text-slate-700">Guru Pengampu & Desainer Game:</p>
            <p className="font-bold text-sm text-sky-400 print:text-black mt-0.5">Reni Istiningrum</p>
            <p className="text-[11px] text-slate-400">Guru IPA SMPN 1 Pagu</p>
          </div>
        </div>
      </div>
    </div>
  );
};
