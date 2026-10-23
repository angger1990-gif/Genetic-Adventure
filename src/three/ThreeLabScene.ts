import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LevelInfo, InteractableStation3D } from '../types/game';

// Check for software WebGL renderer (SwiftShader, llvmpipe, etc.)
export const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : (gl as WebGLRenderingContext).RENDERER;
    const gpu = String((gl as WebGLRenderingContext).getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
})();

// Reusable scratch vectors to avoid GC allocations in render loop
const _vec3 = new THREE.Vector3();
const _targetPos = new THREE.Vector3();
const _cameraLookAt = new THREE.Vector3();

// Station particle system data tracking for active visual aura
interface StationParticleData {
  points: THREE.Points;
  geo: THREE.BufferGeometry;
  positions: Float32Array;
  colors: Float32Array;
  baseY: Float32Array;
  phases: Float32Array;
  speeds: Float32Array;
  mat: THREE.PointsMaterial;
  ringMesh: THREE.Mesh;
  ringMat: THREE.MeshBasicMaterial;
}

export class ThreeLabScene {
  public container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private lastTime = 0;

  // Level & Theme
  private levelInfo: LevelInfo;
  private levelId: number;

  // Player Character
  public playerGroup: THREE.Group;
  public playerPos = { x: 0, z: 8 };
  public playerVelocity = { vx: 0, vz: 0 };
  public playerRotation = 0;
  private playerSpeed = 8.5;
  private isMoving = false;
  private walkCycle = 0;
  private leftLeg: THREE.Mesh | null = null;
  private rightLeg: THREE.Mesh | null = null;
  private leftArm: THREE.Mesh | null = null;
  private rightArm: THREE.Mesh | null = null;
  private torsoMesh: THREE.Mesh | null = null;
  private playerShadow: THREE.Mesh | null = null;

  // Patrol Bot
  private patrolBotGroup: THREE.Group | null = null;
  private patrolBotX = -6;
  private patrolBotDir = 1;

  // DNA Center
  private dnaGroup: THREE.Group | null = null;

  // Station Meshes & Proximity Tracking
  private stationGroups: Map<string, THREE.Group> = new Map();
  public nearbyStation: InteractableStation3D | null = null;
  public onProximityChange?: (station: InteractableStation3D | null) => void;
  public onStationInteract?: (station: InteractableStation3D) => void;
  public onPlayerMove?: (pos: { x: number; z: number }, rotation: number) => void;

  // Boss Portal visual state
  private bossPortalMesh: THREE.Group | null = null;
  private bossPortalLight: THREE.PointLight | null = null;
  private isBossPortalUnlocked = false;

  public getIsBossPortalUnlocked(): boolean {
    return this.isBossPortalUnlocked;
  }

  // Camera Settings
  public cameraMode: 'third_person' | 'close' | 'top_down' | 'isometric' = 'third_person';
  private targetCameraPos = new THREE.Vector3(0, 8, 16);
  private currentCameraLookAt = new THREE.Vector3(0, 1.2, 8);

  // Particles
  private particleSystem: THREE.Points | null = null;
  private stationParticleSystems: Map<string, StationParticleData> = new Map();
  private sparkleTexture: THREE.Texture | null = null;

  // Stations definitions in 3D coordinates (centered around x: 0, z: 0)
  public stations: InteractableStation3D[] = [];

  constructor(container: HTMLElement, levelInfo: LevelInfo) {
    this.container = container;
    this.levelInfo = levelInfo;
    this.levelId = levelInfo.id;

    // 1. Scene & Atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(levelInfo.fogColor);
    this.scene.fog = new THREE.FogExp2(levelInfo.fogColor, 0.028);

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight || 16 / 9;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 150);
    this.camera.position.set(0, 10, 18);

