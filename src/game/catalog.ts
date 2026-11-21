import type {
  ApprenticeTask,
  BulkContract,
  BulkContractLine,
  CategoryConfig,
  CharacterSkillId,
  CustomerPersonality,
  MarketItemState,
  MilestoneGoalId,
  NeighborhoodEvent,
  NeighborhoodEventId,
  PlacedTransform,
  PosterId,
  RadioStationId,
  RugThemeId,
  SeasonId,
  ServiceType,
  ShelfSlotInfo,
  ShopDecorState,
  SignThemeId,
  StandId,
  WallThemeId,
  WeatherId,
} from './types';

export const SAVE_KEY = 'nalbur_save_v6';
export const SAVE_KEY_V5 = 'nalbur_save_v5';
export const SAVE_KEY_V4 = 'nalbur_save_v4';
export const SAVE_KEY_V3 = 'nalbur_save_v3';
export const SAVE_KEY_V2 = 'nalbur_save_v2';
export const LEGACY_SAVE_KEY = 'nalbur1';

export const WALK_SPEED = 3.8;
export const SPRINT_SPEED = 5.4;

export const STARTING_MONEY = 240;
export const EXPANSION_MONEY_COST = 420;
export const EXPANSION_POINT_COST = 2;
export const POINT_STEP_TARGET = 3; // 1 skill point every 3 satisfied sales or services
export const DAILY_RENT_BASE = 65;
export const DAILY_UTILITY_BASE = 25;
export const MAX_CREDIT_DEBT = 250;
export const MAX_TEA_SERVINGS = 4;
export const BREW_TEA_COST = 8;

export const STREET_STALL_COST = 180;
export const APPRENTICE_HIRE_COST = 120;
export const APPRENTICE_BASE_WAGE = 45;
export const NAZAR_CHARM_COST = 45;

export const TIER_MULTIPLIERS = [1, 1.6, 2.4] as const;

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 0,
    name: 'Vida & Cıvata',
    sign: 'VİDA & CIVATA',
    basePrice: 15,
    baseCost: 8,
    shelfCost: 0,
    names: ['vida kutusu', 'cıvata-somun seti', 'dübel seti'],
    initialLv: 1,
    requiresExpansion: false,
  },
  {
    id: 1,
    name: 'El Aleti',
    sign: 'EL ALETLERİ',
    basePrice: 60,
    baseCost: 34,
    shelfCost: 0,
    names: ['çekiç', 'pense', 'tornavida seti'],
    initialLv: 1,
    requiresExpansion: false,
  },
  {
    id: 2,
    name: 'Elektrik',
    sign: 'ELEKTRİK',
    basePrice: 25,
    baseCost: 14,
    shelfCost: 0,
    names: ['ampul', 'priz', 'uzatma kablosu'],
    initialLv: 1,
    requiresExpansion: false,
  },
  {
    id: 3,
    name: 'Boya',
    sign: 'BOYA',
    basePrice: 60,
    baseCost: 35,
    shelfCost: 115,
    names: ['iç cephe boyası', 'silikon ve tutkal', 'fırça ve rulo seti'],
    initialLv: 0,
    requiresExpansion: true,
  },
  {
    id: 4,
    name: 'Su Tesisatı',
    sign: 'SU TESİSATI',
    basePrice: 40,
    baseCost: 22,
    shelfCost: 110,
    names: ['musluk contası', 'boru ve rakor', 'lavabo bataryası'],
    initialLv: 0,
    requiresExpansion: true,
  },
  {
    id: 5,
    name: 'Bahçe',
    sign: 'BAHÇE',
    basePrice: 48,
    baseCost: 27,
    shelfCost: 90,
    names: ['budama makası', 'hortum başlığı', 'sulama bidonu'],
    initialLv: 0,
    requiresExpansion: false,
  },
  {
    id: 6,
    name: 'Kilit & Anahtar',
    sign: 'KİLİT & ANAHTAR',
    basePrice: 52,
    baseCost: 29,
    shelfCost: 120,
    names: ['asma kilit', 'kapı bareli', 'çelik zincir kilit'],
    initialLv: 0,
    requiresExpansion: true,
  },
  {
    id: 7,
    name: 'Yapı Malzemesi',
    sign: 'YAPI MALZEMESİ',
    basePrice: 56,
    baseCost: 31,
    shelfCost: 135,
    names: ['çelik mala', 'derz dolgu harcı', 'su terazisi'],
    initialLv: 0,
    requiresExpansion: true,
  },
  {
    id: 8,
    name: 'Temizlik & Kimyasal',
    sign: 'TEMİZLİK & KİMYA',
    basePrice: 36,
    baseCost: 20,
    shelfCost: 95,
    names: ['sentetik tiner', 'pas sökücü sprey', 'iş eldiveni ve maske'],
    initialLv: 0,
    requiresExpansion: true,
  },
];

// 10 modular shelf slots across Left Wall (4), Right Wall (2), and Expanded Depo Odası (4)
export const SHELF_SLOTS: ShelfSlotInfo[] = [
  { id: 0, label: 'Sol Duvar · Arka', x: -3.55, z: -3.3, rotY: 0, requiresExpansion: false },
  { id: 1, label: 'Sol Duvar · Orta-Arka', x: -3.55, z: -1.0, rotY: 0, requiresExpansion: false },
  { id: 2, label: 'Sol Duvar · Orta-Ön', x: -3.55, z: 1.3, rotY: 0, requiresExpansion: false },
  { id: 3, label: 'Sol Duvar · Ön', x: -3.55, z: 3.6, rotY: 0, requiresExpansion: false },
  { id: 4, label: 'Sağ Duvar · Orta', x: 3.55, z: 1.7, rotY: Math.PI, requiresExpansion: true },
  { id: 5, label: 'Sağ Duvar · Ön', x: 3.55, z: 4.05, rotY: Math.PI, requiresExpansion: true },
  { id: 6, label: 'Depo · Sağ Arka', x: 7.12, z: -3.4, rotY: Math.PI, requiresExpansion: true },
  { id: 7, label: 'Depo · Sağ Orta', x: 7.12, z: -1.1, rotY: Math.PI, requiresExpansion: true },
  { id: 8, label: 'Depo · Sağ Ön', x: 7.12, z: 1.2, rotY: Math.PI, requiresExpansion: true },
  { id: 9, label: 'Depo · İç Köşe', x: 4.68, z: 1.2, rotY: 0, requiresExpansion: true },
];

