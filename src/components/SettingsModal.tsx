import React, { useState } from 'react';
import { Settings, User, Volume2, VolumeX, RotateCcw, AlertTriangle, X } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface SettingsModalProps {
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  playerName,
  onUpdatePlayerName,
  onResetData,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState(playerName);
  const [isSfxMuted, setIsSfxMuted] = useState(soundManager.sfxMuted);
  const [isBgmMuted, setIsBgmMuted] = useState(soundManager.bgmMuted);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const toggleSfx = () => {
    const next = !isSfxMuted;
    setIsSfxMuted(next);
    soundManager.setSfxMuted(next);
    if (!next) soundManager.playClick();
  };

  const toggleBgm = () => {
    const next = !isBgmMuted;
    setIsBgmMuted(next);
    soundManager.setBgmMuted(next);
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdatePlayerName(nameInput.trim());
      soundManager.playClick();
    }
  };

  const handleConfirmReset = () => {
    soundManager.playClick();
    onResetData();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400" />
            <h3 className="text-base sm:text-lg font-bold text-slate-100">PENGATURAN LAB 3D</h3>
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

        {/* Change Name */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-sky-400" />
            <span>Nama Peneliti Siswa:</span>
          </label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={24}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 outline-none focus:border-sky-400"
            />
            <button
              onClick={handleSaveName}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white rounded-xl cursor-pointer transition"
            >
              Simpan
            </button>
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between p-3 bg-slate-800/70 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              {isSfxMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>Efek Suara Ilmiah (SFX)</span>
            </div>
            <button
              onClick={toggleSfx}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                isSfxMuted ? 'bg-slate-700 text-slate-400' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isSfxMuted ? 'Mati' : 'Aktif'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/70 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              {isBgmMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-sky-400" />
              )}
              <span>Musik Latar Sintesis (BGM)</span>
            </div>
            <button
              onClick={toggleBgm}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                isBgmMuted ? 'bg-slate-700 text-slate-400' : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              {isBgmMuted ? 'Mati' : 'Aktif'}
            </button>
          </div>
        </div>

        {/* Reset Progress */}
        <div className="pt-3 border-t border-slate-800">
          {showConfirmReset ? (
            <div className="p-3 bg-rose-950/50 border border-rose-600/50 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-300 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Yakin ingin mereset seluruh progres?</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Semua XP, kristal, dan capaian level akan dihapus dari penyimpanan lokal.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleConfirmReset}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  Ya, Reset
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-800 hover:bg-rose-950/60 text-xs font-medium text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Seluruh Data Belajar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
