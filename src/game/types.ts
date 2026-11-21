export type ModalType =
  | 'none'
  | 'tree'
  | 'pause'
  | 'wholesale'
  | 'checkout'
  | 'daySummary'
  | 'ledger'
  | 'shop'
  | 'service'
  | 'board';

export type LookPreference = 'auto' | 'drag';

export type CustomerPersonality =
  | 'clueless'
  | 'haggler'
  | 'neighbor'
  | 'craftsman'
  | 'kid';

export type WallThemeId = 'classic' | 'terracotta' | 'slate' | 'cream';
export type RugThemeId = 'kilim' | 'navy' | 'emerald' | 'jute';
export type SignThemeId = 'green' | 'navy' | 'copper' | 'burgundy';
export type PosterId = 'veresiye' | 'kalite' | 'mahalle';
export type ApprenticeTask = 'restock' | 'clean' | 'cashier' | 'idle';
export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';
export type WeatherId = 'sunny' | 'cloudy' | 'rainy';
export type RadioStationId = 'off' | 'turku' | 'fasil' | 'nostalji';
export type NeighborhoodEventId =
  | 'calm'
  | 'wholesale_sale'
  | 'renovation_boom'
  | 'power_outage'
  | 'garden_festival'
  | 'inspection';

export type MilestoneGoalId =
  | 'first_5_sales'
  | 'craftsman_5'
  | 'shop_expanded'
  | 'apprentice_lv2'
  | 'clean_streak_3'
  | 'contracts_2'
  | 'gold_reserve_1000'
  | 'pillar_of_hood';

export interface NeighborhoodEvent {
  id: NeighborhoodEventId;
  title: string;
  summary: string;
  effectLabel: string;
  discountCats?: number[];
  boostCats?: number[];
}

export interface BulkContractLine {
  cat: number;
  tier: number;
  qty: number;
}

export interface BulkContract {
  id: number;
  issuer: string;
  issuerRole: string;
  title: string;
  description: string;
  lines: BulkContractLine[];
  rewardMoney: number;
  rewardPoints: number;
  rewardRep: number;
  dueDay: number;
  status: 'available' | 'accepted' | 'completed' | 'expired';
}

export interface MilestoneGoalInfo {
  id: MilestoneGoalId;
  title: string;
  desc: string;
  rewardText: string;
  rewardMoney: number;
  rewardPoints: number;
  rewardRep: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
}

export type CharacterSkillId =
  | 'fastWalk'
  | 'multiCarry'
  | 'haggleMaster'
  | 'fastCraft';

export type ServiceType =
  | 'key_cut'
  | 'paint_mix'
  | 'scale_weigh'
  | 'cut_measure'
  | 'repair_advice';

export type StandId = 'scale_repair' | 'cut_measure' | 'key_cut' | 'paint_mix';

export interface PlacedTransform {
  x: number;
  z: number;
  rotY: number;
  placed: boolean;
}

export interface StandStatusInfo {
  id: StandId;
  name: string;
  desc: string;
  pointCost: number;
  standCost: number;
  permitUnlocked: boolean;
  owned: boolean;
  placed: boolean;
  x: number;
  z: number;
  rotY: number;
  services: ServiceType[];
}

export interface PlacementHudState {
  active: boolean;
  kind: 'shelf' | 'stand';
  label: string;
  valid: boolean;
  reason: string | null;
  rotDeg: number;
  canStow: boolean;
}

export interface ServiceOrder {
  mode: 'customer' | 'practice';
  customerId: number | null;
  customerName: string;
  personalityLabel: string;
  serviceType: ServiceType;
  title: string;
  promptText: string;
  rewardMoney: number;
  repBonus: number;
  // Service-specific payload
  keyTargetPins?: number[];
  paintTargetName?: string;
  paintTargetRgb?: [number, number, number];
  scaleItemName?: string;
  scaleTargetGrams?: number;
  cutMaterialName?: string;
  cutTargetCm?: number;
  repairScenarioId?: string;
  craftBonusRate: number;
  fastCraftLevel: number;
}