export const DEFAULT_SHELF_PLACEMENTS = [0, 1, 2, 4, 5, 3, 6, 7, 8];

export const STAND_CATALOG: Array<{
  id: StandId;
  name: string;
  shortName: string;
  sign: string;
  desc: string;
  pointCost: number;
  standCost: number;
  services: ServiceType[];
  halfW: number;
  halfD: number;
  defaultPos: { x: number; z: number; rotY: number };
}> = [
  {
    id: 'scale_repair',
    name: 'Tartı & Tamir Masası',
    shortName: 'Tartı & Tamir',
    sign: 'TARTI · TAMİR',
    desc: 'Hassas terazi ile gramajlı çivi/vida tartımı ve tamir reçetesi hizmeti sunar.',
    pointCost: 1,
    standCost: 85,
    services: ['scale_weigh', 'repair_advice'],
    halfW: 0.62,
    halfD: 0.4,
    defaultPos: { x: -2.4, z: -4.92, rotY: 0 },
  },
  {
    id: 'cut_measure',
    name: 'Kesim İstasyonu',
    shortName: 'Kesim Tezgâhı',
    sign: 'ÖLÇÜLÜ KESİM',
    desc: 'Bakır boru, tel ve ahşap çıtayı mengenede sabitleyip santimine göre keser.',
    pointCost: 1,
    standCost: 110,
    services: ['cut_measure'],
    halfW: 0.64,
    halfD: 0.4,
    defaultPos: { x: -1.0, z: -4.92, rotY: 0 },
  },
  {
    id: 'key_cut',
    name: 'Anahtar Çekme Tezgâhı',
    shortName: 'Anahtar Tezgâhı',
    sign: 'ANAHTAR ÇEKİM',
    desc: 'Pirinç taşlama çarkı ile ev ve asma kilit anahtarlarını birebir kopyalar.',
    pointCost: 2,
    standCost: 125,
    services: ['key_cut'],
    halfW: 0.58,
    halfD: 0.4,
    defaultPos: { x: 2.85, z: -1.2, rotY: -Math.PI / 2 },
  },
  {
    id: 'paint_mix',
    name: 'Boya Karıştırma Tezgâhı',
    shortName: 'Boya Mix Tezgâhı',
    sign: 'BOYA KARIŞIM',
    desc: 'Baz kovaya pigment damlaları ekleyip müşterinin istediği renk tonunu tutturur.',
    pointCost: 2,
    standCost: 135,
    services: ['paint_mix'],
    halfW: 0.62,
    halfD: 0.4,
    defaultPos: { x: 2.85, z: 0.4, rotY: -Math.PI / 2 },
  },
];

export function getStandForService(serviceType: ServiceType): StandId {
  for (const st of STAND_CATALOG) {
    if (st.services.includes(serviceType)) return st.id;
  }
  return 'scale_repair';
}

export function createDefaultShelfTransforms(): PlacedTransform[] {
  return CATEGORIES.map((cat, idx) => {
    const slotId = DEFAULT_SHELF_PLACEMENTS[idx] ?? idx;
    const slot = SHELF_SLOTS[slotId] ?? SHELF_SLOTS[0];
    return {
      x: slot.x,
      z: slot.z,
      rotY: slot.rotY,
      placed: cat.initialLv > 0,
    };
  });
}

export function createDefaultStandTransforms(): Record<StandId, PlacedTransform> {
  return {
    scale_repair: { ...STAND_CATALOG[0].defaultPos, placed: false },
    cut_measure: { ...STAND_CATALOG[1].defaultPos, placed: false },
    key_cut: { ...STAND_CATALOG[2].defaultPos, placed: false },
    paint_mix: { ...STAND_CATALOG[3].defaultPos, placed: false },
  };
}

export const CHARACTER_SKILLS: Array<{
  id: CharacterSkillId;
  name: string;
  maxLevel: number;
  levels: Array<{ label: string; desc: string; cost: number }>;
}> = [
  {
    id: 'fastWalk',
    name: 'Hızlı Adım',
    maxLevel: 2,
    levels: [
      { label: 'Seri Esnaf', desc: 'Dükkân ve sokakta %16 daha hızlı yürü', cost: 1 },
      { label: 'Çevik Usta', desc: 'Yürüme ve koşma hızı %32 artar', cost: 2 },
    ],
  },
  {
    id: 'multiCarry',
    name: 'Geniş Kucak',
    maxLevel: 2,
    levels: [
      { label: 'Çift El', desc: 'Aynı anda 2 ürünü birden taşıyabilirsin', cost: 1 },
      { label: 'Usta Taşıyıcı', desc: 'Aynı anda 3 ürünü birden taşıyabilirsin', cost: 2 },
    ],
  },
  {
    id: 'haggleMaster',
    name: 'Esnaf Dili',
    maxLevel: 2,
    levels: [
      { label: 'Tatlı Dil', desc: 'Müşteriler +%12 daha yüksek fiyatı kabullenir', cost: 1 },
      { label: 'Pazarlık Ustası', desc: 'Fiyat toleransı +%24 ve ilk teklifler daha iyi', cost: 2 },
    ],
  },
  {
    id: 'fastCraft',
    name: 'El Becerisi',
    maxLevel: 2,
    levels: [
      { label: 'Pratik Usta', desc: 'Hizmetlerde kolaylık ve +%15 işçilik geliri', cost: 1 },
      { label: 'Altın Bilezik', desc: 'Anahtar/kesim/tartı hedefi genişler, +%30 gelir', cost: 2 },
    ],
  },
];

export const SERVICE_META: Record<
  ServiceType,
  {
    title: string;
    shortLabel: string;
    baseReward: number;
    repBonus: number;
    desc: string;
  }
