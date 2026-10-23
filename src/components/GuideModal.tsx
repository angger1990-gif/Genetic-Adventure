import React from 'react';
import { BookOpen, Gamepad2, Table, Zap, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                PANDUAN RISET & PETUNJUK BERMAIN 3D
              </h3>
              <p className="text-xs text-slate-400">
                Cara menjelajahi laboratorium 3D dan menjadi Mendel Master
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

        <div className="flex flex-col gap-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Controls */}
          <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-sky-400 flex items-center gap-2 mb-2">
              <Gamepad2 className="w-4 h-4" />
              <span>Kontrol Pergerakan 3D & Navigasi</span>
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <strong className="text-slate-100">[W] [A] [S] [D] / Tombol Panah:</strong> Menggerakkan karakter peneliti muda di laboratorium 3D secara bebas dengan animasi langkah kaki dan putaran arah halus.
              </li>
              <li>
                <strong className="text-slate-100">[E] / Tombol Sentuh INTERAKSI:</strong> Mengakses Meja Praktikum, Konsol Soal Kuis A & B, Terminal Punnett Square, Kapsul Suplai, dan Pintu Gerbang Boss.
              </li>
              <li>
                <strong className="text-slate-100">[I] / Ikon Inventaris:</strong> Membuka tas perlengkapan dan toko DNA Koin.
              </li>
              <li>
                <strong className="text-slate-100">[C] / Dock Kamera:</strong> Mengubah sudut pandang kamera 3D (Orang Ke-3, Dekat, Top-Down, atau Isometrik).
              </li>
              <li>
                <strong className="text-slate-100">Pengguna Layar Sentuh (HP / Tablet):</strong> D-Pad 3D dan tombol virtual interaksi tersedia otomatis di layar.
              </li>
            </ul>
          </div>

          {/* Punnett & Boss */}
          <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-amber-400 flex items-center gap-2 mb-2">
              <Table className="w-4 h-4" />
              <span>Papan Catur Punnett 3D & Pertarungan Boss</span>
            </h4>
            <p className="text-xs mb-2">
              Di setiap laboratorium 3D, kamu akan menemukan Terminal Punnett Square interaktif. Tentukan kombinasi alel gamet jantan dan betina untuk menghitung rasio fenotip (seperti 3:1 pada monohibrid atau 9:3:3:1 pada dihibrid).
            </p>
            <p className="text-xs">
              Pada pertarungan Boss (misal Gene Goblin King hingga Mendel Chaos), jawab soal kuis genetika dengan cepat dan tepat sebelum timer habis untuk menembakkan laser genetik dan menguras HP Boss!
            </p>
          </div>

          {/* Scientific Items */}
          <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4" />
              <span>Item Bantuan Ilmiah</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900/80 rounded-xl">
                <strong className="text-amber-300">Gene Scanner:</strong> Menampilkan petunjuk ilmiah tanpa membocorkan jawaban langsung.
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl">
                <strong className="text-rose-300">Life Cell:</strong> Memulihkan 1 HP (nyawa) seketika.
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl">
                <strong className="text-cyan-300">Genetic Shield:</strong> Menangkis 1 kali serangan mutasi Boss.
              </div>
              <div className="p-2.5 bg-slate-900/80 rounded-xl">
                <strong className="text-indigo-300">Time Freeze:</strong> Membekukan timer serangan Boss selama 10 detik.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
