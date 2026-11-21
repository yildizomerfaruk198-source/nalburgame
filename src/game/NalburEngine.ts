import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { SoundEngine } from './audio';
import {
  APPRENTICE_BASE_WAGE,
  APPRENTICE_HIRE_COST,
  BREW_TEA_COST,
  CATEGORIES,
  CHARACTER_SKILLS,
  CUT_MATERIALS,
  DAILY_RENT_BASE,
  DAILY_UTILITY_BASE,
  DEFAULT_SHELF_PLACEMENTS,
  EXPANSION_MONEY_COST,
  EXPANSION_POINT_COST,
  ITEM_KEY,
  LEGACY_SAVE_KEY,
  MAX_CREDIT_DEBT,
  MAX_TEA_SERVINGS,
  MILESTONE_CATALOG,
  NAZAR_CHARM_COST,
  NEIGHBORHOOD_EVENTS,
  PAINT_TARGETS,
  PERSONALITY_META,
  POINT_STEP_TARGET,
  POSTER_THEMES,
  RADIO_STATIONS,
  REPAIR_SCENARIOS,
  REQUEST_TEMPLATES,
  RUG_THEMES,
  SAVE_KEY,
  SAVE_KEY_V2,
  SAVE_KEY_V3,
  SAVE_KEY_V4,
  SAVE_KEY_V5,
  SEASON_META,
  SERVICE_META,
  SHELF_SLOTS,
  SIGN_THEMES,
  SPRINT_SPEED,
  STAND_CATALOG,
  STARTING_MONEY,
  STREET_STALL_COST,
  TEA_REACTIONS,
  VAGUE_CLUES,
  WALK_SPEED,
  WALL_THEMES,
  createDefaultDecor,
  createDefaultShelfTransforms,
  createDefaultStandTransforms,
  generateBulkContract,
  generateDailyMarket,
  getApprenticeNextXp,
  getBulkDiscountRate,
  getCustomerPaymentBill,
  getReputationTitle,
  getSeasonForDay,
  getSkillCost,
  getStandForService,
  getSuggestedPrice,
  getWeatherSeasonWeight,
  rollDailyEvent,
  rollDailyWeather,
} from './catalog';
import {
  ApprenticeRig,
  BoardRig,
  CashRegisterRig,
  ChairRig,
  ClockRig,
  CustomerRig,
  DeliveryBoxRig,
  DepotRackRig,
  LedgerBookRig,
  RadioRig,
  StreetStallRig,
  TeaStationRig,
  WorkbenchRig,
  createApprenticeModel,
  createBulletinBoardModel,
  createCafeTableModel,
  createCashRegisterModel,
  createChairModel,
  createCounterClutterGroup,
  createCustomerModel,
  createDeliveryBoxModel,
  createDepotRackModel,
  createFountainModel,
  createLedgerBookModel,
  createNazarModel,
  createParkBenchModel,
  createPottedPlantModel,
  createProductModel,
  createRadioModel,
  createStandModel,
  createStreetStallModel,
  createTeaStationModel,
  createWallClockModel,
} from './models';
import {
  createClockFaceTexture,
  createContactShadowTexture,
  createCorkBoardTexture,
  createLabelTexture,
  createLampHaloTexture,
  createPosterTexture,
  createRugTexture,
  createShopSignboardTexture,
  createShopTextures,
  createSignTexture,
  createWallTexture,
} from './textures';
import type {
  ApprenticeState,
  ApprenticeTask,
  BulkContract,
  CharacterSkillId,
  CheckoutSession,
  CustomerPersonality,
  DaySummaryData,
  FloatingMessage,
  GameSettings,
  HudSnapshot,
  LookPreference,
  MarketItemState,
  MilestoneGoalId,
  MilestoneGoalInfo,
  ModalType,
  NeighborhoodEvent,
  OrderCartLine,
  PlacedTransform,
  PlacementHudState,
  PosterId,
  RadioStationId,
  RugThemeId,
  SavePayloadV6,
  SeasonId,
  ServiceOrder,
  ServiceType,
  ShopDecorState,
  SignThemeId,
  SpeechBubble,
  StandId,
  StandStatusInfo,
  VeresiyeEntry,
  WallThemeId,
  WeatherId,
} from './types';

interface ShelfItem {
  group: THREE.Group;
  cat: number;
  tier: number;
  has: boolean;
  locked: boolean;
}

interface LabelEntry {
  mesh: THREE.Mesh;
  cat: number;
  tier: number;
}

interface ActiveCustomer {
  id: number;
  rig: CustomerRig;
  personality: CustomerPersonality;
  personName: string;
  cat: number;
  tier: number;
  itemName: string;
  serviceType?: ServiceType;
  serviceOrder?: ServiceOrder;
  state: 'in' | 'wait' | 'out';
  queueIndex: number;
  path: Array<[number, number]>;
  text: string;
  hint: string;
  patience: number;
  maxPatience: number;
  waitElapsed: number;
  firstTryClueless: boolean;
  noticedOutOfStock?: boolean;
  teaServed: boolean;
  hasBag: boolean;
  nodTimer: number;
}

interface StreetPedestrian {
  rig: CustomerRig;
  minX: number;
  maxX: number;
  z: number;
  speed: number;
  dir: 1 | -1;
  pauseTimer: number;
  phase: number;
}

interface DeliveryBoxEntity {
  id: number;
  rig: DeliveryBoxRig;
  contents: Record<string, number>;
  totalUnits: number;
}

interface ColliderBox {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

interface OrientedColliderBox {
  x: number;
  z: number;
  rotY: number;
  halfW: number;
  halfD: number;
  centerOffsetX?: number;
  centerOffsetZ?: number;
}

interface LegacySavePayload {
  day?: number;
  dayMinutes?: number;
  money?: number;
  creditDebt?: number;
  reputation?: number;
  points?: number;
  served?: number;
  expanded?: boolean;
  teaServings?: number;
  levels?: number[];
  itemStock?: number[];
  customPrices?: Record<string, number>;
  reserveStock?: Record<string, number>;
  pendingOrders?: Record<string, number>;
  veresiyeEntries?: VeresiyeEntry[];
  settings?: Partial<GameSettings>;
}

const QUEUE_SLOTS: ReadonlyArray<[number, number]> = [
  [1.85, -2.05],
  [1.55, -0.95],
  [1.25, 0.15],
];

const BOX_SPOTS: ReadonlyArray<[number, number]> = [
  [-1.35, 4.35],
  [-1.95, 4.35],
  [-1.35, 3.75],
  [-1.95, 3.75],
];

// Pre-allocated math helpers (Zero-GC in animation loop)
const _raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2(0, 0);
const _vecA = new THREE.Vector3();
const _vecB = new THREE.Vector3();
const _vecDir = new THREE.Vector3();
const _floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _upAxis = new THREE.Vector3(0, 1, 0);
const _dayColor = new THREE.Color(0x2a1e14);
const _morningSun = new THREE.Color(0xfff1d6);
const _eveningSun = new THREE.Color(0xffb56b);
const _cloudySky = new THREE.Color(0x9ea8b0);
const _rainSky = new THREE.Color(0x55626d);
const _sunnySky = new THREE.Color(0xc8b48a);
const _dryRoad = new THREE.Color(0x2c2e33);
const _wetRoad = new THREE.Color(0x1b1e23);
const _dryWalk = new THREE.Color(0x857f74);
const _wetWalk = new THREE.Color(0x5d5a53);

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function formatClock(minutes: number): string {
  const m = Math.max(0, Math.floor(minutes));
  const h = Math.floor(m / 60) % 24;
  const min = Math.floor((m % 60) / 5) * 5;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export interface EngineCallbacks {
  onHudChange: (snapshot: HudSnapshot) => void;
  onFloatMessage: (msg: FloatingMessage) => void;
  onSettingsChange: (settings: GameSettings) => void;
}

export class NalburEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;
  private sound = new SoundEngine();

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;

  private frameId = 0;
  private timeoutId = 0;
  private disposed = false;
  private clock = new THREE.Clock();
  private totalTime = 0;
  private lastHudEmit = 0;
  private lastHoverCheck = 0;

  private textures: THREE.Texture[] = [];
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];

  // Shop, Depot & Street 3D objects
  private dustPoints!: THREE.Points;
  private lampLight!: THREE.PointLight;
  private depotLight!: THREE.PointLight;
  private streetLampLight!: THREE.PointLight;
  private streetLampGlowMat!: THREE.MeshStandardMaterial;
  private extraStreetLights: THREE.PointLight[] = [];
  private oppWindowMats: THREE.MeshStandardMaterial[] = [];
  private sunLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private streetMesh!: THREE.Mesh;
  private rainPoints!: THREE.Points;
  private roadMat!: THREE.MeshStandardMaterial;
  private sidewalkMat!: THREE.MeshStandardMaterial;
  private leafMat1!: THREE.MeshStandardMaterial;
  private leafMat2!: THREE.MeshStandardMaterial;
  private contactShadowMat!: THREE.MeshBasicMaterial;

  private wallMat!: THREE.MeshStandardMaterial;
  private rugMat!: THREE.MeshStandardMaterial;
  private signboardMat!: THREE.MeshStandardMaterial;
  private posterMeshes: Partial<Record<PosterId, THREE.Mesh>> = {};
  private nazarGroup!: THREE.Group;

  private registerRig!: CashRegisterRig;
  private chairRig!: ChairRig;
  private teaRig!: TeaStationRig;
  private ledgerRig!: LedgerBookRig;
  private radioRig!: RadioRig;
  private clockRig!: ClockRig;
  private streetStallRig!: StreetStallRig;
  private depotRig!: DepotRackRig;
  private apprenticeRig!: ApprenticeRig;
  private standRigs!: Record<StandId, WorkbenchRig>;
  private boardRig!: BoardRig;
  private drawerOpenTarget = 0;

  private clutterGroup = new THREE.Group();
  private clutterCollider: ColliderBox = { x0: 3, x1: 4.1, z0: 0.75, z1: 5.1 };
  private depotDoorBlock!: THREE.Group;
  private staticColliders: ColliderBox[] = [];
  private furnitureColliders: OrientedColliderBox[] = [];

  private shelfUnits: THREE.Group[] = [];
  private shelfHitboxes: THREE.Mesh[] = [];
  private shelfDustMats: THREE.MeshBasicMaterial[] = [];
  private items: ShelfItem[] = [];
  private pickMeshes: THREE.Mesh[] = [];
  private labels: LabelEntry[] = [];
  private maxAniso = 4;

  // Game & Modal state
  private started = false;
  private modal: ModalType = 'none';
  private pointerLocked = false;
  private pointerLockSupported = true;
  private ignoreNextUnlockPause = false;
  private webglLost = false;
  private noSaveOnUnload = false;

  private settings: GameSettings = {
    sensitivity: 1,
    volume: 0.8,
    lookPreference: 'auto',
  };

  // Player state
  private player = { x: 0, z: 3.6, yaw: 0, pitch: 0 };
  private isSeated = false;
  private keys: Record<string, boolean> = {};
  private moved = false;
  private bob = 0;
  private stepTimer = 0;
  private handSwingTimer = 0;
  private carryingItems: ShelfItem[] = [];
  private carryingReserveKey: string | null = null;
  private carryModel: THREE.Group | null = null;

  // Drag / cursor fallback
  private isDraggingLook = false;
  private dragMoved = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private cursorNdc = new THREE.Vector2(0, 0);
  private hasCursorPos = false;

  // Economy, Tea, Veresiye, Faz 3 & Faz 4 State
  private day = 1;
  private dayMinutes = 8 * 60;
  private money = STARTING_MONEY;
  private creditDebt = 0;
  private reputation = 25;
  private points = 0;
  private pointProgress = 0;
  private served = 0;
  private servicesDone = 0;
  private expanded = false;
  private teaServings = MAX_TEA_SERVINGS;
  private categoryLevels = CATEGORIES.map((c) => c.initialLv);
  private ownedShelves: boolean[] = CATEGORIES.map((c) => c.initialLv > 0);
  private shelfTransforms: PlacedTransform[] = createDefaultShelfTransforms();
  private unlockedStands: Record<StandId, boolean> = {
    scale_repair: false,
    cut_measure: false,
    key_cut: false,
    paint_mix: false,
  };
  private ownedStands: Record<StandId, boolean> = {
    scale_repair: false,
    cut_measure: false,
    key_cut: false,
    paint_mix: false,
  };
  private standTransforms: Record<StandId, PlacedTransform> = createDefaultStandTransforms();
  private characterSkills: Record<CharacterSkillId, number> = {
    fastWalk: 0,
    multiCarry: 0,
    haggleMaster: 0,
    fastCraft: 0,
  };
  private customPrices: Record<string, number> = {};
  private reserveStock: Record<string, number> = {};
  private pendingOrders: Record<string, number> = {};
  private veresiyeEntries: VeresiyeEntry[] = [];
  private veresiyeSeq = 1;
  private market: MarketItemState[] = [];
  private deliveryBoxes: DeliveryBoxEntity[] = [];
  private boxSeq = 1;

  // Faz 3: Layout, Cleanliness, Decor, Street Stall & Apprentice
  private decor: ShopDecorState = createDefaultDecor();
  private shelfPlacements: number[] = [...DEFAULT_SHELF_PLACEMENTS];
  private shelfCleanliness: number[] = CATEGORIES.map(() => 100);
  private shelfTidiness: number[] = CATEGORIES.map(() => 100);
  private streetStallUnlocked = false;
  private streetStallCat = 0;

  // Free 3D Placement Ghost State
  private placementTarget:
    | { kind: 'shelf'; catIndex: number; prev: PlacedTransform | null }
    | { kind: 'stand'; standId: StandId; prev: PlacedTransform | null }
    | null = null;
  private placementX = 0;
  private placementZ = 0;
  private placementRotY = 0;
  private placementValid = false;
  private placementReason: string | null = null;
  private ghostGroup: THREE.Group | null = null;
  private ghostValidMat!: THREE.MeshBasicMaterial;
  private ghostInvalidMat!: THREE.MeshBasicMaterial;
  private ghostFrontMat!: THREE.MeshBasicMaterial;
  private apprentice: ApprenticeState = {
    hired: false,
    name: 'Yusuf',
    task: 'restock',
    level: 1,
    xp: 0,
    nextXp: getApprenticeNextXp(1),
    dailyWage: APPRENTICE_BASE_WAGE,
    tasksDone: 0,
  };
  private apprenticeTarget: [number, number] = [2.6, -4.15];
  private apprenticeActionTimer = 4.0;

  // Faz 5 Part 1 & 2: Atmosphere, Weather, Season, Radio, Events, Contracts & Milestones
  private season: SeasonId = 'spring';
  private weather: WeatherId = 'sunny';
  private radioStation: RadioStationId = 'off';
  private pedestrians: StreetPedestrian[] = [];
  private dailyEvent: NeighborhoodEvent = { ...NEIGHBORHOOD_EVENTS.calm };
  private contracts: BulkContract[] = [];
  private contractSeq = 1;
  private contractsDone = 0;
  private dayContractsCompleted = 0;
  private cleanStreak = 0;
  private claimedMilestones: MilestoneGoalId[] = [];

  // Daily stats
  private dayRevenue = 0;
  private dayVeresiyeCollected = 0;
  private dayVeresiyeWritten = 0;
  private dayWholesaleSpent = 0;
  private dayCustomersServed = 0;
  private dayCustomersLost = 0;
  private dayRepStart = 25;
  private daySatisfactionList: number[] = [];
  private lastDaySummary: DaySummaryData | null = null;

  // Checkout & Service state
  private activeCheckout: CheckoutSession | null = null;
  private activeService: ServiceOrder | null = null;
  private checkoutCustomerId: number | null = null;
  private checkoutCat = -1;
  private checkoutTier = 0;

  // Customers & Queue
  private customers: ActiveCustomer[] = [];
  private customerSeq = 1;
  private spawnTimer = 2.0;
  private bubble: SpeechBubble | null = null;
  private bubbleClearTimer = 0;
  private tipTimer = 14;
  private floatSeq = 1;

  // Current raycast hover
  private hoveredItem: ShelfItem | null = null;
  private hoveredCustomer: ActiveCustomer | null = null;
  private hoveredChair = false;
  private hoveredBox: DeliveryBoxEntity | null = null;
  private hoveredRegister = false;
  private hoveredTea = false;
  private hoveredLedger = false;
  private hoveredDepot = false;
  private hoveredStall = false;
  private hoveredApprentice = false;
  private hoveredStandId: StandId | null = null;
  private hoveredRadio = false;
  private hoveredBoard = false;
  private hoveredShelfCat: number | null = null;

  private saveIntervalId = 0;

  // Bound event handlers
  private onResizeBound: () => void;
  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onKeyUpBound: (e: KeyboardEvent) => void;
  private onPointerLockChangeBound: () => void;
  private onPointerLockErrorBound: () => void;
  private onMouseDownBound: (e: MouseEvent) => void;
  private onMouseMoveBound: (e: MouseEvent) => void;
  private onMouseUpBound: (e: MouseEvent) => void;
  private onWheelBound: (e: WheelEvent) => void;
  private onContextMenuBound: (e: MouseEvent) => void;
  private onBeforeUnloadBound: () => void;
  private onContextLostBound: (e: Event) => void;
  private onContextRestoredBound: () => void;

