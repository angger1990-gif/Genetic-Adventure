import { useState, useEffect, useRef } from 'react';
import { Dna } from 'lucide-react';
import { PlayerStats, Question, BossInfo, PlayerItems, InteractableStation3D } from './types/game';
import { LEVELS, QUESTIONS, getBossForLevel, LEVEL_QUIZ_TARGET } from './data/gameData';
import { soundManager } from './audio/soundManager';
import { SaveSystem, INITIAL_PLAYER_STATS } from './storage/saveSystem';
import { ThreeLabScene } from './three/ThreeLabScene';

import { HUD } from './components/HUD';
import { Minimap } from './components/Minimap';
import { TouchControls } from './components/TouchControls';
import { CameraControlsDock } from './components/CameraControlsDock';
import { MainMenu } from './components/MainMenu';
import { HubMenu } from './components/HubMenu';
import { QuizModal } from './components/QuizModal';
import { PunnettModal } from './components/PunnettModal';
import { BossBattleModal } from './components/BossBattleModal';
import { PracticumModal } from './components/PracticumModal';
import { MachineModal } from './components/MachineModal';
import { MissionsModal, LevelProgressReport } from './components/MissionsModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { InventoryModal } from './components/InventoryModal';
import { LearningProfileModal } from './components/LearningProfileModal';
import { AchievementsModal } from './components/AchievementsModal';
import { GuideModal } from './components/GuideModal';
import { SettingsModal } from './components/SettingsModal';
import { StudentRegistrationModal } from './components/StudentRegistrationModal';
import { CreditsModal } from './components/CreditsModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryScreen } from './components/VictoryScreen';

type AppState = 'BOOT' | 'MAIN_MENU' | 'HUB' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';

