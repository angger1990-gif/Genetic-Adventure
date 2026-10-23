import React, { useState, useEffect } from 'react';
import { Table, Eye, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { PunnettEngine, CrossResult } from '../utils/punnettEngine';
import { PlayerStats } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface PunnettModalProps {
  initialParent1?: string;
  initialParent2?: string;
  stats: PlayerStats;
  onSuccess: (earnedXp: number, earnedEnergy: number) => void;
  onClose: () => void;
  onUseItem?: (itemKey: 'punnettScanner') => void;
}

export const PunnettModal: React.FC<PunnettModalProps> = ({
  initialParent1 = 'Mm',
  initialParent2 = 'Mm',
  stats,
  onSuccess,
  onClose,
  onUseItem,
}) => {
  const [parent1, setParent1] = useState(initialParent1);
  const [parent2, setParent2] = useState(initialParent2);
  const [crossResult, setCrossResult] = useState<CrossResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Student manual input cells
  const [studentGrid, setStudentGrid] = useState<string[][]>([]);
  const [validationResult, setValidationResult] = useState<{
    tested: boolean;
    isValid: boolean;
    errorCells: { row: number; col: number; expected: string }[];
  }>({ tested: false, isValid: false, errorCells: [] });

  const [hasValidatedSuccess, setHasValidatedSuccess] = useState(false);

  const calculateCross = (p1: string, p2: string) => {
    try {
      setErrorMsg(null);
      const res = PunnettEngine.calculateCross(p1, p2);
      setCrossResult(res);

      const empty: string[][] = [];
      for (let r = 0; r < res.gametes1.length; r++) {
        empty[r] = [];
        for (let c = 0; c < res.gametes2.length; c++) {
          empty[r][c] = '';
        }
      }
      setStudentGrid(empty);
      setValidationResult({ tested: false, isValid: false, errorCells: [] });
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Format genotip tidak valid.');
      }
    }
  };

  useEffect(() => {
    calculateCross(parent1, parent2);
  }, []);

  const handleCellChange = (r: number, c: number, val: string) => {
    const next = studentGrid.map((row, rIdx) =>
      row.map((col, cIdx) => (rIdx === r && cIdx === c ? val : col))
    );
    setStudentGrid(next);
  };

  const handleValidateGrid = () => {
    if (!crossResult) return;
    const res = PunnettEngine.validateStudentGrid(studentGrid, crossResult.grid);
    setValidationResult({ tested: true, isValid: res.isValid, errorCells: res.errorCells });

    if (res.isValid) {
      soundManager.playCorrect();
      setHasValidatedSuccess(true);
      onSuccess(250, 2);
    } else {
      soundManager.playWrong();
    }
  };

  const handleScanAutoFill = () => {
    if (stats.items.punnettScanner <= 0 || !crossResult) return;
    soundManager.playEnergyShimmer();
    if (onUseItem) onUseItem('punnettScanner');
    setStudentGrid(crossResult.grid);
    setValidationResult({ tested: true, isValid: true, errorCells: [] });
    setHasValidatedSuccess(true);
    onSuccess(150, 1);
  };

  const handleApplyPreset = (p1: string, p2: string) => {
    soundManager.playClick();
    setParent1(p1);
    setParent2(p2);
    calculateCross(p1, p2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-sky-500/40 rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                PUNNETT SQUARE 3D SIMULATOR
              </h3>
              <p className="text-xs text-slate-400">
                Kalkulasi Pembentukan Gamet & Rekombinasi Alel Sesuai Hukum Mendel
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

        {/* Quick Presets Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-800/80 rounded-2xl border border-slate-700 mb-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Preset Cepat:</span>
            <button
              onClick={() => handleApplyPreset('MM', 'mm')}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 cursor-pointer font-mono"
            >
              MM × mm
            </button>
            <button
              onClick={() => handleApplyPreset('Mm', 'Mm')}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 cursor-pointer font-mono"
            >
              Mm × Mm (3:1)
            </button>
            <button
              onClick={() => handleApplyPreset('BbLl', 'BbLl')}
              className="px-2.5 py-1 bg-indigo-900 hover:bg-indigo-800 rounded-lg text-indigo-200 border border-indigo-500/40 cursor-pointer font-mono font-bold"
            >
              BbLl × BbLl (9:3:3:1)
            </button>
            <button
              onClick={() => handleApplyPreset('KkBb', 'KkBb')}
              className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 rounded-lg text-amber-200 border border-amber-500/40 cursor-pointer font-mono"
            >
              KkBb × KkBb (Jagung)
            </button>
          </div>

          <button
            onClick={handleScanAutoFill}
            disabled={stats.items.punnettScanner <= 0 || hasValidatedSuccess}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              stats.items.punnettScanner > 0 && !hasValidatedSuccess
                ? 'bg-sky-600 hover:bg-sky-500 text-white shadow'
                : 'bg-slate-700/50 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Scan Papan ({stats.items.punnettScanner})</span>
          </button>
        </div>

        {/* Genotype Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-sky-300 font-semibold">Genotip Induk 1 (P1):</label>
            <input
              type="text"
              value={parent1}
              onChange={(e) => setParent1(e.target.value)}
              maxLength={4}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-slate-950 border border-slate-700 focus:border-sky-400 rounded-xl px-3 py-1.5 text-sm font-mono font-bold tracking-wider text-slate-100 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-sky-300 font-semibold">Genotip Induk 2 (P2):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={parent2}
                onChange={(e) => setParent2(e.target.value)}
                maxLength={4}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full bg-slate-950 border border-slate-700 focus:border-sky-400 rounded-xl px-3 py-1.5 text-sm font-mono font-bold tracking-wider text-slate-100 outline-none"
              />
              <button
                onClick={() => calculateCross(parent1, parent2)}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Hitung
              </button>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 3D Punnett Board Table */}
        {crossResult && (
          <div className="my-2 flex flex-col items-center">
            <div className="overflow-x-auto w-full flex justify-center py-2">
              <div className="inline-block bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-xl">
                <table className="border-collapse text-center font-mono">
                  <thead>
                    <tr>
                      <th className="p-2 text-xs text-slate-500 font-sans border-b border-r border-slate-800">
                        ♀ \ ♂
                      </th>
                      {crossResult.gametes2.map((g2, idx) => (
                        <th
                          key={idx}
                          className="p-2 sm:p-3 text-xs sm:text-sm font-bold text-cyan-400 bg-cyan-950/40 border-b border-slate-800"
                        >
                          {g2}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {crossResult.gametes1.map((g1, rIdx) => (
                      <tr key={rIdx}>
                        <td className="p-2 sm:p-3 text-xs sm:text-sm font-bold text-amber-400 bg-amber-950/40 border-r border-slate-800">
                          {g1}
                        </td>
                        {crossResult.gametes2.map((_, cIdx) => {
                          const val = studentGrid[rIdx]?.[cIdx] || '';
                          const isError = validationResult.errorCells.some(
                            (cell) => cell.row === rIdx && cell.col === cIdx
                          );
                          const isCorrect = validationResult.tested && !isError;

                          return (
                            <td key={cIdx} className="p-1 sm:p-1.5 border border-slate-800">
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                placeholder="?"
                                autoCapitalize="off"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck={false}
                                maxLength={crossResult.isDihybrid ? 4 : 2}
                                className={`w-12 sm:w-16 h-10 sm:h-12 text-center text-xs sm:text-sm font-bold font-mono rounded-lg border outline-none transition ${
                                  isCorrect
                                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                                    : isError
                                    ? 'bg-rose-950/70 border-rose-500 text-rose-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-100 focus:border-sky-400'
                                }`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Validate Button */}
            <div className="flex items-center gap-2 my-2">
              <button
                onClick={handleValidateGrid}
                className="px-5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition cursor-pointer"
              >
                Validasi Isian Papan Catur
              </button>

              {validationResult.tested && (
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {validationResult.isValid ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Isian Sempurna! (+250 XP)
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Ada {validationResult.errorCells.length} kotak
                      belum tepat.
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Results: Genotype and Phenotype Breakdown */}
            <div className="w-full mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <h4 className="text-xs font-bold text-sky-400 mb-2">Frekuensi Genotip:</h4>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {Object.entries(crossResult.genotypePercentages).map(([gt, pct]) => (
                    <span
                      key={gt}
                      className="px-2 py-1 bg-slate-900 rounded-lg border border-slate-700 text-slate-200"
                    >
                      <strong className="text-sky-300">{gt}</strong>: {pct}%
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                <h4 className="text-xs font-bold text-amber-400 mb-2">Rasio Fenotip Hasil Persilangan:</h4>
                <p className="text-xs font-bold text-slate-200 font-mono">{crossResult.phenotypeRatio}</p>
                <div className="flex flex-wrap gap-2 text-xs mt-2">
                  {Object.entries(crossResult.phenotypePercentages).map(([ph, pct]) => (
                    <span key={ph} className="px-2 py-0.5 bg-slate-900 rounded text-slate-300 text-[11px]">
                      {ph}: <strong className="text-amber-300">{pct}%</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Scientific Explanation */}
            <div className="w-full mt-3 p-3 bg-sky-950/30 border border-sky-500/30 rounded-2xl text-xs text-slate-300 leading-relaxed">
              <strong className="text-sky-300">Penjelasan Ilmiah:</strong>{' '}
              {crossResult.scientificExplanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