export interface ShopDecorState {
  shopName: string;
  signTheme: SignThemeId;
  wallTheme: WallThemeId;
  rugTheme: RugThemeId;
  unlockedSigns: SignThemeId[];
  unlockedWalls: WallThemeId[];
  unlockedRugs: RugThemeId[];
  posters: PosterId[];
  nazarCharm: boolean;
}

export interface ShelfSlotInfo {
  id: number;
  label: string;
  x: number;
  z: number;
  rotY: number;
  requiresExpansion: boolean;
}

export interface ShelfStatusInfo {
  catIndex: number;
  name: string;
  slotId: number;
  placed: boolean;
  x: number;
  z: number;
  rotY: number;
  cleanliness: number;
  tidiness: number;
  stockedCount: number;
  totalSlots: number;
}

export interface ApprenticeState {
  hired: boolean;
  name: string;
  task: ApprenticeTask;
  level: number;
  xp: number;
  nextXp: number;
  dailyWage: number;
  tasksDone: number;
}

export interface CategoryConfig {
  id: number;
  name: string;
  sign: string;
  basePrice: number;
  baseCost: number;
  shelfCost: number;
  names: [string, string, string];
  initialLv: number;
  requiresExpansion: boolean;
}

export interface StockSummary {
  id: number;
  name: string;
  lv: number;
  availableCount: number;
  totalUnlocked: number;
  reserveCount: number;
}

export interface FloatingMessage {
  id: number;
  text: string;
  tone: 'gold' | 'ok' | 'bad';
}

export interface SpeechBubble {
  speaker: string;
  personalityLabel: string;
  text: string;
  hint?: string;
  patienceRatio?: number;
}

export interface MarketItemState {
  cat: number;
  tier: number;
  unitCost: number;
  baseCost: number;
  status: 'normal' | 'discount' | 'surge' | 'out_of_stock';
}

export interface OrderCartLine {
  cat: number;
  tier: number;
  qty: number;
}

export interface VeresiyeEntry {
  id: number;
  customerName: string;
  personalityLabel: string;
  itemName: string;
  amount: number;
  dayWritten: number;
  dueDay: number;
  status: 'open' | 'ready_to_collect' | 'paid' | 'defaulted';
  trustLabel: string;
}

export interface CheckoutSession {
  customerName: string;
  personality: CustomerPersonality;
  personalityLabel: string;
  itemName: string;
  stickerPrice: number;
  sellPrice: number;
  paidAmount: number;
  changeDue: number;
  wantsHaggle: boolean;
  initialOffer: number;
  asksVeresiye: boolean;
  canOfferVeresiye: boolean;
  trustLabel: string;
}

export interface DaySummaryData {
  day: number;
  customersServed: number;
  customersLost: number;
  revenue: number;
  veresiyeCollected: number;
  veresiyeWritten: number;
  wholesaleSpent: number;
  rentCost: number;
  utilityCost: number;
  apprenticeWage: number;
  netProfit: number;
  satisfactionAvg: number;
  cleanlinessAvg: number;
  reputationDelta: number;
  reputationAfter: number;
  pendingDeliveryCount: number;
  readyToCollectCount: number;
  moneyAfter: number;
  creditDebt: number;
  season?: SeasonId;
  weather?: WeatherId;
  eventTitle?: string;
  eventOutcomeText?: string;
  eventDeltaMoney?: number;
  contractsCompletedToday?: number;
}

