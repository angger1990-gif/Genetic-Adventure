import React, { useState } from 'react';
import { FlaskConical, CheckCircle2, AlertCircle, ArrowRight, Sparkles, X, Check } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface PracticumModalProps {
  levelId: number;
  levelName: string;
  stats: PlayerStats;
  onComplete: (earnedXp: number, earnedEnergy: number) => void;
  onClose: () => void;
}

export const PracticumModal: React.FC<PracticumModalProps> = ({
  levelId,
  levelName,
  stats,
  onComplete,
  onClose,
}) => {
  const [step, setStep] = useState(1);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Level 1: DNA base-pairing
  const templateStrand = ['A', 'T', 'G', 'C', 'C', 'A', 'T', 'G'];
  const targetComplement = ['T', 'A', 'C', 'G', 'G', 'T', 'A', 'C'];
  const [studentBases, setStudentBases] = useState<string[]>(Array(8).fill(''));

  // Level 2: Monohybrid Pea Flower
  const [monohybridStage, setMonohybridStage] = useState<'p1' | 'f1' | 'f2'>('p1');
  const [f2Slots, setF2Slots] = useState<string[]>(Array(4).fill(''));

  // Level 3: Intermediet Mirabilis jalapa
  const [pigmentMixed, setPigmentMixed] = useState(false);

  // Level 4: Dihybrid Rabbit / Pea gametes
  const [dihybridGametes, setDihybridGametes] = useState({ BK: false, Bk: false, bK: false, bk: false });

  // Level 5: ABO Blood Group Agglutination
  const [antiATested, setAntiATested] = useState(false);
  const [antiBTested, setAntiBTested] = useState(false);
  const [studentBloodGuess, setStudentBloodGuess] = useState<string>('');

  // Level 6: Core Mendel Reactor
  const [reactorMendel1, setReactorMendel1] = useState(false);
  const [reactorMendel2, setReactorMendel2] = useState(false);
  const [reactorProgress, setReactorProgress] = useState(0);

  const isAlreadyDone = !!stats.practicumCompleted?.[levelId];

  const handleNextStep = () => {
    soundManager.playClick();
    setStep((prev) => prev + 1);
    setFeedback(null);
  };

  const handleFinishPracticum = () => {
    soundManager.playFanfare();
    onComplete(250, 3);
  };

  // Render Level 1: DNA Synthesis
  const renderLevel1 = () => {
    const handlePickBase = (b: string) => {
      soundManager.playClick();
      const firstEmpty = studentBases.findIndex((slot) => slot === '');
      if (firstEmpty === -1) return;

      const expected = targetComplement[firstEmpty];
      if (b === expected) {
        soundManager.playCorrect();
        const next = [...studentBases];
        next[firstEmpty] = b;
        setStudentBases(next);
        setFeedback({ msg: `Bagus! Basa ${b} berpasangan tepat dengan ${templateStrand[firstEmpty]}!`, type: 'success' });
        if (firstEmpty === 7) {
          soundManager.playPowerUp();
          setFeedback({ msg: 'Luar Biasa! Rantai ganda heliks DNA berhasil disintesis sempurna!', type: 'success' });
        }
      } else {
        soundManager.playWrong();
        setFeedback({
          msg: 'Kurang tepat! Ingat aturan Chargaff: Adenin (A) selalu dengan Timin (T), dan Guanin (G) selalu dengan Sitosin (C).',
          type: 'error',
        });
      }
    };

    const isDone = studentBases.every((b, idx) => b === targetComplement[idx]);

    return (
      <div className="space-y-4">
        {step === 1 && (
          <div className="space-y-3">
            <div className="p-3 bg-sky-950/60 border border-sky-500/40 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed">
              <strong className="text-sky-300">Tujuan Praktikum:</strong> Membuktikan struktur heliks ganda DNA dan aturan pasangan komplementer basa nitrogen.
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center gap-3 text-center">
              <div className="text-4xl animate-pulse">🧬</div>
              <h4 className="font-bold text-sm text-sky-300">Materi Genetik Makhluk Hidup</h4>
              <p className="text-xs text-slate-300 max-w-md">
                Di dalam nukleus sel terdapat <strong>Kromosom</strong> yang tersusun atas untaian panjang <strong>DNA</strong>. Segmen DNA penentu sifat disebut <strong>Gen</strong>.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs w-full max-w-xs text-left">
                <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl">
                  <span className="text-emerald-400 font-bold">A</span> berpasangan dengan <span className="text-sky-400 font-bold">T</span>
                </div>
                <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl">
                  <span className="text-amber-400 font-bold">G</span> berpasangan dengan <span className="text-rose-400 font-bold">C</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="flex items-center justify-center gap-2 w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl transition cursor-pointer"
            >
              <span>Lanjut ke Perakitan Untai DNA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Pasangkan basa nitrogen komplementer pada untai cetakan DNA di bawah ini dengan menekan tombol basa:
            </p>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                Untai Cetakan (Template 5' → 3'):
              </span>
              <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
                {templateStrand.map((b, idx) => (
                  <div
                    key={idx}
                    className="w-9 h-10 sm:w-11 sm:h-12 rounded-xl bg-slate-900 border-2 border-sky-500/50 flex flex-col items-center justify-center font-black text-sm sm:text-base text-sky-300 shrink-0 shadow"
                  >
                    <span>{b}</span>
                    <span className="text-[9px] text-slate-500 font-normal">#{idx + 1}</span>
                  </div>
                ))}
              </div>

              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mt-2">
                Untai Komplementer (Hasil Rakitanmu 3' → 5'):
              </span>
              <div className="flex items-center justify-between gap-1 overflow-x-auto py-1">
                {studentBases.map((b, idx) => (
                  <div
                    key={idx}
                    className={`w-9 h-10 sm:w-11 sm:h-12 rounded-xl border-2 flex flex-col items-center justify-center font-black text-sm sm:text-base shrink-0 transition ${
                      b
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-md'
                        : 'bg-slate-900/50 border-dashed border-slate-700 text-slate-600'
                    }`}
                  >
                    <span>{b || '?'}</span>
                    <span className="text-[9px] text-slate-500 font-normal">#{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {!isDone && (
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium">Pilih basa berikutnya untuk mengisi slot:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { base: 'A', name: 'Adenin', color: 'bg-emerald-600 hover:bg-emerald-500' },
                    { base: 'T', name: 'Timin', color: 'bg-sky-600 hover:bg-sky-500' },
                    { base: 'G', name: 'Guanin', color: 'bg-amber-600 hover:bg-amber-500' },
                    { base: 'C', name: 'Sitosin', color: 'bg-rose-600 hover:bg-rose-500' },
                  ].map((btn) => (
                    <button
                      key={btn.base}
                      onClick={() => handlePickBase(btn.base)}
                      className={`py-2.5 rounded-xl text-white font-black text-sm flex flex-col items-center justify-center shadow transition active:scale-95 cursor-pointer ${btn.color}`}
                    >
                      <span className="text-base">{btn.base}</span>
                      <span className="text-[10px] font-normal opacity-90">{btn.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isDone && (
              <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl flex flex-col items-center text-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <h4 className="font-bold text-sm text-emerald-200">SINTESIS DNA BERHASIL!</h4>
                <p className="text-xs text-slate-300">
                  Kamu telah membuktikan bahwa urutan basa nitrogen membawa kode genetik dan selalu berpasangan secara komplementer (A-T dan G-C).
                </p>
                <button
                  onClick={handleFinishPracticum}
                  className="mt-2 flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Selesaikan Praktikum & Aktifkan Seluruh Konsol</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Level 2: Monohibrid Dominan Penuh
  const renderLevel2 = () => {
    const handleSetF2Slot = (idx: number, val: string) => {
      soundManager.playClick();
      const next = [...f2Slots];
      next[idx] = val;
      setF2Slots(next);
      const expected = ['UU', 'Uu', 'Uu', 'uu'];
      if (next[idx] === expected[idx]) {
        soundManager.playCorrect();
      } else {
        soundManager.playWrong();
      }
    };

    const isF2Complete =
      f2Slots[0] === 'UU' &&
      (f2Slots[1] === 'Uu' || f2Slots[1] === 'uU') &&
      (f2Slots[2] === 'Uu' || f2Slots[2] === 'uU') &&
      f2Slots[3] === 'uu';

    return (
      <div className="space-y-4">
        {monohybridStage === 'p1' && (
          <div className="space-y-3">
            <div className="p-3 bg-sky-950/60 border border-sky-500/40 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed">
              <strong className="text-sky-300">Tujuan Praktikum:</strong> Membuktikan <strong>Hukum Mendel I (Hukum Segregasi)</strong> pada persilangan monohibrid dominan penuh antara Bunga Ungu homozigot dan Bunga Putih homozigot.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-950 rounded-2xl border border-purple-500/40 flex flex-col items-center text-center">
                <div className="text-3xl">🪻</div>
                <span className="text-xs font-bold text-purple-300 mt-1">Induk Jantan (P1)</span>
                <span className="text-sm font-black text-slate-100">Bunga Ungu Homozigot</span>
                <span className="text-xs font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded mt-1 border border-purple-800">
                  Genotip: UU
                </span>
                <span className="text-[11px] text-slate-400 mt-2">
                  Gamet terbentuk: <strong>U</strong>
                </span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-700 flex flex-col items-center text-center">
                <div className="text-3xl">🤍</div>
                <span className="text-xs font-bold text-slate-300 mt-1">Induk Betina (P1)</span>
                <span className="text-sm font-black text-slate-100">Bunga Putih Homozigot</span>
                <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded mt-1 border border-slate-700">
                  Genotip: uu
                </span>
                <span className="text-[11px] text-slate-400 mt-2">
                  Gamet terbentuk: <strong>u</strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playCorrect();
                setMonohybridStage('f1');
              }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition cursor-pointer"
            >
              <span>Lakukan Penyerbukan Silang (UU × uu)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {monohybridStage === 'f1' && (
          <div className="space-y-3">
            <div className="p-4 bg-slate-950 rounded-2xl border border-purple-500/50 flex flex-col items-center text-center gap-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Hasil Generasi Pertama (F1)</span>
              <div className="text-4xl">🪻</div>
              <h3 className="text-base font-black text-slate-100">100% Bunga Ungu Heterozigot (Uu)</h3>
              <p className="text-xs text-slate-300 max-w-md">
                Karena alel <strong>U (Ungu)</strong> bersifat dominan penuh terhadap alel <strong>u (Putih)</strong>, seluruh keturunan F1 berwarna ungu meski membawa gen resesif u.
              </p>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                setMonohybridStage('f2');
              }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl transition cursor-pointer"
            >
              <span>Silangkan Sesama F1 (Uu × Uu) untuk Mengamati F2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {monohybridStage === 'f2' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Lengkapi kotak persilangan F2 di bawah ini dengan memilih kombinasi genotip anakan:
            </p>

            <div className="max-w-xs mx-auto bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-bold">
                <div className="p-2 text-slate-500">♂ \ ♀</div>
                <div className="p-2 bg-purple-950/60 border border-purple-700 text-purple-300 rounded-lg">U</div>
                <div className="p-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg">u</div>

                <div className="p-2 bg-purple-950/60 border border-purple-700 text-purple-300 rounded-lg">U</div>
                <button
                  onClick={() => handleSetF2Slot(0, 'UU')}
                  className={`p-2 rounded-lg border font-mono font-bold cursor-pointer transition ${
                    f2Slots[0] === 'UU' ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {f2Slots[0] || '?'}
                </button>
                <button
                  onClick={() => handleSetF2Slot(1, 'Uu')}
                  className={`p-2 rounded-lg border font-mono font-bold cursor-pointer transition ${
                    f2Slots[1] === 'Uu' ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {f2Slots[1] || '?'}
                </button>

                <div className="p-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg">u</div>
                <button
                  onClick={() => handleSetF2Slot(2, 'Uu')}
                  className={`p-2 rounded-lg border font-mono font-bold cursor-pointer transition ${
                    f2Slots[2] === 'Uu' ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {f2Slots[2] || '?'}
                </button>
                <button
                  onClick={() => handleSetF2Slot(3, 'uu')}
                  className={`p-2 rounded-lg border font-mono font-bold cursor-pointer transition ${
                    f2Slots[3] === 'uu' ? 'bg-slate-200 text-slate-950 border-white' : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  {f2Slots[3] || '?'}
                </button>
              </div>
            </div>

            {isF2Complete && (
              <div className="p-4 bg-purple-950/60 border border-purple-500/50 rounded-2xl flex flex-col items-center text-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-purple-400" />
                <h4 className="font-bold text-sm text-purple-200">HUKUM MENDEL I TERBUKTI!</h4>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>• <strong>Rasio Genotip F2:</strong> 1 UU : 2 Uu : 1 uu (1 : 2 : 1)</p>
                  <p>• <strong>Rasio Fenotip F2:</strong> 3 Bunga Ungu : 1 Bunga Putih (75% : 25%)</p>
                </div>
                <button
                  onClick={handleFinishPracticum}
                  className="mt-2 flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Selesaikan Praktikum & Aktifkan Seluruh Konsol</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Level 3: Intermediet Mirabilis jalapa
  const renderLevel3 = () => (
    <div className="space-y-4">
      {step === 1 && (
        <div className="space-y-3">
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed">
            <strong className="text-rose-300">Tujuan Praktikum:</strong> Mengamati sifat <strong>Monohibrid Intermediet</strong> pada bunga <em>Mirabilis jalapa</em> (Bunga Pukul Empat), di mana alel dominan tidak penuh menutupi alel resesif.
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center gap-3 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <div className="text-3xl">🌹</div>
                <span className="text-xs font-bold text-rose-400">Merah (MM)</span>
              </div>
              <span className="text-lg font-bold text-slate-500">✕</span>
              <div className="flex flex-col items-center">
                <div className="text-3xl">🤍</div>
                <span className="text-xs font-bold text-slate-300">Putih (mm)</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-md">
              Klik tabung reaksi di bawah ini untuk mencampurkan pigmen genetik alel M dan m:
            </p>

            <button
              onClick={() => {
                soundManager.playPowerUp();
                setPigmentMixed(true);
                setFeedback({ msg: 'Campuran genetik menghasilkan pigmen Merah Muda (Pink)!', type: 'success' });
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-bold text-xs transition cursor-pointer ${
                pigmentMixed ? 'bg-pink-950 border-pink-400 text-pink-300' : 'bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-pink-400" />
              <span>{pigmentMixed ? 'Pigmen Tercampur (F1 = Merah Muda)' : 'Tuang Pipet Pigmen ke Tabung'}</span>
            </button>

            {pigmentMixed && (
              <div className="p-3 bg-pink-950/60 border border-pink-500/40 rounded-xl text-center">
                <div className="text-3xl">🌸</div>
                <span className="text-xs font-bold text-pink-300 block">Keturunan F1: 100% Bunga Merah Muda (Mm)</span>
                <span className="text-[11px] text-slate-400">Sifat intermediet memunculkan fenotip campuran antara kedua induk.</span>
              </div>
            )}
          </div>

          {pigmentMixed && (
            <button
              onClick={handleNextStep}
              className="flex items-center justify-center gap-2 w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm rounded-xl transition cursor-pointer"
            >
              <span>Lanjut ke Analisis Rasio F2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <strong className="text-pink-300">Persilangan Mandiri F1 × F1 (Mm × Mm):</strong>
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-2.5 bg-rose-950/60 border border-rose-700/60 rounded-xl">
                <div className="text-xl">🌹</div>
                <span className="font-bold text-rose-300 block">MM (1)</span>
                <span className="text-[10px] text-slate-400">Merah (25%)</span>
              </div>
              <div className="p-2.5 bg-pink-950/60 border border-pink-700/60 rounded-xl">
                <div className="text-xl">🌸</div>
                <span className="font-bold text-pink-300 block">Mm (2)</span>
                <span className="text-[10px] text-slate-400">Merah Muda (50%)</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl">
                <div className="text-xl">🤍</div>
                <span className="font-bold text-slate-300 block">mm (1)</span>
                <span className="text-[10px] text-slate-400">Putih (25%)</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-pink-950/50 border border-pink-500/40 rounded-2xl text-center space-y-2">
            <h4 className="font-bold text-sm text-pink-300">KESIMPULAN INTERMEDIET:</h4>
            <p className="text-xs text-slate-200">
              Pada persilangan intermediet, <strong>Rasio Genotip = Rasio Fenotip</strong>, yaitu:
              <br />
              <span className="text-base font-black text-pink-400 font-mono">1 Merah : 2 Merah Muda : 1 Putih</span>
            </p>
          </div>

          <button
            onClick={handleFinishPracticum}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Selesaikan Praktikum & Buka Konsol Soal</span>
          </button>
        </div>
      )}
    </div>
  );

  // Render Level 4: Dihibrid & Hukum Mendel II
  const renderLevel4 = () => {
    const isAllGametesUnlocked = dihybridGametes.BK && dihybridGametes.Bk && dihybridGametes.bK && dihybridGametes.bk;

    return (
      <div className="space-y-4">
        {step === 1 && (
          <div className="space-y-3">
            <div className="p-3 bg-indigo-950/60 border border-indigo-500/40 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed">
              <strong className="text-indigo-300">Tujuan Praktikum:</strong> Membuktikan <strong>Hukum Mendel II (Hukum Asortasi Bebas)</strong> pada persilangan dua sifat beda (Dihibrid) kacang kapri:
              <br />• Sifat 1: Bentuk Biji (Bulat [B] dominan vs Keriput [b] resesif)
              <br />• Sifat 2: Warna Biji (Kuning [K] dominan vs Hijau [k] resesif)
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block text-center">
                Individu F1 Heterozigot Dihibrid: <strong className="text-amber-400">BbKk</strong> (Bulat Kuning)
              </span>
              <p className="text-xs text-slate-400 text-center">
                Berdasarkan Hukum Mendel II, alel B/b dan K/k mengelompok secara bebas. Klik keempat kombinasi gamet di bawah ini:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { code: 'BK' as const, label: 'Bulat - Kuning' },
                  { code: 'Bk' as const, label: 'Bulat - Hijau' },
                  { code: 'bK' as const, label: 'Keriput - Kuning' },
                  { code: 'bk' as const, label: 'Keriput - Hijau' },
                ].map((item) => {
                  const isDone = dihybridGametes[item.code];
                  return (
                    <button
                      key={item.code}
                      onClick={() => {
                        soundManager.playClick();
                        setDihybridGametes((prev) => ({ ...prev, [item.code]: true }));
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center transition cursor-pointer ${
                        isDone
                          ? 'bg-indigo-950 border-indigo-400 text-indigo-200 shadow-md'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-lg font-black font-mono">{item.code}</span>
                      <span className="text-[10px] text-slate-400">{item.label}</span>
                      {isDone && <Check className="w-3.5 h-3.5 text-emerald-400 mt-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {isAllGametesUnlocked && (
              <button
                onClick={handleNextStep}
                className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition cursor-pointer"
              >
                <span>Lanjut ke Uji 16 Kotak Fenotip F2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs text-slate-300">
              <h4 className="font-bold text-sm text-indigo-300 text-center">4 KELOMPOK FENOTIP F2 (DARI TOTAL 16 KOTAK):</h4>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl">
                  <div className="text-xl">🟡🟢</div>
                  <span className="font-bold text-amber-300">Bulat Kuning (B_K_)</span>
                  <div className="text-sm font-black text-amber-400 font-mono mt-1">9 / 16 (56,25%)</div>
                </div>
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
                  <div className="text-xl">🟢</div>
                  <span className="font-bold text-emerald-300">Bulat Hijau (B_kk)</span>
                  <div className="text-sm font-black text-emerald-400 font-mono mt-1">3 / 16 (18,75%)</div>
                </div>
                <div className="p-3 bg-yellow-950/40 border border-yellow-500/40 rounded-xl">
                  <div className="text-xl">🟡</div>
                  <span className="font-bold text-yellow-300">Keriput Kuning (bbK_)</span>
                  <div className="text-sm font-black text-yellow-400 font-mono mt-1">3 / 16 (18,75%)</div>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl">
                  <div className="text-xl">🫛</div>
                  <span className="font-bold text-slate-300">Keriput Hijau (bbkk)</span>
                  <div className="text-sm font-black text-slate-300 font-mono mt-1">1 / 16 (6,25%)</div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/60 border border-indigo-500/50 rounded-2xl text-center space-y-1">
              <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Hukum Mendel II Ditegakkan</span>
              <p className="text-base font-black text-slate-100 font-mono">Rasio Fenotip F2 = 9 : 3 : 3 : 1</p>
            </div>

            <button
              onClick={handleFinishPracticum}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Selesaikan Praktikum & Buka Konsol Soal</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render Level 5: Golongan Darah ABO & Silsilah
  const renderLevel5 = () => {
    const handlePickBlood = (ans: string) => {
      soundManager.playClick();
      setStudentBloodGuess(ans);
      if (ans === 'A') {
        soundManager.playCorrect();
        setFeedback({
          msg: 'Tepat sekali! Darah menggumpal pada Serum Anti-A dan tidak pada Anti-B membuktikan pasien bergolongan darah A!',
          type: 'success',
        });
      } else {
        soundManager.playWrong();
        setFeedback({
          msg: 'Kurang tepat. Reaksi aglutinasi hanya terjadi pada serum anti-A, artinya sel darah merah hanya memiliki antigen A.',
          type: 'error',
        });
      }
    };

    return (
      <div className="space-y-4">
        {step === 1 && (
          <div className="space-y-3">
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed">
              <strong className="text-red-300">Tujuan Praktikum:</strong> Menganalisis sistem golongan darah ABO manusia melalui reaksi uji aglutinogen dan aglutinin serta memahami pewarisan sifat alel ganda.
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block text-center">Plat Uji Sampel Darah Pasien</span>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-sky-400 mb-2">Reagen Serum Anti-A</span>
                  <div
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition ${
                      antiATested ? 'bg-rose-950 border-rose-500 shadow-inner' : 'bg-slate-950 border-dashed border-slate-700'
                    }`}
                  >
                    {antiATested ? (
                      <span className="text-[10px] font-bold text-rose-400 text-center leading-tight">
                        Menggumpal
                        <br />
                        (+++)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">Kosong</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setAntiATested(true);
                    }}
                    className="mt-2 text-[11px] px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white font-semibold rounded-lg cursor-pointer"
                  >
                    Teteskan Anti-A
                  </button>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-amber-400 mb-2">Reagen Serum Anti-B</span>
                  <div
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition ${
                      antiBTested ? 'bg-red-950/40 border-slate-600 shadow-inner' : 'bg-slate-950 border-dashed border-slate-700'
                    }`}
                  >
                    {antiBTested ? (
                      <span className="text-[10px] font-medium text-slate-400 text-center leading-tight">
                        Tidak Menggumpal
                        <br />
                        (—)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">Kosong</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setAntiBTested(true);
                    }}
                    className="mt-2 text-[11px] px-2.5 py-1 bg-amber-700 hover:bg-amber-600 text-white font-semibold rounded-lg cursor-pointer"
                  >
                    Teteskan Anti-B
                  </button>
                </div>
              </div>

              {antiATested && antiBTested && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs text-slate-300 font-bold block text-center">
                    Berdasarkan reaksi aglutinasi di atas, apa golongan darah pasien?
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {['A', 'B', 'AB', 'O'].map((b) => (
                      <button
                        key={b}
                        onClick={() => handlePickBlood(b)}
                        className={`py-2 rounded-xl border font-bold text-sm transition cursor-pointer ${
                          studentBloodGuess === b
                            ? b === 'A'
                              ? 'bg-emerald-600 border-emerald-400 text-white'
                              : 'bg-rose-600 border-rose-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        Gol. {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {studentBloodGuess === 'A' && (
              <button
                onClick={handleNextStep}
                className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition cursor-pointer"
              >
                <span>Lanjut ke Pewarisan Sifat Golongan Darah</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <strong className="text-red-300">Studi Kasus Pewarisan Sifat Golongan Darah Keluarga:</strong>
              <p>
                Ayah Golongan A Heterozigot (<strong>I<sup>A</sup>I<sup>0</sup></strong>) menikah dengan Ibu Golongan B Heterozigot (<strong>I<sup>B</sup>I<sup>0</sup></strong>).
              </p>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-200">Kemungkinan Golongan Darah Anak-anaknya:</span>
                <p className="text-[11px]">• <strong>I<sup>A</sup>I<sup>B</sup></strong> → Golongan AB (25%)</p>
                <p className="text-[11px]">• <strong>I<sup>A</sup>I<sup>0</sup></strong> → Golongan A (25%)</p>
                <p className="text-[11px]">• <strong>I<sup>B</sup>I<sup>0</sup></strong> → Golongan B (25%)</p>
                <p className="text-[11px]">• <strong>I<sup>0</sup>I<sup>0</sup></strong> → Golongan O (25%)</p>
              </div>
            </div>

            <button
              onClick={handleFinishPracticum}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Selesaikan Praktikum & Buka Konsol Soal</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render Level 6: Mendel Core Stabilization
  const renderLevel6 = () => {
    const handleActivateMendel1 = () => {
      soundManager.playPowerUp();
      setReactorMendel1(true);
      setReactorProgress((prev) => Math.min(100, prev + 50));
    };

    const handleActivateMendel2 = () => {
      soundManager.playPowerUp();
      setReactorMendel2(true);
      setReactorProgress((prev) => Math.min(100, prev + 50));
    };

    return (
      <div className="space-y-4">
        <div className="p-3 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed">
          <strong className="text-cyan-300">Tujuan Praktikum Pamungkas:</strong> Menstabilkan Inti Reaktor Mendel sebelum menghadapi <em>Mendel Chaos</em> melalui sinkronisasi simultan <strong>Hukum Segregasi</strong> dan <strong>Hukum Asortasi Bebas</strong>.
        </div>

        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <div>
            <div className="flex justify-between text-xs font-bold text-cyan-300 mb-1">
              <span>Kestabilan Reaktor Inti Mendel:</span>
              <span>{reactorProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${reactorProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div
              className={`p-3 rounded-xl border transition ${
                reactorMendel1 ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <span className="text-xs font-bold block mb-1">Fase 1: Kalibrasi Segregasi (Mendel I)</span>
              <p className="text-[11px] text-slate-400 mb-2">Pemisahan alel diploid (2n) menjadi gamet haploid (n).</p>
              <button
                onClick={handleActivateMendel1}
                disabled={reactorMendel1}
                className={`w-full py-2 rounded-lg font-bold text-xs cursor-pointer ${
                  reactorMendel1 ? 'bg-cyan-900 text-cyan-300 cursor-default' : 'bg-sky-600 hover:bg-sky-500 text-white'
                }`}
              >
                {reactorMendel1 ? '✓ Segregasi Stabil' : 'Aktivasi Kalibrasi Segregasi'}
              </button>
            </div>

            <div
              className={`p-3 rounded-xl border transition ${
                reactorMendel2 ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <span className="text-xs font-bold block mb-1">Fase 2: Kalibrasi Asortasi (Mendel II)</span>
              <p className="text-[11px] text-slate-400 mb-2">Pengelompokan bebas alel dari lokus berbeda ke dalam gamet.</p>
              <button
                onClick={handleActivateMendel2}
                disabled={reactorMendel2}
                className={`w-full py-2 rounded-lg font-bold text-xs cursor-pointer ${
                  reactorMendel2 ? 'bg-emerald-900 text-emerald-300 cursor-default' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {reactorMendel2 ? '✓ Asortasi Stabil' : 'Aktivasi Kalibrasi Asortasi'}
              </button>
            </div>
          </div>
        </div>

        {reactorProgress >= 100 && (
          <div className="p-4 bg-gradient-to-b from-cyan-950/80 to-slate-950 border border-cyan-400/60 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto" />
            <h4 className="font-bold text-sm text-cyan-200">INTI MENDEL TELAH STABIL 100%!</h4>
            <p className="text-xs text-slate-300">
              Kedua hukum pewarisan sifat telah terintegrasi sempurna. Pintu arena pertarungan pamungkas melawan Mendel Chaos kini terbuka luas!
            </p>
            <button
              onClick={handleFinishPracticum}
              className="mt-2 flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Selesaikan Praktikum & Hadapi Boss Pamungkas</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-sky-500/50 rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 border border-sky-400/40 rounded-xl text-sky-400">
              <FlaskConical className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-wide">
                  PRAKTIKUM VIRTUAL 3D — {levelName}
                </h3>
                {isAlreadyDone && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    Selesai ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Wajib diselesaikan untuk membuktikan konsep ilmiah sebelum menghadapi Boss
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 mb-3 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                : feedback.type === 'error'
                ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
                : 'bg-sky-950/70 border-sky-500/50 text-sky-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <Sparkles className="w-4 h-4 shrink-0 text-sky-400" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Module Content */}
        <div className="flex-1 py-1">
          {levelId === 1 && renderLevel1()}
          {levelId === 2 && renderLevel2()}
          {levelId === 3 && renderLevel3()}
          {levelId === 4 && renderLevel4()}
          {levelId === 5 && renderLevel5()}
          {levelId === 6 && renderLevel6()}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Laboratorium Genetika Mendel • Pembelajaran IPA SMP</span>
          <span>
            Peneliti: <strong className="text-slate-300">{stats.name || 'Siswa Peneliti'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