> = {
  key_cut: {
    title: 'Anahtar Kopyalama',
    shortLabel: 'Anahtar',
    baseReward: 38,
    repBonus: 2,
    desc: 'Müşterinin anahtar dişlerini makinede birebir kopyala.',
  },
  paint_mix: {
    title: 'Boya Karıştırma',
    shortLabel: 'Boya Mix',
    baseReward: 54,
    repBonus: 2,
    desc: 'İstenen renk tonunu pigment damlalarıyla tuttur.',
  },
  scale_weigh: {
    title: 'Tartıyla Çivi & Vida',
    shortLabel: 'Tartı',
    baseReward: 34,
    repBonus: 2,
    desc: 'Terazide istenen gramajı hassas şekilde tart.',
  },
  cut_measure: {
    title: 'Boru / Tel / Ahşap Kesim',
    shortLabel: 'Kesim',
    baseReward: 46,
    repBonus: 2,
    desc: 'Malzemeyi tam istenen ölçüde hizalayıp kes.',
  },
  repair_advice: {
    title: 'Küçük Tamir Tavsiyesi',
    shortLabel: 'Tavsiye',
    baseReward: 42,
    repBonus: 3,
    desc: 'Müşterinin evdeki arızasını dinleyip doğru malzeme öner.',
  },
};

export const PAINT_TARGETS: Array<{ name: string; rgb: [number, number, number] }> = [
  { name: 'Adaçayı Yeşili', rgb: [132, 168, 126] },
  { name: 'Sıcak Terrakota', rgb: [188, 102, 74] },
  { name: 'Deniz Feneri Mavisi', rgb: [82, 134, 178] },
  { name: 'Badem Sarısı', rgb: [228, 204, 132] },
  { name: 'Lavanta Grisi', rgb: [154, 146, 176] },
];

export const CUT_MATERIALS: Array<{ name: string; targets: number[] }> = [
  { name: 'Bakır Su Borusu', targets: [80, 120, 145] },
  { name: 'Galvaniz Bahçe Teli', targets: [95, 135, 160] },
  { name: 'Çam Ahşap Çıta', targets: [70, 110, 150] },
];

export interface RepairScenario {
  id: string;
  problem: string;
  symptom: string;
  primaryOptions: Array<{ label: string; correct: boolean }>;
  helperOptions: Array<{ label: string; correct: boolean }>;
  explanation: string;
}

export const REPAIR_SCENARIOS: RepairScenario[] = [
  {
    id: 'drip_faucet',
    problem: 'Mutfak musluğunu sonuna kadar sıkıyorum ama yine de şıp şıp damlatıyor usta.',
    symptom: 'Su vana tamamen kapalıyken bile ağız ucundan damlıyor; diş dibinden de hafif sızıntı var.',
    primaryOptions: [
      { label: 'Kauçuk Musluk Contası', correct: true },
      { label: 'Plastik Dübel Seti', correct: false },
      { label: 'Krom Duvar Prizi', correct: false },
    ],
    helperOptions: [
      { label: 'Dişlere Teflon Bant + Kurbağacıkla Sıkma', correct: true },
      { label: 'Zımpara Kâğıdı ile Boruyu Parlatma', correct: false },
      { label: 'Sentetik Tiner ile Dışını Silme', correct: false },
    ],
    explanation: 'Suyun kesilmemesinin sebebi ezilmiş iç contadır; conta yenilenip dişlere teflon bant sarılır.',
  },
  {
    id: 'loose_wall_anchor',
    problem: 'Beton duvara ağır kitaplık asacağım, vidayı sıkıyorum ama duvarın içinde boşa dönüyor.',
    symptom: 'Matkap deliği sıva ve betonda biraz geniş kalmış, vida diş tutmuyor.',
    primaryOptions: [
      { label: 'Uygun Çaplı Genişleyen Dübel', correct: true },
      { label: 'İnce Çelik Sıva Çivisi', correct: false },
      { label: 'Pirinç Rakor Parçası', correct: false },
    ],
    helperOptions: [
      { label: 'Tozu Üfleyip Dübele Tam Boy Uzun Vida Çakma', correct: true },
      { label: 'Deliğe Su Sıkıp Kurumasını Bekleme', correct: false },
      { label: 'Yalnızca Silikon Sürüp Bırakma', correct: false },
    ],
    explanation: 'Beton duvarda vida tek başına tutunamaz; deliğin tozunu alıp uygun dübel ve uzun vida kullanılmalıdır.',
  },
  {
    id: 'bath_mold',
    problem: 'Banyo küvetinin duvar birleşim yerinden aşağıya su sızıyor ve kararma yapmış.',
    symptom: 'Eski derz kenarı çatlamış, köşede nemden dolayı siyah küf lekeleri oluşmuş.',
    primaryOptions: [
      { label: 'Anti-Küf Banyo Silikonu', correct: true },
      { label: 'İç Cephe Plastik Boya', correct: false },
      { label: 'Galvaniz Bahçe Teli', correct: false },
    ],
    helperOptions: [
      { label: 'Eski Kalıntıyı Kazıyıp Yüzeyi Tam Kurutma', correct: true },
      { label: 'Islak Eski Silikonun Üstüne Direkt Çekme', correct: false },
      { label: 'Üzerine Cıvata-Somun Sabitleme', correct: false },
    ],
    explanation: 'Islak ve küflü tabakanın üstüne yeni silikon tutmaz; eski silikon kazınıp kurutulduktan sonra anti-küf silikon çekilir.',
  },
  {
    id: 'rust_hinge',
    problem: 'Bahçe demir kapısının menteşesi paslanmış, açarken hem gıcırdıyor hem de zor dönüyor.',
    symptom: 'Menteşe piminin etrafında kızıl pas birikintisi var ve kapı yarıda takılıyor.',
    primaryOptions: [
      { label: 'Pas Sökücü Sprey', correct: true },
      { label: 'Derz Dolgu Harcı', correct: false },
      { label: 'Porselen Kapı Bareli', correct: false },
    ],
    helperOptions: [
      { label: 'Tel Fırçayla Pası Temizleyip Pimi Yağlama', correct: true },
      { label: 'Menteşeyi Elektrik Bandıyla Sarma', correct: false },
      { label: 'Üstüne İnce Kat Su Bazlı Boya Sürme', correct: false },
    ],
    explanation: 'Pas sökücü sıkılıp 2 dakika beklenir, tel fırçayla pas temizlendikten sonra hareketli pim yağlanır.',
  },
  {
    id: 'crooked_shelf',
    problem: 'Salona iki metrelik ahşap raf takacağım ama göz kararı hep bir ucu aşağı sarkıyor.',
    symptom: 'Duvar zemini hafif eğimli olduğu için tabana göre ölçüm almak yanıltıcı oluyor.',
    primaryOptions: [
      { label: 'Su Terazisi', correct: true },
      { label: 'Budama Makası', correct: false },
      { label: 'Asma Kilit', correct: false },
    ],
    helperOptions: [
      { label: 'Kabarcığı Ortala + Kurşun Kalemle Delik İşaretle', correct: true },
      { label: 'Rafı Taktıktan Sonra Çekiçle Aşağı Vurma', correct: false },
      { label: 'Sadece Tek Vidayla Ortadan Asma', correct: false },
    ],
    explanation: 'Zemin eğimi gözü yanıltır; matkap öncesi su terazisiyle kabarcık ortalanıp kalemle işaretleme yapılmalıdır.',
  },
  {
    id: 'loose_outlet',
    problem: 'Oturma odasındaki duvar prizi yerinden gevşemiş, fiş çekerken komple dışarı geliyor.',
    symptom: 'Priz çerçevesi duvar kasasının içinde oynuyor, yan tırnaklar gevşemiş.',
    primaryOptions: [
      { label: 'Kontrol Kalemi & İzole Tornavida Seti', correct: true },
      { label: 'Çelik Sıva Malası', correct: false },
      { label: 'Hortum Bağlantı Başlığı', correct: false },
    ],
    helperOptions: [
      { label: 'Önce Sigortayı Kapat + Kasa Tırnak Vidalarını Sık', correct: true },
      { label: 'Elektrik Açıkken Kenarına Çivi Çakma', correct: false },
      { label: 'Prizin Üstünü Tinerle Silme', correct: false },
    ],
    explanation: 'Elektrik işinde ilk adım sigortayı indirmektir; ardından kontrol kalemiyle emin olup priz tırnakları sıkılır.',
  },
];

