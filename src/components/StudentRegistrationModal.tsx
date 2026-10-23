import React, { useState } from 'react';
import { Dna, User, School, ShieldCheck, ArrowRight } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface StudentRegistrationModalProps {
  currentName?: string;
  currentClass?: string;
  currentAvatar?: 'researcher_m' | 'researcher_f';
  onSave: (name: string, schoolClass: string, avatar: 'researcher_m' | 'researcher_f') => void;
  onClose?: () => void;
}

export const StudentRegistrationModal: React.FC<StudentRegistrationModalProps> = ({
  currentName = '',
  currentClass = 'Kelas IX-A',
  currentAvatar = 'researcher_m',
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(currentName === 'Siswa Peneliti' ? '' : currentName);
  const [cls, setCls] = useState(currentClass);
  const [avatar, setAvatar] = useState<'researcher_m' | 'researcher_f'>(currentAvatar);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Silakan masukkan nama lengkapmu terlebih dahulu!');
      soundManager.playWrong();
      return;
    }
    if (cleanName.length < 2) {
      setError('Nama minimal terdiri dari 2 karakter.');
      soundManager.playWrong();
      return;
    }

    soundManager.playPowerUp();
    onSave(cleanName, cls.trim() || 'Kelas IX', avatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-sky-500/50 rounded-3xl shadow-2xl p-5 sm:p-7 text-slate-100 flex flex-col">
        <div className="flex items-center justify-center gap-2 mb-2 text-sky-400 text-xs font-semibold uppercase tracking-widest">
          <Dna className="w-4 h-4 animate-spin" />
          <span>Registrasi Peneliti Muda 3D</span>
          <Dna className="w-4 h-4 animate-spin" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-200 to-indigo-300">
          IDENTITAS PENELITI GENETIKA
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 text-center mt-1 mb-4 leading-relaxed">
          Sebelum menjelajahi laboratorium 3D Gregor Mendel, masukkan identitasmu. Data ini akan tercetak pada <strong>Rapor Belajar</strong> dan <strong>Sertifikat Mendel Master</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar choice */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Pilih Karakter Peneliti 3D:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setAvatar('researcher_m');
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition text-left cursor-pointer ${
                  avatar === 'researcher_m'
                    ? 'bg-sky-950/80 border-sky-400 text-sky-200 shadow-md shadow-sky-950/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-2xl">
                  👨‍🔬
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-100">Peneliti Putra</div>
                  <div className="text-[10px] text-slate-400">Jas Lab Biru Sains</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setAvatar('researcher_f');
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition text-left cursor-pointer ${
                  avatar === 'researcher_f'
                    ? 'bg-indigo-950/80 border-indigo-400 text-indigo-200 shadow-md shadow-indigo-950/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-2xl">
                  👩‍🔬
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-100">Peneliti Putri</div>
                  <div className="text-[10px] text-slate-400">Jas Lab Violet Sains</div>
                </div>
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">
              Nama Lengkap Siswa <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4 text-sky-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ketik nama lengkapmu di sini..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-sky-400 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition"
                autoFocus
              />
            </div>
            {error && <p className="text-[11px] text-rose-400 mt-1 font-semibold">{error}</p>}
          </div>

          {/* Class Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Kelas / No. Absen</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <School className="w-4 h-4 text-emerald-400" />
              </div>
              <input
                type="text"
                value={cls}
                onChange={(e) => setCls(e.target.value)}
                placeholder="Contoh: IX-A / Absen 12"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          {/* Info note */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>
              Nama dan kelasmu tersimpan secara otomatis dan dapat disunting kapan saja melalui menu <strong>Pengaturan</strong>.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                }}
                className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={!name.trim()}
              className={`flex items-center justify-center gap-2 py-3 font-bold text-sm text-white rounded-xl shadow-lg transition active:scale-98 cursor-pointer ${
                onClose ? 'w-2/3' : 'w-full'
              } ${
                name.trim()
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-sky-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Mulai Petualangan Ilmiah 3D</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
