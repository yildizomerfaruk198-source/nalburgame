import { useEffect, useMemo, useRef, useState, type FC } from 'react';
import {
  CheckCircle2,
  Droplets,
  KeyRound,
  Scale,
  Scissors,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';
import { REPAIR_SCENARIOS, SERVICE_META } from '../game/catalog';
import type { ServiceOrder, ServiceType } from '../game/types';

interface ServiceModalProps {
  order: ServiceOrder;
  onComplete: (success: boolean, bonusMul?: number) => void;
  onSwitchPractice: (type: ServiceType) => void;
  onPlaySound?: (kind: 'key' | 'saw' | 'nope') => void;
  onClose: () => void;
}

const SERVICE_ICONS: Record<ServiceType, typeof KeyRound> = {
  key_cut: KeyRound,
  paint_mix: Droplets,
  scale_weigh: Scale,
  cut_measure: Scissors,
  repair_advice: Wrench,
};

export const ServiceModal: FC<ServiceModalProps> = ({
  order,
  onComplete,
  onSwitchPractice,
  onPlaySound,
  onClose,
}) => {
  // 1. Key Cutting state
  const targetPins = useMemo(() => order.keyTargetPins ?? [3, 1, 4, 2, 5], [order]);
  const [pins, setPins] = useState<number[]>([1, 1, 1, 1, 1]);
  const [keyCutting, setKeyCutting] = useState(false);
  const [keyFeedback, setKeyFeedback] = useState<string | null>(null);

  // 2. Paint Mixing state
  const targetRgb = useMemo<[number, number, number]>(
    () => order.paintTargetRgb ?? [132, 168, 126],
    [order],
  );
  const [mixRgb, setMixRgb] = useState<[number, number, number]>([160, 160, 160]);

  // 3. Scale Weighing state
  const targetGrams = order.scaleTargetGrams ?? 250;
  const [grams, setGrams] = useState(0);

  // 4. Cut & Measure state
  const targetCm = order.cutTargetCm ?? 110;
  const [sawCm, setSawCm] = useState(20);
  const [sawLocked, setSawLocked] = useState<number | null>(null);
  const sawDirRef = useRef(1);
  const sawValRef = useRef(20);

  // 5. Repair Advice state
  const scenario = useMemo(
    () =>
      REPAIR_SCENARIOS.find((s) => s.id === order.repairScenarioId) ?? REPAIR_SCENARIOS[0],
    [order.repairScenarioId],
  );
  const [pickedOptionIdx, setPickedOptionIdx] = useState<number | null>(null);

  // Reset local mini-game state only when the actual service order identity/target changes
  const orderResetKey = [
    order.mode,
    order.customerId ?? 'practice',
    order.serviceType,
    order.keyTargetPins?.join(',') ?? '',
    order.paintTargetRgb?.join(',') ?? '',
    order.scaleTargetGrams ?? '',
    order.cutTargetCm ?? '',
    order.repairScenarioId ?? '',
  ].join('|');

  useEffect(() => {
    setPins([1, 1, 1, 1, 1]);
    setKeyCutting(false);
    setKeyFeedback(null);
    setMixRgb([160, 160, 160]);
    setGrams(0);
    setSawCm(20);
    setSawLocked(null);
    sawValRef.current = 20;
    sawDirRef.current = 1;
    setPickedOptionIdx(null);
  }, [orderResetKey]);

  // Animated saw cursor for cut_measure (fair, readable pace)
  useEffect(() => {
    if (order.serviceType !== 'cut_measure' || sawLocked !== null) return;
    let frameId = 0;
    let lastTs = performance.now();
    const speedCmPerSec =
      order.fastCraftLevel >= 2 ? 38 : order.fastCraftLevel >= 1 ? 45 : 54;

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;
      let next = sawValRef.current + sawDirRef.current * speedCmPerSec * dt;
      if (next >= 190) {
        next = 190;
        sawDirRef.current = -1;
      } else if (next <= 10) {
        next = 10;
        sawDirRef.current = 1;
      }
      sawValRef.current = next;
      setSawCm(Math.round(next));
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [order.serviceType, order.fastCraftLevel, sawLocked]);

  // Derived scores
  const keyExactCount = pins.filter((p, idx) => p === targetPins[idx]).length;
  const keyMaxDiff = Math.max(...pins.map((p, idx) => Math.abs(p - targetPins[idx])));
  const keyAllMatched = keyExactCount === 5;
  const keyNearMatched = order.fastCraftLevel >= 1 && keyExactCount >= 4 && keyMaxDiff <= 1;

  const paintDist = Math.hypot(
    mixRgb[0] - targetRgb[0],
    mixRgb[1] - targetRgb[1],
    mixRgb[2] - targetRgb[2],
  );
  const paintMatchPct = Math.max(0, Math.min(100, Math.round(100 - (paintDist / 441.67) * 100)));
  const paintMinPass = order.fastCraftLevel >= 1 ? 84 : 88;

  const scaleDiff = grams - targetGrams;
  const scaleTolerance = order.fastCraftLevel >= 2 ? 20 : 12;
  const scaleInRange = Math.abs(scaleDiff) <= scaleTolerance;
  const scaleTiltDeg = Math.max(-18, Math.min(18, (scaleDiff / 120) * 18));

  const cutTolerance =
    order.fastCraftLevel >= 2 ? 16 : order.fastCraftLevel >= 1 ? 13 : 11;
  const activeCm = sawLocked ?? sawCm;
  const cutDiff = Math.abs(activeCm - targetCm);
  const cutPassed = sawLocked !== null && cutDiff <= cutTolerance;

  const Icon = SERVICE_ICONS[order.serviceType];

  const handleCutSubmit = () => {
    const lockedVal = Math.round(sawValRef.current);
    setSawLocked(lockedVal);
    if (Math.abs(lockedVal - targetCm) <= cutTolerance) {
      onPlaySound?.('saw');
    } else {
      onPlaySound?.('nope');
    }
  };

  // Space / Enter hotkey inside cut_measure mini-game
  useEffect(() => {
    if (order.serviceType !== 'cut_measure') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (sawLocked === null) {
          handleCutSubmit();
        } else if (Math.abs(sawLocked - targetCm) <= cutTolerance) {
          onComplete(true, Math.abs(sawLocked - targetCm) <= 4 ? 1.25 : 1);
        } else {
          setSawLocked(null);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const handleKeyCutAttempt = () => {
    if (keyCutting) return;
    setKeyCutting(true);
    setKeyFeedback(null);
    onPlaySound?.('key');
    window.setTimeout(() => {
      setKeyCutting(false);
      if (keyAllMatched || keyNearMatched) {
        onComplete(true, keyAllMatched ? 1.2 : 1);
      } else {
        onPlaySound?.('nope');
        const badIdx = pins
          .map((p, i) => (p !== targetPins[i] ? i + 1 : null))
          .filter((x): x is number => x !== null);
        setKeyFeedback(
          `${badIdx.join(', ')}. dişler tam oturmadı. Kopya dişleri yukarıdaki orijinal seviyeyle eşleştir.`,
        );
      }
    }, 420);
  };

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && order.mode === 'practice') onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#d9a952]/40 bg-[#22160d] text-[#f4ead5] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#d9a952]/20 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d9a952]/35 bg-[#352212] text-[#e8b45a]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-wide text-[#d9a952]/85">
                {order.customerName} · {order.personalityLabel}
              </div>
              <h2 id="service-modal-title" className="font-display text-2xl font-semibold text-[#e8b45a]">
                {order.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] text-[#dfd0b4]/70">İşçilik</div>
              <div className="font-mono-num text-lg font-semibold text-[#9fd39a]">
                {order.mode === 'practice'
                  ? `+${Math.round(order.rewardMoney * 0.35)} ₺`
                  : `+${Math.round(order.rewardMoney * (1 + order.craftBonusRate))} ₺`}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d9a952]/30 text-[#e8b45a] transition-colors hover:bg-[#3a2716]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Practice Mode Service Selector */}
        {order.mode === 'practice' && (
          <div className="flex flex-wrap gap-1.5 border-b border-[#d9a952]/15 bg-[#181009] px-6 py-2.5">
            {(Object.keys(SERVICE_META) as ServiceType[]).map((sType) => {
              const meta = SERVICE_META[sType];
              const active = order.serviceType === sType;
              return (
                <button
                  key={sType}
                  type="button"
                  onClick={() => onSwitchPractice(sType)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-[#e8b45a] text-[#1f140b]'
                      : 'text-[#dfd0b4]/80 hover:bg-[#2c1d11] hover:text-[#f4ead5]'
                  }`}
                >
                  {meta.shortLabel}
                </button>
              );
            })}
          </div>
        )}

        {/* Customer Request / Prompt */}
        <div className="border-b border-[#d9a952]/15 bg-[#1b120b] px-6 py-3">
          <p className="text-sm leading-relaxed text-[#f1e4c9]">“{order.promptText}”</p>
        </div>

        {/* Mini-Game Body */}
        <div className="px-6 py-5">
          {/* 1. ANAHTAR KOPYALAMA */}
          {order.serviceType === 'key_cut' && (
            <div className="space-y-4">
              {/* Visual Original Brass Key Blade */}
              <div className="rounded-xl border border-[#d9a952]/20 bg-[#170f08] p-4">
                <div className="mb-2.5 flex items-center justify-between text-xs text-[#dfd0b4]/80">
                  <span>Orijinal Pirinç Anahtar Dişleri</span>
                  <span className="font-mono-num text-[#e8b45a]">
                    Eşleşen Diş: {keyExactCount}/5
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex h-16 w-12 shrink-0 items-center justify-center rounded-full border-4 border-[#d9a952] bg-[#2a1c0f]">
                    <div className="h-4 w-4 rounded-full bg-[#170f08]" />
                  </div>
                  <div className="grid flex-1 grid-cols-5 gap-2 rounded-r-lg border-b-4 border-[#d9a952] bg-[#22170d] px-2 pt-2">
                    {targetPins.map((targetVal, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1">
                        <div className="flex h-16 w-full items-end justify-center">
                          <div
                            className="w-full rounded-t bg-[#d9a952] transition-all"
                            style={{ height: `${targetVal * 20}%` }}
                          />
                        </div>
                        <span className="font-mono-num pb-1 text-[11px] font-semibold text-[#f3dfb0]">
                          #{idx + 1}: {targetVal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Copy Key Blade */}
              <div className="rounded-xl border border-[#d9a952]/20 bg-[#170f08] p-4">
                <div className="mb-2.5 flex items-center justify-between text-xs text-[#dfd0b4]/80">
                  <span>Kopya Anahtar (Diş sütunlarına tıkla veya + / − ile ayarla)</span>
                  {keyCutting && (
                    <span className="font-semibold text-[#e8b45a]">Taşlama çarkı dönüyor...</span>
                  )}
                </div>

                <div className="flex items-end gap-2">
                  <div className="flex h-20 w-12 shrink-0 items-center justify-center rounded-full border-4 border-[#b89a5a] bg-[#24190e]">
                    <div className="h-4 w-4 rounded-full bg-[#170f08]" />
                  </div>
                  <div className="grid flex-1 grid-cols-5 gap-2 rounded-r-lg border-b-4 border-[#b89a5a] bg-[#22170d] px-2 pt-2 pb-1.5">
                    {pins.map((val, idx) => {
                      const target = targetPins[idx];
                      const matched = val === target;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5">
                          {/* Clickable tooth height segments 5 down to 1 */}
                          <div className="flex w-full flex-col gap-0.5 rounded bg-[#140d07] p-1">
                            {[5, 4, 3, 2, 1].map((lvl) => {
                              const filled = lvl <= val;
                              const isTargetMarker = lvl === target;
                              return (
                                <button
                                  key={lvl}
                                  type="button"
                                  disabled={keyCutting}
                                  onClick={() => {
                                    const next = [...pins];
                                    next[idx] = lvl;
                                    setPins(next);
                                    setKeyFeedback(null);
                                  }}
                                  className={`h-3.5 w-full rounded-[3px] transition-colors ${
                                    filled
                                      ? matched
                                        ? 'bg-[#7bc47f]'
                                        : 'bg-[#e8b45a]'
                                      : isTargetMarker
                                        ? 'border border-dashed border-[#9fd39a]/50 bg-[#241b12]'
                                        : 'bg-[#2a1d11] hover:bg-[#3d2a18]'
                                  }`}
                                  aria-label={`Diş ${idx + 1} seviye ${lvl}`}
                                />
                              );
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={keyCutting || val <= 1}
                              onClick={() => {
                                const next = [...pins];
                                next[idx] = Math.max(1, val - 1);
                                setPins(next);
                                setKeyFeedback(null);
                              }}
                              className="h-5 w-5 rounded bg-[#2d1e12] text-xs font-bold text-[#dfd0b4] hover:bg-[#412c1a] disabled:opacity-35"
                            >
                              −
                            </button>
                            <span
                              className={`font-mono-num w-5 text-center text-xs font-semibold ${
                                matched ? 'text-[#9fd39a]' : 'text-[#e8b45a]'
                              }`}
                            >
                              {val}
                            </span>
                            <button
                              type="button"
                              disabled={keyCutting || val >= 5}
                              onClick={() => {
                                const next = [...pins];
                                next[idx] = Math.min(5, val + 1);
                                setPins(next);
                                setKeyFeedback(null);
                              }}
                              className="h-5 w-5 rounded bg-[#2d1e12] text-xs font-bold text-[#dfd0b4] hover:bg-[#412c1a] disabled:opacity-35"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {keyFeedback && (
                  <p className="mt-3 text-center text-xs font-medium text-[#e8907a]">
                    {keyFeedback}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2.5">
                {order.mode === 'customer' && (
                  <button
                    type="button"
                    onClick={() => onComplete(false)}
                    className="rounded-lg border border-[#e8907a]/40 px-4 py-2 text-xs font-medium text-[#e8907a] hover:bg-[#381d17]"
                  >
                    Vazgeç
                  </button>
                )}
                <button
                  type="button"
                  disabled={keyCutting}
                  onClick={handleKeyCutAttempt}
                  className={`rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                    keyAllMatched
                      ? 'border-[#7bc47f] bg-[#4f8a4b] text-white hover:bg-[#5da059]'
                      : 'border-[#e8b45a] bg-[#e8b45a] text-[#1f140b] hover:bg-[#f0c575]'
                  }`}
                >
                  {keyCutting
                    ? 'Anahtar Taşlanıyor...'
                    : keyAllMatched
                      ? 'Tam Eşleşme · Anahtarı Kes (+%20)'
                      : 'Anahtarı Kes ve Teslim Et'}
                </button>
              </div>
            </div>
          )}

          {/* 2. BOYA KARIŞTIRMA */}
          {order.serviceType === 'paint_mix' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#d9a952]/20 bg-[#170f08] p-4 text-center">
                  <div className="text-xs text-[#dfd0b4]/75">
                    Hedef Ton: <strong className="text-[#f4ead5]">{order.paintTargetName}</strong>
                  </div>
                  <div
                    className="mx-auto mt-3 h-24 w-full rounded-xl border border-white/15 shadow-inner"
                    style={{
                      backgroundColor: `rgb(${targetRgb[0]}, ${targetRgb[1]}, ${targetRgb[2]})`,
                    }}
                  />
                </div>
                <div className="rounded-xl border border-[#d9a952]/20 bg-[#170f08] p-4 text-center">
                  <div className="text-xs text-[#dfd0b4]/75">
                    Senin Karışımın:{' '}
                    <strong
                      className={`font-mono-num ${
                        paintMatchPct >= paintMinPass ? 'text-[#9fd39a]' : 'text-[#e8b45a]'
                      }`}
                    >
                      %{paintMatchPct} Uyum
                    </strong>
                  </div>
                  <div
                    className="mx-auto mt-3 h-24 w-full rounded-xl border border-white/15 shadow-inner transition-colors"
                    style={{
                      backgroundColor: `rgb(${mixRgb[0]}, ${mixRgb[1]}, ${mixRgb[2]})`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-[#d9a952]/20 bg-[#170f08] p-4 text-xs">
                {[
                  { label: 'Kırmızı Pigment (R)', idx: 0 as const, accent: 'accent-[#e05d4f]' },
                  { label: 'Yeşil Pigment (G)', idx: 1 as const, accent: 'accent-[#6abf69]' },
                  { label: 'Mavi Pigment (B)', idx: 2 as const, accent: 'accent-[#5d9ce0]' },
                ].map((ch) => (
                  <label key={ch.idx} className="block">
                    <div className="mb-1 flex justify-between">
                      <span>{ch.label}</span>
                      <span className="font-mono-num text-[#e8b45a]">{mixRgb[ch.idx]}</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={245}
                      value={mixRgb[ch.idx]}
                      onChange={(e) => {
                        const next: [number, number, number] = [...mixRgb] as [
                          number,
                          number,
                          number,
                        ];
                        next[ch.idx] = Number(e.target.value);
                        setMixRgb(next);
                      }}
                      className={`w-full ${ch.accent}`}
                    />
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[#dfd0b4]/70">
                  Geçer ton uyumu: %{paintMinPass}+ (%{95}+ bonus kazandırır)
                </span>
                <button
                  type="button"
                  disabled={paintMatchPct < paintMinPass}
                  onClick={() => onComplete(true, paintMatchPct >= 95 ? 1.25 : 1)}
                  className="rounded-lg border border-[#e8b45a] bg-[#e8b45a] px-5 py-2.5 text-sm font-semibold text-[#1f140b] transition-colors hover:bg-[#f0c575] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {paintMatchPct >= 95
                    ? 'Mükemmel Ton! Boyayı Hazırla (+%25)'
                    : 'Boyayı Kutula ve Teslim Et'}
                </button>
              </div>
            </div>
          )}

          {/* 3. TARTIYLA ÇİVİ & VİDA */}
          {order.serviceType === 'scale_weigh' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-[#d9a952]/20 bg-[#170f08] p-5 text-center">
                <div className="flex items-center justify-between text-xs text-[#dfd0b4]/80">
                  <span>
                    İstenen: <strong className="font-mono-num text-[#e8b45a]">{targetGrams} g</strong>{' '}
                    ({order.scaleItemName})
                  </span>
                  <span>
                    Kefe:{' '}
                    <strong
                      className={`font-mono-num ${
                        scaleInRange ? 'text-[#9fd39a]' : 'text-[#f4ead5]'
                      }`}
                    >
                      {grams} g
                    </strong>{' '}
                    <span className="text-[#dfd0b4]/60">(±{scaleTolerance}g tolerans)</span>
                  </span>
                </div>

                {/* Balance Beam */}
                <div className="mx-auto mt-6 flex h-24 w-72 flex-col items-center justify-center">
                  <div
                    className="flex w-full items-center justify-between transition-transform duration-200"
                    style={{ transform: `rotate(${scaleTiltDeg}deg)` }}
                  >
                    <div className="rounded-lg border border-[#d9a952]/40 bg-[#3a2614] px-3 py-1.5 text-xs font-semibold text-[#e8b45a]">
                      {targetGrams} g
                    </div>
                    <div className="h-1.5 flex-1 bg-[#c89d54]" />
                    <div className="rounded-lg border border-[#9fd39a]/40 bg-[#23321f] px-3 py-1.5 text-xs font-semibold text-[#9fd39a]">
                      {grams} g
                    </div>
                  </div>
                  <div className="h-6 w-2 bg-[#8c6934]" />
                  <div className="h-2 w-24 rounded-full bg-[#6d4f25]" />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {[100, 50, 15, 5].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setGrams((g) => Math.min(800, g + amt))}
                    className="rounded-lg border border-[#d9a952]/35 bg-[#2d1e12] px-3.5 py-2 text-xs font-semibold text-[#f4ead5] hover:bg-[#3f2a19]"
                  >
                    +{amt} g Kepçe
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setGrams((g) => Math.max(0, g - 15))}
                  className="rounded-lg border border-[#e8907a]/35 bg-[#2c1915] px-3.5 py-2 text-xs font-semibold text-[#e8907a] hover:bg-[#3e221c]"
                >
                  −15 g Çıkar
                </button>
                <button
                  type="button"
                  onClick={() => setGrams((g) => Math.max(0, g - 5))}
                  className="rounded-lg border border-[#e8907a]/35 bg-[#2c1915] px-3.5 py-2 text-xs font-semibold text-[#e8907a] hover:bg-[#3e221c]"
                >
                  −5 g Çıkar
                </button>
                <button
                  type="button"
                  onClick={() => setGrams(0)}
                  className="rounded-lg border border-[#d9a952]/20 px-3 py-2 text-xs text-[#dfd0b4]/75 hover:bg-[#2c1d11]"
                >
                  Sıfırla
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!scaleInRange}
                  onClick={() => onComplete(true, Math.abs(scaleDiff) <= 3 ? 1.2 : 1)}
                  className="rounded-lg border border-[#e8b45a] bg-[#e8b45a] px-5 py-2.5 text-sm font-semibold text-[#1f140b] transition-colors hover:bg-[#f0c575] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {Math.abs(scaleDiff) <= 3
                    ? 'Tam Gramaj! Poşetle ve Ver (+%20)'
                    : 'Poşetle ve Teslim Et'}
                </button>
              </div>
            </div>
          )}

          {/* 4. BORU / TEL / AHŞAP KESİM */}
          {order.serviceType === 'cut_measure' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#d9a952]/20 bg-[#170f08] p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#dfd0b4]/80">
                  <span>
                    Malzeme: <strong className="text-[#f4ead5]">{order.cutMaterialName}</strong>
                  </span>
                  <span>
                    Hedef Ölçü: <strong className="font-mono-num text-[#e8b45a]">{targetCm} cm</strong>{' '}
                    (Geçerli: ±{cutTolerance} cm · Tam: ±4 cm)
                  </span>
                </div>

                {/* Visual Board / Pipe / Wire Workpiece */}
                <div className="relative mt-4 flex h-12 w-full items-center">
                  <div
                    className={`h-7 w-full rounded border transition-all ${
                      order.cutMaterialName?.includes('Bakır')
                        ? 'border-[#e09362]/60 bg-gradient-to-b from-[#d17f4d] to-[#9b5028]'
                        : order.cutMaterialName?.includes('Tel')
                          ? 'h-3 border-[#adb7be]/70 bg-gradient-to-b from-[#98a2aa] to-[#687178]'
                          : 'border-[#d4a56a]/60 bg-gradient-to-b from-[#c79458] to-[#9c6b36]'
                    }`}
                  />
                  {/* Split gap visual when cut */}
                  {sawLocked !== null && (
                    <div
                      className="absolute top-1 bottom-1 w-2 -translate-x-1/2 bg-[#170f08]"
                      style={{ left: `${(sawLocked / 200) * 100}%` }}
                    />
                  )}
                  {/* Saw blade head moving along track */}
                  <div
                    className="pointer-events-none absolute -top-2 bottom-0 flex -translate-x-1/2 flex-col items-center"
                    style={{ left: `${(activeCm / 200) * 100}%` }}
                  >
                    <div className="h-3 w-5 rounded-t bg-[#e8b45a] shadow" />
                    <div className="h-10 w-0.5 bg-[#fff3d8] shadow-[0_0_8px_rgba(232,180,90,0.9)]" />
                  </div>
                </div>

                {/* Ruler Track */}
                <div className="relative mt-3 h-11 w-full overflow-hidden rounded-xl border border-[#d9a952]/30 bg-[#271b11]">
                  {/* Forgiving green zone */}
                  <div
                    className="absolute top-0 bottom-0 border-x border-[#9fd39a]/60 bg-[#4f8a4b]/35"
                    style={{
                      left: `${((targetCm - cutTolerance) / 200) * 100}%`,
                      width: `${((cutTolerance * 2) / 200) * 100}%`,
                    }}
                  />
                  {/* Perfect inner zone (±4 cm) */}
                  <div
                    className="absolute top-0 bottom-0 bg-[#7bc47f]/45"
                    style={{
                      left: `${((targetCm - 4) / 200) * 100}%`,
                      width: `${(8 / 200) * 100}%`,
                    }}
                  />
                  {/* Exact target line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-[#c4f2be]"
                    style={{ left: `${(targetCm / 200) * 100}%` }}
                  />
                  {/* Moving Saw Cursor */}
                  <div
                    className="absolute top-0 bottom-0 w-1.5 -translate-x-1/2 bg-[#e8b45a] shadow-[0_0_8px_rgba(232,180,90,0.9)]"
                    style={{ left: `${(activeCm / 200) * 100}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between font-mono-num text-[11px] text-[#dfd0b4]/65">
                  <span>0 cm</span>
                  <span className="text-[#e8b45a]">
                    Testere: {activeCm} cm · Boşluk (Space) veya Tıkla
                  </span>
                  <span>200 cm</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                {sawLocked === null ? (
                  <button
                    type="button"
                    onClick={handleCutSubmit}
                    className="rounded-lg border border-[#e8b45a] bg-[#e8b45a] px-6 py-2.5 text-sm font-semibold text-[#1f140b] hover:bg-[#f0c575]"
                  >
                    Testereyi İndir ve Kes! (Space)
                  </button>
                ) : cutPassed ? (
                  <button
                    type="button"
                    onClick={() => onComplete(true, cutDiff <= 4 ? 1.25 : 1)}
                    className="rounded-lg border border-[#7bc47f] bg-[#4f8a4b] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#5ca058]"
                  >
                    {cutDiff <= 4
                      ? `Tam Ölçü (${sawLocked} cm)! Teslim Et (+%25)`
                      : `Güzel Kesim (${sawLocked} cm) · Teslim Et`}
                  </button>
                ) : (
                  <>
                    <span className="text-xs font-medium text-[#e8907a]">
                      {sawLocked} cm kesildi (Hedef {targetCm} cm ±{cutTolerance} cm)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSawLocked(null)}
                      className="rounded-lg border border-[#e8b45a]/50 bg-[#352314] px-4 py-2 text-xs font-semibold text-[#e8b45a] hover:bg-[#49301b]"
                    >
                      Yeni Parça Al ve Tekrar Dene (Space)
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 5. KÜÇÜK TAMİR TAVSİYESİ */}
          {order.serviceType === 'repair_advice' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2.5">
                {scenario.options.map((opt, idx) => {
                  const picked = pickedOptionIdx === idx;
                  const showState = pickedOptionIdx !== null;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={showState}
                      onClick={() => setPickedOptionIdx(idx)}
                      className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                        !showState
                          ? 'border-[#d9a952]/25 bg-[#191008] hover:border-[#e8b45a] hover:bg-[#2a1c10]'
                          : opt.correct
                            ? 'border-[#7bc47f] bg-[#21331e] text-[#e7f3e4]'
                            : picked
                              ? 'border-[#e8907a] bg-[#361c17] text-[#fbe4df]'
                              : 'border-[#d9a952]/15 bg-[#170f08] opacity-55'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-semibold">{opt.label}</div>
                        {showState && (picked || opt.correct) && (
                          <div className="mt-1 text-xs opacity-85">{opt.detail}</div>
                        )}
                      </div>
                      {showState && opt.correct && (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9fd39a]" />
                      )}
                      {showState && picked && !opt.correct && (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#e8907a]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {pickedOptionIdx !== null && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      onComplete(scenario.options[pickedOptionIdx]?.correct ?? false, 1.15)
                    }
                    className="rounded-lg border border-[#e8b45a] bg-[#e8b45a] px-5 py-2.5 text-sm font-semibold text-[#1f140b] hover:bg-[#f0c575]"
                  >
                    {scenario.options[pickedOptionIdx]?.correct
                      ? 'Doğru Tavsiye! Ödemeyi Al (+%15)'
                      : 'Tamam (Müşteriyi Uğurla)'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