export const WALL_THEMES: Record<
  WallThemeId,
  { label: string; cost: number; topHex: string; bottomHex: string; stripeHex: string }
> = {
  classic: {
    label: 'Klasik Zeytin & Krem',
    cost: 0,
    topHex: '#e0cfa6',
    bottomHex: '#6c8264',
    stripeHex: '#4a5c44',
  },
  terracotta: {
    label: 'Sıcak Terrakota',
    cost: 85,
    topHex: '#ebd6ba',
    bottomHex: '#9c523b',
    stripeHex: '#6c3422',
  },
  slate: {
    label: 'Atölye Çelik Grisi',
    cost: 95,
    topHex: '#dce0df',
    bottomHex: '#4e5d6b',
    stripeHex: '#34404b',
  },
  cream: {
    label: 'Badem Sarısı & Ahşap',
    cost: 75,
    topHex: '#f1e4be',
    bottomHex: '#b38b52',
    stripeHex: '#7d5b2d',
  },
};

export const RUG_THEMES: Record<
  RugThemeId,
  { label: string; cost: number; primary: string; border: string; accent: string }
> = {
  kilim: {
    label: 'Anadolu Bordo Kilim',
    cost: 0,
    primary: '#7a3a2c',
    border: '#d6b26e',
    accent: '#4e2118',
  },
  navy: {
    label: 'Lacivert Motifli Halı',
    cost: 65,
    primary: '#263c5a',
    border: '#d8bc7c',
    accent: '#8f3b2e',
  },
  emerald: {
    label: 'Zümrüt Yün Halı',
    cost: 75,
    primary: '#2e5842',
    border: '#e0c078',
    accent: '#1d392a',
  },
  jute: {
    label: 'Doğal Hasır Dokuma',
    cost: 55,
    primary: '#b39567',
    border: '#6b4d2b',
    accent: '#8f7247',
  },
};

export const SIGN_THEMES: Record<
  SignThemeId,
  { label: string; cost: number; bgHex: string; borderHex: string; textHex: string }
> = {
  green: {
    label: 'Klasik Nalbur Yeşili',
    cost: 0,
    bgHex: '#274330',
    borderHex: '#d9b765',
    textHex: '#f5e6bd',
  },
  navy: {
    label: 'Usta Çelik Laciverti',
    cost: 70,
    bgHex: '#1f334d',
    borderHex: '#e2c275',
    textHex: '#f4ecd5',
  },
  copper: {
    label: 'Sıcak Bakır Ahşap',
    cost: 80,
    bgHex: '#59331c',
    borderHex: '#e5a852',
    textHex: '#fff0d0',
  },
  burgundy: {
    label: 'Bordo Esnaf',
    cost: 90,
    bgHex: '#5a2220',
    borderHex: '#e8c470',
    textHex: '#faeed2',
  },
};

export const POSTER_THEMES: Record<
  PosterId,
  { label: string; title: string; subtitle: string; cost: number; bgHex: string; inkHex: string }
> = {
  veresiye: {
    label: 'Esnaf Afişi',
    title: 'PEŞİN SATAN / VERESİYE',
    subtitle: 'Güven esastır, defter sağlamdır!',
    cost: 40,
    bgHex: '#f3e5c3',
    inkHex: '#3b2415',
  },
  kalite: {
    label: 'Usta İşi Afiş',
    title: 'USTA İŞİ SAĞLAM MALZEME',
    subtitle: 'Çividen bataryaya mahalle güvencesi',
    cost: 50,
    bgHex: '#253c4f',
    inkHex: '#f0dfba',
  },
  mahalle: {
    label: 'Mahalle Hatırası',
    title: '1998’DEN BERİ MAHALLEDE',
    subtitle: 'Bir çay içmeye her zaman bekleriz',
    cost: 60,
    bgHex: '#4f311c',
    inkHex: '#f5e4bc',
  },
};

export const APPRENTICE_TASK_META: Record<
  ApprenticeTask,
  { label: string; desc: string }
> = {
  restock: {
    label: 'Mal Dizme',
    desc: 'Depodan boş kalan rafları sırayla doldurur (çırak temposuyla).',
  },
  clean: {
    label: 'Temizlik & Düzen',
    desc: 'Tozlanan rafları silip ürünleri düzenler.',
  },
  cashier: {
    label: 'Kasaya Bakma',
    desc: 'Sen başka iş yaparken bekleyen müşterilerle yavaşça ilgilenir.',
  },
  idle: {
    label: 'Serbest / Bekle',
    desc: 'Tezgâh yanında bekler.',
  },
};

export function createDefaultDecor(): ShopDecorState {
  return {
    shopName: 'Mahalle Nalburu',
    signTheme: 'green',
    wallTheme: 'classic',
    rugTheme: 'kilim',
    unlockedSigns: ['green'],
    unlockedWalls: ['classic'],
    unlockedRugs: ['kilim'],
    posters: [],
    nazarCharm: false,
  };
}

