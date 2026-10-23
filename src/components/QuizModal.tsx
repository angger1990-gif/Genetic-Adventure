import React, { useState } from 'react';
import { Lightbulb, CheckCircle2, XCircle, ArrowRight, X } from 'lucide-react';
import { Question, PlayerStats } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface QuizModalProps {
  question: Question;
  stats: PlayerStats;
  onAnswer: (isCorrect: boolean, xp: number, energy: number, usedHint: boolean) => void;
  onClose: () => void;
  onUseItem?: (itemKey: 'geneScanner') => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  question,
  stats,
  onAnswer,
  onClose,
  onUseItem,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [sortingState, setSortingState] = useState<string[]>(
    question.sortingItems ? [...question.sortingItems] : []
  );
  const [dragDropState, setDragDropState] = useState<Record<string, string>>({});
  const [hintShown, setHintShown] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleUseScannerHint = () => {
    if (stats.items.geneScanner > 0 && !hintShown) {
      soundManager.playEnergyShimmer();
      if (onUseItem) onUseItem('geneScanner');
      setHintShown(true);
    }
  };

  const handleCheckAnswer = () => {
    let correct = false;
    if (
      question.type === 'multiple_choice' ||
      question.type === 'true_false' ||
      question.type === 'analysis_challenge' ||
      question.type === 'punnett_puzzle'
    ) {
      correct = selectedOption === question.answer;
    } else if (question.type === 'sorting') {
      const exp = question.answer as string[];
      correct = sortingState.every((item, idx) => item === exp[idx]);
    } else if (question.type === 'drag_drop') {
      const exp = question.answer as Record<string, string>;
      correct = Object.entries(exp).every(([k, v]) => dragDropState[k] === v);
    }

    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
  };

  const handleContinue = () => {
    const earnedXp = isCorrect ? question.xp : 0;
    const earnedEnergy = isCorrect ? (question.cognitiveLevel === 'C4' || question.cognitiveLevel === 'C5' ? 2 : 1) : 0;
    onAnswer(isCorrect, earnedXp, earnedEnergy, hintShown);
    onClose();
  };

  const moveSortingItem = (idx: number, dir: 'up' | 'down') => {
    const arr = [...sortingState];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= arr.length) return;
    const temp = arr[idx];
    arr[idx] = arr[target];
    arr[target] = temp;
    setSortingState(arr);
    soundManager.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-sky-500/40 rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2.5 py-1 rounded-lg">
              Level {question.level} • {question.cognitiveLevel}
            </span>
            <span className="text-xs font-medium text-slate-400">+{question.xp} XP</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUseScannerHint}
              disabled={hintShown || stats.items.geneScanner <= 0 || isAnswered}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                hintShown
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : stats.items.geneScanner > 0 && !isAnswered
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
                  : 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
              title="Gunakan Gene Scanner untuk petunjuk analisis ilmiah"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Petunjuk ({stats.items.geneScanner})</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hint Box */}
        {hintShown && (
          <div className="mb-3 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">Gene Scanner Clue:</strong> {question.hint}
            </div>
          </div>
        )}

        {/* Question Text */}
        <div className="my-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">{question.question}</h3>
        </div>

        {/* Question Interactive Body */}
        <div className="my-4 flex-1">
          {/* Multiple Choice & True/False */}
          {(question.type === 'multiple_choice' ||
            question.type === 'true_false' ||
            question.type === 'analysis_challenge' ||
            question.type === 'punnett_puzzle') &&
            question.options && (
              <div className="grid grid-cols-1 gap-2.5">
                {question.options.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedOption(opt);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs sm:text-sm font-medium flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-sky-600/20 border-sky-400 text-sky-200 shadow-md shadow-sky-950'
                          : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-slate-200'
                      }`}
                    >
                      <span>{opt}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                          isSelected ? 'border-sky-400 bg-sky-500' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

          {/* Sorting question */}
          {question.type === 'sorting' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-slate-400 mb-1">
                Gunakan tombol panah untuk menyusun urutan yang tepat:
              </p>
              {sortingState.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm font-medium"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-700 text-sky-400 text-xs flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </span>
                  {!isAnswered && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveSortingItem(idx, 'up')}
                        disabled={idx === 0}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded text-xs"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveSortingItem(idx, 'down')}
                        disabled={idx === sortingState.length - 1}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded text-xs"
                      >
                        ▼
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Drag & Drop / Match Pairs */}
          {question.type === 'drag_drop' && question.dragDropPairs && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-400">Pilih pasangan konsep yang sesuai:</p>
              {question.dragDropPairs.map((pair, idx) => {
                const item = pair.item;
                const matchOptions = question.dragDropPairs!.map((p) => p.match);
                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-800/80 border border-slate-700 rounded-xl"
                  >
                    <span className="font-bold text-xs sm:text-sm text-sky-300">{item}</span>
                    <select
                      disabled={isAnswered}
                      value={dragDropState[item] || ''}
                      onChange={(e) => setDragDropState({ ...dragDropState, [item]: e.target.value })}
                      className="bg-slate-900 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                    >
                      <option value="">-- Pilih Pasangan --</option>
                      {matchOptions.map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Feedback explanation after submit */}
        {isAnswered && (
          <div
            className={`p-4 rounded-2xl border my-2 ${
              isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base mb-1">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>BENAR! Hebat, pemahamanmu akurat!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span>BELUM TEPAT. Simak penjelasan konsep ilmiah berikut:</span>
                </>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">{question.explanation}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 mt-2">
          {isAnswered ? (
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-xs sm:text-sm text-white rounded-xl shadow-lg transition cursor-pointer"
            >
              <span>Lanjutkan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCheckAnswer}
              disabled={
                question.type === 'sorting'
                  ? false
                  : question.type === 'drag_drop'
                  ? Object.keys(dragDropState).length < (question.dragDropPairs?.length || 0)
                  : !selectedOption
              }
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 font-bold text-xs sm:text-sm text-white rounded-xl shadow-md transition cursor-pointer"
            >
              Kirim Jawaban
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
