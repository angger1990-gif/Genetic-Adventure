import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Hand, Zap, Package, Pause } from 'lucide-react';

interface TouchControlsProps {
  onMove: (x: number, z: number) => void;
  onInteract: () => void;
  onAction?: () => void;
  onOpenInventory?: () => void;
  onPause?: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onInteract,
  onAction,
  onOpenInventory,
  onPause,
}) => {
  return (
    <div className="md:hidden absolute bottom-3 left-3 right-3 z-30 flex justify-between items-end pointer-events-none select-none">
      {/* 3D Directional D-Pad */}
      <div className="grid grid-cols-3 gap-1 bg-slate-900/95 p-2 rounded-2xl border border-slate-700/80 pointer-events-auto shadow-2xl">
        <div />
        <button
          onTouchStart={() => onMove(0, -1)}
          onTouchEnd={() => onMove(0, 0)}
          onMouseDown={() => onMove(0, -1)}
          onMouseUp={() => onMove(0, 0)}
          className="w-11 h-11 bg-slate-800 active:bg-sky-600 rounded-xl flex items-center justify-center text-slate-200 border border-slate-600 active:scale-95 transition"
          aria-label="Maju (W)"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div />

        <button
          onTouchStart={() => onMove(-1, 0)}
          onTouchEnd={() => onMove(0, 0)}
          onMouseDown={() => onMove(-1, 0)}
          onMouseUp={() => onMove(0, 0)}
          className="w-11 h-11 bg-slate-800 active:bg-sky-600 rounded-xl flex items-center justify-center text-slate-200 border border-slate-600 active:scale-95 transition"
          aria-label="Kiri (A)"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onTouchStart={() => onMove(0, 1)}
          onTouchEnd={() => onMove(0, 0)}
          onMouseDown={() => onMove(0, 1)}
          onMouseUp={() => onMove(0, 0)}
          className="w-11 h-11 bg-slate-800 active:bg-sky-600 rounded-xl flex items-center justify-center text-slate-200 border border-slate-600 active:scale-95 transition"
          aria-label="Mundur (S)"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        <button
          onTouchStart={() => onMove(1, 0)}
          onTouchEnd={() => onMove(0, 0)}
          onMouseDown={() => onMove(1, 0)}
          onMouseUp={() => onMove(0, 0)}
          className="w-11 h-11 bg-slate-800 active:bg-sky-600 rounded-xl flex items-center justify-center text-slate-200 border border-slate-600 active:scale-95 transition"
          aria-label="Kanan (D)"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        <div className="flex gap-2 justify-end">
          {onOpenInventory && (
            <button
              onClick={onOpenInventory}
              className="w-10 h-10 bg-indigo-900/90 active:bg-indigo-600 rounded-xl flex items-center justify-center text-indigo-200 border border-indigo-500/50 shadow"
              title="Inventaris"
            >
              <Package className="w-5 h-5" />
            </button>
          )}
          {onPause && (
            <button
              onClick={onPause}
              className="w-10 h-10 bg-slate-800 active:bg-slate-700 rounded-xl flex items-center justify-center text-slate-300 border border-slate-600 shadow"
              title="Pause"
            >
              <Pause className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {onAction && (
            <button
              onClick={onAction}
              className="w-14 h-14 bg-amber-600 active:bg-amber-500 rounded-2xl flex flex-col items-center justify-center text-white border border-amber-400 font-bold text-xs shadow-lg active:scale-95 transition"
            >
              <Zap className="w-5 h-5" />
              <span className="text-[10px]">AKSI</span>
            </button>
          )}

          <button
            onClick={onInteract}
            className="w-16 h-16 bg-sky-600 active:bg-sky-500 rounded-2xl flex flex-col items-center justify-center text-white border border-sky-400 font-bold text-xs shadow-xl active:scale-95 transition"
          >
            <Hand className="w-6 h-6 mb-0.5" />
            <span className="text-[10px]">INTERAKSI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
