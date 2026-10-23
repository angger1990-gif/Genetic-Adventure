import React from 'react';
import { Users, School, Sparkles, Heart, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-sky-500/40 rounded-3xl shadow-2xl p-6 text-slate-100 flex flex-col text-center">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h3 className="text-base sm:text-lg font-bold text-slate-100">KREDIT PENGEMBANG</h3>
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

        <div className="p-5 bg-gradient-to-b from-sky-950/40 to-slate-950 rounded-2xl border border-sky-500/30 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg mb-3">
            <School className="w-8 h-8" />
          </div>
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
            Pengembang & Desainer Pembelajaran IPA
          </span>
          <h2 className="text-xl font-black text-slate-100 mt-1">Reni Istiningrum</h2>
          <p className="text-sm font-medium text-slate-300 mt-0.5">Guru IPA SMP Negeri 1 Pagu</p>
          <span className="text-xs text-slate-400 mt-1">Kabupaten Kediri, Jawa Timur</span>
        </div>

        <div className="mt-4 p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700 text-xs text-slate-300 text-left space-y-2 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Misi & Keunggulan Edisi 3D:</span>
          </div>
          <p>
            • Mengintegrasikan kurikulum IPA SMP materi <strong>Pewarisan Sifat Makhluk Hidup</strong> (Hukum Mendel I Segregasi & Hukum Mendel II Asortasi Bebas).
          </p>
          <p>
            • Kini dirender dalam <strong>grafis 3D Three.js</strong> dengan pencahayaan PBR realistis, karakter peneliti 3D, dan stasiun praktikum 3D interaktif.
          </p>
          <p>
            • Menggunakan <strong>Web Audio API sintesis prosedural</strong> dan 100% mandiri/luring tanpa ketergantungan koneksi internet.
          </p>
        </div>

        <div className="mt-5 text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <span>Dibuat dengan dedikasi untuk kemajuan literasi sains Indonesia</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
        </div>
      </div>
    </div>
  );
};