    // 3. Renderer with PBR Pipeline
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 4. Studio Environment Reflections (PMREMGenerator)
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // Fallback
    }

    // 5. Lighting
    this.setupLighting();

    // 6. Build 3D Lab Environment
    this.createFloor();
    this.createPerimeterWalls();
    this.createCentralDNA();
    this.setupStations();
    this.createPatrolBot();
    this.createFloatingMotes();

    // 7. Build Player Character (Composite 3-12 Part Procedural Model)
    this.playerGroup = this.createPlayerCharacter();
    this.scene.add(this.playerGroup);
    this.playerPos = { x: 0, z: 9 };
    this.playerGroup.position.set(this.playerPos.x, 0, this.playerPos.z);

    // 8. Event Listeners
    window.addEventListener('resize', this.onResize);
  }

  private setupLighting() {
    // Cool Hemisphere fill to complement warm Key Light
    const hemiLight = new THREE.HemisphereLight(0xddeeff, this.levelInfo.floorColor, 0.65);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // Warm Directional Key Light with Shadows
    const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.4);
    dirLight.position.set(12, 22, 14);
    dirLight.castShadow = !isSoftwareGl;
    if (dirLight.castShadow) {
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 60;
      const d = 18;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(dirLight);

    // Central DNA Accent Light
    const centerLight = new THREE.PointLight(this.levelInfo.accentColor, 2.2, 16);
    centerLight.position.set(0, 4.5, 0);
    this.scene.add(centerLight);

    // Soft Portal Beacon Light
    this.bossPortalLight = new THREE.PointLight(0xf87171, 1.8, 12);
    this.bossPortalLight.position.set(0, 4, -13);
    this.scene.add(this.bossPortalLight);
  }

  private createFloor() {
    const size = 38;
    const geometry = new THREE.PlaneGeometry(size, size, 24, 24);

    // Procedural sci-fi tile canvas texture with crisp lines
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a101d';
      ctx.fillRect(0, 0, 512, 512);

      // Tile grid
      ctx.strokeStyle = '#182844';
      ctx.lineWidth = 4;
      const step = 64;
      for (let x = 0; x <= 512; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y <= 512; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Circuit accents & tech hex markings
      ctx.strokeStyle = '#254470';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(256, 256, 120, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(256, 256, 190, 0, Math.PI * 2);
      ctx.stroke();

      // Corner tech bolts
      ctx.fillStyle = '#3b6998';
      for (let x = step / 2; x < 512; x += step) {
        for (let y = step / 2; y < 512; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 6);
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.35,
      metalness: 0.45,
    });

    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = !isSoftwareGl;
    this.scene.add(floor);

    // Center circular DNA research dais
    const daisGeo = new THREE.CylinderGeometry(4.2, 4.5, 0.25, 48);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x111c30,
      roughness: 0.25,
      metalness: 0.7,
    });
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.set(0, 0.125, 0);
    dais.receiveShadow = !isSoftwareGl;
    this.scene.add(dais);

    // Glowing dais ring
    const ringGeo = new THREE.RingGeometry(3.9, 4.15, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: this.levelInfo.accentColor,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, 0.26, 0);
    this.scene.add(ring);
  }

  private createPerimeterWalls() {
    const wallGroup = new THREE.Group();
    const half = 18;
    const height = 3.5;

    // Railing posts and glass barrier panels
    const postGeo = new THREE.CylinderGeometry(0.18, 0.22, height, 12);
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x24324a,
      roughness: 0.3,
      metalness: 0.8,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: this.levelInfo.accentColor,
      transparent: true,
      opacity: isSoftwareGl ? 0.3 : 0.2,
      roughness: 0.1,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    // Add 4 perimeter boundary fences
    const sides = [
      { start: [-half, -half], end: [half, -half] }, // North (back)
      { start: [-half, half], end: [half, half] },   // South (front)
      { start: [-half, -half], end: [-half, half] }, // West (left)
      { start: [half, -half], end: [half, half] },   // East (right)
    ];

    sides.forEach((side, idx) => {
      const isNorth = idx === 0;
      const count = 9;
      const x0 = side.start[0];
      const z0 = side.start[1];
      const x1 = side.end[0];
      const z1 = side.end[1];

      for (let i = 0; i <= count; i++) {
        const t = i / count;
        const px = x0 + (x1 - x0) * t;
        const pz = z0 + (z1 - z0) * t;

        // Skip middle of north wall for Boss Portal entrance
        if (isNorth && Math.abs(px) < 3.2) continue;

        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(px, height / 2, pz);
        post.castShadow = !isSoftwareGl;
        wallGroup.add(post);

        // Top cap light
        const capGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const capMat = new THREE.MeshBasicMaterial({ color: this.levelInfo.accentColor });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(px, height + 0.05, pz);
        wallGroup.add(cap);
      }

      // Barrier panel between posts
      const length = Math.hypot(x1 - x0, z1 - z0);
      const panelGeo = new THREE.BoxGeometry(length, height * 0.7, 0.08);
      const panel = new THREE.Mesh(panelGeo, glassMat);
      panel.position.set((x0 + x1) / 2, (height * 0.7) / 2 + 0.3, (z0 + z1) / 2);
      if (idx === 2 || idx === 3) {
        panel.rotation.y = Math.PI / 2;
      }
      wallGroup.add(panel);
    });

    this.scene.add(wallGroup);
  }

  // Central Rotating Holographic DNA Double Helix (Composite 3D Model)
  private createCentralDNA() {
    this.dnaGroup = new THREE.Group();
    const turns = 2.5;
    const rungsCount = 28;
    const height = 6.5;
    const radius = 1.35;

    const strand1Geo = new THREE.SphereGeometry(0.09, 8, 8);
    const strand2Geo = new THREE.SphereGeometry(0.09, 8, 8);

    const s1Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const s2Mat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xbe123c,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });

    const rungMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.4,
      metalness: 0.3,
    });

    for (let i = 0; i < rungsCount; i++) {
      const frac = i / rungsCount;
      const angle = frac * Math.PI * 2 * turns;
      const y = frac * height + 1.2;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = -x1;
      const z2 = -z1;

      // Strand 1 node
      const node1 = new THREE.Mesh(strand1Geo, s1Mat);
      node1.position.set(x1, y, z1);
      this.dnaGroup.add(node1);

      // Strand 2 node
      const node2 = new THREE.Mesh(strand2Geo, s2Mat);
      node2.position.set(x2, y, z2);
      this.dnaGroup.add(node2);

      // Rung connecting node1 and node2
      const rungDist = radius * 2;
      const rungGeo = new THREE.CylinderGeometry(0.04, 0.04, rungDist, 8);
      const rung = new THREE.Mesh(rungGeo, rungMat);
      rung.position.set(0, y, 0);
      rung.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(x1, 0, z1).normalize()
      );
      this.dnaGroup.add(rung);
    }

    // Pedestal base with energy glow
    const baseGeo = new THREE.CylinderGeometry(0.7, 1.0, 0.6, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, 0.3, 0);
    this.dnaGroup.add(base);

    this.scene.add(this.dnaGroup);
  }

  // Setup 3D Interactive Stations
  private setupStations() {
    this.stations = [
      {
        id: 'practicum_station',
        x: 0,
        z: -5.5,
        type: 'practicum',
        title: 'Meja Praktikum Virtual (Wajib)',
        iconSymbol: '🧪',
        unlocked: true,
      },
      {
        id: 'term_1',
        x: -7.5,
        z: -3.5,
        type: 'terminal_a',
        title: 'Konsol Kuis Genetika A',
        iconSymbol: '💡',
        unlocked: true,
      },
      {
        id: 'term_2',
        x: 7.5,
        z: -3.5,
        type: 'terminal_b',
        title: 'Konsol Kuis Genetika B',
        iconSymbol: '🔬',
        unlocked: true,
      },
      {
        id: 'punnett_station',
        x: -6.5,
        z: 4.5,
        type: 'punnett',
        title: 'Terminal Punnett Square',
        iconSymbol: '📊',
        unlocked: true,
      },
      {
        id: 'item_chest',
        x: 6.5,
        z: 4.5,
        type: 'chest',
        title: 'Kapsul Suplai Lab',
        iconSymbol: '📦',
        unlocked: true,
      },
      {
        id: 'portal_boss',
        x: 0,
        z: -14.5,
        type: 'boss_portal',
        title: 'Pintu Masuk Ruang Boss',
        iconSymbol: '🔒',
        unlocked: false,
      },
    ];

    if (this.levelId === 6) {
      this.stations.push({
        id: 'machine_segregasi',
        x: -11.5,
        z: 1.0,
        type: 'machine1',
        title: 'Mesin I — Hukum Segregasi (Aa → A + a)',
        iconSymbol: '⚙️',
        unlocked: true,
      });
      this.stations.push({
        id: 'machine_asortasi',
        x: 11.5,
        z: 1.0,
        type: 'machine2',
        title: 'Mesin II — Asortasi Bebas (AaBb → 4 Gamet)',
        iconSymbol: '⚡',
        unlocked: true,
      });
    }

    // Build 3D mesh for each station
    this.stations.forEach((st) => {
      let group: THREE.Group;
      switch (st.type) {
        case 'practicum':
          group = this.buildPracticumMesh(st);
          break;
        case 'terminal_a':
        case 'terminal_b':
          group = this.buildTerminalMesh(st);
          break;
        case 'punnett':
          group = this.buildPunnettMesh(st);
          break;
        case 'chest':
          group = this.buildChestMesh(st);
          break;
        case 'boss_portal':
          group = this.buildBossPortalMesh(st);
          this.bossPortalMesh = group;
          break;
        case 'machine1':
          group = this.buildMachine1Mesh(st);
          break;
        case 'machine2':
          group = this.buildMachine2Mesh(st);
          break;
        default:
          group = this.buildGenericStationMesh(st);
      }

      group.position.set(st.x, 0, st.z);
      this.scene.add(group);
      this.stationGroups.set(st.id, group);

      // Attach dynamic DNA sparks particle system & active ground halo
      this.createStationParticles(group, st);
    });
  }

  // Practicum Workstation (Workbench + microscope + test tubes + screen)
  private buildPracticumMesh(st: InteractableStation3D): THREE.Group {
    const group = new THREE.Group();

    // Table top
    const tableTopGeo = new THREE.BoxGeometry(3.6, 0.25, 2.0);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.6,
      roughness: 0.3,
    });
    const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
    tableTop.position.set(0, 1.2, 0);
    tableTop.castShadow = !isSoftwareGl;
    group.add(tableTop);

    // Legs (4 parts)
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
    const offsets = [
      [-1.6, -0.8],
      [1.6, -0.8],
      [-1.6, 0.8],
      [1.6, 0.8],
    ];
    offsets.forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, 0.6, z);
      group.add(leg);
    });

    // Microscope model
    const scopeGroup = new THREE.Group();
    const sBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.5), legMat);
    sBase.position.y = 1.35;
    scopeGroup.add(sBase);
    const sArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), tableMat);
    sArm.position.set(0.15, 1.65, 0);
    sArm.rotation.z = -0.2;
    scopeGroup.add(sArm);
    const sTube = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8), legMat);
    sTube.position.set(-0.05, 1.85, 0);
    sTube.rotation.z = 0.4;
    scopeGroup.add(sTube);
    scopeGroup.position.set(-0.9, 0, 0.2);
    group.add(scopeGroup);

    // Test tube rack with 4 colorful glowing tubes
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.3), tableMat);
    rack.position.set(0.9, 1.35, 0.2);
    group.add(rack);
    const tubeColors = [0x38bdf8, 0xf43f5e, 0x10b981, 0xfbbf24];
    tubeColors.forEach((col, i) => {
      const tubeGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.5,
        roughness: 0.1,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.position.set(0.6 + i * 0.2, 1.5, 0.2);
      group.add(tube);
    });

    // Holographic display screen
    const screenGeo = new THREE.BoxGeometry(1.4, 0.8, 0.05);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.1,
      metalness: 0.2,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.8, -0.6);
    screen.rotation.x = 0.15;
    group.add(screen);

    // Floating label marker
    this.createFloatingMarker(group, st);
    return group;
  }

  // Quiz Terminal (Console A & B)
  private buildTerminalMesh(st: InteractableStation3D): THREE.Group {
    const group = new THREE.Group();

    // Pedestal base
    const baseGeo = new THREE.CylinderGeometry(0.6, 0.8, 0.2, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.1;
    group.add(base);

    // Central pillar
    const pillarGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.4, 12);
    const pillar = new THREE.Mesh(pillarGeo, baseMat);
    pillar.position.y = 0.8;
    group.add(pillar);

    // Tilted console head
    const headGeo = new THREE.BoxGeometry(1.2, 0.3, 0.9);
    const head = new THREE.Mesh(headGeo, baseMat);
    head.position.set(0, 1.5, 0);
    head.rotation.x = -0.3;
    group.add(head);

    // Glowing screen
    const scrGeo = new THREE.PlaneGeometry(0.9, 0.6);
    const scrMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const scr = new THREE.Mesh(scrGeo, scrMat);
    scr.position.set(0, 1.52, 0);
    scr.rotation.x = -0.3 - Math.PI / 2;
    group.add(scr);

    // Holographic halo ring
    const haloGeo = new THREE.TorusGeometry(0.7, 0.03, 8, 24);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 2.1, 0);
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    this.createFloatingMarker(group, st);
    return group;
  }

  // Punnett Square Station (Table with floating 2x2 grid)
  private buildPunnettMesh(st: InteractableStation3D): THREE.Group {
    const group = new THREE.Group();

    // Table
    const tableGeo = new THREE.BoxGeometry(2.4, 0.3, 2.4);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.7, roughness: 0.3 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.y = 1.1;
    group.add(table);

    // Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.4, 0.6, 1.1, 16);
    const pillar = new THREE.Mesh(pillarGeo, tableMat);
    pillar.position.y = 0.55;
    group.add(pillar);

    // Floating 2x2 holographic grid
    const gridHelper = new THREE.GridHelper(1.8, 2, 0x818cf8, 0x4f46e5);
    gridHelper.position.set(0, 1.35, 0);
    group.add(gridHelper);

    // Floating DNA alleles symbol (A, a, B, b)
    const floatRingGeo = new THREE.TorusGeometry(1.1, 0.03, 8, 32);
    const floatRingMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
    const floatRing = new THREE.Mesh(floatRingGeo, floatRingMat);
    floatRing.rotation.x = Math.PI / 2;
    floatRing.position.set(0, 1.7, 0);
    group.add(floatRing);

    this.createFloatingMarker(group, st);
    return group;
  }

  // Supply Chest (Sci-Fi Supply Pod)
  private buildChestMesh(st: InteractableStation3D): THREE.Group {
    const group = new THREE.Group();

    // Pod body
    const bodyGeo = new THREE.CylinderGeometry(0.7, 0.8, 1.2, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      metalness: 0.6,
      roughness: 0.35,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    group.add(body);

    // Glowing energy band
    const bandGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.2, 16);
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 0.6,
    });
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.y = 0.6;
    group.add(band);

    // Dome cap
    const domeGeo = new THREE.SphereGeometry(0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x065f46, metalness: 0.8, roughness: 0.2 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 1.2;
    group.add(dome);

    this.createFloatingMarker(group, st);
    return group;
  }

  // Boss Blast Portal (Reinforced Archway + Glowing Barrier)
  private buildBossPortalMesh(st: InteractableStation3D): THREE.Group {
    const group = new THREE.Group();

    // Twin massive reinforced pillars
    const pillarGeo = new THREE.BoxGeometry(1.2, 6.0, 1.2);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x181e2b,
      metalness: 0.85,
      roughness: 0.25,
    });

    const leftPillar = new THREE.Mesh(pillarGeo, frameMat);
    leftPillar.position.set(-3.2, 3.0, 0);
    leftPillar.castShadow = !isSoftwareGl;
    group.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, frameMat);
    rightPillar.position.set(3.2, 3.0, 0);
    rightPillar.castShadow = !isSoftwareGl;
    group.add(rightPillar);

    // Overhead lintel beam
    const lintelGeo = new THREE.BoxGeometry(7.6, 1.0, 1.4);
    const lintel = new THREE.Mesh(lintelGeo, frameMat);
    lintel.position.set(0, 6.0, 0);
    lintel.castShadow = !isSoftwareGl;
    group.add(lintel);

    // Glowing energy barrier field
    const barrierGeo = new THREE.PlaneGeometry(5.2, 5.5);
    const barrierMat = new THREE.MeshStandardMaterial({
      color: 0xf87171,
      emissive: 0x991b1b,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: isSoftwareGl ? 0.45 : 0.65,
      side: THREE.DoubleSide,
      roughness: 0.1,
    });
    const barrier = new THREE.Mesh(barrierGeo, barrierMat);
    barrier.position.set(0, 2.75, 0);
    barrier.name = 'barrierMesh';
    group.add(barrier);

    // Hazard stripe banner across top
    const bannerGeo = new THREE.BoxGeometry(5.4, 0.4, 0.15);
    const bannerMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, metalness: 0.4 });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(0, 5.2, 0.65);
    group.add(banner);

    this.createFloatingMarker(group, st);
    return group;
  }

  // Machine 1 (Hukum Segregasi - Meiosis Lever & Separator)
  private buildMachine1Mesh(st: InteractableStation3D): THREE.Group {
    const group = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.8, roughness: 0.3 });

    // Main machine housing
    const box = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.0, 1.8), baseMat);
    box.position.y = 1.0;
    group.add(box);

    // Twin separation cylinders (A and a)
    const cyl1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 })
    );
    cyl1.position.set(-0.65, 2.2, 0);
    group.add(cyl1);

    const cyl2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.4, 16),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xb45309, emissiveIntensity: 0.5 })
    );
    cyl2.position.set(0.65, 2.2, 0);
    group.add(cyl2);

    this.createFloatingMarker(group, st);
    return group;
  }

  // Machine 2 (Hukum Asortasi Bebas - 4-Way Gamete Distributor)
  private buildMachine2Mesh(st: InteractableStation3D): THREE.Group {
    const group = new THREE.Group();
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x2e1065, metalness: 0.8, roughness: 0.3 });

    const box = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 2.0, 24), baseMat);
    box.position.y = 1.0;
    group.add(box);

    // 4 output pipes radiating outward
    const colors = [0x38bdf8, 0x4ade80, 0xfacc15, 0xf43f5e];
    colors.forEach((col, idx) => {
      const angle = (idx / 4) * Math.PI * 2;
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 1.2, 12),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.6 })
      );
      pipe.position.set(Math.cos(angle) * 1.3, 1.8, Math.sin(angle) * 1.3);
      group.add(pipe);
    });

    this.createFloatingMarker(group, st);
    return group;
  }

  private buildGenericStationMesh(st: InteractableStation3D): THREE.Group {
    const group = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.2, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
    );
    base.position.y = 0.6;
    group.add(base);
    this.createFloatingMarker(group, st);
    return group;
  }

  // 3D Floating billboard marker above station
  private createFloatingMarker(parent: THREE.Group, st: InteractableStation3D) {
    const markerGroup = new THREE.Group();
    markerGroup.name = 'floatingMarker';
    markerGroup.position.set(0, 3.2, 0);

    // Glowing diamond/octahedron icon
    const diamondGeo = new THREE.OctahedronGeometry(0.24, 0);
    const diamondMat = new THREE.MeshStandardMaterial({
      color: this.levelInfo.accentColor,
      emissive: this.levelInfo.accentColor,
      emissiveIntensity: 0.8,
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.name = 'diamondMesh';
    markerGroup.add(diamond);

    // 3D Billboard Sprite Badge with icon & clean title
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = `#${this.levelInfo.accentColor.toString(16).padStart(6, '0')}`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(6, 6, 244, 60, 14);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f8fafc';
      const shortTitle = st.title.split('—')[0].split('(')[0].trim();
      ctx.fillText(`${st.iconSymbol} ${shortTitle}`, 128, 36);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 0.7, 1);
    sprite.position.set(0, 0.6, 0);
    sprite.name = 'billboardSprite';
    markerGroup.add(sprite);

    // Contact shadow beneath station
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    parent.add(shadow);

    parent.add(markerGroup);
  }

  // Composite 3D Character Model (8+ distinct parts, zero default primitive slop)
  private createPlayerCharacter(): THREE.Group {
    const player = new THREE.Group();

    // 1. Torso (Lab Coat Body)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
    const coatMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.5,
      metalness: 0.1,
    });
    this.torsoMesh = new THREE.Mesh(torsoGeo, coatMat);
    this.torsoMesh.position.y = 1.35;
    this.torsoMesh.castShadow = !isSoftwareGl;
    player.add(this.torsoMesh);

    // 2. Collar & Tie Accent
    const tieGeo = new THREE.BoxGeometry(0.12, 0.45, 0.04);
    const tieMat = new THREE.MeshStandardMaterial({
      color: this.levelInfo.accentColor,
      roughness: 0.2,
      metalness: 0.5,
    });
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 1.45, 0.24);
    player.add(tie);

    // 3. ID Badge on chest
    const badgeGeo = new THREE.BoxGeometry(0.16, 0.2, 0.02);
    const badgeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(-0.2, 1.5, 0.24);
    player.add(badge);

    // 4. Scientist Head
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.48);
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfbd2a2,
      roughness: 0.6,
      metalness: 0.05,
    });
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.set(0, 2.05, 0);
    head.castShadow = !isSoftwareGl;
    player.add(head);

    // 5. Scientist Hair
    const hairGeo = new THREE.BoxGeometry(0.54, 0.22, 0.52);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 2.3, -0.02);
    player.add(hair);

    // 6. Science Visor / Goggles (Holographic lens)
    const visorGeo = new THREE.BoxGeometry(0.46, 0.15, 0.1);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.3,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 2.05, 0.25);
    player.add(visor);

    // 7. Left & Right Legs (Dark Trousers & Boots)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const legGeo = new THREE.BoxGeometry(0.24, 0.9, 0.24);

    this.leftLeg = new THREE.Mesh(legGeo, legMat);
    this.leftLeg.position.set(-0.2, 0.45, 0);
    this.leftLeg.castShadow = !isSoftwareGl;
    player.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, legMat);
    this.rightLeg.position.set(0.2, 0.45, 0);
    this.rightLeg.castShadow = !isSoftwareGl;
    player.add(this.rightLeg);

    // 8. Left & Right Arms + Handheld Gene Scanner
    const armMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const armGeo = new THREE.BoxGeometry(0.18, 0.8, 0.18);

    this.leftArm = new THREE.Mesh(armGeo, armMat);
    this.leftArm.position.set(-0.48, 1.35, 0);
    this.leftArm.castShadow = !isSoftwareGl;
    player.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, armMat);
    this.rightArm.position.set(0.48, 1.35, 0);
    this.rightArm.castShadow = !isSoftwareGl;
    player.add(this.rightArm);

    // Gene Scanner tool in right hand
    const toolGeo = new THREE.BoxGeometry(0.12, 0.3, 0.15);
    const toolMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
    });
    const tool = new THREE.Mesh(toolGeo, toolMat);
    tool.position.set(0, -0.35, 0.1);
    this.rightArm.add(tool);

    // 9. Soft Contact Shadow underneath player
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    this.playerShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.playerShadow.rotation.x = -Math.PI / 2;
    this.playerShadow.position.y = 0.02;
    player.add(this.playerShadow);

    return player;
  }

  // Floating Patrol Bot Drone
  private createPatrolBot() {
    this.patrolBotGroup = new THREE.Group();

    // Metallic spherical core
    const sphereGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const botMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.2,
    });
    const sphere = new THREE.Mesh(sphereGeo, botMat);
    sphere.castShadow = !isSoftwareGl;
    this.patrolBotGroup.add(sphere);

    // Red scanner eye
    const eyeGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(0, 0, 0.42);
    this.patrolBotGroup.add(eye);

    // Sensor ring
    const ringGeo = new THREE.TorusGeometry(0.65, 0.05, 8, 24);
    const ring = new THREE.Mesh(ringGeo, botMat);
    ring.rotation.x = Math.PI / 2;
    this.patrolBotGroup.add(ring);

    // Spot ground shadow
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.2),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    this.scene.add(shadow);

    this.patrolBotGroup.position.set(this.patrolBotX, 1.8, -1.0);
    this.scene.add(this.patrolBotGroup);
  }

  // Atmospheric Floating Genetic Motes
  private createFloatingMotes() {
    const count = isSoftwareGl ? 30 : 90;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = Math.random() * 8 + 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 32;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: this.levelInfo.accentColor,
      size: 0.15,
      transparent: true,
      opacity: 0.7,
    });

    this.particleSystem = new THREE.Points(geo, mat);
    this.scene.add(this.particleSystem);
  }

  // Generate high-fidelity magical bio-particle texture via HTML5 Canvas
  private createSparkleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(125, 211, 252, 0.95)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.6)');
      grad.addColorStop(0.8, 'rgba(14, 165, 233, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fill();

      // Sharp central diamond glint
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(32, 10);
      ctx.lineTo(32, 54);
      ctx.moveTo(10, 32);
      ctx.lineTo(54, 32);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // Create Swirling DNA Sparks & Holographic Floor Ring around an Interactable Station
  private createStationParticles(parent: THREE.Group, st: InteractableStation3D) {
    if (!this.sparkleTexture) {
      this.sparkleTexture = this.createSparkleTexture();
    }

    const count = isSoftwareGl ? 24 : 44;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const baseY = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);

    // 4 DNA Nucleotides Colors: Adenine (Cyan), Thymine (Amber), Guanine (Emerald), Cytosine (Rose)
    const nucleotideColors = [
      new THREE.Color(0x38bdf8), // A - Sky Cyan
      new THREE.Color(0xfacc15), // T - Gold Amber
      new THREE.Color(0x34d399), // G - Emerald Mint
      new THREE.Color(0xf43f5e), // C - Rose Magenta
    ];
    const accentCol = new THREE.Color(this.levelInfo.accentColor);

    for (let i = 0; i < count; i++) {
      baseY[i] = (i / count) * 3.5;
      phases[i] = (i / count) * Math.PI * 2;
      speeds[i] = 0.8 + (i % 6) * 0.12;

      // Initial positions in cylinder
      positions[i * 3] = Math.cos(phases[i]) * 1.8;
      positions[i * 3 + 1] = baseY[i];
      positions[i * 3 + 2] = Math.sin(phases[i]) * 1.8;

      // Color alternating between 4 nucleotides and accent
      let col = i % 5 === 4 ? accentCol : nucleotideColors[i % 4];
      if (st.type === 'boss_portal' && !this.isBossPortalUnlocked) {
        col = new THREE.Color(0xf87171); // Red lock motes for boss portal
      }

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      map: this.sparkleTexture,
      transparent: true,
      opacity: 0.45,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    parent.add(points);

    // High-tech holographic ground beacon ring for active station signaling
    const ringGeo = new THREE.RingGeometry(1.25, 1.45, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: st.type === 'boss_portal' ? 0xf87171 : this.levelInfo.accentColor,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.03;
    ringMesh.visible = false;
    parent.add(ringMesh);

    this.stationParticleSystems.set(st.id, {
      points,
      geo,
      positions,
      colors,
      baseY,
      phases,
      speeds,
      mat,
      ringMesh,
      ringMat,
    });
  }

  // Update Boss Portal state (Unlocking / Locking visual effects)
  public setBossPortalUnlocked(unlocked: boolean) {
    this.isBossPortalUnlocked = unlocked;
    const portal = this.stations.find((s) => s.type === 'boss_portal');
    if (portal) {
      portal.unlocked = unlocked;
      portal.iconSymbol = unlocked ? '⚔️' : '🔒';
    }

    if (this.bossPortalMesh) {
      const barrier = this.bossPortalMesh.getObjectByName('barrierMesh') as THREE.Mesh;
      if (barrier && barrier.material instanceof THREE.MeshStandardMaterial) {
        if (unlocked) {
          barrier.material.color.setHex(0xfbbf24);
          barrier.material.emissive.setHex(0xd97706);
          barrier.material.opacity = isSoftwareGl ? 0.35 : 0.45;
        } else {
          barrier.material.color.setHex(0xf87171);
          barrier.material.emissive.setHex(0x991b1b);
          barrier.material.opacity = isSoftwareGl ? 0.45 : 0.65;
        }
      }
    }

    if (this.bossPortalLight) {
      this.bossPortalLight.color.setHex(unlocked ? 0xfbbf24 : 0xf87171);
      this.bossPortalLight.intensity = unlocked ? 2.5 : 1.8;
    }

    // Update boss portal particles color
    const portalData = this.stationParticleSystems.get('portal_boss');
    if (portalData) {
      const count = portalData.colors.length / 3;
      const targetCol = unlocked ? new THREE.Color(0xfbbf24) : new THREE.Color(0xf87171);
      for (let i = 0; i < count; i++) {
        portalData.colors[i * 3] = targetCol.r;
        portalData.colors[i * 3 + 1] = targetCol.g;
        portalData.colors[i * 3 + 2] = targetCol.b;
      }
      portalData.geo.attributes.color.needsUpdate = true;
      portalData.ringMat.color.setHex(unlocked ? 0xfbbf24 : 0xf87171);
    }
  }

  // Set Movement Input from Keyboard / Virtual D-Pad (-1 to 1)
  public setMovement(inputX: number, inputZ: number) {
    this.playerVelocity.vx = inputX * this.playerSpeed;
    this.playerVelocity.vz = inputZ * this.playerSpeed;
    this.isMoving = inputX !== 0 || inputZ !== 0;

    if (this.isMoving) {
      // Calculate target yaw angle
      this.playerRotation = Math.atan2(inputX, inputZ);
    }
  }

  public triggerInteraction() {
    // Always compute the closest station at the exact moment of interaction
    let closestStation: InteractableStation3D | null = null;
    const proxDist = 3.8;
    let minDistance = proxDist;
    for (const st of this.stations) {
      const dist = Math.hypot(this.playerPos.x - st.x, this.playerPos.z - st.z);
      if (dist < minDistance) {
        minDistance = dist;
        closestStation = st;
      }
    }

    const targetStation = closestStation || this.nearbyStation;
    if (targetStation) {
      this.nearbyStation = targetStation;
      if (this.onProximityChange) {
        this.onProximityChange(targetStation);
      }
      if (this.onStationInteract) {
        this.onStationInteract(targetStation);
      }
    }
  }

  public setCameraMode(mode: 'third_person' | 'close' | 'top_down' | 'isometric') {
    this.cameraMode = mode;
  }

  // Animation Loop
  public start() {
    if (this.animFrameId !== null) return;
    this.lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - this.lastTime) / 1000);
      this.lastTime = time;

      this.update(dt, time * 0.001);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private update(dt: number, timeSec: number) {
    // 1. Move Player Character with wall boundaries
    const bound = 16.5;
    this.playerPos.x = THREE.MathUtils.clamp(
      this.playerPos.x + this.playerVelocity.vx * dt,
      -bound,
      bound
    );
    this.playerPos.z = THREE.MathUtils.clamp(
      this.playerPos.z + this.playerVelocity.vz * dt,
      -bound,
      bound
    );

    this.playerGroup.position.x = this.playerPos.x;
    this.playerGroup.position.z = this.playerPos.z;

    // Smoothly rotate player towards movement heading
    if (this.isMoving) {
      const currentRot = this.playerGroup.rotation.y;
      let diff = this.playerRotation - currentRot;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.playerGroup.rotation.y += diff * (1 - Math.exp(-14 * dt));
    }

    // Notify listeners of real-time player position & visual orientation
    if (this.onPlayerMove) {
      this.onPlayerMove(this.playerPos, this.playerGroup.rotation.y);
    }

    // Walking animation (Leg & Arm swing, body bobbing)
    if (this.isMoving) {
      this.walkCycle += dt * 14;
      const swing = Math.sin(this.walkCycle) * 0.45;
      if (this.leftLeg) this.leftLeg.rotation.x = swing;
      if (this.rightLeg) this.rightLeg.rotation.x = -swing;
      if (this.leftArm) this.leftArm.rotation.x = -swing * 0.7;
      if (this.rightArm) this.rightArm.rotation.x = swing * 0.7;
      if (this.torsoMesh) this.torsoMesh.position.y = 1.35 + Math.abs(Math.sin(this.walkCycle)) * 0.06;
    } else {
      if (this.leftLeg) this.leftLeg.rotation.x = THREE.MathUtils.damp(this.leftLeg.rotation.x, 0, 10, dt);
      if (this.rightLeg) this.rightLeg.rotation.x = THREE.MathUtils.damp(this.rightLeg.rotation.x, 0, 10, dt);
      if (this.leftArm) this.leftArm.rotation.x = THREE.MathUtils.damp(this.leftArm.rotation.x, 0, 10, dt);
      if (this.rightArm) this.rightArm.rotation.x = THREE.MathUtils.damp(this.rightArm.rotation.x, 0, 10, dt);
      if (this.torsoMesh) this.torsoMesh.position.y = THREE.MathUtils.damp(this.torsoMesh.position.y, 1.35, 10, dt);
    }

    // 2. Rotate Central DNA Double Helix
    if (this.dnaGroup) {
      this.dnaGroup.rotation.y = timeSec * 0.5;
    }

    // 3. Move Patrol Bot
    if (this.patrolBotGroup) {
      this.patrolBotX += this.patrolBotDir * dt * 2.8;
      if (this.patrolBotX > 6.5) {
        this.patrolBotX = 6.5;
        this.patrolBotDir = -1;
      } else if (this.patrolBotX < -6.5) {
        this.patrolBotX = -6.5;
        this.patrolBotDir = 1;
      }
      this.patrolBotGroup.position.x = this.patrolBotX;
      this.patrolBotGroup.position.y = 1.7 + Math.sin(timeSec * 3) * 0.2;
      this.patrolBotGroup.rotation.y = this.patrolBotDir > 0 ? Math.PI / 2 : -Math.PI / 2;
    }

    // 4. Floating Station Marker Animation & Proximity Detection
    let foundNearby: InteractableStation3D | null = null;
    const proxDist = 3.5;
    let minDistance = proxDist;

    this.stations.forEach((st) => {
      const group = this.stationGroups.get(st.id);
      if (group) {
        const dist = Math.hypot(this.playerPos.x - st.x, this.playerPos.z - st.z);
        const isNear = dist < proxDist;

        const marker = group.getObjectByName('floatingMarker');
        if (marker) {
          marker.position.y = 3.0 + Math.sin(timeSec * 2.5 + st.x) * 0.15;
          const targetScale = isNear ? 1.25 : 1.0;
          marker.scale.setScalar(
            THREE.MathUtils.damp(marker.scale.x, targetScale, 10, dt)
          );

          const diamond = marker.getObjectByName('diamondMesh');
          if (diamond) {
            diamond.rotation.y = timeSec * (isNear ? 3.0 : 1.5);
          }
        }

        // 2. Swirling DNA Sparks & Magic Hologram Particles around each Station
        const partData = this.stationParticleSystems.get(st.id);
        if (partData) {
          const targetOpacity = isNear ? 0.95 : 0.42;
          const targetSize = isNear ? 0.35 : 0.20;
          partData.mat.opacity = THREE.MathUtils.damp(partData.mat.opacity, targetOpacity, 8, dt);
          partData.mat.size = THREE.MathUtils.damp(partData.mat.size, targetSize, 8, dt);

          const pos = partData.positions;
          const count = pos.length / 3;
          const swirlSpeed = isNear ? 3.2 : 1.0;
          const riseSpeed = isNear ? 1.7 : 0.75;
          const radiusBase = isNear ? 1.4 : 1.85;

          for (let i = 0; i < count; i++) {
            const idx = i * 3;
            // Ascending height that loops seamlessly from 0.15m to 3.8m
            const y = (partData.baseY[i] + timeSec * riseSpeed * partData.speeds[i]) % 3.65 + 0.15;
            pos[idx + 1] = y;

            // Double-helix swirl (two intertwining strands offset by PI)
            const strandOffset = i % 2 === 0 ? 0 : Math.PI;
            const angle = partData.phases[i] + timeSec * swirlSpeed + y * 1.6 + strandOffset;
            const r = radiusBase + Math.sin(timeSec * 3 + i) * 0.18;

            pos[idx] = Math.cos(angle) * r;
            pos[idx + 2] = Math.sin(angle) * r;
          }
          partData.geo.attributes.position.needsUpdate = true;

          // Holographic ground indicator ring
          if (partData.ringMesh) {
            if (isNear) {
              partData.ringMesh.visible = true;
              partData.ringMesh.rotation.z = timeSec * 1.5;
              const pulse = 1.0 + Math.sin(timeSec * 5) * 0.12;
              partData.ringMesh.scale.set(pulse, pulse, pulse);
              partData.ringMat.opacity = 0.6 + Math.sin(timeSec * 6) * 0.25;
            } else {
              partData.ringMat.opacity = THREE.MathUtils.damp(partData.ringMat.opacity, 0, 10, dt);
              if (partData.ringMat.opacity < 0.05) {
                partData.ringMesh.visible = false;
              }
            }
          }
        }

        if (dist < minDistance) {
          minDistance = dist;
          foundNearby = st;
        }
      }
    });

    if (foundNearby !== this.nearbyStation) {
      this.nearbyStation = foundNearby;
      if (this.onProximityChange) {
        this.onProximityChange(this.nearbyStation);
      }
    }

    // 5. Camera Damping (Exponential smooth follow)
    switch (this.cameraMode) {
      case 'close':
        this.targetCameraPos.set(
          this.playerPos.x,
          this.playerGroup.position.y + 3.2,
          this.playerPos.z + 5.5
        );
        break;
      case 'top_down':
        this.targetCameraPos.set(
          this.playerPos.x,
          this.playerGroup.position.y + 19,
          this.playerPos.z + 0.1
        );
        break;
      case 'isometric':
        this.targetCameraPos.set(
          this.playerPos.x + 9,
          this.playerGroup.position.y + 13,
          this.playerPos.z + 11
        );
        break;
      case 'third_person':
      default:
        this.targetCameraPos.set(
          this.playerPos.x,
          this.playerGroup.position.y + 6.8,
          this.playerPos.z + 11.5
        );
        break;
    }

    // Exponential camera damping
    const dampFactor = 1 - Math.exp(-6.5 * dt);
    this.camera.position.lerp(this.targetCameraPos, dampFactor);

    _cameraLookAt.set(this.playerPos.x, 1.4, this.playerPos.z);
    this.currentCameraLookAt.lerp(_cameraLookAt, dampFactor);
    this.camera.lookAt(this.currentCameraLookAt);

    // 6. Slowly drift motes
    if (this.particleSystem) {
      this.particleSystem.rotation.y = timeSec * 0.04;
    }
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public dispose() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    try {
      this.stationParticleSystems.forEach((data) => {
        data.geo.dispose();
        data.mat.dispose();
        data.ringMesh.geometry.dispose();
        data.ringMat.dispose();
      });
      this.stationParticleSystems.clear();
      this.sparkleTexture?.dispose();
      this.sparkleTexture = null;

      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    } catch {
      // Ignore
    }
  }
}
