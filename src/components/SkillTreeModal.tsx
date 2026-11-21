import type { FC } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import {
  CATEGORIES,
  CHARACTER_SKILLS,
  EXPANSION_MONEY_COST,
  EXPANSION_POINT_COST,
  POINT_STEP_TARGET,
  getSkillCost,
  getSuggestedPrice,
} from '../game/catalog';
import type { CharacterSkillId } from '../game/types';

interface SkillTreeModalProps {
  money: number;
  points: number;
  pointProgress: number;
  expanded: boolean;
  categoryLevels: number[];
  ownedShelves: boolean[];
  characterSkills: Record<CharacterSkillId, number>;
  onUnlockExpansion: () => void;
  onUnlockTier: (catIndex: number, tier: number) => void;
  onUnlockCharacterSkill: (skillId: CharacterSkillId) => void;
  onOpenShop?: () => void;
  onClose: () => void;
}

export const SkillTreeModal: FC<SkillTreeModalProps> = ({
  money,
  points,
  pointProgress,
  expanded,
  categoryLevels,
  ownedShelves,
  characterSkills,
  onUnlockExpansion,
  onUnlockTier,
  onUnlockCharacterSkill,
  onOpenShop,
  onClose,
}) => {
  const canExpand = !expanded && points >= EXPANSION_POINT_COST && money >= EXPANSION_MONEY_COST;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/65 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-tree-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#d9a952]/40 bg-[#22160d] p-6 text-[#f4ead5] shadow-2xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d9a952]/20 pb-4">
          <div>
            <h2 id="skill-tree-title" className="font-display text-2xl font-semibold text-[#e8b45a]">
              Yetenek & Ustalık Ağacı
            </h2>
            <p className="mt-1 text-xs text-[#dfd0b4]/75">
              Her {POINT_STEP_TARGET} satış veya hizmette +1 puan kazanırsın ({pointProgress}/{POINT_STEP_TARGET}). Buradan satış izni ve ustalık açarsın; yeni kategorilerin boş rafını Dükkân (G) menüsünden alıp Toptancıdan (B) doldurursun.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <div className="text-right">
              <div className="text-xs text-[#dfd0b4]/70">Kasa</div>
              <div className="font-mono-num text-lg font-semibold text-[#f4ead5]">{money} ₺</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#dfd0b4]/70">Puan</div>
              <div className="font-mono-num text-xl font-semibold text-[#e8b45a]">{points}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d9a952]/30 text-[#e8b45a] transition-colors hover:bg-[#3a2716]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Character Perks */}
        <div className="mt-5">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#e8b45a]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>KARAKTER YETENEKLERİ</span>
          </div>
          <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {CHARACTER_SKILLS.map((skill) => {
              const curLv = characterSkills[skill.id] ?? 0;
              const isMax = curLv >= skill.maxLevel;
              const nextSpec = skill.levels[curLv];
              const canBuy = !isMax && Boolean(nextSpec) && points >= nextSpec.cost;
              const currentSpec = curLv > 0 ? skill.levels[curLv - 1] : null;

              return (
                <button
                  key={skill.id}
                  type="button"
                  disabled={!canBuy}
                  onClick={() => onUnlockCharacterSkill(skill.id)}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                    isMax
                      ? 'border-[#7bc47f]/55 bg-[#243221] text-[#e7f3e4]'
                      : canBuy
                        ? 'cursor-pointer border-[#e8b45a] bg-[#4e3418] text-[#fff3d6] hover:bg-[#5e3f1d]'
                        : 'cursor-not-allowed border-[#6a5030]/40 bg-[#2c1d11] text-[#b8a586]/65'
                  }`}
                >
                  <span className="font-mono-num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1a1109] text-xs font-semibold text-[#e8b45a]">
                    {isMax ? <Check className="h-4 w-4 text-[#9fd39a]" /> : nextSpec?.cost}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 text-xs font-semibold">
                      <span>{skill.name}</span>
                      <span className="font-mono-num opacity-75">
                        Sv.{curLv}/{skill.maxLevel}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11px] opacity-80">
                      {isMax
                        ? `Tamamlandı · ${currentSpec?.desc ?? ''}`
                        : `${nextSpec?.label}: ${nextSpec?.desc}`}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shop Expansion + 9 Product Categories */}
        <div className="mt-6 space-y-3 border-t border-[#d9a952]/20 pt-5">
          <div className="text-xs font-semibold tracking-wide text-[#e8b45a]">
            DÜKKÂN GENİŞLEME & ÜRÜN GRUPLARI
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <div className="flex w-32 shrink-0 items-center text-sm font-medium text-[#e8d7b8]">
              Dükkân
            </div>
            <button
              type="button"
              disabled={!canExpand}
              onClick={onUnlockExpansion}
              className={`flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                expanded
                  ? 'border-[#7bc47f]/55 bg-[#243221] text-[#e7f3e4]'
                  : canExpand
                    ? 'cursor-pointer border-[#e8b45a] bg-[#4e3418] text-[#fff3d6] hover:bg-[#5e3f1d]'
                    : 'cursor-not-allowed border-[#6a5030]/40 bg-[#2c1d11] text-[#b8a586]/60'
              }`}
            >
              <span className="font-mono-num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1a1109] text-xs font-semibold text-[#e8b45a]">
                {expanded ? '✓' : EXPANSION_POINT_COST}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  Dükkânı Genişlet {!expanded && `(${EXPANSION_POINT_COST} puan + ${EXPANSION_MONEY_COST} ₺)`}
                </span>
                <span className="block text-xs opacity-75">
                  {expanded
                    ? 'Açık · Depo Odası, sağ kanat ve 10 raf yeri kullanıma hazır'
                    : 'Büyük Depo Odası ve sağ kanat açılır; Boya, Tesisat, Kilit, Yapı ve Kimyasal rafları açılır'}
                </span>
              </span>
            </button>
          </div>

          {CATEGORIES.map((cat, catIdx) => {
            const currentLv = categoryLevels[catIdx] ?? 0;
            const hasShelf = ownedShelves[catIdx] ?? false;
            const needsExpansion = cat.requiresExpansion && !expanded;

            return (
              <div key={cat.id} className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                <div className="flex w-40 shrink-0 flex-col justify-center">
                  <span className="text-sm font-medium text-[#e8d7b8]">{cat.name}</span>
                  <span className="mt-0.5 text-[11px] leading-tight">
                    {hasShelf ? (
                      <span className="text-[#9fd39a]">Raf Kurulu</span>
                    ) : currentLv > 0 ? (
                      <span className="flex items-center gap-1.5 text-[#e8b45a]">
                        <span>Raf Kurulmadı ({cat.shelfCost} ₺)</span>
                        {onOpenShop && (
                          <button
                            type="button"
                            onClick={onOpenShop}
                            className="underline hover:text-[#fff3d6]"
                          >
                            G&apos;den Al
                          </button>
                        )}
                      </span>
                    ) : (
                      <span className="text-[#dfd0b4]/55">Raf: {cat.shelfCost} ₺ (G)</span>
                    )}
                  </span>
                </div>
                <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                  {[1, 2, 3].map((tier) => {
                    const cost = getSkillCost(catIdx, tier);
                    const isUnlocked = currentLv >= tier;
                    const canBuy = currentLv === tier - 1 && !needsExpansion && points >= cost;
                    const sellPrice = getSuggestedPrice(catIdx, tier);

                    let subtext = `${cost} puan · ${sellPrice} ₺`;
                    if (isUnlocked) {
                      subtext = `Açık · ${sellPrice} ₺`;
                    } else if (currentLv === tier - 1 && needsExpansion) {
                      subtext = 'Önce dükkânı genişlet';
                    }

                    return (
                      <button
                        key={tier}
                        type="button"
                        disabled={!canBuy}
                        onClick={() => onUnlockTier(catIdx, tier)}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          isUnlocked
                            ? 'border-[#7bc47f]/55 bg-[#243221] text-[#e7f3e4]'
                            : canBuy
                              ? 'cursor-pointer border-[#e8b45a] bg-[#4e3418] text-[#fff3d6] hover:bg-[#5e3f1d]'
                              : 'cursor-not-allowed border-[#6a5030]/40 bg-[#2c1d11] text-[#b8a586]/60'
                        }`}
                      >
                        <span className="font-mono-num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1a1109] text-xs font-semibold text-[#e8b45a]">
                          {isUnlocked ? '✓' : cost}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold capitalize">
                            {cat.names[tier - 1]}
                          </span>
                          <span className="font-mono-num block truncate text-[11px] opacity-75">
                            {subtext}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end border-t border-[#d9a952]/20 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="whitespace-nowrap rounded-lg border border-[#e8b45a] px-5 py-2 text-sm font-medium text-[#e8b45a] transition-colors hover:bg-[#3a2716]"
          >
            Kapat (F)
          </button>
        </div>
      </div>
    </div>
  );
};