export const ITEM_KEY = (cat: number, tier: number): string => `${cat}_${tier}`;

export function getApprenticeNextXp(level: number): number {
  const table = [12, 24, 40, 62, 999];
  return table[Math.max(0, Math.min(table.length - 1, level - 1))] ?? 999;
}

export const REQUEST_TEMPLATES = [
  'Selamün aleyküm usta, bir % lazımdı.',
  'Evde % bitti, bir tane alayım.',
  'Şu % vardı ya, onu verir misin?',
  'Komşu da buradan aldı, bana da bir % ver usta.',
];

export const TEA_REACTIONS = [
  'Ellerine sağlık usta, tavşan kanı olmuş!',
  'Tam vaktinde geldi vallahi, soğukta içim ısındı.',
  'Allah razı olsun usta, muhabbetin de çayın gibi demli.',
  'Şöyle sıcak bir çay olmadan mahalle esnafı dönmez zaten!',
];

export const VAGUE_CLUES: Record<string, string[]> = {
  '0_1': [
    'Abi şu ahşaba dönerek giren sivri şeylerden bir kutu verir misin?',
    'Raf gevşemiş, tornavidayla sıkılan küçük metal şeylerden lazım.',
  ],
  '0_2': [
    'İki demiri birbirine tutturan, arkasına da somun takılan setten vardı ya…',
    'Anahtarla sıkılan kalın vidalı somunlu takım hangisiydi usta?',
  ],
  '0_3': [
    'Duvara matkapla delik açınca içine plastik şey çakıyoruz ya, ondan lazım.',
    'Betona vida tutsun diye konulan plastik tıpalı setten verir misin?',
  ],
  '1_1': [
    'Şu elde tutulan, tak tak çivi çakan alet vardı ya… ondan.',
    'Duvara çivi çakacağım da, ağır kafalı bir şey lazım usta.',
  ],
  '1_2': [
    'Şu iki ağızlı, teli kesip somunu sıkan kıskaç gibi alet hangisi?',
    'Kablo soyup teli büken el aletinden lazım, adını unuttum.',
  ],
  '1_3': [
    'Düzü yıldızı bir arada olan, çevirmeli saplı takımdan verebilir misin?',
    'Prizin vidasını açacağım, ucu artı eksi olan setten lazım.',
  ],
  '2_1': [
    'Tavana takınca odayı aydınlatan şu cam armut gibi şeyden bir tane.',
    'Mutfak karanlık kaldı, duya çevrilip yakılan ışık şeyinden lazım.',
  ],
  '2_2': [
    'Duvara gömülen, fişi taktığımız iki delikli beyaz şeyden vardı ya…',
    'Fiş yuvası bozuldu, duvar tipi elektrik yuvası alayım.',
  ],
  '2_3': [
    'Yatağın yanına elektrik yetmiyor, ucunda çoklu kutusu olan uzun kablodan.',
    'Salondan balkona elektrik taşıyacak uzun seyyar kablodan lazım.',
  ],
  '3_1': [
    'Odanın duvarını baştan beyaza çevireceğim, büyük teneke kovadan alayım.',
    'Rulo ile duvara sürülen badana malzemesinden lazım usta.',
  ],
  '3_2': [
    'Küvetin kenarına sıkılan, kuruyunca lastik gibi olan tüp/yapıştırıcıdan.',
    'Kırılan tahtayı tutturup kenarları sızdırmaz yapan yapışkan setten.',
  ],
  '3_3': [
    'Duvarda gezdirip boyayı süren tüylü silindirle kestirme takımından.',
    'Badana yapacağız da sürmek için saplı rulo ve kıllı takım lazım.',
  ],
  '4_1': [
    'Musluk damlatıp duruyor, içine konan küçük siyah halka şeyden lazım.',
    'Çeşme şıp şıp akıyor, şu lastik sıkıştırma pulundan verir misin?',
  ],
  '4_2': [
    'Lavabonun altından su kaçıyor, birbirine vidalanan bakır/metal parçadan.',
    'İki su hattını bağlayan dirsekli dişli parçadan lazım usta.',
  ],
  '4_3': [
    'Eviyenin üstüne takılan, sıcak soğuk çevirmeli komple çeşmeden alayım.',
    'Mutfak tezgâhının musluğu kırıldı, krom kollu yeni başlık takımından.',
  ],
  '5_1': [
    'Bahçedeki gül dallarını keseceğim, şu yaylı el makasından alayım.',
    'Ağaç filizlerini budamak için kırmızı/yeşil saplı bahçe makası vardı ya…',
  ],
  '5_2': [
    'Hortumun ucuna takılınca suyu fıskiye gibi atan tabanca başlıktan lazım.',
    'Balkon hortumunun ucuna çevrilen sarı-yeşil ayarlı su başlığından.',
  ],
  '5_3': [
    'Saksılara su dökmek için şu uzun burunlu yeşil sulama kabından verir misin?',
    'Fidelere su vermek için tutma saplı büyük süzgeçli bidondan lazım.',
  ],
  '6_1': [
    'Kömürlük kapısına takılacak şu kalın sarı/pirinç kilitten bir tane.',
    'Anahtarla açılan U şekilli sağlam asma kilitten lazım usta.',
  ],
  '6_2': [
    'Dış kapının göbeği bozuldu, anahtar giren ortası vidalı mekanizmadan.',
    'Kapı kilidinin ortasına takılan şu pirinç silindir göbekten lazım.',
  ],
  '6_3': [
    'Bisikleti ya da bahçe demirini bağlayacak kılıflı kalın zincir kilitten.',
    'Bahçe kapısını sarmak için halkalı çelik zincir kilit setinden alayım.',
  ],
  '7_1': [
    'Duvara sıva atıp düzleştireceğim, şu tahta saplı üçgen demir aletten.',
    'Harç alıp duvara süren paslanmaz yassı sıva aletinden lazım.',
  ],
  '7_2': [
    'Fayansların arası açıldı, beyaz toz torbası olan dolgu malzemesinden.',
    'Banyo fayans arasına sürülen şu torbalı derz tozundan verir misin?',
  ],
  '7_3': [
    'Rafın düz durup durmadığını gösteren şu ortasında yeşil su kabarcığı olan cetvelden.',
    'İçinde baloncuk olan sarı alüminyum düzlük ölçerden lazım usta.',
  ],
  '8_1': [
    'Fırçadaki kurumuş boyayı çözen şu keskin kokulu teneke şişeden lazım.',
    'Yağlı boyayı inceltmek için teneke kutuda satılan çözücüden alayım.',
  ],
  '8_2': [
    'Kapı menteşesi kilitlendi, şu kırmızı ince pipetli yağlayıcı spreyden lazım.',
    'Sıkışan paslı vidaları gevşeten sprey tüpten bir tane verir misin?',
  ],
  '8_3': [
    'Tozlu iş yapacağım, ele takılan korumalı eldivenle ağız filtresinden.',
    'Tadilat sırasında el kesilmesin, toz da yutmayayım diye ikili koruma setinden.',
  ],
};

