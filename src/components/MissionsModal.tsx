import React from 'react';
import { Lock, LockOpen, Swords, FlaskConical, CircleHelp, Table, Package, Settings, Zap, ArrowRight, CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export interface LevelProgressReport {
  levelId: number;
  levelName: string;
  bossName: string;
  bossHp: number;
  bossAvatarEmoji: string;
  practicum: boolean;
  quizCorrect: number;
  quizTarget: number;
  quizDone: boolean;
  punnett: boolean;
  chest: boolean;
  machine1?: boolean;
  machine2?: boolean;
  totalTasks: number;
  completedTasks: number;
  allDone: boolean;
  tasks: {
    id: string;
    title: string;
    category: string;
    description: string;
    isDone: boolean;
    progressText: string;
    icon: string;
    actionLabel?: string;
  }[];
}

interface MissionsModalProps {
  progress: LevelProgressReport;
  onClose: () => void;
  onEnterBoss: () => void;
  onOpenPracticum?: () => void;
  onOpenQuiz?: () => void;
  onOpenPunnett?: () => void;
  onOpenMachine?: (type: 'segregasi' | 'asortasi') => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  progress,
  onClose,
  onEnterBoss,
  onOpenPracticum,
  onOpenQuiz,
  onOpenPunnett,
  onOpenMachine,
}) => {
  const percent = Math.round((progress.completedTasks / progress.totalTasks) * 100);

  const getTaskIcon = (t: { id: string }) => {
    switch (t.id) {
      case 'practicum':
        return <FlaskConical className="w-5 h-5 text-sky-400" />;
      case 'quiz':
        return <CircleHelp className="w-5 h-5 text-amber-400" />;
      case 'punnett':
        return <Table className="w-5 h-5 text-emerald-400" />;
      case 'chest':
        return <Package className="w-5 h-5 text-indigo-400" />;
      case 'machine1':
        return <Settings className="w-5 h-5 text-rose-400" />;
      case 'machine2':
        return <Zap className="w-5 h-5 text-cyan-400" />;
      default:
        return <FlaskConical className="w-5 h-5 text-sky-400" />;
    }
  };

  const handleTaskAction = (t: { id: string }) => {
    soundManager.playClick();
    onClose();
    if (t.id === 'practicum' && onOpenPracticum) onOpenPracticum();
    else if (t.id === 'quiz' && onOpenQuiz) onOpenQuiz();
    else if (t.id === 'punnett' && onOpenPunnett) onOpenPunnett();
    else if (t.id === 'machine1' && onOpenMachine) onOpenMachine('segregasi');
    else if (t.id === 'machine2' && onOpenMachine) onOpenMachine('asortasi');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-rose-500/40 rounded-3xl shadow-2xl shadow-rose-950/50 p-4 sm:p-6 text-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
        <button
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3.5 mb-4">
          <div
            className={`p-3 rounded-2xl border flex items-center justify-center ${
              progress.allDone
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400'
                : 'bg-rose-950/70 border-rose-500/50 text-rose-400'
            }`}
          >
            {progress.allDone ? <LockOpen className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-wide text-slate-100">
                {progress.allDone ? 'SELESAI! PINTU ARENA BOSS TERBUKA' : 'AKSES ARENA BOSS MASIH TERKUNCI!'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {progress.levelName} • Menuju Pertarungan Akhir Mengalahkan Boss Penjaga
            </p>
          </div>
        </div>

        {/* Boss Target Card */}
        <div className="bg-gradient-to-r from-rose-950/50 via-slate-900 to-indigo-950/50 border border-rose-500/30 rounded-2xl p-3.5 mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl filter drop-shadow">{progress.bossAvatarEmoji}</span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block">
                Boss Penjaga Level
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-100">{progress.bossName}</h3>
              <span className="text-xs text-rose-300/90 font-mono">Daya Tahan: {progress.bossHp} HP</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                progress.allDone
                  ? 'bg-emerald-900/60 border-emerald-500/60 text-emerald-300'
                  : 'bg-rose-900/60 border-rose-500/60 text-rose-300'
              }`}
            >
              {progress.allDone ? 'SIAP BERTARUNG ⚔️' : 'TERKUNCI 🔒'}
            </span>
          </div>
        </div>

        {/* Security Alert Banner */}
        <div className="mb-4 bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">Protokol Keamanan Laboratorium Genetika:</strong>
              <p className="mt-0.5 text-slate-300">
                {progress.allDone
                  ? 'Selamat! Semua tugas laboratorium, kuis pemahaman, dan eksperimen telah selesai. Persiapan analisismu sudah matang untuk mengalahkan Boss!'
                  : 'Siswa belum diperbolehkan melawan Boss sebelum menyelesaikan seluruh rangkaian tugas praktikum dan riset di laboratorium ini. Selesaikan tugas di bawah:'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-300">Kemajuan Tugas Laboratorium:</span>
            <span className="text-sky-400 font-mono font-bold">
              {progress.completedTasks} / {progress.totalTasks} Tugas Selesai ({percent}%)
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progress.allDone
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-rose-500 to-amber-400'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2 mb-5">
          {progress.tasks.map((t, idx) => (
            <div
              key={t.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl border transition-all ${
                t.isDone
                  ? 'bg-emerald-950/25 border-emerald-500/40'
                  : 'bg-slate-800/50 border-slate-700/70 hover:border-amber-500/40'
              }`}
            >
              <div className="flex items-start gap-3 mb-2 sm:mb-0">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/80 shrink-0 mt-0.5">
                  {getTaskIcon(t)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">
                      {idx + 1}. {t.title}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                        t.isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {t.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{t.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pl-10 sm:pl-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  {t.isDone ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {t.progressText}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <XCircle className="w-4 h-4 text-amber-400" />
                      {t.progressText}
                    </span>
                  )}
                </div>

                {!t.isDone && t.id !== 'chest' && (
                  <button
                    onClick={() => handleTaskAction(t)}
                    className="px-3 py-1 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow transition cursor-pointer flex items-center gap-1"
                  >
                    <span>{t.actionLabel || 'Kerjakan'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {!t.isDone && t.id === 'chest' && (
                  <span className="text-[10px] text-slate-400 italic">(Cari kapsul hijau di lab)</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400 text-center sm:text-left">
            {progress.allDone
              ? '✨ Gerbang terbuka! Persiapkan konsentrasi dan strategi menjawab soal.'
              : `⚠️ Sisa ${progress.totalTasks - progress.completedTasks} tugas lagi untuk membuka pintu arena.`}
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="w-1/2 sm:w-auto px-4 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              Jelajahi Lab Lagi
            </button>

            {progress.allDone ? (
              <button
                onClick={() => {
                  soundManager.playFanfare();
                  onEnterBoss();
                }}
                className="w-1/2 sm:w-auto px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl shadow-lg shadow-rose-900/40 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Swords className="w-4 h-4" />
                <span>Masuk Melawan Boss!</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  const undone = progress.tasks.find((t) => !t.isDone && t.id !== 'chest');
                  if (undone) handleTaskAction(undone);
                  else onClose();
                }}
                className="w-1/2 sm:w-auto px-5 py-2.5 text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Lanjutkan Tugas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
