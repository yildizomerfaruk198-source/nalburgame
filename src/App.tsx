import { useEffect, useRef, useState } from 'react';
import { BulletinBoardModal } from './components/BulletinBoardModal';
import { CheckoutModal } from './components/CheckoutModal';
import { DaySummaryModal } from './components/DaySummaryModal';
import { GameHud } from './components/GameHud';
import { LedgerModal } from './components/LedgerModal';
import { PauseModal } from './components/PauseModal';
import { ServiceModal } from './components/ServiceModal';
import { ShopModal } from './components/ShopModal';
import { SkillTreeModal } from './components/SkillTreeModal';
import { StartOverlay } from './components/StartOverlay';
import { WholesaleModal } from './components/WholesaleModal';
import { NalburEngine } from './game/NalburEngine';
import {
  APPRENTICE_BASE_WAGE,
  CATEGORIES,
  DEFAULT_SHELF_PLACEMENTS,
  LEGACY_SAVE_KEY,
  MAX_TEA_SERVINGS,
  NEIGHBORHOOD_EVENTS,
  POINT_STEP_TARGET,
  SAVE_KEY,
  SAVE_KEY_V2,
  SAVE_KEY_V3,
  SAVE_KEY_V4,
  SAVE_KEY_V5,
  STARTING_MONEY,
  createDefaultDecor,
  getApprenticeNextXp,
} from './game/catalog';
import type { FloatingMessage, GameSettings, HudSnapshot } from './game/types';

const INITIAL_HUD: HudSnapshot = {
  started: false,
  modal: 'none',
  pointerLocked: false,
  effectiveMode: 'drag',
  webglLost: false,
  day: 1,
  timeLabel: '08:00',
  season: 'spring',
  weather: 'sunny',
  radioStation: 'off',
  isClosingTime: false,
  canEndDay: false,
  isSeated: false,
  money: STARTING_MONEY,
  creditDebt: 0,
  reputation: 25,
  reputationTitle: 'Yeni Esnaf',
  points: 0,
  pointProgress: 0,
  pointStepTarget: POINT_STEP_TARGET,
  served: 0,
  servicesDone: 0,
  expanded: false,
  teaServings: MAX_TEA_SERVINGS,
  maxTeaServings: MAX_TEA_SERVINGS,
  canServeTea: false,
  veresiyeEntries: [],
  readyToCollectCount: 0,
  openVeresiyeTotal: 0,
  categoryLevels: CATEGORIES.map((c) => c.initialLv),
  ownedShelves: CATEGORIES.map((c) => c.initialLv > 0),
  characterSkills: {
    fastWalk: 0,
    multiCarry: 0,
    haggleMaster: 0,
    fastCraft: 0,
  },
  customPrices: {},
  reserveStock: {},
  tierStockCounts: {},
  pendingOrders: {},
  pendingBoxCount: 0,
  market: [],
  stockSummary: [],
  decor: createDefaultDecor(),
  shelfPlacements: [...DEFAULT_SHELF_PLACEMENTS],
  shelfStatuses: [],
  avgCleanliness: 100,
  streetStallUnlocked: false,
  streetStallCat: 0,
  apprentice: {
    hired: false,
    name: 'Yusuf',
    task: 'restock',
    level: 1,
    xp: 0,
    nextXp: getApprenticeNextXp(1),
    dailyWage: APPRENTICE_BASE_WAGE,
    tasksDone: 0,
  },
  carryingLabel: null,
  carryingLabels: [],
  carryCapacity: 1,
  carryingKind: 'none',
  carryingReserveKey: null,
  hoveredShelfCat: null,
  hoveredShelfClean: null,
  promptText: null,
  targetKind: 'none',
  tipText: null,
  bubble: null,
  checkout: null,
  activeService: null,
  daySummary: null,
  queueCount: 0,
  dailyEvent: NEIGHBORHOOD_EVENTS.calm,
  contracts: [],
  activeContractCount: 0,
  milestones: [],
  claimableMilestoneCount: 0,
  cleanStreak: 0,
  contractsDone: 0,
};

const INITIAL_SETTINGS: GameSettings = {
  sensitivity: 1,
  volume: 0.8,
  lookPreference: 'auto',
};