export const PERSONALITY_META: Record<
  CustomerPersonality,
  {
    label: string;
    names: string[];
    patienceSec: number;
    priceTolerance: number;
    repBonus: number;
    trustLabel: string;
  }
> = {
  clueless: {
    label: 'Tarif Edemeyen',
    names: ['Sevim Teyze', 'Fikri Abi', 'Hayriye Hanım', 'Mürsel Dayı'],
    patienceSec: 65,
    priceTolerance: 1.25,
    repBonus: 3,
    trustLabel: 'Tanıdık Müşteri',
  },
  haggler: {
    label: 'Pazarlıkçı',
    names: ['Turgut Bey', 'Naciye Abla', 'Kadir Esnaf', 'Rıza Emmi'],
    patienceSec: 54,
    priceTolerance: 1.14,
    repBonus: 2,
    trustLabel: 'Pazarlıkçı Esnaf',
  },
  neighbor: {
    label: 'Komşu',
    names: ['Muhtar Halil', 'Ayşe Komşu', 'İsmail Amca', 'Gülşen Teyze'],
    patienceSec: 72,
    priceTolerance: 1.22,
    repBonus: 3,
    trustLabel: 'Güvenilir Komşu',
  },
  craftsman: {
    label: 'Usta',
    names: ['Elektrikçi Zeki', 'Tesisatçı Bayram', 'Marangoz Kemal', 'Boyacı Cemil'],
    patienceSec: 58,
    priceTolerance: 1.3,
    repBonus: 3,
    trustLabel: 'Mahalle Ustası',
  },
  kid: {
    label: 'Çocuk',
    names: ['Küçük Mert', 'Aliş', 'Efe', 'Zeynep'],
    patienceSec: 46,
    priceTolerance: 1.18,
    repBonus: 2,
    trustLabel: 'Küçük Müşteri',
  },
};

export function getSuggestedPrice(catIndex: number, tier: number): number {
  const cat = CATEGORIES[catIndex];
  const mul = TIER_MULTIPLIERS[tier - 1] ?? 1;
  return Math.round(cat.basePrice * mul);
}

export function getBaseWholesaleCost(catIndex: number, tier: number): number {
  const cat = CATEGORIES[catIndex];
  const mul = TIER_MULTIPLIERS[tier - 1] ?? 1;
  return Math.round(cat.baseCost * mul);
}

// Rebalanced skill tier costs for Faz 4
export function getSkillCost(catIndex: number, tier: number): number {
  if (catIndex < 3) {
    return tier === 1 ? 0 : tier === 2 ? 1 : 2;
  }
  return tier === 1 ? 1 : 2;
}

export function getBulkDiscountRate(totalQty: number): number {
  if (totalQty >= 8) return 0.15;
  if (totalQty >= 4) return 0.1;
  return 0;
}

export function getReputationTitle(rep: number): string {
  if (rep >= 80) return 'Mahallenin Direği';
  if (rep >= 55) return 'Güvenilir Nalbur';
  if (rep >= 30) return 'Mahallenin Tanıdığı';
  return 'Yeni Esnaf';
}

export function generateDailyMarket(
  day: number,
  categoryLevels: number[],
  event?: NeighborhoodEvent,
): MarketItemState[] {
  const unlocked: Array<{ cat: number; tier: number }> = [];
  for (let c = 0; c < CATEGORIES.length; c++) {
    const lv = categoryLevels[c] ?? 0;
    for (let t = 1; t <= lv; t++) {
      unlocked.push({ cat: c, tier: t });
    }
  }

  const discountPick =
    unlocked.length > 0
      ? unlocked[(day * 3 + Math.floor(Math.random() * unlocked.length)) % unlocked.length]
      : null;
  const surgePick = unlocked.length > 2 ? unlocked[(day * 5 + 1) % unlocked.length] : null;
  const outPick =
    day >= 2 && unlocked.length > 3 ? unlocked[(day * 7 + 2) % unlocked.length] : null;

  const eventDiscounts =
    event?.id === 'wholesale_sale' ? new Set(event.discountCats ?? []) : null;

  const list: MarketItemState[] = [];
  for (let c = 0; c < CATEGORIES.length; c++) {
    for (let t = 1; t <= 3; t++) {
      const baseCost = getBaseWholesaleCost(c, t);
      let status: MarketItemState['status'] = 'normal';
      let unitCost = baseCost;

      if (outPick && outPick.cat === c && outPick.tier === t && !eventDiscounts?.has(c)) {
        status = 'out_of_stock';
      } else if (eventDiscounts?.has(c)) {
        status = 'discount';
        unitCost = Math.max(2, Math.round(baseCost * 0.75));
      } else if (discountPick && discountPick.cat === c && discountPick.tier === t) {
        status = 'discount';
        unitCost = Math.max(2, Math.round(baseCost * 0.8));
      } else if (surgePick && surgePick.cat === c && surgePick.tier === t) {
        status = 'surge';
        unitCost = Math.round(baseCost * 1.2);
      }

      list.push({
        cat: c,
        tier: t,
        unitCost,
        baseCost,
        status,
      });
    }
  }
  return list;
}

export function getCustomerPaymentBill(price: number): number {
  const bills = [10, 20, 50, 100, 200];
  if (Math.random() < 0.25) {
    return price;
  }
  const larger = bills.filter((b) => b >= price);
  if (larger.length === 0) return Math.ceil(price / 50) * 50;
  const pickIdx = Math.min(larger.length - 1, Math.random() < 0.7 ? 0 : 1);
  const chosen = larger[pickIdx];
  if (chosen === price && larger.length > 1) {
    return larger[1];
  }
  return chosen;
}

export const SEASON_ORDER: SeasonId[] = ['spring', 'summer', 'autumn', 'winter'];

