import React, { useState } from 'react';
import { Camera, Eye, Volume2, VolumeX, ChevronDown, ChevronUp, Sparkles, Navigation } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface CameraControlsDockProps {
  currentMode: 'third_person' | 'close' | 'top_down' | 'isometric';
  onSelectMode: (mode: 'third_person' | 'close' | 'top_down' | 'isometric') => void;
  nearbyStationTitle?: string | null;
  onInteract?: () => void;
}

export const CameraControlsDock: React.FC<CameraControlsDockProps> = ({
  currentMode,
  onSelectMode,
  nearbyStationTitle,
  onInteract,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(soundManager.sfxMuted);
  const [isBgmMuted, setIsBgmMuted] = useState(soundManager.bgmMuted);

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

  return (
    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-auto select-none max-w-[94vw] w-[620px]">
      {/* 3D Nearby Station Proximity Alert Banner */}
      {nearbyStationTitle && (
        <div className="mb-2 bg-slate-900 border-2 border-sky-400 text-sky-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-xl shadow-sky-950 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Dekati Objek: <strong>{nearbyStationTitle}</strong></span>
          <button
            onClick={onInteract}
            className="ml-2 px-3 py-0.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-full font-black text-xs cursor-pointer transition active:scale-95"
          >
            Tekan [E]
          </button>
        </div>
      )}

      {/* Collapse / Expand Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-700/80 rounded-t-xl text-[11px] font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer shadow"
        title="Buka/Tutup Dock Kontrol Kamera 3D"
      >
        <Camera className="w-3.5 h-3.5 text-sky-400" />
        <span>{collapsed ? '▴ Buka Kontrol Kamera 3D' : '▾ Sembunyikan Kontrol'}</span>
        {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Dock Container */}
      {!collapsed && (
        <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Camera Angles */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold text-[11px] mr-1 hidden sm:inline">Sudut Pandang 3D:</span>
            <button
              onClick={() => onSelectMode('third_person')}
              className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                currentMode === 'third_person'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Navigation className="w-3 h-3" />
              <span>Orang Ke-3</span>
            </button>
            <button
              onClick={() => onSelectMode('close')}
              className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                currentMode === 'close'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Dekat</span>
            </button>
            <button
              onClick={() => onSelectMode('top_down')}
              className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                currentMode === 'top_down'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Atas (Top-Down)
            </button>
            <button
              onClick={() => onSelectMode('isometric')}
              className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer ${
                currentMode === 'isometric'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Isometrik
            </button>
          </div>

          {/* Audio Quick Toggles & Keyboard Shortcuts */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSfx}
              className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
                isSfxMuted
                  ? 'bg-slate-800 border-slate-700 text-slate-500'
                  : 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
              }`}
              title={isSfxMuted ? 'Nyalakan SFX' : 'Matikan SFX'}
            >
              {isSfxMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleBgm}
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition ${
                isBgmMuted
                  ? 'bg-slate-800 border-slate-700 text-slate-500'
                  : 'bg-sky-950 border-sky-500/50 text-sky-300'
              }`}
              title={isBgmMuted ? 'Nyalakan BGM Musik' : 'Matikan BGM Musik'}
            >
              BGM: {isBgmMuted ? 'OFF' : 'ON'}
            </button>
            <span className="hidden md:inline text-[11px] text-slate-500 font-mono pl-1 border-l border-slate-700">
              [WASD] Jalan • [E] Interaksi
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