  constructor(container: HTMLElement, callbacks: EngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareWebGL();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2),
    );
    this.renderer.setSize(
      container.clientWidth || window.innerWidth,
      container.clientHeight || window.innerHeight,
    );
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    this.maxAniso = this.renderer.capabilities.getMaxAnisotropy();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2a1e14);
    this.scene.fog = new THREE.Fog(0x2a1e14, 24, 62);

    const aspect =
      (container.clientWidth || window.innerWidth) /
      Math.max(1, container.clientHeight || window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(68, aspect, 0.05, 110);
    this.scene.add(this.camera);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmrem.fromScene(roomEnv, 0.04).texture;
    this.scene.environment = envTex;
    this.textures.push(envTex);
    roomEnv.dispose();
    pmrem.dispose();

    this.initDefaultPrices();
    this.buildShop();
    this.loadSave();
    this.season = getSeasonForDay(this.day);
    this.applyWeatherAndSeasonVisuals();
    this.applyDecorVisuals();
    this.placeShelfUnits();
    this.syncStreetStallVisuals();
    this.syncDepotCrates();
    this.syncApprenticeVisuals();
    this.teaRig.teaLiquid.visible = this.teaServings > 0;
    this.radioRig.dialMat.emissiveIntensity = this.radioStation === 'off' ? 0.12 : 1.15;
    this.sound.setRadioStation(this.radioStation, false);
    this.ensureDailyContracts();
    this.market = generateDailyMarket(this.day, this.categoryLevels, this.dailyEvent);
    this.refreshAllShelfLabels();
    this.sound.setVolume(this.settings.volume);
    this.callbacks.onSettingsChange({ ...this.settings });

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.onResizeBound = this.handleResize.bind(this);
    this.onKeyDownBound = this.handleKeyDown.bind(this);
    this.onKeyUpBound = this.handleKeyUp.bind(this);
    this.onPointerLockChangeBound = this.handlePointerLockChange.bind(this);
    this.onPointerLockErrorBound = this.handlePointerLockError.bind(this);
    this.onMouseDownBound = this.handleCanvasMouseDown.bind(this);
    this.onMouseMoveBound = this.handleWindowMouseMove.bind(this);
    this.onMouseUpBound = this.handleWindowMouseUp.bind(this);
    this.onWheelBound = this.handleCanvasWheel.bind(this);
    this.onContextMenuBound = (e: MouseEvent) => e.preventDefault();
    this.onBeforeUnloadBound = () => this.save();
    this.onContextLostBound = (e: Event) => {
      e.preventDefault();
      this.webglLost = true;
      this.emitHud();
    };
    this.onContextRestoredBound = () => {
      this.webglLost = false;
      this.emitHud();
    };

    window.addEventListener('resize', this.onResizeBound);
    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
    document.addEventListener('pointerlockchange', this.onPointerLockChangeBound);
    document.addEventListener('pointerlockerror', this.onPointerLockErrorBound);
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDownBound);
    window.addEventListener('mousemove', this.onMouseMoveBound);
    window.addEventListener('mouseup', this.onMouseUpBound);
    this.renderer.domElement.addEventListener('wheel', this.onWheelBound, { passive: false });
    this.renderer.domElement.addEventListener('contextmenu', this.onContextMenuBound);
    window.addEventListener('beforeunload', this.onBeforeUnloadBound);
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLostBound);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestoredBound);

    this.saveIntervalId = window.setInterval(() => this.save(), 10000);
    this.emitHud();
    this.tick();
  }

  private initDefaultPrices(): void {
    for (let c = 0; c < CATEGORIES.length; c++) {
      for (let t = 1; t <= 3; t++) {
        this.customPrices[ITEM_KEY(c, t)] = getSuggestedPrice(c, t);
      }
    }
  }

  private getSellPrice(cat: number, tier: number): number {
    return this.customPrices[ITEM_KEY(cat, tier)] ?? getSuggestedPrice(cat, tier);
  }

  private trackGeo<T extends THREE.BufferGeometry>(g: T): T {
    this.geometries.push(g);
    return g;
  }

  private trackMat<T extends THREE.Material>(m: T): T {
    this.materials.push(m);
    return m;
  }

  private trackRigResources(root: THREE.Object3D): void {
    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        this.geometries.push(mesh.geometry);
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => this.materials.push(m));
        } else {
          this.materials.push(mesh.material);
        }
      }
    });
  }

  private box(
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    parent: THREE.Object3D = this.scene,
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(this.trackGeo(new THREE.BoxGeometry(w, h, d)), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  private addStaticCollider(x0: number, x1: number, z0: number, z1: number): void {
    this.staticColliders.push({ x0, x1, z0, z1 });
  }

  private addContactShadow(
    parent: THREE.Object3D,
    w: number,
    d: number,
    x = 0,
    z = 0,
  ): THREE.Mesh {
    const m = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(w, d)),
      this.contactShadowMat,
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.008, z);
    parent.add(m);
    return m;
  }

  private buildShop(): void {
    const tex = createShopTextures(this.maxAniso);
    Object.values(tex).forEach((t) => this.textures.push(t));
    const shadowTex = createContactShadowTexture(this.maxAniso);
    const clockFaceTex = createClockFaceTexture(this.maxAniso);
    const lampHaloTex = createLampHaloTexture(this.maxAniso);
    const corkTex = createCorkBoardTexture(this.maxAniso);
    this.textures.push(shadowTex, clockFaceTex, lampHaloTex, corkTex);

    this.contactShadowMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
      }),
    );

    const mWood = this.trackMat(new THREE.MeshStandardMaterial({ map: tex.wood, roughness: 0.85 }));
    const mDark = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.8 }));
    const mBeam = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x452b17, roughness: 0.88 }));
    const mMetal = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0x9a9a98, metalness: 0.65, roughness: 0.35 }),
    );
    this.wallMat = this.trackMat(new THREE.MeshStandardMaterial({ map: tex.wall, roughness: 0.95 }));

    // Main shop floor & ceiling
    const floor = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(8, 11)),
      this.trackMat(new THREE.MeshStandardMaterial({ map: tex.floor, roughness: 0.52 })),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const ceil = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(8, 11)),
      this.trackMat(new THREE.MeshStandardMaterial({ map: tex.ceiling, roughness: 1 })),
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 3.1;
    this.scene.add(ceil);

    // Ceiling beams + corner wooden pilasters
    [-4.2, -1.4, 1.4, 4.2].forEach((bz) => {
      this.box(8.0, 0.14, 0.18, mBeam, 0, 3.03, bz);
    });
    this.box(0.14, 3.1, 0.14, mBeam, -3.96, 1.55, -5.46);
    this.box(0.14, 3.1, 0.14, mBeam, 3.96, 1.55, -5.46);
    this.box(0.14, 3.1, 0.14, mBeam, -3.96, 1.55, 5.46);
    this.box(0.14, 3.1, 0.14, mBeam, 3.96, 1.55, 5.46);

    // Chair rail wooden molding trim along interior walls
    this.box(0.03, 0.06, 10.9, mDark, -3.99, 1.42, 0);
    this.box(7.9, 0.06, 0.03, mDark, 0, 1.42, -5.49);
    this.box(0.03, 0.06, 3.2, mDark, 3.99, 1.42, -3.95);
    this.box(0.03, 0.06, 6.1, mDark, 3.99, 1.42, 2.5);
    this.box(3.38, 0.06, 0.03, mDark, 2.31, 1.42, 5.49);

    // Left & Back Walls
    this.box(0.2, 3.1, 11, this.wallMat, -4.1, 1.55, 0);
    this.box(8.2, 3.1, 0.2, this.wallMat, 0, 1.55, -5.6);

    // Right wall split with doorway opening to Depo Odası (doorway z = -2.3..-0.6)
    this.box(0.2, 3.1, 3.3, this.wallMat, 4.1, 1.55, -3.95);
    this.box(0.2, 3.1, 6.2, this.wallMat, 4.1, 1.55, 2.5);
    this.box(0.2, 0.9, 1.7, this.wallMat, 4.1, 2.65, -1.45);
    this.box(0.24, 2.2, 0.1, mDark, 4.1, 1.1, -2.28);
    this.box(0.24, 2.2, 0.1, mDark, 4.1, 1.1, -0.62);

    // Locked depot door barrier before expansion
    this.depotDoorBlock = new THREE.Group();
    this.box(0.14, 2.2, 1.62, mWood, 4.08, 1.1, -1.45, this.depotDoorBlock);
    const lockSignTex = createSignTexture('DEPO (GENİŞLET)', this.maxAniso);
    this.textures.push(lockSignTex);
    const lockSign = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(1.1, 0.3)),
      this.trackMat(new THREE.MeshStandardMaterial({ map: lockSignTex, roughness: 0.7 })),
    );
    lockSign.position.set(3.98, 1.45, -1.45);
    lockSign.rotation.y = -Math.PI / 2;
    this.depotDoorBlock.add(lockSign);
    this.scene.add(this.depotDoorBlock);

    // ---------- Expanded Walk-in Depo Odası (x: 4.1..7.6, z: -5.4..2.4) ----------
    const depotFloor = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(3.6, 8.0)),
      this.trackMat(new THREE.MeshStandardMaterial({ map: tex.floor, roughness: 0.7 })),
    );
    depotFloor.rotation.x = -Math.PI / 2;
    depotFloor.position.set(5.85, 0.002, -1.5);
    depotFloor.receiveShadow = true;
    this.scene.add(depotFloor);

    const depotCeil = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(3.6, 8.0)),
      this.trackMat(new THREE.MeshStandardMaterial({ map: tex.ceiling, roughness: 1 })),
    );
    depotCeil.rotation.x = Math.PI / 2;
    depotCeil.position.set(5.85, 3.1, -1.5);
    this.scene.add(depotCeil);

    this.box(0.2, 3.1, 8.2, this.wallMat, 7.65, 1.55, -1.5);
    this.box(3.7, 3.1, 0.2, this.wallMat, 5.85, 1.55, -5.55);
    this.box(3.7, 3.1, 0.2, this.wallMat, 5.85, 1.55, 2.55);
    this.box(3.5, 0.11, 0.04, mBeam, 5.85, 0.055, -5.44);
    this.box(3.5, 0.11, 0.04, mBeam, 5.85, 0.055, 2.44);
    this.box(0.04, 0.11, 7.9, mBeam, 7.54, 0.055, -1.5);

    // Depot ceiling lamp
    const depotBulb = new THREE.Mesh(
      this.trackGeo(new THREE.SphereGeometry(0.06, 10, 10)),
      this.trackMat(new THREE.MeshBasicMaterial({ color: 0xffe8b0 })),
    );
    depotBulb.position.set(5.85, 2.75, -1.5);
    this.scene.add(depotBulb);
    this.depotLight = new THREE.PointLight(0xffcf88, 0.85, 9, 1.6);
    this.depotLight.position.set(5.85, 2.65, -1.5);
    this.scene.add(this.depotLight);

    // Depot Storage Rack on back wall of Depo Odası
    this.depotRig = createDepotRackModel();
    this.depotRig.group.position.set(5.65, 0, -4.92);
    this.depotRig.group.rotation.y = Math.PI / 2;
    this.depotRig.hitbox.userData.isDepot = true;
    this.trackRigResources(this.depotRig.group);
    this.scene.add(this.depotRig.group);

    // Front wall: Right solid + Left Vitrin Display Window + Doorway
    this.box(3.7, 3.1, 0.2, this.wallMat, 2.45, 1.55, 5.6); // Front right
    this.box(1.2, 0.9, 0.2, this.wallMat, 0, 2.65, 5.6); // Door header
    this.box(0.12, 2.2, 0.12, mDark, -0.62, 1.1, 5.5);
    this.box(0.12, 2.2, 0.12, mDark, 0.62, 1.1, 5.5);

    // Front-Left Vitrin Display Window (x: -4.0..-0.65)
    this.box(0.85, 3.1, 0.2, this.wallMat, -3.72, 1.55, 5.6);
    this.box(0.55, 3.1, 0.2, this.wallMat, -0.92, 1.55, 5.6);
    this.box(2.3, 0.9, 0.2, this.wallMat, -2.25, 0.45, 5.6);
    this.box(2.3, 0.85, 0.2, this.wallMat, -2.25, 2.67, 5.6);
    const vitrinGlass = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(2.15, 1.32)),
      this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0xdff2f7,
          transparent: true,
          opacity: 0.2,
          roughness: 0.08,
          side: THREE.DoubleSide,
        }),
      ),
    );
    vitrinGlass.position.set(-2.25, 1.56, 5.58);
    this.scene.add(vitrinGlass);
    // Interior Vitrin Wooden Ledge & Showcase Props
    this.box(2.2, 0.06, 0.42, mWood, -2.25, 0.92, 5.36);
    const vitrinPaint = createProductModel(3, 1, 0x3f9a5a);
    vitrinPaint.position.set(-2.65, 0.96, 5.34);
    this.trackRigResources(vitrinPaint);
    this.scene.add(vitrinPaint);
    const vitrinLamp = createProductModel(2, 1, 0xe0b030);
    vitrinLamp.position.set(-1.95, 0.96, 5.34);
    this.trackRigResources(vitrinLamp);
    this.scene.add(vitrinLamp);

    // Baseboards (süpürgelikler)
    this.box(0.04, 0.11, 11.0, mBeam, -3.98, 0.055, 0);
    this.box(0.04, 0.11, 3.2, mBeam, 3.98, 0.055, -3.9);
    this.box(0.04, 0.11, 6.1, mBeam, 3.98, 0.055, 2.45);
    this.box(8.0, 0.11, 0.04, mBeam, 0, 0.055, -5.48);
    this.box(3.38, 0.11, 0.04, mBeam, 2.31, 0.055, 5.48);

    // Exterior Shop Signboard above entrance awning
    this.signboardMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: createShopSignboardTexture(this.decor.shopName, this.decor.signTheme, this.maxAniso),
        roughness: 0.55,
      }),
    );
    const signboardFrame = this.box(2.8, 0.66, 0.1, mDark, 0, 2.92, 5.74);
    const signFace = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(2.68, 0.58)),
      this.signboardMat,
    );
    signFace.position.set(0, 0, 0.055);
    signboardFrame.add(signFace);

    // Brass door bell + Nazar Charm near entrance
    const brassMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0xd4ad52, metalness: 0.88, roughness: 0.22 }),
    );
    const doorBell = new THREE.Mesh(
      this.trackGeo(new THREE.ConeGeometry(0.055, 0.08, 12)),
      brassMat,
    );
    doorBell.position.set(0.46, 2.08, 5.42);
    this.scene.add(doorBell);
    this.box(0.015, 0.1, 0.015, mDark, 0.46, 2.15, 5.42);

    this.nazarGroup = createNazarModel();
    this.nazarGroup.position.set(0.68, 1.92, 5.42);
    this.nazarGroup.rotation.y = Math.PI;
    this.trackRigResources(this.nazarGroup);
    this.scene.add(this.nazarGroup);

    // Decorative Wall Posters
    const posterSlots: Array<{ id: PosterId; pos: [number, number, number]; rotY: number }> = [
      { id: 'veresiye', pos: [0.05, 1.85, -5.48], rotY: 0 },
      { id: 'kalite', pos: [3.98, 1.85, 0.25], rotY: -Math.PI / 2 },
      { id: 'mahalle', pos: [1.9, 1.85, 5.48], rotY: Math.PI },
    ];
    for (const ps of posterSlots) {
      const pTex = createPosterTexture(ps.id, this.maxAniso);
      this.textures.push(pTex);
      const pMesh = new THREE.Mesh(
        this.trackGeo(new THREE.PlaneGeometry(0.55, 0.7)),
        this.trackMat(new THREE.MeshStandardMaterial({ map: pTex, roughness: 0.75 })),
      );
      pMesh.position.set(...ps.pos);
      pMesh.rotation.y = ps.rotY;
      this.scene.add(pMesh);
      this.posterMeshes[ps.id] = pMesh;
    }

    // ---------- Expanded Neighborhood Street Scene (Mahalle Sokağı) ----------
    // Sky dome so looking any direction outside feels natural & seamless
    this.streetMesh = new THREE.Mesh(
      this.trackGeo(new THREE.SphereGeometry(58, 24, 14)),
      this.trackMat(new THREE.MeshBasicMaterial({ color: 0xc8b48a, side: THREE.BackSide, fog: false })),
    );
    this.streetMesh.position.set(0, 6, 8);
    this.scene.add(this.streetMesh);

    const redCanvas = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x9b3324, roughness: 0.82 }));
    const creamCanvas = this.trackMat(new THREE.MeshStandardMaterial({ color: 0xefe3c6, roughness: 0.82 }));
    const awningGroup = new THREE.Group();
    awningGroup.position.set(0, 2.38, 5.98);
    awningGroup.rotation.x = 0.24;
    for (let i = -3; i <= 3; i++) {
      this.box(0.32, 0.04, 0.9, i % 2 === 0 ? redCanvas : creamCanvas, i * 0.32, 0, 0, awningGroup);
    }
    this.scene.add(awningGroup);

    // Street Stall (Kapı Önü Tezgâhı) on front-left sidewalk
    this.streetStallRig = createStreetStallModel();
    this.streetStallRig.group.position.set(-1.75, 0, 6.28);
    this.streetStallRig.hitbox.userData.isStall = true;
    this.addContactShadow(this.streetStallRig.group, 1.5, 0.9);
    this.trackRigResources(this.streetStallRig.group);
    this.scene.add(this.streetStallRig.group);

    this.sidewalkMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x857f74, roughness: 0.95 }));
    const curbMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0xa29b8e, roughness: 0.92 }));
    const grassMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x557544, roughness: 0.95 }));
    const roofTileMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x8d422d, roughness: 0.88 }));

    // Extended ground & sidewalks (52m wide street)
    const sidewalkFront = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(52, 2.5)),
      this.sidewalkMat,
    );
    sidewalkFront.rotation.x = -Math.PI / 2;
    sidewalkFront.position.set(0, -0.005, 6.6);
    this.scene.add(sidewalkFront);
    this.box(52, 0.1, 0.16, curbMat, 0, -0.04, 7.82);

    this.roadMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x2c2e33, roughness: 0.94 }));
    const road = new THREE.Mesh(this.trackGeo(new THREE.PlaneGeometry(52, 3.8)), this.roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.08, 9.7);
    this.scene.add(road);

    const stripeMat = this.trackMat(new THREE.MeshBasicMaterial({ color: 0xd8d2c2 }));
    for (let sx = -23; sx <= 23; sx += 2.4) {
      const dash = new THREE.Mesh(this.trackGeo(new THREE.PlaneGeometry(1.15, 0.09)), stripeMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(sx, -0.075, 9.7);
      this.scene.add(dash);
    }

    this.box(52, 0.1, 0.16, curbMat, 0, -0.04, 11.58);
    const oppSidewalk = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(52, 3.2)),
      this.sidewalkMat,
    );
    oppSidewalk.rotation.x = -Math.PI / 2;
    oppSidewalk.position.set(0, -0.005, 13.15);
    this.scene.add(oppSidewalk);

    // Park & surrounding earth plane so there is zero void anywhere outside
    const outerGround = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(90, 60)),
      grassMat,
    );
    outerGround.rotation.x = -Math.PI / 2;
    outerGround.position.set(0, -0.1, 14);
    this.scene.add(outerGround);

    // Helper for neighborhood building windows that light up at dusk
    const addBuildingWindow = (wx: number, wy: number, wz: number, rotY = 0) => {
      const winMat = this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x3a3228,
          emissive: 0xffc86b,
          emissiveIntensity: 0.12,
          roughness: 0.35,
        }),
      );
      this.oppWindowMats.push(winMat);
      const wFrame = this.box(1.15, 1.25, 0.08, winMat, wx, wy, wz);
      wFrame.rotation.y = rotY;
      const sill = this.box(1.3, 0.09, 0.12, mDark, wx, wy - 0.65, wz + (rotY === 0 ? -0.02 : 0.02));
      sill.rotation.y = rotY;
    };

    // --- Same Side Left Neighbor: Mahalle Kahvehanesi (x: -11.5 .. -4.2) ---
    const kahveMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0xb89c78, roughness: 0.92 }));
    const kahveTrimMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x3f5d42, roughness: 0.85 }));
    this.box(7.3, 4.6, 6.2, kahveMat, -7.85, 2.3, 2.5);
    this.box(7.5, 0.35, 6.5, roofTileMat, -7.85, 4.75, 2.5);
    this.box(7.35, 2.1, 0.16, kahveTrimMat, -7.85, 1.05, 5.56);
    const kahveSignTex = createSignTexture('MAHALLE KIRAATHANESİ', this.maxAniso);
    this.textures.push(kahveSignTex);
    const kahveSign = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(3.2, 0.48)),
      this.trackMat(new THREE.MeshStandardMaterial({ map: kahveSignTex, roughness: 0.6 })),
    );
    kahveSign.position.set(-7.85, 2.42, 5.66);
    this.scene.add(kahveSign);
    addBuildingWindow(-9.6, 3.45, 5.64);
    addBuildingWindow(-6.1, 3.45, 5.64);
    this.addStaticCollider(-11.5, -4.2, 4.9, 5.75);

    // Outdoor Cafe Tables on sidewalk in front of Kahvehane
    [-9.2, -6.7].forEach((tx) => {
      const table = createCafeTableModel();
      table.position.set(tx, 0, 6.65);
      this.trackRigResources(table);
      this.scene.add(table);
      this.addStaticCollider(tx - 0.72, tx + 0.72, 6.15, 7.15);
    });

    // --- Far Left House (x: -20.5 .. -11.7) ---
    const leftHouseMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0xd1bfa0, roughness: 0.92 }));
    this.box(8.8, 5.8, 6.8, leftHouseMat, -16.1, 2.9, 2.2);
    this.box(9.0, 0.45, 7.0, roofTileMat, -16.1, 6.0, 2.2);
    addBuildingWindow(-18.0, 3.6, 5.64);
    addBuildingWindow(-14.2, 3.6, 5.64);
    addBuildingWindow(-16.1, 1.5, 5.64);
    this.addStaticCollider(-20.5, -11.7, 5.1, 5.75);

    // --- Connector wall + Right Neighbor: Mahalle Fırını (x: 7.7 .. 15.0) ---
    // Brick courtyard wall in front of Depo Odası connecting Nalbur facade to Fırın
    const brickWallMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x9b7254, roughness: 0.92 }));
    this.box(3.55, 2.9, 0.22, brickWallMat, 5.9, 1.45, 5.6);
    this.box(3.65, 0.16, 0.34, roofTileMat, 5.9, 2.95, 5.6);
    this.addStaticCollider(4.1, 7.7, 5.3, 5.78);

    const firinMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0xc99c72, roughness: 0.92 }));
    const firinBaseMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x7b4728, roughness: 0.88 }));
    this.box(7.3, 5.4, 6.4, firinMat, 11.35, 2.7, 2.4);
    this.box(7.5, 0.42, 6.6, roofTileMat, 11.35, 5.6, 2.4);
    this.box(7.35, 2.1, 0.16, firinBaseMat, 11.35, 1.05, 5.56);
    const firinSignTex = createSignTexture('TAŞ FIRIN & BAKKAL', this.maxAniso);
    this.textures.push(firinSignTex);
    const firinSign = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(3.2, 0.48)),
      this.trackMat(new THREE.MeshStandardMaterial({ map: firinSignTex, roughness: 0.6 })),
    );
    firinSign.position.set(11.35, 2.42, 5.66);
    this.scene.add(firinSign);
    addBuildingWindow(9.6, 3.65, 5.64);
    addBuildingWindow(13.1, 3.65, 5.64);
    this.addStaticCollider(7.7, 15.0, 4.9, 5.75);

    // --- Far Right Building (x: 15.2 .. 23.5) ---
    const rightHouseMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0xbaaa8e, roughness: 0.92 }));
    this.box(8.3, 6.2, 6.6, rightHouseMat, 19.35, 3.1, 2.3);
    this.box(8.5, 0.45, 6.8, roofTileMat, 19.35, 6.4, 2.3);
    addBuildingWindow(17.4, 3.7, 5.64);
    addBuildingWindow(21.1, 3.7, 5.64);

    // --- Opposite Side of Street (z: 13.5..18) ---
    const facadeMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0xc29e74, roughness: 0.92 }));
    const lowerShopMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x7a5c44, roughness: 0.9 }));
    const shutterMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x5c646b, metalness: 0.35, roughness: 0.6 }));

    // Opposite Left-Center Apartman & Berber (x: -16 .. -4.8)
    this.box(11.2, 6.2, 3.4, facadeMat, -10.4, 3.1, 15.8);
    this.box(11.4, 0.42, 3.6, roofTileMat, -10.4, 6.4, 15.8);
    this.box(11.3, 2.0, 3.45, lowerShopMat, -10.4, 1.0, 15.8);
    this.box(2.2, 1.45, 0.08, shutterMat, -12.6, 0.85, 14.04);
    this.box(2.2, 1.45, 0.08, shutterMat, -7.8, 0.85, 14.04);
    [-13.2, -10.2, -7.2].forEach((wx) => {
      addBuildingWindow(wx, 3.55, 14.06, Math.PI);
    });
    this.addStaticCollider(-16.0, -4.8, 13.8, 17.5);

    // Opposite Right Apartman & Manav (x: 5.2 .. 17.5)
    const oppRightMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0xcfa97d, roughness: 0.92 }));
    this.box(12.3, 5.8, 3.4, oppRightMat, 11.35, 2.9, 15.8);
    this.box(12.5, 0.42, 3.6, roofTileMat, 11.35, 6.0, 15.8);
    this.box(12.4, 2.0, 3.45, kahveTrimMat, 11.35, 1.0, 15.8);
    this.box(2.4, 1.45, 0.08, shutterMat, 8.2, 0.85, 14.04);
    this.box(2.4, 1.45, 0.08, shutterMat, 13.8, 0.85, 14.04);
    [7.8, 11.2, 14.6].forEach((wx) => {
      addBuildingWindow(wx, 3.55, 14.06, Math.PI);
    });
    this.addStaticCollider(5.2, 17.5, 13.8, 17.5);

    // --- Center-Opposite Mini Park & Mahalle Çeşmesi (x: -4.4 .. 4.8, z: 12.6..17) ---
    const fountain = createFountainModel();
    fountain.position.set(0.2, 0, 13.6);
    fountain.rotation.y = Math.PI;
    this.trackRigResources(fountain);
    this.scene.add(fountain);
    this.addStaticCollider(-0.6, 1.0, 13.0, 14.3);

    [-2.4, 2.8].forEach((bx) => {
      const bench = createParkBenchModel();
      bench.position.set(bx, 0, 13.3);
      bench.rotation.y = Math.PI;
      this.trackRigResources(bench);
      this.scene.add(bench);
      this.addStaticCollider(bx - 0.9, bx + 0.9, 12.9, 13.7);
    });

    // Street Lamp Posts (3 along the sidewalk)
    const poleMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x2c3034, metalness: 0.6, roughness: 0.45 }));
    this.streetLampGlowMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        color: 0xfff0c8,
        emissive: 0xffbe55,
        emissiveIntensity: 0.1,
        roughness: 0.25,
      }),
    );

    const createLampPost = (lx: number, lz: number, isMain: boolean) => {
      const pole = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(0.055, 0.08, 3.4, 10)),
        poleMat,
      );
      pole.position.set(lx, 1.7, lz);
      this.scene.add(pole);
      this.box(0.45, 0.06, 0.06, poleMat, lx - 0.2, 3.35, lz);
      const lantern = new THREE.Mesh(
        this.trackGeo(new THREE.SphereGeometry(0.14, 12, 10)),
        this.streetLampGlowMat,
      );
      lantern.position.set(lx - 0.39, 3.26, lz);
      this.scene.add(lantern);
      const pLight = new THREE.PointLight(0xffc978, 0, 13, 1.6);
      pLight.position.set(lx - 0.39, 3.1, lz);
      this.scene.add(pLight);
      if (isMain) {
        this.streetLampLight = pLight;
      } else {
        this.extraStreetLights.push(pLight);
      }
      this.addStaticCollider(lx - 0.16, lx + 0.16, lz - 0.16, lz + 0.16);
    };

    createLampPost(2.35, 7.55, true);
    createLampPost(-8.2, 7.55, false);
    createLampPost(10.4, 7.55, false);

    // Neighborhood Trees across the street & ends (with season-reactive foliage)
    const barkMat = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x5c422c, roughness: 0.95 }));
    this.leafMat1 = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x4b7438, roughness: 0.88 }));
    this.leafMat2 = this.trackMat(new THREE.MeshStandardMaterial({ color: 0x5f8842, roughness: 0.88 }));

    const plantTree = (tx: number, tz: number, scale = 1) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(tx, 0, tz);
      treeGroup.scale.setScalar(scale);
      const trunk = new THREE.Mesh(
        this.trackGeo(new THREE.CylinderGeometry(0.14, 0.21, 2.1, 10)),
        barkMat,
      );
      trunk.position.y = 1.05;
      treeGroup.add(trunk);
      this.box(0.82, 0.14, 0.82, curbMat, 0, 0.07, 0, treeGroup);
      [
        [0, 2.55, 0, 0.95, this.leafMat1],
        [-0.48, 2.25, 0.25, 0.68, this.leafMat2],
        [0.52, 2.3, -0.2, 0.72, this.leafMat2],
        [0.1, 3.05, 0.12, 0.62, this.leafMat1],
      ].forEach(([cx, cy, cz, rad, lmat]) => {
        const crown = new THREE.Mesh(
          this.trackGeo(new THREE.SphereGeometry(rad as number, 12, 10)),
          lmat as THREE.Material,
        );
        crown.position.set(cx as number, cy as number, cz as number);
        treeGroup.add(crown);
      });
      this.scene.add(treeGroup);
      this.addStaticCollider(tx - 0.45 * scale, tx + 0.45 * scale, tz - 0.45 * scale, tz + 0.45 * scale);
    };

    plantTree(-3.8, 12.2, 1.0);
    plantTree(4.3, 12.2, 1.05);
    plantTree(-13.8, 12.3, 0.95);
    plantTree(13.6, 12.3, 1.1);

    // Outdoor Falling Rain Particle System (active on rainy days)
    const rainCount = 420;
    const rainGeo = this.trackGeo(new THREE.BufferGeometry());
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPos[i] = (Math.random() - 0.5) * 38;
      rainPos[i + 1] = Math.random() * 9 + 0.3;
      rainPos[i + 2] = 5.9 + Math.random() * 12.5;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    this.rainPoints = new THREE.Points(
      rainGeo,
      this.trackMat(
        new THREE.PointsMaterial({
          color: 0xcbd8e6,
          size: 0.065,
          transparent: true,
          opacity: 0.58,
          depthWrite: false,
        }),
      ),
    );
    this.rainPoints.visible = false;
    this.scene.add(this.rainPoints);

    // Ambient Neighborhood Pedestrians (Sokak Hareketliliği)
    const pedConfigs: Array<{ minX: number; maxX: number; z: number; speed: number; dir: 1 | -1 }> = [
      { minX: -16, maxX: 16, z: 7.26, speed: 1.05, dir: 1 },
      { minX: -15, maxX: 15, z: 7.42, speed: 0.92, dir: -1 },
      { minX: -15, maxX: 15, z: 12.15, speed: 1.12, dir: 1 },
      { minX: -14, maxX: 14, z: 12.55, speed: 0.88, dir: -1 },
      { minX: -12, maxX: 12, z: 12.85, speed: 0.96, dir: 1 },
    ];
    pedConfigs.forEach((cfg, idx) => {
      const pType: CustomerPersonality = idx % 3 === 0 ? 'neighbor' : idx % 3 === 1 ? 'craftsman' : 'haggler';
      const rig = createCustomerModel(pType);
      const startX = cfg.minX + ((idx + 1) / (pedConfigs.length + 1)) * (cfg.maxX - cfg.minX);
      rig.group.position.set(startX, 0, cfg.z);
      rig.group.rotation.y = cfg.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      this.addContactShadow(rig.group, 0.72, 0.72);
      this.trackRigResources(rig.group);
      this.scene.add(rig.group);
      this.pedestrians.push({
        rig,
        minX: cfg.minX,
        maxX: cfg.maxX,
        z: cfg.z,
        speed: cfg.speed,
        dir: cfg.dir,
        pauseTimer: idx === 1 ? 1.5 : 0,
        phase: idx * 1.4,
      });
    });

    // Back wall window + Sill & Pot
    const win = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(1.6, 1.3)),
      this.trackMat(new THREE.MeshBasicMaterial({ color: 0xffe9b8 })),
    );
    win.position.set(-1.5, 1.9, -5.49);
    this.scene.add(win);
    this.box(1.8, 0.1, 0.1, mDark, -1.5, 2.58, -5.45);
    this.box(1.8, 0.1, 0.1, mDark, -1.5, 1.22, -5.45);
    this.box(0.1, 1.4, 0.1, mDark, -2.35, 1.9, -5.45);
    this.box(0.1, 1.4, 0.1, mDark, -0.65, 1.9, -5.45);
    this.box(0.05, 1.3, 0.05, mDark, -1.5, 1.9, -5.45);
    this.box(1.6, 0.05, 0.05, mDark, -1.5, 1.9, -5.45);
    this.box(1.9, 0.06, 0.22, mWood, -1.5, 1.16, -5.39);
    const pot = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(0.075, 0.055, 0.12, 12)),
      this.trackMat(new THREE.MeshStandardMaterial({ color: 0xb65c36, roughness: 0.78 })),
    );
    pot.position.set(-2.05, 1.25, -5.36);
    this.scene.add(pot);
    const sprout = new THREE.Mesh(
      this.trackGeo(new THREE.SphereGeometry(0.09, 10, 8)),
      this.leafMat2,
    );
    sprout.position.set(-2.05, 1.36, -5.36);
    this.scene.add(sprout);

    // Pegboard & Animated Wall Clock on back wall
    const peg = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(2.6, 1.6)),
      this.trackMat(new THREE.MeshStandardMaterial({ map: tex.pegboard, roughness: 0.9 })),
    );
    peg.position.set(1.4, 1.7, -5.48);
    peg.receiveShadow = true;
    this.scene.add(peg);
    const handleColors = [0xc0392b, 0x2d6a9f, 0xd9a32a];
    for (let i = 0; i < 6; i++) {
      const tx = 0.3 + i * 0.42;
      this.box(0.04, 0.5 + (i % 3) * 0.12, 0.03, mMetal, tx, 1.75, -5.44);
      const hMat = this.trackMat(
        new THREE.MeshStandardMaterial({ color: handleColors[i % 3], roughness: 0.6 }),
      );
      this.box(0.14, 0.07, 0.04, hMat, tx, 1.5 - (i % 3) * 0.06, -5.43);
    }

    this.clockRig = createWallClockModel(clockFaceTex);
    this.clockRig.group.position.set(1.4, 2.74, -5.46);
    this.trackRigResources(this.clockRig.group);
    this.scene.add(this.clockRig.group);

    // Mahalle İlan & İhale Panosu on right wall beside counter
    this.boardRig = createBulletinBoardModel(corkTex);
    this.boardRig.group.position.set(3.94, 1.82, -3.55);
    this.boardRig.group.rotation.y = -Math.PI / 2;
    this.boardRig.hitbox.userData.isBoard = true;
    this.trackRigResources(this.boardRig.group);
    this.scene.add(this.boardRig.group);

    // Calendar
    const cal = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(0.4, 0.5)),
      this.trackMat(new THREE.MeshStandardMaterial({ map: tex.calendar, roughness: 0.85 })),
    );
    cal.position.set(-3.98, 1.8, -4.2);
    cal.rotation.y = Math.PI / 2;
    this.scene.add(cal);

    // Pendant lamp + warm soft halo
    this.box(0.02, 0.7, 0.02, mDark, 0, 2.75, 0);
    const shade = new THREE.Mesh(
      this.trackGeo(new THREE.ConeGeometry(0.35, 0.28, 20, 1, true)),
      this.trackMat(
        new THREE.MeshStandardMaterial({
          color: 0x3f6b4a,
          side: THREE.DoubleSide,
          roughness: 0.45,
          metalness: 0.35,
        }),
      ),
    );
    shade.position.set(0, 2.35, 0);
    shade.castShadow = true;
    this.scene.add(shade);

    const bulb = new THREE.Mesh(
      this.trackGeo(new THREE.SphereGeometry(0.07, 12, 12)),
      this.trackMat(new THREE.MeshBasicMaterial({ color: 0xfff0c0 })),
    );
    bulb.position.set(0, 2.3, 0);
    this.scene.add(bulb);

    const haloMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        map: lampHaloTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    const halo = new THREE.Mesh(this.trackGeo(new THREE.PlaneGeometry(1.15, 1.15)), haloMat);
    halo.position.set(0, 2.24, 0);
    halo.rotation.x = Math.PI / 2;
    this.scene.add(halo);

    this.lampLight = new THREE.PointLight(0xffd08a, 1.35, 13, 1.6);
    this.lampLight.position.set(0, 2.25, 0);
    this.scene.add(this.lampLight);

    this.hemiLight = new THREE.HemisphereLight(0xffe6b8, 0x4a3828, 0.62);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff0d0, 1.15);
    this.sunLight.position.set(-1.6, 2.4, -5);
    this.sunLight.target.position.set(0.6, 0, -1.5);
    this.scene.add(this.sunLight, this.sunLight.target);
    if (!this.isSoftwareGl) {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(1024, 1024);
      this.sunLight.shadow.camera.left = -5;
      this.sunLight.shadow.camera.right = 5;
      this.sunLight.shadow.camera.top = 5;
      this.sunLight.shadow.camera.bottom = -5;
      this.sunLight.shadow.bias = -0.0005;
      this.sunLight.shadow.normalBias = 0.02;
    }

    // Sunbeams
    const beamMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        map: tex.sunbeam,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      }),
    );
    _vecA.set(-1.5, 2.4, -5.3);
    _vecB.set(0.6, 0, -1.6);
    _vecDir.copy(_vecB).sub(_vecA);
    const beamGeo = this.trackGeo(new THREE.PlaneGeometry(1.5, _vecDir.length()));
    const beamQuat = new THREE.Quaternion().setFromUnitVectors(
      _upAxis,
      _vecDir.clone().normalize(),
    );
    [0, Math.PI / 2].forEach((rot) => {
      const m = new THREE.Mesh(beamGeo, beamMat);
      m.position.copy(_vecA).add(_vecB).multiplyScalar(0.5);
      m.quaternion.copy(beamQuat);
      m.rotateY(rot);
      this.scene.add(m);
    });

    // Floating dust
    const dustGeo = this.trackGeo(new THREE.BufferGeometry());
    const dustPos = new Float32Array(450);
    for (let i = 0; i < 450; i += 3) {
      dustPos[i] = Math.random() * 7 - 3.5;
      dustPos[i + 1] = Math.random() * 2.8;
      dustPos[i + 2] = Math.random() * 10 - 5;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    this.dustPoints = new THREE.Points(
      dustGeo,
      this.trackMat(
        new THREE.PointsMaterial({
          color: 0xfff0c8,
          size: 0.03,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
        }),
      ),
    );
    this.scene.add(this.dustPoints);

    // Build all 5 modular shelf units (cleanly rotated, zero negative-scale mirroring!)
    for (let catIdx = 0; catIdx < CATEGORIES.length; catIdx++) {
      this.createShelfUnit(catIdx, mWood, mDark);
    }

    // Clutter on right wall before expansion
    [
      [3.5, 0.35, 1.5, 0.9, 0.7, 1],
      [3.45, 0.25, 2.6, 0.8, 0.5, 0.8],
      [3.5, 0.45, 3.7, 0.9, 0.9, 0.9],
      [3.55, 0.3, 4.6, 0.7, 0.6, 0.7],
    ].forEach((a) => {
      this.box(a[3], a[4], a[5], mWood, a[0], a[1], a[2], this.clutterGroup);
    });
    const coverMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0xcfc8b0, roughness: 1 }),
    );
    this.box(1.15, 0.06, 3.8, coverMat, 3.5, 1, 3.1, this.clutterGroup);
    this.scene.add(this.clutterGroup);
    this.staticColliders.push(this.clutterCollider);

    // ---------- Door-Facing Counter & Seating Corner ----------
    this.box(2.2, 1.04, 0.9, mWood, 1.85, 0.52, -3.3);
    const counterTopMat = this.trackMat(
      new THREE.MeshStandardMaterial({ color: 0x6a4426, roughness: 0.42 }),
    );
    this.box(2.34, 0.08, 1.02, counterTopMat, 1.85, 1.06, -3.3);
    this.addContactShadow(this.scene, 2.55, 1.25, 1.85, -3.3);
    this.addStaticCollider(0.75, 2.95, -3.78, -2.82);

    this.registerRig = createCashRegisterModel();
    this.registerRig.group.position.set(1.85, 1.1, -3.22);
    this.registerRig.hitbox.userData.isRegister = true;
    this.trackRigResources(this.registerRig.group);
    this.scene.add(this.registerRig.group);

    // Interactive Vintage Shop Radio on counter left
    this.radioRig = createRadioModel();
    this.radioRig.group.position.set(0.92, 1.1, -3.52);
    this.radioRig.group.rotation.y = 0.28;
    this.radioRig.hitbox.userData.isRadio = true;
    this.trackRigResources(this.radioRig.group);
    this.scene.add(this.radioRig.group);

    // Richer counter clutter (screw jar, pencil cup, receipt spike) on right corner
    const counterClutter = createCounterClutterGroup();
    counterClutter.position.set(2.8, 1.1, -3.14);
    counterClutter.rotation.y = -0.22;
    this.trackRigResources(counterClutter);
    this.scene.add(counterClutter);

    this.ledgerRig = createLedgerBookModel();
    this.ledgerRig.group.position.set(1.26, 1.1, -3.12);
    this.ledgerRig.hitbox.userData.isLedger = true;
    this.trackRigResources(this.ledgerRig.group);
    this.scene.add(this.ledgerRig.group);

    this.teaRig = createTeaStationModel();
    this.teaRig.group.position.set(2.44, 1.1, -3.32);
    this.teaRig.hitbox.userData.isTea = true;
    this.trackRigResources(this.teaRig.group);
    this.scene.add(this.teaRig.group);

    this.chairRig = createChairModel();
    this.chairRig.group.position.set(1.85, 0, -4.48);
    this.chairRig.hitbox.userData.isChair = true;
    this.addContactShadow(this.chairRig.group, 0.72, 0.72);
    this.trackRigResources(this.chairRig.group);
    this.scene.add(this.chairRig.group);

    // 4 Separate 3D Service Workstations (initially unowned & invisible until unlocked + bought + placed)
    this.standRigs = {} as Record<StandId, WorkbenchRig>;
    for (const spec of STAND_CATALOG) {
      const plaqueTex = createSignTexture(spec.sign, this.maxAniso);
      this.textures.push(plaqueTex);
      const rig = createStandModel(spec.id, plaqueTex);
      rig.group.position.set(spec.defaultPos.x, 0, spec.defaultPos.z);
      rig.group.rotation.y = spec.defaultPos.rotY;
      rig.group.visible = false;
      rig.hitbox.userData.standId = spec.id;
      this.addContactShadow(rig.group, spec.halfW * 2.05, spec.halfD * 2.15);
      this.trackRigResources(rig.group);
      this.scene.add(rig.group);
      this.standRigs[spec.id] = rig;
    }

    // Translucent materials for 3D placement ghost preview
    this.ghostValidMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0x6ed478,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      }),
    );
    this.ghostInvalidMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xe86c5a,
        transparent: true,
        opacity: 0.46,
        depthWrite: false,
      }),
    );
    this.ghostFrontMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xfff3c4,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
    );

    // Welcome rug & barrel + Potted indoor plants
    this.rugMat = this.trackMat(
      new THREE.MeshStandardMaterial({
        map: createRugTexture(this.decor.rugTheme, this.maxAniso),
        roughness: 0.96,
      }),
    );
    const rug = new THREE.Mesh(this.trackGeo(new THREE.PlaneGeometry(1.7, 2.5)), this.rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.02, 2.4);
    rug.receiveShadow = true;
    this.scene.add(rug);

    const barrel = new THREE.Mesh(
      this.trackGeo(new THREE.CylinderGeometry(0.28, 0.22, 0.55, 16)),
      this.trackMat(new THREE.MeshStandardMaterial({ color: 0x3a6ea5, metalness: 0.3, roughness: 0.5 })),
    );
    barrel.position.set(-2.95, 0.28, 5.05);
    barrel.castShadow = true;
    barrel.receiveShadow = true;
    this.scene.add(barrel);
    this.addContactShadow(this.scene, 0.8, 0.8, -2.95, 5.05);
    this.addStaticCollider(-3.28, -2.62, 4.72, 5.38);

    const plant1 = createPottedPlantModel();
    plant1.position.set(-2.22, 0, 5.14);
    this.addContactShadow(plant1, 0.48, 0.48);
    this.trackRigResources(plant1);
    this.scene.add(plant1);

    const plant2 = createPottedPlantModel();
    plant2.position.set(1.08, 0, 5.14);
    this.addContactShadow(plant2, 0.48, 0.48);
    this.trackRigResources(plant2);
    this.scene.add(plant2);
    this.addStaticCollider(0.84, 1.32, 4.92, 5.36);

    // Apprentice Yusuf 3D model
    this.apprenticeRig = createApprenticeModel();
    this.apprenticeRig.group.position.set(2.6, 0, -4.15);
    this.apprenticeRig.hitbox.userData.isApprentice = true;
    this.addContactShadow(this.apprenticeRig.group, 0.72, 0.72);
    this.trackRigResources(this.apprenticeRig.group);
    this.scene.add(this.apprenticeRig.group);

    CATEGORIES.forEach((cat, idx) => this.applyCategoryLevel(idx, cat.initialLv > 0));
  }

  /**
   * Builds a modular shelf unit centered at local (0,0,0) facing +X.
   * Because orientation is always set via `rotation.y` (never `scale.x = -1`),
   * all signs and shelf price labels always read cleanly left-to-right!
   */
  private createShelfUnit(
    catIndex: number,
    mWood: THREE.Material,
    mDark: THREE.Material,
  ): void {
    const unitGroup = new THREE.Group();

    this.box(0.5, 2.5, 0.06, mDark, -0.02, 1.25, -1.05, unitGroup);
    this.box(0.5, 2.5, 0.06, mDark, -0.02, 1.25, 1.05, unitGroup);
    this.box(0.04, 2.5, 2.1, mDark, -0.4, 1.25, 0, unitGroup);

    const shelfHeights = [0.08, 0.88, 1.68, 2.48];
    for (const y of shelfHeights) {
      this.box(0.5, 0.05, 2.1, mWood, 0, y, 0, unitGroup);
    }

    const signTex = createSignTexture(CATEGORIES[catIndex].sign, this.maxAniso);
    this.textures.push(signTex);
    const signMesh = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(1.5, 0.38)),
      this.trackMat(new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.7 })),
    );
    signMesh.position.set(0.26, 2.78, 0);
    signMesh.rotation.y = Math.PI / 2;
    unitGroup.add(signMesh);

    // Subtle dust haze layer across shelf front that appears as cleanliness drops
    const dustMat = this.trackMat(
      new THREE.MeshBasicMaterial({
        color: 0xcfc4a8,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    const dustOverlay = new THREE.Mesh(
      this.trackGeo(new THREE.PlaneGeometry(1.96, 2.2)),
      dustMat,
    );
    dustOverlay.position.set(0.27, 1.28, 0);
    dustOverlay.rotation.y = Math.PI / 2;
    unitGroup.add(dustOverlay);
    this.shelfDustMats[catIndex] = dustMat;

    // Shelf interaction hitbox for cleaning / reserve restocking
    const shelfHit = new THREE.Mesh(
      this.trackGeo(new THREE.BoxGeometry(0.68, 2.6, 2.15)),
      this.trackMat(new THREE.MeshBasicMaterial({ visible: false })),
    );
    shelfHit.position.set(0, 1.3, 0);
    shelfHit.userData.shelfCat = catIndex;
    unitGroup.add(shelfHit);
    this.shelfHitboxes[catIndex] = shelfHit;

    const ys = [0.12, 0.92, 1.72];
    const hues = [0xc0392b, 0x2d7fb8, 0xe0b030, 0x3f9a5a, 0xe8e0c8, 0x8e44ad];

    for (let r = 0; r < 3; r++) {
      const labelText = `${CATEGORIES[catIndex].names[r]} · ${this.getSellPrice(catIndex, r + 1)} ₺`;
      const lblTex = createLabelTexture(labelText, this.maxAniso);
      this.textures.push(lblTex);
      const lblMesh = new THREE.Mesh(
        this.trackGeo(new THREE.PlaneGeometry(1.9, 0.11)),
        this.trackMat(new THREE.MeshBasicMaterial({ map: lblTex })),
      );
      lblMesh.position.set(0.26, shelfHeights[r], 0);
      lblMesh.rotation.y = Math.PI / 2;
      unitGroup.add(lblMesh);
      this.labels.push({ mesh: lblMesh, cat: catIndex, tier: r + 1 });

      for (let i = 0; i < 4; i++) {
        const itGroup = createProductModel(catIndex, r + 1, hues[(r * 4 + i) % hues.length]);
        const pz = -0.75 + i * 0.5;
        itGroup.position.set(-0.01, ys[r] + 0.05, pz);
        if (catIndex === 1) {
          itGroup.rotation.y = Math.PI / 2;
        }
        unitGroup.add(itGroup);

        const itemObj: ShelfItem = {
          group: itGroup,
          cat: catIndex,
          tier: r + 1,
          has: false,
          locked: true,
        };
        this.items.push(itemObj);

        itGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.userData.shelfItem = itemObj;
            this.pickMeshes.push(m);
            this.geometries.push(m.geometry);
            if (Array.isArray(m.material)) {
              m.material.forEach((mat) => this.materials.push(mat));
            } else {
              this.materials.push(m.material);
            }
          }
        });
      }
    }

    this.addContactShadow(unitGroup, 0.9, 2.35, -0.1, 0);
    this.scene.add(unitGroup);
    this.shelfUnits[catIndex] = unitGroup;
  }

  private placeShelfUnits(): void {
    for (let catIdx = 0; catIdx < CATEGORIES.length; catIdx++) {
      const unit = this.shelfUnits[catIdx];
      if (!unit) continue;
      const tr = this.shelfTransforms[catIdx] ?? {
        x: SHELF_SLOTS[catIdx]?.x ?? -3.55,
        z: SHELF_SLOTS[catIdx]?.z ?? -3.3,
        rotY: SHELF_SLOTS[catIdx]?.rotY ?? 0,
        placed: this.ownedShelves[catIdx],
      };
      unit.position.set(tr.x, 0, tr.z);
      unit.rotation.y = tr.rotY;
      const visible = (this.categoryLevels[catIdx] ?? 0) > 0 && this.ownedShelves[catIdx] && tr.placed;
      unit.visible = visible;
    }

    for (const spec of STAND_CATALOG) {
      const rig = this.standRigs?.[spec.id];
      if (!rig) continue;
      const tr = this.standTransforms[spec.id];
      const visible = Boolean(this.ownedStands[spec.id] && tr?.placed);
      rig.group.visible = visible;
      if (tr) {
        rig.group.position.set(tr.x, 0, tr.z);
        rig.group.rotation.y = tr.rotY;
      }
    }

    this.rebuildFurnitureColliders();
  }

  private getShelfFootprint(tr: PlacedTransform): OrientedColliderBox {
    return {
      x: tr.x,
      z: tr.z,
      rotY: tr.rotY,
      halfW: 0.36,
      halfD: 1.08,
      centerOffsetX: -0.08,
      centerOffsetZ: 0,
    };
  }

  private getStandFootprint(standId: StandId, tr: PlacedTransform): OrientedColliderBox {
    const spec = STAND_CATALOG.find((s) => s.id === standId)!;
    return {
      x: tr.x,
      z: tr.z,
      rotY: tr.rotY,
      halfW: spec.halfW,
      halfD: spec.halfD,
    };
  }

  private rebuildFurnitureColliders(): void {
    this.furnitureColliders = [];
    for (let catIdx = 0; catIdx < CATEGORIES.length; catIdx++) {
      if ((this.categoryLevels[catIdx] ?? 0) <= 0 || !this.ownedShelves[catIdx]) continue;
      const tr = this.shelfTransforms[catIdx];
      if (!tr || !tr.placed) continue;
      if (this.placementTarget?.kind === 'shelf' && this.placementTarget.catIndex === catIdx) {
        continue;
      }
      this.furnitureColliders.push(this.getShelfFootprint(tr));
    }

    for (const spec of STAND_CATALOG) {
      if (!this.ownedStands[spec.id]) continue;
      const tr = this.standTransforms[spec.id];
      if (!tr || !tr.placed) continue;
      if (this.placementTarget?.kind === 'stand' && this.placementTarget.standId === spec.id) {
        continue;
      }
      this.furnitureColliders.push(this.getStandFootprint(spec.id, tr));
    }
  }

  private syncShelfDustVisuals(): void {
    for (let i = 0; i < CATEGORIES.length; i++) {
      const mat = this.shelfDustMats[i];
      if (!mat) continue;
      const clean = this.shelfCleanliness[i] ?? 100;
      mat.opacity = clean < 88 ? ((100 - clean) / 100) * 0.42 : 0;
    }
  }

  private applyDecorVisuals(): void {
    const prevWall = this.wallMat.map;
    const nextWall = createWallTexture(this.decor.wallTheme, this.maxAniso);
    this.textures.push(nextWall);
    this.wallMat.map = nextWall;
    this.wallMat.needsUpdate = true;
    if (prevWall) prevWall.dispose();

    const prevRug = this.rugMat.map;
    const nextRug = createRugTexture(this.decor.rugTheme, this.maxAniso);
    this.textures.push(nextRug);
    this.rugMat.map = nextRug;
    this.rugMat.needsUpdate = true;
    if (prevRug) prevRug.dispose();

    const prevSign = this.signboardMat.map;
    const nextSign = createShopSignboardTexture(
      this.decor.shopName,
      this.decor.signTheme,
      this.maxAniso,
    );
    this.textures.push(nextSign);
    this.signboardMat.map = nextSign;
    this.signboardMat.needsUpdate = true;
    if (prevSign) prevSign.dispose();

    (Object.keys(this.posterMeshes) as PosterId[]).forEach((pid) => {
      const mesh = this.posterMeshes[pid];
      if (mesh) {
        mesh.visible = this.decor.posters.includes(pid);
      }
    });

    this.nazarGroup.visible = this.decor.nazarCharm;
  }

  private syncStreetStallVisuals(): void {
    this.streetStallRig.group.visible = this.streetStallUnlocked;
    const slot = this.streetStallRig.displaySlot;
    while (slot.children.length > 0) {
      slot.remove(slot.children[0]);
    }
    if (!this.streetStallUnlocked) return;

    const lv = Math.max(1, this.categoryLevels[this.streetStallCat] ?? 1);
    const hues = [0xc0392b, 0x2d7fb8, 0xe0b030];
    for (let i = 0; i < 3; i++) {
      const tier = Math.min(lv, i + 1);
      const model = createProductModel(this.streetStallCat, tier, hues[i]);
      model.position.set(-0.36 + i * 0.36, 0.02, 0);
      model.scale.setScalar(1.05);
      this.trackRigResources(model);
      slot.add(model);
    }
  }

  private syncDepotCrates(): void {
    const totalReserve = Object.values(this.reserveStock).reduce((a, b) => a + b, 0);
    const visibleCrates = Math.min(
      this.depotRig.crateMeshes.length,
      Math.ceil(totalReserve / 2),
    );
    this.depotRig.crateMeshes.forEach((mesh, idx) => {
      mesh.visible = idx < visibleCrates;
    });
  }

  private syncApprenticeVisuals(): void {
    this.apprenticeRig.group.visible = this.apprentice.hired;
  }

  private refreshAllShelfLabels(): void {
    for (const lbl of this.labels) {
      const mat = lbl.mesh.material as THREE.MeshBasicMaterial;
      const oldTex = mat.map;
      const text = `${CATEGORIES[lbl.cat].names[lbl.tier - 1]} · ${this.getSellPrice(lbl.cat, lbl.tier)} ₺`;
      const nextTex = createLabelTexture(text, this.maxAniso);
      this.textures.push(nextTex);
      mat.map = nextTex;
      mat.needsUpdate = true;
      if (oldTex) {
        oldTex.dispose();
      }
    }
  }

  private applyCategoryLevel(catIndex: number, fillStarter = false): void {
    const lv = this.categoryLevels[catIndex] ?? 0;
    const hasShelf = this.ownedShelves[catIndex] ?? false;
    const isPlaced = hasShelf && (this.shelfTransforms[catIndex]?.placed ?? false);
    const unit = this.shelfUnits[catIndex];
    if (unit) {
      unit.visible = lv > 0 && isPlaced;
    }
    for (const item of this.items) {
      if (item.cat !== catIndex) continue;
      item.locked = item.tier > lv;
      if (item.locked) {
        item.has = false;
      } else if (fillStarter && item.tier <= lv && hasShelf) {
        item.has = true;
      }
      item.group.visible = isPlaced && item.has;
    }
    for (const lbl of this.labels) {
      if (lbl.cat === catIndex) {
        lbl.mesh.visible = isPlaced && lbl.tier <= lv;
      }
    }
    this.placeShelfUnits();
  }

  // ---------- Controls & Pointer Lock ----------

  private isPlaying(): boolean {
    return this.started && this.modal === 'none';
  }

  private tryRequestPointerLock(): void {
    if (this.settings.lookPreference === 'drag' || !this.pointerLockSupported) {
      return;
    }
    const canvas = this.renderer.domElement;
    if (typeof canvas.requestPointerLock !== 'function') {
      this.pointerLockSupported = false;
      this.emitHud();
      return;
    }
    try {
      const maybePromise = canvas.requestPointerLock() as unknown as Promise<void> | undefined;
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => {
          this.pointerLockSupported = false;
          this.emitHud();
        });
      }
    } catch {
      this.pointerLockSupported = false;
      this.emitHud();
    }
  }

  private safeExitPointerLock(): void {
    if (document.pointerLockElement === this.renderer.domElement) {
      this.ignoreNextUnlockPause = true;
      try {
        document.exitPointerLock();
      } catch {
        this.ignoreNextUnlockPause = false;
      }
    }
  }

  private handlePointerLockChange(): void {
    const nowLocked = document.pointerLockElement === this.renderer.domElement;
    const wasLocked = this.pointerLocked;
    this.pointerLocked = nowLocked;

    if (nowLocked) {
      this.ignoreNextUnlockPause = false;
      this.started = true;
      this.cursorNdc.set(0, 0);
      this.emitHud();
      return;
    }

    if (wasLocked && !nowLocked) {
      if (this.ignoreNextUnlockPause) {
        this.ignoreNextUnlockPause = false;
        this.emitHud();
        return;
      }
      if (this.started && this.modal === 'none' && this.settings.lookPreference === 'auto') {
        this.modal = 'pause';
        this.clearKeys();
        this.save();
      }
    }
    this.emitHud();
  }

  private handlePointerLockError(): void {
    this.pointerLockSupported = false;
    this.pointerLocked = false;
    this.emitHud();
  }

  private clearKeys(): void {
    for (const k of Object.keys(this.keys)) {
      this.keys[k] = false;
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Allow typing inside modal inputs (e.g., Shop Signboard Name) cleanly
    const activeTag = document.activeElement?.tagName;
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
      if (e.code === 'Escape') {
        this.closeModal();
      }
      return;
    }

    this.keys[e.code] = true;
    const lower = e.key.toLowerCase();

    if (e.code === 'Escape') {
      if (!this.started) return;
      if (this.placementTarget !== null) {
        this.cancelOrStowPlacement();
        return;
      }
      if (
        this.modal === 'tree' ||
        this.modal === 'wholesale' ||
        this.modal === 'ledger' ||
        this.modal === 'shop' ||
        this.modal === 'service' ||
        this.modal === 'board'
      ) {
        this.closeModal();
      } else if (this.modal === 'pause') {
        this.resumeGame();
      } else if (this.modal === 'none') {
        this.openPause();
      }
      return;
    }

    if (!this.started) {
      if (e.key === 'Enter') {
        this.startGame();
      }
      return;
    }

    if (e.code === 'KeyF' || lower === 'f') {
      if (this.modal === 'pause' || this.modal === 'checkout' || this.modal === 'daySummary' || this.modal === 'service') return;
      e.preventDefault();
      if (this.placementTarget) this.cancelOrStowPlacement();
      this.toggleSkillTree();
      return;
    }

    if (e.code === 'KeyB' || lower === 'b') {
      if (this.modal === 'pause' || this.modal === 'checkout' || this.modal === 'daySummary' || this.modal === 'service') return;
      e.preventDefault();
      if (this.placementTarget) this.cancelOrStowPlacement();
      this.toggleWholesale();
      return;
    }

    if (e.code === 'KeyL' || lower === 'l') {
      if (this.modal === 'pause' || this.modal === 'checkout' || this.modal === 'daySummary' || this.modal === 'service') return;
      e.preventDefault();
      if (this.placementTarget) this.cancelOrStowPlacement();
      this.toggleLedger();
      return;
    }

    if (e.code === 'KeyG' || lower === 'g') {
      if (this.modal === 'pause' || this.modal === 'checkout' || this.modal === 'daySummary' || this.modal === 'service') return;
      e.preventDefault();
      if (this.placementTarget) this.cancelOrStowPlacement();
      this.toggleShopDesigner();
      return;
    }

    if (e.code === 'KeyN' || lower === 'n') {
      if (this.modal === 'pause' || this.modal === 'checkout' || this.modal === 'daySummary' || this.modal === 'service') return;
      e.preventDefault();
      if (this.placementTarget) this.cancelOrStowPlacement();
      this.toggleBulletinBoard();
      return;
    }

    if (e.code === 'KeyH' || lower === 'h') {
      if (this.modal === 'pause' || this.modal === 'checkout' || this.modal === 'daySummary') return;
      e.preventDefault();
      if (this.placementTarget) this.cancelOrStowPlacement();
      if (this.modal === 'service') {
        this.closeModal();
      } else {
        this.openServiceWorkbench();
      }
      return;
    }

    if (!this.isPlaying()) return;

    if (this.placementTarget !== null) {
      if (e.code === 'KeyR' || lower === 'r') {
        this.rotatePlacement(Math.PI / 4);
      } else if (e.code === 'KeyQ' || lower === 'q') {
        this.cancelOrStowPlacement();
      } else if (e.code === 'KeyE' || lower === 'e') {
        this.confirmPlacement();
      } else if (e.code === 'KeyV' || lower === 'v') {
        this.toggleLookPreference();
      }
      return;
    }

    if (e.code === 'KeyQ' || lower === 'q') {
      this.putBack();
    } else if (e.code === 'KeyE' || lower === 'e') {
      this.performAction(this.getActiveNdc());
    } else if (e.code === 'KeyR' || lower === 'r') {
      this.cleanHoveredOrNearestShelf();
    } else if (e.code === 'KeyT' || lower === 't') {
      this.pickupHoveredFurniture();
    } else if (e.code === 'KeyC' || lower === 'c') {
      this.serveOrBrewTea();
    } else if (e.code === 'KeyV' || lower === 'v') {
      this.toggleLookPreference();
    } else if (e.code === 'KeyK' || lower === 'k') {
      if (this.canEndDay()) {
        this.endDay();
      }
    } else if (e.code === 'KeyM' || lower === 'm') {
      this.cycleRadioStation();
    } else if (e.code === 'Space' && this.isSeated) {
      e.preventDefault();
      this.standUp();
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keys[e.code] = false;
  }

  private handleCanvasWheel(e: WheelEvent): void {
    if (!this.isPlaying() || this.placementTarget === null) return;
    e.preventDefault();
    this.rotatePlacement(e.deltaY > 0 ? Math.PI / 4 : -Math.PI / 4);
  }

  private handleCanvasMouseDown(e: MouseEvent): void {
    this.sound.unlock();
    if (!this.isPlaying()) return;

    if (this.placementTarget !== null && e.button === 2) {
      this.cancelOrStowPlacement();
      return;
    }

    if (this.pointerLocked) {
      if (e.button === 0) {
        this.performAction(_ndc.set(0, 0));
      }
      return;
    }

    this.isDraggingLook = true;
    this.dragMoved = false;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.updateCursorNdc(e);
  }

  private handleWindowMouseMove(e: MouseEvent): void {
    if (!this.isPlaying()) return;

    if (this.pointerLocked) {
      this.player.yaw -= e.movementX * 0.0022 * this.settings.sensitivity;
      this.player.pitch = THREE.MathUtils.clamp(
        this.player.pitch - e.movementY * 0.0022 * this.settings.sensitivity,
        -1.3,
        1.3,
      );
      return;
    }

    this.updateCursorNdc(e);

    if (this.isDraggingLook) {
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      if (Math.hypot(e.clientX - this.dragStartX, e.clientY - this.dragStartY) > 5) {
        this.dragMoved = true;
      }

      if (this.dragMoved) {
        this.player.yaw -= dx * 0.0038 * this.settings.sensitivity;
        this.player.pitch = THREE.MathUtils.clamp(
          this.player.pitch - dy * 0.0038 * this.settings.sensitivity,
          -1.3,
          1.3,
        );
      }
    }
  }

  private handleWindowMouseUp(e: MouseEvent): void {
    if (!this.isPlaying()) {
      this.isDraggingLook = false;
      return;
    }
    if (!this.pointerLocked && this.isDraggingLook) {
      const wasClick = !this.dragMoved && e.button === 0;
      this.isDraggingLook = false;
      this.dragMoved = false;
      if (wasClick) {
        this.updateCursorNdc(e);
        const acted = this.performAction(this.cursorNdc);
        if (!acted && this.settings.lookPreference === 'auto' && this.pointerLockSupported) {
          this.tryRequestPointerLock();
        }
      }
    }
  }

  private updateCursorNdc(e: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    this.cursorNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.cursorNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.hasCursorPos = true;
  }

  private getActiveNdc(): THREE.Vector2 {
    if (this.pointerLocked || !this.hasCursorPos) {
      return _ndc.set(0, 0);
    }
    return this.cursorNdc;
  }

  // ---------- Public UI Controls ----------

  public startGame(): void {
    this.sound.unlock();
    this.started = true;
    this.modal = 'none';
    this.tryRequestPointerLock();
    this.emitHud();
  }

  public resumeGame(): void {
    this.sound.unlock();
    this.modal = 'none';
    this.tryRequestPointerLock();
    this.emitHud();
  }

  public openPause(): void {
    if (!this.started) return;
    this.modal = 'pause';
    this.clearKeys();
    this.safeExitPointerLock();
    this.save();
    this.emitHud();
  }

  public toggleSkillTree(): void {
    if (!this.started) return;
    if (this.modal === 'tree') {
      this.closeModal();
    } else {
      this.modal = 'tree';
      this.clearKeys();
      this.safeExitPointerLock();
      this.emitHud();
    }
  }

  public toggleWholesale(): void {
    if (!this.started) return;
    if (this.modal === 'wholesale') {
      this.closeModal();
    } else {
      this.modal = 'wholesale';
      this.clearKeys();
      this.safeExitPointerLock();
      this.emitHud();
    }
  }

  public toggleLedger(): void {
    if (!this.started) return;
    if (this.modal === 'ledger') {
      this.closeModal();
    } else {
      this.modal = 'ledger';
      this.clearKeys();
      this.safeExitPointerLock();
      this.emitHud();
    }
  }

  public toggleShopDesigner(): void {
    if (!this.started) return;
    if (this.modal === 'shop') {
      this.closeModal();
    } else {
      this.modal = 'shop';
      this.clearKeys();
      this.safeExitPointerLock();
      this.emitHud();
    }
  }

  public toggleBulletinBoard(): void {
    if (!this.started) return;
    if (this.modal === 'board') {
      this.closeModal();
    } else {
      this.ensureDailyContracts();
      this.modal = 'board';
      this.clearKeys();
      this.safeExitPointerLock();
      this.sound.pick();
      this.emitHud();
    }
  }

  public acceptContract(contractId: number): void {
    const c = this.contracts.find((item) => item.id === contractId);
    if (!c || c.status !== 'available') return;
    c.status = 'accepted';
    this.sound.pick();
    this.floatMsg(`İhale kabul edildi: ${c.title}`, 'ok');
    this.save();
    this.emitHud();
  }

  public deliverContract(contractId: number): void {
    const c = this.contracts.find((item) => item.id === contractId);
    if (!c || (c.status !== 'accepted' && c.status !== 'available')) return;

    // Verify total available stock (Depot reserve + Shelves) for every line
    for (const line of c.lines) {
      const key = ITEM_KEY(line.cat, line.tier);
      const reserveQty = this.reserveStock[key] ?? 0;
      const shelfQty = this.items.filter(
        (it) => it.cat === line.cat && it.tier === line.tier && !it.locked && it.has,
      ).length;
      if (reserveQty + shelfQty < line.qty) {
        this.sound.nope();
        this.floatMsg('Teslimat için depo veya rafta yeterli stok yok', 'bad');
        return;
      }
    }

    // Consume from depot reserve first, then from shelf displays
    for (const line of c.lines) {
      let need = line.qty;
      const key = ITEM_KEY(line.cat, line.tier);
      const reserveQty = this.reserveStock[key] ?? 0;
      const fromReserve = Math.min(need, reserveQty);
      if (fromReserve > 0) {
        this.reserveStock[key] = reserveQty - fromReserve;
        need -= fromReserve;
      }
      if (need > 0) {
        for (const it of this.items) {
          if (need <= 0) break;
          if (it.cat === line.cat && it.tier === line.tier && !it.locked && it.has) {
            it.has = false;
            it.group.visible = false;
            need--;
          }
        }
      }
    }
    this.syncDepotCrates();

    c.status = 'completed';
    this.contractsDone += 1;
    this.dayContractsCompleted += 1;
    this.money += c.rewardMoney;
    this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
    this.dayRevenue += c.rewardMoney;
    this.points += c.rewardPoints;
    this.reputation = THREE.MathUtils.clamp(this.reputation + c.rewardRep, 0, 100);
    this.sound.drawerOpen();
    this.sound.coin();
    this.floatMsg(
      `+${c.rewardMoney} ₺ · +${c.rewardPoints} Puan · İhale Teslim Edildi!`,
      'gold',
    );
    this.ensureDailyContracts();
    this.save();
    this.emitHud();
  }

  public claimMilestone(goalId: MilestoneGoalId): void {
    const goal = this.getMilestones().find((m) => m.id === goalId);
    if (!goal || !goal.completed || goal.claimed) return;
    this.claimedMilestones.push(goalId);
    if (goal.rewardMoney > 0) {
      this.money += goal.rewardMoney;
      this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
    }
    if (goal.rewardPoints > 0) {
      this.points += goal.rewardPoints;
    }
    if (goal.rewardRep > 0) {
      this.reputation = THREE.MathUtils.clamp(this.reputation + goal.rewardRep, 0, 100);
    }
    this.sound.levelUp();
    this.sound.coin();
    this.floatMsg(`Başarım Ödülü: ${goal.title} (${goal.rewardText})`, 'gold');
    this.save();
    this.emitHud();
  }

  private getMilestones(): MilestoneGoalInfo[] {
    return MILESTONE_CATALOG.map((spec) => {
      let progress = 0;
      switch (spec.id) {
        case 'first_5_sales':
          progress = this.served;
          break;
        case 'craftsman_5':
          progress = this.servicesDone;
          break;
        case 'shop_expanded':
          progress = this.expanded ? 1 : 0;
          break;
        case 'apprentice_lv2':
          progress = this.apprentice.hired ? this.apprentice.level : 0;
          break;
        case 'clean_streak_3':
          progress = this.cleanStreak;
          break;
        case 'contracts_2':
          progress = this.contractsDone;
          break;
        case 'gold_reserve_1000':
          progress = Math.max(0, this.money);
          break;
        case 'pillar_of_hood':
          progress = this.streetStallUnlocked ? this.reputation : Math.min(79, this.reputation);
          break;
      }
      const claimed = this.claimedMilestones.includes(spec.id);
      const completed = claimed || progress >= spec.target;
      return {
        ...spec,
        progress: Math.min(spec.target, progress),
        completed,
        claimed,
      };
    });
  }

  private ensureDailyContracts(): void {
    const active = this.contracts.filter(
      (c) => c.status === 'available' || c.status === 'accepted',
    );
    let safety = 0;
    while (active.length < 2 && safety < 4) {
      safety++;
      const next = generateBulkContract(
        this.contractSeq++,
        this.day,
        this.categoryLevels,
      );
      if (!next) break;
      this.contracts.push(next);
      active.push(next);
    }
    // Trim old completed/expired records beyond latest 8
    if (this.contracts.length > 10) {
      const open = this.contracts.filter(
        (c) => c.status === 'available' || c.status === 'accepted',
      );
      const closed = this.contracts
        .filter((c) => c.status === 'completed' || c.status === 'expired')
        .slice(-4);
      this.contracts = [...open, ...closed];
    }
  }

  public closeModal(fromClick = false): void {
    this.modal = 'none';
    this.activeService = null;
    if (fromClick) {
      this.tryRequestPointerLock();
    }
    this.emitHud();
  }

  public openServiceWorkbench(practiceType?: ServiceType): void {
    if (!this.started) return;
    if (this.placementTarget !== null) {
      this.cancelOrStowPlacement(true);
    }

    const placedStands = STAND_CATALOG.filter(
      (s) => this.ownedStands[s.id] && this.standTransforms[s.id]?.placed,
    );
    if (placedStands.length === 0) {
      this.sound.nope();
      this.floatMsg(
        'Henüz kurulu hizmet standı yok! Yetenek (F) açıp Dükkân (G)\'den boş stant al.',
        'bad',
      );
      return;
    }

    const waitingServiceCust = this.customers.find((c) => {
      if (c.state !== 'wait' || !c.serviceType || !c.serviceOrder) return false;
      const sid = getStandForService(c.serviceType);
      return Boolean(this.ownedStands[sid] && this.standTransforms[sid]?.placed);
    });
    if (waitingServiceCust && waitingServiceCust.serviceOrder) {
      this.openServiceForCustomer(waitingServiceCust);
      return;
    }

    let chosenType = practiceType;
    if (chosenType) {
      const sid = getStandForService(chosenType);
      if (!this.ownedStands[sid] || !this.standTransforms[sid]?.placed) {
        chosenType = undefined;
      }
    }
    if (!chosenType) {
      const preferredStand =
        this.hoveredStandId &&
        this.ownedStands[this.hoveredStandId] &&
        this.standTransforms[this.hoveredStandId]?.placed
          ? STAND_CATALOG.find((s) => s.id === this.hoveredStandId)
          : placedStands[0];
      chosenType = preferredStand?.services[0] ?? placedStands[0].services[0];
    }

    this.activeService = this.buildServiceOrder(chosenType, null);
    this.modal = 'service';
    this.clearKeys();
    this.safeExitPointerLock();
    this.sound.pick();
    this.emitHud();
  }

  public openServiceStand(standId: StandId): void {
    if (!this.started) return;
    const spec = STAND_CATALOG.find((s) => s.id === standId);
    if (!spec) return;
    if (!this.ownedStands[standId] || !this.standTransforms[standId]?.placed) {
      this.sound.nope();
      this.floatMsg(`${spec.name} dükkânda kurulu değil`, 'bad');
      return;
    }

    const matchingCust = this.customers
      .filter(
        (c) =>
          c.state !== 'out' &&
          Boolean(c.serviceType) &&
          Boolean(c.serviceOrder) &&
          getStandForService(c.serviceType!) === standId,
      )
      .sort((a, b) => a.queueIndex - b.queueIndex)[0];

    if (matchingCust && matchingCust.serviceOrder) {
      this.openServiceForCustomer(matchingCust);
      return;
    }

    this.activeService = this.buildServiceOrder(spec.services[0], null);
    this.modal = 'service';
    this.clearKeys();
    this.safeExitPointerLock();
    this.sound.pick();
    this.emitHud();
  }

  private openServiceForCustomer(cust: ActiveCustomer): void {
    if (!cust.serviceOrder) return;
    const fastLv = this.characterSkills.fastCraft ?? 0;
    this.activeService = {
      ...cust.serviceOrder,
      fastCraftLevel: fastLv,
      craftBonusRate: fastLv * 0.15,
    };
    this.modal = 'service';
    this.clearKeys();
    this.safeExitPointerLock();
    this.sound.pick();
    this.emitHud();
  }

  public switchPracticeService(type: ServiceType): void {
    if (!this.activeService || this.activeService.mode !== 'practice') return;
    const sid = getStandForService(type);
    if (!this.ownedStands[sid] || !this.standTransforms[sid]?.placed) {
      this.sound.nope();
      this.floatMsg('Bu hizmet için ilgili stant dükkânda kurulu olmalı', 'bad');
      return;
    }
    this.activeService = this.buildServiceOrder(type, null);
    this.sound.pick();
    this.emitHud();
  }

  public completeServiceOrder(success: boolean, bonusMul = 1): void {
    if (!this.activeService) return;
    const order = this.activeService;
    const cust =
      order.customerId !== null
        ? this.customers.find((c) => c.id === order.customerId)
        : undefined;

    if (order.mode === 'practice') {
      if (success) {
        const fee = Math.round(order.rewardMoney * 0.35);
        this.money += fee;
        this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
        this.dayRevenue += fee;
        this.servicesDone += 1;
        this.sound.coin();
        this.floatMsg(`+${fee} ₺ · Tezgâh işçilik kazancı`, 'ok');
      } else {
        this.sound.nope();
      }
      this.activeService = null;
      this.modal = 'none';
      this.tryRequestPointerLock();
      this.save();
      this.emitHud();
      return;
    }

    if (success) {
      const fastBonus = 1 + (this.characterSkills.fastCraft ?? 0) * 0.15;
      const earned = Math.round(order.rewardMoney * bonusMul * fastBonus);
      this.money += earned;
      this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
      this.dayRevenue += earned;
      this.dayCustomersServed += 1;
      this.served += 1;
      this.servicesDone += 1;
      this.reputation = THREE.MathUtils.clamp(this.reputation + order.repBonus, 0, 100);
      const sat = cust
        ? Math.max(68, Math.min(100, Math.round((cust.patience / cust.maxPatience) * 100 + 30)))
        : 95;
      this.daySatisfactionList.push(sat);
      this.sound.drawerOpen();
      this.sound.coin();
      this.floatMsg(`+${earned} ₺ · ${order.title}`, 'gold');
      this.addPointProgress();
      this.setBubble('Eline sağlık usta, tam ustalık işi olmuş!', undefined, 2.5);
    } else {
      this.dayCustomersLost += 1;
      this.daySatisfactionList.push(28);
      this.reputation = THREE.MathUtils.clamp(this.reputation - 2, 0, 100);
      this.sound.nope();
      this.floatMsg(`${order.customerName} hizmetten memnun kalmadı`, 'bad');
      this.setBubble('Olmadı usta, ben başka yere bakayım.', undefined, 2.5);
    }

    if (cust) {
      if (success) {
        cust.hasBag = true;
        cust.rig.bagGroup.visible = true;
      }
      cust.state = 'out';
      cust.path = [
        [0.35, 1.5],
        [0, 4.7],
        [0, 8.2],
      ];
      this.promoteQueue();
    }

    this.activeService = null;
    this.modal = 'none';
    this.tryRequestPointerLock();
    this.save();
    this.emitHud();
  }

  private buildServiceOrder(type: ServiceType, customer: ActiveCustomer | null): ServiceOrder {
    const meta = SERVICE_META[type];
    const fastLv = this.characterSkills.fastCraft ?? 0;
    const isCust = Boolean(customer);
    const pMeta = customer ? PERSONALITY_META[customer.personality] : null;

    const base: ServiceOrder = {
      mode: isCust ? 'customer' : 'practice',
      customerId: customer ? customer.id : null,
      customerName: customer ? customer.personName : 'Usta Tezgâhı (Pratik)',
      personalityLabel: pMeta ? pMeta.label : 'Serbest Atölye',
      serviceType: type,
      title: meta.title,
      promptText: meta.desc,
      rewardMoney: meta.baseReward,
      repBonus: meta.repBonus,
      craftBonusRate: fastLv * 0.15,
      fastCraftLevel: fastLv,
    };

    if (type === 'key_cut') {
      base.keyTargetPins = Array.from({ length: 5 }, () => 1 + Math.floor(Math.random() * 5));
      base.promptText = isCust
        ? 'Evimin anahtarının yedeğini çıkartacaktım usta, dişleri birebir tutturabilir misin?'
        : '5 pimi hedef diş profiline getirip anahtarı kes.';
    } else if (type === 'paint_mix') {
      const target = PAINT_TARGETS[Math.floor(Math.random() * PAINT_TARGETS.length)];
      base.paintTargetName = target.name;
      base.paintTargetRgb = [...target.rgb];
      base.promptText = isCust
        ? `Oda duvarı için "${target.name}" tonunu tutturabilir miyiz usta?`
        : `Hedef renk "${target.name}" için Kırmızı, Yeşil, Mavi ve Beyaz dengesini ayarla.`;
    } else if (type === 'scale_weigh') {
      const grams = [150, 220, 300, 350, 420][Math.floor(Math.random() * 5)];
      const item = ['3.5×35 Sunta Vidası', '6 cm Çelik Çivi', 'İnce Sıva Çivisi'][
        Math.floor(Math.random() * 3)
      ];
      base.scaleItemName = item;
      base.scaleTargetGrams = grams;
      base.promptText = isCust
        ? `Bana tam ${grams} gram ${item} tartar mısın usta?`
        : `Kefe kepçeleriyle tam ${grams} g ${item} tart.`;
    } else if (type === 'cut_measure') {
      const mat = CUT_MATERIALS[Math.floor(Math.random() * CUT_MATERIALS.length)];
      const cm = mat.targets[Math.floor(Math.random() * mat.targets.length)];
      base.cutMaterialName = mat.name;
      base.cutTargetCm = cm;
      base.promptText = isCust
        ? `Şu ${mat.name} malzemeyi tam ${cm} cm ölçüsünde keser misin usta?`
        : `Testere imleci ${cm} cm işaretine geldiğinde kesimi yap.`;
    } else {
      const scenario = REPAIR_SCENARIOS[Math.floor(Math.random() * REPAIR_SCENARIOS.length)];
      base.repairScenarioId = scenario.id;
      base.promptText = scenario.problem;
    }

    return base;
  }

  public toggleLookPreference(): void {
    const next: LookPreference = this.settings.lookPreference === 'auto' ? 'drag' : 'auto';
    this.setLookPreference(next);
  }

  public setLookPreference(pref: LookPreference): void {
    this.settings.lookPreference = pref;
    if (pref === 'drag') {
      this.safeExitPointerLock();
    } else if (this.isPlaying()) {
      this.tryRequestPointerLock();
    }
    this.callbacks.onSettingsChange({ ...this.settings });
    this.save();
    this.emitHud();
  }

  public setSensitivity(val: number): void {
    this.settings.sensitivity = THREE.MathUtils.clamp(val, 0.4, 2);
    this.callbacks.onSettingsChange({ ...this.settings });
    this.save();
  }

  public setVolume(val: number): void {
    this.settings.volume = THREE.MathUtils.clamp(val, 0, 1);
    this.sound.setVolume(this.settings.volume);
    this.callbacks.onSettingsChange({ ...this.settings });
    this.save();
  }

  public manualSave(): void {
    this.save();
    this.floatMsg('Kaydedildi', 'ok');
  }

  public resetGame(): void {
    this.noSaveOnUnload = true;
    try {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(SAVE_KEY_V5);
      localStorage.removeItem(SAVE_KEY_V4);
      localStorage.removeItem(SAVE_KEY_V3);
      localStorage.removeItem(SAVE_KEY_V2);
      localStorage.removeItem(LEGACY_SAVE_KEY);
    } catch {
      // Ignore
    }
    window.location.reload();
  }

  // ---------- Faz 3 & İyileştirme Faz 1 Public Management API ----------

  public buyShelfUnit(catIndex: number): boolean {
    const cat = CATEGORIES[catIndex];
    if (!cat) return false;
    if ((this.categoryLevels[catIndex] ?? 0) <= 0) {
      this.sound.nope();
      this.floatMsg('Önce Yetenek Ağacı (F) üzerinden ürün iznini açmalısın', 'bad');
      return false;
    }
    if (this.ownedShelves[catIndex]) return false;
    if (cat.requiresExpansion && !this.expanded) {
      this.sound.nope();
      this.floatMsg('Bu raf için önce dükkân genişlemesini açmalısın', 'bad');
      return false;
    }
    if (this.money < cat.shelfCost) {
      this.sound.nope();
      this.floatMsg(`Raf kurulumu için ${cat.shelfCost} ₺ nakit gerekli`, 'bad');
      return false;
    }

    this.money -= cat.shelfCost;
    this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
    this.ownedShelves[catIndex] = true;
    const prev = this.shelfTransforms[catIndex] ?? createDefaultShelfTransforms()[catIndex];
    this.shelfTransforms[catIndex] = { ...prev, placed: false };
    this.applyCategoryLevel(catIndex, false);
    this.sound.restock();
    this.floatMsg(
      `−${cat.shelfCost} ₺ · ${cat.name} boş rafı alındı! Dükkânda dilediğin yere yerleştir.`,
      'gold',
    );
    this.save();
    this.startShelfPlacement(catIndex, false);
    return true;
  }

  public buyStandUnit(standId: StandId): boolean {
    const spec = STAND_CATALOG.find((s) => s.id === standId);
    if (!spec) return false;
    if (!this.unlockedStands[standId]) {
      this.sound.nope();
      this.floatMsg('Önce Yetenek Ağacından (F) bu istasyon iznini açmalısın', 'bad');
      return false;
    }
    if (this.ownedStands[standId]) return false;
    if (this.money < spec.standCost) {
      this.sound.nope();
      this.floatMsg(`${spec.name} için ${spec.standCost} ₺ nakit gerekli`, 'bad');
      return false;
    }

    this.money -= spec.standCost;
    this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
    this.ownedStands[standId] = true;
    this.standTransforms[standId] = { ...spec.defaultPos, placed: false };
    this.placeShelfUnits();
    this.sound.restock();
    this.floatMsg(
      `−${spec.standCost} ₺ · ${spec.name} alındı! Dükkânda istediğin yere kur.`,
      'gold',
    );
    this.save();
    this.startStandPlacement(standId, false);
    return true;
  }

  public startShelfPlacement(catIndex: number, keepPrev = true): void {
    const cat = CATEGORIES[catIndex];
    if (!cat || !this.ownedShelves[catIndex] || (this.categoryLevels[catIndex] ?? 0) <= 0) {
      return;
    }
    if (this.placementTarget !== null) {
      this.cancelOrStowPlacement(true);
    }
    const current = this.shelfTransforms[catIndex] ?? createDefaultShelfTransforms()[catIndex];
    const prev = keepPrev && current.placed ? { ...current } : null;
    this.shelfTransforms[catIndex] = { ...current, placed: false };
    this.applyCategoryLevel(catIndex, false);

    this.placementTarget = { kind: 'shelf', catIndex, prev };
    this.placementRotY = prev ? prev.rotY : 0;
    this.modal = 'none';
    this.clearKeys();
    this.buildPlacementGhost();
    this.updatePlacementGhost();
    this.tryRequestPointerLock();
    this.sound.pick();
    this.emitHud();
  }

  public startStandPlacement(standId: StandId, keepPrev = true): void {
    const spec = STAND_CATALOG.find((s) => s.id === standId);
    if (!spec || !this.ownedStands[standId]) return;
    if (this.placementTarget !== null) {
      this.cancelOrStowPlacement(true);
    }
    const current = this.standTransforms[standId] ?? { ...spec.defaultPos, placed: false };
    const prev = keepPrev && current.placed ? { ...current } : null;
    this.standTransforms[standId] = { ...current, placed: false };
    this.placeShelfUnits();

    this.placementTarget = { kind: 'stand', standId, prev };
    this.placementRotY = prev ? prev.rotY : 0;
    this.modal = 'none';
    this.clearKeys();
    this.buildPlacementGhost();
    this.updatePlacementGhost();
    this.tryRequestPointerLock();
    this.sound.pick();
    this.emitHud();
  }

  public pickupHoveredFurniture(): void {
    if (!this.isPlaying() || this.placementTarget !== null) return;
    if (this.carryingItems.length > 0 || this.carryingReserveKey) {
      this.sound.nope();
      this.floatMsg('Eşya taşımak için önce elindekini bırak (Q)', 'bad');
      return;
    }
    if (this.hoveredStandId && this.ownedStands[this.hoveredStandId]) {
      this.startStandPlacement(this.hoveredStandId, true);
      return;
    }
    if (this.hoveredShelfCat !== null && this.ownedShelves[this.hoveredShelfCat]) {
      this.startShelfPlacement(this.hoveredShelfCat, true);
    }
  }

  private rotatePlacement(deltaRad: number): void {
    if (!this.placementTarget) return;
    this.placementRotY += deltaRad;
    this.sound.pick();
    this.updatePlacementGhost();
    this.emitHud();
  }

  private confirmPlacement(): boolean {
    if (!this.placementTarget) return false;
    this.updatePlacementGhost();
    if (!this.placementValid) {
      this.sound.nope();
      this.floatMsg(this.placementReason ?? 'Bu konuma yerleştirilemez', 'bad');
      return false;
    }

    const target = this.placementTarget;
    this.disposeGhost();
    this.placementTarget = null;

    if (target.kind === 'shelf') {
      this.shelfTransforms[target.catIndex] = {
        x: this.placementX,
        z: this.placementZ,
        rotY: this.placementRotY,
        placed: true,
      };
      this.applyCategoryLevel(target.catIndex, false);
      this.floatMsg(`${CATEGORIES[target.catIndex].name} rafı kuruldu!`, 'ok');
    } else {
      this.standTransforms[target.standId] = {
        x: this.placementX,
        z: this.placementZ,
        rotY: this.placementRotY,
        placed: true,
      };
      this.placeShelfUnits();
      const spec = STAND_CATALOG.find((s) => s.id === target.standId);
      this.floatMsg(`${spec?.name ?? 'Stant'} kuruldu!`, 'ok');
    }

    this.sound.restock();
    this.save();
    this.emitHud();
    return true;
  }

  public cancelOrStowPlacement(silent = false): void {
    if (!this.placementTarget) return;
    const target = this.placementTarget;
    this.disposeGhost();
    this.placementTarget = null;

    if (target.kind === 'shelf') {
      if (target.prev) {
        this.shelfTransforms[target.catIndex] = { ...target.prev, placed: true };
      } else {
        this.shelfTransforms[target.catIndex] = {
          ...(this.shelfTransforms[target.catIndex] ?? createDefaultShelfTransforms()[target.catIndex]),
          placed: false,
        };
      }
      this.applyCategoryLevel(target.catIndex, false);
      if (!silent) {
        this.floatMsg(
          target.prev
            ? 'Taşıma iptal edildi'
            : 'Raf mağaza deposunda beklemeye alındı (G\'den kurabilirsin)',
          'ok',
        );
      }
    } else {
      if (target.prev) {
        this.standTransforms[target.standId] = { ...target.prev, placed: true };
      } else {
        this.standTransforms[target.standId] = {
          ...(this.standTransforms[target.standId] ?? createDefaultStandTransforms()[target.standId]),
          placed: false,
        };
      }
      this.placeShelfUnits();
      if (!silent) {
        this.floatMsg(
          target.prev
            ? 'Taşıma iptal edildi'
            : 'Stant mağaza deposunda beklemeye alındı (G\'den kurabilirsin)',
          'ok',
        );
      }
    }

    this.save();
    this.emitHud();
  }

  private disposeGhost(): void {
    if (!this.ghostGroup) return;
    this.scene.remove(this.ghostGroup);
    this.ghostGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).geometry.dispose();
      }
    });
    this.ghostGroup = null;
  }

  private buildPlacementGhost(): void {
    this.disposeGhost();
    if (!this.placementTarget) return;
    const g = new THREE.Group();

    if (this.placementTarget.kind === 'shelf') {
      const bodyGeo = new THREE.BoxGeometry(0.72, 2.5, 2.16);
      const bodyMesh = new THREE.Mesh(bodyGeo, this.ghostValidMat);
      bodyMesh.position.set(-0.08, 1.25, 0);
      bodyMesh.name = 'ghostBody';
      g.add(bodyMesh);

      const frontGeo = new THREE.BoxGeometry(0.08, 0.09, 2.04);
      const frontMesh = new THREE.Mesh(frontGeo, this.ghostFrontMat);
      frontMesh.position.set(0.3, 0.05, 0);
      g.add(frontMesh);
    } else {
      const spec = STAND_CATALOG.find((s) => s.id === this.placementTarget!.kind === 'stand' ? s.id === (this.placementTarget as { kind: 'stand'; standId: StandId }).standId : false) ?? STAND_CATALOG[0];
      const standSpec =
        this.placementTarget.kind === 'stand'
          ? STAND_CATALOG.find((s) => s.id === (this.placementTarget as { kind: 'stand'; standId: StandId }).standId) ?? spec
          : spec;
      const bodyGeo = new THREE.BoxGeometry(standSpec.halfW * 2, 1.05, standSpec.halfD * 2);
      const bodyMesh = new THREE.Mesh(bodyGeo, this.ghostValidMat);
      bodyMesh.position.set(0, 0.525, 0);
      bodyMesh.name = 'ghostBody';
      g.add(bodyMesh);

      const frontGeo = new THREE.BoxGeometry(standSpec.halfW * 1.75, 0.09, 0.08);
      const frontMesh = new THREE.Mesh(frontGeo, this.ghostFrontMat);
      frontMesh.position.set(0, 0.05, standSpec.halfD + 0.05);
      g.add(frontMesh);
    }

    this.scene.add(g);
    this.ghostGroup = g;
  }

  private updatePlacementGhost(): void {
    if (!this.placementTarget || !this.ghostGroup) return;

    _raycaster.setFromCamera(this.getActiveNdc(), this.camera);
    const hit = _raycaster.ray.intersectPlane(_floorPlane, _vecA);

    let rawX = this.player.x - Math.sin(this.player.yaw) * 2.1;
    let rawZ = this.player.z - Math.cos(this.player.yaw) * 2.1;

    if (hit) {
      const dx = hit.x - this.player.x;
      const dz = hit.z - this.player.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.05 && dist < 8) {
        const clamped = THREE.MathUtils.clamp(dist, 0.9, 4.2);
        rawX = this.player.x + (dx / dist) * clamped;
        rawZ = this.player.z + (dz / dist) * clamped;
      }
    }

    const snapX = Math.round(rawX * 5) / 5;
    const snapZ = Math.round(rawZ * 5) / 5;
    const { valid, reason } = this.computePlacementValidity(snapX, snapZ, this.placementRotY);

    this.placementX = snapX;
    this.placementZ = snapZ;
    this.placementValid = valid;
    this.placementReason = reason;

    this.ghostGroup.position.set(snapX, 0, snapZ);
    this.ghostGroup.rotation.y = this.placementRotY;

    const body = this.ghostGroup.getObjectByName('ghostBody') as THREE.Mesh | undefined;
    if (body) {
      body.material = valid ? this.ghostValidMat : this.ghostInvalidMat;
    }
  }

  private getObbAxesAndCenter(box: OrientedColliderBox): {
    cx: number;
    cz: number;
    uxx: number;
    uxz: number;
    uzx: number;
    uzz: number;
  } {
    const c = Math.cos(box.rotY);
    const s = Math.sin(box.rotY);
    const ox = box.centerOffsetX ?? 0;
    const oz = box.centerOffsetZ ?? 0;
    return {
      cx: box.x + ox * c + oz * s,
      cz: box.z - ox * s + oz * c,
      uxx: c,
      uxz: -s,
      uzx: s,
      uzz: c,
    };
  }

  private getObbCorners(box: OrientedColliderBox): Array<[number, number]> {
    const { cx, cz, uxx, uxz, uzx, uzz } = this.getObbAxesAndCenter(box);
    const wx = uxx * box.halfW;
    const wz = uxz * box.halfW;
    const dx = uzx * box.halfD;
    const dz = uzz * box.halfD;
    return [
      [cx + wx + dx, cz + wz + dz],
      [cx + wx - dx, cz + wz - dz],
      [cx - wx + dx, cz - wz + dz],
      [cx - wx - dx, cz - wz - dz],
    ];
  }

  private isPointInOrientedBox(
    px: number,
    pz: number,
    box: OrientedColliderBox,
    pad = 0,
  ): boolean {
    const c = Math.cos(box.rotY);
    const s = Math.sin(box.rotY);
    const dx = px - box.x;
    const dz = pz - box.z;
    const lx = dx * c - dz * s;
    const lz = dx * s + dz * c;
    return (
      Math.abs(lx - (box.centerOffsetX ?? 0)) < box.halfW + pad &&
      Math.abs(lz - (box.centerOffsetZ ?? 0)) < box.halfD + pad
    );
  }

  private orientedBoxesOverlap(a: OrientedColliderBox, b: OrientedColliderBox): boolean {
    const A = this.getObbAxesAndCenter(a);
    const B = this.getObbAxesAndCenter(b);
    const dx = B.cx - A.cx;
    const dz = B.cz - A.cz;

    const axes: Array<[number, number]> = [
      [A.uxx, A.uxz],
      [A.uzx, A.uzz],
      [B.uxx, B.uxz],
      [B.uzx, B.uzz],
    ];

    for (const [ax, az] of axes) {
      const dist = Math.abs(dx * ax + dz * az);
      const rA =
        a.halfW * Math.abs(A.uxx * ax + A.uxz * az) +
        a.halfD * Math.abs(A.uzx * ax + A.uzz * az);
      const rB =
        b.halfW * Math.abs(B.uxx * ax + B.uxz * az) +
        b.halfD * Math.abs(B.uzx * ax + B.uzz * az);
      if (dist >= rA + rB - 0.025) {
        return false;
      }
    }
    return true;
  }

  private computePlacementValidity(
    x: number,
    z: number,
    rotY: number,
  ): { valid: boolean; reason: string | null } {
    if (!this.placementTarget) return { valid: false, reason: null };
    const candidate: OrientedColliderBox =
      this.placementTarget.kind === 'shelf'
        ? this.getShelfFootprint({ x, z, rotY, placed: true })
        : this.getStandFootprint(this.placementTarget.standId, { x, z, rotY, placed: true });

    const corners = this.getObbCorners(candidate);
    const allMain = corners.every(
      ([cx, cz]) => cx >= -4.02 && cx <= 4.02 && cz >= -5.5 && cz <= 5.5,
    );
    const allDepot =
      this.expanded &&
      corners.every(([cx, cz]) => cx >= 4.18 && cx <= 7.58 && cz >= -5.5 && cz <= 2.46);
    if (!allMain && !allDepot) {
      return { valid: false, reason: 'Dükkân veya Depo iç sınırları içinde olmalı' };
    }

    // Reserve entrance doorway, queue corridor, and depot passage
    if (
      this.orientedBoxesOverlap(candidate, {
        x: 0,
        z: 4.85,
        rotY: 0,
        halfW: 0.78,
        halfD: 0.75,
      })
    ) {
      return { valid: false, reason: 'Kapı giriş yolu kapatılamaz' };
    }
    if (
      this.orientedBoxesOverlap(candidate, {
        x: 1.55,
        z: -1.0,
        rotY: 0,
        halfW: 0.78,
        halfD: 1.48,
      })
    ) {
      return { valid: false, reason: 'Müşteri bekleme sırası kapatılamaz' };
    }
    if (
      this.expanded &&
      this.orientedBoxesOverlap(candidate, {
        x: 4.1,
        z: -1.45,
        rotY: 0,
        halfW: 0.55,
        halfD: 0.85,
      })
    ) {
      return { valid: false, reason: 'Depo geçiş kapısı kapatılamaz' };
    }

    // Check against fixed interior fixtures (counter, chair, barrel, plants, clutter/depot rack)
    const fixedFixtures: OrientedColliderBox[] = [
      { x: 1.85, z: -3.3, rotY: 0, halfW: 1.18, halfD: 0.52 },
      { x: 1.85, z: -4.48, rotY: 0, halfW: 0.36, halfD: 0.36 },
      { x: -2.95, z: 5.05, rotY: 0, halfW: 0.36, halfD: 0.36 },
      { x: 1.08, z: 5.14, rotY: 0, halfW: 0.28, halfD: 0.28 },
      { x: -2.22, z: 5.14, rotY: 0, halfW: 0.28, halfD: 0.28 },
    ];
    if (!this.expanded) {
      fixedFixtures.push({ x: 3.55, z: 2.9, rotY: 0, halfW: 0.58, halfD: 2.15 });
    } else {
      fixedFixtures.push({ x: 5.65, z: -4.92, rotY: 0, halfW: 1.05, halfD: 0.42 });
    }
    for (const fix of fixedFixtures) {
      if (this.orientedBoxesOverlap(candidate, fix)) {
        return { valid: false, reason: 'Tezgâh veya sabit eşyayla çakışıyor' };
      }
    }

    if (this.isPointInOrientedBox(this.player.x, this.player.z, candidate, 0.44)) {
      return { valid: false, reason: 'Üzerinde duruyorsun, biraz geri çekil' };
    }

    for (const other of this.furnitureColliders) {
      if (this.orientedBoxesOverlap(candidate, other)) {
        return { valid: false, reason: 'Başka bir raf veya stantla çakışıyor' };
      }
    }

    return { valid: true, reason: null };
  }

  public cleanHoveredOrNearestShelf(): void {
    if (!this.isPlaying()) return;
    let targetCat = this.hoveredShelfCat;

    if (targetCat === null) {
      let bestDist = 3.0;
      for (let i = 0; i < CATEGORIES.length; i++) {
        if ((this.categoryLevels[i] ?? 0) <= 0 || !this.ownedShelves[i]) continue;
        const unit = this.shelfUnits[i];
        if (!unit) continue;
        const d = Math.hypot(unit.position.x - this.player.x, unit.position.z - this.player.z);
        if (d < bestDist) {
          bestDist = d;
          targetCat = i;
        }
      }
    }

    if (targetCat === null) {
      this.sound.nope();
      this.floatMsg('Temizlemek için bir rafa yaklaş veya nişan al', 'bad');
      return;
    }

    this.cleanShelf(targetCat, false);
  }

  public cleanShelf(catIndex: number, silent = false): void {
    if ((this.categoryLevels[catIndex] ?? 0) <= 0 || !this.ownedShelves[catIndex]) return;
    const prevClean = this.shelfCleanliness[catIndex] ?? 100;
    this.shelfCleanliness[catIndex] = 100;
    this.shelfTidiness[catIndex] = 100;
    this.syncShelfDustVisuals();

    if (!silent) {
      this.sound.bagRustle();
      if (prevClean < 75) {
        this.reputation = THREE.MathUtils.clamp(this.reputation + 1, 0, 100);
        this.floatMsg(`${CATEGORIES[catIndex].name} pırıl pırıl oldu (+1 İtibar)`, 'ok');
      } else {
        this.floatMsg(`${CATEGORIES[catIndex].name} düzenlendi`, 'ok');
      }
      this.save();
      this.emitHud();
    }
  }

  public cleanAllShelves(): void {
    let dirtyCount = 0;
    for (let i = 0; i < CATEGORIES.length; i++) {
      if (
        (this.categoryLevels[i] ?? 0) > 0 &&
        this.ownedShelves[i] &&
        (this.shelfCleanliness[i] ?? 100) < 95
      ) {
        dirtyCount++;
      }
      this.shelfCleanliness[i] = 100;
      this.shelfTidiness[i] = 100;
    }
    this.syncShelfDustVisuals();
    this.sound.bagRustle();
    if (dirtyCount > 0) {
      this.floatMsg('Tüm raflar silindi ve düzenlendi', 'ok');
    } else {
      this.floatMsg('Raflar zaten tertemiz', 'ok');
    }
    this.save();
    this.emitHud();
  }

  public unlockStreetStall(): void {
    if (this.streetStallUnlocked) return;
    if (this.money - STREET_STALL_COST < -MAX_CREDIT_DEBT) {
      this.sound.nope();
      this.floatMsg('Kapı önü tezgâhı için bütçe yetmiyor', 'bad');
      return;
    }
    this.money -= STREET_STALL_COST;
    this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
    this.streetStallUnlocked = true;
    this.syncStreetStallVisuals();
    this.sound.levelUp();
    this.floatMsg(`−${STREET_STALL_COST} ₺ · Kapı önü tezgâhı açıldı!`, 'gold');
    this.save();
    this.emitHud();
  }

  public setStreetStallCategory(catIndex: number): void {
    if ((this.categoryLevels[catIndex] ?? 0) <= 0) return;
    this.streetStallCat = catIndex;
    this.syncStreetStallVisuals();
    this.sound.pick();
    this.save();
    this.emitHud();
  }

  public setShopName(name: string): void {
    const clean = name.slice(0, 22);
    this.decor.shopName = clean || 'Mahalle Nalburu';
    this.applyDecorVisuals();
    this.save();
    this.emitHud();
  }

  public selectOrBuySignTheme(id: SignThemeId): void {
    if (this.decor.unlockedSigns.includes(id)) {
      this.decor.signTheme = id;
      this.applyDecorVisuals();
      this.sound.pick();
      this.save();
      this.emitHud();
      return;
    }
    const cost = SIGN_THEMES[id].cost;
    if (this.money - cost < -MAX_CREDIT_DEBT) {
      this.sound.nope();
      return;
    }
    this.money -= cost;
    this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
    this.decor.unlockedSigns.push(id);
    this.decor.signTheme = id;
    this.applyDecorVisuals();
    this.sound.levelUp();
    this.floatMsg(`−${cost} ₺ · Yeni tabela asıldı`, 'ok');
    this.save();
    this.emitHud();
  }

  public selectOrBuyWallTheme(id: WallThemeId): void {
    if (this.decor.unlockedWalls.includes(id)) {
      this.decor.wallTheme = id;
      this.applyDecorVisuals();
      this.sound.pick();
      this.save();
      this.emitHud();
      return;
    }
    const cost = WALL_THEMES[id].cost;
    if (this.money - cost < -MAX_CREDIT_DEBT) {
      this.sound.nope();
      return;
    }
    this.money -= cost;
    this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
    this.decor.unlockedWalls.push(id);
    this.decor.wallTheme = id;
    this.applyDecorVisuals();
    this.sound.levelUp();
    this.floatMsg(`−${cost} ₺ · Duvarlar boyandı`, 'ok');
    this.save();
    this.emitHud();
  }

  public selectOrBuyRugTheme(id: RugThemeId): void {
    if (this.decor.unlockedRugs.includes(id)) {
      this.decor.rugTheme = id;
      this.applyDecorVisuals();
      this.sound.pick();
      this.save();
      this.emitHud();
      return;
    }
    const cost = RUG_THEMES[id].cost;
    if (this.money - cost < -MAX_CREDIT_DEBT) {
      this.sound.nope();
      return;
    }
    this.money -= cost;
    this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
    this.decor.unlockedRugs.push(id);
    this.decor.rugTheme = id;
    this.applyDecorVisuals();
    this.sound.levelUp();
    this.floatMsg(`−${cost} ₺ · Yeni halı serildi`, 'ok');
    this.save();
    this.emitHud();
  }

  public buyPoster(id: PosterId): void {
    if (this.decor.posters.includes(id)) return;
    const cost = POSTER_THEMES[id].cost;
    if (this.money - cost < -MAX_CREDIT_DEBT) {
      this.sound.nope();
      return;
    }
    this.money -= cost;
    this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
    this.decor.posters.push(id);
    this.applyDecorVisuals();
    this.sound.pick();
    this.floatMsg(`−${cost} ₺ · Afiş duvara asıldı`, 'ok');
    this.save();
    this.emitHud();
  }

  public buyNazarCharm(): void {
    if (this.decor.nazarCharm) return;
    if (this.money - NAZAR_CHARM_COST < -MAX_CREDIT_DEBT) {
      this.sound.nope();
      return;
    }
    this.money -= NAZAR_CHARM_COST;
    this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
    this.decor.nazarCharm = true;
    this.reputation = THREE.MathUtils.clamp(this.reputation + 2, 0, 100);
    this.applyDecorVisuals();
    this.sound.bell();
    this.floatMsg(`−${NAZAR_CHARM_COST} ₺ · Nazar boncuğu asıldı (+2 İtibar)`, 'gold');
    this.save();
    this.emitHud();
  }

  public hireApprentice(): void {
    if (this.apprentice.hired) return;
    if (this.money - APPRENTICE_HIRE_COST < -MAX_CREDIT_DEBT) {
      this.sound.nope();
      this.floatMsg('Çırak işe almak için bütçe yetmiyor', 'bad');
      return;
    }
    this.money -= APPRENTICE_HIRE_COST;
    this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
    this.apprentice.hired = true;
    this.syncApprenticeVisuals();
    this.sound.levelUp();
    this.floatMsg(`−${APPRENTICE_HIRE_COST} ₺ · Çırak Yusuf işe başladı!`, 'gold');
    this.save();
    this.emitHud();
  }

  public setApprenticeTask(task: ApprenticeTask): void {
    if (!this.apprentice.hired) return;
    this.apprentice.task = task;
    this.apprenticeActionTimer = 1.2;
    this.sound.pick();
    this.save();
    this.emitHud();
  }

  private grantApprenticeXp(amount = 1): void {
    this.apprentice.tasksDone += 1;
    this.apprentice.xp += amount;
    const needed = getApprenticeNextXp(this.apprentice.level);
    this.apprentice.nextXp = needed;
    if (this.apprentice.xp >= needed && this.apprentice.level < 5) {
      this.apprentice.xp = 0;
      this.apprentice.level += 1;
      this.apprentice.nextXp = getApprenticeNextXp(this.apprentice.level);
      this.apprentice.dailyWage = APPRENTICE_BASE_WAGE + (this.apprentice.level - 1) * 12;
      this.sound.levelUp();
      this.floatMsg(`Çırak Yusuf Seviye ${this.apprentice.level} oldu!`, 'gold');
    }
  }

  // ---------- Seating Mechanic ----------

  public toggleSeat(): void {
    if (!this.isPlaying()) return;
    if (this.isSeated) {
      this.standUp();
    } else {
      this.sitDown();
    }
  }

  private sitDown(): void {
    this.isSeated = true;
    this.player.x = 1.85;
    this.player.z = -4.46;
    this.player.yaw = Math.PI;
    this.player.pitch = -0.05;
    this.sound.sitDown();
    this.emitHud();
  }

  private standUp(): void {
    if (!this.isSeated) return;
    this.isSeated = false;
    this.player.x = 1.85;
    this.player.z = -4.12;
    this.sound.sitDown();
    this.emitHud();
  }

  // ---------- Tea Service ----------

  public serveOrBrewTea(): void {
    if (!this.isPlaying()) return;

    if (this.teaServings <= 0) {
      if (this.money - BREW_TEA_COST < -MAX_CREDIT_DEBT) {
        this.sound.nope();
        this.floatMsg('Çay demlemek için bütçe yetmiyor', 'bad');
        return;
      }
      this.money -= BREW_TEA_COST;
      this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
      this.teaServings = MAX_TEA_SERVINGS;
      this.teaRig.teaLiquid.visible = true;
      this.sound.restock();
      this.floatMsg(`−${BREW_TEA_COST} ₺ · Yeni demlik çay demlendi`, 'ok');
      this.save();
      this.emitHud();
      return;
    }

    const inShopCustomers = this.customers.filter(
      (c) => c.state !== 'out' && c.rig.group.position.z < 5.2,
    );
    if (inShopCustomers.length === 0) {
      this.sound.nope();
      this.floatMsg('Dükkânda çay ikram edilecek müşteri yok', 'bad');
      return;
    }

    let target =
      this.hoveredCustomer && this.hoveredCustomer.state !== 'out'
        ? this.hoveredCustomer
        : inShopCustomers.find((c) => !c.teaServed) ?? this.getFrontCustomer();
    if (!target) target = inShopCustomers[0];

    this.teaServings -= 1;
    this.teaRig.teaLiquid.visible = this.teaServings > 0;

    target.patience = Math.min(target.maxPatience, target.patience + target.maxPatience * 0.35);
    const reaction = TEA_REACTIONS[Math.floor(Math.random() * TEA_REACTIONS.length)];

    if (!target.teaServed) {
      target.teaServed = true;
      this.reputation = THREE.MathUtils.clamp(this.reputation + 1, 0, 100);
      this.floatMsg(`${target.personName}: Çay ikramı (+1 İtibar)`, 'gold');
    } else {
      this.floatMsg(`${target.personName} taze çayını içti`, 'ok');
    }
    target.nodTimer = 1.1;

    this.sound.sitDown();
    this.setBubble(reaction, `${target.personName} çayından memnun (+Sabır)`, 2.8);
    this.save();
    this.emitHud();
  }

  // ---------- Shop Radio & Weather/Season Visuals ----------

  public cycleRadioStation(): void {
    this.sound.unlock();
    const idx = RADIO_STATIONS.findIndex((r) => r.id === this.radioStation);
    const next = RADIO_STATIONS[(idx + 1) % RADIO_STATIONS.length];
    this.radioStation = next.id;
    this.sound.setRadioStation(this.radioStation, true);
    this.radioRig.dialMat.emissiveIntensity = this.radioStation === 'off' ? 0.12 : 1.15;
    this.floatMsg(
      this.radioStation === 'off' ? 'Radyo kapatıldı' : `Radyo: ${next.label}`,
      'ok',
    );
    this.save();
    this.emitHud();
  }

  public playServiceSound(kind: 'key' | 'saw' | 'nope'): void {
    if (kind === 'key') this.sound.keyGrind();
    else if (kind === 'saw') this.sound.sawCut();
    else this.sound.nope();
  }

  private applyWeatherAndSeasonVisuals(): void {
    const sMeta = SEASON_META[this.season] ?? SEASON_META.spring;
    this.leafMat1.color.setHex(sMeta.leafHex1);
    this.leafMat2.color.setHex(sMeta.leafHex2);

    const rainy = this.weather === 'rainy';
    this.rainPoints.visible = rainy;
    this.roadMat.roughness = rainy ? 0.22 : 0.94;
    this.roadMat.color.copy(rainy ? _wetRoad : _dryRoad);
    this.sidewalkMat.roughness = rainy ? 0.42 : 0.95;
    this.sidewalkMat.color.copy(rainy ? _wetWalk : _dryWalk);
  }

  // ---------- Veresiye Defteri ----------

  public collectVeresiye(entryId: number): void {
    const entry = this.veresiyeEntries.find((v) => v.id === entryId);
    if (!entry || entry.status !== 'ready_to_collect') return;

    entry.status = 'paid';
    this.money += entry.amount;
    this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
    this.dayVeresiyeCollected += entry.amount;
    this.sound.coin();
    this.floatMsg(`+${entry.amount} ₺ veresiye tahsil edildi`, 'gold');
    this.save();
    this.emitHud();
  }

  public writeOffVeresiye(entryId: number): void {
    const entry = this.veresiyeEntries.find((v) => v.id === entryId);
    if (!entry || (entry.status !== 'open' && entry.status !== 'ready_to_collect')) return;
    entry.status = 'defaulted';
    this.sound.pick();
    this.floatMsg(`${entry.customerName} borcu silindi`, 'bad');
    this.save();
    this.emitHud();
  }

  // ---------- Skill Tree & Real Expansion ----------

  private applyExpansionVisuals(): void {
    this.clutterGroup.visible = false;
    this.depotDoorBlock.visible = false;
    const idx = this.staticColliders.indexOf(this.clutterCollider);
    if (idx >= 0) {
      this.staticColliders.splice(idx, 1);
    }
  }

  public unlockExpansion(): void {
    if (
      this.expanded ||
      this.points < EXPANSION_POINT_COST ||
      this.money < EXPANSION_MONEY_COST
    ) {
      return;
    }
    this.points -= EXPANSION_POINT_COST;
    this.money -= EXPANSION_MONEY_COST;
    this.expanded = true;
    this.applyExpansionVisuals();
    this.sound.levelUp();
    this.floatMsg(`−${EXPANSION_MONEY_COST} ₺ · Depo Odası ve Sağ Alan açıldı!`, 'ok');
    this.save();
    this.emitHud();
  }

  private addPointProgress(): void {
    this.pointProgress += 1;
    if (this.pointProgress >= POINT_STEP_TARGET) {
      this.pointProgress = 0;
      this.points += 1;
      window.setTimeout(() => {
        if (!this.disposed) {
          this.floatMsg('+1 karakter puanı (F)', 'ok');
        }
      }, 650);
    }
  }

  public unlockCategoryTier(catIndex: number, tier: number): void {
    const currentLv = this.categoryLevels[catIndex] ?? 0;
    const needsExpansion = CATEGORIES[catIndex]?.requiresExpansion ?? false;
    const canOpen = currentLv === tier - 1 && (!needsExpansion || this.expanded);
    const cost = getSkillCost(catIndex, tier);
    if (!canOpen || this.points < cost) return;

    this.points -= cost;
    this.categoryLevels[catIndex] = tier;
    this.applyCategoryLevel(catIndex, false);
    this.market = generateDailyMarket(this.day, this.categoryLevels, this.dailyEvent);
    this.sound.levelUp();

    const cat = CATEGORIES[catIndex];
    if (!this.ownedShelves[catIndex]) {
      this.floatMsg(`${cat.name} izni açıldı! Dükkân (G)'den ${cat.shelfCost} ₺'ye boş raf al.`, 'gold');
    } else {
      this.floatMsg(`${cat.names[tier - 1]} izni açıldı! Toptancıdan (B) sipariş et.`, 'ok');
    }

    this.save();
    this.emitHud();
  }

  public unlockStandPermit(standId: StandId): void {
    const spec = STAND_CATALOG.find((s) => s.id === standId);
    if (!spec || this.unlockedStands[standId]) return;
    if (this.points < spec.pointCost) {
      this.sound.nope();
      this.floatMsg(`Bu izin için ${spec.pointCost} karakter puanı gerekli`, 'bad');
      return;
    }
    this.points -= spec.pointCost;
    this.unlockedStands[standId] = true;
    this.sound.levelUp();
    this.floatMsg(
      `${spec.name} izni açıldı! Dükkân (G)'den ${spec.standCost} ₺'ye boş stant alıp kur.`,
      'gold',
    );
    this.save();
    this.emitHud();
  }

  public unlockCharacterSkill(skillId: CharacterSkillId): void {
    const spec = CHARACTER_SKILLS.find((s) => s.id === skillId);
    if (!spec) return;
    const curLv = this.characterSkills[skillId] ?? 0;
    if (curLv >= spec.maxLevel) return;
    const nextTier = spec.levels[curLv];
    if (!nextTier || this.points < nextTier.cost) {
      this.sound.nope();
      return;
    }
    this.points -= nextTier.cost;
    this.characterSkills[skillId] = curLv + 1;
    this.sound.levelUp();
    this.floatMsg(`${spec.name}: ${nextTier.label} açıldı!`, 'gold');
    this.save();
    this.emitHud();
  }

  // ---------- Pricing, Reserve & Wholesale Orders ----------

  public setCustomPrice(cat: number, tier: number, newPrice: number): void {
    const suggested = getSuggestedPrice(cat, tier);
    const minP = Math.max(3, Math.round(suggested * 0.65));
    const maxP = Math.round(suggested * 1.65);
    const clamped = THREE.MathUtils.clamp(Math.round(newPrice), minP, maxP);
    this.customPrices[ITEM_KEY(cat, tier)] = clamped;
    this.refreshAllShelfLabels();
    this.save();
    this.emitHud();
  }

  public refillShelvesFromReserve(): void {
    let moved = 0;
    for (const item of this.items) {
      if (item.locked || !this.ownedShelves[item.cat] || item.has || this.carryingItems.includes(item)) {
        continue;
      }
      const key = ITEM_KEY(item.cat, item.tier);
      const avail = this.reserveStock[key] ?? 0;
      if (avail > 0) {
        this.reserveStock[key] = avail - 1;
        item.has = true;
        item.group.visible = true;
        moved++;
      }
    }
    if (moved > 0) {
      this.syncDepotCrates();
      this.sound.boxUnpack();
      this.floatMsg(`Depodan +${moved} ürün rafa dizildi`, 'ok');
      this.save();
      this.emitHud();
    }
  }

  public placeWholesaleOrder(lines: OrderCartLine[], urgentCourier: boolean): boolean {
    const valid = lines.filter((l) => l.qty > 0);
    if (valid.length === 0) return false;

    const totalQty = valid.reduce((acc, l) => acc + l.qty, 0);
    const discountRate = getBulkDiscountRate(totalQty);

    let subtotal = 0;
    for (const line of valid) {
      const m = this.market.find((x) => x.cat === line.cat && x.tier === line.tier);
      if (!m || m.status === 'out_of_stock') return false;
      subtotal += m.unitCost * line.qty;
    }

    const afterBulk = Math.round(subtotal * (1 - discountRate));
    const totalCost = urgentCourier ? Math.round(afterBulk * 1.25) : afterBulk;

    if (this.money - totalCost < -MAX_CREDIT_DEBT) {
      this.sound.nope();
      this.floatMsg(`Esnaf kredi limiti aşıldı (en fazla −${MAX_CREDIT_DEBT} ₺)`, 'bad');
      return false;
    }

    this.money -= totalCost;
    if (this.money < 0) {
      this.creditDebt = Math.abs(this.money);
    }
    this.dayWholesaleSpent += totalCost;

    const orderMap: Record<string, number> = {};
    for (const line of valid) {
      const key = ITEM_KEY(line.cat, line.tier);
      orderMap[key] = (orderMap[key] ?? 0) + line.qty;
    }

    if (urgentCourier) {
      this.spawnDeliveryBox(orderMap);
      this.sound.bell();
      this.floatMsg(`−${totalCost} ₺ · Acil kurye koliyi kapıya bıraktı`, 'gold');
    } else {
      for (const [k, q] of Object.entries(orderMap)) {
        this.pendingOrders[k] = (this.pendingOrders[k] ?? 0) + q;
      }
      this.sound.restock();
      this.floatMsg(`−${totalCost} ₺ · Sipariş yarın sabah gelecek`, 'ok');
    }

    this.save();
    this.emitHud();
    return true;
  }

  private spawnDeliveryBox(contents: Record<string, number>): void {
    const totalUnits = Object.values(contents).reduce((a, b) => a + b, 0);
    if (totalUnits <= 0) return;

    const spot = BOX_SPOTS[this.deliveryBoxes.length % BOX_SPOTS.length];
    const rig = createDeliveryBoxModel();
    const stackOffset = Math.floor(this.deliveryBoxes.length / BOX_SPOTS.length) * 0.36;
    rig.group.position.set(spot[0], stackOffset, spot[1]);
    rig.group.rotation.y = (Math.random() - 0.5) * 0.25;

    const entity: DeliveryBoxEntity = {
      id: this.boxSeq++,
      rig,
      contents,
      totalUnits,
    };
    rig.hitbox.userData.deliveryBox = entity;
    this.trackRigResources(rig.group);
    this.scene.add(rig.group);
    this.deliveryBoxes.push(entity);
  }

  private openDeliveryBox(box: DeliveryBoxEntity): void {
    let placedOnShelves = 0;
    let movedToReserve = 0;

    for (const [key, qty] of Object.entries(box.contents)) {
      const [catStr, tierStr] = key.split('_');
      const cat = Number(catStr);
      const tier = Number(tierStr);
      let remaining = qty;

      for (const item of this.items) {
        if (remaining <= 0) break;
        if (
          item.cat === cat &&
          item.tier === tier &&
          !item.locked &&
          this.ownedShelves[cat] &&
          !item.has &&
          !this.carryingItems.includes(item)
        ) {
          item.has = true;
          item.group.visible = true;
          remaining--;
          placedOnShelves++;
        }
      }

      if (remaining > 0) {
        this.reserveStock[key] = (this.reserveStock[key] ?? 0) + remaining;
        movedToReserve += remaining;
      }
    }

    this.scene.remove(box.rig.group);
    this.deliveryBoxes = this.deliveryBoxes.filter((b) => b.id !== box.id);
    this.syncDepotCrates();
    this.sound.boxUnpack();

    if (placedOnShelves > 0 && movedToReserve > 0) {
      this.floatMsg(`+${placedOnShelves} rafa, +${movedToReserve} depoya`, 'ok');
    } else if (placedOnShelves > 0) {
      this.floatMsg(`Koli açıldı: +${placedOnShelves} ürün rafa dizildi`, 'ok');
    } else {
      this.floatMsg(`Koli açıldı: +${movedToReserve} depoya alındı`, 'ok');
    }

    this.save();
    this.emitHud();
  }

  // ---------- Day Cycle & Summary ----------

  private isClosingTime(): boolean {
    return this.dayMinutes >= 20 * 60;
  }

  private canEndDay(): boolean {
    const activeInShop = this.customers.some((c) => c.state !== 'out');
    return this.dayMinutes >= 18 * 60 && !activeInShop && !this.activeCheckout;
  }

  private getAverageCleanliness(): number {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < CATEGORIES.length; i++) {
      if ((this.categoryLevels[i] ?? 0) > 0 && this.ownedShelves[i]) {
        sum += this.shelfCleanliness[i] ?? 100;
        count++;
      }
    }
    return count > 0 ? Math.round(sum / count) : 100;
  }

  public endDay(): void {
    if (!this.canEndDay()) return;

    const rentCost = DAILY_RENT_BASE + (this.expanded ? 25 : 0);
    const utilityCost = DAILY_UTILITY_BASE;
    const apprenticeWage = this.apprentice.hired ? this.apprentice.dailyWage : 0;
    const totalFixed = rentCost + utilityCost + apprenticeWage;

    this.money -= totalFixed;
    if (this.money < -MAX_CREDIT_DEBT) {
      this.money = -MAX_CREDIT_DEBT;
    }
    this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;

    const cleanlinessAvg = this.getAverageCleanliness();
    // Spotless shop rewards +1 rep; very dusty shop loses 1 rep
    if (cleanlinessAvg >= 88) {
      this.reputation = THREE.MathUtils.clamp(this.reputation + 1, 0, 100);
      this.cleanStreak += 1;
    } else {
      this.cleanStreak = 0;
      if (cleanlinessAvg < 45) {
        this.reputation = THREE.MathUtils.clamp(this.reputation - 1, 0, 100);
      }
    }

    // Apply Municipal Inspection event at closing time if active today
    let eventOutcomeText: string | undefined;
    let eventDeltaMoney = 0;
    if (this.dailyEvent.id === 'inspection') {
      if (cleanlinessAvg >= 88) {
        eventDeltaMoney = 60;
        this.money += 60;
        this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
        this.reputation = THREE.MathUtils.clamp(this.reputation + 3, 0, 100);
        eventOutcomeText = 'Zabıta Denetimi Geçildi: Tertemiz tezgâh ödülü (+60 ₺, +3 İtibar)';
      } else if (cleanlinessAvg < 60) {
        eventDeltaMoney = -35;
        this.money = Math.max(-MAX_CREDIT_DEBT, this.money - 35);
        this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
        this.reputation = THREE.MathUtils.clamp(this.reputation - 2, 0, 100);
        eventOutcomeText = 'Zabıta Uyarısı: Tozlu raflar nedeniyle ceza (−35 ₺, −2 İtibar)';
      } else {
        eventOutcomeText = 'Zabıta Denetimi: Dükkân standartlara uygun bulundu.';
      }
    }

    const satAvg =
      this.daySatisfactionList.length > 0
        ? Math.round(
            this.daySatisfactionList.reduce((a, b) => a + b, 0) /
              this.daySatisfactionList.length,
          )
        : 100;

    const pendingCount = Object.values(this.pendingOrders).reduce((a, b) => a + b, 0);
    const readyToCollectCount = this.veresiyeEntries.filter(
      (v) => v.status === 'ready_to_collect',
    ).length;

    this.lastDaySummary = {
      day: this.day,
      customersServed: this.dayCustomersServed,
      customersLost: this.dayCustomersLost,
      revenue: this.dayRevenue,
      veresiyeCollected: this.dayVeresiyeCollected,
      veresiyeWritten: this.dayVeresiyeWritten,
      wholesaleSpent: this.dayWholesaleSpent,
      rentCost,
      utilityCost,
      apprenticeWage,
      netProfit:
        this.dayRevenue +
        this.dayVeresiyeCollected +
        eventDeltaMoney -
        this.dayWholesaleSpent -
        totalFixed,
      satisfactionAvg: satAvg,
      cleanlinessAvg,
      reputationDelta: this.reputation - this.dayRepStart,
      reputationAfter: this.reputation,
      pendingDeliveryCount: pendingCount,
      readyToCollectCount,
      moneyAfter: this.money,
      creditDebt: this.creditDebt,
      season: this.season,
      weather: this.weather,
      eventTitle: this.dailyEvent.title,
      eventOutcomeText,
      eventDeltaMoney,
      contractsCompletedToday: this.dayContractsCompleted,
    };

    this.sound.shutterClose();
    this.modal = 'daySummary';
    this.clearKeys();
    this.safeExitPointerLock();
    this.save();
    this.emitHud();
  }

  public startNextDay(): void {
    this.day += 1;
    this.season = getSeasonForDay(this.day);
    this.weather = rollDailyWeather(this.day, this.season);
    this.dailyEvent = rollDailyEvent(this.day, this.categoryLevels);
    this.applyWeatherAndSeasonVisuals();
    this.dayMinutes = 8 * 60;
    this.dayRevenue = 0;
    this.dayVeresiyeCollected = 0;
    this.dayVeresiyeWritten = 0;
    this.dayWholesaleSpent = 0;
    this.dayCustomersServed = 0;
    this.dayCustomersLost = 0;
    this.dayContractsCompleted = 0;
    this.dayRepStart = this.reputation;
    this.daySatisfactionList = [];
    this.lastDaySummary = null;
    this.teaServings = MAX_TEA_SERVINGS;
    this.teaRig.teaLiquid.visible = true;

    let expiredAccepted = 0;
    for (const c of this.contracts) {
      if ((c.status === 'available' || c.status === 'accepted') && this.day > c.dueDay) {
        if (c.status === 'accepted') {
          expiredAccepted++;
          this.reputation = THREE.MathUtils.clamp(this.reputation - 1, 0, 100);
        }
        c.status = 'expired';
      }
    }
    this.ensureDailyContracts();

    let readyCount = 0;
    for (const entry of this.veresiyeEntries) {
      if (entry.status === 'open' && this.day >= entry.dueDay) {
        const trusted =
          entry.trustLabel === 'Güvenilir Komşu' || entry.trustLabel === 'Mahalle Ustası';
        if (trusted || Math.random() < 0.85) {
          entry.status = 'ready_to_collect';
          readyCount++;
        } else if (this.day - entry.dueDay >= 3) {
          entry.status = 'defaulted';
          this.reputation = THREE.MathUtils.clamp(this.reputation - 1, 0, 100);
        } else {
          entry.dueDay += 1;
        }
      } else if (entry.status === 'ready_to_collect') {
        readyCount++;
      }
    }

    const pendingEntries = Object.entries(this.pendingOrders).filter(([, q]) => q > 0);
    if (pendingEntries.length > 0) {
      const boxPayload: Record<string, number> = {};
      for (const [k, q] of pendingEntries) {
        boxPayload[k] = q;
      }
      this.pendingOrders = {};
      this.spawnDeliveryBox(boxPayload);
    }

    this.market = generateDailyMarket(this.day, this.categoryLevels, this.dailyEvent);
    this.spawnTimer = 2.0;
    this.modal = 'none';
    this.tryRequestPointerLock();
    this.save();
    this.emitHud();

    if (pendingEntries.length > 0) {
      this.floatMsg('Kapının önünde yeni toptancı kolisi var!', 'ok');
    } else if (expiredAccepted > 0) {
      this.floatMsg('Teslim süresi dolan ihale iptal oldu', 'bad');
    } else if (this.dailyEvent.id !== 'calm') {
      this.floatMsg(`Günün Bülteni: ${this.dailyEvent.title}`, 'gold');
    } else if (readyCount > 0) {
      this.floatMsg(`Veresiye defterinde ${readyCount} tahsilat hazır (L)`, 'gold');
    } else if (this.weather === 'rainy') {
      this.floatMsg(`${SEASON_META[this.season].label} yağmuru başladı`, 'ok');
    }
  }

  // ---------- Haggling & Checkout Completion ----------

  public resolveCheckoutHaggle(agreedPrice: number): void {
    if (!this.activeCheckout) return;
    const finalPrice = Math.max(3, Math.round(agreedPrice));
    const paidAmount = getCustomerPaymentBill(finalPrice);
    this.activeCheckout = {
      ...this.activeCheckout,
      sellPrice: finalPrice,
      paidAmount,
      changeDue: paidAmount - finalPrice,
      wantsHaggle: false,
    };
    this.sound.coin();
    this.emitHud();
  }

  public cancelCheckoutHaggleWalkout(): void {
    if (!this.activeCheckout || this.checkoutCustomerId === null) return;
    const cust = this.customers.find((c) => c.id === this.checkoutCustomerId);

    if (this.checkoutCat >= 0 && this.checkoutTier > 0) {
      for (const it of this.items) {
        if (it.cat === this.checkoutCat && it.tier === this.checkoutTier && !it.locked && !it.has) {
          it.has = true;
          it.group.visible = true;
          break;
        }
      }
    }

    this.dayCustomersLost += 1;
    this.daySatisfactionList.push(30);
    this.reputation = THREE.MathUtils.clamp(this.reputation - 2, 0, 100);
    this.sound.nope();

    if (cust) {
      cust.state = 'out';
      cust.path = [
        [0.35, 1.5],
        [0, 4.7],
        [0, 8.2],
      ];
      this.promoteQueue();
      this.setBubble(`${cust.personName}: Fiyatta anlaşamadık usta, sağ olasın.`, undefined, 2.5);
    }

    this.activeCheckout = null;
    this.checkoutCustomerId = null;
    this.checkoutCat = -1;
    this.checkoutTier = 0;
    this.modal = 'none';
    this.tryRequestPointerLock();
    this.save();
    this.emitHud();
  }

  public completeCheckout(bagged: boolean, givenChange: number): void {
    if (!this.activeCheckout || this.checkoutCustomerId === null) return;
    if (!bagged || givenChange !== this.activeCheckout.changeDue) {
      this.sound.nope();
      return;
    }

    const session = this.activeCheckout;
    const cust = this.customers.find((c) => c.id === this.checkoutCustomerId);

    this.money += session.sellPrice;
    this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
    this.dayRevenue += session.sellPrice;
    this.dayCustomersServed += 1;
    this.served += 1;

    this.drawerOpenTarget = -0.24;
    window.setTimeout(() => {
      if (!this.disposed) this.drawerOpenTarget = 0;
    }, 950);
    this.sound.drawerOpen();
    this.sound.coin();

    this.addPointProgress();

    let repGain = cust ? PERSONALITY_META[cust.personality].repBonus : 2;
    if (cust && cust.firstTryClueless && cust.personality === 'clueless') {
      repGain += 1;
    }
    const satBonus = (cust?.teaServed ? 8 : 0) + (this.getAverageCleanliness() >= 80 ? 4 : 0);
    const satScore = cust
      ? Math.max(
          55,
          Math.min(100, Math.round((cust.patience / cust.maxPatience) * 100 + 25 + satBonus)),
        )
      : 90;
    this.daySatisfactionList.push(satScore);
    this.reputation = THREE.MathUtils.clamp(this.reputation + repGain, 0, 100);

    this.floatMsg(`+${session.sellPrice} ₺`, 'gold');

    if (cust) {
      cust.hasBag = true;
      cust.rig.bagGroup.visible = true;
      cust.state = 'out';
      cust.path = [
        [0.35, 1.5],
        [0, 4.7],
        [0, 8.2],
      ];
      this.promoteQueue();
    }

    this.activeCheckout = null;
    this.checkoutCustomerId = null;
    this.checkoutCat = -1;
    this.checkoutTier = 0;
    this.modal = 'none';
    this.setBubble('Sağ ol usta, hayırlı işler!', undefined, 2.2);
    this.tryRequestPointerLock();
    this.save();
    this.emitHud();
  }

  public completeCheckoutAsVeresiye(bagged: boolean): void {
    if (!this.activeCheckout || this.checkoutCustomerId === null) return;
    if (!bagged || !this.activeCheckout.canOfferVeresiye) {
      this.sound.nope();
      return;
    }

    const session = this.activeCheckout;
    const cust = this.customers.find((c) => c.id === this.checkoutCustomerId);
    const delayDays =
      session.personality === 'craftsman' ? 1 : 1 + Math.floor(Math.random() * 2);

    this.veresiyeEntries.unshift({
      id: this.veresiyeSeq++,
      customerName: session.customerName,
      personalityLabel: session.personalityLabel,
      itemName: session.itemName,
      amount: session.sellPrice,
      dayWritten: this.day,
      dueDay: this.day + delayDays,
      status: 'open',
      trustLabel: session.trustLabel,
    });

    this.dayVeresiyeWritten += session.sellPrice;
    this.dayCustomersServed += 1;
    this.served += 1;

    this.addPointProgress();

    const repGain = (cust ? PERSONALITY_META[cust.personality].repBonus : 2) + 1;
    this.daySatisfactionList.push(96);
    this.reputation = THREE.MathUtils.clamp(this.reputation + repGain, 0, 100);

    this.sound.pick();
    this.floatMsg(`Deftere yazıldı (${session.sellPrice} ₺ · Gün ${this.day + delayDays})`, 'ok');

    if (cust) {
      cust.hasBag = true;
      cust.rig.bagGroup.visible = true;
      cust.state = 'out';
      cust.path = [
        [0.35, 1.5],
        [0, 4.7],
        [0, 8.2],
      ];
      this.promoteQueue();
    }

    this.activeCheckout = null;
    this.checkoutCustomerId = null;
    this.checkoutCat = -1;
    this.checkoutTier = 0;
    this.modal = 'none';
    this.setBubble('Allah razı olsun usta, en kısa sürede uğrar öderim!', undefined, 2.6);
    this.tryRequestPointerLock();
    this.save();
    this.emitHud();
  }

  public playCheckoutSound(kind: 'bag' | 'coin' | 'nope'): void {
    if (kind === 'bag') this.sound.bagRustle();
    else if (kind === 'coin') this.sound.pick();
    else this.sound.nope();
  }

  // ---------- Gameplay Actions & Raycasting ----------

  private getCarryCapacity(): number {
    return 1 + (this.characterSkills.multiCarry ?? 0);
  }

  private rebuildCarryVisual(): void {
    if (this.carryModel) {
      this.camera.remove(this.carryModel);
      this.carryModel = null;
    }
    if (this.carryingItems.length === 0) return;

    const holder = new THREE.Group();
    const count = this.carryingItems.length;
    const scale = Math.max(0.88, 1.32 - (count - 1) * 0.18);
    this.carryingItems.forEach((item, idx) => {
      const clone = item.group.clone();
      clone.visible = true;
      const spreadX = (idx - (count - 1) / 2) * 0.16;
      clone.position.set(0.28 + spreadX, -0.32, -0.6 - idx * 0.03);
      clone.rotation.set(0.2, -0.6, 0);
      clone.scale.setScalar(scale);
      clone.traverse((child) => {
        child.castShadow = false;
      });
      holder.add(clone);
    });
    this.carryModel = holder;
    this.camera.add(holder);
  }

  private isInsideWalkableBounds(x: number, z: number): boolean {
    // Extended neighborhood sidewalk, street, park & opposite shops
    if (z > 5.1) {
      const throughDoor = Math.abs(x) < 0.42 && z <= 6.0;
      const outsideNeighborhood = z >= 5.95 && z <= 13.7 && x >= -14.5 && x <= 14.5;
      return throughDoor || outsideNeighborhood;
    }
    // Expanded walk-in Depo Odası (x: 4.1..7.55, z: -5.45..2.45)
    if (this.expanded && x > 3.75) {
      const throughDoor = x <= 4.35 && z >= -2.1 && z <= -0.75;
      const inDepotRoom = x >= 4.2 && x <= 7.35 && z >= -5.25 && z <= 2.3;
      return throughDoor || inDepotRoom;
    }
    return x >= -3.75 && x <= 3.75 && z >= -5.15 && z <= 5.1;
  }

  private checkCollision(x: number, z: number): boolean {
    if (!this.isInsideWalkableBounds(x, z)) return true;

    const r = 0.32;
    for (const c of this.staticColliders) {
      if (x > c.x0 - r && x < c.x1 + r && z > c.z0 - r && z < c.z1 + r) {
        return true;
      }
    }
    for (const c of this.furnitureColliders) {
      if (this.isPointInOrientedBox(x, z, c, r)) {
        return true;
      }
    }
    if (this.streetStallUnlocked && z > 5.7) {
      // Street stall collider at (-1.75, 6.28)
      if (x > -2.45 - r && x < -1.05 + r && z > 5.9 - r && z < 6.65 + r) {
        return true;
      }
    }
    if (this.expanded && x > 4.2) {
      // Depot rack at (5.65, -4.92)
      if (x > 4.6 - r && x < 6.7 + r && z > -5.3 - r && z < -4.5 + r) {
        return true;
      }
    }
    for (const c of this.customers) {
      const cx = c.rig.group.position.x;
      const cz = c.rig.group.position.z;
      const nextDist = Math.hypot(x - cx, z - cz);
      const currDist = Math.hypot(this.player.x - cx, this.player.z - cz);
      if (nextDist < 0.56 && nextDist < currDist) return true;
    }
    return false;
  }

  private raycastTargets(ndc: THREE.Vector2): {
    item: ShelfItem | null;
    customer: ActiveCustomer | null;
    chair: boolean;
    box: DeliveryBoxEntity | null;
    register: boolean;
    tea: boolean;
    ledger: boolean;
    depot: boolean;
    stall: boolean;
    apprentice: boolean;
    standId: StandId | null;
    radio: boolean;
    board: boolean;
    shelfCat: number | null;
  } {
    _raycaster.setFromCamera(ndc, this.camera);
    const targets: THREE.Object3D[] = [];

    if (!this.carryingReserveKey && this.carryingItems.length < this.getCarryCapacity()) {
      for (const m of this.pickMeshes) {
        const it = m.userData.shelfItem as ShelfItem | undefined;
        if (it && it.has && !it.locked && this.shelfTransforms[it.cat]?.placed) {
          targets.push(m);
        }
      }
    }

    if (this.carryingItems.length === 0 && !this.carryingReserveKey) {
      for (const b of this.deliveryBoxes) {
        targets.push(b.rig.hitbox);
      }
      if (!this.isSeated) {
        targets.push(this.chairRig.hitbox);
      }
      targets.push(this.teaRig.hitbox);
      targets.push(this.ledgerRig.hitbox);
      for (const spec of STAND_CATALOG) {
        if (this.ownedStands[spec.id] && this.standTransforms[spec.id]?.placed) {
          targets.push(this.standRigs[spec.id].hitbox);
        }
      }
      targets.push(this.radioRig.hitbox);
      targets.push(this.boardRig.hitbox);
      if (this.expanded) {
        targets.push(this.depotRig.hitbox);
      }
      if (this.streetStallUnlocked) {
        targets.push(this.streetStallRig.hitbox);
      }
      if (this.apprentice.hired) {
        targets.push(this.apprenticeRig.hitbox);
      }
    }

    // Shelf hitboxes for cleaning (R), moving (T), or reserve box drop-off
    for (let i = 0; i < CATEGORIES.length; i++) {
      if (
        (this.categoryLevels[i] ?? 0) > 0 &&
        this.ownedShelves[i] &&
        this.shelfTransforms[i]?.placed &&
        this.shelfHitboxes[i]
      ) {
        targets.push(this.shelfHitboxes[i]);
      }
    }

    targets.push(this.registerRig.hitbox);

    for (const c of this.customers) {
      if (c.state !== 'out') {
        targets.push(c.rig.hitbox);
      }
    }

    const empty = {
      item: null,
      customer: null,
      chair: false,
      box: null,
      register: false,
      tea: false,
      ledger: false,
      depot: false,
      stall: false,
      apprentice: false,
      standId: null as StandId | null,
      radio: false,
      board: false,
      shelfCat: null as number | null,
    };

    if (targets.length === 0) return empty;

    const hits = _raycaster.intersectObjects(targets, false);
    if (hits.length === 0) return empty;

    let detectedShelfCat: number | null = null;
    for (const h of hits) {
      if (typeof h.object.userData.shelfCat === 'number' && h.distance < 3.4) {
        detectedShelfCat = h.object.userData.shelfCat as number;
        break;
      }
    }

    const concreteHit = hits.find((h) => typeof h.object.userData.shelfCat !== 'number');
    if (this.carryingReserveKey) {
      return { ...empty, shelfCat: detectedShelfCat };
    }

    if (!concreteHit) {
      return { ...empty, shelfCat: detectedShelfCat };
    }

    if (concreteHit.object === this.chairRig.hitbox && concreteHit.distance < 3.2) {
      return { ...empty, chair: true, shelfCat: detectedShelfCat };
    }
    if (concreteHit.object === this.teaRig.hitbox && concreteHit.distance < 3.2) {
      return { ...empty, tea: true, shelfCat: detectedShelfCat };
    }
    if (concreteHit.object === this.ledgerRig.hitbox && concreteHit.distance < 3.2) {
      return { ...empty, ledger: true, shelfCat: detectedShelfCat };
    }
    if (concreteHit.object === this.radioRig.hitbox && concreteHit.distance < 3.2) {
      return { ...empty, radio: true, shelfCat: detectedShelfCat };
    }
    if (concreteHit.object === this.boardRig.hitbox && concreteHit.distance < 3.4) {
      return { ...empty, board: true, shelfCat: detectedShelfCat };
    }
    const hitStandId = concreteHit.object.userData.standId as StandId | undefined;
    if (hitStandId && concreteHit.distance < 3.5) {
      return { ...empty, standId: hitStandId, shelfCat: detectedShelfCat };
    }
    if (concreteHit.object === this.registerRig.hitbox && concreteHit.distance < 3.2) {
      return { ...empty, register: true, shelfCat: detectedShelfCat };
    }
    if (concreteHit.object === this.depotRig.hitbox && concreteHit.distance < 3.4) {
      return { ...empty, depot: true, shelfCat: detectedShelfCat };
    }
    if (concreteHit.object === this.streetStallRig.hitbox && concreteHit.distance < 3.6) {
      return { ...empty, stall: true, shelfCat: detectedShelfCat };
    }
    if (concreteHit.object === this.apprenticeRig.hitbox && concreteHit.distance < 3.6) {
      return { ...empty, apprentice: true, shelfCat: detectedShelfCat };
    }

    const box = concreteHit.object.userData.deliveryBox as DeliveryBoxEntity | undefined;
    if (box && concreteHit.distance < 3.4) {
      return { ...empty, box, shelfCat: detectedShelfCat };
    }

    const cust = concreteHit.object.userData.customerRef as ActiveCustomer | undefined;
    if (cust && concreteHit.distance < 4.8) {
      return { ...empty, customer: cust, shelfCat: detectedShelfCat };
    }

    const shelfItem = concreteHit.object.userData.shelfItem as ShelfItem | undefined;
    if (shelfItem && concreteHit.distance < 3.0) {
      return { ...empty, item: shelfItem, shelfCat: shelfItem.cat };
    }

    return { ...empty, shelfCat: detectedShelfCat };
  }

  private getFrontCustomer(): ActiveCustomer | null {
    const waiting = this.customers.filter((c) => c.state !== 'out');
    if (waiting.length === 0) return null;
    waiting.sort((a, b) => a.queueIndex - b.queueIndex);
    return waiting[0];
  }

  private isNearCustomer(c: ActiveCustomer): boolean {
    const pos = c.rig.group.position;
    if (pos.z > 5.0) return false;
    return Math.hypot(pos.x - this.player.x, pos.z - this.player.z) < 4.6;
  }

  private pickUpReserveCrate(): boolean {
    let pickedKey: string | null = null;
    for (const item of this.items) {
      if (item.locked || item.has) continue;
      const k = ITEM_KEY(item.cat, item.tier);
      if ((this.reserveStock[k] ?? 0) > 0) {
        pickedKey = k;
        break;
      }
    }
    if (!pickedKey) {
      for (const [k, qty] of Object.entries(this.reserveStock)) {
        if (qty > 0) {
          pickedKey = k;
          break;
        }
      }
    }
    if (!pickedKey) {
      this.sound.nope();
      this.floatMsg('Depoda taşınacak yedek ürün yok', 'bad');
      return false;
    }

    this.carryingReserveKey = pickedKey;
    const boxModel = createDeliveryBoxModel().group;
    boxModel.position.set(0.3, -0.34, -0.62);
    boxModel.scale.setScalar(0.65);
    this.trackRigResources(boxModel);
    this.carryModel = boxModel;
    this.camera.add(boxModel);
    this.sound.pick();
    const [cs, ts] = pickedKey.split('_');
    const name = CATEGORIES[Number(cs)]?.names[Number(ts) - 1] ?? 'ürün';
    this.floatMsg(`Depo sandığı alındı: ${name}`, 'ok');
    this.emitHud();
    return true;
  }

  private pickUpShelfItem(item: ShelfItem): void {
    if (this.isSeated) this.standUp();
    item.has = false;
    item.group.visible = false;
    this.carryingItems.push(item);
    this.handSwingTimer = 0.28;
    this.rebuildCarryVisual();
    this.sound.pick();
    this.shelfCleanliness[item.cat] = Math.max(0, (this.shelfCleanliness[item.cat] ?? 100) - 2);
    this.syncShelfDustVisuals();
    this.emitHud();
  }

  private performAction(ndc: THREE.Vector2): boolean {
    if (this.placementTarget !== null) {
      return this.confirmPlacement();
    }

    const {
      item,
      customer,
      chair,
      box,
      register,
      tea,
      ledger,
      depot,
      stall,
      apprentice,
      standId,
      radio,
      board,
      shelfCat,
    } = this.raycastTargets(ndc);

    // Carrying a reserve crate from Depo -> restock matching shelf
    if (this.carryingReserveKey) {
      const [cs, ts] = this.carryingReserveKey.split('_');
      const rCat = Number(cs);
      const rTier = Number(ts);
      if (shelfCat === rCat) {
        let placed = 0;
        let avail = this.reserveStock[this.carryingReserveKey] ?? 0;
        for (const it of this.items) {
          if (avail <= 0) break;
          if (it.cat === rCat && it.tier === rTier && !it.locked && !it.has) {
            it.has = true;
            it.group.visible = true;
            avail--;
            placed++;
          }
        }
        this.reserveStock[this.carryingReserveKey] = avail;
        if (this.carryModel) {
          this.camera.remove(this.carryModel);
        }
        this.carryModel = null;
        this.carryingReserveKey = null;
        this.syncDepotCrates();
        if (placed > 0) {
          this.sound.boxUnpack();
          this.floatMsg(`Rafa +${placed} ürün yerleştirildi`, 'ok');
        } else {
          this.sound.nope();
          this.floatMsg('Bu raf zaten dolu (Q: Sandığı bırak)', 'bad');
        }
        this.save();
        this.emitHud();
        return true;
      }
      this.floatMsg(`${CATEGORIES[rCat].name} rafına gidip tıkla/E bas`, 'bad');
      return false;
    }

    // If clicking another shelf item while capacity remains (Multi-carry)
    if (item && this.carryingItems.length < this.getCarryCapacity()) {
      this.pickUpShelfItem(item);
      return true;
    }

    // Clicking a service customer directly starts the workshop service
    if (customer && customer.state !== 'out' && customer.serviceType && this.isNearCustomer(customer)) {
      this.openServiceForCustomer(customer);
      return true;
    }

    // Holding one or more products
    if (this.carryingItems.length > 0) {
      const targetCust = customer ?? this.getFrontCustomer();
      if (!targetCust || !this.isNearCustomer(targetCust)) {
        this.floatMsg(
          targetCust ? 'Müşteriye veya tezgâha yaklaş' : 'Henüz müşteri yok',
          'bad',
        );
        return false;
      }

      if (targetCust.serviceType) {
        this.openServiceForCustomer(targetCust);
        return true;
      }

      const matchIdx = this.carryingItems.findIndex(
        (it) => it.cat === targetCust.cat && it.tier === targetCust.tier,
      );

      if (matchIdx >= 0) {
        const matchedItem = this.carryingItems[matchIdx];
        const sellPrice = this.getSellPrice(matchedItem.cat, matchedItem.tier);
        const suggested = getSuggestedPrice(matchedItem.cat, matchedItem.tier);
        const hagglePerk = 1 + (this.characterSkills.haggleMaster ?? 0) * 0.12;
        const tolerance = PERSONALITY_META[targetCust.personality].priceTolerance * hagglePerk;

        if (sellPrice > Math.round(suggested * tolerance * 1.12)) {
          this.sound.nope();
          matchedItem.has = true;
          matchedItem.group.visible = true;
          this.carryingItems.splice(matchIdx, 1);
          this.rebuildCarryVisual();
          this.dayCustomersLost += 1;
          this.daySatisfactionList.push(25);
          this.reputation = THREE.MathUtils.clamp(this.reputation - 2, 0, 100);
          targetCust.state = 'out';
          targetCust.path = [
            [0.35, 1.5],
            [0, 4.7],
            [0, 8.2],
          ];
          this.promoteQueue();
          this.setBubble(
            `Usta bu fiyat çok yüksek (${sellPrice} ₺)! Başka yere bakayım.`,
            undefined,
            2.8,
          );
          this.emitHud();
          return true;
        }

        const placed = matchedItem.group.clone();
        placed.visible = true;
        placed.position.set(1.48, 1.11, -3.22);
        placed.rotation.set(0, 0, 0);
        placed.scale.setScalar(1);
        this.scene.add(placed);
        window.setTimeout(() => {
          this.scene.remove(placed);
        }, 1800);

        const chosenCat = matchedItem.cat;
        const chosenTier = matchedItem.tier;
        const itemName = CATEGORIES[chosenCat].names[chosenTier - 1];
        this.carryingItems.splice(matchIdx, 1);
        this.rebuildCarryVisual();

        this.tryAutoFillOneFromReserve(chosenCat, chosenTier);

        const pMeta = PERSONALITY_META[targetCust.personality];
        const wantsHaggle =
          targetCust.personality === 'haggler' || (sellPrice >= 50 && Math.random() < 0.32);
        const haggleFloorBoost = (this.characterSkills.haggleMaster ?? 0) * 0.04;
        const initialOffer = Math.max(
          3,
          Math.round(
            sellPrice *
              ((targetCust.personality === 'haggler' ? 0.8 : 0.86) + haggleFloorBoost),
          ),
        );
        const canOfferVeresiye =
          targetCust.personality === 'neighbor' ||
          targetCust.personality === 'craftsman' ||
          targetCust.personality === 'clueless';
        const asksVeresiye =
          (targetCust.personality === 'neighbor' || targetCust.personality === 'craftsman') &&
          Math.random() < 0.35;

        const paidAmount = getCustomerPaymentBill(sellPrice);
        this.checkoutCat = chosenCat;
        this.checkoutTier = chosenTier;
        this.activeCheckout = {
          customerName: targetCust.personName,
          personality: targetCust.personality,
          personalityLabel: pMeta.label,
          itemName,
          stickerPrice: sellPrice,
          sellPrice,
          paidAmount,
          changeDue: paidAmount - sellPrice,
          wantsHaggle,
          initialOffer,
          asksVeresiye,
          canOfferVeresiye,
          trustLabel: pMeta.trustLabel,
        };
        this.checkoutCustomerId = targetCust.id;
        this.modal = 'checkout';
        this.clearKeys();
        this.safeExitPointerLock();
        this.sound.pick();
        this.emitHud();
        return true;
      }

      this.sound.nope();
      targetCust.firstTryClueless = false;
      this.setBubble(
        targetCust.personality === 'clueless'
          ? `Yok evladım o değil... Şu "${targetCust.itemName}" olacaktı galiba.`
          : `Yok usta, o değil. Bana ${targetCust.itemName} lazım.`,
        targetCust.text,
      );
      this.emitHud();
      return true;
    }

    // Empty hands interactions:
    if (standId) {
      this.openServiceStand(standId);
      return true;
    }
    if (radio) {
      this.cycleRadioStation();
      return true;
    }
    if (board) {
      this.toggleBulletinBoard();
      return true;
    }
    if (box) {
      this.openDeliveryBox(box);
      return true;
    }
    if (depot) {
      return this.pickUpReserveCrate();
    }
    if (stall || apprentice) {
      this.toggleShopDesigner();
      return true;
    }
    if (tea) {
      this.serveOrBrewTea();
      return true;
    }
    if (ledger) {
      this.toggleLedger();
      return true;
    }
    if (chair) {
      this.toggleSeat();
      return true;
    }
    if (register) {
      this.toggleWholesale();
      return true;
    }
    if (customer && customer.state !== 'out') {
      if (customer.serviceType && this.isNearCustomer(customer)) {
        this.openServiceForCustomer(customer);
      } else {
        const onShelf = this.items.filter(
          (it) => it.cat === customer.cat && it.tier === customer.tier && !it.locked && it.has,
        ).length;
        const inReserve = this.reserveStock[ITEM_KEY(customer.cat, customer.tier)] ?? 0;
        if (onShelf === 0 && inReserve === 0 && !customer.serviceType) {
          if (!customer.noticedOutOfStock) {
            customer.noticedOutOfStock = true;
            this.setBubble(
              customer.text,
              'Rafta kalmadı! B: Acil Sipariş · Tekrar tıkla: Kalmadı de',
            );
          } else {
            this.dayCustomersLost += 1;
            this.daySatisfactionList.push(45);
            this.reputation = THREE.MathUtils.clamp(this.reputation - 1, 0, 100);
            this.sound.nope();
            customer.state = 'out';
            customer.path = [
              [0.35, 1.5],
              [0, 4.7],
              [0, 8.2],
            ];
            this.promoteQueue();
            this.setBubble(
              `${customer.personName}: Sağlık olsun usta, başka zaman uğrarım.`,
              undefined,
              2.5,
            );
            this.floatMsg(`${customer.itemName} stokta yok (−1 İtibar)`, 'bad');
            this.save();
          }
        } else {
          this.setBubble(customer.text, customer.hint);
        }
        this.emitHud();
      }
      return true;
    }

    return false;
  }

  private tryAutoFillOneFromReserve(cat: number, tier: number): void {
    if (!this.ownedShelves[cat]) return;
    const key = ITEM_KEY(cat, tier);
    const avail = this.reserveStock[key] ?? 0;
    if (avail <= 0) return;
    for (const it of this.items) {
      if (it.cat === cat && it.tier === tier && !it.locked && !it.has) {
        it.has = true;
        it.group.visible = true;
        this.reserveStock[key] = avail - 1;
        this.syncDepotCrates();
        break;
      }
    }
  }

  public putBack(): void {
    if (this.carryingReserveKey) {
      if (this.carryModel) {
        this.camera.remove(this.carryModel);
      }
      this.carryingReserveKey = null;
      this.carryModel = null;
      this.sound.pick();
      this.floatMsg('Sandık depoya geri bırakıldı', 'ok');
      this.emitHud();
      return;
    }
    const last = this.carryingItems.pop();
    if (!last) return;
    last.has = true;
    last.group.visible = true;
    this.rebuildCarryVisual();
    this.sound.pick();
    this.emitHud();
  }

  // ---------- Customer Queue & Personalities ----------

  private pickPersonality(): CustomerPersonality {
    const r = Math.random();
    if (this.dailyEvent.id === 'renovation_boom' && r < 0.42) {
      return 'craftsman';
    }
    if (this.reputation >= 45) {
      if (r < 0.28) return 'neighbor';
      if (r < 0.52) return 'craftsman';
      if (r < 0.7) return 'clueless';
      if (r < 0.86) return 'haggler';
      return 'kid';
    }
    if (r < 0.25) return 'clueless';
    if (r < 0.45) return 'haggler';
    if (r < 0.68) return 'neighbor';
    if (r < 0.85) return 'craftsman';
    return 'kid';
  }

  private spawnCustomer(): void {
    const activeCount = this.customers.filter((c) => c.state !== 'out').length;
    if (activeCount >= QUEUE_SLOTS.length || this.isClosingTime()) return;

    const installedPairs: Array<{ cat: number; tier: number; onShelf: number }> = [];
    for (let c = 0; c < CATEGORIES.length; c++) {
      const lv = this.categoryLevels[c] ?? 0;
      if (lv <= 0 || !this.ownedShelves[c]) continue;
      for (let t = 1; t <= lv; t++) {
        const onShelf = this.items.filter(
          (it) => it.cat === c && it.tier === t && !it.locked && it.has,
        ).length;
        installedPairs.push({ cat: c, tier: t, onShelf });
      }
    }
    if (installedPairs.length === 0) return;

    const personality = this.pickPersonality();
    const meta = PERSONALITY_META[personality];
    const personName = meta.names[Math.floor(Math.random() * meta.names.length)];
    const queueIndex = activeCount;
    const slot = QUEUE_SLOTS[queueIndex];

    const rig = createCustomerModel(personality);
    this.trackRigResources(rig.group);
    rig.group.position.set(0, 0, 8.2);

    const servicePool: ServiceType[] = [];
    for (const spec of STAND_CATALOG) {
      if (this.ownedStands[spec.id] && this.standTransforms[spec.id]?.placed) {
        servicePool.push(...spec.services);
      }
    }

    // ~28% chance of craftsmanship service customer after first sale (only if a stand is placed!)
    const wantsService = servicePool.length > 0 && this.served >= 1 && Math.random() < 0.28;

    let cust: ActiveCustomer;
    if (wantsService) {
      const serviceType = servicePool[Math.floor(Math.random() * servicePool.length)];
      const custId = this.customerSeq++;
      const serviceOrder = this.buildServiceOrder(serviceType, {
        id: custId,
        rig,
        personality,
        personName,
        cat: -1,
        tier: 0,
        itemName: SERVICE_META[serviceType].shortLabel,
        state: 'in',
        queueIndex,
        path: [],
        text: '',
        hint: '',
        patience: meta.patienceSec + 12,
        maxPatience: meta.patienceSec + 12,
        waitElapsed: 0,
        firstTryClueless: false,
        teaServed: false,
        hasBag: false,
        nodTimer: 0,
      });

      cust = {
        id: custId,
        rig,
        personality,
        personName,
        cat: -1,
        tier: 0,
        itemName: SERVICE_META[serviceType].shortLabel,
        serviceType,
        serviceOrder,
        state: 'in',
        queueIndex,
        path: [[0, 4.7], [0.85, 2.2], slot],
        text: serviceOrder.promptText,
        hint: `Hizmet: ${serviceOrder.title} · Müşteriye tıkla veya H: Usta Tezgâhı`,
        patience: meta.patienceSec + 12,
        maxPatience: meta.patienceSec + 12,
        waitElapsed: 0,
        firstTryClueless: false,
        teaServed: false,
        hasBag: false,
        nodTimer: 0,
      };
    } else {
      let pool =
        this.served === 0
          ? installedPairs.filter((p) => p.onShelf > 0)
          : installedPairs;
      if (pool.length === 0) pool = installedPairs;

      if (this.streetStallUnlocked && Math.random() < 0.35) {
        const stallMatches = pool.filter((it) => it.cat === this.streetStallCat);
        if (stallMatches.length > 0) pool = stallMatches;
      } else if (personality === 'kid') {
        const cheap = pool.filter((it) => it.tier === 1);
        if (cheap.length > 0) pool = cheap;
      } else if (personality === 'craftsman') {
        const pro = pool.filter((it) => it.tier >= 2);
        if (pro.length > 0) pool = pro;
      }

      // Weighted pick influenced by weather, season, daily event, and whether item is stocked
      let totalW = 0;
      const weights = pool.map((it) => {
        let w = getWeatherSeasonWeight(it.cat, this.weather, this.season);
        if (this.dailyEvent.boostCats?.includes(it.cat)) {
          w += 1.8;
        }
        if (it.onShelf === 0) {
          w *= 0.42;
        }
        totalW += w;
        return w;
      });
      let rollW = Math.random() * totalW;
      let chosen = pool[0];
      for (let idx = 0; idx < pool.length; idx++) {
        rollW -= weights[idx];
        if (rollW <= 0) {
          chosen = pool[idx];
          break;
        }
      }
      const key = ITEM_KEY(chosen.cat, chosen.tier);
      const itemName = CATEGORIES[chosen.cat].names[chosen.tier - 1];
      const isOutOfStock =
        chosen.onShelf === 0 && (this.reserveStock[key] ?? 0) === 0;

      let text: string;
      let hint: string;
      if (personality === 'clueless') {
        const clues = VAGUE_CLUES[key] ?? [`Şu ${itemName} gibi bir şey vardı ya...`];
        text = clues[Math.floor(Math.random() * clues.length)];
        hint = isOutOfStock
          ? `Rafta ${itemName} kalmadı · B: Acil Kurye veya müşteriye tıkla`
          : 'Tarif edemeyen müşteri · İpucu: Doğru ürünü tahmin et!';
      } else if (personality === 'kid') {
        text = `Abi babam gönderdi, bir ${itemName} alacakmışım.`;
        hint = isOutOfStock
          ? `→ ${itemName} (Rafta kalmadı · B: Acil Kurye)`
          : `→ ${itemName}`;
      } else if (personality === 'craftsman') {
        text = `Kolay gelsin usta, şantiyeye bir ${itemName} sarar mısın?`;
        hint = isOutOfStock
          ? `→ ${itemName} (Rafta kalmadı · B: Acil Kurye)`
          : `→ ${itemName}`;
      } else if (personality === 'haggler') {
        text = `Selam usta, bir ${itemName} alayım ama fiyatta biraz ikram yaparsın artık.`;
        hint = isOutOfStock
          ? `→ ${itemName} (Rafta kalmadı · B: Acil Kurye)`
          : `→ ${itemName}`;
      } else {
        const tpl = REQUEST_TEMPLATES[Math.floor(Math.random() * REQUEST_TEMPLATES.length)];
        text = tpl.replace('%', itemName);
        hint = isOutOfStock
          ? `→ ${itemName} (Rafta kalmadı · B: Acil Kurye)`
          : `→ ${itemName}`;
      }

      cust = {
        id: this.customerSeq++,
        rig,
        personality,
        personName,
        cat: chosen.cat,
        tier: chosen.tier,
        itemName,
        state: 'in',
        queueIndex,
        path: [[0, 4.7], [0.85, 2.2], slot],
        text,
        hint,
        patience: meta.patienceSec,
        maxPatience: meta.patienceSec,
        waitElapsed: 0,
        firstTryClueless: true,
        teaServed: false,
        hasBag: false,
        nodTimer: 0,
      };
    }

    rig.hitbox.userData.customerRef = cust;
    this.scene.add(rig.group);
    this.customers.push(cust);
    this.sound.bell();

    if (queueIndex === 0) {
      this.setBubble(cust.text, cust.hint);
    }
    this.emitHud();
  }

  private promoteQueue(): void {
    const waiting = this.customers.filter((c) => c.state !== 'out');
    waiting.sort((a, b) => a.queueIndex - b.queueIndex);
    waiting.forEach((c, idx) => {
      c.queueIndex = idx;
      const slot = QUEUE_SLOTS[idx];
      if (c.state === 'wait') {
        c.state = 'in';
        c.path = [slot];
      } else if (c.path.length > 0) {
        c.path[c.path.length - 1] = slot;
      }
      if (idx === 0) {
        this.setBubble(c.text, c.hint);
      }
    });
  }

  private setBubble(text: string | null, hint?: string, autoClearSec = 0): void {
    if (!text) {
      this.bubble = null;
      this.bubbleClearTimer = 0;
    } else {
      const front = this.getFrontCustomer();
      this.bubble = {
        speaker: front ? front.personName : 'Müşteri',
        personalityLabel: front ? PERSONALITY_META[front.personality].label : '',
        text,
        hint,
        patienceRatio: front ? front.patience / front.maxPatience : undefined,
      };
      this.bubbleClearTimer = autoClearSec;
    }
  }

  private floatMsg(text: string, tone: 'gold' | 'ok' | 'bad'): void {
    this.callbacks.onFloatMessage({
      id: this.floatSeq++,
      text,
      tone,
    });
  }

  // ---------- Save & Load (v6 with v1-v5 migration) ----------

  public save(): void {
    if (this.noSaveOnUnload) return;
    try {
      const payload: SavePayloadV6 = {
        version: 6,
        day: this.day,
        dayMinutes: this.dayMinutes,
        money: this.money,
        creditDebt: this.creditDebt,
        reputation: this.reputation,
        points: this.points,
        pointProgress: this.pointProgress,
        served: this.served,
        servicesDone: this.servicesDone,
        expanded: this.expanded,
        teaServings: this.teaServings,
        levels: [...this.categoryLevels],
        ownedShelves: [...this.ownedShelves],
        characterSkills: { ...this.characterSkills },
        itemStock: this.items.map((it) => (it.has || this.carryingItems.includes(it) ? 1 : 0)),
        customPrices: { ...this.customPrices },
        reserveStock: { ...this.reserveStock },
        pendingOrders: { ...this.pendingOrders },
        veresiyeEntries: [...this.veresiyeEntries],
        decor: { ...this.decor },
        shelfPlacements: [...this.shelfPlacements],
        shelfTransforms: this.shelfTransforms.map((t) => ({ ...t })),
        unlockedStands: { ...this.unlockedStands },
        ownedStands: { ...this.ownedStands },
        standTransforms: {
          scale_repair: { ...this.standTransforms.scale_repair },
          cut_measure: { ...this.standTransforms.cut_measure },
          key_cut: { ...this.standTransforms.key_cut },
          paint_mix: { ...this.standTransforms.paint_mix },
        },
        shelfCleanliness: [...this.shelfCleanliness],
        shelfTidiness: [...this.shelfTidiness],
        streetStallUnlocked: this.streetStallUnlocked,
        streetStallCat: this.streetStallCat,
        apprentice: { ...this.apprentice },
        weather: this.weather,
        radioStation: this.radioStation,
        dailyEvent: this.dailyEvent,
        contracts: [...this.contracts],
        contractSeq: this.contractSeq,
        contractsDone: this.contractsDone,
        cleanStreak: this.cleanStreak,
        claimedMilestones: [...this.claimedMilestones],
        settings: { ...this.settings },
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors
    }
  }

  private applyCommonSaveFields(d: LegacySavePayload & { ownedShelves?: boolean[] }): void {
    if (typeof d.day === 'number') this.day = Math.max(1, d.day);
    if (typeof d.dayMinutes === 'number') this.dayMinutes = d.dayMinutes;
    if (typeof d.money === 'number') this.money = d.money;
    if (typeof d.creditDebt === 'number') this.creditDebt = d.creditDebt;
    if (typeof d.reputation === 'number') this.reputation = d.reputation;
    this.dayRepStart = this.reputation;
    if (typeof d.points === 'number') this.points = d.points;
    if (typeof d.served === 'number') this.served = d.served;
    if (typeof d.teaServings === 'number') {
      this.teaServings = THREE.MathUtils.clamp(d.teaServings, 0, MAX_TEA_SERVINGS);
    }
    if (Array.isArray(d.veresiyeEntries)) {
      this.veresiyeEntries = d.veresiyeEntries;
      const maxId = d.veresiyeEntries.reduce((m, e) => Math.max(m, e.id || 0), 0);
      this.veresiyeSeq = maxId + 1;
    }
    if (d.expanded) {
      this.expanded = true;
      this.applyExpansionVisuals();
    }
    if (Array.isArray(d.levels)) {
      d.levels.forEach((lv, i) => {
        if (i < CATEGORIES.length && typeof lv === 'number') {
          this.categoryLevels[i] = lv;
        }
      });
    }
    if (Array.isArray(d.ownedShelves)) {
      CATEGORIES.forEach((_, i) => {
        if (typeof d.ownedShelves?.[i] === 'boolean') {
          this.ownedShelves[i] = Boolean(d.ownedShelves[i]);
        }
      });
    } else if (Array.isArray(d.levels)) {
      // Migrate older saves seamlessly: any previously unlocked category keeps its installed shelf
      CATEGORIES.forEach((_, i) => {
        this.ownedShelves[i] = (this.categoryLevels[i] ?? 0) > 0;
      });
    }
    CATEGORIES.forEach((_, i) => this.applyCategoryLevel(i, false));

    if (Array.isArray(d.itemStock)) {
      this.items.forEach((it, idx) => {
        if (!it.locked && this.ownedShelves[it.cat] && typeof d.itemStock?.[idx] === 'number') {
          it.has = Boolean(d.itemStock[idx]);
          it.group.visible = it.has;
        } else {
          it.has = false;
          it.group.visible = false;
        }
      });
    }
    if (d.customPrices) {
      this.customPrices = { ...this.customPrices, ...d.customPrices };
    }
    if (d.reserveStock) {
      this.reserveStock = { ...d.reserveStock };
    }
    if (d.pendingOrders) {
      this.pendingOrders = { ...d.pendingOrders };
    }
    if (d.settings) {
      if (typeof d.settings.sensitivity === 'number') {
        this.settings.sensitivity = THREE.MathUtils.clamp(d.settings.sensitivity, 0.4, 2);
      }
      if (typeof d.settings.volume === 'number') {
        this.settings.volume = THREE.MathUtils.clamp(d.settings.volume, 0, 1);
      }
      if (d.settings.lookPreference === 'auto' || d.settings.lookPreference === 'drag') {
        this.settings.lookPreference = d.settings.lookPreference;
      }
    }
  }

  private applyV5Faz3Fields(d: Partial<SavePayloadV6>): void {
    if (d.decor) {
      this.decor = { ...createDefaultDecor(), ...d.decor };
    }
    if (Array.isArray(d.shelfPlacements)) {
      const merged = [...DEFAULT_SHELF_PLACEMENTS];
      d.shelfPlacements.forEach((slotId: number, idx: number) => {
        if (idx < CATEGORIES.length && typeof slotId === 'number') {
          merged[idx] = slotId;
        }
      });
      this.shelfPlacements = merged;
    }
    if (Array.isArray(d.shelfTransforms)) {
      const defaults = createDefaultShelfTransforms();
      this.shelfTransforms = CATEGORIES.map((_, idx) => {
        const saved = d.shelfTransforms?.[idx];
        if (saved && typeof saved.x === 'number' && typeof saved.z === 'number') {
          return {
            x: saved.x,
            z: saved.z,
            rotY: typeof saved.rotY === 'number' ? saved.rotY : 0,
            placed: typeof saved.placed === 'boolean' ? saved.placed : this.ownedShelves[idx],
          };
        }
        return defaults[idx];
      });
    } else {
      this.shelfTransforms = CATEGORIES.map((_, idx) => {
        const slot = SHELF_SLOTS[this.shelfPlacements[idx] ?? idx] ?? SHELF_SLOTS[0];
        return {
          x: slot.x,
          z: slot.z,
          rotY: slot.rotY,
          placed: Boolean(this.ownedShelves[idx]),
        };
      });
    }
    if (d.unlockedStands) {
      for (const spec of STAND_CATALOG) {
        if (typeof d.unlockedStands[spec.id] === 'boolean') {
          this.unlockedStands[spec.id] = Boolean(d.unlockedStands[spec.id]);
        }
      }
    }
    if (d.ownedStands) {
      for (const spec of STAND_CATALOG) {
        if (typeof d.ownedStands[spec.id] === 'boolean') {
          this.ownedStands[spec.id] = Boolean(d.ownedStands[spec.id]);
        }
      }
    }
    if (d.standTransforms) {
      const defStands = createDefaultStandTransforms();
      for (const spec of STAND_CATALOG) {
        const saved = d.standTransforms[spec.id];
        if (saved && typeof saved.x === 'number' && typeof saved.z === 'number') {
          this.standTransforms[spec.id] = {
            x: saved.x,
            z: saved.z,
            rotY: typeof saved.rotY === 'number' ? saved.rotY : 0,
            placed: Boolean(saved.placed),
          };
        } else {
          this.standTransforms[spec.id] = defStands[spec.id];
        }
      }
    }
    if (Array.isArray(d.shelfCleanliness)) {
      d.shelfCleanliness.forEach((val: number, idx: number) => {
        if (idx < CATEGORIES.length && typeof val === 'number') {
          this.shelfCleanliness[idx] = val;
        }
      });
    }
    if (Array.isArray(d.shelfTidiness)) {
      d.shelfTidiness.forEach((val: number, idx: number) => {
        if (idx < CATEGORIES.length && typeof val === 'number') {
          this.shelfTidiness[idx] = val;
        }
      });
    }
    if (typeof d.streetStallUnlocked === 'boolean') {
      this.streetStallUnlocked = d.streetStallUnlocked;
    }
    if (typeof d.streetStallCat === 'number') {
      this.streetStallCat = d.streetStallCat;
    }
    if (d.apprentice) {
      this.apprentice = { ...this.apprentice, ...d.apprentice };
      this.apprentice.nextXp = getApprenticeNextXp(this.apprentice.level);
    }
    CATEGORIES.forEach((_, i) => this.applyCategoryLevel(i, false));
  }

  private loadSave(): void {
    try {
      const rawV6 = localStorage.getItem(SAVE_KEY);
      if (rawV6) {
        const d = JSON.parse(rawV6) as Partial<SavePayloadV6>;
        this.applyCommonSaveFields(d);
        this.applyV5Faz3Fields(d);
        if (typeof d.pointProgress === 'number') {
          this.pointProgress = THREE.MathUtils.clamp(d.pointProgress, 0, POINT_STEP_TARGET - 1);
        }
        if (typeof d.servicesDone === 'number') {
          this.servicesDone = d.servicesDone;
        }
        if (d.characterSkills) {
          this.characterSkills = { ...this.characterSkills, ...d.characterSkills };
        }
        // Grant +1 starter stand point when migrating pre-stand-split v6 saves that already did services
        if (
          !d.unlockedStands &&
          this.servicesDone > 0 &&
          !Object.values(this.unlockedStands).some(Boolean)
        ) {
          this.points += 1;
        }
        if (d.weather === 'sunny' || d.weather === 'cloudy' || d.weather === 'rainy') {
          this.weather = d.weather;
        }
        if (
          d.radioStation === 'off' ||
          d.radioStation === 'turku' ||
          d.radioStation === 'fasil' ||
          d.radioStation === 'nostalji'
        ) {
          this.radioStation = d.radioStation;
        }
        if (d.dailyEvent && d.dailyEvent.id) {
          this.dailyEvent = d.dailyEvent;
        }
        if (Array.isArray(d.contracts)) {
          this.contracts = d.contracts;
        }
        if (typeof d.contractSeq === 'number') {
          this.contractSeq = Math.max(1, d.contractSeq);
        }
        if (typeof d.contractsDone === 'number') {
          this.contractsDone = Math.max(0, d.contractsDone);
        }
        if (typeof d.cleanStreak === 'number') {
          this.cleanStreak = Math.max(0, d.cleanStreak);
        }
        if (Array.isArray(d.claimedMilestones)) {
          this.claimedMilestones = [...d.claimedMilestones];
        }
        return;
      }

      const rawV5 = localStorage.getItem(SAVE_KEY_V5);
      if (rawV5) {
        const d = JSON.parse(rawV5) as Partial<SavePayloadV6>;
        this.applyCommonSaveFields(d);
        this.applyV5Faz3Fields(d);
        return;
      }

      const rawV4 = localStorage.getItem(SAVE_KEY_V4) || localStorage.getItem(SAVE_KEY_V3);
      if (rawV4) {
        this.applyCommonSaveFields(JSON.parse(rawV4) as LegacySavePayload);
        this.applyV5Faz3Fields({});
        return;
      }

      const rawV2 = localStorage.getItem(SAVE_KEY_V2);
      if (rawV2) {
        this.applyCommonSaveFields(JSON.parse(rawV2) as LegacySavePayload);
        this.applyV5Faz3Fields({});
        return;
      }

      const rawLegacy = localStorage.getItem(LEGACY_SAVE_KEY);
      if (rawLegacy) {
        const old = JSON.parse(rawLegacy) as {
          m?: number;
          p?: number;
          s?: number;
          x?: boolean;
          l?: number[];
          i?: number[];
        };
        this.applyCommonSaveFields({
          money: old.m,
          points: old.p,
          served: old.s,
          expanded: old.x,
          levels: old.l,
          itemStock: old.i,
        });
        this.applyV5Faz3Fields({});
      }
    } catch {
      // Ignore corrupt save data
    }
  }

  // ---------- Main Loop ----------

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      this.timeoutId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
      if (state === gl.UNSIGNALED) {
        this.timeoutId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.timeoutId = window.setTimeout(cb, 80);
      }
    };
    this.timeoutId = window.setTimeout(poll, 5);
  }

  private tick = (): void => {
    if (this.disposed) return;

    const dt = Math.min(0.05, this.clock.getDelta());
    this.totalTime += dt;

    if (this.isPlaying()) {
      if (this.dayMinutes < 20 * 60 + 30) {
        this.dayMinutes = Math.min(20 * 60 + 30, this.dayMinutes + dt * 3.2);
      }
      // Subtle daily shelf dust accumulation
      for (let i = 0; i < CATEGORIES.length; i++) {
        if ((this.categoryLevels[i] ?? 0) > 0 && this.ownedShelves[i] && this.shelfTransforms[i]?.placed) {
          this.shelfCleanliness[i] = Math.max(0, (this.shelfCleanliness[i] ?? 100) - dt * 0.22);
        }
      }
      this.syncShelfDustVisuals();
    }

    this.updatePlayer(dt);
    this.updateCustomers(dt);
    this.updateApprentice(dt);
    this.updateEnvironment(dt);

    if (this.isPlaying() && this.placementTarget !== null) {
      this.updatePlacementGhost();
    }

    if (this.bubbleClearTimer > 0) {
      this.bubbleClearTimer -= dt;
      if (this.bubbleClearTimer <= 0) {
        this.bubbleClearTimer = 0;
        const front = this.getFrontCustomer();
        if (front && front.state === 'wait') {
          this.setBubble(front.text, front.hint);
        } else {
          this.bubble = null;
        }
        this.emitHud();
      }
    }

    if (this.served > 0 && this.tipTimer > 0 && this.isPlaying()) {
      this.tipTimer -= dt;
    }

    if (this.totalTime - this.lastHoverCheck > 0.05) {
      this.lastHoverCheck = this.totalTime;
      const prevItem = this.hoveredItem;
      const prevCust = this.hoveredCustomer;
      const prevChair = this.hoveredChair;
      const prevBox = this.hoveredBox;
      const prevReg = this.hoveredRegister;
      const prevTea = this.hoveredTea;
      const prevLedger = this.hoveredLedger;
      const prevDepot = this.hoveredDepot;
      const prevStall = this.hoveredStall;
      const prevApp = this.hoveredApprentice;
      const prevStand = this.hoveredStandId;
      const prevRadio = this.hoveredRadio;
      const prevBoard = this.hoveredBoard;
      const prevShelf = this.hoveredShelfCat;

      if (this.isPlaying() && this.placementTarget === null) {
        const hit = this.raycastTargets(this.getActiveNdc());
        this.hoveredItem = hit.item;
        this.hoveredCustomer = hit.customer;
        this.hoveredChair = hit.chair;
        this.hoveredBox = hit.box;
        this.hoveredRegister = hit.register;
        this.hoveredTea = hit.tea;
        this.hoveredLedger = hit.ledger;
        this.hoveredDepot = hit.depot;
        this.hoveredStall = hit.stall;
        this.hoveredApprentice = hit.apprentice;
        this.hoveredStandId = hit.standId;
        this.hoveredRadio = hit.radio;
        this.hoveredBoard = hit.board;
        this.hoveredShelfCat = hit.shelfCat;
      } else {
        this.hoveredItem = null;
        this.hoveredCustomer = null;
        this.hoveredChair = false;
        this.hoveredBox = null;
        this.hoveredRegister = false;
        this.hoveredTea = false;
        this.hoveredLedger = false;
        this.hoveredDepot = false;
        this.hoveredStall = false;
        this.hoveredApprentice = false;
        this.hoveredStandId = null;
        this.hoveredRadio = false;
        this.hoveredBoard = false;
        this.hoveredShelfCat = null;
      }

      if (
        prevItem !== this.hoveredItem ||
        prevCust !== this.hoveredCustomer ||
        prevChair !== this.hoveredChair ||
        prevBox !== this.hoveredBox ||
        prevReg !== this.hoveredRegister ||
        prevTea !== this.hoveredTea ||
        prevLedger !== this.hoveredLedger ||
        prevDepot !== this.hoveredDepot ||
        prevStall !== this.hoveredStall ||
        prevApp !== this.hoveredApprentice ||
        prevStand !== this.hoveredStandId ||
        prevRadio !== this.hoveredRadio ||
        prevBoard !== this.hoveredBoard ||
        prevShelf !== this.hoveredShelfCat ||
        this.placementTarget !== null ||
        this.totalTime - this.lastHudEmit > 0.25
      ) {
        this.emitHud();
      }
    }

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private updatePlayer(dt: number): void {
    const playing = this.isPlaying();
    let moving = false;

    if (playing) {
      const forward =
        (this.keys.KeyW || this.keys.ArrowUp ? 1 : 0) -
        (this.keys.KeyS || this.keys.ArrowDown ? 1 : 0);
      const strafe =
        (this.keys.KeyD || this.keys.ArrowRight ? 1 : 0) -
        (this.keys.KeyA || this.keys.ArrowLeft ? 1 : 0);

      if (forward !== 0 || strafe !== 0) {
        if (this.isSeated) {
          this.standUp();
        }
        moving = true;
        this.moved = true;
        const len = Math.hypot(forward, strafe);
        const sprint = Boolean(this.keys.ShiftLeft || this.keys.ShiftRight);
        const walkMul = 1 + (this.characterSkills.fastWalk ?? 0) * 0.16;
        const speed = (sprint ? SPRINT_SPEED : WALK_SPEED) * walkMul * dt;
        const dx =
          ((-Math.sin(this.player.yaw) * forward + Math.cos(this.player.yaw) * strafe) / len) *
          speed;
        const dz =
          ((-Math.cos(this.player.yaw) * forward - Math.sin(this.player.yaw) * strafe) / len) *
          speed;

        if (!this.checkCollision(this.player.x + dx, this.player.z)) {
          this.player.x += dx;
        }
        if (!this.checkCollision(this.player.x, this.player.z + dz)) {
          this.player.z += dz;
        }

        this.bob += dt * (sprint ? 12.5 : 9.5);
        this.stepTimer -= dt;
        if (this.stepTimer <= 0) {
          this.sound.step();
          this.stepTimer = sprint ? 0.24 : 0.34;
        }
      }
    }

    const baseEyeY = this.isSeated ? 1.24 : 1.65;
    const targetY = baseEyeY + (moving && playing ? Math.sin(this.bob) * 0.032 : 0);
    this.camera.position.set(
      THREE.MathUtils.damp(this.camera.position.x, this.player.x, 14, dt),
      THREE.MathUtils.damp(this.camera.position.y, targetY, 12, dt),
      THREE.MathUtils.damp(this.camera.position.z, this.player.z, 14, dt),
    );
    this.camera.rotation.set(this.player.pitch, this.player.yaw, 0, 'YXZ');

    if (this.handSwingTimer > 0) {
      this.handSwingTimer = Math.max(0, this.handSwingTimer - dt);
    }

    if (this.carryModel) {
      const swingProgress = this.handSwingTimer > 0 ? Math.sin((this.handSwingTimer / 0.28) * Math.PI) : 0;
      const walkBob = moving && playing ? Math.sin(this.bob * 0.9) * 0.014 : 0;
      this.carryModel.position.y =
        Math.sin(this.totalTime * 2) * 0.006 + walkBob - swingProgress * 0.08;
      this.carryModel.position.z = -swingProgress * 0.1;
      this.carryModel.rotation.x = swingProgress * 0.14;
    }

    this.registerRig.drawer.position.z = THREE.MathUtils.damp(
      this.registerRig.drawer.position.z,
      -0.02 + this.drawerOpenTarget,
      14,
      dt,
    );
  }

  private updateApprentice(dt: number): void {
    if (!this.apprentice.hired) return;
    const g = this.apprenticeRig.group;
    const lv = this.apprentice.level;
    const walkSpeed = 1.05 + (lv - 1) * 0.14;

    if (this.isPlaying()) {
      this.apprenticeActionTimer -= dt;

      if (this.apprentice.task === 'idle') {
        this.apprenticeTarget = [2.6, -4.15];
      } else if (this.apprentice.task === 'cashier') {
        this.apprenticeTarget = [2.45, -4.08];
        if (this.apprenticeActionTimer <= 0) {
          const cd = Math.max(5.5, 10.5 - (lv - 1) * 0.9);
          this.apprenticeActionTimer = cd;
          const front = this.getFrontCustomer();
          const distToCounter = Math.hypot(g.position.x - 2.45, g.position.z - -4.08);
          const minWaitTime = Math.max(5.5, 9.0 - (lv - 1) * 0.7);
          if (
            front &&
            front.state === 'wait' &&
            !front.serviceType &&
            front.waitElapsed >= minWaitTime &&
            distToCounter < 0.8 &&
            this.checkoutCustomerId !== front.id
          ) {
            const shelfIt = this.items.find(
              (it) => it.cat === front.cat && it.tier === front.tier && it.has && !it.locked,
            );
            if (shelfIt) {
              shelfIt.has = false;
              shelfIt.group.visible = false;
              this.tryAutoFillOneFromReserve(front.cat, front.tier);
              const price = this.getSellPrice(front.cat, front.tier);
              this.money += price;
              this.creditDebt = this.money < 0 ? Math.abs(this.money) : 0;
              this.dayRevenue += price;
              this.dayCustomersServed += 1;
              this.served += 1;
              this.addPointProgress();

              this.drawerOpenTarget = -0.2;
              window.setTimeout(() => {
                if (!this.disposed) this.drawerOpenTarget = 0;
              }, 700);
              this.sound.coin();
              this.daySatisfactionList.push(74 + lv * 3);
              this.reputation = THREE.MathUtils.clamp(this.reputation + 1, 0, 100);
              this.floatMsg(`Çırak Yusuf sattı: +${price} ₺`, 'gold');
              this.grantApprenticeXp(1);

              front.hasBag = true;
              front.rig.bagGroup.visible = true;
              front.state = 'out';
              front.path = [
                [0.35, 1.5],
                [0, 4.7],
                [0, 8.2],
              ];
              this.promoteQueue();
              this.emitHud();
            }
          }
        }
      } else if (this.apprentice.task === 'restock') {
        const emptySlot = this.items.find(
          (it) =>
            !it.locked &&
            this.ownedShelves[it.cat] &&
            this.shelfTransforms[it.cat]?.placed &&
            !it.has &&
            (this.reserveStock[ITEM_KEY(it.cat, it.tier)] ?? 0) > 0,
        );
        if (emptySlot) {
          const tr = this.shelfTransforms[emptySlot.cat] ?? createDefaultShelfTransforms()[emptySlot.cat];
          const standX = tr.x + Math.cos(tr.rotY) * 0.95;
          const standZ = tr.z - Math.sin(tr.rotY) * 0.95;
          this.apprenticeTarget = [
            THREE.MathUtils.clamp(standX, -3.4, this.expanded ? 6.9 : 3.4),
            THREE.MathUtils.clamp(standZ, -4.9, 4.9),
          ];
          if (
            Math.hypot(g.position.x - this.apprenticeTarget[0], g.position.z - this.apprenticeTarget[1]) < 0.38 &&
            this.apprenticeActionTimer <= 0
          ) {
            const key = ITEM_KEY(emptySlot.cat, emptySlot.tier);
            const avail = this.reserveStock[key] ?? 0;
            if (avail > 0) {
              this.reserveStock[key] = avail - 1;
              emptySlot.has = true;
              emptySlot.group.visible = true;
              this.syncDepotCrates();
              this.sound.boxUnpack();
              this.floatMsg(
                `Yusuf rafa ${CATEGORIES[emptySlot.cat].names[emptySlot.tier - 1]} dizdi`,
                'ok',
              );
              this.grantApprenticeXp(1);
              this.apprenticeActionTimer = Math.max(3.2, 6.5 - (lv - 1) * 0.6);
              this.emitHud();
            }
          }
        } else {
          this.apprenticeTarget = [2.6, -4.15];
        }
      } else if (this.apprentice.task === 'clean') {
        let dirtiestCat = -1;
        let lowestClean = 92;
        for (let i = 0; i < CATEGORIES.length; i++) {
          if (
            (this.categoryLevels[i] ?? 0) > 0 &&
            this.ownedShelves[i] &&
            this.shelfTransforms[i]?.placed &&
            (this.shelfCleanliness[i] ?? 100) < lowestClean
          ) {
            lowestClean = this.shelfCleanliness[i];
            dirtiestCat = i;
          }
        }
        if (dirtiestCat >= 0) {
          const tr = this.shelfTransforms[dirtiestCat] ?? createDefaultShelfTransforms()[dirtiestCat];
          const standX = tr.x + Math.cos(tr.rotY) * 0.95;
          const standZ = tr.z - Math.sin(tr.rotY) * 0.95;
          this.apprenticeTarget = [
            THREE.MathUtils.clamp(standX, -3.4, this.expanded ? 6.9 : 3.4),
            THREE.MathUtils.clamp(standZ, -4.9, 4.9),
          ];
          if (
            Math.hypot(g.position.x - this.apprenticeTarget[0], g.position.z - this.apprenticeTarget[1]) < 0.38 &&
            this.apprenticeActionTimer <= 0
          ) {
            this.cleanShelf(dirtiestCat, true);
            this.floatMsg(`Yusuf ${CATEGORIES[dirtiestCat].name} rafını temizledi`, 'ok');
            this.grantApprenticeXp(1);
            this.apprenticeActionTimer = Math.max(3.5, 7.0 - (lv - 1) * 0.65);
            this.emitHud();
          }
        } else {
          this.apprenticeTarget = [2.6, -4.15];
        }
      }
    }

    // Move apprentice smoothly toward apprenticeTarget
    const dx = this.apprenticeTarget[0] - g.position.x;
    const dz = this.apprenticeTarget[1] - g.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 0.12) {
      const step = Math.min(dist, walkSpeed * dt);
      g.position.x += (dx / dist) * step;
      g.position.z += (dz / dist) * step;
      g.rotation.y = Math.atan2(dx, dz);
      const swing = Math.sin(this.totalTime * 8) * 0.45;
      this.apprenticeRig.legL.rotation.x = swing;
      this.apprenticeRig.legR.rotation.x = -swing;
      this.apprenticeRig.armL.rotation.x = -swing * 0.5;
      this.apprenticeRig.armR.rotation.x = swing * 0.5;
    } else {
      this.apprenticeRig.legL.rotation.x = 0;
      this.apprenticeRig.legR.rotation.x = 0;
      this.apprenticeRig.armL.rotation.x = 0;
      this.apprenticeRig.armR.rotation.x = 0;
      // Face shop floor (+Z) when idle/cashier
      g.rotation.y = 0;
    }
  }

  private updateCustomers(dt: number): void {
    if (this.isPlaying() && !this.isClosingTime()) {
      const activeCount = this.customers.filter((c) => c.state !== 'out').length;
      const maxQueue = this.reputation >= 50 ? 3 : 2;
      if (activeCount < maxQueue) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          this.spawnCustomer();
          const repFactor = Math.max(0.55, 1 - (this.reputation - 25) * 0.006);
          const stallFactor = this.streetStallUnlocked ? 0.82 : 1;
          this.spawnTimer = (4.5 + Math.random() * 3.5) * repFactor * stallFactor;
        }
      }
    }

    const toRemove: number[] = [];

    for (const c of this.customers) {
      const g = c.rig.group;
      if (c.state === 'in' || c.state === 'out') {
        const target = c.path[0];
        if (!target) {
          if (c.state === 'in') {
            c.state = 'wait';
            g.rotation.y = Math.PI;
            if (c.queueIndex === 0 && !this.bubble) {
              this.setBubble(c.text, c.hint);
            }
            this.emitHud();
          } else {
            this.scene.remove(g);
            toRemove.push(c.id);
          }
          continue;
        }

        const dx = target[0] - g.position.x;
        const dz = target[1] - g.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.08) {
          c.path.shift();
        } else {
          const moveStep = 1.6 * dt;
          g.position.x += (dx / dist) * moveStep;
          g.position.z += (dz / dist) * moveStep;
          g.rotation.y = Math.atan2(dx, dz);
          const swing = Math.sin(this.totalTime * 8 + c.id) * 0.55;
          c.rig.legL.rotation.x = swing;
          c.rig.legR.rotation.x = -swing;
          c.rig.armL.rotation.x = -swing * 0.6;
          c.rig.armR.rotation.x = swing * 0.6;
          g.position.y = Math.abs(Math.sin(this.totalTime * 8 + c.id)) * 0.03;
        }
      } else {
        c.rig.legL.rotation.x = 0;
        c.rig.legR.rotation.x = 0;
        c.rig.armL.rotation.x = 0;
        c.rig.armR.rotation.x = 0;
        g.position.y = 0;

        // Subtle head nod when receiving tea, otherwise gentle look-around while waiting
        if (c.nodTimer > 0) {
          c.nodTimer = Math.max(0, c.nodTimer - dt);
          c.rig.headGroup.rotation.x = Math.sin(c.nodTimer * 11) * 0.22;
          c.rig.headGroup.rotation.y = 0;
        } else {
          c.rig.headGroup.rotation.x = Math.sin(this.totalTime * 1.3 + c.id) * 0.04;
          c.rig.headGroup.rotation.y = Math.sin(this.totalTime * 0.85 + c.id * 2) * 0.18;
        }

        const angleToCounter = Math.atan2(1.85 - g.position.x, -3.3 - g.position.z);
        let angleDiff = (angleToCounter - g.rotation.y + Math.PI) % (Math.PI * 2);
        if (angleDiff < 0) angleDiff += Math.PI * 2;
        angleDiff -= Math.PI;
        g.rotation.y += angleDiff * (1 - Math.exp(-5 * dt));

        if (this.isPlaying() && this.checkoutCustomerId !== c.id) {
          c.waitElapsed += dt;
          c.patience -= dt;
          if (c.patience <= 0) {
            c.state = 'out';
            c.path = [
              [0.35, 1.5],
              [0, 4.7],
              [0, 8.2],
            ];
            this.dayCustomersLost += 1;
            this.daySatisfactionList.push(20);
            this.reputation = THREE.MathUtils.clamp(this.reputation - 4, 0, 100);
            this.sound.nope();
            this.floatMsg(`${c.personName} beklemekten vazgeçti`, 'bad');
            this.promoteQueue();
            this.emitHud();
          }
        }
      }
    }

    if (toRemove.length > 0) {
      this.customers = this.customers.filter((c) => !toRemove.includes(c.id));
      if (this.customers.length === 0 && !this.bubbleClearTimer) {
        this.bubble = null;
      }
      this.emitHud();
    } else if (this.bubble && this.bubbleClearTimer <= 0) {
      const front = this.getFrontCustomer();
      if (front) {
        this.bubble.patienceRatio = Math.max(0, front.patience / front.maxPatience);
      }
    }
  }

  private updateEnvironment(dt: number): void {
    const posAttr = this.dustPoints.geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] += Math.sin(this.totalTime + i) * 0.018 * dt;
      arr[i] += 0.024 * dt;
      if (arr[i] > 3.5) arr[i] = -3.5;
    }
    posAttr.needsUpdate = true;

    // Animated Wall Clock hands tracking in-game dayMinutes
    const hours = (this.dayMinutes / 60) % 12;
    const mins = this.dayMinutes % 60;
    this.clockRig.hourPivot.rotation.z = -(hours / 12) * Math.PI * 2;
    this.clockRig.minutePivot.rotation.z = -(mins / 60) * Math.PI * 2;

    // Rain particle fall & ambient rain audio
    if (this.weather === 'rainy') {
      const rAttr = this.rainPoints.geometry.attributes.position as THREE.BufferAttribute;
      const rArr = rAttr.array as Float32Array;
      for (let i = 0; i < rArr.length; i += 3) {
        rArr[i + 1] -= 9.5 * dt;
        rArr[i] -= 0.9 * dt;
        if (rArr[i + 1] < 0.05) {
          rArr[i + 1] = 8.8 + Math.random() * 1.2;
          rArr[i] = (Math.random() - 0.5) * 38;
        }
      }
      rAttr.needsUpdate = true;
      if (this.started) {
        const rainAudioStrength = this.player.z > 5.0 ? 0.95 : this.player.z > 1.0 ? 0.45 : 0.2;
        this.sound.setRainAmbience(rainAudioStrength);
      }
    } else {
      this.sound.setRainAmbience(0);
    }

    // Neighborhood Street Pedestrians strolling
    for (const p of this.pedestrians) {
      if (p.pauseTimer > 0) {
        p.pauseTimer -= dt;
        p.rig.legL.rotation.x = 0;
        p.rig.legR.rotation.x = 0;
        p.rig.armL.rotation.x = 0;
        p.rig.armR.rotation.x = 0;
        p.rig.group.position.y = 0;
        continue;
      }
      const x = p.rig.group.position.x + p.dir * p.speed * dt;
      if (x >= p.maxX) {
        p.rig.group.position.x = p.maxX;
        p.dir = -1;
        p.pauseTimer = 1.4 + Math.random() * 1.8;
      } else if (x <= p.minX) {
        p.rig.group.position.x = p.minX;
        p.dir = 1;
        p.pauseTimer = 1.4 + Math.random() * 1.8;
      } else {
        p.rig.group.position.x = x;
      }
      p.rig.group.rotation.y = p.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      const swing = Math.sin(this.totalTime * 6.5 + p.phase) * 0.48;
      p.rig.legL.rotation.x = swing;
      p.rig.legR.rotation.x = -swing;
      p.rig.armL.rotation.x = -swing * 0.55;
      p.rig.armR.rotation.x = swing * 0.55;
      p.rig.group.position.y = Math.abs(Math.sin(this.totalTime * 6.5 + p.phase)) * 0.024;
    }

    const tDay = THREE.MathUtils.clamp((this.dayMinutes - 480) / (12 * 60), 0, 1);
    const eveningFactor = THREE.MathUtils.smoothstep(tDay, 0.55, 1.0);
    const weatherDim = this.weather === 'rainy' ? 0.58 : this.weather === 'cloudy' ? 0.78 : 1.0;

    this.sunLight.color.copy(_morningSun).lerp(_eveningSun, eveningFactor);
    this.sunLight.intensity = (1.25 - eveningFactor * 0.7) * weatherDim;
    this.hemiLight.intensity = (0.65 - eveningFactor * 0.25) * (0.85 + weatherDim * 0.15);

    const streetMat = this.streetMesh.material as THREE.MeshBasicMaterial;
    const baseSky =
      this.weather === 'rainy'
        ? _rainSky
        : this.weather === 'cloudy'
          ? _cloudySky
          : _sunnySky;
    streetMat.color.copy(baseSky).lerp(_dayColor, eveningFactor * 0.78);

    this.streetLampLight.intensity = eveningFactor * 1.45;
    for (const l of this.extraStreetLights) {
      l.intensity = eveningFactor * 1.35;
    }
    this.streetLampGlowMat.emissiveIntensity = 0.1 + eveningFactor * 1.1;
    for (const wMat of this.oppWindowMats) {
      wMat.emissiveIntensity = 0.12 + eveningFactor * 0.85;
    }

    this.lampLight.intensity =
      1.25 +
      eveningFactor * 0.55 +
      (this.weather === 'rainy' ? 0.18 : 0) +
      Math.sin(this.totalTime * 23) * 0.012 +
      Math.sin(this.totalTime * 3.1) * 0.018;
  }

  private computePrompt(): {
    text: string | null;
    targetKind: HudSnapshot['targetKind'];
  } {
    if (!this.isPlaying()) return { text: null, targetKind: 'none' };

    if (this.placementTarget !== null) {
      return { text: null, targetKind: 'none' };
    }

    if (this.carryingReserveKey) {
      const [cs, ts] = this.carryingReserveKey.split('_');
      const rCat = Number(cs);
      const rTier = Number(ts);
      const itemName = CATEGORIES[rCat]?.names[rTier - 1] ?? 'ürün';
      if (this.hoveredShelfCat === rCat) {
        return {
          text: `Tıkla veya E: ${itemName} ürünlerini ${CATEGORIES[rCat].name} rafına yerleştir · Q: Bırak`,
          targetKind: 'item',
        };
      }
      return {
        text: `Elinde depo sandığı (${itemName}) · ${CATEGORIES[rCat].name} rafına git · Q: Bırak`,
        targetKind: 'depot',
      };
    }

    if (this.hoveredItem && this.carryingItems.length < this.getCarryCapacity()) {
      const name = CATEGORIES[this.hoveredItem.cat].names[this.hoveredItem.tier - 1];
      const price = this.getSellPrice(this.hoveredItem.cat, this.hoveredItem.tier);
      const clean = Math.round(this.shelfCleanliness[this.hoveredItem.cat] ?? 100);
      const cleanNote = clean < 92 ? ` · R: Sil (%${clean})` : '';
      const slotNote =
        this.carryingItems.length > 0
          ? ` (${this.carryingItems.length}/${this.getCarryCapacity()} elde)`
          : '';
      return {
        text: `Tıkla veya E: Al · ${name} · ${price} ₺${slotNote}${cleanNote} · T: Rafı Taşı`,
        targetKind: 'item',
      };
    }

    if (this.carryingItems.length > 0) {
      const carryLabels = this.carryingItems.map(
        (it) => CATEGORIES[it.cat].names[it.tier - 1],
      );
      const front = this.hoveredCustomer ?? this.getFrontCustomer();
      if (front && this.isNearCustomer(front)) {
        if (front.serviceType) {
          return {
            text: `Tıkla veya H: ${front.personName} · ${SERVICE_META[front.serviceType].title}`,
            targetKind: 'customer',
          };
        }
        const match = this.carryingItems.find(
          (it) => it.cat === front.cat && it.tier === front.tier,
        );
        if (match) {
          const price = this.getSellPrice(match.cat, match.tier);
          return {
            text: `Elinde: ${carryLabels.join(', ')} · Tıkla veya E: ${front.personName} müşterisine ver (${price} ₺) · Q: Geri koy`,
            targetKind: 'customer',
          };
        }
        return {
          text: `Elinde: ${carryLabels.join(', ')} · ${front.personName} "${front.itemName}" bekliyor · Q: Geri koy`,
          targetKind: 'customer',
        };
      }
      return {
        text: `Elinde (${this.carryingItems.length}/${this.getCarryCapacity()}): ${carryLabels.join(', ')} · ${front ? 'Müşteriye yaklaş ve tıkla' : 'Müşteri bekleniyor'} · Q: Geri koy`,
        targetKind: 'none',
      };
    }

    if (this.hoveredStandId) {
      const spec = STAND_CATALOG.find((s) => s.id === this.hoveredStandId);
      const serviceLabels = spec?.services.map((st) => SERVICE_META[st].shortLabel).join(' & ') ?? '';
      return {
        text: `Tıkla veya H: ${spec?.name ?? 'Hizmet Standı'} (${serviceLabels}) · T: Stantı Taşı`,
        targetKind: 'workbench',
      };
    }
    if (this.hoveredRadio) {
      const rLabel =
        RADIO_STATIONS.find((r) => r.id === this.radioStation)?.label ?? 'Kapalı';
      return {
        text: `Tıkla veya M: Dükkân Radyosu (${rLabel})`,
        targetKind: 'radio',
      };
    }
    if (this.hoveredBoard) {
      return {
        text: 'Tıkla veya N: Mahalle İlan Panosu (İhaleler · Bülten · Hedefler)',
        targetKind: 'board',
      };
    }
    if (this.hoveredBox) {
      return {
        text: `Tıkla veya E: Toptancı Kolisini Aç (${this.hoveredBox.totalUnits} ürün)`,
        targetKind: 'box',
      };
    }
    if (this.hoveredDepot) {
      return {
        text: 'Tıkla veya E: Depo Rafından Sandık Al',
        targetKind: 'depot',
      };
    }
    if (this.hoveredStall) {
      return {
        text: `Kapı Önü Tezgâhı (${CATEGORIES[this.streetStallCat].name}) · G veya Tıkla: Vitrin Değiştir`,
        targetKind: 'stall',
      };
    }
    if (this.hoveredApprentice) {
      return {
        text: `Çırak ${this.apprentice.name} (Sv.${this.apprentice.level}) · Tıkla veya G: Görev Ata`,
        targetKind: 'apprentice',
      };
    }
    if (this.hoveredTea) {
      return {
        text:
          this.teaServings > 0
            ? `Tıkla veya C: Müşteriye Çay İkram Et (${this.teaServings}/${MAX_TEA_SERVINGS} bardak)`
            : `Tıkla veya C: Yeni Çay Demle (${BREW_TEA_COST} ₺)`,
        targetKind: 'tea',
      };
    }
    if (this.hoveredLedger) {
      const ready = this.veresiyeEntries.filter((v) => v.status === 'ready_to_collect').length;
      return {
        text:
          ready > 0
            ? `Tıkla veya L: Veresiye Defteri (${ready} tahsilat hazır!)`
            : 'Tıkla veya L: Veresiye Defterini Aç',
        targetKind: 'ledger',
      };
    }
    if (this.hoveredChair) {
      return {
        text: this.isSeated ? 'E veya Space: Ayağa Kalk' : 'Tıkla veya E: Kasaya Otur',
        targetKind: 'chair',
      };
    }
    if (this.hoveredRegister) {
      return {
        text: 'Tıkla veya B: Toptancı Kataloğu & Raf Fiyatları',
        targetKind: 'register',
      };
    }
    if (this.hoveredShelfCat !== null) {
      const clean = Math.round(this.shelfCleanliness[this.hoveredShelfCat] ?? 100);
      if (clean < 95) {
        return {
          text: `R: ${CATEGORIES[this.hoveredShelfCat].name} rafını temizle (%${clean}) · T: Rafı Taşı`,
          targetKind: 'item',
        };
      }
      return {
        text: `${CATEGORIES[this.hoveredShelfCat].name} Rafı · T: Dükkânda Taşı`,
        targetKind: 'item',
      };
    }
    if (this.hoveredCustomer && this.hoveredCustomer.state !== 'out') {
      if (this.hoveredCustomer.serviceType) {
        return {
          text: `Tıkla veya H: ${this.hoveredCustomer.personName} · ${SERVICE_META[this.hoveredCustomer.serviceType].title}`,
          targetKind: 'customer',
        };
      }
      return {
        text: `${this.hoveredCustomer.personName} (${PERSONALITY_META[this.hoveredCustomer.personality].label})`,
        targetKind: 'customer',
      };
    }

    return { text: null, targetKind: 'none' };
  }

  private computeTip(): string | null {
    if (!this.isPlaying()) return null;
    if (this.deliveryBoxes.length > 0) {
      return 'Kapının yanında açılmayı bekleyen toptancı kolisi var!';
    }
    const readyVeresiye = this.veresiyeEntries.filter(
      (v) => v.status === 'ready_to_collect',
    ).length;
    if (readyVeresiye > 0) {
      return `Veresiye defterinde ${readyVeresiye} müşteriden tahsil edilecek ödeme hazır (L)!`;
    }
    const pendingShelfIdx = CATEGORIES.findIndex(
      (_, i) => (this.categoryLevels[i] ?? 0) > 0 && !this.ownedShelves[i],
    );
    if (pendingShelfIdx >= 0) {
      return `${CATEGORIES[pendingShelfIdx].name} izni açık! Dükkân (G) menüsünden boş raf alıp Toptancıdan (B) doldurabilirsin.`;
    }
    if (this.served === 0) {
      if (!this.moved) {
        return this.pointerLocked
          ? 'WASD ile yürü, kapıdan çıkıp mahalleyi gezebilir veya müşteriyi bekleyebilirsin.'
          : 'WASD ile yürü, sürükleyerek etrafa bak. G: Dükkân & Mağaza · B: Toptancı';
      }
      const front = this.getFrontCustomer();
      if (!front) {
        return 'Müşteri birazdan kapıdan girer. Raflara ve sol arka penceredeki Usta Tezgâhına göz at.';
      }
      if (this.carryingItems.length === 0) {
        return 'Müşterinin istediği ürünü raflardan bul, üzerine tıklayarak al.';
      }
      return 'Ürünü müşteriye götür, tıklayıp kasada poşetle ve para üstünü ver.';
    }
    if (this.tipTimer > 0) {
      return 'H: Usta Tezgâhı · G: Dükkân & Çırak · R: Raf Sil · C: Çay · L: Defter · F: Yetenek · B: Toptancı';
    }
    return null;
  }

  private emitHud(): void {
    this.lastHudEmit = this.totalTime;
    const stockSummary = CATEGORIES.map((c, idx) => {
      const unlocked = this.items.filter((it) => it.cat === idx && !it.locked);
      const available = unlocked.filter((it) => it.has);
      let reserveCount = 0;
      for (let t = 1; t <= (this.categoryLevels[idx] ?? 0); t++) {
        reserveCount += this.reserveStock[ITEM_KEY(idx, t)] ?? 0;
      }
      return {
        id: c.id,
        name: c.name,
        lv: this.categoryLevels[idx] ?? 0,
        availableCount: available.length,
        totalUnlocked: unlocked.length,
        reserveCount,
      };
    }).filter((s, idx) => s.lv > 0 && this.ownedShelves[idx]);

    const shelfStatuses = CATEGORIES.map((c, idx) => {
      const unlocked = this.items.filter((it) => it.cat === idx && !it.locked);
      const stockedCount = unlocked.filter((it) => it.has).length;
      const tr = this.shelfTransforms[idx] ?? createDefaultShelfTransforms()[idx];
      return {
        catIndex: idx,
        name: c.name,
        slotId: this.shelfPlacements[idx] ?? idx,
        placed: Boolean(this.ownedShelves[idx] && tr.placed),
        x: tr.x,
        z: tr.z,
        rotY: tr.rotY,
        cleanliness: Math.round(this.shelfCleanliness[idx] ?? 100),
        tidiness: Math.round(this.shelfTidiness[idx] ?? 100),
        stockedCount,
        totalSlots: unlocked.length,
      };
    });

    const standStatuses: StandStatusInfo[] = STAND_CATALOG.map((spec) => {
      const tr = this.standTransforms[spec.id] ?? { ...spec.defaultPos, placed: false };
      return {
        id: spec.id,
        name: spec.name,
        desc: spec.desc,
        pointCost: spec.pointCost,
        standCost: spec.standCost,
        permitUnlocked: Boolean(this.unlockedStands[spec.id]),
        owned: Boolean(this.ownedStands[spec.id]),
        placed: Boolean(this.ownedStands[spec.id] && tr.placed),
        x: tr.x,
        z: tr.z,
        rotY: tr.rotY,
        services: [...spec.services],
      };
    });

    let placementHud: PlacementHudState | null = null;
    if (this.placementTarget !== null) {
      const label =
        this.placementTarget.kind === 'shelf'
          ? `${CATEGORIES[this.placementTarget.catIndex].name} Rafı`
          : STAND_CATALOG.find((s) => s.id === (this.placementTarget as { kind: 'stand'; standId: StandId }).standId)?.name ?? 'Hizmet Standı';
      let rotDeg = Math.round(((this.placementRotY * 180) / Math.PI) % 360);
      if (rotDeg < 0) rotDeg += 360;
      placementHud = {
        active: true,
        kind: this.placementTarget.kind,
        label,
        valid: this.placementValid,
        reason: this.placementReason,
        rotDeg,
        canStow: Boolean(this.placementTarget.prev === null),
      };
    }

    const readyToCollectCount = this.veresiyeEntries.filter(
      (v) => v.status === 'ready_to_collect',
    ).length;
    const openVeresiyeTotal = this.veresiyeEntries
      .filter((v) => v.status === 'open' || v.status === 'ready_to_collect')
      .reduce((acc, v) => acc + v.amount, 0);
    const canServeTea = this.customers.some(
      (c) => c.state !== 'out' && c.rig.group.position.z < 5.2,
    );

    const { text: promptText, targetKind } = this.computePrompt();
    const effectiveMode = this.pointerLocked ? 'pointerlock' : 'drag';

    const carryingLabels = this.carryingItems.map(
      (it) => CATEGORIES[it.cat].names[it.tier - 1],
    );
    let carryingLabel: string | null = null;
    let carryingKind: HudSnapshot['carryingKind'] = 'none';
    if (this.carryingReserveKey) {
      const [cs, ts] = this.carryingReserveKey.split('_');
      carryingLabel = `Depo: ${CATEGORIES[Number(cs)]?.names[Number(ts) - 1] ?? ''}`;
      carryingKind = 'reserve_box';
    } else if (carryingLabels.length > 0) {
      carryingLabel = carryingLabels.join(' + ');
      carryingKind = 'item';
    }

      const milestones = this.getMilestones();
      const claimableMilestoneCount = milestones.filter((m) => m.completed && !m.claimed).length;
      const activeContractCount = this.contracts.filter(
        (c) => c.status === 'available' || c.status === 'accepted',
      ).length;
      const tierStockCounts: Record<string, number> = { ...this.reserveStock };
      for (const it of this.items) {
        if (!it.locked && it.has) {
          const k = ITEM_KEY(it.cat, it.tier);
          tierStockCounts[k] = (tierStockCounts[k] ?? 0) + 1;
        }
      }

      this.callbacks.onHudChange({
      started: this.started,
      modal: this.modal,
      pointerLocked: this.pointerLocked,
      effectiveMode,
      webglLost: this.webglLost,
      day: this.day,
      timeLabel: formatClock(this.dayMinutes),
      season: this.season,
      weather: this.weather,
      radioStation: this.radioStation,
      isClosingTime: this.isClosingTime(),
      canEndDay: this.canEndDay(),
      isSeated: this.isSeated,
      money: this.money,
      creditDebt: this.creditDebt,
      reputation: this.reputation,
      reputationTitle: getReputationTitle(this.reputation),
      points: this.points,
      pointProgress: this.pointProgress,
      pointStepTarget: POINT_STEP_TARGET,
      served: this.served,
      servicesDone: this.servicesDone,
      expanded: this.expanded,
      teaServings: this.teaServings,
      maxTeaServings: MAX_TEA_SERVINGS,
      canServeTea,
      veresiyeEntries: [...this.veresiyeEntries],
      readyToCollectCount,
      openVeresiyeTotal,
      categoryLevels: [...this.categoryLevels],
      ownedShelves: [...this.ownedShelves],
      characterSkills: { ...this.characterSkills },
      customPrices: { ...this.customPrices },
      reserveStock: { ...this.reserveStock },
      tierStockCounts,
      pendingOrders: { ...this.pendingOrders },
      pendingBoxCount: this.deliveryBoxes.length,
      market: this.market,
      stockSummary,
      decor: { ...this.decor },
      shelfPlacements: [...this.shelfPlacements],
      shelfStatuses,
      standStatuses,
      placement: placementHud,
      avgCleanliness: this.getAverageCleanliness(),
      streetStallUnlocked: this.streetStallUnlocked,
      streetStallCat: this.streetStallCat,
      apprentice: { ...this.apprentice },
      carryingLabel,
      carryingLabels,
      carryCapacity: this.getCarryCapacity(),
      carryingKind,
      carryingReserveKey: this.carryingReserveKey,
      hoveredShelfCat: this.hoveredShelfCat,
      hoveredShelfClean:
        this.hoveredShelfCat !== null
          ? Math.round(this.shelfCleanliness[this.hoveredShelfCat] ?? 100)
          : null,
      hoveredStandId: this.hoveredStandId,
      promptText,
      targetKind,
      tipText: this.computeTip(),
      bubble: this.bubble ? { ...this.bubble } : null,
      checkout: this.activeCheckout ? { ...this.activeCheckout } : null,
      activeService: this.activeService,
      daySummary: this.lastDaySummary ? { ...this.lastDaySummary } : null,
      queueCount: this.customers.filter((c) => c.state !== 'out').length,
      dailyEvent: this.dailyEvent,
      contracts: [...this.contracts],
      activeContractCount,
      milestones,
      claimableMilestoneCount,
      cleanStreak: this.cleanStreak,
      contractsDone: this.contractsDone,
    });
  }

  private handleResize(): void {
    const w = this.container.clientWidth || window.innerWidth;
    const h = Math.max(1, this.container.clientHeight || window.innerHeight);
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    window.clearTimeout(this.timeoutId);
    window.clearInterval(this.saveIntervalId);

    window.removeEventListener('resize', this.onResizeBound);
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('keyup', this.onKeyUpBound);
    document.removeEventListener('pointerlockchange', this.onPointerLockChangeBound);
    document.removeEventListener('pointerlockerror', this.onPointerLockErrorBound);
    this.renderer.domElement.removeEventListener('mousedown', this.onMouseDownBound);
    window.removeEventListener('mousemove', this.onMouseMoveBound);
    window.removeEventListener('mouseup', this.onMouseUpBound);
    this.renderer.domElement.removeEventListener('wheel', this.onWheelBound);
    this.renderer.domElement.removeEventListener('contextmenu', this.onContextMenuBound);
    window.removeEventListener('beforeunload', this.onBeforeUnloadBound);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLostBound);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.onContextRestoredBound);

    this.disposeGhost();

    this.safeExitPointerLock();
    this.sound.dispose();

    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
    for (const t of this.textures) t.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