export const SEASON_META: Record<
  SeasonId,
  { label: string; leafHex1: number; leafHex2: number }
> = {
  spring: { label: 'İlkbahar', leafHex1: 0x4b7c38, leafHex2: 0x679846 },
  summer: { label: 'Yaz', leafHex1: 0x3b662d, leafHex2: 0x4f7f38 },
  autumn: { label: 'Sonbahar', leafHex1: 0xb0632c, leafHex2: 0xc98a36 },
  winter: { label: 'Kış', leafHex1: 0x4c5d4c, leafHex2: 0x627262 },
};

export const WEATHER_META: Record<WeatherId, { label: string }> = {
  sunny: { label: 'Güneşli' },
  cloudy: { label: 'Bulutlu' },
  rainy: { label: 'Yağmurlu' },
};

export const RADIO_STATIONS: Array<{ id: RadioStationId; label: string }> = [
  { id: 'off', label: 'Kapalı' },
  { id: 'turku', label: 'Türkü FM' },
  { id: 'fasil', label: 'Fasıl FM' },
  { id: 'nostalji', label: 'Nostalji FM' },
];

export function getSeasonForDay(day: number): SeasonId {
  const idx = Math.floor(Math.max(0, day - 1) / 3) % SEASON_ORDER.length;
  return SEASON_ORDER[idx];
}

export function rollDailyWeather(day: number, season: SeasonId): WeatherId {
  if (day === 1) return 'sunny';
  const r = Math.random();
  if (season === 'summer') {
    if (r < 0.74) return 'sunny';
    if (r < 0.92) return 'cloudy';
    return 'rainy';
  }
  if (season === 'spring') {
    if (r < 0.5) return 'sunny';
    if (r < 0.76) return 'cloudy';
    return 'rainy';
  }
  if (season === 'autumn') {
    if (r < 0.34) return 'sunny';
    if (r < 0.66) return 'cloudy';
    return 'rainy';
  }
  // winter
  if (r < 0.25) return 'sunny';
  if (r < 0.62) return 'cloudy';
  return 'rainy';
}

export function getWeatherSeasonWeight(
  cat: number,
  weather: WeatherId,
  season: SeasonId,
): number {
  let weight = 1;
  if (weather === 'rainy') {
    if (cat === 3 || cat === 4 || cat === 8) weight += 1.4; // Boya/Silikon, Tesisat, Kimya
    if (cat === 5) weight *= 0.5;
  } else if (weather === 'sunny' && (season === 'spring' || season === 'summer')) {
    if (cat === 5 || cat === 3) weight += 1.3; // Bahçe, Boya
  }
  if (season === 'winter') {
    if (cat === 2 || cat === 6 || cat === 7) weight += 1.1; // Elektrik, Kilit, Yapı
  }
  return weight;
}

export const NEIGHBORHOOD_EVENTS: Record<NeighborhoodEventId, NeighborhoodEvent> = {
  calm: {
    id: 'calm',
    title: 'Sakin Mahalle Günü',
    summary: 'Mahallede olağan bir iş günü. Müşteriler sırayla dükkâna uğruyor.',
    effectLabel: 'Standart talep ve fiyatlar',
  },
  wholesale_sale: {
    id: 'wholesale_sale',
    title: 'Toptancı İndirim Günü',
    summary: 'Haldeki tedarikçiler bugün seçili ürün gruplarında özel kampanya başlattı.',
    effectLabel: 'Toptancıda seçili kategorilerde %25 alış indirimi',
  },
  renovation_boom: {
    id: 'renovation_boom',
    title: 'Mahalle Tadilat Haftası',
    summary: 'Sokaktaki iki apartmanda boya ve tesisat yenilemesi başladı, ustalar kapıda.',
    effectLabel: 'Boya, Tesisat & Yapı talebi artar · Daha sık usta müşteri',
    boostCats: [3, 4, 7],
  },
  power_outage: {
    id: 'power_outage',
    title: 'Sokakta Elektrik & Kilit Arızası',
    summary: 'Geceki dalgalanma sonrası apartmanlarda ampul, priz ve kilit ihtiyacı arttı.',
    effectLabel: 'Elektrik ve Kilit ürünlerine yoğun talep',
    boostCats: [2, 6],
  },
  garden_festival: {
    id: 'garden_festival',
    title: 'Mahalle Bahçe İmecesi',
    summary: 'Komşular avlu ve bahçe düzenlemesine girişti; temizlik ve bahçe ürünleri revaçta.',
    effectLabel: 'Bahçe ve Temizlik ürünlerine yoğun talep',
    boostCats: [5, 8],
  },
  inspection: {
    id: 'inspection',
    title: 'Belediye & Esnaf Denetimi',
    summary: 'Akşam kepenk kapanışında dükkân temizliği ve düzeni belediye ekibince incelenecek.',
    effectLabel: 'Gün sonu %88+ temizlik: +60 ₺ & +3 İtibar · %60 altı: −35 ₺',
  },
};

export function rollDailyEvent(
  day: number,
  categoryLevels: number[],
): NeighborhoodEvent {
  if (day <= 1) {
    return { ...NEIGHBORHOOD_EVENTS.calm };
  }

  const unlockedCats: number[] = [];
  for (let i = 0; i < CATEGORIES.length; i++) {
    if ((categoryLevels[i] ?? 0) > 0) unlockedCats.push(i);
  }

  // Periodic inspection every 4 days after day 3, otherwise roll among active neighborhood events
  const pool: NeighborhoodEventId[] = ['calm', 'wholesale_sale', 'power_outage'];
  if (unlockedCats.some((c) => c === 3 || c === 4 || c === 7)) {
    pool.push('renovation_boom');
  }
  if (unlockedCats.some((c) => c === 5 || c === 8)) {
    pool.push('garden_festival');
  }
  if (day >= 3 && (day % 4 === 0 || Math.random() < 0.22)) {
    pool.push('inspection');
  }

  const pickedId = pool[Math.floor(Math.random() * pool.length)];
  const base = NEIGHBORHOOD_EVENTS[pickedId];

  if (pickedId === 'wholesale_sale') {
    const shuffled = [...unlockedCats].sort(() => Math.random() - 0.5);
    const discountCats = shuffled.slice(0, Math.min(2, shuffled.length));
    const catNames = discountCats.map((c) => CATEGORIES[c].name).join(' ve ');
    return {
      ...base,
      discountCats,
      effectLabel: catNames
        ? `Toptancıda ${catNames} alışlarında %25 indirim`
        : base.effectLabel,
    };
  }

  return { ...base };
}