function detectSavedProgress(): boolean {
  try {
    return Boolean(
      localStorage.getItem(SAVE_KEY) ||
        localStorage.getItem(SAVE_KEY_V5) ||
        localStorage.getItem(SAVE_KEY_V4) ||
        localStorage.getItem(SAVE_KEY_V3) ||
        localStorage.getItem(SAVE_KEY_V2) ||
        localStorage.getItem(LEGACY_SAVE_KEY),
    );
  } catch {
    return false;
  }
}

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<NalburEngine | null>(null);

  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [settings, setSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  const [floats, setFloats] = useState<FloatingMessage[]>([]);
  const [hasSavedProgress] = useState<boolean>(() => detectSavedProgress());

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const engine = new NalburEngine(mountEl, {
      onHudChange: (snapshot) => {
        setHud(snapshot);
      },
      onFloatMessage: (msg) => {
        setFloats((prev) => [...prev.slice(-4), msg]);
        window.setTimeout(() => {
          setFloats((prev) => prev.filter((item) => item.id !== msg.id));
        }, 1500);
      },
      onSettingsChange: (nextSettings) => {
        setSettings(nextSettings);
      },
    });
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#18100a]">
      <div ref={canvasMountRef} className="h-full w-full" />

      <GameHud
        hud={hud}
        floats={floats}
        onOpenTree={() => engineRef.current?.toggleSkillTree()}
        onOpenWholesale={() => engineRef.current?.toggleWholesale()}
        onOpenLedger={() => engineRef.current?.toggleLedger()}
        onOpenShop={() => engineRef.current?.toggleShopDesigner()}
        onOpenBoard={() => engineRef.current?.toggleBulletinBoard()}
        onOpenService={() => engineRef.current?.openServiceWorkbench()}
        onCleanShelf={() => engineRef.current?.cleanHoveredOrNearestShelf()}
        onServeTea={() => engineRef.current?.serveOrBrewTea()}
        onPutBack={() => engineRef.current?.putBack()}
        onToggleSeat={() => engineRef.current?.toggleSeat()}
        onCycleRadio={() => engineRef.current?.cycleRadioStation()}
        onEndDay={() => engineRef.current?.endDay()}
        onToggleLookMode={() => engineRef.current?.toggleLookPreference()}
        onPause={() => engineRef.current?.openPause()}
      />

      {!hud.started && (
        <StartOverlay
          hasSavedProgress={hasSavedProgress}
          onStart={() => engineRef.current?.startGame()}
          onReset={() => engineRef.current?.resetGame()}
        />
      )}

      {hud.started && hud.modal === 'tree' && (
        <SkillTreeModal
          money={hud.money}
          points={hud.points}
          pointProgress={hud.pointProgress}
          expanded={hud.expanded}
          categoryLevels={hud.categoryLevels}
          ownedShelves={hud.ownedShelves}
          characterSkills={hud.characterSkills}
          onUnlockExpansion={() => engineRef.current?.unlockExpansion()}
          onUnlockTier={(catIdx, tier) =>
            engineRef.current?.unlockCategoryTier(catIdx, tier)
          }
          onUnlockCharacterSkill={(skillId) =>
            engineRef.current?.unlockCharacterSkill(skillId)
          }
          onOpenShop={() => engineRef.current?.toggleShopDesigner()}
          onClose={() => engineRef.current?.closeModal(true)}
        />
      )}

      {hud.started && hud.modal === 'wholesale' && (
        <WholesaleModal
          money={hud.money}
          categoryLevels={hud.categoryLevels}
          ownedShelves={hud.ownedShelves}
          market={hud.market}
          customPrices={hud.customPrices}
          reserveStock={hud.reserveStock}
          tierStockCounts={hud.tierStockCounts}
          pendingOrders={hud.pendingOrders}
          onPlaceOrder={(lines, urgent) =>
            engineRef.current?.placeWholesaleOrder(lines, urgent) ?? false
          }
          onSetPrice={(cat, tier, price) =>
            engineRef.current?.setCustomPrice(cat, tier, price)
          }
          onRefillFromReserve={() =>
            engineRef.current?.refillShelvesFromReserve()
          }
          onClose={() => engineRef.current?.closeModal(true)}
        />
      )}

      {hud.started && hud.modal === 'ledger' && (
        <LedgerModal
          day={hud.day}
          entries={hud.veresiyeEntries}
          openTotal={hud.openVeresiyeTotal}
          onCollect={(id) => engineRef.current?.collectVeresiye(id)}
          onWriteOff={(id) => engineRef.current?.writeOffVeresiye(id)}
          onClose={() => engineRef.current?.closeModal(true)}
        />
      )}

      {hud.started && hud.modal === 'shop' && (
        <ShopModal
          money={hud.money}
          expanded={hud.expanded}
          categoryLevels={hud.categoryLevels}
          ownedShelves={hud.ownedShelves}
          shelfPlacements={hud.shelfPlacements}
          shelfStatuses={hud.shelfStatuses}
          avgCleanliness={hud.avgCleanliness}
          decor={hud.decor}
          streetStallUnlocked={hud.streetStallUnlocked}
          streetStallCat={hud.streetStallCat}
          apprentice={hud.apprentice}
          onBuyShelf={(catIdx) => engineRef.current?.buyShelfUnit(catIdx)}
          onMoveShelf={(catIdx, slotId) =>
            engineRef.current?.moveShelfToSlot(catIdx, slotId)
          }
          onCleanShelf={(catIdx) => engineRef.current?.cleanShelf(catIdx)}
          onCleanAllShelves={() => engineRef.current?.cleanAllShelves()}
          onUnlockStreetStall={() => engineRef.current?.unlockStreetStall()}
          onSetStreetStallCategory={(catIdx) =>
            engineRef.current?.setStreetStallCategory(catIdx)
          }
          onSetShopName={(name) => engineRef.current?.setShopName(name)}
          onSelectSign={(id) => engineRef.current?.selectOrBuySignTheme(id)}
          onSelectWall={(id) => engineRef.current?.selectOrBuyWallTheme(id)}
          onSelectRug={(id) => engineRef.current?.selectOrBuyRugTheme(id)}
          onBuyPoster={(id) => engineRef.current?.buyPoster(id)}
          onBuyNazar={() => engineRef.current?.buyNazarCharm()}
          onHireApprentice={() => engineRef.current?.hireApprentice()}
          onSetApprenticeTask={(task) =>
            engineRef.current?.setApprenticeTask(task)
          }
          onClose={() => engineRef.current?.closeModal(true)}
        />
      )}

      {hud.started && hud.modal === 'board' && (
        <BulletinBoardModal
          day={hud.day}
          money={hud.money}
          points={hud.points}
          reputation={hud.reputation}
          dailyEvent={hud.dailyEvent}
          contracts={hud.contracts}
          milestones={hud.milestones}
          tierStockCounts={hud.tierStockCounts}
          cleanStreak={hud.cleanStreak}
          contractsDone={hud.contractsDone}
          onAcceptContract={(id) => engineRef.current?.acceptContract(id)}
          onDeliverContract={(id) => engineRef.current?.deliverContract(id)}
          onClaimMilestone={(id) => engineRef.current?.claimMilestone(id)}
          onClose={() => engineRef.current?.closeModal(true)}
        />
      )}

      {hud.started && hud.modal === 'service' && hud.activeService && (
        <ServiceModal
          order={hud.activeService}
          onPlaySound={(kind) => engineRef.current?.playServiceSound(kind)}
          onComplete={(success, bonusMul) =>
            engineRef.current?.completeServiceOrder(success, bonusMul)
          }
          onSwitchPractice={(type) =>
            engineRef.current?.switchPracticeService(type)
          }
          onClose={() => engineRef.current?.closeModal(true)}
        />
      )}

      {hud.started && hud.modal === 'checkout' && hud.checkout && (
        <CheckoutModal
          session={hud.checkout}
          onPlaySound={(kind) => engineRef.current?.playCheckoutSound(kind)}
          onResolveHaggle={(price) => engineRef.current?.resolveCheckoutHaggle(price)}
          onCancelHaggleWalkout={() =>
            engineRef.current?.cancelCheckoutHaggleWalkout()
          }
          onCompleteCash={(bagged, givenChange) =>
            engineRef.current?.completeCheckout(bagged, givenChange)
          }
          onCompleteVeresiye={(bagged) =>
            engineRef.current?.completeCheckoutAsVeresiye(bagged)
          }
        />
      )}

      {hud.started && hud.modal === 'daySummary' && hud.daySummary && (
        <DaySummaryModal
          summary={hud.daySummary}
          onStartNextDay={() => engineRef.current?.startNextDay()}
        />
      )}

      {hud.started && hud.modal === 'pause' && (
        <PauseModal
          settings={settings}
          onResume={() => engineRef.current?.resumeGame()}
          onSave={() => engineRef.current?.manualSave()}
          onReset={() => engineRef.current?.resetGame()}
          onSensitivityChange={(val) => engineRef.current?.setSensitivity(val)}
          onVolumeChange={(val) => engineRef.current?.setVolume(val)}
          onLookPreferenceChange={(pref) =>
            engineRef.current?.setLookPreference(pref)
          }
        />
      )}
    </div>
  );
}
