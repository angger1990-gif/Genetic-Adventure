import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Crosshair,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  Lock,
  Unlock,
  Navigation,
  Eye,
  Info,
} from 'lucide-react';
import { InteractableStation3D } from '../types/game';

interface MinimapProps {
  stations: InteractableStation3D[];
  nearbyStation: InteractableStation3D | null;
  isBossPortalUnlocked: boolean;
  playerPos: { x: number; z: number };
  playerRotation: number;
  completedTaskIds?: string[];
  currentLevelId: number;
  onInteractStation?: (station: InteractableStation3D) => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  stations,
  nearbyStation,
  isBossPortalUnlocked,
  playerPos,
  playerRotation,
  completedTaskIds = [],
  currentLevelId,
  onInteractStation,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [selectedStation, setSelectedStation] = useState<InteractableStation3D | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Map world boundary scale: lab floor radius is ~17.5 units
  const MAP_WORLD_RADIUS = 18.0;

  // Station theme colors & styling
  const getStationVisuals = (st: InteractableStation3D) => {
    switch (st.type) {
      case 'practicum':
        return { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.25)', label: 'Praktikum', icon: '🧪' };
      case 'terminal_a':
        return { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.25)', label: 'Kuis A', icon: '💡' };
      case 'terminal_b':
        return { color: '#818cf8', bg: 'rgba(129, 140, 248, 0.25)', label: 'Kuis B', icon: '🔬' };
      case 'punnett':
        return { color: '#34d399', bg: 'rgba(52, 211, 153, 0.25)', label: 'Punnett', icon: '📊' };
      case 'chest':
        return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.25)', label: 'Peti Suplai', icon: '📦' };
      case 'boss_portal':
        return {
          color: isBossPortalUnlocked ? '#f59e0b' : '#f87171',
          bg: isBossPortalUnlocked ? 'rgba(245, 158, 11, 0.35)' : 'rgba(248, 113, 113, 0.25)',
          label: isBossPortalUnlocked ? 'Portal Boss (Terbuka)' : 'Portal Boss (Terkunci)',
          icon: isBossPortalUnlocked ? '⚔️' : '🔒',
        };
      case 'machine1':
        return { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.25)', label: 'Mesin Segregasi', icon: '⚙️' };
      case 'machine2':
        return { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.25)', label: 'Mesin Asortasi', icon: '⚡' };
      default:
        return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.25)', label: st.title, icon: '📍' };
    }
  };

  // Convert 3D world coord to 2D Canvas coord
  const worldToCanvas = (x: number, z: number, width: number, height: number) => {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 14;

    // x is east (+)/west (-), z is south (+)/north (-)
    // On radar, north is up (-z), south is down (+z)
    const px = cx + (x / MAP_WORLD_RADIUS) * radius;
    const py = cy + (z / MAP_WORLD_RADIUS) * radius;

    return { px, py, radius };
  };

  // Render Sci-Fi Holographic Radar Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isExpanded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = 210;
    const height = 210;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const radarRadius = Math.min(cx, cy) - 14;

    // 1. Radar Circular Background with Glow
    const bgGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, radarRadius);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.75, '#070e1b');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radarRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Concentric Distance Grid Rings (5m, 10m, 15m)
    const rings = [0.33, 0.66, 1.0];
    rings.forEach((rFrac, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radarRadius * rFrac, 0, Math.PI * 2);
      ctx.strokeStyle = i === 2 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = i === 2 ? 1.5 : 0.8;
      if (i < 2) ctx.setLineDash([3, 4]);
      else ctx.setLineDash([]);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // 3. Coordinate Crosshairs (Subtle Grid)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx - radarRadius, cy);
    ctx.lineTo(cx + radarRadius, cy);
    ctx.moveTo(cx, cy - radarRadius);
    ctx.lineTo(cx, cy + radarRadius);
    ctx.stroke();

    // 4. Cardinal Direction Labels (N, S, E, W)
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.fillText('U', cx, cy - radarRadius + 7); // Utara (North)
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.fillText('S', cx, cy + radarRadius - 7); // Selatan (South)
    ctx.fillText('B', cx - radarRadius + 7, cy); // Barat (West)
    ctx.fillText('T', cx + radarRadius - 7, cy); // Timur (East)

    // 5. Central DNA Helix Monument (0, 0)
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 6. Draw Stations
    stations.forEach((st) => {
      const { px, py } = worldToCanvas(st.x, st.z, width, height);
      const isNearby = nearbyStation?.id === st.id;
      const isCompleted =
        (st.type === 'practicum' && completedTaskIds.includes('practicum')) ||
        (st.type.startsWith('terminal') && completedTaskIds.includes('quiz')) ||
        (st.type === 'punnett' && completedTaskIds.includes('punnett')) ||
        (st.type === 'chest' && completedTaskIds.includes('chest')) ||
        (st.type === 'machine1' && completedTaskIds.includes('machine1')) ||
        (st.type === 'machine2' && completedTaskIds.includes('machine2'));

      const visual = getStationVisuals(st);

      // Pulse ring if player is nearby
      if (isNearby) {
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.strokeStyle = visual.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, 15, 0, Math.PI * 2);
        ctx.strokeStyle = `${visual.color}55`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Station Base Circle
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = isCompleted ? '#065f46' : visual.color;
      ctx.fill();
      ctx.strokeStyle = isCompleted ? '#34d399' : '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Station Center Dot or Completed Mark
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Completed check ring
      if (isCompleted) {
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    });

    // 7. Player Blip & Facing Direction Cone
    const { px: pX, py: pY } = worldToCanvas(playerPos.x, playerPos.z, width, height);

    // Direction vector from playerRotation
    // In our coordinate system:
    // dx = Math.sin(playerRotation)
    // dy = Math.cos(playerRotation)
    const viewAngle = playerRotation;
    const coneDist = 20;
    const halfFov = 0.42; // ~24 degrees

    // Forward vision cone (Holographic Field-Of-View)
    const leftAngle = viewAngle - halfFov;
    const rightAngle = viewAngle + halfFov;

    const xLeft = pX + Math.sin(leftAngle) * coneDist;
    const yLeft = pY + Math.cos(leftAngle) * coneDist;
    const xRight = pX + Math.sin(rightAngle) * coneDist;
    const yRight = pY + Math.cos(rightAngle) * coneDist;

    const coneGrad = ctx.createRadialGradient(pX, pY, 2, pX, pY, coneDist);
    coneGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
    coneGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.12)');
    coneGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

    ctx.beginPath();
    ctx.moveTo(pX, pY);
    ctx.lineTo(xLeft, yLeft);
    ctx.arc(pX, pY, coneDist, Math.atan2(yLeft - pY, xLeft - pX), Math.atan2(yRight - pY, xRight - pX));
    ctx.closePath();
    ctx.fillStyle = coneGrad;
    ctx.fill();

    // Directional Pointer Arrow
    const tipX = pX + Math.sin(viewAngle) * 9;
    const tipY = pY + Math.cos(viewAngle) * 9;
    const backAngle1 = viewAngle + Math.PI - 0.7;
    const backAngle2 = viewAngle + Math.PI + 0.7;
    const b1X = pX + Math.sin(backAngle1) * 5;
    const b1Y = pY + Math.cos(backAngle1) * 5;
    const b2X = pX + Math.sin(backAngle2) * 5;
    const b2Y = pY + Math.cos(backAngle2) * 5;

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(b1X, b1Y);
    ctx.lineTo(pX, pY);
    ctx.lineTo(b2X, b2Y);
    ctx.closePath();
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Player core center blip
    ctx.beginPath();
    ctx.arc(pX, pY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }, [playerPos, playerRotation, stations, nearbyStation, isBossPortalUnlocked, completedTaskIds, isExpanded]);

  // Click on canvas to inspect/select closest station
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = 210;
    const height = 210;

    let closest: InteractableStation3D | null = null;
    let minDist = 20; // 20px threshold

    stations.forEach((st) => {
      const { px, py } = worldToCanvas(st.x, st.z, width, height);
      const dist = Math.hypot(clickX - px, clickY - py);
      if (dist < minDist) {
        minDist = dist;
        closest = st;
      }
    });

    setSelectedStation(closest);
  };

  return (
    <aside
      aria-label="Radar Navigasi Laboratorium"
      className="absolute bottom-36 md:bottom-4 left-3 md:left-4 z-20 flex flex-col items-start select-none font-sans"
    >
      {/* Header Bar with Toggle & Legend Button */}
      <div className="bg-slate-900/95 border border-sky-500/40 rounded-t-2xl px-3 py-1.5 flex items-center justify-between gap-2 shadow-lg backdrop-blur-md w-[220px]">
        <div className="flex items-center gap-1.5 text-xs font-black text-sky-400">
          <Crosshair className="w-4 h-4 text-sky-400 animate-pulse" />
          <span className="tracking-wider">RADAR LAB 3D</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`p-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              showLegend
                ? 'bg-sky-500/30 text-sky-300 border border-sky-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Keterangan Pos & Stasiun"
            aria-label="Keterangan Pos"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            title={isExpanded ? 'Kecilkan Radar' : 'Perbesar Radar'}
            aria-label={isExpanded ? 'Kecilkan Radar' : 'Perbesar Radar'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Radar Body */}
      {isExpanded ? (
        <div className="bg-slate-950/90 border-x border-b border-sky-500/40 rounded-b-2xl p-2 shadow-2xl backdrop-blur-md flex flex-col items-center w-[220px]">
          {/* Interactive Radar Canvas */}
          <div className="relative cursor-pointer group" title="Klik stasiun untuk melihat info navigasi">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="rounded-full shadow-inner shadow-sky-950 block"
              style={{ width: '210px', height: '210px' }}
            />

            {/* Subtle radar scanner sweep ring effect */}
            <div className="absolute inset-0 rounded-full pointer-events-none border border-sky-500/20" />
          </div>

          {/* Player Coordinates & Active Proximity Badge */}
          <div className="w-full mt-2 pt-1.5 border-t border-slate-800/80 flex flex-col gap-1 text-[10px]">
            <div className="flex items-center justify-between text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-slate-300">
                <Navigation className="w-3 h-3 text-sky-400" />
                Pos: ({playerPos.x.toFixed(1)}, {playerPos.z.toFixed(1)})
              </span>
              <span className="text-slate-500">L{currentLevelId}</span>
            </div>

            {/* Nearby station banner */}
            {nearbyStation ? (
              <div className="flex items-center justify-between bg-sky-950/80 border border-sky-400/60 rounded-xl px-2 py-1 text-sky-200 font-bold animate-pulse">
                <span className="truncate max-w-[130px]">{nearbyStation.iconSymbol} {nearbyStation.title}</span>
                <span className="text-[9px] bg-sky-500 text-slate-950 px-1.5 py-0.5 rounded font-black">
                  [E]
                </span>
              </div>
            ) : selectedStation ? (
              <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-slate-300">
                <span className="truncate max-w-[130px]">{selectedStation.iconSymbol} {selectedStation.title}</span>
                <span className="text-slate-400 font-mono text-[9px]">
                  {Math.hypot(playerPos.x - selectedStation.x, playerPos.z - selectedStation.z).toFixed(1)}m
                </span>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-0.5">
                Dekati pos lab untuk interaksi
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Collapsed Mini Status Pill */
        <div
          onClick={() => setIsExpanded(true)}
          className="bg-slate-950/90 border-x border-b border-sky-500/40 rounded-b-2xl px-3 py-1.5 text-[11px] text-slate-300 flex items-center gap-2 cursor-pointer hover:bg-slate-900 transition w-[220px]"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
          <span className="font-semibold truncate">
            {nearbyStation ? `Dekat: ${nearbyStation.title}` : 'Radar Siaga'}
          </span>
        </div>
      )}

      {/* Floating Station Legend Drawer */}
      {showLegend && isExpanded && (
        <div className="absolute left-[228px] bottom-0 bg-slate-900/95 border border-sky-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md w-56 text-xs text-slate-200 z-30">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800 font-bold text-sky-400">
            <span>Keterangan Pos Lab</span>
            <button
              onClick={() => setShowLegend(false)}
              className="text-slate-400 hover:text-slate-100 cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
            {stations.map((st) => {
              const visual = getStationVisuals(st);
              const isCompleted =
                (st.type === 'practicum' && completedTaskIds.includes('practicum')) ||
                (st.type.startsWith('terminal') && completedTaskIds.includes('quiz')) ||
                (st.type === 'punnett' && completedTaskIds.includes('punnett')) ||
                (st.type === 'chest' && completedTaskIds.includes('chest')) ||
                (st.type === 'machine1' && completedTaskIds.includes('machine1')) ||
                (st.type === 'machine2' && completedTaskIds.includes('machine2'));

              const dist = Math.hypot(playerPos.x - st.x, playerPos.z - st.z).toFixed(1);

              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStation(st)}
                  className={`flex items-center justify-between p-1.5 rounded-xl cursor-pointer transition ${
                    selectedStation?.id === st.id
                      ? 'bg-sky-950 border border-sky-400/60'
                      : 'hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm">{visual.icon}</span>
                    <span className="truncate font-medium text-[11px]">{visual.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                    {isCompleted ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Selesai
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">{dist}m</span>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="mt-1 pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Inti Helix DNA (0,0)
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