export interface HudSnapshot {
  started: boolean;
  modal: ModalType;
  pointerLocked: boolean;
  effectiveMode: 'pointerlock' | 'drag';
  webglLost: boolean;
  day: number;
  timeLabel: string;
  season: SeasonId;
  weather: WeatherId;
  radioStation: RadioStationId;
  isClosingTime: boolean;
  canEndDay: boolean;
  isSeated: boolean;
  money: number;
  creditDebt: number;
  reputation: number;
  reputationTitle: string;
  points: number;
  pointProgress: number;
  pointStepTarget: number;
  served: number;
  servicesDone: number;
  expanded: boolean;
  teaServings: number;
  maxTeaServings: number;
  canServeTea: boolean;
  veresiyeEntries: VeresiyeEntry[];
  readyToCollectCount: number;
  openVeresiyeTotal: number;
  categoryLevels: number[];
  ownedShelves: boolean[];
  characterSkills: Record<CharacterSkillId, number>;
  customPrices: Record<string, number>;
  reserveStock: Record<string, number>;
  tierStockCounts: Record<string, number>;
  pendingOrders: Record<string, number>;
  pendingBoxCount: number;
  market: MarketItemState[];
  stockSummary: StockSummary[];
  decor: ShopDecorState;
  shelfPlacements: number[];
  shelfStatuses: ShelfStatusInfo[];
  standStatuses: StandStatusInfo[];
  placement: PlacementHudState | null;
  avgCleanliness: number;
  streetStallUnlocked: boolean;
  streetStallCat: number;
  apprentice: ApprenticeState;
  carryingLabel: string | null;
  carryingLabels: string[];
  carryCapacity: number;
  carryingKind: 'none' | 'item' | 'reserve_box';
  carryingReserveKey: string | null;
  hoveredShelfCat: number | null;
  hoveredShelfClean: number | null;
  hoveredStandId: StandId | null;
  promptText: string | null;
  targetKind:
    | 'none'
    | 'item'
    | 'customer'
    | 'chair'
    | 'box'
    | 'register'
    | 'tea'
    | 'ledger'
    | 'depot'
    | 'stall'
    | 'apprentice'
    | 'workbench'
    | 'radio'
    | 'board';
  tipText: string | null;
  bubble: SpeechBubble | null;
  checkout: CheckoutSession | null;
  activeService: ServiceOrder | null;
  daySummary: DaySummaryData | null;
  queueCount: number;
  dailyEvent: NeighborhoodEvent;
  contracts: BulkContract[];
  activeContractCount: number;
  milestones: MilestoneGoalInfo[];
  claimableMilestoneCount: number;
  cleanStreak: number;
  contractsDone: number;
}

export interface GameSettings {
  sensitivity: number;
  volume: number;
  lookPreference: LookPreference;
}

export interface SavePayloadV6 {
  version: 6;
  day: number;
  dayMinutes: number;
  money: number;
  creditDebt: number;
  reputation: number;
  points: number;
  pointProgress: number;
  served: number;
  servicesDone: number;
  expanded: boolean;
  teaServings: number;
  levels: number[];
  ownedShelves?: boolean[];
  characterSkills: Record<CharacterSkillId, number>;
  itemStock: number[];
  customPrices: Record<string, number>;
  reserveStock: Record<string, number>;
  pendingOrders: Record<string, number>;
  veresiyeEntries: VeresiyeEntry[];
  decor: ShopDecorState;
  shelfPlacements: number[];
  shelfTransforms?: PlacedTransform[];
  unlockedStands?: Partial<Record<StandId, boolean>>;
  ownedStands?: Partial<Record<StandId, boolean>>;
  standTransforms?: Partial<Record<StandId, PlacedTransform>>;
  shelfCleanliness: number[];
  shelfTidiness: number[];
  streetStallUnlocked: boolean;
  streetStallCat: number;
  apprentice: ApprenticeState;
  weather?: WeatherId;
  radioStation?: RadioStationId;
  dailyEvent?: NeighborhoodEvent;
  contracts?: BulkContract[];
  contractSeq?: number;
  contractsDone?: number;
  cleanStreak?: number;
  claimedMilestones?: MilestoneGoalId[];
  settings?: Partial<GameSettings>;
}