const CONTRACT_ISSUERS: Array<{
  issuer: string;
  issuerRole: string;
  titles: string[];
  desc: string;
}> = [
  {
    issuer: 'Müteahhit Ekrem',
    issuerRole: 'Şantiye Sorumlusu',
    titles: ['Blok Tadilat Paketi', 'İnce İşçilik Sevkiyatı'],
    desc: 'Arka sokaktaki apartman yenilemesi için toplu malzeme teslimatı bekleniyor.',
  },
  {
    issuer: 'Müdür Kemal',
    issuerRole: 'Mahalle İlkokulu',
    titles: ['Okul Bakım Onarım İhalesi', 'Sınıf Düzenleme Malzemesi'],
    desc: 'Okul koridorları ve derslik bakımı için eksiksiz parti malzeme gerekiyor.',
  },
  {
    issuer: 'Yönetici Fikriye',
    issuerRole: 'Çınar Apartmanı',
    titles: ['Apartman Ortak Alan Bakımı', 'Bina Demirbaş İhtiyacı'],
    desc: 'Apartman yönetimi ortak alan ve bodrum bakımı için toplu alım açtı.',
  },
  {
    issuer: 'Kahveci Salih',
    issuerRole: 'Mahalle Kıraathanesi',
    titles: ['Kıraathane Bahar Bakımı', 'Avlu ve Tezgâh Yenileme'],
    desc: 'Yan dükkândaki kıraathanenin sezonluk bakım malzemeleri toplanacak.',
  },
];

export function generateBulkContract(
  id: number,
  day: number,
  categoryLevels: number[],
): BulkContract | null {
  const unlockedItems: Array<{ cat: number; tier: number }> = [];
  for (let c = 0; c < CATEGORIES.length; c++) {
    const lv = categoryLevels[c] ?? 0;
    for (let t = 1; t <= lv; t++) {
      unlockedItems.push({ cat: c, tier: t });
    }
  }
  if (unlockedItems.length < 2) return null;

  const picked = [...unlockedItems]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(unlockedItems.length >= 4 ? 3 : 2, unlockedItems.length));

  const lines: BulkContractLine[] = picked.map((p) => ({
    cat: p.cat,
    tier: p.tier,
    qty: Math.min(4, 2 + Math.floor(Math.random() * (day >= 4 ? 3 : 2))),
  }));

  const retailSum = lines.reduce(
    (sum, line) => sum + getSuggestedPrice(line.cat, line.tier) * line.qty,
    0,
  );
  const rewardMoney = Math.round(retailSum * 1.38);
  const issuerSpec = CONTRACT_ISSUERS[(id + day) % CONTRACT_ISSUERS.length];
  const title = issuerSpec.titles[(id + Math.floor(Math.random() * 2)) % issuerSpec.titles.length];

  return {
    id,
    issuer: issuerSpec.issuer,
    issuerRole: issuerSpec.issuerRole,
    title,
    description: issuerSpec.desc,
    lines,
    rewardMoney,
    rewardPoints: 1,
    rewardRep: lines.length >= 3 ? 5 : 4,
    dueDay: day + 2,
    status: 'available',
  };
}

export const MILESTONE_CATALOG: Array<{
  id: MilestoneGoalId;
  title: string;
  desc: string;
  target: number;
  rewardMoney: number;
  rewardPoints: number;
  rewardRep: number;
  rewardText: string;
}> = [
  {
    id: 'first_5_sales',
    title: 'İlk Siftah Ustası',
    desc: 'Toplam 5 müşteri satışını veya hizmetini tamamla.',
    target: 5,
    rewardMoney: 45,
    rewardPoints: 0,
    rewardRep: 2,
    rewardText: '+45 ₺ · +2 İtibar',
  },
  {
    id: 'craftsman_5',
    title: 'Atölye Becerisi',
    desc: 'Usta tezgâhında 5 özel hizmet tamamla.',
    target: 5,
    rewardMoney: 75,
    rewardPoints: 0,
    rewardRep: 3,
    rewardText: '+75 ₺ · +3 İtibar',
  },
  {
    id: 'shop_expanded',
    title: 'Büyüyen Dükkân',
    desc: 'Yetenek ağacından dükkân ve depo genişlemesini aç.',
    target: 1,
    rewardMoney: 120,
    rewardPoints: 1,
    rewardRep: 3,
    rewardText: '+120 ₺ · +1 Puan · +3 İtibar',
  },
  {
    id: 'apprentice_lv2',
    title: 'Usta - Çırak Geleneği',
    desc: 'Çırak Yusuf’u işe al ve Seviye 2’ye ulaştır.',
    target: 2,
    rewardMoney: 90,
    rewardPoints: 0,
    rewardRep: 3,
    rewardText: '+90 ₺ · +3 İtibar',
  },
  {
    id: 'clean_streak_3',
    title: 'Pırıl Pırıl Tezgâh',
    desc: '3 gün üst üste %88+ ortalama temizlikle kepenk kapat.',
    target: 3,
    rewardMoney: 100,
    rewardPoints: 1,
    rewardRep: 4,
    rewardText: '+100 ₺ · +1 Puan · +4 İtibar',
  },
  {
    id: 'contracts_2',
    title: 'Müteahhit Tedarikçisi',
    desc: '2 adet mahalle toplu ihalesini eksiksiz teslim et.',
    target: 2,
    rewardMoney: 160,
    rewardPoints: 1,
    rewardRep: 4,
    rewardText: '+160 ₺ · +1 Puan · +4 İtibar',
  },
  {
    id: 'gold_reserve_1000',
    title: 'Sağlam Kasa',
    desc: 'Dükkân kasasında 1.000 ₺ nakit birikimine ulaş.',
    target: 1000,
    rewardMoney: 0,
    rewardPoints: 1,
    rewardRep: 5,
    rewardText: '+1 Puan · +5 İtibar',
  },
  {
    id: 'pillar_of_hood',
    title: 'Mahallenin Direği',
    desc: '80+ İtibara ulaş ve Sokak Tezgâhını aç.',
    target: 80,
    rewardMoney: 250,
    rewardPoints: 2,
    rewardRep: 5,
    rewardText: '+250 ₺ · +2 Puan · +5 İtibar',
  },
];