export default function App() {
  const [gameState, setGameState] = useState<AppState>('BOOT');
  const [stats, setStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);

  // Active Modals
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [showPunnett, setShowPunnett] = useState(false);
  const [activeBoss, setActiveBoss] = useState<BossInfo | null>(null);
  const [activeMachine, setActiveMachine] = useState<'segregasi' | 'asortasi' | null>(null);
  const [showPracticum, setShowPracticum] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Completion modal data
  const [completedLevelData, setCompletedLevelData] = useState<{
    levelId: number;
    levelName: string;
    stars: number;
    xpEarned: number;
    coinsEarned: number;
    energyEarned: number;
    crystalId?: number;
    scorePercent: number;
  } | null>(null);

  // Three.js Mount & Instance References
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const threeSceneRef = useRef<ThreeLabScene | null>(null);
  const statsRef = useRef<PlayerStats>(stats);
  const currentLevelIdRef = useRef<number>(currentLevelId);
  const lastInteractedStationIdRef = useRef<string | null>(null);
  const handleInteractRef = useRef<(stationInput: InteractableStation3D | string) => void>(() => {});
  const [nearbyStation, setNearbyStation] = useState<InteractableStation3D | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [playerMapPos, setPlayerMapPos] = useState<{ x: number; z: number }>({ x: 0, z: 9 });
  const [playerMapRotation, setPlayerMapRotation] = useState<number>(0);
  const [labStations, setLabStations] = useState<InteractableStation3D[]>([]);

  // Performance tracking per level attempt
  const questionsAnsweredInLevel = useRef(0);
  const correctInLevel = useRef(0);
  const hintsUsedInLevel = useRef(0);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const loaded = SaveSystem.load();
    setStats(loaded);

    const timer = setTimeout(() => {
      setGameState('MAIN_MENU');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 2. Auto-save on state change & sync statsRef
  useEffect(() => {
    statsRef.current = stats;
    if (gameState !== 'BOOT') {
      SaveSystem.save(stats);
    }
  }, [stats, gameState]);

  useEffect(() => {
    currentLevelIdRef.current = currentLevelId;
  }, [currentLevelId]);

  // 3. Helper to calculate mission progress for the current level
  const getLevelProgress = (lvlId: number, currentStats: PlayerStats): LevelProgressReport => {
    const levelInfo = LEVELS.find((l) => l.id === lvlId);
    const boss = getBossForLevel(lvlId);

    const isPracticum = !!currentStats.practicumCompleted?.[lvlId];
    const quizCount = currentStats.levelQuizCompleted?.[lvlId] || 0;
    const isQuizDone = quizCount >= LEVEL_QUIZ_TARGET;
    const isPunnett = !!currentStats.levelPunnettCompleted?.[lvlId];
    const isChest = !!currentStats.levelChestOpened?.[lvlId];

    const tasks = [
      {
        id: 'practicum',
        title: 'Praktikum Virtual Laboratorium (Wajib)',
        category: 'Simulasi Lab',
        description: 'Lakukan eksperimen virtual membuktikan konsep sains pewarisan sifat level ini.',
        isDone: isPracticum,
        progressText: isPracticum ? 'Selesai ✓' : 'Belum Selesai',
        icon: '🧪',
        actionLabel: 'Buka Praktikum',
      },
      {
        id: 'quiz',
        title: 'Konsol Kuis Genetika Lab',
        category: 'Uji Pemahaman',
        description: `Jawab minimal ${LEVEL_QUIZ_TARGET} soal dengan benar di Konsol Kuis A / B.`,
        isDone: isQuizDone,
        progressText: `${quizCount}/${LEVEL_QUIZ_TARGET} Soal Benar`,
        icon: '💡',
        actionLabel: 'Jawab Kuis',
      },
      {
        id: 'punnett',
        title: 'Terminal Punnett Square',
        category: 'Simulasi Persilangan',
        description: 'Validasi minimal 1 kali perhitungan persilangan di Terminal Punnett Square.',
        isDone: isPunnett,
        progressText: isPunnett ? 'Tervalidasi ✓' : 'Belum Divalidasi',
        icon: '📊',
        actionLabel: 'Buka Punnett',
      },
      {
        id: 'chest',
        title: 'Kapsul Suplai Perbekalan Lab',
        category: 'Inventaris & Energi',
        description: 'Buka kapsul peti suplai hijau di lab untuk perbekalan amunisi energi & item.',
        isDone: isChest,
        progressText: isChest ? 'Suplai Diambil ✓' : 'Belum Diambil',
        icon: '📦',
        actionLabel: 'Cari di Lab',
      },
    ];

    let m1 = false;
    let m2 = false;
    if (lvlId === 6) {
      m1 = !!currentStats.levelMachinesCompleted?.segregasi;
      m2 = !!currentStats.levelMachinesCompleted?.asortasi;
      tasks.push({
        id: 'machine1',
        title: 'Mesin I — Hukum Segregasi (Mendel I)',
        category: 'Kalibrasi Reaktor',
        description: 'Tarik tuas pemisah alel gamet monohibrid (Aa → A + a) untuk menyalakan reaktor pertama.',
        isDone: m1,
        progressText: m1 ? 'Terkalibrasi ✓' : 'Belum Aktif',
        icon: '⚙️',
        actionLabel: 'Kalibrasi Mesin I',
      });
      tasks.push({
        id: 'machine2',
        title: 'Mesin II — Asortasi Bebas (Mendel II)',
        category: 'Distributor Gamet',
        description: 'Distribusikan 4 kombinasi gamet dihibrid bebas (AaBb → AB, Ab, aB, ab).',
        isDone: m2,
        progressText: m2 ? 'Terkalibrasi ✓' : 'Belum Aktif',
        icon: '⚡',
        actionLabel: 'Kalibrasi Mesin II',
      });
    }

    const total = tasks.length;
    const completed = tasks.filter((t) => t.isDone).length;
    const allDone = completed === total;

    return {
      levelId: lvlId,
      levelName: levelInfo?.name || `Level ${lvlId}`,
      bossName: boss.name,
      bossHp: boss.hp,
      bossAvatarEmoji: boss.avatarEmoji,
      practicum: isPracticum,
      quizCorrect: quizCount,
      quizTarget: LEVEL_QUIZ_TARGET,
      quizDone: isQuizDone,
      punnett: isPunnett,
      chest: isChest,
      machine1: lvlId === 6 ? m1 : undefined,
      machine2: lvlId === 6 ? m2 : undefined,
      totalTasks: total,
      completedTasks: completed,
      allDone,
      tasks,
    };
  };

  // 4. Initialize Three.js 3D Lab Scene when PLAYING
  useEffect(() => {
    if (gameState === 'PLAYING' && canvasMountRef.current) {
      const levelInfo = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];
      const scene3D = new ThreeLabScene(canvasMountRef.current, levelInfo);
      threeSceneRef.current = scene3D;

      // Update boss portal visual state
      const prog = getLevelProgress(currentLevelId, statsRef.current);
      scene3D.setBossPortalUnlocked(prog.allDone);
      setLabStations(scene3D.stations);
      setPlayerMapPos({ x: scene3D.playerPos.x, z: scene3D.playerPos.z });
      setPlayerMapRotation(scene3D.playerRotation);

      // Proximity update callback to update React state
      scene3D.onProximityChange = (station) => {
        setNearbyStation(station);
      };

      // Real-time player movement callback for Minimap radar (~30 FPS throttle)
      let lastMapTime = 0;
      scene3D.onPlayerMove = (pos, rot) => {
        const now = performance.now();
        if (now - lastMapTime > 30) {
          lastMapTime = now;
          setPlayerMapPos({ x: pos.x, z: pos.z });
          setPlayerMapRotation(rot);
        }
      };

      // Station interaction callback (uses ref to avoid stale closures)
      scene3D.onStationInteract = (station) => {
        handleInteractRef.current?.(station);
      };

      scene3D.start();
      soundManager.startBgm('lab');

      return () => {
        scene3D.dispose();
        threeSceneRef.current = null;
      };
    }
  }, [gameState, currentLevelId]);

  // Sync Boss Portal status when stats change
  useEffect(() => {
    if (threeSceneRef.current && gameState === 'PLAYING') {
      const prog = getLevelProgress(currentLevelId, stats);
      threeSceneRef.current.setBossPortalUnlocked(prog.allDone);
    }
  }, [stats, currentLevelId, gameState]);

  // 5. Keyboard Navigation & Controls
  useEffect(() => {
    const activeKeys = new Set<string>();

    const updateMovement = () => {
      if (!threeSceneRef.current || gameState !== 'PLAYING') return;

      let x = 0;
      let z = 0;
      if (activeKeys.has('KeyW') || activeKeys.has('ArrowUp') || activeKeys.has('w')) z -= 1;
      if (activeKeys.has('KeyS') || activeKeys.has('ArrowDown') || activeKeys.has('s')) z += 1;
      if (activeKeys.has('KeyA') || activeKeys.has('ArrowLeft') || activeKeys.has('a')) x -= 1;
      if (activeKeys.has('KeyD') || activeKeys.has('ArrowRight') || activeKeys.has('d')) x += 1;

      threeSceneRef.current.setMovement(x, z);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const hasAnyModal =
        activeQuestion ||
        showPunnett ||
        activeBoss ||
        activeMachine ||
        showPracticum ||
        showMissions ||
        showInventory ||
        showProfile ||
        showAchievements ||
        showGuide ||
        showSettings ||
        showRegistration ||
        showCredits ||
        completedLevelData;

      if (e.key === 'Escape') {
        if (hasAnyModal) {
          closeAllModals();
        } else if (gameState === 'PLAYING') {
          setIsPaused((prev) => !prev);
        }
        return;
      }

      if (!hasAnyModal && gameState === 'PLAYING') {
        if (e.key === 'e' || e.key === 'E') {
          threeSceneRef.current?.triggerInteraction();
        } else if (e.key === 'i' || e.key === 'I') {
          setShowInventory((prev) => !prev);
        } else if (e.key === 'c' || e.key === 'C') {
          // Cycle camera mode
          const modes: Array<'third_person' | 'close' | 'top_down' | 'isometric'> = [
            'third_person',
            'close',
            'top_down',
            'isometric',
          ];
          const curr = threeSceneRef.current?.cameraMode || 'third_person';
          const nextIdx = (modes.indexOf(curr) + 1) % modes.length;
          threeSceneRef.current?.setCameraMode(modes[nextIdx]);
        } else {
          activeKeys.add(e.code);
          activeKeys.add(e.key);
          updateMovement();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeKeys.delete(e.code);
      activeKeys.delete(e.key);
      updateMovement();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    gameState,
    activeQuestion,
    showPunnett,
    activeBoss,
    activeMachine,
    showPracticum,
    showMissions,
    showInventory,
    showProfile,
    showAchievements,
    showGuide,
    showSettings,
    showRegistration,
    showCredits,
    completedLevelData,
  ]);

  const closeAllModals = () => {
    setActiveQuestion(null);
    setShowPunnett(false);
    setActiveBoss(null);
    setActiveMachine(null);
    setShowPracticum(false);
    setShowMissions(false);
    setShowInventory(false);
    setShowProfile(false);
    setShowAchievements(false);
    setShowGuide(false);
    setShowSettings(false);
    setShowRegistration(false);
    setShowCredits(false);
    setIsPaused(false);
    setCompletedLevelData(null);
  };

  // Station Interaction Dispatcher (prevents stale closure & clears previous modals first)
  const handleInteractWithStation = (stationInput: InteractableStation3D | string) => {
    // 1. Clear any open task modals first to prevent lingering/overlapping dialog states
    setActiveQuestion(null);
    setShowPunnett(false);
    setActiveBoss(null);
    setActiveMachine(null);
    setShowPracticum(false);
    setShowMissions(false);

    // 2. Resolve target station type and station ID reliably
    let targetType: string | undefined;
    let targetId: string | undefined;

    if (typeof stationInput === 'string') {
      targetType = stationInput;
      targetId = stationInput;
    } else if (stationInput && typeof stationInput === 'object') {
      targetType = stationInput.type;
      targetId = stationInput.id || stationInput.type;
    }

    // Fallback: check 3D scene nearby station if not explicitly supplied
    if (!targetType && threeSceneRef.current?.nearbyStation) {
      targetType = threeSceneRef.current.nearbyStation.type;
      targetId = threeSceneRef.current.nearbyStation.id;
    }

    if (!targetType) return;

    // Record last interacted station ID in ref
    lastInteractedStationIdRef.current = targetId || targetType;

    // Use current refs to avoid stale closure state
    const currentStats = statsRef.current;
    const lvlId = currentLevelIdRef.current;

    soundManager.playClick();

    if (targetType === 'practicum') {
      setShowPracticum(true);
      return;
    }

    if (targetType === 'boss_portal') {
      const prog = getLevelProgress(lvlId, currentStats);
      if (!prog.allDone) {
        soundManager.playWrong();
        setShowMissions(true);
      } else {
        soundManager.playLaserShoot();
        soundManager.startBgm('boss');
        setActiveBoss(getBossForLevel(lvlId));
      }
      return;
    }

    if (targetType === 'terminal_a' || targetType === 'terminal_b') {
      const levelQs = QUESTIONS.filter((q) => q.level === lvlId);
      if (levelQs.length > 0) {
        const randQ = levelQs[Math.floor(Math.random() * levelQs.length)];
        setActiveQuestion(randQ);
      }
      return;
    }

    if (targetType === 'punnett') {
      setShowPunnett(true);
      return;
    }

    if (targetType === 'chest') {
      if (currentStats.levelChestOpened?.[lvlId]) {
        soundManager.playClick();
        setToastMessage('📦 Kapsul Suplai Lab sudah dibuka sebelumnya untuk level ini.');
        setTimeout(() => setToastMessage(null), 3000);
      } else {
        soundManager.playPowerUp();
        setStats((prev) => ({
          ...prev,
          coins: prev.coins + 25,
          energy: prev.energy + 2,
          levelChestOpened: { ...prev.levelChestOpened, [lvlId]: true },
          items: { ...prev.items, geneScanner: prev.items.geneScanner + 1 },
        }));
        setToastMessage('🎉 Kapsul Suplai Dibuka! +25 Koin DNA, +2 Energi, +1 Gene Scanner!');
        setTimeout(() => setToastMessage(null), 3500);
      }
      return;
    }

    if (targetType === 'machine1') {
      setActiveMachine('segregasi');
      return;
    }

    if (targetType === 'machine2') {
      setActiveMachine('asortasi');
      return;
    }
  };

  // Keep handleInteractRef fresh across all renders without re-subscribing 3D scene
  useEffect(() => {
    handleInteractRef.current = handleInteractWithStation;
  });

  // Answering a quiz question
  const handleAnswerQuestion = (isCorrect: boolean, earnedXp: number, earnedEnergy: number, usedHint: boolean) => {
    questionsAnsweredInLevel.current += 1;
    if (usedHint) hintsUsedInLevel.current += 1;
    if (isCorrect) correctInLevel.current += 1;

    setStats((prev) => {
      const nextCombo = isCorrect ? prev.combo + 1 : 0;
      const nextHighest = Math.max(prev.highestCombo, nextCombo);
      const category = activeQuestion?.category || 'genetics_terms';

      const nextCatCorrect = {
        ...prev.categoryCorrect,
        [category]: (prev.categoryCorrect[category] || 0) + (isCorrect ? 1 : 0),
      };
      const nextCatTotal = {
        ...prev.categoryTotal,
        [category]: (prev.categoryTotal[category] || 0) + 1,
      };

      const currQuizCount = prev.levelQuizCompleted?.[currentLevelId] || 0;
      const nextLevelQuiz = {
        ...prev.levelQuizCompleted,
        [currentLevelId]: currQuizCount + (isCorrect ? 1 : 0),
      };

      const nextAchievements = [...prev.achievements];
      if (nextCombo >= 10 && !nextAchievements.includes('ach_combo_master')) {
        nextAchievements.push('ach_combo_master');
      }

      return {
        ...prev,
        xp: prev.xp + earnedXp,
        coins: prev.coins + (isCorrect ? 10 : 0),
        energy: prev.energy + earnedEnergy,
        combo: nextCombo,
        highestCombo: nextHighest,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        hintsUsed: prev.hintsUsed + (usedHint ? 1 : 0),
        levelQuizCompleted: nextLevelQuiz,
        categoryCorrect: nextCatCorrect,
        categoryTotal: nextCatTotal,
        achievements: nextAchievements,
      };
    });
  };

  // Player takes damage
  const handlePlayerDamage = () => {
    setStats((prev) => {
      const nextHp = Math.max(0, prev.hp - 1);
      if (nextHp <= 0) {
        soundManager.playGameOver();
        soundManager.stopBgm();
        setGameState('GAME_OVER');
        setActiveBoss(null);
      }
      return {
        ...prev,
        hp: nextHp,
        combo: 0,
      };
    });
  };

  // Boss defeated
  const handleBossDefeated = (rewardXp: number, rewardCoins: number, crystalReward: number) => {
    setActiveBoss(null);
    soundManager.playLevelComplete();
    soundManager.startBgm('lab');

    const totalAttempted = Math.max(1, questionsAnsweredInLevel.current);
    const scorePct = Math.round((correctInLevel.current / totalAttempted) * 100) || 85;
    const stars = SaveSystem.calculateLevelStars(scorePct, hintsUsedInLevel.current);
    const isFinalLevel = currentLevelId === 6;

    setStats((prev) => {
      const nextCrystals = prev.crystals.includes(crystalReward)
        ? prev.crystals
        : [...prev.crystals, crystalReward];

      const nextCompleted = prev.completedLevels.includes(currentLevelId)
        ? prev.completedLevels
        : [...prev.completedLevels, currentLevelId];

      const nextUnlocked =
        currentLevelId < 6 && !prev.unlockedLevels.includes(currentLevelId + 1)
          ? [...prev.unlockedLevels, currentLevelId + 1]
          : prev.unlockedLevels;

      const nextStars = {
        ...prev.levelStars,
        [currentLevelId]: Math.max(prev.levelStars[currentLevelId] || 0, stars),
      };

      const nextAchievements = [...prev.achievements];
      const lvlInfo = LEVELS.find((l) => l.id === currentLevelId);
      if (lvlInfo?.achievementId && !nextAchievements.includes(lvlInfo.achievementId)) {
        nextAchievements.push(lvlInfo.achievementId);
      }
      if (scorePct >= 100 && !nextAchievements.includes('ach_perfect_genetician')) {
        nextAchievements.push('ach_perfect_genetician');
      }
      if (hintsUsedInLevel.current === 0 && !nextAchievements.includes('ach_no_hint_hero')) {
        nextAchievements.push('ach_no_hint_hero');
      }
      if (isFinalLevel && !nextAchievements.includes('ach_mendel_master')) {
        nextAchievements.push('ach_mendel_master');
      }

      return {
        ...prev,
        xp: prev.xp + rewardXp,
        coins: prev.coins + rewardCoins,
        energy: prev.energy + 5,
        crystals: nextCrystals,
        completedLevels: nextCompleted,
        unlockedLevels: nextUnlocked,
        levelStars: nextStars,
        achievements: nextAchievements,
      };
    });

    const levelInfo = LEVELS.find((l) => l.id === currentLevelId);
    setCompletedLevelData({
      levelId: currentLevelId,
      levelName: levelInfo?.name || `Level ${currentLevelId}`,
      stars,
      xpEarned: rewardXp,
      coinsEarned: rewardCoins,
      energyEarned: 5,
      crystalId: crystalReward,
      scorePercent: scorePct,
    });
  };

  // Item usage
  const handleUseItem = (itemKey: keyof PlayerItems) => {
    setStats((prev) => {
      const count = prev.items[itemKey] || 0;
      if (count <= 0) return prev;

      let nextHp = prev.hp;
      let nextShield = prev.activeShield;

      if (itemKey === 'lifeCell') {
        nextHp = Math.min(prev.maxHp, prev.hp + 1);
        soundManager.playPowerUp();
      } else if (itemKey === 'geneticShield') {
        nextShield = true;
      }

      return {
        ...prev,
        hp: nextHp,
        activeShield: nextShield,
        hintsUsed: prev.hintsUsed + (itemKey === 'geneScanner' ? 1 : 0),
        items: {
          ...prev.items,
          [itemKey]: count - 1,
        },
      };
    });
  };

  // Buy item
  const handleBuyItem = (itemKey: keyof PlayerItems, cost: number) => {
    if (stats.coins < cost) return;
    setStats((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      items: {
        ...prev.items,
        [itemKey]: (prev.items[itemKey] || 0) + 1,
      },
    }));
  };

  // Enter a Level
  const enterLevel = (levelId: number) => {
    setCurrentLevelId(levelId);
    questionsAnsweredInLevel.current = 0;
    correctInLevel.current = 0;
    hintsUsedInLevel.current = 0;
    setGameState('PLAYING');
    setToastMessage(
      `🔬 Masuk ke ${LEVELS.find((l) => l.id === levelId)?.name || 'Laboratorium'}. Dekati stasiun & tekan [E] untuk berinteraksi!`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveStudent = (name: string, schoolClass: string, avatar: 'researcher_m' | 'researcher_f') => {
    setStats((prev) => ({
      ...prev,
      name,
      schoolClass,
      avatar,
    }));
    setShowRegistration(false);
    setGameState('HUB');
  };

  const currentLevelInfo = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];
  const progressReport = getLevelProgress(currentLevelId, stats);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none flex flex-col justify-center items-center">
      {/* 1. BOOT SCREEN */}
      {gameState === 'BOOT' && (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <Dna className="w-16 h-16 text-sky-400 animate-spin" />
          <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">
            GENETIC ADVENTURE 3D
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-wider">
            Menginisialisasi Laboratorium Genetika Mendel 3D...
          </p>
          <div className="text-[11px] text-slate-500">Reni Istiningrum — Guru IPA SMPN 1 Pagu</div>
        </div>
      )}

      {/* 2. MAIN MENU */}
      {gameState === 'MAIN_MENU' && (
        <MainMenu
          hasSaveData={SaveSystem.hasSaveData()}
          playerName={stats.name}
          onStartNew={() => {
            if (!stats.name || stats.name === 'Siswa Peneliti') {
              setShowRegistration(true);
            } else {
              setGameState('HUB');
            }
          }}
          onContinue={() => {
            if (!stats.name || stats.name === 'Siswa Peneliti') {
              setShowRegistration(true);
            } else {
              setGameState('HUB');
            }
          }}
          onRegisterPlayer={() => setShowRegistration(true)}
          onSelectLevel={() => {
            if (!stats.name || stats.name === 'Siswa Peneliti') {
              setShowRegistration(true);
            } else {
              setGameState('HUB');
            }
          }}
          onAchievements={() => setShowAchievements(true)}
          onGuide={() => setShowGuide(true)}
          onSettings={() => setShowSettings(true)}
          onCredits={() => setShowCredits(true)}
        />
      )}

      {/* 3. GENETIC HUB LEVEL SELECTOR */}
      {gameState === 'HUB' && (
        <HubMenu
          stats={stats}
          onEnterLevel={enterLevel}
          onEditStudent={() => setShowRegistration(true)}
          onOpenAchievements={() => setShowAchievements(true)}
          onOpenInventory={() => setShowInventory(true)}
          onOpenLibrary={() => setShowGuide(true)}
          onOpenProfile={() => setShowProfile(true)}
          onBackToMenu={() => setGameState('MAIN_MENU')}
        />
      )}

      {/* 4. 3D PLAYING LAB ENVIRONMENT */}
      {gameState === 'PLAYING' && (
        <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
          {/* Top Viewport-First HUD */}
          <HUD
            stats={stats}
            currentLevelId={currentLevelId}
            currentLevelName={currentLevelInfo.name}
            isBossReady={progressReport.allDone}
            tasksCompleted={progressReport.completedTasks}
            totalTasks={progressReport.totalTasks}
            onPause={() => setIsPaused(true)}
            onOpenInventory={() => setShowInventory(true)}
            onOpenPracticum={() => setShowPracticum(true)}
            onOpenMissions={() => setShowMissions(true)}
          />

          {/* Stable Three.js WebGL Mount Container */}
          <div ref={canvasMountRef} className="w-full h-full absolute inset-0 z-0" />

          {/* Minimap Navigation Radar (Bottom-Left Corner) */}
          <Minimap
            stations={labStations.length > 0 ? labStations : threeSceneRef.current?.stations || []}
            nearbyStation={nearbyStation}
            isBossPortalUnlocked={progressReport.allDone}
            playerPos={playerMapPos}
            playerRotation={playerMapRotation}
            completedTaskIds={progressReport.tasks.filter((t) => t.isDone).map((t) => t.id)}
            currentLevelId={currentLevelId}
            onInteractStation={(station) => handleInteractWithStation(station)}
          />

          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-sky-400 text-sky-200 px-4 py-2 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce pointer-events-none">
              <Dna className="w-4 h-4 text-sky-400 shrink-0 animate-spin" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Bottom Camera Controls & Sound Dock */}
          <CameraControlsDock
            currentMode={threeSceneRef.current?.cameraMode || 'third_person'}
            onSelectMode={(mode) => threeSceneRef.current?.setCameraMode(mode)}
            nearbyStationTitle={nearbyStation?.title || null}
            onInteract={() => threeSceneRef.current?.triggerInteraction()}
          />

          {/* Touch D-Pad & Controls for Mobile / Tablet */}
          <TouchControls
            onMove={(x, z) => threeSceneRef.current?.setMovement(x, z)}
            onInteract={() => threeSceneRef.current?.triggerInteraction()}
            onOpenInventory={() => setShowInventory(true)}
            onPause={() => setIsPaused(true)}
          />
        </div>
      )}

      {/* PAUSE MODAL */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center shadow-2xl flex flex-col gap-2.5 text-slate-100">
            <h3 className="text-lg font-black text-slate-100 mb-1">PETUALANGAN DIJEDA</h3>
            <button
              onClick={() => {
                soundManager.playClick();
                setIsPaused(false);
              }}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Lanjutkan (Resume)
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setShowGuide(true);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              Panduan Bermain
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setShowSettings(true);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              Pengaturan Suara
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setIsPaused(false);
                setGameState('HUB');
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              Kembali ke Genetic Hub
            </button>
          </div>
        </div>
      )}

      {/* QUIZ CHALLENGE MODAL */}
      {activeQuestion && (
        <QuizModal
          question={activeQuestion}
          stats={stats}
          onAnswer={handleAnswerQuestion}
          onClose={() => setActiveQuestion(null)}
          onUseItem={() => handleUseItem('geneScanner')}
        />
      )}

      {/* PUNNETT SQUARE MODAL */}
      {showPunnett && (
        <PunnettModal
          initialParent1={currentLevelId >= 5 ? 'KkBb' : currentLevelId >= 3 ? 'BbLl' : 'Mm'}
          initialParent2={currentLevelId >= 5 ? 'KkBb' : currentLevelId >= 3 ? 'BbLl' : 'Mm'}
          stats={stats}
          onSuccess={(earnedXp, earnedEnergy) => {
            setStats((prev) => ({
              ...prev,
              xp: prev.xp + earnedXp,
              energy: prev.energy + earnedEnergy,
              levelPunnettCompleted: { ...prev.levelPunnettCompleted, [currentLevelId]: true },
            }));
          }}
          onClose={() => setShowPunnett(false)}
          onUseItem={() => handleUseItem('punnettScanner')}
        />
      )}

      {/* BOSS BATTLE MODAL */}
      {activeBoss && (
        <BossBattleModal
          boss={activeBoss}
          levelQuestions={QUESTIONS.filter((q) => q.level === currentLevelId)}
          stats={stats}
          onPlayerTakeDamage={handlePlayerDamage}
          onBossDefeated={handleBossDefeated}
          onClose={() => setActiveBoss(null)}
          onUseItem={(key) => handleUseItem(key)}
          onConsumeEnergy={(amount) => {
            if (stats.energy < amount) return false;
            setStats((prev) => ({ ...prev, energy: prev.energy - amount }));
            return true;
          }}
        />
      )}

      {/* MACHINE MODAL (LEVEL 6) */}
      {activeMachine && (
        <MachineModal
          machineType={activeMachine}
          onCompleted={(earnedXp, earnedEnergy) => {
            setStats((prev) => ({
              ...prev,
              xp: prev.xp + earnedXp,
              energy: prev.energy + earnedEnergy,
              levelMachinesCompleted: {
                ...prev.levelMachinesCompleted,
                [activeMachine]: true,
              },
            }));
          }}
          onClose={() => setActiveMachine(null)}
        />
      )}

      {/* MISSIONS / BOSS REQUIREMENTS MODAL */}
      {showMissions && (
        <MissionsModal
          progress={progressReport}
          onClose={() => setShowMissions(false)}
          onEnterBoss={() => {
            setShowMissions(false);
            soundManager.playLaserShoot();
            soundManager.startBgm('boss');
            setActiveBoss(getBossForLevel(currentLevelId));
          }}
          onOpenPracticum={() => {
            setShowMissions(false);
            setShowPracticum(true);
          }}
          onOpenQuiz={() => {
            setShowMissions(false);
            const levelQs = QUESTIONS.filter((q) => q.level === currentLevelId);
            if (levelQs.length > 0) {
              const randQ = levelQs[Math.floor(Math.random() * levelQs.length)];
              setActiveQuestion(randQ);
            }
          }}
          onOpenPunnett={() => {
            setShowMissions(false);
            setShowPunnett(true);
          }}
          onOpenMachine={(mType) => {
            setShowMissions(false);
            setActiveMachine(mType);
          }}
        />
      )}

      {/* PRACTICUM MODAL */}
      {showPracticum && (
        <PracticumModal
          levelId={currentLevelId}
          levelName={currentLevelInfo.name}
          stats={stats}
          onComplete={(earnedXp, earnedEnergy) => {
            setStats((prev) => ({
              ...prev,
              xp: prev.xp + earnedXp,
              energy: prev.energy + earnedEnergy,
              practicumCompleted: {
                ...prev.practicumCompleted,
                [currentLevelId]: true,
              },
            }));
            setShowPracticum(false);
          }}
          onClose={() => setShowPracticum(false)}
        />
      )}

      {/* LEVEL COMPLETED MODAL */}
      {completedLevelData && (
        <LevelCompleteModal
          levelId={completedLevelData.levelId}
          levelName={completedLevelData.levelName}
          stars={completedLevelData.stars}
          xpEarned={completedLevelData.xpEarned}
          coinsEarned={completedLevelData.coinsEarned}
          energyEarned={completedLevelData.energyEarned}
          crystalId={completedLevelData.crystalId}
          scorePercent={completedLevelData.scorePercent}
          onNextLevel={() => {
            setCompletedLevelData(null);
            if (currentLevelId < 6) {
              enterLevel(currentLevelId + 1);
            } else {
              setGameState('VICTORY');
            }
          }}
          onReplay={() => {
            setCompletedLevelData(null);
            enterLevel(currentLevelId);
          }}
          onReturnToHub={() => {
            setCompletedLevelData(null);
            setGameState('HUB');
          }}
        />
      )}

      {/* INVENTORY & SHOP MODAL */}
      {showInventory && (
        <InventoryModal
          stats={stats}
          onUseItem={handleUseItem}
          onBuyItem={handleBuyItem}
          onClose={() => setShowInventory(false)}
        />
      )}

      {/* LEARNING PROFILE & REPORT MODAL */}
      {showProfile && (
        <LearningProfileModal stats={stats} onClose={() => setShowProfile(false)} />
      )}

      {/* ACHIEVEMENTS MODAL */}
      {showAchievements && (
        <AchievementsModal stats={stats} onClose={() => setShowAchievements(false)} />
      )}

      {/* GUIDE MODAL */}
      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <SettingsModal
          playerName={stats.name}
          onUpdatePlayerName={(newName) => {
            setStats((prev) => ({ ...prev, name: newName }));
          }}
          onResetData={() => {
            const fresh = SaveSystem.reset();
            setStats(fresh);
            setGameState('MAIN_MENU');
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* STUDENT REGISTRATION MODAL */}
      {showRegistration && (
        <StudentRegistrationModal
          currentName={stats.name}
          currentClass={stats.schoolClass}
          currentAvatar={stats.avatar}
          onSave={handleSaveStudent}
          onClose={() => setShowRegistration(false)}
        />
      )}

      {/* CREDITS MODAL */}
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}

      {/* GAME OVER MODAL */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          onRetry={() => {
            setStats((prev) => ({ ...prev, hp: prev.maxHp }));
            setGameState('PLAYING');
            enterLevel(currentLevelId);
          }}
          onReturnToHub={() => setGameState('HUB')}
        />
      )}

      {/* VICTORY OVERALL MODAL */}
      {gameState === 'VICTORY' && !showProfile && (
        <VictoryScreen
          onOpenReport={() => setShowProfile(true)}
          onReturnToHub={() => setGameState('HUB')}
        />
      )}
    </div>
  );
}
