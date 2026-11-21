import type { FC } from 'react';
import {
  Armchair,
  BookOpen,
  ClipboardList,
  Cloud,
  CloudRain,
  Coffee,
  DoorClosed,
  MousePointerClick,
  Pause,
  Radio,
  RotateCcw,
  ShoppingCart,
  Sparkles,
  Store,
  Sun,
  TreePine,
  Wrench,
} from 'lucide-react';
import {
  APPRENTICE_TASK_META,
  BREW_TEA_COST,
  RADIO_STATIONS,
  SEASON_META,
  WEATHER_META,
} from '../game/catalog';
import type { FloatingMessage, HudSnapshot } from '../game/types';

interface GameHudProps {
  hud: HudSnapshot;
  floats: FloatingMessage[];
  onOpenTree: () => void;
  onOpenWholesale: () => void;
  onOpenLedger: () => void;
  onOpenShop: () => void;
  onOpenBoard: () => void;
  onOpenService: () => void;
  onCleanShelf: () => void;
  onServeTea: () => void;
  onPutBack: () => void;
  onToggleSeat: () => void;
  onCycleRadio: () => void;
  onEndDay: () => void;
  onToggleLookMode: () => void;
  onPause: () => void;
}

export const GameHud: FC<GameHudProps> = ({
  hud,
  floats,
  onOpenTree,
  onOpenWholesale,
  onOpenLedger,
  onOpenShop,
  onOpenBoard,
  onOpenService,
  onCleanShelf,
  onServeTea,
  onPutBack,
  onToggleSeat,
  onCycleRadio,
  onEndDay,
  onToggleLookMode,
  onPause,
}) => {
  const isPlaying = hud.started && hud.modal === 'none';
  const showCleanBtn =
    hud.hoveredShelfCat !== null && (hud.hoveredShelfClean ?? 100) < 95;
  const seasonLabel = SEASON_META[hud.season].label;
  const weatherLabel = WEATHER_META[hud.weather].label;
  const radioLabel =
    RADIO_STATIONS.find((station) => station.id === hud.radioStation)?.label ?? 'Kapalı';
  const WeatherIcon =
    hud.weather === 'rainy' ? CloudRain : hud.weather === 'cloudy' ? Cloud : Sun;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 select-none">
      {/* Top-Left Shop Ledger & Day Clock */}
      <div className="pointer-events-auto absolute left-4 top-4 max-w-sm rounded-xl border border-[#d9a952]/30 bg-[#1e150e]/92 px-4 py-3 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[#d9a952]/15 pb-2 text-xs text-[#dfd0b4]/85">
          <span className="flex items-center gap-1.5">
            <strong className="font-semibold text-[#e8b45a]">Gün {hud.day}</strong>
            <span className="opacity-50">·</span>
            <span className="font-mono-num">{hud.timeLabel}</span>
            <span className="opacity-50">·</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#dfd0b4]/80">
              <WeatherIcon
                className={`h-3.5 w-3.5 ${
                  hud.weather === 'rainy'
                    ? 'text-[#7db3e8]'
                    : hud.weather === 'cloudy'
                      ? 'text-[#c4bba8]'
                      : 'text-[#e8b45a]'
                }`}
              />
              <span>
                {seasonLabel} · {weatherLabel}
              </span>
            </span>
            {hud.isClosingTime && (
              <span className="ml-1 text-[#e8907a]">· Kapanış</span>
            )}
          </span>
          <span className="text-[11px] text-[#9fd39a]">
            İtibar <strong className="font-mono-num">{hud.reputation}</strong> ({hud.reputationTitle})
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-4">
          <div>
            <span className="text-[11px] text-[#dfd0b4]/70">Kasa</span>
            <div
              className={`font-mono-num text-xl font-semibold ${
                hud.money >= 0 ? 'text-[#e8b45a]' : 'text-[#e8907a]'
              }`}
            >
              {hud.money} ₺
            </div>
          </div>
          <div className="h-6 w-px bg-[#d9a952]/20" />
          <div>
            <span className="text-[11px] text-[#dfd0b4]/70">
              Puan <span className="font-mono-num opacity-70">({hud.pointProgress}/{hud.pointStepTarget})</span>
            </span>
            <div className="font-mono-num text-xl font-semibold text-[#f4ead5]">
              {hud.points}
            </div>
          </div>
          <div className="h-6 w-px bg-[#d9a952]/20" />
          <div>
            <span className="text-[11px] text-[#dfd0b4]/70">Sıra</span>
            <div className="font-mono-num text-xl font-semibold text-[#9fd39a]">
              {hud.queueCount}
            </div>
          </div>
          <div className="h-6 w-px bg-[#d9a952]/20" />
          <div>
            <span className="text-[11px] text-[#dfd0b4]/70">Temizlik</span>
            <div
              className={`font-mono-num text-xl font-semibold ${
                hud.avgCleanliness >= 85
                  ? 'text-[#9fd39a]'
                  : hud.avgCleanliness >= 55
                    ? 'text-[#e8b45a]'
                    : 'text-[#e8907a]'
              }`}
            >
              %{hud.avgCleanliness}
            </div>
          </div>
        </div>

        {hud.stockSummary.length > 0 && (
          <div className="mt-2 border-t border-[#d9a952]/15 pt-2 text-[11px] leading-relaxed text-[#dfd0b4]/80">
            <span className="font-medium text-[#e8b45a]">Raf: </span>
            <span className="font-mono-num">
              {hud.stockSummary
                .map(
                  (s) =>
                    `${s.name} ${s.availableCount}/${s.totalUnlocked}${
                      s.reserveCount > 0 ? ` (+${s.reserveCount})` : ''
                    }`,
                )
                .join(' · ')}
            </span>
          </div>
        )}

        {hud.apprentice.hired && (
          <div className="mt-1.5 border-t border-[#d9a952]/10 pt-1.5 text-[11px] text-[#9fd39a]">
            Çırak {hud.apprentice.name} (Sv.{hud.apprentice.level}):{' '}
            <span className="text-[#dfd0b4]/85">
              {APPRENTICE_TASK_META[hud.apprentice.task].label}
            </span>
          </div>
        )}

        {hud.dailyEvent.id !== 'calm' && (
          <div className="mt-1.5 border-t border-[#d9a952]/10 pt-1.5 text-[11px] text-[#e8b45a]">
            Bülten: <span className="text-[#dfd0b4]/85">{hud.dailyEvent.title}</span>
          </div>
        )}
      </div>

      {/* Top-Center Customer Speech Bubble */}
      {hud.bubble && (
        <div className="absolute left-1/2 top-5 z-20 w-[min(480px,84vw)] -translate-x-1/2 rounded-xl border border-[#c8ab75] bg-[#f6ecd4] px-5 py-3 text-center text-[#2c1f12] shadow-xl">
          <div className="mb-1 flex items-center justify-center gap-2 text-[11px] font-semibold tracking-wide text-[#7a582b]">
            <span>{hud.bubble.speaker}</span>
            {hud.bubble.personalityLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span>{hud.bubble.personalityLabel}</span>
              </>
            )}
          </div>
          <p className="font-display text-base font-medium leading-snug sm:text-lg">
            {hud.bubble.text}
          </p>
          {hud.bubble.hint && (
            <p className="mt-1 text-xs italic text-[#75562d]">{hud.bubble.hint}</p>
          )}
          {typeof hud.bubble.patienceRatio === 'number' && (
            <div className="mx-auto mt-2.5 h-1.5 w-44 overflow-hidden rounded-full bg-[#d8c7a3]">
              <div
                className={`h-full transition-all duration-200 ${
                  hud.bubble.patienceRatio > 0.45
                    ? 'bg-[#4f8a4b]'
                    : hud.bubble.patienceRatio > 0.22
                      ? 'bg-[#d49530]'
                      : 'bg-[#c04838]'
                }`}
                style={{ width: `${Math.round(hud.bubble.patienceRatio * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Center Crosshair */}
      {isPlaying && (
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-100 ${
            hud.targetKind !== 'none'
              ? 'h-3 w-3 scale-110 border-2 border-[#e8b45a] bg-[#e8b45a]/30 shadow-[0_0_0_2px_rgba(0,0,0,0.4)]'
              : 'h-1.5 w-1.5 bg-[#fff3d8]/85 shadow-[0_0_0_2px_rgba(0,0,0,0.4)]'
          }`}
        />
      )}

      {/* Floating Feedback Messages */}
      {floats.map((f) => {
        const toneColor =
          f.tone === 'ok'
            ? 'text-[#9fd39a]'
            : f.tone === 'bad'
              ? 'text-[#e8907a]'
              : 'text-[#e8b45a]';
        return (
          <div
            key={f.id}
            className={`animate-float-up font-mono-num fixed left-1/2 top-[43%] z-20 text-2xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${toneColor}`}
          >
            {f.text}
          </div>
        );
      })}

      {/* Bottom-Center Interaction Prompt */}
      {isPlaying && hud.promptText && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#d9a952]/35 bg-[#1e150e]/92 px-4 py-2 text-center text-sm font-medium text-[#f4ead5] shadow-lg">
          {hud.promptText}
        </div>
      )}

      {/* Bottom-Left Tip */}
      {isPlaying && hud.tipText && (
        <div className="absolute bottom-4 left-4 max-w-xs rounded-xl border border-[#d9a952]/25 bg-[#1e150e]/90 px-3.5 py-2.5 text-xs leading-relaxed text-[#dfd0b4]/90 shadow-lg">
          {hud.tipText}
        </div>
      )}

      {/* Bottom-Right Action Dock */}
      {isPlaying && (
        <div className="pointer-events-auto absolute bottom-4 right-4 flex max-w-[75vw] flex-wrap items-center justify-end gap-1.5 rounded-xl border border-[#d9a952]/30 bg-[#1e150e]/92 p-1.5 shadow-lg">
          {hud.carryingLabel && (
            <button
              type="button"
              onClick={onPutBack}
              className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-[#f4ead5] transition-colors hover:bg-[#3a2716]"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#e8b45a]" />
              <span>Geri Koy (Q)</span>
            </button>
          )}
          {showCleanBtn && (
            <button
              type="button"
              onClick={onCleanShelf}
              className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#7bc47f]/60 bg-[#253622] px-2.5 text-xs font-medium text-[#e7f3e4] transition-colors hover:bg-[#30472c]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#9fd39a]" />
              <span>Rafı Sil (R)</span>
            </button>
          )}
          {hud.isSeated && (
            <button
              type="button"
              onClick={onToggleSeat}
              className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#3b2917] px-2.5 text-xs font-medium text-[#f4ead5] transition-colors hover:bg-[#4d351e]"
            >
              <Armchair className="h-3.5 w-3.5 text-[#e8b45a]" />
              <span>Kalk (Space)</span>
            </button>
          )}
          <button
            type="button"
            onClick={onCycleRadio}
            title="Dükkân radyosunu değiştir (M)"
            className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium transition-colors ${
              hud.radioStation !== 'off'
                ? 'border border-[#d9a952]/55 bg-[#2e2012] text-[#f4ead5] hover:bg-[#3d2a18]'
                : 'text-[#f4ead5] hover:bg-[#3a2716]'
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-[#e8b45a]" />
            <span>
              {hud.radioStation === 'off' ? 'Radyo (M)' : `${radioLabel} (M)`}
            </span>
          </button>
          <button
            type="button"
            onClick={onServeTea}
            disabled={hud.teaServings > 0 && !hud.canServeTea}
            title={
              hud.teaServings > 0
                ? 'Bekleyen müşteriye çay ikram et (C)'
                : `Yeni çay demle (${BREW_TEA_COST} ₺)`
            }
            className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-[#f4ead5] transition-colors hover:bg-[#3a2716] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Coffee className="h-3.5 w-3.5 text-[#e8b45a]" />
            <span>
              {hud.teaServings > 0
                ? `Çay (${hud.teaServings}/${hud.maxTeaServings}) (C)`
                : `Demle (${BREW_TEA_COST} ₺) (C)`}
            </span>
          </button>
          <button
            type="button"
            onClick={onOpenService}
            className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-[#f4ead5] transition-colors hover:bg-[#3a2716]"
          >
            <Wrench className="h-3.5 w-3.5 text-[#e8b45a]" />
            <span>Tezgâh (H)</span>
          </button>
          <button
            type="button"
            onClick={onOpenShop}
            className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-[#f4ead5] transition-colors hover:bg-[#3a2716]"
          >
            <Store className="h-3.5 w-3.5 text-[#e8b45a]" />
            <span>Dükkân & Çırak (G)</span>
          </button>
          <button
            type="button"
            onClick={onOpenLedger}
            className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium transition-colors ${
              hud.readyToCollectCount > 0
                ? 'border border-[#7bc47f]/60 bg-[#253622] text-[#e7f3e4] hover:bg-[#30472c]'
                : 'text-[#f4ead5] hover:bg-[#3a2716]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-[#e8b45a]" />
            <span>
              Defter (L)
              {hud.readyToCollectCount > 0 ? ` · ${hud.readyToCollectCount} Tahsilat` : ''}
            </span>
          </button>
          <button
            type="button"
            onClick={onOpenWholesale}
            className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-[#f4ead5] transition-colors hover:bg-[#3a2716]"
          >
            <ShoppingCart className="h-3.5 w-3.5 text-[#e8b45a]" />
            <span>Toptancı (B)</span>
          </button>
          <button
            type="button"
            onClick={onOpenBoard}
            className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium transition-colors ${
              hud.claimableMilestoneCount > 0
                ? 'border border-[#7bc47f]/60 bg-[#253622] text-[#e7f3e4] hover:bg-[#30472c]'
                : 'text-[#f4ead5] hover:bg-[#3a2716]'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5 text-[#e8b45a]" />
            <span>
              Pano (N)
              {hud.claimableMilestoneCount > 0
                ? ` · ${hud.claimableMilestoneCount} Ödül`
                : hud.activeContractCount > 0
                  ? ` · ${hud.activeContractCount}`
                  : ''}
            </span>
          </button>
          <button
            type="button"
            onClick={onOpenTree}
            className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-[#f4ead5] transition-colors hover:bg-[#3a2716]"
          >
            <TreePine className="h-3.5 w-3.5 text-[#e8b45a]" />
            <span>Yetenek (F)</span>
          </button>
          {hud.canEndDay && (
            <button
              type="button"
              onClick={onEndDay}
              className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#e8b45a] bg-[#4a3217] px-3 text-xs font-semibold text-[#fff2d4] transition-colors hover:bg-[#5d3f1d]"
            >
              <DoorClosed className="h-3.5 w-3.5 text-[#e8b45a]" />
              <span>Kepenk Kapat (K)</span>
            </button>
          )}
          <button
            type="button"
            onClick={onToggleLookMode}
            title="Bakış modunu değiştir (V)"
            className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-[#dfd0b4]/85 transition-colors hover:bg-[#3a2716]"
          >
            <MousePointerClick className="h-3.5 w-3.5 text-[#e8b45a]" />
            <span>{hud.effectiveMode === 'pointerlock' ? 'FPS Kilidi' : 'Serbest İmleç'} (V)</span>
          </button>
          <button
            type="button"
            onClick={onPause}
            aria-label="Duraklat"
            className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-xs font-medium text-[#dfd0b4]/85 transition-colors hover:bg-[#3a2716]"
          >
            <Pause className="h-3.5 w-3.5 text-[#e8b45a]" />
            <span>Esc</span>
          </button>
        </div>
      )}

      {/* WebGL Context Lost Fallback */}
      {hud.webglLost && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-[#18100a]/95 p-6 text-center">
          <div className="max-w-md rounded-xl border border-[#d9a952]/30 bg-[#22160d] p-6">
            <h3 className="font-display text-xl text-[#e8b45a]">3D Sahne Yeniden Başlatılıyor</h3>
            <p className="mt-2 text-sm text-[#dfd0b4]/80">
              Tarayıcı grafik bağlamı geçici olarak kesildi. Sayfayı yenileyerek kaldığın yerden devam edebilirsin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
